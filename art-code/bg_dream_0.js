// 《枕头堡》P1 美术代码：bg_dream_0（刚闭眼：梦里的卧室 · bg · 第 2 批返修）
// 返修重点（严格对齐 00-美术外包说明.md 与 美术文档-P1.md 1.5 / 3.7 节）：
// 1. 中间噩梦走的那片地（屏幕 y 262–774，画布 y 552–1064）和底下窝的位置（屏幕 y 774 以下，画布 y 1064–1624）几乎不要颗粒；
// 2. 颗粒只留给顶上的雾（画布 y 0–552）和左右两边的暗处边缘；
// 3. 750×1624 底对齐，左上角栅栏区（屏幕 y 170–220）与右侧手电按钮区（屏幕 690, 830）严格留白。

import {
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
} from './kit/index.js';

export default {
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
