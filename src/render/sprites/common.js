import { TAU, rgba } from '../../core/utils.js';

export function shadow(ctx, x, y, rx, ry, alpha = 0.32) {
  ctx.save();
  ctx.fillStyle = `rgba(6,5,12,${alpha})`;
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, TAU);
  ctx.fill();
  ctx.restore();
}

export function glowCircle(ctx, x, y, r, color, alpha = 0.25) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, rgba(color, alpha));
  g.addColorStop(0.55, rgba(color, alpha * 0.4));
  g.addColorStop(1, rgba(color, 0));
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
  ctx.restore();
}

export function line(ctx, x1, y1, x2, y2, color, width = 2, cap = 'round') {
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = cap;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

export function star(ctx, x, y, r, color, points = 4, rot = 0) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.fillStyle = color;
  ctx.beginPath();
  for (let i = 0; i < points * 2; i++) {
    const a = (i / (points * 2)) * TAU - Math.PI / 2;
    const rr = i % 2 === 0 ? r : r * 0.34;
    ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

export function roundRect(ctx, x, y, w, h, r) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

export function eye(ctx, x, y, r, color, pupil = '#14101a') {
  ctx.fillStyle = '#f6efe0';
  ctx.beginPath(); ctx.ellipse(x, y, r, r * 1.1, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = color;
  ctx.beginPath(); ctx.arc(x, y, r * 0.62, 0, TAU); ctx.fill();
  ctx.fillStyle = pupil;
  ctx.beginPath(); ctx.arc(x, y, r * 0.3, 0, TAU); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.8)';
  ctx.beginPath(); ctx.arc(x - r * 0.22, y - r * 0.24, r * 0.18, 0, TAU); ctx.fill();
}

export function flame(ctx, x, y, scale, time, color = '#ff9a5c', core = '#fff3c4') {
  const flick = Math.sin(time * 12 + x * 0.3) * 0.16 + 1;
  const g = ctx.createRadialGradient(x, y - 8 * scale, 0, x, y - 4 * scale, 20 * scale * flick);
  g.addColorStop(0, core);
  g.addColorStop(0.4, color);
  g.addColorStop(1, 'rgba(255,90,40,0)');
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(x, y - 26 * scale * flick);
  ctx.quadraticCurveTo(x + 11 * scale, y - 8 * scale, x + 7 * scale, y + 2 * scale);
  ctx.quadraticCurveTo(x, y + 7 * scale, x - 7 * scale, y + 2 * scale);
  ctx.quadraticCurveTo(x - 11 * scale, y - 8 * scale, x, y - 26 * scale * flick);
  ctx.fill();
  ctx.restore();
}

export function crystalShape(ctx, x, y, h, w, color, glow = true) {
  const g = ctx.createLinearGradient(x, y - h, x, y);
  g.addColorStop(0, '#ffffff');
  g.addColorStop(0.35, color);
  g.addColorStop(1, 'rgba(20,20,40,0.65)');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(x, y - h);
  ctx.lineTo(x + w, y - h * 0.42);
  ctx.lineTo(x + w * 0.45, y);
  ctx.lineTo(x - w * 0.45, y);
  ctx.lineTo(x - w, y - h * 0.42);
  ctx.closePath();
  ctx.fill();
  if (glow) {
    ctx.strokeStyle = 'rgba(255,255,255,0.5)';
    ctx.lineWidth = 1;
    ctx.stroke();
  }
}

export function humanHair(ctx, style, color, headY, radius, facing, time) {
  ctx.save();
  ctx.fillStyle = color;
  const sway = Math.sin(time * 2 + headY) * 1.2;
  switch (style) {
    case 1: // melena larga
      ctx.beginPath();
      ctx.ellipse(0, headY - 1, radius * 1.18, radius * 1.2, 0, Math.PI * 0.92, Math.PI * 2.08);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(-radius * 1.05, headY);
      ctx.quadraticCurveTo(-radius * 1.35 + sway, headY + radius * 1.9, -radius * 0.7, headY + radius * 2.5);
      ctx.lineTo(-radius * 0.35, headY + radius * 0.7);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(radius * 1.05, headY);
      ctx.quadraticCurveTo(radius * 1.35 + sway, headY + radius * 1.9, radius * 0.7, headY + radius * 2.5);
      ctx.lineTo(radius * 0.35, headY + radius * 0.7);
      ctx.fill();
      break;
    case 2: // trenza
      ctx.beginPath();
      ctx.ellipse(0, headY - 1, radius * 1.14, radius * 1.14, 0, Math.PI, TAU);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(radius * 0.72, headY + radius * 0.55);
      ctx.quadraticCurveTo(radius * 1.2, headY + radius * 2, radius * 0.35 + sway, headY + radius * 2.7);
      ctx.lineTo(radius * 0.05, headY + radius * 2.5);
      ctx.quadraticCurveTo(radius * 0.55, headY + radius * 1.4, radius * 0.3, headY + radius * 0.5);
      ctx.fill();
      break;
    case 3: // coleta
      ctx.beginPath();
      ctx.ellipse(0, headY - 1, radius * 1.14, radius * 1.1, 0, Math.PI * 0.95, Math.PI * 2.05);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(radius * 0.5, headY - radius * 0.3);
      ctx.quadraticCurveTo(radius * 1.7 + sway, headY + radius * 0.6, radius * 1.2, headY + radius * 1.7);
      ctx.quadraticCurveTo(radius * 0.8, headY + radius * 0.7, radius * 0.4, headY + radius * 0.2);
      ctx.fill();
      break;
    case 4: // revuelto
      ctx.beginPath();
      for (let i = 0; i < 7; i++) {
        const a = Math.PI + (i / 6) * Math.PI;
        const rr = radius * (1.1 + (i % 2 ? 0.24 : 0));
        ctx.lineTo(Math.cos(a) * rr, headY + Math.sin(a) * rr * 0.9);
      }
      ctx.closePath();
      ctx.fill();
      break;
    default: // corto
      ctx.beginPath();
      ctx.ellipse(0, headY - radius * 0.1, radius * 1.1, radius * 0.92, 0, Math.PI * 0.92, Math.PI * 2.08);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(-radius * 0.9, headY - radius * 0.1);
      ctx.quadraticCurveTo(-radius * 0.4, headY - radius * 0.9, radius * 0.1, headY - radius * 0.85);
      ctx.quadraticCurveTo(radius * 0.8, headY - radius * 0.6, radius * 1.0, headY - radius * 0.05);
      ctx.fill();
      break;
  }
  ctx.restore();
}
