export type AnimalType =
  | "zebra"
  | "buffalo"
  | "wildebeest"
  | "antelope"
  | "elephant"
  | "giraffe"
  | "lion"
  | "hyena";

export type AnimalRole = "prey" | "predator" | "neutral";

export type AnimalState = "wander" | "chase" | "flee";

export interface Animal {
  id: number;
  type: AnimalType;
  role: AnimalRole;
  /** 归一化坐标 0~1 */
  x: number;
  y: number;
  /** 当前朝向，1 表示朝右，-1 表示朝左 */
  dirX: number;
  /** 漫步时的运动角度（弧度） */
  wanderAngle: number;
  /** 当前速度（每秒移动的归一化距离） */
  speed: number;
  state: AnimalState;
  /** 当前状态已持续的时间（秒） */
  stateTimer: number;
  /** 追逐目标的 id（仅肉食动物在 chase 状态时使用） */
  targetId: number | null;
  /** 被捕获后隐藏到该时间点（秒，performance.now()/1000 时间基准） */
  hiddenUntil: number;
}
