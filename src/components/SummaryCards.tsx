import type { Summary } from "../types";

interface Props {
  summary: Summary;
}

export default function SummaryCards({ summary }: Props) {
  const cards = [
    { label: "跑步总次数", value: summary.count + " 次" },
    { label: "时间跨度", value: summary.date_range },
    { label: "周末占比", value: summary.weekend_pct + "%" },
    { label: "累计距离", value: summary.total_distance + " km" },
    { label: "累计消耗", value: summary.total_calories.toLocaleString() + " kcal" },
    { label: "平均配速", value: summary.avg_pace + " 分/km" },
    { label: "跑后测体重比例", value: summary.weighed_pct + "%" },
  ];
  return (
    <div className="cards">
      {cards.map((c) => (
        <div className="card" key={c.label}>
          <div className="label">{c.label}</div>
          <div className="value">{c.value}</div>
        </div>
      ))}
    </div>
  );
}
