import { Role, RoleConfig } from "@shared/types/game";
import { ROLE_LIST } from "@shared/roles";

export function createRoleArray(config: RoleConfig): Role[] {
  const roles: Role[] = [];
  for (const role of ROLE_LIST) {
    const count = config[role] ?? 0;
    for (let i = 0; i < count; i++) {
      roles.push(role);
    }
  }
  return roles;
}

export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function assignRoles(config: RoleConfig): Role[] {
  const roles = createRoleArray(config);
  return shuffleArray(roles);
}
