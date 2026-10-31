import { clamp, rand, rgba, dist, angleTo, easeOut } from '../core/utils.js';

/* ------------------------------------------------------------------ *
 *  Partículas, textos flotantes y efectos de combate
 * ------------------------------------------------------------------ */

class Particle {
  constructor(x, y, o) {
    this.x = x; this.y = y;
    this.vx = o.vx ?? rand(-40, 40);
    this.vy = o.vy ?? rand(-70, -20);
    this.life = o.life ?? rand(.35, .8);
    this.maxLife = this.life;
    this.size = o.size ?? rand(2, 5);
    this.color = o.color ?? '#ffe6a0';
    this.gravity = o.gravity ?? 0;
    this.drag = o.drag ?? 1.5;
    this.glow = o.glow !== false;
    this.shape = o.shape || 'dot';
    this.rot = rand(0, 6.28);
    this.vr = rand(-5, 5);
  }
  update(dt) {
    this.life -= dt;
    this.vx *= Math.exp(-this.drag * dt);
    this.vy = this.vy * Math.exp(-this.drag * dt) + this.gravity * dt;
    this.x += this.vx * dt; this.y += this.vy * dt;
    this.rot += this.vr * dt;
    return this.life > 0;
  }
  draw(ctx, cam) {
    const a = clamp(this.life / this.maxLife);
    const x = this.x - cam.x, y = this.y - cam.y;
    if (x < -40 || y < -40 || x > cam.w + 40 || y > cam.h + 40) return;
    ctx.save();
    if (this.glow) ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = a;
    ctx.fillStyle = this.color;
    if (this.shape === 'spark') {
      ctx.translate(x, y); ctx.rotate(this.rot);
      ctx.fillRect(-this.size * .5, -this.size * 1.8, this.size, this.size * 3.6);
    } else if (this.shape === 'leaf') {
      ctx.translate(x, y); ctx.rotate(this.rot);
      ctx.beginPath(); ctx.ellipse(0, 0, this.size, this.size * .42, 0, 0, 6.3); ctx.fill();
    } else if (this.shape === 'ring') {
      ctx.strokeStyle = this.color; ctx.lineWidth = this.size * .35;
      ctx.beginPath(); ctx.arc(x, y, this.size * 2.5 * (1 - a * .4), 0, 6.3); ctx.stroke();
    } else {
      ctx.beginPath(); ctx.arc(x, y, this.size * a, 0, 6.3); ctx.fill();
    }
    ctx.restore();
  }
}

class Slash {
  constructor(x, y, angle, combo = 1, color = '#fff2c9', scale = 1) {
    this.x = x; this.y = y; this.angle = angle; this.combo = combo;
    this.color = color; this.scale = scale;
    this.life = .28; this.maxLife = .28;
  }
  update(dt) { this.life -= dt; return this.life > 0; }
  draw(ctx, cam) {
    const p = 1 - this.life / this.maxLife;
    const a = 1 - p;
    const x = this.x - cam.x, y = this.y - cam.y;
    const spread = this.combo === 3 ? 1.9 : 1.2;
    const radius = (54 + this.combo * 6) * this.scale;
    ctx.save();
    ctx.translate(x, y); ctx.rotate(this.angle);
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 3; i++) {
      ctx.strokeStyle = rgba(this.color, a * (.75 - i * .2));
      ctx.lineWidth = (this.combo === 3 ? 9 : 6) - i * 1.8;
      ctx.lineCap = 'round';
      const r = radius * (.55 + p * .55) + i * 5;
      ctx.beginPath();
      ctx.arc(0, 0, r, -spread / 2 + p * .25, spread / 2 + p * .25);
      ctx.stroke();
    }
    // filo
    ctx.strokeStyle = rgba('#ffffff', a * .8);
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.arc(0, 0, radius * (.6 + p * .5), -spread / 2 + p * .25, spread / 2 + p * .25);
    ctx.stroke();
    ctx.restore();
  }
}

class Ring {
  constructor(x, y, radius, color, life = .5, opts = {}) {
    this.x = x; this.y = y; this.radius = radius; this.color = color;
    this.life = life; this.maxLife = life; this.fill = !!opts.fill; this.width = opts.width || 3;
  }
  update(dt) { this.life -= dt; return this.life > 0; }
  draw(ctx, cam) {
    const p = 1 - this.life / this.maxLife;
    const x = this.x - cam.x, y = this.y - cam.y;
    const r = this.radius * easeOut(p);
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.strokeStyle = rgba(this.color, (1 - p) * .9);
    ctx.lineWidth = this.width * (1 - p * .5);
    ctx.beginPath(); ctx.arc(x, y, r, 0, 6.3); ctx.stroke();
    if (this.fill) {
      ctx.fillStyle = rgba(this.color, (1 - p) * .12);
      ctx.beginPath(); ctx.arc(x, y, r, 0, 6.3); ctx.fill();
    }
    ctx.restore();
  }
}

class Telegraph {
  constructor(x, y, radius, life, color, angle = null, length = 0, width = 0) {
    this.x = x; this.y = y; this.radius = radius; this.life = life; this.maxLife = life;
    this.color = color; this.angle = angle; this.length = length; this.width = width;
  }
  update(dt) { this.life -= dt; return this.life > 0; }
  draw(ctx, cam) {
    const x = this.x - cam.x, y = this.y - cam.y;
    const p = 1 - this.life / this.maxLife;
    const pulse = .35 + Math.sin(p * Math.PI * 8) * .12;
    ctx.save();
    if (this.angle !== null) {
      ctx.translate(x, y); ctx.rotate(this.angle);
      ctx.fillStyle = rgba(this.color, pulse * .35);
      ctx.fillRect(0, -(this.width || 18) / 2, this.length, this.width || 18);
      ctx.strokeStyle = rgba(this.color, .5 + pulse * .4);
      ctx.lineWidth = 1.5; ctx.strokeRect(0, -(this.width || 18) / 2, this.length, this.width || 18);
      // moving warning chevrons
      const off = (p * this.length) % 60;
      ctx.strokeStyle = rgba('#ffffff', .22);
      for (let i = off; i < this.length; i += 60) {
        ctx.beginPath(); ctx.moveTo(i, -8); ctx.lineTo(i + 12, 0); ctx.lineTo(i, 8); ctx.stroke();
      }
    } else {
      ctx.fillStyle = rgba(this.color, pulse * .22);
      ctx.beginPath(); ctx.arc(x, y, this.radius, 0, 6.3); ctx.fill();
      ctx.strokeStyle = rgba(this.color, .6 + pulse * .35);
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(x, y, this.radius, 0, 6.3); ctx.stroke();
      ctx.strokeStyle = rgba(this.color, .35);
      ctx.beginPath(); ctx.arc(x, y, this.radius * (1 - p * .8), 0, 6.3); ctx.stroke();
    }
    ctx.restore();
  }
}

class GroundSpike {
  constructor(x, y, radius, color, delay, onHit) {
    this.x = x; this.y = y; this.radius = radius; this.color = color;
    this.delay = delay; this.life = .75; this.maxLife = .75; this.onHit = onHit; this.fired = false;
  }
  update(dt, game) {
    if (this.delay > 0) {
      this.delay -= dt;
      if (this.delay <= 0 && !this.fired) {
        this.fired = true;
        game.effects.burst(this.x, this.y, this.color, 18, 150, { gravity: 220, size: 4 });
        game.camera.shake(5, .16);
        game.audio.sfx('hit');
        this.onHit?.();
      }
      return true;
    }
    this.life -= dt;
    return this.life > 0;
  }
  draw(ctx, cam) {
    if (this.delay > 0) {
      const p = 1 - this.delay / .4;
      ctx.save();
      ctx.strokeStyle = rgba(this.color, .35 + p * .3);
      ctx.lineWidth = 1.5;
      const x = this.x - cam.x, y = this.y - cam.y;
      ctx.beginPath(); ctx.ellipse(x, y, this.radius * .8, this.radius * .35, 0, 0, 6.3); ctx.stroke();
      ctx.restore();
      return;
    }
    const a = clamp(this.life / this.maxLife);
    const x = this.x - cam.x, y = this.y - cam.y;
    ctx.save();
    ctx.globalAlpha = a;
    ctx.fillStyle = this.color;
    for (let i = 0; i < 5; i++) {
      const ox = (i - 2) * this.radius * .28;
      const h = this.radius * (1.2 + (i % 2) * .55) * Math.min(1, (1 - a) * 4);
      ctx.beginPath();
      ctx.moveTo(x + ox - 7, y);
      ctx.lineTo(x + ox, y - h);
      ctx.lineTo(x + ox + 7, y);
      ctx.closePath(); ctx.fill();
    }
    ctx.restore();
  }
}

class HazardPool {
  constructor(x, y, radius, life, dps, color) {
    this.x = x; this.y = y; this.radius = radius;
    this.life = life; this.maxLife = life; this.dps = dps; this.color = color;
    this.tick = 0;
  }
  update(dt, game) {
    this.life -= dt;
    this.tick -= dt;
    const p = game.player;
    if (dist(this.x, this.y, p.x, p.y) < this.radius + p.radius && this.tick <= 0) {
      this.tick = .65;
      p.takeDamage(this.dps, game, null);
    }
    if (Math.random() < dt * 12) {
      game.effects.spawn(this.x + rand(-this.radius, this.radius), this.y + rand(-this.radius * .5, this.radius * .5), {
        color: this.color, life: rand(.3, .7), size: rand(2, 5), vy: rand(-40, -10), gravity: -20
      });
    }
    return this.life > 0;
  }
  draw(ctx, cam) {
    const x = this.x - cam.x, y = this.y - cam.y;
    const a = clamp(this.life / this.maxLife);
    const pulse = .8 + Math.sin(this.life * 6) * .12;
    ctx.save();
    const g = ctx.createRadialGradient(x, y, 2, x, y, this.radius * pulse);
    g.addColorStop(0, rgba(this.color, .45 * a));
    g.addColorStop(.65, rgba(this.color, .22 * a));
    g.addColorStop(1, rgba(this.color, 0));
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.ellipse(x, y, this.radius * pulse, this.radius * .58 * pulse, 0, 0, 6.3); ctx.fill();
    ctx.strokeStyle = rgba(this.color, .5 * a);
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.ellipse(x, y, this.radius * .8, this.radius * .46, 0, 0, 6.3); ctx.stroke();
    ctx.restore();
  }
}

class LightBeam {
  constructor(x, y, angle, length, width, color, onHit) {
    this.x = x; this.y = y; this.angle = angle; this.length = length;
    this.width = width; this.color = color; this.onHit = onHit;
    this.life = .75; this.maxLife = .75; this.charge = .28; this.fired = false;
  }
  update(dt, game) {
    this.life -= dt;
    if (this.charge > 0) {
      this.charge -= dt;
      if (this.charge <= 0 && !this.fired) {
        this.fired = true;
        game.camera.shake(8, .25);
        game.audio.sfx('roar');
        const p = game.player;
        const dx = Math.cos(this.angle), dy = Math.sin(this.angle);
        const rx = p.x - this.x, ry = (p.y - 18) - this.y;
        const t = clamp(rx * dx + ry * dy, 0, this.length);
        const px = this.x + dx * t, py = this.y + dy * t;
        if (Math.hypot(p.x - px, (p.y - 18) - py) < this.width * .65 + p.radius) this.onHit?.();
      }
    }
    return this.life > 0;
  }
  draw(ctx, cam) {
    const x = this.x - cam.x, y = this.y - cam.y;
    ctx.save();
    ctx.translate(x, y); ctx.rotate(this.angle);
    if (this.charge > 0) {
      const p = 1 - this.charge / .28;
      ctx.strokeStyle = rgba(this.color, .2 + p * .4);
      ctx.lineWidth = 1.5;
      ctx.setLineDash([8, 10]);
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(this.length, 0); ctx.stroke();
      ctx.globalCompositeOperation = 'lighter';
      ctx.fillStyle = rgba(this.color, .5);
      ctx.beginPath(); ctx.arc(0, 0, 8 + p * 14, 0, 6.3); ctx.fill();
    } else {
      const a = clamp(this.life / (this.maxLife - .28));
      const w = this.width * (.55 + a * .45);
      ctx.globalCompositeOperation = 'lighter';
      const g = ctx.createLinearGradient(0, 0, this.length, 0);
      g.addColorStop(0, rgba(this.color, .85 * a));
      g.addColorStop(.7, rgba(this.color, .3 * a));
      g.addColorStop(1, rgba(this.color, 0));
      ctx.fillStyle = g;
      ctx.fillRect(0, -w / 2, this.length, w);
      ctx.fillStyle = rgba('#ffffff', .8 * a);
      ctx.fillRect(0, -w * .13, this.length, w * .26);
    }
    ctx.restore();
  }
}

class DashTrail {
  constructor(player) {
    this.points = [];
    this.life = .45;
    this.maxLife = .45;
    for (let i = 0; i < 6; i++) this.points.push({ x: player.x, y: player.y, life: .45 - i * .05 });
    this.player = player;
  }
  update(dt) {
    this.life -= dt;
    this.points.push({ x: this.player.x, y: this.player.y, life: .32 });
    if (this.points.length > 10) this.points.shift();
    for (const p of this.points) p.life -= dt;
    return this.life > 0;
  }
  draw(ctx, cam) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (const p of this.points) {
      if (p.life <= 0) continue;
      ctx.fillStyle = rgba('#9fd8ff', p.life * .7);
      ctx.beginPath(); ctx.ellipse(p.x - cam.x, p.y - cam.y - 24, 12 * p.life * 2, 18 * p.life * 2, 0, 0, 6.3); ctx.fill();
    }
    ctx.restore();
  }
}

class BossPhaseFX {
  constructor(x, y, color) {
    this.x = x; this.y = y; this.color = color;
    this.life = 1.4; this.maxLife = 1.4;
  }
  update(dt) { this.life -= dt; return this.life > 0; }
  draw(ctx, cam, time) {
    const p = 1 - this.life / this.maxLife;
    const x = this.x - cam.x, y = this.y - cam.y;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 4; i++) {
      const r = (70 + i * 45) * (0.3 + p * 1.2);
      ctx.strokeStyle = rgba(this.color, (1 - p) * (.5 - i * .08));
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(x, y - 30, r, 0, 6.3); ctx.stroke();
    }
    ctx.restore();
  }
}

export class Effects {
  constructor() {
    this.particles = [];
    this.texts = [];
    this.slashes = [];
    this.rings = [];
    this.telegraphs = [];
    this.spikes = [];
    this.pools = [];
    this.beams = [];
    this.trails = [];
    this.bossFX = [];
    this.flash = 0;
    this.flashColor = '#ffffff';
  }

  spawn(x, y, o = {}) {
    this.particles.push(new Particle(x, y, o));
  }

  burst(x, y, color = '#ffe6a0', count = 12, speed = 120, opts = {}) {
    for (let i = 0; i < count; i++) {
      const a = rand(0, Math.PI * 2);
      const s = rand(speed * .25, speed);
      this.particles.push(new Particle(x, y, {
        color, life: rand(.35, .85), size: rand(1.8, 4.6),
        vx: Math.cos(a) * s, vy: Math.sin(a) * s,
        gravity: opts.gravity ?? 30, drag: opts.drag ?? 2.2,
        shape: opts.shape || 'dot', glow: opts.glow !== false
      }));
    }
    if (count > 18) this.rings.push(new Ring(x, y, speed * .35, color, .4));
  }

  text(x, y, text, color = '#fff2d8', scale = 1) {
    this.texts.push({ x, y, text, color, scale, life: 1.15, maxLife: 1.15, vy: -34 });
    if (this.texts.length > 45) this.texts.shift();
  }

  slash(x, y, angle, combo, color = '#fff2c9', scale = 1) {
    this.slashes.push(new Slash(x, y, angle, combo, color, scale));
  }

  ring(x, y, radius, color = '#ffe6a0', life = .45) {
    this.rings.push(new Ring(x, y, radius, color, life, { fill: true }));
  }

  telegraphCircle(x, y, radius, life = .6, color = '#ffb06a') {
    this.telegraphs.push(new Telegraph(x, y, radius, life, color));
  }

  telegraphLine(x, y, x2, y2, life = .5, color = '#ffb06a', width = 22) {
    const a = Math.atan2(y2 - y, x2 - x);
    const len = Math.hypot(x2 - x, y2 - y);
    this.telegraphs.push(new Telegraph(x, y, 0, life, color, a, len, width));
  }

  groundSpike(x, y, radius, delay, color, onHit) {
    this.spikes.push(new GroundSpike(x, y, radius, color, delay, onHit));
  }

  hazardPool(x, y, radius, life, dps, color) {
    this.pools.push(new HazardPool(x, y, radius, life, dps, color));
  }

  lightBeam(x, y, angle, length, width, color, onHit) {
    this.beams.push(new LightBeam(x, y, angle, length, width, color, onHit));
  }

  dashTrail(player) { this.trails.push(new DashTrail(player)); }

  bossPhase(x, y, color = '#ffe6a0') { this.bossFX.push(new BossPhaseFX(x, y, color)); }

  screenFlash(color = '#ffffff', strength = .35) {
    this.flash = strength; this.flashColor = color;
  }

  update(dt, game) {
    const alive = (arr, fn) => {
      for (let i = arr.length - 1; i >= 0; i--) if (!fn(arr[i], dt)) arr.splice(i, 1);
    };
    alive(this.particles, p => p.update(dt));
    alive(this.slashes, s => s.update(dt));
    alive(this.rings, r => r.update(dt));
    alive(this.telegraphs, t => t.update(dt));
    alive(this.spikes, s => s.update(dt, game));
    alive(this.pools, p => p.update(dt, game));
    alive(this.beams, b => b.update(dt, game));
    alive(this.trails, t => t.update(dt));
    alive(this.bossFX, b => b.update(dt));
    for (let i = this.texts.length - 1; i >= 0; i--) {
      const t = this.texts[i];
      t.life -= dt;
      t.y += t.vy * dt;
      t.vy *= Math.exp(-2.4 * dt);
      if (t.life <= 0) this.texts.splice(i, 1);
    }
    this.flash = Math.max(0, this.flash - dt * 2.2);
    // cap particles for old phones
    if (this.particles.length > 420) this.particles.splice(0, this.particles.length - 420);
  }

  drawGround(ctx, cam, time) {
    for (const t of this.telegraphs) t.draw(ctx, cam);
    for (const p of this.pools) p.draw(ctx, cam);
    for (const s of this.spikes) s.draw(ctx, cam);
    for (const r of this.rings) r.draw(ctx, cam);
  }

  drawAir(ctx, cam, time) {
    for (const t of this.trails) t.draw(ctx, cam);
    for (const b of this.beams) b.draw(ctx, cam);
    for (const s of this.slashes) s.draw(ctx, cam);
    for (const b of this.bossFX) b.draw(ctx, cam, time);
    for (const p of this.particles) p.draw(ctx, cam);
    ctx.save();
    for (const t of this.texts) {
      const a = clamp(t.life / .45);
      const x = t.x - cam.x, y = t.y - cam.y;
      const sc = t.scale * (1 + (1 - t.life / t.maxLife) * .14);
      ctx.globalAlpha = a;
      ctx.font = `700 ${Math.round(13 * sc)}px "Palatino Linotype", Georgia, serif`;
      ctx.textAlign = 'center';
      ctx.lineWidth = 3;
      ctx.strokeStyle = 'rgba(5,8,14,.85)';
      ctx.strokeText(t.text, x, y);
      ctx.fillStyle = t.color;
      ctx.fillText(t.text, x, y);
    }
    ctx.restore();
    if (this.flash > 0.001) {
      ctx.save();
      ctx.globalAlpha = this.flash;
      ctx.fillStyle = this.flashColor;
      ctx.fillRect(0, 0, cam.w, cam.h);
      ctx.restore();
    }
  }

  clear() {
    this.particles.length = 0; this.texts.length = 0; this.slashes.length = 0;
    this.rings.length = 0; this.telegraphs.length = 0; this.spikes.length = 0;
    this.pools.length = 0; this.beams.length = 0; this.trails.length = 0;
    this.bossFX.length = 0; this.flash = 0;
  }
}
