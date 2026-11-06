import fs from 'node:fs';
import * as Core from '../preview/scripts/core/index.js';
import { GameController } from '../preview/scripts/ui/GameController.js';
import { GameView } from '../preview/scripts/ui/GameView.js';

// Engine-neutral capture of the real GameView commands. This is not a browser or device screenshot.
const root = 'docs/screenshots/p1-walk'; fs.mkdirSync(root, { recursive: true });
const app = new GameController(Core.RAW_DATA, { getItem: () => null, setItem: () => {}, removeItem: () => {} }, true, () => 1000);
app.action('dismiss'); app.save.fort = 22; app.save.maxZ = 2; app.save.maxW = 49; app.save.w = 25; app.save.sheep = 100000;
const ids = ['fangfang', 'huhu', 'gaga', 'dingdang', 'ruanruan', 'abing'];
for (const id of ids) { app.save.toys[id].got = true; app.save.toys[id].lv = 4; }
app.save.lineup = ids.map((id, index) => ({ id, home: [...app.data.nest.homes[index]] }));
app.battle = Core.startWave(app.data, app.save, { attempt: 0 }); app.battle.nextSpawn = 100;
for (const [x, y] of [[190, 630], [300, 680], [455, 685], [580, 670], [350, 750], [500, 730], [180, 730]]) Core.spawnEnemy(app.battle, app.data.zones[0].nightmares[0], { x, y, hp: 800 });
for (let i = 0; i < 65; i++) app.tick(1 / 30);
app.selectedActor = 'dingdang'; app.toastUntil = 0;
const view = new GameView(app);
const escape = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[c]);
function capture(name, height) {
  const commands = view.render(height).commands;
  fs.writeFileSync(`${root}/${name}.draw.json`, JSON.stringify({ width: 750, height, commands }));
  const color = (hex, type) => `${type}="${hex.slice(0, 7)}"${hex.length === 9 ? ` ${type}-opacity="${parseInt(hex.slice(7), 16) / 255}"` : ''}`;
  const shapes = commands.slice().sort((a, b) => a.layer - b.layer).map(c => {
    if (c.kind === 'rect') return `<rect x="${c.x}" y="${c.y}" width="${c.w}" height="${c.h}" ${color(c.color, 'fill')}/>`;
    if (c.kind === 'line') return `<line x1="${c.x}" y1="${c.y}" x2="${c.x2}" y2="${c.y2}" stroke-width="${c.width}" ${color(c.color, 'stroke')}/>`;
    if (c.kind === 'poly') return `<polygon points="${c.points.map(p => p.join(',')).join(' ')}" ${color(c.color, 'fill')}/>`;
    return `<text x="${c.x + (c.align === 'center' ? c.width / 2 : c.align === 'right' ? c.width : 0)}" y="${c.y + c.size}" text-anchor="${c.align === 'center' ? 'middle' : c.align === 'right' ? 'end' : 'start'}" font-size="${c.size}" font-family="Noto Sans CJK SC,sans-serif" ${color(c.color, 'fill')}>${escape(c.text)}</text>`;
  });
  fs.writeFileSync(`${root}/${name}.svg`, `<svg xmlns="http://www.w3.org/2000/svg" width="750" height="${height}" viewBox="0 0 750 ${height}">${shapes.join('')}</svg>`);
}
capture('walk-1334-selection-render', 1334); capture('walk-1624-selection-render', 1624);
app.debugOverlay = true; capture('walk-1624-debug-render', 1624);
app.debugOverlay = false; app.selectedActor = null; app.panel = 'toys'; capture('walk-toy-cards-render', 1334);
console.log(`PASS: Four real GameView render captures in ${root}; not device screenshots.`);
