// LA ESPADA CELESTIAL — orquestador del juego.
import {
  AFFINITIES, CLASSES, ITEMS, SKILLS, CREATURES, ENEMIES, ZONES, ZONE_ORDER,
  QUESTS, RECIPES, SHOP_STOCK, NPCS, TIPS, INTRO_LINES,
  xpToNext, itemValue, isEquippable,
} from './data.js';
import { SaveStore, formatPlayTime } from './save.js';
import { AudioEngine } from './audio.js';
import { World } from './world.js';
import { Player, Companion, WildCreature, Projectile, ParticleSystem } from './entities.js';
import { Enemy } from './enemies.js';
import { UI } from './ui.js';
import { clamp, lerp, drawNPC, drawMenuScene, hexA } from './sprites.js';

const W = 1280;
const H = 720;

const HAIR_STYLES = ['corto', 'largo', 'coleta', 'erizado'];
const ZONE_LEVEL = { bosque_lumen: 2, aldea_alba: 1, ruinas_umbra: 6, santuario_celestial: 9 };

export function creatureXpNext(level) {
  return Math.floor(42 + level * 26 + Math.pow(level, 1.52) * 9);
}

function randInt(a, b) { return Math.floor(a + Math.random() * (b - a + 1)); }
function rand(a, b) { return a + Math.random() * (b - a); }
function deepClone(value) { return JSON.parse(JSON.stringify(value)); }
function angleDiff(a, b) {
  let d = a - b;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return d;
}

export function defaultAppearance(classId) {
  const cls = CLASSES[classId] || CLASSES.vanguardia;
  return {
    hair: cls.hair || 'corto',
    hairColor: cls.hairColor || '#2a1b17',
    skin: cls.skin || '#e3a87e',
    outfit: cls.outfit || '#2c6ea3',
    accent: cls.accent || '#f5c86f',
  };
}

export function createState({ name = 'Astre', classId = 'vanguardia', appearance = null } = {}) {
  const cls = CLASSES[classId] || CLASSES.vanguardia;
  const look = { ...defaultAppearance(classId), ...(appearance || {}) };
  const quests = {};
  for (const id of Object.keys(QUESTS)) {
    quests[id] = {
      id,
      status: id === 'main_luz' ? 'active' : 'locked',
      step: 0,
      talkMark: 0,
      startedAt: 0,
    };
  }
  return {
    version: 1,
    createdAt: Date.now(),
    playTime: 0,
    zoneId: 'bosque_lumen',
    flags: {},
    world: { openedChests: [], visitedZones: ['bosque_lumen'] },
    respawn: { zoneId: 'bosque_lumen', x: 380, y: 1010 },
    quests,
    stats: {
      kills: {}, enemiesDefeated: 0, captures: 0, deaths: 0, chests: 0, crafted: 0,
      damageDealt: 0, talked: {}, talkCounts: {}, steps: 0,
    },
    player: {
      name: String(name || 'Astre').slice(0, 18),
      classId: cls.id,
      appearance: look,
      level: 1,
      xp: 0,
      xpNext: xpToNext(1),
      statPoints: 2,
      attrs: { ...cls.attrs },
      gold: 140,
      hp: 100,
      mp: 40,
      stamina: 100,
      x: 430,
      y: 980,
      facing: Math.PI / 2,
      equipment: {
        weapon: cls.weapon,
        offhand: cls.offhand,
        armor: cls.armor,
        accessory: cls.accessory,
      },
      inventory: {
        pocion_menor: 3, ether: 2, sello_luz: 4, hierba_lunar: 2, gelatina: 1,
        carne_asada: 1, baya_lumen: 2,
      },
      unlockedSkills: [cls.skill],
      activeSkill: cls.skill,
      creatures: [],
      activeCreature: 0,
      seen: [],
      caught: [],
      mounted: false,
    },
  };
}

function normalizeState(raw) {
  const state = deepClone(raw || {});
  const fallback = createState({});
  state.version = state.version || 1;
  state.playTime = state.playTime || 0;
  state.zoneId = ZONES[state.zoneId] ? state.zoneId : 'bosque_lumen';
  state.flags = state.flags || {};
  state.world = state.world || {};
  state.world.openedChests = state.world.openedChests || [];
  state.world.visitedZones = state.world.visitedZones || [state.zoneId];
  state.respawn = state.respawn || { zoneId: state.zoneId, x: 400, y: 400 };
  state.stats = { ...fallback.stats, ...(state.stats || {}) };
  state.stats.kills = state.stats.kills || {};
  state.stats.talked = state.stats.talked || {};
  state.stats.talkCounts = state.stats.talkCounts || {};
  state.quests = state.quests || {};
  for (const id of Object.keys(QUESTS)) {
    state.quests[id] = { ...fallback.quests[id], ...(state.quests[id] || {}) };
  }
  state.player = { ...fallback.player, ...(state.player || {}) };
  const cls = CLASSES[state.player.classId] || CLASSES.vanguardia;
  state.player.classId = cls.id;
  state.player.appearance = { ...defaultAppearance(cls.id), ...(state.player.appearance || {}) };
  state.player.attrs = { ...cls.attrs, ...(state.player.attrs || {}) };
  state.player.equipment = { ...fallback.player.equipment, ...(state.player.equipment || {}) };
  state.player.inventory = { ...(state.player.inventory || {}) };
  state.player.creatures = state.player.creatures || [];
  state.player.seen = state.player.seen || [];
  state.player.caught = state.player.caught || [];
  state.player.unlockedSkills = state.player.unlockedSkills || [cls.skill];
  state.player.activeSkill = state.player.activeSkill || cls.skill;
  state.player.xpNext = state.player.xpNext || xpToNext(state.player.level || 1);
  state.player.gold = state.player.gold ?? 0;
  state.player.statPoints = state.player.statPoints || 0;
  state.player.level = state.player.level || 1;
  if (state.player.activeCreature == null) state.player.activeCreature = 0;
  if (state.quests.main_luz.step >= 2) state.flags.ruins_unlocked = true;
  return state;
}

export class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    canvas.width = W;
    canvas.height = H;
    this.W = W;
    this.H = H;
    this.ctx.imageSmoothingEnabled = true;

    this.store = new SaveStore();
    this.settings = { ...this.store.settings };
    this.audio = new AudioEngine(this.settings);
    this.particles = new ParticleSystem(this.settings.quality);

    this.mode = 'menu';
    this.state = null;
    this.world = null;
    this.player = null;
    this.companion = null;
    this.enemies = [];
    this.wilds = [];
    this.projectiles = [];
    this.zaps = [];
    this.boss = null;
    this.bossActive = false;
    this.playerDead = false;
    this.endingOpen = false;
    this.introActive = false;

    this.camera = { x: 0, y: 0, w: W, h: H };
    this.shakeAmt = 0;
    this.fade = { a: 0, target: 0, cb: null };
    this.traveling = false;
    this.nearInteraction = null;
    this.captureTarget = null;
    this.lastPrompt = '';

    this.time = 0;
    this.menuTime = 0;
    this.playTime = 0;
    this.skillCds = {};
    this.autoSaveTimer = 0;
    this.questTimer = 0;
    this.hudTimer = 0;
    this.hitFlash = 0;

    this.keys = new Set();
    this.pending = {};
    this.heldActions = new Set();
    this.bSources = new Set();
    this.bSince = 0;
    this.touchMove = { x: 0, y: 0 };
    this.padMove = { x: 0, y: 0 };
    this.move = { x: 0, y: 0 };
    this.tilt = { x: 0, y: 0 };
    this.padPrev = [];
    this.padConnected = false;
    this.padAttackHeld = false;

    this.lightCanvas = document.createElement('canvas');
    this.lightCanvas.width = W;
    this.lightCanvas.height = H;
    this.lightCtx = this.lightCanvas.getContext('2d');

    this.lastTs = 0;
    this.loop = this.loop.bind(this);
    this.ui = new UI(this);
  }

  init() {
    this.ui.mount();
    this.bindInput();
    this.bindTilt();
    this.audio.setMusic('menu');
    this.ui.showTitle();
    requestAnimationFrame(this.loop);
  }

  // ───────────────────────── Entrada ─────────────────────────
  bindInput() {
    const gameKeys = new Set([
      'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space', 'KeyW', 'KeyA', 'KeyS', 'KeyD',
      'KeyJ', 'KeyK', 'KeyU', 'KeyE', 'KeyI', 'KeyF', 'KeyL', 'KeyR', 'KeyM', 'Tab', 'Enter', 'Escape',
      'ShiftLeft', 'ShiftRight',
    ]);

    window.addEventListener('keydown', (e) => {
      const tag = document.activeElement?.tagName;
      const typing = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';
      if (gameKeys.has(e.code) && !typing) e.preventDefault();
      this.audio.init();

      if (this.ui?.modalOpen) {
        if (this.ui.handleKey(e.code, e)) return;
      }
      if (typing) return;

      if (this.dialogOpen) {
        if (['Enter', 'Space', 'KeyY', 'KeyI'].includes(e.code)) { this.ui.advanceDialog(); return; }
        if (e.code === 'Escape') { this.ui.closeDialog(); return; }
      }

      if (e.code === 'Escape') {
        if (this.mode === 'play' && this.state && !this.playerDead) { this.openPause(); return; }
      }
      if (e.code === 'Tab' && this.mode === 'play' && this.state && !this.ui.modalOpen) {
        this.openQuick(); return;
      }
      if (this.mode !== 'play' || !this.state) return;
      if (this.ui.modalOpen || this.playerDead) return;

      if (e.repeat) {
        if (e.code === 'Space' || e.code === 'KeyJ') this.heldActions.add('key');
        return;
      }

      switch (e.code) {
        case 'Space': case 'KeyJ': this.heldActions.add('key'); break;
        case 'KeyK': case 'ShiftLeft': case 'ShiftRight': this.pressB('key'); break;
        case 'KeyU': case 'KeyE': this.pending.special = true; break;
        case 'KeyI': case 'KeyF': this.pending.interact = true; break;
        case 'KeyL': this.pending.switchWeapon = true; break;
        case 'KeyR': this.pending.switchCreature = true; break;
        case 'KeyM': this.pending.mount = true; break;
        case 'Enter': this.openPause(); break;
      }
    }, { passive: false });

    window.addEventListener('keyup', (e) => {
      if (e.code === 'Space' || e.code === 'KeyJ') this.heldActions.delete('key');
      if (['KeyK', 'ShiftLeft', 'ShiftRight'].includes(e.code)) this.releaseB('key');
    });

    window.addEventListener('blur', () => {
      this.keys.clear();
      this.heldActions.clear();
      this.bSources.clear();
      this.player?.setBlock(false);
    });

    window.addEventListener('pointerdown', () => this.audio.init(), { passive: true });
    window.addEventListener('gamepadconnected', () => {
      this.padConnected = true;
      this.notify('Mando conectado', 'Puedes jugar con mando Bluetooth o USB.', 'info');
    });
    window.addEventListener('gamepaddisconnected', () => { this.padConnected = false; });

    document.addEventListener('visibilitychange', () => {
      if (document.hidden && this.mode === 'play' && this.state && !this.ui.modalOpen) this.openPause();
    });
  }

  bindTilt() {
    window.addEventListener('deviceorientation', (e) => {
      if (!this.settings.tilt) return;
      const gamma = e.gamma || 0;
      const beta = e.beta || 0;
      this.tilt.x = clamp(gamma / 32, -1, 1);
      this.tilt.y = clamp((beta - 32) / 34, -1, 1);
      if (Math.abs(this.tilt.x) < 0.12) this.tilt.x = 0;
      if (Math.abs(this.tilt.y) < 0.12) this.tilt.y = 0;
    });
  }

  async requestTiltPermission() {
    try {
      const api = window.DeviceOrientationEvent;
      if (api && typeof api.requestPermission === 'function') {
        const res = await api.requestPermission();
        if (res !== 'granted') {
          this.notify('Sensor no disponible', 'El navegador no concedió acceso al acelerómetro.', 'error');
          return false;
        }
      }
      this.notify('Inclinación activada', 'Mueve el dispositivo con suavidad para caminar.', 'success');
      return true;
    } catch {
      this.notify('Sensor no disponible', 'Este navegador no expone el acelerómetro.', 'error');
      return false;
    }
  }

  pressB(source) {
    if (!this.player || this.playerDead) return;
    if (!this.bSources.has(source)) {
      if (this.bSources.size === 0) this.bSince = performance.now();
      this.bSources.add(source);
    }
  }

  releaseB(source) {
    if (!this.bSources.has(source)) return;
    this.bSources.delete(source);
    if (this.bSources.size === 0) {
      const quick = performance.now() - this.bSince < 230;
      this.player?.setBlock(false);
      if (quick && this.player && !this.ui.modalOpen && !this.dialogOpen && !this.playerDead) {
        this.player.dodge(this.move.x, this.move.y);
      }
    }
  }

  setTouchMove(x, y) { this.touchMove.x = x; this.touchMove.y = y; }
  touchAttack(down) { down ? this.heldActions.add('touch') : this.heldActions.delete('touch'); }
  touchB(down) { down ? this.pressB('touch') : this.releaseB('touch'); }
  touchAction(action) {
    if (this.ui.modalOpen || this.dialogOpen) return;
    if (action === 'special') this.pending.special = true;
    if (action === 'interact') this.pending.interact = true;
    if (action === 'switchWeapon') this.pending.switchWeapon = true;
    if (action === 'switchCreature') this.pending.switchCreature = true;
    if (action === 'mount') this.pending.mount = true;
    if (action === 'pause') this.openPause();
    if (action === 'quick') this.openQuick();
  }

  pollGamepad() {
    if (!navigator.getGamepads) return;
    let pad = null;
    for (const p of navigator.getGamepads()) { if (p && p.connected) { pad = p; break; } }
    if (!pad) { this.padMove.x = 0; this.padMove.y = 0; this.padAttackHeld = false; return; }
    if (!this.padConnected) {
      this.padConnected = true;
      this.notify('Mando detectado', 'Control disponible: A atacar · B esquivar · X habilidad · Y interactuar.', 'info');
    }
    const pressed = (i) => !!pad.buttons[i]?.pressed;
    const edge = (i) => pressed(i) && !this.padPrev[i];

    if (this.ui.modalOpen) {
      if (edge(12)) this.ui.navigateDir('up');
      if (edge(13)) this.ui.navigateDir('down');
      if (edge(14)) this.ui.navigateDir('left');
      if (edge(15)) this.ui.navigateDir('right');
      if (edge(0)) this.ui.activateFocused();
      if (edge(1)) this.ui.back();
      if (edge(9)) this.ui.back();
      this.padPrev = pad.buttons.map((b) => b.pressed);
      this.padMove.x = 0; this.padMove.y = 0; this.padAttackHeld = false;
      return;
    }
    if (this.dialogOpen) {
      if (edge(0) || edge(3)) this.ui.advanceDialog();
      if (edge(1)) this.ui.closeDialog();
      this.padPrev = pad.buttons.map((b) => b.pressed);
      return;
    }
    if (this.mode !== 'play' || !this.state) { this.padPrev = pad.buttons.map((b) => b.pressed); return; }

    let ax = pad.axes[0] || 0;
    let ay = pad.axes[1] || 0;
    if (Math.abs(ax) < 0.22) ax = 0;
    if (Math.abs(ay) < 0.22) ay = 0;
    if (pressed(14)) ax = -1; if (pressed(15)) ax = 1;
    if (pressed(12)) ay = -1; if (pressed(13)) ay = 1;
    this.padMove.x = ax;
    this.padMove.y = ay;
    this.padAttackHeld = pressed(0);
    if (edge(0)) this.pending.attack = true;
    if (edge(1)) this.pressB('pad');
    if (!pressed(1) && this.bSources.has('pad')) this.releaseB('pad');
    if (edge(2)) this.pending.special = true;
    if (edge(3)) this.pending.interact = true;
    if (edge(4)) this.pending.switchWeapon = true;
    if (edge(5)) this.pending.switchCreature = true;
    if (edge(9)) this.openPause();
    if (edge(8)) this.openQuick();
    this.padPrev = pad.buttons.map((b) => b.pressed);
  }

  // ───────────────────────── Bucle ─────────────────────────
  loop(ts) {
    const dt = this.lastTs ? Math.min(0.045, (ts - this.lastTs) / 1000) : 0.016;
    this.lastTs = ts;
    this.time += dt;
    this.pollGamepad();

    if (this.mode === 'menu') {
      this.menuTime += dt;
      this.drawMenu();
    } else if (this.mode === 'play') {
      const frozen = this.ui.modalOpen || this.dialogOpen || this.introActive ||
        this.playerDead || this.endingOpen || this.fade.a > 0.02 || this.traveling;
      if (!frozen) this.updatePlay(dt);
      else this.updateFrozen(dt);
      this.drawWorld();
      this.ui.updateHud(dt);
    }
    this.updateFade(dt);
    requestAnimationFrame(this.loop);
  }

  updateFade(dt) {
    const f = this.fade;
    if (f.a < f.target) {
      f.a = Math.min(f.target, f.a + dt * 3.2);
      if (f.a >= 1 && f.cb) {
        const cb = f.cb;
        f.cb = null;
        cb();
        f.target = 0;
      }
    } else if (f.a > f.target) {
      f.a = Math.max(f.target, f.a - dt * 2.6);
    }
  }

  updateFrozen(dt) {
    this.hitFlash = Math.max(0, this.hitFlash - dt);
    this.shakeAmt = Math.max(0, this.shakeAmt - dt * 30);
  }

  updatePlay(dt) {
    if (!this.player || !this.world) return;
    this.state.playTime += dt;
    this.playTime += dt;
    this.autoSaveTimer += dt;
    this.questTimer += dt;

    this.updateInputVector();
    this.processPending(dt);

    if (this.bSources.size) {
      if (performance.now() - this.bSince > 160 && this.player.dodgeTime <= 0) this.player.setBlock(true);
    } else this.player.setBlock(false);

    this.player.update(dt, this.move);
    if (this.playerDead) return;
    if (this.companion) this.companion.update(dt, this);

    for (const e of this.enemies) e.update(dt);
    this.enemies = this.enemies.filter((e) => !e.dead || e.deathTimer > 0);
    if (this.boss && (this.boss.dead || !this.enemies.includes(this.boss))) { this.boss = null; this.bossActive = false; }

    for (const w of this.wilds) {
      w.update(dt);
      if (w.fleeTimer > 0) {
        w.fleeTimer = Math.max(0, w.fleeTimer - dt);
        const a = Math.atan2(w.y - this.player.y, w.x - this.player.x);
        this.world.moveEntity(w, Math.cos(a) * 110 * dt, Math.sin(a) * 110 * dt, this.collisionCtx(false));
      }
      const d = Math.hypot(w.x - this.player.x, w.y - this.player.y);
      if (d < 300) this.markWildSeen(w);
    }
    this.wilds = this.wilds.filter((w) => !w.captured);

    this.updateProjectiles(dt);
    for (let i = this.zaps.length - 1; i >= 0; i--) {
      this.zaps[i].life -= dt;
      if (this.zaps[i].life <= 0) this.zaps.splice(i, 1);
    }
    this.particles.update(dt);

    for (const id of Object.keys(this.skillCds)) this.skillCds[id] = Math.max(0, this.skillCds[id] - dt);

    this.updateCamera(dt);
    this.shakeAmt = Math.max(0, this.shakeAmt - dt * 26);
    this.hitFlash = Math.max(0, this.hitFlash - dt * 2);

    this.state.player.x = this.player.x;
    this.state.player.y = this.player.y;
    this.state.player.facing = this.player.facing;
    this.state.player.hp = this.player.hp;
    this.state.player.mp = this.player.mp;
    this.state.player.stamina = this.player.stamina;

    this.updateInteraction();
    this.world.game = this;

    if (this.questTimer > 0.35) { this.questTimer = 0; this.checkQuests(); }
    if (this.autoSaveTimer > 120) { this.autoSaveTimer = 0; this.autoSave(); }
  }

  updateInputVector() {
    let x = 0, y = 0;
    if (this.keys.has('ArrowLeft') || this.keys.has('KeyA')) x -= 1;
    if (this.keys.has('ArrowRight') || this.keys.has('KeyD')) x += 1;
    if (this.keys.has('ArrowUp') || this.keys.has('KeyW')) y -= 1;
    if (this.keys.has('ArrowDown') || this.keys.has('KeyS')) y += 1;
    if (!x && !y) { x = this.padMove.x; y = this.padMove.y; }
    if (!x && !y) { x = this.touchMove.x; y = this.touchMove.y; }
    if (this.settings.tilt && (this.settings.touch !== 'off')) {
      x += this.tilt.x; y += this.tilt.y;
    }
    const len = Math.hypot(x, y);
    if (len > 1) { x /= len; y /= len; }
    this.move.x = x;
    this.move.y = y;
    this.state.player.mounted = this.player.mounted;
  }

  processPending(dt) {
    if (!this.pending) this.pending = {};
    if (this.heldActions.size || this.padAttackHeld) {
      if (this.player) this.player.startAttack();
    }
    if (this.pending.dodge) { this.player.dodge(this.move.x, this.move.y); }
    if (this.pending.special) { this.castSkill(this.state.player.activeSkill); }
    if (this.pending.interact) { this.interact(); }
    if (this.pending.switchWeapon) { this.switchWeapon(); }
    if (this.pending.switchCreature) { this.switchCreature(); }
    if (this.pending.mount) { this.player.toggleMount(); }
    this.pending = {};
  }

  // ───────────────────────── Estado / zonas ─────────────────────────
  startNewGame(profile) {
    if (!profile) return;
    const state = createState(profile);
    this.applyState(state, { fresh: true });
    this.introActive = true;
    this.ui.playIntro(INTRO_LINES, () => {
      this.introActive = false;
      this.ui.showZoneBanner(ZONES[this.state.zoneId]);
      this.ui.toast('La Espada despierta', 'Habla con Lira, junto al santuario.', 'quest');
      this.autoSave();
    });
  }

  continueGame() {
    const latest = this.store.latestSlot();
    if (!latest) { this.ui.toast('Sin partidas', 'Crea una nueva partida para comenzar.', 'error'); return; }
    this.loadSlot(latest.slot);
  }

  applyState(state, opts = {}) {
    this.state = normalizeState(state);
    this.mode = 'play';
    this.playerDead = false;
    this.endingOpen = false;
    this.introActive = false;
    this.boss = null;
    this.bossActive = false;
    this.skillCds = {};
    this.projectiles = [];
    this.zaps = [];
    this.particles = new ParticleSystem(this.settings.quality);
    this.pending = {};
    this.bSources.clear();
    this.heldActions.clear();
    this.fade = { a: 0, target: 0, cb: null };
    this.traveling = false;
    this.autoSaveTimer = 0;
    this.unlockSkills(true);
    this.buildZone(this.state.zoneId, { x: this.state.player.x, y: this.state.player.y }, true);
    this.ui.showGame();
    this.ui.closeAll();
    if (!opts.fresh) this.ui.toast('Partida cargada', `${this.state.player.name} · Nivel ${this.state.player.level}`, 'success');
    this.audio.setMusic(ZONES[this.state.zoneId].music);
    this.ui.showZoneBanner(ZONES[this.state.zoneId]);
  }

  buildZone(zoneId, position = null, silent = false) {
    const id = ZONES[zoneId] ? zoneId : 'bosque_lumen';
    this.state.zoneId = id;
    if (!this.state.world.visitedZones.includes(id)) this.state.world.visitedZones.push(id);

    this.world = new World(id, this.state, this);
    const spawn = position || this.world.spawnPoint;
    this.player = new Player(this);
    this.player.x = spawn.x;
    this.player.y = spawn.y;
    this.state.player.x = spawn.x;
    this.state.player.y = spawn.y;
    this.player.mounted = false;
    this.companion = null;
    this.enemies = [];
    this.wilds = [];
    this.projectiles = [];
    this.zaps = [];
    this.boss = null;
    this.bossActive = false;
    this.playerDead = false;

    const zone = ZONES[id];
    const baseLevel = ZONE_LEVEL[id] || 1;
    for (const s of zone.spawns) {
      const level = Math.max(1, baseLevel + randInt(-1, 1));
      this.enemies.push(new Enemy(this, s.kind, s.x, s.y, level));
    }
    if (id === 'ruinas_umbra' && !this.state.flags.boss_defeated && this.world.arena) {
      const boss = new Enemy(this, 'guardian', this.world.arena.x, this.world.arena.y - 40, 9);
      this.enemies.push(boss);
    }
    for (const s of zone.creatureSpawns) {
      const level = Math.max(1, baseLevel + randInt(-1, 1));
      const w = new WildCreature(this, s.species, s.x, s.y, level);
      this.wilds.push(w);
      if (!this.state.player.seen.includes(s.species)) this.state.player.seen.push(s.species);
    }

    const active = this.state.player.creatures[this.state.player.activeCreature];
    if (active) { this.companion = new Companion(this, active); this.companion.x = this.player.x - 44; this.companion.y = this.player.y + 18; }
    if (this.state.player.mounted && !this.player.activeCreature) this.state.player.mounted = false;

    this.camera.x = clamp(this.player.x - this.W / 2, 0, Math.max(0, this.world.w - this.W));
    this.camera.y = clamp(this.player.y - this.H / 2, 0, Math.max(0, this.world.h - this.H));
    this.nearInteraction = null;
    this.captureTarget = null;
    this.ui?.hideBossBar();

    if (!silent) {
      this.audio.setMusic(zone.music);
      this.ui.showZoneBanner(zone);
      this.checkQuests();
    }
    this.ui?.setPrompt(null);
    this.ui?.refreshHud();
  }

  travelTo(portal) {
    if (this.traveling) return;
    this.traveling = true;
    this.audio.play('portal');
    this.particles.ring(this.player.x, this.player.y - 30, '#8ce7ff', 80, { life: 0.6, width: 5 });
    this.fadeTo(() => {
      this.buildZone(portal.to, { x: portal.toX, y: portal.toY });
      this.autoSave();
      this.traveling = false;
    });
  }

  fadeTo(cb) {
    this.fade.cb = cb;
    this.fade.target = 1;
  }

  updateCamera(dt) {
    const cam = this.camera;
    const maxX = Math.max(0, this.world.w - this.W);
    const maxY = Math.max(0, this.world.h - this.H);
    const tx = clamp(this.player.x + Math.cos(this.player.facing) * 26 - this.W / 2, 0, maxX);
    const ty = clamp(this.player.y + Math.sin(this.player.facing) * 20 - this.H / 2 - 20, 0, maxY);
    const k = 1 - Math.exp(-dt * 5.2);
    cam.x = lerp(cam.x, tx, k);
    cam.y = lerp(cam.y, ty, k);
  }

  collisionCtx(withAbilities = true) {
    return {
      flags: this.state?.flags || {},
      abilities: withAbilities && this.player ? this.player.getAbilities() : new Set(),
    };
  }

  // ───────────────────────── Combate ─────────────────────────
  nearestEnemy(x, y, maxDist = 400) {
    let best = null, bd = maxDist;
    for (const e of this.enemies) {
      if (e.dead || e.dormant) continue;
      const d = Math.hypot(e.x - x, e.y - y);
      if (d < bd) { bd = d; best = e; }
    }
    return best;
  }

  resolvePlayerAttack(player) {
    if (!player || this.playerDead) return;
    const weapon = player.weapon || ITEMS.espada_alba;
    const combo = weapon.combo?.[player.attackIndex] || 1;
    const crit = Math.random() < (player.critChance || 0.05);
    let damage = (player.attack || 10) * combo * rand(0.92, 1.08);
    if (crit) damage *= 1.75;
    const element = weapon.subtype === 'staff' ? 'luz' : weapon.subtype === 'bow' ? 'viento' : null;

    if (weapon.ranged) {
      const a = player.facing;
      this.spawnProjectile({
        x: player.x + Math.cos(a) * 26, y: player.y - 30 + Math.sin(a) * 10,
        vx: Math.cos(a) * (weapon.projectileSpeed || 560), vy: Math.sin(a) * (weapon.projectileSpeed || 560),
        r: weapon.subtype === 'bow' ? 7 : 11,
        owner: 'player', element, color: weapon.color,
        kind: weapon.subtype === 'bow' ? 'arrow' : 'bolt',
        damage, life: 1.35, pierce: false,
        splash: weapon.subtype === 'staff' ? 58 : 0,
      });
      this.particles.burst(player.x + Math.cos(a) * 24, player.y - 30, 5, { color: weapon.color, speed: 70, life: 0.3, size: 2, type: 'spark' });
      this.audio.play(weapon.subtype === 'bow' ? 'attack' : 'magic');
      return;
    }

    const reach = (weapon.reach || 72) * 0.95;
    const arc = weapon.arc || 1.5;
    let hits = 0;
    for (const e of this.enemies) {
      if (e.dead || e.dormant) continue;
      const dx = e.x - player.x;
      const dy = e.y - (player.y - 18);
      const d = Math.hypot(dx, dy);
      if (d > reach + e.r) continue;
      if (Math.abs(angleDiff(Math.atan2(dy, dx), player.facing)) > arc / 2 + 0.16) continue;
      e.takeDamage(damage, {
        crit, element, type: 'physical', knock: weapon.knock,
        angle: player.facing, color: weapon.color,
      });
      hits++;
    }
    for (const w of this.wilds) {
      const d = Math.hypot(w.x - player.x, w.y - player.y);
      if (d > reach + w.r) continue;
      if (Math.abs(angleDiff(Math.atan2(w.y - player.y, w.x - player.x), player.facing)) > arc / 2 + 0.2) continue;
      w.takeDamage(damage * 0.8);
      this.markWildSeen(w);
      hits++;
    }
    this.state.stats.damageDealt += Math.round(damage * Math.max(1, hits));
    this.particles.slash(player.x, player.y - 26, player.facing, reach, weapon.color, { arc, width: weapon.subtype === 'greatsword' ? 16 : 10 });
    if (hits) {
      this.shake(weapon.subtype === 'greatsword' ? 7 : 4);
      this.hitFlash = Math.min(1, this.hitFlash + 0.35);
    }
  }

  spawnProjectile(o) {
    const p = new Projectile(this, o);
    this.projectiles.push(p);
    return p;
  }

  updateProjectiles(dt) {
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      p.update(dt);
      if (p.dead) { this.projectiles.splice(i, 1); continue; }

      if (p.owner === 'enemy') {
        if (!this.playerDead && this.player && Math.hypot(p.x - this.player.x, p.y - (this.player.y - 22)) < p.r + this.player.r) {
          this.player.takeDamage(p.damage, { source: null });
          this.hitFlash = 1;
          p.explode();
          this.projectiles.splice(i, 1);
          continue;
        }
      } else {
        let hit = false;
        for (const e of this.enemies) {
          if (e.dead || e.dormant || p.hitSet.has(e)) continue;
          if (Math.hypot(p.x - e.x, p.y - (e.y - e.r * 0.5)) < p.r + e.r) {
            e.takeDamage(p.damage, { element: p.element, type: 'magic', crit: false, color: p.color });
            p.hitSet.add(e);
            hit = true;
            if (!p.pierce) break;
          }
        }
        if (!hit) {
          for (const w of this.wilds) {
            if (p.hitSet.has(w)) continue;
            if (Math.hypot(p.x - w.x, p.y - (w.y - 20)) < p.r + w.r + 8) {
              w.takeDamage(p.damage * 0.7);
              this.markWildSeen(w);
              p.hitSet.add(w);
              hit = true;
              if (!p.pierce) break;
            }
          }
        }
        if (hit && !p.pierce) {
          p.explode();
          this.projectiles.splice(i, 1);
        }
      }
    }
  }

  areaDamage(x, y, radius, damage, owner, opts = {}) {
    if (owner === 'enemy') {
      if (this.playerDead || !this.player) return;
      if (Math.hypot(x - this.player.x, y - (this.player.y - 20)) <= radius + this.player.r) {
        this.player.takeDamage(damage, { source: opts.source || null });
        this.hitFlash = 1;
      }
      return;
    }
    for (const e of this.enemies) {
      if (e.dead || e.dormant) continue;
      if (Math.hypot(x - e.x, y - (e.y - e.r * 0.4)) <= radius + e.r) {
        e.takeDamage(damage, {
          element: opts.element, type: 'magic', crit: false,
          color: opts.color, knock: opts.knock || 0, angle: Math.atan2(e.y - y, e.x - x),
        });
        if (opts.slow) e.slowTimer = Math.max(e.slowTimer, opts.slow);
        if (opts.stun) e.stun = Math.max(e.stun, opts.stun);
      }
    }
    for (const w of this.wilds) {
      if (Math.hypot(x - w.x, y - w.y) <= radius + w.r) w.takeDamage(damage * 0.55);
    }
  }

  castSkill(skillId) {
    const p = this.state.player;
    const skill = SKILLS[skillId];
    if (!skill) return false;
    if (!p.unlockedSkills.includes(skillId)) {
      this.notify('Habilidad bloqueada', `Se desbloquea en el nivel ${skill.level}.`, 'error');
      return false;
    }
    if ((this.skillCds[skillId] || 0) > 0) {
      this.notify('En recarga', `${skill.name} estará lista en ${this.skillCds[skillId].toFixed(1)} s.`, 'error');
      return false;
    }
    if (!this.player.spendMp(skill.cost)) {
      this.notify('Maná insuficiente', `${skill.name} cuesta ${skill.cost} de maná.`, 'error');
      return false;
    }
    this.skillCds[skillId] = skill.cd;
    const atk = this.player.attack;
    const element = skill.element;
    const color = skill.color;
    this.audio.play(element === 'fuego' ? 'fire' : element === 'hielo' ? 'ice' : element === 'luz' ? 'heal' : 'magic');

    if (skill.type === 'arc') {
      for (const e of this.enemies) {
        if (e.dead || e.dormant) continue;
        const d = Math.hypot(e.x - this.player.x, e.y - this.player.y);
        if (d > skill.radius + e.r) continue;
        if (Math.abs(angleDiff(Math.atan2(e.y - this.player.y, e.x - this.player.x), this.player.facing)) > skill.arc / 2 + 0.2) continue;
        e.takeDamage(atk * skill.power, { element, type: 'magic', color, knock: 120, angle: this.player.facing });
      }
      this.particles.slash(this.player.x, this.player.y - 26, this.player.facing, skill.radius, color, { arc: skill.arc, width: 18, life: 0.35 });
      this.particles.ring(this.player.x, this.player.y - 24, color, skill.radius, { life: 0.45, width: 5 });
      this.shake(7);
    } else if (skill.type === 'projectile') {
      const a = this.player.facing;
      this.spawnProjectile({
        x: this.player.x + Math.cos(a) * 26, y: this.player.y - 34 + Math.sin(a) * 10,
        vx: Math.cos(a) * (skill.speed || 480), vy: Math.sin(a) * (skill.speed || 480),
        r: skill.radius || 16, owner: 'player', element, color,
        kind: element === 'fuego' ? 'fire' : element === 'hielo' ? 'ice' : element === 'oscuridad' ? 'dark' : 'bolt',
        damage: atk * skill.power, life: 1.8, pierce: !!skill.pierce,
        splash: skill.pierce ? 0 : (skill.type === 'projectile' ? 48 : 0),
      });
      this.particles.burst(this.player.x + Math.cos(a) * 24, this.player.y - 34, 8, { color, speed: 90, life: 0.4, size: 2.4, type: 'spark' });
    } else if (skill.type === 'nova') {
      this.areaDamage(this.player.x, this.player.y - 10, skill.radius, atk * skill.power, 'player', {
        element, color, slow: skill.slow, knock: 90,
      });
      this.particles.ring(this.player.x, this.player.y - 18, color, skill.radius, { life: 0.7, width: 9 });
      this.particles.burst(this.player.x, this.player.y - 22, 28, { color, speed: 210, life: 0.7, size: 3, type: element === 'hielo' ? 'shard' : 'star' });
      this.shake(12);
      this.hitFlash = 0.8;
    } else if (skill.type === 'chain') {
      const targets = this.enemies
        .filter((e) => !e.dead && !e.dormant && Math.hypot(e.x - this.player.x, e.y - this.player.y) <= skill.radius)
        .sort((a, b) => Math.hypot(a.x - this.player.x, a.y - this.player.y) - Math.hypot(b.x - this.player.x, b.y - this.player.y))
        .slice(0, 4);
      let from = { x: this.player.x, y: this.player.y - 34 };
      for (const e of targets) {
        e.takeDamage(atk * skill.power, { element, type: 'magic', color, stun: 0.35 });
        this.zaps.push({ from, to: { x: e.x, y: e.y - e.r * 0.6 }, life: 0.28, max: 0.28, color });
        from = { x: e.x, y: e.y - e.r * 0.6 };
      }
      if (!targets.length) this.zaps.push({ from, to: { x: this.player.x + Math.cos(this.player.facing) * 180, y: this.player.y + Math.sin(this.player.facing) * 180 }, life: 0.22, max: 0.22, color });
      this.particles.ring(this.player.x, this.player.y - 30, color, 80, { life: 0.35, width: 4 });
      this.shake(6);
    } else if (skill.type === 'heal') {
      this.player.heal(this.player.maxHp * skill.power);
      this.particles.ring(this.player.x, this.player.y - 22, '#a8ffb5', 78, { life: 0.8, width: 4 });
    } else if (skill.type === 'guard') {
      this.player.shieldTimer = skill.duration;
      this.player.shieldPower = 45 + this.state.player.level * 8;
      this.particles.ring(this.player.x, this.player.y - 26, color, 70, { life: 0.8, width: 5 });
    } else if (skill.type === 'regen') {
      this.player.regenTimer = skill.duration;
      this.player.regenRate = (this.player.maxHp * skill.power) / skill.duration;
      this.particles.ring(this.player.x, this.player.y - 16, color, 64, { life: 0.8, width: 4 });
    } else if (skill.type === 'dash') {
      this.player.invuln = Math.max(this.player.invuln, 0.45);
      this.player.dodgeTime = 0.26;
      const a = this.player.facing;
      this.player.dodgeVX = Math.cos(a) * 560;
      this.player.dodgeVY = Math.sin(a) * 560;
      this.areaDamage(this.player.x, this.player.y - 18, 72, atk * skill.power, 'player', { element, color, knock: 110 });
      this.particles.ring(this.player.x, this.player.y - 20, color, 76, { life: 0.45, width: 5 });
    }

    this.floatText(this.player.x, this.player.y - 70, skill.name.toUpperCase(), color, { size: 13, life: 0.7 });
    return true;
  }

  // ───────────────────────── Criaturas ─────────────────────────
  markWildSeen(w) {
    if (!this.state.player.seen.includes(w.speciesId)) {
      this.state.player.seen.push(w.speciesId);
      this.notify('Nueva criatura', `Has avistado a ${w.species.name}.`, 'info');
    }
  }

  captureCreature(w) {
    if (!w || w.captured) return;
    if (w.hp > w.maxHp * 0.45) {
      this.notify('Demasiado fuerte', `Debilita a ${w.species.name} por debajo del 45% para sellarla.`, 'error');
      return;
    }
    const seals = this.state.player.inventory;
    let sealId = seals.sello_luz > 0 ? 'sello_luz' : seals.sello_maestro > 0 ? 'sello_maestro' : null;
    if (!sealId) {
      this.notify('Sin sellos', 'Necesitas un Sello de Luz o un Sello Maestro.', 'error');
      return;
    }
    this.removeItem(sealId, 1);
    const seal = ITEMS[sealId];
    const luck = this.player.luck || 0;
    const ratio = 1 - w.hp / w.maxHp;
    let chance = 0.28 + ratio * 0.55 + luck * 0.008 + (seal.capture - 1) * 0.32;
    if (w.species.rarity === 'epico') chance -= 0.12;
    if (w.species.rarity === 'legendario') chance -= 0.22;
    chance = clamp(chance, 0.08, 0.94);
    this.audio.play('seal');
    this.particles.ring(w.x, w.y - 18, seal.color, 54, { life: 0.6, width: 4 });

    if (Math.random() < chance) {
      const instance = {
        uid: 'c' + Date.now() + Math.floor(Math.random() * 999),
        species: w.speciesId,
        nickname: w.species.name,
        level: w.level,
        xp: 0,
        xpNext: creatureXpNext(w.level),
        bond: 22,
        charm: null,
        capturedAt: Date.now(),
      };
      this.state.player.creatures.push(instance);
      if (!this.state.player.caught.includes(w.speciesId)) this.state.player.caught.push(w.speciesId);
      if (!this.state.player.seen.includes(w.speciesId)) this.state.player.seen.push(w.speciesId);
      if (this.state.player.creatures.length === 1) {
        this.state.player.activeCreature = 0;
        this.companion = new Companion(this, instance);
      }
      this.state.stats.captures++;
      w.captured = true;
      this.wilds = this.wilds.filter((x) => x !== w);
      this.audio.play('capture');
      this.particles.burst(w.x, w.y - 26, 28, { color: AFFINITIES[w.species.affinity].color, speed: 150, life: 0.9, size: 3, type: 'star' });
      this.checkQuests();
      this.showDialog({
        speaker: 'Sello de Luz', title: '¡Criatura capturada!',
        text: `${w.species.name} (Nv. ${w.level}) se ha unido a tu equipo.\n\n${w.species.lore}`,
        choices: [{ label: 'Bienvenida al equipo' }],
      });
      this.autoSave();
    } else {
      this.audio.play('fail');
      this.notify('El sello se rompió', `${w.species.name} escapa entre la luz. Quedan menos sellos.`, 'error');
      w.fleeTimer = 3.5;
      this.particles.burst(w.x, w.y - 24, 12, { color: '#ffb4c8', speed: 120, life: 0.5, size: 2, type: 'dust' });
    }
  }

  switchCreature() {
    const list = this.state.player.creatures;
    if (!list.length) {
      this.notify('Sin criaturas', 'Sella una criatura salvaje debilitada con Y.', 'error');
      return;
    }
    if (list.length === 1) {
      this.notify('Compañera activa', `${CREATURES[list[0].species].name} ya te acompaña.`, 'info');
      return;
    }
    this.state.player.activeCreature = (this.state.player.activeCreature + 1) % list.length;
    const active = list[this.state.player.activeCreature];
    const sp = CREATURES[active.species];
    this.player.mounted = false;
    this.companion = new Companion(this, active);
    if (this.player.x != null) { this.companion.x = this.player.x - 44; this.companion.y = this.player.y + 18; }
    this.audio.play('ui_equip');
    this.notify(`Compañera: ${sp.name}`, `Habilidad de exploración: ${sp.explore.label}.`, 'success');
  }

  creatureAddXp(index, amount) {
    const c = this.state.player.creatures[index];
    if (!c) return;
    c.xp += amount;
    let leveled = false;
    while (c.xp >= c.xpNext) {
      c.xp -= c.xpNext;
      c.level += 1;
      c.xpNext = creatureXpNext(c.level);
      c.bond = Math.min(100, c.bond + 2);
      leveled = true;
    }
    if (leveled) {
      this.audio.play('levelup');
      this.notify('Criatura fortalecida', `${CREATURES[c.species].name} alcanza el nivel ${c.level}.`, 'success');
    }
  }

  feedCreature(index, itemId) {
    const c = this.state.player.creatures[index];
    const item = ITEMS[itemId];
    if (!c || !item || item.type !== 'food' || !this.countItem(itemId)) return false;
    this.removeItem(itemId, 1);
    this.creatureAddXp(index, item.effect?.creatureXp || 0);
    c.bond = Math.min(100, c.bond + (item.effect?.creatureBond || 0));
    this.audio.play('pickup');
    this.particles.burst(this.player.x, this.player.y - 40, 10, { color: '#ffd36e', speed: 50, life: 0.6, size: 2, type: 'heal' });
    this.notify('Buen vínculo', `${CREATURES[c.species].name} disfruta de ${item.name}. Vínculo ${c.bond}%.`, 'success');
    return true;
  }

  trainCreature(index) {
    const c = this.state.player.creatures[index];
    if (!c) return;
    const cost = 30 + c.level * 6;
    if (this.state.player.gold < cost) { this.notify('Oro insuficiente', `Entrenar cuesta ${cost} de oro.`, 'error'); return; }
    this.state.player.gold -= cost;
    this.creatureAddXp(index, 45 + c.level * 14);
    c.bond = Math.min(100, c.bond + 2);
    this.audio.play('ui_equip');
    this.particles.burst(this.player.x, this.player.y - 30, 12, { color: '#8ce7ff', speed: 60, life: 0.7, size: 2, type: 'star' });
    this.notify('Entrenamiento', `${CREATURES[c.species].name} gana experiencia (−${cost} oro).`, 'info');
  }

  evolveCreature(index) {
    const c = this.state.player.creatures[index];
    if (!c) return;
    const sp = CREATURES[c.species];
    if (!sp.evolvesTo) { this.notify('Sin evolución', `${sp.name} ya ha alcanzado su forma final.`, 'info'); return; }
    if (c.level < sp.evolveLevel) { this.notify('Aún no', `Evoluciona al nivel ${sp.evolveLevel} (actual ${c.level}).`, 'error'); return; }
    const next = CREATURES[sp.evolvesTo];
    c.species = sp.evolvesTo;
    c.bond = Math.min(100, c.bond + 10);
    c.evolveFlash = 1;
    if (!this.state.player.caught.includes(sp.evolvesTo)) this.state.player.caught.push(sp.evolvesTo);
    if (!this.state.player.seen.includes(sp.evolvesTo)) this.state.player.seen.push(sp.evolvesTo);
    this.audio.play('evolve');
    this.particles.ring(this.player.x, this.player.y - 26, AFFINITIES[next.affinity].color, 120, { life: 0.8, width: 6 });
    this.particles.burst(this.player.x, this.player.y - 32, 34, { color: AFFINITIES[next.affinity].color, speed: 170, life: 1, size: 3, type: 'star' });
    this.companion = new Companion(this, c);
    this.notify('¡Evolución!', `${sp.name} se transforma en ${next.name}.`, 'quest');
    this.autoSave();
  }

  setCreatureCharm(index, itemId) {
    const c = this.state.player.creatures[index];
    if (!c) return;
    if (c.charm) {
      this.addItem(c.charm, 1);
      c.charm = null;
    }
    if (itemId) {
      const item = ITEMS[itemId];
      if (item?.type === 'charm' && this.countItem(itemId)) {
        this.removeItem(itemId, 1);
        c.charm = itemId;
        this.audio.play('ui_equip');
        this.notify('Amuleto equipado', `${CREATURES[c.species].name} lleva ${item.name}.`, 'success');
      }
    }
  }

  releaseCreature(index) {
    const c = this.state.player.creatures[index];
    if (!c) return;
    this.ui.confirm('Liberar criatura', `¿Despedir a ${CREATURES[c.species].name}? Volverá al bosque y perderás su vínculo.`, () => {
      const sp = CREATURES[c.species];
      if (c.charm) this.addItem(c.charm, 1);
      this.state.player.creatures.splice(index, 1);
      if (this.state.player.activeCreature >= this.state.player.creatures.length) {
        this.state.player.activeCreature = Math.max(0, this.state.player.creatures.length - 1);
      }
      const active = this.state.player.creatures[this.state.player.activeCreature];
      this.companion = active ? new Companion(this, active) : null;
      this.player.mounted = false;
      this.audio.play('close');
      this.notify('Hasta pronto', `${sp.name} regresa a la espesura.`, 'info');
      this.ui.rerender();
    });
  }

  toggleCreatureMount() {
    this.player.toggleMount();
  }

  // ───────────────────────── Objetos / NPC ─────────────────────────
  countItem(id) { return this.state.player.inventory[id] || 0; }

  addItem(id, qty = 1) {
    if (!ITEMS[id] || qty <= 0) return;
    this.state.player.inventory[id] = (this.state.player.inventory[id] || 0) + qty;
  }

  removeItem(id, qty = 1) {
    const inv = this.state.player.inventory;
    if (!inv[id]) return false;
    inv[id] -= qty;
    if (inv[id] <= 0) delete inv[id];
    return true;
  }

  useItem(id) {
    const item = ITEMS[id];
    if (!item) return;
    if (isEquippable(item)) { this.equipItem(id); return; }
    if (item.type === 'consumable') {
      const p = this.player;
      const eff = item.effect || {};
      if (eff.hp && p.hp >= p.maxHp && !eff.mp) { this.notify('Vida completa', 'No necesitas esa poción ahora.', 'info'); return; }
      if (eff.mp && p.mp >= p.maxMp && !eff.hp) { this.notify('Maná completo', 'No necesitas ese éter ahora.', 'info'); return; }
      if (!this.removeItem(id, 1)) return;
      if (eff.hp) p.heal(Math.min(eff.hp, p.maxHp));
      if (eff.mp) p.restoreMp(Math.min(eff.mp, p.maxMp));
      this.audio.play('pickup');
      this.notify(item.name, 'Usado correctamente.', 'success');
      this.ui.rerender();
    } else if (item.type === 'food') {
      this.notify('Comida de criatura', 'Abre Criaturas y usa Alimentar para dársela a tu compañera.', 'info');
    } else if (item.type === 'seal') {
      this.notify('Sello de captura', 'Debilita a una criatura salvaje y pulsa Y para sellarla.', 'info');
    } else if (item.type === 'charm') {
      this.notify('Amuleto de criatura', 'Equípalo desde la ficha de una criatura.', 'info');
    } else if (item.type === 'key') {
      this.notify(item.name, item.desc, 'info');
    } else {
      this.notify(item.name, item.desc, 'info');
    }
  }

  equipItem(id) {
    const item = ITEMS[id];
    if (!item || !item.slot) return;
    const slot = item.slot;
    if (!(this.countItem(id) > 0 || this.state.player.equipment[slot] === id)) {
      this.notify('No disponible', 'No tienes ese objeto.', 'error');
      return;
    }
    this.state.player.equipment[slot] = id;
    this.player.refreshStats();
    this.state.player.hp = Math.min(this.state.player.hp, this.player.maxHp);
    this.state.player.mp = Math.min(this.state.player.mp, this.player.maxMp);
    this.audio.play('ui_equip');
    this.notify('Equipado', `${item.name} ocupa el espacio de ${slot === 'offhand' ? 'mano secundaria' : slot === 'weapon' ? 'arma' : slot === 'armor' ? 'armadura' : 'accesorio'}.`, 'success');
    this.ui.rerender();
  }

  unequip(slot) {
    if (slot === 'weapon') { this.notify('Arma obligatoria', 'Siempre debes llevar un arma equipada.', 'error'); return; }
    this.state.player.equipment[slot] = null;
    this.player.refreshStats();
    this.audio.play('ui_equip');
    this.ui.rerender();
  }

  equipWeaponById(id) {
    if (!ITEMS[id] || ITEMS[id].slot !== 'weapon') return;
    this.state.player.equipment.weapon = id;
    this.player.refreshStats();
    this.audio.play('ui_equip');
    this.notify('Arma cambiada', `${ITEMS[id].name} · ${ITEMS[id].dmg} daño · alcance ${ITEMS[id].reach}.`, 'info');
  }

  switchWeapon() {
    const owned = new Set();
    const eq = this.state.player.equipment;
    if (eq.weapon) owned.add(eq.weapon);
    for (const [id, qty] of Object.entries(this.state.player.inventory)) {
      if (qty > 0 && ITEMS[id]?.slot === 'weapon') owned.add(id);
    }
    const list = [...owned];
    if (list.length < 2) {
      this.notify('Sin alternativa', 'Consigue otra arma para alternar con L.', 'info');
      return;
    }
    const idx = list.indexOf(eq.weapon);
    const next = list[(idx + 1) % list.length];
    this.equipWeaponById(next);
  }

  allocateAttr(attr) {
    const p = this.state.player;
    if (p.statPoints <= 0) { this.notify('Sin puntos', 'Sube de nivel para obtener puntos de atributo.', 'error'); return; }
    if (!(attr in p.attrs)) return;
    p.attrs[attr] += 1;
    p.statPoints -= 1;
    this.player.refreshStats();
    this.audio.play('ui_equip');
    this.ui.rerender();
  }

  interact() {
    if (this.dialogOpen || this.ui.modalOpen) return;
    if (this.captureTarget) {
      this.captureCreature(this.captureTarget);
      return;
    }
    const item = this.nearInteraction;
    if (!item) return;
    if (!item.enabled) {
      this.notify('Camino bloqueado', item.label, 'error');
      this.audio.play('error');
      return;
    }
    this.handleInteraction(item);
  }

  handleInteraction(item) {
    switch (item.type) {
      case 'chest': this.openChest(item); break;
      case 'sign': this.showDialog({ speaker: 'Inscripción', title: 'Piedra grabada', text: (item.text || '').replace(/\\|/g, '\n'), choices: [{ label: 'Leer y continuar' }] }); break;
      case 'npc': this.talkTo(item.npcId); break;
      case 'portal': this.travelTo(item.portal); break;
      case 'shrine': this.restAtShrine(item); break;
      case 'boulder':
        this.state.flags.boulder_moved = true;
        this.audio.play('heavy');
        this.particles.burst(item.x, item.y - 20, 24, { color: '#d3a46b', speed: 150, life: 0.7, size: 4, type: 'dust' });
        this.shake(12);
        this.notify('Roca desplazada', 'Un pasadizo oculto queda al descubierto.', 'success');
        this.autoSave();
        break;
      case 'bramble':
        this.state.flags.bramble_burned = true;
        this.audio.play('fire');
        this.particles.burst(item.x, item.y - 20, 32, { color: '#ff8b5f', speed: 160, life: 0.9, size: 3, type: 'ember', additive: true });
        this.notify('Espinas quemadas', 'El fuego de tu criatura abre el camino.', 'success');
        this.autoSave();
        break;
      case 'ice_gate':
        this.state.flags.ice_gate = true;
        this.audio.play('ice');
        this.particles.ring(item.x, item.y - 20, '#bfeaff', 110, { life: 0.8, width: 5 });
        this.notify('Sello congelado', 'El hielo se quiebra y la puerta cede.', 'success');
        this.autoSave();
        break;
      case 'rune':
        this.state.flags.rune_power = true;
        this.audio.play('seal');
        this.particles.burst(item.x, item.y - 20, 26, { color: '#ffe26e', speed: 130, life: 0.8, size: 2.5, type: 'star' });
        this.notify('Runa activada', 'La barrera de relámpago se disipa.', 'success');
        this.autoSave();
        break;
      case 'secret':
        this.state.flags[item.flag || 'secret_ruins'] = true;
        this.audio.play('magic');
        this.particles.burst(item.x, item.y - 30, 24, { color: '#b990ff', speed: 110, life: 0.9, size: 3, type: 'shard' });
        this.notify('Secreto revelado', 'La ilusión se desvanece. Hay algo detrás.', 'quest');
        this.autoSave();
        break;
      case 'gap':
        this.state.flags.bridge_grown = true;
        this.audio.play('heal');
        this.particles.burst(item.x, item.y - 10, 34, { color: '#9ce98a', speed: 100, life: 1.1, size: 3, type: 'leaf' });
        this.notify('Puente de raíces', 'La naturaleza tiende un camino sobre el abismo.', 'success');
        this.autoSave();
        break;
      case 'seal':
        this.state.flags.celestial_seal = true;
        this.audio.play('seal');
        this.particles.ring(item.x, item.y - 20, '#fff1b8', 120, { life: 1, width: 6 });
        this.notify('Sello celestial abierto', 'La luz reconoce a su portadora.', 'quest');
        this.autoSave();
        break;
      case 'altar': this.claimSword(); break;
      default: this.notify('Sin efecto', 'Ese objeto no reacciona.', 'info');
    }
  }

  openChest(item) {
    if (this.state.world.openedChests.includes(item.chestId)) return;
    this.state.world.openedChests.push(item.chestId);
    this.state.stats.chests++;
    const loot = item.loot || {};
    const lines = [];
    if (loot.gold) { this.state.player.gold += loot.gold; lines.push(`+${loot.gold} de oro`); }
    for (const [id, qty] of Object.entries(loot.items || {})) {
      this.addItem(id, qty);
      lines.push(`${ITEMS[id]?.name || id} ×${qty}`);
    }
    this.audio.play('coin');
    this.particles.burst(item.x, item.y - 26, 26, { color: '#ffe49b', speed: 130, life: 0.8, size: 2.6, type: 'star' });
    this.shake(4);
    this.showDialog({
      speaker: 'Cofre antiguo', title: 'Has encontrado',
      text: lines.length ? lines.join('\n') : 'Solo polvo y silencio.',
      choices: [{ label: 'Guardar en el inventario' }],
    });
    this.checkQuests();
    this.autoSave();
  }

  restAtShrine(item) {
    const p = this.player;
    p.hp = p.maxHp; p.mp = p.maxMp; p.stamina = p.maxStamina;
    this.state.player.hp = p.maxHp;
    this.state.player.mp = p.maxMp;
    this.state.player.stamina = p.maxStamina;
    this.state.respawn = { zoneId: this.state.zoneId, x: item.x + 30, y: item.y + 40 };
    this.skillCds = {};
    this.audio.play('heal');
    this.audio.play('save');
    this.particles.ring(item.x, item.y - 24, '#ffe49b', 110, { life: 1.1, width: 5 });
    this.particles.burst(this.player.x, this.player.y - 24, 22, { color: '#a8ffb5', speed: 70, life: 0.9, size: 2.4, type: 'heal' });
    this.autoSave();
    this.notify('Santuario', 'Vida, maná y resistencia restaurados. Partida guardada.', 'success');
  }

  talkTo(npcId) {
    const counts = this.state.stats.talkCounts;
    counts[npcId] = (counts[npcId] || 0) + 1;
    this.state.stats.talked[npcId] = true;
    this.checkQuests();
    const npc = NPCS[npcId] || NPCS.aldeano;
    const q = this.state.quests;

    if (npcId === 'lira') {
      const main = q.main_luz;
      let text;
      if (main.status === 'complete') {
        text = 'La Espada ya tiene dueña. Aun así, el mundo sigue siendo enorme.\n\nDescansa cuando lo necesites. Yo vigilaré el alba.';
      } else if (main.step <= 1) {
        text = 'Te he estado esperando, Portadora. La Espada de Lumen despertó contigo.\n\nEl sello de Umbra se agrieta. La Anciana Celia, en la Aldea del Alba, sabe leer las grietas del cielo. Ve a hablar con ella.';
      } else if (main.step === 2) {
        text = 'La Anciana ha abierto el camino. Las Ruinas de Umbra están al este, más allá del río.\n\nNo vayas sola. Captura criaturas: algunas pueden cruzar lo que tú no puedes.';
      } else if (main.step === 3) {
        text = 'El Sello de Escarcha detiene el avance. Una criatura de hielo puede congelar sus mecanismos.\n\nEscarcha ronda el bosque y las ruinas. Busca su luz azul.';
      } else if (main.step === 4) {
        text = 'El Guardián Corrompido custodia la arena central. Mil años de deber convertidos en furia.\n\nObserva sus fases. Cuando el aura cambie a rojo, no te quedes cerca.';
      } else if (main.step >= 5) {
        text = 'El Guardián ha caído. El Santuario Celestial te espera al norte de las ruinas.\n\nLa Espada reconocerá tu mano. Estoy segura.';
      }
      const choices = [{ label: 'Cerrar' }];
      if (q.side_gelatinas.status === 'locked') {
        choices.unshift({ label: 'Aceptar encargo: Gelatinas traviesas', onSelect: () => { this.acceptQuest('side_gelatinas'); this.showLiraQuestInfo(); } });
      } else if (q.side_gelatinas.status === 'active') {
        choices.unshift({ label: 'Preguntar por las gelatinas', onSelect: () => this.showLiraQuestInfo() });
      }
      this.showDialog({ speaker: npc.name, title: npc.title, text, choices });
      return;
    }

    if (npcId === 'celia') {
      let text = 'El cielo se rompió una vez, y las cicatrices aún brillan de noche.\n\nLa Espada no elige a los valientes. Elige a quienes pueden cargar con la duda.';
      const main = q.main_luz;
      if (main.step >= 2 && main.step < 6) text = 'He abierto el sello de la aldea. Las Ruinas de Umbra ya no te rechazarán.\n\nBusca el Sello de Escarcha y escucha a las criaturas que habitan el frío.';
      else if (main.step === 1) text = 'La Espada... sí. La siento desde aquí.\n\nVe a las Ruinas de Umbra. He despertado el antiguo camino para ti.';
      const choices = [{ label: 'Despedirse' }];
      if (q.side_captura.status === 'locked') {
        choices.unshift({ label: 'Aceptar encargo: Un hogar para la luz', onSelect: () => { this.acceptQuest('side_captura'); this.showDialog({ speaker: npc.name, title: 'Un hogar para la luz', text: 'Captura una criatura silvestre y vuelve a contármelo. Quiero saber si aún recuerdan el nombre de la Espada.', choices: [{ label: 'Lo haré' }] }); } });
      } else if (q.side_captura.status === 'active') {
        choices.unshift({ label: 'Preguntar por las criaturas', onSelect: () => this.showDialog({ speaker: npc.name, title: 'Un hogar para la luz', text: 'Debilita a una criatura y ofrécele un sello. La confianza no se impone.', choices: [{ label: 'Entendido' }] }) });
      }
      this.showDialog({ speaker: npc.name, title: npc.title, text, choices });
      return;
    }

    if (npcId === 'mira') {
      const choices = [
        { label: 'Ver mercancía', onSelect: () => this.openShop('mira') },
        { label: 'Despedirse' },
      ];
      if (q.side_plumas.status === 'locked') {
        choices.unshift({ label: 'Aceptar encargo: Plumas para un sueño', onSelect: () => { this.acceptQuest('side_plumas'); this.showDialog({ speaker: npc.name, title: 'Plumas para un sueño', text: 'Tres plumas de Zéfiro. No dos, no cuatro. El talismán es exigente.\n\nLas criaturas del viento rondan el bosque y las ruinas.', choices: [{ label: 'Las conseguiré' }] }); } });
      } else if (q.side_plumas.status === 'active' && q.side_plumas.step === 1) {
        choices.unshift({ label: 'Entregar las plumas', onSelect: () => this.showDialog({ speaker: npc.name, title: 'Plumas para un sueño', text: 'Aún no tienes las tres plumas. Las criaturas de viento dejan caer una al ser derrotadas... o al ser capturadas con cuidado.', choices: [{ label: 'Volveré' }] }) });
      }
      this.showDialog({ speaker: npc.name, title: npc.title, text: '¡Ah, una cara nueva! O quizá no tan nueva: hueles a aventura y a vendas mal puestas.\n\nTengo pociones, sellos y cosas que brillan. Todo a buen precio.', choices });
      return;
    }

    if (npcId === 'rurik') {
      const choices = [
        { label: 'Ver la forja', onSelect: () => this.openShop('rurik') },
        { label: 'Despedirse' },
      ];
      if (q.side_corazon.status === 'locked') {
        choices.unshift({ label: 'Aceptar encargo: El corazón de piedra', onSelect: () => { this.acceptQuest('side_corazon'); this.showDialog({ speaker: npc.name, title: 'El corazón de piedra', text: 'Dos caparazones pétreos. Enteros. Si me traes polvo, te lo descuento del precio... y de la paciencia.', choices: [{ label: 'Dos caparazones, entendido' }] }); } });
      } else if (q.side_corazon.status === 'active' && q.side_corazon.step === 1) {
        choices.unshift({ label: 'Entregar los caparazones', onSelect: () => this.showDialog({ speaker: npc.name, title: 'El corazón de piedra', text: 'Aún no hay dos caparazones en tu zurrón. Los escarabajos de Umbra son duros, pero no invulnerables.', choices: [{ label: 'Volveré' }] }) });
      }
      this.showDialog({ speaker: npc.name, title: npc.title, text: 'El acero no miente. Se calienta, se dobla, se rompe. Como la gente.\n\nMira lo que tengo. Nada de adornos inútiles.', choices });
      return;
    }

    const tip = TIPS[Math.floor(Math.random() * TIPS.length)];
    this.showDialog({
      speaker: npc.name, title: npc.title,
      text: `«${tip}»\n\nEl viento trae noticias del bosque. Dicen que la luz está despertando.`,
      choices: [{ label: 'Gracias' }],
    });
  }

  showLiraQuestInfo() {
    const q = this.state.quests.side_gelatinas;
    const kills = this.state.stats.kills.gelatina || 0;
    if (q.status === 'complete') {
      this.showDialog({ speaker: 'Lira', title: 'Gelatinas traviesas', text: 'Las flores de luna vuelven a mecerse. Gracias a ti.', choices: [{ label: 'Cerrar' }] });
    } else {
      this.showDialog({
        speaker: 'Lira', title: 'Gelatinas traviesas',
        text: `Las gelatinas roban las flores de luna del santuario. Derrota a cuatro.\n\nProgreso: ${Math.min(4, kills)}/4.`,
        choices: [{ label: 'Seguiré con ello' }],
      });
    }
  }

  openShop(npcId) {
    const stock = SHOP_STOCK[npcId];
    if (!stock) return;
    this.ui.openShop(npcId, stock);
    this.audio.play('open');
  }

  buyItem(id, qty = 1) {
    const item = ITEMS[id];
    if (!item) return;
    const cost = itemValue(id) * qty;
    if (this.state.player.gold < cost) { this.notify('Oro insuficiente', `Necesitas ${cost} de oro.`, 'error'); return; }
    this.state.player.gold -= cost;
    this.addItem(id, qty);
    this.audio.play('coin');
    this.notify('Compra realizada', `${item.name} ×${qty} (−${cost} oro).`, 'success');
    this.ui.rerender();
  }

  sellItem(id, qty = 1) {
    const item = ITEMS[id];
    if (!item || !this.countItem(id)) return;
    if (Object.values(this.state.player.equipment).includes(id)) {
      this.notify('Objeto equipado', 'Desequípalo antes de venderlo.', 'error');
      return;
    }
    if (item.type === 'key') { this.notify('Objeto clave', 'No puedes venderlo.', 'error'); return; }
    const value = Math.max(1, Math.floor(itemValue(id) * 0.5)) * qty;
    this.removeItem(id, qty);
    this.state.player.gold += value;
    this.audio.play('coin');
    this.notify('Venta realizada', `${item.name} ×${qty} (+${value} oro).`, 'success');
    this.ui.rerender();
  }

  craftItem(recipeId) {
    const recipe = RECIPES[recipeId];
    if (!recipe) return;
    if (this.state.player.gold < recipe.cost) { this.notify('Oro insuficiente', `La forja cuesta ${recipe.cost} de oro.`, 'error'); return; }
    for (const [mat, qty] of Object.entries(recipe.mats)) {
      if (this.countItem(mat) < qty) {
        this.notify('Materiales insuficientes', `Falta ${ITEMS[mat]?.name || mat}.`, 'error');
        return;
      }
    }
    this.state.player.gold -= recipe.cost;
    for (const [mat, qty] of Object.entries(recipe.mats)) this.removeItem(mat, qty);
    this.addItem(recipe.out, recipe.qty);
    this.state.stats.crafted += recipe.qty;
    this.audio.play('ui_equip');
    this.notify('Objeto creado', `${ITEMS[recipe.out]?.name} ×${recipe.qty}.`, 'success');
    this.ui.rerender();
  }

  // ───────────────────────── Misiones / progreso ─────────────────────────
  acceptQuest(id) {
    const q = this.state.quests[id];
    const def = QUESTS[id];
    if (!q || !def || q.status !== 'locked') return false;
    q.status = 'active';
    q.step = 0;
    q.startedAt = this.state.playTime;
    const first = def.steps[0]?.target;
    q.talkMark = first?.type === 'talk' ? (this.state.stats.talkCounts[first.id] || 0) : 0;
    this.audio.play('quest');
    this.notify('Nueva misión', def.title, 'quest');
    this.checkQuests();
    return true;
  }

  questStepMet(target) {
    if (!target) return false;
    const count = target.count || 1;
    if (target.type === 'flag') return !!this.state.flags[target.id];
    if (target.type === 'zone') return this.state.zoneId === target.id;
    if (target.type === 'kill') return (this.state.stats.kills[target.id] || 0) >= count;
    if (target.type === 'collect') return this.countItem(target.id) >= count;
    if (target.type === 'capture') return this.state.stats.captures >= count;
    if (target.type === 'talk') {
      const q = Object.values(this.state.quests).find((quest) => QUESTS[quest.id]?.steps[quest.step]?.target === target);
      const mark = q?.talkMark || 0;
      return (this.state.stats.talkCounts[target.id] || 0) > mark;
    }
    return false;
  }

  checkQuests() {
    if (!this.state) return;
    for (const id of Object.keys(QUESTS)) {
      const q = this.state.quests[id];
      if (!q || q.status !== 'active') continue;
      let guard = 0;
      while (q.status === 'active' && guard++ < 12) {
        const def = QUESTS[id];
        const step = def.steps[q.step];
        if (!step) { this.completeQuest(id); break; }
        if (!this.questStepMet(step.target)) break;
        q.step += 1;
        this.state.stats.steps += 1;
        if (q.step >= def.steps.length) {
          this.completeQuest(id);
          break;
        }
        const next = def.steps[q.step];
        if (next?.target?.type === 'talk') q.talkMark = this.state.stats.talkCounts[next.target.id] || 0;
        if (id === 'main_luz' && q.step === 2) {
          this.state.flags.ruins_unlocked = true;
          this.notify('Camino abierto', 'Las Ruinas de Umbra ya no están selladas.', 'quest');
        }
        this.notify('Misión actualizada', `${def.title}: ${next.text}`, 'quest');
        this.audio.play('quest');
      }
    }
  }

  completeQuest(id) {
    const q = this.state.quests[id];
    const def = QUESTS[id];
    if (!q || q.status === 'complete') return;
    q.status = 'complete';
    for (const step of def.steps) {
      if (step.target?.type === 'collect') this.removeItem(step.target.id, step.target.count || 1);
    }
    const rewards = def.rewards || {};
    if (rewards.gold) this.state.player.gold += rewards.gold;
    for (const [item, qty] of Object.entries(rewards.items || {})) this.addItem(item, qty);
    if (rewards.xp) this.player.gainXp(rewards.xp);
    this.audio.play('quest');
    this.notify('¡Misión completada!', `${def.title} · +${rewards.gold || 0} oro`, 'quest');
    this.ui.toast('Misión completada', def.title, 'success');
    this.autoSave();
  }

  unlockSkills(silent = false) {
    const p = this.state.player;
    for (const [id, skill] of Object.entries(SKILLS)) {
      if (skill.level <= p.level && !p.unlockedSkills.includes(id)) {
        p.unlockedSkills.push(id);
        if (!silent) {
          this.notify('Nueva habilidad', `${skill.name} desbloqueada.`, 'success');
          this.audio.play('levelup');
        }
      }
    }
  }

  onLevelUp() {
    const p = this.state.player;
    const before = new Set(p.unlockedSkills);
    this.unlockSkills(false);
    this.audio.play('levelup');
    this.particles.ring(this.player.x, this.player.y - 20, '#ffe49b', 110, { life: 1, width: 6 });
    this.particles.burst(this.player.x, this.player.y - 30, 34, { color: '#fff1b8', speed: 100, life: 1.1, size: 2.8, type: 'star' });
    this.notify('¡Subiste de nivel!', `Nivel ${p.level} · +2 puntos de atributo`, 'quest');
    this.ui.toast('Nivel ' + p.level, 'Reparte tus puntos en Estadísticas.', 'success');
    const newSkills = p.unlockedSkills.filter((id) => !before.has(id));
    if (newSkills.length) {
      this.showDialog({
        speaker: 'La Espada', title: 'Nuevos ecos de luz',
        text: newSkills.map((id) => `✦ ${SKILLS[id].name} — ${SKILLS[id].desc}`).join('\n\n'),
        choices: [{ label: 'Probar la nueva habilidad' }],
      });
    }
    this.autoSave();
  }

  // ───────────────────────── Jefe / muerte / final ─────────────────────────
  startBossFight(boss) {
    this.boss = boss;
    this.bossActive = true;
    this.audio.setMusic('boss');
    this.audio.play('bossroar');
    this.shake(16);
    this.ui.showBossBar(boss);
    this.ui.toast('Guardián Corrompido', 'Mil años de deber hechos furia.', 'danger');
    this.notify('¡Jefe despertado!', 'Observa sus telegrafías y cambia de fase con cuidado.', 'danger');
  }

  onBossPhase(boss, phase) {
    this.particles.ring(boss.x, boss.y - 50, phase === 3 ? '#ff6b5e' : phase === 2 ? '#ff8ac0' : '#c79aff', 220, { life: 1, width: 9 });
    this.particles.burst(boss.x, boss.y - 48, 34, { color: phase === 3 ? '#ff9a6e' : '#c79aff', speed: 220, life: 0.9, size: 3, type: 'star' });
    this.shake(18);
    this.audio.play('bossroar');
    const msg = phase === 2 ? 'Su armadura se agrieta. Invoca sombras.' : 'Fase final. La arena arde.';
    this.ui.toast('El Guardián cambia', msg, 'danger');
  }

  spawnSummon(boss, x, y) {
    const enemy = new Enemy(this, 'espectro', x, y, Math.max(1, boss.level - 2));
    enemy.summoned = true;
    enemy.aggro = true;
    this.enemies.push(enemy);
    this.particles.burst(x, y - 24, 16, { color: '#b990ff', speed: 90, life: 0.7, size: 2.6, type: 'star' });
  }

  onEnemyKilled(enemy, opts) {
    if (!enemy || enemy.rewarded) return;
    enemy.rewarded = true;
    this.state.stats.enemiesDefeated++;
    this.state.stats.kills[enemy.kind] = (this.state.stats.kills[enemy.kind] || 0) + 1;
    const xp = Math.round(enemy.def.xp * (1 + (enemy.level - 1) * 0.12));
    const gold = randInt(enemy.def.gold[0], enemy.def.gold[1]);
    this.state.player.gold += gold;
    this.player.gainXp(xp);
    this.floatText(enemy.x, enemy.y - enemy.r - 44, `+${xp} XP`, '#ffe49b', { size: 15 });
    this.floatText(enemy.x, enemy.y - enemy.r - 62, `+${gold} oro`, '#ffd36e', { size: 13 });
    const drops = [];
    for (const d of enemy.def.drops || []) {
      if (Math.random() < d.chance) { this.addItem(d.id, 1); drops.push(d.id); }
    }
    if (drops.length) {
      this.notify('Botín', drops.map((id) => ITEMS[id]?.name || id).join(' · '), 'success');
    }
    if (enemy.boss) {
      this.state.flags.boss_defeated = true;
      this.boss = null;
      this.bossActive = false;
      this.ui.hideBossBar();
      this.audio.setMusic('ruins');
      this.audio.play('victory');
      this.state.player.gold += 0;
      this.autoSave();
      this.checkQuests();
      this.showDialog({
        speaker: 'Guardián Corrompido', title: 'El deber se rompe',
        text: '…Por fin. Alguien que recuerda.\n\nLa Espada no está en Umbra. Siempre estuvo arriba, en el Santuario Celestial. El portal norte ha despertado.\n\nLlévale mi corazón. Que ella sepa que no olvidé.',
        choices: [{ label: 'Cerrar los ojos del Guardián' }],
      });
    }
    this.checkQuests();
  }

  onPlayerDeath() {
    if (this.playerDead) return;
    this.playerDead = true;
    this.state.stats.deaths++;
    this.audio.play('death');
    this.audio.stopMusic();
    this.shake(16);
    this.ui.showDeath({
      gold: this.state.player.gold,
    });
  }

  revive() {
    if (!this.playerDead) return;
    const lost = Math.floor(this.state.player.gold * 0.1);
    this.state.player.gold = Math.max(0, this.state.player.gold - lost);
    const respawn = this.state.respawn || { zoneId: this.state.zoneId, x: 400, y: 400 };
    this.playerDead = false;
    this.ui.hideDeath();
    if (respawn.zoneId !== this.state.zoneId) {
      this.buildZone(respawn.zoneId, { x: respawn.x, y: respawn.y });
    } else {
      this.player.x = respawn.x;
      this.player.y = respawn.y;
      this.state.player.x = respawn.x;
      this.state.player.y = respawn.y;
    }
    this.player.hp = this.player.maxHp;
    this.player.mp = this.player.maxMp;
    this.player.stamina = this.player.maxStamina;
    this.player.invuln = 1.5;
    this.state.player.hp = this.player.hp;
    this.state.player.mp = this.player.mp;
    this.state.player.stamina = this.player.stamina;
    this.audio.setMusic(ZONES[this.state.zoneId].music);
    this.audio.play('heal');
    this.notify('El alba te recibe', `Has perdido ${lost} de oro, pero conservas tu historia.`, 'info');
    this.autoSave();
  }

  claimSword() {
    if (this.state.flags.ending) {
      this.showDialog({ speaker: 'Espada Celestial', title: 'Un cielo que recuerda', text: 'La hoja sigue cantando. Ya no hay nada que sellar... por ahora.', choices: [{ label: 'Contemplar la luz' }] });
      return;
    }
    this.state.flags.ending = true;
    this.addItem('filo_celeste', 1);
    this.addItem('armadura_celestial', 1);
    this.state.player.equipment.weapon = 'filo_celeste';
    this.state.player.equipment.armor = 'armadura_celestial';
    this.player.refreshStats();
    this.player.hp = this.player.maxHp;
    this.player.mp = this.player.maxMp;
    this.state.player.hp = this.player.hp;
    this.state.player.mp = this.player.mp;
    this.audio.play('victory');
    this.audio.setMusic('victory');
    this.particles.ring(this.player.x, this.player.y - 26, '#fff1b8', 250, { life: 1.6, width: 10 });
    this.particles.burst(this.player.x, this.player.y - 30, 70, { color: '#fff1b8', speed: 220, life: 1.6, size: 3.4, type: 'star' });
    this.shake(18);
    this.checkQuests();
    this.autoSave();
    this.endingOpen = true;
    this.ui.showEnding(this.getEndingSummary());
  }

  continueAfterEnding() {
    this.endingOpen = false;
    this.ui.hideEnding();
    this.audio.setMusic('sanctuary');
    this.notify('La historia continúa', 'Explora el santuario o vuelve sobre tus pasos.', 'success');
  }

  getEndingSummary() {
    const p = this.state.player;
    return {
      name: p.name,
      level: p.level,
      playTime: formatPlayTime(this.state.playTime),
      creatures: p.creatures.length,
      collection: p.caught.length,
      kills: this.state.stats.enemiesDefeated,
      deaths: this.state.stats.deaths,
      quests: Object.values(this.state.quests).filter((q) => q.status === 'complete').length,
      gold: p.gold,
      sword: 'Filo Celestial',
    };
  }

  // ───────────────────────── Ajustes / guardado ─────────────────────────
  notify(title, text = '', type = 'info') { this.ui.toast(title, text, type); }
  floatText(x, y, text, color = '#fff', opts = {}) { this.particles.floatText(x, y, text, color, opts); }
  shake(amount) { if (this.settings.shake) this.shakeAmt = Math.max(this.shakeAmt, amount); }

  openPause() {
    if (!this.state || this.mode !== 'play') return;
    if (this.ui.modalOpen) return;
    this.audio.play('open');
    this.audio.duck(true);
    this.ui.openScreen('pause');
  }

  openQuick() {
    if (!this.state) return;
    this.audio.play('open');
    this.audio.duck(true);
    this.ui.openScreen('quick');
  }

  onMenuClosed() {
    this.audio.duck(false);
  }

  saveToSlot(slot) {
    if (!this.state) return false;
    this.state.player.hp = this.player?.hp ?? this.state.player.hp;
    this.state.player.mp = this.player?.mp ?? this.state.player.mp;
    this.state.player.stamina = this.player?.stamina ?? this.state.player.stamina;
    const ok = this.store.saveSlot(slot, this.state);
    if (ok) {
      this.audio.play('save');
      this.notify(slot === 0 ? 'Guardado automático' : 'Partida guardada', `Ranura ${slot === 0 ? 'automática' : slot}.`, 'success');
      this.ui.refreshSaveSlots();
    } else {
      this.notify('No se pudo guardar', 'El almacenamiento local está lleno o bloqueado.', 'error');
    }
    return ok;
  }

  autoSave() {
    if (!this.state) return;
    this.store.saveSlot(0, this.state);
    this.ui.savePulse();
  }

  loadSlot(slot) {
    const payload = this.store.loadSlot(slot);
    if (!payload) { this.notify('Ranura vacía', 'No hay datos en esa ranura.', 'error'); return; }
    this.audio.play('open');
    this.applyState(payload.state);
    this.audio.setMusic(ZONES[this.state.zoneId].music);
    this.notify('Partida cargada', `${this.state.player.name} · Nivel ${this.state.player.level}`, 'success');
  }

  deleteSlot(slot) {
    if (slot === 0) { this.notify('Ranura automática', 'No puedes borrar el guardado automático.', 'error'); return; }
    this.store.deleteSlot(slot);
    this.notify('Ranura borrada', `Ranura ${slot}.`, 'info');
    this.ui.refreshSaveSlots();
  }

  applySettings(patch) {
    this.settings = { ...this.settings, ...patch };
    this.store.saveSettings(this.settings);
    this.audio.updateSettings(this.settings);
    this.particles.setQuality(this.settings.quality);
    this.ui.applyTouchMode();
    if ('fullscreen' in patch) this.applyFullscreen();
  }

  async applyFullscreen() {
    try {
      if (this.settings.fullscreen && !document.fullscreenElement) await document.documentElement.requestFullscreen();
      if (!this.settings.fullscreen && document.fullscreenElement) await document.exitFullscreen();
    } catch {
      this.settings.fullscreen = !!document.fullscreenElement;
      this.store.saveSettings(this.settings);
      this.notify('Pantalla completa', 'El navegador no permite cambiar el modo ahora.', 'error');
    }
  }

  returnToTitle() {
    this.autoSave();
    this.mode = 'menu';
    this.state = null;
    this.world = null;
    this.player = null;
    this.companion = null;
    this.enemies = [];
    this.wilds = [];
    this.projectiles = [];
    this.zaps = [];
    this.boss = null;
    this.bossActive = false;
    this.playerDead = false;
    this.endingOpen = false;
    this.introActive = false;
    this.ui.closeAll();
    this.ui.showTitle();
    this.audio.setMusic('menu');
    this.fade = { a: 0, target: 0, cb: null };
    this.traveling = false;
  }

  // ───────────────────────── Interacción / render ─────────────────────────
  updateInteraction() {
    if (!this.world || !this.player) return;
    const ctx = this.collisionCtx(true);
    const list = this.world.getInteractions(this.player, ctx);
    this.nearInteraction = list[0] || null;

    let capture = null;
    let best = 82;
    for (const w of this.wilds) {
      if (w.captured) continue;
      const d = Math.hypot(w.x - this.player.x, w.y - this.player.y);
      if (d < best) { best = d; capture = w; }
    }
    this.captureTarget = capture;

    let prompt = null;
    if (capture) {
      const weak = capture.hp <= capture.maxHp * 0.45;
      prompt = {
        key: 'Y',
        label: weak ? `Sellar a ${capture.species.name} (${Math.ceil((capture.hp / capture.maxHp) * 100)}%)` : `Debilita a ${capture.species.name} para sellarla`,
        enabled: weak,
        sub: weak ? 'Sello de Luz / Maestro' : 'Baja su vida por debajo del 45%',
        type: 'capture',
      };
    } else if (this.nearInteraction) {
      const it = this.nearInteraction;
      prompt = {
        key: 'Y',
        label: it.label,
        enabled: it.enabled,
        sub: !it.enabled ? 'Requiere una habilidad de criatura' : '',
        type: it.type,
      };
    }
    const key = prompt ? `${prompt.key}|${prompt.label}|${prompt.enabled}` : '';
    if (key !== this.lastPrompt) {
      this.lastPrompt = key;
      this.ui.setPrompt(prompt);
    }
  }

  clearPrompt() {
    this.lastPrompt = '';
    this.ui.setPrompt(null);
  }

  drawMenu() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, W, H);
    drawMenuScene(ctx, W, H, this.menuTime, this.settings.quality);
    const g = ctx.createLinearGradient(0, H * 0.45, 0, H);
    g.addColorStop(0, 'rgba(4,8,20,0)');
    g.addColorStop(1, 'rgba(4,8,20,.55)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
    this.drawFade(ctx);
  }

  drawWorld() {
    const ctx = this.ctx;
    const cam = this.camera;
    ctx.clearRect(0, 0, W, H);
    const sx = this.shakeAmt > 0.2 ? (Math.random() - 0.5) * this.shakeAmt : 0;
    const sy = this.shakeAmt > 0.2 ? (Math.random() - 0.5) * this.shakeAmt : 0;

    ctx.save();
    ctx.translate(-cam.x + sx, -cam.y + sy);
    this.world.drawGround(ctx, cam);
    this.world.drawFlat(ctx, this.time);

    const drawables = [];
    for (const o of this.world.getDrawables()) {
      if (!this.world.isVisible(o, cam, 240)) continue;
      drawables.push({ y: o.sortY ?? o.y, draw: () => this.world.drawProp(ctx, o, this.time) });
    }
    for (const npc of this.world.npcs) {
      if (!this.world.isVisible(npc, cam, 160)) continue;
      drawables.push({
        y: npc.y,
        draw: () => {
          ctx.save();
          ctx.translate(npc.x, npc.y);
          drawNPC(ctx, { ...npc, t: this.time }, { t: this.time, facing: npc.facing, scale: 1.05 });
          ctx.restore();
          this.drawNpcMarker(ctx, npc);
        },
      });
    }
    if (this.companion) drawables.push({ y: this.companion.y, draw: () => this.companion.draw(ctx, this.time) });
    for (const w of this.wilds) if (this.world.isVisible(w, cam, 120)) drawables.push({ y: w.y, draw: () => w.draw(ctx, this.time) });
    for (const e of this.enemies) if (this.world.isVisible(e, cam, 180)) drawables.push({ y: e.y, draw: () => e.draw(ctx, this.time) });
    if (this.player) drawables.push({ y: this.player.y, draw: () => this.player.draw(ctx, this.time) });
    drawables.sort((a, b) => a.y - b.y);
    for (const d of drawables) d.draw();

    for (const p of this.projectiles) p.draw(ctx, this.time);
    this.drawZaps(ctx);
    this.particles.draw(ctx, this.time);
    this.world.drawAmbient(ctx, this.time, cam);
    ctx.restore();

    if (this.world.meta.ambient > 0.04) this.drawLighting(ctx, cam);
    this.world.drawWeather(ctx, this.time, cam);
    if (this.hitFlash > 0) {
      ctx.save();
      const g = ctx.createRadialGradient(W / 2, H / 2, H * 0.25, W / 2, H / 2, H * 0.72);
      g.addColorStop(0, 'rgba(255,60,80,0)');
      g.addColorStop(1, `rgba(200,20,45,${this.hitFlash * 0.3})`);
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
      ctx.restore();
    }
    this.drawFade(ctx);
  }

  drawNpcMarker(ctx, npc) {
    if (!this.state) return;
    const entries = Object.values(QUESTS).filter((def) => def.giver === npc.name);
    if (!entries.length) return;
    const active = entries.find((def) => this.state.quests[def.id]?.status === 'active');
    const complete = entries.find((def) => this.state.quests[def.id]?.status === 'complete');
    if (!active && !complete) return;
    const y = npc.y - 96 + Math.sin(this.time * 2.4) * 4;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = active ? '#ffe49b' : '#a8ffb5';
    ctx.shadowColor = active ? '#ffe49b' : '#a8ffb5';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    if (active) {
      ctx.moveTo(npc.x, y - 8); ctx.lineTo(npc.x + 6, y + 1); ctx.lineTo(npc.x, y + 1); ctx.lineTo(npc.x, y + 7);
      ctx.lineTo(npc.x - 6, y - 1); ctx.lineTo(npc.x, y - 1);
    } else {
      ctx.arc(npc.x, y, 5, 0, Math.PI * 2);
    }
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  drawZaps(ctx) {
    for (const z of this.zaps) {
      const a = clamp(z.life / z.max, 0, 1);
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = a;
      ctx.strokeStyle = z.color;
      ctx.shadowColor = z.color;
      ctx.shadowBlur = 14;
      ctx.lineWidth = 2 + a * 2;
      ctx.beginPath();
      const seg = 6;
      ctx.moveTo(z.from.x, z.from.y);
      for (let i = 1; i < seg; i++) {
        const t = i / seg;
        const jitter = (Math.random() - 0.5) * 16;
        ctx.lineTo(lerp(z.from.x, z.to.x, t) + jitter, lerp(z.from.y, z.to.y, t) + jitter);
      }
      ctx.lineTo(z.to.x, z.to.y);
      ctx.stroke();
      ctx.restore();
    }
  }

  drawLighting(ctx, cam) {
    if (this.settings.quality === 'baja') return;
    const lc = this.lightCtx;
    const world = this.world;
    lc.clearRect(0, 0, W, H);
    const ambient = Math.min(0.86, world.meta.ambient || 0.2);
    lc.globalCompositeOperation = 'source-over';
    lc.fillStyle = `rgba(3,6,17,${ambient})`;
    lc.fillRect(0, 0, W, H);

    const lights = world.getLights(this.time).map((l) => ({ ...l, x: l.x - cam.x, y: l.y - cam.y }));
    if (this.player) {
      const c = this.player.activeCreature;
      const sp = c ? CREATURES[c.species] : null;
      const isLight = sp?.affinity === 'luz' || sp?.explore?.type === 'light';
      lights.push({
        x: this.player.x - cam.x, y: this.player.y - cam.y - 24,
        r: isLight ? 240 : 138, color: isLight ? AFFINITIES.luz.color : '#ffe8b8',
        intensity: isLight ? 0.85 : 0.45, source: 'player',
      });
    }
    lc.globalCompositeOperation = 'destination-out';
    for (const l of lights) {
      if (l.x < -260 || l.x > W + 260 || l.y < -260 || l.y > H + 260) continue;
      const rad = l.r * (0.85 + (l.intensity || 0.5) * 0.35);
      const g = lc.createRadialGradient(l.x, l.y, 0, l.x, l.y, rad);
      const a = clamp((l.intensity || 0.5) * 0.75, 0, 0.9);
      g.addColorStop(0, `rgba(0,0,0,${a})`);
      g.addColorStop(0.55, `rgba(0,0,0,${a * 0.55})`);
      g.addColorStop(1, 'rgba(0,0,0,0)');
      lc.fillStyle = g;
      lc.beginPath(); lc.arc(l.x, l.y, rad, 0, Math.PI * 2); lc.fill();
    }
    lc.globalCompositeOperation = 'source-over';
    ctx.save();
    ctx.drawImage(this.lightCanvas, 0, 0);
    ctx.globalCompositeOperation = 'lighter';
    for (const l of lights) {
      if (l.source === 'player') continue;
      const g = ctx.createRadialGradient(l.x, l.y, 0, l.x, l.y, l.r * 0.8);
      g.addColorStop(0, hexA(l.color || '#ffd36e', 0.06 * (l.intensity || 0.5)));
      g.addColorStop(1, hexA(l.color || '#ffd36e', 0));
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(l.x, l.y, l.r * 0.8, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  }

  drawFade(ctx) {
    if (this.fade.a <= 0.001) return;
    ctx.save();
    ctx.fillStyle = `rgba(3,6,14,${this.fade.a})`;
    ctx.fillRect(0, 0, W, H);
    ctx.restore();
  }

  drawMenuMap(canvas) {
    if (!canvas || !this.world || !this.player) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const rect = canvas.getBoundingClientRect();
    const w = Math.max(240, rect.width || 640);
    const h = Math.max(200, rect.height || 360);
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.world.drawMap(ctx, 0, 0, w, h, this.player, this.state);
  }
}

export { W as VIEW_W, H as VIEW_H, HAIR_STYLES };
