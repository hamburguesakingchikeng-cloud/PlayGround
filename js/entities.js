// Entidades: jugador, enemigos, jefes, proyectiles, criaturas invocadas y recompensas.

import { TAU, clamp, dist, dist2, lerp, rand, randInt, chance, choice, angleDiff, rotateToward, hexToRgba } from './core.js';
import { WEAPONS, ARMORS, SHIELDS, ACCESSORIES, SPELLS, CREATURES, ENEMIES, ITEMS } from './data.js';
import { drawPlayer, drawEnemy, drawGlow, drawStar, drawWeapon } from './art.js';

const dirTo = (ax, ay, bx, by) => Math.atan2(by - ay, bx - ax);

// ---------------------------------------------------------------------------
// JUGADOR
// ---------------------------------------------------------------------------

export class Player {
  constructor(game) {
    this.game = game;
    this.x = 0;
    this.y = 0;
    this.facing = -Math.PI / 2;
    this.state = 'idle';
    this.animTime = 0;
    this.radius = 13;
    this.attackTimer = 0;
    this.attackDuration = 0.4;
    this.attackProgress = 0;
    this.attackHit = false;
    this.comboIndex = 0;
    this.comboTimer = 0;
    this.queuedAttack = false;
    this.attackAngle = 0;
    this.dodgeTimer = 0;
    this.dodgeDir = { x: 0, y: 0 };
    this.invuln = 0;
    this.blocking = false;
    this.blockHold = 0;
    this.hurtFlash = 0;
    this.castTimer = 0;
    this.skillTimer = 0;
    this.afterimages = [];
    this.staminaDelay = 0;
    this.combatTimer = 0;
    this.footTimer = 0;
    this.burnTimer = 0;
    this.burnTick = 0;
    this.slowTimer = 0;
    this.freezeTimer = 0;
    this.shieldTimer = 0;
    this.shieldValue = 0;
    this.buffTimer = 0;
    this.buffValue = 0;
    this.potionCd = 0;
    this.creatureCd = 0;
    this.magicCd = 0;
    this.skillCd = 0;
    this.weaponSwapCd = 0;
    this.recalc();
    this.hp = game.state.player.hp ?? this.maxHp;
    this.mp = game.state.player.mp ?? this.maxMp;
    this.stamina = this.maxStamina;
  }

  recalc() {
    const s = this.game.state.player;
    const st = s.stats;
    const weapon = WEAPONS[s.weaponId] || WEAPONS.espada_alba;
    const armor = ARMORS[s.armorId] || ARMORS.gambeson;
    const shield = SHIELDS[s.shieldId] || null;
    const acc = ACCESSORIES[s.accessoryId] || null;
    this.weapon = weapon;
    this.armor = armor;
    this.shield = shield;
    this.accessory = acc;
    const a = acc?.stats || {};
    const creature = CREATURES[s.creatureId];
    let hpBonus = 0, mpBonus = 0, defBonus = 0, speedBonus = 0, dmgBonus = 0;
    if (creature) {
      if (creature.passiveKey === 'hp') hpBonus += creature.passiveValue;
      if (creature.passiveKey === 'mp') mpBonus += creature.passiveValue;
      if (creature.passiveKey === 'def') defBonus += creature.passiveValue;
      if (creature.passiveKey === 'speed') speedBonus += creature.passiveValue;
      if (creature.passiveKey === 'damage') dmgBonus += creature.passiveValue;
    }
    this.maxHp = Math.round(78 + (st.vit + (a.vit || 0)) * 8 + armor.hp + (shield?.hp || 0) + hpBonus);
    this.maxMp = Math.round(28 + (st.int + (a.int || 0)) * 5 + armor.mp + (acc?.mp || 0) + mpBonus);
    this.maxStamina = Math.round(92 + (st.spd + (a.spd || 0)) * 2.2);
    const forgeLevel = Math.max(0, Number(s.ownedWeapons?.[s.weaponId] || 0));
    this.attackPower = weapon.damage + forgeLevel * 3 + (st.str + (a.str || 0)) * 0.95;
    this.defense = armor.def + (shield?.def || 0) + (st.def + (a.def || 0)) * 0.72 + defBonus;
    this.speed = 196 + (st.spd + (a.spd || 0)) * 4.2;
    this.speed *= 1 + speedBonus;
    this.critChance = clamp(weapon.crit + (st.luck + (a.luck || 0)) * 0.0045, 0, 0.55);
    this.magicPower = 14 + (st.int + (a.int || 0)) * 2.1;
    this.damageBonus = dmgBonus;
    this.blockReduction = shield?.block || 0.32;
    this.appearance = { ...this.game.state.player.appearance };
    if (this.hp > this.maxHp) this.hp = this.maxHp;
    if (this.mp > this.maxMp) this.mp = this.maxMp;
  }

  get level() { return this.game.state.player.level; }

  update(dt, input) {
    const g = this.game;
    this.animTime += dt;
    this.hurtFlash = Math.max(0, this.hurtFlash - dt);
    this.invuln = Math.max(0, this.invuln - dt);
    this.combatTimer = Math.max(0, this.combatTimer - dt);
    this.comboTimer = Math.max(0, this.comboTimer - dt);
    this.potionCd = Math.max(0, this.potionCd - dt);
    this.creatureCd = Math.max(0, this.creatureCd - dt);
    this.magicCd = Math.max(0, this.magicCd - dt);
    this.skillCd = Math.max(0, this.skillCd - dt);
    this.weaponSwapCd = Math.max(0, this.weaponSwapCd - dt);
    this.shieldTimer = Math.max(0, this.shieldTimer - dt);
    this.buffTimer = Math.max(0, this.buffTimer - dt);
    this.slowTimer = Math.max(0, this.slowTimer - dt);
    this.freezeTimer = Math.max(0, this.freezeTimer - dt);
    this.burnTimer = Math.max(0, this.burnTimer - dt);
    if (this.burnTimer > 0) {
      this.burnTick -= dt;
      if (this.burnTick <= 0) {
        this.burnTick = 0.9;
        this.damage(Math.max(3, this.maxHp * 0.02), { ignoreDefense: true, element: 'fuego', silent: true });
        g.addParticles(this.x, this.y - 20, 4, '#ff8a3d', 'ember');
      }
    }
    if (this.afterimages.length) {
      for (const a of this.afterimages) a.life -= dt * 3.5;
      this.afterimages = this.afterimages.filter((a) => a.life > 0);
    }

    // Regeneración.
    this.staminaDelay = Math.max(0, this.staminaDelay - dt);
    if (this.staminaDelay <= 0) {
      this.stamina = Math.min(this.maxStamina, this.stamina + (this.blocking ? 8 : 24) * dt);
    }
    if (this.combatTimer <= 0) {
      this.mp = Math.min(this.maxMp, this.mp + 2.2 * dt);
      if (this.hp > 0) this.hp = Math.min(this.maxHp, this.hp + 0.6 * dt);
    }
    if (this.freezeTimer > 0) {
      this.state = 'idle';
      return;
    }

    // Movimiento.
    let mx = input.moveX;
    let my = input.moveY;
    const moveLen = Math.hypot(mx, my);
    const attacking = this.state === 'attack' || this.state === 'skill';
    const casting = this.state === 'cast';
    const dodging = this.state === 'dodge';
    const speedMul = dodging ? 2.9 : attacking ? 0.42 : casting ? 0.35 : this.blocking ? 0.46 : 1;
    const slowMul = this.slowTimer > 0 ? 0.55 : 1;
    if (moveLen > 0.01 && !dodging) {
      this.facing = Math.atan2(my, mx);
    }
    if (dodging) {
      this.dodgeTimer -= dt;
      const sp = this.speed * 3.1;
      this._move(this.dodgeDir.x * sp * dt, this.dodgeDir.y * sp * dt);
      if (chance(0.6)) this.afterimages.push({ dx: this.x, dy: this.y, life: 1 });
      if (this.dodgeTimer <= 0) {
        this.state = 'idle';
        this.invuln = Math.max(this.invuln, 0.08);
      }
    } else if (!attacking && !casting) {
      if (moveLen > 0.01) {
        const sp = this.speed * speedMul * slowMul;
        this._move(mx * sp * dt, my * sp * dt);
        this.state = 'move';
        this.footTimer -= dt;
        if (this.footTimer <= 0 && !this.blocking) {
          this.footTimer = 0.32;
          g.audio.sfx('footstep');
        }
      } else {
        this.state = this.blocking ? 'block' : 'idle';
      }
    }

    // Bloqueo.
    this.blocking = false;
    if (input.isDown('block') && this.stamina > 4 && !dodging && !attacking && !casting) {
      this.blocking = true;
      this.stamina -= 3.5 * dt;
      this.staminaDelay = 0.4;
      if (this.stamina <= 0) {
        this.blocking = false;
        g.ui.toast('Sin resistencia', 'Tu guardia se rompe.', 'error');
        g.audio.sfx('error');
      }
      if (this.state === 'idle') this.state = 'block';
    }

    // Acciones.
    if (input.wasPressed('attack') && !dodging) this._startAttack();
    if (input.wasPressed('dodge') && this.stamina >= 18 && !dodging && !attacking) this._startDodge(input);
    if (input.wasPressed('skill')) this._useSkill();
    if (input.wasPressed('magic')) g.castSpell();
    if (input.wasPressed('potion')) g.quickPotion();
    if (input.wasPressed('creature')) g.summonCreature();
    if (input.wasPressed('weapon')) g.cycleWeapon();
    if (input.wasPressed('cycleSpell')) g.cycleSpell();
    for (let i = 1; i <= 4; i++) {
      if (input.wasPressed(`spell${i}`)) g.castSpell(i - 1);
    }

    // Avance de ataque.
    if (attacking) {
      this.attackTimer += dt;
      this.attackProgress = clamp(this.attackTimer / this.attackDuration, 0, 1);
      if (!this.attackHit && this.attackProgress >= 0.34) {
        this.attackHit = true;
        g.playerAttackHit(this);
      }
      if (this.attackProgress >= 1) {
        this.attackTimer = 0;
        this.attackProgress = 0;
        if (this.queuedAttack) {
          this.queuedAttack = false;
          this.comboIndex = (this.comboIndex + 1) % this.weapon.combo;
          this._beginSwing();
        } else {
          this.state = 'idle';
          this.comboTimer = 0.55;
        }
      } else if (input.wasPressed('attack') && this.attackProgress > 0.55 && this.comboIndex < this.weapon.combo - 1) {
        this.queuedAttack = true;
      }
    } else if (this.comboTimer <= 0) {
      this.comboIndex = 0;
    }

    if (casting) {
      this.castTimer -= dt;
      if (this.castTimer <= 0) {
        this.state = 'idle';
      }
    }
    if (this.state === 'skill') {
      this.skillTimer -= dt;
      if (this.skillTimer <= 0) this.state = 'idle';
    }

    // Sincronizar estado de guardado.
    g.state.player.hp = Math.round(this.hp);
    g.state.player.mp = Math.round(this.mp);
  }

  _move(dx, dy) {
    const w = this.game.world;
    const nx = this.x + dx;
    if (!w.collides(nx, this.y, this.radius)) this.x = nx;
    const ny = this.y + dy;
    if (!w.collides(this.x, ny, this.radius)) this.y = ny;
    this.x = clamp(this.x, 30, w.w - 30);
    this.y = clamp(this.y, 30, w.h - 30);
  }

  _startAttack() {
    if (this.state === 'dodge' || this.state === 'cast') return;
    if (this.state === 'attack') {
      if (this.attackProgress > 0.45) this.queuedAttack = true;
      return;
    }
    this.comboIndex = this.comboTimer > 0 ? (this.comboIndex + 1) % this.weapon.combo : 0;
    this._beginSwing();
  }

  _beginSwing() {
    this.state = 'attack';
    this.attackTimer = 0;
    this.attackHit = false;
    this.attackDuration = clamp(0.48 / (this.weapon.speed || 1), 0.2, 0.7);
    this.attackProgress = 0;
    this.attackAngle = this.facing;
    this.combatTimer = 4;
    this.game.audio.sfx(this.weapon.kind === 'greatsword' ? 'swing_heavy' : 'swing');
  }

  _startDodge(input) {
    let dx = input.moveX, dy = input.moveY;
    if (Math.hypot(dx, dy) < 0.1) { dx = Math.cos(this.facing); dy = Math.sin(this.facing); }
    const l = Math.hypot(dx, dy) || 1;
    this.dodgeDir = { x: dx / l, y: dy / l };
    this.state = 'dodge';
    this.dodgeTimer = 0.34;
    this.invuln = Math.max(this.invuln, 0.3);
    this.stamina -= 18;
    this.staminaDelay = 0.6;
    this.combatTimer = 4;
    this.game.audio.sfx('dodge');
    this.game.addParticles(this.x, this.y - 10, 8, '#c9d8ff', 'dust');
  }

  _useSkill() {
    const sk = this.weapon.skill;
    if (!sk) return;
    if (this.skillCd > 0) {
      this.game.ui.toast('Habilidad en recarga', `${sk.name}: ${this.skillCd.toFixed(1)} s`, 'info');
      return;
    }
    const isMp = sk.resource === 'mp';
    const have = isMp ? this.mp : this.stamina;
    if (have < sk.cost) {
      this.game.audio.sfx('error');
      this.game.ui.toast(isMp ? 'Maná insuficiente' : 'Resistencia insuficiente', `${sk.name} necesita ${sk.cost}.`, 'error');
      return;
    }
    if (isMp) this.mp -= sk.cost; else { this.stamina -= sk.cost; this.staminaDelay = 0.7; }
    this.skillCd = sk.cooldown;
    this.state = 'skill';
    this.skillTimer = 0.42;
    this.combatTimer = 4;
    this.game.useWeaponSkill(this, sk);
  }

  damage(amount, opts = {}) {
    if (this.invuln > 0 && !opts.ignoreInvuln) return 0;
    if (this.state === 'dead') return 0;
    let dmg = amount;
    if (!opts.ignoreDefense) {
      const def = this.defense + (this.buffTimer > 0 ? this.buffValue : 0);
      dmg *= 100 / (100 + def * 3.1);
    }
    if (this.blocking && !opts.ignoreBlock) {
      dmg *= 1 - this.blockReduction;
      this.stamina -= 16 + amount * 0.35;
      this.staminaDelay = 0.9;
      if (this.stamina <= 0) {
        this.stamina = 0;
        this.blocking = false;
        this.invuln = 0.25;
        this.game.audio.sfx('error');
        this.game.ui.toast('¡Guardia rota!', 'La resistencia se ha agotado.', 'error');
      }
      this.game.audio.sfx('block');
      this.game.addParticles(this.x + Math.cos(this.facing + Math.PI) * 20, this.y - 26, 8, '#9fe3ff', 'spark');
    }
    if (this.shieldTimer > 0 && this.shieldValue > 0) {
      const absorbed = Math.min(this.shieldValue, dmg);
      this.shieldValue -= absorbed;
      dmg -= absorbed;
      if (this.shieldValue <= 0) this.shieldTimer = 0;
    }
    dmg = Math.max(1, Math.round(dmg));
    this.hp -= dmg;
    this.hurtFlash = 0.35;
    this.invuln = Math.max(this.invuln, 0.45);
    this.combatTimer = 6;
    this.game.audio.sfx('hurt');
    this.game.camera.shake(6 + dmg * 0.12);
    this.game.addFloatText(this.x, this.y - 54, `-${dmg}`, '#ff6b6b', 18);
    this.game.addParticles(this.x, this.y - 26, 10, '#e0566a', 'blood');
    this.game.hitStop = Math.max(this.game.hitStop, 0.04);
    this.game.vibrate(30);
    if (this.hp <= 0) {
      this.hp = 0;
      this.state = 'dead';
      this.game.onPlayerDeath();
    }
    return dmg;
  }

  heal(n) {
    const before = this.hp;
    this.hp = Math.min(this.maxHp, this.hp + n);
    return Math.round(this.hp - before);
  }

  restoreMana(n) {
    const before = this.mp;
    this.mp = Math.min(this.maxMp, this.mp + n);
    return Math.round(this.mp - before);
  }

  draw(ctx, t) {
    drawPlayer(ctx, this, t);
  }
}

// ---------------------------------------------------------------------------
// ENEMIGOS
// ---------------------------------------------------------------------------

export class Enemy {
  constructor(game, typeId, x, y, level = 1) {
    this.game = game;
    this.typeId = typeId;
    this.def = ENEMIES[typeId] || ENEMIES.gelatina;
    this.kind = this.def.kind;
    this.x = x;
    this.y = y;
    this.home = { x, y };
    this.level = level;
    this.maxHp = Math.round(this.def.hp * (1 + (level - 1) * 0.24));
    this.hp = this.maxHp;
    this.damage = this.def.damage * (1 + (level - 1) * 0.17);
    this.speed = this.def.speed * (1 + (level - 1) * 0.035);
    this.radius = this.def.radius;
    this.armor = this.def.armor + (level - 1) * 1.5;
    this.xp = Math.round(this.def.xp * (1 + (level - 1) * 0.2));
    this.gold = Math.round(this.def.gold * (1 + (level - 1) * 0.2));
    this.facing = Math.PI / 2;
    this.state = 'idle';
    this.animTime = Math.random() * 10;
    this.seed = Math.random() * TAU;
    this.hurtFlash = 0;
    this.attackCd = rand(0.4, 1.2);
    this.attackTimer = 0;
    this.telegraph = null;
    this.vx = 0;
    this.vy = 0;
    this.dead = false;
    this.deathTimer = 0;
    this.aggro = false;
    this.aggroTimer = 0;
    this.phase = 1;
    this.phaseTriggered = { 2: false, 3: false };
    this.patternIndex = 0;
    this.patternTimer = 1.2;
    this.blinkTimer = rand(2, 5);
    this.captureAttempts = 0;
    this.elite = this.def.elite;
    this.boss = this.def.boss;
    this.wander = { x: 0, y: 0, timer: 0 };
    this.hitCooldown = 0;
    this.enraged = false;
  }

  get hpRatio() { return this.hp / this.maxHp; }

  update(dt, game) {
    if (this.dead) {
      this.deathTimer -= dt;
      return;
    }
    this.animTime += dt;
    this.hurtFlash = Math.max(0, this.hurtFlash - dt);
    this.attackCd = Math.max(0, this.attackCd - dt);
    this.hitCooldown = Math.max(0, this.hitCooldown - dt);
    this.aggroTimer = Math.max(0, this.aggroTimer - dt);
    const p = game.player;
    const d = dist(this.x, this.y, p.x, p.y);
    if (!p || p.state === 'dead') {
      this.state = 'idle';
      return;
    }
    if (d < this.def.aggro) {
      this.aggro = true;
      this.aggroTimer = 6;
    } else if (this.aggroTimer <= 0) {
      this.aggro = false;
    }

    if (this.boss) {
      this._updateBoss(dt, game, d);
      return;
    }
    if (this.elite) {
      this._updateGuardian(dt, game, d);
      return;
    }

    switch (this.kind) {
      case 'slime': this._updateSlime(dt, game, d); break;
      case 'wolf': this._updateWolf(dt, game, d); break;
      case 'beetle': this._updateBeetle(dt, game, d); break;
      case 'wraith': this._updateWraith(dt, game, d); break;
      default: this._updateSlime(dt, game, d);
    }

    // Separación entre enemigos.
    for (const e of game.enemies) {
      if (e === this || e.dead) continue;
      const dd = dist(this.x, this.y, e.x, e.y);
      const min = this.radius + e.radius - 4;
      if (dd < min && dd > 0.01) {
        const push = (min - dd) * 0.5;
        this.x += ((this.x - e.x) / dd) * push;
        this.y += ((this.y - e.y) / dd) * push;
      }
    }
  }

  _moveToward(tx, ty, speed, dt, stopDist = 0) {
    const d = dist(this.x, this.y, tx, ty);
    if (d <= stopDist || d < 0.01) return;
    const vx = (tx - this.x) / d;
    const vy = (ty - this.y) / d;
    this._move(vx * speed * dt, vy * speed * dt);
    this.facing = Math.atan2(vy, vx);
  }

  _move(dx, dy) {
    const w = this.game.world;
    const nx = this.x + dx;
    if (!w.collides(nx, this.y, this.radius * 0.8)) this.x = nx;
    const ny = this.y + dy;
    if (!w.collides(this.x, ny, this.radius * 0.8)) this.y = ny;
    this.x = clamp(this.x, 30, w.w - 30);
    this.y = clamp(this.y, 30, w.h - 30);
  }

  _updateSlime(dt, game, d) {
    const p = game.player;
    if (!this.aggro) {
      this.state = 'idle';
      this.wander.timer -= dt;
      if (this.wander.timer <= 0) {
        this.wander.timer = rand(2, 5);
        const a = rand(TAU);
        this.wander.x = this.home.x + Math.cos(a) * rand(20, 80);
        this.wander.y = this.home.y + Math.sin(a) * rand(20, 80);
      }
      this._moveToward(this.wander.x, this.wander.y, this.speed * 0.35, dt, 6);
      return;
    }
    if (this.state === 'telegraph') {
      this.attackTimer -= dt;
      if (this.attackTimer <= 0) {
        this.state = 'recover';
        this.attackTimer = 0.4;
        if (dist(this.x, this.y, p.x, p.y) < this.def.range + 16) {
          p.damage(this.damage, { element: 'naturaleza' });
        }
        game.addParticles(this.x, this.y - 16, 10, '#b9ffd6', 'goo');
        game.audio.sfx('hit');
      }
      return;
    }
    if (this.state === 'recover') {
      this.attackTimer -= dt;
      if (this.attackTimer <= 0) this.state = 'chase';
      return;
    }
    if (d > this.def.range) {
      this.state = 'chase';
      this._moveToward(p.x, p.y, this.speed * (d > 160 ? 1 : 0.55), dt, this.def.range * 0.7);
    } else {
      this.state = 'chase';
      if (this.attackCd <= 0) {
        this.attackCd = rand(1.6, 2.4);
        this.state = 'telegraph';
        this.attackTimer = 0.45;
        this.telegraph = { type: 'circle', x: this.x, y: this.y, r: 50, timer: 0.45, color: '#8fe3b0' };
      } else if (chance(0.008)) {
        // Escupitajo.
        const a = dirTo(this.x, this.y - 18, p.x, p.y - 18);
        game.spawnProjectile({
          x: this.x, y: this.y - 18, vx: Math.cos(a) * 170, vy: Math.sin(a) * 170,
          r: 7, damage: this.damage * 0.7, team: 'enemy', kind: 'goo', color: '#8fe3b0', life: 2.2,
        });
        game.audio.sfx('fire');
      }
    }
  }

  _updateWolf(dt, game, d) {
    const p = game.player;
    if (!this.aggro) {
      this.state = 'idle';
      this.wander.timer -= dt;
      if (this.wander.timer <= 0) {
        this.wander.timer = rand(1.5, 4);
        const a = rand(TAU);
        this.wander.x = this.home.x + Math.cos(a) * rand(20, 100);
        this.wander.y = this.home.y + Math.sin(a) * rand(20, 100);
      }
      this._moveToward(this.wander.x, this.wander.y, this.speed * 0.4, dt, 8);
      return;
    }
    if (this.state === 'telegraph') {
      this.attackTimer -= dt;
      if (this.attackTimer <= 0) {
        this.state = 'lunge';
        this.attackTimer = 0.24;
        this.lungeDir = { x: Math.cos(this.facing), y: Math.sin(this.facing) };
        game.audio.sfx('dash');
      }
      return;
    }
    if (this.state === 'lunge') {
      this.attackTimer -= dt;
      this._move(this.lungeDir.x * this.speed * 3.6 * dt, this.lungeDir.y * this.speed * 3.6 * dt);
      if (dist(this.x, this.y, p.x, p.y) < this.radius + p.radius + 8) {
        p.damage(this.damage, { element: 'fuego' });
        this.state = 'recover';
        this.attackTimer = 0.55;
      }
      if (this.attackTimer <= 0) {
        this.state = 'recover';
        this.attackTimer = 0.35;
      }
      return;
    }
    if (this.state === 'recover') {
      this.attackTimer -= dt;
      if (this.attackTimer <= 0) this.state = 'chase';
      return;
    }
    if (d < 190 && this.attackCd <= 0) {
      this.state = 'telegraph';
      this.attackTimer = 0.5;
      this.facing = dirTo(this.x, this.y, p.x, p.y);
      this.telegraph = { type: 'line', x: this.x, y: this.y, angle: this.facing, length: 190, width: 34, timer: 0.5, color: '#ffb35a' };
      this.attackCd = rand(2.1, 3.1);
      return;
    }
    // Merodear alrededor del jugador.
    const a = dirTo(p.x, p.y, this.x, this.y) + Math.sin(this.animTime * 1.2) * 0.5;
    const targetX = p.x + Math.cos(a) * 110;
    const targetY = p.y + Math.sin(a) * 110;
    this.state = 'chase';
    this._moveToward(targetX, targetY, this.speed, dt, 12);
    this.facing = dirTo(this.x, this.y, p.x, p.y);
  }

  _updateBeetle(dt, game, d) {
    const p = game.player;
    if (!this.aggro) {
      this.state = 'idle';
      this.wander.timer -= dt;
      if (this.wander.timer <= 0) {
        this.wander.timer = rand(2, 5);
        const a = rand(TAU);
        this.wander.x = this.home.x + Math.cos(a) * rand(15, 60);
        this.wander.y = this.home.y + Math.sin(a) * rand(15, 60);
      }
      this._moveToward(this.wander.x, this.wander.y, this.speed * 0.4, dt, 6);
      return;
    }
    if (this.state === 'telegraph') {
      this.attackTimer -= dt;
      if (this.attackTimer <= 0) {
        this.state = 'charge';
        this.attackTimer = 0.55;
        this.lungeDir = { x: Math.cos(this.facing), y: Math.sin(this.facing) };
        game.audio.sfx('slam');
      }
      return;
    }
    if (this.state === 'charge') {
      this.attackTimer -= dt;
      this._move(this.lungeDir.x * this.speed * 5.2 * dt, this.lungeDir.y * this.speed * 5.2 * dt);
      if (dist(this.x, this.y, p.x, p.y) < this.radius + p.radius + 6) {
        p.damage(this.damage * 1.25, { element: 'tierra' });
        this.state = 'recover';
        this.attackTimer = 0.7;
      }
      if (this.attackTimer <= 0) {
        this.state = 'recover';
        this.attackTimer = 0.45;
      }
      return;
    }
    if (this.state === 'recover') {
      this.attackTimer -= dt;
      if (this.attackTimer <= 0) this.state = 'chase';
      return;
    }
    if (d < 260 && this.attackCd <= 0) {
      this.state = 'telegraph';
      this.attackTimer = 0.7;
      this.facing = dirTo(this.x, this.y, p.x, p.y);
      this.telegraph = { type: 'line', x: this.x, y: this.y, angle: this.facing, length: 260, width: 52, timer: 0.7, color: '#ffcf5a' };
      this.attackCd = rand(2.8, 3.8);
      return;
    }
    this.state = 'chase';
    this._moveToward(p.x, p.y, this.speed, dt, this.def.range * 0.8);
    this.facing = dirTo(this.x, this.y, p.x, p.y);
  }

  _updateWraith(dt, game, d) {
    const p = game.player;
    this.blinkTimer -= dt;
    if (!this.aggro) {
      this.state = 'idle';
      this.x += Math.sin(this.animTime * 0.7 + this.seed) * 8 * dt;
      this.y += Math.cos(this.animTime * 0.6 + this.seed) * 6 * dt;
      return;
    }
    if (this.state === 'telegraph') {
      this.attackTimer -= dt;
      if (this.attackTimer <= 0) {
        const a = dirTo(this.x, this.y - 20, p.x, p.y - 20);
        game.spawnProjectile({
          x: this.x, y: this.y - 22, vx: Math.cos(a) * 190, vy: Math.sin(a) * 190,
          r: 9, damage: this.damage, team: 'enemy', kind: 'wraith', color: '#9fb8ff', life: 3.4, slow: 1.5,
        });
        game.audio.sfx('ice');
        this.state = 'chase';
        this.attackCd = rand(1.9, 2.8);
      }
      return;
    }
    if (this.blinkTimer <= 0 && d < 120) {
      this.blinkTimer = rand(3, 6);
      const a = rand(TAU);
      const nx = p.x + Math.cos(a) * 190;
      const ny = p.y + Math.sin(a) * 190;
      if (!game.world.collides(nx, ny, this.radius)) {
        game.addParticles(this.x, this.y - 20, 12, '#9fb8ff', 'spark');
        this.x = clamp(nx, 40, game.world.w - 40);
        this.y = clamp(ny, 40, game.world.h - 40);
        game.addParticles(this.x, this.y - 20, 12, '#9fb8ff', 'spark');
        game.audio.sfx('dodge');
      }
      return;
    }
    if (d < 300 && this.attackCd <= 0) {
      this.state = 'telegraph';
      this.attackTimer = 0.6;
      this.facing = dirTo(this.x, this.y, p.x, p.y);
      this.telegraph = { type: 'line', x: this.x, y: this.y, angle: this.facing, length: 320, width: 22, timer: 0.6, color: '#9fb8ff' };
      return;
    }
    // Mantener distancia.
    this.state = 'chase';
    if (d < 150) {
      const a = dirTo(p.x, p.y, this.x, this.y);
      this._moveToward(this.x + Math.cos(a) * 80, this.y + Math.sin(a) * 80, this.speed, dt, 0);
    } else if (d > 230) {
      this._moveToward(p.x, p.y, this.speed * 0.6, dt, 190);
    }
    this.facing = dirTo(this.x, this.y, p.x, p.y);
  }

  _updateGuardian(dt, game, d) {
    const p = game.player;
    if (this.hpRatio < 0.5 && !this.phaseTriggered[2]) {
      this.phaseTriggered[2] = true;
      this.phase = 2;
      this.speed *= 1.15;
      this.damage *= 1.1;
      game.audio.sfx('boss_roar');
      game.camera.shake(12);
      game.ui.toast('El Guardián se enfurece', 'La corrupción consume su armadura.', 'warning');
      game.addParticles(this.x, this.y - 40, 30, '#c9a6ff', 'burst');
    }
    if (this.state === 'telegraph') {
      this.attackTimer -= dt;
      if (this.attackTimer <= 0) {
        if (this.telegraph?.type === 'slash') {
          if (dist(this.x, this.y, p.x, p.y) < 150) p.damage(this.damage, { element: 'sombra' });
          game.addParticles(this.x + Math.cos(this.facing) * 60, this.y - 30 + Math.sin(this.facing) * 40, 18, '#c9a6ff', 'slash');
          game.audio.sfx('swing_heavy');
        } else if (this.telegraph?.type === 'wave') {
          for (let i = -1; i <= 1; i++) {
            const a = this.facing + i * 0.3;
            game.spawnProjectile({ x: this.x, y: this.y - 30, vx: Math.cos(a) * 220, vy: Math.sin(a) * 220, r: 12, damage: this.damage * 0.8, team: 'enemy', kind: 'shadowwave', color: '#c9a6ff', life: 2.4 });
          }
          game.audio.sfx('slam');
        }
        this.state = 'recover';
        this.attackTimer = 0.5;
        this.telegraph = null;
      }
      return;
    }
    if (this.state === 'charge') {
      this.attackTimer -= dt;
      this._move(this.lungeDir.x * this.speed * 4 * dt, this.lungeDir.y * this.speed * 4 * dt);
      if (dist(this.x, this.y, p.x, p.y) < this.radius + p.radius + 4) {
        p.damage(this.damage * 1.2, { element: 'sombra' });
        this.state = 'recover'; this.attackTimer = 0.6;
      }
      if (this.attackTimer <= 0) { this.state = 'recover'; this.attackTimer = 0.4; }
      return;
    }
    if (this.state === 'recover') {
      this.attackTimer -= dt;
      if (this.attackTimer <= 0) this.state = 'chase';
      return;
    }
    if (d < 190 && this.attackCd <= 0) {
      this.facing = dirTo(this.x, this.y, p.x, p.y);
      if (this.phase >= 2 && chance(0.5)) {
        this.state = 'telegraph'; this.attackTimer = 0.65;
        this.telegraph = { type: 'wave', x: this.x, y: this.y, angle: this.facing, timer: 0.65, color: '#c9a6ff' };
      } else {
        this.state = 'telegraph'; this.attackTimer = 0.55;
        this.telegraph = { type: 'slash', x: this.x, y: this.y, angle: this.facing, radius: 150, timer: 0.55, color: '#c9a6ff' };
      }
      this.attackCd = rand(1.8, 2.6);
      return;
    }
    if (d > 260 && this.attackCd <= 0 && this.phase >= 2) {
      this.state = 'charge'; this.attackTimer = 0.8;
      this.lungeDir = { x: Math.cos(dirTo(this.x, this.y, p.x, p.y)), y: Math.sin(dirTo(this.x, this.y, p.x, p.y)) };
      this.attackCd = rand(2.5, 3.5);
      game.audio.sfx('dash');
      return;
    }
    this.state = 'chase';
    this._moveToward(p.x, p.y, this.speed, dt, 90);
    this.facing = dirTo(this.x, this.y, p.x, p.y);
  }

  _updateBoss(dt, game, d) {
    const p = game.player;
    if (this.hpRatio < 0.66 && !this.phaseTriggered[2]) {
      this.phaseTriggered[2] = true;
      this.phase = 2;
      this.speed *= 1.12;
      this.damage *= 1.12;
      game.audio.sfx('boss_roar');
      game.camera.shake(18);
      game.hitStop = 0.18;
      game.ui.toast('Kael: «La noche es misericordiosa.»', 'Fase II — El cielo se quiebra.', 'warning', 4200);
      game.addParticles(this.x, this.y - 60, 50, '#c9a6ff', 'burst');
      game.spawnEnemy('espectro', this.x - 160, this.y + 60, 8, true);
      game.spawnEnemy('espectro', this.x + 160, this.y + 60, 8, true);
    }
    if (this.hpRatio < 0.33 && !this.phaseTriggered[3]) {
      this.phaseTriggered[3] = true;
      this.phase = 3;
      this.speed *= 1.15;
      this.damage *= 1.2;
      game.audio.sfx('boss_roar');
      game.camera.shake(24);
      game.hitStop = 0.24;
      game.ui.toast('Kael: «No dejaré que el sol me olvide.»', 'Fase III — Último juramento.', 'danger', 4200);
      game.addParticles(this.x, this.y - 60, 70, '#ff6b6b', 'burst');
      game.spawnEnemy('espectro', this.x - 200, this.y + 40, 9, true);
      game.spawnEnemy('espectro', this.x + 200, this.y + 40, 9, true);
    }
    if (this.state === 'telegraph') {
      this.attackTimer -= dt;
      if (this.telegraph) this.telegraph.timer = Math.max(0, this.telegraph.timer - dt);
      if (this.attackTimer <= 0) {
        this._executeBossAttack(game);
      }
      return;
    }
    if (this.state === 'charge') {
      this.attackTimer -= dt;
      this._move(this.lungeDir.x * this.speed * 5 * dt, this.lungeDir.y * this.speed * 5 * dt);
      if (dist(this.x, this.y, p.x, p.y) < this.radius + p.radius + 8) {
        p.damage(this.damage * 1.1, { element: 'celestial' });
        this.state = 'recover'; this.attackTimer = 0.5;
      }
      if (this.attackTimer <= 0) { this.state = 'recover'; this.attackTimer = 0.35; }
      return;
    }
    if (this.state === 'recover') {
      this.attackTimer -= dt;
      if (this.attackTimer <= 0) { this.state = 'chase'; this.patternTimer = rand(0.6, 1.3); }
      return;
    }
    this.patternTimer -= dt;
    if (this.patternTimer <= 0) {
      this._chooseBossAttack(game, d);
      return;
    }
    this.state = 'chase';
    this._moveToward(p.x, p.y, this.speed * (d > 200 ? 1 : 0.4), dt, 100);
    this.facing = dirTo(this.x, this.y, p.x, p.y);
  }

  _chooseBossAttack(game, d) {
    const p = game.player;
    this.facing = dirTo(this.x, this.y, p.x, p.y);
    const patterns = this.phase === 1 ? ['slash', 'charge', 'wave'] : this.phase === 2 ? ['slash', 'meteors', 'wave', 'charge', 'summon'] : ['slash', 'meteors', 'beam', 'charge', 'summon', 'wave'];
    let type = patterns[this.patternIndex % patterns.length];
    this.patternIndex++;
    if (d > 280 && type === 'slash') type = 'charge';
    if (type === 'slash') {
      this.state = 'telegraph'; this.attackTimer = 0.62;
      this.telegraph = { type: 'arc', x: this.x, y: this.y, angle: this.facing, radius: 165, arc: 1.7, timer: 0.62, color: '#ffcf5a' };
    } else if (type === 'charge') {
      this.state = 'telegraph'; this.attackTimer = 0.55;
      this.lungeDir = { x: Math.cos(this.facing), y: Math.sin(this.facing) };
      this.telegraph = { type: 'line', x: this.x, y: this.y, angle: this.facing, length: 420, width: 60, timer: 0.55, color: '#ffcf5a' };
      this._bossAttack = 'charge';
    } else if (type === 'wave') {
      this.state = 'telegraph'; this.attackTimer = 0.7;
      this.telegraph = { type: 'circle', x: this.x, y: this.y, r: 260, timer: 0.7, color: '#c9a6ff' };
      this._bossAttack = 'wave';
    } else if (type === 'meteors') {
      this.state = 'telegraph'; this.attackTimer = 0.85;
      this.telegraph = { type: 'none', timer: 0.85 };
      this._bossAttack = 'meteors';
      game.ui.toast('Kael invoca el juicio celestial', 'Muévete: los círculos dorados explotarán.', 'danger', 2600);
    } else if (type === 'summon') {
      this.state = 'telegraph'; this.attackTimer = 0.7;
      this.telegraph = { type: 'circle', x: this.x, y: this.y, r: 180, timer: 0.7, color: '#c9a6ff' };
      this._bossAttack = 'summon';
    } else if (type === 'beam') {
      this.state = 'telegraph'; this.attackTimer = 0.9;
      this.telegraph = { type: 'line', x: this.x, y: this.y, angle: this.facing, length: 900, width: 90, timer: 0.9, color: '#ff6b6b' };
      this._bossAttack = 'beam';
    }
    this.attackCd = 0;
  }

  _executeBossAttack(game) {
    const p = game.player;
    const type = this._bossAttack || (this.telegraph?.type === 'arc' ? 'slash' : 'wave');
    this._bossAttack = null;
    if (type === 'slash') {
      if (dist(this.x, this.y, p.x, p.y) < 175) p.damage(this.damage * 1.2, { element: 'celestial' });
      game.addParticles(this.x + Math.cos(this.facing) * 80, this.y - 40 + Math.sin(this.facing) * 50, 28, '#ffe6a0', 'slash');
      game.audio.sfx('swing_heavy');
      game.camera.shake(10);
    } else if (type === 'charge') {
      this.state = 'charge'; this.attackTimer = 0.6;
      game.audio.sfx('dash');
      return;
    } else if (type === 'wave') {
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * TAU + this.animTime;
        game.spawnProjectile({ x: this.x, y: this.y - 30, vx: Math.cos(a) * 185, vy: Math.sin(a) * 185, r: 11, damage: this.damage * 0.7, team: 'enemy', kind: 'shadowwave', color: '#c9a6ff', life: 3.2 });
      }
      game.audio.sfx('slam');
      game.camera.shake(12);
    } else if (type === 'meteors') {
      const count = this.phase >= 3 ? 8 : 5;
      for (let i = 0; i < count; i++) {
        const a = rand(TAU), d = rand(40, 320);
        game.spawnMeteor(p.x + Math.cos(a) * d, p.y + Math.sin(a) * d, rand(0.4, 1.2), this.damage * 0.8);
      }
      game.audio.sfx('boss_roar');
    } else if (type === 'summon') {
      const n = this.phase >= 3 ? 3 : 2;
      for (let i = 0; i < n; i++) {
        const a = (i / n) * TAU + rand(0.4);
        game.spawnEnemy('espectro', this.x + Math.cos(a) * 150, this.y + Math.sin(a) * 120, 8 + this.phase, true);
      }
      game.audio.sfx('summon');
    } else if (type === 'beam') {
      game.spawnBossBeam(this.x, this.y - 40, this.facing, this.damage * 1.5);
      game.audio.sfx('lightning');
      game.camera.shake(16);
    }
    this.state = 'recover';
    this.attackTimer = 0.55;
    this.telegraph = null;
  }

  takeDamage(amount, opts = {}) {
    if (this.dead || this.invuln > 0) return 0;
    let dmg = amount;
    let armor = this.armor;
    // Escarabajo: blindaje frontal.
    if (this.kind === 'beetle' && opts.attacker) {
      const a = Math.atan2(this.y - opts.attacker.y, this.x - opts.attacker.x);
      if (Math.abs(angleDiff(a, this.facing)) < 1.2) armor += 18;
    }
    dmg *= 100 / (100 + armor * 4.2);
    dmg = Math.max(1, Math.round(dmg));
    this.hp -= dmg;
    this.hurtFlash = 0.16;
    this.aggro = true;
    this.aggroTimer = 8;
    const color = opts.crit ? '#ffcf5a' : opts.element === 'fuego' ? '#ff8a3d' : opts.element === 'hielo' ? '#8fd8ff' : '#fff3c4';
    this.game.addFloatText(this.x + rand(-10, 10), this.y - this.radius - 30, `${opts.crit ? '¡' : ''}${dmg}`, color, opts.crit ? 22 : 16);
    this.game.addParticles(this.x, this.y - this.radius, opts.crit ? 18 : 10, color, 'spark');
    this.game.audio.sfx(opts.crit ? 'crit' : 'hit');
    this.game.hitStop = Math.max(this.game.hitStop, opts.crit ? 0.07 : 0.035);
    this.game.camera.shake(opts.crit ? 7 : 3);
    this.game.vibrate(opts.crit ? 35 : 15);
    if (opts.knockback) {
      const a = opts.angle ?? dirTo(opts.attacker?.x ?? this.x, opts.attacker?.y ?? this.y, this.x, this.y);
      this._move(Math.cos(a) * opts.knockback * 0.06, Math.sin(a) * opts.knockback * 0.06);
    }
    if (opts.slow) this.slowTimer = Math.max(this.slowTimer || 0, opts.slow);
    if (opts.burn) this.burnTimer = Math.max(this.burnTimer || 0, opts.burn);
    if (this.hp <= 0) {
      this.hp = 0;
      this.die();
    }
    return dmg;
  }

  die() {
    if (this.dead) return;
    this.dead = true;
    this.deathTimer = 0.9;
    this.state = 'dead';
    this.game.audio.sfx(this.boss ? 'boss_roar' : 'enemy_die');
    this.game.addParticles(this.x, this.y - this.radius, this.boss ? 80 : 24, this.def.color, 'burst');
    this.game.addParticles(this.x, this.y - this.radius, 12, '#fff3c4', 'spark');
    this.game.onEnemyKilled(this);
  }

  draw(ctx, t) {
    if (this.dead) {
      const a = clamp(this.deathTimer / 0.9, 0, 1);
      ctx.save();
      ctx.globalAlpha = a;
      ctx.translate(0, (1 - a) * 10);
      drawEnemy(ctx, this, t);
      ctx.restore();
      return;
    }
    drawEnemy(ctx, this, t);
  }
}

// ---------------------------------------------------------------------------
// PROYECTILES
// ---------------------------------------------------------------------------

export class Projectile {
  constructor(game, opts) {
    this.game = game;
    this.x = opts.x;
    this.y = opts.y;
    this.vx = opts.vx || 0;
    this.vy = opts.vy || 0;
    this.r = opts.r || 8;
    this.damage = opts.damage || 10;
    this.team = opts.team || 'player';
    this.kind = opts.kind || 'arcane';
    this.color = opts.color || '#9fe3ff';
    this.life = opts.life || 2;
    this.maxLife = this.life;
    this.pierce = opts.pierce || 0;
    this.homing = opts.homing || 0;
    this.target = opts.target || null;
    this.slow = opts.slow || 0;
    this.burn = opts.burn || 0;
    this.knockback = opts.knockback || 0;
    this.crit = opts.crit || false;
    this.element = opts.element || null;
    this.owner = opts.owner || null;
    this.hitSet = new Set();
    this.dead = false;
    this.trail = [];
    this.angle = Math.atan2(this.vy, this.vx);
    this.onHit = opts.onHit || null;
    this.gravity = opts.gravity || 0;
  }

  update(dt) {
    if (this.dead) return;
    this.life -= dt;
    if (this.life <= 0) { this.dead = true; return; }
    if (this.homing && this.target && !this.target.dead) {
      const a = Math.atan2(this.target.y - this.y, this.target.x - this.x);
      const sp = Math.hypot(this.vx, this.vy);
      const cur = Math.atan2(this.vy, this.vx);
      const na = rotateToward(cur, a, this.homing * dt);
      this.vx = Math.cos(na) * sp;
      this.vy = Math.sin(na) * sp;
    }
    if (this.gravity) this.vy += this.gravity * dt;
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.angle = Math.atan2(this.vy, this.vx);
    if (this.kind !== 'beam') {
      this.trail.push({ x: this.x, y: this.y, life: 0.3 });
      if (this.trail.length > 10) this.trail.shift();
      for (const t of this.trail) t.life -= dt;
    }
    // Colisión con mundo.
    if (this.kind !== 'beam' && this.game.world.collides(this.x, this.y, this.r * 0.5)) {
      this.impact();
      return;
    }
    if (this.team === 'player') {
      for (const e of this.game.enemies) {
        if (e.dead || this.hitSet.has(e)) continue;
        if (dist2(this.x, this.y, e.x, e.y - e.radius * 0.4) < (this.r + e.radius) ** 2) {
          this.hitSet.add(e);
          const dmg = e.takeDamage(this.damage, { crit: this.crit, element: this.element, attacker: this.game.player, knockback: this.knockback, slow: this.slow, burn: this.burn });
          if (this.onHit) this.onHit(e, dmg);
          this.game.addParticles(this.x, this.y, 8, this.color, 'spark');
          if (this.pierce > 0) this.pierce--;
          else { this.dead = true; return; }
        }
      }
    } else {
      const p = this.game.player;
      if (p && p.state !== 'dead' && dist2(this.x, this.y, p.x, p.y - 20) < (this.r + p.radius + 4) ** 2) {
        p.damage(this.damage, { element: this.element });
        this.dead = true;
        return;
      }
    }
  }

  impact() {
    this.dead = true;
    this.game.addParticles(this.x, this.y, 12, this.color, 'burst');
    this.game.audio.sfx(this.kind === 'fire' ? 'fire' : this.kind === 'ice' ? 'ice' : 'hit');
  }

  draw(ctx, t) {
    if (this.dead) return;
    const a = Math.atan2(this.vy, this.vx);
    ctx.save();
    // Estela.
    for (let i = 0; i < this.trail.length; i++) {
      const tr = this.trail[i];
      ctx.globalAlpha = Math.max(0, tr.life / 0.3) * 0.4;
      ctx.fillStyle = this.color;
      ctx.beginPath(); ctx.arc(tr.x, tr.y, this.r * (0.3 + i / this.trail.length * 0.7), 0, TAU); ctx.fill();
    }
    ctx.globalAlpha = 1;
    ctx.translate(this.x, this.y);
    ctx.rotate(a);
    if (this.kind === 'arrow') {
      ctx.strokeStyle = '#e8d7a8'; ctx.lineWidth = 2.5; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(-14, 0); ctx.lineTo(6, 0); ctx.stroke();
      ctx.fillStyle = '#e8c56a';
      ctx.beginPath(); ctx.moveTo(12, 0); ctx.lineTo(4, -4); ctx.lineTo(4, 4); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#f4e6c8'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(-12, 0); ctx.lineTo(-16, -4); ctx.moveTo(-12, 0); ctx.lineTo(-16, 4); ctx.stroke();
    } else if (this.kind === 'fire') {
      drawGlow(ctx, 0, 0, this.r * 3.5, '#ff8a3d', 0.7);
      const g = ctx.createRadialGradient(0, 0, 1, 0, 0, this.r * 1.5);
      g.addColorStop(0, '#fff3c4'); g.addColorStop(0.4, '#ffb35a'); g.addColorStop(1, 'rgba(255,90,40,0)');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.ellipse(0, 0, this.r * 1.8, this.r, 0, 0, TAU); ctx.fill();
    } else if (this.kind === 'ice') {
      drawGlow(ctx, 0, 0, this.r * 3, '#8fd8ff', 0.6);
      ctx.fillStyle = '#d8f8ff';
      ctx.beginPath(); ctx.moveTo(this.r * 1.8, 0); ctx.lineTo(-this.r, -this.r * 0.7); ctx.lineTo(-this.r * 0.3, 0); ctx.lineTo(-this.r, this.r * 0.7); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 1; ctx.stroke();
    } else if (this.kind === 'wraith' || this.kind === 'shadowwave') {
      drawGlow(ctx, 0, 0, this.r * 3, this.color, 0.55);
      ctx.fillStyle = this.color;
      ctx.beginPath(); ctx.arc(0, 0, this.r, 0, TAU); ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.arc(-this.r * 0.2, -this.r * 0.2, this.r * 0.35, 0, TAU); ctx.fill();
      if (this.kind === 'shadowwave') {
        ctx.strokeStyle = this.color; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(0, 0, this.r * 1.8, -1, 1); ctx.stroke();
      }
    } else if (this.kind === 'holy' || this.kind === 'celestial') {
      drawGlow(ctx, 0, 0, this.r * 4, '#fff3c4', 0.7);
      ctx.fillStyle = '#fff8dc';
      drawStar(ctx, 0, 0, this.r * 1.3, 4, 0.35); ctx.fill();
    } else if (this.kind === 'meteor') {
      drawGlow(ctx, 0, 0, this.r * 4, '#ff8a3d', 0.7);
      ctx.fillStyle = '#ffcf5a';
      ctx.beginPath(); ctx.arc(0, 0, this.r, 0, TAU); ctx.fill();
      ctx.fillStyle = '#fff3c4';
      ctx.beginPath(); ctx.arc(-this.r * 0.2, -this.r * 0.2, this.r * 0.5, 0, TAU); ctx.fill();
    } else {
      drawGlow(ctx, 0, 0, this.r * 3, this.color, 0.6);
      ctx.fillStyle = this.color;
      ctx.beginPath(); ctx.arc(0, 0, this.r, 0, TAU); ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.arc(-this.r * 0.25, -this.r * 0.25, this.r * 0.4, 0, TAU); ctx.fill();
    }
    ctx.restore();
  }
}

// ---------------------------------------------------------------------------
// RECOMPENSAS
// ---------------------------------------------------------------------------

export class Pickup {
  constructor(game, x, y, opts = {}) {
    this.game = game;
    this.x = x;
    this.y = y;
    this.type = opts.type || 'gold';
    this.itemId = opts.itemId || null;
    this.amount = opts.amount || 1;
    this.equipment = opts.equipment || false;
    this.color = opts.color || '#ffe6a0';
    this.life = opts.life || 30;
    this.bob = Math.random() * TAU;
    this.vx = opts.vx ?? rand(-60, 60);
    this.vy = opts.vy ?? rand(-100, -30);
    this.grounded = false;
    this.dead = false;
    this.radius = 8;
  }

  update(dt) {
    if (this.dead) return;
    this.life -= dt;
    if (this.life <= 0) { this.dead = true; return; }
    const p = this.game.player;
    const d = dist(this.x, this.y, p.x, p.y - 20);
    if (!this.grounded) {
      this.x += this.vx * dt;
      this.y += this.vy * dt;
      this.vy += 300 * dt;
      if (this.vy > 0 && this.y > this.y + 0) this.grounded = true;
      if (this.vy > 140) this.grounded = true;
    }
    if (d < 90) {
      const a = Math.atan2(p.y - 20 - this.y, p.x - this.x);
      const sp = d < 30 ? 240 : 130;
      this.x += Math.cos(a) * sp * dt;
      this.y += Math.sin(a) * sp * dt;
    }
    if (d < 22) this.collect();
  }

  collect() {
    if (this.dead) return;
    this.dead = true;
    this.game.collectPickup(this);
  }

  draw(ctx, t) {
    if (this.dead) return;
    const bob = Math.sin(t * 3 + this.bob) * 3;
    ctx.save();
    ctx.translate(this.x, this.y + bob);
    drawGlow(ctx, 0, 0, 18, this.color, 0.5);
    if (this.type === 'gold') {
      ctx.fillStyle = '#e8c56a';
      ctx.beginPath(); ctx.ellipse(0, 0, 6, 7, 0, 0, TAU); ctx.fill();
      ctx.strokeStyle = '#fff3c4'; ctx.lineWidth = 1; ctx.stroke();
      ctx.fillStyle = '#b08a3d';
      ctx.font = 'bold 7px Georgia'; ctx.textAlign = 'center'; ctx.fillText('✦', 0, 3);
    } else {
      ctx.fillStyle = this.color;
      ctx.beginPath(); ctx.arc(0, 0, 7, 0, TAU); ctx.fill();
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 1; ctx.stroke();
      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.arc(-2, -2, 2, 0, TAU); ctx.fill();
    }
    ctx.restore();
  }
}

// ---------------------------------------------------------------------------
// CRIATURA INVOCADA (visual)
// ---------------------------------------------------------------------------

export class Summon {
  constructor(game, creatureId, x, y) {
    this.game = game;
    this.id = creatureId;
    this.x = x;
    this.y = y;
    this.life = 2.4;
    this.maxLife = 2.4;
    this.dead = false;
    this.color = CREATURES[creatureId]?.color || '#ffe6a0';
    this.seed = Math.random() * TAU;
  }

  update(dt) {
    this.life -= dt;
    if (this.life <= 0) this.dead = true;
    const p = this.game.player;
    const a = Math.atan2(p.y - this.y, p.x - this.x);
    this.x += Math.cos(a) * 40 * dt;
    this.y += Math.sin(a) * 40 * dt;
  }

  draw(ctx, t) {
    const a = clamp(this.life / this.maxLife, 0, 1);
    ctx.save();
    ctx.globalAlpha = a;
    ctx.translate(this.x, this.y - 30 + Math.sin(t * 4) * 5);
    drawGlow(ctx, 0, 0, 34, this.color, 0.5);
    ctx.fillStyle = this.color;
    drawStar(ctx, 0, 0, 12, 4, 0.35); ctx.fill();
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.restore();
  }
}
