// 《枕头堡》P1 美术代码：shot_dingdang（叮当的抛物线弹道：金硬币 + 脚下光环 aura · L3 · 第 2 批新做）
// 规范对齐：
// 1. kind: 'lob'，aura: 175；
// 2. fly（3 帧，正着画，翻着飞的闪亮金色硬币 38×38）+ hit（打中“叮”的星光）；
// 3. aura（脚下一圈暖金柔光，平放在地上，半径 175 -> 画布 350×350）。

import {
  PALETTE,
  hash32,
  rgba,
  sampleSuperEllipse,
  paintGouacheBody,
  fillGouache,
  drawGouacheStroke,
  drawShortGouacheDab,
  drawRadialGlow
} from './kit/index.js';

export default {
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
