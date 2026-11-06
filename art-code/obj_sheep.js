// 《枕头堡》P1 美术代码：obj_sheep（拍散的噩梦 → 棉花 → 白色小羊 · L2 · 第 2 批返修）
// 返修重点：
// 1. 严格按 1.5 节改颗粒：白羊身上干净无脏点（仅在右下背光边缘有极浅同色系毛绒细粒，羊脸 0 颗粒）；
// 2. 保持 cotton / pop / run（朝左上跑）/ jump（往左跳栅栏）四套动作。

import {
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
} from './kit/index.js';

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

export default {
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
