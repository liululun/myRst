import { useEffect, useMemo, useRef, useState } from "react";
import "./historical-map.css";
import MapView from "./components/MapView";
import TimelineControls from "./components/TimelineControls";
import Legend from "./components/Legend";
import EventLog from "./components/EventLog";
import { YEARS } from "./data/scenario";
import { precomputeAllDelays } from "./utils/animation";

// 完整播放一遍时间轴所需的秒数（速度为 1x 时）
const PLAY_DURATION_SECONDS = 18;

function HistoricalMapPage() {
  const delays = useMemo(() => precomputeAllDelays(), []);
  const maxProgress = YEARS.length - 1;

  const [progress, setProgress] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);

  const lastTimeRef = useRef<number | null>(null);

  useEffect(() => {
    if (!playing) {
      lastTimeRef.current = null;
      return;
    }

    let frameId: number;
    const step = (time: number) => {
      if (lastTimeRef.current !== null) {
        const dt = (time - lastTimeRef.current) / 1000;
        setProgress((prev) => {
          const next = prev + (dt * speed * maxProgress) / PLAY_DURATION_SECONDS;
          if (next >= maxProgress) {
            setPlaying(false);
            return maxProgress;
          }
          return next;
        });
      }
      lastTimeRef.current = time;
      frameId = requestAnimationFrame(step);
    };
    frameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frameId);
  }, [playing, speed, maxProgress]);

  const handleTogglePlay = () => {
    if (!playing && progress >= maxProgress) {
      setProgress(0);
    }
    setPlaying((p) => !p);
  };

  const handleSeek = (value: number) => {
    setPlaying(false);
    setProgress(value);
  };

  return (
    <div className="hm-page">
      <header className="hm-header">
        <h1>历史版图变迁动画演示</h1>
        <p>基于 React + OpenLayers 的矢量地图动画渐变示例：拖动时间轴或点击事件，观察国家的诞生、灭亡、吞并与分裂。</p>
      </header>

      <div className="hm-body">
        <MapView progress={progress} delays={delays} />

        <aside className="sidebar">
          <Legend progress={progress} />
          <EventLog progress={progress} onSeek={handleSeek} />
        </aside>
      </div>

      <TimelineControls
        progress={progress}
        playing={playing}
        speed={speed}
        onSeek={handleSeek}
        onTogglePlay={handleTogglePlay}
        onSpeedChange={setSpeed}
      />
    </div>
  );
}

export default HistoricalMapPage;
