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
if (fail) process.exit(1);
console.log(`PASS: ${Object.keys(expected).length} 份规格文件完整；运行时两份 JSON 与原件逐字节一致。`);
