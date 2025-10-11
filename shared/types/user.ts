import { Role } from "./game";

export interface User {
  userId: string;
  userName: string;
  isHost: boolean;
  role?: Role;
  isAlive?: boolean; // 将来の拡張用
}

export interface Session extends User {
  webSocket: WebSocket;
}
