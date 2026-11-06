import { describe, expect, it } from 'vitest';
import raw from '../assets/resources/data/levels.json';
import {
  RAW_DATA, assignToy, baseHp, copySave, dailyCost, edgePoint, laneForX, levelUp, loadData,
  newSave, onWaveEnd, parseSave, result, serializeSave, settleOffline, slotsOf, startWave, step,
} from '../assets/scripts/core/index';
import type { BattleEvent, WaveResult } from '../assets/scripts/core/types';

const d = loadData(raw);
function wave(won = true): WaveResult {
  return { z:0,w:1,boss:false,seed:1,won,clean:won,duration:10,sheep:24.8,creditedSheep:0,
    kills:8,creditedKills:0,leaks:won?0:3,maxHit:10,shots:8,damage:80,blockedSeconds:0,knockdowns:0,dashes:0,bossDamage:0 };
}

describe('Independent data-contract and regression checks', () => {
  it('embedded fallback data equals the unchanged delivery JSON', () => {
    expect(RAW_DATA).toEqual(raw);
  });
  it('loadData neither edits raw data nor exposes later-phase unlock references', () => {
    const before=JSON.stringify(raw);const fresh=loadData(raw);
    expect(JSON.stringify(raw)).toBe(before);
    expect([fresh.zones.length,fresh.toys.length,fresh.devices.length]).toEqual([3,9,2]);
    for(const u of fresh.unlocks){expect(u.z).toBeLessThan(3);expect(u.relics).toEqual([]);for(const id of u.toys)expect(fresh.byToy[id]).toBeDefined();}
  });
  it('opens initial positions by nest.openOrder, not physical array order', () => {
    const s=newSave(d,100);
    expect(s.lineup.map((id,i)=>id?d.nest.slots[i].id:null).filter(Boolean).sort()).toEqual(['M2','M3','O3']);
    expect(slotsOf(d,3).toy).toBe(3);expect(slotsOf(d,4).toy).toBe(4);
  });
  it('uses all five lane interval boundaries and official O3 edge point', () => {
    const xs=[80,197.999,198,315.999,316,433.999,434,551.999,552,670];
    expect(xs.map(x=>laneForX(d,x))).toEqual(['O1','O1','O2','O2','O3','O3','O4','O4','O5','O5']);
    expect(edgePoint(d,'O3')).toEqual([375,780]);
    expect(baseHp(d,0,1)).toBe(10);expect(baseHp(d,0,49)).toBe(69183);expect(baseHp(d,2,1)).toBe(3_000_000_000);
  });
  it('rejected operations are immutable and relocation never duplicates a toy', () => {
    const s=newSave(d,100),before=serializeSave(s);
    expect(levelUp(d,s,'fangfang')).toBeNull();expect(assignToy(d,s,'O1','fangfang')).toBeNull();expect(serializeSave(s)).toBe(before);
    const moved=assignToy(d,s,'M2','fangfang');expect(moved).not.toBeNull();expect(moved?.lineup.filter(x=>x==='fangfang')).toHaveLength(1);expect(serializeSave(s)).toBe(before);
  });
  it('fixed-step results and all events are independent of presentation frame grouping', () => {
    const run=(dt:number)=>{const b=startWave(d,newSave(d,100),{attempt:42});const events:BattleEvent[]=[];for(let n=0;n<4000&&!result(b);n++)events.push(...step(b,dt,{}));return {r:result(b),events};};
    expect(run(1/30)).toEqual(run(1/10));
  });
  it('failed waves retreat, reset the clean streak, and still retain earned kill sheep', () => {
    let s=newSave(d,0);s.w=9;
    s=onWaveEnd(d,s,{...wave(false),w:9}).save;expect(s.w).toBe(7);expect(s.pushBlock).toBe(3);expect(s.sheep).toBeCloseTo(24.8);
    s=onWaveEnd(d,s,{...wave(),w:7}).save;expect(s.w).toBe(7);expect(s.pushBlock).toBe(2);
    s=onWaveEnd(d,s,{...wave(),w:7,clean:false,leaks:1}).save;expect(s.pushBlock).toBe(3);
  });
  it('49th wave and stay switch do not auto-start a boss', () => {
    const s=newSave(d,0);s.w=49;
    expect(onWaveEnd(d,s,{...wave(),w:49}).save.w).toBe(49);
    s.w=5;s.stay=true;expect(onWaveEnd(d,s,{...wave(),w:5}).save.w).toBe(5);
  });
  it('offline is capped, cannot repeat, and never advances progress', () => {
    const s=newSave(d,100);s.z=1;s.w=20;s.farm={z:1,w:18,rates:[2,3,4],durations:[10,10,10]};
    const settled=settleOffline(d,s,100+20*3600);expect(settled.card?.seconds).toBe(8*3600);expect(settled.card?.sheep).toBe(86400);expect(settled.card?.capped).toBe(true);
    expect([settled.save.z,settled.save.w]).toEqual([1,20]);
    expect(settleOffline(d,settled.save,100+20*3600).card).toBeNull();expect(settleOffline(d,s,99).card).toBeNull();expect(settleOffline(d,s,130).card).toBeNull();
  });
  it('storage invalid JSON and nonfinite amounts do not crash or grant extra wealth', () => {
    const s=parseSave(d,'{',100);expect(s.sheep).toBe(0);
    const bad=copySave(s);bad.sheep=Infinity;bad.candy=-40;
    const restored=parseSave(d,serializeSave(bad),100);expect(restored.sheep).toBe(0);expect(restored.candy).toBe(0);
    const round=parseSave(d,serializeSave(s),100);expect(round.lineup).toEqual(s.lineup);expect(round.lastSeen).toBe(100);
  });
});
