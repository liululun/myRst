import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from "chart.js";
import type { RunRecord } from "../types";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

interface Props {
  rows: RunRecord[];
}

export default function PaceLineChart({ rows }: Props) {
  const withPace = rows.filter((r) => r.pace != null);
  return (
    <div className="chart-card">
      <h3>配速趋势（分钟/公里，按时间顺序，数值越低越快）</h3>
      <Line
        data={{
          labels: withPace.map((r) => r.date),
          datasets: [
            {
              label: "配速 (分钟/公里)",
              data: withPace.map((r) => r.pace),
              borderColor: "#38bdf8",
              backgroundColor: "rgba(56,189,248,0.15)",
              fill: true,
              tension: 0.25,
              pointRadius: 1.5,
            },
          ],
        }}
        options={{
          scales: {
            x: { ticks: { maxTicksLimit: 12, maxRotation: 60 } },
            y: { reverse: true, title: { display: true, text: "分钟/公里" } },
          },
          plugins: { legend: { display: false } },
        }}
      />
    </div>
  );
}
