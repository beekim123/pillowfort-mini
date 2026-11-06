import * as Core from '../core/index';
import type { BattleUnit, Enemy, ToyDef } from '../core/index';
import { GameController } from './GameController';
import { COLORS as C, ELEMENT, UNIT_COLOR, DrawCommand, HitRegion, Layer, timeText, wrapText } from './Draw';
import { THEME } from './Theme';

const SKILLS: Record<string, string> = {
  fangfang: '垒高高：回耐力，重拍一下', huhu: '大呼一口：一片暖烘烘', gaga: '大水柱：推开一条线',
  dingdang: '叮当响：相邻伙伴攻击提高', kaka: '上满发条：静电跳六只', ruanruan: '变出来：两个小枕头帮忙挡',
  piaopiao: '飘起来：相邻伙伴打得更快', laowa: '两只一起：一片叠三层臭', abing: '雪崩：全场短暂冻住',
};
const BEST: Record<string, string> = { '挡': '最适合外圈', '打': '最适合中圈', '帮': '最适合里圈或中圈', '冲': '最适合里圈或中圈' };
export interface Frame { commands: DrawCommand[]; hitRegions: HitRegion[] }

/** Draws only colored rectangles, lines, a triangular flashlight beam and text. No generated art. */
export class GameView {
  private commands: DrawCommand[] = [];
  private hits: HitRegion[] = [];
  private h = 1334;
  private extra = 0;
  private layer: Layer = 0;
  private panelTop = 0;
  private panelH = 0;
  constructor(readonly app: GameController) {}
  render(height = 1334): Frame {
    this.h = Math.max(1334, height); this.extra = this.h - 1334; this.app.height = this.h;
    this.commands = []; this.hits = []; this.layer = 0;
    this.field(); this.hud(); this.tabs();
    if (this.app.panel) this.panel();
    if (this.app.modal) this.modal();
    this.layer = 4;
    if (this.app.milestoneUntil > this.app.uiTime) {
      this.rect(0, 152, 750, this.h - 262, '#101724b8');
      this.text(`破${this.app.data.big.unitName[this.app.milestone] ?? '新单位'}！`, 40, this.h * 0.37, 670, 70, UNIT_COLOR[Math.min(this.app.milestone, 5)], 'center');
    }
    if (this.app.toastUntil > this.app.uiTime) {
      const lines = wrapText(this.app.toast, 640, 24); const height = lines.length * 31 + 32;
      this.rect(30, 274, 690, height, '#fff9eef2'); this.text(this.app.toast, 54, 290, 642, 24, C.ink, 'center');
    }
    this.app.hitRegions = this.hits;
    return { commands: this.commands, hitRegions: this.hits };
  }
  private rect(x: number, y: number, w: number, h: number, color: string): void { this.commands.push({ kind: 'rect', x, y, w, h, color, layer: this.layer }); }
  private line(x: number, y: number, x2: number, y2: number, color: string, width = 3): void { this.commands.push({ kind: 'line', x, y, x2, y2, color, width, layer: this.layer }); }
  private text(text: string, x: number, y: number, width: number, size = 24, color: string = C.ink, align: 'left' | 'center' | 'right' = 'left'): number {
    const lines = wrapText(text, width, size);
    for (let i = 0; i < lines.length; i++) this.commands.push({ kind: 'text', text: lines[i], x, y: y + i * size * 1.3, width, size, color, align, layer: this.layer });
    return lines.length * size * 1.3;
  }
  private hit(id: string, x: number, y: number, w: number, h: number, action: string, value?: string | number, enabled = true, repeat = false): void { this.hits.push({ id, x, y, w, h, action, value, enabled, repeat }); }
  private button(id: string, label: string, x: number, y: number, w: number, action: string, value?: string | number, color: string = C.blue, enabled = true, h = 56, repeat = false): void {
    this.rect(x, y, w, h, enabled ? color : C.disabled);
    const lines = wrapText(label, w - 24, 24);
    this.text(label, x + 12, y + (h - lines.length * 31.2) / 2, w - 24, 24, C.ink, 'center');
    this.hit(id, x, y, w, h, action, value, enabled, repeat);
  }

  private field(): void {
    const a = this.app, d = a.data, b = a.battle, n = d.nest, e = this.extra;
    this.rect(0, 0, 750, this.h, C.sky);
    this.rect(0, n.hud.fog[1], 750, n.hud.fog[3] + e, C.fog);
    this.rect(0, n.spawn.y - 26 + e, 750, 26, C.fogLight);
    for (let i = 0; i < 5; i++) {
      const x = n.spawn.x[0] + (n.spawn.x[1] - n.spawn.x[0]) * (i + 0.5) / 5;
      this.rect(x - 13, n.spawn.y + e - 12, 26, 12, '#78869c');
    }
    const [cx, cy] = n.center;
    // A block-only crescent: no alternate gameplay coordinates are introduced.
    this.rect(0, cy - n.radius.base + e, 750, n.radius.base + 20, C.bed);
    this.rect(90, cy - n.radius.middle + e, 570, n.radius.middle + 30, '#8d9bb0');
    this.rect(214, cy - n.radius.inner + e, 322, n.radius.inner + 32, '#a8b2c3');
    const selected = a.selectedSlot === null ? null : n.slots[a.selectedSlot];
    if (selected && (d.byToy[a.save.lineup[a.selectedSlot!] ?? '']?.stance === '帮' || a.debugOverlay)) {
      for (const id of selected.adjacent) { const to = d.bySlot[id]; this.line(selected.pos[0], selected.pos[1] + e, to.pos[0], to.pos[1] + e, C.yellow, 5); }
    }
    if (a.debugOverlay) for (const s of n.slots) for (const id of s.adjacent) { const to = d.bySlot[id]; this.line(s.pos[0], s.pos[1] + e, to.pos[0], to.pos[1] + e, '#cbd6ee50', 2); }
    if (b.flash.until > b.time) {
      const length = cy - n.spawn.y; const spread = Math.atan(d.rules.flashWidth / 2 / length);
      this.commands.push({ kind: 'poly', points: [[cx, cy + e], [cx + Math.cos(b.flash.aim - spread) * length, cy + Math.sin(b.flash.aim - spread) * length + e], [cx + Math.cos(b.flash.aim + spread) * length, cy + Math.sin(b.flash.aim + spread) * length + e]], color: '#fff0a55c', layer: 0 });
    }
    const active = b.enemies.filter(enemy => !enemy.dead && !enemy.leaked);
    for (const enemy of active.slice(0, THEME.enemyLimit)) this.enemy(enemy);
    if (active.length > THEME.enemyLimit) this.text(`还有${active.length - THEME.enemyLimit}只（合并显示）`, 130, n.spawn.y + e + 10, 490, 22, C.white, 'center');
    for (let i = 0; i < n.slots.length; i++) {
      const slot = n.slots[i], [x, y] = slot.pos, opened = a.isSlotOpen(i), id = a.save.lineup[i];
      this.rect(x - n.slotRadius, y - n.slotRadius + e, n.slotRadius * 2, n.slotRadius * 2, selected === slot ? C.yellow : opened ? C.pad : '#5c6c83');
      this.rect(x - n.slotRadius + 5, y - n.slotRadius + 5 + e, n.slotRadius * 2 - 10, n.slotRadius * 2 - 10, opened ? '#d1d8e1' : C.bed);
      if (!opened) this.text('未开', x - 40, y - 12 + e, 80, 22, '#e7eaf0', 'center');
      else if (!id || b.units.find(u => u.id === id)?.dash) this.text(id ? '冲出去了' : '+', x - 44, y - 12 + e, 88, 22, C.ink, 'center');
      this.hit(`slot-${i}`, x - n.slotRadius, y - n.slotRadius + e, n.slotRadius * 2, n.slotRadius * 2, 'slot', i);
    }
    for (const unit of b.units) this.toy(unit);
    for (const c of b.clones) { this.rect(c.x - 20, c.y - 16 + e, 40, 32, C.cream); this.text('分身', c.x - 35, c.y - 40 + e, 70, 22, C.white, 'center'); }
    const [mx, my] = n.captain;
    this.rect(mx - 48, my - 30 + e, 96, 60, C.cream); this.text(d.captain.name, mx - 48, my - 16 + e, 96, 26, C.ink, 'center');
    this.text(`★${a.save.captain.star}`, mx + 60, my - 12 + e, 80, 22, C.white, 'left');
    this.hit('captain', mx - 48, my - 30 + e, 96, 60, 'tab', 'toys');
    const [kx, ky] = n.kid.pos, [kw, kh] = n.kid.size;
    const leaking = a.effects.some(f => f.type === 'leak');
    this.rect(kx - kw / 2 + (leaking ? Math.sin(a.uiTime * 45) * 5 : 0), ky - kh / 2 + e, kw, kh, C.lilac);
    this.text(leaking ? '嗯……' : `${d.story.kidName}在睡觉`, kx - kw / 2 + 10, ky - 12 + e, kw - 20, 22, C.ink, 'center');
    this.rect(n.flashlight[0] - 9, n.flashlight[1] - 24 + e, 18, 42, C.yellow);
    const count = Core.slotsOf(d, a.save.fort).device;
    n.devices.forEach((slot, i) => {
      const [x, y, w, h] = slot.rect;
      const def = d.byDevice[a.save.devices[i] ?? ''];
      this.rect(x, y + e, w, h, i < count ? (def ? C.yellow : C.pad) : '#617086');
      this.text(i >= count ? '未开' : def ? def.name : '设施', x + 12, y + e + 20, w - 24, 22, C.ink, 'center');
      this.hit(`device-${i}`, x, y + e, w, h, 'tab', 'fort');
    });
    this.effects();
    const [fx, fy, fw, fh] = n.fence.rect;
    this.rect(fx, fy, fw, fh, '#d9c7a4');
    this.text('羊回家', fx + 12, fy + 12, fw - 24, 22, C.ink, 'center');
    if (a.waveMessage) this.text(a.waveMessage, 50, 620 + e, 650, 32, C.yellow, 'center');
    if (a.save.pushBlock > 0) this.text(`再干净守住${a.save.pushBlock}波，就继续向前`, 80, 690 + e, 590, 24, C.cream, 'center');
    if (a.selectedSlot !== null && !a.panel) this.text('点另一个位置互换 · 点下方页签取消', 30, 316, 690, 24, C.yellow, 'center');
    if (a.save.z === 0 && a.save.w < 4 && !a.panel) this.text('↓ 拍散噩梦得羊，点「玩偶」升级', 55, this.h - 150, 640, 24, C.yellow, 'center');
  }

  private enemy(enemy: Enemy): void {
    const b = this.app.battle, e = this.extra;
    const size = enemy.boss ? 110 : enemy.elite ? 68 : enemy.child ? 38 : 50;
    const hit = this.app.effects.find(f => f.type === 'hit' && f.target === enemy.id);
    const shake = hit ? Math.sin(hit.age * 80) * 5 : 0;
    const x = enemy.x + shake, y = enemy.y + e;
    const color = enemy.freezeUntil > b.time ? C.cool : enemy.flashUntil > b.time ? '#e5a5ad' : enemy.burnUntil > b.time ? C.warm : enemy.closed ? '#64637b' : enemy.boss ? '#b496cf' : enemy.elite ? '#bf8da9' : '#8997bc';
    this.rect(x - size / 2, y - size / 2, size, size, color);
    this.rect(x - size / 2, y - size / 2 - 9, size, 5, '#3b4358');
    this.rect(x - size / 2, y - size / 2 - 9, size * Math.max(0, enemy.hp / enemy.maxHp), 5, C.green);
    if (enemy.boss) {
      this.text(enemy.closed ? '关门中' : enemy.name, x - 140, y - size / 2 - 44, 280, 24, C.white, 'center');
      this.text(`${Core.fmt(enemy.hp)} / ${Core.fmt(enemy.maxHp)}`, 80, 370 + e, 590, 24, C.white, 'center');
    } else this.text(enemy.name.slice(0, 2), x - size / 2 - 12, y - 12, size + 24, 22, C.ink, 'center');
    let status = '';
    if (enemy.freezeUntil > b.time) status += '冻 '; else if (enemy.slowUntil > b.time) status += '慢 ';
    if (enemy.burnUntil > b.time) status += '烘 ';
    if (enemy.stunUntil > b.time) status += '定 ';
    if (enemy.closed) status += '免伤 ';
    if (enemy.shell > 0) status += `壳${enemy.shell} `;
    if (status) this.text(status, x - 80, y + size / 2 + 4, 160, 22, C.white, 'center');
    for (let i = 0; i < enemy.stink.length; i++) this.rect(x - 25 + i % 5 * 10, y + size / 2 + 34 + Math.floor(i / 5) * 9, 7, 7, C.stink);
    if (enemy.blockedBy) this.rect(x - size / 2 - 6, y - 7, 5, 14, C.yellow);
    if (this.app.debugOverlay) {
      this.line(enemy.x, enemy.y + e, enemy.edgeX, enemy.edgeY + e, '#f5ce7070', 2);
      this.rect(enemy.edgeX - 4, enemy.edgeY + e - 4, 8, 8, C.yellow);
    }
  }
  private toy(unit: BattleUnit): void {
    const a = this.app, def = a.data.byToy[unit.id], e = this.extra;
    if (!def) return;
    const down = unit.knockedUntil > a.battle.time, frightened = unit.startledUntil > a.battle.time;
    const size = a.data.nest.slotRadius * 1.5;
    const x = unit.x + (frightened ? Math.sin(a.uiTime * 40) * 4 : 0), y = unit.y + e;
    this.rect(x - size / 2, y - (down ? 12 : size / 2), size, down ? 24 : size, ELEMENT[def.el]);
    this.text(def.name, x - 40, y - (down ? 10 : 15), 80, 24, C.ink, 'center');
    this.text(`${def.stance} · ${a.save.toys[unit.id].lv}`, x - 50, y + 36, 100, 22, C.ink, 'center');
    if (def.stance === '挡' && unit.slot.startsWith('O')) {
      this.rect(x - 34, y - 47, 68, 7, '#4c5568'); this.rect(x - 34, y - 47, 68 * Math.max(0, unit.stamina / unit.maxStamina), 7, C.green);
      if (down) this.text(`${Math.ceil(unit.knockedUntil - a.battle.time)}秒爬起`, x - 70, y - 43, 140, 22, C.white, 'center');
      else if (a.debugOverlay) this.text(unit.stamina.toFixed(1), x - 30, y - 76, 60, 22, C.white, 'center');
    }
    if (frightened) this.text('！', x - 20, y - 68, 40, 30, C.yellow, 'center');
    if (a.debugOverlay) this.text(`DPS ${Core.fmt(unit.damage / Math.max(a.battle.time, 1))}`, x - 80, y + 66, 160, 22, C.white, 'center');
  }
  private effects(): void {
    const e = this.extra, target = this.app.data.nest.fence.sheepJumpTo;
    for (const f of this.app.effects) {
      const p = Math.min(1, f.age / f.life);
      if (f.type === 'shot') { if (this.app.debugOverlay) this.line(f.x, f.y + e, f.tx, f.ty + e, '#fff9ee70', 2); this.rect(f.x + (f.tx - f.x) * p - 5, f.y + (f.ty - f.y) * p + e - 5, 10, 10, f.color); }
      if (f.type === 'damage') this.text(Core.fmt(f.value), f.x - 85, f.y - 30 - p * 50 + e, 170, 26, UNIT_COLOR[Math.min(Core.unitIndex(f.value), 5)], 'center');
      if (f.type === 'cotton') {
        if (f.age < 0) { this.rect(f.x - 25, f.y + e - 25, 50, 50, '#8997bc'); continue; }
        let x: number, y: number;
        if (p < 0.75) { const t = p / 0.75; x = f.x + (target[0] - f.x) * t; y = f.y + e + (target[1] - f.y - e) * t - Math.sin(t * Math.PI) * 40; }
        else { const t = (p - 0.75) / 0.25; x = target[0] - t * 150; y = target[1] - Math.sin(t * Math.PI) * 45; }
        this.rect(x - 11, y - 9, 22, 18, C.white);
        if (p > 0.75) { this.rect(x - 7, y + 9, 4, 7, C.white); this.rect(x + 4, y + 9, 4, 7, C.white); }
      }
      if (f.type === 'leak') this.rect(f.x - 36, f.y + e - 8, 72, 16, C.red);
    }
  }

  private hud(): void {
    this.layer = 1;
    const a = this.app, d = a.data, b = a.battle, n = d.nest, top = n.hud.top, strip = n.hud.strip;
    this.rect(top[0], top[1], top[2], top[3], C.panel);
    const title = a.longestText ? '学校的梦 · 49' : `${d.zones[a.save.z]?.name ?? '梦'} · ${b.boss ? '大噩梦' : a.save.w}`;
    this.text(title, 24, 9, n.hud.capsuleReserve[0] - 48, 28);
    this.text(`羊 ${a.longestText ? '9999.999京' : Core.fmt(a.save.sheep)}`, 24, 52, 310, 24);
    this.text(`糖 ${Core.fmt(a.save.candy)}`, 338, 52, 182, 22, '#7a5d80');
    // The entire 220×96 capsule reservation remains blank.
    this.rect(strip[0], strip[1], strip[2], strip[3], '#dfe6eb');
    const remaining = b.enemies.filter(n => !n.dead && !n.leaked).length + Math.max(0, d.wave.count - b.spawned);
    this.text(`厚度 ${b.thickness}/${d.wave.thickness}`, 22, strip[1] + 14, 175, 22);
    this.text(b.boss ? '大噩梦来啦' : `还剩 ${remaining}只`, 194, strip[1] + 14, 170, 22);
    this.button('stay', a.save.stay ? '已停在这波' : '停在这一波', 369, strip[1] + 6, 177, 'stay', undefined, a.save.stay ? C.green : '#c4d1dc', true, 44);
    if (a.save.w === d.wave.perZone - 1 && !a.save.completed) {
      const [x, y, w, h] = n.hud.bossButton;
      this.button('boss', b.boss ? '先回去' : '打大噩梦', x, y, w, b.boss ? 'retreat' : 'boss', undefined, C.yellow, true, h);
      if (!b.boss && a.save.bossBest[a.save.z]) this.text(`上次打掉 ${Math.floor(a.save.bossBest[a.save.z] * 100)}%`, 430, 164, 296, 22, C.white, 'right');
    }
    const f = n.hud.flashButton, y = f.pos[1] + this.extra, r = f.r;
    this.rect(f.pos[0] - r, y - r, r * 2, r * 2, b.flash.charge >= d.flash.charge ? C.yellow : '#99aabd');
    this.text('手电', f.pos[0] - r + 12, y - 28, r * 2 - 24, 24, C.ink, 'center');
    this.text(`${Math.floor(b.flash.charge / d.flash.charge * 100)}%`, f.pos[0] - r + 10, y + 4, r * 2 - 20, 22, C.ink, 'center');
    this.rect(f.pos[0] - r, y + r - 6, r * 2 * Math.min(1, b.flash.charge / d.flash.charge), 6, C.cream);
    this.hit('flash', f.pos[0] - r, y - r, r * 2, r * 2, 'flash');
    this.text(a.save.autoFlash ? '自动' : '拖动瞄准', 610, y + r + 9, 128, 22, C.white, 'center');
  }
  private tabs(): void {
    this.layer = 1;
    const y = this.app.data.nest.hud.tabs[1] + this.extra;
    this.rect(0, y, 750, this.h - y, C.panel);
    const tabs = [['toys', '玩偶'], ['fort', '枕头堡'], ['daily', '白天'], ['boxes', '纸箱'], ['settings', '设置']];
    tabs.forEach(([id, name], i) => {
      const selected = this.app.panel === id;
      if (selected) this.rect(i * 150 + 8, y + 8, 134, 94, C.lilac);
      this.text(name, i * 150 + 12, y + 35, 126, 28, C.ink, 'center');
      this.hit(`tab-${id}`, i * 150, y, 150, 110, 'tab', id);
    });
  }
  private panel(): void {
    this.layer = 2;
    const a = this.app;
    this.panelH = Math.min(THEME.maxPanelHeight, this.h * 0.6);
    this.panelTop = this.h - 110 - this.panelH;
    this.rect(12, this.panelTop, 726, this.panelH, C.panel);
    // Block taps from falling through to live battlefield behind the panel.
    this.hit('panel-blocker', 12, this.panelTop, 726, this.panelH, 'noop');
    const title: Record<string, string> = { toys: '守夜的玩偶', fort: '把枕头堡垒高一点', daily: '每天的小事', boxes: '床底下的纸箱', settings: '设置', debug: '开发调试', placement: `${a.selectedSlot === null ? '' : a.data.nest.slots[a.selectedSlot].id} · 放一只玩偶` };
    this.text(title[a.panel!], 36, this.panelTop + 22, 510, 30);
    this.button('panel-close', '收起', 612, this.panelTop + 14, 100, 'close', undefined, '#e0ddd6');
    if (a.panel === 'toys') this.toysPanel();
    if (a.panel === 'placement') this.placementPanel();
    if (a.panel === 'fort') this.fortPanel();
    if (a.panel === 'daily') this.dailyPanel();
    if (a.panel === 'boxes') this.boxPanel();
    if (a.panel === 'settings') this.settingsPanel();
    if (a.panel === 'debug') this.debugPanel();
  }
  private pager(total: number, size: number, y: number): void {
    const pages = Math.max(1, Math.ceil(total / size)); this.app.page = Math.min(this.app.page, pages - 1);
    this.button('prev', '上一页', 36, y, 156, 'page', -1, '#dce3e8', this.app.page > 0);
    this.text(`${this.app.page + 1} / ${pages}`, 276, y + 13, 198, 24, C.ink, 'center');
    this.button('next', '下一页', 558, y, 156, 'page', 1, '#dce3e8', this.app.page < pages - 1);
  }
  private toysPanel(): void {
    const a = this.app, d = a.data, cap = Core.lvCap(d, a.save.courage), owned = d.toys.filter(t => a.save.toys[t.id]?.got);
    const ids = [d.captain.id, ...owned.map(t => t.id)];
    this.pager(ids.length, 3, this.panelTop + this.panelH - 70);
    const items = ids.slice(a.page * 3, a.page * 3 + 3);
    items.forEach((id, i) => {
      const y = this.panelTop + 90 + i * 156;
      this.rect(30, y, 690, 144, '#eee9e0');
      if (id === d.captain.id) {
        const s = a.save.captain, need = d.econ.starShards[s.star];
        this.text(`绵绵 · 领头羊  ★${s.star}`, 48, y + 12, 460, 26);
        this.text(`碎片 ${s.shards}${need ? `/${need}` : ' · 满星'}`, 48, y + 49, 460, 22);
        this.text(`全队攻击 +${Math.round(d.econ.captainAura[s.star - 1] * 100)}%\n咩——：全队短时打得更快`, 48, y + 78, 460, 24);
        this.button(`star-${id}`, need ? `升星 ${need}片` : '已满星', 534, y + 43, 168, 'star', id, C.lilac, a.boxUnlocked && !!need && s.shards >= need, 64);
      } else {
        const t = d.byToy[id], s = a.save.toys[id], cost = Core.lvCost(d, s.lv, a.save.courage), need = d.econ.starShards[s.star];
        this.text(`${t.name} · ${t.el} · ${t.stance}${a.save.lineup.includes(id) ? ' · 上场' : ''}`, 48, y + 12, 465, 26);
        this.text(`Lv ${s.lv}/${cap}  ★${s.star}  碎片${s.shards}`, 48, y + 49, 465, 22);
        this.text(SKILLS[id], 48, y + 82, 450, 24);
        this.hit(`info-${id}`, 30, y, 490, 144, 'breakdown', id);
        this.button(`level-${id}`, `升级 羊${Core.fmt(cost)}`, 534, y + 10, 168, 'level', id, C.green, a.save.sheep >= cost, 60, true);
        this.button(`star-${id}`, need ? `升星 ${need}片` : '已满星', 534, y + 80, 168, 'star', id, C.lilac, a.boxUnlocked && !!need && s.shards >= need, 54);
      }
    });
    const capped = owned.some(t => a.save.toys[t.id].lv >= cap);
    this.button('level-all', '全升到上限', 36, this.panelTop + this.panelH - 138, 236, 'levelAll', undefined, C.green);
    this.text(capped ? '打败大噩梦就能长更高\n仍可升级，上限后更贵' : '按住连续升级\n点玩偶卡看伤害分解', 292, this.panelTop + this.panelH - 142, 410, 22, C.muted);
  }
  private placementPanel(): void {
    const a = this.app, owned = a.data.toys.filter(t => a.save.toys[t.id]?.got);
    this.pager(owned.length, 4, this.panelTop + this.panelH - 70);
    this.text('点一只放上去。已经上场的会与原位互换。', 36, this.panelTop + 90, 678, 24, C.muted);
    owned.slice(a.page * 4, a.page * 4 + 4).forEach((t, i) => {
      const y = this.panelTop + 137 + i * 96;
      this.rect(36, y, 678, 84, '#eee9e0'); this.rect(48, y + 16, 48, 48, ELEMENT[t.el]);
      this.text(`${t.name} · ${t.stance} · ${t.el}`, 114, y + 9, 400, 26);
      this.text(BEST[t.stance], 114, y + 46, 400, 24, C.muted);
      this.button(`place-${t.id}`, '放这里', 552, y + 14, 144, 'place', t.id, C.green);
    });
    this.button('swap', '点两个位置互换', 36, this.panelTop + this.panelH - 138, 314, 'swapMode', undefined, C.blue);
    this.button('empty', '留空这个位置', 380, this.panelTop + this.panelH - 138, 334, 'place', '', '#e2c7bb');
  }
  private fortPanel(): void {
    const a = this.app, d = a.data, s = a.save, slots = Core.slotsOf(d, s.fort);
    const nextToy = d.slots.toy.find(v => v[0] > s.fort), nextDevice = d.slots.device.find(v => v[0] > s.fort);
    const cost = Core.fortCost(d, s.fort);
    let y = this.panelTop + 96;
    this.text(`枕头堡 Lv ${s.fort} · 不怕了 ${s.courage}次`, 36, y, 678, 28); y += 48;
    this.text(`玩偶位 ${slots.toy} / ${d.nest.slots.length} · 设施位 ${slots.device} / ${d.nest.devices.length}`, 36, y, 678, 24); y += 40;
    this.text(`${nextToy ? `Lv ${nextToy[0]} 开第${nextToy[1]}个玩偶位` : '所有玩偶位已打开'}\n${nextDevice ? `Lv ${nextDevice[0]} 开第${nextDevice[1]}个设施位` : '所有设施位已打开'}`, 36, y, 678, 24, C.muted); y += 78;
    this.button('fort-up', `垒高一层 · 羊 ${Core.fmt(cost)}`, 36, y, 678, 'fort', undefined, C.green, s.sheep >= cost); y += 82;
    this.text('床头设施 · 同一种只能放一个', 36, y, 678, 26); y += 48;
    for (let i = 0; i < d.nest.devices.length; i++) {
      this.text(`${d.nest.devices[i].id} ${i < slots.device ? (d.byDevice[s.devices[i] ?? '']?.name ?? '空位') : '尚未开放'}`, 36, y + 14, 205, 22);
      d.devices.forEach((device, j) => this.button(`equip-${i}-${device.id}`, device.name, 250 + j * 174, y, 160, 'device', `${i}:${device.id}`, s.devices[i] === device.id ? C.yellow : C.blue, i < slots.device && a.isUnlocked(device.unlock.z, device.unlock.w)));
      this.button(`unequip-${i}`, '空', 600, y, 110, 'device', `${i}:`, '#ddd9d2', i < slots.device); y += 76;
    }
  }
  private dailyPanel(): void {
    const a = this.app, d = a.data; let y = this.panelTop + 110;
    if (!a.dailyUnlocked) { this.text('打败第一个大噩梦以后', 60, y + 90, 630, 32, C.muted, 'center'); this.text('整理一件小事，守夜时就多一点勇气。', 60, y + 154, 630, 24, C.muted, 'center'); return; }
    this.text(`已经做完 ${a.save.daily.done} 件`, 36, y, 678, 30); y += 60;
    this.text(`每件做完，全队攻击 ×${d.researchDaily.eff.atk}`, 36, y, 678, 26); y += 70;
    if (a.save.daily.endAt !== null) {
      this.text(`这件还要 ${timeText(a.save.daily.endAt - Date.now() / 1000)}`, 36, y, 678, 30); y += 70;
      this.text('完成后会自动开始下一件。\n羊不够时，会等你回来点开始。', 36, y, 678, 26, C.muted);
    } else {
      this.text(`一件用时 ${timeText(d.researchDaily.min * 60)}`, 36, y, 678, 28); y += 70;
      this.text(`花费 羊 ${Core.fmt(Core.dailyCost(d, a.save))}\n按守住的最高一波计算。`, 36, y, 678, 26, C.muted); y += 110;
      this.button('start-daily', `开始下一件 · 羊${Core.fmt(Core.dailyCost(d, a.save))}`, 36, y, 678, 'daily', undefined, C.green, a.save.sheep >= Core.dailyCost(d, a.save));
    }
  }
  private boxPanel(): void {
    const a = this.app, d = a.data; let y = this.panelTop + 96;
    if (!a.boxUnlocked) { this.text('守住第10波以后，床底下会有纸箱。', 60, y + 100, 630, 30, C.muted, 'center'); return; }
    this.text(`免费纸箱 ${a.save.boxes.free} / ${d.econ.freeBoxMax}`, 36, y, 678, 28); y += 44;
    this.text(a.save.boxes.free >= d.econ.freeBoxMax ? '已经攒满了，打开一个吧' : `下一个还要 ${timeText(a.save.boxes.clock + d.econ.freeBoxEveryH * 3600 - Date.now() / 1000)}`, 36, y, 678, 24, C.muted); y += 46;
    this.button('open-free', '开免费纸箱', 36, y, 320, 'box', 'free', C.green, a.save.boxes.free > 0);
    this.button('open-paid', `星星糖${d.econ.boxCandy} · 开纸箱`, 380, y, 334, 'box', 'paid', C.yellow, a.save.candy >= d.econ.boxCandy); y += 82;
    this.text(`许愿 · 指定伙伴得到${d.econ.wishShards}片碎片`, 36, y, 678, 26); y += 50;
    const ids = [d.captain.id, ...d.toys.filter(t => a.save.toys[t.id]?.got).map(t => t.id)];
    if (!ids.includes(a.selectedToy)) a.selectedToy = ids[0];
    ids.forEach((id, i) => this.button(`wish-select-${id}`, d.byToy[id]?.name ?? d.captain.name, 36 + i % 4 * 172, y + Math.floor(i / 4) * 70, 160, 'selectWish', id, a.selectedToy === id ? C.lilac : '#e0ddd6'));
    y += Math.ceil(ids.length / 4) * 70 + 14;
    this.button('wish', `向${d.byToy[a.selectedToy]?.name ?? d.captain.name}许愿 · 星星糖${d.econ.wishCandy}`, 36, y, 678, 'wish', a.selectedToy, C.yellow, a.save.candy >= d.econ.wishCandy);
  }
  private settingsPanel(): void {
    const a = this.app; let y = this.panelTop + 104;
    this.button('flash-mode', `手电筒：${a.save.autoFlash ? '自动开启' : '手动拖动'}（点此切换）`, 36, y, 678, 'flashMode', undefined, C.yellow); y += 82;
    this.text('手动：按住右侧手电按钮，拖向噩梦。\n充满时发光；松手后继续沿最后方向照。', 36, y, 678, 24, C.muted); y += 98;
    this.rect(36, y, 678, 84, '#ece8e0'); this.text('音量 · P1暂未加入音效与音乐', 60, y + 25, 630, 24, C.muted); y += 108;
    this.text('进度在每波结束、升级与切后台时自动保存。\n全部美术使用简单色块，玩法与存档独立运行。', 36, y, 678, 24, C.muted); y += 120;
    if (a.development) this.button('debug-open', '打开开发调试', 36, y, 678, 'debug', undefined, C.lilac);
  }
  private debugPanel(): void {
    const a = this.app; this.pager(3, 1, this.panelTop + this.panelH - 70); let y = this.panelTop + 100;
    if (a.page === 0) {
      this.button('debug-z', `梦 ${a.debugZ}：${a.data.zones[a.debugZ].name}`, 36, y, 678, 'debugZ'); y += 76;
      this.button('debug-wminus', '−1', 36, y, 120, 'debugW', -1); this.text(`第 ${a.debugW} 波`, 170, y + 13, 240, 26, C.ink, 'center');
      this.button('debug-wplus', '+1', 430, y, 120, 'debugW', 1); this.button('debug-w10', '+10', 570, y, 144, 'debugW', 10); y += 76;
      this.button('jump', '跳到这波', 36, y, 320, 'jump', undefined, C.yellow); this.button('progress', '前面设为已守住', 380, y, 334, 'progress', undefined, C.lilac); y += 84;
      this.button('money10', '羊 ×10', 36, y, 208, 'money', 10, C.green); this.button('money1000', '羊 ×1000', 264, y, 224, 'money', 1000, C.green); this.button('candy', '糖 +100', 508, y, 206, 'candy', undefined, C.yellow); y += 76;
      this.button('shards', '全员碎片 +100', 36, y, 320, 'shards', undefined, C.lilac); this.button('box+1', '免费纸箱 +1', 380, y, 334, 'addBox', undefined, C.yellow); y += 76;
      this.button('lv-minus', '−25', 36, y, 126, 'debugLevel', -25); this.text(`上场 Lv ${a.debugLevel}`, 176, y + 14, 260, 24, C.ink, 'center'); this.button('lv-plus', '+25', 452, y, 126, 'debugLevel', 25); this.button('lv-apply', '应用', 594, y, 120, 'setLevels', undefined, C.green);
    } else if (a.page === 1) {
      this.text('战斗速度（不改变现实的纸箱/小事时钟）', 36, y, 678, 24, C.muted); y += 56;
      [1, 2, 4].forEach((n, i) => this.button(`speed-${n}`, `${n}倍速`, 36 + i * 230, y, 218, 'speed', n, a.speed === n ? C.yellow : C.blue)); y += 88;
      this.button('offline1', '假装离开1小时', 36, y, 320, 'offline', 1, C.green); this.button('offline8', '假装离开8小时', 380, y, 334, 'offline', 8, C.green); y += 76;
      this.button('offline20', '假装离开20小时', 36, y, 320, 'offline', 20, C.green); this.button('finishDaily', '这件小事立即完成', 380, y, 334, 'finishDaily', undefined, C.lilac); y += 84;
      this.button('overlay', `DPS / 站位 / 窝边点：${a.debugOverlay ? '开' : '关'}`, 36, y, 678, 'overlay', undefined, C.blue); y += 76;
      this.button('longest', `最长文案：${a.longestText ? '开' : '关'}`, 36, y, 678, 'longest', undefined, C.lilac);
    } else {
      this.text(`一波一行记录：${a.rows.length} 波`, 36, y, 678, 28); y += 54;
      this.button('csv', '导出 CSV', 36, y, 678, 'csv', undefined, C.green); y += 92;
      this.text('美术模式：强制色块\n已遵照要求，不加载任何旧版美术。\n不存在外部图像依赖或缺图阻塞。', 36, y, 678, 24, C.muted); y += 150;
      this.text('发布版没有调试入口。\n清空存档后从第一波重新开始。', 36, y, 678, 24, C.muted); y += 104;
      this.button('reset', '清空存档…', 36, y, 678, 'reset', undefined, C.red);
    }
  }

  private modal(): void {
    this.layer = 3; const a = this.app, modal = a.modal!;
    this.rect(0, 0, 750, this.h, '#111a29c9'); this.hits = [];
    const lines = modal.kind === 'morning' && modal.card ? [
      `守了 ${timeText(modal.card.seconds)}${modal.card.capped ? '（最多结算8小时）' : ''}`,
      `大约拍散 ${Core.fmt(modal.card.kills)} 只噩梦`, `羊 +${Core.fmt(modal.card.sheep)}`, `星星糖 +${modal.card.candy}`,
      ...(modal.card.dailyCompleted ? [`完成小事 ${modal.card.dailyCompleted} 件`] : []),
      ...(modal.card.freeBoxes ? [`纸箱增加 ${modal.card.freeBoxes} 个`] : []),
    ] : modal.lines;
    const wrappedLines = lines.flatMap(text => wrapText(text, 570, 24));
    const rowsPerPage = Math.max(6, Math.floor((this.h - 480) / 46.2));
    const pageCount = Math.max(1, Math.ceil(wrappedLines.length / rowsPerPage));
    modal.page = Math.min(pageCount - 1, modal.page ?? 0);
    const visibleLines = wrappedLines.slice(modal.page * rowsPerPage, (modal.page + 1) * rowsPerPage);
    const textHeight = visibleLines.length * 46.2;
    const boxH = Math.min(this.h - 100, Math.max(400, textHeight + (pageCount > 1 ? 280 : 210))); const top = (this.h - boxH) / 2;
    this.rect(54, top, 642, boxH, C.panel); this.text(modal.title, 90, top + 32, 570, 32, C.ink, 'center');
    let y = top + 105;
    for (const text of visibleLines) y += this.text(text, 90, y, 570, 24, C.ink, modal.kind === 'intro' ? 'left' : 'center') + 15;
    if (pageCount > 1) {
      this.button('modal-prev', '上一页', 90, top + boxH - 158, 170, 'modalPage', -1, '#dce3e8', modal.page > 0);
      this.text(`${modal.page + 1} / ${pageCount}`, 278, top + boxH - 144, 194, 24, C.ink, 'center');
      this.button('modal-next', '下一页', 490, top + boxH - 158, 170, 'modalPage', 1, '#dce3e8', modal.page < pageCount - 1);
    }
    if (modal.kind === 'reset') {
      this.button('cancel-reset', '取消', 90, top + boxH - 90, 264, 'dismiss', undefined, '#d9dee4');
      this.button('confirm-reset', '清空并重新开始', 378, top + boxH - 90, 282, 'confirmReset', undefined, C.red);
    } else this.button('modal-dismiss', modal.kind === 'morning' ? '收下' : modal.kind === 'intro' ? '你睡吧，我们守着' : '知道了', 90, top + boxH - 90, 570, 'dismiss', undefined, C.green);
  }
}
