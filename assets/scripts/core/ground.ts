import type { GameData, Point } from './types.ts';

export function distance(a: Point, b: Point): number {
  return Math.hypot(a[0] - b[0], a[1] - b[1]);
}

export function isPoint(value: unknown): value is Point {
  return Array.isArray(value) && value.length === 2 && value.every(n => typeof n === 'number' && Number.isFinite(n));
}

/** Core coordinates are always the 750 × 1334 design space, independent of viewport height. */
export function isOnGround(d: GameData, home: Point): boolean {
  const { center, wall, ground } = d.nest;
  return isPoint(home) && home[0] >= ground.x[0] && home[0] <= ground.x[1]
    && home[1] <= ground.bottom && distance(home, center) <= wall - ground.inset + 1e-7;
}

/** Clamp to the intersection of the ground circle, horizontal limits, and bottom edge. */
export function clampHome(d: GameData, home: Point): Point {
  const { center, wall, ground } = d.nest;
  const source = isPoint(home) ? home : center;
  let x = Math.min(ground.x[1], Math.max(ground.x[0], source[0]));
  let y = Math.min(ground.bottom, source[1]);
  const dx = x - center[0], dy = y - center[1];
  const length = Math.hypot(dx, dy), radius = wall - ground.inset;
  if (length > radius) { x = center[0] + dx / length * radius; y = center[1] + dy / length * radius; }
  return [x, y];
}
