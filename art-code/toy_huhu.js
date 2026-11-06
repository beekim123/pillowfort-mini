// 《枕头堡》P1 美术代码：toy_huhu（呼呼：绿色小恐龙玩偶 · 暖 · 打 · 中 · L1 · 第 2 批改三套朝向）
// 返修重点：
// 1. 三套朝向（front / back / side），比例、颜色、部件风格完全统一，转过去一眼认出是同一只绿色恐龙呼呼；
//    - front：正面（宽吻部、大眼睛、小布牙、奶油色干净圆肚皮、头顶与肩背露出的暖橙黄软刺、右侧翘起的大尾巴）；
//    - back：背面（看得到后脑勺、两侧微鼓的腮帮、从头顶沿后背一直排到粗壮大尾巴的 6 颗醒目暖橙/金黄软刺）；
//    - side：侧面画朝右（恐龙吻部朝右、右侧奶油圆肚皮、左侧粗壮上翘大尾巴、头顶至尾尖完整一排软刺）；
// 2. 动作严格对齐 3.2.1 与 art-manifest-批次2.json：
//    - front: idle (1800 loop), walk (600 loop 原地踏步), cheer (900), startled (500)
//    - back / side: idle (1800 loop), walk (600 loop), attack (500, release=250 往后一仰、鼓腮、往前吐小火球), skill (1000, release=500)
// 3. 3× 下奶油色圆肚皮与脸部 0 颗粒 (noGrain: true)，干净无脏点。

import {
  PALETTE,
   sampleSuperEllipse,
  subdivideSpline,
  paintGouacheBody,
  fillGouache,
  drawGouacheStroke,
  drawShortGouacheDab,
  drawToyEye,
  drawBlush,
  drawPoolShadow,
  drawRadialGlow
} from './kit/index.js';

function drawSpikeList(ctx, spikes, seed, boil) {
  for (let i = 0; i < spikes.length; i++) {
    const item = spikes[i];
    const spPts = subdivideSpline(item.pts, true, 3);
    paintGouacheBody(ctx, spPts, item.ramp, {
      seed: seed + i * 29,
      boil,
      surfaceStrokes: 16,
      edgeStrokes: 12,
      grainAlpha: 0.20,
      fuzz: true,
      showRim: true
    });
  }
}

function makeIdleTrack(isSide = false) {
  return {
    dur: 1800,
    loop: true,
    tracks: {
      body: [
        { t: 0,    y: 0,    sx: 1.00, sy: 1.00, ease: 'smooth' },
        { t: 450,  y: -1.5, sx: 1.03, sy: 0.98, ease: 'smooth' },
        { t: 900,  y: -2.6, sx: 0.98, sy: 1.025, ease: 'smooth' },
        { t: 1350, y: -1.0, sx: 1.02, sy: 0.985, ease: 'smooth' },
        { t: 1800, y: 0,    sx: 1.00, sy: 1.00 }
      ],
      head: [
        { t: 0,    y: 0,    rot: 0,    ease: 'smooth' },
        { t: 550,  y: -1.6, rot: isSide ? -2.5 : -2.0, ease: 'smooth' },
        { t: 1150, y: -2.2, rot: isSide ? 2.2 : 2.0,   ease: 'smooth' },
        { t: 1800, y: 0,    rot: 0 }
      ],
      tail: [
        { t: 0,    rot: 0,    ease: 'smooth' },
        { t: 450,  rot: 8.5,  ease: 'smooth' },
        { t: 950,  rot: -6.5, ease: 'smooth' },
        { t: 1400, rot: 6.5,  ease: 'smooth' },
        { t: 1800, rot: 0 }
      ],
      spikes: [
        { t: 0,    y: 0,    sx: 1.00, sy: 1.00, ease: 'smooth' },
        { t: 600,  y: -1.2, sx: 1.04, sy: 1.04, ease: 'smooth' },
        { t: 1200, y: -1.8, sx: 0.98, sy: 0.98, ease: 'smooth' },
        { t: 1800, y: 0,    sx: 1.00, sy: 1.00 }
      ],
      arm_l: [
        { t: 0,    rot: 0,   ease: 'smooth' },
        { t: 600,  rot: 9.0, ease: 'smooth' },
        { t: 1200, rot: -4,  ease: 'smooth' },
        { t: 1800, rot: 0 }
      ],
      arm_r: [
        { t: 0,    rot: 0,    ease: 'smooth' },
        { t: 750,  rot: -9.0, ease: 'smooth' },
        { t: 1350, rot: 4,    ease: 'smooth' },
        { t: 1800, rot: 0 }
      ],
      cheeks: [
        { t: 0,    sx: 1.00, sy: 1.00, ease: 'smooth' },
        { t: 900,  sx: 1.06, sy: 1.05, ease: 'smooth' },
        { t: 1800, sx: 1.00, sy: 1.00 }
      ],
      blink: [
        { t: 0,    hidden: true },
        { t: 1220, hidden: false },
        { t: 1360, hidden: true },
        { t: 1800, hidden: true }
      ]
    }
  };
}

// walk（600ms 循环，原地踏步，首尾无缝）
function makeWalkTrack(isSide = false) {
  return {
    dur: 600,
    loop: true,
    tracks: {
      body: [
        { t: 0,   y: 0,    rot: 0,                sx: 1.00, sy: 1.00, ease: 'smooth' },
        { t: 150, y: -4.5, rot: isSide ? 2.5 : -3.2, sx: 0.97, sy: 1.04, ease: 'smooth' },
        { t: 300, y: 1.0,  rot: 0,                sx: 1.03, sy: 0.97, ease: 'smooth' },
        { t: 450, y: -4.5, rot: isSide ? -2.0 : 3.2, sx: 0.97, sy: 1.04, ease: 'smooth' },
        { t: 600, y: 0,    rot: 0,                sx: 1.00, sy: 1.00 }
      ],
      head: [
        { t: 0,   y: 0,    rot: 0,    ease: 'smooth' },
        { t: 150, y: -2.0, rot: 2.5,  ease: 'smooth' },
        { t: 300, y: 1.0,  rot: 0,    ease: 'smooth' },
        { t: 450, y: -2.0, rot: -2.5, ease: 'smooth' },
        { t: 600, y: 0,    rot: 0 }
      ],
      leg_l: [
        { t: 0,   x: 0,                   y: 0,    rot: 0,                   ease: 'smooth' },
        { t: 150, x: isSide ? 6.5 : 0,    y: -7.5, rot: isSide ? -24 : 12,   ease: 'smooth' },
        { t: 300, x: 0,                   y: 0,    rot: 0,                   ease: 'smooth' },
        { t: 450, x: isSide ? -5.5 : 0,   y: 1.5,  rot: isSide ? 18 : -8,    ease: 'smooth' },
        { t: 600, x: 0,                   y: 0,    rot: 0 }
      ],
      leg_r: [
        { t: 0,   x: 0,                   y: 0,    rot: 0,                   ease: 'smooth' },
        { t: 150, x: isSide ? -5.5 : 0,   y: 1.5,  rot: isSide ? 18 : 8,     ease: 'smooth' },
        { t: 300, x: 0,                   y: 0,    rot: 0,                   ease: 'smooth' },
        { t: 450, x: isSide ? 6.5 : 0,    y: -7.5, rot: isSide ? -24 : -12,  ease: 'smooth' },
        { t: 600, x: 0,                   y: 0,    rot: 0 }
      ],
      arm_l: [
        { t: 0,   rot: 0,   ease: 'smooth' },
        { t: 150, rot: -18, ease: 'smooth' },
        { t: 300, rot: 0,   ease: 'smooth' },
        { t: 450, rot: 18,  ease: 'smooth' },
        { t: 600, rot: 0 }
      ],
      arm_r: [
        { t: 0,   rot: 0,   ease: 'smooth' },
        { t: 150, rot: 18,  ease: 'smooth' },
        { t: 300, rot: 0,   ease: 'smooth' },
        { t: 450, rot: -18, ease: 'smooth' },
        { t: 600, rot: 0 }
      ],
      tail: [
        { t: 0,   rot: 0,   ease: 'smooth' },
        { t: 150, rot: 12,  ease: 'smooth' },
        { t: 300, rot: 0,   ease: 'smooth' },
        { t: 450, rot: -12, ease: 'smooth' },
        { t: 600, rot: 0 }
      ]
    }
  };
}

// attack（500ms，release=250ms）：往后一仰、鼓腮、往前吐一颗小火球
function makeAttackTrack(isSide = false) {
  return {
    dur: 500,
    loop: false,
    tracks: {
      body: [
        { t: 0,   x: 0,                  y: 0,                   rot: 0,                  sx: 1.00, sy: 1.00, ease: 'out' },
        { t: 150, x: isSide ? -6.5 : 0,  y: isSide ? 2.5 : 5.5,  rot: isSide ? -10 : 0,  sx: 1.12, sy: 0.90, ease: 'in' },
        { t: 250, x: isSide ? 8.5 : 0,   y: isSide ? -3.5 : -8.5, rot: isSide ? 11 : 0,  sx: 0.92, sy: 1.12, ease: 'out' },
        { t: 390, x: isSide ? 1.5 : 0,   y: 1.0,                 rot: 0,                  sx: 1.03, sy: 0.98, ease: 'smooth' },
        { t: 500, x: 0,                  y: 0,                   rot: 0,                  sx: 1.00, sy: 1.00 }
      ],
      head: [
        { t: 0,   x: 0,                  y: 0,                   rot: 0,                  sx: 1.00, sy: 1.00, ease: 'out' },
        { t: 150, x: isSide ? -4.0 : 0,  y: 3.5,                 rot: isSide ? -14 : -6, sx: 1.12, sy: 0.94, ease: 'in' },
        { t: 250, x: isSide ? 7.0 : 0,   y: isSide ? -3.0 : -8.5, rot: isSide ? 12 : 4,  sx: 0.94, sy: 1.10, ease: 'out' },
        { t: 500, x: 0,                  y: 0,                   rot: 0,                  sx: 1.00, sy: 1.00 }
      ],
      cheeks: [
        { t: 0,   sx: 1.00, sy: 1.00, ease: 'out' },
        { t: 150, sx: 1.34, sy: 1.28, ease: 'in' },
        { t: 250, sx: 0.86, sy: 0.86, ease: 'out' },
        { t: 500, sx: 1.00, sy: 1.00 }
      ],
      tail: [
        { t: 0,   rot: 0,   ease: 'out' },
        { t: 150, rot: -18, ease: 'in' },
        { t: 250, rot: 24,  ease: 'out' },
        { t: 500, rot: 0 }
      ],
      arm_l: [
        { t: 0,   rot: 0,   ease: 'out' },
        { t: 150, rot: -24, ease: 'in' },
        { t: 250, rot: 28,  ease: 'smooth' },
        { t: 500, rot: 0 }
      ],
      arm_r: [
        { t: 0,   rot: 0,   ease: 'out' },
        { t: 150, rot: 24,  ease: 'in' },
        { t: 250, rot: -28, ease: 'smooth' },
        { t: 500, rot: 0 }
      ]
    }
  };
}

// skill（1000ms，release=500ms）：吸一大口气肚子鼓起来，第 500ms 猛吐大火球
function makeSkillTrack(isSide = false) {
  return {
    dur: 1000,
    loop: false,
    tracks: {
      body: [
        { t: 0,    x: 0,                 y: 0,                    rot: 0,                  sx: 1.00, sy: 1.00, ease: 'out' },
        { t: 360,  x: isSide ? -8.0 : 0, y: 6.0,                  rot: isSide ? -12 : 0,   sx: 1.24, sy: 1.10, ease: 'in' },
        { t: 500,  x: isSide ? 11.0 : 0, y: isSide ? -5.0 : -11.5, rot: isSide ? 14 : 0,   sx: 0.88, sy: 1.18, ease: 'out' },
        { t: 760,  x: isSide ? 3.0 : 0,  y: -4.0,                 rot: 0,                  sx: 0.96, sy: 1.06, ease: 'smooth' },
        { t: 1000, x: 0,                 y: 0,                    rot: 0,                  sx: 1.00, sy: 1.00 }
      ],
      head: [
        { t: 0,    x: 0,                 y: 0,                    rot: 0,                  sx: 1.00, sy: 1.00, ease: 'out' },
        { t: 360,  x: isSide ? -5.0 : 0, y: 4.0,                  rot: isSide ? -16 : -10, sx: 1.16, sy: 1.08, ease: 'in' },
        { t: 500,  x: isSide ? 9.0 : 0,  y: isSide ? -4.0 : -10.0, rot: isSide ? 15 : 6,   sx: 0.92, sy: 1.14, ease: 'out' },
        { t: 780,  x: 0,                 y: -3.5,                 rot: 2.0,                sx: 0.98, sy: 1.04, ease: 'smooth' },
        { t: 1000, x: 0,                 y: 0,                    rot: 0,                  sx: 1.00, sy: 1.00 }
      ],
      cheeks: [
        { t: 0,    sx: 1.00, sy: 1.00, ease: 'out' },
        { t: 360,  sx: 1.45, sy: 1.40, ease: 'in' },
        { t: 500,  sx: 0.85, sy: 0.85, ease: 'smooth' },
        { t: 1000, sx: 1.00, sy: 1.00 }
      ],
      spikes: [
        { t: 0,    sx: 1.00, sy: 1.00, ease: 'out' },
        { t: 360,  sx: 1.18, sy: 1.20, ease: 'in' },
        { t: 540,  sx: 1.10, sy: 1.12, ease: 'smooth' },
        { t: 1000, sx: 1.00, sy: 1.00 }
      ],
      tail: [
        { t: 0,    rot: 0,   ease: 'out' },
        { t: 360,  rot: -24, ease: 'in' },
        { t: 500,  rot: 28,  ease: 'out' },
        { t: 800,  rot: 12,  ease: 'smooth' },
        { t: 1000, rot: 0 }
      ],
      arm_l: [
        { t: 0,    rot: 0,   ease: 'out' },
        { t: 360,  rot: -32, ease: 'in' },
        { t: 500,  rot: 35,  ease: 'smooth' },
        { t: 1000, rot: 0 }
      ],
      arm_r: [
        { t: 0,    rot: 0,   ease: 'out' },
        { t: 360,  rot: 32,  ease: 'in' },
        { t: 500,  rot: -35, ease: 'smooth' },
        { t: 1000, rot: 0 }
      ]
    }
  };
}

export default {
  key: 'toy_huhu',
  level: 'L1',
  size: [140, 150],
  anchor: [70, 138],
  display: [112, 120],
  sizeRange: [80, 180],
  stance: '打',
  range: '中',
  boil: 3,
  facings: ['front', 'back', 'side'],

  muzzle: {
    front: [66, 55],
    back: [70, 28],
    side: [106, 48]
  },
  release: {
    attack: 250,
    skill: 500
  },

  parts: {
    front: [
      { id: 'shadow',  parent: null,   rect: [22, 122, 96, 26],  pivot: [70, 138], boil: false },
      { id: 'tail',    parent: 'body', rect: [74, 62, 58, 68],   pivot: [84, 108] },
      { id: 'spikes',  parent: 'body', rect: [24, 8, 92, 98],    pivot: [66, 68] },
      { id: 'leg_l',   parent: 'body', rect: [32, 110, 32, 32],  pivot: [48, 118] },
      { id: 'leg_r',   parent: 'body', rect: [68, 110, 32, 32],  pivot: [82, 118] },
      { id: 'body',    parent: null,   rect: [30, 52, 74, 78],   pivot: [66, 122] },
      { id: 'arm_l',   parent: 'body', rect: [20, 68, 28, 30],   pivot: [40, 78] },
      { id: 'arm_r',   parent: 'body', rect: [80, 68, 28, 30],   pivot: [88, 78] },
      { id: 'head',    parent: 'body', rect: [24, 14, 82, 58],   pivot: [65, 62] },
      { id: 'cheeks',  parent: 'head', rect: [22, 34, 86, 36],   pivot: [65, 52] },
      { id: 'blink',   parent: 'head', rect: [32, 26, 66, 28],   pivot: [65, 40], hidden: true }
    ],
    back: [
      { id: 'shadow',  parent: null,   rect: [22, 122, 96, 26],  pivot: [70, 138], boil: false },
      { id: 'leg_l',   parent: 'body', rect: [34, 110, 32, 32],  pivot: [50, 118] },
      { id: 'leg_r',   parent: 'body', rect: [74, 110, 32, 32],  pivot: [90, 118] },
      { id: 'arm_l',   parent: 'body', rect: [22, 68, 28, 30],   pivot: [42, 78] },
      { id: 'arm_r',   parent: 'body', rect: [90, 68, 28, 30],   pivot: [98, 78] },
      { id: 'body',    parent: null,   rect: [32, 52, 76, 78],   pivot: [70, 122] },
      { id: 'head',    parent: 'body', rect: [26, 14, 88, 58],   pivot: [70, 62] },
      { id: 'cheeks',  parent: 'head', rect: [22, 28, 96, 38],   pivot: [70, 48] },
      { id: 'tail',    parent: 'body', rect: [42, 76, 84, 58],   pivot: [70, 112] },
      { id: 'spikes',  parent: 'body', rect: [42, 6, 56, 116],   pivot: [70, 68] }
    ],
    side: [
      { id: 'shadow',  parent: null,   rect: [20, 122, 100, 26], pivot: [70, 138], boil: false },
      { id: 'leg_l',   parent: 'body', rect: [42, 110, 32, 32],  pivot: [58, 118] },
      { id: 'arm_l',   parent: 'body', rect: [68, 66, 30, 30],   pivot: [76, 76] },
      { id: 'tail',    parent: 'body', rect: [6, 62, 58, 68],    pivot: [52, 108] },
      { id: 'spikes',  parent: 'body', rect: [12, 8, 72, 102],   pivot: [54, 68] },
      { id: 'body',    parent: null,   rect: [34, 52, 72, 78],   pivot: [68, 122] },
      { id: 'leg_r',   parent: 'body', rect: [56, 110, 32, 32],  pivot: [72, 118] },
      { id: 'head',    parent: 'body', rect: [34, 14, 80, 58],   pivot: [68, 62] },
      { id: 'cheeks',  parent: 'head', rect: [56, 34, 58, 36],   pivot: [82, 52] },
      { id: 'arm_r',   parent: 'body', rect: [64, 70, 32, 30],   pivot: [74, 80] },
      { id: 'blink',   parent: 'head', rect: [62, 26, 36, 28],   pivot: [78, 38], hidden: true }
    ]
  },

  drawPart(ctx, id, opt = {}) {
    const facing = opt.facing || 'front';
    const seed = opt.seed || 202;
    const boil = opt.boil || 0;
    const moss = PALETTE.ramps.moss;
    const cream = PALETTE.ramps.cream;
    const orange = PALETTE.ramps.orange;
    const gold = PALETTE.ramps.gold;

    if (id === 'shadow') {
      drawPoolShadow(ctx, 70, 135, 39, 9, { seed, boil: 0, alpha: 0.56 });
      return;
    }

    // ─── BACK 背面朝向 ───
    if (facing === 'back') {
      switch (id) {
        case 'leg_l':
        case 'leg_r': {
          const isL = id === 'leg_l';
          const cx = isL ? 50 : 90;
          const cy = 126;
          const legPts = subdivideSpline([
            { x: cx - 10, y: cy - 11 },
            { x: cx + 10, y: cy - 11 },
            { x: cx + 11, y: cy + 8 },
            { x: cx, y: cy + 11 },
            { x: cx - 11, y: cy + 8 }
          ], true, 3);
          paintGouacheBody(ctx, legPts, moss, {
            seed: seed + (isL ? 301 : 319),
            boil,
            surfaceStrokes: 24,
            edgeStrokes: 18,
            grainAlpha: 0.22,
            fuzz: true,
            showRim: !isL
          });
          break;
        }
        case 'arm_l':
        case 'arm_r': {
          const isL = id === 'arm_l';
          const dir = isL ? -1 : 1;
          const rx = isL ? 42 : 98;
          const ry = 78;
          const armPts = subdivideSpline([
            { x: rx, y: ry - 6 },
            { x: rx + dir * 12, y: ry - 2 },
            { x: rx + dir * 14, y: ry + 8 },
            { x: rx + dir * 7, y: ry + 13 },
            { x: rx - dir * 1, y: ry + 8 }
          ], true, 3);
          paintGouacheBody(ctx, armPts, moss, {
            seed: seed + (isL ? 501 : 521),
            boil,
            surfaceStrokes: 20,
            edgeStrokes: 16,
            grainAlpha: 0.20,
            fuzz: true,
            showRim: !isL
          });
          break;
        }
        case 'body': {
          const torsoPts = subdivideSpline([
            { x: 54, y: 55 },
            { x: 86, y: 55 },
            { x: 96, y: 76 },
            { x: 99, y: 100 },
            { x: 88, y: 122 },
            { x: 70, y: 126 },
            { x: 52, y: 122 },
            { x: 41, y: 100 },
            { x: 44, y: 76 }
          ], true, 4);
          paintGouacheBody(ctx, torsoPts, moss, {
            seed: seed + 401,
            boil,
            surfaceStrokes: 52,
            edgeStrokes: 38,
            grainAlpha: 0.24,
            fuzz: true,
            stitches: true,
            showRim: true
          });
          break;
        }
        case 'head': {
          // 恐龙后脑勺（两侧微露圆润腮帮，顶上在吐火球时微见暖火光晕）
          const headPts = subdivideSpline([
            { x: 70, y: 18 },
            { x: 92, y: 24 },
            { x: 100, y: 44 },
            { x: 94, y: 60 },
            { x: 70, y: 64 },
            { x: 46, y: 60 },
            { x: 40, y: 44 },
            { x: 48, y: 24 }
          ], true, 4);
          paintGouacheBody(ctx, headPts, moss, {
            seed: seed + 601,
            boil,
            surfaceStrokes: 48,
            edgeStrokes: 34,
            grainAlpha: 0.22,
            fuzz: true,
            stitches: true,
            showRim: true
          });
          break;
        }
        case 'cheeks': {
          // 背面看得到的两侧鼓腮边缘 + 头顶前方微透的火光晕
          drawBlush(ctx, 41, 48, 6.5, 4.5, { angle: -0.2, seed: seed + 701, boil, alpha: 0.45 });
          drawBlush(ctx, 99, 48, 6.5, 4.5, { angle: 0.2, seed: seed + 709, boil, alpha: 0.45 });
          drawRadialGlow(ctx, 70, 26, 13, PALETTE.elements.warm[1], 0.30);
          break;
        }
        case 'tail': {
          // 背面正下方延伸向右上翘起的粗壮恐龙大尾巴
          const tailPts = subdivideSpline([
            { x: 58, y: 108 },
            { x: 82, y: 104 },
            { x: 106, y: 92 },
            { x: 120, y: 80 },
            { x: 116, y: 102 },
            { x: 96, y: 122 },
            { x: 68, y: 126 },
            { x: 54, y: 118 }
          ], true, 4);
          paintGouacheBody(ctx, tailPts, moss, {
            seed: seed + 101,
            boil,
            surfaceStrokes: 38,
            edgeStrokes: 28,
            grainAlpha: 0.22,
            fuzz: true,
            showRim: true
          });
          break;
        }
        case 'spikes': {
          // 背面核心特征：从头顶沿后背正中一直排到尾巴的 6 颗醒目圆润软刺！
          drawSpikeList(ctx, [
            { pts: [{ x: 61, y: 24 }, { x: 70, y: 9 },  { x: 79, y: 24 }], ramp: gold },
            { pts: [{ x: 60, y: 40 }, { x: 70, y: 24 }, { x: 80, y: 40 }], ramp: orange },
            { pts: [{ x: 59, y: 60 }, { x: 70, y: 43 }, { x: 81, y: 60 }], ramp: gold },
            { pts: [{ x: 60, y: 80 }, { x: 71, y: 63 }, { x: 82, y: 80 }], ramp: orange },
            { pts: [{ x: 65, y: 99 }, { x: 78, y: 83 }, { x: 86, y: 98 }], ramp: gold },
            { pts: [{ x: 82, y: 106 }, { x: 96, y: 91 }, { x: 101, y: 104 }], ramp: orange }
          ], seed + 201, boil);
          break;
        }
      }
      return;
    }

    // ─── SIDE 侧面朝向（画朝右） ───
    if (facing === 'side') {
      switch (id) {
        case 'leg_l':
        case 'leg_r': {
          const isBackLeg = id === 'leg_l';
          const cx = isBackLeg ? 58 : 72;
          const cy = 126;
          const legPts = subdivideSpline([
            { x: cx - 9, y: cy - 11 },
            { x: cx + 9, y: cy - 11 },
            { x: cx + 12, y: cy + 6 },
            { x: cx + 7, y: cy + 11 },
            { x: cx - 7, y: cy + 11 },
            { x: cx - 10, y: cy + 5 }
          ], true, 3);
          paintGouacheBody(ctx, legPts, moss, {
            seed: seed + (isBackLeg ? 301 : 319),
            boil,
            surfaceStrokes: 24,
            edgeStrokes: 18,
            grainAlpha: 0.20,
            fuzz: true,
            showRim: !isBackLeg
          });
          // 朝右的 2 颗奶油脚趾爪
          for (let c = 0; c < 2; c++) {
            const clawPts = sampleSuperEllipse(cx + 6 + c * 4.5, cy + 9.0, 2.8, 3.0, 12, 2.0);
            fillGouache(ctx, clawPts, cream, { seed: seed + 340 + c * 7, boil });
          }
          break;
        }
        case 'tail': {
          // 侧面往左上方翘起的粗壮恐龙大尾巴
          const tailPts = subdivideSpline([
            { x: 56, y: 100 },
            { x: 36, y: 92 },
            { x: 18, y: 78 },
            { x: 10, y: 66 },
            { x: 14, y: 88 },
            { x: 28, y: 108 },
            { x: 46, y: 120 },
            { x: 60, y: 116 }
          ], true, 4);
          paintGouacheBody(ctx, tailPts, moss, {
            seed: seed + 101,
            boil,
            surfaceStrokes: 38,
            edgeStrokes: 28,
            grainAlpha: 0.22,
            fuzz: true,
            showRim: false
          });
          break;
        }
        case 'spikes': {
          // 侧面从头顶沿左后背一直排到左尾尖的 6 颗软刺
          drawSpikeList(ctx, [
            { pts: [{ x: 58, y: 20 }, { x: 50, y: 9 },  { x: 68, y: 18 }], ramp: gold },
            { pts: [{ x: 48, y: 31 }, { x: 35, y: 21 }, { x: 53, y: 24 }], ramp: orange },
            { pts: [{ x: 43, y: 50 }, { x: 28, y: 43 }, { x: 45, y: 39 }], ramp: gold },
            { pts: [{ x: 41, y: 71 }, { x: 25, y: 66 }, { x: 42, y: 58 }], ramp: orange },
            { pts: [{ x: 42, y: 91 }, { x: 26, y: 86 }, { x: 44, y: 80 }], ramp: gold },
            { pts: [{ x: 30, y: 92 }, { x: 19, y: 77 }, { x: 38, y: 88 }], ramp: orange }
          ], seed + 201, boil);
          break;
        }
        case 'body': {
          // 侧面直立梨形恐龙躯干（右侧凸出奶油色圆肚皮，0 颗粒）
          const torsoPts = subdivideSpline([
            { x: 54, y: 55 },
            { x: 82, y: 56 },
            { x: 96, y: 76 },
            { x: 98, y: 100 },
            { x: 86, y: 121 },
            { x: 66, y: 125 },
            { x: 46, y: 120 },
            { x: 40, y: 96 },
            { x: 44, y: 74 }
          ], true, 4);
          paintGouacheBody(ctx, torsoPts, moss, {
            seed: seed + 401,
            boil,
            surfaceStrokes: 50,
            edgeStrokes: 36,
            grainAlpha: 0.22,
            fuzz: true,
            stitches: true,
            showRim: true
          });

          // 右前侧奶油色圆肚皮（noGrain: true 保持绝对干净）
          const bellyPts = subdivideSpline([
            { x: 74, y: 65 },
            { x: 88, y: 68 },
            { x: 97, y: 88 },
            { x: 94, y: 111 },
            { x: 78, y: 119 },
            { x: 68, y: 104 },
            { x: 68, y: 82 }
          ], true, 4);
          paintGouacheBody(ctx, bellyPts, cream, {
            seed: seed + 433,
            boil,
            surfaceStrokes: 26,
            edgeStrokes: 20,
            noGrain: true,
            grainAlpha: 0,
            showRim: false,
            highlightColor: '#FFFDF8'
          });

          for (const by of [80, 94, 107]) {
            drawGouacheStroke(ctx, [
              { x: 74, y: by },
              { x: 85, y: by + 1.5 },
              { x: 94, y: by - 0.5 }
            ], {
              color: cream[2],
              alpha: 0.60,
              maxWeight: 2.1,
              minWeight: 0.8,
              seed: seed + by * 7,
              boil,
              dryFeibai: true
            });
          }
          break;
        }
        case 'arm_l':
        case 'arm_r': {
          const isBackArm = id === 'arm_l';
          const rx = isBackArm ? 78 : 74;
          const ry = isBackArm ? 76 : 80;
          const armPts = subdivideSpline([
            { x: rx - 4, y: ry - 6 },
            { x: rx + 12, y: ry - 3 },
            { x: rx + 16, y: ry + 6 },
            { x: rx + 8, y: ry + 12 },
            { x: rx - 4, y: ry + 7 }
          ], true, 3);
          paintGouacheBody(ctx, armPts, moss, {
            seed: seed + (isBackArm ? 501 : 521),
            boil,
            surfaceStrokes: 22,
            edgeStrokes: 16,
            grainAlpha: 0.18,
            fuzz: true,
            showRim: true
          });
          for (let k = 0; k < 2; k++) {
            drawShortGouacheDab(ctx, rx + 14 - k * 2, ry + 5 + k * 3.5, 4.5, 2.3, 0.4, cream[0], 0.88, {
              seed: seed + 540 + k * 11,
              boil
            });
          }
          break;
        }
        case 'head': {
          // 侧面朝右的恐龙脑袋（饱满额头 + 往右探出的宽吻部 + 右侧大眼睛 + 鼻孔 + 小白牙）
          const headPts = subdivideSpline([
            { x: 64, y: 18 },
            { x: 86, y: 22 },
            { x: 96, y: 34 },
            { x: 109, y: 41 }, // 朝右突出的恐龙吻部上沿
            { x: 108, y: 55 }, // 吻部前端
            { x: 92, y: 63 },  // 下颌
            { x: 64, y: 64 },
            { x: 45, y: 56 },
            { x: 42, y: 38 },
            { x: 48, y: 23 }
          ], true, 4);
          paintGouacheBody(ctx, headPts, moss, {
            seed: seed + 601,
            boil,
            surfaceStrokes: 48,
            edgeStrokes: 34,
            grainAlpha: 0.18,
            fuzz: true,
            stitches: true,
            showRim: true
          });

          drawToyEye(ctx, 76, 37, 8.2, {
            seed: seed + 631,
            boil,
            gazeX: 0.28,
            gazeY: -0.08,
            starScale: 1.08,
            lidColor: moss[2]
          });

          // 侧面右吻部鼻孔
          ctx.fillStyle = moss[3];
          ctx.beginPath();
          ctx.ellipse(100, 44.5, 2.3, 1.6, 0.2, 0, Math.PI * 2);
          ctx.fill();

          // 侧面微笑嘴线 + 小白牙
          drawGouacheStroke(ctx, [
            { x: 78, y: 53 },
            { x: 92, y: 55.5 },
            { x: 106, y: 52.5 }
          ], {
            color: PALETTE.faceInk,
            alpha: 0.86,
            maxWeight: 2.2,
            minWeight: 0.9,
            seed: seed + 659,
            boil
          });
          ctx.fillStyle = '#FFFDF8';
          ctx.beginPath();
          ctx.moveTo(92, 55);
          ctx.lineTo(95, 59.5);
          ctx.lineTo(98, 55);
          ctx.closePath();
          ctx.fill();
          break;
        }
        case 'cheeks': {
          drawBlush(ctx, 74, 50, 8.2, 5.0, { angle: 0.08, seed: seed + 701, boil, alpha: 0.56 });
          drawRadialGlow(ctx, 104, 50, 12, PALETTE.elements.warm[1], 0.28);
          break;
        }
        case 'blink': {
          const lidPts = sampleSuperEllipse(76, 37, 8.6, 8.6, 18, 2.0);
          fillGouache(ctx, lidPts, moss, { seed: seed + 76, boil });
          drawGouacheStroke(ctx, [
            { x: 68, y: 37 },
            { x: 76, y: 41 },
            { x: 84, y: 37 }
          ], {
            color: PALETTE.faceInk,
            alpha: 0.9,
            maxWeight: 2.4,
            minWeight: 0.9,
            seed: seed + 95,
            boil
          });
          break;
        }
      }
      return;
    }

    // ─── FRONT 正面朝向 ───
    switch (id) {
      case 'tail': {
        const tailPts = subdivideSpline([
          { x: 78, y: 102 },
          { x: 96, y: 96 },
          { x: 112, y: 82 },
          { x: 122, y: 68 },
          { x: 120, y: 88 },
          { x: 108, y: 108 },
          { x: 92, y: 120 },
          { x: 76, y: 118 }
        ], true, 4);

        paintGouacheBody(ctx, tailPts, moss, {
          seed: seed + 101,
          boil,
          surfaceStrokes: 36,
          edgeStrokes: 26,
          grainAlpha: 0.22,
          fuzz: true,
          showRim: true
        });

        drawSpikeList(ctx, [
          { pts: [{ x: 92, y: 98 }, { x: 98, y: 83 }, { x: 106, y: 90 }], ramp: orange },
          { pts: [{ x: 106, y: 89 }, { x: 113, y: 74 }, { x: 118, y: 81 }], ramp: orange }
        ], seed + 131, boil);
        break;
      }

      case 'spikes': {
        drawSpikeList(ctx, [
          { pts: [{ x: 56, y: 22 }, { x: 64, y: 10 }, { x: 73, y: 21 }], ramp: gold },
          { pts: [{ x: 68, y: 24 }, { x: 83, y: 13 }, { x: 84, y: 31 }], ramp: orange },
          { pts: [{ x: 78, y: 44 }, { x: 95, y: 38 }, { x: 88, y: 56 }], ramp: orange },
          { pts: [{ x: 82, y: 64 }, { x: 100, y: 61 }, { x: 90, y: 79 }], ramp: gold }
        ], seed + 201, boil);
        break;
      }

      case 'leg_l':
      case 'leg_r': {
        const isL = id === 'leg_l';
        const cx = isL ? 48 : 82;
        const cy = 126;
        const legPts = subdivideSpline([
          { x: cx - 10, y: cy - 11 },
          { x: cx + 10, y: cy - 11 },
          { x: cx + 12, y: cy + 6 },
          { x: cx + 5, y: cy + 11 },
          { x: cx - 7, y: cy + 11 },
          { x: cx - 12, y: cy + 5 }
        ], true, 3);

        paintGouacheBody(ctx, legPts, moss, {
          seed: seed + (isL ? 301 : 319),
          boil,
          surfaceStrokes: 24,
          edgeStrokes: 18,
          grainAlpha: 0.20,
          fuzz: true,
          showRim: !isL
        });

        for (let c = -1; c <= 1; c++) {
          const clawPts = sampleSuperEllipse(cx + c * 5.2, cy + 9.2, 2.6, 3.2, 12, 2.0);
          fillGouache(ctx, clawPts, cream, { seed: seed + 340 + c * 7, boil });
        }
        break;
      }

      case 'body': {
        const torsoPts = subdivideSpline([
          { x: 52, y: 55 },
          { x: 78, y: 55 },
          { x: 89, y: 74 },
          { x: 94, y: 98 },
          { x: 84, y: 121 },
          { x: 65, y: 125 },
          { x: 46, y: 121 },
          { x: 37, y: 96 },
          { x: 42, y: 74 }
        ], true, 4);

        paintGouacheBody(ctx, torsoPts, moss, {
          seed: seed + 401,
          boil,
          boilAmp: 0.92,
          surfaceStrokes: 50,
          edgeStrokes: 36,
          grainAlpha: 0.22,
          fuzz: true,
          stitches: true,
          showRim: true
        });

        // 奶油色恐龙圆肚皮（noGrain: true，3× 下绝对干净、无任何脏点！）
        const bellyPts = subdivideSpline([
          { x: 54, y: 66 },
          { x: 74, y: 66 },
          { x: 83, y: 86 },
          { x: 82, y: 111 },
          { x: 64, y: 119 },
          { x: 47, y: 111 },
          { x: 46, y: 86 }
        ], true, 4);

        paintGouacheBody(ctx, bellyPts, cream, {
          seed: seed + 433,
          boil,
          boilAmp: 0.68,
          surfaceStrokes: 28,
          edgeStrokes: 22,
          noGrain: true,
          grainAlpha: 0,
          showRim: false,
          highlightColor: '#FFFDF8'
        });

        for (const by of [80, 94, 107]) {
          const w = by === 94 ? 13 : 10;
          drawGouacheStroke(ctx, [
            { x: 64 - w, y: by - 1 },
            { x: 64, y: by + 1.8 },
            { x: 64 + w, y: by - 1 }
          ], {
            color: cream[2],
            alpha: 0.60,
            maxWeight: 2.2,
            minWeight: 0.8,
            seed: seed + by * 7,
            boil,
            dryFeibai: true
          });
        }
        break;
      }

      case 'arm_l':
      case 'arm_r': {
        const isL = id === 'arm_l';
        const dir = isL ? -1 : 1;
        const rx = isL ? 41 : 88;
        const ry = 78;
        const armPts = subdivideSpline([
          { x: rx, y: ry - 6 },
          { x: rx + dir * 12, y: ry - 2 },
          { x: rx + dir * 15, y: ry + 8 },
          { x: rx + dir * 8, y: ry + 14 },
          { x: rx - dir * 1, y: ry + 8 }
        ], true, 3);

        paintGouacheBody(ctx, armPts, moss, {
          seed: seed + (isL ? 501 : 521),
          boil,
          surfaceStrokes: 22,
          edgeStrokes: 16,
          grainAlpha: 0.18,
          fuzz: true,
          showRim: !isL
        });

        for (let k = 0; k < 2; k++) {
          drawShortGouacheDab(
            ctx,
            rx + dir * (12.5 - k * 2.5),
            ry + 8 + k * 3.5,
            4.5,
            2.4,
            dir * 0.5,
            cream[0],
            0.88,
            { seed: seed + 540 + k * 11, boil }
          );
        }
        break;
      }

      case 'head': {
        const headPts = subdivideSpline([
          { x: 64, y: 19 },
          { x: 84, y: 23 },
          { x: 92, y: 37 },
          { x: 97, y: 50 },
          { x: 86, y: 63 },
          { x: 64, y: 66 },
          { x: 42, y: 63 },
          { x: 31, y: 50 },
          { x: 36, y: 37 },
          { x: 44, y: 23 }
        ], true, 4);

        paintGouacheBody(ctx, headPts, moss, {
          seed: seed + 601,
          boil,
          boilAmp: 0.88,
          surfaceStrokes: 48,
          edgeStrokes: 34,
          grainAlpha: 0.18,
          fuzz: true,
          stitches: true,
          showRim: true
        });

        const snoutArc = [
          { x: 48, y: 48 },
          { x: 64, y: 44 },
          { x: 80, y: 48 }
        ];
        drawGouacheStroke(ctx, snoutArc, {
          color: moss[0],
          alpha: 0.58,
          maxWeight: 5.5,
          minWeight: 1.8,
          seed: seed + 619,
          boil,
          dryFeibai: true
        });

        drawToyEye(ctx, 49, 38, 8.2, {
          seed: seed + 631,
          boil,
          gazeX: 0.12,
          gazeY: -0.12,
          starScale: 1.08,
          lidColor: moss[2]
        });
        drawToyEye(ctx, 79, 38, 8.2, {
          seed: seed + 641,
          boil,
          gazeX: -0.12,
          gazeY: -0.12,
          starScale: 1.08,
          lidColor: moss[2]
        });

        ctx.fillStyle = moss[3];
        ctx.beginPath();
        ctx.ellipse(58, 49.5, 2.2, 1.5, -0.3, 0, Math.PI * 2);
        ctx.ellipse(70, 49.5, 2.2, 1.5, 0.3, 0, Math.PI * 2);
        ctx.fill();

        drawGouacheStroke(ctx, [
          { x: 48, y: 55.5 },
          { x: 56, y: 58.5 },
          { x: 64, y: 56.5 },
          { x: 72, y: 58.5 },
          { x: 80, y: 55.5 }
        ], {
          color: PALETTE.faceInk,
          alpha: 0.86,
          maxWeight: 2.2,
          minWeight: 0.9,
          seed: seed + 659,
          boil
        });

        ctx.fillStyle = '#FFFDF8';
        ctx.beginPath();
        ctx.moveTo(52, 57);
        ctx.lineTo(54.8, 61.5);
        ctx.lineTo(57.5, 57.5);
        ctx.closePath();
        ctx.fill();
        break;
      }

      case 'cheeks': {
        drawBlush(ctx, 39, 51, 8.5, 5.2, { angle: -0.12, seed: seed + 701, boil, alpha: 0.58 });
        drawBlush(ctx, 89, 51, 8.5, 5.2, { angle: 0.12, seed: seed + 709, boil, alpha: 0.58 });
        drawRadialGlow(ctx, 64, 56, 12, PALETTE.elements.warm[1], 0.28);
        break;
      }

      case 'blink': {
        for (const ex of [49, 79]) {
          const lidPts = sampleSuperEllipse(ex, 38, 8.6, 8.6, 18, 2.0);
          fillGouache(ctx, lidPts, moss, { seed: seed + ex, boil });
          drawGouacheStroke(ctx, [
            { x: ex - 8, y: 38 },
            { x: ex, y: 42 },
            { x: ex + 8, y: 38 }
          ], {
            color: PALETTE.faceInk,
            alpha: 0.9,
            maxWeight: 2.4,
            minWeight: 0.9,
            seed: seed + ex + 19,
            boil
          });
        }
        break;
      }
    }
  },

  anims: {
    front: {
      idle: makeIdleTrack(false),
      walk: makeWalkTrack(false),
      cheer: {
        dur: 900,
        loop: false,
        tracks: {
          body: [
            { t: 0,   y: 0,     sx: 1.00, sy: 1.00, ease: 'in' },
            { t: 100, y: 4.0,   sx: 1.10, sy: 0.90, ease: 'out' },
            { t: 250, y: -14.0, sx: 0.92, sy: 1.10, ease: 'in' },
            { t: 430, y: 3.5,   sx: 1.10, sy: 0.90, ease: 'out' },
            { t: 600, y: -15.0, sx: 0.92, sy: 1.10, ease: 'in' },
            { t: 770, y: 2.5,   sx: 1.05, sy: 0.95, ease: 'smooth' },
            { t: 900, y: 0,     sx: 1.00, sy: 1.00 }
          ],
          tail: [
            { t: 0,   rot: 0,   ease: 'out' },
            { t: 250, rot: 24,  ease: 'in' },
            { t: 450, rot: -18, ease: 'out' },
            { t: 620, rot: 26,  ease: 'in' },
            { t: 900, rot: 0 }
          ],
          arm_l: [
            { t: 0,   rot: 0,  ease: 'out' },
            { t: 250, rot: 42, ease: 'in' },
            { t: 430, rot: 12, ease: 'out' },
            { t: 600, rot: 45, ease: 'in' },
            { t: 900, rot: 0 }
          ],
          arm_r: [
            { t: 0,   rot: 0,   ease: 'out' },
            { t: 250, rot: -42, ease: 'in' },
            { t: 430, rot: -12, ease: 'out' },
            { t: 600, rot: -45, ease: 'in' },
            { t: 900, rot: 0 }
          ]
        }
      },
      startled: {
        dur: 500,
        loop: false,
        tracks: {
          body: [
            { t: 0,   x: 0,    y: 0,    sx: 1.00, sy: 1.00, ease: 'out' },
            { t: 90,  x: 0,    y: -9.5, sx: 0.86, sy: 1.18, ease: 'in' },
            { t: 170, x: -4.5, y: 5.5,  sx: 1.16, sy: 0.85, ease: 'linear' },
            { t: 230, x: 4.5,  y: 6.0,  sx: 1.14, sy: 0.86, ease: 'linear' },
            { t: 290, x: -3.5, y: 5.0,  sx: 1.12, sy: 0.88, ease: 'linear' },
            { t: 360, x: 2.5,  y: 3.0,  sx: 1.06, sy: 0.94, ease: 'smooth' },
            { t: 500, x: 0,    y: 0,    sx: 1.00, sy: 1.00 }
          ],
          head: [
            { t: 0,   y: 0,    rot: 0,    sx: 1.00, sy: 1.00, ease: 'out' },
            { t: 90,  y: -5.0, rot: -8.0, sx: 1.12, sy: 1.14, ease: 'in' },
            { t: 180, y: 4.5,  rot: 6.0,  sx: 1.08, sy: 0.92, ease: 'linear' },
            { t: 260, y: 4.0,  rot: -5.0, sx: 1.06, sy: 0.94, ease: 'smooth' },
            { t: 500, y: 0,    rot: 0,    sx: 1.00, sy: 1.00 }
          ],
          spikes: [
            { t: 0,   sx: 1.00, sy: 1.00, ease: 'out' },
            { t: 100, sx: 1.22, sy: 1.25, ease: 'smooth' },
            { t: 320, sx: 1.10, sy: 1.12, ease: 'smooth' },
            { t: 500, sx: 1.00, sy: 1.00 }
          ],
          tail: [
            { t: 0,   rot: 0,   ease: 'out' },
            { t: 90,  rot: 32,  ease: 'in' },
            { t: 220, rot: -18, ease: 'smooth' },
            { t: 500, rot: 0 }
          ],
          arm_l: [
            { t: 0,   rot: 0,  ease: 'out' },
            { t: 90,  rot: 52, ease: 'in' },
            { t: 280, rot: 35, ease: 'smooth' },
            { t: 500, rot: 0 }
          ],
          arm_r: [
            { t: 0,   rot: 0,   ease: 'out' },
            { t: 90,  rot: -52, ease: 'in' },
            { t: 280, rot: -35, ease: 'smooth' },
            { t: 500, rot: 0 }
          ]
        }
      }
    },
    back: {
      idle: makeIdleTrack(false),
      walk: makeWalkTrack(false),
      attack: makeAttackTrack(false),
      skill: makeSkillTrack(false)
    },
    side: {
      idle: makeIdleTrack(true),
      walk: makeWalkTrack(true),
      attack: makeAttackTrack(true),
      skill: makeSkillTrack(true)
    }
  }
};
