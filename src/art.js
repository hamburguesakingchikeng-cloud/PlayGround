// ============================================================
// LA ESPADA CELESTIAL — arte procedural: personajes y criaturas
// ============================================================
import { TAU, clamp, lerp } from './core.js';
import { APPEARANCE, CREATURES } from './data.js';

export function rr(ctx, x, y, w, h, r) {
  r = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export function glow(ctx, x, y, r, color, alpha = 0.5) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, Math.max(1, r));
  g.addColorStop(0, color);
  g.addColorStop(0.38, color);
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
  ctx.restore();
}

export function shadow(ctx, x, y, rx, ry, alpha = 0.28) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = '#000';
  ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, TAU); ctx.fill();
  ctx.restore();
}

export function poly(ctx, pts, fill) {
  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
}

export function mix(a, b, t) {
  const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16);
  const ar = pa >> 16, ag = (pa >> 8) & 255, ab = pa & 255;
  const br = pb >> 16, bg = (pb >> 8) & 255, bb = pb & 255;
  return `rgb(${Math.round(lerp(ar, br, t))},${Math.round(lerp(ag, bg, t))},${Math.round(lerp(ab, bb, t))})`;
}

export function appearancePalette(look = {}) {
  const face = APPEARANCE.faces.find(f => f.id === look.face) || APPEARANCE.faces[0];
  const hair = APPEARANCE.hairs.find(h => h.id === look.hair) || APPEARANCE.hairs[0];
  const hc = APPEARANCE.hairColors.find(h => h.id === look.hairColor) || APPEARANCE.hairColors[0];
  const outfit = APPEARANCE.outfits.find(o => o.id === look.outfit) || APPEARANCE.outfits[0];
  return {
    skin: face.skin, eye: face.eye, mark: face.mark,
    hair: hc.color, hairHi: hc.hi, hairStyle: hair.id,
    cloth: outfit.cloth, cloth2: outfit.cloth2, trim: outfit.trim,
    cape: outfit.cape, accessory: look.accessory || 'ninguno',
    faceId: face.id, outfitId: outfit.id,
  };
}

function drawSword(ctx, x, y, angle, len, color = '#e8e2cf', glowColor = '#ffe9a8', alpha = 1) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.globalAlpha = alpha;
  ctx.shadowColor = glowColor;
  ctx.shadowBlur = 12;
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.4;
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(len, 0); ctx.stroke();
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 0.8;
  ctx.beginPath(); ctx.moveTo(2, -0.8); ctx.lineTo(len - 3, -0.8); ctx.stroke();
  ctx.shadowBlur = 0;
  ctx.strokeStyle = '#c9a86a';
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(-1, -5); ctx.lineTo(-1, 5); ctx.stroke();
  ctx.strokeStyle = '#6a4a2a';
  ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(-1, 0); ctx.lineTo(-7, 0); ctx.stroke();
  ctx.fillStyle = glowColor;
  ctx.beginPath(); ctx.arc(0, 0, 1.8, 0, TAU); ctx.fill();
  ctx.restore();
}

export function drawHumanoid(ctx, o) {
  const t = o.time || 0;
  const state = o.state || 'idle';
  const phase = o.phase || 0;
  const st = o.stateTime || 0;
  const facing = o.facing ?? -Math.PI / 2;
  const s = o.s || 1;
  const p = o.palette || appearancePalette(o.look);
  const cloth = o.armorColor || p.cloth;
  const cloth2 = p.cloth2 || mix(cloth, '#000000', 0.35);
  const trim = o.armorTrim || p.trim || '#d9b46a';
  const moving = state === 'move' || state === 'dodge';
  const swing = Math.sin(phase) * (moving ? 7 : 0);
  const bob = moving ? Math.abs(Math.sin(phase)) * -1.5 : Math.sin(t * 2.1 + phase) * 0.6;
  const hurt = o.hurt || 0;
  const dead = !!o.dead;
  const deathT = clamp((o.deathTime || 0) / 0.75, 0, 1);

  ctx.save();
  ctx.translate(o.x, o.y);
  if (dead) {
    ctx.rotate(-1.25 * deathT);
    ctx.translate(0, 10 * deathT);
    ctx.globalAlpha = 1 - deathT * 0.55;
  }
  ctx.scale(s, s);
  shadow(ctx, 0, 1, 12, 4.5, 0.32);

  // capa
  if (o.cape ?? p.cape) {
    const flutter = Math.sin(t * 3.4 + phase) * 3;
    poly(ctx, [[-8, -38 + bob], [8, -38 + bob], [13 + flutter, -8], [4 + flutter, -3], [-4 + flutter, -4], [-13 + flutter, -10]], mix(cloth2, '#000000', 0.15));
    ctx.strokeStyle = trim; ctx.globalAlpha = 0.45; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(-11, -34 + bob); ctx.quadraticCurveTo(-2, -20, -10 + flutter, -7); ctx.stroke();
    ctx.globalAlpha = 1;
  }

  // piernas
  const legSpread = state === 'dodge' ? 5 : 3;
  ctx.strokeStyle = mix(cloth2, '#000000', 0.2);
  ctx.lineWidth = 4.2;
  ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(-3.5, -17 + bob); ctx.lineTo(-legSpread + swing * 0.5, -2); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(3.5, -17 + bob); ctx.lineTo(legSpread - swing * 0.5, -2); ctx.stroke();
  ctx.strokeStyle = '#2a211c';
  ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(-legSpread + swing * 0.5, -2); ctx.lineTo(-legSpread + swing * 0.5 - 1, 1); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(legSpread - swing * 0.5, -2); ctx.lineTo(legSpread - swing * 0.5 + 1, 1); ctx.stroke();

  // torso
  const torsoGrad = ctx.createLinearGradient(-9, -38, 9, -16);
  torsoGrad.addColorStop(0, mix(cloth, '#ffffff', 0.16));
  torsoGrad.addColorStop(0.55, cloth);
  torsoGrad.addColorStop(1, cloth2);
  ctx.fillStyle = torsoGrad;
  rr(ctx, -9, -38 + bob, 18, 22, 5); ctx.fill();
  // placas / costuras
  ctx.strokeStyle = trim; ctx.globalAlpha = 0.55; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(0, -36 + bob); ctx.lineTo(0, -19 + bob); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-7, -30 + bob); ctx.lineTo(7, -30 + bob); ctx.stroke();
  ctx.globalAlpha = 1;
  // cinturón
  ctx.fillStyle = '#3a2a20'; ctx.fillRect(-9, -20 + bob, 18, 3);
  ctx.fillStyle = trim; ctx.fillRect(-2, -20 + bob, 4, 3);
  // hombreras
  ctx.fillStyle = mix(cloth, '#ffffff', 0.22);
  ctx.beginPath(); ctx.ellipse(-9, -35 + bob, 4, 5, -0.3, 0, TAU); ctx.fill();
  ctx.beginPath(); ctx.ellipse(9, -35 + bob, 4, 5, 0.3, 0, TAU); ctx.fill();

  // brazo trasero
  ctx.strokeStyle = mix(cloth2, '#000000', 0.12); ctx.lineWidth = 3.6;
  ctx.beginPath(); ctx.moveTo(7, -34 + bob); ctx.lineTo(10, -24 + bob); ctx.stroke();

  // arma / brazo delantero
  const dirX = Math.cos(facing);
  const dirY = Math.sin(facing) * 0.62;
  let weaponAngle = Math.atan2(dirY, dirX);
  let handX = -dirX * 2 + 8, handY = -30 + bob + dirY * 5;
  if (state === 'attack' || state === 'heavy') {
    const dur = state === 'heavy' ? 0.62 : 0.34;
    const prog = clamp(st / dur, 0, 1);
    const arc = state === 'heavy' ? 2.9 : 2.2;
    weaponAngle = facing - arc * 0.62 + prog * arc;
    handX = Math.cos(facing) * 4 + 3;
    handY = -30 + bob + Math.sin(facing) * 4;
  } else if (state === 'cast') {
    weaponAngle = facing - 0.5;
    handX = 10; handY = -38 + bob;
  } else if (state === 'block') {
    weaponAngle = facing - 0.7;
    handX = 7; handY = -27 + bob;
  }
  ctx.strokeStyle = mix(cloth, '#ffffff', 0.05); ctx.lineWidth = 3.6;
  ctx.beginPath(); ctx.moveTo(-8, -34 + bob); ctx.lineTo(handX, handY); ctx.stroke();
  ctx.fillStyle = p.skin;
  ctx.beginPath(); ctx.arc(handX, handY, 2.2, 0, TAU); ctx.fill();

  if (o.weapon !== false) {
    drawSword(ctx, handX, handY, weaponAngle, o.weaponLen || 27, o.weaponColor || '#e8e2cf', o.weaponGlow || '#ffe9a8', o.weaponAlpha ?? 1);
  }

  // escudo
  if (state === 'block' || o.shield) {
    const sx = Math.cos(facing) * 12, sy = -28 + bob + Math.sin(facing) * 7;
    ctx.save(); ctx.translate(sx, sy); ctx.rotate(facing);
    ctx.fillStyle = mix(cloth, '#ffffff', 0.28);
    ctx.strokeStyle = trim; ctx.lineWidth = 1.4;
    rr(ctx, -6, -10, 12, 20, 4); ctx.fill(); ctx.stroke();
    ctx.fillStyle = trim; ctx.beginPath(); ctx.arc(0, 0, 3, 0, TAU); ctx.fill();
    ctx.restore();
  }

  // cabeza
  const headX = clamp(dirX * 1.7, -1.8, 1.8);
  const headY = -46 + bob;
  ctx.fillStyle = p.skin;
  ctx.beginPath(); ctx.ellipse(headX, headY, 7.2, 8.2, 0, 0, TAU); ctx.fill();
  // cuello
  ctx.fillStyle = mix(p.skin, '#000000', 0.14);
  ctx.fillRect(-2.2, -40 + bob, 4.4, 4);

  // pelo
  const hair = p.hair || '#2b2233';
  const hairHi = p.hairHi || mix(hair, '#ffffff', 0.35);
  const style = p.hairStyle || 'corto';
  ctx.fillStyle = hair;
  if (style === 'largo') {
    poly(ctx, [[-7, -51 + bob], [7, -51 + bob], [9, -36 + bob], [5, -35 + bob], [4, -44 + bob], [-4, -44 + bob], [-5, -35 + bob], [-9, -36 + bob]], hair);
  } else if (style === 'coleta') {
    ctx.beginPath(); ctx.arc(headX, headY - 1.5, 7.4, Math.PI * 0.95, Math.PI * 2.05); ctx.fill();
    ctx.beginPath(); ctx.ellipse(-7, -41 + bob, 3.2, 7, 0.5, 0, TAU); ctx.fill();
  } else if (style === 'trenza') {
    ctx.beginPath(); ctx.arc(headX, headY - 1.5, 7.4, Math.PI * 0.95, Math.PI * 2.05); ctx.fill();
    for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.arc(-6 - i * 0.4, -40 + bob + i * 4.5, 2.4 - i * 0.25, 0, TAU); ctx.fill(); }
  } else if (style === 'salvaje') {
    for (let i = 0; i < 7; i++) {
      const a = Math.PI + (i / 6) * Math.PI;
      poly(ctx, [[headX + Math.cos(a) * 5, headY + Math.sin(a) * 5], [headX + Math.cos(a - 0.22) * 10, headY + Math.sin(a - 0.22) * 9], [headX + Math.cos(a + 0.2) * 7, headY + Math.sin(a + 0.2) * 7]], i % 2 ? hairHi : hair);
    }
  } else if (style === 'rapado') {
    ctx.globalAlpha = 0.65; ctx.beginPath(); ctx.arc(headX, headY - 2.5, 7, Math.PI * 0.98, Math.PI * 2.02); ctx.fill(); ctx.globalAlpha = 1;
  } else {
    ctx.beginPath(); ctx.arc(headX, headY - 1.5, 7.4, Math.PI * 0.92, Math.PI * 2.08); ctx.fill();
    ctx.beginPath(); ctx.ellipse(headX - 5.5, headY + 1, 2.2, 4, 0.2, 0, TAU); ctx.fill();
    ctx.beginPath(); ctx.ellipse(headX + 5.5, headY + 1, 2.2, 4, -0.2, 0, TAU); ctx.fill();
  }
  // brillo de pelo
  ctx.strokeStyle = hairHi; ctx.globalAlpha = 0.5; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.arc(headX - 2, headY - 3, 5, Math.PI * 1.05, Math.PI * 1.6); ctx.stroke(); ctx.globalAlpha = 1;

  // ojos / boca
  const eyeShift = clamp(dirX * 1.6, -1.4, 1.4);
  ctx.fillStyle = p.eye || '#3b6b57';
  ctx.beginPath(); ctx.ellipse(headX - 2.5 + eyeShift, headY + 0.5, 1.15, 1.5, 0, 0, TAU); ctx.fill();
  ctx.beginPath(); ctx.ellipse(headX + 2.5 + eyeShift, headY + 0.5, 1.15, 1.5, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.beginPath(); ctx.arc(headX - 2.2 + eyeShift, headY + 0.1, 0.4, 0, TAU); ctx.fill();
  ctx.beginPath(); ctx.arc(headX + 2.8 + eyeShift, headY + 0.1, 0.4, 0, TAU); ctx.fill();
  ctx.strokeStyle = mix(p.skin, '#000000', 0.35); ctx.lineWidth = 0.7;
  ctx.beginPath(); ctx.moveTo(headX - 1.3 + eyeShift, headY + 4); ctx.lineTo(headX + 1.4 + eyeShift, headY + 4); ctx.stroke();

  // marcas
  if (p.mark === 'scar') { ctx.strokeStyle = '#9a5a50'; ctx.lineWidth = 0.9; ctx.beginPath(); ctx.moveTo(headX + 3.2, headY - 3.5); ctx.lineTo(headX + 1.5, headY + 2); ctx.stroke(); }
  if (p.mark === 'mark') { ctx.strokeStyle = '#b48cff'; ctx.lineWidth = 0.8; ctx.beginPath(); ctx.arc(headX + 3.4, headY - 1, 1.8, 0, TAU); ctx.stroke(); }
  if (p.mark === 'freckles') { ctx.fillStyle = '#a96f4a'; for (let i = 0; i < 4; i++) ctx.fillRect(headX - 3 + i * 1.8, headY + 2.2, 0.7, 0.7); }
  if (p.beard) { ctx.fillStyle = p.hair; ctx.beginPath(); ctx.ellipse(headX, headY + 6, 4.5, 3.2, 0, 0, TAU); ctx.fill(); }
  if (p.age) { ctx.strokeStyle = 'rgba(80,60,50,.4)'; ctx.lineWidth = 0.6; ctx.beginPath(); ctx.moveTo(headX - 4, headY - 1); ctx.lineTo(headX - 2.5, headY - 0.5); ctx.stroke(); }

  // accesorio
  const acc = o.accessory ?? p.accessory;
  if (acc === 'bufanda') { ctx.fillStyle = '#c95a68'; rr(ctx, -6, -41 + bob, 12, 3.5, 1.5); ctx.fill(); poly(ctx, [[4, -39 + bob], [8, -38 + bob], [7, -30 + bob], [4, -32 + bob]], '#b44a58'); }
  if (acc === 'pendiente') { ctx.fillStyle = '#ffd06a'; ctx.beginPath(); ctx.arc(headX + 6.2, headY + 3, 1.2, 0, TAU); ctx.fill(); }
  if (acc === 'halo') { ctx.strokeStyle = '#ffe9a8'; ctx.globalAlpha = 0.8; ctx.lineWidth = 1; ctx.beginPath(); ctx.ellipse(headX, headY - 10, 7, 2, 0, 0, TAU); ctx.stroke(); ctx.globalAlpha = 1; }
  if (acc === 'parche') { ctx.fillStyle = '#2a211c'; ctx.fillRect(headX + 1.4 + eyeShift, headY - 1.5, 3.4, 3); ctx.strokeStyle = '#2a211c'; ctx.beginPath(); ctx.moveTo(headX + 1, headY - 4); ctx.lineTo(headX + 5, headY - 2); ctx.stroke(); }
  if (acc === 'cuerno') { ctx.fillStyle = '#e8d4bc'; poly(ctx, [[headX - 5, headY - 6], [headX - 8, headY - 13], [headX - 3, headY - 8]], '#e8d4bc'); }

  // casco
  if (o.helmet) {
    ctx.fillStyle = o.helmetColor || '#8b96a8';
    ctx.beginPath(); ctx.arc(headX, headY - 2, 7.6, Math.PI * 0.95, Math.PI * 2.05); ctx.fill();
    ctx.fillRect(headX - 7.6, headY - 3, 15.2, 3.4);
    ctx.fillStyle = '#3a4658'; ctx.fillRect(headX - 5, headY - 1, 10, 2.2);
    ctx.strokeStyle = '#e8eef8'; ctx.globalAlpha = 0.55; ctx.lineWidth = 0.8;
    ctx.beginPath(); ctx.moveTo(headX - 5, headY - 5); ctx.quadraticCurveTo(headX, headY - 8, headX + 5, headY - 5); ctx.stroke();
    ctx.globalAlpha = 1;
  }

  // herida
  if (hurt > 0) {
    ctx.globalAlpha = hurt * 0.55;
    ctx.fillStyle = '#ff5a4a';
    ctx.beginPath(); ctx.arc(0, -28 + bob, 16, 0, TAU); ctx.fill();
    ctx.globalAlpha = 1;
  }
  ctx.restore();
}

// ------------------------------------------------------------
// CRIATURAS Y ENEMIGOS
// ------------------------------------------------------------
export function drawCreatureShape(ctx, shape, colors, o = {}) {
  const t = o.time || 0;
  const s = o.s || 1;
  const dead = !!o.dead;
  const deathT = clamp((o.deathTime || 0) / 0.8, 0, 1);
  const hit = o.hitFlash || 0;
  const c = colors || { main: '#d8c9a8', accent: '#7ddc9a', glow: '#eaffc8', dark: '#2a2a2a' };
  const bounce = Math.sin(t * 3 + (o.phase || 0)) * (o.bounce ?? 1);

  ctx.save();
  ctx.translate(o.x || 0, o.y || 0);
  if (dead) { ctx.rotate((o.facing || 0) + 0.9 * deathT); ctx.globalAlpha = 1 - deathT * 0.8; }
  ctx.scale(s, s);
  if (!o.noShadow) shadow(ctx, 0, 2, 14, 4, 0.28);

  const eye = (x, y, r = 1.6, col = c.glow) => {
    ctx.fillStyle = col;
    ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
    ctx.fillStyle = c.dark;
    ctx.beginPath(); ctx.arc(x + 0.3, y + 0.1, r * 0.48, 0, TAU); ctx.fill();
  };

  switch (shape) {
    case 'slime': {
      const sq = 1 + Math.sin(t * 4) * 0.06;
      ctx.fillStyle = c.main;
      ctx.beginPath();
      ctx.ellipse(0, -8 + bounce * 0.5, 15 / sq, 12 * sq, 0, 0, TAU);
      ctx.fill();
      ctx.fillStyle = c.accent; ctx.globalAlpha = 0.5;
      ctx.beginPath(); ctx.ellipse(-4, -4, 6, 4, -0.3, 0, TAU); ctx.fill(); ctx.globalAlpha = 1;
      glow(ctx, 0, -9, 22, c.glow, 0.22);
      eye(-4, -10); eye(4, -10);
      ctx.strokeStyle = c.dark; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(0, -6, 3, 0.2, Math.PI - 0.2); ctx.stroke();
      break;
    }
    case 'wolf': case 'fox': {
      const fox = shape === 'fox';
      const leg = Math.sin(t * 6) * 2;
      ctx.strokeStyle = c.dark; ctx.lineWidth = 3;
      for (const [x, ph] of [[-7, 1], [-4, -1], [5, 1], [8, -1]]) { ctx.beginPath(); ctx.moveTo(x, -8); ctx.lineTo(x + ph * leg, 0); ctx.stroke(); }
      ctx.fillStyle = c.main;
      ctx.beginPath(); ctx.ellipse(0, -13, 13, 8, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = c.accent;
      ctx.beginPath(); ctx.ellipse(2, -10, 9, 5, 0, 0, TAU); ctx.fill();
      // cola
      ctx.strokeStyle = fox ? c.main : c.accent; ctx.lineWidth = fox ? 6 : 4; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(-11, -14); ctx.quadraticCurveTo(-22, -20 + Math.sin(t * 4) * 2, -20, -28 + Math.sin(t * 4) * 2); ctx.stroke();
      // cabeza
      ctx.fillStyle = c.main;
      ctx.beginPath(); ctx.ellipse(11, -21, 7, 6, 0.15, 0, TAU); ctx.fill();
      if (fox) {
        poly(ctx, [[8, -27], [9, -36], [14, -29]], c.main);
        poly(ctx, [[14, -28], [17, -36], [19, -26]], c.main);
      } else {
        poly(ctx, [[8, -26], [9, -32], [13, -27]], c.accent);
        poly(ctx, [[14, -26], [17, -32], [18, -25]], c.accent);
      }
      ctx.fillStyle = c.dark; ctx.beginPath(); ctx.ellipse(18, -20, 3.5, 2.4, 0.2, 0, TAU); ctx.fill();
      eye(10, -23, 1.4); eye(14, -23, 1.4);
      if (fox) { ctx.strokeStyle = c.glow; ctx.lineWidth = 0.8; ctx.beginPath(); ctx.moveTo(19, -18); ctx.lineTo(22, -17); ctx.stroke(); }
      break;
    }
    case 'sprout': {
      ctx.fillStyle = c.dark; ctx.beginPath(); ctx.ellipse(0, 0, 11, 5, 0, 0, TAU); ctx.fill();
      ctx.strokeStyle = c.accent; ctx.lineWidth = 4; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(1, -14, 0, -22 + bounce); ctx.stroke();
      ctx.fillStyle = c.main;
      for (const [a, sc] of [[-0.8, 1], [0.7, 0.9], [-2.2, 0.7]]) {
        ctx.save(); ctx.translate(0, -20); ctx.rotate(a); ctx.beginPath(); ctx.ellipse(7 * sc, 0, 8 * sc, 4 * sc, 0, 0, TAU); ctx.fill(); ctx.restore();
      }
      ctx.fillStyle = c.glow; ctx.beginPath(); ctx.arc(-2, -12, 1.5, 0, TAU); ctx.fill();
      ctx.beginPath(); ctx.arc(2, -12, 1.5, 0, TAU); ctx.fill();
      glow(ctx, 0, -16, 24, c.glow, 0.2);
      break;
    }
    case 'moth': {
      const flap = Math.sin(t * 9) * 0.5;
      ctx.fillStyle = c.accent; ctx.globalAlpha = 0.75;
      ctx.save(); ctx.rotate(-0.3 - flap); ctx.beginPath(); ctx.ellipse(-11, -15, 12, 7, -0.4, 0, TAU); ctx.fill(); ctx.restore();
      ctx.save(); ctx.rotate(0.3 + flap); ctx.beginPath(); ctx.ellipse(11, -15, 12, 7, 0.4, 0, TAU); ctx.fill(); ctx.restore();
      ctx.globalAlpha = 1;
      ctx.fillStyle = c.main; ctx.beginPath(); ctx.ellipse(0, -14, 4, 9, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = c.dark; ctx.beginPath(); ctx.arc(0, -22, 3.4, 0, TAU); ctx.fill();
      ctx.strokeStyle = c.main; ctx.lineWidth = 0.8;
      ctx.beginPath(); ctx.moveTo(-2, -24); ctx.quadraticCurveTo(-7, -30, -10, -27); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(2, -24); ctx.quadraticCurveTo(7, -30, 10, -27); ctx.stroke();
      glow(ctx, 0, -14, 25, c.glow, 0.3);
      break;
    }
    case 'frog': {
      ctx.fillStyle = c.main;
      ctx.beginPath(); ctx.ellipse(0, -8 + bounce * 0.6, 14, 10, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = c.accent;
      ctx.beginPath(); ctx.ellipse(0, -4, 10, 5, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = c.main;
      ctx.beginPath(); ctx.arc(-6, -18 + bounce * 0.4, 5, 0, TAU); ctx.fill();
      ctx.beginPath(); ctx.arc(6, -18 + bounce * 0.4, 5, 0, TAU); ctx.fill();
      eye(-6, -19 + bounce * 0.4, 2); eye(6, -19 + bounce * 0.4, 2);
      ctx.strokeStyle = c.dark; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(0, -10, 5, 0.15, Math.PI - 0.15); ctx.stroke();
      break;
    }
    case 'deer': {
      const leg = Math.sin(t * 4) * 1.5;
      ctx.strokeStyle = c.dark; ctx.lineWidth = 2.4;
      for (const [x, ph] of [[-7, 1], [-4, -1], [6, 1], [9, -1]]) { ctx.beginPath(); ctx.moveTo(x, -10); ctx.lineTo(x + ph * leg, 0); ctx.stroke(); }
      ctx.fillStyle = c.main; ctx.beginPath(); ctx.ellipse(0, -17, 13, 8, 0, 0, TAU); ctx.fill();
      ctx.beginPath(); ctx.ellipse(12, -27, 6, 7, 0.25, 0, TAU); ctx.fill();
      ctx.strokeStyle = c.glow; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(11, -33); ctx.lineTo(8, -44); ctx.lineTo(5, -47); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(11, -38); ctx.lineTo(15, -45); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(14, -33); ctx.lineTo(18, -42); ctx.stroke();
      eye(13, -28, 1.2); glow(ctx, 0, -18, 30, c.glow, 0.18);
      break;
    }
    case 'ember': {
      glow(ctx, 0, -14, 30, c.glow, 0.45);
      ctx.fillStyle = c.accent;
      ctx.beginPath(); ctx.moveTo(0, -34 + Math.sin(t * 6) * 2); ctx.quadraticCurveTo(12, -18, 7, -6); ctx.quadraticCurveTo(0, 2, -7, -6); ctx.quadraticCurveTo(-12, -18, 0, -34 + Math.sin(t * 6) * 2); ctx.fill();
      ctx.fillStyle = c.main;
      ctx.beginPath(); ctx.moveTo(0, -24 + Math.sin(t * 7) * 1.5); ctx.quadraticCurveTo(6, -13, 3, -6); ctx.quadraticCurveTo(0, -1, -3, -6); ctx.quadraticCurveTo(-6, -13, 0, -24 + Math.sin(t * 7) * 1.5); ctx.fill();
      eye(-2, -12, 1.1); eye(2, -12, 1.1);
      break;
    }
    case 'scorpion': {
      ctx.fillStyle = c.main; ctx.beginPath(); ctx.ellipse(0, -8, 12, 7, 0, 0, TAU); ctx.fill();
      ctx.strokeStyle = c.main; ctx.lineWidth = 3;
      for (const [x, ph] of [[-8, 1], [-5, -1], [5, 1], [8, -1]]) { ctx.beginPath(); ctx.moveTo(x, -5); ctx.lineTo(x + ph * 3, 1); ctx.stroke(); }
      ctx.beginPath(); ctx.moveTo(-9, -10); ctx.lineTo(-16, -15); ctx.lineTo(-20, -12); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(9, -10); ctx.lineTo(16, -15); ctx.lineTo(20, -12); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-2, -13); ctx.quadraticCurveTo(0, -27, 6, -24); ctx.quadraticCurveTo(10, -22, 8, -17); ctx.stroke();
      ctx.fillStyle = c.accent; ctx.beginPath(); ctx.arc(8, -18, 2.6, 0, TAU); ctx.fill();
      eye(-4, -10, 1); eye(3, -10, 1);
      break;
    }
    case 'crow': {
      const flap = Math.sin(t * 8) * 0.6;
      ctx.fillStyle = c.accent;
      ctx.save(); ctx.rotate(-0.25 - flap); ctx.beginPath(); ctx.ellipse(-9, -17, 10, 5, -0.5, 0, TAU); ctx.fill(); ctx.restore();
      ctx.save(); ctx.rotate(0.25 + flap); ctx.beginPath(); ctx.ellipse(9, -17, 10, 5, 0.5, 0, TAU); ctx.fill(); ctx.restore();
      ctx.fillStyle = c.main; ctx.beginPath(); ctx.ellipse(0, -15, 7, 9, 0, 0, TAU); ctx.fill();
      ctx.beginPath(); ctx.arc(0, -24, 4.5, 0, TAU); ctx.fill();
      ctx.fillStyle = c.glow; poly(ctx, [[3, -25], [10, -23], [3, -21]], c.glow);
      eye(-2, -25, 1); eye(2, -25, 1);
      break;
    }
    case 'salamander': {
      ctx.fillStyle = c.main; ctx.beginPath(); ctx.ellipse(0, -8, 15, 7, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = c.accent;
      ctx.beginPath(); ctx.moveTo(0, -15); ctx.quadraticCurveTo(8, -26 + Math.sin(t * 5) * 2, 15, -18); ctx.quadraticCurveTo(8, -12, 0, -15); ctx.fill();
      ctx.strokeStyle = c.main; ctx.lineWidth = 2.4;
      for (const [x, ph] of [[-9, 1], [-6, -1], [6, 1], [9, -1]]) { ctx.beginPath(); ctx.moveTo(x, -5); ctx.lineTo(x + ph * 3, 1); ctx.stroke(); }
      ctx.beginPath(); ctx.moveTo(-14, -9); ctx.quadraticCurveTo(-23, -6, -20, -2); ctx.stroke();
      ctx.fillStyle = c.main; ctx.beginPath(); ctx.arc(13, -11, 4.5, 0, TAU); ctx.fill();
      eye(14, -12, 1); eye(17, -11, 1); glow(ctx, 0, -8, 25, c.glow, 0.2);
      break;
    }
    case 'golem': case 'magma': {
      const pulse = Math.sin(t * 2) * 0.5 + 0.5;
      ctx.fillStyle = c.main;
      rr(ctx, -12, -28, 24, 28, 7); ctx.fill();
      rr(ctx, -18, -24, 7, 16, 3); ctx.fill(); rr(ctx, 11, -24, 7, 16, 3); ctx.fill();
      ctx.fillStyle = c.dark; ctx.fillRect(-9, -2, 7, 3); ctx.fillRect(2, -2, 7, 3);
      ctx.fillStyle = c.accent;
      ctx.globalAlpha = 0.55 + pulse * 0.35;
      ctx.beginPath(); ctx.moveTo(-5, -25); ctx.lineTo(-1, -16); ctx.lineTo(-5, -10); ctx.lineTo(1, -4); ctx.lineTo(-2, -1); ctx.strokeStyle = c.accent; ctx.lineWidth = 2; ctx.stroke();
      ctx.beginPath(); ctx.arc(3, -18, 2.2, 0, TAU); ctx.fill();
      ctx.globalAlpha = 1;
      eye(-4, -20, 1.5, c.glow); eye(4, -20, 1.5, c.glow);
      glow(ctx, 0, -16, 30, c.glow, 0.18);
      break;
    }
    case 'drake': {
      const flap = Math.sin(t * 4) * 0.4;
      ctx.fillStyle = c.accent;
      ctx.save(); ctx.rotate(-0.4 - flap); poly(ctx, [[-4, -22], [-26, -36], [-18, -16]], c.accent); ctx.restore();
      ctx.save(); ctx.rotate(0.4 + flap); poly(ctx, [[4, -22], [26, -36], [18, -16]], c.accent); ctx.restore();
      ctx.fillStyle = c.main; ctx.beginPath(); ctx.ellipse(0, -15, 13, 10, 0, 0, TAU); ctx.fill();
      ctx.beginPath(); ctx.ellipse(10, -27, 8, 6, 0.2, 0, TAU); ctx.fill();
      poly(ctx, [[6, -31], [4, -38], [9, -33]], c.main);
      poly(ctx, [[12, -32], [15, -39], [16, -31]], c.main);
      ctx.strokeStyle = c.main; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(-11, -15); ctx.quadraticCurveTo(-24, -18, -26, -8); ctx.stroke();
      eye(11, -29, 1.4); glow(ctx, 0, -15, 34, c.glow, 0.25);
      break;
    }
    case 'star': {
      const spin = t * 0.6;
      ctx.save(); ctx.rotate(spin);
      ctx.fillStyle = c.main; ctx.shadowColor = c.glow; ctx.shadowBlur = 18;
      ctx.beginPath();
      for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5; const r = i % 2 ? 6 : 15; ctx.lineTo(Math.cos(a) * r, -16 + Math.sin(a) * r); }
      ctx.closePath(); ctx.fill(); ctx.restore();
      glow(ctx, 0, -16, 30, c.glow, 0.4);
      break;
    }
    case 'owl': {
      ctx.fillStyle = c.main; ctx.beginPath(); ctx.ellipse(0, -15, 11, 14, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = c.accent; ctx.beginPath(); ctx.ellipse(-5, -15, 4, 7, -0.3, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.ellipse(5, -15, 4, 7, 0.3, 0, TAU); ctx.fill();
      ctx.fillStyle = c.glow; ctx.beginPath(); ctx.arc(-4, -22, 4, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.arc(4, -22, 4, 0, TAU); ctx.fill();
      ctx.fillStyle = c.dark; ctx.beginPath(); ctx.arc(-4, -22, 1.8, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.arc(4, -22, 1.8, 0, TAU); ctx.fill();
      poly(ctx, [[-2, -19], [2, -19], [0, -15]], c.accent);
      ctx.strokeStyle = c.accent; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(-10, -8); ctx.lineTo(-13, -2); ctx.stroke(); ctx.beginPath(); ctx.moveTo(10, -8); ctx.lineTo(13, -2); ctx.stroke();
      break;
    }
    case 'wraith': {
      const float = Math.sin(t * 2) * 2;
      ctx.fillStyle = c.main; ctx.globalAlpha = 0.82;
      ctx.beginPath(); ctx.moveTo(-11, -34 + float); ctx.quadraticCurveTo(0, -44 + float, 11, -34 + float); ctx.quadraticCurveTo(16, -12 + float, 8, -2 + float); ctx.quadraticCurveTo(0, 4 + float, -8, -2 + float); ctx.quadraticCurveTo(-16, -12 + float, -11, -34 + float); ctx.fill();
      ctx.globalAlpha = 1;
      ctx.fillStyle = c.dark; ctx.beginPath(); ctx.ellipse(0, -30 + float, 8, 9, 0, 0, TAU); ctx.fill();
      eye(-3, -31 + float, 1.4, c.glow); eye(3, -31 + float, 1.4, c.glow);
      glow(ctx, 0, -24 + float, 28, c.glow, 0.3);
      break;
    }
    case 'chimera': {
      ctx.fillStyle = c.main; ctx.beginPath(); ctx.ellipse(0, -13, 14, 9, 0, 0, TAU); ctx.fill();
      for (const [dx, col] of [[-9, c.accent], [0, c.main], [9, c.glow]]) {
        ctx.fillStyle = col; ctx.beginPath(); ctx.arc(dx, -25, 5.5, 0, TAU); ctx.fill();
        eye(dx - 1.5, -26, 1); eye(dx + 1.5, -26, 1);
      }
      ctx.strokeStyle = c.accent; ctx.lineWidth = 1.4;
      ctx.beginPath(); ctx.moveTo(-12, -18); ctx.lineTo(-20, -30); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(12, -18); ctx.lineTo(20, -30); ctx.stroke();
      break;
    }
    case 'seraph': {
      const flap = Math.sin(t * 3) * 0.35;
      ctx.fillStyle = c.accent; ctx.globalAlpha = 0.7;
      ctx.save(); ctx.rotate(-0.35 - flap); poly(ctx, [[-4, -30], [-28, -46], [-18, -20]], c.accent); ctx.restore();
      ctx.save(); ctx.rotate(0.35 + flap); poly(ctx, [[4, -30], [28, -46], [18, -20]], c.accent); ctx.restore();
      ctx.globalAlpha = 1;
      ctx.fillStyle = c.main; rr(ctx, -7, -34, 14, 26, 5); ctx.fill();
      ctx.beginPath(); ctx.arc(0, -39, 6, 0, TAU); ctx.fill();
      ctx.strokeStyle = c.glow; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.ellipse(0, -49, 9, 2.5, 0, 0, TAU); ctx.stroke();
      eye(-2.4, -40, 1.1); eye(2.4, -40, 1.1); glow(ctx, 0, -30, 30, c.glow, 0.28);
      break;
    }
    case 'devourer': {
      const pulse = Math.sin(t * 2.4) * 3;
      ctx.fillStyle = c.dark; ctx.beginPath(); ctx.ellipse(0, -18, 20 + pulse, 18 + pulse, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = c.main; ctx.beginPath(); ctx.ellipse(0, -18, 15, 13, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = '#05020a'; ctx.beginPath(); ctx.ellipse(0, -17, 8, 7, 0, 0, TAU); ctx.fill();
      ctx.strokeStyle = c.accent; ctx.lineWidth = 1.4;
      for (let i = 0; i < 8; i++) { const a = i / 8 * TAU; ctx.beginPath(); ctx.moveTo(Math.cos(a) * 7, -17 + Math.sin(a) * 6); ctx.lineTo(Math.cos(a) * 11, -17 + Math.sin(a) * 9); ctx.stroke(); }
      eye(-6, -26, 1.4, c.glow); eye(6, -26, 1.4, c.glow);
      glow(ctx, 0, -18, 36, c.glow, 0.3);
      break;
    }
    case 'treant': case 'guardian': {
      const big = shape === 'guardian';
      const scale = big ? 1.5 : 1;
      ctx.scale(scale, scale);
      ctx.fillStyle = c.dark;
      ctx.beginPath(); ctx.moveTo(-9, 0); ctx.lineTo(-6, -28); ctx.lineTo(6, -28); ctx.lineTo(9, 0); ctx.fill();
      ctx.fillStyle = c.main;
      ctx.beginPath(); ctx.moveTo(-7, -2); ctx.lineTo(-5, -26); ctx.lineTo(5, -26); ctx.lineTo(7, -2); ctx.fill();
      ctx.strokeStyle = c.accent; ctx.lineWidth = 3; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(-5, -22); ctx.lineTo(-18, -30); ctx.lineTo(-22, -40); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(5, -22); ctx.lineTo(18, -30); ctx.lineTo(22, -40); ctx.stroke();
      ctx.fillStyle = c.main;
      ctx.beginPath(); ctx.arc(0, -34, 11, 0, TAU); ctx.fill();
      ctx.strokeStyle = c.accent; ctx.lineWidth = 2;
      for (let i = 0; i < 5; i++) { const a = -Math.PI + i * Math.PI / 4; ctx.beginPath(); ctx.moveTo(Math.cos(a) * 7, -34 + Math.sin(a) * 7); ctx.lineTo(Math.cos(a) * 15, -34 + Math.sin(a) * 14); ctx.stroke(); }
      eye(-4, -35, 1.6, c.glow); eye(4, -35, 1.6, c.glow);
      if (big) { ctx.fillStyle = c.glow; ctx.beginPath(); ctx.arc(0, -16, 4 + Math.sin(t * 3), 0, TAU); ctx.fill(); glow(ctx, 0, -16, 18, c.glow, 0.5); }
      break;
    }
    case 'bandit': case 'cultist': case 'knight': case 'queen': case 'custodian': case 'architect': {
      const palette = {
        skin: shape === 'queen' ? '#a96f4a' : '#cf9a6a', eye: c.glow,
        hair: shape === 'queen' ? '#ff8a5c' : '#2b2233', hairHi: c.accent,
        hairStyle: shape === 'queen' ? 'largo' : 'corto',
        cloth: c.main, cloth2: c.dark, trim: c.accent, cape: shape === 'queen' || shape === 'architect',
        accessory: shape === 'queen' ? 'halo' : 'ninguno', mark: shape === 'knight' ? 'scar' : 'none',
      };
      drawHumanoid(ctx, {
        x: 0, y: 0, s: shape === 'queen' || shape === 'architect' ? 1.25 : 1, time: t, facing: o.facing || 0,
        state: o.state || 'idle', phase: o.phase || 0, stateTime: o.stateTime || 0,
        palette, weapon: shape !== 'cultist' && shape !== 'custodian', weaponLen: shape === 'queen' ? 34 : 28,
        weaponColor: c.accent, weaponGlow: c.glow, cape: shape === 'queen' || shape === 'architect',
        helmet: shape === 'knight', helmetColor: c.main,
      });
      if (shape === 'queen' || shape === 'architect') {
        ctx.fillStyle = c.accent;
        for (let i = -2; i <= 2; i++) poly(ctx, [[i * 5 - 1, -60], [i * 5 + 1, -60], [i * 5, -72 + Math.abs(i) * 4]], c.accent);
        glow(ctx, 0, -32, 30, c.glow, 0.3);
      }
      if (shape === 'custodian') {
        ctx.fillStyle = '#f2e8d2'; ctx.beginPath(); ctx.ellipse(0, -46, 8, 10, 0, 0, TAU); ctx.fill();
        ctx.fillStyle = '#2a211c'; ctx.fillRect(-5, -47, 10, 2);
      }
      break;
    }
    default: {
      ctx.fillStyle = c.main; ctx.beginPath(); ctx.ellipse(0, -12 + bounce, 13, 11, 0, 0, TAU); ctx.fill();
      eye(-4, -15, 1.4); eye(4, -15, 1.4);
    }
  }

  if (hit > 0) {
    ctx.globalAlpha = hit * 0.5; ctx.fillStyle = '#fff3e0';
    ctx.beginPath(); ctx.arc(0, -16, 18, 0, TAU); ctx.fill(); ctx.globalAlpha = 1;
  }
  ctx.restore();
}

export function drawCreature(ctx, id, x, y, s, time, facing = 0, state = 'idle') {
  const def = CREATURES[id];
  if (!def) return;
  const map = { fox: 'fox', sprout: 'sprout', moth: 'moth', frog: 'frog', wolf: 'wolf', deer: 'deer', ember: 'ember', scorpion: 'scorpion', crow: 'crow', salamander: 'salamander', golem: 'golem', drake: 'drake', star: 'star', owl: 'owl', wraith: 'wraith', chimera: 'chimera', seraph: 'seraph', devourer: 'devourer' };
  drawCreatureShape(ctx, map[def.shape] || 'slime', def.colors, { x, y, s, time, facing, state, phase: 0 });
}
