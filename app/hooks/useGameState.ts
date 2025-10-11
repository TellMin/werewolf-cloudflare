import { useState, useEffect } from "hono/jsx";
import { GamePhase, RoleConfig, Role } from "@shared/types/game";
import { User } from "@shared/types/user";
import { GameMessage } from "@shared/types/message";

export function useGameState(lastMessage: GameMessage | null) {
  const [phase, setPhase] = useState<GamePhase>("waiting");
  const [isHost, setIsHost] = useState(false);
  const [roleConfig, setRoleConfig] = useState<RoleConfig>({ villager: 0, werewolf: 0 });
  const [myRole, setMyRole] = useState<Role | null>(null);
  const [canStartGame, setCanStartGame] = useState(false);
  const [participants, setParticipants] = useState<User[]>([]);

  useEffect(() => {
    if (!lastMessage) return;

    switch (lastMessage.type) {
      case "system":
        if (lastMessage.participants) setParticipants(lastMessage.participants);
        if (lastMessage.phase) setPhase(lastMessage.phase);
        if (lastMessage.isHost !== undefined) setIsHost(lastMessage.isHost);
        if (lastMessage.roleConfig) setRoleConfig(lastMessage.roleConfig);
        if (lastMessage.canStartGame !== undefined) setCanStartGame(lastMessage.canStartGame);
        break;

      case "join":
      case "leave":
        if (lastMessage.participants) setParticipants(lastMessage.participants);
        break;

      case "phase_change":
        if (lastMessage.phase) setPhase(lastMessage.phase);
        break;

      case "role_config_update":
        if (lastMessage.roleConfig) setRoleConfig(lastMessage.roleConfig);
        if (lastMessage.canStartGame !== undefined) setCanStartGame(lastMessage.canStartGame);
        break;

      case "role_assigned":
        if (lastMessage.role) setMyRole(lastMessage.role);
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
  };
}
