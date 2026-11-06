/** Renderer-neutral, block-only presentation. All coordinates use a top-left origin. */
export type Layer = 0 | 1 | 2 | 3 | 4;
export type DrawCommand =
  | { kind: 'rect'; x: number; y: number; w: number; h: number; color: string; layer: Layer }
  | { kind: 'line'; x: number; y: number; x2: number; y2: number; width: number; color: string; layer: Layer }
  | { kind: 'poly'; points: [number, number][]; color: string; layer: Layer }
  | { kind: 'text'; text: string; x: number; y: number; width: number; size: number; color: string; align: 'left' | 'center' | 'right'; layer: Layer };
export interface HitRegion {
  id: string; x: number; y: number; w: number; h: number;
  action: string; value?: string | number; repeat?: boolean; enabled?: boolean;
}
export const COLORS = {
  sky: '#172333', fog: '#3d4963', fogLight: '#52617b', ink: '#273247', muted: '#647087',
  cream: '#f6eedc', panel: '#fff9ee', white: '#ffffff', yellow: '#f4ce73', lilac: '#c8b0e7',
  blue: '#88bdd7', green: '#9bc7a3', red: '#e89493', bed: '#77869c', pad: '#b4bfd0',
  disabled: '#c7c9cb', warm: '#e8a071', cool: '#7bc0de', electric: '#cfb0eb', stink: '#a7bb76',
};
export const ELEMENT: Record<string, string> = { '枕': COLORS.cream, '暖': COLORS.warm, '凉': COLORS.cool, '电': COLORS.electric, '臭': COLORS.stink };
export const UNIT_COLOR = ['#ffffff', '#75d68b', '#7dbaf0', '#cf9ded', '#ffb269', '#f37d8b'];
export function wrapText(text: string, width: number, size: number): string[] {
  const lines: string[] = [];
  for (const paragraph of String(text).split('\n')) {
    let line = '', used = 0;
    for (const ch of paragraph) {
      const weight = /[\u0000-\u00ff]/.test(ch) ? 0.56 : 1;
      if (used + weight > width / size && line) { lines.push(line); line = ''; used = 0; }
      line += ch; used += weight;
    }
    lines.push(line);
  }
  return lines;
}
export function contains(r: HitRegion, x: number, y: number): boolean { return x >= r.x && y >= r.y && x <= r.x + r.w && y <= r.y + r.h; }
export function timeText(seconds: number): string {
  const n = Math.max(0, Math.floor(seconds));
  if (n >= 3600) return `${Math.floor(n / 3600)}小时${Math.floor(n % 3600 / 60)}分`;
  return n >= 60 ? `${Math.floor(n / 60)}分${n % 60}秒` : `${n}秒`;
}
