import { getRoleDefinition } from "@shared/roles";
import { Role, VoteState, GameResult } from "@shared/types/game";
import { User } from "@shared/types/user";

interface FinishedPhaseProps {
  myRole: Role | null;
  participants: User[];
  voteState: VoteState | null;
  result: GameResult | null;
}

const TEAM_LABELS: Record<GameResult["winnerTeam"], string> = {
  villagers: "村人陣営",
  werewolves: "人狼陣営",
  neutral: "第3陣営",
  none: "勝者なし",
};

const REASON_LABELS: Record<GameResult["reason"], string> = {
  execution: "処刑結果",
  abstain: "棄権多数",
  no_resolution: "再投票不成立",
};

export default function FinishedPhase({
  myRole,
  participants,
  voteState,
  result,
}: FinishedPhaseProps) {
  const roleDefinition = myRole ? getRoleDefinition(myRole) : null;
  const executedRoleDefinition = result?.executedRole ? getRoleDefinition(result.executedRole) : null;
  const executedUserName =
    result?.executedUserName ??
    (result?.executedUserId
      ? participants.find((p) => p.userId === result.executedUserId)?.userName
      : undefined);

  return (
    <div class="text-center py-8">
      <h2 class="text-2xl font-bold text-gray-800 mb-2">ゲーム終了</h2>
      {result ? (
        <div class="space-y-3">
          <p class="text-lg font-semibold text-gray-800">
            {TEAM_LABELS[result.winnerTeam]}
            {result.winnerTeam !== "none" ? " の勝利" : ""}
          </p>
          <p class="text-sm text-gray-600">{REASON_LABELS[result.reason]}</p>
          {result.reason === "execution" && executedUserName && executedRoleDefinition && (
            <p class="text-sm text-gray-600">
              処刑されたのは {executedUserName} ({executedRoleDefinition.icon} {executedRoleDefinition.name}) でした。
            </p>
          )}
          {result.reason === "abstain" && (
            <p class="text-sm text-gray-600">棄権が最多となり処刑は行われませんでした。</p>
          )}
          {result.reason === "no_resolution" && (
            <p class="text-sm text-gray-600">
              再投票でも決着が付かなかったため人狼陣営の勝利とみなされました。
            </p>
          )}
        </div>
      ) : (
        <p class="text-gray-600">結果を集計しています...</p>
      )}
      {roleDefinition && (
        <p class="text-sm text-gray-500 mt-2">
          あなたの役職: {roleDefinition.icon} {roleDefinition.name}
        </p>
      )}
      {voteState && voteState.history.length > 0 && (
        <div class="mt-6 text-left max-w-md mx-auto bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h3 class="text-sm font-semibold text-gray-700 mb-3">投票の振り返り</h3>
          <div class="space-y-3 text-sm text-gray-700">
            {voteState.history.map((summary) => (
              <div key={summary.round} class="border-b border-gray-200 pb-2 last:border-b-0 last:pb-0">
                <div class="font-semibold">
                  第{summary.round}ラウンド
                  {summary.round > 1 && <span class="ml-1 text-xs">（再投票）</span>}
                </div>
                <ul class="mt-1 space-y-1">
                  {Object.entries(summary.counts).map(([key, count]) => (
                    <li key={key}>
                      {key === "abstain"
                        ? "棄権"
                        : participants.find((p) => p.userId === key)?.userName ?? "不明"}
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
  );
}
