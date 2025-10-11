import type { RoleId } from "@shared/roles";

export type GamePhase = "waiting" | "night" | "day" | "vote" | "finished";
export type Role = RoleId;
export type RoleConfig = Record<Role, number>;
export type GameMode = "standard" | "advanced"; // 将来の拡張用

export interface GameState {
  phase: GamePhase;
  roleConfig: RoleConfig;
  mode: GameMode;
}
