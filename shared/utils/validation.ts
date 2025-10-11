import { RoleConfig } from "../types/game";

export function validateRoleConfig(
  roleConfig: RoleConfig,
  participantCount: number
): boolean {
  const totalRoles = roleConfig.villager + roleConfig.werewolf;
  return totalRoles === participantCount && participantCount > 0;
}

export function validateRoleDistribution(roleConfig: RoleConfig): {
  isValid: boolean;
  error?: string;
} {
  if (roleConfig.werewolf === 0) {
    return { isValid: false, error: "人狼は最低1人必要です" };
  }
  if (roleConfig.villager === 0) {
    return { isValid: false, error: "村人は最低1人必要です" };
  }
  return { isValid: true };
}
