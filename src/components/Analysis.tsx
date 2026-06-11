import { ZONE_NAMES } from "../constants";
import type { Summary } from "../types";

interface Props {
  summary: Summary;
  yearLabel: string;
}

export default function Analysis({ summary, yearLabel }: Props) {
  const dominant = ZONE_NAMES.reduce((a, b) => (summary.avg_zone[a] >= summary.avg_zone[b] ? a : b));
  const dominantTip =
    dominant === "无氧" || dominant === "极限"
      ? "整体强度偏高，建议适当穿插低强度恢复跑，避免长期处于高心率区间"
      : dominant === "有氧"
        ? "处于较理想的有氧训练区间，有利于心肺功能与耐力提升"
        : "整体强度偏低，可适当提高配速以获得更好的训练效果";

  return (
    <div className="analysis">
      <h3>数据解读{yearLabel ? `（${yearLabel}）` : ""}</h3>
      <ul>
        <li>
          共识别到 <b>{summary.count}</b> 次跑步（{summary.date_range}），其中{" "}
          <b>{summary.weekend_pct}%</b> 发生在周末，与「跑步通常在周末进行」的经验规律基本吻合；
        </li>
        <li>
          跑步期间心率主要集中在 <b>{dominant}</b> 区间（平均占比 {summary.avg_zone[dominant]}%），
          {dominantTip}；
        </li>
        <li>
          累计跑步 <b>{summary.total_distance}</b> 公里，消耗约{" "}
          <b>{summary.total_calories.toLocaleString()}</b> kcal，平均配速{" "}
          <b>{summary.avg_pace}</b> 分钟/公里；
        </li>
        <li>
          有 <b>{summary.weighed_pct}%</b> 的跑步在当天或次日进行了体重测量，体现出较好的自我量化跟踪习惯。
        </li>
      </ul>
    </div>
  );
}
