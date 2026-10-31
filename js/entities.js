/* ==========================================================================
   ENTITIES — player, enemies, wild creatures, projectiles, hazards, particles.
   ========================================================================== */

import { ENEMIES, ITEMS, CREATURES, ELEMENTS, creatureXpForLevel } from './data.js';
import { T } from './world.js';
import { drawCreature } from './render.js';
import { audio } from './audio.js';

const DIRS = {
  down: { x: 0, y: 1 }, up: { x: 0, y: -1 }, left: { x: -1, y: 0 }, right: { x: 1, y: 0 },
};
export function dirVec(facing) { return DIRS[facing] || DIRS.down; }
function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
function angleDiff(a, b) {
  let d = a - b;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return Math.abs(d);
}

/* -------------------------------------------------------------------------- */
/* Player                                                                     */
/* -------------------------------------------------------------------------- */
export class Player {
  constructor(game, state) {
    this.game = game;
    this.state = state;
    this.x = 19.5 * T; this.y = 16.5 * T;
    this.radius = 13;
    this.facing = 'down';
    this.walkPhase = 0;
    this.moving = false;
    this.attackTime = 0;
    this.attackDur = .3;
    this.attackCd = 0;
    this.combo = 0;
    this.comboTimer = 0;
    this.hitApplied = true;
    this.dodgeTime = 0;
    this.dodgeCd = 0;
    this.dodgeDir = { x: 0, y: 1 };
    this.invuln = 0;
    this.hurtTimer = 0;
    this.blocking = false;
    this.staminaDelay = 0;
    this.skillCd = {};
    this.attackBuff = 0;
    this.shieldTime = 0;
    this.shieldHp = 0;
    this.ghostCd = 0;
    this.creatureCd = 0;
    this.afterimages = [];
    this.manaDelay = 0;
    this.footstep = 0;
    this.buffPulse = 0;
  }

  get maxHp() { return this.game.derived.maxHp; }
  get maxMp() { return this.game.derived.maxMp; }
  get maxStamina() { return this.game.derived.maxStamina; }

  update(dt) {
    const g = this.game, input = g.input, st = this.state;
    const d = g.derived;
    // regen
    st.mp = Math.min(this.maxMp, st.mp + (2.2 + d.int * .06) * dt);
    if (this.staminaDelay > 0) this.staminaDelay -= dt;
    else st.stamina = Math.min(this.maxStamina, st.stamina + (18 + d.spd * .7) * dt);
    if (g.getActiveCreature()?.id === 'sylva') st.hp = Math.min(this.maxHp, st.hp + 1.1 * dt);
    st.hp = Math.min(st.hp, this.maxHp);
    st.mp = Math.min(st.mp, this.maxMp);

    // timers
    this.attackCd = Math.max(0, this.attackCd - dt);
    this.comboTimer = Math.max(0, this.comboTimer - dt);
    if (this.comboTimer <= 0) this.combo = 0;
    this.dodgeCd = Math.max(0, this.dodgeCd - dt);
    this.invuln = Math.max(0, this.invuln - dt);
    this.hurtTimer = Math.max(0, this.hurtTimer - dt);
    this.attackBuff = Math.max(0, this.attackBuff - dt);
    this.shieldTime = Math.max(0, this.shieldTime - dt);
    if (this.shieldTime <= 0) this.shieldHp = 0;
    this.ghostCd = Math.max(0, this.ghostCd - dt);
    this.buffPulse += dt;
    for (const k of Object.keys(this.skillCd)) this.skillCd[k] = Math.max(0, this.skillCd[k] - dt);

    // afterimages
    this.afterimages = this.afterimages.filter(a => (a.life -= dt) > 0);

    // menus / actions
    if (input.pressed('start')) { g.togglePause(); return; }
    if (input.pressed('select')) { g.toggleQuick(); return; }
    if (g.uiBlocking()) return;

    if (input.pressed('weapon')) g.cycleWeapon();
    if (input.pressed('creature')) g.cycleCreature();
    if (input.pressed('interact')) g.interact();
    if (g.mode !== 'playing') return;
    if (input.pressed('skill')) this.castSkill();

    // dodge
    if (input.pressed('dodge') && this.dodgeCd <= 0 && this.dodgeTime <= 0) {
      if (st.stamina >= 22) {
        const ax = input.axis.x, ay = input.axis.y;
        this.dodgeDir = Math.hypot(ax, ay) > .2 ? { x: ax, y: ay } : dirVec(this.facing);
        this.dodgeTime = .23;
        this.dodgeCd = .68;
        this.invuln = .34;
        st.stamina -= 22;
        this.staminaDelay = .45;
        audio.sfx('dodge');
        g.particles.push(...Particle.burst(this.x, this.y - 12, 7, '#9fe4ff', { speed: 90, size: 2.4, life: .4 }));
        for (let i = 0; i < 3; i++) this.afterimages.push({ x: this.x, y: this.y, facing: this.facing, life: .22 + i * .06, alpha: .22 });
      } else {
        g.toast('Sin resistencia para esquivar', 'bad');
      }
    }

    // block (hold dodge)
    const shield = g.getShield();
    this.blocking = !!shield && input.down('dodge') && this.dodgeTime <= 0 && st.stamina > 0 && !this.attackTime;
    if (this.blocking) {
      st.stamina = Math.max(0, st.stamina - 10 * dt);
      this.staminaDelay = .4;
      if (st.stamina <= 0) this.blocking = false;
    }

    // movement
    let mx = input.axis.x, my = input.axis.y;
    if (this.attackTime > 0) { mx *= .42; my *= .42; }
    if (this.blocking) { mx *= .35; my *= .35; }
    if (this.dodgeTime > 0) {
      this.dodgeTime -= dt;
      const sp = 520 * (0.8 + d.spd * .02);
      g.world.moveEntity(this, this.dodgeDir.x * sp * dt, this.dodgeDir.y * sp * dt, g.getAbilities());
      if (Math.random() < .5) this.afterimages.push({ x: this.x, y: this.y, facing: this.facing, life: .18, alpha: .18 });
      this.moving = true;
      this.walkPhase += dt * 14;
    } else {
      const len = Math.hypot(mx, my);
      if (len > .08) {
        const base = 188 * (0.78 + d.spd * .032);
        const buff = this.attackBuff > 0 ? 1.35 : 1;
        const mount = g.getActiveCreature()?.id === 'terron' ? 1.22 : 1;
        const sp = base * buff * mount * Math.min(1, len);
        const nx = mx / (len || 1), ny = my / (len || 1);
        g.world.moveEntity(this, nx * sp * dt, ny * sp * dt, g.getAbilities());
        this.moving = true;
        this.walkPhase += dt * 11;
        if (Math.abs(mx) > Math.abs(my)) this.facing = mx > 0 ? 'right' : 'left';
        else this.facing = my > 0 ? 'down' : 'up';
        this.footstep += dt;
        if (this.footstep > .32) this.footstep = 0;
      } else {
        this.moving = false;
      }
    }

    // attack
    if (input.pressed('attack') && this.attackCd <= 0 && this.dodgeTime <= 0 && !this.blocking) this.startAttack();
    if (this.attackTime > 0) {
      this.attackTime += dt;
      const p = this.attackTime / this.attackDur;
      if (!this.hitApplied && p >= .36) {
        this.hitApplied = true;
        g.performPlayerAttack(this);
      }
      if (p >= 1) { this.attackTime = 0; this.hitApplied = true; }
    }

    // creature assist
    this.creatureCd = Math.max(0, this.creatureCd - dt);
    if (this.creatureCd <= 0) {
      const c = g.getActiveCreature();
      if (c) {
        const target = g.findNearestEnemy(this.x, this.y, 300);
        if (target) {
          g.creatureAssist(c, target);
          const charm = c.charm ? ITEMS[c.charm]?.charm : null;
          this.creatureCd = Math.max(1.2, 3.1 - c.level * .05) * (1 - (charm?.haste || 0));
        } else this.creatureCd = .5;
      }
    }

    // sync
    st.hp = Math.max(0, Math.min(st.hp, this.maxHp));
    st.mp = Math.max(0, Math.min(st.mp, this.maxMp));
    st.stamina = Math.max(0, Math.min(st.stamina, this.maxStamina));
    st.x = this.x; st.y = this.y;
  }

  startAttack() {
    const g = this.game;
    const weapon = g.getWeapon();
    const w = weapon?.weapon || { kind: 'fist', dmg: 6, speed: 1, range: 58, arc: 1.5, crit: 0 };
    this.combo = this.comboTimer > 0 ? (this.combo % 3) + 1 : 1;
    this.comboTimer = .85;
    this.attackDur = Math.max(.18, .34 / (w.speed || 1));
    this.attackTime = .0001;
    this.hitApplied = false;
    this.attackCd = this.attackDur + .06 / (w.speed || 1);
    this.attackAngle = Math.atan2(dirVec(this.facing).y, dirVec(this.facing).x);
    audio.sfx(w.kind === 'greatsword' ? 'heavy' : 'attack');
    this.game.shake(w.kind === 'greatsword' ? 2.5 : 1.2, .08);
  }

  castSkill() {
    const g = this.game;
    const id = this.state.skills.active;
    const sk = g.skillDef(id);
    if (!sk) return;
    if (!this.state.skills.unlocked.includes(id)) { g.toast('Habilidad no desbloqueada', 'bad'); return; }
    if ((this.skillCd[id] || 0) > 0) { g.toast('Habilidad en recarga', 'bad'); return; }
    if (this.state.mp < sk.cost) { g.toast('Maná insuficiente', 'bad'); return; }
    this.state.mp -= sk.cost;
    this.skillCd[id] = sk.cooldown;
    g.castSkill(id);
  }

  takeDamage(amount, sourceX = null, sourceY = null, opts = {}) {
    const g = this.game;
    if (this.invuln > 0 || this.dodgeTime > 0 || this.state.hp <= 0) return 0;
    let dmg = amount;
    if (this.blocking) {
      dmg *= .26;
      this.state.stamina = Math.max(0, this.state.stamina - 12);
      this.staminaDelay = .5;
      audio.sfx('block');
      g.particles.push(...Particle.burst(this.x, this.y - 20, 6, '#ffe6a0', { speed: 70, size: 2, life: .3 }));
    }
    dmg = Math.max(1, Math.round(dmg - g.derived.def * .55));
    if (this.shieldHp > 0) {
      const absorbed = Math.min(this.shieldHp, dmg);
      this.shieldHp -= absorbed;
      dmg -= absorbed;
      if (dmg <= 0) { g.addDamage(this.x, this.y - 44, 'Barrera', '#7fe8ff', 12); return 0; }
    }
    this.state.hp -= dmg;
    this.invuln = .62;
    this.hurtTimer = .34;
    g.addDamage(this.x, this.y - 48, dmg, '#ff7d9d', 18);
    g.particles.push(...Particle.burst(this.x, this.y - 20, 10, '#ff7d9d', { speed: 120, size: 2.6, life: .5 }));
    g.shake(6, .18);
    g.hitstop(.055);
    g.input.rumble(.55, .35, 130);
    audio.sfx('hit');
    if (sourceX != null) {
      const ang = Math.atan2(this.y - sourceY, this.x - sourceX);
      g.world.moveEntity(this, Math.cos(ang) * 13, Math.sin(ang) * 13, g.getAbilities());
    }
    if (this.state.hp <= 0) {
      this.state.hp = 0;
      g.playerDown();
    }
    return dmg;
  }

  heal(n) {
    const before = this.state.hp;
    this.state.hp = Math.min(this.maxHp, this.state.hp + n);
    return Math.round(this.state.hp - before);
  }

  render(ctx) {
    const g = this.game;
    const weapon = g.getWeapon();
    const shield = g.getShield();
    const p = this.attackTime > 0 ? clamp(this.attackTime / this.attackDur, 0, 1) : 0;
    const creature = g.getActiveCreature();
    const el = creature ? ELEMENTS[CREATURES[creature.id].element] : null;
    // afterimages
    for (const a of this.afterimages) {
      ctx.save(); ctx.globalAlpha = a.alpha;
      drawPlayerVisual(ctx, g, this, a.x, a.y, a.facing, 0, 0, false, false, 0, null, null, this.game.time);
      ctx.restore();
    }
    drawPlayerVisual(ctx, g, this, this.x, this.y, this.facing, this.moving ? this.walkPhase : 0, p, this.blocking, this.hurtTimer, this.dodgeTime, weapon, shield, this.game.time, el?.color, this.invuln > 0 && Math.floor(this.game.time * 20) % 2 === 0);
    if (this.shieldTime > 0) {
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.strokeStyle = `rgba(127,232,255,${.4 + Math.sin(this.game.time * 6) * .15})`;
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.ellipse(this.x, this.y - 24, 26, 34, 0, 0, 6.28); ctx.stroke();
      ctx.restore();
    }
  }
}

function drawPlayerVisual(ctx, g, player, x, y, facing, walk, attack, block, hurt, dodge, weapon, shield, time, aura, blink = false) {
  ctx.save();
  if (blink) ctx.globalAlpha = .55;
  const app = player.state.appearance;
  const weaponDef = weapon?.weapon ? weapon.weapon : null;
  // draw shield if equipped
  ctx.save();
  // render humanoid
  const { drawHumanoid, resolveAppearance } = g.renderRef;
  drawHumanoid(ctx, {
    x, y, time, facing, walk: walk ? Math.sin(walk) : 0,
    attack, block: block ? 1 : 0, hurt, dodge: dodge > 0 ? 1 : 0,
    appearance: resolveAppearance(app),
    weapon: weaponDef ? { ...weaponDef } : null,
    shield: !!shield,
    shieldColor: '#6b4a2c', shieldTrim: '#e2c47a',
    armor: !!g.state.equipment.armor,
    armorColor: g.state.equipment.armor === 'armadura_celestial' ? '#f2d188' : '#9aa6ba',
    accessory: !!g.state.equipment.accessory,
    accessoryColor: g.state.equipment.accessory === 'talisman_suerte' ? '#ffd27a' : '#6fe8d4',
    aura: aura || null,
    cape: true,
  });
  ctx.restore();
  ctx.restore();
}

/* -------------------------------------------------------------------------- */
/* Enemies                                                                    */
/* -------------------------------------------------------------------------- */
export class Enemy {
  constructor(game, type, tx, ty, level = 1, id = null) {
    this.game = game;
    this.type = type;
    this.def = ENEMIES[type];
    this.id = id || `${type}_${Math.random().toString(36).slice(2, 8)}`;
    this.level = level || this.def.level || 1;
    this.x = tx * T; this.y = ty * T;
    this.home = { x: this.x, y: this.y };
    this.radius = this.def.radius;
    this.maxHp = Math.round(this.def.hp * (1 + (this.level - this.def.level) * .18));
    this.hp = this.maxHp;
    this.atk = this.def.atk * (1 + (this.level - this.def.level) * .14);
    this.defense = this.def.def;
    this.speed = this.def.speed;
    this.xp = Math.round(this.def.xp * (1 + (this.level - 1) * .1));
    this.gold = this.def.gold;
    this.state = 'idle';
    this.stateTimer = 1 + Math.random() * 2;
    this.attackTimer = 1 + Math.random();
    this.telegraph = 0;
    this.telegraphTotal = 0;
    this.attackAnim = 0;
    this.hurt = 0;
    this.dead = false;
    this.deathTimer = 0;
    this.facing = 1;
    this.patrol = { x: this.x, y: this.y };
    this.phase = 1;
    this.phaseFlash = 0;
    this.knock = { x: 0, y: 0 };
    this.wanderAngle = Math.random() * 6.28;
    this.boss = !!this.def.boss;
    this.aggro = false;
    this.specialCd = 2.5;
    this.summoned = false;
  }

  get alive() { return !this.dead && this.hp > 0; }

  update(dt, player) {
    const g = this.game;
    if (this.dead) { this.deathTimer -= dt; return; }
    this.hurt = Math.max(0, this.hurt - dt);
    this.attackAnim = Math.max(0, this.attackAnim - dt);
    this.phaseFlash = Math.max(0, this.phaseFlash - dt);
    this.specialCd = Math.max(0, this.specialCd - dt);
    this.attackTimer = Math.max(0, this.attackTimer - dt);
    const dx = player.x - this.x, dy = player.y - this.y;
    const dist = Math.hypot(dx, dy);
    const aggroR = this.def.aggro;
    if (dist < aggroR || this.aggro || this.boss) this.aggro = true;
    if (this.aggro && dist > aggroR * 2.4 && !this.boss) this.aggro = false;

    // knockback
    if (Math.abs(this.knock.x) > 1 || Math.abs(this.knock.y) > 1) {
      g.world.moveEntity(this, this.knock.x * dt, this.knock.y * dt, []);
      this.knock.x *= .86; this.knock.y *= .86;
    }

    if (!this.aggro) {
      this.stateTimer -= dt;
      if (this.stateTimer <= 0) {
        this.stateTimer = 1.5 + Math.random() * 3;
        this.wanderAngle = Math.random() * 6.28;
        this.patrol = { x: this.home.x + Math.cos(this.wanderAngle) * 70, y: this.home.y + Math.sin(this.wanderAngle) * 70 };
      }
      const px = this.patrol.x - this.x, py = this.patrol.y - this.y;
      const pd = Math.hypot(px, py);
      if (pd > 10) {
        g.world.moveEntity(this, px / pd * this.speed * .32 * dt, py / pd * this.speed * .32 * dt, []);
        if (Math.abs(px) > 2) this.facing = px > 0 ? 1 : -1;
      }
      return;
    }

    if (this.type === 'wraith') { this.updateWraith(dt, player, dist, dx, dy); return; }
    if (this.boss) { this.updateBoss(dt, player, dist, dx, dy); return; }

    const nx = dist > 0 ? dx / dist : 0, ny = dist > 0 ? dy / dist : 0;
    if (Math.abs(dx) > 2) this.facing = dx > 0 ? 1 : -1;

    if (this.telegraph > 0) {
      this.telegraph -= dt;
      if (this.telegraph <= 0) this.executeAttack(player, nx, ny);
      return;
    }

    if (this.state === 'attack') {
      this.stateTimer -= dt;
      if (this.type === 'wolf' || this.type === 'beetle') {
        // lunge movement
        g.world.moveEntity(this, this.lungeX * dt, this.lungeY * dt, []);
        if (dist < this.radius + player.radius + 8) {
          player.takeDamage(this.atk * (this.type === 'beetle' ? 1.05 : .9), this.x, this.y);
          if (this.type === 'beetle') {
            this.attackTimer = 1.35;
            g.shake(3, .12);
          }
        }
      }
      if (this.stateTimer <= 0) { this.state = 'chase'; this.attackTimer = .8; }
      return;
    }

    if (dist < this.radius + player.radius + 4) {
      // contact damage
      if (this.attackTimer <= 0) {
        player.takeDamage(this.atk * .55, this.x, this.y);
        this.attackTimer = 1.1;
      }
      // slight separation
      g.world.moveEntity(this, -nx * 12 * dt, -ny * 12 * dt, []);
      return;
    }

    if (this.type === 'wolf' && dist < 120 && this.attackTimer <= 0) {
      this.state = 'telegraph'; this.telegraph = .38; this.telegraphTotal = .38;
      this.lungeX = nx * 430; this.lungeY = ny * 430;
      audio.sfx('dodge');
      return;
    }
    if (this.type === 'beetle' && dist < 115 && this.attackTimer <= 0) {
      this.state = 'telegraph'; this.telegraph = .55; this.telegraphTotal = .55;
      this.lungeX = nx * 300; this.lungeY = ny * 300;
      return;
    }

    const sp = this.speed * (this.type === 'blob' ? (1 + Math.sin(g.time * 4) * .12) : 1);
    g.world.moveEntity(this, nx * sp * dt, ny * sp * dt, []);
    // contact for blob
    if (this.type === 'blob' && dist < this.radius + player.radius + 8 && this.attackTimer <= 0) {
      player.takeDamage(this.atk * .6, this.x, this.y);
      this.attackTimer = 1.15;
    }
  }

  executeAttack(player, nx, ny) {
    const g = this.game;
    if (this.type === 'wolf' || this.type === 'beetle') {
      this.state = 'attack'; this.stateTimer = this.type === 'wolf' ? .22 : .3;
      this.attackAnim = .3;
      audio.sfx('attack');
      const d = Math.hypot(player.x - this.x, player.y - this.y);
      if (d < 80) player.takeDamage(this.atk, this.x, this.y);
    } else {
      this.attackTimer = 1;
    }
  }

  updateWraith(dt, player, dist, dx, dy) {
    const g = this.game;
    const nx = dist > 0 ? dx / dist : 0, ny = dist > 0 ? dy / dist : 0;
    if (Math.abs(dx) > 2) this.facing = dx > 0 ? 1 : -1;
    if (this.attackTimer <= 0 && dist < 340) {
      // fire orb
      const ang = Math.atan2(dy, dx);
      g.spawnEnemyProjectile(this.x, this.y - 20, Math.cos(ang) * 190, Math.sin(ang) * 190, this.atk * .9, '#a68bff', 7);
      audio.sfx('magic');
      this.attackTimer = 2.2;
      this.attackAnim = .4;
    }
    if (dist < 110) g.world.moveEntity(this, -nx * this.speed * dt, -ny * this.speed * dt, []);
    else if (dist > 220) g.world.moveEntity(this, nx * this.speed * .8 * dt, ny * this.speed * .8 * dt, []);
    else {
      const a = Math.atan2(dy, dx) + Math.PI / 2;
      g.world.moveEntity(this, Math.cos(a) * this.speed * .45 * dt, Math.sin(a) * this.speed * .45 * dt, []);
    }
    if (this.specialCd <= 0 && dist < 90) {
      // blink away
      const ang = Math.random() * 6.28;
      const tx = this.x + Math.cos(ang) * 160, ty = this.y + Math.sin(ang) * 160;
      if (!g.world.collidesCircle(tx, ty, this.radius, [])) {
        g.particles.push(...Particle.burst(this.x, this.y - 20, 12, '#a68bff', { speed: 120, size: 2.5, life: .5 }));
        this.x = tx; this.y = ty;
        g.particles.push(...Particle.burst(this.x, this.y - 20, 12, '#a68bff', { speed: 120, size: 2.5, life: .5 }));
        audio.sfx('magic');
      }
      this.specialCd = 5;
    }
  }

  updateBoss(dt, player, dist, dx, dy) {
    const g = this.game;
    const nx = dist > 0 ? dx / dist : 0, ny = dist > 0 ? dy / dist : 0;
    if (Math.abs(dx) > 2) this.facing = dx > 0 ? 1 : -1;
    const isFinal = this.type === 'boss';
    const thresholds = isFinal ? [.66, .33] : [.5];
    if (this.phase - 1 < thresholds.length && this.hp / this.maxHp <= thresholds[this.phase - 1]) {
      this.phase++;
      this.phaseFlash = 1.2;
      this.speed *= 1.12;
      this.atk *= 1.08;
      g.shake(12, .5);
      g.hitstop(.15);
      audio.sfx('boss');
      g.toast(isFinal ? `El Avatar entra en la Fase ${['I', 'II', 'III'][this.phase - 1]}` : 'El Guardián se enfurece', 'bad');
      g.particles.push(...Particle.burst(this.x, this.y - 30, 40, isFinal ? '#ff8ab5' : '#ff9caf', { speed: 220, size: 3.2, life: .9 }));
      // shockwave ring
      for (let i = 0; i < 12; i++) {
        const a = i / 12 * Math.PI * 2;
        g.spawnEnemyProjectile(this.x, this.y - 24, Math.cos(a) * 170, Math.sin(a) * 170, this.atk * .55, isFinal ? '#ff8ab5' : '#ff9caf', 6);
      }
    }

    if (this.telegraph > 0) {
      this.telegraph -= dt;
      if (this.telegraph <= 0) {
        this.executeBossAttack(player, nx, ny);
      }
      return;
    }

    if (this.state === 'dash') {
      this.stateTimer -= dt;
      g.world.moveEntity(this, this.dashX * dt, this.dashY * dt, []);
      if (dist < this.radius + player.radius + 8) player.takeDamage(this.atk * 1.1, this.x, this.y);
      if (this.stateTimer <= 0) { this.state = 'chase'; this.attackTimer = 1.4; }
      return;
    }

    if (dist < 100 && this.attackTimer <= 0) {
      this.state = 'telegraph'; this.telegraph = .42; this.telegraphTotal = .42;
      this.pending = 'slash';
      return;
    }
    if (this.attackTimer <= 0) {
      const roll = Math.random();
      if (isFinal) {
        if (this.phase >= 3 && roll < .35) { this.pending = 'dash'; this.telegraph = .35; this.telegraphTotal = .35; this.dashX = nx * 520; this.dashY = ny * 520; }
        else if (roll < .65) { this.pending = 'meteors'; this.telegraph = .55; this.telegraphTotal = .55; }
        else { this.pending = 'orbs'; this.telegraph = .45; this.telegraphTotal = .45; }
      } else {
        if (this.phase >= 2 && roll < .35) { this.pending = 'ring'; this.telegraph = .5; this.telegraphTotal = .5; }
        else if (roll < .7) { this.pending = 'orbs'; this.telegraph = .4; this.telegraphTotal = .4; }
        else { this.pending = 'shock'; this.telegraph = .45; this.telegraphTotal = .45; }
      }
      audio.sfx('boss');
      return;
    }

    const sp = this.speed;
    if (dist > 90) g.world.moveEntity(this, nx * sp * dt, ny * sp * dt, []);
    else if (dist < 65) g.world.moveEntity(this, -nx * sp * .5 * dt, -ny * sp * .5 * dt, []);
  }

  executeBossAttack(player, nx, ny) {
    const g = this.game;
    const isFinal = this.type === 'boss';
    const color = isFinal ? (this.phase >= 3 ? '#ff5c9d' : '#c58bff') : '#ff9caf';
    switch (this.pending) {
      case 'slash': {
        this.attackAnim = .4;
        audio.sfx('heavy');
        g.spawnSlash(this.x, this.y, Math.atan2(ny, nx), this.radius + 60, color, 1.8);
        if (Math.hypot(player.x - this.x, player.y - this.y) < this.radius + 70) player.takeDamage(this.atk * 1.25, this.x, this.y);
        this.attackTimer = 1.5;
        break;
      }
      case 'orbs': {
        const count = isFinal ? (this.phase >= 3 ? 9 : 6) : 5;
        for (let i = 0; i < count; i++) {
          const a = Math.atan2(ny, nx) + (i - (count - 1) / 2) * .28;
          g.spawnEnemyProjectile(this.x, this.y - 28, Math.cos(a) * 200, Math.sin(a) * 200, this.atk * .7, color, 7);
        }
        audio.sfx('magic');
        this.attackTimer = isFinal ? 2.1 : 2.8;
        break;
      }
      case 'shock': {
        for (let i = 0; i < 10; i++) {
          const a = i / 10 * Math.PI * 2;
          g.spawnEnemyProjectile(this.x, this.y - 20, Math.cos(a) * 150, Math.sin(a) * 150, this.atk * .6, color, 6);
        }
        this.attackTimer = 2.6;
        break;
      }
      case 'ring': {
        for (let i = 0; i < 16; i++) {
          const a = i / 16 * Math.PI * 2;
          g.spawnEnemyProjectile(this.x, this.y - 20, Math.cos(a) * 125, Math.sin(a) * 125, this.atk * .55, color, 5);
        }
        this.attackTimer = 2.2;
        break;
      }
      case 'meteors': {
        const count = this.phase >= 3 ? 5 : 3;
        for (let i = 0; i < count; i++) {
          const tx = player.x + (Math.random() - .5) * 260;
          const ty = player.y + (Math.random() - .5) * 200;
          g.addHazard(tx, ty, 62, this.atk * 1.1, color, .85, 2.4);
        }
        this.attackTimer = 3.2;
        break;
      }
      case 'dash': {
        this.state = 'dash'; this.stateTimer = .38;
        this.attackTimer = 2.4;
        break;
      }
    }
  }

  takeDamage(amount, opts = {}) {
    if (this.dead) return 0;
    const g = this.game;
    let dmg = amount;
    dmg = Math.max(1, Math.round(dmg - this.defense * .5));
    if (this.type === 'beetle' && !opts.heavy) dmg = Math.round(dmg * .82);
    if (this.boss) dmg = Math.round(dmg * .9);
    this.hp -= dmg;
    this.hurt = .18;
    this.aggro = true;
    g.addDamage(this.x, this.y - this.def.height - 8, dmg, opts.crit ? '#ffe066' : '#fff3d0', opts.crit ? 22 : 16);
    g.particles.push(...Particle.burst(this.x, this.y - this.def.height * .5, opts.crit ? 14 : 8, opts.color || '#ffe6a0', { speed: opts.crit ? 170 : 110, size: 2.2, life: .45 }));
    audio.sfx(opts.crit ? 'crit' : 'hit');
    g.hitstop(opts.crit ? .07 : .035);
    if (!this.boss && opts.knockback) {
      const ang = opts.angle ?? 0;
      this.knock.x = Math.cos(ang) * opts.knockback;
      this.knock.y = Math.sin(ang) * opts.knockback;
    }
    if (this.hp <= 0) this.die();
    return dmg;
  }

  die() {
    if (this.dead) return;
    this.dead = true;
    this.deathTimer = .9;
    this.hp = 0;
    const g = this.game;
    g.particles.push(...Particle.burst(this.x, this.y - this.def.height * .5, this.boss ? 60 : 20, this.def.colors[1], { speed: this.boss ? 240 : 150, size: 3, life: .9 }));
    g.shake(this.boss ? 16 : 4, this.boss ? .6 : .2);
    audio.sfx(this.boss ? 'boss' : 'hit');
    g.onEnemyDeath(this);
  }

  render(ctx) {
    const alpha = this.dead ? Math.max(0, this.deathTimer / .9) : 1;
    ctx.save();
    ctx.globalAlpha = alpha;
    if (this.phaseFlash > 0) {
      ctx.globalCompositeOperation = 'lighter';
      ctx.fillStyle = `rgba(255,120,160,${this.phaseFlash * .3})`;
      ctx.beginPath(); ctx.arc(this.x, this.y - 30, 60, 0, 6.28); ctx.fill();
      ctx.globalCompositeOperation = 'source-over';
    }
    const colors = this.type === 'boss' && this.phase >= 2
      ? (this.phase >= 3 ? ['#7a2c66', '#ff5c9d'] : ['#563078', '#c58bff'])
      : this.def.colors;
    const { drawEnemy } = this.game.renderRef;
    drawEnemy(ctx, this.def.kind, this.x, this.y, this.game.time, {
      colors, hurt: this.hurt, facing: this.facing,
      attack: this.attackAnim > 0 ? 1 - this.attackAnim / .4 : 0,
      scale: this.boss ? 1 : 1,
    });
    ctx.restore();
    if (!this.dead && (this.aggro || this.boss) && this.hp < this.maxHp) {
      const w = this.boss ? 64 : 36;
      const x = this.x - w / 2, y = this.y - this.def.height - (this.boss ? 36 : 18);
      ctx.save();
      ctx.fillStyle = 'rgba(4,7,14,.7)'; ctx.fillRect(x - 1, y - 1, w + 2, 6);
      ctx.fillStyle = this.boss ? '#ff5c7d' : '#ff8b9d';
      ctx.fillRect(x, y, w * clamp(this.hp / this.maxHp, 0, 1), 4);
      ctx.restore();
    }
    if (this.telegraph > 0) {
      const p = 1 - this.telegraph / Math.max(.01, this.telegraphTotal);
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.strokeStyle = this.boss ? `rgba(255,100,150,${.3 + p * .4})` : `rgba(255,190,120,${.25 + p * .4})`;
      ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.arc(this.x, this.y - 10, (this.boss ? 55 : 26) + p * 26, 0, 6.28); ctx.stroke();
      ctx.restore();
    }
  }
}

/* -------------------------------------------------------------------------- */
/* Wild creatures                                                             */
/* -------------------------------------------------------------------------- */
export class WildCreature {
  constructor(game, spawn) {
    this.game = game;
    this.spawn = spawn;
    this.id = spawn.id;
    this.creature = spawn.creature;
    this.def = CREATURES[this.creature];
    this.level = spawn.level || 3;
    this.x = spawn.x * T; this.y = spawn.y * T;
    this.home = { x: this.x, y: this.y };
    this.maxHp = Math.round(this.def.wild.hp * (1 + (this.level - 3) * .12));
    this.hp = this.maxHp;
    this.radius = 15;
    this.provoked = false;
    this.hurt = 0;
    this.dead = false;
    this.deathTimer = 0;
    this.attackTimer = 2;
    this.phase = Math.random() * 6.28;
    this.captured = false;
    this.floatX = 0; this.floatY = 0;
    this.facing = 1;
  }

  get alive() { return !this.dead && !this.captured && this.hp > 0; }

  update(dt, player) {
    const g = this.game;
    if (this.dead) { this.deathTimer -= dt; return; }
    if (this.captured) return;
    this.hurt = Math.max(0, this.hurt - dt);
    this.attackTimer = Math.max(0, this.attackTimer - dt);
    this.phase += dt;
    const dx = player.x - this.x, dy = player.y - this.y;
    const dist = Math.hypot(dx, dy);
    if (this.provoked && dist < 300) {
      const nx = dx / (dist || 1), ny = dy / (dist || 1);
      if (Math.abs(dx) > 2) this.facing = dx > 0 ? 1 : -1;
      if (dist > 170) g.world.moveEntity(this, nx * 50 * dt, ny * 50 * dt, []);
      else if (dist < 110) g.world.moveEntity(this, -nx * 42 * dt, -ny * 42 * dt, []);
      if (this.attackTimer <= 0) {
        const el = ELEMENTS[this.def.element];
        const ang = Math.atan2(dy, dx);
        g.spawnEnemyProjectile(this.x, this.y - 18, Math.cos(ang) * 165, Math.sin(ang) * 165, 5 + this.level * 1.2, el.color, 5.5);
        this.attackTimer = 2.4;
        audio.sfx('magic');
      }
    } else {
      const a = this.phase * .6;
      this.floatX = Math.cos(a) * 12;
      this.floatY = Math.sin(a * 1.3) * 8;
    }
  }

  takeDamage(amount, opts = {}) {
    if (this.dead || this.captured) return 0;
    const g = this.game;
    const dmg = Math.max(1, Math.round(amount * .8));
    this.hp -= dmg;
    this.hurt = .18;
    this.provoked = true;
    g.addDamage(this.x, this.y - 46, dmg, '#ffe066', 16);
    g.particles.push(...Particle.burst(this.x, this.y - 20, 8, this.def.colors[1], { speed: 100, size: 2, life: .4 }));
    audio.sfx('hit');
    if (this.hp <= 0) {
      this.hp = 0;
      this.dead = true;
      this.deathTimer = .8;
      g.particles.push(...Particle.burst(this.x, this.y - 20, 24, this.def.colors[1], { speed: 170, size: 2.6, life: .7 }));
      g.onWildDefeated(this);
    }
    return dmg;
  }

  render(ctx) {
    if (this.dead && this.deathTimer <= 0) return;
    const alpha = this.dead ? Math.max(0, this.deathTimer / .8) : 1;
    const bob = this.provoked ? 0 : Math.sin(this.game.time * 2 + this.phase) * 4;
    ctx.save();
    ctx.globalAlpha = alpha;
    drawCreature(ctx, this.creature, this.x + this.floatX, this.y + this.floatY + bob, this.game.time, .78, { alpha, flip: this.facing < 0 });
    if (!this.dead && this.hp < this.maxHp) {
      const w = 34;
      ctx.fillStyle = 'rgba(4,7,14,.7)'; ctx.fillRect(this.x - w / 2 - 1, this.y - 58, w + 2, 5);
      ctx.fillStyle = this.def.colors[0]; ctx.fillRect(this.x - w / 2, this.y - 57, w * clamp(this.hp / this.maxHp, 0, 1), 3);
    }
    if (!this.dead && this.hp / this.maxHp <= .4 && !this.provoked) {
      ctx.globalCompositeOperation = 'lighter';
      ctx.strokeStyle = 'rgba(255,225,130,.55)'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(this.x, this.y - 22, 24 + Math.sin(this.game.time * 4) * 3, 0, 6.28); ctx.stroke();
    }
    ctx.restore();
  }
}

/* -------------------------------------------------------------------------- */
/* Projectiles                                                                */
/* -------------------------------------------------------------------------- */
export class Projectile {
  constructor(game, opts) {
    this.game = game;
    Object.assign(this, {
      x: 0, y: 0, vx: 0, vy: 0, radius: 5, damage: 10, owner: 'player',
      color: '#ffe6a0', life: 1.4, maxLife: 1.4, pierce: 0, homing: 0,
      element: null, kind: 'orb', knockback: 0, heavy: false,
    }, opts);
    this.trail = [];
    this.hit = new Set();
  }

  update(dt) {
    const g = this.game;
    this.life -= dt;
    this.x += this.vx * dt; this.y += this.vy * dt;
    this.trail.push({ x: this.x, y: this.y, life: .22 });
    this.trail = this.trail.filter(t => (t.life -= dt) > 0);
    if (this.life <= 0) return false;
    if (g.world.collidesCircle(this.x, this.y, this.radius, ['fly'])) {
      g.particles.push(...Particle.burst(this.x, this.y, 5, this.color, { speed: 70, size: 1.8, life: .3 }));
      return false;
    }
    if (this.owner === 'player') {
      for (const e of g.enemies) {
        if (e.dead || this.hit.has(e)) continue;
        if (Math.hypot(e.x - this.x, e.y - this.y) < e.radius + this.radius) {
          e.takeDamage(this.damage, { crit: Math.random() < .1, knockback: this.knockback, angle: Math.atan2(this.vy, this.vx), heavy: this.heavy });
          this.hit.add(e);
          if (this.pierce-- <= 0) return false;
        }
      }
      for (const w of g.wilds) {
        if (!w.alive || this.hit.has(w)) continue;
        if (Math.hypot(w.x - this.x, w.y - this.y) < w.radius + this.radius) {
          w.takeDamage(this.damage);
          this.hit.add(w);
          if (this.pierce-- <= 0) return false;
        }
      }
    } else {
      const p = g.player;
      if (Math.hypot(p.x - this.x, p.y - this.y) < p.radius + this.radius + 2) {
        p.takeDamage(this.damage, this.x, this.y);
        return false;
      }
    }
    return true;
  }

  render(ctx) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (const t of this.trail) {
      ctx.globalAlpha = t.life * 2.2;
      ctx.fillStyle = this.color;
      ctx.beginPath(); ctx.arc(t.x, t.y, this.radius * .55, 0, 6.28); ctx.fill();
    }
    ctx.globalAlpha = .9;
    ctx.shadowColor = this.color; ctx.shadowBlur = 12;
    ctx.fillStyle = this.color;
    ctx.beginPath(); ctx.arc(this.x, this.y, this.radius, 0, 6.28); ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.globalAlpha = .8;
    ctx.beginPath(); ctx.arc(this.x, this.y, this.radius * .38, 0, 6.28); ctx.fill();
    ctx.restore();
  }
}

/* -------------------------------------------------------------------------- */
/* Hazards (boss AoE)                                                         */
/* -------------------------------------------------------------------------- */
export class Hazard {
  constructor(game, x, y, radius, damage, color, warn = .8, active = 2) {
    this.game = game;
    this.x = x; this.y = y; this.radius = radius; this.damage = damage;
    this.color = color; this.warn = warn; this.active = active;
    this.t = 0; this.done = false; this.hitCd = 0;
  }
  update(dt) {
    this.t += dt;
    this.hitCd = Math.max(0, this.hitCd - dt);
    if (this.t > this.warn + this.active) { this.done = true; return; }
    if (this.t >= this.warn && this.hitCd <= 0) {
      const p = this.game.player;
      if (Math.hypot(p.x - this.x, p.y - this.y) < this.radius) {
        p.takeDamage(this.damage, this.x, this.y);
        this.hitCd = .7;
      }
    }
    if (this.t >= this.warn && this.t < this.warn + .15) {
      this.game.shake(4, .15);
      this.game.particles.push(...Particle.burst(this.x, this.y, 20, this.color, { speed: 160, size: 2.6, life: .5 }));
      audio.sfx('heavy');
    }
  }
  render(ctx) {
    ctx.save();
    if (this.t < this.warn) {
      const p = this.t / this.warn;
      ctx.globalCompositeOperation = 'lighter';
      ctx.strokeStyle = this.color; ctx.globalAlpha = .4 + p * .4; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(this.x, this.y, this.radius * (1.2 - p * .2), 0, 6.28); ctx.stroke();
      ctx.fillStyle = this.color; ctx.globalAlpha = .08 + p * .12;
      ctx.beginPath(); ctx.arc(this.x, this.y, this.radius * p, 0, 6.28); ctx.fill();
    } else {
      const p = (this.t - this.warn) / this.active;
      ctx.globalCompositeOperation = 'lighter';
      ctx.fillStyle = this.color; ctx.globalAlpha = Math.max(0, .35 * (1 - p));
      ctx.beginPath(); ctx.arc(this.x, this.y, this.radius, 0, 6.28); ctx.fill();
      ctx.strokeStyle = '#fff'; ctx.globalAlpha = .5 * (1 - p); ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(this.x, this.y, this.radius * (1 + p * .2), 0, 6.28); ctx.stroke();
    }
    ctx.restore();
  }
}

/* -------------------------------------------------------------------------- */
/* Particles & damage numbers                                                 */
/* -------------------------------------------------------------------------- */
export class Particle {
  constructor(opts) { Object.assign(this, { x: 0, y: 0, vx: 0, vy: 0, life: .5, maxLife: .5, size: 2, color: '#fff', gravity: 0, drag: .96, glow: true, kind: 'dot' }, opts); this.maxLife = this.life; }
  static burst(x, y, count, color, opts = {}) {
    const arr = [];
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2, sp = (opts.speed || 100) * (.3 + Math.random() * .7);
      arr.push(new Particle({
        x: x + (Math.random() - .5) * 8, y: y + (Math.random() - .5) * 8,
        vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - (opts.up || 0),
        life: (opts.life || .5) * (.6 + Math.random() * .6),
        size: (opts.size || 2) * (.6 + Math.random() * .8),
        color, gravity: opts.gravity ?? 80, glow: opts.glow !== false,
      }));
    }
    return arr;
  }
  update(dt) {
    this.life -= dt;
    this.vy += this.gravity * dt;
    this.vx *= this.drag; this.vy *= this.drag;
    this.x += this.vx * dt; this.y += this.vy * dt;
  }
  render(ctx) {
    const a = Math.max(0, this.life / this.maxLife);
    ctx.save();
    if (this.glow) ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = a;
    ctx.fillStyle = this.color;
    ctx.beginPath(); ctx.arc(this.x, this.y, this.size * (.4 + a * .6), 0, 6.28); ctx.fill();
    ctx.restore();
  }
}

export class DamageNumber {
  constructor(x, y, text, color = '#fff', size = 16) {
    this.x = x + (Math.random() - .5) * 10; this.y = y; this.text = String(text); this.color = color; this.size = size;
    this.life = .85; this.maxLife = .85; this.vy = -52;
  }
  update(dt) { this.life -= dt; this.y += this.vy * dt; this.vy *= .94; }
  render(ctx) {
    const a = Math.max(0, this.life / this.maxLife);
    ctx.save();
    ctx.globalAlpha = Math.min(1, a * 2.5);
    ctx.font = `700 ${this.size}px ${getComputedStyle(document.body).fontFamily}`;
    ctx.textAlign = 'center';
    ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(5,8,16,.8)';
    ctx.strokeText(this.text, this.x, this.y);
    ctx.fillStyle = this.color;
    ctx.fillText(this.text, this.x, this.y);
    ctx.restore();
  }
}
