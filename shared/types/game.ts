import type { RoleId } from "@shared/roles";
import type { RoleTeam } from "@shared/types/role";

export const EXTRA_ROLE_SLOTS = 2;
export const GRAVEYARD_TARGET_ID = "graveyard";

export type GamePhase = "waiting" | "night" | "day" | "vote" | "finished";
export type Role = RoleId;
export type RoleConfig = Record<Role, number>;
export type GameMode = "standard" | "advanced"; // 将来の拡張用

export type VoteChoice =
  | { type: "player"; userId: string }
  | { type: "abstain" };

export interface VoteRoundSummary {
  round: number;
  counts: Record<string, number>;
  topChoices: string[];
  resolved: boolean;
}

export interface VoteState {
  round: number;
  eligibleVoters: string[];
  candidates: string[];
  votes: Record<string, VoteChoice | null>;
  status: "open" | "revote" | "resolved";
  history: VoteRoundSummary[];
}

export type GameResolutionReason = "execution" | "abstain" | "no_resolution";

export interface GameResult {
  winnerTeam: RoleTeam | "none";
  reason: GameResolutionReason;
  executedUserId?: string;
  executedUserName?: string;
  executedRole?: Role;
  executedTeam?: RoleTeam;
}

export interface GameState {
  phase: GamePhase;
  roleConfig: RoleConfig;
  mode: GameMode;
  voteState?: VoteState | null;
  result?: GameResult | null;
  graveyardRoles?: Role[];
}
