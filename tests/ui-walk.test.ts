import { describe, expect, it } from 'vitest';
import * as Core from '../assets/scripts/core/index';
import type { Point } from '../assets/scripts/core/index';
import { GameController, StorageLike } from '../assets/scripts/ui/GameController';
import { GameView } from '../assets/scripts/ui/GameView';

function setup() {
  const values = new Map<string, string>();
  const storage: StorageLike = { getItem: key => values.get(key) ?? null, setItem: (key, value) => { values.set(key, value); }, removeItem: key => { values.delete(key); } };
  const app = new GameController(Core.RAW_DATA, storage, true, () => 1000); app.action('dismiss');
  const view = new GameView(app);
  return { app, view, storage, values };
}
function begin(app: GameController, view: GameView, id: string, height = 1334) {
  const hit = view.render(height).hitRegions.find(region => region.id === id);
  expect(hit, `missing ${id}`).toBeDefined();
  app.pointerDown(hit!.x + hit!.w / 2, hit!.y + hit!.h / 2);
}
function drag(app: GameController, view: GameView, id: string, point: Point, height = 1334) {
  begin(app, view, id, height); app.pointerMove(point[0], point[1] + height - 1334); app.pointerUp(point[0], point[1] + height - 1334);
}
function tick(app: GameController, count = 1) { for (let i = 0; i < count; i++) app.tick(1 / 30); }

describe('walk-v2 pointer and presentation regression', () => {
  it('moves guard points through fixed-step inputs without teleporting mobile toys', () => {
    const { app, view } = setup(), unit = app.battle.units.find(u => u.id === 'huhu')!, before: Point = [unit.x, unit.y];
    drag(app, view, 'actor-huhu', [500, 1080]);
    expect(unit.home).not.toEqual([500, 1080]);
    tick(app); expect(unit.home).toEqual([500, 1080]);
    expect(app.save.lineup.find(item => item.id === 'huhu')!.home).toEqual([500, 1080]);
    expect(Math.hypot(unit.x - before[0], unit.y - before[1])).toBeLessThan(10);
    expect(app.homeInputs[0]).toMatchObject({ seed: app.battle.seed, z: 0, w: 1, tick: 0, homes: { huhu: [500, 1080] } });
  });
  it('has identical logical drag results at 1334 and 1624 heights', () => {
    const short = setup(), tall = setup();
    drag(short.app, short.view, 'actor-huhu', [460, 1100], 1334);
    drag(tall.app, tall.view, 'actor-huhu', [460, 1100], 1624);
    tick(short.app, 90); tick(tall.app, 90);
    expect(tall.app.save).toEqual(short.app.save); expect(tall.app.homeInputs).toEqual(short.app.homeInputs);
  });
  it('persists a committed drop before the next frame, including immediate backgrounding', () => {
    const { app, view, storage } = setup(); drag(app, view, 'actor-huhu', [460, 1100]); app.suspend();
    const loaded = new GameController(Core.RAW_DATA, storage, true, () => 1000);
    expect(loaded.save.lineup.find(item => item.id === 'huhu')!.home).toEqual([460, 1100]); expect(loaded.modal).toBeNull();
  });
  it('cancels a stationary live drag transaction even if hidden and reopened before another frame', () => {
    const { app, view, storage } = setup(); app.save.toys.dingdang.got = true;
    app.save.lineup[0] = { id: 'dingdang', home: [375, 1080] }; Core.syncBattle(app.battle, app.save);
    begin(app, view, 'actor-dingdang'); app.pointerMove(450, 1120); tick(app);
    expect(app.battle.units.find(u => u.id === 'dingdang')?.x).toBe(450);
    app.suspend(); const loaded = new GameController(Core.RAW_DATA, storage, true, () => 1000);
    expect(loaded.save.lineup.find(item => item.id === 'dingdang')!.home).toEqual([375, 1080]);
    app.resume(); tick(app, 2); expect(app.battle.units.find(u => u.id === 'dingdang')!.home).toEqual([375, 1080]);
  });
  it('drags a field toy out, then restores it from a card and clamps wall-margin drops', () => {
    const { app, view } = setup(); drag(app, view, 'actor-huhu', [200, 500]); expect(app.save.lineup.some(item => item.id === 'huhu')).toBe(false);
    expect(app.battle.units.some(unit => unit.id === 'huhu')).toBe(false);
    app.action('tab', 'toys'); drag(app, view, 'card-huhu', [375, 820]);
    expect(app.panel).toBeNull(); const placed = app.save.lineup.find(item => item.id === 'huhu')!;
    expect(placed.home).toEqual(Core.clampHome(app.data, [375, 820])); expect(Core.isOnGround(app.data, placed.home)).toBe(true);
  });
  it('rejects a new card when the current fort cap is full without changing the lineup', () => {
    const { app, view } = setup(); app.save.toys.dingdang.got = true; app.action('tab', 'toys'); app.page = 1;
    const before = JSON.stringify(app.save.lineup); drag(app, view, 'card-dingdang', [450, 1120]);
    expect(JSON.stringify(app.save.lineup)).toBe(before); expect(app.toast).toBe('名额满了，先拖一只下来');
  });
  it('cancels a card drag with no deployment and restores its panel', () => {
    const { app, view } = setup(); drag(app, view, 'actor-huhu', [200, 500]); app.action('tab', 'toys');
    begin(app, view, 'card-huhu'); app.pointerMove(450, 1100); expect(app.panel).toBeNull();
    app.pointerCancel(); app.pointerUp(450, 1100); expect(app.panel).toBe('toys'); expect(app.save.lineup.some(item => item.id === 'huhu')).toBe(false);
  });
  it('does not turn a long press or modal dismissal into an accidental drag', () => {
    const { app, view } = setup(), before = JSON.stringify(app.save.lineup);
    begin(app, view, 'actor-huhu'); tick(app, 18); expect(app.modal?.kind).toBe('breakdown');
    app.pointerMove(200, 500); app.pointerUp(200, 500); expect(JSON.stringify(app.save.lineup)).toBe(before);
    app.action('dismiss'); expect(app.drag).toBeNull();
  });
  it('drags facilities in, moves them and drags them out without changing toy slots', () => {
    const { app, view } = setup(); app.save.maxW = 49;
    const id = app.data.devices[0].id, lineup = JSON.stringify(app.save.lineup);
    app.action('tab', 'fort'); drag(app, view, `card-device-${id}`, [80, 1140]);
    expect(app.save.devices[0]).toEqual({ id, home: [80, 1140] });
    drag(app, view, `device-${id}`, [650, 1130]); expect(app.save.devices[0].home).toEqual([650, 1130]);
    drag(app, view, `device-${id}`, [680, 500]); expect(app.save.devices).toEqual([]); expect(JSON.stringify(app.save.lineup)).toBe(lineup);
  });
  it('renders no slot pads or swap controls and selection renders guard/range/reach/aura cues', () => {
    const { app, view } = setup(); app.save.lineup[0] = { id: 'dingdang', home: [375, 1060] }; app.save.toys.dingdang.got = true; Core.syncBattle(app.battle, app.save); app.selectedActor = 'dingdang';
    const frame = view.render(); expect(frame.hitRegions.some(hit => /slot|swap/.test(hit.id))).toBe(false);
    expect(frame.commands.some(command => command.kind === 'poly' && command.color === '#a1ccec')).toBe(true);
    expect(frame.commands.some(command => command.kind === 'line' && command.color === '#85d897b0')).toBe(true);
    expect(frame.commands.some(command => command.kind === 'line' && command.color === '#efc36c66')).toBe(true);
  });
  it('does not create fake projectiles or damage numbers at attack windup', () => {
    const { app, view } = setup(); app.battle.nextSpawn = 100;
    const enemy = Core.spawnEnemy(app.battle, app.data.zones[0].nightmares[0], { x: 235, y: 650, hp: 1000000 })[0]; enemy.speed = 0;
    app.battle.units.forEach(unit => { unit.attackClock = unit.id === 'huhu' ? 5 : -100; });
    tick(app); view.render(); expect(app.effects.filter(effect => effect.type === 'shot' || effect.type === 'damage')).toHaveLength(0);
    expect(Core.actors(app.battle).shots).toHaveLength(0);
    tick(app, 9); expect(Core.actors(app.battle).shots.length).toBeGreaterThan(0); expect(app.effects.some(effect => effect.type === 'damage')).toBe(false);
    for (let i = 0; i < 40 && !app.effects.some(effect => effect.type === 'damage'); i++) tick(app);
    expect(app.effects.some(effect => effect.type === 'hit')).toBe(true); expect(app.effects.some(effect => effect.type === 'damage')).toBe(true);
  });
  it('freezes projectile muzzle geometry at release despite turns, movement or source removal', () => {
    const { app, view } = setup(); app.battle.nextSpawn = 100;
    const enemy = Core.spawnEnemy(app.battle, app.data.zones[0].nightmares[0], { x: 235, y: 650, hp: 1000000 })[0]; enemy.speed = 0;
    app.battle.units.forEach(unit => { unit.attackClock = unit.id === 'huhu' ? 5 : -100; });
    for (let i = 0; i < 30 && !Core.actors(app.battle).shots.length; i++) tick(app);
    expect(app.projectileMuzzles.size).toBe(1);
    const projectile = () => { const shapes = view.render().commands.filter(command => command.kind === 'poly' && command.color === '#e8a071'); return shapes[shapes.length - 1]; };
    const before = projectile(); const unit = app.battle.units.find(unit => unit.id === 'huhu')!;
    unit.face = 'side'; unit.flip = true; unit.x += 100;
    expect(projectile()).toEqual(before);
    app.save = Core.place(app.data, app.save, 'huhu', null)!; Core.syncBattle(app.battle, app.save);
    expect(projectile()).toEqual(before);
  });
  it('keeps the captain label and hit target behind a foreground blocker', () => {
    const { app, view } = setup(), unit = app.battle.units.find(unit => unit.id === 'fangfang')!;
    unit.x = 375; unit.y = 838;
    const frame = view.render();
    const label = frame.commands.find(command => command.kind === 'text' && command.text.startsWith('绵绵 ★'))!;
    expect(label.kind === 'text' && label.y + label.size * 1.3).toBeLessThan(unit.y - app.data.nest.dollSize);
    const captainIndex = frame.hitRegions.findIndex(hit => hit.id === 'captain');
    const actorIndex = frame.hitRegions.findIndex(hit => hit.id === 'actor-fangfang'); expect(actorIndex).toBeGreaterThan(captainIndex);
    app.pointerDown(375, 770); app.pointerUp(375, 770); expect(app.selectedActor).toBe('fangfang'); expect(app.panel).toBeNull();
  });
  it('loads a v1 twelve-slot save through the UI migration entry point, then loads its v2 save', () => {
    const { app, storage } = setup(); const legacy = { ...app.save, version: 1, lineup: ['huhu', null, 'fangfang', 'gaga', ...Array(8).fill(null)], devices: [null, null, null] };
    storage.setItem('zhentou.save.v1', JSON.stringify(legacy));
    const first = new GameController(Core.RAW_DATA, storage, false, () => 1000); expect(first.save.version).toBe(2); expect(first.save.lineup.map(item => item.id)).toEqual(['huhu', 'fangfang', 'gaga']); expect(first.modal).toBeNull();
    const second = new GameController(Core.RAW_DATA, storage, false, () => 1000); expect(second.save.lineup).toEqual(first.save.lineup); expect(second.modal).toBeNull();
  });
});
