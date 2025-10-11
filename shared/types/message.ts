import { GamePhase, RoleConfig, Role, VoteState, GameResult } from "./game";
import { User } from "./user";

export type MessageType =
  | "join"
  | "leave"
  | "message"
  | "system"
  | "phase_change"
  | "role_config_update"
  | "role_assigned"
  | "vote"
  | "action";

export interface BaseMessage {
  type: MessageType;
  timestamp: number;
}

export interface JoinMessage extends BaseMessage {
  type: "join";
  userId: string;
  userName: string;
  participants: User[];
}

export interface LeaveMessage extends BaseMessage {
  type: "leave";
  userId: string;
  userName: string;
  participants: User[];
}

export interface ChatMessage extends BaseMessage {
  type: "message";
  userId: string;
  userName: string;
  message: string;
  visibility?: "public" | "private";
  recipientUserId?: string;
}

export interface SystemMessage extends BaseMessage {
  type: "system";
  message: string;
  participants?: User[];
  phase?: GamePhase;
  isHost?: boolean;
  roleConfig?: RoleConfig;
  canStartGame?: boolean;
  selfUserId?: string;
  voteState?: VoteState;
  result?: GameResult;
  nightActionCompleted?: boolean;
}

export interface PhaseChangeMessage extends BaseMessage {
  type: "phase_change";
  phase: GamePhase;
  result?: GameResult;
}

export interface RoleConfigUpdateMessage extends BaseMessage {
  type: "role_config_update";
  roleConfig: RoleConfig;
  canStartGame: boolean;
}

export interface RoleAssignedMessage extends BaseMessage {
  type: "role_assigned";
  role: Role;
}

export interface VoteUpdateMessage extends BaseMessage {
  type: "vote";
  voteState: VoteState;
}

export interface NightActionAckMessage extends BaseMessage {
  type: "action";
  action: "ack";
  userId: string;
  completed: boolean;
}

export type GameMessage =
  | JoinMessage
  | LeaveMessage
  | ChatMessage
  | SystemMessage
  | PhaseChangeMessage
  | RoleConfigUpdateMessage
  | RoleAssignedMessage
  | VoteUpdateMessage
  | NightActionAckMessage;
