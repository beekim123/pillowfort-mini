import { clamp, configureBig, mul } from './big.ts';
import { P1_RULES } from './rules.ts';
import { isPoint } from './ground.ts';
import type { GameData, Rules } from './types.ts';
function filterPhase(value: unknown, phase: number): unknown {
  if (Array.isArray(value)) return value.filter(x=>!(x&&typeof x==='object'&&'phase' in x&&Number((x as {phase:number}).phase)>phase)).map(x=>filterPhase(x,phase));
  if (value&&typeof value==='object') return Object.fromEntries(Object.entries(value).filter(([,v])=>!(v&&typeof v==='object'&&!Array.isArray(v)&&'phase' in v&&Number((v as {phase:number}).phase)>phase)).map(([k,v])=>[k,filterPhase(v,phase)]));
  return value;
}
export function loadData(json:unknown, overrides:Partial<Rules>={}):GameData {
  if(!json||typeof json!=='object') throw new TypeError('levels must be an object');
  const raw=json as GameData;
  if(raw.version!==2||!Number.isInteger(raw.phase)||!raw.wave?.hp100?.length||!Number.isInteger(raw.slots?.toyCap)||raw.slots.toyCap<1||!Array.isArray(raw.nest?.homes)||raw.nest.homes.length<raw.slots.toyCap||!raw.nest.homes.every(isPoint)||!Array.isArray(raw.nest.deviceHomes)||!raw.nest.deviceHomes.every(isPoint)||!isPoint(raw.nest.center)||!isPoint(raw.nest.ground?.x)||!(raw.nest.wall>raw.nest.ground.inset)||!Number.isFinite(raw.nest.ground.bottom)||!raw.stance?.range) throw new TypeError('Invalid levels v2 schema');
  const d=filterPhase(json,raw.phase) as GameData;
  configureBig(d.big); d.rules={...P1_RULES,...overrides,skillCooldown:{...P1_RULES.skillCooldown,...overrides.skillCooldown}};
  d.byToy=Object.fromEntries(d.toys.map(t=>[t.id,t])); d.byNightmare=Object.fromEntries(d.nightmares.map(t=>[t.id,t])); d.byDevice=Object.fromEntries(d.devices.map(t=>[t.id,t]));
  // Keep the supplied JSON byte-for-byte intact; repair only its stale runtime help text.
  for(const toy of d.toys) {
    if(!d.stance.range[toy.range]||!(toy.reach>0)||!Number.isFinite(toy.windup)||toy.windup<0||!['straight','lob','beam','chain','melee'].includes(toy.shot?.kind)) throw new TypeError('Invalid movement definition: '+toy.id);
    toy.desc=toy.desc.replace(/同一排的|同排/g,'光环范围内的');
  }
  // Narrative names/opening are needed by P1 even though the source groups them with phase-3 ending text.
  d.story={kidName:raw.story?.kidName??'糯糯',opening:raw.story?.opening??[]};
  const systems=new Set(d.systems.map(x=>x.id));
  d.unlocks=d.unlocks.filter(u=>d.zones.some(z=>z.id===u.z)).map(u=>({...u,toys:u.toys.filter(id=>!!d.byToy[id]),devices:u.devices.filter(id=>!!d.byDevice[id]),systems:u.systems.filter(id=>systems.has(id)),relics:[],research:u.research.filter(id=>id===d.researchDaily?.id)})).filter(u=>u.toys.length+u.devices.length+u.systems.length+u.research.length>0);
  d.tables={};
  const growth:Record<string,number>={atk:d.econ.atkGrow,cost:d.econ.lvCostGrow,over:d.econ.lvOverGrow,star:d.econ.starMul,courage:d.econ.courage,fort:1+d.econ.fortAtk,fortCost:d.econ.fortCostGrow,daily:d.researchDaily.eff.atk,zone:d.big.zoneUnit};
  for(const [name,grow] of Object.entries(growth)){ const table=[1]; for(let i=1;i<d.rules.tableSize;i++)table.push(clamp(table[i-1]*grow)); d.tables[name]=table; }
  return d;
}
export function table(d:GameData,key:string,n:number):number {const a=d.tables[key];if(!a)throw new Error('Unknown table '+key);return a[Math.min(a.length-1,Math.max(0,Math.floor(n)))];}
export function baseHp(d:GameData,z:number,w:number):number {const zone=d.zones.find(x=>x.id===z); if(!zone)throw new RangeError('Unavailable zone');return Math.floor(mul(d.wave.hp100[Math.max(0,Math.min(d.wave.hp100.length-1,w-1))],table(d,'zone',z),zone.hard100)/10000);}
export function sheepForHp(d:GameData,hp:number):number{return clamp(hp*d.econ.sheepPerHp+d.econ.sheepFlat);}
