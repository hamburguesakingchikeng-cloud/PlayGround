import { ENEMIES } from '../data/enemies.js';
import { Projectile } from './combat.js';
import { clamp, dist, angleDiff, TAU, randRange } from '../core/utils.js';

export class Enemy {
  constructor(game, typeId, x, y, opts = {}) {
    this.game = game;
    this.typeId = typeId;
    this.def = ENEMIES[typeId];
    if (!this.def) throw new Error('Enemigo desconocido: ' + typeId);
    this.x = x; this.y = y;
    this.spawnX = x; this.spawnY = y;
    this.level = opts.level || this.def.level;
    this.elite = Boolean(opts.elite);
    this.radius = this.def.radius * (this.elite ? 1.15 : 1);
    this.scale = (this.def.scale || 1) * (this.elite ? 1.12 : 1);
    this.sprite = this.def.sprite;
    this.hp = this.maxHp = this.calcHp();
    this.attack = this.calcAtk();
    this.defense = this.def.def * (1 + Math.max(0, this.level - this.def.level) * 0.1);
    this.speed = this.def.speed * (this.elite ? 1.08 : 1);
    this.facing = Math.PI / 2;
    this.anim = 'idle';
    this.animTime = Math.random() * 4;
    this.state = this.def.behavior === 'flee' ? 'flee' : 'idle';
    this.stateTimer = 0;
    this.cooldown = randRange(Math.random, 0.4, 1.6);
    this.wanderTimer = randRange(Math.random, 1, 3);
    this.wanderTarget = null;
    this.path = [];
    this.pathTimer = 0;
    this.flash = 0;
    this.staggerTimer = 0;
    this.status = {};
    this.dead = false;
    this.captured = false;
    this.deathTime = 0;
    this.dashDir = 0;
    this.dashTimer = 0;
    this.enraged = false;
    this.aggro = false;
    this.hitPlayerThisDash = false;
    this.name = this.def.name + (this.elite ? ' · Élite' : '');
  }

  calcHp() {
    const d = this.def;
    const lvl = Math.max(0, this.level - d.level);
    return Math.round(d.hp * (1 + lvl * 0.17) * (this.elite ? 1.7 : 1) * this.game.difficulty.enemyHp);
  }
  calcAtk() {
    const d = this.def;
    const lvl = Math.max(0, this.level - d.level);
    return Math.round(d.atk * (1 + lvl * 0.12) * (this.elite ? 1.3 : 1) * this.game.difficulty.enemyDmg);
  }
  get hpRatio() { return clamp(this.hp / this.maxHp, 0, 1); }

  update(dt, game) {
    this.animTime += dt;
    this.flash = Math.max(0, this.flash - dt);
    if (this.dead) { this.deathTime += dt; return; }
    if (this.captured) return;

    for (const [k, v] of Object.entries(this.status)) {
      this.status[k] = v - dt;
      if (this.status[k] <= 0) delete this.status[k];
    }
    if (this.status.burn) {
      this.hp -= 5 * dt;
      if (Math.random() < 0.3) game.particles.spawn('ember', this.x + randRange(Math.random, -8, 8), this.y - 10, { color: '#ff9a5c', size: 2, life: 0.4, speed: 20, additive: true });
    }
    if (this.status.poison) this.hp -= 3 * dt;
    if (this.hp <= 0) { this.die(game); return; }
    if (this.status.freeze || this.status.stun) { this.anim = 'idle'; return; }

    const p = game.player;
    const d = dist(this.x, this.y, p.x, p.y);
    if (this.state === 'stagger') {
      this.stateTimer -= dt;
      if (this.stateTimer <= 0) this.state = 'chase';
      return;
    }
    if (p.dead) { this.state = 'idle'; return; }
    if (d < this.def.aggro) this.aggro = true;
    if (d > this.def.aggro * 1.8) this.aggro = false;
    const slow = this.status.slow ? 0.55 : 1;
    const speed = this.speed * slow * (this.enraged ? 1.2 : 1);
    this.cooldown = Math.max(0, this.cooldown - dt);

    if (this.def.behavior === 'flee') {
      this.updateFlee(dt, game, d, speed);
      return;
    }
    if (!this.aggro) {
      this.updateIdle(dt, game, speed);
      return;
    }

    if (this.state === 'windup') {
      this.stateTimer -= dt;
      this.facing = Math.atan2(p.y - this.y, p.x - this.x);
      if (this.stateTimer <= 0) this.executeAttack(game, d);
      return;
    }
    if (this.state === 'recover') {
      this.stateTimer -= dt;
      if (this.stateTimer <= 0) this.state = 'chase';
      return;
    }
    if (this.state === 'dash') {
      this.updateDash(dt, game);
      return;
    }
    if (this.state === 'chase') {
      this.facing = Math.atan2(p.y - this.y, p.x - this.x);
      const range = this.def.range;
      const behavior = this.def.behavior;
      if (behavior === 'melee' || behavior === 'teleporter') {
        if (d <= range + p.radius && this.cooldown <= 0) this.startWindup('melee', 0.42, game);
        else this.moveToward(p.x, p.y, speed, dt, game);
      } else if (behavior === 'charger') {
        if (d <= range + p.radius && this.cooldown <= 0) this.startWindup('charge', 0.7, game);
        else this.moveToward(p.x, p.y, speed, dt, game);
      } else if (behavior === 'ranged') {
        if (d < range * 0.55) this.moveAway(p.x, p.y, speed * 0.9, dt, game);
        else if (d > range * 0.8) this.moveToward(p.x, p.y, speed, dt, game);
        else this.strafe(p.x, p.y, speed * 0.6, dt, game);
        if (d <= range && this.cooldown <= 0) this.startWindup('shoot', 0.55, game);
      } else if (behavior === 'breather') {
        if (d <= range + p.radius && this.cooldown <= 0) this.startWindup('breath', 0.8, game);
        else this.moveToward(p.x, p.y, speed, dt, game);
      } else if (behavior === 'beam') {
        if (d <= range && this.cooldown <= 0) this.startWindup('beam', 0.9, game);
        else this.moveToward(p.x, p.y, speed, dt, game);
      } else if (behavior === 'diver') {
        if (d <= range + p.radius && this.cooldown <= 0) this.startWindup('dive', 0.55, game);
        else this.moveToward(p.x, p.y, speed, dt, game);
      }
      return;
    }
    this.state = 'chase';
  }

  updateIdle(dt, game, speed) {
    this.wanderTimer -= dt;
    if (this.wanderTimer <= 0) {
      this.wanderTimer = randRange(Math.random, 2, 5);
      this.wanderTarget = this.game.world.randomFreeNear(this.spawnX, this.spawnY, 90);
    }
    if (this.wanderTarget) {
      const d = dist(this.x, this.y, this.wanderTarget.x, this.wanderTarget.y);
      if (d < 8) { this.wanderTarget = null; this.anim = 'idle'; }
      else { this.facing = Math.atan2(this.wanderTarget.y - this.y, this.wanderTarget.x - this.x); this.moveToward(this.wanderTarget.x, this.wanderTarget.y, speed * 0.32, dt, game); }
    }
  }

  updateFlee(dt, game, d, speed) {
    const p = game.player;
    if (d < 260) {
      const a = Math.atan2(this.y - p.y, this.x - p.x);
      this.facing = a;
      this.moveToward(this.x + Math.cos(a) * 100, this.y + Math.sin(a) * 100, speed, dt, game);
      this.anim = 'run';
    } else {
      this.anim = 'idle';
      this.updateIdle(dt, game, speed);
    }
  }

  moveToward(tx, ty, speed, dt, game) {
    const w = game.world;
    this.pathTimer -= dt;
    const dx = tx - this.x, dy = ty - this.y;
    const d = Math.hypot(dx, dy);
    if (d < 1) return;
    let mx = dx / d, my = dy / d;
    if (this.pathTimer <= 0 && w.circleBlocked(this.x + mx * 18, this.y + my * 18, this.radius)) {
      this.pathTimer = 0.8;
      this.path = w.findPath(this.x, this.y, tx, ty, 1800);
    }
    if (this.path.length) {
      const wp = this.path[0];
      const ddx = wp.x - this.x, ddy = wp.y - this.y;
      const dd = Math.hypot(ddx, ddy);
      if (dd < 10) this.path.shift();
      else { mx = ddx / dd; my = ddy / dd; }
    }
    const step = speed * dt;
    const moved = w.moveCircle(this.x, this.y, mx * step, my * step, this.radius);
    this.x = moved.x; this.y = moved.y;
    this.anim = 'walk';
    // Separación suave.
    for (const e of game.enemies) {
      if (e === this || e.dead) continue;
      const dd = dist(this.x, this.y, e.x, e.y);
      const min = this.radius + e.radius + 2;
      if (dd > 0 && dd < min) {
        const push = (min - dd) * 0.5;
        this.x += (this.x - e.x) / dd * push;
        this.y += (this.y - e.y) / dd * push;
      }
    }
  }

  moveAway(tx, ty, speed, dt, game) {
    const a = Math.atan2(this.y - ty, this.x - tx);
    this.moveToward(this.x + Math.cos(a) * 80, this.y + Math.sin(a) * 80, speed, dt, game);
  }
  strafe(tx, ty, speed, dt, game) {
    const a = Math.atan2(this.y - ty, this.x - tx) + Math.PI / 2;
    this.moveToward(this.x + Math.cos(a) * 70, this.y + Math.sin(a) * 70, speed, dt, game);
  }

  startWindup(type, duration, game) {
    this.state = 'windup';
    this.attackType = type;
    this.stateTimer = duration;
    this.anim = 'windup';
    if (type === 'shoot') this.facing = Math.atan2(game.player.y - this.y, game.player.x - this.x);
  }

  executeAttack(game, d) {
    const p = game.player;
    const def = this.def;
    if (this.attackType === 'melee') {
      this.facing = Math.atan2(p.y - this.y, p.x - this.x);
      if (dist(this.x, this.y, p.x, p.y) <= def.range + p.radius + 14) {
        p.takeDamage(this.attack, { source: 'enemy', game });
      }
      game.particles.slash(this.x + Math.cos(this.facing) * 18, this.y + Math.sin(this.facing) * 18 - 8, this.facing, { radius: 34, color: this.elite ? '#ffcf6a' : '#ff9a5c', arc: 1.4, width: 6 });
      game.audio.sfx('attack', { volume: 0.5 });
      this.state = 'recover'; this.stateTimer = 0.5; this.cooldown = 0.8;
    } else if (this.attackType === 'shoot') {
      const a = Math.atan2(p.y - this.y, p.x - this.x);
      const isFire = def.projectile === 'fire';
      game.spawnProjectile({
        x: this.x + Math.cos(a) * 18, y: this.y + Math.sin(a) * 18 - 8,
        vx: Math.cos(a) * 260, vy: Math.sin(a) * 260, radius: 8,
        damage: this.attack, color: isFire ? '#ff9a5c' : '#8fd18a', owner: 'enemy',
        life: 2.2, element: isFire ? 'fuego' : 'naturaleza',
      });
      game.audio.sfx(isFire ? 'fire' : 'spell', { volume: 0.5 });
      this.state = 'recover'; this.stateTimer = 0.65; this.cooldown = 1.5;
    } else if (this.attackType === 'charge') {
      this.state = 'dash';
      this.dashDir = Math.atan2(p.y - this.y, p.x - this.x);
      this.dashTimer = 0.42;
      this.hitPlayerThisDash = false;
      game.audio.sfx('heavy', { volume: 0.6 });
    } else if (this.attackType === 'breath') {
      const a = Math.atan2(p.y - this.y, p.x - this.x);
      const angleOk = Math.abs(angleDiff(a, Math.atan2(p.y - this.y, p.x - this.x))) < 0.7;
      if (d < def.range + p.radius + 30 && angleOk) p.takeDamage(this.attack, { source: 'enemy', element: 'fuego', game });
      for (let i = 0; i < 14; i++) {
        const aa = a + randRange(Math.random, -0.55, 0.55);
        game.particles.spawn('ember', this.x, this.y - 8, { angle: aa, speed: randRange(Math.random, 80, 220), color: '#ff7b3d', life: 0.7, size: 3, additive: true });
      }
      game.audio.sfx('fire');
      this.state = 'recover'; this.stateTimer = 0.9; this.cooldown = 2.2;
    } else if (this.attackType === 'beam') {
      const a = Math.atan2(p.y - this.y, p.x - this.x);
      const hit = this.lineHitsPlayer(a, 320, p, 16);
      game.particles.beam(this.x, this.y - 10, a, { radius: 320, color: '#ffe7a8', width: 9, life: 0.25 });
      if (hit) p.takeDamage(this.attack, { source: 'enemy', element: 'luz', game });
      game.audio.sfx('spell');
      this.state = 'recover'; this.stateTimer = 1; this.cooldown = 2.6;
    } else if (this.attackType === 'dive') {
      this.state = 'dash';
      this.dashDir = Math.atan2(p.y - this.y, p.x - this.x);
      this.dashTimer = 0.38;
      this.hitPlayerThisDash = false;
      game.audio.sfx('dodge', { volume: 0.6 });
    } else if (this.attackType === 'teleport') {
      const angle = Math.random() * TAU;
      const nx = p.x + Math.cos(angle) * 44, ny = p.y + Math.sin(angle) * 44;
      if (!game.world.circleBlocked(nx, ny, this.radius)) {
        game.particles.burst(this.x, this.y - 10, 16, { color: '#b49ad9', speed: 80, life: 0.4, size: 2.5 });
        this.x = nx; this.y = ny;
        game.particles.burst(this.x, this.y - 10, 16, { color: '#b49ad9', speed: 80, life: 0.4, size: 2.5 });
      }
      this.state = 'recover'; this.stateTimer = 0.5; this.cooldown = 1.8;
    }
  }

  lineHitsPlayer(angle, length, p, width) {
    const dx = p.x - this.x, dy = p.y - this.y;
    const proj = dx * Math.cos(angle) + dy * Math.sin(angle);
    if (proj < 0 || proj > length) return false;
    const perp = Math.abs(-dx * Math.sin(angle) + dy * Math.cos(angle));
    return perp < width + p.radius;
  }

  updateDash(dt, game) {
    this.dashTimer -= dt;
    this.anim = 'dash';
    const speed = this.def.behavior === 'diver' ? 460 : 360;
    const moved = game.world.moveCircle(this.x, this.y, Math.cos(this.dashDir) * speed * dt, Math.sin(this.dashDir) * speed * dt, this.radius);
    this.x = moved.x; this.y = moved.y;
    game.particles.spawn('smoke', this.x, this.y, { color: this.def.behavior === 'diver' ? '#ffe7a8' : '#ff9a5c', size: 4, life: 0.35, speed: 10, additive: false });
    const p = game.player;
    if (!this.hitPlayerThisDash && dist(this.x, this.y, p.x, p.y) < this.radius + p.radius + 8) {
      this.hitPlayerThisDash = true;
      p.takeDamage(this.attack * 1.15, { source: 'enemy', game });
      game.camera.addShake(7);
    }
    if (this.dashTimer <= 0) {
      this.state = 'recover';
      this.stateTimer = 0.8;
      this.cooldown = 1.4;
    }
  }

  takeDamage(amount, { source = 'player', crit = false, element = null, game = this.game } = {}) {
    if (this.dead || this.captured) return false;
    const mark = this.status.mark ? 1.2 : 1;
    const defense = this.defense / (this.defense + 100);
    const dmg = Math.max(1, Math.round(amount * (1 - defense) * mark));
    this.hp -= dmg;
    this.flash = 0.12;
    this.aggro = true;
    if (this.state === 'idle' || this.state === 'chase') {
      if (dmg > this.maxHp * 0.12) this.stagger(0.22, game);
    }
    if (this.hp <= 0) this.die(game);
    else if (this.hpRatio < 0.3 && !this.enraged && !this.def.boss) {
      this.enraged = true;
      game.particles.ring(this.x, this.y, { radius: 10, target: 50, color: '#ff7b4d', width: 3, life: 0.5 });
    }
    return true;
  }

  stagger(duration, game) {
    this.state = 'stagger';
    this.stateTimer = duration;
    this.anim = 'stagger';
    game.particles.ring(this.x, this.y, { radius: 8, target: 30, color: '#ffe7a8', width: 2, life: 0.3 });
  }

  applyStatus(type, duration, game) {
    this.status[type] = Math.max(this.status[type] || 0, duration);
    if (type === 'burn') game.particles.burst(this.x, this.y - 8, 6, { color: '#ff9a5c', speed: 40, life: 0.5, size: 2 });
  }

  die(game) {
    if (this.dead) return;
    this.dead = true;
    this.state = 'dead';
    this.deathTime = 0;
    this.hp = 0;
    game.particles.burst(this.x, this.y - 10, 26, { color: this.elite ? '#ffcf6a' : '#ffe7a8', speed: 140, life: 0.9, size: 3 });
    game.particles.ring(this.x, this.y, { radius: 6, target: 44, color: '#ffe7a8', width: 3, life: 0.5 });
    game.audio.sfx('death', { volume: 0.4 });
    game.onEnemyKilled(this);
  }

  captureSuccess(game) {
    this.captured = true;
    this.dead = true;
    this.deathTime = 0;
    game.particles.burst(this.x, this.y - 10, 34, { color: '#c7a4ff', speed: 110, life: 1.1, size: 3 });
    game.particles.ring(this.x, this.y, { radius: 8, target: 70, color: '#c7a4ff', width: 4, life: 0.7 });
    game.audio.sfx('capture');
  }

  drawHealthBar(ctx) {
    if (this.dead || this.captured || this.def.boss) return;
    const w = 34 + this.radius;
    const x = this.x - w / 2;
    const y = this.y - this.radius - 34;
    ctx.save();
    ctx.fillStyle = 'rgba(10,8,16,0.7)';
    ctx.fillRect(x - 1, y - 1, w + 2, 6);
    ctx.fillStyle = this.elite ? '#ffcf6a' : '#ff7b7b';
    ctx.fillRect(x, y, w * this.hpRatio, 4);
    if (this.status.mark) {
      ctx.fillStyle = '#c7a4ff';
      ctx.beginPath(); ctx.arc(x - 6, y + 2, 3, 0, TAU); ctx.fill();
    }
    ctx.restore();
  }
}
