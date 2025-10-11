import { useWebSocket } from "../hooks/useWebSocket";
import { useGameState } from "../hooks/useGameState";
import { useChat } from "../hooks/useChat";
import ConnectionStatus from "../components/common/ConnectionStatus";
import PhaseDisplay from "../components/game/PhaseDisplay";
import ParticipantList from "../components/participants/ParticipantList";
import RoleConfigPanel from "../components/host/RoleConfigPanel";
import HostControls from "../components/host/HostControls";
import GameBoard from "../components/game/GameBoard";
import ChatPanel from "../components/chat/ChatPanel";
import { GamePhase, RoleConfig } from "@shared/types/game";

interface ChatProps {
  roomId: string;
  userName: string;
}

export default function Chat({ roomId, userName }: ChatProps) {
  const { isConnected, lastMessage, sendMessage } = useWebSocket(roomId, userName);
  const {
    phase,
    isHost,
    roleConfig,
    setRoleConfig,
    myRole,
    canStartGame,
    participants,
  } = useGameState(lastMessage);
  const { messages, messagesEndRef } = useChat(lastMessage);

  const handlePhaseChange = (newPhase: GamePhase) => {
    sendMessage({ type: "change_phase", phase: newPhase });
  };

  const handleRoleChange = (role: keyof RoleConfig, increment: number) => {
    const newConfig = {
      ...roleConfig,
      [role]: Math.max(0, roleConfig[role] + increment),
    };
    setRoleConfig(newConfig);
    sendMessage({ type: "update_role_config", roleConfig: newConfig });
  };

  const handleSendMessage = (message: string) => {
    sendMessage({ message });
  };

  return (
    <div class="flex flex-col gap-4">
      {/* デバッグ情報 */}
      <div class="bg-gray-100 border border-gray-300 rounded-lg p-3 text-xs font-mono">
        <div>
          isHost:{" "}
          <span class={isHost ? "text-green-600 font-bold" : "text-red-600"}>
            {String(isHost)}
          </span>
        </div>
        <div>userName: {userName}</div>
        <div>phase: {phase}</div>
        <div>participants: {participants.length}</div>
      </div>

      {/* 接続状態とフェーズ */}
      <div class="flex items-center justify-between">
        <ConnectionStatus isConnected={isConnected} participantCount={participants.length} />
        <PhaseDisplay phase={phase} isHost={isHost} />
      </div>

      {/* 参加者リスト */}
      <ParticipantList participants={participants} />

      {/* 役職配分設定 (ホスト・待機中のみ) */}
      {isHost && phase === "waiting" && (
        <RoleConfigPanel
          roleConfig={roleConfig}
          participantCount={participants.length}
          canStartGame={canStartGame}
          onRoleChange={handleRoleChange}
        />
      )}

      {/* ホスト用コントロール */}
      {isHost && (
        <HostControls
          phase={phase}
          canStartGame={canStartGame}
          onPhaseChange={handlePhaseChange}
        />
      )}

      {/* ゲーム画面 */}
      <GameBoard phase={phase} isHost={isHost} myRole={myRole} />

      {/* チャット */}
      <ChatPanel
        messages={messages}
        messagesEndRef={messagesEndRef}
        isConnected={isConnected}
        onSendMessage={handleSendMessage}
      />
    </div>
  );
}
