import { Role, RoleConfig } from "../types/game";

export function createRoleArray(config: RoleConfig): Role[] {
  const roles: Role[] = [];
  for (let i = 0; i < config.villager; i++) {
    roles.push("villager");
  }
  for (let i = 0; i < config.werewolf; i++) {
    roles.push("werewolf");
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
