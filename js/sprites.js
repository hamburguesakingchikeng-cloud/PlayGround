import { AFFINITIES, CREATURES, ENEMIES } from './data.js';

export function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
export function lerp(a, b, t) { return a + (b - a) * t; }
export function easeOut(t) { return 1 - Math.pow(1 - clamp(t, 0, 1), 3); }
export function easeInOut(t) { return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }

function rr(ctx, x, y, w, h, r) {
  const radius = Math.min(r, Math.abs(w) / 2, Math.abs(h) / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

function poly(ctx, points) {
  ctx.beginPath();
  points.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y));
  ctx.closePath();
}

function star(ctx, x, y, outer, inner, points = 5, rotation = -Math.PI / 2) {
  ctx.beginPath();
  for (let i = 0; i < points * 2; i++) {
    const a = rotation + (i * Math.PI) / points;
    const r = i % 2 === 0 ? outer : inner;
    const px = x + Math.cos(a) * r;
    const py = y + Math.sin(a) * r;
    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
  }
  ctx.closePath();
}

export function drawShadow(ctx, x, y, rx, ry, alpha = 0.28) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, rx);
  g.addColorStop(0, `rgba(2,6,15,${alpha})`);
  g.addColorStop(0.55, `rgba(2,6,15,${alpha * 0.7})`);
  g.addColorStop(1, 'rgba(2,6,15,0)');
  ctx.save();
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function glowOrb(ctx, x, y, r, color, alpha = 0.55) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, hexA(color, alpha));
  g.addColorStop(0.45, hexA(color, alpha * 0.45));
  g.addColorStop(1, hexA(color, 0));
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

export function hexA(hex, alpha) {
  if (!hex) return `rgba(255,255,255,${alpha})`;
  if (hex.startsWith('rgba')) return hex;
  const h = hex.replace('#', '');
  const n = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  const int = parseInt(n, 16);
  return `rgba(${(int >> 16) & 255},${(int >> 8) & 255},${int & 255},${alpha})`;
}

export function drawHero(ctx, appearance, opts = {}) {
  const {
    t = 0, moving = false, walk = 0, facing = Math.PI / 2, attack = 0,
    weaponType = 'sword', weaponColor = '#d8efff', armor = null, shield = false,
    accessory = null, scale = 1, alpha = 1, cloak = true, mounted = false,
  } = opts;
  const a = appearance || {};
  const skin = a.skin || '#e3a87e';
  const hair = a.hairColor || '#2a1b17';
  const outfit = a.outfit || '#2c6ea3';
  const accent = a.accent || '#f5c86f';
  const lookX = Math.cos(facing) * 2.2;
  const lookY = Math.sin(facing) * 1.4;
  const flip = Math.cos(facing) < -0.05 ? -1 : 1;
  const cycle = walk * 9;
  const bob = moving ? Math.abs(Math.sin(cycle)) * 2 : Math.sin(t * 2.2) * 0.9;
  const lean = moving ? Math.sin(cycle) * 0.045 : 0;
  const airborne = mounted ? 12 : 0;

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(0, -airborne);
  ctx.scale(flip * scale, scale);

  // Capa / bufanda (detrás)
  if (cloak) {
    const sway = Math.sin(t * 2.4 + facing) * 3 + (moving ? 5 : 0);
    const cape = ctx.createLinearGradient(0, -46, 0, 8);
    cape.addColorStop(0, hexA(accent, 0.85));
    cape.addColorStop(0.55, hexA(outfit, 0.78));
    cape.addColorStop(1, hexA(outfit, 0.16));
    ctx.fillStyle = cape;
    ctx.beginPath();
    ctx.moveTo(-10, -45);
    ctx.bezierCurveTo(-24, -30, -20, -10 + sway, -15, 5 + sway);
    ctx.quadraticCurveTo(0, -2, 15, 5 + sway);
    ctx.bezierCurveTo(20, -10 + sway, 24, -30, 10, -45);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = hexA('#ffffff', 0.18);
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  // Piernas
  const step = Math.sin(cycle) * (moving ? 6 : 0);
  ctx.strokeStyle = hexA('#10162a', 0.92);
  ctx.lineWidth = 7;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-5, -16);
  ctx.lineTo(-6 - step * 0.4, -4 + Math.max(0, step) * 0.18);
  ctx.moveTo(5, -16);
  ctx.lineTo(6 + step * 0.4, -4 + Math.max(0, -step) * 0.18);
  ctx.stroke();
  // Botas
  ctx.strokeStyle = accent;
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.moveTo(-6 - step * 0.4, -6 + Math.max(0, step) * 0.18);
  ctx.lineTo(-7 - step * 0.4, -2);
  ctx.moveTo(6 + step * 0.4, -6 + Math.max(0, -step) * 0.18);
  ctx.lineTo(7 + step * 0.4, -2);
  ctx.stroke();

  // Torso
  ctx.save();
  ctx.rotate(lean);
  const bodyG = ctx.createLinearGradient(-12, -46, 14, -12);
  bodyG.addColorStop(0, lighten(outfit, 24));
  bodyG.addColorStop(0.55, outfit);
  bodyG.addColorStop(1, darken(outfit, 24));
  ctx.fillStyle = bodyG;
  ctx.beginPath();
  ctx.moveTo(-11, -44 + bob);
  ctx.quadraticCurveTo(-15, -33, -10, -15 + bob);
  ctx.quadraticCurveTo(0, -10 + bob, 10, -15 + bob);
  ctx.quadraticCurveTo(15, -33, 11, -44 + bob);
  ctx.quadraticCurveTo(0, -49 + bob, -11, -44 + bob);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = 'rgba(5,10,22,.65)';
  ctx.lineWidth = 1.4;
  ctx.stroke();

  // Cinturón y detalles
  ctx.fillStyle = darken(outfit, 38);
  rr(ctx, -10, -23 + bob, 20, 4.5, 2);
  ctx.fill();
  ctx.fillStyle = accent;
  rr(ctx, -2, -23.4 + bob, 4, 4.5, 1);
  ctx.fill();
  ctx.strokeStyle = hexA(accent, 0.55);
  ctx.lineWidth = 1.1;
  ctx.beginPath();
  ctx.moveTo(-8, -39 + bob);
  ctx.quadraticCurveTo(0, -36 + bob, 8, -39 + bob);
  ctx.stroke();

  // Hombreras si lleva armadura
  if (armor) {
    ctx.fillStyle = armor;
    ctx.strokeStyle = 'rgba(0,0,0,.28)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(-11, -41 + bob, 6, 4.6, -0.35, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(11, -41 + bob, 6, 4.6, 0.35, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = hexA('#ffffff', 0.18);
    ctx.beginPath();
    ctx.ellipse(-12, -42.5 + bob, 3.2, 1.4, -0.35, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath();
    ctx.ellipse(12, -42.5 + bob, 3.2, 1.4, 0.35, 0, Math.PI * 2); ctx.fill();
  }

  // Cabeza
  const headY = -53 + bob;
  ctx.fillStyle = skin;
  ctx.beginPath();
  ctx.ellipse(lookX * 0.3, headY, 10.6, 11.6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(43,20,18,.42)';
  ctx.lineWidth = 0.9;
  ctx.stroke();
  // Oreja
  ctx.beginPath();
  ctx.ellipse(-10, headY + 1, 2.2, 3.1, -0.2, 0, Math.PI * 2);
  ctx.fillStyle = darken(skin, 10); ctx.fill();

  // Ojos
  const facingUp = Math.sin(facing) < -0.5;
  if (!facingUp) {
    ctx.fillStyle = '#f8f4ec';
    ctx.beginPath(); ctx.ellipse(-3.2 + lookX, headY + 0.5, 2.4, 2.8, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(3.8 + lookX, headY + 0.5, 2.4, 2.8, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#1a2442';
    ctx.beginPath(); ctx.arc(-3 + lookX * 1.25, headY + 0.7, 1.25, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(4 + lookX * 1.25, headY + 0.7, 1.25, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.9)';
    ctx.beginPath(); ctx.arc(-3.5 + lookX, headY + 0.2, 0.45, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(3.5 + lookX, headY + 0.2, 0.45, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = 'rgba(122,63,47,.55)';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.arc(0.4 + lookX, headY + 5.2, 2.3, 0.15, Math.PI - 0.15);
    ctx.stroke();
  }

  drawHair(ctx, a.hair || 'corto', hair, headY, lookX, bob, t);

  // Brazo libre
  ctx.strokeStyle = skin;
  ctx.lineWidth = 4.6;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-9, -39 + bob);
  ctx.lineTo(-14 + (moving ? Math.sin(cycle) * 2 : 0), -27 + bob);
  ctx.stroke();

  // Escudo
  if (shield) {
    ctx.save();
    ctx.translate(-15, -31 + bob);
    ctx.rotate(-0.2 + Math.sin(t * 2) * 0.03);
    const sg = ctx.createLinearGradient(-8, -10, 8, 10);
    sg.addColorStop(0, '#d9bd7f');
    sg.addColorStop(0.5, armor || '#8d6f3d');
    sg.addColorStop(1, '#5e4a29');
    ctx.fillStyle = sg;
    ctx.beginPath();
    ctx.moveTo(-7, -10);
    ctx.quadraticCurveTo(0, -13, 7, -10);
    ctx.lineTo(6, 4);
    ctx.quadraticCurveTo(0, 12, -6, 4);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = hexA('#fff0b8', 0.65);
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.fillStyle = accent;
    star(ctx, 0, -1, 3.4, 1.5, 4, 0); ctx.fill();
    ctx.restore();
  }

  // Brazo del arma
  ctx.save();
  const handX = 12, handY = -32 + bob;
  ctx.strokeStyle = skin;
  ctx.lineWidth = 4.8;
  ctx.beginPath();
  ctx.moveTo(9, -39 + bob);
  ctx.lineTo(handX, handY);
  ctx.stroke();
  drawWeapon(ctx, weaponType, weaponColor, handX, handY, { attack, facing, t, flip, scale });
  // Guante
  ctx.fillStyle = darken(skin, 18);
  ctx.beginPath(); ctx.arc(handX, handY, 2.5, 0, Math.PI * 2); ctx.fill();
  ctx.restore();

  // Accesorio
  if (accessory) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const aura = Math.sin(t * 2.4) * 0.15 + 0.38;
    glowOrb(ctx, 0, -28 + bob, 26, accessory, aura * 0.28);
    ctx.restore();
  }
  ctx.restore(); // torso rotate
  ctx.restore(); // global
}

function drawHair(ctx, style, color, headY, lookX, bob, t) {
  const c1 = lighten(color, 22);
  const c2 = darken(color, 18);
  const g = ctx.createLinearGradient(-10, headY - 13, 10, headY + 10);
  g.addColorStop(0, c1);
  g.addColorStop(0.55, color);
  g.addColorStop(1, c2);
  ctx.fillStyle = g;
  ctx.strokeStyle = 'rgba(15,8,14,.55)';
  ctx.lineWidth = 1;
  if (style === 'largo') {
    ctx.beginPath();
    ctx.ellipse(0, headY - 2, 12, 13, 0, Math.PI, Math.PI * 2);
    ctx.quadraticCurveTo(17, headY + 4, 12, headY + 18);
    ctx.quadraticCurveTo(8, headY + 13, 7, headY + 4);
    ctx.quadraticCurveTo(2, headY + 9, -2, headY + 5);
    ctx.quadraticCurveTo(-6, headY + 13, -11, headY + 18);
    ctx.quadraticCurveTo(-16, headY + 2, -11, headY - 5);
    ctx.closePath();
    ctx.fill(); ctx.stroke();
    // mechón frontal
    ctx.beginPath();
    ctx.moveTo(-9 + lookX, headY - 8);
    ctx.quadraticCurveTo(-3 + lookX, headY - 12, 1 + lookX, headY - 7);
    ctx.quadraticCurveTo(4 + lookX, headY - 2, 7 + lookX, headY - 8);
    ctx.quadraticCurveTo(0, headY - 13, -9 + lookX, headY - 8);
    ctx.fill();
  } else if (style === 'coleta') {
    ctx.beginPath();
    ctx.ellipse(0, headY - 3, 12.2, 12.5, 0, Math.PI, Math.PI * 2);
    ctx.quadraticCurveTo(10, headY + 5, 8, headY + 8);
    ctx.quadraticCurveTo(0, headY + 4, -8, headY + 8);
    ctx.quadraticCurveTo(-10, headY + 4, -12, headY - 3);
    ctx.closePath();
    ctx.fill(); ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(9, headY - 7);
    ctx.bezierCurveTo(19 + Math.sin(t * 3) * 1.5, headY - 3, 21, headY + 12, 17, headY + 20);
    ctx.bezierCurveTo(14, headY + 14, 12, headY + 5, 10, headY + 2);
    ctx.fill();
  } else if (style === 'erizado') {
    ctx.beginPath();
    ctx.moveTo(-12, headY + 2);
    for (let i = 0; i < 7; i++) {
      const x = -11 + i * 3.4;
      ctx.lineTo(x + 1.5, headY - 13 - (i % 2 ? 3 : 6));
      ctx.lineTo(x + 3.4, headY - 8);
    }
    ctx.lineTo(12, headY + 3);
    ctx.quadraticCurveTo(0, headY + 8, -12, headY + 2);
    ctx.fill(); ctx.stroke();
  } else {
    ctx.beginPath();
    ctx.ellipse(0, headY - 3, 11.7, 12.2, 0, Math.PI, Math.PI * 2);
    ctx.quadraticCurveTo(12, headY + 4, 8, headY + 8);
    ctx.quadraticCurveTo(4, headY + 4, 2 + lookX, headY + 7);
    ctx.quadraticCurveTo(-2 + lookX, headY + 2, -5, headY + 7);
    ctx.quadraticCurveTo(-11, headY + 4, -11.7, headY - 3);
    ctx.closePath();
    ctx.fill(); ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-8 + lookX, headY - 9);
    ctx.quadraticCurveTo(0, headY - 15, 8 + lookX, headY - 8);
    ctx.quadraticCurveTo(2, headY - 7, -3 + lookX, headY - 2);
    ctx.quadraticCurveTo(-6 + lookX, headY - 7, -8 + lookX, headY - 9);
    ctx.fill();
  }
}

export function drawWeapon(ctx, type, color, hx, hy, opts = {}) {
  const { attack = 0, facing = 0, t = 0, flip = 1, scale = 1 } = opts;
  ctx.save();
  ctx.translate(hx, hy);
  let angle;
  const aim = Math.atan2(Math.sin(facing), Math.cos(facing) * flip);
  if (attack > 0) {
    const swing = Math.sin(attack * Math.PI);
    angle = -1.55 + attack * 3.2;
    if (type === 'greatsword') angle = -1.8 + attack * 3.8;
  } else if (type === 'bow' || type === 'staff') {
    angle = aim;
  } else {
    angle = -0.7 + Math.sin(t * 2) * 0.015;
  }
  ctx.rotate(angle);
  const c = color || '#d8efff';
  const outline = 'rgba(6,10,20,.7)';
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  if (type === 'sword' || type === 'greatsword') {
    const big = type === 'greatsword';
    const len = big ? 52 : 38;
    const wid = big ? 7 : 4.4;
    ctx.shadowColor = c;
    ctx.shadowBlur = 10;
    const g = ctx.createLinearGradient(0, -wid, len, wid);
    g.addColorStop(0, '#f4fbff');
    g.addColorStop(0.45, c);
    g.addColorStop(1, darken(c, 35));
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(0, -wid);
    ctx.lineTo(len * 0.84, -wid * 0.75);
    ctx.lineTo(len, 0);
    ctx.lineTo(len * 0.84, wid * 0.75);
    ctx.lineTo(0, wid);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = outline; ctx.lineWidth = 1; ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,.9)'; ctx.lineWidth = 0.9;
    ctx.beginPath(); ctx.moveTo(4, 0); ctx.lineTo(len - 4, 0); ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#d7b15e';
    ctx.fillRect(-3, -8, 4, 16);
    ctx.fillStyle = '#4a2d2b';
    rr(ctx, -12, -2.2, 10, 4.4, 2); ctx.fill();
    ctx.fillStyle = c;
    ctx.beginPath(); ctx.arc(-13, 0, 2.4, 0, Math.PI * 2); ctx.fill();
  } else if (type === 'dagger') {
    const len = 24;
    ctx.shadowColor = c; ctx.shadowBlur = 8;
    ctx.fillStyle = c;
    ctx.beginPath();
    ctx.moveTo(0, -3.1); ctx.lineTo(len, -0.8); ctx.lineTo(len + 3, 0); ctx.lineTo(len, 0.8); ctx.lineTo(0, 3.1);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = outline; ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#d7b15e'; ctx.fillRect(-2, -5, 3, 10);
    ctx.fillStyle = '#3a2633'; rr(ctx, -10, -1.7, 8, 3.4, 1.5); ctx.fill();
  } else if (type === 'spear') {
    const len = 60;
    ctx.strokeStyle = '#7a5335'; ctx.lineWidth = 3.2;
    ctx.beginPath(); ctx.moveTo(-2, 0); ctx.lineTo(len - 10, 0); ctx.stroke();
    ctx.shadowColor = c; ctx.shadowBlur = 10;
    ctx.fillStyle = c;
    ctx.beginPath();
    ctx.moveTo(len - 14, -4.4); ctx.lineTo(len + 8, 0); ctx.lineTo(len - 14, 4.4); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = outline; ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#d7b15e';
    ctx.beginPath(); ctx.arc(len - 14, 0, 2.2, 0, Math.PI * 2); ctx.fill();
  } else if (type === 'bow') {
    const r = 26;
    ctx.strokeStyle = '#946a3a'; ctx.lineWidth = 3.4;
    ctx.beginPath(); ctx.arc(0, 0, r, -Math.PI / 2.2, Math.PI / 2.2); ctx.stroke();
    ctx.strokeStyle = hexA(c, 0.9); ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(Math.cos(-Math.PI / 2.2) * r, Math.sin(-Math.PI / 2.2) * r);
    ctx.lineTo(-6, 0);
    ctx.lineTo(Math.cos(Math.PI / 2.2) * r, Math.sin(Math.PI / 2.2) * r); ctx.stroke();
    ctx.fillStyle = c;
    ctx.beginPath(); ctx.arc(0, 0, 2.2, 0, Math.PI * 2); ctx.fill();
  } else if (type === 'staff') {
    const len = 48;
    ctx.strokeStyle = '#7c6a9e'; ctx.lineWidth = 3.6;
    ctx.beginPath(); ctx.moveTo(-5, 0); ctx.lineTo(len - 8, 0); ctx.stroke();
    ctx.strokeStyle = hexA(c, 0.5); ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(-2, -2.3); ctx.lineTo(len - 10, -2.3); ctx.stroke();
    ctx.save();
    ctx.translate(len - 4, 0);
    ctx.globalCompositeOperation = 'lighter';
    glowOrb(ctx, 0, 0, 17, c, 0.5);
    ctx.restore();
    ctx.fillStyle = c;
    star(ctx, len - 4, 0, 6.5, 2.8, 4, t * 0.8); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,.8)'; ctx.lineWidth = 0.8; ctx.stroke();
  } else {
    ctx.fillStyle = c;
    rr(ctx, 0, -2, 28, 4, 2); ctx.fill();
  }
  ctx.restore();
}

export function drawNPC(ctx, npc, opts = {}) {
  const { t = 0, walk = 0, facing = Math.PI / 2, scale = 1 } = opts;
  const appearance = {
    skin: npc.skin || '#d8a078',
    hairColor: npc.hair || '#4d3227',
    outfit: npc.outfit || '#6a7d89',
    accent: npc.accent || npc.color || '#d9bd7f',
    hair: npc.hairStyle || 'corto',
  };
  ctx.save();
  drawHero(ctx, appearance, { t, moving: false, walk, facing, scale, weaponType: 'none', cloak: false, armor: npc.armorColor || null, shield: false });
  // pequeños detalles de NPC
  ctx.globalAlpha = 0.95;
  ctx.fillStyle = npc.color || '#ffe49b';
  ctx.beginPath(); ctx.arc(0, -75 * scale, 2.2, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

export function drawEnemy(ctx, kind, opts = {}) {
  const { t = 0, facing = 0, moving = false, walk = 0, hurt = 0, phase = 1, scale = 1, alpha = 1, attacking = 0 } = opts;
  const flip = Math.cos(facing) < 0 ? -1 : 1;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.scale(flip * scale, scale);
  if (kind === 'gelatina') drawGelatina(ctx, t, moving, walk, hurt, attacking);
  else if (kind === 'lobo') drawLobo(ctx, t, moving, walk, hurt, attacking);
  else if (kind === 'escarabajo') drawEscarabajo(ctx, t, moving, walk, hurt, attacking);
  else if (kind === 'espectro') drawEspectro(ctx, t, hurt, attacking);
  else if (kind === 'guardian') drawGuardian(ctx, t, moving, walk, hurt, phase, attacking);
  else drawGelatina(ctx, t, moving, walk, hurt, attacking);
  ctx.restore();
}

function drawGelatina(ctx, t, moving, walk, hurt, attacking) {
  const squash = 1 + Math.sin(t * 4 + walk) * 0.06 * (moving ? 1.8 : 0.6) + attacking * 0.12;
  ctx.save();
  ctx.translate(0, -4);
  ctx.scale(1 / squash, squash);
  const g = ctx.createRadialGradient(-8, -28, 2, 0, -22, 30);
  g.addColorStop(0, hurt > 0 ? '#ffffff' : 'rgba(170,245,255,.96)');
  g.addColorStop(0.55, hurt > 0 ? '#d8ffff' : 'rgba(76,195,225,.82)');
  g.addColorStop(1, 'rgba(28,102,142,.55)');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(-23, -4);
  ctx.bezierCurveTo(-30, -24, -14, -43, 0, -42);
  ctx.bezierCurveTo(16, -42, 30, -24, 23, -4);
  ctx.quadraticCurveTo(10, 4, 0, 1);
  ctx.quadraticCurveTo(-10, 4, -23, -4);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = 'rgba(180,249,255,.5)'; ctx.lineWidth = 1.3; ctx.stroke();
  // Núcleo
  ctx.fillStyle = 'rgba(255,255,255,.4)';
  ctx.beginPath(); ctx.ellipse(-2, -21, 7, 9, 0.2, 0, Math.PI * 2); ctx.fill();
  // ojos
  ctx.fillStyle = '#153b55';
  ctx.beginPath(); ctx.ellipse(-7, -23, 2.5, 3.2, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(7, -23, 2.5, 3.2, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#eafcff';
  ctx.beginPath(); ctx.arc(-7.6, -24.2, 0.9, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(6.4, -24.2, 0.9, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = 'rgba(20,58,80,.7)'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.arc(0, -17, 3.4, 0.15, Math.PI - 0.15); ctx.stroke();
  // brillo
  ctx.fillStyle = 'rgba(255,255,255,.72)';
  ctx.beginPath(); ctx.ellipse(-11, -33, 4.5, 2.2, -0.7, 0, Math.PI * 2); ctx.fill();
  // gotas
  ctx.fillStyle = 'rgba(140,235,255,.6)';
  ctx.beginPath(); ctx.arc(18, -18 + Math.sin(t * 3) * 3, 2, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

function drawLobo(ctx, t, moving, walk, hurt, attacking) {
  const cycle = walk * 8;
  const bob = Math.sin(cycle) * 1.5;
  // cola
  ctx.strokeStyle = hurt > 0 ? '#fff6ee' : '#6b2f1f';
  ctx.lineWidth = 6; ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-23, -24);
  ctx.quadraticCurveTo(-38, -28 + Math.sin(t * 3) * 3, -38, -40 + Math.sin(t * 2.5) * 4);
  ctx.stroke();
  ctx.strokeStyle = '#ff9b5c'; ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-30, -26);
  ctx.quadraticCurveTo(-37, -31, -37, -39);
  ctx.stroke();
  // patas
  const stride = Math.sin(cycle) * (moving ? 5 : 0);
  ctx.strokeStyle = '#381c17'; ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(-14, -20); ctx.lineTo(-16 - stride * 0.4, -3);
  ctx.moveTo(-3, -19); ctx.lineTo(-2 + stride * 0.4, -3);
  ctx.moveTo(11, -20); ctx.lineTo(13 + stride * 0.3, -3);
  ctx.moveTo(19, -23); ctx.lineTo(22 - stride * 0.3, -5);
  ctx.stroke();
  // cuerpo
  const g = ctx.createLinearGradient(-24, -38, 24, -14);
  g.addColorStop(0, hurt > 0 ? '#fff4e8' : '#5b2d24');
  g.addColorStop(0.55, hurt > 0 ? '#ffe0c8' : '#2e1d24');
  g.addColorStop(1, hurt > 0 ? '#ffd0b0' : '#191823');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.ellipse(-3, -24 + bob, 27, 14, -0.06, 0, Math.PI * 2);
  ctx.fill();
  // melena de ceniza
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 8; i++) {
    const x = -16 + i * 4.4;
    const y = -34 - Math.sin(t * 4 + i) * 3;
    ctx.fillStyle = i % 2 ? 'rgba(255,138,71,.55)' : 'rgba(255,207,112,.35)';
    ctx.beginPath();
    ctx.moveTo(x - 2.5, y + 5);
    ctx.quadraticCurveTo(x + Math.sin(t * 3 + i) * 3, y - 8, x + 3, y - 2);
    ctx.lineTo(x + 5, y + 6);
    ctx.fill();
  }
  ctx.restore();
  // cabeza
  ctx.fillStyle = hurt > 0 ? '#fff0dc' : '#2b1b21';
  ctx.beginPath();
  ctx.ellipse(23, -33 + bob, 13, 11, -0.1, 0, Math.PI * 2);
  ctx.fill();
  // hocico
  ctx.beginPath();
  ctx.moveTo(30, -30 + bob); ctx.lineTo(42, -26 + bob); ctx.lineTo(32, -22 + bob); ctx.closePath(); ctx.fill();
  // orejas
  ctx.beginPath(); ctx.moveTo(16, -42 + bob); ctx.lineTo(13, -53 + bob); ctx.lineTo(23, -43 + bob); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(26, -43 + bob); ctx.lineTo(30, -52 + bob); ctx.lineTo(33, -40 + bob); ctx.closePath(); ctx.fill();
  // ojos
  ctx.fillStyle = '#ffc24a';
  ctx.shadowColor = '#ff9b3c'; ctx.shadowBlur = 8;
  ctx.beginPath(); ctx.ellipse(27, -35 + bob, 2.2, 1.5, 0, 0, Math.PI * 2); ctx.fill();
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#ffe9a5';
  ctx.beginPath(); ctx.arc(27.5, -35.2 + bob, 0.8, 0, Math.PI * 2); ctx.fill();
  if (attacking > 0.2) {
    ctx.fillStyle = 'rgba(255,190,80,.85)';
    ctx.beginPath(); ctx.moveTo(32, -20 + bob); ctx.lineTo(42, -18 + bob); ctx.lineTo(33, -15 + bob); ctx.closePath(); ctx.fill();
  }
}

function drawEscarabajo(ctx, t, moving, walk, hurt, attacking) {
  const cycle = walk * 7;
  const leg = Math.sin(cycle) * (moving ? 3 : 0.8);
  ctx.strokeStyle = '#352c26'; ctx.lineWidth = 4; ctx.lineCap = 'round';
  for (let i = 0; i < 3; i++) {
    const y = -20 + i * 7;
    ctx.beginPath(); ctx.moveTo(-12, y); ctx.lineTo(-26 - (i % 2 ? leg : -leg), y + 4); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(12, y); ctx.lineTo(26 + (i % 2 ? -leg : leg), y + 4); ctx.stroke();
  }
  // caparazón
  const g = ctx.createRadialGradient(-8, -35, 2, 0, -25, 30);
  g.addColorStop(0, hurt > 0 ? '#fff8e8' : '#c2ab87');
  g.addColorStop(0.5, hurt > 0 ? '#ffe9c5' : '#776451');
  g.addColorStop(1, hurt > 0 ? '#ffe0b0' : '#3d352e');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.ellipse(0, -26, 25, 19, 0, Math.PI, Math.PI * 2);
  ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(30,24,20,.65)'; ctx.lineWidth = 1.2; ctx.stroke();
  // placas
  ctx.strokeStyle = 'rgba(240,214,163,.35)';
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(0, -43); ctx.lineTo(0, -9); ctx.moveTo(-16, -36); ctx.lineTo(-21, -12); ctx.moveTo(16, -36); ctx.lineTo(21, -12); ctx.stroke();
  // cabeza
  ctx.fillStyle = hurt > 0 ? '#fff4dd' : '#4a3b2e';
  ctx.beginPath(); ctx.ellipse(0, -12, 9, 6, 0, 0, Math.PI * 2); ctx.fill();
  // cuerno
  ctx.strokeStyle = '#e7cf9e'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(0, -44); ctx.quadraticCurveTo(-2, -54, 5, -57); ctx.stroke();
  // ojos
  ctx.fillStyle = '#ffcf6b'; ctx.shadowColor = '#ffb53c'; ctx.shadowBlur = 8;
  ctx.beginPath(); ctx.arc(-4, -13, 1.7, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(4, -13, 1.7, 0, Math.PI * 2); ctx.fill();
  ctx.shadowBlur = 0;
  // polvo
  if (moving) {
    ctx.fillStyle = 'rgba(200,177,143,.25)';
    for (let i = 0; i < 3; i++) {
      const px = -20 - i * 8 - (t * 40 % 20);
      ctx.beginPath(); ctx.arc(px, -5 + Math.sin(t * 4 + i) * 2, 3 - i * 0.4, 0, Math.PI * 2); ctx.fill();
    }
  }
}

function drawEspectro(ctx, t, hurt, attacking) {
  const float = Math.sin(t * 2.3) * 4;
  ctx.save();
  ctx.translate(0, -14 + float);
  // estela
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const g = ctx.createRadialGradient(0, -20, 2, 0, 0, 38);
  g.addColorStop(0, hurt > 0 ? 'rgba(255,255,255,.8)' : 'rgba(146,98,230,.36)');
  g.addColorStop(1, 'rgba(80,40,160,0)');
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.ellipse(0, -8, 30, 40, 0, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
  // túnica
  const robe = ctx.createLinearGradient(0, -45, 0, 20);
  robe.addColorStop(0, hurt > 0 ? '#fff6ff' : '#d7c3ff');
  robe.addColorStop(0.45, hurt > 0 ? '#f4e6ff' : '#8b5ed1');
  robe.addColorStop(1, 'rgba(56,25,106,.12)');
  ctx.fillStyle = robe;
  ctx.beginPath();
  ctx.moveTo(-15, -34);
  ctx.quadraticCurveTo(-24, -12, -19, 16 + Math.sin(t * 2.8) * 4);
  ctx.quadraticCurveTo(-9, 7, -4, 20 + Math.sin(t * 2.2 + 1) * 4);
  ctx.quadraticCurveTo(2, 8, 8, 17 + Math.sin(t * 2.5 + 2) * 4);
  ctx.quadraticCurveTo(14, 5, 19, 15 + Math.sin(t * 2.7 + 3) * 4);
  ctx.quadraticCurveTo(23, -12, 15, -34);
  ctx.closePath(); ctx.fill();
  // capucha
  ctx.fillStyle = hurt > 0 ? '#fff4ff' : '#3b245f';
  ctx.beginPath();
  ctx.moveTo(-16, -34);
  ctx.quadraticCurveTo(-20, -57, 0, -60);
  ctx.quadraticCurveTo(20, -57, 16, -34);
  ctx.quadraticCurveTo(0, -28, -16, -34);
  ctx.closePath(); ctx.fill();
  // rostro vacío
  ctx.fillStyle = 'rgba(8,4,20,.92)';
  ctx.beginPath(); ctx.ellipse(0, -43, 8, 10, 0, 0, Math.PI * 2); ctx.fill();
  // ojos
  ctx.fillStyle = '#e8c9ff'; ctx.shadowColor = '#b990ff'; ctx.shadowBlur = 12;
  ctx.beginPath(); ctx.ellipse(-3.2, -45, 1.8, 2.6, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(3.4, -45, 1.8, 2.6, 0, 0, Math.PI * 2); ctx.fill();
  ctx.shadowBlur = 0;
  // manos
  ctx.strokeStyle = hurt > 0 ? '#fff0ff' : '#b896ee'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(-14, -30); ctx.lineTo(-22, -18 + Math.sin(t * 3) * 2); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(14, -30); ctx.lineTo(22, -18 + Math.cos(t * 3) * 2); ctx.stroke();
  if (attacking > 0.25) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    glowOrb(ctx, 0, -53, 22 + attacking * 22, '#c79aff', 0.55);
    ctx.restore();
  }
  ctx.restore();
}

function drawGuardian(ctx, t, moving, walk, hurt, phase, attacking) {
  const bob = Math.sin(t * 1.5) * 2;
  const color = phase === 1 ? '#7f5bb5' : phase === 2 ? '#b04d76' : '#d4553d';
  const eye = phase === 1 ? '#c8a8ff' : phase === 2 ? '#ff9ac1' : '#ffdf8c';
  ctx.save();
  ctx.translate(0, -8);
  // capa
  const cape = ctx.createLinearGradient(0, -110, 0, 18);
  cape.addColorStop(0, hexA(color, 0.85));
  cape.addColorStop(0.6, 'rgba(25,16,42,.9)');
  cape.addColorStop(1, 'rgba(20,12,34,.12)');
  ctx.fillStyle = cape;
  ctx.beginPath();
  ctx.moveTo(-30, -96);
  ctx.bezierCurveTo(-64, -70, -58, -6, -48, 20 + Math.sin(t * 1.8) * 5);
  ctx.quadraticCurveTo(0, 4, 48, 20 + Math.sin(t * 1.8 + 1) * 5);
  ctx.bezierCurveTo(58, -6, 64, -70, 30, -96);
  ctx.closePath(); ctx.fill();
  // piernas
  ctx.strokeStyle = hurt > 0 ? '#fff1e6' : '#26202f'; ctx.lineWidth = 16; ctx.lineCap = 'round';
  const stride = Math.sin(walk * 6) * (moving ? 5 : 0);
  ctx.beginPath();
  ctx.moveTo(-14, -42); ctx.lineTo(-17 - stride, -4);
  ctx.moveTo(14, -42); ctx.lineTo(17 + stride, -4);
  ctx.stroke();
  ctx.strokeStyle = hexA(color, 0.55); ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(-18 - stride, -9); ctx.lineTo(-18 - stride, -2); ctx.stroke();
  // torso
  const armor = ctx.createLinearGradient(-35, -95, 32, -38);
  armor.addColorStop(0, hurt > 0 ? '#fff4ee' : '#665a7d');
  armor.addColorStop(0.5, hurt > 0 ? '#ffe1d5' : '#3a314e');
  armor.addColorStop(1, hurt > 0 ? '#ffd2c0' : '#211a31');
  ctx.fillStyle = armor;
  ctx.beginPath();
  ctx.moveTo(-30, -95 + bob);
  ctx.quadraticCurveTo(-44, -80, -32, -42 + bob);
  ctx.quadraticCurveTo(0, -30 + bob, 32, -42 + bob);
  ctx.quadraticCurveTo(44, -80, 30, -95 + bob);
  ctx.quadraticCurveTo(0, -104 + bob, -30, -95 + bob);
  ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(5,4,12,.7)'; ctx.lineWidth = 1.5; ctx.stroke();
  // hombreras
  ctx.fillStyle = hurt > 0 ? '#ffe5d8' : '#493d61';
  ctx.beginPath(); ctx.ellipse(-32, -88 + bob, 15, 10, -0.3, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.ellipse(32, -88 + bob, 15, 10, 0.3, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  // runas
  ctx.fillStyle = color;
  ctx.shadowColor = color; ctx.shadowBlur = 9;
  star(ctx, 0, -67 + bob, 7, 3, 4, t * 0.4); ctx.fill();
  ctx.shadowBlur = 0;
  // casco
  ctx.fillStyle = hurt > 0 ? '#fff2e8' : '#2e2740';
  ctx.beginPath();
  ctx.moveTo(-18, -99 + bob);
  ctx.quadraticCurveTo(-19, -127 + bob, 0, -130 + bob);
  ctx.quadraticCurveTo(19, -127 + bob, 18, -99 + bob);
  ctx.quadraticCurveTo(0, -93 + bob, -18, -99 + bob);
  ctx.fill();
  ctx.strokeStyle = 'rgba(10,6,20,.8)'; ctx.stroke();
  // cuernos
  ctx.strokeStyle = phase === 3 ? '#ffb35c' : '#8e7bb5'; ctx.lineWidth = 5; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(-14, -120 + bob); ctx.quadraticCurveTo(-25, -134 + bob, -17, -146 + bob); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(14, -120 + bob); ctx.quadraticCurveTo(25, -134 + bob, 17, -146 + bob); ctx.stroke();
  // ojos
  ctx.fillStyle = eye; ctx.shadowColor = eye; ctx.shadowBlur = 16;
  ctx.beginPath(); ctx.ellipse(-6.5, -113 + bob, 3, 1.5, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(6.5, -113 + bob, 3, 1.5, 0, 0, Math.PI * 2); ctx.fill();
  ctx.shadowBlur = 0;
  // mandoble
  ctx.save();
  ctx.translate(34, -78 + bob);
  const swing = attacking > 0 ? -1.6 + attacking * 3.2 : -0.35;
  ctx.rotate(swing);
  ctx.shadowColor = color; ctx.shadowBlur = 16;
  const bg = ctx.createLinearGradient(0, -8, 78, 8);
  bg.addColorStop(0, '#f7ecff'); bg.addColorStop(0.5, '#8d77b8'); bg.addColorStop(1, '#2e2444');
  ctx.fillStyle = bg;
  ctx.beginPath(); ctx.moveTo(0, -8); ctx.lineTo(72, -5); ctx.lineTo(86, 0); ctx.lineTo(72, 5); ctx.lineTo(0, 8); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,.6)'; ctx.lineWidth = 1; ctx.stroke();
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#b28c4d'; ctx.fillRect(-4, -13, 5, 26);
  ctx.fillStyle = '#2a2237'; rr(ctx, -18, -3, 14, 6, 2); ctx.fill();
  ctx.restore();
  // aura de fase
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const pulse = 0.22 + Math.sin(t * 2.2) * 0.08;
  glowOrb(ctx, 0, -66, 84 + phase * 8, color, pulse);
  ctx.restore();
  ctx.restore();
}

const CREATURE_GLOW = {
  luz: '#ffe49b', fuego: '#ff8b5f', agua: '#67d9ff', tierra: '#d3a46b', viento: '#a9f1d6',
  rayo: '#ffe26e', hielo: '#bfeaff', oscuridad: '#b990ff', naturaleza: '#9ce98a', celestial: '#fff1b8',
};

export function drawCreature(ctx, speciesId, opts = {}) {
  const sp = CREATURES[speciesId];
  if (!sp) return;
  const { t = 0, wild = false, hurt = 0, scale = 1, facing = 1, alpha = 1, mounted = false } = opts;
  const colors = sp.colors || ['#fff', '#aaa', '#fff'];
  const col = CREATURE_GLOW[sp.affinity] || colors[1];
  const float = mounted ? 0 : Math.sin(t * 2.6 + speciesId.length) * 4;
  const idScale = (sp.scale || 0.8) * scale;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(0, -float);
  if (!mounted) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    glowOrb(ctx, 0, -20, 32 * idScale, col, wild ? 0.22 : 0.3);
    ctx.restore();
  }
  ctx.scale(facing < 0 ? -idScale : idScale, idScale);
  const hurtMix = hurt > 0 ? 1 : 0;
  const c0 = hurtMix ? '#ffffff' : colors[0];
  const c1 = hurtMix ? '#fffaf0' : colors[1];
  const c2 = hurtMix ? '#ffffff' : colors[2];
  const shape = sp.shape;
  if (shape === 'orb') {
    const g = ctx.createRadialGradient(-4, -24, 2, 0, -17, 20);
    g.addColorStop(0, c0); g.addColorStop(0.65, c1); g.addColorStop(1, c2);
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.ellipse(0, -18, 15, 17, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = hexA(c0, 0.8); ctx.lineWidth = 1; ctx.stroke();
    // alas de luz
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = hexA(c0, 0.32);
    ctx.beginPath(); ctx.ellipse(-13, -23, 9, 5, -0.7, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(13, -23, 9, 5, 0.7, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    // ojos
    ctx.fillStyle = '#26314b';
    ctx.beginPath(); ctx.ellipse(-4.5, -21, 1.6, 2.3, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(4.5, -21, 1.6, 2.3, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(-5, -22, 0.6, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(4, -22, 0.6, 0, Math.PI * 2); ctx.fill();
    // cola
    ctx.strokeStyle = hexA(c1, 0.85); ctx.lineWidth = 3; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(10, -13); ctx.quadraticCurveTo(20, -10 + Math.sin(t * 4) * 2, 22, -20); ctx.stroke();
    // marca
    ctx.fillStyle = hexA(c2, 0.9);
    star(ctx, 0, -30, 2.8, 1.2, 4, t); ctx.fill();
  } else if (shape === 'fox') {
    // cola
    ctx.strokeStyle = c1; ctx.lineWidth = 6; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-10, -15); ctx.quadraticCurveTo(-24, -20 + Math.sin(t * 3) * 3, -24, -36); ctx.stroke();
    ctx.strokeStyle = c2; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(-22, -32); ctx.quadraticCurveTo(-25, -38, -22, -42); ctx.stroke();
    // cuerpo
    const g = ctx.createLinearGradient(-12, -32, 12, -8);
    g.addColorStop(0, c0); g.addColorStop(0.6, c1); g.addColorStop(1, c2);
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.ellipse(-1, -15, 14, 11, 0, 0, Math.PI * 2); ctx.fill();
    // patas
    ctx.strokeStyle = c1; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(-7, -9); ctx.lineTo(-8, -2); ctx.moveTo(7, -9); ctx.lineTo(8, -2); ctx.stroke();
    // cabeza
    ctx.fillStyle = c0;
    ctx.beginPath(); ctx.ellipse(9, -28, 10, 9, -0.1, 0, Math.PI * 2); ctx.fill();
    // orejas
    ctx.fillStyle = c1;
    ctx.beginPath(); ctx.moveTo(3, -34); ctx.lineTo(2, -45); ctx.lineTo(10, -36); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(13, -36); ctx.lineTo(18, -45); ctx.lineTo(19, -33); ctx.closePath(); ctx.fill();
    ctx.fillStyle = c2;
    ctx.beginPath(); ctx.moveTo(5, -36); ctx.lineTo(5, -42); ctx.lineTo(9, -37); ctx.closePath(); ctx.fill();
    // ojos
    ctx.fillStyle = '#26314b';
    ctx.beginPath(); ctx.arc(12, -29, 1.5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(12.3, -29.5, 0.5, 0, Math.PI * 2); ctx.fill();
    // hocico
    ctx.fillStyle = c2;
    ctx.beginPath(); ctx.ellipse(18, -25, 3.4, 2.4, 0, 0, Math.PI * 2); ctx.fill();
    // llama de la frente
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = hexA(col, 0.8);
    ctx.beginPath(); ctx.moveTo(8, -38); ctx.quadraticCurveTo(10, -48, 14, -40); ctx.quadraticCurveTo(12, -42, 8, -38); ctx.fill();
    ctx.restore();
    // brillo
    ctx.fillStyle = 'rgba(255,255,255,.65)';
    ctx.beginPath(); ctx.ellipse(-4, -21, 7, 2.2, 0.2, 0, Math.PI * 2); ctx.fill();
  } else if (shape === 'golem') {
    const bob = Math.sin(t * 1.8) * 1.5;
    // cuerpo
    const g = ctx.createRadialGradient(-5, -25, 3, 0, -16, 22);
    g.addColorStop(0, c0); g.addColorStop(0.65, c1); g.addColorStop(1, c2);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(-16, -20); ctx.lineTo(-20, -38); ctx.lineTo(-10, -35); ctx.lineTo(-6, -49 + bob);
    ctx.lineTo(6, -49 + bob); ctx.lineTo(10, -35); ctx.lineTo(20, -38); ctx.lineTo(16, -18);
    ctx.quadraticCurveTo(0, -6, -16, -20); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(30,50,20,.35)'; ctx.lineWidth = 1; ctx.stroke();
    // brazos
    ctx.strokeStyle = c1; ctx.lineWidth = 6; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-16, -28); ctx.lineTo(-25, -16); ctx.moveTo(16, -28); ctx.lineTo(25, -16); ctx.stroke();
    // hojas
    ctx.fillStyle = '#7dc95f';
    ctx.beginPath(); ctx.ellipse(-8, -47, 4, 7, -0.6, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(6, -45, 3.5, 6, 0.7, 0, Math.PI * 2); ctx.fill();
    // ojos
    ctx.fillStyle = '#2c3b22';
    ctx.beginPath(); ctx.arc(-5, -35, 1.8, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(5, -35, 1.8, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#eaffd2';
    ctx.beginPath(); ctx.arc(-5.5, -35.5, 0.65, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(4.5, -35.5, 0.65, 0, Math.PI * 2); ctx.fill();
    // runas
    ctx.fillStyle = hexA(col, 0.8);
    star(ctx, 0, -24, 2.6, 1.1, 4, t); ctx.fill();
  } else if (shape === 'bird') {
    // alas
    const flap = Math.sin(t * 5) * 0.25;
    ctx.save();
    ctx.translate(0, -25);
    ctx.rotate(flap);
    ctx.fillStyle = hexA(c0, 0.9);
    ctx.beginPath(); ctx.ellipse(-15, 0, 16, 6, -0.35, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(15, 0, 16, 6, 0.35, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    // cuerpo
    const g = ctx.createLinearGradient(-8, -34, 8, -8);
    g.addColorStop(0, c0); g.addColorStop(0.6, c1); g.addColorStop(1, c2);
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.ellipse(0, -18, 9, 13, 0, 0, Math.PI * 2); ctx.fill();
    // cabeza
    ctx.beginPath(); ctx.arc(4, -30, 8, 0, Math.PI * 2); ctx.fill();
    // pico
    ctx.fillStyle = '#e8b95c';
    ctx.beginPath(); ctx.moveTo(11, -31); ctx.lineTo(18, -28); ctx.lineTo(11, -26); ctx.closePath(); ctx.fill();
    // ojo
    ctx.fillStyle = '#26314b'; ctx.beginPath(); ctx.arc(7, -32, 1.4, 0, Math.PI * 2); ctx.fill();
    // plumas
    ctx.strokeStyle = c2; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(-2, -20); ctx.lineTo(-4, -11); ctx.moveTo(3, -21); ctx.lineTo(3, -10); ctx.stroke();
  } else if (shape === 'drake') {
    // cola serpiente
    ctx.strokeStyle = c1; ctx.lineWidth = 7; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-9, -12); ctx.bezierCurveTo(-24, -5, -30, -21, -35, -13 + Math.sin(t * 3) * 3); ctx.stroke();
    // cuerpo
    const g = ctx.createLinearGradient(-10, -34, 12, -4);
    g.addColorStop(0, c0); g.addColorStop(0.55, c1); g.addColorStop(1, c2);
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.ellipse(0, -17, 13, 14, 0, 0, Math.PI * 2); ctx.fill();
    // cabeza
    ctx.beginPath(); ctx.ellipse(8, -31, 10, 8, -0.2, 0, Math.PI * 2); ctx.fill();
    // aleta
    ctx.fillStyle = hexA(c0, 0.85);
    ctx.beginPath(); ctx.moveTo(2, -38); ctx.lineTo(5, -48); ctx.lineTo(10, -38); ctx.closePath(); ctx.fill();
    // ojos
    ctx.fillStyle = '#26314b'; ctx.beginPath(); ctx.arc(12, -32, 1.6, 0, Math.PI * 2); ctx.fill();
    // escamas
    ctx.strokeStyle = hexA(c2, 0.7); ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(0, -20, 7, 0.2, 2.6); ctx.stroke();
  } else { // star
    ctx.save();
    ctx.rotate(Math.sin(t * 1.3) * 0.12);
    ctx.shadowColor = c0; ctx.shadowBlur = 16;
    const g = ctx.createRadialGradient(0, -24, 2, 0, -24, 22);
    g.addColorStop(0, c0); g.addColorStop(0.6, c1); g.addColorStop(1, hexA(c2, 0.7));
    ctx.fillStyle = g;
    star(ctx, 0, -24, 19, 8, 5, -Math.PI / 2 + t * 0.1); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,.85)'; ctx.lineWidth = 0.8; ctx.stroke();
    ctx.shadowBlur = 0;
    // núcleo
    ctx.fillStyle = '#fffbe8';
    ctx.beginPath(); ctx.arc(0, -24, 4.5, 0, Math.PI * 2); ctx.fill();
    // ojos
    ctx.fillStyle = '#493d2d';
    ctx.beginPath(); ctx.arc(-2, -25, 0.9, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(2, -25, 0.9, 0, Math.PI * 2); ctx.fill();
    // anillo
    ctx.strokeStyle = hexA(c0, 0.6); ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.ellipse(0, -24, 25, 7, -0.3, 0, Math.PI * 2); ctx.stroke();
    ctx.restore();
  }
  if (wild) {
    ctx.strokeStyle = hexA(col, 0.45);
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.ellipse(0, -22, 27, 30, 0, 0, Math.PI * 2); ctx.stroke();
  }
  ctx.restore();
}

export function drawBust(ctx, opts = {}) {
  const { w = 96, h = 96, skin = '#e3a87e', hairColor = '#2a1b17', outfit = '#2c6ea3', accent = '#f5c86f', hair = 'corto', bg = '#1a2440', accessory = null } = opts;
  ctx.clearRect(0, 0, w, h);
  const bgGrad = ctx.createRadialGradient(w * 0.35, h * 0.3, 2, w * 0.5, h * 0.5, w * 0.65);
  bgGrad.addColorStop(0, hexA(accent, 0.25));
  bgGrad.addColorStop(1, bg);
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, w, h);
  // rayos suaves
  ctx.save();
  ctx.globalAlpha = 0.2;
  ctx.strokeStyle = accent;
  ctx.lineWidth = 1;
  for (let i = 0; i < 7; i++) {
    ctx.beginPath();
    ctx.moveTo(w * 0.1 + i * 14, h);
    ctx.lineTo(w * 0.5, h * 0.35);
    ctx.stroke();
  }
  ctx.restore();
  ctx.save();
  ctx.translate(w / 2, h * 0.93);
  const s = w / 80;
  ctx.scale(s, s);
  // hombros
  const g = ctx.createLinearGradient(-26, -32, 26, 4);
  g.addColorStop(0, lighten(outfit, 22)); g.addColorStop(1, darken(outfit, 25));
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.ellipse(0, -2, 32, 26, 0, Math.PI, Math.PI * 2); ctx.fill();
  ctx.fillStyle = accent;
  ctx.beginPath(); ctx.ellipse(0, -5, 10, 12, 0, Math.PI, Math.PI * 2); ctx.fill();
  // cuello
  ctx.fillStyle = darken(skin, 8);
  ctx.fillRect(-6, -25, 12, 12);
  // rostro
  ctx.fillStyle = skin;
  ctx.beginPath(); ctx.ellipse(0, -37, 17, 20, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = 'rgba(50,24,18,.35)'; ctx.lineWidth = 1; ctx.stroke();
  // ojos
  ctx.fillStyle = '#fffaf1';
  ctx.beginPath(); ctx.ellipse(-6, -39, 3.3, 3.8, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(6, -39, 3.3, 3.8, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = accent;
  ctx.beginPath(); ctx.arc(-5.5, -38.5, 1.9, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(6.5, -38.5, 1.9, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#1a1626';
  ctx.beginPath(); ctx.arc(-5.5, -38.5, 0.9, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(6.5, -38.5, 0.9, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,.9)';
  ctx.beginPath(); ctx.arc(-4.5, -39.4, 0.6, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(7.5, -39.4, 0.6, 0, Math.PI * 2); ctx.fill();
  // cejas y boca
  ctx.strokeStyle = darken(hairColor, 10); ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.moveTo(-9, -44); ctx.lineTo(-3, -44.5); ctx.moveTo(3, -44.5); ctx.lineTo(9, -44); ctx.stroke();
  ctx.strokeStyle = 'rgba(122,63,47,.65)'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.arc(0, -31, 3.1, 0.15, Math.PI - 0.15); ctx.stroke();
  // cabello
  drawBustHair(ctx, hair, hairColor);
  if (accessory) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    glowOrb(ctx, 0, -33, 38, accessory, 0.18);
    ctx.restore();
  }
  ctx.restore();
}

function drawBustHair(ctx, style, color) {
  const c1 = lighten(color, 20), c2 = darken(color, 15);
  const g = ctx.createLinearGradient(-18, -60, 18, -20);
  g.addColorStop(0, c1); g.addColorStop(0.55, color); g.addColorStop(1, c2);
  ctx.fillStyle = g;
  if (style === 'largo') {
    ctx.beginPath();
    ctx.ellipse(0, -42, 19, 20, 0, Math.PI, Math.PI * 2);
    ctx.quadraticCurveTo(24, -35, 22, -5);
    ctx.quadraticCurveTo(16, -10, 12, -18);
    ctx.quadraticCurveTo(4, -12, 0, -20);
    ctx.quadraticCurveTo(-5, -10, -12, -18);
    ctx.quadraticCurveTo(-20, -8, -22, -4);
    ctx.quadraticCurveTo(-24, -35, -19, -42);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-16, -50);
    ctx.quadraticCurveTo(-4, -60, 8, -52);
    ctx.quadraticCurveTo(2, -50, -4, -44);
    ctx.quadraticCurveTo(-8, -52, -16, -50);
    ctx.fill();
  } else if (style === 'coleta') {
    ctx.beginPath();
    ctx.ellipse(0, -42, 19, 19, 0, Math.PI, Math.PI * 2);
    ctx.quadraticCurveTo(16, -34, 14, -24);
    ctx.quadraticCurveTo(8, -32, 0, -26);
    ctx.quadraticCurveTo(-8, -32, -14, -24);
    ctx.quadraticCurveTo(-17, -34, -19, -42);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(15, -47);
    ctx.bezierCurveTo(30, -40, 32, -18, 24, -6);
    ctx.bezierCurveTo(24, -22, 20, -34, 14, -40);
    ctx.fill();
  } else if (style === 'erizado') {
    ctx.beginPath();
    ctx.moveTo(-19, -41);
    for (let i = 0; i < 7; i++) {
      const x = -18 + i * 6;
      ctx.lineTo(x + 2, -60 - (i % 2 ? 4 : 8));
      ctx.lineTo(x + 6, -49);
    }
    ctx.lineTo(19, -40);
    ctx.quadraticCurveTo(0, -32, -19, -41);
    ctx.fill();
  } else {
    ctx.beginPath();
    ctx.ellipse(0, -42, 19, 19, 0, Math.PI, Math.PI * 2);
    ctx.quadraticCurveTo(18, -34, 13, -25);
    ctx.quadraticCurveTo(9, -34, 4, -45);
    ctx.quadraticCurveTo(0, -36, -4, -44);
    ctx.quadraticCurveTo(-9, -32, -14, -26);
    ctx.quadraticCurveTo(-18, -34, -19, -42);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-14, -52);
    ctx.quadraticCurveTo(0, -62, 14, -51);
    ctx.quadraticCurveTo(5, -49, -1, -43);
    ctx.quadraticCurveTo(-7, -50, -14, -52);
    ctx.fill();
  }
}

export function drawMenuScene(ctx, w, h, t, quality = 'alta') {
  // Cielo nocturno con auroras
  const sky = ctx.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, '#060b1d');
  sky.addColorStop(0.42, '#0d1a38');
  sky.addColorStop(0.72, '#203056');
  sky.addColorStop(1, '#0b1329');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);

  // estrellas
  ctx.save();
  for (let i = 0; i < (quality === 'alta' ? 150 : 70); i++) {
    const x = ((i * 137.51) % w);
    const y = ((i * 89.13) % (h * 0.65));
    const tw = 0.35 + Math.abs(Math.sin(t * 0.8 + i)) * 0.55;
    ctx.fillStyle = `rgba(${i % 5 === 0 ? '255,225,160' : '200,230,255'},${tw * 0.8})`;
    ctx.beginPath();
    ctx.arc(x, y, i % 17 === 0 ? 1.8 : 0.8, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // aurora
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  for (let layer = 0; layer < 3; layer++) {
    const grad = ctx.createLinearGradient(0, h * 0.15, w, h * 0.5);
    grad.addColorStop(0, 'rgba(84,180,220,0)');
    grad.addColorStop(0.4, layer === 1 ? 'rgba(120,100,220,.075)' : 'rgba(70,200,190,.06)');
    grad.addColorStop(0.7, 'rgba(90,150,255,.065)');
    grad.addColorStop(1, 'rgba(90,150,255,0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(0, h * (0.25 + layer * 0.08));
    for (let x = 0; x <= w; x += 60) {
      const y = h * (0.25 + layer * 0.08) + Math.sin(x * 0.004 + t * 0.22 + layer) * 34 + Math.sin(x * 0.011 + t * 0.1) * 12;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(w, h * 0.55);
    ctx.lineTo(0, h * 0.55);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();

  // luna
  const moonX = w * 0.24, moonY = h * 0.23, moonR = h * 0.1;
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const mg = ctx.createRadialGradient(moonX, moonY, moonR * 0.4, moonX, moonY, moonR * 3.5);
  mg.addColorStop(0, 'rgba(255,247,212,.48)');
  mg.addColorStop(0.3, 'rgba(255,238,180,.16)');
  mg.addColorStop(1, 'rgba(255,238,180,0)');
  ctx.fillStyle = mg;
  ctx.beginPath(); ctx.arc(moonX, moonY, moonR * 3.5, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
  const moon = ctx.createRadialGradient(moonX - moonR * 0.3, moonY - moonR * 0.3, 2, moonX, moonY, moonR);
  moon.addColorStop(0, '#fffdf1');
  moon.addColorStop(0.7, '#f6e9bf');
  moon.addColorStop(1, '#d8bf83');
  ctx.fillStyle = moon;
  ctx.beginPath(); ctx.arc(moonX, moonY, moonR, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'rgba(190,170,120,.22)';
  ctx.beginPath(); ctx.arc(moonX - moonR * 0.32, moonY + moonR * 0.2, moonR * 0.2, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(moonX + moonR * 0.3, moonY - moonR * 0.25, moonR * 0.13, 0, Math.PI * 2); ctx.fill();

  // montañas lejanas
  ctx.fillStyle = '#111c35';
  ctx.beginPath();
  ctx.moveTo(0, h * 0.62);
  for (let x = 0; x <= w; x += 120) {
    ctx.lineTo(x, h * 0.48 + Math.sin(x * 0.004 + 1.4) * 38 + Math.sin(x * 0.013) * 16);
  }
  ctx.lineTo(w, h);
  ctx.lineTo(0, h);
  ctx.fill();
  ctx.fillStyle = 'rgba(70,105,160,.22)';
  ctx.beginPath();
  ctx.moveTo(w * 0.45, h * 0.62);
  ctx.lineTo(w * 0.61, h * 0.43);
  ctx.lineTo(w * 0.78, h * 0.62);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#0b1428';
  ctx.beginPath();
  ctx.moveTo(0, h * 0.7);
  for (let x = 0; x <= w; x += 90) {
    ctx.lineTo(x, h * 0.58 + Math.sin(x * 0.006 + 2.8) * 30 + Math.sin(x * 0.017) * 12);
  }
  ctx.lineTo(w, h); ctx.lineTo(0, h); ctx.fill();

  // bosque en silueta
  ctx.fillStyle = '#070d1c';
  for (let i = 0; i < 22; i++) {
    const x = (i / 21) * w + Math.sin(i * 9.1) * 20;
    const base = h * (0.66 + Math.sin(i * 3.7) * 0.02);
    const height = h * (0.18 + (i % 5) * 0.025);
    ctx.beginPath();
    ctx.moveTo(x, base);
    ctx.lineTo(x - height * 0.12, base);
    ctx.lineTo(x - height * 0.06, base - height * 0.45);
    ctx.lineTo(x - height * 0.18, base - height * 0.4);
    ctx.lineTo(x, base - height);
    ctx.lineTo(x + height * 0.18, base - height * 0.4);
    ctx.lineTo(x + height * 0.06, base - height * 0.45);
    ctx.lineTo(x + height * 0.12, base);
    ctx.closePath();
    ctx.fill();
  }

  // suelo / niebla
  const fog = ctx.createLinearGradient(0, h * 0.62, 0, h);
  fog.addColorStop(0, 'rgba(30,55,84,0)');
  fog.addColorStop(0.5, 'rgba(22,45,72,.6)');
  fog.addColorStop(1, 'rgba(6,12,26,.95)');
  ctx.fillStyle = fog;
  ctx.fillRect(0, h * 0.55, w, h * 0.45);

  // resplandor central
  const sx = w * 0.5, sy = h * 0.8;
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const sg = ctx.createRadialGradient(sx, sy - 40, 2, sx, sy - 40, Math.min(w, h) * 0.38);
  sg.addColorStop(0, 'rgba(255,230,158,.24)');
  sg.addColorStop(0.35, 'rgba(120,180,255,.09)');
  sg.addColorStop(1, 'rgba(90,150,255,0)');
  ctx.fillStyle = sg;
  ctx.beginPath(); ctx.arc(sx, sy - 40, Math.min(w, h) * 0.38, 0, Math.PI * 2); ctx.fill();
  ctx.restore();

  // piedra y espada
  drawMenuSword(ctx, sx, sy + 20, t, h);

  // partículas / luciérnagas
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 36; i++) {
    const x = (Math.sin(t * 0.25 + i * 2.1) * 0.5 + 0.5) * w;
    const y = h * (0.35 + ((i * 0.137 + t * 0.008) % 0.58)) + Math.sin(t * 0.9 + i) * 12;
    const r = 1 + Math.abs(Math.sin(t * 1.6 + i * 0.7)) * 2.2;
    ctx.fillStyle = `rgba(255,${205 + (i % 3) * 15},120,${0.15 + Math.abs(Math.sin(t + i)) * 0.28})`;
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();

  // niebla baja animada
  ctx.save();
  ctx.globalAlpha = 0.09;
  for (let i = 0; i < 5; i++) {
    const y = h * (0.74 + i * 0.045);
    const x = Math.sin(t * 0.12 + i * 1.7) * w * 0.14;
    const fg = ctx.createLinearGradient(0, y, 0, y + 35);
    fg.addColorStop(0, 'rgba(180,220,255,0)');
    fg.addColorStop(0.5, 'rgba(180,220,255,.7)');
    fg.addColorStop(1, 'rgba(180,220,255,0)');
    ctx.fillStyle = fg;
    ctx.beginPath();
    ctx.ellipse(w * 0.5 + x, y, w * (0.4 + i * 0.05), 26, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawMenuSword(ctx, x, y, t, h) {
  // roca
  ctx.save();
  ctx.translate(x, y);
  const rock = ctx.createLinearGradient(-100, 0, 100, 80);
  rock.addColorStop(0, '#263650');
  rock.addColorStop(0.5, '#18243a');
  rock.addColorStop(1, '#0a1120');
  ctx.fillStyle = rock;
  ctx.beginPath();
  ctx.moveTo(-96, 70);
  ctx.lineTo(-72, 10);
  ctx.lineTo(-38, -2);
  ctx.lineTo(-14, 6);
  ctx.lineTo(8, -6);
  ctx.lineTo(48, 0);
  ctx.lineTo(78, 24);
  ctx.lineTo(102, 75);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = 'rgba(120,170,220,.18)'; ctx.lineWidth = 1.5;
  ctx.stroke();
  // musgo
  ctx.fillStyle = 'rgba(55,110,83,.35)';
  ctx.beginPath(); ctx.ellipse(-54, 34, 30, 8, -0.12, 0, Math.PI * 2); ctx.fill();
  // espada
  ctx.save();
  ctx.translate(0, -24);
  ctx.rotate(-0.08 + Math.sin(t * 0.5) * 0.01);
  const glow = ctx.createRadialGradient(0, -80, 3, 0, -80, 140);
  glow.addColorStop(0, 'rgba(255,239,177,.35)');
  glow.addColorStop(0.4, 'rgba(140,200,255,.11)');
  glow.addColorStop(1, 'rgba(80,150,255,0)');
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.fillStyle = glow;
  ctx.beginPath(); ctx.arc(0, -80, 140, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
  // hoja
  const blade = ctx.createLinearGradient(-12, 0, 13, 0);
  blade.addColorStop(0, '#d6edff');
  blade.addColorStop(0.38, '#fff7d0');
  blade.addColorStop(0.62, '#fffdf2');
  blade.addColorStop(1, '#9abfd9');
  ctx.fillStyle = blade;
  ctx.shadowColor = '#ffe8a0'; ctx.shadowBlur = 24;
  ctx.beginPath();
  ctx.moveTo(0, -168);
  ctx.lineTo(12, -140);
  ctx.lineTo(9, -44);
  ctx.lineTo(-9, -44);
  ctx.lineTo(-12, -140);
  ctx.closePath();
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.strokeStyle = 'rgba(255,255,255,.95)'; ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.moveTo(0, -160); ctx.lineTo(0, -50); ctx.stroke();
  // runas
  ctx.fillStyle = 'rgba(255,228,150,.9)';
  for (let i = 0; i < 4; i++) {
    const yy = -120 + i * 17;
    ctx.beginPath(); ctx.arc(0, yy, 1.7, 0, Math.PI * 2); ctx.fill();
  }
  // guarda
  ctx.fillStyle = '#d9b564';
  ctx.beginPath();
  ctx.moveTo(-28, -44); ctx.quadraticCurveTo(0, -32, 28, -44);
  ctx.lineTo(25, -34); ctx.quadraticCurveTo(0, -24, -25, -34); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#6b482b';
  rr(ctx, -5, -34, 10, 30, 4); ctx.fill();
  ctx.fillStyle = '#e7c46d';
  ctx.beginPath(); ctx.arc(0, -2, 6, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
  // rayos
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 4; i++) {
    const a = t * 0.18 + i * Math.PI / 2;
    ctx.strokeStyle = `rgba(255,232,170,${0.06 + Math.sin(t + i) * 0.02})`;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(Math.cos(a) * 24, -160 + Math.sin(a) * 24);
    ctx.lineTo(Math.cos(a) * 150, -160 + Math.sin(a) * 150);
    ctx.stroke();
  }
  ctx.restore();
  ctx.restore();
}

export function drawSkillIcon(ctx, skill, x, y, size, color) {
  ctx.save();
  ctx.translate(x, y);
  const g = ctx.createRadialGradient(0, 0, 2, 0, 0, size * 0.5);
  g.addColorStop(0, hexA(color, 0.9));
  g.addColorStop(1, hexA(color, 0));
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(0, 0, size * 0.5, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

export function lighten(hex, amt) {
  if (!hex || !hex.startsWith('#')) return hex;
  let h = hex.slice(1);
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  const n = parseInt(h, 16);
  const r = clamp(((n >> 16) & 255) + amt, 0, 255);
  const g = clamp(((n >> 8) & 255) + amt, 0, 255);
  const b = clamp((n & 255) + amt, 0, 255);
  return `rgb(${r},${g},${b})`;
}

export function darken(hex, amt) {
  if (!hex || !hex.startsWith('#')) return hex;
  let h = hex.slice(1);
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  const n = parseInt(h, 16);
  const r = clamp(((n >> 16) & 255) - amt, 0, 255);
  const g = clamp(((n >> 8) & 255) - amt, 0, 255);
  const b = clamp((n & 255) - amt, 0, 255);
  return `rgb(${r},${g},${b})`;
}

export const ENEMY_COLORS = ENEMIES;
