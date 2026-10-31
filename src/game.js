import {
  TAU, WORLD, clamp, lerp, rand, randInt, pick, dist, angleTo, store,
} from './core.js';
import {
  SLOTS, SLOT_ORDER, ARCH, ENEMIES, enemyPool, BOSSES, RELICS, SKILLS, RARITY, RARITY_ORDER,
} from './data.js';
import {
  makeItem, makeStartingItem, aggregate, itemLevelFor, powerOf,
} from './loot.js';

const MAX_BAG = 30;
const RUN_LENGTH = 600;

const angleDiff = (a, b) => {
  let d = a - b;
  while (d > Math.PI) d -= TAU;
  while (d < -Math.PI) d += TAU;
  return Math.abs(d);
};

export class Game {
  constructor(audio = null) {
    this.audio = audio;
    this.ui = null;
    this.autoEquip = store.get('cryptfall.autoEquip', true);
    this.state = 'menu';
    this.reset();
  }

  reset() {
    const p = {
      x: WORLD.w / 2,
      y: WORLD.h / 2,
      r: 13,
      hp: 100,
      maxHp: 100,
      level: 1,
      xp: 0,
      xpNext: 8,
      iframes: 0,
      flash: 0,
      anim: 0,
      facing: 0,
      attackAnim: 0,
      attackDir: 0,
      moving: false,
    };
    this.player = p;
    this.equipment = { weapon: null, helm: null, chest: null, gloves: null, boots: null, ring: null, amulet: null };
    this.inventory = [];
    this.skills = {};
    this.relic = null;
    this.relicPerk = {};
    this.stats = {
      maxHp: 100, armor: 0, might: 0, weaponDmgPct: 0, speed: 160, speedPct: 0,
      cdr: 0, area: 0, magnet: 70, crit: 5, critDmg: 50, regen: 0, xp: 0, gold: 0,
      luck: 0, weaponDamage: 0, critMult: 1.5, damageMult: 1, powers: [], powerSet: new Set(),
    };
    this.enemies = [];
    this.projectiles = [];
    this.enemyProjectiles = [];
    this.effects = [];
    this.pickups = [];
    this.particles = [];
    this.texts = [];
    this.decals = [];
    this.camera = { x: p.x, y: p.y, shake: 0 };
    this.view = { w: 1280, h: 720, zoom: 1 };
    this.input = { x: 0, y: 0 };
    this.time = 0;
    this.kills = 0;
    this.gold = 0;
    this.goldEarned = 0;
    this.itemsFound = 0;
    this.bestItem = null;
    this.pendingLevels = 0;
    this.spawnTimer = 0.6;
    this.eliteTimer = 26;
    this.attackCd = 0.4;
    this.bossIndex = 0;
    this.boss = null;
    this.rerolls = 0;
    this.rerollCost = 25;
    this.novaCount = 0;
    this.killsSinceItem = 0;
    this.endReason = '';
    this.visual = 0;
    this.nextId = 1;
    this.bossSpawned = new Set();
    this.recompute();
  }

  /* ── run lifecycle ─────────────────────────────────────────── */
  start(relicId) {
    this.reset();
    this.relic = RELICS.find((r) => r.id === relicId) || RELICS[0];
    const perk = { wand: { cdr: 8 }, sword: { armor: 12 }, bow: { speed: 8 } }[this.relic.id] || {};
    this.relicPerk = perk;
    const weapon = makeStartingItem(this.relic);
    this.equipment.weapon = weapon;
    this.recompute();
    this.player.hp = this.player.maxHp;
    this.state = 'playing';
    for (let i = 0; i < 5; i++) this.spawnEnemy(i < 3 ? 'bat' : 'skeleton');
    this.camera.x = this.player.x;
    this.camera.y = this.player.y;
  }

  endRun(result, reason = '') {
    if (this.state === 'dead' || this.state === 'victory') return;
    this.state = result === 'dead' ? 'dead' : 'victory';
    this.endReason = reason;
    this.saveRecord();
    if (this.audio) (result === 'dead' ? this.audio.death() : this.audio.victory());
    this.ui?.showEnd(result, reason);
  }

  saveRecord() {
    const prev = store.get('cryptfall.best', null);
    const record = {
      time: this.time,
      kills: this.kills,
      level: this.player.level,
      gold: this.gold,
      itemName: this.bestItem?.name || '',
      itemRarity: this.bestItem?.rarity || '',
      win: this.state === 'victory',
    };
    const prevRank = prev?.itemRarity ? RARITY_ORDER.indexOf(prev.itemRarity) : -1;
    const rank = this.bestItem ? RARITY_ORDER.indexOf(this.bestItem.rarity) : -1;
    if (!prev || this.time > prev.time || (this.state === 'victory' && !prev.win) || rank > prevRank) {
      const merged = { ...record };
      if (prev && prev.time > record.time) {
        merged.time = prev.time;
        merged.kills = Math.max(prev.kills, record.kills);
        merged.level = Math.max(prev.level, record.level);
        merged.gold = Math.max(prev.gold, record.gold);
      }
      if (prev && prevRank > rank) {
        merged.itemName = prev.itemName;
        merged.itemRarity = prev.itemRarity;
      }
      merged.win = record.win || !!prev?.win;
      store.set('cryptfall.best', merged);
    }
  }

  /* ── derived stats ─────────────────────────────────────────── */
  recompute() {
    const g = aggregate(this.equipment);
    const s = this.skills;
    const perk = this.relicPerk || {};
    const prevMax = this.stats?.maxHp || 100;

    const powers = g.powers;
    const powerSet = new Set(powers.map((p) => p.id));
    const maxHp = 100 + g.maxHp + (s.vitality || 0) * 18;
    const armor = g.armor + (s.bulwark || 0) * 7 + (perk.armor || 0);
    const might = g.might + (s.might || 0) * 10;
    const weaponDmgPct = (s.training || 0) * 12;
    const speedPct = Math.min(70, g.speed + (s.fleet || 0) * 7 + (perk.speed || 0));
    const cdr = Math.min(55, g.cdr + (s.haste || 0) * 6 + (perk.cdr || 0));
    const area = g.area + (s.area || 0) * 10;
    const magnet = 70 + g.magnet + (s.magnet || 0) * 30;
    const crit = Math.min(75, 5 + g.crit + (s.crit || 0) * 3);
    const critDmg = 50 + g.critDmg + (s.critdmg || 0) * 20;
    const regen = g.regen + (s.regen || 0) * 0.5;
    const xp = g.xp + (s.xp || 0) * 12;
    const gold = g.gold + (s.greed || 0) * 20 + (powerSet.has('greed') ? 30 : 0);
    const luck = g.luck + (s.luck || 0) * 8;

    this.stats = {
      maxHp, armor, might, weaponDmgPct, speedPct, cdr, area, magnet, crit, critDmg,
      regen, xp, gold, luck, powers, powerSet,
      speed: 160 * (1 + speedPct / 100),
      weaponDamage: g.weaponDamage,
      critMult: 1.5 + critDmg / 100,
      damageMult: (1 + might / 100) * (1 + weaponDmgPct / 100),
      pickup: magnet,
    };

    const p = this.player;
    if (p) {
      p.maxHp = maxHp;
      if (maxHp > prevMax) p.hp = Math.min(maxHp, p.hp + (maxHp - prevMax));
      p.hp = clamp(p.hp, 0, maxHp);
    }
  }

  hasPower(id) {
    return this.stats.powerSet.has(id);
  }

  weaponBase() {
    return this.equipment.weapon?.base || {
      id: 'fist', name: 'Bare Hands', arch: 'fist', cd: 0.55, dmg: [3, 5], color: '#e8dcc0', tier: 0,
    };
  }

  weaponCooldown() {
    return this.weaponBase().cd / (1 + this.stats.cdr / 100);
  }

  attackDamage() {
    const base = this.equipment.weapon ? Math.max(2, this.stats.weaponDamage) : 4;
    const raw = base * this.stats.damageMult;
    const crit = Math.random() * 100 < this.stats.crit;
    return { dmg: raw * (crit ? this.stats.critMult : 1), crit };
  }

  /* ── main update ───────────────────────────────────────────── */
  update(dt) {
    if (this.state !== 'playing') return;
    this.visual += dt;
    this.time += dt;
    const p = this.player;

    p.iframes = Math.max(0, p.iframes - dt);
    p.flash = Math.max(0, p.flash - dt);
    p.attackAnim = Math.max(0, p.attackAnim - dt);

    let mx = this.input.x;
    let my = this.input.y;
    const len = Math.hypot(mx, my);
    p.moving = len > 0.08;
    if (len > 1) {
      mx /= len;
      my /= len;
    }
    if (p.moving) {
      p.facing = Math.atan2(my, mx);
      p.anim += dt * 11;
      p.x = clamp(p.x + mx * this.stats.speed * dt, 62, WORLD.w - 62);
      p.y = clamp(p.y + my * this.stats.speed * dt, 62, WORLD.h - 62);
      if (Math.random() < dt * 8) {
        this.burst(p.x + rand(6, -6), p.y + 10, '#5a4d63', 1, 18, 1.6);
      }
    } else {
      p.anim += dt * 2.4;
    }

    if (this.stats.regen > 0) p.hp = Math.min(p.maxHp, p.hp + this.stats.regen * dt);

    this.camera.x = lerp(this.camera.x, p.x, 1 - Math.exp(-dt * 7));
    this.camera.y = lerp(this.camera.y, p.y, 1 - Math.exp(-dt * 7));
    this.camera.shake = Math.max(0, this.camera.shake - dt * 22);

    this.updateWeapon(dt);
    this.updateSpawning(dt);
    this.updateBosses();
    this.updateEnemies(dt);
    this.updateProjectiles(dt);
    this.updateEnemyProjectiles(dt);
    this.updateEffects(dt);
    this.updatePickups(dt);
    this.updateParticles(dt);

    this.enemies = this.enemies.filter((e) => !e.dead);
    this.projectiles = this.projectiles.filter((pr) => !pr.dead);
    this.enemyProjectiles = this.enemyProjectiles.filter((pr) => !pr.dead);

    if (this.state === 'playing' && this.time >= RUN_LENGTH) {
      this.endRun('victory', 'dawn');
    }
  }

  /* ── weapons ───────────────────────────────────────────────── */
  updateWeapon(dt) {
    this.attackCd -= dt;
    if (this.attackCd > 0) return;
    const w = this.weaponBase();
    const range = (ARCH[w.arch]?.range || 200) * (1 + this.stats.area / 100);
    const target = this.nearestEnemy(range);
    if (!target) {
      this.attackCd = 0.08;
      return;
    }
    this.performAttack(false, target);
    this.attackCd = this.weaponCooldown();
  }

  performAttack(isEcho, forcedTarget = null) {
    const p = this.player;
    const w = this.weaponBase();
    const target = forcedTarget || this.nearestEnemy((ARCH[w.arch]?.range || 200) * (1 + this.stats.area / 100));
    if (!target) return false;
    const ang = angleTo(p.x, p.y, target.x, target.y) + (isEcho ? rand(0.12, -0.12) : 0);
    const { dmg, crit } = this.attackDamage();
    p.attackAnim = 0.18;
    p.attackDir = ang;
    p.facing = ang;

    if (w.arch === 'wand') {
      this.spawnProjectile({
        x: p.x + Math.cos(ang) * 16, y: p.y + Math.sin(ang) * 16 - 6,
        angle: ang, speed: 660, r: 7, dmg, crit, pierce: 0, kind: 'bolt',
        color: w.color || '#7fe6ff', life: 1.5,
      });
      this.burst(p.x + Math.cos(ang) * 18, p.y + Math.sin(ang) * 18 - 6, w.color || '#7fe6ff', 4, 80, 2);
      this.audio?.shoot('wand');
    } else if (w.arch === 'bow') {
      this.spawnProjectile({
        x: p.x + Math.cos(ang) * 16, y: p.y + Math.sin(ang) * 16 - 6,
        angle: ang, speed: 940, r: 4, dmg, crit, pierce: 3, kind: 'arrow',
        color: w.color || '#c9e8a0', life: 1.1,
      });
      this.audio?.shoot('bow');
    } else if (w.arch === 'scythe') {
      this.effects.push({
        type: 'whirl', t: 0, duration: 2.6, tick: 0, radius: 92 * (1 + this.stats.area / 100),
        dmg: dmg * 0.55, crit, x: p.x, y: p.y,
      });
      this.audio?.shoot('scythe');
    } else {
      const radius = (w.arch === 'sword' ? 94 : 72) * (1 + this.stats.area / 100);
      this.effects.push({ type: 'arc', x: p.x, y: p.y, angle: ang, radius, t: 0, duration: 0.22, color: w.color || '#e8dcc0' });
      this.arcDamage(p.x, p.y, ang, radius, 1.15, dmg, crit, 130);
      this.audio?.shoot(w.arch === 'sword' ? 'sword' : 'fist');
    }

    if (!isEcho && this.hasPower('echo') && Math.random() < 0.25) {
      this.performAttack(true, target);
    }
    return true;
  }

  spawnProjectile(opts) {
    this.projectiles.push({
      x: opts.x, y: opts.y,
      vx: Math.cos(opts.angle) * opts.speed,
      vy: Math.sin(opts.angle) * opts.speed,
      angle: opts.angle,
      r: opts.r, dmg: opts.dmg, crit: opts.crit,
      pierce: opts.pierce, kind: opts.kind, color: opts.color,
      life: opts.life || 1.4, maxLife: opts.life || 1.4,
      hit: new Set(), dead: false,
      trail: [],
    });
  }

  arcDamage(x, y, angle, radius, halfArc, dmg, crit, knockback = 0) {
    let hits = 0;
    for (const e of this.enemies) {
      if (e.dead) continue;
      const d = dist(x, y, e.x, e.y);
      if (d > radius + e.r) continue;
      if (angleDiff(angleTo(x, y, e.x, e.y), angle) > halfArc) continue;
      this.applyDamage(e, dmg, crit, { angle, knockback });
      hits++;
    }
    return hits;
  }

  aoeDamage(x, y, radius, dmg, { color = '#d9c9ff', knockback = 0, crit = false } = {}) {
    let hits = 0;
    for (const e of this.enemies) {
      if (e.dead) continue;
      if (dist(x, y, e.x, e.y) > radius + e.r) continue;
      this.applyDamage(e, dmg, crit, { angle: angleTo(x, y, e.x, e.y), knockback, color });
      hits++;
    }
    return hits;
  }

  applyDamage(e, dmg, crit, { angle = 0, knockback = 0, color = null } = {}) {
    if (e.dead) return;
    e.hp -= dmg;
    e.flash = 0.12;
    if (knockback && !e.boss) {
      e.vx += Math.cos(angle) * knockback;
      e.vy += Math.sin(angle) * knockback;
    }
    this.addText(
      e.x + rand(6, -6), e.y - e.r - 6,
      String(Math.max(1, Math.round(dmg))),
      crit ? '#ffd75e' : color || '#f4ecdc',
      crit ? 17 : 12,
      crit,
    );
    this.burst(e.x, e.y - 4, crit ? '#ffd75e' : '#a8323c', crit ? 6 : 3, crit ? 150 : 90, 2);
    if (this.audio) this.audio.hit(crit);

    if (this.hasPower('emberheart') && Math.random() < 0.3) {
      e.burn = { dps: dmg * 0.15, until: this.time + 3 };
    }
    if (this.hasPower('frost')) {
      e.slowUntil = this.time + 1.5;
    }
    if (e.hp <= 0) this.killEnemy(e);
  }

  /* ── spawning ──────────────────────────────────────────────── */
  spawnPoint() {
    const p = this.player;
    const radius = Math.hypot(this.view.w / this.view.zoom, this.view.h / this.view.zoom) / 2 + rand(160, 60);
    for (let attempt = 0; attempt < 6; attempt++) {
      const a = rand(TAU);
      const x = clamp(p.x + Math.cos(a) * radius, 60, WORLD.w - 60);
      const y = clamp(p.y + Math.sin(a) * radius, 60, WORLD.h - 60);
      if (dist(x, y, p.x, p.y) > 280) return { x, y };
    }
    return { x: clamp(p.x + radius, 60, WORLD.w - 60), y: p.y };
  }

  pickType() {
    const pool = enemyPool(this.time);
    let total = 0;
    for (const [, w] of pool) total += w;
    let roll = Math.random() * total;
    for (const [type, w] of pool) {
      roll -= w;
      if (roll <= 0) return type;
    }
    return pool[0][0];
  }

  difficulty() {
    return 1 + this.time * 0.032 + Math.pow(this.time / 60, 2) * 0.12;
  }

  spawnEnemy(type = null, opts = {}) {
    if (this.enemies.length > 250) return null;
    type = type || this.pickType();
    const def = ENEMIES[type];
    const elite = !!opts.elite;
    const pos = opts.pos || this.spawnPoint();
    const diff = this.difficulty();
    const hp = def.hp * diff * (elite ? 9 : 1);
    const e = {
      id: this.nextId++,
      type, draw: def.draw, name: elite ? `Elite ${def.name}` : def.name,
      x: pos.x, y: pos.y, vx: 0, vy: 0,
      hp, maxHp: hp,
      speed: def.speed * (elite ? 0.92 : 1) * rand(1.08, 0.92),
      dmg: def.dmg * (1 + this.time * 0.008) * (elite ? 1.4 : 1),
      r: def.r * (elite ? 1.5 : 1),
      xp: def.xp * (elite ? 10 : 1),
      gold: def.gold,
      color: def.color,
      ranged: !!def.ranged,
      elite, boss: false,
      t: rand(TAU), flash: 0, hitCd: 0, shootTimer: rand(2.4, 0.8),
      slowUntil: 0, burn: null, dead: false,
    };
    this.enemies.push(e);
    return e;
  }

  spawnElite() {
    const type = this.pickType();
    const e = this.spawnEnemy(type, { elite: true });
    if (e) {
      this.addText(e.x, e.y - 40, 'ELITE', '#ffcf5e', 15, true);
      this.audio?.elite();
    }
  }

  updateSpawning(dt) {
    this.spawnTimer -= dt;
    if (this.spawnTimer <= 0) {
      this.spawnTimer = Math.max(0.17, 1.05 - this.time * 0.0012);
      const count = 1 + Math.floor(this.time / 80);
      for (let i = 0; i < count; i++) this.spawnEnemy();
    }
    this.eliteTimer -= dt;
    if (this.eliteTimer <= 0 && this.time > 20) {
      this.eliteTimer = Math.max(18, 34 - this.time * 0.012);
      this.spawnElite();
    }
  }

  /* ── bosses ────────────────────────────────────────────────── */
  updateBosses() {
    for (const def of BOSSES) {
      if (this.time >= def.at && !this.bossSpawned.has(def.id)) {
        this.bossSpawned.add(def.id);
        this.spawnBoss(def);
      }
    }
  }

  spawnBoss(def) {
    const pos = this.spawnPoint();
    const hp = def.hp;
    const e = {
      id: this.nextId++,
      type: def.id, draw: 'boss', name: def.name,
      x: pos.x, y: pos.y, vx: 0, vy: 0,
      hp, maxHp: hp,
      speed: def.speed, dmg: def.dmg, r: def.r, xp: def.xp,
      color: def.color, crown: def.crown,
      ranged: false, elite: false, boss: true, bossId: def.id,
      t: 0, flash: 0, hitCd: 0, shootTimer: 999,
      castTimer: 3, summonTimer: 6,
      slowUntil: 0, burn: null, dead: false,
    };
    this.enemies.push(e);
    this.boss = e;
    this.ui?.announce(def.name.toUpperCase(), 'boss');
    this.ui?.showBoss(e);
    this.audio?.boss();
    this.camera.shake = 14;
  }

  bossCast(e) {
    const count = e.bossId === 'pale' ? 16 : 12;
    const speed = e.bossId === 'pale' ? 195 : 165;
    const base = rand(TAU);
    for (let i = 0; i < count; i++) {
      const a = base + (i / count) * TAU;
      this.enemyProjectiles.push({
        x: e.x + Math.cos(a) * e.r, y: e.y + Math.sin(a) * e.r,
        vx: Math.cos(a) * speed, vy: Math.sin(a) * speed,
        r: 8, dmg: e.dmg * 0.55, life: 3.4, color: e.bossId === 'pale' ? '#9fe8ff' : '#ffb15e',
        dead: false,
      });
    }
    this.burst(e.x, e.y, e.bossId === 'pale' ? '#9fe8ff' : '#ffb15e', 22, 220, 3);
    this.camera.shake = 9;
    this.audio?.bossCast();
  }

  onBossKilled(e) {
    if (this.boss === e) {
      this.boss = null;
      this.ui?.hideBoss();
    }
    this.camera.shake = 20;
    this.addText(e.x, e.y - 60, 'SLAIN', '#ffd75e', 26, true);
    for (let i = 0; i < 14; i++) this.spawnPickup('gold', e.x + rand(50, -50), e.y + rand(50, -50), rand(8, 3));
    this.burst(e.x, e.y, e.color, 40, 320, 4);

    const ilvl = itemLevelFor(this.time, this.player.level) + 3;
    if (e.bossId === 'pale') {
      this.dropItem(e.x - 30, e.y, { rarity: 'legendary', ilvl });
      this.dropItem(e.x + 30, e.y, { rarity: 'legendary', ilvl });
      this.dropItem(e.x, e.y + 20, { rarity: 'rare', ilvl });
      this.ui?.announce('THE PALE KING FALLS', 'victory');
      this.audio?.legendary();
      this.endRun('victory', 'boss');
    } else {
      this.dropItem(e.x - 20, e.y, { rarity: 'legendary', ilvl });
      this.dropItem(e.x + 20, e.y, { rarity: 'rare', ilvl });
      this.dropItem(e.x, e.y + 20, { rarity: 'rare', ilvl });
      this.ui?.announce('THE BONE TYRANT FALLS', 'good');
      this.audio?.legendary();
    }
  }

  /* ── enemies ───────────────────────────────────────────────── */
  updateEnemies(dt) {
    const p = this.player;
    for (const e of this.enemies) {
      if (e.dead) continue;
      e.t += dt;
      e.flash = Math.max(0, e.flash - dt);

      if (e.burn) {
        if (this.time < e.burn.until) {
          e.hp -= e.burn.dps * dt;
          if (Math.random() < dt * 9) this.burst(e.x + rand(6, -6), e.y - 4, '#ff8a3d', 1, 30, 2);
          if (e.hp <= 0) {
            this.killEnemy(e);
            continue;
          }
        } else {
          e.burn = null;
        }
      }

      const slow = this.time < e.slowUntil ? 0.65 : 1;
      const dx = p.x - e.x;
      const dy = p.y - e.y;
      const d = Math.hypot(dx, dy) || 1;

      if (e.boss) {
        if (d > e.r + p.r + 6) {
          e.x += (dx / d) * e.speed * slow * dt;
          e.y += (dy / d) * e.speed * slow * dt;
        }
        e.castTimer -= dt;
        if (e.castTimer <= 0) {
          this.bossCast(e);
          e.castTimer = e.hp < e.maxHp * 0.3 ? 2.4 : 3.8;
        }
        e.summonTimer -= dt;
        if (e.summonTimer <= 0) {
          e.summonTimer = 8;
          for (let i = 0; i < 4; i++) {
            this.spawnEnemy(i < 3 ? 'bat' : 'skeleton', {
              pos: { x: clamp(e.x + rand(90, -90), 60, WORLD.w - 60), y: clamp(e.y + rand(90, -90), 60, WORLD.h - 60) },
            });
          }
          this.burst(e.x, e.y, '#c46a5a', 12, 130, 3);
        }
      } else if (e.ranged) {
        if (d > 300) {
          e.x += (dx / d) * e.speed * slow * dt;
          e.y += (dy / d) * e.speed * slow * dt;
        } else if (d < 200) {
          e.x -= (dx / d) * e.speed * 0.7 * slow * dt;
          e.y -= (dy / d) * e.speed * 0.7 * slow * dt;
        }
        e.shootTimer -= dt;
        if (e.shootTimer <= 0 && d < 620) {
          e.shootTimer = rand(3.1, 1.9);
          const a = angleTo(e.x, e.y, p.x, p.y);
          this.enemyProjectiles.push({
            x: e.x + Math.cos(a) * 12, y: e.y + Math.sin(a) * 12,
            vx: Math.cos(a) * 235, vy: Math.sin(a) * 235,
            r: 7, dmg: e.dmg, life: 3.2, color: '#ff7a5e', dead: false,
          });
          this.burst(e.x, e.y, '#ff7a5e', 3, 60, 2);
        }
      } else {
        e.x += (dx / d) * e.speed * slow * dt;
        e.y += (dy / d) * e.speed * slow * dt;
      }

      e.x += e.vx * dt;
      e.y += e.vy * dt;
      e.vx *= Math.max(0, 1 - dt * 5);
      e.vy *= Math.max(0, 1 - dt * 5);
      e.x = clamp(e.x, 40, WORLD.w - 40);
      e.y = clamp(e.y, 40, WORLD.h - 40);

      if (d < e.r + p.r + 2) {
        e.hitCd -= dt;
        if (e.hitCd <= 0) {
          this.hurtPlayer(e.dmg);
          e.hitCd = 0.85;
        }
      }
    }
  }

  nearestEnemy(range) {
    const p = this.player;
    let best = null;
    let bestD = range;
    for (const e of this.enemies) {
      if (e.dead) continue;
      const d = dist(p.x, p.y, e.x, e.y) - e.r;
      if (d < bestD) {
        bestD = d;
        best = e;
      }
    }
    return best;
  }

  hurtPlayer(amount) {
    const p = this.player;
    if (p.iframes > 0 || this.state !== 'playing') return;
    const reduction = Math.min(0.7, this.stats.armor / (this.stats.armor + 100));
    const dmg = Math.max(1, amount * (1 - reduction));
    p.hp -= dmg;
    p.iframes = 0.72;
    p.flash = 0.2;
    this.camera.shake = Math.min(16, 5 + dmg * 0.25);
    this.addText(p.x, p.y - 26, `-${Math.round(dmg)}`, '#ff6b6b', 17, true);
    this.burst(p.x, p.y, '#b51f2e', 10, 140, 2.5);
    this.audio?.hurt();

    if (this.hasPower('thorns')) {
      this.effects.push({ type: 'nova', x: p.x, y: p.y, radius: 110, t: 0, duration: 0.5, color: '#ff8a3d' });
      this.aoeDamage(p.x, p.y, 110, 90 * this.stats.damageMult, { color: '#ff8a3d', knockback: 160 });
    }

    if (p.hp <= 0) {
      p.hp = 0;
      this.burst(p.x, p.y, '#b51f2e', 26, 240, 3);
      this.endRun('dead', 'slain');
    }
  }

  killEnemy(e) {
    if (e.dead) return;
    e.dead = true;
    this.kills++;
    this.killsSinceItem++;
    this.camera.shake = Math.max(this.camera.shake, e.boss ? 10 : e.elite ? 5 : 1.4);
    this.burst(e.x, e.y, e.color, e.boss ? 26 : e.elite ? 14 : 5, e.boss ? 260 : 130, e.boss ? 4 : 2.4);
    if (Math.random() < 0.35) {
      this.decals.push({ x: e.x, y: e.y, r: rand(16, 6), alpha: rand(0.4, 0.16) });
      if (this.decals.length > 150) this.decals.shift();
    }
    this.audio?.kill(e.boss);

    this.spawnPickup('xp', e.x, e.y, e.xp);
    if (Math.random() < 0.52) {
      const gold = rand(e.gold[1], e.gold[0]) * (1 + this.stats.gold / 100);
      this.spawnPickup('gold', e.x + rand(8, -8), e.y + rand(8, -8), Math.max(1, Math.round(gold)));
    }

    if (this.hasPower('leech')) {
      this.player.hp = Math.min(this.player.maxHp, this.player.hp + 2);
    }
    if (this.hasPower('nova')) {
      this.novaCount++;
      if (this.novaCount % 5 === 0) {
        this.effects.push({ type: 'nova', x: this.player.x, y: this.player.y, radius: 100, t: 0, duration: 0.45, color: '#d9c9ff' });
        this.aoeDamage(this.player.x, this.player.y, 100, 70 * this.stats.damageMult, { color: '#d9c9ff', knockback: 90 });
      }
    }

    if (e.boss) {
      this.onBossKilled(e);
      return;
    }

    if (e.elite) {
      const ilvl = itemLevelFor(this.time, this.player.level);
      this.dropItem(e.x, e.y, { ilvl, luck: this.stats.luck });
      if (Math.random() < 0.5) this.dropItem(e.x + 18, e.y + 8, { ilvl, luck: this.stats.luck });
      this.killsSinceItem = 0;
    } else {
      const chance = 0.032 + this.stats.luck * 0.0006;
      if (this.killsSinceItem >= 32 || Math.random() < chance) {
        this.dropItem(e.x, e.y, { ilvl: itemLevelFor(this.time, this.player.level), luck: this.stats.luck });
        this.killsSinceItem = 0;
      }
    }
  }

  /* ── projectiles ───────────────────────────────────────────── */
  updateProjectiles(dt) {
    for (const pr of this.projectiles) {
      if (pr.dead) continue;
      pr.life -= dt;
      pr.x += pr.vx * dt;
      pr.y += pr.vy * dt;
      pr.trail.push({ x: pr.x, y: pr.y });
      if (pr.trail.length > 5) pr.trail.shift();
      if (pr.life <= 0) {
        pr.dead = true;
        continue;
      }
      for (const e of this.enemies) {
        if (e.dead || pr.hit.has(e.id)) continue;
        if (dist(pr.x, pr.y, e.x, e.y) > pr.r + e.r) continue;
        pr.hit.add(e.id);
        this.applyDamage(e, pr.dmg, pr.crit, { angle: pr.angle, knockback: pr.kind === 'arrow' ? 90 : 60, color: pr.color });
        if (this.hasPower('chain')) this.chainFrom(e, pr.dmg * 0.5);
        this.burst(pr.x, pr.y, pr.color, 5, 110, 2);
        if (pr.pierce > 0) {
          pr.pierce--;
        } else {
          pr.dead = true;
          break;
        }
      }
    }
  }

  chainFrom(source, dmg) {
    let best = null;
    let bestD = 180;
    for (const e of this.enemies) {
      if (e.dead || e === source) continue;
      const d = dist(source.x, source.y, e.x, e.y);
      if (d < bestD) {
        bestD = d;
        best = e;
      }
    }
    if (!best) return;
    this.effects.push({ type: 'chain', x1: source.x, y1: source.y, x2: best.x, y2: best.y, t: 0, duration: 0.16, color: '#9fe8ff' });
    this.applyDamage(best, dmg, false, { color: '#9fe8ff', angle: angleTo(source.x, source.y, best.x, best.y), knockback: 30 });
  }

  updateEnemyProjectiles(dt) {
    const p = this.player;
    for (const pr of this.enemyProjectiles) {
      if (pr.dead) continue;
      pr.life -= dt;
      pr.x += pr.vx * dt;
      pr.y += pr.vy * dt;
      if (pr.life <= 0) {
        pr.dead = true;
        continue;
      }
      if (dist(pr.x, pr.y, p.x, p.y) < pr.r + p.r) {
        pr.dead = true;
        this.hurtPlayer(pr.dmg);
        this.burst(pr.x, pr.y, pr.color, 6, 100, 2);
      }
    }
  }

  /* ── effects / particles ───────────────────────────────────── */
  updateEffects(dt) {
    const p = this.player;
    for (const ef of this.effects) {
      ef.t += dt;
      if (ef.type === 'whirl') {
        ef.x = p.x;
        ef.y = p.y;
        ef.tick -= dt;
        if (ef.tick <= 0) {
          ef.tick = 0.32;
          const hits = this.aoeDamage(ef.x, ef.y, ef.radius, ef.dmg, { color: '#ff9a9a', knockback: 40, crit: ef.crit });
          if (hits) this.camera.shake = Math.max(this.camera.shake, 2.4);
        }
      }
    }
    this.effects = this.effects.filter((ef) => ef.t < ef.duration);
  }

  updateParticles(dt) {
    for (const pt of this.particles) {
      pt.life -= dt;
      pt.x += pt.vx * dt;
      pt.y += pt.vy * dt;
      pt.vx *= Math.max(0, 1 - dt * 3);
      pt.vy *= Math.max(0, 1 - dt * 3);
      if (pt.gravity) pt.vy += pt.gravity * dt;
    }
    this.particles = this.particles.filter((pt) => pt.life > 0);
    for (const t of this.texts) {
      t.life -= dt;
      t.y += t.vy * dt;
      t.vy *= Math.max(0, 1 - dt * 2);
    }
    this.texts = this.texts.filter((t) => t.life > 0);
  }

  burst(x, y, color, count = 5, power = 100, size = 2.5) {
    if (this.particles.length > 520) return;
    for (let i = 0; i < count; i++) {
      const a = rand(TAU);
      const s = rand(power, power * 0.15);
      this.particles.push({
        x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 20,
        life: rand(0.65, 0.18), maxLife: 0.65, size: rand(size, 0.7), color, gravity: 40,
      });
    }
  }

  addText(x, y, text, color = '#f4ecdc', size = 13, big = false) {
    this.texts.push({ x, y, vy: big ? -52 : -34, life: big ? 1 : 0.75, maxLife: big ? 1 : 0.75, text, color, size, big });
    if (this.texts.length > 140) this.texts.shift();
  }

  /* ── pickups & loot ────────────────────────────────────────── */
  spawnPickup(kind, x, y, value) {
    this.pickups.push({
      kind, x, y,
      vx: rand(70, -70), vy: rand(70, -70),
      value, age: 0, bob: rand(TAU),
      item: null,
    });
  }

  dropItem(x, y, { ilvl = null, luck = 0, rarity = null } = {}) {
    const item = makeItem({
      ilvl: ilvl ?? itemLevelFor(this.time, this.player.level),
      luck,
      rarity,
      minRarity: rarity ? null : null,
    });
    this.pickups.push({
      kind: 'item', x, y,
      vx: rand(50, -50), vy: rand(50, -50),
      value: 0, age: 0, bob: rand(TAU),
      item,
    });
    if (item.rarity === 'legendary') {
      this.ui?.announce(`${item.name.toUpperCase()} — LEGENDARY`, 'legendary');
      this.audio?.legendary();
    }
    return item;
  }

  updatePickups(dt) {
    const p = this.player;
    for (const pk of this.pickups) {
      if (pk.taken) continue;
      pk.age += dt;
      pk.x += pk.vx * dt;
      pk.y += pk.vy * dt;
      pk.vx *= Math.max(0, 1 - dt * 4);
      pk.vy *= Math.max(0, 1 - dt * 4);
      const d = dist(pk.x, pk.y, p.x, p.y);

      if (pk.kind === 'item') {
        if (d < 34) {
          pk.taken = true;
          this.collectItem(pk);
        } else if (d < 70) {
          pk.x += (p.x - pk.x) * dt * 2;
          pk.y += (p.y - pk.y) * dt * 2;
        }
        continue;
      }

      const magnet = this.stats.magnet * (pk.kind === 'gold' ? 1.15 : 1);
      if (d < magnet) {
        const pull = 280 + (1 - d / magnet) * 640;
        pk.x += ((p.x - pk.x) / d) * pull * dt;
        pk.y += ((p.y - pk.y) / d) * pull * dt;
      }
      if (d < 22) {
        pk.taken = true;
        if (pk.kind === 'xp') {
          this.gainXp(pk.value);
          this.burst(pk.x, pk.y, '#7fe6ff', 3, 70, 1.8);
          this.audio?.gem();
        } else {
          this.gold += pk.value;
          this.goldEarned += pk.value;
          this.addText(pk.x, pk.y - 10, `+${pk.value}`, '#ffd75e', 12);
          this.burst(pk.x, pk.y, '#ffd75e', 3, 80, 1.8);
          this.audio?.coin();
        }
      }
    }
    this.pickups = this.pickups.filter((pk) => !pk.taken);
  }

  collectItem(pk) {
    const item = pk.item;
    const result = this.receiveItem(item);
    this.itemsFound++;
    if (!this.bestItem || RARITY_ORDER.indexOf(item.rarity) > RARITY_ORDER.indexOf(this.bestItem.rarity) || (item.rarity === this.bestItem.rarity && item.power > this.bestItem.power)) {
      this.bestItem = item;
    }
    this.audio?.loot(item.rarity);
    this.ui?.lootToast(item, result);
    if (item.rarity === 'legendary') this.audio?.legendary();
  }

  receiveItem(item) {
    const slot = item.slot;
    const current = this.equipment[slot];
    if (!current) {
      this.equipment[slot] = item;
      this.recompute();
      this.ui?.refreshInventory();
      return { action: 'equipped', compare: null };
    }
    if (this.autoEquip && item.power > current.power * 1.02) {
      this.equipment[slot] = item;
      const old = current;
      if (this.inventory.length < MAX_BAG) this.inventory.push(old);
      else {
        this.gold += old.sellValue;
        this.goldEarned += old.sellValue;
      }
      this.recompute();
      this.ui?.refreshInventory();
      return { action: 'upgraded', compare: item.power - current.power, old };
    }
    if (this.inventory.length < MAX_BAG) {
      this.inventory.push(item);
      this.ui?.refreshInventory();
      return { action: 'stashed', compare: item.power - current.power };
    }
    this.gold += item.sellValue;
    this.goldEarned += item.sellValue;
    return { action: 'sold', compare: item.power - current.power, sold: item.sellValue };
  }

  grantItem(item) {
    const result = this.receiveItem(item);
    this.itemsFound++;
    if (!this.bestItem || RARITY_ORDER.indexOf(item.rarity) > RARITY_ORDER.indexOf(this.bestItem.rarity)) this.bestItem = item;
    this.ui?.lootToast(item, result);
    return result;
  }

  /* ── progression ───────────────────────────────────────────── */
  gainXp(amount) {
    const p = this.player;
    p.xp += amount * (1 + this.stats.xp / 100);
    while (p.xp >= p.xpNext) {
      p.xp -= p.xpNext;
      p.level++;
      p.xpNext = Math.floor(8 + (p.level - 1) * 5 + Math.pow(p.level - 1, 1.65));
      p.hp = Math.min(p.maxHp, p.hp + 4);
      this.pendingLevels++;
      this.audio?.levelup();
      this.effects.push({ type: 'nova', x: p.x, y: p.y, radius: 130, t: 0, duration: 0.6, color: '#ffd75e' });
    }
    if (this.pendingLevels > 0 && this.state === 'playing') {
      this.ui?.openLevelUp();
    }
  }

  getUpgradeChoices() {
    const pool = [];
    for (const skill of SKILLS) {
      const lvl = this.skills[skill.id] || 0;
      if (!skill.repeatable && lvl >= skill.max) continue;
      if (skill.repeatable && lvl >= skill.max) continue;
      let weight = skill.weight;
      if (skill.special === 'heal') weight *= this.player.hp < this.player.maxHp * 0.5 ? 2.4 : 0.5;
      if (skill.special === 'item') weight *= 1.1;
      pool.push({ skill, level: lvl, weight });
    }
    const out = [];
    const used = new Set();
    while (out.length < 3 && pool.length > used.size) {
      let total = 0;
      for (const o of pool) if (!used.has(o.skill.id)) total += o.weight;
      if (total <= 0) break;
      let roll = Math.random() * total;
      let chosen = null;
      for (const o of pool) {
        if (used.has(o.skill.id)) continue;
        roll -= o.weight;
        if (roll <= 0) {
          chosen = o;
          break;
        }
      }
      if (!chosen) chosen = pool.find((o) => !used.has(o.skill.id));
      used.add(chosen.skill.id);
      out.push(chosen);
    }
    return out;
  }

  rerollChoices() {
    if (this.gold < this.rerollCost) return false;
    this.gold -= this.rerollCost;
    this.rerolls++;
    this.rerollCost = 25 + this.rerolls * 15;
    this.audio?.ui();
    return true;
  }

  applyUpgrade(skill) {
    const lvl = this.skills[skill.id] || 0;
    if (!skill.repeatable && lvl >= skill.max) return;
    if (skill.special === 'heal') {
      this.player.hp = Math.min(this.player.maxHp, this.player.hp + this.player.maxHp * 0.35);
    } else if (skill.special === 'item') {
      const item = makeItem({
        ilvl: itemLevelFor(this.time, this.player.level) + 2,
        minRarity: 'rare',
        luck: this.stats.luck,
      });
      this.grantItem(item);
    } else {
      this.skills[skill.id] = lvl + 1;
    }
    this.pendingLevels = Math.max(0, this.pendingLevels - 1);
    this.recompute();
    this.audio?.boon();
  }

  /* ── inventory ─────────────────────────────────────────────── */
  equipItem(item) {
    const idx = this.inventory.indexOf(item);
    if (idx < 0) return false;
    const prev = this.equipment[item.slot];
    this.inventory.splice(idx, 1);
    this.equipment[item.slot] = item;
    if (prev) this.inventory.push(prev);
    this.recompute();
    this.audio?.equip();
    return true;
  }

  unequip(slot) {
    const item = this.equipment[slot];
    if (!item) return false;
    if (this.inventory.length >= MAX_BAG) {
      this.ui?.toast('Satchel full', 'The item stays equipped.', 'common');
      return false;
    }
    this.equipment[slot] = null;
    this.inventory.push(item);
    this.recompute();
    this.audio?.equip();
    return true;
  }

  sellItem(item) {
    const idx = this.inventory.indexOf(item);
    if (idx < 0) return false;
    this.inventory.splice(idx, 1);
    this.gold += item.sellValue;
    this.audio?.coin();
    this.ui?.toast('Sold', `${item.name} · +${item.sellValue}g`, item.rarity);
    return true;
  }

  sellJunk() {
    const junk = this.inventory.filter((i) => i.rarity === 'common' || i.rarity === 'magic');
    if (!junk.length) return 0;
    let total = 0;
    for (const item of junk) total += item.sellValue;
    this.inventory = this.inventory.filter((i) => !junk.includes(i));
    this.gold += total;
    this.audio?.coin();
    this.ui?.toast('Junk sold', `${junk.length} items · +${total}g`, 'magic');
    return total;
  }

  sortBag() {
    const order = { legendary: 3, rare: 2, magic: 1, common: 0 };
    this.inventory.sort((a, b) => order[b.rarity] - order[a.rarity] || b.power - a.power);
  }

  setAutoEquip(value) {
    this.autoEquip = !!value;
    store.set('cryptfall.autoEquip', this.autoEquip);
  }
}
