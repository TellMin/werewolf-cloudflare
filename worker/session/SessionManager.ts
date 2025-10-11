import { Session, User } from "@shared/types/user";

export class SessionManager {
  private sessions: Map<string, Session>;
  private hostUserId: string | null;

  constructor() {
    this.sessions = new Map();
    this.hostUserId = null;
  }

  addSession(sessionId: string, session: Session): void {
    if (this.sessions.size === 0) {
      this.hostUserId = session.userId;
      session.isHost = true;
    }
    this.sessions.set(sessionId, session);
  }

  removeSession(sessionId: string): Session | undefined {
    const session = this.sessions.get(sessionId);
    this.sessions.delete(sessionId);
    return session;
  }

  getSession(sessionId: string): Session | undefined {
    return this.sessions.get(sessionId);
  }

  findSessionByWebSocket(ws: WebSocket): { sessionId: string; session: Session } | null {
    for (const [id, session] of this.sessions.entries()) {
      if (session.webSocket === ws) {
        return { sessionId: id, session };
      }
    }
    return null;
  }

  findSessionByUserId(userId: string): { sessionId: string; session: Session } | null {
    for (const [id, session] of this.sessions.entries()) {
      if (session.userId === userId) {
        return { sessionId: id, session };
      }
    }
    return null;
  }

  getParticipants(): User[] {
    return Array.from(this.sessions.values()).map((s) => ({
      userId: s.userId,
      userName: s.userName,
      isHost: s.isHost,
      role: s.role,
    }));
  }

  getSessionCount(): number {
    return this.sessions.size;
  }

  isHost(userId: string): boolean {
    return userId === this.hostUserId;
  }

  getAllSessions(): Map<string, Session> {
    return this.sessions;
  }
}
