import { getRoleDefinition } from "@shared/roles";
import { Role } from "@shared/types/game";
import RoleTeamBadge from "../role/RoleTeamBadge";

interface RoleCountControlProps {
  role: Role;
  count: number;
  onChange: (delta: number) => void;
}

const TEAM_ACCENTS = {
  villagers: {
    text: "text-green-700",
  },
  werewolves: {
    text: "text-red-700",
  },
  neutral: {
    text: "text-gray-700",
  },
};

export default function RoleCountControl({ role, count, onChange }: RoleCountControlProps) {
  const definition = getRoleDefinition(role);
  const accent = TEAM_ACCENTS[definition.team];

  return (
    <div class="flex items-center justify-between gap-3">
      <div>
        <div class={`text-sm font-semibold ${accent.text}`}>
          {definition.icon} {definition.name}
        </div>
        <div class="mt-1 flex items-center gap-2 text-xs text-gray-500">
          <RoleTeamBadge team={definition.team} />
          <span>{definition.summary}</span>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <button
          onClick={() => onChange(-1)}
          disabled={count === 0}
          class="w-8 h-8 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed rounded text-lg font-bold transition-colors"
        >
          -
        </button>
        <span class="w-12 text-center font-bold text-lg">{count}</span>
        <button
          onClick={() => onChange(1)}
          class="w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded text-lg font-bold transition-colors"
        >
          +
        </button>
      </div>
    </div>
  );
}
