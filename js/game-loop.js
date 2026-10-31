// Bucle de actualización, controles y cámara.
import { TILE } from './data.js';
import { markExplored, findInteractable } from './world.js';
import { clamp, lerp, dist, TAU } from './util.js';
import { audio } from './audio.js';
import { specialUpdate, QUESTS } from './story.js';

export const LoopSystem = {
  update(dt) {
    if (this.mode !== 'playing' || !this.player || !this.world) return;
    dt = Math.min(dt, .05);
    this.time += dt;
    this.playtime += dt;

    this.handleInput(dt);
    if (this.mode !== 'playing') return;

    this.updatePlayer(dt);
    this.updateEnemies(dt);
    this.updateCreatures(dt);
    this.updateAlly(dt);
    this.updateProjectiles(dt);
    this.updateEffects(dt);
    this.updateCapture(dt);
    this.updateCooldowns(dt);
    this.checkReachQuests();
    specialUpdate(this);
    this.updateWorldTriggers();

    this._exploreAccum += dt;
    if (this._exploreAccum > .22) {
      markExplored(this.world, this.player.x, this.player.y, 6);
      this.nearInteract = findInteractable(this.world, this.player.x, this.player.y, 72);
      this._exploreAccum = 0;
    } else {
      this.nearInteract = findInteractable(this.world, this.player.x, this.player.y, 72);
    }
    this.refreshQuestTarget();

    this.updateCamera(dt);
    this._hudAccum += dt;
    if (this._hudAccum > .08) {
      this.ui?.updateHUD?.(this._hudAccum);
      this._hudAccum = 0;
    }
    this.ui?.updateCaptureOverlay?.(this.capture);
  },

  handleInput() {
    const input = this.input;
    if (!input) return;
    if (input.pressed('menu') || input.pressed('pause')) { this.ui?.openMenu?.(); return; }
    if (input.pressed('map')) { this.ui?.openMenu?.('map'); return; }
    if (input.pressed('attack')) this.attack();
    if (input.pressed('dodge')) this.dodge();
    if (input.pressed('interact')) this.interact();
    if (input.pressed('summon')) this.pressSummon();
    if (input.pressed('pet')) this.dismissAlly();
    for (let i = 0; i < 4; i++) if (input.pressed('skill' + (i + 1))) this.castSkill(i);

    const blocking = input.down('block') && this.player.stamina > 2;
    if (blocking && !this.player.blocking) {
      this.player.blockT = 0;
      this.player.perfectWindow = .22;
      audio.sfx?.('guard');
    }
    this.player.blocking = blocking;
    this.movement = input.axis();
    if (this.movement.len > .15 && this.player.state !== 'block') {
      this.player.facing = Math.atan2(this.movement.y, this.movement.x);
    }
  },

  updatePlayer(dt) {
    const p = this.player;
    if (!p || p.dead) return;
    if (this.capture) { p.state = 'idle'; p.stateT = 0; return; }
    p.stateT += dt;
    p.invuln = Math.max(0, p.invuln - dt);
    p.hurtT = Math.max(0, p.hurtT - dt);
    p.attackCd = Math.max(0, p.attackCd - dt);
    p.comboT = Math.max(0, p.comboT - dt);
    p.critBuff = Math.max(0, p.critBuff - dt);
    p.dmgBuff = Math.max(0, p.dmgBuff - dt);
    p.slowT = Math.max(0, p.slowT - dt);
    p.burning = Math.max(0, p.burning - dt);
    p.bondGlow = Math.max(0, p.bondGlow - dt);
    if (p.perfectWindow > 0) p.perfectWindow -= dt;
    if (p.blocking) p.blockT += dt;
    if (p.burning > 0) {
      this._burnAccum = (this._burnAccum || 0) + dt;
      if (this._burnAccum > .5) {
        this._burnAccum = 0;
        this.damagePlayer(4 + this.level, null, { trueDamage: true, silent: true });
      }
    }

    // regeneración
    const s = p.stats;
    p.mp = Math.min(p.maxMp, p.mp + (.45 + s.mana * .06) * dt);
    const busy = p.state === 'attack' || p.state === 'dodge' || p.state === 'hurt' || p.blocking;
    if (!busy) p.stamina = Math.min(p.maxStamina, p.stamina + (8 + s.aguante * .45) * dt);
    if (!this.enemies.some(e => !e.dead && e.aggro && e.state !== 'dead')) {
      p.hp = Math.min(p.maxHp, p.hp + p.maxHp * .0035 * dt);
    }

    // estados de acción
    if (p.state === 'dodge') {
      const sp = 470 + p.stats.velocidad * 5;
      this.tryMove(p, p.dodgeDir.x * sp * dt, p.dodgeDir.y * sp * dt);
      this._dodgeFx = (this._dodgeFx || 0) + dt;
      if (this._dodgeFx > .05) {
        this._dodgeFx = 0;
        this.effects.push({ kind: 'afterimage', x: p.x, y: p.y, color: '#9fdfee', life: .35, max: .35 });
      }
      if (p.stateT >= p.stateDur) { p.state = 'idle'; p.stateT = 0; }
      return;
    }
    if (p.state === 'hurt') {
      if (p.stateT >= p.stateDur) { p.state = 'idle'; p.stateT = 0; }
      return;
    }
    if (p.state === 'attack') {
      const move = p.stateT < p.attackDuration * .55 ? .22 : .05;
      if (this.movement.len > .1) this.tryMove(p, this.movement.x * p.speed * move * dt, this.movement.y * p.speed * move * dt);
      if (p.stateT >= p.attackDuration) { p.state = 'idle'; p.stateT = 0; }
      return;
    }

    if (p.blocking && p.stamina > 0) {
      p.state = 'block';
      p.stateT = 0;
      if (this.movement.len > .1) this.tryMove(p, this.movement.x * p.speed * .38 * dt, this.movement.y * p.speed * .38 * dt);
      return;
    }
    if (p.state === 'block') { p.state = 'idle'; p.stateT = 0; }

    const m = this.movement;
    if (m.len > .12) {
      const run = m.len > .9 && p.stamina > 6;
      this._runHold = run ? this._runHold + dt : 0;
      const speed = p.speed * (run ? 1.38 : 1) * (p.slowT > 0 ? .55 : 1);
      this.tryMove(p, m.x * speed * dt, m.y * speed * dt);
      p.state = run ? 'run' : 'walk';
      p.running = run;
      p.walkPhase += speed * dt / (run ? 30 : 22);
      if (run) p.stamina = Math.max(0, p.stamina - 1.6 * dt);
    } else {
      if (p.state !== 'idle') { p.state = 'idle'; p.stateT = 0; }
      p.running = false;
    }
  },

  tryMove(entity, dx, dy) {
    const w = this.world;
    if (!w) return;
    const r = entity.radius || 14;
    if (!w.isBlocked(entity.x + dx, entity.y, r)) entity.x += dx;
    else if (!w.isBlocked(entity.x + dx, entity.y - Math.sign(dy || 1) * 4, r)) entity.x += dx * .5;
    if (!w.isBlocked(entity.x, entity.y + dy, r)) entity.y += dy;
    else if (!w.isBlocked(entity.x - Math.sign(dx || 1) * 4, entity.y + dy, r)) entity.y += dy * .5;
    const maxX = (w.W - 1) * TILE, maxY = (w.H - 1) * TILE;
    entity.x = clamp(entity.x, TILE, maxX);
    entity.y = clamp(entity.y, TILE, maxY);
  },

  updateCamera(dt) {
    const p = this.player;
    if (!p) return;
    const cssW = this.canvas.clientWidth || this.canvas.width;
    const cssH = this.canvas.clientHeight || this.canvas.height;
    const vw = cssW / this.zoom, vh = cssH / this.zoom;
    const lead = 26;
    const tx = p.x + (this.movement?.x || 0) * lead;
    const ty = p.y + (this.movement?.y || 0) * lead;
    const k = 1 - Math.pow(.0008, dt);
    this.camera.x = lerp(this.camera.x, tx, k);
    this.camera.y = lerp(this.camera.y, ty, k);
    const minX = vw / 2, maxX = this.world.W * TILE - vw / 2;
    const minY = vh / 2, maxY = this.world.H * TILE - vh / 2;
    this.camera.x = maxX > minX ? clamp(this.camera.x, minX, maxX) : this.world.W * TILE / 2;
    this.camera.y = maxY > minY ? clamp(this.camera.y, minY, maxY) : this.world.H * TILE / 2;
  },

  updateCooldowns(dt) {
    for (const id of Object.keys(this.cooldowns)) {
      this.cooldowns[id] = Math.max(0, this.cooldowns[id] - dt);
      if (this.cooldowns[id] <= 0) delete this.cooldowns[id];
    }
  },

  updateEffects(dt) {
    for (const fx of this.effects) {
      fx.life -= dt;
      if (fx.kind === 'particle' || fx.kind === 'spark') {
        fx.x += (fx.vx || 0) * dt;
        fx.y += (fx.vy || 0) * dt;
        fx.vy += (fx.gravity ?? 40) * dt;
        fx.vx *= .99;
      } else if (fx.kind === 'text') {
        fx.y -= 28 * dt;
      }
    }
    this.effects = this.effects.filter(fx => fx.life > 0);
  },

  updateCapture(dt) {
    const c = this.capture;
    if (!c) return;
    c.t += dt;
    c.value = (Math.sin(c.t * c.speed) + 1) / 2;
    if (c.creature) { c.creature.resonance = .35 + c.value * .65; }
    if (c.t > 8) {
      this.resolveCapture(false);
    }
  },

  updateCreatures(dt) {
    const p = this.player;
    for (const c of this.creatures) {
      if (c.captured || c.dead) continue;
      if (dist(c.x, c.y, p.x, p.y) > 1500) continue;
      c.stateT += dt;
      c.walkPhase += dt * 2;
      c.facing = Math.atan2(p.y - c.y, p.x - c.x);
      c.enraged = Math.max(0, c.enraged - dt);
      if (c.resonance > 0) c.resonance = Math.max(0, c.resonance - dt * .2);
      if (c.capturable) {
        c.state = 'capturable';
        continue;
      }
      if (dist(c.x, c.y, p.x, p.y) < 95) {
        // retrocede con timidez
        const a = Math.atan2(c.y - p.y, c.x - p.x);
        this.tryMove(c, Math.cos(a) * 48 * dt, Math.sin(a) * 48 * dt);
        c.state = 'flee';
      } else {
        c.wanderT -= dt;
        if (c.wanderT <= 0) {
          c.wanderT = 1.5 + Math.random() * 3;
          c.wanderDir = Math.random() * TAU;
        }
        if (c.wanderDir != null) {
          this.tryMove(c, Math.cos(c.wanderDir) * 24 * dt, Math.sin(c.wanderDir) * 24 * dt);
          c.facing = c.wanderDir;
        }
        c.state = 'wander';
      }
    }
  },

  updateWorldTriggers() {
    if (!this.world || !this.world.bossArena) return;
    const a = this.world.bossArena;
    const bossSpawn = this.world.bossSpawn;
    if (!bossSpawn || this.bossActive) return;
    if (this.flags['boss_defeated_' + bossSpawn.type]) return;
    const activeBossQuest = Object.values(this.quests).some(q => {
      if (!q.started || q.done) return false;
      const st = QUESTS[q.id]?.stages[q.stage];
      return st?.type === 'boss' && st.target === bossSpawn.type;
    });
    if (!activeBossQuest) return;
    if (dist(this.player.x, this.player.y, a.x, a.y) < a.r * .72) {
      this.spawnBoss(bossSpawn.type, bossSpawn.x, bossSpawn.y);
      this.ui?.subtitle?.(bossSpawn.type === 'boss_ciervo' ? 'El Ciervo de Ceniza' : 'El Señor de la Primera Brasa', 3.4);
    }
  },

  spawnBurst(x, y, color, n = 12, speed = 100) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * TAU, v = speed * (.3 + Math.random() * .7);
      this.effects.push({
        kind: Math.random() < .5 ? 'particle' : 'spark',
        x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 20,
        color, size: 1 + Math.random() * 2.5, life: .4 + Math.random() * .6,
        max: 1, gravity: 50, glow: Math.random() < .3
      });
    }
  },

  floatText(x, y, text, color = '#fff', crit = false) {
    if (!this.settings.showDamage) return;
    this.effects.push({ kind: 'text', x: x + (Math.random() - .5) * 12, y, text, color, crit, size: crit ? 19 : 13, life: .9, max: .9 });
  },

  dismissAlly() {
    if (!this.ally) { this.ui?.toast?.('No hay ningún eco invocado'); return; }
    this.ally = null;
    this.ui?.toast?.('El eco regresa a tu memoria');
    audio.sfx?.('dismiss');
  }
};
