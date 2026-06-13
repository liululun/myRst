import { EVENTS, YEARS } from "../data/scenario";

interface EventLogProps {
  progress: number;
  onSeek: (progress: number) => void;
}

export default function EventLog({ progress, onSeek }: EventLogProps) {
  const idx = Math.floor(progress);
  const frac = progress - idx;
  const activeYear = frac < 0.5 ? YEARS[idx] : YEARS[Math.min(idx + 1, YEARS.length - 1)];

  return (
    <div className="event-log">
      <h3>历史事件</h3>
      <ul>
        {EVENTS.map((event) => {
          const yearIndex = YEARS.indexOf(event.year);
          return (
            <li
              key={event.year}
              className={event.year === activeYear ? "event-item active" : "event-item"}
              onClick={() => onSeek(yearIndex)}
            >
              <span className="event-year">{event.year}</span>
              <span className="event-description">{event.description}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
