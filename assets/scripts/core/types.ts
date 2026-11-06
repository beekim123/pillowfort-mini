export type Point = [number, number];
export type Element = '枕' | '暖' | '凉' | '电' | '臭';
export type Stance = '挡' | '打' | '帮' | '冲';
export type MovementRange = '不动' | '小' | '中' | '大' | '冲';
export interface ShotDef { kind: 'straight' | 'lob' | 'beam' | 'chain' | 'melee'; speed?: number; dur?: number; arc?: number }
export interface Placement { id: string; home: Point }
export interface Gate { z: number; w: number }
export interface ToyDef { id: string; name: string; toy: string; stance: Stance; el: Element; role: string; base: number; itv: number; aoe: number; unlock: Gate; range: MovementRange; reach: number; windup: number; shot: ShotDef; aura?: number; desc: string; phase: number }
export interface NightmareDef { id: string; name: string; z: number; speed: number; hp: number; trait: string[]; phase: number }
export interface DeviceDef { id: string; name: string; effect: { atkAll?: number; slow?: number }; unlock: Gate; desc: string; phase: number }
export interface ZoneDef { id: number; name: string; boss: string; hard100: number; nightmares: string[]; elite: string; phase: number; [key: string]: unknown }
export interface Unlock extends Gate { toys: string[]; devices: string[]; systems: string[]; research: string[]; relics: string[] }
export interface GameData {
  version: number; code: string; phase: number;
  big: { unit: number[]; unitName: string[]; max: number; zoneUnit: number };
  wave: { perZone: number; count: number; spawnGap: number; gapAfter: number; eliteHp: number; eliteEvery: number; thickness: number; fallback: number; retryAfter: number; hp100: number[]; [key: string]: number | number[] };
  boss: { hpMul: number; walk: number; sheepMul: number; candyFirst: number; repeatHp: number };
  econ: { [key: string]: number | number[]; captainAura: number[]; supportBuff: number[]; starShards: number[]; atk0: number; atkGrow: number; lvCost0: number; lvCostGrow: number; lvCap0: number; lvCapPerBoss: number; lvOverGrow: number; starMul: number; courage: number; fortCost0: number; fortCostGrow: number; fortAtk: number; supportSelf: number; offlineCapH: number; offlineEff: number; freeBoxEveryH: number; freeBoxMax: number; boxCandy: number; boxShards: number; boxLineupWeight: number; wishCandy: number; wishShards: number; candyWave: number; candyWave10: number; candyPerOfflineH: number; sheepPerHp: number; sheepFlat: number };
  flash: { charge: number; beam: number; beamMul: number; stun: number; vuln: number; manualBoss: number; autoBoss: number };
  slots: { toy: number[][]; toyCap: number; device: number[][]; rows?: number; perRow?: number };
  stance: { block: { stamina: number[]; hold: number; drainNormal: number; drainElite: number; knocked: number; meet: number; front: number }; startle: { sec: number; radius: number }; dash: { cd: number; speed: number; back: number; hits: number; hitGap: number; hitMul: number; bossMul: number; waveMul: number }; clone: { stamina: number }; range: Record<MovementRange, { leash: number; speed: number; turn: boolean }>; wander: { every: Point; radius: number }; gap: number; aura: { radius: number } };
  nest: { center: Point; wall: number; ground: { inset: number; bottom: number; x: Point }; squeeze: number; dollSize: number; homes: Point[]; deviceHomes: Point[]; spawn: { y: number; x: Point; speed: number }; captain: Point; kid: { pos: Point; size: Point }; flashlight: Point; fence: { rect: number[]; sheepJumpTo: Point }; hud: { top: number[]; strip: number[]; fog: number[]; tabs: number[]; capsuleReserve: number[]; flashButton: { pos: Point; r: number }; bossButton: number[] } };
  zones: ZoneDef[]; nightmares: NightmareDef[]; captain: { id: string; name: string; desc: string }; toys: ToyDef[]; devices: DeviceDef[];
  systems: { id: string; name: string; at: number[]; phase: number }[];
  researchDaily: { id: string; name: string; min: number; costWaves: number; eff: { atk: number }; gate: Gate };
  unlocks: Unlock[]; story: { kidName: string; opening: string[]; ending?: string[]; again?: string };
  byToy: Record<string, ToyDef>; byNightmare: Record<string, NightmareDef>; byDevice: Record<string, DeviceDef>;
  tables: Record<string, number[]>; rules: Rules;
}
export interface Rules { blockRegen: number; blockWallInset: number; blockClaimTolerance: number; approachReach: number; dashTargetOffset: number; tick: number; critChance: number; critMul: number; burnDuration: number; burnRate: number; warmVulnerability: number; slowDuration: number; slowMul: number; freezeDuration: number; freezeHits: number; freezeVulnerability: number; chainRange: number; chainMul: number; stinkMax: number; stinkRate: number; dotInterval: number; splashRange: number; splashCount: number; skillCooldown: Record<string, number>; fangfangMul: number; huhuBurnMul: number; waterWidth: number; pushDistance: number; supportDuration: number; supportAttack: number; supportSpeed: number; captainCooldown: number; captainDuration: number; captainSpeed: number; cloneCount: number; cloneDuration: number; cloneAttackInterval: number; cloneAttackMul: number; cloneBlockRadius: number; dashHitGap: number; dashCollisionRadius: number; abingFreeze: number; bossAddsEvery: number; bossAddsCount: number; bossAddsHp: number; corridorWalk: number; corridorAddsMul: number; wardrobeEvery: number; wardrobeDuration: number; examEvery: number; flashWidth: number; flashAutoRange: number; flashDpsWindow: number; splitCount: number; splitHp: number; shellCount: number; shellMul: number; swarmCount: number; offlineMinimum: number; tableSize: number }
export interface ToySave { lv: number; star: number; shards: number; got: boolean }
export interface Save {
  version: 2; z: number; w: number; maxZ: number; maxW: number; stay: boolean; pushBlock: number; courage: number; sheep: number; candy: number;
  toys: Record<string, ToySave>; captain: { star: number; shards: number }; fort: number; lineup: Placement[]; devices: Placement[];
  farm: { z: number; w: number; rates: number[]; durations?: number[] } | null;
  daily: { done: number; endAt: number | null }; boxes: { free: number; clock: number }; firstClear: Record<number, string>; bossBest: Record<number, number>; units: number;
  stats: { kills: number; sheepTotal: number; maxHit: number }; rng: number; autoFlash: boolean; lastSeen: number;
  attempts?: Record<string, number>; completed?: boolean;
}
export interface MorningCard { seconds: number; sheep: number; candy: number; kills: number; z: number; w: number; capped: boolean; dailyCompleted: number; freeBoxes: number }
export interface BattleEvent { type: string; time: number; [key: string]: unknown }
export interface StinkLayer { damage: number; source: string }
export interface Enemy {
 id: number; kind: string; name: string; x: number; y: number; spawnX: number; spawnY: number; edgeX: number; edgeY: number; distance: number; pathLength: number;
 hp: number; maxHp: number; speed: number; reward: number; elite: boolean; boss: boolean; dead: boolean; leaked: boolean; trait: string[]; child: boolean; shell: number;
 claimedBy: string | null; blockedBy: string | null; state: 'walk' | 'blocked' | 'squeeze' | 'dead' | 'gone'; squeezeUntil: number; firstHitAt: number | null;
 burnUntil: number; burnDamage: number; burnSource: string; slowUntil: number; freezeUntil: number; stunUntil: number; flashUntil: number; coldHits: number[]; stink: StinkLayer[]; nextDot: number; closed: boolean;
}
export interface Dash { phase: 'out' | 'hits' | 'back'; elapsed: number; from: Point; to: Point; target: number; hits: number; nextHit: number }
export type ToyState = 'idle' | 'walk' | 'attack' | 'block' | 'approach' | 'dash' | 'strike' | 'return' | 'knocked' | 'startled' | 'wander';
export interface BattleUnit {
 id: string; home: Point; x: number; y: number; vx: number; vy: number; state: ToyState; face: 'front' | 'back' | 'side'; flip: boolean; target: number | null; wanderAt: number; wanderGoal: Point | null; relocating: boolean;
 attackClock: number; skillClock: number; dashClock: number; stamina: number; maxStamina: number; knockedUntil: number; startledUntil: number; buffUntil: number; dash: Dash | null; damage: number; hits: number;
}
export interface Clone { id: string; source: string; x: number; y: number; target: number | null; stamina: number; until: number; nextAttack: number }
export interface WaveResult { z: number; w: number; boss: boolean; seed: number; won: boolean; clean: boolean; duration: number; sheep: number; creditedSheep: number; kills: number; creditedKills: number; leaks: number; maxHit: number; shots: number; damage: number; blockedSeconds: number; knockdowns: number; dashes: number; firstHitWallSeconds: number; bossDamage: number }
export interface AttackBreakdown { parts: { name: string; mul: number }[]; total: number; rawTotal: number; targetId: number | null; targetName: string | null; note: string; time: number; mode: 'current' | 'last-hit'; crit: boolean; skillMul: number }
export interface AttackSnapshot { parts: { name: string; mul: number }[]; element: Element }
export interface PendingStrike { source: string; target: number; last: Point; releaseAt: number; kind: ToyDef['shot']['kind']; skill: boolean; snapshot: AttackSnapshot }
export interface ShotView { id: number; source: string; target: number; kind: ToyDef['shot']['kind']; from: Point; pos: Point; to: Point; elapsed: number; duration: number; arc: number; element: Element }
export interface Projectile extends ShotView { speed: number; strike: PendingStrike; done: boolean }
export interface ToyView extends BattleUnit { pos: Point; velocity: Point; targetPosition: Point | null }
export interface NmView extends Enemy { pos: Point }
export interface BattleInput { flash?: { aim: number }; homes?: Record<string, Point> }
export interface Battle {
 data: GameData; save: Save; z: number; w: number; boss: boolean; seed: number; rng: number; tick: number; time: number; accumulator: number; thickness: number; enemies: Enemy[]; units: BattleUnit[]; clones: Clone[]; nextEnemyId: number; spawned: number; nextSpawn: number; nextAdds: number; nextBossTrick: number;
 pending: PendingStrike[]; projectiles: Projectile[]; projectilePool: Projectile[]; nextProjectileId: number; firstHitSeconds: number[]; inputLog: { tick: number; homes: Record<string, Point> }[]; queuedHomes: Record<string, Point>;
 flash: { charge: number; until: number; aim: number; dps: number }; captain: { cooldown: number; until: number };
 sheep: number; creditedSheep: number; creditedKills: number; kills: number; leaks: number; shots: number; totalDamage: number; maxHit: number; blockedSeconds: number; knockdowns: number; dashes: number; recentDamage: { time: number; damage: number }[];
 events: BattleEvent[]; outcome: WaveResult | null; lastHits: Record<string, AttackBreakdown>;
}
