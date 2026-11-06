import { describe, expect, it } from 'vitest';
import { Platform } from '../assets/scripts/fw/Platform';
import type { PlatformCapability } from '../assets/scripts/fw/Platform';
describe('P1 disabled platform capabilities',()=>{
 it('all five capabilities are unavailable without external side effects', async()=>{
   const p=new Platform();
   const names:PlatformCapability[]=['shareChat','shareTimeline','saveImage','friendRank','rewardedAd'];
   expect(names.map(n=>p.has(n))).toEqual([false,false,false,false,false]);
   const results=await Promise.all([p.shareChat(),p.shareTimeline(),p.saveImage(),p.friendRank(),p.rewardedAd()]);
   expect(results.every(r=>r.available===false&&r.reason==='not-enabled-in-p1')).toBe(true);
 });
});
