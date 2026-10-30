import { ITEMS, CREATURES, CREATURE_SKILLS, AFFINITIES, xpToNext } from './data.js';
import { drawHero, drawCreature, drawEnemy, drawShadow, hexA, clamp, lerp, easeOut, darken, lighten } from './sprites.js';

export class Player {
  constructor(game) {
    this.game = game;
    this.state = game.state;
    this.x = this.state.player.x ?? game.world.spawnPoint.x;
    this.y = this.state.player.y ?? game.world.spawnPoint.y;
    this.r = 16;
    this.facing = this.state.player.facing ?? Math.PI / 2;
    this.moving = false;
    this.walk = 0;
    this.attackTime = 0;
    this.attackDur = 0;
    this.attackIndex = 0;
    this.attackVisual = 0;
    this.attackHitDone = false;
    this.comboWindow = 0;
    this.cooldown = 0;
    this.dodgeTime = 0;
    this.dodgeCooldown = 0;
    this.dodgeVX = 0;
    this.dodgeVY = 0;
    this.invuln = 0;
    this.hurtFlash = 0;
    this.blocking = false;
    this.blockTime = 0;
    this.perfectBlock = false;
    this.staminaDelay = 0;
    this.mounted = false;
    this.shieldTimer = 0;
    this.shieldPower = 0;
    this.regenTimer = 0;
    this.regenRate = 0;
    this.slowTimer = 0;
    this.footTimer = 0;
    this.refreshStats();
    this.hp = clamp(this.state.player.hp ?? this.maxHp, 1, this.maxHp);
    this.mp = clamp(this.state.player.mp ?? this.maxMp, 0, this.maxMp);
    this.stamina = clamp(this.state.player.stamina ?? this.maxStamina, 0, this.maxStamina);
    this.state.player.hp = this.hp;
    this.state.player.mp = this.mp;
    this.state.player.stamina = this.stamina;
  }

  get itemWeapon() { return ITEMS[this.state.player.equipment.weapon] || ITEMS.espada_alba; }
  get itemOffhand() { return ITEMS[this.state.player.equipment.offhand] || null; }
  get itemArmor() { return ITEMS[this.state.player.equipment.armor] || null; }
  get itemAccessory() { return ITEMS[this.state.player.equipment.accessory] || null; }

  get activeCreature() {
    const list = this.state.player.creatures || [];
    return list[this.state.player.activeCreature] || null;
  }

  getAbilities() {
    const set = new Set();
    const c = this.activeCreature;
    if (c) {
      const sp = CREATURES[c.species];
      if (sp?.explore?.type) set.add(sp.explore.type);
      if (this.mounted && sp?.explore?.mount) set.add('mount');
      if (sp?.explore?.fly) set.add('fly');
    }
    return set;
  }

  refreshStats() {
    const p = this.state.player;
    const attrs = p.attrs;
    const weapon = ITEMS[p.equipment.weapon] || ITEMS.espada_alba;
    const off = ITEMS[p.equipment.offhand] || {};
    const armor = ITEMS[p.equipment.armor] || {};
    const acc = ITEMS[p.equipment.accessory] || {};
    const bonus = (key) => (weapon[key] || 0) + (off[key] || 0) + (armor[key] || 0) + (acc[key] || 0);
    this.maxHp = Math.round(58 + attrs.vida * 8.6 + p.level * 7 + bonus('hp'));
    this.maxMp = Math.round(20 + attrs.mana * 4.6 + attrs.int * 1.5 + p.level * 2 + bonus('mp'));
    this.maxStamina = Math.round(68 + attrs.res * 4.2 + p.level * 1.4 + bonus('res') * 2);
    this.defense = Math.round(attrs.def * 1.25 + bonus('def') + p.level * 0.4);
    this.attack = Math.round((weapon.dmg || 8) + attrs.str * 1.55 + (weapon.subtype === 'staff' ? attrs.int * 1.8 : 0) + bonus('str'));
    this.speedBase = 168 + attrs.spd * 4.1 + (armor.spd || 0) * 3;
    this.critChance = 0.035 + attrs.luck * 0.0055 + (acc.luck || 0) * 0.012;
    this.luck = attrs.luck + (acc.luck || 0);
    this.weapon = weapon;
    this.offhand = off;
    this.armor = armor;
    this.accessory = acc;
    this.attackSpeed = weapon.speed || 1;
    this.attackRange = weapon.reach || 70;
    this.attackArc = weapon.arc || 1.4;
    this.hp = Math.min(this.hp ?? this.maxHp, this.maxHp);
    this.mp = Math.min(this.mp ?? this.maxMp, this.maxMp);
    this.stamina = Math.min(this.stamina ?? this.maxStamina, this.maxStamina);
  }

  gainXp(amount) {
    const p = this.state.player;
    p.xp += Math.max(0, Math.round(amount));
    let leveled = false;
    while (p.xp >= p.xpNext) {
      p.xp -= p.xpNext;
      p.level += 1;
      p.xpNext = xpToNext(p.level);
      p.statPoints += 2;
      leveled = true;
    }
    if (leveled) {
      this.refreshStats();
      this.hp = this.maxHp;
      this.mp = this.maxMp;
      this.stamina = this.maxStamina;
      this.game.onLevelUp();
    }
    return leveled;
  }

  startAttack() {
    if (this.attackTime > 0 || this.cooldown > 0 || this.blocking || this.dodgeTime > 0) return false;
    const cost = this.weapon.subtype === 'greatsword' ? 13 : this.weapon.subtype === 'dagger' ? 5 : 8;
    if (this.stamina < cost) {
      this.game.notify('Sin resistencia', 'Te falta aliento para atacar.', 'error');
      return false;
    }
    this.stamina -= cost;
    this.staminaDelay = 0.8;
    if (this.comboWindow > 0 && this.attackIndex < (this.weapon.combo?.length || 1) - 1) this.attackIndex += 1;
    else this.attackIndex = 0;
    this.attackDur = (this.weapon.subtype === 'greatsword' ? 0.52 : this.weapon.subtype === 'dagger' ? 0.22 : 0.32) / Math.max(0.6, this.attackSpeed);
    this.attackTime = this.attackDur;
    this.attackVisual = 0;
    this.attackHitDone = false;
    this.cooldown = 0.05;
    this.game.audio.play(this.weapon.subtype === 'greatsword' ? 'heavy' : 'attack');
    return true;
  }

  dodge(mx, my) {
    if (this.dodgeCooldown > 0 || this.stamina < 20 || this.dodgeTime > 0) return false;
    let dx = mx, dy = my;
    if (!dx && !dy) { dx = Math.cos(this.facing); dy = Math.sin(this.facing); }
    const l = Math.hypot(dx, dy) || 1;
    this.dodgeVX = (dx / l) * 430;
    this.dodgeVY = (dy / l) * 430;
    this.dodgeTime = 0.25;
    this.dodgeCooldown = 0.65;
    this.invuln = Math.max(this.invuln, 0.38);
    this.stamina -= 20;
    this.staminaDelay = 0.9;
    this.facing = Math.atan2(dy, dx);
    this.game.audio.play('dodge');
    this.game.particles.burst(this.x, this.y - 8, 8, { color: '#bfe9ff', speed: 90, life: 0.35, size: 2.5, type: 'dust' });
    return true;
  }

  setBlock(on) {
    if (on && this.dodgeTime <= 0) {
      if (!this.blocking) this.blockTime = 0;
      this.blocking = true;
    } else {
      this.blocking = false;
    }
  }

  takeDamage(amount, opts = {}) {
    if (this.invuln > 0 || this.dodgeTime > 0) return false;
    let dmg = amount;
    if (this.shieldTimer > 0) {
      const absorbed = Math.min(dmg, this.shieldPower);
      this.shieldPower -= absorbed;
      dmg -= absorbed;
      if (this.shieldPower <= 0) this.shieldTimer = 0;
      this.game.particles.ring(this.x, this.y - 20, '#ffe49b', 70);
      if (dmg <= 0) { this.game.audio.play('block'); return false; }
    }
    if (this.blocking) {
      const block = this.itemOffhand.block || 0.22;
      if (this.blockTime < 0.28) {
        dmg *= 0.08;
        this.game.audio.play('block');
        this.game.particles.burst(this.x + Math.cos(this.facing) * 20, this.y - 20, 14, { color: '#ffe49b', speed: 170, life: 0.4, size: 2.5, type: 'spark' });
        if (opts.source) opts.source.stun = Math.max(opts.source.stun || 0, 1.0);
        this.blockTime = 0.3;
      } else {
        dmg *= 1 - block;
        this.game.audio.play('block');
      }
      this.stamina -= 12;
      if (this.stamina < 0) { this.stamina = 0; this.blocking = false; }
    }
    dmg = Math.max(1, Math.round(dmg * (1 - this.defense / (this.defense + 90))));
    this.hp -= dmg;
    this.invuln = 0.62;
    this.hurtFlash = 0.28;
    this.staminaDelay = 0.9;
    this.game.particles.burst(this.x, this.y - 27, 10, { color: '#ff6f8c', speed: 120, life: 0.45, size: 2.6, type: 'spark' });
    this.game.floatText(this.x, this.y - 58, `-${dmg}`, '#ff8a9d', { size: 18 });
    this.game.shake(8);
    this.game.audio.play('hit');
    if (this.hp <= 0) {
      this.hp = 0;
      this.game.onPlayerDeath();
    }
    this.state.player.hp = this.hp;
    return true;
  }

  heal(amount) {
    this.hp = clamp(this.hp + amount, 0, this.maxHp);
    this.state.player.hp = this.hp;
    this.game.floatText(this.x, this.y - 58, `+${Math.round(amount)}`, '#9dffad', { size: 16 });
    this.game.particles.burst(this.x, this.y - 24, 14, { color: '#a8ffb5', speed: 60, life: 0.8, size: 2.4, type: 'heal' });
    this.game.audio.play('heal');
  }

  restoreMp(amount) {
    this.mp = clamp(this.mp + amount, 0, this.maxMp);
    this.state.player.mp = this.mp;
    this.game.floatText(this.x, this.y - 46, `+${Math.round(amount)} MP`, '#85e4ff', { size: 14 });
    this.game.particles.burst(this.x, this.y - 24, 10, { color: '#85e4ff', speed: 55, life: 0.7, size: 2, type: 'heal' });
  }

  spendMp(cost) {
    if (this.mp < cost) return false;
    this.mp -= cost;
    this.state.player.mp = this.mp;
    return true;
  }

  toggleMount() {
    const c = this.activeCreature;
    const sp = c && CREATURES[c.species];
    if (!c || !sp?.explore?.mount) {
      this.game.notify('Sin montura', 'La criatura activa no puede llevarte sobre su lomo.', 'error');
      return false;
    }
    this.mounted = !this.mounted;
    this.refreshStats();
    this.game.notify(this.mounted ? 'Montura celestial' : 'A pie', this.mounted ? `Viajas sobre ${sp.name}. Velocidad aumentada.` : 'Has desmontado.', 'info');
    this.game.audio.play('ui_equip');
    return true;
  }

  update(dt, input) {
    this.cooldown = Math.max(0, this.cooldown - dt);
    this.attackTime = Math.max(0, this.attackTime - dt);
    this.attackVisual = this.attackTime > 0 ? 1 - this.attackTime / this.attackDur : 0;
    this.comboWindow = Math.max(0, this.comboWindow - dt);
    if (this.attackTime <= 0 && this.attackDur > 0) {
      this.attackDur = 0;
      this.comboWindow = 0.55;
    }
    this.dodgeTime = Math.max(0, this.dodgeTime - dt);
    this.dodgeCooldown = Math.max(0, this.dodgeCooldown - dt);
    this.invuln = Math.max(0, this.invuln - dt);
    this.hurtFlash = Math.max(0, this.hurtFlash - dt);
    this.blockTime = this.blocking ? this.blockTime + dt : 0;
    this.shieldTimer = Math.max(0, this.shieldTimer - dt);
    this.slowTimer = Math.max(0, this.slowTimer - dt);
    this.regenTimer = Math.max(0, this.regenTimer - dt);
    this.staminaDelay = Math.max(0, this.staminaDelay - dt);
    if (this.staminaDelay <= 0) this.stamina = Math.min(this.maxStamina, this.stamina + (this.blocking ? 10 : 22) * dt);
    if (this.regenTimer > 0 && this.regenRate > 0) {
      this.hp = Math.min(this.maxHp, this.hp + this.regenRate * dt);
      this.state.player.hp = this.hp;
    }
    if (this.attackTime > 0 && !this.attackHitDone && this.attackVisual >= 0.38) {
      this.attackHitDone = true;
      this.game.resolvePlayerAttack(this);
    }
    let mx = input.moveX, my = input.moveY;
    const len = Math.hypot(mx, my);
    if (len > 1) { mx /= len; my /= len; }
    this.moving = Math.hypot(mx, my) > 0.08 && this.dodgeTime <= 0;
    if (this.blocking) { mx *= 0.3; my *= 0.3; }
    if (this.moving) {
      this.facing = Math.atan2(my, mx);
      this.walk += dt;
      const spd = this.speedBase * (this.blocking ? 0.42 : 1) * (this.slowTimer > 0 ? 0.55 : 1);
      const res = this.game.world.moveEntity(this, mx * spd * dt, my * spd * dt, this.game.collisionCtx());
      if (res.x || res.y) {
        this.footTimer -= dt;
        if (this.footTimer <= 0) { this.footTimer = 0.65; this.game.audio.play('footstep'); }
      }
      this.state.player.x = this.x;
      this.state.player.y = this.y;
    } else {
      this.walk += dt * 0.3;
    }
    if (this.dodgeTime > 0) {
      this.game.world.moveEntity(this, this.dodgeVX * dt, this.dodgeVY * dt, this.game.collisionCtx());
      this.state.player.x = this.x;
      this.state.player.y = this.y;
      if (Math.random() < 0.7) this.game.particles.spawn({ x: this.x, y: this.y - 16, vx: (Math.random() - 0.5) * 40, vy: -20, life: 0.3, maxLife: 0.3, size: 9, color: '#a9e8ff', type: 'afterimage' });
    }
    this.state.player.facing = this.facing;
  }

  draw(ctx, t) {
    if (this.mounted && this.activeCreature) {
      const sp = CREATURES[this.activeCreature.species];
      ctx.save();
      ctx.translate(this.x, this.y + 5);
      drawCreature(ctx, this.activeCreature.species, { t, scale: 1.3, facing: Math.cos(this.facing) < 0 ? -1 : 1, mounted: true });
      ctx.restore();
    }
    const shadowR = this.mounted ? 34 : 22;
    drawShadow(ctx, this.x, this.y, shadowR, shadowR * 0.35, 0.34);
    ctx.save();
    ctx.translate(this.x, this.y);
    const alpha = this.invuln > 0 ? 0.55 + Math.sin(t * 35) * 0.25 : 1;
    drawHero(ctx, this.state.player.appearance, {
      t,
      moving: this.moving,
      walk: this.walk,
      facing: this.facing,
      attack: this.attackVisual,
      weaponType: this.weapon.subtype,
      weaponColor: this.weapon.color,
      armor: this.armor?.color || this.state.player.appearance.outfit,
      shield: !!this.offhand.block,
      accessory: this.accessory?.color,
      scale: 1.08,
      alpha,
      mounted: this.mounted,
    });
    if (this.shieldTimer > 0) {
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.strokeStyle = hexA('#ffe49b', 0.6 + Math.sin(t * 5) * 0.15);
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.ellipse(0, -28, 34, 44, 0, 0, Math.PI * 2); ctx.stroke();
      const g = ctx.createRadialGradient(0, -28, 5, 0, -28, 48);
      g.addColorStop(0, 'rgba(255,228,155,.12)');
      g.addColorStop(1, 'rgba(255,228,155,0)');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.ellipse(0, -28, 42, 52, 0, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }
    if (this.regenTimer > 0) {
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      for (let i = 0; i < 3; i++) {
        const a = t * 2 + i * 2.1;
        ctx.fillStyle = 'rgba(156,233,138,.5)';
        ctx.beginPath(); ctx.arc(Math.cos(a) * 18, -20 + Math.sin(a) * 10, 2, 0, Math.PI * 2); ctx.fill();
      }
      ctx.restore();
    }
    if (this.hurtFlash > 0) {
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.fillStyle = `rgba(255,110,130,${this.hurtFlash * 0.2})`;
      ctx.beginPath(); ctx.ellipse(0, -30, 24, 36, 0, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }
    ctx.restore();
  }
}

export class Companion {
  constructor(game, instance) {
    this.game = game;
    this.instance = instance;
    this.x = game.player?.x - 40 || 300;
    this.y = game.player?.y + 20 || 300;
    this.targetX = this.x;
    this.targetY = this.y;
    this.facing = 1;
    this.t = 0;
    this.attackCd = 1.6;
    this.bob = 0;
  }

  get species() { return CREATURES[this.instance.species]; }
  get level() { return this.instance.level || 1; }
  get power() {
    const sp = this.species;
    if (!sp) return 1;
    const charm = this.instance.charm ? ITEMS[this.instance.charm] : null;
    return 1 + this.level * 0.16 + (charm?.atk || 0) * 0.04 + (this.instance.bond || 0) * 0.002;
  }

  update(dt, game) {
    this.t += dt;
    this.attackCd = Math.max(0, this.attackCd - dt);
    const p = game.player;
    if (!p) return;
    const angle = p.facing + Math.PI * 0.8;
    const dist = p.mounted ? 62 : 48;
    this.targetX = p.x + Math.cos(angle + this.t * 0.25) * dist;
    this.targetY = p.y + Math.sin(angle + this.t * 0.25) * dist - 6;
    this.x = lerp(this.x, this.targetX, Math.min(1, dt * 5.5));
    this.y = lerp(this.y, this.targetY, Math.min(1, dt * 5.5));
    this.facing = Math.cos(p.facing) < 0 ? -1 : 1;
    if (this.attackCd <= 0 && !game.dialogOpen && !game.ui.modalOpen) {
      const target = game.nearestEnemy(this.x, this.y, 430);
      if (target && !target.dead) {
        this.attackCd = Math.max(1.15, 3.1 - this.level * 0.07 - (this.instance.bond || 0) * 0.004);
        const sp = this.species;
        const skill = CREATURE_SKILLS[sp.skill] || { color: sp.colors[1], power: 1.2, kind: 'bolt' };
        const ang = Math.atan2(target.y - this.y, target.x - this.x);
        game.spawnProjectile({
          x: this.x, y: this.y - 30, vx: Math.cos(ang) * 430, vy: Math.sin(ang) * 430,
          r: 10, owner: 'creature', element: sp.affinity, color: skill.color, kind: skill.kind,
          damage: (12 + this.level * 4 + (this.instance.bond || 0) * 0.15) * skill.power,
          life: 1.6, homing: target, trail: true,
        });
        game.audio.play('magic');
        game.particles.burst(this.x, this.y - 30, 6, { color: skill.color, speed: 70, life: 0.4, size: 2, type: 'spark' });
      }
    }
  }

  draw(ctx, t) {
    const sp = this.species;
    if (!sp) return;
    ctx.save();
    drawShadow(ctx, this.x, this.y, 17, 6, 0.25);
    ctx.translate(this.x, this.y);
    const color = AFFINITIES[sp.affinity]?.color || '#ffe49b';
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const g = ctx.createRadialGradient(0, -24, 2, 0, -24, 36);
    g.addColorStop(0, hexA(color, 0.18));
    g.addColorStop(1, hexA(color, 0));
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(0, -24, 36, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    drawCreature(ctx, this.instance.species, { t, scale: 0.78, facing: this.facing });
    ctx.restore();
  }
}

export class WildCreature {
  constructor(game, speciesId, x, y, level = 1) {
    this.game = game;
    this.speciesId = speciesId;
    this.species = CREATURES[speciesId];
    this.x = x;
    this.y = y;
    this.homeX = x;
    this.homeY = y;
    this.level = level;
    this.maxHp = Math.round(this.species.base.hp * (1 + (level - 1) * 0.2));
    this.hp = this.maxHp;
    this.r = 16;
    this.facing = 1;
    this.t = Math.random() * 10;
    this.hurt = 0;
    this.state = 'wander';
    this.wanderA = Math.random() * Math.PI * 2;
    this.wanderTimer = 1 + Math.random() * 3;
    this.captured = false;
    this.justSeen = false;
  }

  update(dt) {
    this.t += dt;
    this.hurt = Math.max(0, this.hurt - dt);
    const p = this.game.player;
    const d = p ? Math.hypot(p.x - this.x, p.y - this.y) : 999;
    this.wanderTimer -= dt;
    if (this.wanderTimer <= 0) {
      this.wanderTimer = 2 + Math.random() * 3;
      this.wanderA = Math.random() * Math.PI * 2;
    }
    if (d < 180) {
      // Mirar al jugador con curiosidad
      this.facing = p.x < this.x ? -1 : 1;
      if (d < 90) {
        // pequeño salto/menear
        if (Math.random() < 0.01) this.game.particles.burst(this.x, this.y - 20, 3, { color: AFFINITIES[this.species.affinity].color, speed: 25, life: 0.5, size: 1.5, type: 'star' });
      }
      return;
    }
    if (this.hp < this.maxHp * 0.4) return;
    const spd = 20 + this.species.base.spd * 1.8;
    const nx = this.x + Math.cos(this.wanderA) * spd * dt;
    const ny = this.y + Math.sin(this.wanderA) * spd * dt;
    if (Math.hypot(nx - this.homeX, ny - this.homeY) > 110 || this.game.world.hitObstacle(nx, ny, this.r, this.game.collisionCtx())) {
      this.wanderA += Math.PI * 0.7;
    } else {
      this.x = nx;
      this.y = ny;
      this.facing = Math.cos(this.wanderA) < 0 ? -1 : 1;
    }
  }

  takeDamage(amount, opts = {}) {
    if (this.captured) return;
    const dmg = Math.max(1, Math.round(amount));
    this.hp = Math.max(1, this.hp - dmg);
    this.hurt = 0.35;
    this.fleeTimer = 2.5;
    this.game.floatText(this.x, this.y - 42, `${dmg}`, '#d7f5ff', { size: 14 });
    this.game.particles.burst(this.x, this.y - 20, 7, { color: AFFINITIES[this.species.affinity].color, speed: 90, life: 0.4, size: 2, type: 'star' });
    this.game.audio.play('hit');
    if (this.hp <= 0) this.hp = 1;
  }

  draw(ctx, t) {
    drawShadow(ctx, this.x, this.y, 18, 6, 0.25);
    ctx.save();
    ctx.translate(this.x, this.y);
    drawCreature(ctx, this.speciesId, { t: t + this.t, scale: 0.9, wild: true, hurt: this.hurt, facing: this.facing });
    ctx.restore();
    // etiqueta
    const color = AFFINITIES[this.species.affinity].color;
    ctx.save();
    ctx.textAlign = 'center';
    ctx.font = '600 10px "Trebuchet MS", sans-serif';
    ctx.fillStyle = 'rgba(7,12,24,.7)';
    const text = this.species.name;
    const w = ctx.measureText(text).width + 26;
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(this.x - w / 2, this.y - 74, w, 16, 8); else ctx.rect(this.x - w / 2, this.y - 74, w, 16);
    ctx.fill();
    ctx.fillStyle = color;
    ctx.fillText(`${text}  Lv.${this.level}`, this.x, this.y - 62);
    ctx.restore();
    if (this.hp < this.maxHp) {
      const ratio = this.hp / this.maxHp;
      ctx.fillStyle = 'rgba(4,7,16,.7)';
      ctx.fillRect(this.x - 21, this.y - 54, 42, 4);
      ctx.fillStyle = ratio < 0.4 ? '#ffe27a' : '#b7f5d2';
      ctx.fillRect(this.x - 20, this.y - 53, 40 * ratio, 2);
    }
    if (this.hp < this.maxHp * 0.4) {
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.strokeStyle = `rgba(255,240,170,${0.35 + Math.sin(t * 5) * 0.2})`;
      ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.ellipse(this.x, this.y - 22, 25, 30, 0, 0, Math.PI * 2); ctx.stroke();
      ctx.restore();
    }
  }
}

export class Projectile {
  constructor(game, o) {
    Object.assign(this, o);
    this.game = game;
    this.life = o.life ?? 2;
    this.maxLife = this.life;
    this.t = 0;
    this.trailTimer = 0;
    this.dead = false;
    this.x = o.x; this.y = o.y;
    this.vx = o.vx; this.vy = o.vy;
    this.r = o.r || 8;
    this.hitSet = new Set();
    this.color = o.color || '#ffe49b';
    this.kind = o.kind || 'bolt';
    this.owner = o.owner || 'player';
    this.damage = o.damage || 10;
    this.pierce = !!o.pierce;
    this.homing = o.homing || null;
  }

  update(dt) {
    this.t += dt;
    this.life -= dt;
    if (this.life <= 0) { this.dead = true; return; }
    if (this.homing && !this.homing.dead) {
      const ang = Math.atan2(this.homing.y - this.y, this.homing.x - this.x);
      const sp = Math.hypot(this.vx, this.vy);
      const cur = Math.atan2(this.vy, this.vx);
      let diff = ang - cur;
      while (diff > Math.PI) diff -= Math.PI * 2;
      while (diff < -Math.PI) diff += Math.PI * 2;
      const na = cur + clamp(diff, -2.2 * dt, 2.2 * dt);
      this.vx = Math.cos(na) * sp;
      this.vy = Math.sin(na) * sp;
    }
    const nx = this.x + this.vx * dt;
    const ny = this.y + this.vy * dt;
    if (this.owner === 'enemy' && this.kind !== 'beam') {
      const hit = this.game.world.hitObstacle(nx, ny, this.r, this.game.collisionCtx());
      if (hit && hit.kind !== 'water' && hit.kind !== 'void') {
        this.explode();
        return;
      }
    }
    this.x = nx; this.y = ny;
    this.trailTimer -= dt;
    if (this.trailTimer <= 0) {
      this.trailTimer = 0.035;
      this.game.particles.spawn({
        x: this.x + (Math.random() - 0.5) * 5, y: this.y + (Math.random() - 0.5) * 5,
        vx: -this.vx * 0.04, vy: -this.vy * 0.04, life: 0.35, maxLife: 0.35,
        size: this.r * (0.5 + Math.random() * 0.4), color: this.color, type: this.kind === 'arrow' ? 'dust' : 'spark', additive: true,
      });
    }
  }

  explode() {
    this.dead = true;
    this.game.particles.burst(this.x, this.y, 12, { color: this.color, speed: 170, life: 0.45, size: 2.6, type: 'spark' });
    if (this.splash) this.game.areaDamage(this.x, this.y, this.splash, this.damage * 0.6, this.owner === 'enemy' ? 'enemy' : 'player');
  }

  draw(ctx, t) {
    const c = this.color;
    ctx.save();
    ctx.translate(this.x, this.y);
    const ang = Math.atan2(this.vy, this.vx);
    ctx.rotate(ang);
    ctx.globalCompositeOperation = 'lighter';
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, this.r * 3.4);
    g.addColorStop(0, hexA(c, 0.85));
    g.addColorStop(0.4, hexA(c, 0.3));
    g.addColorStop(1, hexA(c, 0));
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(0, 0, this.r * 3.4, 0, Math.PI * 2); ctx.fill();
    ctx.globalCompositeOperation = 'source-over';
    if (this.kind === 'arrow') {
      ctx.strokeStyle = '#f2e6c8'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(-14, 0); ctx.lineTo(8, 0); ctx.stroke();
      ctx.fillStyle = c;
      ctx.beginPath(); ctx.moveTo(12, 0); ctx.lineTo(4, -4); ctx.lineTo(4, 4); ctx.closePath(); ctx.fill();
    } else if (this.kind === 'rock') {
      ctx.fillStyle = c;
      ctx.beginPath(); ctx.arc(0, 0, this.r, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = 'rgba(70,50,35,.6)'; ctx.stroke();
    } else if (this.kind === 'fire') {
      ctx.fillStyle = '#fff3c0';
      ctx.beginPath(); ctx.ellipse(0, 0, this.r * 0.8, this.r * 0.55, t * 4, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = hexA(c, 0.9);
      ctx.beginPath(); ctx.ellipse(-4, 0, this.r * 1.2, this.r * 0.7, -t * 4, 0, Math.PI * 2); ctx.fill();
    } else if (this.kind === 'ice') {
      ctx.fillStyle = '#f4ffff';
      ctx.beginPath(); ctx.moveTo(this.r, 0); ctx.lineTo(0, -this.r); ctx.lineTo(-this.r, 0); ctx.lineTo(0, this.r); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = c; ctx.stroke();
    } else if (this.kind === 'dark') {
      ctx.fillStyle = '#1b0f2e';
      ctx.beginPath(); ctx.ellipse(0, 0, this.r * 1.4, this.r * 0.65, 0, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = c; ctx.lineWidth = 1.5; ctx.stroke();
    } else if (this.kind === 'star') {
      drawStar(ctx, 0, 0, this.r * 1.4, this.r * 0.55, 5, t * 3);
      ctx.fillStyle = '#fffbe7'; ctx.fill();
    } else {
      ctx.fillStyle = '#ffffff';
      ctx.beginPath(); ctx.arc(0, 0, this.r * 0.52, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = c; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(0, 0, this.r * 0.82, 0, Math.PI * 2); ctx.stroke();
    }
    ctx.restore();
  }
}

function drawStar(ctx, x, y, outer, inner, points, rot) {
  ctx.beginPath();
  for (let i = 0; i < points * 2; i++) {
    const a = rot + i * Math.PI / points;
    const r = i % 2 ? inner : outer;
    if (i === 0) ctx.moveTo(x + Math.cos(a) * r, y + Math.sin(a) * r);
    else ctx.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r);
  }
  ctx.closePath();
}

export class ParticleSystem {
  constructor(quality = 'alta') {
    this.particles = [];
    this.texts = [];
    this.max = quality === 'alta' ? 650 : 340;
  }

  setQuality(q) { this.max = q === 'alta' ? 650 : 340; }

  spawn(o) {
    if (this.particles.length >= this.max) return null;
    const p = {
      x: o.x, y: o.y, vx: o.vx || 0, vy: o.vy || 0, ax: o.ax || 0, ay: o.ay || 0,
      life: o.life ?? 0.6, maxLife: o.life ?? 0.6, size: o.size ?? 2, color: o.color || '#fff',
      type: o.type || 'spark', additive: o.additive ?? ['spark', 'ember', 'star', 'slash', 'ring', 'heal', 'shard'].includes(o.type),
      rot: o.rot || 0, vr: o.vr || 0, drag: o.drag ?? 0.92, gravity: o.gravity ?? 0, length: o.length || 20,
      data: o.data || null,
    };
    this.particles.push(p);
    return p;
  }

  burst(x, y, count = 10, o = {}) {
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const sp = (o.speed || 100) * (0.35 + Math.random() * 0.8);
      this.spawn({
        x: x + (Math.random() - 0.5) * 5, y: y + (Math.random() - 0.5) * 5,
        vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - (o.up || 0),
        life: (o.life || 0.5) * (0.6 + Math.random() * 0.7),
        size: (o.size || 2) * (0.6 + Math.random() * 0.8),
        color: o.color, type: o.type || 'spark', gravity: o.gravity ?? 40, drag: o.drag ?? 0.92,
      });
    }
  }

  ring(x, y, color, radius, o = {}) {
    this.spawn({ x, y, life: o.life || 0.5, size: radius, color, type: 'ring', additive: true, data: { start: o.start || 6, width: o.width || 3 } });
  }

  slash(x, y, angle, reach, color, o = {}) {
    this.spawn({ x, y, life: o.life || 0.22, size: reach, color, type: 'slash', additive: true, rot: angle, data: { arc: o.arc || 1.4, width: o.width || 10 } });
  }

  floatText(x, y, text, color, o = {}) {
    this.texts.push({ x, y, text, color, life: o.life || 0.9, maxLife: o.life || 0.9, size: o.size || 15, vy: o.vy || -36, crit: o.crit });
    if (this.texts.length > 40) this.texts.shift();
  }

  update(dt) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= dt;
      if (p.life <= 0) { this.particles.splice(i, 1); continue; }
      p.vx *= Math.pow(p.drag, dt * 60);
      p.vy = p.vy * Math.pow(p.drag, dt * 60) + p.gravity * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.rot += p.vr * dt;
    }
    for (let i = this.texts.length - 1; i >= 0; i--) {
      const t = this.texts[i];
      t.life -= dt;
      t.y += t.vy * dt;
      t.vy *= 0.96;
      if (t.life <= 0) this.texts.splice(i, 1);
    }
  }

  draw(ctx, t) {
    ctx.save();
    for (const p of this.particles) {
      const a = clamp(p.life / p.maxLife, 0, 1);
      ctx.globalAlpha = a;
      ctx.globalCompositeOperation = p.additive ? 'lighter' : 'source-over';
      if (p.type === 'ring') {
        const prog = 1 - a;
        const rad = (p.data?.start || 6) + (p.size - (p.data?.start || 6)) * easeOut(prog);
        ctx.strokeStyle = p.color;
        ctx.lineWidth = (p.data?.width || 3) * (1 - prog * 0.7);
        ctx.beginPath(); ctx.ellipse(p.x, p.y, rad, rad * 0.45, 0, 0, Math.PI * 2); ctx.stroke();
      } else if (p.type === 'slash') {
        const prog = 1 - a;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.strokeStyle = p.color;
        ctx.lineWidth = (p.data?.width || 10) * (1 - prog * 0.5);
        ctx.shadowColor = p.color; ctx.shadowBlur = 14;
        ctx.beginPath();
        ctx.arc(0, 0, p.size * (0.75 + prog * 0.25), -p.data.arc / 2, p.data.arc / 2);
        ctx.stroke();
        ctx.restore();
      } else if (p.type === 'star') {
        ctx.fillStyle = p.color;
        drawStar(ctx, p.x, p.y, p.size * (0.8 + Math.sin(t * 8 + p.rot) * 0.2), p.size * 0.4, 4, p.rot);
        ctx.fill();
      } else if (p.type === 'leaf') {
        ctx.fillStyle = p.color;
        ctx.beginPath(); ctx.ellipse(p.x, p.y, p.size, p.size * 0.45, p.rot, 0, Math.PI * 2); ctx.fill();
      } else if (p.type === 'afterimage') {
        ctx.fillStyle = hexA(p.color, 0.12);
        ctx.beginPath(); ctx.ellipse(p.x, p.y, p.size, p.size * 1.5, 0, 0, Math.PI * 2); ctx.fill();
      } else if (p.type === 'shard') {
        ctx.fillStyle = p.color;
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot);
        ctx.beginPath(); ctx.moveTo(0, -p.size); ctx.lineTo(p.size * 0.6, p.size); ctx.lineTo(-p.size * 0.6, p.size); ctx.closePath(); ctx.fill();
        ctx.restore();
      } else if (p.type === 'heal') {
        ctx.fillStyle = p.color;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill();
      } else if (p.type === 'dust') {
        ctx.fillStyle = p.color;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size * (0.7 + a * 0.6), 0, Math.PI * 2); ctx.fill();
      } else {
        ctx.fillStyle = p.color;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
    for (const t2 of this.texts) {
      const a = clamp(t2.life / t2.maxLife, 0, 1);
      ctx.globalAlpha = Math.min(1, a * 2);
      ctx.font = `${t2.crit ? '800' : '700'} ${t2.size}px "Trebuchet MS", sans-serif`;
      ctx.textAlign = 'center';
      ctx.lineWidth = 3;
      ctx.strokeStyle = 'rgba(5,8,18,.75)';
      ctx.strokeText(t2.text, t2.x, t2.y);
      ctx.fillStyle = t2.color;
      ctx.fillText(t2.text, t2.x, t2.y);
    }
    ctx.globalAlpha = 1;
    ctx.restore();
  }
}

export { drawEnemy, drawCreature, drawHero, drawShadow, hexA, clamp, lerp, easeOut, darken, lighten };
