import { getRoleDefinition } from "@shared/roles";
import { Role } from "@shared/types/game";
import type { RolePhase } from "@shared/types/role";
import RoleTeamBadge from "./RoleTeamBadge";

interface RoleCardProps {
  role: Role;
  showDetails?: boolean;
  phase?: RolePhase;
  extraNote?: string;
}

const TEAM_STYLES = {
  villagers: {
    border: "border-green-300",
    background: "bg-green-50",
    heading: "text-green-700",
    accent: "text-green-600",
  },
  werewolves: {
    border: "border-red-300",
    background: "bg-red-50",
    heading: "text-red-700",
    accent: "text-red-600",
  },
  neutral: {
    border: "border-gray-300",
    background: "bg-gray-50",
    heading: "text-gray-700",
    accent: "text-gray-600",
  },
};

export default function RoleCard({
  role,
  showDetails = false,
  phase,
  extraNote,
}: RoleCardProps) {
  const definition = getRoleDefinition(role);
  const theme = TEAM_STYLES[definition.team];

  return (
    <div
      class={`border-2 rounded-lg p-6 text-center ${theme.border} ${theme.background}`}
    >
      <div class="text-4xl mb-3">{definition.icon}</div>
      <h3 class={`text-xl font-bold mb-1 ${theme.heading}`}>あなたの役職</h3>
      <p class={`text-2xl font-bold ${theme.accent}`}>{definition.name}</p>
      <div class="mt-2 flex justify-center">
        <RoleTeamBadge team={definition.team} />
      </div>

      {showDetails && (
        <div class="mt-4 space-y-4 text-sm text-gray-700 text-left">
          <p class="text-base text-center text-gray-600">
            {definition.summary}
          </p>
          <p class="leading-relaxed">{definition.description}</p>
          {extraNote && (
            <p class="text-indigo-700 bg-indigo-50 px-3 py-2 rounded">
              {extraNote}
            </p>
          )}
          {/* UIについては検討中のため、一時的にコメントアウト */}
          {/* <RoleAbilityList role={role} phase={phase} />
          <RoleCommunicationList role={role} phase={phase} /> */}
        </div>
      )}
    </div>
  );
}
