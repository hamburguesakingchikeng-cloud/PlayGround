import { ORIGINS, SKILL_TREES, WEAPON_TYPES, ULTIMATES, DIFFICULTIES } from '../data/skills.js';
import { ITEMS } from '../data/items.js';
import { clamp, angleDiff, dist, TAU } from '../core/utils.js';

export const BASE_STATS = { vit: 5, mana: 5, res: 5, str: 5, def: 5, vel: 5, int: 5, luck: 5 };
export const DEFAULT_APPEARANCE = {
  skin: '#e8c9a8', hairStyle: 0, hairColor: '#3a2a1a', eyeColor: '#4a7a8a',
  outfit: '#4a6a4a', armorColor: '#6f8f63', cape: true, capeColor: '#7a3a4a', helmet: false,
};

export const SPELLS = [
  { id: 'rayo', name: 'Rayo Celestial', cost: 12, cooldown: 1.1, desc: 'Un proyectil de luz que atraviesa la penumbra.', color: '#ffe7a8' },
  { id: 'nova', name: 'Nova de Resonancia', cost: 20, cooldown: 5, desc: 'Una onda expansiva que daña y ralentiza a los enemigos cercanos.', color: '#c7a4ff' },
  { id: 'barrera', name: 'Barrera del Velo', cost: 16, cooldown: 8, desc: 'Un escudo de luz que absorbe daño y te cura ligeramente.', color: '#9fe8ff' },
];

export class Player {
  constructor(game, data = null) {
    this.game = game;
    this.radius = 10;
    this.x = 0; this.y = 0;
    this.vx = 0; this.vy = 0;
    this.facing = Math.PI / 2;
    this.anim = 'idle';
    this.animTime = 0;
    this.attackTime = 0;
    this.attackIndex = 0;
    this.comboTimer = 0;
    this.attackHit = new Set();
    this.heavy = false;
    this.dodgeTime = 0;
    this.dodgeCd = 0;
    this.invuln = 0;
    this.blocking = false;
    this.parryTimer = 0;
    this.parryCd = 0;
    this.castTime = 0;
    this.castSpell = null;
    this.hurtFlash = 0;
    this.dead = false;
    this.deadTime = 0;
    this.potionCd = 0;
    this.ult = 0;
    this.ultActive = 0;
    this.ultType = null;
    this.status = {};
    this.selectedSpell = 0;
    this.spellCooldowns = [0, 0, 0];
    this.stepTimer = 0;
    this.companionCooldown = 0;
    this.captureMode = false;
    this.lastSafe = null;
    this.kills = 0;
    this.captures = 0;
    this.damageDealt = 0;
    this.damageTaken = 0;
    this.playtime = 0;
    if (data) this.deserialize(data);
    else this.initNew();
  }

  get flags() { return this.game.flags; }
  get stats() { return this.baseStats; }
  get difficulty() { return DIFFICULTIES[this.game.settings.difficulty] || DIFFICULTIES.caballero; }

  initNew() {
    this.name = 'Peregrino';
    this.origin = 'brasa';
    this.appearance = { ...DEFAULT_APPEARANCE };
    this.baseStats = { ...BASE_STATS };
    this.bonusCrit = 0;
    this.level = 1;
    this.xp = 0;
    this.xpNext = 100;
    this.points = 8;
    this.skillPoints = 0;
    this.skills = {};
    this.gold = 60;
    this.hp = 100; this.mp = 30; this.stamina = 60;
    this.maxHp = 100; this.maxMp = 30; this.maxStamina = 60;
    this.region = 'valdoria';
    this.lastWaypoint = null;
    this.recalc(true);
    this.hp = this.maxHp; this.mp = this.maxMp; this.stamina = this.maxStamina;
  }

  applyOrigin(origin) {
    this.origin = origin;
    const o = ORIGINS[origin] || ORIGINS.brasa;
    this.baseStats = { ...BASE_STATS };
    for (const [k, v] of Object.entries(o.bonus)) {
      if (k === 'crit') this.bonusCrit += v * 0.02;
      else if (k === 'mana') this.baseStats.mana += v;
      else this.baseStats[k] = (this.baseStats[k] || 0) + v;
    }
    this.recalc(true);
    this.hp = this.maxHp; this.mp = this.maxMp; this.stamina = this.maxStamina;
  }

  recalc(full = false) {
    const eq = this.game.inventory?.equipmentStats() || {};
    const passive = this.game.collection?.passiveStats() || {};
    const s = this.baseStats;
    this.maxHp = Math.round(80 + (s.vit + (passive.vit || 0)) * 8 + (eq.hp || 0));
    this.maxMp = Math.round(30 + (s.mana + (passive.mana || 0)) * 4 + (eq.mp || 0));
    this.maxStamina = Math.round(60 + (s.res + (passive.res || 0)) * 4);
    this.attack = 6 + (s.str + (passive.str || 0)) * 1.55 + (eq.atk || 0);
    this.spellPower = 12 + (s.int + (passive.int || 0)) * 2.3 + (eq.int || 0) * 1.6;
    this.defense = (s.def + (passive.def || 0)) * 1.2 + (eq.def || 0);
    this.speed = 118 + (s.vel + (passive.vel || 0)) * 3.6 + (eq.speed || 0) * 1.8;
    this.crit = clamp(0.05 + (s.luck + (passive.luck || 0)) * 0.006 + (eq.crit || 0) / 100 + this.bonusCrit, 0, 0.85);
    this.luck = s.luck + (passive.luck || 0) + (eq.luck || 0);
    this.hpRegen = (eq.hpRegen || 0) + (passive.hpRegen || 0);
    this.manaRegen = 1 + (eq.manaRegen || 0) + (passive.manaRegen || 0);
    this.damageReduction = clamp((eq.damageReduction || 0) + (passive.damageReduction || 0) + this.defense / (this.defense + 180), 0, 0.75);
    this.lifesteal = (eq.lifesteal || 0) + (passive.lifesteal || 0);
    this.dodgeCdMax = 0.65 * (1 - (passive.dodgeCd || 0));
    this.weaponSpeed = WEAPON_TYPES[this.game.inventory?.weaponType()]?.speed || 1;
    this.maxHp = Math.max(1, this.maxHp); this.maxMp = Math.max(1, this.maxMp); this.maxStamina = Math.max(1, this.maxStamina);
    if (full) { this.hp = Math.min(this.hp, this.maxHp); this.mp = Math.min(this.mp, this.maxMp); this.stamina = Math.min(this.stamina, this.maxStamina); }
    this.hp = Math.min(this.hp, this.maxHp);
    this.mp = Math.min(this.mp, this.maxMp);
    this.stamina = Math.min(this.stamina, this.maxStamina);
  }

  hasSkill(id) { return Boolean(this.skills[id]); }
  skillBranch() { return this.origin === 'velo' ? 'velo' : this.origin === 'sombra' ? 'resonancia' : 'espada'; }

  unlockSkill(id) {
    const all = Object.values(SKILL_TREES).flatMap(t => t.nodes);
    const node = all.find(n => n.id === id);
    if (!node || this.skills[id] || this.skillPoints < node.cost) return false;
    if (node.requires && !this.skills[node.requires]) return false;
    this.skillPoints -= node.cost;
    this.skills[id] = true;
    if (node.ultimate) this.ultType = node.ultimate;
    this.game.ui.toast('Habilidad aprendida', node.name, 'skill');
    this.game.audio.sfx('levelup');
    return true;
  }

  allocate(stat) {
    if (this.points <= 0 || !(stat in this.baseStats)) return false;
    this.points--;
    this.baseStats[stat]++;
    this.recalc();
    return true;
  }

  heal(amount) {
    const before = this.hp;
    this.hp = Math.min(this.maxHp, this.hp + amount);
    if (this.hp > before) this.game.particles.number(this.x, this.y - 34, `+${Math.round(this.hp - before)}`, '#8fd18a', 14);
  }
  restoreMana(amount) {
    const before = this.mp;
    this.mp = Math.min(this.maxMp, this.mp + amount);
    if (this.mp > before) this.game.particles.number(this.x, this.y - 46, `+${Math.round(this.mp - before)}`, '#7fb7ff', 13);
  }

  gainXp(amount) {
    if (amount <= 0) return;
    this.xp += Math.round(amount * this.difficulty.xp);
    while (this.xp >= this.xpNext) {
      this.xp -= this.xpNext;
      this.level++;
      this.xpNext = 80 + this.level * 60;
      this.points += 2;
      this.skillPoints += 1;
      this.recalc(true);
      this.hp = this.maxHp; this.mp = this.maxMp; this.stamina = this.maxStamina;
      this.game.ui.toast('Nivel ' + this.level, 'Has ganado 2 puntos de atributo y 1 de habilidad.', 'level');
      this.game.audio.sfx('levelup');
      this.game.particles.burst(this.x, this.y - 20, 40, { color: '#ffe7a8', speed: 140, life: 1, size: 3 });
      this.game.autosave();
    }
  }

  addUlt(amount) { this.ult = clamp(this.ult + amount, 0, 100); }

  update(dt, input, world, game) {
    this.playtime += dt;
    if (this.dead) {
      this.deadTime += dt;
      this.animTime += dt;
      return;
    }
    // Temporizadores.
    this.invuln = Math.max(0, this.invuln - dt);
    this.dodgeCd = Math.max(0, this.dodgeCd - dt);
    this.potionCd = Math.max(0, this.potionCd - dt);
    this.comboTimer = Math.max(0, this.comboTimer - dt);
    this.parryCd = Math.max(0, this.parryCd - dt);
    this.parryTimer = Math.max(0, this.parryTimer - dt);
    this.hurtFlash = Math.max(0, this.hurtFlash - dt);
    this.ultActive = Math.max(0, this.ultActive - dt);
    this.spellCooldowns = this.spellCooldowns.map(v => Math.max(0, v - dt));
    this.companionCooldown = Math.max(0, this.companionCooldown - dt);
    this.castTime = Math.max(0, this.castTime - dt);
    this.dodgeTime = Math.max(0, this.dodgeTime - dt);
    for (const [k, v] of Object.entries(this.status)) {
      this.status[k] = v - dt;
      if (this.status[k] <= 0) delete this.status[k];
    }
    if (this.status.burn) this.hp -= 4 * dt;
    if (this.hp <= 0) { this.die(); return; }

    // Regeneración.
    const outOfCombat = !game.inCombat;
    this.stamina = Math.min(this.maxStamina, this.stamina + (outOfCombat ? 24 : 14) * dt);
    this.mp = Math.min(this.maxMp, this.mp + this.manaRegen * dt);
    if (outOfCombat) this.hp = Math.min(this.maxHp, this.hp + (2 + this.hpRegen) * dt);

    // Apuntado.
    const aim = this.getAimAngle(game, input);
    if (!this.attacking() && !this.dodging()) this.facing = aim;

    // Movimiento.
    const axis = input.axis();
    const moveScale = this.blocking ? 0.42 : (this.attacking() ? 0.22 : 1);
    let dx = axis.x * this.speed * moveScale * dt;
    let dy = axis.y * this.speed * moveScale * dt;
    if (this.dodging()) {
      const dashSpeed = 430 * (this.hasSkill('veil_step') ? 1.25 : 1);
      dx = Math.cos(this.dodgeAngle) * dashSpeed * dt;
      dy = Math.sin(this.dodgeAngle) * dashSpeed * dt;
    }
    if (dx || dy) {
      const moved = world.moveCircle(this.x, this.y, dx, dy, this.radius);
      this.x = moved.x; this.y = moved.y;
      if (!this.attacking() && !this.dodging()) {
        this.anim = axis.len > 0.7 ? 'run' : 'walk';
        this.stepTimer -= dt;
        if (this.stepTimer <= 0) { this.stepTimer = 0.32; game.audio.sfx('step', { volume: 0.35 }); }
      }
    } else if (!this.attacking() && !this.dodging() && !this.blocking && this.castTime <= 0) {
      this.anim = 'idle';
    }

    // Acciones.
    if (input.justPressed('attack') && !this.attacking() && !this.dodging() && this.castTime <= 0) this.startAttack(false, game);
    if (input.justPressed('heavy') && !this.attacking() && !this.dodging() && this.castTime <= 0) this.startAttack(true, game);
    if (input.justPressed('dodge') && !this.dodging() && this.dodgeCd <= 0 && this.stamina >= 16) this.startDodge(axis, game);
    this.blocking = input.down('block') && !this.attacking() && !this.dodging();
    if (input.justPressed('block') && this.parryCd <= 0) { this.parryTimer = this.difficulty.parryWindow; this.parryCd = 0.55; }
    if (input.justPressed('interact')) game.interact();
    if (input.justPressed('spell1')) { this.selectedSpell = 0; }
    if (input.justPressed('spell2')) { this.selectedSpell = 1; }
    if (input.justPressed('spell3')) { this.selectedSpell = 2; }
    if (input.justPressed('spell')) this.castSelected(game);
    if (input.justPressed('companion')) game.useCompanion();
    if (input.justPressed('ultimate')) this.useUltimate(game);
    if (input.justPressed('potion')) this.usePotion(game);

    // Ataque.
    if (this.attackTime > 0) {
      this.attackTime -= dt;
      this.animTime += dt;
      const phase = this.attackPhase;
      if (phase === 'active' && this.attackTime <= this.attackActiveEnd && !this.attackDone) {
        this.attackDone = true;
        this.resolveAttack(game);
      }
      if (this.attackTime <= 0) {
        this.anim = 'idle';
        this.attackPhase = null;
      }
    } else if (this.castTime > 0) {
      this.anim = 'cast';
    } else if (this.dodging()) {
      this.anim = 'dodge';
      this.invuln = Math.max(this.invuln, 0.08);
      if (Math.random() < 0.5) game.particles.spawn('smoke', this.x, this.y + 8, { color: '#c7a4ff', size: 5, life: 0.35, speed: 10, additive: false });
    } else if (this.blocking) {
      this.anim = 'block';
    }

    // Sombra del Velo (habilidad de esquiva).
    if (this.dodging() && this.hasSkill('veil_step') && Math.random() < 0.6) {
      game.particles.spawn('smoke', this.x, this.y, { color: '#7d6a9e', size: 4, life: 0.3, speed: 6, additive: false });
    }
    this.animTime += dt;
  }

  getAimAngle(game, input) {
    const axis = input.axis();
    if (input.touchMode) {
      const target = game.nearestEnemy(this.x, this.y, 320);
      if (target) return Math.atan2(target.y - this.y, target.x - this.x);
      if (axis.len > 0.1) return Math.atan2(axis.y, axis.x);
      return this.facing;
    }
    const w = game.camera.screenToWorld(input.mouse.x, input.mouse.y);
    if (game.autoAim && game.nearestEnemy(this.x, this.y, 260)) {
      const t = game.nearestEnemy(this.x, this.y, 260);
      return Math.atan2(t.y - this.y, t.x - this.x);
    }
    if (input.mouse.x || input.mouse.y) return Math.atan2(w.y - this.y, w.x - this.x);
    if (axis.len > 0.1) return Math.atan2(axis.y, axis.x);
    return this.facing;
  }

  attacking() { return this.attackTime > 0; }
  dodging() { return this.dodgeTime > 0; }

  startAttack(heavy, game) {
    if (heavy && this.stamina < 20) { game.ui.toast('Sin resistencia', 'No puedes ejecutar un ataque pesado.', 'warn'); return; }
    this.heavy = heavy;
    this.attackDone = false;
    this.attackHit.clear();
    if (heavy) {
      this.stamina -= 20;
      this.attackDuration = 0.62 / this.weaponSpeed;
      this.attackActiveEnd = this.attackDuration * 0.48;
      this.attackPhase = 'active';
      this.attackTime = this.attackDuration;
      this.anim = 'heavy';
      game.audio.sfx('heavy');
    } else {
      if (this.comboTimer > 0) this.attackIndex = (this.attackIndex + 1) % 3;
      else this.attackIndex = 0;
      this.comboTimer = 0.75;
      this.stamina = Math.max(0, this.stamina - 6);
      const speed = this.weaponSpeed * (this.hasSkill('blade_rhythm') ? 1.2 : 1);
      this.attackDuration = (0.36 + this.attackIndex * 0.05) / speed;
      this.attackActiveEnd = this.attackDuration * 0.5;
      this.attackPhase = 'active';
      this.attackTime = this.attackDuration;
      this.anim = 'attack' + this.attackIndex;
      game.audio.sfx('attack', { volume: 0.8 });
    }
    this.animTime = 0;
  }

  resolveAttack(game) {
    const wt = WEAPON_TYPES[game.inventory.weaponType()] || WEAPON_TYPES.sword;
    const range = wt.range + (this.heavy ? 10 : 0);
    const arc = wt.arc + (this.heavy ? 0.3 : 0);
    const base = (this.attack + (this.heavy ? 8 : 0)) * wt.damage * (this.heavy ? 1.55 : 1);
    const crit = Math.random() < this.crit;
    const dmg = Math.round(base * (crit ? 1.7 : 1));
    const hitAny = [];
    for (const e of game.enemies) {
      if (e.dead || e.captured) continue;
      const d = dist(this.x, this.y, e.x, e.y);
      if (d > range + e.radius) continue;
      const a = Math.atan2(e.y - this.y, e.x - this.x);
      if (Math.abs(angleDiff(this.facing, a)) > arc / 2) continue;
      if (this.attackHit.has(e)) continue;
      this.attackHit.add(e);
      const res = e.takeDamage(dmg, { source: 'player', crit, element: this.heavy ? 'fuego' : null, game });
      if (res) {
        hitAny.push(e);
        if (this.hasSkill('blade_edge') && this.heavy) e.applyStatus('burn', 4, game);
        if (this.lifesteal) this.heal(dmg * this.lifesteal);
        this.addUlt(crit ? 9 : 6);
        game.hitstop = Math.max(game.hitstop, this.heavy ? 0.09 : 0.045);
        game.camera.addShake(this.heavy ? 8 : 4);
        game.particles.burst(e.x, e.y - 10, this.heavy ? 18 : 10, { color: crit ? '#ffe7a8' : '#ffb86a', speed: 150, life: 0.5, size: 2.6 });
        game.particles.number(e.x, e.y - e.radius - 18, `${dmg}${crit ? '!' : ''}`, crit ? '#ffe7a8' : '#fff3d0', crit ? 22 : 16, crit);
        game.audio.sfx(crit ? 'crit' : 'hit', { pan: clamp((e.x - this.x) / 300, -1, 1) });
      }
    }
    if (hitAny.length) {
      this.damageDealt += dmg * hitAny.length;
    } else {
      // Golpe al aire: pequeña onda visual.
      game.particles.slash(this.x + Math.cos(this.facing) * 18, this.y + Math.sin(this.facing) * 18 - 6, this.facing, { radius: range * 0.7, color: this.heavy ? '#ff9a5c' : '#ffe7a8', arc, width: this.heavy ? 10 : 7 });
    }
    if (!this.heavy) {
      game.particles.slash(this.x + Math.cos(this.facing) * 16, this.y + Math.sin(this.facing) * 16 - 8, this.facing, { radius: range * 0.8, color: this.heavy ? '#ff9a5c' : '#ffe7a8', arc, width: this.heavy ? 11 : 7 });
    }
  }

  startDodge(axis, game) {
    this.stamina -= 16;
    this.dodgeTime = 0.3;
    this.dodgeCd = this.dodgeCdMax;
    this.invuln = 0.24;
    this.dodgeAngle = axis.len > 0.1 ? Math.atan2(axis.y, axis.x) : this.facing;
    this.anim = 'dodge';
    game.audio.sfx('dodge');
  }

  castSelected(game) {
    const spell = SPELLS[this.selectedSpell];
    if (!spell) return;
    this.castSpellById(spell.id, game);
  }

  castSpellById(id, game) {
    const spell = SPELLS.find(s => s.id === id);
    if (!spell) return;
    const cost = Math.round(spell.cost * (this.origin === 'velo' ? 0.9 : 1));
    if (this.mp < cost) { game.ui.toast('Maná insuficiente', spell.name, 'warn'); game.audio.sfx('error'); return; }
    if (this.spellCooldowns[SPELLS.indexOf(spell)] > 0) return;
    if (this.castTime > 0 || this.attacking() || this.dodging()) return;
    this.mp -= cost;
    this.spellCooldowns[SPELLS.indexOf(spell)] = spell.cooldown;
    this.castTime = 0.25;
    this.anim = 'cast';
    game.audio.sfx(id === 'rayo' ? 'spell' : id === 'nova' ? 'fire' : 'waypoint');
    const aim = this.facing;
    if (id === 'rayo') {
      game.spawnProjectile({
        x: this.x + Math.cos(aim) * 18, y: this.y + Math.sin(aim) * 18 - 8,
        vx: Math.cos(aim) * 430, vy: Math.sin(aim) * 430,
        radius: 9, damage: Math.round(this.spellPower * (this.game.inventory.weaponType() === 'staff' ? 1.2 : 1)),
        color: '#ffe7a8', owner: 'player', life: 1.1, pierce: false, element: 'luz',
        onHit: (enemy) => { if (this.hasSkill('veil_mark')) enemy.applyStatus('mark', 6, game); },
      });
      game.particles.beam(this.x, this.y - 8, aim, { radius: 40, color: '#ffe7a8', width: 5, life: 0.12 });
    } else if (id === 'nova') {
      game.particles.ring(this.x, this.y, { radius: 20, target: 130, color: '#c7a4ff', width: 8, life: 0.5 });
      for (const e of game.enemies) {
        if (e.dead) continue;
        if (dist(this.x, this.y, e.x, e.y) < 130 + e.radius) {
          const dmg = Math.round(this.spellPower * 0.9);
          e.takeDamage(dmg, { source: 'player', element: 'luz', game });
          e.applyStatus('slow', 2.5, game);
          if (this.hasSkill('veil_mark')) e.applyStatus('mark', 6, game);
          game.particles.number(e.x, e.y - 20, `${dmg}`, '#c7a4ff', 16);
        }
      }
      game.camera.addShake(9);
      this.addUlt(10);
    } else if (id === 'barrera') {
      this.status.shield = 7;
      this.shieldAmount = Math.round(this.maxHp * 0.25);
      this.heal(Math.round(this.maxHp * 0.12));
      game.particles.ring(this.x, this.y, { radius: 10, target: 42, color: '#9fe8ff', width: 4, life: 0.6 });
      game.particles.burst(this.x, this.y - 10, 22, { color: '#9fe8ff', speed: 70, life: 0.8, size: 2.5 });
    }
  }

  useUltimate(game) {
    if (!this.ultType) { game.ui.toast('Definitiva bloqueada', 'Aprende una habilidad definitiva en el árbol de habilidades.', 'warn'); return; }
    if (this.ult < 100 || this.ultActive > 0) { if (this.ult < 100) game.audio.sfx('error'); return; }
    this.ult = 0;
    this.ultActive = 1.2;
    this.invuln = 1.2;
    game.audio.sfx('boss');
    game.camera.addShake(18);
    if (this.ultType === 'blade') {
      game.particles.ring(this.x, this.y, { radius: 20, target: 170, color: '#ffe7a8', width: 12, life: 0.7 });
      for (let i = 0; i < 3; i++) {
        setTimeout(() => {
          if (!this.dead) {
            game.particles.slash(this.x, this.y, Math.random() * TAU, { radius: 110, color: '#ffe7a8', arc: TAU, width: 14 });
            for (const e of game.enemies) {
              if (!e.dead && dist(this.x, this.y, e.x, e.y) < 180 + e.radius) {
                const dmg = Math.round(this.attack * 2.4);
                e.takeDamage(dmg, { source: 'player', crit: true, game });
                game.particles.number(e.x, e.y - 24, `${dmg}`, '#ffe7a8', 24, true);
              }
            }
          }
        }, i * 180);
      }
      game.ui.toast('TORMENTA CELESTIAL', 'El acero recuerda su nombre.', 'ult');
    } else if (this.ultType === 'veil') {
      game.particles.ring(this.x, this.y, { radius: 20, target: 260, color: '#c7a4ff', width: 10, life: 0.8 });
      for (const e of game.enemies) {
        if (e.dead) continue;
        if (dist(this.x, this.y, e.x, e.y) < 260 + e.radius) {
          e.applyStatus('freeze', 4, game);
          const dmg = Math.round(this.spellPower * 1.8);
          e.takeDamage(dmg, { source: 'player', element: 'luz', game });
          game.particles.number(e.x, e.y - 22, `${dmg}`, '#c7a4ff', 22, true);
        }
      }
      this.mp = this.maxMp;
      game.ui.toast('NOVA DEL VELO', 'El silencio se vuelve forma.', 'ult');
    } else {
      this.heal(Math.round(this.maxHp * 0.5));
      game.summonAllCompanions();
      game.ui.toast('DESPERTAR', 'Todas tus resonancias responden.', 'ult');
    }
  }

  usePotion(game) {
    if (this.potionCd > 0) return;
    if (!game.inventory.has('potion_lumen')) { game.ui.toast('Sin pociones', 'No te queda Poción de Lumen.', 'warn'); return; }
    this.potionCd = 3.2;
    game.inventory.remove('potion_lumen', 1);
    this.heal(Math.round(this.maxHp * 0.45 * this.difficulty.potion));
    game.audio.sfx('potion');
    game.particles.burst(this.x, this.y - 10, 16, { color: '#ff7b7b', speed: 50, life: 0.7, size: 2.5 });
  }

  takeDamage(amount, { source = 'enemy', element = null, game = this.game, ignoreBlock = false } = {}) {
    if (this.dead || this.invuln > 0 || this.dodging()) return 0;
    if (this.parryTimer > 0 && !ignoreBlock) {
      this.parryTimer = 0;
      this.mp = Math.min(this.maxMp, this.mp + 15);
      this.addUlt(12);
      game.audio.sfx('parry');
      game.hitstop = 0.12;
      game.camera.addShake(7);
      game.particles.ring(this.x, this.y, { radius: 12, target: 70, color: '#ffe7a8', width: 5, life: 0.4 });
      if (this.hasSkill('blade_guard')) {
        for (const e of game.enemies) {
          if (!e.dead && dist(this.x, this.y, e.x, e.y) < 120) {
            e.stagger(1.6, game);
            e.takeDamage(Math.round(this.attack * 0.8), { source: 'player', game });
          }
        }
      }
      return 0;
    }
    let dmg = amount * (1 - this.damageReduction);
    if (this.blocking) {
      const staminaCost = dmg * 0.9;
      if (this.stamina >= staminaCost) {
        this.stamina -= staminaCost;
        dmg *= 0.25;
        game.particles.burst(this.x, this.y - 10, 6, { color: '#9fe8ff', speed: 70, life: 0.35, size: 2 });
      } else {
        this.stamina = 0;
        this.blocking = false;
        game.ui.toast('Guardia rota', 'La resistencia se ha agotado.', 'warn');
      }
    }
    if (this.status.shield > 0 && this.shieldAmount > 0) {
      const absorbed = Math.min(this.shieldAmount, dmg);
      this.shieldAmount -= absorbed;
      dmg -= absorbed;
      if (this.shieldAmount <= 0) delete this.status.shield;
    }
    dmg = Math.max(1, Math.round(dmg));
    this.hp -= dmg;
    this.damageTaken += dmg;
    this.addUlt(3);
    this.invuln = 0.55;
    this.hurtFlash = 0.25;
    game.camera.addShake(6);
    game.audio.sfx('hit');
    game.particles.number(this.x, this.y - 40, `-${dmg}`, '#ff7b7b', 16);
    game.particles.burst(this.x, this.y - 10, 10, { color: '#ff7b7b', speed: 90, life: 0.5, size: 2.2 });
    if (this.hp <= 0) this.die();
    return dmg;
  }

  die() {
    if (this.dead) return;
    this.dead = true;
    this.hp = 0;
    this.anim = 'dead';
    this.animTime = 0;
    this.game.audio.sfx('death');
    this.game.onPlayerDeath();
  }

  reviveAt(x, y) {
    this.dead = false;
    this.deadTime = 0;
    this.hp = Math.round(this.maxHp * 0.55);
    this.mp = Math.round(this.maxMp * 0.5);
    this.stamina = this.maxStamina;
    this.invuln = 2;
    this.status = {};
    this.x = x; this.y = y;
    this.anim = 'idle';
  }

  serialize() {
    return {
      name: this.name, origin: this.origin, appearance: { ...this.appearance },
      baseStats: { ...this.baseStats }, bonusCrit: this.bonusCrit,
      level: this.level, xp: this.xp, xpNext: this.xpNext, points: this.points,
      skillPoints: this.skillPoints, skills: { ...this.skills },
      gold: this.gold, hp: this.hp, mp: this.mp, stamina: this.stamina,
      region: this.region, x: this.x, y: this.y, lastWaypoint: this.lastWaypoint,
      kills: this.kills, captures: this.captures, damageDealt: this.damageDealt,
      damageTaken: this.damageTaken, playtime: this.playtime, ultType: this.ultType,
    };
  }
  deserialize(data) {
    this.name = data.name || 'Peregrino';
    this.origin = data.origin || 'brasa';
    this.appearance = { ...DEFAULT_APPEARANCE, ...(data.appearance || {}) };
    this.baseStats = { ...BASE_STATS, ...(data.baseStats || {}) };
    this.bonusCrit = data.bonusCrit || 0;
    this.level = data.level || 1;
    this.xp = data.xp || 0;
    this.xpNext = data.xpNext || (80 + this.level * 60);
    this.points = data.points || 0;
    this.skillPoints = data.skillPoints || 0;
    this.skills = { ...(data.skills || {}) };
    this.gold = data.gold || 0;
    this.hp = data.hp ?? 100;
    this.mp = data.mp ?? 30;
    this.stamina = data.stamina ?? 60;
    this.region = data.region || 'valdoria';
    this.x = data.x || 0; this.y = data.y || 0;
    this.lastWaypoint = data.lastWaypoint || null;
    this.kills = data.kills || 0;
    this.captures = data.captures || 0;
    this.damageDealt = data.damageDealt || 0;
    this.damageTaken = data.damageTaken || 0;
    this.playtime = data.playtime || 0;
    this.ultType = data.ultType || null;
    this.recalc(true);
    this.hp = Math.min(this.hp, this.maxHp);
    this.mp = Math.min(this.mp, this.maxMp);
    this.stamina = Math.min(this.stamina, this.maxStamina);
  }
}
