import {
  GamePhase,
  RoleConfig,
  GameState,
  VoteChoice,
  VoteState,
  GameResult,
  VoteRoundSummary,
} from "@shared/types/game";
import { validateRoleConfig } from "@shared/utils/validation";
import { createEmptyRoleConfig, normalizeRoleConfig, getRoleDefinition } from "@shared/roles";
import type { User } from "@shared/types/user";

interface VoteSessionInternal {
  round: number;
  eligibleVoters: Set<string>;
  candidates: Set<string>;
  votes: Map<string, VoteChoice>;
  status: "open" | "revote" | "resolved";
  history: VoteRoundSummary[];
  allParticipants: Set<string>;
}

const ABSTAIN_KEY = "abstain";

export class GameStateManager {
  private state: GameState;
  private voteSession: VoteSessionInternal | null;
  private gameResult: GameResult | null;

  constructor() {
    this.state = {
      phase: "waiting",
      roleConfig: createEmptyRoleConfig(),
      mode: "standard",
    };
    this.voteSession = null;
    this.gameResult = null;
  }

  getPhase(): GamePhase {
    return this.state.phase;
  }

  setPhase(phase: GamePhase): void {
    this.state.phase = phase;

    if (phase === "waiting") {
      this.voteSession = null;
      this.state.voteState = null;
      this.gameResult = null;
      this.state.result = null;
      return;
    }

    if (phase !== "vote" && phase !== "finished") {
      this.voteSession = null;
      this.state.voteState = null;
    }

    if (phase !== "finished") {
      this.gameResult = null;
      this.state.result = null;
    }
  }

  getRoleConfig(): RoleConfig {
    return { ...this.state.roleConfig };
  }

  updateRoleConfig(config: RoleConfig): void {
    this.state.roleConfig = normalizeRoleConfig(config);
  }

  canStartGame(participantCount: number): boolean {
    return validateRoleConfig(this.state.roleConfig, participantCount);
  }

  getState(): GameState {
    return {
      ...this.state,
      roleConfig: { ...this.state.roleConfig },
      voteState: this.state.voteState ? { ...this.state.voteState } : null,
      result: this.state.result ? { ...this.state.result } : null,
    };
  }

  startVote(participants: User[]): VoteState {
    const eligibleVoters = new Set(participants.map((p) => p.userId));
    const candidates = new Set(eligibleVoters);

    this.voteSession = {
      round: 1,
      eligibleVoters,
      candidates,
      votes: new Map(),
      status: "open",
      history: [],
      allParticipants: new Set(eligibleVoters),
    };

    const voteState = this.toPublicVoteState(this.voteSession);
    this.state.voteState = voteState;
    return voteState;
  }

  recordVote(
    voterId: string,
    choice: VoteChoice,
    participants: User[]
  ): { success: boolean; error?: string; state?: VoteState; resolution?: GameResult } {
    if (!this.voteSession) {
      return { success: false, error: "投票は進行していません" };
    }

    if (!this.voteSession.eligibleVoters.has(voterId)) {
      return { success: false, error: "あなたはこの投票には参加できません" };
    }

    if (choice.type === "player") {
      if (choice.userId === voterId) {
        return { success: false, error: "自分自身には投票できません" };
      }

      if (!this.voteSession.candidates.has(choice.userId)) {
        return { success: false, error: "このプレイヤーには投票できません" };
      }
    }

    this.voteSession.votes.set(voterId, choice);

    const voteState = this.toPublicVoteState(this.voteSession);
    this.state.voteState = voteState;

    if (!this.isVoteComplete(this.voteSession)) {
      return { success: true, state: voteState };
    }

    const counts = this.countVotes(this.voteSession);
    const countValues = Array.from(counts.values());
    const maxCount = countValues.length > 0 ? Math.max(...countValues) : 0;
    const topChoices = Array.from(counts.entries())
      .filter(([, count]) => count === maxCount)
      .map(([key]) => key);

    const summary: VoteRoundSummary = {
      round: this.voteSession.round,
      counts: Object.fromEntries(counts.entries()),
      topChoices,
      resolved: topChoices.length === 1,
    };
    this.voteSession.history.push(summary);

    if (topChoices.length === 0) {
      const resolution = this.resolveVote(ABSTAIN_KEY, participants, {
        forceNoExecution: true,
      });
      this.voteSession.status = "resolved";
      const resolvedState = this.toPublicVoteState(this.voteSession);
      this.state.voteState = resolvedState;
      this.gameResult = resolution;
      this.state.result = resolution;
      return { success: true, state: resolvedState, resolution };
    }

    if (topChoices.length === 1) {
      const topChoice = topChoices[0];
      const resolution = this.resolveVote(topChoice, participants);
      this.voteSession.status = "resolved";
      const resolvedState = this.toPublicVoteState(this.voteSession);
      this.state.voteState = resolvedState;
      this.gameResult = resolution;
      this.state.result = resolution;
      return { success: true, state: resolvedState, resolution };
    }

    const nextEligible = new Set(
      Array.from(this.voteSession.allParticipants.values()).filter(
        (id) => !topChoices.includes(id)
      )
    );

    if (nextEligible.size === 0) {
      const resolution = this.resolveVote(ABSTAIN_KEY, participants, {
        forceNoExecution: true,
      });
      this.voteSession.status = "resolved";
      const resolvedState = this.toPublicVoteState(this.voteSession);
      this.state.voteState = resolvedState;
      this.gameResult = resolution;
      this.state.result = resolution;
      return { success: true, state: resolvedState, resolution };
    }

    this.voteSession.round += 1;
    this.voteSession.status = "revote";
    this.voteSession.eligibleVoters = nextEligible;
    this.voteSession.candidates = new Set(
      topChoices.filter((choice) => choice !== ABSTAIN_KEY)
    );
    this.voteSession.votes = new Map();

    const nextState = this.toPublicVoteState(this.voteSession);
    this.state.voteState = nextState;
    return { success: true, state: nextState };
  }

  getVoteState(): VoteState | null {
    if (!this.voteSession) return this.state.voteState ?? null;
    return this.toPublicVoteState(this.voteSession);
  }

  getResult(): GameResult | null {
    return this.gameResult;
  }

  private isVoteComplete(session: VoteSessionInternal): boolean {
    return session.votes.size === session.eligibleVoters.size;
  }

  private countVotes(session: VoteSessionInternal): Map<string, number> {
    const counts = new Map<string, number>();
    for (const voterId of session.eligibleVoters.values()) {
      const choice = session.votes.get(voterId);
      const key = !choice
        ? ABSTAIN_KEY
        : choice.type === "player"
        ? choice.userId
        : ABSTAIN_KEY;
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    return counts;
  }

  private resolveVote(
    winningKey: string,
    participants: User[],
    options?: { forceNoExecution?: boolean }
  ): GameResult {
    if (options?.forceNoExecution) {
      return {
        winnerTeam: "werewolves",
        reason: "no_resolution",
      };
    }

    if (winningKey === ABSTAIN_KEY) {
      return {
        winnerTeam: "werewolves",
        reason: "abstain",
      };
    }

    const executed = participants.find((p) => p.userId === winningKey);
    if (!executed || !executed.role) {
      return {
        winnerTeam: "none",
        reason: "no_resolution",
      };
    }

    const { team: executedTeam } = getRoleDefinition(executed.role);

    let winnerTeam: GameResult["winnerTeam"];
    switch (executedTeam) {
      case "werewolves":
        winnerTeam = "villagers";
        break;
      case "villagers":
        winnerTeam = "werewolves";
        break;
      default:
        winnerTeam = "none";
        break;
    }

    return {
      winnerTeam,
      reason: "execution",
      executedUserId: executed.userId,
      executedUserName: executed.userName,
      executedRole: executed.role,
      executedTeam,
    };
  }

  private toPublicVoteState(session: VoteSessionInternal): VoteState {
    const votesRecord: Record<string, VoteChoice | null> = {};
    for (const voterId of session.eligibleVoters.values()) {
      votesRecord[voterId] = session.votes.get(voterId) ?? null;
    }

    return {
      round: session.round,
      eligibleVoters: Array.from(session.eligibleVoters.values()),
      candidates: Array.from(session.candidates.values()),
      votes: votesRecord,
      status: session.status,
      history: session.history.map((entry) => ({ ...entry })),
    };
  }
}
