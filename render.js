/* ===========================================================
   LA ESPADA CELESTIAL — renderizado
   Canvas 2D: mundo, personajes, efectos y marcador de objetivo.
   =========================================================== */
'use strict';

const canvas = $('game');
/* Contexto opaco: evita que el compositor mezcle el canvas con la página en cada frame. */
let ctx = canvas.getContext('2d', { alpha: false, desynchronized: true });
const mainCtx = ctx;

/* Resolución interna: se puede reducir sin cambiar la escala del mundo.
   En pantallas de alta densidad ahorra millones de píxeles por fotograma. */
const RESOLUTION_SCALE = 0.8;

const PATH_COLORS = {
  village: '#4b4434',
  forest: '#383325',
  ruins: '#3a3440',
  temple: '#2b2130'
};

let vignette = null;

function resize() {
  const dpr = Math.min(1.5, window.devicePixelRatio || 1) * RESOLUTION_SCALE;
  const cssW = Math.max(320, window.innerWidth);
  const cssH = Math.max(320, window.innerHeight);
  canvas.width = Math.round(cssW * dpr);
  canvas.height = Math.round(cssH * dpr);

  const targetW = Math.min(800, Math.max(330, cssW * 0.86));
  const zoom = cssW / targetW;

  game.view.dpr = dpr;
  game.view.zoom = zoom;
  game.view.w = cssW / zoom;
  game.view.h = cssH / zoom;
  game.view.cssW = cssW;
  game.view.cssH = cssH;

  /* El viñeteado es estático: se rasteriza una vez a media resolución y se
     reutiliza como imagen. Repetir el degradado radial cada frame era costoso. */
  const vw = 512;
  const vh = Math.max(1, Math.round(vw * cssH / cssW));
  vignette = document.createElement('canvas');
  vignette.width = vw;
  vignette.height = vh;
  const vctx = vignette.getContext('2d');
  const vg = vctx.createRadialGradient(vw / 2, vh * 0.48, Math.min(vw, vh) * 0.3, vw / 2, vh * 0.5, Math.max(vw, vh) * 0.78);
  vg.addColorStop(0, 'rgba(0,0,0,0)');
  vg.addColorStop(1, 'rgba(0,0,0,0.62)');
  vctx.fillStyle = vg;
  vctx.fillRect(0, 0, vw, vh);

  if (game.map) snapCamera();
}

/* ----------------------------- Utilidades de dibujo ----------------------------- */
function inView(x, y, m = 130) {
  const c = game.camera, v = game.view;
  return x > c.x - m && x < c.x + v.w + m && y > c.y - m && y < c.y + v.h + m;
}

function shadow(x, y, rx, ry, alpha = 0.3) {
  ctx.fillStyle = `rgba(0,0,0,${alpha})`;
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
}

function roundRect(x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function label(text, x, y, color = '#f2e8d0', size = 10, weight = 600, alpha = 1) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.font = `${weight} ${size}px Inter, system-ui, sans-serif`;
  ctx.textAlign = 'center';
  ctx.lineWidth = 3;
  ctx.strokeStyle = 'rgba(0,0,0,0.72)';
  ctx.strokeText(text, x, y);
  ctx.fillStyle = color;
  ctx.fillText(text, x, y);
  ctx.restore();
}

function hpBar(x, y, w, ratio, color) {
  ctx.fillStyle = 'rgba(0,0,0,0.55)';
  roundRect(x - w / 2, y, w, 4, 2);
  ctx.fill();
  ctx.fillStyle = color;
  roundRect(x - w / 2, y, Math.max(0, w * ratio), 4, 2);
  ctx.fill();
}

/* ----------------------------- Terreno ----------------------------- */
function ensureDecor(map) {
  if (map._decor) return;
  const rng = mulberry32(map._seed * 131 + 7);
  map._decor = [];
  for (let i = 0; i < 150; i++) {
    map._decor.push({
      x: rng() * map.w,
      y: rng() * map.h,
      r: 12 + rng() * 46,
      c: rng() < 0.55 ? map.accent : (rng() < 0.5 ? '#000000' : '#ffffff'),
      a: 0.03 + rng() * 0.07
    });
  }
}

function paintGround(map) {
  ctx.fillStyle = map.ground;
  ctx.fillRect(0, 0, map.w, map.h);
  ensureDecor(map);
  for (const d of map._decor) {
    ctx.globalAlpha = d.a;
    ctx.fillStyle = d.c;
    ctx.beginPath();
    ctx.ellipse(d.x, d.y, d.r, d.r * 0.6, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  /* Suelo de piedra en ruinas y templo */
  if (map.id === 'ruins' || map.id === 'temple') {
    const size = map.id === 'temple' ? 96 : 120;
    const x0 = 0;
    const y0 = 0;
    ctx.strokeStyle = map.id === 'temple' ? 'rgba(233, 201, 119, 0.05)' : 'rgba(255, 255, 255, 0.035)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = x0; x < map.w + size; x += size) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, map.h);
    }
    for (let y = y0; y < map.h + size; y += size) {
      ctx.moveTo(0, y);
      ctx.lineTo(map.w, y);
    }
    ctx.stroke();
  }

  const pc = PATH_COLORS[map.id] || '#3e3a2c';
  for (const p of map.paths) {
    ctx.strokeStyle = pc;
    ctx.lineCap = 'round';
    ctx.lineWidth = p.w;
    ctx.beginPath();
    ctx.moveTo(p.x1, p.y1);
    ctx.lineTo(p.x2, p.y2);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,0.035)';
    ctx.lineWidth = p.w * 0.62;
    ctx.stroke();
  }

  ctx.strokeStyle = 'rgba(0,0,0,0.35)';
  ctx.lineWidth = 14;
  ctx.strokeRect(5, 5, map.w - 10, map.h - 10);
}

function drawGround(map) {
  if (!map._groundSprite) {
    const sprite = document.createElement('canvas');
    sprite.width = map.w;
    sprite.height = map.h;
    const previous = ctx;
    ctx = sprite.getContext('2d');
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    paintGround(map);

    /* Terreno y props estáticos se combinan en una sola textura de mapa.
       Así el fondo completo cuesta un único drawImage por frame. */
    const statics = map.props
      .filter((pr) => CACHED_PROP_KINDS.has(pr.kind))
      .sort((a, b) => a.y - b.y);
    for (const pr of statics) drawCachedProp(pr);

    ctx = previous;
    map._groundSprite = sprite;
  }

  const c = game.camera, v = game.view;
  const sx = Math.max(0, Math.floor(c.x - 24));
  const sy = Math.max(0, Math.floor(c.y - 24));
  const sw = Math.min(map.w - sx, Math.ceil(v.w + 48));
  const sh = Math.min(map.h - sy, Math.ceil(v.h + 48));
  if (sw > 0 && sh > 0) ctx.drawImage(map._groundSprite, sx, sy, sw, sh, sx, sy, sw, sh);

  if (map.id === 'temple') drawTempleRunes();
}

/* Los props estáticos ya están en el fondo; solo se redibujan encima del
   jugador cuando están delante y cerca, para conservar la sensación de profundidad. */
function propNeedsForeground(pr) {
  const p = game.p;
  return pr.y > p.y + 8 && Math.abs(pr.x - p.x) < 230 && pr.y - p.y < 250;
}

function drawTempleRunes() {
  const t = game.time;
  ctx.save();
  ctx.translate(550, 400);
  ctx.strokeStyle = 'rgba(233, 201, 119, 0.12)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, 0, 175, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(233, 201, 119, 0.07)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(0, 0, 140, 0, Math.PI * 2);
  ctx.stroke();
  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * Math.PI * 2 + t * 0.02;
    ctx.beginPath();
    ctx.moveTo(Math.cos(a) * 158, Math.sin(a) * 158);
    ctx.lineTo(Math.cos(a) * 168, Math.sin(a) * 168);
    ctx.stroke();
  }
  ctx.restore();
}

/* ----------------------------- Props ----------------------------- */
function drawTree(p) {
  const s = p.s;
  shadow(p.x, p.y + 2, 20 * s, 7 * s, 0.32);
  ctx.fillStyle = '#463323';
  ctx.beginPath();
  ctx.moveTo(p.x - 4 * s, p.y);
  ctx.lineTo(p.x - 2.5 * s, p.y - 30 * s);
  ctx.lineTo(p.x + 2.5 * s, p.y - 30 * s);
  ctx.lineTo(p.x + 4 * s, p.y);
  ctx.closePath();
  ctx.fill();

  const dark = p.tone ? '#183428' : '#16301e';
  const mid = p.tone ? '#234a35' : '#21452b';
  const lite = p.tone ? '#2f5d44' : '#2c5c38';
  ctx.fillStyle = dark;
  ctx.beginPath();
  ctx.arc(p.x - 13 * s, p.y - 38 * s, 17 * s, 0, Math.PI * 2);
  ctx.arc(p.x + 13 * s, p.y - 38 * s, 17 * s, 0, Math.PI * 2);
  ctx.arc(p.x, p.y - 50 * s, 20 * s, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = mid;
  ctx.beginPath();
  ctx.arc(p.x - 7 * s, p.y - 44 * s, 14 * s, 0, Math.PI * 2);
  ctx.arc(p.x + 9 * s, p.y - 42 * s, 12 * s, 0, Math.PI * 2);
  ctx.arc(p.x + 1 * s, p.y - 55 * s, 14 * s, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = lite;
  ctx.globalAlpha = 0.65;
  ctx.beginPath();
  ctx.arc(p.x - 5 * s, p.y - 52 * s, 8 * s, 0, Math.PI * 2);
  ctx.arc(p.x + 6 * s, p.y - 47 * s, 5 * s, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
}

function drawRock(p) {
  const s = p.s;
  shadow(p.x, p.y + 2, 16 * s, 5 * s, 0.3);
  ctx.fillStyle = '#4a4d55';
  ctx.beginPath();
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2;
    const rr = (11 + Math.sin(i * 2.7 + p.x) * 3) * s;
    const px = p.x + Math.cos(a) * rr;
    const py = p.y - 6 * s + Math.sin(a) * rr * 0.7;
    i ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.12)';
  ctx.beginPath();
  ctx.ellipse(p.x - 3 * s, p.y - 12 * s, 7 * s, 4 * s, -0.4, 0, Math.PI * 2);
  ctx.fill();
}

function drawBush(p) {
  const s = p.s;
  shadow(p.x, p.y + 2, 13 * s, 4 * s, 0.24);
  ctx.fillStyle = '#2a4f32';
  ctx.beginPath();
  ctx.arc(p.x - 7 * s, p.y - 6 * s, 8 * s, 0, Math.PI * 2);
  ctx.arc(p.x + 7 * s, p.y - 6 * s, 8 * s, 0, Math.PI * 2);
  ctx.arc(p.x, p.y - 11 * s, 9 * s, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#396943';
  ctx.beginPath();
  ctx.arc(p.x - 2 * s, p.y - 10 * s, 5 * s, 0, Math.PI * 2);
  ctx.fill();
}

function drawHouse(p) {
  const { x, y, w, h } = p;
  shadow(x, y + 4, w * 0.54, 12, 0.34);
  const wall = p.tone ? '#3d3142' : '#3b322a';
  const wall2 = p.tone ? '#2c2433' : '#2b241e';
  const g = ctx.createLinearGradient(0, y - h, 0, y);
  g.addColorStop(0, wall);
  g.addColorStop(1, wall2);
  ctx.fillStyle = g;
  ctx.fillRect(x - w / 2, y - h, w, h);

  ctx.fillStyle = p.tone ? '#5f3d52' : '#743d34';
  ctx.beginPath();
  ctx.moveTo(x - w / 2 - 14, y - h + 6);
  ctx.lineTo(x, y - h - 44);
  ctx.lineTo(x + w / 2 + 14, y - h + 6);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.09)';
  ctx.beginPath();
  ctx.moveTo(x - w / 2 - 14, y - h + 6);
  ctx.lineTo(x, y - h - 44);
  ctx.lineTo(x - w * 0.05, y - h + 6);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = 'rgba(0,0,0,0.22)';
  ctx.fillRect(x - w / 2, y - h + 6, w, 6);

  const dw = 30, dh = 46;
  ctx.fillStyle = '#2a1d14';
  ctx.fillRect(x - dw / 2, y - dh, dw, dh);
  ctx.fillStyle = '#6b4a2a';
  ctx.fillRect(x - dw / 2 + 3, y - dh + 4, dw - 6, dh - 4);
  ctx.fillStyle = '#d9a44a';
  ctx.beginPath();
  ctx.arc(x + 9, y - dh / 2 - 3, 2, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = 'rgba(255,214,138,0.85)';
  ctx.fillRect(x - w / 2 + 26, y - h + 34, 22, 18);
  ctx.fillRect(x + w / 2 - 48, y - h + 34, 22, 18);
  ctx.strokeStyle = 'rgba(0,0,0,0.4)';
  ctx.lineWidth = 2;
  ctx.strokeRect(x - w / 2 + 26, y - h + 34, 22, 18);
  ctx.strokeRect(x + w / 2 - 48, y - h + 34, 22, 18);

  ctx.fillStyle = '#4a3226';
  ctx.fillRect(x + w * 0.24, y - h - 26, 14, 30);
}

function drawFountain(p) {
  const t = game.time;
  shadow(p.x, p.y + 4, 62, 18, 0.35);
  ctx.fillStyle = '#4a4e55';
  ctx.beginPath();
  ctx.ellipse(p.x, p.y, 60, 26, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#5b6068';
  ctx.beginPath();
  ctx.ellipse(p.x, p.y - 4, 60, 26, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#203d4f';
  ctx.beginPath();
  ctx.ellipse(p.x, p.y - 4, 50, 20, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(120,200,235,0.55)';
  for (let i = 0; i < 3; i++) {
    const rr = 14 + i * 12;
    ctx.beginPath();
    ctx.ellipse(p.x + Math.sin(t * 1.2 + i) * 4, p.y - 4 + Math.cos(t + i) * 2, rr, rr * 0.4, 0, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(150,225,255,${0.25 - i * 0.05})`;
    ctx.lineWidth = 2;
    ctx.stroke();
  }
  ctx.fillStyle = '#4f545c';
  ctx.fillRect(p.x - 5, p.y - 46, 10, 40);
  ctx.beginPath();
  ctx.arc(p.x, p.y - 50, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(170,230,255,0.75)';
  ctx.beginPath();
  ctx.arc(p.x, p.y - 52, 3, 0, Math.PI * 2);
  ctx.fill();
}

function drawPillar(p) {
  const s = p.s;
  shadow(p.x, p.y + 2, 18 * s, 6 * s, 0.3);
  ctx.fillStyle = '#514b57';
  ctx.fillRect(p.x - 20 * s, p.y - 8 * s, 40 * s, 10 * s);
  const g = ctx.createLinearGradient(p.x - 14 * s, 0, p.x + 14 * s, 0);
  g.addColorStop(0, '#3b3642');
  g.addColorStop(0.4, '#5c5566');
  g.addColorStop(1, '#332e3a');
  ctx.fillStyle = g;
  const h = (p.broken ? 44 : 78) * s;
  ctx.fillRect(p.x - 12 * s, p.y - h, 24 * s, h);
  ctx.fillStyle = '#5d5668';
  ctx.fillRect(p.x - 17 * s, p.y - h - 8 * s, 34 * s, 9 * s);
  if (p.broken) {
    ctx.fillStyle = '#3b3642';
    ctx.beginPath();
    ctx.moveTo(p.x - 12 * s, p.y - h);
    ctx.lineTo(p.x + 3 * s, p.y - h - 10 * s);
    ctx.lineTo(p.x + 12 * s, p.y - h + 4 * s);
    ctx.closePath();
    ctx.fill();
  }
  ctx.fillStyle = 'rgba(255,255,255,0.08)';
  ctx.fillRect(p.x - 8 * s, p.y - h, 4 * s, h);
}

function drawCrystal(p) {
  const t = game.time;
  const pulse = 0.75 + Math.sin(t * 2 + p.x) * 0.25;
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const g = ctx.createRadialGradient(p.x, p.y - 16, 2, p.x, p.y - 16, 32);
  g.addColorStop(0, p.color || '#9fd8ff');
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.globalAlpha = 0.35 * pulse;
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(p.x, p.y - 16, 32, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  shadow(p.x, p.y + 1, 12, 4, 0.3);
  ctx.fillStyle = p.color || '#9fd8ff';
  ctx.globalAlpha = 0.85;
  ctx.beginPath();
  ctx.moveTo(p.x, p.y - 36);
  ctx.lineTo(p.x + 9, p.y - 18);
  ctx.lineTo(p.x + 4, p.y);
  ctx.lineTo(p.x - 5, p.y);
  ctx.lineTo(p.x - 9, p.y - 18);
  ctx.closePath();
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.fillStyle = 'rgba(255,255,255,0.6)';
  ctx.beginPath();
  ctx.moveTo(p.x, p.y - 33);
  ctx.lineTo(p.x + 3, p.y - 18);
  ctx.lineTo(p.x - 1, p.y - 4);
  ctx.closePath();
  ctx.fill();
}

function drawTorch(p) {
  const t = game.time;
  shadow(p.x, p.y + 1, 7, 3, 0.28);
  ctx.fillStyle = '#4a3524';
  ctx.fillRect(p.x - 2, p.y - 30, 4, 30);
  ctx.fillStyle = '#6b5037';
  ctx.fillRect(p.x - 5, p.y - 34, 10, 5);
  const fl = Math.sin(t * 9 + p.x) * 2;
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const g = ctx.createRadialGradient(p.x, p.y - 42, 1, p.x, p.y - 42, 26);
  g.addColorStop(0, 'rgba(255,190,90,0.55)');
  g.addColorStop(1, 'rgba(255,120,40,0)');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(p.x, p.y - 42, 26, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  ctx.fillStyle = '#ffb43c';
  ctx.beginPath();
  ctx.ellipse(p.x + fl * 0.4, p.y - 40, 5, 9 + fl * 0.4, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffe9a8';
  ctx.beginPath();
  ctx.ellipse(p.x, p.y - 39, 2.5, 5, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawBones(p) {
  ctx.strokeStyle = 'rgba(214,209,196,0.55)';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(p.x - 8, p.y - 2);
  ctx.lineTo(p.x + 8, p.y);
  ctx.moveTo(p.x - 2, p.y - 6);
  ctx.lineTo(p.x + 3, p.y + 2);
  ctx.stroke();
  ctx.fillStyle = 'rgba(214,209,196,0.6)';
  ctx.beginPath();
  ctx.arc(p.x - 10, p.y - 3, 3, 0, Math.PI * 2);
  ctx.arc(p.x + 10, p.y + 1, 3, 0, Math.PI * 2);
  ctx.fill();
}

function drawFlower(p) {
  ctx.strokeStyle = '#3d6b44';
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(p.x, p.y);
  ctx.lineTo(p.x, p.y - 7);
  ctx.stroke();
  ctx.fillStyle = p.color || '#e3c26a';
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2;
    ctx.beginPath();
    ctx.arc(p.x + Math.cos(a) * 2.6, p.y - 8 + Math.sin(a) * 2.6, 2, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = '#fff2c0';
  ctx.beginPath();
  ctx.arc(p.x, p.y - 8, 1.3, 0, Math.PI * 2);
  ctx.fill();
}

function drawShrine(p) {
  const t = game.time;
  shadow(p.x, p.y + 2, 24, 7, 0.35);
  ctx.fillStyle = '#4a4652';
  ctx.beginPath();
  ctx.ellipse(p.x, p.y, 24, 9, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#5b5664';
  ctx.fillRect(p.x - 14, p.y - 18, 28, 18);
  ctx.fillStyle = '#3e3946';
  ctx.fillRect(p.x - 18, p.y - 22, 36, 6);

  const fl = Math.sin(t * 3.4) * 2;
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const g = ctx.createRadialGradient(p.x, p.y - 40, 2, p.x, p.y - 40, 44);
  g.addColorStop(0, 'rgba(160,235,255,0.45)');
  g.addColorStop(1, 'rgba(80,180,255,0)');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(p.x, p.y - 40, 44, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  ctx.fillStyle = '#9fdcff';
  ctx.beginPath();
  ctx.ellipse(p.x + fl * 0.3, p.y - 34, 7, 14, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#e8fbff';
  ctx.beginPath();
  ctx.ellipse(p.x, p.y - 32, 3, 8, 0, 0, Math.PI * 2);
  ctx.fill();
}

/* ----------------------------- Entidades ----------------------------- */
function drawPlayer() {
  const p = game.p;
  const t = game.time;
  const bob = Math.sin(t * 7) * 1.1;
  const blink = p.invuln > 0 && Math.sin(t * 38) > 0;

  shadow(p.x, p.y + 11, 13, 5, 0.35);

  ctx.save();
  ctx.translate(p.x, p.y + bob);
  if (blink) ctx.globalAlpha = 0.5;

  if (p.blade >= 3) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const g = ctx.createRadialGradient(0, -10, 4, 0, -10, 38);
    g.addColorStop(0, 'rgba(255,228,150,0.22)');
    g.addColorStop(1, 'rgba(255,210,120,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(0, -10, 38, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  /* Capa */
  ctx.fillStyle = '#20364c';
  ctx.beginPath();
  ctx.moveTo(-8, -14);
  ctx.quadraticCurveTo(-14 - Math.sin(t * 4) * 1.5, 2, -6, 8);
  ctx.lineTo(6, 8);
  ctx.quadraticCurveTo(13 + Math.sin(t * 4) * 1.5, 2, 8, -14);
  ctx.closePath();
  ctx.fill();

  /* Cuerpo */
  const bg = ctx.createLinearGradient(0, -22, 0, 6);
  bg.addColorStop(0, '#4f89ad');
  bg.addColorStop(1, '#22415b');
  ctx.fillStyle = bg;
  ctx.beginPath();
  ctx.ellipse(0, -7, 9, 13, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#d8b06a';
  ctx.fillRect(-9, -4, 18, 3);

  /* Cabeza */
  ctx.fillStyle = '#f0c9a0';
  ctx.beginPath();
  ctx.arc(0, -24, 6.6, 0, Math.PI * 2);
  ctx.fill();

  /* Pelo */
  ctx.fillStyle = '#2b2028';
  ctx.beginPath();
  ctx.arc(0, -26, 6.8, Math.PI * 1.05, Math.PI * 1.95);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(-5.6, -22, 2.2, 4, 0.3, 0, Math.PI * 2);
  ctx.fill();

  /* Ojos orientados */
  const ex = Math.cos(p.dir) * 2.2;
  const ey = Math.sin(p.dir) * 1.3;
  ctx.fillStyle = '#1b2230';
  ctx.beginPath();
  ctx.arc(-2.2 + ex, -23 + ey, 1.25, 0, Math.PI * 2);
  ctx.arc(2.2 + ex, -23 + ey, 1.25, 0, Math.PI * 2);
  ctx.fill();

  /* Bufanda */
  ctx.fillStyle = '#b8452f';
  ctx.beginPath();
  ctx.ellipse(0, -16, 6.5, 2.6, 0, 0, Math.PI * 2);
  ctx.fill();

  /* Espada */
  let ang = p.dir + 0.95;
  if (p.atkAnim > 0) {
    const pr = 1 - p.atkAnim / 0.2;
    ang = p.dir - 1.15 + pr * 2.3;
  }
  ctx.save();
  ctx.translate(Math.cos(p.dir) * 4, -8 + Math.sin(p.dir) * 3);
  ctx.rotate(ang);
  const bcol = bladeColor();
  ctx.strokeStyle = 'rgba(255,255,255,0.18)';
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.moveTo(4, 0);
  ctx.lineTo(30, 0);
  ctx.stroke();
  const sg = ctx.createLinearGradient(4, 0, 30, 0);
  sg.addColorStop(0, '#8a7a5a');
  sg.addColorStop(0.25, bcol);
  sg.addColorStop(1, '#ffffff');
  ctx.strokeStyle = sg;
  ctx.lineWidth = 3.4;
  ctx.beginPath();
  ctx.moveTo(4, 0);
  ctx.lineTo(30, 0);
  ctx.stroke();
  ctx.fillStyle = '#c9a24d';
  ctx.fillRect(1, -4.5, 3, 9);
  ctx.restore();

  ctx.restore();

  if (p.hitFlash > 0) {
    ctx.fillStyle = `rgba(255,70,70,${p.hitFlash * 1.2})`;
    ctx.beginPath();
    ctx.arc(p.x, p.y - 10, 20, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawSlime(e) {
  const t = game.time;
  const bob = Math.sin(t * 5 + e.x * 0.1) * 2;
  const sq = 1 + Math.sin(t * 6 + e.x) * 0.07;
  shadow(e.x, e.y + 8, 15, 5, 0.3);
  ctx.save();
  ctx.translate(e.x, e.y + 4 + bob * 0.3);
  const g = ctx.createLinearGradient(0, -22, 0, 4);
  g.addColorStop(0, '#9fe08a');
  g.addColorStop(0.55, '#5fae5f');
  g.addColorStop(1, '#356b3f');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.ellipse(0, -6, 16 / sq, 12 * sq, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  ctx.beginPath();
  ctx.ellipse(-5, -12, 5, 3.4, -0.4, 0, Math.PI * 2);
  ctx.fill();

  const ex = Math.cos(e.dir) * 2;
  const ey = Math.sin(e.dir) * 1.4;
  ctx.fillStyle = '#f6fff0';
  ctx.beginPath();
  ctx.arc(-5 + ex, -8 + ey, 3.2, 0, Math.PI * 2);
  ctx.arc(5 + ex, -8 + ey, 3.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#1b2a1c';
  ctx.beginPath();
  ctx.arc(-5 + ex * 1.4, -8 + ey * 1.4, 1.5, 0, Math.PI * 2);
  ctx.arc(5 + ex * 1.4, -8 + ey * 1.4, 1.5, 0, Math.PI * 2);
  ctx.fill();
  if (e.hitFlash > 0) {
    ctx.fillStyle = `rgba(255,255,255,${e.hitFlash * 3})`;
    ctx.beginPath();
    ctx.ellipse(0, -6, 16, 12, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
  if (e.hp < e.maxHp) hpBar(e.x, e.y - 32, 30, e.hp / e.maxHp, '#7fd66f');
  if (e.state === 'windup') {
    ctx.strokeStyle = 'rgba(255,90,80,0.85)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(e.x, e.y - 4, e.r + 6, -0.6, 0.6);
    ctx.stroke();
  }
}

function drawGhost(e) {
  const t = game.time;
  const fl = Math.sin(t * 3 + e.x * 0.05) * 4;
  shadow(e.x, e.y + 10, 12, 4, 0.18);
  ctx.save();
  ctx.translate(e.x, e.y - 10 + fl);
  ctx.globalAlpha = 0.92;
  const g = ctx.createLinearGradient(0, -22, 0, 18);
  g.addColorStop(0, 'rgba(190,225,255,0.95)');
  g.addColorStop(1, 'rgba(70,110,160,0.55)');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(0, -10, 12, Math.PI, 0);
  ctx.lineTo(12, 8);
  for (let i = 0; i < 4; i++) {
    ctx.quadraticCurveTo(9 - i * 6, 16 + Math.sin(t * 5 + i) * 3, 6 - i * 6, 8);
  }
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = 'rgba(255,255,255,0.14)';
  ctx.beginPath();
  ctx.arc(-4, -14, 5, 0, Math.PI * 2);
  ctx.fill();

  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const eyeGlow = ctx.createRadialGradient(0, -10, 1, 0, -10, 16);
  eyeGlow.addColorStop(0, 'rgba(160,240,255,0.6)');
  eyeGlow.addColorStop(1, 'rgba(160,240,255,0)');
  ctx.fillStyle = eyeGlow;
  ctx.beginPath();
  ctx.arc(0, -10, 16, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  ctx.fillStyle = '#d9fbff';
  ctx.beginPath();
  ctx.ellipse(-4.4, -11, 2.3, 3.1, 0, 0, Math.PI * 2);
  ctx.ellipse(4.4, -11, 2.3, 3.1, 0, 0, Math.PI * 2);
  ctx.fill();

  if (e.hitFlash > 0) {
    ctx.globalAlpha = e.hitFlash * 3;
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(0, -8, 15, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
  if (e.hp < e.maxHp) hpBar(e.x, e.y - 40, 30, e.hp / e.maxHp, '#a8d8ff');
  if (e.state === 'windup') {
    ctx.strokeStyle = 'rgba(160,230,255,0.9)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(e.x, e.y - 8, e.r + 8, -0.7, 0.7);
    ctx.stroke();
  }
}

function drawBoss(b) {
  const t = game.time;
  const fl = Math.sin(t * 2.2) * 1.5;
  shadow(b.x, b.y + 18, 40, 14, 0.45);
  ctx.save();
  ctx.translate(b.x, b.y + fl);

  /* Capa */
  ctx.fillStyle = '#3a1a1d';
  ctx.beginPath();
  ctx.moveTo(-28, -46);
  ctx.quadraticCurveTo(-46, -4, -30, 16);
  ctx.lineTo(30, 16);
  ctx.quadraticCurveTo(46, -4, 28, -46);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = 'rgba(200,110,60,0.25)';
  ctx.lineWidth = 2;
  ctx.stroke();

  /* Piernas / base */
  ctx.fillStyle = '#221820';
  ctx.beginPath();
  ctx.ellipse(-11, 2, 10, 15, 0, 0, Math.PI * 2);
  ctx.ellipse(11, 2, 10, 15, 0, 0, Math.PI * 2);
  ctx.fill();

  /* Torso blindado */
  const g = ctx.createLinearGradient(-26, -54, 26, 6);
  g.addColorStop(0, '#6a4a3c');
  g.addColorStop(0.45, '#3d2a2c');
  g.addColorStop(1, '#1b141b');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.ellipse(0, -28, 26, 30, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,150,90,0.28)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  /* Placas */
  ctx.fillStyle = '#4a3330';
  roundRect(-18, -44, 36, 9, 3);
  ctx.fill();
  ctx.fillStyle = '#2e2025';
  roundRect(-15, -16, 30, 7, 3);
  ctx.fill();

  /* Hombreras */
  ctx.fillStyle = '#4a3236';
  ctx.beginPath();
  ctx.ellipse(-25, -48, 11, 9, -0.35, 0, Math.PI * 2);
  ctx.ellipse(25, -48, 11, 9, 0.35, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#c99a4a';
  ctx.beginPath();
  ctx.arc(-30, -51, 2, 0, Math.PI * 2);
  ctx.arc(30, -51, 2, 0, Math.PI * 2);
  ctx.fill();

  /* Núcleo de ceniza */
  const pulse = 0.8 + Math.sin(t * 4) * 0.2;
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const cg = ctx.createRadialGradient(0, -28, 2, 0, -28, 24);
  cg.addColorStop(0, `rgba(255,180,100,${0.95 * pulse})`);
  cg.addColorStop(1, 'rgba(255,90,40,0)');
  ctx.fillStyle = cg;
  ctx.beginPath();
  ctx.arc(0, -28, 24, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  ctx.fillStyle = '#ffbe7a';
  ctx.beginPath();
  ctx.arc(0, -28, 5.5, 0, Math.PI * 2);
  ctx.fill();

  /* Cabeza con yelmo */
  ctx.fillStyle = '#2c2028';
  ctx.beginPath();
  ctx.arc(0, -62, 13, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,150,90,0.35)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  /* Visor encendido */
  ctx.fillStyle = '#ffb066';
  ctx.beginPath();
  ctx.ellipse(0, -62, 7, 2.2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const eg = ctx.createRadialGradient(0, -62, 1, 0, -62, 12);
  eg.addColorStop(0, 'rgba(255,190,110,0.6)');
  eg.addColorStop(1, 'rgba(255,120,60,0)');
  ctx.fillStyle = eg;
  ctx.beginPath();
  ctx.arc(0, -62, 12, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  /* Corona de ceniza */
  ctx.fillStyle = '#c99a4a';
  ctx.beginPath();
  ctx.moveTo(-13, -70);
  ctx.lineTo(-8, -84);
  ctx.lineTo(-3, -72);
  ctx.lineTo(2, -88);
  ctx.lineTo(7, -71);
  ctx.lineTo(13, -80);
  ctx.lineTo(14, -66);
  ctx.lineTo(-13, -66);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = 'rgba(255,220,150,0.55)';
  ctx.beginPath();
  ctx.arc(2, -88, 2, 0, Math.PI * 2);
  ctx.fill();

  /* Espada del rey */
  ctx.save();
  ctx.translate(30, -26);
  ctx.rotate(0.3 + Math.sin(t * 2) * 0.04);
  ctx.fillStyle = '#5a4030';
  ctx.fillRect(-3, -2, 6, 13);
  ctx.fillStyle = '#9a7a52';
  ctx.fillRect(-11, -6, 22, 5);
  const bg2 = ctx.createLinearGradient(0, -8, 0, -78);
  bg2.addColorStop(0, '#8f7f78');
  bg2.addColorStop(0.6, '#d8c6b4');
  bg2.addColorStop(1, '#f4e6d2');
  ctx.fillStyle = bg2;
  ctx.beginPath();
  ctx.moveTo(-4.5, -8);
  ctx.lineTo(0, -80);
  ctx.lineTo(4.5, -8);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = 'rgba(60,30,20,0.5)';
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.restore();

  if (b.hitFlash > 0) {
    ctx.globalAlpha = Math.min(1, b.hitFlash * 2.2);
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.ellipse(0, -34, 32, 46, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }
  ctx.restore();

  if (b.phase === 2) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 6; i++) {
      const a = t * 1.6 + i * 1.05;
      const rx = b.x + Math.cos(a) * (30 + Math.sin(t * 3 + i) * 6);
      const ry = b.y - 30 + Math.sin(a) * 18;
      ctx.fillStyle = 'rgba(255,140,70,0.5)';
      ctx.beginPath();
      ctx.arc(rx, ry, 3 + Math.sin(t * 4 + i) * 1.2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
}

function drawNpc(npc) {
  const t = game.time;
  const bob = Math.sin(t * 3 + npc.x) * 1.2;
  shadow(npc.x, npc.y + 2, 12, 4.4, 0.32);
  ctx.save();
  ctx.translate(npc.x, npc.y + bob);

  /* Túnica */
  ctx.fillStyle = npc.robe;
  ctx.beginPath();
  ctx.moveTo(-9, -22);
  ctx.quadraticCurveTo(-13, -4, -8, 4);
  ctx.lineTo(8, 4);
  ctx.quadraticCurveTo(13, -4, 9, -22);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.1)';
  ctx.beginPath();
  ctx.moveTo(-9, -22);
  ctx.lineTo(-2, -2);
  ctx.lineTo(-8, 4);
  ctx.closePath();
  ctx.fill();

  /* Cabeza */
  ctx.fillStyle = '#e8c09a';
  ctx.beginPath();
  ctx.arc(0, -30, 6.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = npc.hair;
  ctx.beginPath();
  ctx.arc(0, -32, 6.6, Math.PI * 1.02, Math.PI * 1.98);
  ctx.fill();
  if (npc.id === 'mira') {
    ctx.beginPath();
    ctx.arc(0, -35, 3.2, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = '#1c2230';
  ctx.beginPath();
  ctx.arc(-2.2, -29, 1, 0, Math.PI * 2);
  ctx.arc(2.2, -29, 1, 0, Math.PI * 2);
  ctx.fill();

  /* Bastón / martillo */
  if (npc.id === 'mira') {
    ctx.strokeStyle = '#6b5236';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(11, 4);
    ctx.lineTo(13, -34);
    ctx.stroke();
    ctx.fillStyle = '#9fdcff';
    ctx.beginPath();
    ctx.arc(13, -37, 3.4, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.strokeStyle = '#5a4330';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(11, 3);
    ctx.lineTo(15, -26);
    ctx.stroke();
    ctx.fillStyle = '#7d8087';
    ctx.fillRect(8, -30, 14, 6);
  }
  ctx.restore();

  const p = game.p;
  const d = dist(p.x, p.y, npc.x, npc.y);
  if (d < 150) label(npc.name, npc.x, npc.y - 50, '#f0e6cd', 10, 600, 0.95);

  let marker = null;
  if (npc.id === 'mira' && p.stage === 1) marker = '!';
  if (npc.id === 'herrero' && p.blade < 3 && p.gold >= 60) marker = '⚒';
  if (marker) {
    const my = npc.y - 62 + Math.sin(t * 4) * 3;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const g = ctx.createRadialGradient(npc.x, my, 1, npc.x, my, 16);
    g.addColorStop(0, 'rgba(255,220,130,0.5)');
    g.addColorStop(1, 'rgba(255,220,130,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(npc.x, my, 16, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    label(marker, npc.x, my + 5, '#ffe39a', 17, 800);
  }
}

function drawChest(c) {
  const p = game.p;
  const t = game.time;
  const ready = !c.opened && p.stage === 3 && p.ghostKills >= 6;
  const opened = c.opened;
  shadow(c.x, c.y + 2, 22, 7, 0.35);

  if (ready) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const g = ctx.createRadialGradient(c.x, c.y - 12, 2, c.x, c.y - 12, 50);
    g.addColorStop(0, `rgba(255,220,130,${0.25 + Math.sin(t * 3) * 0.1})`);
    g.addColorStop(1, 'rgba(255,200,90,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(c.x, c.y - 12, 50, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  ctx.fillStyle = opened ? '#4a3520' : '#6b4a24';
  roundRect(c.x - 20, c.y - 20, 40, 22, 3);
  ctx.fill();
  ctx.fillStyle = opened ? '#5d452b' : '#8a632f';
  roundRect(c.x - 20, c.y - 28, 40, 12, 4);
  ctx.fill();
  if (opened) {
    ctx.save();
    ctx.translate(c.x, c.y - 28);
    ctx.rotate(-0.8);
    ctx.fillStyle = '#6b4f2c';
    roundRect(-20, -10, 40, 12, 4);
    ctx.fill();
    ctx.restore();
  }
  ctx.strokeStyle = ready ? '#ffe39a' : '#3a2a16';
  ctx.lineWidth = 2;
  ctx.strokeRect(c.x - 20, c.y - 20, 40, 22);
  ctx.fillStyle = ready ? '#ffe39a' : '#a8874a';
  ctx.fillRect(c.x - 4, c.y - 24, 8, 10);
  if (!opened && p.stage < 3) {
    ctx.strokeStyle = 'rgba(160,90,90,0.7)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(c.x - 24, c.y - 6);
    ctx.lineTo(c.x + 24, c.y - 34);
    ctx.moveTo(c.x + 24, c.y - 6);
    ctx.lineTo(c.x - 24, c.y - 34);
    ctx.stroke();
  }
}

function drawPortal(p) {
  const po = p.portal;
  const pstate = game.p;
  const locked = po.needStage && pstate.stage < po.needStage;
  const t = game.time;
  const col = locked ? '#a05a5a' : po.color;

  shadow(po.x, po.y + 6, 46, 12, 0.4);

  /* Arco */
  ctx.strokeStyle = '#4c4652';
  ctx.lineWidth = 11;
  ctx.beginPath();
  ctx.arc(po.x, po.y - 8, 40, Math.PI * 1.02, Math.PI * 1.98);
  ctx.stroke();
  ctx.fillStyle = '#514b58';
  ctx.fillRect(po.x - 46, po.y - 12, 13, 20);
  ctx.fillRect(po.x + 33, po.y - 12, 13, 20);

  /* Vórtice */
  ctx.save();
  ctx.beginPath();
  ctx.arc(po.x, po.y - 26, 33, Math.PI, Math.PI * 2);
  ctx.closePath();
  ctx.clip();
  ctx.globalCompositeOperation = 'lighter';
  const g = ctx.createRadialGradient(po.x, po.y - 30, 2, po.x, po.y - 30, 36);
  g.addColorStop(0, col);
  g.addColorStop(0.45, 'rgba(70,90,120,0.5)');
  g.addColorStop(1, 'rgba(10,15,25,0)');
  ctx.globalAlpha = locked ? 0.35 : 0.85;
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(po.x, po.y - 28, 36, 0, Math.PI * 2);
  ctx.fill();
  if (!locked) {
    for (let i = 0; i < 3; i++) {
      const a = t * 1.4 + i * 2.1;
      ctx.strokeStyle = 'rgba(220,245,255,0.35)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(po.x + Math.cos(a) * 6, po.y - 28 + Math.sin(a) * 4, 14 + i * 5, a, a + 1.6);
      ctx.stroke();
    }
  }
  ctx.restore();

  if (locked) {
    ctx.strokeStyle = 'rgba(200,110,110,0.85)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(po.x - 16, po.y - 12);
    ctx.lineTo(po.x + 16, po.y - 40);
    ctx.moveTo(po.x + 16, po.y - 12);
    ctx.lineTo(po.x - 16, po.y - 40);
    ctx.stroke();
    label('✕', po.x, po.y - 60, '#ff9a9a', 13, 800);
  }

  if (dist(game.p.x, game.p.y, po.x, po.y) < 120) {
    label(po.label, po.x, po.y + 30, locked ? '#ffb0b0' : '#ffe7b0', 10.5, 600, 0.95);
    if (locked) label(po.needStage === 3 ? 'Derrota 5 limos' : 'Recupera el Fragmento', po.x, po.y + 43, '#c99a9a', 9, 500, 0.9);
  }
}

/* ----------------------------- Efectos ----------------------------- */
function drawTelegraph(fx) {
  const pr = 1 - fx.life / fx.max;
  const pulse = 0.5 + Math.sin(game.time * 14) * 0.5;
  ctx.save();
  ctx.globalAlpha = 0.12 + pr * 0.2;
  ctx.fillStyle = fx.color;
  ctx.beginPath();
  ctx.arc(fx.x, fx.y, fx.r, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 0.65 + pulse * 0.25;
  ctx.strokeStyle = fx.color;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(fx.x, fx.y, fx.r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.globalAlpha = 0.5;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(fx.x, fx.y, fx.r * (0.35 + pr * 0.6), 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

function drawEffects() {
  for (const fx of game.effects) {
    if (fx.kind === 'telegraph') { drawTelegraph(fx); continue; }
    const a = fx.life / fx.max;
    if (fx.kind === 'ring') {
      const r = fx.r * (0.35 + (1 - a) * 0.75);
      ctx.save();
      ctx.globalAlpha = a * 0.85;
      ctx.strokeStyle = fx.color;
      ctx.lineWidth = 3 + a * 4;
      ctx.beginPath();
      ctx.arc(fx.x, fx.y, r, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = a * 0.18;
      ctx.fillStyle = fx.color;
      ctx.beginPath();
      ctx.arc(fx.x, fx.y, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    } else if (fx.kind === 'slash') {
      const pr = 1 - a;
      const start = fx.dir - 1.2 + pr * 1.6;
      ctx.save();
      ctx.globalAlpha = a * 0.9;
      ctx.strokeStyle = '#fff4d0';
      ctx.lineWidth = 7 * a + 2;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.arc(fx.x, fx.y - 6, 48, start, start + 1.05);
      ctx.stroke();
      ctx.strokeStyle = bladeColor();
      ctx.globalAlpha = a * 0.55;
      ctx.lineWidth = 13 * a + 3;
      ctx.beginPath();
      ctx.arc(fx.x, fx.y - 6, 46, start, start + 1.05);
      ctx.stroke();
      ctx.restore();
    }
  }
}

function drawParticles() {
  for (const pt of game.particles) {
    ctx.globalAlpha = Math.max(0, pt.life / pt.max);
    ctx.fillStyle = pt.color;
    ctx.beginPath();
    ctx.arc(pt.x, pt.y, pt.size * (0.5 + pt.life / pt.max * 0.5), 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function drawNumbers() {
  for (const n of game.numbers) {
    const a = Math.min(1, n.life / n.max * 1.6);
    ctx.save();
    ctx.globalAlpha = a;
    ctx.font = `800 ${n.crit ? 19 : 14}px Inter, system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.lineWidth = 4;
    ctx.strokeStyle = 'rgba(0,0,0,0.8)';
    ctx.strokeText(n.text, n.x, n.y);
    ctx.fillStyle = n.color;
    ctx.fillText(n.text, n.x, n.y);
    ctx.restore();
  }
}

function drawWeather() {
  const t = game.time;
  for (const w of game.weather) {
    if (!inView(w.x, w.y, 40)) continue;
    if (w.kind === 'embers') {
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = 0.35 + Math.sin(w.ph) * 0.2;
      ctx.fillStyle = '#ffb066';
      ctx.beginPath();
      ctx.arc(w.x, w.y, w.s * 0.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    } else if (w.kind === 'fireflies') {
      const pulse = 0.25 + Math.max(0, Math.sin(w.ph * 1.4)) * 0.75;
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = pulse * 0.8;
      ctx.fillStyle = '#ffe9a8';
      ctx.beginPath();
      ctx.arc(w.x, w.y, w.s * 0.9, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = pulse * 0.18;
      ctx.beginPath();
      ctx.arc(w.x, w.y, w.s * 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    } else {
      ctx.save();
      ctx.translate(w.x, w.y);
      ctx.rotate(w.ph);
      ctx.globalAlpha = 0.55;
      ctx.fillStyle = w.s > 3 ? '#c9a04a' : '#4f7a4a';
      ctx.beginPath();
      ctx.ellipse(0, 0, w.s * 1.6, w.s * 0.7, 0.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }
}

/* ----------------------------- Objetivo ----------------------------- */
function drawObjectiveMarker(target) {
  if (!target || target.mapId !== game.mapId) return;
  if (!inView(target.x, target.y, 40)) return;
  const t = game.time;
  const y = target.y - 62 + Math.sin(t * 3) * 4;
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const g = ctx.createRadialGradient(target.x, y, 1, target.x, y, 22);
  g.addColorStop(0, 'rgba(255,222,140,0.55)');
  g.addColorStop(1, 'rgba(255,200,90,0)');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(target.x, y, 22, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.translate(target.x, y);
  ctx.rotate(Math.PI / 4);
  ctx.fillStyle = '#ffe39a';
  ctx.strokeStyle = 'rgba(60,40,10,0.7)';
  ctx.lineWidth = 1.5;
  ctx.fillRect(-5, -5, 10, 10);
  ctx.strokeRect(-5, -5, 10, 10);
  ctx.restore();
}

function drawObjectiveArrow(target) {
  if (!target || target.mapId !== game.mapId || !game.p) return;
  const v = game.view;
  const cam = game.camera;
  const sx = (target.x - cam.x) * v.zoom;
  const sy = (target.y - cam.y) * v.zoom;
  const margin = 46;
  const top = 92;
  if (sx > margin && sx < v.cssW - margin && sy > top && sy < v.cssH - margin) return;

  const cx = v.cssW / 2, cy = v.cssH / 2;
  const ang = Math.atan2(sy - cy, sx - cx);
  const cos = Math.cos(ang), sin = Math.sin(ang);
  let t = Infinity;
  if (Math.abs(cos) > 0.0001) t = Math.min(t, ((cos > 0 ? v.cssW - margin : margin) - cx) / cos);
  if (Math.abs(sin) > 0.0001) t = Math.min(t, ((sin > 0 ? v.cssH - margin : top) - cy) / sin);
  if (!isFinite(t) || t < 0) t = Math.min(v.cssW, v.cssH) * 0.35;
  const ax = cx + cos * t;
  const ay = cy + sin * t;

  const d = Math.round(dist(game.p.x, game.p.y, target.x, target.y) / 22);
  ctx.save();
  ctx.translate(ax, ay);
  ctx.rotate(ang);
  ctx.fillStyle = 'rgba(10,14,22,0.82)';
  ctx.strokeStyle = 'rgba(233,201,119,0.65)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(0, 0, 17, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#ffe39a';
  ctx.beginPath();
  ctx.moveTo(12, 0);
  ctx.lineTo(1, -6);
  ctx.lineTo(3, 0);
  ctx.lineTo(1, 6);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.font = '700 10px Inter, system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.lineWidth = 3;
  ctx.strokeStyle = 'rgba(0,0,0,0.8)';
  ctx.strokeText(`${d} m`, ax, ay + 30);
  ctx.fillStyle = '#e9c977';
  ctx.fillText(`${d} m`, ax, ay + 30);
  ctx.restore();
}

/* ----------------------------- Props estáticos en caché ----------------------------- */
/* Los props que no se animan se rasterizan una sola vez. Esto convierte decenas
   de trazados y sombras por fotograma en un único drawImage por objeto. */
const CACHED_PROP_KINDS = new Set(['tree', 'rock', 'bush', 'house', 'flower', 'bones', 'pillar']);

function propSpriteBounds(pr) {
  const s = pr.s || 1;
  switch (pr.kind) {
    case 'tree': return { x: pr.x - 30 * s, y: pr.y - 76 * s, w: 60 * s, h: 84 * s };
    case 'rock': return { x: pr.x - 21 * s, y: pr.y - 32 * s, w: 42 * s, h: 38 * s };
    case 'bush': return { x: pr.x - 21 * s, y: pr.y - 26 * s, w: 42 * s, h: 32 * s };
    case 'house': {
      const w = pr.w + 32, h = pr.h + 54;
      return { x: pr.x - w / 2, y: pr.y - h + 4, w, h };
    }
    case 'flower': return { x: pr.x - 11, y: pr.y - 15, w: 22, h: 20 };
    case 'bones': return { x: pr.x - 15, y: pr.y - 11, w: 30, h: 17 };
    case 'pillar': {
      const h = (pr.broken ? 62 : 96) * s;
      return { x: pr.x - 22 * s, y: pr.y - h, w: 44 * s, h };
    }
    default: return { x: pr.x - 32, y: pr.y - 64, w: 64, h: 70 };
  }
}

function drawCachedProp(pr) {
  if (!pr._sprite) {
    const b = propSpriteBounds(pr);
    const scale = 1.5;
    const sprite = document.createElement('canvas');
    sprite.width = Math.max(1, Math.ceil(b.w * scale));
    sprite.height = Math.max(1, Math.ceil(b.h * scale));
    const spriteCtx = sprite.getContext('2d');
    const previous = ctx;
    ctx = spriteCtx;
    ctx.setTransform(scale, 0, 0, scale, -b.x * scale, -b.y * scale);
    switch (pr.kind) {
      case 'tree': drawTree(pr); break;
      case 'rock': drawRock(pr); break;
      case 'bush': drawBush(pr); break;
      case 'house': drawHouse(pr); break;
      case 'flower': drawFlower(pr); break;
      case 'bones': drawBones(pr); break;
      case 'pillar': drawPillar(pr); break;
    }
    ctx = previous;
    pr._sprite = sprite;
    pr._bounds = b;
  }
  const b = pr._bounds;
  ctx.drawImage(pr._sprite, b.x, b.y, b.w, b.h);
}

/* ----------------------------- Frame ----------------------------- */
function render() {
  const v = game.view;
  const dpr = v.dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, v.cssW, v.cssH);
  ctx.fillStyle = '#05070c';
  ctx.fillRect(0, 0, v.cssW, v.cssH);
  if (!game.map || !game.p) return;

  const shake = game.shake;
  const sx = shake > 0.2 ? rand(-1, 1) * shake : 0;
  const sy = shake > 0.2 ? rand(-1, 1) * shake : 0;
  const z = v.zoom * dpr;
  ctx.setTransform(z, 0, 0, z, (-game.camera.x + sx) * z, (-game.camera.y + sy) * z);

  const map = game.map;
  drawGround(map);

  /* Efectos de suelo (telegrafiado del jefe) */
  for (const fx of game.effects) if (fx.kind === 'telegraph') drawTelegraph(fx);

  /* Lista ordenada por profundidad */
  const items = [];
  for (const pr of map.props) {
    if (pr.kind === 'portal') {
      items.push({ y: pr.y, kind: 'prop', ref: pr });
    } else if (CACHED_PROP_KINDS.has(pr.kind)) {
      if (propNeedsForeground(pr)) items.push({ y: pr.y, kind: 'prop', ref: pr });
    } else if (inView(pr.x, pr.y, 140)) {
      items.push({ y: pr.y, kind: 'prop', ref: pr });
    }
  }
  for (const npc of map.npcs) if (inView(npc.x, npc.y)) items.push({ y: npc.y + 2, kind: 'npc', ref: npc });
  for (const e of game.enemies) if (inView(e.x, e.y)) items.push({ y: e.y + e.r, kind: 'enemy', ref: e });
  if (game.boss && !game.boss.dead && inView(game.boss.x, game.boss.y)) {
    items.push({ y: game.boss.y + game.boss.r, kind: 'boss', ref: game.boss });
  }
  if (map.chest) items.push({ y: map.chest.y + 8, kind: 'chest', ref: map.chest });
  if (inView(game.p.x, game.p.y)) items.push({ y: game.p.y + game.p.r, kind: 'player', ref: game.p });

  items.sort((a, b) => a.y - b.y);

  for (const it of items) {
    switch (it.kind) {
      case 'prop': {
        const pr = it.ref;
        if (CACHED_PROP_KINDS.has(pr.kind)) {
          drawCachedProp(pr);
          break;
        }
        switch (pr.kind) {
          case 'fountain': drawFountain(pr); break;
          case 'crystal': drawCrystal(pr); break;
          case 'torch': drawTorch(pr); break;
          case 'shrine': drawShrine(pr); break;
          case 'portal': drawPortal(pr); break;
        }
        break;
      }
      case 'npc': drawNpc(it.ref); break;
      case 'enemy': it.ref.type === 'ghost' ? drawGhost(it.ref) : drawSlime(it.ref); break;
      case 'boss': drawBoss(it.ref); break;
      case 'chest': drawChest(it.ref); break;
      case 'player': drawPlayer(); break;
    }
  }

  drawEffects();
  drawParticles();
  drawNumbers();
  drawWeather();

  const target = questTarget();
  drawObjectiveMarker(target);

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  if (vignette) {
    ctx.drawImage(vignette, 0, 0, v.cssW, v.cssH);
  }

  /* Tinte rojo al recibir daño */
  if (game.p.hitFlash > 0) {
    ctx.fillStyle = `rgba(190,30,30,${game.p.hitFlash * 0.5})`;
    ctx.fillRect(0, 0, v.cssW, v.cssH);
  }

  if (game.scene === 'play' || game.scene === 'travel') drawObjectiveArrow(target);
}
