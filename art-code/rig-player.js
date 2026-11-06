// 《枕头堡》L1 部件 + Rig 播放器（第 2 批：支持多朝向 facings、发射点 muzzle 标记、出手帧 release 闪烁、预烘焙图集与 3× 实时重画模式）
// 兼容新写法（parts/anims 按 facing 分组）与老写法（parts 为数组，当作只有 front）

import { createOffscreenCanvas, measureCalls, lerp } from './kit/index.js';

export function getFacings(mod) {
  if (Array.isArray(mod.facings) && mod.facings.length > 0) return mod.facings;
  if (mod.parts && !Array.isArray(mod.parts) && typeof mod.parts === 'object') {
    return Object.keys(mod.parts);
  }
  return ['front'];
}

export function getPartsForFacing(mod, facing = 'front') {
  if (!mod.parts) return [];
  if (Array.isArray(mod.parts)) return mod.parts;
  return mod.parts[facing] || mod.parts.front || Object.values(mod.parts)[0] || [];
}

export function getAnimsForFacing(mod, facing = 'front') {
  if (!mod.anims) return {};
  if (mod.anims[facing] && !mod.anims[facing].dur && typeof mod.anims[facing] === 'object') {
    return mod.anims[facing];
  }
  if (mod.anims.front && !mod.anims.front.dur) {
    return mod.anims[facing] || mod.anims.front;
  }
  return mod.anims;
}

export function getMuzzleForFacing(mod, facing = 'front') {
  if (!mod.muzzle) return null;
  if (Array.isArray(mod.muzzle) && typeof mod.muzzle[0] === 'number') return mod.muzzle;
  return mod.muzzle[facing] || mod.muzzle.front || null;
}

function evalTrack(keys, tMs) {
  if (!keys || keys.length === 0) return null;
  if (tMs <= keys[0].t) return keys[0];
  if (tMs >= keys[keys.length - 1].t) return keys[keys.length - 1];
  for (let i = 0; i < keys.length - 1; i++) {
    const a = keys[i];
    const b = keys[i + 1];
    if (tMs >= a.t && tMs <= b.t) {
      const span = Math.max(1, b.t - a.t);
      const u = (tMs - a.t) / span;
      let k = u;
      if (a.ease === 'smooth' || a.ease === 'sineInOut') k = u * u * (3 - 2 * u);
      else if (a.ease === 'out' || a.ease === 'quadOut') k = 1 - (1 - u) * (1 - u);
      else if (a.ease === 'in' || a.ease === 'quadIn') k = u * u;
      return {
        x: lerp(a.x || 0, b.x || 0, k),
        y: lerp(a.y || 0, b.y || 0, k),
        rot: lerp(a.rot || 0, b.rot || 0, k),
        sx: lerp(a.sx !== undefined ? a.sx : 1, b.sx !== undefined ? b.sx : 1, k),
        sy: lerp(a.sy !== undefined ? a.sy : 1, b.sy !== undefined ? b.sy : 1, k),
        alpha: lerp(a.alpha !== undefined ? a.alpha : 1, b.alpha !== undefined ? b.alpha : 1, k),
        hidden: a.hidden !== undefined ? a.hidden : undefined
      };
    }
  }
  return keys[keys.length - 1];
}

/**
 * 为 L1 模块烘焙所有朝向、所有部件的所有沸腾变体
 */
export function buildL1Atlas(mod, opt = {}) {
  const scale = opt.scale || 1;
  const seed = opt.seed || 101;
  const boilCount = mod.boil || 3;
  const facings = getFacings(mod);
  const facingsMap = {};
  const stats = {
    totalMs: 0,
    totalDrawCalls: 0,
    totalPathCalls: 0,
    maxDrawCalls: 0,
    maxPathCalls: 0,
    parts: {}
  };

  for (let fIdx = 0; fIdx < facings.length; fIdx++) {
    const facing = facings[fIdx];
    const parts = getPartsForFacing(mod, facing);
    const partMap = {};

    for (let pIdx = 0; pIdx < parts.length; pIdx++) {
      const part = parts[pIdx];
      const [rx, ry, rw, rh] = part.rect;
      const pBoils = part.boil === false ? 1 : boilCount;
      const frames = [];
      let partDrawCalls = 0;
      let partPathCalls = 0;
      let partMs = 0;

      for (let b = 0; b < pBoils; b++) {
        const cw = Math.max(1, Math.ceil(rw * scale));
        const ch = Math.max(1, Math.ceil(rh * scale));
        const canvas = createOffscreenCanvas(cw, ch);
        const ctx = canvas.getContext('2d');

        const m = measureCalls(ctx, (pctx) => {
          pctx.save();
          pctx.scale(scale, scale);
          pctx.translate(-rx, -ry);
          mod.drawPart(pctx, part.id, {
            seed: seed + fIdx * 199 + pIdx * 31,
            boil: b,
            scale,
            facing
          });
          pctx.restore();
        });

        if (b === 0) {
          partDrawCalls = m.drawCalls;
          partPathCalls = m.pathCalls;
        }
        partMs += m.ms;
        frames.push(canvas);
      }

      partMap[part.id] = {
        def: part,
        frames,
        phaseOffset: pIdx * 17
      };

      const statKey = facings.length > 1 ? `${facing}/${part.id}` : part.id;
      stats.parts[statKey] = {
        facing,
        partId: part.id,
        drawCalls: partDrawCalls,
        pathCalls: partPathCalls,
        ms: Number(partMs.toFixed(2)),
        boilCount: pBoils,
        rect: part.rect
      };
      stats.totalDrawCalls += partDrawCalls;
      stats.totalPathCalls += partPathCalls;
      stats.maxDrawCalls = Math.max(stats.maxDrawCalls, partDrawCalls);
      stats.maxPathCalls = Math.max(stats.maxPathCalls, partPathCalls);
      stats.totalMs += partMs;
    }

    facingsMap[facing] = partMap;
  }

  stats.totalMs = Number(stats.totalMs.toFixed(2));
  return {
    mod,
    scale,
    seed,
    boilCount,
    facings: facingsMap,
    partMap: facingsMap.front || Object.values(facingsMap)[0] || {},
    stats
  };
}

/**
 * 计算 L1 模块在指定朝向、动作与时刻下的各部件状态
 */
export function computeRigPose(mod, animName, timeMs, facing = 'front') {
  const parts = getPartsForFacing(mod, facing);
  const anims = getAnimsForFacing(mod, facing);
  const anim = anims[animName] || anims.idle || Object.values(anims)[0] || { dur: 1000, loop: true, tracks: {} };
  const dur = anim.dur || 1000;
  const t = anim.loop ? (timeMs % dur) : Math.min(dur, timeMs);

  const pose = {};
  for (const part of parts) {
    pose[part.id] = {
      x: 0,
      y: 0,
      rot: 0,
      sx: 1,
      sy: 1,
      alpha: 1,
      hidden: !!part.hidden
    };
  }

  if (anim.tracks) {
    for (const partId of Object.keys(anim.tracks)) {
      if (!pose[partId]) continue;
      const val = evalTrack(anim.tracks[partId], t);
      if (val) {
        if (val.x !== undefined) pose[partId].x = val.x;
        if (val.y !== undefined) pose[partId].y = val.y;
        if (val.rot !== undefined) pose[partId].rot = val.rot;
        if (val.sx !== undefined) pose[partId].sx = val.sx;
        if (val.sy !== undefined) pose[partId].sy = val.sy;
        if (val.alpha !== undefined) pose[partId].alpha = val.alpha;
        if (val.hidden !== undefined) pose[partId].hidden = val.hidden;
      }
    }
  }
  return pose;
}

function applyParentChain(ctx, partDef, pose, byId) {
  if (partDef.parent && byId[partDef.parent]) {
    applyParentChain(ctx, byId[partDef.parent], pose, byId);
  }
  const st = pose[partDef.id];
  const [px, py] = partDef.pivot;
  ctx.translate(px + st.x, py + st.y);
  if (st.rot) ctx.rotate((st.rot * Math.PI) / 180);
  if (st.sx !== 1 || st.sy !== 1) ctx.scale(st.sx, st.sy);
  ctx.translate(-px, -py);
}

/**
 * 渲染一帧 L1 角色（支持 facing、showMuzzle 发射点十字与 release 出手帧闪烁提示）
 */
export function drawRigInstance(ctx, mod, atlas, opt = {}) {
  const {
    facing = 'front',
    anim = 'idle',
    timeMs = 0,
    x = 0,
    y = 0,
    displayW = mod.size[0],
    displayH = mod.size[1],
    boilFps = 7,
    phaseSeed = 0,
    realtime = false,
    seed = 101,
    scale = 1,
    faceLeft = false,
    showMuzzle = false
  } = opt;

  const parts = getPartsForFacing(mod, facing);
  const anims = getAnimsForFacing(mod, facing);
  const animDef = anims[anim] || anims.idle || { dur: 1000, loop: true };
  const pose = computeRigPose(mod, anim, timeMs, facing);
  const byId = {};
  for (const p of parts) byId[p.id] = p;

  const [aw, ah] = mod.size;
  const [ancX, ancY] = mod.anchor;
  const sx = displayW / aw;
  const sy = displayH / ah;
  const boilTick = Math.floor((timeMs / 1000) * boilFps) + phaseSeed;
  const fIdx = Math.max(0, getFacings(mod).indexOf(facing));

  ctx.save();
  ctx.translate(x, y);
  if (faceLeft) ctx.scale(-1, 1);
  ctx.scale(sx, sy);
  ctx.translate(-ancX, -ancY);

  const facingMap = atlas && atlas.facings ? (atlas.facings[facing] || atlas.partMap) : (atlas ? atlas.partMap : null);

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    const st = pose[part.id];
    if (!st || st.hidden || st.alpha <= 0.01) continue;

    ctx.save();
    applyParentChain(ctx, part, pose, byId);
    if (st.alpha < 1) ctx.globalAlpha *= st.alpha;

    if (realtime || !facingMap) {
      const bVal = part.boil === false ? 0 : (boilTick + i * 3);
      ctx.save();
      ctx.beginPath();
      ctx.rect(part.rect[0], part.rect[1], part.rect[2], part.rect[3]);
      ctx.clip();
      mod.drawPart(ctx, part.id, {
        seed: seed + fIdx * 199 + i * 31,
        boil: bVal,
        scale,
        facing
      });
      ctx.restore();
    } else {
      const entry = facingMap[part.id];
      if (entry && entry.frames.length > 0) {
        const bIdx = part.boil === false ? 0 : ((boilTick + i) % entry.frames.length);
        const img = entry.frames[bIdx];
        const [rx, ry, rw, rh] = part.rect;
        ctx.drawImage(img, rx, ry, rw, rh);
      }
    }

    ctx.restore();
  }

  // 预览页辅助标记：标出每个朝向的发射点 muzzle（小十字）与出手帧 release 闪烁
  if (showMuzzle) {
    const muz = getMuzzleForFacing(mod, facing);
    if (muz) {
      const [mx, my] = muz;
      const dur = animDef.dur || 1000;
      const localT = timeMs % dur;
      const relT = (mod.release && mod.release[anim] !== undefined) ? mod.release[anim] : null;
      const isReleasing = relT !== null && Math.abs(localT - relT) <= 55;

      ctx.save();
      if (isReleasing) {
        const pulse = 1 - Math.abs(localT - relT) / 55;
        ctx.strokeStyle = '#FFF3C4';
        ctx.lineWidth = 2.4;
        ctx.beginPath();
        ctx.arc(mx, my, 7 + pulse * 10, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = 'rgba(255, 211, 94, 0.55)';
        ctx.beginPath();
        ctx.arc(mx, my, 5 + pulse * 6, 0, Math.PI * 2);
        ctx.fill();
      }

      // 发射点十字准星
      ctx.strokeStyle = isReleasing ? '#FFFFFF' : '#FF5E7E';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(mx - 6, my);
      ctx.lineTo(mx + 6, my);
      ctx.moveTo(mx, my - 6);
      ctx.lineTo(mx, my + 6);
      ctx.stroke();

      ctx.fillStyle = isReleasing ? '#FFF3C4' : '#FF5E7E';
      ctx.beginPath();
      ctx.arc(mx, my, 2.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  ctx.restore();
}

export const RigPlayer = {
  getFacings,
  getPartsForFacing,
  getAnimsForFacing,
  getMuzzleForFacing,
  buildL1Atlas,
  computeRigPose,
  drawRigInstance
};

if (typeof window !== 'undefined') {
  window.RigPlayer = RigPlayer;
}

export default RigPlayer;
