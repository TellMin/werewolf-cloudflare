import { GameMessage } from "@shared/types/message";
import { SessionManager } from "./SessionManager";

export class BroadcastService {
  constructor(private sessionManager: SessionManager) {}

  broadcast(message: GameMessage, excludeSessionId?: string): void {
    const messageStr = JSON.stringify(message);

    for (const [sessionId, session] of this.sessionManager.getAllSessions().entries()) {
      if (sessionId !== excludeSessionId) {
        try {
          session.webSocket.send(messageStr);
        } catch (error) {
          console.error("Failed to send message to session:", sessionId, error);
        }
      }
    }
  }

  sendToSession(sessionId: string, message: GameMessage): void {
    const session = this.sessionManager.getSession(sessionId);
    if (session) {
      try {
        session.webSocket.send(JSON.stringify(message));
      } catch (error) {
        console.error("Failed to send message to session:", sessionId, error);
      }
    }
  }
}
