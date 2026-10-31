import { TAU, hash2, rgba } from '../../core/utils.js';
import { shadow, glowCircle, line, star, roundRect, flame, crystalShape } from './common.js';

export function drawProp(ctx, p, region, time) {
  const sway = Math.sin(time * 1.15 + (p.seed || 0) * 0.7) * 1.4;
  switch (p.type) {
    case 'tree': {
      shadow(ctx, p.x, p.y, 22 * p.scale, 8 * p.scale, 0.32);
      ctx.fillStyle = '#4a3524';
      ctx.beginPath();
      ctx.moveTo(p.x - 4 * p.scale, p.y);
      ctx.quadraticCurveTo(p.x - 3 * p.scale, p.y - 30 * p.scale, p.x - 6 * p.scale + sway, p.y - 54 * p.scale);
      ctx.lineTo(p.x + 6 * p.scale + sway, p.y - 54 * p.scale);
      ctx.quadraticCurveTo(p.x + 3 * p.scale, p.y - 30 * p.scale, p.x + 4 * p.scale, p.y);
      ctx.fill();
      const base = region === 'drakmor' ? ['#2a2020', '#5a3a2a', '#1a1212'] : region === 'kansordore' ? ['#4a4a6a', '#8a8ab8', '#2a2a4a'] : ['#2f5a37', '#5c8f4f', '#1e3c28'];
      for (let i = 0; i < 4; i++) {
        const a = (i / 4) * TAU + (p.seed || 0);
        const cx = p.x + Math.cos(a) * 13 * p.scale + sway;
        const cy = p.y - 56 * p.scale + Math.sin(a) * 9 * p.scale;
        const r = (16 + (i % 2) * 5) * p.scale;
        const g = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.3, 1, cx, cy, r);
        g.addColorStop(0, base[1]);
        g.addColorStop(1, base[0]);
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(cx, cy, r, 0, TAU); ctx.fill();
      }
      ctx.fillStyle = base[2];
      ctx.globalAlpha = 0.5;
      ctx.beginPath(); ctx.arc(p.x - 6 * p.scale + sway, p.y - 46 * p.scale, 13 * p.scale, 0, TAU); ctx.fill();
      ctx.globalAlpha = 1;
      break;
    }
    case 'pine': {
      shadow(ctx, p.x, p.y, 18 * p.scale, 6 * p.scale, 0.3);
      ctx.fillStyle = '#4a3524';
      ctx.fillRect(p.x - 3 * p.scale, p.y - 20 * p.scale, 6 * p.scale, 20 * p.scale);
      for (let i = 0; i < 3; i++) {
        const yy = p.y - 18 * p.scale - i * 15 * p.scale;
        const ww = (20 - i * 4) * p.scale;
        ctx.fillStyle = i % 2 ? '#2f5a37' : '#3f6f45';
        ctx.beginPath();
        ctx.moveTo(p.x + sway * (i + 1) * 0.4, yy - 20 * p.scale);
        ctx.lineTo(p.x + ww, yy + 4 * p.scale);
        ctx.lineTo(p.x - ww, yy + 4 * p.scale);
        ctx.closePath(); ctx.fill();
      }
      break;
    }
    case 'deadtree': {
      shadow(ctx, p.x, p.y, 20 * p.scale, 6 * p.scale, 0.3);
      ctx.strokeStyle = '#2a1c18';
      ctx.lineWidth = 5 * p.scale;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.quadraticCurveTo(p.x - 4 * p.scale, p.y - 30 * p.scale, p.x + 3 * p.scale + sway, p.y - 58 * p.scale);
      ctx.stroke();
      for (let i = 0; i < 4; i++) {
        const yy = p.y - 22 * p.scale - i * 9 * p.scale;
        const dir = i % 2 ? 1 : -1;
        ctx.beginPath();
        ctx.moveTo(p.x + dir * 2 * p.scale, yy);
        ctx.quadraticCurveTo(p.x + dir * 18 * p.scale, yy - 8 * p.scale, p.x + dir * 26 * p.scale, yy - 20 * p.scale);
        ctx.stroke();
      }
      break;
    }
    case 'obsidian': {
      shadow(ctx, p.x, p.y, 18 * p.scale, 6 * p.scale, 0.35);
      for (let i = 0; i < 3; i++) {
        const hh = (34 + i * 10) * p.scale;
        crystalShape(ctx, p.x + (i - 1) * 8 * p.scale, p.y, hh, 5 * p.scale, '#5a4a6a');
      }
      glowCircle(ctx, p.x, p.y - 22 * p.scale, 28 * p.scale, '#ff7b4d', 0.12);
      break;
    }
    case 'bush':
      shadow(ctx, p.x, p.y, 13 * p.scale, 5 * p.scale, 0.25);
      for (let i = 0; i < 3; i++) {
        ctx.fillStyle = i % 2 ? '#4d7740' : '#5f8f4e';
        ctx.beginPath(); ctx.arc(p.x + (i - 1) * 7 * p.scale, p.y - 8 * p.scale, 9 * p.scale, 0, TAU); ctx.fill();
      }
      break;
    case 'flower':
      ctx.strokeStyle = '#3f6636';
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x, p.y - 10 * p.scale); ctx.stroke();
      star(ctx, p.x, p.y - 12 * p.scale, 4 * p.scale, region === 'drakmor' ? '#ff9a5c' : '#f0e6b0', 5, time);
      break;
    case 'emberflower':
      glowCircle(ctx, p.x, p.y - 8, 16, '#ff7b4d', 0.3);
      ctx.strokeStyle = '#6a3020'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x, p.y - 12 * p.scale); ctx.stroke();
      flame(ctx, p.x, p.y - 6 * p.scale, 0.35 * p.scale, time, '#ff7b4d');
      break;
    case 'smallrock':
    case 'lavaRock':
    case 'moteStone': {
      shadow(ctx, p.x, p.y, 10 * p.scale, 4 * p.scale, 0.25);
      const col = p.type === 'lavaRock' ? '#4a3a3a' : p.type === 'moteStone' ? '#8a8aa8' : '#7a7a6a';
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.moveTo(p.x - 11 * p.scale, p.y);
      ctx.lineTo(p.x - 8 * p.scale, p.y - 12 * p.scale);
      ctx.lineTo(p.x + 2 * p.scale, p.y - 16 * p.scale);
      ctx.lineTo(p.x + 11 * p.scale, p.y - 6 * p.scale);
      ctx.lineTo(p.x + 9 * p.scale, p.y);
      ctx.closePath(); ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.16)';
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(p.x - 7 * p.scale, p.y - 10 * p.scale); ctx.lineTo(p.x + 1 * p.scale, p.y - 14 * p.scale); ctx.stroke();
      if (p.type === 'lavaRock') {
        glowCircle(ctx, p.x, p.y - 6, 16, '#ff7b4d', 0.18);
        ctx.strokeStyle = 'rgba(255,140,70,0.7)';
        ctx.beginPath(); ctx.moveTo(p.x - 4, p.y - 2); ctx.lineTo(p.x, p.y - 9); ctx.lineTo(p.x + 5, p.y - 5); ctx.stroke();
      }
      if (p.type === 'moteStone') {
        glowCircle(ctx, p.x, p.y - 10, 22, '#ffe7a8', 0.14);
      }
      break;
    }
    case 'bone':
      shadow(ctx, p.x, p.y, 9, 3, 0.2);
      ctx.strokeStyle = '#c8bca8'; ctx.lineWidth = 2; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(p.x - 7, p.y - 3); ctx.lineTo(p.x + 6, p.y - 8); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(p.x + 5, p.y - 2); ctx.lineTo(p.x - 2, p.y - 9); ctx.stroke();
      break;
    case 'bonePile':
      shadow(ctx, p.x, p.y, 18, 5, 0.25);
      for (let i = 0; i < 5; i++) {
        const a = hash2(i, p.seed, 5) * TAU;
        line(ctx, p.x + Math.cos(a) * 4, p.y + Math.sin(a) * 3, p.x + Math.cos(a) * 17, p.y + Math.sin(a) * 10 - 4, '#b8ac98', 2.2);
      }
      break;
    case 'crystalSpire': {
      shadow(ctx, p.x, p.y, 13 * p.scale, 5 * p.scale, 0.3);
      crystalShape(ctx, p.x, p.y, 44 * p.scale, 9 * p.scale, '#9fc9e8');
      crystalShape(ctx, p.x - 9 * p.scale, p.y, 26 * p.scale, 5 * p.scale, '#c7a4ff');
      glowCircle(ctx, p.x, p.y - 26 * p.scale, 38 * p.scale, '#9fe8ff', 0.16);
      break;
    }
    case 'column': {
      shadow(ctx, p.x, p.y, 13 * p.scale, 5 * p.scale, 0.3);
      const h = 70 * p.scale;
      ctx.fillStyle = '#c8c0d8';
      ctx.fillRect(p.x - 7 * p.scale, p.y - h, 14 * p.scale, h);
      ctx.fillStyle = '#a89ac0';
      ctx.fillRect(p.x - 7 * p.scale, p.y - h, 4 * p.scale, h);
      ctx.fillStyle = '#d8d0e8';
      ctx.fillRect(p.x - 12 * p.scale, p.y - h - 7 * p.scale, 24 * p.scale, 8 * p.scale);
      ctx.fillRect(p.x - 11 * p.scale, p.y - 5 * p.scale, 22 * p.scale, 6 * p.scale);
      ctx.strokeStyle = 'rgba(255,231,168,0.35)';
      ctx.lineWidth = 1;
      for (let i = 1; i < 4; i++) {
        ctx.beginPath(); ctx.moveTo(p.x - 5 * p.scale, p.y - h + i * 14 * p.scale); ctx.lineTo(p.x + 5 * p.scale, p.y - h + i * 14 * p.scale); ctx.stroke();
      }
      break;
    }
    case 'floatingRock': {
      const bob = Math.sin(time * 1.3 + p.seed) * 5;
      shadow(ctx, p.x, p.y + 14, 12, 4, 0.2);
      ctx.fillStyle = '#7a7a98';
      ctx.beginPath();
      ctx.moveTo(p.x - 13 * p.scale, p.y - 8 + bob);
      ctx.lineTo(p.x - 7 * p.scale, p.y - 22 + bob);
      ctx.lineTo(p.x + 8 * p.scale, p.y - 18 + bob);
      ctx.lineTo(p.x + 13 * p.scale, p.y - 3 + bob);
      ctx.lineTo(p.x + 2 * p.scale, p.y + 2 + bob);
      ctx.closePath(); ctx.fill();
      glowCircle(ctx, p.x, p.y - 10 + bob, 24, '#c7a4ff', 0.16);
      break;
    }
    case 'floatingObelisk': {
      const bob = Math.sin(time * 1.1 + p.seed) * 6;
      glowCircle(ctx, p.x, p.y - 40 + bob, 50, '#c7a4ff', 0.16);
      ctx.fillStyle = '#2a2440';
      ctx.beginPath();
      ctx.moveTo(p.x, p.y - 90 * p.scale + bob);
      ctx.lineTo(p.x + 12 * p.scale, p.y - 24 * p.scale + bob);
      ctx.lineTo(p.x + 6 * p.scale, p.y + bob);
      ctx.lineTo(p.x - 6 * p.scale, p.y + bob);
      ctx.lineTo(p.x - 12 * p.scale, p.y - 24 * p.scale + bob);
      ctx.closePath(); ctx.fill();
      ctx.strokeStyle = 'rgba(199,164,255,0.7)';
      ctx.lineWidth = 1.4;
      ctx.beginPath(); ctx.moveTo(p.x, p.y - 78 * p.scale + bob); ctx.lineTo(p.x, p.y - 30 * p.scale + bob); ctx.stroke();
      star(ctx, p.x, p.y - 54 * p.scale + bob, 5, '#ffe7a8', 4, time * 0.4);
      break;
    }
    case 'pillar': {
      shadow(ctx, p.x, p.y, 16, 6, 0.3);
      ctx.fillStyle = '#8a8272';
      ctx.fillRect(p.x - 9, p.y - 62, 18, 62);
      ctx.fillStyle = '#a39a86';
      ctx.fillRect(p.x - 9, p.y - 62, 5, 62);
      ctx.fillStyle = '#6f685a';
      ctx.fillRect(p.x - 13, p.y - 5, 26, 7);
      break;
    }
    case 'fence': {
      shadow(ctx, p.x, p.y, 15, 4, 0.2);
      ctx.fillStyle = '#6a4a30';
      ctx.fillRect(p.x - 2, p.y - 22 * p.scale, 4, 22 * p.scale);
      ctx.fillRect(p.x - 14, p.y - 15 * p.scale, 28, 3);
      ctx.fillRect(p.x - 14, p.y - 7 * p.scale, 28, 3);
      break;
    }
    case 'well': {
      shadow(ctx, p.x, p.y, 22, 8, 0.3);
      ctx.fillStyle = '#8a8272';
      ctx.beginPath(); ctx.ellipse(p.x, p.y - 8, 20, 11, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = '#2a2a3a';
      ctx.beginPath(); ctx.ellipse(p.x, p.y - 10, 14, 7, 0, 0, TAU); ctx.fill();
      ctx.strokeStyle = '#6a4a30'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(p.x - 15, p.y - 14); ctx.lineTo(p.x - 15, p.y - 46); ctx.lineTo(p.x + 15, p.y - 46); ctx.lineTo(p.x + 15, p.y - 14); ctx.stroke();
      ctx.fillStyle = '#5a3a22';
      ctx.beginPath(); ctx.moveTo(p.x - 20, p.y - 46); ctx.lineTo(p.x, p.y - 58); ctx.lineTo(p.x + 20, p.y - 46); ctx.closePath(); ctx.fill();
      break;
    }
    case 'banner': {
      ctx.strokeStyle = '#4a3524'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x, p.y - 58 * p.scale); ctx.stroke();
      const wave = Math.sin(time * 2 + p.seed) * 3;
      ctx.fillStyle = region === 'drakmor' ? '#8a2a1a' : region === 'kansordore' ? '#5a4a8a' : '#7a3a4a';
      ctx.beginPath();
      ctx.moveTo(p.x + 1, p.y - 55 * p.scale);
      ctx.quadraticCurveTo(p.x + 18 + wave, p.y - 48 * p.scale, p.x + 14 + wave, p.y - 34 * p.scale);
      ctx.lineTo(p.x + 1, p.y - 30 * p.scale);
      ctx.closePath(); ctx.fill();
      star(ctx, p.x + 6, p.y - 43 * p.scale, 4, '#ffe7a8', 4, 0);
      break;
    }
    case 'statue': {
      shadow(ctx, p.x, p.y, 15, 5, 0.3);
      ctx.fillStyle = '#8a8aa8';
      ctx.fillRect(p.x - 11, p.y - 12, 22, 12);
      ctx.fillStyle = '#b8b0c8';
      ctx.beginPath();
      ctx.moveTo(p.x - 8, p.y - 12);
      ctx.quadraticCurveTo(p.x - 10, p.y - 40, p.x - 4, p.y - 52);
      ctx.lineTo(p.x + 4, p.y - 52);
      ctx.quadraticCurveTo(p.x + 10, p.y - 40, p.x + 8, p.y - 12);
      ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.arc(p.x, p.y - 56, 6, 0, TAU); ctx.fill();
      glowCircle(ctx, p.x, p.y - 56, 22, '#ffe7a8', 0.1);
      break;
    }
    case 'runeStone': {
      shadow(ctx, p.x, p.y, 12, 4, 0.3);
      ctx.fillStyle = '#6a645a';
      ctx.beginPath();
      ctx.moveTo(p.x - 10, p.y);
      ctx.lineTo(p.x - 7, p.y - 38);
      ctx.lineTo(p.x + 3, p.y - 46);
      ctx.lineTo(p.x + 9, p.y - 30);
      ctx.lineTo(p.x + 8, p.y);
      ctx.closePath(); ctx.fill();
      ctx.strokeStyle = 'rgba(143,209,138,0.6)';
      ctx.lineWidth = 1.3;
      ctx.beginPath(); ctx.arc(p.x, p.y - 25, 5, 0, TAU); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(p.x, p.y - 32); ctx.lineTo(p.x, p.y - 18); ctx.stroke();
      glowCircle(ctx, p.x, p.y - 25, 18, '#8fd18a', 0.15);
      break;
    }
    case 'ruinPillar': {
      shadow(ctx, p.x, p.y, 13, 5, 0.3);
      ctx.fillStyle = '#9a907c';
      ctx.fillRect(p.x - 8, p.y - 44, 16, 44);
      ctx.fillStyle = '#b8ac98';
      ctx.fillRect(p.x - 8, p.y - 44, 5, 44);
      ctx.fillStyle = '#6a645a';
      ctx.beginPath();
      ctx.moveTo(p.x - 8, p.y - 44);
      ctx.lineTo(p.x - 2, p.y - 54);
      ctx.lineTo(p.x + 8, p.y - 46);
      ctx.lineTo(p.x + 8, p.y - 44);
      ctx.closePath(); ctx.fill();
      break;
    }
    case 'arch': {
      ctx.strokeStyle = '#8a8272';
      ctx.lineWidth = 14;
      ctx.beginPath();
      ctx.moveTo(p.x - 38, p.y);
      ctx.lineTo(p.x - 38, p.y - 50);
      ctx.quadraticCurveTo(p.x, p.y - 96, p.x + 38, p.y - 50);
      ctx.lineTo(p.x + 38, p.y);
      ctx.stroke();
      ctx.strokeStyle = '#b8ac98';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(p.x - 38, p.y - 6);
      ctx.lineTo(p.x - 38, p.y - 50);
      ctx.quadraticCurveTo(p.x, p.y - 92, p.x + 38, p.y - 50);
      ctx.lineTo(p.x + 38, p.y - 6);
      ctx.stroke();
      break;
    }
    case 'fortressWall': {
      shadow(ctx, p.x, p.y, 17, 6, 0.35);
      ctx.fillStyle = '#4a3a32';
      ctx.fillRect(p.x - 15, p.y - 58, 30, 58);
      ctx.fillStyle = '#5a4a42';
      for (let i = 0; i < 4; i++) for (let j = 0; j < 2; j++) {
        ctx.fillRect(p.x - 14 + j * 15, p.y - 56 + i * 14, 13, 11);
      }
      glowCircle(ctx, p.x, p.y - 30, 24, '#ff7b4d', 0.1);
      break;
    }
    case 'forgeBig': {
      shadow(ctx, p.x, p.y, 50, 16, 0.35);
      ctx.fillStyle = '#3a302a';
      ctx.fillRect(p.x - 48, p.y - 50, 96, 50);
      ctx.fillStyle = '#2a2220';
      ctx.fillRect(p.x - 40, p.y - 42, 32, 42);
      ctx.fillStyle = '#ff7b4d';
      ctx.fillRect(p.x - 34, p.y - 26, 20, 16);
      glowCircle(ctx, p.x - 24, p.y - 18, 46, '#ff7b4d', 0.25);
      ctx.fillStyle = '#5a4a42';
      ctx.fillRect(p.x + 8, p.y - 22, 28, 16);
      ctx.fillStyle = '#8a8272';
      ctx.fillRect(p.x + 14, p.y - 30, 16, 8);
      break;
    }
    case 'seal': {
      glowCircle(ctx, p.x, p.y - 30, 64, '#ffe7a8', 0.16);
      ctx.strokeStyle = 'rgba(255,231,168,0.55)';
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(p.x, p.y - 24, 34, 0, TAU); ctx.stroke();
      ctx.beginPath(); ctx.arc(p.x, p.y - 24, 24, 0, TAU); ctx.stroke();
      star(ctx, p.x, p.y - 24, 16, '#ffe7a8', 8, time * 0.2);
      for (let i = 0; i < 4; i++) {
        const a = (i / 4) * TAU + time * 0.1;
        ctx.strokeStyle = 'rgba(255,231,168,0.35)';
        ctx.beginPath();
        ctx.moveTo(p.x + Math.cos(a) * 36, p.y - 24 + Math.sin(a) * 36);
        ctx.lineTo(p.x + Math.cos(a) * 48, p.y - 24 + Math.sin(a) * 48);
        ctx.stroke();
      }
      break;
    }
    case 'elderHouse': case 'forge': case 'shop': case 'healer': case 'house':
    case 'outpost': case 'tent': case 'temple': case 'library': case 'shrine':
      drawHouse(ctx, p, region, time);
      break;
    default: break;
  }
}

function drawHouse(ctx, p, region, time) {
  const w = p.w || 100, h = p.h || 70;
  const x = p.x, y = p.y;
  const type = p.type;
  shadow(ctx, x, y + h * 0.48, w * 0.52, h * 0.18, 0.32);
  const wall = type === 'temple' || type === 'library' || type === 'shrine' ? '#c8c0d8' : region === 'drakmor' ? '#5a4a42' : region === 'kansordore' ? '#b8b0c8' : '#a89272';
  const roof = type === 'forge' ? '#4a3a32' : region === 'drakmor' ? '#3a2a2a' : region === 'kansordore' ? '#5a4a8a' : '#7a3a3a';
  const bx = x - w / 2, by = y - h * 0.3;
  ctx.fillStyle = wall;
  ctx.fillRect(bx, by, w, h * 0.78);
  ctx.fillStyle = 'rgba(0,0,0,0.18)';
  ctx.fillRect(bx, by + h * 0.5, w, h * 0.28);
  // Tejado.
  ctx.fillStyle = roof;
  ctx.beginPath();
  if (type === 'tent') {
    ctx.moveTo(x, y - h * 1.1);
    ctx.lineTo(x + w * 0.62, y + h * 0.42);
    ctx.lineTo(x - w * 0.62, y + h * 0.42);
  } else {
    ctx.moveTo(bx - w * 0.1, by);
    ctx.lineTo(x, y - h * 0.78);
    ctx.lineTo(bx + w * 1.1, by);
  }
  ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.16)';
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(x, y - h * 0.76); ctx.lineTo(bx - w * 0.06, by); ctx.stroke();

  // Puerta y ventanas.
  ctx.fillStyle = '#3a2a20';
  ctx.fillRect(x - w * 0.09, y + h * 0.08, w * 0.18, h * 0.4);
  ctx.fillStyle = 'rgba(255,220,150,0.75)';
  if (type === 'forge') {
    ctx.fillRect(x - w * 0.3, y - h * 0.05, w * 0.16, h * 0.16);
    glowCircle(ctx, x - w * 0.22, y + h * 0.02, w * 0.26, '#ff7b4d', 0.3);
  } else {
    ctx.fillRect(x - w * 0.32, y - h * 0.05, w * 0.12, h * 0.14);
    ctx.fillRect(x + w * 0.2, y - h * 0.05, w * 0.12, h * 0.14);
  }
  if (type === 'healer') {
    ctx.fillStyle = '#8fd18a';
    ctx.fillRect(x + w * 0.3, y - h * 0.34, w * 0.08, h * 0.16);
    ctx.fillRect(x + w * 0.25, y - h * 0.29, w * 0.18, h * 0.06);
  }
  if (type === 'shop') {
    for (let i = 0; i < 5; i++) {
      ctx.fillStyle = i % 2 ? '#d9b46a' : '#7a3a4a';
      ctx.fillRect(bx + (i / 5) * w, by + h * 0.25, w / 5, h * 0.1);
    }
  }
  if (type === 'temple' || type === 'library') {
    ctx.fillStyle = '#e8e0f0';
    for (let i = 0; i < 4; i++) {
      ctx.fillRect(bx + 6 + i * (w - 12) / 3.2, by + h * 0.05, 7, h * 0.7);
    }
    glowCircle(ctx, x, y - h * 0.2, w * 0.4, '#ffe7a8', 0.12);
  }
  if (type === 'forge') {
    // Chimenea y humo.
    ctx.fillStyle = '#4a3a32';
    ctx.fillRect(x + w * 0.28, y - h * 0.9, w * 0.14, h * 0.5);
    for (let i = 0; i < 4; i++) {
      const t = (time * 0.2 + i * 0.25) % 1;
      ctx.fillStyle = `rgba(120,110,105,${0.28 * (1 - t)})`;
      ctx.beginPath();
      ctx.arc(x + w * 0.35 + Math.sin(t * 5 + i) * 8, y - h * 0.95 - t * 40, 4 + t * 8, 0, TAU);
      ctx.fill();
    }
  }
  if (type === 'elderHouse') {
    ctx.strokeStyle = '#d9b46a'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(x, y - h * 0.1, w * 0.1, 0, TAU); ctx.stroke();
    star(ctx, x, y - h * 0.1, w * 0.06, '#ffe7a8', 4, 0);
  }
}

export function drawInteractable(ctx, it, state, time) {
  const x = it.x, y = it.y;
  const active = state?.active;
  const opened = state?.opened;
  switch (it.type) {
    case 'chest': {
      shadow(ctx, x, y + 4, 15, 5, 0.3);
      const c = opened ? '#5a4a3a' : '#8a6a3a';
      ctx.fillStyle = c;
      roundRect(ctx, x - 14, y - 12, 28, 18, 3); ctx.fill();
      ctx.fillStyle = opened ? '#3a2a1a' : '#b98a4a';
      if (opened) {
        ctx.save(); ctx.translate(x, y - 12); ctx.rotate(-0.5);
        roundRect(ctx, -14, -8, 28, 9, 3); ctx.fill(); ctx.restore();
        glowCircle(ctx, x, y - 8, 28, '#ffe7a8', 0.15);
      } else {
        roundRect(ctx, x - 14, y - 18, 28, 8, 3); ctx.fill();
        ctx.fillStyle = '#ffe7a8';
        ctx.fillRect(x - 3, y - 11, 6, 7);
        glowCircle(ctx, x, y - 10, 26, '#ffcf6a', 0.16);
      }
      break;
    }
    case 'altar': {
      shadow(ctx, x, y + 6, 26, 8, 0.35);
      ctx.fillStyle = '#8a8272';
      ctx.fillRect(x - 24, y - 16, 48, 16);
      ctx.fillStyle = '#a89e88';
      ctx.fillRect(x - 20, y - 26, 40, 10);
      glowCircle(ctx, x, y - 42, 54, '#ffe7a8', 0.2);
      const bob = Math.sin(time * 1.5) * 3;
      ctx.save();
      ctx.translate(x, y - 58 + bob);
      ctx.rotate(-0.2);
      ctx.fillStyle = '#e8f4ff';
      ctx.fillRect(-2, -26, 4, 34);
      ctx.fillStyle = '#d9b46a';
      ctx.fillRect(-8, 6, 16, 3);
      ctx.restore();
      star(ctx, x, y - 86 + bob, 7, '#fff3c4', 4, time * 0.5);
      break;
    }
    case 'lore': {
      shadow(ctx, x, y + 4, 15, 5, 0.28);
      ctx.fillStyle = '#6a645a';
      ctx.beginPath();
      ctx.moveTo(x - 13, y);
      ctx.lineTo(x - 11, y - 34);
      ctx.lineTo(x + 9, y - 38);
      ctx.lineTo(x + 13, y);
      ctx.closePath(); ctx.fill();
      ctx.strokeStyle = 'rgba(255,231,168,0.5)';
      ctx.lineWidth = 1;
      for (let i = 0; i < 3; i++) {
        ctx.beginPath(); ctx.moveTo(x - 6, y - 27 + i * 6); ctx.lineTo(x + 6, y - 29 + i * 6); ctx.stroke();
      }
      glowCircle(ctx, x, y - 24, 22, '#ffe7a8', 0.12);
      break;
    }
    case 'herb': {
      if (opened) break;
      glowCircle(ctx, x, y - 8, 20, '#d9e8ff', 0.2);
      ctx.strokeStyle = '#5f8f4e'; ctx.lineWidth = 1.5;
      for (let i = 0; i < 4; i++) {
        const a = -Math.PI / 2 + (i - 1.5) * 0.45;
        ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + Math.cos(a) * 7, y - 10, x + Math.cos(a) * 13, y - 18); ctx.stroke();
      }
      star(ctx, x, y - 18, 5, '#e8f4ff', 5, time);
      break;
    }
    case 'ore': {
      if (opened) break;
      shadow(ctx, x, y + 3, 12, 4, 0.25);
      ctx.fillStyle = '#6a645a';
      ctx.beginPath(); ctx.moveTo(x - 12, y); ctx.lineTo(x - 7, y - 14); ctx.lineTo(x + 5, y - 17); ctx.lineTo(x + 12, y - 4); ctx.lineTo(x + 6, y); ctx.closePath(); ctx.fill();
      if (it.item === 'living_ash') {
        glowCircle(ctx, x, y - 8, 22, '#ff7b4d', 0.2);
        ctx.fillStyle = '#ff9a5c';
        ctx.beginPath(); ctx.arc(x, y - 9, 3, 0, TAU); ctx.fill();
      } else {
        glowCircle(ctx, x, y - 8, 18, '#9fc9e8', 0.15);
        crystalShape(ctx, x, y - 2, 14, 3, '#9fc9e8');
      }
      break;
    }
    case 'brazier': {
      shadow(ctx, x, y + 3, 10, 4, 0.3);
      ctx.fillStyle = '#5a4a42';
      ctx.fillRect(x - 3, y - 14, 6, 14);
      ctx.fillStyle = '#8a8272';
      ctx.beginPath(); ctx.ellipse(x, y - 16, 11, 5, 0, 0, TAU); ctx.fill();
      if (active) {
        flame(ctx, x, y - 16, 1.1, time, '#ff9a5c');
        glowCircle(ctx, x, y - 20, 34, '#ff9a5c', 0.24);
      } else {
        ctx.fillStyle = '#3a2a24';
        ctx.beginPath(); ctx.ellipse(x, y - 16, 7, 3, 0, 0, TAU); ctx.fill();
      }
      break;
    }
    case 'lever': {
      shadow(ctx, x, y + 3, 10, 4, 0.3);
      ctx.fillStyle = '#5a4a42';
      ctx.fillRect(x - 5, y - 26, 10, 26);
      ctx.strokeStyle = active ? '#8fd18a' : '#8a8272';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(x, y - 22);
      ctx.lineTo(x + (active ? 12 : -12), y - (active ? 34 : 34));
      ctx.stroke();
      ctx.fillStyle = active ? '#8fd18a' : '#ff9a5c';
      ctx.beginPath(); ctx.arc(x + (active ? 12 : -12), y - 34, 4, 0, TAU); ctx.fill();
      glowCircle(ctx, x, y - 28, active ? 30 : 18, active ? '#8fd18a' : '#ff9a5c', active ? 0.22 : 0.1);
      break;
    }
    case 'crystal': {
      const bob = Math.sin(time * 1.6 + (it.order || 0)) * 3;
      glowCircle(ctx, x, y - 26 + bob, active ? 40 : 24, active ? '#ffe7a8' : '#c7a4ff', active ? 0.28 : 0.14);
      crystalShape(ctx, x, y - 2 + bob, 38, 8, active ? '#ffe7a8' : '#c7a4ff');
      star(ctx, x, y - 52 + bob, 4, '#fff3c4', 4, time);
      break;
    }
    case 'page': {
      if (opened) break;
      const bob = Math.sin(time * 2 + x) * 4;
      glowCircle(ctx, x, y - 20 + bob, 26, '#e8d9a8', 0.2);
      ctx.save();
      ctx.translate(x, y - 20 + bob);
      ctx.rotate(Math.sin(time + x) * 0.12);
      ctx.fillStyle = '#e8d9a8';
      ctx.fillRect(-7, -10, 14, 20);
      ctx.strokeStyle = 'rgba(90,70,40,0.6)'; ctx.lineWidth = 1;
      for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(-4, -6 + i * 4); ctx.lineTo(4, -6 + i * 4); ctx.stroke(); }
      ctx.restore();
      break;
    }
    case 'gate': {
      glowCircle(ctx, x, y - 34, 46, '#ffe7a8', 0.16);
      ctx.strokeStyle = '#b8ac98'; ctx.lineWidth = 9;
      ctx.beginPath();
      ctx.moveTo(x - 26, y);
      ctx.lineTo(x - 26, y - 46);
      ctx.quadraticCurveTo(x, y - 80, x + 26, y - 46);
      ctx.lineTo(x + 26, y);
      ctx.stroke();
      ctx.strokeStyle = 'rgba(255,231,168,0.55)'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(x, y - 36, 15, 0, TAU); ctx.stroke();
      break;
    }
    case 'bossdoor': {
      glowCircle(ctx, x, y - 36, 60, active ? '#8fd18a' : '#ffcf6a', 0.12);
      ctx.strokeStyle = '#5a4a42'; ctx.lineWidth = 16;
      ctx.beginPath();
      ctx.moveTo(x - 36, y);
      ctx.lineTo(x - 36, y - 54);
      ctx.quadraticCurveTo(x, y - 104, x + 36, y - 54);
      ctx.lineTo(x + 36, y);
      ctx.stroke();
      ctx.strokeStyle = '#8a8272'; ctx.lineWidth = 3;
      ctx.stroke();
      break;
    }
    case 'forge': {
      shadow(ctx, x, y + 4, 18, 6, 0.3);
      ctx.fillStyle = '#4a3a32';
      ctx.fillRect(x - 18, y - 14, 36, 14);
      ctx.fillStyle = '#6a5a50';
      ctx.fillRect(x - 8, y - 26, 16, 12);
      ctx.fillStyle = '#8a8272';
      ctx.beginPath(); ctx.moveTo(x - 14, y - 26); ctx.lineTo(x + 14, y - 26); ctx.lineTo(x + 8, y - 34); ctx.lineTo(x - 8, y - 34); ctx.closePath(); ctx.fill();
      glowCircle(ctx, x, y - 10, 24, '#ff7b4d', 0.18);
      break;
    }
    case 'sign': {
      shadow(ctx, x, y + 3, 8, 3, 0.25);
      ctx.fillStyle = '#6a4a30';
      ctx.fillRect(x - 2, y - 24, 4, 24);
      ctx.fillStyle = '#8a6248';
      ctx.fillRect(x - 14, y - 32, 28, 12);
      ctx.strokeStyle = 'rgba(40,26,16,0.6)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(x - 10, y - 28); ctx.lineTo(x + 8, y - 28); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x - 10, y - 24); ctx.lineTo(x + 4, y - 24); ctx.stroke();
      break;
    }
    case 'survivor': break;
    default: break;
  }
}
