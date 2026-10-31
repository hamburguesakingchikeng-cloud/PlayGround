// ============================================================
// LA ESPADA CELESTIAL — arte procedural: props y edificios
// ============================================================
import { TAU, clamp } from './core.js';
import { rr, glow, shadow, poly, mix } from './art.js';

function flame(ctx, x, y, s, time, color = '#ffb347', core = '#fff3c4') {
  const f = Math.sin(time * 8 + x * 0.1) * 0.16;
  glow(ctx, x, y - 8 * s, 28 * s, 'rgba(255,120,50,.5)', 0.7);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x, y - 22 * s + f * 8);
  ctx.quadraticCurveTo(x + 9 * s, y - 10 * s, x + 5 * s, y - 2 * s);
  ctx.quadraticCurveTo(x, y + 3 * s, x - 5 * s, y - 2 * s);
  ctx.quadraticCurveTo(x - 9 * s, y - 10 * s, x, y - 22 * s + f * 8);
  ctx.fill();
  ctx.fillStyle = core;
  ctx.beginPath();
  ctx.moveTo(x, y - 14 * s + f * 4);
  ctx.quadraticCurveTo(x + 4 * s, y - 7 * s, x + 2 * s, y - 2 * s);
  ctx.quadraticCurveTo(x, y + 1 * s, x - 2 * s, y - 2 * s);
  ctx.quadraticCurveTo(x - 4 * s, y - 7 * s, x, y - 14 * s + f * 4);
  ctx.fill();
}

export function drawProp(ctx, p, zone, time) {
  const t = time || 0;
  const s = p.s || 1;
  const seed = p.seed || 0;
  const theme = zone?.theme || 'village';
  const sway = Math.sin(t * 1.4 + seed) * 0.8;
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.scale(s, s);
  if (p.rot) ctx.rotate(p.rot);

  switch (p.type) {
    case 'well': {
      shadow(ctx, 0, 2, 24, 8, 0.3);
      ctx.fillStyle = '#6a6a62'; ctx.beginPath(); ctx.ellipse(0, -4, 22, 10, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = '#3a3a36'; ctx.beginPath(); ctx.ellipse(0, -5, 16, 6, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = '#2f6f7a'; ctx.beginPath(); ctx.ellipse(0, -4, 13, 4, 0, 0, TAU); ctx.fill();
      ctx.strokeStyle = '#7a5a3a'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(-18, -6); ctx.lineTo(-16, -34); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(18, -6); ctx.lineTo(16, -34); ctx.stroke();
      poly(ctx, [[-22, -34], [22, -34], [14, -44], [-14, -44]], '#9d4b3f');
      ctx.fillStyle = '#d8c9a8'; ctx.fillRect(-2, -32, 4, 10);
      break;
    }
    case 'market': {
      shadow(ctx, 0, 2, 28, 8, 0.25);
      ctx.fillStyle = '#7a5a3a'; ctx.fillRect(-22, -18, 44, 16);
      ctx.fillStyle = '#5a3a22'; ctx.fillRect(-24, -4, 48, 5);
      ctx.fillStyle = '#c9a86a'; ctx.fillRect(-20, -20, 40, 3);
      for (let i = 0; i < 5; i++) {
        ctx.fillStyle = i % 2 ? '#9d4b3f' : '#e8d4a8';
        poly(ctx, [[-24 + i * 10, -34], [-16 + i * 10, -34], [-14 + i * 10, -24], [-22 + i * 10, -24]], i % 2 ? '#9d4b3f' : '#e8d4a8');
      }
      ctx.strokeStyle = '#5a3a22'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(-22, -22); ctx.lineTo(-22, -36); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(22, -22); ctx.lineTo(22, -36); ctx.stroke();
      ctx.fillStyle = '#d9b46a';
      for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.arc(-15 + i * 10, -12, 2.2, 0, TAU); ctx.fill(); }
      break;
    }
    case 'cart': {
      shadow(ctx, 0, 2, 24, 7, 0.3);
      ctx.fillStyle = '#6a4a2a'; ctx.fillRect(-20, -18, 40, 14);
      ctx.strokeStyle = '#4a3020'; ctx.lineWidth = 2; ctx.strokeRect(-20, -18, 40, 14);
      ctx.fillStyle = '#8a6a3a';
      for (let i = -16; i < 20; i += 8) ctx.fillRect(i, -17, 1.5, 12);
      ctx.fillStyle = '#3a2a20';
      ctx.beginPath(); ctx.arc(-14, -2, 7, 0, TAU); ctx.fill();
      ctx.beginPath(); ctx.arc(14, -2, 7, 0, TAU); ctx.fill();
      ctx.strokeStyle = '#9d8a6a'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(-14, -2, 4, 0, TAU); ctx.stroke();
      ctx.beginPath(); ctx.arc(14, -2, 4, 0, TAU); ctx.stroke();
      ctx.strokeStyle = '#6a4a2a'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(20, -14); ctx.lineTo(30, -12); ctx.stroke();
      break;
    }
    case 'anvil': {
      shadow(ctx, 0, 2, 15, 5, 0.3);
      ctx.fillStyle = '#3a3a42'; ctx.fillRect(-10, -6, 20, 7);
      ctx.fillStyle = '#55555f'; ctx.fillRect(-7, -14, 14, 9);
      ctx.fillStyle = '#7a7a88'; ctx.fillRect(-13, -16, 26, 4);
      poly(ctx, [[-13, -16], [-19, -14], [-13, -11]], '#7a7a88');
      glow(ctx, 0, -16, 14, 'rgba(255,120,50,.25)', 0.4);
      break;
    }
    case 'tent': {
      shadow(ctx, 0, 2, 26, 8, 0.3);
      poly(ctx, [[-28, 0], [0, -34], [28, 0]], '#8a5a3a');
      poly(ctx, [[0, -34], [28, 0], [10, 0]], '#6a422a');
      poly(ctx, [[-8, 0], [0, -26], [8, 0]], '#2a1a12');
      ctx.strokeStyle = '#c9a86a'; ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.moveTo(0, -34); ctx.lineTo(0, -42); ctx.stroke();
      break;
    }
    case 'campfire': {
      ctx.fillStyle = '#4a3020';
      ctx.save(); ctx.rotate(0.5); ctx.fillRect(-14, -3, 28, 5); ctx.restore();
      ctx.save(); ctx.rotate(-0.5); ctx.fillRect(-14, -3, 28, 5); ctx.restore();
      flame(ctx, 0, -4, 1, t);
      break;
    }
    case 'brazier': {
      shadow(ctx, 0, 2, 12, 4, 0.3);
      ctx.strokeStyle = '#6a5a4a'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(-7, 0); ctx.lineTo(-5, -14); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(7, 0); ctx.lineTo(5, -14); ctx.stroke();
      ctx.fillStyle = '#8a7a5a'; ctx.beginPath(); ctx.ellipse(0, -15, 11, 4, 0, 0, TAU); ctx.fill();
      flame(ctx, 0, -16, 0.8, t);
      break;
    }
    case 'statue': {
      shadow(ctx, 0, 2, 18, 6, 0.3);
      ctx.fillStyle = '#7a7a6a'; ctx.fillRect(-14, -8, 28, 8);
      ctx.fillStyle = '#9a9a86'; ctx.fillRect(-10, -13, 20, 5);
      ctx.fillStyle = '#8a8a78'; rr(ctx, -6, -34, 12, 22, 4); ctx.fill();
      ctx.beginPath(); ctx.arc(0, -38, 6, 0, TAU); ctx.fill();
      ctx.strokeStyle = '#8a8a78'; ctx.lineWidth = 2.4;
      ctx.beginPath(); ctx.moveTo(-5, -31); ctx.lineTo(-12, -24); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(5, -31); ctx.lineTo(12, -24); ctx.stroke();
      ctx.strokeStyle = '#c9a86a'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(0, -38, 7, 0, TAU); ctx.stroke();
      break;
    }
    case 'pillar': {
      shadow(ctx, 0, 2, 13, 5, 0.3);
      ctx.fillStyle = '#8a8a7a'; ctx.fillRect(-11, -7, 22, 7);
      const g = ctx.createLinearGradient(-8, 0, 8, 0);
      g.addColorStop(0, '#6a6a5c'); g.addColorStop(0.5, '#b0b0a0'); g.addColorStop(1, '#6a6a5c');
      ctx.fillStyle = g; ctx.fillRect(-8, -48, 16, 42);
      ctx.fillStyle = '#9a9a8a'; ctx.fillRect(-12, -52, 24, 6);
      ctx.strokeStyle = 'rgba(60,60,50,.5)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(-4, -44); ctx.lineTo(-2, -24); ctx.lineTo(-5, -10); ctx.stroke();
      break;
    }
    case 'arch': {
      shadow(ctx, 0, 2, 32, 8, 0.3);
      ctx.fillStyle = '#8a8a78';
      ctx.fillRect(-30, -44, 9, 44); ctx.fillRect(21, -44, 9, 44);
      ctx.beginPath(); ctx.arc(0, -44, 30, Math.PI, TAU); ctx.lineWidth = 9; ctx.strokeStyle = '#8a8a78'; ctx.stroke();
      ctx.strokeStyle = 'rgba(255,255,255,.15)'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(0, -44, 25, Math.PI, TAU); ctx.stroke();
      ctx.fillStyle = '#9fe8ff'; ctx.globalAlpha = 0.35;
      ctx.beginPath(); ctx.arc(0, -44, 18, Math.PI, TAU); ctx.fill(); ctx.globalAlpha = 1;
      break;
    }
    case 'shelf': {
      shadow(ctx, 0, 2, 24, 6, 0.3);
      ctx.fillStyle = '#3a2a22'; ctx.fillRect(-20, -44, 40, 44);
      ctx.fillStyle = '#5a3a2a'; ctx.fillRect(-18, -42, 36, 40);
      for (let row = 0; row < 3; row++) {
        ctx.fillStyle = '#2a1a12'; ctx.fillRect(-18, -32 + row * 12, 36, 2);
        for (let i = 0; i < 7; i++) {
          const h = 7 + ((i * 7 + row * 5 + Math.floor(seed)) % 4);
          const cols = ['#9d4b3f', '#4f6b8a', '#7a5a3a', '#6b4b8a', '#c9a86a', '#4a7a5a'];
          ctx.fillStyle = cols[(i + row) % cols.length];
          ctx.fillRect(-16 + i * 5, -31 + row * 12 - h, 3.5, h);
        }
      }
      break;
    }
    case 'throne': {
      shadow(ctx, 0, 2, 28, 8, 0.35);
      ctx.fillStyle = '#2a1a1a'; ctx.fillRect(-22, -10, 44, 10);
      ctx.fillStyle = '#3a2026'; ctx.fillRect(-18, -48, 36, 40);
      ctx.fillStyle = '#5a2a2a'; ctx.fillRect(-14, -44, 28, 32);
      poly(ctx, [[-22, -48], [-16, -66], [-10, -48]], '#8a3a3a');
      poly(ctx, [[-6, -48], [0, -72], [6, -48]], '#8a3a3a');
      poly(ctx, [[10, -48], [16, -66], [22, -48]], '#8a3a3a');
      glow(ctx, 0, -24, 24, 'rgba(255,90,54,.35)', 0.5);
      break;
    }
    case 'dais': {
      ctx.fillStyle = '#5a6a8a'; ctx.beginPath(); ctx.ellipse(0, -2, 38, 14, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = '#7a8aa8'; ctx.beginPath(); ctx.ellipse(0, -4, 32, 11, 0, 0, TAU); ctx.fill();
      ctx.strokeStyle = '#c9d8f8'; ctx.globalAlpha = 0.4; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.ellipse(0, -4, 24, 8, 0, 0, TAU); ctx.stroke();
      for (let i = 0; i < 8; i++) { const a = i / 8 * TAU + t * 0.2; ctx.fillStyle = '#9fe8ff'; ctx.globalAlpha = 0.5; ctx.beginPath(); ctx.arc(Math.cos(a) * 20, -4 + Math.sin(a) * 6, 1.4, 0, TAU); ctx.fill(); }
      ctx.globalAlpha = 1;
      break;
    }
    case 'lamp': {
      shadow(ctx, 0, 2, 7, 3, 0.3);
      ctx.strokeStyle = '#4a3a2a'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -40); ctx.stroke();
      ctx.fillStyle = '#c9a86a'; ctx.fillRect(-7, -44, 14, 4);
      ctx.fillStyle = '#ffe9a8'; ctx.globalAlpha = 0.9; ctx.fillRect(-4, -40, 8, 9); ctx.globalAlpha = 1;
      glow(ctx, 0, -36, 28, 'rgba(255,220,140,.45)', 0.5);
      break;
    }
    case 'fence': {
      ctx.strokeStyle = '#6a4a2a'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(-16, 0); ctx.lineTo(-16, -18); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -20); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(16, 0); ctx.lineTo(16, -18); ctx.stroke();
      ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-18, -12); ctx.lineTo(18, -12); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-18, -5); ctx.lineTo(18, -5); ctx.stroke();
      break;
    }
    case 'scarecrow': {
      shadow(ctx, 0, 2, 12, 4, 0.25);
      ctx.strokeStyle = '#5a3a22'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -34); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-16, -26); ctx.lineTo(16, -26); ctx.stroke();
      ctx.fillStyle = '#8a6a3a'; ctx.fillRect(-8, -28, 16, 16);
      ctx.fillStyle = '#c9a86a'; ctx.beginPath(); ctx.arc(0, -34, 7, 0, TAU); ctx.fill();
      ctx.fillStyle = '#3a2a20'; ctx.fillRect(-4, -36, 2, 2); ctx.fillRect(2, -36, 2, 2);
      poly(ctx, [[-9, -40], [9, -40], [5, -46], [-5, -46]], '#6a4a2a');
      break;
    }
    case 'log': {
      shadow(ctx, 0, 2, 22, 5, 0.25);
      ctx.save(); ctx.rotate(0.08);
      ctx.fillStyle = '#5a3a22'; rr(ctx, -22, -11, 44, 11, 5); ctx.fill();
      ctx.fillStyle = '#8a6a4a'; ctx.beginPath(); ctx.ellipse(22, -5.5, 5, 5.5, 0, 0, TAU); ctx.fill();
      ctx.strokeStyle = '#5a3a22'; ctx.lineWidth = 1; ctx.beginPath(); ctx.ellipse(22, -5.5, 2.5, 3, 0, 0, TAU); ctx.stroke();
      ctx.restore();
      break;
    }
    case 'mushroomRing': {
      for (let i = 0; i < 8; i++) {
        const a = i / 8 * TAU + seed;
        const x = Math.cos(a) * 18, y = Math.sin(a) * 8;
        ctx.fillStyle = '#d8c9a8'; ctx.fillRect(x - 1, y - 6, 2, 6);
        ctx.fillStyle = i % 2 ? '#7de8d0' : '#c95a4a';
        ctx.beginPath(); ctx.ellipse(x, y - 6, 5, 3, 0, Math.PI, TAU); ctx.fill();
        if (i % 2) glow(ctx, x, y - 6, 12, 'rgba(125,232,208,.35)', 0.4);
      }
      break;
    }
    case 'crystal': case 'crystalShard': case 'voidCrystal': {
      const col = p.type === 'voidCrystal' ? '#8b6bff' : '#9fe8ff';
      glow(ctx, 0, -16, 34, p.type === 'voidCrystal' ? 'rgba(140,100,255,.32)' : 'rgba(120,220,255,.32)', 0.55);
      glow(ctx, 0, -14, 30, p.type === 'voidCrystal' ? 'rgba(140,100,255,.35)' : 'rgba(120,220,255,.32)', 0.55);
      for (let i = 0; i < 4; i++) {
        const a = i * 0.6 + seed;
        const h = 18 + (i % 3) * 9;
        poly(ctx, [[Math.cos(a) * 3, -h], [Math.cos(a + 0.35) * 7, -2], [Math.cos(a - 0.3) * 7, -2]], i % 2 ? col : mix(col, '#ffffff', 0.25));
      }
      break;
    }
    case 'obsidian': case 'voidRock': {
      const col = p.type === 'voidRock' ? '#2a1d50' : '#2a2228';
      shadow(ctx, 0, 2, 16, 5, 0.35);
      poly(ctx, [[-16, 0], [-10, -18], [-2, -28], [6, -20], [14, -26], [18, 0]], col);
      poly(ctx, [[-8, -3], [-4, -16], [2, -22], [6, -10], [3, -3]], mix(col, '#8b6bff', 0.25));
      break;
    }
    case 'skull': {
      ctx.fillStyle = '#d8d0b8'; ctx.beginPath(); ctx.arc(0, -8, 7, 0, TAU); ctx.fill();
      ctx.fillRect(-4, -4, 8, 5);
      ctx.fillStyle = '#3a2a20'; ctx.beginPath(); ctx.arc(-2.5, -9, 1.5, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.arc(2.5, -9, 1.5, 0, TAU); ctx.fill();
      break;
    }
    case 'lavaFall': {
      glow(ctx, 0, -10, 40, 'rgba(255,90,40,.35)', 0.6);
      ctx.fillStyle = '#c93a1a'; ctx.beginPath(); ctx.moveTo(-8, -44); ctx.quadraticCurveTo(0, -20, -4, 4); ctx.lineTo(4, 4); ctx.quadraticCurveTo(0, -20, 8, -44); ctx.fill();
      ctx.fillStyle = '#ffd166'; ctx.globalAlpha = 0.7; ctx.fillRect(-2, -34, 2, 28); ctx.globalAlpha = 1;
      break;
    }
    case 'floatingRock': {
      const float = Math.sin(t * 1.2 + seed) * 4;
      shadow(ctx, 0, 10, 22, 6, 0.2);
      poly(ctx, [[-22, -18 + float], [-12, -34 + float], [8, -38 + float], [24, -22 + float], [18, -4 + float], [-6, -2 + float]], '#3a2a5a');
      poly(ctx, [[-12, -20 + float], [-4, -30 + float], [8, -28 + float], [12, -14 + float], [2, -8 + float]], '#5a4a7a');
      glow(ctx, 0, 0, 30, 'rgba(140,100,255,.3)', 0.4);
      break;
    }
    case 'star': {
      const spin = t * 0.4;
      ctx.save(); ctx.translate(0, -26); ctx.rotate(spin);
      ctx.fillStyle = '#fff3c4'; ctx.shadowColor = '#9fe8ff'; ctx.shadowBlur = 22;
      ctx.beginPath();
      for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5; const r = i % 2 ? 6 : 18; ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); }
      ctx.closePath(); ctx.fill(); ctx.restore();
      glow(ctx, 0, -26, 40, 'rgba(255,240,180,.35)', 0.5);
      break;
    }
    case 'banner': {
      ctx.strokeStyle = '#5a3a22'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -44); ctx.stroke();
      ctx.fillStyle = p.color || '#4a5d7c';
      const w = Math.sin(t * 2 + seed) * 2;
      poly(ctx, [[0, -42], [18 + w, -38], [16 + w, -18], [0, -22]], p.color || '#4a5d7c');
      ctx.fillStyle = '#d9b46a'; ctx.beginPath(); ctx.arc(8, -30, 3, 0, TAU); ctx.fill();
      break;
    }
    case 'bench': {
      shadow(ctx, 0, 2, 20, 4, 0.25);
      ctx.fillStyle = '#6a4a2a'; ctx.fillRect(-20, -10, 40, 4);
      ctx.fillStyle = '#8a6a3a'; ctx.fillRect(-20, -14, 40, 4);
      ctx.fillStyle = '#4a3020'; ctx.fillRect(-16, -6, 3, 7); ctx.fillRect(13, -6, 3, 7);
      break;
    }
    case 'bridge': {
      ctx.save(); ctx.translate(0, 0);
      ctx.fillStyle = '#7a5a3a'; ctx.fillRect(-82, -24, 164, 48);
      for (let i = -80; i < 82; i += 12) { ctx.fillStyle = i % 24 === 0 ? '#8a6a4a' : '#6a4a2a'; ctx.fillRect(i, -22, 10, 44); }
      ctx.strokeStyle = '#4a3020'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-82, -24); ctx.lineTo(82, -24); ctx.moveTo(-82, 24); ctx.lineTo(82, 24); ctx.stroke();
      ctx.restore();
      break;
    }
    case 'windmill': {
      shadow(ctx, 0, 2, 30, 8, 0.3);
      ctx.fillStyle = '#d8c9a8'; ctx.fillRect(-18, -60, 36, 58);
      poly(ctx, [[-24, -60], [0, -82], [24, -60]], '#8c5a35');
      ctx.fillStyle = '#3a2a20'; ctx.fillRect(-6, -24, 12, 22);
      const rot = t * 0.7;
      ctx.save(); ctx.translate(0, -50); ctx.rotate(rot);
      for (let i = 0; i < 4; i++) { ctx.save(); ctx.rotate(i * Math.PI / 2); ctx.fillStyle = '#c9a86a'; ctx.fillRect(0, -3, 38, 6); ctx.restore(); }
      ctx.fillStyle = '#5a3a22'; ctx.beginPath(); ctx.arc(0, 0, 4, 0, TAU); ctx.fill();
      ctx.restore();
      break;
    }
    case 'stoneCircle': {
      for (let i = 0; i < 7; i++) {
        const a = i / 7 * TAU + seed;
        const x = Math.cos(a) * 34, y = Math.sin(a) * 16;
        ctx.fillStyle = i % 2 ? '#7a7a6a' : '#8a8a78';
        poly(ctx, [[x - 5, y], [x - 3, y - 20 - (i % 3) * 4], [x + 3, y - 22 - (i % 3) * 4], [x + 5, y]], i % 2 ? '#7a7a6a' : '#8a8a78');
      }
      glow(ctx, 0, -8, 40, 'rgba(160,230,255,.18)', 0.5);
      break;
    }
    case 'runeCircle': {
      ctx.strokeStyle = 'rgba(180,140,255,.55)'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.ellipse(0, 0, 38, 16, 0, 0, TAU); ctx.stroke();
      ctx.beginPath(); ctx.ellipse(0, 0, 28, 11, 0, 0, TAU); ctx.stroke();
      for (let i = 0; i < 10; i++) {
        const a = i / 10 * TAU + t * 0.15;
        ctx.fillStyle = i % 2 ? '#b48cff' : '#9fe8ff';
        ctx.globalAlpha = 0.5 + Math.sin(t * 2 + i) * 0.2;
        ctx.beginPath(); ctx.arc(Math.cos(a) * 33, Math.sin(a) * 14, 1.6, 0, TAU); ctx.fill();
      }
      ctx.globalAlpha = 1;
      break;
    }
    case 'bell': {
      ctx.strokeStyle = '#5a3a22'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-18, 0); ctx.lineTo(-18, -34); ctx.moveTo(18, 0); ctx.lineTo(18, -34); ctx.moveTo(-18, -34); ctx.lineTo(18, -34); ctx.stroke();
      ctx.fillStyle = '#8a7a4a'; ctx.beginPath(); ctx.moveTo(-10, -34); ctx.quadraticCurveTo(-10, -20, -16, -16); ctx.lineTo(16, -16); ctx.quadraticCurveTo(10, -20, 10, -34); ctx.fill();
      ctx.fillStyle = '#c9a86a'; ctx.beginPath(); ctx.arc(0, -12, 2.5, 0, TAU); ctx.fill();
      break;
    }
    case 'candle': {
      ctx.fillStyle = '#e8d4a8'; ctx.fillRect(-1.5, -12, 3, 12);
      flame(ctx, 0, -13, 0.35, t, '#ffd166', '#fff3c4');
      break;
    }
    default: {
      ctx.fillStyle = '#6a5a44'; ctx.fillRect(-14, -14, 28, 14);
      ctx.strokeStyle = '#3a2a20'; ctx.lineWidth = 1.5; ctx.strokeRect(-14, -14, 28, 14);
      ctx.beginPath(); ctx.moveTo(-14, -14); ctx.lineTo(14, 0); ctx.stroke();
    }
  }
  ctx.restore();
}

export function drawBuilding(ctx, b, zone, time) {
  const style = b.style || 'house';
  const wall = b.wall || '#d8c9a8';
  const roof = b.roof || '#9d4b3f';
  const x = b.x, y = b.y, w = b.w, h = b.h;
  const t = time || 0;
  ctx.save();
  shadow(ctx, x + w / 2, y + h - 4, w * 0.52, h * 0.11, 0.32);

  if (style === 'windmill') {
    ctx.fillStyle = wall; ctx.fillRect(x + w * 0.2, y + h * 0.15, w * 0.6, h * 0.8);
    poly(ctx, [[x + w * 0.1, y + h * 0.2], [x + w * 0.5, y - h * 0.05], [x + w * 0.9, y + h * 0.2]], roof);
    ctx.fillStyle = '#3a2a20'; ctx.fillRect(x + w * 0.42, y + h * 0.62, w * 0.16, h * 0.33);
    ctx.save(); ctx.translate(x + w * 0.5, y + h * 0.25); ctx.rotate(t * 0.5);
    for (let i = 0; i < 4; i++) { ctx.save(); ctx.rotate(i * Math.PI / 2); ctx.fillStyle = '#c9a86a'; ctx.fillRect(0, -3, w * 0.38, 6); ctx.restore(); }
    ctx.restore();
    ctx.restore(); return;
  }

  // cuerpo
  const bodyY = y + h * 0.28;
  const bodyH = h * 0.72;
  const wallGrad = ctx.createLinearGradient(x, bodyY, x + w, bodyY + bodyH);
  wallGrad.addColorStop(0, mix(wall, '#ffffff', 0.08));
  wallGrad.addColorStop(0.6, wall);
  wallGrad.addColorStop(1, mix(wall, '#000000', 0.24));
  ctx.fillStyle = wallGrad;
  ctx.fillRect(x, bodyY, w, bodyH);

  // piedra / madera
  if (style === 'temple' || style === 'ruin' || style === 'fortress' || style === 'tower') {
    ctx.strokeStyle = 'rgba(40,40,35,.35)'; ctx.lineWidth = 1;
    for (let yy = bodyY + 8; yy < y + h; yy += 14) { ctx.beginPath(); ctx.moveTo(x, yy); ctx.lineTo(x + w, yy); ctx.stroke(); }
    for (let xx = x + 12; xx < x + w; xx += 26) { ctx.beginPath(); ctx.moveTo(xx, bodyY); ctx.lineTo(xx, y + h); ctx.stroke(); }
  } else {
    ctx.strokeStyle = 'rgba(70,45,25,.25)'; ctx.lineWidth = 1;
    for (let xx = x + 8; xx < x + w; xx += 16) { ctx.beginPath(); ctx.moveTo(xx, bodyY); ctx.lineTo(xx, y + h); ctx.stroke(); }
  }

  // tejado
  if (style === 'temple') {
    poly(ctx, [[x - w * 0.06, bodyY + 4], [x + w * 0.5, y - h * 0.04], [x + w * 1.06, bodyY + 4]], roof);
    ctx.strokeStyle = '#d9b46a'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(x - w * 0.06, bodyY + 4); ctx.lineTo(x + w * 0.5, y - h * 0.04); ctx.lineTo(x + w * 1.06, bodyY + 4); ctx.stroke();
    // columnas
    ctx.fillStyle = mix(wall, '#ffffff', 0.18);
    for (let i = 0; i < 5; i++) ctx.fillRect(x + 10 + i * (w - 20) / 4, bodyY + 8, 8, bodyH - 14);
  } else if (style === 'fortress') {
    poly(ctx, [[x - 10, bodyY + 4], [x + w * 0.5, y - h * 0.08], [x + w + 10, bodyY + 4]], roof);
    for (let i = 0; i < 7; i++) ctx.fillRect(x + i * w / 7, bodyY - 12, w / 14, 18);
    ctx.fillStyle = '#2a1a1a'; ctx.fillRect(x + w * 0.42, bodyY + bodyH * 0.35, w * 0.16, bodyH * 0.65);
  } else if (style === 'ruin') {
    poly(ctx, [[x, bodyY + 4], [x + w * 0.35, y + h * 0.06], [x + w * 0.55, bodyY - 6], [x + w, bodyY + 8]], roof);
    ctx.fillStyle = 'rgba(0,0,0,.25)';
    ctx.beginPath(); ctx.moveTo(x + w * 0.55, bodyY); ctx.lineTo(x + w * 0.7, y + h); ctx.lineTo(x + w * 0.9, y + h); ctx.lineTo(x + w * 0.7, bodyY); ctx.fill();
    ctx.fillStyle = mix(wall, '#000000', 0.5); ctx.fillRect(x + w * 0.35, bodyY + 10, w * 0.2, bodyH * 0.55);
  } else if (style === 'camp') {
    poly(ctx, [[x - 6, bodyY + 4], [x + w * 0.5, y + h * 0.1], [x + w + 6, bodyY + 4]], roof);
    ctx.fillStyle = '#2a1a12'; ctx.fillRect(x + w * 0.38, bodyY + bodyH * 0.35, w * 0.24, bodyH * 0.65);
  } else if (style === 'tower') {
    poly(ctx, [[x - 8, bodyY + 4], [x + w * 0.5, y + h * 0.02], [x + w + 8, bodyY + 4]], roof);
    ctx.fillStyle = mix(wall, '#000000', 0.2); ctx.fillRect(x + w * 0.35, bodyY + 10, w * 0.3, bodyH * 0.5);
    for (let i = 0; i < 4; i++) ctx.fillRect(x + i * w / 4, bodyY - 10, w / 8, 16);
  } else {
    poly(ctx, [[x - 8, bodyY + 6], [x + w * 0.5, y - h * 0.02], [x + w + 8, bodyY + 6]], roof);
    ctx.strokeStyle = mix(roof, '#000000', 0.35); ctx.lineWidth = 1;
    for (let i = 1; i < 8; i++) { const px = x - 8 + i * (w + 16) / 8; ctx.beginPath(); ctx.moveTo(px, bodyY + 6); ctx.lineTo(x + w * 0.5 + (px - x - w * 0.5) * 0.2, y - h * 0.02); ctx.stroke(); }
  }

  // puerta
  const doorW = Math.min(30, w * 0.18), doorH = Math.min(44, h * 0.42);
  const dx = x + w * 0.5 - doorW / 2, dy = y + h - doorH;
  ctx.fillStyle = '#3a2418'; rr(ctx, dx, dy, doorW, doorH, 8); ctx.fill();
  ctx.strokeStyle = '#c9a86a'; ctx.lineWidth = 1.2; ctx.stroke();
  ctx.fillStyle = '#d9b46a'; ctx.beginPath(); ctx.arc(dx + doorW * 0.78, dy + doorH * 0.55, 1.4, 0, TAU); ctx.fill();

  // ventanas
  if (style !== 'ruin' && style !== 'camp') {
    const winY = bodyY + bodyH * 0.28;
    for (const wx of [x + w * 0.2, x + w * 0.8]) {
      ctx.fillStyle = 'rgba(255,220,140,.65)'; ctx.fillRect(wx - 7, winY, 14, 14);
      ctx.strokeStyle = '#3a2a20'; ctx.lineWidth = 1; ctx.strokeRect(wx - 7, winY, 14, 14);
      ctx.beginPath(); ctx.moveTo(wx, winY); ctx.lineTo(wx, winY + 14); ctx.moveTo(wx - 7, winY + 7); ctx.lineTo(wx + 7, winY + 7); ctx.stroke();
      glow(ctx, wx, winY + 7, 20, 'rgba(255,200,110,.25)', 0.4);
    }
  }

  // detalles por estilo
  if (style === 'forge') {
    ctx.fillStyle = '#3a2a20'; ctx.fillRect(x + w * 0.12, y + h * 0.18, 14, 30);
    glow(ctx, x + w * 0.18, y + h * 0.3, 24, 'rgba(255,120,50,.4)', 0.6);
    flame(ctx, x + w * 0.18, y + h * 0.36, 0.6, t);
  }
  if (style === 'inn') {
    ctx.fillStyle = '#d9b46a'; ctx.beginPath(); ctx.arc(x + w * 0.78, bodyY + 20, 8, 0, TAU); ctx.fill();
    ctx.fillStyle = '#4a3020'; ctx.font = 'bold 9px Georgia'; ctx.textAlign = 'center'; ctx.fillText('◈', x + w * 0.78, bodyY + 23);
  }
  if (style === 'temple') {
    glow(ctx, x + w * 0.5, y + h * 0.5, w * 0.4, 'rgba(140,210,255,.12)', 0.6);
    ctx.strokeStyle = 'rgba(217,180,106,.35)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(x + w * 0.5, bodyY + 26, 16, 0, TAU); ctx.stroke();
  }
  if (style === 'fortress') {
    glow(ctx, x + w * 0.5, y + h * 0.7, w * 0.35, 'rgba(255,90,40,.12)', 0.6);
  }
  ctx.restore();
}
