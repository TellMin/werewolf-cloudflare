import { GamePhase, Role } from "@shared/types/game";
import WaitingPhase from "./WaitingPhase";
import NightPhase from "./NightPhase";
import DayPhase from "./DayPhase";
import VotePhase from "./VotePhase";
import FinishedPhase from "./FinishedPhase";

interface GameBoardProps {
  phase: GamePhase;
  isHost: boolean;
  myRole: Role | null;
}

export default function GameBoard({ phase, isHost, myRole }: GameBoardProps) {
  return (
    <div class="bg-white border border-gray-200 rounded-lg p-6">
      {phase === "waiting" && <WaitingPhase isHost={isHost} />}
      {phase === "night" && <NightPhase myRole={myRole} />}
      {phase === "day" && <DayPhase myRole={myRole} />}
      {phase === "vote" && <VotePhase myRole={myRole} />}
      {phase === "finished" && <FinishedPhase myRole={myRole} />}
    </div>
  );
}
