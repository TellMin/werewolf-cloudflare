import { ROLE_LIST } from "@shared/roles";
import { RoleConfig, Role } from "@shared/types/game";
import RoleCountControl from "./RoleCountControl";

interface RoleConfigPanelProps {
  roleConfig: RoleConfig;
  participantCount: number;
  canStartGame: boolean;
  onRoleChange: (role: Role, increment: number) => void;
}

export default function RoleConfigPanel({
  roleConfig,
  participantCount,
  canStartGame,
  onRoleChange,
}: RoleConfigPanelProps) {
  const totalRoles = ROLE_LIST.reduce((sum, role) => sum + (roleConfig[role] ?? 0), 0);

  return (
    <div class="bg-purple-50 border border-purple-200 rounded-lg p-4">
      <h3 class="text-sm font-semibold text-gray-700 mb-3">役職配分設定</h3>
      <div class="space-y-4">
        {ROLE_LIST.map((role) => (
          <RoleCountControl
            key={role}
            role={role}
            count={roleConfig[role] ?? 0}
            onChange={(delta) => onRoleChange(role, delta)}
          />
        ))}

        <div class="pt-2 border-t border-purple-200">
          <div class="flex justify-between text-sm">
            <span class="text-gray-600">合計役職数</span>
            <span class="font-bold">{totalRoles}</span>
          </div>
          <div class="flex justify-between text-sm mt-1">
            <span class="text-gray-600">参加者数</span>
            <span class="font-bold">{participantCount}</span>
          </div>
          {!canStartGame && totalRoles > 0 && (
            <div class="mt-2 text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
              ⚠️ 役職の合計数と参加者数を一致させてください
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
