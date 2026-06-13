import type { AnimalRole, AnimalType } from "./types";

export interface AnimalConfig {
  type: AnimalType;
  label: string;
  emoji: string;
  role: AnimalRole;
  count: number;
  /** 漫步速度（归一化坐标 / 秒） */
  baseSpeed: number;
  /** 追逐 / 逃跑时的奔跑速度 */
  runSpeed: number;
  /** 基准字号（px），用于绘制 emoji */
  size: number;
  description: string;
}

export const ANIMAL_CONFIGS: AnimalConfig[] = [
  {
    type: "zebra",
    label: "斑马",
    emoji: "🦓",
    role: "prey",
    count: 4,
    baseSpeed: 0.045,
    runSpeed: 0.12,
    size: 46,
    description: "成群活动，警觉性高，一旦发现天敌便会迅速奔逃。",
  },
  {
    type: "wildebeest",
    label: "角马",
    emoji: "🦬",
    role: "prey",
    count: 2,
    baseSpeed: 0.04,
    runSpeed: 0.11,
    size: 48,
    description: "草原大迁徙的主角，常与斑马混群活动。",
  },
  {
    type: "buffalo",
    label: "非洲水牛",
    emoji: "🐃",
    role: "prey",
    count: 2,
    baseSpeed: 0.035,
    runSpeed: 0.1,
    size: 48,
    description: "体型健壮、性情暴躁，群居于水源附近。",
  },
  {
    type: "antelope",
    label: "羚羊",
    emoji: "🦌",
    role: "prey",
    count: 3,
    baseSpeed: 0.05,
    runSpeed: 0.16,
    size: 40,
    description: "草原上奔跑速度最快的食草动物。",
  },
  {
    type: "elephant",
    label: "非洲象",
    emoji: "🐘",
    role: "neutral",
    count: 1,
    baseSpeed: 0.015,
    runSpeed: 0.015,
    size: 58,
    description: "草原上体型最大的居民，步伐沉稳，从不参与追逐。",
  },
  {
    type: "giraffe",
    label: "长颈鹿",
    emoji: "🦒",
    role: "neutral",
    count: 1,
    baseSpeed: 0.018,
    runSpeed: 0.018,
    size: 56,
    description: "悠然啃食树梢嫩叶，步伐缓慢从容。",
  },
  {
    type: "lion",
    label: "狮子",
    emoji: "🦁",
    role: "predator",
    count: 1,
    baseSpeed: 0.03,
    runSpeed: 0.14,
    size: 50,
    description: "草原之王，靠近猎物后会发起致命冲刺。",
  },
  {
    type: "hyena",
    label: "鬣狗",
    emoji: "🐺",
    role: "predator",
    count: 1,
    baseSpeed: 0.035,
    runSpeed: 0.13,
    size: 42,
    description: "成群行动的机会主义猎手，耐力出众。",
  },
];

export function configFor(type: AnimalType): AnimalConfig {
  const cfg = ANIMAL_CONFIGS.find((c) => c.type === type);
  if (!cfg) throw new Error(`未知动物类型: ${type}`);
  return cfg;
}
