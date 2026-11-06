import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
fs.mkdirSync('preview', { recursive: true });
fs.writeFileSync('preview/package.json', JSON.stringify({ type: 'module', private: true }));
const compile = spawnSync(process.execPath, ['node_modules/typescript/bin/tsc', '-p', 'tsconfig.preview.json'], { stdio: 'inherit' });
if (compile.status !== 0) process.exit(compile.status ?? 1);
function walk(dir) { return fs.readdirSync(dir).flatMap(f=> { const p=path.join(dir,f); return fs.statSync(p).isDirectory()?walk(p):[p]; }); }
for (const file of walk('preview/scripts').filter(f=>f.endsWith('.js'))) {
  let s=fs.readFileSync(file,'utf8');
  s=s.replace(/(from\s*|import\s*)(['"])(\.{1,2}\/[^'"]+)\2/g, (all, head, quote, spec) => /\.(js|json)$/.test(spec) ? all : `${head}${quote}${spec}.js${quote}`);
  fs.writeFileSync(file,s);
}
fs.copyFileSync('assets/resources/data/levels.json','preview/levels.json');
fs.copyFileSync('tools/preview.html','preview/index.html');
console.log('PASS: 引擎外 Canvas 预览已生成到 preview/。它不是 Cocos 或 TapTap 构建。npm run preview 启动。');
