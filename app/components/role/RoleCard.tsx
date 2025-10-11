import { Role } from "@shared/types/game";

interface RoleCardProps {
  role: Role;
  showDetails?: boolean;
  description?: string;
}

export default function RoleCard({ role, showDetails = false, description }: RoleCardProps) {
  const isWerewolf = role === "werewolf";

  return (
    <div
      class={`border-2 rounded-lg p-6 text-center ${
        isWerewolf ? "border-red-300 bg-red-50" : "border-green-300 bg-green-50"
      }`}
    >
      <div class="text-4xl mb-3">{isWerewolf ? "🐺" : "👤"}</div>
      <h3 class={`text-xl font-bold mb-2 ${isWerewolf ? "text-red-700" : "text-green-700"}`}>
        あなたの役職
      </h3>
      <p class={`text-2xl font-bold ${isWerewolf ? "text-red-600" : "text-green-600"}`}>
        {isWerewolf ? "人狼" : "村人"}
      </p>
      {showDetails && description && (
        <p class="text-sm text-gray-600 mt-3">{description}</p>
      )}
    </div>
  );
}
