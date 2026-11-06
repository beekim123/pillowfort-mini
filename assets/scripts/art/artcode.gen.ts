// @ts-nocheck
// 由 node tools/bundle-art.mjs 从 art-code/ 生成，别手改。美术代码版本 b9ca29b1355f（出图缓存用它当名字）。
import type { ArtPackage } from './ArtTypes';
const __defs = {}, __mods = {};
const __req = p => { if (!__mods[p]) { if (!__defs[p]) throw new Error('art-code 里找不到 ' + p); __mods[p] = {}; __defs[p](__mods[p]); } return __mods[p]; };
__defs["bg_dream_0.js"] = function (__e) {
// 《枕头堡》P1 美术代码：bg_dream_0（刚闭眼：梦里的卧室 · bg · 第 2 批返修）
// 返修重点（严格对齐 00-美术外包说明.md 与 美术文档-P1.md 1.5 / 3.7 节）：
// 1. 中间噩梦走的那片地（屏幕 y 262–774，画布 y 552–1064）和底下窝的位置（屏幕 y 774 以下，画布 y 1064–1624）几乎不要颗粒；
// 2. 颗粒只留给顶上的雾（画布 y 0–552）和左右两边的暗处边缘；
// 3. 750×1624 底对齐，左上角栅栏区（屏幕 y 170–220）与右侧手电按钮区（屏幕 690, 830）严格留白。

const {
  PALETTE,
  createRng,
  lerp,
  rgba,
  subdivideSpline,
  fillGouache,
  drawGouacheStroke,
  drawShortGouacheDab,
  getGrainTile,
  getGrain
} = __req("kit/index.js");

__e.default = {
  key: 'bg_dream_0',
  level: 'bg',
  size: [750, 1624],
  display: [750, 1624],

  draw(ctx, opt = {}) {
    const seed = opt.seed || 601;
    const boil = opt.boil || 0;
    const scale = opt.scale || 1;
    const rng = createRng(seed, boil);

    const night = PALETTE.ramps.night; // ['#3A3F6B', '#2B2F55', '#1F2242', '#171A33']
    const fog = PALETTE.ramps.fog;     // ['#2A2448', '#221D3C', '#1A1630', '#120F24']

    ctx.save();
    if (scale !== 1) ctx.scale(scale, scale);

    // ─── 1. 全局底色过渡（顶雾 -> 中间调梦境地面 -> 底部月牙窝床单底座） ───
    const baseGrad = ctx.createLinearGradient(0, 0, 0, 1624);
    baseGrad.addColorStop(0.00, fog[2]);   // y=0 顶雾深处
    baseGrad.addColorStop(0.26, fog[0]);   // y≈420 雾区
    baseGrad.addColorStop(0.35, night[1]); // y≈552 (屏幕 y≈262) 雾渐淡入梦境地面
    baseGrad.addColorStop(0.52, night[0]); // y≈840 梦境地面平静中间调 (#3A3F6B)
    baseGrad.addColorStop(0.66, night[1]); // y≈1064 (屏幕 y≈774) 月牙窝交界
    baseGrad.addColorStop(1.00, '#272B4E'); // y=1624 底部床单/地毯底面
    ctx.fillStyle = baseGrad;
    ctx.fillRect(0, 0, 750, 1624);

    // ─── 2. 梦的地面（画布 y: 540..1080，屏幕 y: 250..790）：平、静、中间调水粉笔触，无颗粒 ───
    for (let i = 0; i < 380; i++) {
      const u = i / 380;
      const y = 535 + u * 545 + (rng() - 0.5) * 16;
      const x = rng() * 750;
      const distCenter = Math.abs(x - 375) / 375;
      const col = distCenter > 0.74
        ? (rng() > 0.4 ? night[2] : night[1])
        : (rng() > 0.45 ? night[0] : night[1]);
      const len = 36 + rng() * 68;
      const wid = 7.0 + rng() * 11.0;
      const ang = (rng() - 0.5) * 0.12;
      const alpha = distCenter < 0.58 ? (0.12 + rng() * 0.12) : (0.16 + rng() * 0.16);

      drawShortGouacheDab(ctx, x, y, len, wid, ang, col, alpha, {
        seed: seed + i * 13,
        boil,
        boilAmp: 0.25,
        drySplit: (i % 5 === 0)
      });
    }

    for (let p = 0; p < 6; p++) {
      const topX = 115 + p * 104;
      const botX = 45 + p * 132;
      drawGouacheStroke(ctx, [
        { x: topX, y: 555 },
        { x: lerp(topX, botX, 0.5) + (p - 2.5) * 4, y: 810 },
        { x: botX, y: 1064 }
      ], {
        color: night[2],
        alpha: 0.14,
        maxWeight: 2.4,
        minWeight: 0.8,
        seed: seed + 1200 + p * 19,
        boil,
        boilAmp: 0.2
      });
    }

    // ─── 3. 左右两边与顶上的梦里卧室远景（暗、低对比，避开左上栅栏与右手电按钮） ───

    // 3a) 右上雾边：微微歪斜的梦里大衣柜（x: 470..645, y: 210..485）
    const closetBody = subdivideSpline([
      { x: 478, y: 225 },
      { x: 638, y: 214 },
      { x: 646, y: 475 },
      { x: 470, y: 482 }
    ], true, 3);
    fillGouache(ctx, closetBody, ['#262344', '#1E1B38', '#17142C', '#120F24'], {
      seed: seed + 2001,
      boil,
      alpha: 0.72
    });
    for (let k = 0; k < 24; k++) {
      const cx = 482 + rng() * 152;
      const cy = 235 + rng() * 230;
      drawShortGouacheDab(ctx, cx, cy, 26 + rng() * 24, 5 + rng() * 4, 1.52, '#1B1833', 0.35, {
        seed: seed + 2050 + k * 7,
        boil,
        drySplit: true
      });
    }
    drawGouacheStroke(ctx, [
      { x: 556, y: 226 },
      { x: 553, y: 355 },
      { x: 558, y: 476 }
    ], {
      color: '#0D0B1A',
      alpha: 0.82,
      maxWeight: 7.5,
      minWeight: 2.2,
      seed: seed + 2101,
      boil
    });
    drawGouacheStroke(ctx, [
      { x: 560, y: 245 },
      { x: 557, y: 355 },
      { x: 561, y: 460 }
    ], {
      color: '#463F78',
      alpha: 0.25,
      maxWeight: 2.2,
      minWeight: 0.7,
      seed: seed + 2109,
      boil
    });

    // 3b) 右侧中上部：歪斜的卧室窗户与柔和月光（x: 658..750, y: 520..760）
    const winFrame = subdivideSpline([
      { x: 672, y: 525 },
      { x: 748, y: 505 },
      { x: 748, y: 745 },
      { x: 664, y: 760 }
    ], true, 3);
    fillGouache(ctx, winFrame, ['#3F4878', '#313862', '#252B4E', '#1D223E'], {
      seed: seed + 2201,
      boil,
      alpha: 0.45
    });
    drawGouacheStroke(ctx, [{ x: 706, y: 515 }, { x: 702, y: 752 }], {
      color: night[2],
      alpha: 0.55,
      maxWeight: 4.5,
      minWeight: 2.5,
      seed: seed + 2211,
      boil
    });
    drawGouacheStroke(ctx, [{ x: 668, y: 638 }, { x: 748, y: 622 }], {
      color: night[2],
      alpha: 0.55,
      maxWeight: 4.5,
      minWeight: 2.5,
      seed: seed + 2217,
      boil
    });
    for (let m = 0; m < 16; m++) {
      const mx = 635 + rng() * 105;
      const my = 660 + rng() * 130;
      drawShortGouacheDab(ctx, mx, my, 36 + rng() * 30, 8 + rng() * 6, -0.38, '#4A5284', 0.15, {
        seed: seed + 2250 + m * 11,
        boil,
        drySplit: true
      });
    }

    // 3c) 左侧边缘中段：矮玩具架剪影（x: 0..82, y: 575..835）
    const shelfPts = subdivideSpline([
      { x: 0, y: 580 },
      { x: 76, y: 592 },
      { x: 68, y: 828 },
      { x: 0, y: 838 }
    ], true, 3);
    fillGouache(ctx, shelfPts, ['#282C50', '#202442', '#191C36', '#14172C'], {
      seed: seed + 2301,
      boil,
      alpha: 0.62
    });
    for (const sy of [660, 742]) {
      drawGouacheStroke(ctx, [{ x: 0, y: sy }, { x: 72, y: sy + 8 }], {
        color: '#171A32',
        alpha: 0.65,
        maxWeight: 4.2,
        minWeight: 2.0,
        seed: seed + sy,
        boil
      });
    }
    for (let k = 0; k < 18; k++) {
      drawShortGouacheDab(
        ctx,
        10 + rng() * 58,
        590 + rng() * 230,
        22 + rng() * 20,
        5 + rng() * 4,
        0.12,
        '#232748',
        0.32,
        { seed: seed + 2350 + k * 9, boil }
      );
    }

    // ─── 4. 顶上一片雾（画布 y: 0..552，到屏幕 y≈262 渐淡） ───
    const fogGrad = ctx.createLinearGradient(0, 0, 0, 585);
    fogGrad.addColorStop(0.00, rgba(fog[3], 0.94));
    fogGrad.addColorStop(0.55, rgba(fog[1], 0.82));
    fogGrad.addColorStop(0.86, rgba(fog[0], 0.45));
    fogGrad.addColorStop(1.00, rgba(fog[0], 0.00));
    ctx.fillStyle = fogGrad;
    ctx.fillRect(0, 0, 750, 585);

    for (let i = 0; i < 220; i++) {
      const fy = rng() * 565;
      const fx = rng() * 750;
      const inFenceZone = fx < 165 && fy > 440 && fy < 525;
      const fCol = inFenceZone
        ? '#383460'
        : (fy < 320 ? fog[2] : fy < 480 ? fog[0] : night[1]);
      const fAlpha = inFenceZone
        ? 0.20
        : (fy > 500 ? (1 - (fy - 500) / 70) * 0.34 : 0.28 + rng() * 0.26);

      if (fAlpha > 0.02) {
        drawShortGouacheDab(
          ctx,
          fx,
          fy,
          42 + rng() * 75,
          10 + rng() * 16,
          (rng() - 0.5) * 0.28,
          fCol,
          fAlpha,
          { seed: seed + 3000 + i * 11, boil, boilAmp: 0.4, drySplit: (i % 3 === 0) }
        );
      }
    }

    // ─── 5. 底下 560 高（屏幕 y 774..1334，画布 y 1064..1624）：月牙窝床单底面（干净无颗粒） ───
    const sheetGrad = ctx.createLinearGradient(0, 1050, 0, 1624);
    sheetGrad.addColorStop(0.0, rgba('#2E335A', 0.0));
    sheetGrad.addColorStop(0.12, rgba('#2E335A', 0.65));
    sheetGrad.addColorStop(1.0, rgba('#232746', 0.92));
    ctx.fillStyle = sheetGrad;
    ctx.fillRect(0, 1050, 750, 574);

    for (let i = 0; i < 240; i++) {
      const x = rng() * 750;
      const y = 1068 + rng() * 550;
      if (Math.hypot(x - 690, y - 1120) < 64) continue;

      const dx = x - 375;
      const dy = y - 1460;
      const tang = Math.atan2(dy, dx) + Math.PI * 0.5 + (rng() - 0.5) * 0.25;
      const col = rng() > 0.5 ? '#353A64' : '#282C4E';

      drawShortGouacheDab(
        ctx,
        x,
        y,
        36 + rng() * 58,
        8 + rng() * 12,
        tang,
        col,
        0.15 + rng() * 0.14,
        { seed: seed + 4000 + i * 13, boil, boilAmp: 0.25, drySplit: (i % 5 === 0) }
      );
    }

    for (const r of [385, 310, 220]) {
      const arcPts = [];
      for (let k = 0; k <= 16; k++) {
        const a = Math.PI + (k / 16) * Math.PI;
        const px = 375 + Math.cos(a) * r;
        const py = 1460 + Math.sin(a) * r;
        if (py >= 1064 && py <= 1620 && Math.hypot(px - 690, py - 1120) > 62) {
          arcPts.push({ x: px, y: py });
        }
      }
      if (arcPts.length >= 4) {
        drawGouacheStroke(ctx, arcPts, {
          color: '#222646',
          alpha: 0.26,
          maxWeight: 8.5,
          minWeight: 2.0,
          seed: seed + 5000 + r,
          boil,
          dryFeibai: true
        });
      }
    }

    // ─── 6. 局部颗粒层（1.5 节第 5 条：中间噩梦走的那片地 y 552–1064 和底下窝的位置几乎不要颗粒，颗粒只留给雾和两边暗处） ───
    const gLevel = getGrain();
    if (gLevel > 0.005) {
      const fogTile = getGrainTile(boil, fog[3], 1.0);
      const sideTile = getGrainTile(boil + 1, night[3], 0.85);

      if (fogTile) {
        // 顶上雾区 (y: 0..552) 铺一层柔和同色系颗粒
        ctx.save();
        ctx.beginPath();
        ctx.rect(0, 0, 750, 552);
        ctx.clip();
        ctx.globalAlpha = 0.22 * gLevel;
        for (let y = 0; y < 552; y += fogTile.height) {
          for (let x = 0; x < 750; x += fogTile.width) {
            ctx.drawImage(fogTile, x, y);
          }
        }
        ctx.restore();
      }

      if (sideTile) {
        // 左右两边暗处边缘 (x: 0..88, x: 662..750, y: 552..1050) 铺薄颗粒，中间地面与窝内完全不铺颗粒！
        ctx.save();
        ctx.beginPath();
        ctx.rect(0, 552, 88, 498);
        ctx.rect(662, 552, 88, 498);
        ctx.clip();
        ctx.globalAlpha = 0.16 * gLevel;
        for (let y = 552; y < 1050; y += sideTile.height) {
          for (let x = 0; x < 96; x += sideTile.width) {
            ctx.drawImage(sideTile, x, y);
          }
          for (let x = 660; x < 750; x += sideTile.width) {
            ctx.drawImage(sideTile, x, y);
          }
        }
        ctx.restore();
      }
    }

    // 四周微暗角压边
    const vigL = ctx.createLinearGradient(0, 0, 105, 0);
    vigL.addColorStop(0, rgba(night[3], 0.42));
    vigL.addColorStop(1, rgba(night[3], 0));
    ctx.fillStyle = vigL;
    ctx.fillRect(0, 0, 105, 1624);

    const vigR = ctx.createLinearGradient(750, 0, 645, 0);
    vigR.addColorStop(0, rgba(night[3], 0.42));
    vigR.addColorStop(1, rgba(night[3], 0));
    ctx.fillStyle = vigR;
    ctx.fillRect(645, 0, 105, 1624);

    ctx.restore();
  }
};


};
__defs["captain_mianmian.js"] = function (__e) {
// 《枕头堡》P1 美术代码：captain_mianmian（绵绵：旧绵羊玩偶，领头羊 · L1 · 第 2 批返修）
// 返修重点：
// 1. 严格按 1.5 节重做颗粒：脸部 (facePts) 0 颗粒 (noGrain: true)，白羊毛受光面 0 颗粒，暗面仅铺一层极柔和同色系浅灰毛绒颗粒，3× 下白毛与脸部干净无脏点；
// 2. 升级支持 L1 新接口 facings: ['front']；
// 3. 3 张沸腾变体之间靠卷毛轮廓边与水粉短笔触明显呼吸跳动。

const {
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
} = __req("kit/index.js");

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

__e.default = {
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


};
__defs["fx_warm.js"] = function (__e) {
// 《枕头堡》P1 美术代码：fx_warm（暖属性特效笔刷与粒子配方 · L3 · 第 2 批返修）
// 返修重点：
// 1. 呼呼改吐小火球（shot_huhu），按要求删掉 breath 配方，保留 hit 与 burn；
// 2. 笔刷颗粒跟随新画笔库 1.5 节规范减量并采用同色系深一档。

const {
  PALETTE,
  hash32,
  subdivideSpline,
  paintGouacheBody,
  drawGouacheStroke,
  drawShortGouacheDab,
  drawRadialGlow
} = __req("kit/index.js");

function buildPuffCloud(cx, cy, r, lobes = 7, seed = 1, boil = 0) {
  const pts = [];
  const n = lobes * 4;
  for (let i = 0; i < n; i++) {
    const u = i / n;
    const a = u * Math.PI * 2;
    const bump = 0.82 + 0.24 * Math.abs(Math.sin(u * lobes * Math.PI)) + (hash32(seed, i, boil) - 0.5) * 0.14;
    pts.push({
      x: cx + Math.cos(a) * r * bump,
      y: cy + Math.sin(a) * r * bump
    });
  }
  return subdivideSpline(pts, true, 2);
}

__e.default = {
  key: 'fx_warm',
  level: 'L3',

  brushes: {
    puff: {
      size: [48, 48],
      draw(ctx, opt = {}) {
        const seed = opt.seed || 501;
        const boil = opt.boil || 0;
        const warm = PALETTE.elements.warm;

        const cloudPts = buildPuffCloud(24, 24, 17.5, 7, seed, boil);
        paintGouacheBody(ctx, cloudPts, warm, {
          seed,
          boil,
          boilAmp: 1.1,
          surfaceStrokes: 32,
          edgeStrokes: 26,
          grainAlpha: 0.22,
          showRim: true,
          rimColor: warm[0],
          rimAlpha: 0.72,
          fuzz: true
        });

        for (let i = 0; i < 12; i++) {
          const a = (i / 12) * Math.PI * 2 + (hash32(seed, i, boil) - 0.5) * 0.35;
          const dist = 15.5 + hash32(seed + 19, i, boil) * 4.5;
          const px = 24 + Math.cos(a) * dist;
          const py = 24 + Math.sin(a) * dist;
          const col = i % 3 === 0 ? warm[0] : i % 2 === 0 ? warm[1] : warm[2];
          drawShortGouacheDab(
            ctx,
            px,
            py,
            8.5 + hash32(seed, i, 7) * 4.5,
            3.2 + hash32(seed, i, 9) * 1.8,
            a + Math.PI * 0.42,
            col,
            0.68,
            { seed: seed + 100 + i * 13, boil, boilAmp: 0.9, drySplit: true }
          );
        }

        drawGouacheStroke(ctx, [
          { x: 14, y: 27 },
          { x: 22, y: 16 },
          { x: 33, y: 21 }
        ], {
          color: warm[0],
          alpha: 0.78,
          maxWeight: 4.6,
          minWeight: 1.0,
          seed: seed + 211,
          boil,
          dryFeibai: true
        });
        drawGouacheStroke(ctx, [
          { x: 17, y: 32 },
          { x: 27, y: 29 },
          { x: 34, y: 23 }
        ], {
          color: warm[1],
          alpha: 0.65,
          maxWeight: 3.8,
          minWeight: 0.9,
          seed: seed + 223,
          boil,
          dryFeibai: true
        });
      }
    },

    spark: {
      size: [16, 16],
      draw(ctx, opt = {}) {
        const seed = opt.seed || 509;
        const boil = opt.boil || 0;
        const warm = PALETTE.elements.warm;

        drawRadialGlow(ctx, 8, 8, 7.5, warm[1], 0.55);

        const angles = [0, Math.PI * 0.5, 0.65, -0.65, 1.1, -1.1];
        for (let i = 0; i < angles.length; i++) {
          const isMain = i < 2;
          drawShortGouacheDab(
            ctx,
            8,
            8,
            isMain ? 12.5 : 8.2,
            isMain ? 3.4 : 2.2,
            angles[i] + (hash32(seed, i, boil) - 0.5) * 0.2,
            isMain ? warm[0] : warm[1],
            isMain ? 0.92 : 0.75,
            { seed: seed + i * 17, boil, boilAmp: 0.5, drySplit: true }
          );
        }

        drawShortGouacheDab(ctx, 8, 8, 4.5, 3.5, 0.2, '#FFFFFF', 0.95, {
          seed: seed + 99,
          boil,
          boilAmp: 0.3
        });
      }
    },

    glow: {
      size: [32, 32],
      draw(ctx, opt = {}) {
        const seed = opt.seed || 521;
        const boil = opt.boil || 0;
        const warm = PALETTE.elements.warm;

        drawRadialGlow(ctx, 16, 16, 15, warm[2], 0.45);
        drawRadialGlow(ctx, 16, 16, 10, warm[1], 0.65);

        for (let i = 0; i < 14; i++) {
          const a = (i / 14) * Math.PI * 2 + (hash32(seed, i, boil) - 0.5) * 0.4;
          const r = 2.5 + hash32(seed + 7, i, boil) * 7.5;
          drawShortGouacheDab(
            ctx,
            16 + Math.cos(a) * r,
            16 + Math.sin(a) * r,
            7.2,
            3.2,
            a + Math.PI * 0.5,
            i % 2 === 0 ? warm[0] : warm[1],
            0.62,
            { seed: seed + i * 19, boil, boilAmp: 0.6, drySplit: true }
          );
        }
      }
    }
  },

  effects: {
    // 打中噩梦时的暖火迸溅
    hit: {
      brush: ['puff', 'spark', 'glow'],
      count: [6, 10],
      life: [0.25, 0.45],
      speed: [60, 180],
      angle: [0, 360],
      scale: [0.6, 1.0, 0.2],
      alpha: [1, 0],
      tint: ['#FFD35E', '#FF9A45'],
      blend: 'add',
      spin: [-140, 140]
    },
    // 烘状态：附着在目标身上持续往上冒的暖色小热烟
    burn: {
      attach: 'target',
      loop: true,
      brush: ['puff', 'spark'],
      rate: 8,
      life: [0.4, 0.7],
      speed: [14, 34],
      angle: [250, 290],
      scale: [0.4, 0.7, 0.1],
      alpha: [0.82, 0],
      tint: ['#FF9A45', '#FFD35E'],
      blend: 'normal',
      spin: [-60, 60]
    }
  },

  draw(ctx, opt = {}) {
    const seed = opt.seed || 501;
    const boil = opt.boil || 0;
    ctx.save();
    this.brushes.puff.draw(ctx, { seed, boil });
    ctx.translate(52, 8);
    this.brushes.glow.draw(ctx, { seed: seed + 17, boil });
    ctx.translate(36, 8);
    this.brushes.spark.draw(ctx, { seed: seed + 31, boil });
    ctx.restore();
  }
};


};
__defs["kit/index.js"] = function (__e) {
// 《枕头堡》P1 共用画笔库：水粉颗粒（夜色）+ 水粉短笔触叠画与沸腾系统（第 2 批颗粒减量升级版）
// 严格遵守《美术技术方案.md》3.3 硬规则与《美术文档-P1.md》1.5 节颗粒规范：
// 1. 仅使用 Canvas2D 标准接口，100% 确定性，无外部依赖；
// 2. 颗粒只在暗面和边缘（背光那一半 + 宽 ≤ 短边 12% 的外圈，受光面、脸、高光、白毛受光面一颗都不要）；
// 3. 同色系深一档（白毛用 wool 第 3 档再淡一点），不用统一的深蓝灰，不撒亮点；
// 4. 灰度亮度差 ≤ 6%，暗面内点面积 ≤ 1/10，点直径 0.8–1.6 设计像素，只铺一层（贴图 clip + drawImage，不叠斑点）；
// 5. 导出 setGrain(k) / getGrain() 总旋钮（0–1，透明度和数量均乘 k，0 = 完全没有颗粒）；
// 6. 沸腾主要靠水粉短笔触边和轮廓起伏变化。

const { PALETTE } = __req("palette.js");



// ─── 0. 颗粒强度总旋钮 (0..1) ───
let GRAIN_STRENGTH = 1.0;

function setGrain(k) {
  const v = Number(k);
  GRAIN_STRENGTH = Number.isFinite(v) ? clamp(v, 0, 1) : 1.0;
}

function getGrain() {
  return GRAIN_STRENGTH;
}

// ─── 1. 确定性哈希、伪随机与噪声 ───
function hash32(x, y = 0, z = 0) {
  let h = (Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263) + Math.imul(z | 0, 2147483647)) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

function createRng(seed = 1, boil = 0) {
  let s = (Math.imul((seed | 0) + 1013, 747796405) + Math.imul((boil | 0) * 19937, 2891336453) + 1013904223) | 0;
  return function rand() {
    s = (s + 0x6D2B79F5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function clamp(v, lo, hi) {
  return v < lo ? lo : v > hi ? hi : v;
}

function smoothstep(t) {
  const u = clamp(t, 0, 1);
  return u * u * (3 - 2 * u);
}

function noise2D(x, y, seed = 1) {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const xf = x - xi;
  const yf = y - yi;
  const u = xf * xf * (3 - 2 * xf);
  const v = yf * yf * (3 - 2 * yf);
  const s = (seed | 0) + 1337;
  const n00 = hash32(xi, yi, s);
  const n10 = hash32(xi + 1, yi, s);
  const n01 = hash32(xi, yi + 1, s);
  const n11 = hash32(xi + 1, yi + 1, s);
  return lerp(lerp(n00, n10, u), lerp(n01, n11, u), v);
}

function fbm2D(x, y, seed = 1) {
  return 0.65 * noise2D(x, y, seed) + 0.35 * noise2D(x * 2.17 + 19.3, y * 2.17 + 37.1, seed + 97);
}

// ─── 2. 颜色解析与同色系颗粒色计算 ───
const HEX_CACHE = {};
function hexToRgb(hex) {
  if (!hex || typeof hex !== 'string') return { r: 255, g: 255, b: 255 };
  if (HEX_CACHE[hex]) return HEX_CACHE[hex];
  let c = hex.charAt(0) === '#' ? hex.slice(1) : hex;
  if (c.length === 3) c = c[0] + c[0] + c[1] + c[1] + c[2] + c[2];
  const num = parseInt(c, 16) || 0;
  const rgb = { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
  HEX_CACHE[hex] = rgb;
  return rgb;
}

function rgba(hex, alpha = 1) {
  const { r, g, b } = hexToRgb(hex);
  const a = clamp(alpha, 0, 1);
  return `rgba(${r},${g},${b},${a.toFixed(3)})`;
}

function mixHex(hex1, hex2, t = 0.5) {
  const c1 = hexToRgb(hex1);
  const c2 = hexToRgb(hex2);
  const u = clamp(t, 0, 1);
  const r = Math.round(lerp(c1.r, c2.r, u));
  const g = Math.round(lerp(c1.g, c2.g, u));
  const b = Math.round(lerp(c1.b, c2.b, u));
  return '#' + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1);
}

function getRamp(nameOrArray) {
  if (Array.isArray(nameOrArray)) return nameOrArray;
  return PALETTE.ramps[nameOrArray] || PALETTE.ramps.moss;
}

/**
 * 1.5 节第 2 条：计算同色系深一档的颗粒颜色（绝不用统一的深蓝灰 #121733，不撒亮点）
 * - 白毛 (wool) 用第 3 档 (#D6D2DE) 再淡一点；
 * - 其余色族用暗面底色在自身色族里深一档 (ramp[2] -> ramp[3])。
 */
function resolveSameFamilyGrainColor(ramp) {
  if (!ramp || !ramp.length) return '#556070';
  const c0 = (ramp[0] || '').toUpperCase();
  // 白毛 wool: ['#FFFDF6', '#F2EEE4', '#D6D2DE', '#ABA7BE'] -> 用第 3 档再淡一点
  if (c0 === '#FFFDF6') {
    return mixHex(ramp[1] || '#F2EEE4', ramp[2] || '#D6D2DE', 0.65);
  }
  // 奶油色 cream -> 用第 3 档柔和暖驼色
  if (c0 === '#FFF6DC') {
    return mixHex(ramp[1] || '#F6E2A4', ramp[2] || '#DFC27A', 0.62);
  }
  const s2 = ramp[2] || ramp[1] || ramp[0];
  const s3 = ramp[3] || s2;
  return mixHex(s2, s3, 0.72);
}

// ─── 3. 离屏画布工厂与单层同色系颗粒贴图池（1.5 节：只铺一层、不撒亮点、直径 0.8–1.6px、面积 ≤ 1/10） ───
function createOffscreenCanvas(w, h) {
  if (typeof wx !== 'undefined' && typeof wx.createCanvas === 'function') {
    const c = wx.createCanvas();
    c.width = w;
    c.height = h;
    return c;
  }
  if (typeof document !== 'undefined' && typeof document.createElement === 'function') {
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    return c;
  }
  if (typeof OffscreenCanvas !== 'undefined') {
    return new OffscreenCanvas(w, h);
  }
  return null;
}

const GRAIN_TILES = new Map();

/**
 * 生成或获取 96×96 同色系水粉颗粒贴图：
 * - 点的直径严格在 0.8 ~ 1.6 设计像素（半径 0.40 ~ 0.80 px）；
 * - 点的数量随 GRAIN_STRENGTH 缩放，k=1 时 190 颗点占 96×96 面积仅约 2.3%（远低于 ≤ 1/10 上限）；
 * - 只用同色系深一档颜色，不撒任何亮点，灰度下亮度差 ≤ 5%（低于 6% 上限）。
 */
function getGrainTile(variant = 0, colorHex = '#485066', countScale = 1.0) {
  const effK = clamp(GRAIN_STRENGTH * countScale, 0, 1);
  if (effK <= 0.005) return null;
  const kBucket = Math.max(1, Math.round(effK * 20));
  const vIdx = ((variant | 0) % 6 + 6) % 6;
  const colKey = (colorHex && colorHex.startsWith('#')) ? colorHex : PALETTE.ramps.night[2];
  const key = `${colKey}_${vIdx}_${kBucket}`;
  if (GRAIN_TILES.has(key)) return GRAIN_TILES.get(key);

  const size = 96;
  const canvas = createOffscreenCanvas(size, size);
  if (!canvas) return null;
  const gctx = canvas.getContext('2d');
  const rng = createRng(7001 + vIdx * 313, vIdx);

  // k=1 时 185 颗细颗粒（平均半径 0.6px，单点面积 ~1.13px²，总面积占比 ~2.2% <= 10%）
  const dotCount = Math.round(185 * (kBucket / 20));
  for (let i = 0; i < dotCount; i++) {
    const x = rng() * size;
    const y = rng() * size;
    // 直径 0.8–1.6 设计像素 => 半径 r = 0.40..0.80
    const r = 0.40 + rng() * 0.40;
    const a = 0.24 + rng() * 0.16;
    gctx.fillStyle = rgba(colKey, a);

    const wrapX = x > size - 2 ? [x, x - size] : x < 2 ? [x, x + size] : [x];
    const wrapY = y > size - 2 ? [y, y - size] : y < 2 ? [y, y + size] : [y];
    for (const wx of wrapX) {
      for (const wy of wrapY) {
        gctx.beginPath();
        gctx.arc(wx, wy, r, 0, Math.PI * 2);
        gctx.fill();
      }
    }
  }

  GRAIN_TILES.set(key, canvas);
  return canvas;
}

// ─── 4. 几何采样、样条细分与法线计算 ───
function sampleSuperEllipse(cx, cy, rx, ry, nPts = 36, power = 2.0, asym = null) {
  const pts = [];
  for (let i = 0; i < nPts; i++) {
    const a = (i / nPts) * Math.PI * 2;
    const ca = Math.cos(a);
    const sa = Math.sin(a);
    let x = Math.sign(ca) * Math.pow(Math.abs(ca), 2 / power) * rx;
    let y = Math.sign(sa) * Math.pow(Math.abs(sa), 2 / power) * ry;
    if (asym) {
      const mod = asym(a, ca, sa);
      if (mod) {
        if (mod.x !== undefined) x = mod.x;
        else x = x * (mod.sx !== undefined ? mod.sx : 1) + (mod.dx || 0);
        if (mod.y !== undefined) y = mod.y;
        else y = y * (mod.sy !== undefined ? mod.sy : 1) + (mod.dy || 0);
      }
    }
    pts.push({ x: cx + x, y: cy + y, a });
  }
  return pts;
}

function subdivideSpline(ctrlPts, closed = true, subdivisions = 4) {
  const n = ctrlPts.length;
  if (n < 2) return ctrlPts.slice();
  const out = [];
  const count = closed ? n : n - 1;
  for (let i = 0; i < count; i++) {
    const p0 = ctrlPts[(i - 1 + n) % n];
    const p1 = ctrlPts[i];
    const p2 = ctrlPts[(i + 1) % n];
    const p3 = ctrlPts[(i + 2) % n];
    const c0 = (!closed && i === 0) ? p1 : p0;
    const c3 = (!closed && i === count - 1) ? p2 : p3;

    for (let j = 0; j < subdivisions; j++) {
      const t = j / subdivisions;
      const t2 = t * t;
      const t3 = t2 * t;
      const x = 0.5 * (
        (2 * p1.x) +
        (-c0.x + p2.x) * t +
        (2 * c0.x - 5 * p1.x + 4 * p2.x - c3.x) * t2 +
        (-c0.x + 3 * p1.x - 3 * p2.x + c3.x) * t3
      );
      const y = 0.5 * (
        (2 * p1.y) +
        (-c0.y + p2.y) * t +
        (2 * c0.y - 5 * p1.y + 4 * p2.y - c3.y) * t2 +
        (-c0.y + 3 * p1.y - 3 * p2.y + c3.y) * t3
      );
      const w = (p1.w !== undefined && p2.w !== undefined) ? lerp(p1.w, p2.w, t) : 1.0;
      out.push({ x, y, w });
    }
  }
  if (!closed) {
    const last = ctrlPts[n - 1];
    out.push({ x: last.x, y: last.y, w: last.w !== undefined ? last.w : 1.0 });
  }
  return out;
}

function computeNormals(pts, closed = true) {
  const n = pts.length;
  if (n === 0) return [];
  let cx = 0, cy = 0;
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (let i = 0; i < n; i++) {
    const p = pts[i];
    cx += p.x;
    cy += p.y;
    if (p.x < minX) minX = p.x;
    if (p.x > maxX) maxX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.y > maxY) maxY = p.y;
  }
  cx /= n;
  cy /= n;

  const res = new Array(n);
  for (let i = 0; i < n; i++) {
    const prev = closed ? pts[(i - 1 + n) % n] : pts[Math.max(0, i - 1)];
    const next = closed ? pts[(i + 1) % n] : pts[Math.min(n - 1, i + 1)];
    let tx = next.x - prev.x;
    let ty = next.y - prev.y;
    const len = Math.hypot(tx, ty) || 1;
    tx /= len;
    ty /= len;
    let nx = ty;
    let ny = -tx;
    if (closed) {
      const vx = pts[i].x - cx;
      const vy = pts[i].y - cy;
      if (nx * vx + ny * vy < 0) {
        nx = -nx;
        ny = -ny;
      }
    }
    res[i] = {
      x: pts[i].x,
      y: pts[i].y,
      w: pts[i].w !== undefined ? pts[i].w : 1.0,
      tx, ty, nx, ny,
      angle: closed ? Math.atan2(pts[i].y - cy, pts[i].x - cx) : Math.atan2(ny, nx)
    };
  }
  res.bounds = {
    cx, cy, minX, maxX, minY, maxY,
    w: Math.max(4, maxX - minX),
    h: Math.max(4, maxY - minY),
    rx: Math.max(2, (maxX - minX) * 0.5),
    ry: Math.max(2, (maxY - minY) * 0.5)
  };
  return res;
}

function extractContiguousArc(norms, startDeg, endDeg, inwardOffsetX = 0, inwardOffsetY = 0) {
  const n = norms.length;
  if (n < 3) return [];
  const span = ((endDeg - startDeg) % 360 + 360) % 360;

  function inArc(angRad) {
    const deg = (angRad * 180) / Math.PI;
    const rel = ((deg - startDeg) % 360 + 360) % 360;
    return rel <= span;
  }

  let firstOutside = -1;
  for (let i = 0; i < n; i++) {
    if (!inArc(norms[i].angle)) {
      firstOutside = i;
      break;
    }
  }
  if (firstOutside === -1) {
    return norms.map(p => ({
      x: p.x - p.nx * inwardOffsetX,
      y: p.y - p.ny * inwardOffsetY,
      nx: p.nx, ny: p.ny, tx: p.tx, ty: p.ty, angle: p.angle
    }));
  }

  let bestRun = [];
  let curRun = [];
  for (let k = 0; k < n; k++) {
    const idx = (firstOutside + k) % n;
    const p = norms[idx];
    if (inArc(p.angle)) {
      curRun.push({
        x: p.x - p.nx * inwardOffsetX,
        y: p.y - p.ny * inwardOffsetY,
        nx: p.nx, ny: p.ny, tx: p.tx, ty: p.ty, angle: p.angle
      });
    } else if (curRun.length > 0) {
      if (curRun.length > bestRun.length) bestRun = curRun;
      curRun = [];
    }
  }
  if (curRun.length > bestRun.length) bestRun = curRun;
  return bestRun;
}

// ─── 5. 水粉短笔触与干笔飞白画笔（沸腾主要靠笔触边和轮廓在变） ───

function drawShortGouacheDab(ctx, x, y, len, width, angle, color, alpha = 0.45, opt = {}) {
  const {
    seed = 1,
    boil = 0,
    boilAmp = 0.95,
    curve = 0,
    taperStart = 0.25,
    taperEnd = 0.35,
    drySplit = false
  } = opt;

  const bShiftX = (hash32(seed, boil * 17 + 1, 11) - 0.5) * 2.2 * boilAmp;
  const bShiftY = (hash32(seed, boil * 17 + 2, 13) - 0.5) * 2.2 * boilAmp;
  const bAng = angle + (hash32(seed, boil * 17 + 3, 17) - 0.5) * 0.16 * boilAmp;

  const ca = Math.cos(bAng);
  const sa = Math.sin(bAng);
  const nx = -sa;
  const ny = ca;

  const cx = x + bShiftX;
  const cy = y + bShiftY;
  const halfL = len * 0.5;
  const hw = width * 0.5 * (0.84 + 0.32 * hash32(seed, boil + 5, 19));
  const midCurve = curve + (hash32(seed, boil + 7, 23) - 0.5) * width * 0.38;

  const x0 = cx - ca * halfL;
  const y0 = cy - sa * halfL;
  const x1 = cx + ca * halfL;
  const y1 = cy + sa * halfL;
  const xm = cx + nx * midCurve;
  const ym = cy + ny * midCurve;

  const wStart = hw * taperStart;
  const wMidL = hw * (0.9 + 0.26 * hash32(seed, 31, boil));
  const wMidR = hw * (0.85 + 0.26 * hash32(seed, 37, boil));
  const wEnd = hw * taperEnd;

  ctx.fillStyle = alpha < 0.999 ? rgba(color, alpha) : color;
  ctx.beginPath();
  ctx.moveTo(x0 + nx * wStart, y0 + ny * wStart);
  ctx.lineTo(xm + nx * wMidL, ym + ny * wMidL);
  ctx.lineTo(x1 + nx * wEnd, y1 + ny * wEnd);
  ctx.lineTo(xm - nx * wMidR, ym - ny * wMidR);
  ctx.fill();

  if (drySplit) {
    const side = hash32(seed, 41, boil) > 0.5 ? 1 : -1;
    const offN = side * hw * (0.75 + 0.3 * hash32(seed, 43, boil));
    const sx0 = xm + nx * offN - ca * halfL * 0.2;
    const sy0 = ym + ny * offN - sa * halfL * 0.2;
    const sx1 = x1 + ca * (len * 0.18) + nx * offN * 1.1;
    const sy1 = y1 + sa * (len * 0.18) + ny * offN * 1.1;
    const sw = Math.max(0.45, hw * 0.32);

    ctx.beginPath();
    ctx.moveTo(sx0, sy0);
    ctx.lineTo((sx0 + sx1) * 0.5 + nx * sw, (sy0 + sy1) * 0.5 + ny * sw);
    ctx.lineTo(sx1, sy1);
    ctx.fill();
  }
}

function drawGouacheStroke(ctx, rawPts, options = {}) {
  if (!rawPts || rawPts.length < 2) return;
  const {
    color = PALETTE.rim,
    alpha = 0.65,
    maxWeight = 5.0,
    minWeight = 1.0,
    seed = 101,
    boil = 0,
    boilAmp = 0.9,
    taperStart = 0.24,
    taperEnd = 0.28,
    roughness = 0.35,
    dryFeibai = false
  } = options;

  const norms = computeNormals(rawPts, false);
  const n = norms.length;
  const leftPts = [];
  const rightPts = [];

  for (let i = 0; i < n; i++) {
    const s = i / Math.max(1, n - 1);
    const p = norms[i];

    let env = 1.0;
    if (s < taperStart) {
      env = 0.15 + 0.85 * Math.pow(s / Math.max(0.01, taperStart), 0.75);
    } else if (s > 1 - taperEnd) {
      env = 0.10 + 0.90 * Math.pow(Math.max(0, (1 - s) / Math.max(0.01, taperEnd)), 0.82);
    } else {
      env = 0.80 + 0.20 * Math.sin(((s - taperStart) / Math.max(0.01, 1 - taperStart - taperEnd)) * Math.PI);
    }

    const nVal = fbm2D(s * 5.0 + seed * 0.13, boil * 0.83, seed);
    const boilN = boilAmp > 0 ? (noise2D(s * 6.2 + 11.3, boil * 1.41 + seed * 0.09, seed + 37) - 0.5) * 2.2 * boilAmp : 0;

    const wNoise = 1.0 + (nVal - 0.5) * 2.0 * roughness;
    const halfW = Math.max(minWeight * 0.3, (minWeight + (maxWeight - minWeight) * env * wNoise * (p.w || 1)) * 0.5);

    const cx = p.x + p.nx * boilN;
    const cy = p.y + p.ny * boilN;

    leftPts.push({ x: cx + p.nx * halfW, y: cy + p.ny * halfW });
    rightPts.push({ x: cx - p.nx * halfW, y: cy - p.ny * halfW });
  }

  ctx.fillStyle = alpha < 0.999 ? rgba(color, alpha) : color;
  ctx.beginPath();
  ctx.moveTo(leftPts[0].x, leftPts[0].y);
  for (let i = 1; i < n; i++) ctx.lineTo(leftPts[i].x, leftPts[i].y);
  for (let i = n - 1; i >= 0; i--) ctx.lineTo(rightPts[i].x, rightPts[i].y);
  ctx.closePath();
  ctx.fill();

  if (dryFeibai && n >= 3) {
    ctx.beginPath();
    const mid = Math.floor(n * 0.35);
    ctx.moveTo(leftPts[mid].x, leftPts[mid].y);
    for (let i = mid + 1; i < n; i++) {
      const p = norms[i];
      ctx.lineTo(leftPts[i].x + p.nx * maxWeight * 0.22, leftPts[i].y + p.ny * maxWeight * 0.22);
    }
    for (let i = n - 1; i >= mid; i--) {
      ctx.lineTo(leftPts[i].x, leftPts[i].y);
    }
    ctx.closePath();
    ctx.fill();
  }
}

// ─── 6. 底色层 fillGouache、单层暗面颗粒 applyGrain 与 paintGouacheBody ───

function fillGouache(ctx, pts, rampOrName, opt = {}) {
  const ramp = getRamp(rampOrName);
  const {
    seed = 1,
    boil = 0,
    boilAmp = 0.88,
    lightPos = PALETTE.lightOrigin || [0.38, 0.28],
    alpha = 1.0
  } = opt;

  const norms = pts.bounds ? pts : computeNormals(pts, true);
  const n = norms.length;
  if (n < 3) return norms;
  const B = norms.bounds;

  // 随 boil 产生明显的手绘轮廓呼吸起伏（沸腾不靠颗粒，主要靠轮廓边和笔触边变化）
  const bPts = new Array(n);
  for (let i = 0; i < n; i++) {
    const p = norms[i];
    const u = i / n;
    const nWave = fbm2D(Math.cos(u * Math.PI * 2) * 2.2 + 3.7, Math.sin(u * Math.PI * 2) * 2.2 + boil * 1.15, seed + 19);
    const disp = (nWave - 0.48) * 2.6 * boilAmp;
    bPts[i] = {
      x: p.x + p.nx * disp,
      y: p.y + p.ny * disp,
      nx: p.nx, ny: p.ny, tx: p.tx, ty: p.ty, angle: p.angle
    };
  }
  bPts.bounds = B;

  const gx = B.minX + B.w * lightPos[0];
  const gy = B.minY + B.h * lightPos[1];
  const gr = Math.max(B.w, B.h) * 0.92;

  const grad = ctx.createRadialGradient(gx, gy, gr * 0.04, B.cx, B.cy, gr);
  grad.addColorStop(0.0, alpha < 1 ? rgba(ramp[0], alpha) : ramp[0]);
  grad.addColorStop(0.46, alpha < 1 ? rgba(ramp[1], alpha) : ramp[1]);
  grad.addColorStop(0.82, alpha < 1 ? rgba(ramp[2], alpha) : ramp[2]);
  grad.addColorStop(1.0, alpha < 1 ? rgba(ramp[3] || ramp[2], alpha) : (ramp[3] || ramp[2]));

  ctx.beginPath();
  ctx.moveTo(bPts[0].x, bPts[0].y);
  for (let i = 1; i < n; i++) ctx.lineTo(bPts[i].x, bPts[i].y);
  ctx.closePath();
  ctx.fillStyle = grad;
  ctx.fill();

  return bPts;
}

/**
 * 严格按《美术文档-P1.md》1.5 节重做的颗粒函数：
 * 1) 只在暗面和边缘：通过新月形裁剪带将颗粒严格限制在背光侧（右下）及宽 ≤ 短边 12% 的外圈，受光面一颗都没有；
 * 2) 同色系深一档：自动取当前 ramp 深一档颜色（白毛用 wool 第 3 档再淡一点），不用深蓝灰，不撒亮点；
 * 3) 只铺一层：仅用预生成颗粒纹理 clip + drawImage，彻底去除第二层斑点；
 * 4) 灰度下亮度差 ≤ 6%，暗面内颗粒面积 ≤ 1/10；
 * 5) 受 setGrain(k) 总旋钮控制（透明度和点数量都乘 k，k=0 时完全不画）。
 */
function applyGrain(ctx, norms, rampOrName, opt = {}) {
  if (GRAIN_STRENGTH <= 0.001 || opt.noGrain) return;
  const ramp = getRamp(rampOrName);
  const {
    seed = 1,
    boil = 0,
    grainAlpha = 0.26
  } = opt;
  if (grainAlpha <= 0.001) return;

  const pts = norms.bounds ? norms : computeNormals(norms, true);
  const B = pts.bounds;
  const shortSide = Math.min(B.w, B.h);
  if (shortSide < 6) return;

  // 提取背光侧弧段（-38° ~ 138°），完全避开左上受光面 (-180° ~ -38°)
  const shadowArc = extractContiguousArc(pts, -38, 138, 0, 0);
  if (shadowArc.length < 4) return;

  const grainCol = opt.grainColor || resolveSameFamilyGrainColor(ramp);
  const isWoolOrCream = (ramp[0] || '').toUpperCase() === '#FFFDF6' || (ramp[0] || '').toUpperCase() === '#FFF6DC';
  // 浅色毛绒/奶油表面进一步克制透明度，确保 3× 下白毛与肚皮干净柔和、灰度亮度差 ≤ 4%
  const effAlpha = clamp((isWoolOrCream ? grainAlpha * 0.62 : grainAlpha) * GRAIN_STRENGTH, 0, 0.32);
  if (effAlpha <= 0.004) return;

  const tile = getGrainTile(boil + (seed & 5), grainCol, isWoolOrCream ? 0.72 : 1.0);
  if (!tile) return;

  // 构造“背光暗面 + ≤12%短边外沿”的新月形裁剪区，确保左上受光面和形体中心 0 颗粒
  const edgeBand = shortSide * 0.11; // 严格 ≤ 12% 短边
  const shadowBand = shortSide * (isWoolOrCream ? 0.22 : 0.34);

  ctx.save();
  ctx.beginPath();
  ctx.moveTo(shadowArc[0].x, shadowArc[0].y);
  for (let i = 1; i < shadowArc.length; i++) {
    ctx.lineTo(shadowArc[i].x, shadowArc[i].y);
  }
  for (let i = shadowArc.length - 1; i >= 0; i--) {
    const p = shadowArc[i];
    const u = i / Math.max(1, shadowArc.length - 1);
    const bell = Math.sin(u * Math.PI); // 两端收窄至 0，中段（右下背光处）深入暗面
    const inset = edgeBand * Math.sin(u * Math.PI) + (shadowBand - edgeBand) * (bell * bell);
    ctx.lineTo(p.x - p.nx * inset, p.y - p.ny * inset);
  }
  ctx.closePath();
  ctx.clip();

  const ox = Math.floor(hash32(seed, boil, 71) * 64);
  const oy = Math.floor(hash32(seed, boil, 73) * 64);
  ctx.globalAlpha *= effAlpha;
  for (let y = B.minY - oy; y < B.maxY; y += tile.height) {
    for (let x = B.minX - ox; x < B.maxX; x += tile.width) {
      ctx.drawImage(tile, x, y);
    }
  }
  ctx.restore();
}

function paintGouacheBody(ctx, pts, rampOrName, opt = {}) {
  const ramp = getRamp(rampOrName);
  const {
    seed = 1,
    boil = 0,
    boilAmp = 0.95,
    lightPos = PALETTE.lightOrigin || [0.38, 0.28],
    surfaceStrokes = null,
    edgeStrokes = null,
    grainAlpha = 0.26,
    noGrain = false,
    showRim = true,
    rimColor = PALETTE.rim,
    rimAlpha = PALETTE.rimAlpha,
    rimStartDeg = -48,
    rimEndDeg = 68,
    showHighlight = true,
    highlightColor = null,
    fuzz = false,
    stitches = false,
    alpha = 1.0
  } = opt;

  const norms = pts.bounds ? pts : computeNormals(pts, true);
  if (norms.length < 3) return norms;
  const B = norms.bounds;
  const diag = Math.hypot(B.w, B.h);
  const isLightPlush = (ramp[0] || '').toUpperCase() === '#FFFDF6' || (ramp[0] || '').toUpperCase() === '#FFF6DC';

  ctx.save();
  if (alpha < 1.0) ctx.globalAlpha *= alpha;

  // ── Step 1: 柔和径向渐变底色层 (fillGouache) ──
  const bPts = fillGouache(ctx, norms, ramp, { seed, boil, boilAmp, lightPos });

  // ── Step 2: 裁剪在形体内部，沿形体走向叠几十道半透明水粉短笔 ──
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(bPts[0].x, bPts[0].y);
  for (let i = 1; i < bPts.length; i++) ctx.lineTo(bPts[i].x, bPts[i].y);
  ctx.closePath();
  ctx.clip();

  // 2a) 水粉湿画色层（对白毛/奶油浅色表面只叠暖白受光与右下柔暗，避免在亮面产生深色斑块）
  const mottleCount = diag > 50 ? 3 : 2;
  for (let m = 0; m < mottleCount; m++) {
    const mSeed = seed * 43 + m * 89 + boil * 19;
    const mAng = isLightPlush
      ? (0.1 + hash32(mSeed, 1, boil) * 0.65) * Math.PI // 浅色材质色斑仅留在右下暗部
      : hash32(mSeed, 1, boil) * Math.PI * 2;
    const mDist = 0.28 + hash32(mSeed, 2, boil) * 0.42;
    const mx = B.cx + Math.cos(mAng) * B.rx * mDist;
    const my = B.cy + Math.sin(mAng) * B.ry * mDist;
    const mrx = B.rx * (0.24 + hash32(mSeed, 3, boil) * 0.24);
    const mry = B.ry * (0.20 + hash32(mSeed, 4, boil) * 0.22);
    const isDarkSide = (Math.cos(mAng) * 0.62 + Math.sin(mAng) * 0.78) > 0.05;
    const mCol = isDarkSide ? (isLightPlush ? ramp[1] : ramp[2]) : ramp[0];

    ctx.beginPath();
    const steps = 12;
    for (let k = 0; k < steps; k++) {
      const a = (k / steps) * Math.PI * 2;
      const rMod = 0.74 + 0.48 * fbm2D(Math.cos(a) * 1.9 + m * 3.1, Math.sin(a) * 1.9 + boil * 0.7, mSeed);
      const px = mx + Math.cos(a) * mrx * rMod;
      const py = my + Math.sin(a) * mry * rMod;
      if (k === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fillStyle = rgba(mCol, isLightPlush ? 0.18 : (isDarkSide ? 0.26 : 0.22));
    ctx.fill();
  }

  // 2b) 沿形体曲率走向叠几十道水粉短笔（暗处多叠、受光处少叠，带干笔飞白）
  const nSurf = surfaceStrokes !== null
    ? surfaceStrokes
    : clamp(Math.round(diag * 0.56), 24, 68);

  for (let i = 0; i < nSurf; i++) {
    const sSeed = seed * 71 + i * 47;
    const rawU = ((i + 0.5) / nSurf + hash32(sSeed, 1, boil) * 0.08) % 1.0;
    const theta = i * 2.39996 + (hash32(sSeed, 2, boil) - 0.5) * 0.45;
    const dirX = Math.cos(theta);
    const dirY = Math.sin(theta);
    const lightDot = dirX * 0.65 + dirY * 0.76;

    let rFrac = Math.sqrt(rawU) * (0.24 + 0.74 * hash32(sSeed, 3, boil));
    if (lightDot < -0.20 && hash32(sSeed, 4, 0) < 0.48) {
      const shAng = (-0.22 + hash32(sSeed, 5, boil) * 0.90) * Math.PI;
      rFrac = 0.56 + 0.40 * hash32(sSeed, 6, boil);
      const sx = B.cx + Math.cos(shAng) * B.rx * rFrac;
      const sy = B.cy + Math.sin(shAng) * B.ry * rFrac;
      const tang = shAng + Math.PI * 0.5 + (hash32(sSeed, 7, boil) - 0.5) * 0.42;
      const sLen = clamp(diag * (0.14 + 0.14 * hash32(sSeed, 8, boil)), 4.5, 22);
      const sWid = clamp(diag * (0.045 + 0.04 * hash32(sSeed, 9, boil)), 1.6, 6.8);
      const col = isLightPlush
        ? (rFrac > 0.78 ? ramp[2] : ramp[1])
        : (rFrac > 0.74 ? (ramp[3] || ramp[2]) : ramp[2]);
      drawShortGouacheDab(ctx, sx, sy, sLen, sWid, tang, col, isLightPlush ? 0.24 : (0.30 + 0.22 * hash32(sSeed, 10, boil)), {
        seed: sSeed,
        boil,
        boilAmp: boilAmp * 0.95,
        drySplit: (i % 2 === 0)
      });
      continue;
    }

    const sx = B.cx + dirX * B.rx * rFrac;
    const sy = B.cy + dirY * B.ry * rFrac;
    const flowAng = theta + Math.PI * 0.5 + (hash32(sSeed, 11, boil) - 0.5) * 0.48;
    const sLen = clamp(diag * (0.13 + 0.14 * hash32(sSeed, 12, boil)), 4.0, 20);
    const sWid = clamp(diag * (0.04 + 0.04 * hash32(sSeed, 13, boil)), 1.5, 6.2);

    let col, sAlpha;
    if (lightDot > 0.28) {
      col = isLightPlush
        ? (rFrac > 0.78 ? ramp[2] : ramp[1])
        : ((rFrac > 0.72 && ramp[3]) ? ramp[3] : ramp[2]);
      sAlpha = isLightPlush ? 0.24 : (0.28 + 0.22 * hash32(sSeed, 14, boil));
    } else if (lightDot > -0.15) {
      col = isLightPlush ? ramp[1] : (hash32(sSeed, 15, boil) > 0.5 ? ramp[2] : ramp[1]);
      sAlpha = isLightPlush ? 0.20 : (0.22 + 0.18 * hash32(sSeed, 14, boil));
    } else {
      col = ramp[0];
      sAlpha = 0.28 + 0.22 * hash32(sSeed, 14, boil);
    }

    drawShortGouacheDab(ctx, sx, sy, sLen, sWid, flowAng, col, sAlpha, {
      seed: sSeed,
      boil,
      boilAmp: boilAmp * 0.9,
      drySplit: (i % 3 === 0)
    });
  }

  // 2c) 右下暗面厚重水粉扫刷
  const shArc1 = extractContiguousArc(bPts, -15, 110, B.rx * 0.10, B.ry * 0.10);
  if (shArc1.length >= 3) {
    drawGouacheStroke(ctx, shArc1, {
      color: ramp[2],
      alpha: isLightPlush ? 0.30 : 0.40,
      maxWeight: clamp(diag * 0.10, 3.5, 16),
      minWeight: 1.2,
      seed: seed + 211,
      boil,
      boilAmp,
      dryFeibai: true
    });
  }
  const shArc2 = extractContiguousArc(bPts, 10, 95, B.rx * 0.18, B.ry * 0.18);
  if (shArc2.length >= 3 && ramp[3]) {
    drawGouacheStroke(ctx, shArc2, {
      color: isLightPlush ? ramp[2] : ramp[3],
      alpha: isLightPlush ? 0.22 : 0.32,
      maxWeight: clamp(diag * 0.075, 2.5, 12),
      minWeight: 1.0,
      seed: seed + 229,
      boil,
      boilAmp,
      dryFeibai: true
    });
  }

  // 2d) 左上受光侧 2 笔干脆的水粉高光提亮笔触
  if (showHighlight) {
    const hlCol = highlightColor || mixHex(ramp[0], '#FFFFFF', 0.48);
    const hlArc1 = extractContiguousArc(bPts, -162, -100, B.rx * 0.14, B.ry * 0.14);
    if (hlArc1.length >= 3) {
      drawGouacheStroke(ctx, hlArc1, {
        color: hlCol,
        alpha: 0.58,
        maxWeight: clamp(diag * 0.048, 1.8, 6.5),
        minWeight: 0.8,
        seed: seed + 307,
        boil,
        boilAmp: boilAmp * 0.75,
        dryFeibai: true
      });
    }
    const hlArc2 = extractContiguousArc(bPts, -148, -112, B.rx * 0.24, B.ry * 0.24);
    if (hlArc2.length >= 3) {
      drawGouacheStroke(ctx, hlArc2, {
        color: '#FFFDF8',
        alpha: 0.45,
        maxWeight: clamp(diag * 0.032, 1.2, 4.5),
        minWeight: 0.6,
        seed: seed + 317,
        boil,
        boilAmp: boilAmp * 0.65
      });
    }
  }

  // ── Step 3: 单层暗面/边缘同色系水粉颗粒（1.5 节） ──
  if (!noGrain && grainAlpha > 0) {
    applyGrain(ctx, bPts, ramp, { seed, boil, grainAlpha });
  }

  // ── Step 4: 背光侧月光边 (rim) ──
  if (showRim) {
    const rimPts = extractContiguousArc(bPts, rimStartDeg, rimEndDeg, Math.min(2.5, B.rx * 0.06), Math.min(2.5, B.ry * 0.06));
    if (rimPts.length >= 3) {
      drawGouacheStroke(ctx, rimPts, {
        color: rimColor,
        alpha: rimAlpha,
        maxWeight: clamp(diag * 0.055, 2.2, 7.5),
        minWeight: 0.9,
        seed: seed + 401,
        boil,
        boilAmp: boilAmp * 0.8,
        dryFeibai: true
      });
    }
  }

  if (stitches && diag > 36) {
    const stArc = extractContiguousArc(bPts, 28, 82, B.rx * 0.26, B.ry * 0.26);
    if (stArc.length >= 4) {
      drawPlushStitches(ctx, stArc, isLightPlush ? ramp[2] : (ramp[3] || ramp[2]), seed + 461, boil);
    }
  }

  ctx.restore(); // 结束内部裁剪

  // ── Step 5: 轮廓边由一笔笔水粉短笔组成（随 boil 明显沸腾起伏！） ──
  const nEdge = edgeStrokes !== null
    ? edgeStrokes
    : clamp(Math.round(diag * 0.42), 20, 48);

  const nPts = bPts.length;
  for (let k = 0; k < nEdge; k++) {
    const eSeed = seed * 97 + k * 53;
    const u = ((k + 0.25 + 0.55 * hash32(eSeed, 1, boil)) / nEdge) % 1.0;
    const idx = Math.floor(u * nPts) % nPts;
    const p = bPts[idx];

    const lightDot = p.nx * 0.65 + p.ny * 0.76;
    if (lightDot < -0.68 && k % 3 === 0) continue;

    let eCol, eAlpha;
    if (lightDot < -0.22) {
      eCol = ramp[0];
      eAlpha = 0.66 + 0.22 * hash32(eSeed, 2, boil);
    } else if (lightDot < 0.25) {
      eCol = ramp[1];
      eAlpha = 0.70 + 0.22 * hash32(eSeed, 2, boil);
    } else {
      eCol = isLightPlush
        ? (hash32(eSeed, 3, boil) > 0.5 ? ramp[2] : ramp[1])
        : (hash32(eSeed, 3, boil) > 0.4 ? (ramp[3] || ramp[2]) : ramp[2]);
      eAlpha = 0.72 + 0.22 * hash32(eSeed, 2, boil);
    }

    const tangAng = Math.atan2(p.ty, p.tx) + (hash32(eSeed, 4, boil) - 0.5) * 0.28;
    const outShift = (hash32(eSeed, 5, boil) - 0.36) * 2.1 * boilAmp;
    const ex = p.x + p.nx * outShift;
    const ey = p.y + p.ny * outShift;
    const eLen = clamp(diag * (0.095 + 0.075 * hash32(eSeed, 6, boil)), 3.4, 14.0);
    const eWid = clamp(diag * (0.034 + 0.026 * hash32(eSeed, 7, boil)), 1.4, 4.6);

    drawShortGouacheDab(ctx, ex, ey, eLen, eWid, tangAng, eCol, eAlpha, {
      seed: eSeed,
      boil,
      boilAmp: boilAmp * 1.15,
      drySplit: true
    });

    if (fuzz && k % 2 === 0) {
      const fTilt = tangAng + (p.nx >= 0 ? 0.55 : -0.55) * (0.6 + 0.5 * hash32(eSeed, 8, boil));
      const fx = p.x + p.nx * (0.95 + hash32(eSeed, 9, boil) * 1.5);
      const fy = p.y + p.ny * (0.95 + hash32(eSeed, 9, boil) * 1.5);
      drawShortGouacheDab(ctx, fx, fy, eLen * 0.60, eWid * 0.56, fTilt, eCol, eAlpha * 0.80, {
        seed: eSeed + 19,
        boil,
        boilAmp: boilAmp * 1.25,
        taperEnd: 0.1
      });
    }
  }

  ctx.restore();
  return bPts;
}

function drawPlushStitches(ctx, arcPts, color, seed = 1, boil = 0, alpha = 0.42) {
  if (!arcPts || arcPts.length < 2) return;
  drawGouacheStroke(ctx, arcPts, {
    color,
    alpha: alpha * 0.72,
    maxWeight: 1.4,
    minWeight: 0.6,
    seed,
    boil,
    boilAmp: 0.4
  });
  const step = Math.max(2, Math.floor(arcPts.length / 4));
  for (let i = step; i < arcPts.length - 1; i += step) {
    const p = arcPts[i];
    const ang = Math.atan2(p.ny || 0, p.nx || 1);
    drawShortGouacheDab(ctx, p.x, p.y, 4.0, 1.1, ang, color, alpha, {
      seed: seed + i * 13,
      boil,
      boilAmp: 0.35
    });
  }
}

// ─── 7. 角色专用五官、腮红、发光与脚底阴影（脸上细节画在颗粒外面，保持 100% 干净） ───

function drawToyEye(ctx, x, y, r, opt = {}) {
  const {
    seed = 1,
    boil = 0,
    gazeX = 0,
    gazeY = 0,
    scaleX = 1.0,
    scaleY = 1.0,
    starScale = 1.0,
    creamColor = PALETTE.eyeCream,
    pupilColor = PALETTE.faceInk,
    starColor = PALETTE.eyeStar,
    lidColor = null,
    browColor = null,
    browTilt = 0
  } = opt;

  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scaleX, scaleY);

  const ringPts = sampleSuperEllipse(0, 0, r, r * 1.04, 20, 2.0);
  fillGouache(ctx, ringPts, PALETTE.ramps.cream, { seed, boil, boilAmp: 0.35 });
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2 + (hash32(seed, i, boil) - 0.5) * 0.2;
    drawShortGouacheDab(
      ctx,
      Math.cos(a) * r * 0.92,
      Math.sin(a) * r * 0.95,
      r * 0.55,
      r * 0.24,
      a + Math.PI * 0.5,
      i < 5 ? creamColor : PALETTE.ramps.cream[1],
      0.65,
      { seed: seed + i * 11, boil, boilAmp: 0.3 }
    );
  }

  const px = gazeX * r * 0.20;
  const py = gazeY * r * 0.20;
  const pr = r * 0.74;
  ctx.fillStyle = pupilColor;
  ctx.beginPath();
  ctx.ellipse(px, py, pr, pr * 1.05, 0, 0, Math.PI * 2);
  ctx.fill();

  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    drawShortGouacheDab(
      ctx,
      px + Math.cos(a) * pr * 0.92,
      py + Math.sin(a) * pr * 0.96,
      pr * 0.5,
      pr * 0.2,
      a + Math.PI * 0.5,
      pupilColor,
      0.85,
      { seed: seed + 100 + i * 7, boil, boilAmp: 0.25 }
    );
  }

  const sx = px - pr * 0.32;
  const sy = py - pr * 0.30;
  const sr = Math.max(2.2, pr * 0.44 * starScale);
  const k = sr * 0.26;
  ctx.fillStyle = starColor;
  ctx.beginPath();
  ctx.moveTo(sx, sy - sr);
  ctx.quadraticCurveTo(sx + k, sy - k, sx + sr, sy);
  ctx.quadraticCurveTo(sx + k, sy + k, sx, sy + sr);
  ctx.quadraticCurveTo(sx - k, sy + k, sx - sr, sy);
  ctx.quadraticCurveTo(sx - k, sy - k, sx, sy - sr);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#FFFDF8';
  ctx.beginPath();
  ctx.arc(sx, sy, sr * 0.28, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = creamColor;
  ctx.beginPath();
  ctx.arc(px + pr * 0.34, py + pr * 0.36, Math.max(1.1, pr * 0.19), 0, Math.PI * 2);
  ctx.fill();

  if (lidColor) {
    const lidPts = [
      { x: -r * 0.95, y: -r * 0.35 },
      { x: 0, y: -r * 1.02 },
      { x: r * 0.95, y: -r * 0.32 }
    ];
    drawGouacheStroke(ctx, lidPts, {
      color: lidColor,
      alpha: 0.78,
      maxWeight: Math.max(1.8, r * 0.26),
      minWeight: 0.8,
      seed: seed + 199,
      boil,
      boilAmp: 0.3
    });
  }

  if (browColor) {
    ctx.save();
    ctx.translate(0, -r * 1.25);
    ctx.rotate(browTilt);
    drawShortGouacheDab(ctx, 0, 0, r * 1.35, Math.max(1.8, r * 0.32), 0, browColor, 0.85, {
      seed: seed + 223,
      boil,
      boilAmp: 0.25
    });
    ctx.restore();
  }

  ctx.restore();
}

function drawNightmareEye(ctx, x, y, rx, ry, opt = {}) {
  const {
    seed = 1,
    boil = 0,
    squint = 0,
    browTilt = 0.18,
    glowScale = 1.0,
    pupilSlit = 0.28
  } = opt;

  const curRy = Math.max(1.5, ry * (1 - squint * 0.68));
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(browTilt);

  drawRadialGlow(ctx, 0, 0, Math.max(rx, ry) * 2.15 * glowScale, PALETTE.nmEye.outer, 0.52);

  const grad = ctx.createRadialGradient(0, -curRy * 0.15, rx * 0.1, 0, 0, Math.max(rx, curRy));
  grad.addColorStop(0.0, PALETTE.nmEye.core);
  grad.addColorStop(0.68, PALETTE.nmEye.glow);
  grad.addColorStop(1.0, PALETTE.nmEye.outer);

  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.ellipse(0, 0, rx, curRy, 0, 0, Math.PI * 2);
  ctx.fill();

  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    drawShortGouacheDab(
      ctx,
      Math.cos(a) * rx * 0.94,
      Math.sin(a) * curRy * 0.94,
      rx * 0.48,
      rx * 0.22,
      a + Math.PI * 0.5,
      i % 2 === 0 ? PALETTE.nmEye.core : PALETTE.nmEye.outer,
      0.72,
      { seed: seed + i * 13, boil, boilAmp: 0.45 }
    );
  }

  if (squint < 0.78) {
    const pw = Math.max(1.2, rx * pupilSlit);
    const ph = Math.max(1.8, curRy * 0.62);
    ctx.fillStyle = PALETTE.nmEye.pupil;
    ctx.beginPath();
    ctx.ellipse(0, curRy * 0.04, pw, ph, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(-pw * 0.55, -ph * 0.35, Math.max(0.8, rx * 0.11), 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

function drawBlush(ctx, x, y, rx, ry, opt = {}) {
  const {
    angle = 0,
    seed = 1,
    boil = 0,
    alpha = 0.52
  } = opt;

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);

  const grad = ctx.createRadialGradient(0, 0, rx * 0.1, 0, 0, Math.max(rx, ry));
  grad.addColorStop(0, rgba(PALETTE.blush, alpha));
  grad.addColorStop(0.7, rgba(PALETTE.blush, alpha * 0.55));
  grad.addColorStop(1, rgba(PALETTE.blush, 0));
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.ellipse(0, 0, rx * 1.15, ry * 1.15, 0, 0, Math.PI * 2);
  ctx.fill();

  for (let i = 0; i < 5; i++) {
    const ox = (hash32(seed, i, boil) - 0.5) * rx * 0.8;
    const oy = (hash32(seed + 7, i, boil) - 0.5) * ry * 0.6;
    drawShortGouacheDab(ctx, ox, oy, rx * 0.85, ry * 0.55, (hash32(seed, i, 9) - 0.5) * 0.4, PALETTE.blush, alpha * 0.65, {
      seed: seed + i * 17,
      boil,
      boilAmp: 0.35
    });
  }

  for (let k = -1; k <= 0; k++) {
    const tx = (k + 0.5) * rx * 0.58;
    drawShortGouacheDab(ctx, tx, 0, ry * 0.95, Math.max(1.1, rx * 0.22), -0.95, PALETTE.blushTick, alpha * 0.85, {
      seed: seed + 91 + k * 19,
      boil,
      boilAmp: 0.3
    });
  }

  ctx.restore();
}

function drawPoolShadow(ctx, x, y, rx, ry, opt = {}) {
  const {
    seed = 1,
    boil = 0,
    alpha = 0.55,
    color = PALETTE.pool
  } = opt;

  ctx.save();
  ctx.translate(x, y);
  ctx.scale(1, ry / Math.max(1, rx));

  const grad = ctx.createRadialGradient(0, 0, rx * 0.08, 0, 0, rx);
  grad.addColorStop(0.0, rgba(color, alpha));
  grad.addColorStop(0.58, rgba(color, alpha * 0.52));
  grad.addColorStop(1.0, rgba(color, 0));

  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(0, 0, rx, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  for (let i = -3; i <= 3; i++) {
    const u = i / 3.5;
    const chord = Math.sqrt(Math.max(0.1, 1 - u * u)) * rx * 0.82;
    drawShortGouacheDab(
      ctx,
      x + (hash32(seed, i + 10, boil) - 0.5) * 4,
      y + u * ry * 0.65,
      chord * 1.35,
      Math.max(1.5, ry * 0.28),
      (hash32(seed, i + 20, boil) - 0.5) * 0.08,
      color,
      alpha * 0.28 * (1 - Math.abs(u) * 0.5),
      { seed: seed + 500 + i * 11, boil, boilAmp: 0.35 }
    );
  }
}

function drawRadialGlow(ctx, x, y, radius, colorHex, alpha = 0.45) {
  if (radius <= 0.5 || alpha <= 0.005) return;
  ctx.save();
  const grad = ctx.createRadialGradient(x, y, radius * 0.04, x, y, radius);
  grad.addColorStop(0.0, rgba(colorHex, Math.min(1, alpha * 1.1)));
  grad.addColorStop(0.42, rgba(colorHex, alpha * 0.52));
  grad.addColorStop(0.78, rgba(colorHex, alpha * 0.16));
  grad.addColorStop(1.0, rgba(colorHex, 0.0));
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

// ─── 8. 画图调用次数统计器 ───
const DRAW_METHODS = new Set([
  'fill', 'stroke', 'drawImage', 'fillRect', 'strokeRect', 'clip'
]);
const ALL_PATH_METHODS = new Set([
  'fill', 'stroke', 'drawImage', 'fillRect', 'strokeRect', 'clip',
  'beginPath', 'closePath', 'moveTo', 'lineTo', 'quadraticCurveTo', 'bezierCurveTo', 'arc', 'ellipse', 'rect'
]);

function measureCalls(ctx, fn) {
  let drawCalls = 0;
  let pathCalls = 0;
  const proxy = new Proxy(ctx, {
    get(target, prop) {
      const val = target[prop];
      if (typeof val === 'function') {
        return function (...args) {
          if (DRAW_METHODS.has(prop)) drawCalls++;
          if (ALL_PATH_METHODS.has(prop)) pathCalls++;
          return val.apply(target, args);
        };
      }
      return val;
    },
    set(target, prop, value) {
      target[prop] = value;
      return true;
    }
  });
  const t0 = typeof performance !== 'undefined' ? performance.now() : Date.now();
  fn(proxy);
  const dt = (typeof performance !== 'undefined' ? performance.now() : Date.now()) - t0;
  return { drawCalls, pathCalls, ms: dt };
}

__e.default = {
  PALETTE,
  setGrain,
  getGrain,
  hash32,
  createRng,
  lerp,
  clamp,
  smoothstep,
  noise2D,
  fbm2D,
  hexToRgb,
  rgba,
  mixHex,
  getRamp,
  resolveSameFamilyGrainColor,
  createOffscreenCanvas,
  getGrainTile,
  sampleSuperEllipse,
  subdivideSpline,
  computeNormals,
  extractContiguousArc,
  drawShortGouacheDab,
  drawGouacheStroke,
  fillGouache,
  applyGrain,
  paintGouacheBody,
  drawPlushStitches,
  drawToyEye,
  drawNightmareEye,
  drawBlush,
  drawPoolShadow,
  drawRadialGlow,
  measureCalls
};

__e["PALETTE"] = PALETTE; __e["setGrain"] = setGrain; __e["getGrain"] = getGrain; __e["hash32"] = hash32; __e["createRng"] = createRng; __e["lerp"] = lerp; __e["clamp"] = clamp; __e["smoothstep"] = smoothstep; __e["noise2D"] = noise2D; __e["fbm2D"] = fbm2D; __e["hexToRgb"] = hexToRgb; __e["rgba"] = rgba; __e["mixHex"] = mixHex; __e["getRamp"] = getRamp; __e["resolveSameFamilyGrainColor"] = resolveSameFamilyGrainColor; __e["createOffscreenCanvas"] = createOffscreenCanvas; __e["getGrainTile"] = getGrainTile; __e["sampleSuperEllipse"] = sampleSuperEllipse; __e["subdivideSpline"] = subdivideSpline; __e["computeNormals"] = computeNormals; __e["extractContiguousArc"] = extractContiguousArc; __e["drawShortGouacheDab"] = drawShortGouacheDab; __e["drawGouacheStroke"] = drawGouacheStroke; __e["fillGouache"] = fillGouache; __e["applyGrain"] = applyGrain; __e["paintGouacheBody"] = paintGouacheBody; __e["drawPlushStitches"] = drawPlushStitches; __e["drawToyEye"] = drawToyEye; __e["drawNightmareEye"] = drawNightmareEye; __e["drawBlush"] = drawBlush; __e["drawPoolShadow"] = drawPoolShadow; __e["drawRadialGlow"] = drawRadialGlow; __e["measureCalls"] = measureCalls;
};
__defs["nm_eyes.js"] = function (__e) {
// 《枕头堡》P1 美术代码：nm_eyes（衣柜缝的眼睛 · 噩梦第 0 区 · L2 · 第 2 批返修）
// 返修重点：
// 1. 噩梦本来就暗，颗粒更加克制（仅在暗面边缘铺极淡同色系深紫黑颗粒），靠淡紫色月光边 (#B9A8FF) 与暖黄白发光大眼睛认出来；
// 2. burst 拍散出的白棉花团干净无脏点；
// 3. 保持 walk / hit / push / burst 四组动作。

const {
  PALETTE,
  lerp,
  subdivideSpline,
  paintGouacheBody,
  drawGouacheStroke,
  drawShortGouacheDab,
  drawNightmareEye,
  drawPoolShadow,
  drawRadialGlow
} = __req("kit/index.js");

function buildSmokeRibbonPolygon(spine, widths) {
  const n = spine.length;
  const left = [];
  const right = [];

  for (let i = 0; i < n; i++) {
    const prev = spine[Math.max(0, i - 1)];
    const next = spine[Math.min(n - 1, i + 1)];
    let tx = next.x - prev.x;
    let ty = next.y - prev.y;
    const len = Math.hypot(tx, ty) || 1;
    tx /= len;
    ty /= len;
    const nx = -ty;
    const ny = tx;
    const w = widths[i];
    left.push({ x: spine[i].x + nx * w, y: spine[i].y + ny * w });
    right.push({ x: spine[i].x - nx * w, y: spine[i].y - ny * w });
  }

  const poly = [...left, ...right.reverse()];
  return subdivideSpline(poly, true, 4);
}

function paintSmokeWisps(ctx, spine, isElite, seed, boil, pushIntensity = 0) {
  const nm = PALETTE.ramps.nightmare;
  const rimCol = PALETTE.nmRim;

  const tail = spine[0];
  const wispCount = isElite ? 4 : 3;
  for (let w = 0; w < wispCount; w++) {
    const side = (w - (wispCount - 1) * 0.5) * 9;
    const sway = Math.sin(seed * 0.7 + w * 2.1) * 6;
    const wPts = [
      { x: tail.x + side * 0.35, y: tail.y + 5 },
      { x: tail.x + side * 0.8 + sway * 0.5, y: tail.y - 7 },
      { x: tail.x + side * 1.1 - sway * 0.4, y: tail.y - 20 }
    ];
    drawGouacheStroke(ctx, wPts, {
      color: w % 2 === 0 ? nm[1] : nm[3],
      alpha: 0.78,
      maxWeight: isElite ? 6.5 : 5.0,
      minWeight: 0.8,
      seed: seed + 300 + w * 19,
      boil,
      boilAmp: 0.9,
      taperStart: 0.45,
      taperEnd: 0.25,
      dryFeibai: true
    });
  }

  for (let i = 0; i < spine.length - 1; i++) {
    const p0 = spine[i];
    const p1 = spine[i + 1];
    const wave = (i % 2 === 0 ? 1 : -1) * (5 + pushIntensity * 4);
    const sPts = [
      { x: p0.x - wave * 0.5, y: p0.y },
      { x: (p0.x + p1.x) * 0.5 + wave, y: (p0.y + p1.y) * 0.5 },
      { x: p1.x - wave * 0.3, y: p1.y }
    ];
    drawGouacheStroke(ctx, sPts, {
      color: i % 2 === 0 ? nm[3] : nm[0],
      alpha: 0.48,
      maxWeight: 5.5,
      minWeight: 1.2,
      seed: seed + 400 + i * 23,
      boil,
      dryFeibai: true
    });
  }

  if (isElite) {
    const mid = spine[2];
    const leftCurl = [
      { x: mid.x - 18, y: mid.y + 12 },
      { x: mid.x - 32, y: mid.y - 4 },
      { x: mid.x - 24, y: mid.y - 24 }
    ];
    const rightCurl = [
      { x: mid.x + 18, y: mid.y + 10 },
      { x: mid.x + 33, y: mid.y - 6 },
      { x: mid.x + 25, y: mid.y - 26 }
    ];
    drawGouacheStroke(ctx, leftCurl, {
      color: rimCol,
      alpha: 0.48,
      maxWeight: 4.8,
      minWeight: 0.8,
      seed: seed + 511,
      boil,
      dryFeibai: true
    });
    drawGouacheStroke(ctx, rightCurl, {
      color: rimCol,
      alpha: 0.48,
      maxWeight: 4.8,
      minWeight: 0.8,
      seed: seed + 523,
      boil,
      dryFeibai: true
    });

    for (let k = 0; k < 6; k++) {
      const a = (k / 6) * Math.PI * 2 + seed * 0.3;
      const ox = mid.x + Math.cos(a) * 28;
      const oy = mid.y - 6 + Math.sin(a) * 24;
      drawShortGouacheDab(ctx, ox, oy, 6.5, 2.8, a + 1.2, rimCol, 0.58, {
        seed: seed + 540 + k * 11,
        boil
      });
    }
  }
}

__e.default = {
  key: 'nm_eyes',
  level: 'L2',
  size: [120, 120],
  anchor: [60, 108],
  display: [88, 88],
  boil: 1,
  variants: ['normal', 'elite'],

  anims: {
    walk:  { frames: 8, fps: 10, loop: true },
    hit:   { frames: 4, fps: 12, loop: false },
    push:  { frames: 6, fps: 10, loop: true },
    burst: { frames: 8, fps: 14, loop: false }
  },

  drawFrame(ctx, anim, i, opt = {}) {
    const seed = (opt.seed || 303) + i * 37;
    const boil = opt.boil || 0;
    const isElite = opt.variant === 'elite';
    const nm = PALETTE.ramps.nightmare;
    const wool = PALETTE.ramps.wool;
    const rimCol = PALETTE.nmRim;

    if (anim === 'burst') {
      const u = i / 7;
      const cx = 60;
      const cy = lerp(64, 82, u * u);

      drawPoolShadow(ctx, 60, 106, lerp(26, 18, u), lerp(7, 5, u), {
        seed,
        boil,
        alpha: lerp(0.52, 0.38, u)
      });

      if (i <= 5) {
        const fade = 1 - i / 5.5;
        const shardCount = isElite ? 10 : 8;
        for (let s = 0; s < shardCount; s++) {
          const ang = (s / shardCount) * Math.PI * 2 + 0.25;
          const dist = 8 + i * 7.5 + (s % 2) * 4;
          const sx = cx + Math.cos(ang) * dist;
          const sy = cy - 6 + Math.sin(ang) * dist * 0.85;
          const wispPts = [
            { x: sx - Math.cos(ang) * 8, y: sy - Math.sin(ang) * 8 },
            { x: sx + Math.sin(ang) * 4, y: sy - Math.cos(ang) * 4 },
            { x: sx + Math.cos(ang) * 10, y: sy + Math.sin(ang) * 10 }
          ];
          drawGouacheStroke(ctx, wispPts, {
            color: s % 3 === 0 ? rimCol : nm[1],
            alpha: fade * 0.82,
            maxWeight: (10 - i * 1.2),
            minWeight: 1.2,
            seed: seed + s * 29,
            boil,
            dryFeibai: true
          });
        }
      }

      if (i >= 0) {
        const cu = i / 7;
        const popScale = i === 0 ? 0.38 : i === 3 ? 1.18 : i === 4 ? 1.12 : lerp(0.45, 1.0, Math.min(1, cu * 1.3));
        const rx = 20 * popScale;
        const ry = 17 * popScale;

        const puffs = [];
        const lobes = 8;
        for (let k = 0; k < lobes * 4; k++) {
          const a = (k / (lobes * 4)) * Math.PI * 2;
          const bump = 1 + 0.14 * Math.abs(Math.sin(a * lobes * 0.5));
          puffs.push({
            x: cx + Math.cos(a) * rx * bump,
            y: cy + Math.sin(a) * ry * bump
          });
        }
        const smoothCotton = subdivideSpline(puffs, true, 2);
        paintGouacheBody(ctx, smoothCotton, wool, {
          seed: seed + 700,
          boil,
          surfaceStrokes: 40,
          edgeStrokes: 30,
          grainAlpha: 0.16,
          fuzz: true,
          showRim: true
        });
      }
      return;
    }

    let spine = [];
    let widths = [];
    let eyeCenterX = 60;
    let eyeCenterY = 46;
    let squint = 0;
    let browTilt = 0.18;
    let pushIntensity = 0;

    if (anim === 'walk') {
      const phase = (i / 8) * Math.PI * 2;
      const bobY = Math.sin(phase) * 3.5;
      const s1 = Math.sin(phase) * 7.5;
      const s2 = Math.sin(phase - 1.2) * 9.5;
      const s3 = Math.sin(phase - 2.4) * 11.0;

      spine = [
        { x: 60 + s3,        y: 104 },
        { x: 60 + s2 * 0.85, y: 86 + bobY * 0.4 },
        { x: 60 - s1 * 0.55, y: 66 + bobY * 0.8 },
        { x: 60 + s1 * 0.70, y: 44 + bobY },
        { x: 60 + s2 * 0.45, y: 22 + bobY }
      ];
      widths = isElite ? [3.5, 11, 21, 29, 10] : [2.8, 9, 17.5, 25, 8.5];
      eyeCenterX = spine[3].x;
      eyeCenterY = spine[3].y + 2;
      browTilt = 0.16 + Math.sin(phase) * 0.04;
    } else if (anim === 'hit') {
      const hitCurve = [0.65, 1.0, 0.55, 0.18][i] || 0;
      const joltX = (i % 2 === 0 ? -1 : 1) * hitCurve * 6;
      const squashY = hitCurve * 12;

      spine = [
        { x: 60 - joltX * 0.5, y: 104 },
        { x: 60 + joltX * 1.1, y: 88 + squashY * 0.2 },
        { x: 60 - joltX * 0.9, y: 70 + squashY * 0.5 },
        { x: 60 + joltX * 0.6, y: 48 + squashY * 0.85 },
        { x: 60 - joltX * 0.4, y: 28 + squashY }
      ];
      const wMul = 1 + hitCurve * 0.24;
      widths = (isElite ? [4, 12, 22, 30, 11] : [3, 9.5, 18, 25.5, 9]).map(w => w * wMul);
      eyeCenterX = spine[3].x;
      eyeCenterY = spine[3].y + 2;
      squint = 0.78 * hitCurve;
      browTilt = 0.28;
    } else if (anim === 'push') {
      const phase = (i / 6) * Math.PI * 2;
      const heave = 0.5 + 0.5 * Math.sin(phase);
      pushIntensity = 0.65 + 0.35 * heave;
      const forwardY = 8 + heave * 7;
      const coilX = Math.sin(phase * 2) * 4.5;

      spine = [
        { x: 60 - coilX,       y: 105 },
        { x: 60 + coilX * 1.4, y: 90 + forwardY * 0.25 },
        { x: 60 - coilX * 1.1, y: 72 + forwardY * 0.65 },
        { x: 60 + coilX * 0.5, y: 52 + forwardY },
        { x: 60 - coilX * 0.3, y: 34 + forwardY * 1.15 }
      ];
      const wPush = 1.12 + heave * 0.16;
      widths = (isElite ? [4.5, 14, 25, 31, 15] : [3.5, 11, 21, 26.5, 13]).map(w => w * wPush);
      eyeCenterX = spine[3].x;
      eyeCenterY = spine[3].y + 4;
      squint = 0.32 + heave * 0.25;
      browTilt = -0.18 - heave * 0.08;
    }

    drawPoolShadow(ctx, 60, 106, isElite ? 28 : 22, 6.5, {
      seed,
      boil,
      alpha: 0.62,
      color: '#070612'
    });
    drawGouacheStroke(ctx, [
      { x: 46, y: 106 },
      { x: 60, y: 107.5 },
      { x: 74, y: 106 }
    ], {
      color: nm[3],
      alpha: 0.85,
      maxWeight: 3.2,
      minWeight: 0.8,
      seed: seed + 17,
      boil
    });

    const bodyPoly = buildSmokeRibbonPolygon(spine, widths);
    paintGouacheBody(ctx, bodyPoly, nm, {
      seed: seed + 101,
      boil,
      boilAmp: 1.05,
      surfaceStrokes: 52,
      edgeStrokes: 38,
      grainAlpha: 0.16, // 克制噩梦颗粒，保持天鹅绒深暗底色
      showRim: true,
      rimColor: rimCol,
      rimAlpha: isElite ? 0.86 : 0.74,
      rimStartDeg: -68,
      rimEndDeg: 88,
      showHighlight: true,
      highlightColor: rimCol,
      fuzz: true
    });

    const leftRimPts = [
      { x: spine[4].x - widths[4] * 0.7, y: spine[4].y + 2 },
      { x: spine[3].x - widths[3] * 0.92, y: spine[3].y },
      { x: spine[2].x - widths[2] * 0.88, y: spine[2].y }
    ];
    drawGouacheStroke(ctx, leftRimPts, {
      color: rimCol,
      alpha: isElite ? 0.72 : 0.56,
      maxWeight: isElite ? 4.4 : 3.4,
      minWeight: 0.9,
      seed: seed + 191,
      boil,
      dryFeibai: true
    });

    paintSmokeWisps(ctx, spine, isElite, seed, boil, pushIntensity);

    if (anim === 'push') {
      for (const dir of [-1, 1]) {
        const px = eyeCenterX + dir * (widths[3] + 4);
        const py = eyeCenterY + 8;
        drawGouacheStroke(ctx, [
          { x: px - dir * 4, y: py + 6 },
          { x: px + dir * 5, y: py },
          { x: px + dir * 2, y: py - 8 }
        ], {
          color: rimCol,
          alpha: 0.58,
          maxWeight: 3.8,
          minWeight: 0.9,
          seed: seed + 600 + dir * 19,
          boil,
          dryFeibai: true
        });
      }
    }

    if (anim === 'hit') {
      for (let k = 0; k < 5; k++) {
        const a = -2.4 + k * 0.95;
        const r = 26 + i * 4;
        drawShortGouacheDab(
          ctx,
          eyeCenterX + Math.cos(a) * r,
          eyeCenterY + Math.sin(a) * r,
          6.0,
          2.6,
          a,
          k % 2 === 0 ? rimCol : nm[0],
          0.72,
          { seed: seed + 650 + k * 13, boil }
        );
      }
    }

    const eyeSpan = isElite ? 11.2 : 9.8;
    const eyeRx = isElite ? 7.8 : 6.8;
    const eyeRy = isElite ? 8.6 : 7.5;

    drawNightmareEye(ctx, eyeCenterX - eyeSpan, eyeCenterY, eyeRx, eyeRy, {
      seed: seed + 701,
      boil,
      squint,
      browTilt: -browTilt,
      glowScale: isElite ? 1.38 : 1.05,
      pupilSlit: isElite ? 0.22 : 0.28
    });
    drawNightmareEye(ctx, eyeCenterX + eyeSpan, eyeCenterY, eyeRx, eyeRy, {
      seed: seed + 719,
      boil,
      squint,
      browTilt: browTilt,
      glowScale: isElite ? 1.38 : 1.05,
      pupilSlit: isElite ? 0.22 : 0.28
    });

    if (isElite) {
      const fx = eyeCenterX;
      const fy = eyeCenterY - 13;
      drawRadialGlow(ctx, fx, fy, 11, PALETTE.nmEye.outer, 0.58);
      drawShortGouacheDab(ctx, fx, fy, 7.5, 4.2, -Math.PI * 0.5, PALETTE.nmEye.core, 0.92, {
        seed: seed + 751,
        boil
      });
    }
  }
};


};
__defs["obj_sheep.js"] = function (__e) {
// 《枕头堡》P1 美术代码：obj_sheep（拍散的噩梦 → 棉花 → 白色小羊 · L2 · 第 2 批返修）
// 返修重点：
// 1. 严格按 1.5 节改颗粒：白羊身上干净无脏点（仅在右下背光边缘有极浅同色系毛绒细粒，羊脸 0 颗粒）；
// 2. 保持 cotton / pop / run（朝左上跑）/ jump（往左跳栅栏）四套动作。

const {
  PALETTE,
  hash32,
  lerp,
  clamp,
  sampleSuperEllipse,
  subdivideSpline,
  paintGouacheBody,
  fillGouache,
  drawGouacheStroke,
  drawShortGouacheDab,
  drawPoolShadow
} = __req("kit/index.js");

function buildMiniWoolCloud(cx, cy, rx, ry, lobes = 9, depth = 0.15, seed = 1, boil = 0) {
  const pts = [];
  const n = lobes * 4;
  for (let i = 0; i < n; i++) {
    const u = i / n;
    const a = u * Math.PI * 2;
    const bump = Math.abs(Math.sin(u * lobes * Math.PI)) * depth;
    const jit = (hash32(seed, i, boil) - 0.5) * 0.05;
    const rMod = 1 + bump + jit;
    pts.push({
      x: cx + Math.cos(a) * rx * rMod,
      y: cy + Math.sin(a) * ry * rMod
    });
  }
  return subdivideSpline(pts, true, 2);
}

function drawSheepParts(ctx, opt) {
  const {
    cx = 32,
    cy = 32,
    rx = 15.5,
    ry = 13.0,
    bodyTilt = -0.18,
    headX = 17,
    headY = 25,
    headTilt = -0.22,
    legAngles = [0.3, -0.2, 0.25, -0.25],
    legTuck = 0,
    headPop = 1,
    seed = 404,
    boil = 0
  } = opt;

  const wool = PALETTE.ramps.wool;
  const darkFace = PALETTE.ramps.sheepFace;

  if (headPop > 0.1) {
    const legLen = lerp(3, 10.5 * (1 - legTuck * 0.42), headPop);
    const backLegs = [
      { x: cx - 5, y: cy + ry * 0.68, ang: legAngles[1] },
      { x: cx + 7, y: cy + ry * 0.62, ang: legAngles[3] }
    ];
    for (let k = 0; k < backLegs.length; k++) {
      const lg = backLegs[k];
      const ex = lg.x + Math.sin(lg.ang) * legLen;
      const ey = lg.y + Math.cos(lg.ang) * legLen;
      drawGouacheStroke(ctx, [
        { x: lg.x, y: lg.y },
        { x: (lg.x + ex) * 0.5, y: (lg.y + ey) * 0.5 },
        { x: ex, y: ey }
      ], {
        color: darkFace[2],
        alpha: 0.92,
        maxWeight: 4.0,
        minWeight: 2.2,
        seed: seed + 100 + k * 13,
        boil
      });
    }
  }

  if (headPop > 0.2) {
    const tx = cx + rx * 0.88;
    const ty = cy + ry * 0.18;
    const tailPts = sampleSuperEllipse(tx, ty, 4.8 * headPop, 4.0 * headPop, 16, 2.0);
    paintGouacheBody(ctx, tailPts, wool, {
      seed: seed + 140,
      boil,
      surfaceStrokes: 14,
      edgeStrokes: 12,
      grainAlpha: 0.15,
      fuzz: true
    });
  }

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(bodyTilt);
  const bodyPts = buildMiniWoolCloud(0, 0, rx, ry, 9, 0.15, seed + 200, boil);
  paintGouacheBody(ctx, bodyPts, wool, {
    seed: seed + 200,
    boil,
    boilAmp: 0.88,
    surfaceStrokes: 26,
    edgeStrokes: 20,
    grainAlpha: 0.15,
    fuzz: true,
    showRim: true
  });

  // 身体内部几道干净柔和的卷毛水粉短弧
  for (let c = 0; c < 6; c++) {
    const a = (c / 6) * Math.PI * 2 + 0.3;
    const vx = Math.cos(a) * rx * 0.44;
    const vy = Math.sin(a) * ry * 0.40;
    const isShadow = (Math.cos(a) * 0.6 + Math.sin(a) * 0.8) > 0.1;
    drawGouacheStroke(ctx, [
      { x: vx - 3, y: vy - 1.5 },
      { x: vx, y: vy + 2.0 },
      { x: vx + 3.2, y: vy - 1.0 }
    ], {
      color: isShadow ? wool[2] : wool[0],
      alpha: isShadow ? 0.36 : 0.62,
      maxWeight: 2.3,
      minWeight: 0.8,
      seed: seed + 260 + c * 11,
      boil,
      dryFeibai: true
    });
  }
  ctx.restore();

  if (headPop > 0.1) {
    const legLen = lerp(3, 11.2 * (1 - legTuck * 0.42), headPop);
    const frontLegs = [
      { x: cx - 8, y: cy + ry * 0.65, ang: legAngles[0] },
      { x: cx + 4, y: cy + ry * 0.68, ang: legAngles[2] }
    ];
    for (let k = 0; k < frontLegs.length; k++) {
      const lg = frontLegs[k];
      const ex = lg.x + Math.sin(lg.ang) * legLen;
      const ey = lg.y + Math.cos(lg.ang) * legLen;
      drawGouacheStroke(ctx, [
        { x: lg.x, y: lg.y },
        { x: (lg.x + ex) * 0.5, y: (lg.y + ey) * 0.5 },
        { x: ex, y: ey }
      ], {
        color: darkFace[1],
        alpha: 0.95,
        maxWeight: 4.4,
        minWeight: 2.4,
        seed: seed + 300 + k * 17,
        boil
      });
    }
  }

  if (headPop > 0.15) {
    ctx.save();
    ctx.translate(headX, headY);
    ctx.rotate(headTilt);
    ctx.scale(headPop, headPop);

    const earPts = subdivideSpline([
      { x: 4, y: -3 },
      { x: 11, y: -5 },
      { x: 12, y: 0 },
      { x: 5, y: 1 }
    ], true, 3);
    fillGouache(ctx, earPts, darkFace, { seed: seed + 350, boil });

    const facePts = sampleSuperEllipse(0, 0, 7.6, 6.4, 22, 2.05);
    paintGouacheBody(ctx, facePts, darkFace, {
      seed: seed + 360,
      boil,
      surfaceStrokes: 22,
      edgeStrokes: 16,
      noGrain: true,
      grainAlpha: 0,
      showRim: false,
      highlightColor: darkFace[0]
    });

    ctx.fillStyle = '#120A0B';
    ctx.beginPath();
    ctx.arc(-2.4, -0.8, 2.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#FFFDF8';
    ctx.beginPath();
    ctx.arc(-3.0, -1.5, 0.95, 0, Math.PI * 2);
    ctx.fill();

    drawShortGouacheDab(ctx, -1.2, 2.4, 3.6, 2.2, 0, PALETTE.blush, 0.55, {
      seed: seed + 380,
      boil
    });

    const capPts = buildMiniWoolCloud(1.5, -5.8, 6.2, 3.8, 6, 0.18, seed + 390, boil);
    paintGouacheBody(ctx, capPts, wool, {
      seed: seed + 390,
      boil,
      surfaceStrokes: 14,
      edgeStrokes: 12,
      grainAlpha: 0.14,
      fuzz: true
    });

    ctx.restore();
  }
}

__e.default = {
  key: 'obj_sheep',
  level: 'L2',
  size: [64, 60],
  anchor: [32, 54],
  display: [52, 48],
  boil: 1,

  anims: {
    cotton: { frames: 6, fps: 12, loop: false },
    pop:    { frames: 5, fps: 14, loop: false },
    run:    { frames: 6, fps: 12, loop: true },
    jump:   { frames: 6, fps: 12, loop: false }
  },

  drawFrame(ctx, anim, i, opt = {}) {
    const seed = (opt.seed || 404) + i * 29;
    const boil = opt.boil || 0;
    const wool = PALETTE.ramps.wool;

    if (anim === 'cotton') {
      const dropY = [26, 30, 35, 39, 36.5, 37.5][i] || 37.5;
      const sx = [1.00, 0.96, 0.94, 1.14, 0.96, 1.02][i] || 1.0;
      const sy = [1.00, 1.05, 1.06, 0.86, 1.04, 0.98][i] || 1.0;

      const shScale = lerp(0.65, 1.0, i / 5);
      drawPoolShadow(ctx, 32, 52, 16 * shScale * sx, 4.5 * shScale, { seed, boil, alpha: 0.45 });

      const cPts = buildMiniWoolCloud(32, dropY, 16.5 * sx, 14.0 * sy, 9, 0.16, seed + 10, boil);
      paintGouacheBody(ctx, cPts, wool, {
        seed: seed + 10,
        boil,
        surfaceStrokes: 42,
        edgeStrokes: 32,
        grainAlpha: 0.15,
        fuzz: true,
        showRim: true
      });

      if (i < 4) {
        for (let f = 0; f < 3; f++) {
          const fx = 18 + f * 14 + (i % 2) * 3;
          const fy = dropY - 14 - f * 3 + i * 2;
          drawShortGouacheDab(ctx, fx, fy, 4.5, 3.2, f * 0.8, wool[0], 0.78, {
            seed: seed + 80 + f * 11,
            boil
          });
        }
      }
      return;
    }

    if (anim === 'pop') {
      const u = i / 4;
      const popBounce = i === 1 ? 1.16 : i === 2 ? 1.08 : 1.0;
      const cy = [37, 30, 31, 34, 33][i] || 33;
      const headPop = clamp((i + 0.4) / 3.8, 0.2, 1.0);

      drawPoolShadow(ctx, 32, 52, 16 * popBounce, 4.8, { seed, boil, alpha: 0.48 });

      drawSheepParts(ctx, {
        cx: 34,
        cy,
        rx: 15.5 * popBounce,
        ry: 13.0 * (2 - popBounce),
        bodyTilt: -0.14 * u,
        headX: lerp(26, 17.5, headPop),
        headY: lerp(cy, cy - 6.5, headPop),
        headTilt: -0.18,
        legAngles: [0.35 * headPop, -0.25 * headPop, 0.25 * headPop, -0.35 * headPop],
        legTuck: 1 - headPop,
        headPop,
        seed,
        boil
      });
      return;
    }

    if (anim === 'run') {
      const phase = (i / 6) * Math.PI * 2;
      const bounceY = -Math.abs(Math.sin(phase)) * 4.5;
      const pitch = -0.18 + Math.cos(phase) * 0.10;
      const stride = Math.sin(phase) * 0.58;

      drawPoolShadow(ctx, 32, 52, 16 * (1 + bounceY * 0.03), 4.6, { seed, boil, alpha: 0.48 });

      drawSheepParts(ctx, {
        cx: 34,
        cy: 33 + bounceY,
        rx: 15.5 * (1 - bounceY * 0.015),
        ry: 12.8 * (1 + bounceY * 0.015),
        bodyTilt: pitch,
        headX: 17.2,
        headY: 25.5 + bounceY * 1.1,
        headTilt: pitch - 0.08,
        legAngles: [
          0.25 + stride,
          0.15 - stride * 0.8,
          -0.15 - stride,
          -0.20 + stride * 0.8
        ],
        legTuck: bounceY < -2.5 ? 0.22 : 0,
        headPop: 1.0,
        seed,
        boil
      });
      return;
    }

    if (anim === 'jump') {
      const arcY = [2.5, -7.5, -13.5, -11.5, -4.5, 1.0][i] || 0;
      const shiftX = [2, 0, -2.5, -4.5, -5.5, -6.0][i] || 0;
      const bodyTilt = [0.05, -0.35, -0.12, 0.18, 0.28, -0.10][i] || 0;
      const tuck = [0.15, 0.65, 0.85, 0.78, 0.35, 0.10][i] || 0;
      const sx = i === 0 ? 1.10 : (i === 1 || i === 2) ? 1.06 : 1.0;
      const sy = i === 0 ? 0.88 : (i === 1 || i === 2) ? 0.94 : 1.0;

      const shScale = clamp(1 + arcY * 0.035, 0.55, 1.1);
      drawPoolShadow(ctx, 32 + shiftX * 0.6, 52, 15 * shScale, 4.2 * shScale, {
        seed,
        boil,
        alpha: 0.42 * shScale
      });

      const cy = 33 + arcY;
      const cx = 34 + shiftX;
      drawSheepParts(ctx, {
        cx,
        cy,
        rx: 15.5 * sx,
        ry: 12.8 * sy,
        bodyTilt,
        headX: cx - 16.5,
        headY: cy - 7.0 + bodyTilt * 8,
        headTilt: bodyTilt - 0.1,
        legAngles: [0.65, 0.55, -0.68, -0.58],
        legTuck: tuck,
        headPop: 1.0,
        seed,
        boil
      });
    }
  }
};


};
__defs["palette.js"] = function (__e) {
// 《枕头堡》P1 色板模块（与 palette.json 完全同步，供 ES Module 无网络/离线直接 import）
const PALETTE = {
  name: '枕头堡 · 水粉颗粒（夜色）',
  lightOrigin: [0.38, 0.28],
  grain: '#121733',
  grainLight: '#FFF6DC',
  rim: '#CFEFE6',
  rimAlpha: 0.62,
  cream: ['#FFF6DC', '#F6E2A4', '#DFC27A', '#C4A862'],
  blush: '#FF7FB0',
  blushTick: '#D9548A',
  faceInk: '#120A0B',
  eyeCream: '#FFF8EA',
  eyeStar: '#FDD5A8',
  mouth: ['#8A3346', '#55182A', '#2A0B16'],
  pool: '#0B1026',
  ramps: {
    moss: ['#D8EE9E', '#8DB060', '#557D4C', '#2F523A'],
    gold: ['#FFF1B8', '#FFD35E', '#E7A23C', '#B8742E'],
    orange: ['#FFC98A', '#F99A45', '#DC6E2C', '#A94E24'],
    coral: ['#FFB7A0', '#FF7E62', '#E0533F', '#A83A35'],
    teal: ['#D8FFF6', '#6FE3D3', '#2FA9A6', '#1C727A'],
    berry: ['#FF9EC0', '#E0578A', '#AE3866', '#7A2549'],
    piggy: ['#FFE8F0', '#FF9EC4', '#DE6492', '#9E3B64'],
    violet: ['#EBD6FF', '#B88EF2', '#8160CC', '#5A409E'],
    indigo: ['#7880D2', '#4D55AC', '#30367C', '#1E2254'],
    cream: ['#FFF6DC', '#F6E2A4', '#DFC27A', '#C4A862'],
    wool: ['#FFFDF6', '#F2EEE4', '#D6D2DE', '#ABA7BE'],
    sheepFace: ['#626076', '#48465A', '#323042', '#201E2C'],
    night: ['#3A3F6B', '#2B2F55', '#1F2242', '#171A33'],
    fog: ['#2A2448', '#221D3C', '#1A1630', '#120F24'],
    nightmare: ['#2A2850', '#1C1A3A', '#120F26', '#0C0A1C'],
    wood: ['#E5B582', '#B88454', '#8A5E36', '#5C3C20']
  },
  nmRim: '#B9A8FF',
  nmEye: {
    core: '#FFF3C4',
    outer: '#FFD86B',
    glow: '#FFE28A',
    pupil: '#120A0B'
  },
  elements: {
    pillow: ['#FFFDF8', '#FFF1D6', '#E2CEB0', '#B59E82'],
    warm: ['#FFF3C4', '#FFD35E', '#FF9A45', '#D95B26'],
    cool: ['#E8FAFF', '#8FE3FF', '#48A9D6', '#256B94'],
    static: ['#FFFBE0', '#FFF27A', '#C9A8FF', '#7E52C4'],
    stink: ['#D8ED98', '#A6C35A', '#6D8C32', '#42591A']
  }
};

__e.default = PALETTE;

__e["PALETTE"] = PALETTE;
};
__defs["rig-player.js"] = function (__e) {
// 《枕头堡》L1 部件 + Rig 播放器（第 2 批：支持多朝向 facings、发射点 muzzle 标记、出手帧 release 闪烁、预烘焙图集与 3× 实时重画模式）
// 兼容新写法（parts/anims 按 facing 分组）与老写法（parts 为数组，当作只有 front）

const { createOffscreenCanvas, measureCalls, lerp } = __req("kit/index.js");

function getFacings(mod) {
  if (Array.isArray(mod.facings) && mod.facings.length > 0) return mod.facings;
  if (mod.parts && !Array.isArray(mod.parts) && typeof mod.parts === 'object') {
    return Object.keys(mod.parts);
  }
  return ['front'];
}

function getPartsForFacing(mod, facing = 'front') {
  if (!mod.parts) return [];
  if (Array.isArray(mod.parts)) return mod.parts;
  return mod.parts[facing] || mod.parts.front || Object.values(mod.parts)[0] || [];
}

function getAnimsForFacing(mod, facing = 'front') {
  if (!mod.anims) return {};
  if (mod.anims[facing] && !mod.anims[facing].dur && typeof mod.anims[facing] === 'object') {
    return mod.anims[facing];
  }
  if (mod.anims.front && !mod.anims.front.dur) {
    return mod.anims[facing] || mod.anims.front;
  }
  return mod.anims;
}

function getMuzzleForFacing(mod, facing = 'front') {
  if (!mod.muzzle) return null;
  if (Array.isArray(mod.muzzle) && typeof mod.muzzle[0] === 'number') return mod.muzzle;
  return mod.muzzle[facing] || mod.muzzle.front || null;
}

function evalTrack(keys, tMs) {
  if (!keys || keys.length === 0) return null;
  if (tMs <= keys[0].t) return keys[0];
  if (tMs >= keys[keys.length - 1].t) return keys[keys.length - 1];
  for (let i = 0; i < keys.length - 1; i++) {
    const a = keys[i];
    const b = keys[i + 1];
    if (tMs >= a.t && tMs <= b.t) {
      const span = Math.max(1, b.t - a.t);
      const u = (tMs - a.t) / span;
      let k = u;
      if (a.ease === 'smooth' || a.ease === 'sineInOut') k = u * u * (3 - 2 * u);
      else if (a.ease === 'out' || a.ease === 'quadOut') k = 1 - (1 - u) * (1 - u);
      else if (a.ease === 'in' || a.ease === 'quadIn') k = u * u;
      return {
        x: lerp(a.x || 0, b.x || 0, k),
        y: lerp(a.y || 0, b.y || 0, k),
        rot: lerp(a.rot || 0, b.rot || 0, k),
        sx: lerp(a.sx !== undefined ? a.sx : 1, b.sx !== undefined ? b.sx : 1, k),
        sy: lerp(a.sy !== undefined ? a.sy : 1, b.sy !== undefined ? b.sy : 1, k),
        alpha: lerp(a.alpha !== undefined ? a.alpha : 1, b.alpha !== undefined ? b.alpha : 1, k),
        hidden: a.hidden !== undefined ? a.hidden : undefined
      };
    }
  }
  return keys[keys.length - 1];
}

/**
 * 为 L1 模块烘焙所有朝向、所有部件的所有沸腾变体
 */
function buildL1Atlas(mod, opt = {}) {
  const scale = opt.scale || 1;
  const seed = opt.seed || 101;
  const boilCount = mod.boil || 3;
  const facings = getFacings(mod);
  const facingsMap = {};
  const stats = {
    totalMs: 0,
    totalDrawCalls: 0,
    totalPathCalls: 0,
    maxDrawCalls: 0,
    maxPathCalls: 0,
    parts: {}
  };

  for (let fIdx = 0; fIdx < facings.length; fIdx++) {
    const facing = facings[fIdx];
    const parts = getPartsForFacing(mod, facing);
    const partMap = {};

    for (let pIdx = 0; pIdx < parts.length; pIdx++) {
      const part = parts[pIdx];
      const [rx, ry, rw, rh] = part.rect;
      const pBoils = part.boil === false ? 1 : boilCount;
      const frames = [];
      let partDrawCalls = 0;
      let partPathCalls = 0;
      let partMs = 0;

      for (let b = 0; b < pBoils; b++) {
        const cw = Math.max(1, Math.ceil(rw * scale));
        const ch = Math.max(1, Math.ceil(rh * scale));
        const canvas = createOffscreenCanvas(cw, ch);
        const ctx = canvas.getContext('2d');

        const m = measureCalls(ctx, (pctx) => {
          pctx.save();
          pctx.scale(scale, scale);
          pctx.translate(-rx, -ry);
          mod.drawPart(pctx, part.id, {
            seed: seed + fIdx * 199 + pIdx * 31,
            boil: b,
            scale,
            facing
          });
          pctx.restore();
        });

        if (b === 0) {
          partDrawCalls = m.drawCalls;
          partPathCalls = m.pathCalls;
        }
        partMs += m.ms;
        frames.push(canvas);
      }

      partMap[part.id] = {
        def: part,
        frames,
        phaseOffset: pIdx * 17
      };

      const statKey = facings.length > 1 ? `${facing}/${part.id}` : part.id;
      stats.parts[statKey] = {
        facing,
        partId: part.id,
        drawCalls: partDrawCalls,
        pathCalls: partPathCalls,
        ms: Number(partMs.toFixed(2)),
        boilCount: pBoils,
        rect: part.rect
      };
      stats.totalDrawCalls += partDrawCalls;
      stats.totalPathCalls += partPathCalls;
      stats.maxDrawCalls = Math.max(stats.maxDrawCalls, partDrawCalls);
      stats.maxPathCalls = Math.max(stats.maxPathCalls, partPathCalls);
      stats.totalMs += partMs;
    }

    facingsMap[facing] = partMap;
  }

  stats.totalMs = Number(stats.totalMs.toFixed(2));
  return {
    mod,
    scale,
    seed,
    boilCount,
    facings: facingsMap,
    partMap: facingsMap.front || Object.values(facingsMap)[0] || {},
    stats
  };
}

/**
 * 计算 L1 模块在指定朝向、动作与时刻下的各部件状态
 */
function computeRigPose(mod, animName, timeMs, facing = 'front') {
  const parts = getPartsForFacing(mod, facing);
  const anims = getAnimsForFacing(mod, facing);
  const anim = anims[animName] || anims.idle || Object.values(anims)[0] || { dur: 1000, loop: true, tracks: {} };
  const dur = anim.dur || 1000;
  const t = anim.loop ? (timeMs % dur) : Math.min(dur, timeMs);

  const pose = {};
  for (const part of parts) {
    pose[part.id] = {
      x: 0,
      y: 0,
      rot: 0,
      sx: 1,
      sy: 1,
      alpha: 1,
      hidden: !!part.hidden
    };
  }

  if (anim.tracks) {
    for (const partId of Object.keys(anim.tracks)) {
      if (!pose[partId]) continue;
      const val = evalTrack(anim.tracks[partId], t);
      if (val) {
        if (val.x !== undefined) pose[partId].x = val.x;
        if (val.y !== undefined) pose[partId].y = val.y;
        if (val.rot !== undefined) pose[partId].rot = val.rot;
        if (val.sx !== undefined) pose[partId].sx = val.sx;
        if (val.sy !== undefined) pose[partId].sy = val.sy;
        if (val.alpha !== undefined) pose[partId].alpha = val.alpha;
        if (val.hidden !== undefined) pose[partId].hidden = val.hidden;
      }
    }
  }
  return pose;
}

function applyParentChain(ctx, partDef, pose, byId) {
  if (partDef.parent && byId[partDef.parent]) {
    applyParentChain(ctx, byId[partDef.parent], pose, byId);
  }
  const st = pose[partDef.id];
  const [px, py] = partDef.pivot;
  ctx.translate(px + st.x, py + st.y);
  if (st.rot) ctx.rotate((st.rot * Math.PI) / 180);
  if (st.sx !== 1 || st.sy !== 1) ctx.scale(st.sx, st.sy);
  ctx.translate(-px, -py);
}

/**
 * 渲染一帧 L1 角色（支持 facing、showMuzzle 发射点十字与 release 出手帧闪烁提示）
 */
function drawRigInstance(ctx, mod, atlas, opt = {}) {
  const {
    facing = 'front',
    anim = 'idle',
    timeMs = 0,
    x = 0,
    y = 0,
    displayW = mod.size[0],
    displayH = mod.size[1],
    boilFps = 7,
    phaseSeed = 0,
    realtime = false,
    seed = 101,
    scale = 1,
    faceLeft = false,
    showMuzzle = false
  } = opt;

  const parts = getPartsForFacing(mod, facing);
  const anims = getAnimsForFacing(mod, facing);
  const animDef = anims[anim] || anims.idle || { dur: 1000, loop: true };
  const pose = computeRigPose(mod, anim, timeMs, facing);
  const byId = {};
  for (const p of parts) byId[p.id] = p;

  const [aw, ah] = mod.size;
  const [ancX, ancY] = mod.anchor;
  const sx = displayW / aw;
  const sy = displayH / ah;
  const boilTick = Math.floor((timeMs / 1000) * boilFps) + phaseSeed;
  const fIdx = Math.max(0, getFacings(mod).indexOf(facing));

  ctx.save();
  ctx.translate(x, y);
  if (faceLeft) ctx.scale(-1, 1);
  ctx.scale(sx, sy);
  ctx.translate(-ancX, -ancY);

  const facingMap = atlas && atlas.facings ? (atlas.facings[facing] || atlas.partMap) : (atlas ? atlas.partMap : null);

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    const st = pose[part.id];
    if (!st || st.hidden || st.alpha <= 0.01) continue;

    ctx.save();
    applyParentChain(ctx, part, pose, byId);
    if (st.alpha < 1) ctx.globalAlpha *= st.alpha;

    if (realtime || !facingMap) {
      const bVal = part.boil === false ? 0 : (boilTick + i * 3);
      ctx.save();
      ctx.beginPath();
      ctx.rect(part.rect[0], part.rect[1], part.rect[2], part.rect[3]);
      ctx.clip();
      mod.drawPart(ctx, part.id, {
        seed: seed + fIdx * 199 + i * 31,
        boil: bVal,
        scale,
        facing
      });
      ctx.restore();
    } else {
      const entry = facingMap[part.id];
      if (entry && entry.frames.length > 0) {
        const bIdx = part.boil === false ? 0 : ((boilTick + i) % entry.frames.length);
        const img = entry.frames[bIdx];
        const [rx, ry, rw, rh] = part.rect;
        ctx.drawImage(img, rx, ry, rw, rh);
      }
    }

    ctx.restore();
  }

  // 预览页辅助标记：标出每个朝向的发射点 muzzle（小十字）与出手帧 release 闪烁
  if (showMuzzle) {
    const muz = getMuzzleForFacing(mod, facing);
    if (muz) {
      const [mx, my] = muz;
      const dur = animDef.dur || 1000;
      const localT = timeMs % dur;
      const relT = (mod.release && mod.release[anim] !== undefined) ? mod.release[anim] : null;
      const isReleasing = relT !== null && Math.abs(localT - relT) <= 55;

      ctx.save();
      if (isReleasing) {
        const pulse = 1 - Math.abs(localT - relT) / 55;
        ctx.strokeStyle = '#FFF3C4';
        ctx.lineWidth = 2.4;
        ctx.beginPath();
        ctx.arc(mx, my, 7 + pulse * 10, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = 'rgba(255, 211, 94, 0.55)';
        ctx.beginPath();
        ctx.arc(mx, my, 5 + pulse * 6, 0, Math.PI * 2);
        ctx.fill();
      }

      // 发射点十字准星
      ctx.strokeStyle = isReleasing ? '#FFFFFF' : '#FF5E7E';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(mx - 6, my);
      ctx.lineTo(mx + 6, my);
      ctx.moveTo(mx, my - 6);
      ctx.lineTo(mx, my + 6);
      ctx.stroke();

      ctx.fillStyle = isReleasing ? '#FFF3C4' : '#FF5E7E';
      ctx.beginPath();
      ctx.arc(mx, my, 2.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  ctx.restore();
}

const RigPlayer = {
  getFacings,
  getPartsForFacing,
  getAnimsForFacing,
  getMuzzleForFacing,
  buildL1Atlas,
  computeRigPose,
  drawRigInstance
};



__e.default = RigPlayer;

__e["getFacings"] = getFacings; __e["getPartsForFacing"] = getPartsForFacing; __e["getAnimsForFacing"] = getAnimsForFacing; __e["getMuzzleForFacing"] = getMuzzleForFacing; __e["buildL1Atlas"] = buildL1Atlas; __e["computeRigPose"] = computeRigPose; __e["drawRigInstance"] = drawRigInstance; __e["RigPlayer"] = RigPlayer;
};
__defs["shot_abing.js"] = function (__e) {
// 《枕头堡》P1 美术代码：shot_abing（阿冰的直线弹道：雪球 · L3 · 第 2 批新做）
// 规范对齐：
// 1. kind: 'straight'，只画飞的样子和打中，不画飞行轨迹；
// 2. fly（3 帧循环，画朝右，屏幕尺寸 44×32）：一颗圆润紧实的冰白雪球 + 左侧寒气与雪粒尾迹；
// 3. trail（几粒雪拖尾粒子配方）+ hit（打中碎成雪花）。

const {
  PALETTE,
  sampleSuperEllipse,
  paintGouacheBody,
  drawGouacheStroke,
  drawShortGouacheDab,
  drawRadialGlow
} = __req("kit/index.js");

__e.default = {
  key: 'shot_abing',
  level: 'L3',
  kind: 'straight',

  brushes: {
    // 飞的样子（画朝右，3 帧循环，右端为饱满雪球，左端带 3 道随帧跳动的冰蓝寒气与雪粒）
    fly: {
      size: [44, 32],
      frames: 3,
      draw(ctx, opt = {}) {
        const frame = (opt.frame | 0) % 3;
        const boil = opt.boil || 0;
        const seed = (opt.seed || 1801) + frame * 61;
        const cool = PALETTE.elements.cool; // ['#E8FAFF', '#8FE3FF', '#48A9D6', '#256B94']

        drawRadialGlow(ctx, 29, 16, 15, cool[1], 0.42);

        // 1) 左侧拖出的 3 道寒气飞白流线与小雪粒（指示朝右高速飞行）
        for (let k = -1; k <= 1; k++) {
          const yOff = k * 5.2 + ((frame + k) % 2 === 0 ? -1.2 : 1.2);
          const xStart = 5 + Math.abs(k) * 4 + (frame === 1 ? 2 : 0);
          drawGouacheStroke(ctx, [
            { x: xStart,      y: 16 + yOff },
            { x: xStart + 8,  y: 16 + yOff * 0.85 },
            { x: 24,          y: 16 + k * 3.5 }
          ], {
            color: k === 0 ? '#FFFFFF' : cool[1],
            alpha: 0.78,
            maxWeight: 3.4,
            minWeight: 0.8,
            seed: seed + 100 + k * 17,
            boil: boil + frame,
            dryFeibai: true
          });
        }

        // 2) 右侧雪球主体（洁白受光 + 冰蓝暗面与水粉干笔绒雪边）
        const ballPts = sampleSuperEllipse(29, 16, 11.2, 10.6, 24, 2.0);
        paintGouacheBody(ctx, ballPts, ['#FFFFFF', cool[0], cool[1], cool[2]], {
          seed,
          boil: boil + frame,
          boilAmp: 0.95,
          surfaceStrokes: 26,
          edgeStrokes: 22,
          grainAlpha: 0.16,
          showRim: true,
          rimColor: '#FFFFFF',
          fuzz: true
        });

        // 3) 雪球左上高光雪包
        drawShortGouacheDab(ctx, 26, 12, 8.5, 4.8, -0.35, '#FFFFFF', 0.95, {
          seed: seed + 211,
          boil: boil + frame
        });
      }
    },

    // 六角冰晶雪花（24×24，用于打中碎成雪花）
    flake: {
      size: [24, 24],
      draw(ctx, opt = {}) {
        const seed = opt.seed || 1831;
        const boil = opt.boil || 0;
        const cool = PALETTE.elements.cool;

        drawRadialGlow(ctx, 12, 12, 10.5, cool[1], 0.48);

        for (let i = 0; i < 3; i++) {
          const ang = (i * Math.PI) / 3;
          drawShortGouacheDab(ctx, 12, 12, 17.5, 3.0, ang, '#FFFFFF', 0.92, {
            seed: seed + i * 19,
            boil,
            drySplit: true
          });
        }
        drawShortGouacheDab(ctx, 12, 12, 6.5, 6.5, 0, cool[0], 0.95, {
          seed: seed + 79,
          boil
        });
      }
    },

    // 小雪粒（16×16，用于拖尾与打中）
    snow_dot: {
      size: [16, 16],
      draw(ctx, opt = {}) {
        const seed = opt.seed || 1861;
        const boil = opt.boil || 0;
        const cool = PALETTE.elements.cool;
        const pts = sampleSuperEllipse(8, 8, 5.2, 4.8, 16, 2.0);
        paintGouacheBody(ctx, pts, ['#FFFFFF', cool[0], cool[1], cool[2]], {
          seed,
          boil,
          surfaceStrokes: 12,
          edgeStrokes: 10,
          noGrain: true,
          fuzz: true
        });
      }
    }
  },

  effects: {
    trail: {
      brush: ['snow_dot', 'flake'],
      rate: 26,
      life: [0.18, 0.35],
      speed: [16, 46],
      angle: [160, 200],
      scale: [0.55, 0.35, 0.10],
      alpha: [0.88, 0],
      tint: ['#FFFFFF', '#E8FAFF', '#8FE3FF'],
      blend: 'normal',
      spin: [-90, 90]
    },
    hit: {
      brush: ['flake', 'snow_dot'],
      count: [8, 12],
      life: [0.24, 0.45],
      speed: [65, 175],
      angle: [0, 360],
      scale: [0.65, 1.05, 0.20],
      alpha: [1, 0],
      tint: ['#FFFFFF', '#E8FAFF', '#8FE3FF'],
      blend: 'add',
      spin: [-160, 160]
    }
  },

  draw(ctx, opt = {}) {
    const seed = opt.seed || 1801;
    const boil = opt.boil || 0;
    ctx.save();
    this.brushes.fly.draw(ctx, { seed, boil, frame: 0 });
    ctx.translate(50, 4);
    this.brushes.flake.draw(ctx, { seed: seed + 17, boil });
    ctx.translate(30, 4);
    this.brushes.snow_dot.draw(ctx, { seed: seed + 31, boil });
    ctx.restore();
  }
};


};
__defs["shot_dingdang.js"] = function (__e) {
// 《枕头堡》P1 美术代码：shot_dingdang（叮当的抛物线弹道：金硬币 + 脚下光环 aura · L3 · 第 2 批新做）
// 规范对齐：
// 1. kind: 'lob'，aura: 175；
// 2. fly（3 帧，正着画，翻着飞的闪亮金色硬币 38×38）+ hit（打中“叮”的星光）；
// 3. aura（脚下一圈暖金柔光，平放在地上，半径 175 -> 画布 350×350）。

const {
  PALETTE,
  hash32,
  rgba,
  sampleSuperEllipse,
  paintGouacheBody,
  fillGouache,
  drawGouacheStroke,
  drawShortGouacheDab,
  drawRadialGlow
} = __req("kit/index.js");

__e.default = {
  key: 'shot_dingdang',
  level: 'L3',
  kind: 'lob',
  aura: 175,

  brushes: {
    // 飞的样子（正着画，3 帧展示金币翻转受光与边缘沸腾，开发让它边飞边转）
    fly: {
      size: [38, 38],
      frames: 3,
      draw(ctx, opt = {}) {
        const frame = (opt.frame | 0) % 3;
        const boil = opt.boil || 0;
        const seed = (opt.seed || 1601) + frame * 43;
        const gold = PALETTE.ramps.gold; // ['#FFF1B8', '#FFD35E', '#E7A23C', '#B8742E']

        // 帧间微幅翻转透视比（正画，保持圆润硬币轮廓）
        const tiltRx = frame === 0 ? 14.5 : frame === 1 ? 12.2 : 13.6;
        const cx = 19, cy = 19;

        // 1) 硬币厚度侧边（深金棕底）
        if (frame !== 0) {
          const sidePts = sampleSuperEllipse(cx + (frame === 1 ? 2.2 : -2.0), cy + 1.2, tiltRx, 14.5, 24, 2.0);
          fillGouache(ctx, sidePts, [gold[2], gold[3], '#8A521B', '#6E3E12'], { seed: seed + 11, boil });
        }

        // 2) 金币正面圆盘
        const coinPts = sampleSuperEllipse(cx, cy, tiltRx, 14.5, 26, 2.0);
        paintGouacheBody(ctx, coinPts, gold, {
          seed,
          boil: boil + frame,
          boilAmp: 0.85,
          surfaceStrokes: 26,
          edgeStrokes: 22,
          grainAlpha: 0.16,
          showRim: true,
          rimColor: '#FFFDF8',
          highlightColor: '#FFFFFF'
        });

        // 3) 硬币内圈凹环与中心方孔/星纹浮雕
        const innerPts = sampleSuperEllipse(cx, cy, tiltRx * 0.68, 9.8, 20, 2.0);
        fillGouache(ctx, innerPts, [gold[1], gold[2], gold[3], gold[3]], { seed: seed + 73, boil, alpha: 0.55 });

        drawShortGouacheDab(ctx, cx, cy, 8.5, 3.4, Math.PI * 0.5, gold[0], 0.92, { seed: seed + 97, boil });
        drawShortGouacheDab(ctx, cx, cy, 7.5, 3.0, 0, gold[0], 0.92, { seed: seed + 103, boil });

        // 左上闪亮白星高光
        drawShortGouacheDab(ctx, cx - tiltRx * 0.38, cy - 5.5, 6.2, 2.6, -0.6, '#FFFFFF', 0.95, {
          seed: seed + 131,
          boil
        });
      }
    },

    // 脚下光环 aura：半径 175 的一圈暖金柔光（画布直径 = 2 × 175 = 350），平放在地上
    aura: {
      size: [350, 350],
      radius: 175,
      draw(ctx, opt = {}) {
        const seed = opt.seed || 1699;
        const boil = opt.boil || 0;
        const gold = PALETTE.ramps.gold;
        const cx = 175, cy = 175;
        const R = 171; // 留 4px 安全边距防裁切（资源对接约定第 3 节）

        // 1) 柔和的暖金径向底晕（中心透明柔和、边缘聚成温暖光环）
        const grad = ctx.createRadialGradient(cx, cy, R * 0.15, cx, cy, R);
        grad.addColorStop(0.00, rgba(gold[0], 0.04));
        grad.addColorStop(0.62, rgba(gold[1], 0.08));
        grad.addColorStop(0.86, rgba(gold[1], 0.24));
        grad.addColorStop(0.95, rgba(gold[0], 0.36));
        grad.addColorStop(1.00, rgba(gold[1], 0.00));
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(cx, cy, R, 0, Math.PI * 2);
        ctx.fill();

        // 2) 外沿一圈断续跳动的水粉暖金笔触环（像童话梦里的手绘柔光圈）
        const segCount = 36;
        for (let i = 0; i < segCount; i++) {
          const a = (i / segCount) * Math.PI * 2 + (hash32(seed, i, boil) - 0.5) * 0.04;
          const rJit = R * 0.92 + (hash32(seed + 19, i, boil) - 0.5) * 4.5;
          const px = cx + Math.cos(a) * rJit;
          const py = cy + Math.sin(a) * rJit;
          const col = i % 3 === 0 ? '#FFFDF8' : (i % 2 === 0 ? gold[0] : gold[1]);
          drawShortGouacheDab(
            ctx,
            px,
            py,
            22 + hash32(seed, i, 7) * 10,
            4.2 + hash32(seed, i, 11) * 2.2,
            a + Math.PI * 0.5,
            col,
            0.38 + 0.18 * hash32(seed, i, boil),
            { seed: seed + i * 23, boil, boilAmp: 0.7, drySplit: (i % 2 === 0) }
          );
        }

        // 3) 内圈第二道极淡的水粉呼吸光弧與几颗暖金小星点
        for (let k = 0; k < 12; k++) {
          const a = (k / 12) * Math.PI * 2 + 0.25;
          const rIn = R * (0.72 + 0.12 * hash32(seed + 300, k, boil));
          const sx = cx + Math.cos(a) * rIn;
          const sy = cy + Math.sin(a) * rIn;
          drawShortGouacheDab(ctx, sx, sy, 6.5, 2.4, a, gold[0], 0.48, {
            seed: seed + 400 + k * 13,
            boil
          });
          drawShortGouacheDab(ctx, sx, sy, 6.5, 2.4, a + Math.PI * 0.5, '#FFFDF8', 0.48, {
            seed: seed + 450 + k * 13,
            boil
          });
        }
      }
    },

    // 打中“叮”的四角星光（24×24）
    star: {
      size: [24, 24],
      draw(ctx, opt = {}) {
        const seed = opt.seed || 1633;
        const boil = opt.boil || 0;
        const gold = PALETTE.ramps.gold;

        drawRadialGlow(ctx, 12, 12, 11, gold[1], 0.55);

        const sr = 9.5;
        const k = 2.4;
        ctx.fillStyle = gold[0];
        ctx.beginPath();
        ctx.moveTo(12, 12 - sr);
        ctx.quadraticCurveTo(12 + k, 12 - k, 12 + sr, 12);
        ctx.quadraticCurveTo(12 + k, 12 + k, 12, 12 + sr);
        ctx.quadraticCurveTo(12 - k, 12 + k, 12 - sr, 12);
        ctx.quadraticCurveTo(12 - k, 12 - k, 12, 12 - sr);
        ctx.closePath();
        ctx.fill();

        drawShortGouacheDab(ctx, 12, 12, 15, 3.2, 0, '#FFFFFF', 0.9, { seed, boil });
        drawShortGouacheDab(ctx, 12, 12, 15, 3.2, Math.PI * 0.5, '#FFFFFF', 0.9, { seed: seed + 17, boil });
      }
    },

    // 金色闪点（16×16）
    spark: {
      size: [16, 16],
      draw(ctx, opt = {}) {
        const seed = opt.seed || 1667;
        const boil = opt.boil || 0;
        const gold = PALETTE.ramps.gold;
        drawRadialGlow(ctx, 8, 8, 7, gold[1], 0.5);
        drawShortGouacheDab(ctx, 8, 8, 9.5, 4.2, 0.4, gold[0], 0.92, { seed, boil, drySplit: true });
        drawShortGouacheDab(ctx, 8, 8, 5.0, 3.5, -0.5, '#FFFFFF', 0.95, { seed: seed + 13, boil });
      }
    }
  },

  effects: {
    hit: {
      brush: ['star', 'spark'],
      count: [7, 11],
      life: [0.22, 0.42],
      speed: [60, 165],
      angle: [0, 360],
      scale: [0.7, 1.1, 0.15],
      alpha: [1, 0],
      tint: ['#FFFDF8', '#FFF1B8', '#FFD35E'],
      blend: 'add',
      spin: [-120, 120]
    }
  },

  draw(ctx, opt = {}) {
    const seed = opt.seed || 1601;
    const boil = opt.boil || 0;
    ctx.save();
    this.brushes.fly.draw(ctx, { seed, boil, frame: 0 });
    ctx.translate(46, 7);
    this.brushes.star.draw(ctx, { seed: seed + 19, boil });
    ctx.translate(30, 4);
    this.brushes.spark.draw(ctx, { seed: seed + 37, boil });
    ctx.restore();
  }
};


};
__defs["shot_fangfang.js"] = function (__e) {
// 《枕头堡》P1 美术代码：shot_fangfang（方方的抛物线弹道：彩色木积木 · L3 · 第 2 批新做）
// 规范对齐：
// 1. kind: 'lob'，只画飞的样子和打中，不画飞行轨迹；
// 2. fly（3 帧，正着画，开发让它边飞边转）：一块立体圆角彩色木积木（珊瑚红/金黄/青蓝拼面 + 木纹高光笔触）；
// 3. hit（打中积木弹开、冒木屑）。

const {
  PALETTE,
  subdivideSpline,
  paintGouacheBody,
  fillGouache,
  drawGouacheStroke,
  drawShortGouacheDab
} = __req("kit/index.js");

function buildBlockPoly(cx, cy, hw, hh, bevel = 4) {
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

__e.default = {
  key: 'shot_fangfang',
  level: 'L3',
  kind: 'lob',

  brushes: {
    // 飞的样子（正着画，3 帧展示彩色木积木块的不同切面光泽与沸腾，开发让它边飞边转）
    fly: {
      size: [40, 40],
      frames: 3,
      draw(ctx, opt = {}) {
        const frame = (opt.frame | 0) % 3;
        const boil = opt.boil || 0;
        const seed = (opt.seed || 1301) + frame * 59;
        const coral = PALETTE.ramps.coral;
        const gold = PALETTE.ramps.gold;
        const teal = PALETTE.ramps.teal;
        const wood = PALETTE.ramps.wood;

        const mainRamp = frame === 0 ? coral : frame === 1 ? gold : teal;
        const sideRamp = frame === 0 ? gold : frame === 1 ? teal : coral;

        // 1) 右下侧 3D 积木厚度面
        const depthPts = buildBlockPoly(22, 22, 12.5, 12.5, 3.5);
        fillGouache(ctx, depthPts, wood, { seed: seed + 13, boil });

        // 2) 顶侧亮面（表现立体木块倒角）
        const topPts = subdivideSpline([
          { x: 8,  y: 10 },
          { x: 12, y: 6 },
          { x: 32, y: 6 },
          { x: 29, y: 12 }
        ], true, 3);
        fillGouache(ctx, topPts, sideRamp, { seed: seed + 29, boil });

        // 3) 积木正主面（水粉短笔触叠画 + 木纹细节）
        const facePts = buildBlockPoly(19, 20, 12.5, 12.5, 3.5);
        paintGouacheBody(ctx, facePts, mainRamp, {
          seed,
          boil: boil + frame,
          boilAmp: 0.9,
          surfaceStrokes: 26,
          edgeStrokes: 20,
          grainAlpha: 0.18,
          showRim: true,
          highlightColor: '#FFFDF8'
        });

        // 积木正面中心原木圆形镶嵌星徽
        drawShortGouacheDab(ctx, 19, 20, 11.5, 5.2, 0.78, sideRamp[0], 0.88, {
          seed: seed + 83,
          boil
        });
        drawShortGouacheDab(ctx, 19, 20, 11.5, 5.2, -0.78, sideRamp[0], 0.88, {
          seed: seed + 97,
          boil
        });
      }
    },

    // 打中弹开的小积木角（24×24）
    mini_block: {
      size: [24, 24],
      draw(ctx, opt = {}) {
        const seed = opt.seed || 1331;
        const boil = opt.boil || 0;
        const pts = buildBlockPoly(12, 12, 7.5, 7.5, 2.5);
        paintGouacheBody(ctx, pts, PALETTE.ramps.coral, {
          seed,
          boil,
          surfaceStrokes: 16,
          edgeStrokes: 14,
          grainAlpha: 0.16
        });
      }
    },

    // 飞溅的木屑笔刷（20×20）
    chip: {
      size: [20, 20],
      draw(ctx, opt = {}) {
        const seed = opt.seed || 1361;
        const boil = opt.boil || 0;
        const wood = PALETTE.ramps.wood;
        drawShortGouacheDab(ctx, 10, 10, 12.5, 4.2, -0.35, wood[0], 0.92, {
          seed,
          boil,
          drySplit: true
        });
        drawShortGouacheDab(ctx, 10, 11.5, 10.5, 3.0, -0.35, wood[2], 0.82, {
          seed: seed + 17,
          boil
        });
      }
    },

    // 枕头/木粉小气团（28×28）
    puff: {
      size: [28, 28],
      draw(ctx, opt = {}) {
        const seed = opt.seed || 1381;
        const boil = opt.boil || 0;
        const pillow = PALETTE.elements.pillow;
        const pts = [];
        for (let i = 0; i < 20; i++) {
          const a = (i / 20) * Math.PI * 2;
          const r = 9.5 * (0.82 + 0.22 * Math.abs(Math.sin(a * 3)));
          pts.push({ x: 14 + Math.cos(a) * r, y: 14 + Math.sin(a) * r });
        }
        paintGouacheBody(ctx, subdivideSpline(pts, true, 2), pillow, {
          seed,
          boil,
          surfaceStrokes: 18,
          edgeStrokes: 14,
          grainAlpha: 0.14
        });
      }
    }
  },

  effects: {
    hit: {
      brush: ['mini_block', 'chip', 'puff'],
      count: [8, 12],
      life: [0.25, 0.48],
      speed: [70, 185],
      angle: [0, 360],
      gravity: 300,
      scale: [0.85, 1.0, 0.25],
      alpha: [1, 0],
      tint: ['#FF7E62', '#FFD35E', '#6FE3D3', '#E5B582'],
      blend: 'normal',
      spin: [-260, 260]
    }
  },

  draw(ctx, opt = {}) {
    const seed = opt.seed || 1301;
    const boil = opt.boil || 0;
    ctx.save();
    this.brushes.fly.draw(ctx, { seed, boil, frame: 0 });
    ctx.translate(46, 6);
    this.brushes.mini_block.draw(ctx, { seed: seed + 17, boil });
    ctx.translate(28, 2);
    this.brushes.chip.draw(ctx, { seed: seed + 31, boil });
    ctx.restore();
  }
};


};
__defs["shot_gaga.js"] = function (__e) {
// 《枕头堡》P1 美术代码：shot_gaga（嘎嘎的柱子弹道：水柱 · L3 · 第 2 批新做）
// 规范对齐：
// 1. kind: 'beam'；
// 2. beam（朝右的一段水柱 96×36，左右严格周期对齐无缝衔接，中间亮 #E8FAFF、边上冰蓝 #8FE3FF/#48A9D6 并带跃动水花）；
// 3. cap（起点/终点小水花 40×40）+ hit（打中溅一圈水滴）。

const {
  PALETTE,
  hash32,
  rgba,
  subdivideSpline,
  paintGouacheBody,
  drawGouacheStroke,
  drawShortGouacheDab
} = __req("kit/index.js");

__e.default = {
  key: 'shot_gaga',
  level: 'L3',
  kind: 'beam',

  brushes: {
    // 一段水平朝右的水柱（宽 96 高 36，x=0 与 x=96 采用整周期正弦波与环绕笔触，100% 左右无缝平铺！）
    beam: {
      size: [96, 36],
      frames: 3,
      draw(ctx, opt = {}) {
        const frame = (opt.frame | 0) % 3;
        const boil = opt.boil || 0;
        const seed = (opt.seed || 1401) + frame * 53;
        const cool = PALETTE.elements.cool; // ['#E8FAFF', '#8FE3FF', '#48A9D6', '#256B94']
        const W = 96;
        const cy = 18;
        const phase = (frame / 3) * Math.PI * 2 + boil * 0.85;

        // 严格周期函数：u=0 与 u=1 的高度和斜率完全相等
        function waveTop(u) {
          return cy - 8.2 + Math.sin(u * Math.PI * 2 + phase) * 1.4 + Math.cos(u * Math.PI * 4 - phase) * 0.8;
        }
        function waveBot(u) {
          return cy + 8.2 + Math.sin(u * Math.PI * 2 - phase + 0.7) * 1.4 + Math.cos(u * Math.PI * 4 + phase) * 0.8;
        }

        // 1) 外层冰蓝水柱底带
        const steps = 24;
        ctx.beginPath();
        for (let i = 0; i <= steps; i++) {
          const u = i / steps;
          const x = u * W;
          const y = waveTop(u) - 2.2;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        for (let i = steps; i >= 0; i--) {
          const u = i / steps;
          const x = u * W;
          const y = waveBot(u) + 2.2;
          ctx.lineTo(x, y);
        }
        ctx.closePath();
        const outerGrad = ctx.createLinearGradient(0, 6, 0, 30);
        outerGrad.addColorStop(0.0, cool[2]);
        outerGrad.addColorStop(0.25, cool[1]);
        outerGrad.addColorStop(0.5, cool[0]);
        outerGrad.addColorStop(0.75, cool[1]);
        outerGrad.addColorStop(1.0, cool[3]);
        ctx.fillStyle = outerGrad;
        ctx.fill();

        // 2) 中间高亮激流白芯（保证左右两端无缝对接）
        ctx.beginPath();
        for (let i = 0; i <= steps; i++) {
          const u = i / steps;
          const x = u * W;
          const y = cy - 3.6 + Math.sin(u * Math.PI * 4 + phase) * 1.1;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        for (let i = steps; i >= 0; i--) {
          const u = i / steps;
          const x = u * W;
          const y = cy + 3.6 + Math.cos(u * Math.PI * 4 - phase) * 1.1;
          ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fillStyle = rgba(cool[0], 0.92);
        ctx.fill();

        // 3) 水柱表面与上下边缘的水粉流线短笔触（做 X 轴环绕绘制，确保平铺接缝处笔触不断裂！）
        for (let i = 0; i < 18; i++) {
          const u = (i + 0.35) / 18;
          const baseX = u * W;
          const isTop = i % 2 === 0;
          const baseY = isTop ? waveTop(u) : waveBot(u);
          const col = i % 3 === 0 ? '#FFFFFF' : (isTop ? cool[0] : cool[2]);
          const len = 11 + (i % 3) * 3.5;
          const wid = 2.8 + (i % 2) * 1.0;
          const ang = (hash32(seed, i, boil) - 0.5) * 0.18;

          const wrapXs = baseX < 12 ? [baseX, baseX + W] : baseX > W - 12 ? [baseX, baseX - W] : [baseX];
          for (const wx of wrapXs) {
            drawShortGouacheDab(ctx, wx, baseY, len, wid, ang, col, 0.82, {
              seed: seed + i * 17,
              boil: 0, // 固定环绕位置以确保左右接缝 100% 严丝合缝
              boilAmp: 0,
              drySplit: true
            });
          }
        }

        // 4) 边缘溅起的小水珠（同样做环绕处理）
        for (let d = 0; d < 8; d++) {
          const u = (d + 0.5) / 8;
          const dx = ((u * W + frame * 11) % W);
          const dy = (d % 2 === 0) ? (cy - 12.5 - (d % 3)) : (cy + 12.5 + (d % 3));
          const wrapXs = dx < 6 ? [dx, dx + W] : dx > W - 6 ? [dx, dx - W] : [dx];
          for (const wx of wrapXs) {
            drawShortGouacheDab(ctx, wx, dy, 5.2, 2.6, d % 2 === 0 ? -0.25 : 0.25, cool[0], 0.88, {
              seed: seed + 300 + d * 13,
              boil: 0,
              boilAmp: 0
            });
          }
        }
      }
    },

    // 起点 / 终点的一小朵水花 cap（40×40）
    cap: {
      size: [40, 40],
      draw(ctx, opt = {}) {
        const seed = opt.seed || 1433;
        const boil = opt.boil || 0;
        const cool = PALETTE.elements.cool;

        const pts = [];
        for (let i = 0; i < 24; i++) {
          const a = (i / 24) * Math.PI * 2;
          const r = 13.5 * (0.78 + 0.28 * Math.abs(Math.sin(a * 4)));
          pts.push({ x: 20 + Math.cos(a) * r, y: 20 + Math.sin(a) * r });
        }
        paintGouacheBody(ctx, subdivideSpline(pts, true, 2), [cool[0], cool[1], cool[2], cool[3]], {
          seed,
          boil,
          surfaceStrokes: 24,
          edgeStrokes: 20,
          grainAlpha: 0.16,
          showRim: true,
          rimColor: '#FFFFFF'
        });

        for (let k = 0; k < 8; k++) {
          const a = (k / 8) * Math.PI * 2 + 0.2;
          drawShortGouacheDab(
            ctx,
            20 + Math.cos(a) * 14,
            20 + Math.sin(a) * 14,
            8.0,
            3.2,
            a,
            k % 2 === 0 ? '#FFFFFF' : cool[1],
            0.88,
            { seed: seed + 100 + k * 11, boil, drySplit: true }
          );
        }
      }
    },

    // 飞溅水滴笔刷（用于打中特效 hit）
    drop: {
      size: [20, 20],
      draw(ctx, opt = {}) {
        const seed = opt.seed || 1459;
        const boil = opt.boil || 0;
        const cool = PALETTE.elements.cool;
        const dropPts = subdivideSpline([
          { x: 3,  y: 10 },
          { x: 10, y: 5 },
          { x: 17, y: 10 },
          { x: 10, y: 15 }
        ], true, 3);
        paintGouacheBody(ctx, dropPts, [cool[0], cool[1], cool[2], cool[3]], {
          seed,
          boil,
          surfaceStrokes: 12,
          edgeStrokes: 10,
          noGrain: true
        });
        drawShortGouacheDab(ctx, 11, 8.5, 4.5, 2.2, 0, '#FFFFFF', 0.9, { seed: seed + 19, boil });
      }
    }
  },

  effects: {
    hit: {
      brush: ['drop', 'cap'],
      count: [8, 12],
      life: [0.22, 0.42],
      speed: [70, 180],
      angle: [0, 360],
      scale: [0.65, 1.0, 0.2],
      alpha: [1, 0],
      tint: ['#FFFFFF', '#E8FAFF', '#8FE3FF'],
      blend: 'normal',
      spin: [-120, 120]
    }
  },

  draw(ctx, opt = {}) {
    const seed = opt.seed || 1401;
    const boil = opt.boil || 0;
    ctx.save();
    this.brushes.beam.draw(ctx, { seed, boil, frame: 0 });
    ctx.translate(100, 0);
    this.brushes.cap.draw(ctx, { seed: seed + 23, boil });
    ctx.restore();
  }
};


};
__defs["shot_huhu.js"] = function (__e) {
// 《枕头堡》P1 美术代码：shot_huhu（呼呼的直线弹道：小火球 · L3 · 第 2 批新做）
// 规范对齐：
// 1. kind: 'straight'，只画飞的样子和打中，不画飞行轨迹；
// 2. fly（3 帧循环，画朝右，屏幕尺寸约 46×32）：一颗小火球（暖黄芯 #FFF3C4/#FFD35E、橙边 #FF9A45/#D95B26，边缘火焰笔触在跳动）；
// 3. trail（热气拖尾粒子配方）+ hit（打中炸开一小团热气和火星）。

const {
  PALETTE,
  hash32,
  sampleSuperEllipse,
  subdivideSpline,
  paintGouacheBody,
  fillGouache,
  drawGouacheStroke,
  drawShortGouacheDab,
  drawRadialGlow
} = __req("kit/index.js");

__e.default = {
  key: 'shot_huhu',
  level: 'L3',
  kind: 'straight',

  brushes: {
    // 飞的样子（画朝右，3 帧循环，暖黄的芯、橙色的边，边在跳）
    fly: {
      size: [48, 34],
      frames: 3,
      draw(ctx, opt = {}) {
        const frame = (opt.frame | 0) % 3;
        const boil = opt.boil || 0;
        const seed = (opt.seed || 1201) + frame * 71;
        const warm = PALETTE.elements.warm; // ['#FFF3C4', '#FFD35E', '#FF9A45', '#D95B26']

        // 柔和火光外晕
        drawRadialGlow(ctx, 29, 17, 16, warm[2], 0.46);

        // 1) 橙红火焰外层（左端拖出跳动的火舌尾，右端饱满圆润朝右飞）
        const w1 = (frame === 0 ? -2.2 : frame === 1 ? 2.4 : 0.4);
        const w2 = (frame === 0 ? 2.0 : frame === 1 ? -2.2 : 1.5);
        const outerPts = subdivideSpline([
          { x: 5,  y: 17 + w1 },         // 左侧主火舌尖
          { x: 14, y: 10 + w2 * 0.6 },
          { x: 25, y: 5 },
          { x: 38, y: 7 },
          { x: 44, y: 17 },              // 右侧火球前端（朝右）
          { x: 38, y: 27 },
          { x: 25, y: 29 },
          { x: 14, y: 24 + w1 * 0.6 }
        ], true, 4);

        paintGouacheBody(ctx, outerPts, [warm[1], warm[2], warm[3], '#A63A14'], {
          seed,
          boil: boil + frame,
          boilAmp: 1.15,
          surfaceStrokes: 28,
          edgeStrokes: 24,
          grainAlpha: 0.18,
          showRim: true,
          rimColor: warm[1],
          rimAlpha: 0.78,
          fuzz: true
        });

        // 左侧随帧跳动的 3 道干笔飞白火苗尾丝
        for (let k = -1; k <= 1; k++) {
          const ty = 17 + k * 5.5 + ((frame + k) % 2 === 0 ? -1.5 : 1.5);
          drawShortGouacheDab(
            ctx,
            10 + Math.abs(k) * 3,
            ty,
            11.5,
            3.8,
            k * 0.18 + (hash32(seed, k + 5, boil) - 0.5) * 0.25,
            k === 0 ? warm[1] : warm[2],
            0.85,
            { seed: seed + 100 + k * 19, boil: boil + frame, drySplit: true }
          );
        }

        // 2) 暖黄亮芯（靠右前端，一眼看清火球核心）
        const corePts = sampleSuperEllipse(30, 17, 10.5, 8.2, 22, 2.0);
        fillGouache(ctx, corePts, [warm[0], warm[1], warm[2], warm[2]], {
          seed: seed + 201,
          boil: boil + frame,
          boilAmp: 0.9
        });

        for (let i = 0; i < 10; i++) {
          const a = (i / 10) * Math.PI * 2 + frame * 0.4;
          drawShortGouacheDab(
            ctx,
            29 + Math.cos(a) * 8.5,
            17 + Math.sin(a) * 6.8,
            6.8,
            2.6,
            a + Math.PI * 0.45,
            i % 2 === 0 ? warm[0] : warm[1],
            0.78,
            { seed: seed + 240 + i * 11, boil: boil + frame, drySplit: true }
          );
        }

        // 3) 最亮白黄火核高光笔触
        drawShortGouacheDab(ctx, 32, 15.5, 7.5, 4.8, -0.15, '#FFFDF8', 0.92, {
          seed: seed + 311,
          boil: boil + frame
        });
      }
    },

    // 热气团（用于拖尾和打中）
    puff: {
      size: [36, 36],
      draw(ctx, opt = {}) {
        const seed = opt.seed || 1231;
        const boil = opt.boil || 0;
        const warm = PALETTE.elements.warm;
        const pts = [];
        for (let i = 0; i < 24; i++) {
          const a = (i / 24) * Math.PI * 2;
          const r = 12.5 * (0.84 + 0.22 * Math.abs(Math.sin(a * 3.5)));
          pts.push({ x: 18 + Math.cos(a) * r, y: 18 + Math.sin(a) * r });
        }
        paintGouacheBody(ctx, subdivideSpline(pts, true, 2), warm, {
          seed,
          boil,
          surfaceStrokes: 24,
          edgeStrokes: 20,
          grainAlpha: 0.18,
          fuzz: true
        });
        drawGouacheStroke(ctx, [
          { x: 11, y: 20 },
          { x: 18, y: 12 },
          { x: 25, y: 17 }
        ], {
          color: warm[0],
          alpha: 0.78,
          maxWeight: 3.6,
          minWeight: 0.9,
          seed: seed + 71,
          boil,
          dryFeibai: true
        });
      }
    },

    // 火星（用于打中迸溅）
    spark: {
      size: [16, 16],
      draw(ctx, opt = {}) {
        const seed = opt.seed || 1259;
        const boil = opt.boil || 0;
        const warm = PALETTE.elements.warm;
        drawRadialGlow(ctx, 8, 8, 7.2, warm[1], 0.52);
        for (let i = 0; i < 4; i++) {
          drawShortGouacheDab(ctx, 8, 8, i < 2 ? 12 : 8, i < 2 ? 3.2 : 2.2, i * 0.78, i % 2 === 0 ? warm[0] : warm[1], 0.9, {
            seed: seed + i * 13,
            boil,
            drySplit: true
          });
        }
      }
    }
  },

  effects: {
    trail: {
      brush: ['puff', 'spark'],
      rate: 28,
      life: [0.18, 0.34],
      speed: [18, 48],
      angle: [160, 200],
      scale: [0.55, 0.38, 0.10],
      alpha: [0.85, 0],
      tint: ['#FFF3C4', '#FFD35E', '#FF9A45'],
      blend: 'add',
      spin: [-90, 90]
    },
    hit: {
      brush: ['puff', 'spark'],
      count: [8, 12],
      life: [0.22, 0.42],
      speed: [65, 175],
      angle: [0, 360],
      scale: [0.65, 1.05, 0.20],
      alpha: [1, 0],
      tint: ['#FFF3C4', '#FFD35E', '#FF9A45'],
      blend: 'add',
      spin: [-150, 150]
    }
  },

  draw(ctx, opt = {}) {
    const seed = opt.seed || 1201;
    const boil = opt.boil || 0;
    ctx.save();
    this.brushes.fly.draw(ctx, { seed, boil, frame: 0 });
    ctx.translate(54, 0);
    this.brushes.puff.draw(ctx, { seed: seed + 19, boil });
    ctx.translate(42, 9);
    this.brushes.spark.draw(ctx, { seed: seed + 37, boil });
    ctx.restore();
  }
};


};
__defs["toy_abing.js"] = function (__e) {
// 《枕头堡》P1 美术代码：toy_abing（阿冰：企鹅玩偶 · 凉 · 冲 · L1 · 第 2 批新做）
// 规范对齐：
// 1. 三套朝向（front / back / side），转过去一眼是同一只深蓝白戴小围巾的企鹅玩偶：
//    - front：深蓝企鹅身 (indigo)、雪白圆肚皮与心形白脸框 (wool，0 颗粒干净无脏点)、暖橙黄三角企鹅喙、脖子上围着珊瑚红条纹针织小围巾 scarf、右翅手拿雪球；
//    - back：深蓝企鹅后脑勺与后背、底部翘起的小短企鹅尾、脖子后面醒目的珊瑚红围巾结与两条飘带（3.2.1 要求背面画出来）；
//    - side：侧面画朝右（朝右的尖企鹅嘴、右侧雪白圆肚皮、左后侧珊瑚红围巾结与企鹅短尾、右翅手扔雪球）；
// 2. 动作严格对齐 3.2.1 与 art-manifest-批次2.json：
//    - front: idle (1800 loop), walk (600 loop 原地踏步), cheer (900), startled (500)
//    - back / side: idle (1800 loop), walk (600 loop), attack (500, release=200 扔雪球), skill (1000, release=500 两手举高砸地雪崩), dash (400 loop 肚皮着地往前滑), strike (250 撞一下)

const {
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
} = __req("kit/index.js");

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

__e.default = {
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


};
__defs["toy_dingdang.js"] = function (__e) {
// 《枕头堡》P1 美术代码：toy_dingdang（叮当：存钱罐小猪 · 枕头 · 帮 · 不动 · L1 · 第 2 批新做）
// 规范对齐：
// 1. 活动范围“不动”，只有正面 facings: ['front']，无 walk；
// 2. 动作：idle (1800 loop), attack (500, release=200 抖一下扔出硬币), skill (1000, release=500 摇身体“叮当”响), cheer (900), startled (500)；
// 3. 造型：粉陶瓷存钱罐小猪（piggy 暖粉色族 + 水粉高光笔触），3/4 俯视看得到背上的投币口 slot 和露出一半的金硬币 coin_peek（发射点 muzzle: [70, 30]）、翘猪鼻 snout、腹前金色四叶草徽章。

const {
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
} = __req("kit/index.js");

__e.default = {
  key: 'toy_dingdang',
  level: 'L1',
  size: [140, 150],
  anchor: [70, 138],
  display: [112, 120],
  sizeRange: [80, 180],
  stance: '帮',
  range: '不动',
  boil: 3,
  facings: ['front'],

  muzzle: {
    front: [70, 30]
  },
  release: {
    attack: 200,
    skill: 500
  },

  parts: {
    front: [
      { id: 'shadow',    parent: null,   rect: [20, 122, 100, 26], pivot: [70, 138], boil: false },
      { id: 'leg_l',     parent: 'body', rect: [32, 110, 28, 30],  pivot: [46, 118] },
      { id: 'leg_r',     parent: 'body', rect: [80, 110, 28, 30],  pivot: [94, 118] },
      { id: 'tail',      parent: 'body', rect: [96, 74, 32, 34],   pivot: [102, 92] },
      { id: 'ear_l',     parent: 'body', rect: [22, 16, 32, 34],   pivot: [42, 38] },
      { id: 'ear_r',     parent: 'body', rect: [86, 16, 32, 34],   pivot: [98, 38] },
      { id: 'body',      parent: null,   rect: [22, 22, 96, 106],  pivot: [70, 120] },
      { id: 'slot',      parent: 'body', rect: [46, 20, 48, 22],   pivot: [70, 32] },
      { id: 'coin_peek', parent: 'slot', rect: [52, 8, 36, 28],    pivot: [70, 30] },
      { id: 'snout',     parent: 'body', rect: [48, 56, 44, 30],   pivot: [70, 70] },
      { id: 'arm_l',     parent: 'body', rect: [16, 74, 28, 28],   pivot: [34, 84] },
      { id: 'arm_r',     parent: 'body', rect: [96, 74, 28, 28],   pivot: [106, 84] },
      { id: 'blink',     parent: 'body', rect: [34, 42, 72, 26],   pivot: [70, 54], hidden: true }
    ]
  },

  drawPart(ctx, id, opt = {}) {
    const seed = opt.seed || 808;
    const boil = opt.boil || 0;
    const piggy = PALETTE.ramps.piggy || PALETTE.ramps.berry;
    const gold = PALETTE.ramps.gold;
    const cream = PALETTE.ramps.cream;
    const berry = PALETTE.ramps.berry;

    switch (id) {
      case 'shadow': {
        drawPoolShadow(ctx, 70, 135, 42, 9.5, { seed, boil: 0, alpha: 0.56 });
        break;
      }

      case 'leg_l':
      case 'leg_r': {
        const isL = id === 'leg_l';
        const cx = isL ? 46 : 94;
        const cy = 125;
        const pts = sampleSuperEllipse(cx, cy, 9.5, 10.5, 22, 2.1);
        paintGouacheBody(ctx, pts, piggy, {
          seed: seed + (isL ? 101 : 119),
          boil,
          surfaceStrokes: 22,
          edgeStrokes: 16,
          grainAlpha: 0.18,
          showRim: !isL
        });
        // 金色小猪蹄边
        drawGouacheStroke(ctx, [
          { x: cx - 6, y: cy + 7 },
          { x: cx, y: cy + 8.5 },
          { x: cx + 6, y: cy + 7 }
        ], {
          color: gold[1],
          alpha: 0.78,
          maxWeight: 2.4,
          minWeight: 1.0,
          seed: seed + 131,
          boil
        });
        break;
      }

      case 'tail': {
        // 右侧卷曲的粉陶瓷小猪尾巴
        const curlPts = [
          { x: 100, y: 94 },
          { x: 114, y: 88 },
          { x: 118, y: 79 },
          { x: 110, y: 77 },
          { x: 108, y: 84 },
          { x: 120, y: 83 }
        ];
        drawGouacheStroke(ctx, curlPts, {
          color: piggy[2],
          alpha: 0.92,
          maxWeight: 5.2,
          minWeight: 2.0,
          seed: seed + 161,
          boil,
          dryFeibai: true
        });
        drawGouacheStroke(ctx, curlPts.slice(0, 4), {
          color: piggy[0],
          alpha: 0.75,
          maxWeight: 2.4,
          minWeight: 0.8,
          seed: seed + 169,
          boil
        });
        break;
      }

      case 'ear_l':
      case 'ear_r': {
        const isL = id === 'ear_l';
        const dir = isL ? -1 : 1;
        const rx = isL ? 42 : 98;
        const ry = 34;
        const earPts = subdivideSpline([
          { x: rx - dir * 6, y: ry + 4 },
          { x: rx + dir * 2, y: ry - 14 },
          { x: rx + dir * 15, y: ry - 10 },
          { x: rx + dir * 13, y: ry + 6 }
        ], true, 3);
        paintGouacheBody(ctx, earPts, piggy, {
          seed: seed + (isL ? 201 : 219),
          boil,
          surfaceStrokes: 22,
          edgeStrokes: 16,
          grainAlpha: 0.18,
          showRim: !isL
        });
        drawShortGouacheDab(ctx, rx + dir * 5, ry - 4, 9.5, 5.2, dir * 0.4, berry[1], 0.45, {
          seed: seed + 233,
          boil
        });
        break;
      }

      case 'body': {
        // 存钱罐小猪圆滚滚的粉陶瓷罐身（一体式圆胖造型 + 肚子上的金色幸运纹章 + 陶瓷温润高光）
        const pigBodyPts = subdivideSpline([
          { x: 70, y: 26 },
          { x: 96, y: 30 },
          { x: 111, y: 54 },
          { x: 113, y: 86 },
          { x: 100, y: 116 },
          { x: 70, y: 124 },
          { x: 40, y: 116 },
          { x: 27, y: 86 },
          { x: 29, y: 54 },
          { x: 44, y: 30 }
        ], true, 4);

        paintGouacheBody(ctx, pigBodyPts, piggy, {
          seed: seed + 301,
          boil,
          boilAmp: 0.88,
          surfaceStrokes: 56,
          edgeStrokes: 40,
          grainAlpha: 0.16,
          showRim: true,
          highlightColor: '#FFFFFF'
        });

        // 陶瓷罐左上侧温润弧形高光带
        drawGouacheStroke(ctx, [
          { x: 35, y: 66 },
          { x: 40, y: 46 },
          { x: 52, y: 35 }
        ], {
          color: '#FFFFFF',
          alpha: 0.68,
          maxWeight: 5.2,
          minWeight: 1.4,
          seed: seed + 321,
          boil,
          dryFeibai: true
        });

        // 肚子下方的奶油金边装饰圆肚子与小四叶星纹
        const bellyPatch = sampleSuperEllipse(70, 99, 23, 16, 22, 2.0);
        fillGouache(ctx, bellyPatch, cream, { seed: seed + 333, boil, alpha: 0.78 });
        for (let k = 0; k < 4; k++) {
          const a = (k / 4) * Math.PI * 2;
          drawShortGouacheDab(
            ctx,
            70 + Math.cos(a) * 5.5,
            99 + Math.sin(a) * 5.5,
            8.5,
            4.2,
            a,
            gold[1],
            0.88,
            { seed: seed + 350 + k * 7, boil }
          );
        }

        // 腮红
        drawBlush(ctx, 41, 66, 8.5, 5.0, { angle: -0.1, seed: seed + 371, boil, alpha: 0.55 });
        drawBlush(ctx, 99, 66, 8.5, 5.0, { angle: 0.1, seed: seed + 379, boil, alpha: 0.55 });

        // 笑盈盈的大眼睛（带弯弯的笑眼眉）
        drawToyEye(ctx, 49, 54, 8.4, {
          seed: seed + 389,
          boil,
          gazeX: 0.08,
          gazeY: -0.10,
          starScale: 1.15,
          lidColor: piggy[3],
          browColor: piggy[3],
          browTilt: -0.12
        });
        drawToyEye(ctx, 91, 54, 8.4, {
          seed: seed + 397,
          boil,
          gazeX: -0.08,
          gazeY: -0.10,
          starScale: 1.15,
          lidColor: piggy[3],
          browColor: piggy[3],
          browTilt: 0.12
        });
        break;
      }

      case 'slot': {
        // 头顶背上的存钱罐投币口（深色长槽 + 金色镶边，一眼认出是存钱罐！）
        const rimPts = sampleSuperEllipse(70, 32, 18.5, 5.8, 20, 2.2);
        fillGouache(ctx, rimPts, gold, { seed: seed + 401, boil });
        const holePts = sampleSuperEllipse(70, 32, 14.5, 3.2, 18, 2.2);
        fillGouache(ctx, holePts, ['#2A0B16', '#120A0B', '#120A0B', '#120A0B'], { seed: seed + 409, boil });
        break;
      }

      case 'coin_peek': {
        // 投币口里露出一半的闪亮金硬币（出手时往上弹出）
        const coinPts = sampleSuperEllipse(70, 25, 11.5, 11.5, 24, 2.0);
        paintGouacheBody(ctx, coinPts, gold, {
          seed: seed + 451,
          boil,
          surfaceStrokes: 24,
          edgeStrokes: 18,
          noGrain: true,
          highlightColor: '#FFFFFF'
        });
        drawShortGouacheDab(ctx, 70, 24, 6.5, 2.8, Math.PI * 0.5, gold[3], 0.78, {
          seed: seed + 463,
          boil
        });
        break;
      }

      case 'snout': {
        // 粉嘟嘟的椭圆翘猪鼻 + 两个深色鼻孔 + 下方微笑小嘴
        const snoutPts = sampleSuperEllipse(70, 66, 14.5, 10.5, 24, 2.05);
        paintGouacheBody(ctx, snoutPts, [ '#FFF0F5', piggy[0], piggy[1], piggy[2] ], {
          seed: seed + 501,
          boil,
          surfaceStrokes: 24,
          edgeStrokes: 18,
          noGrain: true,
          highlightColor: '#FFFFFF'
        });

        ctx.fillStyle = PALETTE.mouth[1];
        ctx.beginPath();
        ctx.ellipse(65, 66, 2.4, 3.6, -0.1, 0, Math.PI * 2);
        ctx.ellipse(75, 66, 2.4, 3.6, 0.1, 0, Math.PI * 2);
        ctx.fill();

        // 猪鼻下方的开心小嘴弧
        drawGouacheStroke(ctx, [
          { x: 63, y: 78 },
          { x: 70, y: 81.5 },
          { x: 77, y: 78 }
        ], {
          color: PALETTE.mouth[1],
          alpha: 0.88,
          maxWeight: 2.1,
          minWeight: 0.9,
          seed: seed + 521,
          boil
        });
        break;
      }

      case 'arm_l':
      case 'arm_r': {
        const isL = id === 'arm_l';
        const dir = isL ? -1 : 1;
        const cx = isL ? 30 : 110;
        const cy = 86;
        const pts = sampleSuperEllipse(cx, cy, 9.0, 8.0, 20, 2.0);
        paintGouacheBody(ctx, pts, piggy, {
          seed: seed + (isL ? 601 : 619),
          boil,
          surfaceStrokes: 20,
          edgeStrokes: 14,
          grainAlpha: 0.16,
          showRim: !isL
        });
        drawShortGouacheDab(ctx, cx + dir * 5, cy + 2, 5.5, 3.2, dir * 0.3, gold[1], 0.82, {
          seed: seed + 631,
          boil
        });
        break;
      }

      case 'blink': {
        for (const ex of [49, 91]) {
          const lidPts = sampleSuperEllipse(ex, 54, 8.8, 8.8, 18, 2.0);
          fillGouache(ctx, lidPts, piggy, { seed: seed + ex, boil });
          drawGouacheStroke(ctx, [
            { x: ex - 8, y: 54 },
            { x: ex, y: 58 },
            { x: ex + 8, y: 54 }
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
      idle: {
        dur: 1800,
        loop: true,
        tracks: {
          body: [
            { t: 0,    y: 0,    sx: 1.00, sy: 1.00, ease: 'smooth' },
            { t: 450,  y: -1.4, sx: 1.025, sy: 0.98, ease: 'smooth' },
            { t: 900,  y: -2.4, sx: 0.985, sy: 1.02, ease: 'smooth' },
            { t: 1350, y: -0.8, sx: 1.02, sy: 0.985, ease: 'smooth' },
            { t: 1800, y: 0,    sx: 1.00, sy: 1.00 }
          ],
          coin_peek: [
            { t: 0,    y: 0,    rot: 0,    ease: 'smooth' },
            { t: 600,  y: -2.2, rot: -4.0, ease: 'smooth' },
            { t: 1200, y: 0.5,  rot: 4.0,  ease: 'smooth' },
            { t: 1800, y: 0,    rot: 0 }
          ],
          ear_l: [
            { t: 0,    rot: 0,  ease: 'smooth' },
            { t: 600,  rot: -8, ease: 'smooth' },
            { t: 1200, rot: 4,  ease: 'smooth' },
            { t: 1800, rot: 0 }
          ],
          ear_r: [
            { t: 0,    rot: 0,  ease: 'smooth' },
            { t: 600,  rot: 8,  ease: 'smooth' },
            { t: 1200, rot: -4, ease: 'smooth' },
            { t: 1800, rot: 0 }
          ],
          snout: [
            { t: 0,    y: 0,    sx: 1.00, sy: 1.00, ease: 'smooth' },
            { t: 900,  y: -1.5, sx: 1.06, sy: 1.04, ease: 'smooth' },
            { t: 1800, y: 0,    sx: 1.00, sy: 1.00 }
          ],
          tail: [
            { t: 0,    rot: 0,   ease: 'smooth' },
            { t: 450,  rot: 14,  ease: 'smooth' },
            { t: 900,  rot: -10, ease: 'smooth' },
            { t: 1350, rot: 12,  ease: 'smooth' },
            { t: 1800, rot: 0 }
          ],
          blink: [
            { t: 0,    hidden: true },
            { t: 1300, hidden: false },
            { t: 1440, hidden: true },
            { t: 1800, hidden: true }
          ]
        }
      },

      // attack（500ms，release=200ms）：蹲抖一下，从背上投币口向上弹出硬币
      attack: {
        dur: 500,
        loop: false,
        tracks: {
          body: [
            { t: 0,   y: 0,    sx: 1.00, sy: 1.00, ease: 'out' },
            { t: 120, y: 5.0,  sx: 1.12, sy: 0.88, ease: 'in' },
            { t: 200, y: -9.0, sx: 0.91, sy: 1.12, ease: 'out' },
            { t: 360, y: 2.0,  sx: 1.04, sy: 0.96, ease: 'smooth' },
            { t: 500, y: 0,    sx: 1.00, sy: 1.00 }
          ],
          coin_peek: [
            { t: 0,   y: 0,     sx: 1.00, sy: 1.00, ease: 'out' },
            { t: 120, y: 4.5,   sx: 1.08, sy: 0.90, ease: 'in' },
            { t: 200, y: -14.0, sx: 1.18, sy: 1.18, ease: 'out' },
            { t: 360, y: -2.0,  sx: 1.00, sy: 1.00, ease: 'smooth' },
            { t: 500, y: 0,     sx: 1.00, sy: 1.00 }
          ],
          arm_l: [
            { t: 0,   rot: 0,   ease: 'out' },
            { t: 120, rot: -20, ease: 'in' },
            { t: 200, rot: 32,  ease: 'smooth' },
            { t: 500, rot: 0 }
          ],
          arm_r: [
            { t: 0,   rot: 0,   ease: 'out' },
            { t: 120, rot: 20,  ease: 'in' },
            { t: 200, rot: -32, ease: 'smooth' },
            { t: 500, rot: 0 }
          ]
        }
      },

      // skill（1000ms，release=500ms）：左右欢快摇晃身体“叮当”响，第 500ms 弹出大金币
      skill: {
        dur: 1000,
        loop: false,
        tracks: {
          body: [
            { t: 0,    x: 0,    y: 0,     rot: 0,     sx: 1.00, sy: 1.00, ease: 'out' },
            { t: 120,  x: -6.5, y: -2.0,  rot: -9.5,  sx: 1.04, sy: 0.97, ease: 'linear' },
            { t: 240,  x: 6.5,  y: -3.0,  rot: 9.5,   sx: 1.04, sy: 0.97, ease: 'linear' },
            { t: 360,  x: -7.0, y: 4.5,   rot: -10.0, sx: 1.14, sy: 0.88, ease: 'in' },
            { t: 500,  x: 0,    y: -12.0, rot: 0,     sx: 0.90, sy: 1.16, ease: 'out' },
            { t: 680,  x: 4.5,  y: 2.5,   rot: 5.5,   sx: 1.06, sy: 0.95, ease: 'smooth' },
            { t: 840,  x: -3.0, y: -1.0,  rot: -3.5,  sx: 1.02, sy: 0.99, ease: 'smooth' },
            { t: 1000, x: 0,    y: 0,     rot: 0,     sx: 1.00, sy: 1.00 }
          ],
          coin_peek: [
            { t: 0,    y: 0,     rot: 0,   sx: 1.00, sy: 1.00, ease: 'out' },
            { t: 120,  y: -5.0,  rot: -16, sx: 1.08, sy: 1.08, ease: 'linear' },
            { t: 240,  y: -6.0,  rot: 16,  sx: 1.08, sy: 1.08, ease: 'linear' },
            { t: 360,  y: 3.0,   rot: -12, sx: 1.10, sy: 0.92, ease: 'in' },
            { t: 500,  y: -16.0, rot: 0,   sx: 1.28, sy: 1.28, ease: 'out' },
            { t: 1000, y: 0,     rot: 0,   sx: 1.00, sy: 1.00 }
          ],
          ear_l: [
            { t: 0,    rot: 0,   ease: 'linear' },
            { t: 150,  rot: -22, ease: 'linear' },
            { t: 300,  rot: 18,  ease: 'linear' },
            { t: 500,  rot: 28,  ease: 'smooth' },
            { t: 1000, rot: 0 }
          ],
          ear_r: [
            { t: 0,    rot: 0,   ease: 'linear' },
            { t: 150,  rot: -18, ease: 'linear' },
            { t: 300,  rot: 22,  ease: 'linear' },
            { t: 500,  rot: -28, ease: 'smooth' },
            { t: 1000, rot: 0 }
          ]
        }
      },

      cheer: {
        dur: 900,
        loop: false,
        tracks: {
          body: [
            { t: 0,   y: 0,     sx: 1.00, sy: 1.00, ease: 'in' },
            { t: 100, y: 4.0,   sx: 1.10, sy: 0.90, ease: 'out' },
            { t: 250, y: -13.5, sx: 0.92, sy: 1.10, ease: 'in' },
            { t: 430, y: 3.5,   sx: 1.10, sy: 0.90, ease: 'out' },
            { t: 600, y: -14.5, sx: 0.92, sy: 1.10, ease: 'in' },
            { t: 770, y: 2.5,   sx: 1.05, sy: 0.95, ease: 'smooth' },
            { t: 900, y: 0,     sx: 1.00, sy: 1.00 }
          ],
          coin_peek: [
            { t: 0,   y: 0,     ease: 'out' },
            { t: 260, y: -10.0, ease: 'in' },
            { t: 440, y: 2.0,   ease: 'out' },
            { t: 620, y: -11.0, ease: 'in' },
            { t: 900, y: 0 }
          ]
        }
      },

      startled: {
        dur: 500,
        loop: false,
        tracks: {
          body: [
            { t: 0,   x: 0,    y: 0,    sx: 1.00, sy: 1.00, ease: 'out' },
            { t: 90,  x: 0,    y: -9.0, sx: 0.88, sy: 1.16, ease: 'in' },
            { t: 170, x: -4.5, y: 5.5,  sx: 1.15, sy: 0.86, ease: 'linear' },
            { t: 240, x: 4.5,  y: 5.5,  sx: 1.14, sy: 0.87, ease: 'linear' },
            { t: 330, x: -2.5, y: 3.5,  sx: 1.06, sy: 0.94, ease: 'smooth' },
            { t: 500, x: 0,    y: 0,    sx: 1.00, sy: 1.00 }
          ],
          coin_peek: [
            { t: 0,   y: 0,     ease: 'out' },
            { t: 100, y: -12.0, ease: 'in' },
            { t: 260, y: 3.0,   ease: 'smooth' },
            { t: 500, y: 0 }
          ]
        }
      }
    }
  }
};


};
__defs["toy_fangfang.js"] = function (__e) {
// 《枕头堡》P1 美术代码：toy_fangfang（方方：积木小兵 · 枕头 · 挡 · 中 · L1 · 第 2 批新做）
// 规范对齐：
// 1. 三套朝向（front / back / side），转过去一眼是同一只由彩色木积木拼成的小士兵；
//    - front：正面（珊瑚红三角形屋顶积木帽 + 顶部圆木榫头、圆角方木块脸、青蓝梯形胸甲积木 + 金腰扣、左臂举彩色大积木盾 shield、右臂抓投掷积木 arm_r、两根原木圆柱腿）；
//    - back：背面（看得到屋顶帽后沿、后脑勺燕尾榫木纹、背上背着的备用彩色积木背篓、双手举大积木盾往前顶或举手扔积木）；
//    - side：侧面画朝右（朝右的积木帽与方木脸、右前方举着的大积木盾、左后侧积木背篓）；
// 2. 动作严格对齐 3.2.1 与 art-manifest-批次2.json：
//    - front: idle (1800 loop), walk (600 loop 原地踏步), cheer (900), startled (500), knocked (400 被挤倒), down (1600 loop 趴着晕乎乎), getup (700 爬起来回 idle)
//    - back / side: idle (1800 loop), walk (600 loop), attack (500, release=200 举手扔积木), skill (1000, release=500 抱起一摞积木砸出去), block (800 loop 举着大积木当盾往前顶)

const {
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
} = __req("kit/index.js");

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

__e.default = {
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


};
__defs["toy_gaga.js"] = function (__e) {
// 《枕头堡》P1 美术代码：toy_gaga（嘎嘎：橡皮鸭 · 凉 · 打 · 小 · L1 · 第 2 批新做）
// 规范对齐：
// 1. 活动范围“小”，只有正面 facings: ['front']；
// 2. 动作：idle (1800 loop), walk (600 loop 挪一两步), attack (500, release=150 嘴一挤滋出一道水柱), skill (1000, release=500 鼓成球喷一大股), cheer (900), startled (500)；
// 3. 造型：暖黄水粉橡皮鸭，头顶两撮呆萌翘毛、宽扁橙色鸭嘴（独立部件 bill，发射点 muzzle: [70, 56]）、胸前小水手领巾、两侧小鸭翅与橙色鸭蹼脚。

const {
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
} = __req("kit/index.js");

__e.default = {
  key: 'toy_gaga',
  level: 'L1',
  size: [140, 150],
  anchor: [70, 138],
  display: [112, 120],
  sizeRange: [80, 180],
  stance: '打',
  range: '小',
  boil: 3,
  facings: ['front'],

  muzzle: {
    front: [70, 56]
  },
  release: {
    attack: 150,
    skill: 500
  },

  parts: {
    front: [
      { id: 'shadow',  parent: null,   rect: [22, 122, 96, 26],  pivot: [70, 138], boil: false },
      { id: 'foot_l',  parent: 'body', rect: [32, 114, 32, 28],  pivot: [50, 122] },
      { id: 'foot_r',  parent: 'body', rect: [76, 114, 32, 28],  pivot: [90, 122] },
      { id: 'tail',    parent: 'body', rect: [84, 82, 36, 36],   pivot: [92, 104] },
      { id: 'body',    parent: null,   rect: [26, 60, 88, 70],   pivot: [70, 122] },
      { id: 'collar',  parent: 'body', rect: [34, 64, 72, 32],   pivot: [70, 74] },
      { id: 'wing_l',  parent: 'body', rect: [14, 70, 30, 38],   pivot: [36, 80] },
      { id: 'wing_r',  parent: 'body', rect: [96, 70, 30, 38],   pivot: [104, 80] },
      { id: 'head',    parent: 'body', rect: [26, 16, 88, 60],   pivot: [70, 68] },
      { id: 'tuft',    parent: 'head', rect: [48, 4, 44, 24],    pivot: [70, 22] },
      { id: 'bill',    parent: 'head', rect: [44, 42, 52, 28],   pivot: [70, 56] },
      { id: 'blink',   parent: 'head', rect: [32, 30, 76, 26],   pivot: [70, 42], hidden: true }
    ]
  },

  drawPart(ctx, id, opt = {}) {
    const seed = opt.seed || 707;
    const boil = opt.boil || 0;
    const gold = PALETTE.ramps.gold;
    const orange = PALETTE.ramps.orange;
    const cool = PALETTE.elements.cool;
    const cream = PALETTE.ramps.cream;

    switch (id) {
      case 'shadow': {
        drawPoolShadow(ctx, 70, 135, 39, 9, { seed, boil: 0, alpha: 0.56 });
        break;
      }

      case 'foot_l':
      case 'foot_r': {
        const isL = id === 'foot_l';
        const cx = isL ? 49 : 91;
        const cy = 128;
        // 橙色三蹼小鸭掌
        const webbedPts = subdivideSpline([
          { x: cx - 6, y: cy - 8 },
          { x: cx + 6, y: cy - 8 },
          { x: cx + 12, y: cy + 5 },
          { x: cx + 4, y: cy + 8 },
          { x: cx, y: cy + 10 },
          { x: cx - 5, y: cy + 8 },
          { x: cx - 12, y: cy + 5 }
        ], true, 3);
        paintGouacheBody(ctx, webbedPts, orange, {
          seed: seed + (isL ? 101 : 119),
          boil,
          surfaceStrokes: 22,
          edgeStrokes: 16,
          grainAlpha: 0.20,
          showRim: !isL
        });
        break;
      }

      case 'tail': {
        // 右后侧翘起的小鸭屁股尖尾
        const tailPts = subdivideSpline([
          { x: 88, y: 98 },
          { x: 106, y: 88 },
          { x: 115, y: 94 },
          { x: 108, y: 109 },
          { x: 90, y: 112 }
        ], true, 3);
        paintGouacheBody(ctx, tailPts, gold, {
          seed: seed + 151,
          boil,
          surfaceStrokes: 20,
          edgeStrokes: 16,
          grainAlpha: 0.20,
          showRim: true
        });
        break;
      }

      case 'body': {
        // 橡皮鸭圆滚滚的浮水肥肚子（带橡皮玩具特有的温润高光弧）
        const bodyPts = subdivideSpline([
          { x: 46, y: 66 },
          { x: 94, y: 66 },
          { x: 108, y: 88 },
          { x: 106, y: 112 },
          { x: 88, y: 125 },
          { x: 70, y: 127 },
          { x: 52, y: 125 },
          { x: 34, y: 112 },
          { x: 32, y: 88 }
        ], true, 4);

        paintGouacheBody(ctx, bodyPts, gold, {
          seed: seed + 201,
          boil,
          boilAmp: 0.9,
          surfaceStrokes: 52,
          edgeStrokes: 38,
          grainAlpha: 0.20,
          showRim: true,
          highlightColor: '#FFFDF8'
        });

        // 肚子正中暖奶油浅肚皮光泽（0 颗粒，干净通透）
        const bellyGlow = sampleSuperEllipse(68, 98, 22, 17, 22, 2.0);
        fillGouache(ctx, bellyGlow, cream, { seed: seed + 233, boil, alpha: 0.55 });
        drawGouacheStroke(ctx, [
          { x: 42, y: 86 },
          { x: 48, y: 76 },
          { x: 58, y: 72 }
        ], {
          color: '#FFFFFF',
          alpha: 0.65,
          maxWeight: 4.5,
          minWeight: 1.2,
          seed: seed + 251,
          boil,
          dryFeibai: true
        });
        break;
      }

      case 'collar': {
        // 脖子上一圈冰蓝色洗澡水手领巾（呼应“凉”属性）
        const colPts = subdivideSpline([
          { x: 42, y: 69 },
          { x: 70, y: 75 },
          { x: 98, y: 69 },
          { x: 94, y: 79 },
          { x: 70, y: 89 },
          { x: 46, y: 79 }
        ], true, 3);
        paintGouacheBody(ctx, colPts, cool, {
          seed: seed + 301,
          boil,
          surfaceStrokes: 24,
          edgeStrokes: 18,
          grainAlpha: 0.18,
          showRim: true
        });
        // 领巾白色水手条纹
        drawGouacheStroke(ctx, [
          { x: 48, y: 77 },
          { x: 70, y: 85 },
          { x: 92, y: 77 }
        ], {
          color: '#FFFDF8',
          alpha: 0.82,
          maxWeight: 2.0,
          minWeight: 0.9,
          seed: seed + 319,
          boil
        });
        break;
      }

      case 'wing_l':
      case 'wing_r': {
        const isL = id === 'wing_l';
        const dir = isL ? -1 : 1;
        const rx = isL ? 34 : 106;
        const ry = 82;
        const wingPts = subdivideSpline([
          { x: rx, y: ry - 8 },
          { x: rx + dir * 14, y: ry },
          { x: rx + dir * 16, y: ry + 14 },
          { x: rx + dir * 6, y: ry + 20 },
          { x: rx - dir * 2, y: ry + 10 }
        ], true, 3);
        paintGouacheBody(ctx, wingPts, gold, {
          seed: seed + (isL ? 401 : 419),
          boil,
          surfaceStrokes: 24,
          edgeStrokes: 18,
          grainAlpha: 0.20,
          showRim: !isL
        });
        break;
      }

      case 'head': {
        // 圆润蓬松的鸭子大脑袋（脸颊鼓鼓的，脸上不加深色颗粒）
        const headPts = subdivideSpline([
          { x: 70, y: 20 },
          { x: 94, y: 24 },
          { x: 105, y: 40 },
          { x: 108, y: 56 },
          { x: 94, y: 69 },
          { x: 70, y: 71 },
          { x: 46, y: 69 },
          { x: 32, y: 56 },
          { x: 35, y: 40 },
          { x: 46, y: 24 }
        ], true, 4);

        paintGouacheBody(ctx, headPts, gold, {
          seed: seed + 501,
          boil,
          boilAmp: 0.85,
          surfaceStrokes: 48,
          edgeStrokes: 36,
          grainAlpha: 0.16,
          showRim: true,
          highlightColor: '#FFFDF8'
        });

        // 腮红
        drawBlush(ctx, 42, 54, 8.2, 4.8, { angle: -0.1, seed: seed + 531, boil, alpha: 0.56 });
        drawBlush(ctx, 98, 54, 8.2, 4.8, { angle: 0.1, seed: seed + 539, boil, alpha: 0.56 });

        // 灵动有神的圆眼睛（眼距略宽，区别于呼呼和绵绵）
        drawToyEye(ctx, 49, 42, 8.5, {
          seed: seed + 551,
          boil,
          gazeX: 0.10,
          gazeY: -0.12,
          starScale: 1.12,
          lidColor: gold[2]
        });
        drawToyEye(ctx, 91, 42, 8.5, {
          seed: seed + 563,
          boil,
          gazeX: -0.10,
          gazeY: -0.12,
          starScale: 1.12,
          lidColor: gold[2]
        });
        break;
      }

      case 'tuft': {
        // 头顶两撮翘起的呆萌黄色小鸭毛
        const tuftPts = subdivideSpline([
          { x: 64, y: 22 },
          { x: 56, y: 11 },
          { x: 66, y: 14 },
          { x: 72, y: 6 },
          { x: 80, y: 14 },
          { x: 76, y: 22 }
        ], true, 3);
        paintGouacheBody(ctx, tuftPts, gold, {
          seed: seed + 601,
          boil,
          surfaceStrokes: 18,
          edgeStrokes: 14,
          noGrain: true
        });
        break;
      }

      case 'bill': {
        // 饱满翘起的橙色橡皮鸭扁嘴（攻击时挤压滋水，中心正是发射点 [70, 56]）
        const billPts = subdivideSpline([
          { x: 52, y: 49 },
          { x: 70, y: 45 },
          { x: 88, y: 49 },
          { x: 92, y: 57 },
          { x: 84, y: 65 },
          { x: 70, y: 66 },
          { x: 56, y: 65 },
          { x: 48, y: 57 }
        ], true, 4);
        paintGouacheBody(ctx, billPts, orange, {
          seed: seed + 701,
          boil,
          surfaceStrokes: 26,
          edgeStrokes: 20,
          noGrain: true,
          highlightColor: '#FFE8B8'
        });
        // 鸭嘴微笑线与喷水圆孔
        drawGouacheStroke(ctx, [
          { x: 53, y: 57 },
          { x: 70, y: 60 },
          { x: 87, y: 57 }
        ], {
          color: PALETTE.faceInk,
          alpha: 0.82,
          maxWeight: 2.0,
          minWeight: 0.8,
          seed: seed + 719,
          boil
        });
        ctx.fillStyle = PALETTE.faceInk;
        ctx.beginPath();
        ctx.ellipse(70, 56, 3.2, 2.4, 0, 0, Math.PI * 2);
        ctx.fill();
        break;
      }

      case 'blink': {
        for (const ex of [49, 91]) {
          const lidPts = sampleSuperEllipse(ex, 42, 8.8, 8.8, 18, 2.0);
          fillGouache(ctx, lidPts, gold, { seed: seed + ex, boil });
          drawGouacheStroke(ctx, [
            { x: ex - 8, y: 42 },
            { x: ex, y: 46 },
            { x: ex + 8, y: 42 }
          ], {
            color: PALETTE.faceInk,
            alpha: 0.9,
            maxWeight: 2.4,
            minWeight: 0.9,
            seed: seed + ex + 17,
            boil
          });
        }
        break;
      }
    }
  },

  anims: {
    front: {
      idle: {
        dur: 1800,
        loop: true,
        tracks: {
          body: [
            { t: 0,    y: 0,    sx: 1.00, sy: 1.00, ease: 'smooth' },
            { t: 450,  y: -1.6, sx: 1.03, sy: 0.975, ease: 'smooth' },
            { t: 900,  y: -2.8, sx: 0.98, sy: 1.025, ease: 'smooth' },
            { t: 1350, y: -1.0, sx: 1.02, sy: 0.985, ease: 'smooth' },
            { t: 1800, y: 0,    sx: 1.00, sy: 1.00 }
          ],
          head: [
            { t: 0,    y: 0,    rot: 0,    ease: 'smooth' },
            { t: 600,  y: -1.5, rot: -2.2, ease: 'smooth' },
            { t: 1200, y: -2.2, rot: 2.2,  ease: 'smooth' },
            { t: 1800, y: 0,    rot: 0 }
          ],
          tuft: [
            { t: 0,    rot: 0,   ease: 'smooth' },
            { t: 600,  rot: 8,   ease: 'smooth' },
            { t: 1200, rot: -8,  ease: 'smooth' },
            { t: 1800, rot: 0 }
          ],
          wing_l: [
            { t: 0,    rot: 0,   ease: 'smooth' },
            { t: 500,  rot: 10,  ease: 'smooth' },
            { t: 1100, rot: -5,  ease: 'smooth' },
            { t: 1800, rot: 0 }
          ],
          wing_r: [
            { t: 0,    rot: 0,   ease: 'smooth' },
            { t: 500,  rot: -10, ease: 'smooth' },
            { t: 1100, rot: 5,   ease: 'smooth' },
            { t: 1800, rot: 0 }
          ],
          tail: [
            { t: 0,    rot: 0,   ease: 'smooth' },
            { t: 450,  rot: 12,  ease: 'smooth' },
            { t: 900,  rot: -8,  ease: 'smooth' },
            { t: 1350, rot: 10,  ease: 'smooth' },
            { t: 1800, rot: 0 }
          ],
          blink: [
            { t: 0,    hidden: true },
            { t: 1280, hidden: false },
            { t: 1420, hidden: true },
            { t: 1800, hidden: true }
          ]
        }
      },

      // walk（600ms 循环）：鸭子一摇一摆原地挪步
      walk: {
        dur: 600,
        loop: true,
        tracks: {
          body: [
            { t: 0,   y: 0,    rot: 0,    sx: 1.00, sy: 1.00, ease: 'smooth' },
            { t: 150, y: -4.0, rot: -4.5, sx: 0.97, sy: 1.04, ease: 'smooth' },
            { t: 300, y: 1.0,  rot: 0,    sx: 1.03, sy: 0.97, ease: 'smooth' },
            { t: 450, y: -4.0, rot: 4.5,  sx: 0.97, sy: 1.04, ease: 'smooth' },
            { t: 600, y: 0,    rot: 0,    sx: 1.00, sy: 1.00 }
          ],
          head: [
            { t: 0,   rot: 0,    ease: 'smooth' },
            { t: 150, rot: 3.5,  ease: 'smooth' },
            { t: 300, rot: 0,    ease: 'smooth' },
            { t: 450, rot: -3.5, ease: 'smooth' },
            { t: 600, rot: 0 }
          ],
          foot_l: [
            { t: 0,   y: 0,    rot: 0,   ease: 'smooth' },
            { t: 150, y: -7.5, rot: 14,  ease: 'smooth' },
            { t: 300, y: 0,    rot: 0,   ease: 'smooth' },
            { t: 450, y: 1.5,  rot: -6,  ease: 'smooth' },
            { t: 600, y: 0,    rot: 0 }
          ],
          foot_r: [
            { t: 0,   y: 0,    rot: 0,   ease: 'smooth' },
            { t: 150, y: 1.5,  rot: 6,   ease: 'smooth' },
            { t: 300, y: 0,    rot: 0,   ease: 'smooth' },
            { t: 450, y: -7.5, rot: -14, ease: 'smooth' },
            { t: 600, y: 0,    rot: 0 }
          ],
          wing_l: [
            { t: 0,   rot: 0,  ease: 'smooth' },
            { t: 150, rot: 22, ease: 'smooth' },
            { t: 450, rot: -8, ease: 'smooth' },
            { t: 600, rot: 0 }
          ],
          wing_r: [
            { t: 0,   rot: 0,   ease: 'smooth' },
            { t: 150, rot: 8,   ease: 'smooth' },
            { t: 450, rot: -22, ease: 'smooth' },
            { t: 600, rot: 0 }
          ]
        }
      },

      // attack（500ms，release=150ms）：嘴一挤，朝上方一倾滋出水柱
      attack: {
        dur: 500,
        loop: false,
        tracks: {
          body: [
            { t: 0,   y: 0,    sx: 1.00, sy: 1.00, ease: 'out' },
            { t: 90,  y: 4.5,  sx: 1.14, sy: 0.88, ease: 'in' },
            { t: 150, y: -8.5, sx: 0.90, sy: 1.14, ease: 'out' },
            { t: 320, y: -3.0, sx: 0.96, sy: 1.05, ease: 'smooth' },
            { t: 500, y: 0,    sx: 1.00, sy: 1.00 }
          ],
          head: [
            { t: 0,   y: 0,    sx: 1.00, sy: 1.00, ease: 'out' },
            { t: 90,  y: 3.5,  sx: 1.12, sy: 0.90, ease: 'in' },
            { t: 150, y: -7.5, sx: 0.92, sy: 1.12, ease: 'out' },
            { t: 500, y: 0,    sx: 1.00, sy: 1.00 }
          ],
          bill: [
            { t: 0,   y: 0,    sx: 1.00, sy: 1.00, ease: 'out' },
            { t: 90,  y: 2.0,  sx: 1.26, sy: 0.82, ease: 'in' },
            { t: 150, y: -5.5, sx: 0.82, sy: 1.32, ease: 'out' },
            { t: 340, y: -2.0, sx: 0.94, sy: 1.10, ease: 'smooth' },
            { t: 500, y: 0,    sx: 1.00, sy: 1.00 }
          ],
          wing_l: [
            { t: 0,   rot: 0,   ease: 'out' },
            { t: 90,  rot: -20, ease: 'in' },
            { t: 150, rot: 34,  ease: 'smooth' },
            { t: 500, rot: 0 }
          ],
          wing_r: [
            { t: 0,   rot: 0,   ease: 'out' },
            { t: 90,  rot: 20,  ease: 'in' },
            { t: 150, rot: -34, ease: 'smooth' },
            { t: 500, rot: 0 }
          ]
        }
      },

      // skill（1000ms，release=500ms）：全身鼓成大圆球，第 500ms 喷出一大股水柱
      skill: {
        dur: 1000,
        loop: false,
        tracks: {
          body: [
            { t: 0,    y: 0,     sx: 1.00, sy: 1.00, ease: 'out' },
            { t: 380,  y: 5.5,   sx: 1.30, sy: 1.22, ease: 'in' },
            { t: 500,  y: -11.5, sx: 0.86, sy: 1.20, ease: 'out' },
            { t: 780,  y: -4.5,  sx: 0.95, sy: 1.06, ease: 'smooth' },
            { t: 1000, y: 0,     sx: 1.00, sy: 1.00 }
          ],
          head: [
            { t: 0,    y: 0,     sx: 1.00, sy: 1.00, ease: 'out' },
            { t: 380,  y: 3.5,   sx: 1.22, sy: 1.16, ease: 'in' },
            { t: 500,  y: -10.0, sx: 0.90, sy: 1.16, ease: 'out' },
            { t: 1000, y: 0,     sx: 1.00, sy: 1.00 }
          ],
          bill: [
            { t: 0,    y: 0,    sx: 1.00, sy: 1.00, ease: 'out' },
            { t: 380,  y: 3.0,  sx: 1.38, sy: 1.25, ease: 'in' },
            { t: 500,  y: -7.5, sx: 0.78, sy: 1.42, ease: 'out' },
            { t: 800,  y: -2.5, sx: 0.92, sy: 1.12, ease: 'smooth' },
            { t: 1000, y: 0,    sx: 1.00, sy: 1.00 }
          ],
          wing_l: [
            { t: 0,    rot: 0,  ease: 'out' },
            { t: 380,  rot: 42, ease: 'in' },
            { t: 500,  rot: -28, ease: 'smooth' },
            { t: 1000, rot: 0 }
          ],
          wing_r: [
            { t: 0,    rot: 0,   ease: 'out' },
            { t: 380,  rot: -42, ease: 'in' },
            { t: 500,  rot: 28,  ease: 'smooth' },
            { t: 1000, rot: 0 }
          ]
        }
      },

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
          wing_l: [
            { t: 0,   rot: 0,  ease: 'out' },
            { t: 250, rot: 46, ease: 'in' },
            { t: 430, rot: 10, ease: 'out' },
            { t: 600, rot: 48, ease: 'in' },
            { t: 900, rot: 0 }
          ],
          wing_r: [
            { t: 0,   rot: 0,   ease: 'out' },
            { t: 250, rot: -46, ease: 'in' },
            { t: 430, rot: -10, ease: 'out' },
            { t: 600, rot: -48, ease: 'in' },
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
          wing_l: [
            { t: 0,   rot: 0,  ease: 'out' },
            { t: 90,  rot: 55, ease: 'smooth' },
            { t: 500, rot: 0 }
          ],
          wing_r: [
            { t: 0,   rot: 0,   ease: 'out' },
            { t: 90,  rot: -55, ease: 'smooth' },
            { t: 500, rot: 0 }
          ]
        }
      }
    }
  }
};


};
__defs["toy_huhu.js"] = function (__e) {
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

const {
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
} = __req("kit/index.js");

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

__e.default = {
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


};
export const ARTCODE = { version: "b9ca29b1355f", files: ["bg_dream_0.js","captain_mianmian.js","fx_warm.js","kit/index.js","nm_eyes.js","obj_sheep.js","palette.js","rig-player.js","shot_abing.js","shot_dingdang.js","shot_fangfang.js","shot_gaga.js","shot_huhu.js","toy_abing.js","toy_dingdang.js","toy_fangfang.js","toy_gaga.js","toy_huhu.js"], req: __req } as unknown as ArtPackage;
