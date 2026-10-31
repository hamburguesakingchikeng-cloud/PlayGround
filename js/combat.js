// Combate, IA, ecos, proyectos y habilidades.
import { TILE, ENEMIES, CREATURES, ITEMS, SKILLS, DIFFICULTY } from './data.js';
import { clamp, dist, angleDiff, TAU } from './util.js';
import { audio } from './audio.js';
import { onBossDefeated } from './story.js';

const elemColor = {
  fuego: '#ff8a4a', hielo: '#8ed4e8', sombra: '#a382c4', celestial: '#f2d98e',
  cristal: '#9fc8dd', astral: '#b7a6f2', naturaleza: '#8fc77a', fisico: '#e0d6c2'
};

export const Combat = {
  // ───────────────────────── acciones del héroe ─────────────────────────
  attack() {
    const p = this.player;
    if (!p || p.dead || this.capture) return;
    if (p.state === 'hurt' || p.state === 'dodge') return;
    if (p.state === 'attack' && p.stateT < p.attackDuration * .72) return;
    if (p.stamina < 6) { this.ui?.toast?.('Sin aguante', 'danger'); return; }
    p.stamina -= 6;
    p.state = 'attack'; p.stateT = 0; p.attackDuration = .3 - Math.min(.08, p.stats.velocidad * .005);
    p.combo = p.comboT > 0 ? (p.combo % 3) + 1 : 1;
    p.comboT = .95;
    const third = p.combo === 3;
    const reach = 72 + (third ? 18 : 0) + p.stats.fuerza;
    const arc = Math.PI * (third ? 1.12 : .86);
    audio.sfx?.('swing');
    const fxX = p.x + Math.cos(p.facing) * 22, fxY = p.y - 28 + Math.sin(p.facing) * 22;
    this.effects.push({ kind: 'slash', x: fxX, y: fxY, angle: p.facing, radius: reach * .86, color: '#fff1c9', width: third ? 7 : 4, life: .28, max: .28 });
    if (third) {
      this.effects.push({ kind: 'ring', x: p.x, y: p.y, r0: 20, r1: reach * 1.3, color: '#f2d98e', width: 3, life: .4, max: .4 });
      this.shake = Math.max(this.shake, 4);
      audio.sfx?.('heavy');
    }
    const passive = this.unlockedSkills.includes('acero_eco');
    const mult = (third ? 1.45 : 1) * (passive ? 1.12 : 1);
    this.performPlayerHit(reach, arc, mult, { third });
    if (third && passive) p.mp = Math.min(p.maxMp, p.mp + 4);
    if (third) {
      const near = this.enemies.filter(e => !e.dead && dist(e.x, e.y, p.x, p.y) < reach + 40);
      for (const e of near) {
        const a = Math.atan2(e.y - p.y, e.x - p.x);
        this.tryMove(e, Math.cos(a) * 18, Math.sin(a) * 18);
      }
    }
  },

  performPlayerHit(radius, arc, mult, opts = {}) {
    const p = this.player;
    let hit = false;
    for (const e of this.enemies) {
      if (e.dead) continue;
      const d = dist(e.x, e.y, p.x, p.y);
      if (d > radius + e.radius) continue;
      const a = Math.atan2(e.y - p.y, e.x - p.x);
      if (Math.abs(angleDiff(p.facing, a)) > arc / 2 && d > e.radius + 18) continue;
      const crit = Math.random() < p.crit || p.critBuff > 0;
      let dmg = p.atk * mult * (1 + Math.max(0, p.combo - 1) * .055);
      if (p.dmgBuff > 0) dmg *= 1 + p.dmgBuff * .01;
      if (e.marked > 0 && this.unlockedSkills.includes('marca')) dmg *= 1.25;
      if (crit) dmg *= 1.75;
      dmg *= .9 + Math.random() * .2;
      this.damageEnemy(e, dmg, { crit, element: ITEMS[this.equipment?.weapon]?.element || 'fisico' });
      hit = true;
    }
    for (const c of this.creatures) {
      if (c.captured || c.dead) continue;
      const d = dist(c.x, c.y, p.x, p.y);
      if (d > radius + 18) continue;
      const a = Math.atan2(c.y - p.y, c.x - p.x);
      if (Math.abs(angleDiff(p.facing, a)) > arc / 2) continue;
      this.damageCreature(c, p.atk * mult * .55);
      hit = true;
    }
    if (hit) { this.shake = Math.max(this.shake, opts.third ? 4 : 2); }
  },

  dodge() {
    const p = this.player;
    if (!p || p.dead || this.capture) return;
    if (p.state === 'dodge' || p.state === 'hurt') return;
    if (p.stamina < 16) { this.ui?.toast?.('Sin aguante para esquivar', 'danger'); return; }
    p.stamina -= 16;
    const dir = this.movement.len > .15 ? { x: this.movement.x, y: this.movement.y } : { x: Math.cos(p.facing), y: Math.sin(p.facing) };
    const len = Math.hypot(dir.x, dir.y) || 1;
    p.dodgeDir = { x: dir.x / len, y: dir.y / len };
    p.facing = Math.atan2(p.dodgeDir.y, p.dodgeDir.x);
    p.state = 'dodge'; p.stateT = 0; p.stateDur = .26; p.invuln = Math.max(p.invuln, .34);
    p.blocking = false;

    // esquiva perfecta: un ataque ya está en marcha o un proyectil está encima
    const danger = this.enemies.some(e => !e.dead && e.telegraph && dist(e.x, e.y, p.x, p.y) < 190) ||
      this.projectiles.some(pr => pr.from === 'enemy' && dist(pr.x, pr.y, p.x, p.y) < 95);
    if (danger) {
      p.critBuff = 3;
      p.stamina = Math.min(p.maxStamina, p.stamina + 14);
      this.effects.push({ kind: 'ring', x: p.x, y: p.y, r0: 8, r1: 90, color: '#9fdfee', width: 2, life: .45, max: .45 });
      this.floatText(p.x, p.y - 72, 'ESQUIVA PERFECTA', '#9fdfee');
      audio.sfx?.('perfect');
      if (this.classId === 'velo' || this.unlockedSkills.includes('contragolpe')) this.shockwave(90, 150, '#9fdfee');
    } else {
      audio.sfx?.('dodge');
    }
  },

  shockwave(power, radius = 140, color = '#f2d98e') {
    const p = this.player;
    this.effects.push({ kind: 'ring', x: p.x, y: p.y, r0: 10, r1: radius, color, width: 4, life: .55, max: .55, squash: .6 });
    for (const e of this.enemies) {
      if (e.dead) continue;
      if (dist(e.x, e.y, p.x, p.y) < radius + e.radius) this.damageEnemy(e, power * p.power, { element: 'celestial' });
    }
    audio.sfx?.('burst');
  },

  castSkill(slot) {
    const p = this.player;
    if (!p || p.dead || this.capture) return;
    const id = this.activeSkillSlots[slot];
    if (!id) { this.ui?.toast?.('Ranura vacía. Asigna un talento en el menú.'); return; }
    const sk = SKILLS[id];
    if (!sk || sk.type !== 'active') return;
    if ((this.cooldowns[id] || 0) > 0) { this.ui?.toast?.('Todavía no está listo'); return; }
    if (p.mp < sk.mana) { this.ui?.toast?.('Maná insuficiente', 'danger'); return; }
    p.mp -= sk.mana;
    this.cooldowns[id] = sk.cooldown;
    audio.sfx?.('skill');
    const aim = this.aimPoint();
    switch (id) {
      case 'tajo_arcano': {
        const angle = Math.atan2(aim.y - p.y, aim.x - p.x);
        this.effects.push({ kind: 'beam', x: p.x, y: p.y - 30, angle, length: 260, width: 26, color: '#ffe6a8', life: .35, max: .35 });
        for (const e of this.enemies) {
          if (e.dead) continue;
          const d = dist(e.x, e.y, p.x, p.y);
          const a = Math.atan2(e.y - p.y, e.x - p.x);
          if (d < 300 && Math.abs(angleDiff(angle, a)) < .42) {
            this.damageEnemy(e, p.atk * 1.4 * p.power, { element: 'celestial', crit: false });
            e.marked = 4;
          }
        }
        this.spawnBurst(p.x + Math.cos(angle) * 70, p.y - 30 + Math.sin(angle) * 70, '#ffe6a8', 18, 130);
        audio.sfx?.('holy');
        break;
      }
      case 'juicio': {
        const target = this.nearestEnemy(aim.x, aim.y, 260) || aim;
        this.effects.push({ kind: 'column', x: target.x, y: target.y, color: '#f2d98e', life: 1.1, max: 1.1 });
        this.effects.push({ kind: 'ring', x: target.x, y: target.y, r0: 20, r1: 180, color: '#f2d98e', width: 5, life: .7, max: .7 });
        this.spawnBurst(target.x, target.y - 20, '#f2d98e', 30, 190);
        for (const e of this.enemies) {
          if (e.dead) continue;
          if (dist(e.x, e.y, target.x, target.y) < 165 + e.radius) {
            this.damageEnemy(e, p.atk * 3.2 * p.power, { element: 'celestial', crit: false });
            e.slowT = Math.max(e.slowT || 0, 3);
            if (!e.data.boss) { e.state = 'hurt'; e.stateT = Math.max(e.stateT, .5); }
          }
        }
        this.shake = Math.max(this.shake, 10);
        audio.sfx?.('holy');
        break;
      }
      case 'aliento': {
        const heal = p.maxHp * .3;
        p.hp = Math.min(p.maxHp, p.hp + heal);
        p.burning = 0;
        this.floatText(p.x, p.y - 70, `+${Math.round(heal)}`, '#8fd0b3');
        this.effects.push({ kind: 'ring', x: p.x, y: p.y, r0: 10, r1: 100, color: '#8fd0b3', width: 3, life: .7, max: .7 });
        if (this.ally) this.ally.hp = Math.min(this.ally.maxHp, this.ally.hp + this.ally.maxHp * .45);
        audio.sfx?.('heal');
        break;
      }
      case 'paso_velo': {
        const angle = Math.atan2(aim.y - p.y, aim.x - p.x);
        const oldX = p.x, oldY = p.y;
        let nx = p.x + Math.cos(angle) * 160, ny = p.y + Math.sin(angle) * 160;
        if (!this.world.isBlocked(nx, ny, p.radius)) { p.x = nx; p.y = ny; }
        p.invuln = Math.max(p.invuln, .6);
        for (const e of this.enemies) {
          if (e.dead) continue;
          if (dist(e.x, e.y, oldX, oldY) < 85 || dist(e.x, e.y, p.x, p.y) < 85) this.damageEnemy(e, p.atk * 1.5 * p.power, { element: 'sombra' });
        }
        for (let i = 0; i < 3; i++) {
          this.effects.push({ kind: 'afterimage', x: oldX + (p.x - oldX) * i / 3, y: oldY + (p.y - oldY) * i / 3, color: '#b58fd0', life: .5, max: .5 });
        }
        this.effects.push({ kind: 'ring', x: p.x, y: p.y, r0: 10, r1: 90, color: '#b58fd0', width: 3, life: .5, max: .5 });
        audio.sfx?.('dodge');
        break;
      }
      default: break;
    }
    this.ui?.refreshSkillWheel?.();
  },

  aimPoint() {
    const p = this.player;
    const near = this.nearestEnemy(p.x, p.y, 420);
    if (near) return { x: near.x, y: near.y };
    return { x: p.x + Math.cos(p.facing) * 180, y: p.y + Math.sin(p.facing) * 180 };
  },

  nearestEnemy(x, y, max = 99999) {
    let best = null, bd = max;
    for (const e of this.enemies) {
      if (e.dead) continue;
      const d = dist(x, y, e.x, e.y);
      if (d < bd) { bd = d; best = e; }
    }
    return best;
  },

  // ───────────────────────── daño ─────────────────────────
  damageEnemy(e, raw, opts = {}) {
    if (!e || e.dead) return;
    const dmg = Math.max(1, Math.round(raw));
    e.hp -= dmg;
    e.flash = .12;
    e.hurtT = .18;
    e.aggro = true;
    if (!e.data.boss) { e.state = 'hurt'; e.stateT = Math.max(e.stateT, .16); }
    if (e.marked > 0) e.marked = Math.max(0, e.marked);
    this.floatText(e.x, e.y - (e.data.boss ? 92 : 62), String(dmg), opts.crit ? '#ffcf70' : '#f4e4c8', opts.crit);
    audio.sfx?.(opts.crit ? 'crit' : 'hit');
    if (opts.element && elemColor[opts.element] && Math.random() < .35) {
      this.spawnBurst(e.x, e.y - 26, elemColor[opts.element], 5, 70);
    }
    if (e.hp <= 0) this.killEnemy(e);
  },

  killEnemy(e) {
    if (e.dead) return;
    e.dead = true; e.hp = 0; e.state = 'dead';
    this.effects.push({ kind: 'ring', x: e.x, y: e.y, r0: 10, r1: e.data.boss ? 170 : 55, color: e.data.accent || '#e8c37a', width: e.data.boss ? 5 : 2, life: .7, max: .7 });
    this.spawnBurst(e.x, e.y - 30, e.data.accent || '#e8c37a', e.data.boss ? 46 : 14, e.data.boss ? 240 : 110);
    this.addXp(e.data.xp * (e.elite ? 1.65 : 1));
    this.addShards(e.data.shards * (e.elite ? 1.8 : 1));
    if (!e.data.boss && Math.random() < .16) {
      const pool = this.regionId === 'valdoria' ? ['vial_savia', 'esquirra_hierro', 'pan_viaje'] :
        this.regionId === 'drakmor' ? ['ceniza_viva', 'vial_savia', 'bomba_solar'] : ['cristal_astral', 'esencia_azul', 'incienso'];
      const item = pool[Math.floor(Math.random() * pool.length)];
      if (ITEMS[item]) this.addInventory(item, 1);
    }
    this.questEvent('kill', e.type);
    if (e.data.boss) {
      this.flags['boss_defeated_' + e.type] = true;
      this.boss = null;
      this.bossActive = false;
      this.ui?.hideBoss?.();
      audio.setBattle?.(false);
      this._battleOn = false;
      onBossDefeated(this, e);
      this.autoSave();
    }
    this.refreshQuestTarget();
  },

  damageCreature(c, raw) {
    if (!c || c.captured || c.dead) return;
    if (c.capturable) return;
    const dmg = Math.max(1, Math.round(raw * .55));
    c.hp -= dmg;
    c.flash = .12;
    this.floatText(c.x, c.y - 58, String(dmg), '#d8ead0');
    audio.sfx?.('hit');
    if (c.hp <= c.maxHp * .42) {
      c.hp = Math.max(1, Math.round(c.maxHp * .42));
      c.capturable = true;
      c.state = 'capturable';
      this.ui?.toast?.(`${c.data.name} está listo para resonar`, 'gold');
      audio.sfx?.('resonance');
      this.effects.push({ kind: 'ring', x: c.x, y: c.y, r0: 8, r1: 70, color: '#e8c37a', width: 2, life: .8, max: .8 });
    }
  },

  damagePlayer(amount, source, opts = {}) {
    const p = this.player;
    if (!p || p.dead || p.invuln > 0) return;
    if (p.state === 'dodge' && !opts.trueDamage) return;
    let dmg = amount;
    let perfect = false;
    let blocked = false;
    if (!opts.trueDamage && p.blocking && p.stamina > 0) {
      const srcAngle = source && source.x != null ? Math.atan2(source.y - p.y, source.x - p.x) : p.facing;
      if (Math.abs(angleDiff(p.facing, srcAngle)) < 1.3) {
        blocked = true;
        if (p.blockT < .2) {
          perfect = true;
          dmg = 0;
          p.stamina = Math.min(p.maxStamina, p.stamina + 10);
          this.floatText(p.x, p.y - 72, 'BLOQUEO PERFECTO', '#f2d98e');
          if (this.classId === 'guardian') p.stamina = Math.min(p.maxStamina, p.stamina + 10);
          if (this.unlockedSkills.includes('contragolpe')) this.shockwave(90, 150, '#f2d98e');
          audio.sfx?.('perfect');
        } else {
          dmg *= .28;
          p.stamina = Math.max(0, p.stamina - amount * 1.5);
          audio.sfx?.('block');
          if (p.stamina <= 0) { p.state = 'hurt'; p.stateT = 0; p.stateDur = .5; p.blocking = false; }
        }
      }
    }
    if (dmg > 0 && !opts.trueDamage) {
      const s = p.stats;
      dmg *= 100 / (100 + (p.defense || 0) * 2.4);
      dmg *= DIFFICULTY[this.difficulty]?.dmgTaken || 1;
    }
    dmg = Math.max(perfect ? 0 : 1, Math.round(dmg));
    if (dmg > 0 && p.shield > 0) {
      const absorbed = Math.min(p.shield, dmg);
      p.shield -= absorbed; dmg -= absorbed;
      this.floatText(p.x, p.y - 64, `-${absorbed} escudo`, '#9fdfee');
    }
    if (dmg > 0) {
      p.hp -= dmg;
      p.hurtT = .28;
      p.lastHurt = this.time;
      p.invuln = .62;
      if (!blocked) { p.state = 'hurt'; p.stateT = 0; p.stateDur = .25; p.blocking = false; }
      this.floatText(p.x, p.y - 70, `-${dmg}`, '#ff8e84');
      this.spawnBurst(p.x, p.y - 28, '#b8463f', 8, 80);
      this.shake = Math.max(this.shake, 6);
      audio.sfx?.('hurt');
      this.ui?.flashDamage?.();
    }
    if (p.hp <= 0) { p.hp = 0; this.playerDied(); }
  },

  // ───────────────────────── IA enemiga ─────────────────────────
  updateEnemies(dt) {
    const p = this.player;
    let anyAggro = false, anyBattle = false;
    for (const e of this.enemies) {
      if (e.dead) continue;
      e.flash = Math.max(0, e.flash - dt);
      e.hurtT = Math.max(0, e.hurtT - dt);
      e.slowT = Math.max(0, (e.slowT || 0) - dt);
      e.marked = Math.max(0, (e.marked || 0) - dt);
      if (e.burn > 0) {
        e.burn -= dt;
        e._burnTick = (e._burnTick || 0) + dt;
        if (e._burnTick > .65) { e._burnTick = 0; this.damageEnemy(e, 5 + this.level, { element: 'fuego' }); }
      }
      const d = dist(e.x, e.y, p.x, p.y);
      if (d > 1600) continue;
      if (!e.aggro && d < (e.data.aggro || 300)) e.aggro = true;
      if (!e.aggro) { this.enemyPatrol(e, dt); continue; }
      if (d > 1150) { e.aggro = false; continue; }
      anyAggro = true;
      if (d < 900 || e.data.boss) anyBattle = true;
      if (e.data.boss && e.phase === 1 && e.hp < e.maxHp * .5 && e.data.phases >= 2) {
        e.phase = 2;
        e.speed *= 1.12;
        this.effects.push({ kind: 'ring', x: e.x, y: e.y, r0: 10, r1: 220, color: e.data.accent, width: 5, life: .8, max: .8 });
        this.shake = Math.max(this.shake, 9);
        this.ui?.subtitle?.(`${e.data.name} cambia de fase`, 2.6);
        audio.sfx?.('boss');
      }
      if (e.state === 'hurt') {
        e.stateT -= dt;
        if (e.stateT <= 0) { e.state = 'chase'; e.stateT = 0; }
        continue;
      }
      if (e.state === 'windup') {
        e.stateT -= dt;
        if (e.telegraph) e.telegraph.t = Math.min(e.telegraph.max, e.telegraph.t + dt);
        if (d < (e.data.range || 70) + 700) {
          const a = Math.atan2(p.y - e.y, p.x - e.x);
          e.facing = a;
        }
        if (e.stateT <= 0) this.executeEnemyAttack(e);
        continue;
      }
      if (e.state === 'recover') {
        e.stateT -= dt;
        if (e.stateT <= 0) { e.state = 'chase'; e.telegraph = null; }
        continue;
      }
      if (e.state === 'dash') {
        e.stateT -= dt;
        const sp = e.data.speed * (e.data.boss ? 3.3 : 3.8);
        this.tryMove(e, e.dashDir.x * sp * dt, e.dashDir.y * sp * dt);
        if (!e.didHit && dist(e.x, e.y, p.x, p.y) < e.radius + 34) {
          e.didHit = true;
          this.damagePlayer(e.dmg * (e.data.boss ? 1.1 : 1), e);
          this.spawnBurst(p.x, p.y - 30, '#e8c37a', 10, 90);
        }
        if (e.stateT <= 0) { e.state = 'recover'; e.stateT = .4; e.attackCd = e.data.cooldown; }
        continue;
      }
      if (e.hurtT > 0) continue;
      if (e.attackCd > 0) e.attackCd -= dt;

      if (e.data.boss) { this.bossAI(e, d, dt); continue; }

      const kind = e.data.behavior;
      const range = e.data.range || 60;
      if (kind === 'ranged') {
        if (d > 250) this.chase(e, p, dt, 1);
        else if (d < 130) this.chase(e, p, dt, -0.85);
        else {
          const a = Math.atan2(p.y - e.y, p.x - e.x) + Math.PI / 2;
          this.tryMove(e, Math.cos(a) * e.speed * .35 * dt, Math.sin(a) * e.speed * .35 * dt);
          e.facing = Math.atan2(p.y - e.y, p.x - e.x);
        }
        if (e.attackCd <= 0 && d < 360) this.startEnemyWindup(e, 'ranged', .55);
      } else if (kind === 'charge' || kind === 'lunge') {
        if (d > range + 50 || e.attackCd > 0) this.chase(e, p, dt, 1);
        if (e.attackCd <= 0 && d < (kind === 'charge' ? 300 : 190)) this.startEnemyWindup(e, kind, kind === 'charge' ? .55 : .38);
      } else {
        if (d > range) this.chase(e, p, dt, 1);
        if (e.attackCd <= 0 && d <= range + 26) this.startEnemyWindup(e, 'melee', .4);
      }
    }
    if (anyBattle !== this._battleOn) {
      audio.setBattle?.(anyBattle);
      this._battleOn = anyBattle;
    }
  },

  enemyPatrol(e, dt) {
    if (e.data.boss) return;
    e.patrolT = (e.patrolT || 0) - dt;
    if (e.patrolT <= 0) {
      e.patrolT = 2 + Math.random() * 4;
      e.patrolDir = Math.random() * TAU;
    }
    if (e.patrolDir == null) return;
    const hx = e.homeX, hy = e.homeY;
    const d = dist(e.x, e.y, hx, hy);
    if (d > 130) {
      const a = Math.atan2(hy - e.y, hx - e.x);
      this.tryMove(e, Math.cos(a) * e.speed * .28 * dt, Math.sin(a) * e.speed * .28 * dt);
      e.facing = a;
    } else {
      this.tryMove(e, Math.cos(e.patrolDir) * e.speed * .24 * dt, Math.sin(e.patrolDir) * e.speed * .24 * dt);
      e.facing = e.patrolDir;
    }
    e.state = 'patrol';
    e.walkPhase += dt * 2;
  },

  chase(e, target, dt, sign = 1) {
    const a = Math.atan2(target.y - e.y, target.x - e.x);
    const sp = e.speed * (e.slowT > 0 ? .5 : 1) * sign;
    this.tryMove(e, Math.cos(a) * sp * dt, Math.sin(a) * sp * dt);
    e.facing = a;
    e.state = 'chase';
    e.walkPhase += dt * 5;
  },

  startEnemyWindup(e, kind, time) {
    e.attackKind = kind;
    e.state = 'windup';
    e.stateT = time;
    e.didHit = false;
    const p = this.player;
    e.facing = Math.atan2(p.y - e.y, p.x - e.x);
    if (kind === 'melee') {
      e.telegraph = { type: 'arc', angle: e.facing, arc: 1.8, r: (e.data.range || 60) + 32, t: 0, max: time };
    } else if (kind === 'charge' || kind === 'lunge') {
      e.telegraph = { type: 'line', angle: e.facing, r: kind === 'charge' ? 290 : 170, w: 30, t: 0, max: time };
    } else if (kind === 'ranged') {
      e.telegraph = { type: 'line', angle: e.facing, r: 340, w: 10, t: 0, max: time };
    }
    audio.sfx?.(e.data.boss ? 'boss_telegraph' : 'enemy_windup');
  },

  executeEnemyAttack(e) {
    const p = this.player;
    const kind = e.attackKind;
    e.telegraph = null;
    if (!p || p.dead) { e.state = 'chase'; return; }
    if (kind === 'melee') {
      this.effects.push({ kind: 'slash', x: e.x + Math.cos(e.facing) * 20, y: e.y - 24, angle: e.facing, radius: (e.data.range || 60) + 30, color: e.data.accent || '#ffb4a0', width: 3, life: .25, max: .25 });
      if (dist(e.x, e.y, p.x, p.y) < (e.data.range || 60) + 42) this.damagePlayer(e.dmg, e);
      e.state = 'recover'; e.stateT = .38; e.attackCd = e.data.cooldown;
      audio.sfx?.('enemy_swing');
    } else if (kind === 'ranged') {
      const a = Math.atan2(p.y - p.y + (p.y - e.y), p.x - e.x);
      const ang = Math.atan2(p.y - e.y, p.x - e.x);
      this.spawnProjectile({ x: e.x, y: e.y - 34, angle: ang, speed: 300, damage: e.dmg, color: elemColor[e.data.element] || '#a382c4', kind: e.data.projectile || 'orb', from: 'enemy', owner: e });
      e.state = 'recover'; e.stateT = .45; e.attackCd = e.data.cooldown;
      audio.sfx?.('cast');
    } else if (kind === 'lunge' || kind === 'charge') {
      e.state = 'dash';
      e.stateT = kind === 'charge' ? .38 : .26;
      e.dashDir = { x: Math.cos(e.facing), y: Math.sin(e.facing) };
      e.didHit = false;
      this.effects.push({ kind: 'ring', x: e.x, y: e.y, r0: 8, r1: 50, color: e.data.accent, width: 2, life: .3, max: .3 });
      audio.sfx?.('dash');
    } else if (kind === 'slam') {
      const sx = e.slamX, sy = e.slamY;
      this.effects.push({ kind: 'ring', x: sx, y: sy, r0: 20, r1: e.slamRadius || 120, color: e.data.accent, width: 5, life: .6, max: .6 });
      this.spawnBurst(sx, sy, e.data.accent, 26, 180);
      this.shake = Math.max(this.shake, 10);
      if (dist(p.x, p.y, sx, sy) < (e.slamRadius || 120) + p.radius) this.damagePlayer(e.dmg * 1.35, e);
      e.state = 'recover'; e.stateT = .5; e.attackCd = e.data.cooldown;
      audio.sfx?.('slam');
    } else if (kind === 'volley') {
      const base = Math.atan2(p.y - e.y, p.x - e.x);
      const n = e.phase > 1 ? 7 : 5;
      for (let i = 0; i < n; i++) {
        const ang = base + (i - (n - 1) / 2) * .16;
        this.spawnProjectile({ x: e.x, y: e.y - 38, angle: ang, speed: 260, damage: e.dmg * .8, color: e.data.accent || '#a382c4', kind: 'orb', from: 'enemy', owner: e, trail: true });
      }
      e.state = 'recover'; e.stateT = .55; e.attackCd = e.data.cooldown * 1.1;
      audio.sfx?.('cast');
    } else {
      e.state = 'chase';
      e.attackCd = e.data.cooldown;
    }
  },

  bossAI(e, d, dt) {
    const p = this.player;
    const range = e.data.range || 90;
    if (e.attackCd > 0) {
      if (d > range + 40) this.chase(e, p, dt, 1);
      else {
        const a = Math.atan2(p.y - e.y, p.x - e.x) + Math.PI / 2;
        this.tryMove(e, Math.cos(a) * e.speed * .34 * dt, Math.sin(a) * e.speed * .34 * dt);
        e.facing = Math.atan2(p.y - e.y, p.x - e.x);
      }
      return;
    }
    const roll = Math.random();
    const finalBoss = e.data.final;
    const phase = e.phase;
    if (finalBoss && phase >= 2 && roll < .22) {
      // invoca fragmentos del Velo
      e.pattern = 'slam';
      this.startBossWindup(e, 'slam', .9);
    } else if ((roll < .34 || (finalBoss && phase >= 2)) && d < 330) {
      this.startBossWindup(e, 'volley', .7);
    } else if (roll < .62) {
      this.startBossWindup(e, 'dash', .58);
    } else {
      this.startBossWindup(e, 'slam', 1);
    }
  },

  startBossWindup(e, kind, time) {
    const p = this.player;
    e.state = 'windup';
    e.stateT = time;
    e.attackKind = kind;
    e.didHit = false;
    if (kind === 'slam') {
      e.slamX = p.x; e.slamY = p.y;
      e.slamRadius = e.data.final ? 150 : 120;
      e.telegraph = { type: 'circle', x: p.x, y: p.y, r: e.slamRadius, t: 0, max: time };
      e.facing = Math.atan2(p.y - e.y, p.x - e.x);
    } else if (kind === 'volley') {
      e.telegraph = { type: 'circle', x: e.x, y: e.y, r: 70, t: 0, max: time };
      e.facing = Math.atan2(p.y - e.y, p.x - e.x);
    } else {
      e.facing = Math.atan2(p.y - e.y, p.x - e.x);
      e.telegraph = { type: 'line', angle: e.facing, r: 420, w: 44, t: 0, max: time };
    }
    audio.sfx?.('boss_telegraph');
  },

  // ───────────────────────── proyectiles ─────────────────────────
  spawnProjectile(opts) {
    const angle = opts.angle || 0;
    this.projectiles.push({
      x: opts.x, y: opts.y,
      vx: Math.cos(angle) * (opts.speed || 260),
      vy: Math.sin(angle) * (opts.speed || 260),
      r: opts.r || 8, damage: opts.damage || 8,
      color: opts.color || '#a382c4', kind: opts.kind || 'orb',
      from: opts.from || 'enemy', life: opts.life || 3,
      trail: opts.trail ?? true, owner: opts.owner || null
    });
  },

  updateProjectiles(dt) {
    const p = this.player;
    for (const pr of this.projectiles) {
      pr.life -= dt;
      pr.x += pr.vx * dt; pr.y += pr.vy * dt;
      if (this.world.isBlocked(pr.x, pr.y, 3)) { pr.life = 0; this.spawnBurst(pr.x, pr.y, pr.color, 5, 50); continue; }
      if (pr.from === 'enemy') {
        if (!p.dead && dist(pr.x, pr.y, p.x, p.y) < pr.r + p.radius + 6) {
          this.damagePlayer(pr.damage, { x: pr.x, y: pr.y });
          pr.life = 0;
          this.spawnBurst(pr.x, pr.y, pr.color, 8, 70);
        }
      } else {
        for (const e of this.enemies) {
          if (e.dead) continue;
          if (dist(pr.x, pr.y, e.x, e.y) < pr.r + e.radius + 4) {
            this.damageEnemy(e, pr.damage, { element: 'astral' });
            pr.life = 0;
            break;
          }
        }
      }
    }
    this.projectiles = this.projectiles.filter(pr => pr.life > 0);
  },

  // ───────────────────────── ecos ─────────────────────────
  nearestCreature(x, y, max = 160) {
    let best = null, bd = max;
    for (const c of this.creatures) {
      if (c.captured || c.dead) continue;
      const d = dist(x, y, c.x, c.y);
      if (d < bd) { bd = d; best = c; }
    }
    return best;
  },

  pressSummon() {
    if (!this.player || this.player.dead) return;
    if (this.capture) {
      const c = this.capture;
      const zone = c.zone || .1;
      const success = c.value >= .5 - zone && c.value <= .5 + zone;
      this.resolveCapture(success);
      return;
    }
    const wild = this.nearestCreature(this.player.x, this.player.y, 150);
    if (wild && wild.capturable) { this.startCapture(wild); return; }
    if (this.ally) { this.useAllyAbility(); return; }
    if (this.captured.length) {
      const species = this.activeCreature || this.captured[0];
      this.summonCreature(species);
      return;
    }
    this.ui?.toast?.('Debilita a un eco salvaje y pulsa Resonar cerca de él.');
  },

  startCapture(c) {
    const hasIncense = this.itemCount('incienso') > 0;
    let zone = .085;
    if (hasIncense) { this.removeInventory('incienso', 1); zone = .16; this.ui?.toast?.('El incienso ensancha la zona perfecta', 'gold'); }
    this.capture = { creature: c, t: 0, speed: 2.35, value: 0, zone, species: c.species };
    c.state = 'capturable';
    audio.sfx?.('resonance');
    this.ui?.startCaptureOverlay?.(c);
  },

  resolveCapture(success) {
    const c = this.capture?.creature;
    this.capture = null;
    this.ui?.endCaptureOverlay?.(success);
    if (!c) return;
    c.resonance = 0;
    if (success) {
      c.captured = true;
      if (!this.captured.includes(c.species)) this.captured.push(c.species);
      if (!this.activeCreature) this.activeCreature = c.species;
      this.addInventory('esencia_eco', 1);
      if (this.unlockedSkills.includes('pacto') && !this.flags['bond_' + c.species]) {
        this.flags['bond_' + c.species] = true;
        this.alloc.suerte = (this.alloc.suerte || 0) + 1;
        this.recomputeStats(true);
      }
      this.questEvent('capture');
      audio.sfx?.('capture');
      this.spawnBurst(c.x, c.y - 30, c.data.accent, 36, 150);
      this.effects.push({ kind: 'ring', x: c.x, y: c.y, r0: 6, r1: 120, color: '#e8c37a', width: 4, life: 1, max: 1 });
      this.floatText(c.x, c.y - 74, 'VÍNCULO', '#f2d98e');
      this.ui?.toast?.(`Has vinculado a ${c.data.name}`, 'gold');
      this.autoSave();
    } else {
      c.capturable = false;
      c.hp = c.maxHp;
      c.enraged = 5;
      c.state = 'flee';
      audio.sfx?.('fail');
      this.ui?.toast?.('La resonancia se rompió. El eco ha huido.', 'danger');
    }
  },

  summonCreature(species) {
    const data = CREATURES[species];
    if (!data) return;
    const p = this.player;
    const duration = (this.classId === 'vinculo' ? 32 : 24) + p.stats.inteligencia * .6;
    this.ally = {
      species, data, x: p.x - 38, y: p.y + 18, hp: data.hp + this.level * 6,
      maxHp: data.hp + this.level * 6, facing: p.facing, scale: (data.size || 1) * 1.05,
      seed: Math.random() * 10, state: 'follow', attackCd: .5, duration, maxDuration: duration,
      abilityCd: 2, dead: false
    };
    this.activeCreature = species;
    if (this.unlockedSkills.includes('pacto')) p.shield = Math.max(p.shield, 40);
    this.effects.push({ kind: 'ring', x: p.x, y: p.y, r0: 8, r1: 80, color: data.accent, width: 3, life: .6, max: .6 });
    this.spawnBurst(p.x, p.y - 20, data.accent, 18, 90);
    audio.sfx?.('summon');
    this.ui?.toast?.(`${data.name} acude a tu llamada`, 'gold');
    this.autoSave();
  },

  useAllyAbility() {
    const a = this.ally;
    if (!a || a.dead) return;
    if (a.abilityCd > 0) { this.ui?.toast?.(`${a.data.ability.name} recargando`); return; }
    const ab = a.data.ability;
    const p = this.player;
    a.abilityCd = ab.cooldown;
    switch (ab.type) {
      case 'heal': {
        const amt = p.maxHp * (ab.power / 100);
        p.hp = Math.min(p.maxHp, p.hp + amt);
        this.floatText(p.x, p.y - 72, `+${Math.round(amt)}`, '#8fd0b3');
        break;
      }
      case 'shield': {
        p.shield = Math.max(p.shield, ab.power);
        this.effects.push({ kind: 'ring', x: p.x, y: p.y, r0: 10, r1: 80, color: '#9fdfee', width: 3, life: .6, max: .6 });
        break;
      }
      case 'dash': {
        const target = this.nearestEnemy(p.x, p.y, 360);
        const ang = target ? Math.atan2(target.y - p.y, target.x - p.x) : p.facing;
        for (let i = 0; i < 3; i++) this.spawnProjectile({ x: a.x, y: a.y - 24, angle: ang, speed: 520, damage: ab.power * p.power, color: a.data.accent, kind: 'arrow', from: 'player', trail: true, r: 7 });
        if (target) this.damageEnemy(target, ab.power * p.power, { element: a.data.element });
        break;
      }
      case 'burn': {
        for (const e of this.enemies) {
          if (e.dead) continue;
          if (dist(e.x, e.y, p.x, p.y) < 240) { this.damageEnemy(e, ab.power * .45, { element: 'fuego' }); e.burn = 5; }
        }
        this.effects.push({ kind: 'ring', x: p.x, y: p.y, r0: 12, r1: 240, color: '#ff8a4a', width: 4, life: .8, max: .8 });
        break;
      }
      case 'ranged': {
        const target = this.nearestEnemy(p.x, p.y, 500);
        const ang = target ? Math.atan2(target.y - a.y, target.x - a.x) : a.facing;
        for (let i = 0; i < 3; i++) this.spawnProjectile({ x: a.x, y: a.y - 26, angle: ang + (i - 1) * .12, speed: 340, damage: ab.power, color: a.data.accent, kind: 'orb', from: 'player', trail: true, r: 7 });
        break;
      }
      case 'buff': {
        p.dmgBuff = 6;
        for (const e of this.enemies) if (!e.dead && dist(e.x, e.y, p.x, p.y) < 260) e.slowT = Math.max(e.slowT || 0, 6);
        this.effects.push({ kind: 'ring', x: p.x, y: p.y, r0: 8, r1: 160, color: '#d9c8ff', width: 3, life: .6, max: .6 });
        break;
      }
      default: break;
    }
    audio.sfx?.('eco_power');
    this.ui?.toast?.(`${a.data.name}: ${ab.name}`, 'gold');
  },

  updateAlly(dt) {
    const a = this.ally;
    if (!a) return;
    const p = this.player;
    a.duration -= dt;
    a.abilityCd = Math.max(0, a.abilityCd - dt);
    a.attackCd = Math.max(0, a.attackCd - dt);
    if (a.duration <= 0) {
      this.spawnBurst(a.x, a.y - 20, a.data.accent, 14, 80);
      this.ally = null;
      this.ui?.toast?.(`${a.data.name} regresa a tu memoria`);
      return;
    }
    const target = this.nearestEnemy(a.x, a.y, 420);
    if (target) {
      const d = dist(a.x, a.y, target.x, target.y);
      const ang = Math.atan2(target.y - a.y, target.x - a.x);
      a.facing = ang;
      if (d > 110) {
        this.tryMove(a, Math.cos(ang) * (a.data.speed * .8) * dt, Math.sin(ang) * (a.data.speed * .8) * dt);
      } else if (a.attackCd <= 0) {
        a.attackCd = 1.25;
        const mult = this.unlockedSkills.includes('vinculo') ? 1.2 : 1;
        if (a.data.element === 'astral' || a.data.element === 'celestial') {
          this.spawnProjectile({ x: a.x, y: a.y - 28, angle: ang, speed: 380, damage: a.data.dmg * p.power * mult, color: a.data.accent, kind: 'orb', from: 'player', trail: true, r: 6 });
        } else {
          this.damageEnemy(target, a.data.dmg * p.power * mult, { element: a.data.element });
          this.effects.push({ kind: 'slash', x: a.x + Math.cos(ang) * 16, y: a.y - 24, angle: ang, radius: 34, color: a.data.accent, width: 2, life: .22, max: .22 });
        }
      }
    } else {
      const d = dist(a.x, a.y, p.x, p.y);
      if (d > 76) {
        const ang = Math.atan2(p.y - a.y, p.x - a.x);
        this.tryMove(a, Math.cos(ang) * (a.data.speed * .95) * dt, Math.sin(ang) * (a.data.speed * .95) * dt);
        a.facing = ang;
      }
    }
    a.walkPhase = (a.walkPhase || 0) + dt * 4;
  }
};
