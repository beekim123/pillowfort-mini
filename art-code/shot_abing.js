// 《枕头堡》P1 美术代码：shot_abing（阿冰的直线弹道：雪球 · L3 · 第 2 批新做）
// 规范对齐：
// 1. kind: 'straight'，只画飞的样子和打中，不画飞行轨迹；
// 2. fly（3 帧循环，画朝右，屏幕尺寸 44×32）：一颗圆润紧实的冰白雪球 + 左侧寒气与雪粒尾迹；
// 3. trail（几粒雪拖尾粒子配方）+ hit（打中碎成雪花）。

import {
  PALETTE,
  sampleSuperEllipse,
  paintGouacheBody,
  drawGouacheStroke,
  drawShortGouacheDab,
  drawRadialGlow
} from './kit/index.js';

export default {
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
