import type { Rules } from './types.ts';
/** Prose-only parameters, isolated from generated levels.json. See docs/CORE-ASSUMPTIONS.md. */
export const P1_RULES: Rules = {
  blockRegen: 0.8, blockWallInset: 30, blockClaimTolerance: 50, approachReach: 0.85, dashTargetOffset: 34,
  tick: 1/30, critChance: 0, critMul: 2,
  burnDuration: 3, burnRate: .2, warmVulnerability: 1.15,
  slowDuration: 2, slowMul: .7, freezeDuration: 1, freezeHits: 3, freezeVulnerability: 1.2,
  chainRange: 190, chainMul: .6, stinkMax: 10, stinkRate: .04, dotInterval: .5,
  splashRange: 90, splashCount: 3,
  skillCooldown: { fangfang:12, huhu:12, gaga:12, dingdang:15, kaka:12, ruanruan:8, piaopiao:15, laowa:10, abing:15 },
  fangfangMul:5, huhuBurnMul:3, waterWidth:60, pushDistance:60,
  supportDuration:4, supportAttack:.3, supportSpeed:.5, captainCooldown:20, captainDuration:4, captainSpeed:.5,
  cloneCount:2, cloneDuration:6, cloneAttackInterval:1, cloneAttackMul:.4, cloneBlockRadius:24,
  dashHitGap:.25, dashCollisionRadius:24, abingFreeze:1.5,
  bossAddsEvery:5, bossAddsCount:2, bossAddsHp:.5, corridorWalk:48, corridorAddsMul:1.5,
  wardrobeEvery:8, wardrobeDuration:2, examEvery:6,
  flashWidth:225, flashAutoRange:300, flashDpsWindow:5,
  splitCount:2, splitHp:.3, shellCount:3, shellMul:.1, swarmCount:3,
  offlineMinimum:60, tableSize:10000,
};
