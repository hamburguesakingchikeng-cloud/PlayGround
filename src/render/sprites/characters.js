import { TAU, clamp, rgba } from '../../core/utils.js';
import { ITEMS } from '../../data/items.js';
import { PORTRAITS } from '../../data/story.js';
import { shadow, glowCircle, line, roundRect, humanHair, eye } from './common.js';

function drawWeapon(ctx, type, color, side, swing, heavy) {
  ctx.save();
  ctx.rotate(swing);
  if (type === 'greatsword') {
    ctx.fillStyle = '#3a2a20';
    ctx.fillRect(-2.5, -3, 5, 12);
    ctx.fillStyle = '#c8b080';
    ctx.fillRect(-9, -5, 18, 3);
    const g = ctx.createLinearGradient(0, -8, 0, -52);
    g.addColorStop(0, '#f4f0e8');
    g.addColorStop(0.55, color);
    g.addColorStop(1, '#8a9ab0');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(-5, -6);
    ctx.lineTo(-4, -48);
    ctx.lineTo(0, -56);
    ctx.lineTo(4, -48);
    ctx.lineTo(5, -6);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, -10); ctx.lineTo(0, -48); ctx.stroke();
  } else if (type === 'spear') {
    ctx.strokeStyle = '#8a6a48'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(0, 4); ctx.lineTo(0, -58); ctx.stroke();
    ctx.fillStyle = '#e8f4ff';
    ctx.beginPath(); ctx.moveTo(0, -74); ctx.lineTo(5, -56); ctx.lineTo(0, -50); ctx.lineTo(-5, -56); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = color; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, -70); ctx.lineTo(0, -54); ctx.stroke();
  } else if (type === 'staff') {
    ctx.strokeStyle = '#5a4030'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(0, 8); ctx.lineTo(0, -46); ctx.stroke();
    glowCircle(ctx, 0, -52, 18, color, 0.45);
    ctx.fillStyle = color;
    ctx.beginPath(); ctx.arc(0, -52, 5, 0, TAU); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(0, -52, 8, 0, TAU); ctx.stroke();
  } else {
    ctx.fillStyle = '#3a2a20';
    ctx.fillRect(-2, -2, 4, 10);
    ctx.fillStyle = '#c8b080';
    ctx.fillRect(-7, -4, 14, 3);
    const g = ctx.createLinearGradient(0, -6, 0, -38);
    g.addColorStop(0, '#ffffff');
    g.addColorStop(0.6, color);
    g.addColorStop(1, '#8a9ab0');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(-3, -4);
    ctx.lineTo(-2.5, -34);
    ctx.lineTo(0, -42);
    ctx.lineTo(2.5, -34);
    ctx.lineTo(3, -4);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, -8); ctx.lineTo(0, -34); ctx.stroke();
  }
  ctx.restore();
}

export function drawHumanoid(ctx, x, y, opts = {}) {
  const {
    appearance = {}, anim = 'idle', animTime = 0, facing = Math.PI / 2, scale = 1,
    weapon = null, weaponType = 'sword', weaponColor = '#d8d2c4', armorColor = null,
    helmetColor = null, accessoryColor = null, capeColor = null, palette = null,
    npc = false, dead = false, flash = 0, blocking = false, showCape = true,
  } = opts;
  const t = animTime;
  const a = appearance;
  const skin = palette?.skin || a.skin || '#e8c9a8';
  const hairColor = palette?.hair || a.hairColor || '#3a2a1a';
  const outfit = palette?.cloth || a.outfit || '#4a6a4a';
  const armor = armorColor || a.armorColor || outfit;
  const cape = capeColor || a.capeColor || '#7a3a4a';
  const eyeColor = a.eyeColor || '#4a7a8a';
  const moving = anim === 'walk' || anim === 'run';
  const run = anim === 'run';
  const swing = moving ? Math.sin(t * (run ? 14 : 9)) : 0;
  const bob = moving ? Math.abs(Math.sin(t * (run ? 14 : 9))) * (run ? 2.6 : 1.4) : Math.sin(t * 2.2) * 0.7;
  const side = Math.cos(facing) < -0.15 ? -1 : 1;
  const fy = Math.sin(facing);
  const attack = anim.startsWith('attack') || anim === 'heavy';
  const attackT = attack ? clamp(t / (anim === 'heavy' ? 0.5 : 0.32), 0, 1) : 0;
  const swingAngle = attack
    ? (anim === 'heavy' ? -1.9 + attackT * 3.4 : -1.45 + attackT * 2.8) * side
    : (blocking ? -0.15 * side : -0.45 * side);
  const dodge = anim === 'dodge';
  const cast = anim === 'cast';
  const lean = dodge ? 10 * side : 0;

  ctx.save();
  ctx.translate(x + lean * 0.3, y - bob);
  ctx.scale(scale, scale);
  if (dead) {
    ctx.translate(0, -6);
    ctx.rotate(side * Math.PI * 0.46);
    ctx.globalAlpha = 0.82;
  }
  shadow(ctx, -lean * 0.3, 2 + bob, 12, 4.5, 0.3);

  // Piernas.
  const legSwing = moving ? swing * (run ? 6 : 4) : 0;
  ctx.fillStyle = '#2a2230';
  roundRect(ctx, -7 + legSwing, -15, 6, 16, 3); ctx.fill();
  roundRect(ctx, 1 - legSwing, -15, 6, 16, 3); ctx.fill();
  ctx.fillStyle = '#1a141c';
  roundRect(ctx, -8 + legSwing, -3, 8, 4, 2); ctx.fill();
  roundRect(ctx, 0 - legSwing, -3, 8, 4, 2); ctx.fill();

  // Capa.
  if (showCape && a.cape !== false) {
    const sway = Math.sin(t * (moving ? 8 : 2.4)) * (moving ? 5 : 2);
    ctx.fillStyle = cape;
    ctx.globalAlpha = 0.92;
    ctx.beginPath();
    ctx.moveTo(-9, -34);
    ctx.quadraticCurveTo(-15 - sway, -18, -13 - sway, 0);
    ctx.lineTo(4 + sway, -2);
    ctx.quadraticCurveTo(13 + sway, -18, 9, -34);
    ctx.closePath(); ctx.fill();
    ctx.globalAlpha = 1;
    ctx.strokeStyle = 'rgba(255,255,255,0.12)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(-8, -32); ctx.quadraticCurveTo(-10 - sway, -16, -10 - sway, -2); ctx.stroke();
  }

  // Torso.
  const bodyGrad = ctx.createLinearGradient(0, -36, 0, -10);
  bodyGrad.addColorStop(0, armor);
  bodyGrad.addColorStop(1, '#2a2230');
  ctx.fillStyle = bodyGrad;
  roundRect(ctx, -10, -36, 20, 25, 5); ctx.fill();
  ctx.fillStyle = rgba('#ffffff', 0.12);
  roundRect(ctx, -9, -35, 8, 18, 4); ctx.fill();

  if (armorColor || npc) {
    ctx.strokeStyle = 'rgba(255,255,255,0.2)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(-9, -26); ctx.lineTo(9, -26); ctx.stroke();
    ctx.fillStyle = '#c8b080';
    ctx.fillRect(-11, -25, 22, 3);
  }
  // Cinturón.
  ctx.fillStyle = '#4a3524';
  ctx.fillRect(-10, -16, 20, 4);
  ctx.fillStyle = '#c8b080';
  ctx.fillRect(-2, -16, 4, 4);

  // Hombros / brazos.
  const armSwing = moving ? swing * (run ? 5 : 3) : 0;
  ctx.strokeStyle = skin;
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-9, -32);
  ctx.lineTo(-12 + armSwing, -20);
  ctx.stroke();
  const handX = 12 + (attack ? Math.cos(swingAngle) * 4 : 0);
  const handY = -22 + (attack ? Math.sin(swingAngle) * 2 : 0);
  ctx.beginPath();
  ctx.moveTo(9, -32);
  ctx.lineTo(handX, handY);
  ctx.stroke();
  ctx.fillStyle = skin;
  ctx.beginPath(); ctx.arc(handX, handY, 2.4, 0, TAU); ctx.fill();

  if (cast) {
    glowCircle(ctx, -13 + armSwing, -26, 18, '#ffe7a8', 0.4);
  }

  // Cabeza.
  const headY = -46;
  ctx.fillStyle = skin;
  ctx.beginPath(); ctx.arc(0, headY, 9, 0, TAU); ctx.fill();
  ctx.fillStyle = 'rgba(0,0,0,0.1)';
  ctx.beginPath(); ctx.ellipse(0, headY + 7, 7, 3, 0, 0, TAU); ctx.fill();

  const hasHelmet = a.helmet || helmetColor;
  if (!hasHelmet) {
    humanHair(ctx, a.hairStyle ?? 0, hairColor, headY, 9, facing, t);
  } else {
    ctx.fillStyle = helmetColor || '#9fc9d8';
    ctx.beginPath();
    ctx.arc(0, headY - 1, 9.6, Math.PI, TAU);
    ctx.lineTo(9.6, headY + 2);
    ctx.lineTo(5, headY + 2);
    ctx.lineTo(4, headY + 8);
    ctx.lineTo(-4, headY + 8);
    ctx.lineTo(-5, headY + 2);
    ctx.lineTo(-9.6, headY + 2);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.4)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, headY - 10); ctx.lineTo(0, headY + 8); ctx.stroke();
    ctx.fillStyle = '#c8b080';
    ctx.fillRect(-10, headY - 2, 20, 2);
    if ((a.helmetPlume ?? true) && a.cape !== false) {
      ctx.fillStyle = cape;
      ctx.beginPath(); ctx.moveTo(0, headY - 10); ctx.quadraticCurveTo(-6, headY - 20, -12, headY - 12); ctx.quadraticCurveTo(-6, headY - 10, 0, headY - 7); ctx.fill();
    }
  }

  // Rasgos faciales.
  if (fy > -0.45) {
    const ex = side * 1.8;
    eye(ctx, -3.4 + ex, headY + 1, 1.45, eyeColor);
    eye(ctx, 3.4 + ex, headY + 1, 1.45, eyeColor);
    ctx.strokeStyle = 'rgba(80,40,40,0.6)';
    ctx.lineWidth = 0.8;
    ctx.beginPath(); ctx.arc(ex, headY + 5.4, 2.2, 0.15, Math.PI - 0.15); ctx.stroke();
  } else {
    ctx.fillStyle = hairColor;
    ctx.beginPath(); ctx.arc(0, headY, 8.6, 0, TAU); ctx.fill();
  }

  // Arma.
  if (weapon && !npc) {
    ctx.save();
    ctx.translate(handX, handY);
    if (blocking) {
      ctx.translate(-side * 2, 0);
      ctx.rotate(side * -0.1);
    }
    drawWeapon(ctx, weaponType, weaponColor, side, swingAngle, anim === 'heavy');
    ctx.restore();
  }

  // Accesorio brillante.
  if (accessoryColor) {
    glowCircle(ctx, 0, -28, 13, accessoryColor, 0.28);
    ctx.fillStyle = accessoryColor;
    ctx.beginPath(); ctx.arc(0, -27, 2.2, 0, TAU); ctx.fill();
  }
  if (flash > 0) {
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = clamp(flash * 6, 0, 0.65);
    ctx.fillStyle = '#fff3c4';
    roundRect(ctx, -12, -52, 24, 54, 8); ctx.fill();
  }
  ctx.restore();
}

export function drawPlayer(ctx, player, time) {
  const inv = player.game.inventory;
  const weapon = inv?.weapon?.();
  const armorId = inv?.equipment?.armor;
  const helmetId = inv?.equipment?.helmet;
  const accId = inv?.equipment?.accessory;
  const armorItem = armorId ? ITEMS[armorId] : null;
  const helmetItem = helmetId ? ITEMS[helmetId] : null;
  const accItem = accId ? ITEMS[accId] : null;
  drawHumanoid(ctx, player.x, player.y, {
    appearance: player.appearance,
    anim: player.dead ? 'dead' : player.anim,
    animTime: player.animTime,
    facing: player.facing,
    scale: 1,
    weapon: weapon?.id || 'rusty_sword',
    weaponType: weapon?.weaponType || 'sword',
    weaponColor: weapon?.color || '#d8d2c4',
    armorColor: armorItem?.color || player.appearance.armorColor,
    helmetColor: helmetItem?.color || null,
    accessoryColor: accItem?.color || null,
    capeColor: player.appearance.capeColor,
    blocking: player.blocking,
    flash: player.hurtFlash,
    dead: player.dead,
    showCape: player.appearance.cape,
  });
  if (player.status?.veil) {
    ctx.save(); ctx.globalAlpha = 0.25;
    ctx.fillStyle = '#7d6a9e';
    ctx.beginPath(); ctx.arc(player.x, player.y - 24, 24, 0, TAU); ctx.fill(); ctx.restore();
  }
  if (player.status?.shield) {
    glowCircle(ctx, player.x, player.y - 22, 30, '#9fe8ff', 0.2);
    ctx.strokeStyle = 'rgba(159,232,255,0.45)'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(player.x, player.y - 22, 24, 0, TAU); ctx.stroke();
  }
  if (player.status?.regen) {
    if (Math.random() < 0.15) {
      player.game.particles.spawn('spark', player.x + (Math.random() - 0.5) * 20, player.y - Math.random() * 30, { color: '#8fd18a', size: 2, life: 0.6, speed: 12 });
    }
  }
}

export function drawNpc(ctx, npc, time) {
  const p = PORTRAITS[npc.id] || { name: npc.id, skin: '#d8b890', hair: '#3a2a1a', cloth: '#5a4a4a', accent: '#d9b46a' };
  const special = npc.id === 'aurel' || npc.id === 'echo' || npc.id === 'vela';
  drawHumanoid(ctx, npc.x, npc.y, {
    appearance: {
      skin: p.skin, hairColor: p.hair, hairStyle: npc.id === 'maren' ? 1 : npc.id === 'lyra' ? 2 : npc.id === 'kael' ? 0 : 3,
      eyeColor: p.accent, outfit: p.cloth, armorColor: npc.id === 'kael' ? '#5a5a6a' : null,
      cape: npc.id === 'kael' || npc.id === 'aurel', capeColor: p.cloth,
      helmet: npc.id === 'kael', helmetPlume: true,
    },
    anim: 'idle', animTime: time + (npc.x % 10), facing: Math.PI / 2 + Math.sin(time * 0.5 + npc.x) * 0.3,
    scale: npc.id === 'aurel' ? 0.9 : 1,
    npc: true, accessoryColor: p.accent,
    showCape: npc.id !== 'maren' && npc.id !== 'sela' && npc.id !== 'elina',
  });
  if (special || npc.id === 'aurel') {
    glowCircle(ctx, npc.x, npc.y - 26, 34, p.accent, 0.14);
    if (npc.id === 'aurel') {
      // Orejas y cola de zorro para el eco.
      ctx.fillStyle = p.accent;
      ctx.beginPath(); ctx.moveTo(npc.x - 8, npc.y - 54); ctx.lineTo(npc.x - 12, npc.y - 64); ctx.lineTo(npc.x - 3, npc.y - 58); ctx.fill();
      ctx.beginPath(); ctx.moveTo(npc.x + 8, npc.y - 54); ctx.lineTo(npc.x + 12, npc.y - 64); ctx.lineTo(npc.x + 3, npc.y - 58); ctx.fill();
      ctx.strokeStyle = p.accent; ctx.lineWidth = 4; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(npc.x + 8, npc.y - 16); ctx.quadraticCurveTo(npc.x + 26, npc.y - 12 + Math.sin(time * 2) * 4, npc.x + 22, npc.y - 30); ctx.stroke();
    }
  }
  if (npc.id === 'survivor1' || npc.id === 'survivor2' || npc.id === 'survivor3' || npc.id === 'survivor4') {
    // Los supervivientes llevan capas raídas.
    ctx.strokeStyle = 'rgba(40,30,26,0.4)'; ctx.lineWidth = 1;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath(); ctx.moveTo(npc.x - 8 + i * 7, npc.y - 20); ctx.lineTo(npc.x - 10 + i * 7, npc.y - 2); ctx.stroke();
    }
  }
}
