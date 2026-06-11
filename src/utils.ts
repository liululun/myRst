import { ZONE_NAMES } from "./constants";
import type { RunRecord, Summary } from "./types";

export function computeSummary(rows: RunRecord[]): Summary | null {
  const n = rows.length;
  if (!n) return null;
  const withDist = rows.filter((r) => r.distance_km != null);
  const withCal = rows.filter((r) => r.calories_kcal != null);
  const withPace = rows.filter((r) => r.pace != null);
  const weekendN = rows.filter((r) => r.is_weekend).length;
  const weighedN = rows.filter((r) => r.weighed).length;
  const avgZone: Record<string, number> = {};
  ZONE_NAMES.forEach((z) => {
    avgZone[z] = rows.reduce((s, r) => s + (r.zone[z] || 0), 0) / n;
  });
  return {
    count: n,
    date_range: rows[0].date + " ~ " + rows[n - 1].date,
    weekend_pct: +((weekendN / n) * 100).toFixed(1),
    total_distance: +withDist.reduce((s, r) => s + (r.distance_km ?? 0), 0).toFixed(1),
    total_calories: Math.round(withCal.reduce((s, r) => s + (r.calories_kcal ?? 0), 0)),
    avg_pace: withPace.length
      ? +(withPace.reduce((s, r) => s + (r.pace ?? 0), 0) / withPace.length).toFixed(2)
      : 0,
    weighed_pct: +((weighedN / n) * 100).toFixed(1),
    avg_zone: Object.fromEntries(ZONE_NAMES.map((z) => [z, +avgZone[z].toFixed(1)])),
  };
}
