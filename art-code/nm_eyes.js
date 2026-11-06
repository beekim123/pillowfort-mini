// 《枕头堡》P1 美术代码：nm_eyes（衣柜缝的眼睛 · 噩梦第 0 区 · L2 · 第 2 批返修）
// 返修重点：
// 1. 噩梦本来就暗，颗粒更加克制（仅在暗面边缘铺极淡同色系深紫黑颗粒），靠淡紫色月光边 (#B9A8FF) 与暖黄白发光大眼睛认出来；
// 2. burst 拍散出的白棉花团干净无脏点；
// 3. 保持 walk / hit / push / burst 四组动作。

import {
  PALETTE,
  lerp,
  subdivideSpline,
  paintGouacheBody,
  drawGouacheStroke,
  drawShortGouacheDab,
  drawNightmareEye,
  drawPoolShadow,
  drawRadialGlow
} from './kit/index.js';

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

export default {
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
