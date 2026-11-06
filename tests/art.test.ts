import { describe, expect, it, beforeAll } from 'vitest';
import levels from '../assets/resources/data/levels.json';
import { ARTCODE } from '../assets/scripts/art/artcode.gen';
import { ArtBook, generate, modulesOf } from '../assets/scripts/art/ArtGen';
import { ArtView } from '../assets/scripts/art/ArtView';
import type { CanvasLike, L1Module, L3Module } from '../assets/scripts/art/ArtTypes';
import { boilCount, facingsOf, muzzlePoint, partImage, partsOf, rigPieces } from '../assets/scripts/art/RigMath';
import { loadData } from '../assets/scripts/core/index';
import type { BattleUnit } from '../assets/scripts/core/index';

// Node 里没有 Canvas：给一个什么都不画、但接口齐全的假画布（美术代码只调 Canvas2D 标准接口）
function fakeCanvas(w = 1, h = 1): CanvasLike {
  const grad = { addColorStop() { /* no-op */ } };
  const ctx = new Proxy({} as Record<string | symbol, unknown>, {
    get: (t, k) => k in t ? t[k] : (k === 'createLinearGradient' || k === 'createRadialGradient' || k === 'createPattern') ? () => grad : k === 'measureText' ? () => ({ width: 10 }) : () => undefined,
    set: (t, k, v) => { t[k] = v; return true; },
  });
  return { width: w, height: h, getContext: () => ctx as unknown as CanvasRenderingContext2D };
}
let book: ArtBook;
beforeAll(() => {
  (globalThis as unknown as { document: unknown }).document = { createElement: () => fakeCanvas() };
  const gen = generate(ARTCODE, { scale: 1.5, makeCanvas: fakeCanvas, grain: 1 });
  for (;;) { const r = gen.next(); if (r.done) { book = r.value; break; } }
});

describe('美术代码包（art-code → artcode.gen.ts）', () => {
  it('第 2 批的 15 件都在，级别对', () => {
    const keys = modulesOf(ARTCODE).map(m => `${m.key}:${m.level}`).sort();
    expect(keys).toEqual(['bg_dream_0:bg', 'captain_mianmian:L1', 'fx_warm:L3', 'nm_eyes:L2', 'obj_sheep:L2', 'shot_abing:L3', 'shot_dingdang:L3', 'shot_fangfang:L3', 'shot_gaga:L3', 'shot_huhu:L3', 'toy_abing:L1', 'toy_dingdang:L1', 'toy_fangfang:L1', 'toy_gaga:L1', 'toy_huhu:L1']);
  });
  it('美术的出手帧 = levels.json 的 windup，弹道种类 = levels.json 的 shot.kind', () => {
    for (const t of levels.toys) {
      const m = book.mod<L1Module>(`toy_${t.id}`, 'L1'), s = book.mod<L3Module>(`shot_${t.id}`, 'L3');
      if (m) expect(m.release?.attack, t.id).toBe(Math.round(t.windup * 1000));
      if (s) expect(s.kind, t.id).toBe(t.shot.kind);
      if (s && t.aura) expect(s.aura, t.id).toBe(t.aura);
    }
  });
  it('会走的玩偶（中 / 大 / 冲）画了正背侧三套，每个出手的朝向都有发射点', () => {
    for (const t of levels.toys) {
      const m = book.mod<L1Module>(`toy_${t.id}`, 'L1'); if (!m) continue;
      if (levels.stance.range[t.range as keyof typeof levels.stance.range].turn) expect(facingsOf(m).sort(), t.id).toEqual(['back', 'front', 'side']);
      for (const f of facingsOf(m)) expect(muzzlePoint(m, { facing: f, x: 0, y: 0, w: 112, h: 120, flip: false }), `${t.id}/${f}`).not.toBeNull();
    }
  });
});

describe('ArtGen 图集', () => {
  it('每个部件 × 朝向 × 沸腾都出了图，背景单独一页', () => {
    for (const m of book.mods.values()) {
      if (m.level !== 'L1') continue;
      for (const f of facingsOf(m)) for (const p of partsOf(m, f)) for (let b = 0; b < boilCount(m, p); b++) expect(book.get(partImage(m.key, f, p.id, b)), `${m.key}/${f}/${p.id}#${b}`).toBeDefined();
    }
    const bg = book.get('bg_dream_0')!;
    expect(book.pages[bg.page].width).toBeLessThanOrEqual(2048);
    expect(book.pages[bg.page].height).toBeLessThanOrEqual(2048);
    expect(book.get('white')).toBeDefined();
  });
  it('同一页里的图互不重叠、不出页', () => {
    const byPage = new Map<number, { x: number; y: number; w: number; h: number }[]>();
    for (const r of book.regions.values()) { const l = byPage.get(r.page) ?? []; l.push(r); byPage.set(r.page, l); }
    for (const [page, rs] of byPage) {
      const c = book.pages[page];
      for (const r of rs) { expect(r.x + r.w).toBeLessThanOrEqual(c.width); expect(r.y + r.h).toBeLessThanOrEqual(c.height); }
      for (let i = 0; i < rs.length; i++) for (let j = i + 1; j < rs.length; j++) {
        const a = rs[i], b = rs[j];
        expect(a.x + a.w <= b.x || b.x + b.w <= a.x || a.y + a.h <= b.y || b.y + b.h <= a.y).toBe(true);
      }
    }
  });
});

describe('骨骼姿势和朝向', () => {
  const huhu = () => book.mod<L1Module>('toy_huhu', 'L1')!;
  it('rigPieces 出的图都在图集里；往左翻转后关于锚点镜像', () => {
    const o = { facing: 'side' as const, anim: 'idle', timeMs: 0, x: 300, y: 900, w: 112, h: 120, flip: false, boilTick: 0 };
    const right = rigPieces(huhu(), o), left = rigPieces(huhu(), { ...o, flip: true });
    expect(right.length).toBeGreaterThan(5);
    for (const p of right) expect(book.get(p.img), p.img).toBeDefined();
    right.forEach((p, i) => { expect(left[i].m[4] - 300).toBeCloseTo(-(p.m[4] - 300), 6); expect(left[i].m[0]).toBeCloseTo(-p.m[0], 6); });
  });
  it('侧面的发射点在脸朝的那边', () => {
    const r = muzzlePoint(huhu(), { facing: 'side', x: 0, y: 0, w: 112, h: 120, flip: false })!, l = muzzlePoint(huhu(), { facing: 'side', x: 0, y: 0, w: 112, h: 120, flip: true })!;
    expect(r[0]).toBeGreaterThan(0); expect(l[0]).toBeCloseTo(-r[0], 6); expect(r[1]).toBeLessThan(0);
  });
  it('正面没画出手的玩偶出手时转到侧面（美术文档 3.2.1）', () => {
    const view = new ArtView(book, loadData(levels));
    const unit = { id: 'huhu', x: 300, y: 900, vx: 0, vy: 0, state: 'attack', face: 'front', flip: false, knockedUntil: 0, startledUntil: 0 } as unknown as BattleUnit;
    const imgs: string[] = [];
    view.frame(1, []);
    view.toy(p => imgs.push(p.img), unit, 0, 0);
    expect(imgs.length).toBeGreaterThan(0);
    expect(imgs.every(i => i.startsWith('toy_huhu/side/'))).toBe(true);
  });
  it('只画正面的玩偶（嘎嘎）被要求背面时退回正面', () => {
    const view = new ArtView(book, loadData(levels));
    const unit = { id: 'gaga', x: 300, y: 900, vx: 0, vy: -20, state: 'walk', face: 'back', flip: false, knockedUntil: 0, startledUntil: 0 } as unknown as BattleUnit;
    const imgs: string[] = [];
    view.toy(p => imgs.push(p.img), unit, 0, 0);
    expect(imgs.every(i => i.startsWith('toy_gaga/front/'))).toBe(true);
  });
});
