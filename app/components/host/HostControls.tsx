import { GamePhase } from "@shared/types/game";

interface HostControlsProps {
  phase: GamePhase;
  canStartGame: boolean;
  onPhaseChange: (phase: GamePhase) => void;
}

export default function HostControls({ phase, canStartGame, onPhaseChange }: HostControlsProps) {
  return (
    <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
      <h3 class="text-sm font-semibold text-gray-700 mb-3">ホスト用コントロール</h3>
      <div class="flex flex-wrap gap-2">
        {phase !== "waiting" && phase !== "finished" && (
          <button
            onClick={() => onPhaseChange("waiting")}
            class="px-4 py-2 bg-gray-500 text-white text-sm rounded hover:bg-gray-600 transition-colors"
          >
            待機画面へ
          </button>
        )}
        {phase === "waiting" && (
          <button
            onClick={() => onPhaseChange("night")}
            disabled={!canStartGame}
            class="px-4 py-2 bg-green-500 text-white text-sm rounded hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            ゲーム開始
          </button>
        )}
        {phase === "night" && (
          <span class="px-4 py-2 text-sm text-indigo-700 bg-indigo-50 border border-indigo-200 rounded">
            夜の行動完了後に自動で昼フェーズへ移行します
          </span>
        )}
        {phase === "day" && (
          <button
            onClick={() => onPhaseChange("vote")}
            class="px-4 py-2 bg-orange-500 text-white text-sm rounded hover:bg-orange-600 transition-colors"
          >
            🗳️ 投票へ
          </button>
        )}
        {phase === "vote" && (
          <span class="px-4 py-2 text-sm text-gray-600 bg-gray-100 border border-dashed border-gray-300 rounded">
            投票完了で自動的に終了します
          </span>
        )}
        {phase === "finished" && (
          <button
            onClick={() => onPhaseChange("waiting")}
            class="px-4 py-2 bg-gray-500 text-white text-sm rounded hover:bg-gray-600 transition-colors"
          >
            待機画面へ
          </button>
        )}
      </div>
    </div>
  );
}
