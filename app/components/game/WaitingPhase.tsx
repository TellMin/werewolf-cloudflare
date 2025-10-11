interface WaitingPhaseProps {
  isHost: boolean;
}

export default function WaitingPhase({ isHost }: WaitingPhaseProps) {
  return (
    <div class="text-center py-8">
      <h2 class="text-2xl font-bold text-gray-800 mb-2">待機中</h2>
      <p class="text-gray-600">
        {isHost
          ? "役職を設定してゲームを開始してください"
          : "ホストがゲームを開始するまでお待ちください"}
      </p>
    </div>
  );
}
