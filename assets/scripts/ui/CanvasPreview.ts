import { GameController, StorageLike } from './GameController';
import { GameView } from './GameView';
import type { DrawCommand } from './Draw';
import { THEME } from './Theme';
import { ARTCODE } from '../art/artcode.gen';
import { ArtBook, artScale, generate, runSliced } from '../art/ArtGen';
import { ArtView } from '../art/ArtView';

/** Diagnostic H5 harness. This is not a Cocos export, nor a replacement for WeChat/device verification. */
export function drawCanvas(ctx: CanvasRenderingContext2D, commands: DrawCommand[], book: ArtBook | null = null): void {
  for (const command of [...commands].sort((a, b) => a.layer - b.layer)) {
    if (command.kind === 'sprite') {
      const r = book?.get(command.img); if (!r || !book) continue;
      const m = command.m;
      ctx.save(); ctx.transform(m[0], m[1], m[2], m[3], m[4], m[5]); ctx.globalAlpha = command.alpha; if (command.add) ctx.globalCompositeOperation = 'lighter';
      ctx.drawImage(book.pages[r.page] as CanvasImageSource, r.x, r.y, r.w, r.h, 0, 0, command.w, command.h); ctx.restore();
    }
    else if (command.kind === 'rect') { ctx.fillStyle = command.color; ctx.fillRect(command.x, command.y, command.w, command.h); }
    else if (command.kind === 'line') { ctx.strokeStyle = command.color; ctx.lineWidth = command.width; ctx.beginPath(); ctx.moveTo(command.x, command.y); ctx.lineTo(command.x2, command.y2); ctx.stroke(); }
    else if (command.kind === 'poly') { ctx.fillStyle = command.color; ctx.beginPath(); command.points.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.closePath(); ctx.fill(); }
    else {
      ctx.fillStyle = command.color; ctx.font = `${command.size}px "Noto Sans CJK SC", "Microsoft YaHei", "PingFang SC", sans-serif`;
      ctx.textAlign = command.align; ctx.textBaseline = 'top';
      ctx.fillText(command.text, command.x + (command.align === 'center' ? command.width / 2 : command.align === 'right' ? command.width : 0), command.y);
    }
  }
}

export async function startCanvasPreview(canvas: HTMLCanvasElement): Promise<GameController> {
  const context = canvas.getContext('2d'); if (!context) throw new Error('当前浏览器不支持 Canvas 2D');
  const source = canvas.dataset.src ?? './levels.json';
  const response = await fetch(source); if (!response.ok) throw new Error(`无法读取关卡数据（${response.status}）`);
  const data: unknown = await response.json();
  const storage: StorageLike = { getItem: k => window.localStorage.getItem(k), setItem: (k, v) => window.localStorage.setItem(k, v), removeItem: k => window.localStorage.removeItem(k) };
  const development = new URLSearchParams(window.location.search).get('debug') === '1';
  const app = new GameController(data, storage, development);
  const view = new GameView(app);
  // 美术：在浏览器里调美术的出图代码画进图集，画好之前照旧是色块（URL 加 ?art=0 只看色块）
  let book: ArtBook | null = null;
  if (new URLSearchParams(window.location.search).get('art') !== '0') {
    const makeCanvas = (w: number, h: number) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
    const scale = artScale(Math.min(window.innerWidth, window.innerHeight * 750 / 1334) * Math.min(3, window.devicePixelRatio || 1));
    runSliced(generate(ARTCODE, { scale, makeCanvas, grain: THEME.artGrain }), THEME.artSliceMs)
      .then(b => { book = b; const art = view.art = new ArtView(b, app.data); app.muzzleOf = unit => art.muzzle(unit, app.battle.time); console.info(`ArtGen：${b.regions.size} 张，${b.pages.length} 页图集，出图 ${b.ms} 毫秒，倍数 ${b.scale}，美术代码 ${b.version}`); })
      .catch(error => console.error('ArtGen 出图失败，继续用色块', error));
  }
  let designHeight = 1334;
  const resize = () => {
    const cssWidth = Math.min(window.innerWidth, window.innerHeight * 750 / 1334);
    designHeight = Math.max(1334, Math.round(window.innerHeight / cssWidth * 750));
    const dpr = Math.min(3, window.devicePixelRatio || 1);
    canvas.style.width = `${cssWidth}px`; canvas.style.height = `${window.innerHeight}px`;
    canvas.width = Math.round(cssWidth * dpr); canvas.height = Math.round(window.innerHeight * dpr);
    context.setTransform(canvas.width / 750, 0, 0, canvas.height / designHeight, 0, 0);
  };
  resize(); window.addEventListener('resize', resize);
  const point = (event: PointerEvent) => { const box = canvas.getBoundingClientRect(); return [(event.clientX - box.left) / box.width * 750, (event.clientY - box.top) / box.height * designHeight] as const; };
  let pointerId: number | null = null;
  const cancelPointer = () => { pointerId = null; app.pointerCancel(); };
  canvas.addEventListener('pointerdown', e => { if (pointerId !== null) return; e.preventDefault(); pointerId = e.pointerId; canvas.setPointerCapture(e.pointerId); const [x, y] = point(e); app.pointerDown(x, y); });
  canvas.addEventListener('pointermove', e => { if (e.pointerId !== pointerId) return; const [x, y] = point(e); app.pointerMove(x, y); });
  canvas.addEventListener('pointerup', e => { if (e.pointerId !== pointerId) return; pointerId = null; const [x, y] = point(e); app.pointerUp(x, y); });
  canvas.addEventListener('pointercancel', e => { if (e.pointerId === pointerId) cancelPointer(); });
  canvas.addEventListener('lostpointercapture', e => { if (e.pointerId === pointerId) cancelPointer(); });
  window.addEventListener('blur', cancelPointer);
  document.addEventListener('visibilitychange', () => document.hidden ? (cancelPointer(), app.suspend()) : app.resume());
  window.addEventListener('pagehide', () => app.suspend()); window.addEventListener('pageshow', () => app.resume());
  window.addEventListener('keydown', e => {
    if (e.key === 'Escape') app.action(app.modal ? 'dismiss' : 'close');
    if (e.key === 'F3' && development) { e.preventDefault(); app.action('overlay'); }
    const tabs = ['toys', 'fort', 'daily', 'boxes', 'settings']; const tab = Number(e.key) - 1;
    if (tab >= 0 && tab < tabs.length && !app.modal) app.action('tab', tabs[tab]);
  });
  app.onExport = csv => {
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' })); const link = document.createElement('a');
    link.href = url; link.download = `zhentou-waves-${new Date().toISOString().slice(0, 10)}.csv`; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  let last = performance.now();
  const frame = (time: number) => { const dt = (time - last) / 1000; last = time; app.tick(dt); drawCanvas(context, view.render(designHeight).commands, book); requestAnimationFrame(frame); };
  requestAnimationFrame(frame);
  // Explicitly opt-in: automated QA can inspect the same state that the real UI uses.
  if (development) (window as unknown as { pillowfort?: { app: GameController; view: GameView; render: () => void; art: () => ArtBook | null } }).pillowfort = { app, view, render: () => drawCanvas(context, view.render(designHeight).commands, book), art: () => book };
  return app;
}

if (typeof document !== 'undefined') {
  const canvas = document.getElementById('game');
  if (canvas instanceof HTMLCanvasElement) startCanvasPreview(canvas).catch(error => {
    const message = document.createElement('p'); message.textContent = `启动失败：${error instanceof Error ? error.message : String(error)}`;
    message.style.cssText = 'color:white;padding:24px;white-space:pre-wrap'; canvas.replaceWith(message); console.error(error);
  });
}
