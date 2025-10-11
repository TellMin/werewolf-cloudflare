export type GamePhase = "waiting" | "night" | "day" | "vote" | "finished";
export type Role = "villager" | "werewolf";
export type GameMode = "standard" | "advanced"; // 将来の拡張用

export interface RoleConfig {
  villager: number;
  werewolf: number;
}

export interface GameState {
  phase: GamePhase;
  roleConfig: RoleConfig;
  mode: GameMode;
}
