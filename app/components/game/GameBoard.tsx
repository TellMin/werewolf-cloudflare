import { GamePhase, Role, VoteState, GameResult } from "@shared/types/game";
import { User } from "@shared/types/user";
import WaitingPhase from "./WaitingPhase";
import NightPhase from "./NightPhase";
import DayPhase from "./DayPhase";
import VotePhase from "./VotePhase";
import FinishedPhase from "./FinishedPhase";

interface GameBoardProps {
  phase: GamePhase;
  isHost: boolean;
  myRole: Role | null;
  participants: User[];
  myUserId: string | null;
  voteState: VoteState | null;
  onVote: (targetUserId: string | null) => void;
  gameResult: GameResult | null;
  onNightAction: (targetUserId: string | null) => void;
  nightActionCompleted: boolean;
}

export default function GameBoard({
  phase,
  isHost,
  myRole,
  participants,
  myUserId,
  voteState,
  onVote,
  gameResult,
  onNightAction,
  nightActionCompleted,
}: GameBoardProps) {
  return (
    <div class="bg-white border border-gray-200 rounded-lg p-6">
      {phase === "waiting" && <WaitingPhase isHost={isHost} />}
      {phase === "night" && (
        <NightPhase
          myRole={myRole}
          participants={participants}
          myUserId={myUserId}
          onAction={onNightAction}
          hasCompletedAction={nightActionCompleted}
        />
      )}
      {phase === "day" && <DayPhase myRole={myRole} />}
      {phase === "vote" && (
        <VotePhase
          myRole={myRole}
          myUserId={myUserId}
          participants={participants}
          voteState={voteState}
          onVote={onVote}
        />
      )}
      {phase === "finished" && (
        <FinishedPhase
          myRole={myRole}
          participants={participants}
          voteState={voteState}
          result={gameResult}
        />
      )}
    </div>
  );
}
