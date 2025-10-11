import type { RoleDefinition } from "@shared/types/role";

const definitions = {
  villager: {
    id: "villager",
    name: "村人",
    icon: "👤",
    team: "villagers",
    summary: "能力はありません。議論で人狼を見つけましょう。",
    description:
      "村人は特別な能力を持たない一般市民です。昼の議論と投票で人狼を見つけ出し、仲間と協力して勝利を目指します。",
    abilities: [
      {
        phase: "day",
        title: "議論と投票",
        summary: "昼と投票フェーズの議論・投票に参加できます。",
        targetType: "team",
      },
      {
        phase: "vote",
        title: "推理にもとづく投票",
        summary: "話し合いで得た情報を整理し、疑わしい相手に投票しましょう。",
        targetType: "player",
      },
    ],
  },
  werewolf: {
    id: "werewolf",
    name: "人狼",
    icon: "🐺",
    team: "werewolves",
    summary: "仲間と相談して村を混乱させましょう。",
    description:
      "人狼は夜のフェーズに1人を襲撃する力を持ち、村人を減らしていきます。仲間の人狼と連携しつつ、昼の議論では正体を隠しましょう。",
    abilities: [
      {
        phase: "day",
        title: "正体を隠す",
        summary: "村人のふりをして議論を誘導し、仲間を守りましょう。",
        targetType: "team",
      },
      {
        phase: "night",
        title: "襲撃",
        summary: "夜に1人を選んで襲撃できます。",
        targetType: "player",
      },
      {
        phase: "vote",
        title: "票操作",
        summary: "人狼に疑いが向かないように投票先を調整しましょう。",
        targetType: "player",
      },
    ],
    communications: [
      {
        id: "werewolf-chat",
        label: "人狼会話",
        summary: "夜の間だけ人狼同士で会話できます。",
        phase: "night",
      },
    ],
  },
} as const satisfies Record<string, RoleDefinition>;

export const ROLE_DEFINITIONS = definitions;

export type RoleId = keyof typeof ROLE_DEFINITIONS;

export const ROLE_LIST = Object.keys(ROLE_DEFINITIONS) as RoleId[];

export function getRoleDefinition(role: RoleId): RoleDefinition {
  return ROLE_DEFINITIONS[role];
}

export function createEmptyRoleConfig(): Record<RoleId, number> {
  return ROLE_LIST.reduce((acc, role) => {
    acc[role] = 0;
    return acc;
  }, {} as Record<RoleId, number>);
}

export function normalizeRoleConfig(
  config?: Partial<Record<RoleId, number>>
): Record<RoleId, number> {
  const base = createEmptyRoleConfig();
  if (!config) {
    return base;
  }

  for (const role of ROLE_LIST) {
    base[role] = config[role] ?? 0;
  }

  return base;
}
