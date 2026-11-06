import { describe, expect, it } from 'vitest';
import { RAW_DATA, newSave, spawnEnemy, syncBattle, step, lastDamageBreakdown } from '../assets/scripts/core/index';
import { GameController, StorageLike } from '../assets/scripts/ui/GameController';
import { GameView } from '../assets/scripts/ui/GameView';

class MemoryStorage implements StorageLike {
  values: Record<string, string> = {};
  getItem(key: string): string | null { return this.values[key] ?? null; }
  setItem(key: string, value: string): void { this.values[key] = value; }
  removeItem(key: string): void { delete this.values[key]; }
}
function setup(development = false) {
  let now = 1000000;
  const storage = new MemoryStorage();
  const app = new GameController(RAW_DATA, storage, development, () => now);
  app.action('dismiss');
  const view = new GameView(app);
  return { app, view, storage, advance: (seconds: number) => { now += seconds; } };
}
function click(app: GameController, view: GameView, id: string, h = 1334) {
  const frame = view.render(h); const hit = frame.hitRegions.find(x => x.id === id);
  expect(hit, `Missing hit region ${id}`).toBeTruthy();
  app.pointerDown(hit!.x + hit!.w / 2, hit!.y + hit!.h / 2);
  app.pointerUp(hit!.x + hit!.w / 2, hit!.y + hit!.h / 2);
}

describe('presentation and controller integration', () => {
  it('shows intro, waits for acknowledgement, and starts the first live wave', () => {
    const app = new GameController(RAW_DATA, new MemoryStorage(), false, () => 1000); const view = new GameView(app);
    app.tick(1); expect(app.battle.time).toBe(0);
    click(app, view, 'modal-dismiss'); app.tick(1 / 30); expect(app.battle.time).toBeGreaterThan(0);
  });
  it('keeps gameplay and seed identical on short and tall screens', () => {
    const short = setup(), tall = setup(); short.view.render(1334); tall.view.render(1624);
    for (let i = 0; i < 300; i++) { short.app.tick(1 / 30); tall.app.tick(1 / 30); }
    expect(tall.app.save).toEqual(short.app.save); expect(tall.app.battle.seed).toBe(short.app.battle.seed);
  });
  it('keeps exact slot mapping and shifts only presentation y on tall screens', () => {
    const { app, view } = setup();
    expect(app.save.lineup.map((id, i) => id ? app.data.nest.slots[i].id : null).filter(Boolean)).toEqual(['O3', 'M2', 'M3']);
    const a = view.render(1334).hitRegions.find(r => r.id === 'slot-2')!;
    const b = view.render(1624).hitRegions.find(r => r.id === 'slot-2')!;
    expect(b.x).toBe(a.x); expect(b.y - a.y).toBe(290);
  });
  it('runs battle beneath an open tab and supports repeated close/tab changes', () => {
    const { app, view } = setup();
    click(app, view, 'tab-toys'); const time = app.battle.time; app.tick(1); expect(app.battle.time).toBeGreaterThan(time);
    click(app, view, 'panel-close'); expect(app.panel).toBeNull();
    click(app, view, 'tab-fort'); expect(app.panel).toBe('fort');
    app.tick(0.3); click(app, view, 'tab-settings'); expect(app.panel).toBe('settings');
  });
  it('does not pass panel or modal touches to the underlying battlefield', () => {
    const { app, view } = setup(); app.panel = 'settings';
    view.render(); app.pointerDown(40, 1000); app.pointerUp(40, 1000); expect(app.selectedSlot).toBeNull();
    app.modal = { kind: 'notice', title: '测试', lines: ['测试'] }; const frame = view.render();
    expect(frame.hitRegions.map(r => r.action)).toEqual(['dismiss']);
  });
  it('places and swaps toys live, while rejecting unopened positions', () => {
    const { app, view } = setup();
    app.action('slot', 0); expect(app.panel).toBeNull();
    click(app, view, 'slot-2'); expect(app.selectedSlot).toBe(2);
    click(app, view, 'swap'); expect(app.panel).toBeNull();
    click(app, view, 'slot-6'); expect(app.save.lineup[2]).toBe('huhu'); expect(app.save.lineup[6]).toBe('fangfang');
    expect(app.battle.units.find(u => u.id === 'fangfang')?.slot).toBe('M2');
  });
  it('holds upgrade to buy multiple levels and stops immediately on cancellation', () => {
    const { app, view } = setup(); app.save.sheep = 100000; app.panel = 'toys';
    const hit = view.render().hitRegions.find(r => r.id === 'level-fangfang')!;
    app.pointerDown(hit.x + 10, hit.y + 10);
    for (let i = 0; i < 45; i++) app.tick(1 / 30);
    expect(app.save.toys.fangfang.lv).toBeGreaterThan(3);
    app.pointerCancel(); const level = app.save.toys.fangfang.lv; app.tick(1); expect(app.save.toys.fangfang.lv).toBe(level);
  });
  it('long-presses an on-field doll for damage breakdown without opening formation', () => {
    const { app, view } = setup(); const hit = view.render().hitRegions.find(r => r.id === 'slot-2')!;
    app.pointerDown(hit.x + 10, hit.y + 10); app.tick(0.6);
    expect(app.modal?.kind).toBe('breakdown'); app.pointerUp(hit.x + 10, hit.y + 10); expect(app.panel).toBeNull();
  });
  it('shows support adjacency on the uncovered field before opening formation', () => {
    const { app, view } = setup(); app.save.toys.dingdang.got = true; app.save.lineup[6] = 'dingdang'; syncBattle(app.battle, app.save);
    click(app, view, 'slot-6'); expect(app.selectedSlot).toBe(6); expect(app.panel).toBeNull();
    const slot = app.data.nest.slots[6];
    const lines = view.render().commands.filter(c => c.kind === 'line' && c.color === '#f4ce73');
    expect(lines.length).toBe(slot.adjacent.length);
    expect(lines.every(c => c.layer === 0)).toBe(true);
    app.tick(0.3); click(app, view, 'slot-6'); expect(app.panel).toBe('placement');
  });
  it('cancels a held upgrade across hide/show without a pointer-up event', () => {
    const { app, view, advance } = setup(); app.save.sheep = 10000; app.panel = 'toys';
    const hit = view.render().hitRegions.find(r => r.id === 'level-fangfang')!;
    app.pointerDown(hit.x + 10, hit.y + 10); app.tick(0.6); const before = app.save.toys.fangfang.lv;
    app.suspend(); advance(10); app.resume(); app.tick(10); app.tick(1);
    expect(app.save.toys.fangfang.lv).toBe(before);
    // A fresh pointer gesture works without needing the lost end/cancel event.
    click(app, view, 'level-fangfang'); expect(app.save.toys.fangfang.lv).toBe(before + 1);
  });
  it('does not grant charge or cooldown time for instant repeated boss/retreat navigation', () => {
    const { app } = setup(); app.save.w = 49;
    app.battle.flash.charge = 7; app.battle.units.forEach(u => { u.skillClock = 3; u.attackClock = 0.4; u.dashClock = 5; });
    for (let i = 0; i < 20; i++) { app.action('boss'); app.action('retreat'); }
    expect(app.battle.flash.charge).toBe(7);
    expect(app.battle.units.every(u => u.skillClock === 3 && u.attackClock === 0.4 && u.dashClock === 5)).toBe(true);
  });
  it('shows exact recorded real-hit factors including active support and target conditions', () => {
    const { app } = setup(); app.save.toys.dingdang.got = true;
    app.save.lineup[2] = 'huhu'; app.save.lineup[6] = 'dingdang'; app.save.lineup[7] = 'fangfang'; syncBattle(app.battle, app.save);
    const attacker = app.battle.units.find(u => u.id === 'huhu')!, helper = app.battle.units.find(u => u.id === 'dingdang')!;
    helper.buffUntil = 10; attacker.attackClock = 2;
    const enemy = spawnEnemy(app.battle, app.data.zones[0].nightmares[0], { x: 375, y: 700, hp: 1000000 })[0];
    enemy.freezeUntil = 10; enemy.flashUntil = 10; enemy.burnUntil = 10; enemy.shell = 3;
    step(app.battle, 1 / 30, {});
    const result = lastDamageBreakdown(app.battle, 'huhu'); expect(result.mode).toBe('last-hit');
    app.action('breakdown', 'huhu'); const lines = app.modal!.lines;
    expect(lines.some(line => line.includes('最近真实命中'))).toBe(true);
    expect(lines).toContain('邻位攻击辅助（含叮当响） ×1.5');
    expect(lines).toContain(`原始值 ${String(result.total)}`);
    expect(lines.some(line => line.includes('带壳减伤'))).toBe(true);
    helper.buffUntil = 0; enemy.freezeUntil = 0; enemy.flashUntil = 0; enemy.burnUntil = 0; enemy.shell = 0;
    app.action('breakdown', 'huhu'); expect(app.modal!.lines).toEqual(lines);
  });
  it('paginates long damage detail without clipping or hiding any factors', () => {
    const { app, view } = setup();
    const lines = Array.from({ length: 60 }, (_, i) => `测试倍率第${i}项 ×1.2345678901234567`);
    app.modal = { kind: 'breakdown', title: '完整倍率', lines };
    const seen = new Set<string>();
    for (let page = 0; page < 20; page++) {
      const frame = view.render(1334); const dismiss = frame.hitRegions.find(h => h.id === 'modal-dismiss')!;
      for (const command of frame.commands) if (command.kind === 'text' && command.layer === 3) {
        expect(command.y + command.size * 1.3).toBeLessThanOrEqual(1334); expect(command.y).toBeGreaterThanOrEqual(0);
        if (command.text.startsWith('测试倍率')) { seen.add(command.text); expect(command.y + 31.2).toBeLessThan(dismiss.y - 68); }
      }
      const next = frame.hitRegions.find(h => h.id === 'modal-next'); if (!next?.enabled) break;
      app.action('modalPage', 1);
    }
    expect(seen.size).toBe(lines.length);
  });
  it('uses high-screen inverse transform for manual flashlight aiming', () => {
    const { app, view } = setup(); app.battle.flash.charge = app.data.flash.charge;
    const enemy = spawnEnemy(app.battle, app.data.zones[0].nightmares[0], { x: 400, y: 800, hp: 1000000 })[0];
    const hit = view.render(1624).hitRegions.find(r => r.id === 'flash')!;
    app.pointerDown(hit.x + 10, hit.y + 10); app.pointerMove(enemy.x, enemy.y + 290); app.tick(1 / 30);
    expect(app.battle.flash.aim).toBeCloseTo(Math.atan2(enemy.y - app.data.nest.center[1], enemy.x - app.data.nest.center[0]), 3);
    expect(app.save.autoFlash).toBe(false); app.pointerUp(enemy.x, enemy.y + 290);
  });
  it('credits wave kills immediately and settlement never credits them twice', () => {
    const { app } = setup();
    for (let i = 0; i < 150; i++) app.tick(1 / 30);
    expect(app.save.sheep).toBeGreaterThan(0); expect(app.battle.creditedSheep).toBe(app.battle.sheep);
    const sheep = app.save.sheep; app.tick(1 / 30); expect(app.save.sheep).toBeGreaterThanOrEqual(sheep);
  });
  it('settles offline only once and requires collecting the morning card to resume', () => {
    const { app, view, advance } = setup(); app.save.farm = { z: 0, w: 1, rates: [5], durations: [8] };
    app.suspend(); advance(3600); app.resume(); expect(app.save.sheep).toBe(18000); expect(app.modal?.kind).toBe('morning');
    const sheep = app.save.sheep; app.resume(); expect(app.save.sheep).toBe(sheep);
    const time = app.battle.time; app.tick(1); expect(app.battle.time).toBe(time);
    click(app, view, 'modal-dismiss'); app.tick(1 / 30); expect(app.battle.time).toBeGreaterThan(time);
  });
  it('does not replay stale background frame time after offline settlement', () => {
    const { app, advance } = setup(); app.save.farm = { z: 0, w: 1, rates: [5], durations: [8] };
    app.suspend(); advance(3600); app.resume(); app.action('dismiss');
    const time = app.battle.time, sheep = app.save.sheep; app.tick(3600);
    expect(app.battle.time).toBe(time); expect(app.save.sheep).toBe(sheep);
    app.tick(1 / 30); expect(app.battle.time).toBeGreaterThan(time);
  });
  it('hides development controls in a release session', () => {
    const { app, view } = setup(); app.panel = 'settings';
    expect(view.render().hitRegions.some(r => r.action === 'debug')).toBe(false);
    app.action('money', 1000); expect(app.save.sheep).toBe(0); app.action('debug'); expect(app.panel).toBe('settings');
  });
  it('shows correct star requirement (10,20,40,80) and daily/box gates', () => {
    const { app, view } = setup(); app.panel = 'toys';
    const texts = view.render().commands.filter(c => c.kind === 'text').map(c => c.kind === 'text' ? c.text : '');
    expect(texts).toContain('升星 10片'); expect(app.boxUnlocked).toBe(false); expect(app.dailyUnlocked).toBe(false);
  });
  it('keeps every panel and modal button inside the viewport at both heights', () => {
    const { app, view } = setup(true);
    for (const h of [1334, 1624]) for (const panel of ['toys', 'fort', 'daily', 'boxes', 'settings', 'debug', 'placement'] as const) {
      app.panel = panel; app.selectedSlot = panel === 'placement' ? 2 : null;
      const frame = view.render(h);
      for (const r of frame.hitRegions) { expect(r.x).toBeGreaterThanOrEqual(0); expect(r.x + r.w).toBeLessThanOrEqual(750); expect(r.y).toBeGreaterThanOrEqual(0); expect(r.y + r.h).toBeLessThanOrEqual(h); }
      const commands = frame.commands.filter(c => c.kind === 'text'); expect(commands.every(c => c.kind !== 'text' || c.size >= 22)).toBe(true);
    }
  });
  it('exports one CSV row per wave with average damage per second', () => {
    const { app } = setup(); for (let i = 0; i < 600; i++) app.tick(1 / 30);
    expect(app.rows.length).toBeGreaterThan(0); const csv = app.csv(); expect(csv.split('\r\n').length).toBe(app.rows.length + 1); expect(csv).toContain('全队平均DPS');
  });
  it('continues final-dream farming without advancing after campaign completion', () => {
    const { app } = setup(); app.save = newSave(app.data, 1000000); app.save.z = 2; app.save.w = 49; app.save.completed = true;
    for (const id of app.save.lineup) if (id) app.save.toys[id].lv = 600;
    app.battle = CoreStart(app); for (let i = 0; i < 600; i++) app.tick(1 / 30);
    expect(app.rows.length).toBeGreaterThan(1); expect(app.save.z).toBe(2); expect(app.save.w).toBe(49); expect(app.waveMessage).toBe('下一个梦还在路上');
  });
});
import { startWave } from '../assets/scripts/core/index';
function CoreStart(app: GameController) { syncBattle(app.battle, app.save); return startWave(app.data, app.save, { attempt: 0 }); }
