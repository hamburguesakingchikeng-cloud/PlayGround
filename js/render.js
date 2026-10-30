// Renderizado de personajes, criaturas, enemigos e iconos con arte procedural.
import { TAU, clamp, lerp, rgba, shade, hash2 } from './utils.js';

const OUTLINE = 'rgba(18,16,26,.72)';

function outline(ctx, color = OUTLINE, width = 1.4) {
  ctx.strokeStyle = color; ctx.lineWidth = width; ctx.stroke();
}

export function drawHero(ctx, data) {
  const {
    x, y, appearance = {}, equipment = {}, facing = 0, walk = 0, attackPose = 0,
    state = 'idle', time = 0, blocking = false, scale = 1, npc = false,
    npcRole = '', hitFlash = 0, cloak = true
  } = data;
  const faceX = Math.cos(facing), faceY = Math.sin(facing);
  const isBack = faceY < -0.42;
  const flip = faceX < -0.15 ? -1 : 1;
  const moving = walk > 0.01;
  const phase = walk * 10;
  const bob = moving ? Math.abs(Math.sin(phase)) * 2 : Math.sin(time * 2.2) * 0.8;
  const heightScale = npcRole === 'child' ? 0.78 : npcRole === 'elder' ? 0.94 : 1;
  const hairStyle = appearance.hairStyle ?? 1;
  const hair = appearance.hairColor || '#6d442d';
  const skin = appearance.skinColor || '#e5b18c';
  const outfit = appearance.outfitColor || '#315d8a';
  const cloakColor = appearance.cloakColor || '#b04a43';
  const weaponId = equipment.weapon;
  const armorId = equipment.armor;
  const shieldId = equipment.shield;
  const accId = equipment.accessory;

  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale * flip * heightScale, scale * heightScale);
  ctx.translate(0, -bob);

  // Sombra.
  ctx.fillStyle = 'rgba(9,12,18,.32)';
  ctx.beginPath(); ctx.ellipse(0, 2, 16, 5.5, 0, 0, TAU); ctx.fill();

  // Capa detrás del cuerpo.
  if (cloak && !npc) {
    const sway = Math.sin(time * 3 + walk * 2) * 2;
    const cg = ctx.createLinearGradient(0, -42, 0, -4);
    cg.addColorStop(0, shade(cloakColor, -0.1));
    cg.addColorStop(1, shade(cloakColor, -0.32));
    ctx.fillStyle = cg;
    ctx.beginPath();
    ctx.moveTo(-9, -39);
    ctx.quadraticCurveTo(-22, -26, -16 + sway, -3);
    ctx.lineTo(0, -8);
    ctx.lineTo(15 - sway, -2);
    ctx.quadraticCurveTo(19, -28, 8, -39);
    ctx.closePath();
    ctx.fill(); outline(ctx, 'rgba(20,16,28,.55)', 1);
  }

  // Piernas.
  const legSwing = moving ? Math.sin(phase) * 5 : 0;
  ctx.strokeStyle = shade(outfit, -0.42); ctx.lineWidth = 5; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(-4, -18); ctx.lineTo(-4 + legSwing * 0.4, -4); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(4, -18); ctx.lineTo(4 - legSwing * 0.4, -4); ctx.stroke();
  ctx.fillStyle = '#3a2e2a';
  ctx.beginPath(); ctx.ellipse(-4 + legSwing * 0.4, -2, 5, 3, 0, 0, TAU); ctx.fill();
  ctx.beginPath(); ctx.ellipse(4 - legSwing * 0.4, -2, 5, 3, 0, 0, TAU); ctx.fill();

  // Torso.
  const bodyGrad = ctx.createLinearGradient(-12, -42, 12, -16);
  bodyGrad.addColorStop(0, shade(outfit, 0.16));
  bodyGrad.addColorStop(0.55, outfit);
  bodyGrad.addColorStop(1, shade(outfit, -0.28));
  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.moveTo(-10, -41);
  ctx.quadraticCurveTo(-15, -30, -11, -16);
  ctx.lineTo(11, -16);
  ctx.quadraticCurveTo(15, -30, 10, -41);
  ctx.quadraticCurveTo(0, -45, -10, -41);
  ctx.closePath();
  ctx.fill(); outline(ctx, 'rgba(20,17,28,.65)', 1.2);

  // Cinturón.
  ctx.fillStyle = shade(outfit, -0.5);
  ctx.fillRect(-11, -22, 22, 4);
  ctx.fillStyle = '#d4b162';
  ctx.fillRect(-3, -23, 6, 6);

  // Pecho / armadura.
  if (armorId) {
    const gold = armorId === 'armadura_celestial';
    const robe = armorId === 'manto_ruinas';
    const plate = gold ? '#d7b45e' : robe ? '#574a7f' : '#6d615e';
    ctx.fillStyle = plate;
    if (robe) {
      ctx.beginPath();
      ctx.moveTo(-11, -38); ctx.lineTo(11, -38); ctx.lineTo(8, -16); ctx.lineTo(0, -12); ctx.lineTo(-8, -16); ctx.closePath();
      ctx.fill(); outline(ctx, 'rgba(28,22,38,.6)', 1);
    } else {
      ctx.beginPath();
      ctx.moveTo(-9, -38); ctx.quadraticCurveTo(0, -42, 9, -38);
      ctx.lineTo(8, -26); ctx.quadraticCurveTo(0, -20, -8, -26); ctx.closePath();
      ctx.fill(); outline(ctx, 'rgba(24,20,26,.6)', 1);
      ctx.fillStyle = gold ? '#fff0b0' : '#8f827d';
      ctx.beginPath(); ctx.moveTo(-7, -37); ctx.lineTo(0, -32); ctx.lineTo(7, -37); ctx.strokeStyle = gold ? '#ffe9a0' : '#a49791'; ctx.lineWidth = 1.4; ctx.stroke();
      if (gold) {
        ctx.globalAlpha = 0.35; ctx.fillStyle = '#ffe9a0';
        ctx.beginPath(); ctx.arc(0, -30, 15, 0, TAU); ctx.fill(); ctx.globalAlpha = 1;
      }
    }
    // Hombreras.
    ctx.fillStyle = gold ? '#c9a34f' : robe ? '#6b5a94' : '#5c514f';
    ctx.beginPath(); ctx.ellipse(-10, -38, 6, 4.5, -0.3, 0, TAU); ctx.fill();
    ctx.beginPath(); ctx.ellipse(10, -38, 6, 4.5, 0.3, 0, TAU); ctx.fill();
  }

  // Accesorio en el pecho.
  if (accId) {
    ctx.fillStyle = accId === 'talisman_fenix' ? '#ffb15b' : '#d8e6ef';
    ctx.shadowBlur = 8; ctx.shadowColor = accId === 'talisman_fenix' ? '#ff9d52' : '#a9e4ff';
    ctx.beginPath(); ctx.arc(0, -34, 2.6, 0, TAU); ctx.fill();
    ctx.shadowBlur = 0;
  }

  // Brazos.
  const armSwing = moving ? Math.sin(phase + Math.PI) * 3 : 0;
  ctx.strokeStyle = skin; ctx.lineWidth = 4.4;
  ctx.beginPath(); ctx.moveTo(-10, -37); ctx.lineTo(-12 - armSwing * 0.3, -24); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(10, -37); ctx.lineTo(12 + armSwing * 0.3, -24); ctx.stroke();
  ctx.fillStyle = skin;
  ctx.beginPath(); ctx.arc(-12 - armSwing * 0.3, -23, 2.7, 0, TAU); ctx.fill();
  ctx.beginPath(); ctx.arc(12 + armSwing * 0.3, -23, 2.7, 0, TAU); ctx.fill();

  // Escudo en la mano izquierda.
  if (shieldId) {
    ctx.save();
    ctx.translate(-13, -26);
    ctx.rotate(-0.18);
    const sg = ctx.createLinearGradient(-8, -12, 8, 12);
    sg.addColorStop(0, shieldId === 'escudo_lunar' ? '#cde8f6' : '#9a744a');
    sg.addColorStop(1, shieldId === 'escudo_lunar' ? '#607cae' : '#5d412b');
    ctx.fillStyle = sg;
    ctx.beginPath();
    ctx.moveTo(0, -13); ctx.quadraticCurveTo(10, -8, 8, 2); ctx.quadraticCurveTo(5, 10, 0, 13);
    ctx.quadraticCurveTo(-7, 10, -9, 1); ctx.quadraticCurveTo(-10, -7, 0, -13);
    ctx.closePath(); ctx.fill(); outline(ctx, 'rgba(20,17,24,.7)', 1);
    ctx.strokeStyle = shieldId === 'escudo_lunar' ? '#e9f6ff' : '#d8b36b';
    ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(0, 0, 5, 0, TAU); ctx.stroke();
    ctx.restore();
  }

  // Cabeza.
  ctx.save();
  ctx.translate(0, -48);
  // Cuello.
  ctx.fillStyle = shade(skin, -0.18);
  ctx.fillRect(-3, 5, 6, 4);
  // Melena trasera.
  if (hairStyle === 0 || hairStyle === 1) {
    ctx.fillStyle = shade(hair, -0.18);
    if (hairStyle === 0) {
      ctx.beginPath();
      ctx.moveTo(-9, -4);
      ctx.quadraticCurveTo(-16, 14, -10, 29);
      ctx.lineTo(0, 24);
      ctx.lineTo(11, 29);
      ctx.quadraticCurveTo(16, 13, 9, -4);
      ctx.closePath(); ctx.fill();
    } else {
      ctx.beginPath();
      ctx.moveTo(-8, -2);
      ctx.quadraticCurveTo(-15, 8, -12, 15);
      ctx.lineTo(-5, 12); ctx.lineTo(4, 14); ctx.lineTo(10, 10);
      ctx.quadraticCurveTo(14, 2, 8, -4); ctx.closePath(); ctx.fill();
    }
  }
  // Cara.
  const faceGrad = ctx.createRadialGradient(-2, -3, 1, 0, 0, 12);
  faceGrad.addColorStop(0, shade(skin, 0.1)); faceGrad.addColorStop(1, shade(skin, -0.16));
  ctx.fillStyle = faceGrad;
  ctx.beginPath(); ctx.ellipse(0, 0, 9, 10.2, 0, 0, TAU); ctx.fill(); outline(ctx, 'rgba(60,36,35,.55)', 0.9);

  if (!isBack) {
    // Ojos.
    ctx.fillStyle = '#23202b';
    ctx.beginPath(); ctx.ellipse(-3.8, 0.2, 1.5, 1.2, 0, 0, TAU); ctx.fill();
    ctx.beginPath(); ctx.ellipse(3.8, 0.2, 1.5, 1.2, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.85)';
    ctx.beginPath(); ctx.arc(-4.2, -0.2, 0.45, 0, TAU); ctx.fill();
    ctx.beginPath(); ctx.arc(3.4, -0.2, 0.45, 0, TAU); ctx.fill();
    // Boca.
    ctx.strokeStyle = 'rgba(112,58,56,.7)'; ctx.lineWidth = 0.7;
    ctx.beginPath(); ctx.arc(0, 4.5, 2.1, 0.15, Math.PI - 0.15); ctx.stroke();
    // Rubor sutil.
    ctx.fillStyle = 'rgba(214,102,100,.16)';
    ctx.beginPath(); ctx.ellipse(-5.5, 3.2, 2, 1.2, 0, 0, TAU); ctx.fill();
    ctx.beginPath(); ctx.ellipse(5.5, 3.2, 2, 1.2, 0, 0, TAU); ctx.fill();
  }

  // Flequillo.
  ctx.fillStyle = hair;
  if (hairStyle === 0) {
    ctx.beginPath();
    ctx.moveTo(-9, -1); ctx.quadraticCurveTo(-10, -12, 0, -12);
    ctx.quadraticCurveTo(10, -12, 9, -1);
    ctx.quadraticCurveTo(5, -7, 0, -6); ctx.quadraticCurveTo(-4, -8, -9, -1);
    ctx.closePath(); ctx.fill();
  } else if (hairStyle === 1) {
    ctx.beginPath();
    ctx.moveTo(-9, -2); ctx.quadraticCurveTo(-9, -12, 0, -12);
    ctx.quadraticCurveTo(9, -11, 9, -2);
    ctx.quadraticCurveTo(5, -8, 1, -6); ctx.quadraticCurveTo(-3, -9, -9, -2);
    ctx.closePath(); ctx.fill();
    // Coleta.
    ctx.beginPath(); ctx.moveTo(8, -7); ctx.quadraticCurveTo(19, -2, 16, 9 + Math.sin(time * 3) * 2);
    ctx.quadraticCurveTo(12, 4, 6, -2); ctx.closePath(); ctx.fill();
  } else {
    ctx.beginPath();
    ctx.moveTo(-9, 0); ctx.lineTo(-10, -7); ctx.lineTo(-5, -5); ctx.lineTo(-4, -11);
    ctx.lineTo(2, -6); ctx.lineTo(6, -12); ctx.lineTo(7, -5); ctx.lineTo(10, -7); ctx.lineTo(9, 1);
    ctx.quadraticCurveTo(4, -6, 0, -5); ctx.quadraticCurveTo(-5, -7, -9, 0); ctx.closePath(); ctx.fill();
  }
  ctx.strokeStyle = 'rgba(255,235,200,.25)'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.arc(-2, -9, 6, -2.6, -0.5); ctx.stroke();

  // Adornos de rol.
  if (npcRole === 'elder') {
    ctx.fillStyle = '#d4b56f'; ctx.fillRect(-10, -12, 20, 2);
    ctx.fillStyle = 'rgba(236,244,255,.7)';
    ctx.beginPath(); ctx.arc(-4, 6, 1.2, 0, TAU); ctx.fill();
  } else if (npcRole === 'smith') {
    ctx.fillStyle = '#5a3a2d';
    ctx.beginPath(); ctx.moveTo(-7, 5); ctx.quadraticCurveTo(0, 14, 7, 5); ctx.quadraticCurveTo(0, 9, -7, 5); ctx.fill();
  } else if (npcRole === 'merchant') {
    ctx.fillStyle = '#6b4a2f';
    ctx.beginPath(); ctx.ellipse(0, -10, 13, 3.5, 0, 0, TAU); ctx.fill();
    ctx.fillRect(-6, -15, 12, 6);
    ctx.fillStyle = '#d9b76e'; ctx.fillRect(-12, -11, 24, 1.5);
  } else if (npcRole === 'gard') {
    // Guardia: casco.
    ctx.fillStyle = '#59647a';
    ctx.beginPath(); ctx.arc(0, -4, 10.5, Math.PI, TAU); ctx.fill();
    ctx.fillRect(-10.5, -4, 21, 3);
  } else if (npcRole === 'child') {
    ctx.fillStyle = 'rgba(204,112,98,.35)';
    ctx.beginPath(); ctx.arc(-5, 3, 1.2, 0, TAU); ctx.fill();
    ctx.beginPath(); ctx.arc(5, 3, 1.2, 0, TAU); ctx.fill();
  }
  ctx.restore();

  // Arma.
  drawHeroWeapon(ctx, weaponId, attackPose, state, time, blocking, isBack);

  // Destello de golpe.
  if (hitFlash > 0) {
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = Math.min(0.65, hitFlash * 3);
    ctx.fillStyle = '#ffffff';
    ctx.beginPath(); ctx.ellipse(0, -26, 16, 30, 0, 0, TAU); ctx.fill();
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
  }
  ctx.restore();
}

function drawHeroWeapon(ctx, id, attackPose, state, time, blocking, isBack) {
  if (!id) return;
  const weapon = id;
  const types = {
    espada_alba: 'sword', daga_viento: 'dagger', lanza_alba: 'spear',
    mandoble_obsidiana: 'greatsword', arco_bosque: 'bow', baston_estrellas: 'staff',
    espada_celestial: 'celestial'
  };
  const type = types[weapon] || (weapon.startsWith('baston') ? 'staff' : weapon.startsWith('arco') ? 'bow' : weapon.startsWith('daga') ? 'dagger' : 'sword');
  const swing = state === 'attack' ? attackPose : 0;
  let angle = -0.25;
  if (state === 'attack') angle = lerp(-1.6, 1.5, clamp(attackPose, 0, 1));
  if (state === 'dodge') angle = -0.8;
  if (blocking) angle = -1.1;
  ctx.save();
  ctx.translate(12, -24);
  ctx.rotate(angle);
  if (isBack) ctx.globalAlpha = 0.9;

  const blade = '#d9e0e7';
  const gold = '#d8b25e';
  if (type === 'sword' || type === 'greatsword' || type === 'dagger' || type === 'celestial') {
    const len = type === 'greatsword' ? 52 : type === 'dagger' ? 24 : 38;
    const width = type === 'greatsword' ? 7 : type === 'dagger' ? 4 : 5;
    // Empuñadura.
    ctx.strokeStyle = '#513528'; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(0, 2); ctx.lineTo(0, -7); ctx.stroke();
    ctx.fillStyle = gold;
    ctx.fillRect(-7, -9, 14, 3);
    // Hoja.
    const grad = ctx.createLinearGradient(-width, -8, width, -len);
    if (type === 'celestial') { grad.addColorStop(0, '#fff4c7'); grad.addColorStop(0.5, '#f0d68c'); grad.addColorStop(1, '#fffbe8'); }
    else if (type === 'greatsword') { grad.addColorStop(0, '#7f6f73'); grad.addColorStop(0.5, '#b7a9a1'); grad.addColorStop(1, '#64565d'); }
    else { grad.addColorStop(0, '#aeb6c1'); grad.addColorStop(0.5, '#f1f5f8'); grad.addColorStop(1, '#8a96a5'); }
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(-width / 2, -9); ctx.lineTo(-width / 2 + 1, -len + 8); ctx.lineTo(0, -len);
    ctx.lineTo(width / 2 - 1, -len + 8); ctx.lineTo(width / 2, -9); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = type === 'celestial' ? 'rgba(255,230,140,.9)' : 'rgba(40,40,52,.45)'; ctx.lineWidth = 1; ctx.stroke();
    if (type === 'celestial') {
      ctx.shadowBlur = 14; ctx.shadowColor = '#ffe5a0';
      ctx.strokeStyle = 'rgba(255,236,166,.65)'; ctx.beginPath(); ctx.moveTo(0, -12); ctx.lineTo(0, -len + 4); ctx.stroke();
      ctx.shadowBlur = 0;
    }
    ctx.restore();
    return;
  }
  if (type === 'spear') {
    ctx.strokeStyle = '#6f5037'; ctx.lineWidth = 3.5;
    ctx.beginPath(); ctx.moveTo(0, 2); ctx.lineTo(0, -58); ctx.stroke();
    ctx.fillStyle = '#d8e4ed';
    ctx.beginPath(); ctx.moveTo(0, -72); ctx.lineTo(5, -55); ctx.lineTo(-5, -55); ctx.closePath(); ctx.fill();
    ctx.fillStyle = gold; ctx.fillRect(-4, -57, 8, 3);
    ctx.restore();
    return;
  }
  if (type === 'staff') {
    ctx.strokeStyle = '#5e3f2e'; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(0, 3); ctx.lineTo(0, -48); ctx.stroke();
    const bob = 2 + Math.sin(time * 2) * 1.5;
    ctx.fillStyle = 'rgba(144,220,255,.25)'; ctx.beginPath(); ctx.arc(0, -54, 10 + bob, 0, TAU); ctx.fill();
    ctx.fillStyle = '#b8e8ff'; ctx.shadowBlur = 14; ctx.shadowColor = '#8fdcff';
    ctx.beginPath(); ctx.arc(0, -54, 5, 0, TAU); ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = gold; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(0, -54, 8, 0, TAU); ctx.stroke();
    ctx.restore();
    return;
  }
  if (type === 'bow') {
    ctx.strokeStyle = '#7c5635'; ctx.lineWidth = 3.4;
    ctx.beginPath(); ctx.arc(-3, -28, 21, -1.1, 1.1); ctx.stroke();
    ctx.strokeStyle = 'rgba(231,235,225,.7)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(4, -46); ctx.lineTo(-2, -10); ctx.stroke();
    ctx.fillStyle = gold; ctx.beginPath(); ctx.arc(1, -28, 2, 0, TAU); ctx.fill();
    ctx.restore();
  }
}

export function drawEnemy(ctx, e, game, time) {
  const def = e.def;
  const x = e.x, y = e.y;
  const flash = e.hitFlash > 0;
  const facing = e.facing ?? Math.PI / 2;
  const flip = Math.cos(facing) < 0 ? -1 : 1;
  const scale = e.visualScale || 1;
  const bob = e.draw === 'wraith' || e.draw === 'fenix' ? Math.sin(time * 2 + e.seed) * 3 : (e.state === 'walk' ? Math.abs(Math.sin(time * 8 + e.seed)) * 2 : 0);
  ctx.save();
  ctx.translate(x, y + bob);
  ctx.scale(scale * flip, scale);
  // Sombra.
  ctx.fillStyle = 'rgba(8,10,16,.32)';
  ctx.beginPath(); ctx.ellipse(0, 4, e.draw === 'guardian' ? 38 : 20, e.draw === 'guardian' ? 12 : 6, 0, 0, TAU); ctx.fill();

  if (e.draw === 'slime') drawSlime(ctx, e, time);
  else if (e.draw === 'wolf') drawWolf(ctx, e, time);
  else if (e.draw === 'beetle') drawBeetle(ctx, e, time);
  else if (e.draw === 'wraith') drawWraith(ctx, e, time);
  else if (e.draw === 'fenix') drawFenix(ctx, e, time);
  else if (e.draw === 'guardian') drawGuardian(ctx, e, time);

  if (flash) {
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = Math.min(0.7, e.hitFlash * 4);
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.ellipse(0, -20, 20, 28, 0, 0, TAU); ctx.fill();
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  }
  ctx.restore();
}

function drawSlime(ctx, e, time) {
  const color = e.def.color;
  const accent = e.def.accent;
  const g = ctx.createRadialGradient(-6, -18, 2, 0, -12, 26);
  g.addColorStop(0, rgba(accent, 0.9)); g.addColorStop(0.55, rgba(color, 0.72)); g.addColorStop(1, rgba(color, 0.3));
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(-24, -2);
  ctx.bezierCurveTo(-27, -22, -15, -34, 0, -34);
  ctx.bezierCurveTo(16, -34, 27, -22, 24, -2);
  ctx.quadraticCurveTo(10, 5, 0, 3);
  ctx.quadraticCurveTo(-12, 5, -24, -2);
  ctx.closePath(); ctx.fill();
  outline(ctx, rgba(shade(color, -0.4), 0.6), 1);
  ctx.fillStyle = 'rgba(255,255,255,.4)';
  ctx.beginPath(); ctx.ellipse(-8, -25, 5, 3.4, -0.4, 0, TAU); ctx.fill();
  ctx.fillStyle = '#253038';
  ctx.beginPath(); ctx.ellipse(-7, -17, 2, 2.6, 0, 0, TAU); ctx.fill();
  ctx.beginPath(); ctx.ellipse(7, -17, 2, 2.6, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.beginPath(); ctx.arc(-7.5, -17.8, 0.7, 0, TAU); ctx.fill();
  ctx.beginPath(); ctx.arc(6.5, -17.8, 0.7, 0, TAU); ctx.fill();
  ctx.strokeStyle = 'rgba(33,49,38,.55)'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.arc(0, -11, 4, 0.1, Math.PI - 0.1); ctx.stroke();
  if (e.elite) {
    ctx.fillStyle = '#e8c56e';
    ctx.beginPath(); ctx.moveTo(-10, -34); ctx.lineTo(-5, -43); ctx.lineTo(0, -36); ctx.lineTo(5, -44); ctx.lineTo(10, -34); ctx.closePath(); ctx.fill();
  }
}

function drawWolf(ctx, e, time) {
  const color = e.def.color, accent = e.def.accent;
  ctx.strokeStyle = 'rgba(52,45,44,.7)'; ctx.lineWidth = 3;
  const leg = Math.sin(time * 10 + e.seed) * 4;
  ctx.beginPath(); ctx.moveTo(-12, -12); ctx.lineTo(-14 + leg, 0); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-2, -12); ctx.lineTo(-4 - leg, 0); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(10, -12); ctx.lineTo(12 - leg, 0); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(17, -12); ctx.lineTo(19 + leg, 0); ctx.stroke();
  const g = ctx.createLinearGradient(0, -30, 0, -4);
  g.addColorStop(0, shade(color, 0.2)); g.addColorStop(1, shade(color, -0.25));
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.ellipse(0, -20, 20, 11, -0.08, 0, TAU); ctx.fill();
  // Cabeza.
  ctx.beginPath(); ctx.ellipse(17, -27, 11, 9, -0.12, 0, TAU); ctx.fill();
  ctx.beginPath(); ctx.moveTo(22, -26); ctx.lineTo(31, -22); ctx.lineTo(21, -18); ctx.closePath(); ctx.fill();
  ctx.fillStyle = shade(color, -0.2);
  ctx.beginPath(); ctx.moveTo(9, -33); ctx.lineTo(7, -44); ctx.lineTo(15, -35); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(18, -34); ctx.lineTo(20, -45); ctx.lineTo(25, -33); ctx.closePath(); ctx.fill();
  // Ojos.
  ctx.fillStyle = accent; ctx.shadowBlur = 7; ctx.shadowColor = accent;
  ctx.beginPath(); ctx.ellipse(20, -28, 1.8, 1.2, 0, 0, TAU); ctx.fill();
  ctx.shadowBlur = 0;
  // Cola.
  ctx.strokeStyle = shade(color, -0.1); ctx.lineWidth = 5; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(-19, -20); ctx.quadraticCurveTo(-29, -30 + Math.sin(time * 4) * 3, -27, -40); ctx.stroke();
  // Costillas / pelaje.
  ctx.strokeStyle = 'rgba(220,210,200,.16)'; ctx.lineWidth = 1.4;
  for (let i = 0; i < 4; i++) {
    ctx.beginPath(); ctx.moveTo(-6 + i * 5, -25); ctx.quadraticCurveTo(-4 + i * 5, -16, -8 + i * 5, -11); ctx.stroke();
  }
  if (e.elite) {
    ctx.strokeStyle = rgba(accent, 0.6); ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(17, -27, 15, 0.3, 2.2); ctx.stroke();
  }
}

function drawBeetle(ctx, e, time) {
  const color = e.def.color, accent = e.def.accent;
  const legSwing = Math.sin(time * 7 + e.seed) * 3;
  ctx.strokeStyle = '#4a4034'; ctx.lineWidth = 3.4;
  for (let i = -1; i <= 1; i++) {
    ctx.beginPath(); ctx.moveTo(i * 13, -16); ctx.lineTo(i * 15 - 9 + legSwing, 0); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(i * 13, -16); ctx.lineTo(i * 15 + 9 - legSwing, 0); ctx.stroke();
  }
  const g = ctx.createLinearGradient(0, -40, 0, -4);
  g.addColorStop(0, shade(color, 0.28)); g.addColorStop(0.6, color); g.addColorStop(1, shade(color, -0.32));
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.ellipse(0, -20, 27, 17, 0, 0, TAU); ctx.fill(); outline(ctx, 'rgba(42,34,26,.7)', 1.2);
  // Divisiones del caparazón.
  ctx.strokeStyle = 'rgba(45,38,30,.55)'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(0, -37); ctx.lineTo(0, -4); ctx.moveTo(-18, -30); ctx.quadraticCurveTo(-10, -21, -16, -8); ctx.moveTo(18, -30); ctx.quadraticCurveTo(10, -21, 16, -8); ctx.stroke();
  // Brillo mineral.
  ctx.strokeStyle = rgba(accent, 0.6); ctx.lineWidth = 1.3;
  for (let i = 0; i < 3; i++) {
    ctx.beginPath(); ctx.moveTo(-14 + i * 7, -30); ctx.lineTo(-18 + i * 10, -17); ctx.stroke();
  }
  // Cabeza y cuerno.
  ctx.fillStyle = shade(color, -0.15);
  ctx.beginPath(); ctx.ellipse(0, -40, 13, 9, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = accent;
  ctx.shadowBlur = 8; ctx.shadowColor = accent;
  ctx.beginPath(); ctx.moveTo(-3, -44); ctx.lineTo(0, -55); ctx.lineTo(4, -44); ctx.closePath(); ctx.fill();
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#27251f';
  ctx.beginPath(); ctx.arc(-5, -41, 1.6, 0, TAU); ctx.fill();
  ctx.beginPath(); ctx.arc(5, -41, 1.6, 0, TAU); ctx.fill();
  if (e.elite) {
    ctx.fillStyle = '#e4c470';
    ctx.beginPath(); ctx.moveTo(-10, -48); ctx.lineTo(-6, -56); ctx.lineTo(0, -50); ctx.lineTo(6, -57); ctx.lineTo(10, -48); ctx.closePath(); ctx.fill();
  }
}

function drawWraith(ctx, e, time) {
  const color = e.def.color, accent = e.def.accent;
  const float = Math.sin(time * 2.3 + e.seed) * 4;
  ctx.translate(0, float - 6);
  // Aura.
  const aura = ctx.createRadialGradient(0, -30, 2, 0, -26, 42);
  aura.addColorStop(0, rgba(accent, 0.18)); aura.addColorStop(1, 'rgba(80,20,140,0)');
  ctx.fillStyle = aura; ctx.beginPath(); ctx.arc(0, -26, 42, 0, TAU); ctx.fill();
  // Túnica.
  const g = ctx.createLinearGradient(0, -50, 0, 4);
  g.addColorStop(0, shade(color, 0.1)); g.addColorStop(0.6, color); g.addColorStop(1, rgba(color, 0.16));
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(-13, -42);
  ctx.quadraticCurveTo(-20, -22, -18, 2);
  ctx.lineTo(-10, -3); ctx.lineTo(-3, 3); ctx.lineTo(4, -4); ctx.lineTo(12, 2); ctx.lineTo(18, -3);
  ctx.quadraticCurveTo(21, -24, 13, -42);
  ctx.closePath(); ctx.fill();
  // Capucha.
  ctx.fillStyle = shade(color, -0.22);
  ctx.beginPath(); ctx.arc(0, -43, 16, Math.PI * 0.92, Math.PI * 2.08); ctx.lineTo(13, -32); ctx.quadraticCurveTo(0, -24, -13, -32); ctx.closePath(); ctx.fill();
  ctx.fillStyle = 'rgba(12,13,25,.78)';
  ctx.beginPath(); ctx.ellipse(0, -38, 10, 11, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = accent; ctx.shadowBlur = 12; ctx.shadowColor = accent;
  ctx.beginPath(); ctx.ellipse(-3.5, -39, 1.8, 2.3, 0, 0, TAU); ctx.fill();
  ctx.beginPath(); ctx.ellipse(3.5, -39, 1.8, 2.3, 0, 0, TAU); ctx.fill();
  ctx.shadowBlur = 0;
  // Cadenas / jirones.
  ctx.strokeStyle = rgba(accent, 0.35); ctx.lineWidth = 1.4;
  ctx.beginPath(); ctx.moveTo(-16, -28); ctx.quadraticCurveTo(-24, -12, -18, 2); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(16, -28); ctx.quadraticCurveTo(24, -12, 18, 3); ctx.stroke();
  if (e.elite) {
    ctx.fillStyle = '#d9c27c';
    ctx.beginPath(); ctx.moveTo(-13, -53); ctx.lineTo(-8, -62); ctx.lineTo(-2, -55); ctx.lineTo(4, -62); ctx.lineTo(10, -53); ctx.closePath(); ctx.fill();
  }
}

function drawFenix(ctx, e, time) {
  const color = e.def.color, accent = e.def.accent;
  const wing = Math.sin(time * 5 + e.seed) * 6;
  const aura = ctx.createRadialGradient(0, -28, 3, 0, -28, 48);
  aura.addColorStop(0, rgba(accent, 0.3)); aura.addColorStop(1, 'rgba(255,80,20,0)');
  ctx.fillStyle = aura; ctx.beginPath(); ctx.arc(0, -28, 48, 0, TAU); ctx.fill();
  ctx.save();
  ctx.rotate(-0.1);
  // Alas.
  ctx.fillStyle = rgba(color, 0.78);
  ctx.beginPath(); ctx.moveTo(-7, -34); ctx.quadraticCurveTo(-38, -58 - wing, -43, -31); ctx.quadraticCurveTo(-30, -29, -18, -20); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(7, -34); ctx.quadraticCurveTo(38, -58 + wing, 43, -31); ctx.quadraticCurveTo(30, -29, 18, -20); ctx.closePath(); ctx.fill();
  // Cuerpo.
  const g = ctx.createLinearGradient(0, -48, 0, -8);
  g.addColorStop(0, accent); g.addColorStop(0.5, color); g.addColorStop(1, '#9d3d27');
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.ellipse(0, -27, 11, 20, 0, 0, TAU); ctx.fill();
  // Cabeza.
  ctx.fillStyle = accent;
  ctx.beginPath(); ctx.arc(2, -48, 8, 0, TAU); ctx.fill();
  ctx.fillStyle = '#f9d27d';
  ctx.beginPath(); ctx.moveTo(7, -50); ctx.lineTo(18, -47); ctx.lineTo(7, -44); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#4c2418';
  ctx.beginPath(); ctx.arc(4, -50, 1.2, 0, TAU); ctx.fill();
  // Cola de fuego.
  ctx.strokeStyle = accent; ctx.lineWidth = 4; ctx.lineCap = 'round';
  for (let i = 0; i < 3; i++) {
    ctx.beginPath(); ctx.moveTo(-2 + i * 3, -14); ctx.quadraticCurveTo(-10 + i * 10 + wing, 4, -4 + i * 7, 16); ctx.stroke();
  }
  ctx.restore();
}

function drawGuardian(ctx, e, time) {
  const color = e.def.color, accent = e.def.accent;
  const aura = ctx.createRadialGradient(0, -50, 5, 0, -50, 68);
  aura.addColorStop(0, rgba(accent, 0.22)); aura.addColorStop(1, 'rgba(90,40,140,0)');
  ctx.fillStyle = aura; ctx.beginPath(); ctx.arc(0, -50, 70, 0, TAU); ctx.fill();
  // Capa.
  const cg = ctx.createLinearGradient(0, -90, 0, -8);
  cg.addColorStop(0, '#2c2738'); cg.addColorStop(1, '#181521');
  ctx.fillStyle = cg;
  ctx.beginPath();
  ctx.moveTo(-25, -86); ctx.quadraticCurveTo(-54, -45, -38, -2);
  ctx.lineTo(-12, -14); ctx.lineTo(0, -2); ctx.lineTo(14, -14); ctx.lineTo(40, -2);
  ctx.quadraticCurveTo(54, -44, 26, -86); ctx.closePath(); ctx.fill();
  // Piernas.
  ctx.fillStyle = '#3b364a';
  ctx.fillRect(-19, -30, 14, 30);
  ctx.fillRect(5, -30, 14, 30);
  ctx.fillStyle = '#23202e'; ctx.fillRect(-21, -6, 18, 8); ctx.fillRect(3, -6, 18, 8);
  // Armadura.
  const g = ctx.createLinearGradient(-28, -90, 28, -26);
  g.addColorStop(0, '#706783'); g.addColorStop(0.45, color); g.addColorStop(1, '#2f2b3d');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(-25, -85); ctx.lineTo(25, -85); ctx.lineTo(30, -38); ctx.lineTo(12, -28); ctx.lineTo(0, -34); ctx.lineTo(-12, -28); ctx.lineTo(-30, -38); ctx.closePath(); ctx.fill(); outline(ctx, 'rgba(20,18,30,.7)', 1.5);
  ctx.fillStyle = accent; ctx.globalAlpha = 0.55;
  ctx.beginPath(); ctx.moveTo(0, -80); ctx.lineTo(7, -58); ctx.lineTo(0, -38); ctx.lineTo(-7, -58); ctx.closePath(); ctx.fill(); ctx.globalAlpha = 1;
  // Hombreras.
  ctx.fillStyle = '#4b455d';
  ctx.beginPath(); ctx.ellipse(-27, -78, 13, 10, -0.2, 0, TAU); ctx.fill();
  ctx.beginPath(); ctx.ellipse(27, -78, 13, 10, 0.2, 0, TAU); ctx.fill();
  // Casco.
  ctx.fillStyle = '#474154';
  ctx.beginPath(); ctx.arc(0, -94, 16, 0, TAU); ctx.fill();
  ctx.fillStyle = '#2b2738'; ctx.beginPath(); ctx.rect(-12, -94, 24, 8); ctx.fill();
  ctx.fillStyle = accent; ctx.shadowBlur = 12; ctx.shadowColor = accent;
  ctx.beginPath(); ctx.ellipse(-5, -93, 2.2, 1.4, 0, 0, TAU); ctx.fill();
  ctx.beginPath(); ctx.ellipse(5, -93, 2.2, 1.4, 0, 0, TAU); ctx.fill();
  ctx.shadowBlur = 0;
  // Cuernos.
  ctx.strokeStyle = '#c7b081'; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(-12, -104); ctx.quadraticCurveTo(-25, -122, -15, -130); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(12, -104); ctx.quadraticCurveTo(25, -122, 15, -130); ctx.stroke();
  // Espada gigante.
  ctx.save();
  ctx.translate(31, -64); ctx.rotate(-0.5 + Math.sin(time * 1.2) * 0.02);
  ctx.fillStyle = '#462e35'; ctx.fillRect(-4, -6, 8, 18);
  ctx.fillStyle = '#d8b25e'; ctx.fillRect(-10, -10, 20, 4);
  const bg = ctx.createLinearGradient(0, -18, 0, -95);
  bg.addColorStop(0, '#8f8497'); bg.addColorStop(1, '#3d3748');
  ctx.fillStyle = bg;
  ctx.beginPath(); ctx.moveTo(-6, -12); ctx.lineTo(-4, -92); ctx.lineTo(0, -104); ctx.lineTo(5, -92); ctx.lineTo(7, -12); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = rgba(accent, 0.35); ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(0, -18); ctx.lineTo(0, -96); ctx.stroke();
  ctx.restore();
}

// ------------------------------- Criaturas -------------------------------
export function drawCompanion(ctx, c, time) {
  const def = c.def;
  const bob = Math.sin(time * 3 + (c.seed || 0)) * 4;
  ctx.save();
  ctx.translate(c.x, c.y);
  ctx.globalAlpha = 0.95;
  const aura = ctx.createRadialGradient(0, -18, 2, 0, -18, 32);
  const col = def.accent;
  aura.addColorStop(0, rgba(col, 0.24)); aura.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = aura; ctx.beginPath(); ctx.arc(0, -18, 34, 0, TAU); ctx.fill();
  ctx.translate(0, bob);
  if (def.type === 'gelatina') {
    ctx.fillStyle = rgba(def.color, 0.82);
    ctx.beginPath(); ctx.ellipse(0, -13, 15, 12, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.globalAlpha = 0.6;
    ctx.beginPath(); ctx.ellipse(-5, -18, 3, 2, -0.3, 0, TAU); ctx.fill(); ctx.globalAlpha = 1;
    ctx.fillStyle = '#27343c'; ctx.beginPath(); ctx.arc(-4, -12, 1.3, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.arc(4, -12, 1.3, 0, TAU); ctx.fill();
  } else if (def.type === 'lobo') {
    ctx.fillStyle = def.color;
    ctx.beginPath(); ctx.ellipse(0, -12, 14, 8, 0, 0, TAU); ctx.fill();
    ctx.beginPath(); ctx.arc(10, -20, 8, 0, TAU); ctx.fill();
    ctx.beginPath(); ctx.moveTo(15, -19); ctx.lineTo(22, -16); ctx.lineTo(15, -13); ctx.fill();
    ctx.fillStyle = def.accent; ctx.beginPath(); ctx.arc(12, -21, 1.5, 0, TAU); ctx.fill();
  } else if (def.type === 'escarabajo') {
    ctx.fillStyle = def.color;
    ctx.beginPath(); ctx.ellipse(0, -12, 16, 11, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = def.accent; ctx.beginPath(); ctx.moveTo(0, -27); ctx.lineTo(3, -18); ctx.lineTo(-3, -18); ctx.fill();
    ctx.strokeStyle = '#3e362e'; ctx.lineWidth = 2;
    for (let i = -1; i <= 1; i++) { ctx.beginPath(); ctx.moveTo(i * 8, -8); ctx.lineTo(i * 10 - 5, 1); ctx.stroke(); ctx.beginPath(); ctx.moveTo(i * 8, -8); ctx.lineTo(i * 10 + 5, 1); ctx.stroke(); }
  } else if (def.type === 'espectro') {
    ctx.fillStyle = rgba(def.color, 0.85);
    ctx.beginPath(); ctx.moveTo(-11, -7); ctx.lineTo(-13, -27); ctx.quadraticCurveTo(0, -40, 13, -27); ctx.lineTo(11, -7); ctx.lineTo(5, -12); ctx.lineTo(0, -5); ctx.lineTo(-5, -12); ctx.closePath(); ctx.fill();
    ctx.fillStyle = def.accent; ctx.shadowBlur = 8; ctx.shadowColor = def.accent;
    ctx.beginPath(); ctx.arc(-3, -25, 1.6, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.arc(3, -25, 1.6, 0, TAU); ctx.fill(); ctx.shadowBlur = 0;
  } else if (def.type === 'fenix') {
    ctx.fillStyle = def.color;
    ctx.beginPath(); ctx.ellipse(0, -20, 8, 13, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = def.accent;
    ctx.beginPath(); ctx.arc(2, -33, 6, 0, TAU); ctx.fill();
    const flap = Math.sin(time * 8) * 4;
    ctx.fillStyle = rgba(def.color, 0.55);
    ctx.beginPath(); ctx.moveTo(-4, -24); ctx.quadraticCurveTo(-24, -30 - flap, -22, -15); ctx.quadraticCurveTo(-12, -15, -4, -17); ctx.fill();
    ctx.beginPath(); ctx.moveTo(4, -24); ctx.quadraticCurveTo(24, -30 + flap, 22, -15); ctx.quadraticCurveTo(12, -15, 4, -17); ctx.fill();
  }
  ctx.restore();
}

export function drawProjectile(ctx, p, time) {
  ctx.save();
  ctx.translate(p.x, p.y);
  const color = p.color || '#ffe5a0';
  ctx.globalCompositeOperation = 'lighter';
  const glow = ctx.createRadialGradient(0, 0, 1, 0, 0, p.radius * 3.2);
  glow.addColorStop(0, '#fff'); glow.addColorStop(0.25, color); glow.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(0, 0, p.radius * 3.2, 0, TAU); ctx.fill();
  ctx.rotate(p.angle || 0);
  if (p.kind === 'arrow') {
    ctx.strokeStyle = '#d8bd7a'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(-20, 0); ctx.lineTo(6, 0); ctx.stroke();
    ctx.fillStyle = '#e8f6e0'; ctx.beginPath(); ctx.moveTo(12, 0); ctx.lineTo(4, -3); ctx.lineTo(4, 3); ctx.fill();
  } else if (p.kind === 'crescent') {
    ctx.strokeStyle = color; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.arc(0, 0, p.radius * 1.5, -1.1, 1.1); ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,.9)'; ctx.lineWidth = 1.5; ctx.stroke();
  } else if (p.kind === 'fire') {
    ctx.fillStyle = color;
    ctx.beginPath(); ctx.moveTo(10, 0); ctx.quadraticCurveTo(0, -8, -12, 0); ctx.quadraticCurveTo(0, 8, 10, 0); ctx.fill();
  } else {
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(0, 0, p.radius * 0.65, 0, TAU); ctx.fill();
    ctx.fillStyle = color;
    ctx.beginPath(); ctx.arc(0, 0, p.radius * 0.45, 0, TAU); ctx.fill();
  }
  ctx.restore();
}

// ------------------------------- Retratos -------------------------------
export function drawPortrait(canvas, role, name = '', time = 0) {
  const ctx = canvas.getContext('2d');
  const w = canvas.width, h = canvas.height;
  ctx.clearRect(0, 0, w, h);
  const palettes = {
    elder: { bg1: '#2d2745', bg2: '#525077', robe: '#5f5380', hair: '#e8e9ef', skin: '#d8b49b' },
    healer: { bg1: '#1f3b33', bg2: '#406b56', robe: '#4d7f68', hair: '#b87745', skin: '#e5b28d' },
    smith: { bg1: '#3b2721', bg2: '#724a3a', robe: '#5a3a2f', hair: '#8b4a2b', skin: '#c58d6a' },
    merchant: { bg1: '#3c3121', bg2: '#74613c', robe: '#6b5334', hair: '#d2a45e', skin: '#d9a27e' },
    child: { bg1: '#26364d', bg2: '#496a8b', robe: '#446a96', hair: '#cb8b4c', skin: '#e8b58f' },
    guard: { bg1: '#28303f', bg2: '#4d5c75', robe: '#4b5a73', hair: '#3d3d49', skin: '#d6a07b' },
    narrator: { bg1: '#211d35', bg2: '#5c4e78', robe: '#4b3f66', hair: '#dad9e8', skin: '#e6b997' },
    hero: { bg1: '#1f3050', bg2: '#3e6d92', robe: '#315d8a', hair: '#6b442d', skin: '#e5b18c' }
  };
  const p = palettes[role] || palettes.narrator;
  const bg = ctx.createRadialGradient(w * 0.5, h * 0.28, 5, w * 0.5, h * 0.4, w * 0.75);
  bg.addColorStop(0, p.bg2); bg.addColorStop(1, p.bg1);
  ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h);
  // Runa de fondo.
  ctx.save();
  ctx.globalAlpha = 0.14; ctx.strokeStyle = '#f4d78f'; ctx.lineWidth = 1.5;
  ctx.translate(w * 0.5, h * 0.48);
  for (let i = 0; i < 3; i++) {
    ctx.beginPath(); ctx.arc(0, 0, 28 + i * 15, 0, TAU); ctx.stroke();
  }
  for (let i = 0; i < 8; i++) {
    const a = i / 8 * TAU + time * 0.04;
    ctx.beginPath(); ctx.moveTo(Math.cos(a) * 20, Math.sin(a) * 20); ctx.lineTo(Math.cos(a) * 66, Math.sin(a) * 66); ctx.stroke();
  }
  ctx.restore();
  // Hombros.
  ctx.fillStyle = p.robe;
  ctx.beginPath(); ctx.moveTo(w * 0.18, h); ctx.quadraticCurveTo(w * 0.26, h * 0.6, w * 0.5, h * 0.58); ctx.quadraticCurveTo(w * 0.74, h * 0.6, w * 0.82, h); ctx.closePath(); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,.08)';
  ctx.beginPath(); ctx.moveTo(w * 0.3, h); ctx.quadraticCurveTo(w * 0.36, h * 0.72, w * 0.45, h * 0.64); ctx.lineTo(w * 0.4, h); ctx.closePath(); ctx.fill();
  // Cuello y cabeza.
  ctx.fillStyle = p.skin;
  ctx.fillRect(w * 0.46, h * 0.54, w * 0.08, h * 0.12);
  ctx.beginPath(); ctx.ellipse(w * 0.5, h * 0.4, w * 0.17, h * 0.2, 0, 0, TAU); ctx.fill();
  // Cabello.
  ctx.fillStyle = p.hair;
  if (role === 'elder') {
    ctx.beginPath(); ctx.arc(w * 0.5, h * 0.34, w * 0.2, Math.PI, TAU); ctx.fill();
    ctx.beginPath(); ctx.moveTo(w * 0.32, h * 0.36); ctx.quadraticCurveTo(w * 0.28, h * 0.64, w * 0.35, h * 0.7); ctx.lineTo(w * 0.4, h * 0.48); ctx.fill();
    ctx.beginPath(); ctx.moveTo(w * 0.68, h * 0.36); ctx.quadraticCurveTo(w * 0.72, h * 0.64, w * 0.65, h * 0.7); ctx.lineTo(w * 0.6, h * 0.48); ctx.fill();
    // Barba.
    ctx.fillStyle = 'rgba(240,241,248,.85)';
    ctx.beginPath(); ctx.moveTo(w * 0.41, h * 0.5); ctx.quadraticCurveTo(w * 0.5, h * 0.68, w * 0.59, h * 0.5); ctx.quadraticCurveTo(w * 0.5, h * 0.56, w * 0.41, h * 0.5); ctx.fill();
  } else if (role === 'smith') {
    ctx.beginPath(); ctx.arc(w * 0.5, h * 0.33, w * 0.2, Math.PI, TAU); ctx.fill();
    ctx.fillStyle = '#5a3a2d';
    ctx.beginPath(); ctx.moveTo(w * 0.4, h * 0.47); ctx.quadraticCurveTo(w * 0.5, h * 0.7, w * 0.6, h * 0.47); ctx.quadraticCurveTo(w * 0.5, h * 0.55, w * 0.4, h * 0.47); ctx.fill();
  } else if (role === 'merchant') {
    ctx.beginPath(); ctx.arc(w * 0.5, h * 0.33, w * 0.2, Math.PI, TAU); ctx.fill();
    ctx.fillStyle = '#6b4a2f'; ctx.beginPath(); ctx.ellipse(w * 0.5, h * 0.25, w * 0.26, h * 0.05, 0, 0, TAU); ctx.fill();
    ctx.fillRect(w * 0.4, h * 0.18, w * 0.2, h * 0.07);
    ctx.fillStyle = '#d9b76e'; ctx.fillRect(w * 0.24, h * 0.25, w * 0.52, h * 0.015);
  } else if (role === 'guard') {
    ctx.fillStyle = '#59647a';
    ctx.beginPath(); ctx.arc(w * 0.5, h * 0.34, w * 0.2, Math.PI, TAU); ctx.fill();
    ctx.fillRect(w * 0.3, h * 0.34, w * 0.4, h * 0.035);
    ctx.fillStyle = '#8b97ad'; ctx.fillRect(w * 0.48, h * 0.17, w * 0.04, h * 0.14);
  } else {
    ctx.beginPath(); ctx.arc(w * 0.5, h * 0.33, w * 0.2, Math.PI, TAU); ctx.fill();
    ctx.beginPath(); ctx.moveTo(w * 0.3, h * 0.36); ctx.quadraticCurveTo(w * 0.28, h * 0.54, w * 0.22, h * 0.7); ctx.quadraticCurveTo(w * 0.34, h * 0.58, w * 0.38, h * 0.4); ctx.fill();
    ctx.beginPath(); ctx.moveTo(w * 0.7, h * 0.36); ctx.quadraticCurveTo(w * 0.72, h * 0.54, w * 0.78, h * 0.7); ctx.quadraticCurveTo(w * 0.66, h * 0.58, w * 0.62, h * 0.4); ctx.fill();
  }
  // Flequillo.
  ctx.fillStyle = p.hair;
  ctx.beginPath(); ctx.moveTo(w * 0.34, h * 0.34); ctx.quadraticCurveTo(w * 0.5, h * 0.22, w * 0.66, h * 0.34); ctx.quadraticCurveTo(w * 0.56, h * 0.35, w * 0.5, h * 0.28); ctx.quadraticCurveTo(w * 0.42, h * 0.35, w * 0.34, h * 0.34); ctx.fill();
  // Ojos.
  ctx.fillStyle = '#25232e';
  ctx.beginPath(); ctx.ellipse(w * 0.45, h * 0.4, w * 0.018, h * 0.012, 0, 0, TAU); ctx.fill();
  ctx.beginPath(); ctx.ellipse(w * 0.55, h * 0.4, w * 0.018, h * 0.012, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,.8)';
  ctx.beginPath(); ctx.arc(w * 0.446, h * 0.396, w * 0.005, 0, TAU); ctx.fill();
  ctx.beginPath(); ctx.arc(w * 0.546, h * 0.396, w * 0.005, 0, TAU); ctx.fill();
  // Cejas y boca.
  ctx.strokeStyle = 'rgba(65,44,40,.6)'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(w * 0.42, h * 0.37); ctx.lineTo(w * 0.48, h * 0.365); ctx.moveTo(w * 0.52, h * 0.365); ctx.lineTo(w * 0.58, h * 0.37); ctx.stroke();
  ctx.beginPath(); ctx.arc(w * 0.5, h * 0.46, w * 0.025, 0.2, Math.PI - 0.2); ctx.stroke();
  // Viñeta.
  const v = ctx.createRadialGradient(w * 0.5, h * 0.5, w * 0.2, w * 0.5, h * 0.5, w * 0.7);
  v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,.34)');
  ctx.fillStyle = v; ctx.fillRect(0, 0, w, h);
}

// ------------------------------- Iconos -------------------------------
export function drawItemIcon(canvas, item, rarityColor = '#d8cfb8') {
  const ctx = canvas.getContext('2d');
  const w = canvas.width, h = canvas.height;
  ctx.clearRect(0, 0, w, h);
  const bg = ctx.createRadialGradient(w * 0.5, h * 0.38, 2, w * 0.5, h * 0.5, w * 0.62);
  bg.addColorStop(0, 'rgba(255,255,255,.12)'); bg.addColorStop(1, 'rgba(10,10,18,.25)');
  ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h);
  ctx.save();
  ctx.translate(w / 2, h / 2);
  const s = w / 48;
  ctx.scale(s, s);
  const icon = item.icon || 'material';
  if (icon === 'sword' || icon === 'greatsword' || icon === 'dagger' || icon === 'wood_sword' || icon === 'celestial') {
    const long = icon === 'greatsword' ? 22 : icon === 'dagger' ? 10 : icon === 'wood_sword' ? 13 : 17;
    const wide = icon === 'greatsword' ? 4.5 : 3;
    ctx.rotate(-0.7);
    ctx.fillStyle = icon === 'wood_sword' ? '#9b6f3f' : '#d7e0ea';
    ctx.beginPath(); ctx.moveTo(-wide, 4); ctx.lineTo(-wide + 1, -long + 5); ctx.lineTo(0, -long); ctx.lineTo(wide - 1, -long + 5); ctx.lineTo(wide, 4); ctx.closePath(); ctx.fill();
    if (icon === 'celestial') { ctx.shadowBlur = 12; ctx.shadowColor = '#ffe7a3'; ctx.strokeStyle = '#ffe7a3'; ctx.stroke(); ctx.shadowBlur = 0; }
    else { ctx.strokeStyle = 'rgba(38,38,50,.5)'; ctx.lineWidth = 1; ctx.stroke(); }
    ctx.fillStyle = '#d7b25f'; ctx.fillRect(-7, 3, 14, 3);
    ctx.fillStyle = '#583b2a'; ctx.fillRect(-2, 6, 4, 10);
    ctx.fillStyle = rarityColor; ctx.beginPath(); ctx.arc(0, 18, 2.4, 0, TAU); ctx.fill();
  } else if (icon === 'spear') {
    ctx.rotate(-0.75);
    ctx.strokeStyle = '#6b4b32'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(0, 18); ctx.lineTo(0, -10); ctx.stroke();
    ctx.fillStyle = '#d7e2ea'; ctx.beginPath(); ctx.moveTo(0, -24); ctx.lineTo(4, -8); ctx.lineTo(-4, -8); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#d7b25f'; ctx.fillRect(-3, -10, 6, 3);
  } else if (icon === 'bow') {
    ctx.strokeStyle = '#8b5f38'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(-4, 0, 17, -1.2, 1.2); ctx.stroke();
    ctx.strokeStyle = '#d9ddce'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(2, -15); ctx.lineTo(-4, 15); ctx.stroke();
    ctx.strokeStyle = '#d7b25f'; ctx.beginPath(); ctx.moveTo(-8, 0); ctx.lineTo(12, 0); ctx.stroke();
  } else if (icon === 'staff') {
    ctx.rotate(-0.65);
    ctx.strokeStyle = '#60412e'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(0, 20); ctx.lineTo(0, -11); ctx.stroke();
    ctx.fillStyle = 'rgba(174,235,255,.25)'; ctx.beginPath(); ctx.arc(0, -17, 10, 0, TAU); ctx.fill();
    ctx.fillStyle = '#b7e9ff'; ctx.shadowBlur = 10; ctx.shadowColor = '#8fdcff';
    ctx.beginPath(); ctx.arc(0, -17, 4, 0, TAU); ctx.fill(); ctx.shadowBlur = 0;
  } else if (icon.startsWith('shield')) {
    const moon = icon === 'shield_moon';
    ctx.fillStyle = moon ? '#7292bd' : '#8d6642';
    ctx.beginPath(); ctx.moveTo(0, -18); ctx.quadraticCurveTo(16, -12, 13, 3); ctx.quadraticCurveTo(8, 16, 0, 20); ctx.quadraticCurveTo(-8, 16, -13, 3); ctx.quadraticCurveTo(-16, -12, 0, -18); ctx.fill();
    ctx.strokeStyle = moon ? '#e6f5ff' : '#d9b56a'; ctx.lineWidth = 2; ctx.stroke();
    ctx.beginPath(); ctx.arc(0, 0, 5, 0, TAU); ctx.stroke();
  } else if (icon === 'armor' || icon === 'robe' || icon === 'armor_gold') {
    const gold = icon === 'armor_gold';
    ctx.fillStyle = gold ? '#d8b45f' : icon === 'robe' ? '#5d4b86' : '#6e605c';
    ctx.beginPath(); ctx.moveTo(-10, -15); ctx.lineTo(10, -15); ctx.lineTo(14, -8); ctx.lineTo(9, 16); ctx.lineTo(0, 12); ctx.lineTo(-9, 16); ctx.lineTo(-14, -8); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = gold ? '#fff0b0' : '#a8978c'; ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.moveTo(-8, -13); ctx.lineTo(0, 2); ctx.lineTo(8, -13); ctx.stroke();
  } else if (icon === 'potion_red' || icon === 'potion_blue' || icon === 'potion_green' || icon === 'elixir') {
    const colors = { potion_red: '#d9525c', potion_blue: '#4f9bd9', potion_green: '#5ab779', elixir: '#e9bd58' };
    ctx.fillStyle = '#c8d2d8'; ctx.fillRect(-4, -18, 8, 7);
    ctx.fillStyle = '#7c5a44'; ctx.fillRect(-5, -20, 10, 3);
    ctx.fillStyle = colors[icon]; ctx.shadowBlur = 8; ctx.shadowColor = colors[icon];
    ctx.beginPath(); ctx.moveTo(-8, -10); ctx.quadraticCurveTo(-14, 2, -8, 12); ctx.quadraticCurveTo(0, 19, 8, 12); ctx.quadraticCurveTo(14, 2, 8, -10); ctx.closePath(); ctx.fill(); ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.beginPath(); ctx.ellipse(-4, 0, 2.2, 5, -0.3, 0, TAU); ctx.fill();
  } else if (icon === 'seal') {
    ctx.strokeStyle = '#d9b56a'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(0, 0, 14, 0, TAU); ctx.stroke();
    ctx.strokeStyle = '#8fd9ff'; ctx.lineWidth = 1.5;
    ctx.beginPath(); for (let i = 0; i <= 6; i++) { const a = i / 6 * TAU - Math.PI / 2; const x = Math.cos(a) * 9, y = Math.sin(a) * 9; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.stroke();
    ctx.fillStyle = '#d8f5ff'; ctx.beginPath(); ctx.arc(0, 0, 3, 0, TAU); ctx.fill();
  } else if (icon === 'ring' || icon === 'amulet' || icon === 'talisman' || icon === 'brooch') {
    ctx.strokeStyle = '#d9b56a'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(0, 3, 10, 0, TAU); ctx.stroke();
    if (icon === 'amulet') { ctx.strokeStyle = '#aab8c2'; ctx.beginPath(); ctx.arc(0, -9, 8, 0.2, Math.PI - 0.2); ctx.stroke(); }
    ctx.fillStyle = icon === 'talisman' ? '#ff9d52' : icon === 'amulet' ? '#d8f3ff' : '#8fc6ff';
    ctx.shadowBlur = 10; ctx.shadowColor = ctx.fillStyle;
    ctx.beginPath(); ctx.arc(0, 3, 4.5, 0, TAU); ctx.fill(); ctx.shadowBlur = 0;
  } else if (icon.startsWith('sigil')) {
    const col = icon === 'sigil_leaf' ? '#8fe6a2' : icon === 'sigil_stone' ? '#e3c27f' : '#c7b0ff';
    ctx.rotate(0.1);
    ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.shadowBlur = 10; ctx.shadowColor = col;
    ctx.beginPath(); ctx.arc(0, 0, 14, 0, TAU); ctx.stroke();
    ctx.beginPath();
    if (icon === 'sigil_leaf') { ctx.moveTo(0, -10); ctx.quadraticCurveTo(10, -2, 0, 10); ctx.quadraticCurveTo(-10, -2, 0, -10); }
    else if (icon === 'sigil_stone') { ctx.moveTo(0, -11); ctx.lineTo(9, -3); ctx.lineTo(6, 10); ctx.lineTo(-6, 10); ctx.lineTo(-9, -3); ctx.closePath(); }
    else { ctx.arc(0, 0, 7, 0.3, 5.7); }
    ctx.fill(); ctx.shadowBlur = 0;
    ctx.fillStyle = '#fff'; ctx.globalAlpha = 0.7; ctx.beginPath(); ctx.arc(0, 0, 2, 0, TAU); ctx.fill();
  } else if (icon === 'flower') {
    ctx.strokeStyle = '#6fa06a'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(0, 16); ctx.quadraticCurveTo(-3, 3, 0, -4); ctx.stroke();
    for (let i = 0; i < 6; i++) {
      const a = i / 6 * TAU;
      ctx.fillStyle = i % 2 ? '#e7fbff' : '#a9e2ff';
      ctx.beginPath(); ctx.ellipse(Math.cos(a) * 6, -6 + Math.sin(a) * 3, 6, 3, a, 0, TAU); ctx.fill();
    }
    ctx.fillStyle = '#fff2ac'; ctx.beginPath(); ctx.arc(0, -6, 3.5, 0, TAU); ctx.fill();
  } else if (icon === 'core' || icon === 'soul' || icon === 'ember' || icon === 'feather' || icon === 'key') {
    const col = { core: '#b7a27b', soul: '#b7a7e6', ember: '#ff9f5d', feather: '#ffc36a', key: '#d8b56b' }[icon];
    ctx.fillStyle = col; ctx.shadowBlur = 10; ctx.shadowColor = col;
    if (icon === 'feather') {
      ctx.beginPath(); ctx.moveTo(-10, 14); ctx.quadraticCurveTo(2, 2, 10, -16); ctx.quadraticCurveTo(16, -2, 2, 10); ctx.closePath(); ctx.fill();
    } else if (icon === 'key') {
      ctx.beginPath(); ctx.arc(-5, -6, 7, 0, TAU); ctx.fill();
      ctx.fillRect(-2, 0, 5, 15); ctx.fillRect(3, 11, 7, 4);
    } else {
      ctx.beginPath(); ctx.moveTo(0, -14); ctx.lineTo(10, -3); ctx.lineTo(5, 13); ctx.lineTo(-7, 12); ctx.lineTo(-10, -4); ctx.closePath(); ctx.fill();
    }
    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(255,255,255,.4)'; ctx.beginPath(); ctx.arc(-3, -4, 2.5, 0, TAU); ctx.fill();
  } else {
    ctx.fillStyle = rarityColor;
    ctx.beginPath(); ctx.arc(0, 0, 11, 0, TAU); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.3)'; ctx.beginPath(); ctx.arc(-3, -3, 4, 0, TAU); ctx.fill();
  }
  ctx.restore();
  // Marco de rareza.
  ctx.strokeStyle = rarityColor; ctx.globalAlpha = 0.55; ctx.lineWidth = 1.5;
  ctx.strokeRect(1, 1, w - 2, h - 2);
  ctx.globalAlpha = 1;
}

export function drawCreatureIcon(canvas, def) {
  const ctx = canvas.getContext('2d');
  const w = canvas.width, h = canvas.height;
  ctx.clearRect(0, 0, w, h);
  const bg = ctx.createRadialGradient(w / 2, h / 2, 2, w / 2, h / 2, w / 2);
  bg.addColorStop(0, rgba(def.accent, 0.35)); bg.addColorStop(1, 'rgba(16,14,26,.2)');
  ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h);
  ctx.save(); ctx.translate(w / 2, h * 0.64); ctx.scale(w / 64, h / 64);
  const fake = { def, elite: false, seed: 0 };
  if (def.type === 'gelatina') drawSlime(ctx, fake, 0);
  else if (def.type === 'lobo') drawWolf(ctx, fake, 0);
  else if (def.type === 'escarabajo') drawBeetle(ctx, fake, 0);
  else if (def.type === 'espectro') drawWraith(ctx, fake, 0);
  else if (def.type === 'fenix') drawFenix(ctx, fake, 0);
  ctx.restore();
  ctx.strokeStyle = rgba(def.accent, 0.55); ctx.lineWidth = 1.5; ctx.strokeRect(1, 1, w - 2, h - 2);
}
