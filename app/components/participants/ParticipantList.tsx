import { User } from "@shared/types/user";
import ParticipantItem from "./ParticipantItem";

interface ParticipantListProps {
  participants: User[];
}

export default function ParticipantList({ participants }: ParticipantListProps) {
  return (
    <div class="bg-white border border-gray-200 rounded-lg p-4">
      <h3 class="text-sm font-semibold text-gray-700 mb-3">参加者リスト</h3>
      <div class="space-y-2">
        {participants.map((p, idx) => (
          <ParticipantItem key={idx} participant={p} />
        ))}
      </div>
    </div>
  );
}
