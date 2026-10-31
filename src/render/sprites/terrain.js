import { hash2, mixHex, rgba, TAU } from '../../core/utils.js';
import { crystalShape } from './common.js';

export const TILE_SIZE = 32;

const BASE = {
  valdoria: {
    0: ['#5f8f4e', '#6d9e58', '#547f45'], 1: ['#a98f6a', '#b89c76', '#947b5a'],
    2: ['#3f7f9e', '#2c5d78', '#5a9ab8'], 3: ['#9a907c', '#8a8272', '#a89e88'],
    4: ['#8a8272', '#6f685a', '#a39a86'], 5: ['#ff5a2a', '#b83218', '#ff9a5c'],
    6: ['#a98f6a', '#7a6248', '#c0a47a'], 7: ['#5f8f4e', '#6d9e58', '#e8d98a'],
    8: ['#4a3a35', '#342824', '#58443c'], 9: ['#9a907c', '#8a8272', '#a89e88'],
    10: ['#1a1428', '#0e0a18', '#3a2a5a'], 11: ['#c8b080', '#b09868', '#d8c090'],
    12: ['#6a645a', '#544e46', '#7e766a'], 13: ['#4d7740', '#3f6636', '#5c8f4f'],
    14: ['#6a5a4a', '#55483c', '#7a6a58'], 15: ['#7a9ab8', '#5a7a98', '#9fc9e8'],
  },
  drakmor: {
    0: ['#4a3a35', '#58443c', '#3e302c'], 1: ['#6a4a3a', '#7a5844', '#5a3e30'],
    2: ['#ff5a2a', '#b83218', '#ff9a5c'], 3: ['#6a5a50', '#5a4a42', '#7a6a5e'],
    4: ['#5a4a42', '#42342e', '#7a685a'], 5: ['#ff5a2a', '#b83218', '#ffd08a'],
    6: ['#6a4a3a', '#4a3428', '#8a6248'], 7: ['#4a3a35', '#58443c', '#ff9a5c'],
    8: ['#342824', '#241c1a', '#4a3a35'], 9: ['#6a5a50', '#5a4a42', '#7a6a5e'],
    10: ['#1a1020', '#0e0814', '#3a1a3a'], 11: ['#8a6a4a', '#705438', '#a08060'],
    12: ['#4a4a5e', '#343446', '#6a6a82'], 13: ['#3a3028', '#2a221c', '#4a3e34'],
    14: ['#58443c', '#46362e', '#6a5448'], 15: ['#8a5a8a', '#5a3a6a', '#c7a4ff'],
  },
  kansordore: {
    0: ['#7a7a98', '#8a8aa8', '#6a6a88'], 1: ['#c8c0d8', '#d8d0e8', '#b8b0c8'],
    2: ['#4a4a8a', '#2a2a5a', '#7a7ab8'], 3: ['#c8c0d8', '#b8b0c8', '#d8d0e8'],
    4: ['#b8b0c8', '#9a92aa', '#d8d0e8'], 5: ['#7a5aaa', '#5a3a8a', '#c7a4ff'],
    6: ['#c8c0d8', '#a89ac0', '#e8e0f0'], 7: ['#7a7a98', '#8a8aa8', '#ffe7a8'],
    8: ['#5a5a78', '#4a4a68', '#6a6a88'], 9: ['#c8c0d8', '#b8b0c8', '#e8e0f0'],
    10: ['#12122a', '#080812', '#2a2a5a'], 11: ['#d8c8a8', '#c0b090', '#e8d8b8'],
    12: ['#9a9ab8', '#7a7a98', '#c8c0d8'], 13: ['#5a5a78', '#4a4a68', '#6a6a88'],
    14: ['#6a6a88', '#5a5a78', '#7a7a98'], 15: ['#9fc9e8', '#6a9ac8', '#e8fbff'],
  },
};

export function drawTerrainTile(ctx, x, y, tile, regionId, seed, tx, ty) {
  const palette = BASE[regionId] || BASE.valdoria;
  const cols = palette[tile] || palette[0];
  const h = hash2(tx, ty, seed);
  const h2 = hash2(tx + 17, ty + 31, seed + 5);
  const size = TILE_SIZE;
  ctx.fillStyle = cols[0];
  ctx.fillRect(x, y, size, size);

  switch (tile) {
    case 0: // hierba
    case 13: { // hierba alta
      ctx.fillStyle = cols[1];
      ctx.globalAlpha = 0.45;
      ctx.fillRect(x + (h * 10 | 0), y + (h2 * 10 | 0), 14, 10);
      ctx.globalAlpha = 1;
      const blades = tile === 13 ? 7 : 4;
      for (let i = 0; i < blades; i++) {
        const bx = x + 4 + hash2(tx * 7 + i, ty * 11, seed) * 24;
        const by = y + 8 + hash2(tx * 3, ty * 5 + i, seed + 2) * 20;
        ctx.strokeStyle = i % 2 ? cols[2] : cols[1];
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(bx, by);
        ctx.quadraticCurveTo(bx + (h - 0.5) * 4, by - 5, bx + (h2 - 0.5) * 5, by - 9);
        ctx.stroke();
      }
      if (h > 0.82 && tile === 0) {
        ctx.fillStyle = regionId === 'drakmor' ? '#ff9a5c' : regionId === 'kansordore' ? '#ffe7a8' : '#e8d98a';
        ctx.beginPath(); ctx.arc(x + 10 + h2 * 12, y + 12 + h * 10, 2.1, 0, TAU); ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.55)';
        ctx.beginPath(); ctx.arc(x + 10 + h2 * 12, y + 12 + h * 10, 0.8, 0, TAU); ctx.fill();
      }
      break;
    }
    case 1: // camino
    case 11: { // arena
      ctx.fillStyle = cols[1];
      ctx.globalAlpha = 0.35;
      ctx.fillRect(x + 2, y + 2, 28, 28);
      ctx.globalAlpha = 1;
      for (let i = 0; i < 4; i++) {
        const px = x + 3 + hash2(tx * 13 + i, ty * 5, seed) * 26;
        const py = y + 3 + hash2(tx * 5, ty * 17 + i, seed + 4) * 26;
        ctx.fillStyle = i % 2 ? cols[2] : cols[1];
        ctx.beginPath(); ctx.ellipse(px, py, 1.8, 1.1, h * 3, 0, TAU); ctx.fill();
      }
      break;
    }
    case 2: // agua
    case 5: { // lava
      const isLava = tile === 5;
      const g = ctx.createLinearGradient(x, y, x + 32, y + 32);
      g.addColorStop(0, cols[0]);
      g.addColorStop(0.5, cols[1]);
      g.addColorStop(1, cols[0]);
      ctx.fillStyle = g;
      ctx.fillRect(x, y, 32, 32);
      ctx.strokeStyle = isLava ? 'rgba(255,220,150,0.4)' : 'rgba(200,240,255,0.25)';
      ctx.lineWidth = 1;
      for (let i = 0; i < 3; i++) {
        const wy = y + 7 + i * 9 + Math.sin((tx + ty + i) * 1.7) * 2;
        ctx.beginPath();
        ctx.moveTo(x + 2, wy);
        ctx.quadraticCurveTo(x + 10, wy - 3, x + 18, wy);
        ctx.quadraticCurveTo(x + 26, wy + 3, x + 30, wy);
        ctx.stroke();
      }
      if (isLava && h > 0.8) {
        ctx.fillStyle = 'rgba(255,220,140,0.85)';
        ctx.beginPath(); ctx.arc(x + 8 + h2 * 16, y + 8 + h * 16, 2.2, 0, TAU); ctx.fill();
      }
      break;
    }
    case 3: // suelo de piedra
    case 9: { // templo
      ctx.fillStyle = cols[0];
      ctx.fillRect(x, y, 32, 32);
      ctx.strokeStyle = regionId === 'kansordore' ? 'rgba(255,231,168,0.18)' : 'rgba(20,18,26,0.22)';
      ctx.lineWidth = 1;
      ctx.strokeRect(x + 0.5, y + 0.5, 31, 31);
      ctx.strokeRect(x + 8.5, y + 8.5, 15, 15);
      if (h > 0.6) {
        ctx.fillStyle = cols[2];
        ctx.globalAlpha = 0.35;
        ctx.fillRect(x + 10, y + 10, 12, 12);
        ctx.globalAlpha = 1;
      }
      if (regionId === 'kansordore' && h2 > 0.84) {
        ctx.strokeStyle = 'rgba(255,231,168,0.45)';
        ctx.beginPath(); ctx.arc(x + 16, y + 16, 5, 0, TAU); ctx.stroke();
      }
      break;
    }
    case 4: // muro
    case 12: { // acantilado
      const g = ctx.createLinearGradient(x, y, x, y + 32);
      g.addColorStop(0, cols[2]);
      g.addColorStop(0.35, cols[0]);
      g.addColorStop(1, cols[1]);
      ctx.fillStyle = g;
      ctx.fillRect(x, y, 32, 32);
      ctx.strokeStyle = 'rgba(10,8,16,0.35)';
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(x, y + 16); ctx.lineTo(x + 32, y + 16); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x + 16, y); ctx.lineTo(x + 16, y + 16); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x + 8, y + 16); ctx.lineTo(x + 8, y + 32); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x + 24, y + 16); ctx.lineTo(x + 24, y + 32); ctx.stroke();
      ctx.strokeStyle = 'rgba(255,255,255,0.12)';
      ctx.beginPath(); ctx.moveTo(x + 2, y + 2); ctx.lineTo(x + 30, y + 2); ctx.stroke();
      break;
    }
    case 6: // puente
      ctx.fillStyle = '#7a5a3a';
      ctx.fillRect(x, y, 32, 32);
      for (let i = 0; i < 4; i++) {
        ctx.fillStyle = i % 2 ? '#8a6a48' : '#6a4a30';
        ctx.fillRect(x, y + i * 8 + 1, 32, 6);
        ctx.strokeStyle = 'rgba(20,12,8,0.5)';
        ctx.beginPath(); ctx.moveTo(x, y + i * 8 + 7); ctx.lineTo(x + 32, y + i * 8 + 7); ctx.stroke();
      }
      ctx.fillStyle = 'rgba(30,18,10,0.5)';
      ctx.fillRect(x + 1, y, 2, 32);
      ctx.fillRect(x + 29, y, 2, 32);
      break;
    case 7: // flores
      ctx.fillStyle = '#5f8f4e';
      ctx.fillRect(x, y, 32, 32);
      for (let i = 0; i < 3; i++) {
        const fx = x + 6 + hash2(tx * 9 + i, ty * 3, seed) * 20;
        const fy = y + 6 + hash2(tx * 3, ty * 9 + i, seed + 7) * 20;
        ctx.fillStyle = i % 2 ? cols[2] : (regionId === 'drakmor' ? '#ff7b4d' : '#f0e6b0');
        for (let k = 0; k < 5; k++) {
          const a = (k / 5) * TAU;
          ctx.beginPath(); ctx.arc(fx + Math.cos(a) * 2.2, fy + Math.sin(a) * 2.2, 1.4, 0, TAU); ctx.fill();
        }
        ctx.fillStyle = '#ffd98a';
        ctx.beginPath(); ctx.arc(fx, fy, 1.1, 0, TAU); ctx.fill();
      }
      break;
    case 8: // ceniza
      ctx.fillStyle = cols[0];
      ctx.fillRect(x, y, 32, 32);
      ctx.strokeStyle = 'rgba(255,120,60,0.25)';
      ctx.lineWidth = 1;
      for (let i = 0; i < 2; i++) {
        ctx.beginPath();
        ctx.moveTo(x + 4 + h * 20, y + 6 + i * 12);
        ctx.lineTo(x + 12 + h2 * 16, y + 10 + i * 12);
        ctx.lineTo(x + 20 + h * 8, y + 8 + i * 12);
        ctx.stroke();
      }
      if (h > 0.86) {
        ctx.fillStyle = 'rgba(255,150,80,0.5)';
        ctx.beginPath(); ctx.arc(x + 10 + h2 * 12, y + 10 + h * 12, 1.4, 0, TAU); ctx.fill();
      }
      break;
    case 10: // vacío
      {
        const g = ctx.createRadialGradient(x + 16, y + 16, 2, x + 16, y + 16, 26);
        g.addColorStop(0, cols[2]);
        g.addColorStop(1, cols[1]);
        ctx.fillStyle = g;
        ctx.fillRect(x, y, 32, 32);
        for (let i = 0; i < 3; i++) {
          const sx = x + 4 + hash2(tx * 11 + i, ty * 7, seed) * 24;
          const sy = y + 4 + hash2(tx * 5, ty * 13 + i, seed + 3) * 24;
          ctx.fillStyle = `rgba(255,255,255,${0.2 + hash2(i, tx + ty, seed) * 0.5})`;
          ctx.beginPath(); ctx.arc(sx, sy, 0.7 + h * 1.1, 0, TAU); ctx.fill();
        }
      }
      break;
    case 14: // barro
      ctx.fillStyle = cols[0];
      ctx.fillRect(x, y, 32, 32);
      ctx.fillStyle = cols[1];
      ctx.globalAlpha = 0.5;
      ctx.beginPath(); ctx.ellipse(x + 12 + h * 10, y + 14 + h2 * 8, 7, 3, h * 3, 0, TAU); ctx.fill();
      ctx.globalAlpha = 1;
      break;
    case 15: // cristal
      ctx.fillStyle = cols[1];
      ctx.fillRect(x, y, 32, 32);
      crystalShape(ctx, x + 9 + h * 6, y + 26, 14 + h2 * 8, 3, cols[2]);
      crystalShape(ctx, x + 23, y + 24, 9 + h * 7, 2, cols[0]);
      break;
    default: break;
  }

  // Borde suave para evitar un mosaico demasiado duro.
  if ((tile === 0 || tile === 8 || tile === 9 || tile === 14) && h2 > 0.72) {
    ctx.fillStyle = rgba(cols[2], 0.1);
    ctx.beginPath(); ctx.arc(x + 16, y + 16, 15, 0, TAU); ctx.fill();
  }
}
