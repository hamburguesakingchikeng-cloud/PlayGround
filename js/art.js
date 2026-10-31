import { TILE } from './data.js';
import { TAU, clamp, hash2, rgba, lerp } from './util.js';

// ───────────────────────── helpers ─────────────────────────
export function rr(ctx, x, y, w, h, r) {
  r = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
export function ell(ctx, x, y, rx, ry) { ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, TAU); }
export function shadow(ctx, x, y, rx, ry, a = .3) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, rx);
  g.addColorStop(0, `rgba(4,7,10,${a})`);
  g.addColorStop(1, 'rgba(4,7,10,0)');
  ctx.save(); ctx.translate(x, y); ctx.scale(1, ry / rx); ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(0, 0, rx, 0, TAU); ctx.fill(); ctx.restore();
}
export function glow(ctx, x, y, r, color, alpha = .5) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, rgba(color, alpha));
  g.addColorStop(.45, rgba(color, alpha * .32));
  g.addColorStop(1, rgba(color, 0));
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill(); ctx.restore();
}
export function line(ctx, x1, y1, x2, y2, color, w = 2, cap = 'round') {
  ctx.strokeStyle = color; ctx.lineWidth = w; ctx.lineCap = cap;
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
}
export function flame(ctx, x, y, t, scale = 1, color = '#ff9a4a') {
  const n = Math.sin(t * 9 + x) * .5 + Math.sin(t * 13 + y) * .5;
  const g = ctx.createRadialGradient(x, y - 8 * scale, 1, x, y - 8 * scale, 28 * scale);
  g.addColorStop(0, 'rgba(255,246,198,.95)');
  g.addColorStop(.35, rgba(color, .8));
  g.addColorStop(1, 'rgba(220,60,20,0)');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(x - 8 * scale, y);
  ctx.quadraticCurveTo(x - 11 * scale, y - 13 * scale, x + n * 3 * scale, y - 29 * scale + n * 4);
  ctx.quadraticCurveTo(x + 11 * scale, y - 12 * scale, x + 8 * scale, y);
  ctx.closePath(); ctx.fill();
}
function leaf(ctx, x, y, size, color, rot) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.fillStyle = color;
  ctx.beginPath(); ctx.ellipse(0, 0, size, size * .42, 0, 0, TAU); ctx.fill(); ctx.restore();
}

// ───────────────────────── terreno ─────────────────────────
export function drawTerrain(ctx, world, cam, view, time) {
  const { def, terrain, W, H } = world;
  const P = def.palette;
  const t = time;
  const x0 = Math.max(0, Math.floor(cam.x / TILE) - 1);
  const x1 = Math.min(W - 1, Math.ceil((cam.x + view.w) / TILE) + 1);
  const y0 = Math.max(0, Math.floor(cam.y / TILE) - 1);
  const y1 = Math.min(H - 1, Math.ceil((cam.y + view.h) / TILE) + 1);
  const isDrakmor = def.id === 'drakmor';
  const isKan = def.id === 'kansordore';

  for (let ty = y0; ty <= y1; ty++) {
    for (let tx = x0; tx <= x1; tx++) {
      const type = terrain[ty * W + tx];
      const wx = tx * TILE, wy = ty * TILE;
      const h = hash2(tx, ty, def.seed + 4);
      if (type === 0 || type === 1) {
        const base = type === 0 ? P.grass1 : P.grass2;
        ctx.fillStyle = base;
        ctx.fillRect(wx, wy, TILE + 1, TILE + 1);
        // grandes manchas de color
        if (h > .55) {
          ctx.fillStyle = rgba(P.grass3, .18 + h * .12);
          ell(ctx, wx + TILE * .5, wy + TILE * .5, TILE * (.3 + h * .25), TILE * .32); ctx.fill();
        }
        // briznas
        const n = 2 + Math.floor(h * 4);
        for (let i = 0; i < n; i++) {
          const hx = hash2(tx * 9 + i, ty * 13, 5);
          const hy = hash2(tx * 7, ty * 11 + i, 6);
          const bx = wx + hx * TILE, by = wy + hy * TILE;
          ctx.strokeStyle = rgba(h > .6 ? P.grass4 : P.bloom, .18 + h * .16);
          ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(bx + (hx - .5) * 5, by - 3 - hy * 5); ctx.stroke();
        }
        // flores silvestres
        if (h > .965) {
          const fx = wx + TILE * .3 + h * 20, fy = wy + TILE * .4;
          for (let i = 0; i < 3; i++) {
            ctx.fillStyle = isDrakmor ? '#e8824a' : isKan ? '#bcdde4' : i % 2 ? '#dfcf82' : '#d8e3d2';
            ell(ctx, fx + i * 4, fy + (i % 2) * 4, 2, 2); ctx.fill();
          }
        }
      } else if (type === 2) {
        ctx.fillStyle = h > .5 ? P.path : P.path2;
        ctx.fillRect(wx, wy, TILE + 1, TILE + 1);
        ctx.fillStyle = 'rgba(0,0,0,.07)';
        if (h > .6) { ell(ctx, wx + TILE * .5, wy + TILE * .5, TILE * .35, TILE * .2); ctx.fill(); }
        // piedras
        for (let i = 0; i < 2; i++) {
          const px = wx + hash2(tx + i, ty, 7) * TILE, py = wy + hash2(tx, ty + i, 8) * TILE;
          ctx.fillStyle = rgba(P.stone, .35);
          ell(ctx, px, py, 2 + (i * h) * 2, 1.5); ctx.fill();
        }
      } else if (type === 3) {
        // agua, lava o vacío
        const g = ctx.createLinearGradient(wx, wy, wx, wy + TILE);
        if (isDrakmor) { g.addColorStop(0, '#7d2a16'); g.addColorStop(1, '#c34b1e'); }
        else if (isKan) { g.addColorStop(0, '#102f45'); g.addColorStop(1, '#1b4b64'); }
        else { g.addColorStop(0, P.water); g.addColorStop(1, P.water2); }
        ctx.fillStyle = g; ctx.fillRect(wx, wy, TILE + 1, TILE + 1);
        const wave = Math.sin(t * 1.4 + tx * .9 + ty * .6) * .5 + .5;
        ctx.strokeStyle = isDrakmor ? `rgba(255,170,80,${.16 + wave * .25})` : isKan ? `rgba(150,220,240,${.12 + wave * .2})` : `rgba(190,225,220,${.1 + wave * .2})`;
        ctx.lineWidth = 1.2;
        for (let i = 0; i < 2; i++) {
          const wyy = wy + TILE * (.3 + i * .35) + Math.sin(t + i + tx) * 3;
          ctx.beginPath(); ctx.moveTo(wx + 8, wyy); ctx.quadraticCurveTo(wx + TILE * .5, wyy - 4, wx + TILE - 8, wyy); ctx.stroke();
        }
        if (isDrakmor && h > .8) glow(ctx, wx + TILE / 2, wy + TILE / 2, 50, '#ff6b2a', .16);
        if (isKan && h > .88) glow(ctx, wx + TILE / 2, wy + TILE / 2, 55, '#8ee3ef', .1);
      } else if (type === 4) {
        ctx.fillStyle = isKan ? (h > .5 ? '#46505f' : '#3d4755') : isDrakmor ? (h > .5 ? '#4b3c36' : '#42342f') : (h > .5 ? '#6e6656' : '#655e4f');
        ctx.fillRect(wx, wy, TILE + 1, TILE + 1);
        ctx.strokeStyle = 'rgba(0,0,0,.16)'; ctx.lineWidth = 1;
        if (h > .7) {
          ctx.beginPath(); ctx.moveTo(wx + TILE * .2, wy + TILE * .8); ctx.lineTo(wx + TILE * .45, wy + TILE * .4); ctx.lineTo(wx + TILE * .7, wy + TILE * .55); ctx.stroke();
        }
        ctx.fillStyle = 'rgba(255,255,255,.035)';
        ctx.fillRect(wx + 2, wy + 2, TILE - 4, 2);
      } else if (type === 5) {
        ctx.fillStyle = isKan ? '#5b6980' : '#57483e';
        ctx.fillRect(wx, wy, TILE + 1, TILE + 1);
        ctx.fillStyle = 'rgba(0,0,0,.22)';
        for (let i = 0; i < 4; i++) ctx.fillRect(wx, wy + i * 16 + 4, TILE, 2);
        ctx.fillStyle = 'rgba(255,220,170,.07)';
        ctx.fillRect(wx, wy + 2, TILE, 2);
      } else if (type === 7) {
        ctx.fillStyle = P.cliff;
        ctx.fillRect(wx, wy, TILE + 1, TILE + 1);
        ctx.fillStyle = rgba(P.cliff2, .6);
        ell(ctx, wx + TILE * .5, wy + TILE * .6, TILE * .55, TILE * .35); ctx.fill();
      }
      // borde de agua: espuma
      if (type !== 3 && tx > 0 && ty > 0 && tx < W - 1 && ty < H - 1) {
        const right = terrain[ty * W + tx + 1], left = terrain[ty * W + tx - 1];
        const down = terrain[(ty + 1) * W + tx], up = terrain[(ty - 1) * W + tx];
        if (right === 3) { ctx.fillStyle = isDrakmor ? 'rgba(255,160,90,.25)' : 'rgba(180,225,220,.22)'; ctx.fillRect(wx + TILE - 3, wy, 3, TILE); }
        if (left === 3) { ctx.fillStyle = isDrakmor ? 'rgba(255,160,90,.25)' : 'rgba(180,225,220,.22)'; ctx.fillRect(wx, wy, 3, TILE); }
        if (down === 3) { ctx.fillStyle = isDrakmor ? 'rgba(255,160,90,.2)' : 'rgba(180,225,220,.16)'; ctx.fillRect(wx, wy + TILE - 3, TILE, 3); }
        if (up === 3) { ctx.fillStyle = isDrakmor ? 'rgba(255,160,90,.2)' : 'rgba(180,225,220,.16)'; ctx.fillRect(wx, wy, TILE, 3); }
      }
    }
  }
}

// ───────────────────────── props naturales ─────────────────────────
export function drawProp(ctx, p, time, world) {
  const t = time;
  const sway = Math.sin(t * .7 + p.x * .01) * 3;
  const isVal = world.id === 'valdoria';
  switch (p.type) {
    case 'tree_oak': {
      shadow(ctx, p.x + 14, p.y + 3, 48, 14, .35);
      ctx.fillStyle = '#4b3524'; rr(ctx, p.x - 8, p.y - 80, 16, 82, 5); ctx.fill();
      ctx.strokeStyle = '#5c4230'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(p.x, p.y - 58); ctx.lineTo(p.x - 25, p.y - 92); ctx.moveTo(p.x + 4, p.y - 66); ctx.lineTo(p.x + 28, p.y - 98); ctx.stroke();
      const layers = [
        { x: p.x - 22 + sway * .5, y: p.y - 94, r: 34, c: '#2c4a2e' },
        { x: p.x + 24 + sway * .7, y: p.y - 102, r: 32, c: '#315434' },
        { x: p.x + sway, y: p.y - 126, r: 39, c: '#355c38' },
        { x: p.x - 10, y: p.y - 144, r: 26, c: '#3c6540' }
      ];
      for (const l of layers) {
        ctx.fillStyle = l.c; ell(ctx, l.x, l.y, l.r, l.r * .86); ctx.fill();
        ctx.fillStyle = 'rgba(180,205,130,.10)'; ell(ctx, l.x - l.r * .25, l.y - l.r * .25, l.r * .45, l.r * .3); ctx.fill();
      }
      for (let i = 0; i < 4; i++) {
        ctx.fillStyle = 'rgba(232,222,150,.5)';
        ell(ctx, p.x - 24 + i * 14 + sway * .4, p.y - 118 + (i % 3) * 14, 2.2, 2.2); ctx.fill();
      }
      break;
    }
    case 'tree_pine': {
      shadow(ctx, p.x + 15, p.y + 3, 40, 13, .32);
      ctx.fillStyle = '#3e2e20'; ctx.fillRect(p.x - 6, p.y - 48, 12, 50);
      for (let i = 0; i < 4; i++) {
        const y = p.y - 44 - i * 26, w = 44 - i * 8;
        ctx.fillStyle = i % 2 ? '#26442f' : '#2d5036';
        ctx.beginPath(); ctx.moveTo(p.x - w, y); ctx.lineTo(p.x + w, y); ctx.lineTo(p.x + sway * (i + 1) * .3, y - 46); ctx.closePath(); ctx.fill();
        ctx.fillStyle = 'rgba(170,210,150,.09)';
        ctx.beginPath(); ctx.moveTo(p.x, y - 46); ctx.lineTo(p.x + w, y); ctx.lineTo(p.x + 4, y); ctx.closePath(); ctx.fill();
      }
      break;
    }
    case 'tree_birch': {
      shadow(ctx, p.x + 12, p.y + 3, 34, 11, .3);
      ctx.fillStyle = '#c9c4b2'; rr(ctx, p.x - 6, p.y - 92, 12, 94, 4); ctx.fill();
      ctx.fillStyle = 'rgba(30,30,26,.5)';
      for (let i = 0; i < 5; i++) ctx.fillRect(p.x - 6, p.y - 78 + i * 15, 6 + (i % 3) * 3, 2);
      const cols = ['#5b7a46', '#6b8b50', '#516f40'];
      for (let i = 0; i < 4; i++) {
        ctx.fillStyle = cols[i % 3];
        ell(ctx, p.x - 18 + (i % 2) * 30 + sway * .5, p.y - 94 - (i % 2) * 24, 24, 19); ctx.fill();
      }
      break;
    }
    case 'dead_tree': {
      shadow(ctx, p.x + 12, p.y + 2, 36, 10, .28);
      ctx.strokeStyle = '#241f1e'; ctx.lineCap = 'round';
      ctx.lineWidth = 10; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.quadraticCurveTo(p.x - 4, p.y - 40, p.x - 10, p.y - 84); ctx.stroke();
      ctx.lineWidth = 4;
      const branches = [[-10, -84, -38, -106], [-8, -72, 20, -96], [-9, -60, -34, -72], [15, -94, 38, -112]];
      for (const b of branches) {
        ctx.beginPath(); ctx.moveTo(p.x + b[0], p.y + b[1]); ctx.quadraticCurveTo(p.x + (b[0] + b[2]) / 2 - 6, p.y + (b[1] + b[3]) / 2, p.x + b[2] + sway * .4, p.y + b[3]); ctx.stroke();
      }
      break;
    }
    case 'charred_stump': {
      shadow(ctx, p.x + 8, p.y + 2, 24, 8, .28);
      ctx.fillStyle = '#2b2421'; rr(ctx, p.x - 13, p.y - 26, 26, 28, 4); ctx.fill();
      ctx.fillStyle = '#3a2f2a'; ell(ctx, p.x, p.y - 26, 14, 6); ctx.fill();
      ctx.strokeStyle = 'rgba(255,120,50,.35)'; ctx.lineWidth = 1;
      ell(ctx, p.x, p.y - 26, 9, 3); ctx.stroke();
      break;
    }
    case 'obsidian': {
      shadow(ctx, p.x + 10, p.y + 2, 26, 8, .3);
      const g = ctx.createLinearGradient(p.x - 20, p.y, p.x + 20, p.y - 60);
      g.addColorStop(0, '#1a1820'); g.addColorStop(1, '#3c3648');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.moveTo(p.x - 20, p.y); ctx.lineTo(p.x - 8, p.y - 38); ctx.lineTo(p.x + 3, p.y - 56); ctx.lineTo(p.x + 14, p.y - 24); ctx.lineTo(p.x + 20, p.y); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = 'rgba(230,130,90,.3)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(p.x - 8, p.y - 38); ctx.lineTo(p.x + 2, p.y - 12); ctx.lineTo(p.x + 12, p.y - 26); ctx.stroke();
      break;
    }
    case 'rock': case 'rock_moss': case 'rock_ash': case 'rock_pale': {
      shadow(ctx, p.x + 10, p.y + 2, 26, 9, .3);
      const c = p.type === 'rock_moss' ? '#5b6354' : p.type === 'rock_ash' ? '#4a423e' : p.type === 'rock_pale' ? '#8d96a3' : '#6d675b';
      ctx.fillStyle = c;
      ctx.beginPath(); ctx.moveTo(p.x - 22, p.y); ctx.quadraticCurveTo(p.x - 20, p.y - 26, p.x - 2, p.y - 32); ctx.quadraticCurveTo(p.x + 20, p.y - 30, p.x + 23, p.y); ctx.closePath(); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,.10)';
      ctx.beginPath(); ctx.moveTo(p.x - 14, p.y - 14); ctx.quadraticCurveTo(p.x - 4, p.y - 30, p.x + 8, p.y - 25); ctx.lineTo(p.x + 2, p.y - 12); ctx.closePath(); ctx.fill();
      if (p.type === 'rock_moss') { ctx.fillStyle = 'rgba(110,150,90,.55)'; ell(ctx, p.x - 8, p.y - 18, 12, 6); ctx.fill(); }
      break;
    }
    case 'bush': {
      shadow(ctx, p.x + 5, p.y + 1, 22, 6, .22);
      ctx.fillStyle = '#2f4b31'; ell(ctx, p.x, p.y - 12, 22, 15); ctx.fill();
      ctx.fillStyle = '#3c5c3c'; ell(ctx, p.x - 8, p.y - 16, 13, 11); ctx.fill();
      ctx.fillStyle = '#50734b'; ell(ctx, p.x + 8, p.y - 18, 10, 9); ctx.fill();
      ctx.fillStyle = '#a83a3a';
      for (let i = 0; i < 3; i++) { ell(ctx, p.x - 8 + i * 9, p.y - 16 + (i % 2) * 7, 2.3, 2.3); ctx.fill(); }
      break;
    }
    case 'crystal_tree': {
      shadow(ctx, p.x + 10, p.y + 2, 26, 8, .25);
      const g = ctx.createLinearGradient(p.x, p.y, p.x, p.y - 92);
      g.addColorStop(0, '#3c5266'); g.addColorStop(.6, '#7da6b4'); g.addColorStop(1, '#d6f4f5');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.moveTo(p.x - 10, p.y); ctx.lineTo(p.x - 5, p.y - 70); ctx.lineTo(p.x + 4, p.y - 96); ctx.lineTo(p.x + 11, p.y - 62); ctx.lineTo(p.x + 10, p.y); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = 'rgba(210,245,255,.6)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(p.x, p.y - 92); ctx.lineTo(p.x - 2, p.y - 30); ctx.stroke();
      glow(ctx, p.x, p.y - 60, 52, '#a9e0ea', .14);
      break;
    }
    case 'pale_tree': {
      shadow(ctx, p.x + 10, p.y + 2, 28, 8, .2);
      ctx.strokeStyle = '#a9aeb8'; ctx.lineWidth = 6;
      ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.quadraticCurveTo(p.x - 6, p.y - 50, p.x + 4, p.y - 92); ctx.stroke();
      ctx.lineWidth = 2.5;
      for (let i = 0; i < 4; i++) {
        const by = p.y - 50 - i * 12;
        ctx.beginPath(); ctx.moveTo(p.x + 2, by); ctx.quadraticCurveTo(p.x + 22, by - 16, p.x + 34, by - 8); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(p.x, by - 4); ctx.quadraticCurveTo(p.x - 22, by - 20, p.x - 32, by - 12); ctx.stroke();
      }
      break;
    }
    case 'orchard_tree': {
      shadow(ctx, p.x + 8, p.y + 2, 30, 9, .25);
      ctx.fillStyle = '#5b4129'; ctx.fillRect(p.x - 5, p.y - 58, 10, 60);
      ctx.fillStyle = '#3f6039'; ell(ctx, p.x, p.y - 74, 32, 26); ctx.fill();
      ctx.fillStyle = '#4e7244'; ell(ctx, p.x - 12, p.y - 82, 18, 15); ctx.fill();
      ctx.fillStyle = '#c8873f';
      for (let i = 0; i < 5; i++) { ell(ctx, p.x - 20 + i * 10, p.y - 70 + (i % 2) * 12, 3, 3); ctx.fill(); }
      break;
    }
    case 'crystal_shard': {
      ctx.fillStyle = 'rgba(160,220,235,.7)';
      ctx.beginPath(); ctx.moveTo(p.x - 12, p.y); ctx.lineTo(p.x - 3, p.y - 34); ctx.lineTo(p.x + 6, p.y - 22); ctx.lineTo(p.x + 12, p.y); ctx.closePath(); ctx.fill();
      glow(ctx, p.x, p.y - 18, 34, '#9fe0ee', .2);
      break;
    }
    case 'floating_stone': {
      const fy = p.y - 34 + Math.sin(t + p.x) * 5;
      shadow(ctx, p.x, p.y, 20, 6, .18);
      ctx.fillStyle = '#55616f';
      ctx.beginPath(); ctx.moveTo(p.x - 16, fy); ctx.lineTo(p.x - 8, fy - 16); ctx.lineTo(p.x + 12, fy - 13); ctx.lineTo(p.x + 17, fy + 4); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = 'rgba(170,225,235,.35)'; ctx.lineWidth = 1; ctx.stroke();
      break;
    }
    case 'flower': {
      const col = p.x % 3 < 1 ? '#dfcf82' : p.x % 3 < 2 ? '#d9e4dd' : '#b8a4d6';
      ctx.strokeStyle = '#476340'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x + Math.sin(t + p.y) * 1.5, p.y - 10); ctx.stroke();
      for (let i = 0; i < 4; i++) {
        const a = i / 4 * TAU + t * .2;
        ctx.fillStyle = col; ell(ctx, p.x + Math.cos(a) * 3, p.y - 13 + Math.sin(a) * 3, 2.4, 2.4); ctx.fill();
      }
      break;
    }
    case 'ember_flower': {
      ctx.strokeStyle = '#4a3024'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x, p.y - 12); ctx.stroke();
      glow(ctx, p.x, p.y - 14, 20, '#ff8a4a', .3);
      for (let i = 0; i < 4; i++) {
        const a = i / 4 * TAU;
        ctx.fillStyle = '#ef7c35'; ell(ctx, p.x + Math.cos(a) * 3, p.y - 14 + Math.sin(a) * 3, 2.6, 2.6); ctx.fill();
      }
      break;
    }
    case 'star_flower': {
      ctx.strokeStyle = '#5d7a86'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x + 2, p.y - 16); ctx.stroke();
      const pulse = .5 + Math.sin(t * 2 + p.x) * .3;
      glow(ctx, p.x + 2, p.y - 18, 22, '#bde9ef', .22 * pulse);
      ctx.fillStyle = '#d9f4f5';
      for (let i = 0; i < 5; i++) { const a = i / 5 * TAU - Math.PI / 2; ell(ctx, p.x + 2 + Math.cos(a) * 4, p.y - 18 + Math.sin(a) * 4, 2, 2); ctx.fill(); }
      break;
    }
    case 'name_flower': {
      const pulse = .5 + Math.sin(t * 1.5 + p.x * .1) * .4;
      glow(ctx, p.x, p.y - 14, 26, '#cdeff0', .18 * pulse);
      ctx.fillStyle = 'rgba(215,240,240,.9)';
      ell(ctx, p.x, p.y - 14, 3, 7); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,.5)';
      ell(ctx, p.x, p.y - 16, 1.2, 3); ctx.fill();
      break;
    }
    case 'herb': {
      const g = p.glow || '#a9e6a0';
      ctx.strokeStyle = '#4b6b42'; ctx.lineWidth = 2;
      for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.quadraticCurveTo(p.x - 8 + i * 8, p.y - 10, p.x - 10 + i * 10, p.y - 20); ctx.stroke(); }
      leaf(ctx, p.x - 7, p.y - 14, 6, '#7fa46a', -.5);
      leaf(ctx, p.x + 7, p.y - 16, 6, '#8cb477', .5);
      glow(ctx, p.x, p.y - 12, 26, g, .22);
      break;
    }
    case 'ore': case 'crystal_ore': {
      shadow(ctx, p.x + 8, p.y + 1, 20, 6, .25);
      const col = p.type === 'crystal_ore' ? '#8fd0df' : p.ember ? '#a04a30' : '#77705f';
      ctx.fillStyle = p.type === 'crystal_ore' ? '#4b5a67' : '#514b42';
      ctx.beginPath(); ctx.moveTo(p.x - 16, p.y); ctx.lineTo(p.x - 10, p.y - 20); ctx.lineTo(p.x + 4, p.y - 26); ctx.lineTo(p.x + 16, p.y - 8); ctx.lineTo(p.x + 14, p.y); ctx.closePath(); ctx.fill();
      ctx.fillStyle = col;
      ctx.beginPath(); ctx.moveTo(p.x - 7, p.y - 5); ctx.lineTo(p.x - 2, p.y - 20); ctx.lineTo(p.x + 6, p.y - 15); ctx.lineTo(p.x + 8, p.y - 4); ctx.closePath(); ctx.fill();
      if (p.type === 'crystal_ore' || p.ember) glow(ctx, p.x, p.y - 14, 30, col, .18);
      break;
    }
    case 'sack': {
      ctx.fillStyle = '#8b7652'; ell(ctx, p.x, p.y - 10, 11, 13); ctx.fill();
      ctx.fillStyle = '#6f5d3f'; ctx.fillRect(p.x - 5, p.y - 24, 10, 5);
      break;
    }
    case 'bones': {
      ctx.strokeStyle = 'rgba(210,200,180,.55)'; ctx.lineWidth = 3; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(p.x - 14, p.y); ctx.quadraticCurveTo(p.x, p.y - 8, p.x + 14, p.y - 2); ctx.stroke();
      for (let i = 0; i < 3; i++) { ell(ctx, p.x - 10 + i * 9, p.y - 2 - (i % 2) * 3, 3, 2); ctx.fillStyle = 'rgba(220,210,190,.4)'; ctx.fill(); }
      break;
    }
    case 'scarecrow': {
      shadow(ctx, p.x + 5, p.y + 1, 18, 5, .25);
      ctx.strokeStyle = '#5b452c'; ctx.lineWidth = 5;
      ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x, p.y - 58); ctx.moveTo(p.x - 18, p.y - 44); ctx.lineTo(p.x + 18, p.y - 44); ctx.stroke();
      ctx.fillStyle = '#6b5d42'; rr(ctx, p.x - 11, p.y - 52, 22, 24, 5); ctx.fill();
      ctx.fillStyle = '#c4a86a'; ell(ctx, p.x, p.y - 58, 10, 10); ctx.fill();
      ctx.fillStyle = '#4b3a28'; ctx.fillRect(p.x - 13, p.y - 66, 26, 5);
      ctx.fillStyle = '#2a2118'; ell(ctx, p.x - 3, p.y - 59, 1.4, 1.4); ctx.fill(); ell(ctx, p.x + 3, p.y - 59, 1.4, 1.4); ctx.fill();
      break;
    }
    default: break;
  }
}

// ───────────────────────── estructuras ─────────────────────────
const STRUCTURES = new Set(['hall', 'house', 'forge', 'shop', 'windmill', 'tent', 'campfire', 'bedroll', 'banner', 'fountain', 'lamp', 'ruin_column', 'pillar', 'statue', 'moon_statue', 'standing_stone', 'antler_arch', 'portal', 'bone_arch', 'fortress_wall', 'throne', 'watchtower', 'forge_pillar', 'anvil', 'grave', 'crystal_pillar', 'astral_well', 'floating_bridge', 'book_pile', 'temple_column', 'ascension_altar', 'orrery', 'void_obelisk', 'rift', 'library']);

export function drawWorldProp(ctx, p, t, world) {
  if (STRUCTURES.has(p.type)) drawStructure(ctx, p, t, world);
  else drawProp(ctx, p, t, world);
}

function buildingBase(ctx, p, wall, trim, roof, roof2, windows = 2, height = 1, t = 0) {
  const r = p.rect;
  if (!r) return;
  const x = r.x, y = r.y, w = r.w, h = r.h;
  const wallH = h * .62, roofH = h * .52;
  const bottom = y + h;
  // sombra
  shadow(ctx, x + w / 2 + 20, bottom + 4, w * .6, 18, .38);
  // pared frontal
  const wg = ctx.createLinearGradient(x, y, x, bottom);
  wg.addColorStop(0, wall); wg.addColorStop(1, trim);
  ctx.fillStyle = wg;
  ctx.fillRect(x + 4, bottom - wallH, w - 8, wallH);
  // vigas
  ctx.strokeStyle = 'rgba(40,28,18,.5)'; ctx.lineWidth = 4;
  for (let i = 1; i < 4; i++) {
    ctx.beginPath(); ctx.moveTo(x + 6 + i * (w - 12) / 4, bottom - wallH + 6); ctx.lineTo(x + 6 + i * (w - 12) / 4, bottom - 2); ctx.stroke();
  }
  // puerta
  const dw = Math.min(46, w * .2), dh = wallH * .62;
  ctx.fillStyle = '#2b1d13';
  rr(ctx, x + w / 2 - dw / 2, bottom - dh, dw, dh, 18); ctx.fill();
  ctx.strokeStyle = 'rgba(232,195,122,.3)'; ctx.lineWidth = 1.5; ctx.stroke();
  ctx.fillStyle = 'rgba(232,195,122,.7)'; ell(ctx, x + w / 2 + dw * .22, bottom - dh * .5, 2, 2); ctx.fill();
  // ventanas
  for (let i = 0; i < windows; i++) {
    const wx = x + w * (i + 1) / (windows + 1) - 12;
    const wy = bottom - wallH * .72;
    const lit = Math.sin(p.id * 3 + i) > -.3;
    ctx.fillStyle = lit ? 'rgba(255,199,110,.72)' : 'rgba(60,74,84,.8)';
    rr(ctx, wx, wy, 24, 30, 3); ctx.fill();
    ctx.strokeStyle = 'rgba(30,22,14,.7)'; ctx.lineWidth = 2; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(wx + 12, wy); ctx.lineTo(wx + 12, wy + 30); ctx.moveTo(wx, wy + 15); ctx.lineTo(wx + 24, wy + 15); ctx.stroke();
    if (lit) glow(ctx, wx + 12, wy + 15, 38, '#ffc76e', .13);
  }
  // tejado
  const ry = bottom - wallH - 4;
  const rg = ctx.createLinearGradient(x, ry - roofH, x, ry);
  rg.addColorStop(0, roof2); rg.addColorStop(1, roof);
  ctx.fillStyle = rg;
  ctx.beginPath();
  ctx.moveTo(x - 14, ry);
  ctx.lineTo(x + w * .16, ry - roofH);
  ctx.lineTo(x + w * .84, ry - roofH);
  ctx.lineTo(x + w + 14, ry);
  ctx.closePath(); ctx.fill();
  // tejas
  ctx.strokeStyle = 'rgba(10,10,12,.28)'; ctx.lineWidth = 1.2;
  for (let i = 1; i < 5; i++) {
    const yy = ry - roofH * i / 5;
    ctx.beginPath(); ctx.moveTo(x + (w * .16) * (1 - i / 5) - 12 * (1 - i / 5), yy); ctx.lineTo(x + w - (w * .16) * (1 - i / 5) + 12 * (1 - i / 5), yy); ctx.stroke();
  }
  ctx.strokeStyle = 'rgba(232,195,122,.22)';
  ctx.beginPath(); ctx.moveTo(x - 14, ry); ctx.lineTo(x + w * .16, ry - roofH); ctx.lineTo(x + w * .84, ry - roofH); ctx.lineTo(x + w + 14, ry); ctx.stroke();
  // chimenea + humo
  if (p.type === 'forge' || p.type === 'house') {
    const cx = x + w * .78, cy = ry - roofH + 4;
    ctx.fillStyle = '#5b4b3d'; ctx.fillRect(cx, cy - 30, 16, 34);
    ctx.fillStyle = '#403530'; ctx.fillRect(cx - 2, cy - 34, 20, 6);
    for (let i = 0; i < 3; i++) {
      ctx.fillStyle = `rgba(190,190,180,${.12 - i * .03})`;
      ell(ctx, cx + 8 + Math.sin(t + i) * 8, cy - 40 - i * 14 - (t * 8 % 14), 10 + i * 6, 8 + i * 4); ctx.fill();
    }
  }
  // farolillo
  const lx = x + w * .5, ly = bottom - wallH - 12;
  ctx.fillStyle = '#2a2118'; ctx.fillRect(lx - 1, ly, 2, 16);
  glow(ctx, lx, ly + 18, 60, '#ffc76e', .24);
  ctx.fillStyle = '#ffd693'; ell(ctx, lx, ly + 17, 4, 5); ctx.fill();
}

export function drawStructure(ctx, p, t, world) {
  const isDrakmor = world.id === 'drakmor';
  const isKan = world.id === 'kansordore';
  switch (p.type) {
    case 'hall':
      buildingBase(ctx, p, '#5a4a38', '#3d3227', isKan ? '#4a5570' : '#4a3a2d', '#6b543c', 3, 1, t);
      // torre
      ctx.fillStyle = '#4c3e31';
      ctx.fillRect(p.rect.x + p.rect.w * .74, p.rect.y - 34, 46, 90);
      ctx.fillStyle = '#332a22';
      ctx.beginPath(); ctx.moveTo(p.rect.x + p.rect.w * .74 - 8, p.rect.y - 34); ctx.lineTo(p.rect.x + p.rect.w * .74 + 23, p.rect.y - 82); ctx.lineTo(p.rect.x + p.rect.w * .74 + 54, p.rect.y - 34); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = 'rgba(232,195,122,.4)'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(p.rect.x + p.rect.w * .74 + 23, p.rect.y - 82); ctx.lineTo(p.rect.x + p.rect.w * .74 + 23, p.rect.y - 110); ctx.stroke();
      ctx.fillStyle = '#e8c37a'; ctx.beginPath(); ctx.moveTo(p.rect.x + p.rect.w * .74 + 23, p.rect.y - 112); ctx.lineTo(p.rect.x + p.rect.w * .74 + 50, p.rect.y - 104); ctx.lineTo(p.rect.x + p.rect.w * .74 + 23, p.rect.y - 98); ctx.closePath(); ctx.fill();
      break;
    case 'house':
      buildingBase(ctx, p, p.variant === 2 ? '#5d5142' : '#574a3c', '#3a3129', p.variant === 1 ? '#4d3c31' : '#43382d', '#66503c', 2, 1, t);
      break;
    case 'library': {
      const r = p.rect, x = r.x, w = r.w, bottom = r.y + r.h;
      shadow(ctx, x + w / 2 + 24, bottom + 4, w * .62, 20, .4);
      const wg = ctx.createLinearGradient(0, r.y, 0, bottom);
      wg.addColorStop(0, '#59657a'); wg.addColorStop(1, '#323b4c');
      ctx.fillStyle = wg;
      ctx.fillRect(x, r.y + r.h * .25, w, r.h * .75);
      // columnas
      for (let i = 0; i < 6; i++) {
        const cx = x + 18 + i * (w - 36) / 5;
        ctx.fillStyle = '#8791a3'; ctx.fillRect(cx - 7, r.y + r.h * .34, 14, r.h * .58);
        ctx.fillStyle = '#b3bccb'; ctx.fillRect(cx - 10, r.y + r.h * .32, 20, 9);
        ctx.fillStyle = 'rgba(180,230,240,.18)'; ctx.fillRect(cx - 3, r.y + r.h * .36, 3, r.h * .54);
      }
      // gran arco
      ctx.fillStyle = '#1d2532';
      rr(ctx, x + w / 2 - 55, bottom - 110, 110, 110, 55); ctx.fill();
      ctx.strokeStyle = 'rgba(190,235,245,.35)'; ctx.lineWidth = 3; ctx.stroke();
      ctx.fillStyle = 'rgba(150,220,235,.17)'; rr(ctx, x + w / 2 - 44, bottom - 100, 88, 100, 44); ctx.fill();
      // cúpula
      const dg = ctx.createLinearGradient(0, r.y - 50, 0, r.y + r.h * .3);
      dg.addColorStop(0, '#8e9bb2'); dg.addColorStop(1, '#4a566b');
      ctx.fillStyle = dg;
      ctx.beginPath(); ctx.ellipse(x + w / 2, r.y + r.h * .24, w * .38, r.h * .3, 0, Math.PI, TAU); ctx.fill();
      ctx.strokeStyle = 'rgba(230,200,130,.45)'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(x + w / 2, r.y + r.h * .24); ctx.lineTo(x + w / 2, r.y - 36); ctx.stroke();
      glow(ctx, x + w / 2, r.y + 8, 80, '#b9e8f0', .22);
      // ventanas
      for (let i = 0; i < 3; i++) {
        const wx = x + w * (i + 1) / 4;
        ctx.fillStyle = 'rgba(255,199,110,.55)'; ell(ctx, wx, r.y + r.h * .42, 8, 14); ctx.fill();
        glow(ctx, wx, r.y + r.h * .42, 28, '#ffd693', .12);
      }
      break;
    }
    case 'forge': {
      buildingBase(ctx, p, '#4c3b2e', '#33271e', '#3d3127', '#564033', 1, 1, t);
      const r = p.rect;
      // yunque exterior
      const ax = r.x + r.w + 16, ay = r.y + r.h - 12;
      ctx.fillStyle = '#31343a'; ctx.fillRect(ax - 12, ay - 12, 24, 8);
      ctx.fillRect(ax - 5, ay - 4, 10, 14);
      ctx.fillStyle = '#e8733a'; ctx.fillRect(ax - 16, ay + 8, 32, 4);
      glow(ctx, ax, ay, 60, '#ff7a3a', .3);
      break;
    }
    case 'shop': {
      buildingBase(ctx, p, '#5c4e3c', '#3b3226', '#4b3a2a', '#65503a', 1, 1, t);
      const r = p.rect;
      // toldo
      for (let i = 0; i < 6; i++) {
        ctx.fillStyle = i % 2 ? '#8b3038' : '#d8c9a8';
        ctx.beginPath();
        ctx.moveTo(r.x + 12 + i * (r.w - 24) / 6, r.y + r.h - 76);
        ctx.lineTo(r.x + 12 + (i + 1) * (r.w - 24) / 6, r.y + r.h - 76);
        ctx.lineTo(r.x + 12 + (i + 1) * (r.w - 24) / 6 + 6, r.y + r.h - 58);
        ctx.lineTo(r.x + 12 + i * (r.w - 24) / 6 - 6, r.y + r.h - 58);
        ctx.closePath(); ctx.fill();
      }
      break;
    }
    case 'windmill': {
      const r = p.rect, x = r.x + r.w / 2, bottom = r.y + r.h;
      shadow(ctx, x + 26, bottom + 4, r.w * .5, 18, .35);
      const g = ctx.createLinearGradient(r.x, 0, r.x + r.w, 0);
      g.addColorStop(0, '#887b65'); g.addColorStop(.5, '#a5977c'); g.addColorStop(1, '#6d6151');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.moveTo(x - 66, bottom); ctx.lineTo(x - 40, r.y + 40); ctx.lineTo(x + 40, r.y + 40); ctx.lineTo(x + 66, bottom); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = 'rgba(50,38,26,.4)'; ctx.lineWidth = 2;
      for (let i = 0; i < 6; i++) { const yy = bottom - i * 28; ctx.beginPath(); ctx.moveTo(x - 64 + i * 4, yy); ctx.lineTo(x + 64 - i * 4, yy); ctx.stroke(); }
      ctx.fillStyle = '#3a2b1e'; rr(ctx, x - 24, bottom - 52, 48, 52, 20); ctx.fill();
      // aspas
      ctx.save(); ctx.translate(x, r.y + 26); ctx.rotate(t * .45);
      for (let i = 0; i < 4; i++) {
        ctx.rotate(Math.PI / 2);
        ctx.fillStyle = '#4a3a26'; ctx.fillRect(-5, 0, 10, 86);
        ctx.fillStyle = 'rgba(214,197,160,.55)'; ctx.fillRect(-24, 18, 20, 54);
        ctx.strokeStyle = 'rgba(45,32,20,.6)'; ctx.strokeRect(-24, 18, 20, 54);
      }
      ctx.restore();
      ctx.fillStyle = '#2f2318'; ell(ctx, x, r.y + 26, 9, 9); ctx.fill();
      break;
    }
    case 'tent': {
      const x = p.x, y = p.y;
      shadow(ctx, x + 14, y + 3, 44, 12, .3);
      const col = p.charred ? '#4a3630' : '#5a4b39';
      ctx.fillStyle = col;
      ctx.beginPath(); ctx.moveTo(x - 46, y); ctx.lineTo(x, y - 62); ctx.lineTo(x + 46, y); ctx.closePath(); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,.06)';
      ctx.beginPath(); ctx.moveTo(x, y - 62); ctx.lineTo(x + 46, y); ctx.lineTo(x + 8, y); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#221912';
      ctx.beginPath(); ctx.moveTo(x - 16, y); ctx.lineTo(x, y - 38); ctx.lineTo(x + 16, y); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#2a2118'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(x, y - 62); ctx.lineTo(x, y - 78); ctx.stroke();
      ctx.fillStyle = p.charred ? '#a8553a' : '#b08c52';
      ctx.beginPath(); ctx.moveTo(x, y - 78); ctx.lineTo(x + 22, y - 72); ctx.lineTo(x, y - 68); ctx.closePath(); ctx.fill();
      break;
    }
    case 'campfire': {
      const x = p.x, y = p.y;
      shadow(ctx, x + 6, y + 2, 34, 9, .3);
      for (let i = 0; i < 5; i++) {
        const a = i / 5 * TAU;
        ctx.fillStyle = '#8f8a80'; ell(ctx, x + Math.cos(a) * 18, y + Math.sin(a) * 8, 7, 4); ctx.fill();
      }
      ctx.strokeStyle = '#4a3526'; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.moveTo(x - 16, y + 2); ctx.lineTo(x + 16, y - 6); ctx.moveTo(x - 16, y - 6); ctx.lineTo(x + 16, y + 2); ctx.stroke();
      flame(ctx, x, y - 2, t, 1.25, '#ff9d50');
      flame(ctx, x - 6, y - 2, t + 1.2, .7, '#ffb56a');
      flame(ctx, x + 7, y - 1, t + 2.4, .6, '#ff8a3a');
      glow(ctx, x, y - 14, 84, '#ff9d50', .38);
      break;
    }
    case 'bedroll': {
      ctx.fillStyle = '#6b5c44'; rr(ctx, p.x - 20, p.y - 8, 40, 14, 6); ctx.fill();
      ctx.fillStyle = '#8c7b5c'; rr(ctx, p.x - 16, p.y - 14, 22, 10, 5); ctx.fill();
      break;
    }
    case 'banner': {
      ctx.strokeStyle = '#3a2c20'; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x, p.y - 90); ctx.stroke();
      ctx.fillStyle = '#6d2a2c';
      ctx.beginPath(); ctx.moveTo(p.x + 2, p.y - 86); ctx.lineTo(p.x + 40 + Math.sin(t * 2) * 4, p.y - 80); ctx.lineTo(p.x + 36, p.y - 46); ctx.lineTo(p.x + 2, p.y - 52); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#d8b56e'; ell(ctx, p.x + 20, p.y - 66, 5, 7); ctx.fill();
      break;
    }
    case 'fountain': {
      const x = p.x, y = p.y;
      shadow(ctx, x + 8, y + 5, 40, 12, .3);
      ctx.fillStyle = '#6d685c'; ell(ctx, x, y - 4, 38, 18); ctx.fill();
      ctx.fillStyle = '#3f5e62'; ell(ctx, x, y - 5, 30, 13); ctx.fill();
      ctx.fillStyle = '#7fa9a8'; ell(ctx, x, y - 7, 24, 9); ctx.fill();
      ctx.strokeStyle = 'rgba(220,245,240,.4)'; ctx.lineWidth = 1;
      for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.ellipse(x, y - 7, 8 + i * 6, 3 + i * 2, 0, 0, TAU); ctx.stroke(); }
      ctx.fillStyle = '#5b564c'; ctx.fillRect(x - 5, y - 40, 10, 34);
      ctx.fillStyle = '#7d7668'; ell(ctx, x, y - 42, 12, 5); ctx.fill();
      const sp = (Math.sin(t * 2) * .5 + .5);
      ctx.fillStyle = `rgba(200,240,235,${.25 + sp * .25})`;
      ctx.beginPath(); ctx.moveTo(x, y - 46); ctx.quadraticCurveTo(x - 12, y - 30, x - 16, y - 10); ctx.quadraticCurveTo(x - 6, y - 22, x, y - 46); ctx.fill();
      break;
    }
    case 'lamp': {
      ctx.fillStyle = '#2f2a22'; ctx.fillRect(p.x - 2, p.y - 70, 4, 72);
      ctx.fillStyle = '#3d372c'; ctx.fillRect(p.x - 10, p.y - 76, 20, 6);
      ctx.fillStyle = '#ffd693'; ell(ctx, p.x, p.y - 56, 7, 10); ctx.fill();
      glow(ctx, p.x, p.y - 56, 90, '#ffcd7a', .35);
      break;
    }
    case 'ruin_column': {
      shadow(ctx, p.x + 10, p.y + 2, 22, 7, .3);
      const h = p.broken ? 54 : 96;
      const g = ctx.createLinearGradient(p.x - 14, 0, p.x + 14, 0);
      g.addColorStop(0, '#6e6656'); g.addColorStop(.5, '#958b77'); g.addColorStop(1, '#5f584b');
      ctx.fillStyle = g;
      ctx.fillRect(p.x - 15, p.y - h, 30, h);
      ctx.fillStyle = '#8f8672'; ctx.fillRect(p.x - 19, p.y - h, 38, 8);
      ctx.fillStyle = '#7c7462'; ctx.fillRect(p.x - 20, p.y - 7, 40, 7);
      ctx.strokeStyle = 'rgba(55,50,42,.5)'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(p.x - 5, p.y - h + 10); ctx.lineTo(p.x - 8, p.y - 12); ctx.moveTo(p.x + 6, p.y - h + 16); ctx.lineTo(p.x + 8, p.y - 20); ctx.stroke();
      if (p.broken) {
        ctx.fillStyle = '#575247';
        ctx.beginPath(); ctx.moveTo(p.x - 19, p.y - h); ctx.lineTo(p.x - 4, p.y - h + 6); ctx.lineTo(p.x + 4, p.y - h - 4); ctx.lineTo(p.x + 19, p.y - h + 3); ctx.lineTo(p.x + 12, p.y - h - 12); ctx.lineTo(p.x - 12, p.y - h - 8); ctx.closePath(); ctx.fill();
      }
      break;
    }
    case 'pillar': {
      shadow(ctx, p.x + 8, p.y + 1, 18, 6, .25);
      const g = ctx.createLinearGradient(p.x - 10, 0, p.x + 10, 0);
      g.addColorStop(0, '#66727b'); g.addColorStop(.5, '#a3b0b4'); g.addColorStop(1, '#5b676e');
      ctx.fillStyle = g; ctx.fillRect(p.x - 10, p.y - 76, 20, 76);
      ctx.fillStyle = '#aab8bb'; ctx.fillRect(p.x - 14, p.y - 82, 28, 8);
      ctx.fillStyle = '#8c9a9e'; rr(ctx, p.x - 3, p.y - 52, 6, 20, 3); ctx.fill();
      glow(ctx, p.x, p.y - 40, 48, '#b8e2ef', .18);
      break;
    }
    case 'statue': {
      shadow(ctx, p.x + 10, p.y + 2, 32, 9, .3);
      ctx.fillStyle = '#6b685d'; ctx.fillRect(p.x - 24, p.y - 12, 48, 12);
      const g = ctx.createLinearGradient(0, p.y, 0, p.y - 110);
      g.addColorStop(0, '#63615a'); g.addColorStop(1, '#999588');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.moveTo(p.x - 20, p.y - 10); ctx.lineTo(p.x - 12, p.y - 72); ctx.lineTo(p.x - 8, p.y - 96); ctx.lineTo(p.x + 8, p.y - 96); ctx.lineTo(p.x + 12, p.y - 72); ctx.lineTo(p.x + 20, p.y - 10); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#a19d90'; ell(ctx, p.x, p.y - 106, 12, 13); ctx.fill();
      ctx.strokeStyle = '#d8c58f'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(p.x + 14, p.y - 88); ctx.lineTo(p.x + 30, p.y - 34); ctx.stroke();
      ctx.strokeStyle = 'rgba(232,195,122,.35)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(p.x - 10, p.y - 60); ctx.lineTo(p.x + 10, p.y - 56); ctx.stroke();
      break;
    }
    case 'moon_statue': {
      shadow(ctx, p.x + 8, p.y + 2, 32, 10, .3);
      ctx.fillStyle = '#5f6d72'; ell(ctx, p.x, p.y - 10, 30, 12); ctx.fill();
      ctx.fillStyle = '#93a8ab'; ctx.fillRect(p.x - 5, p.y - 83, 10, 74);
      ctx.fillStyle = '#cfe3e2';
      ctx.beginPath(); ctx.arc(p.x, p.y - 92, 20, 0, TAU); ctx.fill();
      ctx.fillStyle = '#152a33'; ctx.beginPath(); ctx.arc(p.x + 9, p.y - 96, 18, 0, TAU); ctx.fill();
      glow(ctx, p.x, p.y - 92, 100, '#cbeaf6', .34);
      break;
    }
    case 'standing_stone': {
      shadow(ctx, p.x + 10, p.y + 2, 26, 7, .3);
      ctx.fillStyle = '#51565c';
      ctx.beginPath(); ctx.moveTo(p.x - 16, p.y); ctx.lineTo(p.x - 12, p.y - 58); ctx.lineTo(p.x - 2, p.y - 74); ctx.lineTo(p.x + 12, p.y - 52); ctx.lineTo(p.x + 17, p.y); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = 'rgba(180,160,210,.25)'; ctx.lineWidth = 1.5;
      ctx.stroke();
      if (p.rune) {
        ctx.strokeStyle = 'rgba(190,150,230,.6)'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(p.x - 5, p.y - 52); ctx.lineTo(p.x + 4, p.y - 40); ctx.lineTo(p.x - 3, p.y - 28); ctx.stroke();
        glow(ctx, p.x, p.y - 42, 34, '#b08ad6', .22);
      }
      break;
    }
    case 'antler_arch': {
      const x = p.x, y = p.y;
      ctx.strokeStyle = 'rgba(190,185,165,.55)'; ctx.lineWidth = 7; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(x - 80, y); ctx.quadraticCurveTo(x - 66, y - 120, x, y - 156); ctx.quadraticCurveTo(x + 66, y - 120, x + 80, y); ctx.stroke();
      ctx.lineWidth = 3;
      for (let i = 0; i < 6; i++) {
        const s = i < 3 ? -1 : 1, k = i % 3;
        ctx.beginPath(); ctx.moveTo(x + s * (60 - k * 18), y - 40 - k * 34); ctx.lineTo(x + s * (92 - k * 14), y - 62 - k * 38); ctx.stroke();
      }
      glow(ctx, x, y - 110, 130, '#a88ac9', .22);
      break;
    }
    case 'portal': {
      const x = p.x, y = p.y;
      shadow(ctx, x + 12, y + 4, 46, 12, .35);
      ctx.fillStyle = '#57504a';
      ctx.beginPath(); ctx.moveTo(x - 50, y); ctx.lineTo(x - 42, y - 92); ctx.lineTo(x - 22, y - 118); ctx.lineTo(x + 22, y - 118); ctx.lineTo(x + 42, y - 92); ctx.lineTo(x + 50, y); ctx.lineTo(x + 30, y); ctx.lineTo(x + 28, y - 82); ctx.lineTo(x + 12, y - 100); ctx.lineTo(x - 12, y - 100); ctx.lineTo(x - 28, y - 82); ctx.lineTo(x - 30, y); ctx.closePath(); ctx.fill();
      const col = p.region === 'drakmor' ? '#e8824a' : p.region === 'kansordore' ? '#9ed8e8' : '#c9a8ea';
      const pulse = .5 + Math.sin(t * 2.2) * .2;
      const g = ctx.createRadialGradient(x, y - 58, 2, x, y - 58, 38);
      g.addColorStop(0, rgba(col, .55 * pulse + .2)); g.addColorStop(.7, rgba(col, .18)); g.addColorStop(1, rgba(col, 0));
      ctx.fillStyle = g; ell(ctx, x, y - 58, 34, 52); ctx.fill();
      for (let i = 0; i < 5; i++) {
        const a = t * .8 + i / 5 * TAU;
        ctx.strokeStyle = rgba(col, .45);
        ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.ellipse(x, y - 58, 12 + i * 5, 26 + i * 2, Math.sin(a) * .3, 0, TAU); ctx.stroke();
      }
      glow(ctx, x, y - 58, 120, col, .22);
      // runas
      ctx.fillStyle = rgba(col, .8);
      for (let i = 0; i < 5; i++) { ell(ctx, x - 30 + i * 15, y - 91 + (i % 2) * 2, 1.6, 1.6); ctx.fill(); }
      break;
    }
    case 'bone_arch': {
      ctx.strokeStyle = 'rgba(200,190,168,.5)'; ctx.lineWidth = 8; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(p.x - 90, p.y); ctx.quadraticCurveTo(p.x - 80, p.y - 96, p.x, p.y - 120); ctx.quadraticCurveTo(p.x + 80, p.y - 96, p.x + 90, p.y); ctx.stroke();
      ctx.lineWidth = 2;
      for (let i = 0; i < 8; i++) { const s = i < 4 ? -1 : 1; ctx.beginPath(); ctx.moveTo(p.x + s * (70 - (i % 4) * 14), p.y - 20 - (i % 4) * 18); ctx.lineTo(p.x + s * (86 - (i % 4) * 12), p.y - 42 - (i % 4) * 22); ctx.stroke(); }
      break;
    }
    case 'fortress_wall': {
      const x = p.x, y = p.y;
      shadow(ctx, x + 10, y + 3, 40, 10, .32);
      ctx.save(); ctx.translate(x, y); ctx.rotate((p.rot || 0) * .2);
      const g = ctx.createLinearGradient(0, -80, 0, 0);
      g.addColorStop(0, p.broken ? '#3c322f' : '#4a3b35'); g.addColorStop(1, '#2c2523');
      ctx.fillStyle = g;
      ctx.fillRect(-34, -84, 68, 84);
      ctx.strokeStyle = 'rgba(0,0,0,.3)'; ctx.lineWidth = 1;
      for (let yy = -72; yy < 0; yy += 14) for (let xx = -30; xx < 32; xx += 20) ctx.strokeRect(xx, yy, 18, 12);
      if (p.broken) {
        ctx.fillStyle = '#1d1817';
        ctx.beginPath(); ctx.moveTo(-34, -84); ctx.lineTo(-6, -94); ctx.lineTo(8, -76); ctx.lineTo(22, -88); ctx.lineTo(34, -70); ctx.lineTo(34, -60); ctx.lineTo(-34, -68); ctx.closePath(); ctx.fill();
      }
      // brasa en las grietas
      ctx.strokeStyle = 'rgba(255,110,50,.5)'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(-16, -4); ctx.lineTo(-6, -28); ctx.lineTo(4, -18); ctx.lineTo(14, -44); ctx.stroke();
      ctx.restore();
      glow(ctx, x, y - 30, 50, '#ff6b2e', .12);
      break;
    }
    case 'throne': {
      const x = p.x, y = p.y;
      shadow(ctx, x + 12, y + 4, 40, 10, .35);
      ctx.fillStyle = '#2d2422'; ctx.fillRect(x - 30, y - 70, 60, 70);
      ctx.fillStyle = '#3d2d29'; ctx.fillRect(x - 36, y - 12, 72, 14);
      ctx.fillStyle = '#5a3a2c'; ctx.fillRect(x - 26, y - 62, 52, 46);
      ctx.strokeStyle = 'rgba(255,130,60,.45)'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(x - 18, y - 56); ctx.lineTo(x + 18, y - 44); ctx.moveTo(x - 18, y - 36); ctx.lineTo(x + 18, y - 52); ctx.stroke();
      ctx.fillStyle = '#c96b36'; ell(ctx, x, y - 84, 10, 14); ctx.fill();
      glow(ctx, x, y - 84, 90, '#ff7a3a', .3);
      break;
    }
    case 'watchtower': {
      const x = p.x, y = p.y;
      shadow(ctx, x + 20, y + 4, 44, 12, .35);
      ctx.fillStyle = '#3a302c';
      ctx.beginPath(); ctx.moveTo(x - 36, y); ctx.lineTo(x - 22, y - 140); ctx.lineTo(x + 22, y - 140); ctx.lineTo(x + 36, y); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = 'rgba(0,0,0,.25)'; ctx.lineWidth = 1.5;
      for (let i = 0; i < 7; i++) { ctx.beginPath(); ctx.moveTo(x - 34 + i, y - 14 - i * 18); ctx.lineTo(x + 34 - i, y - 14 - i * 18); ctx.stroke(); }
      ctx.fillStyle = '#2a211f'; ctx.fillRect(x - 28, y - 156, 56, 18);
      flame(ctx, x, y - 158, t, .55, '#ff9a4a');
      glow(ctx, x, y - 158, 110, '#ff8a4a', .3);
      break;
    }
    case 'forge_pillar': {
      const x = p.x, y = p.y;
      ctx.fillStyle = '#3a2a24'; ctx.fillRect(x - 12, y - 72, 24, 74);
      ctx.fillStyle = '#5a3a2a'; ctx.fillRect(x - 16, y - 78, 32, 8);
      ctx.strokeStyle = 'rgba(255,120,50,.55)'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(x - 4, y - 6); ctx.lineTo(x + 2, y - 28); ctx.lineTo(x - 3, y - 40); ctx.lineTo(x + 4, y - 62); ctx.stroke();
      glow(ctx, x, y - 38, 42, '#ff6b2e', .3);
      break;
    }
    case 'anvil': {
      const x = p.x, y = p.y;
      shadow(ctx, x + 6, y + 2, 28, 8, .3);
      ctx.fillStyle = '#2f3238'; ctx.fillRect(x - 20, y - 28, 40, 10);
      ctx.fillStyle = '#3a3d44'; ctx.beginPath(); ctx.moveTo(x - 28, y - 30); ctx.lineTo(x + 26, y - 30); ctx.lineTo(x + 16, y - 20); ctx.lineTo(x - 20, y - 20); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#24262b'; ctx.fillRect(x - 7, y - 18, 14, 18);
      ctx.fillStyle = '#8c2f1f'; ctx.fillRect(x - 16, y - 2, 32, 4);
      glow(ctx, x, y - 16, 60, '#ff7a3a', .18);
      break;
    }
    case 'grave': {
      const x = p.x, y = p.y;
      ctx.fillStyle = '#4b4a45'; rr(ctx, x - 16, y - 34, 32, 36, 12); ctx.fill();
      ctx.strokeStyle = 'rgba(232,195,122,.2)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(x - 8, y - 22); ctx.lineTo(x + 8, y - 22); ctx.moveTo(x, y - 28); ctx.lineTo(x, y - 12); ctx.stroke();
      ctx.fillStyle = '#3c3b37'; ctx.fillRect(x - 20, y - 2, 40, 3);
      break;
    }
    case 'crystal_pillar': {
      const x = p.x, y = p.y;
      shadow(ctx, x + 8, y + 2, 20, 6, .2);
      const g = ctx.createLinearGradient(0, y, 0, y - 110);
      g.addColorStop(0, '#4a7890'); g.addColorStop(.5, '#8cc8d5'); g.addColorStop(1, '#dcf7f8');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.moveTo(x - 12, y); ctx.lineTo(x - 7, y - 84); ctx.lineTo(x + 2, y - 112); ctx.lineTo(x + 12, y - 72); ctx.lineTo(x + 10, y); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = 'rgba(230,255,255,.5)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(x - 2, y - 98); ctx.lineTo(x - 4, y - 20); ctx.stroke();
      glow(ctx, x, y - 56, 70, '#a9e0ea', .2);
      break;
    }
    case 'astral_well': {
      const x = p.x, y = p.y;
      ctx.fillStyle = '#63707e'; ell(ctx, x, y - 4, 40, 16); ctx.fill();
      const g = ctx.createRadialGradient(x, y - 8, 2, x, y - 8, 34);
      g.addColorStop(0, 'rgba(230,255,255,.9)'); g.addColorStop(.5, 'rgba(130,210,230,.4)'); g.addColorStop(1, 'rgba(80,140,170,0)');
      ctx.fillStyle = g; ell(ctx, x, y - 6, 34, 13); ctx.fill();
      ctx.strokeStyle = 'rgba(210,245,250,.5)'; ctx.lineWidth = 1;
      for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.ellipse(x, y - 6, 12 + i * 8, 4 + i * 3, t * .1, 0, TAU); ctx.stroke(); }
      glow(ctx, x, y - 12, 110, '#bfeaf2', .3);
      break;
    }
    case 'floating_bridge': {
      ctx.fillStyle = 'rgba(180,215,230,.16)';
      for (let i = 0; i < 5; i++) {
        const yy = p.y - 4 + i * 2;
        ctx.fillRect(p.x - 100 + i * 3, yy, 200 - i * 6, 2);
      }
      glow(ctx, p.x, p.y - 4, 120, '#9dd6e8', .12);
      break;
    }
    case 'book_pile': {
      for (let i = 0; i < 3; i++) {
        ctx.fillStyle = i % 2 ? '#5b3d3a' : '#3c4a57';
        rr(ctx, p.x - 16 + i * 2, p.y - 8 - i * 7, 32, 6, 1); ctx.fill();
        ctx.fillStyle = 'rgba(232,215,170,.6)'; ctx.fillRect(p.x - 14 + i * 2, p.y - 7 - i * 7, 28, 1);
      }
      break;
    }
    case 'temple_column': {
      const x = p.x, y = p.y;
      shadow(ctx, x + 10, y + 2, 24, 7, .25);
      const g = ctx.createLinearGradient(x - 13, 0, x + 13, 0);
      g.addColorStop(0, '#7c8492'); g.addColorStop(.5, '#bcc3cc'); g.addColorStop(1, '#6c7482');
      ctx.fillStyle = g; ctx.fillRect(x - 13, y - 120, 26, 120);
      ctx.fillStyle = '#c6ccd4'; ctx.fillRect(x - 18, y - 128, 36, 10);
      ctx.fillStyle = '#a8afb9'; ctx.fillRect(x - 18, y - 6, 36, 6);
      ctx.strokeStyle = 'rgba(255,255,255,.16)'; ctx.lineWidth = 1;
      for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(x - 9 + i * 6, y - 116); ctx.lineTo(x - 9 + i * 6, y - 10); ctx.stroke(); }
      glow(ctx, x, y - 64, 60, '#d8eef2', .1);
      break;
    }
    case 'ascension_altar': {
      const x = p.x, y = p.y;
      ctx.fillStyle = '#8d96a6'; ctx.fillRect(x - 30, y - 22, 60, 22);
      ctx.fillStyle = '#b6bfcc'; ctx.fillRect(x - 24, y - 34, 48, 14);
      ctx.strokeStyle = 'rgba(244,228,174,.8)'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(x, y - 34); ctx.lineTo(x, y - 86); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x - 18, y - 64); ctx.lineTo(x + 18, y - 64); ctx.stroke();
      glow(ctx, x, y - 66, 90, '#f4e4ae', .3);
      for (let i = 0; i < 3; i++) { const a = t * .4 + i / 3 * TAU; ell(ctx, x + Math.cos(a) * 24, y - 66 + Math.sin(a) * 10, 2, 2); ctx.fillStyle = '#fff4c8'; ctx.fill(); }
      break;
    }
    case 'orrery': {
      const x = p.x, y = p.y;
      shadow(ctx, x + 8, y + 2, 30, 8, .25);
      ctx.strokeStyle = '#8d97ad'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y - 80); ctx.stroke();
      ctx.save(); ctx.translate(x, y - 86); ctx.rotate(t * .35);
      ctx.strokeStyle = 'rgba(199,182,255,.6)'; ctx.lineWidth = 1.5;
      for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.ellipse(0, 0, 32 - i * 6, 14 - i * 2, i * .7, 0, TAU); ctx.stroke(); }
      ctx.fillStyle = '#e8ddff'; ell(ctx, 32, 0, 4, 4); ctx.fill();
      ctx.fillStyle = '#b9f0f5'; ell(ctx, -18, -8, 3, 3); ctx.fill();
      ctx.restore();
      glow(ctx, x, y - 86, 100, '#c7b6ff', .28);
      break;
    }
    case 'void_obelisk': {
      const x = p.x, y = p.y;
      shadow(ctx, x + 10, y + 2, 26, 7, .3);
      const g = ctx.createLinearGradient(0, y, 0, y - 120);
      g.addColorStop(0, '#1c1926'); g.addColorStop(.6, '#3a2e52'); g.addColorStop(1, '#75619e');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.moveTo(x - 16, y); ctx.lineTo(x - 11, y - 92); ctx.lineTo(x, y - 124); ctx.lineTo(x + 11, y - 92); ctx.lineTo(x + 16, y); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = 'rgba(210,170,255,.5)'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(x, y - 112); ctx.lineTo(x - 4, y - 74); ctx.lineTo(x + 4, y - 54); ctx.lineTo(x - 2, y - 18); ctx.stroke();
      glow(ctx, x, y - 60, 64, '#c29bf0', .2);
      break;
    }
    case 'rift': {
      const x = p.x, y = p.y;
      const pulse = .6 + Math.sin(t * 1.8) * .25;
      ctx.save();
      const g = ctx.createRadialGradient(x, y - 70, 2, x, y - 70, 90);
      g.addColorStop(0, `rgba(235,215,255,${.65 * pulse})`); g.addColorStop(.4, `rgba(170,110,230,${.28 * pulse})`); g.addColorStop(1, 'rgba(80,40,140,0)');
      ctx.fillStyle = g; ell(ctx, x, y - 70, 54, 88); ctx.fill();
      ctx.strokeStyle = `rgba(220,190,255,${.7 * pulse})`; ctx.lineWidth = 2;
      for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        ctx.moveTo(x - 30 + i * 12, y - 156);
        ctx.bezierCurveTo(x + 22 - i * 8, y - 120, x - 26 + i * 10, y - 70, x + 6 - i * 4, y - 8);
        ctx.stroke();
      }
      ctx.restore();
      glow(ctx, x, y - 70, 160, '#d7b3ff', .25);
      break;
    }
    default: break;
  }
}

// ───────────────────────── interactables ─────────────────────────
export function drawInteractable(ctx, it, t, world) {
  if (it.type === 'chest') {
    const x = it.x, y = it.y;
    shadow(ctx, x + 8, y + 2, 28, 8, .3);
    ctx.fillStyle = it.opened ? '#5a4a32' : '#6b5232';
    rr(ctx, x - 22, y - 26, 44, 28, 4); ctx.fill();
    ctx.fillStyle = '#2a2118'; ctx.fillRect(x - 22, y - 20, 44, 3);
    if (!it.opened) {
      ctx.fillStyle = '#7d5f37';
      ctx.beginPath(); ctx.moveTo(x - 23, y - 26); ctx.quadraticCurveTo(x, y - 48, x + 23, y - 26); ctx.lineTo(x + 20, y - 22); ctx.lineTo(x - 20, y - 22); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#e8c37a'; ctx.fillRect(x - 4, y - 21, 8, 6);
      ctx.strokeStyle = 'rgba(232,195,122,.5)'; ctx.lineWidth = 1.5;
      ctx.strokeRect(x - 20, y - 24, 40, 24);
      glow(ctx, x, y - 20, 44, '#e8c37a', .18 + Math.sin(t * 2.5) * .05);
    } else {
      ctx.fillStyle = '#2a2118'; ctx.fillRect(x - 20, y - 30, 40, 6);
      ctx.fillStyle = 'rgba(0,0,0,.35)'; ell(ctx, x, y - 24, 18, 5); ctx.fill();
    }
  } else if (it.type === 'sign') {
    const x = it.x, y = it.y;
    shadow(ctx, x + 5, y + 1, 16, 5, .25);
    ctx.fillStyle = '#4b3927'; ctx.fillRect(x - 3, y - 34, 6, 36);
    ctx.fillStyle = '#6b5237'; rr(ctx, x - 24, y - 56, 48, 24, 2); ctx.fill();
    ctx.strokeStyle = 'rgba(45,32,20,.7)'; ctx.lineWidth = 1; ctx.strokeRect(x - 21, y - 53, 42, 18);
    ctx.fillStyle = 'rgba(232,195,122,.5)';
    for (let i = 0; i < 3; i++) ctx.fillRect(x - 16 + i * 4, y - 49 + (i % 2) * 3, 14, 1.2);
    ctx.fillStyle = '#8a6a3f'; ctx.beginPath(); ctx.moveTo(x + 24, y - 56); ctx.lineTo(x + 30, y - 44); ctx.lineTo(x + 24, y - 32); ctx.closePath(); ctx.fill();
  } else if (it.type === 'lore') {
    const x = it.x, y = it.y;
    if (it.read) return;
    glow(ctx, x, y - 24, 46, '#d8c58f', .2);
    ctx.fillStyle = '#8f8877';
    ctx.beginPath(); ctx.moveTo(x - 13, y); ctx.lineTo(x - 10, y - 34); ctx.lineTo(x, y - 46); ctx.lineTo(x + 10, y - 34); ctx.lineTo(x + 13, y); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(232,195,122,.65)'; ctx.lineWidth = 1.3;
    ctx.beginPath(); ctx.moveTo(x - 4, y - 36); ctx.lineTo(x + 3, y - 28); ctx.lineTo(x - 3, y - 20); ctx.lineTo(x + 4, y - 12); ctx.stroke();
  } else if (it.type === 'shrine') {
    const x = it.x, y = it.y;
    const pulse = .5 + Math.sin(t * 1.5) * .3;
    ctx.save();
    ctx.strokeStyle = `rgba(232,220,180,${.18 + pulse * .12})`; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.ellipse(x, y - 2, 42, 16, 0, 0, TAU); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(x, y - 2, 30, 10, 0, 0, TAU); ctx.stroke();
    ctx.fillStyle = `rgba(232,220,180,${.35 + pulse * .2})`;
    for (let i = 0; i < 4; i++) { const a = t * .4 + i / 4 * TAU; ell(ctx, x + Math.cos(a) * 36, y - 2 + Math.sin(a) * 14, 1.6, 1.6); ctx.fill(); }
    ctx.restore();
  } else if (it.type === 'well') {
    const x = it.x, y = it.y;
    glow(ctx, x, y - 10, 30, '#a8ded8', .12);
  } else if (it.type === 'gather') {
    // efecto de disponibilidad
    if (it.prop && !it.gathered && it.prop.harvested) it.gathered = true;
    if (it.gathered) return;
    const x = it.x, y = it.y;
    const pulse = .5 + Math.sin(t * 2.4 + it.x) * .3;
    ctx.fillStyle = `rgba(255,245,200,${.45 + pulse * .35})`;
    ell(ctx, x, y - 30, 1.8, 1.8); ctx.fill();
  }
}

