// 《枕头堡》P1 美术代码：shot_fangfang（方方的抛物线弹道：彩色木积木 · L3 · 第 2 批新做）
// 规范对齐：
// 1. kind: 'lob'，只画飞的样子和打中，不画飞行轨迹；
// 2. fly（3 帧，正着画，开发让它边飞边转）：一块立体圆角彩色木积木（珊瑚红/金黄/青蓝拼面 + 木纹高光笔触）；
// 3. hit（打中积木弹开、冒木屑）。

import {
  PALETTE,
  subdivideSpline,
  paintGouacheBody,
  fillGouache,
  drawGouacheStroke,
  drawShortGouacheDab
} from './kit/index.js';

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

export default {
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
