import { ROLE_LIST, getRoleDefinition } from "@shared/roles";
import { EXTRA_ROLE_SLOTS, RoleConfig } from "@shared/types/game";

export function validateRoleConfig(
  roleConfig: RoleConfig,
  participantCount: number
): boolean {
  const totalRoles = ROLE_LIST.reduce((sum, role) => sum + (roleConfig[role] ?? 0), 0);
  const hasWerewolf = (roleConfig.werewolf ?? 0) > 0;
  return (
    participantCount > 0 &&
    totalRoles === participantCount + EXTRA_ROLE_SLOTS &&
    hasWerewolf
  );
}

export function validateRoleDistribution(roleConfig: RoleConfig): {
  isValid: boolean;
  error?: string;
} {
  const countsByTeam = ROLE_LIST.reduce<Record<string, number>>((acc, role) => {
    const team = getRoleDefinition(role).team;
    acc[team] = (acc[team] ?? 0) + (roleConfig[role] ?? 0);
    return acc;
  }, {});

  if ((roleConfig.werewolf ?? 0) === 0) {
    return { isValid: false, error: "人狼は最低1人必要です" };
  }

  if ((countsByTeam.werewolves ?? 0) === 0) {
    return { isValid: false, error: "人狼陣営は最低1人必要です" };
  }

  if ((countsByTeam.villagers ?? 0) === 0) {
    return { isValid: false, error: "村人陣営は最低1人必要です" };
  }

  return { isValid: true };
}
