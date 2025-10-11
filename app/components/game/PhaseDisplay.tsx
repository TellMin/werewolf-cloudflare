import { GamePhase } from "@shared/types/game";

interface PhaseDisplayProps {
  phase: GamePhase;
  isHost: boolean;
}

const PHASE_LABELS: Record<GamePhase, string> = {
  waiting: "待機中",
  night: "🌙 夜",
  day: "☀️ 昼",
  vote: "🗳️ 投票",
  finished: "終了",
};

export default function PhaseDisplay({ phase, isHost }: PhaseDisplayProps) {
  return (
    <div class="text-sm font-semibold px-3 py-1 rounded-full bg-blue-100 text-blue-800">
      {PHASE_LABELS[phase]}
      {isHost && " (ホスト)"}
    </div>
  );
}
