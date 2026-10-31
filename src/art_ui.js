// ============================================================
// LA ESPADA CELESTIAL — arte procedural: retratos, título y cine
// ============================================================
import { TAU, clamp, lerp, seededFor } from './core.js';
import { APPEARANCE, PORTRAITS, CREATURES } from './data.js';
import { rr, glow, shadow, poly, mix, appearancePalette, drawHumanoid, drawCreature, drawCreatureShape } from './art.js';
import { drawProp } from './art_world.js';

function clear(ctx, w, h) { ctx.clearRect(0, 0, w, h); }

function vignette(ctx, w, h, strength = 0.7) {
  const g = ctx.createRadialGradient(w / 2, h * 0.42, Math.min(w, h) * 0.2, w / 2, h * 0.5, Math.max(w, h) * 0.72);
  g.addColorStop(0, 'rgba(0,0,0,0)');
  g.addColorStop(1, `rgba(0,0,0,${strength})`);
  ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
}

export function drawPortrait(canvas, key, appearance, time = 0) {
  const ctx = canvas.getContext('2d');
  const w = canvas.width, h = canvas.height;
  clear(ctx, w, h);
  const data = PORTRAITS[key] || PORTRAITS.player || {};
  if (data.creature) {
    const cg = ctx.createRadialGradient(w / 2, h * 0.45, 4, w / 2, h / 2, w * 0.62);
    cg.addColorStop(0, 'rgba(80,70,110,.55)'); cg.addColorStop(1, 'rgba(5,8,14,.95)');
    ctx.fillStyle = cg; ctx.fillRect(0, 0, w, h);
    const def = CREATURES[data.creature];
    drawCreature(ctx, data.creature, w / 2, h * 0.76, Math.min(w, h) / 100, time, 0);
    if (def) {
      glow(ctx, w / 2, h * 0.55, w * 0.45, def.colors.glow, 0.18);
    }
    vignette(ctx, w, h, 0.55);
    return;
  }
  const isPlayer = key === 'player';
  const pal = isPlayer ? appearancePalette(appearance) : {
    skin: data.skin, hair: data.hair, hairHi: data.hairHi, hairStyle: data.hairStyle || (data.age ? 'largo' : data.beard ? 'corto' : 'corto'),
    cloth: data.cloth, cloth2: mix(data.cloth || '#3f6d8c', '#000000', 0.35), trim: data.trim,
    cape: !!data.cape, accessory: data.accessory || 'ninguno', eye: data.eye, mark: data.mark || 'none',
    beard: data.beard, age: data.age, child: data.child,
  };
  const bg = ctx.createRadialGradient(w * 0.5, h * 0.38, 3, w * 0.5, h * 0.5, w * 0.7);
  bg.addColorStop(0, mix(pal.cloth || '#3f6d8c', '#ffffff', 0.18));
  bg.addColorStop(0.45, mix(pal.cloth || '#3f6d8c', '#000000', 0.42));
  bg.addColorStop(1, '#070a12');
  ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h);
  // rayos
  ctx.save(); ctx.globalAlpha = 0.12; ctx.strokeStyle = pal.trim || '#d9b46a';
  for (let i = 0; i < 9; i++) { const a = i / 9 * TAU + time * 0.03; ctx.beginPath(); ctx.moveTo(w / 2, h * 0.5); ctx.lineTo(w / 2 + Math.cos(a) * w, h / 2 + Math.sin(a) * w); ctx.stroke(); }
  ctx.restore();
  // hombros / busto
  ctx.save();
  ctx.translate(w * 0.5, h * 0.9);
  const sc = Math.min(w, h) / 150;
  ctx.scale(sc, sc);
  // capa
  if (pal.cape) poly(ctx, [[-38, 18], [-30, -16], [0, -30], [30, -16], [38, 18]], mix(pal.cloth2 || '#2a3a50', '#000000', 0.25));
  ctx.fillStyle = pal.cloth || '#3f6d8c';
  ctx.beginPath(); ctx.moveTo(-40, 22); ctx.quadraticCurveTo(-30, -12, 0, -20); ctx.quadraticCurveTo(30, -12, 40, 22); ctx.closePath(); ctx.fill();
  ctx.fillStyle = mix(pal.cloth || '#3f6d8c', '#ffffff', 0.15);
  ctx.beginPath(); ctx.moveTo(-24, 18); ctx.quadraticCurveTo(-16, -8, 0, -14); ctx.quadraticCurveTo(16, -8, 24, 18); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = pal.trim || '#d9b46a'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(-20, 12); ctx.quadraticCurveTo(0, 2, 20, 12); ctx.stroke();
  // cuello
  ctx.fillStyle = mix(pal.skin || '#e8b98f', '#000000', 0.12);
  ctx.fillRect(-6, -24, 12, 14);
  // cabeza
  const headY = -46 + Math.sin(time * 1.4) * 0.6;
  ctx.fillStyle = pal.skin || '#e8b98f';
  ctx.beginPath(); ctx.ellipse(0, headY, 19, 23, 0, 0, TAU); ctx.fill();
  // orejas
  ctx.beginPath(); ctx.ellipse(-18, headY + 2, 4, 7, 0, 0, TAU); ctx.fill();
  ctx.beginPath(); ctx.ellipse(18, headY + 2, 4, 7, 0, 0, TAU); ctx.fill();
  // pelo
  const hair = pal.hair || '#2b2233', hairHi = pal.hairHi || '#4a3c55';
  ctx.fillStyle = hair;
  const style = pal.hairStyle || 'corto';
  if (style === 'largo') {
    poly(ctx, [[-21, headY - 8], [21, headY - 8], [24, headY + 30], [14, headY + 26], [10, headY + 6], [-10, headY + 6], [-14, headY + 26], [-24, headY + 30]], hair);
  } else if (style === 'coleta') {
    ctx.beginPath(); ctx.arc(0, headY - 6, 20, Math.PI * 0.95, Math.PI * 2.05); ctx.fill();
    ctx.beginPath(); ctx.ellipse(-24, headY + 6, 7, 16, 0.5, 0, TAU); ctx.fill();
  } else if (style === 'trenza') {
    ctx.beginPath(); ctx.arc(0, headY - 6, 20, Math.PI * 0.95, Math.PI * 2.05); ctx.fill();
    for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.arc(-20, headY + 6 + i * 6, 4.5 - i * 0.4, 0, TAU); ctx.fill(); }
  } else if (style === 'salvaje') {
    for (let i = 0; i < 9; i++) {
      const a = Math.PI + (i / 8) * Math.PI;
      poly(ctx, [[Math.cos(a) * 16, headY + Math.sin(a) * 16], [Math.cos(a - 0.2) * 26, headY + Math.sin(a - 0.2) * 24], [Math.cos(a + 0.2) * 20, headY + Math.sin(a + 0.2) * 20]], i % 2 ? hairHi : hair);
    }
  } else if (style === 'rapado') {
    ctx.globalAlpha = 0.7; ctx.beginPath(); ctx.arc(0, headY - 4, 19, Math.PI * 0.98, Math.PI * 2.02); ctx.fill(); ctx.globalAlpha = 1;
  } else {
    ctx.beginPath(); ctx.arc(0, headY - 6, 20, Math.PI * 0.92, Math.PI * 2.08); ctx.fill();
    ctx.beginPath(); ctx.ellipse(-17, headY + 2, 5, 10, 0.15, 0, TAU); ctx.fill();
    ctx.beginPath(); ctx.ellipse(17, headY + 2, 5, 10, -0.15, 0, TAU); ctx.fill();
  }
  ctx.strokeStyle = hairHi; ctx.globalAlpha = 0.5; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.arc(-5, headY - 10, 13, Math.PI * 1.05, Math.PI * 1.55); ctx.stroke(); ctx.globalAlpha = 1;
  // ojos
  ctx.fillStyle = '#fff8ec';
  ctx.beginPath(); ctx.ellipse(-7, headY + 2, 5, 3.4, 0, 0, TAU); ctx.fill();
  ctx.beginPath(); ctx.ellipse(7, headY + 2, 5, 3.4, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = pal.eye || '#3b6b57';
  ctx.beginPath(); ctx.arc(-6.5, headY + 2.4, 2.8, 0, TAU); ctx.fill();
  ctx.beginPath(); ctx.arc(7.5, headY + 2.4, 2.8, 0, TAU); ctx.fill();
  ctx.fillStyle = '#1a1410';
  ctx.beginPath(); ctx.arc(-6.2, headY + 2.6, 1.4, 0, TAU); ctx.fill();
  ctx.beginPath(); ctx.arc(7.8, headY + 2.6, 1.4, 0, TAU); ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.beginPath(); ctx.arc(-7.2, headY + 1.5, 0.9, 0, TAU); ctx.fill();
  ctx.beginPath(); ctx.arc(6.8, headY + 1.5, 0.9, 0, TAU); ctx.fill();
  // cejas
  ctx.strokeStyle = hair; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(-12, headY - 4); ctx.lineTo(-4, headY - 5); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(4, headY - 5); ctx.lineTo(12, headY - 4); ctx.stroke();
  // nariz / boca
  ctx.strokeStyle = mix(pal.skin || '#e8b98f', '#000000', 0.35); ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(0, headY + 6); ctx.lineTo(-1, headY + 10); ctx.stroke();
  ctx.strokeStyle = '#8a4a4a'; ctx.beginPath(); ctx.moveTo(-4, headY + 15); ctx.quadraticCurveTo(0, headY + 17, 4, headY + 15); ctx.stroke();
  // marcas
  if (pal.mark === 'scar') { ctx.strokeStyle = '#9a5a50'; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(10, headY - 8); ctx.lineTo(6, headY + 6); ctx.stroke(); }
  if (pal.mark === 'mark') { ctx.strokeStyle = '#b48cff'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(10, headY - 1, 3, 0, TAU); ctx.stroke(); }
  if (pal.mark === 'freckles') { ctx.fillStyle = '#a96f4a'; for (let i = 0; i < 5; i++) ctx.fillRect(-9 + i * 4, headY + 10, 1.1, 1.1); }
  if (pal.beard) { ctx.fillStyle = hair; ctx.beginPath(); ctx.ellipse(0, headY + 20, 11, 8, 0, 0, TAU); ctx.fill(); }
  if (pal.age) { ctx.strokeStyle = 'rgba(70,50,40,.4)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(-13, headY - 2); ctx.lineTo(-9, headY - 1); ctx.stroke(); ctx.beginPath(); ctx.moveTo(13, headY - 2); ctx.lineTo(9, headY - 1); ctx.stroke(); }
  // accesorio
  if (pal.accessory === 'halo') { ctx.strokeStyle = '#ffe9a8'; ctx.globalAlpha = 0.8; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.ellipse(0, headY - 26, 18, 4, 0, 0, TAU); ctx.stroke(); ctx.globalAlpha = 1; }
  if (pal.accessory === 'parche') { ctx.fillStyle = '#2a211c'; ctx.fillRect(4, headY - 2, 9, 8); ctx.strokeStyle = '#2a211c'; ctx.beginPath(); ctx.moveTo(3, headY - 8); ctx.lineTo(14, headY - 4); ctx.stroke(); }
  if (pal.accessory === 'pendiente') { ctx.fillStyle = '#ffd06a'; ctx.beginPath(); ctx.arc(18, headY + 10, 2, 0, TAU); ctx.fill(); }
  // hombrera
  ctx.fillStyle = mix(pal.cloth || '#3f6d8c', '#ffffff', 0.25);
  ctx.beginPath(); ctx.ellipse(-28, 6, 9, 12, -0.2, 0, TAU); ctx.fill();
  ctx.beginPath(); ctx.ellipse(28, 6, 9, 12, 0.2, 0, TAU); ctx.fill();
  ctx.strokeStyle = pal.trim || '#d9b46a'; ctx.globalAlpha = 0.5; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.ellipse(-28, 6, 7, 10, -0.2, 0, TAU); ctx.stroke();
  ctx.beginPath(); ctx.ellipse(28, 6, 7, 10, 0.2, 0, TAU); ctx.stroke();
  ctx.globalAlpha = 1;
  ctx.restore();
  vignette(ctx, w, h, 0.55);
  // chispas
  ctx.save();
  for (let i = 0; i < 8; i++) {
    const a = time * 0.4 + i * 2.1;
    const x = w * 0.5 + Math.cos(a) * w * 0.32;
    const y = h * 0.45 + Math.sin(a * 1.3) * h * 0.32;
    ctx.globalAlpha = 0.18 + Math.sin(time * 2 + i) * 0.1;
    ctx.fillStyle = pal.trim || '#d9b46a';
    ctx.beginPath(); ctx.arc(x, y, 1.2, 0, TAU); ctx.fill();
  }
  ctx.restore();
}

export function drawPreview(canvas, appearance, time = 0) {
  const ctx = canvas.getContext('2d');
  const w = canvas.width, h = canvas.height;
  clear(ctx, w, h);
  const bg = ctx.createRadialGradient(w / 2, h * 0.42, 10, w / 2, h * 0.55, w * 0.7);
  bg.addColorStop(0, 'rgba(70,100,150,.35)');
  bg.addColorStop(0.5, 'rgba(16,28,48,.6)');
  bg.addColorStop(1, 'rgba(4,7,12,.95)');
  ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h);
  // runas
  ctx.save(); ctx.globalAlpha = 0.18; ctx.strokeStyle = '#d9b46a'; ctx.lineWidth = 1;
  for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.ellipse(w / 2, h * 0.82, 110 + i * 30, 26 + i * 7, 0, 0, TAU); ctx.stroke(); }
  for (let i = 0; i < 12; i++) { const a = i / 12 * TAU + time * 0.1; ctx.beginPath(); ctx.arc(w / 2 + Math.cos(a) * 130, h * 0.82 + Math.sin(a) * 34, 1.5, 0, TAU); ctx.fillStyle = '#9fe8ff'; ctx.fill(); }
  ctx.restore();
  // plataforma
  ctx.fillStyle = 'rgba(20,30,50,.8)'; ctx.beginPath(); ctx.ellipse(w / 2, h * 0.82, 100, 24, 0, 0, TAU); ctx.fill();
  ctx.strokeStyle = 'rgba(217,180,106,.5)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.ellipse(w / 2, h * 0.82, 100, 24, 0, 0, TAU); ctx.stroke();
  glow(ctx, w / 2, h * 0.82, 100, 'rgba(120,200,255,.16)', 0.7);
  const scale = Math.min(w, h) / 260;
  drawHumanoid(ctx, {
    x: w / 2, y: h * 0.82, s: scale * 2.2, time, facing: -Math.PI / 2, state: 'idle',
    look: appearance, weapon: true, helmet: false, cape: true,
  });
  // partículas
  ctx.save();
  for (let i = 0; i < 14; i++) {
    const a = time * 0.3 + i * 1.7;
    const x = w / 2 + Math.cos(a) * (60 + (i % 4) * 18);
    const y = h * 0.55 + Math.sin(a * 1.4) * 90 - (time * 8 + i * 12) % 60;
    ctx.globalAlpha = 0.2 + Math.sin(time * 2 + i) * 0.12;
    ctx.fillStyle = i % 2 ? '#9fe8ff' : '#d9b46a';
    ctx.beginPath(); ctx.arc(x, y, 1.4, 0, TAU); ctx.fill();
  }
  ctx.restore();
  vignette(ctx, w, h, 0.35);
}

export function drawTitleArt(ctx, w, h, time = 0) {
  const rng = seededFor('title-art');
  const sky = ctx.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, '#05070f');
  sky.addColorStop(0.38, '#101a33');
  sky.addColorStop(0.62, '#2a2745');
  sky.addColorStop(0.8, '#5a3a42');
  sky.addColorStop(1, '#0a0a10');
  ctx.fillStyle = sky; ctx.fillRect(0, 0, w, h);
  // estrellas
  for (let i = 0; i < 180; i++) {
    const x = rng() * w, y = rng() * h * 0.7, r = rng() * 1.5 + 0.3;
    ctx.globalAlpha = 0.25 + Math.sin(time * 1.2 + i) * 0.18 + rng() * 0.3;
    ctx.fillStyle = i % 7 === 0 ? '#ffe9a8' : '#cfe8ff';
    ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
  }
  ctx.globalAlpha = 1;
  // aurora
  for (let i = 0; i < 4; i++) {
    const g = ctx.createLinearGradient(w * 0.1, h * 0.1, w * 0.9, h * 0.55);
    g.addColorStop(0, 'rgba(80,200,180,0)');
    g.addColorStop(0.45, i % 2 ? 'rgba(90,180,220,.08)' : 'rgba(180,140,255,.07)');
    g.addColorStop(1, 'rgba(80,200,180,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(0, h * (0.18 + i * 0.04));
    ctx.bezierCurveTo(w * 0.3, h * (0.08 + Math.sin(time * 0.2 + i) * 0.03), w * 0.7, h * (0.34 + i * 0.03), w, h * (0.2 + i * 0.04));
    ctx.lineTo(w, h * 0.62); ctx.lineTo(0, h * 0.62); ctx.fill();
  }
  // luna
  glow(ctx, w * 0.74, h * 0.24, Math.min(w, h) * 0.22, 'rgba(200,220,255,.14)', 0.8);
  ctx.fillStyle = '#e8eef8'; ctx.globalAlpha = 0.8;
  ctx.beginPath(); ctx.arc(w * 0.74, h * 0.24, Math.min(w, h) * 0.045, 0, TAU); ctx.fill();
  ctx.globalAlpha = 1;
  // montañas
  const layers = [
    { y: 0.58, c: '#141a2a', s: 0.7 }, { y: 0.66, c: '#0e1420', s: 1 }, { y: 0.76, c: '#080c14', s: 1.4 },
  ];
  for (const L of layers) {
    ctx.fillStyle = L.c;
    ctx.beginPath(); ctx.moveTo(0, h);
    let x = 0;
    while (x < w + 100) {
      const peak = h * L.y + Math.sin(x * 0.006 * L.s + L.s * 3) * h * 0.08 + Math.sin(x * 0.013 + L.s) * h * 0.04;
      ctx.lineTo(x, peak); x += 80 + rng() * 100;
    }
    ctx.lineTo(w, h); ctx.closePath(); ctx.fill();
  }
  // ciudad / aldea
  ctx.fillStyle = '#070a10';
  for (let i = 0; i < 16; i++) {
    const x = w * 0.12 + i * w * 0.05, bw = 18 + rng() * 34, bh = 20 + rng() * 50;
    ctx.fillRect(x, h * 0.77 - bh, bw, bh);
    if (i % 3 === 0) { ctx.beginPath(); ctx.moveTo(x - 4, h * 0.77 - bh); ctx.lineTo(x + bw / 2, h * 0.77 - bh - 18); ctx.lineTo(x + bw + 4, h * 0.77 - bh); ctx.fill(); }
    ctx.fillStyle = 'rgba(255,200,110,.5)'; ctx.fillRect(x + bw * 0.3, h * 0.77 - bh * 0.55, 3, 4); ctx.fillStyle = '#070a10';
  }
  // espada central
  const sx = w * 0.5, sy = h * 0.57;
  const pulse = 0.7 + Math.sin(time * 1.6) * 0.15;
  glow(ctx, sx, sy - h * 0.1, Math.min(w, h) * 0.3, 'rgba(150,220,255,.18)', pulse);
  ctx.save(); ctx.translate(sx, sy); ctx.rotate(-0.18);
  ctx.shadowColor = '#9fe8ff'; ctx.shadowBlur = 40;
  const blade = ctx.createLinearGradient(-4, -h * 0.28, 4, 0);
  blade.addColorStop(0, '#ffffff'); blade.addColorStop(0.4, '#d8f5ff'); blade.addColorStop(1, '#7fb9ff');
  ctx.fillStyle = blade;
  poly(ctx, [[-4, -h * 0.27], [4, -h * 0.27], [7, -h * 0.02], [0, h * 0.04], [-7, -h * 0.02]], '#d8f5ff');
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#d9b46a'; ctx.fillRect(-26, h * 0.03, 52, 5);
  ctx.fillStyle = '#5a3a22'; ctx.fillRect(-4, h * 0.035, 8, 26);
  ctx.fillStyle = '#f4dfa3'; ctx.beginPath(); ctx.arc(0, h * 0.075, 5, 0, TAU); ctx.fill();
  ctx.restore();
  // embers
  for (let i = 0; i < 46; i++) {
    const x = (rng() * w + time * (8 + rng() * 20)) % w;
    const y = h - ((rng() * h + time * (12 + rng() * 30)) % h);
    ctx.globalAlpha = 0.15 + Math.sin(time * 2 + i) * 0.1;
    ctx.fillStyle = i % 3 ? '#ffb347' : '#ffe9a8';
    ctx.beginPath(); ctx.arc(x, y, 1 + rng() * 1.6, 0, TAU); ctx.fill();
  }
  ctx.globalAlpha = 1;
  // niebla inferior
  const fog = ctx.createLinearGradient(0, h * 0.6, 0, h);
  fog.addColorStop(0, 'rgba(10,14,24,0)'); fog.addColorStop(1, 'rgba(6,8,14,.9)');
  ctx.fillStyle = fog; ctx.fillRect(0, h * 0.6, w, h * 0.4);
  vignette(ctx, w, h, 0.55);
}

export function drawCinematicArt(canvas, art, time = 0) {
  const ctx = canvas.getContext('2d');
  const w = canvas.width, h = canvas.height;
  const rng = seededFor('cine', art);
  clear(ctx, w, h);
  const palettes = {
    ember: ['#2a1208', '#7a2a12', '#ff8a5c'], jar: ['#1a1420', '#5a4a6a', '#d9b46a'],
    veil: ['#080a18', '#2a1d50', '#b48cff'], sword: ['#0a101c', '#2a4a6a', '#9fe8ff'],
    shrine: ['#0c1a1a', '#2a5a4a', '#7ddc9a'], lumito: ['#1a1608', '#6a5a2a', '#ffe9a8'],
    guardian: ['#0c140c', '#2a4a2a', '#9fd67a'], gem: ['#08101c', '#2a5a7a', '#9fe8ff'],
    queen: ['#1a080c', '#5a1a20', '#ff5a36'], tear: ['#1a1008', '#6a3a1a', '#ffd166'],
    forge: ['#1a0c08', '#5a2a1a', '#ff8a5c'], temple: ['#0a1020', '#2a3a6a', '#9fe8ff'],
    library: ['#100a1a', '#3a2a5a', '#b48cff'], architect: ['#08050f', '#2a1d50', '#dcc9ff'],
    custodian: ['#0a0a14', '#2a2440', '#8b6bff'], void: ['#05030f', '#1a1038', '#b48cff'],
    ending_seal: ['#0a1420', '#2a4a6a', '#9fe8ff'], ending_ascend: ['#140a20', '#4a2a6a', '#ffe9a8'], ending_break: ['#101408', '#3a5a2a', '#d9ff9a'],
  };
  const pal = palettes[art] || palettes.sword;
  const bg = ctx.createRadialGradient(w * 0.5, h * 0.42, 10, w * 0.5, h * 0.5, Math.max(w, h) * 0.8);
  bg.addColorStop(0, pal[1]); bg.addColorStop(0.55, pal[0]); bg.addColorStop(1, '#020308');
  ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h);
  // estrellas / motas
  for (let i = 0; i < 100; i++) {
    const x = rng() * w, y = rng() * h;
    ctx.globalAlpha = 0.12 + Math.sin(time + i) * 0.08 + rng() * 0.2;
    ctx.fillStyle = i % 4 ? pal[2] : '#ffffff';
    ctx.beginPath(); ctx.arc(x, y, rng() * 1.4 + 0.3, 0, TAU); ctx.fill();
  }
  ctx.globalAlpha = 1;
  const cx = w * 0.5, cy = h * 0.52;
  const s = Math.min(w, h) / 520;
  // suelo / horizonte
  ctx.fillStyle = 'rgba(0,0,0,.35)';
  ctx.beginPath(); ctx.ellipse(cx, h * 0.78, w * 0.55, h * 0.08, 0, 0, TAU); ctx.fill();
  glow(ctx, cx, h * 0.72, Math.min(w, h) * 0.32, pal[2].replace('#', 'rgba(').length ? pal[2] : pal[2], 0.12);

  switch (art) {
    case 'ember': {
      glow(ctx, cx, cy, 140 * s, 'rgba(255,120,50,.5)', 0.8);
      ctx.fillStyle = '#ffb347';
      ctx.beginPath(); ctx.moveTo(cx, cy - 110 * s);
      ctx.bezierCurveTo(cx + 70 * s, cy - 30 * s, cx + 40 * s, cy + 50 * s, cx, cy + 60 * s);
      ctx.bezierCurveTo(cx - 40 * s, cy + 50 * s, cx - 70 * s, cy - 30 * s, cx, cy - 110 * s); ctx.fill();
      ctx.fillStyle = '#fff3c4';
      ctx.beginPath(); ctx.moveTo(cx, cy - 55 * s); ctx.bezierCurveTo(cx + 28 * s, cy - 12 * s, cx + 16 * s, cy + 28 * s, cx, cy + 32 * s); ctx.bezierCurveTo(cx - 16 * s, cy + 28 * s, cx - 28 * s, cy - 12 * s, cx, cy - 55 * s); ctx.fill();
      break;
    }
    case 'jar': {
      glow(ctx, cx, cy, 130 * s, 'rgba(255,220,140,.35)', 0.7);
      ctx.fillStyle = '#b98a5a';
      ctx.beginPath(); ctx.moveTo(cx - 60 * s, cy + 60 * s); ctx.bezierCurveTo(cx - 85 * s, cy - 10 * s, cx - 35 * s, cy - 60 * s, cx - 30 * s, cy - 70 * s);
      ctx.lineTo(cx + 30 * s, cy - 70 * s); ctx.bezierCurveTo(cx + 35 * s, cy - 60 * s, cx + 85 * s, cy - 10 * s, cx + 60 * s, cy + 60 * s); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#d9b46a'; ctx.lineWidth = 2 * s; ctx.stroke();
      ctx.fillStyle = 'rgba(255,240,190,.35)'; ctx.beginPath(); ctx.ellipse(cx, cy - 70 * s, 30 * s, 8 * s, 0, 0, TAU); ctx.fill();
      for (let i = 0; i < 6; i++) { const a = time * 0.4 + i; glow(ctx, cx + Math.cos(a) * 30 * s, cy - 80 * s - i * 8 * s, 20 * s, pal[2], 0.25); }
      break;
    }
    case 'veil': {
      ctx.save(); ctx.translate(cx, cy);
      for (let i = 0; i < 5; i++) {
        const off = i * 18 * s;
        ctx.strokeStyle = `rgba(180,140,255,${0.25 + i * 0.1})`; ctx.lineWidth = (2 + i) * s;
        ctx.beginPath(); ctx.moveTo(-180 * s, -90 * s + off); ctx.bezierCurveTo(-60 * s, -140 * s + off, 60 * s, -40 * s + off, 180 * s, -100 * s + off); ctx.stroke();
      }
      ctx.restore();
      glow(ctx, cx, cy, 120 * s, 'rgba(140,100,255,.4)', 0.8);
      break;
    }
    case 'sword': {
      glow(ctx, cx, cy, 150 * s, 'rgba(160,230,255,.3)', 0.8);
      ctx.save(); ctx.translate(cx, cy); ctx.rotate(-0.12);
      ctx.shadowColor = '#9fe8ff'; ctx.shadowBlur = 30 * s;
      poly(ctx, [[-7 * s, -150 * s], [7 * s, -150 * s], [13 * s, 60 * s], [0, 90 * s], [-13 * s, 60 * s]], '#d8f5ff');
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#d9b46a'; ctx.fillRect(-40 * s, 58 * s, 80 * s, 7 * s);
      ctx.fillStyle = '#5a3a22'; ctx.fillRect(-5 * s, 62 * s, 10 * s, 38 * s);
      ctx.fillStyle = '#f4dfa3'; ctx.beginPath(); ctx.arc(0, 72 * s, 7 * s, 0, TAU); ctx.fill();
      ctx.restore();
      break;
    }
    case 'shrine': {
      glow(ctx, cx, cy, 120 * s, 'rgba(125,232,208,.3)', 0.8);
      drawProp(ctx, { type: 'shrine', x: cx, y: cy + 70 * s, s: 3 * s, seed: 1 }, { theme: 'village' }, time);
      break;
    }
    case 'lumito': {
      glow(ctx, cx, cy, 130 * s, 'rgba(255,233,168,.35)', 0.8);
      drawCreature(ctx, 'lumito', cx, cy + 50 * s, 4.2 * s, time, -0.2);
      break;
    }
    case 'guardian': {
      glow(ctx, cx, cy, 160 * s, 'rgba(159,214,122,.3)', 0.8);
      drawCreatureShape(ctx, 'guardian', { main: '#6a7a4a', accent: '#cdeeff', glow: '#9fe8ff', dark: '#2f4a2a' }, { x: cx, y: cy + 90 * s, s: 4.4 * s, time, facing: 0 });
      break;
    }
    case 'gem': {
      glow(ctx, cx, cy, 130 * s, 'rgba(159,232,255,.5)', 0.9);
      ctx.save(); ctx.translate(cx, cy); ctx.rotate(time * 0.15);
      ctx.fillStyle = '#9fe8ff'; ctx.shadowColor = '#9fe8ff'; ctx.shadowBlur = 30 * s;
      poly(ctx, [[0, -60 * s], [45 * s, -10 * s], [25 * s, 55 * s], [-25 * s, 55 * s], [-45 * s, -10 * s]], '#9fe8ff');
      poly(ctx, [[0, -60 * s], [10 * s, 20 * s], [-25 * s, 55 * s], [-45 * s, -10 * s]], '#e8fbff');
      ctx.restore();
      break;
    }
    case 'queen': {
      glow(ctx, cx, cy, 150 * s, 'rgba(255,90,54,.3)', 0.8);
      drawCreatureShape(ctx, 'queen', { main: '#3a2026', accent: '#ff5a36', glow: '#ffd166', dark: '#1a080c' }, { x: cx, y: cy + 90 * s, s: 4 * s, time, facing: 0 });
      break;
    }
    case 'tear': {
      glow(ctx, cx, cy, 120 * s, 'rgba(255,209,102,.45)', 0.9);
      ctx.fillStyle = '#ffd166'; ctx.shadowColor = '#ffd166'; ctx.shadowBlur = 30 * s;
      ctx.beginPath(); ctx.moveTo(cx, cy - 80 * s); ctx.bezierCurveTo(cx + 50 * s, cy - 10 * s, cx + 40 * s, cy + 55 * s, cx, cy + 60 * s); ctx.bezierCurveTo(cx - 40 * s, cy + 55 * s, cx - 50 * s, cy - 10 * s, cx, cy - 80 * s); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,.5)'; ctx.beginPath(); ctx.ellipse(cx - 12 * s, cy + 10 * s, 8 * s, 18 * s, 0.2, 0, TAU); ctx.fill();
      break;
    }
    case 'forge': {
      glow(ctx, cx, cy + 40 * s, 150 * s, 'rgba(255,120,50,.35)', 0.8);
      drawProp(ctx, { type: 'anvil', x: cx, y: cy + 80 * s, s: 4 * s, seed: 1 }, { theme: 'city' }, time);
      flame(ctx, cx, cy + 20 * s, 1.6, time);
      break;
    }
    case 'temple': {
      glow(ctx, cx, cy, 150 * s, 'rgba(159,232,255,.25)', 0.8);
      for (let i = -2; i <= 2; i++) {
        ctx.fillStyle = '#5a6a9a'; ctx.fillRect(cx + i * 55 * s - 9 * s, cy - 70 * s, 18 * s, 150 * s);
        ctx.fillStyle = '#8a9ac8'; ctx.fillRect(cx + i * 55 * s - 13 * s, cy - 78 * s, 26 * s, 10 * s);
      }
      ctx.fillStyle = '#cfd8e8'; ctx.fillRect(cx - 140 * s, cy - 90 * s, 280 * s, 14 * s);
      break;
    }
    case 'library': {
      for (let i = -2; i <= 2; i++) {
        ctx.fillStyle = i % 2 ? '#2a1a3a' : '#3a2a5a'; ctx.fillRect(cx + i * 62 * s - 26 * s, cy - 120 * s, 52 * s, 230 * s);
        for (let j = 0; j < 5; j++) { ctx.fillStyle = ['#9d4b3f', '#4f6b8a', '#c9a86a', '#6b4b8a'][(i + j + 8) % 4]; ctx.fillRect(cx + i * 62 * s - 20 * s + j * 8 * s, cy - 100 * s, 6 * s, 30 * s); }
      }
      glow(ctx, cx, cy, 100 * s, 'rgba(180,140,255,.3)', 0.8);
      break;
    }
    case 'architect': {
      glow(ctx, cx, cy, 170 * s, 'rgba(180,140,255,.3)', 0.8);
      drawCreatureShape(ctx, 'architect', { main: '#1b1630', accent: '#b48cff', glow: '#dcc9ff', dark: '#08050f' }, { x: cx, y: cy + 100 * s, s: 4.6 * s, time, facing: 0 });
      for (let i = 0; i < 9; i++) { const a = time * 0.3 + i / 9 * TAU; ctx.fillStyle = '#b48cff'; ctx.globalAlpha = 0.4; poly(ctx, [[cx + Math.cos(a) * 130 * s, cy + Math.sin(a) * 70 * s], [cx + Math.cos(a + 0.2) * 140 * s, cy + Math.sin(a + 0.2) * 76 * s], [cx + Math.cos(a + 0.1) * 150 * s, cy + Math.sin(a + 0.1) * 82 * s]], '#b48cff'); }
      ctx.globalAlpha = 1;
      break;
    }
    case 'custodian': {
      glow(ctx, cx, cy, 130 * s, 'rgba(139,107,255,.3)', 0.8);
      drawCreatureShape(ctx, 'custodian', { main: '#2a2440', accent: '#b48cff', glow: '#8b6bff', dark: '#0a0a14' }, { x: cx, y: cy + 100 * s, s: 4.2 * s, time, facing: 0 });
      break;
    }
    case 'void': {
      for (let i = 0; i < 12; i++) {
        const a = time * 0.25 + i / 12 * TAU;
        ctx.strokeStyle = `rgba(180,140,255,${0.08 + i * 0.012})`; ctx.lineWidth = 2 * s;
        ctx.beginPath(); ctx.ellipse(cx, cy, 80 * s + i * 12 * s, 30 * s + i * 6 * s, a, 0, TAU); ctx.stroke();
      }
      glow(ctx, cx, cy, 130 * s, 'rgba(140,100,255,.4)', 0.9);
      break;
    }
    case 'ending_seal': {
      glow(ctx, cx, cy, 140 * s, 'rgba(159,232,255,.3)', 0.8);
      ctx.strokeStyle = '#9fe8ff'; ctx.lineWidth = 3 * s;
      ctx.beginPath(); ctx.arc(cx, cy, 90 * s, 0, TAU); ctx.stroke();
      ctx.beginPath(); ctx.arc(cx, cy, 60 * s, 0, TAU); ctx.stroke();
      poly(ctx, [[cx - 20 * s, cy - 100 * s], [cx + 20 * s, cy - 100 * s], [cx + 30 * s, cy + 40 * s], [cx, cy + 70 * s], [cx - 30 * s, cy + 40 * s]], '#d8f5ff');
      break;
    }
    case 'ending_ascend': {
      glow(ctx, cx, cy, 160 * s, 'rgba(255,233,168,.35)', 0.9);
      for (let i = 0; i < 7; i++) { const a = i / 7 * TAU + time * 0.2; drawCreatureShape(ctx, i % 2 ? 'star' : 'seraph', { main: '#fff3c4', accent: '#9fe8ff', glow: '#ffffff', dark: '#5a6a8a' }, { x: cx + Math.cos(a) * 120 * s, y: cy + Math.sin(a) * 70 * s, s: 1.8 * s, time }); }
      break;
    }
    case 'ending_break': {
      glow(ctx, cx, cy, 160 * s, 'rgba(217,255,154,.3)', 0.9);
      ctx.strokeStyle = '#d9ff9a'; ctx.lineWidth = 2 * s;
      for (let i = 0; i < 9; i++) { const a = i / 9 * TAU; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(a) * 150 * s, cy + Math.sin(a) * 100 * s); ctx.stroke(); }
      drawCreatureShape(ctx, 'sprout', { main: '#9fd67a', accent: '#5a8f3e', glow: '#d6ff9a', dark: '#35502a' }, { x: cx, y: cy + 80 * s, s: 3.4 * s, time });
      break;
    }
    default: {
      glow(ctx, cx, cy, 120 * s, pal[2], 0.3);
      ctx.strokeStyle = pal[2]; ctx.lineWidth = 2 * s;
      ctx.beginPath(); ctx.arc(cx, cy, 80 * s, 0, TAU); ctx.stroke();
    }
  }
  // viñeta y niebla
  const fog = ctx.createLinearGradient(0, h * 0.55, 0, h);
  fog.addColorStop(0, 'rgba(2,3,8,0)'); fog.addColorStop(1, 'rgba(2,3,8,.92)');
  ctx.fillStyle = fog; ctx.fillRect(0, h * 0.55, w, h * 0.45);
  vignette(ctx, w, h, 0.7);
}
