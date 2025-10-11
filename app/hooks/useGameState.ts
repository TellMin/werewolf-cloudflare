import { useState, useEffect } from "hono/jsx";
import { GamePhase, RoleConfig, Role, VoteState, GameResult } from "@shared/types/game";
import { User } from "@shared/types/user";
import { GameMessage } from "@shared/types/message";
import { createEmptyRoleConfig, normalizeRoleConfig } from "@shared/roles";

export function useGameState(lastMessage: GameMessage | null) {
  const [phase, setPhase] = useState<GamePhase>("waiting");
  const [isHost, setIsHost] = useState(false);
  const [roleConfig, setRoleConfig] = useState<RoleConfig>(createEmptyRoleConfig);
  const [myRole, setMyRole] = useState<Role | null>(null);
  const [canStartGame, setCanStartGame] = useState(false);
  const [participants, setParticipants] = useState<User[]>([]);
  const [myUserId, setMyUserId] = useState<string | null>(null);
  const [voteState, setVoteState] = useState<VoteState | null>(null);
  const [gameResult, setGameResult] = useState<GameResult | null>(null);

  useEffect(() => {
    if (!lastMessage) return;

    switch (lastMessage.type) {
      case "system":
        if (lastMessage.participants) setParticipants(lastMessage.participants);
        if (lastMessage.phase) setPhase(lastMessage.phase);
        if (lastMessage.isHost !== undefined) setIsHost(lastMessage.isHost);
        if (lastMessage.roleConfig) setRoleConfig(normalizeRoleConfig(lastMessage.roleConfig));
        if (lastMessage.canStartGame !== undefined) setCanStartGame(lastMessage.canStartGame);
        if (lastMessage.selfUserId) setMyUserId(lastMessage.selfUserId);
        if (lastMessage.voteState) setVoteState(lastMessage.voteState);
        if (lastMessage.result) setGameResult(lastMessage.result);
        break;

      case "join":
      case "leave":
        if (lastMessage.participants) setParticipants(lastMessage.participants);
        break;

      case "phase_change":
        if (lastMessage.phase) setPhase(lastMessage.phase);
        if (lastMessage.phase !== "vote" && lastMessage.phase !== "finished") {
          setVoteState(null);
        }
        if (lastMessage.phase === "finished") {
          setGameResult(lastMessage.result ?? null);
        } else {
          setGameResult(null);
        }
        break;

      case "role_config_update":
        if (lastMessage.roleConfig) setRoleConfig(normalizeRoleConfig(lastMessage.roleConfig));
        if (lastMessage.canStartGame !== undefined) setCanStartGame(lastMessage.canStartGame);
        break;

      case "role_assigned":
        if (lastMessage.role) setMyRole(lastMessage.role);
        break;

      case "vote":
        setVoteState(lastMessage.voteState);
        break;
    }
  }, [lastMessage]);

  return {
    phase,
    isHost,
    roleConfig,
    setRoleConfig,
    myRole,
    canStartGame,
    participants,
    myUserId,
    voteState,
    gameResult,
  };
}
