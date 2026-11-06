import type { ArtKit, ArtModule, ArtPackage, CanvasLike, Ctx2D, L1Module, MakeCanvas } from './ArtTypes';
import { boilCount, facingsOf, partImage, partSeed, partsOf } from './RigMath';

/**
 * ArtGen（开发文档 7.4）：游戏加载时调美术的出图代码，把每个部件 / 每帧 / 每支笔刷画进几张图集。
 * 不依赖引擎：画布由外面给（浏览器 document.createElement、微信 wx.createCanvas）。分帧跑，每帧不超过 budgetMs。
 * 图名：L1 `<key>/<朝向>/<部件>#<沸腾>`，L2 `<key>/<变体>/<动作>/<帧>`，L3 `<key>/<笔刷>/<帧>`，背景 `<key>`，纯白小块 `white`（色块也走贴图时用）。
 */
export interface Region { page: number; x: number; y: number; w: number; h: number }
export class ArtBook {
  readonly pages: CanvasLike[] = [];
  readonly regions = new Map<string, Region>();
  readonly mods = new Map<string, ArtModule>();
  /** 出图花了多少毫秒（不含分帧的等待），调试面板和真机记录用 */
  ms = 0;
  constructor(readonly version: string, readonly scale: number) {}
  get(name: string): Region | undefined { return this.regions.get(name); }
  mod<T extends ArtModule>(key: string, level: T['level']): T | null { const m = this.mods.get(key); return m && m.level === level ? m as T : null; }
}

interface Job { name: string; w: number; h: number; own?: boolean; scale?: number; draw(ctx: Ctx2D, s: number): void }
const PAGE = 2048, PAD = 2;
const ELITE = 1.4;   // 精英噩梦另画一套，尺寸 ×1.4（美术文档 2.1）

/** 包里的出图模块（画笔库、色板、预览用的播放器不算） */
export function modulesOf(pkg: ArtPackage): ArtModule[] {
  const out: ArtModule[] = [];
  for (const f of pkg.files) {
    if (f.startsWith('kit/') || f === 'palette.js' || f === 'rig-player.js') continue;
    const m = pkg.req(f).default as ArtModule | undefined;
    if (m && typeof m.key === 'string' && typeof m.level === 'string') out.push(m);
  }
  return out;
}

function jobsOf(m: ArtModule): Job[] {
  const jobs: Job[] = [];
  if (m.level === 'L1') {
    const l1: L1Module = m;
    facingsOf(l1).forEach((f, fi) => partsOf(l1, f).forEach((p, i) => {
      const [rx, ry, rw, rh] = p.rect;
      for (let b = 0; b < boilCount(l1, p); b++) jobs.push({ name: partImage(l1.key, f, p.id, b), w: rw, h: rh, draw: (ctx, s) => { ctx.translate(-rx, -ry); l1.drawPart(ctx, p.id, { seed: partSeed(fi, i), boil: b, scale: s, facing: f }); } });
    }));
  } else if (m.level === 'L2') {
    for (const v of m.variants ?? ['normal']) {
      const k = v === 'elite' ? ELITE : 1;
      for (const an of Object.keys(m.anims)) for (let i = 0; i < m.anims[an].frames; i++) {
        jobs.push({ name: `${m.key}/${v}/${an}/${i}`, w: m.size[0] * k, h: m.size[1] * k, draw: (ctx, s) => { ctx.scale(k, k); m.drawFrame(ctx, an, i, { seed: 202, boil: 0, scale: s * k, variant: v }); } });
      }
    }
  } else if (m.level === 'L3') {
    for (const b of Object.keys(m.brushes)) {
      const d = m.brushes[b];
      for (let fr = 0; fr < (d.frames ?? 1); fr++) jobs.push({ name: `${m.key}/${b}/${fr}`, w: d.size[0], h: d.size[1], draw: (ctx, s) => d.draw(ctx, { seed: 501, boil: 0, scale: s, frame: fr }) });
    }
  } else if (m.level === 'bg') {
    // 背景单独一张，边长不超过一页
    jobs.push({ name: m.key, w: m.size[0], h: m.size[1], own: true, scale: 0, draw: (ctx, s) => m.draw(ctx, { seed: 601, boil: 0, scale: s }) });
  }
  return jobs;
}

export interface GenOptions { scale: number; makeCanvas: MakeCanvas; grain?: number; keys?: string[] }
/** 一步画一张，每画完一张 yield 进度（0–1）；画完 return 图集 */
export function* generate(pkg: ArtPackage, o: GenOptions): Generator<number, ArtBook, void> {
  const kit = pkg.files.includes('kit/index.js') ? pkg.req('kit/index.js') as ArtKit : {};
  if (kit.setGrain && o.grain !== undefined) kit.setGrain(o.grain);
  const book = new ArtBook(pkg.version, o.scale), mods = modulesOf(pkg).filter(m => !o.keys || o.keys.includes(m.key));
  for (const m of mods) book.mods.set(m.key, m);
  const jobs: Job[] = [{ name: 'white', w: 4 / o.scale, h: 4 / o.scale, draw: ctx => { ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, 4, 4); } }];
  for (const m of mods) jobs.push(...jobsOf(m));
  // 高的先排，一行一行往下码（shelf）
  const packed = jobs.filter(j => !j.own).sort((a, b) => b.h - a.h), own = jobs.filter(j => j.own), total = jobs.length;
  let ctx: Ctx2D | null = null, x = 0, y = 0, row = 0, done = 0;
  const newPage = (w: number, h: number): Ctx2D => {
    const c = o.makeCanvas(w, h), g = c.getContext('2d');
    if (!g) throw new Error('出图画布拿不到 2d 上下文');
    book.pages.push(c); return g;
  };
  const paint = (g: Ctx2D, j: Job, px: number, py: number, pw: number, ph: number, s: number) => {
    const t0 = Date.now();
    g.save(); g.beginPath(); g.rect(px, py, pw, ph); g.clip(); g.translate(px, py); g.scale(s, s);
    try { j.draw(g, s); } finally { g.restore(); }
    book.regions.set(j.name, { page: book.pages.length - 1, x: px, y: py, w: pw, h: ph });
    book.ms += Date.now() - t0;
  };
  for (const j of packed) {
    const pw = Math.max(1, Math.ceil(j.w * o.scale)), ph = Math.max(1, Math.ceil(j.h * o.scale));
    if (!ctx || x + pw > PAGE) { x = 0; y += row + PAD; row = 0; }
    if (!ctx || y + ph > PAGE) { ctx = newPage(PAGE, PAGE); x = 0; y = 0; row = 0; }
    paint(ctx, j, x, y, pw, ph, o.scale);
    x += pw + PAD; row = Math.max(row, ph);
    yield ++done / total;
  }
  for (const j of own) {
    const s = Math.min(o.scale, PAGE / j.w, PAGE / j.h), pw = Math.ceil(j.w * s), ph = Math.ceil(j.h * s);
    paint(newPage(pw, ph), j, 0, 0, pw, ph, s);
    yield ++done / total;
  }
  return book;
}

/** 分帧跑 generate：每次最多 budgetMs 毫秒，然后让出这一帧 */
export function runSliced<T>(gen: Generator<number, T, void>, budgetMs = 8, onProgress?: (p: number) => void, later: (f: () => void) => void = f => { setTimeout(f, 0); }): Promise<T> {
  return new Promise((resolve, reject) => {
    const step = () => {
      const t0 = Date.now();
      try {
        for (;;) {
          const r = gen.next();
          if (r.done) { resolve(r.value); return; }
          onProgress?.(r.value);
          if (Date.now() - t0 >= budgetMs) break;
        }
      } catch (e) { reject(e); return; }
      later(step);
    };
    later(step);
  });
}
/** 出图倍数：设计宽 750 对应屏幕上多少物理像素，夹在 1–2，按 0.25 取整（缓存名里要用） */
export const artScale = (physicalWidth: number): number => Math.max(1, Math.min(2, Math.round(physicalWidth / 750 * 4) / 4));
