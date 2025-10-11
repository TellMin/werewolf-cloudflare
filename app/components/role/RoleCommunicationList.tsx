import { getRoleDefinition } from "@shared/roles";
import { Role } from "@shared/types/game";
import type { RolePhase } from "@shared/types/role";

interface RoleCommunicationListProps {
  role: Role;
  phase?: RolePhase;
}

export default function RoleCommunicationList({ role, phase }: RoleCommunicationListProps) {
  const definition = getRoleDefinition(role);
  const communications =
    definition.communications?.filter((channel) => !phase || channel.phase === phase) ?? [];

  if (communications.length === 0) {
    return null;
  }

  return (
    <div class="mt-3">
      <h4 class="text-sm font-semibold text-gray-700 mb-2">会話チャネル</h4>
      <ul class="space-y-2 text-sm text-gray-600">
        {communications.map((channel) => (
          <li key={channel.id} class="px-3 py-2 border border-gray-200 rounded-md bg-white">
            <div class="font-semibold text-gray-800">{channel.label}</div>
            <p>{channel.summary}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
