import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
const target=process.argv[2];
if (!['h5','wechat'].includes(target)) throw new Error('用法：node tools/package.mjs h5|wechat');
const cfg=JSON.parse(fs.readFileSync('tools/release.json','utf8'));
const src=cfg[target+'Source'],out=cfg[target+'Output'];
const rootEntry=target==='h5'?'index.html':'game.js';
if(!fs.existsSync(path.join(src,rootEntry))) throw new Error(`缺少真实 Cocos 产物 ${src}/${rootEntry}。package 不会重新编译源码。`);
const archive=`${cfg.title}-${cfg.phase}-${target==='h5'?'H5-TapTap':'微信小游戏'}.zip`;
const stage=path.resolve(out,'staging');fs.mkdirSync(stage,{recursive:true});
// Retain old deliverables before replacing them; never silently delete the only copy.
const archivePath=path.resolve(out,archive);
if(fs.existsSync(archivePath)){const history=path.resolve('build/history',new Date().toISOString().replaceAll(':','-'));fs.mkdirSync(history,{recursive:true});fs.renameSync(archivePath,path.join(history,archive));}
const payload=path.join(stage,'zhentou');fs.rmSync(payload,{recursive:true,force:true});fs.mkdirSync(payload,{recursive:true});
const skip=name=>name==='.DS_Store'||name==='__MACOSX'||name.endsWith('.meta')||name==='project.private.config.json'||name.endsWith('.map');
function copy(a,b){for(const entry of fs.readdirSync(a,{withFileTypes:true})){if(skip(entry.name))continue;const x=path.join(a,entry.name),y=path.join(b,entry.name);if(entry.isSymbolicLink())throw new Error(`不打包符号链接 ${x}`);if(entry.isDirectory()){fs.mkdirSync(y,{recursive:true});copy(x,y);}else fs.copyFileSync(x,y);}}
copy(src,payload);
function files(dir){return fs.readdirSync(dir).sort().flatMap(n=>{const p=path.join(dir,n);return fs.statSync(p).isDirectory()?files(p):[p];});}
const entries=files(payload).map(file=>({path:path.relative(payload,file).split(path.sep).join('/'),bytes:fs.statSync(file).size,sha256:crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex')}));
const manifest={title:cfg.title,phase:cfg.phase,target,packagedAt:new Date().toISOString(),source:src,sourceRecompiled:false,totalBytes:entries.reduce((s,x)=>s+x.bytes,0),files:entries};
if(target==='wechat'){
 const game=JSON.parse(fs.readFileSync(path.join(payload,'game.json'),'utf8'));
 const sub=game.subpackages??game.subPackages??[];
 manifest.subpackages=sub.map(s=>({root:s.root,bytes:entries.filter(x=>x.path.startsWith(s.root.replace(/\/$/,'')+'/')).reduce((a,x)=>a+x.bytes,0)}));
 manifest.mainBytes=manifest.totalBytes-manifest.subpackages.reduce((s,x)=>s+x.bytes,0);
 manifest.mainReferenceBytes=cfg.wechatMainPackageReferenceBytes;
}
fs.writeFileSync(path.join(out,'manifest.json'),JSON.stringify(manifest,null,2)+'\n');
const zip=spawnSync('zip',['-q','-r',archivePath,'zhentou'],{cwd:stage,stdio:'inherit'});if(zip.error)throw zip.error;if(zip.status!==0)process.exit(zip.status??1);
const hash=crypto.createHash('sha256').update(fs.readFileSync(archivePath)).digest('hex');fs.writeFileSync(path.join(out,'SHA256SUMS.txt'),`${hash}  ${archive}\n`);
console.log(`已整理现有编译产物：${archivePath}\n${manifest.totalBytes} bytes 未压缩；并未声称按当前源码重编译或平台审核通过。`);
