// Procedural sprite & environment art. Everything is drawn once into offscreen
// canvases at 2x and blitted at runtime, which keeps hundreds of enemies cheap.

import { mulberry32, pick, rand, randInt } from './rng.js';

function makeCanvas(w, h) {
  const c = document.createElement('canvas');
  c.width = Math.ceil(w);
  c.height = Math.ceil(h);
  return c;
}

function layer(w, h, draw, scale = 2) {
  const c = makeCanvas(w * scale, h * scale);
  const ctx = c.getContext('2d');
  ctx.scale(scale, scale);
  draw(ctx, w, h);
  return c;
}

function ellipse(ctx, x, y, rx, ry, fill) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fillStyle = fill;
  ctx.fill();
}

function glowDot(ctx, x, y, r, color) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, color);
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

/* ============================================================
   PLAYER — the Gravebound
   ============================================================ */
function drawPlayer(ctx) {
  // Scythe behind
  ctx.save();
  ctx.translate(0, 0);
  ctx.rotate(-0.42);
  ctx.strokeStyle = '#33231a';
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-34, 34);
  ctx.lineTo(30, -38);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(201,169,98,0.32)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(-33, 32);
  ctx.lineTo(29, -36);
  ctx.stroke();
  // blade
  const blade = ctx.createLinearGradient(26, -36, 48, -18);
  blade.addColorStop(0, '#ffffff');
  blade.addColorStop(0.5, '#b9c5c9');
  blade.addColorStop(1, '#4b535c');
  ctx.fillStyle = blade;
  ctx.beginPath();
  ctx.moveTo(27, -36);
  ctx.quadraticCurveTo(50, -36, 48, -13);
  ctx.quadraticCurveTo(38, -22, 27, -36);
  ctx.fill();
  ctx.strokeStyle = 'rgba(102,217,200,0.9)';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(30, -35);
  ctx.quadraticCurveTo(45, -33, 46, -18);
  ctx.stroke();
  ctx.restore();

  // cloak / body
  const cloak = ctx.createLinearGradient(-26, -34, 22, 34);
  cloak.addColorStop(0, '#4c3a60');
  cloak.addColorStop(0.42, '#2e2140');
  cloak.addColorStop(1, '#100b18');
  ctx.fillStyle = cloak;
  ctx.beginPath();
  ctx.moveTo(0, -42);
  ctx.quadraticCurveTo(-20, -40, -24, -16);
  ctx.quadraticCurveTo(-30, 8, -26, 33);
  ctx.lineTo(-13, 28);
  ctx.lineTo(-7, 36);
  ctx.lineTo(0, 30);
  ctx.lineTo(8, 37);
  ctx.lineTo(14, 27);
  ctx.lineTo(26, 33);
  ctx.quadraticCurveTo(30, 6, 24, -16);
  ctx.quadraticCurveTo(20, -40, 0, -42);
  ctx.fill();
  // outline for readability
  ctx.strokeStyle = 'rgba(10,7,15,0.9)';
  ctx.lineWidth = 1.8;
  ctx.stroke();

  // teal rim light
  ctx.strokeStyle = 'rgba(128,255,235,0.7)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-19, -34);
  ctx.quadraticCurveTo(-26, -10, -22, 29);
  ctx.stroke();

  // shoulder mantle
  const mantle = ctx.createLinearGradient(-22, -30, 20, -8);
  mantle.addColorStop(0, '#69507a');
  mantle.addColorStop(1, '#241833');
  ctx.fillStyle = mantle;
  ctx.beginPath();
  ctx.moveTo(-22, -24);
  ctx.quadraticCurveTo(0, -34, 22, -24);
  ctx.quadraticCurveTo(16, -10, 5, -8);
  ctx.lineTo(0, -16);
  ctx.lineTo(-5, -8);
  ctx.quadraticCurveTo(-16, -10, -22, -24);
  ctx.fill();
  ctx.strokeStyle = 'rgba(201,169,98,0.5)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(-21, -23);
  ctx.quadraticCurveTo(0, -32, 21, -23);
  ctx.stroke();

  // crimson scarf
  ctx.fillStyle = '#a82135';
  ctx.beginPath();
  ctx.moveTo(-9, -20);
  ctx.quadraticCurveTo(0, -16, 9, -20);
  ctx.lineTo(6, -13);
  ctx.quadraticCurveTo(0, -10, -6, -13);
  ctx.fill();
  ctx.fillStyle = '#d63a4f';
  ctx.beginPath();
  ctx.moveTo(7, -17);
  ctx.quadraticCurveTo(16, -10, 12, 0);
  ctx.lineTo(8, -12);
  ctx.fill();

  // hood opening
  const hood = ctx.createRadialGradient(0, -31, 1, 0, -29, 15);
  hood.addColorStop(0, '#030208');
  hood.addColorStop(1, '#1a1226');
  ctx.fillStyle = hood;
  ctx.beginPath();
  ctx.ellipse(0, -29, 10.5, 12, 0, 0, Math.PI * 2);
  ctx.fill();

  // eyes
  glowDot(ctx, -4, -30, 8, 'rgba(102,217,200,0.6)');
  glowDot(ctx, 4, -30, 8, 'rgba(102,217,200,0.6)');
  ctx.fillStyle = '#d6fff8';
  ctx.beginPath();
  ctx.ellipse(-4, -30, 2.6, 1.5, -0.15, 0, Math.PI * 2);
  ctx.ellipse(4, -30, 2.6, 1.5, 0.15, 0, Math.PI * 2);
  ctx.fill();

  // hands
  ctx.fillStyle = '#b9a7a0';
  ellipse(ctx, -15, 8, 3.6, 5, '#b5a19c');
  ellipse(ctx, 14, 10, 3.2, 4.6, '#b5a19c');

  // belt + boots
  ctx.fillStyle = '#4a3521';
  ctx.fillRect(-10, 16, 20, 3);
  ctx.fillStyle = '#e0bd72';
  ctx.fillRect(-2.5, 16, 5, 3);
  ctx.fillStyle = '#100b18';
  ellipse(ctx, -7, 32, 5.5, 3.2, '#100b18');
  ellipse(ctx, 7, 32, 5.5, 3.2, '#100b18');
}

/* ============================================================
   ENEMIES
   ============================================================ */
function drawGhoul(ctx) {
  const skin = ctx.createLinearGradient(-18, -34, 18, 28);
  skin.addColorStop(0, '#8a9c79');
  skin.addColorStop(0.5, '#5d6d52');
  skin.addColorStop(1, '#35402f');
  // legs
  ctx.strokeStyle = '#44513c';
  ctx.lineWidth = 8;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-9, 8); ctx.lineTo(-13, 28);
  ctx.moveTo(9, 8); ctx.lineTo(14, 28);
  ctx.stroke();
  // torso hunched
  ctx.fillStyle = skin;
  ctx.beginPath();
  ctx.moveTo(-20, -12);
  ctx.quadraticCurveTo(-26, 8, -12, 12);
  ctx.quadraticCurveTo(0, 16, 13, 11);
  ctx.quadraticCurveTo(26, 4, 18, -14);
  ctx.quadraticCurveTo(4, -24, -20, -12);
  ctx.fill();
  // belly highlight
  ellipse(ctx, 1, 4, 12, 8, 'rgba(158,178,134,0.22)');
  // loincloth
  ctx.fillStyle = '#2c241c';
  ctx.beginPath();
  ctx.moveTo(-13, 9); ctx.lineTo(13, 9); ctx.lineTo(10, 20); ctx.lineTo(-10, 20);
  ctx.fill();
  // arms / claws
  ctx.strokeStyle = '#52613f';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(-18, -10); ctx.quadraticCurveTo(-30, 2, -27, 18);
  ctx.moveTo(18, -10); ctx.quadraticCurveTo(30, 0, 28, 17);
  ctx.stroke();
  ctx.strokeStyle = '#d8d2bb';
  ctx.lineWidth = 1.8;
  for (const side of [-1, 1]) {
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.moveTo(side * 27, 18);
      ctx.lineTo(side * (27 + 4 - i), 25 + i);
      ctx.stroke();
    }
  }
  // head
  ctx.save();
  ctx.translate(0, -20);
  ctx.rotate(-0.12);
  ctx.fillStyle = skin;
  ctx.beginPath();
  ctx.ellipse(0, 0, 11, 10.5, 0, 0, Math.PI * 2);
  ctx.fill();
  // jaw
  ctx.fillStyle = '#4a5740';
  ctx.beginPath();
  ctx.moveTo(-7, 5); ctx.quadraticCurveTo(0, 12, 8, 5); ctx.lineTo(6, 1); ctx.lineTo(-6, 1);
  ctx.fill();
  // teeth
  ctx.fillStyle = '#ded7c0';
  for (let i = -1; i <= 1; i++) {
    ctx.beginPath();
    ctx.moveTo(i * 4 - 1.4, 6);
    ctx.lineTo(i * 4 + 1.4, 6);
    ctx.lineTo(i * 4, 10);
    ctx.fill();
  }
  // eyes
  glowDot(ctx, -4.5, -2, 6, 'rgba(255,70,50,0.3)');
  glowDot(ctx, 4.5, -2, 6, 'rgba(255,70,50,0.3)');
  ctx.fillStyle = '#ff6a4a';
  ctx.beginPath();
  ctx.ellipse(-4.5, -2, 2, 1.4, 0.2, 0, Math.PI * 2);
  ctx.ellipse(4.5, -2, 2, 1.4, -0.2, 0, Math.PI * 2);
  ctx.fill();
  // scar
  ctx.strokeStyle = 'rgba(90,25,25,0.7)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(-9, -6); ctx.lineTo(-2, 3);
  ctx.stroke();
  // horns / spikes
  ctx.fillStyle = '#3a3328';
  ctx.beginPath();
  ctx.moveTo(-8, -8); ctx.lineTo(-13, -16); ctx.lineTo(-4, -10);
  ctx.moveTo(8, -8); ctx.lineTo(13, -15); ctx.lineTo(4, -10);
  ctx.fill();
  ctx.restore();
}

function drawSkeleton(ctx) {
  const bone = '#d9d3bd';
  const boneDark = '#9c9580';
  // legs
  ctx.strokeStyle = bone;
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-6, 8); ctx.lineTo(-10, 18); ctx.lineTo(-8, 30);
  ctx.moveTo(6, 8); ctx.lineTo(10, 18); ctx.lineTo(8, 30);
  ctx.stroke();
  ctx.strokeStyle = boneDark;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-8, 30); ctx.lineTo(-14, 32);
  ctx.moveTo(8, 30); ctx.lineTo(14, 32);
  ctx.stroke();
  // pelvis
  ctx.fillStyle = bone;
  ctx.beginPath();
  ctx.ellipse(0, 5, 8, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  // spine
  ctx.strokeStyle = bone;
  ctx.lineWidth = 3.4;
  ctx.beginPath();
  ctx.moveTo(0, 3); ctx.lineTo(0, -20);
  ctx.stroke();
  // ribs
  ctx.strokeStyle = 'rgba(217,211,189,0.95)';
  ctx.lineWidth = 2;
  for (let i = 0; i < 4; i++) {
    const y = -15 + i * 4;
    ctx.beginPath();
    ctx.ellipse(0, y, 10 - i * 0.6, 3.4, 0, 0.15, Math.PI - 0.15, true);
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(0, y, 10 - i * 0.6, 3.4, 0, Math.PI + 0.15, -0.15, true);
    ctx.stroke();
  }
  // shoulders
  ellipse(ctx, -12, -18, 5, 3.6, bone);
  ellipse(ctx, 12, -18, 5, 3.6, bone);
  // arms
  ctx.strokeStyle = bone;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-12, -17); ctx.lineTo(-18, -2); ctx.lineTo(-16, 12);
  ctx.moveTo(12, -17); ctx.lineTo(19, -4); ctx.lineTo(22, 8);
  ctx.stroke();
  // sword
  ctx.save();
  ctx.translate(22, 8);
  ctx.rotate(0.28);
  ctx.strokeStyle = '#6a6252';
  ctx.lineWidth = 2.6;
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 18); ctx.stroke();
  ctx.strokeStyle = '#8e8571';
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-4, 5); ctx.moveTo(0, 0); ctx.lineTo(4, 5); ctx.stroke();
  ctx.fillStyle = '#a9a18c';
  ctx.beginPath(); ctx.moveTo(-2, 1); ctx.lineTo(2, 1); ctx.lineTo(0, 22); ctx.fill();
  ctx.restore();
  // shield
  ctx.save();
  ctx.translate(-18, 2);
  ctx.rotate(-0.12);
  ctx.fillStyle = '#3a332c';
  ctx.strokeStyle = '#6e6150';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(0, -8); ctx.lineTo(8, -6); ctx.lineTo(7, 6); ctx.lineTo(0, 12); ctx.lineTo(-7, 6); ctx.lineTo(-8, -6);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.strokeStyle = '#8a7b62';
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(-4, 0); ctx.lineTo(4, 0); ctx.moveTo(0, -5); ctx.lineTo(0, 6); ctx.stroke();
  ctx.restore();
  // skull
  ctx.save();
  ctx.translate(0, -27);
  ctx.fillStyle = bone;
  ctx.beginPath();
  ctx.ellipse(0, 0, 8.5, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(-5, 5); ctx.lineTo(5, 5); ctx.lineTo(3.5, 11); ctx.lineTo(-3.5, 11); ctx.fill();
  // eyes
  glowDot(ctx, -3.4, -2, 5, 'rgba(255,50,50,0.35)');
  glowDot(ctx, 3.4, -2, 5, 'rgba(255,50,50,0.35)');
  ctx.fillStyle = '#ff5545';
  ctx.beginPath();
  ctx.ellipse(-3.4, -2, 1.7, 1.9, 0, 0, Math.PI * 2);
  ctx.ellipse(3.4, -2, 1.7, 1.9, 0, 0, Math.PI * 2);
  ctx.fill();
  // nose + teeth
  ctx.fillStyle = '#5d5748';
  ctx.beginPath();
  ctx.moveTo(0, 2); ctx.lineTo(-1.4, 4); ctx.lineTo(1.4, 4); ctx.fill();
  ctx.strokeStyle = '#6d6655';
  ctx.lineWidth = 0.8;
  for (let i = -1; i <= 1; i++) {
    ctx.beginPath(); ctx.moveTo(i * 2.6, 7); ctx.lineTo(i * 2.6, 10); ctx.stroke();
  }
  ctx.restore();
}

function drawBat(ctx, frame) {
  const flap = frame ? -0.35 : 0.15;
  const wing = ctx.createLinearGradient(0, -10, 0, 20);
  wing.addColorStop(0, '#514065');
  wing.addColorStop(0.6, '#2a1e38');
  wing.addColorStop(1, '#140e1d');
  // wings
  for (const side of [-1, 1]) {
    ctx.save();
    ctx.scale(side, 1);
    ctx.rotate(flap * side * side);
    ctx.fillStyle = wing;
    ctx.beginPath();
    ctx.moveTo(3, -4);
    ctx.quadraticCurveTo(18, -16, 28, -8);
    ctx.quadraticCurveTo(22, 0, 26, 5);
    ctx.quadraticCurveTo(16, 2, 18, 12);
    ctx.quadraticCurveTo(10, 5, 3, 8);
    ctx.fill();
    ctx.strokeStyle = 'rgba(120,90,140,0.5)';
    ctx.lineWidth = 0.9;
    ctx.beginPath();
    ctx.moveTo(4, -2); ctx.quadraticCurveTo(16, -10, 27, -8);
    ctx.moveTo(5, 2); ctx.quadraticCurveTo(14, 2, 26, 5);
    ctx.stroke();
    ctx.restore();
  }
  // body
  ellipse(ctx, 0, 0, 7, 9, '#2c2039');
  // head
  ellipse(ctx, 0, -8, 5.5, 5, '#3b2b4b');
  // ears
  ctx.fillStyle = '#2c2039';
  ctx.beginPath();
  ctx.moveTo(-4, -12); ctx.lineTo(-6, -19); ctx.lineTo(-1.5, -13);
  ctx.moveTo(4, -12); ctx.lineTo(6, -19); ctx.lineTo(1.5, -13);
  ctx.fill();
  // eyes
  glowDot(ctx, -2.4, -8.5, 4, 'rgba(255,60,70,0.35)');
  glowDot(ctx, 2.4, -8.5, 4, 'rgba(255,60,70,0.35)');
  ctx.fillStyle = '#ff6b6b';
  ctx.beginPath();
  ctx.arc(-2.4, -8.5, 1.2, 0, Math.PI * 2);
  ctx.arc(2.4, -8.5, 1.2, 0, Math.PI * 2);
  ctx.fill();
  // fangs
  ctx.fillStyle = '#f1ead8';
  ctx.beginPath();
  ctx.moveTo(-2.2, 3); ctx.lineTo(-1.2, 6.5); ctx.lineTo(-0.4, 3);
  ctx.moveTo(2.2, 3); ctx.lineTo(1.2, 6.5); ctx.lineTo(0.4, 3);
  ctx.fill();
}

function drawWraith(ctx) {
  const robe = ctx.createLinearGradient(0, -34, 0, 30);
  robe.addColorStop(0, 'rgba(120,224,210,0.82)');
  robe.addColorStop(0.45, 'rgba(43,112,110,0.72)');
  robe.addColorStop(1, 'rgba(10,40,44,0)');
  // trailing body
  ctx.fillStyle = robe;
  ctx.beginPath();
  ctx.moveTo(0, -38);
  ctx.quadraticCurveTo(-18, -38, -20, -14);
  ctx.quadraticCurveTo(-24, 10, -14, 32);
  ctx.quadraticCurveTo(-8, 22, -3, 34);
  ctx.quadraticCurveTo(2, 22, 7, 33);
  ctx.quadraticCurveTo(14, 22, 16, 32);
  ctx.quadraticCurveTo(24, 8, 20, -14);
  ctx.quadraticCurveTo(18, -38, 0, -38);
  ctx.fill();
  // rim
  ctx.strokeStyle = 'rgba(169,255,242,0.55)';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(-17, -30);
  ctx.quadraticCurveTo(-24, -4, -13, 27);
  ctx.stroke();
  // hood cavity
  ctx.fillStyle = '#04100f';
  ctx.beginPath();
  ctx.ellipse(0, -26, 9.5, 11, 0, 0, Math.PI * 2);
  ctx.fill();
  // hollow eyes
  glowDot(ctx, -3.6, -27, 6, 'rgba(150,255,240,0.4)');
  glowDot(ctx, 3.6, -27, 6, 'rgba(150,255,240,0.4)');
  ctx.fillStyle = '#d6fff8';
  ctx.beginPath();
  ctx.ellipse(-3.6, -27, 1.8, 1.2, 0.2, 0, Math.PI * 2);
  ctx.ellipse(3.6, -27, 1.8, 1.2, -0.2, 0, Math.PI * 2);
  ctx.fill();
  // spectral arms
  ctx.strokeStyle = 'rgba(140,235,220,0.6)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-16, -12); ctx.quadraticCurveTo(-26, 0, -22, 10);
  ctx.moveTo(16, -12); ctx.quadraticCurveTo(26, 0, 22, 10);
  ctx.stroke();
  // wisp motes
  for (let i = 0; i < 4; i++) {
    const x = Math.sin(i * 2.1) * 18;
    const y = 12 + i * 5;
    glowDot(ctx, x, y, 2.4, 'rgba(140,255,240,0.5)');
  }
}

function drawBrute(ctx) {
  const skin = ctx.createLinearGradient(-30, -30, 30, 30);
  skin.addColorStop(0, '#7d7b82');
  skin.addColorStop(0.5, '#575761');
  skin.addColorStop(1, '#2e2e38');
  // legs
  ctx.fillStyle = '#3c3b45';
  ctx.beginPath();
  ctx.roundRect(-20, 8, 14, 24, 5);
  ctx.roundRect(6, 8, 14, 24, 5);
  ctx.fill();
  // body
  ctx.fillStyle = skin;
  ctx.beginPath();
  ctx.moveTo(-26, -20);
  ctx.quadraticCurveTo(-34, 6, -22, 14);
  ctx.quadraticCurveTo(0, 22, 22, 14);
  ctx.quadraticCurveTo(34, 4, 25, -21);
  ctx.quadraticCurveTo(0, -34, -26, -20);
  ctx.fill();
  // belly stitches
  ctx.strokeStyle = 'rgba(28,24,30,0.8)';
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(-8, -6); ctx.quadraticCurveTo(0, 8, 10, -8);
  ctx.stroke();
  for (let i = -1; i <= 1; i++) {
    ctx.beginPath();
    ctx.moveTo(i * 5 - 1, 1); ctx.lineTo(i * 5 + 2, 3);
    ctx.stroke();
  }
  // arms
  ctx.strokeStyle = skin;
  ctx.lineWidth = 11;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-24, -14); ctx.quadraticCurveTo(-38, 2, -33, 18);
  ctx.moveTo(24, -14); ctx.quadraticCurveTo(38, -2, 32, 16);
  ctx.stroke();
  // cleaver
  ctx.save();
  ctx.translate(32, 14);
  ctx.rotate(0.28);
  ctx.fillStyle = '#6d6a72';
  ctx.beginPath();
  ctx.moveTo(0, -6); ctx.lineTo(16, -12); ctx.lineTo(19, 18); ctx.lineTo(3, 12);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,120,90,0.5)';
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(4, -7); ctx.lineTo(16, -11); ctx.stroke();
  ctx.fillStyle = '#2e2119';
  ctx.fillRect(-4, -4, 6, 16);
  ctx.restore();
  // head
  ctx.save();
  ctx.translate(0, -27);
  ctx.fillStyle = '#66646e';
  ctx.beginPath();
  ctx.ellipse(0, 0, 11, 9, 0, 0, Math.PI * 2);
  ctx.fill();
  // tusks
  ctx.fillStyle = '#e2dac5';
  ctx.beginPath();
  ctx.moveTo(-6, 5); ctx.lineTo(-9, 12); ctx.lineTo(-2, 6);
  ctx.moveTo(6, 5); ctx.lineTo(9, 12); ctx.lineTo(2, 6);
  ctx.fill();
  // eyes
  glowDot(ctx, -4, -2, 5, 'rgba(255,180,40,0.35)');
  glowDot(ctx, 4, -2, 5, 'rgba(255,180,40,0.35)');
  ctx.fillStyle = '#ffd257';
  ctx.beginPath();
  ctx.ellipse(-4, -2, 1.8, 1.2, 0, 0, Math.PI * 2);
  ctx.ellipse(4, -2, 1.8, 1.2, 0, 0, Math.PI * 2);
  ctx.fill();
  // iron band
  ctx.strokeStyle = '#2b2a31';
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(-9, -6); ctx.quadraticCurveTo(0, -10, 9, -6);
  ctx.stroke();
  ctx.restore();
}

function drawBoss(ctx) {
  // cloak
  const cloak = ctx.createLinearGradient(0, -50, 0, 54);
  cloak.addColorStop(0, '#521524');
  cloak.addColorStop(0.4, '#2c0a14');
  cloak.addColorStop(1, '#0c0409');
  ctx.fillStyle = cloak;
  ctx.beginPath();
  ctx.moveTo(0, -58);
  ctx.quadraticCurveTo(-40, -60, -52, -22);
  ctx.quadraticCurveTo(-66, 24, -58, 54);
  ctx.lineTo(-34, 42);
  ctx.lineTo(-22, 56);
  ctx.lineTo(-8, 44);
  ctx.lineTo(0, 58);
  ctx.lineTo(8, 44);
  ctx.lineTo(22, 56);
  ctx.lineTo(34, 42);
  ctx.lineTo(58, 54);
  ctx.quadraticCurveTo(66, 22, 52, -22);
  ctx.quadraticCurveTo(40, -60, 0, -58);
  ctx.fill();
  // cloak inner red
  const inner = ctx.createLinearGradient(0, -40, 0, 50);
  inner.addColorStop(0, 'rgba(178,28,50,0.55)');
  inner.addColorStop(1, 'rgba(80,8,22,0.05)');
  ctx.fillStyle = inner;
  ctx.beginPath();
  ctx.moveTo(-20, -44);
  ctx.quadraticCurveTo(-36, 0, -26, 48);
  ctx.quadraticCurveTo(0, 36, 26, 48);
  ctx.quadraticCurveTo(36, 0, 20, -44);
  ctx.fill();
  // body armor
  const armor = ctx.createLinearGradient(-20, -30, 20, 30);
  armor.addColorStop(0, '#5b3a44');
  armor.addColorStop(0.5, '#2f1a22');
  armor.addColorStop(1, '#150a10');
  ctx.fillStyle = armor;
  ctx.beginPath();
  ctx.moveTo(-18, -40);
  ctx.quadraticCurveTo(-24, -6, -14, 34);
  ctx.lineTo(14, 34);
  ctx.quadraticCurveTo(24, -6, 18, -40);
  ctx.quadraticCurveTo(0, -50, -18, -40);
  ctx.fill();
  // chest sigil
  ctx.strokeStyle = 'rgba(255,180,90,0.7)';
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(0, -26); ctx.lineTo(6, -18); ctx.lineTo(0, -10); ctx.lineTo(-6, -18); ctx.closePath();
  ctx.stroke();
  ctx.fillStyle = 'rgba(255,180,90,0.28)';
  ctx.fill();
  // high collar
  ctx.fillStyle = '#3a0d17';
  ctx.beginPath();
  ctx.moveTo(-16, -44); ctx.lineTo(-30, -62); ctx.lineTo(-12, -54);
  ctx.moveTo(16, -44); ctx.lineTo(30, -62); ctx.lineTo(12, -54);
  ctx.fill();
  // arms
  ctx.strokeStyle = '#3b2029';
  ctx.lineWidth = 10;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-20, -30); ctx.quadraticCurveTo(-40, -8, -37, 18);
  ctx.moveTo(20, -30); ctx.quadraticCurveTo(40, -8, 37, 18);
  ctx.stroke();
  // claws
  ctx.strokeStyle = '#cbbfae';
  ctx.lineWidth = 1.6;
  for (const side of [-1, 1]) {
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.moveTo(side * 36, 17);
      ctx.lineTo(side * (36 + i * 2 - 1), 28 + i * 2);
      ctx.stroke();
    }
  }
  // head
  ctx.save();
  ctx.translate(0, -52);
  // hair
  ctx.fillStyle = '#0f070c';
  ctx.beginPath();
  ctx.ellipse(0, -3, 15, 14, 0, Math.PI, 0);
  ctx.fill();
  // face
  const face = ctx.createLinearGradient(0, -8, 0, 12);
  face.addColorStop(0, '#e8d6c9');
  face.addColorStop(1, '#a98f8c');
  ctx.fillStyle = face;
  ctx.beginPath();
  ctx.ellipse(0, 2, 10, 12, 0, 0, Math.PI * 2);
  ctx.fill();
  // red eyes
  glowDot(ctx, -4.4, -1, 7, 'rgba(255,30,50,0.5)');
  glowDot(ctx, 4.4, -1, 7, 'rgba(255,30,50,0.5)');
  ctx.fillStyle = '#ff334e';
  ctx.beginPath();
  ctx.ellipse(-4.4, -1, 2.2, 1.2, 0.12, 0, Math.PI * 2);
  ctx.ellipse(4.4, -1, 2.2, 1.2, -0.12, 0, Math.PI * 2);
  ctx.fill();
  // mouth + fangs
  ctx.strokeStyle = '#5e222a';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(-4, 8); ctx.quadraticCurveTo(0, 10, 4, 8);
  ctx.stroke();
  ctx.fillStyle = '#f0e7d8';
  ctx.beginPath();
  ctx.moveTo(-3, 8); ctx.lineTo(-2, 12); ctx.lineTo(-1, 8);
  ctx.moveTo(3, 8); ctx.lineTo(2, 12); ctx.lineTo(1, 8);
  ctx.fill();
  // crown
  ctx.fillStyle = '#b58b3f';
  ctx.beginPath();
  ctx.moveTo(-11, -10); ctx.lineTo(-11, -20); ctx.lineTo(-6, -14); ctx.lineTo(0, -23); ctx.lineTo(6, -14); ctx.lineTo(11, -20); ctx.lineTo(11, -10);
  ctx.fill();
  ctx.strokeStyle = '#f0d18a';
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.restore();
}

function drawFiend(ctx) {
  // sack
  ctx.fillStyle = '#5e4a26';
  ctx.beginPath();
  ctx.ellipse(18, 8, 14, 16, -0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#c9a962';
  ctx.beginPath();
  ctx.arc(17, 2, 4, 0, Math.PI * 2);
  ctx.fill();
  // body
  const skin = ctx.createLinearGradient(-15, -25, 15, 20);
  skin.addColorStop(0, '#8dae5a');
  skin.addColorStop(0.6, '#5c7a3d');
  skin.addColorStop(1, '#344624');
  ctx.fillStyle = skin;
  ctx.beginPath();
  ctx.ellipse(0, -2, 13, 15, 0, 0, Math.PI * 2);
  ctx.fill();
  // legs
  ctx.strokeStyle = '#3f532a';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(-6, 10); ctx.lineTo(-10, 22);
  ctx.moveTo(6, 10); ctx.lineTo(11, 22);
  ctx.stroke();
  // arms
  ctx.beginPath();
  ctx.moveTo(-12, -6); ctx.quadraticCurveTo(-22, 2, -19, 12);
  ctx.moveTo(12, -6); ctx.quadraticCurveTo(20, 0, 20, 8);
  ctx.stroke();
  // head
  ctx.fillStyle = skin;
  ctx.beginPath();
  ctx.ellipse(0, -20, 11, 10, 0, 0, Math.PI * 2);
  ctx.fill();
  // ears
  ctx.beginPath();
  ctx.moveTo(-9, -22); ctx.lineTo(-22, -28); ctx.lineTo(-9, -16);
  ctx.moveTo(9, -22); ctx.lineTo(22, -28); ctx.lineTo(9, -16);
  ctx.fill();
  // hood
  ctx.fillStyle = '#4a3527';
  ctx.beginPath();
  ctx.moveTo(-10, -25);
  ctx.quadraticCurveTo(0, -35, 10, -25);
  ctx.quadraticCurveTo(8, -17, 0, -16);
  ctx.quadraticCurveTo(-8, -17, -10, -25);
  ctx.fill();
  // eyes
  ctx.fillStyle = '#ffe27a';
  ctx.beginPath();
  ctx.ellipse(-4, -21, 2, 1.3, 0.2, 0, Math.PI * 2);
  ctx.ellipse(4, -21, 2, 1.3, -0.2, 0, Math.PI * 2);
  ctx.fill();
  // grin
  ctx.strokeStyle = '#23301a';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(-4, -15); ctx.quadraticCurveTo(0, -12, 4, -15);
  ctx.stroke();
  // lantern
  ctx.save();
  ctx.translate(-20, 12);
  glowDot(ctx, 0, 0, 16, 'rgba(255,190,80,0.4)');
  ctx.fillStyle = '#2a2119';
  ctx.fillRect(-4, -6, 8, 12);
  ctx.fillStyle = '#ffd77a';
  ctx.fillRect(-2.5, -4, 5, 8);
  ctx.strokeStyle = '#8a7444';
  ctx.lineWidth = 1;
  ctx.strokeRect(-4, -6, 8, 12);
  ctx.restore();
}

/* ============================================================
   PROPS / DECOR
   ============================================================ */
function drawTombstone(ctx, seed) {
  const rng = mulberry32(seed);
  const lean = rand(rng, -0.08, 0.08);
  ctx.save();
  ctx.translate(0, 0);
  ctx.rotate(lean);
  const stone = ctx.createLinearGradient(-20, -60, 20, 4);
  stone.addColorStop(0, '#57525b');
  stone.addColorStop(0.5, '#3c3941');
  stone.addColorStop(1, '#222027');
  ctx.fillStyle = stone;
  ctx.beginPath();
  ctx.moveTo(-20, 4);
  ctx.lineTo(-20, -44);
  ctx.quadraticCurveTo(-20, -62, 0, -62);
  ctx.quadraticCurveTo(20, -62, 20, -44);
  ctx.lineTo(20, 4);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = 'rgba(160,150,165,0.3)';
  ctx.lineWidth = 1;
  ctx.stroke();
  // moss
  ctx.fillStyle = 'rgba(80,110,65,0.45)';
  ctx.beginPath();
  ctx.ellipse(-14, -8, 10, 5, -0.4, 0, Math.PI * 2);
  ctx.ellipse(8, 2, 12, 4, 0.2, 0, Math.PI * 2);
  ctx.fill();
  // carving
  ctx.strokeStyle = 'rgba(20,18,24,0.65)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, -52); ctx.lineTo(0, -24);
  ctx.moveTo(-7, -44); ctx.lineTo(7, -44);
  ctx.stroke();
  // crack
  ctx.strokeStyle = 'rgba(15,13,18,0.55)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(-5, -60); ctx.lineTo(-1, -46); ctx.lineTo(-6, -36);
  ctx.stroke();
  // dirt
  ctx.fillStyle = 'rgba(40,35,28,0.55)';
  ctx.beginPath(); ctx.ellipse(0, 3, 24, 5, 0, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

function drawCross(ctx) {
  ctx.save();
  ctx.rotate(0.12);
  const stone = ctx.createLinearGradient(-10, -64, 10, 4);
  stone.addColorStop(0, '#615c66');
  stone.addColorStop(1, '#29262e');
  ctx.fillStyle = stone;
  ctx.fillRect(-5, -58, 10, 62);
  ctx.fillRect(-19, -46, 38, 9);
  ctx.strokeStyle = 'rgba(160,150,165,0.25)';
  ctx.lineWidth = 1;
  ctx.strokeRect(-5, -58, 10, 62);
  ctx.strokeRect(-19, -46, 38, 9);
  ctx.fillStyle = 'rgba(80,110,65,0.4)';
  ctx.beginPath(); ctx.ellipse(-13, -44, 8, 4, -0.3, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(8, -18, 7, 3, 0.4, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'rgba(40,35,28,0.5)';
  ctx.beginPath(); ctx.ellipse(0, 5, 20, 4, 0, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

function drawDeadTree(ctx) {
  ctx.strokeStyle = '#1e1920';
  ctx.lineCap = 'round';
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.moveTo(0, 6); ctx.lineTo(-2, -30); ctx.lineTo(0, -62);
  ctx.stroke();
  ctx.lineWidth = 4.5;
  ctx.beginPath();
  ctx.moveTo(-1, -34); ctx.lineTo(-20, -52);
  ctx.moveTo(-1, -46); ctx.lineTo(14, -66);
  ctx.moveTo(-2, -58); ctx.lineTo(-12, -78);
  ctx.stroke();
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(-20, -52); ctx.lineTo(-30, -60);
  ctx.moveTo(-20, -52); ctx.lineTo(-24, -70);
  ctx.moveTo(14, -66); ctx.lineTo(24, -72);
  ctx.moveTo(14, -66); ctx.lineTo(20, -82);
  ctx.moveTo(-12, -78); ctx.lineTo(-6, -90);
  ctx.stroke();
  // roots
  ctx.strokeStyle = '#171319';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(-1, 2); ctx.lineTo(-14, 10);
  ctx.moveTo(-1, 2); ctx.lineTo(13, 11);
  ctx.stroke();
  // hanging charm
  ctx.strokeStyle = 'rgba(201,169,98,0.55)';
  ctx.lineWidth = 0.8;
  ctx.beginPath(); ctx.moveTo(14, -66); ctx.lineTo(14, -56); ctx.stroke();
  ctx.fillStyle = 'rgba(201,169,98,0.7)';
  ctx.beginPath(); ctx.arc(14, -54, 2, 0, Math.PI * 2); ctx.fill();
}

function drawCandles(ctx, seed) {
  const rng = mulberry32(seed);
  for (let i = 0; i < 5; i++) {
    const x = rand(rng, -14, 14);
    const h = rand(rng, 7, 18);
    const y = 2 - rand(rng, 0, 6);
    ctx.fillStyle = '#d8cdb2';
    ctx.fillRect(x - 1.6, y - h, 3.2, h);
    ctx.fillStyle = 'rgba(180,165,135,0.45)';
    ctx.fillRect(x - 1.6, y - h, 1, h);
    ctx.fillStyle = '#4a4033';
    ctx.fillRect(x - 2.2, y - 1.4, 4.4, 2.4);
    glowDot(ctx, x, y - h - 2.4, 7, 'rgba(255,190,90,0.55)');
    ctx.fillStyle = '#ffd993';
    ctx.beginPath();
    ctx.ellipse(x, y - h - 2.2, 1.3, 2.3, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawPillar(ctx) {
  const stone = ctx.createLinearGradient(-16, -70, 16, 6);
  stone.addColorStop(0, '#565061');
  stone.addColorStop(0.5, '#3a3542');
  stone.addColorStop(1, '#211d26');
  ctx.fillStyle = stone;
  ctx.fillRect(-11, -58, 22, 64);
  ctx.fillStyle = '#4a4452';
  ctx.fillRect(-17, -64, 34, 8);
  ctx.fillRect(-17, 0, 34, 7);
  ctx.strokeStyle = 'rgba(0,0,0,0.35)';
  ctx.lineWidth = 1;
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.moveTo(-11, -48 + i * 16);
    ctx.lineTo(11, -48 + i * 16);
    ctx.stroke();
  }
  // broken top
  ctx.fillStyle = '#1b1720';
  ctx.beginPath();
  ctx.moveTo(-11, -58); ctx.lineTo(-4, -66); ctx.lineTo(3, -60); ctx.lineTo(11, -66); ctx.lineTo(11, -58);
  ctx.fill();
  ctx.fillStyle = 'rgba(80,110,65,0.35)';
  ctx.beginPath(); ctx.ellipse(-7, -10, 6, 12, 0.2, 0, Math.PI * 2); ctx.fill();
}

function drawBones(ctx, seed) {
  const rng = mulberry32(seed);
  for (let i = 0; i < 6; i++) {
    const x = rand(rng, -18, 18);
    const y = rand(rng, -6, 6);
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rand(rng, 0, Math.PI));
    ctx.strokeStyle = 'rgba(200,192,170,0.7)';
    ctx.lineWidth = 2.4;
    ctx.beginPath(); ctx.moveTo(-6, 0); ctx.lineTo(6, 0); ctx.stroke();
    ctx.fillStyle = 'rgba(205,197,176,0.75)';
    ctx.beginPath(); ctx.arc(-6, 0, 1.7, 0, Math.PI * 2); ctx.arc(6, 0, 1.7, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }
  // skull
  ctx.fillStyle = 'rgba(214,206,184,0.85)';
  ctx.beginPath();
  ctx.ellipse(4, -4, 6, 5, 0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#241f1b';
  ctx.beginPath();
  ctx.ellipse(2.4, -5, 1.4, 1.6, 0, 0, Math.PI * 2);
  ctx.ellipse(6, -5, 1.4, 1.6, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawMushrooms(ctx, seed) {
  const rng = mulberry32(seed);
  for (let i = 0; i < 4; i++) {
    const x = rand(rng, -14, 14);
    const y = rand(rng, -2, 5);
    const s = rand(rng, 0.7, 1.4);
    ctx.fillStyle = '#c9c3ae';
    ctx.fillRect(x - 1, y - 5 * s, 2, 5 * s);
    glowDot(ctx, x, y - 6 * s, 7, 'rgba(120,240,190,0.22)');
    ctx.fillStyle = '#3f7f68';
    ctx.beginPath();
    ctx.ellipse(x, y - 6 * s, 4.5 * s, 2.4 * s, 0, Math.PI, 0);
    ctx.fill();
  }
}

function drawStatue(ctx) {
  const stone = ctx.createLinearGradient(-18, -76, 18, 6);
  stone.addColorStop(0, '#625c6c');
  stone.addColorStop(1, '#2a2633');
  ctx.fillStyle = stone;
  ctx.beginPath();
  ctx.moveTo(-18, 4);
  ctx.lineTo(-15, -64);
  ctx.quadraticCurveTo(0, -80, 15, -64);
  ctx.lineTo(18, 4);
  ctx.fill();
  // hood
  ctx.fillStyle = '#211d2a';
  ctx.beginPath();
  ctx.ellipse(0, -57, 10, 12, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(102,217,200,0.4)';
  ctx.beginPath(); ctx.ellipse(-3.6, -58, 1.8, 1, 0, 0, Math.PI * 2); ctx.ellipse(3.6, -58, 1.8, 1, 0, 0, Math.PI * 2); ctx.fill();
  // folds
  ctx.strokeStyle = 'rgba(20,18,25,0.5)';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(-8, -42); ctx.quadraticCurveTo(-4, -20, -8, 0);
  ctx.moveTo(8, -42); ctx.quadraticCurveTo(4, -20, 8, 0);
  ctx.stroke();
  // base
  ctx.fillStyle = '#38323f';
  ctx.fillRect(-22, 0, 44, 8);
  ctx.fillStyle = 'rgba(80,110,65,0.3)';
  ctx.beginPath(); ctx.ellipse(10, -20, 5, 10, 0.2, 0, Math.PI * 2); ctx.fill();
}

function drawFence(ctx) {
  ctx.strokeStyle = '#2a2730';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-38, 0); ctx.lineTo(-38, -34);
  ctx.moveTo(38, 0); ctx.lineTo(38, -34);
  ctx.stroke();
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-38, -28); ctx.lineTo(38, -28);
  ctx.moveTo(-38, -12); ctx.lineTo(38, -12);
  ctx.stroke();
  for (let i = -3; i <= 3; i++) {
    const x = i * 11;
    ctx.beginPath();
    ctx.moveTo(x, 2); ctx.lineTo(x, -40);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x - 3, -36); ctx.lineTo(x, -42); ctx.lineTo(x + 3, -36);
    ctx.stroke();
  }
  ctx.strokeStyle = 'rgba(140,120,100,0.2)';
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(-38, -28); ctx.lineTo(38, -28); ctx.stroke();
}

/* ============================================================
   GROUND
   ============================================================ */
function drawGroundTile(ctx, variant, size) {
  const palettes = [
    ['#17141b', '#1d1922', '#211c26', '#121015'],
    ['#15151a', '#1a1c1e', '#1e2123', '#101113'],
    ['#181419', '#201a1d', '#241d20', '#131015'],
    ['#141419', '#181a22', '#1d1e28', '#0f1015'],
  ];
  const pal = palettes[variant % palettes.length];
  const rng = mulberry32(9001 + variant * 77);
  const g = ctx.createLinearGradient(0, 0, size, size);
  g.addColorStop(0, pal[2]);
  g.addColorStop(0.5, pal[1]);
  g.addColorStop(1, pal[0]);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);

  // large mottling
  for (let i = 0; i < 34; i++) {
    const x = rand(rng, 0, size);
    const y = rand(rng, 0, size);
    const r = rand(rng, 22, 90);
    const blob = ctx.createRadialGradient(x, y, 0, x, y, r);
    const dark = rng() > 0.5;
    blob.addColorStop(0, dark ? 'rgba(6,5,10,0.16)' : 'rgba(90,84,80,0.05)');
    blob.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = blob;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
  }
  // small stones and speckles
  for (let i = 0; i < 260; i++) {
    const x = rand(rng, 0, size);
    const y = rand(rng, 0, size);
    const s = rand(rng, 0.5, 2.4);
    ctx.fillStyle = rng() > 0.5 ? 'rgba(120,112,110,0.12)' : 'rgba(0,0,0,0.2)';
    ctx.fillRect(x, y, s, s);
  }
  // cracks
  ctx.strokeStyle = 'rgba(5,4,8,0.5)';
  for (let i = 0; i < 5; i++) {
    const x = rand(rng, 20, size - 20);
    const y = rand(rng, 20, size - 20);
    ctx.lineWidth = rand(rng, 0.6, 1.6);
    ctx.beginPath();
    ctx.moveTo(x, y);
    let cx = x;
    let cy = y;
    for (let j = 0; j < 4; j++) {
      cx += rand(rng, -26, 26);
      cy += rand(rng, 8, 34);
      ctx.lineTo(cx, cy);
    }
    ctx.stroke();
  }
  // moss patches
  for (let i = 0; i < 12; i++) {
    const x = rand(rng, 0, size);
    const y = rand(rng, 0, size);
    const r = rand(rng, 4, 18);
    ctx.fillStyle = `rgba(${Math.floor(rand(rng, 45, 75))},${Math.floor(rand(rng, 70, 100))},${Math.floor(rand(rng, 45, 60))},0.19)`;
    ctx.beginPath();
    ctx.ellipse(x, y, r, r * rand(rng, 0.4, 0.9), rand(rng, 0, 3), 0, Math.PI * 2);
    ctx.fill();
  }
  // grass tufts
  ctx.strokeStyle = 'rgba(72,90,62,0.32)';
  ctx.lineWidth = 1;
  for (let i = 0; i < 46; i++) {
    const x = rand(rng, 0, size);
    const y = rand(rng, 0, size);
    for (let j = 0; j < 3; j++) {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.quadraticCurveTo(x + rand(rng, -3, 3), y - 3, x + rand(rng, -5, 5), y - rand(rng, 4, 9));
      ctx.stroke();
    }
  }
  // faint bones
  ctx.strokeStyle = 'rgba(180,172,152,0.11)';
  ctx.lineWidth = 1.4;
  for (let i = 0; i < 4; i++) {
    const x = rand(rng, 30, size - 30);
    const y = rand(rng, 30, size - 30);
    ctx.beginPath();
    ctx.moveTo(x, y); ctx.lineTo(x + rand(rng, 8, 20), y + rand(rng, -5, 5));
    ctx.stroke();
  }
  // subtle tile edge vignette
  const edge = ctx.createRadialGradient(size / 2, size / 2, size * 0.25, size / 2, size / 2, size * 0.72);
  edge.addColorStop(0, 'rgba(0,0,0,0)');
  edge.addColorStop(1, 'rgba(0,0,0,0.28)');
  ctx.fillStyle = edge;
  ctx.fillRect(0, 0, size, size);
}

/* ============================================================
   ITEM ICONS
   ============================================================ */
function drawSlotSymbol(ctx, slot, color) {
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 2.4;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.save();
  ctx.scale(0.92, 0.92);
  if (slot === 'weapon') {
    ctx.beginPath();
    ctx.moveTo(-9, 11); ctx.quadraticCurveTo(-2, 8, 7, -8);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(4, -9); ctx.quadraticCurveTo(12, -12, 12, -4); ctx.quadraticCurveTo(8, -6, 4, -9);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.5)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(-6, 9); ctx.lineTo(-11, 13); ctx.stroke();
  } else if (slot === 'helm') {
    ctx.beginPath();
    ctx.moveTo(-10, 4); ctx.lineTo(-10, -4); ctx.quadraticCurveTo(-10, -12, 0, -12); ctx.quadraticCurveTo(10, -12, 10, -4); ctx.lineTo(10, 4);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-10, 0); ctx.lineTo(10, 0);
    ctx.moveTo(-3, 0); ctx.lineTo(-3, 10); ctx.moveTo(3, 0); ctx.lineTo(3, 10);
    ctx.stroke();
  } else if (slot === 'armor') {
    ctx.beginPath();
    ctx.moveTo(-7, -11); ctx.lineTo(0, -8); ctx.lineTo(7, -11); ctx.lineTo(12, -5); ctx.lineTo(8, 1); ctx.lineTo(8, 11); ctx.lineTo(-8, 11); ctx.lineTo(-8, 1); ctx.lineTo(-12, -5);
    ctx.closePath();
    ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, -8); ctx.lineTo(0, 11); ctx.stroke();
  } else if (slot === 'boots') {
    ctx.beginPath();
    ctx.moveTo(-6, -11); ctx.lineTo(2, -11); ctx.lineTo(0, 2); ctx.quadraticCurveTo(0, 6, 5, 8); ctx.lineTo(11, 10); ctx.lineTo(11, 12); ctx.lineTo(-9, 12); ctx.lineTo(-9, 8); ctx.lineTo(-6, 4); ctx.closePath();
    ctx.stroke();
  } else if (slot === 'amulet') {
    ctx.beginPath(); ctx.moveTo(-10, -11); ctx.quadraticCurveTo(0, -2, 10, -11); ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, -3); ctx.lineTo(7, 3); ctx.lineTo(0, 12); ctx.lineTo(-7, 3); ctx.closePath();
    ctx.stroke();
  } else if (slot === 'ring') {
    ctx.beginPath(); ctx.arc(0, 3, 7, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-4, -4); ctx.lineTo(0, -11); ctx.lineTo(4, -4); ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

export function makeItemIcon(slot, color) {
  const size = 72;
  return layer(size, size, (ctx) => {
    ctx.translate(size / 2, size / 2);
    // glow
    const g = ctx.createRadialGradient(0, 0, 2, 0, 0, 32);
    g.addColorStop(0, color + '66');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.fillRect(-36, -36, 72, 72);
    // diamond plate
    ctx.save();
    ctx.rotate(Math.PI / 4);
    const plate = ctx.createLinearGradient(-22, -22, 22, 22);
    plate.addColorStop(0, 'rgba(50,40,62,0.95)');
    plate.addColorStop(1, 'rgba(10,8,16,0.95)');
    ctx.fillStyle = plate;
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(-19, -19, 38, 38, 4);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
    // inner glyph
    ctx.save();
    ctx.rotate(-0.0);
    drawSlotSymbol(ctx, slot, '#f6edd8');
    ctx.restore();
    // sparkle
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.beginPath(); ctx.arc(-18, -19, 1.4, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.beginPath(); ctx.arc(20, 14, 1, 0, Math.PI * 2); ctx.fill();
  }, 2);
}

/* ============================================================
   BUILD ALL
   ============================================================ */
export function buildSprites() {
  const player = layer(96, 96, (ctx) => {
    ctx.translate(48, 54);
    drawPlayer(ctx);
  });
  const playerAlt = layer(96, 96, (ctx) => {
    ctx.translate(48, 54);
    ctx.rotate(0.02);
    drawPlayer(ctx);
  });
  const ghoul = layer(96, 96, (ctx) => { ctx.translate(48, 50); drawGhoul(ctx); });
  const skeleton = layer(96, 96, (ctx) => { ctx.translate(48, 50); drawSkeleton(ctx); });
  const batUp = layer(96, 96, (ctx) => { ctx.translate(48, 48); drawBat(ctx, true); });
  const batDown = layer(96, 96, (ctx) => { ctx.translate(48, 48); drawBat(ctx, false); });
  const wraith = layer(96, 96, (ctx) => { ctx.translate(48, 50); drawWraith(ctx); });
  const brute = layer(110, 110, (ctx) => { ctx.translate(55, 56); drawBrute(ctx); });
  const boss = layer(190, 190, (ctx) => { ctx.translate(95, 100); ctx.scale(1.22, 1.22); drawBoss(ctx); });
  const fiend = layer(96, 96, (ctx) => { ctx.translate(48, 50); drawFiend(ctx); });

  const props = {
    tombstone: [1, 2, 3].map((seed) => layer(80, 90, (ctx) => { ctx.translate(40, 78); drawTombstone(ctx, seed * 13); })),
    cross: [1, 2].map((seed) => layer(80, 90, (ctx) => { ctx.translate(40, 78); ctx.scale(0.9 + seed * 0.05, 0.9 + seed * 0.05); drawCross(ctx); })),
    tree: [1, 2].map((seed) => layer(120, 130, (ctx) => { ctx.translate(60, 116); ctx.scale(1 + seed * 0.1, 1 + seed * 0.1); drawDeadTree(ctx); })),
    candles: [1, 2, 3].map((seed) => layer(60, 60, (ctx) => { ctx.translate(30, 48); drawCandles(ctx, seed * 31); })),
    pillar: layer(70, 100, (ctx) => { ctx.translate(35, 86); drawPillar(ctx); }),
    bones: [1, 2].map((seed) => layer(60, 40, (ctx) => { ctx.translate(30, 28); drawBones(ctx, seed * 17); })),
    mushrooms: [1, 2].map((seed) => layer(50, 40, (ctx) => { ctx.translate(25, 30); drawMushrooms(ctx, seed * 23); })),
    statue: layer(80, 110, (ctx) => { ctx.translate(40, 96); drawStatue(ctx); }),
    fence: layer(100, 60, (ctx) => { ctx.translate(50, 46); drawFence(ctx); }),
  };

  return { player, playerAlt, ghoul, skeleton, batUp, batDown, wraith, brute, boss, fiend, props };
}

export function buildGroundTiles(variants = 4, size = 512) {
  const tiles = [];
  for (let i = 0; i < variants; i++) {
    tiles.push(layer(size, size, (ctx) => drawGroundTile(ctx, i, size), 1));
  }
  return tiles;
}

export function makeGlow(size = 128, color = '255,255,255') {
  return layer(size, size, (ctx) => {
    const r = size / 2;
    const g = ctx.createRadialGradient(r, r, 0, r, r, r);
    g.addColorStop(0, `rgba(${color},1)`);
    g.addColorStop(0.25, `rgba(${color},0.45)`);
    g.addColorStop(0.6, `rgba(${color},0.12)`);
    g.addColorStop(1, `rgba(${color},0)`);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
  }, 1);
}

export function makeFog(size = 512) {
  return layer(size, size, (ctx) => {
    const r = size / 2;
    const g = ctx.createRadialGradient(r, r, 0, r, r, r);
    g.addColorStop(0, 'rgba(150,140,175,0.16)');
    g.addColorStop(0.4, 'rgba(120,110,150,0.08)');
    g.addColorStop(1, 'rgba(90,80,120,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
  }, 1);
}

/* ============================================================
   SEAMLESS WORLD GROUND
   ============================================================ */
export function buildWorldGround(w, h, scale = 0.5) {
  const canvas = makeCanvas(w * scale, h * scale);
  const ctx = canvas.getContext('2d');
  ctx.scale(scale, scale);
  const rng = mulberry32(20261031);

  // base earth
  const base = ctx.createLinearGradient(0, 0, w * 0.6, h);
  base.addColorStop(0, '#211c28');
  base.addColorStop(0.35, '#1b1721');
  base.addColorStop(0.7, '#19151e');
  base.addColorStop(1, '#14111a');
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, w, h);

  // broad moonlit and rotten patches
  for (let i = 0; i < 110; i++) {
    const x = rand(rng, -100, w + 100);
    const y = rand(rng, -100, h + 100);
    const r = rand(rng, 90, 420);
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    if (rng() > 0.55) {
      g.addColorStop(0, 'rgba(72,84,102,0.055)');
      g.addColorStop(1, 'rgba(0,0,0,0)');
    } else {
      g.addColorStop(0, 'rgba(34,46,32,0.09)');
      g.addColorStop(1, 'rgba(0,0,0,0)');
    }
    ctx.fillStyle = g;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
  }

  // old dirt paths threading through the graves
  ctx.save();
  ctx.lineCap = 'round';
  for (let p = 0; p < 2; p++) {
    ctx.strokeStyle = 'rgba(54,43,38,0.09)';
    ctx.lineWidth = rand(rng, 70, 110);
    ctx.beginPath();
    ctx.moveTo(-50, rand(rng, 200, h - 200));
    ctx.bezierCurveTo(w * 0.3, rand(rng, 0, h), w * 0.65, rand(rng, 0, h), w + 50, rand(rng, 200, h - 200));
    ctx.stroke();
  }
  ctx.restore();

  // cobblestone plots, kept away from the heart of the arena
  for (let cluster = 0; cluster < 11; cluster++) {
    let cx = rand(rng, 140, w - 140);
    let cy = rand(rng, 140, h - 140);
    if (Math.hypot(cx - w / 2, cy - h / 2) < 430) {
      cx += cx < w / 2 ? -480 : 480;
      cy += cy < h / 2 ? -360 : 360;
      cx = Math.max(140, Math.min(w - 140, cx));
      cy = Math.max(140, Math.min(h - 140, cy));
    }
    const cols = randInt(rng, 3, 6);
    const rows = randInt(rng, 2, 5);
    const size = rand(rng, 18, 28);
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rand(rng, 0, Math.PI));
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        if (rng() < 0.42) continue;
        const px = x * size + rand(rng, -2, 2);
        const py = y * size + rand(rng, -2, 2);
        ctx.fillStyle = `rgba(${Math.floor(rand(rng, 54, 68))},${Math.floor(rand(rng, 51, 64))},${Math.floor(rand(rng, 60, 74))},0.2)`;
        ctx.strokeStyle = 'rgba(8,6,11,0.24)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(px, py, size * rand(rng, 0.7, 0.94), size * rand(rng, 0.55, 0.8), 4);
        ctx.fill();
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  // loose stones & bone chips
  for (let i = 0; i < 2400; i++) {
    const x = rand(rng, 0, w);
    const y = rand(rng, 0, h);
    const s = rand(rng, 0.7, 3.4);
    const tone = rand(rng, 0, 1);
    ctx.fillStyle = tone > 0.72
      ? `rgba(${Math.floor(rand(rng, 110, 145))},${Math.floor(rand(rng, 105, 135))},${Math.floor(rand(rng, 105, 130))},0.1)`
      : 'rgba(0,0,0,0.22)';
    ctx.beginPath();
    ctx.ellipse(x, y, s, s * rand(rng, 0.5, 1), rand(rng, 0, 3), 0, Math.PI * 2);
    ctx.fill();
  }

  // fine grit
  for (let i = 0; i < 9000; i++) {
    const x = rand(rng, 0, w);
    const y = rand(rng, 0, h);
    ctx.fillStyle = rng() > 0.5 ? 'rgba(130,122,120,0.08)' : 'rgba(0,0,0,0.16)';
    ctx.fillRect(x, y, 1, 1);
  }

  // cracks spidering across the earth
  ctx.strokeStyle = 'rgba(4,3,7,0.42)';
  for (let i = 0; i < 120; i++) {
    const x = rand(rng, 0, w);
    const y = rand(rng, 0, h);
    ctx.lineWidth = rand(rng, 0.5, 1.4);
    ctx.beginPath();
    ctx.moveTo(x, y);
    let cx = x;
    let cy = y;
    const steps = randInt(rng, 3, 7);
    for (let j = 0; j < steps; j++) {
      cx += rand(rng, -38, 38);
      cy += rand(rng, 10, 48);
      ctx.lineTo(cx, cy);
    }
    ctx.stroke();
  }

  // moss & rot
  for (let i = 0; i < 240; i++) {
    const x = rand(rng, 0, w);
    const y = rand(rng, 0, h);
    const r = rand(rng, 6, 42);
    ctx.fillStyle = `rgba(${Math.floor(rand(rng, 40, 68))},${Math.floor(rand(rng, 68, 98))},${Math.floor(rand(rng, 42, 60))},0.13)`;
    ctx.beginPath();
    ctx.ellipse(x, y, r, r * rand(rng, 0.35, 0.8), rand(rng, 0, 3), 0, Math.PI * 2);
    ctx.fill();
  }

  // grass tufts
  ctx.strokeStyle = 'rgba(83,104,68,0.3)';
  for (let i = 0; i < 900; i++) {
    const x = rand(rng, 0, w);
    const y = rand(rng, 0, h);
    ctx.lineWidth = rand(rng, 0.6, 1.2);
    for (let j = 0; j < 3; j++) {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.quadraticCurveTo(x + rand(rng, -4, 4), y - 4, x + rand(rng, -7, 7), y - rand(rng, 5, 13));
      ctx.stroke();
    }
  }

  // scattered bones
  for (let i = 0; i < 170; i++) {
    const x = rand(rng, 40, w - 40);
    const y = rand(rng, 40, h - 40);
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rand(rng, 0, Math.PI));
    ctx.strokeStyle = 'rgba(196,188,166,0.16)';
    ctx.lineWidth = rand(rng, 1, 2.6);
    ctx.beginPath();
    ctx.moveTo(-rand(rng, 4, 10), 0);
    ctx.lineTo(rand(rng, 4, 10), 0);
    ctx.stroke();
    ctx.fillStyle = 'rgba(200,192,172,0.17)';
    ctx.beginPath();
    ctx.arc(-7, 0, 1.6, 0, Math.PI * 2);
    ctx.arc(7, 0, 1.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // quiet shallow puddles
  for (let i = 0; i < 24; i++) {
    const x = rand(rng, 80, w - 80);
    const y = rand(rng, 80, h - 80);
    const r = rand(rng, 18, 64);
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, 'rgba(30,48,52,0.2)');
    g.addColorStop(0.8, 'rgba(20,30,35,0.12)');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(x, y, r, r * 0.5, rand(rng, 0, 3), 0, Math.PI * 2);
    ctx.fill();
  }

  // darken the world edges
  const edgeW = 120;
  for (const side of ['top', 'bottom', 'left', 'right']) {
    const g = side === 'top'
      ? ctx.createLinearGradient(0, 0, 0, edgeW)
      : side === 'bottom'
        ? ctx.createLinearGradient(0, h, 0, h - edgeW)
        : side === 'left'
          ? ctx.createLinearGradient(0, 0, edgeW, 0)
          : ctx.createLinearGradient(w, 0, w - edgeW, 0);
    g.addColorStop(0, 'rgba(0,0,0,0.5)');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  }

  return canvas;
}
