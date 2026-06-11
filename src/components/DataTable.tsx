import { useMemo, useState } from "react";
import { COLUMN_COLORS, ZONE_COLORS, ZONE_NAMES } from "../constants";
import type { RunRecord, ZoneShare } from "../types";

interface Props {
  rows: RunRecord[];
}

type SortKey =
  | "date"
  | "weekday"
  | "duration_min"
  | "distance_km"
  | "calories_kcal"
  | "pace"
  | "hr_avg"
  | "hr_max"
  | "zone"
  | "weighed_value";

const COLUMNS: { key: SortKey; label: string }[] = [
  { key: "date", label: "日期" },
  { key: "weekday", label: "星期" },
  { key: "duration_min", label: "时长(分)" },
  { key: "distance_km", label: "距离(km)" },
  { key: "calories_kcal", label: "消耗(kcal)" },
  { key: "pace", label: "配速(分/km)" },
  { key: "hr_avg", label: "平均心率" },
  { key: "hr_max", label: "最高心率" },
  { key: "zone", label: "心率区间分布" },
  { key: "weighed_value", label: "跑后体重(kg)" },
];

type ColumnRanges = Record<string, [number, number] | null>;

function computeColumnRanges(rows: RunRecord[]): ColumnRanges {
  const ranges: ColumnRanges = {};
  for (const key of Object.keys(COLUMN_COLORS)) {
    const vals = rows
      .map((r) => r[key as keyof RunRecord] as number | null)
      .filter((v): v is number => v != null);
    ranges[key] = vals.length ? [Math.min(...vals), Math.max(...vals)] : null;
  }
  return ranges;
}

function TieredCell({ colKey, value, ranges }: { colKey: string; value: number | null; ranges: ColumnRanges }) {
  const range = ranges[colKey];
  if (value == null || !range || range[1] === range[0]) {
    return <td>{value ?? "-"}</td>;
  }
  const t = (value - range[0]) / (range[1] - range[0]);
  const alpha = (0.12 + t * 0.45).toFixed(2);
  return (
    <td
      style={{
        background: `rgba(${COLUMN_COLORS[colKey]}, ${alpha})`,
        borderRadius: 6,
        fontWeight: t > 0.66 ? 600 : 400,
      }}
    >
      {value}
    </td>
  );
}

function ZoneBar({ zone }: { zone: ZoneShare }) {
  return (
    <div className="zone-bar">
      {ZONE_NAMES.map((z) => (
        <span
          key={z}
          style={{ width: `${zone[z] || 0}%`, background: ZONE_COLORS[z] }}
          title={`${z} ${zone[z] || 0}%`}
        />
      ))}
    </div>
  );
}

export default function DataTable({ rows }: Props) {
  const [search, setSearch] = useState("");
  const [weekendFilter, setWeekendFilter] = useState<"all" | "weekend" | "weekday">("all");
  const [weighFilter, setWeighFilter] = useState<"all" | "yes" | "no">("all");
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortAsc, setSortAsc] = useState(true);

  const filteredRows = useMemo(() => {
    const kw = search.trim();
    let result = rows.filter((r) => {
      if (kw && !(r.date.includes(kw) || r.weekday.includes(kw))) return false;
      if (weekendFilter === "weekend" && !r.is_weekend) return false;
      if (weekendFilter === "weekday" && r.is_weekend) return false;
      if (weighFilter === "yes" && !r.weighed) return false;
      if (weighFilter === "no" && r.weighed) return false;
      return true;
    });
    result = result.slice().sort((a, b) => {
      let av: number | string = a[sortKey as keyof RunRecord] as number | string;
      let bv: number | string = b[sortKey as keyof RunRecord] as number | string;
      if (sortKey === "zone") {
        av = a.zone["无氧"] + a.zone["极限"];
        bv = b.zone["无氧"] + b.zone["极限"];
      }
      if (av == null) av = sortAsc ? Infinity : -Infinity;
      if (bv == null) bv = sortAsc ? Infinity : -Infinity;
      if (typeof av === "string") {
        return sortAsc ? av.localeCompare(bv as string) : (bv as string).localeCompare(av);
      }
      return sortAsc ? av - (bv as number) : (bv as number) - av;
    });
    return result;
  }, [rows, search, weekendFilter, weighFilter, sortKey, sortAsc]);

  const ranges = useMemo(() => computeColumnRanges(filteredRows), [filteredRows]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortAsc((v) => !v);
    } else {
      setSortKey(key);
      setSortAsc(true);
    }
  };

  return (
    <div className="table-wrap">
      <div className="table-toolbar">
        <input
          type="text"
          placeholder="搜索日期 / 星期..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={weekendFilter} onChange={(e) => setWeekendFilter(e.target.value as typeof weekendFilter)}>
          <option value="all">全部</option>
          <option value="weekend">仅周末</option>
          <option value="weekday">仅工作日</option>
        </select>
        <select value={weighFilter} onChange={(e) => setWeighFilter(e.target.value as typeof weighFilter)}>
          <option value="all">全部</option>
          <option value="yes">已测量体重</option>
          <option value="no">未测量体重</option>
        </select>
        <span className="count">共 {filteredRows.length} 条</span>
      </div>
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              {COLUMNS.map((c) => (
                <th key={c.key} onClick={() => handleSort(c.key)}>
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredRows.map((r) => (
              <tr key={r.id}>
                <td>{r.date}</td>
                <td>周{r.weekday}</td>
                <TieredCell colKey="duration_min" value={r.duration_min} ranges={ranges} />
                <TieredCell colKey="distance_km" value={r.distance_km} ranges={ranges} />
                <TieredCell colKey="calories_kcal" value={r.calories_kcal} ranges={ranges} />
                <TieredCell colKey="pace" value={r.pace} ranges={ranges} />
                <TieredCell colKey="hr_avg" value={r.hr_avg} ranges={ranges} />
                <td>{r.hr_max ?? "-"}</td>
                <td>
                  <ZoneBar zone={r.zone} />
                </td>
                <td>
                  {r.weighed && r.weighed_value != null ? (
                    <span className="badge yes">{r.weighed_value.toFixed(1)} kg</span>
                  ) : (
                    <span className="badge no">-</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
