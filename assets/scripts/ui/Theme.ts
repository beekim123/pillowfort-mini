/** Presentation constants only. Battle and economy balance come exclusively from core data. */
export { COLORS, ELEMENT, UNIT_COLOR } from './Draw';
export const THEME = { designWidth: 750, designHeight: 1334, maxPanelHeight: 700, bodySize: 24, numberSize: 22, titleSize: 30, tapHeight: 56, hitFeedbackSeconds: 0.18, projectileSeconds: 0.2, damageFloatSeconds: 0.8, cottonFlightSeconds: 1.1, toastSeconds: 1.8, damageLimit: 6, sheepLimit: 12, enemyLimit: 40, effectLimit: 150, holdSeconds: 0.55, repeatDelay: 0.45, dragThreshold: 18, tapDebounce: 0.2, dropSlop: 12, chainSeconds: 0.22, circleSegments: 72, wallWidth: 18, captainLabelLift: 94, walkFrequency: 13, walkBob: 4, homeColor: '#a1ccec', rangeColor: '#79b7e0ad', reachColor: '#efc36c66', auraColor: '#85d897b0',
  // 美术：颗粒强度（画笔库 setGrain，0–1；用户在画风库里看过第 2 批，先用美术给的默认 1）、出图分帧每帧最多几毫秒、有背景图时窝的地面和墙的颜色
  artGrain: 1, artSliceMs: 8, artGround: '#9aa6c038', artWall: '#fff1d680' } as const;
