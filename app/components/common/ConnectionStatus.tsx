interface ConnectionStatusProps {
  isConnected: boolean;
  participantCount: number;
}

export default function ConnectionStatus({ isConnected, participantCount }: ConnectionStatusProps) {
  return (
    <div class="flex items-center gap-4">
      <div class="flex items-center gap-2">
        <div
          class={`w-2 h-2 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"}`}
        ></div>
        <span class="text-sm text-gray-600">
          {isConnected ? "Connected" : "Disconnected"}
        </span>
      </div>
      {participantCount > 0 && (
        <span class="text-sm text-gray-600">
          {participantCount} participant{participantCount > 1 ? "s" : ""}
        </span>
      )}
    </div>
  );
}
