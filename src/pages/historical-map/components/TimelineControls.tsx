import { YEARS } from "../data/scenario";

interface TimelineControlsProps {
  progress: number;
  playing: boolean;
  speed: number;
  onSeek: (progress: number) => void;
  onTogglePlay: () => void;
  onSpeedChange: (speed: number) => void;
}

const SPEED_OPTIONS = [0.5, 1, 2, 4];

export default function TimelineControls({
  progress,
  playing,
  speed,
  onSeek,
  onTogglePlay,
  onSpeedChange,
}: TimelineControlsProps) {
  const maxProgress = YEARS.length - 1;
  const idx = Math.floor(progress);
  const frac = progress - idx;
  const yearLabel =
    frac < 0.01 || idx >= maxProgress
      ? `${YEARS[Math.min(idx, maxProgress)]}`
      : `${YEARS[idx]} → ${YEARS[idx + 1]}`;

  return (
    <div className="timeline-controls">
      <button className="play-button" onClick={onTogglePlay}>
        {playing ? "⏸ 暂停" : "▶ 播放"}
      </button>

      <div className="timeline-slider">
        <input
          type="range"
          min={0}
          max={maxProgress}
          step={0.01}
          value={progress}
          onChange={(e) => onSeek(Number(e.target.value))}
        />
        <div className="timeline-ticks">
          {YEARS.map((year) => (
            <span key={year}>{year}</span>
          ))}
        </div>
      </div>

      <div className="current-year">{yearLabel}</div>

      <div className="speed-control">
        <span>速度</span>
        {SPEED_OPTIONS.map((s) => (
          <button
            key={s}
            className={s === speed ? "speed-button active" : "speed-button"}
            onClick={() => onSpeedChange(s)}
          >
            {s}x
          </button>
        ))}
      </div>
    </div>
  );
}
