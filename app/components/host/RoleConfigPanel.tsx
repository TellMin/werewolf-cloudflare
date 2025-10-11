import { ROLE_LIST } from "@shared/roles";
import { EXTRA_ROLE_SLOTS, RoleConfig, Role } from "@shared/types/game";
import RoleCountControl from "./RoleCountControl";

interface RoleConfigPanelProps {
  roleConfig: RoleConfig;
  participantCount: number;
  canStartGame: boolean;
  onRoleChange?: (role: Role, increment: number) => void;
  readOnly?: boolean;
}

export default function RoleConfigPanel({
  roleConfig,
  participantCount,
  canStartGame,
  onRoleChange,
  readOnly = false,
}: RoleConfigPanelProps) {
  const totalRoles = ROLE_LIST.reduce((sum, role) => sum + (roleConfig[role] ?? 0), 0);
  const requiredRoles = participantCount + EXTRA_ROLE_SLOTS;
  const expectedGraveyard = Math.max(0, totalRoles - participantCount);
  const controlsDisabled = readOnly || !onRoleChange;

  const handleRoleChange = (role: Role, delta: number) => {
    if (controlsDisabled || !onRoleChange) {
      return;
    }
    onRoleChange(role, delta);
  };

  return (
    <div class="bg-purple-50 border border-purple-200 rounded-lg p-4">
      <h3 class="text-sm font-semibold text-gray-700 mb-3">役職配分設定</h3>
      <div class="space-y-4">
        {ROLE_LIST.map((role) => (
          <RoleCountControl
            key={role}
            role={role}
            count={roleConfig[role] ?? 0}
            onChange={(delta) => handleRoleChange(role, delta)}
            disabled={controlsDisabled}
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
          <div class="flex justify-between text-sm mt-1">
            <span class="text-gray-600">
              必要役職数（参加者+{EXTRA_ROLE_SLOTS}）
            </span>
            <span class="font-bold">{requiredRoles}</span>
          </div>
          <div class="flex justify-between text-sm mt-1">
            <span class="text-gray-600">墓地に置かれる役職数</span>
            <span class="font-bold">{expectedGraveyard}</span>
          </div>
          {!canStartGame && totalRoles > 0 && (
            <div class="mt-2 text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
              ⚠️ 役職の合計数を参加者数+{EXTRA_ROLE_SLOTS}に合わせてください
            </div>
          )}
          {controlsDisabled && (
            <div class="mt-2 text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
              未使用の{EXTRA_ROLE_SLOTS}枚は墓地に置かれ、夜には占いで確認できます。
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
