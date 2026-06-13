import { ANIMAL_CONFIGS, configFor, type AnimalConfig } from "./animalConfig";
import type { Animal } from "./types";

/** 动物活动区域：地平线到画面底部之间 */
export const GROUND_TOP = 0.45;
export const GROUND_BOTTOM = 0.92;

/** 肉食动物发现猎物并触发追逐的距离阈值 */
const CHASE_TRIGGER_DIST = 0.13;
/** 食草动物察觉天敌并触发逃跑的距离阈值 */
const FLEE_TRIGGER_DIST = 0.16;
/** 群体惊逃的感染范围 */
const PANIC_RADIUS = 0.1;
/** 视为"追上猎物"的距离 */
const CATCH_DIST = 0.025;
/** 单次追逐的最长时间（秒），超过则放弃 */
const CHASE_MAX_DURATION = 10;
/** 猎物被捕获后消失的时长（秒） */
const HIDE_DURATION = 2.5;

let nextId = 0;

export function createAnimals(): Animal[] {
  const animals: Animal[] = [];
  for (const cfg of ANIMAL_CONFIGS) {
    for (let i = 0; i < cfg.count; i++) {
      animals.push({
        id: nextId++,
        type: cfg.type,
        role: cfg.role,
        x: Math.random(),
        y: GROUND_TOP + Math.random() * (GROUND_BOTTOM - GROUND_TOP),
        dirX: Math.random() < 0.5 ? 1 : -1,
        wanderAngle: Math.random() * Math.PI * 2,
        speed: cfg.baseSpeed,
        state: "wander",
        stateTimer: Math.random() * CHASE_MAX_DURATION,
        targetId: null,
        hiddenUntil: 0,
      });
    }
  }
  return animals;
}

export function updateAnimals(animals: Animal[], dt: number, time: number): void {
  for (const a of animals) {
    if (a.hiddenUntil > time) continue;

    const cfg = configFor(a.type);

    if (a.role === "neutral") {
      wander(a, cfg.baseSpeed, dt);
    } else if (a.role === "predator") {
      updatePredator(a, animals, cfg, dt, time);
    } else {
      updatePrey(a, animals, cfg, dt, time);
    }
  }

  for (const a of animals) {
    if (a.hiddenUntil > time) continue;

    // 左右边缘：从对侧重新出现，循环场景
    if (a.x < -0.06) a.x = 1.06;
    if (a.x > 1.06) a.x = -0.06;

    // 上下边缘：限制在草原带内，并反转方向转身返回
    if (a.y < GROUND_TOP) {
      a.y = GROUND_TOP;
      a.wanderAngle = -a.wanderAngle;
    } else if (a.y > GROUND_BOTTOM) {
      a.y = GROUND_BOTTOM;
      a.wanderAngle = -a.wanderAngle;
    }
  }
}

function normalize(dx: number, dy: number): { x: number; y: number } {
  const len = Math.hypot(dx, dy) || 1;
  return { x: dx / len, y: dy / len };
}

/** 漫步：带随机偏移的平滑曲线运动 */
function wander(a: Animal, speed: number, dt: number): void {
  a.wanderAngle += (Math.random() - 0.5) * 3 * dt;
  const dx = Math.cos(a.wanderAngle);
  const dy = Math.sin(a.wanderAngle) * 0.5; // 压扁纵向移动，更贴近地面透视
  a.x += dx * speed * dt;
  a.y += dy * speed * dt;
  a.speed = speed;
  if (Math.abs(dx) > 0.05) a.dirX = dx > 0 ? 1 : -1;
}

/** 朝目标点移动 */
function moveToward(a: Animal, tx: number, ty: number, speed: number, dt: number): void {
  const dir = normalize(tx - a.x, ty - a.y);
  a.x += dir.x * speed * dt;
  a.y += dir.y * speed * dt;
  a.wanderAngle = Math.atan2(dir.y, dir.x);
  a.speed = speed;
  if (Math.abs(dir.x) > 0.02) a.dirX = dir.x > 0 ? 1 : -1;
}

/** 远离某点移动 */
function moveAway(a: Animal, fx: number, fy: number, speed: number, dt: number): void {
  moveToward(a, a.x + (a.x - fx), a.y + (a.y - fy), speed, dt);
}

function updatePredator(a: Animal, animals: Animal[], cfg: AnimalConfig, dt: number, time: number): void {
  a.stateTimer += dt;

  if (a.state === "chase" && a.targetId !== null) {
    const target = animals.find((b) => b.id === a.targetId);
    if (!target || target.hiddenUntil > time) {
      resetToWander(a, cfg, dt);
      return;
    }

    const dist = Math.hypot(target.x - a.x, target.y - a.y);
    if (dist < CATCH_DIST) {
      // 捕获成功：猎物短暂消失后在远处重新出现
      target.hiddenUntil = time + HIDE_DURATION;
      target.x = Math.random();
      target.y = GROUND_TOP + Math.random() * (GROUND_BOTTOM - GROUND_TOP);
      target.state = "wander";
      target.stateTimer = 0;
      resetToWander(a, cfg, dt);
      return;
    }

    if (a.stateTimer > CHASE_MAX_DURATION || dist > CHASE_TRIGGER_DIST * 2.5) {
      resetToWander(a, cfg, dt);
      return;
    }

    moveToward(a, target.x, target.y, cfg.runSpeed, dt);
    return;
  }

  // 漫步状态：寻找附近的猎物
  let nearest: Animal | null = null;
  let nearestDist = Infinity;
  for (const b of animals) {
    if (b.role !== "prey" || b.hiddenUntil > time) continue;
    const dist = Math.hypot(b.x - a.x, b.y - a.y);
    if (dist < nearestDist) {
      nearestDist = dist;
      nearest = b;
    }
  }

  if (nearest && nearestDist < CHASE_TRIGGER_DIST) {
    a.state = "chase";
    a.targetId = nearest.id;
    a.stateTimer = 0;
    moveToward(a, nearest.x, nearest.y, cfg.runSpeed, dt);
    return;
  }

  wander(a, cfg.baseSpeed, dt);
}

function resetToWander(a: Animal, cfg: AnimalConfig, dt: number): void {
  a.state = "wander";
  a.targetId = null;
  a.stateTimer = 0;
  wander(a, cfg.baseSpeed, dt);
}

function updatePrey(a: Animal, animals: Animal[], cfg: AnimalConfig, dt: number, time: number): void {
  a.stateTimer += dt;

  let nearestPredator: Animal | null = null;
  let nearestDist = Infinity;
  for (const b of animals) {
    if (b.role !== "predator" || b.hiddenUntil > time) continue;
    const dist = Math.hypot(b.x - a.x, b.y - a.y);
    if (dist < nearestDist) {
      nearestDist = dist;
      nearestPredator = b;
    }
  }
  const predatorClose = nearestPredator !== null && nearestDist < FLEE_TRIGGER_DIST;

  if (a.state === "flee") {
    if (!predatorClose && a.stateTimer > 1.5) {
      a.state = "wander";
      a.stateTimer = 0;
      wander(a, cfg.baseSpeed, dt);
      return;
    }
    const from = nearestPredator ?? a;
    moveAway(a, from.x, from.y, cfg.runSpeed, dt);
    return;
  }

  if (predatorClose) {
    a.state = "flee";
    a.stateTimer = 0;
    moveAway(a, nearestPredator!.x, nearestPredator!.y, cfg.runSpeed, dt);
    return;
  }

  // 群体惊逃：附近同类受惊时同步逃跑
  for (const b of animals) {
    if (b.id === a.id || b.role !== "prey" || b.state !== "flee" || b.hiddenUntil > time) continue;
    const dist = Math.hypot(b.x - a.x, b.y - a.y);
    if (dist < PANIC_RADIUS) {
      a.state = "flee";
      a.stateTimer = 0;
      moveAway(a, b.x, b.y, cfg.runSpeed, dt);
      return;
    }
  }

  wander(a, cfg.baseSpeed, dt);
}
