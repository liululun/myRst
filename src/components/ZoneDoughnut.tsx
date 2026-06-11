import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { ZONE_COLORS, ZONE_NAMES } from "../constants";
import type { Summary } from "../types";

ChartJS.register(ArcElement, Tooltip, Legend);

interface Props {
  summary: Summary;
}

export default function ZoneDoughnut({ summary }: Props) {
  return (
    <div className="chart-card">
      <h3>心率区间平均占比</h3>
      <Doughnut
        data={{
          labels: ZONE_NAMES,
          datasets: [
            {
              data: ZONE_NAMES.map((z) => summary.avg_zone[z]),
              backgroundColor: ZONE_NAMES.map((z) => ZONE_COLORS[z]),
              borderColor: "#1e293b",
              borderWidth: 2,
            },
          ],
        }}
        options={{ plugins: { legend: { position: "bottom" } }, cutout: "60%" }}
      />
    </div>
  );
}
