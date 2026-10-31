import { clamp, angleTo, dist, norm, rand, chance, rgba, lerp } from '../core/utils.js';
import { canStand } from '../world/regions.js';
import { drawEnemy, drawCreature } from '../art/characters.js';

export class Enemy {
  constructor(data, x, y, opts = {}) {
    this.data = data;
    this.typeId = data.id;
    this.name = data.name;
    this.x = x; this.y = y;
    this.homeX = x; this.homeY = y;
    this.radius = data.radius || 18;
    this.level = data.level || 1;
    this.maxHp = Math.round((data.hp || 50) * (opts.elite ? 1.7 : 1) * (opts.hpScale || 1));
    this.hp = this.maxHp;
    this.damage = Math.round((data.damage || 8) * (opts.elite ? 1.3 : 1));
    this.speed = data.speed || 90;
    this.xp = Math.round((data.xp || 20) * (opts.elite ? 1.6 : 1));
    this.gold = Math.round((data.gold || 5) * (opts.elite ? 2 : 1));
    this.elite = !!opts.elite;
    this.scale = data.scale || 1;
    this.draw = data.draw;
    this.palette = data.palette;
    this.creatureId = data.creature || null;
    this.tameChance = data.tame || 0;
    this.boss = !!data.boss;
    this.state = 'idle';
    this.stateTime = 0;
    this.attackCooldown = rand(.4, 1.2);
    this.facing = 'down';
    this.moving = false;
    this.seed = Math.random() * 10;
    this.hurtFlash = 0;
    this.stun = 0;
    this.burn = 0;
    this.burnDps = 0;
    this.slow = 0;
    this.marked = 0;
    this.dead = false;
    this.aggro = false;
    this.stuck = 0;
    this.phase = 1;
    this.patternIndex = 0;
    this.patternTimer = rand(1.2, 2.4);
    this.vx = 0; this.vy = 0;
    this.spawnerId = opts.spawnerId || null;
    this.arena = opts.arena || null;
    this.resonanceFailed = false;
    this.resonanceAttempted = false;
    this.glowTime = 0;
    this.projectileType = data.projectile || 'orb';
    this.showName = false;
  }
  get creatureAvailable() {
    return this.creatureId && !this.boss && this.hp > 0;
  }
  update(dt, game) {
    if (this.dead) return;
    const player = game.player;
    this.hurtFlash = Math.max(0, this.hurtFlash - dt * 3);
    this.glowTime += dt;
    if (this.marked > 0) this.marked -= dt;
    if (this.slow > 0) this.slow -= dt;
    if (this.burn > 0) {
      this.burn -= dt;
      this.hp -= this.burnDps * dt;
      if (Math.random() < dt * 7) game.effects.spawn(this.x + rand(-12, 12), this.y - rand(10, 40), { color: '#ff9a48', life: .45, size: rand(2, 4), vy: -30 });
      if (this.hp <= 0) { this.die(game); return; }
    }
    if (this.stun > 0) {
      this.stun -= dt;
      this.state = 'stun';
      this.moving = false;
      return;
    }
    const d = dist(this.x, this.y, player.x, player.y);
    if (!this.aggro && d < (this.boss ? 520 : 360)) this.aggro = true;
    if (this.aggro && !this.boss && dist(this.x, this.y, this.homeX, this.homeY) > 900 && d > 500) {
      this.aggro = false; this.state = 'idle';
    }
    this.stateTime += dt;
    this.attackCooldown -= dt;
    if (this.state === 'idle') {
      this.moving = false;
      if (this.aggro && d < 900) this.setState('chase');
      else {
        // slight idle wander
        if (Math.random() < dt * .15) {
          const a = rand(0, 6.28);
          const nx = this.homeX + Math.cos(a) * 30, ny = this.homeY + Math.sin(a) * 30;
          if (canStand(game.region, nx, ny, this.radius)) { this.x = nx; this.y = ny; }
        }
      }
      return;
    }
    if (this.boss) { this.updateBoss(dt, game, d); return; }
    const dx = player.x - this.x, dy = player.y - this.y;
    const n = norm(dx, dy);
    this.faceTo(dx, dy);
    switch (this.data.ai) {
      case 'chaser': {
        if (this.state === 'chase') {
          if (d > (this.data.range || 48) * .8) this.move(n.x, n.y, this.speed * (this.slow > 0 ? .55 : 1), dt, game);
          else this.moving = false;
          if (d < (this.data.range || 48) + 16 && this.attackCooldown <= 0) this.beginWindup(game);
        } else if (this.state === 'windup') {
          this.moving = false;
          if (this.stateTime >= (this.data.windup || .35)) this.executeMelee(game, d);
        } else if (this.state === 'recover') {
          this.moving = false;
          if (this.stateTime >= (this.data.recover || .5)) { this.setState('chase'); this.attackCooldown = rand(.3, .8); }
        }
        break;
      }
      case 'brute': {
        if (this.state === 'chase') {
          if (d > 55) this.move(n.x, n.y, this.speed * (this.slow > 0 ? .55 : 1), dt, game);
          else this.moving = false;
          if (d < 90 && this.attackCooldown <= 0) this.beginWindup(game);
        } else if (this.state === 'windup') {
          this.moving = false;
          if (this.stateTime >= (this.data.windup || .6)) {
            this.executeSlam(game);
          }
        } else if (this.state === 'recover') {
          if (this.stateTime >= (this.data.recover || .7)) { this.setState('chase'); this.attackCooldown = rand(.6, 1.3); }
        }
        break;
      }
      case 'ranged': {
        const range = this.data.range || 230;
        if (this.state === 'chase') {
          if (d < range * .6) this.move(-n.x, -n.y, this.speed * .8, dt, game);
          else if (d > range) this.move(n.x, n.y, this.speed, dt, game);
          else this.moving = false;
          if (d < range + 40 && this.attackCooldown <= 0 && d > 80) this.beginWindup(game);
        } else if (this.state === 'windup') {
          this.moving = false;
          if (this.stateTime >= (this.data.windup || .5)) {
            this.executeRanged(game, n);
          }
        } else if (this.state === 'recover') {
          if (this.stateTime >= (this.data.recover || .7)) { this.setState('chase'); this.attackCooldown = rand(.9, 1.7); }
        }
        break;
      }
      case 'charger': {
        if (this.state === 'chase') {
          if (d > 100) this.move(n.x, n.y, this.speed, dt, game);
          else this.moving = false;
          if (d < 320 && this.attackCooldown <= 0) {
            this.setState('windup');
            this.chargeDir = { ...n };
            game.telegraphLine(this.x, this.y, this.x + n.x * 260, this.y + n.y * 260, .55, '#b8a0ff');
          }
        } else if (this.state === 'windup') {
          this.moving = false;
          if (this.stateTime >= .55) { this.setState('charge'); this.chargeTime = .38; }
        } else if (this.state === 'charge') {
          this.chargeTime -= dt;
          this.moving = true;
          this.x += this.chargeDir.x * 640 * dt;
          this.y += this.chargeDir.y * 640 * dt;
          if (dist(this.x, this.y, player.x, player.y) < this.radius + player.radius + 10) {
            player.takeDamage(this.damage * 1.1, game, this);
            this.chargeTime = 0;
          }
          if (this.chargeTime <= 0) { this.setState('recover'); this.attackCooldown = 1.8; }
        } else if (this.state === 'recover') {
          if (this.stateTime >= .5) this.setState('chase');
        }
        break;
      }
      case 'flyer': {
        if (this.state === 'chase') {
          if (d > 70) this.move(n.x, n.y, this.speed * .9, dt, game, true);
          else this.moving = false;
          if (d < 330 && this.attackCooldown <= 0) { this.setState('windup'); }
        } else if (this.state === 'windup') {
          this.moving = false;
          this.diveDir = { ...n };
          if (this.stateTime >= .42) { this.setState('charge'); this.chargeTime = .34; }
        } else if (this.state === 'charge') {
          this.chargeTime -= dt;
          this.moving = true;
          this.x += this.diveDir.x * 580 * dt;
          this.y += this.diveDir.y * 580 * dt;
          if (dist(this.x, this.y, player.x, player.y) < this.radius + player.radius + 12) { player.takeDamage(this.damage, game, this); this.chargeTime = 0; }
          if (this.chargeTime <= 0) { this.setState('recover'); this.attackCooldown = 2; }
        } else if (this.state === 'recover') {
          if (this.stateTime >= .6) this.setState('chase');
        }
        break;
      }
    }
    // keep inside region
    this.x = clamp(this.x, 20, game.region.widthPx - 20);
    this.y = clamp(this.y, 20, game.region.heightPx - 20);
  }
  updateBoss(dt, game, d) {
    const player = game.player;
    const dx = player.x - this.x, dy = player.y - this.y;
    const n = norm(dx, dy);
    this.faceTo(dx, dy);
    if (this.hp / this.maxHp < .55 && this.phase === 1) {
      this.phase = 2;
      this.patternTimer = .7;
      game.bossPhase(this);
    }
    if (this.state === 'windup') {
      this.moving = false;
      if (this.stateTime >= this.currentWindup) { this.executeBossAttack(game, n, d); }
      return;
    }
    if (this.state === 'recover') {
      this.moving = false;
      if (this.stateTime >= this.currentRecover) { this.setState('chase'); this.patternTimer = rand(.5, 1.4) * (this.phase === 2 ? .7 : 1); }
      return;
    }
    this.patternTimer -= dt;
    if (this.patternTimer <= 0) {
      this.chooseBossAttack(game, d);
      return;
    }
    // reposition
    const ideal = this.data.draw === 'seraphine' ? 200 : 80;
    if (d > ideal + 40) this.move(n.x, n.y, this.speed * (this.phase === 2 ? 1.1 : 1), dt, game, this.data.draw === 'guardian' || this.data.draw === 'seraphine');
    else if (d < ideal - 50) this.move(-n.x, -n.y, this.speed * .6, dt, game, true);
    else this.moving = false;
    if (this.data.draw === 'knight' && this.attackCooldown <= 0 && d < 140) {
      this.beginBossWindup(.35, 1.1, 'slash');
    }
  }
  chooseBossAttack(game, d) {
    const id = this.data.id;
    this.patternIndex++;
    if (id === 'guardian_espectral') {
      const pick = this.patternIndex % 3;
      if (pick === 0) {
        this.beginBossWindup(.7, 1, 'roots');
        for (let i = 0; i < (this.phase === 2 ? 4 : 3); i++) {
          const a = rand(0, 6.28), r = rand(40, 150);
          game.telegraphCircle(game.player.x + Math.cos(a) * r, game.player.y + Math.sin(a) * r, 56, .9, '#8fe0c8');
        }
      } else if (pick === 1) {
        this.beginBossWindup(.55, .8, 'summon');
      } else {
        this.beginBossWindup(.6, 1, 'sweep');
      }
    } else if (id === 'kael') {
      const pick = this.patternIndex % 3;
      if (pick === 0) this.beginBossWindup(.4, .8, 'dash');
      else if (pick === 1) this.beginBossWindup(.35, .7, 'combo');
      else { this.beginBossWindup(.5, 1, 'wave'); game.telegraphLine(this.x, this.y, game.player.x, game.player.y, .5, '#b8a8ff'); }
    } else if (id === 'malachar') {
      const pick = this.patternIndex % 4;
      if (pick === 0) {
        this.beginBossWindup(.75, 1.2, 'ring');
        for (let i = 0; i < 12; i++) { const a = i / 12 * 6.28; game.telegraphCircle(this.x + Math.cos(a) * 110, this.y + Math.sin(a) * 90, 34, .9, '#ff8a3e'); }
      } else if (pick === 1) {
        this.beginBossWindup(.55, .9, 'charge');
      } else if (pick === 2) {
        this.beginBossWindup(.7, 1.1, 'pools');
        for (let i = 0; i < 3; i++) game.telegraphCircle(game.player.x + rand(-90, 90), game.player.y + rand(-90, 90), 60, 1, '#ff6a30');
      } else this.beginBossWindup(.6, 1, 'summon');
    } else if (id === 'coro_absoluto') {
      const pick = this.patternIndex % 4;
      if (pick === 0) {
        this.beginBossWindup(.7, 1.2, 'orbs');
      } else if (pick === 1) {
        this.beginBossWindup(.55, .9, 'beam');
        game.telegraphLine(this.x, this.y, game.player.x, game.player.y, .8, '#fff2c0', 34);
      } else if (pick === 2) {
        this.beginBossWindup(.75, 1.1, 'convergence');
        for (let i = 0; i < 10; i++) { const a = i / 10 * 6.28; game.telegraphCircle(this.x + Math.cos(a) * 140, this.y + Math.sin(a) * 120, 42, 1.1, '#ffe8a0'); }
      } else this.beginBossWindup(.6, 1, 'summon');
    }
  }
  beginBossWindup(windup, recover, attack) {
    this.setState('windup');
    this.currentWindup = windup;
    this.currentRecover = recover;
    this.currentBossAttack = attack;
  }
  executeBossAttack(game, n, d) {
    const p = game.player;
    const id = this.data.id;
    const atk = this.currentBossAttack;
    this.setState('recover');
    this.attackCooldown = .8;
    if (atk === 'roots') {
      for (let i = 0; i < (this.phase === 2 ? 5 : 4); i++) {
        const a = rand(0, 6.28), r = rand(30, 160);
        const tx = p.x + Math.cos(a) * r, ty = p.y + Math.sin(a) * r;
        game.groundSpike(tx, ty, 40, 26, '#8fe0c8', () => { if (dist(p.x, p.y, tx, ty) < 70) p.takeDamage(18, game, this); });
      }
      game.audio.sfx('pulse');
    } else if (atk === 'summon') {
      const minions = this.phase === 2 ? 3 : 2;
      for (let i = 0; i < minions; i++) {
        const a = i / minions * 6.28;
        const type = id === 'guardian_espectral' ? 'espectro_lumen' : id === 'malachar' ? 'demonio_forja' : 'centinela_celeste';
        game.spawnEnemy(type, this.x + Math.cos(a) * 80, this.y + Math.sin(a) * 80, { summoned: true });
      }
      game.audio.sfx('magic');
    } else if (atk === 'sweep') {
      game.bossSweep(this, 180, 34);
      game.audio.sfx('swing', .6);
    } else if (atk === 'dash') {
      this.dashTarget = { x: p.x, y: p.y };
      this.dashTime = .3;
      this.setState('dash');
      game.telegraphLine(this.x, this.y, p.x, p.y, .4, '#b8a8ff');
      game.audio.sfx('dash');
    } else if (atk === 'combo') {
      if (d < 150) p.takeDamage(this.damage * 1.2, game, this);
      game.spawnSlash(this.x, this.y - 20, angleTo(this.x, this.y, p.x, p.y), 3, '#b8a8ff');
      game.camera.shake(4, .12);
      if (this.phase === 2 && d < 190) setTimeout(() => { if (!this.dead) p.takeDamage(this.damage * .8, game, this); }, 220);
      game.audio.sfx('swing');
    } else if (atk === 'wave') {
      const a = angleTo(this.x, this.y, p.x, p.y);
      game.spawnEnemyProjectile(this, this.x, this.y - 30, Math.cos(a) * 320, Math.sin(a) * 320, { damage: 22, type: 'void', size: 18, pierce: true, range: 1.4 });
      game.audio.sfx('magic');
    } else if (atk === 'ring') {
      for (let i = 0; i < 12; i++) {
        const a = i / 12 * 6.28;
        game.spawnEnemyProjectile(this, this.x + Math.cos(a) * 40, this.y + Math.sin(a) * 30, Math.cos(a) * 250, Math.sin(a) * 250, { damage: 18, type: 'fire', size: 13, range: 1.6 });
      }
      game.audio.sfx('roar');
    } else if (atk === 'charge') {
      this.dashTarget = { x: p.x, y: p.y };
      this.dashTime = .45;
      this.setState('dash');
      game.telegraphLine(this.x, this.y, p.x, p.y, .5, '#ff8a3e', 26);
    } else if (atk === 'pools') {
      for (let i = 0; i < 4; i++) {
        const tx = p.x + rand(-100, 100), ty = p.y + rand(-100, 100);
        game.hazardPool(tx, ty, 70, 5, 10, '#ff6a30');
      }
      game.audio.sfx('pulse');
    } else if (atk === 'orbs') {
      const count = this.phase === 2 ? 14 : 9;
      for (let i = 0; i < count; i++) {
        const a = i / count * 6.28 + timeOffset(this);
        game.spawnEnemyProjectile(this, this.x, this.y - 40, Math.cos(a) * 210, Math.sin(a) * 210, { damage: 17, type: 'light', size: 11, range: 2.2 });
      }
      game.audio.sfx('magic');
    } else if (atk === 'beam') {
      const a = angleTo(this.x, this.y, p.x, p.y);
      game.lightBeam(this.x, this.y - 40, a, 700, 40, '#fff2c0', () => p.takeDamage(36, game, this));
      game.audio.sfx('roar');
    } else if (atk === 'convergence') {
      for (let i = 0; i < 10; i++) {
        const a = i / 10 * 6.28 + rand(-.1, .1);
        game.lightBeam(this.x, this.y - 40, a, 340, 16, '#ffe8a0', () => { if (dist(p.x, p.y, this.x, this.y) < 340) p.takeDamage(20, game, this); });
      }
      game.audio.sfx('pulse');
    }
  }
  faceTo(dx, dy) {
    if (Math.abs(dx) > Math.abs(dy)) this.facing = dx > 0 ? 'right' : 'left';
    else this.facing = dy > 0 ? 'down' : 'up';
  }
  move(nx, ny, speed, dt, game, flying = false) {
    this.moving = true;
    const s = speed * (this.slow > 0 ? .55 : 1);
    const tx = this.x + nx * s * dt, ty = this.y + ny * s * dt;
    if (flying || canStand(game.region, tx, this.y, this.radius * .7)) this.x = tx;
    else if (canStand(game.region, this.x + nx * s * dt, this.y, this.radius)) this.x = tx;
    if (flying || canStand(game.region, this.x, ty, this.radius * .7)) this.y = ty;
  }
  setState(s) { this.state = s; this.stateTime = 0; }
  beginWindup(game) {
    this.setState('windup');
    this.currentWindup = this.data.windup || .35;
    if (this.data.ai === 'brute') game.telegraphCircle(this.x, this.y, 100, this.currentWindup, '#ffb06a');
    else if (this.data.ai === 'ranged') game.telegraphLine(this.x, this.y, game.player.x, game.player.y, this.currentWindup, '#ffb06a');
  }
  executeMelee(game, d) {
    const player = game.player;
    this.setState('recover');
    this.attackCooldown = rand(.9, 1.6);
    if (dist(this.x, this.y, player.x, player.y) < (this.data.range || 50) + 26) {
      player.takeDamage(this.damage, game, this);
    }
    game.spawnSlash(this.x, this.y - 18, angleTo(this.x, this.y, player.x, player.y), 1, this.palette?.[2] || '#ffb06a', .8);
    game.audio.sfx('swing', .7);
  }
  executeSlam(game) {
    this.setState('recover');
    this.attackCooldown = rand(1.5, 2.2);
    const radius = 105;
    game.burst(this.x, this.y, '#d8b080', 18, 130);
    game.camera.shake(6, .2);
    if (dist(this.x, this.y, game.player.x, game.player.y) < radius) game.player.takeDamage(this.damage * 1.25, game, this);
    game.groundRing(this.x, this.y - 8, radius, '#d8b080', .4);
    game.audio.sfx('hit');
  }
  executeRanged(game, n) {
    this.setState('recover');
    this.attackCooldown = rand(1.3, 2.1);
    const angle = angleTo(this.x, this.y - 20, game.player.x, game.player.y);
    const speed = this.data.projectile === 'fire' ? 270 : 240;
    game.spawnEnemyProjectile(this, this.x, this.y - 28, Math.cos(angle) * speed, Math.sin(angle) * speed, {
      damage: this.damage, type: this.projectileType, size: this.data.projectile === 'fire' ? 14 : 10, range: 2.5
    });
    game.audio.sfx('magic');
  }
  dashUpdate(dt, game) {
    if (this.state !== 'dash') return;
    this.dashTime -= dt;
    const dx = this.dashTarget.x - this.x, dy = this.dashTarget.y - this.y;
    const n = norm(dx, dy);
    this.x += n.x * 720 * dt; this.y += n.y * 720 * dt;
    this.moving = true;
    game.effects.spawn(this.x, this.y - 20, { color: this.palette?.[2] || '#b8a0ff', life: .3, size: 8, vx: rand(-20, 20), vy: rand(-20, 20) });
    if (dist(this.x, this.y, game.player.x, game.player.y) < this.radius + 34) {
      game.player.takeDamage(this.damage * 1.2, game, this);
      this.dashTime = 0;
    }
    if (this.dashTime <= 0) { this.setState('recover'); this.currentRecover = .45; }
  }
  takeDamage(raw, game, opts = {}) {
    if (this.dead) return 0;
    let dmg = raw;
    if (this.marked > 0) dmg *= 1.25;
    if (this.elite) dmg *= .92;
    dmg = Math.max(1, Math.round(dmg));
    this.hp -= dmg;
    this.hurtFlash = 1;
    this.aggro = true;
    if (this.state === 'idle') this.setState('chase');
    const crit = opts.crit;
    game.floatingText(this.x + rand(-8, 8), this.y - (this.boss ? 90 : 40), `${crit ? '¡' : ''}${dmg}${crit ? '!' : ''}`, crit ? '#ffe6a0' : '#fff0d0', crit ? 1.35 : 1);
    game.effects.spawn(this.x, this.y - 25, { color: crit ? '#ffe6a0' : '#ffd0a0', life: .35, size: crit ? 5 : 3, count: 4, vy: -60 });
    if (opts.knockback) {
      const a = opts.angle ?? angleTo(game.player.x, game.player.y, this.x, this.y);
      this.x += Math.cos(a) * opts.knockback; this.y += Math.sin(a) * opts.knockback;
      if (!canStand(game.region, this.x, this.y, this.radius)) { this.x -= Math.cos(a) * opts.knockback; this.y -= Math.sin(a) * opts.knockback; }
    }
    if (this.burn > 0 && opts.element === 'fire') this.burn = Math.max(this.burn, 2);
    if (this.hp <= 0) this.die(game);
    return dmg;
  }
  applyBurn(dps, time) { this.burn = Math.max(this.burn, time); this.burnDps = Math.max(this.burnDps, dps); }
  stunHit(seconds, game) { if (this.boss) seconds *= .45; this.stun = Math.max(this.stun, seconds); this.state = 'stun'; this.stateTime = 0; this.moving = false; game?.floatingText(this.x, this.y - 30, 'ATURDIDO', '#a8c8ff'); }
  heal(amount) { this.hp = Math.min(this.maxHp, this.hp + amount); }
  die(game) {
    if (this.dead) return;
    this.dead = true;
    this.hp = 0;
    game.onEnemyDeath(this);
  }
  draw(ctx, cam, time) {
    drawEnemy(ctx, this, cam, time);
    if (this.state === 'windup') {
      const p = clamp(this.stateTime / (this.currentWindup || this.data.windup || .5));
      ctx.fillStyle = 'rgba(255,120,80,.8)';
      ctx.beginPath(); ctx.arc(this.x - cam.x, this.y - (this.boss ? 110 : 58), 5, -1.57, -1.57 + p * 6.28); ctx.strokeStyle = '#ff9a6a'; ctx.lineWidth = 2; ctx.stroke();
    }
    if (this.stun > 0) {
      for (let i = 0; i < 3; i++) {
        const a = time * 4 + i * 2.1;
        ctx.fillStyle = '#ffe6a0';
        ctx.beginPath(); ctx.arc(this.x - cam.x + Math.cos(a) * 18, this.y - cam.y - (this.boss ? 100 : 55) + Math.sin(a) * 5, 2, 0, 6.3); ctx.fill();
      }
    }
  }
}

function timeOffset(e) { return (e.seed || 0) * .3; }

export class Projectile {
  constructor(x, y, vx, vy, opts = {}) {
    this.x = x; this.y = y; this.vx = vx; this.vy = vy;
    this.owner = opts.owner || 'enemy';
    this.damage = opts.damage || 10;
    this.size = opts.size || 10;
    this.life = opts.life || 2.5;
    this.maxLife = this.life;
    this.type = opts.type || 'orb';
    this.color = opts.color || '#ffb060';
    this.pierce = !!opts.pierce;
    this.homing = opts.homing || 0;
    this.target = opts.target || null;
    this.dead = false;
    this.radius = opts.radius || this.size;
    this.width = opts.width || 0;
    this.angle = Math.atan2(vy, vx);
    this.hitSet = new Set();
    this.trail = [];
    this.source = opts.source || null;
    this.onHit = opts.onHit || null;
    this.knockback = opts.knockback || 0;
    this.element = opts.element || null;
    this.spin = 0;
  }
  update(dt, game) {
    if (this.dead) return;
    this.life -= dt;
    if (this.life <= 0) { this.dead = true; return; }
    if (this.homing && this.target && !this.target.dead) {
      const a = angleTo(this.x, this.y, this.target.x, this.target.y);
      const speed = Math.hypot(this.vx, this.vy);
      this.vx = lerp(this.vx, Math.cos(a) * speed, dt * this.homing);
      this.vy = lerp(this.vy, Math.sin(a) * speed, dt * this.homing);
    }
    this.angle = Math.atan2(this.vy, this.vx);
    this.x += this.vx * dt; this.y += this.vy * dt;
    this.trail.push({ x: this.x, y: this.y, life: .25 });
    if (this.trail.length > 12) this.trail.shift();
    for (const t of this.trail) t.life -= dt;
    this.spin += dt * 7;
    if (this.owner === 'player') {
      for (const e of game.enemies) {
        if (e.dead || this.hitSet.has(e)) continue;
        if (dist(this.x, this.y, e.x, e.y) < this.size + e.radius) {
          e.takeDamage(this.damage, game, { crit: this.crit, knockback: this.knockback, angle: this.angle, element: this.element });
          this.hitSet.add(e);
          game.burst(this.x, this.y, this.color, 8, 100);
          if (this.onHit) this.onHit(e, game);
          if (!this.pierce) { this.dead = true; break; }
        }
      }
    } else {
      const p = game.player;
      if (dist(this.x, this.y, p.x, p.y - 18) < this.size + p.radius) {
        const dmg = p.takeDamage(this.damage, game, this.source || this);
        if (this.onHit) this.onHit(p, game);
        if (this.type === 'void') p.slowTimer = 1.5;
        this.dead = true;
      }
      if (this.onHit && this.type === 'light' && !this.dead) {
        // light orbs only hit once
      }
    }
    // collide walls for non-ghost
    if (!this.ghost && !this.pierce) {
      const { tileSolidAt } = game.regionModule;
      if (tileSolidAt(game.region, this.x, this.y)) {
        this.dead = true;
        game.burst(this.x, this.y, this.color, 6, 80);
      }
    }
  }
  draw(ctx, cam, time) {
    const x = this.x - cam.x, y = this.y - cam.y;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const g = ctx.createRadialGradient(x, y, 1, x, y, this.size * 2.6);
    g.addColorStop(0, rgba(this.color, .9)); g.addColorStop(.4, rgba(this.color, .45)); g.addColorStop(1, rgba(this.color, 0));
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, this.size * 2.6, 0, 6.3); ctx.fill();
    ctx.restore();
    if (this.type === 'fire') {
      ctx.fillStyle = '#ffd28a'; ctx.beginPath(); ctx.arc(x, y, this.size * .55, 0, 6.3); ctx.fill();
      ctx.fillStyle = '#ff7a3e'; ctx.beginPath(); ctx.arc(x + Math.cos(time * 9) * 2, y + Math.sin(time * 11) * 2, this.size * .4, 0, 6.3); ctx.fill();
    } else if (this.type === 'light') {
      ctx.save(); ctx.translate(x, y); ctx.rotate(time * 2);
      ctx.strokeStyle = '#fff8d8'; ctx.lineWidth = 1.5;
      for (let i = 0; i < 4; i++) { ctx.rotate(Math.PI / 2); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(this.size * 1.3, 0); ctx.stroke(); }
      ctx.restore();
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(x, y, this.size * .45, 0, 6.3); ctx.fill();
    } else if (this.type === 'void') {
      ctx.fillStyle = '#b8a0ff'; ctx.beginPath(); ctx.arc(x, y, this.size * .5, 0, 6.3); ctx.fill();
      ctx.strokeStyle = 'rgba(180,160,255,.5)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(x, y, this.size, 0, 6.3); ctx.stroke();
    } else {
      ctx.fillStyle = this.owner === 'player' ? '#c8ecff' : '#ffd8a0';
      ctx.beginPath(); ctx.arc(x, y, this.size * .45, 0, 6.3); ctx.fill();
    }
    // trail
    for (const t of this.trail) {
      if (t.life <= 0) continue;
      ctx.fillStyle = rgba(this.color, t.life * 1.2);
      ctx.beginPath(); ctx.arc(t.x - cam.x, t.y - cam.y, this.size * .35 * t.life * 4, 0, 6.3); ctx.fill();
    }
  }
}

export class SwordWave extends Projectile {
  constructor(x, y, angle, damage, color = '#ffe6a0') {
    super(x, y, Math.cos(angle) * 620, Math.sin(angle) * 620, {
      owner: 'player', damage, type: 'wave', size: 30, color, pierce: true, life: .8, knockback: 8
    });
    this.angle = angle;
    this.ghost = true;
  }
  draw(ctx, cam, time) {
    const x = this.x - cam.x, y = this.y - cam.y;
    ctx.save(); ctx.translate(x, y); ctx.rotate(this.angle);
    const a = clamp(this.life / .8);
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 3; i++) {
      ctx.strokeStyle = rgba(this.color, .55 * a * (1 - i * .2));
      ctx.lineWidth = 8 - i * 2;
      ctx.beginPath(); ctx.arc(-10, 0, 34 + i * 10, -1.05, 1.05); ctx.stroke();
    }
    ctx.restore();
  }
}

export class Companion {
  constructor(player) {
    this.player = player;
    this.x = player.x - 40; this.y = player.y + 20;
    this.radius = 12;
    this.attackTimer = 1.4;
    this.dead = false;
    this.hp = 100; this.maxHp = 100;
    this.bob = 0;
    this.flip = false;
    this.visible = true;
  }
  update(dt, game) {
    const p = game.player;
    if (!p.activeCreature) { this.visible = false; return; }
    this.visible = true;
    const targetX = p.x - 46 * (p.facing === 'right' ? 1 : -1);
    const targetY = p.y + 8;
    const d = dist(this.x, this.y, targetX, targetY);
    if (d > 380) { this.x = targetX; this.y = targetY; }
    else {
      this.x = lerp(this.x, targetX, 1 - Math.exp(-6 * dt));
      this.y = lerp(this.y, targetY, 1 - Math.exp(-6 * dt));
    }
    this.flip = this.x > p.x;
    this.attackTimer -= dt;
    if (this.attackTimer <= 0) {
      const near = game.enemies.filter(e => !e.dead && dist(this.x, this.y, e.x, e.y) < 260).sort((a, b) => dist(this.x, this.y, a.x, a.y) - dist(this.x, this.y, b.x, b.y))[0];
      if (near) {
        this.attackTimer = 2.3;
        const c = CREATURES[p.activeCreature];
        const a = angleTo(this.x, this.y, near.x, near.y);
        const dmg = 6 + p.level * 2.2 + (c?.power || 1) * 8;
        game.projectiles.push(new Projectile(this.x, this.y - 18, Math.cos(a) * 330, Math.sin(a) * 330, {
          owner: 'player', damage: dmg, type: 'creature', color: c?.palette?.[0] || '#a8d8ff', size: 7,
          homing: 2.4, target: near, life: 1.6
        }));
        game.audio.sfx('magic', 1.4);
      } else this.attackTimer = .5;
    }
  }
  draw(ctx, cam, time) {
    if (!this.visible || !this.player.activeCreature) return;
    drawCreature(ctx, this.player.activeCreature, this.x - cam.x, this.y - cam.y + Math.sin(time * 2) * 2, .8, time + 1, { flip: this.flip, seed: 3 });
  }
}
