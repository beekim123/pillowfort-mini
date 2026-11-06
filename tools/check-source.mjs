import fs from 'node:fs';
import path from 'node:path';
let fail = false;
function walk(dir) { return fs.readdirSync(dir).flatMap(f => { const p=path.join(dir,f); return fs.statSync(p).isDirectory()?walk(p):[p]; }); }
const sources = walk('assets/scripts').filter(f=>f.endsWith('.ts'));
for (const f of sources) {
  const s=fs.readFileSync(f,'utf8');
  if (/core\//.test(f) && /(?:from\s*|import\s*\()\s*['"]cc['"]/.test(s)) { console.error(`core 不得依赖引擎：${f}`); fail=true; }
  if (/core\//.test(f) && !f.endsWith('/big.ts') && /Math\.(pow|log\d*|exp)\s*\(/.test(s)) { console.error(`规则不允许 pow/log/exp：${f}`); fail=true; }
  if (/\b(?:as|:)\s*any\b|Array<any>|<any>/.test(s) && !/^\s*declare const wx: any/m.test(s)) { console.error(`发现显式 any：${f}`); fail=true; }
}
if (fail) process.exit(1);
console.log(`PASS: ${sources.length} 份 TypeScript 源码边界检查。此检查不代替引擎编译。`);
