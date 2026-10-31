// GRAVEBOUND — run logic: survivor combat, hordes, elites, the boss, and loot.
import { mulberry32, rand, randInt, pick, weightedPick, shuffle } from './rng.js';
import { generateItem, itemScore, SLOTS, SLOT_META, aggregateStats, hasPower } from './loot.js';
import { AudioEngine } from './audio.js';
import { Renderer } from './renderer.js';

export const WORLD = { w: 2800, h: 2000 };
const BAG_SIZE = 24;
const BOSS_TIME = 240;
const BOSS_WARN_TIME = 236;

const ENEMY_TYPES = {
  ghoul: { hp: 26, dmg: 7, speed: 55, radius: 15, xp: 1, sprite: 'ghoul', size: 62 },
  skeleton: { hp: 42, dmg: 9, speed: 62, radius: 15, xp: 2, sprite: 'skeleton', size: 64 },
  bat: { hp: 16, dmg: 5, speed: 112, radius: 11, xp: 1, sprite: 'bat', size: 50 },
  wraith: { hp: 62, dmg: 12, speed: 76, radius: 15, xp: 3, sprite: 'wraith', size: 68 },
  brute: { hp: 170, dmg: 18, speed: 42, radius: 25, xp: 6, sprite: 'brute', size: 88 },
};

const ELITE_NAMES = ['Gorehowl', 'Maldris', 'Vex the Pale', 'The Widow', 'Carrion Lord', 'Bonegnasher', 'Sable', 'Grimjaw', 'Ossuary Saint', 'The Drowned'];

const UPGRADE_DEFS = {
  scythe: {
    name: 'Grave Scythe', icon: '☾', tag: 'Weapon', max: 5,
    desc: () => 'Sweep a wider, crueler arc. Damage and reach grow with every rank.',
  },
  bolt: {
    name: 'Soul Bolt', icon: '✦', tag: 'Weapon', max: 5,
    desc: () => 'Hurl spectral bolts at the nearest foes. More bolts, more pain.',
  },
  blades: {
    name: 'Bone Halo', icon: '✧', tag: 'Weapon', max: 5,
    desc: () => 'Orbiting bone blades shred anything that gets close. Adds another blade each rank.',
  },
  aura: {
    name: 'Blood Miasma', icon: '◉', tag: 'Weapon', max: 5,
    desc: () => 'A reeking aura rots every enemy near you. Grows wider and deadlier.',
  },
  storm: {
    name: 'Grave Storm', icon: '⚡', tag: 'Weapon', max: 5,
    desc: () => 'Call jagged lightning down on random enemies. More strikes each rank.',
  },
  vitality: {
    name: 'Vitality', icon: '♥', tag: 'Rite', max: 5,
    desc: () => '+18 max health, and mend 25% of your wounds.',
  },
  swift: {
    name: 'Wraithstep', icon: '➤', tag: 'Rite', max: 5,
    desc: () => '+7% movement speed. Outrun the dark.',
  },
  precision: {
    name: 'Precision', icon: '✜', tag: 'Rite', max: 5,
    desc: () => '+4% critical chance and +12% critical damage.',
  },
  magnetism: {
    name: 'Grave Magnet', icon: '◈', tag: 'Rite', max: 5,
    desc: () => '+25% pickup radius and +8% experience gain.',
  },
  bulwark: {
    name: 'Bone Bulwark', icon: '⛨', tag: 'Rite', max: 5,
    desc: () => '+6 armor and +0.2 health regeneration per second.',
  },
  blood: {
    name: 'Blood Offering', icon: '♰', tag: 'Rite', max: 99,
    desc: () => 'Mend 30% of your wounds and gain +8 max health.',
  },
};

const UPGRADE_ORDER = ['scythe', 'bolt', 'blades', 'aura', 'storm', 'vitality', 'swift', 'precision', 'magnetism', 'bulwark', 'blood'];

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

export class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.audio = new AudioEngine();
    this.renderer = new Renderer(canvas);
    this.ui = null;
    this.state = 'title';
    this.seed = (Date.now() ^ 0x9e3779b9) >>> 0;
    this.rng = mulberry32(this.seed);
    this.keys = new Set();
    this.stick = { active: false, id: null, dx: 0, dy: 0 };
    this.viewW = window.innerWidth;
    this.viewH = window.innerHeight;
    this.animTime = 0;
    this.camera = { x: WORLD.w / 2, y: WORLD.h / 2, shakeX: 0, shakeY: 0, trauma: 0 };
    this.props = this.makeProps();
    this.titleLoot = [];
    this.hintTimer = 0;
    this.resize = this.resize.bind(this);
    window.addEventListener('resize', this.resize);
    this.bindInput();
    this.resetRun(true);
    this.resize();
  }

  /* ---------------------------------------------------------- setup */

  makeProps() {
    const rng = mulberry32(7331);
    const props = [];
    const types = [
      { kind: 'tombstone', weight: 26 }, { kind: 'cross', weight: 14 },
      { kind: 'tree', weight: 12 }, { kind: 'candles', weight: 12 },
      { kind: 'pillar', weight: 8 }, { kind: 'bones', weight: 14 },
      { kind: 'mushrooms', weight: 8 }, { kind: 'statue', weight: 4 },
      { kind: 'fence', weight: 6 },
    ];
    for (let i = 0; i < 116; i++) {
      const kind = weightedPick(rng, types);
      const x = rand(rng, 90, WORLD.w - 90);
      const y = rand(rng, 90, WORLD.h - 90);
      if (Math.hypot(x - WORLD.w / 2, y - WORLD.h / 2) < 230) continue;
      props.push({
        x, y, kind,
        variant: randInt(rng, 0, 1),
        scale: rand(rng, 0.72, 1.25),
        flip: rng() > 0.5,
        rot: rand(rng, -0.06, 0.06),
        glow: kind === 'candles' || kind === 'mushrooms',
      });
    }
    props.sort((a, b) => a.y - b.y);
    return props;
  }

  resize() {
    this.viewW = window.innerWidth;
    this.viewH = window.innerHeight;
    this.renderer.resize(this.viewW, this.viewH);
  }

  resetRun(preview = false) {
    this.state = preview ? 'title' : 'playing';
    this.rng = mulberry32(this.seed);
    this.player = {
      x: WORLD.w / 2 + (preview ? 0 : rand(this.rng, -30, 30)),
      y: WORLD.h / 2 + (preview ? 0 : rand(this.rng, -30, 30)),
      vx: 0, vy: 0, radius: 13, facing: 1, walk: 0,
      hp: 120, maxHp: 120, level: 1, xp: 0, xpNext: 10,
      invuln: 0, hitFlash: 0, dead: false,
    };
    this.run = {
      time: 0, kills: 0, itemsFound: 0, legendary: 0, elites: 0, fiends: 0,
      damageDealt: 0, startTime: performance.now(),
    };
    this.equipment = { weapon: null, helm: null, armor: null, boots: null, amulet: null, ring: null };
    this.bag = [];
    this.souls = 0;
    this.upgrades = { scythe: 1, bolt: 1 };
    this.pendingLevels = 0;
    this.levelOffers = [];
    this.stats = {};
    this.powers = new Set();
    this.cooldowns = { swing: 0, bolt: 0, storm: 0, aura: 0, blades: 0 };
    this.bladeAngle = 0;
    this.enemies = [];
    this.projectiles = [];
    this.enemyProjectiles = [];
    this.gems = [];
    this.loot = [];
    this.particles = [];
    this.texts = [];
    this.effects = [];
    this.grid = new Map();
    this.boss = null;
    this.bossState = { warned: false, spawned: false, dead: false, warningTimer: 0 };
    this.victoryTimer = 0;
    this.spawnTimer = 1.3;
    this.eliteTimer = 30;
    this.fiendTimer = 42;
    this.eliteCount = 0;
    this.fiendCount = 0;
    this.camera.x = this.player.x;
    this.camera.y = this.player.y;
    this.camera.trauma = 0;
    this.camera.shakeX = 0;
    this.camera.shakeY = 0;
    this.renderer.clearDecals();
    this.recomputeStats(true);
    this.player.hp = this.player.maxHp;

    this.titleLoot = [];
    if (preview) {
      const previewRng = mulberry32(4242);
      const rarities = ['mythic', 'legendary', 'rare', 'magic'];
      rarities.forEach((rarity, i) => {
        const angle = -0.9 + i * 0.6;
        const item = generateItem(previewRng, { ilvl: 12, rarity });
        this.titleLoot.push({
          x: this.player.x + Math.cos(angle) * (160 + i * 56),
          y: this.player.y + 70 + Math.sin(angle) * (90 + i * 36),
          item, age: 0, bob: i * 1.7, seed: i * 3.1, preview: true,
        });
      });
    }
  }

  /* ---------------------------------------------------------- input */

  bindInput() {
    window.addEventListener('keydown', (e) => {
      const key = e.key.toLowerCase();
      if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' ', 'tab'].includes(key)) e.preventDefault();
      if (e.repeat) return;
      if (this.state === 'title') {
        if (key === ' ' || key === 'enter') this.startRun();
        return;
      }
      if (this.state === 'levelup') {
        if (['1', '2', '3'].includes(key)) this.chooseOffer(Number(key) - 1);
        if (key === 'escape') { /* a boon must be chosen */ }
        return;
      }
      if (this.state === 'inventory') {
        if (key === 'i' || key === 'tab' || key === 'escape') this.closeInventory();
        return;
      }
      if (this.state === 'dead' || this.state === 'victory') {
        if (key === 'r') this.startRun();
        return;
      }
      if (this.state === 'paused') {
        if (key === 'escape' || key === 'p') this.resume();
        if (key === 'i') { this.ui?.hidePause(); this.openInventory(); }
        return;
      }
      if (this.state === 'playing') {
        if (key === 'i' || key === 'tab') { e.preventDefault(); this.openInventory(); }
        else if (key === 'escape' || key === 'p') this.pause();
        else if (key === 'm') this.toggleMute();
        else this.keys.add(key);
      }
    });
    window.addEventListener('keyup', (e) => this.keys.delete(e.key.toLowerCase()));
    window.addEventListener('blur', () => {
      this.keys.clear();
      this.stick.active = false;
      this.ui?.hideJoystick();
      if (this.state === 'playing') this.pause();
    });

    const canvas = this.canvas;
    canvas.addEventListener('pointerdown', (e) => {
      if (this.state !== 'playing') return;
      if (e.pointerType === 'mouse') return;
      if (e.clientX > this.viewW * 0.68) return;
      this.stick.active = true;
      this.stick.id = e.pointerId;
      this.stick.ox = e.clientX;
      this.stick.oy = e.clientY;
      this.stick.dx = 0;
      this.stick.dy = 0;
      canvas.setPointerCapture?.(e.pointerId);
      this.ui?.showJoystick(e.clientX, e.clientY);
      e.preventDefault();
    });
    canvas.addEventListener('pointermove', (e) => {
      if (!this.stick.active || e.pointerId !== this.stick.id) return;
      let dx = e.clientX - this.stick.ox;
      let dy = e.clientY - this.stick.oy;
      const dist = Math.hypot(dx, dy);
      const max = 46;
      if (dist > max) { dx = (dx / dist) * max; dy = (dy / dist) * max; }
      this.stick.dx = dx / max;
      this.stick.dy = dy / max;
      this.ui?.moveJoystick(dx, dy);
      e.preventDefault();
    });
    const release = (e) => {
      if (!this.stick.active || e.pointerId !== this.stick.id) return;
      this.stick.active = false;
      this.stick.dx = 0;
      this.stick.dy = 0;
      this.stick.id = null;
      this.ui?.hideJoystick();
      e.preventDefault();
    };
    canvas.addEventListener('pointerup', release);
    canvas.addEventListener('pointercancel', release);
    canvas.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  get moveVector() {
    let dx = 0;
    let dy = 0;
    if (this.keys.has('a') || this.keys.has('arrowleft')) dx -= 1;
    if (this.keys.has('d') || this.keys.has('arrowright')) dx += 1;
    if (this.keys.has('w') || this.keys.has('arrowup')) dy -= 1;
    if (this.keys.has('s') || this.keys.has('arrowdown')) dy += 1;
    dx += this.stick.dx;
    dy += this.stick.dy;
    const len = Math.hypot(dx, dy);
    if (len > 1) { dx /= len; dy /= len; }
    return { x: dx, y: dy };
  }

  /* ---------------------------------------------------------- flow */

  startRun() {
    this.audio.init();
    this.audio.click();
    this.resetRun(false);
    this.ui?.startRun();
    this.ui?.banner({ kicker: 'THE HUNT BEGINS', name: 'Survive', sub: 'Chase the beams. Build the legend.', color: '#f2d79a', duration: 2600 });
  }

  pause() {
    if (this.state !== 'playing') return;
    this.state = 'paused';
    this.keys.clear();
    this.stick.active = false;
    this.ui?.hideJoystick();
    this.ui?.showPause(this);
  }

  resume() {
    if (this.state !== 'paused') return;
    this.state = 'playing';
    this.ui?.hidePause();
  }

  openInventory() {
    if (this.state !== 'playing' && this.state !== 'paused') return;
    this.state = 'inventory';
    this.keys.clear();
    this.ui?.hidePause();
    this.ui?.openInventory(this);
  }

  closeInventory() {
    if (this.state !== 'inventory') return;
    this.state = 'playing';
    this.ui?.hideInventory();
    if (this.pendingLevels > 0) this.showLevelUp();
  }

  toggleMute() {
    const muted = this.audio.toggleMuted();
    this.ui?.setMuted(muted);
  }

  frame(dt) {
    this.animTime += dt;
    if (this.state === 'playing') this.update(dt);
    else if (this.state === 'title') this.updateAmbient(dt);
    this.renderer.render(this);
    this.ui?.updateHud();
  }

  updateAmbient(dt) {
    const camTarget = {
      x: WORLD.w / 2 + Math.sin(this.animTime * 0.07) * 40,
      y: WORLD.h / 2 + Math.cos(this.animTime * 0.05) * 22,
    };
    this.camera.x = lerp(this.camera.x, camTarget.x, 1 - Math.pow(0.2, dt));
    this.camera.y = lerp(this.camera.y, camTarget.y, 1 - Math.pow(0.2, dt));
    this.camera.shakeX = 0;
    this.camera.shakeY = 0;
    if (Math.random() < dt * 6) {
      this.particles.push({
        x: this.player.x + rand(this.rng, -260, 260),
        y: this.player.y + rand(this.rng, 20, 220),
        vx: rand(this.rng, -6, 6), vy: rand(this.rng, -18, -6),
        life: rand(this.rng, 1.5, 3), maxLife: 3, size: rand(this.rng, 0.6, 1.6),
        color: '#ff965a', glow: true,
      });
    }
    this.updateParticles(dt);
    this.updateTexts(dt);
  }

  /* ---------------------------------------------------------- stats */

  recomputeStats(initial = false) {
    const items = SLOTS.map((slot) => this.equipment[slot]).filter(Boolean);
    const sum = aggregateStats(items);
    this.powers = new Set(items.filter((item) => item.legendary).map((item) => item.legendary.id));
    const vit = this.upgrades.vitality || 0;
    const swift = this.upgrades.swift || 0;
    const precision = this.upgrades.precision || 0;
    const magnetism = this.upgrades.magnetism || 0;
    const bulwark = this.upgrades.bulwark || 0;
    const blood = this.upgrades.blood || 0;

    const oldMax = this.player?.maxHp || 120;
    const maxHp = Math.round(120 + (sum.maxHp || 0) + vit * 18 + blood * 8);
    const armor = (sum.armor || 0) + bulwark * 6;
    const damagePct = (sum.damagePct || 0) + (this.powers.has('berserk') ? 0 : 0);
    this.stats = {
      damagePct,
      flatDamage: sum.flatDamage || 0,
      attackSpeed: 1 + (sum.attackSpeed || 0) / 100 + (this.powers.has('swift') ? 0.1 : 0),
      critChance: clamp(0.05 + (sum.critChance || 0) / 100 + precision * 0.04, 0, 0.75),
      critMult: 1.5 + (sum.critDamage || 0) / 100 + precision * 0.12,
      maxHp,
      armor,
      armorDR: Math.min(0.7, armor / (armor + 130)),
      moveSpeed: 228 * (1 + (sum.moveSpeed || 0) / 100 + swift * 0.07 + (this.powers.has('swift') ? 0.15 : 0)),
      pickupRadius: (78 + (sum.pickup || 0)) * (1 + magnetism * 0.25) + (this.powers.has('gravity') ? 140 : 0),
      xpMult: 1 + (sum.xpGain || 0) / 100 + magnetism * 0.08,
      regen: (sum.regen || 0) + bulwark * 0.2,
      luck: sum.luck || 0,
      area: 1 + (sum.area || 0) / 100,
      projectiles: sum.projectiles || 0,
      lifesteal: this.powers.has('vampiric') ? 0.06 : 0,
    };
    if (!initial && this.player) {
      this.player.maxHp = maxHp;
      this.player.hp = clamp(this.player.hp + (maxHp - oldMax), 1, maxHp);
    } else if (this.player) {
      this.player.maxHp = maxHp;
      this.player.hp = Math.min(this.player.hp, maxHp);
    }
  }

  damageMultiplier() {
    let mult = 1 + this.stats.damagePct / 100;
    if (this.powers.has('berserk') && this.player.hp < this.player.maxHp * 0.5) mult *= 1.3;
    return mult;
  }

  weaponDamage(kind) {
    const rank = this.upgrades[kind] || 0;
    if (!rank) return 0;
    const tables = {
      scythe: [0, 16, 23, 32, 44, 58],
      bolt: [0, 11, 15, 21, 29, 39],
      blades: [0, 8, 12, 17, 23, 30],
      aura: [0, 4, 6, 9, 12, 16],
      storm: [0, 26, 36, 48, 62, 78],
    };
    return tables[kind][Math.min(rank, tables[kind].length - 1)] * this.damageMultiplier() + this.stats.flatDamage;
  }

  /* ---------------------------------------------------------- offers */

  buildOffers() {
    const pool = UPGRADE_ORDER.filter((id) => (this.upgrades[id] || 0) < UPGRADE_DEFS[id].max);
    const weighted = pool.map((id) => ({ value: id, weight: (this.upgrades[id] || 0) === 0 ? 1.25 : 1 }));
    const offers = [];
    while (offers.length < 3 && weighted.length) {
      const id = weightedPick(this.rng, weighted);
      const index = weighted.findIndex((entry) => entry.value === id);
      if (index >= 0) weighted.splice(index, 1);
      const def = UPGRADE_DEFS[id];
      const rank = this.upgrades[id] || 0;
      offers.push({ id, name: def.name, icon: def.icon, tag: def.tag, desc: def.desc(), rank, max: def.max, isNew: rank === 0 });
    }
    return offers;
  }

  showLevelUp() {
    if (this.bossState.dead || this.victoryTimer > 0) {
      this.pendingLevels = 0;
      return;
    }
    this.state = 'levelup';
    this.keys.clear();
    this.stick.active = false;
    this.ui?.hideJoystick();
    this.audio.levelup();
    this.levelOffers = this.buildOffers();
    this.ui?.showLevelUp(this.levelOffers);
  }

  chooseOffer(index) {
    if (this.state !== 'levelup') return;
    const offer = this.levelOffers[index];
    if (!offer) return;
    this.audio.click();
    const def = UPGRADE_DEFS[offer.id];
    const before = this.upgrades[offer.id] || 0;
    if (before >= def.max) return;
    this.upgrades[offer.id] = before + 1;
    this.pendingLevels = Math.max(0, this.pendingLevels - 1);
    this.recomputeStats();
    if (offer.id === 'vitality' || offer.id === 'blood') {
      this.player.hp = clamp(this.player.hp + this.player.maxHp * (offer.id === 'blood' ? 0.3 : 0.25), 0, this.player.maxHp);
      this.audio.heal();
    }
    this.burst(this.player.x, this.player.y, 22, '#c9a962', 120);
    this.addText(this.player.x, this.player.y - 52, offer.id === 'blood' ? 'BLOOD OFFERING' : def.name.toUpperCase(), '#f2d79a', 13, 0.9);
    if (this.pendingLevels > 0) {
      this.levelOffers = this.buildOffers();
      this.ui?.refreshLevelUp(this.levelOffers);
    } else {
      this.state = 'playing';
      this.ui?.hideLevelUp();
    }
  }

  /* ---------------------------------------------------------- inventory */

  equipItem(item) {
    const index = this.bag.indexOf(item);
    if (index < 0) return;
    const previous = this.equipment[item.slot];
    this.equipment[item.slot] = item;
    this.bag.splice(index, 1);
    if (previous) this.bag.push(previous);
    this.audio.click();
    this.recomputeStats();
    this.ui?.refreshInventory(this);
    this.ui?.updateHud();
  }

  salvageItem(item) {
    const index = this.bag.indexOf(item);
    if (index < 0) return;
    this.bag.splice(index, 1);
    const gained = 4 + item.ilvl * 3 + Math.round(item.score / 12);
    this.souls += 1;
    this.audio.click();
    this.addXp(gained);
    if (this.pendingLevels > 0) {
      this.state = 'playing';
      this.ui?.hideInventory();
      this.showLevelUp();
    } else {
      this.ui?.refreshInventory(this);
      this.ui?.pushFeed(item, null, `devoured · +${gained} XP`);
    }
  }

  /* ---------------------------------------------------------- loot */

  rollLoot(enemy) {
    const luck = this.stats.luck || 0;
    const ilvl = 1 + Math.floor(this.run.time / 18);
    const drops = [];
    if (enemy.elite) {
      drops.push({ minRarity: 'magic' });
      if (this.rng() < 0.55) drops.push({ minRarity: 'magic' });
      if (this.rng() < 0.22) drops.push({ minRarity: 'rare' });
    } else if (enemy.fiend) {
      const count = randInt(this.rng, 3, 4);
      for (let i = 0; i < count; i++) drops.push({ minRarity: 'magic' });
    } else {
      const chance = enemy.type === 'brute' ? 0.075 : 0.021;
      if (this.rng() < chance + luck * 0.0007) drops.push({ minRarity: 'common' });
    }
    drops.forEach((drop, i) => {
      const angle = this.rng() * Math.PI * 2;
      const dist = rand(this.rng, 12, 44 + i * 9);
      const item = generateItem(this.rng, { ilvl, luck, minRarity: drop.minRarity });
      this.spawnLoot(enemy.x + Math.cos(angle) * dist, enemy.y + Math.sin(angle) * dist, item);
    });
  }

  spawnLoot(x, y, item) {
    this.loot.push({
      x: clamp(x, 30, WORLD.w - 30),
      y: clamp(y, 30, WORLD.h - 30),
      item, age: 0, bob: this.rng() * Math.PI * 2,
      seed: this.rng() * 100, preview: false,
    });
  }

  pickLoot(drop) {
    const item = drop.item;
    if (!item) return;
    drop.dead = true;
    this.run.itemsFound += 1;
    if (item.rarity === 'legendary' || item.rarity === 'mythic') this.run.legendary += 1;
    const equipped = this.equipment[item.slot];
    let delta = item.score - (equipped ? equipped.score : 0);
    let equippedNow = false;
    if (!equipped) {
      this.equipment[item.slot] = item;
      equippedNow = true;
      this.recomputeStats();
    } else if (this.bag.length >= BAG_SIZE) {
      let weakest = this.bag[0];
      for (const bagItem of this.bag) if (bagItem.score < weakest.score) weakest = bagItem;
      if (item.score > weakest.score) {
        this.bag.splice(this.bag.indexOf(weakest), 1);
        this.bag.push(item);
        delta = item.score - weakest.score;
        this.ui?.pushFeed(item, delta, 'satchel full · weakest devoured');
      } else {
        this.souls += 1;
        this.addXp(4 + item.ilvl * 3);
        this.ui?.pushFeed(item, null, 'satchel full · devoured');
        delta = null;
      }
    } else {
      this.bag.push(item);
    }
    this.audio.pickup(item.rarity);
    if (delta !== null) {
      this.ui?.pushFeed(item, equippedNow ? null : delta, equippedNow ? 'equipped' : '');
    }
    this.burst(drop.x, drop.y, 12, item.rarity === 'mythic' ? '#ff3b5c' : item.rarity === 'legendary' ? '#ff9138' : '#c9a962', 110);
    this.addText(drop.x, drop.y - 24, item.rarity === 'mythic' ? 'MYTHIC DROP' : item.rarity === 'legendary' ? 'LEGENDARY' : 'LOOT', item.rarity === 'mythic' ? '#ff6b83' : item.rarity === 'legendary' ? '#ffb36a' : '#d9c79a', 10, 0.9);
    if (item.rarity === 'legendary' || item.rarity === 'mythic') {
      this.camera.trauma = Math.min(1, this.camera.trauma + 0.3);
      this.ui?.banner({
        kicker: item.rarity === 'mythic' ? 'MYTHIC RELIC' : 'LEGENDARY RELIC',
        name: item.name,
        sub: item.legendary ? item.legendary.name : '',
        color: item.rarity === 'mythic' ? '#ff5c78' : '#ffb066',
        duration: 3200,
      });
    }
    this.ui?.refreshInventory?.(this);
  }

  /* ---------------------------------------------------------- combat helpers */

  addText(x, y, text, color = '#fff', size = 12, life = 0.8) {
    this.texts.push({ x, y, text, color, size, life, maxLife: life, vy: -42 - size * 2 });
    if (this.texts.length > 70) this.texts.shift();
  }

  burst(x, y, count, color, speed = 100, gravity = 0) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const s = speed * (0.2 + Math.random() * 0.8);
      this.particles.push({
        x, y, vx: Math.cos(angle) * s, vy: Math.sin(angle) * s - speed * 0.15,
        life: 0.4 + Math.random() * 0.7, maxLife: 1.1,
        size: 1 + Math.random() * 2.6, color, gravity, glow: Math.random() < 0.6,
      });
    }
    if (this.particles.length > 600) this.particles.splice(0, this.particles.length - 600);
  }

  shockwave(x, y, radius, color, life = 0.4) {
    this.effects.push({ type: 'ring', x, y, radius, color, life, maxLife: life });
  }

  updateParticles(dt) {
    for (const p of this.particles) {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += (p.gravity || 0) * dt;
      p.vx *= Math.pow(0.2, dt);
      p.vy *= Math.pow(0.4, dt);
      p.life -= dt;
    }
    this.particles = this.particles.filter((p) => p.life > 0);
  }

  updateTexts(dt) {
    for (const t of this.texts) {
      t.y += t.vy * dt;
      t.vy *= Math.pow(0.25, dt);
      t.life -= dt;
    }
    this.texts = this.texts.filter((t) => t.life > 0);
  }

  /* ---------------------------------------------------------- frame update */

  update(dt) {
    const p = this.player;
    this.run.time += dt;
    this.updatePlayer(dt);
    if (this.state !== 'playing') return;
    this.updateBossTimeline(dt);
    this.updateSpawning(dt);
    this.updateEnemies(dt);
    this.updateCombat(dt);
    this.updateProjectiles(dt);
    this.updateGems(dt);
    this.updateLoot(dt);
    this.updateEffects(dt);
    this.updateParticles(dt);
    this.updateTexts(dt);
    this.updateCamera(dt);

    this.enemies = this.enemies.filter((e) => !e.dead);
    this.projectiles = this.projectiles.filter((p2) => !p2.dead);
    this.enemyProjectiles = this.enemyProjectiles.filter((p2) => !p2.dead);
    this.gems = this.gems.filter((g) => !g.dead);
    this.loot = this.loot.filter((l) => !l.dead);
    this.effects = this.effects.filter((e) => e.life > 0);
    if (this.victoryTimer > 0) {
      this.victoryTimer -= dt;
      if (this.victoryTimer <= 0) this.endRun('victory');
    }
  }

  updatePlayer(dt) {
    const p = this.player;
    const move = this.moveVector;
    p.vx = move.x * this.stats.moveSpeed;
    p.vy = move.y * this.stats.moveSpeed;
    p.x = clamp(p.x + p.vx * dt, 26, WORLD.w - 26);
    p.y = clamp(p.y + p.vy * dt, 26, WORLD.h - 26);
    if (move.x < -0.1) p.facing = -1;
    else if (move.x > 0.1) p.facing = 1;
    p.walk += Math.hypot(p.vx, p.vy) * dt;
    p.invuln = Math.max(0, p.invuln - dt);
    p.hitFlash = Math.max(0, p.hitFlash - dt);
    if (this.stats.regen > 0) p.hp = Math.min(p.maxHp, p.hp + this.stats.regen * dt);
    if (p.hp <= 0 && this.state === 'playing') this.die();
  }

  updateBossTimeline(dt) {
    if (!this.bossState.warned && this.run.time >= BOSS_WARN_TIME) {
      this.bossState.warned = true;
      this.bossState.warningTimer = 4;
      this.audio.boss();
      this.ui?.bossWarning(true);
      this.camera.trauma = Math.min(1, this.camera.trauma + 0.45);
    }
    if (this.bossState.warningTimer > 0) {
      this.bossState.warningTimer -= dt;
      if (this.bossState.warningTimer <= 0) this.ui?.bossWarning(false);
    }
    if (!this.bossState.spawned && this.run.time >= BOSS_TIME) this.spawnBoss();
  }

  updateSpawning(dt) {
    if (this.bossState.dead) return;
    const cap = this.isCoarse ? 200 : 270;
    this.spawnTimer -= dt;
    if (this.spawnTimer <= 0) {
      const interval = Math.max(0.17, 0.95 - this.run.time * 0.0026);
      this.spawnTimer = interval;
      const count = Math.min(5, 1 + Math.floor(this.run.time / 80));
      for (let i = 0; i < count && this.enemies.length < cap; i++) {
        const type = this.rollEnemyType();
        this.spawnAtRing(type);
      }
    }

    this.eliteTimer -= dt;
    if (this.eliteTimer <= 0) {
      this.eliteTimer = rand(this.rng, 32, 44);
      if (this.enemies.length < cap - 4) this.spawnElite();
    }

    this.fiendTimer -= dt;
    if (this.fiendTimer <= 0) {
      this.fiendTimer = rand(this.rng, 46, 62);
      if (this.enemies.length < cap - 4) this.spawnFiend();
    }
  }

  get isCoarse() {
    return window.matchMedia?.('(pointer: coarse)').matches || this.viewW < 720;
  }

  rollEnemyType() {
    const t = this.run.time;
    const pool = [{ value: 'ghoul', weight: 52 }];
    if (t > 16) pool.push({ value: 'skeleton', weight: 34 });
    if (t > 42) pool.push({ value: 'bat', weight: 22 });
    if (t > 88) pool.push({ value: 'wraith', weight: 17 });
    if (t > 128) pool.push({ value: 'brute', weight: 9 });
    return weightedPick(this.rng, pool);
  }

  spawnPoint(distanceMin = 720, distanceMax = 920) {
    for (let attempt = 0; attempt < 6; attempt++) {
      const angle = this.rng() * Math.PI * 2;
      const dist = rand(this.rng, distanceMin, distanceMax);
      const x = clamp(this.player.x + Math.cos(angle) * dist, 44, WORLD.w - 44);
      const y = clamp(this.player.y + Math.sin(angle) * dist, 44, WORLD.h - 44);
      if (Math.hypot(x - this.player.x, y - this.player.y) > 460) return { x, y };
    }
    return {
      x: clamp(this.player.x + rand(this.rng, -1, 1) * 700, 44, WORLD.w - 44),
      y: clamp(this.player.y + rand(this.rng, -1, 1) * 600, 44, WORLD.h - 44),
    };
  }

  spawnAtRing(type) {
    const point = this.spawnPoint();
    this.spawnEnemy(type, point.x, point.y);
  }

  spawnEnemy(type, x, y, opts = {}) {
    const base = ENEMY_TYPES[type];
    const t = this.run.time;
    const scale = 1 + (t / 70) * 0.5 + Math.pow(t / 180, 2) * 0.9;
    const elite = !!opts.elite;
    const boss = !!opts.boss;
    const fiend = !!opts.fiend;
    const radius = boss ? 48 : elite ? base.radius * 1.3 : base.radius;
    const hp = boss
      ? 3200 + this.player.level * 130
      : fiend
        ? 62 + t * 1.7
        : base.hp * scale * (elite ? 15 : 1);
    const enemy = {
      type, x, y, vx: 0, vy: 0, kx: 0, ky: 0,
      hp, maxHp: hp,
      damage: boss ? 26 : elite ? base.dmg * 1.45 : base.dmg * (1 + t / 210),
      speed: boss ? 39 : fiend ? 248 : elite ? base.speed * 0.92 : base.speed * (1 + t / 900),
      radius,
      xp: boss ? 80 : elite ? base.xp * 12 : fiend ? 9 : base.xp,
      sprite: base.sprite,
      size: boss ? 190 : fiend ? 64 : elite ? base.size * 1.3 : base.size,
      elite, boss, fiend,
      name: boss ? 'The Blood Count' : elite ? pick(this.rng, ELITE_NAMES) : '',
      hitFlash: 0, attackCd: 0, bladeCd: 0, slow: 0,
      wobble: this.rng() * Math.PI * 2,
      seed: this.rng() * 100,
      age: 0, dead: false,
      ringTimer: boss ? 2.6 : 0,
      summonTimer: boss ? 7.5 : 0,
    };
    this.enemies.push(enemy);
    if (boss) {
      this.boss = enemy;
      this.audio.boss();
      this.camera.trauma = 1;
      this.ui?.showBoss(enemy);
      this.ui?.bossWarning(false);
      this.ui?.banner({ kicker: 'BLOOD MOON', name: 'The Blood Count', sub: 'End him before the graveyard ends you.', color: '#ff5c78', duration: 3800 });
    } else if (fiend) {
      this.fiendCount += 1;
      this.ui?.banner({ kicker: 'A COWARD IN THE DARK', name: 'Treasure Fiend', sub: 'Kill it before it escapes.', color: '#ffd764', duration: 2400 });
    } else if (elite) {
      this.eliteCount += 1;
      this.ui?.banner({ kicker: 'CHAMPION OF THE GRAVE', name: enemy.name, sub: 'Guaranteed loot.', color: '#ffb066', duration: 2100 });
      this.shockwave(x, y, 110, 'rgba(255,120,60,0.6)', 0.7);
    }
    return enemy;
  }

  spawnElite() {
    const pool = [
      { value: 'skeleton', weight: 10 },
      { value: 'wraith', weight: 7 },
      { value: 'brute', weight: 6 },
      { value: 'ghoul', weight: 4 },
    ];
    const type = weightedPick(this.rng, pool);
    const point = this.spawnPoint(580, 720);
    this.spawnEnemy(type, point.x, point.y, { elite: true });
  }

  spawnFiend() {
    const point = this.spawnPoint(520, 680);
    this.spawnEnemy('ghoul', point.x, point.y, { fiend: true });
  }

  spawnBoss() {
    if (this.bossState.spawned) return;
    this.bossState.spawned = true;
    this.ui?.bossWarning(false);
    const point = this.spawnPoint(600, 720);
    this.spawnEnemy('brute', point.x, point.y, { boss: true });
    this.burst(point.x, point.y, 40, '#c22b3d', 220);
    this.shockwave(point.x, point.y, 200, 'rgba(255,50,80,0.7)', 0.9);
  }

  /* ---------------------------------------------------------- enemies */

  rebuildGrid() {
    const cell = 72;
    this.grid = new Map();
    for (const e of this.enemies) {
      if (e.dead) continue;
      const key = `${Math.floor(e.x / cell)},${Math.floor(e.y / cell)}`;
      let bucket = this.grid.get(key);
      if (!bucket) { bucket = []; this.grid.set(key, bucket); }
      bucket.push(e);
    }
    this.cellSize = cell;
  }

  queryGrid(x, y, radius, out = []) {
    out.length = 0;
    const cell = this.cellSize || 72;
    const minX = Math.floor((x - radius) / cell);
    const maxX = Math.floor((x + radius) / cell);
    const minY = Math.floor((y - radius) / cell);
    const maxY = Math.floor((y + radius) / cell);
    for (let cx = minX; cx <= maxX; cx++) {
      for (let cy = minY; cy <= maxY; cy++) {
        const bucket = this.grid.get(`${cx},${cy}`);
        if (bucket) for (const e of bucket) if (!e.dead) out.push(e);
      }
    }
    return out;
  }

  updateEnemies(dt) {
    this.rebuildGrid();
    const p = this.player;
    const neighbors = [];
    for (const e of this.enemies) {
      if (e.dead) continue;
      e.age += dt;
      e.hitFlash = Math.max(0, e.hitFlash - dt);
      e.attackCd = Math.max(0, e.attackCd - dt);
      e.bladeCd = Math.max(0, e.bladeCd - dt);
      e.slow = Math.max(0, e.slow - dt);
      e.x += e.kx * dt;
      e.y += e.ky * dt;
      e.kx *= Math.pow(0.02, dt);
      e.ky *= Math.pow(0.02, dt);

      if (e.fiend) {
        const dx = e.x - p.x;
        const dy = e.y - p.y;
        const dist = Math.hypot(dx, dy) || 1;
        const flee = dist < 340 ? 1 : 0.35;
        e.x += (dx / dist) * e.speed * flee * dt;
        e.y += (dy / dist) * e.speed * flee * dt + Math.sin(e.age * 4 + e.wobble) * 20 * dt;
        if (e.age > 17) {
          e.dead = true;
          this.addText(e.x, e.y - 20, 'ESCAPED', '#9a8f9f', 10, 0.9);
          this.ui?.banner({ kicker: 'THE FIEND SLIPS AWAY', name: 'Lost Loot', sub: '', color: '#9a8f9f', duration: 1600 });
          continue;
        }
      } else {
        let dx = p.x - e.x;
        let dy = p.y - e.y;
        const dist = Math.hypot(dx, dy) || 1;
        dx /= dist;
        dy /= dist;
        if (e.type === 'bat') {
          const wob = Math.sin(e.age * 7 + e.wobble) * 0.55;
          const px = -dy;
          const py = dx;
          dx += px * wob;
          dy += py * wob;
        }
        const slowFactor = e.slow > 0 ? 0.72 : 1;
        e.vx = dx * e.speed * slowFactor;
        e.vy = dy * e.speed * slowFactor;
        e.x += e.vx * dt;
        e.y += e.vy * dt;
        if (Math.abs(e.vx) > 1) e.facing = e.vx < 0 ? -1 : 1;
        if (e.boss) {
          e.ringTimer -= dt;
          e.summonTimer -= dt;
          if (e.ringTimer <= 0) {
            e.ringTimer = 3.7;
            const count = 14;
            for (let i = 0; i < count; i++) {
              const angle = (i / count) * Math.PI * 2 + this.animTime * 0.2;
              this.enemyProjectiles.push({
                x: e.x, y: e.y,
                vx: Math.cos(angle) * 165, vy: Math.sin(angle) * 165,
                radius: 9, life: 4.2, damage: 14, spin: angle,
              });
            }
            this.shockwave(e.x, e.y, 110, 'rgba(255,50,80,0.65)', 0.5);
            this.audio.bolt();
          }
          if (e.summonTimer <= 0) {
            e.summonTimer = 8.5;
            for (let i = 0; i < 6; i++) {
              const angle = (i / 6) * Math.PI * 2;
              const bat = this.spawnEnemy('bat', e.x + Math.cos(angle) * 90, e.y + Math.sin(angle) * 90);
              bat.hp *= 1.8;
              bat.maxHp = bat.hp;
            }
            this.burst(e.x, e.y, 18, '#7e3a8a', 140);
          }
        }
      }

      // separation
      if (!e.boss && !e.fiend) {
        this.queryGrid(e.x, e.y, 50, neighbors);
        for (const other of neighbors) {
          if (other === e || other.dead || other.boss) continue;
          const dx = e.x - other.x;
          const dy = e.y - other.y;
          const d = Math.hypot(dx, dy);
          const min = e.radius + other.radius * 0.8;
          if (d > 0.001 && d < min) {
            const push = (min - d) * 0.5;
            e.x += (dx / d) * push;
            e.y += (dy / d) * push;
          }
        }
      }
      e.x = clamp(e.x, 20, WORLD.w - 20);
      e.y = clamp(e.y, 20, WORLD.h - 20);

      // contact damage
      if (!e.fiend) {
        const contact = e.radius + p.radius + 2;
        if (Math.hypot(e.x - p.x, e.y - p.y) < contact && e.attackCd <= 0) {
          e.attackCd = e.boss ? 0.75 : 0.95;
          this.damagePlayer(e.damage, e);
          const push = e.boss ? 34 : 20;
          const d = Math.hypot(e.x - p.x, e.y - p.y) || 1;
          e.kx += ((e.x - p.x) / d) * push;
          e.ky += ((e.y - p.y) / d) * push;
        }
      }
    }
    this.rebuildGrid();
  }

  /* ---------------------------------------------------------- combat */

  updateCombat(dt) {
    const p = this.player;
    const speed = this.stats.attackSpeed;
    this.cooldowns.swing -= dt;
    this.cooldowns.bolt -= dt;
    this.cooldowns.storm -= dt;
    this.cooldowns.aura -= dt;
    this.cooldowns.nova = (this.cooldowns.nova || 0) - dt;

    if (this.upgrades.scythe && this.cooldowns.swing <= 0) {
      this.cooldowns.swing = 0.62 / speed;
      const rank = this.upgrades.scythe;
      const radius = (70 + rank * 9) * this.stats.area;
      this.audio.swing();
      this.effects.push({ type: 'slash', x: p.x, y: p.y, radius, life: 0.24, maxLife: 0.24, angle: Math.random() * Math.PI * 2 });
      const hits = this.queryGrid(p.x, p.y, radius + 30, []);
      for (const e of hits) {
        if (Math.hypot(e.x - p.x, e.y - p.y) > radius + e.radius) continue;
        const dir = { x: e.x - p.x, y: e.y - p.y };
        this.damageEnemy(e, this.weaponDamage('scythe'), { dir, execute: this.powers.has('reaper') });
      }
    }

    if (this.upgrades.bolt && this.cooldowns.bolt <= 0) {
      this.cooldowns.bolt = 1.15 / speed;
      const rank = this.upgrades.bolt;
      const count = Math.min(8, 1 + Math.floor((rank - 1) / 2) + this.stats.projectiles);
      const targets = this.enemies
        .filter((e) => !e.dead && Math.hypot(e.x - p.x, e.y - p.y) < 780)
        .sort((a, b) => Math.hypot(a.x - p.x, a.y - p.y) - Math.hypot(b.x - p.x, b.y - p.y))
        .slice(0, count);
      if (targets.length) {
        this.audio.bolt();
        targets.forEach((target, i) => {
          const dx = target.x - p.x;
          const dy = target.y - p.y;
          const d = Math.hypot(dx, dy) || 1;
          const spread = count > 1 ? (i - (count - 1) / 2) * 0.03 : 0;
          const angle = Math.atan2(dy, dx) + spread;
          this.projectiles.push({
            x: p.x + Math.cos(angle) * 16,
            y: p.y + Math.sin(angle) * 16 - 4,
            vx: Math.cos(angle) * 600,
            vy: Math.sin(angle) * 600,
            radius: 7, life: 1.5,
            damage: this.weaponDamage('bolt'),
            crit: false,
            pierce: rank >= 5 ? 1 : 0,
            hits: new Set(), trail: 0,
          });
        });
      }
    }

    if (this.upgrades.storm && this.cooldowns.storm <= 0) {
      this.cooldowns.storm = 2.9 / speed;
      const rank = this.upgrades.storm;
      const strikes = rank + 1;
      const candidates = this.enemies.filter((e) => !e.dead && Math.hypot(e.x - p.x, e.y - p.y) < 640);
      if (candidates.length) {
        for (let i = 0; i < strikes; i++) {
          const target = candidates[Math.floor(this.rng() * candidates.length)];
          if (!target) continue;
          this.strikeLightning(target, this.weaponDamage('storm'));
        }
      }
    }

    if (this.upgrades.aura && this.cooldowns.aura <= 0) {
      this.cooldowns.aura = 0.45;
      const rank = this.upgrades.aura;
      const radius = (82 + rank * 13) * this.stats.area;
      const hits = this.queryGrid(p.x, p.y, radius + 24, []);
      for (const e of hits) {
        if (Math.hypot(e.x - p.x, e.y - p.y) > radius + e.radius) continue;
        e.slow = 1.1;
        this.damageEnemy(e, this.weaponDamage('aura'), { quiet: true });
      }
    }

    if (this.upgrades.blades) {
      const rank = this.upgrades.blades;
      const count = rank + 1 + (this.powers.has('orbit') ? 2 : 0);
      this.bladeAngle += dt * (2.0 + speed * 0.32);
      const orbit = 64 + rank * 5;
      for (let i = 0; i < count; i++) {
        const angle = this.bladeAngle + (i / count) * Math.PI * 2;
        const bx = p.x + Math.cos(angle) * orbit;
        const by = p.y + Math.sin(angle) * orbit;
        const hits = this.queryGrid(bx, by, 26, []);
        for (const e of hits) {
          if (e.bladeCd > 0) continue;
          if (Math.hypot(e.x - bx, e.y - by) > 20 + e.radius) continue;
          e.bladeCd = 0.36;
          this.damageEnemy(e, this.weaponDamage('blades'), { dir: { x: e.x - p.x, y: e.y - p.y } });
        }
      }
    }

    if (this.powers.has('nova') && this.cooldowns.nova <= 0) {
      this.cooldowns.nova = 4;
      const radius = 155 * this.stats.area;
      this.shockwave(p.x, p.y, radius, 'rgba(255,45,80,0.85)', 0.55);
      this.camera.trauma = Math.min(1, this.camera.trauma + 0.22);
      this.audio.hurt();
      const hits = this.queryGrid(p.x, p.y, radius + 20, []);
      for (const e of hits) {
        if (Math.hypot(e.x - p.x, e.y - p.y) <= radius + e.radius) {
          this.damageEnemy(e, 45 * this.damageMultiplier(), { dir: { x: e.x - p.x, y: e.y - p.y } });
        }
      }
    }
  }

  strikeLightning(target, damage) {
    this.damageEnemy(target, damage, { dir: { x: target.x - this.player.x, y: target.y - this.player.y }, lightning: true });
    const points = [];
    const startX = target.x + rand(this.rng, -18, 18);
    const startY = target.y - 260;
    let x = startX;
    let y = startY;
    points.push([x, y]);
    const steps = 6;
    for (let i = 1; i <= steps; i++) {
      const t = i / steps;
      x = lerp(startX, target.x, t) + (i < steps ? rand(this.rng, -18, 18) : 0);
      y = lerp(startY, target.y, t);
      points.push([x, y]);
    }
    this.effects.push({ type: 'lightning', points, life: 0.22, maxLife: 0.22 });
    this.burst(target.x, target.y, 8, '#b9fff4', 140);
    this.audio.bolt();
  }

  updateProjectiles(dt) {
    for (const bolt of this.projectiles) {
      if (bolt.dead) continue;
      bolt.x += bolt.vx * dt;
      bolt.y += bolt.vy * dt;
      bolt.life -= dt;
      if (bolt.life <= 0) { bolt.dead = true; continue; }
      const hits = this.queryGrid(bolt.x, bolt.y, 24, []);
      for (const e of hits) {
        if (bolt.dead) break;
        if (bolt.hits.has(e)) continue;
        if (Math.hypot(e.x - bolt.x, e.y - bolt.y) > bolt.radius + e.radius + 6) continue;
        bolt.hits.add(e);
        this.damageEnemy(e, bolt.damage, { dir: { x: bolt.vx, y: bolt.vy }, chain: this.powers.has('chain') });
        if (this.powers.has('chain')) {
          const nearby = hits.filter((other) => other !== e && !other.dead && Math.hypot(other.x - bolt.x, other.y - bolt.y) < 190).slice(0, 2);
          for (const other of nearby) {
            this.effects.push({ type: 'chain', x1: e.x, y1: e.y, x2: other.x, y2: other.y, life: 0.18, maxLife: 0.18 });
            this.damageEnemy(other, bolt.damage * 0.6);
          }
        }
        if (bolt.pierce > 0) bolt.pierce -= 1;
        else bolt.dead = true;
      }
    }

    for (const orb of this.enemyProjectiles) {
      if (orb.dead) continue;
      orb.x += orb.vx * dt;
      orb.y += orb.vy * dt;
      orb.life -= dt;
      if (orb.life <= 0) { orb.dead = true; continue; }
      if (Math.hypot(orb.x - this.player.x, orb.y - this.player.y) < orb.radius + this.player.radius) {
        orb.dead = true;
        this.damagePlayer(orb.damage, orb);
      }
    }
  }

  updateGems(dt) {
    const p = this.player;
    const magnet = this.stats.pickupRadius;
    for (const gem of this.gems) {
      if (gem.dead) continue;
      const dx = p.x - gem.x;
      const dy = p.y - gem.y;
      const dist = Math.hypot(dx, dy) || 1;
      if (dist < magnet) {
        const pull = Math.min(900, 240 + (1 - dist / magnet) * 900);
        gem.vx = (dx / dist) * pull;
        gem.vy = (dy / dist) * pull;
        gem.magnet = true;
      } else {
        gem.vx *= Math.pow(0.02, dt);
        gem.vy *= Math.pow(0.02, dt);
      }
      gem.x += gem.vx * dt;
      gem.y += gem.vy * dt;
      gem.bob += dt * 4;
      if (dist < 20) {
        gem.dead = true;
        this.audio.gem();
        this.addXp(gem.value);
        this.burst(gem.x, gem.y, 3, '#66d9c8', 60);
      }
    }
  }

  updateLoot(dt) {
    const p = this.player;
    for (const drop of this.loot) {
      if (drop.dead) continue;
      drop.age += dt;
      // Keep loot piles readable: drops gently repel each other instead of stacking.
      for (const other of this.loot) {
        if (other === drop || other.dead || other.forced) continue;
        const ox = drop.x - other.x;
        const oy = drop.y - other.y;
        const od = Math.hypot(ox, oy);
        if (od > 0.01 && od < 30) {
          const push = (30 - od) * 0.9 * dt;
          drop.x += (ox / od) * push;
          drop.y += (oy / od) * push;
        }
      }
      const dx = p.x - drop.x;
      const dy = p.y - drop.y;
      const dist = Math.hypot(dx, dy) || 1;
      if ((this.powers.has('gravity') && dist < 320 && dist > 20) || drop.forced) {
        const pull = drop.forced ? 900 : 520 * (1 - dist / 320);
        drop.x += (dx / dist) * pull * dt;
        drop.y += (dy / dist) * pull * dt;
      }
      if (drop.preview) continue;
      if (dist < (drop.forced ? 52 : 34)) this.pickLoot(drop);
    }
  }

  updateEffects(dt) {
    for (const e of this.effects) e.life -= dt;
  }

  updateCamera(dt) {
    const p = this.player;
    const halfW = this.viewW / 2;
    const halfH = this.viewH / 2;
    let tx = p.x + p.vx * 0.14;
    let ty = p.y + p.vy * 0.14;
    tx = halfW * 2 > WORLD.w ? WORLD.w / 2 : clamp(tx, halfW + 10, WORLD.w - halfW - 10);
    ty = halfH * 2 > WORLD.h ? WORLD.h / 2 : clamp(ty, halfH + 10, WORLD.h - halfH - 10);
    const follow = 1 - Math.pow(0.0004, dt);
    this.camera.x = lerp(this.camera.x, tx, follow);
    this.camera.y = lerp(this.camera.y, ty, follow);
    this.camera.trauma = Math.max(0, this.camera.trauma - dt * 1.9);
    const shake = this.camera.trauma * this.camera.trauma * 15;
    this.camera.shakeX = (Math.random() * 2 - 1) * shake;
    this.camera.shakeY = (Math.random() * 2 - 1) * shake;
  }

  /* ---------------------------------------------------------- encore helpers */

  scatterEnemyBursts() {
    for (const e of this.enemies) {
      if (e.dead) continue;
      e.dead = true;
      this.burst(e.x, e.y, 4, e.boss ? '#ff3b5c' : '#7a2230', 80);
    }
  }

  /* ---------------------------------------------------------- damage & death */

  damageEnemy(enemy, baseDamage, opts = {}) {
    if (!enemy || enemy.dead) return;
    const crit = Math.random() < this.stats.critChance;
    let damage = baseDamage * (crit ? this.stats.critMult : 1) * rand(this.rng, 0.94, 1.06);
    let label = '';
    if (opts.execute && !enemy.boss && enemy.hp > damage && enemy.hp <= enemy.maxHp * 0.18) {
      damage = enemy.hp * 1.2;
      label = 'EXECUTE';
    }
    enemy.hp -= damage;
    enemy.hitFlash = 0.1;
    this.run.damageDealt += damage;

    const heal = (this.stats.lifeOnHit || 0) + this.stats.lifesteal * damage;
    if (heal > 0 && this.player.hp < this.player.maxHp) {
      this.player.hp = Math.min(this.player.maxHp, this.player.hp + heal);
    }

    if (!opts.quiet || crit) {
      const size = enemy.boss ? 16 : crit ? 15 : 11;
      const color = label ? '#ff7d90' : crit ? '#ffd764' : '#f5e8cf';
      const text = label ? label : `${Math.round(damage)}${crit ? '!' : ''}`;
      this.addText(enemy.x + rand(this.rng, -8, 8), enemy.y - enemy.radius - 8, text, color, size, crit ? 0.9 : 0.7);
    }

    if (opts.dir && !enemy.boss) {
      const len = Math.hypot(opts.dir.x, opts.dir.y) || 1;
      const knock = enemy.elite ? 36 : 90;
      enemy.kx += (opts.dir.x / len) * knock;
      enemy.ky += (opts.dir.y / len) * knock;
    }

    if (!opts.quiet || crit) {
      this.burst(enemy.x, enemy.y - 4, crit ? 6 : 2, enemy.boss ? '#ff4d5f' : '#a32b3a', 90);
      this.audio.hit(crit);
    }
    if (enemy.hp <= 0) this.killEnemy(enemy);
  }

  damagePlayer(amount, source) {
    if (this.state !== 'playing' || this.player.invuln > 0) return;
    const reduced = amount * (1 - this.stats.armorDR);
    this.player.hp -= reduced;
    this.player.invuln = 0.55;
    this.player.hitFlash = 0.3;
    this.audio.hurt();
    this.camera.trauma = Math.min(1, this.camera.trauma + 0.28);
    this.addText(this.player.x, this.player.y - 38, `-${Math.round(reduced)}`, '#ff7180', 14, 0.8);
    this.burst(this.player.x, this.player.y - 6, 8, '#c22b3d', 100);
    if (this.player.hp <= 0) this.die();
  }

  die() {
    if (this.state === 'dead') return;
    this.player.hp = 0;
    this.state = 'dead';
    this.keys.clear();
    this.player.dead = true;
    this.audio.death();
    this.camera.trauma = 1;
    this.burst(this.player.x, this.player.y - 8, 64, '#c22b3d', 220, 80);
    this.burst(this.player.x, this.player.y - 10, 22, '#e9e1cf', 160, 60);
    this.ui?.hideJoystick();
    this.ui?.setLowHp(false);
    this.ui?.hideBoss();
    this.ui?.showEnd('death', this);
  }

  addXp(amount) {
    if (this.state === 'dead' || this.state === 'victory') return;
    const p = this.player;
    p.xp += amount * this.stats.xpMult;
    let leveled = false;
    while (p.xp >= p.xpNext) {
      p.xp -= p.xpNext;
      p.level += 1;
      this.pendingLevels += 1;
      leveled = true;
      p.xpNext = Math.floor(8 * Math.pow(p.level, 1.28) + 3 * p.level);
      p.hp = Math.min(p.maxHp, p.hp + p.maxHp * 0.05);
      this.burst(p.x, p.y, 18, '#f2d79a', 130);
      this.shockwave(p.x, p.y, 90, 'rgba(201,169,98,0.5)', 0.6);
    }
    if (leveled) this.audio.levelup();
    if (this.bossState.dead || this.victoryTimer > 0) {
      this.pendingLevels = 0;
    } else if (this.pendingLevels > 0 && this.state === 'playing') {
      this.showLevelUp();
    }
  }

  spawnGem(x, y, value) {
    this.gems.push({
      x: x + rand(this.rng, -10, 10),
      y: y + rand(this.rng, -8, 8),
      vx: rand(this.rng, -26, 26), vy: rand(this.rng, -26, 26),
      value, bob: this.rng() * Math.PI * 2, dead: false,
    });
    if (this.gems.length > 320) {
      const oldest = this.gems.shift();
      if (oldest) this.gems[0] && (this.gems[0].value += oldest.value);
    }
  }

  killEnemy(enemy) {
    if (!enemy || enemy.dead) return;
    enemy.dead = true;
    this.run.kills += 1;
    this.audio.hit(false);

    const decalSize = enemy.boss ? 90 : enemy.elite ? 46 : 24;
    this.renderer.addDecal(enemy.x, enemy.y, decalSize, enemy.boss ? 'rgba(94,8,24,0.55)' : 'rgba(86,12,24,0.42)');
    this.burst(enemy.x, enemy.y - 6, enemy.boss ? 48 : enemy.elite ? 22 : 9, '#8e1c2c', 140, 60);
    this.burst(enemy.x, enemy.y - 8, enemy.elite || enemy.boss ? 10 : 3, '#d9d3bd', 110, 40);

    if (enemy.boss) {
      this.killBoss(enemy);
      return;
    }

    this.spawnGem(enemy.x, enemy.y, enemy.xp + Math.floor(this.run.time / 70));
    this.rollLoot(enemy);

    if (enemy.elite) {
      this.run.elites += 1;
      this.camera.trauma = Math.min(1, this.camera.trauma + 0.2);
      this.addText(enemy.x, enemy.y - 46, 'CHAMPION SLAIN', '#ffb066', 14, 1.1);
    }
    if (enemy.fiend) {
      this.run.fiends += 1;
      this.souls += 2;
      this.ui?.banner({ kicker: 'TREASURE CLAIMED', name: 'The Fiend is Dead', sub: 'Its hoard is yours.', color: '#ffd764', duration: 2400 });
      this.camera.trauma = Math.min(1, this.camera.trauma + 0.25);
    }
  }

  killBoss(boss) {
    this.bossState.dead = true;
    this.bossState.warningTimer = 0;
    this.boss = null;
    this.ui?.hideBoss();
    this.ui?.bossWarning(false);
    this.camera.trauma = 1;
    this.player.invuln = 6;
    this.scatterEnemyBursts();
    this.enemyProjectiles = [];
    this.effects.push({ type: 'ring', x: boss.x, y: boss.y, radius: 360, color: 'rgba(255,60,90,0.9)', life: 1.3, maxLife: 1.3 });
    this.burst(boss.x, boss.y, 90, '#ff3b5c', 320, 40);
    this.burst(boss.x, boss.y, 40, '#c9a962', 240, 30);
    this.audio.boss();
    this.audio.pickup('mythic');
    this.ui?.banner({ kicker: 'THE BLOOD COUNT FALLS', name: 'The Graveyard Yields', sub: 'Claim your inheritance.', color: '#ffd764', duration: 4200 });
    this.ui?.flash();

    const ilvl = 1 + Math.floor(this.run.time / 16);
    const rarities = ['mythic', 'legendary', 'legendary', 'rare', 'magic'];
    rarities.forEach((rarity, i) => {
      const angle = (i / rarities.length) * Math.PI * 2;
      const item = generateItem(this.rng, { ilvl, luck: this.stats.luck, rarity });
      this.spawnLoot(boss.x + Math.cos(angle) * 28, boss.y + Math.sin(angle) * 28, item);
      const drop = this.loot[this.loot.length - 1];
      drop.forced = true;
      drop.beamBoost = 1;
    });
    for (let i = 0; i < 8; i++) {
      const angle = Math.random() * Math.PI * 2;
      this.spawnGem(boss.x + Math.cos(angle) * rand(this.rng, 20, 90), boss.y + Math.sin(angle) * rand(this.rng, 20, 90), 20);
    }
    this.victoryTimer = 3.4;
  }

  endRun(kind) {
    if (this.state === 'dead') return;
    if (kind === 'victory') {
      this.state = 'victory';
      this.audio.victory();
      this.ui?.hideJoystick();
      this.ui?.hideBoss();
      this.ui?.showEnd('victory', this);
    }
  }

  getSummary() {
    return {
      time: this.run.time,
      kills: this.run.kills,
      level: this.player.level,
      itemsFound: this.run.itemsFound,
      legendary: this.run.legendary,
      elites: this.run.elites,
      fiends: this.run.fiends,
      souls: this.souls,
      damage: this.run.damageDealt,
      equipment: this.equipment,
      bag: this.bag,
      upgrades: this.upgrades,
      stats: this.stats,
    };
  }

}
