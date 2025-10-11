import { getRoleDefinition } from "@shared/roles";
import { Role } from "@shared/types/game";
import type { RolePhase } from "@shared/types/role";

interface RoleAbilityListProps {
  role: Role;
  phase?: RolePhase;
}

export default function RoleAbilityList({ role, phase }: RoleAbilityListProps) {
  const definition = getRoleDefinition(role);
  const abilities = definition.abilities?.filter((ability) => !phase || ability.phase === phase) ?? [];

  if (abilities.length === 0) {
    return null;
  }

  return (
    <div class="mt-4 text-left">
      <h4 class="text-sm font-semibold text-gray-700 mb-2">行動ガイド</h4>
      <ul class="space-y-2 text-sm text-gray-600">
        {abilities.map((ability) => (
          <li
            key={`${ability.phase}-${ability.title}`}
            class="border border-gray-200 rounded-md px-3 py-2 bg-white"
          >
            <div class="flex items-center justify-between mb-1">
              <span class="font-semibold text-gray-800">{ability.title}</span>
              <span class="text-xs text-gray-400">{ability.phase.toUpperCase()}</span>
            </div>
            <p>{ability.summary}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
