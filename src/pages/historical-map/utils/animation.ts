import { COLS, ROWS, YEARS, ownerAt, colorFor, UNCLAIMED } from "../data/scenario";
import { clamp, easeInOut, lerpColor } from "./color";

/** 渐变窗口宽度（占整段过渡时间的比例） */
const FADE_WINDOW = 0.4;

export type DelayGrid = (number | null)[][];

/**
 * 计算某一段时间过渡（yearA -> yearB）中，每个格子开始变色的延迟系数（0~1）。
 *
 * 规则：
 *  - 归属不变的格子记为 null（不参与渐变）；
 *  - 归属变化的格子按"新归属国在过渡开始前已拥有的领土"为起点，
 *    取到最近的已拥有格子的切比雪夫距离作为延迟基准——
 *    距离越近越先变色，从而形成"颜色从交界处开始扩散"的效果；
 *  - 如果新归属国在过渡开始前完全不存在（如新国家诞生、无主之地崛起），
 *    则以变化区域自身的几何中心为扩散原点。
 */
export function computeTransitionDelays(yearA: number, yearB: number): DelayGrid {
  const delays: DelayGrid = Array.from({ length: ROWS }, () => Array<number | null>(COLS).fill(null));
  if (yearA === yearB) return delays;

  // 按新归属国分组，收集变化的格子
  const changedByOwner = new Map<string, { col: number; row: number }[]>();

  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const ownerA = ownerAt(yearA, col, row);
      const ownerB = ownerAt(yearB, col, row);
      if (ownerA === ownerB) continue;
      if (ownerB === UNCLAIMED) continue;
      if (!changedByOwner.has(ownerB)) changedByOwner.set(ownerB, []);
      changedByOwner.get(ownerB)!.push({ col, row });
    }
  }

  for (const [ownerB, cells] of changedByOwner) {
    // 该国在过渡开始前已经拥有的格子，作为扩散起点
    const origins: { col: number; row: number }[] = [];
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        if (ownerAt(yearA, col, row) === ownerB) origins.push({ col, row });
      }
    }

    let rawDelays: number[];
    if (origins.length === 0) {
      // 全新国家：从变化区域的几何中心向外扩散
      const cx = cells.reduce((sum, c) => sum + c.col, 0) / cells.length;
      const cy = cells.reduce((sum, c) => sum + c.row, 0) / cells.length;
      rawDelays = cells.map((c) => Math.hypot(c.col - cx, c.row - cy));
    } else {
      rawDelays = cells.map((c) =>
        Math.min(...origins.map((o) => Math.max(Math.abs(c.col - o.col), Math.abs(c.row - o.row)))),
      );
    }

    const maxDelay = Math.max(...rawDelays, 0);
    cells.forEach((c, i) => {
      delays[c.row][c.col] = maxDelay > 0 ? rawDelays[i] / maxDelay : 0;
    });
  }

  return delays;
}

/** 预计算时间轴上每一段过渡的延迟矩阵 */
export function precomputeAllDelays(): DelayGrid[] {
  const result: DelayGrid[] = [];
  for (let i = 0; i < YEARS.length - 1; i++) {
    result.push(computeTransitionDelays(YEARS[i], YEARS[i + 1]));
  }
  return result;
}

/**
 * 根据连续的时间轴进度（0 ~ YEARS.length-1），计算某个格子当前应显示的颜色。
 */
export function getCellColor(col: number, row: number, progress: number, delays: DelayGrid[]): string {
  const maxIndex = YEARS.length - 1;
  const idx = clamp(Math.floor(progress), 0, maxIndex - 1);
  const frac = clamp(progress - idx, 0, 1);

  if (progress >= maxIndex || frac === 0) {
    const year = YEARS[clamp(Math.round(progress), 0, maxIndex)];
    return colorFor(ownerAt(year, col, row));
  }

  const yearA = YEARS[idx];
  const yearB = YEARS[idx + 1];
  const ownerA = ownerAt(yearA, col, row);
  const ownerB = ownerAt(yearB, col, row);
  if (ownerA === ownerB) return colorFor(ownerA);

  const delay = delays[idx]?.[row]?.[col] ?? 0;
  const start = delay * (1 - FADE_WINDOW);
  const cellT = clamp((frac - start) / FADE_WINDOW, 0, 1);
  return lerpColor(colorFor(ownerA), colorFor(ownerB), easeInOut(cellT));
}
