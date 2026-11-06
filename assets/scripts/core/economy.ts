import { add, mul, clamp } from './big.ts';
import { baseHp, sheepForHp, table } from './data.ts';
import { nextRandom } from './rng.ts';
import type { Battle, GameData, Save, Unlock, WaveResult, MorningCard } from './types.ts';
export function copySave(s:Save):Save{return JSON.parse(JSON.stringify(s)) as Save;}
export function newSave(d:GameData,now:number):Save {
 const s:Save={version:1,z:0,w:1,maxZ:0,maxW:0,stay:false,pushBlock:0,courage:0,sheep:0,candy:0,toys:{},captain:{star:1,shards:0},fort:1,lineup:d.nest.slots.map(()=>null),devices:d.nest.devices.map(()=>null),farm:null,daily:{done:0,endAt:null},boxes:{free:0,clock:now},firstClear:{},bossBest:{},units:0,stats:{kills:0,sheepTotal:0,maxHit:0},rng:7920,autoFlash:true,lastSeen:now,attempts:{},completed:false};
 d.toys.forEach(t=>s.toys[t.id]={lv:1,star:1,shards:0,got:t.unlock.z===0&&t.unlock.w===0});
 d.toys.filter(t=>s.toys[t.id].got).slice(0,slotsOf(d,s.fort).toy).forEach((t,i)=>s.lineup[d.nest.slots.findIndex(x=>x.id===d.nest.openOrder[i])]=t.id);
 d.devices.filter(x=>x.unlock.z===0&&x.unlock.w===0).slice(0,slotsOf(d,s.fort).device).forEach((x,i)=>s.devices[i]=x.id);return s;
}
export function toyAtk(d:GameData,id:string,lv:number,star:number):number {const t=d.byToy[id];return t?mul(d.econ.atk0,t.base,table(d,'atk',lv-1),table(d,'star',star-1)):0;}
export function teamMul(d:GameData,s:Save):{total:number;parts:{name:string;mul:number}[]} {
 const parts=[{name:'不怕了',mul:table(d,'courage',s.courage)},{name:'枕头堡',mul:table(d,'fort',s.fort-1)},{name:'绵绵光环',mul:1+d.econ.captainAura[s.captain.star-1]},{name:'每天的小事',mul:table(d,'daily',s.daily.done)}];
 for(const id of new Set(s.devices)){const dev=id?d.byDevice[id]:null;if(dev?.effect.atkAll)parts.push({name:dev.name,mul:1+dev.effect.atkAll});}return {total:mul(...parts.map(x=>x.mul)),parts};
}
export function lvCap(d:GameData,courage:number):number{return d.econ.lvCap0+d.econ.lvCapPerBoss*courage;}
export function lvCost(d:GameData,lv:number,courage:number):number {return mul(d.econ.lvCost0,table(d,'cost',lv-1),table(d,'over',Math.max(0,lv+1-lvCap(d,courage))));}
export function levelUp(d:GameData,s:Save,id:string):Save|null {const t=s.toys[id];if(!t?.got||t.lv>=d.rules.tableSize)return null;const cost=lvCost(d,t.lv,s.courage);if(s.sheep<cost)return null;const n=copySave(s);n.sheep-=cost;n.toys[id].lv++;return n;}
export function levelAllToCap(d:GameData,s:Save):Save {let n=copySave(s);const cap=lvCap(d,n.courage);const ids=[...new Set(n.lineup.filter((x):x is string=>!!x))];for(let guard=0;guard<d.rules.tableSize*ids.length;guard++){const order=ids.filter(id=>n.toys[id].lv<cap).sort((a,b)=>lvCost(d,n.toys[a].lv,n.courage)-lvCost(d,n.toys[b].lv,n.courage)||a.localeCompare(b));if(!order.length)break;const next=levelUp(d,n,order[0]);if(!next)break;n=next;}return n;}
export function fortCost(d:GameData,fort:number):number{return mul(d.econ.fortCost0,table(d,'fortCost',fort-1));}
export function fortUp(d:GameData,s:Save):Save|null {const cost=fortCost(d,s.fort);if(s.sheep<cost||s.fort>=d.rules.tableSize)return null;const n=copySave(s);n.sheep-=cost;n.fort++;return n;}
export function slotsOf(d:GameData,fortLv:number):{toy:number;device:number}{const get=(rows:number[][])=>rows.reduce((n,[lv,count])=>fortLv>=lv?count:n,0);return {toy:get(d.slots.toy),device:get(d.slots.device)};}
export function openSlots(d:GameData,s:Save):string[]{return d.nest.openOrder.slice(0,slotsOf(d,s.fort).toy);}
export function assignToy(d:GameData,s:Save,slot:string,id:string|null):Save|null {if(!openSlots(d,s).includes(slot)||id&&!s.toys[id]?.got)return null;const n=copySave(s);const index=d.nest.slots.findIndex(x=>x.id===slot);if(id){const old=n.lineup.indexOf(id);if(old>=0)n.lineup[old]=null;}n.lineup[index]=id;return n;}
export function swapSlots(d:GameData,s:Save,a:string,b:string):Save|null {if(!openSlots(d,s).includes(a)||!openSlots(d,s).includes(b))return null;const n=copySave(s);const i=d.nest.slots.findIndex(x=>x.id===a),j=d.nest.slots.findIndex(x=>x.id===b);[n.lineup[i],n.lineup[j]]=[n.lineup[j],n.lineup[i]];return n;}
export function reached(s:Save,z:number,w:number):boolean{return s.maxZ>z||s.maxZ===z&&s.maxW>=w;}
export function systemOpen(d:GameData,s:Save,id:string):boolean {const sys=d.systems.find(x=>x.id===id);return !!sys&&reached(s,sys.at[0],sys.at[1]);}
export function availableDevices(d:GameData,s:Save):string[]{return d.devices.filter(x=>reached(s,x.unlock.z,x.unlock.w)).map(x=>x.id);}
export function assignDevice(d:GameData,s:Save,slot:number,id:string|null):Save|null {if(slot<0||slot>=slotsOf(d,s.fort).device||id&&!availableDevices(d,s).includes(id))return null;const n=copySave(s);if(id){const old=n.devices.indexOf(id);if(old>=0)n.devices[old]=null;}n.devices[slot]=id;return n;}
export function openBox(d:GameData,s:Save,free:boolean):{save:Save;shards:string[]}|null {
 if(!systemOpen(d,s,'stars')||(free?s.boxes.free<1:s.candy<d.econ.boxCandy))return null;
 const n=copySave(s);if(free)n.boxes.free--;else n.candy-=d.econ.boxCandy;
 const active=[...new Set(n.lineup.filter((x):x is string=>!!x&&n.toys[x]?.got)),d.captain.id]; const reserve=d.toys.filter(t=>n.toys[t.id].got&&!active.includes(t.id)).map(t=>t.id);const shards:string[]=[];
 const rand=()=>{const r=nextRandom(n.rng);n.rng=r.state;return r.value;};
 for(let i=0;i<d.econ.boxShards;i++){const pool=rand()<d.econ.boxLineupWeight||!reserve.length?active:reserve;const id=pool[Math.floor(rand()*pool.length)];if(id===d.captain.id)n.captain.shards++;else n.toys[id].shards++;shards.push(id);}return {save:n,shards};
}
export function wish(d:GameData,s:Save,id:string):Save|null {if(!systemOpen(d,s,'stars')||s.candy<d.econ.wishCandy||id!==d.captain.id&&!s.toys[id]?.got)return null;const n=copySave(s);n.candy-=d.econ.wishCandy;if(id===d.captain.id)n.captain.shards+=d.econ.wishShards;else n.toys[id].shards+=d.econ.wishShards;return n;}
export function starUp(d:GameData,s:Save,id:string):Save|null {const t=id===d.captain.id?s.captain:s.toys[id];if(!systemOpen(d,s,'stars')||!t||('got'in t&&!t.got)||t.star>=d.econ.starShards.length||t.shards<d.econ.starShards[t.star])return null;const n=copySave(s);const target=id===d.captain.id?n.captain:n.toys[id];target.shards-=d.econ.starShards[target.star];target.star++;return n;}
export function dailyCost(d:GameData,s:Save):number {return mul(d.researchDaily.costWaves,d.wave.count,sheepForHp(d,baseHp(d,s.maxZ,Math.max(1,Math.min(d.wave.perZone-1,s.maxW)))));}
export function startDaily(d:GameData,s:Save,now:number):Save|null {const cost=dailyCost(d,s);if(!systemOpen(d,s,'daily')||s.daily.endAt!==null||s.sheep<cost)return null;const n=copySave(s);n.sheep-=cost;n.daily.endAt=now+d.researchDaily.min*60;return n;}
export function advanceClocks(d:GameData,s:Save,now:number):Save {
 const n=copySave(s);if(now<n.lastSeen){n.lastSeen=now;n.boxes.clock=now;return n;}
 if(systemOpen(d,n,'stars')){const period=d.econ.freeBoxEveryH*3600;const elapsed=Math.floor(Math.max(0,now-n.boxes.clock)/period);if(elapsed>0){n.boxes.free=Math.min(d.econ.freeBoxMax,n.boxes.free+elapsed);n.boxes.clock+=elapsed*period;}}
 let guard=0;while(n.daily.endAt!==null&&n.daily.endAt<=now&&guard++<10000){const finished=n.daily.endAt;n.daily.done++;n.daily.endAt=null;const cost=dailyCost(d,n);if(n.sheep>=cost){n.sheep-=cost;n.daily.endAt=finished+d.researchDaily.min*60;}}
 return n;
}
export function settleOffline(d:GameData,s:Save,now:number):{save:Save;card:MorningCard|null} {
 if(now<s.lastSeen){const n=copySave(s);n.lastSeen=now;n.boxes.clock=now;return {save:n,card:null};}
 const elapsed=now-s.lastSeen;let n=advanceClocks(d,s,now);n.lastSeen=now;
 if(elapsed<d.rules.offlineMinimum)return {save:n,card:null};
 const dt=Math.min(elapsed,d.econ.offlineCapH*3600); const rates=s.farm?.rates??[]; const rate=rates.length?rates.reduce((a,b)=>a+b,0)/rates.length:0; const sheep=mul(rate,dt,d.econ.offlineEff);const candy=Math.floor(dt/3600)*d.econ.candyPerOfflineH;
 n.sheep=add(n.sheep,sheep);n.candy+=candy;n.stats.sheepTotal=add(n.stats.sheepTotal,sheep);
 const times=s.farm?.durations??[];const duration=times.length?times.reduce((a,b)=>a+b,0)/times.length:0;const kills=duration>0?Math.floor(dt/duration*d.wave.count):0;n.stats.kills+=kills;
 return {save:n,card:{seconds:dt,sheep,candy,kills,z:s.farm?.z??s.z,w:s.farm?.w??s.w,capped:elapsed>dt,dailyCompleted:n.daily.done-s.daily.done,freeBoxes:Math.max(0,n.boxes.free-s.boxes.free)}};
}
export function collectBattleRewards(d:GameData,s:Save,b:Battle):Save {const sheep=Math.max(0,b.sheep-b.creditedSheep),kills=Math.max(0,b.kills-b.creditedKills);const n=copySave(s);n.sheep=add(n.sheep,sheep);n.stats.sheepTotal=add(n.stats.sheepTotal,sheep);n.stats.kills+=kills;n.stats.maxHit=Math.max(n.stats.maxHit,b.maxHit);b.creditedSheep=b.sheep;b.creditedKills=b.kills;if(b.outcome){b.outcome.creditedSheep=b.sheep;b.outcome.creditedKills=b.kills;}return n;}
export function onWaveEnd(d:GameData,s:Save,r:WaveResult):{save:Save;unlocked:Unlock[]} {
 const n=copySave(s);const unlocked:Unlock[]=[];const sheep=Math.max(0,r.sheep-(r.creditedSheep??0));n.sheep=add(n.sheep,sheep);n.stats.sheepTotal=add(n.stats.sheepTotal,sheep);n.stats.kills+=Math.max(0,r.kills-(r.creditedKills??0));n.stats.maxHit=Math.max(n.stats.maxHit,r.maxHit??0);
 const w=r.boss?d.wave.perZone:r.w;if(r.boss)n.bossBest[r.z]=Math.max(0,Math.min(1,r.bossDamage));
 if(r.won){const clear=(n.firstClear[r.z]??'0'.repeat(d.wave.perZone)).split('');const first=clear[w-1]!=='1';clear[w-1]='1';n.firstClear[r.z]=clear.join('');
  if(r.z>n.maxZ||r.z===n.maxZ&&w>n.maxW){n.maxZ=r.z;n.maxW=w;}
  if(first){n.candy+=r.boss?d.boss.candyFirst:d.econ.candyWave+(w%d.wave.eliteEvery===0?d.econ.candyWave10:0);for(const u of d.unlocks.filter(x=>x.z===r.z&&x.w===w)){unlocked.push(u);for(const id of u.toys)n.toys[id].got=true;if(u.systems.includes('stars')){n.boxes.free=Math.min(d.econ.freeBoxMax,n.boxes.free+1);n.boxes.clock=n.lastSeen;}}
   if(r.boss){n.courage++;const bonus=mul(sheepForHp(d,baseHp(d,r.z,d.wave.perZone-1)),d.boss.sheepMul);n.sheep=add(n.sheep,bonus);n.stats.sheepTotal=add(n.stats.sheepTotal,bonus);}}
  if(r.clean&&!r.boss){const better=!n.farm||r.z>n.farm.z||r.z===n.farm.z&&r.w>n.farm.w;const same=n.farm&&r.z===n.farm.z&&r.w===n.farm.w;if(better)n.farm={z:r.z,w:r.w,rates:[],durations:[]};if((better||same)&&n.farm){const duration=r.duration+d.wave.gapAfter;n.farm.rates=[...n.farm.rates,r.sheep/duration].slice(-3);n.farm.durations=[...(n.farm.durations??[]),duration].slice(-3);}}
  if(r.boss){const next=d.zones.find(z=>z.id===r.z+1);n.z=next?next.id:r.z;n.w=next?1:d.wave.perZone-1;n.completed=!next;n.pushBlock=0;}
  else {if(n.pushBlock>0)n.pushBlock=r.clean?Math.max(0,n.pushBlock-1):d.wave.retryAfter;if(!n.stay&&!n.completed&&n.pushBlock===0)n.w=Math.min(d.wave.perZone-1,r.w+1);}
 } else if(r.boss){n.w=d.wave.perZone-1;}else {n.w=Math.max(1,r.w-d.wave.fallback);n.pushBlock=d.wave.retryAfter;}
 return {save:n,unlocked};
}
export function damageBreakdown(d:GameData,s:Save,id:string,slot?:string):{total:number;parts:{name:string;mul:number}[]} {const t=s.toys[id],def=d.byToy[id];if(!t||!def)return {total:0,parts:[]};let support=0;const targetSlot=slot??d.nest.slots[s.lineup.indexOf(id)]?.id;
 for(let i=0;i<s.lineup.length;i++){const other=s.lineup[i];if(other==='dingdang'&&other!==id&&targetSlot&&d.nest.slots[i].adjacent.includes(targetSlot))support+=d.econ.supportBuff[s.toys[other].star-1];}
 const parts=[{name:'基础攻击',mul:toyAtk(d,id,t.lv,t.star)},...teamMul(d,s).parts,{name:'邻位攻击辅助',mul:1+support},{name:'辅助自身',mul:def.stance==='帮'?d.econ.supportSelf:1}];return {total:mul(...parts.map(x=>x.mul)),parts};}
