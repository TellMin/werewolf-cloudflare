import type { RoleTeam } from "@shared/types/role";

interface RoleTeamBadgeProps {
  team: RoleTeam;
}

const TEAM_STYLES: Record<RoleTeam, { bg: string; text: string; label: string }> = {
  villagers: {
    bg: "bg-green-100",
    text: "text-green-700",
    label: "村人陣営",
  },
  werewolves: {
    bg: "bg-red-100",
    text: "text-red-700",
    label: "人狼陣営",
  },
  neutral: {
    bg: "bg-gray-200",
    text: "text-gray-700",
    label: "第三陣営",
  },
};

export default function RoleTeamBadge({ team }: RoleTeamBadgeProps) {
  const { bg, text, label } = TEAM_STYLES[team];
  return (
    <span class={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${bg} ${text}`}>
      {label}
    </span>
  );
}
