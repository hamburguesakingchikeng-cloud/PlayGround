import { clamp, randRange, TAU } from './utils.js';

const MAX_PARTICLES = 700;

export class Particles {
  constructor() {
    this.items = [];
    this.numbers = [];
    this.rings = [];
  }

  clear() { this.items.length = 0; this.numbers.length = 0; this.rings.length = 0; }

  spawn(type, x, y, opts = {}) {
    if (this.items.length >= MAX_PARTICLES) this.items.shift();
    const a = opts.angle ?? Math.random() * TAU;
    const speed = opts.speed ?? 60;
    const life = opts.life ?? randRange(Math.random, 0.4, 0.9);
    this.items.push({
      type, x, y,
      vx: Math.cos(a) * speed + (opts.vx || 0),
      vy: Math.sin(a) * speed + (opts.vy || 0),
      gravity: opts.gravity ?? 0,
      drag: opts.drag ?? 2.4,
      size: opts.size ?? randRange(Math.random, 1.5, 3.5),
      life, maxLife: life,
      color: opts.color || '#ffd98a',
      glow: opts.glow ?? true,
      spin: opts.spin ?? 0,
      rot: Math.random() * TAU,
      additive: opts.additive ?? true,
    });
  }

  burst(x, y, count, opts = {}) {
    for (let i = 0; i < count; i++) {
      this.spawn(opts.type || 'spark', x, y, {
        ...opts,
        angle: opts.angle !== undefined ? opts.angle + randRange(Math.random, -0.7, 0.7) : Math.random() * TAU,
        speed: (opts.speed ?? 90) * randRange(Math.random, 0.45, 1.25),
        size: (opts.size ?? 2.5) * randRange(Math.random, 0.6, 1.4),
        life: (opts.life ?? 0.7) * randRange(Math.random, 0.7, 1.3),
      });
    }
  }

  slash(x, y, angle, opts = {}) {
    this.rings.push({ kind: 'slash', x, y, angle, radius: opts.radius || 48, life: 0.22, maxLife: 0.22, color: opts.color || '#ffe6a8', width: opts.width || 8, arc: opts.arc || 1.5 });
  }
  ring(x, y, opts = {}) {
    this.rings.push({ kind: 'ring', x, y, radius: opts.radius || 30, target: opts.target || 90, life: opts.life || 0.4, maxLife: opts.life || 0.4, color: opts.color || '#ffd98a', width: opts.width || 3 });
  }
  beam(x, y, angle, opts = {}) {
    this.rings.push({ kind: 'beam', x, y, angle, radius: opts.radius || 180, life: opts.life || 0.18, maxLife: opts.life || 0.18, color: opts.color || '#fff2c4', width: opts.width || 10 });
  }
  number(x, y, text, color = '#ffe6a8', size = 16, crit = false) {
    this.numbers.push({ x, y, text, color, size, crit, life: 0.9, maxLife: 0.9, vy: -46, vx: randRange(Math.random, -16, 16) });
  }

  update(dt) {
    for (let i = this.items.length - 1; i >= 0; i--) {
      const p = this.items[i];
      p.life -= dt;
      if (p.life <= 0) { this.items.splice(i, 1); continue; }
      p.vy += p.gravity * dt;
      p.vx *= Math.exp(-p.drag * dt);
      p.vy *= Math.exp(-p.drag * dt);
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.rot += p.spin * dt;
    }
    for (let i = this.numbers.length - 1; i >= 0; i--) {
      const n = this.numbers[i];
      n.life -= dt;
      if (n.life <= 0) { this.numbers.splice(i, 1); continue; }
      n.y += n.vy * dt;
      n.x += n.vx * dt;
      n.vy += 40 * dt;
    }
    for (let i = this.rings.length - 1; i >= 0; i--) {
      const r = this.rings[i];
      r.life -= dt;
      if (r.life <= 0) this.rings.splice(i, 1);
    }
  }

  draw(ctx) {
    ctx.save();
    for (const p of this.items) {
      const t = clamp(p.life / p.maxLife, 0, 1);
      const alpha = p.type === 'smoke' ? t * 0.45 : t;
      ctx.globalCompositeOperation = p.additive ? 'lighter' : 'source-over';
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color;
      if (p.type === 'leaf') {
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot);
        ctx.beginPath(); ctx.ellipse(0, 0, p.size * 1.6, p.size * 0.7, 0, 0, TAU); ctx.fill();
        ctx.restore();
      } else if (p.type === 'smoke') {
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size * (2.5 - t), 0, TAU); ctx.fill();
      } else if (p.type === 'star') {
        const s = p.size * (0.7 + t);
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot);
        ctx.beginPath();
        for (let i = 0; i < 4; i++) {
          const a = i * Math.PI / 2;
          ctx.lineTo(Math.cos(a) * s, Math.sin(a) * s);
          ctx.lineTo(Math.cos(a + Math.PI / 4) * s * 0.32, Math.sin(a + Math.PI / 4) * s * 0.32);
        }
        ctx.closePath(); ctx.fill(); ctx.restore();
      } else {
        ctx.beginPath(); ctx.arc(p.x, p.y, Math.max(0.4, p.size * (0.5 + t * 0.6)), 0, TAU); ctx.fill();
      }
    }
    ctx.globalCompositeOperation = 'lighter';
    for (const r of this.rings) {
      const t = clamp(r.life / r.maxLife, 0, 1);
      ctx.globalAlpha = t;
      if (r.kind === 'slash') {
        ctx.strokeStyle = r.color;
        ctx.lineWidth = r.width * t;
        ctx.lineCap = 'round';
        ctx.beginPath();
        const start = r.angle - r.arc / 2;
        ctx.arc(r.x, r.y, r.radius * (1.25 - t * 0.25), start, start + r.arc);
        ctx.stroke();
        ctx.globalAlpha = t * 0.5;
        ctx.lineWidth = r.width * 2.4 * t;
        ctx.stroke();
      } else if (r.kind === 'beam') {
        ctx.strokeStyle = r.color;
        ctx.lineWidth = r.width * t;
        ctx.beginPath();
        ctx.moveTo(r.x, r.y);
        ctx.lineTo(r.x + Math.cos(r.angle) * r.radius, r.y + Math.sin(r.angle) * r.radius);
        ctx.stroke();
      } else {
        const radius = r.radius + (r.target - r.radius) * (1 - t);
        ctx.strokeStyle = r.color;
        ctx.lineWidth = r.width * t;
        ctx.beginPath(); ctx.arc(r.x, r.y, radius, 0, TAU); ctx.stroke();
      }
    }
    ctx.restore();
    // Números de daño.
    ctx.save();
    for (const n of this.numbers) {
      const t = clamp(n.life / n.maxLife, 0, 1);
      ctx.globalAlpha = Math.min(1, t * 2);
      ctx.font = `${n.crit ? 700 : 600} ${n.size * (n.crit ? 1.25 : 1)}px Cinzel, Georgia, serif`;
      ctx.textAlign = 'center';
      ctx.lineWidth = 3;
      ctx.strokeStyle = 'rgba(10,8,18,0.85)';
      ctx.strokeText(n.text, n.x, n.y);
      ctx.fillStyle = n.color;
      ctx.fillText(n.text, n.x, n.y);
    }
    ctx.restore();
  }
}
