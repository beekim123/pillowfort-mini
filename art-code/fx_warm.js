// 《枕头堡》P1 美术代码：fx_warm（暖属性特效笔刷与粒子配方 · L3 · 第 2 批返修）
// 返修重点：
// 1. 呼呼改吐小火球（shot_huhu），按要求删掉 breath 配方，保留 hit 与 burn；
// 2. 笔刷颗粒跟随新画笔库 1.5 节规范减量并采用同色系深一档。

import {
  PALETTE,
  hash32,
  subdivideSpline,
  paintGouacheBody,
  drawGouacheStroke,
  drawShortGouacheDab,
  drawRadialGlow
} from './kit/index.js';

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

export default {
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
