// 《枕头堡》P1 美术代码：toy_dingdang（叮当：存钱罐小猪 · 枕头 · 帮 · 不动 · L1 · 第 2 批新做）
// 规范对齐：
// 1. 活动范围“不动”，只有正面 facings: ['front']，无 walk；
// 2. 动作：idle (1800 loop), attack (500, release=200 抖一下扔出硬币), skill (1000, release=500 摇身体“叮当”响), cheer (900), startled (500)；
// 3. 造型：粉陶瓷存钱罐小猪（piggy 暖粉色族 + 水粉高光笔触），3/4 俯视看得到背上的投币口 slot 和露出一半的金硬币 coin_peek（发射点 muzzle: [70, 30]）、翘猪鼻 snout、腹前金色四叶草徽章。

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
  key: 'toy_dingdang',
  level: 'L1',
  size: [140, 150],
  anchor: [70, 138],
  display: [112, 120],
  sizeRange: [80, 180],
  stance: '帮',
  range: '不动',
  boil: 3,
  facings: ['front'],

  muzzle: {
    front: [70, 30]
  },
  release: {
    attack: 200,
    skill: 500
  },

  parts: {
    front: [
      { id: 'shadow',    parent: null,   rect: [20, 122, 100, 26], pivot: [70, 138], boil: false },
      { id: 'leg_l',     parent: 'body', rect: [32, 110, 28, 30],  pivot: [46, 118] },
      { id: 'leg_r',     parent: 'body', rect: [80, 110, 28, 30],  pivot: [94, 118] },
      { id: 'tail',      parent: 'body', rect: [96, 74, 32, 34],   pivot: [102, 92] },
      { id: 'ear_l',     parent: 'body', rect: [22, 16, 32, 34],   pivot: [42, 38] },
      { id: 'ear_r',     parent: 'body', rect: [86, 16, 32, 34],   pivot: [98, 38] },
      { id: 'body',      parent: null,   rect: [22, 22, 96, 106],  pivot: [70, 120] },
      { id: 'slot',      parent: 'body', rect: [46, 20, 48, 22],   pivot: [70, 32] },
      { id: 'coin_peek', parent: 'slot', rect: [52, 8, 36, 28],    pivot: [70, 30] },
      { id: 'snout',     parent: 'body', rect: [48, 56, 44, 30],   pivot: [70, 70] },
      { id: 'arm_l',     parent: 'body', rect: [16, 74, 28, 28],   pivot: [34, 84] },
      { id: 'arm_r',     parent: 'body', rect: [96, 74, 28, 28],   pivot: [106, 84] },
      { id: 'blink',     parent: 'body', rect: [34, 42, 72, 26],   pivot: [70, 54], hidden: true }
    ]
  },

  drawPart(ctx, id, opt = {}) {
    const seed = opt.seed || 808;
    const boil = opt.boil || 0;
    const piggy = PALETTE.ramps.piggy || PALETTE.ramps.berry;
    const gold = PALETTE.ramps.gold;
    const cream = PALETTE.ramps.cream;
    const berry = PALETTE.ramps.berry;

    switch (id) {
      case 'shadow': {
        drawPoolShadow(ctx, 70, 135, 42, 9.5, { seed, boil: 0, alpha: 0.56 });
        break;
      }

      case 'leg_l':
      case 'leg_r': {
        const isL = id === 'leg_l';
        const cx = isL ? 46 : 94;
        const cy = 125;
        const pts = sampleSuperEllipse(cx, cy, 9.5, 10.5, 22, 2.1);
        paintGouacheBody(ctx, pts, piggy, {
          seed: seed + (isL ? 101 : 119),
          boil,
          surfaceStrokes: 22,
          edgeStrokes: 16,
          grainAlpha: 0.18,
          showRim: !isL
        });
        // 金色小猪蹄边
        drawGouacheStroke(ctx, [
          { x: cx - 6, y: cy + 7 },
          { x: cx, y: cy + 8.5 },
          { x: cx + 6, y: cy + 7 }
        ], {
          color: gold[1],
          alpha: 0.78,
          maxWeight: 2.4,
          minWeight: 1.0,
          seed: seed + 131,
          boil
        });
        break;
      }

      case 'tail': {
        // 右侧卷曲的粉陶瓷小猪尾巴
        const curlPts = [
          { x: 100, y: 94 },
          { x: 114, y: 88 },
          { x: 118, y: 79 },
          { x: 110, y: 77 },
          { x: 108, y: 84 },
          { x: 120, y: 83 }
        ];
        drawGouacheStroke(ctx, curlPts, {
          color: piggy[2],
          alpha: 0.92,
          maxWeight: 5.2,
          minWeight: 2.0,
          seed: seed + 161,
          boil,
          dryFeibai: true
        });
        drawGouacheStroke(ctx, curlPts.slice(0, 4), {
          color: piggy[0],
          alpha: 0.75,
          maxWeight: 2.4,
          minWeight: 0.8,
          seed: seed + 169,
          boil
        });
        break;
      }

      case 'ear_l':
      case 'ear_r': {
        const isL = id === 'ear_l';
        const dir = isL ? -1 : 1;
        const rx = isL ? 42 : 98;
        const ry = 34;
        const earPts = subdivideSpline([
          { x: rx - dir * 6, y: ry + 4 },
          { x: rx + dir * 2, y: ry - 14 },
          { x: rx + dir * 15, y: ry - 10 },
          { x: rx + dir * 13, y: ry + 6 }
        ], true, 3);
        paintGouacheBody(ctx, earPts, piggy, {
          seed: seed + (isL ? 201 : 219),
          boil,
          surfaceStrokes: 22,
          edgeStrokes: 16,
          grainAlpha: 0.18,
          showRim: !isL
        });
        drawShortGouacheDab(ctx, rx + dir * 5, ry - 4, 9.5, 5.2, dir * 0.4, berry[1], 0.45, {
          seed: seed + 233,
          boil
        });
        break;
      }

      case 'body': {
        // 存钱罐小猪圆滚滚的粉陶瓷罐身（一体式圆胖造型 + 肚子上的金色幸运纹章 + 陶瓷温润高光）
        const pigBodyPts = subdivideSpline([
          { x: 70, y: 26 },
          { x: 96, y: 30 },
          { x: 111, y: 54 },
          { x: 113, y: 86 },
          { x: 100, y: 116 },
          { x: 70, y: 124 },
          { x: 40, y: 116 },
          { x: 27, y: 86 },
          { x: 29, y: 54 },
          { x: 44, y: 30 }
        ], true, 4);

        paintGouacheBody(ctx, pigBodyPts, piggy, {
          seed: seed + 301,
          boil,
          boilAmp: 0.88,
          surfaceStrokes: 56,
          edgeStrokes: 40,
          grainAlpha: 0.16,
          showRim: true,
          highlightColor: '#FFFFFF'
        });

        // 陶瓷罐左上侧温润弧形高光带
        drawGouacheStroke(ctx, [
          { x: 35, y: 66 },
          { x: 40, y: 46 },
          { x: 52, y: 35 }
        ], {
          color: '#FFFFFF',
          alpha: 0.68,
          maxWeight: 5.2,
          minWeight: 1.4,
          seed: seed + 321,
          boil,
          dryFeibai: true
        });

        // 肚子下方的奶油金边装饰圆肚子与小四叶星纹
        const bellyPatch = sampleSuperEllipse(70, 99, 23, 16, 22, 2.0);
        fillGouache(ctx, bellyPatch, cream, { seed: seed + 333, boil, alpha: 0.78 });
        for (let k = 0; k < 4; k++) {
          const a = (k / 4) * Math.PI * 2;
          drawShortGouacheDab(
            ctx,
            70 + Math.cos(a) * 5.5,
            99 + Math.sin(a) * 5.5,
            8.5,
            4.2,
            a,
            gold[1],
            0.88,
            { seed: seed + 350 + k * 7, boil }
          );
        }

        // 腮红
        drawBlush(ctx, 41, 66, 8.5, 5.0, { angle: -0.1, seed: seed + 371, boil, alpha: 0.55 });
        drawBlush(ctx, 99, 66, 8.5, 5.0, { angle: 0.1, seed: seed + 379, boil, alpha: 0.55 });

        // 笑盈盈的大眼睛（带弯弯的笑眼眉）
        drawToyEye(ctx, 49, 54, 8.4, {
          seed: seed + 389,
          boil,
          gazeX: 0.08,
          gazeY: -0.10,
          starScale: 1.15,
          lidColor: piggy[3],
          browColor: piggy[3],
          browTilt: -0.12
        });
        drawToyEye(ctx, 91, 54, 8.4, {
          seed: seed + 397,
          boil,
          gazeX: -0.08,
          gazeY: -0.10,
          starScale: 1.15,
          lidColor: piggy[3],
          browColor: piggy[3],
          browTilt: 0.12
        });
        break;
      }

      case 'slot': {
        // 头顶背上的存钱罐投币口（深色长槽 + 金色镶边，一眼认出是存钱罐！）
        const rimPts = sampleSuperEllipse(70, 32, 18.5, 5.8, 20, 2.2);
        fillGouache(ctx, rimPts, gold, { seed: seed + 401, boil });
        const holePts = sampleSuperEllipse(70, 32, 14.5, 3.2, 18, 2.2);
        fillGouache(ctx, holePts, ['#2A0B16', '#120A0B', '#120A0B', '#120A0B'], { seed: seed + 409, boil });
        break;
      }

      case 'coin_peek': {
        // 投币口里露出一半的闪亮金硬币（出手时往上弹出）
        const coinPts = sampleSuperEllipse(70, 25, 11.5, 11.5, 24, 2.0);
        paintGouacheBody(ctx, coinPts, gold, {
          seed: seed + 451,
          boil,
          surfaceStrokes: 24,
          edgeStrokes: 18,
          noGrain: true,
          highlightColor: '#FFFFFF'
        });
        drawShortGouacheDab(ctx, 70, 24, 6.5, 2.8, Math.PI * 0.5, gold[3], 0.78, {
          seed: seed + 463,
          boil
        });
        break;
      }

      case 'snout': {
        // 粉嘟嘟的椭圆翘猪鼻 + 两个深色鼻孔 + 下方微笑小嘴
        const snoutPts = sampleSuperEllipse(70, 66, 14.5, 10.5, 24, 2.05);
        paintGouacheBody(ctx, snoutPts, [ '#FFF0F5', piggy[0], piggy[1], piggy[2] ], {
          seed: seed + 501,
          boil,
          surfaceStrokes: 24,
          edgeStrokes: 18,
          noGrain: true,
          highlightColor: '#FFFFFF'
        });

        ctx.fillStyle = PALETTE.mouth[1];
        ctx.beginPath();
        ctx.ellipse(65, 66, 2.4, 3.6, -0.1, 0, Math.PI * 2);
        ctx.ellipse(75, 66, 2.4, 3.6, 0.1, 0, Math.PI * 2);
        ctx.fill();

        // 猪鼻下方的开心小嘴弧
        drawGouacheStroke(ctx, [
          { x: 63, y: 78 },
          { x: 70, y: 81.5 },
          { x: 77, y: 78 }
        ], {
          color: PALETTE.mouth[1],
          alpha: 0.88,
          maxWeight: 2.1,
          minWeight: 0.9,
          seed: seed + 521,
          boil
        });
        break;
      }

      case 'arm_l':
      case 'arm_r': {
        const isL = id === 'arm_l';
        const dir = isL ? -1 : 1;
        const cx = isL ? 30 : 110;
        const cy = 86;
        const pts = sampleSuperEllipse(cx, cy, 9.0, 8.0, 20, 2.0);
        paintGouacheBody(ctx, pts, piggy, {
          seed: seed + (isL ? 601 : 619),
          boil,
          surfaceStrokes: 20,
          edgeStrokes: 14,
          grainAlpha: 0.16,
          showRim: !isL
        });
        drawShortGouacheDab(ctx, cx + dir * 5, cy + 2, 5.5, 3.2, dir * 0.3, gold[1], 0.82, {
          seed: seed + 631,
          boil
        });
        break;
      }

      case 'blink': {
        for (const ex of [49, 91]) {
          const lidPts = sampleSuperEllipse(ex, 54, 8.8, 8.8, 18, 2.0);
          fillGouache(ctx, lidPts, piggy, { seed: seed + ex, boil });
          drawGouacheStroke(ctx, [
            { x: ex - 8, y: 54 },
            { x: ex, y: 58 },
            { x: ex + 8, y: 54 }
          ], {
            color: PALETTE.faceInk,
            alpha: 0.9,
            maxWeight: 2.4,
            minWeight: 0.9,
            seed: seed + ex + 19,
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
            { t: 450,  y: -1.4, sx: 1.025, sy: 0.98, ease: 'smooth' },
            { t: 900,  y: -2.4, sx: 0.985, sy: 1.02, ease: 'smooth' },
            { t: 1350, y: -0.8, sx: 1.02, sy: 0.985, ease: 'smooth' },
            { t: 1800, y: 0,    sx: 1.00, sy: 1.00 }
          ],
          coin_peek: [
            { t: 0,    y: 0,    rot: 0,    ease: 'smooth' },
            { t: 600,  y: -2.2, rot: -4.0, ease: 'smooth' },
            { t: 1200, y: 0.5,  rot: 4.0,  ease: 'smooth' },
            { t: 1800, y: 0,    rot: 0 }
          ],
          ear_l: [
            { t: 0,    rot: 0,  ease: 'smooth' },
            { t: 600,  rot: -8, ease: 'smooth' },
            { t: 1200, rot: 4,  ease: 'smooth' },
            { t: 1800, rot: 0 }
          ],
          ear_r: [
            { t: 0,    rot: 0,  ease: 'smooth' },
            { t: 600,  rot: 8,  ease: 'smooth' },
            { t: 1200, rot: -4, ease: 'smooth' },
            { t: 1800, rot: 0 }
          ],
          snout: [
            { t: 0,    y: 0,    sx: 1.00, sy: 1.00, ease: 'smooth' },
            { t: 900,  y: -1.5, sx: 1.06, sy: 1.04, ease: 'smooth' },
            { t: 1800, y: 0,    sx: 1.00, sy: 1.00 }
          ],
          tail: [
            { t: 0,    rot: 0,   ease: 'smooth' },
            { t: 450,  rot: 14,  ease: 'smooth' },
            { t: 900,  rot: -10, ease: 'smooth' },
            { t: 1350, rot: 12,  ease: 'smooth' },
            { t: 1800, rot: 0 }
          ],
          blink: [
            { t: 0,    hidden: true },
            { t: 1300, hidden: false },
            { t: 1440, hidden: true },
            { t: 1800, hidden: true }
          ]
        }
      },

      // attack（500ms，release=200ms）：蹲抖一下，从背上投币口向上弹出硬币
      attack: {
        dur: 500,
        loop: false,
        tracks: {
          body: [
            { t: 0,   y: 0,    sx: 1.00, sy: 1.00, ease: 'out' },
            { t: 120, y: 5.0,  sx: 1.12, sy: 0.88, ease: 'in' },
            { t: 200, y: -9.0, sx: 0.91, sy: 1.12, ease: 'out' },
            { t: 360, y: 2.0,  sx: 1.04, sy: 0.96, ease: 'smooth' },
            { t: 500, y: 0,    sx: 1.00, sy: 1.00 }
          ],
          coin_peek: [
            { t: 0,   y: 0,     sx: 1.00, sy: 1.00, ease: 'out' },
            { t: 120, y: 4.5,   sx: 1.08, sy: 0.90, ease: 'in' },
            { t: 200, y: -14.0, sx: 1.18, sy: 1.18, ease: 'out' },
            { t: 360, y: -2.0,  sx: 1.00, sy: 1.00, ease: 'smooth' },
            { t: 500, y: 0,     sx: 1.00, sy: 1.00 }
          ],
          arm_l: [
            { t: 0,   rot: 0,   ease: 'out' },
            { t: 120, rot: -20, ease: 'in' },
            { t: 200, rot: 32,  ease: 'smooth' },
            { t: 500, rot: 0 }
          ],
          arm_r: [
            { t: 0,   rot: 0,   ease: 'out' },
            { t: 120, rot: 20,  ease: 'in' },
            { t: 200, rot: -32, ease: 'smooth' },
            { t: 500, rot: 0 }
          ]
        }
      },

      // skill（1000ms，release=500ms）：左右欢快摇晃身体“叮当”响，第 500ms 弹出大金币
      skill: {
        dur: 1000,
        loop: false,
        tracks: {
          body: [
            { t: 0,    x: 0,    y: 0,     rot: 0,     sx: 1.00, sy: 1.00, ease: 'out' },
            { t: 120,  x: -6.5, y: -2.0,  rot: -9.5,  sx: 1.04, sy: 0.97, ease: 'linear' },
            { t: 240,  x: 6.5,  y: -3.0,  rot: 9.5,   sx: 1.04, sy: 0.97, ease: 'linear' },
            { t: 360,  x: -7.0, y: 4.5,   rot: -10.0, sx: 1.14, sy: 0.88, ease: 'in' },
            { t: 500,  x: 0,    y: -12.0, rot: 0,     sx: 0.90, sy: 1.16, ease: 'out' },
            { t: 680,  x: 4.5,  y: 2.5,   rot: 5.5,   sx: 1.06, sy: 0.95, ease: 'smooth' },
            { t: 840,  x: -3.0, y: -1.0,  rot: -3.5,  sx: 1.02, sy: 0.99, ease: 'smooth' },
            { t: 1000, x: 0,    y: 0,     rot: 0,     sx: 1.00, sy: 1.00 }
          ],
          coin_peek: [
            { t: 0,    y: 0,     rot: 0,   sx: 1.00, sy: 1.00, ease: 'out' },
            { t: 120,  y: -5.0,  rot: -16, sx: 1.08, sy: 1.08, ease: 'linear' },
            { t: 240,  y: -6.0,  rot: 16,  sx: 1.08, sy: 1.08, ease: 'linear' },
            { t: 360,  y: 3.0,   rot: -12, sx: 1.10, sy: 0.92, ease: 'in' },
            { t: 500,  y: -16.0, rot: 0,   sx: 1.28, sy: 1.28, ease: 'out' },
            { t: 1000, y: 0,     rot: 0,   sx: 1.00, sy: 1.00 }
          ],
          ear_l: [
            { t: 0,    rot: 0,   ease: 'linear' },
            { t: 150,  rot: -22, ease: 'linear' },
            { t: 300,  rot: 18,  ease: 'linear' },
            { t: 500,  rot: 28,  ease: 'smooth' },
            { t: 1000, rot: 0 }
          ],
          ear_r: [
            { t: 0,    rot: 0,   ease: 'linear' },
            { t: 150,  rot: -18, ease: 'linear' },
            { t: 300,  rot: 22,  ease: 'linear' },
            { t: 500,  rot: -28, ease: 'smooth' },
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
            { t: 250, y: -13.5, sx: 0.92, sy: 1.10, ease: 'in' },
            { t: 430, y: 3.5,   sx: 1.10, sy: 0.90, ease: 'out' },
            { t: 600, y: -14.5, sx: 0.92, sy: 1.10, ease: 'in' },
            { t: 770, y: 2.5,   sx: 1.05, sy: 0.95, ease: 'smooth' },
            { t: 900, y: 0,     sx: 1.00, sy: 1.00 }
          ],
          coin_peek: [
            { t: 0,   y: 0,     ease: 'out' },
            { t: 260, y: -10.0, ease: 'in' },
            { t: 440, y: 2.0,   ease: 'out' },
            { t: 620, y: -11.0, ease: 'in' },
            { t: 900, y: 0 }
          ]
        }
      },

      startled: {
        dur: 500,
        loop: false,
        tracks: {
          body: [
            { t: 0,   x: 0,    y: 0,    sx: 1.00, sy: 1.00, ease: 'out' },
            { t: 90,  x: 0,    y: -9.0, sx: 0.88, sy: 1.16, ease: 'in' },
            { t: 170, x: -4.5, y: 5.5,  sx: 1.15, sy: 0.86, ease: 'linear' },
            { t: 240, x: 4.5,  y: 5.5,  sx: 1.14, sy: 0.87, ease: 'linear' },
            { t: 330, x: -2.5, y: 3.5,  sx: 1.06, sy: 0.94, ease: 'smooth' },
            { t: 500, x: 0,    y: 0,    sx: 1.00, sy: 1.00 }
          ],
          coin_peek: [
            { t: 0,   y: 0,     ease: 'out' },
            { t: 100, y: -12.0, ease: 'in' },
            { t: 260, y: 3.0,   ease: 'smooth' },
            { t: 500, y: 0 }
          ]
        }
      }
    }
  }
};
