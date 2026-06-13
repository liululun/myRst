import type { CountryDef, TimelineEvent } from "../types";

// 网格大小：列数 x 行数。每个格子代表地图上的一小块领土，
// 真实项目中可以把这个网格替换为从 GeoJSON / Shapefile / PostGIS 加载的真实国界面要素。
export const COLS = 24;
export const ROWS = 16;

export const UNCLAIMED = "unclaimed";
export const UNCLAIMED_COLOR = "#d4d4d8";

export const COUNTRIES: CountryDef[] = [
  { id: "valan", name: "瓦兰国", color: "#3b82f6" },
  { id: "kara", name: "卡拉国", color: "#f59e0b" },
  { id: "seez", name: "塞兹国", color: "#ef4444" },
  { id: "norden", name: "诺登国", color: "#22c55e" },
  { id: "east", name: "伊斯特国", color: "#a855f7" },
  { id: "fria", name: "弗里亚国", color: "#14b8a6" },
];

const COLOR_BY_ID = new Map<string, string>([
  ...COUNTRIES.map((c) => [c.id, c.color] as [string, string]),
  [UNCLAIMED, UNCLAIMED_COLOR],
]);

export function colorFor(ownerId: string): string {
  return COLOR_BY_ID.get(ownerId) ?? "#999999";
}

const NAME_BY_ID = new Map<string, string>([
  ...COUNTRIES.map((c) => [c.id, c.name] as [string, string]),
  [UNCLAIMED, "无主之地"],
]);

export function nameFor(ownerId: string): string {
  return NAME_BY_ID.get(ownerId) ?? ownerId;
}

// 时间轴关键帧（年份）
export const YEARS = [1900, 1910, 1920, 1930, 1940, 1950];

export const EVENTS: TimelineEvent[] = [
  { year: 1900, description: "初始版图：瓦兰、卡拉、塞兹、诺登四国并立，东南角为无主之地" },
  { year: 1910, description: "塞兹国向西扩张，吞并卡拉国北部领土" },
  { year: 1920, description: "瓦兰国吞并卡拉国剩余领土，卡拉国灭亡" },
  { year: 1930, description: "瓦兰国南部领土宣布独立，建立伊斯特国" },
  { year: 1940, description: "无主之地上崛起新兴国家——弗里亚国" },
  { year: 1950, description: "诺登国吞并弗里亚国" },
];

/**
 * 给定年份和格子坐标，返回该格子所属的国家 id。
 * 通过对每个关键帧年份分段定义矩形区域来描述版图演变，
 * 真实项目中应替换为按要素的 owner/year 属性查询实际地理数据。
 */
export function ownerAt(year: number, col: number, row: number): string {
  if (year < 1910) {
    // 1900
    if (col < 8) return "valan";
    if (col < 16) return "kara";
    if (row < 8) return "seez";
    if (row < 14) return "norden";
    return UNCLAIMED;
  }
  if (year < 1920) {
    // 1910：塞兹吞并卡拉北部
    if (col < 8) return "valan";
    if (col < 16) return row < 8 ? "seez" : "kara";
    if (row < 8) return "seez";
    if (row < 14) return "norden";
    return UNCLAIMED;
  }
  if (year < 1930) {
    // 1920：瓦兰吞并卡拉剩余领土，卡拉灭亡
    if (col < 8) return "valan";
    if (col < 16) return row < 8 ? "seez" : "valan";
    if (row < 8) return "seez";
    if (row < 14) return "norden";
    return UNCLAIMED;
  }
  if (year < 1940) {
    // 1930：瓦兰南部分裂出伊斯特
    if (col < 16) {
      if (row < 8) return col < 8 ? "valan" : "seez";
      return "east";
    }
    if (row < 8) return "seez";
    if (row < 14) return "norden";
    return UNCLAIMED;
  }
  if (year < 1950) {
    // 1940：无主之地上出现弗里亚
    if (col < 16) {
      if (row < 8) return col < 8 ? "valan" : "seez";
      return "east";
    }
    if (row < 8) return "seez";
    if (row < 14) return "norden";
    return "fria";
  }
  // 1950：诺登吞并弗里亚
  if (col < 16) {
    if (row < 8) return col < 8 ? "valan" : "seez";
    return "east";
  }
  if (row < 8) return "seez";
  return "norden";
}
