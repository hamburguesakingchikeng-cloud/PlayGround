import { dist, TAU } from '../core/utils.js';

export class Projectile {
  constructor(opts) {
    Object.assign(this, {
      x: 0, y: 0, vx: 0, vy: 0, radius: 8, damage: 10, color: '#ffe7a8',
      owner: 'player', life: 1.2, maxLife: 1.2, pierce: false, homing: 0,
      target: null, onHit: null, element: null, dead: false, trail: true,
      trailColor: null, glow: true, knockback: 0, hitSet: new Set(),
    }, opts);
    this.maxLife = this.life;
  }

  update(dt, game) {
    if (this.dead) return;
    this.life -= dt;
    if (this.life <= 0) { this.dead = true; return; }
    if (this.homing && this.target && !this.target.dead) {
      const a = Math.atan2(this.target.y - this.y, this.target.x - this.x);
      const speed = Math.hypot(this.vx, this.vy);
      this.vx += Math.cos(a) * speed * this.homing * dt;
      this.vy += Math.sin(a) * speed * this.homing * dt;
      const s = Math.hypot(this.vx, this.vy);
      if (s > 0) { this.vx = this.vx / s * speed; this.vy = this.vy / s * speed; }
    }
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    if (this.trail) {
      game.particles.spawn('spark', this.x, this.y, {
        color: this.trailColor || this.color, size: 1.8 + Math.random() * 1.4,
        life: 0.22, speed: 8, additive: true, drag: 4,
      });
    }
    if (game.world.isSolidPx(this.x, this.y)) {
      this.dead = true;
      game.particles.burst(this.x, this.y, 6, { color: this.color, speed: 70, life: 0.35, size: 2 });
      return;
    }
    if (this.owner === 'player') {
      for (const e of game.enemies) {
        if (e.dead || e.captured || this.hitSet.has(e)) continue;
        if (dist(this.x, this.y, e.x, e.y) < this.radius + e.radius) {
          this.hitSet.add(e);
          const res = e.takeDamage(this.damage, { source: 'player', element: this.element, game });
          if (res) {
            this.onHit?.(e);
            game.particles.burst(this.x, this.y, 12, { color: this.color, speed: 120, life: 0.4, size: 2.5 });
            game.audio.sfx('hit');
            game.camera.addShake(3);
          }
          if (!this.pierce) { this.dead = true; return; }
        }
      }
    } else {
      const p = game.player;
      if (!p.dead && dist(this.x, this.y, p.x, p.y) < this.radius + p.radius) {
        p.takeDamage(this.damage, { source: 'enemy', element: this.element, game });
        game.particles.burst(this.x, this.y, 10, { color: this.color, speed: 90, life: 0.4, size: 2.2 });
        this.dead = true;
        return;
      }
    }
  }

  draw(ctx) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = this.color;
    ctx.globalAlpha = 0.25;
    ctx.beginPath(); ctx.arc(this.x, this.y, this.radius * 2.4, 0, TAU); ctx.fill();
    ctx.globalAlpha = 1;
    ctx.beginPath(); ctx.arc(this.x, this.y, this.radius, 0, TAU); ctx.fill();
    ctx.fillStyle = '#fffbe8';
    ctx.beginPath(); ctx.arc(this.x, this.y, this.radius * 0.45, 0, TAU); ctx.fill();
    ctx.restore();
  }
}

export class Zone {
  constructor(opts) {
    Object.assign(this, {
      x: 0, y: 0, radius: 60, life: 2, maxLife: 2, damage: 0, tick: 0.5,
      color: '#ff9a5c', type: 'fire', owner: 'enemy', dead: false, warned: false,
      warnTime: 0.6, status: null, tickTimer: 0, hitOnce: false,
    }, opts);
    this.maxLife = this.life;
  }

  update(dt, game) {
    if (this.dead) return;
    this.life -= dt;
    this.tickTimer -= dt;
    if (this.life <= 0) { this.dead = true; return; }
    if (this.life > this.maxLife - this.warnTime) return; // telegraph
    if (this.owner === 'enemy') {
      const p = game.player;
      if (!p.dead && dist(this.x, this.y, p.x, p.y) < this.radius + p.radius && this.tickTimer <= 0) {
        this.tickTimer = this.tick;
        p.takeDamage(this.damage, { source: 'enemy', element: this.type, game });
        if (this.status) p.status[this.status] = 2;
      }
    }
    if (Math.random() < 0.3) {
      game.particles.spawn('ember', this.x + (Math.random() - 0.5) * this.radius * 1.6, this.y + (Math.random() - 0.5) * this.radius * 0.8, {
        color: this.color, size: 2, life: 0.6, speed: 20, gravity: -10, additive: true,
      });
    }
  }

  draw(ctx) {
    const t = this.life / this.maxLife;
    const warning = this.life > this.maxLife - this.warnTime;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    if (warning) {
      ctx.globalAlpha = 0.35 + Math.sin(this.life * 24) * 0.2;
      ctx.strokeStyle = this.color;
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 5]);
      ctx.beginPath(); ctx.ellipse(this.x, this.y, this.radius, this.radius * 0.55, 0, 0, TAU); ctx.stroke();
      ctx.setLineDash([]);
    } else {
      ctx.globalAlpha = 0.22 * Math.min(1, t * 3);
      ctx.fillStyle = this.color;
      ctx.beginPath(); ctx.ellipse(this.x, this.y, this.radius, this.radius * 0.55, 0, 0, TAU); ctx.fill();
      ctx.globalAlpha = 0.7;
      ctx.strokeStyle = this.color;
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.ellipse(this.x, this.y, this.radius, this.radius * 0.55, 0, 0, TAU); ctx.stroke();
    }
    ctx.restore();
  }
}
