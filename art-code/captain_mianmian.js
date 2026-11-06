// 《枕头堡》P1 美术代码：captain_mianmian（绵绵：旧绵羊玩偶，领头羊 · L1 · 第 2 批返修）
// 返修重点：
// 1. 严格按 1.5 节重做颗粒：脸部 (facePts) 0 颗粒 (noGrain: true)，白羊毛受光面 0 颗粒，暗面仅铺一层极柔和同色系浅灰毛绒颗粒，3× 下白毛与脸部干净无脏点；
// 2. 升级支持 L1 新接口 facings: ['front']；
// 3. 3 张沸腾变体之间靠卷毛轮廓边与水粉短笔触明显呼吸跳动。

import {
  PALETTE,
  hash32,
  sampleSuperEllipse,
  subdivideSpline,
  paintGouacheBody,
  fillGouache,
  drawGouacheStroke,
  drawShortGouacheDab,
  drawPlushStitches,
  drawToyEye,
  drawBlush,
  drawPoolShadow
} from './kit/index.js';

function buildWoolCloudContour(cx, cy, rx, ry, lobes = 10, lobeDepth = 0.14, seed = 1, boil = 0) {
  const pts = [];
  const n = lobes * 5;
  for (let i = 0; i < n; i++) {
    const u = i / n;
    const a = u * Math.PI * 2;
    const lobePhase = u * lobes * Math.PI * 2;
    const bump = Math.abs(Math.sin(lobePhase * 0.5)) * lobeDepth;
    const bJit = (hash32(seed, i, boil) - 0.5) * 0.055;
    const mod = 1.0 + bump + bJit;
    const wMod = 1.0 + 0.08 * Math.sin(a);
    pts.push({
      x: cx + Math.cos(a) * rx * mod * wMod,
      y: cy + Math.sin(a) * ry * mod,
      a
    });
  }
  return subdivideSpline(pts, true, 2);
}

// 在羊毛部件内部加画蓬松的卷毛弧线笔触（不撒深色脏点，亮部用暖白 wool[0]，暗部用柔和浅灰 wool[2]）
function paintWoolCurls(ctx, cx, cy, rx, ry, count, seed, boil) {
  const wool = PALETTE.ramps.wool;
  for (let i = 0; i < count; i++) {
    const cSeed = seed + i * 41;
    const ang = (i / count) * Math.PI * 2 + (hash32(cSeed, 1, boil) - 0.5) * 0.4;
    const dist = 0.24 + 0.50 * hash32(cSeed, 2, boil);
    const x = cx + Math.cos(ang) * rx * dist;
    const y = cy + Math.sin(ang) * ry * dist;
    const r = Math.min(rx, ry) * (0.18 + 0.12 * hash32(cSeed, 3, boil));
    const startA = ang - 1.1 + (hash32(cSeed, 4, boil) - 0.5) * 0.3;

    const arcPts = [];
    for (let k = 0; k <= 5; k++) {
      const a = startA + (k / 5) * 2.4;
      arcPts.push({
        x: x + Math.cos(a) * r,
        y: y + Math.sin(a) * r
      });
    }
    const isShadow = (Math.cos(ang) * 0.65 + Math.sin(ang) * 0.76) > 0.12;
    drawGouacheStroke(ctx, arcPts, {
      color: isShadow ? wool[2] : wool[0],
      alpha: isShadow ? 0.36 : 0.65,
      maxWeight: 3.1,
      minWeight: 0.9,
      seed: cSeed,
      boil,
      boilAmp: 0.85,
      dryFeibai: true
    });

    // 边缘蓬松白绒毛簇（仅用亮白或浅米白，绝不用深灰点）
    const px = x + Math.cos(startA + 1.2) * (r + 1.2);
    const py = y + Math.sin(startA + 1.2) * (r + 1.2);
    drawShortGouacheDab(
      ctx,
      px,
      py,
      3.4,
      2.3,
      ang,
      isShadow ? wool[1] : wool[0],
      0.52,
      { seed: cSeed + 17, boil, boilAmp: 0.85 }
    );
  }
}

const FRONT_PARTS = [
  { id: 'shadow',   parent: null,     rect: [20, 112, 100, 26], pivot: [70, 128], boil: false },
  { id: 'leg_l',    parent: 'body',   rect: [34, 102, 30, 30],  pivot: [50, 110] },
  { id: 'leg_r',    parent: 'body',   rect: [76, 102, 30, 30],  pivot: [90, 110] },
  { id: 'body',     parent: null,     rect: [22, 56, 96, 68],   pivot: [70, 118] },
  { id: 'arm_l',    parent: 'body',   rect: [16, 68, 28, 32],   pivot: [34, 76] },
  { id: 'arm_r',    parent: 'body',   rect: [96, 68, 28, 32],   pivot: [106, 76] },
  { id: 'ribbon',   parent: 'body',   rect: [30, 66, 80, 38],   pivot: [70, 78] },
  { id: 'bell',     parent: 'ribbon', rect: [54, 72, 32, 32],   pivot: [70, 80] },
  { id: 'ear_l',    parent: 'head',   rect: [8, 32, 36, 40],    pivot: [36, 44] },
  { id: 'ear_r',    parent: 'head',   rect: [96, 32, 36, 40],   pivot: [104, 44] },
  { id: 'head',     parent: 'body',   rect: [24, 18, 92, 68],   pivot: [70, 74] },
  { id: 'wool_top', parent: 'head',   rect: [30, 6, 80, 38],    pivot: [70, 30] },
  { id: 'blink',    parent: 'head',   rect: [36, 36, 68, 28],   pivot: [70, 50], hidden: true }
];

const FRONT_ANIMS = {
  idle: {
    dur: 2000,
    loop: true,
    tracks: {
      body: [
        { t: 0,    y: 0,    sx: 1.00, sy: 1.00, ease: 'smooth' },
        { t: 500,  y: -1.6, sx: 1.025, sy: 0.98, ease: 'smooth' },
        { t: 1000, y: -2.8, sx: 0.985, sy: 1.022, ease: 'smooth' },
        { t: 1500, y: -1.0, sx: 1.02, sy: 0.985, ease: 'smooth' },
        { t: 2000, y: 0,    sx: 1.00, sy: 1.00 }
      ],
      head: [
        { t: 0,    y: 0,    rot: 0,    ease: 'smooth' },
        { t: 600,  y: -1.5, rot: -1.8, ease: 'smooth' },
        { t: 1200, y: -2.4, rot: 1.6,  ease: 'smooth' },
        { t: 1700, y: -0.6, rot: 0.5,  ease: 'smooth' },
        { t: 2000, y: 0,    rot: 0 }
      ],
      wool_top: [
        { t: 0,    y: 0,    sx: 1.00, sy: 1.00, ease: 'smooth' },
        { t: 700,  y: -1.2, sx: 1.03, sy: 0.97, ease: 'smooth' },
        { t: 1350, y: -2.0, sx: 0.98, sy: 1.03, ease: 'smooth' },
        { t: 2000, y: 0,    sx: 1.00, sy: 1.00 }
      ],
      ear_l: [
        { t: 0,    rot: 0,   ease: 'smooth' },
        { t: 380,  rot: -3,  ease: 'out' },
        { t: 520,  rot: 11,  ease: 'in' },
        { t: 680,  rot: -4,  ease: 'out' },
        { t: 840,  rot: 6,   ease: 'smooth' },
        { t: 1250, rot: -2,  ease: 'smooth' },
        { t: 2000, rot: 0 }
      ],
      ear_r: [
        { t: 0,    rot: 0,   ease: 'smooth' },
        { t: 550,  rot: 2,   ease: 'out' },
        { t: 720,  rot: -10, ease: 'in' },
        { t: 900,  rot: 4,   ease: 'smooth' },
        { t: 1450, rot: -3,  ease: 'smooth' },
        { t: 2000, rot: 0 }
      ],
      ribbon: [
        { t: 0,    rot: 0,    sx: 1.00, ease: 'smooth' },
        { t: 650,  rot: -2.2, sx: 1.02, ease: 'smooth' },
        { t: 1350, rot: 2.2,  sx: 0.99, ease: 'smooth' },
        { t: 2000, rot: 0,    sx: 1.00 }
      ],
      bell: [
        { t: 0,    rot: 0,    x: 0,    ease: 'smooth' },
        { t: 450,  rot: 5.5,  x: 0.8,  ease: 'smooth' },
        { t: 950,  rot: -6.5, x: -1.0, ease: 'smooth' },
        { t: 1500, rot: 4.2,  x: 0.6,  ease: 'smooth' },
        { t: 2000, rot: 0,    x: 0 }
      ],
      arm_l: [
        { t: 0,    rot: 0,   ease: 'smooth' },
        { t: 1000, rot: 5.5, ease: 'smooth' },
        { t: 2000, rot: 0 }
      ],
      arm_r: [
        { t: 0,    rot: 0,    ease: 'smooth' },
        { t: 1000, rot: -5.5, ease: 'smooth' },
        { t: 2000, rot: 0 }
      ],
      blink: [
        { t: 0,    hidden: true },
        { t: 1380, hidden: false },
        { t: 1530, hidden: true },
        { t: 2000, hidden: true }
      ]
    }
  },

  baa: {
    dur: 1200,
    loop: false,
    tracks: {
      body: [
        { t: 0,    y: 0,    sx: 1.00, sy: 1.00, ease: 'in' },
        { t: 200,  y: 3.5,  sx: 1.07, sy: 0.92, ease: 'out' },
        { t: 420,  y: -5.5, sx: 1.09, sy: 1.08, ease: 'smooth' },
        { t: 820,  y: -4.0, sx: 1.06, sy: 1.05, ease: 'smooth' },
        { t: 1200, y: 0,    sx: 1.00, sy: 1.00 }
      ],
      head: [
        { t: 0,    y: 0,    rot: 0,    sx: 1.00, sy: 1.00, ease: 'in' },
        { t: 200,  y: 2.5,  rot: 3.5,  sx: 1.04, sy: 0.96, ease: 'out' },
        { t: 400,  y: -6.5, rot: -5.5, sx: 1.06, sy: 1.07, ease: 'smooth' },
        { t: 620,  y: -7.0, rot: 4.5,  sx: 1.05, sy: 1.06, ease: 'smooth' },
        { t: 860,  y: -5.0, rot: -3.0, sx: 1.03, sy: 1.04, ease: 'smooth' },
        { t: 1200, y: 0,    rot: 0,    sx: 1.00, sy: 1.00 }
      ],
      wool_top: [
        { t: 0,    y: 0,    sx: 1.00, sy: 1.00, ease: 'out' },
        { t: 380,  y: -3.5, sx: 1.14, sy: 1.12, ease: 'smooth' },
        { t: 850,  y: -2.0, sx: 1.08, sy: 1.06, ease: 'smooth' },
        { t: 1200, y: 0,    sx: 1.00, sy: 1.00 }
      ],
      ear_l: [
        { t: 0,    rot: 0,   ease: 'out' },
        { t: 360,  rot: 22,  ease: 'smooth' },
        { t: 820,  rot: 15,  ease: 'smooth' },
        { t: 1200, rot: 0 }
      ],
      ear_r: [
        { t: 0,    rot: 0,   ease: 'out' },
        { t: 360,  rot: -22, ease: 'smooth' },
        { t: 820,  rot: -15, ease: 'smooth' },
        { t: 1200, rot: 0 }
      ],
      bell: [
        { t: 0,    rot: 0,   y: 0,    ease: 'out' },
        { t: 300,  rot: -22, y: -2.5, ease: 'in' },
        { t: 450,  rot: 24,  y: -3.0, ease: 'in' },
        { t: 600,  rot: -20, y: -2.5, ease: 'in' },
        { t: 750,  rot: 18,  y: -2.0, ease: 'in' },
        { t: 920,  rot: -10, y: -1.0, ease: 'smooth' },
        { t: 1200, rot: 0,   y: 0 }
      ],
      arm_l: [
        { t: 0,    rot: 0,  ease: 'out' },
        { t: 400,  rot: 26, ease: 'smooth' },
        { t: 850,  rot: 18, ease: 'smooth' },
        { t: 1200, rot: 0 }
      ],
      arm_r: [
        { t: 0,    rot: 0,   ease: 'out' },
        { t: 400,  rot: -26, ease: 'smooth' },
        { t: 850,  rot: -18, ease: 'smooth' },
        { t: 1200, rot: 0 }
      ]
    }
  },

  cheer: {
    dur: 900,
    loop: false,
    tracks: {
      body: [
        { t: 0,   y: 0,     sx: 1.00, sy: 1.00, ease: 'in' },
        { t: 100, y: 4.0,   sx: 1.09, sy: 0.90, ease: 'out' },
        { t: 240, y: -13.0, sx: 0.93, sy: 1.09, ease: 'in' },
        { t: 420, y: 3.5,   sx: 1.10, sy: 0.89, ease: 'out' },
        { t: 580, y: -14.5, sx: 0.92, sy: 1.10, ease: 'in' },
        { t: 760, y: 2.5,   sx: 1.06, sy: 0.94, ease: 'smooth' },
        { t: 900, y: 0,     sx: 1.00, sy: 1.00 }
      ],
      head: [
        { t: 0,   y: 0,    rot: 0,    ease: 'out' },
        { t: 250, y: -3.5, rot: -4.5, ease: 'in' },
        { t: 440, y: 2.0,  rot: 3.5,  ease: 'out' },
        { t: 600, y: -4.0, rot: 5.0,  ease: 'in' },
        { t: 900, y: 0,    rot: 0 }
      ],
      ear_l: [
        { t: 0,   rot: 0,   ease: 'out' },
        { t: 260, rot: 28,  ease: 'in' },
        { t: 440, rot: -10, ease: 'out' },
        { t: 620, rot: 30,  ease: 'in' },
        { t: 900, rot: 0 }
      ],
      ear_r: [
        { t: 0,   rot: 0,   ease: 'out' },
        { t: 260, rot: -28, ease: 'in' },
        { t: 440, rot: 10,  ease: 'out' },
        { t: 620, rot: -30, ease: 'in' },
        { t: 900, rot: 0 }
      ],
      bell: [
        { t: 0,   rot: 0,   y: 0,    ease: 'out' },
        { t: 260, rot: 20,  y: -4.0, ease: 'in' },
        { t: 450, rot: -18, y: 2.0,  ease: 'out' },
        { t: 620, rot: -22, y: -4.5, ease: 'in' },
        { t: 900, rot: 0,   y: 0 }
      ],
      arm_l: [
        { t: 0,   rot: 0,  ease: 'out' },
        { t: 240, rot: 38, ease: 'in' },
        { t: 420, rot: 10, ease: 'out' },
        { t: 580, rot: 42, ease: 'in' },
        { t: 900, rot: 0 }
      ],
      arm_r: [
        { t: 0,   rot: 0,   ease: 'out' },
        { t: 240, rot: -38, ease: 'in' },
        { t: 420, rot: -10, ease: 'out' },
        { t: 580, rot: -42, ease: 'in' },
        { t: 900, rot: 0 }
      ]
    }
  },

  flinch: {
    dur: 400,
    loop: false,
    tracks: {
      body: [
        { t: 0,   y: 0,   sx: 1.00, sy: 1.00, ease: 'out' },
        { t: 110, y: 6.5, sx: 1.15, sy: 0.84, ease: 'in' },
        { t: 260, y: -1.5, sx: 0.96, sy: 1.04, ease: 'smooth' },
        { t: 400, y: 0,   sx: 1.00, sy: 1.00 }
      ],
      head: [
        { t: 0,   y: 0,   rot: 0,    ease: 'out' },
        { t: 110, y: 5.5, rot: -6.0, ease: 'in' },
        { t: 270, y: -1.0, rot: 2.5, ease: 'smooth' },
        { t: 400, y: 0,   rot: 0 }
      ],
      ear_l: [
        { t: 0,   rot: 0,   ease: 'out' },
        { t: 110, rot: -20, ease: 'smooth' },
        { t: 400, rot: 0 }
      ],
      ear_r: [
        { t: 0,   rot: 0,  ease: 'out' },
        { t: 110, rot: 20, ease: 'smooth' },
        { t: 400, rot: 0 }
      ],
      bell: [
        { t: 0,   rot: 0,   ease: 'out' },
        { t: 120, rot: 18,  ease: 'in' },
        { t: 250, rot: -12, ease: 'smooth' },
        { t: 400, rot: 0 }
      ],
      blink: [
        { t: 0,   hidden: true },
        { t: 40,  hidden: false },
        { t: 280, hidden: true },
        { t: 400, hidden: true }
      ]
    }
  }
};

export default {
  key: 'captain_mianmian',
  level: 'L1',
  size: [140, 140],
  anchor: [70, 128],
  display: [110, 110],
  pos: [375, 770],
  boil: 3,
  facings: ['front'],

  parts: {
    front: FRONT_PARTS
  },

  drawPart(ctx, id, opt = {}) {
    const seed = opt.seed || 101;
    const boil = opt.boil || 0;
    const wool = PALETTE.ramps.wool;
    const cream = PALETTE.ramps.cream;
    const berry = PALETTE.ramps.berry;
    const gold = PALETTE.ramps.gold;
    const hoofRamp = ['#8E7A78', '#6B5858', '#4A3B3D', '#302428'];

    switch (id) {
      case 'shadow': {
        drawPoolShadow(ctx, 70, 125, 42, 9.5, { seed, boil: 0, alpha: 0.56 });
        break;
      }

      case 'leg_l':
      case 'leg_r': {
        const isL = id === 'leg_l';
        const cx = isL ? 50 : 90;
        const cy = 117;
        const pts = sampleSuperEllipse(cx, cy, 10.5, 11, 24, 2.1);
        paintGouacheBody(ctx, pts, hoofRamp, {
          seed: seed + (isL ? 11 : 23),
          boil,
          surfaceStrokes: 26,
          edgeStrokes: 18,
          grainAlpha: 0.22,
          showRim: !isL
        });
        drawGouacheStroke(ctx, [
          { x: cx, y: cy + 2 },
          { x: cx, y: cy + 9.5 }
        ], {
          color: hoofRamp[3],
          alpha: 0.65,
          maxWeight: 1.8,
          minWeight: 0.8,
          seed: seed + 31,
          boil
        });
        break;
      }

      case 'body': {
        const bodyPts = buildWoolCloudContour(70, 90, 38, 28, 12, 0.11, seed + 101, boil);
        paintGouacheBody(ctx, bodyPts, wool, {
          seed: seed + 101,
          boil,
          boilAmp: 0.98,
          surfaceStrokes: 52,
          edgeStrokes: 40,
          grainAlpha: 0.20,
          fuzz: true,
          stitches: true,
          showRim: true,
          rimColor: PALETTE.rim
        });
        paintWoolCurls(ctx, 70, 91, 33, 23, 14, seed + 151, boil);
        break;
      }

      case 'arm_l':
      case 'arm_r': {
        const isL = id === 'arm_l';
        const cx = isL ? 30 : 110;
        const cy = 83;
        const tilt = isL ? 0.35 : -0.35;
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(tilt);
        const armPts = sampleSuperEllipse(0, 0, 8.5, 11.5, 24, 2.0);
        paintGouacheBody(ctx, armPts, wool, {
          seed: seed + (isL ? 211 : 223),
          boil,
          surfaceStrokes: 24,
          edgeStrokes: 18,
          grainAlpha: 0.18,
          fuzz: true,
          showRim: !isL
        });
        const tipPts = sampleSuperEllipse(0, 6.5, 6.5, 5.2, 16, 2.1);
        fillGouache(ctx, tipPts, hoofRamp, { seed: seed + 241, boil });
        ctx.restore();
        break;
      }

      case 'ribbon': {
        const bandPts = subdivideSpline([
          { x: 42, y: 74 },
          { x: 70, y: 80 },
          { x: 98, y: 74 },
          { x: 95, y: 82 },
          { x: 70, y: 88 },
          { x: 45, y: 82 }
        ], true, 4);
        paintGouacheBody(ctx, bandPts, berry, {
          seed: seed + 301,
          boil,
          surfaceStrokes: 26,
          edgeStrokes: 20,
          grainAlpha: 0.24,
          showRim: true
        });

        const tail1 = subdivideSpline([
          { x: 48, y: 79 },
          { x: 38, y: 88 },
          { x: 34, y: 97 },
          { x: 43, y: 95 },
          { x: 52, y: 84 }
        ], true, 3);
        const tail2 = subdivideSpline([
          { x: 92, y: 79 },
          { x: 101, y: 89 },
          { x: 104, y: 96 },
          { x: 95, y: 95 },
          { x: 88, y: 84 }
        ], true, 3);
        paintGouacheBody(ctx, tail1, berry, {
          seed: seed + 313,
          boil,
          surfaceStrokes: 18,
          edgeStrokes: 14,
          grainAlpha: 0.22
        });
        paintGouacheBody(ctx, tail2, berry, {
          seed: seed + 327,
          boil,
          surfaceStrokes: 18,
          edgeStrokes: 14,
          grainAlpha: 0.22
        });
        break;
      }

      case 'bell': {
        const cx = 70, cy = 87, r = 9.5;
        drawGouacheStroke(ctx, [
          { x: cx - 3, y: cy - r + 1 },
          { x: cx, y: cy - r - 3.5 },
          { x: cx + 3, y: cy - r + 1 }
        ], {
          color: gold[2],
          alpha: 0.9,
          maxWeight: 2.4,
          minWeight: 1.2,
          seed: seed + 401,
          boil
        });

        const bellPts = sampleSuperEllipse(cx, cy, r, r * 0.96, 26, 2.05);
        paintGouacheBody(ctx, bellPts, gold, {
          seed: seed + 409,
          boil,
          surfaceStrokes: 28,
          edgeStrokes: 20,
          grainAlpha: 0.22,
          showRim: true,
          rimColor: '#FFF8D6',
          highlightColor: '#FFFFFF'
        });

        drawGouacheStroke(ctx, [
          { x: cx - r * 0.88, y: cy - 1 },
          { x: cx, y: cy + 1 },
          { x: cx + r * 0.88, y: cy - 1 }
        ], {
          color: gold[3],
          alpha: 0.65,
          maxWeight: 1.8,
          minWeight: 0.9,
          seed: seed + 419,
          boil
        });

        ctx.fillStyle = PALETTE.faceInk;
        ctx.beginPath();
        ctx.arc(cx, cy + 3.2, 2.3, 0, Math.PI * 2);
        ctx.fill();
        drawGouacheStroke(ctx, [
          { x: cx - 4.5, y: cy + 3.2 },
          { x: cx + 4.5, y: cy + 3.2 }
        ], {
          color: PALETTE.faceInk,
          alpha: 0.85,
          maxWeight: 1.6,
          minWeight: 0.8,
          seed: seed + 425,
          boil
        });
        break;
      }

      case 'ear_l':
      case 'ear_r': {
        const isL = id === 'ear_l';
        const dir = isL ? -1 : 1;
        const rootX = isL ? 38 : 102;
        const rootY = 45;
        const earPts = subdivideSpline([
          { x: rootX, y: rootY - 6 },
          { x: rootX + dir * 14, y: rootY - 3 },
          { x: rootX + dir * 24, y: rootY + 9 },
          { x: rootX + dir * 20, y: rootY + 19 },
          { x: rootX + dir * 7, y: rootY + 16 },
          { x: rootX - dir * 2, y: rootY + 6 }
        ], true, 4);

        paintGouacheBody(ctx, earPts, wool, {
          seed: seed + (isL ? 501 : 521),
          boil,
          surfaceStrokes: 26,
          edgeStrokes: 20,
          grainAlpha: 0.18,
          fuzz: true,
          showRim: !isL
        });

        const innerPts = [
          { x: rootX + dir * 4, y: rootY + 3 },
          { x: rootX + dir * 13, y: rootY + 9 },
          { x: rootX + dir * 16, y: rootY + 14 }
        ];
        drawGouacheStroke(ctx, innerPts, {
          color: PALETTE.blush,
          alpha: 0.42,
          maxWeight: 5.8,
          minWeight: 1.8,
          seed: seed + (isL ? 509 : 529),
          boil,
          dryFeibai: true
        });
        break;
      }

      case 'head': {
        // 1) 后脑勺与脸周的一圈蓬松白羊毛包边
        const cheekWoolPts = buildWoolCloudContour(70, 50, 39, 28, 12, 0.11, seed + 601, boil);
        paintGouacheBody(ctx, cheekWoolPts, wool, {
          seed: seed + 601,
          boil,
          surfaceStrokes: 34,
          edgeStrokes: 28,
          grainAlpha: 0.18,
          fuzz: true,
          showRim: true
        });

        // 2) 奶油色绵羊脸庞（1.5 节硬性要求：脸上 0 颗粒 noGrain: true，保持绝对干净！）
        const facePts = subdivideSpline([
          { x: 70, y: 28 },
          { x: 94, y: 33 },
          { x: 100, y: 52 },
          { x: 89, y: 69 },
          { x: 70, y: 74 },
          { x: 51, y: 69 },
          { x: 40, y: 52 },
          { x: 46, y: 33 }
        ], true, 4);
        paintGouacheBody(ctx, facePts, cream, {
          seed: seed + 619,
          boil,
          boilAmp: 0.72,
          surfaceStrokes: 34,
          edgeStrokes: 26,
          noGrain: true,
          grainAlpha: 0,
          showRim: false,
          highlightColor: '#FFFDF8'
        });

        // 3) 腮红、大黑瞳眼睛、温柔眉眼与鼻嘴（全部在无颗粒干净脸部之上）
        drawBlush(ctx, 48, 58, 7.8, 4.6, { angle: -0.1, seed: seed + 641, boil });
        drawBlush(ctx, 92, 58, 7.8, 4.6, { angle: 0.1, seed: seed + 647, boil });

        drawToyEye(ctx, 55, 49, 8.8, {
          seed: seed + 653,
          boil,
          gazeX: 0.08,
          gazeY: -0.08,
          lidColor: cream[3]
        });
        drawToyEye(ctx, 85, 49, 8.8, {
          seed: seed + 661,
          boil,
          gazeX: -0.08,
          gazeY: -0.08,
          lidColor: cream[3]
        });

        drawGouacheStroke(ctx, [{ x: 49, y: 38 }, { x: 55, y: 36.5 }, { x: 60, y: 38 }], {
          color: cream[3],
          alpha: 0.78,
          maxWeight: 2.0,
          minWeight: 0.8,
          seed: seed + 673,
          boil
        });
        drawGouacheStroke(ctx, [{ x: 80, y: 38 }, { x: 85, y: 36.5 }, { x: 91, y: 38 }], {
          color: cream[3],
          alpha: 0.78,
          maxWeight: 2.0,
          minWeight: 0.8,
          seed: seed + 677,
          boil
        });

        const mouthCol = PALETTE.mouth[1];
        drawGouacheStroke(ctx, [{ x: 67, y: 56 }, { x: 70, y: 58.5 }, { x: 73, y: 56 }], {
          color: PALETTE.mouth[0],
          alpha: 0.88,
          maxWeight: 2.2,
          minWeight: 0.9,
          seed: seed + 683,
          boil
        });
        drawGouacheStroke(ctx, [{ x: 70, y: 58 }, { x: 70, y: 62.5 }], {
          color: mouthCol,
          alpha: 0.88,
          maxWeight: 1.8,
          minWeight: 0.9,
          seed: seed + 689,
          boil
        });
        drawGouacheStroke(ctx, [
          { x: 63.5, y: 62 },
          { x: 67, y: 64.2 },
          { x: 70, y: 62.2 },
          { x: 73, y: 64.2 },
          { x: 76.5, y: 62 }
        ], {
          color: mouthCol,
          alpha: 0.9,
          maxWeight: 2.0,
          minWeight: 0.8,
          seed: seed + 691,
          boil
        });
        break;
      }

      case 'wool_top': {
        const crownPts = buildWoolCloudContour(70, 23, 31, 14, 9, 0.18, seed + 701, boil);
        paintGouacheBody(ctx, crownPts, wool, {
          seed: seed + 701,
          boil,
          boilAmp: 1.05,
          surfaceStrokes: 42,
          edgeStrokes: 34,
          grainAlpha: 0.18,
          fuzz: true,
          showRim: true,
          highlightColor: '#FFFFFF'
        });
        paintWoolCurls(ctx, 70, 23, 25, 10, 9, seed + 733, boil);
        break;
      }

      case 'blink': {
        for (const ex of [55, 85]) {
          const lidPts = sampleSuperEllipse(ex, 49, 9.2, 9.2, 18, 2.0);
          fillGouache(ctx, lidPts, cream, { seed: seed + ex, boil });
          drawGouacheStroke(ctx, [
            { x: ex - 8.5, y: 49 },
            { x: ex, y: 53.5 },
            { x: ex + 8.5, y: 49 }
          ], {
            color: PALETTE.faceInk,
            alpha: 0.9,
            maxWeight: 2.5,
            minWeight: 0.9,
            seed: seed + ex + 13,
            boil
          });
        }
        break;
      }
    }
  },

  anims: {
    front: FRONT_ANIMS
  }
};
