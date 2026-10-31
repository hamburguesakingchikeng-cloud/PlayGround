// ============================================================
// LA ESPADA CELESTIAL — entidades jugables
// ============================================================
import { clamp, dist, dist2, angleTo, angleDiff, angleLerp, norm, choose, chance, TAU, ELEMENTS } from './core.js';
import { ITEMS, CREATURES, ENEMIES, SKILLS } from './data.js';

const BASE = { vida: 5, mana: 5, resistencia: 5, fuerza: 5, defensa: 5, velocidad: 5, inteligencia: 5, suerte: 5 };

export class Player {
  constructor(game, profile) {
    this.game = game;
    this.name = profile.name || 'Aurora';
    this.look = {
      face: profile.face || 'serena', hair: profile.hair || 'corto', hairColor: profile.hairColor || 'azabache',
      outfit: profile.outfit || 'viajero', accessory: profile.accessory || 'ninguno',
    };
    this.attrs = { ...BASE, ...(profile.attributes || {}) };
    this.level = 1;
    this.xp = 0;
    this.xpNext = 60;
    this.points = 0;
    this.skillPoints = 0;
    this.gold = 30;
    this.x = 0; this.y = 0;
    this.r = 14;
    this.vx = 0; this.vy = 0;
    this.facing = -Math.PI / 2;
    this.state = 'idle';
    this.stateTime = 0;
    this.attackIndex = 0;
    this.attackTime = 0;
    this.attackQueued = false;
    this.hasHit = false;
    this.comboReset = 0;
    this.dodgeTime = 0;
    this.dodgeDir = { x: 0, y: -1 };
    this.castIndex = -1;
    this.castTime = 0;
    this.castAim = 0;
    this.blockTime = 0;
    this.blocking = false;
    this.parryWindow = 0;
    this.invuln = 0;
    this.hurtFlash = 0;
    this.dead = false;
    this.deathTime = 0;
    this.walkPhase = 0;
    this.bob = 0;
    this.staminaDelay = 0;
    this.manaDelay = 0;
    this.spellCooldowns = [0, 0, 0];
    this.statuses = { burn: 0, poison: 0, slow: 0, weaken: 0, shield: 0, haste: 0 };
    this.shieldTimer = 0;
    this.regenTimer = 0;
    this.hitstop = 0;
    this.companion = null;
    this.recalc(game);
    this.hp = this.maxHP;
    this.mp = this.maxMP;
    this.stamina = this.maxStamina;
  }

  recalc(game) {
    const eq = game.equipment || {};
    const items = Object.values(eq).map(id => ITEMS[id]).filter(Boolean);
    const sum = (key) => items.reduce((a, it) => (
      a + (it.stats?.[key] || 0) + (game.itemUpgradeBonus?.(it.id, key) || 0)
    ), 0);
    const sk = game.skillBonus ? game.skillBonus() : {};
    this.maxHP = Math.round(70 + this.attrs.vida * 9 + this.level * 8 + sum('hp') + (sk.hp || 0));
    this.maxMP = Math.round(25 + this.attrs.mana * 7 + this.level * 2 + sum('mp'));
    this.maxStamina = Math.round(70 + this.attrs.resistencia * 5 + this.level * 2 + sum('stam') + (sk.stam || 0));
    this.attack = Math.round(5 + this.attrs.fuerza * 1.6 + this.level * 0.9 + sum('atk'));
    this.defense = Math.round((2 + this.attrs.defensa * 1.1 + this.level * 0.4 + sum('def')) * (1 + (sk.defPct || 0)));
    this.speed = 150 + this.attrs.velocidad * 3.2 + sum('spd');
    this.spellPower = 4 + this.attrs.inteligencia * 2.2 + this.level * 0.7;
    this.crit = 5 + this.attrs.suerte * 1.0 + sum('crit') + (sk.crit || 0);
    this.critDmg = 1.6 + (sk.critDmg || 0);
    this.luck = this.attrs.suerte * 1.5 + sum('luck') + (sk.luck || 0);
    this.captureBonus = (sum('capture') / 100) + (sk.capture || 0) + this.attrs.suerte * 0.004;
    this.allDmg = 1 + (sum('allDmg') || 0) / 100 + (sk.allDmg || 0);
    this.fireBonus = (sum('fire') || 0) / 100;
    this.fireRes = clamp((sum('fireRes') || 0) / 100, 0, 0.75);
    this.reveal = (sk.reveal || 0) + (sum('reveal') || 0);
    this.weaponElement = items.find(i => i.type === 'weapon')?.element || 'luz';
    this.weaponGlow = items.find(i => i.type === 'weapon')?.glow || '#ffe9a8';
    this.weaponColor = items.find(i => i.type === 'weapon')?.color || '#e8e2cf';
    this.armorColor = items.find(i => i.type === 'armor')?.color;
    this.armorTrim = items.find(i => i.type === 'armor')?.trim;
    this.helmetColor = items.find(i => i.type === 'helmet')?.color;
    this.helmetId = eq.helmet || null;
    this.weaponId = eq.weapon || null;
    this.hp = Math.min(this.hp ?? this.maxHP, this.maxHP);
    this.mp = Math.min(this.mp ?? this.maxMP, this.maxMP);
    this.stamina = Math.min(this.stamina ?? this.maxStamina, this.maxStamina);
  }

  get hpPct() { return this.maxHP ? this.hp / this.maxHP : 0; }
  get mpPct() { return this.maxMP ? this.mp / this.maxMP : 0; }
  get staminaPct() { return this.maxStamina ? this.stamina / this.maxStamina : 0; }
  get busy() { return this.state === 'attack' || this.state === 'heavy' || this.state === 'dodge' || this.state === 'cast' || this.state === 'hurt' || this.state === 'dead'; }
  get moving() { return Math.abs(this.vx) + Math.abs(this.vy) > 8; }

  update(dt, game) {
    this.stateTime += dt;
    this.walkPhase += dt * (this.moving ? 9 : 2.2);
    this.hurtFlash = Math.max(0, this.hurtFlash - dt * 4);
    this.invuln = Math.max(0, this.invuln - dt);
    this.spellCooldowns = this.spellCooldowns.map(c => Math.max(0, c - dt));
    this.comboReset = Math.max(0, this.comboReset - dt);
    this.shieldTimer = Math.max(0, this.shieldTimer - dt);
    this.hitstop = Math.max(0, this.hitstop - dt);
    if (this.dead) { this.deathTime += dt; return; }
    if (this.hitstop > 0) return;

    // estados
    for (const k of Object.keys(this.statuses)) this.statuses[k] = Math.max(0, this.statuses[k] - dt);
    if (this.statuses.burn > 0 && Math.random() < dt * 3) {
      this.hp -= 1 + this.level * 0.35;
      game.addText(this.x, this.y - 48, '−' + Math.round(1 + this.level * 0.35), '#ff8a5c', 12);
      if (this.hp <= 0) this.die(game);
    }
    if (this.statuses.poison > 0 && Math.random() < dt * 2.5) {
      this.hp -= 1;
      game.addText(this.x, this.y - 42, '−1', '#9fd67a', 11);
    }

    // regeneración
    this.staminaDelay = Math.max(0, this.staminaDelay - dt);
    this.manaDelay = Math.max(0, this.manaDelay - dt);
    const stamRegen = (18 + this.attrs.resistencia * 0.8) * (game.hasSkill('ancla') ? 1.5 : 1);
    if (this.state !== 'dodge' && this.state !== 'attack' && this.state !== 'heavy') {
      this.stamina = Math.min(this.maxStamina, this.stamina + stamRegen * dt);
    }
    if (this.manaDelay <= 0) this.mp = Math.min(this.maxMP, this.mp + (3.5 + this.attrs.inteligencia * 0.08) * dt);
    const threat = game.enemies?.some(e => !e.dead && e.aggro && dist2(e.x, e.y, this.x, this.y) < 500 ** 2);
    if (!threat) this.hp = Math.min(this.maxHP, this.hp + (1.2 + this.attrs.vida * 0.02) * dt);
    if (this.statuses.shield > 0) this.statuses.shield = Math.max(0, this.statuses.shield - dt);

    if (game.state !== 'playing' || game.dialogueOpen || game.ui.blockingInput) { this.vx = this.vy = 0; return; }

    // dirección de apuntado
    const aim = game.getAimAngle(this);
    if (!this.busy) this.facing = aim;

    // acciones
    const input = game.input;
    if (this.state === 'idle' || this.state === 'move' || this.state === 'block') {
      if (input.isDown('block') && this.stamina > 1) {
        if (this.state !== 'block') { this.state = 'block'; this.stateTime = 0; this.blockTime = 0; }
        this.blocking = true;
        this.blockTime += dt;
      } else {
        if (this.state === 'block') { this.state = 'idle'; this.blocking = false; }
      }
      if (input.consume('dodge')) this.tryDodge(game);
      else if (input.consume('heavy')) this.tryHeavy(game, aim);
      else if (input.isDown('attack')) this.tryAttack(game, aim);
      else if (input.consume('spell1')) game.castSpell(0);
      else if (input.consume('spell2')) game.castSpell(1);
      else if (input.consume('spell3')) game.castSpell(2);
      else if (input.consume('potion')) game.usePotion();
      else if (input.consume('creature')) game.useCreatureSkill();
      else if (input.consume('capture')) game.tryCaptureNearest();
    }

    // movimiento
    if (!this.busy && this.state !== 'block') {
      const mx = input.moveX, my = input.moveY;
      const m = Math.hypot(mx, my);
      if (m > 0.15) {
        const n = norm(mx, my);
        const sp = this.speed * clamp(m, 0, 1) * (this.statuses.slow > 0 ? 0.6 : 1);
        this.vx = n.x * sp; this.vy = n.y * sp;
        if (this.state !== 'move') { this.state = 'move'; this.stateTime = 0; }
      } else {
        this.vx *= 0.7; this.vy *= 0.7;
        if (this.state === 'move') this.state = 'idle';
      }
    } else if (this.state === 'block') {
      const mx = input.moveX, my = input.moveY;
      const m = Math.hypot(mx, my);
      if (m > 0.15) {
        const n = norm(mx, my);
        this.vx = n.x * this.speed * 0.38; this.vy = n.y * this.speed * 0.38;
      } else { this.vx *= 0.6; this.vy *= 0.6; }
    } else {
      this.vx *= 0.85; this.vy *= 0.85;
    }

    // estados con temporizador
    if (this.state === 'attack') this.updateAttack(dt, game);
    else if (this.state === 'heavy') this.updateHeavy(dt, game);
    else if (this.state === 'dodge') this.updateDodge(dt, game);
    else if (this.state === 'cast') this.updateCast(dt, game);
    else if (this.state === 'hurt' && this.stateTime > 0.24) { this.state = 'idle'; this.stateTime = 0; }

    // aplicar movimiento
    if (Math.abs(this.vx) + Math.abs(this.vy) > 0.5) {
      game.moveEntity(this, this.vx * dt, this.vy * dt);
    }
    this.bob = Math.sin(this.walkPhase) * (this.moving ? 1.4 : 0.5);
  }

  tryAttack(game, aim) {
    if (this.state === 'attack') {
      if (this.attackTime > 0.1) this.attackQueued = true;
      return;
    }
    if (this.stamina < 6) { game.toast('Sin resistencia', 'bad'); return; }
    this.state = 'attack';
    this.stateTime = 0;
    this.attackTime = 0;
    this.attackIndex = this.comboReset > 0 ? (this.attackIndex % 3) + 1 : 1;
    this.comboReset = 0.85;
    this.hasHit = false;
    this.attackQueued = false;
    this.facing = aim;
    this.stamina -= 7;
    this.staminaDelay = 0.35;
    game.audio.sfx('slash');
  }

  updateAttack(dt, game) {
    this.attackTime += dt;
    if (!this.hasHit && this.attackTime >= 0.12) {
      this.hasHit = true;
      game.playerMeleeHit(this, false);
    }
    if (this.attackTime >= 0.34) {
      if (this.attackQueued && this.stamina >= 6) {
        this.attackQueued = false;
        this.attackIndex = (this.attackIndex % 3) + 1;
        this.attackTime = 0;
        this.hasHit = false;
        this.stateTime = 0;
        this.stamina -= 6;
        this.facing = game.getAimAngle(this);
        game.audio.sfx('slash');
      } else {
        this.state = 'idle'; this.stateTime = 0; this.attackIndex = 0;
      }
    }
  }

  tryHeavy(game, aim) {
    if (this.stamina < 18) { game.toast('Sin resistencia', 'bad'); return; }
    this.state = 'heavy'; this.stateTime = 0; this.attackTime = 0; this.hasHit = false;
    this.facing = aim; this.stamina -= 18; this.staminaDelay = 0.5;
    game.audio.sfx('slash');
  }
  updateHeavy(dt, game) {
    this.attackTime += dt;
    if (!this.hasHit && this.attackTime >= 0.32) { this.hasHit = true; game.playerMeleeHit(this, true); }
    if (this.attackTime >= 0.62) { this.state = 'idle'; this.stateTime = 0; }
  }

  tryDodge(game) {
    const cost = 16 - (game.hasSkill('paso_umbrio') ? 3 : 0);
    if (this.stamina < cost) { game.toast('Sin resistencia', 'bad'); return; }
    const mx = game.input.moveX, my = game.input.moveY;
    const dir = Math.hypot(mx, my) > 0.2 ? norm(mx, my) : { x: Math.cos(this.facing), y: Math.sin(this.facing) };
    this.state = 'dodge'; this.stateTime = 0; this.dodgeTime = 0; this.dodgeDir = dir;
    this.invuln = 0.27 + (game.hasSkill('paso_umbrio') ? 0.1 : 0);
    this.stamina -= cost; this.staminaDelay = 0.5;
    game.audio.sfx('dodge');
    game.spawnParticles(this.x, this.y, 8, '#c7f0e0', 60, 0.35, 2);
  }
  updateDodge(dt, game) {
    this.dodgeTime += dt;
    const t = clamp(this.dodgeTime / 0.34, 0, 1);
    const sp = 500 * (1 - t * 0.55);
    this.vx = this.dodgeDir.x * sp;
    this.vy = this.dodgeDir.y * sp;
    if (Math.random() < 0.7) game.spawnParticles(this.x, this.y, 1, '#e8fbff', 18, 0.3, 1.4);
    if (this.dodgeTime >= 0.34) {
      this.state = 'idle'; this.stateTime = 0;
      if (game.hasSkill('segundo_aliento') && game.enemies?.some(e => !e.dead && e.aggro)) {
        this.hp = Math.min(this.maxHP, this.hp + this.maxHP * 0.04);
        game.addText(this.x, this.y - 60, '+4%', '#7ddc9a', 12);
      }
    }
  }

  startCast(game, index, aim) {
    this.state = 'cast'; this.stateTime = 0; this.castTime = 0; this.castIndex = index; this.castAim = aim;
    this.facing = aim;
  }
  updateCast(dt, game) {
    this.castTime += dt;
    if (this.castTime >= 0.24 && this.castIndex >= 0) {
      const idx = this.castIndex; this.castIndex = -1;
      game.executeSpell(idx, this.castAim);
    }
    if (this.castTime >= 0.5) { this.state = 'idle'; this.stateTime = 0; }
  }

  takeDamage(amount, game, opts = {}) {
    if (this.dead || this.invuln > 0) return 0;
    if (this.statuses.shield > 0) {
      const absorbed = Math.min(amount, this.statuses.shield);
      this.statuses.shield -= absorbed; amount -= absorbed;
      game.addText(this.x, this.y - 50, 'ESCUDO', '#9fe8ff', 11);
    }
    const def = this.defense * 0.55;
    let dmg = amount * (100 / (100 + def));
    if (this.statuses.weaken > 0) dmg *= 1.15;
    if (opts.element === 'fuego') dmg *= (1 - this.fireRes);
    dmg = Math.max(1, Math.round(dmg));
    this.hp -= dmg;
    this.hurtFlash = 1;
    this.invuln = opts.invuln ?? 0.45;
    this.state = 'hurt'; this.stateTime = 0; this.vx = 0; this.vy = 0;
    game.addText(this.x, this.y - 52, '−' + dmg, '#ff8a72', 15);
    game.audio.sfx('hurt');
    game.shake(4, 0.18);
    game.spawnParticles(this.x, this.y - 20, 7, '#e25a4f', 90, 0.4, 2);
    if (opts.knockback) {
      const n = norm(opts.knockback.x, opts.knockback.y);
      game.moveEntity(this, n.x * 24, n.y * 24);
    }
    if (this.hp <= 0) this.die(game);
    return dmg;
  }

  heal(amount, game, silent = false) {
    const before = this.hp;
    this.hp = Math.min(this.maxHP, this.hp + amount);
    const healed = Math.round(this.hp - before);
    if (healed > 0 && !silent) game.addText(this.x, this.y - 52, '+' + healed, '#7ddc9a', 14);
    return healed;
  }
  die(game) {
    if (this.dead) return;
    this.dead = true; this.hp = 0; this.state = 'dead'; this.deathTime = 0;
    game.onPlayerDeath();
  }
}

// ============================================================
// ENEMIGOS
// ============================================================
export class Enemy {
  constructor(game, defId, x, y, opts = {}) {
    this.game = game;
    this.def = ENEMIES[defId];
    if (!this.def) throw new Error('Enemigo desconocido: ' + defId);
    this.id = defId;
    this.name = this.def.name;
    this.x = x; this.y = y;
    this.spawnX = x; this.spawnY = y;
    this.level = opts.level || game.zone?.level || 1;
    this.elite = !!opts.elite;
    this.boss = this.def.tier === 'boss';
    this.r = this.def.radius || 18;
    this.scale = this.boss ? 1 : (this.elite ? 1.18 : 1);
    const lvlMul = 1 + 0.28 * (this.level - 1);
    const eliteMul = this.elite ? 1.7 : 1;
    this.maxHP = Math.round(this.def.hp * lvlMul * eliteMul);
    this.hp = this.maxHP;
    this.atk = this.def.atk * (1 + 0.17 * (this.level - 1)) * (this.elite ? 1.3 : 1);
    this.defense = this.def.def * (1 + 0.12 * (this.level - 1)) * (this.elite ? 1.25 : 1);
    this.speed = this.def.speed * (this.elite ? 1.1 : 1);
    this.poise = this.maxPoise = this.def.poise * (this.elite ? 1.4 : 1);
    this.xp = Math.round(this.def.xp * (1 + 0.15 * (this.level - 1)) * (this.elite ? 1.8 : 1));
    this.gold = Math.round(this.def.gold * (1 + 0.1 * (this.level - 1)) * (this.elite ? 1.8 : 1));
    this.aggro = false;
    this.awake = !this.boss;
    this.state = 'idle';
    this.stateTime = 0;
    this.attackCooldown = 0.6 + Math.random() * 0.8;
    this.windup = 0;
    this.windupMax = 0;
    this.pattern = null;
    this.telegraph = null;
    this.stagger = 0;
    this.dead = false;
    this.deathTime = 0;
    this.hitFlash = 0;
    this.facing = Math.random() * TAU;
    this.patrolAngle = Math.random() * TAU;
    this.patrolTimer = 0;
    this.phase = 1;
    this.phaseAnnounced = 1;
    this.statuses = { burn: 0, poison: 0, slow: 0, weaken: 0, mark: 0 };
    this.statusPower = { burn: 0, poison: 0 };
    this.animTime = Math.random() * 10;
    this.hover = Math.random() * TAU;
    this.capturable = this.def.capturable;
    this.captureImmune = 0;
    this.rage = 0;
    this.adds = [];
    this.spawnFx = 0.5;
  }

  get hpPct() { return this.hp / this.maxHP; }
  get canCapture() {
    return !this.boss && this.capturable && this.hpPct <= 0.35 && this.stagger > 0 && this.captureImmune <= 0;
  }

  update(dt, game) {
    this.animTime += dt;
    this.hitFlash = Math.max(0, this.hitFlash - dt * 4);
    this.captureImmune = Math.max(0, this.captureImmune - dt);
    this.attackCooldown = Math.max(0, this.attackCooldown - dt);
    this.spawnFx = Math.max(0, this.spawnFx - dt);
    if (this.dead) { this.deathTime += dt; return; }
    if (!this.awake) return;
    for (const k of Object.keys(this.statuses)) this.statuses[k] = Math.max(0, this.statuses[k] - dt);
    if (this.statuses.burn > 0 && Math.random() < dt * 4) {
      const dmg = Math.max(1, Math.round(this.statusPower.burn));
      this.hp -= dmg; game.addText(this.x, this.y - this.r - 30, '−' + dmg, '#ff8a5c', 11);
      if (this.hp <= 0) return this.die(game);
    }
    if (this.statuses.poison > 0 && Math.random() < dt * 3) {
      const dmg = Math.max(1, Math.round(this.statusPower.poison));
      this.hp -= dmg; game.addText(this.x, this.y - this.r - 26, '−' + dmg, '#9fd67a', 10);
      if (this.hp <= 0) return this.die(game);
    }
    if (this.stagger > 0) {
      this.stagger -= dt;
      this.state = 'stagger'; this.telegraph = null;
      if (this.stagger <= 0) { this.state = 'idle'; this.poise = this.maxPoise; }
      return;
    }
    if (this.state === 'hurt') {
      this.stateTime += dt;
      if (this.stateTime > 0.25) this.state = 'idle';
      return;
    }
    const p = game.player;
    if (!p || p.dead) return;
    const d = dist(this.x, this.y, p.x, p.y);
    const ang = angleTo(this.x, this.y, p.x, p.y);
    if (!this.aggro && d < this.def.aggro) this.aggro = true;
    if (!this.aggro) { this.patrol(dt, game); return; }
    this.facing = angleLerp(this.facing, ang, clamp(dt * 6, 0, 1));
    if (this.boss) return this.updateBoss(dt, game, d, ang);

    const slow = this.statuses.slow > 0 ? 0.55 : 1;
    const speed = this.speed * slow * (this.rage > 0 ? 1.2 : 1);

    if (this.state === 'windup') {
      this.windup -= dt;
      if (this.windup <= 0) this.executeAttack(game, ang, d);
      return;
    }
    if (this.state === 'dash') {
      this.stateTime += dt;
      const sp = 380 * (this.elite ? 1.15 : 1);
      game.moveEntity(this, Math.cos(this.facing) * sp * dt, Math.sin(this.facing) * sp * dt);
      if (d < this.r + p.r + 18 && this.stateTime > 0.05) {
        game.damagePlayer(this.atk * 1.1, { source: this, element: this.def.element, knockback: { x: Math.cos(this.facing), y: Math.sin(this.facing) } });
        this.state = 'recover'; this.stateTime = 0; this.attackCooldown = 1.5;
      }
      if (this.stateTime > 0.36) { this.state = 'recover'; this.stateTime = 0; }
      return;
    }
    if (this.state === 'recover') {
      this.stateTime += dt;
      if (this.stateTime > 0.35) this.state = 'chase';
      return;
    }

    const behavior = this.def.behavior;
    if (behavior === 'ranged') {
      if (d > 270) this.moveToward(p.x, p.y, speed, dt, game);
      else if (d < 150) this.moveToward(p.x, p.y, -speed * 0.8, dt, game);
      else {
        const strafe = ang + Math.PI / 2 * (Math.sin(this.animTime * 0.8) > 0 ? 1 : -1);
        this.moveToward(this.x + Math.cos(strafe) * 100, this.y + Math.sin(strafe) * 100, speed * 0.35, dt, game);
      }
      if (this.attackCooldown <= 0 && d < 380) this.startWindup(0.55, 'ranged');
    } else if (behavior === 'charger') {
      if (d > 90) this.moveToward(p.x, p.y, speed, dt, game);
      if (this.attackCooldown <= 0 && d < 260 && d > 50) this.startWindup(0.55, 'dash');
    } else if (behavior === 'flyer') {
      this.hover += dt * 3;
      const tx = p.x + Math.cos(this.hover) * 40, ty = p.y - 60 + Math.sin(this.hover * 1.3) * 30;
      if (d > 60) this.moveToward(tx, ty, speed, dt, game);
      if (this.attackCooldown <= 0 && d < 120) this.startWindup(0.4, 'melee');
    } else {
      if (d > this.def.range * 0.8) this.moveToward(p.x, p.y, speed, dt, game);
      if (this.attackCooldown <= 0 && d < this.def.range + 12) this.startWindup(this.elite ? 0.65 : 0.5, 'melee');
    }
    // separación
    for (const o of game.enemies) {
      if (o === this || o.dead) continue;
      const dd = dist2(this.x, this.y, o.x, o.y);
      if (dd < (this.r + o.r + 4) ** 2 && dd > 0.01) {
        const n = norm(this.x - o.x, this.y - o.y);
        this.x += n.x * 14 * dt; this.y += n.y * 14 * dt;
      }
    }
  }

  patrol(dt, game) {
    this.patrolTimer -= dt;
    if (this.patrolTimer <= 0) { this.patrolTimer = 2 + Math.random() * 3; this.patrolAngle += (Math.random() - 0.5) * 1.8; }
    const sp = this.speed * 0.22;
    const nx = this.x + Math.cos(this.patrolAngle) * sp * dt;
    const ny = this.y + Math.sin(this.patrolAngle) * sp * dt;
    if (dist(nx, ny, this.spawnX, this.spawnY) < 110 && !game.zone.isBlocked(nx, ny, this.r)) { this.x = nx; this.y = ny; }
    else this.patrolAngle += Math.PI * 0.7;
  }

  moveToward(tx, ty, speed, dt, game) {
    const n = norm(tx - this.x, ty - this.y);
    const nx = this.x + n.x * speed * dt, ny = this.y + n.y * speed * dt;
    if (!game.zone.isBlocked(nx, ny, this.r)) { this.x = nx; this.y = ny; }
    else {
      const perp = { x: -n.y, y: n.x };
      const px = this.x + perp.x * speed * dt, py = this.y + perp.y * speed * dt;
      if (!game.zone.isBlocked(px, py, this.r)) { this.x = px; this.y = py; }
    }
  }

  startWindup(duration, type) {
    this.state = 'windup'; this.stateTime = 0; this.windup = duration; this.windupMax = duration;
    this.pattern = type;
    this.telegraph = { type, x: this.x, y: this.y, angle: this.facing, range: this.def.range + 40, radius: this.r + 60, timer: duration, duration, color: this.def.colors?.glow || '#ff8a5c' };
  }

  executeAttack(game, ang, d) {
    const p = game.player;
    const type = this.pattern;
    this.telegraph = null;
    if (type === 'melee') {
      const hit = dist(this.x, this.y, p.x, p.y) < this.def.range + 26 && Math.abs(angleDiff(this.facing, angleTo(this.x, this.y, p.x, p.y))) < 1.2;
      if (hit) game.damagePlayer(this.atk, { source: this, element: this.def.element, knockback: { x: Math.cos(this.facing), y: Math.sin(this.facing) } });
      game.spawnSlash(this.x, this.y, this.facing, this.def.range + 30, this.def.colors?.glow || '#ff8a5c', 0.22);
      game.audio.sfx('slash');
      this.attackCooldown = 1.1 + Math.random() * 0.6;
      this.state = 'recover'; this.stateTime = 0;
    } else if (type === 'ranged') {
      const n = norm(p.x - this.x, p.y - this.y);
      game.spawnProjectile({ x: this.x, y: this.y - 12, vx: n.x * 280, vy: n.y * 280, r: 9, damage: this.atk * 0.9, team: 'enemy', element: this.def.element, color: this.def.colors?.glow || '#b48cff', life: 2.4, source: this });
      game.audio.sfx('spell_dark');
      this.attackCooldown = 2 + Math.random() * 1.2;
      this.state = 'recover'; this.stateTime = 0;
    } else if (type === 'dash') {
      this.state = 'dash'; this.stateTime = 0;
      game.audio.sfx('dodge');
    }
  }

  updateBoss(dt, game, d, ang) {
    const p = game.player;
    if (this.state === 'windup') {
      this.windup -= dt;
      if (this.telegraph) {
        this.telegraph.timer = this.windup;
        this.telegraph.x = this.x; this.telegraph.y = this.y;
        this.telegraph.angle = ang;
      }
      if (this.windup <= 0) this.executeBossPattern(game, ang, d);
      return;
    }
    if (this.state === 'recover') {
      this.stateTime += dt;
      if (this.stateTime > Math.max(0.35, 0.8 - this.phase * 0.12)) { this.state = 'chase'; this.attackCooldown = Math.max(0.6, 1.6 - this.phase * 0.2); }
      return;
    }
    // fase
    const ratio = this.hp / this.maxHP;
    const newPhase = ratio < 0.3 ? 3 : ratio < 0.6 ? 2 : 1;
    if (newPhase > this.phase) {
      this.phase = newPhase;
      game.onBossPhase(this);
      this.attackCooldown = 0.8;
      game.spawnParticles(this.x, this.y, 30, this.def.colors?.glow || '#ff8a5c', 180, 1, 4);
    }
    const speed = this.speed * (1 + (this.phase - 1) * 0.18) * (this.statuses.slow > 0 ? 0.55 : 1);
    if (this.state !== 'windup') {
      if (d > 150) this.moveToward(p.x, p.y, speed, dt, game);
      else if (d < 90) this.moveToward(p.x, p.y, -speed * 0.5, dt, game);
      if (this.attackCooldown <= 0) this.chooseBossPattern(game, d);
    }
  }

  chooseBossPattern(game, d) {
    const patterns = this.def.attacks || [];
    const usable = patterns.filter(a => {
      if (a.type === 'melee' && d > 220) return false;
      if (a.type === 'ring' && d < 60) return false;
      return true;
    });
    if (!usable.length) return;
    let pick = choose(usable);
    if (pick.id === this.lastPattern && usable.length > 1) pick = choose(usable);
    this.lastPattern = pick.id;
    this.pattern = pick;
    this.windup = Math.max(0.4, pick.windup - (this.phase - 1) * 0.12);
    this.windupMax = this.windup;
    this.state = 'windup'; this.stateTime = 0;
    const color = pick.color || this.def.colors?.glow || '#ff8a5c';
    this.telegraph = {
      type: pick.type, x: this.x, y: this.y, angle: this.facing,
      range: pick.range || 160, width: pick.width || 40, radius: pick.radius || 150,
      timer: this.windup, duration: this.windup, color, pattern: pick,
    };
    game.audio.sfx('roar');
  }

  executeBossPattern(game, ang, d) {
    const p = game.player;
    const a = this.pattern;
    this.telegraph = null;
    this.state = 'recover'; this.stateTime = 0;
    const dmgMul = 1 + (this.phase - 1) * 0.18;
    if (!a) return;
    if (a.type === 'melee') {
      if (dist(this.x, this.y, p.x, p.y) < (a.range || 160) + 30 && Math.abs(angleDiff(ang, angleTo(this.x, this.y, p.x, p.y))) < 1.4) {
        game.damagePlayer(this.atk * a.damage * dmgMul, { source: this, element: this.def.element, knockback: { x: Math.cos(ang), y: Math.sin(ang) } });
      }
      game.spawnSlash(this.x, this.y, ang, a.range || 160, a.color, 0.3, 18);
      game.audio.sfx('heavy');
    } else if (a.type === 'aoe') {
      if (dist(this.x, this.y, p.x, p.y) < (a.radius || 150) + p.r) {
        game.damagePlayer(this.atk * a.damage * dmgMul, { source: this, element: this.def.element, knockback: { x: p.x - this.x, y: p.y - this.y } });
        if (a.burn) game.applyPlayerStatus('burn', a.burn);
        if (a.stun) game.applyPlayerStatus('slow', a.stun);
        if (a.root) game.applyPlayerStatus('slow', a.root);
      }
      game.spawnRing(this.x, this.y, a.radius || 150, a.color, 0.5);
      game.shake(12, 0.35);
      game.audio.sfx('heavy');
    } else if (a.type === 'beam') {
      const hit = game.lineHit(this.x, this.y, ang, a.range || 400, a.width || 40, p.x, p.y, p.r);
      if (hit) game.damagePlayer(this.atk * a.damage * dmgMul, { source: this, element: this.def.element });
      game.spawnBeam(this.x, this.y, ang, a.range || 400, a.width || 40, a.color, 0.45);
      game.audio.sfx('spell');
    } else if (a.type === 'ring') {
      if (dist(this.x, this.y, p.x, p.y) < (a.radius || 260) + p.r && dist(this.x, this.y, p.x, p.y) > 70) {
        game.damagePlayer(this.atk * a.damage * dmgMul, { source: this, element: this.def.element, knockback: { x: p.x - this.x, y: p.y - this.y } });
      }
      game.spawnRing(this.x, this.y, a.radius || 260, a.color, 0.6, true);
      game.audio.sfx('roar');
    } else if (a.type === 'projectiles') {
      const count = (a.count || 5) + (this.phase - 1) * 2;
      const spread = a.spread || 0.7;
      for (let i = 0; i < count; i++) {
        const t = count === 1 ? 0 : i / (count - 1) - 0.5;
        const aa = ang + t * spread;
        game.spawnProjectile({ x: this.x, y: this.y - 20, vx: Math.cos(aa) * (a.speed || 280), vy: Math.sin(aa) * (a.speed || 280), r: 10, damage: this.atk * a.damage * dmgMul, team: 'enemy', element: this.def.element, color: a.color, life: 3, source: this });
      }
      game.audio.sfx('spell_dark');
    } else if (a.type === 'summon') {
      for (let i = 0; i < (a.count || 2); i++) {
        const aa = ang + (i - ((a.count || 2) - 1) / 2) * 1.2;
        game.spawnEnemy(a.enemy, this.x + Math.cos(aa) * 90, this.y + Math.sin(aa) * 90, { summoned: true });
      }
      game.spawnRing(this.x, this.y, 160, a.color, 0.5);
      game.audio.sfx('portal');
    }
  }

  takeDamage(amount, game, opts = {}) {
    if (this.dead) return 0;
    let dmg = amount;
    if (opts.element && ELEMENTS[opts.element]) {
      if (ELEMENTS[opts.element].strong?.includes(this.def.element)) dmg *= 1.25;
      if (ELEMENTS[opts.element].weak?.includes(this.def.element)) dmg *= 0.8;
      if (ELEMENTS[this.def.element]?.weak?.includes(opts.element)) dmg *= 1.2;
    }
    dmg *= 100 / (100 + this.defense * 1.4);
    if (this.statuses.mark > 0) dmg *= 1.2;
    dmg = Math.max(1, Math.round(dmg));
    this.hp -= dmg;
    this.hitFlash = 1;
    this.aggro = true;
    this.poise -= dmg * (opts.heavy ? 1.6 : 1) + 3;
    if (this.poise <= 0 && !this.boss) {
      this.stagger = 1.4 + (opts.heavy ? 0.4 : 0);
      this.poise = this.maxPoise;
      game.addText(this.x, this.y - this.r - 34, 'ATURDIDO', '#ffe9a8', 13);
      game.audio.sfx('crit');
    } else if (this.poise <= 0 && this.boss) {
      this.stagger = 0.8;
      this.poise = this.maxPoise;
      game.addText(this.x, this.y - this.r - 34, 'GRIETA', '#ffe9a8', 13);
    }
    if (opts.status) this.applyStatus(opts.status, opts.statusDuration || 3, opts.statusPower || 4);
    game.addText(this.x + (Math.random() - 0.5) * 20, this.y - this.r - 20, (opts.crit ? '✦ ' : '') + dmg, opts.crit ? '#ffd06a' : '#fff3c4', opts.crit ? 18 : 13);
    game.spawnParticles(this.x, this.y - this.r * 0.4, opts.crit ? 10 : 5, this.def.colors?.glow || '#ffd06a', 90, 0.35, 2);
    game.audio.sfx(opts.crit ? 'crit' : 'hit');
    if (this.hp <= 0) this.die(game);
    return dmg;
  }

  applyStatus(name, duration, power) {
    if (!(name in this.statuses)) return;
    this.statuses[name] = Math.max(this.statuses[name], duration);
    if (name === 'burn') this.statusPower.burn = Math.max(this.statusPower.burn, power);
    if (name === 'poison') this.statusPower.poison = Math.max(this.statusPower.poison, power);
    if (name === 'weaken') this.atk *= 0.8;
  }

  die(game) {
    if (this.dead) return;
    this.dead = true; this.hp = 0; this.deathTime = 0; this.aggro = false;
    game.onEnemyKilled(this);
  }
}

// ============================================================
// COMPAÑERO ECO
// ============================================================
export class Companion {
  constructor(game, creatureId, level = 1) {
    this.game = game;
    this.id = creatureId;
    this.def = CREATURES[creatureId];
    this.level = level;
    this.x = game.player.x - 40; this.y = game.player.y + 30;
    this.r = 15;
    this.facing = 0;
    this.animTime = 0;
    this.attackCooldown = 1.5;
    this.abilityCooldown = 0;
    this.downed = false;
    this.downTimer = 0;
    this.hitFlash = 0;
    this.recalc(game);
    this.hp = this.maxHP;
  }
  recalc(game) {
    const sk = game.skillBonus ? game.skillBonus() : {};
    const mul = (1 + 0.22 * (this.level - 1)) * (1 + (sk.creatureStats || 0));
    this.maxHP = Math.round((this.def.base.hp + this.level * 8) * (1 + (sk.creatureStats || 0)));
    this.atk = Math.round((this.def.base.atk + this.level * 2.2) * (1 + (sk.creatureDmg || 0)));
    this.speed = 220 * this.def.base.spd;
    this.attackInterval = Math.max(0.7, 2.0 - this.level * 0.04) / (1 + (sk.creatureSpeed || 0));
    this.abilityCooldownMax = this.def.ability.cooldown;
    this.hp = Math.min(this.hp ?? this.maxHP, this.maxHP);
  }
  get ready() { return !this.downed; }
  update(dt, game) {
    this.animTime += dt;
    this.hitFlash = Math.max(0, this.hitFlash - dt * 4);
    this.attackCooldown = Math.max(0, this.attackCooldown - dt);
    this.abilityCooldown = Math.max(0, this.abilityCooldown - dt);
    if (this.downed) {
      this.downTimer -= dt;
      if (this.downTimer <= 0) { this.downed = false; this.hp = this.maxHP * 0.5; game.toast(`${this.def.name} se ha recuperado`, 'good'); }
      return;
    }
    const p = game.player;
    if (!p || p.dead) return;
    const target = game.nearestEnemy(p.x, p.y, 320, true);
    const followX = p.x - Math.cos(p.facing) * 34 + 24;
    const followY = p.y - Math.sin(p.facing) * 34 + 18;
    const dFollow = dist(this.x, this.y, followX, followY);
    if (target) {
      const d = dist(this.x, this.y, target.x, target.y);
      this.facing = angleTo(this.x, this.y, target.x, target.y);
      if (d > 150) this.moveToward(target.x, target.y, this.speed, dt, game);
      if (this.attackCooldown <= 0 && d < 300) { this.autoAttack(game, target); this.attackCooldown = this.attackInterval; }
    } else if (dFollow > 60) {
      this.moveToward(followX, followY, this.speed, dt, game);
    }
    if (game.hasSkill('eco_curativo') && p.hp < p.maxHP && game.enemies.some(e => !e.dead && e.aggro)) {
      p.hp = Math.min(p.maxHP, p.hp + p.maxHP * 0.015 * dt);
    }
    if (!target && this.hp < this.maxHP) this.hp = Math.min(this.maxHP, this.hp + this.maxHP * 0.03 * dt);
  }
  moveToward(tx, ty, speed, dt, game) {
    const n = norm(tx - this.x, ty - this.y);
    const nx = this.x + n.x * speed * dt, ny = this.y + n.y * speed * dt;
    if (!game.zone.isBlocked(nx, ny, this.r)) { this.x = nx; this.y = ny; }
  }
  autoAttack(game, target) {
    const a = this.def.ability;
    game.spawnParticles(this.x, this.y - 10, 4, this.def.colors.glow, 50, 0.3, 1.5);
    if (a.type === 'projectile' || a.type === 'beam') {
      const n = norm(target.x - this.x, target.y - this.y);
      game.spawnProjectile({ x: this.x, y: this.y - 12, vx: n.x * 420, vy: n.y * 420, r: 8, damage: this.atk * a.power, team: 'companion', element: a.element, color: this.def.colors.glow, life: 1.8, pierce: a.type === 'beam' ? 2 : 0, source: this });
    } else if (a.type === 'melee' || a.type === 'dash' || a.type === 'root') {
      if (dist(this.x, this.y, target.x, target.y) < 70) {
        game.damageEnemy(target, this.atk * a.power, { element: a.element, source: this, status: a.type === 'root' ? 'slow' : undefined, statusDuration: 2 });
        game.spawnSlash(this.x, this.y, this.facing, 70, this.def.colors.glow, 0.2);
      }
    } else if (a.type === 'heal') {
      game.player.heal(game.player.maxHP * 0.1, game);
    } else if (a.type === 'debuff') {
      target.applyStatus('weaken', 4, 1);
      game.addText(target.x, target.y - target.r - 30, 'MARCADO', this.def.colors.glow, 11);
    } else if (a.type === 'aoe' || a.type === 'cone') {
      game.spawnRing(target.x, target.y, 60, this.def.colors.glow, 0.4);
      for (const e of game.enemies) if (!e.dead && dist(e.x, e.y, target.x, target.y) < 70) game.damageEnemy(e, this.atk * a.power * 0.7, { element: a.element, source: this });
    }
  }
  useAbility(game) {
    if (this.downed) { game.toast(`${this.def.name} está agotado`, 'bad'); return; }
    if (this.abilityCooldown > 0) { game.toast(`Habilidad en ${Math.ceil(this.abilityCooldown)} s`, 'bad'); return; }
    const a = this.def.ability;
    this.abilityCooldown = this.abilityCooldownMax;
    const p = game.player;
    const target = game.nearestEnemy(p.x, p.y, 400, true);
    game.audio.sfx('spell');
    game.addText(p.x, p.y - 66, a.name, this.def.colors.glow, 14);
    if (a.type === 'heal') { p.heal(p.maxHP * 0.25, game); game.spawnParticles(p.x, p.y, 18, '#7ddc9a', 90, 0.8, 3); }
    else if (a.type === 'aoe' || a.type === 'cone') {
      const cx = target ? target.x : p.x + Math.cos(p.facing) * 100, cy = target ? target.y : p.y + Math.sin(p.facing) * 100;
      game.spawnRing(cx, cy, a.type === 'aoe' ? 140 : 100, this.def.colors.glow, 0.5);
      for (const e of game.enemies) if (!e.dead && dist(e.x, e.y, cx, cy) < (a.type === 'aoe' ? 150 : 110)) game.damageEnemy(e, this.atk * a.power * 1.3, { element: a.element, source: this, status: a.burn ? 'burn' : a.stun ? 'slow' : undefined, statusDuration: 4, statusPower: this.atk * 0.2 });
    } else if (a.type === 'beam') {
      const count = a.count || 1;
      for (let i = 0; i < count; i++) {
        const t = game.enemies.filter(e => !e.dead && dist(e.x, e.y, p.x, p.y) < 500);
        const tt = t[i] || target;
        if (!tt) break;
        game.spawnBeam(p.x, p.y - 10, angleTo(p.x, p.y, tt.x, tt.y), 500, 22, this.def.colors.glow, 0.35);
        game.damageEnemy(tt, this.atk * a.power * 1.4, { element: a.element, source: this, crit: true });
      }
    } else if (a.type === 'projectile') {
      if (target) {
        const n = norm(target.x - p.x, target.y - p.y);
        game.spawnProjectile({ x: p.x, y: p.y - 18, vx: n.x * 520, vy: n.y * 520, r: 12, damage: this.atk * a.power * 1.5, team: 'companion', element: a.element, color: this.def.colors.glow, life: 2, pierce: 1, source: this });
      }
    } else if (a.type === 'drain') {
      if (target) { const dmg = game.damageEnemy(target, this.atk * a.power * 1.4, { element: a.element, source: this }); p.heal(dmg * 0.4, game); }
    } else if (a.type === 'root') {
      if (target) { target.applyStatus('slow', 3, 1); game.damageEnemy(target, this.atk * a.power, { element: a.element, source: this }); game.spawnRing(target.x, target.y, 80, this.def.colors.glow, 0.5); }
    } else if (a.type === 'debuff') {
      if (target) { target.applyStatus('weaken', 5, 1); target.applyStatus('mark', 5, 1); }
    }
  }
  takeDamage(amount, game) {
    if (this.downed) return;
    this.hp -= amount;
    this.hitFlash = 1;
    if (this.hp <= 0) {
      this.downed = true; this.downTimer = 18;
      game.toast(`${this.def.name} ha caído. Se recuperará pronto.`, 'bad');
      game.spawnParticles(this.x, this.y, 20, this.def.colors.glow, 100, 0.8, 3);
    }
  }
}

// ============================================================
// PROYECTILES
// ============================================================
export class Projectile {
  constructor(opts) {
    Object.assign(this, opts);
    this.life = opts.life || 2;
    this.maxLife = this.life;
    this.pierce = opts.pierce || 0;
    this.hitSet = new Set();
    this.trail = 0;
    this.dead = false;
    this.homing = opts.homing || 0;
    this.target = opts.target || null;
    this.type = opts.type || 'orb';
  }
  update(dt, game) {
    this.life -= dt;
    if (this.life <= 0) { this.dead = true; return; }
    if (this.homing && this.target && !this.target.dead) {
      const n = norm(this.target.x - this.x, this.target.y - this.y);
      const sp = Math.hypot(this.vx, this.vy);
      this.vx += n.x * this.homing * dt * sp;
      this.vy += n.y * this.homing * dt * sp;
      const m = Math.hypot(this.vx, this.vy) || 1;
      this.vx = this.vx / m * sp; this.vy = this.vy / m * sp;
    }
    this.x += this.vx * dt; this.y += this.vy * dt;
    this.trail += dt;
    if (this.trail > 0.03) {
      this.trail = 0;
      game.spawnParticles(this.x, this.y, 1, this.color, 15, 0.25, this.r * 0.5);
    }
    if (game.zone.isBlocked(this.x, this.y, 4)) { this.dead = true; game.spawnParticles(this.x, this.y, 4, this.color, 50, 0.25, 2); return; }
    if (this.team === 'enemy') {
      const p = game.player;
      if (p && !p.dead && !this.hitSet.has(p) && dist(this.x, this.y, p.x, p.y) < this.r + p.r) {
        this.hitSet.add(p);
        game.projectileHit(this, p);
        if (this.pierce-- <= 0) this.dead = true;
      }
      const c = game.companion;
      if (c && !c.downed && !this.hitSet.has(c) && dist(this.x, this.y, c.x, c.y) < this.r + c.r) {
        this.hitSet.add(c);
        c.takeDamage(this.damage * 0.7, game);
        game.spawnParticles(c.x, c.y, 4, this.color, 50, 0.3, 2);
        if (this.pierce-- <= 0) this.dead = true;
      }
    } else {
      for (const e of game.enemies) {
        if (e.dead || this.hitSet.has(e)) continue;
        if (dist(this.x, this.y, e.x, e.y) < this.r + e.r) {
          this.hitSet.add(e);
          game.projectileHit(this, e);
          if (this.pierce-- <= 0) { this.dead = true; break; }
        }
      }
    }
  }
}
