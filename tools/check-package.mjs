import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
const cfg=JSON.parse(fs.readFileSync('tools/release.json','utf8'));
const targets=process.argv[2]==='all'?['h5','wechat']:[process.argv[2]];
for(const target of targets){
 if(!['h5','wechat'].includes(target))throw new Error('h5 | wechat | all');
 const out=cfg[target+'Output'];
 const sums=fs.readFileSync(path.join(out,'SHA256SUMS.txt'),'utf8').trim();
 const [hash,name]=sums.split(/  /);const zip=path.join(out,name);
 const actual=crypto.createHash('sha256').update(fs.readFileSync(zip)).digest('hex');if(actual!==hash)throw new Error(`${zip} SHA256 不一致`);
 const listing=spawnSync('unzip',['-Z1',zip],{encoding:'utf8'});if(listing.status!==0)throw new Error(listing.stderr);
 const names=listing.stdout.trim().split('\n');
 if(names.some(n=>!n.startsWith('zhentou/')||n.includes('..')||/(__MACOSX|\.DS_Store|\.meta$|project\.private\.config\.json$)/.test(n)))throw new Error(`${zip} 目录或私有文件检查失败`);
 const entry=target==='h5'?'index.html':'game.js';if(!names.includes('zhentou/'+entry))throw new Error(`缺少 ${entry}`);
 const manifest=JSON.parse(fs.readFileSync(path.join(out,'manifest.json'),'utf8'));
 for(const file of manifest.files){const r=spawnSync('unzip',['-p',zip,'zhentou/'+file.path],{maxBuffer:Math.max(file.bytes+1024,1024*1024)});if(r.status!==0||crypto.createHash('sha256').update(r.stdout).digest('hex')!==file.sha256)throw new Error(`ZIP 文件校验失败：${file.path}`);}
 console.log(`PASS ${target}: SHA256、单英文顶层目录、${manifest.files.length} 文件完整性；运行时表现与平台审核需另验。`);
}
