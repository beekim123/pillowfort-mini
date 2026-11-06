// Pure-logic progression fixture. Simulated offline hours are not player time or device evidence.
import {DATA as d,newSave,startWave,step,result,onWaveEnd,collectBattleRewards,syncBattle,levelUp,fortUp,fortCost,lvCost,openSlots,assignToy,assignDevice,availableDevices,settleOffline,openBox,starUp,systemOpen,serializeSave} from '../preview/scripts/core/index.js';
let now=0,s=newSave(d,now),previous;let offlineHours=0;const clears=[];let lastZ=0;let bossWait=0;
function prepare(){
 const owned=d.toys.filter(t=>s.toys[t.id].got);for(const t of owned){if(s.lineup.includes(t.id))continue;const open=openSlots(d,s).find(slot=>!s.lineup[d.nest.slots.findIndex(p=>p.id===slot)]);if(open)s=assignToy(d,s,open,t.id);}
 for(const dev of availableDevices(d,s)){if(s.devices.includes(dev))continue;for(let i=0;i<s.devices.length;i++){if(s.devices[i])continue;const n=assignDevice(d,s,i,dev);if(n){s=n;break;}}}
 for(let i=0;i<2000;i++){const ids=s.lineup.filter(x=>!!x);const id=ids.sort((a,b)=>lvCost(d,s.toys[a].lv,s.courage)-lvCost(d,s.toys[b].lv,s.courage))[0];if(!id)break;let n;if(fortCost(d,s.fort)<lvCost(d,s.toys[id].lv,s.courage)*3)n=fortUp(d,s);else n=levelUp(d,s,id);if(!n)break;s=n;}
 if(systemOpen(d,s,'stars')){for(let i=0;i<500;i++){const o=openBox(d,s,s.boxes.free>0);if(!o)break;s=o.save;}for(const id of [...Object.keys(s.toys),'mianmian']){let n;while(n=starUp(d,s,id))s=n;}}
}
for(let wave=0;wave<1600&&!s.completed;wave++){
 prepare();const boss=s.w===49&&bossWait<=0;const b=startWave(d,s,{attempt:wave+1,boss,carry:previous,elapsedBetweenWaves:previous?1:0});for(let i=0;i<6000&&!result(b);i++)step(b,1/30);const r=result(b);if(!r)throw new Error('Unfinished wave');now+=r.duration+1;s=collectBattleRewards(d,s,b);s.lastSeen=now;s=onWaveEnd(d,s,r).save;previous=b;
 if(r.boss){clears.push({wave,z:r.z,won:r.won,bossDamage:r.bossDamage,levels:s.lineup.filter(Boolean).map(id=>s.toys[id].lv),fort:s.fort,hours:offlineHours});if(!r.won)bossWait=10;}else bossWait--;
 if(!r.won||wave%25===24){now+=8*3600;s=settleOffline(d,s,now).save;offlineHours+=8;}
 if(s.z!==lastZ){console.log('ZONE',s.z,'after',wave+1,'waves',offlineHours,'offline hours');lastZ=s.z;}
 if(wave===1599)console.log('LIMIT',s.z,s.w,s.fort,s.lineup.filter(Boolean).map(id=>s.toys[id].lv));
}
console.log(JSON.stringify({completed:s.completed,z:s.z,w:s.w,offlineHours,bosses:clears},null,2));

if(!s.completed || s.z!==2 || s.w!==49 || ![0,1,2].every(z=>clears.some(x=>x.z===z&&x.won))) throw new Error("P1 progression did not finish all three bosses at the final boundary");
