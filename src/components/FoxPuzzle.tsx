import { useEffect, useState } from "react";

const TOTAL_HOLES = 5;
const CHECK_SEQUENCE = [2, 3, 4, 4, 3, 2];

function neighbors(hole: number): number[] {
  const ns: number[] = [];
  if (hole > 1) ns.push(hole - 1);
  if (hole < TOTAL_HOLES) ns.push(hole + 1);
  return ns;
}

interface DayInfo {
  day: number;
  checkHole: number;
  before: number[];
  afterCheck: number[];
  afterMove: number[];
  found: boolean;
}

const DAYS: DayInfo[] = (() => {
  let possible: number[] = [1, 2, 3, 4, 5];
  return CHECK_SEQUENCE.map((checkHole, idx): DayInfo => {
    const before = possible;
    const afterCheck = before.filter((h) => h !== checkHole);
    const found = afterCheck.length === 0;
    const moveSet = new Set<number>();
    afterCheck.forEach((h) => neighbors(h).forEach((n) => moveSet.add(n)));
    const afterMove = [...moveSet].sort((a, b) => a - b);
    possible = afterMove;
    return { day: idx + 1, checkHole, before, afterCheck, afterMove, found };
  });
})();

type Phase = "before" | "check" | "move";

interface Frame {
  dayIndex: number;
  phase: Phase;
  active: number[];
  moveFrom?: number[];
  moveTo?: number[];
  caption: string;
}

const PHASE_LABEL: Record<Phase, string> = {
  before: "白天 · 选择检查",
  check: "白天 · 检查结果",
  move: "夜晚 · 狐狸移动",
};

const FRAMES: Frame[] = [];
DAYS.forEach((d, dayIndex) => {
  FRAMES.push({
    dayIndex,
    phase: "before",
    active: d.before,
    caption: `第${d.day}天：今天检查 ${d.checkHole} 号洞。此刻狐狸可能藏在 {${d.before.join(", ")}} 中的某一个洞里。`,
  });
  FRAMES.push({
    dayIndex,
    phase: "check",
    active: d.afterCheck,
    caption: d.found
      ? `🎉 第${d.day}天：打开 ${d.checkHole} 号洞——就是它！狐狸被找到了！`
      : `第${d.day}天：${d.checkHole} 号洞里没有狐狸，排除该位置。剩余可能位置 {${d.afterCheck.join(", ")}}。`,
  });
  if (!d.found) {
    FRAMES.push({
      dayIndex,
      phase: "move",
      active: d.afterCheck,
      moveFrom: d.afterCheck,
      moveTo: d.afterMove,
      caption: `夜晚：狐狸会从当前可能的每个洞溜到左右相邻的洞。新的可能位置变为 {${d.afterMove.join(", ")}}。`,
    });
  }
});

const DAY_START_INDEX = DAYS.map((d) => FRAMES.findIndex((f) => f.dayIndex === d.day - 1 && f.phase === "before"));

const HOLE_CENTER = (h: number) => (h - 1) * 20 + 10; // percentage

export default function FoxPuzzle() {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [moveAnimating, setMoveAnimating] = useState(false);

  const frame = FRAMES[step];
  const day = DAYS[frame.dayIndex];
  const isLastFrame = step === FRAMES.length - 1;

  useEffect(() => {
    if (frame.phase !== "move") {
      setMoveAnimating(false);
      return;
    }
    setMoveAnimating(false);
    const raf1 = requestAnimationFrame(() => {
      requestAnimationFrame(() => setMoveAnimating(true));
    });
    return () => cancelAnimationFrame(raf1);
  }, [step, frame.phase]);

  useEffect(() => {
    if (!playing) return;
    if (isLastFrame) {
      setPlaying(false);
      return;
    }
    const delay = frame.phase === "move" ? 2200 : 1600;
    const timer = setTimeout(() => setStep((s) => Math.min(s + 1, FRAMES.length - 1)), delay);
    return () => clearTimeout(timer);
  }, [playing, step, isLastFrame, frame.phase]);

  const goPrev = () => {
    setPlaying(false);
    setStep((s) => Math.max(s - 1, 0));
  };
  const goNext = () => {
    setPlaying(false);
    setStep((s) => Math.min(s + 1, FRAMES.length - 1));
  };
  const reset = () => {
    setPlaying(false);
    setStep(0);
  };
  const togglePlay = () => {
    if (isLastFrame) {
      setStep(0);
      setPlaying(true);
    } else {
      setPlaying((p) => !p);
    }
  };
  const jumpToDay = (dayIdx: number) => {
    setPlaying(false);
    setStep(DAY_START_INDEX[dayIdx]);
  };

  const activeHoles =
    frame.phase === "move" && frame.moveFrom && frame.moveTo
      ? moveAnimating
        ? frame.moveTo
        : frame.moveFrom
      : frame.active;

  const travelers: { from: number; to: number }[] = [];
  if (frame.phase === "move" && frame.moveFrom) {
    frame.moveFrom.forEach((h) => neighbors(h).forEach((n) => travelers.push({ from: h, to: n })));
  }

  return (
    <div className="puzzle">
      <div className="analysis">
        <h3>🦊 智力题：5 个洞里的狐狸</h3>
        <p>
          <b>Q：</b>有并排的 5 个洞，标号分别为 1-5。其中某个洞里有一只狐狸，晚上狐狸会从洞里出来到邻近另一个洞。
          白天可以检查洞里有没有狐狸，每天只能检查一次，每次只能检查 1 个洞。如果让你检查洞，你至少几天可以在洞里找到狐狸？
        </p>
        <div className="puzzle-answer">
          至少需要 <span className="puzzle-answer-num">6</span> 天
        </div>
        <ul>
          <li>狐狸<b>每晚必须移动</b>到相邻洞（不能原地不动）</li>
          <li>利用<b>奇偶性</b>缩小可能位置范围，依次检查 <b>2, 3, 4, 4, 3, 2</b></li>
        </ul>
      </div>

      <div className="puzzle-visual">
        <div className="puzzle-stage">
          {Array.from({ length: TOTAL_HOLES }, (_, i) => i + 1).map((h) => {
            const isChecking = frame.phase === "before" && day.checkHole === h;
            const isFoundHole = frame.phase === "check" && day.found && day.checkHole === h;
            const isEliminatedHole = frame.phase === "check" && !day.found && day.checkHole === h;
            const isPossible = activeHoles.includes(h);

            const classes = ["hole"];
            if (isPossible) classes.push("possible");
            if (isChecking) classes.push("checking");
            if (isEliminatedHole) classes.push("eliminated");
            if (isFoundHole) classes.push("found");

            return (
              <div key={h} className={classes.join(" ")}>
                <div className="hole-circle">
                  {isChecking && <span className="icon magnifier">🔍</span>}
                  {isPossible && <span className="icon fox">🦊</span>}
                  {isFoundHole && <span className="icon fox found-fox">🦊</span>}
                  {isEliminatedHole && <span className="icon cross">✗</span>}
                </div>
                <div className="hole-number">{h} 号洞</div>
              </div>
            );
          })}

          {travelers.map(({ from, to }) => (
            <span
              key={`${step}-${from}-${to}`}
              className="fox-travel"
              style={{
                left: `${HOLE_CENTER(moveAnimating ? to : from)}%`,
                opacity: moveAnimating ? 0 : 1,
              }}
            >
              🦊
            </span>
          ))}
        </div>

        <div className="puzzle-caption">{frame.caption}</div>

        <div className="puzzle-controls">
          <button onClick={reset}>⏮ 重置</button>
          <button onClick={goPrev} disabled={step === 0}>
            ◀ 上一步
          </button>
          <button className="primary" onClick={togglePlay}>
            {playing ? "⏸ 暂停" : isLastFrame ? "🔁 重新播放" : "▶ 播放"}
          </button>
          <button onClick={goNext} disabled={isLastFrame}>
            下一步 ▶
          </button>
          <span className="puzzle-progress">
            第 {day.day} 天 / 共 6 天 · {PHASE_LABEL[frame.phase]}
          </span>
          <div className="puzzle-day-jumps">
            {DAYS.map((d, idx) => (
              <button
                key={d.day}
                className={frame.dayIndex === idx ? "active" : ""}
                onClick={() => jumpToDay(idx)}
              >
                第{d.day}天
              </button>
            ))}
          </div>
        </div>

        <div className="puzzle-legend">
          <span>
            <i className="dot dot-possible" />狐狸可能在这个洞
          </span>
          <span>
            <i className="dot dot-checking" />今天要检查这个洞
          </span>
          <span>
            <i className="dot dot-eliminated" />检查后排除
          </span>
          <span>
            <i className="dot dot-found" />找到狐狸！
          </span>
        </div>
      </div>

      <div className="analysis">
        <h3>结论</h3>
        <p>
          按照 <b>2 → 3 → 4 → 4 → 3 → 2</b> 的顺序检查，无论狐狸初始在哪个洞、每晚如何移动，
          <b>第 6 天必定能找到狐狸</b>。
        </p>
        <p className="puzzle-note">这也是理论下界——少于 6 天无法保证必然找到，因为狐狸总有躲避策略。</p>
      </div>
    </div>
  );
}
