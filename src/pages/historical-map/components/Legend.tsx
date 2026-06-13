import { useMemo } from "react";
import { COLS, ROWS, YEARS, ownerAt, colorFor, nameFor, UNCLAIMED } from "../data/scenario";

interface LegendProps {
  progress: number;
}

export default function Legend({ progress }: LegendProps) {
  const idx = Math.floor(progress);
  const frac = progress - idx;
  // 过渡过半后，图例切换为目标年份的版图
  const displayYear = frac < 0.5 ? YEARS[idx] : YEARS[Math.min(idx + 1, YEARS.length - 1)];

  const owners = useMemo(() => {
    const ids = new Set<string>();
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        ids.add(ownerAt(displayYear, col, row));
      }
    }
    return [...ids].sort((a, b) => (a === UNCLAIMED ? 1 : b === UNCLAIMED ? -1 : a.localeCompare(b)));
  }, [displayYear]);

  return (
    <div className="legend">
      <h3>{displayYear} 年版图</h3>
      <ul>
        {owners.map((id) => (
          <li key={id}>
            <span className="legend-swatch" style={{ backgroundColor: colorFor(id) }} />
            {nameFor(id)}
          </li>
        ))}
      </ul>
    </div>
  );
}
