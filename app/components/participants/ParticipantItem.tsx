import { User } from "@shared/types/user";

interface ParticipantItemProps {
  participant: User;
}

export default function ParticipantItem({ participant }: ParticipantItemProps) {
  return (
    <div class="flex items-center gap-2 text-sm">
      <span class={participant.isHost ? "font-bold text-yellow-600" : "text-gray-700"}>
        {participant.userName}
      </span>
      {participant.isHost && (
        <span class="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">
          ホスト
        </span>
      )}
    </div>
  );
}
