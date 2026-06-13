import { useEffect, useRef, useState } from "react";
import "./savannah.css";
import { ANIMAL_CONFIGS, configFor } from "./animalConfig";
import { createAnimals, updateAnimals } from "./simulation";
import { drawScene, findAnimalAt } from "./scene";
import type { Animal } from "./types";

function SavannahPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const animalsRef = useRef<Animal[]>(createAnimals());
  const sizeRef = useRef({ width: 0, height: 0 });
  const hoveredRef = useRef<Animal | null>(null);
  const duskTargetRef = useRef(0);

  const [dusk, setDusk] = useState(false);
  const [selected, setSelected] = useState<Animal | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    duskTargetRef.current = dusk ? 1 : 0;
  }, [dusk]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      wrapRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      // canvas 是替换元素，position:absolute 等方式无法用 inset 撑满父容器
      // （全屏时会回退到内部画布缓冲区尺寸），因此直接按父容器尺寸设置内联样式
      const rect = wrap.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      sizeRef.current = { width: rect.width, height: rect.height };
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const ro = new ResizeObserver(resize);
    ro.observe(wrap);

    const handleFullscreenChange = () => {
      setIsFullscreen(document.fullscreenElement === wrapRef.current);
      // 全屏切换后立即重排，部分浏览器在过渡完成前 ResizeObserver 不会触发
      requestAnimationFrame(resize);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);

    let duskValue = duskTargetRef.current;
    let last = performance.now();
    let frameId = 0;

    const loop = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.1);
      last = now;
      const time = now / 1000;

      duskValue += (duskTargetRef.current - duskValue) * Math.min(dt * 1.5, 1);

      updateAnimals(animalsRef.current, dt, time);

      const { width, height } = sizeRef.current;
      if (width > 0 && height > 0) {
        drawScene(ctx, width, height, time, duskValue, animalsRef.current, hoveredRef.current?.id ?? null);
      }

      frameId = requestAnimationFrame(loop);
    };
    frameId = requestAnimationFrame(loop);

    const handleMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const px = e.clientX - rect.left;
      const py = e.clientY - rect.top;
      const hit = findAnimalAt(
        animalsRef.current,
        px,
        py,
        sizeRef.current.width,
        sizeRef.current.height,
        performance.now() / 1000,
      );
      hoveredRef.current = hit;
      canvas.style.cursor = hit ? "pointer" : "default";
    };

    const handleLeave = () => {
      hoveredRef.current = null;
      canvas.style.cursor = "default";
    };

    const handleClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const px = e.clientX - rect.left;
      const py = e.clientY - rect.top;
      const hit = findAnimalAt(
        animalsRef.current,
        px,
        py,
        sizeRef.current.width,
        sizeRef.current.height,
        performance.now() / 1000,
      );
      setSelected(hit);
    };

    canvas.addEventListener("mousemove", handleMove);
    canvas.addEventListener("mouseleave", handleLeave);
    canvas.addEventListener("click", handleClick);

    return () => {
      cancelAnimationFrame(frameId);
      ro.disconnect();
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      canvas.removeEventListener("mousemove", handleMove);
      canvas.removeEventListener("mouseleave", handleLeave);
      canvas.removeEventListener("click", handleClick);
    };
  }, []);

  const selectedConfig = selected ? configFor(selected.type) : null;

  return (
    <div className="savannah-page">
      <header className="savannah-header">
        <h1>非洲大草原动画</h1>
        <p>
          斑马、角马、水牛、羚羊在草原上自由迁徙；大象与长颈鹿悠然漫步，不参与捕猎；狮子与鬣狗则会伺机锁定并追逐猎物。
          点击画面中的动物可查看介绍。
        </p>
        <div className="savannah-controls">
          <button className={dusk ? "" : "active"} onClick={() => setDusk(false)}>
            白天
          </button>
          <button className={dusk ? "active" : ""} onClick={() => setDusk(true)}>
            黄昏
          </button>
        </div>
      </header>

      <div className="savannah-canvas-wrap" ref={wrapRef}>
        <canvas ref={canvasRef} className="savannah-canvas" />
        <button className="fullscreen-btn" onClick={toggleFullscreen}>
          {isFullscreen ? "退出全屏" : "全屏"}
        </button>
        {selectedConfig && (
          <div className="savannah-info-panel">
            <button className="close-btn" onClick={() => setSelected(null)} aria-label="关闭">
              ×
            </button>
            <div className="info-title">
              <span className="info-emoji">{selectedConfig.emoji}</span>
              <span>{selectedConfig.label}</span>
            </div>
            <p>{selectedConfig.description}</p>
          </div>
        )}
      </div>

      <footer className="savannah-legend">
        {ANIMAL_CONFIGS.map((cfg) => (
          <span className="legend-item" key={cfg.type}>
            <span className="legend-emoji">{cfg.emoji}</span>
            {cfg.label}
          </span>
        ))}
      </footer>
    </div>
  );
}

export default SavannahPage;
