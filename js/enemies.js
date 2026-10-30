// Enemigos, IA, telegrafías y jefes por fases.
import { ENEMIES, AFFINITIES } from './data.js';
import { drawEnemy, drawShadow, hexA, clamp } from './sprites.js';

function angleDiff(a, b) {
  let d = a - b;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return d;
}

function rand(a, b) { return a + Math.random() * (b - a); }

export class Enemy {
  constructor(game, kind, x, y, level = 1) {
    this.game = game;
    this.kind = kind;
    this.def = ENEMIES[kind] || ENEMIES.gelatina;
    this.name = this.def.name;
    this.level = Math.max(1, level);
    const bossScale = this.def.boss ? 0.075 : 0.22;
    this.maxHp = Math.round(this.def.hp * (1 + (this.level - 1) * bossScale));
    this.hp = this.maxHp;
    this.x = x;
    this.y = y;
    this.homeX = x;
    this.homeY = y;
    this.r = this.def.radius || 24;
    this.scale = this.def.scale || 1;
    this.facing = 0;
    this.t = Math.random() * 10;
    this.walk = Math.random() * 4;
    this.hurt = 0;
    this.dead = false;
    this.deathTimer = 0;
    this.stun = 0;
    this.slowTimer = 0;
    this.aggro = false;
    this.dormant = !!this.def.boss;
    this.bossStarted = false;
    this.phase = 1;
    this.invuln = 0;
    this.contactCd = 0;
    this.attackCd = rand(0.5, 1.6);
    this.hopTime = 0;
    this.hopCd = rand(0.6, 1.4);
    this.hopVX = 0;
    this.hopVY = 0;
    this.lungeWindup = 0;
    this.lungeTime = 0;
    this.lungeCd = rand(0.8, 1.8);
    this.lungeVX = 0;
    this.lungeVY = 0;
    this.chargeWindup = 0;
    this.chargeTime = 0;
    this.chargeCd = rand(1.8, 3.2);
    this.chargeVX = 0;
    this.chargeVY = 0;
    this.rangedCd = rand(0.7, 1.8);
    this.meleeWindup = 0;
    this.meleeCd = rand(0.8, 1.8);
    this.radialWindup = 0;
    this.radialCd = rand(3.5, 5.5);
    this.summonCd = rand(4, 7);
    this.starCd = rand(5, 8);
    this.pending = [];
    this.telegraphColor = '#ff9a6e';
    this.deathReason = null;
  }

  get boss() { return !!this.def.boss; }
  get alive() { return !this.dead; }

  update(dt) {
    this.t += dt;
    this.hurt = Math.max(0, this.hurt - dt);
    this.invuln = Math.max(0, this.invuln - dt);
    this.stun = Math.max(0, this.stun - dt);
    this.slowTimer = Math.max(0, this.slowTimer - dt);
    this.contactCd = Math.max(0, this.contactCd - dt);

    if (this.dead) {
      this.deathTimer = Math.max(0, this.deathTimer - dt);
      return;
    }

    const p = this.game.player;
    if (!p || this.game.playerDead) return;
    const dx = p.x - this.x;
    const dy = p.y - this.y;
    const dist = Math.hypot(dx, dy) || 1;

    if (this.dormant) {
      if (dist < (this.game.world.bossTrigger?.r || 250) && this.game.world.zoneId === 'ruinas_umbra') {
        this.dormant = false;
        this.bossStarted = true;
        this.aggro = true;
        this.game.startBossFight(this);
      }
      return;
    }

    if (!this.aggro) {
      const range = this.def.behavior === 'boss' ? 720 : this.def.behavior === 'ranged' ? 500 : 400;
      if (dist < range || this.hurt > 0) this.aggro = true;
    }

    if (this.stun > 0) {
      this.updatePending(dt);
      return;
    }

    if (this.boss) this.updateBoss(dt, dist, dx, dy);
    else this.updateBasic(dt, dist, dx, dy);

    this.updatePending(dt);
  }

  updateBasic(dt, dist, dx, dy) {
    const p = this.game.player;
    const speed = this.def.speed * (this.slowTimer > 0 ? 0.42 : 1);
    const ang = Math.atan2(dy, dx);
    this.facing = ang;

    if (this.aggro) {
      if (this.def.behavior === 'bounce') {
        this.hopCd -= dt;
        if (this.hopTime > 0) {
          this.hopTime -= dt;
          this.moveWith(this.hopVX * dt, this.hopVY * dt);
        } else if (this.hopCd <= 0 && dist < 360) {
          this.hopCd = rand(1.1, 1.8);
          this.hopTime = 0.34;
          const a = ang + rand(-0.25, 0.25);
          this.hopVX = Math.cos(a) * speed * 2.5;
          this.hopVY = Math.sin(a) * speed * 2.5;
          this.game.audio.play('footstep');
        } else if (dist > 90) {
          this.moveWith(Math.cos(ang) * speed * 0.34 * dt, Math.sin(ang) * speed * 0.34 * dt);
        }
      } else if (this.def.behavior === 'lunge') {
        this.lungeCd -= dt;
        if (this.lungeTime > 0) {
          this.lungeTime -= dt;
          this.attacking = 1;
          this.moveWith(this.lungeVX * dt, this.lungeVY * dt);
          this.tryContact(dist, 1.5);
        } else if (this.lungeWindup > 0) {
          this.lungeWindup -= dt;
          this.attacking = 0.55;
          if (this.lungeWindup <= 0) {
            this.lungeTime = 0.3;
            this.lungeVX = Math.cos(this.lockAng) * speed * 3.4;
            this.lungeVY = Math.sin(this.lockAng) * speed * 3.4;
            this.game.particles.burst(this.x, this.y - 12, 9, { color: '#ffb07a', speed: 80, life: 0.35, size: 2, type: 'dust' });
            this.game.audio.play('attack');
          }
        } else if (this.lungeCd <= 0 && dist < 185 && dist > 45) {
          this.lungeWindup = 0.48;
          this.lungeCd = rand(1.8, 2.6);
          this.lockAng = ang;
        } else {
          const want = dist > 105 ? 1 : dist < 70 ? -0.55 : 0.12;
          this.moveWith(Math.cos(ang) * speed * want * dt, Math.sin(ang) * speed * want * dt);
        }
      } else if (this.def.behavior === 'charge') {
        this.chargeCd -= dt;
        if (this.chargeTime > 0) {
          this.chargeTime -= dt;
          this.attacking = 1;
          const res = this.moveWith(this.chargeVX * dt, this.chargeVY * dt);
          if (res.blocked) {
            this.chargeTime = 0;
            this.stun = 0.9;
            this.game.shake(5);
            this.game.particles.burst(this.x, this.y - 20, 12, { color: '#d3a46b', speed: 140, life: 0.5, size: 3, type: 'dust' });
          }
          this.tryContact(dist, 1.35);
        } else if (this.chargeWindup > 0) {
          this.chargeWindup -= dt;
          this.attacking = 0.5;
          if (this.chargeWindup <= 0) {
            this.chargeTime = 0.62;
            this.chargeVX = Math.cos(this.lockAng) * speed * 4.1;
            this.chargeVY = Math.sin(this.lockAng) * speed * 4.1;
            this.game.audio.play('heavy');
          }
        } else if (this.chargeCd <= 0 && dist < 430 && dist > 70) {
          this.chargeWindup = 0.62;
          this.chargeCd = rand(2.8, 4);
          this.lockAng = ang;
        } else {
          const want = dist > 280 ? 1 : dist < 150 ? -0.7 : 0.1;
          this.moveWith(Math.cos(ang) * speed * want * dt, Math.sin(ang) * speed * want * dt);
        }
      } else if (this.def.behavior === 'ranged') {
        this.rangedCd -= dt;
        if (this.rangedCd <= 0 && dist < 560) {
          this.rangedCd = rand(1.7, 2.6);
          this.attacking = 0.8;
          const a = ang;
          this.game.spawnProjectile({
            x: this.x, y: this.y - 34,
            vx: Math.cos(a) * 235, vy: Math.sin(a) * 235,
            r: 11, owner: 'enemy', element: this.def.affinity,
            color: AFFINITIES[this.def.affinity]?.color || '#c79aff',
            kind: 'dark', damage: this.def.dmg * 0.85, life: 3, trail: true,
          });
          this.game.audio.play('magic');
        }
        const want = dist < 230 ? -0.8 : dist > 380 ? 1 : 0.06;
        this.moveWith(Math.cos(ang) * speed * want * dt, Math.sin(ang) * speed * want * dt);
      }

      if (dist < this.r + this.game.player.r + 7) this.tryContact(dist, 1);
    } else {
      // Deambular cerca del punto de origen
      this.walk += dt * 0.4;
      if (Math.hypot(this.x - this.homeX, this.y - this.homeY) > 190 && dist > 420) {
        const homeAng = Math.atan2(this.homeY - this.y, this.homeX - this.x);
        this.moveWith(Math.cos(homeAng) * speed * 0.4 * dt, Math.sin(homeAng) * speed * 0.4 * dt);
      }
    }
  }

  updateBoss(dt, dist, dx, dy) {
    const p = this.game.player;
    const speed = this.def.speed * (this.slowTimer > 0 ? 0.5 : 1) * (0.9 + this.phase * 0.08);
    const ang = Math.atan2(dy, dx);
    this.facing = ang;
    this.attacking = 0;

    const ratio = this.hp / this.maxHp;
    const newPhase = ratio > 0.66 ? 1 : ratio > 0.33 ? 2 : 3;
    if (newPhase !== this.phase) {
      this.phase = newPhase;
      this.invuln = 0.9;
      this.radialWindup = 0;
      this.meleeWindup = 0;
      this.game.onBossPhase(this, newPhase);
    }

    this.meleeCd -= dt;
    this.radialCd -= dt;
    this.summonCd -= dt;
    this.starCd -= dt;

    // Canalizaciones
    if (this.radialWindup > 0) {
      this.radialWindup -= dt;
      this.attacking = 0.7;
      if (this.radialWindup <= 0) this.fireRadial();
      return;
    }
    if (this.meleeWindup > 0) {
      this.meleeWindup -= dt;
      this.attacking = 0.65;
      if (this.meleeWindup <= 0) this.resolveSlam();
      return;
    }

    // Fase 3: lluvia de estrellas
    if (this.phase >= 3 && this.starCd <= 0) {
      this.starCd = rand(6.5, 8.5);
      this.game.notify('El cielo se oscurece', '¡El Guardián invoca una lluvia de meteoros!', 'danger');
      this.game.audio.play('bossroar');
      for (let i = 0; i < 4; i++) {
        const ox = i === 0 ? 0 : rand(-190, 190);
        const oy = i === 0 ? 0 : rand(-150, 150);
        this.pending.push({
          x: p.x + ox, y: p.y + oy, r: 82, t: 1.15 + i * 0.18, max: 1.15 + i * 0.18,
          damage: this.def.dmg * 1.15, kind: 'star', color: '#ffcf6e',
        });
      }
    }

    // Fase 2+: invocar espectros
    if (this.phase >= 2 && this.summonCd <= 0) {
      const adds = this.game.enemies.filter((e) => e !== this && !e.dead && e.kind === 'espectro' && e.summoned).length;
      if (adds < 3) {
        this.summonCd = rand(7, 10);
        this.game.audio.play('magic');
        for (let i = 0; i < (this.phase >= 3 ? 2 : 1); i++) {
          const a = rand(0, Math.PI * 2);
          const x = clamp(this.x + Math.cos(a) * 150, 80, this.game.world.w - 80);
          const y = clamp(this.y + Math.sin(a) * 130, 80, this.game.world.h - 80);
          this.game.spawnSummon(this, x, y);
        }
        this.game.notify('El Guardián llama', 'Sombras acuden a su lado.', 'danger');
      }
    }

    // Ataques a distancia / área
    if (dist < 135 && this.meleeCd <= 0) {
      this.meleeWindup = 0.55;
      this.meleeCd = rand(1.7, 2.6);
      this.lockAng = ang;
      this.game.audio.play('heavy');
      return;
    }
    if (this.radialCd <= 0) {
      this.radialWindup = this.phase === 3 ? 0.85 : 1.05;
      this.radialCd = this.phase === 3 ? rand(3.6, 5) : rand(5, 6.8);
      this.game.audio.play('bossroar');
      this.game.notify('¡Telegrafía!', 'El Guardián concentra oscuridad. Aléjate.', 'danger');
      return;
    }

    // Movimiento de persecución
    if (dist > 90) {
      const strafe = Math.sin(this.t * 0.8) * 0.35;
      const a = ang + strafe;
      this.moveWith(Math.cos(a) * speed * dt, Math.sin(a) * speed * dt);
    }
    this.tryContact(dist, 1.2);

    // Mantener al jefe en la arena
    const arena = this.game.world.arena;
    if (arena) {
      const d = Math.hypot(this.x - arena.x, this.y - arena.y);
      if (d > arena.r - 55) {
        const a = Math.atan2(arena.y - this.y, arena.x - this.x);
        this.x += Math.cos(a) * (d - (arena.r - 55));
        this.y += Math.sin(a) * (d - (arena.r - 55));
      }
    }
  }

  fireRadial() {
    const count = this.phase >= 3 ? 22 : this.phase === 2 ? 16 : 12;
    const offset = Math.random() * Math.PI * 2;
    const base = this.phase >= 3 ? 285 : 235;
    for (let i = 0; i < count; i++) {
      const a = offset + (i / count) * Math.PI * 2;
      this.game.spawnProjectile({
        x: this.x, y: this.y - 54,
        vx: Math.cos(a) * base, vy: Math.sin(a) * base,
        r: 12, owner: 'enemy', element: 'oscuridad', color: '#b990ff',
        kind: 'dark', damage: this.def.dmg * 0.7, life: 2.4, trail: true,
      });
    }
    this.game.particles.ring(this.x, this.y - 40, '#b990ff', 180, { life: 0.7, width: 6 });
    this.game.shake(13);
    this.game.audio.play('magic');
  }

  resolveSlam() {
    const a = this.lockAng ?? this.facing;
    const x = this.x + Math.cos(a) * 62;
    const y = this.y + Math.sin(a) * 62;
    this.game.areaDamage(x, y, 115, this.def.dmg * 1.55, 'enemy', { element: 'oscuridad' });
    this.game.particles.ring(x, y, '#ff9a6e', 120, { life: 0.5, width: 8 });
    this.game.particles.burst(x, y, 18, { color: '#c79aff', speed: 190, life: 0.55, size: 3, type: 'shard' });
    this.game.shake(10);
    this.game.audio.play('heavy');
  }

  updatePending(dt) {
    for (let i = this.pending.length - 1; i >= 0; i--) {
      const p = this.pending[i];
      p.t -= dt;
      if (p.t <= 0) {
        this.game.areaDamage(p.x, p.y, p.r, p.damage, 'enemy', { element: 'oscuridad' });
        this.game.particles.ring(p.x, p.y, p.color, p.r, { life: 0.6, width: 6 });
        this.game.particles.burst(p.x, p.y, 16, { color: p.color, speed: 220, life: 0.6, size: 3, type: 'star' });
        this.game.particles.burst(p.x, p.y, 10, { color: '#6b4a98', speed: 120, life: 0.7, size: 5, type: 'dust' });
        this.game.shake(8);
        this.game.audio.play('hit');
        this.pending.splice(i, 1);
      }
    }
  }

  tryContact(dist, mult = 1) {
    if (this.contactCd > 0 || this.game.playerDead) return;
    const p = this.game.player;
    if (dist < this.r + p.r + 6) {
      this.contactCd = 0.8;
      const a = Math.atan2(p.y - this.y, p.x - this.x);
      p.takeDamage(this.def.dmg * mult, { source: this });
      p.x += Math.cos(a) * 18;
      p.y += Math.sin(a) * 18;
      this.game.particles.burst(p.x, p.y - 24, 8, { color: '#ff9a6e', speed: 100, life: 0.35, size: 2, type: 'spark' });
    }
  }

  moveWith(dx, dy) {
    const ctx = this.game.collisionCtx(false);
    const before = { x: this.x, y: this.y };
    const res = this.game.world.moveEntity(this, dx, dy, ctx);
    const moved = Math.hypot(this.x - before.x, this.y - before.y);
    const wanted = Math.hypot(dx, dy);
    if (moved > 0.01) {
      this.walk += moved * 0.03;
      this.moving = true;
    } else {
      this.moving = false;
    }
    return { ...res, blocked: wanted > 0.5 && moved < wanted * 0.35 };
  }

  takeDamage(amount, opts = {}) {
    if (this.dead || this.dormant) return false;
    if (this.invuln > 0) {
      this.game.floatText(this.x, this.y - this.r - 28, 'INMUNE', '#c7b6ff', { size: 13 });
      return false;
    }
    const type = opts.type || 'physical';
    let dmg = amount;
    const soft = type === 'physical' ? 78 : 150;
    dmg *= 1 - (this.def.def || 0) / ((this.def.def || 0) + soft);
    if (opts.element && opts.element === this.def.weakness) dmg *= 1.4;
    if (opts.element && opts.element === this.def.affinity) dmg *= 0.72;
    dmg = Math.max(1, Math.round(dmg));
    this.hp -= dmg;
    this.hurt = 0.3;
    this.aggro = true;
    this.game.floatText(this.x, this.y - this.r - 26, `${dmg}${opts.crit ? '!' : ''}`, opts.crit ? '#ffe27a' : '#fff3e2', { size: opts.crit ? 22 : 16, crit: opts.crit });
    this.game.particles.burst(this.x, this.y - this.r * 0.7, opts.crit ? 12 : 7, {
      color: opts.color || (opts.element ? AFFINITIES[opts.element]?.color : '#ffd7b0') || '#ffd7b0',
      speed: opts.crit ? 190 : 120, life: 0.4, size: opts.crit ? 3 : 2, type: 'spark',
    });
    this.game.audio.play(opts.crit ? 'crit' : 'hit');
    if (opts.element && opts.element === this.def.weakness) {
      this.game.floatText(this.x, this.y - this.r - 48, '¡Debilidad!', AFFINITIES[this.def.weakness]?.color || '#ffe27a', { size: 13 });
    }
    if (opts.knock) {
      const a = opts.angle ?? this.facing;
      this.moveWith(Math.cos(a) * opts.knock * 0.12, Math.sin(a) * opts.knock * 0.12);
    }
    if (this.hp <= 0) {
      this.hp = 0;
      this.die(opts);
    } else if (this.boss) {
      // La fase se recalcula en update para permitir invulnerabilidad breve.
    }
    return true;
  }

  die(opts = {}) {
    if (this.dead) return;
    this.dead = true;
    this.deathTimer = this.boss ? 2.2 : 0.7;
    this.deathReason = opts;
    this.game.particles.burst(this.x, this.y - this.r * 0.7, this.boss ? 60 : 20, {
      color: this.boss ? '#e0b7ff' : AFFINITIES[this.def.affinity]?.color || '#ffd7b0',
      speed: this.boss ? 300 : 170, life: this.boss ? 1.4 : 0.7, size: this.boss ? 4 : 2.8, type: this.boss ? 'star' : 'spark',
    });
    if (this.boss) {
      this.game.particles.ring(this.x, this.y - 40, '#e0b7ff', 340, { life: 1.4, width: 10 });
      this.game.shake(22);
      this.game.audio.play('bossroar');
    } else {
      this.game.audio.play('enemydeath');
    }
    this.game.onEnemyKilled(this, opts);
  }

  draw(ctx, t) {
    if (this.dead && this.deathTimer <= 0) return;
    const alpha = this.dead ? clamp(this.deathTimer / (this.boss ? 2.2 : 0.7), 0, 1) : 1;
    const hurt = this.hurt;

    if (!this.dead) this.drawTelegraphs(ctx, t);

    drawShadow(ctx, this.x, this.y, this.r * 1.15, this.r * 0.38, 0.32);
    ctx.save();
    ctx.translate(this.x, this.y);
    const phase = this.boss ? this.phase : 1;
    drawEnemy(ctx, this.kind, {
      t: t + this.t,
      facing: this.facing,
      moving: this.moving,
      walk: this.walk,
      hurt,
      phase,
      scale: this.scale * (this.dead ? 0.92 + alpha * 0.08 : 1),
      alpha,
      attacking: this.attacking || 0,
    });
    ctx.restore();

    if (this.dead) return;

    if (this.slowTimer > 0) {
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.strokeStyle = 'rgba(160,235,255,.55)';
      ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.ellipse(this.x, this.y - 4, this.r * 1.1, this.r * 0.4, 0, 0, Math.PI * 2); ctx.stroke();
      ctx.restore();
    }
    if (this.stun > 0) {
      ctx.save();
      for (let i = 0; i < 3; i++) {
        const a = t * 6 + i * 2.1;
        ctx.fillStyle = '#ffe27a';
        ctx.beginPath(); ctx.arc(this.x + Math.cos(a) * 16, this.y - this.r * 2 - 8 + Math.sin(a) * 5, 2, 0, Math.PI * 2); ctx.fill();
      }
      ctx.restore();
    }

    if (!this.boss || this.aggro) {
      const w = this.boss ? 70 : 46;
      const ratio = this.hp / this.maxHp;
      ctx.save();
      ctx.fillStyle = 'rgba(4,7,16,.72)';
      ctx.fillRect(this.x - w / 2, this.y - this.r * 2.35, w, 5);
      const col = this.boss ? ['#7f5bb5', '#b04d76', '#d4553d'][this.phase - 1] : ratio < 0.4 ? '#ff9060' : '#c6f0b8';
      ctx.fillStyle = col;
      ctx.fillRect(this.x - w / 2 + 1, this.y - this.r * 2.35 + 1, (w - 2) * ratio, 3);
      if (!this.boss) {
        ctx.font = '600 9px "Trebuchet MS", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = 'rgba(233,241,255,.78)';
        ctx.fillText(`${this.name} · Lv.${this.level}`, this.x, this.y - this.r * 2.35 - 5);
      }
      ctx.restore();
    }
  }

  drawTelegraphs(ctx, t) {
    ctx.save();
    // Línea de embestida
    if (this.chargeWindup > 0 || this.lungeWindup > 0) {
      const charging = this.chargeWindup > 0;
      const max = charging ? 0.62 : 0.48;
      const prog = 1 - (charging ? this.chargeWindup : this.lungeWindup) / max;
      const len = charging ? 430 : 260;
      const a = this.lockAng || this.facing;
      ctx.translate(this.x, this.y - 10);
      ctx.rotate(a);
      ctx.globalCompositeOperation = 'lighter';
      ctx.fillStyle = hexA(charging ? '#ff9a6e' : '#ffcf6e', 0.12 + prog * 0.14);
      ctx.fillRect(0, -this.r * 0.75, len, this.r * 1.5);
      ctx.strokeStyle = hexA(charging ? '#ff9a6e' : '#ffcf6e', 0.35 + prog * 0.4);
      ctx.lineWidth = 2;
      ctx.setLineDash([12, 8]);
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(len, 0); ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
      ctx.save();
    }
    // Zona de golpe cuerpo a cuerpo
    if (this.meleeWindup > 0) {
      const prog = 1 - this.meleeWindup / 0.55;
      const a = this.lockAng || this.facing;
      const x = this.x + Math.cos(a) * 62;
      const y = this.y + Math.sin(a) * 62;
      ctx.globalCompositeOperation = 'lighter';
      ctx.fillStyle = hexA('#ff5f6d', 0.08 + prog * 0.16);
      ctx.beginPath(); ctx.ellipse(x, y, 115 * (0.4 + prog * 0.6), 115 * 0.55 * (0.4 + prog * 0.6), 0, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = hexA('#ff9a6e', 0.5 + prog * 0.4);
      ctx.lineWidth = 2; ctx.stroke();
    }
    // Anillo radial
    if (this.radialWindup > 0) {
      const max = this.phase === 3 ? 0.85 : 1.05;
      const prog = 1 - this.radialWindup / max;
      ctx.globalCompositeOperation = 'lighter';
      ctx.strokeStyle = hexA('#c08bff', 0.3 + prog * 0.55);
      ctx.lineWidth = 3 + prog * 4;
      const radius = 60 + prog * 190;
      ctx.beginPath(); ctx.ellipse(this.x, this.y - 10, radius, radius * 0.55, 0, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = hexA('#b990ff', 0.05 + prog * 0.1);
      ctx.beginPath(); ctx.arc(this.x, this.y - 54, 24 + prog * 26, 0, Math.PI * 2); ctx.fill();
    }
    // Meteoros pendientes
    for (const p of this.pending) {
      const prog = 1 - p.t / p.max;
      ctx.globalCompositeOperation = 'lighter';
      ctx.fillStyle = hexA(p.color, 0.08 + prog * 0.12);
      ctx.beginPath(); ctx.ellipse(p.x, p.y, p.r * (0.8 + prog * 0.2), p.r * 0.5, 0, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = hexA(p.color, 0.35 + prog * 0.5);
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.ellipse(p.x, p.y, p.r, p.r * 0.5, 0, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(p.x, p.y, 4 + prog * 7, 0, Math.PI * 2); ctx.fillStyle = hexA('#fff7d1', 0.7); ctx.fill();
    }
    ctx.restore();
  }
}

export function makeEnemy(game, kind, x, y, level) {
  return new Enemy(game, kind, x, y, level);
}
