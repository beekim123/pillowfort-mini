import fs from 'node:fs';
import { spawnSync } from 'node:child_process';
if (!fs.existsSync('temp/tsconfig.cocos.json')) {
  console.error('尚无 Cocos 3.8.8 生成的类型。先用编辑器打开工程，等待资源导入；此检查未执行，不能视为通过。');
  process.exit(2);
}
const p = spawnSync(process.execPath, ['node_modules/typescript/bin/tsc', '--noEmit', '-p', 'tsconfig.json'], { stdio: 'inherit' });
process.exit(p.status ?? 1);
