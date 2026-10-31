import { clamp, angleTo, dist, norm, lerp, rand, chance, easeOut } from '../core/utils.js';
import { ITEMS, itemStats, STARTING_KITS } from '../data/items.js';
import { CREATURES } from '../data/creatures.js';
import { canStand } from '../world/regions.js';

export const BASE_ATTRIBUTES = { hp: 5, mp: 5, stam: 5, str: 5, def: 5, spd: 5, int: 5, luck: 5 };

const FACE_VEC = { down: { x: 0, y: 1 }, up: { x: 0, y: -1 }, left: { x: -1, y: 0 }, right: { x: 1, y: 0 } };
const FACE_ANGLE = { down: Math.PI / 2, up: -Math.PI / 2, left: Math.PI, right: 0 };

export class Player {
  constructor(profile = {}) {
    this.name = profile.name || 'Aurel';
    this.look = { ...(profile.look || {}) };
    this.attributes = { ...BASE_ATTRIBUTES, ...(profile.attributes || {}) };
    this.level = 1;
    this.xp = 0;
    this.gold = 60;
    this.statPoints = 0;
    this.x = 0; this.y = 0;
    this.radius = 14;
    this.facing = 'up';
    this.aimAngle = -Math.PI / 2;
    this.moving = false;
    this.walkPhase = 0;
    this.vx = 0; this.vy = 0;
    this.speedScale = 1;
    this.hp = this.maxHp; this.mp = this.maxMp; this.stamina = this.maxStam;
    this.attackState = null;
    this.attackCooldown = 0;
    this.combo = 0;
    this.comboWindow = 0;
    this.dodgeTimer = 0;
    this.dodgeCooldown = 0;
    this.dodgeDir = { x: 0, y: 1 };
    this.invuln = 0;
    this.blocking = false;
    this.blockTime = 0;
    this.blockStamina = 0;
    this.hurtFlash = 0;
    this.stun = 0;
    this.slowTimer = 0;
    this.staminaDelay = 0;
    this.mpDelay = 0;
    this.cooldowns = { ability1: 0, ability2: 0, ability3: 0, companion: 0, potion: 0 };
    this.buffs = [];
    this.equipment = {};
    this.inventory = {};
    this.creatures = {};
    this.activeCreature = null;
    this.companion = null;
    this.tameCharm = 0;
    this.reviveUsed = false;
    this.reviveAvailable = false;
    this.steps = 0;
    this.footTimer = 0;
    this.kills = 0;
    this.tamed = 0;
    this.questsDone = 0;
    this.deaths = 0;
    this.playTime = 0;
    this.weaponType = 'sword';
    this.attackSpeedMult = 1;
    this.hitStop = 0;
    this.stats = this.calcStats();
    this.hp = this.maxHp; this.mp = this.maxMp; this.stamina = this.maxStam;
    this.applyKit(profile.kit || 'errante');
    if (profile.armorPick && ITEMS[profile.armorPick]) {
      const current = this.equipment.armor;
      if (current && current !== profile.armorPick) this.removeItem(current, 1);
      this.equipment.armor = profile.armorPick;
      this.addItem(profile.armorPick, 1, true);
    }
    this.stats = this.calcStats();
    this.hp = this.maxHp; this.mp = this.maxMp; this.stamina = this.maxStam;
    this.refreshLook();
  }
  applyKit(kitId) {
    const kit = STARTING_KITS.find(k => k.id === kitId) || STARTING_KITS[0];
    for (const slot of ['weapon', 'armor', 'helm', 'accessory', 'cloak']) {
      if (kit[slot]) { this.equipment[slot] = kit[slot]; this.addItem(kit[slot], 1, true); }
      else this.equipment[slot] = null;
    }
    this.inventory = this.inventory || {};
    this.addItem('pocion_menor', 3);
    this.addItem('pan_viaje', 1);
    this.addItem('eter', 1);
  }
  get weaponItem() { return ITEMS[this.equipment.weapon] || null; }
  get armorItem() { return ITEMS[this.equipment.armor] || null; }
  get helmItem() { return ITEMS[this.equipment.helm] || null; }
  get accessoryItem() { return ITEMS[this.equipment.accessory] || null; }
  get cloakItem() { return ITEMS[this.equipment.cloak] || null; }
  get activeCreatureData() { return this.activeCreature ? CREATURES[this.activeCreature] : null; }

  equipmentStats() {
    const s = { atk: 0, def: 0, hp: 0, mp: 0, stam: 0, spd: 0, int: 0, luck: 0, crit: 0 };
    for (const slot of Object.keys(this.equipment)) {
      const it = ITEMS[this.equipment[slot]];
      if (!it) continue;
      const st = itemStats(it);
      for (const k in st) s[k] += st[k] || 0;
    }
    return s;
  }
  creatureBonuses() {
    const c = this.activeCreatureData;
    const b = { speed: 0, crit: 0, def: 0, atk: 0, aspd: 0, regen: 0, mana: 0, mregen: 0, revive: 0, burn: 0 };
    if (!c) return b;
    const bond = this.creatures[this.activeCreature]?.bond || 1;
    const lvlScale = 1 + (this.creatures[this.activeCreature]?.level || 1) * .04;
    switch (c.passiveId) {
      case 'speed': b.speed = c.passiveVal * lvlScale; break;
      case 'crit': b.crit = c.passiveVal * lvlScale; break;
      case 'def': b.def = c.passiveVal * lvlScale; break;
      case 'atk': b.atk = c.passiveVal * lvlScale; break;
      case 'aspd': b.aspd = c.passiveVal * lvlScale; break;
      case 'regen': b.regen = c.passiveVal * lvlScale; break;
      case 'mana': b.mana = c.passiveVal * lvlScale; break;
      case 'mregen': b.mregen = c.passiveVal * lvlScale; break;
      case 'revive': b.revive = c.passiveVal; break;
      case 'burn': b.burn = c.passiveVal; break;
    }
    return b;
  }
  calcStats() {
    const g = this.equipmentStats();
    const cb = this.creatureBonuses();
    const a = this.attributes;
    const lvlHp = (this.level - 1) * 7;
    const hpStat = a.hp + (g.hp ? 0 : 0);
    const maxHp = 60 + a.hp * 7 + g.hp + lvlHp;
    const maxMp = 30 + a.mp * 5 + g.mp + cb.mana;
    const maxStam = 60 + a.stam * 5 + g.stam;
    const weaponAtk = this.weaponItem?.atk || 0;
    const atk = (6 + a.str * 1.8 + weaponAtk * 1.55 + g.int * .25 + (this.level - 1) * .7) * (1 + cb.atk / 100);
    const defense = 4 + (a.def + (g.def || 0)) * 1.35 + cb.def * .8;
    const crit = clamp(4 + a.luck * .85 + g.crit + cb.crit, 0, 75);
    const moveSpeed = (172 + a.spd * 4.6 + g.spd * 2.4) * (1 + cb.speed / 100);
    const spellPower = 6 + (a.int + g.int) * 2.15;
    const attackSpeed = (this.weaponItem?.speed || 1) * (1 + a.spd * .012 + g.spd * .008 + cb.aspd / 100);
    const manaRegen = 2.2 + (a.int + g.int) * .08 + cb.mregen;
    const stamRegen = 17 + a.stam * .9;
    const tameBonus = a.luck * 1.15 + (this.tameCharm || 0);
    return {
      maxHp, maxMp, maxStam, atk, defense, crit, moveSpeed, spellPower, attackSpeed,
      manaRegen, stamRegen, tameBonus, hpRegen: cb.regen, armor: g.def || 0,
      weaponAtk
    };
  }
  get maxHp() { return this.stats?.maxHp || 100; }
  get maxMp() { return this.stats?.maxMp || 60; }
  get maxStam() { return this.stats?.maxStam || 100; }
  refreshStats(keepRatio = true) {
    const old = this.stats || { maxHp: 100, maxMp: 60, maxStam: 100 };
    this.stats = this.calcStats();
    if (keepRatio) {
      this.hp = clamp(this.hp / old.maxHp * this.stats.maxHp, 0, this.stats.maxHp);
      this.mp = clamp(this.mp / old.maxMp * this.stats.maxMp, 0, this.stats.maxMp);
      this.stamina = clamp(this.stamina / old.maxStam * this.stats.maxStam, 0, this.stats.maxStam);
    } else {
      this.hp = Math.min(this.hp, this.stats.maxHp);
      this.mp = Math.min(this.mp, this.stats.maxMp);
    }
    this.refreshLook();
  }
  refreshLook() {
    const armor = this.armorItem;
    const helm = this.helmItem;
    const cloak = this.cloakItem;
    const acc = this.accessoryItem;
    const weapon = this.weaponItem;
    this.look = {
      ...this.look,
      armorLook: armor?.armorLook ?? 0,
      helmLook: helm?.helmLook ?? 0,
      outfit: this.look.baseOutfit || this.look.outfit || '#445a80',
      accent: acc ? '#e8c878' : (this.look.baseAccent || this.look.accent || '#c8a060'),
      capeColor: cloak ? ['#38445e', '#4f6a52', '#9aaeff'][cloak.cloak || 0] : (this.look.accessory === 1 ? this.look.accent : null),
      helmet: helm?.helmLook === 1,
      weapon: weapon?.weapon || 'sword'
    };
    this.weaponType = weapon?.weapon || 'sword';
    this.attackSpeedMult = this.stats.attackSpeed || 1;
  }
  addItem(id, qty = 1, silent = false) {
    if (!ITEMS[id]) return false;
    this.inventory[id] = (this.inventory[id] || 0) + qty;
    if (!silent) this.onItemAdded?.(id, qty);
    return true;
  }
  removeItem(id, qty = 1) {
    if ((this.inventory[id] || 0) < qty) return false;
    this.inventory[id] -= qty;
    if (this.inventory[id] <= 0) delete this.inventory[id];
    return true;
  }
  countItem(id) { return this.inventory[id] || 0; }
  equip(id) {
    const it = ITEMS[id];
    if (!it || !it.slot) return false;
    if (!this.inventory[id]) return false;
    this.equipment[it.slot] = id;
    this.refreshStats();
    return true;
  }
  unequip(slot) {
    this.equipment[slot] = null;
    this.refreshStats();
  }
  useItem(id, game) {
    const it = ITEMS[id];
    if (!it || it.type !== 'consumable') return false;
    if (!this.inventory[id]) return false;
    let used = false;
    if (it.use === 'heal') { if (this.hp < this.maxHp) { this.heal(it.amount, game); used = true; } }
    else if (it.use === 'mana') { if (this.mp < this.maxMp) { this.mp = Math.min(this.maxMp, this.mp + it.amount); used = true; game?.audio.sfx('heal'); game?.toast(`+${it.amount} maná`, 'gold'); } }
    else if (it.use === 'snack') { if (this.hp < this.maxHp) { this.heal(it.amount, game); this.stamina = Math.min(this.maxStam, this.stamina + 15); used = true; } }
    else if (it.use === 'full') { this.hp = this.maxHp; this.mp = this.maxMp; this.stamina = this.maxStam; used = true; game?.audio.sfx('heal'); }
    else if (it.use === 'resonance') { this.tameCharm = it.amount; used = true; game?.toast('Afinidad de resonancia +30%', 'creature'); }
    if (used) { this.removeItem(id, 1); game?.ui?.refresh?.(); }
    return used;
  }
  usePotion(kind = 'hp', game) {
    const options = kind === 'hp'
      ? ['pocion_mayor', 'pocion_menor', 'pan_viaje']
      : ['eter', 'elixir'];
    for (const id of options) if (this.inventory[id]) return this.useItem(id, game);
    game?.toast(kind === 'hp' ? 'No tienes pociones de vida' : 'No tienes éter', 'danger');
    return false;
  }
  heal(amount, game) {
    const before = this.hp;
    this.hp = Math.min(this.maxHp, this.hp + amount);
    if (this.hp > before) { game?.audio.sfx('heal'); game?.floatingText(this.x, this.y - 50, `+${Math.round(this.hp - before)}`, '#7fe0a8'); }
  }
  gainXp(amount, game) {
    this.xp += amount;
    let leveled = false;
    while (this.xp >= this.xpToNext()) {
      this.xp -= this.xpToNext();
      this.level++;
      this.statPoints += 2;
      leveled = true;
    }
    if (leveled) {
      this.refreshStats(false);
      this.hp = this.maxHp; this.mp = this.maxMp; this.stamina = this.maxStam;
      game?.audio.sfx('level');
      game?.toast(`NIVEL ${this.level} · +2 puntos de atributo`, 'gold');
      game?.burst(this.x, this.y - 30, '#ffe6a0', 30, 160);
      game?.ui?.refresh?.();
    }
    return leveled;
  }
  xpToNext() { return Math.round(85 + this.level * 58 + this.level * this.level * 9); }
  allocate(stat) {
    if (this.statPoints <= 0 || !(stat in this.attributes)) return false;
    this.attributes[stat]++; this.statPoints--; this.refreshStats(); return true;
  }
  addCreature(id, game) {
    if (!CREATURES[id]) return false;
    if (this.creatures[id]) {
      this.creatures[id].bond = Math.min(100, (this.creatures[id].bond || 1) + 10);
      this.addItem('esencia', 2);
      if (!this.activeCreature) this.setActiveCreature(id);
      return false;
    }
    this.creatures[id] = { level: this.level, bond: 1, xp: 0 };
    this.tamed++;
    if (!this.activeCreature) this.setActiveCreature(id);
    return true;
  }
  setActiveCreature(id) {
    if (!this.creatures[id]) return;
    this.activeCreature = id;
    this.refreshStats();
    this.companion = null;
  }
  addBuff(buff) {
    const existing = this.buffs.find(b => b.id === buff.id);
    if (existing) { existing.time = Math.max(existing.time, buff.time); existing.power = buff.power ?? existing.power; }
    else this.buffs.push({ ...buff });
  }
  hasBuff(id) { return this.buffs.some(b => b.id === id && b.time > 0); }
  update(dt, game) {
    this.playTime += dt;
    this.hurtFlash = Math.max(0, this.hurtFlash - dt * 2.4);
    this.invuln = Math.max(0, this.invuln - dt);
    this.dodgeCooldown = Math.max(0, this.dodgeCooldown - dt);
    this.attackCooldown = Math.max(0, this.attackCooldown - dt);
    this.stun = Math.max(0, this.stun - dt);
    this.slowTimer = Math.max(0, this.slowTimer - dt);
    for (const k of Object.keys(this.cooldowns)) this.cooldowns[k] = Math.max(0, this.cooldowns[k] - dt);
    for (const b of this.buffs) b.time -= dt;
    this.buffs = this.buffs.filter(b => b.time > 0);
    if (this.dodgeTimer > 0) this.dodgeTimer = Math.max(0, this.dodgeTimer - dt);
    if (this.blocking) this.blockTime += dt;
    else this.blockTime = 0;

    // regen
    const regenMult = this.hasBuff('manaDiscount') ? 1 : 1;
    this.mp = Math.min(this.maxMp, this.mp + this.stats.manaRegen * regenMult * dt);
    if (this.staminaDelay > 0) this.staminaDelay -= dt;
    else if (!this.blocking) this.stamina = Math.min(this.maxStam, this.stamina + this.stats.stamRegen * dt);
    if (this.stats.hpRegen) this.hp = Math.min(this.maxHp, this.hp + this.stats.hpRegen * dt);
    if (this.blocking) {
      this.stamina -= 5 * dt;
      if (this.stamina <= 0) { this.stamina = 0; this.blocking = false; game.audio.sfx('error'); }
    }
    this.tameCharm = Math.max(0, this.tameCharm - dt * .2);
    this.updateAttack(dt, game);
  }
  updateAttack(dt, game) {
    if (!this.attackState) {
      if (this.comboWindow > 0) { this.comboWindow -= dt; if (this.comboWindow <= 0) this.combo = 0; }
      return;
    }
    const a = this.attackState;
    a.time += dt;
    a.progress = clamp(a.time / a.duration);
    if (!a.hit && a.progress >= .33) {
      a.hit = true;
      game.playerMeleeHit(a.comboIndex, a.angle);
    }
    if (a.progress >= 1) {
      const queued = a.queued;
      this.attackState = null;
      this.comboWindow = .55;
      this.attackCooldown = queued ? 0 : (a.comboIndex >= 3 ? .22 : .08);
      // Si el jugador pulsó atacar durante el golpe, el siguiente combo sale de inmediato.
      if (queued) this.startAttack(game);
    }
  }
  startAttack(game) {
    if (this.attackState || this.dodgeTimer > 0 || this.stun > 0 || this.attackCooldown > 0) {
      if (this.attackState && this.attackState.progress > .38 && !this.attackState.queued) {
        this.attackState.queued = true;
      }
      return false;
    }
    if (this.stamina < 6) return false;
    this.stamina -= 6;
    this.staminaDelay = .55;
    this.combo = this.comboWindow > 0 ? (this.combo % 3) + 1 : 1;
    const duration = (this.combo === 3 ? .58 : .41) / (this.stats.attackSpeed || 1);
    const aim = game.aimAngleFor(this, 125) ?? FACE_ANGLE[this.facing];
    this.aimAngle = aim;
    this.setFacingFromAngle(aim);
    this.attackState = { time: 0, duration, progress: 0, hit: false, comboIndex: this.combo, angle: aim, active: true, queued: false };
    this.moving = false;
    game.audio.sfx('swing', this.combo === 3 ? .8 : 1);
    game.spawnSlash(this.x, this.y - 24, aim, this.combo);
    return true;
  }
  setFacingFromAngle(angle) {
    const a = Math.atan2(Math.sin(angle), Math.cos(angle));
    if (a >= -Math.PI * .75 && a < -Math.PI * .25) this.facing = 'up';
    else if (a >= -Math.PI * .25 && a < Math.PI * .25) this.facing = 'right';
    else if (a >= Math.PI * .25 && a < Math.PI * .75) this.facing = 'down';
    else this.facing = 'left';
    this.aimAngle = angle;
  }
  faceVector() { return FACE_VEC[this.facing] || FACE_VEC.down; }
  tryDodge(input, game) {
    if (this.dodgeCooldown > 0 || this.stun > 0) return false;
    if (this.stamina < 22) { game.toast('Sin resistencia', 'danger'); return false; }
    let dx = input.moveX, dy = input.moveY;
    if (!dx && !dy) { const f = this.faceVector(); dx = f.x; dy = f.y; }
    const n = norm(dx, dy);
    this.stamina -= 22; this.staminaDelay = .6;
    this.dodgeTimer = .32;
    this.dodgeCooldown = .5;
    this.invuln = Math.max(this.invuln, .3);
    this.dodgeDir = n;
    this.attackState = null;
    game.audio.sfx('dash');
    game.spawnDashTrail(this);
    return true;
  }
  useAbility(index, game) {
    const key = 'ability' + index;
    if (this.cooldowns[key] > 0) return false;
    if (this.stun > 0) return false;
    const costs = { 1: 18, 2: 28, 3: 16 };
    let cost = costs[index];
    if (this.hasBuff('manaDiscount')) cost *= .6;
    if (this.mp < cost) { game.toast('Maná insuficiente', 'danger'); game.audio.sfx('error'); return false; }
    if (index === 1) {
      this.mp -= cost; this.cooldowns.ability1 = 5.5;
      const angle = game.aimAngleFor(this, 280) ?? FACE_ANGLE[this.facing];
      this.setFacingFromAngle(angle); this.aimAngle = angle;
      game.spawnSwordWave(this, angle);
      game.audio.sfx('magic');
    } else if (index === 2) {
      this.mp -= cost; this.cooldowns.ability2 = 10;
      game.spawnPulse(this);
      game.audio.sfx('pulse');
    } else if (index === 3) {
      this.mp -= cost; this.cooldowns.ability3 = 8;
      const input = game.input;
      let dx = input.moveX, dy = input.moveY;
      if (!dx && !dy) { const f = this.faceVector(); dx = f.x; dy = f.y; }
      const n = norm(dx, dy);
      game.veilStep(this, n);
      game.audio.sfx('dash');
    }
    this.refreshStats();
    return true;
  }
  takeDamage(raw, game, source = null, opts = {}) {
    if (this.invuln > 0 || this.dodgeTimer > 0) {
      if (!opts.silent) game.floatingText(this.x, this.y - 48, 'ESQUIVA', '#9fd8ff');
      return 0;
    }
    if (this.blocking) {
      const facingSource = source ? Math.abs(angleTo(this.x, this.y, source.x, source.y) - FACE_ANGLE[this.facing]) < 1.8 : true;
      if (facingSource) {
        if (this.blockTime < .26) {
          // perfect block
          game.floatingText(this.x, this.y - 50, '¡PERFECTO!', '#ffe6a0');
          game.audio.sfx('block');
          this.stamina = Math.min(this.maxStam, this.stamina + 15);
          this.invuln = .25;
          source?.stunHit?.(1.4, game);
          game.burst(this.x, this.y - 30, '#ffe6a0', 16, 120);
          return 0;
        }
        const stamCost = raw * 1.4;
        if (this.stamina >= stamCost) {
          this.stamina -= stamCost;
          raw *= .24;
          game.audio.sfx('block');
          game.floatingText(this.x, this.y - 48, 'BLOQUEO', '#a8c8ff');
          game.camera.shake(3, .1);
        } else {
          this.stamina = 0;
          this.blocking = false;
          game.floatingText(this.x, this.y - 48, 'GUARDIA ROTA', '#ff9a9a');
        }
      }
    }
    const def = this.stats.defense;
    let mitigation = def / (def + 62);
    mitigation = Math.min(.68, mitigation);
    let dmg = Math.max(1, raw * (1 - mitigation));
    if (this.hasBuff('stoneShield')) dmg *= .55;
    if (this.hasBuff('bubble')) dmg *= .45;
    dmg = Math.round(dmg);
    this.hp -= dmg;
    this.hurtFlash = 1;
    this.invuln = .55;
    this.staminaDelay = 1;
    if (source) {
      const a = angleTo(source.x, source.y, this.x, this.y);
      this.vx += Math.cos(a) * 130; this.vy += Math.sin(a) * 130;
    }
    game.floatingText(this.x, this.y - 50, `-${dmg}`, '#ff8a8a');
    game.camera.shake(7, .22);
    game.audio.sfx('hurt');
    game.hitStop = .06;
    if (this.hp <= 0) {
      if (this.stats && this.creatureBonuses().revive > 0 && !this.reviveUsed) {
        this.reviveUsed = true;
        this.hp = Math.round(this.maxHp * .5);
        game.floatingText(this.x, this.y - 60, 'AMANECER', '#ffe6a0');
        game.burst(this.x, this.y - 30, '#fff2c0', 50, 200);
        game.audio.sfx('capture');
        return dmg;
      }
      this.hp = 0;
      game.onPlayerDeath();
    }
    return dmg;
  }
  updateMovement(dt, input, game) {
    if (this.stun > 0) { this.vx *= .8; this.vy *= .8; this.moving = false; return; }
    if (this.dodgeTimer > 0) {
      const speed = 560;
      this.vx = this.dodgeDir.x * speed; this.vy = this.dodgeDir.y * speed;
      this.moveWithCollision(dt * .55, game);
      return;
    }
    const ax = input.moveX, ay = input.moveY;
    const attackPenalty = this.attackState ? .25 : 1;
    const blockPenalty = this.blocking ? .34 : 1;
    const slow = this.slowTimer > 0 ? .55 : 1;
    const speed = this.stats.moveSpeed * this.speedScale * attackPenalty * blockPenalty * slow;
    let targetX = ax * speed, targetY = ay * speed;
    const len = Math.hypot(targetX, targetY);
    if (len > speed) { targetX = targetX / len * speed; targetY = targetY / len * speed; }
    this.vx = lerp(this.vx, targetX, 1 - Math.exp(-12 * dt));
    this.vy = lerp(this.vy, targetY, 1 - Math.exp(-12 * dt));
    const mag = Math.hypot(this.vx, this.vy);
    this.moving = mag > 24 && !this.attackState;
    if (this.moving) {
      this.walkPhase += dt * (1 + mag / 260);
      this.footTimer -= dt;
      if (this.footTimer <= 0) { this.footTimer = .27; game.audio.sfx('step'); }
      if (Math.abs(ax) > Math.abs(ay)) this.facing = ax > 0 ? 'right' : 'left';
      else if (Math.abs(ay) > .1) this.facing = ay > 0 ? 'down' : 'up';
      this.aimAngle = Math.atan2(ay, ax);
    }
    this.moveWithCollision(dt, game);
  }
  moveWithCollision(dt, game) {
    const nx = this.x + this.vx * dt;
    if (canStand(game.region, nx, this.y, this.radius)) this.x = nx;
    else this.vx = 0;
    const ny = this.y + this.vy * dt;
    if (canStand(game.region, this.x, ny, this.radius)) this.y = ny;
    else this.vy = 0;
    this.x = clamp(this.x, 30, game.region.widthPx - 30);
    this.y = clamp(this.y, 30, game.region.heightPx - 30);
  }
  serialize() {
    return {
      name: this.name, look: this.look, attributes: this.attributes, level: this.level, xp: this.xp,
      gold: this.gold, statPoints: this.statPoints, x: this.x, y: this.y, hp: this.hp, mp: this.mp,
      stamina: this.stamina, equipment: this.equipment, inventory: this.inventory, creatures: this.creatures,
      activeCreature: this.activeCreature, tamed: this.tamed, kills: this.kills, questsDone: this.questsDone,
      playTime: this.playTime, tameCharm: this.tameCharm, reviveUsed: this.reviveUsed
    };
  }
  static deserialize(data) {
    const p = new Player({ name: data.name, look: data.look, attributes: data.attributes, kit: 'errante' });
    p.inventory = {}; p.equipment = data.equipment || {};
    p.level = data.level || 1; p.xp = data.xp || 0; p.gold = data.gold || 0; p.statPoints = data.statPoints || 0;
    p.creatures = data.creatures || {}; p.activeCreature = data.activeCreature || null;
    p.tamed = data.tamed || 0; p.kills = data.kills || 0; p.questsDone = data.questsDone || 0;
    p.playTime = data.playTime || 0; p.reviveUsed = data.reviveUsed || false;
    p.inventory = data.inventory || {};
    p.refreshStats(false);
    p.x = data.x || 0; p.y = data.y || 0;
    p.hp = clamp(data.hp ?? p.maxHp, 1, p.maxHp);
    p.mp = clamp(data.mp ?? p.maxMp, 0, p.maxMp);
    p.stamina = clamp(data.stamina ?? p.maxStam, 0, p.maxStam);
    return p;
  }
}

export { FACE_ANGLE, FACE_VEC };
