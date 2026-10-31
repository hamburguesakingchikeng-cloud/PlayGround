import { APPEARANCE, ITEMS, CREATURES } from './data.js';
import { TAU, clamp, lerp, rgba, mixHex } from './util.js';
import { rr, ell, shadow, glow, line, flame } from './art.js';

// ───────────────────────── paletas de personajes ─────────────────────────
const LOOKS = {
  hero: { skin: '#e2b18c', hair: '#5c3b22', hairStyle: 'largo', outfit: '#203f63', cape: '#792232', eye: '#6c8f8b', acc: 'none' },
  iria: { skin: '#e8c7a8', hair: '#d8d2c0', hairStyle: 'largo', outfit: '#2e4260', cape: '#8c2f3f', eye: '#d8b56e', acc: 'circlet', elder: true },
  kael: { skin: '#c99068', hair: '#241d1a', hairStyle: 'corto', outfit: '#2e3a52', cape: '#1f2c42', eye: '#7da9c9', acc: 'scar' },
  nara: { skin: '#c98e63', hair: '#a8552b', hairStyle: 'trenza', outfit: '#4a5030', cape: '#6b5330', eye: '#8fb06a', acc: 'goggles' },
  bram: { skin: '#b07a52', hair: '#4a3a2e', hairStyle: 'rapado', outfit: '#4b3b2e', cape: '#3a2c24', eye: '#6b4a2b', acc: 'beard', beard: '#3a2c24' },
  aldric: { skin: '#e0b08a', hair: '#5c3b22', hairStyle: 'corto', outfit: '#5c2d3a', cape: '#8a6a2e', eye: '#8b6b3a', acc: 'hat' },
  ren: { skin: '#9d6844', hair: '#241d1a', hairStyle: 'rapado', outfit: '#3c4a35', cape: '#1f4d7d', eye: '#7c8a5a', acc: 'hood' },
  milo: { skin: '#f2d3b8', hair: '#d8b56e', hairStyle: 'mechones', outfit: '#39482f', cape: '#6b5330', eye: '#6c8f8b', acc: 'none' },
  hermit: { skin: '#a06a48', hair: '#d8d2c0', hairStyle: 'largo', outfit: '#4a402c', cape: '#3a3528', eye: '#6b6b4a', acc: 'beard', beard: '#c9c4b2', elder: true },
  eira: { skin: '#f2d3b8', hair: '#e8e2d2', hairStyle: 'largo', outfit: '#2e4a5c', cape: '#b9ced6', eye: '#9dd6e8', acc: 'circlet' },
  ghost: { skin: '#bcd0d2', hair: '#d9e4e4', hairStyle: 'largo', outfit: '#4a6068', cape: '#7da9a8', eye: '#d9f4f5', acc: 'none', ghost: true },
  sera: { skin: '#b07a52', hair: '#241d1a', hairStyle: 'trenza', outfit: '#5a3a2c', cape: '#8a4a2e', eye: '#d8a05a', acc: 'none' },
  orda: { skin: '#9d6844', hair: '#4a3a2e', hairStyle: 'rapado', outfit: '#3c2c26', cape: '#5a3a2c', eye: '#c98e63', acc: 'goggles' },
  king: { skin: '#a8b6b8', hair: '#d8d2c0', hairStyle: 'largo', outfit: '#3a3430', cape: '#6d2a2c', eye: '#ff9a3c', acc: 'crown', beard: '#d8d2c0', ghost: true },
  sibil: { skin: '#e8d4c4', hair: '#e8e2d2', hairStyle: 'largo', outfit: '#44345c', cape: '#61457e', eye: '#b58fd0', acc: 'circlet', elder: true },
  keeper: { skin: '#c9b8a8', hair: '#b9ced6', hairStyle: 'corto', outfit: '#46525e', cape: '#2e4a5c', eye: '#9dd6e8', acc: 'hood', elder: true },
  child: { skin: '#f2d3b8', hair: '#c96a9a', hairStyle: 'trenza', outfit: '#cdeff0', cape: '#b9e0e8', eye: '#9dd6e8', acc: 'none', ghost: true, young: true }
};

function lookFor(id, appearance) {
  if (id === 'hero' && appearance) {
    return {
      skin: APPEARANCE.skins[appearance.skin]?.c || '#e2b18c',
      hair: APPEARANCE.hairs[appearance.hair]?.c || '#5c3b22',
      hairStyle: APPEARANCE.hairStyles[appearance.hairStyle] || 'largo',
      outfit: APPEARANCE.outfits[appearance.outfit]?.c || '#203f63',
      cape: APPEARANCE.capes[appearance.cape]?.c || '#792232',
      eye: appearance.eye || '#6c8f8b',
      acc: 'none'
    };
  }
  return LOOKS[id] || LOOKS.hero;
}

function armorPalette(player) {
  const armor = ITEMS[player.equipment?.armor];
  const helm = ITEMS[player.equipment?.helm];
  const capeI = ITEMS[player.equipment?.cape];
  const weapon = ITEMS[player.equipment?.weapon];
  const app = player.appearance || {};
  let body = APPEARANCE.outfits[app.outfit]?.c || '#2c3b52';
  let shoulder = '#3f4652', plate = null;
  if (armor?.id === 'cuero_brumavela') { body = '#6d4a2e'; shoulder = '#7d5a37'; plate = 'leather'; }
  else if (armor?.id === 'malla_guardia') { body = '#66707f'; shoulder = '#8b96a6'; plate = 'mail'; }
  else if (armor?.id === 'placas_ceniza') { body = '#3e3839'; shoulder = '#6b3a2e'; plate = 'plate'; }
  else if (armor?.id === 'manto_celestial') { body = '#c9c4b4'; shoulder = '#e8c37a'; plate = 'celestial'; }
  else if (armor) { body = '#4b5563'; shoulder = '#6b7280'; plate = 'leather'; }
  let blade = '#cfd6da', bladeGlow = null;
  if (weapon?.id === 'daga_velo') { blade = '#9d7fc0'; bladeGlow = '#a382c4'; }
  else if (weapon?.id === 'hoja_gemela') { blade = '#d7e2e8'; bladeGlow = '#9ab7c9'; }
  else if (weapon?.id === 'espada_bruma') { blade = '#c9e4e8'; bladeGlow = '#8fd0df'; }
  else if (weapon?.id === 'filo_ceniza') { blade = '#ffb07a'; bladeGlow = '#ef7448'; }
  else if (weapon?.id === 'espada_alba') { blade = '#ffe9b2'; bladeGlow = '#f2d98e'; }
  return { body, shoulder, plate, blade, bladeGlow, cape: capeI ? (capeI.id === 'manto_brasa' ? '#8a3a2a' : capeI.id === 'velo_estelar' ? '#2e2a52' : APPEARANCE.capes[app.cape]?.c) : APPEARANCE.capes[app.cape]?.c || '#792232', helm: helm?.id !== 'capucha_viajero' ? helm?.id : null };
}

function hairShape(ctx, x, y, r, style, color, back = false) {
  ctx.fillStyle = color;
  if (style === 'rapado') {
    if (back) return;
    ctx.beginPath(); ctx.ellipse(x, y - r * .28, r * .98, r * .86, 0, Math.PI, TAU); ctx.fill();
  } else if (style === 'corto') {
    if (back) return;
    ctx.beginPath();
    ctx.moveTo(x - r * .96, y - r * .15);
    ctx.quadraticCurveTo(x - r * 1.05, y - r * 1.2, x, y - r * 1.15);
    ctx.quadraticCurveTo(x + r * 1.05, y - r * 1.2, x + r * .96, y - r * .1);
    ctx.quadraticCurveTo(x + r * .6, y - r * .55, x + r * .2, y - r * .4);
    ctx.quadraticCurveTo(x - r * .5, y - r * .6, x - r * .96, y - r * .1);
    ctx.fill();
  } else if (style === 'mechones') {
    if (back) return;
    ctx.beginPath();
    ctx.moveTo(x - r, y - r * .1);
    for (let i = 0; i < 5; i++) {
      const sx = x - r + i * r * .5;
      ctx.lineTo(sx, y - r * (1.15 + (i % 2) * .25));
      ctx.lineTo(sx + r * .25, y - r * .85);
    }
    ctx.lineTo(x + r, y - r * .1);
    ctx.quadraticCurveTo(x, y - r * .5, x - r, y - r * .1);
    ctx.fill();
  } else if (style === 'largo') {
    if (back) {
      ctx.beginPath();
      ctx.moveTo(x - r * 1.05, y - r * .1);
      ctx.quadraticCurveTo(x - r * 1.3, y + r * 1.6, x - r * .7, y + r * 2.4);
      ctx.lineTo(x + r * .7, y + r * 2.4);
      ctx.quadraticCurveTo(x + r * 1.3, y + r * 1.6, x + r * 1.05, y - r * .1);
      ctx.fill();
      return;
    }
    ctx.beginPath();
    ctx.moveTo(x - r * 1.02, y - r * .2);
    ctx.quadraticCurveTo(x - r * 1.15, y - r * 1.25, x, y - r * 1.18);
    ctx.quadraticCurveTo(x + r * 1.15, y - r * 1.25, x + r * 1.02, y - r * .2);
    ctx.quadraticCurveTo(x + r * .8, y - r * .45, x + r * .5, y - r * .35);
    ctx.quadraticCurveTo(x - r * .2, y - r * .75, x - r * .55, y - r * .35);
    ctx.quadraticCurveTo(x - r * .8, y - r * .45, x - r * 1.02, y - r * .2);
    ctx.fill();
  } else if (style === 'trenza') {
    ctx.beginPath();
    ctx.moveTo(x - r * .98, y - r * .2);
    ctx.quadraticCurveTo(x - r * 1.1, y - r * 1.2, x, y - r * 1.15);
    ctx.quadraticCurveTo(x + r * 1.1, y - r * 1.2, x + r * .98, y - r * .2);
    ctx.quadraticCurveTo(x + r * .7, y - r * .5, x + r * .3, y - r * .35);
    ctx.quadraticCurveTo(x - r * .3, y - r * .7, x - r * .6, y - r * .3);
    ctx.fill();
    if (back) {
      ctx.beginPath();
      ctx.ellipse(x - r * 1.08, y + r * .8, r * .24, r * .65, -.2, 0, TAU);
      ctx.ellipse(x - r * 1.2, y + r * 1.35, r * .2, r * .5, -.2, 0, TAU);
      ctx.fill();
    }
  }
}

export function drawHero(ctx, p, time, opts = {}) {
  const scale = opts.scale || 1;
  const app = p.appearance || {};
  const skin = APPEARANCE.skins[app.skin]?.c || '#e2b18c';
  const hair = APPEARANCE.hairs[app.hair]?.c || '#5c3b22';
  const style = APPEARANCE.hairStyles[app.hairStyle] || 'largo';
  const eye = app.eye || '#6c8f8b';
  const pal = armorPalette(p);
  const x = p.x, y = p.y;
  const state = p.state || 'idle';
  const st = p.stateT || 0;
  const walk = p.walkPhase || 0;
  const moving = state === 'walk' || state === 'run';
  const bob = moving ? Math.abs(Math.sin(walk)) * 2.2 : Math.sin(time * 2.2) * .7;
  const fx = Math.cos(p.facing ?? Math.PI / 2);
  const fy = Math.sin(p.facing ?? Math.PI / 2);
  const flip = fx < -0.08 ? -1 : 1;
  const back = fy < -.35;
  const hurt = p.hurtT > 0;
  const C = c => hurt ? '#f2b0a8' : c;

  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale * flip, scale);
  shadow(ctx, 4, 1, 26, 8, .34);

  // capa
  const capeSway = Math.sin(time * 2.4 + walk) * 3 + (moving ? 4 : 0);
  ctx.fillStyle = C(pal.cape || '#792232');
  ctx.beginPath();
  ctx.moveTo(-10, -46 + bob);
  ctx.quadraticCurveTo(-22 - capeSway, -30, -20 - capeSway * .7, -4 + bob * .4);
  ctx.quadraticCurveTo(-6, -12, -2, -40 + bob);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,.06)';
  ctx.beginPath(); ctx.moveTo(-12, -44 + bob); ctx.quadraticCurveTo(-19 - capeSway, -28, -17 - capeSway * .7, -8); ctx.lineTo(-12, -10); ctx.closePath(); ctx.fill();

  // piernas
  const legSwing = moving ? Math.sin(walk) * 7 : Math.sin(time * 1.6) * .8;
  ctx.strokeStyle = C('#2a2420'); ctx.lineWidth = 7; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(-5, -22 + bob); ctx.lineTo(-7 + legSwing * .6, -2); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(5, -22 + bob); ctx.lineTo(7 - legSwing * .6, -2); ctx.stroke();
  ctx.strokeStyle = C('#463a2c'); ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(-7 + legSwing * .6, -5); ctx.lineTo(-10 + legSwing * .8, 0); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(7 - legSwing * .6, -5); ctx.lineTo(10 - legSwing * .8, 0); ctx.stroke();

  // torso
  const bodyY = -48 + bob;
  ctx.fillStyle = C(pal.body);
  rr(ctx, -13, bodyY, 26, 28, 7); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,.07)';
  rr(ctx, -10, bodyY + 3, 8, 20, 4); ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,.25)'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(0, bodyY + 4); ctx.lineTo(0, bodyY + 24); ctx.stroke();
  // cinturón
  ctx.fillStyle = C('#3a2c20'); ctx.fillRect(-14, bodyY + 21, 28, 5);
  ctx.fillStyle = C('#d8b56e'); ctx.fillRect(-3, bodyY + 21, 6, 5);
  // hombreras
  if (pal.plate) {
    ctx.fillStyle = C(pal.shoulder);
    ell(ctx, -14, bodyY + 4, 8, 6); ctx.fill();
    ell(ctx, 14, bodyY + 4, 8, 6); ctx.fill();
    if (pal.plate === 'plate' || pal.plate === 'celestial') {
      ctx.strokeStyle = C(pal.plate === 'celestial' ? '#f4e4ae' : '#a85a3a'); ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(-20, bodyY + 4); ctx.lineTo(-9, bodyY + 8); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(20, bodyY + 4); ctx.lineTo(9, bodyY + 8); ctx.stroke();
    }
  }
  // brazos
  const armSwing = moving ? -Math.sin(walk) * .8 : 0;
  const attack = state === 'attack';
  const prog = clamp(st / (p.attackDuration || .3), 0, 1);
  const sweep = attack ? lerp(-1.2, 1.15, prog) : armSwing;
  const shoulderX = 13, shoulderY = bodyY + 7;
  const armAngle = attack ? p.facing + sweep : -0.3 + armSwing;
  const ax = shoulderX + Math.cos(armAngle) * 15;
  const ay = shoulderY + Math.sin(armAngle) * 15;
  ctx.strokeStyle = C(skin); ctx.lineWidth = 5;
  ctx.beginPath(); ctx.moveTo(-12, bodyY + 7); ctx.lineTo(-16 - armSwing * 5, bodyY + 20); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(shoulderX, shoulderY); ctx.lineTo(ax, ay); ctx.stroke();
  // guante
  ctx.fillStyle = C('#3a2c20'); ell(ctx, ax, ay, 3.5, 3.5); ctx.fill();

  // arma
  drawWeapon(ctx, ax, ay, armAngle, pal, attack ? prog : -1, time);

  // bloqueo
  if (state === 'block') {
    const bx = 22, by = bodyY + 14;
    ctx.save(); ctx.translate(bx, by); ctx.rotate(-.15);
    ctx.fillStyle = C('#5d6674'); ctx.strokeStyle = C('#d8b56e'); ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(0, -18); ctx.quadraticCurveTo(15, -8, 12, 9); ctx.quadraticCurveTo(0, 22, -12, 9); ctx.quadraticCurveTo(-15, -8, 0, -18); ctx.fill(); ctx.stroke();
    ctx.fillStyle = 'rgba(232,195,122,.25)'; ell(ctx, 0, 0, 5, 7); ctx.fill();
    ctx.restore();
  }

  // cabeza
  const headY = bodyY - 12;
  ctx.fillStyle = C(skin); ell(ctx, 0, headY, 10, 11); ctx.fill();
  // cuello
  ctx.fillStyle = C(skin); ctx.fillRect(-4, headY + 8, 8, 5);
  // pelo trasero
  if (!back) hairShape(ctx, 0, headY, 10, style, C(hair), true);
  // ojos
  if (!back) {
    const lookX = flip > 0 ? 2 : -2;
    ctx.fillStyle = C('#f8f4ea');
    ell(ctx, -4 + lookX * .35, headY + 1, 2.6, 2); ctx.fill();
    ell(ctx, 4 + lookX * .35, headY + 1, 2.6, 2); ctx.fill();
    ctx.fillStyle = C(eye);
    ell(ctx, -4 + lookX * .45, headY + 1, 1.5, 1.5); ctx.fill();
    ell(ctx, 4 + lookX * .45, headY + 1, 1.5, 1.5); ctx.fill();
    ctx.fillStyle = C('#2a211d');
    ell(ctx, -4 + lookX * .5, headY + 1, .7, .9); ctx.fill();
    ell(ctx, 4 + lookX * .5, headY + 1, .7, .9); ctx.fill();
    ctx.strokeStyle = C('rgba(70,45,35,.55)'); ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(-6, headY - 3); ctx.lineTo(-2, headY - 4); ctx.moveTo(2, headY - 4); ctx.lineTo(6, headY - 3); ctx.stroke();
    ctx.strokeStyle = C('rgba(90,55,40,.5)');
    ctx.beginPath(); ctx.moveTo(0, headY + 3); ctx.lineTo(-1, headY + 5); ctx.lineTo(1, headY + 5); ctx.stroke();
    ctx.strokeStyle = C('rgba(100,50,50,.6)');
    ctx.beginPath(); ctx.moveTo(-2, headY + 8); ctx.quadraticCurveTo(0, headY + 9, 2, headY + 8); ctx.stroke();
    // pendiente
    if (app.accessory) { ctx.fillStyle = '#e8c37a'; ell(ctx, 9, headY + 6, 1.4, 2.2); ctx.fill(); }
  }
  // pelo delantero
  hairShape(ctx, 0, headY, 10, style, C(hair), false);
  // yelmo / corona
  if (pal.helm === 'yelmo_guardia') {
    ctx.fillStyle = C('#7d8696');
    ctx.beginPath(); ctx.arc(0, headY - 1, 12, Math.PI, TAU); ctx.lineTo(12, headY + 7); ctx.lineTo(5, headY + 2); ctx.lineTo(5, headY + 10); ctx.lineTo(-5, headY + 10); ctx.lineTo(-5, headY + 2); ctx.lineTo(-12, headY + 7); ctx.closePath(); ctx.fill();
    ctx.fillStyle = C('#d8b56e'); ctx.fillRect(-1, headY - 13, 2, 11);
    ctx.fillStyle = '#1a1a1e'; ctx.fillRect(-7, headY + 2, 5, 1.5); ctx.fillRect(2, headY + 2, 5, 1.5);
    glow(ctx, 0, headY, 20, '#d8b56e', .1);
  } else if (pal.helm === 'corona_lunar') {
    ctx.strokeStyle = C('#e8d29a'); ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(0, headY - 9, 9, Math.PI, TAU); ctx.stroke();
    ctx.fillStyle = C('#e8d29a');
    for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(-7 + i * 7, headY - 9); ctx.lineTo(-4 + i * 7, headY - 17 - (i === 1 ? 4 : 0)); ctx.lineTo(-1 + i * 7, headY - 9); ctx.closePath(); ctx.fill(); }
    glow(ctx, 0, headY - 12, 30, '#e8d29a', .18);
  } else if (pal.helm === 'capucha_viajero') {
    ctx.fillStyle = C(pal.cape); ctx.beginPath(); ctx.arc(0, headY - 1, 13, Math.PI * .85, Math.PI * 2.15); ctx.lineTo(13, headY + 8); ctx.lineTo(-13, headY + 8); ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(0,0,0,.25)'; ell(ctx, 0, headY + 8, 12, 4); ctx.fill();
  }

  // destello de daño
  if (hurt) {
    ctx.fillStyle = 'rgba(255,90,80,.18)';
    ell(ctx, 0, bodyY, 22, 34); ctx.fill();
  }
  // escudo de habilidad
  if (p.shield > 0) {
    ctx.strokeStyle = `rgba(150,220,240,${.55 + Math.sin(time * 6) * .15})`; ctx.lineWidth = 2;
    ell(ctx, 0, bodyY, 30, 40); ctx.stroke();
    glow(ctx, 0, bodyY, 50, '#9fdfee', .12);
  }
  ctx.restore();

  // arco de ataque
  if (attack) {
    const a0 = p.facing - 1.15, a1 = p.facing + 1.15;
    const alpha = Math.sin(prog * Math.PI) * .5;
    ctx.save();
    ctx.translate(x, y - 32 * scale);
    ctx.scale(scale, scale);
    ctx.strokeStyle = `rgba(255,240,200,${alpha})`;
    ctx.lineWidth = 5;
    ctx.beginPath(); ctx.arc(0, 0, 48, a0, a1); ctx.stroke();
    ctx.strokeStyle = `rgba(232,195,122,${alpha * .5})`;
    ctx.lineWidth = 12;
    ctx.beginPath(); ctx.arc(0, 0, 44, a0 + .15, a1 - .15); ctx.stroke();
    ctx.restore();
  }
}

function drawWeapon(ctx, x, y, angle, pal, attackProg, time) {
  const len = pal.bladeGlow === '#f2d98e' ? 54 : pal.plate === 'leather' ? 36 : 46;
  const glowC = pal.bladeGlow;
  if (glowC) glow(ctx, x, y, 26, glowC, .28);
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle + .35);
  ctx.strokeStyle = '#3a2a1c'; ctx.lineWidth = 3; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(-6, 0); ctx.lineTo(4, 0); ctx.stroke();
  ctx.strokeStyle = '#c9a05a'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(3, -6); ctx.lineTo(3, 6); ctx.stroke();
  // hoja
  const g = ctx.createLinearGradient(0, 0, len, -2);
  g.addColorStop(0, pal.blade); g.addColorStop(1, '#ffffff');
  ctx.strokeStyle = g; ctx.lineWidth = 3.2;
  ctx.beginPath(); ctx.moveTo(5, 0); ctx.lineTo(len, -2); ctx.stroke();
  ctx.strokeStyle = 'rgba(255,255,255,.55)'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(7, -1); ctx.lineTo(len - 4, -3); ctx.stroke();
  if (glowC) {
    ctx.strokeStyle = rgba(glowC, .5); ctx.lineWidth = 5;
    ctx.beginPath(); ctx.moveTo(6, 0); ctx.lineTo(len, -2); ctx.stroke();
  }
  ctx.restore();
}

// ───────────────────────── enemigos ─────────────────────────
function idPhase(id) {
  let h = 0;
  for (const ch of String(id)) h = (h * 31 + ch.charCodeAt(0)) | 0;
  return (Math.abs(h) % 1000) / 1000 * Math.PI * 2;
}

export function drawEnemy(ctx, e, time) {
  const data = e.data;
  if (!data) return;
  const x = e.x, y = e.y;
  const phase = idPhase(e.id);
  const flash = e.flash > 0;
  const scale = (data.boss ? 1 : 1) * (e.scale || 1);
  const C = c => flash ? '#ffffff' : c;
  const hurt = e.hurtT > 0;
  ctx.save();
  ctx.translate(x, y);
  shadow(ctx, 4, 1, 30 * scale, 9 * scale, .35);
  ctx.scale(scale, scale);
  const flip = Math.cos(e.facing ?? 0) < 0 ? -1 : 1;
  const walk = e.walkPhase || 0;
  const moving = e.state === 'chase' || e.state === 'patrol';
  const bob = moving ? Math.abs(Math.sin(walk)) * 2 : Math.sin(time * 2 + phase) * .8;
  const k = data.kind;

  if (k === 'quadruped') {
    const bodyC = C(data.color), acc = C(data.accent);
    ctx.scale(flip, 1);
    // patas
    const sw = moving ? Math.sin(walk) * 5 : 0;
    ctx.strokeStyle = C('#211c1c'); ctx.lineWidth = 5; ctx.lineCap = 'round';
    for (let i = 0; i < 2; i++) {
      ctx.beginPath(); ctx.moveTo(-14 + i * 22, -16); ctx.lineTo(-17 + i * 22 + sw * (i ? -1 : 1), 0); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-4 + i * 18, -16); ctx.lineTo(-7 + i * 18 - sw * (i ? -1 : 1), 0); ctx.stroke();
    }
    // cuerpo
    ctx.fillStyle = bodyC; ell(ctx, 0, -24 + bob, 27, 15); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.07)'; ell(ctx, -6, -30 + bob, 15, 6); ctx.fill();
    // cola
    ctx.strokeStyle = bodyC; ctx.lineWidth = 6;
    ctx.beginPath(); ctx.moveTo(-24, -26 + bob); ctx.quadraticCurveTo(-42, -34 + Math.sin(time * 4) * 5, -36, -48); ctx.stroke();
    // cabeza
    ctx.fillStyle = bodyC; ell(ctx, 24, -30 + bob, 13, 11); ctx.fill();
    ctx.fillStyle = acc; ell(ctx, 32, -28 + bob, 7, 5); ctx.fill(); // hocico
    // orejas
    ctx.fillStyle = bodyC;
    ctx.beginPath(); ctx.moveTo(16, -40 + bob); ctx.lineTo(12, -54 + bob); ctx.lineTo(23, -42 + bob); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(27, -40 + bob); ctx.lineTo(31, -53 + bob); ctx.lineTo(36, -40 + bob); ctx.closePath(); ctx.fill();
    // ojos
    ctx.fillStyle = C('#ffd36a'); ell(ctx, 26, -32 + bob, 2.2, 2.2); ctx.fill(); ell(ctx, 33, -32 + bob, 1.8, 1.8); ctx.fill();
    if (data.element === 'fuego') { glow(ctx, 0, -22, 30, '#ff6b2e', .18); glow(ctx, -30, -34, 30, '#ff6b2e', .1); }
    if (data.element === 'sombra') glow(ctx, 0, -24, 40, '#a382c4', .1);
  } else if (k === 'humanoid' || k === 'armored' || k === 'duelist') {
    const bodyC = C(data.color), acc = C(data.accent);
    const big = k === 'armored' ? 1.18 : 1;
    ctx.scale(flip * big, big);
    const sw = moving ? Math.sin(walk) * 6 : 0;
    ctx.strokeStyle = C('#211c1c'); ctx.lineWidth = 6;
    ctx.beginPath(); ctx.moveTo(-5, -20); ctx.lineTo(-7 + sw, 0); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(5, -20); ctx.lineTo(7 - sw, 0); ctx.stroke();
    ctx.fillStyle = bodyC; rr(ctx, -14, -48 + bob, 28, 30, 6); ctx.fill();
    ctx.fillStyle = 'rgba(0,0,0,.22)'; ctx.fillRect(-14, -24 + bob, 28, 4);
    // brazos
    const ang = e.state === 'attack' ? e.facing + e.attackSwing : .5;
    ctx.strokeStyle = bodyC; ctx.lineWidth = 6;
    ctx.beginPath(); ctx.moveTo(-12, -42 + bob); ctx.lineTo(-18, -22 + bob); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(12, -42 + bob); ctx.lineTo(12 + Math.cos(ang) * 18, -42 + bob + Math.sin(ang) * 18); ctx.stroke();
    // arma
    if (data.id !== 'bandido' || true) {
      ctx.save(); ctx.translate(12 + Math.cos(ang) * 16, -42 + bob + Math.sin(ang) * 16); ctx.rotate(ang);
      ctx.strokeStyle = acc; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(k === 'armored' ? 34 : 28, 0); ctx.stroke();
      ctx.restore();
    }
    // cabeza
    ctx.fillStyle = C('#d8b08a'); ell(ctx, 0, -58 + bob, 9, 10); ctx.fill();
    if (k === 'armored') {
      ctx.fillStyle = C('#69707c'); ctx.beginPath(); ctx.arc(0, -60 + bob, 11, Math.PI, TAU); ctx.lineTo(11, -52 + bob); ctx.lineTo(4, -55 + bob); ctx.lineTo(4, -50 + bob); ctx.lineTo(-4, -50 + bob); ctx.lineTo(-4, -55 + bob); ctx.lineTo(-11, -52 + bob); ctx.closePath(); ctx.fill();
    } else {
      ctx.fillStyle = C('#2a211d'); ctx.beginPath(); ctx.arc(0, -62 + bob, 9.5, Math.PI, TAU); ctx.fill();
    }
    if (data.id === 'kael') {
      ctx.strokeStyle = 'rgba(120,180,220,.7)'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(0, -36 + bob, 24, 0, TAU); ctx.stroke();
      glow(ctx, 0, -36, 48, '#7da9c9', .18);
    }
  } else if (k === 'spirit') {
    const float = Math.sin(time * 2 + phase) * 4;
    ctx.fillStyle = C(data.color);
    ctx.beginPath(); ctx.moveTo(-16, -60 + float); ctx.quadraticCurveTo(0, -78 + float, 16, -60 + float); ctx.quadraticCurveTo(22, -24 + float, 12, -6 + float); ctx.quadraticCurveTo(0, -16 + float, -12, -6 + float); ctx.quadraticCurveTo(-22, -24 + float, -16, -60 + float); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.14)'; ell(ctx, 0, -48 + float, 9, 14); ctx.fill();
    ctx.fillStyle = C(data.accent);
    ell(ctx, -5, -55 + float, 2.2, 3); ctx.fill(); ell(ctx, 5, -55 + float, 2.2, 3); ctx.fill();
    glow(ctx, 0, -46 + float, 50, data.accent, .25);
    for (let i = 0; i < 3; i++) {
      ctx.strokeStyle = rgba(data.accent, .25);
      ctx.beginPath(); ctx.moveTo(-10 + i * 10, -18 + float); ctx.quadraticCurveTo(-14 + i * 12, -10 + float + Math.sin(time * 3 + i) * 5, -8 + i * 10, -2 + float); ctx.stroke();
    }
  } else if (k === 'imp') {
    const bodyC = C(data.color);
    const fly = Math.sin(time * 5 + phase) * 3;
    ctx.fillStyle = bodyC; ell(ctx, 0, -26 + bob, 16, 18); ctx.fill();
    // alas
    ctx.fillStyle = 'rgba(220,90,40,.4)';
    ctx.beginPath(); ctx.moveTo(-12, -34); ctx.quadraticCurveTo(-34, -52 + fly, -24, -18); ctx.quadraticCurveTo(-16, -26, -12, -34); ctx.fill();
    ctx.beginPath(); ctx.moveTo(12, -34); ctx.quadraticCurveTo(34, -52 - fly, 24, -18); ctx.quadraticCurveTo(16, -26, 12, -34); ctx.fill();
    ctx.fillStyle = C('#f0c090'); ell(ctx, 0, -46 + bob, 9, 8); ctx.fill();
    ctx.strokeStyle = bodyC; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(-6, -52 + bob); ctx.lineTo(-12, -62 + bob); ctx.moveTo(6, -52 + bob); ctx.lineTo(12, -62 + bob); ctx.stroke();
    ctx.fillStyle = '#ffe08a'; ell(ctx, -3, -47 + bob, 1.8, 2); ctx.fill(); ell(ctx, 3, -47 + bob, 1.8, 2); ctx.fill();
    glow(ctx, 0, -30, 40, '#ff7a3a', .2);
  } else if (k === 'winged') {
    const bodyC = C(data.color);
    const fly = Math.sin(time * 2.5 + phase) * 5;
    ctx.fillStyle = 'rgba(230,220,190,.22)';
    ctx.beginPath(); ctx.moveTo(-6, -52); ctx.quadraticCurveTo(-58, -84 + fly, -46, -18); ctx.quadraticCurveTo(-24, -38, -6, -40); ctx.fill();
    ctx.beginPath(); ctx.moveTo(6, -52); ctx.quadraticCurveTo(58, -84 - fly, 46, -18); ctx.quadraticCurveTo(24, -38, 6, -40); ctx.fill();
    ctx.strokeStyle = 'rgba(240,230,200,.35)'; ctx.lineWidth = 1.5;
    for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(10 + i * 8, -48); ctx.lineTo(28 + i * 6, -38 - i * 8); ctx.stroke(); }
    ctx.fillStyle = bodyC; ctx.beginPath(); ctx.moveTo(-12, -30); ctx.lineTo(0, -62 + fly * .3); ctx.lineTo(12, -30); ctx.lineTo(0, -6); ctx.closePath(); ctx.fill();
    ctx.fillStyle = C('#e8d4b0'); ell(ctx, 0, -60 + fly * .3, 7, 7); ctx.fill();
    ctx.strokeStyle = 'rgba(240,220,140,.65)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(0, -68 + fly * .3, 14, 0, TAU); ctx.stroke();
    glow(ctx, 0, -60, 50, '#f4dfa0', .22);
  } else if (k === 'aberration') {
    const pulse = 1 + Math.sin(time * 3 + phase) * .05;
    ctx.fillStyle = C(data.color);
    ctx.beginPath();
    ctx.ellipse(0, -28, 24 * pulse, 30 * pulse, Math.sin(time) * .1, 0, TAU);
    ctx.fill();
    for (let i = 0; i < 7; i++) {
      const a = i / 7 * TAU + time * .2;
      ctx.fillStyle = 'rgba(0,0,0,.4)';
      ell(ctx, Math.cos(a) * 15, -28 + Math.sin(a) * 18, 3, 3); ctx.fill();
      ctx.fillStyle = C(data.accent);
      ell(ctx, Math.cos(a) * 15, -28 + Math.sin(a) * 18, 1.6, 1.6); ctx.fill();
    }
    ctx.fillStyle = '#1a1420';
    ell(ctx, 0, -24, 8, 5 + Math.sin(time * 4) * 2); ctx.fill();
    ctx.strokeStyle = 'rgba(190,140,230,.4)'; ctx.lineWidth = 1;
    for (let i = 0; i < 4; i++) {
      ctx.beginPath(); ctx.moveTo(-18 + i * 12, -4); ctx.quadraticCurveTo(-22 + i * 16, 12 + Math.sin(time + i) * 5, -14 + i * 10, 20); ctx.stroke();
    }
    glow(ctx, 0, -28, 55, data.accent, .18);
  } else if (k === 'stag') {
    drawStagBoss(ctx, e, time, C);
  } else if (k === 'king') {
    drawKingBoss(ctx, e, time, C);
  } else if (k === 'veil') {
    drawVeilBoss(ctx, e, time, C);
  } else {
    ctx.fillStyle = C(data.color); ell(ctx, 0, -30, 20, 24); ctx.fill();
  }

  if (hurt) {
    ctx.fillStyle = 'rgba(255,255,255,.14)';
    ctx.beginPath(); ctx.arc(0, -30, 26, 0, TAU); ctx.fill();
  }
  ctx.restore();

  // barra de vida
  if (!data.boss && e.hp < e.maxHp) {
    const w = 44, hp = clamp(e.hp / e.maxHp, 0, 1);
    ctx.fillStyle = 'rgba(5,7,12,.7)'; ctx.fillRect(x - w / 2, y - 74, w, 4);
    ctx.fillStyle = hurt ? '#ffd0c0' : '#b8463f'; ctx.fillRect(x - w / 2, y - 74, w * hp, 4);
  }
  if (e.marked > 0) {
    ctx.strokeStyle = 'rgba(232,195,122,.7)'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(x, y - 14, 30, 0, TAU); ctx.stroke();
  }
}

function drawStagBoss(ctx, e, time, C) {
  const C1 = data => data;
  const bodyC = C(e.data.color), acc = C(e.data.accent);
  const bob = Math.sin(time * 1.8) * 2;
  // aura
  glow(ctx, 0, -40, 90, e.data.accent, .12 + Math.sin(time * 2) * .03);
  // patas
  ctx.strokeStyle = '#1b1d24'; ctx.lineWidth = 6; ctx.lineCap = 'round';
  for (let i = 0; i < 2; i++) {
    ctx.beginPath(); ctx.moveTo(-20 + i * 34, -34); ctx.lineTo(-26 + i * 34 + Math.sin(time * 2 + i) * 3, 0); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-8 + i * 26, -34); ctx.lineTo(-6 + i * 26, 0); ctx.stroke();
  }
  // cuerpo
  ctx.fillStyle = bodyC; ell(ctx, 0, -48 + bob, 44, 28); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,.05)'; ell(ctx, -8, -58 + bob, 26, 10); ctx.fill();
  // cuello/cabeza
  ctx.fillStyle = bodyC;
  ctx.beginPath(); ctx.moveTo(22, -58 + bob); ctx.quadraticCurveTo(48, -92 + bob, 54, -112 + bob); ctx.lineTo(72, -108 + bob); ctx.quadraticCurveTo(56, -80 + bob, 50, -52 + bob); ctx.closePath(); ctx.fill();
  ctx.fillStyle = C('#2c2530'); ell(ctx, 64, -110 + bob, 16, 10, -.4); ctx.fill();
  ctx.fillStyle = acc; ell(ctx, 75, -108 + bob, 4, 3); ctx.fill();
  ctx.fillStyle = '#ffd26a'; ell(ctx, 66, -114 + bob, 2.5, 2.5); ctx.fill();
  // astas
  ctx.strokeStyle = acc; ctx.lineWidth = 4; ctx.lineCap = 'round';
  for (let s = -1; s <= 1; s += 2) {
    ctx.beginPath(); ctx.moveTo(58, -118 + bob); ctx.quadraticCurveTo(58 + s * 18, -158 + bob, 48 + s * 30, -186 + bob); ctx.stroke();
    for (let i = 0; i < 3; i++) {
      ctx.beginPath(); ctx.moveTo(55 + s * (10 + i * 5), -144 - i * 12 + bob); ctx.lineTo(58 + s * (24 + i * 6), -154 - i * 16 + bob); ctx.stroke();
    }
  }
  // runas
  ctx.strokeStyle = rgba(e.data.accent, .6); ctx.lineWidth = 1.5;
  for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(-10 + i * 12, -50 + bob, 4, 0, TAU); ctx.stroke(); }
  // niebla
  for (let i = 0; i < 5; i++) {
    ctx.fillStyle = `rgba(160,140,190,${.05 + Math.sin(time + i) * .02})`;
    ell(ctx, -40 + i * 22, -8 + Math.sin(time * .8 + i) * 3, 28, 7); ctx.fill();
  }
}

function drawKingBoss(ctx, e, time, C) {
  const bodyC = C(e.data.color), acc = C(e.data.accent);
  const bob = Math.sin(time * 1.6) * 1.5;
  glow(ctx, 0, -50, 100, '#ff6b2e', .16);
  // piernas
  ctx.strokeStyle = '#251b18'; ctx.lineWidth = 9;
  ctx.beginPath(); ctx.moveTo(-14, -32); ctx.lineTo(-20, 0); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(14, -32); ctx.lineTo(20, 0); ctx.stroke();
  // torso enorme
  ctx.fillStyle = bodyC; rr(ctx, -34, -92 + bob, 68, 62, 14); ctx.fill();
  ctx.fillStyle = '#5a3a2c'; rr(ctx, -26, -84 + bob, 52, 46, 8); ctx.fill();
  ctx.strokeStyle = acc; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(-20, -80 + bob); ctx.lineTo(20, -62 + bob); ctx.moveTo(-20, -62 + bob); ctx.lineTo(20, -80 + bob); ctx.stroke();
  // hombreras
  ctx.fillStyle = '#3a2b27'; ell(ctx, -36, -86 + bob, 17, 12); ctx.fill(); ell(ctx, 36, -86 + bob, 17, 12); ctx.fill();
  // brazos
  ctx.strokeStyle = bodyC; ctx.lineWidth = 10;
  ctx.beginPath(); ctx.moveTo(-34, -80 + bob); ctx.lineTo(-52, -46 + bob); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(34, -80 + bob); ctx.lineTo(54, -52 + bob); ctx.stroke();
  // espada ardiente
  const ang = e.state === 'attack' ? e.facing + e.attackSwing : .4;
  ctx.save(); ctx.translate(54, -52 + bob); ctx.rotate(ang);
  glow(ctx, 20, 0, 30, '#ff8a3a', .5);
  ctx.strokeStyle = '#ffcf8a'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(62, 0); ctx.stroke();
  ctx.strokeStyle = 'rgba(255,110,40,.7)'; ctx.lineWidth = 10; ctx.beginPath(); ctx.moveTo(10, 0); ctx.lineTo(60, 0); ctx.stroke();
  ctx.restore();
  // cabeza con corona
  ctx.fillStyle = C('#b08060'); ell(ctx, 0, -108 + bob, 15, 16); ctx.fill();
  ctx.fillStyle = '#2a211d'; ctx.beginPath(); ctx.arc(0, -114 + bob, 15, Math.PI, TAU); ctx.fill();
  ctx.fillStyle = acc;
  for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(-16 + i * 10, -120 + bob); ctx.lineTo(-12 + i * 10, -136 - (i % 2) * 6 + bob); ctx.lineTo(-6 + i * 10, -120 + bob); ctx.closePath(); ctx.fill(); }
  ctx.fillStyle = '#ffd26a'; ell(ctx, -5, -110 + bob, 2, 2); ctx.fill(); ell(ctx, 5, -110 + bob, 2, 2); ctx.fill();
  // jirones de humo
  for (let i = 0; i < 4; i++) { ctx.fillStyle = `rgba(80,60,60,${.08 - i * .015})`; ell(ctx, -20 + i * 14 + Math.sin(time + i) * 4, -140 - i * 10 + bob, 20, 8); ctx.fill(); }
}

function drawVeilBoss(ctx, e, time, C) {
  const bob = Math.sin(time * 1.5) * 3;
  glow(ctx, 0, -60, 120, '#c29bf0', .17);
  // alas de vacío
  ctx.fillStyle = 'rgba(30,24,48,.8)';
  for (let s = -1; s <= 1; s += 2) {
    ctx.beginPath();
    ctx.moveTo(s * 14, -70 + bob);
    ctx.quadraticCurveTo(s * 80, -130 + bob, s * 92, -60 + bob);
    ctx.quadraticCurveTo(s * 60, -76 + bob, s * 40, -34 + bob);
    ctx.quadraticCurveTo(s * 24, -54 + bob, s * 14, -70 + bob);
    ctx.fill();
    ctx.strokeStyle = 'rgba(200,160,255,.3)'; ctx.lineWidth = 1; ctx.stroke();
  }
  // cuerpo alto
  const g = ctx.createLinearGradient(0, -110, 0, 0);
  g.addColorStop(0, '#4d3f6b'); g.addColorStop(1, '#191724');
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.moveTo(-16, -100 + bob); ctx.lineTo(16, -100 + bob); ctx.lineTo(28, 0); ctx.lineTo(0, -18); ctx.lineTo(-28, 0); ctx.closePath(); ctx.fill();
  // grietas
  ctx.strokeStyle = 'rgba(230,200,255,.55)'; ctx.lineWidth = 1.5;
  for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(-10 + i * 10, -88 + bob); ctx.lineTo(-4 + i * 8, -50 + bob); ctx.lineTo(-10 + i * 9, -20); ctx.stroke(); }
  // brazos
  ctx.strokeStyle = '#2a2438'; ctx.lineWidth = 7;
  ctx.beginPath(); ctx.moveTo(-14, -88 + bob); ctx.lineTo(-42, -52 + bob); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(14, -88 + bob); ctx.lineTo(42, -64 + bob + Math.sin(time * 2) * 3); ctx.stroke();
  // máscara
  ctx.fillStyle = '#e8dcf5';
  ctx.beginPath(); ctx.ellipse(0, -112 + bob, 14, 18, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = '#1a1622';
  ctx.beginPath(); ctx.ellipse(-6, -114 + bob, 4, 7, -.2, 0, TAU); ctx.fill();
  ctx.beginPath(); ctx.ellipse(6, -114 + bob, 4, 7, .2, 0, TAU); ctx.fill();
  ctx.fillStyle = '#d7b3ff'; ell(ctx, -6, -114 + bob, 1.6, 2.4); ctx.fill(); ell(ctx, 6, -114 + bob, 1.6, 2.4); ctx.fill();
  // corona de fragmentos
  for (let i = 0; i < 5; i++) {
    const a = -Math.PI / 2 + (i - 2) * .35;
    ctx.save(); ctx.translate(Math.cos(a) * 28, -128 + bob + Math.sin(a) * 16); ctx.rotate(a);
    ctx.fillStyle = 'rgba(220,190,255,.75)';
    ctx.beginPath(); ctx.moveTo(0, -14); ctx.lineTo(5, 0); ctx.lineTo(-5, 0); ctx.closePath(); ctx.fill();
    ctx.restore();
  }
  // espejos flotantes
  for (let i = 0; i < 4; i++) {
    const a = time * .5 + i / 4 * TAU;
    const mx = Math.cos(a) * 62, my = -70 + Math.sin(a) * 30 + bob;
    ctx.save(); ctx.translate(mx, my); ctx.rotate(a);
    ctx.fillStyle = 'rgba(190,220,240,.25)'; ctx.strokeStyle = 'rgba(230,240,255,.5)'; ctx.lineWidth = 1;
    ctx.fillRect(-9, -14, 18, 28); ctx.strokeRect(-9, -14, 18, 28);
    ctx.restore();
  }
}

// ───────────────────────── criaturas ─────────────────────────
export function drawCreature(ctx, species, x, y, scale, time, opts = {}) {
  const c = CREATURES[species] || species;
  if (!c) return;
  const t = time;
  const flip = opts.flip ?? (opts.facing !== undefined ? (Math.cos(opts.facing) < 0 ? -1 : 1) : 1);
  const float = Math.sin(t * 2 + (opts.seed || 0)) * 2;
  const C = col => opts.flash ? '#fff' : col;
  ctx.save();
  ctx.translate(x, y);
  if (opts.alpha !== undefined) ctx.globalAlpha = opts.alpha;
  shadow(ctx, 2, 1, 18 * scale, 6 * scale, .25);
  ctx.scale(flip * scale, scale);
  switch (c.draw) {
    case 'fox': {
      const body = C(c.color), acc = C(c.accent);
      ctx.strokeStyle = body; ctx.lineWidth = 5; ctx.lineCap = 'round';
      // patas
      ctx.beginPath(); ctx.moveTo(-8, -14); ctx.lineTo(-10, 0); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(6, -14); ctx.lineTo(8, 0); ctx.stroke();
      // cola enorme
      ctx.fillStyle = acc;
      ctx.beginPath(); ctx.moveTo(-12, -22 + float); ctx.quadraticCurveTo(-44, -32 + float, -38, -54 + float); ctx.quadraticCurveTo(-24, -50 + float, -12, -30 + float); ctx.closePath(); ctx.fill();
      ctx.fillStyle = body; ell(ctx, 0, -20 + float, 18, 12); ctx.fill();
      ctx.fillStyle = acc; ell(ctx, 10, -24 + float, 10, 8); ctx.fill();
      // orejas
      ctx.fillStyle = body;
      ctx.beginPath(); ctx.moveTo(-2, -32 + float); ctx.lineTo(0, -46 + float); ctx.lineTo(7, -33 + float); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.moveTo(11, -32 + float); ctx.lineTo(17, -45 + float); ctx.lineTo(18, -30 + float); ctx.closePath(); ctx.fill();
      // ojos
      ctx.fillStyle = C(c.eye); ell(ctx, 10, -25 + float, 1.8, 2.2); ctx.fill(); ell(ctx, 16, -24 + float, 1.5, 1.8); ctx.fill();
      // marcas
      ctx.strokeStyle = rgba('#ffffff', .35); ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(2, -29 + float); ctx.lineTo(8, -27 + float); ctx.stroke();
      glow(ctx, 0, -24, 30, c.accent, .16);
      break;
    }
    case 'boar': {
      const body = C(c.color), acc = C(c.accent);
      ctx.strokeStyle = '#3a2c22'; ctx.lineWidth = 5;
      for (let i = 0; i < 2; i++) { ctx.beginPath(); ctx.moveTo(-10 + i * 18, -12); ctx.lineTo(-13 + i * 18, 0); ctx.stroke(); }
      ctx.fillStyle = body; ell(ctx, 0, -20 + float * .4, 22, 14); ctx.fill();
      ctx.fillStyle = acc; ctx.beginPath(); ctx.ellipse(14, -22, 9, 7, 0, 0, TAU); ctx.fill();
      // hojas
      for (let i = 0; i < 3; i++) { ctx.fillStyle = i % 2 ? '#7d9a52' : '#5e7a3e'; ell(ctx, -8 + i * 8, -31, 5, 3); ctx.fill(); }
      ctx.strokeStyle = '#e8d9ae'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(20, -24); ctx.quadraticCurveTo(26, -26, 28, -32); ctx.stroke();
      ctx.fillStyle = '#ffd36a'; ell(ctx, 16, -25, 1.6, 1.6); ctx.fill();
      break;
    }
    case 'griffin': {
      const body = C(c.color), acc = C(c.accent);
      const wing = Math.sin(t * 8 + float) * 8;
      ctx.fillStyle = 'rgba(220,230,190,.75)';
      ctx.beginPath(); ctx.moveTo(-6, -34); ctx.quadraticCurveTo(-46, -64 - wing, -38, -20); ctx.quadraticCurveTo(-20, -34, -6, -34); ctx.fill();
      ctx.fillStyle = 'rgba(220,230,190,.55)';
      ctx.beginPath(); ctx.moveTo(6, -34); ctx.quadraticCurveTo(44, -64 + wing, 38, -20); ctx.quadraticCurveTo(20, -34, 6, -34); ctx.fill();
      ctx.fillStyle = body; ell(ctx, 0, -18, 17, 11); ctx.fill();
      ctx.fillStyle = acc; ell(ctx, 14, -28, 8, 7); ctx.fill();
      ctx.fillStyle = '#d8b56e'; ctx.beginPath(); ctx.moveTo(22, -27); ctx.lineTo(31, -24); ctx.lineTo(22, -22); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#2a211d'; ell(ctx, 15, -31, 1.4, 1.4); ctx.fill();
      ctx.strokeStyle = body; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(-10, -8); ctx.lineTo(-12, 0); ctx.moveTo(8, -8); ctx.lineTo(10, 0); ctx.stroke();
      glow(ctx, 0, -24, 30, c.accent, .12);
      break;
    }
    case 'salamander': {
      const body = C(c.color), acc = C(c.accent);
      ctx.strokeStyle = body; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.moveTo(-14, -10); ctx.lineTo(-24, -4 + Math.sin(t * 3) * 3); ctx.lineTo(-30, -14 + Math.sin(t * 2) * 4); ctx.stroke();
      ctx.fillStyle = body;
      ctx.beginPath(); ctx.ellipse(0, -14, 20, 9, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = acc; ell(ctx, 14, -18, 8, 6); ctx.fill();
      ctx.fillStyle = '#1d1a1a'; ell(ctx, 17, -20, 1.5, 1.5); ctx.fill();
      // patas
      ctx.strokeStyle = body; ctx.lineWidth = 3;
      for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(-8 + i * 10, -10); ctx.lineTo(-10 + i * 12, 0); ctx.stroke(); }
      // fuego
      glow(ctx, -26, -12, 24, '#ff8a3a', .3);
      flame(ctx, -26, -12, t, .4, '#ff9a4a');
      break;
    }
    case 'crow': {
      const body = C(c.color), acc = C(c.accent);
      const wing = Math.sin(t * 9) * 10;
      ctx.fillStyle = body;
      ctx.beginPath(); ctx.moveTo(-4, -22 + float); ctx.quadraticCurveTo(-36, -48 - wing, -30, -10 + float); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.moveTo(4, -22 + float); ctx.quadraticCurveTo(36, -48 + wing, 30, -10 + float); ctx.closePath(); ctx.fill();
      ctx.fillStyle = body; ell(ctx, 0, -20 + float, 13, 10); ctx.fill();
      ctx.fillStyle = acc; ell(ctx, 10, -28 + float, 6, 5); ctx.fill();
      ctx.fillStyle = '#d8b56e'; ctx.beginPath(); ctx.moveTo(15, -28 + float); ctx.lineTo(23, -26 + float); ctx.lineTo(15, -24 + float); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#ffe08a'; ell(ctx, 11, -30 + float, 1.3, 1.3); ctx.fill();
      glow(ctx, 0, -22, 30, '#b99bd6', .15);
      break;
    }
    case 'turtle': {
      const body = C(c.color), acc = C(c.accent);
      ctx.fillStyle = body; ell(ctx, 0, -16, 22, 13); ctx.fill();
      ctx.fillStyle = '#3a2a24'; ell(ctx, 0, -18, 23, 12); ctx.fill();
      ctx.strokeStyle = acc; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.ellipse(0, -18, 16, 8, 0, 0, TAU); ctx.stroke();
      for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(-10 + i * 10, -25); ctx.lineTo(-10 + i * 10, -11); ctx.stroke(); }
      ctx.fillStyle = body; ell(ctx, 22, -14, 7, 6); ctx.fill();
      ctx.fillStyle = '#ffd36a'; ell(ctx, 25, -15, 1.4, 1.4); ctx.fill();
      glow(ctx, 0, -18, 26, '#e27b3e', .12);
      break;
    }
    case 'moth': {
      const wing = Math.sin(t * 6) * .25;
      ctx.save(); ctx.translate(0, -34 + float);
      ctx.fillStyle = rgba(c.color, .85);
      ctx.save(); ctx.rotate(-.5 - wing); ctx.beginPath(); ctx.ellipse(-18, 0, 20, 10, -.5, 0, TAU); ctx.fill(); ctx.restore();
      ctx.save(); ctx.rotate(.5 + wing); ctx.beginPath(); ctx.ellipse(18, 0, 20, 10, .5, 0, TAU); ctx.fill(); ctx.restore();
      ctx.fillStyle = rgba(c.accent, .55);
      ctx.save(); ctx.rotate(-.5 - wing); ell(ctx, -18, 0, 10, 5); ctx.fill(); ctx.restore();
      ctx.save(); ctx.rotate(.5 + wing); ell(ctx, 18, 0, 10, 5); ctx.fill(); ctx.restore();
      ctx.fillStyle = c.color; ell(ctx, 0, 2, 5, 13); ctx.fill();
      ctx.strokeStyle = c.accent; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(-2, -10); ctx.quadraticCurveTo(-10, -22, -16, -20); ctx.moveTo(2, -10); ctx.quadraticCurveTo(10, -22, 16, -20); ctx.stroke();
      glow(ctx, 0, 0, 40, c.accent, .18);
      ctx.restore();
      break;
    }
    case 'golem': {
      const body = C(c.color), acc = C(c.accent);
      const parts = [[-16, -20, 8], [0, -34, 10], [16, -22, 7], [-4, -10, 6]];
      for (const [px, py, s] of parts) {
        ctx.fillStyle = body; ctx.save(); ctx.translate(px, py + float * .4); ctx.rotate(t * .4 + px); ctx.fillRect(-s, -s, s * 2, s * 2); ctx.restore();
        glow(ctx, px, py, 14, acc, .12);
      }
      ctx.fillStyle = acc; ell(ctx, 0, -32 + float * .4, 2.5, 2.5); ctx.fill();
      break;
    }
  }
  ctx.restore();
}

// ───────────────────────── NPCs ─────────────────────────
export function drawNPC(ctx, npc, time) {
  const look = lookFor(npc.look);
  const x = npc.x, y = npc.y;
  const bob = Math.sin(time * 1.6 + x * .01) * 1;
  const C = col => col;
  ctx.save();
  ctx.translate(x, y);
  if (look.ghost) ctx.globalAlpha = .55 + Math.sin(time * 2 + x) * .1;
  shadow(ctx, 2, 1, 20, 6, .25);
  // capa
  ctx.fillStyle = C(look.cape);
  ctx.beginPath(); ctx.moveTo(-9, -44 + bob); ctx.quadraticCurveTo(-18, -24, -14, -4); ctx.lineTo(2, -10); ctx.lineTo(4, -42 + bob); ctx.closePath(); ctx.fill();
  // piernas
  ctx.strokeStyle = '#2a2420'; ctx.lineWidth = 6; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(-4, -22); ctx.lineTo(-6, -1); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(4, -22); ctx.lineTo(7, -1); ctx.stroke();
  // torso
  ctx.fillStyle = C(look.outfit); rr(ctx, -11, -48 + bob, 22, 28, 6); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,.07)'; rr(ctx, -8, -45 + bob, 6, 20, 3); ctx.fill();
  ctx.fillStyle = C('#3a2c20'); ctx.fillRect(-12, -27 + bob, 24, 4);
  // brazos
  ctx.strokeStyle = C(look.skin); ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(-10, -43 + bob); ctx.lineTo(-14, -24 + bob); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(10, -43 + bob); ctx.lineTo(14, -24 + bob); ctx.stroke();
  // cabeza
  const hy = -58 + bob;
  ctx.fillStyle = C(look.skin); ell(ctx, 0, hy, 9, 10); ctx.fill();
  if (!look.young) hairShape(ctx, 0, hy, 9, look.hairStyle, C(look.hair), true);
  // ojos
  ctx.fillStyle = C(look.eye); ell(ctx, -3, hy + 1, 1.5, 1.5); ctx.fill(); ell(ctx, 3, hy + 1, 1.5, 1.5); ctx.fill();
  ctx.strokeStyle = 'rgba(70,45,35,.5)'; ctx.lineWidth = .8;
  ctx.beginPath(); ctx.moveTo(-5, hy - 2); ctx.lineTo(-2, hy - 2.5); ctx.moveTo(2, hy - 2.5); ctx.lineTo(5, hy - 2); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-2, hy + 6); ctx.quadraticCurveTo(0, hy + 7, 2, hy + 6); ctx.stroke();
  hairShape(ctx, 0, hy, 9, look.hairStyle, C(look.hair), false);
  // accesorios
  if (look.acc === 'circlet') {
    ctx.strokeStyle = '#e8c37a'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(0, hy - 7, 8, Math.PI, TAU); ctx.stroke();
    ctx.fillStyle = '#9dd6e8'; ell(ctx, 0, hy - 8, 2, 2.5); ctx.fill();
    glow(ctx, 0, hy - 8, 22, '#9dd6e8', .15);
  } else if (look.acc === 'hood') {
    ctx.fillStyle = C(look.cape); ctx.beginPath(); ctx.arc(0, hy - 1, 11, Math.PI * .8, Math.PI * 2.2); ctx.lineTo(11, hy + 6); ctx.lineTo(-11, hy + 6); ctx.closePath(); ctx.fill();
  } else if (look.acc === 'hat') {
    ctx.fillStyle = C('#4a3a2a'); ell(ctx, 0, hy - 9, 17, 4); ctx.fill();
    ctx.fillRect(-8, hy - 22, 16, 14);
    ctx.fillStyle = '#8a6a2e'; ctx.fillRect(-8, hy - 12, 16, 2);
  } else if (look.acc === 'beard') {
    ctx.fillStyle = C(look.beard || '#c9c4b2');
    ctx.beginPath(); ctx.moveTo(-6, hy + 6); ctx.quadraticCurveTo(0, hy + 22, 6, hy + 6); ctx.quadraticCurveTo(0, hy + 10, -6, hy + 6); ctx.fill();
  } else if (look.acc === 'crown') {
    ctx.fillStyle = '#e8c37a';
    for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(-8 + i * 8, hy - 8); ctx.lineTo(-5 + i * 8, hy - 16); ctx.lineTo(-2 + i * 8, hy - 8); ctx.closePath(); ctx.fill(); }
    glow(ctx, 0, hy - 10, 26, '#e8c37a', .15);
  } else if (look.acc === 'goggles') {
    ctx.strokeStyle = '#7d5a37'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(-3.5, hy - 1, 4, 0, TAU); ctx.stroke();
    ctx.beginPath(); ctx.arc(3.5, hy - 1, 4, 0, TAU); ctx.stroke();
    ctx.fillStyle = rgba('#9dd6e8', .3); ell(ctx, -3.5, hy - 1, 3, 3); ctx.fill(); ell(ctx, 3.5, hy - 1, 3, 3); ctx.fill();
  } else if (look.acc === 'scar') {
    ctx.strokeStyle = 'rgba(140,70,60,.7)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(6, hy - 5); ctx.lineTo(8, hy + 4); ctx.stroke();
  }
  if (look.elder) { ctx.strokeStyle = 'rgba(230,225,215,.3)'; ctx.lineWidth = .8; ctx.beginPath(); ctx.moveTo(-4, hy + 4); ctx.lineTo(-6, hy + 5); ctx.stroke(); }
  if (look.ghost) glow(ctx, 0, -34, 46, '#9dd6e8', .12);
  // marcador de misión
  if (npc.marker && !npc.markerDone) {
    const my = -92 + Math.sin(time * 2.5) * 4;
    ctx.fillStyle = '#e8c37a';
    ctx.beginPath(); ctx.moveTo(0, my); ctx.lineTo(6, my - 10); ctx.lineTo(0, my - 20); ctx.lineTo(-6, my - 10); ctx.closePath(); ctx.fill();
    glow(ctx, 0, my - 10, 24, '#e8c37a', .3);
  }
  ctx.restore();
}

// ───────────────────────── retratos ─────────────────────────
export function drawPortrait(canvas, id, appearance, classId) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  ctx.clearRect(0, 0, W, H);
  const look = lookFor(id, appearance);
  const skin = look.skin, hair = look.hair;
  // fondo
  const bg = ctx.createRadialGradient(W * .5, H * .32, 4, W * .5, H * .45, W * .95);
  bg.addColorStop(0, look.ghost ? '#243a42' : '#2a3550');
  bg.addColorStop(.6, '#111827');
  bg.addColorStop(1, '#070a11');
  ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
  // rayos
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  const rg = ctx.createLinearGradient(W * .5, 0, W * .5, H);
  rg.addColorStop(0, rgba(look.eye, .12)); rg.addColorStop(1, rgba(look.eye, 0));
  ctx.fillStyle = rg;
  ctx.beginPath(); ctx.moveTo(W * .32, 0); ctx.lineTo(W * .48, 0); ctx.lineTo(W * .7, H); ctx.lineTo(W * .3, H); ctx.closePath(); ctx.fill();
  ctx.restore();
  const cx = W * .5, cy = H * .42, r = W * .25;
  // hombros
  const shY = cy + r * 1.35;
  ctx.fillStyle = look.outfit;
  ctx.beginPath();
  ctx.moveTo(cx - r * 2.4, H);
  ctx.quadraticCurveTo(cx - r * 1.9, shY, cx - r * .8, shY - r * .2);
  ctx.quadraticCurveTo(cx, shY - r * .45, cx + r * .8, shY - r * .2);
  ctx.quadraticCurveTo(cx + r * 1.9, shY, cx + r * 2.4, H);
  ctx.closePath(); ctx.fill();
  // capa
  ctx.fillStyle = look.cape;
  ctx.beginPath(); ctx.moveTo(cx - r * 2.2, H); ctx.quadraticCurveTo(cx - r * 1.6, shY + r * .2, cx - r * .9, shY + r * .35); ctx.lineTo(cx - r * 1.5, H); ctx.closePath(); ctx.fill();
  // cuello
  ctx.fillStyle = mixHex(skin, '#5c3a28', .18);
  ctx.fillRect(cx - r * .26, cy + r * .65, r * .52, r * .7);
  // cabeza
  const headG = ctx.createRadialGradient(cx - r * .25, cy - r * .2, r * .1, cx, cy, r * 1.2);
  headG.addColorStop(0, skin); headG.addColorStop(1, mixHex(skin, '#6b4433', .22));
  ctx.fillStyle = headG;
  ctx.beginPath(); ctx.ellipse(cx, cy, r * .78, r * .95, 0, 0, TAU); ctx.fill();
  // orejas
  ctx.fillStyle = mixHex(skin, '#6b4433', .12);
  ell(ctx, cx - r * .76, cy + r * .05, r * .12, r * .2); ctx.fill();
  ell(ctx, cx + r * .76, cy + r * .05, r * .12, r * .2); ctx.fill();
  // pelo trasero
  ctx.fillStyle = hair;
  if (look.hairStyle === 'largo' || look.hairStyle === 'trenza') {
    ctx.beginPath();
    ctx.moveTo(cx - r * .9, cy - r * .5);
    ctx.quadraticCurveTo(cx - r * 1.25, cy + r * .9, cx - r * 1.1, H * .86);
    ctx.lineTo(cx - r * .55, H * .9); ctx.quadraticCurveTo(cx - r * .95, cy + r * .4, cx - r * .7, cy - r * .3); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(cx + r * .9, cy - r * .5);
    ctx.quadraticCurveTo(cx + r * 1.25, cy + r * .9, cx + r * 1.1, H * .86);
    ctx.lineTo(cx + r * .55, H * .9); ctx.quadraticCurveTo(cx + r * .95, cy + r * .4, cx + r * .7, cy - r * .3); ctx.fill();
  }
  // sombra del pelo en la frente
  ctx.fillStyle = 'rgba(0,0,0,.14)';
  ell(ctx, cx, cy - r * .55, r * .65, r * .3); ctx.fill();
  // ojos
  const eyeY = cy + r * .02;
  const eyeDX = r * .28;
  ctx.fillStyle = '#f6f0e4';
  ell(ctx, cx - eyeDX, eyeY, r * .18, r * .1); ctx.fill();
  ell(ctx, cx + eyeDX, eyeY, r * .18, r * .1); ctx.fill();
  const iris = look.eye;
  ctx.fillStyle = iris;
  ell(ctx, cx - eyeDX, eyeY, r * .1, r * .095); ctx.fill();
  ell(ctx, cx + eyeDX, eyeY, r * .1, r * .095); ctx.fill();
  ctx.fillStyle = '#1a1412';
  ell(ctx, cx - eyeDX, eyeY, r * .045, r * .075); ctx.fill();
  ell(ctx, cx + eyeDX, eyeY, r * .045, r * .075); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,.85)';
  ell(ctx, cx - eyeDX - r * .03, eyeY - r * .035, r * .025, r * .025); ctx.fill();
  ell(ctx, cx + eyeDX - r * .03, eyeY - r * .035, r * .025, r * .025); ctx.fill();
  // cejas
  ctx.strokeStyle = mixHex(hair, '#000000', .15); ctx.lineWidth = Math.max(1, r * .045);
  ctx.beginPath(); ctx.moveTo(cx - eyeDX - r * .15, eyeY - r * .19); ctx.quadraticCurveTo(cx - eyeDX, eyeY - r * .24, cx - eyeDX + r * .14, eyeY - r * .19); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx + eyeDX - r * .14, eyeY - r * .19); ctx.quadraticCurveTo(cx + eyeDX, eyeY - r * .24, cx + eyeDX + r * .15, eyeY - r * .19); ctx.stroke();
  // nariz
  ctx.strokeStyle = 'rgba(90,50,38,.35)'; ctx.lineWidth = Math.max(1, r * .025);
  ctx.beginPath(); ctx.moveTo(cx, eyeY + r * .07); ctx.lineTo(cx - r * .05, eyeY + r * .28); ctx.lineTo(cx + r * .03, eyeY + r * .29); ctx.stroke();
  // boca
  ctx.strokeStyle = look.elder ? 'rgba(90,45,45,.55)' : 'rgba(130,60,65,.6)'; ctx.lineWidth = Math.max(1.2, r * .035);
  ctx.beginPath(); ctx.moveTo(cx - r * .14, eyeY + r * .48); ctx.quadraticCurveTo(cx, eyeY + r * .53, cx + r * .14, eyeY + r * .47); ctx.stroke();
  // pelo delantero
  ctx.fillStyle = hair;
  switch (look.hairStyle) {
    case 'largo':
      ctx.beginPath();
      ctx.moveTo(cx - r * .85, cy - r * .1);
      ctx.quadraticCurveTo(cx - r * .95, cy - r * 1.12, cx, cy - r * 1.02);
      ctx.quadraticCurveTo(cx + r * .95, cy - r * 1.12, cx + r * .85, cy - r * .1);
      ctx.quadraticCurveTo(cx + r * .62, cy - r * .45, cx + r * .36, cy - r * .32);
      ctx.quadraticCurveTo(cx - r * .2, cy - r * .7, cx - r * .55, cy - r * .32);
      ctx.quadraticCurveTo(cx - r * .68, cy - r * .42, cx - r * .85, cy - r * .1);
      ctx.fill(); break;
    case 'corto':
      ctx.beginPath(); ctx.moveTo(cx - r * .82, cy - r * .2); ctx.quadraticCurveTo(cx - r * .9, cy - r * 1.1, cx, cy - r * 1.02); ctx.quadraticCurveTo(cx + r * .9, cy - r * 1.1, cx + r * .82, cy - r * .2); ctx.quadraticCurveTo(cx + r * .4, cy - r * .5, cx + r * .05, cy - r * .4); ctx.quadraticCurveTo(cx - r * .45, cy - r * .55, cx - r * .82, cy - r * .2); ctx.fill(); break;
    case 'trenza':
      ctx.beginPath(); ctx.moveTo(cx - r * .82, cy - r * .16); ctx.quadraticCurveTo(cx - r * .9, cy - r * 1.1, cx, cy - r * 1.02); ctx.quadraticCurveTo(cx + r * .9, cy - r * 1.1, cx + r * .82, cy - r * .16); ctx.quadraticCurveTo(cx + r * .5, cy - r * .48, cx + r * .15, cy - r * .38); ctx.quadraticCurveTo(cx - r * .5, cy - r * .6, cx - r * .82, cy - r * .16); ctx.fill();
      // trenza
      ctx.strokeStyle = hair; ctx.lineWidth = r * .18;
      ctx.beginPath(); ctx.moveTo(cx - r * .82, cy + r * .2); ctx.quadraticCurveTo(cx - r * 1.05, cy + r * .9, cx - r * .88, cy + r * 1.5); ctx.stroke();
      break;
    case 'rapado':
      ctx.beginPath(); ctx.ellipse(cx, cy - r * .35, r * .8, r * .7, 0, Math.PI, TAU); ctx.fill(); break;
    case 'mechones':
      ctx.beginPath(); ctx.moveTo(cx - r * .85, cy - r * .2);
      for (let i = 0; i < 5; i++) { const sx = cx - r * .8 + i * r * .4; ctx.lineTo(sx, cy - r * (1.0 + (i % 2) * .22)); ctx.lineTo(sx + r * .2, cy - r * .78); }
      ctx.lineTo(cx + r * .85, cy - r * .2); ctx.quadraticCurveTo(cx, cy - r * .5, cx - r * .85, cy - r * .2); ctx.fill(); break;
  }
  // accesorios
  if (look.acc === 'circlet') {
    ctx.strokeStyle = '#e8c37a'; ctx.lineWidth = Math.max(2, r * .05);
    ctx.beginPath(); ctx.ellipse(cx, cy - r * .48, r * .72, r * .2, 0, Math.PI, TAU); ctx.stroke();
    ctx.fillStyle = look.eye; ell(ctx, cx, cy - r * .58, r * .055, r * .075); ctx.fill();
    glow(ctx, cx, cy - r * .58, r * .4, look.eye, .25);
  }
  if (look.acc === 'crown') {
    ctx.fillStyle = '#d8b56e';
    ctx.beginPath(); ctx.moveTo(cx - r * .7, cy - r * .62); ctx.lineTo(cx - r * .5, cy - r * 1.1); ctx.lineTo(cx - r * .2, cy - r * .8); ctx.lineTo(cx, cy - r * 1.18); ctx.lineTo(cx + r * .2, cy - r * .8); ctx.lineTo(cx + r * .5, cy - r * 1.1); ctx.lineTo(cx + r * .7, cy - r * .62); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#c0392b'; ell(ctx, cx, cy - r * .85, r * .06, r * .06); ctx.fill();
    glow(ctx, cx, cy - r * .85, r * .6, '#e8c37a', .25);
  }
  if (look.acc === 'hood') {
    ctx.fillStyle = look.cape;
    ctx.beginPath(); ctx.arc(cx, cy - r * .05, r * 1.02, Math.PI * .78, Math.PI * 2.22); ctx.lineTo(cx + r * .95, cy + r * .7); ctx.quadraticCurveTo(cx, cy + r * .3, cx - r * .95, cy + r * .7); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(232,195,122,.2)'; ctx.lineWidth = 1; ctx.stroke();
  }
  if (look.acc === 'hat') {
    ctx.fillStyle = '#4a3520'; ell(ctx, cx, cy - r * .72, r * 1.15, r * .17); ctx.fill();
    ctx.beginPath(); ctx.moveTo(cx - r * .55, cy - r * .72); ctx.lineTo(cx - r * .45, cy - r * 1.45); ctx.lineTo(cx + r * .45, cy - r * 1.45); ctx.lineTo(cx + r * .55, cy - r * .72); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#8a6a2e'; ctx.fillRect(cx - r * .55, cy - r * .95, r * 1.1, r * .1);
  }
  if (look.acc === 'goggles') {
    ctx.strokeStyle = '#6b4a2b'; ctx.lineWidth = Math.max(2, r * .06);
    ctx.beginPath(); ctx.arc(cx - eyeDX, eyeY - r * .04, r * .24, 0, TAU); ctx.stroke();
    ctx.beginPath(); ctx.arc(cx + eyeDX, eyeY - r * .04, r * .24, 0, TAU); ctx.stroke();
    ctx.fillStyle = rgba('#9dd6e8', .18); ell(ctx, cx - eyeDX, eyeY, r * .2, r * .16); ctx.fill(); ell(ctx, cx + eyeDX, eyeY, r * .2, r * .16); ctx.fill();
  }
  if (look.acc === 'beard') {
    ctx.fillStyle = look.beard || '#c9c4b2';
    ctx.beginPath(); ctx.moveTo(cx - r * .48, cy + r * .32); ctx.quadraticCurveTo(cx - r * .3, cy + r * 1.15, cx, cy + r * 1.3); ctx.quadraticCurveTo(cx + r * .3, cy + r * 1.15, cx + r * .48, cy + r * .32); ctx.quadraticCurveTo(cx, cy + r * .55, cx - r * .48, cy + r * .32); ctx.fill();
    ctx.strokeStyle = 'rgba(90,90,90,.3)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(cx - r * .2, cy + r * .55); ctx.lineTo(cx - r * .12, cy + r * .95); ctx.stroke();
  }
  if (look.acc === 'scar') {
    ctx.strokeStyle = 'rgba(140,70,60,.8)'; ctx.lineWidth = Math.max(1.5, r * .03);
    ctx.beginPath(); ctx.moveTo(cx + r * .42, cy - r * .3); ctx.lineTo(cx + r * .5, cy + r * .25); ctx.stroke();
  }
  // envejecimiento
  if (look.elder) {
    ctx.strokeStyle = 'rgba(90,60,50,.22)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(cx - r * .35, cy + r * .1); ctx.lineTo(cx - r * .5, cy + r * .16); ctx.moveTo(cx - r * .2, cy + r * .34); ctx.lineTo(cx - r * .4, cy + r * .4); ctx.stroke();
  }
  // luz de borde
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  const rim = ctx.createLinearGradient(cx - r, cy - r, cx + r, cy + r);
  rim.addColorStop(0, 'rgba(255,240,210,.15)'); rim.addColorStop(.5, 'rgba(255,240,210,0)'); rim.addColorStop(1, 'rgba(160,200,255,.08)');
  ctx.fillStyle = rim; ctx.fillRect(0, 0, W, H);
  ctx.restore();
  // viñeta
  const vg = ctx.createRadialGradient(cx, cy, r * .5, cx, cy, W * .85);
  vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(3,5,9,.75)');
  ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
  if (look.ghost) { ctx.fillStyle = 'rgba(120,190,200,.06)'; ctx.fillRect(0, 0, W, H); glow(ctx, cx, cy, r * 2, '#9dd6e8', .1); }
}

export function drawCreaturePortrait(canvas, species, time = 0) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  const c = CREATURES[species];
  if (!c) return;
  ctx.clearRect(0, 0, W, H);
  const bg = ctx.createRadialGradient(W / 2, H * .55, 4, W / 2, H * .55, W * .7);
  bg.addColorStop(0, rgba(c.accent, .2)); bg.addColorStop(1, 'rgba(8,12,20,0)');
  ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
  drawCreature(ctx, species, W / 2, H * .78, Math.min(W, H) / 90, time, { flip: 1 });
}
