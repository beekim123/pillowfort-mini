// 《枕头堡》P1 美术代码：toy_gaga（嘎嘎：橡皮鸭 · 凉 · 打 · 小 · L1 · 第 2 批新做）
// 规范对齐：
// 1. 活动范围“小”，只有正面 facings: ['front']；
// 2. 动作：idle (1800 loop), walk (600 loop 挪一两步), attack (500, release=150 嘴一挤滋出一道水柱), skill (1000, release=500 鼓成球喷一大股), cheer (900), startled (500)；
// 3. 造型：暖黄水粉橡皮鸭，头顶两撮呆萌翘毛、宽扁橙色鸭嘴（独立部件 bill，发射点 muzzle: [70, 56]）、胸前小水手领巾、两侧小鸭翅与橙色鸭蹼脚。

import {
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
} from './kit/index.js';

export default {
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
