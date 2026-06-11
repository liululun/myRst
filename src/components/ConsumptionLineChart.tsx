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

export default function ConsumptionLineChart({ rows }: Props) {
  const withCons = rows.filter((r) => r.distance_km != null && r.calories_kcal != null);
  return (
    <div className="chart-card wide">
      <h3>单次跑步距离与消耗热量（按时间顺序）</h3>
      <Line
        data={{
          labels: withCons.map((r) => r.date),
          datasets: [
            {
              label: "距离 (km)",
              data: withCons.map((r) => r.distance_km),
              borderColor: "#1d3557",
              backgroundColor: "rgba(29,53,87,0.15)",
              yAxisID: "y",
              tension: 0.2,
              pointRadius: 1.5,
            },
            {
              label: "消耗热量 (kcal)",
              data: withCons.map((r) => r.calories_kcal),
              borderColor: "#e63946",
              backgroundColor: "rgba(230,57,70,0.1)",
              yAxisID: "y1",
              tension: 0.2,
              pointRadius: 1.5,
            },
          ],
        }}
        options={{
          interaction: { mode: "index", intersect: false },
          scales: {
            x: { ticks: { maxTicksLimit: 20, maxRotation: 60 } },
            y: { type: "linear", position: "left", title: { display: true, text: "距离 (km)" } },
            y1: {
              type: "linear",
              position: "right",
              title: { display: true, text: "消耗热量 (kcal)" },
              grid: { drawOnChartArea: false },
            },
          },
        }}
      />
    </div>
  );
}
