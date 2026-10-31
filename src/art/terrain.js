import { TILE, TERRAIN } from '../world/regions.js';
import { hash2, rgba, shade } from '../core/utils.js';

const CHUNK = 10;
const cache = new WeakMap();

function paletteOf(region) { return region.palette; }

function tileBase(ctx, region, t, px, py, tx, ty) {
  const p = paletteOf(region);
  const h = hash2(tx, ty, region.seed);
  const h2 = hash2(tx, ty, region.seed + 77);
  switch (t) {
    case TERRAIN.GRASS: {
      const g = ctx.createLinearGradient(px, py, px, py + TILE);
      g.addColorStop(0, h > .5 ? p.grass : p.grass2);
      g.addColorStop(1, h2 > .5 ? shade(p.grass, -.06) : p.grass);
      ctx.fillStyle = g; ctx.fillRect(px, py, TILE, TILE);
      // soft patches
      for (let i = 0; i < 3; i++) {
        const a = hash2(tx * 3 + i, ty, region.seed + i);
        ctx.fillStyle = rgba(i % 2 ? p.grass2 : p.key, .13);
        ctx.beginPath(); ctx.ellipse(px + a * TILE, py + hash2(tx, ty * 4 + i, region.seed) * TILE, 9 + a * 12, 5 + a * 8, a * 3, 0, 6.3); ctx.fill();
      }
      // blades
      const blades = 2 + Math.floor(h * 4);
      for (let i = 0; i < blades; i++) {
        const bx = px + hash2(tx * 7 + i, ty * 3, region.seed) * TILE;
        const by = py + hash2(tx, ty * 9 + i, region.seed) * TILE;
        ctx.strokeStyle = rgba(i % 2 ? shade(p.grass, .18) : shade(p.grass, -.16), .5);
        ctx.lineWidth = .9;
        ctx.beginPath(); ctx.moveTo(bx, by); ctx.quadraticCurveTo(bx + 2, by - 4, bx + (h > .5 ? 3 : -3), by - 6 - h * 3); ctx.stroke();
      }
      if (h2 > .9) {
        const fx = px + 10 + h * 26, fy = py + 12 + h2 * 24;
        ctx.fillStyle = region.id === 'kansordore' ? '#f4e8b0' : (h > .45 ? '#f2e6a0' : '#d8b8ea');
        for (let k = 0; k < 5; k++) { const a = k / 5 * 6.28; ctx.beginPath(); ctx.arc(fx + Math.cos(a) * 2.1, fy + Math.sin(a) * 2.1, 1.3, 0, 6.3); ctx.fill(); }
        ctx.fillStyle = '#fff8d8'; ctx.beginPath(); ctx.arc(fx, fy, 1, 0, 6.3); ctx.fill();
      }
      break;
    }
    case TERRAIN.MOSS: {
      const g = ctx.createLinearGradient(px, py, px, py + TILE);
      g.addColorStop(0, p.moss); g.addColorStop(1, shade(p.moss, -.12));
      ctx.fillStyle = g; ctx.fillRect(px, py, TILE, TILE);
      for (let i = 0; i < 5; i++) {
        const a = hash2(tx * 11 + i, ty * 5, region.seed);
        ctx.fillStyle = rgba(i % 2 ? '#7fa06a' : '#2f4a36', .2);
        ctx.beginPath(); ctx.arc(px + a * TILE, py + hash2(tx * 3, ty * 7 + i, region.seed) * TILE, 2 + a * 4, 0, 6.3); ctx.fill();
      }
      ctx.strokeStyle = rgba('#203c2b', .22); ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(px + 4, py + h * TILE); ctx.quadraticCurveTo(px + 22, py + h2 * TILE, px + 44, py + h * TILE); ctx.stroke();
      break;
    }
    case TERRAIN.DIRT: {
      ctx.fillStyle = p.path; ctx.fillRect(px, py, TILE, TILE);
      for (let i = 0; i < 8; i++) {
        const a = hash2(tx * 13 + i, ty * 7, region.seed), b = hash2(tx * 5, ty * 11 + i, region.seed);
        ctx.fillStyle = rgba(i % 3 ? p.path2 : shade(p.path, .18), .4);
        ctx.beginPath(); ctx.arc(px + a * TILE, py + b * TILE, .8 + a * 2.2, 0, 6.3); ctx.fill();
      }
      if (h > .92) { ctx.fillStyle = rgba('#6b6153', .55); ctx.beginPath(); ctx.ellipse(px + 22, py + 30, 4, 2.5, .4, 0, 6.3); ctx.fill(); }
      break;
    }
    case TERRAIN.WATER: {
      const g = ctx.createLinearGradient(px, py, px + TILE, py + TILE);
      g.addColorStop(0, p.water); g.addColorStop(1, p.water2);
      ctx.fillStyle = g; ctx.fillRect(px, py, TILE, TILE);
      ctx.strokeStyle = 'rgba(220,245,255,.24)'; ctx.lineWidth = 1;
      for (let i = 0; i < 2; i++) {
        const yy = py + 12 + i * 17 + h * 8;
        ctx.beginPath(); ctx.moveTo(px + 5 + h * 10, yy); ctx.quadraticCurveTo(px + 22, yy - 3, px + 42, yy + 1); ctx.stroke();
      }
      ctx.fillStyle = 'rgba(255,255,255,.10)';
      ctx.beginPath(); ctx.ellipse(px + 12 + h * 24, py + 30, 9, 2, 0, 0, 6.3); ctx.fill();
      break;
    }
    case TERRAIN.LAVA: {
      const g = ctx.createRadialGradient(px + TILE * .5, py + TILE * .5, 2, px + TILE * .5, py + TILE * .5, TILE * .8);
      g.addColorStop(0, '#ffb24d'); g.addColorStop(.55, '#d94a25'); g.addColorStop(1, '#6e1a12');
      ctx.fillStyle = g; ctx.fillRect(px, py, TILE, TILE);
      ctx.strokeStyle = 'rgba(50,10,8,.55)'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(px + h * 40, py); ctx.lineTo(px + h2 * 30 + 8, py + TILE); ctx.stroke();
      ctx.fillStyle = 'rgba(255,230,150,.5)';
      ctx.beginPath(); ctx.ellipse(px + 20 + h * 12, py + 26, 4, 1.4, .3, 0, 6.3); ctx.fill();
      break;
    }
    case TERRAIN.ASH: {
      ctx.fillStyle = p.grass; ctx.fillRect(px, py, TILE, TILE);
      ctx.fillStyle = rgba(p.grass2, .55);
      ctx.beginPath(); ctx.ellipse(px + 12 + h * 26, py + 18 + h2 * 20, 9, 4, h * 3, 0, 6.3); ctx.fill();
      for (let i = 0; i < 4; i++) {
        ctx.fillStyle = rgba(i % 2 ? '#6a5c50' : '#2f2826', .35);
        ctx.beginPath(); ctx.arc(px + hash2(tx * 9 + i, ty * 3, region.seed) * TILE, py + hash2(tx, ty * 5 + i, region.seed) * TILE, 1 + i * .4, 0, 6.3); ctx.fill();
      }
      ctx.strokeStyle = 'rgba(30,22,22,.28)'; ctx.lineWidth = 1;
      if (h > .6) { ctx.beginPath(); ctx.moveTo(px + 6, py + h2 * TILE); ctx.lineTo(px + 28, py + h * 30); ctx.lineTo(px + 44, py + 20 + h2 * 22); ctx.stroke(); }
      break;
    }
    case TERRAIN.CELESTIAL: {
      const g = ctx.createLinearGradient(px, py, px, py + TILE);
      g.addColorStop(0, p.grass); g.addColorStop(1, p.grass2);
      ctx.fillStyle = g; ctx.fillRect(px, py, TILE, TILE);
      for (let i = 0; i < 4; i++) {
        ctx.fillStyle = rgba(i % 2 ? '#a0a48c' : '#6c7064', .18);
        ctx.beginPath(); ctx.ellipse(px + hash2(tx * 8 + i, ty * 2, region.seed) * TILE, py + hash2(tx, ty * 6 + i, region.seed) * TILE, 4 + h * 6, 2 + h2 * 3, h * 4, 0, 6.3); ctx.fill();
      }
      if (h > .9) { ctx.strokeStyle = 'rgba(255,245,210,.5)'; ctx.lineWidth = .8; ctx.beginPath(); ctx.arc(px + 24, py + 24, 3, 0, 6.3); ctx.stroke(); }
      break;
    }
    case TERRAIN.STONE: {
      ctx.fillStyle = p.stone; ctx.fillRect(px, py, TILE, TILE);
      ctx.fillStyle = rgba(shade(p.stone, -.14), .5);
      ctx.beginPath(); ctx.ellipse(px + 14 + h * 20, py + 16 + h2 * 18, 10, 6, h * 3, 0, 6.3); ctx.fill();
      ctx.strokeStyle = 'rgba(40,38,42,.25)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(px + 4, py + 12 + h * 22); ctx.lineTo(px + 20, py + 20 + h2 * 12); ctx.lineTo(px + 30, py + 34); ctx.stroke();
      if (h2 > .7) { ctx.fillStyle = 'rgba(255,255,255,.12)'; ctx.beginPath(); ctx.ellipse(px + 20, py + 14, 7, 2, .4, 0, 6.3); ctx.fill(); }
      break;
    }
    case TERRAIN.BRIDGE: {
      // water/void underneath
      const under = region.id === 'drakmor' ? TERRAIN.LAVA : (region.id === 'kansordore' ? TERRAIN.VOID : TERRAIN.WATER);
      tileBase(ctx, region, under, px, py, tx, ty);
      // wooden planks
      ctx.save();
      const vertical = (Math.abs(tx - 83) < 7) || region.id === 'drakmor';
      ctx.translate(px + TILE / 2, py + TILE / 2);
      if (!vertical) ctx.rotate(Math.PI / 2);
      ctx.fillStyle = 'rgba(20,14,10,.25)'; ctx.fillRect(-TILE / 2 + 3, -TILE / 2 + 4, TILE - 2, TILE - 2);
      for (let i = 0; i < 6; i++) {
        ctx.fillStyle = i % 2 ? '#7a5c3e' : '#6a4e34';
        ctx.fillRect(-TILE / 2, -TILE / 2 + i * 8, TILE, 7);
        ctx.fillStyle = 'rgba(255,230,180,.08)'; ctx.fillRect(-TILE / 2, -TILE / 2 + i * 8, TILE, 1);
      }
      ctx.fillStyle = '#4a3524'; ctx.fillRect(-TILE / 2, -TILE / 2, 5, TILE); ctx.fillRect(TILE / 2 - 5, -TILE / 2, 5, TILE);
      ctx.restore();
      break;
    }
    case TERRAIN.CLIFF: {
      const g = ctx.createLinearGradient(px, py, px, py + TILE);
      g.addColorStop(0, '#4b4644'); g.addColorStop(.5, p.cliff); g.addColorStop(1, '#242124');
      ctx.fillStyle = g; ctx.fillRect(px, py, TILE, TILE);
      ctx.strokeStyle = 'rgba(15,12,14,.45)'; ctx.lineWidth = 2;
      for (let i = 0; i < 2; i++) {
        ctx.beginPath(); ctx.moveTo(px + h * TILE, py); ctx.lineTo(px + 8 + h2 * 30, py + 20 + i * 16); ctx.lineTo(px + 30 + h * 16, py + TILE); ctx.stroke();
      }
      ctx.fillStyle = 'rgba(255,240,220,.08)'; ctx.fillRect(px, py, TILE, 3);
      break;
    }
    case TERRAIN.VOID: {
      const g = ctx.createRadialGradient(px + TILE / 2, py + TILE / 2, 1, px + TILE / 2, py + TILE / 2, TILE);
      g.addColorStop(0, '#101426'); g.addColorStop(1, '#05060d');
      ctx.fillStyle = g; ctx.fillRect(px, py, TILE, TILE);
      if (h > .55) { ctx.fillStyle = rgba('#dfe8ff', .3 + h * .5); ctx.beginPath(); ctx.arc(px + h2 * TILE, py + h * TILE, h > .9 ? 1.6 : .9, 0, 6.3); ctx.fill(); }
      if (h2 > .8) { ctx.fillStyle = 'rgba(180,170,255,.15)'; ctx.beginPath(); ctx.arc(px + 24, py + 20, 7, 0, 6.3); ctx.fill(); }
      break;
    }
    default: ctx.fillStyle = '#333'; ctx.fillRect(px, py, TILE, TILE);
  }
}

export function getChunk(region, cx, cy) {
  let map = cache.get(region);
  if (!map) { map = new Map(); cache.set(region, map); }
  const key = cx + ',' + cy;
  if (map.has(key)) return map.get(key);
  const c = document.createElement('canvas');
  c.width = CHUNK * TILE; c.height = CHUNK * TILE;
  const ctx = c.getContext('2d');
  for (let y = 0; y < CHUNK; y++) for (let x = 0; x < CHUNK; x++) {
    const tx = cx * CHUNK + x, ty = cy * CHUNK + y;
    if (tx >= region.tileW || ty >= region.tileH) continue;
    const t = region.tiles[ty * region.tileW + tx];
    tileBase(ctx, region, t, x * TILE, y * TILE, tx, ty);
    // edge shadow for solid tiles (cliffs/water)
    if ((t === TERRAIN.CLIFF || t === TERRAIN.VOID) && region.tiles[ty * region.tileW + Math.max(0, tx - 1)] !== t) {
      const g = ctx.createLinearGradient(x * TILE, 0, x * TILE + 10, 0);
      g.addColorStop(0, 'rgba(0,0,0,.4)'); g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g; ctx.fillRect(x * TILE, y * TILE, 10, TILE);
    }
  }
  map.set(key, c);
  return c;
}

export function drawTerrain(ctx, region, camera, time) {
  const cs = CHUNK * TILE;
  const x0 = Math.floor(camera.x / cs), x1 = Math.floor((camera.x + camera.w) / cs);
  const y0 = Math.floor(camera.y / cs), y1 = Math.floor((camera.y + camera.h) / cs);
  for (let cy = y0; cy <= y1; cy++) for (let cx = x0; cx <= x1; cx++) {
    if (cx < 0 || cy < 0 || cx * CHUNK >= region.tileW || cy * CHUNK >= region.tileH) continue;
    ctx.drawImage(getChunk(region, cx, cy), cx * cs - camera.x, cy * cs - camera.y);
  }
  // Animated overlays only on visible tiles
  const tx0 = Math.max(0, Math.floor(camera.x / TILE)), tx1 = Math.min(region.tileW - 1, Math.floor((camera.x + camera.w) / TILE));
  const ty0 = Math.max(0, Math.floor(camera.y / TILE)), ty1 = Math.min(region.tileH - 1, Math.floor((camera.y + camera.h) / TILE));
  for (let ty = ty0; ty <= ty1; ty++) for (let tx = tx0; tx <= tx1; tx++) {
    const t = region.tiles[ty * region.tileW + tx];
    const px = tx * TILE - camera.x, py = ty * TILE - camera.y;
    if (t === TERRAIN.WATER) {
      const ph = time * .8 + (tx * .8 + ty * 1.2);
      ctx.strokeStyle = 'rgba(225,250,255,.2)'; ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(px + 6, py + 14 + Math.sin(ph) * 3);
      ctx.quadraticCurveTo(px + 24, py + 10 + Math.sin(ph + 1) * 3, px + 42, py + 15 + Math.sin(ph + 2) * 2);
      ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,.12)';
      ctx.beginPath(); ctx.ellipse(px + 24 + Math.sin(ph * .6) * 8, py + 32, 8, 1.5, 0, 0, 6.3); ctx.fill();
    } else if (t === TERRAIN.LAVA) {
      const ph = time * 1.4 + tx * .5 + ty * .8;
      const glow = .18 + Math.sin(ph) * .06;
      ctx.fillStyle = `rgba(255,160,60,${glow})`;
      ctx.beginPath(); ctx.ellipse(px + 24 + Math.sin(ph * .4) * 10, py + 24 + Math.cos(ph * .3) * 8, 12, 4, 0, 0, 6.3); ctx.fill();
      if (Math.sin(ph * .7) > .92) {
        ctx.fillStyle = 'rgba(255,230,150,.7)';
        ctx.beginPath(); ctx.arc(px + 16 + (ph * 13) % 20, py + 30, 1.5, 0, 6.3); ctx.fill();
      }
    } else if (t === TERRAIN.VOID) {
      const ph = time * .5 + tx * .3 + ty * .7;
      if (Math.sin(ph) > .95) { ctx.fillStyle = 'rgba(220,225,255,.5)'; ctx.beginPath(); ctx.arc(px + 10 + (tx * 17) % 28, py + 12 + (ty * 23) % 26, 1, 0, 6.3); ctx.fill(); }
    }
  }
}

export function drawWaterGlow(ctx, region, camera, player, time) {
  // subtle animated caustics near the player for life
  const p = region.palette;
  const x = player.x - camera.x, y = player.y - camera.y;
  const g = ctx.createRadialGradient(x, y, 10, x, y, 180);
  g.addColorStop(0, rgba(p.glow, .045)); g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g; ctx.fillRect(x - 180, y - 180, 360, 360);
}
