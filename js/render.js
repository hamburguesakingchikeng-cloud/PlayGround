/* ==========================================================================
   RENDER — procedural character, creature and enemy art.
   All drawing is original, layered vector-style Canvas 2D.
   ========================================================================== */

import { APPEARANCE, CREATURES, ELEMENTS } from './data.js';

export function resolveAppearance(app = {}) {
  const hair = APPEARANCE.hairColors.find(h => h.id === app.hairColor) || APPEARANCE.hairColors[0];
  const skin = APPEARANCE.skins.find(s => s.id === app.skin) || APPEARANCE.skins[0];
  const outfit = APPEARANCE.outfits.find(o => o.id === app.outfit) || APPEARANCE.outfits[0];
  const eyes = APPEARANCE.eyes.find(e => e.id === app.eyes) || APPEARANCE.eyes[0];
  return { hairStyle: app.hair || 'corto', hair: hair.color, skin: skin.color, outfit: outfit.color, accent: outfit.accent, eyes: eyes.color };
}

function rr(ctx, x, y, w, h, r) {
  const rad = Math.min(r, Math.abs(w) / 2, Math.abs(h) / 2);
  ctx.beginPath();
  ctx.moveTo(x + rad, y);
  ctx.arcTo(x + w, y, x + w, y + h, rad);
  ctx.arcTo(x + w, y + h, x, y + h, rad);
  ctx.arcTo(x, y + h, x, y, rad);
  ctx.arcTo(x, y, x + w, y, rad);
  ctx.closePath();
}

function ellipse(ctx, x, y, rx, ry) {
  ctx.beginPath();
  ctx.ellipse(x, y, Math.max(.1, rx), Math.max(.1, ry), 0, 0, Math.PI * 2);
}

function lerp(a, b, t) { return a + (b - a) * t; }
function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

/* --------------------------------------------------------------------------
   Humanoid
   -------------------------------------------------------------------------- */
export function drawHumanoid(ctx, o) {
  const s = o.scale || 1;
  const x = o.x, y = o.y;
  const t = o.time || 0;
  const walk = o.walk || 0;
  const moving = Math.abs(walk) > .05;
  const facing = o.facing || 'down';
  const side = facing === 'left' || facing === 'right';
  const back = facing === 'up';
  const flip = facing === 'left' ? -1 : 1;
  const bob = moving ? Math.sin(t * 11) * 1.6 : Math.sin(t * 2.2) * .7;
  const atk = o.attack || 0;
  const block = o.block || 0;
  const dodge = o.dodge || 0;
  const hurt = o.hurt || 0;
  const app = o.appearance || resolveAppearance();

  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  if (dodge > 0) ctx.rotate(clamp(dodge, 0, 1) * .12 * flip);
  ctx.translate(0, bob);

  // shadow
  ctx.save();
  ctx.globalAlpha = .34;
  ctx.fillStyle = '#02050b';
  ellipse(ctx, 0, 2, 15, 5.5); ctx.fill();
  ctx.restore();

  // aura (active creature / buff)
  if (o.aura) {
    ctx.save();
    ctx.globalAlpha = .22 + Math.sin(t * 3) * .05;
    const g = ctx.createRadialGradient(0, -22, 2, 0, -22, 36);
    g.addColorStop(0, o.aura); g.addColorStop(1, 'transparent');
    ctx.fillStyle = g;
    ellipse(ctx, 0, -20, 32, 38); ctx.fill();
    ctx.restore();
  }

  // cape
  if (o.cape !== false) {
    ctx.save();
    const sway = Math.sin(t * 3.2) * 2 + (moving ? Math.sin(t * 10) * 1.2 : 0);
    ctx.fillStyle = o.capeColor || app.outfit;
    ctx.globalAlpha = .95;
    ctx.beginPath();
    ctx.moveTo(-9, -35);
    ctx.quadraticCurveTo(-17 + sway, -18, -12 + sway, 0);
    ctx.lineTo(12 + sway, 0);
    ctx.quadraticCurveTo(17 + sway, -18, 9, -35);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,.28)'; ctx.lineWidth = 1; ctx.stroke();
    ctx.restore();
  }

  // legs
  const legSwing = moving ? Math.sin(t * 11) * 4.2 : 0;
  ctx.fillStyle = o.pants || '#232b3f';
  rr(ctx, -8, -16, 6.5, 17 + legSwing * .25, 3); ctx.fill();
  rr(ctx, 1.5, -16, 6.5, 17 - legSwing * .25, 3); ctx.fill();
  // boots
  ctx.fillStyle = o.boots || '#191d2b';
  rr(ctx, -9.5, -3 + legSwing * .15, 8.5, 4.5, 2); ctx.fill();
  rr(ctx, 1, -3 - legSwing * .15, 8.5, 4.5, 2); ctx.fill();

  // torso
  const torsoG = ctx.createLinearGradient(-12, -38, 12, -16);
  torsoG.addColorStop(0, lighten(app.outfit, 18));
  torsoG.addColorStop(.55, app.outfit);
  torsoG.addColorStop(1, darken(app.outfit, 20));
  ctx.fillStyle = torsoG;
  ctx.beginPath();
  ctx.moveTo(-11, -37);
  ctx.quadraticCurveTo(-14, -26, -10, -15);
  ctx.lineTo(10, -15);
  ctx.quadraticCurveTo(14, -26, 11, -37);
  ctx.quadraticCurveTo(0, -42, -11, -37);
  ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(5,8,16,.35)'; ctx.lineWidth = 1.2; ctx.stroke();

  // belt / chest accent
  ctx.fillStyle = o.accent || app.accent;
  ctx.globalAlpha = .85;
  rr(ctx, -10, -22, 20, 3.4, 2); ctx.fill();
  ctx.globalAlpha = 1;
  ctx.fillStyle = darken(app.outfit, 28);
  rr(ctx, -4, -24, 8, 3, 1.4); ctx.fill();
  ctx.fillStyle = o.metal || '#c9b06c';
  ellipse(ctx, 0, -22.5, 2.2, 2.2); ctx.fill();

  // shoulder armor
  if (o.armor) {
    ctx.fillStyle = o.armorColor || '#aab6c9';
    ellipse(ctx, -11.5, -34, 5.6, 5.2); ctx.fill();
    ellipse(ctx, 11.5, -34, 5.6, 5.2); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,.25)'; ctx.lineWidth = 1; ctx.stroke();
  }

  // arms
  const armSwing = moving ? Math.sin(t * 11 + Math.PI) * 3 : 0;
  ctx.fillStyle = app.skin;
  if (block > 0) {
    // shield arm forward
    rr(ctx, -17, -32, 6, 17, 3); ctx.fill();
  } else {
    rr(ctx, -15, -33, 5.5, 18 + armSwing * .2, 2.7); ctx.fill();
  }
  const atkArm = atk > 0 ? Math.sin(clamp(atk, 0, 1) * Math.PI) : 0;
  ctx.save();
  ctx.translate(11, -32);
  ctx.rotate(side ? -0.25 : 0.15 + atkArm * 0.5);
  ctx.fillStyle = app.skin;
  rr(ctx, -2.5, 0, 5.5, 16, 2.7); ctx.fill();
  ctx.restore();

  // head
  const headY = -48;
  ctx.fillStyle = app.skin;
  ellipse(ctx, 0, headY, 11.5, 12.5); ctx.fill();
  ctx.strokeStyle = 'rgba(70,40,30,.25)'; ctx.lineWidth = 1; ctx.stroke();

  // ears
  ctx.fillStyle = app.skin;
  ellipse(ctx, -11, headY + 1, 2.6, 4); ctx.fill();
  ellipse(ctx, 11, headY + 1, 2.6, 4); ctx.fill();

  // hair back
  ctx.fillStyle = app.hair;
  if (app.hairStyle === 'largo' || app.hairStyle === 'ondulado') {
    ctx.beginPath();
    ctx.moveTo(-12, headY - 4);
    ctx.quadraticCurveTo(-17, headY + 14, -10, headY + 22);
    ctx.lineTo(10, headY + 22);
    ctx.quadraticCurveTo(17, headY + 14, 12, headY - 4);
    ctx.closePath(); ctx.fill();
  }

  // face / hair top
  ctx.save();
  ctx.fillStyle = app.hair;
  if (app.hairStyle === 'rapado') {
    ctx.beginPath(); ctx.ellipse(0, headY - 5, 10.5, 7, 0, Math.PI, 0); ctx.fill();
  } else {
    ctx.beginPath();
    ctx.moveTo(-12, headY - 3);
    ctx.quadraticCurveTo(-13, headY - 17, 0, headY - 17);
    ctx.quadraticCurveTo(13, headY - 17, 12, headY - 3);
    ctx.quadraticCurveTo(7, headY - 8, 2, headY - 5);
    ctx.quadraticCurveTo(-5, headY - 1, -12, headY - 3);
    ctx.closePath(); ctx.fill();
    // fringe strands
    ctx.beginPath();
    ctx.moveTo(-11, headY - 5);
    ctx.quadraticCurveTo(-4, headY - 2, 0, headY - 8);
    ctx.quadraticCurveTo(6, headY - 1, 11, headY - 6);
    ctx.quadraticCurveTo(6, headY + 2, 0, headY - 1);
    ctx.quadraticCurveTo(-6, headY + 2, -11, headY - 5);
    ctx.fill();
  }
  if (app.hairStyle === 'coleta') {
    ctx.beginPath(); ctx.ellipse(11, headY + 4, 4, 8, .5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = o.accent || app.accent;
    ellipse(ctx, 10, headY - 2, 2, 2); ctx.fill();
  }
  ctx.restore();

  // face (skip when back)
  if (!back) {
    const eyeY = headY + 2;
    const eyeDX = side ? 4.5 : 4.2;
    ctx.fillStyle = '#f7f8ff';
    ellipse(ctx, -eyeDX, eyeY, 2.2, 2.8); ctx.fill();
    ellipse(ctx, eyeDX, eyeY, 2.2, 2.8); ctx.fill();
    ctx.fillStyle = app.eyes;
    ellipse(ctx, -eyeDX + (side ? .8 : 0), eyeY + .3, 1.25, 1.8); ctx.fill();
    ellipse(ctx, eyeDX + (side ? .8 : 0), eyeY + .3, 1.25, 1.8); ctx.fill();
    ctx.fillStyle = '#fff';
    ellipse(ctx, -eyeDX + .4, eyeY - .4, .45, .6); ctx.fill();
    ellipse(ctx, eyeDX + .4, eyeY - .4, .45, .6); ctx.fill();
    // brows
    ctx.strokeStyle = darken(app.hair, 18); ctx.lineWidth = 1.3;
    ctx.beginPath(); ctx.moveTo(-6.5, eyeY - 4); ctx.lineTo(-2.5, eyeY - 3.2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(2.5, eyeY - 3.2); ctx.lineTo(6.5, eyeY - 4); ctx.stroke();
    // mouth
    ctx.strokeStyle = 'rgba(110,50,45,.55)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(-2, headY + 7.5); ctx.quadraticCurveTo(0, headY + 8.8, 2, headY + 7.5); ctx.stroke();
    // blush
    ctx.fillStyle = 'rgba(240,120,120,.14)';
    ellipse(ctx, -7, headY + 6, 2.6, 1.5); ctx.fill();
    ellipse(ctx, 7, headY + 6, 2.6, 1.5); ctx.fill();
  }

  // accessory
  if (o.accessory) {
    ctx.fillStyle = o.accessoryColor || '#f2d188';
    ctx.shadowColor = o.accessoryColor || '#f2d188'; ctx.shadowBlur = 8;
    ellipse(ctx, 0, -39, 1.8, 1.8); ctx.fill();
    ctx.shadowBlur = 0;
  }

  // shield
  if (o.shield) {
    ctx.save();
    ctx.translate(-16, -26);
    if (block > 0) { ctx.rotate(-.35); ctx.translate(-3, -1); }
    ctx.fillStyle = o.shieldColor || '#7b5a36';
    ctx.beginPath();
    ctx.moveTo(0, -9); ctx.quadraticCurveTo(10, -8, 9, 2);
    ctx.quadraticCurveTo(7, 11, 0, 14);
    ctx.quadraticCurveTo(-7, 11, -9, 2);
    ctx.quadraticCurveTo(-10, -8, 0, -9);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = o.shieldTrim || '#e2c47a'; ctx.lineWidth = 1.4; ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,.18)';
    ellipse(ctx, -2, -2, 2.2, 4); ctx.fill();
    if (block > 0) {
      ctx.strokeStyle = 'rgba(180,230,255,.65)'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(0, 0, 20 + Math.sin(t * 8) * 2, -1.2, 1.2); ctx.stroke();
    }
    ctx.restore();
  }

  // weapon
  if (o.weapon) {
    drawHeldWeapon(ctx, o.weapon, {
      t, atk, side, flip, block, weaponColor: o.weaponColor,
      celestial: o.weapon?.celestial,
    });
  }

  // hurt flash
  if (hurt > 0) {
    ctx.globalAlpha = clamp(hurt, 0, 1) * .45;
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = '#ff6a7f';
    ellipse(ctx, 0, -28, 22, 34); ctx.fill();
  }
  ctx.restore();
}

function drawHeldWeapon(ctx, weapon, { t, atk, side, block, celestial }) {
  const kind = weapon.kind || 'sword';
  ctx.save();
  ctx.translate(14, -27);
  let angle = side ? -0.1 : 0.55;
  if (atk > 0) {
    const p = clamp(atk, 0, 1);
    angle = lerp(-1.55, 1.35, easeOutCubic(p));
    ctx.translate(Math.sin(p * Math.PI) * 5, -Math.sin(p * Math.PI) * 4);
  }
  if (block > 0) angle = -1.3;
  ctx.rotate(angle);
  const glow = celestial || weapon.glow;
  if (glow) { ctx.shadowColor = '#ffe6a0'; ctx.shadowBlur = 12; }
  switch (kind) {
    case 'greatsword':
      ctx.fillStyle = '#4a3a2a'; rr(ctx, -2, -4, 4, 13, 1.5); ctx.fill();
      ctx.fillStyle = '#c9a14a'; rr(ctx, -7, -7, 14, 3, 1.5); ctx.fill();
      ctx.fillStyle = glow ? '#fff3c4' : '#cfd9ea';
      ctx.beginPath(); ctx.moveTo(-3.4, -7); ctx.lineTo(0, -47); ctx.lineTo(3.4, -7); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,.5)'; ctx.lineWidth = 1; ctx.stroke();
      break;
    case 'dagger':
      ctx.fillStyle = '#3b2a22'; rr(ctx, -1.5, -3, 3, 8, 1); ctx.fill();
      ctx.fillStyle = '#c9a14a'; rr(ctx, -4, -5, 8, 2, 1); ctx.fill();
      ctx.fillStyle = glow ? '#fff3c4' : '#d7dfef';
      ctx.beginPath(); ctx.moveTo(-2.2, -5); ctx.lineTo(0, -24); ctx.lineTo(2.2, -5); ctx.closePath(); ctx.fill();
      break;
    case 'spear':
      ctx.fillStyle = '#7a5a35'; rr(ctx, -1.4, -52, 2.8, 58, 1.4); ctx.fill();
      ctx.fillStyle = glow ? '#fff3c4' : '#c7d3e6';
      ctx.beginPath(); ctx.moveTo(0, -64); ctx.lineTo(4, -52); ctx.lineTo(0, -48); ctx.lineTo(-4, -52); ctx.closePath(); ctx.fill();
      break;
    case 'bow':
      ctx.strokeStyle = '#a77a43'; ctx.lineWidth = 2.4;
      ctx.beginPath(); ctx.arc(0, -14, 15, -1.2, 1.2); ctx.stroke();
      ctx.strokeStyle = 'rgba(220,240,255,.65)'; ctx.lineWidth = .8;
      ctx.beginPath(); ctx.moveTo(5.5, -27); ctx.lineTo(5.5, -1); ctx.stroke();
      ctx.fillStyle = '#e9f5ff';
      ctx.beginPath(); ctx.moveTo(-14, -14); ctx.lineTo(4, -18); ctx.lineTo(4, -10); ctx.closePath(); ctx.fill();
      break;
    case 'staff':
      ctx.fillStyle = '#5a4a6d'; rr(ctx, -1.8, -46, 3.6, 51, 1.8); ctx.fill();
      ctx.fillStyle = '#f2d188'; ctx.shadowColor = '#ffe9a8'; ctx.shadowBlur = 14;
      ellipse(ctx, 0, -50, 5, 5); ctx.fill();
      ctx.fillStyle = '#fff8df'; ellipse(ctx, -1, -52, 1.6, 1.6); ctx.fill();
      break;
    case 'hammer':
      ctx.fillStyle = '#6b4a2c'; rr(ctx, -2.4, -38, 4.8, 44, 2); ctx.fill();
      ctx.fillStyle = '#8a929f';
      rr(ctx, -13, -46, 26, 13, 3); ctx.fill();
      ctx.fillStyle = '#b8c2d0';
      rr(ctx, -11, -44, 22, 4, 2); ctx.fill();
      ctx.fillStyle = '#5c6470';
      rr(ctx, -12, -34, 24, 3, 1.5); ctx.fill();
      break;
    default:
      ctx.fillStyle = '#5b3b24'; rr(ctx, -2, -4, 4, 12, 1.5); ctx.fill();
      ctx.fillStyle = '#c9a14a'; rr(ctx, -7, -7, 14, 3, 1.5); ctx.fill();
      ctx.fillStyle = glow ? '#fff3c4' : '#dbe4f2';
      ctx.beginPath(); ctx.moveTo(-2.6, -7); ctx.lineTo(0, -38); ctx.lineTo(2.6, -7); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,.55)'; ctx.lineWidth = .8; ctx.stroke();
      if (glow) {
        ctx.fillStyle = 'rgba(255,235,160,.25)';
        ctx.beginPath(); ctx.moveTo(-2.6, -7); ctx.lineTo(0, -38); ctx.lineTo(2.6, -7); ctx.closePath(); ctx.fill();
      }
  }
  ctx.restore();
}

export function drawSlash(ctx, x, y, angle, radius, progress, color = '#ffe6a0', arc = 1.6) {
  if (progress <= 0 || progress >= 1) return;
  const a0 = angle - arc / 2;
  const sweep = arc * easeOutCubic(clamp(progress, 0, 1));
  ctx.save();
  ctx.translate(x, y - 26);
  ctx.rotate(a0 + sweep * .5);
  ctx.globalCompositeOperation = 'lighter';
  const alpha = (1 - progress) * .9;
  const g = ctx.createRadialGradient(0, 0, radius * .25, 0, 0, radius);
  g.addColorStop(0, 'rgba(255,255,255,0)');
  g.addColorStop(.72, color);
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = g;
  ctx.lineWidth = 5 + (1 - progress) * 9;
  ctx.beginPath();
  ctx.arc(0, 0, radius * .8, -sweep / 2, sweep / 2);
  ctx.stroke();
  ctx.globalAlpha = alpha * .5;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, 0, radius * .95, -sweep / 2, sweep / 2);
  ctx.stroke();
  ctx.restore();
}

/* --------------------------------------------------------------------------
   Creatures
   -------------------------------------------------------------------------- */
export function drawCreature(ctx, id, x, y, t, scale = 1, o = {}) {
  const def = CREATURES[id];
  if (!def) return;
  const el = ELEMENTS[def.element];
  const c1 = def.colors[0], c2 = def.colors[1];
  const bob = Math.sin(t * 2.6 + (o.phase || 0)) * 4;
  ctx.save();
  ctx.translate(x, y + bob);
  ctx.scale(scale * (o.flip ? -1 : 1), scale);
  if (o.alpha != null) ctx.globalAlpha = o.alpha;
  // glow
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const g = ctx.createRadialGradient(0, -10, 1, 0, -10, 30);
  g.addColorStop(0, hexA(el.color, .35)); g.addColorStop(1, 'transparent');
  ctx.fillStyle = g; ellipse(ctx, 0, -10, 30, 30); ctx.fill();
  ctx.restore();

  // shadow
  ctx.globalAlpha *= .5;
  ctx.fillStyle = '#02050b'; ellipse(ctx, 0, 2, 13, 4); ctx.fill();
  ctx.globalAlpha = o.alpha != null ? o.alpha : 1;

  const kind = id;
  if (kind === 'aqua') {
    // otter spirit
    ctx.fillStyle = c1;
    ellipse(ctx, 0, -14, 14, 11); ctx.fill();
    ellipse(ctx, 0, -24, 8.5, 8); ctx.fill();
    ctx.fillStyle = c2; ellipse(ctx, 0, -12, 8, 7); ctx.fill();
    ctx.fillStyle = c1; ellipse(ctx, -10, -26, 3.4, 3.4); ctx.fill(); ellipse(ctx, 10, -26, 3.4, 3.4); ctx.fill();
    ctx.fillStyle = '#14233b'; ellipse(ctx, -3.4, -25, 1.2, 1.6); ctx.fill(); ellipse(ctx, 3.4, -25, 1.2, 1.6); ctx.fill();
    ctx.strokeStyle = c2; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(11, -12); ctx.quadraticCurveTo(22, -6, 18, 4); ctx.stroke();
  } else if (kind === 'terron') {
    ctx.fillStyle = c1; rr(ctx, -14, -22, 28, 22, 8); ctx.fill();
    ctx.fillStyle = c2; rr(ctx, -10, -18, 20, 13, 6); ctx.fill();
    ctx.fillStyle = '#3a2c20'; ellipse(ctx, -4.5, -12, 1.8, 2.2); ctx.fill(); ellipse(ctx, 4.5, -12, 1.8, 2.2); ctx.fill();
    ctx.fillStyle = c1; ellipse(ctx, -13, -8, 4, 6); ctx.fill(); ellipse(ctx, 13, -8, 4, 6); ctx.fill();
    ctx.fillStyle = '#7a5a38'; rr(ctx, -8, -30, 5, 10, 2); ctx.fill(); rr(ctx, 3, -30, 5, 10, 2); ctx.fill();
  } else if (kind === 'zephyra') {
    ctx.fillStyle = c1;
    ctx.beginPath(); ctx.moveTo(0, -24); ctx.quadraticCurveTo(-20, -30, -14, -8); ctx.quadraticCurveTo(-6, -16, 0, -14); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(0, -24); ctx.quadraticCurveTo(20, -30, 14, -8); ctx.quadraticCurveTo(6, -16, 0, -14); ctx.closePath(); ctx.fill();
    ctx.fillStyle = c2; ellipse(ctx, 0, -16, 8, 9); ctx.fill();
    ctx.fillStyle = c1; ellipse(ctx, 0, -26, 6.5, 6); ctx.fill();
    ctx.fillStyle = '#1a2b3c'; ellipse(ctx, -2.5, -27, 1.1, 1.4); ctx.fill(); ellipse(ctx, 2.5, -27, 1.1, 1.4); ctx.fill();
    ctx.fillStyle = '#f2c96a'; ctx.beginPath(); ctx.moveTo(0, -28); ctx.lineTo(4, -24); ctx.lineTo(0, -22); ctx.closePath(); ctx.fill();
  } else if (kind === 'volt') {
    ctx.fillStyle = c1; ellipse(ctx, 0, -16, 12, 9); ctx.fill();
    ctx.fillStyle = c1; ellipse(ctx, 0, -26, 7.5, 7); ctx.fill();
    ctx.beginPath(); ctx.moveTo(-7, -29); ctx.lineTo(-9, -37); ctx.lineTo(-3, -31); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(7, -29); ctx.lineTo(9, -37); ctx.lineTo(3, -31); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#3b2f14'; ellipse(ctx, -3, -26, 1.1, 1.5); ctx.fill(); ellipse(ctx, 3, -26, 1.1, 1.5); ctx.fill();
    ctx.strokeStyle = c2; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(10, -18); ctx.quadraticCurveTo(20, -22, 16, -10); ctx.stroke();
    ctx.strokeStyle = c2; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(-13, -14); ctx.lineTo(-17, -18); ctx.lineTo(-12, -20); ctx.stroke();
  } else if (kind === 'glacius') {
    ctx.fillStyle = c1; ellipse(ctx, 0, -16, 12, 9); ctx.fill();
    ctx.fillStyle = c2; ellipse(ctx, 0, -12, 7, 6); ctx.fill();
    ctx.fillStyle = c1; ellipse(ctx, 0, -26, 7.5, 7); ctx.fill();
    ctx.fillStyle = c1;
    ctx.beginPath(); ctx.moveTo(-7, -28); ctx.lineTo(-11, -40); ctx.lineTo(-3, -30); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(7, -28); ctx.lineTo(11, -40); ctx.lineTo(3, -30); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#183249'; ellipse(ctx, -3, -26, 1.2, 1.6); ctx.fill(); ellipse(ctx, 3, -26, 1.2, 1.6); ctx.fill();
    ctx.strokeStyle = c2; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(10, -18); ctx.quadraticCurveTo(20, -14, 15, -4); ctx.stroke();
    ctx.fillStyle = 'rgba(220,250,255,.8)';
    for (let i = 0; i < 3; i++) { const a = t * 1.4 + i * 2.1; ellipse(ctx, Math.cos(a) * 18, -16 + Math.sin(a) * 12, 1.4, 1.4); ctx.fill(); }
  } else if (kind === 'lumina') {
    ctx.fillStyle = c1; ellipse(ctx, 0, -16, 13, 9); ctx.fill();
    ctx.fillStyle = c1; ellipse(ctx, 0, -27, 6.5, 7); ctx.fill();
    ctx.fillStyle = c2;
    ctx.beginPath(); ctx.moveTo(-5, -31); ctx.lineTo(-11, -43); ctx.lineTo(-2, -34); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(5, -31); ctx.lineTo(11, -43); ctx.lineTo(2, -34); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(-9, -32); ctx.lineTo(-17, -38); ctx.lineTo(-8, -29); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(9, -32); ctx.lineTo(17, -38); ctx.lineTo(8, -29); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#5b4a1e'; ellipse(ctx, -2.6, -27, 1.1, 1.5); ctx.fill(); ellipse(ctx, 2.6, -27, 1.1, 1.5); ctx.fill();
    ctx.strokeStyle = c2; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(10, -18); ctx.quadraticCurveTo(19, -16, 16, -8); ctx.stroke();
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = 'rgba(255,245,190,.55)';
    for (let i = 0; i < 4; i++) { const a = t * .9 + i * 1.6; ellipse(ctx, Math.cos(a) * 20, -18 + Math.sin(a * 1.3) * 14, 1.5, 1.5); ctx.fill(); }
  } else if (kind === 'umbra') {
    ctx.fillStyle = c1; ellipse(ctx, 0, -15, 11, 9); ctx.fill();
    ctx.fillStyle = c1; ellipse(ctx, 0, -25, 7, 6.5); ctx.fill();
    ctx.beginPath(); ctx.moveTo(-6, -28); ctx.lineTo(-8, -36); ctx.lineTo(-2, -30); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(6, -28); ctx.lineTo(8, -36); ctx.lineTo(2, -30); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#f7e9ff'; ellipse(ctx, -2.6, -25, 1.5, 2); ctx.fill(); ellipse(ctx, 2.6, -25, 1.5, 2); ctx.fill();
    ctx.strokeStyle = c1; ctx.lineWidth = 2.6; ctx.beginPath(); ctx.moveTo(10, -16); ctx.quadraticCurveTo(23, -20, 18, -30); ctx.stroke();
    ctx.fillStyle = 'rgba(180,150,255,.18)';
    ellipse(ctx, 0, -8, 16, 6); ctx.fill();
  } else if (kind === 'sylva') {
    ctx.fillStyle = c1; ellipse(ctx, 0, -15, 11, 10); ctx.fill();
    ctx.fillStyle = c2; ellipse(ctx, 0, -13, 7, 7); ctx.fill();
    ctx.fillStyle = c1; ellipse(ctx, 0, -25, 7.5, 6.5); ctx.fill();
    ctx.fillStyle = '#3d6b46';
    ctx.beginPath(); ctx.moveTo(-7, -29); ctx.quadraticCurveTo(-15, -38, -4, -34); ctx.quadraticCurveTo(-2, -31, -7, -29); ctx.fill();
    ctx.beginPath(); ctx.moveTo(7, -29); ctx.quadraticCurveTo(15, -38, 4, -34); ctx.quadraticCurveTo(2, -31, 7, -29); ctx.fill();
    ctx.fillStyle = '#25402d'; ellipse(ctx, -2.6, -25, 1.1, 1.5); ctx.fill(); ellipse(ctx, 2.6, -25, 1.1, 1.5); ctx.fill();
    ctx.strokeStyle = '#5f9c7a'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, -32); ctx.quadraticCurveTo(2, -40, 8, -40); ctx.stroke();
    ctx.fillStyle = '#ffd27a'; ellipse(ctx, 8, -40, 2.4, 2.4); ctx.fill();
  } else if (kind === 'aether') {
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = c1; ellipse(ctx, 0, -18, 13, 10); ctx.fill();
    ctx.fillStyle = c2; ellipse(ctx, 0, -18, 7, 6); ctx.fill();
    ctx.strokeStyle = c1; ctx.lineWidth = 2;
    for (let i = 0; i < 3; i++) {
      ctx.globalAlpha = .5 + Math.sin(t * 2 + i) * .2;
      ellipse(ctx, 0, -18, 18 + i * 5, 13 + i * 4); ctx.stroke();
    }
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#fff9e0';
    for (let i = 0; i < 6; i++) {
      const a = t * 1.2 + i * Math.PI / 3;
      ellipse(ctx, Math.cos(a) * 20, -18 + Math.sin(a) * 15, 1.5, 1.5); ctx.fill();
    }
  } else {
    // ignis / default fox
    ctx.fillStyle = c1; ellipse(ctx, 0, -16, 12, 9); ctx.fill();
    ctx.fillStyle = c2; ellipse(ctx, 0, -12, 7, 6); ctx.fill();
    ctx.fillStyle = c1; ellipse(ctx, 0, -26, 7.5, 7); ctx.fill();
    ctx.beginPath(); ctx.moveTo(-7, -29); ctx.lineTo(-9, -38); ctx.lineTo(-3, -31); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(7, -29); ctx.lineTo(9, -38); ctx.lineTo(3, -31); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#402015'; ellipse(ctx, -3, -26, 1.2, 1.6); ctx.fill(); ellipse(ctx, 3, -26, 1.2, 1.6); ctx.fill();
    ctx.strokeStyle = c1; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(10, -18); ctx.quadraticCurveTo(22, -24, 17, -32); ctx.stroke();
    ctx.fillStyle = c2; ellipse(ctx, 17, -33, 3.5, 4); ctx.fill();
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 3; i++) {
      const a = t * 2 + i * 2.1;
      ctx.fillStyle = hexA(el.color, .5);
      ellipse(ctx, Math.cos(a) * 17, -16 + Math.sin(a) * 13, 1.5, 1.5); ctx.fill();
    }
  }
  ctx.restore();
}

/* --------------------------------------------------------------------------
   Enemies
   -------------------------------------------------------------------------- */
export function drawEnemy(ctx, kind, x, y, t, o = {}) {
  const scale = o.scale || 1;
  const hurt = o.hurt || 0;
  const facing = o.facing || 1;
  const attack = o.attack || 0;
  const colors = o.colors || ['#8a9bb8', '#d6e0f0'];
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale * (facing < 0 ? -1 : 1), scale);

  // shadow
  ctx.globalAlpha = .3; ctx.fillStyle = '#02040a';
  ellipse(ctx, 0, 2, kind === 'boss' ? 32 : kind === 'guardian' ? 24 : 16, kind === 'boss' ? 10 : 6); ctx.fill();
  ctx.globalAlpha = 1;

  if (kind === 'blob') {
    const squish = 1 + Math.sin(t * 3.2) * .07;
    ctx.fillStyle = colors[0];
    ctx.beginPath(); ctx.ellipse(0, -12, 17 / squish, 14 * squish, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = colors[1]; ctx.globalAlpha = .55;
    ellipse(ctx, -5, -18, 5, 3.5); ctx.fill(); ctx.globalAlpha = 1;
    ctx.fillStyle = '#17301f'; ellipse(ctx, -5, -13, 1.8, 2.2); ctx.fill(); ellipse(ctx, 5, -13, 1.8, 2.2); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,.55)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(0, -9, 4, .3, Math.PI - .3); ctx.stroke();
    ctx.fillStyle = 'rgba(190,255,210,.6)';
    for (let i = 0; i < 3; i++) { const a = t * 1.2 + i * 2; ellipse(ctx, Math.cos(a) * 20, -8 + Math.sin(a) * 8, 1.2, 1.2); ctx.fill(); }
  } else if (kind === 'wolf') {
    const lunge = attack > 0 ? Math.sin(attack * Math.PI) * 8 : 0;
    ctx.translate(lunge, 0);
    ctx.fillStyle = colors[0];
    rr(ctx, -16, -20, 32, 14, 7); ctx.fill();
    // legs
    ctx.strokeStyle = colors[0]; ctx.lineWidth = 4; ctx.lineCap = 'round';
    for (let i = 0; i < 4; i++) {
      const lx = -11 + i * 7.5;
      const sw = Math.sin(t * 8 + i * 1.7) * 3;
      ctx.beginPath(); ctx.moveTo(lx, -8); ctx.lineTo(lx + sw, 0); ctx.stroke();
    }
    // head
    ctx.fillStyle = colors[0];
    ellipse(ctx, 16, -26, 9, 8); ctx.fill();
    ctx.beginPath(); ctx.moveTo(10, -32); ctx.lineTo(9, -40); ctx.lineTo(15, -33); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(19, -32); ctx.lineTo(22, -39); ctx.lineTo(24, -31); ctx.closePath(); ctx.fill();
    ctx.fillStyle = colors[1]; ellipse(ctx, 20, -22, 4.5, 3.5); ctx.fill();
    ctx.fillStyle = '#1b1520'; ellipse(ctx, 20.5, -25.5, 1.2, 1.6); ctx.fill();
    ctx.fillStyle = '#ffd27a'; ellipse(ctx, 15.5, -28, 1.3, 1.8); ctx.fill();
    // tail
    ctx.strokeStyle = colors[0]; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(-15, -16); ctx.quadraticCurveTo(-26, -22, -23, -30 + Math.sin(t * 3) * 3); ctx.stroke();
    // eye glow
    ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = 'rgba(255,190,90,.4)';
    ellipse(ctx, 15.5, -28, 5, 4); ctx.fill();
  } else if (kind === 'beetle') {
    ctx.fillStyle = colors[0];
    ellipse(ctx, 0, -14, 20, 13); ctx.fill();
    ctx.fillStyle = colors[1];
    ctx.beginPath(); ctx.ellipse(0, -17, 16, 9, 0, Math.PI, 0); ctx.fill();
    ctx.strokeStyle = 'rgba(60,40,20,.55)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, -26); ctx.lineTo(0, -8); ctx.stroke();
    // horn
    ctx.fillStyle = '#3d2c1c';
    ctx.beginPath(); ctx.moveTo(14, -22); ctx.lineTo(27, -30); ctx.lineTo(17, -17); ctx.closePath(); ctx.fill();
    // legs
    ctx.strokeStyle = '#3d2c1c'; ctx.lineWidth = 3; ctx.lineCap = 'round';
    for (let i = 0; i < 3; i++) {
      const lx = -12 + i * 12;
      const sw = Math.sin(t * 5 + i) * 2;
      ctx.beginPath(); ctx.moveTo(lx, -10); ctx.lineTo(lx - 5, -2 + sw); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(lx, -10); ctx.lineTo(lx + 5, -2 - sw); ctx.stroke();
    }
    ctx.fillStyle = '#ffe08a'; ellipse(ctx, 13, -23, 1.4, 1.6); ctx.fill();
  } else if (kind === 'wraith') {
    const float = Math.sin(t * 2.2) * 3;
    ctx.translate(0, float);
    ctx.globalAlpha = .88;
    ctx.fillStyle = colors[0];
    ctx.beginPath();
    ctx.moveTo(0, -44);
    ctx.quadraticCurveTo(16, -38, 14, -12);
    ctx.quadraticCurveTo(10, -2, 6, -10);
    ctx.quadraticCurveTo(3, 0, 0, -8);
    ctx.quadraticCurveTo(-3, 0, -6, -10);
    ctx.quadraticCurveTo(-10, -2, -14, -12);
    ctx.quadraticCurveTo(-16, -38, 0, -44);
    ctx.fill();
    // hood
    ctx.fillStyle = darken(colors[0], 25);
    ctx.beginPath(); ctx.ellipse(0, -38, 12, 11, 0, Math.PI, 0); ctx.fill();
    ctx.fillStyle = '#0b0a16'; ellipse(ctx, 0, -34, 8, 7); ctx.fill();
    ctx.fillStyle = '#d7c6ff'; ellipse(ctx, -3, -34, 1.6, 2.4); ctx.fill(); ellipse(ctx, 3, -34, 1.6, 2.4); ctx.fill();
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = 'rgba(170,140,255,.35)';
    ellipse(ctx, 0, -20, 16, 18); ctx.fill();
    ctx.fillStyle = 'rgba(220,200,255,.5)';
    for (let i = 0; i < 4; i++) { const a = t + i * 1.7; ellipse(ctx, Math.cos(a) * 18, -20 + Math.sin(a * 1.4) * 16, 1.2, 1.2); ctx.fill(); }
  } else if (kind === 'guardian' || kind === 'boss') {
    const boss = kind === 'boss';
    const S = boss ? 1.5 : 1.15;
    ctx.scale(S, S);
    const aura = boss ? colors[1] : '#ff9caf';
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    const g = ctx.createRadialGradient(0, -30, 4, 0, -30, boss ? 70 : 50);
    g.addColorStop(0, hexA(aura, .35)); g.addColorStop(1, 'transparent');
    ctx.fillStyle = g; ellipse(ctx, 0, -30, boss ? 70 : 48, boss ? 80 : 55); ctx.fill(); ctx.restore();

    // cape
    ctx.fillStyle = darken(colors[0], 20);
    ctx.beginPath(); ctx.moveTo(-16, -50); ctx.quadraticCurveTo(-30, -20, -20, 2); ctx.lineTo(20, 2); ctx.quadraticCurveTo(30, -20, 16, -50); ctx.closePath(); ctx.fill();
    // legs
    ctx.fillStyle = '#26202c'; rr(ctx, -12, -20, 9, 20, 3); ctx.fill(); rr(ctx, 3, -20, 9, 20, 3); ctx.fill();
    // armor torso
    const ag = ctx.createLinearGradient(-18, -55, 18, -18);
    ag.addColorStop(0, '#6d6472'); ag.addColorStop(.5, colors[0]); ag.addColorStop(1, '#2a2430');
    ctx.fillStyle = ag; rr(ctx, -16, -54, 32, 36, 8); ctx.fill();
    ctx.strokeStyle = hexA(aura, .5); ctx.lineWidth = 1.4; ctx.stroke();
    // chest gem
    ctx.fillStyle = aura; ctx.shadowColor = aura; ctx.shadowBlur = 14;
    ctx.beginPath(); ctx.moveTo(0, -45); ctx.lineTo(5, -38); ctx.lineTo(0, -31); ctx.lineTo(-5, -38); ctx.closePath(); ctx.fill();
    ctx.shadowBlur = 0;
    // shoulders
    ctx.fillStyle = '#4b4350'; ellipse(ctx, -18, -49, 8, 7); ctx.fill(); ellipse(ctx, 18, -49, 8, 7); ctx.fill();
    // helm
    ctx.fillStyle = '#3a3342'; rr(ctx, -10, -70, 20, 18, 7); ctx.fill();
    ctx.fillStyle = '#0c0a12'; rr(ctx, -8, -65, 16, 5, 2); ctx.fill();
    ctx.fillStyle = aura; ctx.shadowColor = aura; ctx.shadowBlur = 10;
    ellipse(ctx, -4, -63, 1.8, 1.8); ctx.fill(); ellipse(ctx, 4, -63, 1.8, 1.8); ctx.fill();
    ctx.shadowBlur = 0;
    if (boss) {
      // horns / crown
      ctx.fillStyle = aura;
      ctx.beginPath(); ctx.moveTo(-9, -69); ctx.lineTo(-20, -84); ctx.lineTo(-4, -72); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.moveTo(9, -69); ctx.lineTo(20, -84); ctx.lineTo(4, -72); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.moveTo(0, -72); ctx.lineTo(4, -88); ctx.lineTo(-4, -88); ctx.closePath(); ctx.fill();
    }
    // sword
    ctx.save();
    ctx.translate(22, -44);
    ctx.rotate(-.45 + (attack > 0 ? Math.sin(attack * Math.PI) * 1.4 : 0));
    ctx.fillStyle = '#3a2a20'; rr(ctx, -3, -2, 6, 15, 2); ctx.fill();
    ctx.fillStyle = '#b89a55'; rr(ctx, -10, -6, 20, 4, 2); ctx.fill();
    ctx.fillStyle = '#c8cede';
    ctx.beginPath(); ctx.moveTo(-5, -6); ctx.lineTo(0, -62); ctx.lineTo(5, -6); ctx.closePath(); ctx.fill();
    ctx.fillStyle = hexA(aura, .5);
    ctx.beginPath(); ctx.moveTo(-2, -6); ctx.lineTo(0, -62); ctx.lineTo(2, -6); ctx.closePath(); ctx.fill();
    ctx.restore();
  }

  // hurt flash
  if (hurt > 0) {
    ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = clamp(hurt, 0, 1) * .6;
    ctx.fillStyle = '#ffd0d8';
    ellipse(ctx, 0, -24, kind === 'boss' ? 46 : 24, kind === 'boss' ? 58 : 30); ctx.fill();
  }
  ctx.restore();
}

/* --------------------------------------------------------------------------
   Portraits & UI helpers
   -------------------------------------------------------------------------- */
export function drawPortrait(canvas, app, opts = {}) {
  if (!canvas) return;
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const w = canvas.clientWidth || 92, h = canvas.clientHeight || 104;
  canvas.width = w * dpr; canvas.height = h * dpr;
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, w, h);
  const g = ctx.createRadialGradient(w / 2, h * .34, 2, w / 2, h * .34, w * .7);
  g.addColorStop(0, opts.glow || 'rgba(111,232,212,.16)');
  g.addColorStop(1, 'transparent');
  ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
  drawHumanoid(ctx, {
    x: w / 2, y: h * .96, scale: Math.min(w, h) / 128, time: opts.time || 0,
    facing: 'down', appearance: resolveAppearance(app), cape: true,
    weapon: null, shield: false,
  });
}

/* --------------------------------------------------------------------------
   Utility color
   -------------------------------------------------------------------------- */
export function lighten(hex, amt) {
  const c = parseHex(hex); return `rgb(${clamp(c[0] + amt, 0, 255)},${clamp(c[1] + amt, 0, 255)},${clamp(c[2] + amt, 0, 255)})`;
}
export function darken(hex, amt) {
  const c = parseHex(hex); return `rgb(${clamp(c[0] - amt, 0, 255)},${clamp(c[1] - amt, 0, 255)},${clamp(c[2] - amt, 0, 255)})`;
}
export function hexA(hex, a) {
  const c = parseHex(hex); return `rgba(${c[0]},${c[1]},${c[2]},${a})`;
}
function parseHex(hex) {
  if (!hex) return [255, 255, 255];
  if (hex.startsWith('rgb')) {
    const m = hex.match(/\d+/g) || [255, 255, 255];
    return [+m[0], +m[1], +m[2]];
  }
  let h = hex.replace('#', '');
  if (h.length === 3) h = h.split('').map(c => c + c).join('');
  return [parseInt(h.slice(0, 2), 16) || 0, parseInt(h.slice(2, 4), 16) || 0, parseInt(h.slice(4, 6), 16) || 0];
}
function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }
