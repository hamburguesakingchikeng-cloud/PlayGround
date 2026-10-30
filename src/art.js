// ============================================================
// Arte vectorial procedural — héroes, criaturas y enemigos
// ============================================================
import { AFFINITIES, CREATURES, ENEMIES, WEAPONS } from './data.js';

const TAU = Math.PI * 2;
export const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
export const lerp = (a, b, t) => a + (b - a) * t;
export function rgba(hex, a) {
  if (!hex) return `rgba(255,255,255,${a})`;
  if (hex.startsWith('rgb')) return hex;
  const h = hex.replace('#', '');
  const n = h.length === 3 ? h.split('').map(c => c + c).join('') : h;
  return `rgba(${parseInt(n.slice(0, 2), 16)},${parseInt(n.slice(2, 4), 16)},${parseInt(n.slice(4, 6), 16)},${a})`;
}
export function shade(hex, amt) {
  if (!hex || !hex.startsWith('#')) return hex;
  const h = hex.replace('#', '');
  const n = h.length === 3 ? h.split('').map(c => c + c).join('') : h;
  const c = [0, 2, 4].map(i => clamp(Math.round(parseInt(n.slice(i, i + 2), 16) + amt), 0, 255));
  return `#${c.map(v => v.toString(16).padStart(2, '0')).join('')}`;
}
export function roundRect(ctx, x, y, w, h, r) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath(); ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr); ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr); ctx.arcTo(x, y, x + w, y, rr); ctx.closePath();
}
function ellipse(ctx, x, y, rx, ry, fill) { ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, TAU); ctx.fillStyle = fill; ctx.fill(); }
function glow(ctx, x, y, r, color) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, color); g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2);
}
function eye(ctx, x, y, r, color = '#1b2233') {
  ctx.fillStyle = color; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,.8)'; ctx.beginPath(); ctx.arc(x - r * .3, y - r * .3, r * .3, 0, TAU); ctx.fill();
}
function hairBack(ctx, style, color) {
  ctx.fillStyle = shade(color, -18);
  if (style === 0) {
    ctx.beginPath(); ctx.moveTo(-13, -48); ctx.quadraticCurveTo(-17, -33, -9, -24); ctx.lineTo(-2, -30); ctx.quadraticCurveTo(-7, -39, -4, -48); ctx.fill();
    ctx.beginPath(); ctx.moveTo(10, -50); ctx.quadraticCurveTo(19, -38, 15, -25); ctx.lineTo(7, -30); ctx.quadraticCurveTo(12, -40, 7, -49); ctx.fill();
  } else if (style === 1) {
    ctx.beginPath(); ctx.moveTo(-10, -50); ctx.quadraticCurveTo(-22, -34, -15, -14); ctx.quadraticCurveTo(-11, -26, -5, -34); ctx.fill();
    ctx.beginPath(); ctx.moveTo(9, -50); ctx.quadraticCurveTo(17, -36, 13, -22); ctx.lineTo(7, -30); ctx.fill();
  } else if (style === 2) {
    ctx.beginPath(); ctx.moveTo(-12, -46); ctx.lineTo(-16, -38); ctx.lineTo(-11, -39); ctx.lineTo(-13, -32); ctx.lineTo(-7, -36); ctx.fill();
    ctx.beginPath(); ctx.moveTo(12, -46); ctx.lineTo(16, -37); ctx.lineTo(10, -39); ctx.lineTo(13, -31); ctx.lineTo(7, -36); ctx.fill();
  } else {
    ctx.beginPath(); ctx.moveTo(-14, -50); ctx.quadraticCurveTo(-26, -32, -19, -8); ctx.lineTo(-8, -19); ctx.quadraticCurveTo(-13, -36, -7, -49); ctx.fill();
    ctx.beginPath(); ctx.moveTo(12, -50); ctx.quadraticCurveTo(24, -33, 18, -7); ctx.lineTo(7, -19); ctx.quadraticCurveTo(13, -35, 7, -49); ctx.fill();
  }
}
function hairFront(ctx, style, color) {
  ctx.fillStyle = color;
  ctx.beginPath(); ctx.moveTo(-12, -49); ctx.quadraticCurveTo(-12, -62, 0, -62); ctx.quadraticCurveTo(13, -62, 14, -48); ctx.quadraticCurveTo(8, -53, 5, -58); ctx.quadraticCurveTo(2, -51, -3, -57); ctx.quadraticCurveTo(-6, -50, -12, -49); ctx.fill();
  ctx.fillStyle = shade(color, 26);
  ctx.beginPath(); ctx.moveTo(-8, -57); ctx.quadraticCurveTo(-3, -61, 4, -58); ctx.quadraticCurveTo(-1, -57, -3, -53); ctx.quadraticCurveTo(-6, -55, -8, -57); ctx.fill();
  if (style === 1) {
    ctx.fillStyle = shade(color, -8); ctx.beginPath(); ctx.ellipse(13, -35, 4, 16, -.18, 0, TAU); ctx.fill();
    ctx.strokeStyle = '#d8b56a'; ctx.lineWidth = 1.2;
    for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(11 + i * .4, -45 + i * 4); ctx.lineTo(16, -43 + i * 4); ctx.stroke(); }
  }
}
function drawWeapon(ctx, type, t, attacking, swing) {
  ctx.save();
  if (type === 'arco') {
    ctx.strokeStyle = '#c9a86b'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(7, -13, 20, -1.2, 1.2); ctx.stroke();
    ctx.strokeStyle = '#e9f4ff'; ctx.lineWidth = .7; ctx.beginPath(); ctx.moveTo(14, -31); ctx.lineTo(14, 5); ctx.stroke();
    return ctx.restore();
  }
  if (type === 'baston') {
    ctx.strokeStyle = '#8b6b45'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(2, 0); ctx.lineTo(2, -48); ctx.stroke();
    const p = .5 + .5 * Math.sin(t * 2.4);
    glow(ctx, 2, -52, 16, rgba('#8adfff', .38 + p * .2));
    ctx.fillStyle = '#bff3ff'; ctx.beginPath(); ctx.arc(2, -52, 5, 0, TAU); ctx.fill();
    ctx.strokeStyle = 'rgba(150,235,255,.7)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(2, -52, 8 + p * 2, 0, TAU); ctx.stroke();
    return ctx.restore();
  }
  if (type === 'lanza') {
    ctx.strokeStyle = '#7a5636'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(0, 12); ctx.lineTo(0, -54); ctx.stroke();
    ctx.fillStyle = '#d9eeff'; ctx.beginPath(); ctx.moveTo(0, -70); ctx.lineTo(6, -54); ctx.lineTo(0, -49); ctx.lineTo(-6, -54); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#8fc7ff'; ctx.fillRect(-4, -51, 8, 3);
    return ctx.restore();
  }
  const long = type === 'mandoble' ? 52 : type === 'daga' ? 24 : 42;
  const blade = type === 'daga' ? '#d8c2ff' : type === 'mandoble' ? '#ffe6a8' : '#d6ebff';
  ctx.strokeStyle = '#6f4d2d'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(0, 4); ctx.lineTo(0, -6); ctx.stroke();
  ctx.fillStyle = '#d0a85e'; ctx.fillRect(-7, -9, 14, 3);
  ctx.save(); ctx.translate(0, -9);
  const grd = ctx.createLinearGradient(0, 0, 0, -long);
  grd.addColorStop(0, blade); grd.addColorStop(.6, '#ffffff'); grd.addColorStop(1, rgba(blade, .2));
  ctx.fillStyle = grd;
  ctx.beginPath(); ctx.moveTo(-3, 0); ctx.lineTo(-2.4, -long + 6); ctx.lineTo(0, -long); ctx.lineTo(2.4, -long + 6); ctx.lineTo(3, 0); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = rgba(blade, .8); ctx.lineWidth = .8; ctx.stroke();
  ctx.restore();
  ctx.restore();
}

export function heroAppearance(pl) {
  return { ...pl.appearance, armor: pl.equipment?.armor };
}

export function drawHero(ctx, x, y, o = {}) {
  const a = o.appearance || {};
  const s = o.scale || 1;
  const flip = o.flip || 1;
  const bob = o.bob || 0;
  const t = o.t || 0;
  const walk = o.walk || 0;
  const moving = o.moving;
  const hurt = o.hurt || 0;
  const dodge = o.dodge || 0;
  const blocking = o.blocking;
  const atk = o.attackT;
  const aim = o.aim ?? 0;
  const isDead = o.dead;

  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s * (dodge > 0 ? 1 - dodge * .15 : 1), s * (dodge > 0 ? 1 + dodge * .1 : 1));
  if (isDead) { ctx.rotate(-1.2); ctx.globalAlpha = .55; }
  ctx.fillStyle = 'rgba(0,0,0,.3)';
  ctx.beginPath(); ctx.ellipse(0, 0, 14, 5, 0, 0, TAU); ctx.fill();
  ctx.save();
  ctx.scale(flip, 1);
  if (moving) ctx.rotate(Math.sin(walk * TAU) * .02);

  const outfit = a.outfitColor || '#4e75a8';
  const armorColor = o.armorColor;
  const torso = armorColor || outfit;
  const skin = a.skin || '#e8b98c';
  const hair = a.hairColor || '#e8c477';
  const legSwing = moving ? Math.sin(walk * TAU) * 3.2 : 0;
  const armSwing = moving ? Math.sin(walk * TAU + Math.PI) * 2.5 : 0;

  // capa
  ctx.fillStyle = rgba(shade(torso, -38), .92);
  ctx.beginPath();
  ctx.moveTo(-9, -35 + bob);
  ctx.quadraticCurveTo(-17 - Math.sin(t * 2) * 1.4, -22 + bob, -12 - Math.sin(t * 2) * 2, -5 + bob);
  ctx.lineTo(-3, -14 + bob);
  ctx.lineTo(5, -14 + bob);
  ctx.lineTo(10, -35 + bob);
  ctx.closePath(); ctx.fill();

  // piernas
  drawLeg(ctx, -5, -15 + bob, legSwing, '#2b3450', '#1a1f30');
  drawLeg(ctx, 5, -15 + bob, -legSwing, '#2b3450', '#1a1f30');

  // cuerpo
  const bodyGrd = ctx.createLinearGradient(0, -42, 0, -12);
  bodyGrd.addColorStop(0, shade(torso, 22)); bodyGrd.addColorStop(.55, torso); bodyGrd.addColorStop(1, shade(torso, -28));
  ctx.fillStyle = bodyGrd;
  ctx.beginPath();
  ctx.moveTo(-11, -40 + bob); ctx.quadraticCurveTo(0, -45 + bob, 11, -40 + bob);
  ctx.lineTo(9, -20 + bob); ctx.quadraticCurveTo(0, -14 + bob, -9, -20 + bob); ctx.closePath(); ctx.fill();
  // falda/túnica
  ctx.fillStyle = shade(torso, -14);
  ctx.beginPath(); ctx.moveTo(-9, -23 + bob); ctx.lineTo(-13, -10 + bob); ctx.lineTo(0, -7 + bob); ctx.lineTo(13, -10 + bob); ctx.lineTo(9, -23 + bob); ctx.closePath(); ctx.fill();
  // cinturón
  ctx.fillStyle = '#3a2a1b'; ctx.fillRect(-9, -25 + bob, 18, 3);
  ctx.fillStyle = '#d8af61'; ctx.fillRect(-2, -26 + bob, 4, 5);
  // emblema
  ctx.fillStyle = 'rgba(255,235,180,.9)';
  ctx.beginPath(); ctx.moveTo(0, -38 + bob); ctx.lineTo(2, -34 + bob); ctx.lineTo(6, -33 + bob); ctx.lineTo(3, -30 + bob); ctx.lineTo(4, -26 + bob); ctx.lineTo(0, -28 + bob); ctx.lineTo(-4, -26 + bob); ctx.lineTo(-3, -30 + bob); ctx.lineTo(-6, -33 + bob); ctx.lineTo(-2, -34 + bob); ctx.closePath(); ctx.fill();

  // brazos
  ctx.strokeStyle = shade(torso, -4); ctx.lineWidth = 5; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(-9, -37 + bob); ctx.lineTo(-14, -24 + bob + armSwing); ctx.stroke();
  ctx.strokeStyle = skin; ctx.lineWidth = 3.6;
  ctx.beginPath(); ctx.moveTo(-14, -24 + bob + armSwing); ctx.lineTo(-15, -18 + bob + armSwing); ctx.stroke();
  // brazo derecho sostiene arma
  const handY = -25 + bob;
  ctx.strokeStyle = shade(torso, -4); ctx.lineWidth = 5;
  ctx.beginPath(); ctx.moveTo(9, -37 + bob); ctx.lineTo(15, handY - armSwing); ctx.stroke();
  ctx.strokeStyle = skin; ctx.lineWidth = 3.6;
  ctx.beginPath(); ctx.moveTo(15, handY - armSwing); ctx.lineTo(17, handY + 6 - armSwing); ctx.stroke();

  // cabeza
  const headY = -52 + bob;
  const hairStyle = a.hairStyle ?? 0;
  hairBack(ctx, hairStyle, hair);
  ctx.fillStyle = skin;
  ctx.beginPath(); ctx.ellipse(0, headY, 10.5, 11.5, 0, 0, TAU); ctx.fill();
  // orejas
  ctx.beginPath(); ctx.ellipse(-10, headY + 2, 2.3, 3.4, -.2, 0, TAU); ctx.fill();
  ctx.beginPath(); ctx.ellipse(10, headY + 2, 2.3, 3.4, .2, 0, TAU); ctx.fill();
  // ojos
  if (isDead) {
    ctx.strokeStyle = '#1b2233'; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(-6, headY); ctx.lineTo(-1, headY); ctx.moveTo(1, headY); ctx.lineTo(6, headY); ctx.stroke();
  } else {
    eye(ctx, -4.2, headY + 1, 1.7, '#2b3550');
    eye(ctx, 4.2, headY + 1, 1.7, '#2b3550');
    ctx.strokeStyle = 'rgba(120,60,60,.55)'; ctx.lineWidth = .8;
    ctx.beginPath(); ctx.arc(0, headY + 6, 2.2, .15, Math.PI - .15); ctx.stroke();
  }
  // rubor
  ctx.fillStyle = 'rgba(220,110,110,.18)';
  ellipse(ctx, -7.5, headY + 5, 2.6, 1.4, 'rgba(220,110,110,.16)');
  ellipse(ctx, 7.5, headY + 5, 2.6, 1.4, 'rgba(220,110,110,.16)');
  // pelo delantero
  hairFront(ctx, hairStyle, hair);
  // accesorio
  if (a.accessory === 'diadema') {
    ctx.strokeStyle = '#f0cf7d'; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.arc(0, headY - 8, 8, .15, Math.PI - .15); ctx.stroke();
    ctx.fillStyle = '#fff1b5'; ctx.beginPath(); ctx.arc(0, headY - 16, 2.2, 0, TAU); ctx.fill();
  } else if (a.accessory === 'pluma') {
    ctx.fillStyle = '#f2f6ff';
    ctx.beginPath(); ctx.ellipse(10, headY - 13, 2.4, 8, .5, 0, TAU); ctx.fill();
    ctx.strokeStyle = '#b9c8e8'; ctx.lineWidth = .8; ctx.beginPath(); ctx.moveTo(9, headY - 9); ctx.lineTo(11, headY - 20); ctx.stroke();
  } else if (a.accessory === 'arete') {
    ctx.fillStyle = '#f0cf7d'; ctx.beginPath(); ctx.arc(10, headY + 5, 1.8, 0, TAU); ctx.fill();
  }

  // arma
  if (o.weapon !== 'ninguna') {
    ctx.save();
    let ang = -.35;
    if (atk !== null && atk !== undefined) ang = -1.65 + atk * 3.2;
    if (blocking) ang = -1.1;
    ctx.translate(17, handY + 4); ctx.rotate(ang);
    drawWeapon(ctx, o.weaponType || 'espada', t, atk !== null && atk !== undefined, atk);
    ctx.restore();
  }
  // escudo al bloquear
  if (blocking) {
    ctx.save(); ctx.translate(14, -26 + bob); ctx.rotate(-.3);
    const sg = ctx.createLinearGradient(-9, 0, 9, 0); sg.addColorStop(0, '#e6efff'); sg.addColorStop(.5, '#8ba8c9'); sg.addColorStop(1, '#4e6a8c');
    ctx.fillStyle = sg; ctx.beginPath(); ctx.moveTo(0, -13); ctx.lineTo(10, -8); ctx.lineTo(8, 7); ctx.quadraticCurveTo(0, 14, -8, 7); ctx.lineTo(-10, -8); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#e8c477'; ctx.lineWidth = 1.3; ctx.stroke();
    ctx.fillStyle = 'rgba(255,235,180,.85)'; ctx.beginPath(); ctx.arc(0, 0, 3, 0, TAU); ctx.fill();
    ctx.restore();
  }
  // destello de daño
  if (hurt > 0) {
    ctx.globalCompositeOperation = 'source-atop';
    ctx.fillStyle = `rgba(255,90,110,${hurt * .5})`; ctx.fillRect(-22, -66, 44, 68);
  }
  ctx.restore();
  if (o.aura) {
    ctx.globalCompositeOperation = 'lighter';
    const r = 34 + Math.sin(t * 2) * 3;
    const g = ctx.createRadialGradient(0, -30, 2, 0, -30, r);
    g.addColorStop(0, rgba(o.aura, .22)); g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, -30, r, 0, TAU); ctx.fill();
  }
  ctx.restore();
}

function drawLeg(ctx, x, y, swing, pant, boot) {
  ctx.strokeStyle = pant; ctx.lineWidth = 4.2; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + swing * .45, y + 9); ctx.stroke();
  ctx.strokeStyle = boot; ctx.lineWidth = 4.4;
  ctx.beginPath(); ctx.moveTo(x + swing * .45, y + 9); ctx.lineTo(x + swing * .75 - 1, y + 14); ctx.stroke();
}

// NPC reutiliza el héroe con paleta propia
export function drawNpc(ctx, npc, t, hasQuest) {
  const app = {
    hairStyle: npc.role === 'elder' ? 3 : npc.role === 'child' ? 0 : 1,
    hairColor: npc.hair || '#cfc4b0',
    outfit: npc.outfit || 'tunic',
    outfitColor: npc.outfitColor || '#57647d',
    skin: npc.skin || '#e8b98c',
    accessory: npc.role === 'elder' ? 'diadema' : npc.role === 'child' ? 'ninguno' : 'arete',
  };
  drawHero(ctx, npc.x * 48, npc.y * 48, {
    appearance: app, scale: npc.role === 'child' ? .72 : .92, t,
    bob: Math.sin(t * 1.8 + npc.x) * .8,
    weapon: 'ninguna', flip: 1, id: npc.id,
    aura: npc.role === 'elder' ? '#e8c477' : null,
  });
  if (hasQuest) {
    const y = npc.y * 48 - 84 + Math.sin(t * 3) * 2;
    glow(ctx, npc.x * 48, y, 14, 'rgba(255,220,130,.35)');
    ctx.fillStyle = '#ffe6a8'; ctx.font = 'bold 17px serif'; ctx.textAlign = 'center';
    ctx.fillText('!', npc.x * 48, y);
    ctx.textAlign = 'left';
  }
}

// ============================================================
// ENEMIGOS
// ============================================================
export function drawEnemy(ctx, e, t) {
  const def = ENEMIES[e.type]; if (!def) return;
  const x = e.x, y = e.y, s = def.scale || 1;
  const hurt = e.hurt || 0;
  const bob = Math.sin(t * 2 + e.seed) * (def.behavior === 'bounce' ? 4 : 1.5);
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  // sombra
  ellipse(ctx, 0, 0, 18, 6, 'rgba(0,0,0,.3)');
  // telegrafía
  if (e.windup > 0) {
    ctx.save(); ctx.rotate(e.aim || 0);
    ctx.fillStyle = `rgba(255,75,90,${.12 + .18 * Math.sin(t * 18)})`;
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, 70, -.5, .5); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(255,100,110,.6)'; ctx.lineWidth = 1.4; ctx.stroke();
    ctx.restore();
  }
  if (e.casting > 0) {
    ctx.strokeStyle = `rgba(180,140,255,${.4 + .3 * Math.sin(t * 10)})`; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(0, -18, 30 + Math.sin(t * 6) * 3, 0, TAU); ctx.stroke();
  }
  if (hurt > 0) ctx.globalAlpha = .65 + Math.sin(t * 40) * .2;
  switch (e.type) {
    case 'jelly': drawJelly(ctx, t, bob, def); break;
    case 'queen': drawQueen(ctx, t, bob, def, e); break;
    case 'wolf': drawWolf(ctx, t, bob, def, e); break;
    case 'beetle': drawBeetle(ctx, t, bob, def, e); break;
    case 'specter': drawSpecter(ctx, t, bob, def); break;
    case 'guardian': drawGuardian(ctx, t, bob, def, e); break;
    case 'tide': drawTide(ctx, t, bob, def, e); break;
    case 'eclipse': drawEclipse(ctx, t, bob, def, e); break;
  }
  ctx.restore();
  // barra de vida
  if (!def.boss && e.hp < e.maxHp) {
    const w = 34 * s;
    ctx.fillStyle = 'rgba(0,0,0,.6)'; ctx.fillRect(x - w / 2, y - 48 * s, w, 4);
    ctx.fillStyle = hurt > 0 ? '#ffd0d0' : '#e85a6c'; ctx.fillRect(x - w / 2, y - 48 * s, w * clamp(e.hp / e.maxHp, 0, 1), 4);
  }
  if (e.stunned > 0) {
    ctx.fillStyle = '#ffe169'; ctx.font = '12px sans-serif'; ctx.textAlign = 'center';
    for (let i = 0; i < 3; i++) ctx.fillText('✦', x + Math.sin(t * 4 + i * 2) * 13, y - 52 * s + Math.cos(t * 4 + i) * 4);
    ctx.textAlign = 'left';
  }
}

function drawJelly(ctx, t, bob, def) {
  const w = 1 + Math.sin(t * 3) * .08;
  ctx.save(); ctx.translate(0, -14 + bob); ctx.scale(1 / w, w);
  const g = ctx.createRadialGradient(-6, -9, 2, 0, 0, 26);
  g.addColorStop(0, rgba(def.color, .95)); g.addColorStop(.55, rgba(def.color, .75)); g.addColorStop(1, rgba(def.color2, .8));
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.ellipse(0, 0, 18, 16, 0, Math.PI, 0); ctx.quadraticCurveTo(18, 11, 0, 14); ctx.quadraticCurveTo(-18, 11, -18, 0); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,.25)';
  ctx.beginPath(); ctx.ellipse(-7, -6, 5, 3.4, -.4, 0, TAU); ctx.fill();
  eye(ctx, -6, 0, 2.2, '#173522'); eye(ctx, 6, 0, 2.2, '#173522');
  ctx.strokeStyle = 'rgba(30,60,40,.7)'; ctx.lineWidth = .9;
  ctx.beginPath(); ctx.arc(0, 4, 3.4, .2, Math.PI - .2); ctx.stroke();
  ctx.restore();
}
function drawQueen(ctx, t, bob, def, e) {
  drawJelly(ctx, t, bob, { ...def, color: def.color, color2: def.color2 });
  ctx.save(); ctx.translate(0, -44 + bob);
  ctx.fillStyle = '#f3d477';
  ctx.beginPath();
  ctx.moveTo(-13, 4); ctx.lineTo(-15, -9); ctx.lineTo(-6, -3); ctx.lineTo(0, -13); ctx.lineTo(6, -3); ctx.lineTo(15, -9); ctx.lineTo(13, 4);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#9a6b2d'; ctx.fillRect(-14, 4, 28, 3);
  ctx.fillStyle = '#ff8ad1'; ctx.beginPath(); ctx.arc(0, -13, 2.4, 0, TAU); ctx.fill();
  ctx.restore();
  if (e.phase >= 2) {
    ctx.strokeStyle = 'rgba(140,255,180,.4)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(0, -10, 32 + Math.sin(t * 3) * 4, 0, TAU); ctx.stroke();
  }
}
function drawWolf(ctx, t, bob, def, e) {
  ctx.save(); ctx.translate(0, -10 + bob);
  const dir = e.facing === 'left' ? -1 : 1;
  ctx.scale(dir, 1);
  // cola
  ctx.strokeStyle = def.color2; ctx.lineWidth = 5; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(-13, -7); ctx.quadraticCurveTo(-25, -12 + Math.sin(t * 4) * 2, -23, -22); ctx.stroke();
  // patas
  ctx.strokeStyle = '#2e3442'; ctx.lineWidth = 3.5;
  for (const [lx, ph] of [[-8, 0], [6, 1]]) { ctx.beginPath(); ctx.moveTo(lx, -5); ctx.lineTo(lx + Math.sin(t * 8 + ph) * 4, 5); ctx.stroke(); }
  // cuerpo
  ctx.fillStyle = def.color;
  ctx.beginPath(); ctx.ellipse(0, -13, 16, 8.5, -.06, 0, TAU); ctx.fill();
  ctx.fillStyle = def.color2;
  ctx.beginPath(); ctx.ellipse(2, -9, 12, 4.5, 0, 0, TAU); ctx.fill();
  // cabeza
  ctx.fillStyle = def.color;
  ctx.beginPath(); ctx.ellipse(13, -19, 8, 7, .1, 0, TAU); ctx.fill();
  ctx.beginPath(); ctx.moveTo(9, -25); ctx.lineTo(10, -33); ctx.lineTo(15, -25); ctx.fill();
  ctx.beginPath(); ctx.moveTo(15, -26); ctx.lineTo(18, -32); ctx.lineTo(20, -23); ctx.fill();
  ctx.fillStyle = def.color2;
  ctx.beginPath(); ctx.ellipse(18, -16, 6, 4, .2, 0, TAU); ctx.fill();
  eye(ctx, 17, -21, 1.5, '#ffe169');
  ctx.fillStyle = '#171b26'; ctx.beginPath(); ctx.arc(23, -17, 1.5, 0, TAU); ctx.fill();
  // cicatriz de ceniza
  ctx.strokeStyle = 'rgba(255,120,80,.55)'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(-2, -18); ctx.lineTo(3, -11); ctx.stroke();
  ctx.restore();
}
function drawBeetle(ctx, t, bob, def, e) {
  ctx.save(); ctx.translate(0, -10 + bob);
  // patas
  ctx.strokeStyle = '#3f2f22'; ctx.lineWidth = 3;
  for (const lx of [-12, 0, 12]) {
    ctx.beginPath(); ctx.moveTo(lx, -4); ctx.lineTo(lx - 5, 6 + Math.sin(t * 6 + lx) * 1.5); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(lx, -4); ctx.lineTo(lx + 7, 5 - Math.sin(t * 6 + lx) * 1.5); ctx.stroke();
  }
  // caparazón
  const g = ctx.createRadialGradient(-6, -20, 3, 0, -10, 26);
  g.addColorStop(0, shade(def.color, 28)); g.addColorStop(.6, def.color); g.addColorStop(1, def.color2);
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.ellipse(0, -12, 21, 16, 0, 0, TAU); ctx.fill();
  ctx.strokeStyle = rgba('#2d2118', .7); ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.moveTo(0, -27); ctx.lineTo(0, 3); ctx.stroke();
  ctx.beginPath(); ctx.arc(-8, -12, 10, -.8, .8); ctx.stroke();
  ctx.beginPath(); ctx.arc(8, -12, 10, Math.PI - .8, Math.PI + .8); ctx.stroke();
  // cabeza y cuernos
  ctx.fillStyle = '#5a412b';
  ctx.beginPath(); ctx.ellipse(0, 0, 9, 6, 0, 0, TAU); ctx.fill();
  ctx.strokeStyle = '#3d2b1b'; ctx.lineWidth = 3; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(-6, -3); ctx.quadraticCurveTo(-12, -8, -8, -15); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(6, -3); ctx.quadraticCurveTo(12, -8, 8, -15); ctx.stroke();
  eye(ctx, -3, 0, 1.4, '#ffb84a'); eye(ctx, 3, 0, 1.4, '#ffb84a');
  if (e.phase >= 2) { ctx.strokeStyle = 'rgba(255,190,70,.4)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(0, -10, 26, 0, TAU); ctx.stroke(); }
  ctx.restore();
}
function drawSpecter(ctx, t, bob, def) {
  ctx.save(); ctx.translate(0, -20 + bob);
  const wav = Math.sin(t * 2.4) * 3;
  const g = ctx.createLinearGradient(0, -20, 0, 25);
  g.addColorStop(0, rgba(def.color, .92)); g.addColorStop(.6, rgba(def.color2, .7)); g.addColorStop(1, 'rgba(30,20,60,0)');
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.moveTo(-15, -8); ctx.quadraticCurveTo(-17, -25, 0, -27); ctx.quadraticCurveTo(17, -25, 15, -8);
  ctx.quadraticCurveTo(12, 8, 8 + wav, 20); ctx.quadraticCurveTo(3, 13, 0, 22); ctx.quadraticCurveTo(-4, 13, -8 - wav, 20); ctx.quadraticCurveTo(-12, 8, -15, -8); ctx.fill();
  // capucha
  ctx.fillStyle = 'rgba(20,14,40,.7)';
  ctx.beginPath(); ctx.ellipse(0, -12, 10, 11, 0, Math.PI, 0); ctx.fill();
  glow(ctx, -4, -12, 8, 'rgba(220,180,255,.5)'); glow(ctx, 4, -12, 8, 'rgba(220,180,255,.5)');
  eye(ctx, -4, -12, 2, '#f2d6ff'); eye(ctx, 4, -12, 2, '#f2d6ff');
  // cadenas
  ctx.strokeStyle = 'rgba(190,180,220,.35)'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(-12, -2); ctx.quadraticCurveTo(-6, 8, -9, 14); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(12, -2); ctx.quadraticCurveTo(6, 8, 9, 14); ctx.stroke();
  ctx.restore();
}
function drawGuardian(ctx, t, bob, def, e) {
  ctx.save(); ctx.translate(0, -8 + bob);
  // piernas
  ctx.fillStyle = '#4f4536'; ctx.fillRect(-18, -8, 12, 20); ctx.fillRect(6, -8, 12, 20);
  ctx.fillStyle = '#3a3228'; ctx.fillRect(-20, 8, 16, 6); ctx.fillRect(4, 8, 16, 6);
  // torso
  const g = ctx.createLinearGradient(-25, -52, 25, -5);
  g.addColorStop(0, shade(def.color, 30)); g.addColorStop(.5, def.color); g.addColorStop(1, def.color2);
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.moveTo(-24, -44); ctx.lineTo(24, -44); ctx.lineTo(20, -5); ctx.lineTo(-20, -5); ctx.closePath(); ctx.fill();
  // brazos
  ctx.fillStyle = shade(def.color, -6);
  ctx.save(); ctx.translate(-25, -39); ctx.rotate(Math.sin(t * 1.4) * .08 + (e.windup > 0 ? -1 : 0)); ctx.fillRect(-10, 0, 12, 32); ctx.restore();
  ctx.save(); ctx.translate(25, -39); ctx.rotate(-Math.sin(t * 1.4) * .08 + (e.windup > 0 ? 1 : 0)); ctx.fillRect(-2, 0, 12, 32); ctx.restore();
  // núcleo
  const pulse = .55 + .45 * Math.sin(t * 3);
  glow(ctx, 0, -24, 22, rgba('#ffb35c', .3 * pulse));
  ctx.fillStyle = `rgba(255,190,90,${.7 + pulse * .2})`;
  ctx.beginPath(); ctx.moveTo(0, -34); ctx.lineTo(9, -24); ctx.lineTo(0, -14); ctx.lineTo(-9, -24); ctx.closePath(); ctx.fill();
  // grietas
  ctx.strokeStyle = 'rgba(255,170,70,.65)'; ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.moveTo(-16, -42); ctx.lineTo(-8, -32); ctx.lineTo(-12, -22); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(16, -38); ctx.lineTo(9, -28); ctx.stroke();
  // cabeza
  ctx.fillStyle = '#6a5a43';
  ctx.beginPath(); ctx.moveTo(-10, -50); ctx.lineTo(10, -50); ctx.lineTo(13, -58); ctx.lineTo(0, -64); ctx.lineTo(-13, -58); ctx.closePath(); ctx.fill();
  glow(ctx, 0, -55, 9, 'rgba(255,210,110,.8)');
  ctx.fillStyle = '#ffe9a8'; ctx.fillRect(-6, -57, 12, 2);
  if (e.phase >= 2) {
    ctx.strokeStyle = 'rgba(255,120,80,.55)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(0, -30, 34, 0, TAU); ctx.stroke();
  }
  ctx.restore();
}
function drawTide(ctx, t, bob, def, e) {
  ctx.save(); ctx.translate(0, -10);
  // cuerpo serpiente
  for (let i = 4; i >= 0; i--) {
    const px = Math.sin(t * 1.6 + i * .9) * (10 + i * 4);
    const py = -i * 11 + bob;
    const r = 16 - i * 2.2;
    const g = ctx.createRadialGradient(px - 4, py - 4, 1, px, py, r);
    g.addColorStop(0, shade(def.color, 25)); g.addColorStop(1, def.color2);
    ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(px, py, r, r * .82, 0, 0, TAU); ctx.fill();
    if (i === 0) {
      // cabeza
      ctx.fillStyle = def.color;
      ctx.beginPath(); ctx.ellipse(px, py - 10, 16, 13, 0, 0, TAU); ctx.fill();
      eye(ctx, px - 7, py - 13, 2.4, '#eaffff'); eye(ctx, px + 7, py - 13, 2.4, '#eaffff');
      ctx.strokeStyle = 'rgba(20,50,80,.7)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(px, py - 4, 6, .2, Math.PI - .2); ctx.stroke();
      // aletas
      ctx.fillStyle = rgba(def.color, .55);
      ctx.beginPath(); ctx.moveTo(px - 14, py - 8); ctx.quadraticCurveTo(px - 28, py - 18, px - 24, py - 2); ctx.fill();
      ctx.beginPath(); ctx.moveTo(px + 14, py - 8); ctx.quadraticCurveTo(px + 28, py - 18, px + 24, py - 2); ctx.fill();
    }
  }
  ctx.restore();
}
function drawEclipse(ctx, t, bob, def, e) {
  ctx.save(); ctx.translate(0, -18 + bob);
  // alas
  const flap = Math.sin(t * 1.6) * .08;
  for (const dir of [-1, 1]) {
    ctx.save(); ctx.scale(dir, 1); ctx.rotate(flap * dir);
    ctx.fillStyle = 'rgba(70,40,110,.7)';
    ctx.beginPath(); ctx.moveTo(6, -28); ctx.quadraticCurveTo(38, -54, 50, -20); ctx.quadraticCurveTo(28, -30, 24, -8); ctx.quadraticCurveTo(18, -20, 6, -18); ctx.fill();
    ctx.strokeStyle = 'rgba(190,150,255,.55)'; ctx.lineWidth = 1; ctx.stroke();
    ctx.restore();
  }
  // túnica
  const g = ctx.createLinearGradient(0, -48, 0, 20);
  g.addColorStop(0, '#3b255c'); g.addColorStop(.5, '#23163c'); g.addColorStop(1, 'rgba(20,10,35,.2)');
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.moveTo(-20, -40); ctx.lineTo(20, -40); ctx.lineTo(28, 22); ctx.quadraticCurveTo(0, 32, -28, 22); ctx.closePath(); ctx.fill();
  // brazos
  ctx.strokeStyle = '#2b1a44'; ctx.lineWidth = 7; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(-18, -32); ctx.lineTo(-30, -8); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(18, -32); ctx.lineTo(30, -8); ctx.stroke();
  // cabeza / corona
  ctx.fillStyle = '#1a102b'; ctx.beginPath(); ctx.ellipse(0, -49, 11, 12, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = '#c9a6ff'; ctx.fillRect(-8, -46, 16, 2);
  ctx.fillStyle = '#f4d998';
  ctx.beginPath(); ctx.moveTo(-15, -58); ctx.lineTo(-12, -75); ctx.lineTo(-5, -63); ctx.lineTo(0, -80); ctx.lineTo(5, -63); ctx.lineTo(12, -75); ctx.lineTo(15, -58); ctx.closePath(); ctx.fill();
  glow(ctx, -4, -49, 9, 'rgba(200,150,255,.55)'); glow(ctx, 4, -49, 9, 'rgba(200,150,255,.55)');
  eye(ctx, -4, -49, 2, '#e8d7ff'); eye(ctx, 4, -49, 2, '#e8d7ff');
  // espada flotante
  ctx.save(); ctx.translate(32 + Math.sin(t * 2) * 3, -8); ctx.rotate(-.7);
  ctx.fillStyle = '#c9a6ff'; ctx.fillRect(-2, -36, 4, 46);
  ctx.fillStyle = '#22123c'; ctx.fillRect(-8, 8, 16, 3);
  ctx.restore();
  if (e.phase >= 2) {
    ctx.strokeStyle = `rgba(200,140,255,${.35 + .2 * Math.sin(t * 4)})`; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(0, -20, 42 + Math.sin(t * 2) * 4, 0, TAU); ctx.stroke();
  }
  ctx.restore();
}

// ============================================================
// CRIATURAS
// ============================================================
export function drawCreature(ctx, x, y, speciesId, o = {}) {
  const def = CREATURES[speciesId]; if (!def) return;
  const col = def.color, col2 = shade(col, -48), eyeC = def.eye || '#fff3c4';
  const s = o.scale || 1, t = o.t || 0;
  const bob = o.bob ?? Math.sin(t * 2.2 + (o.seed || 0)) * 2.2;
  const flip = o.flip || 1;
  ctx.save();
  ctx.translate(x, y + bob);
  ctx.scale(s * flip, s);
  // aura
  if (o.aura !== false) {
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    const r = 28 + Math.sin(t * 2) * 3;
    glow(ctx, 0, -18, r, rgba(col, .18));
    ctx.restore();
  }
  ctx.fillStyle = 'rgba(0,0,0,.24)'; ctx.beginPath(); ctx.ellipse(0, 2 - bob, 14, 4.6, 0, 0, TAU); ctx.fill();
  const eye2 = (ex) => { eye(ctx, ex, -18, 2, eyeC); };
  switch (def.shape) {
    case 'imp':
      ctx.fillStyle = col2; ctx.beginPath(); ctx.moveTo(-9, -28); ctx.lineTo(-14, -37); ctx.lineTo(-4, -32); ctx.fill();
      ctx.beginPath(); ctx.moveTo(9, -28); ctx.lineTo(14, -37); ctx.lineTo(4, -32); ctx.fill();
      ctx.fillStyle = col; ctx.beginPath(); ctx.ellipse(0, -15, 13, 14, 0, 0, TAU); ctx.fill();
      eye2(-4.5); eye2(4.5);
      ctx.strokeStyle = '#7a2c16'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(0, -11, 3.4, .2, Math.PI - .2); ctx.stroke();
      // cola de llama
      ctx.fillStyle = '#ffb54a'; ctx.beginPath(); ctx.moveTo(-10, -6); ctx.quadraticCurveTo(-24, -2, -18, 8); ctx.quadraticCurveTo(-15, 0, -7, 0); ctx.fill();
      break;
    case 'drake':
      ctx.fillStyle = 'rgba(80,30,20,.55)';
      ctx.beginPath(); ctx.moveTo(-8, -26); ctx.quadraticCurveTo(-34, -46, -30, -14); ctx.quadraticCurveTo(-18, -25, -8, -16); ctx.fill();
      ctx.beginPath(); ctx.moveTo(8, -26); ctx.quadraticCurveTo(34, -46, 30, -14); ctx.quadraticCurveTo(18, -25, 8, -16); ctx.fill();
      ctx.fillStyle = col; ctx.beginPath(); ctx.ellipse(0, -15, 15, 14, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = shade(col, 26); ctx.beginPath(); ctx.ellipse(0, -8, 9, 9, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = col2; ctx.beginPath(); ctx.moveTo(9, -26); ctx.quadraticCurveTo(24, -36, 16, -8); ctx.quadraticCurveTo(12, -16, 4, -12); ctx.fill();
      eye2(-5); eye2(5);
      ctx.strokeStyle = '#7a2c16'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(0, -8, 4, .2, Math.PI - .2); ctx.stroke();
      break;
    case 'squid':
      ctx.fillStyle = col; ctx.beginPath(); ctx.ellipse(0, -22, 13, 13, 0, 0, TAU); ctx.fill();
      for (let i = -2; i <= 2; i++) {
        ctx.strokeStyle = rgba(col, .85); ctx.lineWidth = 3; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(i * 4.6, -13); ctx.quadraticCurveTo(i * 6 + Math.sin(t * 3 + i) * 3, -4, i * 5, 4); ctx.stroke();
      }
      eye2(-4.5); eye2(4.5);
      ctx.fillStyle = 'rgba(255,255,255,.3)'; ctx.beginPath(); ctx.ellipse(-5, -28, 4, 2.4, -.4, 0, TAU); ctx.fill();
      break;
    case 'serpent':
      for (let i = 0; i < 5; i++) {
        const px = Math.sin(t * 1.8 + i * 1.1) * 9;
        ctx.fillStyle = i % 2 ? shade(col, 8) : col;
        ctx.beginPath(); ctx.ellipse(px, -6 - i * 7, 8 - i * .6, 6 - i * .4, 0, 0, TAU); ctx.fill();
      }
      ctx.fillStyle = col; ctx.beginPath(); ctx.ellipse(0, -40, 11, 9, 0, 0, TAU); ctx.fill();
      eye2(-4); eye2(4);
      break;
    case 'mole':
      ctx.fillStyle = col2; ctx.beginPath(); ctx.ellipse(-9, -6, 5, 7, -.2, 0, TAU); ctx.fill();
      ctx.beginPath(); ctx.ellipse(9, -6, 5, 7, .2, 0, TAU); ctx.fill();
      ctx.fillStyle = col; ctx.beginPath(); ctx.ellipse(0, -14, 14, 13, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = shade(col, 25); ctx.beginPath(); ctx.ellipse(0, -19, 9, 6, 0, 0, TAU); ctx.fill();
      eye(ctx, -4.5, -16, 2, '#2a1c10'); eye(ctx, 4.5, -16, 2, '#2a1c10');
      ctx.fillStyle = '#5a3a22'; ctx.beginPath(); ctx.arc(0, -11, 2.2, 0, TAU); ctx.fill();
      break;
    case 'golem':
      ctx.fillStyle = col2; ctx.fillRect(-13, -8, 8, 9); ctx.fillRect(5, -8, 8, 9);
      ctx.fillStyle = col; roundRect(ctx, -13, -34, 26, 27, 7); ctx.fill();
      ctx.fillStyle = shade(col, 30); roundRect(ctx, -9, -31, 18, 10, 4); ctx.fill();
      ctx.fillStyle = '#7b5b38'; roundRect(ctx, -9, -42, 18, 14, 4); ctx.fill();
      eye(ctx, -4, -36, 2, '#ffe9a8'); eye(ctx, 4, -36, 2, '#ffe9a8');
      ctx.strokeStyle = 'rgba(255,220,140,.5)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(-5, -26); ctx.lineTo(0, -20); ctx.lineTo(4, -25); ctx.stroke();
      break;
    case 'bird':
      ctx.fillStyle = rgba(col, .75);
      const flap = Math.sin(t * 9) * 7;
      ctx.beginPath(); ctx.moveTo(-3, -22); ctx.quadraticCurveTo(-20, -30 - flap, -24, -24); ctx.quadraticCurveTo(-14, -22, -3, -16); ctx.fill();
      ctx.beginPath(); ctx.moveTo(3, -22); ctx.quadraticCurveTo(20, -30 + flap, 24, -24); ctx.quadraticCurveTo(14, -22, 3, -16); ctx.fill();
      ctx.fillStyle = col; ctx.beginPath(); ctx.ellipse(0, -18, 10, 10, 0, 0, TAU); ctx.fill();
      eye(ctx, -3.5, -20, 1.8, '#173a2c'); eye(ctx, 3.5, -20, 1.8, '#173a2c');
      ctx.fillStyle = '#e9c477'; ctx.beginPath(); ctx.moveTo(0, -16); ctx.lineTo(5, -13); ctx.lineTo(0, -11); ctx.fill();
      break;
    case 'griffin':
      ctx.fillStyle = 'rgba(100,240,200,.4)';
      ctx.beginPath(); ctx.moveTo(-8, -26); ctx.quadraticCurveTo(-38, -50, -30, -8); ctx.quadraticCurveTo(-18, -20, -8, -14); ctx.fill();
      ctx.beginPath(); ctx.moveTo(8, -26); ctx.quadraticCurveTo(38, -50, 30, -8); ctx.quadraticCurveTo(18, -20, 8, -14); ctx.fill();
      ctx.fillStyle = col; ctx.beginPath(); ctx.ellipse(0, -16, 14, 13, 0, 0, TAU); ctx.fill();
      eye(ctx, -4.5, -18, 2, '#2a4d40'); eye(ctx, 4.5, -18, 2, '#2a4d40');
      ctx.fillStyle = '#e9c477'; ctx.beginPath(); ctx.moveTo(0, -13); ctx.lineTo(6, -10); ctx.lineTo(0, -7); ctx.fill();
      break;
    case 'mouse':
      ctx.fillStyle = col2; ctx.beginPath(); ctx.arc(-7, -28, 5, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.arc(7, -28, 5, 0, TAU); ctx.fill();
      ctx.fillStyle = col; ctx.beginPath(); ctx.ellipse(0, -16, 11, 11, 0, 0, TAU); ctx.fill();
      eye(ctx, -4, -18, 2, '#3a2b00'); eye(ctx, 4, -18, 2, '#3a2b00');
      ctx.fillStyle = '#fff1a6'; ctx.beginPath(); ctx.arc(0, -12, 1.7, 0, TAU); ctx.fill();
      ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-9, -11); ctx.quadraticCurveTo(-18, -7, -16, -1); ctx.stroke();
      break;
    case 'tiger':
      ctx.fillStyle = col2; ctx.beginPath(); ctx.ellipse(0, -9, 17, 6, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = col; ctx.beginPath(); ctx.ellipse(0, -14, 16, 10, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = col; ctx.beginPath(); ctx.ellipse(12, -22, 9, 8, 0, 0, TAU); ctx.fill();
      ctx.beginPath(); ctx.moveTo(7, -28); ctx.lineTo(8, -35); ctx.lineTo(13, -28); ctx.fill();
      ctx.beginPath(); ctx.moveTo(14, -29); ctx.lineTo(17, -35); ctx.lineTo(19, -27); ctx.fill();
      ctx.strokeStyle = 'rgba(120,80,0,.55)'; ctx.lineWidth = 1.4;
      for (const sx of [-8, -2, 4]) { ctx.beginPath(); ctx.moveTo(sx, -22); ctx.lineTo(sx + 2, -14); ctx.stroke(); }
      eye(ctx, 14, -24, 1.7, '#3a2b00');
      ctx.strokeStyle = col; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(-16, -15); ctx.quadraticCurveTo(-28, -16, -24, -4); ctx.stroke();
      break;
    case 'fox':
      ctx.fillStyle = col; ctx.beginPath(); ctx.ellipse(0, -15, 13, 10, 0, 0, TAU); ctx.fill();
      ctx.beginPath(); ctx.ellipse(10, -23, 8, 7, 0, 0, TAU); ctx.fill();
      ctx.beginPath(); ctx.moveTo(6, -29); ctx.lineTo(7, -36); ctx.lineTo(12, -28); ctx.fill();
      ctx.beginPath(); ctx.moveTo(13, -30); ctx.lineTo(16, -36); ctx.lineTo(18, -27); ctx.fill();
      ctx.strokeStyle = col; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(-10, -15); ctx.quadraticCurveTo(-24, -20, -22, -6); ctx.quadraticCurveTo(-20, -14, -12, -10); ctx.stroke();
      eye(ctx, 12, -25, 1.6, '#2c6077');
      ctx.fillStyle = '#eafcff'; ctx.beginPath(); ctx.arc(18, -22, 1.5, 0, TAU); ctx.fill();
      break;
    case 'stag':
      ctx.fillStyle = col; ctx.beginPath(); ctx.ellipse(0, -14, 15, 11, 0, 0, TAU); ctx.fill();
      ctx.beginPath(); ctx.ellipse(9, -25, 8, 8, 0, 0, TAU); ctx.fill();
      ctx.strokeStyle = '#dff7ff'; ctx.lineWidth = 1.4;
      for (const dir of [-1, 1]) { ctx.save(); ctx.translate(9, -31); ctx.scale(dir, 1); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(4, -12); ctx.lineTo(10, -16); ctx.moveTo(4, -7); ctx.lineTo(-1, -9); ctx.stroke(); ctx.restore(); }
      eye(ctx, 11, -26, 1.7, '#2c6077');
      break;
    case 'angel':
      ctx.fillStyle = 'rgba(255,240,190,.5)';
      const af = Math.sin(t * 3) * 4;
      ctx.beginPath(); ctx.moveTo(-6, -28); ctx.quadraticCurveTo(-30, -40 - af, -28, -14); ctx.quadraticCurveTo(-18, -24, -6, -16); ctx.fill();
      ctx.beginPath(); ctx.moveTo(6, -28); ctx.quadraticCurveTo(30, -40 + af, 28, -14); ctx.quadraticCurveTo(18, -24, 6, -16); ctx.fill();
      ctx.fillStyle = col; ctx.beginPath(); ctx.ellipse(0, -18, 11, 11, 0, 0, TAU); ctx.fill();
      eye(ctx, -3.5, -20, 1.8, '#7a5c12'); eye(ctx, 3.5, -20, 1.8, '#7a5c12');
      ctx.strokeStyle = '#ffe9a8'; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.arc(0, -34, 7, 0, TAU); ctx.stroke();
      break;
    case 'cat':
      ctx.fillStyle = col2; ctx.beginPath(); ctx.moveTo(-7, -27); ctx.lineTo(-9, -35); ctx.lineTo(-2, -29); ctx.fill();
      ctx.beginPath(); ctx.moveTo(7, -27); ctx.lineTo(9, -35); ctx.lineTo(2, -29); ctx.fill();
      ctx.fillStyle = col; ctx.beginPath(); ctx.ellipse(0, -17, 11, 10, 0, 0, TAU); ctx.fill();
      eye(ctx, -4, -20, 1.8, '#fff3a8'); eye(ctx, 4, -20, 1.8, '#fff3a8');
      ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-9, -12); ctx.quadraticCurveTo(-20, -16, -17, -4); ctx.stroke();
      break;
    case 'panther':
      ctx.fillStyle = '#180f28'; ctx.beginPath(); ctx.ellipse(0, -15, 17, 11, 0, 0, TAU); ctx.fill();
      ctx.beginPath(); ctx.ellipse(12, -23, 9, 8, 0, 0, TAU); ctx.fill();
      ctx.beginPath(); ctx.moveTo(7, -29); ctx.lineTo(8, -36); ctx.lineTo(13, -28); ctx.fill();
      ctx.beginPath(); ctx.moveTo(14, -30); ctx.lineTo(17, -36); ctx.lineTo(19, -27); ctx.fill();
      eye(ctx, 14, -25, 1.8, '#ffe169');
      ctx.strokeStyle = 'rgba(180,140,255,.6)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(-10, -20); ctx.lineTo(-2, -12); ctx.stroke();
      break;
    case 'sprout':
      ctx.fillStyle = '#5c8a4c'; ctx.fillRect(-2, -25, 4, 13);
      ctx.fillStyle = col; ctx.beginPath(); ctx.ellipse(-7, -28, 8, 4, -.5, 0, TAU); ctx.fill();
      ctx.beginPath(); ctx.ellipse(7, -28, 8, 4, .5, 0, TAU); ctx.fill();
      ctx.fillStyle = col; ctx.beginPath(); ctx.ellipse(0, -12, 12, 11, 0, 0, TAU); ctx.fill();
      eye(ctx, -4, -14, 1.8, '#24401f'); eye(ctx, 4, -14, 1.8, '#24401f');
      ctx.fillStyle = '#ffe9a8'; ctx.beginPath(); ctx.arc(0, -9, 1.6, 0, TAU); ctx.fill();
      break;
    case 'tree':
      ctx.fillStyle = '#6b4b2d'; ctx.fillRect(-3, -30, 6, 25);
      ctx.fillStyle = col; ctx.beginPath(); ctx.arc(-11, -33, 11, 0, TAU); ctx.arc(10, -35, 12, 0, TAU); ctx.arc(0, -45, 13, 0, TAU); ctx.fill();
      ctx.fillStyle = '#ffd6e8'; for (const [px, py] of [[-10, -37], [5, -42], [12, -30], [-2, -28]]) { ctx.beginPath(); ctx.arc(px, py, 2, 0, TAU); ctx.fill(); }
      eye(ctx, -7, -20, 1.6, '#2b4425'); eye(ctx, 5, -20, 1.6, '#2b4425');
      break;
    case 'astral':
      ctx.translate(0, -20);
      ctx.rotate(Math.sin(t) * .15);
      const points = 8;
      ctx.fillStyle = rgba(col, .9); ctx.beginPath();
      for (let i = 0; i < points * 2; i++) {
        const r = i % 2 ? 7 : 16 + Math.sin(t * 3 + i) * 2;
        const ang = i / (points * 2) * TAU - Math.PI / 2;
        const px = Math.cos(ang) * r, py = Math.sin(ang) * r;
        i ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
      }
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#fff8db'; ctx.beginPath(); ctx.arc(0, 0, 5, 0, TAU); ctx.fill();
      for (let i = 0; i < 4; i++) {
        const ang = t * .7 + i * TAU / 4;
        ctx.strokeStyle = rgba('#fff1c0', .4); ctx.lineWidth = .8;
        ctx.beginPath(); ctx.moveTo(Math.cos(ang) * 10, Math.sin(ang) * 10); ctx.lineTo(Math.cos(ang) * 22, Math.sin(ang) * 22); ctx.stroke();
      }
      break;
  }
  ctx.restore();
}

// retrato / avatar
export function drawAvatar(canvas, appearance, scale = 2.3) {
  const ctx = canvas.getContext('2d');
  const w = canvas.width, h = canvas.height;
  ctx.clearRect(0, 0, w, h);
  const g = ctx.createRadialGradient(w / 2, h * .35, 2, w / 2, h * .5, w * .65);
  g.addColorStop(0, '#304a70'); g.addColorStop(1, '#0a1120');
  ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
  drawHero(ctx, w / 2, h * .96, {
    appearance, scale, t: 0, bob: 0, weapon: 'ninguna',
    armorColor: appearance.armor ? undefined : undefined,
  });
}
export function drawPreview(canvas, appearance) {
  const ctx = canvas.getContext('2d');
  const w = canvas.width, h = canvas.height;
  ctx.clearRect(0, 0, w, h);
  const g = ctx.createRadialGradient(w / 2, h * .45, 10, w / 2, h * .5, w * .58);
  g.addColorStop(0, 'rgba(110,150,220,.2)'); g.addColorStop(.55, 'rgba(40,65,110,.12)'); g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
  // pedestal
  ctx.fillStyle = 'rgba(232,196,119,.12)'; ctx.beginPath(); ctx.ellipse(w / 2, h * .9, 120, 20, 0, 0, TAU); ctx.fill();
  ctx.strokeStyle = 'rgba(232,196,119,.3)'; ctx.lineWidth = 1; ctx.stroke();
  drawHero(ctx, w / 2, h * .9, { appearance, scale: 3.3, t: 0, bob: 0, weapon: 'sefiro', weaponType: 'espada', armorColor: undefined });
}

export function drawNpcPortrait(canvas, npc) {
  const ctx = canvas.getContext('2d');
  const w = canvas.width, h = canvas.height;
  ctx.clearRect(0, 0, w, h);
  const g = ctx.createRadialGradient(w / 2, h * .35, 2, w / 2, h * .5, w * .7);
  g.addColorStop(0, '#2a3b5b'); g.addColorStop(1, '#090f1b');
  ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
  const app = {
    hairStyle: npc.role === 'elder' ? 3 : 1,
    hairColor: npc.hair || '#cfc4b0',
    outfitColor: npc.outfitColor || '#57647d',
    skin: npc.skin || '#e8b98c',
    accessory: npc.role === 'elder' ? 'diadema' : 'arete',
  };
  drawHero(ctx, w / 2, h * 1.12, { appearance: app, scale: 1.85, t: 0, weapon: 'ninguna' });
}
export function drawCreatureIcon(canvas, speciesId) {
  const ctx = canvas.getContext('2d');
  const w = canvas.width, h = canvas.height;
  ctx.clearRect(0, 0, w, h);
  const def = CREATURES[speciesId];
  if (!def) return;
  const g = ctx.createRadialGradient(w / 2, h * .45, 2, w / 2, h * .5, w * .6);
  g.addColorStop(0, rgba(def.color, .25)); g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
  drawCreature(ctx, w / 2, h * .84, speciesId, { scale: Math.min(1.15, w / 70), t: 1.6 });
}
