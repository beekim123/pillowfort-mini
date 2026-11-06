import { describe, expect, it } from 'vitest';
import raw from '../assets/resources/data/levels.json';
import {
  RAW_DATA, baseHp, copySave, isOnGround, levelUp, loadData, place, wallPoint,
  newSave, onWaveEnd, parseSave, result, serializeSave, settleOffline, slotsOf, startWave, step,
} from '../assets/scripts/core/index';
import type { BattleEvent, WaveResult } from '../assets/scripts/core/types';

const d = loadData(raw);
function wave(won = true): WaveResult {
  return { z:0,w:1,boss:false,seed:1,won,clean:won,duration:10,sheep:24.8,creditedSheep:0,
    kills:8,creditedKills:0,leaks:won?0:3,maxHit:10,shots:8,damage:80,blockedSeconds:0,knockdowns:0,dashes:0,firstHitWallSeconds:0,bossDamage:0 };
}

describe('Independent data-contract and regression checks', () => {
  it('embedded fallback data equals the unchanged v2 delivery JSON', () => {
    expect(RAW_DATA).toEqual(raw);
    expect(d.version).toBe(2);
  });
  it('loadData neither edits raw data nor exposes later-phase unlock references', () => {
    const before=JSON.stringify(raw);const fresh=loadData(raw);
    expect(JSON.stringify(raw)).toBe(before);
    expect([fresh.zones.length,fresh.toys.length,fresh.devices.length]).toEqual([3,9,2]);
    for(const u of fresh.unlocks){expect(u.z).toBeLessThan(3);expect(u.relics).toEqual([]);for(const id of u.toys)expect(fresh.byToy[id]).toBeDefined();}
  });
  it('starts initial toys at the ordered v2 homes without fixed slot identifiers', () => {
    const s=newSave(d,100);
    expect(s.lineup).toEqual([
      {id:'fangfang',home:[375,930]},
      {id:'huhu',home:[235,895]},
      {id:'gaga',home:[525,960]},
    ]);
    expect(s.lineup.map(p=>p.home)).toEqual(d.nest.homes.slice(0,3));
    expect(s.lineup.every(p=>isOnGround(d,p.home))).toBe(true);
    expect(s.lineup[0].home).not.toBe(d.nest.homes[0]);
    expect(d.nest).not.toHaveProperty('slots');
    expect(d.nest).not.toHaveProperty('openOrder');
    expect(slotsOf(d,3).toy).toBe(3);expect(slotsOf(d,4).toy).toBe(4);
  });
  it('uses a continuous circular wall and precise ground boundaries instead of lanes', () => {
    const xs=[80,197.999,198,315.999,316,433.999,434,551.999,552,670];
    const edges=xs.map(x=>wallPoint(d,x,d.nest.spawn.y));
    for(let i=0;i<xs.length;i++){
      const dx=xs[i]-375,dy=d.nest.spawn.y-1170,length=Math.hypot(dx,dy);
      expect(edges[i][0]).toBeCloseTo(375+dx/length*360,10);
      expect(edges[i][1]).toBeCloseTo(1170+dy/length*360,10);
      if(i>0)expect(edges[i][0]).toBeGreaterThan(edges[i-1][0]);
    }
    expect(wallPoint(d,375,d.nest.spawn.y)).toEqual([375,810]);
    expect(isOnGround(d,[375,838])).toBe(true);expect(isOnGround(d,[375,837.999])).toBe(false);
    expect(isOnGround(d,[43,1170])).toBe(true);expect(isOnGround(d,[42.999,1170])).toBe(false);
    expect(isOnGround(d,[707,1170])).toBe(true);expect(isOnGround(d,[707.001,1170])).toBe(false);
    expect(isOnGround(d,[375,1196])).toBe(true);expect(isOnGround(d,[375,1196.001])).toBe(false);
    expect(d.nest.spawn).not.toHaveProperty('lanes');
    expect(baseHp(d,0,1)).toBe(10);expect(baseHp(d,0,49)).toBe(69183);expect(baseHp(d,2,1)).toBe(3_000_000_000);
  });
  it('rejected operations are immutable and relocation never duplicates a toy', () => {
    const s=newSave(d,100);s.toys.dingdang.got=true;const before=serializeSave(s);
    expect(levelUp(d,s,'fangfang')).toBeNull();
    expect(place(d,s,'dingdang',[400,1000])).toBeNull();
    expect(place(d,s,'abing',[400,1000])).toBeNull();
    expect(place(d,s,'fangfang',[NaN,1000])).toBeNull();
    expect(serializeSave(s)).toBe(before);
    const moved=place(d,s,'fangfang',[400,1000]);
    expect(moved).not.toBeNull();expect(moved?.lineup).toHaveLength(s.lineup.length);
    expect(moved?.lineup.filter(x=>x.id==='fangfang')).toEqual([{id:'fangfang',home:[400,1000]}]);
    expect(moved?.lineup.filter(x=>x.id!=='fangfang')).toEqual(s.lineup.filter(x=>x.id!=='fangfang'));
    expect(serializeSave(s)).toBe(before);
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
    const placed=place(d,s,'huhu',[400,1000])!;
    const round=parseSave(d,serializeSave(placed),100);expect(round.version).toBe(2);
    expect(round.lineup).toEqual(placed.lineup);expect(round.devices).toEqual(placed.devices);expect(round.lastSeen).toBe(100);
  });
});
