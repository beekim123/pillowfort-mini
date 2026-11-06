import * as Core from '../core/index';
import type { Battle, BattleEvent, GameData, MorningCard, Save, WaveResult } from '../core/index';
import { contains, HitRegion } from './Draw';

export interface StorageLike { getItem(key: string): string | null; setItem(key: string, value: string): void; removeItem(key: string): void }
export type Panel = 'toys' | 'fort' | 'daily' | 'boxes' | 'settings' | 'debug' | 'placement' | null;
export interface Modal { kind: 'intro' | 'morning' | 'notice' | 'breakdown' | 'reset'; title: string; lines: string[]; card?: MorningCard; page?: number }
export interface Effect { type: 'shot' | 'damage' | 'cotton' | 'hit' | 'leak'; x: number; y: number; tx: number; ty: number; age: number; life: number; color: string; value: number; target?: number }
const SAVE_KEY = 'zhentou.save.v1';
const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value));

/** Owns UI state only. Game rules, prices, progression, RNG and damage live in core. */
export class GameController {
  readonly data: GameData;
  save: Save;
  battle: Battle;
  panel: Panel = null;
  page = 0;
  selectedSlot: number | null = null;
  selectedToy = '';
  modal: Modal | null = null;
  notices: Modal[] = [];
  effects: Effect[] = [];
  rows: WaveResult[] = [];
  uiTime = 0;
  toast = '';
  toastUntil = 0;
  milestone = 0;
  milestoneUntil = 0;
  waveMessage = '';
  nextWaveIn = 0;
  speed = 1;
  debugOverlay = false;
  longestText = false;
  debugZ = 0;
  debugW = 1;
  debugLevel = 100;
  suspended = false;
  height = 1334;
  hitRegions: HitRegion[] = [];
  onExport?: (csv: string) => void;
  private accumulator = 0;
  private timer = 0;
  private pointer: { region?: HitRegion; x: number; y: number; time: number; repeated: boolean; holdShown: boolean; nextRepeat: number } | null = null;
  private flashAim: number | undefined;
  private lastAction = new Map<string, number>();
  private holdFlash = false;
  private storageFailed = false;
  private skipNextTick = false;
  private effectPool: Effect[] = [];

  constructor(raw: unknown, private storage: StorageLike, readonly development = false, private now: () => number = () => Date.now() / 1000) {
    this.data = Core.loadData(raw);
    const initial = Core.newSave(this.data, this.now());
    let loaded: Save | null = null;
    try {
      const encoded = storage.getItem(SAVE_KEY);
      if (encoded) {
        const candidate = JSON.parse(encoded) as Save;
        if (candidate.version === 1 && Number.isFinite(candidate.sheep) && candidate.sheep >= 0 && Array.isArray(candidate.lineup) && candidate.lineup.length === this.data.nest.slots.length && candidate.toys && candidate.stats && candidate.daily && candidate.boxes && candidate.firstClear && candidate.captain && candidate.devices && candidate.z >= 0 && candidate.z < this.data.zones.length && candidate.w >= 1 && candidate.w <= this.data.wave.perZone) loaded = Core.parseSave(this.data, encoded, this.now());
      }
    } catch { /* Corrupt/unavailable storage is recoverable. */ }
    this.save = loaded ?? initial;
    if (loaded) {
      const offline = Core.settleOffline(this.data, loaded, this.now());
      this.save = offline.save;
      if (offline.card) this.showMorning(offline.card);
    } else {
      this.modal = { kind: 'intro', title: '枕头堡', lines: this.data.story.opening };
    }
    this.battle = this.makeBattle();
    this.persist();
  }

  private makeBattle(boss = false, carry?: Battle, elapsedBetweenWaves = 0): Battle {
    const key = `${this.save.z}:${boss ? this.data.wave.perZone : this.save.w}`;
    this.save.attempts ??= {};
    const attempt = this.save.attempts[key] ?? 0;
    this.save.attempts[key] = attempt + 1;
    return Core.startWave(this.data, this.save, { boss, attempt, carry, elapsedBetweenWaves });
  }

  tick(dt: number): void {
    if (this.suspended || !Number.isFinite(dt) || dt <= 0) return;
    if (this.skipNextTick) { this.skipNextTick = false; return; }
    const elapsed = dt;
    this.uiTime += elapsed;
    this.effects.forEach(e => e.age += elapsed);
    const activeEffects: Effect[] = [];
    for (const effect of this.effects) { if (effect.age < effect.life) activeEffects.push(effect); else this.effectPool.push(effect); }
    this.effects = activeEffects;
    if (this.pointer) {
      const p = this.pointer;
      if (p.region?.repeat && this.uiTime >= p.nextRepeat) {
        this.action(p.region.action, p.region.value); p.repeated = true; p.nextRepeat = this.uiTime + 0.14;
      } else if (p.region?.action === 'slot' && !p.holdShown && this.uiTime - p.time > 0.55) {
        const id = this.save.lineup[Number(p.region.value)];
        if (id) { this.breakdown(id); p.holdShown = true; }
      }
    }
    if (this.modal?.kind === 'intro' || this.modal?.kind === 'morning') return;
    this.timer += elapsed;
    if (this.timer >= 1) {
      this.timer %= 1;
      // Advance wall-clock daily/box timers without manufacturing offline rewards while playing.
      const current = { ...this.save, lastSeen: this.now() };
      this.save = Core.settleOffline(this.data, current, this.now()).save;
      Core.syncBattle(this.battle, this.save);
    }
    this.accumulator += elapsed * this.speed;
    while (this.accumulator >= this.data.rules.tick) {
      const step = this.data.rules.tick;
      this.accumulator -= step;
      if (this.nextWaveIn > 0) {
        this.nextWaveIn -= step;
        if (this.nextWaveIn <= 0) { this.battle = this.makeBattle(false, this.battle, this.data.wave.gapAfter); this.waveMessage = this.save.completed ? '下一个梦还在路上' : ''; }
        continue;
      }
      if (Core.result(this.battle)) continue;
      const events = Core.step(this.battle, step, this.flashAim === undefined ? {} : { flash: { aim: this.flashAim } });
      if (!this.holdFlash) this.flashAim = undefined;
      this.save = Core.collectBattleRewards(this.data, this.save, this.battle);
      Core.syncBattle(this.battle, this.save);
      this.processEvents(events);
      const outcome = Core.result(this.battle);
      if (outcome) this.finishWave(outcome);
    }
  }

  private finishWave(result: WaveResult): void {
    const settled = Core.onWaveEnd(this.data, this.save, result);
    this.save = settled.save;
    this.rows.push({ ...result });
    if (this.rows.length > 5000) this.rows.shift();
    this.nextWaveIn = this.data.wave.gapAfter;
    this.waveMessage = result.won ? (result.clean ? '干净地守住！' : '守住了') : '嗯……退回，再试一次';
    if (this.save.completed) this.waveMessage = '下一个梦还在路上';
    for (const u of settled.unlocked) {
      const names = [ ...u.toys.map(id => this.data.byToy[id]?.name), ...u.devices.map(id => this.data.byDevice[id]?.name), ...u.systems.map(id => ({ stars: '纸箱与升星', daily: '每天的小事' } as Record<string, string>)[id]) ].filter(Boolean);
      if (names.length) this.notices.push({ kind: 'notice', title: '新的守夜伙伴', lines: [`${names.join('、')}来了。`, '在下方页签中看看吧。'] });
    }
    if (!this.modal && this.notices.length) this.modal = this.notices.shift()!;
    this.persist();
  }

  private processEvents(events: BattleEvent[]): void {
    for (const e of events) {
      const type = e.type;
      const id = Number(e.target ?? e.enemy ?? e.to ?? e.id);
      const enemy = this.battle.enemies.find(n => n.id === id);
      const unit = this.battle.units.find(n => n.id === String(e.source ?? e.unit ?? e.toy));
      const x = Number(e.x ?? enemy?.x ?? unit?.x ?? this.data.nest.center[0]);
      const y = Number(e.y ?? enemy?.y ?? unit?.y ?? this.data.nest.center[1]);
      const damage = Number(e.damage ?? e.amount ?? 0);
      const color = ({ '枕': '#fff1d1', '暖': '#f3a16e', '凉': '#8bd8f2', '电': '#d1abf0', '臭': '#bed18c' } as Record<string, string>)[String(e.el ?? e.element)] ?? '#ffffff';
      if (type === 'attack' || type === 'shot' || type === 'chain') {
        const fromEnemy = type === 'chain' ? this.battle.enemies.find(n => n.id === Number(e.from)) : undefined;
        this.addEffect({ type: 'shot', x: fromEnemy?.x ?? unit?.x ?? x, y: fromEnemy?.y ?? unit?.y ?? y, tx: x, ty: y, age: 0, life: 0.2, color, value: damage, target: id });
      }
      if (['hit', 'damage', 'dot'].includes(type) && damage > 0) {
        const existing = this.effects.find(n => n.type === 'damage' && n.target === id && n.age < 0.3);
        if (existing) { existing.value += damage; existing.age = 0; }
        else if (this.effects.filter(n => n.type === 'damage').length < 6) this.addEffect({ type: 'damage', x, y, tx: x, ty: y - 50, age: 0, life: 0.8, color, value: damage, target: id });
        this.addEffect({ type: 'hit', x, y, tx: x, ty: y, age: 0, life: 0.18, color, value: 0, target: id });
        const index = Core.unitIndex(damage);
        if (index > this.save.units) {
          this.save.units = index; this.milestone = index; this.milestoneUntil = this.uiTime + 1.5; this.persist();
        }
      }
      if (['kill', 'death', 'defeat'].includes(type) && this.effects.filter(n => n.type === 'cotton').length < 12) {
        this.addEffect({ type: 'cotton', x, y, tx: this.data.nest.fence.sheepJumpTo[0], ty: this.data.nest.fence.sheepJumpTo[1], age: -0.2, life: 1.1, color: '#fff9ee', value: 0 });
      }
      if (['leak', 'breach'].includes(type)) this.addEffect({ type: 'leak', x, y, tx: x, ty: y, age: 0, life: 0.5, color: '#e89493', value: 0 });
      if (type === 'skill') this.notify(`${this.data.byToy[String(e.source ?? e.unit ?? e.toy)]?.name ?? '绵绵'} · ${String(e.name ?? e.skill ?? '技能')}`, 1.3);
    }
  }
  private addEffect(effect: Effect): void { if (this.effects.length < 150) this.effects.push(Object.assign(this.effectPool.pop() ?? effect, effect)); }

  notify(text: string, duration = 1.8): void { this.toast = text; this.toastUntil = this.uiTime + duration; }
  isUnlocked(z: number, w: number): boolean { return w === 0 || this.save.maxZ > z || (this.save.maxZ === z && this.save.maxW >= w) || this.save.firstClear[z]?.[w - 1] === '1'; }
  isSlotOpen(index: number): boolean { return this.data.nest.openOrder.slice(0, Core.slotsOf(this.data, this.save.fort).toy).includes(this.data.nest.slots[index].id); }
  get boxUnlocked(): boolean { return this.isUnlocked(0, 10); }
  get dailyUnlocked(): boolean { return this.isUnlocked(this.data.researchDaily.gate.z, this.data.researchDaily.gate.w); }

  private accept(next: Save | null, failure = '羊还不够，再守一会儿吧'): void {
    if (!next) { this.notify(failure); return; }
    this.save = next;
    Core.syncBattle(this.battle, this.save);
    this.persist();
  }

  action(action: string, value?: string | number): void {
    if (action === 'close') { this.panel = null; this.selectedSlot = null; this.page = 0; return; }
    if (action === 'tab') { const p = String(value) as Panel; this.panel = this.panel === p ? null : p; this.selectedSlot = null; this.page = 0; return; }
    if (action === 'modalPage') { if (this.modal) this.modal.page = Math.max(0, (this.modal.page ?? 0) + Number(value)); return; }
    if (action === 'dismiss') { this.modal = this.notices.shift() ?? null; return; }
    if (action === 'swapMode') { this.panel = null; this.notify('现在点第二个位置，就能互换'); return; }
    if (action === 'page') { this.page = Math.max(0, this.page + Number(value)); return; }
    if (action === 'stay') { this.save.stay = !this.save.stay; this.persist(); return; }
    if (action === 'flashMode') { this.save.autoFlash = !this.save.autoFlash; Core.syncBattle(this.battle, this.save); this.persist(); return; }
    if (action === 'level') { this.accept(Core.levelUp(this.data, this.save, String(value))); return; }
    if (action === 'levelAll') { this.accept(Core.levelAllToCap(this.data, this.save)); return; }
    if (action === 'fort') { this.accept(Core.fortUp(this.data, this.save)); return; }
    if (action === 'star') { this.accept(Core.starUp(this.data, this.save, String(value)), '碎片还不够，或已经达到最高星级'); return; }
    if (action === 'wish') { this.accept(Core.wish(this.data, this.save, String(value)), '星星糖还不够，或纸箱尚未解锁'); return; }
    if (action === 'box') {
      const result = Core.openBox(this.data, this.save, value === 'free');
      if (!result) { this.notify('纸箱或星星糖还不够'); return; }
      this.accept(result.save);
      this.modal = { kind: 'notice', title: '纸箱打开了', lines: result.shards.map(id => `${this.data.byToy[id]?.name ?? this.data.captain.name}的碎片 +1`) }; return;
    }
    if (action === 'daily') { this.accept(Core.startDaily(this.data, this.save, this.now())); return; }
    if (action === 'boss') {
      if (this.save.w !== this.data.wave.perZone - 1 || this.battle.boss || this.save.completed) return;
      this.battle = this.makeBattle(true, this.battle); this.nextWaveIn = 0; this.waveMessage = ''; this.panel = null; this.persist(); return;
    }
    if (action === 'retreat') { if (this.battle.boss) { this.battle = this.makeBattle(false, this.battle); this.nextWaveIn = 0; this.notify('回到第49波，休整一下'); } return; }
    if (action === 'slot') {
      const i = Number(value);
      if (!this.isSlotOpen(i)) { this.notify('升级枕头堡，就能打开这个位置'); return; }
      if (this.selectedSlot !== null && this.selectedSlot !== i) {
        const lineup = [...this.save.lineup]; [lineup[i], lineup[this.selectedSlot]] = [lineup[this.selectedSlot], lineup[i]];
        this.accept({ ...this.save, lineup }); this.selectedSlot = null; this.panel = null; this.notify('位置换好了');
      } else {
        const alreadySelected = this.selectedSlot === i; this.selectedSlot = i; this.page = 0;
        const toy = this.data.byToy[this.save.lineup[i] ?? ''];
        if (toy?.stance === '帮' && !alreadySelected) { this.panel = null; this.notify('连线就是相邻伙伴；再点本位可换玩偶'); }
        else this.panel = 'placement';
      }
      return;
    }
    if (action === 'place') {
      if (this.selectedSlot === null) return;
      const id = String(value); const lineup = [...this.save.lineup];
      const oldIndex = lineup.indexOf(id);
      if (oldIndex >= 0) lineup[oldIndex] = lineup[this.selectedSlot];
      lineup[this.selectedSlot] = id === '' ? null : id;
      this.accept({ ...this.save, lineup }); this.selectedSlot = null; this.panel = null; return;
    }
    if (action === 'device') {
      const [slotText, id] = String(value).split(':'); const slot = Number(slotText);
      if (slot >= Core.slotsOf(this.data, this.save.fort).device) return;
      const def = this.data.byDevice[id];
      if (id && (!def || !this.isUnlocked(def.unlock.z, def.unlock.w))) return;
      const devices = [...this.save.devices]; const existing = devices.indexOf(id);
      if (existing >= 0) devices[existing] = devices[slot];
      devices[slot] = id || null; this.accept({ ...this.save, devices }); return;
    }
    if (action === 'breakdown') { this.breakdown(String(value)); return; }
    if (action === 'selectWish') { this.selectedToy = String(value); return; }
    if (!this.development) return;
    if (action === 'debug') { this.panel = 'debug'; this.page = 0; this.debugZ = this.save.z; this.debugW = this.save.w; return; }
    if (action === 'speed') { this.speed = Number(value); return; }
    if (action === 'overlay') { this.debugOverlay = !this.debugOverlay; return; }
    if (action === 'longest') { this.longestText = !this.longestText; return; }
    if (action === 'debugZ') { this.debugZ = (this.debugZ + 1) % this.data.zones.length; return; }
    if (action === 'debugW') { this.debugW = Math.max(1, Math.min(this.data.wave.perZone - 1, this.debugW + Number(value))); return; }
    if (action === 'debugLevel') { this.debugLevel = Math.max(1, this.debugLevel + Number(value)); return; }
    if (action === 'jump' || action === 'progress') {
      const s = clone(this.save); s.z = this.debugZ; s.w = this.debugW; s.completed = false; s.pushBlock = 0;
      if (action === 'progress') {
        s.maxZ = this.debugZ; s.maxW = this.debugW; s.courage = this.debugZ;
        for (let z = 0; z <= this.debugZ; z++) s.firstClear[z] = '1'.repeat(z < this.debugZ ? this.data.wave.perZone : this.debugW).padEnd(this.data.wave.perZone, '0');
        for (const toy of this.data.toys) if (toy.unlock.z < this.debugZ || (toy.unlock.z === this.debugZ && toy.unlock.w <= this.debugW)) s.toys[toy.id].got = true;
      }
      this.save = s; this.battle = this.makeBattle(); this.nextWaveIn = 0; this.persist(); this.notify('调试波次已应用'); return;
    }
    if (action === 'money') { this.accept({ ...this.save, sheep: Math.min(this.data.big.max, Math.max(1, this.save.sheep) * Number(value)) }); return; }
    if (action === 'candy') { this.accept({ ...this.save, candy: this.save.candy + 100 }); return; }
    if (action === 'shards') { const s = clone(this.save); for (const toy of Object.values(s.toys)) toy.shards += 100; s.captain.shards += 100; this.accept(s); return; }
    if (action === 'setLevels') { const s = clone(this.save); for (const id of s.lineup) if (id) s.toys[id].lv = this.debugLevel; this.accept(s); return; }
    if (action === 'offline') { const s = { ...this.save, lastSeen: this.now() - Number(value) * 3600 }; const out = Core.settleOffline(this.data, s, this.now()); this.accept(out.save); if (out.card) this.showMorning(out.card); return; }
    if (action === 'finishDaily') { const s = clone(this.save); if (s.daily.endAt !== null) s.daily.endAt = this.now() - 1; this.accept(Core.settleOffline(this.data, { ...s, lastSeen: this.now() }, this.now()).save); return; }
    if (action === 'addBox') { this.accept({ ...this.save, boxes: { ...this.save.boxes, free: Math.min(this.data.econ.freeBoxMax, this.save.boxes.free + 1) } }); return; }
    if (action === 'csv') { this.onExport?.(this.csv()); this.notify(`已准备${this.rows.length}波记录`); return; }
    if (action === 'reset') { this.modal = { kind: 'reset', title: '清空这个设备的存档？', lines: ['此操作会重新从第一个梦开始。', '调试记录不会删除。'] }; return; }
    if (action === 'confirmReset') { this.save = Core.newSave(this.data, this.now()); this.battle = this.makeBattle(); this.nextWaveIn = 0; this.modal = null; this.panel = null; this.selectedSlot = null; this.effects = []; this.notices = []; this.persist(); }
  }

  private breakdown(id: string): void {
    const toy = this.save.toys[id]; if (!toy) return;
    const breakdown = Core.lastDamageBreakdown(this.battle, id);
    this.modal = { kind: 'breakdown', title: `${this.data.byToy[id].name} · 伤害分解`, page: 0, lines: [
      breakdown.mode === 'last-hit' ? `最近真实命中 · 本波${breakdown.time.toFixed(2)}秒` : '当前普通一下预估（非暴击）',
      ...(breakdown.targetName ? [`目标：${breakdown.targetName}`] : []),
      ...breakdown.parts.map(p => `${p.name} ×${String(p.mul)}`),
      `结算伤害 ${Core.fmt(breakdown.total)}`, `原始值 ${String(breakdown.total)}`,
      breakdown.note,
    ] };
  }

  pointerDown(x: number, y: number): void {
    const region = [...this.hitRegions].reverse().find(r => r.enabled !== false && contains(r, x, y));
    this.pointer = { region, x, y, time: this.uiTime, repeated: false, holdShown: false, nextRepeat: this.uiTime + 0.45 };
    if (region?.action === 'flash') {
      this.holdFlash = true; this.save.autoFlash = false; Core.syncBattle(this.battle, this.save);
      this.flashAim = -Math.PI / 2; this.persist();
      if (this.battle.flash.charge < this.data.flash.charge) this.notify('手电还在充电，充满后会照向这里');
    }
  }
  pointerMove(x: number, y: number): void {
    if (this.holdFlash) { const [cx, cy] = this.data.nest.center; this.flashAim = Math.atan2(y - (this.height - 1334) - cy, x - cx); }
    else if (this.pointer && Math.hypot(x - this.pointer.x, y - this.pointer.y) > 24) this.pointer = null;
  }
  pointerUp(x: number, y: number): void {
    const p = this.pointer; this.pointer = null;
    if (this.holdFlash) { this.holdFlash = false; return; }
    if (!p?.region || p.repeated || p.holdShown || !contains(p.region, x, y)) return;
    const last = this.lastAction.get(p.region.id) ?? -Infinity;
    if (this.uiTime - last < 0.2) return;
    this.lastAction.set(p.region.id, this.uiTime); this.action(p.region.action, p.region.value);
  }
  pointerCancel(): void { this.pointer = null; this.holdFlash = false; this.flashAim = undefined; }
  suspend(): void { if (this.suspended) return; this.pointerCancel(); this.persist(); this.suspended = true; }
  resume(): void {
    if (!this.suspended) return;
    const off = Core.settleOffline(this.data, this.save, this.now()); this.save = off.save; Core.syncBattle(this.battle, this.save);
    if (off.card) this.showMorning(off.card);
    this.suspended = false; this.accumulator = 0; this.skipNextTick = true; this.persist();
  }
  private showMorning(card: MorningCard): void { this.modal = { kind: 'morning', title: '早安，昨晚我们守住了', lines: [], card }; }
  persist(): void {
    this.save.lastSeen = this.now();
    try { this.storage.setItem(SAVE_KEY, JSON.stringify(this.save)); }
    catch { if (!this.storageFailed) this.notify('这个环境暂时不能保存，请不要关闭页面', 5); this.storageFailed = true; }
  }
  csv(): string {
    const header: (keyof WaveResult)[] = ['z', 'w', 'seed', 'shots', 'damage', 'duration', 'leaks', 'blockedSeconds', 'knockdowns', 'dashes', 'won', 'sheep'];
    return '\ufeff' + ['区,波,种子,出手次数,全队平均DPS,用时秒,漏怪,挡住秒数,挤倒次数,冲刺次数,守住,羊', ...this.rows.map(r => header.map(k => k === 'damage' ? r.damage / Math.max(r.duration, this.data.rules.tick) : r[k]).join(','))].join('\r\n');
  }
}
