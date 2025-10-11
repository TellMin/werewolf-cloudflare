import { Role } from "@shared/types/game";
import RoleCard from "../role/RoleCard";

interface DayPhaseProps {
  myRole: Role | null;
}

export default function DayPhase({ myRole }: DayPhaseProps) {
  return (
    <div class="py-8">
      <div class="text-center mb-6">
        <h2 class="text-3xl font-bold text-gray-800 mb-2">☀️ 昼のフェーズ</h2>
        <p class="text-gray-600">誰が人狼か話し合いましょう</p>
      </div>
      {myRole && (
        <div class="max-w-md mx-auto">
          <RoleCard
            role={myRole}
            showDetails={true}
            description={myRole === "werewolf"
              ? "疑われないように振る舞いましょう"
              : "人狼を見つけ出しましょう"}
          />
        </div>
      )}
    </div>
  );
}
