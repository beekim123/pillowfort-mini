/** 美术出图代码的接口（docs/spec/美术文档.md 2.1）。模块是美术交的 JS，这里只描述游戏读到的字段。 */
export type Ctx2D = CanvasRenderingContext2D;
/** 浏览器、Cocos 的 web 平台、微信小游戏的画布都满足这几样 */
export interface CanvasLike { width: number; height: number; getContext(type: '2d'): Ctx2D | null }
export type MakeCanvas = (w: number, h: number) => CanvasLike;
/** 2D 仿射矩阵，同 Canvas setTransform(a, b, c, d, e, f)：x' = a·x + c·y + e，y' = b·x + d·y + f */
export type Mat = [number, number, number, number, number, number];

export type Facing = 'front' | 'back' | 'side';
export interface DrawOpt { seed: number; boil: number; scale: number; facing?: Facing; variant?: string; frame?: number }
export interface TrackKey { t: number; x?: number; y?: number; rot?: number; sx?: number; sy?: number; alpha?: number; hidden?: boolean; ease?: string }
export interface PartDef { id: string; parent: string | null; rect: [number, number, number, number]; pivot: [number, number]; hidden?: boolean; boil?: boolean }
export interface AnimDef { dur: number; loop?: boolean; tracks?: Record<string, TrackKey[]> }
export interface L1Module {
  key: string; level: 'L1'; size: [number, number]; anchor: [number, number]; display?: [number, number]; boil?: number;
  facings?: Facing[];
  /** 新写法按朝向分组；老写法是数组（当作只有 front） */
  parts: PartDef[] | Partial<Record<Facing, PartDef[]>>;
  anims: Record<string, AnimDef> | Partial<Record<Facing, Record<string, AnimDef>>>;
  muzzle?: [number, number] | Partial<Record<Facing, [number, number]>>;
  release?: Record<string, number>;
  drawPart(ctx: Ctx2D, id: string, opt: DrawOpt): void;
}
export interface FrameAnim { frames: number; fps: number; loop?: boolean }
export interface L2Module {
  key: string; level: 'L2'; size: [number, number]; anchor: [number, number]; display?: [number, number]; boil?: number;
  variants?: string[]; anims: Record<string, FrameAnim>;
  drawFrame(ctx: Ctx2D, anim: string, index: number, opt: DrawOpt): void;
}
export interface Brush { size: [number, number]; frames?: number; draw(ctx: Ctx2D, opt: DrawOpt): void }
/** 特效配方（美术文档 2.1）：range 都是 [最小, 最大] */
export interface Recipe {
  brush: string[]; count?: [number, number]; rate?: number; life: [number, number]; speed: [number, number]; angle: [number, number];
  scale: number[]; alpha: [number, number]; tint?: string[]; blend?: 'normal' | 'add'; loop?: boolean; attach?: string; gravity?: number; spin?: number;
}
export type ShotKind = 'straight' | 'lob' | 'beam' | 'chain' | 'melee';
export interface L3Module { key: string; level: 'L3'; kind?: ShotKind; aura?: number; brushes: Record<string, Brush>; effects?: Record<string, Recipe> }
export interface BgModule { key: string; level: 'bg'; size: [number, number]; draw(ctx: Ctx2D, opt: DrawOpt): void }
export type ArtModule = L1Module | L2Module | L3Module | BgModule;

export interface ArtKit { setGrain?(k: number): void }
/** tools/bundle-art.mjs 生成的包 */
export interface ArtPackage { version: string; files: string[]; req(path: string): { default?: unknown } & Record<string, unknown> }
