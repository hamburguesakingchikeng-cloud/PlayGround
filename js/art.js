// Arte procedural: personajes, criaturas, enemigos, escenarios y retratos.
// Sin recursos externos. Todo se dibuja con Canvas 2D para mantener una identidad propia.

import { TAU, clamp, lerp, hexToRgba } from './core.js';

export const SKIN_TONES = ['#f2c9a4', '#dda77b', '#b97d56', '#8a583b', '#5d3b2a', '#e8b48c'];
export const HAIR_COLORS = ['#2b2118', '#5a3423', '#a35d2d', '#d9b46a', '#d8d2c4', '#6d4a7a', '#3f7a78', '#b33a4a'];
export const OUTFIT_COLORS = ['#3d6fb0', '#2f7a68', '#7a3f5a', '#6b5a7a', '#8a5a2b', '#2f4a7a', '#4a6b3d', '#b08a3d'];

const rr = (ctx, x, y, w, h, r) => {
  const rad = Math.min(r, Math.abs(w) / 2, Math.abs(h) / 2);
  ctx.beginPath();
  ctx.moveTo(x + rad, y);
  ctx.arcTo(x + w, y, x + w, y + h, rad);
  ctx.arcTo(x + w, y + h, x, y + h, rad);
  ctx.arcTo(x, y + h, x, y, rad);
  ctx.arcTo(x, y, x + w, y, rad);
  ctx.closePath();
};

const ellipse = (ctx, x, y, rx, ry, fill, stroke) => {
  ctx.beginPath();
  ctx.ellipse(x, y, Math.max(0.1, rx), Math.max(0.1, ry), 0, 0, TAU);
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) { ctx.strokeStyle = stroke; ctx.stroke(); }
};

const star = (ctx, x, y, r, points = 4, inner = 0.42) => {
  ctx.beginPath();
  for (let i = 0; i < points * 2; i++) {
    const a = (i / (points * 2)) * TAU - Math.PI / 2;
    const rad = i % 2 === 0 ? r : r * inner;
    const px = x + Math.cos(a) * rad;
    const py = y + Math.sin(a) * rad;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
};

function shadow(ctx, x, y, rx, ry, alpha = 0.32) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, rx);
  g.addColorStop(0, `rgba(0,0,0,${alpha})`);
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.save();
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, TAU);
  ctx.fill();
  ctx.restore();
}

function glow(ctx, x, y, r, color, alpha = 0.6) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, hexToRgba(color, alpha));
  g.addColorStop(0.4, hexToRgba(color, alpha * 0.45));
  g.addColorStop(1, hexToRgba(color, 0));
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, TAU);
  ctx.fill();
  ctx.restore();
}

export function drawWeapon(ctx, kind, x, y, angle, scale = 1, glowColor = null) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.scale(scale, scale);
  if (glowColor) {
    ctx.shadowColor = glowColor;
    ctx.shadowBlur = 12;
  }
  const steel = ctx.createLinearGradient(0, -3, 0, 3);
  steel.addColorStop(0, '#fff8e6');
  steel.addColorStop(0.45, '#c9d3df');
  steel.addColorStop(0.55, '#7d8ba1');
  steel.addColorStop(1, '#e8eef6');
  const gold = '#e8c56a';
  if (kind === 'sword' || kind === 'celestial') {
    const len = kind === 'celestial' ? 40 : 34;
    ctx.fillStyle = '#4a3222';
    rr(ctx, -7, -2.2, 12, 4.4, 2); ctx.fill();
    ctx.fillStyle = gold;
    rr(ctx, 3, -5.5, 3.5, 11, 1.5); ctx.fill();
    ctx.fillStyle = steel;
    ctx.beginPath();
    ctx.moveTo(6, -3.2); ctx.lineTo(len - 4, -2.2); ctx.lineTo(len, 0); ctx.lineTo(len - 4, 2.2); ctx.lineTo(6, 3.2);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = kind === 'celestial' ? '#fff3c4' : '#f5f8ff';
    ctx.lineWidth = 0.8; ctx.stroke();
    if (kind === 'celestial') {
      ctx.strokeStyle = 'rgba(255,243,196,.9)';
      ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.moveTo(10, 0); ctx.lineTo(len - 4, 0); ctx.stroke();
      star(ctx, 18, 0, 2.5, 4); ctx.fillStyle = '#fff8d8'; ctx.fill();
    }
  } else if (kind === 'greatsword') {
    ctx.fillStyle = '#3b2a1e'; rr(ctx, -10, -3, 16, 6, 2); ctx.fill();
    ctx.fillStyle = '#b08a3d'; rr(ctx, 4, -8, 4, 16, 2); ctx.fill();
    ctx.fillStyle = steel;
    ctx.beginPath();
    ctx.moveTo(7, -5); ctx.lineTo(46, -3.4); ctx.lineTo(52, 0); ctx.lineTo(46, 3.4); ctx.lineTo(7, 5);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#eef4ff'; ctx.lineWidth = 1; ctx.stroke();
    ctx.fillStyle = '#7d8ba1';
    ctx.fillRect(14, -2.4, 26, 1.2);
  } else if (kind === 'daggers') {
    for (const off of [-3, 3]) {
      ctx.save();
      ctx.translate(off * 2.2, off);
      ctx.fillStyle = '#2c1d16'; rr(ctx, -5, -1.6, 8, 3.2, 1.4); ctx.fill();
      ctx.fillStyle = '#c9a25a'; rr(ctx, 2, -4, 2.6, 8, 1); ctx.fill();
      ctx.fillStyle = steel;
      ctx.beginPath(); ctx.moveTo(4, -2.3); ctx.lineTo(23, -1.1); ctx.lineTo(25, 0); ctx.lineTo(23, 1.1); ctx.lineTo(4, 2.3); ctx.closePath(); ctx.fill();
      ctx.restore();
    }
  } else if (kind === 'spear') {
    ctx.strokeStyle = '#6b4a2d'; ctx.lineWidth = 4; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-18, 0); ctx.lineTo(48, 0); ctx.stroke();
    ctx.fillStyle = '#d9c9a0'; rr(ctx, 30, -2, 6, 4, 1); ctx.fill();
    ctx.fillStyle = steel;
    ctx.beginPath(); ctx.moveTo(44, -4); ctx.lineTo(60, 0); ctx.lineTo(44, 4); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 0.7; ctx.stroke();
  } else if (kind === 'bow') {
    ctx.strokeStyle = '#7a512f'; ctx.lineWidth = 3.4;
    ctx.beginPath(); ctx.arc(4, 0, 24, -1.15, 1.15); ctx.stroke();
    ctx.strokeStyle = 'rgba(230,240,255,.75)'; ctx.lineWidth = 0.9;
    ctx.beginPath(); ctx.moveTo(13, -22); ctx.lineTo(13, 22); ctx.stroke();
    ctx.fillStyle = gold; ctx.beginPath(); ctx.arc(13, 0, 1.6, 0, TAU); ctx.fill();
  } else if (kind === 'staff') {
    ctx.strokeStyle = '#4f3b64'; ctx.lineWidth = 3.8; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-16, 2); ctx.lineTo(38, -2); ctx.stroke();
    ctx.strokeStyle = '#8b6db0'; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(-14, 1); ctx.lineTo(36, -2); ctx.stroke();
    glow(ctx, 42, -2, 18, '#9fe3ff', 0.45);
    ctx.fillStyle = '#c9f2ff';
    star(ctx, 42, -2, 7, 4, 0.38); ctx.fill();
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 1; ctx.stroke();
  }
  ctx.restore();
}

// ---------------------------------------------------------------------------
// JUGADOR
// ---------------------------------------------------------------------------

export function drawPlayer(ctx, p, t) {
  const a = p.appearance || {};
  const skin = a.skin || SKIN_TONES[0];
  const hair = a.hair || HAIR_COLORS[1];
  const outfit = p.armor?.color || a.outfit || '#3d6fb0';
  const accent = p.armor?.trim || a.accent || '#e8c56a';
  const cloak = a.cloak || '#1d3557';
  const dirX = Math.cos(p.facing || 0);
  const dirY = Math.sin(p.facing || 0);
  const flip = dirX < -0.15 ? -1 : 1;
  const moving = p.state === 'move';
  const walk = p.animTime || t;
  const bob = moving ? Math.sin(walk * 12) * 1.6 : Math.sin(t * 2.2) * 0.9;
  const legSwing = moving ? Math.sin(walk * 12) * 7 : 0;
  const attack = p.attackProgress || 0;
  const attacking = p.state === 'attack' || p.state === 'skill';
  const casting = p.state === 'cast';
  const hurt = p.hurtFlash > 0;
  const blocking = p.blocking;
  const dodge = p.state === 'dodge';
  const alpha = dodge ? 0.72 : 1;

  ctx.save();
  ctx.translate(p.x, p.y);
  shadow(ctx, 0, 2, dodge ? 28 : 24, dodge ? 8 : 10, 0.36);

  if (p.afterimages?.length) {
    for (const ai of p.afterimages) {
      ctx.save();
      ctx.globalAlpha = ai.life * 0.28;
      ctx.translate(ai.dx, ai.dy);
      ctx.scale(1, 0.95);
      drawPlayerBody(ctx, { ...p, state: 'move', attackProgress: 0 }, t, ai.life, true);
      ctx.restore();
    }
  }

  ctx.globalAlpha = alpha;
  ctx.scale(flip, 1);
  if (dodge) {
    const roll = p.dodgeTimer || 0;
    ctx.rotate(Math.sin(roll * 15) * 0.18);
  }
  if (hurt) {
    ctx.save();
    ctx.globalCompositeOperation = 'source-atop';
  }
  ctx.translate(0, bob);

  // Capa / bufanda.
  const sway = moving ? Math.sin(walk * 10) * 4 : Math.sin(t * 2) * 2;
  ctx.fillStyle = cloak;
  ctx.beginPath();
  ctx.moveTo(-9, -37);
  ctx.quadraticCurveTo(-18 + sway, -22, -13 + sway * 1.4, -2);
  ctx.lineTo(3, -5);
  ctx.quadraticCurveTo(1, -25, 9, -37);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = hexToRgba(accent, 0.4);
  ctx.lineWidth = 1;
  ctx.stroke();

  // Piernas.
  const legY = -8;
  for (const side of [-1, 1]) {
    const swing = side === -1 ? legSwing : -legSwing;
    ctx.save();
    ctx.translate(side * 5, legY);
    ctx.rotate(swing * 0.014);
    ctx.fillStyle = side === -1 ? '#2d3346' : '#394257';
    rr(ctx, -3.2, 0, 6.4, 16, 3); ctx.fill();
    ctx.fillStyle = '#242735';
    rr(ctx, -4, 13, 8, 5, 2.5); ctx.fill();
    ctx.restore();
  }

  // Torso.
  const bodyG = ctx.createLinearGradient(0, -38, 0, -8);
  bodyG.addColorStop(0, outfit);
  bodyG.addColorStop(0.55, shade(outfit, -0.18));
  bodyG.addColorStop(1, shade(outfit, -0.38));
  ctx.fillStyle = bodyG;
  rr(ctx, -11, -36, 22, 29, 7); ctx.fill();
  ctx.strokeStyle = hexToRgba(accent, 0.7);
  ctx.lineWidth = 1.3;
  ctx.stroke();

  // Correa y detalles.
  ctx.fillStyle = '#3b2a20';
  ctx.fillRect(-11, -16, 22, 4);
  ctx.fillStyle = accent;
  ctx.fillRect(-2, -16, 4, 4);
  const tier = p.armor?.tier || 1;
  if (tier >= 2) {
    ctx.fillStyle = hexToRgba('#dce6f5', 0.32);
    rr(ctx, -8, -33, 16, 12, 4); ctx.fill();
    ctx.strokeStyle = hexToRgba(accent, 0.55); ctx.stroke();
  }
  if (tier >= 3) {
    ctx.fillStyle = hexToRgba(accent, 0.8);
    ctx.beginPath(); ctx.moveTo(-11, -34); ctx.lineTo(-16, -29); ctx.lineTo(-11, -24); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(11, -34); ctx.lineTo(16, -29); ctx.lineTo(11, -24); ctx.closePath(); ctx.fill();
  }

  // Cabeza.
  ctx.save();
  ctx.translate(0, -44);
  const faceVisible = dirY > -0.45;
  ellipse(ctx, 0, 0, 10.5, 11.5, skin);
  // Orejas.
  ellipse(ctx, -10, 1, 2.2, 3.4, skin);
  ellipse(ctx, 10, 1, 2.2, 3.4, skin);
  if (faceVisible) {
    // Ojos estilo anime.
    ctx.fillStyle = '#f7f9ff';
    ellipse(ctx, -4.4, -0.5, 2.6, 2.2, '#f7f9ff');
    ellipse(ctx, 4.4, -0.5, 2.6, 2.2, '#f7f9ff');
    ctx.fillStyle = '#30486a';
    ellipse(ctx, -4.2, -0.3, 1.35, 1.6, '#30486a');
    ellipse(ctx, 4.6, -0.3, 1.35, 1.6, '#30486a');
    ctx.fillStyle = '#fff';
    ellipse(ctx, -4.7, -0.9, 0.5, 0.55, '#fff');
    ellipse(ctx, 4.1, -0.9, 0.5, 0.55, '#fff');
    ctx.strokeStyle = hexToRgba('#7a3a3a', 0.55); ctx.lineWidth = 0.7;
    ctx.beginPath(); ctx.arc(0, 3.2, 2.4, 0.15, Math.PI - 0.15); ctx.stroke();
  }
  // Pelo.
  drawHair(ctx, a.hairStyle ?? 0, hair, faceVisible, t);
  ctx.restore();

  // Brazos.
  const armSwing = moving ? Math.sin(walk * 12) * 4 : 0;
  // Brazo trasero.
  ctx.save();
  ctx.translate(-9, -30);
  ctx.rotate(-0.25 + armSwing * 0.02);
  ctx.fillStyle = shade(outfit, -0.25);
  rr(ctx, -2.6, 0, 5.2, 14, 2.6); ctx.fill();
  ellipse(ctx, 0, 14, 2.6, 2.6, skin);
  ctx.restore();

  // Brazo delantero + arma.
  let weaponAngle = 0.55;
  if (attacking) {
    const prog = attack;
    weaponAngle = -1.5 + prog * 3.2;
    if (p.weapon?.kind === 'spear') weaponAngle = -0.3 + prog * 0.9;
    if (p.weapon?.kind === 'bow' || p.weapon?.kind === 'staff') weaponAngle = -0.4 + prog * 0.4;
  } else if (casting) {
    weaponAngle = -1.1;
  } else if (blocking) {
    weaponAngle = 0.2;
  }
  ctx.save();
  ctx.translate(10, -29);
  ctx.rotate(weaponAngle + armSwing * 0.01);
  ctx.fillStyle = outfit;
  rr(ctx, -2.4, 0, 5.4, 15, 2.6); ctx.fill();
  ellipse(ctx, 0, 15, 2.8, 2.8, skin);
  const w = p.weapon;
  if (w) {
    const glowColor = w.kind === 'celestial' ? '#fff3c4' : (w.kind === 'staff' ? '#9fe3ff' : null);
    drawWeapon(ctx, w.kind, 0, 14, -0.1, w.kind === 'greatsword' ? 0.92 : 1, glowColor);
  }
  ctx.restore();

  // Escudo.
  if (p.shield) {
    ctx.save();
    ctx.translate(-13, -25);
    if (blocking) {
      ctx.translate(3, -2);
      ctx.rotate(0.1);
      glow(ctx, 0, 0, 30, '#9fe3ff', 0.35);
    } else {
      ctx.rotate(-0.45);
    }
    const sg = ctx.createLinearGradient(-8, -10, 8, 12);
    sg.addColorStop(0, '#8f6b3f');
    sg.addColorStop(0.5, '#c9a25a');
    sg.addColorStop(1, '#5e4428');
    ctx.fillStyle = sg;
    ctx.beginPath();
    ctx.moveTo(0, -10); ctx.quadraticCurveTo(9, -8, 9, 0); ctx.quadraticCurveTo(8, 10, 0, 15); ctx.quadraticCurveTo(-8, 10, -9, 0); ctx.quadraticCurveTo(-9, -8, 0, -10);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = accent; ctx.lineWidth = 1.2; ctx.stroke();
    ctx.fillStyle = hexToRgba(accent, 0.85);
    star(ctx, 0, 1, 3.2, 4, 0.4); ctx.fill();
    ctx.restore();
  }

  // Amuleto.
  if (p.accessory) {
    glow(ctx, 0, -24, 10, '#ffe6a0', 0.25);
    ctx.fillStyle = '#ffe6a0';
    star(ctx, 0, -24, 2.2, 4, 0.4); ctx.fill();
  }

  // Efectos de estado.
  if (p.burnTimer > 0) {
    for (let i = 0; i < 3; i++) {
      const ang = t * 3 + i * 2.1;
      const fx = Math.cos(ang) * 12;
      const fy = -20 - Math.abs(Math.sin(t * 6 + i)) * 18;
      glow(ctx, fx, fy, 7, '#ff8a3d', 0.4);
    }
  }
  if (p.blocking) {
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    ctx.strokeStyle = 'rgba(159,227,255,.55)';
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(0, -26, 30, -2.4, 2.4); ctx.stroke();
    ctx.restore();
  }
  if (p.hurtFlash > 0) {
    ctx.restore();
    ctx.save();
    ctx.globalCompositeOperation = 'source-atop';
    ctx.fillStyle = `rgba(255,90,100,${clamp(p.hurtFlash * 3, 0, 0.7)})`;
    ctx.fillRect(-30, -65, 60, 75);
  }

  // Arco de ataque.
  if (attacking && p.weapon && p.weapon.kind !== 'bow' && p.weapon.kind !== 'staff') {
    const prog = attack;
    const arcR = (p.weapon.range || 64) * 0.9;
    const base = p.facing;
    const sweep = p.weapon.arc || 1.5;
    const start = base - sweep / 2 - 0.6 + prog * (sweep + 1.2);
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    ctx.translate(0, -26);
    ctx.strokeStyle = p.weapon.kind === 'celestial' ? 'rgba(255,243,196,.75)' : 'rgba(230,245,255,.55)';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(0, 0, arcR, start - 0.5, start + 0.25);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,.3)';
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(0, 0, arcR - 7, start - 0.6, start + 0.3); ctx.stroke();
    ctx.restore();
  }

  ctx.restore();
}

function drawPlayerBody(ctx, p, t, alpha = 1, ghost = false) {
  const a = p.appearance || {};
  const skin = a.skin || SKIN_TONES[0];
  const outfit = p.armor?.color || a.outfit || '#3d6fb0';
  ctx.globalAlpha *= alpha;
  ctx.fillStyle = ghost ? '#8fd8ff' : outfit;
  rr(ctx, -11, -36, 22, 30, 7); ctx.fill();
  ellipse(ctx, 0, -44, 10.5, 11.5, ghost ? '#8fd8ff' : skin);
  ctx.fillStyle = ghost ? '#8fd8ff' : (a.hair || HAIR_COLORS[1]);
  ellipse(ctx, 0, -48, 11, 7, ctx.fillStyle);
}

function drawHair(ctx, style, color, faceVisible, t) {
  ctx.fillStyle = color;
  const dark = shade(color, -0.28);
  if (style === 0) {
    ctx.beginPath();
    ctx.arc(0, -2, 11.4, Math.PI * 0.92, Math.PI * 2.08);
    ctx.lineTo(9, 3);
    ctx.quadraticCurveTo(4, -1, 0, 1);
    ctx.quadraticCurveTo(-5, -1, -9, 4);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = dark;
    ctx.beginPath(); ctx.arc(-2, -4, 9, Math.PI * 1.05, Math.PI * 1.7); ctx.fill();
  } else if (style === 1) {
    ctx.beginPath();
    ctx.arc(0, -2, 11.5, Math.PI * 0.9, Math.PI * 2.1);
    ctx.lineTo(12, 18);
    ctx.quadraticCurveTo(6, 12, 5, 2);
    ctx.quadraticCurveTo(0, -1, -5, 2);
    ctx.quadraticCurveTo(-6, 14, -12, 20);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = dark;
    ctx.beginPath(); ctx.arc(0, -5, 8.5, Math.PI * 1.1, Math.PI * 1.9); ctx.fill();
  } else if (style === 2) {
    ctx.beginPath();
    ctx.arc(0, -2, 11.2, Math.PI * 0.92, Math.PI * 2.08);
    ctx.lineTo(8, 2);
    ctx.quadraticCurveTo(3, -1, -3, 1);
    ctx.lineTo(-9, 3);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = dark;
    ctx.beginPath();
    ctx.moveTo(7, -6);
    ctx.quadraticCurveTo(18, 0, 14 + Math.sin(t * 3) * 1.5, 16);
    ctx.quadraticCurveTo(11, 4, 5, 0);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#e8c56a';
    ctx.beginPath(); ctx.arc(8, -5, 2, 0, TAU); ctx.fill();
  } else if (style === 3) {
    ctx.beginPath();
    ctx.arc(0, -2, 11.4, Math.PI * 0.9, Math.PI * 2.1);
    ctx.lineTo(9, 5);
    ctx.quadraticCurveTo(3, -1, -4, 2);
    ctx.lineTo(-9, 6);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = dark;
    ctx.beginPath();
    ctx.moveTo(-8, 0);
    ctx.quadraticCurveTo(-14, 12, -10, 22);
    ctx.quadraticCurveTo(-6, 12, -3, 4);
    ctx.closePath(); ctx.fill();
  } else {
    ctx.beginPath();
    ctx.arc(0, -3, 11.6, Math.PI * 0.88, Math.PI * 2.12);
    for (let i = 0; i < 5; i++) {
      const x = 10 - i * 5;
      const y = -12 + (i % 2) * 4;
      ctx.lineTo(x, y - 7);
      ctx.lineTo(x - 2.5, y + 1);
    }
    ctx.lineTo(-10, 4);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = dark;
    ctx.beginPath(); ctx.arc(-2, -4, 8.5, Math.PI * 1.1, Math.PI * 1.85); ctx.fill();
  }
  if (!faceVisible) {
    ctx.fillStyle = shade(color, -0.12);
    ctx.beginPath(); ctx.arc(0, 1, 10.6, 0, Math.PI); ctx.fill();
  }
}

export function shade(hex, amount) {
  if (!hex || hex[0] !== '#') return hex;
  const h = hex.length === 4 ? '#' + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3] : hex;
  const n = parseInt(h.slice(1), 16);
  const f = (v) => clamp(Math.round(v + 255 * amount), 0, 255);
  return `rgb(${f((n >> 16) & 255)},${f((n >> 8) & 255)},${f(n & 255)})`;
}

// ---------------------------------------------------------------------------
// ENEMIGOS
// ---------------------------------------------------------------------------

export function drawEnemy(ctx, e, t) {
  const k = e.kind;
  const facing = Math.cos(e.facing || 0) < 0 ? -1 : 1;
  const hurt = e.hurtFlash > 0;
  ctx.save();
  ctx.translate(e.x, e.y);
  if (k === 'slime') {
    const hop = Math.abs(Math.sin((e.animTime || t) * 4 + e.seed)) * 6;
    shadow(ctx, 0, 2, 24, 8, 0.3);
    ctx.translate(0, -hop);
    const squash = 1 + Math.sin((e.animTime || t) * 4 + e.seed) * 0.08;
    ctx.scale(1 / squash, squash);
    const g = ctx.createRadialGradient(-6, -22, 2, 0, -12, 28);
    g.addColorStop(0, hexToRgba(e.color || '#74d6a0', 0.95));
    g.addColorStop(0.55, hexToRgba(e.color || '#74d6a0', 0.7));
    g.addColorStop(1, hexToRgba(shade(e.color || '#74d6a0', -0.3), 0.5));
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(0, -13, 24, 19, 0, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = 'rgba(230,255,240,.35)'; ctx.lineWidth = 1.2; ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,.4)';
    ellipse(ctx, -8, -23, 6, 3.4, 'rgba(255,255,255,.4)');
    // Núcleo.
    glow(ctx, 0, -12, 12, '#b9ffd6', 0.35);
    ctx.fillStyle = '#d8ffe8';
    star(ctx, 0, -12, 4, 4, 0.4); ctx.fill();
    // Ojos.
    ctx.fillStyle = '#163a2b';
    ellipse(ctx, -7, -16, 2.3, 2.8, '#163a2b');
    ellipse(ctx, 7, -16, 2.3, 2.8, '#163a2b');
    ctx.fillStyle = '#fff';
    ellipse(ctx, -7.6, -17, 0.8, 0.9, '#fff');
    ellipse(ctx, 6.4, -17, 0.8, 0.9, '#fff');
    // Boca.
    ctx.strokeStyle = '#163a2b'; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.arc(0, -8, 3.5, 0.15, Math.PI - 0.15); ctx.stroke();
    if (e.state === 'attack') {
      ctx.fillStyle = 'rgba(180,255,210,.5)';
      ellipse(ctx, 0, -9, 5, 3, 'rgba(180,255,210,.5)');
    }
  } else if (k === 'wolf') {
    const run = e.state === 'chase' || e.state === 'move' ? Math.sin((e.animTime || t) * 14) : 0;
    shadow(ctx, 0, 2, 30, 9, 0.34);
    ctx.scale(facing, 1);
    // Cola.
    ctx.strokeStyle = shade(e.color || '#b98b68', -0.15); ctx.lineWidth = 4; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-22, -22); ctx.quadraticCurveTo(-35, -28 + Math.sin(t * 5) * 3, -32, -36); ctx.stroke();
    // Patas.
    for (let i = 0; i < 4; i++) {
      const x = -16 + i * 10;
      const sw = i % 2 === 0 ? run : -run;
      ctx.strokeStyle = '#5e4634'; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.moveTo(x, -16); ctx.lineTo(x + sw * 4, -2); ctx.stroke();
    }
    // Cuerpo.
    const bg = ctx.createLinearGradient(0, -38, 0, -12);
    bg.addColorStop(0, e.color || '#b98b68');
    bg.addColorStop(0.6, shade(e.color || '#b98b68', -0.16));
    bg.addColorStop(1, '#5c4030');
    ctx.fillStyle = bg;
    ctx.beginPath();
    ctx.ellipse(-2, -25, 24, 12, -0.05, 0, TAU);
    ctx.fill();
    // Melena de brasas.
    ctx.fillStyle = '#4a3326';
    for (let i = 0; i < 6; i++) {
      const x = -20 + i * 7;
      const h = 8 + (i % 3) * 4;
      ctx.beginPath(); ctx.moveTo(x, -33); ctx.lineTo(x + 4, -33 - h); ctx.lineTo(x + 7, -31); ctx.closePath(); ctx.fill();
    }
    for (let i = 0; i < 3; i++) {
      const fx = -10 + i * 12;
      const fy = -38 - Math.sin(t * 4 + i) * 4;
      glow(ctx, fx, fy, 6, '#ff8a3d', 0.35);
    }
    // Cabeza.
    ctx.fillStyle = shade(e.color || '#b98b68', 0.05);
    ctx.beginPath();
    ctx.moveTo(15, -33); ctx.quadraticCurveTo(28, -34, 30, -26); ctx.quadraticCurveTo(25, -20, 16, -22); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#4a3326';
    ctx.beginPath(); ctx.moveTo(17, -34); ctx.lineTo(22, -44); ctx.lineTo(25, -33); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(23, -34); ctx.lineTo(28, -42); ctx.lineTo(29, -32); ctx.closePath(); ctx.fill();
    // Ojos.
    glow(ctx, 24, -28, 7, '#ffb35a', 0.5);
    ctx.fillStyle = '#ffe6a0';
    ellipse(ctx, 24, -28, 2.2, 1.5, '#ffe6a0');
    // Fauces.
    ctx.strokeStyle = '#2b1d18'; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(29, -24); ctx.lineTo(23, -23); ctx.stroke();
    if (e.state === 'attack') {
      ctx.fillStyle = 'rgba(255,180,90,.35)';
      ctx.beginPath(); ctx.moveTo(25, -22); ctx.lineTo(38, -17); ctx.lineTo(26, -14); ctx.closePath(); ctx.fill();
    }
  } else if (k === 'beetle') {
    const leg = Math.sin((e.animTime || t) * 10) * 2;
    shadow(ctx, 0, 2, 30, 10, 0.38);
    ctx.scale(facing, 1);
    for (let i = 0; i < 3; i++) {
      for (const side of [-1, 1]) {
        ctx.strokeStyle = '#4f4438'; ctx.lineWidth = 3.4;
        ctx.beginPath();
        ctx.moveTo(-6 + i * 10, -12);
        ctx.lineTo(-14 + i * 12 + side * leg, -2 + side * 2);
        ctx.stroke();
      }
    }
    const g = ctx.createLinearGradient(0, -38, 0, -10);
    g.addColorStop(0, e.color || '#a8967d');
    g.addColorStop(0.55, shade(e.color || '#a8967d', -0.15));
    g.addColorStop(1, '#5e5142');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(0, -22, 25, 17, 0, 0, TAU); ctx.fill();
    ctx.strokeStyle = '#d8cbb4'; ctx.lineWidth = 1.2; ctx.stroke();
    // Placas.
    ctx.strokeStyle = 'rgba(60,50,40,.7)'; ctx.lineWidth = 1;
    for (let i = -2; i <= 2; i++) {
      ctx.beginPath(); ctx.ellipse(0, -22, 25, 17, 0, -0.5 + i * 0.18, 0.5 + i * 0.18); ctx.stroke();
    }
    // Runa.
    glow(ctx, 0, -24, 11, '#ffe6a0', 0.25);
    ctx.strokeStyle = '#ffe6a0'; ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.moveTo(0, -30); ctx.lineTo(5, -24); ctx.lineTo(0, -18); ctx.lineTo(-5, -24); ctx.closePath(); ctx.stroke();
    // Cabeza y cuerno.
    ctx.fillStyle = shade(e.color || '#a8967d', -0.2);
    ctx.beginPath(); ctx.ellipse(19, -20, 8, 7, 0, 0, TAU); ctx.fill();
    ctx.strokeStyle = '#d8cbb4'; ctx.lineWidth = 3; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(24, -24); ctx.quadraticCurveTo(38, -32, 34, -42); ctx.stroke();
    ctx.fillStyle = '#ffcf5a';
    ellipse(ctx, 21, -22, 1.8, 1.4, '#ffcf5a');
    if (e.state === 'attack') {
      ctx.fillStyle = 'rgba(255,207,90,.22)';
      ctx.beginPath(); ctx.ellipse(0, -20, 36, 26, 0, 0, TAU); ctx.fill();
    }
  } else if (k === 'wraith') {
    const float = Math.sin(t * 2.4 + (e.seed || 0)) * 4;
    shadow(ctx, 0, 2, 22, 7, 0.2);
    ctx.translate(0, float);
    glow(ctx, 0, -28, 34, e.color || '#9fb8ff', 0.18);
    const g = ctx.createLinearGradient(0, -48, 0, 4);
    g.addColorStop(0, hexToRgba(e.color || '#9fb8ff', 0.85));
    g.addColorStop(0.55, hexToRgba(shade(e.color || '#9fb8ff', -0.35), 0.7));
    g.addColorStop(1, 'rgba(20,25,45,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(-12, -44);
    ctx.quadraticCurveTo(-24, -30, -18, -4);
    for (let i = 0; i < 4; i++) {
      const x = -18 + i * 12;
      ctx.quadraticCurveTo(x + 4, -12 + Math.sin(t * 4 + i) * 5, x + 8, 0);
    }
    ctx.quadraticCurveTo(20, -26, 12, -44);
    ctx.closePath(); ctx.fill();
    // Capucha.
    ctx.fillStyle = shade(e.color || '#9fb8ff', -0.55);
    ctx.beginPath();
    ctx.arc(0, -42, 12, Math.PI, TAU);
    ctx.lineTo(12, -32); ctx.lineTo(-12, -32); ctx.closePath(); ctx.fill();
    // Ojos.
    glow(ctx, -4.5, -38, 7, '#bff3ff', 0.6);
    glow(ctx, 4.5, -38, 7, '#bff3ff', 0.6);
    ctx.fillStyle = '#d8fbff';
    ellipse(ctx, -4.5, -38, 1.6, 2.1, '#d8fbff');
    ellipse(ctx, 4.5, -38, 1.6, 2.1, '#d8fbff');
    // Manos.
    ctx.strokeStyle = hexToRgba(e.color || '#9fb8ff', 0.6); ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(-13, -30); ctx.quadraticCurveTo(-22, -22, -17, -16); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(13, -30); ctx.quadraticCurveTo(22, -22, 17, -16); ctx.stroke();
    if (e.state === 'attack') {
      glow(ctx, 0, -26, 22, '#9fb8ff', 0.5);
      ctx.fillStyle = '#d8fbff';
      star(ctx, 0, -26, 7, 4, 0.35); ctx.fill();
    }
  } else if (k === 'guardian') {
    shadow(ctx, 0, 2, 42, 14, 0.4);
    ctx.scale(facing, 1);
    const float = Math.sin(t * 1.6) * 2;
    ctx.translate(0, float);
    // Aura corrupta.
    glow(ctx, 0, -36, 55, e.color || '#8f7ac9', 0.2);
    // Capa.
    ctx.fillStyle = '#2b2140';
    ctx.beginPath();
    ctx.moveTo(-20, -58); ctx.quadraticCurveTo(-38, -30, -30, 4); ctx.lineTo(4, 0); ctx.quadraticCurveTo(0, -34, 18, -58); ctx.closePath(); ctx.fill();
    // Piernas.
    for (const s of [-1, 1]) {
      ctx.fillStyle = '#4a4358'; rr(ctx, s * 8 - 6, -26, 12, 28, 4); ctx.fill();
      ctx.fillStyle = '#2d2938'; rr(ctx, s * 8 - 7, -4, 14, 7, 3); ctx.fill();
    }
    // Torso.
    const g = ctx.createLinearGradient(0, -62, 0, -20);
    g.addColorStop(0, '#7a6a9a'); g.addColorStop(0.5, '#4a405e'); g.addColorStop(1, '#2d2938');
    ctx.fillStyle = g;
    rr(ctx, -20, -62, 40, 42, 9); ctx.fill();
    ctx.strokeStyle = '#b9a6e8'; ctx.lineWidth = 1.4; ctx.stroke();
    // Hombreras.
    for (const s of [-1, 1]) {
      ctx.fillStyle = '#5e5078';
      ctx.beginPath(); ctx.ellipse(s * 21, -56, 10, 8, 0, 0, TAU); ctx.fill();
      ctx.strokeStyle = '#c9b6ff'; ctx.lineWidth = 1; ctx.stroke();
    }
    // Yelmo.
    ctx.fillStyle = '#3b344d';
    ctx.beginPath(); ctx.arc(0, -70, 13, Math.PI, TAU); ctx.lineTo(13, -60); ctx.lineTo(-13, -60); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#14121c';
    ctx.fillRect(-10, -70, 20, 5);
    glow(ctx, 0, -68, 12, '#c9a6ff', 0.7);
    ctx.fillStyle = '#e0d4ff';
    ellipse(ctx, -4, -67.5, 1.6, 1.8, '#e0d4ff');
    ellipse(ctx, 4, -67.5, 1.6, 1.8, '#e0d4ff');
    // Cuernos.
    ctx.strokeStyle = '#b9a6e8'; ctx.lineWidth = 3; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-11, -80); ctx.quadraticCurveTo(-22, -92, -14, -98); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(11, -80); ctx.quadraticCurveTo(22, -92, 14, -98); ctx.stroke();
    // Halo roto.
    ctx.save();
    ctx.translate(0, -92); ctx.rotate(Math.sin(t) * 0.06);
    ctx.strokeStyle = 'rgba(201,166,255,.5)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(0, 0, 18, 0.2, 2.6); ctx.stroke();
    ctx.beginPath(); ctx.arc(0, 0, 18, 3.4, 5.9); ctx.stroke();
    ctx.restore();
    // Espada.
    ctx.save();
    ctx.translate(26, -38);
    ctx.rotate(0.6 + Math.sin(t * 1.5) * 0.05);
    drawWeapon(ctx, 'greatsword', 0, 0, 0, 1.05, '#c9a6ff');
    ctx.restore();
    // Escudo.
    ctx.save();
    ctx.translate(-26, -40);
    ctx.fillStyle = '#3a3150';
    ctx.beginPath(); ctx.moveTo(0, -15); ctx.quadraticCurveTo(13, -12, 13, 0); ctx.quadraticCurveTo(12, 16, 0, 22); ctx.quadraticCurveTo(-12, 16, -13, 0); ctx.quadraticCurveTo(-13, -12, 0, -15); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#c9b6ff'; ctx.lineWidth = 1.2; ctx.stroke();
    glow(ctx, 0, 2, 12, '#c9a6ff', 0.3);
    ctx.restore();
    if (e.state === 'attack') {
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      ctx.strokeStyle = 'rgba(201,166,255,.55)'; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.arc(0, -34, 66, -0.8, 0.9); ctx.stroke();
      ctx.restore();
    }
  } else if (k === 'boss') {
    drawBoss(ctx, e, t, facing);
  }

  if (hurt) {
    ctx.save();
    ctx.globalCompositeOperation = 'source-atop';
    ctx.fillStyle = 'rgba(255,255,255,.75)';
    ctx.fillRect(-60, -120, 120, 125);
    ctx.restore();
  }
  ctx.restore();
}

function drawBoss(ctx, e, t, facing) {
  const phase = e.phase || 1;
  const auraColor = phase === 1 ? '#e8c56a' : phase === 2 ? '#c9a6ff' : '#ff6b6b';
  shadow(ctx, 0, 4, 60, 18, 0.45);
  ctx.scale(facing, 1);
  const float = Math.sin(t * 1.4) * 3;
  ctx.translate(0, float);
  glow(ctx, 0, -60, 100, auraColor, 0.22 + Math.sin(t * 3) * 0.04);
  // Alas.
  for (const s of [-1, 1]) {
    ctx.save();
    ctx.scale(s, 1);
    ctx.fillStyle = phase >= 2 ? '#3a2b52' : '#d8c79a';
    ctx.globalAlpha = 0.9;
    ctx.beginPath();
    ctx.moveTo(18, -72);
    ctx.quadraticCurveTo(58, -100, 74, -66);
    ctx.quadraticCurveTo(52, -62, 58, -42);
    ctx.quadraticCurveTo(40, -52, 24, -42);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = auraColor; ctx.lineWidth = 1.4; ctx.stroke();
    // Plumas.
    ctx.strokeStyle = hexToRgba(auraColor, 0.35); ctx.lineWidth = 1;
    for (let i = 0; i < 4; i++) {
      ctx.beginPath(); ctx.moveTo(26 + i * 9, -60); ctx.lineTo(40 + i * 7, -78 + i * 5); ctx.stroke();
    }
    ctx.restore();
  }
  // Capa.
  ctx.fillStyle = phase >= 2 ? '#2a1d3b' : '#6b3f3a';
  ctx.beginPath();
  ctx.moveTo(-26, -84); ctx.quadraticCurveTo(-52, -40, -38, 6); ctx.lineTo(8, 2); ctx.quadraticCurveTo(2, -46, 26, -84); ctx.closePath(); ctx.fill();
  // Piernas.
  for (const s of [-1, 1]) {
    ctx.fillStyle = '#5e5548'; rr(ctx, s * 12 - 8, -38, 16, 40, 5); ctx.fill();
    ctx.fillStyle = '#3a332c'; rr(ctx, s * 12 - 10, -4, 20, 8, 4); ctx.fill();
  }
  // Torso.
  const g = ctx.createLinearGradient(0, -92, 0, -34);
  g.addColorStop(0, phase >= 2 ? '#8f7ac9' : '#e8d7a8');
  g.addColorStop(0.5, phase >= 2 ? '#4a3568' : '#b08a4d');
  g.addColorStop(1, '#3a332c');
  ctx.fillStyle = g;
  rr(ctx, -27, -92, 54, 60, 12); ctx.fill();
  ctx.strokeStyle = auraColor; ctx.lineWidth = 2; ctx.stroke();
  // Detalles.
  ctx.fillStyle = auraColor;
  star(ctx, 0, -64, 9, 4, 0.38); ctx.fill();
  glow(ctx, 0, -64, 20, auraColor, 0.5);
  // Hombreras.
  for (const s of [-1, 1]) {
    ctx.fillStyle = '#b08a4d';
    ctx.beginPath(); ctx.ellipse(s * 29, -84, 14, 11, 0, 0, TAU); ctx.fill();
    ctx.strokeStyle = auraColor; ctx.lineWidth = 1.4; ctx.stroke();
    ctx.fillStyle = auraColor;
    star(ctx, s * 29, -86, 3.5, 4, 0.4); ctx.fill();
  }
  // Yelmo.
  ctx.fillStyle = '#c9b58a';
  ctx.beginPath(); ctx.arc(0, -103, 17, Math.PI, TAU); ctx.lineTo(17, -92); ctx.lineTo(-17, -92); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#14121c'; ctx.fillRect(-13, -103, 26, 7);
  glow(ctx, 0, -100, 18, auraColor, 0.75);
  ctx.fillStyle = '#fff3c4';
  ellipse(ctx, -5, -99, 2.2, 2.6, '#fff3c4');
  ellipse(ctx, 5, -99, 2.2, 2.6, '#fff3c4');
  // Corona/halo.
  ctx.save();
  ctx.translate(0, -126); ctx.rotate(Math.sin(t * 0.8) * 0.08);
  ctx.strokeStyle = auraColor; ctx.lineWidth = 2.5;
  ctx.beginPath(); ctx.arc(0, 0, 25, 0, TAU); ctx.stroke();
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * TAU + t * 0.15;
    ctx.fillStyle = auraColor;
    star(ctx, Math.cos(a) * 25, Math.sin(a) * 25, 3.2, 4, 0.4); ctx.fill();
  }
  ctx.restore();
  // Espada enorme.
  ctx.save();
  ctx.translate(34, -54);
  ctx.rotate(0.5 + Math.sin(t * 1.2) * 0.04);
  drawWeapon(ctx, 'greatsword', 0, 0, 0, 1.55, auraColor);
  ctx.restore();
  // Escudo.
  ctx.save();
  ctx.translate(-36, -52);
  ctx.fillStyle = phase >= 2 ? '#3a2b52' : '#8a6a3f';
  ctx.beginPath(); ctx.moveTo(0, -22); ctx.quadraticCurveTo(20, -17, 20, 2); ctx.quadraticCurveTo(18, 24, 0, 32); ctx.quadraticCurveTo(-18, 24, -20, 2); ctx.quadraticCurveTo(-20, -17, 0, -22); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = auraColor; ctx.lineWidth = 2; ctx.stroke();
  glow(ctx, 0, 4, 18, auraColor, 0.35);
  star(ctx, 0, 4, 7, 4, 0.4); ctx.fillStyle = auraColor; ctx.fill();
  ctx.restore();
  if (e.state === 'attack') {
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    ctx.strokeStyle = hexToRgba(auraColor, 0.6); ctx.lineWidth = 6;
    ctx.beginPath(); ctx.arc(0, -50, 95, -0.9, 0.9); ctx.stroke();
    ctx.restore();
  }
}

// ---------------------------------------------------------------------------
// NPC
// ---------------------------------------------------------------------------

export function drawNPC(ctx, n, t) {
  const skin = n.skin || SKIN_TONES[1];
  const robe = n.color || '#8a5a2b';
  const accent = n.accent || '#e8c56a';
  ctx.save();
  ctx.translate(n.x, n.y);
  shadow(ctx, 0, 2, 22, 8, 0.28);
  const bob = Math.sin(t * 1.8 + (n.seed || 0)) * 1.1;
  ctx.translate(0, bob);
  // Túnica.
  const g = ctx.createLinearGradient(0, -38, 0, 0);
  g.addColorStop(0, robe);
  g.addColorStop(1, shade(robe, -0.35));
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(-11, -34); ctx.lineTo(11, -34); ctx.quadraticCurveTo(16, -12, 13, 0); ctx.lineTo(-13, 0); ctx.quadraticCurveTo(-16, -12, -11, -34);
  ctx.closePath(); ctx.fill();
  ctx.strokeStyle = hexToRgba(accent, 0.6); ctx.lineWidth = 1.2; ctx.stroke();
  // Brazos.
  ctx.strokeStyle = robe; ctx.lineWidth = 5; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(-9, -28); ctx.lineTo(-14, -12); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(9, -28); ctx.lineTo(14, -12); ctx.stroke();
  ctx.fillStyle = skin;
  ellipse(ctx, -14, -10, 2.6, 2.6, skin);
  ellipse(ctx, 14, -10, 2.6, 2.6, skin);
  // Cabeza.
  ellipse(ctx, 0, -43, 10, 10.5, skin);
  // Pelo / capucha.
  ctx.fillStyle = n.hair || '#6b4a32';
  if (n.hat === 'hood') {
    ctx.beginPath(); ctx.arc(0, -44, 13, Math.PI * 0.9, Math.PI * 2.1); ctx.lineTo(12, -32); ctx.lineTo(-12, -32); ctx.closePath(); ctx.fill();
  } else if (n.hat === 'hat') {
    ctx.beginPath(); ctx.arc(0, -47, 11, Math.PI, TAU); ctx.fill();
    ctx.fillStyle = accent;
    ctx.beginPath(); ctx.ellipse(0, -46, 17, 4, 0, 0, TAU); ctx.fill();
  } else {
    ctx.beginPath(); ctx.arc(0, -45, 10.5, Math.PI * 0.9, Math.PI * 2.1); ctx.lineTo(9, -38); ctx.quadraticCurveTo(0, -41, -9, -38); ctx.closePath(); ctx.fill();
  }
  // Ojos.
  ctx.fillStyle = '#2b2118';
  ellipse(ctx, -3.6, -43, 1.2, 1.5, '#2b2118');
  ellipse(ctx, 3.6, -43, 1.2, 1.5, '#2b2118');
  // Detalle de oficio.
  if (n.job === 'smith') {
    ctx.strokeStyle = '#6b4a2d'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(14, -16); ctx.lineTo(23, -28); ctx.stroke();
    ctx.fillStyle = '#9aa6b8';
    rr(ctx, 20, -33, 8, 5, 1); ctx.fill();
  } else if (n.job === 'merchant') {
    ctx.fillStyle = '#b08a3d';
    rr(ctx, -16, -12, 10, 12, 2); ctx.fill();
  } else if (n.job === 'child') {
    ctx.scale(0.78, 0.78);
  } else if (n.job === 'hunter') {
    ctx.strokeStyle = '#6b4a2d'; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.arc(16, -22, 10, -1.2, 1.2); ctx.stroke();
  } else if (n.job === 'spirit') {
    ctx.globalAlpha = 0.55;
    glow(ctx, 0, -30, 34, '#9fe3ff', 0.4);
    ctx.fillStyle = '#c9f2ff';
    star(ctx, 0, -30, 5, 4, 0.4); ctx.fill();
  }
  ctx.restore();
}

// ---------------------------------------------------------------------------
// PROPS / ESCENARIO
// ---------------------------------------------------------------------------

export function drawProp(ctx, p, t, game) {
  const type = p.type;
  ctx.save();
  ctx.translate(p.x, p.y);
  if (p.scale) ctx.scale(p.scale, p.scale);
  switch (type) {
    case 'tree': drawTree(ctx, p, t); break;
    case 'pine': drawPine(ctx, p, t); break;
    case 'house': drawHouse(ctx, p, t); break;
    case 'rock': drawRock(ctx, p, t); break;
    case 'pillar': drawPillar(ctx, p, t); break;
    case 'crystal': drawCrystal(ctx, p, t); break;
    case 'torch': drawTorch(ctx, p, t); break;
    case 'fence': drawFence(ctx, p, t); break;
    case 'well': drawWell(ctx, p, t); break;
    case 'statue': drawStatue(ctx, p, t); break;
    case 'shrine': drawShrine(ctx, p, t, game); break;
    case 'chest': drawChest(ctx, p, t, game); break;
    case 'portal': drawPortal(ctx, p, t, game); break;
    case 'rune': drawRune(ctx, p, t, game); break;
    case 'altar': drawAltar(ctx, p, t, game); break;
    case 'barrier': drawBarrier(ctx, p, t, game); break;
    case 'mushroom': drawMushroom(ctx, p, t); break;
    case 'bush': drawBush(ctx, p, t); break;
    case 'log': drawLog(ctx, p, t); break;
    case 'bones': drawBones(ctx, p, t); break;
    case 'banner': drawBanner(ctx, p, t); break;
    case 'campfire': drawCampfire(ctx, p, t); break;
    case 'tent': drawTent(ctx, p, t); break;
    case 'gravestone': drawGravestone(ctx, p, t); break;
    case 'sign': drawSign(ctx, p, t); break;
    case 'loreStone': drawLoreStone(ctx, p, t); break;
    case 'echo': drawEcho(ctx, p, t, game); break;
    case 'firefly': drawFirefly(ctx, p, t, game); break;
    case 'debris': drawDebris(ctx, p, t); break;
    case 'bridge': drawBridge(ctx, p, t); break;
    case 'arch': drawArch(ctx, p, t); break;
    case 'throne': drawThrone(ctx, p, t); break;
    case 'cloud': drawCloud(ctx, p, t); break;
    default: break;
  }
  ctx.restore();
}

function drawTree(ctx, p, t) {
  const s = p.scale || 1;
  const sway = Math.sin(t * 0.7 + (p.seed || 0)) * 2.2;
  shadow(ctx, 0, 2, 34 * s, 11 * s, 0.26);
  // Raíces.
  ctx.strokeStyle = '#3b2a1d'; ctx.lineWidth = 5 * s; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(-6 * s, -6 * s); ctx.lineTo(-16 * s, 3 * s); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(6 * s, -6 * s); ctx.lineTo(17 * s, 2 * s); ctx.stroke();
  // Tronco.
  const tg = ctx.createLinearGradient(-8, 0, 8, 0);
  tg.addColorStop(0, '#3a281c'); tg.addColorStop(0.5, '#6b4a30'); tg.addColorStop(1, '#2e2017');
  ctx.fillStyle = tg;
  ctx.beginPath();
  ctx.moveTo(-8 * s, 0);
  ctx.quadraticCurveTo(-5 * s, -40 * s, -3 * s + sway, -72 * s);
  ctx.lineTo(4 * s + sway, -72 * s);
  ctx.quadraticCurveTo(5 * s, -36 * s, 8 * s, 0);
  ctx.closePath(); ctx.fill();
  // Copa.
  const c1 = p.color || '#2f6b4f';
  const c2 = shade(c1, 0.16);
  const c3 = shade(c1, -0.24);
  const cx = sway;
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * TAU + (p.seed || 0);
    const rx = 24 * s + (i % 2) * 9 * s;
    const ry = 18 * s + (i % 3) * 5 * s;
    const x = cx + Math.cos(a) * 20 * s;
    const y = -78 * s + Math.sin(a) * 10 * s;
    const g = ctx.createRadialGradient(x - 5, y - 6, 2, x, y, rx);
    g.addColorStop(0, c2); g.addColorStop(0.6, c1); g.addColorStop(1, c3);
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.ellipse(x, y, rx, ry, a, 0, TAU); ctx.fill();
  }
  // Luces.
  if (p.glow) {
    glow(ctx, cx, -80 * s, 38 * s, p.glow, 0.18);
    for (let i = 0; i < 3; i++) {
      const a = t * 1.4 + i * 2.2;
      glow(ctx, cx + Math.cos(a) * 18 * s, -82 * s + Math.sin(a) * 10 * s, 4, p.glow, 0.4);
    }
  }
}

function drawPine(ctx, p, t) {
  const s = p.scale || 1;
  const sway = Math.sin(t * 0.6 + (p.seed || 0)) * 1.5;
  shadow(ctx, 0, 2, 26 * s, 9 * s, 0.25);
  ctx.fillStyle = '#3b2a1d';
  ctx.fillRect(-4 * s, -18 * s, 8 * s, 20 * s);
  for (let i = 0; i < 4; i++) {
    const y = -24 * s - i * 16 * s;
    const w = (30 - i * 5) * s;
    const g = ctx.createLinearGradient(-w, y, w, y);
    g.addColorStop(0, '#1f4a3a'); g.addColorStop(0.5, p.color || '#2f6b4f'); g.addColorStop(1, '#183a2e');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(-w + sway, y);
    ctx.lineTo(0 + sway * 0.5, y - 24 * s);
    ctx.lineTo(w + sway, y);
    ctx.closePath(); ctx.fill();
  }
}

function drawHouse(ctx, p, t) {
  const w = p.w || 230;
  const h = p.h || 150;
  const s = p.scale || 1;
  ctx.scale(s, s);
  shadow(ctx, 0, 4, w * 0.55, 20, 0.32);
  // Base.
  const wg = ctx.createLinearGradient(0, -h, 0, 0);
  wg.addColorStop(0, p.wall || '#d8c7a2'); wg.addColorStop(1, '#8f7a5a');
  ctx.fillStyle = wg;
  rr(ctx, -w / 2, -h, w, h, 4); ctx.fill();
  // Entramado.
  ctx.strokeStyle = '#5a402b'; ctx.lineWidth = 5;
  ctx.beginPath(); ctx.moveTo(-w / 2, -h * 0.6); ctx.lineTo(w / 2, -h * 0.6); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-w / 2, -h * 0.25); ctx.lineTo(w / 2, -h * 0.25); ctx.stroke();
  for (let i = -2; i <= 2; i++) {
    ctx.beginPath(); ctx.moveTo(i * w / 5, -h); ctx.lineTo(i * w / 5, 0); ctx.stroke();
  }
  // Tejado.
  const rg = ctx.createLinearGradient(0, -h - 70, 0, -h + 10);
  rg.addColorStop(0, p.roof || '#8a3f3f'); rg.addColorStop(0.6, shade(p.roof || '#8a3f3f', -0.18)); rg.addColorStop(1, '#4a2528');
  ctx.fillStyle = rg;
  ctx.beginPath();
  ctx.moveTo(-w / 2 - 22, -h + 8);
  ctx.lineTo(-w / 2 + 14, -h - 64);
  ctx.lineTo(w / 2 - 14, -h - 64);
  ctx.lineTo(w / 2 + 22, -h + 8);
  ctx.closePath(); ctx.fill();
  ctx.strokeStyle = '#3a2022'; ctx.lineWidth = 3; ctx.stroke();
  // Tejas.
  ctx.strokeStyle = 'rgba(40,20,20,.35)'; ctx.lineWidth = 1;
  for (let i = 0; i < 5; i++) {
    const y = -h - 54 + i * 12;
    ctx.beginPath(); ctx.moveTo(-w / 2 + 4 + i * 3, y); ctx.lineTo(w / 2 - 4 - i * 3, y); ctx.stroke();
  }
  // Puerta.
  ctx.fillStyle = '#4a3222';
  rr(ctx, -18, -52, 36, 52, 3); ctx.fill();
  ctx.strokeStyle = '#2b1d16'; ctx.lineWidth = 2; ctx.stroke();
  ctx.fillStyle = '#e8c56a';
  ellipse(ctx, 10, -26, 2, 2, '#e8c56a');
  // Ventanas.
  for (const wx of [-w * 0.3, w * 0.3]) {
    const lit = p.lit !== false;
    ctx.fillStyle = lit ? '#ffcf6a' : '#3a4a5a';
    rr(ctx, wx - 14, -h + 26, 28, 26, 3); ctx.fill();
    if (lit) glow(ctx, wx, -h + 39, 24, '#ffcf6a', 0.3);
    ctx.strokeStyle = '#5a402b'; ctx.lineWidth = 3; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(wx, -h + 26); ctx.lineTo(wx, -h + 52); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(wx - 14, -h + 39); ctx.lineTo(wx + 14, -h + 39); ctx.stroke();
  }
  // Chimenea.
  if (p.chimney !== false) {
    ctx.fillStyle = '#6b5a4a';
    ctx.fillRect(w * 0.26, -h - 78, 20, 34);
    ctx.fillStyle = '#4a3a2e';
    ctx.fillRect(w * 0.26 - 3, -h - 82, 26, 6);
    for (let i = 0; i < 3; i++) {
      const smoke = (t * 0.25 + i * 0.33) % 1;
      ctx.globalAlpha = (1 - smoke) * 0.22;
      ctx.fillStyle = '#d8d2c4';
      ctx.beginPath();
      ctx.arc(w * 0.26 + 10 + Math.sin(t + i) * 8, -h - 86 - smoke * 60, 8 + smoke * 12, 0, TAU);
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  }
  // Letrero.
  if (p.sign) {
    ctx.fillStyle = '#3b2a1d';
    rr(ctx, -w / 2 + 16, -h + 8, 44, 20, 3); ctx.fill();
    ctx.fillStyle = '#e8c56a';
    ctx.font = 'bold 10px Georgia';
    ctx.textAlign = 'center';
    ctx.fillText(p.sign, -w / 2 + 38, -h + 22);
  }
}

function drawRock(ctx, p, t) {
  const s = p.scale || 1;
  shadow(ctx, 0, 2, 22 * s, 8 * s, 0.3);
  const g = ctx.createLinearGradient(0, -26 * s, 0, 2);
  g.addColorStop(0, p.color || '#7a7f8c'); g.addColorStop(1, '#3a3f4a');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(-20 * s, 0);
  ctx.lineTo(-14 * s, -20 * s);
  ctx.lineTo(-2 * s, -28 * s);
  ctx.lineTo(13 * s, -22 * s);
  ctx.lineTo(21 * s, -4 * s);
  ctx.lineTo(10 * s, 2 * s);
  ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(220,230,245,.25)'; ctx.lineWidth = 1.2; ctx.stroke();
  ctx.strokeStyle = 'rgba(30,35,45,.5)'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(-4 * s, -24 * s); ctx.lineTo(2 * s, -12 * s); ctx.lineTo(10 * s, -6 * s); ctx.stroke();
}

function drawPillar(ctx, p, t) {
  const s = p.scale || 1;
  shadow(ctx, 0, 2, 26 * s, 9 * s, 0.32);
  const g = ctx.createLinearGradient(-12 * s, 0, 12 * s, 0);
  g.addColorStop(0, '#4a4e63'); g.addColorStop(0.45, '#8a8fa8'); g.addColorStop(1, '#3a3d50');
  ctx.fillStyle = g;
  rr(ctx, -13 * s, -90 * s, 26 * s, 90 * s, 3); ctx.fill();
  ctx.strokeStyle = 'rgba(200,210,235,.25)'; ctx.lineWidth = 1; ctx.stroke();
  // Capitel roto.
  ctx.fillStyle = '#6a6f88';
  rr(ctx, -18 * s, -96 * s, 36 * s, 10 * s, 2); ctx.fill();
  ctx.beginPath(); ctx.moveTo(-14 * s, -96 * s); ctx.lineTo(-8 * s, -110 * s); ctx.lineTo(-2 * s, -96 * s); ctx.closePath(); ctx.fill();
  // Grietas.
  ctx.strokeStyle = 'rgba(30,30,45,.6)'; ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.moveTo(-6 * s, -80 * s); ctx.lineTo(2 * s, -56 * s); ctx.lineTo(-4 * s, -38 * s); ctx.stroke();
  // Runa.
  if (p.rune) {
    glow(ctx, 0, -52 * s, 24 * s, '#9fe3ff', 0.2);
    ctx.strokeStyle = 'rgba(159,227,255,.6)'; ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.moveTo(0, -60 * s); ctx.lineTo(6 * s, -52 * s); ctx.lineTo(0, -44 * s); ctx.lineTo(-6 * s, -52 * s); ctx.closePath(); ctx.stroke();
  }
}

function drawCrystal(ctx, p, t) {
  const s = p.scale || 1;
  const c = p.color || '#8fd8ff';
  shadow(ctx, 0, 2, 20 * s, 7 * s, 0.25);
  glow(ctx, 0, -20 * s, 42 * s, c, 0.28 + Math.sin(t * 2 + (p.seed || 0)) * 0.05);
  for (let i = 0; i < 3; i++) {
    const off = (i - 1) * 11 * s;
    const h = (24 + (i % 2) * 14) * s;
    ctx.fillStyle = hexToRgba(c, 0.85);
    ctx.beginPath();
    ctx.moveTo(off, 0);
    ctx.lineTo(off - 6 * s, -h * 0.55);
    ctx.lineTo(off, -h);
    ctx.lineTo(off + 6 * s, -h * 0.55);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,.55)'; ctx.lineWidth = 1; ctx.stroke();
  }
}

function drawTorch(ctx, p, t) {
  const s = p.scale || 1;
  ctx.fillStyle = '#4a3222';
  rr(ctx, -2.5 * s, -44 * s, 5 * s, 46 * s, 2); ctx.fill();
  ctx.fillStyle = '#2b1d16';
  rr(ctx, -5 * s, -48 * s, 10 * s, 6 * s, 2); ctx.fill();
  const fl = Math.sin(t * 9 + (p.seed || 0)) * 2;
  glow(ctx, 0, -52 * s, 40 * s, '#ffb35a', 0.35);
  const g = ctx.createRadialGradient(0, -54 * s, 1, 0, -54 * s, 12 * s);
  g.addColorStop(0, '#fff3c4'); g.addColorStop(0.45, '#ffb35a'); g.addColorStop(1, 'rgba(255,90,40,0)');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.ellipse(fl, -54 * s, 7 * s, 12 * s, 0, 0, TAU);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,243,196,.9)';
  ctx.beginPath(); ctx.ellipse(fl * 0.5, -55 * s, 3 * s, 6 * s, 0, 0, TAU); ctx.fill();
}

function drawFence(ctx, p, t) {
  const n = p.n || 4;
  const s = p.scale || 1;
  ctx.strokeStyle = '#5a402b'; ctx.lineWidth = 4 * s; ctx.lineCap = 'round';
  for (let i = 0; i < n; i++) {
    const x = (i - (n - 1) / 2) * 20 * s;
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, -28 * s); ctx.stroke();
  }
  ctx.lineWidth = 3 * s;
  ctx.beginPath(); ctx.moveTo(-(n - 1) * 10 * s, -20 * s); ctx.lineTo((n - 1) * 10 * s, -20 * s); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-(n - 1) * 10 * s, -10 * s); ctx.lineTo((n - 1) * 10 * s, -10 * s); ctx.stroke();
}

function drawWell(ctx, p, t) {
  shadow(ctx, 0, 3, 40, 13, 0.32);
  const g = ctx.createLinearGradient(0, -24, 0, 4);
  g.addColorStop(0, '#8a8fa8'); g.addColorStop(1, '#3a3f50');
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.ellipse(0, 0, 34, 13, 0, 0, TAU); ctx.fill();
  ctx.fillRect(-34, -14, 68, 14);
  ctx.beginPath(); ctx.ellipse(0, -14, 34, 13, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = '#1a2a3a';
  ctx.beginPath(); ctx.ellipse(0, -14, 25, 9, 0, 0, TAU); ctx.fill();
  // Agua brillante.
  ctx.strokeStyle = 'rgba(159,227,255,.5)'; ctx.lineWidth = 1.2;
  for (let i = 0; i < 3; i++) {
    ctx.beginPath(); ctx.ellipse(0, -14, 8 + i * 5, 3 + i * 2, 0, 0, TAU); ctx.stroke();
  }
  // Estructura.
  ctx.strokeStyle = '#5a402b'; ctx.lineWidth = 5;
  ctx.beginPath(); ctx.moveTo(-26, -18); ctx.lineTo(-20, -70); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(26, -18); ctx.lineTo(20, -70); ctx.stroke();
  ctx.fillStyle = '#7a3f3f';
  ctx.beginPath(); ctx.moveTo(-32, -68); ctx.lineTo(0, -88); ctx.lineTo(32, -68); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = '#4a2528'; ctx.lineWidth = 2; ctx.stroke();
  ctx.strokeStyle = '#8a6a3f'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(0, -68); ctx.lineTo(0, -30); ctx.stroke();
}

function drawStatue(ctx, p, t) {
  const s = p.scale || 1;
  shadow(ctx, 0, 3, 30 * s, 10 * s, 0.3);
  ctx.fillStyle = '#5a5f72';
  rr(ctx, -26 * s, -14 * s, 52 * s, 14 * s, 3); ctx.fill();
  const g = ctx.createLinearGradient(0, -90 * s, 0, -10 * s);
  g.addColorStop(0, p.color || '#9aa6b8'); g.addColorStop(1, '#4a4e60');
  ctx.fillStyle = g;
  rr(ctx, -14 * s, -70 * s, 28 * s, 56 * s, 6); ctx.fill();
  ellipse(ctx, 0, -82 * s, 10 * s, 11 * s, p.color || '#9aa6b8');
  // Espada.
  ctx.strokeStyle = '#c9d3df'; ctx.lineWidth = 3 * s;
  ctx.beginPath(); ctx.moveTo(0, -60 * s); ctx.lineTo(0, -6 * s); ctx.stroke();
  ctx.fillStyle = '#e8c56a';
  ctx.fillRect(-8 * s, -46 * s, 16 * s, 3 * s);
  if (p.glow) glow(ctx, 0, -50 * s, 30 * s, p.glow, 0.2);
}

function drawShrine(ctx, p, t, game) {
  const used = game?.state?.flags?.[`shrine_${p.id}`];
  shadow(ctx, 0, 3, 34, 11, 0.3);
  ctx.fillStyle = '#4a4e60';
  rr(ctx, -28, -14, 56, 14, 4); ctx.fill();
  ctx.fillStyle = '#6a6f88';
  rr(ctx, -20, -24, 40, 12, 3); ctx.fill();
  ctx.fillStyle = '#8a8fa8';
  rr(ctx, -12, -34, 24, 12, 3); ctx.fill();
  const pulse = 0.5 + Math.sin(t * 2.2) * 0.12;
  glow(ctx, 0, -54, 46, '#9fe3ff', 0.4 * pulse);
  // Anillo.
  ctx.save();
  ctx.translate(0, -54);
  ctx.rotate(t * 0.4);
  ctx.strokeStyle = 'rgba(159,227,255,.7)'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.ellipse(0, 0, 20, 7, 0.4, 0, TAU); ctx.stroke();
  ctx.beginPath(); ctx.ellipse(0, 0, 20, 7, -0.4, 0, TAU); ctx.stroke();
  ctx.restore();
  ctx.fillStyle = '#c9f2ff';
  star(ctx, 0, -54, 9 + Math.sin(t * 2) * 1.5, 4, 0.38); ctx.fill();
  ctx.strokeStyle = '#fff'; ctx.lineWidth = 1; ctx.stroke();
}

function drawChest(ctx, p, t, game) {
  const opened = game?.state?.flags?.[`chest_${p.id}`];
  shadow(ctx, 0, 2, 24, 8, 0.3);
  if (!opened) glow(ctx, 0, -20, 32, '#ffe6a0', 0.25 + Math.sin(t * 2) * 0.05);
  const g = ctx.createLinearGradient(0, -30, 0, 0);
  g.addColorStop(0, opened ? '#6b4a30' : '#9a6a3a'); g.addColorStop(1, '#3b2a1d');
  ctx.fillStyle = g;
  rr(ctx, -22, -18, 44, 18, 3); ctx.fill();
  ctx.fillStyle = '#c9a25a';
  ctx.fillRect(-22, -10, 44, 3);
  ctx.fillRect(-4, -18, 8, 18);
  if (!opened) {
    ctx.fillStyle = '#8a5a2b';
    rr(ctx, -22, -30, 44, 14, 6); ctx.fill();
    ctx.strokeStyle = '#c9a25a'; ctx.lineWidth = 2; ctx.stroke();
    ctx.fillStyle = '#ffe6a0';
    ctx.fillRect(-3, -18, 6, 6);
  } else {
    ctx.fillStyle = '#8a5a2b';
    ctx.save();
    ctx.translate(-22, -18); ctx.rotate(-0.5);
    rr(ctx, 0, -12, 44, 13, 5); ctx.fill();
    ctx.strokeStyle = '#c9a25a'; ctx.stroke();
    ctx.restore();
    ctx.fillStyle = 'rgba(255,230,160,.25)';
    ctx.beginPath(); ctx.ellipse(0, -18, 16, 5, 0, 0, TAU); ctx.fill();
  }
}

function drawPortal(ctx, p, t, game) {
  const locked = p.locked?.(game) ?? false;
  shadow(ctx, 0, 3, 42, 14, 0.3);
  ctx.fillStyle = '#4a4e60';
  rr(ctx, -34, -8, 68, 10, 4); ctx.fill();
  ctx.fillStyle = '#6a6f88';
  rr(ctx, -32, -78, 12, 72, 5); ctx.fill();
  rr(ctx, 20, -78, 12, 72, 5); ctx.fill();
  rr(ctx, -34, -86, 68, 12, 5); ctx.fill();
  const c = locked ? '#6b6f80' : (p.color || '#9fe3ff');
  glow(ctx, 0, -42, 50, c, locked ? 0.12 : 0.32);
  const g = ctx.createLinearGradient(0, -78, 0, 0);
  g.addColorStop(0, hexToRgba(c, 0.05));
  g.addColorStop(0.5, hexToRgba(c, locked ? 0.16 : 0.45));
  g.addColorStop(1, hexToRgba(c, 0.02));
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.ellipse(0, -40, 26, 37, 0, 0, TAU); ctx.fill();
  if (!locked) {
    for (let i = 0; i < 3; i++) {
      const yy = -70 + ((t * 20 + i * 25) % 70);
      ctx.strokeStyle = hexToRgba(c, 0.35); ctx.lineWidth = 1;
      ctx.beginPath(); ctx.ellipse(0, yy, 20 - i * 3, 5, 0, 0, TAU); ctx.stroke();
    }
  }
  ctx.fillStyle = locked ? '#8a8fa8' : c;
  ctx.font = 'bold 11px Georgia';
  ctx.textAlign = 'center';
  if (locked) {
    ctx.fillText('✧', 0, -42);
  }
}

function drawRune(ctx, p, t, game) {
  const active = game?.state?.flags?.[`rune_${p.runeId}`];
  const c = active ? '#ffe6a0' : '#9fe3ff';
  shadow(ctx, 0, 2, 24, 8, 0.28);
  ctx.fillStyle = '#4a4e60';
  rr(ctx, -18, -34, 36, 34, 4); ctx.fill();
  ctx.fillStyle = '#6a6f88';
  rr(ctx, -14, -38, 28, 10, 3); ctx.fill();
  if (active) glow(ctx, 0, -20, 34, c, 0.4);
  ctx.strokeStyle = c; ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, -30); ctx.lineTo(8, -20); ctx.lineTo(0, -10); ctx.lineTo(-8, -20); ctx.closePath(); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-5, -20); ctx.lineTo(5, -20); ctx.stroke();
}

function drawAltar(ctx, p, t, game) {
  const active = game?.state?.flags?.altar_alba;
  shadow(ctx, 0, 3, 40, 13, 0.32);
  ctx.fillStyle = '#4a4e60';
  rr(ctx, -36, -16, 72, 16, 4); ctx.fill();
  ctx.fillStyle = '#6a6f88';
  rr(ctx, -28, -30, 56, 16, 3); ctx.fill();
  ctx.fillStyle = '#8a8fa8';
  rr(ctx, -20, -42, 40, 14, 3); ctx.fill();
  const c = active ? '#ffe6a0' : '#9fe3ff';
  glow(ctx, 0, -60, 46, c, 0.32 + Math.sin(t * 2) * 0.06);
  if (!active) {
    ctx.save();
    ctx.translate(0, -60 + Math.sin(t * 1.6) * 3);
    ctx.rotate(Math.sin(t) * 0.08);
    ctx.fillStyle = c;
    ctx.beginPath(); ctx.moveTo(0, -20); ctx.lineTo(7, 0); ctx.lineTo(0, 14); ctx.lineTo(-7, 0); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 1; ctx.stroke();
    ctx.restore();
  } else {
    // Espada restaurada flotando.
    ctx.save();
    ctx.translate(0, -70 + Math.sin(t * 1.2) * 2);
    drawWeapon(ctx, 'celestial', 0, 0, -Math.PI / 2, 1.1, '#fff3c4');
    ctx.restore();
  }
  for (let i = 0; i < 4; i++) {
    const a = t * 0.6 + i * Math.PI / 2;
    glow(ctx, Math.cos(a) * 24, -52 + Math.sin(a) * 8, 3, c, 0.5);
  }
}

function drawBarrier(ctx, p, t, game) {
  const active = p.active?.(game) ?? true;
  if (!active) return;
  const c = p.color || '#c9a6ff';
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  for (let i = 0; i < 8; i++) {
    const x = -60 + i * 17;
    const h = 80 + Math.sin(t * 2 + i) * 8;
    const g = ctx.createLinearGradient(x, -h, x, 0);
    g.addColorStop(0, hexToRgba(c, 0.05));
    g.addColorStop(0.5, hexToRgba(c, 0.28));
    g.addColorStop(1, hexToRgba(c, 0.05));
    ctx.fillStyle = g;
    ctx.fillRect(x, -h, 12, h);
  }
  ctx.strokeStyle = hexToRgba(c, 0.5); ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(-60, -40 + Math.sin(t * 3) * 3); ctx.lineTo(60, -40 + Math.cos(t * 3) * 3); ctx.stroke();
  ctx.restore();
}

function drawMushroom(ctx, p, t) {
  const s = p.scale || 1;
  const c = p.color || '#9fe3ff';
  glow(ctx, 0, -10 * s, 20 * s, c, 0.2);
  ctx.fillStyle = '#d8d2c4';
  rr(ctx, -2.5 * s, -12 * s, 5 * s, 12 * s, 2); ctx.fill();
  ctx.fillStyle = c;
  ctx.beginPath(); ctx.ellipse(0, -14 * s, 10 * s, 6 * s, 0, Math.PI, TAU); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,.5)';
  ellipse(ctx, -3 * s, -16 * s, 1.5 * s, 1 * s, 'rgba(255,255,255,.5)');
}

function drawBush(ctx, p, t) {
  const s = p.scale || 1;
  shadow(ctx, 0, 2, 20 * s, 6 * s, 0.2);
  const c = p.color || '#2f6b4f';
  for (let i = 0; i < 4; i++) {
    const a = i * 1.6 + (p.seed || 0);
    const x = Math.cos(a) * 9 * s;
    const y = -8 * s + Math.sin(a) * 5 * s;
    const g = ctx.createRadialGradient(x - 3, y - 3, 1, x, y, 14 * s);
    g.addColorStop(0, shade(c, 0.12)); g.addColorStop(1, shade(c, -0.2));
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.ellipse(x, y, 14 * s, 10 * s, a, 0, TAU); ctx.fill();
  }
  if (p.berries) {
    for (let i = 0; i < 4; i++) {
      ctx.fillStyle = '#e0566a';
      ellipse(ctx, -8 + i * 5, -10 + (i % 2) * 4, 1.6, 1.6, '#e0566a');
    }
  }
}

function drawLog(ctx, p, t) {
  const s = p.scale || 1;
  shadow(ctx, 0, 2, 24 * s, 7 * s, 0.25);
  ctx.save(); ctx.rotate(p.rot || 0);
  ctx.fillStyle = '#5a402b';
  rr(ctx, -24 * s, -10 * s, 48 * s, 12 * s, 6); ctx.fill();
  ctx.fillStyle = '#8a6a3f';
  ctx.beginPath(); ctx.ellipse(24 * s, -4 * s, 6 * s, 6 * s, 0, 0, TAU); ctx.fill();
  ctx.strokeStyle = '#5a402b'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.arc(24 * s, -4 * s, 3 * s, 0, TAU); ctx.stroke();
  ctx.restore();
  if (p.moss) {
    ctx.fillStyle = 'rgba(80,140,90,.5)';
    ctx.beginPath(); ctx.ellipse(-6, -10, 12, 4, 0, 0, TAU); ctx.fill();
  }
}

function drawBones(ctx, p, t) {
  ctx.strokeStyle = '#c9c2b0'; ctx.lineWidth = 2.5; ctx.lineCap = 'round';
  for (let i = 0; i < 3; i++) {
    ctx.beginPath(); ctx.moveTo(-10 + i * 8, 0); ctx.lineTo(-4 + i * 8, -6); ctx.stroke();
  }
  ctx.fillStyle = '#d8d2c4';
  ellipse(ctx, 8, -8, 4, 3.5, '#d8d2c4');
  ctx.fillStyle = '#3a332c';
  ellipse(ctx, 7, -9, 1, 1.2, '#3a332c');
  ellipse(ctx, 9.5, -9, 1, 1.2, '#3a332c');
}

function drawBanner(ctx, p, t) {
  ctx.fillStyle = '#4a3222';
  ctx.fillRect(-2, -60, 4, 60);
  const c = p.color || '#8a3f3f';
  const sway = Math.sin(t * 2) * 3;
  ctx.fillStyle = c;
  ctx.beginPath();
  ctx.moveTo(2, -58); ctx.lineTo(30 + sway, -54); ctx.lineTo(26 + sway, -26); ctx.lineTo(2, -30); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = '#e8c56a'; ctx.lineWidth = 1;
  ctx.stroke();
  ctx.fillStyle = '#e8c56a';
  star(ctx, 15 + sway * 0.5, -42, 5, 4, 0.4); ctx.fill();
}

function drawCampfire(ctx, p, t) {
  shadow(ctx, 0, 2, 22, 7, 0.3);
  ctx.strokeStyle = '#4a3222'; ctx.lineWidth = 4; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(-12, -2); ctx.lineTo(12, 2); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-10, 2); ctx.lineTo(10, -2); ctx.stroke();
  const fl = Math.sin(t * 8) * 2;
  glow(ctx, 0, -16, 50, '#ffb35a', 0.35);
  for (let i = 0; i < 3; i++) {
    const g = ctx.createRadialGradient(0, -12, 1, 0, -12, 14);
    g.addColorStop(0, i === 0 ? '#fff3c4' : '#ffb35a'); g.addColorStop(1, 'rgba(255,90,40,0)');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.ellipse(fl * (i - 1) * 0.6, -14 - i * 3, 8 - i * 2, 14 - i * 2, 0, 0, TAU); ctx.fill();
  }
  for (let i = 0; i < 4; i++) {
    const a = t * 1.5 + i * 1.7;
    glow(ctx, Math.cos(a) * 10, -30 - ((t * 20 + i * 15) % 30), 2, '#ffcf5a', 0.5);
  }
}

function drawTent(ctx, p, t) {
  shadow(ctx, 0, 3, 40, 12, 0.3);
  const g = ctx.createLinearGradient(0, -50, 0, 0);
  g.addColorStop(0, '#6b7a4a'); g.addColorStop(1, '#3a402b');
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.moveTo(-38, 0); ctx.lineTo(0, -54); ctx.lineTo(38, 0); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = '#2b2e20'; ctx.lineWidth = 2; ctx.stroke();
  ctx.fillStyle = '#1a1d15';
  ctx.beginPath(); ctx.moveTo(-12, 0); ctx.lineTo(0, -34); ctx.lineTo(12, 0); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = '#c9c2b0'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(0, -54); ctx.lineTo(0, -64); ctx.stroke();
}

function drawGravestone(ctx, p, t) {
  shadow(ctx, 0, 2, 18, 6, 0.28);
  ctx.fillStyle = '#6a6f88';
  ctx.beginPath(); ctx.moveTo(-13, 0); ctx.lineTo(-13, -28); ctx.quadraticCurveTo(0, -42, 13, -28); ctx.lineTo(13, 0); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(30,30,45,.5)'; ctx.lineWidth = 1; ctx.stroke();
  ctx.strokeStyle = 'rgba(200,210,235,.35)';
  ctx.beginPath(); ctx.moveTo(0, -30); ctx.lineTo(0, -16); ctx.moveTo(-5, -23); ctx.lineTo(5, -23); ctx.stroke();
  if (p.glow) glow(ctx, 0, -22, 20, p.glow, 0.2);
}

function drawSign(ctx, p, t) {
  shadow(ctx, 0, 2, 16, 5, 0.26);
  ctx.fillStyle = '#5a402b';
  ctx.fillRect(-2.5, -30, 5, 30);
  ctx.fillStyle = '#7a5a38';
  rr(ctx, -17, -42, 34, 17, 3); ctx.fill();
  ctx.strokeStyle = '#3b2a1d'; ctx.lineWidth = 1; ctx.stroke();
  ctx.fillStyle = '#e8c56a';
  star(ctx, 0, -33, 3.4, 4, 0.4); ctx.fill();
  ctx.strokeStyle = 'rgba(232,197,106,.55)'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(-11, -30); ctx.lineTo(-5, -30); ctx.moveTo(5, -30); ctx.lineTo(11, -30); ctx.stroke();
}

function drawLoreStone(ctx, p, t) {
  shadow(ctx, 0, 2, 24, 7, 0.3);
  const g = ctx.createLinearGradient(-18, -66, 18, 0);
  g.addColorStop(0, '#4a4e6a');
  g.addColorStop(0.55, '#3a3d55');
  g.addColorStop(1, '#25273a');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(-17, 0); ctx.lineTo(-14, -52); ctx.lineTo(-5, -68); ctx.lineTo(9, -64); ctx.lineTo(16, -46); ctx.lineTo(18, 0);
  ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(159,227,255,.28)'; ctx.lineWidth = 1.2; ctx.stroke();
  const pulse = 0.3 + Math.sin(t * 1.8 + (p.seed || 0)) * 0.12;
  glow(ctx, 0, -40, 34, '#9fe3ff', pulse * 0.5);
  ctx.strokeStyle = `rgba(159,227,255,${pulse + 0.25})`;
  ctx.lineWidth = 1.4;
  for (let i = 0; i < 3; i++) {
    const y = -20 - i * 13;
    ctx.beginPath();
    ctx.moveTo(-7, y); ctx.lineTo(-2, y - 5); ctx.lineTo(3, y); ctx.lineTo(8, y - 5);
    ctx.stroke();
  }
  ctx.fillStyle = `rgba(200,240,255,${pulse + 0.3})`;
  star(ctx, 0, -58, 3.5, 4, 0.35); ctx.fill();
}

function drawEcho(ctx, p, t, game) {
  const collected = game?.state?.flags?.[`echo_${p.id}`];
  if (collected) return;
  const float = Math.sin(t * 2 + (p.seed || 0)) * 5;
  glow(ctx, 0, -30 + float, 34, '#9fe3ff', 0.4);
  ctx.save();
  ctx.translate(0, -30 + float);
  ctx.rotate(t * 0.5);
  ctx.strokeStyle = 'rgba(159,227,255,.85)'; ctx.lineWidth = 1.5;
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * TAU;
    const x = Math.cos(a) * 12, y = Math.sin(a) * 8;
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.closePath(); ctx.stroke();
  ctx.fillStyle = '#d8fbff';
  star(ctx, 0, 0, 5, 4, 0.35); ctx.fill();
  ctx.restore();
}

function drawFirefly(ctx, p, t, game) {
  const collected = game?.state?.flags?.[`firefly_${p.id}`];
  if (collected) return;
  const a = t * 1.2 + (p.seed || 0);
  const x = Math.cos(a) * 10;
  const y = -24 + Math.sin(a * 1.7) * 10;
  glow(ctx, x, y, 22, '#c8ff9a', 0.5);
  ctx.fillStyle = '#eaffd0';
  star(ctx, x, y, 3, 4, 0.35); ctx.fill();
  for (let i = 0; i < 2; i++) {
    const aa = t * 2 + i * 3;
    glow(ctx, x + Math.cos(aa) * 8, y + Math.sin(aa) * 6, 2, '#c8ff9a', 0.5);
  }
}

function drawDebris(ctx, p, t) {
  const float = Math.sin(t * 0.8 + (p.seed || 0)) * 6;
  ctx.save();
  ctx.translate(0, -40 + float);
  ctx.rotate(t * 0.2 + (p.seed || 0));
  ctx.fillStyle = '#5a5f72';
  ctx.beginPath(); ctx.moveTo(-10, 0); ctx.lineTo(0, -6); ctx.lineTo(9, 2); ctx.lineTo(-2, 5); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(159,227,255,.35)'; ctx.lineWidth = 1; ctx.stroke();
  ctx.restore();
  glow(ctx, 0, -40 + float, 16, '#9fe3ff', 0.12);
}

function drawBridge(ctx, p, t) {
  const w = p.w || 140;
  const h = p.h || 60;
  ctx.fillStyle = '#6b4a30';
  rr(ctx, -w / 2, -h / 2, w, h, 4); ctx.fill();
  ctx.strokeStyle = '#3b2a1d'; ctx.lineWidth = 2;
  for (let i = 0; i < 7; i++) {
    const x = -w / 2 + (i / 6) * w;
    ctx.beginPath(); ctx.moveTo(x, -h / 2); ctx.lineTo(x, h / 2); ctx.stroke();
  }
  ctx.strokeStyle = '#8a6a3f'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(-w / 2, -h / 2 + 3); ctx.lineTo(w / 2, -h / 2 + 3); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-w / 2, h / 2 - 3); ctx.lineTo(w / 2, h / 2 - 3); ctx.stroke();
}

function drawArch(ctx, p, t) {
  const s = p.scale || 1;
  ctx.fillStyle = '#4a4e60';
  rr(ctx, -52 * s, -96 * s, 16 * s, 96 * s, 3); ctx.fill();
  rr(ctx, 36 * s, -96 * s, 16 * s, 96 * s, 3); ctx.fill();
  ctx.fillStyle = '#6a6f88';
  rr(ctx, -56 * s, -110 * s, 112 * s, 18 * s, 4); ctx.fill();
  ctx.strokeStyle = 'rgba(200,210,235,.3)'; ctx.lineWidth = 1; ctx.stroke();
  glow(ctx, 0, -100 * s, 60 * s, '#9fe3ff', 0.12);
}

function drawThrone(ctx, p, t) {
  shadow(ctx, 0, 4, 50, 16, 0.35);
  ctx.fillStyle = '#4a405e';
  rr(ctx, -40, -16, 80, 16, 4); ctx.fill();
  ctx.fillStyle = '#5e5078';
  rr(ctx, -34, -80, 68, 68, 8); ctx.fill();
  ctx.strokeStyle = '#c9a6ff'; ctx.lineWidth = 2; ctx.stroke();
  ctx.fillStyle = '#2d2938';
  rr(ctx, -24, -66, 48, 50, 6); ctx.fill();
  glow(ctx, 0, -42, 30, '#c9a6ff', 0.25);
  ctx.fillStyle = '#c9a6ff';
  star(ctx, 0, -42, 8, 4, 0.35); ctx.fill();
  for (const s of [-1, 1]) {
    ctx.fillStyle = '#6a5a88';
    rr(ctx, s * 34 - 6, -104, 12, 26, 3); ctx.fill();
    glow(ctx, s * 34, -106, 16, '#c9a6ff', 0.25);
  }
}

function drawCloud(ctx, p, t) {
  const s = p.scale || 1;
  ctx.globalAlpha = p.alpha || 0.12;
  ctx.fillStyle = p.color || '#c9d8ff';
  const drift = Math.sin(t * 0.1 + (p.seed || 0)) * 20;
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    ctx.ellipse(drift + (i - 2) * 40 * s, -20 * s + Math.sin(i) * 10 * s, 55 * s, 22 * s, 0, 0, TAU);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

// ---------------------------------------------------------------------------
// RETRATO
// ---------------------------------------------------------------------------

export function drawPortrait(canvas, player) {
  if (!canvas) return;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const size = 96;
  if (canvas.width !== size * dpr) {
    canvas.width = size * dpr;
    canvas.height = size * dpr;
  }
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, size, size);
  const a = player.appearance || {};
  const outfit = player.armor?.color || a.outfit || '#3d6fb0';
  const accent = player.armor?.trim || a.accent || '#e8c56a';
  const skin = a.skin || SKIN_TONES[0];
  const hair = a.hair || HAIR_COLORS[1];
  // Fondo.
  const bg = ctx.createRadialGradient(48, 40, 4, 48, 48, 62);
  bg.addColorStop(0, hexToRgba(accent, 0.28));
  bg.addColorStop(0.6, 'rgba(20,28,48,.85)');
  bg.addColorStop(1, 'rgba(8,12,22,1)');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, size, size);
  // Hombros.
  const g = ctx.createLinearGradient(0, 60, 0, 96);
  g.addColorStop(0, outfit); g.addColorStop(1, shade(outfit, -0.4));
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(14, 96); ctx.quadraticCurveTo(22, 66, 40, 62); ctx.lineTo(56, 62); ctx.quadraticCurveTo(74, 66, 82, 96);
  ctx.closePath(); ctx.fill();
  ctx.strokeStyle = hexToRgba(accent, 0.7); ctx.lineWidth = 1.2; ctx.stroke();
  // Cuello.
  ctx.fillStyle = shade(skin, -0.1);
  ctx.fillRect(41, 54, 14, 14);
  // Cara.
  ellipse(ctx, 48, 42, 18, 20, skin);
  // Orejas.
  ellipse(ctx, 30, 44, 3.5, 5, skin);
  ellipse(ctx, 66, 44, 3.5, 5, skin);
  // Pelo.
  ctx.save();
  ctx.translate(48, 34);
  ctx.scale(1.55, 1.55);
  drawHair(ctx, a.hairStyle ?? 0, hair, true, 0);
  ctx.restore();
  // Ojos.
  ctx.fillStyle = '#f7f9ff';
  ellipse(ctx, 41, 44, 4.2, 3.6, '#f7f9ff');
  ellipse(ctx, 55, 44, 4.2, 3.6, '#f7f9ff');
  ctx.fillStyle = '#30486a';
  ellipse(ctx, 41.5, 44.5, 2.2, 2.6, '#30486a');
  ellipse(ctx, 55.5, 44.5, 2.2, 2.6, '#30486a');
  ctx.fillStyle = '#fff';
  ellipse(ctx, 40.6, 43.4, 0.8, 0.9, '#fff');
  ellipse(ctx, 54.6, 43.4, 0.8, 0.9, '#fff');
  // Boca.
  ctx.strokeStyle = 'rgba(120,60,60,.6)'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.arc(48, 51, 3.4, 0.2, Math.PI - 0.2); ctx.stroke();
  // Brillo.
  const shine = ctx.createLinearGradient(0, 0, size, size);
  shine.addColorStop(0, 'rgba(255,255,255,.08)');
  shine.addColorStop(0.5, 'rgba(255,255,255,0)');
  shine.addColorStop(1, 'rgba(255,255,255,.04)');
  ctx.fillStyle = shine;
  ctx.fillRect(0, 0, size, size);
  // Marco.
  ctx.strokeStyle = hexToRgba(accent, 0.6);
  ctx.lineWidth = 2;
  ctx.strokeRect(1, 1, size - 2, size - 2);
}

// Icono de criatura para menús.
export function drawCreatureGlyph(ctx, id, x, y, r, color) {
  ctx.save();
  ctx.translate(x, y);
  ctx.strokeStyle = color || '#e8c56a';
  ctx.fillStyle = color || '#e8c56a';
  ctx.lineWidth = Math.max(1, r * 0.08);
  if (id === 'gelatina') {
    ctx.beginPath(); ctx.ellipse(0, r * 0.15, r * 0.8, r * 0.65, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = '#10202a';
    ctx.beginPath(); ctx.arc(-r * 0.25, -r * 0.05, r * 0.09, 0, TAU); ctx.arc(r * 0.25, -r * 0.05, r * 0.09, 0, TAU); ctx.fill();
  } else if (id === 'lobo') {
    ctx.beginPath(); ctx.moveTo(-r * 0.8, -r * 0.5); ctx.lineTo(-r * 0.4, -r * 0.85); ctx.lineTo(-r * 0.2, -r * 0.4); ctx.lineTo(r * 0.4, -r * 0.4); ctx.lineTo(r * 0.55, -r * 0.8); ctx.lineTo(r * 0.85, -r * 0.4); ctx.lineTo(r * 0.6, r * 0.55); ctx.lineTo(0, r * 0.75); ctx.lineTo(-r * 0.6, r * 0.5); ctx.closePath(); ctx.fill();
  } else if (id === 'escarabajo') {
    ctx.beginPath(); ctx.ellipse(0, r * 0.05, r * 0.7, r * 0.8, 0, 0, TAU); ctx.fill();
    ctx.strokeStyle = '#10202a'; ctx.beginPath(); ctx.moveTo(0, -r * 0.7); ctx.lineTo(0, r * 0.75); ctx.stroke();
  } else if (id === 'espectro') {
    ctx.beginPath(); ctx.arc(0, -r * 0.25, r * 0.55, Math.PI, TAU); ctx.lineTo(r * 0.55, r * 0.6); ctx.lineTo(r * 0.25, r * 0.3); ctx.lineTo(0, r * 0.7); ctx.lineTo(-r * 0.25, r * 0.3); ctx.lineTo(-r * 0.55, r * 0.6); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#10202a'; ctx.beginPath(); ctx.arc(-r * 0.2, -r * 0.2, r * 0.09, 0, TAU); ctx.arc(r * 0.2, -r * 0.2, r * 0.09, 0, TAU); ctx.fill();
  } else {
    ctx.beginPath(); ctx.moveTo(-r * 0.55, r * 0.7); ctx.lineTo(-r * 0.65, -r * 0.3); ctx.lineTo(-r * 0.3, -r * 0.8); ctx.lineTo(0, -r * 0.55); ctx.lineTo(r * 0.3, -r * 0.8); ctx.lineTo(r * 0.65, -r * 0.3); ctx.lineTo(r * 0.55, r * 0.7); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#10202a'; ctx.fillRect(-r * 0.35, -r * 0.25, r * 0.7, r * 0.12);
  }
  ctx.restore();
}

// Partículas de título / retratos ambientales.
export function drawMote(ctx, x, y, r, color, alpha = 0.6) {
  glow(ctx, x, y, r, color, alpha);
  ctx.fillStyle = hexToRgba(color, Math.min(1, alpha + 0.2));
  ctx.beginPath(); ctx.arc(x, y, Math.max(0.5, r * 0.18), 0, TAU); ctx.fill();
}

export { rr as roundRect, ellipse as drawEllipse, star as drawStar, shadow as drawShadow, glow as drawGlow };
