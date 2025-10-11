import { GameMessage } from "@shared/types/message";
import { getRoleDefinition } from "@shared/roles";
import { RoleTeam } from "@shared/types/role";

interface MessageItemProps {
  message: GameMessage;
}

const formatTime = (timestamp: number) => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString("ja-JP", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function MessageItem({ message }: MessageItemProps) {
  switch (message.type) {
    case "system":
      return (
        <div class="text-center py-2">
          <span class="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
            {message.message}
          </span>
        </div>
      );
    case "role_assigned": {
      const definition = getRoleDefinition(message.role);
      const teamStyles: Record<RoleTeam, string> = {
        villagers: "text-green-600 bg-green-50",
        werewolves: "text-red-600 bg-red-50",
        neutral: "text-gray-600 bg-gray-100",
      };
      return (
        <div class="text-center py-2">
          <span class={`text-sm px-3 py-1 rounded-full font-bold ${teamStyles[definition.team]}`}>
            あなたの役職: {definition.icon} {definition.name}
          </span>
        </div>
      );
    }
    case "role_config_update":
      return (
        <div class="text-center py-2">
          <span class="text-sm text-purple-600 bg-purple-50 px-3 py-1 rounded-full">
            役職配分が更新されました
          </span>
        </div>
      );
    case "phase_change":
      if (message.phase === "finished" && message.result) {
        const teamLabels = {
          villagers: "村人陣営",
          werewolves: "人狼陣営",
          neutral: "第3陣営",
          none: "勝者なし",
        } as const;
        const reasonLabels = {
          execution: "処刑結果",
          abstain: "棄権多数",
          no_resolution: "再投票不成立",
        } as const;
        const teamLabel = teamLabels[message.result.winnerTeam];
        const reasonLabel = reasonLabels[message.result.reason];
        return (
          <div class="text-center py-2 space-y-1">
            <span class="text-sm text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
              ゲームフェーズ: 終了
            </span>
            <div class="text-xs text-gray-600">
              {teamLabel}
              {message.result.winnerTeam !== "none" ? " の勝利" : ""}（{reasonLabel}）
            </div>
          </div>
        );
      }
      return (
        <div class="text-center py-2">
          <span class="text-sm text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
            ゲームフェーズ:{" "}
            {message.phase === "waiting"
              ? "待機中"
              : message.phase === "night"
              ? "🌙 夜"
              : message.phase === "day"
              ? "☀️ 昼"
              : message.phase === "vote"
              ? "🗳️ 投票"
              : "終了"}
          </span>
        </div>
      );
    case "join":
      return (
        <div class="text-center py-2">
          <span class="text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full">
            {message.userName} joined the room
          </span>
        </div>
      );
    case "leave":
      return (
        <div class="text-center py-2">
          <span class="text-sm text-red-600 bg-red-50 px-3 py-1 rounded-full">
            {message.userName} left the room
          </span>
        </div>
      );
    case "message": {
      const isWhisper = message.visibility === "private";
      const bubbleClass = isWhisper ? "bg-indigo-100" : "bg-gray-100";
      const textClass = isWhisper ? "text-indigo-900" : "text-gray-800";
      return (
        <div class="mb-4">
          <div class="flex items-start gap-2">
            <div class="flex-1">
              <div class="flex items-baseline gap-2 mb-1">
                <span class="font-semibold text-gray-800">
                  {message.userName}
                </span>
                <span class="text-xs text-gray-400">
                  {formatTime(message.timestamp)}
                </span>
                {isWhisper && (
                  <span class="text-[10px] uppercase tracking-wide text-indigo-600 bg-indigo-50 border border-indigo-200 rounded px-1.5 py-0.5">
                    Whisper
                  </span>
                )}
              </div>
              <div class={`${bubbleClass} rounded-lg px-4 py-2 inline-block`}>
                <p class={textClass}>{message.message}</p>
              </div>
            </div>
          </div>
        </div>
      );
    }
    case "action":
      return null;
    default:
      return null;
  }
}
