import { add, clamp, mul } from './big.ts';
import { baseHp, sheepForHp } from './data.ts';
import { damageBreakdown, openSlots } from './economy.ts';
import { battleSeed, nextRandom } from './rng.ts';
import type { AttackBreakdown, Battle, BattleEvent, BattleUnit, Enemy, GameData, Point, Save, WaveResult } from './types.ts';
const EPS=1e-8;
function emit(b:Battle,type:string,detail:Record<string,unknown>={}):void {b.events.push({type,time:b.time,...detail});}
function random(b:Battle):number {const r=nextRandom(b.rng);b.rng=r.state;return r.value;}
export function laneForX(d:GameData,x:number):string {const sp=d.nest.spawn;return sp.lanes[Math.min(sp.lanes.length-1,Math.max(0,Math.floor((x-sp.x[0])/(sp.x[1]-sp.x[0])*sp.lanes.length)))];}
export function edgePoint(d:GameData,lane:string):Point {const p=d.bySlot[lane].pos,c=d.nest.center,dx=p[0]-c[0],dy=p[1]-c[1],dist=Math.hypot(dx,dy);return [p[0]+dx/dist*d.nest.spawn.edge,p[1]+dy/dist*d.nest.spawn.edge];}
export function aliveEnemies(b:Battle):Enemy[]{return b.enemies.filter(e=>!e.dead&&!e.leaked);}
function visible(b:Battle,e:Enemy):boolean{return !e.dead&&!e.leaked&&!e.closed;}
function unitAt(b:Battle,lane:string):BattleUnit|undefined{return b.units.find(u=>u.slot===lane&&!u.dash);}
function active(b:Battle,u:BattleUnit):boolean{return u.knockedUntil<=b.time&&u.startledUntil<=b.time;}
function nearest(b:Battle,x:number,y:number,except=new Set<number>(),range=Infinity):Enemy|undefined {return aliveEnemies(b).filter(e=>visible(b,e)&&!except.has(e.id)&&Math.hypot(e.x-x,e.y-y)<=range).sort((a,c)=>Math.hypot(a.x-x,a.y-y)-Math.hypot(c.x-x,c.y-y)||a.id-c.id)[0];}
function target(b:Battle,u?:BattleUnit):Enemy|undefined {const held=u?aliveEnemies(b).filter(e=>e.blockedBy===u.id&&visible(b,e)):[];return (held.length?held:aliveEnemies(b).filter(e=>visible(b,e))).sort((a,c)=>a.distance-c.distance||a.id-c.id)[0];}
export function dashTarget(b:Battle):Enemy|undefined {return aliveEnemies(b).sort((a,c)=>Number(c.boss)-Number(a.boss)||Number(c.elite)-Number(a.elite)||c.hp-a.hp||a.id-c.id)[0];}
function makeUnit(d:GameData,s:Save,id:string,slot:string):BattleUnit {const p=d.bySlot[slot].pos;const stamina=d.stance.block.stamina[s.toys[id].star-1];return {id,slot,x:p[0],y:p[1],attackClock:0,skillClock:0,dashClock:0,stamina,maxStamina:stamina,knockedUntil:0,startledUntil:0,buffUntil:0,dash:null,damage:0,hits:0};}
export function syncBattle(b:Battle,s:Save):void {
 const old=b.units;const opened=openSlots(b.data,s);b.save=s;b.units=[];
 for(let i=0;i<s.lineup.length;i++){const id=s.lineup[i],slot=b.data.nest.slots[i].id;if(!id||!s.toys[id]?.got||!opened.includes(slot))continue;const previous=old.find(x=>x.id===id);const u=previous??makeUnit(b.data,s,id,slot);if(u.slot!==slot){u.slot=slot;u.dash=null;[u.x,u.y]=b.data.bySlot[slot].pos;for(const e of b.enemies)if(e.blockedBy===id)e.blockedBy=null;}const max=b.data.stance.block.stamina[s.toys[id].star-1];u.stamina=Math.min(max,u.stamina+Math.max(0,max-u.maxStamina));u.maxStamina=max;b.units.push(u);}
 for(const e of b.enemies)if(e.blockedBy&&!b.units.some(u=>u.id===e.blockedBy)&&!b.clones.some(c=>c.id===e.blockedBy))e.blockedBy=null;
}
export function startWave(d:GameData,s:Save,opt:{boss?:boolean;attempt:number;carry?:Battle;elapsedBetweenWaves?:number}):Battle {
 const boss=!!opt.boss,seed=battleSeed(s.z,boss?d.wave.perZone:s.w,opt.attempt);
 const b:Battle={data:d,save:s,z:s.z,w:boss?d.wave.perZone:s.w,boss,seed,rng:seed,tick:0,time:0,accumulator:0,thickness:d.wave.thickness,enemies:[],units:[],clones:[],nextEnemyId:1,spawned:0,nextSpawn:0,nextAdds:d.rules.bossAddsEvery,nextBossTrick:s.z===2?d.rules.examEvery:d.rules.wardrobeEvery,flash:{charge:0,until:0,aim:-Math.PI/2,dps:0},captain:{cooldown:0,until:0},sheep:0,creditedSheep:0,creditedKills:0,kills:0,leaks:0,shots:0,totalDamage:0,maxHit:0,blockedSeconds:0,knockdowns:0,dashes:0,recentDamage:[],events:[],outcome:null,lastHits:{}};
 syncBattle(b,s);
 if(opt.carry){const prev=opt.carry;const gap=Number.isFinite(opt.elapsedBetweenWaves)?Math.max(0,opt.elapsedBetweenWaves??0):0;for(const u of b.units){const old=prev.units.find(x=>x.id===u.id);if(old){u.attackClock=old.attackClock+gap;u.skillClock=old.skillClock+gap;u.dashClock=old.dashClock+gap;u.buffUntil=Math.max(0,old.buffUntil-prev.time-gap);}}const remaining=Math.max(0,prev.flash.until-prev.time);b.flash={charge:Math.min(d.flash.charge,prev.flash.charge+Math.max(0,gap-remaining)),until:Math.max(0,remaining-gap),aim:prev.flash.aim,dps:prev.flash.dps};b.recentDamage=prev.recentDamage.map(x=>({time:x.time-prev.time-gap,damage:x.damage})).filter(x=>x.time>=-d.rules.flashDpsWindow);b.captain.cooldown=prev.captain.cooldown+gap;b.captain.until=Math.max(0,prev.captain.until-prev.time-gap);}
 return b;
}
export function spawnEnemy(b:Battle,kind:string,opt:{elite?:boolean;boss?:boolean;x?:number;y?:number;hpMul?:number;hp?:number;lane?:string;child?:boolean;swarm?:boolean}={}):Enemy[] {
 const d=b.data,def=d.byNightmare[kind];if(!def&&!opt.boss)throw new Error('Unknown nightmare '+kind);const zone=d.zones.find(z=>z.id===b.z)!;
 const count=def?.trait.includes('成群')&&!opt.child&&!opt.boss&&!opt.swarm?d.rules.swarmCount:1;const out:Enemy[]=[];
 for(let i=0;i<count;i++){const x=opt.x??(opt.boss?d.nest.center[0]:d.nest.spawn.x[0]+random(b)*(d.nest.spawn.x[1]-d.nest.spawn.x[0]));const y=opt.y??d.nest.spawn.y;const lane=opt.lane??(opt.boss?'O3':laneForX(d,x)),edge=edgePoint(d,lane);const hp=opt.hp??mul(baseHp(d,b.z,opt.boss?d.wave.perZone-1:Math.min(b.w,d.wave.perZone-1)),opt.boss?d.boss.hpMul:(def?.hp??1),opt.elite?d.wave.eliteHp:1,opt.hpMul??1);
  const pathLength=Math.hypot(edge[0]-x,edge[1]-y);const walk=b.z===1?d.rules.corridorWalk:d.boss.walk;
  const e:Enemy={id:b.nextEnemyId++,kind,name:opt.boss?zone.boss:def.name,x,y,spawnX:x,spawnY:y,edgeX:edge[0],edgeY:edge[1],distance:pathLength,pathLength,lane,hp,maxHp:hp,speed:opt.boss?pathLength/walk:d.nest.spawn.speed*def.speed,reward:sheepForHp(d,hp),elite:!!opt.elite,boss:!!opt.boss,dead:false,leaked:false,trait:opt.boss?[]:[...def.trait],child:!!opt.child||count>1,shell:!opt.boss&&def.trait.includes('带壳')?d.rules.shellCount:0,blockedBy:null,burnUntil:0,burnDamage:0,burnSource:'',slowUntil:0,freezeUntil:0,stunUntil:0,flashUntil:0,coldHits:[],stink:[],nextDot:b.time+d.rules.dotInterval,closed:false};b.enemies.push(e);out.push(e);emit(b,'spawn',{enemy:e.id,kind:e.kind,x:e.x,y:e.y,hp:e.hp,lane:e.lane,boss:e.boss,elite:e.elite});}
 return out;
}
function finish(b:Battle,won:boolean):void {if(b.outcome)return;const boss=b.enemies.find(e=>e.boss);b.outcome={z:b.z,w:b.w,boss:b.boss,seed:b.seed,won,clean:won&&b.leaks===0,duration:b.time,sheep:b.sheep,creditedSheep:b.creditedSheep,kills:b.kills,creditedKills:b.creditedKills,leaks:b.leaks,maxHit:b.maxHit,shots:b.shots,damage:b.totalDamage,blockedSeconds:b.blockedSeconds,knockdowns:b.knockdowns,dashes:b.dashes,bossDamage:boss?Math.min(1,Math.max(0,1-boss.hp/boss.maxHp)):0};emit(b,'waveEnd',{result:{...b.outcome}});}
function die(b:Battle,e:Enemy,source:string):void {if(e.dead||e.leaked)return;e.dead=true;e.blockedBy=null;b.kills++;b.sheep=add(b.sheep,e.reward);emit(b,'kill',{enemy:e.id,source,sheep:e.reward,x:e.x,y:e.y});
 if(e.boss){finish(b,true);return;}
 if(e.trait.includes('分裂')&&!e.child){const children:number[]=[];for(let i=0;i<b.data.rules.splitCount;i++)children.push(spawnEnemy(b,e.kind,{x:e.x+(i===0?-6:6),y:e.y,lane:e.lane,hp:mul(e.maxHp,b.data.rules.splitHp),child:true})[0].id);emit(b,'split',{enemy:e.id,children});}
}
function damage(b:Battle,e:Enemy,amount:number,source:string,dot=false,element='枕',crit=false):number {
 if(!visible(b,e)||b.outcome)return 0;let value=clamp(amount);if(!dot&&e.shell>0){e.shell--;value=mul(value,b.data.rules.shellMul);emit(b,'shell',{enemy:e.id,shell:e.shell});}
 const actual=Math.min(e.hp,value);e.hp=Math.max(0,e.hp-value);b.totalDamage=add(b.totalDamage,actual);b.maxHit=Math.max(b.maxHit,value);const u=b.units.find(x=>x.id===source);if(u){u.damage=add(u.damage,actual);if(!dot)u.hits++;}b.recentDamage.push({time:b.time,damage:actual});emit(b,dot?'dot':'hit',{source,target:e.id,damage:value,actual,element,crit});if(e.hp<=0)die(b,e,source);return value;
}
function buff(b:Battle,u:BattleUnit,type:'attack'|'speed'):number {let value=0;for(const v of b.units){if(v.id===u.id||!b.data.bySlot[v.slot].adjacent.includes(u.slot))continue;if(type==='attack'&&v.id==='dingdang')value+=b.data.econ.supportBuff[b.save.toys[v.id].star-1]+(v.buffUntil>b.time?b.data.rules.supportAttack:0);if(type==='speed'&&v.id==='piaopiao')value+=b.data.econ.supportBuff[b.save.toys[v.id].star-1]+(v.buffUntil>b.time?b.data.rules.supportSpeed:0);}if(type==='speed'&&b.captain.until>b.time)value+=b.data.rules.captainSpeed;return value;}
/** Same source list as a real direct hit; shell is last so saturated multiplication stays identical. */
export function battleDamageBreakdown(b:Battle,id:string,targetId?:number,opt:{skillMul?:number;crit?:boolean;element?:string}={}):AttackBreakdown {
 const u=b.units.find(x=>x.id===id);const plain=damageBreakdown(b.data,b.save,id,u?.slot);const e=targetId===undefined?target(b,u):b.enemies.find(x=>x.id===targetId&&!x.dead&&!x.leaked);const r=b.data.rules;
 const element=opt.element??b.data.byToy[id]?.el;const skillMul=opt.skillMul??1,crit=opt.crit??false;
 const parts=u?plain.parts.filter(x=>x.name!=='邻位攻击辅助'):[...plain.parts];
 if(u)parts.push({name:'邻位攻击辅助（含叮当响）',mul:1+buff(b,u,'attack')});
 parts.push({name:'技能倍率',mul:skillMul},{name:crit?'暴击':'非暴击',mul:crit?r.critMul:1});
 if(e){parts.push({name:'冻住易伤',mul:e.freezeUntil>b.time?r.freezeVulnerability:1},{name:'手电易伤',mul:e.flashUntil>b.time?1+b.data.flash.vuln:1},{name:'暖打烘着',mul:element==='暖'&&e.burnUntil>b.time?r.warmVulnerability:1});if(e.closed)parts.push({name:'关门免疫',mul:0});}
 const rawTotal=mul(...parts.map(x=>x.mul));if(e?.shell)parts.push({name:'带壳减伤',mul:r.shellMul});
 return {parts,total:mul(...parts.map(x=>x.mul)),rawTotal,targetId:e?.id??null,targetName:e?.name??null,note:u?(e?'当前目标、当前状态的一次命中预估。':'当前无目标，未加入目标状态。'):'未上场，仅显示常驻数值。',time:b.time,mode:'current',crit,skillMul};
}
export function lastDamageBreakdown(b:Battle,id:string):AttackBreakdown {return b.lastHits[id]??battleDamageBreakdown(b,id);}

function hit(b:Battle,u:BattleUnit,e:Enemy,skillMul=1,opt:{element?:string;burnMul?:number;stink?:number;proc?:boolean}={}):number {
 const r=b.data.rules,element=opt.element??b.data.byToy[u.id].el;const crit=r.critChance>0&&random(b)<r.critChance;const breakdown=battleDamageBreakdown(b,u.id,e.id,{skillMul,crit,element});
 const dealt=damage(b,e,breakdown.rawTotal,u.id,false,element,crit);if(dealt>0)b.lastHits[u.id]={...breakdown,total:dealt,mode:'last-hit',note:'最近一次真实直接命中的结算快照，含当时技能、暴击及目标状态。'};if(dealt===0||e.dead||opt.proc===false)return dealt;
 if(element==='暖'){const fresh=e.burnUntil<=b.time;e.burnDamage=Math.max(fresh?0:e.burnDamage,mul(dealt,r.burnRate,opt.burnMul??1));e.burnUntil=b.time+r.burnDuration;e.burnSource=u.id;if(fresh&&!e.stink.length)e.nextDot=b.time+r.dotInterval;emit(b,'burn',{enemy:e.id,until:e.burnUntil,damage:e.burnDamage});}
 else if(element==='凉'){e.slowUntil=b.time+r.slowDuration;e.coldHits=e.coldHits.filter(t=>b.time-t<=r.slowDuration+EPS);e.coldHits.push(b.time);emit(b,'slow',{enemy:e.id,until:e.slowUntil});if(e.coldHits.length>=r.freezeHits){e.freezeUntil=Math.max(e.freezeUntil,b.time+r.freezeDuration);e.coldHits=[];emit(b,'freeze',{enemy:e.id,until:e.freezeUntil});}}
 else if(element==='臭'){const fresh=!e.stink.length&&e.burnUntil<=b.time;for(let i=0;i<(opt.stink??1)&&e.stink.length<r.stinkMax;i++)e.stink.push({damage:mul(dealt,r.stinkRate),source:u.id});if(fresh)e.nextDot=b.time+r.dotInterval;emit(b,'stink',{enemy:e.id,layers:e.stink.length});}
 return dealt;
}
function chain(b:Battle,u:BattleUnit,e:Enemy,count:number):void {let current:Enemy|undefined=e;let scale=1;const visited=new Set<number>();for(let i=0;i<count&&current;i++){visited.add(current.id);hit(b,u,current,scale);const from=current;current=nearest(b,from.x,from.y,visited,b.data.rules.chainRange);if(current&&i+1<count)emit(b,'chain',{source:u.id,from:from.id,to:current.id,jump:i+1});scale*=b.data.rules.chainMul;}}
function attack(b:Battle,u:BattleUnit,e:Enemy):void {b.shots++;emit(b,'attack',{source:u.id,target:e.id,element:b.data.byToy[u.id].el,from:[u.x,u.y]});const el=b.data.byToy[u.id].el;if(el==='电')chain(b,u,e,3);else if(u.id==='huhu'||u.id==='abing'){const group=aliveEnemies(b).filter(x=>visible(b,x)&&x.id!==e.id&&Math.hypot(x.x-e.x,x.y-e.y)<=b.data.rules.splashRange).sort((a,c)=>Math.hypot(a.x-e.x,a.y-e.y)-Math.hypot(c.x-e.x,c.y-e.y)||a.id-c.id).slice(0,b.data.rules.splashCount-1);hit(b,u,e);for(const other of group)hit(b,u,other);}else hit(b,u,e);}
function skill(b:Battle,u:BattleUnit,e:Enemy):void {
 const d=b.data,r=d.rules;emit(b,'skill',{source:u.id,target:e.id});
 if(u.id==='fangfang'){u.stamina=Math.min(u.maxStamina,u.stamina+u.maxStamina/2);hit(b,u,e,r.fangfangMul);}
 else if(u.id==='huhu'){for(const other of aliveEnemies(b).filter(x=>Math.hypot(x.x-e.x,x.y-e.y)<=r.chainRange))hit(b,u,other,1,{burnMul:r.huhuBurnMul});}
 else if(u.id==='gaga'){const [cx,cy]=d.nest.center,dx=e.x-cx,dy=e.y-cy,len=Math.hypot(dx,dy);for(const other of aliveEnemies(b)){const along=((other.x-cx)*dx+(other.y-cy)*dy)/len,across=Math.abs((other.x-cx)*dy-(other.y-cy)*dx)/len;if(along>=0&&across<=r.waterWidth/2){hit(b,u,other);if(!other.dead){let vx=other.x-other.edgeX,vy=other.y-other.edgeY;let L=Math.hypot(vx,vy);if(L<=EPS){vx=other.spawnX-other.edgeX;vy=other.spawnY-other.edgeY;L=Math.hypot(vx,vy);}if(L<=EPS){vx=0;vy=-1;L=1;}other.x+=vx/L*r.pushDistance;other.y+=vy/L*r.pushDistance;other.distance=Math.hypot(other.x-other.edgeX,other.y-other.edgeY);other.blockedBy=null;emit(b,'push',{enemy:other.id,distance:r.pushDistance});}}}}
 else if(u.id==='dingdang'||u.id==='piaopiao'){u.buffUntil=b.time+r.supportDuration;emit(b,'support',{source:u.id,until:u.buffUntil,slots:d.bySlot[u.slot].adjacent});}
 else if(u.id==='kaka')chain(b,u,e,6);
 else if(u.id==='ruanruan'){const candidates=aliveEnemies(b).filter(x=>!x.boss&&!x.blockedBy).sort((a,c)=>a.distance-c.distance||a.id-c.id);for(let i=0;i<r.cloneCount;i++){const t=candidates[i];const id=`clone-${b.tick}-${i}`;const x=t?.x??u.x+(i?30:-30),y=t?.y??u.y-60;b.clones.push({id,source:u.id,x,y,target:t?.id??null,stamina:d.stance.clone.stamina,until:b.time+r.cloneDuration,nextAttack:b.time+r.cloneAttackInterval});if(t)t.blockedBy=id;emit(b,'clone',{source:u.id,id,x,y,target:t?.id});}}
 else if(u.id==='laowa'){for(const other of aliveEnemies(b).filter(x=>Math.hypot(x.x-e.x,x.y-e.y)<=r.chainRange))hit(b,u,other,1,{stink:3});}
 else if(u.id==='abing'){for(const other of aliveEnemies(b)){if(!visible(b,other))continue;other.freezeUntil=Math.max(other.freezeUntil,b.time+r.abingFreeze);emit(b,'freeze',{enemy:other.id,until:other.freezeUntil});}}
}
function leak(b:Battle,e:Enemy):void {if(e.dead||e.leaked||b.outcome)return;e.leaked=true;e.blockedBy=null;b.leaks++;const loss=e.boss?b.thickness:e.elite?2:1;b.thickness=Math.max(0,b.thickness-loss);emit(b,'leak',{enemy:e.id,lane:e.lane,layers:loss,thickness:b.thickness});if(b.thickness===0)finish(b,false);}
function arrive(b:Battle,e:Enemy):void {
 if(e.boss){leak(b,e);return;}const u=unitAt(b,e.lane);if(u&&b.data.byToy[u.id].stance==='挡'&&active(b,u)&&aliveEnemies(b).filter(x=>x.blockedBy===u.id).length<b.data.stance.block.hold){e.blockedBy=u.id;emit(b,'block',{source:u.id,enemy:e.id});return;}
 if(u&&b.data.byToy[u.id].stance!=='挡'||u&&u.knockedUntil>b.time){u!.startledUntil=Math.max(u!.startledUntil,b.time+b.data.stance.startle);emit(b,'startle',{source:u!.id,until:u!.startledUntil});}leak(b,e);
}
export function flashContains(b:Battle,e:Enemy,aim=b.flash.aim):boolean {const [cx,cy]=b.data.nest.center,dx=e.x-cx,dy=e.y-cy;const angle=Math.atan2(dy,dx),diff=Math.atan2(Math.sin(angle-aim),Math.cos(angle-aim));const half=Math.atan2(b.data.rules.flashWidth/2,cy-b.data.nest.spawn.y);return Math.abs(diff)<=half&&Math.hypot(dx,dy)<=Math.hypot(b.data.nest.spawn.x[1]-cx,cy-b.data.nest.spawn.y)+EPS;}
export function bestFlashAim(b:Battle):number {const [cx,cy]=b.data.nest.center;const close=aliveEnemies(b).filter(e=>e.distance<=b.data.rules.flashAutoRange);const candidates=close.length?close:aliveEnemies(b);let aim=-Math.PI/2,best=-1;for(const e of candidates){const a=Math.atan2(e.y-cy,e.x-cx),score=candidates.filter(x=>flashContains(b,x,a)).length;if(score>best){best=score;aim=a;}}return aim;}
function fireFlash(b:Battle,aim:number):void {const d=b.data;b.flash.charge=0;b.flash.until=b.time+d.flash.beam;b.flash.aim=aim;const window=d.rules.flashDpsWindow;b.flash.dps=mul(b.recentDamage.filter(x=>x.time>=b.time-window).reduce((n,x)=>add(n,x.damage),0)/window,d.flash.beamMul);emit(b,'flashStart',{aim,until:b.flash.until,dps:b.flash.dps});}
function updateDash(b:Battle,u:BattleUnit,dt:number):void {
 const dash=u.dash!;const d=b.data;if(!active(b,u))return;
 const home=()=>{dash.phase='back';dash.elapsed=0;dash.from=[u.x,u.y];dash.to=d.bySlot[u.slot].pos;};
 let victim=b.enemies.find(e=>e.id===dash.target&&!e.dead&&!e.leaked);
 if(dash.phase!=='back'&&!victim){
  victim=aliveEnemies(b).sort((a,c)=>Math.hypot(a.x-u.x,a.y-u.y)-Math.hypot(c.x-u.x,c.y-u.y)||a.id-c.id)[0];
  if(victim){dash.target=victim.id;dash.phase='out';dash.elapsed=0;dash.from=[u.x,u.y];dash.to=[victim.x,victim.y];emit(b,'dashRetarget',{source:u.id,target:victim.id,from:[u.x,u.y],to:dash.to});}
  else home();
 }
 dash.elapsed+=dt;
 if(dash.phase==='out'||dash.phase==='back'){
  // The destination follows a living moving target. Replacements start a fresh,
  // visible one-second approach from the current position; never hit at range.
  if(dash.phase==='out'&&victim)dash.to=[victim.x,victim.y];
  const progress=Math.min(1,dash.elapsed/d.stance.dash.travel);u.x=dash.from[0]+(dash.to[0]-dash.from[0])*progress;u.y=dash.from[1]+(dash.to[1]-dash.from[1])*progress;
  const collision=aliveEnemies(b).find(e=>!e.boss&&e.id!==dash.target&&!dash.collisions.includes(e.id)&&Math.hypot(e.x-u.x,e.y-u.y)<d.rules.dashCollisionRadius);if(collision){dash.collisions.push(collision.id);u.startledUntil=b.time+d.stance.startle;emit(b,'startle',{source:u.id,until:u.startledUntil});return;}
  if(progress>=1){if(dash.phase==='back'){u.dash=null;emit(b,'dashEnd',{source:u.id});return;}dash.phase='hits';dash.elapsed=0;dash.nextHit=0;}
 }
 if(dash.phase==='hits'&&victim){u.x=victim.x;u.y=victim.y;if(dash.elapsed+EPS>=dash.nextHit){hit(b,u,victim,d.stance.dash.hitMul);emit(b,'dashHit',{source:u.id,target:victim.id,index:dash.hits+1,from:[u.x,u.y],at:[victim.x,victim.y]});dash.hits++;dash.nextHit+=d.rules.dashHitGap;if(dash.hits>=d.stance.dash.hits)home();}}
}
function tick(b:Battle,input:{flash?:{aim:number}}):void {
 const d=b.data,r=d.rules,dt=r.tick;b.tick++;b.time=b.tick*dt;
 b.recentDamage=b.recentDamage.filter(x=>x.time>=b.time-r.flashDpsWindow);
 if(!b.boss){while(b.spawned<d.wave.count&&b.time+EPS>=b.nextSpawn){const zone=d.zones.find(z=>z.id===b.z)!;const elite=b.spawned===0&&b.w%d.wave.eliteEvery===0;const kind=elite?zone.elite:zone.nightmares[Math.floor(random(b)*zone.nightmares.length)];spawnEnemy(b,kind,{elite});b.spawned++;b.nextSpawn+=d.wave.spawnGap;}}
 else {if(b.spawned===0){spawnEnemy(b,'boss',{boss:true});b.spawned=1;}const zone=d.zones.find(z=>z.id===b.z)!;if(b.time+EPS>=b.nextAdds){for(let i=0;i<r.bossAddsCount;i++)spawnEnemy(b,zone.nightmares[Math.floor(random(b)*zone.nightmares.length)],{hpMul:r.bossAddsHp*(b.z===1?r.corridorAddsMul:1)});b.nextAdds+=r.bossAddsEvery;}
  const boss=b.enemies.find(e=>e.boss)!;if(b.z===0){const phase=b.time%r.wardrobeEvery;const closed=b.time>=r.wardrobeEvery&&phase<r.wardrobeDuration&&boss.flashUntil<=b.time;if(closed!==boss.closed){boss.closed=closed;emit(b,'bossTrick',{trick:closed?'close':'open',enemy:boss.id});}}else if(b.z===2&&b.time+EPS>=b.nextBossTrick){spawnEnemy(b,'notebook');b.nextBossTrick+=r.examEvery;emit(b,'bossTrick',{trick:'homework',enemy:boss.id});}}
 if(b.flash.until>0&&b.flash.until<=b.time+EPS){b.flash.until=0;emit(b,'flashEnd');}
 if(b.flash.until===0)b.flash.charge=Math.min(d.flash.charge,b.flash.charge+dt);
 if(b.flash.charge+EPS>=d.flash.charge&&aliveEnemies(b).length){if(input.flash&&Number.isFinite(input.flash.aim))fireFlash(b,input.flash.aim);else if(b.save.autoFlash)fireFlash(b,bestFlashAim(b));}
 if(b.flash.until>b.time){if(input.flash&&Number.isFinite(input.flash.aim))b.flash.aim=input.flash.aim;for(const e of aliveEnemies(b)){if(flashContains(b,e)){if(e.flashUntil<=b.time)e.stunUntil=Math.max(e.stunUntil,b.time+d.flash.stun);e.flashUntil=b.time+dt*2;e.closed=false;damage(b,e,mul(b.flash.dps,dt),'flash',true,'光');}}}
 if(b.outcome)return;
 b.captain.cooldown+=dt;if(b.captain.cooldown+EPS>=r.captainCooldown&&aliveEnemies(b).length){b.captain.cooldown=0;b.captain.until=b.time+r.captainDuration;emit(b,'captain',{until:b.captain.until});}
 for(const u of b.units){if(u.knockedUntil>0&&u.knockedUntil<=b.time){u.knockedUntil=0;u.stamina=u.maxStamina;emit(b,'recover',{source:u.id});}u.skillClock+=dt;u.dashClock+=dt;if(u.dash){updateDash(b,u,dt);continue;}if(!active(b,u))continue;u.attackClock+=dt;const e=target(b,u);if(!e)continue;
  if(d.byToy[u.id].stance==='冲'&&u.dashClock+EPS>=d.stance.dash.cd){const t=dashTarget(b)!;u.dashClock=0;u.dash={phase:'out',elapsed:0,from:[u.x,u.y],to:[t.x,t.y],target:t.id,hits:0,nextHit:0,collisions:[]};b.dashes++;emit(b,'dashStart',{source:u.id,target:t.id,from:[u.x,u.y],to:[t.x,t.y]});continue;}
  if(u.skillClock+EPS>=(r.skillCooldown[u.id]??Infinity)){u.skillClock=0;skill(b,u,e);if(b.outcome)return;}
  const itv=d.byToy[u.id].itv/(1+buff(b,u,'speed'));if(u.attackClock+EPS>=itv){u.attackClock=Math.max(0,Math.min(itv,u.attackClock-itv));const current=target(b,u);if(current)attack(b,u,current);}if(b.outcome)return;
 }
 for(const c of b.clones){const u=b.units.find(x=>x.id===c.source);let e=b.enemies.find(x=>x.id===c.target&&!x.dead&&!x.leaked);if(!e||e.blockedBy!==c.id){e=aliveEnemies(b).filter(x=>!x.boss&&!x.blockedBy&&visible(b,x)&&Math.hypot(x.x-c.x,x.y-c.y)<=r.cloneBlockRadius).sort((a,v)=>Math.hypot(a.x-c.x,a.y-c.y)-Math.hypot(v.x-c.x,v.y-c.y)||a.id-v.id)[0];c.target=e?.id??null;if(e)e.blockedBy=c.id;}
  if(e&&e.blockedBy===c.id){c.stamina-=dt;b.blockedSeconds+=dt;if(c.nextAttack<=b.time+EPS&&u){c.nextAttack+=r.cloneAttackInterval;hit(b,u,e,r.cloneAttackMul,{element:'枕',proc:false});}}
  if(c.until<=b.time||c.stamina<=0||!u){if(e?.blockedBy===c.id)e.blockedBy=null;c.until=0;emit(b,'cloneEnd',{id:c.id});}}
 b.clones=b.clones.filter(c=>c.until>0);if(b.outcome)return;
 for(const e of [...aliveEnemies(b)]){if((e.burnUntil>0||e.stink.length)&&e.nextDot<=b.time+EPS){e.nextDot+=r.dotInterval;if(e.burnUntil+EPS>=b.time)damage(b,e,mul(e.burnDamage,r.dotInterval),e.burnSource,true,'暖');for(const st of e.stink){if(e.dead||b.outcome)break;damage(b,e,mul(st.damage,r.dotInterval),st.source,true,'臭');}}
  if(e.dead||b.outcome)continue;if(e.blockedBy){const u=b.units.find(x=>x.id===e.blockedBy);if(u){b.blockedSeconds+=dt;u.stamina-=dt*(e.elite?d.stance.block.drainElite:d.stance.block.drainNormal);if(u.stamina<=EPS){u.stamina=0;u.knockedUntil=b.time+d.stance.block.knocked;b.knockdowns++;emit(b,'knockdown',{source:u.id,until:u.knockedUntil});for(const held of aliveEnemies(b).filter(x=>x.blockedBy===u.id))leak(b,held);}}continue;}
  let speed=e.speed;if(e.freezeUntil>b.time||e.stunUntil>b.time||e.flashUntil>b.time)speed=0;else {if(e.slowUntil>b.time)speed*=r.slowMul;for(const id of new Set(b.save.devices)){const slow=id?d.byDevice[id]?.effect.slow:0;if(slow)speed*=1-slow;}}
  const distance=Math.hypot(e.edgeX-e.x,e.edgeY-e.y),travel=Math.min(distance,speed*dt);if(distance>EPS){e.x+=(e.edgeX-e.x)/distance*travel;e.y+=(e.edgeY-e.y)/distance*travel;}e.distance=Math.max(0,distance-travel);if(e.distance<=EPS)arrive(b,e);if(b.outcome)return;
 }
 if(!b.boss&&b.spawned===d.wave.count&&!aliveEnemies(b).length)finish(b,true);
}
export function step(b:Battle,dt:number,input:{flash?:{aim:number}}={}):BattleEvent[] {
 b.events=[];if(b.outcome||!Number.isFinite(dt)||dt<=0)return [];b.accumulator+=dt;while(b.accumulator+EPS>=b.data.rules.tick&&!b.outcome){b.accumulator-=b.data.rules.tick;tick(b,input);}return [...b.events];
}
export function result(b:Battle):WaveResult|null{return b.outcome?{...b.outcome,creditedSheep:b.creditedSheep,creditedKills:b.creditedKills}:null;}
export function battleCsv(rows:WaveResult[]):string {const keys=['z','w','seed','shots','damage','duration','leaks','blockedSeconds','knockdowns','dashes','won','sheep'] as const;return [...keys,'avgDps'].join(',')+'\n'+rows.map(r=>[...keys.map(k=>r[k]),r.duration>0?r.damage/r.duration:0].join(',')).join('\n');}
