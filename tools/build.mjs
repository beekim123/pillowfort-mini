import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
const target=process.argv[2];
if (!['h5','wechat'].includes(target)) throw new Error('用法：node tools/build.mjs h5|wechat');
const engine=process.env.COCOS_CREATOR;
if (!engine || !fs.existsSync(engine)) { console.error('尚未配置 Cocos Creator 3.8.8 可执行文件。请按 docs/BUILD.md 设置 COCOS_CREATOR。引擎构建未执行。'); process.exit(2); }
if (!fs.existsSync('assets/scenes/Main.scene') || !fs.existsSync('assets/scenes/Main.scene.meta')) { console.error('尚无 Main.scene。请完成 README 的一次性编辑器步骤并保存。引擎构建未执行。');process.exit(2); }
const sceneMeta=JSON.parse(fs.readFileSync('assets/scenes/Main.scene.meta','utf8'));
if (!sceneMeta.uuid) throw new Error('Main.scene.meta 缺少 Cocos UUID');
const platform=target==='h5'?'web-mobile':'wechatgame';
const config={name:platform,platform,buildPath:'project://build',debug:false,sourceMaps:false,md5Cache:true,startScene:sceneMeta.uuid,scenes:[{url:'db://assets/scenes/Main.scene',uuid:sceneMeta.uuid}],orientation:'portrait'};
if (target==='wechat') {
  if (!process.env.WECHAT_APPID) { console.error('微信构建需要 WECHAT_APPID（自己的 AppID 或开发者工具支持的测试号）。不会替你填入未授权 AppID。');process.exit(2); }
  config.packages={wechatgame:{appid:process.env.WECHAT_APPID,orientation:'portrait'}};
}
fs.mkdirSync('temp',{recursive:true});
const configPath=path.resolve(`temp/build-${platform}.json`);fs.writeFileSync(configPath,JSON.stringify(config,null,2));
const p=spawnSync(engine,['--project',process.cwd(),'--build',`configPath=${configPath}`],{stdio:'inherit'});
if (p.error) throw p.error;
if (p.status!==0 && p.status!==36) {console.error(`Cocos 构建失败，退出码 ${p.status}`);process.exit(p.status??1);}
const artifact=target==='h5'?'build/web-mobile/index.html':'build/wechatgame/game.js';
if (!fs.existsSync(artifact)) {console.error(`Cocos 未生成预期产物 ${artifact}。请在编辑器确认构建配置；没有打包。`);process.exit(1);}
const pack=spawnSync(process.execPath,['tools/package.mjs',target],{stdio:'inherit'});process.exit(pack.status??1);
