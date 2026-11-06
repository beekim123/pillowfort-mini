// 《枕头堡》P1 美术代码：shot_gaga（嘎嘎的柱子弹道：水柱 · L3 · 第 2 批新做）
// 规范对齐：
// 1. kind: 'beam'；
// 2. beam（朝右的一段水柱 96×36，左右严格周期对齐无缝衔接，中间亮 #E8FAFF、边上冰蓝 #8FE3FF/#48A9D6 并带跃动水花）；
// 3. cap（起点/终点小水花 40×40）+ hit（打中溅一圈水滴）。

import {
  PALETTE,
  hash32,
  rgba,
  subdivideSpline,
  paintGouacheBody,
  drawGouacheStroke,
  drawShortGouacheDab
} from './kit/index.js';

export default {
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
