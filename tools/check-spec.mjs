import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
const digest = f => crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
const expected = JSON.parse(fs.readFileSync('tools/spec-sha256.json', 'utf8'));
let fail = false;
for (const [file, hash] of Object.entries(expected)) {
  if (!fs.existsSync(file) || digest(file) !== hash) { console.error(`规格快照发生变化：${file}`); fail = true; }
}
for (const file of ['levels.json', 'art-manifest.json']) {
  if (digest(`docs/spec/${file}`) !== digest(`assets/resources/data/${file}`)) { console.error(`运行数据不是规格原件：${file}`); fail = true; }
}
const raw = JSON.parse(fs.readFileSync('assets/resources/data/levels.json', 'utf8'));
const embedded = fs.readFileSync('assets/scripts/core/default-data.ts', 'utf8').match(/export const RAW_DATA = ([\s\S]*);\nexport const DATA/);
if (raw.version !== 2 || !embedded || JSON.stringify(JSON.parse(embedded[1])) !== JSON.stringify(raw)) {
  console.error('v2 默认数据与运行 levels.json 不一致'); fail = true;
}
if (fail) process.exit(1);
console.log(`PASS: ${Object.keys(expected).length} 份 v1/v2 规格文件完整；运行时两份 JSON 与 v2 原件逐字节一致；默认数据一致。`);
