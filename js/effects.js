// Sistema de partículas y efectos visuales en coordenadas de mundo.
import { TAU, clamp } from './utils.js';

const rnd = (a = 0, b = 1) => a + Math.random() * (b - a);
const pick = arr => arr[(Math.random() * arr.length) | 0];

export class Effects {
  constructor(game) {
    this.game = game;
    this.particles = [];
    this.texts = [];
    this.slashes = [];
    this.rings = [];
    this.beams = [];
    this.lights = [];
    this.afterimages = [];
    this.maxParticles = 900;
  }

  update(dt) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= dt;
      if (p.life <= 0) { this.particles.splice(i, 1); continue; }
      p.vx *= Math.pow(p.drag ?? 0.98, dt * 60);
      p.vy *= Math.pow(p.drag ?? 0.98, dt * 60);
      p.vy += (p.gravity || 0) * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      if (p.wobble) p.x += Math.sin((p.maxLife - p.life) * p.wobble * 8) * p.wobble * 10 * dt;
      p.rotation = (p.rotation || 0) + (p.spin || 0) * dt;
    }
    for (let i = this.texts.length - 1; i >= 0; i--) {
      const t = this.texts[i];
      t.life -= dt;
      t.y -= t.rise * dt;
      t.x += (t.drift || 0) * dt;
      if (t.life <= 0) this.texts.splice(i, 1);
    }
    for (let i = this.slashes.length - 1; i >= 0; i--) {
      this.slashes[i].life -= dt;
      if (this.slashes[i].life <= 0) this.slashes.splice(i, 1);
    }
    for (let i = this.rings.length - 1; i >= 0; i--) {
      const r = this.rings[i]; r.life -= dt;
      if (r.life <= 0) this.rings.splice(i, 1);
    }
    for (let i = this.beams.length - 1; i >= 0; i--) {
      const b = this.beams[i]; b.life -= dt;
      if (b.life <= 0) this.beams.splice(i, 1);
    }
    for (let i = this.lights.length - 1; i >= 0; i--) {
      const l = this.lights[i]; l.life -= dt;
      if (l.life <= 0) this.lights.splice(i, 1);
    }
    for (let i = this.afterimages.length - 1; i >= 0; i--) {
      const a = this.afterimages[i]; a.life -= dt;
      if (a.life <= 0) this.afterimages.splice(i, 1);
    }
  }

  add(p) {
    if (this.particles.length >= this.maxParticles) this.particles.shift();
    this.particles.push({
      x: 0, y: 0, vx: 0, vy: 0, life: 0.6, maxLife: 0.6, size: 3, color: '#fff',
      gravity: 0, drag: 0.97, glow: false, shape: 'circle', rotation: 0, spin: 0, fade: 1,
      ...p
    });
  }

  burst(x, y, color, count = 12, opts = {}) {
    for (let i = 0; i < count; i++) {
      const a = opts.angle ?? rnd(0, TAU);
      const spread = opts.spread ?? TAU;
      const ang = a + rnd(-spread / 2, spread / 2);
      const speed = rnd(opts.minSpeed ?? 35, opts.maxSpeed ?? 160);
      this.add({
        x, y, vx: Math.cos(ang) * speed, vy: Math.sin(ang) * speed - (opts.lift || 0),
        life: rnd(opts.minLife ?? 0.25, opts.maxLife ?? 0.7), maxLife: 0.7,
        size: rnd(opts.minSize ?? 1.6, opts.maxSize ?? 4.4), color: Array.isArray(color) ? pick(color) : color,
        gravity: opts.gravity ?? 40, drag: opts.drag ?? 0.96, glow: opts.glow ?? true,
        shape: opts.shape || 'circle', spin: rnd(-5, 5)
      });
    }
  }

  spark(x, y, color = '#ffe2a0', count = 8, dir = null) {
    this.burst(x, y, color, count, {
      angle: dir ?? rnd(0, TAU), spread: dir === null ? TAU : 1.5,
      minSpeed: 60, maxSpeed: 240, minLife: 0.12, maxLife: 0.4,
      minSize: 1.5, maxSize: 3.2, gravity: 0, drag: 0.9
    });
  }

  dust(x, y, color = '#c9b899', count = 6) {
    this.burst(x, y, color, count, {
      minSpeed: 10, maxSpeed: 60, minLife: 0.3, maxLife: 0.8, minSize: 3, maxSize: 7,
      gravity: -8, drag: 0.94, glow: false, shape: 'smoke'
    });
  }

  ember(x, y, count = 5) {
    this.burst(x, y, ['#ffb35e', '#ff7c42', '#ffe6a0'], count, {
      minSpeed: 10, maxSpeed: 70, minLife: 0.5, maxLife: 1.4, minSize: 1.2, maxSize: 2.8,
      gravity: -45, drag: 0.985, glow: true
    });
  }

  leaf(x, y, count = 3) {
    this.burst(x, y, ['#8dcb7a', '#c8b45c', '#5f9b67'], count, {
      minSpeed: 8, maxSpeed: 40, minLife: 1.2, maxLife: 2.4, minSize: 2.5, maxSize: 4.5,
      gravity: 16, drag: 0.99, glow: false, shape: 'leaf'
    });
  }

  heal(x, y, count = 18) {
    for (let i = 0; i < count; i++) {
      this.add({
        x: x + rnd(-26, 26), y: y + rnd(-28, 20), vx: rnd(-8, 8), vy: rnd(-55, -20),
        life: rnd(0.6, 1.4), maxLife: 1.4, size: rnd(1.5, 3.5),
        color: pick(['#b9f5ff', '#e9fffb', '#8de6c9']), gravity: -8, drag: 0.985,
        glow: true, shape: 'star', wobble: 0.5
      });
    }
  }

  text(x, y, text, color = '#fff', opts = {}) {
    this.texts.push({
      x, y, text: String(text), color, life: opts.life ?? 0.9, maxLife: opts.life ?? 0.9,
      rise: opts.rise ?? 44, drift: opts.drift ?? rnd(-8, 8), size: opts.size ?? 16,
      bold: opts.bold ?? false, outline: opts.outline ?? true, shadow: opts.shadow ?? true,
      alpha: opts.alpha ?? 1
    });
  }

  damage(x, y, amount, crit = false, element = 'physical') {
    const colors = { physical: '#fff6e6', fire: '#ffab6b', light: '#ffe6a0', moon: '#b9e6ff', shadow: '#d3a8ff', leaf: '#a9f0b0', stone: '#e6c88d' };
    this.text(x + rnd(-8, 8), y - 30, Math.round(amount), crit ? '#ffd56b' : (colors[element] || '#fff'), {
      size: crit ? 23 : 17, bold: crit, life: crit ? 1.1 : 0.85, rise: crit ? 62 : 48
    });
    if (crit) this.spark(x, y - 20, '#ffe08b', 9);
  }

  healText(x, y, amount) {
    this.text(x, y - 32, `+${Math.round(amount)}`, '#8df0b2', { size: 17, bold: true, life: 1.1 });
  }

  manaText(x, y, amount) {
    this.text(x, y - 32, `+${Math.round(amount)}`, '#8fd6ff', { size: 15, life: 1 });
  }

  slash(x, y, angle, radius, color = '#ffe6a0', arc = 1.4, width = 10, life = 0.2) {
    this.slashes.push({ x, y, angle, radius, color, arc, width, life, maxLife: life, follow: null });
  }

  ring(x, y, radius, color = '#ffe6a0', width = 4, life = 0.5, startRadius = 8) {
    this.rings.push({ x, y, radius, startRadius, color, width, life, maxLife: life });
  }

  beam(x1, y1, x2, y2, color = '#ffe6a0', width = 8, life = 0.35) {
    this.beams.push({ x1, y1, x2, y2, color, width, life, maxLife: life });
  }

  light(x, y, radius, color = '#ffe0a0', life = 0.5, intensity = 0.7) {
    this.lights.push({ x, y, radius, color, life, maxLife: life, intensity });
  }

  afterimage(draw, x, y, life = 0.25, color = 'rgba(160,220,255,.4)') {
    this.afterimages.push({ draw, x, y, life, maxLife: life, color });
  }

  drawWorld(ctx, layer = 'all') {
    ctx.save();
    for (const a of this.afterimages) {
      if (layer !== 'all' && layer !== 'under') continue;
      ctx.globalAlpha = (a.life / a.maxLife) * 0.45;
      a.draw(ctx, a.x, a.y);
    }
    ctx.restore();

    if (layer === 'under' || layer === 'all') {
      for (const r of this.rings) {
        const t = 1 - r.life / r.maxLife;
        const rad = r.startRadius + (r.radius - r.startRadius) * (1 - Math.pow(1 - t, 2));
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.globalAlpha = Math.max(0, 1 - t) * 0.8;
        ctx.strokeStyle = r.color;
        ctx.lineWidth = r.width * (1 - t) + 0.5;
        ctx.beginPath();
        ctx.ellipse(r.x, r.y, rad, rad * 0.62, 0, 0, TAU);
        ctx.stroke();
        ctx.globalAlpha *= 0.35;
        ctx.fillStyle = r.color;
        ctx.beginPath();
        ctx.ellipse(r.x, r.y, rad, rad * 0.62, 0, 0, TAU);
        ctx.fill();
        ctx.restore();
      }
    }

    for (const p of this.particles) {
      if (p.layer === 'over' && layer !== 'all') continue;
      if (p.layer !== 'over' && layer === 'over') continue;
      const t = clamp(p.life / p.maxLife, 0, 1);
      ctx.save();
      if (p.glow) ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = Math.min(1, t * p.fade);
      ctx.fillStyle = p.color;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation || 0);
      if (p.shape === 'smoke') {
        ctx.beginPath(); ctx.arc(0, 0, p.size * (1.5 - t * 0.4), 0, TAU); ctx.fill();
      } else if (p.shape === 'star') {
        drawStar(ctx, p.size, 4);
      } else if (p.shape === 'leaf') {
        ctx.beginPath(); ctx.ellipse(0, 0, p.size, p.size * 0.42, 0, 0, TAU); ctx.fill();
      } else if (p.shape === 'square') {
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
      } else {
        ctx.beginPath(); ctx.arc(0, 0, p.size, 0, TAU); ctx.fill();
      }
      ctx.restore();
    }

    for (const b of this.beams) {
      const t = 1 - b.life / b.maxLife;
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = Math.max(0, 1 - t) * 0.9;
      const grad = ctx.createLinearGradient(b.x1, b.y1, b.x2, b.y2);
      grad.addColorStop(0, 'rgba(255,255,255,.2)');
      grad.addColorStop(0.15, b.color);
      grad.addColorStop(1, 'rgba(255,255,255,.1)');
      ctx.strokeStyle = grad;
      ctx.lineWidth = b.width * (1 - t * 0.5);
      ctx.shadowBlur = 22;
      ctx.shadowColor = b.color;
      ctx.beginPath(); ctx.moveTo(b.x1, b.y1); ctx.lineTo(b.x2, b.y2); ctx.stroke();
      ctx.restore();
    }

    for (const s of this.slashes) {
      const t = 1 - s.life / s.maxLife;
      ctx.save();
      ctx.translate(s.x, s.y);
      ctx.rotate(s.angle);
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = Math.sin((1 - t) * Math.PI) * 0.95;
      ctx.strokeStyle = s.color;
      ctx.lineWidth = s.width * (1 - t * 0.7) + 1;
      ctx.lineCap = 'round';
      ctx.shadowBlur = 18;
      ctx.shadowColor = s.color;
      ctx.beginPath();
      ctx.arc(0, 0, s.radius, -s.arc / 2 + t * 0.5, s.arc / 2 + t * 0.5);
      ctx.stroke();
      ctx.globalAlpha *= 0.35;
      ctx.lineWidth *= 2.4;
      ctx.stroke();
      ctx.restore();
    }

    for (const t of this.texts) {
      const a = clamp(t.life / t.maxLife * 1.8, 0, 1);
      ctx.save();
      ctx.globalAlpha = a;
      ctx.font = `${t.bold ? '800' : '700'} ${t.size}px Lato, "DejaVu Sans", sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      if (t.outline) {
        ctx.lineWidth = t.bold ? 4 : 3;
        ctx.strokeStyle = 'rgba(12,10,20,.85)';
        ctx.strokeText(t.text, t.x, t.y);
      }
      if (t.shadow) {
        ctx.shadowBlur = t.bold ? 12 : 6;
        ctx.shadowColor = t.color;
      }
      ctx.fillStyle = t.color;
      ctx.fillText(t.text, t.x, t.y);
      ctx.restore();
    }
  }
}

function drawStar(ctx, radius, points = 4) {
  ctx.beginPath();
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? radius : radius * 0.38;
    const a = (i / (points * 2)) * TAU - Math.PI / 2;
    const x = Math.cos(a) * r, y = Math.sin(a) * r;
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();
}
