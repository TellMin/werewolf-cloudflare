export type RoleTeam = "villagers" | "werewolves" | "neutral";

export type RolePhase = "night" | "day" | "vote";

export interface RoleAbility {
  phase: RolePhase;
  title: string;
  summary: string;
  targetType?: "player" | "self" | "team" | "none";
}

export interface RoleCommunication {
  id: string;
  label: string;
  summary: string;
  phase?: RolePhase;
}

export interface RoleDefinition {
  id: string;
  name: string;
  icon: string;
  team: RoleTeam;
  summary: string;
  description: string;
  abilities?: RoleAbility[];
  communications?: RoleCommunication[];
  priority?: number;
}
