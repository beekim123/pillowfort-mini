import { describe, it, expect } from 'vitest';
import { DATA as d, RAW_DATA } from '../assets/scripts/core/default-data.ts';
import { loadData } from '../assets/scripts/core/data.ts';
import { newSave, copySave, lvCap, lvCost, slotsOf, toyAtk, teamMul, damageBreakdown, supportBonus, levelUp, fortUp, levelAllToCap, place, placeDevice, openBox, wish, starUp, startDaily, dailyCost, settleOffline, advanceClocks } from '../assets/scripts/core/economy.ts';
import { parseSave, serializeSave } from '../assets/scripts/core/state.ts';
import { clampHome, isOnGround } from '../assets/scripts/core/ground.ts';
import type { Point } from '../assets/scripts/core/types.ts';

const owned = () => { const s = newSave(d, 42); for (const toy of Object.values(s.toys)) toy.got = true; return s; };

describe('v2 data and free-placement economy', () => {
  it('reads only P1 and all movement/projectile fields without mutating the source', () => {
    const source = JSON.stringify(RAW_DATA), data = loadData(RAW_DATA);
    expect(data.version).toBe(2); expect(data.zones).toHaveLength(3); expect(data.toys).toHaveLength(9); expect(data.devices).toHaveLength(2);
    expect(data.toys.every(t => data.stance.range[t.range] && t.reach > 0 && t.windup >= 0 && t.shot.kind)).toBe(true);
    expect(data.toys.map(t => t.shot.kind)).toEqual(['lob','straight','beam','lob','chain','straight','melee','straight','straight']);
    expect(data.nest.spawn.speed).toBe(56); expect(data.nest).not.toHaveProperty('slots'); expect(data.nest.spawn).not.toHaveProperty('lanes');
    expect(data.byToy.dingdang.desc).toContain('光环'); expect(data.byToy.dingdang.desc).not.toContain('同一排');
    expect(JSON.stringify(RAW_DATA)).toBe(source);
  });
  it('rejects old or incomplete movement data', () => {
    expect(() => loadData({ ...RAW_DATA, version: 1 })).toThrow();
    expect(() => loadData({ ...RAW_DATA, nest: { ...RAW_DATA.nest, homes: [] } })).toThrow();
  });
  it('starts three toys and lamp with independent default homes', () => {
    const s = newSave(d, 0);
    expect(s.version).toBe(2); expect(s.lineup).toEqual(d.toys.slice(0, 3).map((t, i) => ({ id: t.id, home: d.nest.homes[i] })));
    expect(s.devices).toEqual([{ id: 'nightlight', home: d.nest.deviceHomes[0] }]);
    s.lineup[0].home[0] = 0; expect(d.nest.homes[0][0]).toBe(375);
  });
  it('uses v2 attack and cap values, preserving over-cap cost growth', () => {
    expect(d.econ.atk0).toBe(6); expect(lvCap(d, 0)).toBe(100); expect(lvCap(d, 3)).toBe(304);
    expect(lvCost(d, 1, 0)).toBe(2); expect(lvCost(d, 100, 0) / lvCost(d, 99, 0)).toBeCloseTo(1.09 * 1.5);
    expect(lvCost(d, 101, 0) / lvCost(d, 100, 0)).toBeCloseTo(1.09 * 1.5);
  });
  it('caps toy quota at six and converts every later milestone to room', () => {
    for (const [level, raw] of d.slots.toy) {
      expect(slotsOf(d, level)).toMatchObject({ toy: Math.min(raw, d.slots.toyCap), room: Math.max(1, raw / d.slots.toyCap) });
      if (level > 1) expect(slotsOf(d, level - 1).toy).toBeLessThanOrEqual(slotsOf(d, level).toy);
    }
    expect(slotsOf(d, 22).room).toBeCloseTo(7 / 6); expect(slotsOf(d, 72).room).toBe(2);
    expect(slotsOf(d, 11).device).toBe(1); expect(slotsOf(d, 12).device).toBe(2); expect(slotsOf(d, 35).device).toBe(3);
  });
  it('exposes room as its own multiplicative damage component', () => {
    const s = newSave(d, 0); s.fort = 72;
    const team = teamMul(d, s), hit = damageBreakdown(d, s, 'fangfang');
    expect(team.parts.find(p => p.name === '枕头堡宽敞')?.mul).toBe(2);
    expect(team.total).toBeCloseTo(team.parts.reduce((a, p) => a * p.mul, 1));
    expect(hit.total).toBeCloseTo(toyAtk(d, 'fangfang', 1, 1) * team.total);
  });
  it('clamps homes to the continuous ground and never aliases input', () => {
    for (const home of [[-999, -999], [9999, 9999], [375, 200], [40, 1196], [710, 1196], [375, 930]] as Point[]) {
      const output = clampHome(d, home); expect(isOnGround(d, output)).toBe(true); expect(output).not.toBe(home);
    }
    expect(isOnGround(d, [375, 800])).toBe(false); expect(isOnGround(d, [375, 1197])).toBe(false);
  });
  it('moves a full lineup, removes toys, rejects locked/unknown toys and fills freed room immutably', () => {
    const s = owned(), home: Point = [375, 1000];
    expect(place(d, s, 'dingdang', home)).toBeNull();
    const moved = place(d, s, 'huhu', [-100, 0])!;
    expect(moved.lineup).toHaveLength(3); expect(isOnGround(d, moved.lineup.find(p => p.id === 'huhu')!.home)).toBe(true);
    expect(s.lineup[1].home).toEqual(d.nest.homes[1]);
    const removed = place(d, moved, 'fangfang', null)!; expect(removed.lineup).toHaveLength(2);
    const added = place(d, removed, 'dingdang', home)!; expect(added.lineup.map(p => p.id)).toEqual(['huhu','gaga','dingdang']);
    expect(added.lineup[2].home).not.toBe(home); expect(place(d, added, 'constructor', home)).toBeNull();
    expect(place(d, newSave(d, 0), 'abing', home)).toBeNull(); expect(place(d, s, 'huhu', [NaN, 0])).toBeNull();
    expect(place(d, s, 'huhu', [Infinity, 0])).toBeNull();
  });
  it('limits devices independently, moves them when full, and removes them', () => {
    const s = newSave(d, 0); s.maxZ = 1; s.maxW = 50;
    expect(placeDevice(d, s, 'fan', [400, 1000])).toBeNull();
    const moved = placeDevice(d, s, 'nightlight', [10000, 10000])!;
    expect(moved.devices).toHaveLength(1); expect(isOnGround(d, moved.devices[0].home)).toBe(true);
    const removed = placeDevice(d, s, 'nightlight', null)!;
    expect(placeDevice(d, removed, 'fan', [375, 1000])!.devices[0].id).toBe('fan');
    s.fort = 12; expect(placeDevice(d, s, 'fan', [375, 1000])!.devices).toHaveLength(2);
    expect(placeDevice(d, newSave(d, 0), 'fan', [375, 1000])).toBeNull();
  });
  it('applies aura only to other toys in radius, and accepts live positions', () => {
    const s = owned(); s.fort = 72;
    s.lineup = [{ id: 'dingdang', home: [375, 1000] }, { id: 'fangfang', home: [200, 1000] }, { id: 'huhu', home: [551, 1000] }];
    expect(supportBonus(d, s, 'fangfang')).toBeCloseTo(.2); expect(supportBonus(d, s, 'huhu')).toBe(0); expect(supportBonus(d, s, 'dingdang')).toBe(0);
    expect(supportBonus(d, s, 'fangfang', { fangfang: [199, 1000] })).toBe(0);
    expect(damageBreakdown(d, s, 'fangfang').total).toBeCloseTo(toyAtk(d, 'fangfang', 1, 1) * teamMul(d, s).total * 1.2);
    expect(damageBreakdown(d, s, 'huhu').total).toBeCloseTo(toyAtk(d, 'huhu', 1, 1) * teamMul(d, s).total);
  });
  it('upgrades immutably, chooses cheapest levels and cannot overspend', () => {
    const s = newSave(d, 0); s.sheep = 6; const n = levelAllToCap(d, s);
    expect(s.sheep).toBe(6); expect(n.sheep).toBe(0); expect(n.lineup.every(p => n.toys[p.id].lv === 2)).toBe(true);
    expect(levelUp(d, n, 'huhu')).toBeNull(); expect(fortUp(d, n)).toBeNull();
  });
  it('keeps seeded crate selection within +/-3% of 75% after lineup migration', () => {
    let s = newSave(d, 0); s.maxW = 25; s.toys.dingdang.got = true; s.candy = 1e6;
    const active = new Set([...s.lineup.map(p => p.id), d.captain.id]); let count = 0;
    for (let i = 0; i < 1000; i++) { const opened = openBox(d, s, false)!; s = opened.save; count += opened.shards.filter(id => active.has(id)).length; }
    expect(count / 3000).toBeGreaterThan(.72); expect(count / 3000).toBeLessThan(.78);
  });
  it('retains wish, star and daily economy', () => {
    let s = newSave(d, 0); s.maxW = 50; s.candy = 100; s = wish(d, s, 'mianmian')!;
    expect(s.captain.shards).toBe(3); s.toys.fangfang.shards = 10; s = starUp(d, s, 'fangfang')!;
    expect(s.toys.fangfang.star).toBe(2); expect(s.toys.fangfang.shards).toBe(0); expect(s.candy).toBe(80);
    s.sheep = 1e9; s = startDaily(d, s, 0)!; const n = advanceClocks(d, s, 21600);
    expect(n.daily.done).toBe(1); expect(n.daily.endAt).toBe(43200); expect(n.boxes.free).toBe(1);
    expect(teamMul(d, n).total / teamMul(d, s).total).toBeCloseTo(1.1);
    expect(dailyCost(d, s)).toBeCloseTo(20 * 8 * (69183 * .01 + 3));
  });
});

describe('save v2 migration and validation', () => {
  it('compacts legacy slots in order, places the first six, keeps overflow ownership and all resources', () => {
    const s = owned(); s.fort = 72; s.maxZ = 2; s.maxW = 50; s.sheep = 1e250; s.candy = 300; s.courage = 3;
    s.toys.abing.lv = 237; s.toys.abing.star = 4; s.toys.abing.shards = 19;
    s.farm = { z: 1, w: 32, rates: [12, 13, 14], durations: [10, 11, 12] };
    s.firstClear[0] = '1'.repeat(50); s.bossBest[2] = .63; s.rng = 42;
    const ids = ['abing','laowa','ruanruan','piaopiao','kaka','dingdang','gaga','huhu','fangfang'];
    const raw = { ...s, version: 1, lineup: [null, ids[0], null, ...ids.slice(1), null], devices: [null, 'fan', 'nightlight'] };
    const migrated = parseSave(d, JSON.stringify(raw), 100);
    expect(migrated.version).toBe(2); expect(migrated.lineup).toEqual(ids.slice(0, 6).map((id, i) => ({ id, home: d.nest.homes[i] })));
    expect(migrated.devices).toEqual([{ id: 'fan', home: d.nest.deviceHomes[0] }, { id: 'nightlight', home: d.nest.deviceHomes[1] }]);
    for (const key of ['toys','captain','sheep','candy','courage','farm','firstClear','rng'] as const) expect(migrated[key]).toEqual(s[key]);
    expect(migrated.toys.gaga.got).toBe(true); expect(migrated.toys.huhu.got).toBe(true); expect(migrated.toys.fangfang.got).toBe(true);
    expect(parseSave(d, serializeSave(migrated), 200)).toEqual(migrated);
  });
  it('caps legacy migration by toyCap, not fort quota, and survives the next v2 load', () => {
    const s = owned(), ids = d.toys.map(t => t.id);
    const migrated = parseSave(d, JSON.stringify({ ...s, version: 1, lineup: ids }), 100);
    expect(migrated.lineup).toHaveLength(6); expect(parseSave(d, serializeSave(migrated), 101).lineup).toEqual(migrated.lineup);
    expect(place(d, migrated, migrated.lineup[0].id, [375, 930])).not.toBeNull();
  });
  it('filters unknown, duplicate and unowned legacy IDs without consuming valid positions', () => {
    const s = newSave(d, 0);
    const migrated = parseSave(d, JSON.stringify({ ...s, version: 1, lineup: ['unknown', 'constructor', 'fangfang', 'fangfang', null, 'abing', 'huhu', 'gaga'], devices: ['nightlight', 'nightlight', 'fan'] }), 10);
    expect(migrated.lineup.map(p => p.id)).toEqual(['fangfang','huhu','gaga']); expect(migrated.lineup.map(p => p.home)).toEqual(d.nest.homes.slice(0, 3));
    expect(migrated.devices).toEqual([{ id: 'nightlight', home: d.nest.deviceHomes[0] }]);
  });
  it('keeps legitimate v2 homes and repairs invalid/out-of-ground coordinates', () => {
    const s = newSave(d, 42); s.lineup[0].home = [400, 1000]; s.sheep = 1e250;
    expect(parseSave(d, serializeSave(s), 50).lineup).toEqual(s.lineup);
    const raw = JSON.parse(serializeSave(s)); raw.lineup[0].home = [-5000, 5000]; raw.lineup[1].home = [null, 'x']; raw.lineup.push({ id: 'huhu', home: [300, 1000] });
    raw.devices[0].home = [1e300, -1e300]; raw.sheep = -20; raw.toys.fangfang.star = 999;
    const parsed = parseSave(d, JSON.stringify(raw), 50);
    expect(parsed.lineup).toHaveLength(3); expect(parsed.lineup.every(p => isOnGround(d, p.home))).toBe(true);
    expect(parsed.lineup[1].home).toEqual(d.nest.homes[1]); expect(parsed.devices.every(p => isOnGround(d, p.home))).toBe(true);
    expect(parsed.sheep).toBe(0); expect(parsed.toys.fangfang.star).toBe(5);
  });
  it.each(['{broken', 'null', '[]', '1', '{"version":99}', '{"version":2,"toys":null,"stats":3,"captain":[]}', '{"version":1,"lineup":[null,null],"devices":[null]}'])('handles malformed/partial save safely: %s', text => {
    const s = parseSave(d, text, 50); expect(s.version).toBe(2); expect(s.lastSeen).toBe(50); expect(Number.isFinite(s.sheep)).toBe(true);
    expect(s.lineup.every(p => isOnGround(d, p.home))).toBe(true);
  });
  it('preserves offline minimum, cap, candy, negative clock and does not double-claim after migration', () => {
    const s = newSave(d, 100); s.farm = { z: 0, w: 5, rates: [9, 10, 11], durations: [10, 10, 10] };
    const migrated = parseSave(d, JSON.stringify({ ...s, version: 1, lineup: ['fangfang','huhu','gaga'], devices: ['nightlight'] }), 100);
    expect(settleOffline(d, migrated, 130).card).toBeNull();
    const two = settleOffline(d, migrated, 7300); expect(two.card?.sheep).toBe(72000); expect(two.card?.candy).toBe(4); expect(two.card?.kills).toBe(5760);
    const loaded = parseSave(d, serializeSave(two.save), 7300); expect(settleOffline(d, loaded, 7300).card).toBeNull();
    const twenty = settleOffline(d, migrated, 72100); expect(twenty.card?.seconds).toBe(28800); expect(twenty.card?.sheep).toBe(288000);
    expect(settleOffline(d, migrated, 50).save.sheep).toBe(s.sheep); expect(settleOffline(d, migrated, 50).save.lastSeen).toBe(50);
  });
});
