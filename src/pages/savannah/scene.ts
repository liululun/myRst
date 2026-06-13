import { configFor } from "./animalConfig";
import { GROUND_TOP, GROUND_BOTTOM } from "./simulation";
import type { Animal } from "./types";

/** 画布参考高度，用于让各元素尺寸随屏幕大小等比缩放 */
const REF_HEIGHT = 760;

type RGB = [number, number, number];

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function lerpColor(c1: RGB, c2: RGB, t: number): string {
  const r = Math.round(lerp(c1[0], c2[0], t));
  const g = Math.round(lerp(c1[1], c2[1], t));
  const b = Math.round(lerp(c1[2], c2[2], t));
  return `rgb(${r}, ${g}, ${b})`;
}

interface Cloud {
  x: number;
  y: number;
  scale: number;
  speed: number;
}

const CLOUDS: Cloud[] = [
  { x: 0.08, y: 0.07, scale: 1.3, speed: 0.006 },
  { x: 0.38, y: 0.04, scale: 0.9, speed: 0.004 },
  { x: 0.62, y: 0.1, scale: 1.5, speed: 0.0075 },
  { x: 0.85, y: 0.05, scale: 1.0, speed: 0.005 },
];

interface Tree {
  x: number;
  scale: number;
}

const TREES: Tree[] = [
  { x: 0.06, scale: 0.75 },
  { x: 0.2, scale: 1.05 },
  { x: 0.46, scale: 0.65 },
  { x: 0.62, scale: 1.0 },
  { x: 0.92, scale: 0.85 },
];

interface GrassBlade {
  x: number;
  yOffset: number;
  height: number;
  seed: number;
}

const GRASS_BLADES: GrassBlade[] = Array.from({ length: 70 }, (_, i) => ({
  x: (i * 0.0173) % 1,
  yOffset: ((i * 37) % 100) / 100,
  height: 6 + (i % 5) * 2,
  seed: i,
}));

interface FrontTuft {
  x: number;
  scale: number;
}

const FRONT_TUFTS: FrontTuft[] = [
  { x: 0.04, scale: 1.2 },
  { x: 0.22, scale: 0.9 },
  { x: 0.42, scale: 1.4 },
  { x: 0.6, scale: 1.0 },
  { x: 0.8, scale: 1.3 },
  { x: 0.97, scale: 1.1 },
];

function drawCloud(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number, opacity: number): void {
  ctx.save();
  ctx.globalAlpha = opacity;
  ctx.fillStyle = "#ffffff";
  const r = 22 * scale;
  ctx.beginPath();
  ctx.ellipse(x, y, r * 1.6, r * 0.8, 0, 0, Math.PI * 2);
  ctx.ellipse(x - r * 1.1, y + r * 0.2, r, r * 0.6, 0, 0, Math.PI * 2);
  ctx.ellipse(x + r * 1.1, y + r * 0.15, r * 1.1, r * 0.65, 0, 0, Math.PI * 2);
  ctx.ellipse(x + r * 0.2, y - r * 0.35, r * 0.9, r * 0.6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawAcaciaTree(ctx: CanvasRenderingContext2D, x: number, baseY: number, scale: number, color: string): void {
  ctx.save();
  ctx.fillStyle = color;
  const trunkH = 16 * scale;
  const trunkW = 3 * scale;
  ctx.fillRect(x - trunkW / 2, baseY - trunkH, trunkW, trunkH);

  ctx.beginPath();
  ctx.ellipse(x, baseY - trunkH - 4 * scale, 22 * scale, 7 * scale, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(x - 14 * scale, baseY - trunkH - 2 * scale, 12 * scale, 4.5 * scale, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(x + 15 * scale, baseY - trunkH - 1 * scale, 13 * scale, 5 * scale, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawSky(ctx: CanvasRenderingContext2D, w: number, h: number, time: number, dusk: number): void {
  const top = lerpColor([135, 206, 235], [255, 145, 95], dusk);
  const bottom = lerpColor([214, 242, 255], [255, 205, 150], dusk);
  const grad = ctx.createLinearGradient(0, 0, 0, h * GROUND_TOP);
  grad.addColorStop(0, top);
  grad.addColorStop(1, bottom);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h * GROUND_TOP);

  const scale = h / REF_HEIGHT;
  for (const c of CLOUDS) {
    const x = ((c.x + time * c.speed) % 1.3) * w - 0.15 * w;
    const y = c.y * h;
    drawCloud(ctx, x, y, c.scale * scale, 1 - dusk * 0.55);
  }
}

function drawHorizon(ctx: CanvasRenderingContext2D, w: number, h: number, dusk: number): void {
  const horizonY = GROUND_TOP * h;
  const hillColor = lerpColor([196, 180, 94], [150, 92, 84], dusk);
  ctx.fillStyle = hillColor;
  ctx.beginPath();
  ctx.moveTo(0, horizonY);
  ctx.bezierCurveTo(w * 0.25, horizonY - h * 0.02, w * 0.45, horizonY + h * 0.015, w * 0.7, horizonY - h * 0.01);
  ctx.bezierCurveTo(w * 0.85, horizonY - h * 0.02, w * 0.95, horizonY + h * 0.01, w, horizonY);
  ctx.lineTo(w, horizonY + h * 0.04);
  ctx.lineTo(0, horizonY + h * 0.04);
  ctx.closePath();
  ctx.fill();

  const treeColor = lerpColor([54, 66, 40], [72, 48, 54], dusk);
  const scale = h / REF_HEIGHT;
  for (const t of TREES) {
    drawAcaciaTree(ctx, t.x * w, horizonY, t.scale * scale, treeColor);
  }
}

function drawWater(ctx: CanvasRenderingContext2D, w: number, h: number, time: number, dusk: number): void {
  const waterTop = lerpColor([99, 179, 237], [150, 130, 180], dusk);
  const waterBottom = lerpColor([47, 128, 191], [95, 75, 135], dusk);

  // 湖泊
  const lakeCx = 0.76 * w;
  const lakeCy = 0.54 * h;
  const lakeRx = 0.1 * w;
  const lakeRy = 0.035 * h;
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(lakeCx, lakeCy, lakeRx, lakeRy, 0, 0, Math.PI * 2);
  ctx.clip();
  const lakeGrad = ctx.createLinearGradient(0, lakeCy - lakeRy, 0, lakeCy + lakeRy);
  lakeGrad.addColorStop(0, waterTop);
  lakeGrad.addColorStop(1, waterBottom);
  ctx.fillStyle = lakeGrad;
  ctx.fillRect(lakeCx - lakeRx, lakeCy - lakeRy, lakeRx * 2, lakeRy * 2);

  ctx.strokeStyle = "rgba(255,255,255,0.35)";
  ctx.lineWidth = 1.5;
  for (let i = -2; i <= 2; i++) {
    const yy = lakeCy + i * lakeRy * 0.35;
    ctx.beginPath();
    for (let px = lakeCx - lakeRx; px <= lakeCx + lakeRx; px += 4) {
      const wave = Math.sin(px * 0.05 + time * 1.5 + i) * 1.5;
      if (px === lakeCx - lakeRx) ctx.moveTo(px, yy + wave);
      else ctx.lineTo(px, yy + wave);
    }
    ctx.stroke();
  }
  ctx.restore();

  // 河流
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(0, h * 0.58);
  ctx.bezierCurveTo(w * 0.12, h * 0.62, w * 0.05, h * 0.78, w * 0.18, h);
  ctx.lineTo(w * 0.34, h);
  ctx.bezierCurveTo(w * 0.2, h * 0.8, w * 0.28, h * 0.64, w * 0.16, h * 0.5);
  ctx.closePath();
  ctx.clip();

  const riverGrad = ctx.createLinearGradient(0, h * 0.5, 0, h);
  riverGrad.addColorStop(0, waterTop);
  riverGrad.addColorStop(1, waterBottom);
  ctx.fillStyle = riverGrad;
  ctx.fillRect(0, h * 0.45, w * 0.4, h * 0.6);

  ctx.strokeStyle = "rgba(255,255,255,0.4)";
  ctx.lineWidth = 2;
  ctx.setLineDash([10, 14]);
  ctx.lineDashOffset = -time * 30;
  ctx.beginPath();
  ctx.moveTo(w * 0.05, h * 0.6);
  ctx.bezierCurveTo(w * 0.1, h * 0.7, w * 0.15, h * 0.85, w * 0.24, h * 1.0);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();
}

function drawGrassField(ctx: CanvasRenderingContext2D, w: number, h: number, time: number, dusk: number): void {
  const groundY = GROUND_TOP * h;
  const top = lerpColor([158, 196, 90], [196, 160, 112], dusk);
  const bottom = lerpColor([74, 140, 58], [120, 92, 72], dusk);
  const grad = ctx.createLinearGradient(0, groundY, 0, h);
  grad.addColorStop(0, top);
  grad.addColorStop(1, bottom);
  ctx.fillStyle = grad;
  ctx.fillRect(0, groundY, w, h - groundY);

  ctx.strokeStyle = "rgba(255,255,255,0.18)";
  ctx.lineWidth = 1.5;
  for (const blade of GRASS_BLADES) {
    const x = blade.x * w;
    const y = groundY + blade.yOffset * (h - groundY);
    const sway = Math.sin(time * 1.4 + blade.seed) * 3;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.quadraticCurveTo(x + sway, y - blade.height, x + sway * 1.5, y - blade.height * 1.8);
    ctx.stroke();
  }
}

function drawForegroundGrass(ctx: CanvasRenderingContext2D, w: number, h: number, time: number): void {
  const scale = h / REF_HEIGHT;
  for (const tuft of FRONT_TUFTS) {
    const x = tuft.x * w;
    const baseY = h;
    const s = tuft.scale * scale;
    ctx.save();
    ctx.fillStyle = "#2f5d2a";
    for (let i = -2; i <= 2; i++) {
      const sway = Math.sin(time * 1.2 + tuft.x * 10 + i) * 4;
      ctx.beginPath();
      ctx.moveTo(x + i * 8 * s, baseY);
      ctx.quadraticCurveTo(x + i * 8 * s + sway, baseY - 40 * s, x + i * 8 * s + sway * 1.5, baseY - 70 * s);
      ctx.quadraticCurveTo(x + i * 8 * s + sway * 0.6, baseY - 40 * s, x + i * 8 * s + 6 * s, baseY);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }
}

/** 计算动物在画布上的绘制尺寸（px），随景深和屏幕高度缩放 */
export function animalSize(a: Animal, h: number): number {
  const cfg = configFor(a.type);
  const depth = (a.y - GROUND_TOP) / (GROUND_BOTTOM - GROUND_TOP);
  const depthScale = 0.6 + 0.5 * Math.min(Math.max(depth, 0), 1);
  return cfg.size * depthScale * (h / REF_HEIGHT);
}

function drawAnimal(ctx: CanvasRenderingContext2D, a: Animal, w: number, h: number, hovered: boolean): void {
  const cfg = configFor(a.type);
  const size = animalSize(a, h);
  const x = a.x * w;
  const y = a.y * h;

  // 投影
  ctx.save();
  ctx.fillStyle = "rgba(0,0,0,0.18)";
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.32, size * 0.38, size * 0.1, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  if (hovered) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, size * 0.62, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,255,255,0.28)";
    ctx.fill();
    ctx.restore();
  }

  // 主体：emoji 根据移动方向水平翻转
  ctx.save();
  ctx.translate(x, y);
  const flip = a.dirX >= 0 ? -1 : 1;
  ctx.scale(flip, 1);
  ctx.font = `${size}px "Segoe UI Emoji", "Noto Color Emoji", sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(cfg.emoji, 0, 0);
  ctx.restore();

  // 奔跑 / 逃跑时的速度线
  if (a.state !== "wander") {
    ctx.save();
    ctx.strokeStyle = "rgba(255,255,255,0.55)";
    ctx.lineWidth = 2;
    for (let i = 0; i < 3; i++) {
      const off = size * (0.55 + i * 0.15);
      const lineY = y - size * 0.15 + i * size * 0.12;
      ctx.beginPath();
      ctx.moveTo(x - a.dirX * off, lineY);
      ctx.lineTo(x - a.dirX * (off + size * 0.18), lineY);
      ctx.stroke();
    }
    ctx.restore();
  }

  if (hovered) {
    ctx.save();
    ctx.font = "13px sans-serif";
    ctx.textAlign = "center";
    const label = cfg.label;
    const labelY = y - size * 0.62;
    const padding = 6;
    const textWidth = ctx.measureText(label).width;
    ctx.fillStyle = "rgba(0,0,0,0.7)";
    ctx.fillRect(x - textWidth / 2 - padding, labelY - 18, textWidth + padding * 2, 20);
    ctx.fillStyle = "#fff";
    ctx.fillText(label, x, labelY - 8);
    ctx.restore();
  }
}

export function drawScene(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  time: number,
  dusk: number,
  animals: Animal[],
  hoveredId: number | null,
): void {
  ctx.clearRect(0, 0, w, h);

  drawSky(ctx, w, h, time, dusk);
  drawHorizon(ctx, w, h, dusk);
  drawGrassField(ctx, w, h, time, dusk);
  drawWater(ctx, w, h, time, dusk);

  const visible = animals.filter((a) => a.hiddenUntil <= time);
  visible.sort((a, b) => a.y - b.y);
  for (const a of visible) {
    drawAnimal(ctx, a, w, h, a.id === hoveredId);
  }

  drawForegroundGrass(ctx, w, h, time);
}

/** 根据像素坐标查找命中的动物（用于鼠标悬停/点击） */
export function findAnimalAt(
  animals: Animal[],
  px: number,
  py: number,
  w: number,
  h: number,
  time: number,
): Animal | null {
  let found: Animal | null = null;
  let minDist = Infinity;
  for (const a of animals) {
    if (a.hiddenUntil > time) continue;
    const size = animalSize(a, h);
    const dist = Math.hypot(px - a.x * w, py - a.y * h);
    if (dist < size * 0.6 && dist < minDist) {
      minDist = dist;
      found = a;
    }
  }
  return found;
}
