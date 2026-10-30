// ============================================================
// Efectos, partículas, proyectiles, clima e iluminación
// ============================================================
import { AFFINITIES } from './data.js';
import { rgba, shade } from './art.js';
const TAU = Math.PI * 2;
function hash(n) { const x = Math.sin(n * 127.1) * 43758.5453; return x - Math.floor(x); }

export function drawProjectile(ctx, p, t) {
  ctx.save();
  ctx.translate(p.x, p.y);
  const ang = Math.atan2(p.vy, p.vx);
  if (p.type === 'arrow') {
    ctx.rotate(ang);
    ctx.strokeStyle = '#d9e9ff'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(-13, 0); ctx.lineTo(9, 0); ctx.stroke();
    ctx.fillStyle = '#f3d38d'; ctx.beginPath(); ctx.moveTo(14, 0); ctx.lineTo(7, -4); ctx.lineTo(7, 4); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(190,220,255,.5)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(-12, -3); ctx.lineTo(-17, 0); ctx.lineTo(-12, 3); ctx.stroke();
    ctx.restore(); return;
  }
  if (p.type === 'wave') {
    ctx.strokeStyle = rgba(p.color || '#8fe3ff', .8);
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(0, 0, p.radius || 14, .2, Math.PI - .2); ctx.stroke();
    ctx.globalAlpha = .5;
    ctx.beginPath(); ctx.arc(0, 0, (p.radius || 14) - 5, .3, Math.PI - .3); ctx.stroke();
    ctx.restore(); return;
  }
  const color = p.color || (p.type === 'ice' ? '#b9e8ff' : p.type === 'star' ? '#f4d998' : p.type === 'orb' ? '#b899ff' : '#ff8a5c');
  ctx.globalCompositeOperation = 'lighter';
  const g = ctx.createRadialGradient(0, 0, 1, 0, 0, (p.radius || 10) * 2.6);
  g.addColorStop(0, rgba(color, .75)); g.addColorStop(.4, rgba(color, .25)); g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g; ctx.fillRect(-40, -40, 80, 80);
  ctx.fillStyle = '#fff8e8'; ctx.beginPath(); ctx.arc(0, 0, (p.radius || 7) * .55, 0, TAU); ctx.fill();
  ctx.fillStyle = rgba(color, .9); ctx.beginPath(); ctx.arc(0, 0, (p.radius || 7), 0, TAU); ctx.fill();
  if (p.type === 'star') {
    ctx.strokeStyle = rgba(color, .7); ctx.lineWidth = 1;
    ctx.rotate(t * 4);
    for (let i = 0; i < 4; i++) { ctx.rotate(TAU / 4); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -20); ctx.stroke(); }
  }
  ctx.restore();
}

export function drawParticle(ctx, p) {
  const a = Math.max(0, p.life / p.max);
  ctx.save(); ctx.globalAlpha = a;
  if (p.type === 'spark') {
    ctx.strokeStyle = p.color; ctx.lineWidth = p.size || 1.6;
    ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x - p.vx * .03, p.y - p.vy * .03); ctx.stroke();
  } else if (p.type === 'star') {
    ctx.fillStyle = p.color;
    const s = p.size || 2.5;
    ctx.beginPath(); ctx.moveTo(p.x, p.y - s * 2); ctx.lineTo(p.x + s * .6, p.y - s * .6); ctx.lineTo(p.x + s * 2, p.y); ctx.lineTo(p.x + s * .6, p.y + s * .6); ctx.lineTo(p.x, p.y + s * 2); ctx.lineTo(p.x - s * .6, p.y + s * .6); ctx.lineTo(p.x - s * 2, p.y); ctx.lineTo(p.x - s * .6, p.y - s * .6); ctx.closePath(); ctx.fill();
  } else if (p.type === 'leaf') {
    ctx.fillStyle = p.color; ctx.translate(p.x, p.y); ctx.rotate(p.rot || 0);
    ctx.beginPath(); ctx.ellipse(0, 0, p.size * 1.6, p.size * .7, 0, 0, TAU); ctx.fill();
  } else if (p.type === 'smoke') {
    ctx.fillStyle = p.color; ctx.beginPath(); ctx.arc(p.x, p.y, p.size * (1.8 - a), 0, TAU); ctx.fill();
  } else if (p.type === 'ring') {
    ctx.strokeStyle = p.color; ctx.lineWidth = p.size || 2;
    ctx.beginPath(); ctx.arc(p.x, p.y, (1 - a) * (p.radius || 30), 0, TAU); ctx.stroke();
  } else {
    ctx.fillStyle = p.color; ctx.beginPath(); ctx.arc(p.x, p.y, p.size || 2, 0, TAU); ctx.fill();
  }
  ctx.restore();
}

export function drawEffect(ctx, e, t) {
  const p = 1 - e.life / e.max;
  ctx.save();
  if (e.type === 'slash') {
    const a = Math.max(0, e.life / e.max);
    ctx.translate(e.x, e.y);
    ctx.rotate(e.angle || 0);
    ctx.globalCompositeOperation = 'lighter';
    const r = e.radius || 48;
    const g = ctx.createRadialGradient(0, 0, r * .3, 0, 0, r);
    g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(.7, rgba(e.color || '#dff4ff', .22 * a)); g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, r, -(e.arc || .9) / 2, (e.arc || .9) / 2); ctx.fill();
    ctx.strokeStyle = rgba(e.color || '#eaf7ff', .85 * a); ctx.lineWidth = 2 + a * 2;
    ctx.beginPath(); ctx.arc(0, 0, r * (.55 + p * .38), -(e.arc || .9) / 2, (e.arc || .9) / 2); ctx.stroke();
    ctx.strokeStyle = rgba(e.color || '#eaf7ff', .4 * a); ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(0, 0, r * (.4 + p * .4), -(e.arc || .9) / 2, (e.arc || .9) / 2); ctx.stroke();
  } else if (e.type === 'ring' || e.type === 'shockwave') {
    const a = Math.max(0, e.life / e.max);
    ctx.translate(e.x, e.y);
    if (e.type === 'shockwave') ctx.scale(1, .45);
    ctx.strokeStyle = rgba(e.color || '#ffe6a8', a * .9);
    ctx.lineWidth = e.width || 3;
    ctx.beginPath(); ctx.arc(0, 0, (e.radius || 60) * p, 0, TAU); ctx.stroke();
    ctx.globalAlpha = a * .35;
    ctx.fillStyle = rgba(e.color || '#ffe6a8', .2);
    ctx.beginPath(); ctx.arc(0, 0, (e.radius || 60) * p, 0, TAU); ctx.fill();
  } else if (e.type === 'burst') {
    const a = Math.max(0, e.life / e.max);
    ctx.translate(e.x, e.y);
    ctx.globalCompositeOperation = 'lighter';
    const g = ctx.createRadialGradient(0, 0, 1, 0, 0, (e.radius || 40) * (.5 + p));
    g.addColorStop(0, rgba(e.color || '#ffd27a', .6 * a)); g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g; ctx.fillRect(-(e.radius || 40) * 2, -(e.radius || 40) * 2, (e.radius || 40) * 4, (e.radius || 40) * 4);
    ctx.strokeStyle = rgba(e.color || '#fff0c0', a * .8); ctx.lineWidth = 1.4;
    for (let i = 0; i < 8; i++) {
      const ang = i / 8 * TAU + (e.seed || 0);
      const r0 = (e.radius || 30) * .2, r1 = (e.radius || 30) * (.5 + p);
      ctx.beginPath(); ctx.moveTo(Math.cos(ang) * r0, Math.sin(ang) * r0); ctx.lineTo(Math.cos(ang) * r1, Math.sin(ang) * r1); ctx.stroke();
    }
  } else if (e.type === 'text') {
    const a = Math.max(0, e.life / e.max);
    ctx.translate(e.x, e.y);
    ctx.globalAlpha = Math.min(1, a * 1.6);
    ctx.font = `${e.big ? 'bold 17px' : 'bold 13px'} ${e.serif ? 'Georgia, serif' : 'Segoe UI, sans-serif'}`;
    ctx.textAlign = 'center';
    ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(0,0,0,.7)';
    ctx.strokeText(e.text, 0, 0); ctx.fillStyle = e.color || '#fff3d0'; ctx.fillText(e.text, 0, 0);
    ctx.textAlign = 'left';
  } else if (e.type === 'levelup') {
    const a = Math.max(0, e.life / e.max);
    ctx.translate(e.x, e.y);
    ctx.globalCompositeOperation = 'lighter';
    const g = ctx.createLinearGradient(0, -160, 0, 0);
    g.addColorStop(0, 'rgba(255,225,150,0)'); g.addColorStop(.4, `rgba(255,225,150,${.25 * a})`); g.addColorStop(1, 'rgba(255,225,150,0)');
    ctx.fillStyle = g; ctx.fillRect(-26, -160, 52, 160);
    for (let i = 0; i < 10; i++) {
      const ang = i / 10 * TAU + t;
      ctx.fillStyle = rgba('#ffe6a8', a);
      ctx.beginPath(); ctx.arc(Math.cos(ang) * (30 + p * 30), -60 + Math.sin(ang) * 50, 1.6, 0, TAU); ctx.fill();
    }
  } else if (e.type === 'heal') {
    const a = Math.max(0, e.life / e.max);
    ctx.translate(e.x, e.y);
    ctx.globalCompositeOperation = 'lighter';
    const g = ctx.createRadialGradient(0, -20, 2, 0, -20, 40);
    g.addColorStop(0, `rgba(150,255,190,${.22 * a})`); g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g; ctx.fillRect(-46, -66, 92, 92);
    ctx.strokeStyle = rgba('#a5ffcc', a * .8); ctx.lineWidth = 1;
    for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(0, -20, 12 + i * 9 + p * 15, 0, TAU); ctx.stroke(); }
  } else if (e.type === 'beam') {
    const a = Math.max(0, e.life / e.max);
    ctx.translate(e.x, e.y); ctx.rotate(e.angle || 0);
    ctx.globalCompositeOperation = 'lighter';
    const g = ctx.createLinearGradient(0, 0, e.length || 300, 0);
    g.addColorStop(0, rgba(e.color || '#ffe6a8', .55 * a)); g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g; ctx.fillRect(0, -(e.width || 10) * a, e.length || 300, (e.width || 10) * a * 2);
    ctx.strokeStyle = rgba('#fff8e0', .7 * a); ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(e.length || 300, 0); ctx.stroke();
  } else if (e.type === 'capture') {
    const a = Math.max(0, e.life / e.max);
    ctx.translate(e.x, e.y);
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 4; i++) {
      const ang = t * 3 + i * TAU / 4;
      ctx.strokeStyle = rgba(e.color || '#ffe6a8', a * .7); ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(0, -12, 20 + i * 6, ang, ang + 1.8); ctx.stroke();
    }
    const g = ctx.createRadialGradient(0, -12, 1, 0, -12, 34);
    g.addColorStop(0, rgba(e.color || '#ffe6a8', .22 * a)); g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g; ctx.fillRect(-36, -48, 72, 72);
  }
  ctx.restore();
}

export function drawLoot(ctx, l, t) {
  const bob = Math.sin(t * 2.4 + (l.seed || 0)) * 2.4;
  ctx.save(); ctx.translate(l.x, l.y + bob);
  ctx.globalCompositeOperation = 'lighter';
  const g = ctx.createRadialGradient(0, -7, 1, 0, -7, 20);
  g.addColorStop(0, rgba(l.color || '#ffe6a8', .3)); g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g; ctx.fillRect(-24, -30, 48, 48);
  ctx.globalCompositeOperation = 'source-over';
  ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.beginPath(); ctx.ellipse(0, 1 - bob, 7, 2.6, 0, 0, TAU); ctx.fill();
  if (l.kind === 'coin') {
    ctx.fillStyle = '#f4d77e'; ctx.beginPath(); ctx.ellipse(0, -8, 6, 6, 0, 0, TAU); ctx.fill();
    ctx.strokeStyle = '#a97a36'; ctx.lineWidth = 1; ctx.stroke();
  } else if (l.kind === 'potion') {
    ctx.fillStyle = '#d8eaff'; ctx.fillRect(-2, -17, 4, 5);
    ctx.fillStyle = l.color || '#ff7d9b'; ctx.beginPath(); ctx.arc(0, -8, 6, 0, TAU); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.5)'; ctx.beginPath(); ctx.arc(-2, -10, 1.6, 0, TAU); ctx.fill();
  } else if (l.kind === 'crystal') {
    ctx.fillStyle = l.color || '#9ee7ff'; ctx.beginPath(); ctx.moveTo(0, -18); ctx.lineTo(6, -8); ctx.lineTo(0, -2); ctx.lineTo(-6, -8); ctx.closePath(); ctx.fill();
  } else {
    ctx.fillStyle = l.color || '#ffe6a8'; ctx.beginPath(); ctx.arc(0, -8, 4, 0, TAU); ctx.fill();
  }
  ctx.restore();
}

export function drawWorldLights(ctx, lights, t) {
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  for (const l of lights) {
    const x = l.x * 48, y = l.y * 48;
    const r = (l.r || 2.5) * 48;
    const g = ctx.createRadialGradient(x, y - 12, 2, x, y - 12, r);
    g.addColorStop(0, l.color || 'rgba(255,210,120,.16)'); g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g; ctx.fillRect(x - r, y - r - 20, r * 2, r * 2 + 20);
  }
  ctx.restore();
}

export function drawLighting(ctx, w, h, playerScreen, zone, t, quality = 2, hpRatio = 1) {
  const ambient = zone.ambient;
  let dark = .08, tint = 'rgba(4,8,20,';
  if (ambient === 'crypt') dark = .52;
  else if (ambient === 'peak') dark = .4;
  else if (ambient === 'lake') dark = .25;
  else if (ambient === 'forest') dark = .22;
  else dark = .1;
  if (quality === 0) dark *= .55;
  const px = playerScreen.x, py = playerScreen.y;
  ctx.save();
  const g = ctx.createRadialGradient(px, py, 70, px, py, Math.max(w, h) * .72);
  g.addColorStop(0, 'rgba(0,0,0,0)');
  g.addColorStop(.42, `${tint}${dark * .22})`);
  g.addColorStop(.75, `${tint}${dark * .65})`);
  g.addColorStop(1, `${tint}${dark})`);
  ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
  // resplandor cálido del héroe
  ctx.globalCompositeOperation = 'lighter';
  const p = .5 + .5 * Math.sin(t * 2);
  const p2 = ctx.createRadialGradient(px, py - 20, 4, px, py - 20, 150);
  p2.addColorStop(0, `rgba(255,225,170,${.055 + p * .018})`); p2.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = p2; ctx.fillRect(px - 160, py - 180, 320, 320);
  if (hpRatio < .3) {
    const red = ctx.createRadialGradient(px, py, 40, px, py, Math.max(w, h) * .65);
    red.addColorStop(0, 'rgba(0,0,0,0)'); red.addColorStop(1, `rgba(140,10,30,${.24 * (1 - hpRatio / .3)})`);
    ctx.fillStyle = red; ctx.fillRect(0, 0, w, h);
  }
  ctx.restore();
}

export function drawWeather(ctx, w, h, type, t, quality = 2) {
  if (!type) return;
  const count = quality === 0 ? 28 : quality === 1 ? 55 : 85;
  ctx.save();
  if (type === 'rain') {
    ctx.strokeStyle = 'rgba(160,210,240,.22)'; ctx.lineWidth = 1;
    for (let i = 0; i < count; i++) {
      const x = (hash(i) * w + t * 60 * (0.5 + hash(i + 3))) % w;
      const y = (hash(i + 9) * h + t * 420) % h;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 5, y + 14); ctx.stroke();
    }
  } else if (type === 'ash') {
    for (let i = 0; i < count; i++) {
      const x = (hash(i + 1) * w + Math.sin(t * .5 + i) * 24 + w) % w;
      const y = (hash(i + 5) * h + t * 30) % h;
      ctx.fillStyle = `rgba(230,210,220,${.12 + hash(i) * .22})`;
      ctx.beginPath(); ctx.arc(x, y, .7 + hash(i + 7) * 1.5, 0, TAU); ctx.fill();
    }
  } else if (type === 'fireflies') {
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < count; i++) {
      const x = (hash(i + 2) * w + Math.sin(t * .3 + i * 1.7) * 40 + w) % w;
      const y = (hash(i + 7) * h + Math.cos(t * .24 + i) * 26 + h) % h;
      const a = .2 + .5 * (0.5 + 0.5 * Math.sin(t * 1.6 + i));
      const g = ctx.createRadialGradient(x, y, 0, x, y, 6);
      g.addColorStop(0, `rgba(210,255,150,${a * .55})`); g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g; ctx.fillRect(x - 6, y - 6, 12, 12);
    }
  } else if (type === 'motes') {
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < count; i++) {
      const x = (hash(i + 4) * w + Math.sin(t * .2 + i) * 30 + w) % w;
      const y = (hash(i + 1) * h + t * 9) % h;
      ctx.fillStyle = `rgba(180,150,255,${.15 + hash(i) * .3})`;
      ctx.beginPath(); ctx.arc(x, y, .8 + hash(i + 3) * 1.2, 0, TAU); ctx.fill();
    }
  } else {
    // polen
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < count; i++) {
      const x = (hash(i + 6) * w + Math.sin(t * .15 + i * 2) * 36 + w) % w;
      const y = (hash(i + 2) * h + Math.cos(t * .18 + i) * 20 + h) % h;
      ctx.fillStyle = `rgba(255,235,170,${.1 + hash(i) * .2})`;
      ctx.beginPath(); ctx.arc(x, y, .7 + hash(i + 8) * 1.1, 0, TAU); ctx.fill();
    }
  }
  ctx.restore();
}

export function spawnBurst(arr, x, y, color, n = 10, type = 'spark', speed = 120) {
  for (let i = 0; i < n; i++) {
    const a = Math.random() * TAU, sp = speed * (.35 + Math.random() * .8);
    arr.push({ type, x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: .4 + Math.random() * .5, max: .9, color, size: 1 + Math.random() * 2, rot: Math.random() * TAU });
  }
}
