import type { BattleUnit, Enemy, GameData, Point, ShotView } from '../core/index';
import type { BgModule, Facing, L1Module, L2Module, L3Module } from './ArtTypes';
import { ArtBook } from './ArtGen';
import { Particles } from './ArtFx';
import { animsOf, animOf, drawnFacing, facingsOf, mul, muzzlePoint, rigPieces, rotate, scale, translate } from './RigMath';
import type { Piece } from './RigMath';

/**
 * 把游戏状态翻成美术的贴图（开发文档 7.2）：GameView 在画每样东西之前问一句，有图就出贴图、没图照旧画色块。
 * 规则和位置全听 core（走位、朝向、出手、弹道位置都是 core 算的）；这里只管“画哪一张、播哪个动作”。
 */
export type Put = (p: Piece) => void;
const BOIL_FPS = 7;              // 部件沸腾每秒换 7 次（美术文档 2.1：6–8 次）
const ELITE = 1.4;
interface Clock { state: string; since: number; was: string }

export class ArtView {
  readonly fx = new Particles();
  private clocks = new Map<string, Clock>();
  private shots = new Map<number, { source: string; to: Point; trail: number }>();
  private last = 0;
  private dt = 0;
  private now = 0;
  constructor(readonly book: ArtBook, readonly data: GameData) {}

  private l1(key: string): L1Module | null { return this.book.mod<L1Module>(key, 'L1'); }
  private l2(key: string): L2Module | null { return this.book.mod<L2Module>(key, 'L2'); }
  private l3(key: string): L3Module | null { return this.book.mod<L3Module>(key, 'L3'); }
  has(name: string): boolean { return this.book.regions.has(name); }

  /** 每次 render 开头调一次：推进粒子；弹道飞完的地方放打中 */
  frame(time: number, shots: ShotView[]): void {
    this.dt = this.last ? Math.max(0, Math.min(0.1, time - this.last)) : 0; this.last = time; this.now = time;
    const live = new Set<number>();
    for (const s of shots) {
      live.add(s.id);
      const known = this.shots.get(s.id);
      if (known) known.to = s.to; else this.shots.set(s.id, { source: s.source, to: s.to, trail: 0 });
    }
    for (const [id, s] of this.shots) if (!live.has(id)) {
      const m = this.l3(`shot_${s.source}`);
      if (m) this.fx.emit(m, 'hit', s.to[0], s.to[1]);
      this.shots.delete(id);
    }
    this.fx.step(this.dt);
  }
  reset(): void { this.fx.clear(); this.shots.clear(); this.clocks.clear(); }

  // ---------- 背景 ----------
  /** 背景底对齐（750×1624，矮屏裁掉顶上） */
  background(put: Put, height: number): boolean {
    const bg = this.book.mod<BgModule>('bg_dream_0', 'bg'); if (!bg || !this.has(bg.key)) return false;
    put({ img: bg.key, m: translate(0, height - bg.size[1]), w: bg.size[0], h: bg.size[1], alpha: 1 });
    return true;
  }

  // ---------- 玩偶 ----------
  private clock(id: string, state: string): Clock {
    let c = this.clocks.get(id);
    if (!c) { c = { state, since: this.now, was: '' }; this.clocks.set(id, c); }
    else if (c.state !== state) { c.was = c.state; c.state = state; c.since = this.now; }
    return c;
  }
  /** 这只玩偶这一帧：画哪个朝向、播哪个动作、动作播了多久 */
  private pose(unit: BattleUnit, m: L1Module, battleTime: number): { facing: Facing; anim: string; ms: number } {
    const knocked = unit.knockedUntil > battleTime, startled = unit.startledUntil > battleTime;
    const state = knocked ? 'knocked' : startled ? 'startled' : unit.state;
    const c = this.clock(unit.id, state), ms = (this.now - c.since) * 1000;
    let facing: Facing = drawnFacing(m, unit.face);
    const has = (f: Facing, a: string) => !!animsOf(m, f)[a];
    // 这个朝向没画这个动作（会走的玩偶正面不出手）：转到画了的那一面
    const want = (a: string) => { if (has(facing, a)) return a; for (const f of ['side', 'back', 'front'] as Facing[]) if (facingsOf(m).includes(f) && has(f, a)) { facing = f; return a; } return null; };
    const loop = (this.now * 1000) + unit.id.length * 137;
    const moving = Math.hypot(unit.vx, unit.vy) > 1;
    if (state === 'knocked') {
      facing = 'front';
      const k = animOf(m, 'front', 'knocked');
      if (has('front', 'knocked') && ms < k.dur) return { facing, anim: 'knocked', ms };
      return { facing, anim: has('front', 'down') ? 'down' : 'idle', ms: loop };
    }
    if (c.was === 'knocked' && has('front', 'getup') && ms < animOf(m, 'front', 'getup').dur) return { facing: 'front', anim: 'getup', ms };
    if (state === 'startled' && has(facing, 'startled')) return { facing, anim: 'startled', ms };
    if (state === 'attack') { const a = want('attack'); if (a) return { facing, anim: a, ms }; }
    if (state === 'strike') { const a = want('strike') ?? want('attack'); if (a) return { facing, anim: a, ms }; }
    if (state === 'dash' && moving) { const a = want('dash'); if (a) return { facing, anim: a, ms: loop }; }
    if (moving && has(facing, 'walk')) return { facing, anim: 'walk', ms: loop };
    return { facing, anim: 'idle', ms: loop };
  }
  private dollBox(m: L1Module, size: number): [number, number] {
    const d = m.display ?? m.size;
    return [d[0] * size / d[1], size];
  }
  /** 画一只玩偶，返回头顶的 y（耐力条、“！”往上放）；没有图返回 null */
  toy(put: Put, unit: BattleUnit, battleTime: number, dy: number, dim = false): number | null {
    const m = this.l1(`toy_${unit.id}`); if (!m) return null;
    const p = this.pose(unit, m, battleTime), [w, h] = this.dollBox(m, this.data.nest.dollSize);
    for (const piece of rigPieces(m, { facing: p.facing, anim: p.anim, timeMs: p.ms, x: unit.x, y: unit.y + dy, w, h, flip: unit.flip, boilTick: Math.floor(this.now * BOIL_FPS) + unit.id.length * 3, alpha: dim ? 0.55 : 1 })) {
      if (this.has(piece.img)) put(piece);
    }
    return unit.y + dy - h * (m.anchor[1] / m.size[1]) * 0.92;
  }
  /** 出手那一刻弹道从哪出来（相对玩偶脚下的偏移）；没有图返回 null，用 GameController 的估算 */
  muzzle(unit: BattleUnit, battleTime: number): Point | null {
    const m = this.l1(`toy_${unit.id}`); if (!m) return null;
    const p = this.pose(unit, m, battleTime), [w, h] = this.dollBox(m, this.data.nest.dollSize);
    const z = muzzlePoint(m, { facing: p.facing, x: 0, y: 0, w, h, flip: unit.flip });
    return z ? [z[0], z[1]] : null;
  }
  /** 帮的光环：脚下平放（画在所有玩偶下面） */
  auras(put: Put, units: BattleUnit[], dy: number): void {
    for (const u of units) {
      const def = this.data.byToy[u.id], m = this.l3(`shot_${u.id}`), r = def?.aura;
      if (!r || !m || !m.brushes.aura || !this.has(`${m.key}/aura/0`)) continue;
      put({ img: `${m.key}/aura/0`, m: translate(u.x - r, u.y + dy - r), w: r * 2, h: r * 2, alpha: 0.9 });
    }
  }
  captain(put: Put, x: number, y: number, star: number): number | null {
    const m = this.l1('captain_mianmian'); if (!m) return null;
    const d = m.display ?? m.size, k = this.data.nest.dollSize / 120, w = d[0] * k, h = d[1] * k;
    const cycle = this.now % 9, anim = cycle > 7.6 && animsOf(m, 'front').baa ? 'baa' : 'idle', ms = anim === 'baa' ? (cycle - 7.6) * 1000 : this.now * 1000;
    for (const piece of rigPieces(m, { facing: 'front', anim, timeMs: ms, x, y, w, h, flip: false, boilTick: Math.floor(this.now * BOIL_FPS) + star })) if (this.has(piece.img)) put(piece);
    return y - h * (m.anchor[1] / m.size[1]);
  }

  // ---------- 噩梦 ----------
  /** 画一只噩梦（脚下在 footY），返回头顶的 y；大噩梦（L0，第 4 批）和没有图的返回 null */
  enemy(put: Put, e: Enemy, footY: number, hitAge: number | null, battleTime: number): number | null {
    if (e.boss) return null;
    const m = this.l2('nm_eyes'); if (!m) return null;
    const v = e.elite ? 'elite' : 'normal', k = (e.elite ? ELITE : 1) * (e.child ? 0.7 : 1);
    let anim = 'walk', t = battleTime + e.id * 0.37;
    if (hitAge !== null && m.anims.hit) { anim = 'hit'; t = hitAge; }
    else if ((e.state === 'blocked' || e.state === 'squeeze') && m.anims.push) anim = 'push';
    const a = m.anims[anim], i = a.loop === false || anim === 'hit' ? Math.min(a.frames - 1, Math.floor(t * a.fps)) : Math.floor(t * a.fps) % a.frames;
    const img = `${m.key}/${v}/${anim}/${i}`; if (!this.has(img)) return null;
    const d = m.display ?? m.size, w = d[0] * k, h = d[1] * k, flip = e.edgeX < e.x;
    put({ img, m: mul(mul(translate(e.x, footY), scale(flip ? -1 : 1, 1)), translate(-m.anchor[0] / m.size[0] * w, -m.anchor[1] / m.size[1] * h)), w, h, alpha: e.closed ? 0.6 : 1 });
    return footY - h * (m.anchor[1] / m.size[1]) * 0.85;
  }
  /** 拍散：噩梦 burst → 棉花 → 小羊往栅栏跑 → 跳过去（GameController 的 cotton 效果，age 从 -0.2 开始，life 1.1 秒） */
  cotton(put: Put, x: number, y: number, age: number, life: number, fence: Point, dy: number): boolean {
    const nm = this.l2('nm_eyes'), sh = this.l2('obj_sheep'); if (!nm || !sh) return false;
    if (age < 0) {
      const a = nm.anims.burst; if (!a) return false;
      const i = Math.min(a.frames - 1, Math.floor((age + 0.2) / 0.2 * a.frames)), d = nm.display ?? nm.size;
      put({ img: `${nm.key}/normal/burst/${i}`, m: translate(x - nm.anchor[0] / nm.size[0] * d[0], y + dy - nm.anchor[1] / nm.size[1] * d[1]), w: d[0], h: d[1], alpha: 1 });
      return true;
    }
    const p = Math.min(1, age / life), d = sh.display ?? sh.size;
    let px: number, py: number, anim: string, t: number;
    if (p < 0.75) { const u = p / 0.75; px = x + (fence[0] - x) * u; py = y + dy + (fence[1] - y - dy) * u - Math.sin(u * Math.PI) * 40; anim = age < 0.25 ? (age < 0.12 ? 'cotton' : 'pop') : 'run'; t = age; }
    else { const u = (p - 0.75) / 0.25; px = fence[0] - u * 150; py = fence[1] - Math.sin(u * Math.PI) * 45; anim = 'jump'; t = u * 0.4; }
    const a = sh.anims[anim] ?? sh.anims.run; if (!a) return false;
    const i = a.loop ? Math.floor(t * a.fps) % a.frames : Math.min(a.frames - 1, Math.floor(t * a.fps));
    put({ img: `${sh.key}/normal/${anim}/${i}`, m: translate(px - sh.anchor[0] / sh.size[0] * d[0], py - sh.anchor[1] / sh.size[1] * d[1]), w: d[0], h: d[1], alpha: 1 });
    return true;
  }

  // ---------- 弹道 ----------
  /** 一颗弹道：直线按方向转、抛物线边飞边转、柱子按两点平铺。from / pos / to 是 core 的坐标，dy = 高屏往下挪多少 */
  projectile(put: Put, kind: string, source: string, from: Point, pos: Point, to: Point, progress: number, dy: number, id?: number): boolean {
    const m = this.l3(`shot_${source}`); if (!m) return false;
    const frame = (b: string) => { const n = m.brushes[b]?.frames ?? 1; return `${m.key}/${b}/${Math.floor(this.now * 12) % n}`; };
    if (kind === 'beam' || kind === 'chain') {
      const b = m.brushes.beam ? 'beam' : m.brushes.bolt ? 'bolt' : null; if (!b) return false;
      const d = m.brushes[b], len = Math.hypot(to[0] - from[0], to[1] - from[1]), ang = Math.atan2(to[1] - from[1], to[0] - from[0]), base = mul(translate(from[0], from[1] + dy), rotate(ang));
      const fade = Math.min(1, (1 - progress) * 3);
      for (let x0 = 0; x0 < len; x0 += d.size[0]) {
        // 最后一段不满一节：横向压到剩下的长度（柱子压一点看不出来，两头还有 cap 盖着）
        put({ img: frame(b), m: mul(base, translate(x0, -d.size[1] / 2)), w: Math.min(d.size[0], len - x0), h: d.size[1], alpha: fade });
      }
      const cap = m.brushes.cap;
      if (cap) for (const x0 of [0, len]) put({ img: `${m.key}/cap/0`, m: mul(base, translate(x0 - cap.size[0] / 2, -cap.size[1] / 2)), w: cap.size[0], h: cap.size[1], alpha: fade });
      return true;
    }
    if (kind === 'melee' || !m.brushes.fly) return false;
    const d = m.brushes.fly, ang = kind === 'lob' ? progress * Math.PI * 4 : Math.atan2(to[1] - pos[1], to[0] - pos[0]);
    put({ img: frame('fly'), m: mul(mul(translate(pos[0], pos[1] + dy), rotate(ang)), translate(-d.size[0] / 2, -d.size[1] / 2)), w: d.size[0], h: d.size[1], alpha: 1 });
    // 拖尾：照配方的 rate 往身后喷
    const tr = m.effects?.trail, s = id !== undefined ? this.shots.get(id) : undefined;
    if (tr && s && (s.trail -= this.dt) <= 0) { s.trail = 1 / (tr.rate ?? 30); this.fx.emit(m, 'trail', pos[0], pos[1], ang * 180 / Math.PI + 180, 1); }
    return true;
  }
  /** 粒子（打中、拖尾）画在最上面 */
  particles(put: Put, dy: number): void { const out: Piece[] = []; this.fx.pieces(dy, out); for (const p of out) if (this.has(p.img)) put(p); }
}
