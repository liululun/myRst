import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import { ZONE_COLORS, ZONE_NAMES } from "../constants";
import type { RunRecord } from "../types";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

interface Props {
  rows: RunRecord[];
}

export default function ZoneStackChart({ rows }: Props) {
  return (
    <div className="chart-card wide">
      <h3>每次跑步心率区间占比（按时间顺序，可横向滚动查看，共 {rows.length} 次）</h3>
      <div className="zone-stack-scroll">
        <div className="zone-stack-inner">
          <Bar
            data={{
              labels: rows.map((r) => r.date),
              datasets: ZONE_NAMES.map((z) => ({
                label: z,
                data: rows.map((r) => r.zone[z] || 0),
                backgroundColor: ZONE_COLORS[z],
                stack: "zone",
              })),
            }}
            options={{
              maintainAspectRatio: false,
              scales: {
                x: { stacked: true, ticks: { maxRotation: 70, autoSkip: false, font: { size: 9 } } },
                y: { stacked: true, max: 100, title: { display: true, text: "占比 (%)" } },
              },
              plugins: { legend: { position: "bottom" } },
            }}
          />
        </div>
      </div>
    </div>
  );
}
