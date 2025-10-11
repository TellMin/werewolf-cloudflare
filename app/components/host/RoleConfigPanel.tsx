import { RoleConfig } from "@shared/types/game";

interface RoleConfigPanelProps {
  roleConfig: RoleConfig;
  participantCount: number;
  canStartGame: boolean;
  onRoleChange: (role: keyof RoleConfig, increment: number) => void;
}

export default function RoleConfigPanel({
  roleConfig,
  participantCount,
  canStartGame,
  onRoleChange,
}: RoleConfigPanelProps) {
  const totalRoles = roleConfig.villager + roleConfig.werewolf;

  return (
    <div class="bg-purple-50 border border-purple-200 rounded-lg p-4">
      <h3 class="text-sm font-semibold text-gray-700 mb-3">役職配分設定</h3>
      <div class="space-y-3">
        {/* 村人設定 */}
        <div class="flex items-center justify-between">
          <span class="text-sm font-medium text-gray-700">👤 村人</span>
          <div class="flex items-center gap-2">
            <button
              onClick={() => onRoleChange("villager", -1)}
              disabled={roleConfig.villager === 0}
              class="w-8 h-8 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed rounded text-lg font-bold transition-colors"
            >
              -
            </button>
            <span class="w-12 text-center font-bold text-lg">
              {roleConfig.villager}
            </span>
            <button
              onClick={() => onRoleChange("villager", 1)}
              class="w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded text-lg font-bold transition-colors"
            >
              +
            </button>
          </div>
        </div>

        {/* 人狼設定 */}
        <div class="flex items-center justify-between">
          <span class="text-sm font-medium text-gray-700">🐺 人狼</span>
          <div class="flex items-center gap-2">
            <button
              onClick={() => onRoleChange("werewolf", -1)}
              disabled={roleConfig.werewolf === 0}
              class="w-8 h-8 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed rounded text-lg font-bold transition-colors"
            >
              -
            </button>
            <span class="w-12 text-center font-bold text-lg">
              {roleConfig.werewolf}
            </span>
            <button
              onClick={() => onRoleChange("werewolf", 1)}
              class="w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded text-lg font-bold transition-colors"
            >
              +
            </button>
          </div>
        </div>

        {/* サマリー */}
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
