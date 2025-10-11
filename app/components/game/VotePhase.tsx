import { Role, VoteState } from "@shared/types/game";
import { User } from "@shared/types/user";
import RoleCard from "../role/RoleCard";

interface VotePhaseProps {
  myRole: Role | null;
  myUserId: string | null;
  participants: User[];
  voteState: VoteState | null;
  onVote: (targetUserId: string | null) => void;
}

function resolveUserName(participants: User[], userId: string) {
  return participants.find((p) => p.userId === userId)?.userName ?? "不明なプレイヤー";
}

function createVoteCounts(voteState: VoteState): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const voterId of voteState.eligibleVoters) {
    const selection = voteState.votes[voterId];
    if (!selection) continue;
    const key = selection.type === "player" ? selection.userId : "abstain";
    counts[key] = (counts[key] ?? 0) + 1;
  }
  return counts;
}

export default function VotePhase({
  myRole,
  myUserId,
  participants,
  voteState,
  onVote,
}: VotePhaseProps) {
  const isVoteResolved = voteState?.status === "resolved";
  const eligibleVoterSet = new Set(voteState?.eligibleVoters ?? []);
  const isEligible = !!(myUserId && eligibleVoterSet.has(myUserId));
  const myVote =
    myUserId && voteState ? voteState.votes[myUserId] ?? null : null;
  const submittedCount = voteState
    ? Object.values(voteState.votes).filter(Boolean).length
    : 0;
  const totalVoters = voteState?.eligibleVoters.length ?? 0;
  const voteCounts = voteState ? createVoteCounts(voteState) : {};

  const candidateUsers = (voteState?.candidates ?? [])
    .map((userId) => participants.find((p) => p.userId === userId))
    .filter((p): p is User => Boolean(p && p.userId !== myUserId));

  const handleVoteClick = (targetUserId: string) => {
    if (!isEligible || isVoteResolved) return;
    if (targetUserId === myUserId) return;
    onVote(targetUserId);
  };

  const handleAbstain = () => {
    if (!isEligible || isVoteResolved) return;
    onVote(null);
  };

  const statusMessage = (() => {
    if (!voteState) return "投票情報を待機しています";
    if (voteState.status === "resolved") return "投票が完了しました";
    if (voteState.round > 1) return "最多得票者による再投票を実施中です";
    return "全員の投票が完了すると自動的に結果が確定します";
  })();

  return (
    <div class="py-8">
      <div class="text-center mb-6">
        <h2 class="text-3xl font-bold text-gray-800 mb-2">⚖️ 投票フェーズ</h2>
        <p class="text-gray-600">得た情報を元に投票対象を決めましょう</p>
      </div>
      {myRole && (
        <div class="max-w-xl mx-auto">
          <RoleCard role={myRole} showDetails={true} phase="vote" />
        </div>
      )}

      {!voteState && (
        <div class="mt-8 text-center text-sm text-gray-500">
          投票の準備をしています...
        </div>
      )}

      {voteState && (
        <div class="mt-8 space-y-6">
          <div class="bg-sky-50 border border-sky-200 rounded-lg p-4">
            <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
              <div class="text-sky-800 font-semibold">
                第{voteState.round}ラウンド
                {voteState.round > 1 && <span class="ml-1 text-sm">（再投票）</span>}
              </div>
              <div class="text-sm text-sky-700">
                投票状況: {submittedCount} / {totalVoters}
              </div>
            </div>
            <p class="text-xs md:text-sm text-sky-700 mt-2">{statusMessage}</p>
            {totalVoters === 0 && !isVoteResolved && (
              <p class="text-xs text-sky-700 mt-2">
                投票権を持つプレイヤーがいないため結果処理を待機しています
              </p>
            )}
            {!myUserId && (
              <p class="text-xs text-sky-700 mt-2">プレイヤー情報を取得中です...</p>
            )}
            {myUserId && !isEligible && !isVoteResolved && (
              <p class="text-xs text-sky-700 mt-2">
                あなたは今回の再投票対象のため投票には参加できません
              </p>
            )}
            {myVote && (
              <p class="text-xs text-sky-700 mt-2">
                あなたの現在の選択: {" "}
                {myVote.type === "player"
                  ? resolveUserName(participants, myVote.userId)
                  : "棄権"}
              </p>
            )}
          </div>

          <div class="grid gap-6 md:grid-cols-3">
            <div class="md:col-span-2 space-y-3">
              <h3 class="font-semibold text-gray-700">投票先を選択</h3>
              {candidateUsers.length === 0 ? (
                <p class="text-sm text-gray-500">
                  投票対象のプレイヤーがいません。
                  {" "}
                  {isVoteResolved ? "結果をご確認ください。" : "棄権のみ選択可能です。"}
                </p>
              ) : (
                <div class="grid gap-3 sm:grid-cols-2">
                  {candidateUsers.map((candidate) => {
                    const isSelected =
                      myVote?.type === "player" && myVote.userId === candidate.userId;
                    const currentCount = voteCounts[candidate.userId] ?? 0;
                    return (
                      <button
                        key={candidate.userId}
                        onClick={() => handleVoteClick(candidate.userId)}
                        disabled={!isEligible || isVoteResolved}
                        class={`flex flex-col items-start gap-1 rounded-lg border px-4 py-3 text-left transition hover:border-orange-400 hover:bg-orange-50 ${
                          isSelected
                            ? "border-orange-500 bg-orange-50 text-orange-700"
                            : "border-gray-200 bg-white text-gray-700"
                        } ${!isEligible || isVoteResolved ? "opacity-60 cursor-not-allowed" : ""}`}
                      >
                        <span class="font-semibold">{candidate.userName}</span>
                        <span class="text-xs text-gray-500">
                          現在の票数: {currentCount}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              <button
                onClick={handleAbstain}
                disabled={!isEligible || isVoteResolved}
                class={`flex items-center justify-between rounded-lg border px-4 py-3 text-left transition ${
                  myVote?.type === "abstain"
                    ? "border-gray-600 bg-gray-100 text-gray-700"
                    : "border-gray-200 bg-white text-gray-700"
                } ${!isEligible || isVoteResolved ? "opacity-60 cursor-not-allowed" : "hover:border-gray-400 hover:bg-gray-50"}`}
              >
                <span class="font-semibold">棄権する</span>
                <span class="text-xs text-gray-500">
                  現在の票数: {voteCounts.abstain ?? 0}
                </span>
              </button>
            </div>

            <div class="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3">
              <h3 class="font-semibold text-gray-700">投票状況</h3>
              <ul class="space-y-2 text-sm text-gray-700">
                {voteState.eligibleVoters.map((voterId) => {
                  const voterName = resolveUserName(participants, voterId);
                  const selection = voteState.votes[voterId];
                  return (
                    <li key={voterId} class="flex items-center justify-between gap-2">
                      <span>{voterName}</span>
                      <span class="text-xs text-gray-500">
                        {selection ? (selection.type === "player" ? "投票済み" : "棄権") : "未投票"}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>

          {voteState.history.length > 0 && (
            <div class="bg-white border border-gray-200 rounded-lg p-4">
              <h3 class="font-semibold text-gray-700 mb-3">これまでの投票結果</h3>
              <div class="space-y-3 text-sm text-gray-700">
                {voteState.history.map((summary) => (
                  <div key={summary.round} class="border-b border-gray-100 pb-2 last:border-none last:pb-0">
                    <div class="font-semibold">
                      第{summary.round}ラウンド
                      {summary.round > 1 && <span class="ml-1 text-xs">（再投票）</span>}
                    </div>
                    <ul class="mt-1 space-y-1">
                      {Object.entries(summary.counts).map(([key, count]) => (
                        <li key={key}>
                          {key === "abstain"
                            ? "棄権"
                            : resolveUserName(participants, key)}
                          : {count} 票
                        </li>
                      ))}
                    </ul>
                    {!summary.resolved && (
                      <p class="text-xs text-gray-500 mt-1">同票のため再投票</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
