// 《枕头堡》P1 美术代码：shot_huhu（呼呼的直线弹道：小火球 · L3 · 第 2 批新做）
// 规范对齐：
// 1. kind: 'straight'，只画飞的样子和打中，不画飞行轨迹；
// 2. fly（3 帧循环，画朝右，屏幕尺寸约 46×32）：一颗小火球（暖黄芯 #FFF3C4/#FFD35E、橙边 #FF9A45/#D95B26，边缘火焰笔触在跳动）；
// 3. trail（热气拖尾粒子配方）+ hit（打中炸开一小团热气和火星）。

import {
  PALETTE,
  hash32,
  sampleSuperEllipse,
  subdivideSpline,
  paintGouacheBody,
  fillGouache,
  drawGouacheStroke,
  drawShortGouacheDab,
  drawRadialGlow
} from './kit/index.js';

export default {
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
