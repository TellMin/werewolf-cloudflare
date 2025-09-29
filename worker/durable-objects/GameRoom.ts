import { DurableObject } from "cloudflare:workers";
import { Env } from "hono/types";

interface Session {
  webSocket: WebSocket;
  userId: string;
  userName: string;
}

interface ChatMessage {
  type: "join" | "leave" | "message" | "system";
  userId?: string;
  userName?: string;
  message?: string;
  timestamp: number;
}

export class GameRoom extends DurableObject {
  private sessions: Map<string, Session>;

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    this.sessions = new Map();
  }

  async fetch(request: Request): Promise<Response> {
    // WebSocketアップグレードリクエストかチェック
    const upgradeHeader = request.headers.get("Upgrade");
    if (upgradeHeader !== "websocket") {
      return new Response("Expected WebSocket", { status: 426 });
    }

    // URLからユーザー情報を取得
    const url = new URL(request.url);
    const userId = url.searchParams.get("userId") || crypto.randomUUID();
    const userName =
      url.searchParams.get("userName") || `User-${userId.slice(0, 8)}`;

    // WebSocketペアを作成
    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);

    // サーバー側のWebSocketを受け入れ
    this.ctx.acceptWebSocket(server);

    // セッション情報を保存
    const sessionId = crypto.randomUUID();
    this.sessions.set(sessionId, {
      webSocket: server,
      userId,
      userName,
    });

    // 既存のユーザーに新規参加を通知
    this.broadcast(
      {
        type: "join",
        userId,
        userName,
        timestamp: Date.now(),
      },
      sessionId
    );

    // 新規ユーザーに現在の参加者リストを送信
    const participantList = Array.from(this.sessions.values()).map((s) => ({
      userId: s.userId,
      userName: s.userName,
    }));
    server.send(
      JSON.stringify({
        type: "system",
        message: "Connected to room",
        participants: participantList,
        timestamp: Date.now(),
      })
    );

    return new Response(null, {
      status: 101,
      webSocket: client,
    });
  }

  async webSocketMessage(ws: WebSocket, message: string | ArrayBuffer) {
    // このWebSocketのセッション情報を取得
    let session: Session | undefined;
    let sessionId: string | undefined;

    for (const [id, s] of this.sessions.entries()) {
      if (s.webSocket === ws) {
        session = s;
        sessionId = id;
        break;
      }
    }

    if (!session || !sessionId) {
      return;
    }

    // メッセージをパース
    try {
      const data =
        typeof message === "string"
          ? message
          : new TextDecoder().decode(message);
      const parsedMessage = JSON.parse(data);

      // メッセージをブロードキャスト
      this.broadcast({
        type: "message",
        userId: session.userId,
        userName: session.userName,
        message: parsedMessage.message,
        timestamp: Date.now(),
      });
    } catch (error) {
      console.error("Failed to parse message:", error);
    }
  }

  async webSocketClose(
    ws: WebSocket,
    code: number,
    reason: string,
    wasClean: boolean
  ) {
    // セッションを削除
    for (const [sessionId, session] of this.sessions.entries()) {
      if (session.webSocket === ws) {
        this.sessions.delete(sessionId);

        // 他のユーザーに退室を通知
        this.broadcast({
          type: "leave",
          userId: session.userId,
          userName: session.userName,
          timestamp: Date.now(),
        });
        break;
      }
    }

    // WebSocketをクローズ
    ws.close(code, reason);
  }

  async webSocketError(ws: WebSocket, error: unknown) {
    console.error("WebSocket error:", error);
  }

  // 全セッションにメッセージをブロードキャスト
  private broadcast(message: ChatMessage, excludeSessionId?: string) {
    const messageStr = JSON.stringify(message);

    for (const [sessionId, session] of this.sessions.entries()) {
      if (sessionId !== excludeSessionId) {
        try {
          session.webSocket.send(messageStr);
        } catch (error) {
          console.error("Failed to send message to session:", sessionId, error);
        }
      }
    }
  }
}
