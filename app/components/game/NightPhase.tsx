import { useEffect, useMemo, useState } from "hono/jsx";
import { Role } from "@shared/types/game";
import { User } from "@shared/types/user";
import RoleCard from "../role/RoleCard";

interface NightPhaseProps {
  myRole: Role | null;
  participants: User[];
  myUserId: string | null;
  onAction: (targetUserId: string | null) => void;
  hasCompletedAction: boolean;
}

export default function NightPhase({
  myRole,
  participants,
  myUserId,
  onAction,
  hasCompletedAction,
}: NightPhaseProps) {
  const [selectedTarget, setSelectedTarget] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const availableTargets = useMemo(() => {
    return participants.filter((p) => p.userId !== myUserId);
  }, [participants, myUserId]);

  const isSeer = myRole === "seer";

  useEffect(() => {
    if (hasCompletedAction) {
      setError(null);
    }
  }, [hasCompletedAction]);

  useEffect(() => {
    if (!hasCompletedAction) {
      setSelectedTarget(null);
      setError(null);
    }
  }, [myRole, hasCompletedAction]);

  const handleSubmit = () => {
    if (hasCompletedAction) return;

    if (isSeer) {
      if (!selectedTarget) {
        setError("占う相手を選択してください");
        return;
      }
      onAction(selectedTarget);
    } else {
      onAction(null);
    }

    setError(null);
  };

  return (
    <div class="py-8">
      <div class="text-center mb-6">
        <h2 class="text-3xl font-bold text-gray-800 mb-2">🌙 夜のフェーズ</h2>
        <p class="text-gray-600">役職ごとの行動や確認を行ってください</p>
      </div>
      {myRole && (
        <div class="max-w-xl mx-auto space-y-6">
          <RoleCard role={myRole} showDetails={true} phase="night" />

          <div class="border border-indigo-200 bg-indigo-50 rounded-lg p-4">
            {hasCompletedAction ? (
              <div class="text-center text-indigo-700 font-semibold">
                夜の行動は完了しました。昼フェーズへ移行するまでお待ちください。
              </div>
            ) : isSeer ? (
              <div class="space-y-3">
                <p class="text-sm text-indigo-700 font-semibold text-center">
                  占いたい相手を選んで「占う」を押してください。
                </p>
                <div class="space-y-2">
                  {availableTargets.length === 0 ? (
                    <p class="text-sm text-gray-600 text-center">
                      占える対象がいません。
                    </p>
                  ) : (
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {availableTargets.map((participant) => (
                        <button
                          key={participant.userId}
                          onClick={() => {
                            setSelectedTarget(participant.userId);
                            setError(null);
                          }}
                          class={`w-full px-4 py-2 rounded border transition-colors ${
                            selectedTarget === participant.userId
                              ? "border-indigo-500 bg-white text-indigo-700 font-semibold"
                              : "border-indigo-200 bg-white hover:border-indigo-400"
                          }`}
                        >
                          {participant.userName}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {error && <p class="text-sm text-red-600 text-center">{error}</p>}
                <div class="text-center">
                  <button
                    onClick={handleSubmit}
                    disabled={availableTargets.length === 0}
                    class="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:bg-indigo-300"
                  >
                    占う
                  </button>
                </div>
              </div>
            ) : (
              <div class="space-y-3 text-center">
                <p class="text-sm text-indigo-700 font-semibold">
                  夜の行動はありません。「OK」を押して待機してください。
                </p>
                <button
                  onClick={handleSubmit}
                  class="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                >
                  OK
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
