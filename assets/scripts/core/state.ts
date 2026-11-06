import { newSave, slotsOf, availableDevices } from './economy.ts';
import { clamp } from './big.ts';
import { clampHome, isPoint } from './ground.ts';
import type { GameData, Placement, Point, Save } from './types.ts';

export function serializeSave(s: Save): string { return JSON.stringify(s); }
const record = (value: unknown): Record<string, unknown> => value !== null && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {};

/** Validate local JSON and migrate v1 deterministically. Never apply external properties wholesale. */
export function parseSave(d: GameData, text: string | null, now: number): Save {
  const fresh = newSave(d, now);
  if (!text) return fresh;
  let raw: Record<string, unknown>;
  try { raw = record(JSON.parse(text)); } catch { return fresh; }
  if (raw.version !== 1 && raw.version !== 2) return fresh;
  const legacy = raw.version === 1;
  const num = (v: unknown, fallback: number, min = 0, max = d.big.max) => typeof v === 'number' && Number.isFinite(v) ? Math.min(max, Math.max(min, v)) : fallback;
  const integer = (v: unknown, fallback: number, min = 0, max = Number.MAX_SAFE_INTEGER) => Math.floor(num(v, fallback, min, max));
  fresh.z = integer(raw.z, 0, 0, d.zones.length - 1);
  fresh.w = integer(raw.w, 1, 1, d.wave.perZone - 1);
  fresh.maxZ = integer(raw.maxZ, 0, 0, d.zones.length - 1);
  fresh.maxW = integer(raw.maxW, 0, 0, d.wave.perZone);
  fresh.courage = integer(raw.courage, 0, 0, d.zones.length);
  fresh.fort = integer(raw.fort, 1, 1, d.rules.tableSize);
  fresh.sheep = num(raw.sheep, 0);
  fresh.candy = integer(raw.candy, 0);
  fresh.stay = raw.stay === true;
  fresh.pushBlock = integer(raw.pushBlock, 0, 0, d.wave.retryAfter);
  fresh.autoFlash = raw.autoFlash !== false;
  fresh.completed = raw.completed === true;
  const toys = record(raw.toys);
  for (const t of d.toys) {
    const x = record(toys[t.id]);
    fresh.toys[t.id] = {
      lv: integer(x.lv, 1, 1, d.rules.tableSize),
      star: integer(x.star, 1, 1, d.econ.starShards.length),
      shards: integer(x.shards, 0),
      got: fresh.toys[t.id].got || x.got === true,
    };
  }
  const captain = record(raw.captain);
  fresh.captain = { star: integer(captain.star, 1, 1, d.econ.captainAura.length), shards: integer(captain.shards, 0) };

  const placements = (values: unknown[], homes: Point[], cap: number, allowed: (id: string) => boolean): Placement[] => {
    const result: Placement[] = [], seen = new Set<string>();
    for (const value of values) {
      const entry = record(value), id = legacy ? value : entry.id;
      if (typeof id !== 'string' || !allowed(id) || seen.has(id)) continue;
      if (result.length >= cap) break;
      const fallback = homes[result.length] ?? d.nest.center;
      const home = !legacy && isPoint(entry.home) ? entry.home : fallback;
      result.push({ id, home: clampHome(d, home) });
      seen.add(id);
    }
    return result;
  };
  // Migration is capped by toyCap, not the current fort quota. Overflow remains owned in toys.
  if (Array.isArray(raw.lineup)) fresh.lineup = placements(raw.lineup, d.nest.homes, d.slots.toyCap, id => Object.prototype.hasOwnProperty.call(d.byToy, id) && fresh.toys[id].got);
  if (Array.isArray(raw.devices)) {
    const unlocked = new Set(availableDevices(d, fresh));
    fresh.devices = placements(raw.devices, d.nest.deviceHomes, slotsOf(d, fresh.fort).device, id => unlocked.has(id));
  }

  const farm = record(raw.farm);
  if (d.zones.some(z => z.id === farm.z) && Array.isArray(farm.rates)) {
    fresh.farm = {
      z: farm.z as number,
      w: integer(farm.w, 1, 1, d.wave.perZone - 1),
      rates: farm.rates.filter((x): x is number => typeof x === 'number' && Number.isFinite(x) && x >= 0).slice(-3).map(x => clamp(x)),
      durations: Array.isArray(farm.durations) ? farm.durations.filter((x): x is number => typeof x === 'number' && Number.isFinite(x) && x > 0).slice(-3) : [],
    };
  }
  const daily = record(raw.daily), boxes = record(raw.boxes);
  fresh.daily = { done: integer(daily.done, 0, 0, d.rules.tableSize), endAt: typeof daily.endAt === 'number' ? num(daily.endAt, now) : null };
  fresh.boxes = { free: integer(boxes.free, 0, 0, d.econ.freeBoxMax), clock: num(boxes.clock, now) };
  const firstClear = record(raw.firstClear), bossBest = record(raw.bossBest);
  for (const z of d.zones) {
    const clear = firstClear[z.id];
    if (typeof clear === 'string' && clear.length === d.wave.perZone && /^[01]+$/.test(clear)) fresh.firstClear[z.id] = clear;
    fresh.bossBest[z.id] = num(bossBest[z.id], 0, 0, 1);
  }
  const stats = record(raw.stats);
  fresh.units = integer(raw.units, 0, 0, d.big.unit.length - 1);
  fresh.stats = { kills: integer(stats.kills, 0), sheepTotal: num(stats.sheepTotal, 0), maxHit: num(stats.maxHit, 0) };
  fresh.rng = integer(raw.rng, 7920, 0, 4294967295);
  fresh.lastSeen = num(raw.lastSeen, now);
  fresh.attempts = {};
  for (const [key, n] of Object.entries(record(raw.attempts))) if (/^\d+:\d+(:boss)?$/.test(key)) fresh.attempts[key] = integer(n, 0);
  return fresh;
}
