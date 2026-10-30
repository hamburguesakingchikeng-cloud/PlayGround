// ============================================================
// Terreno, arquitectura y objetos del mundo
// ============================================================
import { TILE_INFO, ZONES, AFFINITIES } from './data.js';
import { rgba, shade, clamp, roundRect } from './art.js';

export const TS = 48;
const TAU = Math.PI * 2;
function hash(x, y, s = 0) {
  let h = x * 374761393 + y * 668265263 + s * 1442695040;
  h = (h ^ (h >>> 13)) * 1274126177;
  return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
}

function paintTile(ctx, tile, tx, ty, seed) {
  const x = tx * TS, y = ty * TS;
  const info = TILE_INFO[tile] || TILE_INFO.grass;
  const v = hash(tx, ty, seed);
  const v2 = hash(tx + 9, ty + 3, seed);
  ctx.fillStyle = info.base;
  ctx.fillRect(x, y, TS, TS);
  switch (tile) {
    case 'grass': {
      ctx.fillStyle = info.alt;
      ctx.globalAlpha = .35 + v * .25;
      ctx.beginPath(); ctx.ellipse(x + 10 + v * 28, y + 9 + v2 * 28, 9 + v * 8, 6 + v2 * 5, v * 3, 0, TAU); ctx.fill();
      ctx.globalAlpha = 1;
      ctx.strokeStyle = 'rgba(120,175,120,.5)'; ctx.lineWidth = 1;
      for (let i = 0; i < 4; i++) {
        const gx = x + 5 + hash(tx + i, ty, seed) * 38, gy = y + 8 + hash(tx, ty + i, seed) * 34;
        ctx.beginPath(); ctx.moveTo(gx, gy + 4); ctx.lineTo(gx + (v - .5) * 2, gy - 3 - v * 3); ctx.stroke();
      }
      if (v > .88) { ctx.fillStyle = '#e8d8a8'; ctx.beginPath(); ctx.arc(x + 14 + v2 * 20, y + 12 + v * 22, 1.6, 0, TAU); ctx.fill(); }
      if (v2 > .93) { ctx.fillStyle = '#d6b6e8'; ctx.beginPath(); ctx.arc(x + 30, y + 30, 2, 0, TAU); ctx.fill(); }
      break;
    }
    case 'flower': {
      ctx.fillStyle = info.alt; ctx.globalAlpha = .3; ctx.beginPath(); ctx.ellipse(x + 22, y + 22, 18, 12, 0, 0, TAU); ctx.fill(); ctx.globalAlpha = 1;
      const cols = ['#f2d7f5', '#ffe7a8', '#cfe5ff', '#ffc8d8'];
      for (let i = 0; i < 3; i++) {
        const fx = x + 8 + hash(tx + i, ty + 2, seed) * 32, fy = y + 8 + hash(tx + 2, ty + i, seed) * 32;
        ctx.fillStyle = cols[(tx + ty + i) % cols.length];
        for (let p = 0; p < 4; p++) { const a = p / 4 * TAU; ctx.beginPath(); ctx.arc(fx + Math.cos(a) * 2.2, fy + Math.sin(a) * 2.2, 1.7, 0, TAU); ctx.fill(); }
        ctx.fillStyle = '#ffe9a8'; ctx.beginPath(); ctx.arc(fx, fy, 1, 0, TAU); ctx.fill();
      }
      break;
    }
    case 'path': {
      ctx.fillStyle = info.alt; ctx.globalAlpha = .5;
      ctx.beginPath(); ctx.ellipse(x + 18 + v * 12, y + 20 + v2 * 10, 12, 7, v, 0, TAU); ctx.fill(); ctx.globalAlpha = 1;
      ctx.fillStyle = info.accent;
      for (let i = 0; i < 3; i++) {
        const px = x + 6 + hash(tx + i, ty, seed) * 36, py = y + 6 + hash(tx, ty + i, seed) * 36;
        ctx.globalAlpha = .35 + v * .3; ctx.beginPath(); ctx.ellipse(px, py, 1.2 + v * 1.6, .8 + v, v * 2, 0, TAU); ctx.fill();
      }
      ctx.globalAlpha = 1;
      break;
    }
    case 'stone': {
      ctx.strokeStyle = 'rgba(25,29,40,.35)'; ctx.lineWidth = 1;
      ctx.strokeRect(x + .5, y + .5, TS - 1, TS - 1);
      if (v > .5) { ctx.beginPath(); ctx.moveTo(x + 4, y + 16 + v2 * 20); ctx.lineTo(x + 18, y + 14 + v2 * 18); ctx.lineTo(x + 24, y + 25 + v * 10); ctx.stroke(); }
      ctx.fillStyle = 'rgba(255,255,255,.035)'; ctx.fillRect(x + 2, y + 2, TS - 4, 6 + v * 8);
      break;
    }
    case 'wood': {
      ctx.strokeStyle = 'rgba(30,18,10,.35)'; ctx.lineWidth = 1;
      for (let i = 1; i < 4; i++) { ctx.beginPath(); ctx.moveTo(x, y + i * 12); ctx.lineTo(x + TS, y + i * 12); ctx.stroke(); }
      ctx.fillStyle = 'rgba(255,220,160,.06)'; ctx.fillRect(x + 2, y + 2, TS - 4, 2);
      break;
    }
    case 'water': {
      const g = ctx.createLinearGradient(x, y, x, y + TS);
      g.addColorStop(0, info.base); g.addColorStop(.55, info.alt); g.addColorStop(1, shade(info.base, -12));
      ctx.fillStyle = g; ctx.fillRect(x, y, TS, TS);
      ctx.strokeStyle = 'rgba(160,230,255,.2)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(x + 4, y + 14 + v * 10); ctx.quadraticCurveTo(x + 16, y + 8 + v * 10, x + 30, y + 15 + v * 10); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x + 20, y + 34 + v2 * 5); ctx.quadraticCurveTo(x + 32, y + 28, x + 44, y + 35); ctx.stroke();
      break;
    }
    case 'lava': {
      const g = ctx.createLinearGradient(x, y, x + TS, y + TS);
      g.addColorStop(0, '#822417'); g.addColorStop(.5, '#b63a1c'); g.addColorStop(1, '#651a13');
      ctx.fillStyle = g; ctx.fillRect(x, y, TS, TS);
      ctx.strokeStyle = 'rgba(255,196,90,.65)'; ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.moveTo(x + 2, y + 10 + v * 20); ctx.lineTo(x + 14, y + 16 + v2 * 16); ctx.lineTo(x + 24, y + 30 + v * 8); ctx.stroke();
      ctx.fillStyle = 'rgba(255,220,140,.5)'; ctx.beginPath(); ctx.arc(x + 35, y + 20 + v * 12, 2.2, 0, TAU); ctx.fill();
      break;
    }
    case 'wall': {
      ctx.fillStyle = '#303747'; ctx.fillRect(x, y, TS, TS);
      ctx.strokeStyle = 'rgba(10,14,24,.5)'; ctx.lineWidth = 1;
      const off = (ty % 2) * 12;
      for (let r = 0; r < 4; r++) {
        ctx.beginPath(); ctx.moveTo(x, y + r * 12); ctx.lineTo(x + TS, y + r * 12); ctx.stroke();
        for (let c = 0; c < 2; c++) { const bx = x + ((c * 24 + off) % TS); ctx.beginPath(); ctx.moveTo(bx, y + r * 12); ctx.lineTo(bx, y + r * 12 + 12); ctx.stroke(); }
      }
      ctx.fillStyle = 'rgba(255,255,255,.05)'; ctx.fillRect(x + 2, y + 2, TS - 4, 4);
      break;
    }
    case 'tree': {
      paintTile(ctx, 'grass', tx, ty, seed);
      break;
    }
    case 'ruin': {
      ctx.fillStyle = info.base; ctx.fillRect(x, y, TS, TS);
      ctx.strokeStyle = 'rgba(25,28,38,.45)'; ctx.lineWidth = 1;
      for (let r = 0; r < 3; r++) {
        ctx.beginPath(); ctx.moveTo(x, y + r * 16 + 4); ctx.lineTo(x + TS, y + r * 16 + 4); ctx.stroke();
        const off = (r % 2) * 14;
        for (let c = 0; c < 2; c++) { const bx = x + (c * 24 + off + 8) % TS; ctx.beginPath(); ctx.moveTo(bx, y + r * 16 + 4); ctx.lineTo(bx, y + r * 16 + 20); ctx.stroke(); }
      }
      ctx.fillStyle = 'rgba(255,255,255,.05)'; ctx.fillRect(x + 2, y + 2, TS - 4, 3);
      if (v > .8) { ctx.strokeStyle = 'rgba(150,120,60,.25)'; ctx.beginPath(); ctx.moveTo(x + 8, y + 6); ctx.lineTo(x + 16, y + 22); ctx.lineTo(x + 10, y + 34); ctx.stroke(); }
      break;
    }
    case 'crystal': {
      paintTile(ctx, 'stone', tx, ty, seed);
      break;
    }
    case 'void': {
      ctx.fillStyle = '#070b15'; ctx.fillRect(x, y, TS, TS);
      if (v > .55) { ctx.fillStyle = `rgba(190,210,255,${.2 + v * .35})`; ctx.beginPath(); ctx.arc(x + 8 + v * 32, y + 8 + v2 * 32, .8 + v, 0, TAU); ctx.fill(); }
      break;
    }
    case 'bridge': {
      ctx.fillStyle = info.base; ctx.fillRect(x, y, TS, TS);
      ctx.strokeStyle = 'rgba(50,32,18,.45)'; ctx.lineWidth = 1;
      for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(x, y + i * 12); ctx.lineTo(x + TS, y + i * 12); ctx.stroke(); }
      ctx.strokeStyle = 'rgba(255,220,160,.12)'; ctx.beginPath(); ctx.moveTo(x + 8, y); ctx.lineTo(x + 8, y + TS); ctx.moveTo(x + 40, y); ctx.lineTo(x + 40, y + TS); ctx.stroke();
      break;
    }
    case 'ash': {
      ctx.fillStyle = info.alt; ctx.globalAlpha = .35; ctx.beginPath(); ctx.ellipse(x + 20, y + 20, 16, 10, 0, 0, TAU); ctx.fill(); ctx.globalAlpha = 1;
      ctx.fillStyle = 'rgba(220,210,220,.28)';
      for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.arc(x + 6 + hash(tx + i, ty, seed) * 36, y + 6 + hash(tx, ty + i, seed) * 36, .7 + v * .8, 0, TAU); ctx.fill(); }
      break;
    }
    case 'snow': {
      ctx.fillStyle = info.alt; ctx.globalAlpha = .6; ctx.beginPath(); ctx.ellipse(x + 16, y + 18, 14, 9, 0, 0, TAU); ctx.fill(); ctx.globalAlpha = 1;
      ctx.fillStyle = 'rgba(255,255,255,.5)'; for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(x + 8 + v * 32, y + 10 + v2 * 30, 1, 0, TAU); ctx.fill(); }
      break;
    }
    case 'sand': {
      ctx.fillStyle = info.alt; ctx.globalAlpha = .3; ctx.beginPath(); ctx.ellipse(x + 18, y + 22, 20, 12, 0, 0, TAU); ctx.fill(); ctx.globalAlpha = 1;
      ctx.fillStyle = 'rgba(255,240,200,.25)'; for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(x + 6 + hash(tx + i, ty, seed) * 38, y + 6 + hash(tx, ty + i, seed) * 38, .8, 0, TAU); ctx.fill(); }
      break;
    }
  }
}

export function buildGround(zone) {
  const c = document.createElement('canvas');
  c.width = zone.width * TS; c.height = zone.height * TS;
  const ctx = c.getContext('2d');
  // base
  ctx.fillStyle = TILE_INFO[zone.tiles[0]?.[0]]?.base || '#202a35';
  ctx.fillRect(0, 0, c.width, c.height);
  for (let y = 0; y < zone.height; y++) for (let x = 0; x < zone.width; x++) paintTile(ctx, zone.tiles[y][x], x, y, zone.seed);
  // sombras de bordes para dar profundidad
  ctx.globalCompositeOperation = 'multiply';
  const g = ctx.createLinearGradient(0, 0, 0, c.height);
  g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(.45, 'rgba(215,215,225,1)'); g.addColorStop(1, 'rgba(165,165,180,1)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, c.width, c.height);
  ctx.globalCompositeOperation = 'source-over';
  return c;
}

export function waterTiles(zone) {
  const list = [];
  for (let y = 0; y < zone.height; y++) for (let x = 0; x < zone.width; x++) if (zone.tiles[y][x] === 'water' || zone.tiles[y][x] === 'lava') list.push([x, y, zone.tiles[y][x]]);
  return list;
}

export function staticDrawables(zone) {
  const list = [];
  for (let y = 0; y < zone.height; y++) for (let x = 0; x < zone.width; x++) {
    const t = zone.tiles[y][x];
    if (t === 'tree') list.push({ kind: 'tree', x, y, sort: (y + 1) * TS + hash(x, y, 3) * 4 });
    else if (t === 'crystal') list.push({ kind: 'crystal', x, y, sort: (y + .9) * TS, seed: hash(x, y, 9) });
  }
  for (const b of zone.buildings || []) list.push({ kind: 'building', ref: b, sort: (b.y + b.h) * TS });
  for (const s of zone.shrines || []) list.push({ kind: 'shrine', ref: s, sort: s.y * TS + 20 });
  for (const ch of zone.chests || []) list.push({ kind: 'chest', ref: ch, sort: ch.y * TS + 14 });
  for (const o of zone.obstacles || []) list.push({ kind: 'obstacle', ref: o, sort: o.y * TS + 18 });
  for (const r of zone.runes || []) list.push({ kind: 'rune', ref: r, sort: r.y * TS + 16 });
  for (const b of zone.braziers || []) list.push({ kind: 'brazier', ref: b, sort: b.y * TS + 16 });
  if (zone.altar) list.push({ kind: 'altar', ref: zone.altar, sort: zone.altar.y * TS + 24 });
  for (const s of zone.signs || []) list.push({ kind: 'sign', ref: s, sort: s.y * TS + 10 });
  for (const p of zone.portals || []) list.push({ kind: 'portal', ref: p, sort: (p.y + p.h) * TS });
  return list;
}

export function drawTree(ctx, d, t, zone) {
  const x = (d.x + .5) * TS, y = (d.y + 1) * TS;
  const v = hash(d.x, d.y, 13);
  const ash = zone.id === 'cumbre';
  const golden = zone.id === 'bosque';
  const sway = Math.sin(t * .7 + v * 6) * 1.4;
  ctx.save(); ctx.translate(x, y);
  ctx.fillStyle = 'rgba(0,0,0,.3)';
  ctx.beginPath(); ctx.ellipse(0, -2, 18 + v * 5, 6, 0, 0, TAU); ctx.fill();
  // tronco
  const trunk = ash ? '#4a3b35' : '#5b422c';
  ctx.fillStyle = trunk;
  ctx.beginPath(); ctx.moveTo(-4, 0); ctx.lineTo(-3, -26 - v * 8); ctx.lineTo(4, -26 - v * 8); ctx.lineTo(5, 0); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(20,15,10,.35)'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(0, -2); ctx.lineTo(1, -28); ctx.stroke();
  // copa
  const base = ash ? '#57464b' : golden ? '#2f684d' : '#295c44';
  const lit = ash ? '#77636a' : golden ? '#4c8a5f' : '#3f7a52';
  const dark = ash ? '#3a2f37' : '#1c4534';
  ctx.translate(sway, 0);
  const blobs = [[-11, -39, 14], [9, -41, 15], [0, -53, 17], [-2, -33, 14], [15, -30, 11], [-16, -29, 10]];
  for (const [bx, by, r] of blobs) {
    ctx.fillStyle = dark; ctx.beginPath(); ctx.arc(bx + 2, by + 3, r, 0, TAU); ctx.fill();
  }
  for (const [bx, by, r] of blobs) {
    const g = ctx.createRadialGradient(bx - r * .3, by - r * .4, 1, bx, by, r);
    g.addColorStop(0, lit); g.addColorStop(.55, base); g.addColorStop(1, dark);
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(bx, by, r, 0, TAU); ctx.fill();
  }
  // hojas / luces
  if (golden && v > .5) {
    ctx.fillStyle = 'rgba(255,230,160,.6)';
    for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(-14 + hash(d.x + i, d.y, 4) * 30, -50 + hash(d.x, d.y + i, 5) * 22, 1.4, 0, TAU); ctx.fill(); }
  }
  if (ash) {
    ctx.strokeStyle = 'rgba(255,120,70,.25)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(-12, -37); ctx.lineTo(-4, -30); ctx.stroke();
  }
  ctx.restore();
}

export function drawCrystal(ctx, d, t) {
  const x = (d.x + .5) * TS, y = (d.y + .9) * TS;
  const pulse = .6 + .4 * Math.sin(t * 2 + d.seed * 9);
  ctx.save(); ctx.translate(x, y);
  ctx.fillStyle = 'rgba(0,0,0,.3)'; ctx.beginPath(); ctx.ellipse(0, 0, 15, 5, 0, 0, TAU); ctx.fill();
  ctx.globalCompositeOperation = 'lighter';
  const g = ctx.createRadialGradient(0, -24, 1, 0, -24, 34);
  g.addColorStop(0, `rgba(160,150,255,${.24 * pulse})`); g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g; ctx.fillRect(-40, -70, 80, 80);
  ctx.globalCompositeOperation = 'source-over';
  const cg = ctx.createLinearGradient(0, -52, 0, 0);
  cg.addColorStop(0, '#d8d2ff'); cg.addColorStop(.5, '#8880e0'); cg.addColorStop(1, '#3c3a72');
  ctx.fillStyle = cg;
  ctx.beginPath(); ctx.moveTo(0, -50); ctx.lineTo(12, -22); ctx.lineTo(7, 0); ctx.lineTo(-7, 0); ctx.lineTo(-12, -22); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(230,225,255,.6)'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(0, -48); ctx.lineTo(0, -2); ctx.moveTo(-10, -22); ctx.lineTo(7, -26); ctx.stroke();
  ctx.restore();
}

export function drawObject(ctx, d, t, game) {
  if (d.kind === 'tree') return drawTree(ctx, d, t, game.zone);
  if (d.kind === 'crystal') return drawCrystal(ctx, d, t);
  if (d.kind === 'building') return drawBuilding(ctx, d.ref, t, game.zone);
  if (d.kind === 'shrine') return drawShrine(ctx, d.ref, t, game);
  if (d.kind === 'chest') return drawChest(ctx, d.ref, t);
  if (d.kind === 'obstacle') return drawObstacle(ctx, d.ref, t);
  if (d.kind === 'rune') return drawRune(ctx, d.ref, t);
  if (d.kind === 'brazier') return drawBrazier(ctx, d.ref, t);
  if (d.kind === 'altar') return drawAltar(ctx, d.ref, t, game);
  if (d.kind === 'sign') return drawSign(ctx, d.ref, t);
  if (d.kind === 'portal') return drawPortal(ctx, d.ref, t, game);
}

function drawBuilding(ctx, b, t, zone) {
  const x = b.x * TS, y = b.y * TS, w = b.w * TS, h = b.h * TS;
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,.32)'; ctx.beginPath(); ctx.ellipse(x + w / 2, y + h - 2, w * .52, 11, 0, 0, TAU); ctx.fill();
  // pared
  const wall = b.type === 'shop' ? '#8a7458' : b.type === 'smith' ? '#76604f' : '#c5af8d';
  const wallDark = shade(wall, -38);
  ctx.fillStyle = wallDark; ctx.fillRect(x + 5, y + h - 50, w - 10, 48);
  ctx.fillStyle = wall; ctx.fillRect(x + 7, y + h - 52, w - 14, 42);
  // vigas
  ctx.fillStyle = 'rgba(70,45,28,.55)';
  ctx.fillRect(x + 7, y + h - 52, 4, 42); ctx.fillRect(x + w - 11, y + h - 52, 4, 42);
  ctx.fillRect(x + w / 2 - 2, y + h - 52, 4, 42);
  // ventanas
  for (const wx of [x + w * .25, x + w * .7]) {
    ctx.fillStyle = 'rgba(255,205,120,.65)'; ctx.fillRect(wx - 7, y + h - 40, 14, 13);
    ctx.strokeStyle = 'rgba(70,45,28,.7)'; ctx.lineWidth = 1; ctx.strokeRect(wx - 7, y + h - 40, 14, 13);
  }
  // puerta
  ctx.fillStyle = '#5b3d28'; ctx.beginPath(); ctx.moveTo(x + w / 2 - 13, y + h); ctx.lineTo(x + w / 2 - 13, y + h - 24); ctx.quadraticCurveTo(x + w / 2, y + h - 36, x + w / 2 + 13, y + h - 24); ctx.lineTo(x + w / 2 + 13, y + h); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#d8af61'; ctx.beginPath(); ctx.arc(x + w / 2 + 7, y + h - 12, 1.8, 0, TAU); ctx.fill();
  // tejado a dos aguas
  const ry = y + h - 54;
  const roofG = ctx.createLinearGradient(x, ry - 50, x + w, ry);
  roofG.addColorStop(0, shade(b.roof, 28)); roofG.addColorStop(.55, b.roof); roofG.addColorStop(1, shade(b.roof, -35));
  ctx.fillStyle = roofG;
  ctx.beginPath(); ctx.moveTo(x - 8, ry); ctx.lineTo(x + w / 2, ry - 53); ctx.lineTo(x + w + 8, ry); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(255,235,190,.15)'; ctx.lineWidth = 1;
  for (let i = 1; i < 5; i++) { ctx.beginPath(); ctx.moveTo(x + (w + 8) * i / 5, ry - 8); ctx.lineTo(x + (w + 8) * i / 5, ry); ctx.stroke(); }
  ctx.fillStyle = 'rgba(30,20,30,.35)'; ctx.fillRect(x - 8, ry, w + 16, 4);
  // chimenea
  ctx.fillStyle = '#6b4a3a'; ctx.fillRect(x + w - 26, ry - 45, 11, 20);
  const smoke = Math.sin(t + b.x) * 3;
  ctx.fillStyle = 'rgba(210,215,225,.1)';
  ctx.beginPath(); ctx.arc(x + w - 20 + smoke, ry - 56, 6, 0, TAU); ctx.arc(x + w - 16 - smoke, ry - 68, 8, 0, TAU); ctx.fill();
  // letrero
  if (b.type === 'shop' || b.type === 'smith') {
    ctx.fillStyle = '#3a2a1c'; ctx.fillRect(x + w / 2 - 22, y + h - 32, 44, 1);
    ctx.fillStyle = b.type === 'shop' ? '#d8af61' : '#e87854';
    ctx.beginPath(); ctx.arc(x + w / 2, y + h - 30, 5, 0, TAU); ctx.fill();
  }
  ctx.restore();
}

function drawShrine(ctx, s, t, game) {
  const x = s.x * 48, y = s.y * 48;
  const active = s.active;
  ctx.save(); ctx.translate(x, y);
  ctx.fillStyle = 'rgba(0,0,0,.3)'; ctx.beginPath(); ctx.ellipse(0, 2, 26, 8, 0, 0, TAU); ctx.fill();
  // plataforma
  ctx.fillStyle = '#4d5668'; ctx.beginPath(); ctx.ellipse(0, 0, 25, 10, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = '#626d82'; ctx.beginPath(); ctx.ellipse(0, -2, 22, 8, 0, 0, TAU); ctx.fill();
  ctx.strokeStyle = 'rgba(232,196,119,.55)'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.ellipse(0, -2, 15, 5.4, 0, 0, TAU); ctx.stroke();
  // obelisco
  ctx.fillStyle = '#3d4556'; ctx.beginPath(); ctx.moveTo(-7, -3); ctx.lineTo(-5, -36); ctx.lineTo(5, -36); ctx.lineTo(7, -3); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,.1)'; ctx.beginPath(); ctx.moveTo(0, -36); ctx.lineTo(0, -4); ctx.stroke();
  // cristal
  const pulse = .6 + .4 * Math.sin(t * 2.2);
  ctx.globalCompositeOperation = 'lighter';
  const g = ctx.createRadialGradient(0, -43, 1, 0, -43, 34);
  g.addColorStop(0, `rgba(130,215,255,${.24 * pulse})`); g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g; ctx.fillRect(-40, -80, 80, 80);
  ctx.globalCompositeOperation = 'source-over';
  ctx.fillStyle = `rgba(185,240,255,${.8 + pulse * .2})`;
  ctx.beginPath(); ctx.moveTo(0, -58); ctx.lineTo(7, -43); ctx.lineTo(0, -31); ctx.lineTo(-7, -43); ctx.closePath(); ctx.fill();
  ctx.restore();
}

function drawChest(ctx, ch, t) {
  const x = ch.x * 48, y = ch.y * 48;
  ctx.save(); ctx.translate(x, y);
  ctx.fillStyle = 'rgba(0,0,0,.3)'; ctx.beginPath(); ctx.ellipse(0, 3, 15, 5, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = '#5b3d28'; roundRect(ctx, -13, -14, 26, 17, 3); ctx.fill();
  ctx.fillStyle = '#775036'; roundRect(ctx, -13, -21, 26, 10, 4); ctx.fill();
  if (ch.opened) { ctx.save(); ctx.translate(0, -20); ctx.rotate(-.8); ctx.fillStyle = '#775036'; roundRect(ctx, -13, -8, 26, 9, 4); ctx.fill(); ctx.restore(); }
  ctx.fillStyle = '#d8af61'; ctx.fillRect(-13, -12, 26, 2); ctx.fillRect(-2, -15, 4, 15);
  ctx.fillStyle = '#f0cf7d'; ctx.beginPath(); ctx.arc(0, -10, 3, 0, TAU); ctx.fill();
  if (!ch.opened) {
    const p = .5 + .5 * Math.sin(t * 2.6);
    ctx.globalCompositeOperation = 'lighter';
    const g = ctx.createRadialGradient(0, -20, 1, 0, -20, 22);
    g.addColorStop(0, `rgba(255,220,120,${.16 + p * .12})`); g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g; ctx.fillRect(-28, -48, 56, 56);
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = 'rgba(255,235,170,.8)'; ctx.beginPath(); ctx.arc(4 + Math.sin(t * 3) * 3, -30, 1.2, 0, TAU); ctx.fill();
  }
  ctx.restore();
}

function drawObstacle(ctx, o, t) {
  if (o.cleared) return;
  const x = o.x * 48, y = o.y * 48;
  ctx.save(); ctx.translate(x, y);
  ctx.fillStyle = 'rgba(0,0,0,.3)'; ctx.beginPath(); ctx.ellipse(0, 3, 22, 7, 0, 0, TAU); ctx.fill();
  if (o.type === 'bramble') {
    const glowc = o.required === 'fuego' ? 'rgba(255,110,60,.35)' : 'rgba(150,120,255,.3)';
    ctx.globalCompositeOperation = 'lighter'; const g = ctx.createRadialGradient(0, -16, 1, 0, -16, 30); g.addColorStop(0, glowc); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(-34, -50, 68, 68); ctx.globalCompositeOperation = 'source-over';
    ctx.strokeStyle = '#3d2a24'; ctx.lineWidth = 4; ctx.lineCap = 'round';
    for (let i = 0; i < 7; i++) {
      const a = i / 7 * TAU;
      ctx.beginPath(); ctx.moveTo(Math.cos(a) * 5, -10 + Math.sin(a) * 4); ctx.quadraticCurveTo(Math.cos(a) * 20, -30 + Math.sin(a) * 13, Math.cos(a) * 21, -4 + Math.sin(a) * 8); ctx.stroke();
    }
    ctx.strokeStyle = '#7a4a3a'; ctx.lineWidth = 2;
    for (let i = 0; i < 9; i++) {
      const a = i * 1.7 + .4, r = 8 + (i % 4) * 4;
      ctx.beginPath(); ctx.moveTo(Math.cos(a) * r, -12 + Math.sin(a) * r * .6); ctx.lineTo(Math.cos(a) * (r + 7), -12 + Math.sin(a) * (r + 7) * .6); ctx.stroke();
    }
    ctx.fillStyle = o.required === 'fuego' ? '#ff7d4a' : '#b899ff'; ctx.beginPath(); ctx.arc(0, -12, 3, 0, TAU); ctx.fill();
  } else if (o.type === 'boulder') {
    const g = ctx.createRadialGradient(-8, -24, 4, 0, -14, 28); g.addColorStop(0, '#8a8e9c'); g.addColorStop(1, '#3d414d');
    ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(0, -14, 23, 18, -.1, 0, TAU); ctx.fill();
    ctx.fillStyle = '#5f6472'; ctx.beginPath(); ctx.ellipse(-9, -8, 9, 6, .2, 0, TAU); ctx.fill();
    ctx.strokeStyle = 'rgba(30,32,40,.6)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(-8, -28); ctx.lineTo(1, -18); ctx.lineTo(-3, -8); ctx.stroke();
    ctx.fillStyle = 'rgba(200,220,255,.4)'; ctx.beginPath(); ctx.arc(13, -22, 2, 0, TAU); ctx.fill();
  } else if (o.type === 'iceblock') {
    ctx.globalAlpha = .9;
    const g = ctx.createLinearGradient(-20, -38, 20, 0); g.addColorStop(0, 'rgba(210,245,255,.9)'); g.addColorStop(.5, 'rgba(120,205,255,.75)'); g.addColorStop(1, 'rgba(55,130,190,.85)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(-20, -4); ctx.lineTo(-16, -34); ctx.lineTo(-4, -44); ctx.lineTo(16, -36); ctx.lineTo(20, -4); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(230,250,255,.7)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(-8, -38); ctx.lineTo(-2, -16); ctx.lineTo(-8, -6); ctx.moveTo(9, -34); ctx.lineTo(5, -18); ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.beginPath(); ctx.ellipse(-8, -32, 4, 6, -.3, 0, TAU); ctx.fill();
    ctx.globalAlpha = 1;
  } else if (o.type === 'gate') {
    ctx.fillStyle = '#3c4252'; ctx.fillRect(-24, -54, 8, 54); ctx.fillRect(16, -54, 8, 54);
    ctx.beginPath(); ctx.arc(0, -52, 26, Math.PI, 0); ctx.fill();
    ctx.fillStyle = '#4d5668'; ctx.fillRect(-24, -54, 48, 6);
    ctx.strokeStyle = o.cleared ? 'rgba(120,255,180,.4)' : 'rgba(180,140,255,.5)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(-10, -47); ctx.lineTo(-10, -8); ctx.moveTo(0, -47); ctx.lineTo(0, -8); ctx.moveTo(10, -47); ctx.lineTo(10, -8); ctx.stroke();
    if (!o.cleared) { ctx.globalCompositeOperation = 'lighter'; const g = ctx.createRadialGradient(0, -28, 2, 0, -28, 32); g.addColorStop(0, 'rgba(160,120,255,.2)'); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(-40, -70, 80, 80); ctx.globalCompositeOperation = 'source-over'; }
  }
  ctx.restore();
}

function drawRune(ctx, r, t) {
  const x = r.x * 48, y = r.y * 48;
  ctx.save(); ctx.translate(x, y);
  ctx.fillStyle = 'rgba(0,0,0,.3)'; ctx.beginPath(); ctx.ellipse(0, 2, 18, 6, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = '#4a5264'; ctx.beginPath(); ctx.ellipse(0, 0, 17, 7, 0, 0, TAU); ctx.fill();
  ctx.strokeStyle = r.lit ? 'rgba(255,225,140,.85)' : 'rgba(150,170,210,.4)'; ctx.lineWidth = 1.4;
  ctx.beginPath(); ctx.ellipse(0, 0, 12, 4.6, 0, 0, TAU); ctx.stroke();
  const float = Math.sin(t * 2 + r.x) * 2;
  ctx.translate(0, -20 + float);
  ctx.fillStyle = r.lit ? 'rgba(255,225,140,.95)' : 'rgba(160,180,220,.65)';
  ctx.beginPath(); ctx.moveTo(0, -14); ctx.lineTo(9, -4); ctx.lineTo(4, 12); ctx.lineTo(-4, 12); ctx.lineTo(-9, -4); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = r.lit ? '#fff6cf' : '#c3d0e8'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(0, -10); ctx.lineTo(0, 8); ctx.moveTo(-5, -3); ctx.lineTo(5, 3); ctx.stroke();
  if (r.lit) { ctx.globalCompositeOperation = 'lighter'; const g = ctx.createRadialGradient(0, 0, 1, 0, 0, 28); g.addColorStop(0, 'rgba(255,225,140,.3)'); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(-32, -32, 64, 64); }
  ctx.restore();
}

function drawBrazier(ctx, b, t) {
  const x = b.x * 48, y = b.y * 48;
  ctx.save(); ctx.translate(x, y);
  ctx.fillStyle = 'rgba(0,0,0,.3)'; ctx.beginPath(); ctx.ellipse(0, 2, 13, 5, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = '#4a3a2c'; ctx.fillRect(-2, -14, 4, 14);
  ctx.fillStyle = '#6b5540'; ctx.beginPath(); ctx.ellipse(0, -16, 12, 5, 0, 0, TAU); ctx.fill();
  if (b.lit) {
    const fl = Math.sin(t * 9) * 2;
    ctx.globalCompositeOperation = 'lighter';
    const g = ctx.createRadialGradient(0, -28, 1, 0, -28, 26); g.addColorStop(0, 'rgba(255,170,70,.3)'); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(-30, -54, 60, 60);
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = '#ffcf6e'; ctx.beginPath(); ctx.moveTo(-5, -17); ctx.quadraticCurveTo(-7 + fl, -30, 0, -38); ctx.quadraticCurveTo(7 + fl, -28, 5, -17); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#fff0b0'; ctx.beginPath(); ctx.moveTo(-2, -18); ctx.quadraticCurveTo(-2, -27, 1, -31); ctx.quadraticCurveTo(4, -25, 2, -18); ctx.fill();
  } else {
    ctx.fillStyle = 'rgba(160,170,190,.4)'; ctx.beginPath(); ctx.ellipse(0, -18, 9, 3, 0, 0, TAU); ctx.fill();
  }
  ctx.restore();
}

function drawAltar(ctx, a, t, game) {
  const x = a.x * 48, y = a.y * 48;
  const forged = a.forged;
  ctx.save(); ctx.translate(x, y);
  ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.beginPath(); ctx.ellipse(0, 4, 38, 12, 0, 0, TAU); ctx.fill();
  // escalones
  ctx.fillStyle = '#5b6478'; ctx.beginPath(); ctx.ellipse(0, 0, 35, 11, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = '#6b758c'; ctx.beginPath(); ctx.ellipse(0, -3, 29, 9, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = '#7c879e'; ctx.fillRect(-18, -26, 36, 24);
  ctx.fillStyle = '#596276'; ctx.fillRect(-22, -30, 44, 6);
  ctx.strokeStyle = 'rgba(232,196,119,.5)'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.ellipse(0, -3, 20, 6, 0, 0, TAU); ctx.stroke();
  // espada flotante
  if (forged) {
    const fl = Math.sin(t * 1.6) * 3;
    ctx.globalCompositeOperation = 'lighter';
    const g = ctx.createRadialGradient(0, -48, 2, 0, -48, 42); g.addColorStop(0, 'rgba(255,225,150,.4)'); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(-50, -95, 100, 100);
    ctx.globalCompositeOperation = 'source-over';
    ctx.save(); ctx.translate(0, -48 + fl); ctx.rotate(-.2 + Math.sin(t * .8) * .05);
    ctx.fillStyle = '#f4e3b0'; ctx.beginPath(); ctx.moveTo(0, -48); ctx.lineTo(3, 4); ctx.lineTo(-3, 4); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#e8c477'; ctx.fillRect(-9, 2, 18, 3);
    ctx.fillStyle = '#7a4e2a'; ctx.fillRect(-2, 3, 4, 13);
    ctx.fillStyle = '#ffe6a8'; ctx.beginPath(); ctx.arc(0, 18, 3, 0, TAU); ctx.fill();
    ctx.restore();
  } else {
    // fragmentos orbitando
    for (let i = 0; i < 3; i++) {
      const ang = t * .5 + i * TAU / 3;
      const px = Math.cos(ang) * 22, py = -42 + Math.sin(ang) * 8;
      ctx.save(); ctx.translate(px, py); ctx.rotate(ang);
      ctx.fillStyle = 'rgba(255,225,160,.8)'; ctx.beginPath(); ctx.moveTo(-5, -9); ctx.lineTo(4, -5); ctx.lineTo(5, 7); ctx.lineTo(-3, 3); ctx.closePath(); ctx.fill();
      ctx.restore();
    }
    const p = .5 + .5 * Math.sin(t * 2);
    ctx.globalCompositeOperation = 'lighter';
    const g = ctx.createRadialGradient(0, -42, 1, 0, -42, 30); g.addColorStop(0, `rgba(255,220,140,${.12 + p * .1})`); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(-36, -78, 72, 72);
  }
  ctx.restore();
}

function drawSign(ctx, s, t) {
  const x = s.x * 48, y = s.y * 48;
  ctx.save(); ctx.translate(x, y);
  ctx.fillStyle = 'rgba(0,0,0,.3)'; ctx.beginPath(); ctx.ellipse(0, 2, 10, 4, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = '#5b422c'; ctx.fillRect(-2, -24, 4, 24);
  ctx.fillStyle = '#7a5a39'; roundRect(ctx, -15, -34, 30, 13, 2); ctx.fill();
  ctx.strokeStyle = '#d8af61'; ctx.lineWidth = 1; ctx.strokeRect(-13, -32, 26, 9);
  ctx.restore();
}

function drawPortal(ctx, p, t, game) {
  const x = (p.x + p.w / 2) * 48, y = (p.y + p.h) * 48;
  const locked = p.requiresShards && game && (game.state.shards || 0) < p.requiresShards;
  ctx.save(); ctx.translate(x, y);
  ctx.fillStyle = 'rgba(0,0,0,.3)'; ctx.beginPath(); ctx.ellipse(0, 4, 28, 9, 0, 0, TAU); ctx.fill();
  const g = ctx.createRadialGradient(0, -20, 2, 0, -20, 42);
  const col = locked ? 'rgba(120,90,160,.18)' : 'rgba(120,210,255,.28)';
  g.addColorStop(0, locked ? 'rgba(160,120,220,.18)' : 'rgba(150,225,255,.26)'); g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g; ctx.fillRect(-48, -70, 96, 82);
  // arco
  ctx.strokeStyle = locked ? 'rgba(170,130,220,.65)' : 'rgba(180,240,255,.8)';
  ctx.lineWidth = 2.4;
  ctx.beginPath(); ctx.arc(0, -30, 18, Math.PI, 0); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-18, -30); ctx.lineTo(-18, -8); ctx.moveTo(18, -30); ctx.lineTo(18, -8); ctx.stroke();
  for (let i = 0; i < 5; i++) {
    const ang = t * .8 + i / 5 * TAU;
    const px = Math.cos(ang) * 20, py = -28 + Math.sin(ang) * 9;
    ctx.fillStyle = locked ? 'rgba(180,140,255,.5)' : 'rgba(190,245,255,.7)';
    ctx.beginPath(); ctx.arc(px, py, 1.4, 0, TAU); ctx.fill();
  }
  if (locked) {
    ctx.fillStyle = 'rgba(160,120,220,.6)'; ctx.fillRect(-24, -18, 48, 18);
    ctx.strokeStyle = 'rgba(200,170,255,.4)'; ctx.lineWidth = 1; ctx.strokeRect(-24, -18, 48, 18);
  }
  ctx.restore();
}

export function drawWaterOverlay(ctx, tileList, t, cam, view) {
  const x0 = cam.x - view.w / 2, y0 = cam.y - view.h / 2;
  const x1 = x0 + view.w, y1 = y0 + view.h;
  for (const [tx, ty, kind] of tileList) {
    const x = tx * TS, y = ty * TS;
    if (x + TS < x0 || x > x1 || y + TS < y0 || y > y1) continue;
    const phase = hash(tx, ty, 7) * 6.28;
    ctx.strokeStyle = kind === 'lava' ? 'rgba(255,190,100,.35)' : 'rgba(180,235,255,.22)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 2; i++) {
      const yy = y + 16 + i * 16 + Math.sin(t * 1.5 + phase + i) * 2;
      ctx.beginPath(); ctx.moveTo(x + 3, yy); ctx.quadraticCurveTo(x + 15, yy - 3, x + 27, yy); ctx.quadraticCurveTo(x + 39, yy + 3, x + 45, yy); ctx.stroke();
    }
    if (kind === 'lava') {
      ctx.fillStyle = `rgba(255,180,70,${.2 + .15 * Math.sin(t * 2 + phase)})`;
      ctx.beginPath(); ctx.arc(x + 12 + hash(tx, ty, 2) * 24, y + 12 + hash(tx, ty, 3) * 24, 1.5, 0, TAU); ctx.fill();
    }
  }
}

export function drawMinimapBase(zone) {
  const c = document.createElement('canvas');
  const px = 5;
  c.width = zone.width * px; c.height = zone.height * px;
  const ctx = c.getContext('2d');
  const colors = {
    grass: '#2b503d', flower: '#355c43', path: '#7f6f4e', stone: '#4b5365', water: '#1c4568', lava: '#8b2b1b',
    wall: '#252b37', tree: '#1b3c2f', ruin: '#4a505e', crystal: '#5a57a0', void: '#080c16', bridge: '#6a4a2e',
    wood: '#5f422b', ash: '#464146', snow: '#9ba9ba', sand: '#9c865f',
  };
  for (let y = 0; y < zone.height; y++) for (let x = 0; x < zone.width; x++) {
    ctx.fillStyle = colors[zone.tiles[y][x]] || '#222';
    ctx.fillRect(x * px, y * px, px, px);
  }
  for (const b of zone.buildings || []) { ctx.fillStyle = '#8e6a4c'; ctx.fillRect(b.x * px, b.y * px, b.w * px, b.h * px); }
  return c;
}
