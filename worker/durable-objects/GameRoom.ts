import { DurableObject } from "cloudflare:workers";
import { Env } from "hono/types";
import { GameStateManager } from "../game/GameStateManager";
import { RoleManager } from "../game/RoleManager";
import { SessionManager } from "../session/SessionManager";
import { BroadcastService } from "../session/BroadcastService";
import { MessageHandler } from "../handlers/MessageHandler";

export class GameRoom extends DurableObject {
  private gameState: GameStateManager;
  private roleManager: RoleManager;
  private sessionManager: SessionManager;
  private broadcast: BroadcastService;
  private messageHandler: MessageHandler;

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    this.gameState = new GameStateManager();
    this.roleManager = new RoleManager();
    this.sessionManager = new SessionManager();
    this.broadcast = new BroadcastService(this.sessionManager);
    this.messageHandler = new MessageHandler(
      this.gameState,
      this.roleManager,
      this.sessionManager,
      this.broadcast
    );
  }

  async fetch(request: Request): Promise<Response> {
    const upgradeHeader = request.headers.get("Upgrade");
    if (upgradeHeader !== "websocket") {
      return new Response("Expected WebSocket", { status: 426 });
    }

    const url = new URL(request.url);
    const userId = url.searchParams.get("userId") || crypto.randomUUID();
    const userName = url.searchParams.get("userName") || `User-${userId.slice(0, 8)}`;

    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);

    this.ctx.acceptWebSocket(server);

    const sessionId = crypto.randomUUID();
    const isHost = this.sessionManager.getSessionCount() === 0;

    this.sessionManager.addSession(sessionId, {
      webSocket: server,
      userId,
      userName,
      isHost,
    });

    if (this.gameState.getPhase() === "night") {
      this.gameState.addNightParticipant(userId);
    }

    const participants = this.sessionManager.getParticipants();
    const canStartGame = this.gameState.canStartGame(this.sessionManager.getSessionCount());
    const voteState = this.gameState.getVoteState();
    const gameResult = this.gameState.getResult();
    const nightActionCompleted = this.gameState.isNightActionCompleted(userId);

    this.broadcast.broadcast(
      {
        type: "join",
        userId,
        userName,
        participants,
        timestamp: Date.now(),
      },
      sessionId
    );

    this.broadcast.sendToSession(sessionId, {
      type: "system",
      message: "Connected to room",
      participants,
      phase: this.gameState.getPhase(),
      isHost,
      roleConfig: this.gameState.getRoleConfig(),
      canStartGame,
      selfUserId: userId,
      voteState: voteState ?? undefined,
      result: gameResult ?? undefined,
      nightActionCompleted: nightActionCompleted || undefined,
      timestamp: Date.now(),
    });

    // 既存ユーザーにもcanStartGameの更新を送信（参加者数が変わったため）
    if (this.sessionManager.getSessionCount() > 1) {
      this.broadcast.broadcast(
        {
          type: "system",
          message: "Participant count updated",
          canStartGame,
          timestamp: Date.now(),
        },
        sessionId
      );
    }

    return new Response(null, {
      status: 101,
      webSocket: client,
    });
  }

  async webSocketMessage(ws: WebSocket, message: string | ArrayBuffer) {
    const found = this.sessionManager.findSessionByWebSocket(ws);
    if (!found) return;

    const { sessionId, session } = found;

    try {
      const data = typeof message === "string" ? message : new TextDecoder().decode(message);
      const parsedMessage = JSON.parse(data);

      if (parsedMessage.type === "ping") {
        // Pingメッセージは接続維持のためだけに使用、処理不要
        this.messageHandler.handlePing();
      } else if (parsedMessage.type === "update_role_config") {
        this.messageHandler.handleRoleConfigUpdate(session.userId, parsedMessage.roleConfig);
      } else if (parsedMessage.type === "change_phase") {
        const result = this.messageHandler.handlePhaseChange(session.userId, parsedMessage.phase);
        if (!result.success && result.error) {
          this.broadcast.sendToSession(sessionId, {
            type: "system",
            message: result.error,
            timestamp: Date.now(),
          });
        }
      } else if (parsedMessage.type === "cast_vote") {
        const result = this.messageHandler.handleVote(session.userId, {
          targetUserId: parsedMessage.targetUserId,
          abstain: parsedMessage.abstain,
        });

        if (!result.success && result.error) {
          this.broadcast.sendToSession(sessionId, {
            type: "system",
            message: result.error,
            timestamp: Date.now(),
          });
        }
      } else if (parsedMessage.type === "night_action") {
        const result = this.messageHandler.handleNightAction(sessionId, session, {
          targetUserId: parsedMessage.targetUserId,
        });

        if (!result.success && result.error) {
          this.broadcast.sendToSession(sessionId, {
            type: "system",
            message: result.error,
            timestamp: Date.now(),
          });
        }
      } else if (parsedMessage.message) {
        this.messageHandler.handleChatMessage(session.userId, session.userName, parsedMessage.message);
      }
    } catch (error) {
      console.error("Failed to parse message:", error);
    }
  }

  async webSocketClose(ws: WebSocket, code: number, reason: string, wasClean: boolean) {
    const found = this.sessionManager.findSessionByWebSocket(ws);
    if (!found) return;

    const { sessionId, session } = found;
    this.sessionManager.removeSession(sessionId);

    const participants = this.sessionManager.getParticipants();
    const canStartGame = this.gameState.canStartGame(this.sessionManager.getSessionCount());

    this.broadcast.broadcast({
      type: "leave",
      userId: session.userId,
      userName: session.userName,
      participants,
      timestamp: Date.now(),
    });

    // 残ったユーザーにcanStartGameの更新を送信（参加者数が変わったため）
    if (this.sessionManager.getSessionCount() > 0) {
      this.broadcast.broadcast({
        type: "system",
        message: "Participant count updated",
        canStartGame,
        timestamp: Date.now(),
      });
    }

    ws.close(code, reason);
  }

  async webSocketError(ws: WebSocket, error: unknown) {
    console.error("WebSocket error:", error);
  }
}
