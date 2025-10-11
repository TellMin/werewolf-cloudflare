import { Role, RoleConfig } from "@shared/types/game";
import { assignRoles } from "@shared/utils/role-assignment";
import { Session } from "@shared/types/user";

export class RoleManager {
  assignRolesToSessions(
    sessions: Map<string, Session>,
    config: RoleConfig
  ): Map<string, Role> {
    const roles = assignRoles(config);
    const roleMap = new Map<string, Role>();

    const sessionList = Array.from(sessions.values());
    sessionList.forEach((session, index) => {
      roleMap.set(session.userId, roles[index]);
    });

    return roleMap;
  }

  getRoleForUser(userId: string, roleMap: Map<string, Role>): Role | undefined {
    return roleMap.get(userId);
  }
}
