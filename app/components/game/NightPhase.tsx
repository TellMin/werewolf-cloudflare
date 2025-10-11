import { Role } from "@shared/types/game";
import RoleCard from "../role/RoleCard";

interface NightPhaseProps {
  myRole: Role | null;
}

export default function NightPhase({ myRole }: NightPhaseProps) {
  return (
    <div class="py-8">
      <div class="text-center mb-6">
        <h2 class="text-3xl font-bold text-gray-800 mb-2">🌙 夜のフェーズ</h2>
      </div>
      {myRole && (
        <div class="max-w-md mx-auto">
          <RoleCard role={myRole} showDetails={false} />
        </div>
      )}
    </div>
  );
}
