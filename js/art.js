// ============================================================
// LA ESPADA CELESTIAL — arte procedural
// ============================================================
import { CREATURE_BY_ID, ELEMENTS } from './data.js';

export const TAU = Math.PI * 2;
export const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
export const lerp = (a, b, t) => a + (b - a) * t;
export const rand = (a = 1, b = 0) => b + Math.random() * (a - b);
export const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
export const angleTo = (a, b) => Math.atan2(b.y - a.y, b.x - a.x);

export function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function hash(x, y, seed = 1) {
  let h = x * 374761393 + y * 668265263 + seed * 1442695040888963407;
  h = (h ^ (h >>> 13)) * 1274126177;
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

export function rgba(hex, alpha = 1) {
  if (!hex) return `rgba(255,255,255,${alpha})`;
  if (hex.startsWith('rgba') || hex.startsWith('rgb')) return hex;
  const h = hex.replace('#', '');
  const n = h.length === 3 ? h.split('').map(c => c + c).join('') : h;
  const r = parseInt(n.slice(0, 2), 16), g = parseInt(n.slice(2, 4), 16), b = parseInt(n.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

export function shade(hex, amount) {
  const h = hex.replace('#', '');
  const n = h.length === 3 ? h.split('').map(c => c + c).join('') : h;
  let r = parseInt(n.slice(0, 2), 16), g = parseInt(n.slice(2, 4), 16), b = parseInt(n.slice(4, 6), 16);
  if (amount < 0) { r *= 1 + amount; g *= 1 + amount; b *= 1 + amount; }
  else { r += (255 - r) * amount; g += (255 - g) * amount; b += (255 - b) * amount; }
  return `rgb(${clamp(r, 0, 255) | 0},${clamp(g, 0, 255) | 0},${clamp(b, 0, 255) | 0})`;
}

export function rr(ctx, x, y, w, h, r = 4) {
  const rad = Math.min(r, Math.abs(w) / 2, Math.abs(h) / 2);
  ctx.beginPath();
  ctx.moveTo(x + rad, y);
  ctx.arcTo(x + w, y, x + w, y + h, rad);
  ctx.arcTo(x + w, y + h, x, y + h, rad);
  ctx.arcTo(x, y + h, x, y, rad);
  ctx.arcTo(x, y, x + w, y, rad);
  ctx.closePath();
}

export function glow(ctx, x, y, r, color, alpha = 1) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, Math.max(1, r));
  g.addColorStop(0, rgba(color, alpha));
  g.addColorStop(0.3, rgba(color, alpha * 0.55));
  g.addColorStop(1, rgba(color, 0));
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, TAU);
  ctx.fill();
}

export function polygon(ctx, pts, fill, stroke = null, line = 1) {
  ctx.beginPath();
  pts.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]));
  ctx.closePath();
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = line; ctx.stroke(); }
}

export function ellipse(ctx, x, y, rx, ry, fill) {
  ctx.beginPath();
  ctx.ellipse(x, y, Math.max(0.1, rx), Math.max(0.1, ry), 0, 0, TAU);
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
}

// ============================================================
// TERRENO
// ============================================================
function organicBlob(ctx, x, y, rx, ry, color, seed = 1, points = 14, wobble = .3) {
  const r = mulberry32(seed);
  const pts = [];
  for (let i = 0; i < points; i++) {
    const a = i / points * TAU;
    const w = 1 + (r() - .5) * wobble;
    pts.push([x + Math.cos(a) * rx * w, y + Math.sin(a) * ry * w]);
  }
  ctx.beginPath();
  pts.forEach((p, i) => {
    const n = pts[(i + 1) % pts.length];
    const mx = (p[0] + n[0]) / 2, my = (p[1] + n[1]) / 2;
    if (i === 0) ctx.moveTo(mx, my); else ctx.quadraticCurveTo(p[0], p[1], mx, my);
  });
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
}

function grassTuft(ctx, x, y, c, s = 1) {
  ctx.strokeStyle = c; ctx.lineWidth = 1.1;
  ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x - 3 * s, y - 6 * s, x - 4 * s, y - 9 * s); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x + 1, y); ctx.quadraticCurveTo(x + 4 * s, y - 4 * s, x + 5 * s, y - 8 * s); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x + 2, y); ctx.quadraticCurveTo(x + 1, y - 5 * s, x + 2 * s, y - 7 * s); ctx.stroke();
}

function flower(ctx, x, y, color, s = 1) {
  ctx.fillStyle = color;
  for (let i = 0; i < 5; i++) {
    const a = i / 5 * TAU;
    ellipse(ctx, x + Math.cos(a) * 2.2 * s, y + Math.sin(a) * 2.2 * s, 1.6 * s, 1.3 * s, color);
  }
  ellipse(ctx, x, y, 1.2 * s, 1.2 * s, '#ffe8a8');
}

function waterShape(ctx, x, y, rx, ry, pal, seed) {
  organicBlob(ctx, x, y, rx, ry, pal.water, seed, 18, .12);
  const g = ctx.createRadialGradient(x - rx * .3, y - ry * .3, 2, x, y, rx);
  g.addColorStop(0, rgba(pal.water2, .5));
  g.addColorStop(.7, rgba(pal.water2, .12));
  g.addColorStop(1, rgba(pal.water, 0));
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.ellipse(x, y, rx * .94, ry * .94, 0, 0, TAU); ctx.fill();
  ctx.strokeStyle = rgba(pal.water2, .22); ctx.lineWidth = 1;
  for (let i = 0; i < 8; i++) {
    const a = i * 1.7 + seed;
    const px = x + Math.cos(a) * rx * (.2 + i * .06);
    const py = y + Math.sin(a) * ry * (.2 + i * .05);
    ctx.beginPath(); ctx.ellipse(px, py, 10 + i * 3, 1.2, a * .2, 0, TAU); ctx.stroke();
  }
}

function pathStroke(ctx, points, width, color, alpha = 1) {
  ctx.save();
  ctx.strokeStyle = rgba(color, alpha);
  ctx.lineWidth = width;
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.beginPath();
  points.forEach((p, i) => {
    if (i === 0) ctx.moveTo(p[0], p[1]);
    else {
      const prev = points[i - 1];
      const cx = (prev[0] + p[0]) / 2 + (i % 2 ? 12 : -12);
      const cy = (prev[1] + p[1]) / 2 + (i % 2 ? -8 : 8);
      ctx.quadraticCurveTo(cx, cy, p[0], p[1]);
    }
  });
  ctx.stroke();
  ctx.restore();
}

function stoneFloor(ctx, x, y, w, h, color, seed = 1, tile = 54) {
  const r = mulberry32(seed);
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = 'rgba(0,0,0,.17)'; ctx.lineWidth = 1;
  for (let yy = y; yy < y + h; yy += tile) {
    for (let xx = x; xx < x + w; xx += tile) {
      const off = ((yy / tile) | 0) % 2 ? tile / 2 : 0;
      ctx.strokeRect(xx + off, yy, tile, tile);
      if (r() > .84) {
        ctx.fillStyle = rgba('#ffffff', .025 + r() * .04);
        ctx.fillRect(xx + off + 3, yy + 3, tile - 6, tile - 6);
      }
    }
  }
}

export function buildTerrain(region) {
  const scale = .5;
  const c = document.createElement('canvas');
  c.width = Math.floor(region.width * scale);
  c.height = Math.floor(region.height * scale);
  const ctx = c.getContext('2d');
  ctx.scale(scale, scale);
  const pal = region.palette;
  const r = mulberry32(region.id.length * 7763 + region.width);
  const W = region.width, H = region.height;

  // Base
  const base = ctx.createLinearGradient(0, 0, W, H);
  base.addColorStop(0, shade(pal.base, .08));
  base.addColorStop(.45, pal.base);
  base.addColorStop(1, pal.base2);
  ctx.fillStyle = base; ctx.fillRect(0, 0, W, H);

  if (region.id === 'valdoria') {
    // praderas y claros
    for (let i = 0; i < 60; i++) {
      const x = r() * W, y = r() * H;
      organicBlob(ctx, x, y, 90 + r() * 250, 50 + r() * 150, rgba(i % 3 === 0 ? '#3a5638' : i % 3 === 1 ? '#2c4a31' : '#435b3a', .32), i + 9, 12, .35);
    }
    // lago del sur
    waterShape(ctx, 750, 1570, 430, 240, pal, 77);
    // río
    ctx.save();
    ctx.strokeStyle = rgba(pal.water, .92); ctx.lineWidth = 92; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(300, 1480); ctx.bezierCurveTo(520, 1340, 680, 1250, 780, 1090); ctx.stroke();
    ctx.strokeStyle = rgba(pal.water2, .3); ctx.lineWidth = 42;
    ctx.beginPath(); ctx.moveTo(300, 1480); ctx.bezierCurveTo(520, 1340, 680, 1250, 780, 1090); ctx.stroke();
    ctx.restore();
    // caminos
    pathStroke(ctx, [[660, 1200], [760, 1030], [690, 900], [880, 730], [1120, 620], [1450, 680], [1760, 780], [2120, 760], [2520, 880]], 70, pal.path, .7);
    pathStroke(ctx, [[760, 1030], [1080, 1080], [1380, 1190], [1660, 1240], [1960, 1320], [2300, 1300]], 50, pal.path2, .38);
    pathStroke(ctx, [[690, 900], [560, 700], [430, 540], [380, 370]], 38, pal.path2, .34);
    // plaza de la aldea
    stoneFloor(ctx, 520, 950, 470, 310, '#575845', 13, 58);
    // ruinas este
    stoneFloor(ctx, 1880, 560, 470, 390, '#57544a', 42, 64);
    ctx.fillStyle = 'rgba(18,20,16,.35)';
    ctx.fillRect(1880, 560, 470, 390);
    for (let i = 0; i < 30; i++) {
      const x = 1880 + r() * 470, y = 560 + r() * 390;
      ellipse(ctx, x, y, 3 + r() * 16, 2 + r() * 7, 'rgba(25,30,22,.2)');
    }
    // claro de captura
    glow(ctx, 1110, 430, 190, '#e8d39b', .14);
    for (let i = 0; i < 80; i++) flower(ctx, 960 + r() * 300, 320 + r() * 220, r() > .5 ? '#e8d39b' : '#b9cce0', .8 + r());
    // detalles
    for (let i = 0; i < 380; i++) {
      const x = r() * W, y = r() * H;
      if (x > 520 && x < 990 && y > 950 && y < 1260) continue;
      grassTuft(ctx, x, y, rgba(i % 4 ? '#68855b' : '#8fa277', .4), .6 + r());
    }
    for (let i = 0; i < 70; i++) flower(ctx, r() * W, r() * H, r() > .5 ? '#d9c583' : '#c2c9a0', .7);
    // niebla del bosque
    for (let i = 0; i < 8; i++) {
      const x = 350 + r() * 1200, y = 150 + r() * 500;
      organicBlob(ctx, x, y, 180 + r() * 200, 50 + r() * 50, 'rgba(190,210,200,.018)', i + 30, 10, .4);
    }
  }

  if (region.id === 'drakmor') {
    for (let i = 0; i < 70; i++) organicBlob(ctx, r() * W, r() * H, 80 + r() * 230, 45 + r() * 140, rgba(i % 2 ? '#34211d' : '#211414', .4), i + 4, 11, .38);
    // ríos de lava verticales
    for (const [x, w] of [[820, 100], [1610, 80]]) {
      ctx.save();
      ctx.strokeStyle = '#2b0d09'; ctx.lineWidth = w + 34; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(x, -20); ctx.bezierCurveTo(x + 100, H * .28, x - 90, H * .62, x + 30, H + 20); ctx.stroke();
      ctx.strokeStyle = '#8c2412'; ctx.lineWidth = w;
      ctx.beginPath(); ctx.moveTo(x, -20); ctx.bezierCurveTo(x + 100, H * .28, x - 90, H * .62, x + 30, H + 20); ctx.stroke();
      ctx.strokeStyle = '#ff6b32'; ctx.lineWidth = w * .45;
      ctx.beginPath(); ctx.moveTo(x, -20); ctx.bezierCurveTo(x + 100, H * .28, x - 90, H * .62, x + 30, H + 20); ctx.stroke();
      ctx.strokeStyle = '#ffd09a'; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.moveTo(x, -20); ctx.bezierCurveTo(x + 100, H * .28, x - 90, H * .62, x + 30, H + 20); ctx.stroke();
      ctx.restore();
    }
    // puentes
    for (const [x, y, w, h] of [[700, 850, 270, 90], [1520, 640, 220, 80]]) {
      ctx.fillStyle = '#3b2b24'; ctx.fillRect(x, y, w, h);
      ctx.fillStyle = '#5e4030';
      for (let i = 0; i < 10; i++) ctx.fillRect(x + i * (w / 10) + 3, y + 8, w / 10 - 6, h - 16);
      ctx.strokeStyle = 'rgba(255,170,100,.25)'; ctx.lineWidth = 2; ctx.strokeRect(x, y, w, h);
    }
    pathStroke(ctx, [[150, 920], [470, 890], [700, 895], [970, 895], [1250, 760], [1520, 680], [1800, 760], [2050, 850]], 62, pal.path, .75);
    // fortaleza
    stoneFloor(ctx, 1770, 470, 650, 720, '#332b2b', 9, 66);
    ctx.fillStyle = 'rgba(10,6,6,.38)'; ctx.fillRect(1770, 470, 650, 720);
    // campamento
    stoneFloor(ctx, 300, 560, 300, 240, '#3d2e27', 22, 50);
    // grietas
    ctx.strokeStyle = 'rgba(255,95,48,.28)'; ctx.lineWidth = 2;
    for (let i = 0; i < 45; i++) {
      let x = r() * W, y = r() * H;
      ctx.beginPath(); ctx.moveTo(x, y);
      for (let j = 0; j < 4; j++) { x += (r() - .5) * 38; y += (r() - .5) * 38; ctx.lineTo(x, y); }
      ctx.stroke();
    }
    for (let i = 0; i < 200; i++) {
      const x = r() * W, y = r() * H;
      ctx.fillStyle = rgba('#0b0707', .35); ellipse(ctx, x, y, 2 + r() * 8, 1 + r() * 4, rgba('#0b0707', .35));
    }
    // ascuas en el suelo
    for (let i = 0; i < 90; i++) {
      const x = r() * W, y = r() * H;
      glow(ctx, x, y, 3 + r() * 8, '#ff7c3e', .12);
    }
  }

  if (region.id === 'kansordore') {
    // cielo bajo los pies: mármol y constelaciones
    for (let i = 0; i < 55; i++) organicBlob(ctx, r() * W, r() * H, 80 + r() * 230, 40 + r() * 140, rgba(i % 2 ? '#2d3950' : '#182135', .35), i + 2, 12, .34);
    // plataforma principal
    stoneFloor(ctx, 170, 500, 2060, 860, '#3d4358', 5, 80);
    // bordes flotantes
    ctx.fillStyle = '#141a2a'; ctx.fillRect(0, 0, W, 500); ctx.fillRect(0, 1360, W, H - 1360);
    // constelaciones
    ctx.strokeStyle = 'rgba(180,210,255,.18)'; ctx.lineWidth = 1;
    for (let i = 0; i < 22; i++) {
      let x = 80 + r() * (W - 160), y = 60 + r() * (H - 120);
      if (y > 500 && y < 1360) y = r() > .5 ? 100 + r() * 300 : 1450 + r() * 250;
      ctx.beginPath(); ctx.moveTo(x, y);
      for (let j = 0; j < 3; j++) { x += (r() - .5) * 110; y += (r() - .5) * 80; ctx.lineTo(x, y); }
      ctx.stroke();
      for (let j = 0; j < 4; j++) glow(ctx, x + (r() - .5) * 60, y + (r() - .5) * 60, 2, '#dceaff', .35);
    }
    // canales de agua celestial
    waterShape(ctx, 600, 1180, 330, 120, pal, 11);
    waterShape(ctx, 1630, 480, 270, 90, pal, 19);
    // caminos de luz
    pathStroke(ctx, [[220, 930], [600, 930], [960, 880], [1250, 780], [1550, 700], [1900, 700]], 56, '#c6c2a6', .12);
    pathStroke(ctx, [[220, 930], [600, 930], [960, 880], [1250, 780], [1550, 700], [1900, 700]], 2, '#e7ddba', .35);
    // templo
    stoneFloor(ctx, 1680, 420, 620, 620, '#555a70', 31, 62);
    ctx.strokeStyle = 'rgba(236,213,159,.16)'; ctx.lineWidth = 2; ctx.strokeRect(1700, 440, 580, 580);
    ctx.strokeStyle = 'rgba(160,200,255,.1)'; ctx.lineWidth = 1;
    for (let i = 0; i < 5; i++) ctx.strokeRect(1715 + i * 16, 455 + i * 16, 550 - i * 32, 550 - i * 32);
    // estrellas
    for (let i = 0; i < 120; i++) {
      const x = r() * W, y = r() * H;
      if (y > 500 && y < 1360 && x > 200 && x < 2200) continue;
      glow(ctx, x, y, 1.5 + r() * 3, '#e8f2ff', .2 + r() * .4);
    }
    // motas de luz
    for (let i = 0; i < 70; i++) glow(ctx, r() * W, 520 + r() * 820, 2 + r() * 5, '#b9d8ff', .12);
  }

  // viñeta de terreno
  const vg = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * .3, W / 2, H / 2, Math.max(W, H) * .7);
  vg.addColorStop(0, 'rgba(0,0,0,0)');
  vg.addColorStop(1, 'rgba(0,0,0,.34)');
  ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
  return c;
}

// ============================================================
// PROPS
// ============================================================
export function drawProp(ctx, p, t = 0, detail = 1) {
  const x = p.x, y = p.y;
  const s = p.scale || 1;
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  switch (p.type) {
    case 'tree': {
      ellipse(ctx, 0, 2, 24, 8, 'rgba(0,0,0,.3)');
      ctx.fillStyle = '#3b2b1d'; rr(ctx, -4, -28, 8, 32, 2); ctx.fill();
      const sway = Math.sin(t * .8 + x * .01) * 1.5;
      ctx.translate(sway, 0);
      ellipse(ctx, 0, -48, 30, 26, '#2d4a2c');
      ellipse(ctx, -14, -38, 22, 18, '#365a31');
      ellipse(ctx, 14, -40, 21, 17, '#2c4a2b');
      ellipse(ctx, 2, -62, 22, 18, '#3f6737');
      ellipse(ctx, -9, -58, 14, 10, 'rgba(115,160,88,.35)');
      ctx.strokeStyle = 'rgba(160,198,120,.18)'; ctx.lineWidth = 1;
      for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.arc(0, -48, 12 + i * 6, 3.4, 5.2); ctx.stroke(); }
      break;
    }
    case 'pine': {
      ellipse(ctx, 0, 2, 19, 7, 'rgba(0,0,0,.3)');
      ctx.fillStyle = '#332419'; rr(ctx, -3, -25, 6, 29, 2); ctx.fill();
      for (let i = 0; i < 3; i++) {
        const yy = -30 - i * 18, w = 28 - i * 5;
        polygon(ctx, [[0, yy - 32], [w, yy], [-w, yy]], i % 2 ? '#24402c' : '#2d4b32');
      }
      break;
    }
    case 'rock': {
      ellipse(ctx, 0, 3, p.rx || 23, p.ry || 9, 'rgba(0,0,0,.28)');
      const c1 = p.color || '#5d5c50', c2 = shade(c1, .2);
      polygon(ctx, [[-20, 0], [-17, -17], [-4, -27], [12, -23], [23, -6], [16, 3]], c1);
      polygon(ctx, [[-17, -17], [-4, -27], [12, -23], [3, -14], [-8, -13]], c2);
      ctx.strokeStyle = 'rgba(0,0,0,.2)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(-8, -13); ctx.lineTo(-4, -2); ctx.stroke();
      break;
    }
    case 'house': {
      const w = p.w || 150, h = p.h || 110;
      ellipse(ctx, 0, 8, w * .55, 18, 'rgba(0,0,0,.35)');
      ctx.fillStyle = p.wall || '#b8a58a';
      ctx.fillRect(-w / 2, -h, w, h);
      ctx.fillStyle = 'rgba(0,0,0,.12)'; ctx.fillRect(-w / 2, -h, w * .18, h);
      // vigas
      ctx.strokeStyle = 'rgba(72,47,31,.65)'; ctx.lineWidth = 3;
      ctx.strokeRect(-w / 2 + 4, -h + 4, w - 8, h - 4);
      ctx.beginPath(); ctx.moveTo(-w / 2 + 4, -h * .55); ctx.lineTo(w / 2 - 4, -h * .55); ctx.stroke();
      // puerta
      ctx.fillStyle = '#4a2f1f'; rr(ctx, -16, -48, 32, 48, 10); ctx.fill();
      ctx.fillStyle = '#e0c078'; ctx.beginPath(); ctx.arc(8, -24, 2.2, 0, TAU); ctx.fill();
      // ventanas
      for (const wx of [-w * .32, w * .3]) {
        ctx.fillStyle = '#f4cd7a'; rr(ctx, wx - 9, -h + 20, 18, 20, 2); ctx.fill();
        ctx.strokeStyle = '#4a2f1f'; ctx.lineWidth = 2; ctx.strokeRect(wx - 9, -h + 20, 18, 20);
        ctx.beginPath(); ctx.moveTo(wx, -h + 20); ctx.lineTo(wx, -h + 40); ctx.moveTo(wx - 9, -h + 30); ctx.lineTo(wx + 9, -h + 30); ctx.stroke();
      }
      // tejado
      polygon(ctx, [[-w / 2 - 18, -h + 2], [0, -h - 55], [w / 2 + 18, -h + 2]], p.roof || '#5a4130');
      polygon(ctx, [[-w / 2 - 18, -h + 2], [0, -h - 55], [w / 2 + 18, -h + 2]], null, 'rgba(0,0,0,.25)', 2);
      ctx.fillStyle = 'rgba(255,220,160,.09)'; ctx.fillRect(-w / 2 - 16, -h - 2, w + 32, 4);
      // chimenea
      ctx.fillStyle = '#6c5b4c'; ctx.fillRect(w * .25, -h - 44, 14, 22);
      break;
    }
    case 'ruinPillar': {
      ellipse(ctx, 0, 3, 17, 7, 'rgba(0,0,0,.28)');
      ctx.fillStyle = p.color || '#8b8574';
      ctx.fillRect(-10, -72, 20, 72);
      ctx.fillStyle = 'rgba(0,0,0,.18)'; ctx.fillRect(3, -72, 7, 72);
      ctx.fillStyle = '#a9a28d'; ctx.fillRect(-15, -78, 30, 9);
      ctx.fillRect(-14, -5, 28, 7);
      if (p.broken) {
        ctx.fillStyle = '#6e685a';
        polygon(ctx, [[-10, -58], [10, -62], [10, -50], [-3, -46], [-10, -50]], '#7b7565');
      }
      break;
    }
    case 'arch': {
      ellipse(ctx, 0, 5, 90, 16, 'rgba(0,0,0,.3)');
      ctx.fillStyle = '#746e60';
      ctx.fillRect(-84, -120, 28, 125); ctx.fillRect(56, -120, 28, 125);
      ctx.beginPath(); ctx.arc(0, -112, 70, Math.PI, 0); ctx.lineWidth = 26; ctx.strokeStyle = '#746e60'; ctx.stroke();
      ctx.beginPath(); ctx.arc(0, -112, 70, Math.PI, 0); ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(255,230,170,.16)'; ctx.stroke();
      for (let i = 0; i < 5; i++) {
        ctx.fillStyle = 'rgba(30,35,28,.35)';
        ctx.fillRect(-70 + i * 30, -120 + i % 2 * 18, 10, 8);
      }
      break;
    }
    case 'shrine': {
      ellipse(ctx, 0, 8, 52, 18, 'rgba(0,0,0,.3)');
      ctx.fillStyle = '#777362'; ctx.beginPath(); ctx.ellipse(0, 0, 48, 17, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = '#96917a'; ctx.beginPath(); ctx.ellipse(0, -7, 42, 15, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = '#5f5b4d'; ctx.fillRect(-7, -46, 14, 38);
      glow(ctx, 0, -58, 52, '#ffe2a1', .18 + Math.sin(t * 2) * .04);
      const orbY = -58 + Math.sin(t * 1.8) * 4;
      ctx.fillStyle = '#fff6cf'; ctx.beginPath(); ctx.arc(0, orbY, 8, 0, TAU); ctx.fill();
      ctx.strokeStyle = 'rgba(255,240,190,.5)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.ellipse(0, orbY, 17, 6, t * .4, 0, TAU); ctx.stroke();
      break;
    }
    case 'fountain': {
      ellipse(ctx, 0, 6, 62, 21, 'rgba(0,0,0,.3)');
      ctx.fillStyle = '#6a6b60'; ctx.beginPath(); ctx.ellipse(0, 0, 58, 19, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = '#244e56'; ctx.beginPath(); ctx.ellipse(0, -4, 47, 14, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = '#878575'; ctx.fillRect(-6, -50, 12, 46);
      ctx.beginPath(); ctx.arc(0, -52, 12, 0, TAU); ctx.fillStyle = '#a29b84'; ctx.fill();
      glow(ctx, 0, -55, 25, '#9fd8df', .25);
      for (let i = 0; i < 3; i++) {
        const a = t * .8 + i * 2.1;
        ellipse(ctx, Math.cos(a) * 38, -3 + Math.sin(a) * 8, 2, 1, 'rgba(180,230,240,.6)');
      }
      break;
    }
    case 'chest': {
      ellipse(ctx, 0, 2, 20, 7, 'rgba(0,0,0,.3)');
      ctx.fillStyle = '#5e3d24'; rr(ctx, -18, -26, 36, 27, 3); ctx.fill();
      ctx.fillStyle = '#7e542e'; rr(ctx, -18, -34, 36, 13, 5); ctx.fill();
      ctx.strokeStyle = '#d5b46a'; ctx.lineWidth = 2; ctx.strokeRect(-18, -26, 36, 27);
      ctx.fillStyle = '#e7c56e'; ctx.fillRect(-3, -22, 6, 9);
      glow(ctx, 0, -22, 25, '#e7c56e', p.opened ? .02 : .1);
      break;
    }
    case 'lore': {
      ellipse(ctx, 0, 3, 18, 7, 'rgba(0,0,0,.3)');
      ctx.fillStyle = '#4a4a45'; polygon(ctx, [[-14, 0], [-11, -44], [0, -55], [11, -44], [14, 0]], '#5d5d55');
      ctx.strokeStyle = 'rgba(180,210,255,.3)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(-5, -10); ctx.lineTo(2, -22); ctx.lineTo(-1, -30); ctx.lineTo(5, -40); ctx.stroke();
      glow(ctx, 0, -32, 22, '#a7c8e8', .1 + Math.sin(t * 2) * .03);
      break;
    }
    case 'crystal': {
      ellipse(ctx, 0, 3, 16, 6, 'rgba(0,0,0,.25)');
      const cc = p.color || '#8fd2da';
      glow(ctx, 0, -25, 40, cc, .14);
      polygon(ctx, [[0, -58], [13, -32], [7, 0], [-7, 0], [-13, -32]], cc);
      polygon(ctx, [[0, -58], [13, -32], [2, -26], [0, -40]], shade(cc, .35));
      break;
    }
    case 'ore': {
      ellipse(ctx, 0, 3, 18, 7, 'rgba(0,0,0,.3)');
      polygon(ctx, [[-17, 0], [-12, -18], [0, -24], [13, -16], [18, 0]], '#4d4a42');
      polygon(ctx, [[-8, -8], [-3, -20], [4, -16], [6, -4]], p.color || '#ff8a55');
      glow(ctx, 0, -13, 18, p.color || '#ff8a55', .12);
      break;
    }
    case 'flower': {
      for (let i = 0; i < 4; i++) flower(ctx, (i % 2) * 10 - 5, -i * 4, p.color || '#e8d39b', 1.1);
      break;
    }
    case 'gate': {
      ellipse(ctx, 0, 8, 80, 20, 'rgba(0,0,0,.4)');
      ctx.fillStyle = p.color || '#6f6655';
      ctx.fillRect(-78, -170, 28, 178); ctx.fillRect(50, -170, 28, 178);
      ctx.beginPath(); ctx.arc(0, -162, 64, Math.PI, 0); ctx.lineWidth = 26; ctx.strokeStyle = p.color || '#6f6655'; ctx.stroke();
      ctx.beginPath(); ctx.arc(0, -162, 64, Math.PI, 0); ctx.lineWidth = 2; ctx.strokeStyle = rgba(p.glow || '#e8d39b', .5); ctx.stroke();
      glow(ctx, 0, -88, 70, p.glow || '#e8d39b', .14);
      for (let i = 0; i < 4; i++) {
        const yy = -140 + i * 38;
        ctx.strokeStyle = rgba(p.glow || '#e8d39b', .18); ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(0, yy, 50 - i * 8, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke();
      }
      if (p.locked) {
        ctx.fillStyle = 'rgba(30,32,36,.55)'; ctx.fillRect(-48, -150, 96, 150);
        ctx.strokeStyle = 'rgba(230,200,140,.3)'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(0, -82, 20, 0, TAU); ctx.stroke();
        ctx.fillStyle = 'rgba(230,200,140,.3)'; ctx.fillRect(-2, -82, 4, 18);
      }
      break;
    }
    case 'seal': {
      ellipse(ctx, 0, 4, 36, 12, 'rgba(0,0,0,.3)');
      ctx.strokeStyle = '#8b8774'; ctx.lineWidth = 5;
      ctx.beginPath(); ctx.arc(0, -24, 26, 0, TAU); ctx.stroke();
      ctx.strokeStyle = rgba(p.color || '#b9d8ff', .4); ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(0, -24, 33, 0, TAU); ctx.stroke();
      if (p.on) glow(ctx, 0, -24, 55, p.color || '#b9d8ff', .3);
      ctx.fillStyle = p.on ? (p.color || '#e8f2ff') : 'rgba(180,200,220,.22)';
      polygon(ctx, [[0, -44], [13, -24], [0, -4], [-13, -24]], p.on ? (p.color || '#e8f2ff') : 'rgba(180,200,220,.22)');
      break;
    }
    case 'tent': {
      ellipse(ctx, 0, 5, 52, 16, 'rgba(0,0,0,.3)');
      polygon(ctx, [[-52, 0], [0, -78], [52, 0]], p.color || '#5e4b3b');
      polygon(ctx, [[0, -78], [52, 0], [20, 0]], 'rgba(255,255,255,.06)');
      ctx.fillStyle = '#201711'; polygon(ctx, [[-16, 0], [0, -42], [16, 0]], '#201711');
      break;
    }
    case 'brazier': {
      ellipse(ctx, 0, 3, 17, 6, 'rgba(0,0,0,.3)');
      ctx.fillStyle = '#4b4038'; ctx.fillRect(-3, -28, 6, 30);
      ctx.fillStyle = '#69594a'; ctx.beginPath(); ctx.ellipse(0, -30, 13, 5, 0, 0, TAU); ctx.fill();
      glow(ctx, 0, -40, 34, p.color || '#ff9a55', .25);
      const f = Math.sin(t * 7) * 2;
      polygon(ctx, [[-7, -30], [0, -58 - f], [7, -30]], '#ff8a3e');
      polygon(ctx, [[-3, -30], [1, -48 + f], [4, -30]], '#ffe1a0');
      break;
    }
    case 'statue': {
      ellipse(ctx, 0, 6, 36, 13, 'rgba(0,0,0,.3)');
      ctx.fillStyle = '#66655b'; ctx.fillRect(-26, -16, 52, 18);
      ctx.fillStyle = p.color || '#8c8876';
      ctx.fillRect(-17, -92, 34, 78);
      ctx.beginPath(); ctx.arc(0, -104, 17, 0, TAU); ctx.fill();
      polygon(ctx, [[-17, -70], [-45, -92], [-35, -100], [-10, -82]], p.color || '#8c8876');
      polygon(ctx, [[17, -70], [45, -92], [35, -100], [10, -82]], p.color || '#8c8876');
      ctx.strokeStyle = 'rgba(255,235,190,.15)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(-8, -88); ctx.lineTo(-2, -70); ctx.lineTo(-8, -52); ctx.stroke();
      break;
    }
    case 'banner': {
      ctx.fillStyle = '#3b2d22'; ctx.fillRect(-2, -95, 4, 98);
      const sway = Math.sin(t * 2 + x) * 2;
      polygon(ctx, [[2, -92], [38 + sway, -84], [30 + sway, -44], [2, -50]], p.color || '#7c2f2f');
      ctx.fillStyle = 'rgba(236,213,159,.6)'; ctx.beginPath(); ctx.arc(18 + sway, -67, 5, 0, TAU); ctx.fill();
      break;
    }
    case 'sign': {
      ctx.fillStyle = '#4b3523'; ctx.fillRect(-2, -48, 4, 50);
      ctx.fillStyle = '#7a5b3b'; ctx.fillRect(-22, -54, 44, 24);
      ctx.strokeStyle = 'rgba(236,213,159,.25)'; ctx.strokeRect(-22, -54, 44, 24);
      ctx.fillStyle = 'rgba(236,213,159,.5)'; ctx.font = '7px serif'; ctx.textAlign = 'center'; ctx.fillText(p.label || 'LUMEN', 0, -39);
      break;
    }
    case 'bones': {
      ctx.strokeStyle = '#a69b82'; ctx.lineWidth = 3; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(-14, 0); ctx.lineTo(12, -10); ctx.moveTo(12, 0); ctx.lineTo(-12, -10); ctx.stroke();
      ellipse(ctx, 0, -16, 7, 8, '#b7ad94');
      break;
    }
    case 'lavaVent': {
      ellipse(ctx, 0, 3, 28, 10, 'rgba(0,0,0,.3)');
      ctx.fillStyle = '#2a1410'; ctx.beginPath(); ctx.ellipse(0, 0, 24, 9, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = '#ff6a35'; ctx.beginPath(); ctx.ellipse(0, -1, 12, 4, 0, 0, TAU); ctx.fill();
      glow(ctx, 0, -10, 30, '#ff8a55', .15 + Math.sin(t * 4) * .03);
      break;
    }
    default:
      break;
  }
  ctx.restore();
}

// ============================================================
// PERSONAJES
// ============================================================
export function drawSword(ctx, weapon, x, y, angle, scale = 1, glowOn = true) {
  const shape = weapon?.shape ?? 0;
  const blade = weapon?.blade || '#fff1c2';
  const hilt = weapon?.color || '#d4b36a';
  ctx.save();
  ctx.translate(x, y); ctx.rotate(angle); ctx.scale(scale, scale);
  if (glowOn) {
    glow(ctx, 0, -28, 28, blade, .12);
  }
  // hoja
  if (shape === 2) {
    polygon(ctx, [[-2.5, 0], [-4.5, -38], [0, -48], [4.5, -38], [2.5, 0]], blade);
    polygon(ctx, [[0, -2], [0, -45], [3, -36], [1.5, 0]], rgba('#ffffff', .35));
  } else if (shape === 1) {
    polygon(ctx, [[-4, 0], [-5, -46], [0, -58], [5, -46], [4, 0]], blade);
    polygon(ctx, [[0, -3], [0, -55], [3, -45], [2, 0]], rgba('#ffffff', .35));
  } else {
    polygon(ctx, [[-3, 0], [-3.5, -42], [0, -52], [3.5, -42], [3, 0]], blade);
    polygon(ctx, [[0, -2], [0, -48], [2.5, -40], [1.5, 0]], rgba('#ffffff', .45));
  }
  // guarda
  ctx.fillStyle = hilt;
  rr(ctx, -9, -2, 18, 4, 1.5); ctx.fill();
  if (shape === 1) { rr(ctx, -13, -3, 26, 5, 2); ctx.fill(); }
  // mango
  ctx.fillStyle = '#3b2a19'; rr(ctx, -2.2, 2, 4.4, 12, 1); ctx.fill();
  ctx.fillStyle = hilt; ctx.beginPath(); ctx.arc(0, 15, 3, 0, TAU); ctx.fill();
  ctx.restore();
}

export function drawCharacter(ctx, x, y, appearance, t, opts = {}) {
  const facing = opts.facing || 'down';
  const flip = facing === 'left' ? -1 : 1;
  const moving = opts.moving || false;
  const speed = opts.speed || 0;
  const attacking = opts.attacking || 0;
  const blocking = opts.blocking || false;
  const dodging = opts.dodging || 0;
  const hurt = opts.hurt || 0;
  const cast = opts.cast || 0;
  const scale = opts.scale || 1;
  const walk = t * (7 + speed * .02) * (moving ? 1 : .35);
  const bob = moving ? Math.abs(Math.sin(walk)) * 2.2 : Math.sin(t * 2) * .9;
  const legSwing = moving ? Math.sin(walk) * 5 : 0;
  const armSwing = moving ? Math.sin(walk + Math.PI) * 4 : 0;
  const armorColor = appearance.armorColor || '#d7c7a4';
  const trim = appearance.trim || '#c9a65a';
  const cape = appearance.capeColor || shade(armorColor, -.4);
  const skin = appearance.skin || '#e2b58e';
  const hairColor = appearance.hairColor || '#3b2417';
  const hairStyle = appearance.hair ?? 0;
  const helmet = appearance.helmet || 0;
  const accessory = appearance.accessory || 0;
  const weapon = appearance.weaponData || { shape: appearance.weapon || 0, color: '#d4b36a', blade: '#fff1c2' };

  ctx.save();
  ctx.translate(x, y);
  if (dodging > 0) {
    ctx.rotate(Math.sin((1 - dodging) * Math.PI * 2) * .6);
    ctx.globalAlpha = .72 + Math.sin(dodging * 20) * .12;
  }
  ctx.scale(flip * scale, scale);
  // sombra
  ellipse(ctx, 0, 2, 17, 5.5, 'rgba(0,0,0,.33)');
  if (hurt > 0) {
    ctx.globalCompositeOperation = 'source-over';
  }
  // capa
  const capeSway = Math.sin(t * 2.4 + (moving ? walk * .5 : 0)) * 3;
  ctx.fillStyle = cape;
  ctx.beginPath();
  ctx.moveTo(-11, -40 + bob);
  ctx.quadraticCurveTo(-20 - capeSway, -24, -17 + capeSway, -3);
  ctx.lineTo(5, -2);
  ctx.quadraticCurveTo(9, -24, 10, -41 + bob);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,.05)';
  ctx.beginPath(); ctx.moveTo(-9, -38 + bob); ctx.quadraticCurveTo(-14, -24, -11, -5); ctx.lineTo(-4, -5); ctx.quadraticCurveTo(-6, -24, -3, -38 + bob); ctx.fill();
  // piernas
  const legY = -15 + bob;
  ctx.strokeStyle = shade(armorColor, -.35); ctx.lineWidth = 6; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(-5, legY); ctx.lineTo(-6 + legSwing * .6, -2); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(5, legY); ctx.lineTo(6 - legSwing * .6, -2); ctx.stroke();
  ctx.strokeStyle = '#2d2218'; ctx.lineWidth = 5;
  ctx.beginPath(); ctx.moveTo(-6 + legSwing * .6, -2); ctx.lineTo(-9 + legSwing * .6, 1); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(6 - legSwing * .6, -2); ctx.lineTo(9 - legSwing * .6, 1); ctx.stroke();
  // torso
  ctx.save();
  ctx.translate(0, bob);
  const torsoG = ctx.createLinearGradient(-10, -42, 10, -12);
  torsoG.addColorStop(0, shade(armorColor, .16));
  torsoG.addColorStop(.5, armorColor);
  torsoG.addColorStop(1, shade(armorColor, -.32));
  ctx.fillStyle = torsoG;
  ctx.beginPath();
  ctx.moveTo(-9, -41); ctx.quadraticCurveTo(-14, -34, -12, -14);
  ctx.quadraticCurveTo(0, -8, 12, -14);
  ctx.quadraticCurveTo(14, -34, 9, -41);
  ctx.closePath(); ctx.fill();
  // hombreras
  ctx.fillStyle = shade(armorColor, .2);
  ellipse(ctx, -12, -37, 6, 5, shade(armorColor, .12));
  ellipse(ctx, 12, -37, 6, 5, shade(armorColor, .12));
  ctx.strokeStyle = rgba(trim, .7); ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.moveTo(-8, -36); ctx.lineTo(0, -32); ctx.lineTo(8, -36); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-10, -24); ctx.lineTo(10, -24); ctx.stroke();
  // cinturón
  ctx.fillStyle = '#4b3520'; ctx.fillRect(-10, -19, 20, 4);
  ctx.fillStyle = trim; ctx.fillRect(-2, -20, 4, 6);
  // brazos
  ctx.strokeStyle = shade(armorColor, -.16); ctx.lineWidth = 5.5;
  ctx.beginPath(); ctx.moveTo(-11, -35); ctx.lineTo(-15, -22 + armSwing); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(11, -35); ctx.lineTo(15, -22 - armSwing); ctx.stroke();
  // manos
  ellipse(ctx, -15, -20 + armSwing, 2.8, 2.8, skin);
  ellipse(ctx, 15, -20 - armSwing, 2.8, 2.8, skin);
  // cabeza
  const headY = -53 + bob;
  ellipse(ctx, 0, headY, 12.5, 13.5, skin);
  // orejas
  ellipse(ctx, -11, headY + 1, 2.2, 3.2, shade(skin, -.06));
  ellipse(ctx, 11, headY + 1, 2.2, 3.2, shade(skin, -.06));
  // ojos
  ctx.fillStyle = appearance.eyeColor || '#2b2a35';
  const eyeY = headY + 1;
  ctx.beginPath(); ctx.ellipse(-4.2, eyeY, 1.4, 2.2, 0, 0, TAU); ctx.fill();
  ctx.beginPath(); ctx.ellipse(4.2, eyeY, 1.4, 2.2, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,.7)';
  ctx.beginPath(); ctx.arc(-4.6, eyeY - .8, .5, 0, TAU); ctx.fill();
  ctx.beginPath(); ctx.arc(3.8, eyeY - .8, .5, 0, TAU); ctx.fill();
  // boca
  ctx.strokeStyle = 'rgba(70,35,30,.5)'; ctx.lineWidth = .8;
  ctx.beginPath(); ctx.arc(0, headY + 6.5, 2.8, .25, Math.PI - .25); ctx.stroke();
  // pelo
  drawHair(ctx, headY, hairStyle, hairColor, flip);
  // casco
  if (helmet === 1) {
    ctx.fillStyle = '#d9c38b'; ctx.beginPath(); ctx.arc(0, headY - 3, 12, Math.PI, 0); ctx.fill();
    ctx.fillStyle = '#f3e6bc'; polygon(ctx, [[0, headY - 22], [6, headY - 14], [0, headY - 9], [-6, headY - 14]], '#f3e6bc');
    ctx.strokeStyle = '#8c6a2d'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(0, headY - 3, 12, Math.PI, 0); ctx.stroke();
  } else if (helmet === 2) {
    ctx.fillStyle = '#2e2a35'; ctx.beginPath(); ctx.arc(0, headY - 2, 12.5, Math.PI, 0); ctx.fill();
    polygon(ctx, [[-12, headY - 2], [-20, headY - 11], [-16, headY + 4]], '#2e2a35');
    polygon(ctx, [[12, headY - 2], [20, headY - 11], [16, headY + 4]], '#2e2a35');
    ctx.fillStyle = '#b9a7d8'; ellipse(ctx, 0, headY - 12, 2, 2, '#b9a7d8');
  }
  // accesorios
  if (accessory === 1) {
    ctx.strokeStyle = 'rgba(255,232,160,.75)'; ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.ellipse(0, headY - 17, 13, 4, 0, 0, TAU); ctx.stroke();
    glow(ctx, 0, headY - 19, 12, '#ffe8a0', .15);
  } else if (accessory === 2) {
    ctx.fillStyle = '#8a4a3f'; ctx.beginPath(); ctx.moveTo(-11, headY + 9); ctx.quadraticCurveTo(-2, headY + 17, 9, headY + 8); ctx.lineTo(11, headY + 13); ctx.quadraticCurveTo(0, headY + 23, -13, headY + 13); ctx.closePath(); ctx.fill();
  } else if (accessory === 3) {
    ctx.strokeStyle = 'rgba(150,80,60,.55)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(6, headY - 4); ctx.lineTo(9, headY + 2); ctx.stroke();
  }
  // arma
  const swing = attacking > 0 ? Math.sin(attacking * Math.PI) : 0;
  const attackAngle = attacking > 0 ? lerp(-2.1, .8, attacking) : (moving ? -.1 + Math.sin(walk) * .05 : -.18);
  const swordX = 15, swordY = -21 - armSwing;
  if (cast > 0) {
    glow(ctx, 17, -28, 28, '#b9d8ff', .2);
  }
  drawSword(ctx, weapon, swordX, swordY, attackAngle, .92, true);
  // escudo
  if (blocking) {
    ctx.save();
    ctx.translate(-16, -25);
    ctx.fillStyle = '#8b8774'; ctx.beginPath(); ctx.ellipse(0, 0, 10, 16, -.15, 0, TAU); ctx.fill();
    ctx.strokeStyle = trim; ctx.lineWidth = 2; ctx.stroke();
    ctx.fillStyle = '#4b5b6b'; ctx.beginPath(); ctx.arc(0, 0, 4, 0, TAU); ctx.fill();
    glow(ctx, 0, 0, 22, '#e8d39b', .1);
    ctx.restore();
  }
  // marca del alba
  if (opts.mark !== false) {
    glow(ctx, 4, -36, 10, '#ffe2a1', .08);
    ctx.fillStyle = 'rgba(255,240,190,.6)'; ctx.beginPath(); ctx.arc(5, -36, 1.2, 0, TAU); ctx.fill();
  }
  // destello de daño
  if (hurt > 0) {
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = `rgba(255,120,110,${hurt * .35})`;
    ctx.beginPath(); ctx.ellipse(0, -30, 22, 38, 0, 0, TAU); ctx.fill();
  }
  ctx.restore();
  ctx.restore();
}

function drawHair(ctx, headY, style, color, flip) {
  ctx.fillStyle = color;
  if (style === 0) {
    ctx.beginPath(); ctx.arc(0, headY - 2, 13, Math.PI * 1.04, Math.PI * 1.96); ctx.quadraticCurveTo(10, headY - 8, 8, headY - 1); ctx.lineTo(5, headY - 8); ctx.lineTo(2, headY - 3); ctx.lineTo(-2, headY - 8); ctx.lineTo(-6, headY - 2); ctx.quadraticCurveTo(-10, headY - 8, -13, headY - 2); ctx.fill();
  } else if (style === 1) {
    ctx.beginPath(); ctx.arc(0, headY - 1, 13.5, Math.PI * 1.02, Math.PI * 1.98); ctx.lineTo(14, headY + 12); ctx.quadraticCurveTo(9, headY + 8, 8, headY + 2); ctx.lineTo(5, headY - 6); ctx.lineTo(1, headY + 1); ctx.lineTo(-4, headY - 7); ctx.lineTo(-8, headY + 2); ctx.quadraticCurveTo(-12, headY + 10, -14, headY + 14); ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.08)'; ctx.beginPath(); ctx.ellipse(-5, headY - 6, 5, 4, -.3, 0, TAU); ctx.fill();
  } else if (style === 2) {
    ctx.beginPath(); ctx.arc(0, headY - 2, 13, Math.PI * 1.04, Math.PI * 1.96); ctx.quadraticCurveTo(13, headY + 2, 10, headY + 1); ctx.lineTo(4, headY - 7); ctx.lineTo(1, headY - 1); ctx.lineTo(-3, headY - 8); ctx.lineTo(-8, headY + 1); ctx.quadraticCurveTo(-12, headY + 4, -13, headY - 1); ctx.fill();
    // trenza
    for (let i = 0; i < 4; i++) {
      ellipse(ctx, 13 - i * .8, headY + 8 + i * 5, 3.1 - i * .25, 3.4 - i * .2, i % 2 ? color : shade(color, .12));
    }
  } else {
    for (let i = 0; i < 6; i++) {
      const a = Math.PI * 1.05 + i * .35;
      ellipse(ctx, Math.cos(a) * 12, headY - 2 + Math.sin(a) * 11, 5, 4.2, color);
    }
    ctx.fillStyle = color; ctx.beginPath(); ctx.arc(0, headY - 2, 12, Math.PI, 0); ctx.fill();
  }
}

export function drawNPC(ctx, x, y, npc, t, opts = {}) {
  const appearance = {
    skin: npc.color, hairColor: npc.hair, armorColor: npc.robe, trim: npc.accent,
    capeColor: shade(npc.robe, -.35), hair: npc.hairStyle ?? 1, helmet: npc.helmet ?? 0,
    accessory: npc.accessory ?? 0, weaponData: npc.weapon || { shape: 0, color: '#c9a65a', blade: '#e7e1cf' }
  };
  drawCharacter(ctx, x, y, appearance, t, { ...opts, mark: false, blocking: false });
  // símbolo de interacción
  if (opts.marker) {
    const by = y - 90 + Math.sin(t * 2.5) * 4;
    glow(ctx, x, by, 20, opts.markerColor || '#ecd59f', .16);
    ctx.fillStyle = opts.markerColor || '#ecd59f';
    ctx.font = 'bold 16px serif'; ctx.textAlign = 'center';
    ctx.fillText(opts.marker, x, by + 6);
  }
}

// ============================================================
// CRIATURAS
// ============================================================
export function drawCreature(ctx, c, x, y, scale = 1, t = 0, opts = {}) {
  const def = typeof c === 'string' ? CREATURE_BY_ID[c] : c;
  if (!def) return;
  const color = def.color, accent = def.accent;
  const bob = Math.sin(t * 2.5 + (opts.phase || 0)) * 2.5;
  const s = scale;
  ctx.save();
  ctx.translate(x, y + bob);
  ctx.scale(s, s);
  ellipse(ctx, 0, 2 - bob, 13, 4, 'rgba(0,0,0,.28)');
  glow(ctx, 0, -16, 34, color, opts.glow ?? .17);
  const bodyY = -14;
  const shape = def.shape;
  if (shape === 'fox') {
    ellipse(ctx, 0, bodyY, 12, 9, color);
    ellipse(ctx, 9, bodyY - 2, 7, 7, accent);
    polygon(ctx, [[-6, bodyY - 6], [-8, bodyY - 19], [-1, bodyY - 10]], color);
    polygon(ctx, [[5, bodyY - 7], [8, bodyY - 20], [11, bodyY - 9]], color);
    polygon(ctx, [[-6, bodyY - 7], [-7, bodyY - 15], [-3, bodyY - 10]], '#ffe9cf');
    ctx.fillStyle = '#2e2a3a'; ellipse(ctx, -4, bodyY - 3, 1.5, 2, '#2e2a3a'); ellipse(ctx, 3, bodyY - 3, 1.5, 2, '#2e2a3a');
    ctx.strokeStyle = color; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-10, bodyY + 1); ctx.quadraticCurveTo(-24, bodyY - 8, -19, bodyY - 18); ctx.stroke();
    glow(ctx, -19, bodyY - 18, 7, accent, .35);
    ellipse(ctx, 0, bodyY + 8, 6, 2, 'rgba(255,255,255,.2)');
  } else if (shape === 'turtle') {
    ellipse(ctx, 0, bodyY + 3, 14, 10, shade(color, -.3));
    ctx.fillStyle = color; ctx.beginPath(); ctx.ellipse(0, bodyY, 15, 11, 0, Math.PI, 0); ctx.fill();
    ctx.strokeStyle = accent; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(0, bodyY, 8, Math.PI, 0); ctx.stroke();
    ellipse(ctx, 11, bodyY + 2, 5, 4, shade(color, .18));
    ellipse(ctx, 14, bodyY, 1.5, 1.8, '#26321f');
    for (const dx of [-9, 9]) ellipse(ctx, dx, bodyY + 9, 3, 2, shade(color, -.2));
    flower(ctx, -5, bodyY - 7, accent, .8);
  } else if (shape === 'cat') {
    ellipse(ctx, 0, bodyY, 10, 8, color);
    ellipse(ctx, 7, bodyY - 3, 6, 6, shade(color, .15));
    polygon(ctx, [[2, bodyY - 7], [3, bodyY - 16], [7, bodyY - 8]], color);
    polygon(ctx, [[9, bodyY - 8], [12, bodyY - 16], [12, bodyY - 7]], color);
    ellipse(ctx, 5, bodyY - 3, 1.2, 1.8, accent); ellipse(ctx, 9, bodyY - 3, 1.2, 1.8, accent);
    ctx.strokeStyle = color; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(-9, bodyY + 1); ctx.bezierCurveTo(-20, bodyY - 4, -18, bodyY - 16, -12, bodyY - 13); ctx.stroke();
    glow(ctx, 7, bodyY - 8, 8, accent, .2);
  } else if (shape === 'beetle') {
    ellipse(ctx, 0, bodyY, 14, 9, shade(color, -.25));
    ctx.fillStyle = color; ctx.beginPath(); ctx.ellipse(0, bodyY - 1, 13, 8, 0, Math.PI, 0); ctx.fill();
    ctx.strokeStyle = accent; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(0, bodyY - 9); ctx.lineTo(0, bodyY + 5); ctx.stroke();
    polygon(ctx, [[-4, bodyY - 8], [-2, bodyY - 16], [1, bodyY - 8]], accent);
    ellipse(ctx, 13, bodyY + 2, 4, 3.5, shade(color, .12));
    for (let i = -1; i <= 1; i += 2) { ctx.strokeStyle = shade(color, -.4); ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(i * 7, bodyY + 6); ctx.lineTo(i * 10, bodyY + 11); ctx.stroke(); }
  } else if (shape === 'bird') {
    ellipse(ctx, 0, bodyY, 9, 9, color);
    ctx.fillStyle = accent; ctx.beginPath(); ctx.ellipse(-7, bodyY - 1, 8, 4, -.5, 0, TAU); ctx.fill();
    polygon(ctx, [[4, bodyY - 4], [15, bodyY], [4, bodyY + 2]], '#f4b24a');
    ellipse(ctx, 3, bodyY - 5, 1.5, 2, '#2c2430');
    ctx.strokeStyle = shade(color, -.4); ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(-3, bodyY + 8); ctx.lineTo(-4, bodyY + 13); ctx.moveTo(3, bodyY + 8); ctx.lineTo(4, bodyY + 13); ctx.stroke();
    glow(ctx, 0, bodyY - 10, 9, accent, .25);
  } else if (shape === 'hare') {
    ellipse(ctx, 0, bodyY, 10, 8, color);
    ellipse(ctx, 7, bodyY - 4, 6, 6, accent);
    polygon(ctx, [[3, bodyY - 8], [1, bodyY - 24], [7, bodyY - 11]], color);
    polygon(ctx, [[8, bodyY - 8], [11, bodyY - 23], [12, bodyY - 9]], color);
    ellipse(ctx, 6, bodyY - 4, 1.3, 1.7, '#28313b'); ellipse(ctx, 10, bodyY - 4, 1.3, 1.7, '#28313b');
    ctx.strokeStyle = 'rgba(255,255,255,.3)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-8, bodyY); ctx.quadraticCurveTo(-18, bodyY - 8, -14, bodyY - 15); ctx.stroke();
  } else if (shape === 'wolf') {
    ellipse(ctx, 0, bodyY + 2, 15, 8, color);
    ellipse(ctx, 10, bodyY - 4, 7, 6, shade(color, .1));
    polygon(ctx, [[6, bodyY - 8], [7, bodyY - 18], [11, bodyY - 9]], color);
    polygon(ctx, [[11, bodyY - 9], [14, bodyY - 18], [15, bodyY - 7]], color);
    ellipse(ctx, 10, bodyY - 5, 1.3, 1.6, accent); ellipse(ctx, 14, bodyY - 4, 1.3, 1.6, accent);
    ctx.strokeStyle = shade(color, -.2); ctx.lineWidth = 3;
    for (const dx of [-9, -3, 5, 10]) { ctx.beginPath(); ctx.moveTo(dx, bodyY + 8); ctx.lineTo(dx + 1, bodyY + 14); ctx.stroke(); }
    ctx.beginPath(); ctx.moveTo(-14, bodyY + 1); ctx.quadraticCurveTo(-25, bodyY - 6, -20, bodyY - 16); ctx.stroke();
    glow(ctx, 12, bodyY - 3, 6, accent, .25);
  } else if (shape === 'owl') {
    ellipse(ctx, 0, bodyY, 12, 12, color);
    ctx.fillStyle = accent; ctx.beginPath(); ctx.ellipse(-8, bodyY, 5, 9, .3, 0, TAU); ctx.fill();
    ctx.beginPath(); ctx.ellipse(8, bodyY, 5, 9, -.3, 0, TAU); ctx.fill();
    ellipse(ctx, -4, bodyY - 4, 3.5, 3.5, '#f5f3e8'); ellipse(ctx, 4, bodyY - 4, 3.5, 3.5, '#f5f3e8');
    ellipse(ctx, -4, bodyY - 4, 1.4, 1.4, '#22202a'); ellipse(ctx, 4, bodyY - 4, 1.4, 1.4, '#22202a');
    polygon(ctx, [[0, bodyY + 1], [4, bodyY + 5], [-1, bodyY + 5]], '#e8b96b');
    glow(ctx, 0, bodyY - 14, 16, accent, .2);
  } else if (shape === 'lion') {
    ellipse(ctx, 0, bodyY + 1, 14, 9, color);
    ellipse(ctx, 9, bodyY - 4, 7, 7, shade(color, .2));
    for (let i = 0; i < 8; i++) { const a = i / 8 * TAU; ellipse(ctx, 9 + Math.cos(a) * 8, bodyY - 4 + Math.sin(a) * 8, 3, 3, accent); }
    ellipse(ctx, 9, bodyY - 4, 5, 5, shade(color, .15));
    ellipse(ctx, 8, bodyY - 5, 1.2, 1.5, '#3b2f22'); ellipse(ctx, 11, bodyY - 5, 1.2, 1.5, '#3b2f22');
    for (const dx of [-8, 4]) { ctx.strokeStyle = shade(color, -.3); ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(dx, bodyY + 8); ctx.lineTo(dx, bodyY + 13); ctx.stroke(); }
    glow(ctx, 9, bodyY - 6, 10, accent, .18);
  } else if (shape === 'serpent') {
    ctx.strokeStyle = color; ctx.lineWidth = 6; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-10, bodyY + 6); ctx.bezierCurveTo(-20, bodyY - 8, 12, bodyY - 8, 9, bodyY - 13); ctx.stroke();
    ctx.strokeStyle = accent; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-10, bodyY + 4); ctx.bezierCurveTo(-18, bodyY - 7, 10, bodyY - 7, 8, bodyY - 11); ctx.stroke();
    ellipse(ctx, 9, bodyY - 14, 5, 4.5, color);
    polygon(ctx, [[8, bodyY - 18], [9, bodyY - 25], [11, bodyY - 18]], accent);
    ellipse(ctx, 11, bodyY - 15, 1, 1.3, '#3b2b42');
    ctx.fillStyle = rgba(accent, .6);
    polygon(ctx, [[-1, bodyY - 8], [-16, bodyY - 26], [4, bodyY - 11]], rgba(accent, .55));
    polygon(ctx, [[3, bodyY - 9], [20, bodyY - 24], [7, bodyY - 9]], rgba(accent, .4));
    glow(ctx, 0, bodyY - 14, 22, accent, .16);
  } else if (shape === 'spirit') {
    ctx.fillStyle = rgba(color, .8);
    ctx.beginPath(); ctx.moveTo(-9, bodyY + 7); ctx.quadraticCurveTo(-14, bodyY - 8, 0, bodyY - 15); ctx.quadraticCurveTo(14, bodyY - 8, 9, bodyY + 7); ctx.quadraticCurveTo(0, bodyY + 14, -9, bodyY + 7); ctx.fill();
    ctx.fillStyle = accent; ellipse(ctx, 0, bodyY - 5, 6, 6, accent);
    ctx.fillStyle = '#4a3a62'; ellipse(ctx, -2.5, bodyY - 5, 1, 1.4, '#4a3a62'); ellipse(ctx, 2.5, bodyY - 5, 1, 1.4, '#4a3a62');
    ctx.strokeStyle = rgba(accent, .5); ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(0, bodyY - 5, 8, 0, TAU); ctx.stroke();
    for (let i = 0; i < 3; i++) glow(ctx, Math.sin(t + i) * 18, bodyY + Math.cos(t * 1.3 + i) * 12, 3, accent, .2);
  } else if (shape === 'world') {
    glow(ctx, 0, bodyY - 4, 42, color, .24);
    ellipse(ctx, 0, bodyY - 4, 14, 14, color);
    ctx.strokeStyle = accent; ctx.lineWidth = 1.2;
    for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.ellipse(0, bodyY - 4, 20 + i * 5, 5 + i * 2, t * .3 + i, 0, TAU); ctx.stroke(); }
    ctx.fillStyle = 'rgba(255,255,255,.35)'; ellipse(ctx, -4, bodyY - 9, 4, 3, 'rgba(255,255,255,.35)');
    ctx.fillStyle = 'rgba(120,150,130,.4)'; ellipse(ctx, 4, bodyY, 5, 4, 'rgba(120,150,130,.4)');
    for (let i = 0; i < 4; i++) glow(ctx, Math.cos(t * .7 + i * 1.6) * 25, bodyY - 4 + Math.sin(t * .7 + i * 1.6) * 12, 2.5, accent, .4);
  }
  ctx.restore();
}

// ============================================================
// ENEMIGOS
// ============================================================
export function drawEnemy(ctx, e, t) {
  const x = e.x, y = e.y;
  const type = e.type;
  const flip = e.facing === 'left' ? -1 : 1;
  const bob = Math.sin(t * 3 + e.seed) * 1.5;
  const windup = e.state === 'windup' ? 1 : 0;
  const hurt = e.hurt || 0;
  const dead = e.dead;
  ctx.save();
  ctx.translate(x, y);
  if (dead) { ctx.globalAlpha = Math.max(0, 1 - e.deathTimer / .8); ctx.scale(1, Math.max(.1, 1 - e.deathTimer * 1.4)); }
  ctx.scale(flip, 1);
  ellipse(ctx, 0, 2, (type.radius || 20) * 1.05, (type.radius || 20) * .32, 'rgba(0,0,0,.35)');
  const s = e.boss ? 1.5 : 1;
  ctx.scale(s, s);
  if (windup) glow(ctx, 0, -18, 48, type.accent, .16);
  if (hurt > 0) { ctx.globalCompositeOperation = 'lighter'; }
  const shape = type.shape;
  if (shape === 'slime') {
    const squash = 1 + Math.sin(t * 4 + e.seed) * .06;
    ctx.fillStyle = type.color;
    ctx.beginPath(); ctx.ellipse(0, -10 + bob, 19 * squash, 15 / squash, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = rgba(type.accent, .35); ctx.beginPath(); ctx.ellipse(-5, -16 + bob, 8, 6, -.3, 0, TAU); ctx.fill();
    ellipse(ctx, -5, -12 + bob, 2.3, 3, '#202b20'); ellipse(ctx, 5, -12 + bob, 2.3, 3, '#202b20');
    ctx.strokeStyle = 'rgba(20,30,20,.5)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(0, -6 + bob, 5, .2, Math.PI - .2); ctx.stroke();
    for (let i = 0; i < 3; i++) ellipse(ctx, -8 + i * 8, -24 + bob + Math.sin(t * 2 + i) * 2, 2, 2, rgba(type.accent, .45));
  } else if (shape === 'wolf' || shape === 'hound') {
    const c = type.color, a = type.accent;
    ellipse(ctx, 0, -14 + bob, 21, 11, c);
    ellipse(ctx, 15, -20 + bob, 9, 8, shade(c, .1));
    polygon(ctx, [[10, -25 + bob], [12, -38 + bob], [17, -27 + bob]], c);
    polygon(ctx, [[18, -27 + bob], [22, -38 + bob], [23, -24 + bob]], c);
    ellipse(ctx, 14, -22 + bob, 2, 2.5, a); ellipse(ctx, 19, -21 + bob, 2, 2.5, a);
    ctx.strokeStyle = shade(c, -.3); ctx.lineWidth = 4;
    for (const dx of [-12, -4, 7, 14]) { ctx.beginPath(); ctx.moveTo(dx, -7 + bob); ctx.lineTo(dx + (e.moving ? Math.sin(t * 10 + dx) * 4 : 0), 0); ctx.stroke(); }
    ctx.strokeStyle = c; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(-18, -17 + bob); ctx.quadraticCurveTo(-33, -24, -28, -36); ctx.stroke();
    if (shape === 'hound') {
      glow(ctx, -27, -34, 12, a, .3);
      for (let i = 0; i < 3; i++) polygon(ctx, [[-30 + i * 3, -38], [-26 + i * 3, -48 - i * 3], [-23 + i * 3, -38]], rgba(a, .5));
    }
  } else if (shape === 'bandit' || shape === 'knight') {
    const armor = type.color, trim = type.accent;
    ctx.save(); ctx.translate(0, bob); ctx.scale(1.12, 1.12);
    ellipse(ctx, 0, 2, 17, 5, 'rgba(0,0,0,.25)');
    ctx.fillStyle = shade(armor, -.35); rr(ctx, -9, -28, 18, 22, 4); ctx.fill();
    ctx.fillStyle = armor; ctx.beginPath(); ctx.moveTo(-11, -50); ctx.quadraticCurveTo(-16, -35, -13, -20); ctx.lineTo(13, -20); ctx.quadraticCurveTo(16, -35, 11, -50); ctx.closePath(); ctx.fill();
    ellipse(ctx, -13, -46, 7, 6, trim); ellipse(ctx, 13, -46, 7, 6, trim);
    ctx.fillStyle = shade(armor, -.4); ctx.fillRect(-11, -26, 22, 4);
    const headY = -60;
    ellipse(ctx, 0, headY, 11, 12, shape === 'bandit' ? type.color : '#b8b5a7');
    if (shape === 'bandit') {
      ctx.fillStyle = '#3c2d24'; ctx.beginPath(); ctx.arc(0, headY - 2, 12, Math.PI, 0); ctx.fill();
      ctx.fillStyle = '#221b16'; ctx.fillRect(-11, headY - 2, 22, 5);
      ctx.fillStyle = type.accent; ellipse(ctx, -4, headY + 1, 1.6, 2, type.accent); ellipse(ctx, 4, headY + 1, 1.6, 2, type.accent);
    } else {
      ctx.fillStyle = '#5d6369'; ctx.beginPath(); ctx.arc(0, headY - 2, 11.5, Math.PI, 0); ctx.fill();
      ctx.fillStyle = '#1d2026'; ctx.fillRect(-9, headY - 2, 18, 4);
      glow(ctx, 0, headY + 1, 10, type.accent, .18);
    }
    ctx.strokeStyle = shade(armor, -.2); ctx.lineWidth = 6;
    ctx.beginPath(); ctx.moveTo(-13, -42); ctx.lineTo(-20, -25); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(13, -42); ctx.lineTo(20, -27); ctx.stroke();
    if (shape === 'knight') {
      drawSword(ctx, { shape: 1, color: trim, blade: '#d9e2ea' }, 20, -28, -.3, 1.1, true);
      ctx.fillStyle = '#626b73'; ctx.beginPath(); ctx.ellipse(-19, -31, 10, 15, -.1, 0, TAU); ctx.fill();
      ctx.strokeStyle = trim; ctx.lineWidth = 2; ctx.stroke();
    } else {
      drawSword(ctx, { shape: 0, color: trim, blade: '#c7c9c4' }, 20, -28, -.4, 1, true);
    }
    ctx.restore();
  } else if (shape === 'golem') {
    const c = type.color, a = type.accent;
    ctx.fillStyle = shade(c, -.25); rr(ctx, -20, -42, 40, 44, 8); ctx.fill();
    ctx.fillStyle = c; polygon(ctx, [[-20, -38], [-12, -54], [8, -56], [20, -40], [15, -10], [-14, -10]], c);
    ctx.fillStyle = shade(c, .12); polygon(ctx, [[-12, -52], [6, -54], [2, -32], [-12, -30]], shade(c, .1));
    ellipse(ctx, -8, -42, 5, 4, a); ellipse(ctx, 8, -42, 5, 4, a);
    glow(ctx, 0, -28, 16, a, .18);
    ctx.strokeStyle = a; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-12, -27); ctx.lineTo(0, -20); ctx.lineTo(11, -29); ctx.stroke();
    ctx.fillStyle = shade(c, -.35); rr(ctx, -32, -36, 13, 30, 5); ctx.fill(); rr(ctx, 19, -36, 13, 30, 5); ctx.fill();
    ctx.fillStyle = shade(c, -.1); rr(ctx, -20, -7, 15, 11, 3); ctx.fill(); rr(ctx, 5, -7, 15, 11, 3); ctx.fill();
    if (windup) glow(ctx, 0, -34, 40, a, .1);
  } else if (shape === 'sentinel') {
    const c = type.color, a = type.accent;
    ctx.translate(0, -20 + Math.sin(t * 2 + e.seed) * 4);
    glow(ctx, 0, 0, 34, a, .15);
    ctx.fillStyle = c; polygon(ctx, [[0, -25], [15, -5], [10, 22], [-10, 22], [-15, -5]], c);
    ctx.strokeStyle = a; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.fillStyle = a; ellipse(ctx, 0, -4, 4, 4, a);
    for (let i = 0; i < 3; i++) { ctx.strokeStyle = rgba(a, .5); ctx.lineWidth = 1; ctx.beginPath(); ctx.ellipse(0, 0, 24 + i * 5, 8 + i * 3, t * .4 + i, 0, TAU); ctx.stroke(); }
    polygon(ctx, [[-15, 5], [-26, -10], [-18, 18]], rgba(a, .3));
    polygon(ctx, [[15, 5], [26, -10], [18, 18]], rgba(a, .3));
  } else if (shape === 'guardian') {
    const c = type.color, a = type.accent;
    ctx.translate(0, bob);
    ctx.fillStyle = shade(c, -.3); rr(ctx, -26, -62, 52, 64, 12); ctx.fill();
    ctx.fillStyle = c; polygon(ctx, [[-30, -50], [-18, -76], [18, -76], [30, -50], [24, -8], [-24, -8]], c);
    ctx.fillStyle = shade(c, .13); polygon(ctx, [[-18, -74], [14, -76], [8, -46], [-18, -42]], shade(c, .12));
    ellipse(ctx, -10, -58, 6, 5, a); ellipse(ctx, 10, -58, 6, 5, a);
    glow(ctx, 0, -38, 22, a, .15);
    ctx.strokeStyle = a; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(-18, -35); ctx.lineTo(0, -26); ctx.lineTo(18, -38); ctx.stroke();
    // brazos
    ctx.fillStyle = shade(c, -.4); rr(ctx, -44, -52, 16, 40, 6); ctx.fill(); rr(ctx, 28, -52, 16, 40, 6); ctx.fill();
    // espada grande
    drawSword(ctx, { shape: 1, color: a, blade: '#fff0c6' }, 38, -36, -.2, 1.6, true);
    // piernas
    ctx.fillStyle = shade(c, -.35); rr(ctx, -24, -8, 20, 16, 4); ctx.fill(); rr(ctx, 4, -8, 20, 16, 4); ctx.fill();
    // corona
    polygon(ctx, [[-15, -78], [-8, -90], [0, -80], [8, -90], [15, -78]], a);
  } else if (shape === 'forge') {
    const c = type.color, a = type.accent;
    ctx.translate(0, bob);
    ctx.fillStyle = shade(c, -.4); rr(ctx, -34, -48, 68, 52, 10); ctx.fill();
    ctx.fillStyle = c; polygon(ctx, [[-34, -42], [-20, -72], [20, -72], [34, -42], [28, -2], [-28, -2]], c);
    ctx.fillStyle = shade(c, .1); polygon(ctx, [[-20, -68], [18, -70], [12, -36], [-20, -32]], shade(c, .08));
    glow(ctx, 0, -40, 34, a, .25);
    ellipse(ctx, -11, -54, 6, 6, a); ellipse(ctx, 11, -54, 6, 6, a);
    // engranajes
    for (const [gx, gy, r] of [[-42, -32, 13], [42, -32, 13], [0, -14, 9]]) {
      ctx.save(); ctx.translate(gx, gy); ctx.rotate(t * 1.4 * Math.sign(gx || 1));
      ctx.strokeStyle = a; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.stroke();
      for (let i = 0; i < 6; i++) { const ang = i / 6 * TAU; ctx.beginPath(); ctx.moveTo(Math.cos(ang) * r, Math.sin(ang) * r); ctx.lineTo(Math.cos(ang) * (r + 4), Math.sin(ang) * (r + 4)); ctx.stroke(); }
      ctx.restore();
    }
    // martillo
    ctx.strokeStyle = '#6d5240'; ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(38, -32); ctx.lineTo(58, -58); ctx.stroke();
    ctx.fillStyle = '#4b3b32'; rr(ctx, 50, -74, 24, 18, 3); ctx.fill();
    glow(ctx, 62, -65, 16, a, .2);
  } else if (shape === 'vael') {
    const c = type.color, a = type.accent;
    ctx.translate(0, bob);
    // alas del velo
    for (let side of [-1, 1]) {
      ctx.save(); ctx.scale(side, 1);
      ctx.fillStyle = rgba(a, .1); ctx.strokeStyle = rgba(a, .35); ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(10, -50); ctx.bezierCurveTo(42, -94, 76, -70, 58, -30); ctx.bezierCurveTo(48, -48, 30, -48, 12, -30); ctx.fill(); ctx.stroke();
      for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(18, -44); ctx.quadraticCurveTo(36 + i * 6, -62 - i * 4, 48 + i * 4, -42 + i * 4); ctx.stroke(); }
      ctx.restore();
    }
    ctx.fillStyle = '#1d1b30'; ctx.beginPath(); ctx.moveTo(-24, -10); ctx.lineTo(-16, -60); ctx.quadraticCurveTo(0, -78, 16, -60); ctx.lineTo(24, -10); ctx.closePath(); ctx.fill();
    ctx.fillStyle = c; ctx.beginPath(); ctx.moveTo(-18, -12); ctx.lineTo(-12, -56); ctx.quadraticCurveTo(0, -68, 12, -56); ctx.lineTo(18, -12); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = rgba(a, .5); ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, -62); ctx.lineTo(0, -12); ctx.moveTo(-12, -42); ctx.lineTo(12, -42); ctx.stroke();
    ellipse(ctx, 0, -68, 12, 14, '#d9c6b3');
    ctx.fillStyle = '#ece4d3'; ctx.beginPath(); ctx.arc(0, -72, 12, Math.PI, 0); ctx.fill();
    ellipse(ctx, -4, -66, 1.6, 2, '#302a3f'); ellipse(ctx, 4, -66, 1.6, 2, '#302a3f');
    glow(ctx, 0, -66, 9, a, .2);
    // espada celestial
    drawSword(ctx, { shape: 3, color: '#e9d7a1', blade: '#fffbe7' }, 25, -40, -.3, 1.5, true);
    glow(ctx, 0, -30, 40, a, .12);
  }
  if (hurt > 0) {
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = `rgba(255,255,255,${hurt * .45})`;
    ctx.beginPath(); ctx.ellipse(0, -25, 24, 36, 0, 0, TAU); ctx.fill();
  }
  ctx.restore();
}

// ============================================================
// RETRATOS
// ============================================================
export function drawPortrait(canvas, appearance, t = 0, npc = null) {
  const ctx = canvas.getContext('2d');
  const w = canvas.width, h = canvas.height;
  ctx.clearRect(0, 0, w, h);
  const skin = npc?.color || appearance.skin || '#e2b58e';
  const hairColor = npc?.hair || appearance.hairColor || '#3b2417';
  const robe = npc?.robe || appearance.armorColor || '#d7c7a4';
  const trim = npc?.accent || appearance.trim || '#c9a65a';
  const hairStyle = npc?.hairStyle ?? appearance.hair ?? 0;
  const helmet = npc?.helmet ?? appearance.helmet ?? 0;
  const accessory = npc?.accessory ?? appearance.accessory ?? 0;
  ctx.save();
  ctx.translate(w / 2, h * .56);
  ctx.scale(w / 112, w / 112);
  // fondo halo
  const bg = ctx.createRadialGradient(0, -25, 5, 0, -20, 58);
  bg.addColorStop(0, rgba(trim, .15));
  bg.addColorStop(1, 'rgba(7,11,20,0)');
  ctx.fillStyle = bg; ctx.beginPath(); ctx.arc(0, -15, 62, 0, TAU); ctx.fill();
  // hombros
  ctx.fillStyle = robe;
  ctx.beginPath(); ctx.moveTo(-38, 54); ctx.quadraticCurveTo(-40, 22, -23, 12); ctx.lineTo(23, 12); ctx.quadraticCurveTo(40, 22, 38, 54); ctx.closePath(); ctx.fill();
  ctx.fillStyle = shade(robe, .15); ctx.beginPath(); ctx.moveTo(-25, 14); ctx.quadraticCurveTo(0, 30, 25, 14); ctx.lineTo(15, 30); ctx.quadraticCurveTo(0, 38, -15, 30); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = rgba(trim, .6); ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(-24, 18); ctx.quadraticCurveTo(0, 34, 24, 18); ctx.stroke();
  // cuello
  ctx.fillStyle = shade(skin, -.12); rr(ctx, -8, 0, 16, 18, 4); ctx.fill();
  // cara
  const face = ctx.createLinearGradient(-20, -30, 20, 20);
  face.addColorStop(0, shade(skin, .12)); face.addColorStop(1, shade(skin, -.1));
  ctx.fillStyle = face; ellipse(ctx, 0, -20, 24, 28, face);
  // orejas
  ellipse(ctx, -23, -16, 4, 7, shade(skin, -.05)); ellipse(ctx, 23, -16, 4, 7, shade(skin, -.05));
  // sombra de pelo
  ctx.fillStyle = rgba('#000000', .08); ellipse(ctx, 0, -38, 22, 9, rgba('#000000', .08));
  // ojos
  const eyeY = -18;
  ctx.fillStyle = '#2b2a35';
  ctx.beginPath(); ctx.ellipse(-9, eyeY, 3.2, 4.5, 0, 0, TAU); ctx.fill();
  ctx.beginPath(); ctx.ellipse(9, eyeY, 3.2, 4.5, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = appearance.eyeColor || '#58748c';
  ctx.beginPath(); ctx.arc(-9, eyeY, 1.8, 0, TAU); ctx.fill();
  ctx.beginPath(); ctx.arc(9, eyeY, 1.8, 0, TAU); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,.75)';
  ctx.beginPath(); ctx.arc(-10, eyeY - 1.5, .8, 0, TAU); ctx.fill();
  ctx.beginPath(); ctx.arc(8, eyeY - 1.5, .8, 0, TAU); ctx.fill();
  // cejas
  ctx.strokeStyle = shade(hairColor, .1); ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.moveTo(-13, -25); ctx.quadraticCurveTo(-9, -27, -5, -25); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(5, -25); ctx.quadraticCurveTo(9, -27, 13, -25); ctx.stroke();
  // nariz y boca
  ctx.strokeStyle = rgba('#7a4a3b', .45); ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(0, -12); ctx.lineTo(-1, -7); ctx.stroke();
  ctx.strokeStyle = 'rgba(120,55,50,.65)'; ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.arc(0, -1, 4.2, .25, Math.PI - .25); ctx.stroke();
  // pelo
  drawPortraitHair(ctx, hairStyle, hairColor, -20);
  // casco
  if (helmet === 1) {
    ctx.fillStyle = '#d9c38b'; ctx.beginPath(); ctx.arc(0, -27, 23, Math.PI, 0); ctx.fill();
    ctx.fillStyle = '#f3e6bc'; polygon(ctx, [[0, -62], [10, -47], [0, -38], [-10, -47]], '#f3e6bc');
    ctx.strokeStyle = '#8c6a2d'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(0, -27, 23, Math.PI, 0); ctx.stroke();
  } else if (helmet === 2) {
    ctx.fillStyle = '#2e2a35'; ctx.beginPath(); ctx.arc(0, -25, 24, Math.PI, 0); ctx.fill();
    polygon(ctx, [[-24, -25], [-38, -40], [-30, -10]], '#2e2a35');
    polygon(ctx, [[24, -25], [38, -40], [30, -10]], '#2e2a35');
    ctx.fillStyle = '#b9a7d8'; ellipse(ctx, 0, -43, 3, 3, '#b9a7d8');
  }
  if (accessory === 1) {
    ctx.strokeStyle = 'rgba(255,232,160,.8)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.ellipse(0, -50, 25, 7, 0, 0, TAU); ctx.stroke();
    glow(ctx, 0, -52, 22, '#ffe8a0', .16);
  } else if (accessory === 2) {
    ctx.fillStyle = '#8a4a3f'; ctx.beginPath(); ctx.moveTo(-22, 10); ctx.quadraticCurveTo(-8, 28, 20, 10); ctx.lineTo(26, 20); ctx.quadraticCurveTo(0, 42, -28, 20); ctx.closePath(); ctx.fill();
  } else if (accessory === 3) {
    ctx.strokeStyle = 'rgba(150,80,60,.6)'; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(12, -30); ctx.lineTo(16, -20); ctx.stroke();
  }
  ctx.restore();
  // brillo de ojos
  const gl = ctx.createLinearGradient(0, 0, w, h);
  gl.addColorStop(0, 'rgba(255,255,255,.04)'); gl.addColorStop(.5, 'rgba(255,255,255,0)');
  ctx.fillStyle = gl; ctx.fillRect(0, 0, w, h);
}

function drawPortraitHair(ctx, style, color, headY) {
  ctx.fillStyle = color;
  if (style === 0) {
    ctx.beginPath(); ctx.arc(0, headY - 1, 25, Math.PI * 1.03, Math.PI * 1.97);
    ctx.quadraticCurveTo(18, headY - 14, 15, headY + 1);
    ctx.lineTo(9, headY - 13); ctx.lineTo(4, headY - 5); ctx.lineTo(-2, headY - 15); ctx.lineTo(-8, headY - 4); ctx.lineTo(-14, headY - 14); ctx.quadraticCurveTo(-22, headY - 2, -25, headY); ctx.closePath(); ctx.fill();
  } else if (style === 1) {
    ctx.beginPath(); ctx.arc(0, headY - 1, 26, Math.PI * 1.02, Math.PI * 1.98);
    ctx.lineTo(27, headY + 36); ctx.quadraticCurveTo(18, headY + 20, 17, headY + 4);
    ctx.lineTo(11, headY - 10); ctx.lineTo(5, headY + 2); ctx.lineTo(-1, headY - 12); ctx.lineTo(-9, headY + 4);
    ctx.quadraticCurveTo(-16, headY + 22, -25, headY + 40); ctx.closePath(); ctx.fill();
    ctx.fillStyle = rgba('#ffffff', .08); ellipse(ctx, -10, headY - 12, 8, 6, rgba('#ffffff', .08));
  } else if (style === 2) {
    ctx.beginPath(); ctx.arc(0, headY - 1, 25, Math.PI * 1.03, Math.PI * 1.97);
    ctx.quadraticCurveTo(23, headY + 3, 18, headY + 2);
    ctx.lineTo(7, headY - 12); ctx.lineTo(2, headY - 2); ctx.lineTo(-4, headY - 14); ctx.lineTo(-12, headY + 2);
    ctx.quadraticCurveTo(-20, headY + 6, -24, headY); ctx.closePath(); ctx.fill();
    for (let i = 0; i < 6; i++) ellipse(ctx, 25 - i * .4, headY + 15 + i * 6, 4.5 - i * .35, 5 - i * .3, i % 2 ? color : shade(color, .14));
  } else {
    for (let i = 0; i < 7; i++) {
      const a = Math.PI * 1.02 + i * .31;
      ellipse(ctx, Math.cos(a) * 23, headY - 1 + Math.sin(a) * 20, 9, 7, color);
    }
    ctx.beginPath(); ctx.arc(0, headY - 2, 23, Math.PI, 0); ctx.fill();
  }
}

// ============================================================
// EFECTOS
// ============================================================
export function drawSlash(ctx, x, y, angle, progress, color = '#ffe7ad', range = 68) {
  const a0 = angle - .9, a1 = angle + .9;
  const p = clamp(progress, 0, 1);
  ctx.save();
  ctx.translate(x, y - 28);
  ctx.rotate(0);
  const alpha = Math.sin(p * Math.PI);
  ctx.strokeStyle = rgba(color, alpha * .85);
  ctx.lineWidth = 12 * (1 - p * .5);
  ctx.lineCap = 'round';
  ctx.beginPath(); ctx.arc(0, 0, range, a0 + p * .4, a1 - .3 + p * .4); ctx.stroke();
  ctx.strokeStyle = rgba('#ffffff', alpha * .65);
  ctx.lineWidth = 2.5;
  ctx.beginPath(); ctx.arc(0, 0, range, a0 + p * .4, a1 - .3 + p * .4); ctx.stroke();
  ctx.restore();
}

export function drawRing(ctx, x, y, r, color, alpha = 1, width = 2) {
  ctx.save(); ctx.strokeStyle = rgba(color, alpha); ctx.lineWidth = width;
  ctx.beginPath(); ctx.arc(x, y, Math.max(1, r), 0, TAU); ctx.stroke(); ctx.restore();
}
