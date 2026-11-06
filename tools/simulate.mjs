import fs from 'node:fs';
import { spawnSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
// Emit using the same strict compiler as the preview. This runs simulation time, not a wall-clock device soak.
const built=spawnSync(process.execPath,['tools/build-preview.mjs'],{stdio:'inherit'});if(built.status!==0)process.exit(built.status??1);
const core=await import(pathToFileURL(process.cwd()+'/preview/scripts/core/index.js').href);
const data=core.loadData(JSON.parse(fs.readFileSync('assets/resources/data/levels.json','utf8')));
let save=core.newSave(data,0),elapsed=0,attempt=0,carry;
const rows=[];
const limit=1200;
while(elapsed<limit){
  const battle=core.startWave(data,save,{attempt:attempt++,carry,elapsedBetweenWaves:carry?data.wave.gapAfter:0});
  while(!core.result(battle)&&elapsed<limit){core.step(battle,data.rules.tick,{});elapsed+=data.rules.tick;}
  const r=core.result(battle);
  if(!r)break;
  rows.push(r);save=core.onWaveEnd(data,save,r).save;
  // Explicit reproducible strategy: upgrade currently deployed toys after each wave; no debug grants, boss clicks, boxes or real-clock waits.
  save=core.levelAllToCap(data,save);save.lastSeen=elapsed;
  carry=battle;elapsed+=data.wave.gapAfter;
}
const output='docs/verification/p1-walk';
fs.mkdirSync(output,{recursive:true});
fs.writeFileSync(`${output}/logic-simulation-20m.csv`,core.battleCsv(rows)+'\n');
const report={kind:'Node pure-logic simulation; not Cocos/device runtime',node:process.version,simulatedSeconds:Math.min(limit,elapsed),completedWaves:rows.length,strategy:'Upgrade deployed toys after every wave, no debug grants, no bosses, default lineup.',lastProgress:{z:save.z,w:save.w,maxZ:save.maxZ,maxW:save.maxW},wins:rows.filter(r=>r.won).length,losses:rows.filter(r=>!r.won).length,cocosRuntimeVerified:false};
fs.writeFileSync(`${output}/logic-simulation-20m.json`,JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));
