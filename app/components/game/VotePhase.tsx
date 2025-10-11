import { Role } from "@shared/types/game";
import RoleCard from "../role/RoleCard";

interface VotePhaseProps {
  myRole: Role | null;
}

export default function VotePhase({ myRole }: VotePhaseProps) {
  return (
    <div class="py-8">
      <div class="text-center mb-6">
        <h2 class="text-3xl font-bold text-gray-800 mb-2">🗳️ 投票フェーズ</h2>
        <p class="text-gray-600">人狼だと思う人に投票してください</p>
      </div>
      {myRole && (
        <div class="max-w-md mx-auto">
          <RoleCard
            role={myRole}
            showDetails={true}
            description="投票先を選んでください"
          />
        </div>
      )}
    </div>
  );
}
