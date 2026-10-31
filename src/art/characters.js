import { shadow, glow } from './props.js';
import { rgba, shade, clamp, lerp, easeOut } from '../core/utils.js';
import { CREATURES, CREATURE_TYPES } from '../data/creatures.js';

const OUT = 'rgba(20,16,24,.88)';

function roundRect(ctx, x, y, w, h, r) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y); ctx.arcTo(x + w, y, x + w, y + h, rr); ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr); ctx.arcTo(x, y, x + w, y, rr); ctx.closePath();
}

function drawCape(ctx, look, facing, sway, s, color) {
  if (!color) return;
  const back = facing === 'up';
  const side = facing === 'left' || facing === 'right';
  const w = side ? 13 : 17;
  ctx.beginPath();
  ctx.moveTo(-w * s, -42 * s);
  ctx.quadraticCurveTo((-w - 5) * s, -18 * s, (-w - 4 + sway) * s, -2 * s);
  ctx.quadraticCurveTo(0, 4 * s, (w + 3 + sway) * s, -3 * s);
  ctx.quadraticCurveTo((w + 3) * s, -22 * s, w * s, -42 * s);
  ctx.closePath();
  const g = ctx.createLinearGradient(0, -42 * s, 0, 0);
  g.addColorStop(0, shade(color, .1)); g.addColorStop(1, shade(color, -.28));
  ctx.fillStyle = g; ctx.fill();
  ctx.strokeStyle = 'rgba(15,12,18,.55)'; ctx.lineWidth = 1.2; ctx.stroke();
  if (back) { ctx.fillStyle = 'rgba(255,255,255,.05)'; ctx.fillRect(-w * .6 * s, -40 * s, w * 1.2 * s, 34 * s); }
}

function drawLeg(ctx, x, y, w, h, color, boot, swing, s) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(swing * .18);
  ctx.fillStyle = color;
  roundRect(ctx, -w / 2, 0, w, h, w * .45); ctx.fill();
  ctx.strokeStyle = 'rgba(20,16,22,.5)'; ctx.lineWidth = 1; ctx.stroke();
  ctx.fillStyle = boot;
  roundRect(ctx, -w / 2 - 1, h - 4, w + 3, 6, 2.5); ctx.fill();
  ctx.strokeStyle = 'rgba(15,12,16,.6)'; ctx.stroke();
  ctx.restore();
}

function drawArm(ctx, x, y, len, color, handColor, angle, s, sleeve = null) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(angle);
  ctx.fillStyle = sleeve || color;
  roundRect(ctx, -3 * s, 0, 6 * s, len, 3 * s); ctx.fill();
  ctx.strokeStyle = 'rgba(20,16,22,.5)'; ctx.lineWidth = 1; ctx.stroke();
  ctx.fillStyle = handColor;
  ctx.beginPath(); ctx.arc(0, len, 3.2 * s, 0, 6.3); ctx.fill();
  ctx.restore();
}

function drawWeapon(ctx, handX, handY, angle, type, s, glowColor, time, active = false) {
  ctx.save(); ctx.translate(handX, handY); ctx.rotate(angle);
  const scale = type === 'greatsword' ? 1.25 : type === 'daggers' ? .72 : type === 'staff' ? 1.15 : 1;
  // hilt
  ctx.fillStyle = '#7a5a34';
  ctx.fillRect(-2 * s, -3 * s, 4 * s, 9 * s);
  ctx.fillStyle = '#c8a060';
  ctx.fillRect(-6 * s, 4 * s, 12 * s, 2.4 * s);
  ctx.fillStyle = '#5a3e26';
  ctx.beginPath(); ctx.arc(0, 7.5 * s, 2.2 * s, 0, 6.3); ctx.fill();
  if (type === 'staff') {
    ctx.strokeStyle = '#6a4a32'; ctx.lineWidth = 2.4 * s;
    ctx.beginPath(); ctx.moveTo(0, -2 * s); ctx.lineTo(0, -52 * s); ctx.stroke();
    ctx.strokeStyle = '#c8a060'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(0, -52 * s, 4 * s, 0, 6.3); ctx.stroke();
    glow(ctx, 0, -52 * s, 14 * s, glowColor, .4);
    ctx.fillStyle = '#fff2c0'; ctx.beginPath(); ctx.arc(0, -52 * s, 2 * s, 0, 6.3); ctx.fill();
    ctx.restore(); return;
  }
  // blade
  const len = (type === 'greatsword' ? 38 : type === 'daggers' ? 16 : 30) * s * scale;
  const wid = type === 'greatsword' ? 4.2 : type === 'daggers' ? 2.1 : 2.8;
  const g = ctx.createLinearGradient(-wid * s, 0, wid * s, 0);
  g.addColorStop(0, '#dfe6ef'); g.addColorStop(.45, '#fffbea'); g.addColorStop(1, '#9aa8b8');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(-wid * s, -2 * s);
  ctx.lineTo(-wid * .7 * s, -len + 4 * s);
  ctx.lineTo(0, -len);
  ctx.lineTo(wid * .7 * s, -len + 4 * s);
  ctx.lineTo(wid * s, -2 * s);
  ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(40,44,58,.6)'; ctx.lineWidth = .8; ctx.stroke();
  ctx.strokeStyle = 'rgba(255,255,255,.7)'; ctx.lineWidth = .7;
  ctx.beginPath(); ctx.moveTo(-wid * .25 * s, -3 * s); ctx.lineTo(-wid * .18 * s, -len + 6 * s); ctx.stroke();
  if (active || type === 'celestial') {
    ctx.globalCompositeOperation = 'lighter';
    glow(ctx, 0, -len * .55, len * 1.4, glowColor, type === 'celestial' ? .3 : .16);
    ctx.globalCompositeOperation = 'source-over';
  }
  if (type === 'daggers') {
    // second dagger
    ctx.rotate(-.3);
    ctx.fillStyle = '#dfe6ef';
    ctx.beginPath(); ctx.moveTo(3 * s, 0); ctx.lineTo(4 * s, -14 * s); ctx.lineTo(5 * s, 0); ctx.closePath(); ctx.fill();
  }
  ctx.restore();
}

export function drawHumanoid(ctx, x, y, opts = {}) {
  const look = opts.look || {};
  const s = (opts.scale || 1) * (look.height || 1);
  const facing = opts.facing || 'down';
  const side = facing === 'left' || facing === 'right';
  const back = facing === 'up';
  const flip = facing === 'left';
  const time = opts.time || 0;
  const moving = !!opts.moving;
  const phase = opts.phase || 0;
  const walk = moving ? Math.sin(phase * 10) : 0;
  const bob = moving ? Math.abs(Math.sin(phase * 10)) * 1.2 : Math.sin(time * 1.7 + (opts.seed || 0) * 5) * .7;
  const attack = opts.attack;
  const atkP = attack ? clamp(attack.progress || 0) : 0;
  const attackActive = attack && attack.active;
  const dodge = opts.dodge || 0;
  const block = opts.block;
  const hurt = opts.hurt || 0;

  shadow(ctx, x, y + 1, 15 * s, 5 * s, .34);
  if (hurt > .05) glow(ctx, x, y - 26 * s, 34 * s, '#ff5050', hurt * .18);

  ctx.save();
  ctx.translate(x, y - bob * s);
  if (flip) ctx.scale(-1, 1);
  if (dodge > 0) { ctx.rotate(-.16 * flip * dodge); ctx.translate(0, -2 * s); }

  const outfit = look.outfit || '#445a80';
  const accent = look.accent || '#c8a060';
  const skin = look.skin || '#e8bd96';
  const hair = look.hair || '#3a2a24';
  const boot = shade(outfit, -.35);
  const armorLook = look.armor !== undefined ? look.armor : (look.armorLook || 0);
  const capeColor = look.capeColor || (look.accessory === 1 ? accent : null);

  // Cape behind
  if (capeColor) drawCape(ctx, look, facing, Math.sin(time * 2.2 + phase) * (moving ? 2.4 : .8), s, capeColor);

  // legs
  const legY = -20 * s, legH = 20 * s, legW = 5.4 * s;
  drawLeg(ctx, -4.4 * s, legY, legW, legH, shade(outfit, -.18), boot, walk, s);
  drawLeg(ctx, 4.4 * s, legY, legW, legH, shade(outfit, -.08), boot, -walk, s);

  // back arm
  const handColor = skin;
  const sleeve = armorLook > 0 ? shade(outfit, .12) : outfit;
  if (!side) drawArm(ctx, -9 * s, -37 * s, 15 * s, sleeve, handColor, .18 + walk * .05, s);

  // torso
  const torsoG = ctx.createLinearGradient(-9 * s, -42 * s, 9 * s, -20 * s);
  torsoG.addColorStop(0, shade(outfit, .14)); torsoG.addColorStop(.55, outfit); torsoG.addColorStop(1, shade(outfit, -.22));
  ctx.beginPath();
  ctx.moveTo(-9 * s, -41 * s);
  ctx.quadraticCurveTo(-11 * s, -30 * s, -7 * s, -19 * s);
  ctx.lineTo(7 * s, -19 * s);
  ctx.quadraticCurveTo(11 * s, -30 * s, 9 * s, -41 * s);
  ctx.quadraticCurveTo(0, -45 * s, -9 * s, -41 * s);
  ctx.closePath();
  ctx.fillStyle = torsoG; ctx.fill();
  ctx.strokeStyle = OUT; ctx.lineWidth = 1.3; ctx.stroke();
  // belt
  ctx.fillStyle = shade(accent, -.15); ctx.fillRect(-8 * s, -23 * s, 16 * s, 3.4 * s);
  ctx.fillStyle = '#e8c878'; ctx.fillRect(-2 * s, -23.4 * s, 4 * s, 3.8 * s);
  // armor
  if (armorLook > 0) {
    const plate = armorLook === 2 ? '#e8e2cc' : '#b8c0c8';
    ctx.fillStyle = plate;
    ctx.beginPath();
    ctx.moveTo(-8 * s, -39 * s); ctx.lineTo(8 * s, -39 * s); ctx.lineTo(6 * s, -26 * s); ctx.lineTo(0, -22 * s); ctx.lineTo(-6 * s, -26 * s); ctx.closePath();
    ctx.fill(); ctx.strokeStyle = 'rgba(50,48,52,.5)'; ctx.lineWidth = 1; ctx.stroke();
    // pauldrons
    ctx.fillStyle = shade(plate, -.08);
    ctx.beginPath(); ctx.ellipse(-9 * s, -40 * s, 5.4 * s, 4 * s, -.3, 0, 6.3); ctx.fill();
    ctx.beginPath(); ctx.ellipse(9 * s, -40 * s, 5.4 * s, 4 * s, .3, 0, 6.3); ctx.fill();
    ctx.strokeStyle = 'rgba(30,28,32,.4)'; ctx.stroke();
    if (armorLook === 2) {
      ctx.strokeStyle = 'rgba(255,230,160,.7)'; ctx.lineWidth = .9;
      ctx.beginPath(); ctx.moveTo(0, -36 * s); ctx.lineTo(0, -26 * s); ctx.moveTo(-4 * s, -33 * s); ctx.lineTo(4 * s, -33 * s); ctx.stroke();
    }
  } else {
    // leather straps
    ctx.strokeStyle = 'rgba(60,40,28,.65)'; ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.moveTo(-7 * s, -39 * s); ctx.lineTo(4 * s, -25 * s); ctx.stroke();
  }
  // scarf / collar
  if (look.accessory === 2 || look.scarf) {
    ctx.fillStyle = accent;
    roundRect(ctx, -8 * s, -44 * s, 16 * s, 4 * s, 2 * s); ctx.fill();
    const sw = Math.sin(time * 3 + phase) * 2;
    ctx.beginPath(); ctx.moveTo(3 * s, -42 * s); ctx.quadraticCurveTo(12 * s, -40 * s + sw, 14 * s, -30 * s + sw); ctx.quadraticCurveTo(9 * s, -36 * s, 3 * s, -38 * s); ctx.fill();
  }

  // head
  const headY = -49 * s;
  // hair back
  if (look.hairStyle === 0 || look.hairStyle === 2) {
    ctx.fillStyle = shade(hair, -.18);
    ctx.beginPath(); ctx.ellipse(0, headY + 5 * s, 9.4 * s, 11 * s, 0, 0, 6.3); ctx.fill();
    if (look.hairStyle === 2) {
      ctx.strokeStyle = shade(hair, -.05); ctx.lineWidth = 4 * s; ctx.lineCap = 'round';
      const sway = Math.sin(time * 1.8) * 1.4;
      ctx.beginPath(); ctx.moveTo(6 * s, headY + 4 * s); ctx.quadraticCurveTo(13 * s + sway, headY + 14 * s, 9 * s + sway, headY + 24 * s); ctx.stroke();
    }
  }
  // neck
  ctx.fillStyle = shade(skin, -.12); ctx.fillRect(-3 * s, -44 * s, 6 * s, 4 * s);
  // face
  ctx.fillStyle = skin;
  ctx.beginPath(); ctx.ellipse(0, headY, 8.2 * s, 8.6 * s, 0, 0, 6.3); ctx.fill();
  ctx.strokeStyle = 'rgba(60,35,30,.55)'; ctx.lineWidth = .9; ctx.stroke();
  // ears
  if (!back) { ctx.fillStyle = shade(skin, -.04); ctx.beginPath(); ctx.arc(-8 * s, headY + 1 * s, 2 * s, 0, 6.3); ctx.arc(8 * s, headY + 1 * s, 2 * s, 0, 6.3); ctx.fill(); }
  // hair top
  ctx.fillStyle = hair;
  if (look.hairStyle === 3) {
    ctx.beginPath(); ctx.ellipse(0, headY - 3 * s, 8.4 * s, 6.2 * s, 0, Math.PI, 0); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.08)'; ctx.beginPath(); ctx.ellipse(-2 * s, headY - 4 * s, 4 * s, 2 * s, -.3, 0, 6.3); ctx.fill();
  } else if (look.hairStyle === 1) {
    ctx.beginPath();
    ctx.moveTo(-9 * s, headY - 1 * s);
    ctx.quadraticCurveTo(-8 * s, headY - 11 * s, 0, headY - 10 * s);
    ctx.quadraticCurveTo(9 * s, headY - 11 * s, 9 * s, headY - 1 * s);
    ctx.lineTo(7 * s, headY - 4 * s); ctx.lineTo(4 * s, headY - 2 * s); ctx.lineTo(2 * s, headY - 6 * s);
    ctx.lineTo(-1 * s, headY - 2 * s); ctx.lineTo(-4 * s, headY - 5 * s); ctx.lineTo(-6 * s, headY - 1 * s); ctx.closePath(); ctx.fill();
  } else {
    ctx.beginPath();
    ctx.moveTo(-9.2 * s, headY - 1 * s);
    ctx.quadraticCurveTo(-10 * s, headY - 12 * s, 0, headY - 11 * s);
    ctx.quadraticCurveTo(10 * s, headY - 12 * s, 9.2 * s, headY - 1 * s);
    ctx.quadraticCurveTo(8 * s, headY - 6 * s, 5 * s, headY - 5 * s);
    ctx.quadraticCurveTo(3 * s, headY - 9 * s, 0, headY - 6 * s);
    ctx.quadraticCurveTo(-3 * s, headY - 9 * s, -5 * s, headY - 5 * s);
    ctx.quadraticCurveTo(-8 * s, headY - 6 * s, -9.2 * s, headY - 1 * s);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.12)';
    ctx.beginPath(); ctx.ellipse(-2 * s, headY - 7 * s, 4 * s, 1.8 * s, -.2, 0, 6.3); ctx.fill();
  }
  // face details
  if (!back) {
    if (side) {
      ctx.fillStyle = '#2a2024'; ctx.beginPath(); ctx.ellipse(3.6 * s, headY + .4 * s, 1.1 * s, 1.5 * s, 0, 0, 6.3); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,.75)'; ctx.beginPath(); ctx.arc(3.9 * s, headY + .1 * s, .4 * s, 0, 6.3); ctx.fill();
      ctx.strokeStyle = 'rgba(120,60,50,.45)'; ctx.lineWidth = .7;
      ctx.beginPath(); ctx.moveTo(4.5 * s, headY + 4.4 * s); ctx.lineTo(6 * s, headY + 4.8 * s); ctx.stroke();
    } else {
      ctx.fillStyle = '#2a2024';
      ctx.beginPath(); ctx.ellipse(-3.3 * s, headY + .8 * s, 1.2 * s, 1.7 * s, 0, 0, 6.3); ctx.ellipse(3.3 * s, headY + .8 * s, 1.2 * s, 1.7 * s, 0, 0, 6.3); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,.8)';
      ctx.beginPath(); ctx.arc(-3 * s, headY + .2 * s, .45 * s, 0, 6.3); ctx.arc(3.6 * s, headY + .2 * s, .45 * s, 0, 6.3); ctx.fill();
      ctx.strokeStyle = 'rgba(130,70,55,.5)'; ctx.lineWidth = .7;
      ctx.beginPath(); ctx.moveTo(-1.6 * s, headY + 4.6 * s); ctx.quadraticCurveTo(0, headY + 5.4 * s, 1.6 * s, headY + 4.6 * s); ctx.stroke();
      if (look.scar) { ctx.strokeStyle = 'rgba(150,70,60,.55)'; ctx.beginPath(); ctx.moveTo(4.2 * s, headY - 3.6 * s); ctx.lineTo(5.8 * s, headY + 2.6 * s); ctx.stroke(); }
    }
  }
  // beard
  if (look.beard) {
    ctx.fillStyle = shade(hair, .1);
    ctx.beginPath(); ctx.moveTo(-6 * s, headY + 4 * s); ctx.quadraticCurveTo(0, headY + 15 * s, 6 * s, headY + 4 * s); ctx.quadraticCurveTo(0, headY + 8 * s, -6 * s, headY + 4 * s); ctx.fill();
  }
  // helmet
  const showHelm = look.helmet || look.helmLook === 1 || look.helmLook === 2;
  if (showHelm || look.accessory === 3) {
    const metal = look.helmLook === 2 ? '#e0dac4' : '#9aa6b0';
    ctx.fillStyle = metal;
    ctx.beginPath(); ctx.ellipse(0, headY - 2.5 * s, 9.4 * s, 7.4 * s, 0, Math.PI, 0); ctx.fill();
    ctx.fillStyle = shade(metal, -.15); ctx.fillRect(-9.4 * s, headY - 3 * s, 18.8 * s, 3 * s);
    ctx.fillStyle = 'rgba(255,255,255,.3)'; ctx.beginPath(); ctx.ellipse(-2 * s, headY - 6 * s, 4 * s, 1.5 * s, -.2, 0, 6.3); ctx.fill();
    if (look.helmLook === 2) {
      ctx.strokeStyle = '#e8c878'; ctx.lineWidth = .8; ctx.beginPath(); ctx.moveTo(0, headY - 10 * s); ctx.lineTo(0, headY - 4 * s); ctx.stroke();
    }
    ctx.fillStyle = shade(skin, -.1); ctx.fillRect(-6 * s, headY - 1 * s, 12 * s, 2 * s);
  }

  // front arm and weapon
  const handY = -36 * s;
  const handX = side ? 8 * s : 9 * s;
  let armAngle = .4 + walk * .05;
  let weaponAngle = .8;
  if (block) { armAngle = 1.25; weaponAngle = -.35; }
  if (attack) {
    if (atkP < .28) { armAngle = -1.65; weaponAngle = -2.1; }
    else { const p = (atkP - .28) / .5; armAngle = lerp(-1.0, 1.5, easeOut(clamp(p))); weaponAngle = lerp(-1.7, 1.25, easeOut(clamp(p))); }
  }
  drawArm(ctx, handX, handY, 14 * s, sleeve, handColor, armAngle, s);
  const hx = handX + Math.sin(armAngle) * 14 * s;
  const hy = handY + Math.cos(armAngle) * 14 * s;
  if (opts.weapon !== false && look.weapon !== false) {
    drawWeapon(ctx, hx, hy, weaponAngle, opts.weapon || look.weapon || 'sword', s, look.weaponGlow || '#ffe8a0', time, !!opts.weaponGlow);
  }
  // block shield arc
  if (block) {
    ctx.strokeStyle = 'rgba(160,210,255,.7)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(0, -30 * s, 18 * s, -1.2, 1.2); ctx.stroke();
  }
  ctx.restore();
}

export const HERO_LOOK_DEFAULT = { skin: '#e8bd96', hair: '#2b2733', hairStyle: 0, outfit: '#445a80', accent: '#c8a060', accessory: 1, armorLook: 0, face: 0 };

export function drawPlayer(ctx, player, camera, time) {
  const s = player.spriteScale || 1;
  drawHumanoid(ctx, player.x - camera.x, player.y - camera.y, {
    look: player.look, facing: player.facing, moving: player.moving, phase: player.walkPhase,
    time, attack: player.attackState, dodge: player.dodgeTimer > 0 ? 1 : 0,
    block: player.blocking, hurt: player.hurtFlash, scale: s, weapon: player.weaponType,
    weaponGlow: player.weaponType === 'celestial',
    seed: 0
  });
  // celestial aura
  if (player.weaponType === 'celestial') {
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    glow(ctx, player.x - camera.x, player.y - camera.y - 30, 42, '#ffe8a0', .08);
    ctx.restore();
  }
}

export function drawNPC(ctx, npc, camera, time) {
  const x = npc.x - camera.x, y = npc.y - camera.y;
  if (npc.hidden) return;
  drawHumanoid(ctx, x, y, {
    look: npc.visual, facing: npc.facing || 'down', moving: false, phase: 0, time: time + (npc.id.length * .7),
    scale: 1, weapon: npc.id === 'borin' || npc.id === 'ren' || npc.id === 'rhea' || npc.id === 'kael_camp' || npc.id === 'ash',
    seed: npc.x * .01
  });
  if (npc.visual?.glow) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(ctx, x, y - 30, 40, '#c8d8ff', .1); ctx.restore(); }
  // exclamation / marker
  if (npc.marker) {
    const bob = Math.sin(time * 3 + npc.x) * 3;
    ctx.fillStyle = '#ffe6a0'; ctx.font = 'bold 18px Georgia'; ctx.textAlign = 'center';
    ctx.shadowColor = '#000'; ctx.shadowBlur = 6;
    ctx.fillText('!', x, y - 68 + bob);
    ctx.shadowBlur = 0;
  }
}

function wolf(ctx, x, y, e, time) {
  const s = e.scale || 1;
  const dir = e.facing === 'left' ? -1 : 1;
  const run = Math.sin(time * 11 + e.seed * 8);
  const bob = Math.abs(run) * 2;
  ctx.save(); ctx.translate(x, y - bob); ctx.scale(dir, 1);
  shadow(ctx, 0, bob + 1, 22 * s, 6 * s, .32);
  // tail
  ctx.strokeStyle = '#3a333c'; ctx.lineWidth = 4 * s; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(-16 * s, -24 * s); ctx.quadraticCurveTo(-30 * s, -30 * s + run * 4, -34 * s, -16 * s); ctx.stroke();
  // legs
  ctx.strokeStyle = '#2e2933'; ctx.lineWidth = 3.4 * s;
  for (const [lx, ph] of [[-12, run], [-7, -run], [8, -run], [13, run]]) {
    ctx.beginPath(); ctx.moveTo(lx * s, -14 * s); ctx.lineTo(lx * s + ph * 3 * s, 0); ctx.stroke();
  }
  // body
  ctx.fillStyle = e.palette?.[0] || '#5d5660';
  ctx.beginPath(); ctx.ellipse(0, -22 * s, 18 * s, 10 * s, -.05, 0, 6.3); ctx.fill();
  ctx.strokeStyle = OUT; ctx.lineWidth = 1.2; ctx.stroke();
  // fur spikes
  polySpike(ctx, -4 * s, -30 * s, -9 * s, -40 * s, 4 * s, -30 * s, '#46404a');
  polySpike(ctx, 5 * s, -30 * s, 4 * s, -39 * s, 12 * s, -28 * s, '#46404a');
  // neck/head
  ctx.fillStyle = '#4d4652';
  ctx.beginPath(); ctx.ellipse(17 * s, -28 * s, 10 * s, 8.5 * s, .2, 0, 6.3); ctx.fill();
  ctx.fillStyle = e.palette?.[0] || '#5d5660';
  ctx.beginPath(); ctx.moveTo(21 * s, -32 * s); ctx.lineTo(33 * s, -28 * s); ctx.lineTo(22 * s, -22 * s); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = OUT; ctx.stroke();
  // ears
  ctx.fillStyle = '#3a333c';
  polySpike(ctx, 12 * s, -34 * s, 10 * s, -47 * s, 18 * s, -35 * s, '#3a333c');
  polySpike(ctx, 20 * s, -35 * s, 23 * s, -47 * s, 27 * s, -33 * s, '#3a333c');
  // eyes
  ctx.fillStyle = e.palette?.[2] || '#ffb05e';
  ctx.beginPath(); ctx.ellipse(20 * s, -30 * s, 1.7 * s, 1.1 * s, 0, 0, 6.3); ctx.ellipse(27 * s, -30 * s, 1.5 * s, 1 * s, 0, 0, 6.3); ctx.fill();
  glow(ctx, 24 * s, -30 * s, 7 * s, e.palette?.[2] || '#ffb05e', .25);
  // teeth
  ctx.strokeStyle = '#e8e0d0'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(28 * s, -24 * s); ctx.lineTo(30 * s, -22 * s); ctx.stroke();
  ctx.restore();
}

function polySpike(ctx, x1, y1, x2, y2, x3, y3, fill) {
  ctx.fillStyle = fill; ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.lineTo(x3, y3); ctx.closePath(); ctx.fill();
}

function wisp(ctx, x, y, e, time) {
  const s = e.scale || 1;
  const fy = y - 24 * s + Math.sin(time * 2 + e.seed * 5) * 6;
  glow(ctx, x, fy, 46 * s, e.palette?.[0] || '#a8e6d8', .2);
  // tendrils
  ctx.strokeStyle = rgba(e.palette?.[1] || '#3c8d84', .6); ctx.lineWidth = 2 * s;
  for (let i = 0; i < 4; i++) {
    const a = time * 1.2 + i * 1.57;
    ctx.beginPath(); ctx.moveTo(x, fy + 4 * s);
    ctx.quadraticCurveTo(x + Math.cos(a) * 12 * s, fy + 10 * s, x + Math.cos(a + .5) * 7 * s, fy + 22 * s + Math.sin(time * 3 + i) * 3);
    ctx.stroke();
  }
  // core
  ctx.fillStyle = e.palette?.[0] || '#a8e6d8';
  ctx.beginPath(); ctx.arc(x, fy, 10 * s, 0, 6.3); ctx.fill();
  ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(x - 2 * s, fy - 3 * s, 4 * s, 0, 6.3); ctx.fill();
  ctx.fillStyle = '#1a3438';
  ctx.beginPath(); ctx.ellipse(x - 3 * s, fy, 1.3 * s, 2.2 * s, 0, 0, 6.3); ctx.ellipse(x + 3 * s, fy, 1.3 * s, 2.2 * s, 0, 0, 6.3); ctx.fill();
  // skirt
  ctx.fillStyle = rgba(e.palette?.[1] || '#3c8d84', .55);
  ctx.beginPath(); ctx.moveTo(x - 9 * s, fy + 6 * s); ctx.quadraticCurveTo(x, fy + 26 * s, x + 9 * s, fy + 6 * s); ctx.closePath(); ctx.fill();
}

function golem(ctx, x, y, e, time) {
  const s = e.scale || 1;
  const sway = Math.sin(time * 2 + e.seed) * 1.5;
  shadow(ctx, x, y + 1, 28 * s, 8 * s, .36);
  ctx.fillStyle = e.palette?.[1] || '#4e4b48';
  roundRect(ctx, x - 16 * s, y - 50 * s, 32 * s, 36 * s, 7 * s); ctx.fill();
  ctx.strokeStyle = OUT; ctx.lineWidth = 1.4; ctx.stroke();
  // rocks
  ctx.fillStyle = e.palette?.[0] || '#8d8a80';
  ctx.beginPath(); ctx.arc(x - 12 * s, y - 46 * s, 11 * s, 0, 6.3); ctx.arc(x + 12 * s, y - 40 * s, 12 * s, 0, 6.3); ctx.arc(x - 2 * s, y - 28 * s, 10 * s, 0, 6.3); ctx.fill();
  ctx.strokeStyle = 'rgba(40,38,40,.5)'; ctx.stroke();
  // arms
  ctx.fillStyle = e.palette?.[0] || '#8d8a80';
  roundRect(ctx, x - 28 * s, y - 44 * s + sway, 10 * s, 26 * s, 4 * s); ctx.fill();
  roundRect(ctx, x + 18 * s, y - 42 * s - sway, 10 * s, 26 * s, 4 * s); ctx.fill();
  // head
  ctx.fillStyle = shade(e.palette?.[0] || '#8d8a80', .05);
  roundRect(ctx, x - 9 * s, y - 66 * s, 18 * s, 16 * s, 4 * s); ctx.fill();
  ctx.strokeStyle = OUT; ctx.stroke();
  // runes
  const rc = e.palette?.[2] || '#7fe0d0';
  ctx.strokeStyle = rc; ctx.lineWidth = 1.4; ctx.shadowColor = rc; ctx.shadowBlur = 8;
  ctx.beginPath(); ctx.moveTo(x - 4 * s, y - 58 * s); ctx.lineTo(x, y - 62 * s); ctx.lineTo(x + 4 * s, y - 57 * s); ctx.lineTo(x, y - 53 * s); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x, y - 42 * s); ctx.lineTo(x + 5 * s, y - 36 * s); ctx.lineTo(x - 4 * s, y - 32 * s); ctx.stroke();
  ctx.shadowBlur = 0;
  ctx.fillStyle = rc; ctx.beginPath(); ctx.arc(x - 4 * s, y - 60 * s, 1.4 * s, 0, 6.3); ctx.arc(x + 4 * s, y - 60 * s, 1.4 * s, 0, 6.3); ctx.fill();
}

function drawGuardian(ctx, x, y, e, time) {
  const s = e.scale || 1;
  const fy = y - 18 * s + Math.sin(time * 1.2) * 3;
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  glow(ctx, x, fy - 30 * s, 80 * s, '#8fe0c8', .12);
  ctx.restore();
  shadow(ctx, x, y + 2, 45 * s, 12 * s, .3);
  // spectral lower body
  ctx.fillStyle = rgba('#2b6b60', .6);
  ctx.beginPath(); ctx.moveTo(x - 24 * s, fy - 10 * s); ctx.quadraticCurveTo(x - 34 * s, y + 10 * s, x - 10 * s, y + 4 * s); ctx.quadraticCurveTo(x, y + 12 * s, x + 10 * s, y + 4 * s); ctx.quadraticCurveTo(x + 34 * s, y + 10 * s, x + 24 * s, fy - 10 * s); ctx.closePath(); ctx.fill();
  // body
  ctx.fillStyle = '#5a4a3a';
  ctx.beginPath(); ctx.ellipse(x, fy - 30 * s, 23 * s, 32 * s, 0, 0, 6.3); ctx.fill();
  ctx.strokeStyle = OUT; ctx.lineWidth = 1.5; ctx.stroke();
  // bark plates
  ctx.strokeStyle = 'rgba(40,60,45,.6)'; ctx.lineWidth = 2;
  for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(x - 18 * s + i * 9 * s, fy - 54 * s); ctx.lineTo(x - 14 * s + i * 9 * s, fy - 20 * s); ctx.stroke(); }
  // chest gem
  glow(ctx, x, fy - 34 * s, 26 * s, '#b0ffe0', .3);
  ctx.fillStyle = '#c8ffe8'; ctx.beginPath(); ctx.moveTo(x, fy - 44 * s); ctx.lineTo(x + 7 * s, fy - 34 * s); ctx.lineTo(x, fy - 24 * s); ctx.lineTo(x - 7 * s, fy - 34 * s); ctx.closePath(); ctx.fill();
  // arms
  ctx.strokeStyle = '#4a3e32'; ctx.lineWidth = 8 * s; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x - 20 * s, fy - 40 * s); ctx.quadraticCurveTo(x - 44 * s, fy - 26 * s, x - 36 * s, fy + 4 * s); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x + 20 * s, fy - 40 * s); ctx.quadraticCurveTo(x + 44 * s, fy - 30 * s, x + 38 * s, fy - 2 * s); ctx.stroke();
  // claws
  ctx.strokeStyle = '#7a6250'; ctx.lineWidth = 3 * s;
  for (let i = -1; i <= 1; i++) { ctx.beginPath(); ctx.moveTo(x - 36 * s + i * 4 * s, fy + 2 * s); ctx.lineTo(x - 38 * s + i * 5 * s, fy + 10 * s); ctx.stroke(); }
  // antlers
  ctx.strokeStyle = '#8a7a5a'; ctx.lineWidth = 3.2 * s;
  for (const dir of [-1, 1]) {
    ctx.beginPath(); ctx.moveTo(x + dir * 8 * s, fy - 58 * s);
    ctx.quadraticCurveTo(x + dir * 22 * s, fy - 78 * s, x + dir * 18 * s, fy - 94 * s); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x + dir * 15 * s, fy - 72 * s); ctx.lineTo(x + dir * 28 * s, fy - 78 * s); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x + dir * 19 * s, fy - 84 * s); ctx.lineTo(x + dir * 30 * s, fy - 88 * s); ctx.stroke();
  }
  // mask face
  ctx.fillStyle = '#d8c8a8';
  ctx.beginPath(); ctx.ellipse(x, fy - 54 * s, 10 * s, 12 * s, 0, 0, 6.3); ctx.fill();
  ctx.fillStyle = '#1d3f38'; ctx.beginPath(); ctx.ellipse(x - 4 * s, fy - 55 * s, 2 * s, 3 * s, 0, 0, 6.3); ctx.ellipse(x + 4 * s, fy - 55 * s, 2 * s, 3 * s, 0, 0, 6.3); ctx.fill();
  ctx.fillStyle = '#b0ffe0'; ctx.beginPath(); ctx.arc(x - 4 * s, fy - 55 * s, .7 * s, 0, 6.3); ctx.arc(x + 4 * s, fy - 55 * s, .7 * s, 0, 6.3); ctx.fill();
}

function drawKnight(ctx, x, y, e, time, boss = false) {
  const s = e.scale || 1;
  shadow(ctx, x, y + 1, 20 * s, 6 * s, .36);
  const sway = Math.sin(time * 1.5) * 1;
  // cape
  ctx.fillStyle = 'rgba(50,45,75,.85)';
  ctx.beginPath(); ctx.moveTo(x - 12 * s, y - 54 * s); ctx.quadraticCurveTo(x - 26 * s, y - 20 * s, x - 18 * s + sway, y + 2 * s); ctx.lineTo(x + 14 * s, y + 2 * s); ctx.quadraticCurveTo(x + 18 * s, y - 24 * s, x + 12 * s, y - 54 * s); ctx.fill();
  // legs
  ctx.fillStyle = '#282c3c';
  ctx.fillRect(x - 10 * s, y - 24 * s, 8 * s, 24 * s); ctx.fillRect(x + 2 * s, y - 24 * s, 8 * s, 24 * s);
  ctx.fillStyle = '#7a8098'; ctx.fillRect(x - 11 * s, y - 6 * s, 10 * s, 6 * s); ctx.fillRect(x + 1 * s, y - 6 * s, 10 * s, 6 * s);
  // torso armor
  ctx.fillStyle = e.palette?.[0] || '#4f5570';
  ctx.beginPath(); ctx.moveTo(x - 13 * s, y - 55 * s); ctx.lineTo(x + 13 * s, y - 55 * s); ctx.lineTo(x + 10 * s, y - 24 * s); ctx.lineTo(x - 10 * s, y - 24 * s); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = OUT; ctx.lineWidth = 1.3; ctx.stroke();
  ctx.strokeStyle = 'rgba(200,210,230,.25)'; ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.moveTo(x, y - 52 * s); ctx.lineTo(x, y - 28 * s); ctx.moveTo(x - 9 * s, y - 42 * s); ctx.lineTo(x + 9 * s, y - 42 * s); ctx.stroke();
  // pauldrons
  ctx.fillStyle = '#6a7088'; ctx.beginPath(); ctx.ellipse(x - 14 * s, y - 54 * s, 7 * s, 5 * s, -.3, 0, 6.3); ctx.ellipse(x + 14 * s, y - 54 * s, 7 * s, 5 * s, .3, 0, 6.3); ctx.fill();
  // head/helm
  ctx.fillStyle = '#3a3e52';
  ctx.beginPath(); ctx.ellipse(x, y - 64 * s, 10 * s, 11 * s, 0, 0, 6.3); ctx.fill();
  ctx.strokeStyle = OUT; ctx.stroke();
  ctx.fillStyle = '#b8a8ff'; ctx.fillRect(x - 7 * s, y - 66 * s, 14 * s, 2.2 * s);
  glow(ctx, x, y - 64 * s, 16 * s, '#b8a8ff', .16);
  // horn
  ctx.fillStyle = '#8a7ab8';
  polySpike(ctx, x - 7 * s, y - 72 * s, x - 12 * s, y - 84 * s, x - 3 * s, y - 74 * s, '#8a7ab8');
  polySpike(ctx, x + 7 * s, y - 72 * s, x + 12 * s, y - 84 * s, x + 3 * s, y - 74 * s, '#8a7ab8');
  // sword
  ctx.save(); ctx.translate(x + 18 * s, y - 36 * s); ctx.rotate(-.4 + Math.sin(time * 1.2) * .04);
  ctx.fillStyle = '#dfe4f0'; ctx.fillRect(-2 * s, -40 * s, 4 * s, 34 * s);
  ctx.strokeStyle = 'rgba(30,30,50,.6)'; ctx.strokeRect(-2 * s, -40 * s, 4 * s, 34 * s);
  ctx.fillStyle = '#8a7ab8'; ctx.fillRect(-7 * s, -7 * s, 14 * s, 3 * s);
  ctx.restore();
  if (boss) {
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(ctx, x, y - 40 * s, 70 * s, '#9a8aff', .08); ctx.restore();
  }
}

function drawMalachar(ctx, x, y, e, time) {
  const s = e.scale || 1;
  shadow(ctx, x, y + 2, 52 * s, 14 * s, .44);
  const fy = y - 4 * s;
  // molten legs
  ctx.fillStyle = '#3a2024';
  ctx.fillRect(x - 30 * s, y - 42 * s, 22 * s, 42 * s); ctx.fillRect(x + 8 * s, y - 42 * s, 22 * s, 42 * s);
  ctx.strokeStyle = '#ff7a3e'; ctx.lineWidth = 1.8;
  ctx.beginPath(); ctx.moveTo(x - 24 * s, y - 36 * s); ctx.lineTo(x - 20 * s, y - 18 * s); ctx.lineTo(x - 26 * s, y - 6 * s); ctx.moveTo(x + 20 * s, y - 34 * s); ctx.lineTo(x + 24 * s, y - 16 * s); ctx.stroke();
  // torso
  const g = ctx.createLinearGradient(x, y - 100 * s, x, y - 30 * s);
  g.addColorStop(0, '#6e3a30'); g.addColorStop(.5, '#3a1e20'); g.addColorStop(1, '#23151a');
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.moveTo(x - 34 * s, y - 94 * s); ctx.lineTo(x + 34 * s, y - 94 * s); ctx.lineTo(x + 30 * s, y - 34 * s); ctx.lineTo(x - 30 * s, y - 34 * s); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = OUT; ctx.lineWidth = 1.6; ctx.stroke();
  // cracks
  ctx.strokeStyle = 'rgba(255,130,60,.9)'; ctx.lineWidth = 2; ctx.shadowColor = '#ff7a30'; ctx.shadowBlur = 10;
  ctx.beginPath(); ctx.moveTo(x - 16 * s, y - 84 * s); ctx.lineTo(x - 8 * s, y - 68 * s); ctx.lineTo(x - 14 * s, y - 54 * s); ctx.lineTo(x - 4 * s, y - 44 * s); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x + 12 * s, y - 82 * s); ctx.lineTo(x + 4 * s, y - 66 * s); ctx.lineTo(x + 14 * s, y - 58 * s); ctx.stroke();
  ctx.shadowBlur = 0;
  // arms
  ctx.fillStyle = '#4a2424';
  roundRect(ctx, x - 48 * s, y - 88 * s, 16 * s, 34 * s, 6 * s); ctx.fill();
  roundRect(ctx, x + 32 * s, y - 88 * s, 16 * s, 34 * s, 6 * s); ctx.fill();
  // gauntlets
  ctx.fillStyle = '#6a3a30'; ctx.beginPath(); ctx.arc(x - 40 * s, y - 52 * s, 10 * s, 0, 6.3); ctx.arc(x + 40 * s, y - 52 * s, 10 * s, 0, 6.3); ctx.fill();
  // head/helm
  ctx.fillStyle = '#3a2024';
  ctx.beginPath(); ctx.ellipse(x, y - 108 * s, 14 * s, 16 * s, 0, 0, 6.3); ctx.fill();
  ctx.strokeStyle = OUT; ctx.stroke();
  ctx.fillStyle = '#ffb060'; ctx.beginPath(); ctx.ellipse(x - 5 * s, y - 109 * s, 2 * s, 3 * s, 0, 0, 6.3); ctx.ellipse(x + 5 * s, y - 109 * s, 2 * s, 3 * s, 0, 0, 6.3); ctx.fill();
  glow(ctx, x, y - 108 * s, 24 * s, '#ff8a3e', .25);
  // crown
  ctx.fillStyle = '#c8803a';
  for (let i = -2; i <= 2; i++) polySpike(ctx, x + i * 7 * s - 3 * s, y - 120 * s, x + i * 7 * s, y - 134 * s - (i === 0 ? 6 : 0) * s, x + i * 7 * s + 3 * s, y - 120 * s, '#d89a4a');
  // hammer
  ctx.save(); ctx.translate(x + 46 * s, y - 40 * s); ctx.rotate(-.3 + Math.sin(time * 1.4) * .03);
  ctx.fillStyle = '#5a3a30'; ctx.fillRect(-3 * s, -22 * s, 6 * s, 52 * s);
  ctx.fillStyle = '#6a4a40'; roundRect(ctx, -16 * s, -44 * s, 32 * s, 24 * s, 4 * s); ctx.fill();
  ctx.strokeStyle = '#ff8a3e'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(-14 * s, -36 * s); ctx.lineTo(14 * s, -32 * s); ctx.stroke();
  ctx.restore();
  // aura
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(ctx, x, y - 70 * s, 100 * s, '#ff6a30', .08); ctx.restore();
}

function drawSeraphine(ctx, x, y, e, time) {
  const s = e.scale || 1;
  const fy = y - 34 * s + Math.sin(time * 1.1) * 4;
  shadow(ctx, x, y + 2, 46 * s, 12 * s, .28);
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(ctx, x, fy - 20 * s, 110 * s, '#ffe8b0', .12); ctx.restore();
  // robe
  ctx.fillStyle = 'rgba(230,224,200,.9)';
  ctx.beginPath(); ctx.moveTo(x - 18 * s, fy - 20 * s); ctx.quadraticCurveTo(x - 38 * s, y + 8 * s, x - 20 * s, y + 6 * s); ctx.lineTo(x + 20 * s, y + 6 * s); ctx.quadraticCurveTo(x + 38 * s, y + 8 * s, x + 18 * s, fy - 20 * s); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(120,110,80,.5)'; ctx.lineWidth = 1.3; ctx.stroke();
  // wings
  for (const dir of [-1, 1]) {
    for (let w = 0; w < 3; w++) {
      ctx.fillStyle = w === 0 ? 'rgba(255,250,225,.9)' : 'rgba(240,232,200,.7)';
      ctx.beginPath();
      ctx.moveTo(x + dir * 8 * s, fy - 48 * s);
      ctx.quadraticCurveTo(x + dir * (56 + w * 10) * s, fy - (80 + w * 14) * s, x + dir * (62 + w * 12) * s, fy - (30 + w * 10) * s);
      ctx.quadraticCurveTo(x + dir * (40 + w * 7) * s, fy - (34 + w * 8) * s, x + dir * 10 * s, fy - 18 * s);
      ctx.closePath(); ctx.fill();
      ctx.strokeStyle = 'rgba(150,140,100,.35)'; ctx.lineWidth = 1; ctx.stroke();
    }
  }
  // body
  ctx.fillStyle = '#e8e2c8';
  ctx.fillRect(x - 12 * s, fy - 52 * s, 24 * s, 34 * s);
  ctx.strokeStyle = 'rgba(130,120,90,.5)'; ctx.strokeRect(x - 12 * s, fy - 52 * s, 24 * s, 34 * s);
  // arms
  ctx.strokeStyle = '#e8e2c8'; ctx.lineWidth = 5 * s;
  ctx.beginPath(); ctx.moveTo(x - 12 * s, fy - 46 * s); ctx.lineTo(x - 28 * s, fy - 26 * s); ctx.moveTo(x + 12 * s, fy - 46 * s); ctx.lineTo(x + 28 * s, fy - 26 * s); ctx.stroke();
  // head
  ctx.fillStyle = '#f0e8d0';
  ctx.beginPath(); ctx.ellipse(x, fy - 64 * s, 10 * s, 12 * s, 0, 0, 6.3); ctx.fill();
  ctx.fillStyle = '#c8b070'; ctx.fillRect(x - 8 * s, fy - 68 * s, 16 * s, 2.2 * s);
  glow(ctx, x, fy - 64 * s, 26 * s, '#ffe8b0', .2);
  // halo
  ctx.strokeStyle = '#ffe8a0'; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(x, fy - 80 * s, 18 * s, 4 * s, 0, 0, 6.3); ctx.stroke();
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(ctx, x, fy - 80 * s, 28 * s, '#ffe8a0', .25); ctx.restore();
  // staff of the Coro
  ctx.strokeStyle = '#c8b070'; ctx.lineWidth = 3 * s;
  ctx.beginPath(); ctx.moveTo(x + 30 * s, fy - 70 * s); ctx.lineTo(x + 32 * s, y - 2 * s); ctx.stroke();
  ctx.strokeStyle = '#fff2c0'; ctx.lineWidth = 1.4;
  ctx.beginPath(); ctx.arc(x + 30 * s, fy - 74 * s, 8 * s, 0, 6.3); ctx.stroke();
  glow(ctx, x + 30 * s, fy - 74 * s, 20 * s, '#fff2c0', .3);
}

function drawSalamander(ctx, x, y, e, time) {
  const s = e.scale || 1;
  const run = Math.sin(time * 9 + e.seed * 4);
  ctx.save(); ctx.translate(x, y - Math.abs(run) * 1.2); ctx.scale(e.facing === 'left' ? -1 : 1, 1);
  shadow(ctx, 0, 1, 25 * s, 6 * s, .3);
  // tail
  ctx.strokeStyle = '#8a3526'; ctx.lineWidth = 6 * s; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(-18 * s, -16 * s); ctx.quadraticCurveTo(-32 * s, -24 * s + run * 4, -36 * s, -12 * s); ctx.stroke();
  glow(ctx, -30 * s, -20 * s, 20 * s, '#ff9a48', .18);
  // legs
  ctx.strokeStyle = '#6e2a22'; ctx.lineWidth = 3.2 * s;
  for (const [lx, ph] of [[-12, run], [-6, -run], [8, -run], [14, run]]) { ctx.beginPath(); ctx.moveTo(lx * s, -12 * s); ctx.lineTo(lx * s + ph * 3 * s, 0); ctx.stroke(); }
  // body
  ctx.fillStyle = e.palette?.[0] || '#d86b3e';
  ctx.beginPath(); ctx.ellipse(0, -20 * s, 18 * s, 10 * s, 0, 0, 6.3); ctx.fill();
  ctx.strokeStyle = OUT; ctx.lineWidth = 1.2; ctx.stroke();
  // back spines
  ctx.fillStyle = e.palette?.[2] || '#ffd27a';
  for (let i = 0; i < 4; i++) polySpike(ctx, -8 * s + i * 6 * s, -27 * s, -5 * s + i * 6 * s, -35 * s, -1 * s + i * 6 * s, -26 * s, i % 2 ? '#ffc060' : '#ff8a4a');
  glow(ctx, 0, -28 * s, 30 * s, '#ff8a4a', .13);
  // head
  ctx.fillStyle = e.palette?.[0] || '#d86b3e';
  ctx.beginPath(); ctx.ellipse(19 * s, -24 * s, 10 * s, 7 * s, .1, 0, 6.3); ctx.fill();
  ctx.fillStyle = '#2a1414'; ctx.beginPath(); ctx.ellipse(25 * s, -26 * s, 1.6 * s, 2 * s, 0, 0, 6.3); ctx.fill();
  glow(ctx, 25 * s, -26 * s, 6 * s, '#ffd27a', .3);
  ctx.strokeStyle = '#ffd27a'; ctx.lineWidth = .9; ctx.beginPath(); ctx.moveTo(25 * s, -21 * s); ctx.lineTo(28 * s, -20 * s); ctx.stroke();
  ctx.restore();
}

function drawHumanEnemy(ctx, x, y, e, time, style = 'bandit') {
  const s = e.scale || 1;
  const look = style === 'cultist'
    ? { skin: '#b88a70', hair: '#2a1a20', hairStyle: 3, outfit: e.palette?.[0] || '#7a2f37', accent: e.palette?.[2] || '#ff9c5e', accessory: 0, armorLook: 0, scarf: true, weapon: 'dagger' }
    : style === 'sentinel'
      ? { skin: '#d8d2b0', hair: '#d8d2b0', hairStyle: 3, outfit: '#d8d2b0', accent: '#e8c878', accessory: 1, armorLook: 2, weapon: 'staff', helmet: true }
      : { skin: '#b88060', hair: '#2a2024', hairStyle: 1, outfit: e.palette?.[0] || '#8f6c4a', accent: e.palette?.[2] || '#c8a778', accessory: 0, armorLook: 0, weapon: 'dagger' };
  if (style === 'sentinel') {
    const fy = y - 24 * s + Math.sin(time * 1.4 + e.seed) * 5;
    // floating armor
    ctx.save(); ctx.translate(x, fy);
    glow(ctx, 0, 0, 40 * s, '#fff2b0', .12);
    ctx.fillStyle = '#d8d2b0';
    ctx.beginPath(); ctx.moveTo(-14 * s, -22 * s); ctx.lineTo(14 * s, -22 * s); ctx.lineTo(10 * s, 18 * s); ctx.lineTo(0, 26 * s); ctx.lineTo(-10 * s, 18 * s); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = OUT; ctx.lineWidth = 1.2; ctx.stroke();
    ctx.fillStyle = '#e8e2c8'; ctx.beginPath(); ctx.ellipse(0, -30 * s, 9 * s, 10 * s, 0, 0, 6.3); ctx.fill();
    ctx.fillStyle = '#b8a870'; ctx.fillRect(-6 * s, -32 * s, 12 * s, 2 * s);
    ctx.strokeStyle = '#fff2b0'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.ellipse(0, -44 * s, 13 * s, 3 * s, 0, 0, 6.3); ctx.stroke();
    // spear
    ctx.strokeStyle = '#c8b070'; ctx.lineWidth = 2.4 * s; ctx.beginPath(); ctx.moveTo(20 * s, -50 * s); ctx.lineTo(20 * s, 22 * s); ctx.stroke();
    ctx.fillStyle = '#fff2c0'; polySpike(ctx, 20 * s, -60 * s, 17 * s, -48 * s, 23 * s, -48 * s, '#fff2c0');
    ctx.restore();
    return;
  }
  drawHumanoid(ctx, x, y, { look, facing: e.facing, moving: e.moving, phase: time * 2 + e.seed, time, scale: s, weapon: style === 'cultist' ? 'staff' : 'daggers', seed: e.seed });
  if (style === 'cultist') {
    glow(ctx, x, y - 38 * s, 30 * s, e.palette?.[2] || '#ff9c5e', .12);
    // hood
    ctx.fillStyle = e.palette?.[0] || '#7a2f37';
    ctx.beginPath(); ctx.arc(x, y - 50 * s, 11 * s, Math.PI, 0); ctx.fill();
  }
}

function drawSeraph(ctx, x, y, e, time) {
  const s = e.scale || 1;
  const fy = y - 18 * s + Math.sin(time * 1.8 + e.seed) * 6;
  shadow(ctx, x, y + 1, 14 * s, 4 * s, .2);
  // wings
  for (const dir of [-1, 1]) {
    const flap = Math.sin(time * 3 + e.seed) * .2;
    ctx.save(); ctx.translate(x, fy - 32 * s); ctx.rotate(dir * flap);
    ctx.fillStyle = 'rgba(240,235,210,.85)';
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(dir * 30 * s, -26 * s, dir * 40 * s, 2 * s); ctx.quadraticCurveTo(dir * 24 * s, 6 * s, 0, 12 * s); ctx.fill();
    ctx.strokeStyle = 'rgba(150,140,100,.4)'; ctx.stroke();
    ctx.restore();
  }
  // body
  ctx.fillStyle = '#e8e2c8'; ctx.beginPath(); ctx.ellipse(x, fy - 24 * s, 9 * s, 16 * s, 0, 0, 6.3); ctx.fill();
  ctx.strokeStyle = 'rgba(120,110,70,.4)'; ctx.stroke();
  // head
  ctx.fillStyle = '#f0e8d0'; ctx.beginPath(); ctx.arc(x, fy - 46 * s, 7 * s, 0, 6.3); ctx.fill();
  ctx.fillStyle = '#c8b070'; ctx.fillRect(x - 6 * s, fy - 48 * s, 12 * s, 1.6 * s);
  ctx.strokeStyle = '#ffe8a0'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.ellipse(x, fy - 56 * s, 9 * s, 2.5 * s, 0, 0, 6.3); ctx.stroke();
  // spear
  ctx.strokeStyle = '#c8b070'; ctx.lineWidth = 2 * s; ctx.beginPath(); ctx.moveTo(x + 16 * s, fy - 20 * s); ctx.lineTo(x + 18 * s, fy + 18 * s); ctx.stroke();
  ctx.fillStyle = '#fff2c0'; polySpike(ctx, x + 16 * s, fy - 30 * s, x + 13 * s, fy - 18 * s, x + 19 * s, fy - 18 * s, '#fff2c0');
  glow(ctx, x, fy - 30 * s, 30 * s, '#fff2c0', .12);
}

function drawShadow(ctx, x, y, e, time) {
  const s = e.scale || 1;
  const fy = y - 20 * s + Math.sin(time * 2 + e.seed) * 3;
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(ctx, x, fy, 34 * s, '#b8a0ff', .13); ctx.restore();
  // smoke body
  ctx.fillStyle = 'rgba(35,28,55,.9)';
  ctx.beginPath();
  ctx.moveTo(x - 14 * s, y);
  ctx.quadraticCurveTo(x - 20 * s, fy, x - 8 * s, fy - 16 * s);
  ctx.quadraticCurveTo(x, fy - 26 * s, x + 8 * s, fy - 16 * s);
  ctx.quadraticCurveTo(x + 20 * s, fy, x + 14 * s, y);
  ctx.quadraticCurveTo(x, y + 8 * s, x - 14 * s, y);
  ctx.fill();
  // tendrils
  ctx.strokeStyle = 'rgba(120,100,180,.5)'; ctx.lineWidth = 2 * s;
  for (let i = 0; i < 4; i++) {
    const ph = time * 2 + i * 1.6;
    ctx.beginPath(); ctx.moveTo(x + (i - 1.5) * 5 * s, fy + 4 * s); ctx.quadraticCurveTo(x + Math.sin(ph) * 12 * s, fy + 18 * s, x + Math.cos(ph) * 6 * s, y); ctx.stroke();
  }
  // eyes
  ctx.fillStyle = e.palette?.[2] || '#b8a0ff'; ctx.beginPath(); ctx.ellipse(x - 4 * s, fy - 4 * s, 1.8 * s, 2.4 * s, 0, 0, 6.3); ctx.ellipse(x + 4 * s, fy - 4 * s, 1.8 * s, 2.4 * s, 0, 0, 6.3); ctx.fill();
}

function drawDemon(ctx, x, y, e, time) {
  const s = e.scale || 1;
  shadow(ctx, x, y + 1, 24 * s, 7 * s, .34);
  const sway = Math.sin(time * 1.8 + e.seed) * 1.5;
  // legs
  ctx.strokeStyle = '#3a1a18'; ctx.lineWidth = 6 * s; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x - 9 * s, y - 18 * s); ctx.lineTo(x - 13 * s, y); ctx.moveTo(x + 9 * s, y - 18 * s); ctx.lineTo(x + 13 * s, y); ctx.stroke();
  // body
  ctx.fillStyle = e.palette?.[0] || '#8f3b2e';
  ctx.beginPath(); ctx.ellipse(x, y - 34 * s, 16 * s, 19 * s, -.05, 0, 6.3); ctx.fill();
  ctx.strokeStyle = OUT; ctx.lineWidth = 1.3; ctx.stroke();
  // arms
  ctx.strokeStyle = '#5a2420'; ctx.lineWidth = 5 * s;
  ctx.beginPath(); ctx.moveTo(x - 14 * s, y - 42 * s); ctx.quadraticCurveTo(x - 28 * s, y - 30 * s, x - 25 * s, y - 15 * s); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x + 14 * s, y - 42 * s); ctx.quadraticCurveTo(x + 28 * s, y - 32 * s, x + 26 * s, y - 16 * s); ctx.stroke();
  // claws
  ctx.strokeStyle = '#d8c0a0'; ctx.lineWidth = 1.4 * s;
  for (let i = -1; i <= 1; i++) { ctx.beginPath(); ctx.moveTo(x - 25 * s + i * 3 * s, y - 15 * s); ctx.lineTo(x - 27 * s + i * 4 * s, y - 9 * s); ctx.stroke(); }
  // head
  ctx.fillStyle = '#6e2c24'; ctx.beginPath(); ctx.ellipse(x, y - 56 * s, 11 * s, 9 * s, 0, 0, 6.3); ctx.fill();
  // horns
  ctx.fillStyle = '#c8b090';
  polySpike(ctx, x - 8 * s, y - 62 * s, x - 18 * s, y - 76 * s, x - 4 * s, y - 64 * s, '#c8b090');
  polySpike(ctx, x + 8 * s, y - 62 * s, x + 18 * s, y - 76 * s, x + 4 * s, y - 64 * s, '#c8b090');
  ctx.fillStyle = '#ffce7a'; ctx.beginPath(); ctx.ellipse(x - 4 * s, y - 56 * s, 1.7 * s, 2 * s, 0, 0, 6.3); ctx.ellipse(x + 4 * s, y - 56 * s, 1.7 * s, 2 * s, 0, 0, 6.3); ctx.fill();
  glow(ctx, x, y - 56 * s, 14 * s, '#ff9a48', .2);
  // fire in hands
  glow(ctx, x - 25 * s, y - 15 * s, 12 * s, '#ff8a3e', .22);
  glow(ctx, x + 26 * s, y - 16 * s, 12 * s, '#ff8a3e', .22);
}

function drawBlob(ctx, x, y, e, time) {
  const s = e.scale || 1;
  const sq = 1 + Math.sin(time * 2.4 + e.seed) * .04;
  shadow(ctx, x, y + 1, 20 * s, 6 * s, .28);
  ctx.save(); ctx.translate(x, y); ctx.scale(1 / sq, sq);
  ctx.fillStyle = e.palette?.[0] || '#6f9e62';
  ctx.beginPath(); ctx.ellipse(0, -16 * s, 18 * s, 17 * s, 0, 0, 6.3); ctx.fill();
  ctx.strokeStyle = OUT; ctx.lineWidth = 1.2; ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,.14)'; ctx.beginPath(); ctx.ellipse(-5 * s, -24 * s, 8 * s, 6 * s, -.4, 0, 6.3); ctx.fill();
  // moss patches
  ctx.fillStyle = '#8fc47a'; for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.arc(-10 * s + i * 7 * s, -26 * s + (i % 2) * 5 * s, 3 * s, 0, 6.3); ctx.fill(); }
  ctx.fillStyle = '#1d2a1d'; ctx.beginPath(); ctx.ellipse(-5 * s, -15 * s, 1.8 * s, 2.4 * s, 0, 0, 6.3); ctx.ellipse(5 * s, -15 * s, 1.8 * s, 2.4 * s, 0, 0, 6.3); ctx.fill();
  ctx.strokeStyle = '#2a3a2a'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(0, -9 * s, 4 * s, .3, 2.8); ctx.stroke();
  ctx.restore();
}

function drawSprite(ctx, x, y, e, time) {
  const s = e.scale || 1;
  const fy = y - 22 * s + Math.sin(time * 1.8 + e.seed) * 4;
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(ctx, x, fy, 34 * s, '#8fd8e8', .13); ctx.restore();
  // water dress
  ctx.fillStyle = 'rgba(90,170,210,.7)';
  ctx.beginPath(); ctx.moveTo(x - 10 * s, fy - 6 * s); ctx.quadraticCurveTo(x - 18 * s, y, x - 6 * s, y + 2 * s); ctx.lineTo(x + 6 * s, y + 2 * s); ctx.quadraticCurveTo(x + 18 * s, y, x + 10 * s, fy - 6 * s); ctx.closePath(); ctx.fill();
  ctx.fillStyle = 'rgba(180,235,250,.85)';
  ctx.beginPath(); ctx.arc(x, fy - 18 * s, 8 * s, 0, 6.3); ctx.fill();
  ctx.fillStyle = '#2a5d72'; ctx.beginPath(); ctx.ellipse(x - 3 * s, fy - 19 * s, 1.1 * s, 1.6 * s, 0, 0, 6.3); ctx.ellipse(x + 3 * s, fy - 19 * s, 1.1 * s, 1.6 * s, 0, 0, 6.3); ctx.fill();
  // hair waves
  ctx.strokeStyle = 'rgba(140,215,240,.8)'; ctx.lineWidth = 2 * s;
  for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(x - 6 * s + i * 6 * s, fy - 24 * s); ctx.quadraticCurveTo(x - 10 * s + i * 8 * s + Math.sin(time * 2 + i) * 3, fy - 8 * s, x - 8 * s + i * 7 * s, fy + 2 * s); ctx.stroke(); }
}

export function drawEnemy(ctx, e, cam, time) {
  const x = e.x - cam.x, y = e.y - cam.y;
  if (x < -120 || y < -180 || x > cam.w + 120 || y > cam.h + 120) return;
  const t = e.data.draw;
  if (e.hurtFlash > 0) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(ctx, x, y - 25, 30, '#ff6060', e.hurtFlash * .15); ctx.restore(); }
  switch (t) {
    case 'wolf': wolf(ctx, x, y, e, time); break;
    case 'wisp': wisp(ctx, x, y, e, time); break;
    case 'golem': golem(ctx, x, y, e, time); break;
    case 'guardian': drawGuardian(ctx, x, y, e, time); break;
    case 'knight': drawKnight(ctx, x, y, e, time, e.data.boss); break;
    case 'malachar': drawMalachar(ctx, x, y, e, time); break;
    case 'seraphine': drawSeraphine(ctx, x, y, e, time); break;
    case 'salamander': drawSalamander(ctx, x, y, e, time); break;
    case 'bandit': drawHumanEnemy(ctx, x, y, e, time, 'bandit'); break;
    case 'cultist': drawHumanEnemy(ctx, x, y, e, time, 'cultist'); break;
    case 'sentinel': drawHumanEnemy(ctx, x, y, e, time, 'sentinel'); break;
    case 'seraph': drawSeraph(ctx, x, y, e, time); break;
    case 'shadow': drawShadow(ctx, x, y, e, time); break;
    case 'demon': drawDemon(ctx, x, y, e, time); break;
    case 'blob': drawBlob(ctx, x, y, e, time); break;
    case 'sprite': drawSprite(ctx, x, y, e, time); break;
    default: wolf(ctx, x, y, e, time);
  }
  // hp pip for non-boss
  if (!e.data.boss && e.hp < e.maxHp && e.hp > 0) {
    const w = e.data.draw === 'guardian' ? 54 : 32;
    ctx.fillStyle = 'rgba(5,8,12,.7)'; ctx.fillRect(x - w / 2, y + 6, w, 3);
    ctx.fillStyle = '#e45d62'; ctx.fillRect(x - w / 2, y + 6, w * (e.hp / e.maxHp), 3);
  }
  // tame indicator
  if (e.creatureId && e.hp / e.maxHp < .32 && e.hp > 0) {
    ctx.fillStyle = `rgba(180,160,255,${.6 + Math.sin(time * 4) * .3})`;
    ctx.font = '10px Georgia'; ctx.textAlign = 'center';
    ctx.fillText('✦', x, y - 12);
  }
}

// ============ CREATURES ============
export function drawCreature(ctx, id, x, y, scale = 1, time = 0, opts = {}) {
  const c = CREATURES[id];
  if (!c) return;
  const s = scale * (opts.scale || 1);
  const p = c.palette;
  const bob = Math.sin(time * 2 + (opts.seed || 0)) * 2;
  if (!opts.noShadow) shadow(ctx, x, y + 1, 13 * s, 4 * s, .24);
  ctx.save(); ctx.translate(x, y - bob);
  if (opts.flip) ctx.scale(-1, 1);
  switch (c.draw) {
    case 'fox': {
      ctx.strokeStyle = p[1]; ctx.lineWidth = 3 * s; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(-9 * s, -11 * s); ctx.quadraticCurveTo(-20 * s, -20 * s, -22 * s, -8 * s); ctx.stroke();
      ctx.fillStyle = p[1]; ctx.beginPath(); ctx.ellipse(0, -13 * s, 12 * s, 7 * s, 0, 0, 6.3); ctx.fill();
      ctx.fillStyle = p[0]; ctx.beginPath(); ctx.ellipse(0, -15 * s, 11 * s, 6 * s, 0, 0, 6.3); ctx.fill();
      ctx.fillStyle = p[0]; ctx.beginPath(); ctx.arc(10 * s, -19 * s, 6.5 * s, 0, 6.3); ctx.fill();
      polySpike(ctx, 6 * s, -24 * s, 5 * s, -31 * s, 10 * s, -24 * s, p[1]);
      polySpike(ctx, 12 * s, -24 * s, 14 * s, -31 * s, 16 * s, -23 * s, p[1]);
      ctx.fillStyle = '#2a2230'; ctx.beginPath(); ctx.arc(12 * s, -20 * s, 1.1 * s, 0, 6.3); ctx.fill();
      ctx.fillStyle = p[2]; ctx.beginPath(); ctx.arc(16 * s, -16 * s, 1.8 * s, 0, 6.3); ctx.fill();
      glow(ctx, 0, -16 * s, 14 * s, p[0], .12);
      break;
    }
    case 'moth': {
      for (const dir of [-1, 1]) {
        ctx.save(); ctx.translate(0, -18 * s); ctx.rotate(dir * (0.5 + Math.sin(time * 7) * .25));
        ctx.fillStyle = rgba(p[0], .8);
        ctx.beginPath(); ctx.ellipse(dir * 9 * s, 0, 10 * s, 6 * s, dir * .3, 0, 6.3); ctx.fill();
        ctx.strokeStyle = rgba(p[1], .6); ctx.lineWidth = 1; ctx.stroke();
        ctx.restore();
      }
      ctx.fillStyle = p[1]; ctx.beginPath(); ctx.ellipse(0, -18 * s, 3 * s, 9 * s, 0, 0, 6.3); ctx.fill();
      ctx.fillStyle = p[2]; ctx.beginPath(); ctx.arc(0, -26 * s, 2.4 * s, 0, 6.3); ctx.fill();
      glow(ctx, 0, -20 * s, 16 * s, p[0], .15);
      break;
    }
    case 'blob': {
      ctx.fillStyle = p[1]; ctx.beginPath(); ctx.ellipse(0, -10 * s, 13 * s, 11 * s, 0, 0, 6.3); ctx.fill();
      ctx.fillStyle = p[0]; ctx.beginPath(); ctx.ellipse(0, -12 * s, 11 * s, 9 * s, 0, 0, 6.3); ctx.fill();
      ctx.fillStyle = '#22301f'; ctx.beginPath(); ctx.arc(-3 * s, -13 * s, 1.2 * s, 0, 6.3); ctx.arc(3 * s, -13 * s, 1.2 * s, 0, 6.3); ctx.fill();
      ctx.fillStyle = p[2]; for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(-6 * s + i * 5 * s, -20 * s, 2 * s, 0, 6.3); ctx.fill(); }
      break;
    }
    case 'sprite': {
      ctx.fillStyle = rgba(p[1], .6); ctx.beginPath(); ctx.moveTo(-7 * s, -6 * s); ctx.quadraticCurveTo(0, -18 * s, 7 * s, -6 * s); ctx.lineTo(4 * s, 2 * s); ctx.lineTo(-4 * s, 2 * s); ctx.closePath(); ctx.fill();
      ctx.fillStyle = p[0]; ctx.beginPath(); ctx.arc(0, -18 * s, 6 * s, 0, 6.3); ctx.fill();
      ctx.fillStyle = '#24445a'; ctx.beginPath(); ctx.arc(-2 * s, -18 * s, 1 * s, 0, 6.3); ctx.arc(2 * s, -18 * s, 1 * s, 0, 6.3); ctx.fill();
      glow(ctx, 0, -16 * s, 14 * s, p[0], .12);
      break;
    }
    case 'rock': {
      ctx.fillStyle = p[1]; ctx.beginPath(); ctx.moveTo(-11 * s, 0); ctx.lineTo(-9 * s, -12 * s); ctx.lineTo(-2 * s, -17 * s); ctx.lineTo(8 * s, -14 * s); ctx.lineTo(12 * s, 0); ctx.closePath(); ctx.fill();
      ctx.fillStyle = p[0]; ctx.beginPath(); ctx.moveTo(-8 * s, -10 * s); ctx.lineTo(-2 * s, -16 * s); ctx.lineTo(4 * s, -11 * s); ctx.lineTo(0, -5 * s); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#2a2620'; ctx.beginPath(); ctx.arc(-2 * s, -8 * s, 1 * s, 0, 6.3); ctx.arc(3 * s, -8 * s, 1 * s, 0, 6.3); ctx.fill();
      break;
    }
    case 'bird': {
      ctx.fillStyle = p[0]; ctx.beginPath(); ctx.ellipse(0, -16 * s, 8 * s, 6 * s, -.2, 0, 6.3); ctx.fill();
      ctx.fillStyle = p[1]; ctx.beginPath(); ctx.ellipse(1 * s, -14 * s, 6 * s, 4 * s, -.2, 0, 6.3); ctx.fill();
      ctx.fillStyle = p[0]; ctx.beginPath(); ctx.arc(7 * s, -22 * s, 4 * s, 0, 6.3); ctx.fill();
      ctx.fillStyle = '#e8b050'; polySpike(ctx, 10 * s, -22 * s, 15 * s, -21 * s, 10 * s, -19 * s, '#e8b050');
      ctx.fillStyle = '#ffd878'; ctx.beginPath(); ctx.arc(8 * s, -23 * s, .9 * s, 0, 6.3); ctx.fill();
      ctx.strokeStyle = p[1]; ctx.lineWidth = 2 * s; ctx.beginPath(); ctx.moveTo(-6 * s, -14 * s); ctx.lineTo(-13 * s, -6 * s); ctx.stroke();
      break;
    }
    case 'lizard': {
      ctx.strokeStyle = p[1]; ctx.lineWidth = 2.4 * s; ctx.beginPath(); ctx.moveTo(-8 * s, -10 * s); ctx.quadraticCurveTo(-18 * s, -16 * s, -20 * s, -6 * s); ctx.stroke();
      ctx.fillStyle = p[1]; ctx.beginPath(); ctx.ellipse(0, -10 * s, 11 * s, 6 * s, 0, 0, 6.3); ctx.fill();
      ctx.fillStyle = p[0]; ctx.beginPath(); ctx.ellipse(0, -12 * s, 10 * s, 5 * s, 0, 0, 6.3); ctx.fill();
      ctx.fillStyle = p[0]; ctx.beginPath(); ctx.arc(9 * s, -15 * s, 5 * s, 0, 6.3); ctx.fill();
      ctx.fillStyle = '#2a1414'; ctx.beginPath(); ctx.arc(11 * s, -16 * s, .9 * s, 0, 6.3); ctx.fill();
      ctx.fillStyle = '#ffd27a'; polySpike(ctx, -3 * s, -17 * s, 0, -24 * s, 3 * s, -16 * s, '#ffd27a');
      glow(ctx, 0, -12 * s, 12 * s, p[0], .12);
      break;
    }
    case 'hound': {
      ctx.strokeStyle = p[1]; ctx.lineWidth = 2.2 * s; ctx.beginPath(); ctx.moveTo(-8 * s, -9 * s); ctx.lineTo(-15 * s, -16 * s); ctx.stroke();
      ctx.fillStyle = p[1]; ctx.beginPath(); ctx.ellipse(0, -10 * s, 11 * s, 6 * s, 0, 0, 6.3); ctx.fill();
      ctx.fillStyle = p[0]; ctx.beginPath(); ctx.ellipse(3 * s, -13 * s, 8 * s, 5 * s, 0, 0, 6.3); ctx.fill();
      ctx.beginPath(); ctx.arc(9 * s, -16 * s, 4.5 * s, 0, 6.3); ctx.fill();
      polySpike(ctx, 6 * s, -20 * s, 5 * s, -26 * s, 9 * s, -20 * s, p[1]);
      ctx.fillStyle = '#ff9a68'; ctx.beginPath(); ctx.arc(10 * s, -16 * s, 1 * s, 0, 6.3); ctx.fill();
      break;
    }
    case 'golem': {
      ctx.fillStyle = p[1]; roundRect(ctx, -9 * s, -16 * s, 18 * s, 14 * s, 3 * s); ctx.fill();
      ctx.fillStyle = p[0]; ctx.beginPath(); ctx.arc(0, -20 * s, 7 * s, 0, 6.3); ctx.fill();
      ctx.fillStyle = p[2]; ctx.beginPath(); ctx.arc(0, -16 * s, 2 * s, 0, 6.3); ctx.fill();
      glow(ctx, 0, -16 * s, 10 * s, p[2], .25);
      break;
    }
    case 'firefly': {
      glow(ctx, 0, -20 * s, 20 * s, p[0], .25);
      ctx.fillStyle = p[1]; ctx.beginPath(); ctx.ellipse(0, -18 * s, 3 * s, 7 * s, 0, 0, 6.3); ctx.fill();
      ctx.fillStyle = p[0]; ctx.beginPath(); ctx.arc(0, -26 * s, 2.5 * s, 0, 6.3); ctx.fill();
      for (const dir of [-1, 1]) { ctx.fillStyle = 'rgba(255,245,200,.5)'; ctx.beginPath(); ctx.ellipse(dir * 6 * s, -22 * s, 4 * s, 2 * s, dir * .4, 0, 6.3); ctx.fill(); }
      break;
    }
    case 'griffin': {
      ctx.fillStyle = p[1]; ctx.beginPath(); ctx.ellipse(0, -12 * s, 10 * s, 6 * s, 0, 0, 6.3); ctx.fill();
      ctx.fillStyle = p[0]; ctx.beginPath(); ctx.ellipse(1 * s, -15 * s, 8 * s, 5 * s, 0, 0, 6.3); ctx.fill();
      for (const dir of [-1, 1]) { ctx.fillStyle = 'rgba(240,232,200,.85)'; ctx.beginPath(); ctx.moveTo(dir * 4 * s, -18 * s); ctx.quadraticCurveTo(dir * 16 * s, -30 * s, dir * 19 * s, -14 * s); ctx.quadraticCurveTo(dir * 10 * s, -14 * s, dir * 3 * s, -12 * s); ctx.fill(); }
      ctx.fillStyle = p[0]; ctx.beginPath(); ctx.arc(10 * s, -23 * s, 4.5 * s, 0, 6.3); ctx.fill();
      ctx.fillStyle = '#e8b050'; polySpike(ctx, 13 * s, -23 * s, 18 * s, -22 * s, 13 * s, -20 * s, '#e8b050');
      break;
    }
    case 'aurora': {
      glow(ctx, 0, -20 * s, 30 * s, '#cfd8ff', .22);
      ctx.strokeStyle = 'rgba(190,210,255,.8)'; ctx.lineWidth = 2 * s;
      for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(-8 * s, -10 * s); ctx.quadraticCurveTo(-20 * s - i * 4 * s, -22 * s, -24 * s - i * 5 * s, -12 * s + i * 4 * s); ctx.stroke(); }
      ctx.fillStyle = p[1]; ctx.beginPath(); ctx.ellipse(0, -15 * s, 11 * s, 7 * s, 0, 0, 6.3); ctx.fill();
      ctx.fillStyle = p[0]; ctx.beginPath(); ctx.ellipse(0, -17 * s, 10 * s, 6 * s, 0, 0, 6.3); ctx.fill();
      ctx.fillStyle = p[0]; ctx.beginPath(); ctx.arc(10 * s, -22 * s, 6 * s, 0, 6.3); ctx.fill();
      polySpike(ctx, 6 * s, -27 * s, 4 * s, -34 * s, 10 * s, -27 * s, p[1]);
      polySpike(ctx, 12 * s, -27 * s, 15 * s, -34 * s, 16 * s, -26 * s, p[1]);
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(12 * s, -23 * s, 1.1 * s, 0, 6.3); ctx.fill();
      for (let i = 0; i < 4; i++) { ctx.fillStyle = `rgba(230,220,255,${.3 + Math.sin(time * 2 + i) * .2})`; ctx.beginPath(); ctx.arc(Math.cos(time + i * 1.5) * 16 * s, -24 * s + Math.sin(time * 1.3 + i) * 14 * s, 1.1 * s, 0, 6.3); ctx.fill(); }
      break;
    }
  }
  ctx.restore();
}

// ============ PORTRAITS ============
const PORTRAIT_LOOKS = {
  nara: { skin: '#e8b98f', hair: '#4a2b2b', hairStyle: 1, outfit: '#3c4f78', accent: '#d8b06a', accessory: 2, neck: true },
  borin: { skin: '#c9926b', hair: '#b8b0a0', hairStyle: 3, outfit: '#5c3d2b', accent: '#8a6242', beard: true, neck: true },
  elara: { skin: '#e8c09a', hair: '#6a3d2a', hairStyle: 2, outfit: '#3d5a3f', accent: '#b8c87a', neck: true },
  tomo: { skin: '#d8a878', hair: '#8a6a42', hairStyle: 0, outfit: '#5d4a4a', accent: '#b09060', neck: true },
  sibil: { skin: '#f0d8c8', hair: '#e8e8f0', hairStyle: 0, outfit: '#cfd8ee', accent: '#a8c8ff', glow: true, neck: true },
  ren: { skin: '#c88f68', hair: '#2b2420', hairStyle: 3, outfit: '#4a5570', accent: '#8a9ab0', helmet: true, neck: true },
  mira: { skin: '#e8b890', hair: '#c87a3a', hairStyle: 2, outfit: '#6a4a3a', accent: '#d8b07a', neck: true },
  lyra: { skin: '#d8a078', hair: '#b84a3a', hairStyle: 1, outfit: '#6a3a3a', accent: '#e8a85a', neck: true },
  rhea: { skin: '#b87a58', hair: '#2a2028', hairStyle: 3, outfit: '#5a2e30', accent: '#c86a4a', helmet: true, scar: true, neck: true },
  ash: { skin: '#9a6a52', hair: '#3a2a28', hairStyle: 3, outfit: '#4a3030', accent: '#a05838', beard: true, neck: true },
  veyra: { skin: '#e8c8b0', hair: '#d8d0e8', hairStyle: 0, outfit: '#bab4c8', accent: '#e8d8a0', glow: true, neck: true },
  sel: { skin: '#d8b090', hair: '#5a4a6a', hairStyle: 2, outfit: '#4a4468', accent: '#a898d8', neck: true },
  kael: { skin: '#c8a080', hair: '#3a3038', hairStyle: 1, outfit: '#3a3e52', accent: '#8a7ab8', helmet: true, scar: true, neck: true },
  hero: HERO_LOOK_DEFAULT
};

export function drawPortrait(canvas, id, playerLook, time = 0) {
  const ctx = canvas.getContext('2d');
  const w = canvas.width, h = canvas.height;
  ctx.clearRect(0, 0, w, h);
  const look = id === 'hero' || id === 'player' ? { ...HERO_LOOK_DEFAULT, ...playerLook, accessory: 0, helmet: false } : (PORTRAIT_LOOKS[id] || PORTRAIT_LOOKS.nara);
  const bg = ctx.createRadialGradient(w * .5, h * .35, 4, w * .5, h * .55, w * .7);
  bg.addColorStop(0, look.glow ? 'rgba(70,80,120,.8)' : 'rgba(48,58,88,.8)');
  bg.addColorStop(1, 'rgba(8,10,20,.98)');
  ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h);
  // rim light
  const rim = ctx.createLinearGradient(0, 0, w, 0);
  rim.addColorStop(0, 'rgba(255,220,140,.08)'); rim.addColorStop(.5, 'rgba(255,255,255,0)'); rim.addColorStop(1, 'rgba(255,220,140,.05)');
  ctx.fillStyle = rim; ctx.fillRect(0, 0, w, h);
  // runes
  ctx.strokeStyle = 'rgba(230,190,110,.12)'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.arc(w * .5, h * .46, w * .34, 0, 6.3); ctx.stroke();
  ctx.beginPath(); ctx.arc(w * .5, h * .46, w * .28, .4, 2.4); ctx.stroke();
  const scale = Math.min(w, h) / 34;
  drawHumanoid(ctx, w * .5, h * 1.86, { look, facing: 'down', moving: false, phase: 0, time, scale, weapon: false, seed: 2 });
  // vignette
  const vg = ctx.createRadialGradient(w * .5, h * .45, w * .2, w * .5, h * .5, w * .75);
  vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,.55)');
  ctx.fillStyle = vg; ctx.fillRect(0, 0, w, h);
}

export { drawWeapon, drawCape, PORTRAIT_LOOKS };
