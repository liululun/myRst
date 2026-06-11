export type ZoneShare = Record<string, number>;

export interface RunRecord {
  id: number;
  date: string;
  weekday: string;
  is_weekend: boolean;
  duration_min: number;
  distance_km: number | null;
  calories_kcal: number | null;
  pace: number | null;
  hr_avg: number | null;
  hr_min: number | null;
  hr_max: number | null;
  zone: ZoneShare;
  weighed: boolean;
  weighed_date: string | null;
  weighed_value: number | null;
}

export interface Summary {
  count: number;
  date_range: string;
  weekend_pct: number;
  total_distance: number;
  total_calories: number;
  avg_pace: number;
  weighed_pct: number;
  avg_zone: Record<string, number>;
}
