import { GameMessage } from "@shared/types/message";

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
    case "role_assigned":
      return (
        <div class="text-center py-2">
          <span
            class={`text-sm px-3 py-1 rounded-full font-bold ${
              message.role === "werewolf"
                ? "text-red-600 bg-red-50"
                : "text-green-600 bg-green-50"
            }`}
          >
            あなたの役職: {message.role === "werewolf" ? "🐺 人狼" : "👤 村人"}
          </span>
        </div>
      );
    case "role_config_update":
      return (
        <div class="text-center py-2">
          <span class="text-sm text-purple-600 bg-purple-50 px-3 py-1 rounded-full">
            役職配分が更新されました
          </span>
        </div>
      );
    case "phase_change":
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
    case "message":
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
              </div>
              <div class="bg-gray-100 rounded-lg px-4 py-2 inline-block">
                <p class="text-gray-800">{message.message}</p>
              </div>
            </div>
          </div>
        </div>
      );
    default:
      return null;
  }
}
