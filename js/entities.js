// Entidades: protagonista, enemigos, jefes, proyectiles, criaturas y botín.
import {
  TAU, clamp, dist, angleDiff, norm, pointInArc
} from './utils.js';
import { getItem, SKILLS, CREATURES, ENEMIES, BOSSES, BOSS_BASE, DIFFICULTIES } from './data.js';

const statKeys = ['vit', 'str', 'def', 'agi', 'int', 'luck'];

export class Player {
  constructor(game, options = {}) {
    this.game = game;
    this.name = options.name || 'Aria';
    this.appearance = options.appearance || {
      hairStyle: 1, hairColor: '#6b442d', outfitColor: '#315d8a', skinColor: '#e5b18c', cloakColor: '#a94a3e'
    };
    this.equipment = {
      weapon: options.weapon || 'espada_alba',
      shield: options.shield || null,
      armor: options.armor || 'tunica_viajero',
      accessory: options.accessory || null
    };
    this.level = 1;
    this.xp = 0;
    this.xpNext = 38;
    this.base = { vit: 5, str: 5, def: 4, agi: 5, int: 4, luck: 4 };
    this.statPoints = 0;
    this.inventory = {
      pocion_vida: 4, pocion_mana: 2, sello_vinculo: 3, tonico_resistencia: 1
    };
    this.lumens = 60;
    this.skills = ['corte_celestial'];
    this.activeSkill = 'corte_celestial';
    this.creatures = [];
    this.activeCreature = null;
    this.creatureCooldown = 0;
    this.maxCreatureCooldown = 34;
    this.x = options.x ?? 16 * 48;
    this.y = options.y ?? 56 * 48;
    this.spawnX = this.x;
    this.spawnY = this.y;
    this.radius = 13;
    this.facing = -Math.PI / 2;
    this.fx = 0; this.fy = -1;
    this.state = 'idle';
    this.walk = 0;
    this.animTime = 0;
    this.attackTimer = 0;
    this.attackDuration = 0.3;
    this.attackPose = 0;
    this.attackDone = false;
    this.combo = 0;
    this.comboTimer = 0;
    this.attackCd = 0;
    this.dodgeTimer = 0;
    this.dodgeDir = { x: 0, y: -1 };
    this.dodgeTrail = 0;
    this.invuln = 0;
    this.hurtTimer = 0;
    this.castTimer = 0;
    this.castDone = false;
    this.blocking = false;
    this.blockTimer = 0;
    this.blockStart = 0;
    this.dodgePressTime = 0;
    this.dodgePressed = false;
    this.cooldowns = {};
    this.regen = 0;
    this.regenRate = 0;
    this.hitFlash = 0;
    this.distanceWalked = 0;
    this.stepAccum = 0;
    this.dead = false;
    this.statsCache = null;
    this.recomputeStats();
    this.hp = this.stats.maxHp;
    this.mp = this.stats.maxMp;
    this.stamina = this.stats.maxStamina;
  }

  get weapon() { return getItem(this.equipment.weapon) || getItem('espada_alba'); }
  get shield() { return this.equipment.shield ? getItem(this.equipment.shield) : null; }
  get armor() { return this.equipment.armor ? getItem(this.equipment.armor) : null; }
  get accessory() { return this.equipment.accessory ? getItem(this.equipment.accessory) : null; }

  get stats() {
    if (!this.statsCache) this.recomputeStats();
    return this.statsCache;
  }

  recomputeStats(adjustCurrent = false) {
    const old = this.statsCache;
    const items = [this.weapon, this.shield, this.armor, this.accessory].filter(Boolean);
    const bonus = {};
    for (const item of items) {
      for (const [k, v] of Object.entries(item.stats || {})) bonus[k] = (bonus[k] || 0) + v;
    }
    const lvl = this.level;
    const vit = this.base.vit + lvl;
    const str = this.base.str + Math.floor(lvl * 0.65);
    const def = this.base.def + Math.floor(lvl * 0.55);
    const agi = this.base.agi + Math.floor(lvl * 0.5);
    const int = this.base.int + Math.floor(lvl * 0.6);
    const luck = this.base.luck + Math.floor(lvl * 0.35);
    const passive = this.passives();
    const maxHp = Math.round(68 + vit * 8 + lvl * 6 + (bonus.hp || 0) + (passive.hp || 0));
    const maxMp = Math.round(22 + int * 5 + lvl * 2 + (bonus.mp || 0) + (passive.mp || 0));
    const maxStamina = Math.round(88 + agi * 3 + (bonus.stamina || 0));
    const atk = 5 + str * 1.3 + lvl * 0.65 + (bonus.atk || 0) + (passive.atk || 0);
    const defense = 2 + def * 0.82 + lvl * 0.35 + (bonus.def || 0) + (passive.def || 0);
    const speed = clamp(142 + agi * 3.1 + (bonus.agi || 0) * 4, 110, 270) * (passive.speed || 1);
    const crit = clamp(4 + luck * 0.62 + (bonus.crit || 0) + (passive.crit || 0), 0, 75);
    const magic = int * 1.2 + (bonus.int || 0) * 2;
    this.statsCache = {
      vit, str, def, agi, int, luck, maxHp, maxMp, maxStamina, atk, defense, speed, crit, magic,
      moveSpeed: speed
    };
    if (adjustCurrent && old) {
      this.hp = Math.min(this.stats.maxHp, this.hp + Math.max(0, this.stats.maxHp - old.maxHp));
      this.mp = Math.min(this.stats.maxMp, this.mp + Math.max(0, this.stats.maxMp - old.maxMp));
      this.stamina = Math.min(this.stats.maxStamina, this.stamina);
    }
    if (!adjustCurrent && old) {
      this.hp = Math.min(this.hp, this.stats.maxHp);
      this.mp = Math.min(this.mp, this.stats.maxMp);
      this.stamina = Math.min(this.stamina, this.stats.maxStamina);
    }
    return this.statsCache;
  }

  passives() {
    const out = {};
    const def = this.activeCreature ? CREATURES[this.activeCreature] : null;
    if (!def) return out;
    if (def.id === 'lumito') out.hpRegen = 1.5;
    if (def.id === 'lobo_ceniza') out.speed = 1.08;
    if (def.id === 'escarabajo_petreo') out.def = 6;
    if (def.id === 'espectro_ruinas') out.mp = 12;
    if (def.id === 'fenix_brasa') out.crit = 8;
    return out;
  }

  addItem(id, qty = 1) {
    this.inventory[id] = (this.inventory[id] || 0) + qty;
    return this.inventory[id];
  }

  removeItem(id, qty = 1) {
    if ((this.inventory[id] || 0) < qty) return false;
    this.inventory[id] -= qty;
    if (this.inventory[id] <= 0) delete this.inventory[id];
    return true;
  }

  countItem(id) { return this.inventory[id] || 0; }

  heal(amount, show = true) {
    const before = this.hp;
    this.hp = Math.min(this.stats.maxHp, this.hp + amount);
    const gained = this.hp - before;
    if (gained > 0 && show) this.game.effects.healText(this.x, this.y, gained);
    return gained;
  }

  restoreMana(amount, show = true) {
    const before = this.mp;
    this.mp = Math.min(this.stats.maxMp, this.mp + amount);
    if (this.mp - before > 0 && show) this.game.effects.manaText(this.x, this.y, this.mp - before);
  }

  consumeStamina(amount) {
    if (this.stamina < amount) return false;
    this.stamina -= amount;
    return true;
  }

  update(dt, game) {
    this.animTime += dt;
    this.attackCd = Math.max(0, this.attackCd - dt);
    this.comboTimer = Math.max(0, this.comboTimer - dt);
    this.invuln = Math.max(0, this.invuln - dt);
    this.hurtTimer = Math.max(0, this.hurtTimer - dt);
    this.hitFlash = Math.max(0, this.hitFlash - dt);
    this.creatureCooldown = Math.max(0, this.creatureCooldown - dt);
    if (this.buffShield > 0) this.buffShield = Math.max(0, this.buffShield - dt);
    for (const k of Object.keys(this.cooldowns)) this.cooldowns[k] = Math.max(0, this.cooldowns[k] - dt);
    if (this.dead) return;

    const passive = this.passives();
    // Regeneración pasiva y de habilidad.
    this.stamina = Math.min(this.stats.maxStamina, this.stamina + dt * (10 + this.stats.agi * 0.25));
    if (passive.hpRegen && this.hp > 0) this.heal(passive.hpRegen * dt, false);
    if (this.regen > 0) {
      this.regen -= dt;
      this.heal(this.regenRate * dt, false);
      if (Math.random() < dt * 6) this.game.effects.heal(this.x, this.y, 1);
    }
    if (this.hp <= 0) { this.die(); return; }

    // Bloqueo con escudo: mantener B. Un toque corto se convierte en esquiva.
    const dodgeDown = game.input.isDown('dodge');
    if (this.shield && dodgeDown && this.state !== 'attack' && this.state !== 'dodge' && this.state !== 'cast' && this.hurtTimer <= 0) {
      if (!this.blocking) { this.blocking = true; this.blockStart = this.animTime; }
      if (this.stamina > 2) {
        this.state = 'block';
        this.stamina = Math.max(0, this.stamina - dt * 11);
      } else {
        this.blocking = false;
        this.state = 'idle';
      }
    } else {
      if (this.blocking) {
        this.blocking = false;
        if (this.animTime - this.blockStart < 0.18 && dodgeDown === false) this.tryDodge(game);
        if (this.state === 'block') this.state = 'idle';
      }
    }
    if (!this.shield && !dodgeDown) this.blocking = false;

    if (this.state === 'attack') {
      this.updateAttack(dt, game);
    } else if (this.state === 'dodge') {
      this.updateDodge(dt, game);
    } else if (this.state === 'cast') {
      this.updateCast(dt, game);
    } else if (this.hurtTimer > 0) {
      this.state = 'hurt';
    } else if (this.blocking) {
      this.state = 'block';
      this.walk = 0;
    } else {
      this.state = 'idle';
      this.updateMovement(dt, game);
    }

    if (this.state !== 'block') this.blocking = false;
    this.attackPose = this.state === 'attack' ? clamp(this.attackTimer / this.attackDuration, 0, 1) : this.attackPose;
    this.xpNext = Math.max(12, Math.round(38 * Math.pow(this.level, 1.32) + this.level * 8));
  }

  updateMovement(dt, game) {
    const axis = game.input.axis();
    let mx = axis.x, my = axis.y;
    const mag = Math.hypot(mx, my);
    if (mag > 1) { mx /= mag; my /= mag; }
    if (mag > 0.1) {
      this.facing = Math.atan2(my, mx);
      this.fx = Math.cos(this.facing); this.fy = Math.sin(this.facing);
      const speed = this.stats.speed * (this.blocking ? 0.34 : 1);
      game.world.moveWithCollision(this, mx * speed * dt, my * speed * dt, game, this.radius);
      this.walk = Math.min(1, this.walk + dt * 3.4);
      this.state = this.blocking ? 'block' : 'walk';
      const d = Math.hypot(mx * speed * dt, my * speed * dt);
      this.distanceWalked += d;
      this.stepAccum += d;
      if (this.stepAccum > 34) { this.stepAccum = 0; game.audio.footstep(); }
      if (Math.random() < dt * 2 && game.world.terrainAtPx(this.x, this.y) === 2) game.effects.leaf(this.x, this.y + 2, 1);
    } else {
      this.walk = Math.max(0, this.walk - dt * 5);
      this.state = this.blocking ? 'block' : 'idle';
    }
  }

  tryAttack(game) {
    if (this.dead || this.state === 'dodge' || this.state === 'hurt' || this.state === 'cast') return false;
    if (this.attackCd > 0 || this.stamina < 5) return false;
    const w = this.weapon;
    const speed = w.speed || 1;
    this.attackDuration = clamp(0.36 / speed, 0.17, 0.52);
    this.attackTimer = 0;
    this.attackDone = false;
    this.attackCd = this.attackDuration * 0.58;
    this.stamina -= 4.5;
    this.combo = this.comboTimer > 0 ? (this.combo % 3) + 1 : 1;
    this.comboTimer = 0.72;
    this.state = 'attack';
    // Autoapuntado suave.
    if (game.input.axis().magnitude < 0.2) {
      const target = game.findNearestEnemy(this.x, this.y, 150);
      if (target) {
        this.facing = Math.atan2(target.y - this.y, target.x - this.x);
        this.fx = Math.cos(this.facing); this.fy = Math.sin(this.facing);
      }
    }
    game.audio.sfx('swing', { volume: 0.9 });
    game.effects.dust(this.x, this.y + 2, '#d6c8a8', 3);
    return true;
  }

  updateAttack(dt, game) {
    this.attackTimer += dt;
    this.walk = 0;
    const t = clamp(this.attackTimer / this.attackDuration, 0, 1);
    this.attackPose = t;
    if (!this.attackDone && t >= 0.46) {
      this.attackDone = true;
      this.performAttackHit(game);
    }
    if (t >= 1) {
      this.state = 'idle';
      this.attackPose = 0;
    }
  }

  performAttackHit(game) {
    const w = this.weapon;
    const isProjectile = !!w.projectile;
    const comboMult = [0, 1, 1.08, 1.38][this.combo] || 1;
    const critRoll = Math.random() * 100 < this.stats.crit + (w.crit || 0);
    const raw = (this.stats.atk + (w.stats?.atk || 0) * 0.5) * comboMult * (critRoll ? 1.65 : 1);
    const element = w.element || 'physical';
    if (isProjectile) {
      const kind = w.weaponType === 'bow' ? 'arrow' : 'orb';
      const speed = w.boltSpeed || 520;
      game.spawnProjectile({
        x: this.x + this.fx * 20, y: this.y - 22 + this.fy * 8,
        vx: this.fx * speed, vy: this.fy * speed,
        radius: kind === 'arrow' ? 7 : 10, damage: raw, crit: critRoll, element,
        team: 'player', kind, color: w.weaponType === 'bow' ? '#bdf0a6' : '#a9e3ff',
        life: 0.95, pierce: 0
      });
      game.audio.sfx('magic', { volume: 0.55 });
    } else {
      const range = w.range || 60;
      const arc = w.arc || 1.4;
      const targets = game.enemies.filter(e => !e.dead && pointInArc(e.x, e.y, this.x, this.y - 14, this.facing, range + e.radius, arc));
      for (const e of targets) {
        const dir = Math.atan2(e.y - this.y, e.x - this.x);
        game.damageEnemy(e, raw, {
          crit: critRoll, element, source: this,
          knockback: (w.knockback || 120) * comboMult,
          dir, hitType: 'melee'
        });
      }
      if (targets.length > 0) {
        game.hitstop = Math.max(game.hitstop, 0.045);
        game.camera.shake = Math.max(game.camera.shake, critRoll ? 8 : 4);
        game.audio.sfx(critRoll ? 'crit' : 'hit', { volume: 0.9 });
      }
      const slashColor = w.weaponType === 'greatsword' ? '#ffc28a' : w.weaponType === 'dagger' ? '#d8f5ff' : '#ffe6a0';
      game.effects.slash(this.x + this.fx * 16, this.y - 20, this.facing, range * 0.8, slashColor, arc, w.weaponType === 'greatsword' ? 14 : 9, 0.19);
      game.effects.spark(this.x + this.fx * range * 0.6, this.y - 20 + this.fy * range * 0.35, slashColor, 4, this.facing);
    }
  }

  tryDodge(game) {
    if (this.dead || this.state === 'dodge' || this.hurtTimer > 0) return false;
    if (!this.consumeStamina(19)) {
      game.toast('Sin resistencia', 'No puedes esquivar todavía.', 'warning');
      return false;
    }
    const axis = game.input.axis();
    let dx = axis.x, dy = axis.y;
    if (Math.hypot(dx, dy) < 0.15) { dx = this.fx; dy = this.fy; }
    const n = norm(dx, dy);
    this.dodgeDir = n;
    this.facing = Math.atan2(n.y, n.x);
    this.state = 'dodge';
    this.dodgeTimer = 0.27;
    this.invuln = 0.36;
    this.attackPose = 0;
    game.audio.sfx('dodge');
    game.effects.dust(this.x, this.y + 2, '#d8cbb2', 5);
    return true;
  }

  updateDodge(dt, game) {
    this.dodgeTimer -= dt;
    const speed = 560;
    game.world.moveWithCollision(this, this.dodgeDir.x * speed * dt, this.dodgeDir.y * speed * dt, game, this.radius - 2);
    this.dodgeTrail -= dt;
    if (this.dodgeTrail <= 0) {
      this.dodgeTrail = 0.045;
      const self = this;
      game.effects.afterimage((c, x, y) => {
        c.save(); c.globalAlpha = 0.35;
        game.renderPlayerAt(c, { x, y, facing: self.facing, walk: 0, attackPose: 0, state: 'dodge', blocking: false });
        c.restore();
      }, this.x, this.y, 0.24, 'rgba(165,225,255,.4)');
    }
    if (Math.random() < dt * 10) game.effects.spark(this.x, this.y - 20, '#bfe9ff', 1);
    if (this.dodgeTimer <= 0) {
      this.state = 'idle';
      this.walk = 0;
    }
  }

  trySkill(game) {
    if (this.dead || this.state === 'dodge' || this.state === 'hurt' || this.state === 'cast') return false;
    const skill = SKILLS[this.activeSkill];
    if (!skill || this.level < skill.level) return false;
    if ((this.cooldowns[skill.id] || 0) > 0) {
      game.toast('Habilidad en recarga', `${skill.name} estará lista en ${this.cooldowns[skill.id].toFixed(1)} s.`, 'info');
      return false;
    }
    if (this.mp < skill.mana) {
      game.toast('Maná insuficiente', `Necesitas ${skill.mana} de maná.`, 'warning');
      return false;
    }
    this.mp -= skill.mana;
    this.cooldowns[skill.id] = skill.cooldown;
    this.state = 'cast';
    this.castTimer = 0;
    this.castDone = false;
    this.attackPose = 0;
    if (game.input.axis().magnitude < 0.2) {
      const target = game.findNearestEnemy(this.x, this.y, 260);
      if (target) {
        this.facing = Math.atan2(target.y - this.y, target.x - this.x);
        this.fx = Math.cos(this.facing); this.fy = Math.sin(this.facing);
      }
    }
    game.audio.sfx('magic', { volume: 0.8 });
    game.effects.ring(this.x, this.y - 20, 42, skill.color, 3, 0.4, 8);
    return true;
  }

  updateCast(dt, game) {
    this.castTimer += dt;
    this.walk = 0;
    if (!this.castDone && this.castTimer > 0.18) {
      this.castDone = true;
      this.performSkill(game);
    }
    if (this.castTimer > 0.48) this.state = 'idle';
  }

  performSkill(game) {
    const skill = SKILLS[this.activeSkill];
    if (!skill) return;
    const atk = this.stats.atk + this.stats.magic * 0.55;
    if (skill.id === 'corte_celestial') {
      game.spawnProjectile({
        x: this.x + this.fx * 20, y: this.y - 20, vx: this.fx * 520, vy: this.fy * 520,
        radius: 26, damage: atk * skill.damage, crit: Math.random() * 100 < this.stats.crit,
        element: skill.element, team: 'player', kind: 'crescent', color: skill.color,
        life: 1.0, pierce: 6, knockback: 160
      });
      game.effects.beam(this.x + this.fx * 18, this.y - 22, this.x + this.fx * 70, this.y - 22 + this.fy * 50, skill.color, 7, 0.25);
      game.effects.ring(this.x + this.fx * 40, this.y - 20, 55, skill.color, 4, 0.35);
      game.camera.shake = Math.max(game.camera.shake, 5);
    } else if (skill.id === 'danza_hojas') {
      game.effects.ring(this.x, this.y - 20, 112, skill.color, 6, 0.65, 18);
      game.effects.leaf(this.x, this.y - 20, 30);
      for (let pulse = 0; pulse < 3; pulse++) {
        game.schedule(pulse * 0.13, () => {
          for (const e of game.enemies) {
            if (e.dead) continue;
            if (dist(e.x, e.y, this.x, this.y) < 120) {
              game.damageEnemy(e, atk * skill.damage, { element: skill.element, source: this, knockback: 120, dir: Math.atan2(e.y - this.y, e.x - this.x) });
            }
          }
          game.effects.slash(this.x, this.y - 20, this.animTime * 7 + pulse, 104, skill.color, 5.6, 8, 0.18);
          game.audio.sfx('swing', { volume: 0.4 });
        });
      }
      game.camera.shake = Math.max(game.camera.shake, 6);
    } else if (skill.id === 'sanacion_lunar') {
      this.heal(this.stats.maxHp * 0.38);
      this.regen = 8;
      this.regenRate = this.stats.maxHp * 0.025;
      game.effects.heal(this.x, this.y - 20, 34);
      game.effects.ring(this.x, this.y, 84, skill.color, 5, 1.1, 10);
      game.audio.sfx('heal', { volume: 0.9 });
    } else if (skill.id === 'lanza_aurora') {
      const len = 430;
      const x2 = this.x + this.fx * len, y2 = this.y - 20 + this.fy * len;
      game.effects.beam(this.x, this.y - 22, x2, y2, skill.color, 16, 0.48);
      game.effects.ring(x2, y2, 38, skill.color, 4, 0.4);
      for (const e of game.enemies) {
        if (e.dead) continue;
        const px = e.x, py = e.y - 10;
        const t = clamp(((px - this.x) * this.fx + (py - (this.y - 20)) * this.fy) / len, 0, 1);
        const cx = this.x + this.fx * len * t, cy = this.y - 20 + this.fy * len * t;
        if (dist(px, py, cx, cy) < 35 + e.radius) {
          game.damageEnemy(e, atk * skill.damage, { crit: true, element: skill.element, source: this, knockback: 240, dir: this.facing });
        }
      }
      game.camera.shake = Math.max(game.camera.shake, 10);
      game.audio.sfx('crit', { volume: 0.7 });
    }
  }

  takeDamage(amount, source, element = 'physical', opts = {}) {
    if (this.dead || this.invuln > 0) return 0;
    const game = this.game;
    const def = this.stats.defense + (this.stats.def || 0);
    let dmg = amount * (1 - def / (def + 105));
    if (this.buffShield > 0) dmg *= 0.62;
    const srcX = source?.x ?? this.x, srcY = source?.y ?? this.y;
    const attackAngle = Math.atan2(srcY - this.y, srcX - this.x);
    const front = Math.abs(angleDiff(this.facing, attackAngle)) < 1.35;

    if (this.blocking && this.shield && front) {
      const perfect = this.animTime - this.blockStart < 0.2;
      if (perfect) {
        game.effects.ring(this.x + this.fx * 20, this.y - 20, 52, '#fff2b5', 5, 0.45, 10);
        game.effects.spark(this.x + this.fx * 18, this.y - 20, '#ffe8a0', 18);
        game.audio.sfx('block', { volume: 1 });
        game.toast('¡Parada perfecta!', 'El impacto no te ha movido.', 'success');
        if (source && !source.dead && source.knock) {
          source.stagger = Math.max(source.stagger || 0, 0.7);
          source.hitFlash = 0.15;
        }
        game.camera.shake = Math.max(game.camera.shake, 6);
        this.invuln = 0.3;
        return 0;
      }
      const blockPower = this.shield.block || 0.6;
      const blocked = dmg * blockPower;
      dmg -= blocked;
      this.stamina = Math.max(0, this.stamina - amount * 1.2);
      game.effects.ring(this.x + this.fx * 20, this.y - 22, 38, '#cfe8ff', 3, 0.25, 6);
      game.effects.spark(this.x + this.fx * 18, this.y - 20, '#dff2ff', 8);
      game.audio.sfx('block', { volume: 0.7 });
      if (this.stamina <= 0) {
        this.blocking = false;
        this.state = 'hurt';
        this.hurtTimer = 0.35;
      }
    }
    dmg = Math.max(1, Math.round(dmg));
    this.hp -= dmg;
    this.invuln = 0.62;
    this.hurtTimer = 0.26;
    this.hitFlash = 0.18;
    this.state = this.hp > 0 ? 'hurt' : 'dead';
    this.combo = 0;
    game.effects.damage(this.x, this.y - 28, dmg, false, element);
    game.effects.spark(this.x, this.y - 22, '#ff9b8f', 12);
    game.effects.text(this.x, this.y - 54, '¡Impacto!', '#ffb5a5', { size: 12, life: 0.6 });
    game.camera.shake = Math.max(game.camera.shake, 7);
    game.flash = Math.max(game.flash || 0, 0.35);
    game.audio.sfx('hurt', { volume: 0.85 });
    if (navigator.vibrate && game.settings.haptics) navigator.vibrate(35);
    if (this.hp <= 0) this.die();
    return dmg;
  }

  die() {
    if (this.dead) return;
    this.dead = true;
    this.state = 'dead';
    this.hp = 0;
    this.game.audio.sfx('die');
    this.game.onPlayerDeath();
  }

  gainXp(amount) {
    this.xp += amount;
    let leveled = false;
    while (this.xp >= this.xpNext) {
      this.xp -= this.xpNext;
      this.level++;
      this.statPoints += 2;
      this.xpNext = Math.max(12, Math.round(38 * Math.pow(this.level, 1.32) + this.level * 8));
      leveled = true;
      this.recomputeStats(true);
      this.hp = this.stats.maxHp;
      this.mp = this.stats.maxMp;
      this.stamina = this.stats.maxStamina;
      for (const skill of Object.values(SKILLS)) {
        if (skill.level === this.level && !this.skills.includes(skill.id)) {
          this.skills.push(skill.id);
          this.game.toast('Nueva habilidad', `${skill.name} está disponible en el menú de habilidades.`, 'success', 4600);
          this.game.audio.sfx('levelup');
        }
      }
    }
    if (leveled) {
      this.game.toast('Nivel ' + this.level, `Vida y maná restaurados. Tienes ${this.statPoints} puntos de atributo.`, 'success', 5000);
      this.game.audio.sfx('levelup');
      this.game.effects.ring(this.x, this.y, 90, '#ffe6a0', 5, 0.9, 10);
      this.game.effects.heal(this.x, this.y - 20, 28);
    }
  }

  getRenderData() {
    return {
      x: this.x, y: this.y, facing: this.facing, appearance: this.appearance,
      equipment: this.equipment, walk: this.walk, attackPose: this.attackPose,
      state: this.state, time: this.animTime, blocking: this.blocking, hitFlash: this.hitFlash
    };
  }

  serialize() {
    return {
      name: this.name, appearance: this.appearance, equipment: this.equipment,
      level: this.level, xp: this.xp, xpNext: this.xpNext, base: this.base,
      statPoints: this.statPoints, inventory: this.inventory, lumens: this.lumens,
      skills: this.skills, activeSkill: this.activeSkill, creatures: this.creatures,
      activeCreature: this.activeCreature, x: this.x, y: this.y,
      hp: this.hp, mp: this.mp, stamina: this.stamina,
      creatureCooldown: this.creatureCooldown
    };
  }

  hydrate(data) {
    Object.assign(this, data);
    this.recomputeStats();
    this.hp = clamp(this.hp, 1, this.stats.maxHp);
    this.mp = clamp(this.mp, 0, this.stats.maxMp);
    this.stamina = clamp(this.stamina, 0, this.stats.maxStamina);
    this.spawnX = this.x; this.spawnY = this.y;
  }
}

// -------------------------------- Enemigos --------------------------------
export class Enemy {
  constructor(game, type, x, y, opts = {}) {
    this.game = game;
    this.type = type;
    this.bossId = opts.bossId || null;
    const base = ENEMIES[type] || ENEMIES.gelatina;
    let def = { ...base };
    if (this.bossId && BOSSES[this.bossId]) {
      const b = BOSSES[this.bossId];
      const bb = BOSS_BASE[this.bossId] || base;
      def = { ...bb, ...b, draw: bb.draw, captureCreature: bb.captureCreature };
      this.boss = true;
    } else if (this.bossId === 'guardian') {
      def = { ...ENEMIES.guardian };
      this.boss = true;
    }
    this.def = def;
    this.id = `${type}_${Math.random().toString(36).slice(2, 8)}`;
    this.name = def.name;
    this.title = def.title || '';
    this.draw = def.draw;
    this.elite = !!opts.elite && !this.boss;
    this.visualScale = def.boss ? (this.bossId === 'guardian' ? 1.05 : 1.35) : this.elite ? 1.2 : 1;
    const diff = DIFFICULTIES[game.settings.difficulty] || DIFFICULTIES.normal;
    this.maxHp = Math.round(def.hp * diff.enemyHp * (this.elite ? 1.7 : 1));
    this.hp = this.maxHp;
    this.atk = def.atk * diff.enemyDmg * (this.elite ? 1.25 : 1);
    this.defense = def.def * (this.elite ? 1.2 : 1);
    this.speed = def.speed * (this.elite ? 1.08 : 1);
    this.radius = def.radius || 18;
    this.x = x; this.y = y;
    this.spawnX = x; this.spawnY = y;
    this.facing = Math.PI / 2;
    this.seed = Math.random() * 100;
    this.state = 'idle';
    this.aggro = false;
    this.attackCd = 1.0 + Math.random() * 1.2;
    this.windup = 0;
    this.windupMax = 0;
    this.pending = null;
    this.recovery = 0;
    this.stagger = 0;
    this.hitFlash = 0;
    this.dashTimer = 0;
    this.dashDir = { x: 0, y: 0 };
    this.dashHit = false;
    this.knockVX = 0; this.knockVY = 0;
    this.dead = false;
    this.deathTimer = 0;
    this.remove = false;
    this.dropDone = false;
    this.idleTimer = Math.random() * 2;
    this.wander = { x: 0, y: 0 };
    this.specialCd = 4 + Math.random() * 3;
    this.phase = 1;
    this.transition = 0;
    this.summoned = false;
    this.poison = 0;
    this.captureAttempts = 0;
    this.rewarded = false;
    this.contactCooldown = 0;
    this.strafeDir = Math.random() < 0.5 ? 1 : -1;
    this.strafeTimer = 1 + Math.random() * 2;
  }

  update(dt, game) {
    this.hitFlash = Math.max(0, this.hitFlash - dt);
    this.stagger = Math.max(0, this.stagger - dt);
    this.attackCd = Math.max(0, this.attackCd - dt);
    this.specialCd = Math.max(0, this.specialCd - dt);
    this.contactCooldown = Math.max(0, this.contactCooldown - dt);
    this.transition = Math.max(0, this.transition - dt);
    if (this.dead) {
      this.deathTimer -= dt;
      if (this.deathTimer <= 0) this.remove = true;
      return;
    }
    if (this.stagger > 0) {
      game.world.moveWithCollision(this, this.knockVX * dt, this.knockVY * dt, game, this.radius);
      this.knockVX *= Math.pow(0.02, dt);
      this.knockVY *= Math.pow(0.02, dt);
      this.state = 'stagger';
      return;
    }
    const p = game.player;
    const d = dist(this.x, this.y, p.x, p.y);
    if (!this.aggro && d < (this.def.aggro || 260) && !p.dead) {
      this.aggro = true;
      this.state = 'alert';
      this.attackCd = Math.min(this.attackCd, 0.7);
    }
    if (!this.aggro) {
      this.wanderIdle(dt, game);
      return;
    }
    if (p.dead) { this.state = 'idle'; return; }
    this.facing = Math.atan2(p.y - this.y, p.x - this.x);
    this.strafeTimer -= dt;
    if (this.strafeTimer <= 0) {
      this.strafeDir *= -1;
      this.strafeTimer = 1.2 + Math.random() * 2.2;
    }
    if (this.bossId === 'guardian') this.updateGuardian(dt, game);
    else if (this.bossId) this.updateEliteBoss(dt, game);
    else this.updateRegular(dt, game);
  }

  wanderIdle(dt, game) {
    this.idleTimer -= dt;
    this.state = 'idle';
    if (this.idleTimer <= 0) {
      this.idleTimer = 2 + Math.random() * 4;
      const a = Math.random() * TAU;
      this.wander = { x: Math.cos(a) * 16, y: Math.sin(a) * 16 };
    }
    if (Math.abs(this.wander.x) + Math.abs(this.wander.y) > 0.1) {
      game.world.moveWithCollision(this, this.wander.x * dt, this.wander.y * dt, game, this.radius);
      this.state = 'walk';
      this.facing = Math.atan2(this.wander.y, this.wander.x);
    }
  }

  updateRegular(dt, game) {
    const p = game.player;
    const d = dist(this.x, this.y, p.x, p.y);
    if (this.windup > 0) {
      this.windup -= dt;
      this.state = 'windup';
      if (this.windup <= 0) this.strike(game);
      return;
    }
    if (this.dashTimer > 0) {
      this.updateDash(dt, game);
      return;
    }
    if (this.recovery > 0) {
      this.recovery -= dt;
      this.state = 'recovery';
      return;
    }
    const behavior = this.def.id === 'lobo' ? 'wolf' : this.def.id === 'escarabajo' ? 'beetle' : this.def.id === 'espectro' ? 'wraith' : this.def.id === 'fenix_salvaje' ? 'fenix' : 'slime';
    const speed = this.speed * (this.def.boss ? 1 : 1);

    if (behavior === 'wraith' || behavior === 'fenix') {
      const desired = behavior === 'wraith' ? 190 : 230;
      if (d < desired - 45) this.moveRelative(dt, game, -1, speed * 0.75);
      else if (d > desired + 55) this.moveRelative(dt, game, 1, speed);
      else this.strafe(dt, game, speed * 0.6);
      if (this.attackCd <= 0 && d < (this.def.attackRange || 260)) {
        this.beginWindup('ranged', this.def.windup || 0.8);
        this.attackCd = (this.def.recovery || 0.9) + 0.8;
      }
    } else {
      if (d > (this.def.attackRange || 48) * 0.82) this.moveRelative(dt, game, 1, speed);
      else this.strafe(dt, game, speed * 0.4);
      if (this.attackCd <= 0 && d < (this.def.attackRange || 48) * 1.3) {
        const kind = behavior === 'wolf' && d > 65 ? 'dash' : behavior === 'beetle' && d > 70 ? 'charge' : 'melee';
        this.beginWindup(kind, this.def.windup || 0.5);
        this.attackCd = (this.def.recovery || 0.8) + 0.35;
      }
    }
    // Separación entre enemigos.
    for (const other of game.enemies) {
      if (other === this || other.dead) continue;
      const dd = dist(this.x, this.y, other.x, other.y);
      if (dd < this.radius + other.radius && dd > 0.01) {
        const push = (this.radius + other.radius - dd) * 0.5;
        const nx = (this.x - other.x) / dd, ny = (this.y - other.y) / dd;
        game.world.moveWithCollision(this, nx * push, ny * push, game, this.radius);
      }
    }
  }

  updateEliteBoss(dt, game) {
    const p = game.player;
    const d = dist(this.x, this.y, p.x, p.y);
    if (this.windup > 0) {
      this.windup -= dt;
      this.state = 'windup';
      if (this.windup <= 0) this.strike(game);
      return;
    }
    if (this.dashTimer > 0) { this.updateDash(dt, game); return; }
    if (this.recovery > 0) { this.recovery -= dt; this.state = 'recovery'; return; }
    if (this.hp / this.maxHp < 0.5 && !this.enraged) {
      this.enraged = true;
      this.speed *= 1.18;
      game.effects.ring(this.x, this.y, 130, '#ffb18a', 6, 0.9, 20);
      game.toast(this.name, '¡Su poder aumenta!', 'danger', 3800);
      game.audio.sfx('boss');
    }
    if (this.specialCd <= 0) {
      const kinds = {
        alfa_ceniza: ['howl', 'dash', 'dash'],
        matriarca_petrea: ['rocks', 'charge', 'slam'],
        rey_espectro: ['teleport', 'orbs', 'orbs']
      }[this.bossId] || ['dash'];
      const kind = kinds[Math.floor(Math.random() * kinds.length)];
      this.beginWindup(kind, kind === 'howl' ? 0.8 : 0.65);
      this.specialCd = 5.2 + Math.random() * 2;
      return;
    }
    const behavior = this.draw === 'wolf' ? 'wolf' : this.draw === 'beetle' ? 'beetle' : 'wraith';
    if (behavior === 'wraith') {
      if (d < 150) this.moveRelative(dt, game, -1, this.speed * 0.6);
      else if (d > 200) this.moveRelative(dt, game, 1, this.speed * 0.9);
      else this.strafe(dt, game, this.speed * 0.5);
      if (this.attackCd <= 0) {
        this.beginWindup('ranged', 0.8);
        this.attackCd = 2.2;
      }
    } else {
      if (d > (this.def.attackRange || 60) * 0.8) this.moveRelative(dt, game, 1, this.speed);
      else this.strafe(dt, game, this.speed * 0.5);
      if (this.attackCd <= 0 && d < (this.def.attackRange || 60) * 1.4) {
        this.beginWindup(behavior === 'beetle' ? 'charge' : 'melee', 0.55);
        this.attackCd = 1.6;
      }
    }
  }

  updateGuardian(dt, game) {
    const p = game.player;
    const d = dist(this.x, this.y, p.x, p.y);
    const ratio = this.hp / this.maxHp;
    const newPhase = ratio > 0.66 ? 1 : ratio > 0.33 ? 2 : 3;
    if (newPhase !== this.phase) {
      this.phase = newPhase;
      this.transition = 1.0;
      this.stagger = 0.8;
      game.onBossPhase(this, newPhase);
      game.effects.ring(this.x, this.y, 230, '#d5b6ff', 8, 1.2, 30);
      game.effects.ring(this.x, this.y, 160, '#ffe0b0', 5, 0.9, 20);
      this.attackCd = 1.2;
      this.specialCd = 1.2;
      if (newPhase === 2 && !this.summoned) {
        this.summoned = true;
        for (let i = 0; i < 2; i++) game.spawnEnemy('espectro', this.x + (i ? 90 : -90), this.y + 40, { summoned: true });
      }
      return;
    }
    if (this.transition > 0) { this.state = 'stagger'; return; }
    if (this.windup > 0) {
      this.windup -= dt;
      this.state = 'windup';
      if (this.windup <= 0) this.strikeGuardian(game);
      return;
    }
    if (this.dashTimer > 0) { this.updateDash(dt, game); return; }
    if (this.recovery > 0) { this.recovery -= dt; this.state = 'recovery'; return; }

    if (this.specialCd <= 0) {
      const patterns1 = ['slam', 'orbs', 'dash'];
      const patterns2 = ['rain', 'dash', 'orbs', 'slam'];
      const patterns3 = ['rain', 'radial', 'dash', 'slam'];
      const pool = this.phase === 1 ? patterns1 : this.phase === 2 ? patterns2 : patterns3;
      const kind = pool[Math.floor(Math.random() * pool.length)];
      this.pending = kind;
      this.beginWindup('guardian_' + kind, kind === 'rain' || kind === 'radial' ? 1.15 : 0.78);
      this.specialCd = (this.phase === 3 ? 2.0 : 2.8) + Math.random() * 1.2;
      return;
    }
    if (d > 105) this.moveRelative(dt, game, 1, this.speed);
    else if (d < 58) this.moveRelative(dt, game, -1, this.speed * 0.55);
    else this.strafe(dt, game, this.speed * 0.42);
    if (this.attackCd <= 0 && d < 120) {
      this.pending = 'cleave';
      this.beginWindup('guardian_cleave', 0.62);
      this.attackCd = 1.55;
    }
  }

  moveRelative(dt, game, forward, speed) {
    const p = game.player;
    const base = Math.atan2(p.y - this.y, p.x - this.x);
    const a = forward >= 0 ? base : base + Math.PI;
    const strafe = this.strafeDir * 0.55;
    const ang = a + strafe * (forward > 0 ? 1 : 0.2);
    game.world.moveWithCollision(this, Math.cos(ang) * speed * dt, Math.sin(ang) * speed * dt, game, this.radius);
    this.state = 'walk';
  }

  strafe(dt, game, speed) {
    const p = game.player;
    const base = Math.atan2(p.y - this.y, p.x - this.x) + Math.PI / 2 * this.strafeDir;
    game.world.moveWithCollision(this, Math.cos(base) * speed * dt, Math.sin(base) * speed * dt, game, this.radius);
    this.state = 'walk';
  }

  beginWindup(kind, duration) {
    this.pending = kind;
    this.windupMax = duration;
    this.windup = duration;
    this.state = 'windup';
    this.dashHit = false;
  }

  strike(game) {
    const kind = this.pending;
    this.windup = 0;
    this.pending = null;
    this.state = 'attack';
    const p = game.player;
    const d = dist(this.x, this.y, p.x, p.y);
    if (kind === 'melee') {
      const range = (this.def.attackRange || 50) * 1.25 + 14;
      game.effects.slash(this.x, this.y - 12, this.facing, range * 0.8, this.def.accent || '#ffb08a', 1.6, 8, 0.2);
      game.audio.sfx('swing', { volume: 0.5 });
      if (d < range) p.takeDamage(this.atk * 1.15, this, this.def.element);
      this.recovery = 0.28;
    } else if (kind === 'dash' || kind === 'charge') {
      this.dashDir = norm(p.x - this.x, p.y - this.y);
      this.dashTimer = kind === 'charge' ? 0.42 : 0.27;
      this.dashHit = false;
      this.dashDamage = this.atk * (kind === 'charge' ? 1.55 : 1.2);
      game.audio.sfx('swing', { volume: 0.8 });
      game.effects.dust(this.x, this.y, '#c8bda9', 8);
    } else if (kind === 'ranged') {
      spawnEnemyBolt(game, this, 1);
      this.recovery = 0.35;
    } else if (kind === 'rocks') {
      for (let i = -1; i <= 1; i++) spawnEnemyBolt(game, this, 1, i * 0.23, this.atk * 0.75);
      this.recovery = 0.45;
    } else if (kind === 'orbs') {
      for (let i = -2; i <= 2; i++) spawnEnemyBolt(game, this, 1, i * 0.2, this.atk * 0.72);
      this.recovery = 0.4;
    } else if (kind === 'howl') {
      this.speed *= 1.22;
      game.effects.ring(this.x, this.y, 170, '#ffb06b', 5, 0.9, 18);
      game.audio.sfx('boss');
      this.recovery = 0.55;
    } else if (kind === 'teleport') {
      game.effects.burst(this.x, this.y - 20, '#b78cff', 26, { minSpeed: 40, maxSpeed: 180 });
      const a = Math.random() * TAU;
      let tx = p.x + Math.cos(a) * 130, ty = p.y + Math.sin(a) * 130;
      if (game.world.isBlocked(tx, ty, this.radius, game)) { tx = this.x; ty = this.y; }
      this.x = tx; this.y = ty;
      game.effects.burst(this.x, this.y - 20, '#b78cff', 26, { minSpeed: 40, maxSpeed: 180 });
      for (let i = -1; i <= 1; i++) spawnEnemyBolt(game, this, 1, i * 0.22, this.atk * 0.65);
      this.recovery = 0.5;
    } else if (kind === 'slam') {
      this.guardianSlam(game, 170);
      this.recovery = 0.65;
    } else if (kind === 'rain') {
      this.guardianRain(game);
      this.recovery = 0.7;
    } else if (kind === 'radial') {
      for (let i = 0; i < 10; i++) {
        const a = i / 10 * TAU;
        game.spawnProjectile({
          x: this.x, y: this.y - 30, vx: Math.cos(a) * 150, vy: Math.sin(a) * 150,
          radius: 13, damage: this.atk * 0.6, team: 'enemy', kind: 'orb', color: '#c4a6ff',
          element: 'shadow', life: 3.2, source: this
        });
      }
      game.audio.sfx('magic');
      this.recovery = 0.6;
    }
  }

  strikeGuardian(game) {
    const kind = this.pending;
    this.windup = 0;
    this.pending = null;
    this.state = 'attack';
    const p = game.player;
    if (kind === 'guardian_cleave') {
      const range = 150;
      game.effects.slash(this.x, this.y - 28, this.facing, 130, '#d9bbff', 2.1, 18, 0.28);
      game.audio.sfx('swing', { volume: 1 });
      if (dist(this.x, this.y, p.x, p.y) < range) p.takeDamage(this.atk * 1.3, this, 'shadow');
      game.camera.shake = Math.max(game.camera.shake, 8);
      this.recovery = 0.55;
    } else if (kind === 'guardian_slam') {
      this.guardianSlam(game, 210);
      this.recovery = 0.75;
    } else if (kind === 'guardian_dash') {
      this.dashDir = norm(p.x - this.x, p.y - this.y);
      this.dashTimer = 0.38;
      this.dashHit = false;
      this.dashDamage = this.atk * 1.4;
      game.effects.dust(this.x, this.y, '#b7a4d4', 14);
      game.audio.sfx('swing', { volume: 1 });
    } else if (kind === 'guardian_orbs') {
      for (let i = -3; i <= 3; i++) spawnEnemyBolt(game, this, 1, i * 0.16, this.atk * 0.75);
      this.recovery = 0.55;
    } else if (kind === 'guardian_rain') {
      this.guardianRain(game);
      this.recovery = 0.8;
    } else if (kind === 'guardian_radial') {
      for (let i = 0; i < 16; i++) {
        const a = i / 16 * TAU;
        game.spawnProjectile({
          x: this.x, y: this.y - 34, vx: Math.cos(a) * 170, vy: Math.sin(a) * 170,
          radius: 14, damage: this.atk * 0.55, team: 'enemy', kind: 'orb', color: '#d0b3ff',
          element: 'shadow', life: 3.6, source: this
        });
      }
      game.effects.ring(this.x, this.y, 250, '#d8baff', 7, 0.8, 30);
      game.audio.sfx('magic', { volume: 1 });
      this.recovery = 0.7;
    }
  }

  guardianSlam(game, radius) {
    game.effects.ring(this.x, this.y, radius, '#d8baff', 8, 0.7, 25);
    game.effects.ring(this.x, this.y, radius * 0.72, '#ffe0b0', 4, 0.55, 15);
    game.effects.dust(this.x, this.y, '#b7a4d4', 24);
    game.camera.shake = Math.max(game.camera.shake, 14);
    game.audio.sfx('hit', { volume: 1 });
    const p = game.player;
    if (dist(this.x, this.y, p.x, p.y) < radius) p.takeDamage(this.atk * 1.35, this, 'stone');
    for (let i = 0; i < 8; i++) {
      const a = i / 8 * TAU;
      game.spawnProjectile({
        x: this.x, y: this.y, vx: Math.cos(a) * 125, vy: Math.sin(a) * 125,
        radius: 10, damage: this.atk * 0.45, team: 'enemy', kind: 'orb', color: '#c9b2ff',
        element: 'shadow', life: 2.4, source: this
      });
    }
  }

  guardianRain(game) {
    const p = game.player;
    for (let i = 0; i < 7; i++) {
      const x = p.x + (Math.random() - 0.5) * 330;
      const y = p.y + (Math.random() - 0.5) * 240;
      game.addHazard({
        x, y, radius: 50, delay: 0.7 + i * 0.13, damage: this.atk * 1.05,
        color: '#c9a8ff', element: 'shadow', source: this
      });
    }
    game.audio.sfx('boss', { volume: 0.6 });
  }

  updateDash(dt, game) {
    this.dashTimer -= dt;
    const speed = this.bossId === 'guardian' ? 520 : this.def.id === 'lobo' ? 480 : 380;
    game.world.moveWithCollision(this, this.dashDir.x * speed * dt, this.dashDir.y * speed * dt, game, this.radius - 2);
    if (Math.random() < dt * 20) game.effects.dust(this.x, this.y, this.def.accent, 2);
    if (!this.dashHit && dist(this.x, this.y, game.player.x, game.player.y) < this.radius + game.player.radius + 6) {
      this.dashHit = true;
      game.player.takeDamage(this.dashDamage || this.atk, this, this.def.element);
      game.camera.shake = Math.max(game.camera.shake, 8);
    }
    this.state = 'attack';
    if (this.dashTimer <= 0) this.recovery = 0.4;
  }

  receiveDamage(amount, opts = {}) {
    if (this.dead || this.transition > 0) return 0;
    if (this.def.boss && this.phase === 3 && this.def.id === 'guardian' && this.hp <= 0) return 0;
    const defense = this.defense || 0;
    let dmg = amount * (1 - defense / (defense + 90));
    const weaknesses = {
      gelatina: { fire: 1.3, light: 1.15, leaf: 0.7 },
      lobo: { moon: 1.25, fire: 0.8 },
      escarabajo: { light: 1.3, stone: 0.7, fire: 0.85 },
      espectro: { light: 1.35, shadow: 0.7 },
      fenix_salvaje: { moon: 1.2, fire: 0.6 }
    };
    const mult = weaknesses[this.def.id]?.[opts.element] || 1;
    dmg *= mult;
    if (opts.crit) dmg *= 1.6;
    dmg = Math.max(1, Math.round(dmg));
    this.hp -= dmg;
    this.hitFlash = 0.12;
    this.aggro = true;
    if (opts.crit) this.stagger = Math.max(this.stagger, 0.25);
    if (opts.knockback) {
      const dir = opts.dir ?? Math.atan2(this.y - opts.source.y, this.x - opts.source.x);
      const power = opts.knockback * (this.boss ? 0.18 : 1);
      this.knockVX = Math.cos(dir) * power;
      this.knockVY = Math.sin(dir) * power;
      this.stagger = Math.max(this.stagger, opts.crit ? 0.28 : 0.1);
    }
    if (this.hp <= 0) this.die();
    return dmg;
  }

  die() {
    if (this.dead) return;
    this.dead = true;
    this.state = 'dead';
    this.hp = 0;
    this.deathTimer = this.boss ? 1.8 : 0.55;
    this.game.onEnemyDeath(this);
  }

  canCapture() {
    return !this.dead && !this.boss && !this.elite && this.def.captureCreature &&
      this.hp / this.maxHp <= 0.32;
  }

  serialize() { return null; }
}

// -------------------------------- Proyectiles --------------------------------
export class Projectile {
  constructor(game, opts) {
    this.game = game;
    Object.assign(this, {
      x: 0, y: 0, vx: 0, vy: 0, radius: 8, damage: 0, team: 'enemy', kind: 'orb',
      color: '#ffe5a0', element: 'physical', life: 2, pierce: 0, source: null,
      hitSet: new Set(), crit: false, knockback: 0, angle: 0, dead: false
    }, opts);
    this.maxLife = this.life;
  }

  update(dt) {
    this.life -= dt;
    if (this.life <= 0) { this.dead = true; return; }
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.angle = Math.atan2(this.vy, this.vx);
    if (this.kind === 'arrow' || this.kind === 'orb') {
      if (this.life % 0.06 < dt) {
        this.game.effects.add({
          x: this.x, y: this.y, vx: -this.vx * 0.05, vy: -this.vy * 0.05,
          life: 0.25, maxLife: 0.25, size: 2, color: this.color, glow: true
        });
      }
    }
    if (this.game.world.isBlocked(this.x, this.y, this.radius, this.game)) {
      this.impact(null);
      return;
    }
    if (this.team === 'player') {
      for (const e of this.game.enemies) {
        if (e.dead || this.hitSet.has(e)) continue;
        if (dist(this.x, this.y, e.x, e.y - 10) < this.radius + e.radius) {
          this.hitSet.add(e);
          this.game.damageEnemy(e, this.damage, {
            crit: this.crit, element: this.element, source: this.source,
            knockback: this.knockback || 100, dir: this.angle
          });
          this.game.effects.spark(this.x, this.y, this.color, 9);
          if (this.pierce <= 0) { this.dead = true; return; }
          this.pierce--;
        }
      }
    } else {
      const p = this.game.player;
      if (!p.dead && dist(this.x, this.y, p.x, p.y - 16) < this.radius + p.radius + 6) {
        p.takeDamage(this.damage, this.source || this, this.element);
        this.game.effects.spark(this.x, this.y, this.color, 10);
        this.dead = true;
      }
    }
  }

  impact() {
    this.dead = true;
    this.game.effects.burst(this.x, this.y, this.color, 8, { minSpeed: 20, maxSpeed: 120, maxLife: 0.4 });
  }
}

// -------------------------------- Criaturas --------------------------------
export class Companion {
  constructor(game, defId) {
    this.game = game;
    this.def = CREATURES[defId];
    this.x = game.player.x - 34;
    this.y = game.player.y + 10;
    this.radius = 12;
    this.duration = 26;
    this.maxDuration = 26;
    this.attackCd = 0.4;
    this.seed = Math.random() * 10;
    this.target = null;
    this.dead = false;
    this.abilityUsed = false;
  }

  update(dt) {
    if (this.dead) return;
    this.duration -= dt;
    if (this.duration <= 0) { this.dead = true; return; }
    const p = this.game.player;
    const nearest = this.game.findNearestEnemy(this.x, this.y, 360);
    this.target = nearest;
    if (!nearest) {
      const tx = p.x - 34 + Math.sin(this.game.elapsed * 1.3 + this.seed) * 10;
      const ty = p.y + 6 + Math.cos(this.game.elapsed * 1.5 + this.seed) * 8;
      const a = Math.atan2(ty - this.y, tx - this.x);
      const d = dist(this.x, this.y, tx, ty);
      if (d > 12) {
        this.x += Math.cos(a) * Math.min(180 * dt, d);
        this.y += Math.sin(a) * Math.min(180 * dt, d);
      }
    } else {
      const d = dist(this.x, this.y, nearest.x, nearest.y);
      const preferred = this.def.type === 'wraith' || this.def.type === 'fenix' ? 120 : 48;
      const a = Math.atan2(nearest.y - this.y, nearest.x - this.x);
      if (d > preferred) {
        this.x += Math.cos(a) * 150 * dt;
        this.y += Math.sin(a) * 150 * dt;
      }
      this.attackCd -= dt;
      if (this.attackCd <= 0) {
        this.attackCd = this.def.type === 'lobo' ? 0.85 : 1.15;
        this.attack(nearest);
      }
    }
  }

  attack(target) {
    const game = this.game;
    if (this.def.id === 'lumito') {
      game.spawnProjectile({
        x: this.x, y: this.y - 16, vx: (target.x - this.x) * 2.2, vy: (target.y - this.y - 10) * 2.2,
        radius: 8, damage: this.game.player.stats.magic * 0.65 + 6, team: 'player',
        kind: 'orb', color: '#c9ffd9', element: 'light', life: 1.2, source: game.player
      });
      game.audio.sfx('magic', { volume: 0.3 });
    } else if (this.def.id === 'lobo_ceniza') {
      game.effects.slash(this.x, this.y - 10, Math.atan2(target.y - this.y, target.x - this.x), 40, '#ff9a5f', 1.4, 5, 0.18);
      game.damageEnemy(target, game.player.stats.atk * 0.75 + 8, { element: 'fire', source: this, knockback: 80, dir: Math.atan2(target.y - this.y, target.x - this.x) });
    } else if (this.def.id === 'escarabajo_petreo') {
      game.damageEnemy(target, game.player.stats.atk * 0.6 + 6, { element: 'stone', source: this, knockback: 120, dir: Math.atan2(target.y - this.y, target.x - this.x) });
      game.effects.ring(this.x, this.y, 34, '#e1c47b', 3, 0.3);
    } else if (this.def.id === 'espectro_ruinas') {
      for (let i = -1; i <= 1; i++) {
        const a = Math.atan2(target.y - this.y, target.x - this.x) + i * 0.18;
        game.spawnProjectile({
          x: this.x, y: this.y - 20, vx: Math.cos(a) * 280, vy: Math.sin(a) * 280,
          radius: 7, damage: game.player.stats.magic * 0.55 + 5, team: 'player',
          kind: 'orb', color: '#c8b5ff', element: 'shadow', life: 1.3, source: game.player
        });
      }
    } else if (this.def.id === 'fenix_brasa') {
      for (const e of game.enemies) {
        if (!e.dead && dist(e.x, e.y, this.x, this.y) < 170) {
          game.damageEnemy(e, game.player.stats.magic * 0.6 + 10, { element: 'fire', source: game.player, knockback: 80, dir: Math.atan2(e.y - this.y, e.x - this.x) });
        }
      }
      game.effects.ring(this.x, this.y, 160, '#ffb35e', 5, 0.6);
      game.effects.ember(this.x, this.y, 20);
      game.audio.sfx('magic', { volume: 0.5 });
    }
  }

  useAbility() {
    const game = this.game;
    const p = game.player;
    if (this.def.id === 'lumito') {
      p.heal(p.stats.maxHp * 0.22);
      game.effects.heal(p.x, p.y - 20, 20);
    } else if (this.def.id === 'lobo_ceniza') {
      const target = game.findNearestEnemy(this.x, this.y, 420);
      if (target) game.damageEnemy(target, p.stats.atk * 1.8, { crit: true, element: 'fire', source: p, knockback: 220, dir: Math.atan2(target.y - this.y, target.x - this.x) });
    } else if (this.def.id === 'escarabajo_petreo') {
      p.buffShield = 8;
      game.toast('Muro de piedra', 'Recibirás menos daño durante 8 segundos.', 'success');
      game.effects.ring(p.x, p.y, 60, '#e1c47b', 4, 0.6);
    } else if (this.def.id === 'espectro_ruinas') {
      for (const e of game.enemies) {
        if (!e.dead && dist(e.x, e.y, p.x, p.y) < 340) {
          game.spawnProjectile({
            x: p.x, y: p.y - 30, vx: (e.x - p.x) * 1.8, vy: (e.y - p.y) * 1.8,
            radius: 9, damage: p.stats.magic * 0.8 + 8, team: 'player', kind: 'orb',
            color: '#c8b5ff', element: 'shadow', life: 1.5, source: p
          });
        }
      }
    } else if (this.def.id === 'fenix_brasa') {
      for (const e of game.enemies) {
        if (!e.dead && dist(e.x, e.y, p.x, p.y) < 240) {
          game.damageEnemy(e, p.stats.magic * 1.5 + 18, { crit: true, element: 'fire', source: p, knockback: 180, dir: Math.atan2(e.y - p.y, e.x - p.x) });
        }
      }
      game.effects.ring(p.x, p.y, 230, '#ffad52', 7, 0.9, 20);
      game.effects.ember(p.x, p.y, 40);
    }
    game.audio.sfx('magic', { volume: 0.8 });
  }
}

// -------------------------------- Botín --------------------------------
export class LootOrb {
  constructor(game, x, y, item, qty = 1) {
    this.game = game;
    this.x = x; this.y = y;
    this.vx = (Math.random() - 0.5) * 120;
    this.vy = -50 - Math.random() * 70;
    this.item = item;
    this.qty = qty;
    this.life = 24;
    this.collected = false;
    this.bob = Math.random() * TAU;
  }

  update(dt) {
    this.life -= dt;
    if (this.life <= 0) { this.collected = true; return; }
    const p = this.game.player;
    const d = dist(this.x, this.y, p.x, p.y - 12);
    if (d < 130) {
      const a = Math.atan2(p.y - 12 - this.y, p.x - this.x);
      const pull = d < 45 ? 620 : 300;
      this.vx += Math.cos(a) * pull * dt;
      this.vy += Math.sin(a) * pull * dt;
    } else {
      this.vy += 240 * dt;
      this.vx *= Math.pow(0.2, dt);
      if (this.y > p.y + 20) this.vy = Math.min(this.vy, 0);
    }
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    if (d < 20) this.collect();
  }

  collect() {
    if (this.collected) return;
    this.collected = true;
    if (this.item === 'lumens') {
      this.game.player.lumens += this.qty;
      this.game.audio.sfx('coin', { volume: 0.35 });
    } else if (this.item === 'xp') {
      this.game.player.gainXp(this.qty);
    } else {
      this.game.player.addItem(this.item, this.qty);
      this.game.audio.sfx('pickup', { volume: 0.45 });
      const item = getItem(this.item);
      this.game.toast(item?.name || this.item, this.qty > 1 ? `×${this.qty}` : '', 'loot', 2400);
    }
    this.game.effects.spark(this.x, this.y, '#ffe6a0', 6);
  }
}

export class Hazard {
  constructor(game, opts) {
    this.game = game;
    this.x = opts.x; this.y = opts.y;
    this.radius = opts.radius || 48;
    this.delay = opts.delay || 0.8;
    this.maxDelay = this.delay;
    this.damage = opts.damage || 10;
    this.color = opts.color || '#c9a8ff';
    this.element = opts.element || 'shadow';
    this.source = opts.source;
    this.triggered = false;
    this.remove = false;
  }

  update(dt) {
    if (this.triggered) { this.remove = true; return; }
    this.delay -= dt;
    if (this.delay <= 0) {
      this.triggered = true;
      const p = this.game.player;
      this.game.effects.ring(this.x, this.y, this.radius, this.color, 6, 0.6, 10);
      this.game.effects.burst(this.x, this.y, this.color, 20, { minSpeed: 40, maxSpeed: 200, maxLife: 0.7 });
      this.game.camera.shake = Math.max(this.game.camera.shake, 7);
      this.game.audio.sfx('hit', { volume: 0.7 });
      if (dist(p.x, p.y, this.x, this.y) < this.radius + p.radius) {
        p.takeDamage(this.damage, this.source || this, this.element);
      }
    }
  }
}

function spawnEnemyBolt(game, e, count = 1, offset = 0, damage = null) {
  const p = game.player;
  const base = Math.atan2(p.y - 16 - e.y, p.x - e.x) + offset;
  const speed = e.boss ? 260 : 220;
  game.spawnProjectile({
    x: e.x, y: e.y - 24, vx: Math.cos(base) * speed, vy: Math.sin(base) * speed,
    radius: e.def.element === 'stone' ? 11 : 9,
    damage: damage ?? e.atk * 0.8, team: 'enemy',
    kind: e.def.element === 'stone' ? 'orb' : e.def.element === 'fire' ? 'fire' : 'orb',
    color: e.def.accent, element: e.def.element, life: 2.6, source: e
  });
  game.audio.sfx(e.def.element === 'stone' ? 'swing' : 'magic', { volume: 0.4 });
}
