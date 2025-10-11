import { DurableObject } from "cloudflare:workers";
import { Env } from "hono/types";

type GamePhase = "waiting" | "playing" | "finished";

type Role = "villager" | "werewolf";

interface RoleConfig {
  villager: number;
  werewolf: number;
}

interface Session {
  webSocket: WebSocket;
  userId: string;
  userName: string;
  isHost: boolean;
  role?: Role;
}

interface ChatMessage {
  type: "join" | "leave" | "message" | "system" | "phase_change" | "role_config_update" | "role_assigned";
  userId?: string;
  userName?: string;
  message?: string;
  timestamp: number;
  phase?: GamePhase;
  isHost?: boolean;
  roleConfig?: RoleConfig;
  role?: Role;
  canStartGame?: boolean;
  participants?: Array<{ userId: string; userName: string; isHost: boolean }>;
}

export class GameRoom extends DurableObject {
  private sessions: Map<string, Session>;
  private phase: GamePhase;
  private hostUserId: string | null;
  private roleConfig: RoleConfig;

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    this.sessions = new Map();
    this.phase = "waiting";
    this.hostUserId = null;
    this.roleConfig = { villager: 0, werewolf: 0 };
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

    // 最初のユーザーをホストに設定
    const isHost = this.sessions.size === 0;
    if (isHost) {
      this.hostUserId = userId;
    }

    // セッション情報を保存
    const sessionId = crypto.randomUUID();
    this.sessions.set(sessionId, {
      webSocket: server,
      userId,
      userName,
      isHost,
    });

    // 参加者リストを生成
    const participantList = Array.from(this.sessions.values()).map((s) => ({
      userId: s.userId,
      userName: s.userName,
      isHost: s.isHost,
    }));
    const canStartGame = this.validateRoleConfig();

    // 既存のユーザーに新規参加を通知（参加者リスト付き）
    this.broadcast(
      {
        type: "join",
        userId,
        userName,
        participants: participantList,
        timestamp: Date.now(),
      },
      sessionId
    );

    // 新規ユーザーに現在の参加者リストと状態を送信
    server.send(
      JSON.stringify({
        type: "system",
        message: "Connected to room",
        participants: participantList,
        phase: this.phase,
        isHost,
        roleConfig: this.roleConfig,
        canStartGame,
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

      // 役職配分の更新(ホストのみ)
      if (parsedMessage.type === "update_role_config" && session.isHost) {
        const newConfig = parsedMessage.roleConfig as RoleConfig;
        if (newConfig && typeof newConfig.villager === "number" && typeof newConfig.werewolf === "number") {
          this.roleConfig = newConfig;
          const canStartGame = this.validateRoleConfig();
          this.broadcast({
            type: "role_config_update",
            roleConfig: this.roleConfig,
            canStartGame,
            timestamp: Date.now(),
          });
        }
        return;
      }

      // フェーズ変更リクエストの処理（ホストのみ）
      if (parsedMessage.type === "change_phase" && session.isHost) {
        const newPhase = parsedMessage.phase as GamePhase;
        if (["waiting", "playing", "finished"].includes(newPhase)) {
          // playingに移行する場合、役職を割り当てる
          if (newPhase === "playing" && this.phase === "waiting") {
            if (!this.validateRoleConfig()) {
              // 役職配分が不正な場合はエラーを返す
              session.webSocket.send(
                JSON.stringify({
                  type: "system",
                  message: "役職配分が参加人数と一致していません",
                  timestamp: Date.now(),
                })
              );
              return;
            }
            this.assignRoles();
          }
          this.phase = newPhase;
          this.broadcast({
            type: "phase_change",
            phase: newPhase,
            timestamp: Date.now(),
          });
        }
        return;
      }

      // 通常のメッセージをブロードキャスト
      if (parsedMessage.message) {
        this.broadcast({
          type: "message",
          userId: session.userId,
          userName: session.userName,
          message: parsedMessage.message,
          timestamp: Date.now(),
        });
      }
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

        // 退室後の参加者リストを生成
        const participantList = Array.from(this.sessions.values()).map((s) => ({
          userId: s.userId,
          userName: s.userName,
          isHost: s.isHost,
        }));

        // 他のユーザーに退室を通知（参加者リスト付き）
        this.broadcast({
          type: "leave",
          userId: session.userId,
          userName: session.userName,
          participants: participantList,
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

  // 役職配分の妥当性を検証
  private validateRoleConfig(): boolean {
    const totalRoles = this.roleConfig.villager + this.roleConfig.werewolf;
    const totalParticipants = this.sessions.size;
    return totalRoles === totalParticipants && totalParticipants > 0;
  }

  // 役職をランダムに割り当てる
  private assignRoles() {
    // 役職の配列を作成
    const roles: Role[] = [];
    for (let i = 0; i < this.roleConfig.villager; i++) {
      roles.push("villager");
    }
    for (let i = 0; i < this.roleConfig.werewolf; i++) {
      roles.push("werewolf");
    }

    // Fisher-Yatesアルゴリズムでシャッフル
    for (let i = roles.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [roles[i], roles[j]] = [roles[j], roles[i]];
    }

    // セッションに役職を割り当て
    const sessionList = Array.from(this.sessions.values());
    sessionList.forEach((session, index) => {
      session.role = roles[index];

      // 各ユーザーに自分の役職を通知
      try {
        session.webSocket.send(
          JSON.stringify({
            type: "role_assigned",
            role: session.role,
            timestamp: Date.now(),
          })
        );
      } catch (error) {
        console.error("Failed to send role to session:", error);
      }
    });
  }
}
