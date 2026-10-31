import { BOSSES } from '../data/enemies.js';
import { Projectile, Zone } from './combat.js';
import { clamp, dist, angleDiff, TAU, randRange } from '../core/utils.js';

// Jefes con fases, telegraphs legibles y patrones propios de cada reino.
export class Boss {
  constructor(game, id, x, y) {
    const def = BOSSES[id];
    if (!def) throw new Error('Jefe desconocido: ' + id);
    this.game = game;
    this.id = id;
    this.def = def;
    this.typeId = id;
    this.name = def.name;
    this.title = def.title;
    this.sprite = def.sprite;
    this.x = x;
    this.y = y;
    this.spawnX = x;
    this.spawnY = y;
    this.level = def.level;
    this.radius = def.radius;
    this.scale = def.scale || 1;
    this.maxHp = Math.round(def.hp * game.difficulty.enemyHp);
    this.hp = this.maxHp;
    this.attack = Math.round(def.atk * game.difficulty.enemyDmg);
    this.defense = def.def;
    this.speed = def.speed;
    this.facing = Math.PI / 2;
    this.anim = 'idle';
    this.animTime = 0;
    this.flash = 0;
    this.status = {};
    this.dead = false;
    this.captured = false;
    this.deathTime = 0;
    this.boss = true;
    this.phase = 0;
    this.phaseCount = def.phases.length;
    this.state = 'intro';
    this.stateTimer = 1.15;
    this.cooldown = 1.4;
    this.pattern = null;
    this.patternIndex = 0;
    this.dashDir = 0;
    this.dashTimer = 0;
    this.hitPlayerThisDash = false;
    this.introTimer = 1.15;
    this.transitionTimer = 0;
    this.invuln = 0;
    this.aggro = true;
    this.enraged = false;
    this.arena = def.arena || null;
    this.summoned = 0;
  }

  get hpRatio() { return clamp(this.hp / this.maxHp, 0, 1); }
  get isBoss() { return true; }

  update(dt, game) {
    this.animTime += dt;
    this.flash = Math.max(0, this.flash - dt);
    if (this.dead) { this.deathTime += dt; return; }
    this.invuln = Math.max(0, this.invuln - dt);
    if (this.introTimer > 0) {
      this.introTimer -= dt;
      this.anim = 'intro';
      return;
    }
    for (const [k, v] of Object.entries(this.status)) {
      this.status[k] = v - dt;
      if (this.status[k] <= 0) delete this.status[k];
    }
    if (this.status.burn) this.hp -= 4 * dt;
    if (this.status.poison) this.hp -= 2.5 * dt;
    if (this.hp <= 0) { this.die(game); return; }
    if (this.status.freeze || this.status.stun) {
      this.anim = 'stagger';
      return;
    }
    if (this.transitionTimer > 0) {
      this.transitionTimer -= dt;
      this.anim = 'roar';
      if (Math.random() < 0.5) {
        game.particles.spawn('spark', this.x + randRange(Math.random, -70, 70), this.y - 40, {
          color: this.def.id === 'dama' ? '#ff9a5c' : this.def.id === 'veil' ? '#c7a4ff' : '#8fd18a',
          speed: 80, life: 0.7, size: 3, additive: true,
        });
      }
      return;
    }

    const ratio = this.hpRatio;
    let targetPhase = 0;
    for (let i = 1; i < this.def.phases.length; i++) {
      if (ratio <= this.def.phases[i]) targetPhase = i;
    }
    if (targetPhase > this.phase) {
      this.phase = targetPhase;
      this.transitionTimer = 1.25;
      this.invuln = 0.9;
      this.state = 'recover';
      this.stateTimer = 1.25;
      this.cooldown = 1.2;
      game.camera.addShake(16);
      game.audio.sfx('boss');
      game.particles.ring(this.x, this.y, { radius: 24, target: 180, color: this.phaseColor(), width: 8, life: 0.9 });
      game.particles.burst(this.x, this.y - 30, 46, { color: this.phaseColor(), speed: 200, life: 1.1, size: 3.4 });
      game.ui.toast(`${this.name} · Fase ${this.phase + 1}`, this.phaseLine(), 'boss');
      return;
    }

    const p = game.player;
    const d = dist(this.x, this.y, p.x, p.y);
    const slow = this.status.slow ? 0.62 : 1;
    this.cooldown = Math.max(0, this.cooldown - dt);
    this.stateTimer -= dt;

    if (this.state === 'windup') {
      this.facing = Math.atan2(p.y - this.y, p.x - this.x);
      this.anim = 'windup';
      if (this.stateTimer <= 0) this.executePattern(game);
      return;
    }
    if (this.state === 'dash') {
      this.updateDash(dt, game);
      return;
    }
    if (this.state === 'recover') {
      this.anim = 'recover';
      if (this.stateTimer <= 0) this.state = 'chase';
      return;
    }

    // Persecución base.
    this.state = 'chase';
    this.facing = Math.atan2(p.y - this.y, p.x - this.x);
    const desired = this.def.range * 0.72;
    if (d > desired) this.moveToward(p.x, p.y, this.speed * slow, dt, game);
    else if (d < desired * 0.45) this.moveToward(this.x - (p.x - this.x), this.y - (p.y - this.y), this.speed * slow * 0.65, dt, game);
    if (this.cooldown <= 0 && d < this.def.aggro * 1.2) this.choosePattern(game, d);
  }

  phaseColor() {
    if (this.id === 'dama') return '#ff9a5c';
    if (this.id === 'veil') return '#c7a4ff';
    return '#8fd18a';
  }
  phaseLine() {
    if (this.id === 'guardian') return this.phase === 1 ? 'El bosque recuerda su furia.' : 'Las raíces se abren.';
    if (this.id === 'dama') return this.phase === 1 ? 'El primer fuego no pide permiso.' : 'La brasa despierta.';
    return ['El Velo te mira.', 'Los reflejos se multiplican.', 'No queda nada que recordar.'][Math.min(2, this.phase)];
  }

  choosePattern(game, d) {
    const pool = this.def.patterns;
    const usable = pool.filter((name, i) => {
      if (this.phase === 0 && (name === 'clones' || name === 'mirrors' || name === 'collapse')) return false;
      return i !== this.patternIndex || pool.length <= 2;
    });
    const pattern = usable[Math.floor(Math.random() * usable.length)] || pool[0];
    this.pattern = pattern;
    this.patternIndex = pool.indexOf(pattern);
    this.state = 'windup';
    this.anim = 'windup';
    const windup = this.windupFor(pattern);
    this.stateTimer = windup;
    this.state = 'windup';
    if (pattern === 'beam' || pattern === 'projectiles' || pattern === 'wave') {
      game.particles.ring(this.x, this.y - 10, { radius: 30, target: 70, color: this.phaseColor(), width: 3, life: windup * 0.9 });
    }
  }

  windupFor(pattern) {
    if (pattern === 'beam' || pattern === 'collapse') return 1.0;
    if (pattern === 'meteors' || pattern === 'wave' || pattern === 'roots') return 0.8;
    if (pattern === 'dash') return 0.55;
    return 0.62;
  }

  executePattern(game) {
    const p = game.player;
    const a = Math.atan2(p.y - this.y, p.x - this.x);
    const color = this.phaseColor();
    switch (this.pattern) {
      case 'roots': {
        for (let i = 0; i < 3; i++) {
          const ang = i === 0 ? 0 : Math.random() * TAU;
          const rad = i === 0 ? 0 : randRange(Math.random, 40, 120);
          game.spawnZone({
            x: p.x + Math.cos(ang) * rad, y: p.y + Math.sin(ang) * rad, radius: 58,
            damage: this.attack * 0.8, life: 2.0, warnTime: 0.75, color: '#8fd18a', type: 'naturaleza',
            status: 'poison', owner: 'enemy',
          });
        }
        game.audio.sfx('spell');
        break;
      }
      case 'sweep': {
        this.facing = a;
        const hit = dist(this.x, this.y, p.x, p.y) < 145 + p.radius && Math.abs(angleDiff(a, Math.atan2(p.y - this.y, p.x - this.x))) < 0.9;
        if (hit) p.takeDamage(this.attack * 1.15, { source: 'enemy', element: 'naturaleza', game });
        game.particles.slash(this.x + Math.cos(a) * 42, this.y + Math.sin(a) * 42 - 16, a, { radius: 125, color, arc: 1.9, width: 16 });
        game.camera.addShake(10);
        game.audio.sfx('heavy');
        break;
      }
      case 'summon': {
        const types = this.id === 'guardian' ? ['musgo', 'wraith'] : this.id === 'dama' ? ['imp', 'salamander'] : ['sentinel', 'seraph'];
        for (let i = 0; i < 2; i++) {
          const ang = Math.random() * TAU;
          const px = this.x + Math.cos(ang) * 95;
          const py = this.y + Math.sin(ang) * 95;
          if (!game.world.circleBlocked(px, py, 14)) {
            game.spawnEnemy(types[i % types.length], px, py, { level: this.level, summoned: true });
            game.particles.burst(px, py - 12, 20, { color, speed: 120, life: 0.8, size: 2.5 });
          }
        }
        game.ui.toast(this.name, 'Invoca a sus servidores.', 'boss');
        break;
      }
      case 'poison': {
        for (let i = 0; i < 2; i++) {
          const ang = Math.random() * TAU;
          game.spawnZone({
            x: this.x + Math.cos(ang) * randRange(Math.random, 50, 130), y: this.y + Math.sin(ang) * randRange(Math.random, 50, 130),
            radius: 46, damage: this.attack * 0.55, life: 3.4, warnTime: 0.5, color: '#8fd18a', type: 'naturaleza', status: 'poison', owner: 'enemy',
          });
        }
        break;
      }
      case 'wave': {
        const count = 14;
        for (let i = 0; i < count; i++) {
          const ang = (i / count) * TAU + Math.random() * 0.08;
          game.spawnProjectile({
            x: this.x + Math.cos(ang) * 30, y: this.y + Math.sin(ang) * 30 - 16,
            vx: Math.cos(ang) * 180, vy: Math.sin(ang) * 180, radius: 8,
            damage: this.attack * 0.65, color: '#ff9a5c', owner: 'enemy', life: 2.4, element: 'fuego',
          });
        }
        game.audio.sfx('fire');
        break;
      }
      case 'meteors': {
        for (let i = 0; i < 4; i++) {
          const ang = Math.random() * TAU;
          const rad = randRange(Math.random, 10, 160);
          game.spawnZone({
            x: p.x + Math.cos(ang) * rad, y: p.y + Math.sin(ang) * rad, radius: 48,
            damage: this.attack * 0.8, life: 2.2, warnTime: 1.0, color: '#ff7b4d', type: 'fuego', owner: 'enemy',
          });
        }
        game.camera.addShake(8);
        game.audio.sfx('thunder');
        break;
      }
      case 'dash': {
        this.state = 'dash';
        this.dashDir = a;
        this.dashTimer = 0.52;
        this.hitPlayerThisDash = false;
        game.audio.sfx('heavy');
        break;
      }
      case 'clones': {
        for (let i = 0; i < 5; i++) {
          const ang = a + (i - 2) * 0.24;
          game.spawnProjectile({
            x: this.x + Math.cos(ang) * 24, y: this.y + Math.sin(ang) * 24 - 18,
            vx: Math.cos(ang) * 260, vy: Math.sin(ang) * 260, radius: 7,
            damage: this.attack * 0.55, color: '#ffd08a', owner: 'enemy', life: 1.9, element: 'fuego', homing: 0.3, target: game.player,
          });
        }
        game.particles.ring(this.x, this.y - 20, { radius: 16, target: 90, color, width: 5, life: 0.5 });
        break;
      }
      case 'projectiles': {
        for (let i = -3; i <= 3; i++) {
          const ang = a + i * 0.17;
          game.spawnProjectile({
            x: this.x + Math.cos(ang) * 34, y: this.y + Math.sin(ang) * 34 - 20,
            vx: Math.cos(ang) * 255, vy: Math.sin(ang) * 255, radius: 8,
            damage: this.attack * 0.62, color: '#c7a4ff', owner: 'enemy', life: 2.4, element: 'luz',
          });
        }
        game.audio.sfx('spell');
        break;
      }
      case 'collapse': {
        game.spawnZone({
          x: this.x, y: this.y, radius: 190, damage: this.attack * 0.85, life: 2.4,
          warnTime: 1.15, color: '#7d6a9e', type: 'sombra', owner: 'enemy',
        });
        game.particles.ring(this.x, this.y, { radius: 30, target: 200, color, width: 7, life: 1.2 });
        game.audio.sfx('boss');
        break;
      }
      case 'mirrors': {
        const count = 4;
        for (let i = 0; i < count; i++) {
          const ang = (i / count) * TAU + this.animTime;
          game.spawnProjectile({
            x: this.x + Math.cos(ang) * 70, y: this.y + Math.sin(ang) * 70 - 20,
            vx: 0, vy: 0, radius: 7, damage: this.attack * 0.5, color: '#c7a4ff',
            owner: 'enemy', life: 2.6, element: 'luz', homing: 0.5, target: game.player,
          });
        }
        break;
      }
      case 'beam': {
        this.facing = a;
        const hit = this.lineHits(p, a, 460, 24);
        game.particles.beam(this.x, this.y - 24, a, { radius: 460, color, width: 18, life: 0.35 });
        game.particles.beam(this.x, this.y - 24, a, { radius: 460, color: '#fff3c4', width: 6, life: 0.35 });
        if (hit) p.takeDamage(this.attack * 1.25, { source: 'enemy', element: 'luz', game });
        game.camera.addShake(12);
        game.audio.sfx('spell');
        break;
      }
      default: break;
    }
    this.state = 'recover';
    this.stateTimer = this.pattern === 'dash' ? 0.5 : 0.75;
    this.cooldown = this.phase === 0 ? 2.1 : this.phase === 1 ? 1.65 : 1.3;
    this.pattern = null;
  }

  lineHits(p, angle, length, width) {
    const dx = p.x - this.x, dy = p.y - this.y;
    const proj = dx * Math.cos(angle) + dy * Math.sin(angle);
    if (proj < 0 || proj > length) return false;
    const perp = Math.abs(-dx * Math.sin(angle) + dy * Math.cos(angle));
    return perp < width + p.radius;
  }

  updateDash(dt, game) {
    this.dashTimer -= dt;
    this.anim = 'dash';
    const speed = 520;
    const moved = game.world.moveCircle(this.x, this.y, Math.cos(this.dashDir) * speed * dt, Math.sin(this.dashDir) * speed * dt, this.radius);
    this.x = moved.x; this.y = moved.y;
    if (Math.random() < 0.8) {
      game.particles.spawn('smoke', this.x, this.y, {
        color: this.phaseColor(), size: 8, life: 0.45, speed: 20, additive: false,
      });
    }
    const p = game.player;
    if (!this.hitPlayerThisDash && dist(this.x, this.y, p.x, p.y) < this.radius + p.radius + 10) {
      this.hitPlayerThisDash = true;
      p.takeDamage(this.attack * 1.2, { source: 'enemy', game });
      game.camera.addShake(12);
    }
    if (this.dashTimer <= 0) {
      this.state = 'recover';
      this.stateTimer = 0.6;
      this.cooldown = 1.5;
      game.camera.addShake(7);
    }
  }

  moveToward(tx, ty, speed, dt, game) {
    const dx = tx - this.x, dy = ty - this.y;
    const d = Math.hypot(dx, dy);
    if (d < 1) return;
    const moved = game.world.moveCircle(this.x, this.y, (dx / d) * speed * dt, (dy / d) * speed * dt, this.radius);
    this.x = moved.x; this.y = moved.y;
    this.anim = 'walk';
  }

  takeDamage(amount, { source = 'player', crit = false, element = null, game = this.game } = {}) {
    if (this.dead || this.invuln > 0) return false;
    const mark = this.status.mark ? 1.2 : 1;
    const defense = this.defense / (this.defense + 110);
    const dmg = Math.max(1, Math.round(amount * (1 - defense) * mark));
    this.hp -= dmg;
    this.flash = 0.1;
    if (dmg > this.maxHp * 0.06) {
      this.stateTimer = Math.max(0, this.stateTimer - 0.04);
      game.particles.burst(this.x, this.y - this.radius, 6, { color: this.phaseColor(), speed: 90, life: 0.4, size: 2 });
    }
    if (this.hp <= 0) this.die(game);
    return true;
  }

  applyStatus(type, duration, game) {
    if (type === 'freeze' || type === 'stun') {
      this.status[type] = Math.max(this.status[type] || 0, duration * 0.35);
      return;
    }
    this.status[type] = Math.max(this.status[type] || 0, duration * 0.7);
  }

  stagger(duration, game) {
    if (this.invuln > 0) return;
    this.state = 'recover';
    this.stateTimer = Math.max(this.stateTimer, duration * 0.6);
  }

  die(game) {
    if (this.dead) return;
    this.dead = true;
    this.state = 'dead';
    this.deathTime = 0;
    this.hp = 0;
    game.particles.burst(this.x, this.y - 30, 90, { color: this.phaseColor(), speed: 230, life: 1.6, size: 4 });
    game.particles.ring(this.x, this.y, { radius: 20, target: 260, color: this.phaseColor(), width: 12, life: 1.2 });
    game.particles.ring(this.x, this.y, { radius: 20, target: 160, color: '#fff3c4', width: 5, life: 0.9 });
    game.camera.addShake(26);
    game.audio.sfx('death');
    game.onBossDefeated(this);
  }
}
