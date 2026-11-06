import { newSave, openSlots, slotsOf, availableDevices } from './economy.ts';
import { clamp } from './big.ts';
import type { GameData, Save } from './types.ts';
export function serializeSave(s:Save):string {return JSON.stringify(s);}
/** Validate untrusted/local JSON. Never apply external object properties wholesale. */
export function parseSave(d:GameData,text:string|null,now:number):Save {
 const fresh=newSave(d,now);if(!text)return fresh;let raw:Partial<Save>;try{raw=JSON.parse(text);}catch{return fresh;}if(!raw||raw.version!==1)return fresh;
 const num=(v:unknown,fallback:number,min=0,max=d.big.max)=>typeof v==='number'&&Number.isFinite(v)?Math.min(max,Math.max(min,v)):fallback;
 const integer=(v:unknown,fallback:number,min=0,max=Number.MAX_SAFE_INTEGER)=>Math.floor(num(v,fallback,min,max));
 fresh.z=integer(raw.z,0,0,d.zones.length-1);fresh.w=integer(raw.w,1,1,d.wave.perZone-1);fresh.maxZ=integer(raw.maxZ,0,0,d.zones.length-1);fresh.maxW=integer(raw.maxW,0,0,d.wave.perZone);fresh.courage=integer(raw.courage,0,0,d.zones.length);fresh.fort=integer(raw.fort,1,1,d.rules.tableSize);fresh.sheep=num(raw.sheep,0);fresh.candy=integer(raw.candy,0);fresh.stay=raw.stay===true;fresh.pushBlock=integer(raw.pushBlock,0,0,d.wave.retryAfter);fresh.autoFlash=raw.autoFlash!==false;fresh.completed=raw.completed===true;
 for(const t of d.toys){const x=raw.toys?.[t.id];if(x)fresh.toys[t.id]={lv:integer(x.lv,1,1,d.rules.tableSize),star:integer(x.star,1,1,d.econ.starShards.length),shards:integer(x.shards,0),got:fresh.toys[t.id].got||x.got===true};}
 fresh.captain={star:integer(raw.captain?.star,1,1,d.econ.captainAura.length),shards:integer(raw.captain?.shards,0)};
 if(Array.isArray(raw.lineup)){const seen=new Set<string>();fresh.lineup=fresh.lineup.map((_,i)=>{const id=raw.lineup?.[i];if(typeof id!=='string'||!fresh.toys[id]?.got||seen.has(id))return null;seen.add(id);return id;});}
 if(Array.isArray(raw.devices)){const seen=new Set<string>();fresh.devices=fresh.devices.map((_,i)=>{const id=raw.devices?.[i];if(typeof id!=='string'||!d.byDevice[id]||seen.has(id))return null;seen.add(id);return id;});}
 if(raw.farm&&d.zones.some(z=>z.id===raw.farm?.z)&&Array.isArray(raw.farm.rates)){fresh.farm={z:raw.farm.z,w:integer(raw.farm.w,1,1,d.wave.perZone-1),rates:raw.farm.rates.filter(x=>typeof x==='number'&&Number.isFinite(x)&&x>=0).slice(-3).map(x=>clamp(x)),durations:Array.isArray(raw.farm.durations)?raw.farm.durations.filter(x=>typeof x==='number'&&Number.isFinite(x)&&x>0).slice(-3):[]};}
 fresh.daily={done:integer(raw.daily?.done,0,0,d.rules.tableSize),endAt:typeof raw.daily?.endAt==='number'?num(raw.daily.endAt,now):null};fresh.boxes={free:integer(raw.boxes?.free,0,0,d.econ.freeBoxMax),clock:num(raw.boxes?.clock,now)};
 for(const z of d.zones){const clear=raw.firstClear?.[z.id];if(typeof clear==='string'&&/^[01]{50}$/.test(clear))fresh.firstClear[z.id]=clear;fresh.bossBest[z.id]=num(raw.bossBest?.[z.id],0,0,1);}
 fresh.units=integer(raw.units,0,0,d.big.unit.length-1);fresh.stats={kills:integer(raw.stats?.kills,0),sheepTotal:num(raw.stats?.sheepTotal,0),maxHit:num(raw.stats?.maxHit,0)};fresh.rng=integer(raw.rng,7920,0,4294967295);fresh.lastSeen=num(raw.lastSeen,now);fresh.attempts={};if(raw.attempts&&typeof raw.attempts==='object')for(const [key,n] of Object.entries(raw.attempts))if(/^\d+:\d+(:boss)?$/.test(key))fresh.attempts[key]=integer(n,0);
 const opened=openSlots(d,fresh);fresh.lineup=fresh.lineup.map((id,i)=>opened.includes(d.nest.slots[i].id)?id:null);const devices=availableDevices(d,fresh);fresh.devices=fresh.devices.map((id,i)=>i<slotsOf(d,fresh.fort).device&&id&&devices.includes(id)?id:null);
 return fresh;
}
