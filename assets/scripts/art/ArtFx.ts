import type { L3Module, Recipe } from './ArtTypes';
import { mul, rotate, scale, translate } from './RigMath';
import type { Piece } from './RigMath';

/**
 * 精灵粒子（开发文档 7.4，配方字段见美术文档 2.1）：对象池，一次最多 MAX 个。
 * 笔刷图来自 ArtGen 的 `<key>/<笔刷>/0`。tint（随机乘色）暂时不做：Canvas 乘色要多画一遍，Cocos 用 Sprite.color 可以做，等真机帧率出来再定。
 */
interface P { key: string; brush: string; w: number; h: number; x: number; y: number; vx: number; vy: number; g: number; rot: number; spin: number; life: number; max: number; sc: number[]; al: [number, number]; add: boolean }
const MAX = 220;

export class Particles {
  private ps: P[] = [];
  private pool: P[] = [];
  private seed = 20261106;
  private rnd(): number { this.seed = (this.seed * 1664525 + 1013904223) >>> 0; return this.seed / 4294967296; }
  private pick(r: [number, number] | number[] | undefined, d = 0): number { return !r ? d : r.length < 2 ? r[0] : r[0] + (r[1] - r[0]) * this.rnd(); }
  get count(): number { return this.ps.length; }
  clear(): void { this.pool.push(...this.ps); this.ps.length = 0; }
  /** 按配方喷一次。aim（度）给了就朝它 ±16°，不给用配方的 angle；n 不给用配方的 count（没有 count 的是拖尾，一次一颗） */
  emit(m: L3Module, recipe: string, x: number, y: number, aim?: number, n?: number): void {
    const r: Recipe | undefined = m.effects?.[recipe]; if (!r || !r.brush.length) return;
    const count = n ?? Math.round(this.pick(r.count, 1));
    for (let i = 0; i < count && this.ps.length < MAX; i++) {
      const brush = r.brush[Math.floor(this.rnd() * r.brush.length)], b = m.brushes[brush]; if (!b) continue;
      const life = this.pick(r.life, 0.4), sp = this.pick(r.speed, 0), a = (aim !== undefined ? aim + (this.rnd() - 0.5) * 32 : this.pick(r.angle, 0)) * Math.PI / 180;
      const p = this.pool.pop() ?? {} as P;
      Object.assign(p, { key: m.key, brush, w: b.size[0], h: b.size[1], x: x + (this.rnd() - 0.5) * 10, y: y + (this.rnd() - 0.5) * 10, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, g: r.gravity ?? 0, rot: this.rnd() * Math.PI * 2, spin: ((r.spin ?? 170) * (this.rnd() - 0.5) * 2) * Math.PI / 180, life, max: life, sc: r.scale.length ? r.scale : [1], al: r.alpha, add: r.blend === 'add' });
      this.ps.push(p);
    }
  }
  step(dt: number): void {
    for (let i = this.ps.length - 1; i >= 0; i--) {
      const p = this.ps[i];
      if ((p.life -= dt) <= 0) { this.pool.push(p); this.ps[i] = this.ps[this.ps.length - 1]; this.ps.pop(); continue; }
      p.vy += p.g * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.rot += p.spin * dt;
    }
  }
  /** dy：整屏往下挪多少（高屏） */
  pieces(dy: number, out: Piece[]): void {
    for (const p of this.ps) {
      const u = 1 - p.life / p.max, [s0, s1 = s0, s2 = s1] = p.sc, s = u < 0.5 ? s0 + (s1 - s0) * u * 2 : s1 + (s2 - s1) * (u - 0.5) * 2;
      const alpha = Math.max(0, p.al[0] + (p.al[1] - p.al[0]) * u);
      if (alpha <= 0.01 || s <= 0) continue;
      out.push({ img: `${p.key}/${p.brush}/0`, m: mul(mul(mul(translate(p.x, p.y + dy), rotate(p.rot)), scale(s)), translate(-p.w / 2, -p.h / 2)), w: p.w, h: p.h, alpha, add: p.add });
    }
  }
}
