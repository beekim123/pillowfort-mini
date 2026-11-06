// 《枕头堡》P1 美术代码：toy_fangfang（方方：积木小兵 · 枕头 · 挡 · 中 · L1 · 第 2 批新做）
// 规范对齐：
// 1. 三套朝向（front / back / side），转过去一眼是同一只由彩色木积木拼成的小士兵；
//    - front：正面（珊瑚红三角形屋顶积木帽 + 顶部圆木榫头、圆角方木块脸、青蓝梯形胸甲积木 + 金腰扣、左臂举彩色大积木盾 shield、右臂抓投掷积木 arm_r、两根原木圆柱腿）；
//    - back：背面（看得到屋顶帽后沿、后脑勺燕尾榫木纹、背上背着的备用彩色积木背篓、双手举大积木盾往前顶或举手扔积木）；
//    - side：侧面画朝右（朝右的积木帽与方木脸、右前方举着的大积木盾、左后侧积木背篓）；
// 2. 动作严格对齐 3.2.1 与 art-manifest-批次2.json：
//    - front: idle (1800 loop), walk (600 loop 原地踏步), cheer (900), startled (500), knocked (400 被挤倒), down (1600 loop 趴着晕乎乎), getup (700 爬起来回 idle)
//    - back / side: idle (1800 loop), walk (600 loop), attack (500, release=200 举手扔积木), skill (1000, release=500 抱起一摞积木砸出去), block (800 loop 举着大积木当盾往前顶)

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
  drawPoolShadow
} from './kit/index.js';

// 画圆角方形木积木多边形
function buildBlockRect(cx, cy, hw, hh, bevel = 5) {
  return subdivideSpline([
    { x: cx - hw + bevel, y: cy - hh },
    { x: cx + hw - bevel, y: cy - hh },
    { x: cx + hw,         y: cy - hh + bevel },
    { x: cx + hw,         y: cy + hh - bevel },
    { x: cx + hw - bevel, y: cy + hh },
    { x: cx - hw + bevel, y: cy + hh },
    { x: cx - hw,         y: cy + hh - bevel },
    { x: cx - hw,         y: cy - hh + bevel }
  ], true, 3);
}

function makeIdleTrack() {
  return {
    dur: 1800,
    loop: true,
    tracks: {
      body: [
        { t: 0,    y: 0,    sx: 1.00, sy: 1.00, ease: 'smooth' },
        { t: 450,  y: -1.4, sx: 1.02, sy: 0.985, ease: 'smooth' },
        { t: 900,  y: -2.4, sx: 0.985, sy: 1.02, ease: 'smooth' },
        { t: 1350, y: -0.9, sx: 1.015, sy: 0.99, ease: 'smooth' },
        { t: 1800, y: 0,    sx: 1.00, sy: 1.00 }
      ],
      head: [
        { t: 0,    y: 0,    rot: 0,    ease: 'smooth' },
        { t: 600,  y: -1.4, rot: -1.8, ease: 'smooth' },
        { t: 1200, y: -2.0, rot: 1.8,  ease: 'smooth' },
        { t: 1800, y: 0,    rot: 0 }
      ],
      hat: [
        { t: 0,    y: 0,    rot: 0,    ease: 'smooth' },
        { t: 500,  y: -1.8, rot: 2.2,  ease: 'smooth' },
        { t: 1100, y: -0.5, rot: -2.2, ease: 'smooth' },
        { t: 1800, y: 0,    rot: 0 }
      ],
      shield: [
        { t: 0,    y: 0,    rot: 0,   ease: 'smooth' },
        { t: 900,  y: -1.8, rot: -4,  ease: 'smooth' },
        { t: 1800, y: 0,    rot: 0 }
      ],
      arm_r: [
        { t: 0,    rot: 0,  ease: 'smooth' },
        { t: 900,  rot: 6,  ease: 'smooth' },
        { t: 1800, rot: 0 }
      ],
      blink: [
        { t: 0,    hidden: true },
        { t: 1320, hidden: false },
        { t: 1460, hidden: true },
        { t: 1800, hidden: true }
      ]
    }
  };
}

function makeWalkTrack(isSide = false) {
  return {
    dur: 600,
    loop: true,
    tracks: {
      body: [
        { t: 0,   y: 0,    rot: 0,                 sx: 1.00, sy: 1.00, ease: 'smooth' },
        { t: 150, y: -4.5, rot: isSide ? 2.5 : -3.5, sx: 0.98, sy: 1.03, ease: 'smooth' },
        { t: 300, y: 1.0,  rot: 0,                 sx: 1.03, sy: 0.97, ease: 'smooth' },
        { t: 450, y: -4.5, rot: isSide ? -2.0 : 3.5, sx: 0.98, sy: 1.03, ease: 'smooth' },
        { t: 600, y: 0,    rot: 0,                 sx: 1.00, sy: 1.00 }
      ],
      hat: [
        { t: 0,   y: 0,    rot: 0,   ease: 'smooth' },
        { t: 200, y: -3.2, rot: -4,  ease: 'smooth' },
        { t: 500, y: -3.2, rot: 4,   ease: 'smooth' },
        { t: 600, y: 0,    rot: 0 }
      ],
      leg_l: [
        { t: 0,   x: 0,                 y: 0,    rot: 0,                 ease: 'smooth' },
        { t: 150, x: isSide ? 6.5 : 0,  y: -7.5, rot: isSide ? -22 : 10, ease: 'smooth' },
        { t: 300, x: 0,                 y: 0,    rot: 0,                 ease: 'smooth' },
        { t: 450, x: isSide ? -5.5 : 0, y: 1.5,  rot: isSide ? 18 : -8,  ease: 'smooth' },
        { t: 600, x: 0,                 y: 0,    rot: 0 }
      ],
      leg_r: [
        { t: 0,   x: 0,                 y: 0,    rot: 0,                 ease: 'smooth' },
        { t: 150, x: isSide ? -5.5 : 0, y: 1.5,  rot: isSide ? 18 : 8,   ease: 'smooth' },
        { t: 300, x: 0,                 y: 0,    rot: 0,                 ease: 'smooth' },
        { t: 450, x: isSide ? 6.5 : 0,  y: -7.5, rot: isSide ? -22 : -10, ease: 'smooth' },
        { t: 600, x: 0,                 y: 0,    rot: 0 }
      ],
      shield: [
        { t: 0,   y: 0,    rot: 0,   ease: 'smooth' },
        { t: 150, y: -3.0, rot: 10,  ease: 'smooth' },
        { t: 450, y: 1.5,  rot: -10, ease: 'smooth' },
        { t: 600, y: 0,    rot: 0 }
      ],
      arm_r: [
        { t: 0,   rot: 0,   ease: 'smooth' },
        { t: 150, rot: -18, ease: 'smooth' },
        { t: 450, rot: 18,  ease: 'smooth' },
        { t: 600, rot: 0 }
      ]
    }
  };
}

// attack（500ms，release=200ms）：举起右手积木蓄力，第 200ms 扔出一块彩色积木
function makeAttackTrack(isSide = false) {
  return {
    dur: 500,
    loop: false,
    tracks: {
      body: [
        { t: 0,   x: 0,                 y: 0,    rot: 0,                 sx: 1.00, sy: 1.00, ease: 'out' },
        { t: 120, x: isSide ? -5.0 : 0, y: 4.0,  rot: isSide ? -8 : -4,  sx: 1.08, sy: 0.92, ease: 'in' },
        { t: 200, x: isSide ? 7.5 : 0,  y: -7.5, rot: isSide ? 10 : 4,   sx: 0.93, sy: 1.10, ease: 'out' },
        { t: 360, x: 0,                 y: 1.0,  rot: 0,                 sx: 1.03, sy: 0.98, ease: 'smooth' },
        { t: 500, x: 0,                 y: 0,    rot: 0,                 sx: 1.00, sy: 1.00 }
      ],
      arm_r: [
        { t: 0,   y: 0,     rot: 0,                   ease: 'out' },
        { t: 120, y: -10.0, rot: isSide ? -52 : -42,  ease: 'in' },
        { t: 200, y: -14.0, rot: isSide ? 36 : 28,    ease: 'out' },
        { t: 380, y: -2.0,  rot: 6,                   ease: 'smooth' },
        { t: 500, y: 0,     rot: 0 }
      ],
      shield: [
        { t: 0,   rot: 0,   ease: 'out' },
        { t: 120, rot: 14,  ease: 'in' },
        { t: 200, rot: -16, ease: 'smooth' },
        { t: 500, rot: 0 }
      ],
      hat: [
        { t: 0,   y: 0,    rot: 0,   ease: 'out' },
        { t: 200, y: -4.5, rot: -6,  ease: 'out' },
        { t: 500, y: 0,    rot: 0 }
      ]
    }
  };
}

// skill（1000ms，release=500ms）：双手抱起一摞积木高高举过头顶，第 500ms 猛砸出去
function makeSkillTrack(isSide = false) {
  return {
    dur: 1000,
    loop: false,
    tracks: {
      body: [
        { t: 0,    x: 0,                 y: 0,     rot: 0,                sx: 1.00, sy: 1.00, ease: 'out' },
        { t: 350,  x: isSide ? -7.0 : 0, y: 6.5,   rot: isSide ? -12 : 0, sx: 1.15, sy: 0.88, ease: 'in' },
        { t: 500,  x: isSide ? 11.0 : 0, y: -12.0, rot: isSide ? 14 : 0,  sx: 0.88, sy: 1.16, ease: 'out' },
        { t: 760,  x: 0,                 y: 2.5,   rot: 0,                sx: 1.05, sy: 0.96, ease: 'smooth' },
        { t: 1000, x: 0,                 y: 0,     rot: 0,                sx: 1.00, sy: 1.00 }
      ],
      arm_r: [
        { t: 0,    y: 0,     rot: 0,                   sx: 1.00, sy: 1.00, ease: 'out' },
        { t: 350,  y: -18.0, rot: isSide ? -65 : -55, sx: 1.25, sy: 1.25, ease: 'in' },
        { t: 500,  y: -20.0, rot: isSide ? 45 : 35,   sx: 1.15, sy: 1.15, ease: 'out' },
        { t: 1000, y: 0,     rot: 0,                  sx: 1.00, sy: 1.00 }
      ],
      shield: [
        { t: 0,    y: 0,     rot: 0,   ease: 'out' },
        { t: 350,  y: -12.0, rot: 28,  ease: 'in' },
        { t: 500,  y: -8.0,  rot: -22, ease: 'out' },
        { t: 1000, y: 0,     rot: 0 }
      ],
      hat: [
        { t: 0,    y: 0,    rot: 0,   ease: 'out' },
        { t: 350,  y: 2.0,  rot: -8,  ease: 'in' },
        { t: 500,  y: -7.5, rot: 10,  ease: 'out' },
        { t: 1000, y: 0,    rot: 0 }
      ]
    }
  };
}

// block（800ms 循环）：举着大积木当盾，身子前倾一下一下使劲往前顶！
function makeBlockTrack(isSide = false) {
  return {
    dur: 800,
    loop: true,
    tracks: {
      body: [
        { t: 0,   x: isSide ? 4.0 : 0,  y: isSide ? 1.0 : -3.5, rot: isSide ? 8 : 0,  sx: 1.04, sy: 0.96, ease: 'smooth' },
        { t: 320, x: isSide ? 10.5 : 0, y: isSide ? 3.0 : -9.5, rot: isSide ? 15 : 0, sx: 1.10, sy: 0.90, ease: 'out' },
        { t: 560, x: isSide ? 2.0 : 0,  y: isSide ? 0.5 : -1.5, rot: isSide ? 5 : 0,  sx: 1.02, sy: 0.98, ease: 'in' },
        { t: 800, x: isSide ? 4.0 : 0,  y: isSide ? 1.0 : -3.5, rot: isSide ? 8 : 0,  sx: 1.04, sy: 0.96 }
      ],
      shield: [
        { t: 0,   x: isSide ? 6.0 : 0,  y: isSide ? -4.0 : -10.0, sx: 1.10, sy: 1.10, ease: 'smooth' },
        { t: 320, x: isSide ? 13.0 : 0, y: isSide ? -6.0 : -16.5, sx: 1.18, sy: 1.18, ease: 'out' },
        { t: 560, x: isSide ? 4.5 : 0,  y: isSide ? -3.0 : -8.0,  sx: 1.08, sy: 1.08, ease: 'in' },
        { t: 800, x: isSide ? 6.0 : 0,  y: isSide ? -4.0 : -10.0, sx: 1.10, sy: 1.10 }
      ],
      head: [
        { t: 0,   y: 2.0, rot: isSide ? 6 : 0,  ease: 'smooth' },
        { t: 320, y: 4.5, rot: isSide ? 10 : 0, ease: 'out' },
        { t: 800, y: 2.0, rot: isSide ? 6 : 0 }
      ],
      leg_l: [
        { t: 0,   y: 0,    ease: 'smooth' },
        { t: 320, y: 2.5,  ease: 'out' },
        { t: 800, y: 0 }
      ],
      leg_r: [
        { t: 0,   y: 0,    ease: 'smooth' },
        { t: 320, y: -2.0, ease: 'out' },
        { t: 800, y: 0 }
      ]
    }
  };
}

export default {
  key: 'toy_fangfang',
  level: 'L1',
  size: [140, 150],
  anchor: [70, 138],
  display: [112, 120],
  sizeRange: [80, 180],
  stance: '挡',
  range: '中',
  boil: 3,
  facings: ['front', 'back', 'side'],

  muzzle: {
    front: [106, 62],
    back: [106, 56],
    side: [110, 56]
  },
  release: {
    attack: 200,
    skill: 500
  },

  parts: {
    front: [
      { id: 'shadow', parent: null,   rect: [20, 122, 100, 26], pivot: [70, 138], boil: false },
      { id: 'leg_l',  parent: 'body', rect: [36, 106, 28, 34],  pivot: [50, 114] },
      { id: 'leg_r',  parent: 'body', rect: [76, 106, 28, 34],  pivot: [90, 114] },
      { id: 'body',   parent: null,   rect: [30, 62, 80, 56],   pivot: [70, 114] },
      { id: 'head',   parent: 'body', rect: [32, 26, 76, 48],   pivot: [70, 68] },
      { id: 'hat',    parent: 'head', rect: [28, 4, 84, 34],    pivot: [70, 30] },
      { id: 'arm_r',  parent: 'body', rect: [88, 46, 42, 46],   pivot: [96, 74] },
      { id: 'shield', parent: 'body', rect: [10, 56, 46, 52],   pivot: [36, 80] },
      { id: 'blink',  parent: 'head', rect: [36, 38, 68, 24],   pivot: [70, 50], hidden: true }
    ],
    back: [
      { id: 'shadow', parent: null,   rect: [20, 122, 100, 26], pivot: [70, 138], boil: false },
      { id: 'shield', parent: 'body', rect: [14, 42, 48, 52],   pivot: [38, 74] },
      { id: 'arm_r',  parent: 'body', rect: [88, 42, 42, 48],   pivot: [96, 72] },
      { id: 'leg_l',  parent: 'body', rect: [36, 106, 28, 34],  pivot: [50, 114] },
      { id: 'leg_r',  parent: 'body', rect: [76, 106, 28, 34],  pivot: [90, 114] },
      { id: 'body',   parent: null,   rect: [30, 62, 80, 56],   pivot: [70, 114] },
      { id: 'head',   parent: 'body', rect: [32, 26, 76, 48],   pivot: [70, 68] },
      { id: 'hat',    parent: 'head', rect: [28, 4, 84, 34],    pivot: [70, 30] }
    ],
    side: [
      { id: 'shadow', parent: null,   rect: [20, 122, 100, 26], pivot: [70, 138], boil: false },
      { id: 'leg_l',  parent: 'body', rect: [42, 106, 28, 34],  pivot: [56, 114] },
      { id: 'arm_r',  parent: 'body', rect: [76, 40, 48, 46],   pivot: [82, 70] },
      { id: 'body',   parent: null,   rect: [32, 62, 72, 56],   pivot: [68, 114] },
      { id: 'leg_r',  parent: 'body', rect: [58, 106, 28, 34],  pivot: [72, 114] },
      { id: 'head',   parent: 'body', rect: [38, 26, 68, 48],   pivot: [68, 68] },
      { id: 'hat',    parent: 'head', rect: [34, 4, 76, 34],    pivot: [68, 30] },
      { id: 'shield', parent: 'body', rect: [68, 56, 52, 52],   pivot: [82, 82] },
      { id: 'blink',  parent: 'head', rect: [64, 38, 34, 24],   pivot: [80, 50], hidden: true }
    ]
  },

  drawPart(ctx, id, opt = {}) {
    const facing = opt.facing || 'front';
    const seed = opt.seed || 606;
    const boil = opt.boil || 0;
    const teal = PALETTE.ramps.teal;
    const coral = PALETTE.ramps.coral;
    const gold = PALETTE.ramps.gold;
    const wood = PALETTE.ramps.wood;
    const cream = PALETTE.ramps.cream;

    if (id === 'shadow') {
      drawPoolShadow(ctx, 70, 135, 40, 9, { seed, boil: 0, alpha: 0.56 });
      return;
    }

    if (id === 'leg_l' || id === 'leg_r') {
      const isL = id === 'leg_l';
      const cx = facing === 'side' ? (isL ? 56 : 72) : (isL ? 50 : 90);
      const cy = 123;
      const legPts = buildBlockRect(cx, cy, 8.5, 12.5, 3.5);
      paintGouacheBody(ctx, legPts, wood, {
        seed: seed + (isL ? 101 : 119),
        boil,
        surfaceStrokes: 22,
        edgeStrokes: 16,
        grainAlpha: 0.20,
        showRim: !isL
      });
      // 积木腿底端珊瑚红漆边
      drawGouacheStroke(ctx, [
        { x: cx - 7, y: cy + 9 },
        { x: cx + 7, y: cy + 9 }
      ], {
        color: coral[1],
        alpha: 0.85,
        maxWeight: 3.6,
        minWeight: 2.0,
        seed: seed + 137,
        boil
      });
      return;
    }

    if (id === 'hat') {
      const cx = facing === 'side' ? 72 : 70;
      const hw = facing === 'side' ? 30 : 34;
      // 顶部圆木榫头（积木凸起）
      const pegPts = buildBlockRect(cx, 10, 7.5, 4.5, 2.0);
      fillGouache(ctx, pegPts, gold, { seed: seed + 201, boil });

      // 珊瑚红三角屋顶积木帽
      const hatPts = subdivideSpline([
        { x: cx,      y: 11 },
        { x: cx + hw, y: 29 },
        { x: cx + hw - 3, y: 34 },
        { x: cx - hw + 3, y: 34 },
        { x: cx - hw, y: 29 }
      ], true, 3);
      paintGouacheBody(ctx, hatPts, coral, {
        seed: seed + 211,
        boil,
        surfaceStrokes: 30,
        edgeStrokes: 22,
        grainAlpha: 0.20,
        showRim: true,
        highlightColor: '#FFE0D4'
      });

      // 帽檐正中的小金星徽章（front 在中间，side 在右侧，back 为木铆钉）
      const starX = facing === 'side' ? cx + 11 : cx;
      drawShortGouacheDab(ctx, starX, 24, 7.5, 7.5, 0.78, gold[0], 0.92, {
        seed: seed + 239,
        boil
      });
      return;
    }

    if (id === 'shield') {
      // 彩色拼木大方盾（金框 + 青蓝/珊瑚红对角拼木块，一眼看懂是“挡”的积木盾）
      const cx = facing === 'side' ? 94 : (facing === 'back' ? 36 : 33);
      const cy = facing === 'back' ? 68 : 82;
      const shPts = buildBlockRect(cx, cy, 16, 19, 4.5);
      paintGouacheBody(ctx, shPts, gold, {
        seed: seed + 301,
        boil,
        surfaceStrokes: 28,
        edgeStrokes: 22,
        grainAlpha: 0.20,
        showRim: true
      });
      const inPts = buildBlockRect(cx, cy, 11.5, 14.0, 3.0);
      fillGouache(ctx, inPts, teal, { seed: seed + 319, boil });
      drawShortGouacheDab(ctx, cx, cy, 16, 7.5, -0.65, coral[1], 0.88, {
        seed: seed + 331,
        boil,
        drySplit: true
      });
      return;
    }

    if (id === 'arm_r') {
      // 右手木臂 + 手里抓着准备投掷的彩色方块积木
      const ax = facing === 'side' ? 90 : 102;
      const ay = facing === 'side' ? 66 : 70;
      const bx = facing === 'side' ? 108 : 108;
      const by = facing === 'side' ? 56 : 58;

      const armPts = buildBlockRect(ax, ay, 7.5, 10.5, 3.0);
      paintGouacheBody(ctx, armPts, wood, {
        seed: seed + 401,
        boil,
        surfaceStrokes: 18,
        edgeStrokes: 14,
        grainAlpha: 0.18,
        showRim: true
      });

      // 手里抓着的彩色投掷积木
      const cubePts = buildBlockRect(bx, by, 9.5, 9.5, 2.5);
      paintGouacheBody(ctx, cubePts, coral, {
        seed: seed + 419,
        boil,
        surfaceStrokes: 20,
        edgeStrokes: 16,
        grainAlpha: 0.18,
        showRim: true
      });
      drawShortGouacheDab(ctx, bx, by, 10, 4.5, 0, gold[1], 0.88, {
        seed: seed + 431,
        boil
      });
      return;
    }

    if (id === 'body') {
      const cx = facing === 'side' ? 68 : 70;
      const hw = facing === 'side' ? 22 : 28;
      // 青蓝木块躯干
      const bodyPts = buildBlockRect(cx, 89, hw, 22, 5.5);
      paintGouacheBody(ctx, bodyPts, teal, {
        seed: seed + 501,
        boil,
        surfaceStrokes: 44,
        edgeStrokes: 32,
        grainAlpha: 0.22,
        showRim: true
      });

      if (facing === 'back' || facing === 'side') {
        // 背面与侧面左后方：背着装有 2 块备用彩色积木的小木框背篓
        const packX = facing === 'side' ? 46 : 70;
        const packW = facing === 'side' ? 10 : 18;
        const b1 = buildBlockRect(packX - (facing === 'side' ? 0 : 6), 76, 6.5, 6.5, 2.0);
        fillGouache(ctx, b1, gold, { seed: seed + 521, boil });
        const b2 = buildBlockRect(packX + (facing === 'side' ? 2 : 6), 75, 6.5, 7.5, 2.0);
        fillGouache(ctx, b2, coral, { seed: seed + 529, boil });
        const boxPts = buildBlockRect(packX, 88, packW, 11, 3.0);
        paintGouacheBody(ctx, boxPts, wood, {
          seed: seed + 537,
          boil,
          surfaceStrokes: 22,
          edgeStrokes: 16,
          grainAlpha: 0.20
        });
      }

      if (facing === 'front' || facing === 'side') {
        // 胸前金色木腰带与珊瑚红领口积木条
        const beltX = facing === 'side' ? 76 : 70;
        drawGouacheStroke(ctx, [
          { x: cx - hw + 3, y: 98 },
          { x: cx + hw - 3, y: 98 }
        ], {
          color: wood[2],
          alpha: 0.85,
          maxWeight: 5.5,
          minWeight: 4.0,
          seed: seed + 551,
          boil
        });
        const bucklePts = buildBlockRect(beltX, 98, 6.5, 5.5, 1.5);
        fillGouache(ctx, bucklePts, gold, { seed: seed + 563, boil });
      }
      return;
    }

    if (id === 'head') {
      const cx = facing === 'side' ? 72 : 70;
      const hw = facing === 'side' ? 24 : 29;
      // 圆角方形浅木色脑袋（脸上 0 颗粒 noGrain: true）
      const headPts = buildBlockRect(cx, 50, hw, 19, 6.5);
      paintGouacheBody(ctx, headPts, cream, {
        seed: seed + 601,
        boil,
        boilAmp: 0.78,
        surfaceStrokes: 38,
        edgeStrokes: 28,
        noGrain: facing !== 'back',
        grainAlpha: facing === 'back' ? 0.18 : 0,
        showRim: true,
        highlightColor: '#FFFDF8'
      });

      if (facing === 'back') {
        // 后脑勺木块拼接燕尾榫与柔和木纹弧
        drawGouacheStroke(ctx, [
          { x: 54, y: 46 },
          { x: 70, y: 49 },
          { x: 86, y: 46 }
        ], {
          color: wood[1],
          alpha: 0.55,
          maxWeight: 2.6,
          minWeight: 1.0,
          seed: seed + 619,
          boil
        });
        drawShortGouacheDab(ctx, 70, 48, 10, 5.5, Math.PI * 0.5, wood[1], 0.65, {
          seed: seed + 629,
          boil
        });
      } else if (facing === 'side') {
        // 侧面朝右单眼 + 英气木块粗眉 + 腮红 + 坚毅小嘴
        drawBlush(ctx, 75, 57, 7.2, 4.4, { angle: 0.08, seed: seed + 641, boil, alpha: 0.55 });
        drawToyEye(ctx, 81, 48, 7.8, {
          seed: seed + 653,
          boil,
          gazeX: 0.25,
          gazeY: -0.05,
          lidColor: wood[2],
          browColor: wood[3],
          browTilt: 0.15
        });
        drawGouacheStroke(ctx, [
          { x: 79, y: 60 },
          { x: 88, y: 59 },
          { x: 93, y: 61 }
        ], {
          color: PALETTE.faceInk,
          alpha: 0.86,
          maxWeight: 2.1,
          minWeight: 0.9,
          seed: seed + 671,
          boil
        });
      } else {
        // 正面双眼 + 英气小木兵粗眉 + 腮红 + 腮边木纹微笑
        drawBlush(ctx, 48, 57, 7.5, 4.5, { angle: -0.08, seed: seed + 641, boil, alpha: 0.55 });
        drawBlush(ctx, 92, 57, 7.5, 4.5, { angle: 0.08, seed: seed + 647, boil, alpha: 0.55 });

        drawToyEye(ctx, 55, 49, 7.8, {
          seed: seed + 653,
          boil,
          gazeX: 0.08,
          gazeY: -0.06,
          lidColor: wood[2],
          browColor: wood[3],
          browTilt: 0.16
        });
        drawToyEye(ctx, 85, 49, 7.8, {
          seed: seed + 661,
          boil,
          gazeX: -0.08,
          gazeY: -0.06,
          lidColor: wood[2],
          browColor: wood[3],
          browTilt: -0.16
        });

        // 积木小兵的小方木鼻子与坚定微笑嘴
        const nosePts = buildBlockRect(70, 54, 3.2, 2.8, 1.0);
        fillGouache(ctx, nosePts, coral, { seed: seed + 673, boil });

        drawGouacheStroke(ctx, [
          { x: 62, y: 61 },
          { x: 70, y: 63 },
          { x: 78, y: 61 }
        ], {
          color: PALETTE.faceInk,
          alpha: 0.88,
          maxWeight: 2.1,
          minWeight: 0.9,
          seed: seed + 683,
          boil
        });
      }
      return;
    }

    if (id === 'blink') {
      const eyes = facing === 'side' ? [81] : [55, 85];
      for (const ex of eyes) {
        const lidPts = sampleSuperEllipse(ex, 49, 8.2, 8.2, 16, 2.0);
        fillGouache(ctx, lidPts, cream, { seed: seed + ex, boil });
        drawGouacheStroke(ctx, [
          { x: ex - 7.5, y: 49 },
          { x: ex, y: 52.5 },
          { x: ex + 7.5, y: 49 }
        ], {
          color: PALETTE.faceInk,
          alpha: 0.9,
          maxWeight: 2.3,
          minWeight: 0.9,
          seed: seed + ex + 17,
          boil
        });
      }
    }
  },

  anims: {
    front: {
      idle: makeIdleTrack(),
      walk: makeWalkTrack(false),
      cheer: {
        dur: 900,
        loop: false,
        tracks: {
          body: [
            { t: 0,   y: 0,     sx: 1.00, sy: 1.00, ease: 'in' },
            { t: 100, y: 4.0,   sx: 1.08, sy: 0.92, ease: 'out' },
            { t: 250, y: -13.5, sx: 0.94, sy: 1.08, ease: 'in' },
            { t: 430, y: 3.5,   sx: 1.08, sy: 0.92, ease: 'out' },
            { t: 600, y: -14.5, sx: 0.94, sy: 1.08, ease: 'in' },
            { t: 770, y: 2.0,   sx: 1.04, sy: 0.96, ease: 'smooth' },
            { t: 900, y: 0,     sx: 1.00, sy: 1.00 }
          ],
          hat: [
            { t: 0,   y: 0,    ease: 'out' },
            { t: 270, y: -6.5, ease: 'in' },
            { t: 450, y: 1.0,  ease: 'out' },
            { t: 630, y: -7.5, ease: 'in' },
            { t: 900, y: 0 }
          ],
          arm_r: [
            { t: 0,   rot: 0,   ease: 'out' },
            { t: 250, rot: -45, ease: 'in' },
            { t: 430, rot: -10, ease: 'out' },
            { t: 600, rot: -48, ease: 'in' },
            { t: 900, rot: 0 }
          ],
          shield: [
            { t: 0,   rot: 0,  ease: 'out' },
            { t: 250, rot: 35, ease: 'in' },
            { t: 600, rot: 38, ease: 'in' },
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
            { t: 90,  x: 0,    y: -9.0, sx: 0.88, sy: 1.15, ease: 'in' },
            { t: 170, x: -4.5, y: 5.0,  sx: 1.14, sy: 0.88, ease: 'linear' },
            { t: 240, x: 4.5,  y: 5.0,  sx: 1.12, sy: 0.88, ease: 'linear' },
            { t: 330, x: -2.5, y: 3.0,  sx: 1.06, sy: 0.94, ease: 'smooth' },
            { t: 500, x: 0,    y: 0,    sx: 1.00, sy: 1.00 }
          ],
          hat: [
            { t: 0,   y: 0,     rot: 0,   ease: 'out' },
            { t: 100, y: -11.0, rot: -12, ease: 'in' },
            { t: 260, y: 2.0,   rot: 6,   ease: 'smooth' },
            { t: 500, y: 0,     rot: 0 }
          ]
        }
      },
      // knocked（400ms）：被挤倒，停在趴着的姿势（衔接 down 第 0 帧）
      knocked: {
        dur: 400,
        loop: false,
        tracks: {
          body: [
            { t: 0,   x: 0,    y: 0,    rot: 0,   sx: 1.00, sy: 1.00, ease: 'out' },
            { t: 120, x: -4.0, y: -6.0, rot: -15, sx: 0.92, sy: 1.10, ease: 'in' },
            { t: 280, x: 4.0,  y: 18.0, rot: 28,  sx: 1.18, sy: 0.78, ease: 'out' },
            { t: 400, x: 3.0,  y: 16.0, rot: 24,  sx: 1.14, sy: 0.82 }
          ],
          head: [
            { t: 0,   y: 0,   rot: 0,   ease: 'out' },
            { t: 280, y: 6.0, rot: -18, ease: 'out' },
            { t: 400, y: 5.0, rot: -14 }
          ],
          hat: [
            { t: 0,   x: 0,    y: 0,    rot: 0,   ease: 'out' },
            { t: 150, x: -6.0, y: -9.0, rot: -25, ease: 'in' },
            { t: 400, x: 5.0,  y: 6.0,  rot: 22 }
          ],
          shield: [
            { t: 0,   x: 0,     y: 0,    rot: 0,   ease: 'out' },
            { t: 400, x: -10.0, y: 10.0, rot: -38 }
          ],
          arm_r: [
            { t: 0,   x: 0,    y: 0,   rot: 0,  ease: 'out' },
            { t: 400, x: 8.0,  y: 8.0, rot: 42 }
          ],
          blink: [
            { t: 0,   hidden: true },
            { t: 120, hidden: false },
            { t: 400, hidden: false }
          ]
        }
      },
      // down（1600ms 循环）：趴在地上晕乎乎晃脑袋
      down: {
        dur: 1600,
        loop: true,
        tracks: {
          body: [
            { t: 0,    x: 3.0, y: 16.0, rot: 24, sx: 1.14, sy: 0.82, ease: 'smooth' },
            { t: 800,  x: 1.0, y: 17.5, rot: 20, sx: 1.17, sy: 0.79, ease: 'smooth' },
            { t: 1600, x: 3.0, y: 16.0, rot: 24, sx: 1.14, sy: 0.82 }
          ],
          head: [
            { t: 0,    y: 5.0, rot: -14, ease: 'smooth' },
            { t: 400,  y: 6.0, rot: -4,  ease: 'smooth' },
            { t: 800,  y: 5.0, rot: -18, ease: 'smooth' },
            { t: 1200, y: 6.0, rot: -6,  ease: 'smooth' },
            { t: 1600, y: 5.0, rot: -14 }
          ],
          hat: [
            { t: 0,    x: 5.0, y: 6.0, rot: 22, ease: 'smooth' },
            { t: 800,  x: 3.0, y: 7.5, rot: 14, ease: 'smooth' },
            { t: 1600, x: 5.0, y: 6.0, rot: 22 }
          ],
          shield: [
            { t: 0,    x: -10.0, y: 10.0, rot: -38, ease: 'smooth' },
            { t: 800,  x: -11.0, y: 11.5, rot: -42, ease: 'smooth' },
            { t: 1600, x: -10.0, y: 10.0, rot: -38 }
          ],
          arm_r: [
            { t: 0,    x: 8.0, y: 8.0, rot: 42, ease: 'smooth' },
            { t: 800,  x: 9.0, y: 9.5, rot: 46, ease: 'smooth' },
            { t: 1600, x: 8.0, y: 8.0, rot: 42 }
          ],
          blink: [
            { t: 0,    hidden: false },
            { t: 1600, hidden: false }
          ]
        }
      },
      // getup（700ms）：咔哒咔哒拼正爬起来，回到 idle 第一帧
      getup: {
        dur: 700,
        loop: false,
        tracks: {
          body: [
            { t: 0,   x: 3.0,  y: 16.0, rot: 24, sx: 1.14, sy: 0.82, ease: 'in' },
            { t: 320, x: -2.0, y: -8.0, rot: -6, sx: 0.92, sy: 1.10, ease: 'out' },
            { t: 520, x: 0,    y: 2.0,  rot: 2,  sx: 1.04, sy: 0.96, ease: 'smooth' },
            { t: 700, x: 0,    y: 0,    rot: 0,  sx: 1.00, sy: 1.00 }
          ],
          head: [
            { t: 0,   y: 5.0,  rot: -14, ease: 'in' },
            { t: 350, y: -3.0, rot: 6,   ease: 'out' },
            { t: 700, y: 0,    rot: 0 }
          ],
          hat: [
            { t: 0,   x: 5.0, y: 6.0,  rot: 22, ease: 'in' },
            { t: 380, x: 0,   y: -6.0, rot: -8, ease: 'out' },
            { t: 700, x: 0,   y: 0,    rot: 0 }
          ],
          shield: [
            { t: 0,   x: -10.0, y: 10.0, rot: -38, ease: 'in' },
            { t: 360, x: 0,     y: -4.0, rot: 12,  ease: 'out' },
            { t: 700, x: 0,     y: 0,    rot: 0 }
          ],
          arm_r: [
            { t: 0,   x: 8.0, y: 8.0, rot: 42,  ease: 'in' },
            { t: 360, x: 0,   y: -4.0, rot: -12, ease: 'out' },
            { t: 700, x: 0,   y: 0,   rot: 0 }
          ],
          blink: [
            { t: 0,   hidden: false },
            { t: 320, hidden: true },
            { t: 700, hidden: true }
          ]
        }
      }
    },
    back: {
      idle: makeIdleTrack(),
      walk: makeWalkTrack(false),
      attack: makeAttackTrack(false),
      skill: makeSkillTrack(false),
      block: makeBlockTrack(false)
    },
    side: {
      idle: makeIdleTrack(),
      walk: makeWalkTrack(true),
      attack: makeAttackTrack(true),
      skill: makeSkillTrack(true),
      block: makeBlockTrack(true)
    }
  }
};
