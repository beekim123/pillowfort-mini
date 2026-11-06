// 把美术交来的出图代码（art-code/，ES module，argon 原样交付，不改）打成一个脚本 assets/scripts/art/artcode.gen.ts。
// 浏览器预览、Cocos、微信都只 import 这一个文件，不用动态 import。做法同画风库 style-lab/build.mjs 的 bundleArtCode。
// 用法：node tools/bundle-art.mjs        （美术换了新一批就重跑；生成的文件提交进仓库）
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const SRC = 'art-code', OUT = 'assets/scripts/art/artcode.gen.ts';
const walk = dir => fs.readdirSync(dir, { withFileTypes: true }).flatMap(e => e.name.startsWith('.') ? [] : e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)]);
// preview.html 用的辅助文件不进游戏
const SKIP = new Set(['layout-stub.js']);
const files = walk(SRC).filter(f => f.endsWith('.js')).map(f => path.relative(SRC, f).split(path.sep).join('/')).filter(f => !SKIP.has(f)).sort();
const hash = crypto.createHash('sha256'), defs = [];
for (const f of files) {
  const src = fs.readFileSync(path.join(SRC, f), 'utf8');
  hash.update(f).update(src);
  const res = q => path.posix.normalize(path.posix.join(path.posix.dirname(f), q));
  const names = [];
  const body = src
    .replace(/import\s*\{([^}]*)\}\s*from\s*['"]([^'"]+)['"];?/g, (_, list, q) => `const {${list.replace(/\b([\w$]+)\s+as\s+([\w$]+)/g, '$1: $2')}} = __req(${JSON.stringify(res(q))});`)
    .replace(/import\s+([\w$]+)\s+from\s*['"]([^'"]+)['"];?/g, (_, n, q) => `const ${n} = __req(${JSON.stringify(res(q))}).default;`)
    .replace(/^export\s*\{([^}]*)\};?/gm, (_, list) => { for (const it of list.split(',')) { const m = it.trim().match(/^([\w$]+)(?:\s+as\s+([\w$]+))?$/); if (m) names.push([m[2] || m[1], m[1]]); } return ''; })
    .replace(/^export\s+default\s+/gm, '__e.default = ')
    .replace(/^export\s+((?:async\s+)?function\*?|const|let|var|class)\s+([\w$]+)/gm, (_, kw, n) => { names.push([n, n]); return `${kw} ${n}`; });
  if (/^\s*(import|export)\s/m.test(body)) throw new Error(`${f} 里有打包不认的 import / export 写法`);
  // 美术代码在浏览器里会把自己挂到 window 上（预览页用），游戏里不需要
  defs.push(`__defs[${JSON.stringify(f)}] = function (__e) {\n${body.replace(/^if \(typeof window !== 'undefined'\) \{\n\s*window\.[\w$]+ = [\w$]+;\n\}/gm, '')}\n${names.map(([o, n]) => `__e[${JSON.stringify(o)}] = ${n};`).join(' ')}\n};`);
}
const version = hash.digest('hex').slice(0, 12);
const out = `// @ts-nocheck
// 由 node tools/bundle-art.mjs 从 art-code/ 生成，别手改。美术代码版本 ${version}（出图缓存用它当名字）。
import type { ArtPackage } from './ArtTypes';
const __defs = {}, __mods = {};
const __req = p => { if (!__mods[p]) { if (!__defs[p]) throw new Error('art-code 里找不到 ' + p); __mods[p] = {}; __defs[p](__mods[p]); } return __mods[p]; };
${defs.join('\n')}
export const ARTCODE = { version: ${JSON.stringify(version)}, files: ${JSON.stringify(files)}, req: __req } as unknown as ArtPackage;
`;
fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, out);
console.log(`PASS: ${files.length} 个美术代码文件 → ${OUT}（版本 ${version}，${Math.round(out.length / 1024)} KB）`);
