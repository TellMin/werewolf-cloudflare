import { GameStateManager } from "../game/GameStateManager";
import { RoleManager } from "../game/RoleManager";
import { SessionManager } from "../session/SessionManager";
import { BroadcastService } from "../session/BroadcastService";
import { GamePhase, RoleConfig } from "@shared/types/game";
import { normalizeRoleConfig, getRoleDefinition } from "@shared/roles";
import type { Session } from "@shared/types/user";

export class MessageHandler {
  constructor(
    private gameState: GameStateManager,
    private roleManager: RoleManager,
    private sessionManager: SessionManager,
    private broadcast: BroadcastService
  ) {}

  handlePhaseChange(userId: string, newPhase: GamePhase): { success: boolean; error?: string } {
    if (!this.sessionManager.isHost(userId)) {
      return { success: false, error: "Only host can change phase" };
    }

    if (this.gameState.getPhase() === newPhase) {
      return { success: true };
    }

    // nightに移行する場合、役職を割り当て
    if (newPhase === "night" && this.gameState.getPhase() === "waiting") {
      if (!this.gameState.canStartGame(this.sessionManager.getSessionCount())) {
        return { success: false, error: "役職配分が参加人数と一致していません" };
      }

      const roleMap = this.roleManager.assignRolesToSessions(
        this.sessionManager.getAllSessions(),
        this.gameState.getRoleConfig()
      );

      // 各ユーザーに役職を通知
      for (const [sessionId, session] of this.sessionManager.getAllSessions().entries()) {
        const role = roleMap.get(session.userId);
        if (role) {
          session.role = role;
          this.broadcast.sendToSession(sessionId, {
            type: "role_assigned",
            role,
            timestamp: Date.now(),
          });
        }
      }
    }

    this.gameState.setPhase(newPhase);

    if (newPhase === "night") {
      this.gameState.initializeNight(this.sessionManager.getParticipants());
    }

    if (newPhase === "vote") {
      const voteState = this.gameState.startVote(this.sessionManager.getParticipants());
      this.broadcast.broadcast({
        type: "vote",
        voteState,
        timestamp: Date.now(),
      });
    }

    this.broadcast.broadcast({
      type: "phase_change",
      phase: newPhase,
      timestamp: Date.now(),
    });

    return { success: true };
  }

  handleNightAction(
    sessionId: string,
    session: Session,
    payload: { targetUserId?: string }
  ): { success: boolean; error?: string } {
    if (this.gameState.getPhase() !== "night") {
      return { success: false, error: "現在は夜のフェーズではありません" };
    }

    if (!session.role) {
      return { success: false, error: "役職が未設定です" };
    }

    if (this.gameState.isNightActionCompleted(session.userId)) {
      return { success: false, error: "夜の行動はすでに完了しています" };
    }

    switch (session.role) {
      case "seer": {
        const targetUserId = payload.targetUserId;
        if (!targetUserId) {
          return { success: false, error: "占う対象を選択してください" };
        }

        if (targetUserId === session.userId) {
          return { success: false, error: "自分自身を占うことはできません" };
        }

        const target = this.sessionManager.findSessionByUserId(targetUserId);
        if (!target || !target.session.role) {
          return { success: false, error: "対象のプレイヤーが見つかりません" };
        }

        const targetRoleDef = getRoleDefinition(target.session.role);
        const targetTeamLabel =
          targetRoleDef.team === "villagers"
            ? "村人陣営"
            : targetRoleDef.team === "werewolves"
            ? "人狼陣営"
            : "第三陣営";

        this.broadcast.sendToSession(sessionId, {
          type: "message",
          userId: "gm",
          userName: "ゲームマスター",
          message: `🔮 占い結果: ${target.session.userName} は ${targetRoleDef.name}（${targetTeamLabel}）です。`,
          visibility: "private",
          recipientUserId: session.userId,
          timestamp: Date.now(),
        });
        break;
      }
      default: {
        // 他役職は夜の行動がないため確認のみ
        this.broadcast.sendToSession(sessionId, {
          type: "message",
          userId: "gm",
          userName: "ゲームマスター",
          message: "夜の行動はありません。確認しました。",
          visibility: "private",
          recipientUserId: session.userId,
          timestamp: Date.now(),
        });
        break;
      }
    }

    const markResult = this.gameState.markNightActionCompleted(session.userId);

    if (!markResult.success) {
      return { success: false, error: "夜の行動はすでに完了しています" };
    }

    this.broadcast.sendToSession(sessionId, {
      type: "action",
      action: "ack",
      userId: session.userId,
      completed: true,
      timestamp: Date.now(),
    });

    if (markResult.allCompleted) {
      this.gameState.setPhase("day");
      this.broadcast.broadcast({
        type: "phase_change",
        phase: "day",
        timestamp: Date.now(),
      });
    }

    return { success: true };
  }

  handleRoleConfigUpdate(userId: string, newConfig: RoleConfig): { success: boolean } {
    if (!this.sessionManager.isHost(userId)) {
      return { success: false };
    }

    const normalized = normalizeRoleConfig(newConfig);
    this.gameState.updateRoleConfig(normalized);
    const canStartGame = this.gameState.canStartGame(this.sessionManager.getSessionCount());

    this.broadcast.broadcast({
      type: "role_config_update",
      roleConfig: normalized,
      canStartGame,
      timestamp: Date.now(),
    });

    return { success: true };
  }

  handleChatMessage(userId: string, userName: string, message: string): void {
    this.broadcast.broadcast({
      type: "message",
      userId,
      userName,
      message,
      timestamp: Date.now(),
    });
  }

  handleVote(
    userId: string,
    payload: { targetUserId?: string; abstain?: boolean }
  ): { success: boolean; error?: string } {
    if (this.gameState.getPhase() !== "vote") {
      return { success: false, error: "現在は投票フェーズではありません" };
    }

    const choice = payload.abstain
      ? { type: "abstain" }
      : payload.targetUserId
      ? { type: "player" as const, userId: payload.targetUserId }
      : null;

    if (!choice) {
      return { success: false, error: "投票先を選択してください" };
    }

    const result = this.gameState.recordVote(
      userId,
      choice,
      this.sessionManager.getParticipants()
    );

    if (!result.success) {
      return { success: false, error: result.error };
    }

    if (result.state) {
      this.broadcast.broadcast({
        type: "vote",
        voteState: result.state,
        timestamp: Date.now(),
      });
    }

    if (result.resolution) {
      this.gameState.setPhase("finished");
      this.broadcast.broadcast({
        type: "phase_change",
        phase: "finished",
        result: result.resolution,
        timestamp: Date.now(),
      });
    }

    return { success: true };
  }

  handlePing(): void {
    // Pingメッセージは何もせず、接続を維持するだけ
    // ログも出力しない（頻繁なため）
  }
}
