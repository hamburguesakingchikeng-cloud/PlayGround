import { TAU, rgba } from '../../core/utils.js';
import { PORTRAITS } from '../../data/story.js';
import { glowCircle, star, eye, humanHair, roundRect } from './common.js';

export function drawPortrait(ctx, w, h, portraitId, player, time = 0) {
  const p = portraitId === 'player'
    ? { name: player?.name || 'Tú', skin: player?.appearance?.skin || '#e8c9a8', hair: player?.appearance?.hairColor || '#3a2a1a', cloth: player?.appearance?.outfit || '#4a6a4a', accent: '#ffe7a8', role: 'Jugador Cero' }
    : PORTRAITS[portraitId] || { name: 'Eco', skin: '#c7a4ff', hair: '#e8e0ff', cloth: '#3a2a5a', accent: '#ffe7a8', role: '' };
  const cx = w / 2;
  ctx.clearRect(0, 0, w, h);
  // Fondo.
  const bg = ctx.createLinearGradient(0, 0, 0, h);
  bg.addColorStop(0, '#16101f');
  bg.addColorStop(0.55, '#241a30');
  bg.addColorStop(1, '#0c0812');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);
  const halo = ctx.createRadialGradient(cx, h * 0.32, 4, cx, h * 0.38, w * 0.62);
  halo.addColorStop(0, rgba(p.accent, 0.3));
  halo.addColorStop(0.55, rgba(p.accent, 0.09));
  halo.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = halo;
  ctx.fillRect(0, 0, w, h);
  // Estrellas tenues.
  for (let i = 0; i < 18; i++) {
    const sx = (Math.sin(i * 37.1 + 4) * 0.5 + 0.5) * w;
    const sy = (Math.cos(i * 17.7 + 2) * 0.5 + 0.5) * h * 0.72;
    ctx.fillStyle = `rgba(255,255,255,${0.04 + (i % 3) * 0.04})`;
    ctx.beginPath(); ctx.arc(sx, sy, 0.8 + (i % 2), 0, TAU); ctx.fill();
  }

  const baseY = h * 0.44;
  const headR = w * 0.155;

  // Casos especiales.
  if (portraitId === 'veil') {
    ctx.fillStyle = '#0a0610';
    ctx.beginPath();
    ctx.moveTo(cx, h * 0.08);
    ctx.quadraticCurveTo(cx + w * 0.42, h * 0.4, cx + w * 0.34, h);
    ctx.lineTo(cx - w * 0.34, h);
    ctx.quadraticCurveTo(cx - w * 0.42, h * 0.4, cx, h * 0.08);
    ctx.fill();
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * TAU + time * 0.1;
      const rr = w * (0.18 + (i % 3) * 0.04);
      ctx.fillStyle = `rgba(199,164,255,${0.2 + (i % 2) * 0.2})`;
      ctx.beginPath(); ctx.arc(cx + Math.cos(a) * rr, h * 0.44 + Math.sin(a) * rr * 0.7, 1.4, 0, TAU); ctx.fill();
    }
    ctx.fillStyle = '#e8e0f0';
    ctx.beginPath(); ctx.ellipse(cx, h * 0.38, w * 0.13, h * 0.14, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = '#0a0610';
    ctx.beginPath(); ctx.ellipse(cx, h * 0.37, w * 0.09, h * 0.055, 0, 0, TAU); ctx.fill();
    eye(ctx, cx - w * 0.04, h * 0.365, w * 0.018, '#c7a4ff');
    eye(ctx, cx + w * 0.04, h * 0.365, w * 0.018, '#c7a4ff');
    ctx.strokeStyle = 'rgba(199,164,255,0.55)';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(cx, h * 0.38, w * 0.2, 0.2, Math.PI - 0.2); ctx.stroke();
    return;
  }
  if (portraitId === 'jarra') {
    glowCircle(ctx, cx, h * 0.48, w * 0.4, '#ffe7a8', 0.3);
    const g = ctx.createLinearGradient(cx - 40, h * 0.3, cx + 40, h * 0.75);
    g.addColorStop(0, '#fff3c4'); g.addColorStop(0.45, '#d9b46a'); g.addColorStop(1, '#6a4a1a');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(cx, h * 0.58, w * 0.16, h * 0.2, 0, 0, TAU);
    ctx.fill();
    ctx.fillStyle = '#8a6a2a';
    ctx.beginPath(); ctx.ellipse(cx, h * 0.34, w * 0.08, h * 0.035, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = '#ffe7a8';
    ctx.beginPath(); ctx.ellipse(cx, h * 0.34, w * 0.05, h * 0.018, 0, 0, TAU); ctx.fill();
    for (let i = 0; i < 5; i++) {
      star(ctx, cx + Math.sin(time + i * 2) * w * 0.22, h * 0.28 + Math.cos(time * 0.7 + i) * h * 0.16, 3 + i % 2, '#fff3c4', 4, time * 0.4 + i);
    }
    return;
  }
  if (portraitId === 'guardian') {
    glowCircle(ctx, cx, h * 0.38, w * 0.38, '#8fd18a', 0.2);
    ctx.fillStyle = '#3a2e22';
    ctx.beginPath();
    ctx.moveTo(cx - w * 0.28, h);
    ctx.quadraticCurveTo(cx - w * 0.34, h * 0.44, cx - w * 0.18, h * 0.2);
    ctx.lineTo(cx + w * 0.18, h * 0.2);
    ctx.quadraticCurveTo(cx + w * 0.34, h * 0.44, cx + w * 0.28, h);
    ctx.closePath(); ctx.fill();
    for (let i = 0; i < 5; i++) {
      ctx.strokeStyle = '#2a2018'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(cx - w * 0.18 + i * w * 0.09, h * 0.22); ctx.quadraticCurveTo(cx - w * 0.22 + i * w * 0.11, h * 0.55, cx - w * 0.1 + i * w * 0.05, h); ctx.stroke();
    }
    for (let i = 0; i < 5; i++) {
      const a = Math.PI + (i / 4) * Math.PI;
      ctx.fillStyle = i % 2 ? '#5c8f4f' : '#2f5a37';
      ctx.beginPath(); ctx.arc(cx + Math.cos(a) * w * 0.32, h * 0.16 + Math.sin(a) * h * 0.14, w * 0.13, 0, TAU); ctx.fill();
    }
    eye(ctx, cx - w * 0.07, h * 0.38, w * 0.025, '#8fd18a');
    eye(ctx, cx + w * 0.07, h * 0.38, w * 0.025, '#8fd18a');
    ctx.strokeStyle = '#1a1212'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(cx, h * 0.47, w * 0.08, 0.2, Math.PI - 0.2); ctx.stroke();
    return;
  }
  if (portraitId === 'aurel') {
    glowCircle(ctx, cx, h * 0.42, w * 0.4, '#ffe7a8', 0.3);
    // Zorro espiritual.
    ctx.fillStyle = '#ffd98a';
    ctx.beginPath(); ctx.ellipse(cx, h * 0.55, w * 0.2, h * 0.16, 0, 0, TAU); ctx.fill();
    ctx.beginPath(); ctx.arc(cx, h * 0.38, w * 0.14, 0, TAU); ctx.fill();
    ctx.beginPath(); ctx.moveTo(cx - w * 0.11, h * 0.3); ctx.lineTo(cx - w * 0.16, h * 0.18); ctx.lineTo(cx - w * 0.04, h * 0.27); ctx.fill();
    ctx.beginPath(); ctx.moveTo(cx + w * 0.11, h * 0.3); ctx.lineTo(cx + w * 0.16, h * 0.18); ctx.lineTo(cx + w * 0.04, h * 0.27); ctx.fill();
    eye(ctx, cx - w * 0.055, h * 0.37, w * 0.02, '#4a7a8a');
    eye(ctx, cx + w * 0.055, h * 0.37, w * 0.02, '#4a7a8a');
    ctx.fillStyle = '#6a4a2a';
    ctx.beginPath(); ctx.ellipse(cx, h * 0.43, w * 0.03, w * 0.02, 0, 0, TAU); ctx.fill();
    ctx.strokeStyle = '#ffd98a'; ctx.lineWidth = 5; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(cx + w * 0.16, h * 0.62); ctx.quadraticCurveTo(cx + w * 0.34, h * 0.55, cx + w * 0.28, h * 0.38); ctx.stroke();
    return;
  }

  // Retrato humanoide.
  // Hombros y ropa.
  const cloth = portraitId === 'echo' ? '#3a2a5a' : p.cloth;
  const clothGrad = ctx.createLinearGradient(0, h * 0.62, 0, h);
  clothGrad.addColorStop(0, cloth);
  clothGrad.addColorStop(1, '#0c0812');
  ctx.fillStyle = clothGrad;
  ctx.beginPath();
  ctx.moveTo(cx - w * 0.42, h);
  ctx.quadraticCurveTo(cx - w * 0.38, h * 0.68, cx - w * 0.14, h * 0.61);
  ctx.lineTo(cx + w * 0.14, h * 0.61);
  ctx.quadraticCurveTo(cx + w * 0.38, h * 0.68, cx + w * 0.42, h);
  ctx.closePath(); ctx.fill();
  // Cuello.
  ctx.fillStyle = p.skin;
  ctx.fillRect(cx - headR * 0.32, baseY + headR * 0.6, headR * 0.64, headR * 0.75);
  // Cabeza.
  ctx.fillStyle = p.skin;
  ctx.beginPath(); ctx.ellipse(cx, baseY, headR * 0.86, headR, 0, 0, TAU); ctx.fill();
  // Sombra lateral.
  ctx.fillStyle = 'rgba(0,0,0,0.08)';
  ctx.beginPath(); ctx.ellipse(cx + headR * 0.34, baseY + 2, headR * 0.5, headR * 0.86, 0, 0, TAU); ctx.fill();
  // Pelo.
  const style = portraitId === 'maren' ? 1 : portraitId === 'lyra' ? 2 : portraitId === 'vela' ? 1 : portraitId === 'kael' ? 0 : portraitId === 'echo' ? 4 : 3;
  ctx.save();
  ctx.translate(cx, baseY);
  humanHair(ctx, style, p.hair, 0, headR, 0, time);
  ctx.restore();
  // Orejas.
  ctx.fillStyle = p.skin;
  ctx.beginPath(); ctx.ellipse(cx - headR * 0.86, baseY + 4, headR * 0.12, headR * 0.22, 0, 0, TAU); ctx.fill();
  ctx.beginPath(); ctx.ellipse(cx + headR * 0.86, baseY + 4, headR * 0.12, headR * 0.22, 0, 0, TAU); ctx.fill();
  // Cejas y ojos.
  ctx.strokeStyle = rgba(p.hair, 0.9);
  ctx.lineWidth = Math.max(2, w * 0.008);
  ctx.beginPath(); ctx.moveTo(cx - headR * 0.5, baseY - headR * 0.14); ctx.lineTo(cx - headR * 0.16, baseY - headR * 0.2); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx + headR * 0.16, baseY - headR * 0.2); ctx.lineTo(cx + headR * 0.5, baseY - headR * 0.14); ctx.stroke();
  const eyeColor = portraitId === 'echo' ? '#c7a4ff' : portraitId === 'dama' ? '#fff3c4' : portraitId === 'aurel' ? '#ffe7a8' : '#4a7a8a';
  eye(ctx, cx - headR * 0.33, baseY + headR * 0.02, headR * 0.13, eyeColor);
  eye(ctx, cx + headR * 0.33, baseY + headR * 0.02, headR * 0.13, eyeColor);
  // Nariz.
  ctx.strokeStyle = 'rgba(120,70,60,0.45)';
  ctx.lineWidth = Math.max(1.5, w * 0.006);
  ctx.beginPath(); ctx.moveTo(cx + headR * 0.04, baseY + headR * 0.12); ctx.lineTo(cx - headR * 0.02, baseY + headR * 0.3); ctx.stroke();
  // Boca.
  ctx.strokeStyle = portraitId === 'dama' ? '#8a2a1a' : 'rgba(110,50,50,0.65)';
  ctx.lineWidth = Math.max(2, w * 0.008);
  ctx.beginPath();
  ctx.arc(cx, baseY + headR * 0.52, headR * 0.16, 0.15, Math.PI - 0.15);
  ctx.stroke();
  // Detalles de personaje.
  if (portraitId === 'dama') {
    for (let i = 0; i < 5; i++) {
      const fx = cx - headR * 0.9 + i * headR * 0.45;
      star(ctx, fx, baseY - headR * 1.15 + Math.sin(time * 3 + i) * 4, headR * 0.12, '#ff9a5c', 4, time + i);
    }
    glowCircle(ctx, cx, baseY, headR * 1.4, '#ff9a5c', 0.14);
  }
  if (portraitId === 'echo') {
    ctx.globalAlpha = 0.25;
    ctx.fillStyle = '#c7a4ff';
    ctx.beginPath(); ctx.ellipse(cx + headR * 0.5, baseY + headR * 0.1, headR * 0.8, headR * 1.1, 0.2, 0, TAU); ctx.fill();
    ctx.globalAlpha = 1;
  }
  if (portraitId === 'kael') {
    ctx.fillStyle = '#5a5a6a';
    ctx.beginPath();
    ctx.arc(cx, baseY - headR * 0.18, headR * 0.94, Math.PI, TAU);
    ctx.lineTo(cx + headR * 0.94, baseY + headR * 0.14);
    ctx.lineTo(cx + headR * 0.4, baseY + headR * 0.14);
    ctx.lineTo(cx + headR * 0.34, baseY + headR * 0.72);
    ctx.lineTo(cx - headR * 0.34, baseY + headR * 0.72);
    ctx.lineTo(cx - headR * 0.4, baseY + headR * 0.14);
    ctx.lineTo(cx - headR * 0.94, baseY + headR * 0.14);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.3)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(cx, baseY - headR); ctx.lineTo(cx, baseY + headR * 0.7); ctx.stroke();
  }
  if (portraitId === 'maren') {
    ctx.strokeStyle = 'rgba(217,180,106,0.55)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(cx, baseY + headR * 0.1, headR * 1.15, 0.4, Math.PI - 0.4); ctx.stroke();
    star(ctx, cx, baseY + headR * 1.25, headR * 0.12, '#ffe7a8', 4, 0);
  }
  if (portraitId === 'vela') {
    glowCircle(ctx, cx, baseY, headR * 1.3, '#c7a4ff', 0.14);
    star(ctx, cx + headR * 0.9, baseY - headR * 0.6, headR * 0.1, '#c7a4ff', 4, time);
  }
  // Marco.
  const frame = ctx.createLinearGradient(0, 0, w, h);
  frame.addColorStop(0, rgba(p.accent, 0.6));
  frame.addColorStop(0.5, 'rgba(255,231,168,0.1)');
  frame.addColorStop(1, rgba(p.accent, 0.35));
  ctx.strokeStyle = frame;
  ctx.lineWidth = 2;
  ctx.strokeRect(1, 1, w - 2, h - 2);
  ctx.strokeStyle = 'rgba(0,0,0,0.6)';
  ctx.lineWidth = 6;
  ctx.strokeRect(-3, -3, w + 6, h + 6);
}
