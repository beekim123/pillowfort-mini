// 《枕头堡》P1 共用画笔库：水粉颗粒（夜色）+ 水粉短笔触叠画与沸腾系统（第 2 批颗粒减量升级版）
// 严格遵守《美术技术方案.md》3.3 硬规则与《美术文档-P1.md》1.5 节颗粒规范：
// 1. 仅使用 Canvas2D 标准接口，100% 确定性，无外部依赖；
// 2. 颗粒只在暗面和边缘（背光那一半 + 宽 ≤ 短边 12% 的外圈，受光面、脸、高光、白毛受光面一颗都不要）；
// 3. 同色系深一档（白毛用 wool 第 3 档再淡一点），不用统一的深蓝灰，不撒亮点；
// 4. 灰度亮度差 ≤ 6%，暗面内点面积 ≤ 1/10，点直径 0.8–1.6 设计像素，只铺一层（贴图 clip + drawImage，不叠斑点）；
// 5. 导出 setGrain(k) / getGrain() 总旋钮（0–1，透明度和数量均乘 k，0 = 完全没有颗粒）；
// 6. 沸腾主要靠水粉短笔触边和轮廓起伏变化。

import { PALETTE } from '../palette.js';

export { PALETTE };

// ─── 0. 颗粒强度总旋钮 (0..1) ───
let GRAIN_STRENGTH = 1.0;

export function setGrain(k) {
  const v = Number(k);
  GRAIN_STRENGTH = Number.isFinite(v) ? clamp(v, 0, 1) : 1.0;
}

export function getGrain() {
  return GRAIN_STRENGTH;
}

// ─── 1. 确定性哈希、伪随机与噪声 ───
export function hash32(x, y = 0, z = 0) {
  let h = (Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263) + Math.imul(z | 0, 2147483647)) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

export function createRng(seed = 1, boil = 0) {
  let s = (Math.imul((seed | 0) + 1013, 747796405) + Math.imul((boil | 0) * 19937, 2891336453) + 1013904223) | 0;
  return function rand() {
    s = (s + 0x6D2B79F5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function lerp(a, b, t) {
  return a + (b - a) * t;
}

export function clamp(v, lo, hi) {
  return v < lo ? lo : v > hi ? hi : v;
}

export function smoothstep(t) {
  const u = clamp(t, 0, 1);
  return u * u * (3 - 2 * u);
}

export function noise2D(x, y, seed = 1) {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const xf = x - xi;
  const yf = y - yi;
  const u = xf * xf * (3 - 2 * xf);
  const v = yf * yf * (3 - 2 * yf);
  const s = (seed | 0) + 1337;
  const n00 = hash32(xi, yi, s);
  const n10 = hash32(xi + 1, yi, s);
  const n01 = hash32(xi, yi + 1, s);
  const n11 = hash32(xi + 1, yi + 1, s);
  return lerp(lerp(n00, n10, u), lerp(n01, n11, u), v);
}

export function fbm2D(x, y, seed = 1) {
  return 0.65 * noise2D(x, y, seed) + 0.35 * noise2D(x * 2.17 + 19.3, y * 2.17 + 37.1, seed + 97);
}

// ─── 2. 颜色解析与同色系颗粒色计算 ───
const HEX_CACHE = {};
export function hexToRgb(hex) {
  if (!hex || typeof hex !== 'string') return { r: 255, g: 255, b: 255 };
  if (HEX_CACHE[hex]) return HEX_CACHE[hex];
  let c = hex.charAt(0) === '#' ? hex.slice(1) : hex;
  if (c.length === 3) c = c[0] + c[0] + c[1] + c[1] + c[2] + c[2];
  const num = parseInt(c, 16) || 0;
  const rgb = { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
  HEX_CACHE[hex] = rgb;
  return rgb;
}

export function rgba(hex, alpha = 1) {
  const { r, g, b } = hexToRgb(hex);
  const a = clamp(alpha, 0, 1);
  return `rgba(${r},${g},${b},${a.toFixed(3)})`;
}

export function mixHex(hex1, hex2, t = 0.5) {
  const c1 = hexToRgb(hex1);
  const c2 = hexToRgb(hex2);
  const u = clamp(t, 0, 1);
  const r = Math.round(lerp(c1.r, c2.r, u));
  const g = Math.round(lerp(c1.g, c2.g, u));
  const b = Math.round(lerp(c1.b, c2.b, u));
  return '#' + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1);
}

export function getRamp(nameOrArray) {
  if (Array.isArray(nameOrArray)) return nameOrArray;
  return PALETTE.ramps[nameOrArray] || PALETTE.ramps.moss;
}

/**
 * 1.5 节第 2 条：计算同色系深一档的颗粒颜色（绝不用统一的深蓝灰 #121733，不撒亮点）
 * - 白毛 (wool) 用第 3 档 (#D6D2DE) 再淡一点；
 * - 其余色族用暗面底色在自身色族里深一档 (ramp[2] -> ramp[3])。
 */
export function resolveSameFamilyGrainColor(ramp) {
  if (!ramp || !ramp.length) return '#556070';
  const c0 = (ramp[0] || '').toUpperCase();
  // 白毛 wool: ['#FFFDF6', '#F2EEE4', '#D6D2DE', '#ABA7BE'] -> 用第 3 档再淡一点
  if (c0 === '#FFFDF6') {
    return mixHex(ramp[1] || '#F2EEE4', ramp[2] || '#D6D2DE', 0.65);
  }
  // 奶油色 cream -> 用第 3 档柔和暖驼色
  if (c0 === '#FFF6DC') {
    return mixHex(ramp[1] || '#F6E2A4', ramp[2] || '#DFC27A', 0.62);
  }
  const s2 = ramp[2] || ramp[1] || ramp[0];
  const s3 = ramp[3] || s2;
  return mixHex(s2, s3, 0.72);
}

// ─── 3. 离屏画布工厂与单层同色系颗粒贴图池（1.5 节：只铺一层、不撒亮点、直径 0.8–1.6px、面积 ≤ 1/10） ───
export function createOffscreenCanvas(w, h) {
  if (typeof wx !== 'undefined' && typeof wx.createCanvas === 'function') {
    const c = wx.createCanvas();
    c.width = w;
    c.height = h;
    return c;
  }
  if (typeof document !== 'undefined' && typeof document.createElement === 'function') {
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    return c;
  }
  if (typeof OffscreenCanvas !== 'undefined') {
    return new OffscreenCanvas(w, h);
  }
  return null;
}

const GRAIN_TILES = new Map();

/**
 * 生成或获取 96×96 同色系水粉颗粒贴图：
 * - 点的直径严格在 0.8 ~ 1.6 设计像素（半径 0.40 ~ 0.80 px）；
 * - 点的数量随 GRAIN_STRENGTH 缩放，k=1 时 190 颗点占 96×96 面积仅约 2.3%（远低于 ≤ 1/10 上限）；
 * - 只用同色系深一档颜色，不撒任何亮点，灰度下亮度差 ≤ 5%（低于 6% 上限）。
 */
export function getGrainTile(variant = 0, colorHex = '#485066', countScale = 1.0) {
  const effK = clamp(GRAIN_STRENGTH * countScale, 0, 1);
  if (effK <= 0.005) return null;
  const kBucket = Math.max(1, Math.round(effK * 20));
  const vIdx = ((variant | 0) % 6 + 6) % 6;
  const colKey = (colorHex && colorHex.startsWith('#')) ? colorHex : PALETTE.ramps.night[2];
  const key = `${colKey}_${vIdx}_${kBucket}`;
  if (GRAIN_TILES.has(key)) return GRAIN_TILES.get(key);

  const size = 96;
  const canvas = createOffscreenCanvas(size, size);
  if (!canvas) return null;
  const gctx = canvas.getContext('2d');
  const rng = createRng(7001 + vIdx * 313, vIdx);

  // k=1 时 185 颗细颗粒（平均半径 0.6px，单点面积 ~1.13px²，总面积占比 ~2.2% <= 10%）
  const dotCount = Math.round(185 * (kBucket / 20));
  for (let i = 0; i < dotCount; i++) {
    const x = rng() * size;
    const y = rng() * size;
    // 直径 0.8–1.6 设计像素 => 半径 r = 0.40..0.80
    const r = 0.40 + rng() * 0.40;
    const a = 0.24 + rng() * 0.16;
    gctx.fillStyle = rgba(colKey, a);

    const wrapX = x > size - 2 ? [x, x - size] : x < 2 ? [x, x + size] : [x];
    const wrapY = y > size - 2 ? [y, y - size] : y < 2 ? [y, y + size] : [y];
    for (const wx of wrapX) {
      for (const wy of wrapY) {
        gctx.beginPath();
        gctx.arc(wx, wy, r, 0, Math.PI * 2);
        gctx.fill();
      }
    }
  }

  GRAIN_TILES.set(key, canvas);
  return canvas;
}

// ─── 4. 几何采样、样条细分与法线计算 ───
export function sampleSuperEllipse(cx, cy, rx, ry, nPts = 36, power = 2.0, asym = null) {
  const pts = [];
  for (let i = 0; i < nPts; i++) {
    const a = (i / nPts) * Math.PI * 2;
    const ca = Math.cos(a);
    const sa = Math.sin(a);
    let x = Math.sign(ca) * Math.pow(Math.abs(ca), 2 / power) * rx;
    let y = Math.sign(sa) * Math.pow(Math.abs(sa), 2 / power) * ry;
    if (asym) {
      const mod = asym(a, ca, sa);
      if (mod) {
        if (mod.x !== undefined) x = mod.x;
        else x = x * (mod.sx !== undefined ? mod.sx : 1) + (mod.dx || 0);
        if (mod.y !== undefined) y = mod.y;
        else y = y * (mod.sy !== undefined ? mod.sy : 1) + (mod.dy || 0);
      }
    }
    pts.push({ x: cx + x, y: cy + y, a });
  }
  return pts;
}

export function subdivideSpline(ctrlPts, closed = true, subdivisions = 4) {
  const n = ctrlPts.length;
  if (n < 2) return ctrlPts.slice();
  const out = [];
  const count = closed ? n : n - 1;
  for (let i = 0; i < count; i++) {
    const p0 = ctrlPts[(i - 1 + n) % n];
    const p1 = ctrlPts[i];
    const p2 = ctrlPts[(i + 1) % n];
    const p3 = ctrlPts[(i + 2) % n];
    const c0 = (!closed && i === 0) ? p1 : p0;
    const c3 = (!closed && i === count - 1) ? p2 : p3;

    for (let j = 0; j < subdivisions; j++) {
      const t = j / subdivisions;
      const t2 = t * t;
      const t3 = t2 * t;
      const x = 0.5 * (
        (2 * p1.x) +
        (-c0.x + p2.x) * t +
        (2 * c0.x - 5 * p1.x + 4 * p2.x - c3.x) * t2 +
        (-c0.x + 3 * p1.x - 3 * p2.x + c3.x) * t3
      );
      const y = 0.5 * (
        (2 * p1.y) +
        (-c0.y + p2.y) * t +
        (2 * c0.y - 5 * p1.y + 4 * p2.y - c3.y) * t2 +
        (-c0.y + 3 * p1.y - 3 * p2.y + c3.y) * t3
      );
      const w = (p1.w !== undefined && p2.w !== undefined) ? lerp(p1.w, p2.w, t) : 1.0;
      out.push({ x, y, w });
    }
  }
  if (!closed) {
    const last = ctrlPts[n - 1];
    out.push({ x: last.x, y: last.y, w: last.w !== undefined ? last.w : 1.0 });
  }
  return out;
}

export function computeNormals(pts, closed = true) {
  const n = pts.length;
  if (n === 0) return [];
  let cx = 0, cy = 0;
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (let i = 0; i < n; i++) {
    const p = pts[i];
    cx += p.x;
    cy += p.y;
    if (p.x < minX) minX = p.x;
    if (p.x > maxX) maxX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.y > maxY) maxY = p.y;
  }
  cx /= n;
  cy /= n;

  const res = new Array(n);
  for (let i = 0; i < n; i++) {
    const prev = closed ? pts[(i - 1 + n) % n] : pts[Math.max(0, i - 1)];
    const next = closed ? pts[(i + 1) % n] : pts[Math.min(n - 1, i + 1)];
    let tx = next.x - prev.x;
    let ty = next.y - prev.y;
    const len = Math.hypot(tx, ty) || 1;
    tx /= len;
    ty /= len;
    let nx = ty;
    let ny = -tx;
    if (closed) {
      const vx = pts[i].x - cx;
      const vy = pts[i].y - cy;
      if (nx * vx + ny * vy < 0) {
        nx = -nx;
        ny = -ny;
      }
    }
    res[i] = {
      x: pts[i].x,
      y: pts[i].y,
      w: pts[i].w !== undefined ? pts[i].w : 1.0,
      tx, ty, nx, ny,
      angle: closed ? Math.atan2(pts[i].y - cy, pts[i].x - cx) : Math.atan2(ny, nx)
    };
  }
  res.bounds = {
    cx, cy, minX, maxX, minY, maxY,
    w: Math.max(4, maxX - minX),
    h: Math.max(4, maxY - minY),
    rx: Math.max(2, (maxX - minX) * 0.5),
    ry: Math.max(2, (maxY - minY) * 0.5)
  };
  return res;
}

export function extractContiguousArc(norms, startDeg, endDeg, inwardOffsetX = 0, inwardOffsetY = 0) {
  const n = norms.length;
  if (n < 3) return [];
  const span = ((endDeg - startDeg) % 360 + 360) % 360;

  function inArc(angRad) {
    const deg = (angRad * 180) / Math.PI;
    const rel = ((deg - startDeg) % 360 + 360) % 360;
    return rel <= span;
  }

  let firstOutside = -1;
  for (let i = 0; i < n; i++) {
    if (!inArc(norms[i].angle)) {
      firstOutside = i;
      break;
    }
  }
  if (firstOutside === -1) {
    return norms.map(p => ({
      x: p.x - p.nx * inwardOffsetX,
      y: p.y - p.ny * inwardOffsetY,
      nx: p.nx, ny: p.ny, tx: p.tx, ty: p.ty, angle: p.angle
    }));
  }

  let bestRun = [];
  let curRun = [];
  for (let k = 0; k < n; k++) {
    const idx = (firstOutside + k) % n;
    const p = norms[idx];
    if (inArc(p.angle)) {
      curRun.push({
        x: p.x - p.nx * inwardOffsetX,
        y: p.y - p.ny * inwardOffsetY,
        nx: p.nx, ny: p.ny, tx: p.tx, ty: p.ty, angle: p.angle
      });
    } else if (curRun.length > 0) {
      if (curRun.length > bestRun.length) bestRun = curRun;
      curRun = [];
    }
  }
  if (curRun.length > bestRun.length) bestRun = curRun;
  return bestRun;
}

// ─── 5. 水粉短笔触与干笔飞白画笔（沸腾主要靠笔触边和轮廓在变） ───

export function drawShortGouacheDab(ctx, x, y, len, width, angle, color, alpha = 0.45, opt = {}) {
  const {
    seed = 1,
    boil = 0,
    boilAmp = 0.95,
    curve = 0,
    taperStart = 0.25,
    taperEnd = 0.35,
    drySplit = false
  } = opt;

  const bShiftX = (hash32(seed, boil * 17 + 1, 11) - 0.5) * 2.2 * boilAmp;
  const bShiftY = (hash32(seed, boil * 17 + 2, 13) - 0.5) * 2.2 * boilAmp;
  const bAng = angle + (hash32(seed, boil * 17 + 3, 17) - 0.5) * 0.16 * boilAmp;

  const ca = Math.cos(bAng);
  const sa = Math.sin(bAng);
  const nx = -sa;
  const ny = ca;

  const cx = x + bShiftX;
  const cy = y + bShiftY;
  const halfL = len * 0.5;
  const hw = width * 0.5 * (0.84 + 0.32 * hash32(seed, boil + 5, 19));
  const midCurve = curve + (hash32(seed, boil + 7, 23) - 0.5) * width * 0.38;

  const x0 = cx - ca * halfL;
  const y0 = cy - sa * halfL;
  const x1 = cx + ca * halfL;
  const y1 = cy + sa * halfL;
  const xm = cx + nx * midCurve;
  const ym = cy + ny * midCurve;

  const wStart = hw * taperStart;
  const wMidL = hw * (0.9 + 0.26 * hash32(seed, 31, boil));
  const wMidR = hw * (0.85 + 0.26 * hash32(seed, 37, boil));
  const wEnd = hw * taperEnd;

  ctx.fillStyle = alpha < 0.999 ? rgba(color, alpha) : color;
  ctx.beginPath();
  ctx.moveTo(x0 + nx * wStart, y0 + ny * wStart);
  ctx.lineTo(xm + nx * wMidL, ym + ny * wMidL);
  ctx.lineTo(x1 + nx * wEnd, y1 + ny * wEnd);
  ctx.lineTo(xm - nx * wMidR, ym - ny * wMidR);
  ctx.fill();

  if (drySplit) {
    const side = hash32(seed, 41, boil) > 0.5 ? 1 : -1;
    const offN = side * hw * (0.75 + 0.3 * hash32(seed, 43, boil));
    const sx0 = xm + nx * offN - ca * halfL * 0.2;
    const sy0 = ym + ny * offN - sa * halfL * 0.2;
    const sx1 = x1 + ca * (len * 0.18) + nx * offN * 1.1;
    const sy1 = y1 + sa * (len * 0.18) + ny * offN * 1.1;
    const sw = Math.max(0.45, hw * 0.32);

    ctx.beginPath();
    ctx.moveTo(sx0, sy0);
    ctx.lineTo((sx0 + sx1) * 0.5 + nx * sw, (sy0 + sy1) * 0.5 + ny * sw);
    ctx.lineTo(sx1, sy1);
    ctx.fill();
  }
}

export function drawGouacheStroke(ctx, rawPts, options = {}) {
  if (!rawPts || rawPts.length < 2) return;
  const {
    color = PALETTE.rim,
    alpha = 0.65,
    maxWeight = 5.0,
    minWeight = 1.0,
    seed = 101,
    boil = 0,
    boilAmp = 0.9,
    taperStart = 0.24,
    taperEnd = 0.28,
    roughness = 0.35,
    dryFeibai = false
  } = options;

  const norms = computeNormals(rawPts, false);
  const n = norms.length;
  const leftPts = [];
  const rightPts = [];

  for (let i = 0; i < n; i++) {
    const s = i / Math.max(1, n - 1);
    const p = norms[i];

    let env = 1.0;
    if (s < taperStart) {
      env = 0.15 + 0.85 * Math.pow(s / Math.max(0.01, taperStart), 0.75);
    } else if (s > 1 - taperEnd) {
      env = 0.10 + 0.90 * Math.pow(Math.max(0, (1 - s) / Math.max(0.01, taperEnd)), 0.82);
    } else {
      env = 0.80 + 0.20 * Math.sin(((s - taperStart) / Math.max(0.01, 1 - taperStart - taperEnd)) * Math.PI);
    }

    const nVal = fbm2D(s * 5.0 + seed * 0.13, boil * 0.83, seed);
    const boilN = boilAmp > 0 ? (noise2D(s * 6.2 + 11.3, boil * 1.41 + seed * 0.09, seed + 37) - 0.5) * 2.2 * boilAmp : 0;

    const wNoise = 1.0 + (nVal - 0.5) * 2.0 * roughness;
    const halfW = Math.max(minWeight * 0.3, (minWeight + (maxWeight - minWeight) * env * wNoise * (p.w || 1)) * 0.5);

    const cx = p.x + p.nx * boilN;
    const cy = p.y + p.ny * boilN;

    leftPts.push({ x: cx + p.nx * halfW, y: cy + p.ny * halfW });
    rightPts.push({ x: cx - p.nx * halfW, y: cy - p.ny * halfW });
  }

  ctx.fillStyle = alpha < 0.999 ? rgba(color, alpha) : color;
  ctx.beginPath();
  ctx.moveTo(leftPts[0].x, leftPts[0].y);
  for (let i = 1; i < n; i++) ctx.lineTo(leftPts[i].x, leftPts[i].y);
  for (let i = n - 1; i >= 0; i--) ctx.lineTo(rightPts[i].x, rightPts[i].y);
  ctx.closePath();
  ctx.fill();

  if (dryFeibai && n >= 3) {
    ctx.beginPath();
    const mid = Math.floor(n * 0.35);
    ctx.moveTo(leftPts[mid].x, leftPts[mid].y);
    for (let i = mid + 1; i < n; i++) {
      const p = norms[i];
      ctx.lineTo(leftPts[i].x + p.nx * maxWeight * 0.22, leftPts[i].y + p.ny * maxWeight * 0.22);
    }
    for (let i = n - 1; i >= mid; i--) {
      ctx.lineTo(leftPts[i].x, leftPts[i].y);
    }
    ctx.closePath();
    ctx.fill();
  }
}

// ─── 6. 底色层 fillGouache、单层暗面颗粒 applyGrain 与 paintGouacheBody ───

export function fillGouache(ctx, pts, rampOrName, opt = {}) {
  const ramp = getRamp(rampOrName);
  const {
    seed = 1,
    boil = 0,
    boilAmp = 0.88,
    lightPos = PALETTE.lightOrigin || [0.38, 0.28],
    alpha = 1.0
  } = opt;

  const norms = pts.bounds ? pts : computeNormals(pts, true);
  const n = norms.length;
  if (n < 3) return norms;
  const B = norms.bounds;

  // 随 boil 产生明显的手绘轮廓呼吸起伏（沸腾不靠颗粒，主要靠轮廓边和笔触边变化）
  const bPts = new Array(n);
  for (let i = 0; i < n; i++) {
    const p = norms[i];
    const u = i / n;
    const nWave = fbm2D(Math.cos(u * Math.PI * 2) * 2.2 + 3.7, Math.sin(u * Math.PI * 2) * 2.2 + boil * 1.15, seed + 19);
    const disp = (nWave - 0.48) * 2.6 * boilAmp;
    bPts[i] = {
      x: p.x + p.nx * disp,
      y: p.y + p.ny * disp,
      nx: p.nx, ny: p.ny, tx: p.tx, ty: p.ty, angle: p.angle
    };
  }
  bPts.bounds = B;

  const gx = B.minX + B.w * lightPos[0];
  const gy = B.minY + B.h * lightPos[1];
  const gr = Math.max(B.w, B.h) * 0.92;

  const grad = ctx.createRadialGradient(gx, gy, gr * 0.04, B.cx, B.cy, gr);
  grad.addColorStop(0.0, alpha < 1 ? rgba(ramp[0], alpha) : ramp[0]);
  grad.addColorStop(0.46, alpha < 1 ? rgba(ramp[1], alpha) : ramp[1]);
  grad.addColorStop(0.82, alpha < 1 ? rgba(ramp[2], alpha) : ramp[2]);
  grad.addColorStop(1.0, alpha < 1 ? rgba(ramp[3] || ramp[2], alpha) : (ramp[3] || ramp[2]));

  ctx.beginPath();
  ctx.moveTo(bPts[0].x, bPts[0].y);
  for (let i = 1; i < n; i++) ctx.lineTo(bPts[i].x, bPts[i].y);
  ctx.closePath();
  ctx.fillStyle = grad;
  ctx.fill();

  return bPts;
}

/**
 * 严格按《美术文档-P1.md》1.5 节重做的颗粒函数：
 * 1) 只在暗面和边缘：通过新月形裁剪带将颗粒严格限制在背光侧（右下）及宽 ≤ 短边 12% 的外圈，受光面一颗都没有；
 * 2) 同色系深一档：自动取当前 ramp 深一档颜色（白毛用 wool 第 3 档再淡一点），不用深蓝灰，不撒亮点；
 * 3) 只铺一层：仅用预生成颗粒纹理 clip + drawImage，彻底去除第二层斑点；
 * 4) 灰度下亮度差 ≤ 6%，暗面内颗粒面积 ≤ 1/10；
 * 5) 受 setGrain(k) 总旋钮控制（透明度和点数量都乘 k，k=0 时完全不画）。
 */
export function applyGrain(ctx, norms, rampOrName, opt = {}) {
  if (GRAIN_STRENGTH <= 0.001 || opt.noGrain) return;
  const ramp = getRamp(rampOrName);
  const {
    seed = 1,
    boil = 0,
    grainAlpha = 0.26
  } = opt;
  if (grainAlpha <= 0.001) return;

  const pts = norms.bounds ? norms : computeNormals(norms, true);
  const B = pts.bounds;
  const shortSide = Math.min(B.w, B.h);
  if (shortSide < 6) return;

  // 提取背光侧弧段（-38° ~ 138°），完全避开左上受光面 (-180° ~ -38°)
  const shadowArc = extractContiguousArc(pts, -38, 138, 0, 0);
  if (shadowArc.length < 4) return;

  const grainCol = opt.grainColor || resolveSameFamilyGrainColor(ramp);
  const isWoolOrCream = (ramp[0] || '').toUpperCase() === '#FFFDF6' || (ramp[0] || '').toUpperCase() === '#FFF6DC';
  // 浅色毛绒/奶油表面进一步克制透明度，确保 3× 下白毛与肚皮干净柔和、灰度亮度差 ≤ 4%
  const effAlpha = clamp((isWoolOrCream ? grainAlpha * 0.62 : grainAlpha) * GRAIN_STRENGTH, 0, 0.32);
  if (effAlpha <= 0.004) return;

  const tile = getGrainTile(boil + (seed & 5), grainCol, isWoolOrCream ? 0.72 : 1.0);
  if (!tile) return;

  // 构造“背光暗面 + ≤12%短边外沿”的新月形裁剪区，确保左上受光面和形体中心 0 颗粒
  const edgeBand = shortSide * 0.11; // 严格 ≤ 12% 短边
  const shadowBand = shortSide * (isWoolOrCream ? 0.22 : 0.34);

  ctx.save();
  ctx.beginPath();
  ctx.moveTo(shadowArc[0].x, shadowArc[0].y);
  for (let i = 1; i < shadowArc.length; i++) {
    ctx.lineTo(shadowArc[i].x, shadowArc[i].y);
  }
  for (let i = shadowArc.length - 1; i >= 0; i--) {
    const p = shadowArc[i];
    const u = i / Math.max(1, shadowArc.length - 1);
    const bell = Math.sin(u * Math.PI); // 两端收窄至 0，中段（右下背光处）深入暗面
    const inset = edgeBand * Math.sin(u * Math.PI) + (shadowBand - edgeBand) * (bell * bell);
    ctx.lineTo(p.x - p.nx * inset, p.y - p.ny * inset);
  }
  ctx.closePath();
  ctx.clip();

  const ox = Math.floor(hash32(seed, boil, 71) * 64);
  const oy = Math.floor(hash32(seed, boil, 73) * 64);
  ctx.globalAlpha *= effAlpha;
  for (let y = B.minY - oy; y < B.maxY; y += tile.height) {
    for (let x = B.minX - ox; x < B.maxX; x += tile.width) {
      ctx.drawImage(tile, x, y);
    }
  }
  ctx.restore();
}

export function paintGouacheBody(ctx, pts, rampOrName, opt = {}) {
  const ramp = getRamp(rampOrName);
  const {
    seed = 1,
    boil = 0,
    boilAmp = 0.95,
    lightPos = PALETTE.lightOrigin || [0.38, 0.28],
    surfaceStrokes = null,
    edgeStrokes = null,
    grainAlpha = 0.26,
    noGrain = false,
    showRim = true,
    rimColor = PALETTE.rim,
    rimAlpha = PALETTE.rimAlpha,
    rimStartDeg = -48,
    rimEndDeg = 68,
    showHighlight = true,
    highlightColor = null,
    fuzz = false,
    stitches = false,
    alpha = 1.0
  } = opt;

  const norms = pts.bounds ? pts : computeNormals(pts, true);
  if (norms.length < 3) return norms;
  const B = norms.bounds;
  const diag = Math.hypot(B.w, B.h);
  const isLightPlush = (ramp[0] || '').toUpperCase() === '#FFFDF6' || (ramp[0] || '').toUpperCase() === '#FFF6DC';

  ctx.save();
  if (alpha < 1.0) ctx.globalAlpha *= alpha;

  // ── Step 1: 柔和径向渐变底色层 (fillGouache) ──
  const bPts = fillGouache(ctx, norms, ramp, { seed, boil, boilAmp, lightPos });

  // ── Step 2: 裁剪在形体内部，沿形体走向叠几十道半透明水粉短笔 ──
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(bPts[0].x, bPts[0].y);
  for (let i = 1; i < bPts.length; i++) ctx.lineTo(bPts[i].x, bPts[i].y);
  ctx.closePath();
  ctx.clip();

  // 2a) 水粉湿画色层（对白毛/奶油浅色表面只叠暖白受光与右下柔暗，避免在亮面产生深色斑块）
  const mottleCount = diag > 50 ? 3 : 2;
  for (let m = 0; m < mottleCount; m++) {
    const mSeed = seed * 43 + m * 89 + boil * 19;
    const mAng = isLightPlush
      ? (0.1 + hash32(mSeed, 1, boil) * 0.65) * Math.PI // 浅色材质色斑仅留在右下暗部
      : hash32(mSeed, 1, boil) * Math.PI * 2;
    const mDist = 0.28 + hash32(mSeed, 2, boil) * 0.42;
    const mx = B.cx + Math.cos(mAng) * B.rx * mDist;
    const my = B.cy + Math.sin(mAng) * B.ry * mDist;
    const mrx = B.rx * (0.24 + hash32(mSeed, 3, boil) * 0.24);
    const mry = B.ry * (0.20 + hash32(mSeed, 4, boil) * 0.22);
    const isDarkSide = (Math.cos(mAng) * 0.62 + Math.sin(mAng) * 0.78) > 0.05;
    const mCol = isDarkSide ? (isLightPlush ? ramp[1] : ramp[2]) : ramp[0];

    ctx.beginPath();
    const steps = 12;
    for (let k = 0; k < steps; k++) {
      const a = (k / steps) * Math.PI * 2;
      const rMod = 0.74 + 0.48 * fbm2D(Math.cos(a) * 1.9 + m * 3.1, Math.sin(a) * 1.9 + boil * 0.7, mSeed);
      const px = mx + Math.cos(a) * mrx * rMod;
      const py = my + Math.sin(a) * mry * rMod;
      if (k === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fillStyle = rgba(mCol, isLightPlush ? 0.18 : (isDarkSide ? 0.26 : 0.22));
    ctx.fill();
  }

  // 2b) 沿形体曲率走向叠几十道水粉短笔（暗处多叠、受光处少叠，带干笔飞白）
  const nSurf = surfaceStrokes !== null
    ? surfaceStrokes
    : clamp(Math.round(diag * 0.56), 24, 68);

  for (let i = 0; i < nSurf; i++) {
    const sSeed = seed * 71 + i * 47;
    const rawU = ((i + 0.5) / nSurf + hash32(sSeed, 1, boil) * 0.08) % 1.0;
    const theta = i * 2.39996 + (hash32(sSeed, 2, boil) - 0.5) * 0.45;
    const dirX = Math.cos(theta);
    const dirY = Math.sin(theta);
    const lightDot = dirX * 0.65 + dirY * 0.76;

    let rFrac = Math.sqrt(rawU) * (0.24 + 0.74 * hash32(sSeed, 3, boil));
    if (lightDot < -0.20 && hash32(sSeed, 4, 0) < 0.48) {
      const shAng = (-0.22 + hash32(sSeed, 5, boil) * 0.90) * Math.PI;
      rFrac = 0.56 + 0.40 * hash32(sSeed, 6, boil);
      const sx = B.cx + Math.cos(shAng) * B.rx * rFrac;
      const sy = B.cy + Math.sin(shAng) * B.ry * rFrac;
      const tang = shAng + Math.PI * 0.5 + (hash32(sSeed, 7, boil) - 0.5) * 0.42;
      const sLen = clamp(diag * (0.14 + 0.14 * hash32(sSeed, 8, boil)), 4.5, 22);
      const sWid = clamp(diag * (0.045 + 0.04 * hash32(sSeed, 9, boil)), 1.6, 6.8);
      const col = isLightPlush
        ? (rFrac > 0.78 ? ramp[2] : ramp[1])
        : (rFrac > 0.74 ? (ramp[3] || ramp[2]) : ramp[2]);
      drawShortGouacheDab(ctx, sx, sy, sLen, sWid, tang, col, isLightPlush ? 0.24 : (0.30 + 0.22 * hash32(sSeed, 10, boil)), {
        seed: sSeed,
        boil,
        boilAmp: boilAmp * 0.95,
        drySplit: (i % 2 === 0)
      });
      continue;
    }

    const sx = B.cx + dirX * B.rx * rFrac;
    const sy = B.cy + dirY * B.ry * rFrac;
    const flowAng = theta + Math.PI * 0.5 + (hash32(sSeed, 11, boil) - 0.5) * 0.48;
    const sLen = clamp(diag * (0.13 + 0.14 * hash32(sSeed, 12, boil)), 4.0, 20);
    const sWid = clamp(diag * (0.04 + 0.04 * hash32(sSeed, 13, boil)), 1.5, 6.2);

    let col, sAlpha;
    if (lightDot > 0.28) {
      col = isLightPlush
        ? (rFrac > 0.78 ? ramp[2] : ramp[1])
        : ((rFrac > 0.72 && ramp[3]) ? ramp[3] : ramp[2]);
      sAlpha = isLightPlush ? 0.24 : (0.28 + 0.22 * hash32(sSeed, 14, boil));
    } else if (lightDot > -0.15) {
      col = isLightPlush ? ramp[1] : (hash32(sSeed, 15, boil) > 0.5 ? ramp[2] : ramp[1]);
      sAlpha = isLightPlush ? 0.20 : (0.22 + 0.18 * hash32(sSeed, 14, boil));
    } else {
      col = ramp[0];
      sAlpha = 0.28 + 0.22 * hash32(sSeed, 14, boil);
    }

    drawShortGouacheDab(ctx, sx, sy, sLen, sWid, flowAng, col, sAlpha, {
      seed: sSeed,
      boil,
      boilAmp: boilAmp * 0.9,
      drySplit: (i % 3 === 0)
    });
  }

  // 2c) 右下暗面厚重水粉扫刷
  const shArc1 = extractContiguousArc(bPts, -15, 110, B.rx * 0.10, B.ry * 0.10);
  if (shArc1.length >= 3) {
    drawGouacheStroke(ctx, shArc1, {
      color: ramp[2],
      alpha: isLightPlush ? 0.30 : 0.40,
      maxWeight: clamp(diag * 0.10, 3.5, 16),
      minWeight: 1.2,
      seed: seed + 211,
      boil,
      boilAmp,
      dryFeibai: true
    });
  }
  const shArc2 = extractContiguousArc(bPts, 10, 95, B.rx * 0.18, B.ry * 0.18);
  if (shArc2.length >= 3 && ramp[3]) {
    drawGouacheStroke(ctx, shArc2, {
      color: isLightPlush ? ramp[2] : ramp[3],
      alpha: isLightPlush ? 0.22 : 0.32,
      maxWeight: clamp(diag * 0.075, 2.5, 12),
      minWeight: 1.0,
      seed: seed + 229,
      boil,
      boilAmp,
      dryFeibai: true
    });
  }

  // 2d) 左上受光侧 2 笔干脆的水粉高光提亮笔触
  if (showHighlight) {
    const hlCol = highlightColor || mixHex(ramp[0], '#FFFFFF', 0.48);
    const hlArc1 = extractContiguousArc(bPts, -162, -100, B.rx * 0.14, B.ry * 0.14);
    if (hlArc1.length >= 3) {
      drawGouacheStroke(ctx, hlArc1, {
        color: hlCol,
        alpha: 0.58,
        maxWeight: clamp(diag * 0.048, 1.8, 6.5),
        minWeight: 0.8,
        seed: seed + 307,
        boil,
        boilAmp: boilAmp * 0.75,
        dryFeibai: true
      });
    }
    const hlArc2 = extractContiguousArc(bPts, -148, -112, B.rx * 0.24, B.ry * 0.24);
    if (hlArc2.length >= 3) {
      drawGouacheStroke(ctx, hlArc2, {
        color: '#FFFDF8',
        alpha: 0.45,
        maxWeight: clamp(diag * 0.032, 1.2, 4.5),
        minWeight: 0.6,
        seed: seed + 317,
        boil,
        boilAmp: boilAmp * 0.65
      });
    }
  }

  // ── Step 3: 单层暗面/边缘同色系水粉颗粒（1.5 节） ──
  if (!noGrain && grainAlpha > 0) {
    applyGrain(ctx, bPts, ramp, { seed, boil, grainAlpha });
  }

  // ── Step 4: 背光侧月光边 (rim) ──
  if (showRim) {
    const rimPts = extractContiguousArc(bPts, rimStartDeg, rimEndDeg, Math.min(2.5, B.rx * 0.06), Math.min(2.5, B.ry * 0.06));
    if (rimPts.length >= 3) {
      drawGouacheStroke(ctx, rimPts, {
        color: rimColor,
        alpha: rimAlpha,
        maxWeight: clamp(diag * 0.055, 2.2, 7.5),
        minWeight: 0.9,
        seed: seed + 401,
        boil,
        boilAmp: boilAmp * 0.8,
        dryFeibai: true
      });
    }
  }

  if (stitches && diag > 36) {
    const stArc = extractContiguousArc(bPts, 28, 82, B.rx * 0.26, B.ry * 0.26);
    if (stArc.length >= 4) {
      drawPlushStitches(ctx, stArc, isLightPlush ? ramp[2] : (ramp[3] || ramp[2]), seed + 461, boil);
    }
  }

  ctx.restore(); // 结束内部裁剪

  // ── Step 5: 轮廓边由一笔笔水粉短笔组成（随 boil 明显沸腾起伏！） ──
  const nEdge = edgeStrokes !== null
    ? edgeStrokes
    : clamp(Math.round(diag * 0.42), 20, 48);

  const nPts = bPts.length;
  for (let k = 0; k < nEdge; k++) {
    const eSeed = seed * 97 + k * 53;
    const u = ((k + 0.25 + 0.55 * hash32(eSeed, 1, boil)) / nEdge) % 1.0;
    const idx = Math.floor(u * nPts) % nPts;
    const p = bPts[idx];

    const lightDot = p.nx * 0.65 + p.ny * 0.76;
    if (lightDot < -0.68 && k % 3 === 0) continue;

    let eCol, eAlpha;
    if (lightDot < -0.22) {
      eCol = ramp[0];
      eAlpha = 0.66 + 0.22 * hash32(eSeed, 2, boil);
    } else if (lightDot < 0.25) {
      eCol = ramp[1];
      eAlpha = 0.70 + 0.22 * hash32(eSeed, 2, boil);
    } else {
      eCol = isLightPlush
        ? (hash32(eSeed, 3, boil) > 0.5 ? ramp[2] : ramp[1])
        : (hash32(eSeed, 3, boil) > 0.4 ? (ramp[3] || ramp[2]) : ramp[2]);
      eAlpha = 0.72 + 0.22 * hash32(eSeed, 2, boil);
    }

    const tangAng = Math.atan2(p.ty, p.tx) + (hash32(eSeed, 4, boil) - 0.5) * 0.28;
    const outShift = (hash32(eSeed, 5, boil) - 0.36) * 2.1 * boilAmp;
    const ex = p.x + p.nx * outShift;
    const ey = p.y + p.ny * outShift;
    const eLen = clamp(diag * (0.095 + 0.075 * hash32(eSeed, 6, boil)), 3.4, 14.0);
    const eWid = clamp(diag * (0.034 + 0.026 * hash32(eSeed, 7, boil)), 1.4, 4.6);

    drawShortGouacheDab(ctx, ex, ey, eLen, eWid, tangAng, eCol, eAlpha, {
      seed: eSeed,
      boil,
      boilAmp: boilAmp * 1.15,
      drySplit: true
    });

    if (fuzz && k % 2 === 0) {
      const fTilt = tangAng + (p.nx >= 0 ? 0.55 : -0.55) * (0.6 + 0.5 * hash32(eSeed, 8, boil));
      const fx = p.x + p.nx * (0.95 + hash32(eSeed, 9, boil) * 1.5);
      const fy = p.y + p.ny * (0.95 + hash32(eSeed, 9, boil) * 1.5);
      drawShortGouacheDab(ctx, fx, fy, eLen * 0.60, eWid * 0.56, fTilt, eCol, eAlpha * 0.80, {
        seed: eSeed + 19,
        boil,
        boilAmp: boilAmp * 1.25,
        taperEnd: 0.1
      });
    }
  }

  ctx.restore();
  return bPts;
}

export function drawPlushStitches(ctx, arcPts, color, seed = 1, boil = 0, alpha = 0.42) {
  if (!arcPts || arcPts.length < 2) return;
  drawGouacheStroke(ctx, arcPts, {
    color,
    alpha: alpha * 0.72,
    maxWeight: 1.4,
    minWeight: 0.6,
    seed,
    boil,
    boilAmp: 0.4
  });
  const step = Math.max(2, Math.floor(arcPts.length / 4));
  for (let i = step; i < arcPts.length - 1; i += step) {
    const p = arcPts[i];
    const ang = Math.atan2(p.ny || 0, p.nx || 1);
    drawShortGouacheDab(ctx, p.x, p.y, 4.0, 1.1, ang, color, alpha, {
      seed: seed + i * 13,
      boil,
      boilAmp: 0.35
    });
  }
}

// ─── 7. 角色专用五官、腮红、发光与脚底阴影（脸上细节画在颗粒外面，保持 100% 干净） ───

export function drawToyEye(ctx, x, y, r, opt = {}) {
  const {
    seed = 1,
    boil = 0,
    gazeX = 0,
    gazeY = 0,
    scaleX = 1.0,
    scaleY = 1.0,
    starScale = 1.0,
    creamColor = PALETTE.eyeCream,
    pupilColor = PALETTE.faceInk,
    starColor = PALETTE.eyeStar,
    lidColor = null,
    browColor = null,
    browTilt = 0
  } = opt;

  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scaleX, scaleY);

  const ringPts = sampleSuperEllipse(0, 0, r, r * 1.04, 20, 2.0);
  fillGouache(ctx, ringPts, PALETTE.ramps.cream, { seed, boil, boilAmp: 0.35 });
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2 + (hash32(seed, i, boil) - 0.5) * 0.2;
    drawShortGouacheDab(
      ctx,
      Math.cos(a) * r * 0.92,
      Math.sin(a) * r * 0.95,
      r * 0.55,
      r * 0.24,
      a + Math.PI * 0.5,
      i < 5 ? creamColor : PALETTE.ramps.cream[1],
      0.65,
      { seed: seed + i * 11, boil, boilAmp: 0.3 }
    );
  }

  const px = gazeX * r * 0.20;
  const py = gazeY * r * 0.20;
  const pr = r * 0.74;
  ctx.fillStyle = pupilColor;
  ctx.beginPath();
  ctx.ellipse(px, py, pr, pr * 1.05, 0, 0, Math.PI * 2);
  ctx.fill();

  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    drawShortGouacheDab(
      ctx,
      px + Math.cos(a) * pr * 0.92,
      py + Math.sin(a) * pr * 0.96,
      pr * 0.5,
      pr * 0.2,
      a + Math.PI * 0.5,
      pupilColor,
      0.85,
      { seed: seed + 100 + i * 7, boil, boilAmp: 0.25 }
    );
  }

  const sx = px - pr * 0.32;
  const sy = py - pr * 0.30;
  const sr = Math.max(2.2, pr * 0.44 * starScale);
  const k = sr * 0.26;
  ctx.fillStyle = starColor;
  ctx.beginPath();
  ctx.moveTo(sx, sy - sr);
  ctx.quadraticCurveTo(sx + k, sy - k, sx + sr, sy);
  ctx.quadraticCurveTo(sx + k, sy + k, sx, sy + sr);
  ctx.quadraticCurveTo(sx - k, sy + k, sx - sr, sy);
  ctx.quadraticCurveTo(sx - k, sy - k, sx, sy - sr);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#FFFDF8';
  ctx.beginPath();
  ctx.arc(sx, sy, sr * 0.28, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = creamColor;
  ctx.beginPath();
  ctx.arc(px + pr * 0.34, py + pr * 0.36, Math.max(1.1, pr * 0.19), 0, Math.PI * 2);
  ctx.fill();

  if (lidColor) {
    const lidPts = [
      { x: -r * 0.95, y: -r * 0.35 },
      { x: 0, y: -r * 1.02 },
      { x: r * 0.95, y: -r * 0.32 }
    ];
    drawGouacheStroke(ctx, lidPts, {
      color: lidColor,
      alpha: 0.78,
      maxWeight: Math.max(1.8, r * 0.26),
      minWeight: 0.8,
      seed: seed + 199,
      boil,
      boilAmp: 0.3
    });
  }

  if (browColor) {
    ctx.save();
    ctx.translate(0, -r * 1.25);
    ctx.rotate(browTilt);
    drawShortGouacheDab(ctx, 0, 0, r * 1.35, Math.max(1.8, r * 0.32), 0, browColor, 0.85, {
      seed: seed + 223,
      boil,
      boilAmp: 0.25
    });
    ctx.restore();
  }

  ctx.restore();
}

export function drawNightmareEye(ctx, x, y, rx, ry, opt = {}) {
  const {
    seed = 1,
    boil = 0,
    squint = 0,
    browTilt = 0.18,
    glowScale = 1.0,
    pupilSlit = 0.28
  } = opt;

  const curRy = Math.max(1.5, ry * (1 - squint * 0.68));
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(browTilt);

  drawRadialGlow(ctx, 0, 0, Math.max(rx, ry) * 2.15 * glowScale, PALETTE.nmEye.outer, 0.52);

  const grad = ctx.createRadialGradient(0, -curRy * 0.15, rx * 0.1, 0, 0, Math.max(rx, curRy));
  grad.addColorStop(0.0, PALETTE.nmEye.core);
  grad.addColorStop(0.68, PALETTE.nmEye.glow);
  grad.addColorStop(1.0, PALETTE.nmEye.outer);

  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.ellipse(0, 0, rx, curRy, 0, 0, Math.PI * 2);
  ctx.fill();

  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    drawShortGouacheDab(
      ctx,
      Math.cos(a) * rx * 0.94,
      Math.sin(a) * curRy * 0.94,
      rx * 0.48,
      rx * 0.22,
      a + Math.PI * 0.5,
      i % 2 === 0 ? PALETTE.nmEye.core : PALETTE.nmEye.outer,
      0.72,
      { seed: seed + i * 13, boil, boilAmp: 0.45 }
    );
  }

  if (squint < 0.78) {
    const pw = Math.max(1.2, rx * pupilSlit);
    const ph = Math.max(1.8, curRy * 0.62);
    ctx.fillStyle = PALETTE.nmEye.pupil;
    ctx.beginPath();
    ctx.ellipse(0, curRy * 0.04, pw, ph, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(-pw * 0.55, -ph * 0.35, Math.max(0.8, rx * 0.11), 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

export function drawBlush(ctx, x, y, rx, ry, opt = {}) {
  const {
    angle = 0,
    seed = 1,
    boil = 0,
    alpha = 0.52
  } = opt;

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);

  const grad = ctx.createRadialGradient(0, 0, rx * 0.1, 0, 0, Math.max(rx, ry));
  grad.addColorStop(0, rgba(PALETTE.blush, alpha));
  grad.addColorStop(0.7, rgba(PALETTE.blush, alpha * 0.55));
  grad.addColorStop(1, rgba(PALETTE.blush, 0));
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.ellipse(0, 0, rx * 1.15, ry * 1.15, 0, 0, Math.PI * 2);
  ctx.fill();

  for (let i = 0; i < 5; i++) {
    const ox = (hash32(seed, i, boil) - 0.5) * rx * 0.8;
    const oy = (hash32(seed + 7, i, boil) - 0.5) * ry * 0.6;
    drawShortGouacheDab(ctx, ox, oy, rx * 0.85, ry * 0.55, (hash32(seed, i, 9) - 0.5) * 0.4, PALETTE.blush, alpha * 0.65, {
      seed: seed + i * 17,
      boil,
      boilAmp: 0.35
    });
  }

  for (let k = -1; k <= 0; k++) {
    const tx = (k + 0.5) * rx * 0.58;
    drawShortGouacheDab(ctx, tx, 0, ry * 0.95, Math.max(1.1, rx * 0.22), -0.95, PALETTE.blushTick, alpha * 0.85, {
      seed: seed + 91 + k * 19,
      boil,
      boilAmp: 0.3
    });
  }

  ctx.restore();
}

export function drawPoolShadow(ctx, x, y, rx, ry, opt = {}) {
  const {
    seed = 1,
    boil = 0,
    alpha = 0.55,
    color = PALETTE.pool
  } = opt;

  ctx.save();
  ctx.translate(x, y);
  ctx.scale(1, ry / Math.max(1, rx));

  const grad = ctx.createRadialGradient(0, 0, rx * 0.08, 0, 0, rx);
  grad.addColorStop(0.0, rgba(color, alpha));
  grad.addColorStop(0.58, rgba(color, alpha * 0.52));
  grad.addColorStop(1.0, rgba(color, 0));

  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(0, 0, rx, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  for (let i = -3; i <= 3; i++) {
    const u = i / 3.5;
    const chord = Math.sqrt(Math.max(0.1, 1 - u * u)) * rx * 0.82;
    drawShortGouacheDab(
      ctx,
      x + (hash32(seed, i + 10, boil) - 0.5) * 4,
      y + u * ry * 0.65,
      chord * 1.35,
      Math.max(1.5, ry * 0.28),
      (hash32(seed, i + 20, boil) - 0.5) * 0.08,
      color,
      alpha * 0.28 * (1 - Math.abs(u) * 0.5),
      { seed: seed + 500 + i * 11, boil, boilAmp: 0.35 }
    );
  }
}

export function drawRadialGlow(ctx, x, y, radius, colorHex, alpha = 0.45) {
  if (radius <= 0.5 || alpha <= 0.005) return;
  ctx.save();
  const grad = ctx.createRadialGradient(x, y, radius * 0.04, x, y, radius);
  grad.addColorStop(0.0, rgba(colorHex, Math.min(1, alpha * 1.1)));
  grad.addColorStop(0.42, rgba(colorHex, alpha * 0.52));
  grad.addColorStop(0.78, rgba(colorHex, alpha * 0.16));
  grad.addColorStop(1.0, rgba(colorHex, 0.0));
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

// ─── 8. 画图调用次数统计器 ───
const DRAW_METHODS = new Set([
  'fill', 'stroke', 'drawImage', 'fillRect', 'strokeRect', 'clip'
]);
const ALL_PATH_METHODS = new Set([
  'fill', 'stroke', 'drawImage', 'fillRect', 'strokeRect', 'clip',
  'beginPath', 'closePath', 'moveTo', 'lineTo', 'quadraticCurveTo', 'bezierCurveTo', 'arc', 'ellipse', 'rect'
]);

export function measureCalls(ctx, fn) {
  let drawCalls = 0;
  let pathCalls = 0;
  const proxy = new Proxy(ctx, {
    get(target, prop) {
      const val = target[prop];
      if (typeof val === 'function') {
        return function (...args) {
          if (DRAW_METHODS.has(prop)) drawCalls++;
          if (ALL_PATH_METHODS.has(prop)) pathCalls++;
          return val.apply(target, args);
        };
      }
      return val;
    },
    set(target, prop, value) {
      target[prop] = value;
      return true;
    }
  });
  const t0 = typeof performance !== 'undefined' ? performance.now() : Date.now();
  fn(proxy);
  const dt = (typeof performance !== 'undefined' ? performance.now() : Date.now()) - t0;
  return { drawCalls, pathCalls, ms: dt };
}

export default {
  PALETTE,
  setGrain,
  getGrain,
  hash32,
  createRng,
  lerp,
  clamp,
  smoothstep,
  noise2D,
  fbm2D,
  hexToRgb,
  rgba,
  mixHex,
  getRamp,
  resolveSameFamilyGrainColor,
  createOffscreenCanvas,
  getGrainTile,
  sampleSuperEllipse,
  subdivideSpline,
  computeNormals,
  extractContiguousArc,
  drawShortGouacheDab,
  drawGouacheStroke,
  fillGouache,
  applyGrain,
  paintGouacheBody,
  drawPlushStitches,
  drawToyEye,
  drawNightmareEye,
  drawBlush,
  drawPoolShadow,
  drawRadialGlow,
  measureCalls
};
