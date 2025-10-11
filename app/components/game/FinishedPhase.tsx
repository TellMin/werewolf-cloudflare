import { Role } from "@shared/types/game";

interface FinishedPhaseProps {
  myRole: Role | null;
}

export default function FinishedPhase({ myRole }: FinishedPhaseProps) {
  return (
    <div class="text-center py-8">
      <h2 class="text-2xl font-bold text-gray-800 mb-2">ゲーム終了</h2>
      <p class="text-gray-600">ゲームが終了しました</p>
      {myRole && (
        <p class="text-sm text-gray-500 mt-2">
          あなたの役職: {myRole === "werewolf" ? "🐺 人狼" : "👤 村人"}
        </p>
      )}
    </div>
  );
}
