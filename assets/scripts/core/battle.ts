import { add, clamp, mul } from './big.ts';
import { baseHp, sheepForHp } from './data.ts';
import { damageBreakdown, slotsOf, copySave } from './economy.ts';
import { clampHome, distance } from './ground.ts';
import { battleSeed, nextRandom } from './rng.ts';
import type { AttackBreakdown, Battle, BattleEvent, BattleUnit, Enemy, GameData, Point, Save, WaveResult, AttackSnapshot, PendingStrike, Projectile, BattleInput, ToyView, NmView, ShotView } from './types.ts';
const EPS=1e-8;
function emit(b:Battle,type:string,detail:Record<string,unknown>={}):void {b.events.push({type,time:b.time,...detail});}
function random(b:Battle):number {const r=nextRandom(b.rng);b.rng=r.state;return r.value;}
/** Intersection of the center ray with the pillow wall. There are no lanes. */
export function wallPoint(d:GameData,x:number,y:number,inset=0):Point {
 const [cx,cy]=d.nest.center,dx=x-cx,dy=y-cy,length=Math.hypot(dx,dy)||1;
 return [cx+dx/length*(d.nest.wall-inset),cy+dy/length*(d.nest.wall-inset)];
}
export function aliveEnemies(b:Battle):Enemy[]{return b.enemies.filter(e=>!e.dead&&!e.leaked);}
function visible(b:Battle,e:Enemy):boolean{return !e.dead&&!e.leaked&&!e.closed;}
function active(b:Battle,u:BattleUnit):boolean{return u.knockedUntil<=b.time&&u.startledUntil<=b.time;}
function centerDistance(b:Battle,e:Enemy):number{return Math.hypot(e.x-b.data.nest.center[0],e.y-b.data.nest.center[1]);}
function nearest(b:Battle,x:number,y:number,except=new Set<number>(),range=Infinity):Enemy|undefined {
 return aliveEnemies(b).filter(e=>visible(b,e)&&!except.has(e.id)&&Math.hypot(e.x-x,e.y-y)<=range+EPS).sort((a,c)=>Math.hypot(a.x-x,a.y-y)-Math.hypot(c.x-x,c.y-y)||a.id-c.id)[0];
}
function threat(b:Battle):Enemy|undefined{return aliveEnemies(b).filter(e=>visible(b,e)).sort((a,c)=>centerDistance(b,a)-centerDistance(b,c)||a.id-c.id)[0];}
function target(b:Battle,u?:BattleUnit):Enemy|undefined {
 if(!u)return threat(b);const reach=b.data.byToy[u.id].reach;
 const held=aliveEnemies(b).filter(e=>e.blockedBy===u.id&&visible(b,e)&&Math.hypot(e.x-u.x,e.y-u.y)<=reach+EPS);
 return (held.length?held:aliveEnemies(b).filter(e=>visible(b,e)&&Math.hypot(e.x-u.x,e.y-u.y)<=reach+EPS)).sort((a,c)=>centerDistance(b,a)-centerDistance(b,c)||a.id-c.id)[0];
}
export function dashTarget(b:Battle):Enemy|undefined {
 return aliveEnemies(b).sort((a,c)=>Number(c.boss)-Number(a.boss)||Number(c.elite)-Number(a.elite)||centerDistance(b,a)-centerDistance(b,c)||a.id-c.id)[0];
}
function releaseClaims(b:Battle,id:string):void {
 for(const e of b.enemies){if(e.claimedBy===id)e.claimedBy=null;if(e.blockedBy===id){e.blockedBy=null;e.state='walk';}}
}
function setHome(b:Battle,u:BattleUnit,p:Point):void {
 const home=clampHome(b.data,p);if(home[0]===u.home[0]&&home[1]===u.home[1])return;
 u.home=home;u.wanderGoal=null;u.relocating=b.data.stance.range[b.data.byToy[u.id].range].leash>0&&distance([u.x,u.y],home)>EPS;releaseClaims(b,u.id);
 if(b.data.stance.range[b.data.byToy[u.id].range].leash===0){[u.x,u.y]=home;u.vx=0;u.vy=0;}
}
function makeUnit(d:GameData,s:Save,id:string,p:Point):BattleUnit {
 const home=clampHome(d,p),stamina=d.stance.block.stamina[s.toys[id].star-1];
 return {id,home,x:home[0],y:home[1],vx:0,vy:0,state:'idle',face:'front',flip:false,target:null,wanderAt:0,wanderGoal:null,relocating:false,attackClock:0,skillClock:0,dashClock:0,stamina,maxStamina:stamina,knockedUntil:0,startledUntil:0,buffUntil:0,dash:null,damage:0,hits:0};
}
export function syncBattle(b:Battle,s:Save):void {
 const old=b.units;b.save=copySave(s);b.units=[];const cap=slotsOf(b.data,s.fort).toy;
 for(const entry of s.lineup.slice(0,cap)){
  const {id,home}=entry;if(!s.toys[id]?.got||!b.data.byToy[id]||b.units.some(u=>u.id===id))continue;
  const u=old.find(x=>x.id===id)??makeUnit(b.data,s,id,home);setHome(b,u,home);
  const max=b.data.stance.block.stamina[s.toys[id].star-1];u.stamina=Math.min(max,u.stamina+Math.max(0,max-u.maxStamina));u.maxStamina=max;b.units.push(u);
 }
 for(const u of old)if(!b.units.some(v=>v.id===u.id))releaseClaims(b,u.id);
 b.pending=b.pending.filter(p=>b.units.some(u=>u.id===p.source));
}
export function startWave(d:GameData,s:Save,opt:{boss?:boolean;attempt:number;carry?:Battle;elapsedBetweenWaves?:number}):Battle {
 const boss=!!opt.boss,seed=battleSeed(s.z,boss?d.wave.perZone:s.w,opt.attempt);
 const b:Battle={data:d,save:s,z:s.z,w:boss?d.wave.perZone:s.w,boss,seed,rng:seed,tick:0,time:0,accumulator:0,thickness:d.wave.thickness,enemies:[],units:[],clones:[],pending:[],projectiles:[],projectilePool:[],nextProjectileId:1,firstHitSeconds:[],inputLog:[],queuedHomes:{},nextEnemyId:1,spawned:0,nextSpawn:0,nextAdds:d.rules.bossAddsEvery,nextBossTrick:s.z===2?d.rules.examEvery:d.rules.wardrobeEvery,flash:{charge:0,until:0,aim:-Math.PI/2,dps:0},captain:{cooldown:0,until:0},sheep:0,creditedSheep:0,creditedKills:0,kills:0,leaks:0,shots:0,totalDamage:0,maxHit:0,blockedSeconds:0,knockdowns:0,dashes:0,recentDamage:[],events:[],outcome:null,lastHits:{}};
 syncBattle(b,s);
 if(opt.carry){const prev=opt.carry;const gap=Number.isFinite(opt.elapsedBetweenWaves)?Math.max(0,opt.elapsedBetweenWaves??0):0;for(const u of b.units){const old=prev.units.find(x=>x.id===u.id);if(old){u.attackClock=old.attackClock+gap;u.skillClock=old.skillClock+gap;u.dashClock=old.dashClock+gap;u.buffUntil=Math.max(0,old.buffUntil-prev.time-gap);}}const remaining=Math.max(0,prev.flash.until-prev.time);b.flash={charge:Math.min(d.flash.charge,prev.flash.charge+Math.max(0,gap-remaining)),until:Math.max(0,remaining-gap),aim:prev.flash.aim,dps:prev.flash.dps};b.recentDamage=prev.recentDamage.map(x=>({time:x.time-prev.time-gap,damage:x.damage})).filter(x=>x.time>=-d.rules.flashDpsWindow);b.captain.cooldown=prev.captain.cooldown+gap;b.captain.until=Math.max(0,prev.captain.until-prev.time-gap);}
 return b;
}
export function spawnEnemy(b:Battle,kind:string,opt:{elite?:boolean;boss?:boolean;x?:number;y?:number;hpMul?:number;hp?:number;child?:boolean;swarm?:boolean}={}):Enemy[] {
 const d=b.data,def=d.byNightmare[kind];if(!def&&!opt.boss)throw new Error('Unknown nightmare '+kind);const zone=d.zones.find(z=>z.id===b.z)!;
 const count=def?.trait.includes('成群')&&!opt.child&&!opt.boss&&!opt.swarm?d.rules.swarmCount:1,out:Enemy[]=[];
 for(let i=0;i<count;i++){
  const x=opt.x??(opt.boss?d.nest.center[0]:d.nest.spawn.x[0]+random(b)*(d.nest.spawn.x[1]-d.nest.spawn.x[0])),y=opt.y??d.nest.spawn.y;
  const edge=wallPoint(d,x,y),hp=opt.hp??mul(baseHp(d,b.z,opt.boss?d.wave.perZone-1:Math.min(b.w,d.wave.perZone-1)),opt.boss?d.boss.hpMul:(def?.hp??1),opt.elite?d.wave.eliteHp:1,opt.hpMul??1);
  const pathLength=Math.max(0,Math.hypot(x-d.nest.center[0],y-d.nest.center[1])-d.nest.wall),walk=b.z===1?d.rules.corridorWalk:d.boss.walk;
  const e:Enemy={id:b.nextEnemyId++,kind,name:opt.boss?zone.boss:def.name,x,y,spawnX:x,spawnY:y,edgeX:edge[0],edgeY:edge[1],distance:pathLength,pathLength,hp,maxHp:hp,speed:opt.boss?pathLength/walk:d.nest.spawn.speed*def.speed,reward:sheepForHp(d,hp),elite:!!opt.elite,boss:!!opt.boss,dead:false,leaked:false,trait:opt.boss?[]:[...def.trait],child:!!opt.child||count>1,shell:!opt.boss&&def.trait.includes('带壳')?d.rules.shellCount:0,claimedBy:null,blockedBy:null,state:'walk',squeezeUntil:0,firstHitAt:null,burnUntil:0,burnDamage:0,burnSource:'',slowUntil:0,freezeUntil:0,stunUntil:0,flashUntil:0,coldHits:[],stink:[],nextDot:b.time+d.rules.dotInterval,closed:false};
  b.enemies.push(e);out.push(e);emit(b,'spawn',{enemy:e.id,kind:e.kind,x:e.x,y:e.y,hp:e.hp,boss:e.boss,elite:e.elite});
 }
 return out;
}
function finish(b:Battle,won:boolean):void {if(b.outcome)return;const boss=b.enemies.find(e=>e.boss);b.outcome={z:b.z,w:b.w,boss:b.boss,seed:b.seed,won,clean:won&&b.leaks===0,duration:b.time,sheep:b.sheep,creditedSheep:b.creditedSheep,kills:b.kills,creditedKills:b.creditedKills,leaks:b.leaks,maxHit:b.maxHit,shots:b.shots,damage:b.totalDamage,blockedSeconds:b.blockedSeconds,knockdowns:b.knockdowns,dashes:b.dashes,firstHitWallSeconds:b.firstHitSeconds.length?b.firstHitSeconds.reduce((sum,n)=>sum+n,0)/b.firstHitSeconds.length:0,bossDamage:boss?Math.min(1,Math.max(0,1-boss.hp/boss.maxHp)):0};emit(b,'waveEnd',{result:{...b.outcome}});}
function die(b:Battle,e:Enemy,source:string):void {if(e.dead||e.leaked)return;e.dead=true;e.blockedBy=null;e.claimedBy=null;e.state='dead';b.kills++;b.sheep=add(b.sheep,e.reward);emit(b,'kill',{enemy:e.id,source,sheep:e.reward,x:e.x,y:e.y});
 if(e.boss){finish(b,true);return;}
 if(e.trait.includes('分裂')&&!e.child){const children:number[]=[];for(let i=0;i<b.data.rules.splitCount;i++)children.push(spawnEnemy(b,e.kind,{x:e.x+(i===0?-6:6),y:e.y,hp:mul(e.maxHp,b.data.rules.splitHp),child:true})[0].id);emit(b,'split',{enemy:e.id,children});}
}
function damage(b:Battle,e:Enemy,amount:number,source:string,dot=false,element='枕',crit=false):number {
 if(!visible(b,e)||b.outcome)return 0;let value=clamp(amount);if(!dot&&e.shell>0){e.shell--;value=mul(value,b.data.rules.shellMul);emit(b,'shell',{enemy:e.id,shell:e.shell});}
 const actual=Math.min(e.hp,value);e.hp=Math.max(0,e.hp-value);b.totalDamage=add(b.totalDamage,actual);b.maxHit=Math.max(b.maxHit,value);const u=b.units.find(x=>x.id===source);if(u){u.damage=add(u.damage,actual);if(!dot)u.hits++;}b.recentDamage.push({time:b.time,damage:actual});if(actual>0&&e.firstHitAt===null){e.firstHitAt=b.time;b.firstHitSeconds.push(e.speed>0?e.distance/e.speed:0);}emit(b,dot?'dot':'hit',{source,target:e.id,damage:value,actual,element,crit,x:e.x,y:e.y,at:[e.x,e.y]});if(e.hp<=0)die(b,e,source);return value;
}
function buff(b:Battle,u:BattleUnit,type:'attack'|'speed'):number {
 let value=0;
 for(const v of b.units){if(v.id===u.id)continue;const def=b.data.byToy[v.id],radius=def.aura??b.data.stance.aura.radius;
  if(def.stance!=='帮'||Math.hypot(v.x-u.x,v.y-u.y)>radius+EPS)continue;
  if(type==='attack'&&v.id==='dingdang')value+=b.data.econ.supportBuff[b.save.toys[v.id].star-1]+(v.buffUntil>b.time?b.data.rules.supportAttack:0);
  if(type==='speed'&&v.id==='piaopiao')value+=b.data.econ.supportBuff[b.save.toys[v.id].star-1]+(v.buffUntil>b.time?b.data.rules.supportSpeed:0);
 }
 if(type==='speed'&&b.captain.until>b.time)value+=b.data.rules.captainSpeed;return value;
}
function attackSnapshot(b:Battle,u:Pick<BattleUnit,'id'>):AttackSnapshot {
 const plain=damageBreakdown(b.data,b.save,u.id);
 const parts=plain.parts.filter(p=>!p.name.includes('辅助')||p.name.includes('自身')).map(p=>({...p}));
 const source=b.units.find(v=>v.id===u.id);parts.push({name:'光环攻击辅助（出手时）',mul:1+(source?buff(b,source,'attack'):0)});
 return {parts,element:b.data.byToy[u.id].el};
}
function breakdownFor(b:Battle,id:string,e:Enemy|undefined,snapshot:AttackSnapshot,skillMul:number,crit:boolean,element:string):AttackBreakdown {
 const r=b.data.rules,parts=snapshot.parts.map(p=>({...p}));
 parts.push({name:'技能倍率',mul:skillMul},{name:crit?'暴击':'非暴击',mul:crit?r.critMul:1});
 if(e){parts.push({name:'冻住易伤',mul:e.freezeUntil>b.time?r.freezeVulnerability:1},{name:'手电易伤',mul:e.flashUntil>b.time?1+b.data.flash.vuln:1},{name:'暖打烘着',mul:element==='暖'&&e.burnUntil>b.time?r.warmVulnerability:1});if(e.closed)parts.push({name:'关门免疫',mul:0});}
 const rawTotal=mul(...parts.map(p=>p.mul));if(e?.shell)parts.push({name:'带壳减伤',mul:r.shellMul});
 return {parts,total:mul(...parts.map(p=>p.mul)),rawTotal,targetId:e?.id??null,targetName:e?.name??null,note:e?'攻击来源按出手快照，目标状态按命中时结算。':'当前无目标，未加入目标状态。',time:b.time,mode:'current',crit,skillMul};
}
export function battleDamageBreakdown(b:Battle,id:string,targetId?:number,opt:{skillMul?:number;crit?:boolean;element?:string}={}):AttackBreakdown {
 const u=b.units.find(x=>x.id===id),plain=damageBreakdown(b.data,b.save,id),e=targetId===undefined?target(b,u):b.enemies.find(x=>x.id===targetId&&!x.dead&&!x.leaked);
 const snapshot=u?attackSnapshot(b,u):{parts:plain.parts,element:b.data.byToy[id]?.el??'枕'};
 return breakdownFor(b,id,e,snapshot,opt.skillMul??1,opt.crit??false,opt.element??snapshot.element);
}
export function lastDamageBreakdown(b:Battle,id:string):AttackBreakdown{return b.lastHits[id]??battleDamageBreakdown(b,id);}

function hit(b:Battle,u:Pick<BattleUnit,'id'>,e:Enemy,skillMul=1,opt:{element?:string;burnMul?:number;stink?:number;proc?:boolean;snapshot?:AttackSnapshot}={}):number {
 const r=b.data.rules,element=opt.element??b.data.byToy[u.id].el;const crit=r.critChance>0&&random(b)<r.critChance;const breakdown=breakdownFor(b,u.id,e,opt.snapshot??attackSnapshot(b,u),skillMul,crit,element);
 const dealt=damage(b,e,breakdown.rawTotal,u.id,false,element,crit);if(dealt>0)b.lastHits[u.id]={...breakdown,total:dealt,mode:'last-hit',note:'最近一次真实直接命中的结算快照，含当时技能、暴击及目标状态。'};if(dealt===0||e.dead||opt.proc===false)return dealt;
 if(element==='暖'){const fresh=e.burnUntil<=b.time;e.burnDamage=Math.max(fresh?0:e.burnDamage,mul(dealt,r.burnRate,opt.burnMul??1));e.burnUntil=b.time+r.burnDuration;e.burnSource=u.id;if(fresh&&!e.stink.length)e.nextDot=b.time+r.dotInterval;emit(b,'burn',{enemy:e.id,until:e.burnUntil,damage:e.burnDamage});}
 else if(element==='凉'){e.slowUntil=b.time+r.slowDuration;e.coldHits=e.coldHits.filter(t=>b.time-t<=r.slowDuration+EPS);e.coldHits.push(b.time);emit(b,'slow',{enemy:e.id,until:e.slowUntil});if(e.coldHits.length>=r.freezeHits){e.freezeUntil=Math.max(e.freezeUntil,b.time+r.freezeDuration);e.coldHits=[];emit(b,'freeze',{enemy:e.id,until:e.freezeUntil});}}
 else if(element==='臭'){const fresh=!e.stink.length&&e.burnUntil<=b.time;for(let i=0;i<(opt.stink??1)&&e.stink.length<r.stinkMax;i++)e.stink.push({damage:mul(dealt,r.stinkRate),source:u.id});if(fresh)e.nextDot=b.time+r.dotInterval;emit(b,'stink',{enemy:e.id,layers:e.stink.length});}
 return dealt;
}
function chain(b:Battle,u:Pick<BattleUnit,'id'>,e:Enemy,count:number,snapshot:AttackSnapshot):void {
 let current:Enemy|undefined=e,scale=1;const visited=new Set<number>();
 for(let i=0;i<count&&current;i++){visited.add(current.id);hit(b,u,current,scale,{snapshot});const from=current;current=nearest(b,from.x,from.y,visited,b.data.rules.chainRange);if(current&&i+1<count)emit(b,'chain',{source:u.id,from:from.id,to:current.id,fromPos:[from.x,from.y],toPos:[current.x,current.y],jump:i+1});scale*=b.data.rules.chainMul;}
}
function splash(b:Battle,at:Point,range:number):Enemy[]{return aliveEnemies(b).filter(e=>visible(b,e)&&distance([e.x,e.y],at)<=range+EPS).sort((a,c)=>distance([a.x,a.y],at)-distance([c.x,c.y],at)||a.id-c.id);}
function pushEnemy(b:Battle,e:Enemy):void {
 if(e.dead)return;const d=b.data,dx=e.x-d.nest.center[0],dy=e.y-d.nest.center[1],len=Math.hypot(dx,dy)||1;
 e.x+=dx/len*d.rules.pushDistance;e.y+=dy/len*d.rules.pushDistance;e.distance=Math.max(0,centerDistance(b,e)-d.nest.wall);e.blockedBy=null;e.claimedBy=null;e.state='walk';e.squeezeUntil=0;emit(b,'push',{enemy:e.id,distance:d.rules.pushDistance});
}
function resolveStrike(b:Battle,p:PendingStrike,at:Point,from:Point):void {
 const u=b.units.find(x=>x.id===p.source)??{id:p.source};const d=b.data,r=d.rules,e=b.enemies.find(x=>x.id===p.target&&visible(b,x)),snapshot=p.snapshot;
 if(p.skill){
  if(u.id==='fangfang'){if(e)hit(b,u,e,r.fangfangMul,{snapshot});}
  else if(u.id==='huhu'){for(const x of splash(b,at,r.chainRange))hit(b,u,x,1,{burnMul:r.huhuBurnMul,snapshot});}
  else if(u.id==='gaga'){
   const dx=at[0]-from[0],dy=at[1]-from[1],len=Math.hypot(dx,dy)||1;
   for(const x of aliveEnemies(b)){const along=((x.x-from[0])*dx+(x.y-from[1])*dy)/len,across=Math.abs((x.x-from[0])*dy-(x.y-from[1])*dx)/len;if(along>=0&&across<=r.waterWidth/2){hit(b,u,x,1,{snapshot});pushEnemy(b,x);}}
  }else if(u.id==='kaka'){if(e)chain(b,u,e,6,snapshot);}
  else if(u.id==='laowa'){for(const x of splash(b,at,r.chainRange))hit(b,u,x,1,{stink:3,snapshot});}
 }else if(snapshot.element==='电'){if(e)chain(b,u,e,3,snapshot);}
 else if((u.id==='huhu'||u.id==='abing')&&p.kind!=='melee'){
  const group=splash(b,at,r.splashRange);if(e){const i=group.indexOf(e);if(i>=0)group.splice(i,1);group.unshift(e);}for(const x of group.slice(0,r.splashCount))hit(b,u,x,1,{snapshot});
 }else if(e)hit(b,u,e,1,{snapshot});
}
function specialSkill(b:Battle,u:BattleUnit):boolean {
 const d=b.data,r=d.rules;
 if(u.id==='dingdang'||u.id==='piaopiao'){
  u.buffUntil=b.time+r.supportDuration;emit(b,'support',{source:u.id,until:u.buffUntil,home:[u.x,u.y],radius:d.byToy[u.id].aura??d.stance.aura.radius});return true;
 }
 if(u.id==='ruanruan'){
  const candidates=aliveEnemies(b).filter(e=>!e.boss&&!e.blockedBy&&visible(b,e)).sort((a,c)=>centerDistance(b,a)-centerDistance(b,c)||a.id-c.id);
  for(let i=0;i<r.cloneCount;i++){const e=candidates[i],id=`clone-${b.tick}-${i}`,center=d.nest.center,len=e?distance([e.x,e.y],center):1;
   const x=e?e.x+(center[0]-e.x)/len*d.stance.block.front:u.x+(i?1:-1)*r.cloneBlockRadius,y=e?e.y+(center[1]-e.y)/len*d.stance.block.front:u.y-r.cloneBlockRadius;
   b.clones.push({id,source:u.id,x,y,target:e?.id??null,stamina:d.stance.clone.stamina,until:b.time+r.cloneDuration,nextAttack:b.time+r.cloneAttackInterval});if(e){e.claimedBy=id;e.blockedBy=id;e.state='blocked';}emit(b,'clone',{source:u.id,id,x,y,target:e?.id});
  }return true;
 }
 if(u.id==='abing'){for(const e of aliveEnemies(b)){if(!visible(b,e))continue;e.freezeUntil=Math.max(e.freezeUntil,b.time+r.abingFreeze);emit(b,'freeze',{enemy:e.id,until:e.freezeUntil});}return true;}
 return false;
}
function beginStrike(b:Battle,u:BattleUnit,e:Enemy,skill:boolean):void {
 const def=b.data.byToy[u.id],kind=e.blockedBy===u.id?'melee':def.shot.kind;
 if(!skill)b.shots++;emit(b,skill?'skill':'attack',{source:u.id,target:e.id,element:def.el,from:[u.x,u.y],to:[e.x,e.y],windup:def.windup,kind});
 u.state='attack';u.target=e.id;
 if(skill&&specialSkill(b,u))return;
 if(skill&&u.id==='fangfang')u.stamina=Math.min(u.maxStamina,u.stamina+u.maxStamina/2);
 b.pending.push({source:u.id,target:e.id,last:[e.x,e.y],releaseAt:b.time+def.windup,kind,skill,snapshot:attackSnapshot(b,u)});
}
function updateProjectiles(b:Battle,dt:number):void {
 // Only projectiles released in earlier ticks advance, so windup and flight never overlap.
 for(const p of b.projectiles){
  const e=b.enemies.find(x=>x.id===p.target);if(e&&!e.leaked){p.to=[e.x,e.y];}
  p.elapsed+=dt;
  if(p.kind==='straight'){
   const length=distance(p.pos,p.to),step=p.speed*dt;if(length<=step+EPS){p.pos=[...p.to];p.done=true;}else {p.pos=[p.pos[0]+(p.to[0]-p.pos[0])/length*step,p.pos[1]+(p.to[1]-p.pos[1])/length*step];}
  }else if(p.kind==='lob'){
   const t=Math.min(1,p.elapsed/p.duration);p.pos=[p.from[0]+(p.to[0]-p.from[0])*t,p.from[1]+(p.to[1]-p.from[1])*t];p.done=t+EPS>=1;
  }else p.done=p.elapsed+EPS>=p.duration;
  if(p.done&&(p.kind==='straight'||p.kind==='lob')){resolveStrike(b,p.strike,p.to,p.from);emit(b,'impact',{projectileId:p.id,source:p.source,target:p.target,at:[...p.to],kind:p.kind});}
 }
 const live:Projectile[]=[];for(const p of b.projectiles){if(p.done)b.projectilePool.push(p);else live.push(p);}b.projectiles=live;
}
function releaseStrikes(b:Battle):void {
 const waiting:PendingStrike[]=[];
 for(const p of b.pending){
  const e=b.enemies.find(x=>x.id===p.target);if(e&&!e.leaked)p.last=[e.x,e.y];
  if(p.releaseAt>b.time+EPS){waiting.push(p);continue;}
  const u=b.units.find(x=>x.id===p.source);if(!u||!active(b,u)||u.dash)continue;
  const def=b.data.byToy[u.id],from:Point=[u.x,u.y],duration=def.shot.dur??(p.kind==='straight'?distance(from,p.last)/(def.shot.speed??1):b.data.rules.tick),id=b.nextProjectileId++;
  const shot:Projectile=Object.assign(b.projectilePool.pop()??{}, {id,source:u.id,target:p.target,kind:p.kind,from,pos:[...from] as Point,to:[...p.last] as Point,elapsed:0,duration,arc:def.shot.arc??0,speed:def.shot.speed??0,element:def.el,strike:p,done:false});
  b.projectiles.push(shot);emit(b,'shot',{projectileId:id,source:u.id,target:p.target,kind:p.kind,from,to:[...p.last],duration,arc:shot.arc,element:def.el});
  if(p.kind!=='straight'&&p.kind!=='lob')resolveStrike(b,p,p.last,from);
 }
 b.pending=waiting;
}
function leak(b:Battle,e:Enemy):void {
 if(e.dead||e.leaked||b.outcome)return;e.leaked=true;e.blockedBy=null;e.claimedBy=null;e.state='gone';b.leaks++;
 const loss=e.boss?b.thickness:e.elite?2:1;b.thickness=Math.max(0,b.thickness-loss);
 emit(b,'leak',{enemy:e.id,at:[e.x,e.y],x:e.x,y:e.y,layers:loss,thickness:b.thickness});
 if(!e.boss)for(const u of b.units)if(distance([u.x,u.y],[e.x,e.y])<=b.data.stance.startle.radius+EPS){u.startledUntil=Math.max(u.startledUntil,b.time+b.data.stance.startle.sec);emit(b,'startle',{source:u.id,until:u.startledUntil});}
 if(b.thickness===0)finish(b,false);
}
export function flashContains(b:Battle,e:Enemy,aim=b.flash.aim):boolean {const [cx,cy]=b.data.nest.center,dx=e.x-cx,dy=e.y-cy;const angle=Math.atan2(dy,dx),diff=Math.atan2(Math.sin(angle-aim),Math.cos(angle-aim));const half=Math.atan2(b.data.rules.flashWidth/2,cy-b.data.nest.spawn.y);return Math.abs(diff)<=half&&Math.hypot(dx,dy)<=Math.hypot(b.data.nest.spawn.x[1]-cx,cy-b.data.nest.spawn.y)+EPS;}
export function bestFlashAim(b:Battle):number {const [cx,cy]=b.data.nest.center;const close=aliveEnemies(b).filter(e=>e.distance<=b.data.rules.flashAutoRange);const candidates=close.length?close:aliveEnemies(b);let aim=-Math.PI/2,best=-1;for(const e of candidates){const a=Math.atan2(e.y-cy,e.x-cx),score=candidates.filter(x=>flashContains(b,x,a)).length;if(score>best){best=score;aim=a;}}return aim;}
function fireFlash(b:Battle,aim:number):void {const d=b.data;b.flash.charge=0;b.flash.until=b.time+d.flash.beam;b.flash.aim=aim;const window=d.rules.flashDpsWindow;b.flash.dps=mul(b.recentDamage.filter(x=>x.time>=b.time-window).reduce((n,x)=>add(n,x.damage),0)/window,d.flash.beamMul);emit(b,'flashStart',{aim,until:b.flash.until,dps:b.flash.dps});}
function faceTo(b:Battle,u:BattleUnit,dx:number,dy:number):void {
 if(Math.hypot(dx,dy)<=EPS){u.face='front';return;}
 if(!b.data.stance.range[b.data.byToy[u.id].range].turn){u.face='front';if(Math.abs(dx)>EPS)u.flip=dx<0;return;}
 u.face=Math.abs(dy)>=Math.abs(dx)*0.8?(dy<0?'back':'front'):'side';if(Math.abs(dx)>EPS)u.flip=dx<0;
}
function moveTo(b:Battle,u:BattleUnit,p:Point,speed:number,dt:number):void {
 const length=distance([u.x,u.y],p);if(length<=EPS)return;const travel=Math.min(length,speed*dt);
 u.vx=(p[0]-u.x)/length*travel/dt;u.vy=(p[1]-u.y)/length*travel/dt;u.x+=u.vx*dt;u.y+=u.vy*dt;faceTo(b,u,u.vx,u.vy);
}
export function clampLeash(b:Battle,u:BattleUnit,p:Point):Point {
 const leash=b.data.stance.range[b.data.byToy[u.id].range].leash;let point=clampHome(b.data,p);
 const length=distance(point,u.home);if(length>leash&&length>EPS)point=[u.home[0]+(point[0]-u.home[0])/length*leash,u.home[1]+(point[1]-u.home[1])/length*leash];return clampHome(b.data,point);
}
function beginReturn(b:Battle,u:BattleUnit):void {
 if(!u.dash||u.dash.phase==='back')return;u.dash.phase='back';u.dash.elapsed=0;u.dash.from=[u.x,u.y];u.dash.to=[...u.home];emit(b,'dashReturn',{source:u.id,from:[u.x,u.y],to:[...u.home]});
}
function updateDash(b:Battle,u:BattleUnit,dt:number):void {
 const dash=u.dash!,d=b.data;let victim=b.enemies.find(e=>e.id===dash.target&&!e.dead&&!e.leaked);
 if(dash.phase!=='back'&&!victim){victim=nearest(b,u.x,u.y);if(victim){dash.target=victim.id;dash.phase='out';dash.elapsed=0;emit(b,'dashRetarget',{source:u.id,target:victim.id});}else beginReturn(b,u);}
 dash.elapsed+=dt;
 if(dash.phase==='back'){
  u.state='return';dash.to=[...u.home];moveTo(b,u,u.home,d.stance.dash.back,dt);u.face='front';
  if(distance([u.x,u.y],u.home)<=EPS){u.dash=null;u.relocating=false;u.state='idle';emit(b,'dashEnd',{source:u.id});}return;
 }
 if(!victim)return;u.target=victim.id;
 const to:Point=[victim.x,victim.y+d.rules.dashTargetOffset];dash.to=to;
 if(dash.phase==='out'){
  u.state='dash';moveTo(b,u,to,d.stance.dash.speed,dt);
  if(distance([u.x,u.y],to)<=EPS){dash.phase='hits';dash.elapsed=0;dash.nextHit=0;}else return;
 }
 u.state='strike';faceTo(b,u,victim.x-u.x,victim.y-u.y);
 // The melee target can move between hits; follow at dash speed instead of teleporting.
 moveTo(b,u,to,d.stance.dash.speed,dt);
 if(distance([u.x,u.y],to)<=EPS&&dash.elapsed+EPS>=dash.nextHit){
  hit(b,u,victim,d.stance.dash.hitMul);if(!victim.dead&&d.byToy[u.id].el==='凉'){victim.freezeUntil=Math.max(victim.freezeUntil,b.time+d.rules.freezeDuration);emit(b,'freeze',{enemy:victim.id,until:victim.freezeUntil});}
  emit(b,'dashHit',{source:u.id,target:victim.id,index:dash.hits+1,from:[u.x,u.y],at:[victim.x,victim.y]});dash.hits++;dash.nextHit+=d.stance.dash.hitGap;
  if(dash.hits>=d.stance.dash.hits)beginReturn(b,u);
 }
}
function claimEnemy(b:Battle,u:BattleUnit):void {
 const d=b.data,claimed=aliveEnemies(b).filter(e=>e.claimedBy===u.id||e.blockedBy===u.id);
 if(claimed.length>=d.stance.block.hold)return;
 const e=aliveEnemies(b).filter(e=>!e.boss&&e.state==='walk'&&!e.claimedBy&&!e.blockedBy&&visible(b,e)).filter(e=>{const p=wallPoint(d,e.x,e.y,d.rules.blockWallInset);return distance(clampLeash(b,u,p),p)<d.rules.blockClaimTolerance+EPS;}).sort((a,c)=>centerDistance(b,a)-centerDistance(b,c)||a.id-c.id)[0];
 if(e){e.claimedBy=u.id;emit(b,'claim',{source:u.id,enemy:e.id});}
}
function wander(b:Battle,u:BattleUnit,dt:number):void {
 const d=b.data,range=d.stance.range[d.byToy[u.id].range],radius=Math.min(range.leash,d.stance.wander.radius);
 if(!radius){u.state='idle';return;}
 if(b.time+EPS>=u.wanderAt||!u.wanderGoal){const angle=random(b)*Math.PI*2,radiusNow=Math.sqrt(random(b))*radius;u.wanderGoal=clampLeash(b,u,[u.home[0]+Math.cos(angle)*radiusNow,u.home[1]+Math.sin(angle)*radiusNow]);u.wanderAt=b.time+d.stance.wander.every[0]+random(b)*(d.stance.wander.every[1]-d.stance.wander.every[0]);}
 u.state='wander';moveTo(b,u,distance([u.x,u.y],u.home)>radius+EPS?u.home:u.wanderGoal,range.speed,dt);if(Math.hypot(u.vx,u.vy)<=EPS)u.face='front';
}
function updateUnits(b:Battle,dt:number):void {
 const d=b.data,r=d.rules;
 for(const u of b.units){
  u.vx=0;u.vy=0;u.state='idle';u.target=null;
  if(u.knockedUntil>0&&u.knockedUntil<=b.time+EPS){u.knockedUntil=0;u.stamina=u.maxStamina;emit(b,'recover',{source:u.id});}
  u.skillClock+=dt;u.dashClock+=dt;
  if(!active(b,u)){u.state=u.knockedUntil>b.time?'knocked':'startled';continue;}
  if(u.dash){updateDash(b,u,dt);continue;}
  const def=d.byToy[u.id],range=d.stance.range[def.range];
  if(!range.leash){[u.x,u.y]=u.home;}
  if(u.relocating){u.state='walk';moveTo(b,u,u.home,range.speed,dt);if(distance([u.x,u.y],u.home)<=EPS)u.relocating=false;continue;}
  u.attackClock+=dt;
  if(!aliveEnemies(b).some(e=>e.blockedBy===u.id))u.stamina=Math.min(u.maxStamina,u.stamina+r.blockRegen*dt);
  const pending=b.pending.find(p=>p.source===u.id);if(pending){u.state='attack';u.target=pending.target;const e=b.enemies.find(e=>e.id===pending.target);if(e)faceTo(b,u,e.x-u.x,e.y-u.y);continue;}
  if(def.stance==='冲'&&u.dashClock+EPS>=d.stance.dash.cd){const e=dashTarget(b);if(e){u.dashClock=0;u.dash={phase:'out',elapsed:0,from:[u.x,u.y],to:[e.x,e.y+r.dashTargetOffset],target:e.id,hits:0,nextHit:0};b.dashes++;emit(b,'dashStart',{source:u.id,target:e.id,from:[u.x,u.y],to:u.dash.to});updateDash(b,u,dt);continue;}}
  let goal:Point|null=null;
  if(def.stance==='挡'){
   claimEnemy(b,u);const held=aliveEnemies(b).filter(e=>e.blockedBy===u.id),claimed=aliveEnemies(b).filter(e=>e.claimedBy===u.id).sort((a,c)=>centerDistance(b,a)-centerDistance(b,c)||a.id-c.id);
   const e=held[0]??claimed[0];if(e){u.target=e.id;u.state=held.length?'block':'approach';if(!held.length){const len=centerDistance(b,e)||1;goal=clampLeash(b,u,[e.x+(d.nest.center[0]-e.x)/len*d.stance.block.front,e.y+(d.nest.center[1]-e.y)/len*d.stance.block.front]);}}
  }
  let e=target(b,u);
  if(!e&&!goal){const front=threat(b);if(front&&range.leash){const len=distance([front.x,front.y],u.home)||1,p=clampLeash(b,u,[front.x+(u.home[0]-front.x)/len*def.reach*r.approachReach,front.y+(u.home[1]-front.y)/len*def.reach*r.approachReach]);if(distance(p,[front.x,front.y])<=def.reach+EPS){goal=p;u.state='walk';u.target=front.id;}}}
  if(goal)moveTo(b,u,goal,range.speed,dt);
  if(!e&&!goal)wander(b,u,dt);
  e=target(b,u);
  if(e){u.target=e.id;if(Math.hypot(u.vx,u.vy)<=EPS)faceTo(b,u,e.x-u.x,e.y-u.y);
   // Advancing units finish moving before beginning an attack.
   if(Math.hypot(u.vx,u.vy)>EPS)continue;
   if(u.skillClock+EPS>=(r.skillCooldown[u.id]??Infinity)){u.skillClock=0;beginStrike(b,u,e,true);}
   else {const itv=def.itv/(1+buff(b,u,'speed'));if(u.attackClock+EPS>=itv){u.attackClock=Math.max(0,Math.min(itv,u.attackClock-itv));beginStrike(b,u,e,false);}else if(u.state!=='block')u.state='idle';}
  }
  if(b.outcome)return;
 }
 separateUnits(b,dt);
}
function separateUnits(b:Battle,dt:number):void {
 const gap=b.data.stance.gap*b.data.nest.dollSize;
 for(let i=0;i<b.units.length;i++)for(let j=i+1;j<b.units.length;j++){
  const a=b.units[i],c=b.units[j];if(a.dash||c.dash)continue;const length=distance([a.x,a.y],[c.x,c.y]);if(length>=gap-EPS)continue;
  const am=b.data.stance.range[b.data.byToy[a.id].range].leash>0&&a.knockedUntil<=b.time,cm=b.data.stance.range[b.data.byToy[c.id].range].leash>0&&c.knockedUntil<=b.time;
  if(!am&&!cm)continue;const dx=length>EPS?(a.x-c.x)/length:1,dy=length>EPS?(a.y-c.y)/length:0,push=(gap-length)/(am&&cm?2:1);
  if(am){const proposed:Point=[a.x+dx*push,a.y+dy*push],p=a.relocating?clampHome(b.data,proposed):clampLeash(b,a,proposed);a.vx+=(p[0]-a.x)/dt;a.vy+=(p[1]-a.y)/dt;[a.x,a.y]=p;faceTo(b,a,a.vx,a.vy);}
  if(cm){const proposed:Point=[c.x-dx*push,c.y-dy*push],p=c.relocating?clampHome(b.data,proposed):clampLeash(b,c,proposed);c.vx+=(p[0]-c.x)/dt;c.vy+=(p[1]-c.y)/dt;[c.x,c.y]=p;faceTo(b,c,c.vx,c.vy);}
 }
}
function knockDown(b:Battle,u:BattleUnit):void {
 u.stamina=0;u.knockedUntil=b.time+b.data.stance.block.knocked;u.state='knocked';b.knockdowns++;releaseClaims(b,u.id);b.pending=b.pending.filter(p=>p.source!==u.id);emit(b,'knockdown',{source:u.id,until:u.knockedUntil});
}
function updateClones(b:Battle,dt:number):void {
 const r=b.data.rules;
 for(const c of b.clones){
  const u=b.units.find(x=>x.id===c.source);let e=b.enemies.find(e=>e.id===c.target&&visible(b,e));
  if(!e||e.blockedBy!==c.id){e=aliveEnemies(b).filter(e=>!e.boss&&!e.blockedBy&&!e.claimedBy&&visible(b,e)&&distance([e.x,e.y],[c.x,c.y])<=r.cloneBlockRadius).sort((a,v)=>distance([a.x,a.y],[c.x,c.y])-distance([v.x,v.y],[c.x,c.y])||a.id-v.id)[0];c.target=e?.id??null;if(e){e.blockedBy=c.id;e.claimedBy=c.id;e.state='blocked';}}
  if(e&&e.blockedBy===c.id){c.stamina-=dt*(e.elite?b.data.stance.block.drainElite:b.data.stance.block.drainNormal);b.blockedSeconds+=dt;if(c.nextAttack<=b.time+EPS&&u){c.nextAttack+=r.cloneAttackInterval;hit(b,u,e,r.cloneAttackMul,{element:'枕',proc:false});}}
  if(c.until<=b.time||c.stamina<=EPS||!u){releaseClaims(b,c.id);c.until=0;emit(b,'cloneEnd',{id:c.id});}
 }
 b.clones=b.clones.filter(c=>c.until>0);
}
function updateEnemies(b:Battle,dt:number):void {
 const d=b.data,r=d.rules;
 for(const e of [...aliveEnemies(b)]){
  if((e.burnUntil>0||e.stink.length)&&e.nextDot<=b.time+EPS){e.nextDot+=r.dotInterval;if(e.burnUntil+EPS>=b.time)damage(b,e,mul(e.burnDamage,r.dotInterval),e.burnSource,true,'暖');for(const st of e.stink){if(e.dead||b.outcome)break;damage(b,e,mul(st.damage,r.dotInterval),st.source,true,'臭');}}
  if(e.dead||b.outcome)continue;
  if(e.blockedBy){const u=b.units.find(u=>u.id===e.blockedBy);if(u){if(u.knockedUntil>b.time){releaseClaims(b,u.id);}else {b.blockedSeconds+=dt;u.stamina-=dt*(e.elite?d.stance.block.drainElite:d.stance.block.drainNormal);if(u.stamina<=EPS)knockDown(b,u);continue;}}else if(b.clones.some(c=>c.id===e.blockedBy))continue;else {e.blockedBy=null;e.claimedBy=null;e.state='walk';}}
  if(e.state==='squeeze'){if(e.squeezeUntil<=b.time+EPS)leak(b,e);continue;}
  let speed=e.speed;if(e.freezeUntil>b.time||e.stunUntil>b.time||e.flashUntil>b.time)speed=0;else {if(e.slowUntil>b.time)speed*=r.slowMul;for(const id of new Set(b.save.devices.map(v=>v.id))){const slow=d.byDevice[id]?.effect.slow;if(slow)speed*=1-slow;}}
  const toWall=Math.max(0,centerDistance(b,e)-d.nest.wall),travel=Math.min(toWall,speed*dt),len=centerDistance(b,e)||1;
  e.x+=(d.nest.center[0]-e.x)/len*travel;e.y+=(d.nest.center[1]-e.y)/len*travel;e.distance=Math.max(0,toWall-travel);
  const u=e.claimedBy?b.units.find(u=>u.id===e.claimedBy&&u.knockedUntil<=b.time):undefined;
  if(!e.boss&&u&&distance([u.x,u.y],[e.x,e.y])<=d.stance.block.meet+EPS&&aliveEnemies(b).filter(n=>n.blockedBy===u.id).length<d.stance.block.hold){e.blockedBy=u.id;e.state='blocked';emit(b,'block',{source:u.id,enemy:e.id});}
  else if(e.distance<=EPS){if(e.boss)leak(b,e);else {e.state='squeeze';e.claimedBy=null;e.squeezeUntil=b.time+d.nest.squeeze;emit(b,'squeeze',{enemy:e.id,at:[e.x,e.y],until:e.squeezeUntil});}}
  if(b.outcome)return;
 }
}
function applyHomes(b:Battle,homes:Record<string,Point>):void {
 for(const id of Object.keys(homes).sort()){
  const p=homes[id];if(!Array.isArray(p)||p.length!==2||!p.every(Number.isFinite))continue;
  const u=b.units.find(u=>u.id===id);if(!u)continue;setHome(b,u,p);const saved=b.save.lineup.find(x=>x.id===id);if(saved)saved.home=[...u.home];
 }
}
function tick(b:Battle,input:BattleInput):void {
 const d=b.data,r=d.rules,dt=r.tick;b.tick++;b.time=b.tick*dt;if(input.homes){applyHomes(b,input.homes);b.inputLog.push({tick:b.tick,homes:Object.fromEntries(Object.entries(input.homes).map(([id,p])=>[id,[...p] as Point]))});}
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
 updateUnits(b,dt);if(b.outcome)return;
 updateProjectiles(b,dt);if(b.outcome)return;
 releaseStrikes(b);if(b.outcome)return;
 updateClones(b,dt);if(b.outcome)return;
 updateEnemies(b,dt);if(b.outcome)return;
 if(!b.boss&&b.spawned===d.wave.count&&!aliveEnemies(b).length)finish(b,true);
}
export function step(b:Battle,dt:number,input:BattleInput={}):BattleEvent[] {
 b.events=[];if(b.outcome||!Number.isFinite(dt)||dt<=0)return [];
 if(input.homes)for(const id of Object.keys(input.homes)){const p=input.homes[id];if(Array.isArray(p)&&p.length===2&&p.every(Number.isFinite))b.queuedHomes[id]=[...p];}
 b.accumulator+=dt;
 while(b.accumulator+EPS>=b.data.rules.tick&&!b.outcome){
  b.accumulator-=b.data.rules.tick;const homes=Object.keys(b.queuedHomes).length?b.queuedHomes:undefined;b.queuedHomes={};tick(b,{flash:input.flash,homes});
 }
 return [...b.events];
}
export function actors(b:Battle):{toys:ToyView[];nightmares:NmView[];shots:ShotView[]} {
 return {
  toys:b.units.map(u=>{const e=b.enemies.find(e=>e.id===u.target&&!e.dead&&!e.leaked);return {...u,home:[...u.home] as Point,pos:[u.x,u.y] as Point,velocity:[u.vx,u.vy] as Point,targetPosition:e?[e.x,e.y] as Point:null};}),
  nightmares:aliveEnemies(b).map(e=>({...e,pos:[e.x,e.y] as Point})),
  shots:b.projectiles.map(p=>({id:p.id,source:p.source,target:p.target,kind:p.kind,from:[...p.from] as Point,pos:[...p.pos] as Point,to:[...p.to] as Point,elapsed:p.elapsed,duration:p.duration,arc:p.arc,element:p.element}))
 };
}
export function result(b:Battle):WaveResult|null{return b.outcome?{...b.outcome,creditedSheep:b.creditedSheep,creditedKills:b.creditedKills}:null;}
export function battleCsv(rows:WaveResult[]):string {
 const keys=['z','w','seed','shots','damage','duration','leaks','blockedSeconds','knockdowns','dashes','firstHitWallSeconds','won','sheep'] as const;
 return [...keys,'avgDps'].join(',')+'\n'+rows.map(r=>[...keys.map(k=>r[k]),r.duration>0?r.damage/r.duration:0].join(',')).join('\n');
}
