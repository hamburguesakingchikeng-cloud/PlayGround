// Simulation: the survivor run, its hordes, and all of its loot.

import {
  BOONS, ENEMY_TYPES, SPAWN_TABLE, WAVE_LABELS, RUN_DURATION, BOSS_TIME,
  INVENTORY_SIZE, RARITIES, SLOT_LABEL
} from './data.js';
import {
  RNG, generateItem, aggregateEquipment, emptyStats, makeStarterWeapon,
  itemPowerLabel
} from './loot.js';

const ARENA = 1280;
const CELL = 72;
const MAX_ENEMIES = 280;
const MAX_GROUND_ITEMS = 48;

const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
const dist2 = (a, b, c, d) => (a - c) * (a - c) + (b - d) * (b - d);
const TAU = Math.PI * 2;

function shuffle(rng, list) {
  const out = [...list];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng.next() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export class Game {
  constructor({ audio, events = {} } = {}) {
    this.audio = audio;
    this.events = events;
    this.rng = new RNG(Date.now());
    this.viewport = { w: window.innerWidth, h: window.innerHeight };
    this.input = { x: 0, y: 0 };
    this.enemyCap = window.innerWidth < 760 ? 190 : MAX_ENEMIES;
    this.runCount = 0;
    this.reset('menu');
  }

  setViewport(w, h) {
    this.viewport = { w, h };
    this.enemyCap = w < 760 ? 190 : MAX_ENEMIES;
  }

  reset(mode = 'playing') {
    this.state = mode;
    this.time = 0;
    this.level = 1;
    this.xp = 0;
    this.xpNext = 7;
    this.pendingLevels = 0;
    this.gold = 0;
    this.kills = 0;
    this.itemsDropped = 0;
    this.itemsLooted = 0;
    this.damageDealt = 0;
    this.rerollCost = 25;
    this.gambleCost = 120;
    this.gambles = 0;
    this.bossSpawned = false;
    this.bossDefeated = false;
    this.boss = null;
    this.pendingLegendary = null;
    this.choices = [];
    this.toastLock = 0;

    this.boonStacks = {};
    this.boonStats = emptyStats();
    this.equipment = { weapon: makeStarterWeapon(), armor: null, amulet: null, ring: null };
    this.inventory = [];
    this.derived = aggregateEquipment(this.equipment, this.boonStats);

    this.player = {
      x: 0, y: 0, radius: 14, hp: this.derived.maxLife,
      facing: -Math.PI / 2, bob: 0, moving: false,
      iframe: 1.4, hurtFlash: 0, attackAnim: 0, footTimer: 0,
      evadeFlash: 0
    };
    this.attackTimer = 0.25;
    this.camera = { x: 0, y: 0 };
    this.shake = 0;
    this.zoom = 1;

    this.enemies = [];
    this.projectiles = [];
    this.enemyProjectiles = [];
    this.pickups = [];
    this.groundItems = [];
    this.particles = [];
    this.damageNumbers = [];
    this.effects = [];
    this.hazards = [];
    this.decals = [];
    this.spawnTimer = 0;
    this.waveIndex = -1;
    this.props = this.makeProps();
    this.menuEmbers = [];
    for (let i = 0; i < 44; i++) {
      this.menuEmbers.push({
        x: this.rng.range(-ARENA, ARENA), y: this.rng.range(-ARENA, ARENA),
        vx: this.rng.range(-4, 4), vy: this.rng.range(-14, -4),
        size: this.rng.range(0.8, 2.2), life: this.rng.range(0.4, 1)
      });
    }
    this.lastHitSound = -1;
    this.lastKillSound = -1;

    if (mode === 'playing') {
      this.spawnOpeningWave();
      this.events.onHudDirty?.();
    }
  }

  startRun() {
    this.runCount++;
    this.reset('playing');
    this.events.onStart?.();
    this.events.onHudDirty?.();
  }

  makeProps() {
    const rng = new RNG(0xC0FFEE + this.runCount * 31);
    const props = [];
    const types = ['tomb', 'tomb', 'cross', 'pillar', 'brazier', 'deadtree', 'skulls', 'urn', 'statue'];
    for (let i = 0; i < 96; i++) {
      const angle = rng.range(0, TAU);
      const radius = rng.range(180, ARENA * 0.94);
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      if (Math.abs(x) < 90 && Math.abs(y) < 90) continue;
      const type = rng.pick(types);
      props.push({
        type, x, y,
        scale: rng.range(0.75, 1.35),
        rot: rng.range(-0.25, 0.25),
        phase: rng.range(0, TAU),
        light: type === 'brazier' ? rng.range(0.85, 1.25) : 0
      });
    }
    // A ring of braziers around the starting ground.
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * TAU + 0.3;
      props.push({
        type: 'brazier', x: Math.cos(a) * 360, y: Math.sin(a) * 360,
        scale: 1, rot: 0, phase: rng.range(0, TAU), light: 1
      });
    }
    return props;
  }

  spawnOpeningWave() {
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * TAU + this.rng.range(-0.2, 0.2);
      const radius = this.rng.range(300, 440);
      this.spawnEnemy(i % 4 === 0 ? 'skeleton' : 'bat',
        Math.cos(angle) * radius, Math.sin(angle) * radius);
    }
  }

  /* ---------------- simulation ---------------- */

  update(dt) {
    if (this.state !== 'playing') {
      this.updateAmbient(dt);
      return;
    }
    this.time += dt;
    if (this.time >= RUN_DURATION) {
      this.finish(true);
      return;
    }
    this.updatePlayer(dt);
    this.updateSpawning(dt);
    this.updateEnemies(dt);
    this.cleanupEnemies();
    this.buildGrid();
    this.updateProjectiles(dt);
    this.updateEnemyProjectiles(dt);
    this.cleanupEnemies();
    this.updateHazards(dt);
    this.updatePickups(dt);
    this.updateGroundItems(dt);
    this.updateParticles(dt);
    this.updateEffects(dt);
    this.updateDamageNumbers(dt);
    this.updateCamera(dt);
    this.shake = Math.max(0, this.shake - dt * 22);
    if (this.pendingLevels > 0 && this.state === 'playing') this.openLevelUp();
  }

  updateAmbient(dt) {
    for (const ember of this.menuEmbers) {
      ember.x += ember.vx * dt;
      ember.y += ember.vy * dt;
      ember.life -= dt * 0.35;
      if (ember.life <= 0) {
        ember.x = this.rng.range(-ARENA, ARENA);
        ember.y = this.rng.range(-ARENA, ARENA);
        ember.life = this.rng.range(0.4, 1);
      }
    }
    if (this.state === 'menu') {
      this.player.bob += dt;
      this.camera.x += (0 - this.camera.x) * Math.min(1, dt * 2);
      this.camera.y += (0 - this.camera.y) * Math.min(1, dt * 2);
    }
  }

  updatePlayer(dt) {
    const p = this.player;
    const d = this.derived;
    let ix = this.input.x;
    let iy = this.input.y;
    const len = Math.hypot(ix, iy);
    if (len > 1) { ix /= len; iy /= len; }
    p.moving = len > 0.05;
    if (p.moving) {
      p.x += ix * d.moveSpeed * dt;
      p.y += iy * d.moveSpeed * dt;
      p.facing = Math.atan2(iy, ix);
      p.bob += dt * 11;
      p.footTimer -= dt;
      if (p.footTimer <= 0) {
        p.footTimer = 0.14;
        this.addParticles(p.x, p.y + 8, 1, {
          color: 'rgba(140,120,95,.32)', size: 2.5, life: 0.5, speed: 18, gravity: -4
        });
      }
    } else {
      p.bob += dt * 2.5;
    }
    p.x = clamp(p.x, -ARENA + 30, ARENA - 30);
    p.y = clamp(p.y, -ARENA + 30, ARENA - 30);
    p.iframe = Math.max(0, p.iframe - dt);
    p.hurtFlash = Math.max(0, p.hurtFlash - dt);
    p.attackAnim = Math.max(0, p.attackAnim - dt);
    p.evadeFlash = Math.max(0, p.evadeFlash - dt);

    if (d.regen > 0 && p.hp > 0) this.heal(d.regen * dt, true);

    this.attackTimer -= dt;
    if (this.attackTimer <= 0) {
      const fired = this.playerAttack();
      this.attackTimer = fired ? Math.max(0.14, d.interval) : 0.12;
    }
  }

  nearestEnemy(x, y, range, exclude = null, hit = null) {
    let best = null;
    let bestD = range * range;
    for (const e of this.enemies) {
      if (e.dead || e === exclude || (hit && hit.has(e))) continue;
      const d = dist2(x, y, e.x, e.y);
      if (d < bestD) { bestD = d; best = e; }
    }
    return best;
  }

  playerAttack() {
    const p = this.player;
    const d = this.derived;
    const w = d.weapon;
    // The tyrant is never lost in the horde: if it is in reach, every weapon
    // turns on it before picking off the chaff.
    let target = null;
    if (this.boss && !this.boss.dead) {
      const bossDist = Math.hypot(this.boss.x - p.x, this.boss.y - p.y);
      if (bossDist <= w.range + this.boss.radius + 20) target = this.boss;
    }
    if (!target) target = this.nearestEnemy(p.x, p.y, w.range + 20);
    if (!target) return false;
    const angle = Math.atan2(target.y - p.y, target.x - p.x);
    p.facing = angle;
    p.attackAnim = 0.2;
    const area = 1 + d.areaPct / 100;
    const color = w.color || '#8fe7ff';

    switch (w.kind) {
      case 'cleave': {
        const radius = w.range * area;
        const cone = 1.25;
        this.effects.push({
          type: 'slash', x: p.x, y: p.y, angle, radius,
          life: 0.24, maxLife: 0.24, color, seed: this.rng.next()
        });
        let hits = 0;
        for (const e of this.enemies) {
          if (e.dead) continue;
          const dx = e.x - p.x;
          const dy = e.y - p.y;
          const dd = Math.hypot(dx, dy);
          if (dd > radius + e.radius) continue;
          const diff = Math.abs(this.angleDiff(Math.atan2(dy, dx), angle));
          if (diff > cone) continue;
          this.hitEnemy(e, d.weaponDamage, { x: e.x, y: e.y, source: 'cleave' });
          hits++;
        }
        this.addParticles(p.x + Math.cos(angle) * 40, p.y + Math.sin(angle) * 40, 7, {
          color, size: 3, life: 0.3, speed: 130, angle, spread: 1.2, gravity: 0
        });
        this.playSfx('cleave', 0.05);
        if (hits) this.shake = Math.max(this.shake, 1.4);
        return true;
      }
      case 'storm': {
        const chainCount = Math.max(1, (w.chains || 3));
        const hit = new Set();
        let current = target;
        let from = { x: p.x, y: p.y };
        const points = [{ x: p.x, y: p.y }];
        for (let i = 0; i < chainCount && current; i++) {
          hit.add(current);
          points.push({ x: current.x, y: current.y });
          this.hitEnemy(current, d.weaponDamage, { x: current.x, y: current.y, source: 'storm' });
          this.addParticles(current.x, current.y, 5, {
            color, size: 2.4, life: 0.25, speed: 90, gravity: 0
          });
          from = current;
          current = this.nearestEnemy(from.x, from.y, 235, null, hit);
        }
        this.effects.push({
          type: 'lightning', points, life: 0.2, maxLife: 0.2, color, seed: this.rng.next()
        });
        this.playSfx('shoot', 0.04, { freq: 220 });
        return true;
      }
      case 'orb': {
        const count = 1 + Math.floor(d.projectiles / 2);
        for (let i = 0; i < count; i++) {
          const spread = count > 1 ? (i - (count - 1) / 2) * 0.16 : 0;
          this.spawnProjectile({
            x: p.x, y: p.y, angle: angle + spread, speed: w.speed,
            damage: d.weaponDamage, radius: 9, color,
            kind: 'orb', pierce: 0, life: 1.8, aoe: w.radius * area,
            burningGround: d.flags.burningGround
          });
        }
        this.playSfx('shoot', 0.05, { freq: 180 });
        return true;
      }
      case 'spear': {
        const count = 1 + Math.floor(d.projectiles / 2);
        for (let i = 0; i < count; i++) {
          const spread = count > 1 ? (i - (count - 1) / 2) * 0.1 : 0;
          this.spawnProjectile({
            x: p.x, y: p.y, angle: angle + spread, speed: w.speed,
            damage: d.weaponDamage, radius: 7, color,
            kind: 'spear', pierce: d.flags.infinitePierce ? 999 : w.pierce,
            life: 1.1
          });
        }
        this.playSfx('shoot', 0.04, { freq: 300 });
        return true;
      }
      case 'knives': {
        const count = (w.count || 2) + d.projectiles;
        for (let i = 0; i < count; i++) {
          const spread = (i - (count - 1) / 2) * 0.13;
          this.spawnProjectile({
            x: p.x, y: p.y, angle: angle + spread, speed: w.speed,
            damage: d.weaponDamage, radius: 5, color,
            kind: 'knife', pierce: d.flags.pierce || 0, life: 0.85
          });
        }
        this.playSfx('shoot', 0.035, { freq: 760 });
        return true;
      }
      case 'bolt':
      default: {
        const count = 1 + d.projectiles;
        for (let i = 0; i < count; i++) {
          const spread = (i - (count - 1) / 2) * 0.1;
          this.spawnProjectile({
            x: p.x, y: p.y, angle: angle + spread, speed: w.speed,
            damage: d.weaponDamage, radius: 6, color,
            kind: 'bolt', pierce: d.flags.pierce || 0, life: 1.15
          });
        }
        this.playSfx('shoot', 0.035, { freq: 620 });
        return true;
      }
    }
  }

  angleDiff(a, b) {
    let d = a - b;
    while (d > Math.PI) d -= TAU;
    while (d < -Math.PI) d += TAU;
    return d;
  }

  spawnProjectile({ x, y, angle, speed, damage, radius, color, kind, pierce = 0, life = 1, aoe = 0, burningGround = false }) {
    this.projectiles.push({
      x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
      angle, speed, damage, radius, color, kind, pierce, life, maxLife: life,
      aoe, burningGround, hit: new Set(), trail: []
    });
  }

  updateProjectiles(dt) {
    const keep = [];
    for (const proj of this.projectiles) {
      proj.life -= dt;
      if (proj.life <= 0) {
        if (proj.kind === 'orb') this.explode(proj.x, proj.y, proj.aoe, proj.damage * 0.9, proj.color, { burningGround: proj.burningGround });
        continue;
      }
      proj.trail.push({ x: proj.x, y: proj.y });
      if (proj.trail.length > 6) proj.trail.shift();
      proj.x += proj.vx * dt;
      proj.y += proj.vy * dt;

      let remove = false;
      const candidates = this.nearby(proj.x, proj.y, 70);
      for (const e of candidates) {
        if (e.dead || proj.hit.has(e)) continue;
        const rr = proj.radius + e.radius;
        if (dist2(proj.x, proj.y, e.x, e.y) > rr * rr) continue;
        proj.hit.add(e);
        if (proj.kind === 'orb') {
          this.explode(proj.x, proj.y, proj.aoe, proj.damage, proj.color, { burningGround: proj.burningGround });
          remove = true;
          break;
        }
        this.hitEnemy(e, proj.damage, { x: proj.x, y: proj.y, source: proj.kind });
        this.addParticles(proj.x, proj.y, 4, {
          color: proj.color, size: 2.2, life: 0.25, speed: 80, gravity: 0
        });
        if (proj.pierce > 0) proj.pierce--;
        else { remove = true; break; }
      }
      if (remove) continue;
      if (Math.abs(proj.x - this.player.x) > 1500 || Math.abs(proj.y - this.player.y) > 1500) continue;
      keep.push(proj);
    }
    this.projectiles = keep;
  }

  updateEnemyProjectiles(dt) {
    const keep = [];
    for (const proj of this.enemyProjectiles) {
      proj.life -= dt;
      if (proj.life <= 0) continue;
      proj.x += proj.vx * dt;
      proj.y += proj.vy * dt;
      const rr = proj.radius + this.player.radius;
      if (dist2(proj.x, proj.y, this.player.x, this.player.y) < rr * rr) {
        this.damagePlayer(proj.damage, null);
        this.addParticles(proj.x, proj.y, 6, { color: proj.color, size: 2.5, life: 0.3, speed: 90 });
        continue;
      }
      if (Math.abs(proj.x - this.player.x) > 1600 || Math.abs(proj.y - this.player.y) > 1600) continue;
      keep.push(proj);
    }
    this.enemyProjectiles = keep;
  }

  explode(x, y, radius, damage, color, { burningGround = false } = {}) {
    this.effects.push({
      type: 'ring', x, y, radius, life: 0.38, maxLife: 0.38, color, seed: this.rng.next()
    });
    this.addParticles(x, y, 18, {
      color, size: 3.5, life: 0.55, speed: 220, gravity: 20, glow: true
    });
    this.addParticles(x, y, 8, {
      color: '#3a2a20', size: 5, life: 0.9, speed: 80, gravity: -10
    });
    this.shake = Math.max(this.shake, 5);
    this.playSfx('kill', 0.06);
    for (const e of this.nearby(x, y, radius + 30)) {
      if (e.dead) continue;
      if (dist2(x, y, e.x, e.y) <= (radius + e.radius) * (radius + e.radius)) {
        this.hitEnemy(e, damage, { x: e.x, y: e.y, source: 'explosion' });
      }
    }
    if (burningGround) {
      this.hazards.push({ x, y, radius: radius * 0.9, damage: damage * 0.28, until: this.time + 3, tick: 0, color });
    }
  }

  updateHazards(dt) {
    const keep = [];
    for (const h of this.hazards) {
      if (this.time > h.until) continue;
      h.tick -= dt;
      if (h.tick <= 0) {
        h.tick = 0.4;
        for (const e of this.nearby(h.x, h.y, h.radius + 20)) {
          if (e.dead) continue;
          if (dist2(h.x, h.y, e.x, e.y) < (h.radius + e.radius) ** 2) {
            this.hitEnemy(e, h.damage, { x: e.x, y: e.y, source: 'burning ground', canCrit: false });
          }
        }
      }
      keep.push(h);
    }
    this.hazards = keep;
  }

  /* ---------------- enemies ---------------- */

  spawnEnemy(typeId, x, y, opts = {}) {
    if (this.enemies.length >= this.enemyCap + 20 && !opts.boss) return null;
    const type = ENEMY_TYPES[typeId];
    if (!type) return null;
    const elite = !!opts.elite;
    const hpScale = 1 + this.time / 125 + (elite ? 4.5 : 0);
    const dmgScale = 1 + this.time / 190 + (elite ? 0.45 : 0);
    const radius = type.radius * (elite ? 1.32 : 1) * (opts.scale || 1);
    const hp = type.hp * hpScale * (elite ? 2.1 : 1);
    const e = {
      type: typeId, name: type.name, x, y, vx: 0, vy: 0,
      hp, maxHp: hp, radius,
      speed: type.speed * (elite ? 0.9 : 1),
      damage: type.damage * dmgScale * (elite ? 1.35 : 1),
      xp: type.xp * (elite ? 6 : 1),
      color: type.color, accent: type.accent, mass: type.mass || 1,
      elite, boss: !!type.boss, ghost: !!type.ghost, ranged: !!type.ranged,
      dead: false, flash: 0, kx: 0, ky: 0, hitCd: 0,
      atkTimer: this.rng.range(0.5, 2.2),
      phase: this.rng.range(0, TAU), spawnAnim: 0.4,
      burn: null, bleed: null, dotTick: 0,
      volleyTimer: 3.2, summonTimer: 6.5
    };
    if (e.boss) {
      e.hp = e.maxHp = 1900 + this.time * 1.2;
      e.xp = 70;
      e.radius = 50;
      e.damage = 26;
      e.speed = 44;
    }
    this.enemies.push(e);
    return e;
  }

  updateSpawning(dt) {
    if (!this.bossSpawned && this.time >= BOSS_TIME) this.spawnBoss();

    this.spawnTimer -= dt;
    if (this.spawnTimer > 0) return;
    const interval = clamp(0.92 - this.time * 0.0017, 0.16, 1) * this.rng.range(0.72, 1.25);
    this.spawnTimer = interval;
    if (this.enemies.length >= this.enemyCap) return;
    const count = 1 + Math.floor(this.time / 72);
    const table = this.spawnTableFor(this.time);
    for (let i = 0; i < count; i++) {
      const typeId = this.rng.pick(table);
      const angle = this.rng.range(0, TAU);
      const radius = Math.max(this.viewport.w, this.viewport.h) * 0.62 + this.rng.range(30, 170);
      const x = this.player.x + Math.cos(angle) * radius;
      const y = this.player.y + Math.sin(angle) * radius;
      const eliteChance = clamp(0.012 + this.time / 8500, 0.012, 0.055);
      this.spawnEnemy(typeId, x, y, { elite: this.rng.chance(eliteChance) });
    }
  }

  spawnTableFor(time) {
    let table = SPAWN_TABLE[0].types;
    for (const row of SPAWN_TABLE) if (time >= row.t) table = row.types;
    return table;
  }

  spawnBoss() {
    this.bossSpawned = true;
    const angle = this.rng.range(0, TAU);
    const radius = Math.max(this.viewport.w, this.viewport.h) * 0.52 + 90;
    const boss = this.spawnEnemy('tyrant',
      this.player.x + Math.cos(angle) * radius,
      this.player.y + Math.sin(angle) * radius, { boss: true, scale: 1 });
    this.boss = boss;
    this.events.onBoss?.();
    this.toast('THE BONE TYRANT RISES', 'legendary');
    this.audio.play('boss');
    this.shake = 12;
    this.effects.push({
      type: 'ring', x: boss.x, y: boss.y, radius: 200, life: 1, maxLife: 1,
      color: '#ff8f5a', seed: this.rng.next()
    });
  }

  updateEnemies(dt) {
    const p = this.player;
    for (const e of this.enemies) {
      if (e.dead) continue;
      e.flash = Math.max(0, e.flash - dt);
      e.hitCd = Math.max(0, e.hitCd - dt);
      e.spawnAnim = Math.max(0, e.spawnAnim - dt);
      e.phase += dt;

      if (e.burn) {
        e.hp -= e.burn.dps * dt;
        e.burn.until -= dt;
        if (e.burn.until <= 0) e.burn = null;
        e.dotTick -= dt;
        if (e.dotTick <= 0) {
          e.dotTick = 0.4;
          this.addDamageNumber(e.x, e.y - e.radius, Math.max(1, Math.round(e.burn ? e.burn.dps * 0.4 : 1)), '#ff9a3c', false, 0.7);
        }
        if (e.hp <= 0) { this.killEnemy(e, 'burn'); continue; }
      }
      if (e.bleed) {
        e.hp -= e.bleed.dps * dt;
        e.bleed.until -= dt;
        if (e.bleed.until <= 0) e.bleed = null;
        e.dotTick -= dt;
        if (e.dotTick <= 0) {
          e.dotTick = 0.4;
          this.addDamageNumber(e.x, e.y - e.radius, Math.max(1, Math.round(e.bleed ? e.bleed.dps * 0.4 : 1)), '#d95c5c', false, 0.7);
        }
        if (e.hp <= 0) { this.killEnemy(e, 'bleed'); continue; }
      }

      const dx = p.x - e.x;
      const dy = p.y - e.y;
      const dd = Math.hypot(dx, dy) || 1;
      let mx = dx / dd;
      let my = dy / dd;

      if (e.ranged) {
        if (dd < 210) { mx *= -0.7; my *= -0.7; }
        else if (dd < 300) { mx *= 0.15; my *= 0.15; }
        e.atkTimer -= dt;
        if (e.atkTimer <= 0 && dd < 460) {
          e.atkTimer = this.rng.range(2.1, 2.9);
          const a = Math.atan2(dy, dx);
          this.enemyProjectiles.push({
            x: e.x, y: e.y, vx: Math.cos(a) * 210, vy: Math.sin(a) * 210,
            radius: 6, damage: e.damage * 0.85, life: 3.2, color: '#c77dff'
          });
        }
      }

      if (e.boss) {
        e.volleyTimer -= dt;
        if (e.volleyTimer <= 0) {
          e.volleyTimer = 3.7;
          const base = Math.atan2(dy, dx);
          for (let i = 0; i < 14; i++) {
            const a = base + (i / 14) * TAU;
            this.enemyProjectiles.push({
              x: e.x, y: e.y, vx: Math.cos(a) * 175, vy: Math.sin(a) * 175,
              radius: 8, damage: e.damage * 0.55, life: 4, color: '#ff8f5a'
            });
          }
          this.shake = Math.max(this.shake, 6);
          this.playSfx('boss', 0.5);
        }
        e.summonTimer -= dt;
        if (e.summonTimer <= 0) {
          e.summonTimer = 8.2;
          for (let i = 0; i < 5; i++) {
            const a = (i / 5) * TAU;
            this.spawnEnemy('skeleton', e.x + Math.cos(a) * 90, e.y + Math.sin(a) * 90, { elite: false });
          }
          this.effects.push({
            type: 'ring', x: e.x, y: e.y, radius: 120, life: 0.6, maxLife: 0.6,
            color: '#ff8f5a', seed: this.rng.next()
          });
        }
      }

      if (e.ghost) {
        const sway = Math.sin(e.phase * 2.2) * 0.35;
        const cos = Math.cos(sway);
        const sin = Math.sin(sway);
        const nx = mx * cos - my * sin;
        const ny = mx * sin + my * cos;
        mx = nx; my = ny;
      }

      const speed = e.speed * (e.spawnAnim > 0 ? 0.35 : 1);
      e.x += (mx * speed + e.kx) * dt;
      e.y += (my * speed + e.ky) * dt;
      e.kx *= Math.exp(-7 * dt);
      e.ky *= Math.exp(-7 * dt);

      const rr = e.radius + p.radius;
      if (dd < rr + 2 && p.iframe <= 0) {
        this.damagePlayer(e.damage, e);
        if (e.hitCd <= 0) e.hitCd = 0.8;
      }
      if (dd > 2200) e.dead = true;
    }

    // Separation pass keeps the horde from stacking into one pixel.
    for (const e of this.enemies) {
      if (e.dead) continue;
      const near = this.nearby(e.x, e.y, e.radius * 2 + 12);
      for (const o of near) {
        if (o === e || o.dead) continue;
        const dx = o.x - e.x;
        const dy = o.y - e.y;
        const min = e.radius + o.radius;
        const d2 = dx * dx + dy * dy;
        if (d2 > 0.001 && d2 < min * min) {
          const d = Math.sqrt(d2);
          const push = (min - d) * 0.5;
          const nx = dx / d;
          const ny = dy / d;
          const ratio = (o.mass || 1) / ((e.mass || 1) + (o.mass || 1));
          e.x -= nx * push * ratio;
          e.y -= ny * push * ratio;
          o.x += nx * push * (1 - ratio);
          o.y += ny * push * (1 - ratio);
        }
      }
    }
  }

  cleanupEnemies() {
    if (this.enemies.some(e => e.dead)) {
      this.enemies = this.enemies.filter(e => !e.dead);
    }
  }

  /* ---------------- damage & death ---------------- */

  hitEnemy(enemy, baseDamage, { x, y, source = 'hit', canCrit = true } = {}) {
    if (!enemy || enemy.dead) return;
    const d = this.derived;
    const crit = canCrit && this.rng.chance(d.critChance);
    const amount = baseDamage * (crit ? d.critMult : 1);
    enemy.hp -= amount;
    enemy.flash = 0.09;
    this.damageDealt += amount;
    this.addDamageNumber(
      x ?? enemy.x, (y ?? enemy.y) - enemy.radius - 4,
      Math.max(1, Math.round(amount)), crit ? '#ffd76a' : '#f1e7d2', crit
    );
    this.addParticles(x ?? enemy.x, y ?? enemy.y, crit ? 7 : 3, {
      color: crit ? '#ffd76a' : '#c44a4a', size: crit ? 3.4 : 2.2,
      life: crit ? 0.4 : 0.24, speed: crit ? 150 : 80, gravity: 120
    });
    if (d.lifesteal > 0) this.heal(amount * d.lifesteal / 100, true);
    if (d.flags.burnOnHit) {
      enemy.burn = { dps: d.flags.burnOnHit * (1 + d.damagePct / 100), until: 3 };
    }
    if (crit && d.flags.bleedOnCrit) {
      enemy.bleed = { dps: 9 * (1 + d.damagePct / 100), until: 3 };
    }
    this.playSfx('hit', 0.045);
    if (enemy.hp <= 0) this.killEnemy(enemy, source);
  }

  killEnemy(enemy, source = 'hit') {
    if (!enemy || enemy.dead) return;
    enemy.dead = true;
    this.kills++;
    this.playSfx('kill', 0.075);
    this.addDecal(enemy.x, enemy.y, enemy.radius * this.rng.range(1.1, 1.9), enemy.boss ? 'rgba(120,20,20,.4)' : 'rgba(90,18,18,.32)');
    this.addParticles(enemy.x, enemy.y, enemy.elite || enemy.boss ? 22 : 8, {
      color: enemy.accent || '#c44a4a', size: enemy.boss ? 5 : 2.6,
      life: 0.55, speed: enemy.boss ? 240 : 120, gravity: 150, glow: true
    });
    if (enemy.boss) {
      this.shake = 18;
      this.effects.push({
        type: 'ring', x: enemy.x, y: enemy.y, radius: 260, life: 0.9, maxLife: 0.9,
        color: '#ff8f5a', seed: this.rng.next()
      });
      this.boss = null;
      this.bossDefeated = true;
      this.toast('TYRANT SLAIN — the hoard is yours', 'legendary');
      this.audio.play('legendary');
      this.dropGear(enemy.x, enemy.y, { minRarity: 'legendary', ilvlBonus: 3, forceUnique: true });
      this.dropGear(enemy.x + 26, enemy.y - 18, { minRarity: 'rare', ilvlBonus: 2 });
      this.dropGear(enemy.x - 24, enemy.y + 24, { minRarity: 'rare', ilvlBonus: 2 });
      for (let i = 0; i < 16; i++) {
        this.pickups.push({
          type: 'gold', x: enemy.x + this.rng.range(-40, 40), y: enemy.y + this.rng.range(-40, 40),
          vx: this.rng.range(-80, 80), vy: this.rng.range(-80, 80), value: 8, radius: 5, life: 30, bob: this.rng.range(0, TAU)
        });
      }
      this.gold += 150;
      this.events.onBossDefeated?.();
    }

    const xpValue = Math.max(1, Math.round(enemy.xp));
    this.pickups.push({
      type: 'xp', x: enemy.x + this.rng.range(-6, 6), y: enemy.y + this.rng.range(-6, 6),
      vx: this.rng.range(-40, 40), vy: this.rng.range(-40, 40), value: xpValue,
      radius: 4 + Math.min(5, xpValue * 0.4), life: 30, bob: this.rng.range(0, TAU)
    });

    if (this.rng.chance(0.64)) {
      this.pickups.push({
        type: 'gold', x: enemy.x, y: enemy.y, vx: this.rng.range(-50, 50), vy: this.rng.range(-50, 50),
        value: enemy.elite ? this.rng.int(10, 22) : this.rng.int(1, 4),
        radius: 4, life: 25, bob: this.rng.range(0, TAU)
      });
    }
    if (this.rng.chance(enemy.elite ? 0.32 : 0.012)) {
      this.pickups.push({
        type: 'health', x: enemy.x, y: enemy.y, vx: this.rng.range(-30, 30), vy: this.rng.range(-30, 30),
        value: 1, radius: 7, life: 25, bob: this.rng.range(0, TAU)
      });
    }

    const mf = this.derived.magicFind;
    const gearChance = enemy.boss ? 1 : enemy.elite ? 0.62 : 0.07 + mf * 0.0005;
    if (this.rng.chance(gearChance)) {
      this.dropGear(enemy.x, enemy.y, {
        minRarity: enemy.elite ? 'magic' : 'common',
        ilvlBonus: enemy.elite ? 1 : 0
      });
    }

    if (this.derived.flags.healOnKill > 0) this.heal(this.derived.flags.healOnKill, true);
    if (this.derived.flags.explodeOnKill > 0 && this.rng.chance(this.derived.flags.explodeOnKill)) {
      this.explode(enemy.x, enemy.y, 78, this.derived.weaponDamage * 0.6, '#c7b3ff');
    }
    this.events.onKill?.();
  }

  damagePlayer(amount, source) {
    if (this.state !== 'playing') return;
    const p = this.player;
    if (p.iframe > 0) return;
    const d = this.derived;
    if (d.flags.evade > 0 && this.rng.chance(d.flags.evade)) {
      p.iframe = 0.22;
      p.evadeFlash = 0.3;
      this.addDamageNumber(p.x, p.y - 28, 'EVADE', '#8fe7ff', false, 1);
      this.playSfx('evade', 0.1);
      return;
    }
    const reduction = Math.min(0.75, d.armor / (d.armor + 70));
    const dmg = Math.max(1, amount * (1 - reduction));
    p.hp -= dmg;
    p.iframe = 0.65;
    p.hurtFlash = 0.32;
    this.shake = Math.max(this.shake, 7);
    this.addDamageNumber(p.x, p.y - 30, Math.round(dmg), '#ff6b6b', false, 1);
    this.addParticles(p.x, p.y, 9, { color: '#b42d2d', size: 3, life: 0.4, speed: 120, gravity: 160 });
    this.playSfx('hurt', 0.12);
    if (d.flags.thorns > 0 && source && !source.dead) {
      this.hitEnemy(source, d.flags.thorns, { x: source.x, y: source.y, source: 'thorns', canCrit: false });
    }
    if (p.hp <= 0) {
      p.hp = 0;
      this.die();
    }
  }

  heal(amount, silent = false) {
    if (this.state === 'dead' || this.state === 'victory') return;
    const before = this.player.hp;
    this.player.hp = Math.min(this.derived.maxLife, this.player.hp + amount);
    if (!silent && this.player.hp > before) {
      this.addParticles(this.player.x, this.player.y, 6, {
        color: '#7ee6a8', size: 2.6, life: 0.5, speed: 60, gravity: -30, glow: true
      });
      this.playSfx('heal', 0.2);
    }
  }

  die() {
    if (this.state !== 'playing') return;
    this.state = 'dead';
    this.audio.play('hurt');
    this.saveBest(false);
    this.events.onEnd?.({ victory: false, ...this.runSummary() });
  }

  finish(victory) {
    if (this.state !== 'playing') return;
    this.state = 'victory';
    this.audio.play(victory ? 'legendary' : 'hurt');
    this.saveBest(victory);
    this.events.onEnd?.({ victory, ...this.runSummary() });
  }

  runSummary() {
    return {
      time: Math.min(RUN_DURATION, this.time),
      kills: this.kills,
      level: this.level,
      gold: this.gold,
      itemsLooted: this.itemsLooted,
      itemsDropped: this.itemsDropped,
      damageDealt: Math.round(this.damageDealt),
      bossDefeated: this.bossDefeated
    };
  }

  saveBest(victory) {
    try {
      const prev = JSON.parse(localStorage.getItem('grimhoard.best') || '{}');
      const best = {
        time: Math.max(prev.time || 0, victory ? RUN_DURATION : this.time),
        kills: Math.max(prev.kills || 0, this.kills),
        level: Math.max(prev.level || 0, this.level),
        victory: !!(prev.victory || victory)
      };
      localStorage.setItem('grimhoard.best', JSON.stringify(best));
    } catch { /* storage may be unavailable */ }
  }

  /* ---------------- loot & inventory ---------------- */

  itemLevelFor(bonus = 0) {
    return clamp(1 + Math.floor(this.time / 40) + bonus, 1, 20);
  }

  dropGear(x, y, { minRarity = 'common', ilvlBonus = 0, forceUnique = false } = {}) {
    if (this.groundItems.length >= MAX_GROUND_ITEMS) {
      const oldest = this.groundItems.shift();
      if (oldest) this.gold += Math.max(2, Math.round(oldest.item.salvage * 0.5));
    }
    const item = generateItem(this.rng, {
      ilvl: this.itemLevelFor(ilvlBonus),
      minRarity,
      magicFind: this.derived.magicFind,
      forceUnique
    });
    this.itemsDropped++;
    this.groundItems.push({
      item, x: x + this.rng.range(-12, 12), y: y + this.rng.range(-12, 12),
      age: 0, bob: this.rng.range(0, TAU), collected: false
    });
    if (item.rarity === 'legendary') {
      this.effects.push({
        type: 'ring', x, y, radius: 90, life: 0.8, maxLife: 0.8,
        color: RARITIES.legendary.color, seed: this.rng.next()
      });
      this.addParticles(x, y, 22, {
        color: '#ff9a3c', size: 3.5, life: 1, speed: 150, gravity: -30, glow: true
      });
      this.toast('A legendary falls', 'legendary');
      this.audio.play('legendary');
    }
    return item;
  }

  updateGroundItems(dt) {
    for (const g of this.groundItems) {
      g.age += dt;
      g.bob += dt * 2;
      if (g.collected) continue;
      const rr = 30 + this.player.radius;
      if (dist2(g.x, g.y, this.player.x, this.player.y) < rr * rr) {
        this.pickupGroundItem(g);
        if (this.state !== 'playing') break;
      }
    }
    this.groundItems = this.groundItems.filter(g => !g.collected);
  }

  pickupGroundItem(g) {
    const item = g.item;
    if (item.rarity === 'legendary') {
      g.collected = true;
      this.pendingLegendary = item;
      this.state = 'legendary';
      this.itemsLooted++;
      this.events.onLegendary?.(item, this.equipment[item.slot], this);
      return;
    }
    if (this.inventory.length >= INVENTORY_SIZE) {
      if (this.time - this.toastLock > 3) {
        this.toastLock = this.time;
        this.toast('Satchel full — open it to salvage', 'bad');
      }
      return;
    }
    this.addItemToInventory(item);
    g.collected = true;
    this.itemsLooted++;
    const label = itemPowerLabel(item, this.boonStats, this.equipment);
    const color = item.rarity === 'rare' ? 'rare' : item.rarity === 'magic' ? 'magic' : '';
    this.toast(`${item.name}${label === 'Upgrade' ? ' · Upgrade' : ''}`, color);
    this.audio.play('gear');
    if (item.rarity === 'rare' || item.rarity === 'legendary') {
      this.addParticles(g.x, g.y, 14, {
        color: RARITIES[item.rarity].color, size: 2.6, life: 0.7, speed: 100, gravity: -20, glow: true
      });
    }
    this.events.onHudDirty?.();
  }

  addItemToInventory(item) {
    if (this.inventory.length >= INVENTORY_SIZE) return false;
    item.isNew = true;
    this.inventory.push(item);
    this.events.onInventoryDirty?.();
    return true;
  }

  equipItem(item, { fromInventory = true } = {}) {
    if (!item) return false;
    const slot = item.slot;
    const old = this.equipment[slot];
    if (fromInventory) {
      const idx = this.inventory.indexOf(item);
      if (idx < 0) return false;
      this.inventory.splice(idx, 1);
    }
    this.equipment[slot] = item;
    item.isNew = false;
    if (old) {
      if (this.inventory.length < INVENTORY_SIZE) {
        old.isNew = true;
        this.inventory.push(old);
      } else {
        this.gold += old.salvage;
        this.toast(`${old.name} auto-salvaged (+${old.salvage}g)`, 'gold');
      }
    }
    this.recalc();
    this.attackTimer = Math.min(this.attackTimer, 0.15);
    this.audio.play('gear');
    this.events.onInventoryDirty?.();
    this.events.onHudDirty?.();
    this.events.onEquip?.(item);
    return true;
  }

  salvageItem(item, { fromInventory = true } = {}) {
    if (!item) return 0;
    let idx = -1;
    if (fromInventory) {
      idx = this.inventory.indexOf(item);
      if (idx < 0) return 0;
      this.inventory.splice(idx, 1);
    } else {
      for (const slot of Object.keys(this.equipment)) {
        if (this.equipment[slot] === item) this.equipment[slot] = null;
      }
      this.recalc();
    }
    const gold = item.salvage || 0;
    this.gold += gold;
    this.audio.play('gold');
    this.events.onInventoryDirty?.();
    this.events.onHudDirty?.();
    return gold;
  }

  unequip(slot) {
    const item = this.equipment[slot];
    if (!item) return false;
    if (this.inventory.length >= INVENTORY_SIZE) {
      this.audio.play('deny');
      this.toast('Satchel full', 'bad');
      return false;
    }
    this.equipment[slot] = null;
    item.isNew = true;
    this.inventory.push(item);
    this.recalc();
    this.audio.play('ui');
    this.events.onInventoryDirty?.();
    this.events.onHudDirty?.();
    return true;
  }

  salvageCommons() {
    const commons = this.inventory.filter(i => i.rarity === 'common');
    if (!commons.length) {
      this.audio.play('deny');
      this.toast('No common items to salvage', 'bad');
      return 0;
    }
    let gold = 0;
    for (const item of commons) {
      this.inventory.splice(this.inventory.indexOf(item), 1);
      gold += item.salvage || 0;
    }
    this.gold += gold;
    this.audio.play('gold');
    this.toast(`Salvaged ${commons.length} items · +${gold}g`, 'gold');
    this.events.onInventoryDirty?.();
    this.events.onHudDirty?.();
    return gold;
  }

  gamble() {
    if (this.gold < this.gambleCost) {
      this.audio.play('deny');
      this.toast(`Need ${this.gambleCost}g to gamble`, 'bad');
      return null;
    }
    if (this.inventory.length >= INVENTORY_SIZE) {
      this.audio.play('deny');
      this.toast('Satchel full', 'bad');
      return null;
    }
    this.gold -= this.gambleCost;
    const item = generateItem(this.rng, {
      ilvl: this.itemLevelFor(1),
      minRarity: 'rare',
      magicFind: this.derived.magicFind + 20
    });
    this.gambles++;
    this.gambleCost = 120 + this.gambles * 55;
    this.addItemToInventory(item);
    this.audio.play('gear');
    this.toast(`Gambled: ${item.name}`, item.rarity === 'legendary' ? 'legendary' : 'rare');
    this.events.onHudDirty?.();
    this.events.onInventoryDirty?.();
    return item;
  }

  resolveLegendary(action) {
    const item = this.pendingLegendary;
    if (!item) return false;
    if (action === 'equip') {
      this.equipItem(item, { fromInventory: false });
    } else if (action === 'take') {
      if (!this.addItemToInventory(item)) {
        this.audio.play('deny');
        this.toast('Satchel full — equip it or salvage', 'bad');
        return false;
      }
      this.audio.play('gear');
    } else if (action === 'salvage') {
      this.gold += item.salvage;
      this.audio.play('gold');
      this.toast(`Salvaged ${item.name} · +${item.salvage}g`, 'gold');
    }
    this.pendingLegendary = null;
    this.state = 'playing';
    this.events.onLegendaryClose?.();
    this.events.onHudDirty?.();
    this.events.onInventoryDirty?.();
    return true;
  }

  /* ---------------- progression ---------------- */

  gainXp(value) {
    const gained = value * (1 + this.derived.xpGain / 100);
    this.xp += gained;
    while (this.xp >= this.xpNext) {
      this.xp -= this.xpNext;
      this.level++;
      this.xpNext = Math.floor(5 + this.level * 2.6);
      this.pendingLevels++;
    }
    this.events.onHudDirty?.();
  }

  rollBoons() {
    const available = BOONS.filter(b => (this.boonStacks[b.id] || 0) < b.max);
    const picks = shuffle(this.rng, available).slice(0, 3);
    while (picks.length < 3) {
      picks.push({
        id: 'blood_tithe', name: 'Blood Tithe', icon: 'heart', max: 99,
        desc: 'Restore 40% of your maximum life.', special: true
      });
    }
    this.choices = picks;
    return picks;
  }

  openLevelUp() {
    if (this.state !== 'playing') return;
    this.state = 'levelup';
    this.rerollCost = 25;
    this.rollBoons();
    this.audio.play('levelup');
    this.events.onLevelUp?.(this.choices, this.level, this.rerollCost);
  }

  chooseBoon(id) {
    if (this.state !== 'levelup') return;
    const boon = this.choices.find(b => b.id === id);
    if (!boon) return;
    if (boon.id === 'blood_tithe') {
      this.heal(this.derived.maxLife * 0.4);
    } else {
      this.boonStacks[id] = (this.boonStacks[id] || 0) + 1;
      boon.apply(this.boonStats);
      this.recalc();
      if (id === 'vitality') this.heal(25);
    }
    this.pendingLevels = Math.max(0, this.pendingLevels - 1);
    this.state = 'playing';
    this.events.onLevelUpClose?.();
    this.events.onHudDirty?.();
    if (this.pendingLevels > 0) this.openLevelUp();
  }

  rerollBoons() {
    if (this.state !== 'levelup') return false;
    if (this.gold < this.rerollCost) {
      this.audio.play('deny');
      this.toast(`Need ${this.rerollCost}g to reroll`, 'bad');
      return false;
    }
    this.gold -= this.rerollCost;
    this.rerollCost += 15;
    this.rollBoons();
    this.audio.play('ui');
    this.events.onLevelUp?.(this.choices, this.level, this.rerollCost);
    this.events.onHudDirty?.();
    return true;
  }

  recalc() {
    const oldMax = this.derived?.maxLife ?? 100;
    this.derived = aggregateEquipment(this.equipment, this.boonStats);
    if (this.player) {
      if (this.derived.maxLife > oldMax) this.player.hp += this.derived.maxLife - oldMax;
      this.player.hp = Math.min(this.player.hp, this.derived.maxLife);
    }
    this.events.onStats?.();
  }

  togglePause() {
    if (this.state === 'playing') {
      this.state = 'paused';
      this.events.onPause?.(true);
      return true;
    }
    if (this.state === 'paused') {
      this.state = 'playing';
      this.events.onPause?.(false);
      return true;
    }
    return false;
  }

  toggleInventory() {
    if (this.state === 'playing') {
      this.state = 'inventory';
      this.events.onInventory?.(true);
      return true;
    }
    if (this.state === 'inventory') {
      this.state = 'playing';
      this.events.onInventory?.(false);
      return true;
    }
    return false;
  }

  /* ---------------- pickups / fx ---------------- */

  updatePickups(dt) {
    const p = this.player;
    const d = this.derived;
    const keep = [];
    for (const item of this.pickups) {
      item.life -= dt;
      item.bob += dt * 3.2;
      if (item.life <= 0) continue;
      const dx = p.x - item.x;
      const dy = p.y - item.y;
      const dd = Math.hypot(dx, dy) || 1;
      if (item.type !== 'gear' && dd < d.pickup) {
        const pull = 260 + (1 - dd / d.pickup) * 480;
        item.x += (dx / dd) * pull * dt;
        item.y += (dy / dd) * pull * dt;
      } else {
        item.x += item.vx * dt;
        item.y += item.vy * dt;
        item.vx *= Math.exp(-4 * dt);
        item.vy *= Math.exp(-4 * dt);
      }
      if (dd < 22) {
        if (item.type === 'xp') {
          this.gainXp(item.value);
          this.addParticles(item.x, item.y, 3, { color: '#77d9d2', size: 2, life: 0.3, speed: 50, gravity: 0, glow: true });
          this.playSfx('pickup', 0.05);
        } else if (item.type === 'gold') {
          const value = Math.max(1, Math.round(item.value * (1 + d.goldFind / 100)));
          this.gold += value;
          if (d.flags.goldHeal > 0) this.heal(d.flags.goldHeal, true);
          this.addParticles(item.x, item.y, 3, { color: '#f0d28e', size: 2, life: 0.3, speed: 50, gravity: 0, glow: true });
          this.playSfx('gold', 0.06);
          this.events.onHudDirty?.();
        } else if (item.type === 'health') {
          this.heal(d.maxLife * 0.14);
          this.events.onHudDirty?.();
        }
        continue;
      }
      keep.push(item);
    }
    this.pickups = keep;
  }

  addParticles(x, y, count, {
    color = '#fff', size = 2, life = 0.4, speed = 60, angle = null,
    spread = TAU, gravity = 0, glow = false
  } = {}) {
    for (let i = 0; i < count; i++) {
      const a = angle === null ? this.rng.range(0, TAU) : angle + this.rng.range(-spread / 2, spread / 2);
      const s = speed * this.rng.range(0.35, 1.2);
      this.particles.push({
        x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s,
        life: life * this.rng.range(0.6, 1.2), maxLife: life,
        size: size * this.rng.range(0.6, 1.4), color, gravity, glow,
        drag: 2.2
      });
    }
  }

  addDamageNumber(x, y, value, color, crit = false, scale = 1) {
    if (this.damageNumbers.length > 90) this.damageNumbers.shift();
    this.damageNumbers.push({
      x: x + this.rng.range(-6, 6), y, value: String(value),
      color, crit, life: 0.72, maxLife: 0.72, vy: -42, scale
    });
  }

  addDecal(x, y, radius, color) {
    if (this.decals.length > 180) this.decals.shift();
    this.decals.push({
      x, y, radius, color, rot: this.rng.range(0, TAU),
      seed: this.rng.next(), life: 22, maxLife: 22
    });
  }

  updateParticles(dt) {
    const keep = [];
    for (const p of this.particles) {
      p.life -= dt;
      if (p.life <= 0) continue;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += p.gravity * dt;
      p.vx *= Math.exp(-p.drag * dt);
      p.vy *= Math.exp(-p.drag * dt);
      keep.push(p);
    }
    this.particles = keep;
    for (const d of this.decals) d.life -= dt;
    this.decals = this.decals.filter(d => d.life > 0);
  }

  updateEffects(dt) {
    for (const e of this.effects) e.life -= dt;
    this.effects = this.effects.filter(e => e.life > 0);
  }

  updateDamageNumbers(dt) {
    const keep = [];
    for (const n of this.damageNumbers) {
      n.life -= dt;
      if (n.life <= 0) continue;
      n.y += n.vy * dt;
      n.vy *= Math.exp(-2.2 * dt);
      keep.push(n);
    }
    this.damageNumbers = keep;
  }

  updateCamera(dt) {
    const targetX = this.player.x;
    const targetY = this.player.y;
    const k = 1 - Math.exp(-8 * dt);
    this.camera.x += (targetX - this.camera.x) * k;
    this.camera.y += (targetY - this.camera.y) * k;
    const halfW = this.viewport.w / 2 / this.zoom;
    const halfH = this.viewport.h / 2 / this.zoom;
    this.camera.x = halfW >= ARENA ? 0 : clamp(this.camera.x, -ARENA + halfW, ARENA - halfW);
    this.camera.y = halfH >= ARENA ? 0 : clamp(this.camera.y, -ARENA + halfH, ARENA - halfH);
  }

  /* ---------------- spatial ---------------- */

  buildGrid() {
    this.grid = new Map();
    for (const e of this.enemies) {
      if (e.dead) continue;
      const key = `${Math.floor(e.x / CELL)},${Math.floor(e.y / CELL)}`;
      let bucket = this.grid.get(key);
      if (!bucket) this.grid.set(key, bucket = []);
      bucket.push(e);
    }
  }

  nearby(x, y, radius) {
    if (!this.grid) return this.enemies;
    const out = [];
    const x0 = Math.floor((x - radius) / CELL);
    const x1 = Math.floor((x + radius) / CELL);
    const y0 = Math.floor((y - radius) / CELL);
    const y1 = Math.floor((y + radius) / CELL);
    for (let cx = x0; cx <= x1; cx++) {
      for (let cy = y0; cy <= y1; cy++) {
        const bucket = this.grid.get(`${cx},${cy}`);
        if (bucket) for (const e of bucket) if (!e.dead) out.push(e);
      }
    }
    return out;
  }

  /* ---------------- misc ---------------- */

  toast(text, tone = '') {
    this.events.onToast?.(text, tone);
  }

  playSfx(name, minGap = 0, options) {
    if (name === 'hit') {
      if (this.time - this.lastHitSound < minGap) return;
      this.lastHitSound = this.time;
    }
    if (name === 'kill') {
      if (this.time - this.lastKillSound < minGap) return;
      this.lastKillSound = this.time;
    }
    this.audio.play(name, options);
  }

  waveLabel() {
    let label = WAVE_LABELS[0][1];
    for (const [t, text] of WAVE_LABELS) if (this.time >= t) label = text;
    return label;
  }
}
