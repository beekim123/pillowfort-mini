import type { AnimDef, Facing, L1Module, Mat, PartDef, TrackKey } from './ArtTypes';

/** L1 部件 + 动作的姿势计算，照美术交的 art-code/rig-player.js 改写成纯数据：只算每个部件的变换，不画。 */

export const IDENTITY: Mat = [1, 0, 0, 1, 0, 0];
export const mul = (p: Mat, q: Mat): Mat => [
  p[0] * q[0] + p[2] * q[1], p[1] * q[0] + p[3] * q[1],
  p[0] * q[2] + p[2] * q[3], p[1] * q[2] + p[3] * q[3],
  p[0] * q[4] + p[2] * q[5] + p[4], p[1] * q[4] + p[3] * q[5] + p[5],
];
export const translate = (x: number, y: number): Mat => [1, 0, 0, 1, x, y];
export const scale = (sx: number, sy = sx): Mat => [sx, 0, 0, sy, 0, 0];
export const rotate = (r: number): Mat => [Math.cos(r), Math.sin(r), -Math.sin(r), Math.cos(r), 0, 0];
export const apply = (m: Mat, x: number, y: number): [number, number] => [m[0] * x + m[2] * y + m[4], m[1] * x + m[3] * y + m[5]];

// ---------- 新老两种写法：新写法 parts / anims / muzzle 按朝向分组，老写法当作只有 front ----------
const grouped = (m: L1Module): boolean => {
  const a = m.anims as Record<string, unknown>, front = a.front as Record<string, unknown> | undefined;
  return !!m.facings || (!!front && !('dur' in front) && !('tracks' in front));
};
export function facingsOf(m: L1Module): Facing[] {
  if (m.facings && m.facings.length) return m.facings;
  return Array.isArray(m.parts) ? ['front'] : Object.keys(m.parts) as Facing[];
}
export function partsOf(m: L1Module, f: Facing): PartDef[] {
  if (Array.isArray(m.parts)) return m.parts;
  return m.parts[f] ?? m.parts.front ?? [];
}
export function animsOf(m: L1Module, f: Facing): Record<string, AnimDef> {
  if (!grouped(m)) return m.anims as Record<string, AnimDef>;
  const g = m.anims as Partial<Record<Facing, Record<string, AnimDef>>>;
  return g[f] ?? g.front ?? {};
}
export function muzzleOf(m: L1Module, f: Facing): [number, number] | null {
  const z = m.muzzle; if (!z) return null;
  if (Array.isArray(z)) return z;
  return z[f] ?? z.front ?? null;
}
/** 画哪一套：模块没画这个朝向就退回正面 */
export const drawnFacing = (m: L1Module, f: Facing): Facing => facingsOf(m).includes(f) ? f : 'front';
/** 第 i 个部件的出图种子，和 rig-player.js 的 buildL1Atlas 一致（同一个种子同一张图） */
export const partSeed = (facingIndex: number, partIndex: number): number => 101 + facingIndex * 199 + partIndex * 31;
export const boilCount = (m: L1Module, p: PartDef): number => p.boil === false ? 1 : m.boil ?? 3;
export const partImage = (key: string, f: Facing, id: string, boil: number): string => `${key}/${f}/${id}#${boil}`;

// ---------- 动作 ----------
interface PartPose { x: number; y: number; rot: number; sx: number; sy: number; alpha: number; hidden: boolean }
function ease(kind: string | undefined, u: number): number {
  if (kind === 'smooth' || kind === 'sineInOut') return u * u * (3 - 2 * u);
  if (kind === 'out' || kind === 'quadOut') return 1 - (1 - u) * (1 - u);
  if (kind === 'in' || kind === 'quadIn') return u * u;
  return u;
}
function evalTrack(keys: TrackKey[], t: number): TrackKey | null {
  if (!keys.length) return null;
  if (t <= keys[0].t) return keys[0];
  const last = keys[keys.length - 1];
  if (t >= last.t) return last;
  for (let i = 0; i < keys.length - 1; i++) {
    const a = keys[i], b = keys[i + 1];
    if (t < a.t || t > b.t) continue;
    const k = ease(a.ease, (t - a.t) / Math.max(1, b.t - a.t)), l = (p: number | undefined, q: number | undefined, d: number) => (p ?? d) + ((q ?? d) - (p ?? d)) * k;
    return { t, x: l(a.x, b.x, 0), y: l(a.y, b.y, 0), rot: l(a.rot, b.rot, 0), sx: l(a.sx, b.sx, 1), sy: l(a.sy, b.sy, 1), alpha: l(a.alpha, b.alpha, 1), hidden: a.hidden };
  }
  return last;
}
export function animOf(m: L1Module, f: Facing, anim: string): AnimDef {
  const all = animsOf(m, f);
  return all[anim] ?? all.idle ?? Object.values(all)[0] ?? { dur: 1000, loop: true };
}
export function computePose(m: L1Module, f: Facing, anim: string, timeMs: number): Record<string, PartPose> {
  const a = animOf(m, f, anim), dur = a.dur || 1000, t = a.loop ? timeMs % dur : Math.min(dur, timeMs), pose: Record<string, PartPose> = {};
  for (const p of partsOf(m, f)) pose[p.id] = { x: 0, y: 0, rot: 0, sx: 1, sy: 1, alpha: 1, hidden: !!p.hidden };
  for (const id of Object.keys(a.tracks ?? {})) {
    const st = pose[id], v = st && evalTrack(a.tracks![id], t);
    if (!st || !v) continue;
    if (v.x !== undefined) st.x = v.x; if (v.y !== undefined) st.y = v.y; if (v.rot !== undefined) st.rot = v.rot;
    if (v.sx !== undefined) st.sx = v.sx; if (v.sy !== undefined) st.sy = v.sy; if (v.alpha !== undefined) st.alpha = v.alpha;
    if (v.hidden !== undefined) st.hidden = v.hidden;
  }
  return pose;
}

export interface Piece { img: string; m: Mat; w: number; h: number; alpha: number; add?: boolean }
export interface RigPlace { facing: Facing; anim: string; timeMs: number; x: number; y: number; w: number; h: number; flip: boolean; boilTick: number; alpha?: number }
/** 模块画布（size）→ 屏幕：锚点放在 (x, y)，整张画布缩到 w × h，往左时水平翻转 */
export const placement = (m: L1Module, p: { x: number; y: number; w: number; h: number; flip: boolean }): Mat =>
  mul(mul(mul(translate(p.x, p.y), scale(p.flip ? -1 : 1, 1)), scale(p.w / m.size[0], p.h / m.size[1])), translate(-m.anchor[0], -m.anchor[1]));

/** 一帧的全部部件，按绘制顺序（从后往前）。部件沸腾：每个部件按 boilTick 轮换，相邻部件错开 */
export function rigPieces(m: L1Module, o: RigPlace): Piece[] {
  const f = drawnFacing(m, o.facing), parts = partsOf(m, f), pose = computePose(m, f, o.anim, o.timeMs), by: Record<string, PartDef> = {};
  for (const p of parts) by[p.id] = p;
  const memo: Record<string, Mat> = {};
  const chain = (p: PartDef): Mat => {
    if (memo[p.id]) return memo[p.id];
    const st = pose[p.id], [px, py] = p.pivot;
    let own = mul(mul(mul(translate(px + st.x, py + st.y), rotate(st.rot * Math.PI / 180)), scale(st.sx, st.sy)), translate(-px, -py));
    if (p.parent && by[p.parent] && p.parent !== p.id) own = mul(chain(by[p.parent]), own);
    return memo[p.id] = own;
  };
  const base = placement(m, o), out: Piece[] = [];
  parts.forEach((p, i) => {
    const st = pose[p.id];
    if (!st || st.hidden || st.alpha <= 0.01) return;
    const n = boilCount(m, p), [rx, ry, rw, rh] = p.rect;
    out.push({ img: partImage(m.key, f, p.id, n > 1 ? (o.boilTick + i) % n : 0), m: mul(mul(base, chain(p)), translate(rx, ry)), w: rw, h: rh, alpha: st.alpha * (o.alpha ?? 1) });
  });
  return out;
}
/** 发射点在屏幕上的位置（出手那一刻） */
export function muzzlePoint(m: L1Module, o: { facing: Facing; x: number; y: number; w: number; h: number; flip: boolean }): [number, number] | null {
  const f = drawnFacing(m, o.facing), z = muzzleOf(m, f);
  return z ? apply(placement(m, o), z[0], z[1]) : null;
}
