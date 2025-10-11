import { Role, RoleConfig } from "@shared/types/game";
import { assignRoles } from "@shared/utils/role-assignment";
import { Session } from "@shared/types/user";

export class RoleManager {
  assignRolesToSessions(
    sessions: Map<string, Session>,
    config: RoleConfig
  ): { roleMap: Map<string, Role>; graveyardRoles: Role[] } {
    const roles = assignRoles(config);
    const roleMap = new Map<string, Role>();

    const sessionList = Array.from(sessions.values());
    if (roles.length < sessionList.length) {
      throw new Error("Not enough roles configured for participants");
    }
    sessionList.forEach((session, index) => {
      roleMap.set(session.userId, roles[index]);
    });

    const graveyardRoles = roles.slice(sessionList.length);

    return { roleMap, graveyardRoles };
  }

  getRoleForUser(userId: string, roleMap: Map<string, Role>): Role | undefined {
    return roleMap.get(userId);
  }
}
