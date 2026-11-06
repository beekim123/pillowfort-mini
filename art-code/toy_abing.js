// 《枕头堡》P1 美术代码：toy_abing（阿冰：企鹅玩偶 · 凉 · 冲 · L1 · 第 2 批新做）
// 规范对齐：
// 1. 三套朝向（front / back / side），转过去一眼是同一只深蓝白戴小围巾的企鹅玩偶：
//    - front：深蓝企鹅身 (indigo)、雪白圆肚皮与心形白脸框 (wool，0 颗粒干净无脏点)、暖橙黄三角企鹅喙、脖子上围着珊瑚红条纹针织小围巾 scarf、右翅手拿雪球；
//    - back：深蓝企鹅后脑勺与后背、底部翘起的小短企鹅尾、脖子后面醒目的珊瑚红围巾结与两条飘带（3.2.1 要求背面画出来）；
//    - side：侧面画朝右（朝右的尖企鹅嘴、右侧雪白圆肚皮、左后侧珊瑚红围巾结与企鹅短尾、右翅手扔雪球）；
// 2. 动作严格对齐 3.2.1 与 art-manifest-批次2.json：
//    - front: idle (1800 loop), walk (600 loop 原地踏步), cheer (900), startled (500)
//    - back / side: idle (1800 loop), walk (600 loop), attack (500, release=200 扔雪球), skill (1000, release=500 两手举高砸地雪崩), dash (400 loop 肚皮着地往前滑), strike (250 撞一下)

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

function makeIdleTrack() {
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
        { t: 600,  y: -1.5, rot: -2.0, ease: 'smooth' },
        { t: 1200, y: -2.2, rot: 2.0,  ease: 'smooth' },
        { t: 1800, y: 0,    rot: 0 }
      ],
      scarf: [
        { t: 0,    rot: 0,    sx: 1.00, ease: 'smooth' },
        { t: 600,  rot: -3.5, sx: 1.03, ease: 'smooth' },
        { t: 1200, rot: 3.5,  sx: 0.98, ease: 'smooth' },
        { t: 1800, rot: 0,    sx: 1.00 }
      ],
      arm_l: [
        { t: 0,    rot: 0,   ease: 'smooth' },
        { t: 600,  rot: 10,  ease: 'smooth' },
        { t: 1200, rot: -5,  ease: 'smooth' },
        { t: 1800, rot: 0 }
      ],
      arm_r: [
        { t: 0,    rot: 0,   ease: 'smooth' },
        { t: 600,  rot: -10, ease: 'smooth' },
        { t: 1200, rot: 5,   ease: 'smooth' },
        { t: 1800, rot: 0 }
      ],
      blink: [
        { t: 0,    hidden: true },
        { t: 1260, hidden: false },
        { t: 1400, hidden: true },
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
        { t: 150, y: -4.5, rot: isSide ? 3.0 : -4.8, sx: 0.97, sy: 1.04, ease: 'smooth' },
        { t: 300, y: 1.0,  rot: 0,                 sx: 1.03, sy: 0.97, ease: 'smooth' },
        { t: 450, y: -4.5, rot: isSide ? -2.5 : 4.8, sx: 0.97, sy: 1.04, ease: 'smooth' },
        { t: 600, y: 0,    rot: 0,                 sx: 1.00, sy: 1.00 }
      ],
      head: [
        { t: 0,   rot: 0,    ease: 'smooth' },
        { t: 150, rot: 3.2,  ease: 'smooth' },
        { t: 300, rot: 0,    ease: 'smooth' },
        { t: 450, rot: -3.2, ease: 'smooth' },
        { t: 600, rot: 0 }
      ],
      leg_l: [
        { t: 0,   x: 0,                 y: 0,    rot: 0,                 ease: 'smooth' },
        { t: 150, x: isSide ? 6.5 : 0,  y: -7.5, rot: isSide ? -22 : 14, ease: 'smooth' },
        { t: 300, x: 0,                 y: 0,    rot: 0,                 ease: 'smooth' },
        { t: 450, x: isSide ? -5.5 : 0, y: 1.5,  rot: isSide ? 18 : -8,  ease: 'smooth' },
        { t: 600, x: 0,                 y: 0,    rot: 0 }
      ],
      leg_r: [
        { t: 0,   x: 0,                 y: 0,    rot: 0,                  ease: 'smooth' },
        { t: 150, x: isSide ? -5.5 : 0, y: 1.5,  rot: isSide ? 18 : 8,    ease: 'smooth' },
        { t: 300, x: 0,                 y: 0,    rot: 0,                  ease: 'smooth' },
        { t: 450, x: isSide ? 6.5 : 0,  y: -7.5, rot: isSide ? -22 : -14, ease: 'smooth' },
        { t: 600, x: 0,                 y: 0,    rot: 0 }
      ],
      arm_l: [
        { t: 0,   rot: 0,  ease: 'smooth' },
        { t: 150, rot: 22, ease: 'smooth' },
        { t: 450, rot: -12, ease: 'smooth' },
        { t: 600, rot: 0 }
      ],
      arm_r: [
        { t: 0,   rot: 0,   ease: 'smooth' },
        { t: 150, rot: 12,  ease: 'smooth' },
        { t: 450, rot: -22, ease: 'smooth' },
        { t: 600, rot: 0 }
      ],
      scarf: [
        { t: 0,   rot: 0,  ease: 'smooth' },
        { t: 150, rot: 6,  ease: 'smooth' },
        { t: 450, rot: -6, ease: 'smooth' },
        { t: 600, rot: 0 }
      ]
    }
  };
}

// attack（500ms，release=200ms）：右翅手往后蓄力，第 200ms 扔出雪球
function makeAttackTrack(isSide = false) {
  return {
    dur: 500,
    loop: false,
    tracks: {
      body: [
        { t: 0,   x: 0,                 y: 0,    rot: 0,                 sx: 1.00, sy: 1.00, ease: 'out' },
        { t: 120, x: isSide ? -5.5 : 0, y: 4.0,  rot: isSide ? -9 : -5,  sx: 1.10, sy: 0.91, ease: 'in' },
        { t: 200, x: isSide ? 8.0 : 0,  y: -8.0, rot: isSide ? 12 : 5,   sx: 0.92, sy: 1.12, ease: 'out' },
        { t: 360, x: 0,                 y: 1.5,  rot: 0,                 sx: 1.03, sy: 0.98, ease: 'smooth' },
        { t: 500, x: 0,                 y: 0,    rot: 0,                 sx: 1.00, sy: 1.00 }
      ],
      arm_r: [
        { t: 0,   y: 0,     rot: 0,                   ease: 'out' },
        { t: 120, y: -8.0,  rot: isSide ? -55 : -45,  ease: 'in' },
        { t: 200, y: -12.0, rot: isSide ? 38 : 30,    ease: 'out' },
        { t: 500, y: 0,     rot: 0 }
      ],
      arm_l: [
        { t: 0,   rot: 0,   ease: 'out' },
        { t: 120, rot: 22,  ease: 'in' },
        { t: 200, rot: -26, ease: 'smooth' },
        { t: 500, rot: 0 }
      ],
      scarf: [
        { t: 0,   rot: 0,   ease: 'out' },
        { t: 200, rot: -14, ease: 'out' },
        { t: 500, rot: 0 }
      ]
    }
  };
}

// skill（1000ms，release=500ms）：两手高高举起蓄力跳起，第 500ms 猛砸地面引发雪崩
function makeSkillTrack(isSide = false) {
  return {
    dur: 1000,
    loop: false,
    tracks: {
      body: [
        { t: 0,    y: 0,     rot: 0,                sx: 1.00, sy: 1.00, ease: 'out' },
        { t: 360,  y: -16.0, rot: isSide ? -10 : 0, sx: 0.90, sy: 1.15, ease: 'in' },
        { t: 500,  y: 9.0,   rot: isSide ? 12 : 0,  sx: 1.24, sy: 0.80, ease: 'out' },
        { t: 740,  y: -3.0,  rot: 0,                sx: 0.96, sy: 1.04, ease: 'smooth' },
        { t: 1000, y: 0,     rot: 0,                sx: 1.00, sy: 1.00 }
      ],
      head: [
        { t: 0,    y: 0,    ease: 'out' },
        { t: 360,  y: -4.0, ease: 'in' },
        { t: 500,  y: 5.0,  ease: 'out' },
        { t: 1000, y: 0 }
      ],
      arm_l: [
        { t: 0,    y: 0,     rot: 0,   ease: 'out' },
        { t: 360,  y: -14.0, rot: 68,  ease: 'in' },
        { t: 500,  y: 6.0,   rot: -32, ease: 'out' },
        { t: 1000, y: 0,     rot: 0 }
      ],
      arm_r: [
        { t: 0,    y: 0,     rot: 0,   ease: 'out' },
        { t: 360,  y: -14.0, rot: -68, ease: 'in' },
        { t: 500,  y: 6.0,   rot: 32,  ease: 'out' },
        { t: 1000, y: 0,     rot: 0 }
      ],
      scarf: [
        { t: 0,    y: 0,     rot: 0,   ease: 'out' },
        { t: 360,  y: -6.0,  rot: -18, ease: 'in' },
        { t: 500,  y: 4.0,   rot: 16,  ease: 'out' },
        { t: 1000, y: 0,     rot: 0 }
      ]
    }
  };
}

// dash（400ms 循环）：肚皮着地往前滑出去！
function makeDashTrack(isSide = false) {
  return {
    dur: 400,
    loop: true,
    tracks: {
      body: [
        { t: 0,   x: isSide ? 6.0 : 0, y: 15.0, rot: isSide ? 42 : 0, sx: 1.18, sy: 0.76, ease: 'smooth' },
        { t: 200, x: isSide ? 9.0 : 0, y: 17.5, rot: isSide ? 46 : 0, sx: 1.24, sy: 0.72, ease: 'smooth' },
        { t: 400, x: isSide ? 6.0 : 0, y: 15.0, rot: isSide ? 42 : 0, sx: 1.18, sy: 0.76 }
      ],
      head: [
        { t: 0,   x: isSide ? 4.0 : 0, y: 4.0, rot: isSide ? -18 : 0, ease: 'smooth' },
        { t: 200, x: isSide ? 5.5 : 0, y: 5.5, rot: isSide ? -22 : 0, ease: 'smooth' },
        { t: 400, x: isSide ? 4.0 : 0, y: 4.0, rot: isSide ? -18 : 0 }
      ],
      arm_l: [
        { t: 0,   rot: isSide ? -48 : -38, ease: 'smooth' },
        { t: 200, rot: isSide ? -58 : -48, ease: 'smooth' },
        { t: 400, rot: isSide ? -48 : -38 }
      ],
      arm_r: [
        { t: 0,   rot: isSide ? -48 : 38, ease: 'smooth' },
        { t: 200, rot: isSide ? -58 : 48, ease: 'smooth' },
        { t: 400, rot: isSide ? -48 : 38 }
      ],
      scarf: [
        { t: 0,   rot: isSide ? -26 : -12, sx: 1.10, ease: 'smooth' },
        { t: 200, rot: isSide ? -36 : 12,  sx: 1.16, ease: 'smooth' },
        { t: 400, rot: isSide ? -26 : -12, sx: 1.10 }
      ],
      leg_l: [
        { t: 0,   x: isSide ? -12.0 : -3.0, y: -6.0, rot: isSide ? 45 : 20, ease: 'smooth' },
        { t: 200, x: isSide ? -15.0 : -4.0, y: -8.0, rot: isSide ? 55 : 28, ease: 'smooth' },
        { t: 400, x: isSide ? -12.0 : -3.0, y: -6.0, rot: isSide ? 45 : 20 }
      ],
      leg_r: [
        { t: 0,   x: isSide ? -10.0 : 3.0,  y: -5.0, rot: isSide ? 40 : -20, ease: 'smooth' },
        { t: 200, x: isSide ? -13.0 : 4.0,  y: -7.0, rot: isSide ? 50 : -28, ease: 'smooth' },
        { t: 400, x: isSide ? -10.0 : 3.0,  y: -5.0, rot: isSide ? 40 : -20 }
      ]
    }
  };
}

// strike（250ms）：往前猛撞一下再弹回待机
function makeStrikeTrack(isSide = false) {
  return {
    dur: 250,
    loop: false,
    tracks: {
      body: [
        { t: 0,   x: 0,                  y: 0,                    rot: 0,                 sx: 1.00, sy: 1.00, ease: 'out' },
        { t: 85,  x: isSide ? 16.0 : 0,  y: isSide ? 4.0 : -14.0, rot: isSide ? 28 : 0,   sx: 1.24, sy: 0.80, ease: 'in' },
        { t: 170, x: isSide ? -4.0 : 0,  y: isSide ? -2.0 : 4.0,  rot: isSide ? -8 : 0,   sx: 0.92, sy: 1.08, ease: 'out' },
        { t: 250, x: 0,                  y: 0,                    rot: 0,                 sx: 1.00, sy: 1.00 }
      ],
      head: [
        { t: 0,   y: 0,    ease: 'out' },
        { t: 85,  y: 4.5,  ease: 'in' },
        { t: 170, y: -2.0, ease: 'out' },
        { t: 250, y: 0 }
      ],
      arm_l: [
        { t: 0,   rot: 0,   ease: 'out' },
        { t: 85,  rot: -45, ease: 'in' },
        { t: 250, rot: 0 }
      ],
      arm_r: [
        { t: 0,   rot: 0,                  ease: 'out' },
        { t: 85,  rot: isSide ? -45 : 45, ease: 'in' },
        { t: 250, rot: 0 }
      ]
    }
  };
}

export default {
  key: 'toy_abing',
  level: 'L1',
  size: [140, 150],
  anchor: [70, 138],
  display: [112, 120],
  sizeRange: [80, 180],
  stance: '冲',
  range: '冲',
  boil: 3,
  facings: ['front', 'back', 'side'],

  muzzle: {
    front: [104, 72],
    back: [106, 66],
    side: [108, 66]
  },
  release: {
    attack: 200,
    skill: 500
  },

  parts: {
    front: [
      { id: 'shadow', parent: null,   rect: [20, 122, 100, 26], pivot: [70, 138], boil: false },
      { id: 'leg_l',  parent: 'body', rect: [32, 112, 32, 28],  pivot: [50, 120] },
      { id: 'leg_r',  parent: 'body', rect: [76, 112, 32, 28],  pivot: [90, 120] },
      { id: 'body',   parent: null,   rect: [26, 54, 88, 76],   pivot: [70, 120] },
      { id: 'arm_l',  parent: 'body', rect: [14, 62, 30, 44],   pivot: [36, 72] },
      { id: 'arm_r',  parent: 'body', rect: [90, 56, 40, 46],   pivot: [100, 72] },
      { id: 'head',   parent: 'body', rect: [28, 16, 84, 54],   pivot: [70, 62] },
      { id: 'scarf',  parent: 'body', rect: [28, 54, 84, 44],   pivot: [70, 66] },
      { id: 'blink',  parent: 'head', rect: [34, 30, 72, 26],   pivot: [70, 42], hidden: true }
    ],
    back: [
      { id: 'shadow', parent: null,   rect: [20, 122, 100, 26], pivot: [70, 138], boil: false },
      { id: 'leg_l',  parent: 'body', rect: [32, 112, 32, 28],  pivot: [50, 120] },
      { id: 'leg_r',  parent: 'body', rect: [76, 112, 32, 28],  pivot: [90, 120] },
      { id: 'arm_l',  parent: 'body', rect: [14, 62, 30, 44],   pivot: [36, 72] },
      { id: 'arm_r',  parent: 'body', rect: [90, 52, 40, 46],   pivot: [100, 70] },
      { id: 'body',   parent: null,   rect: [26, 54, 88, 76],   pivot: [70, 120] },
      { id: 'head',   parent: 'body', rect: [28, 16, 84, 54],   pivot: [70, 62] },
      { id: 'scarf',  parent: 'body', rect: [26, 52, 88, 54],   pivot: [70, 66] }
    ],
    side: [
      { id: 'shadow', parent: null,   rect: [20, 122, 100, 26], pivot: [70, 138], boil: false },
      { id: 'leg_l',  parent: 'body', rect: [42, 112, 32, 28],  pivot: [56, 120] },
      { id: 'arm_l',  parent: 'body', rect: [68, 56, 44, 42],   pivot: [76, 70] },
      { id: 'body',   parent: null,   rect: [24, 54, 84, 76],   pivot: [68, 120] },
      { id: 'leg_r',  parent: 'body', rect: [58, 112, 32, 28],  pivot: [72, 120] },
      { id: 'head',   parent: 'body', rect: [34, 16, 78, 54],   pivot: [68, 62] },
      { id: 'scarf',  parent: 'body', rect: [20, 52, 84, 48],   pivot: [68, 66] },
      { id: 'arm_r',  parent: 'body', rect: [56, 60, 56, 44],   pivot: [68, 72] },
      { id: 'blink',  parent: 'head', rect: [62, 30, 34, 26],   pivot: [78, 42], hidden: true }
    ]
  },

  drawPart(ctx, id, opt = {}) {
    const facing = opt.facing || 'front';
    const seed = opt.seed || 909;
    const boil = opt.boil || 0;
    const indigo = PALETTE.ramps.indigo;
    const wool = PALETTE.ramps.wool;
    const coral = PALETTE.ramps.coral;
    const gold = PALETTE.ramps.gold;
    const orange = PALETTE.ramps.orange;
    const cool = PALETTE.elements.cool;

    if (id === 'shadow') {
      drawPoolShadow(ctx, 70, 135, 40, 9, { seed, boil: 0, alpha: 0.56 });
      return;
    }

    if (id === 'leg_l' || id === 'leg_r') {
      const isL = id === 'leg_l';
      const cx = facing === 'side' ? (isL ? 56 : 74) : (isL ? 49 : 91);
      const cy = 126;
      const footPts = sampleSuperEllipse(cx, cy, 11.5, 6.5, 20, 2.0);
      paintGouacheBody(ctx, footPts, orange, {
        seed: seed + (isL ? 101 : 119),
        boil,
        surfaceStrokes: 20,
        edgeStrokes: 14,
        grainAlpha: 0.18,
        showRim: !isL
      });
      return;
    }

    if (id === 'arm_l' || id === 'arm_r') {
      const isR = id === 'arm_r';
      if (facing === 'side') {
        const cx = isR ? 72 : 78;
        const cy = isR ? 80 : 74;
        const flipPts = subdivideSpline([
          { x: cx - 6, y: cy - 10 },
          { x: cx + 16, y: cy - 4 },
          { x: cx + 24, y: cy + 8 },
          { x: cx + 10, y: cy + 14 },
          { x: cx - 8, y: cy + 4 }
        ], true, 3);
        paintGouacheBody(ctx, flipPts, indigo, {
          seed: seed + (isR ? 201 : 219),
          boil,
          surfaceStrokes: 24,
          edgeStrokes: 18,
          grainAlpha: 0.20,
          showRim: true
        });
        if (isR) {
          // 侧面右翅手里托着一颗冰白雪球
          const sbPts = sampleSuperEllipse(102, 68, 9.0, 9.0, 20, 2.0);
          paintGouacheBody(ctx, sbPts, [ '#FFFFFF', cool[0], cool[1], cool[2] ], {
            seed: seed + 241,
            boil,
            surfaceStrokes: 18,
            edgeStrokes: 14,
            noGrain: true
          });
        }
        return;
      }

      const dir = isR ? 1 : -1;
      const rx = isR ? 98 : 42;
      const ry = 74;
      const flipPts = subdivideSpline([
        { x: rx, y: ry - 10 },
        { x: rx + dir * 16, y: ry - 2 },
        { x: rx + dir * 20, y: ry + 16 },
        { x: rx + dir * 9, y: ry + 22 },
        { x: rx - dir * 2, y: ry + 8 }
      ], true, 3);
      paintGouacheBody(ctx, flipPts, indigo, {
        seed: seed + (isR ? 201 : 219),
        boil,
        surfaceStrokes: 24,
        edgeStrokes: 18,
        grainAlpha: 0.20,
        showRim: isR
      });

      if (isR) {
        // 右翅手里托着一颗圆滚滚的雪球
        const sbY = facing === 'back' ? 66 : 72;
        const sbPts = sampleSuperEllipse(106, sbY, 9.0, 9.0, 20, 2.0);
        paintGouacheBody(ctx, sbPts, [ '#FFFFFF', cool[0], cool[1], cool[2] ], {
          seed: seed + 241,
          boil,
          surfaceStrokes: 18,
          edgeStrokes: 14,
          noGrain: true
        });
      }
      return;
    }

    if (id === 'body') {
      if (facing === 'side') {
        // 侧面左后侧翘起的企鹅短尾 + 深蓝企鹅身 + 右前侧雪白滑行圆肚皮（0 颗粒）
        const tailPts = subdivideSpline([
          { x: 42, y: 108 },
          { x: 26, y: 112 },
          { x: 32, y: 122 },
          { x: 48, y: 120 }
        ], true, 3);
        fillGouache(ctx, tailPts, indigo, { seed: seed + 301, boil });

        const torsoPts = subdivideSpline([
          { x: 52, y: 58 },
          { x: 86, y: 60 },
          { x: 100, y: 84 },
          { x: 98, y: 112 },
          { x: 82, y: 124 },
          { x: 52, y: 123 },
          { x: 38, y: 106 },
          { x: 40, y: 78 }
        ], true, 4);
        paintGouacheBody(ctx, torsoPts, indigo, {
          seed: seed + 311,
          boil,
          surfaceStrokes: 48,
          edgeStrokes: 36,
          grainAlpha: 0.22,
          fuzz: true,
          showRim: true
        });

        const bellyPts = subdivideSpline([
          { x: 74, y: 66 },
          { x: 90, y: 70 },
          { x: 99, y: 90 },
          { x: 95, y: 114 },
          { x: 78, y: 121 },
          { x: 68, y: 104 },
          { x: 68, y: 82 }
        ], true, 4);
        paintGouacheBody(ctx, bellyPts, wool, {
          seed: seed + 333,
          boil,
          surfaceStrokes: 28,
          edgeStrokes: 20,
          noGrain: true,
          grainAlpha: 0,
          showRim: false,
          highlightColor: '#FFFFFF'
        });
        return;
      }

      const torsoPts = subdivideSpline([
        { x: 48, y: 58 },
        { x: 92, y: 58 },
        { x: 104, y: 84 },
        { x: 102, y: 112 },
        { x: 86, y: 124 },
        { x: 70, y: 126 },
        { x: 54, y: 124 },
        { x: 38, y: 112 },
        { x: 36, y: 84 }
      ], true, 4);
      paintGouacheBody(ctx, torsoPts, indigo, {
        seed: seed + 311,
        boil,
        surfaceStrokes: 52,
        edgeStrokes: 38,
        grainAlpha: 0.22,
        fuzz: true,
        stitches: true,
        showRim: true
      });

      if (facing === 'back') {
        // 背面底部可爱的企鹅小短尾
        const backTail = subdivideSpline([
          { x: 60, y: 114 },
          { x: 70, y: 108 },
          { x: 80, y: 114 },
          { x: 70, y: 126 }
        ], true, 3);
        paintGouacheBody(ctx, backTail, indigo, {
          seed: seed + 351,
          boil,
          surfaceStrokes: 16,
          edgeStrokes: 12,
          grainAlpha: 0.20,
          showRim: true
        });
      } else {
        // 正面雪白圆滚滚企鹅大肚皮（noGrain: true，保持洁白干净！）
        const bellyPts = sampleSuperEllipse(70, 96, 24, 24, 26, 2.0);
        paintGouacheBody(ctx, bellyPts, wool, {
          seed: seed + 333,
          boil,
          surfaceStrokes: 32,
          edgeStrokes: 24,
          noGrain: true,
          grainAlpha: 0,
          showRim: false,
          highlightColor: '#FFFFFF'
        });
      }
      return;
    }

    if (id === 'scarf') {
      // 脖子上的珊瑚红条纹针织小围巾（背面和侧面清楚露出围巾结与两条飘带！）
      const cx = facing === 'side' ? 68 : 70;
      const hw = facing === 'side' ? 25 : 31;
      const bandPts = subdivideSpline([
        { x: cx - hw, y: 58 },
        { x: cx,      y: 63 },
        { x: cx + hw, y: 58 },
        { x: cx + hw - 2, y: 69 },
        { x: cx,      y: 74 },
        { x: cx - hw + 2, y: 69 }
      ], true, 4);
      paintGouacheBody(ctx, bandPts, coral, {
        seed: seed + 401,
        boil,
        surfaceStrokes: 28,
        edgeStrokes: 22,
        grainAlpha: 0.20,
        showRim: true
      });
      // 围巾金黄针织条纹
      drawGouacheStroke(ctx, [
        { x: cx - hw + 5, y: 64 },
        { x: cx,          y: 68.5 },
        { x: cx + hw - 5, y: 64 }
      ], {
        color: gold[0],
        alpha: 0.85,
        maxWeight: 2.2,
        minWeight: 1.0,
        seed: seed + 419,
        boil
      });

      if (facing === 'back' || facing === 'side') {
        // 3.2.1 要求：背面/侧面看得到围巾结与两条垂下的围巾尾翼
        const kx = facing === 'side' ? 43 : 70;
        const ky = 66;
        const t1 = subdivideSpline([
          { x: kx - 4, y: ky + 2 },
          { x: kx - 14, y: ky + 18 },
          { x: kx - 10, y: ky + 30 },
          { x: kx - 1, y: ky + 24 },
          { x: kx + 2, y: ky + 6 }
        ], true, 3);
        const t2 = subdivideSpline([
          { x: kx + 2, y: ky + 2 },
          { x: kx + (facing === 'side' ? -4 : 14), y: ky + 20 },
          { x: kx + (facing === 'side' ? 2 : 10),  y: ky + 32 },
          { x: kx + (facing === 'side' ? 8 : 1),   y: ky + 24 }
        ], true, 3);
        paintGouacheBody(ctx, t1, coral, { seed: seed + 431, boil, surfaceStrokes: 18, edgeStrokes: 14, grainAlpha: 0.18 });
        paintGouacheBody(ctx, t2, coral, { seed: seed + 443, boil, surfaceStrokes: 18, edgeStrokes: 14, grainAlpha: 0.18 });
        const knotPts = sampleSuperEllipse(kx, ky, 7.5, 6.5, 16, 2.0);
        paintGouacheBody(ctx, knotPts, coral, { seed: seed + 457, boil, surfaceStrokes: 16, edgeStrokes: 12, noGrain: true });
      } else {
        // 正面右侧垂下一截可爱的小围巾头
        const frontTail = subdivideSpline([
          { x: 78, y: 68 },
          { x: 88, y: 84 },
          { x: 82, y: 92 },
          { x: 73, y: 88 },
          { x: 72, y: 70 }
        ], true, 3);
        paintGouacheBody(ctx, frontTail, coral, {
          seed: seed + 463,
          boil,
          surfaceStrokes: 18,
          edgeStrokes: 14,
          grainAlpha: 0.18
        });
      }
      return;
    }

    if (id === 'head') {
      const cx = facing === 'side' ? 68 : 70;
      const hw = facing === 'side' ? 28 : 34;
      const headPts = sampleSuperEllipse(cx, 42, hw, 23, 28, 2.05);
      paintGouacheBody(ctx, headPts, indigo, {
        seed: seed + 501,
        boil,
        boilAmp: 0.88,
        surfaceStrokes: 46,
        edgeStrokes: 34,
        grainAlpha: 0.20,
        fuzz: true,
        showRim: true
      });

      if (facing === 'back') return;

      if (facing === 'side') {
        // 侧面朝右的企鹅白脸颊 + 朝右凸出的黄橙尖喙 + 单眼
        const sidePatch = subdivideSpline([
          { x: 68, y: 28 },
          { x: 92, y: 31 },
          { x: 95, y: 50 },
          { x: 82, y: 60 },
          { x: 66, y: 56 }
        ], true, 3);
        fillGouache(ctx, sidePatch, wool, { seed: seed + 521, boil });

        const beakPts = subdivideSpline([
          { x: 90, y: 40 },
          { x: 108, y: 46 },
          { x: 90, y: 53 }
        ], true, 3);
        paintGouacheBody(ctx, beakPts, orange, {
          seed: seed + 533,
          boil,
          surfaceStrokes: 16,
          edgeStrokes: 12,
          noGrain: true
        });

        drawBlush(ctx, 74, 51, 7.0, 4.2, { angle: 0.1, seed: seed + 547, boil, alpha: 0.55 });
        drawToyEye(ctx, 78, 41, 7.8, {
          seed: seed + 557,
          boil,
          gazeX: 0.25,
          gazeY: -0.06,
          lidColor: indigo[2]
        });
        return;
      }

      // 正面企鹅标志性的双拱心形白脸框（0 颗粒）
      const maskPts = subdivideSpline([
        { x: 70, y: 34 },
        { x: 84, y: 27 },
        { x: 96, y: 38 },
        { x: 94, y: 55 },
        { x: 70, y: 61 },
        { x: 46, y: 55 },
        { x: 44, y: 38 },
        { x: 56, y: 27 }
      ], true, 4);
      fillGouache(ctx, maskPts, wool, { seed: seed + 521, boil });

      drawBlush(ctx, 48, 51, 7.5, 4.4, { angle: -0.1, seed: seed + 541, boil, alpha: 0.56 });
      drawBlush(ctx, 92, 51, 7.5, 4.4, { angle: 0.1, seed: seed + 547, boil, alpha: 0.56 });

      drawToyEye(ctx, 55, 42, 7.8, {
        seed: seed + 557,
        boil,
        gazeX: 0.08,
        gazeY: -0.08,
        lidColor: indigo[2]
      });
      drawToyEye(ctx, 85, 42, 7.8, {
        seed: seed + 563,
        boil,
        gazeX: -0.08,
        gazeY: -0.08,
        lidColor: indigo[2]
      });

      // 圆润可愛的橙黄企鹅菱形小尖嘴
      const beakPts = subdivideSpline([
        { x: 61, y: 47 },
        { x: 70, y: 43 },
        { x: 79, y: 47 },
        { x: 70, y: 55 }
      ], true, 3);
      paintGouacheBody(ctx, beakPts, orange, {
        seed: seed + 577,
        boil,
        surfaceStrokes: 16,
        edgeStrokes: 12,
        noGrain: true,
        highlightColor: gold[0]
      });
      return;
    }

    if (id === 'blink') {
      const eyes = facing === 'side' ? [78] : [55, 85];
      for (const ex of eyes) {
        const lidPts = sampleSuperEllipse(ex, 42, 8.2, 8.2, 16, 2.0);
        fillGouache(ctx, lidPts, wool, { seed: seed + ex, boil });
        drawGouacheStroke(ctx, [
          { x: ex - 7.5, y: 42 },
          { x: ex, y: 45.5 },
          { x: ex + 7.5, y: 42 }
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
            { t: 100, y: 4.0,   sx: 1.10, sy: 0.90, ease: 'out' },
            { t: 250, y: -14.0, sx: 0.92, sy: 1.10, ease: 'in' },
            { t: 430, y: 3.5,   sx: 1.10, sy: 0.90, ease: 'out' },
            { t: 600, y: -15.0, sx: 0.92, sy: 1.10, ease: 'in' },
            { t: 770, y: 2.5,   sx: 1.05, sy: 0.95, ease: 'smooth' },
            { t: 900, y: 0,     sx: 1.00, sy: 1.00 }
          ],
          arm_l: [
            { t: 0,   rot: 0,  ease: 'out' },
            { t: 250, rot: 48, ease: 'in' },
            { t: 430, rot: 12, ease: 'out' },
            { t: 600, rot: 52, ease: 'in' },
            { t: 900, rot: 0 }
          ],
          arm_r: [
            { t: 0,   rot: 0,   ease: 'out' },
            { t: 250, rot: -48, ease: 'in' },
            { t: 430, rot: -12, ease: 'out' },
            { t: 600, rot: -52, ease: 'in' },
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
            { t: 240, x: 4.5,  y: 5.5,  sx: 1.14, sy: 0.86, ease: 'linear' },
            { t: 320, x: -3.0, y: 4.0,  sx: 1.08, sy: 0.92, ease: 'smooth' },
            { t: 500, x: 0,    y: 0,    sx: 1.00, sy: 1.00 }
          ],
          arm_l: [
            { t: 0,   rot: 0,  ease: 'out' },
            { t: 90,  rot: 56, ease: 'smooth' },
            { t: 500, rot: 0 }
          ],
          arm_r: [
            { t: 0,   rot: 0,   ease: 'out' },
            { t: 90,  rot: -56, ease: 'smooth' },
            { t: 500, rot: 0 }
          ]
        }
      }
    },
    back: {
      idle: makeIdleTrack(),
      walk: makeWalkTrack(false),
      attack: makeAttackTrack(false),
      skill: makeSkillTrack(false),
      dash: makeDashTrack(false),
      strike: makeStrikeTrack(false)
    },
    side: {
      idle: makeIdleTrack(),
      walk: makeWalkTrack(true),
      attack: makeAttackTrack(true),
      skill: makeSkillTrack(true),
      dash: makeDashTrack(true),
      strike: makeStrikeTrack(true)
    }
  }
};
