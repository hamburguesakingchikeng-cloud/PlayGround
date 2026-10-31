/* ==========================================================================
   GAME — core state, loop, rendering, combat and every connected system.
   ========================================================================== */

import {
  ITEMS, SKILLS, CREATURES, ELEMENTS, QUESTS, RECIPES, ZONES, ZONE_ORDER,
  STARTERS, SHOP_MIRA, SHOP_TORIN,
  item, creature, xpForLevel, creatureXpForLevel, newPlayerStats, newCreature,
} from './data.js';
import { World, T } from './world.js';
import {
  Player, Enemy, WildCreature, Projectile, Hazard, Particle, DamageNumber, dirVec,
} from './entities.js';
import { input } from './input.js';
import { audio } from './audio.js';
import { UI } from './ui.js';
import {
  drawHumanoid, drawCreature, drawEnemy, drawSlash, resolveAppearance,
  drawPortrait, hexA,
} from './render.js';

const SAVE_KEY = 'la_espada_celestial_saves_v1';
const AUTO_KEY = 'la_espada_celestial_autosave_v1';
const SET_KEY = 'la_espada_celestial_settings_v1';

const DEFAULT_SETTINGS = {
  master: .75, music: .5, sfx: .8,
  touch: 'auto', touchScale: 'normal', touchHand: 'right', tilt: false,
  shake: true, damage: true, hints: true,
};

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const clone = v => JSON.parse(JSON.stringify(v));

function hash2(x, y) {
  let h = x * 374761393 + y * 668265263;
  h = (h ^ (h >>> 13)) * 1274126177;
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

const ZONE_DEFAULT_SPAWN = {
  aldea: [19, 16], bosque: [3, 27], ruinas: [2, 26], canon: [2, 14], templo: [18, 24],
};

export class Game {
  constructor() {
    this.canvas = document.getElementById('game');
    this.ctx = this.canvas.getContext('2d');
    this.input = input;
    this.audio = audio;
    this.settings = this.loadSettings();
    this.ui = new UI(this);
    this.world = new World(this);

    this.mode = 'boot';
    this.time = 0;
    this.lastTs = 0;
    this.viewW = window.innerWidth;
    this.viewH = window.innerHeight;
    this.dpr = Math.min(2, window.devicePixelRatio || 1);

    this.state = null;
    this.player = null;
    this.derived = null;

    this.enemies = [];
    this.wilds = [];
    this.projectiles = [];
    this.hazards = [];
    this.particles = [];
    this.damageNumbers = [];
    this.slashes = [];
    this.boss = null;

    this.camera = { x: 0, y: 0, w: this.viewW, h: this.viewH };
    this.shakeMag = 0;
    this.shakeTime = 0;
    this.hitstopTimer = 0;
    this.quickOpen = false;
    this.inputGuardUntil = 0;
    this.shopMira = SHOP_MIRA;
    this.shopTorin = SHOP_TORIN;
    this.renderRef = { drawHumanoid, drawEnemy, resolveAppearance, drawCreature };

    this.musicBattle = false;
    this.musicZone = null;
    this.hudTimer = 0;
    this.autoTimer = 0;
    this.tiltAxis = { x: 0, y: 0 };
    this.tiltEnabled = false;
    this.mapZone = null;
    this.titleStars = [];
    for (let i = 0; i < 140; i++) {
      this.titleStars.push({
        x: hash2(i, 3), y: hash2(i, 7) * .62,
        s: .5 + hash2(i, 11) * 1.7, a: .2 + hash2(i, 13) * .8,
        p: hash2(i, 17) * 6.28,
      });
    }

    this.resize();
    window.addEventListener('resize', () => this.resize());
    window.addEventListener('orientationchange', () => setTimeout(() => this.resize(), 120));
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && this.state && this.mode === 'playing') this.saveAuto();
    });

    this.input.onFirstGesture = () => {
      this.audio.init();
      this.audio.setVolumes(this.settings);
      if (this.mode === 'title') this.audio.playMusic('title');
      else if (this.state) this.playZoneMusic(true);
    };
    this.input.onGamepadChange = (connected, name) => {
      if (connected) this.toast(`Mando conectado: ${String(name).slice(0, 28)}`, 'good');
    };

    this.applyTouchPrefs();
    this.loop = this.loop.bind(this);
  }

  /* ---------------------------------------------------------------------- */
  /* Boot & loop                                                            */
  /* ---------------------------------------------------------------------- */
  boot() {
    this.audio.setVolumes(this.settings);
    const steps = [
      [12, 'Tejiendo el cielo de Lumen…'],
      [30, 'Plantando el Bosque de los Susurros…'],
      [50, 'Despertando las runas de Aethel…'],
      [68, 'Encendiendo el Cañón de Ceniza…'],
      [84, 'Invocando diez criaturas…'],
      [96, 'Afilando la Espada Celestial…'],
      [100, 'El reino te espera.'],
    ];
    let i = 0;
    const step = () => {
      const [p, text] = steps[i];
      this.ui.showBoot(p, text);
      i++;
      if (i < steps.length) setTimeout(step, 150);
      else setTimeout(() => {
        this.ui.hideBoot();
        this.ui.showTitle();
        this.resize();
        requestAnimationFrame(this.loop);
      }, 420);
    };
    step();
  }

  loop(ts) {
    requestAnimationFrame(this.loop);
    if (!this.lastTs) this.lastTs = ts;
    let dt = (ts - this.lastTs) / 1000;
    this.lastTs = ts;
    dt = clamp(dt, 0, .05);
    this.time += dt;

    this.input.update();
    this.applyTilt();
    if (this.hitstopTimer > 0) {
      this.hitstopTimer -= dt;
    } else {
      this.update(dt);
    }
    this.render(dt);
    this.input.postUpdate();
  }

  update(dt) {
    if (this.mode === 'playing' && this.state) {
      this.state.playtime += dt;
      this.player.update(dt);
      if (this.mode !== 'playing') { this.updateHUD(dt, true); return; }

      for (const e of this.enemies) e.update(dt, this.player);
      for (const w of this.wilds) w.update(dt, this.player);
      for (const p of this.projectiles) p.update(dt);
      for (const h of this.hazards) h.update(dt);
      for (const p of this.particles) p.update(dt);
      for (const d of this.damageNumbers) d.update(dt);
      for (const s of this.slashes) s.life -= dt;

      this.enemies = this.enemies.filter(e => !e.dead || e.deathTimer > 0);
      this.wilds = this.wilds.filter(w => !w.dead || w.deathTimer > 0);
      this.projectiles = this.projectiles.filter(p => p.life > 0);
      this.hazards = this.hazards.filter(h => !h.done);
      this.particles = this.particles.filter(p => p.life > 0);
      this.damageNumbers = this.damageNumbers.filter(d => d.life > 0);
      this.slashes = this.slashes.filter(s => s.life > 0);

      this.world.update(dt, this.player, this.camera);
      this.updateCamera();
      this.updatePrompt();
      this.checkExits();
      this.updateMusic();

      this.autoTimer += dt;
      if (this.autoTimer > 75) { this.autoTimer = 0; this.saveAuto(true); }
    } else {
      this.updateCamera();
    }

    if (this.shakeTime > 0) {
      this.shakeTime -= dt;
      if (this.shakeTime <= 0) this.shakeMag = 0;
    }
    this.updateHUD(dt);
  }

  updateHUD(dt, force = false) {
    this.hudTimer -= dt;
    if (!force && this.hudTimer > 0) return;
    this.hudTimer = .08;
    if (this.mode === 'playing' && this.state) this.ui.updateHUD();
  }

  resize() {
    this.viewW = window.innerWidth;
    this.viewH = window.innerHeight;
    this.dpr = Math.min(2, window.devicePixelRatio || 1);
    this.canvas.width = Math.round(this.viewW * this.dpr);
    this.canvas.height = Math.round(this.viewH * this.dpr);
    this.canvas.style.width = `${this.viewW}px`;
    this.canvas.style.height = `${this.viewH}px`;
    this.camera.w = this.viewW;
    this.camera.h = this.viewH;
    this.updateCamera();
  }

  /* ---------------------------------------------------------------------- */
  /* Mode & chrome                                                          */
  /* ---------------------------------------------------------------------- */
  setMode(mode) {
    this.mode = mode;
    if (mode !== 'playing') this.quickOpen = false;
    this.ui.syncChrome();
  }

  uiBlocking() {
    return this.mode !== 'playing' || this.quickOpen || performance.now() < this.inputGuardUntil;
  }

  togglePause() {
    if (this.mode === 'playing') this.openPause(this.ui.currentTab || 'inventory');
    else if (this.mode === 'paused') this.closePause();
  }

  openPause(tab = 'inventory') {
    if (!this.state) return;
    this.closeQuick();
    this.mode = 'paused';
    this.audio.sfx('menu');
    this.ui.showPause(tab);
  }

  closePause() {
    if (!this.state) return;
    this.mode = 'playing';
    this.ui.hideScreen();
    this.ui.syncChrome();
    this.inputGuardUntil = performance.now() + 120;
  }

  toggleQuick() {
    if (this.mode !== 'playing') return;
    if (this.quickOpen) this.closeQuick();
    else {
      this.quickOpen = true;
      this.audio.sfx('menu');
      this.ui.showQuick();
      this.ui.syncChrome();
    }
  }

  closeQuick() {
    this.quickOpen = false;
    this.ui.closeQuick();
    this.ui.syncChrome();
  }

  openShop(kind = 'mira') {
    this.mode = 'shop';
    this.audio.sfx('menu');
    this.ui.showShop(kind);
  }

  closeShop() {
    this.mode = 'playing';
    this.ui.hideScreen();
    this.ui.syncChrome();
    this.inputGuardUntil = performance.now() + 120;
  }

  toast(text, kind = '') { this.ui.toast(text, kind); }

  /* ---------------------------------------------------------------------- */
  /* Settings                                                               */
  /* ---------------------------------------------------------------------- */
  loadSettings() {
    try {
      const raw = JSON.parse(localStorage.getItem(SET_KEY) || '{}');
      return { ...DEFAULT_SETTINGS, ...raw };
    } catch { return { ...DEFAULT_SETTINGS }; }
  }

  saveSettings() {
    try { localStorage.setItem(SET_KEY, JSON.stringify(this.settings)); } catch { /* ignore */ }
  }

  setSetting(key, value) {
    this.settings[key] = value;
    this.saveSettings();
    this.audio.setVolumes(this.settings);
    if (key === 'touchHand' || key === 'touch' || key === 'touchScale') this.applyTouchPrefs();
    if (key === 'tilt') {
      if (value) this.enableTilt();
      else { this.tiltEnabled = false; this.tiltAxis.x = 0; this.tiltAxis.y = 0; }
    }
    this.ui.syncChrome();
  }

  isCoarse() {
    return matchMedia('(pointer: coarse)').matches || navigator.maxTouchPoints > 0;
  }

  syncTouch() {
    const touch = document.getElementById('touchControls');
    if (!touch) return;
    touch.classList.toggle('lefty', this.settings.touchHand === 'left');
    this.ui.syncChrome();
  }

  applyTouchPrefs() {
    const touch = document.getElementById('touchControls');
    if (touch) touch.classList.toggle('lefty', this.settings.touchHand === 'left');
  }

  enableTilt() {
    if (this.tiltEnabled) return;
    const attach = () => {
      window.addEventListener('deviceorientation', e => {
        if (e.gamma == null && e.beta == null) return;
        this.tiltAxis.x = clamp((e.gamma || 0) / 32, -1, 1);
        this.tiltAxis.y = clamp(((e.beta || 0) - 42) / 32, -1, 1);
      });
      this.tiltEnabled = true;
    };
    const DOE = window.DeviceOrientationEvent;
    if (DOE && typeof DOE.requestPermission === 'function') {
      DOE.requestPermission().then(res => {
        if (res === 'granted') attach();
        else { this.settings.tilt = false; this.saveSettings(); this.toast('Permiso de movimiento denegado', 'bad'); }
      }).catch(() => { this.settings.tilt = false; this.saveSettings(); });
    } else if (DOE) attach();
  }

  applyTilt() {
    if (!this.settings.tilt || !this.tiltEnabled || this.mode !== 'playing') return;
    if (this.input.touchActive) return;
    const tx = this.tiltAxis.x, ty = this.tiltAxis.y;
    if (Math.hypot(tx, ty) > .16 && !this.input.keyAxis.x && !this.input.keyAxis.y &&
      !this.input.padAxis.x && !this.input.padAxis.y) {
      this.input.axis.x = tx;
      this.input.axis.y = ty;
    }
  }

  toggleFullscreen() {
    const el = document.documentElement;
    if (!document.fullscreenElement) {
      el.requestFullscreen?.().catch(() => this.toast('Pantalla completa no disponible', 'bad'));
    } else document.exitFullscreen?.().catch(() => {});
  }

  /* ---------------------------------------------------------------------- */
  /* Save / load                                                            */
  /* ---------------------------------------------------------------------- */
  serializeState() {
    if (!this.state) return null;
    if (this.player) { this.state.x = this.player.x; this.state.y = this.player.y; }
    return clone(this.state);
  }

  slotData() {
    const st = this.serializeState();
    if (!st) return null;
    return {
      name: st.name, level: st.level, zone: st.zone, playtime: st.playtime,
      date: Date.now(), state: st,
    };
  }

  getSlots() {
    try {
      const arr = JSON.parse(localStorage.getItem(SAVE_KEY) || '[]');
      if (!Array.isArray(arr)) return [null, null, null];
      return [arr[0] || null, arr[1] || null, arr[2] || null];
    } catch { return [null, null, null]; }
  }

  getAutosave() {
    try { return JSON.parse(localStorage.getItem(AUTO_KEY) || 'null'); } catch { return null; }
  }

  hasAnySave() {
    return !!this.getAutosave() || this.getSlots().some(Boolean);
  }

  latestSaveKey() {
    const all = [];
    const auto = this.getAutosave();
    if (auto) all.push({ key: 'auto', date: auto.date || 0 });
    this.getSlots().forEach((s, i) => { if (s) all.push({ key: i + 1, date: s.date || 0 }); });
    if (!all.length) return null;
    all.sort((a, b) => b.date - a.date);
    return all[0].key;
  }

  saveGame(slot) {
    if (!this.state) return;
    const n = clamp(Number(slot) || 1, 1, 3);
    const slots = this.getSlots();
    slots[n - 1] = this.slotData();
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(slots));
      this.audio.sfx('confirm');
      this.toast(`Partida guardada en la ranura ${n}`, 'good');
    } catch { this.toast('No se pudo guardar la partida', 'bad'); }
  }

  saveAuto(silent = false) {
    if (!this.state) return;
    try {
      localStorage.setItem(AUTO_KEY, JSON.stringify(this.slotData()));
      if (!silent) this.toast('Autoguardado', 'good');
    } catch { /* ignore */ }
  }

  loadGame(slot) {
    let data = null;
    if (slot === 'auto') data = this.getAutosave();
    else data = this.getSlots()[(Number(slot) || 1) - 1];
    if (!data || !data.state) { this.toast('Esa ranura está vacía', 'bad'); return; }
    this.audio.sfx('confirm');
    this.restoreState(data.state);
    this.mode = 'playing';
    this.ui.hideScreen();
    this.ui.syncChrome();
    this.toast(`Bienvenido de nuevo, ${this.state.name}`, 'good');
    this.saveAuto(true);
  }

  continueGame() {
    const key = this.latestSaveKey();
    if (key == null) { this.toast('No hay partidas guardadas', 'bad'); return; }
    this.loadGame(key);
  }

  restoreState(raw) {
    const s = clone(raw);
    s.stats = Object.assign(newPlayerStats(), s.stats || {});
    s.appearance = s.appearance || { hair: 'corto', hairColor: 'nieve', skin: 'clara', outfit: 'azul', eyes: 'ambar' };
    s.equipment = Object.assign({ weapon: 'espada_aprendiz', shield: null, armor: 'tunica_viajero', accessory: null }, s.equipment || {});
    s.inventory = s.inventory || {};
    s.flags = s.flags || {};
    s.quests = s.quests || {};
    s.skills = Object.assign({ unlocked: ['corte'], active: 'corte' }, s.skills || {});
    if (!Array.isArray(s.skills.unlocked) || !s.skills.unlocked.length) s.skills.unlocked = ['corte'];
    if (!s.skills.unlocked.includes(s.skills.active)) s.skills.active = s.skills.unlocked[0];
    s.creatures = Array.isArray(s.creatures) ? s.creatures : [];
    s.collection = Array.isArray(s.collection) ? s.collection : [];
    s.discovered = Array.isArray(s.discovered) && s.discovered.length ? s.discovered : ['aldea'];
    s.zone = ZONES[s.zone] ? s.zone : 'aldea';
    s.xpNext = s.xpNext || xpForLevel(s.level || 1);
    s.level = s.level || 1;
    s.gold = s.gold || 0;
    s.kills = s.kills || 0; s.captures = s.captures || 0; s.bossKills = s.bossKills || 0; s.deaths = s.deaths || 0;
    s.playtime = s.playtime || 0;
    s.skillPoints = s.skillPoints || 0; s.statPoints = s.statPoints || 0;
    s.hp = Math.max(1, s.hp || s.stats.hp);
    s.mp = s.mp == null ? s.stats.mp : s.mp;
    s.stamina = s.stamina == null ? s.stats.stamina : s.stamina;
    this.state = s;
    this.recalcDerived();
    this.player = new Player(this, this.state);
    const spawn = s.checkpoint || { zone: s.zone, x: s.x, y: s.y };
    this.loadZone(s.zone, null, { at: { x: s.x || spawn.x, y: s.y || spawn.y } });
    this.state.hp = clamp(this.state.hp, 1, this.derived.maxHp);
    this.state.mp = clamp(this.state.mp, 0, this.derived.maxMp);
    this.state.stamina = clamp(this.state.stamina, 0, this.derived.maxStamina);
    this.ui.currentTab = 'inventory';
  }

  openLoadScreen() {
    this.mode = 'title';
    this.ui.screen(this.ui.renderSaveSlots('title'));
    this.ui.syncChrome();
  }

  resetAll() {
    try {
      localStorage.removeItem(SAVE_KEY);
      localStorage.removeItem(AUTO_KEY);
      localStorage.removeItem(SET_KEY);
    } catch { /* ignore */ }
    this.settings = { ...DEFAULT_SETTINGS };
    this.audio.setVolumes(this.settings);
    this.state = null;
    this.player = null;
    this.derived = null;
    this.enemies = [];
    this.wilds = [];
    this.boss = null;
    this.toast('Progreso borrado', 'good');
    this.ui.showTitle();
  }

  toTitle() {
    this.mode = 'title';
    this.quickOpen = false;
    this.ui.hideScreen();
    this.ui.closeQuick();
    this.ui.showTitle();
    this.audio.playMusic('title');
  }

  confirmTitle() {
    this.ui.showModal({
      title: '¿Volver al título?',
      text: 'Puedes guardar tu aventura antes de salir. El autoguardado también conserva tu progreso más reciente.',
      actions: [
        { label: 'Cancelar', style: 'ghost' },
        { label: 'Guardar y salir', style: 'primary', action: () => { this.saveAuto(true); this.toTitle(); } },
        { label: 'Salir sin guardar', style: 'danger', action: () => this.toTitle() },
      ],
    });
  }

  /* ---------------------------------------------------------------------- */
  /* Title scene & previews                                                 */
  /* ---------------------------------------------------------------------- */
  renderTitleScene(dt) {
    const ctx = this.ctx, w = this.viewW, h = this.viewH, t = this.time;
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    const sky = ctx.createLinearGradient(0, 0, 0, h);
    sky.addColorStop(0, '#050912');
    sky.addColorStop(.42, '#0d1730');
    sky.addColorStop(.72, '#1b2b4d');
    sky.addColorStop(1, '#070c18');
    ctx.fillStyle = sky; ctx.fillRect(0, 0, w, h);

    // aurora ribbons
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 3; i++) {
      const g = ctx.createLinearGradient(0, h * .1, w, h * .5);
      g.addColorStop(0, 'rgba(111,232,212,0)');
      g.addColorStop(.45, i === 1 ? 'rgba(166,139,255,.10)' : 'rgba(111,232,212,.09)');
      g.addColorStop(1, 'rgba(242,209,136,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.moveTo(-40, h * (.22 + i * .07));
      ctx.quadraticCurveTo(w * .4, h * (.05 + i * .05 + Math.sin(t * .3 + i) * .03), w + 40, h * (.3 + i * .06));
      ctx.lineTo(w + 40, h * (.4 + i * .06));
      ctx.quadraticCurveTo(w * .45, h * (.16 + i * .05 + Math.cos(t * .26 + i) * .03), -40, h * (.34 + i * .07));
      ctx.closePath(); ctx.fill();
    }
    ctx.restore();

    // stars
    ctx.save();
    for (const s of this.titleStars) {
      const a = s.a * (.55 + Math.sin(t * 1.4 + s.p) * .45);
      ctx.globalAlpha = a;
      ctx.fillStyle = s.s > 1.4 ? '#ffe9b0' : '#dbe8ff';
      ctx.beginPath(); ctx.arc(s.x * w, s.y * h, s.s, 0, 6.28); ctx.fill();
    }
    ctx.restore();

    // moon
    const mx = w * .74, my = h * .2, mr = Math.min(w, h) * .07;
    const mg = ctx.createRadialGradient(mx, my, mr * .2, mx, my, mr * 3.4);
    mg.addColorStop(0, 'rgba(255,240,190,.55)');
    mg.addColorStop(.25, 'rgba(255,225,150,.16)');
    mg.addColorStop(1, 'transparent');
    ctx.fillStyle = mg; ctx.beginPath(); ctx.arc(mx, my, mr * 3.4, 0, 6.28); ctx.fill();
    ctx.fillStyle = '#fff0c2'; ctx.beginPath(); ctx.arc(mx, my, mr, 0, 6.28); ctx.fill();
    ctx.fillStyle = 'rgba(210,180,120,.18)';
    ctx.beginPath(); ctx.arc(mx - mr * .25, my - mr * .2, mr * .22, 0, 6.28); ctx.fill();
    ctx.beginPath(); ctx.arc(mx + mr * .3, my + mr * .18, mr * .15, 0, 6.28); ctx.fill();

    // mountains
    const layers = [
      { y: .68, c: '#0c1527', amp: .1, speed: .1, n: 7 },
      { y: .78, c: '#091020', amp: .08, speed: .18, n: 9 },
      { y: .9, c: '#050a14', amp: .05, speed: .3, n: 12 },
    ];
    for (const L of layers) {
      ctx.fillStyle = L.c;
      ctx.beginPath();
      ctx.moveTo(-20, h);
      for (let i = 0; i <= L.n; i++) {
        const px = (i / L.n) * (w + 40) - 20;
        const ph = Math.sin(i * 2.7 + L.y * 20) * .5 + .5;
        ctx.lineTo(px, h * L.y - ph * h * L.amp);
      }
      ctx.lineTo(w + 20, h); ctx.closePath(); ctx.fill();
    }

    // floating sword
    const sx = w * .5, sy = h * .47 + Math.sin(t * .8) * 7;
    const sc = Math.min(w, h) / 720;
    ctx.save();
    ctx.translate(sx, sy); ctx.scale(sc, sc); ctx.rotate(-.18);
    ctx.globalCompositeOperation = 'lighter';
    const glow = ctx.createRadialGradient(0, -40, 4, 0, -40, 190);
    glow.addColorStop(0, 'rgba(255,236,170,.45)');
    glow.addColorStop(.4, 'rgba(242,209,136,.12)');
    glow.addColorStop(1, 'transparent');
    ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(0, -40, 190, 0, 6.28); ctx.fill();
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = '#2a2130'; ctx.fillRect(-7, 58, 14, 62);
    ctx.fillStyle = '#c9a14a'; ctx.fillRect(-34, 46, 68, 12);
    ctx.fillStyle = '#f2d188'; ctx.beginPath(); ctx.arc(0, 52, 9, 0, 6.28); ctx.fill();
    const blade = ctx.createLinearGradient(-14, 40, 14, -160);
    blade.addColorStop(0, '#a88a45'); blade.addColorStop(.25, '#fff6cf');
    blade.addColorStop(.6, '#f2d188'); blade.addColorStop(1, '#fffbe8');
    ctx.fillStyle = blade;
    ctx.beginPath(); ctx.moveTo(-13, 42); ctx.lineTo(-4, -150); ctx.lineTo(0, -172); ctx.lineTo(5, -150); ctx.lineTo(13, 42); ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.55)';
    ctx.beginPath(); ctx.moveTo(-3, 38); ctx.lineTo(-1, -150); ctx.lineTo(2, -150); ctx.lineTo(4, 38); ctx.closePath(); ctx.fill();
    ctx.restore();

    // drifting embers
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 34; i++) {
      const p = (t * (.06 + hash2(i, 21) * .1) + hash2(i, 23)) % 1;
      const px = hash2(i, 29) * w + Math.sin(t * .7 + i) * 22;
      const py = h * (1 - p);
      ctx.globalAlpha = Math.sin(p * Math.PI) * .6;
      ctx.fillStyle = i % 4 === 0 ? '#ffd98a' : '#8fe8c9';
      ctx.beginPath(); ctx.arc(px, py, 1 + hash2(i, 31) * 1.8, 0, 6.28); ctx.fill();
    }
    ctx.restore();

    // bottom vignette
    const vg = ctx.createLinearGradient(0, h * .55, 0, h);
    vg.addColorStop(0, 'transparent'); vg.addColorStop(1, 'rgba(3,5,10,.82)');
    ctx.fillStyle = vg; ctx.fillRect(0, h * .55, w, h * .45);
  }

  drawCreationPreview(canvas, creation) {
    if (!canvas) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const w = canvas.clientWidth || 280, h = canvas.clientHeight || 340;
    canvas.width = w * dpr; canvas.height = h * dpr;
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    const bg = ctx.createRadialGradient(w / 2, h * .38, 4, w / 2, h * .5, w * .8);
    bg.addColorStop(0, 'rgba(64,108,171,.35)');
    bg.addColorStop(.55, 'rgba(20,34,58,.12)');
    bg.addColorStop(1, 'transparent');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h);

    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.strokeStyle = 'rgba(242,209,136,.25)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(w / 2, h * .52, Math.min(w, h) * .34, 0, 6.28); ctx.stroke();
    ctx.strokeStyle = 'rgba(111,232,212,.16)';
    ctx.setLineDash([3, 7]);
    ctx.beginPath(); ctx.arc(w / 2, h * .52, Math.min(w, h) * .26, 0, 6.28); ctx.stroke();
    ctx.restore();

    const starter = STARTERS[creation.starter || 0] || STARTERS[0];
    const weapon = ITEMS[starter.weapon]?.weapon;
    const t = this.time;
    const scale = Math.min(w, h) / 145;
    drawHumanoid(ctx, {
      x: w / 2, y: h * .8, scale, time: t, facing: 'down',
      walk: Math.sin(t * 1.4) * .12, appearance: resolveAppearance(creation.appearance),
      weapon: weapon ? { ...weapon } : null, shield: false, cape: true,
      aura: 'rgba(111,232,212,.22)',
    });
    drawCreature(ctx, starter.creature, w * .74, h * .74, t, scale * .72, {});
    ctx.save();
    ctx.globalAlpha = .5;
    ctx.fillStyle = '#02050b';
    ctx.beginPath(); ctx.ellipse(w / 2, h * .8 + 3, 22 * scale, 6 * scale, 0, 0, 6.28); ctx.fill();
    ctx.restore();
  }

  drawEquipmentPreview(canvas) {
    if (!canvas || !this.state) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const w = canvas.clientWidth || 320, h = canvas.clientHeight || 210;
    canvas.width = w * dpr; canvas.height = h * dpr;
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    const bg = ctx.createRadialGradient(w / 2, h * .44, 4, w / 2, h * .5, w * .6);
    bg.addColorStop(0, 'rgba(64,108,171,.3)'); bg.addColorStop(1, 'transparent');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h);
    const eq = this.state.equipment;
    const weapon = ITEMS[eq.weapon]?.weapon;
    const scale = Math.min(w, h) / 125;
    drawHumanoid(ctx, {
      x: w / 2, y: h * .88, scale, time: this.time, facing: 'down', walk: 0,
      appearance: resolveAppearance(this.state.appearance),
      weapon: weapon ? { ...weapon } : null,
      shield: !!eq.shield,
      shieldColor: eq.shield === 'escudo_celestial' ? '#7e7ab8' : '#6b4a2c',
      shieldTrim: eq.shield === 'escudo_celestial' ? '#fff0a8' : '#e2c47a',
      armor: !!eq.armor,
      armorColor: eq.armor === 'armadura_celestial' ? '#f2d188' : '#9aa6ba',
      accessory: !!eq.accessory,
      accessoryColor: eq.accessory === 'talisman_suerte' ? '#ffd27a' : '#6fe8d4',
      cape: true,
    });
  }

  drawMiniMap(canvas, zoneKey) {
    if (!canvas) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const w = canvas.clientWidth || 620, h = canvas.clientHeight || 420;
    canvas.width = w * dpr; canvas.height = h * dpr;
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    const base = this.world.maps[zoneKey] || this.world.maps.aldea;
    const scale = Math.min(w / base.w, h / base.h);
    const ox = (w - base.w * scale) / 2, oy = (h - base.h * scale) / 2;
    ctx.fillStyle = 'rgba(5,10,20,.9)'; ctx.fillRect(0, 0, w, h);
    const colors = {
      g: '#2f5540', ',': '#274836', p: '#8a6b45', P: '#6d6a70', s: '#5c6074', d: '#4b3a31',
      w: '#2f5f78', W: '#2f5f78', S: '#3d3f52', t: '#1c3a2a', r: '#4a4652', l: '#a14d2e',
      v: '#171225', b: '#6b4a2c', e: '#6b3d2c', i: '#7fc4dc', u: '#555868', h: '#2d4c33',
      B: '#315c33', M: '#7fc8e8', H: '#6b6577', R: '#8a7438', A: '#7a6a9a', c: '#4e8c98',
    };
    for (let y = 0; y < base.h; y++) for (let x = 0; x < base.w; x++) {
      const ch = base.tiles[y][x];
      ctx.fillStyle = colors[ch] || '#2f5540';
      ctx.fillRect(ox + x * scale, oy + y * scale, Math.ceil(scale), Math.ceil(scale));
    }
    // water shimmer
    ctx.save();
    ctx.globalAlpha = .18;
    ctx.fillStyle = '#9fdcff';
    for (let y = 0; y < base.h; y++) for (let x = 0; x < base.w; x++) {
      if (base.tiles[y][x] === 'w') ctx.fillRect(ox + x * scale, oy + y * scale + scale * .4, Math.ceil(scale), 1);
    }
    ctx.restore();

    const dot = (x, y, color, r = 2.6) => {
      ctx.fillStyle = color;
      ctx.beginPath(); ctx.arc(ox + x * scale, oy + y * scale, r, 0, 6.28); ctx.fill();
    };
    for (const o of base.objects) {
      if (o.type === 'shrine') dot(o.x, o.y, '#ffd98a', 3.4);
      else if (o.type === 'npc') dot(o.x, o.y, '#9fdcff', 2.4);
      else if (o.type === 'chest') dot(o.x, o.y, '#e0b060', 2);
      else if (o.type === 'relic') dot(o.x, o.y, '#fff0a8', 3);
      else if (o.type === 'rune') dot(o.x, o.y, '#a68bff', 2.6);
      else if (o.type === 'altar') dot(o.x, o.y, '#ffd27a', 3.4);
    }
    for (const e of base.exits) {
      const [ex, ey, ew, eh] = e.rect;
      ctx.strokeStyle = 'rgba(242,209,136,.55)'; ctx.lineWidth = 1.4;
      ctx.strokeRect(ox + ex * scale, oy + ey * scale, ew * scale, eh * scale);
    }
    if (zoneKey === this.state?.zone && this.player) {
      const px = ox + (this.player.x / T) * scale, py = oy + (this.player.y / T) * scale;
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      const g = ctx.createRadialGradient(px, py, 1, px, py, 16);
      g.addColorStop(0, 'rgba(255,125,157,.7)'); g.addColorStop(1, 'transparent');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(px, py, 16, 0, 6.28); ctx.fill();
      ctx.restore();
      dot(this.player.x / T, this.player.y / T, '#ff7d9d', 3.6);
      dot(this.player.x / T, this.player.y / T, '#fff', 1.4);
    }
    // frame
    ctx.strokeStyle = 'rgba(190,214,255,.14)'; ctx.lineWidth = 1;
    ctx.strokeRect(ox - .5, oy - .5, base.w * scale + 1, base.h * scale + 1);
  }

  /* ---------------------------------------------------------------------- */
  /* Derived stats & helpers                                                */
  /* ---------------------------------------------------------------------- */
  recalcDerived() {
    const st = this.state;
    if (!st) { this.derived = null; return; }
    const eq = st.equipment || {};
    const add = { hp: 0, mp: 0, def: 0, spd: 0, int: 0, luck: 0, str: 0 };
    for (const slot of ['weapon', 'shield', 'armor', 'accessory']) {
      const def = ITEMS[eq[slot]];
      if (def?.stats) for (const [k, v] of Object.entries(def.stats)) {
        if (add[k] != null) add[k] += v;
      }
    }
    const weapon = ITEMS[eq.weapon]?.weapon || null;
    const level = st.level || 1;
    const s = st.stats;
    this.derived = {
      maxHp: Math.round(s.hp + (level - 1) * 9 + add.hp),
      maxMp: Math.round(s.mp + (level - 1) * 4 + add.mp),
      maxStamina: Math.round(s.stamina + (level - 1) * 3),
      atk: Math.round(s.str * 1.7 + level * 1.1 + (weapon?.dmg || 0) * .55 + add.str * 1.4),
      def: Math.round(s.def + add.def),
      spd: s.spd + add.spd,
      int: s.int + add.int,
      luck: s.luck + add.luck,
      crit: clamp(.05 + (weapon?.crit || 0) + (s.luck + add.luck) * .008, .03, .7),
      weapon,
    };
  }

  getWeapon() { return item(this.state?.equipment?.weapon); }
  getShield() { return item(this.state?.equipment?.shield); }
  getActiveCreature() {
    const st = this.state;
    if (!st || !st.creatures?.length) return null;
    return st.creatures[clamp(st.activeCreature || 0, 0, st.creatures.length - 1)] || null;
  }

  getAbilities() {
    const c = this.getActiveCreature();
    if (!c) return [];
    const def = CREATURES[c.id];
    return def?.ability ? [def.ability] : [];
  }

  skillDef(id) { return SKILLS[id] || null; }

  creatureDisplayName(c) {
    if (!c) return '';
    if (c.nickname) return c.nickname;
    const def = CREATURES[c.id];
    if (!def) return '???';
    return c.evolved ? def.evolve : def.name;
  }

  abilityName(ability) {
    for (const def of Object.values(CREATURES)) if (def.ability === ability) return def.abilityName;
    return ability;
  }

  runeCount() {
    if (!this.state) return 0;
    return ['runa_bosque', 'runa_aethel', 'runa_ceniza']
      .filter(id => (this.state.inventory[id] || 0) > 0).length;
  }

  grantItem(id, qty = 1) {
    if (!ITEMS[id] || qty <= 0) return;
    this.state.inventory[id] = (this.state.inventory[id] || 0) + qty;
  }

  removeItem(id, qty = 1) {
    if (!this.state.inventory[id]) return false;
    this.state.inventory[id] -= qty;
    if (this.state.inventory[id] <= 0) delete this.state.inventory[id];
    return true;
  }

  /* ---------------------------------------------------------------------- */
  /* New game                                                               */
  /* ---------------------------------------------------------------------- */
  newGame(creation) {
    const starter = STARTERS[creation?.starter || 0] || STARTERS[0];
    const appearance = { ...(creation?.appearance || {}) };
    const stats = newPlayerStats();
    const state = {
      name: (creation?.name || 'Astra').slice(0, 16),
      appearance,
      level: 1, xp: 0, xpNext: xpForLevel(1),
      stats,
      hp: stats.hp, mp: stats.mp, stamina: stats.stamina,
      skillPoints: 1, statPoints: 0,
      skills: { unlocked: ['corte'], active: 'corte' },
      equipment: { weapon: starter.weapon, shield: null, armor: 'tunica_viajero', accessory: null },
      inventory: {
        potion_menor: 3, ether: 1, comida_criatura: 2, hierba: 1,
        cristal_sello: 2, gelatina: 1,
      },
      gold: 80,
      zone: 'aldea', flags: {}, quests: {},
      creatures: [newCreature(starter.creature, 3)],
      activeCreature: 0,
      collection: [starter.creature],
      kills: 0, captures: 0, bossKills: 0, deaths: 0, playtime: 0,
      discovered: ['aldea'],
      x: 0, y: 0,
      checkpoint: { zone: 'aldea', x: 19.5 * T, y: 16.5 * T },
      created: Date.now(),
    };
    this.state = state;
    this.startQuest('q1', 0);
    this.recalcDerived();
    this.player = new Player(this, state);
    this.loadZone('aldea', [19, 16], { at: { x: 19.5 * T, y: 16.5 * T } });
    this.state.hp = this.derived.maxHp;
    this.state.mp = this.derived.maxMp;
    this.state.stamina = this.derived.maxStamina;
    this.mode = 'playing';
    this.ui.hideScreen();
    this.ui.currentTab = 'inventory';
    this.ui.syncChrome();
    this.audio.init();
    this.audio.setVolumes(this.settings);
    this.playZoneMusic(true);
    this.toast(`La aventura de ${this.state.name} comienza`, 'good');
    setTimeout(() => this.toast(`Misión: ${QUESTS.q1.title}`, 'gold'), 900);
    this.saveAuto(true);
  }

  /* ---------------------------------------------------------------------- */
  /* Zones                                                                  */
  /* ---------------------------------------------------------------------- */
  loadZone(zoneKey, spawnTile = null, opts = {}) {
    if (!this.state) return;
    if (!ZONES[zoneKey]) zoneKey = 'aldea';
    this.state.zone = zoneKey;
    if (!this.state.discovered.includes(zoneKey)) this.state.discovered.push(zoneKey);
    this.world.load(zoneKey, spawnTile);
    this.syncRuneDisplays();

    if (!this.player) this.player = new Player(this, this.state);
    this.player.state = this.state;
    this.player.attackTime = 0;
    this.player.dodgeTime = 0;
    this.player.blocking = false;

    let px, py;
    if (opts.at && Number.isFinite(opts.at.x) && Number.isFinite(opts.at.y)) {
      px = opts.at.x; py = opts.at.y;
    } else {
      const sp = spawnTile || ZONE_DEFAULT_SPAWN[zoneKey] || [10, 10];
      px = (sp[0] + .5) * T; py = (sp[1] + .5) * T;
    }
    const safe = this.findFreeSpot(px, py, 14);
    this.player.x = safe.x; this.player.y = safe.y;
    this.state.x = safe.x; this.state.y = safe.y;

    this.enemies = [];
    this.wilds = [];
    this.projectiles = [];
    this.hazards = [];
    this.particles = [];
    this.damageNumbers = [];
    this.slashes = [];
    this.boss = null;

    const map = this.world.map;
    (map.spawns || []).forEach((sp, i) => {
      const pos = this.findFreeSpot(sp.x * T, sp.y * T, 18);
      const e = new Enemy(this, sp.enemy, pos.x / T, pos.y / T, sp.level || 1, `${zoneKey}_${sp.enemy}_${i}`);
      e.home = { x: pos.x, y: pos.y };
      this.enemies.push(e);
    });

    (map.wilds || []).forEach(sp => {
      if (this.state.flags[`wild:${sp.id}`]) return;
      const pos = this.findFreeSpot(sp.x * T, sp.y * T, 16);
      const w = new WildCreature(this, { ...sp, x: pos.x / T, y: pos.y / T });
      w.home = { x: pos.x, y: pos.y };
      this.wilds.push(w);
    });

    this.maybeSpawnBosses();
    this.updateCamera();
    this.world.transitionCooldown = 1;
    this.playZoneMusic(true);
  }

  findFreeSpot(x, y, r = 14) {
    const w = this.world;
    if (!w.map) return { x, y };
    if (!w.collidesCircle(x, y, r, ['swim', 'fly'])) return { x, y };
    for (let ring = 1; ring <= 10; ring++) {
      for (let dy = -ring; dy <= ring; dy++) {
        for (let dx = -ring; dx <= ring; dx++) {
          if (Math.max(Math.abs(dx), Math.abs(dy)) !== ring) continue;
          const nx = x + dx * T, ny = y + dy * T;
          if (nx < T || ny < T || nx > (w.map.w - 1) * T || ny > (w.map.h - 1) * T) continue;
          if (!w.collidesCircle(nx, ny, r, ['swim', 'fly'])) return { x: nx, y: ny };
        }
      }
    }
    return { x, y };
  }

  bossCondition(cond) {
    if (!cond) return true;
    if (cond === 'runes2') return !!(this.state.flags['rune:rune_ruinas_1'] && this.state.flags['rune:rune_ruinas_2']);
    if (cond === 'temple_ready') return !!this.state.flags.temple_ready;
    return true;
  }

  maybeSpawnBosses() {
    if (!this.world.map?.bosses) return;
    for (const sp of this.world.map.bosses) {
      if (this.state.flags[`boss:${sp.id}`]) continue;
      if (!this.bossCondition(sp.condition)) continue;
      if (this.enemies.some(e => e.id === sp.id && !e.dead)) continue;
      this.spawnBoss(sp);
    }
  }

  spawnBoss(sp) {
    const pos = this.findFreeSpot(sp.x * T, sp.y * T, 30);
    const level = ENEMIES[sp.enemy]?.level || 8;
    const e = new Enemy(this, sp.enemy, pos.x / T, pos.y / T, level, sp.id);
    e.home = { x: pos.x, y: pos.y };
    e.aggro = true;
    this.enemies.push(e);
    this.boss = e;
    this.shake(10, .5);
    this.hitstop(.1);
    this.audio.sfx('boss');
    this.toast(`¡${e.def.name} despierta!`, 'bad');
    this.playZoneMusic(true);
    return e;
  }

  updateCamera() {
    const cam = this.camera;
    cam.w = this.viewW; cam.h = this.viewH;
    if (!this.world.map || !this.player) { cam.x = 0; cam.y = 0; return; }
    const mapW = this.world.map.w * T, mapH = this.world.map.h * T;
    const maxX = Math.max(0, mapW - this.viewW);
    const maxY = Math.max(0, mapH - this.viewH);
    const tx = clamp(this.player.x - this.viewW / 2, 0, maxX);
    const ty = clamp(this.player.y - this.viewH / 2, 0, maxY);
    cam.x = lerp(cam.x, tx, .18);
    cam.y = lerp(cam.y, ty, .18);
    if (Math.abs(cam.x - tx) < .4) cam.x = tx;
    if (Math.abs(cam.y - ty) < .4) cam.y = ty;
  }

  checkExits() {
    if (this.world.transitionCooldown > 0) return;
    const exit = this.world.getExitAt(this.player.x, this.player.y);
    if (!exit) return;
    if (!this.exitAllowed(exit)) {
      if ((this._exitWarn || 0) < this.time) {
        this._exitWarn = this.time + 2.5;
        if (exit.requires === 'runas3') this.toast(`El sello exige las 3 runas (${this.runeCount()}/3)`, 'bad');
        else this.toast('El camino está cerrado. Habla con Roderic.', 'bad');
        this.audio.sfx('error');
      }
      return;
    }
    this.transitionZone(exit);
  }

  exitAllowed(exit) {
    if (!exit.requires) return true;
    if (exit.requires === 'runas3') return this.runeCount() >= 3;
    if (exit.requires === 'gate_canon') return !!this.state.flags['gate:gate_canon'];
    if (exit.requires.startsWith('gate:')) return !!this.state.flags[exit.requires];
    return true;
  }

  transitionZone(exit) {
    this.world.transitionCooldown = 2;
    this.audio.sfx('portal');
    this.loadZone(exit.to, exit.spawn);
    this.toast(ZONES[exit.to]?.name || exit.to, 'gold');
    this.saveAuto(true);
  }

  /* ---------------------------------------------------------------------- */
  /* Music                                                                  */
  /* ---------------------------------------------------------------------- */
  playZoneMusic(force = false) {
    if (!this.state) return;
    const zone = ZONES[this.state.zone];
    const music = zone?.music || 'town';
    this.musicZone = music;
    this.audio.playMusic(music, { battle: this.musicBattle });
  }

  updateMusic() {
    const battle = !!this.boss?.alive ||
      this.enemies.some(e => e.alive && e.aggro && Math.hypot(e.x - this.player.x, e.y - this.player.y) < 520);
    if (battle !== this.musicBattle) {
      this.musicBattle = battle;
      const music = ZONES[this.state.zone]?.music || 'town';
      this.musicZone = music;
      this.audio.playMusic(music, { battle });
    }
  }

  /* ---------------------------------------------------------------------- */
  /* Quests                                                                 */
  /* ---------------------------------------------------------------------- */
  startQuest(id, stage = 0) {
    if (!QUESTS[id] || !this.state) return;
    if (!this.state.quests[id]) {
      this.state.quests[id] = { status: 'active', stage, progress: 0 };
      this.audio.sfx('quest');
      this.toast(`Nueva misión: ${QUESTS[id].title}`, 'gold');
    }
  }

  setQuestStage(id, stage, progress = 0) {
    const q = this.state.quests[id];
    if (!q) return;
    q.stage = stage;
    q.progress = progress;
    q.status = 'active';
  }

  addQuestProgress(id, n = 1) {
    const q = this.state.quests[id];
    const def = QUESTS[id];
    if (!q || !def || q.status !== 'active') return;
    const stage = def.stages[q.stage];
    if (!stage) return;
    q.progress = Math.min(stage.count, (q.progress || 0) + n);
    if (q.progress >= stage.count) {
      if (q.stage < def.stages.length - 1) {
        q.stage++;
        q.progress = 0;
        this.toast(`Objetivo actualizado: ${def.stages[q.stage].text}`, 'gold');
        this.audio.sfx('quest');
      } else {
        q.status = 'ready';
        this.toast(`Misión lista para entregar: ${def.title}`, 'gold');
        this.audio.sfx('quest');
      }
    }
  }

  completeQuest(id) {
    const q = this.state.quests[id];
    const def = QUESTS[id];
    if (!q || !def || q.status === 'done') return;
    q.status = 'done';
    this.state.gold += def.reward.gold || 0;
    for (const [iid, qty] of Object.entries(def.reward.items || {})) this.grantItem(iid, qty);
    this.addXp(def.reward.xp || 0);
    this.audio.sfx('quest');
    this.toast(`Misión completada: ${def.title}`, 'good');
    if (def.reward.gold) setTimeout(() => this.toast(`+${def.reward.gold} oro`, 'gold'), 450);
    if (id === 'q1') this.startQuest('q2', 0);
    if (id === 'q2') {
      this.startQuest('q3', 0);
      const q3 = this.state.quests.q3;
      if (q3 && q3.status === 'active' && q3.stage === 0) {
        const runes = this.runeCount();
        if (runes >= 3) { q3.stage = 1; q3.progress = 0; }
        else q3.progress = Math.min(3, runes);
      }
    }
    this.syncRuneDisplays();
    this.saveAuto(true);
  }

  syncRuneDisplays() {
    if (!this.world?.map?.objects) return;
    for (const o of this.world.map.objects) {
      if (o.type === 'runeDisplay') {
        o.active = !!this.state.flags[`rune_taken:${o.rune}`] ||
          !!this.state.flags[`relic:relic_${o.rune}`] ||
          (this.state.inventory[o.rune] || 0) > 0;
      }
    }
  }

  getMainQuestTracker() {
    if (!this.state) return { title: 'El despertar', objective: 'Habla con la Anciana Elara.' };
    for (const id of ['q1', 'q2', 'q3']) {
      const q = this.state.quests[id];
      if (!q || q.status === 'done') continue;
      const def = QUESTS[id];
      const stage = def.stages[Math.min(q.stage, def.stages.length - 1)];
      const objective = q.status === 'ready'
        ? `Entrega la misión a ${def.giver}.`
        : stage?.text || def.desc;
      return { title: def.title, objective };
    }
    return { title: 'El reino en calma', objective: 'Explora, captura criaturas y completa tu colección.' };
  }

  onRuneGained() {
    const n = this.runeCount();
    if (this.state.quests.q3?.status === 'active' && this.state.quests.q3.stage === 0 && n >= 3) {
      this.setQuestStage('q3', 1);
      this.toast('Las tres runas brillan. El Templo te espera.', 'gold');
    }
  }

  /* ---------------------------------------------------------------------- */
  /* Interaction                                                            */
  /* ---------------------------------------------------------------------- */
  findCapturableWild() {
    if (!this.player) return null;
    let best = null, bestD = 92;
    for (const w of this.wilds) {
      if (!w.alive) continue;
      if (w.hp / w.maxHp > .4) continue;
      const d = Math.hypot(w.x - this.player.x, w.y - this.player.y);
      if (d < bestD) { best = w; bestD = d; }
    }
    return best;
  }

  interact() {
    if (this.uiBlocking() || !this.player) return;
    const wild = this.findCapturableWild();
    if (wild) { this.attemptCapture(wild); return; }
    const abilities = this.getAbilities();
    const o = this.world.findInteractable(this.player.x, this.player.y, 88, abilities);
    if (!o) return;
    switch (o.type) {
      case 'npc': this.talkTo(o); break;
      case 'chest': this.openChest(o, abilities); break;
      case 'relic': this.takeRelic(o); break;
      case 'rune': this.activateRune(o, abilities); break;
      case 'altar': this.useAltar(); break;
      case 'gate': this.openGate(o); break;
      case 'shrine': this.restAtShrine(o); break;
      case 'sign': this.readSign(o); break;
      case 'obstacle': this.clearObstacle(o, abilities); break;
      case 'runeDisplay': {
        this.toast(o.active ? `La ${ITEMS[o.rune]?.name || 'runa'} brilla en el pedestal.` : 'El pedestal aguarda una runa.', o.active ? 'good' : '');
        break;
      }
      default: break;
    }
  }

  updatePrompt() {
    if (!this.player || this.mode !== 'playing') { this.ui.setPrompt(null); return; }
    const wild = this.findCapturableWild();
    if (wild) {
      const def = CREATURES[wild.creature];
      this.ui.setPrompt(`Sellar a ${def.name} (${Math.ceil(wild.hp / wild.maxHp * 100)}% vida)`);
      return;
    }
    const abilities = this.getAbilities();
    const o = this.world.findInteractable(this.player.x, this.player.y, 88, abilities);
    if (!o) { this.ui.setPrompt(null); return; }
    let label = null;
    if (o.type === 'npc') label = `Hablar con ${o.name}`;
    else if (o.type === 'chest') {
      label = o.requires && !abilities.includes(o.requires)
        ? `Requiere ${this.abilityName(o.requires)}`
        : o.opened ? null : 'Abrir cofre';
    } else if (o.type === 'relic') label = `Tomar ${o.label || 'reliquia'}`;
    else if (o.type === 'rune') label = o.active ? null : `Activar ${o.label} (${this.abilityName(o.ability)})`;
    else if (o.type === 'altar') label = this.state.flags.temple_ready ? 'El altar está en calma' : 'Ofrecer las tres runas';
    else if (o.type === 'gate') label = `Abrir ${o.label || 'sello'}`;
    else if (o.type === 'shrine') label = 'Descansar en el santuario';
    else if (o.type === 'sign') label = 'Leer el letrero';
    else if (o.type === 'obstacle') label = abilities.includes(o.ability)
      ? `Usar ${this.abilityName(o.ability)}`
      : `Requiere ${this.abilityName(o.ability)}`;
    else if (o.type === 'runeDisplay') label = o.active ? 'Runa consagrada' : 'Pedestal vacío';
    this.ui.setPrompt(label);
  }

  openChest(o, abilities) {
    if (o.opened) return;
    if (o.requires && !abilities.includes(o.requires)) {
      this.toast(`Necesitas una criatura con ${this.abilityName(o.requires)}`, 'bad');
      this.audio.sfx('error');
      return;
    }
    if (o.bossLocked && this.boss?.alive) {
      this.toast('El guardián aún protege este lugar', 'bad');
      return;
    }
    o.opened = true;
    this.state.flags[`chest:${o.id}`] = true;
    this.audio.sfx('chest');
    this.particles.push(...Particle.burst(o.x * T, o.y * T - 16, 20, '#ffe6a0', { speed: 110, size: 2.4, life: .7 }));
    const loot = o.loot || {};
    if (loot.gold) { this.state.gold += loot.gold; this.toast(`+${loot.gold} oro`, 'gold'); }
    for (const [id, qty] of Object.entries(loot.items || {})) {
      this.grantItem(id, qty);
      this.toast(`${ITEMS[id]?.name || id} ×${qty}`, 'good');
    }
    if (o.hidden && this.state.quests.sq_secret?.status === 'active') {
      this.addQuestProgress('sq_secret');
    }
    this.saveAuto(true);
  }

  takeRelic(o) {
    if (o.taken) return;
    if (o.bossLocked && this.boss?.alive) {
      this.toast('El guardián aún protege este lugar', 'bad');
      return;
    }
    o.taken = true;
    this.state.flags[`relic:${o.id}`] = true;
    this.state.flags[`rune_taken:${o.item}`] = true;
    this.grantItem(o.item, 1);
    this.audio.sfx('pickup');
    this.particles.push(...Particle.burst(o.x * T, o.y * T - 24, 26, '#ffe9a8', { speed: 130, size: 2.6, life: .8 }));
    this.toast(`Obtuviste: ${ITEMS[o.item]?.name || o.label}`, 'gold');
    this.world.buildLights();
    this.onRuneGained();
    this.saveAuto(true);
  }

  activateRune(o, abilities) {
    if (o.active) { this.toast('La runa ya está despierta', 'good'); return; }
    if (!abilities.includes(o.ability)) {
      this.toast(`Necesitas una criatura con ${this.abilityName(o.ability)}`, 'bad');
      this.audio.sfx('error');
      return;
    }
    o.active = true;
    this.state.flags[`rune:${o.id}`] = true;
    this.audio.sfx('magic');
    this.particles.push(...Particle.burst(o.x * T, o.y * T - 20, 30, '#ffd27a', { speed: 150, size: 2.8, life: .9 }));
    this.shake(5, .25);
    this.toast(`${o.label} despierta`, 'good');
    this.world.buildLights();
    this.addQuestProgress('q2');
    if (this.state.flags['rune:rune_ruinas_1'] && this.state.flags['rune:rune_ruinas_2']) {
      setTimeout(() => this.maybeSpawnBosses(), 700);
    }
    this.saveAuto(true);
  }

  useAltar() {
    if (this.state.flags.temple_ready) {
      this.toast('El altar ya concedió su último vínculo', 'good');
      return;
    }
    const n = this.runeCount();
    if (n < 3) {
      this.toast(`El altar exige las 3 runas (${n}/3)`, 'bad');
      this.audio.sfx('error');
      return;
    }
    this.state.flags.temple_ready = true;
    this.state.flags['gate:gate_templo'] = true;
    const gate = this.world.map.objects.find(x => x.type === 'gate');
    if (gate) gate.open = true;
    this.audio.sfx('portal');
    this.shake(9, .6);
    this.particles.push(...Particle.burst(this.player.x, this.player.y - 30, 50, '#ffd98a', { speed: 190, size: 3, life: 1.1 }));
    if (!this.state.collection.includes('aether')) {
      this.state.collection.push('aether');
      this.state.creatures.push(newCreature('aether', 5));
      this.toast('Aether se une a tu vínculo', 'gold');
    }
    this.toast('El sello del Vacío se rompe', 'good');
    this.world.buildLights();
    setTimeout(() => this.maybeSpawnBosses(), 900);
    this.saveAuto(true);
  }

  openGate(o) {
    if (o.open) return;
    if (o.id === 'gate_canon' && !this.state.flags['gate:gate_canon']) {
      this.toast('Roderic debe autorizar tu paso', 'bad');
      return;
    }
    if (o.id === 'gate_templo' && this.runeCount() < 3) {
      this.toast(`El sello exige las 3 runas (${this.runeCount()}/3)`, 'bad');
      return;
    }
    o.open = true;
    this.state.flags[`gate:${o.id}`] = true;
    this.audio.sfx('portal');
    this.toast(`${o.label || 'Puerta'} abierta`, 'good');
    this.world.buildLights();
  }

  restAtShrine(o) {
    this.state.hp = this.derived.maxHp;
    this.state.mp = this.derived.maxMp;
    this.state.stamina = this.derived.maxStamina;
    this.state.checkpoint = { zone: this.state.zone, x: o.x * T, y: (o.y + .8) * T };
    this.audio.sfx('heal');
    this.particles.push(...Particle.burst(o.x * T, o.y * T - 30, 24, '#ffe9a8', { speed: 100, size: 2.2, life: .9 }));
    this.toast('Descanso restaurador · autoguardado', 'good');
    this.saveAuto(true);
  }

  readSign(o) {
    this.showScript({
      speaker: 'Letrero antiguo', role: 'Lumen',
      appearance: { hair: 'corto', hairColor: 'oro', skin: 'dorada', outfit: 'verde', eyes: 'ambar' },
      lines: [o.text || 'Las letras se han borrado con el tiempo.'],
    });
  }

  clearObstacle(o, abilities) {
    if (o.cleared) return;
    if (!abilities.includes(o.ability)) {
      this.toast(`Necesitas una criatura con ${this.abilityName(o.ability)}`, 'bad');
      this.audio.sfx('error');
      return;
    }
    this.world.clearObstacle(o);
    this.state.flags[`obstacle:${this.state.zone}:${o.tx},${o.ty}`] = true;
    const color = o.ability === 'burn' ? '#ff8a45' : o.ability === 'freeze' ? '#9fe4ff' : '#c0905a';
    this.particles.push(...Particle.burst(o.x * T, o.y * T - 12, 26, color, { speed: 150, size: 2.6, life: .8 }));
    this.audio.sfx(o.ability === 'burn' ? 'fire' : o.ability === 'freeze' ? 'ice' : 'heavy');
    this.toast(`${this.abilityName(o.ability)} despeja el camino`, 'good');
  }

  /* ---------------------------------------------------------------------- */
  /* Dialogue                                                               */
  /* ---------------------------------------------------------------------- */
  showScript(script) {
    if (!script.onEnd) script.onEnd = () => { this.mode = 'playing'; };
    this.ui.showDialogue(script);
  }

  npcBase(o, lines, onEnd = null) {
    return {
      speaker: o.name, role: o.role, appearance: o.appearance, lines,
      onEnd: () => {
        this.mode = 'playing';
        this.ui.hideScreen();
        onEnd?.();
      },
    };
  }

  talkTo(o) {
    switch (o.id) {
      case 'elara': return this.talkElara(o);
      case 'mira': return this.talkMira(o);
      case 'torin': return this.talkTorin(o);
      case 'lia': return this.talkLia(o);
      case 'nilo': return this.talkNilo(o);
      case 'roderic': return this.talkRoderic(o);
      default:
        return this.showScript(this.npcBase(o, ['Que la luz te acompañe, portador.']));
    }
  }

  talkElara(o) {
    const q1 = this.state.quests.q1, q2 = this.state.quests.q2, q3 = this.state.quests.q3;
    if (!q1) {
      this.startQuest('q1', 0);
      this.showScript(this.npcBase(o, [
        'Acércate, portador. La Espada Celestial se ha roto y su luz se derrama por el reino.',
        'El vacío despierta en el Templo. Tres runas guardan el sello: el Bosque, Aethel y la Ceniza.',
        'Empieza por el Bosque de los Susurros. Derrota a tres gelatinas y vuelve a mí.',
      ], () => {
        this.setQuestStage('q1', 1);
        this.toast('Objetivo: derrota 3 gelatinas silvestres', 'gold');
      }));
      return;
    }
    if (q1.status !== 'done') {
      if (q1.stage >= 2) {
        this.showScript(this.npcBase(o, [
          'Siento el pulso de la primera runa en tu bolsa. Has hecho bien.',
          'El Guardián Corrompido duerme en las Ruinas de Aethel. Despierta sus dos runas y reclama la Runa de Aethel.',
        ], () => this.completeQuest('q1')));
        return;
      }
      const remaining = Math.max(0, 3 - (q1.progress || 0));
      this.showScript(this.npcBase(o, [
        q1.stage === 1
          ? `El Bosque aún susurra. Derrota ${remaining} gelatina${remaining === 1 ? '' : 's'} más y vuelve.`
          : 'La luz de Lumen aún depende de ti. Sigue el sendero del norte.',
      ]));
      return;
    }
    if (q2 && q2.status !== 'done') {
      if (q2.stage >= 2) {
        this.showScript(this.npcBase(o, [
          'La Runa de Aethel canta entre tus manos. El Guardián ha caído.',
          'Dos runas son tuyas. La tercera duerme en el Cañón de Ceniza, más allá de la puerta de Roderic.',
        ], () => this.completeQuest('q2')));
        return;
      }
      this.showScript(this.npcBase(o, [
        q2.stage === 0
          ? 'Despierta las dos runas de las Ruinas. Solo una criatura de rayo puede tocar sus engranajes.'
          : 'El Guardián Corrompido protege la Runa de Aethel. No lo enfrentes sin preparar tus pociones.',
      ]));
      return;
    }
    if (q3 && q3.status !== 'done') {
      const n = this.runeCount();
      this.showScript(this.npcBase(o, [
        n < 3
          ? `Reúne las tres runas, portador. Ahora tienes ${n}. El Cañón guarda la última.`
          : 'Las tres runas están completas. Abre el Templo Celestial y enfrenta al Avatar del Vacío.',
        'Cuando el altar conceda su vínculo, no mires atrás.',
      ]));
      return;
    }
    this.showScript(this.npcBase(o, [
      'El reino respira. La Espada vuelve a brillar en tu mano.',
      'Descansa, portador. Las criaturas que salvaste cantarán tu nombre por generaciones.',
    ]));
  }

  talkMira(o) {
    this.showScript(this.npcBase(o, [
      '“Todo tiene un precio, incluso los milagros.” Y mis precios son justos, por cierto.',
      { text: '¿Qué necesitas hoy?', choices: [
        { label: 'Ver mercancía', action: () => this.openShop('mira') },
        { label: 'Solo pasaba a saludar' },
      ] },
    ]));
  }

  talkTorin(o) {
    this.showScript(this.npcBase(o, [
      '“El acero recuerda cada golpe.” El tuyo aún no ha aprendido a quejarse.',
      { text: 'La forja está caliente. ¿Qué hacemos?', choices: [
        { label: 'Comprar o vender', action: () => this.openShop('torin') },
        { label: 'Fabricar en el yunque', action: () => { this.mode = 'playing'; this.ui.hideScreen(); this.openPause('crafting'); } },
        { label: 'Nada por ahora' },
      ] },
    ]));
  }

  talkLia(o) {
    const q = this.state.quests.sq_herbs;
    if (!q) {
      this.startQuest('sq_herbs');
      this.showScript(this.npcBase(o, [
        'Lía, herbalista de Lumen. Las heridas del bosque también llegan a la aldea.',
        'Necesito 3 Hierbas Lunares. Crece donde la luna toca el bosque; tráemelas y te recompensaré.',
      ]));
      return;
    }
    if (q.status === 'done') {
      this.showScript(this.npcBase(o, ['Gracias otra vez. Mis remedios salvan vidas gracias a ti.']));
      return;
    }
    if ((this.state.inventory.hierba || 0) >= 3) {
      this.showScript(this.npcBase(o, [
        'Huelo la luna en tu bolsa. ¿Me traes las tres hierbas?',
        { text: 'Lía espera tu respuesta.', choices: [
          { label: 'Entregar 3 Hierbas Lunares', action: () => {
            this.removeItem('hierba', 3);
            this.completeQuest('sq_herbs');
          } },
          { label: 'Todavía no' },
        ] },
      ]));
      return;
    }
    this.showScript(this.npcBase(o, [`Aún necesito ${3 - (this.state.inventory.hierba || 0)} Hierbas Lunares. El bosque está al norte.`]));
  }

  talkNilo(o) {
    if (!this.state.quests.sq_capture) this.startQuest('sq_capture');
    if (!this.state.quests.sq_secret) this.startQuest('sq_secret');
    const cap = this.state.quests.sq_capture;
    const sec = this.state.quests.sq_secret;
    if (cap.status === 'ready') {
      this.showScript(this.npcBase(o, [
        '¡Tres criaturas distintas! Mi álbum por fin tiene color.',
        { text: 'Nilo hojea su cuaderno con emoción.', choices: [
          { label: 'Mostrar la colección', action: () => this.completeQuest('sq_capture') },
          { label: 'Más tarde' },
        ] },
      ]));
      return;
    }
    if (sec.status === 'ready') {
      this.showScript(this.npcBase(o, [
        '¿Encontraste el cofre oculto? ¡Sabía que había algo bajo las raíces!',
        { text: 'Nilo espera tu historia.', choices: [
          { label: 'Contarle el secreto', action: () => this.completeQuest('sq_secret') },
          { label: 'Guardar el secreto' },
        ] },
      ]));
      return;
    }
    const captured = this.state.captures || 0;
    this.showScript(this.npcBase(o, [
      `Llevas ${captured} captura${captured === 1 ? '' : 's'} y ${this.state.collection.length}/10 especies. ¡Sigue así!`,
      'Dicen que bajo las raíces del Bosque duerme un cofre que solo una criatura de sombra puede ver. Umbra vive en las Ruinas.',
      'Y si capturas tres criaturas distintas, te daré algo especial.',
    ]));
  }

  talkRoderic(o) {
    const opened = !!this.state.flags['gate:gate_canon'];
    if (!opened) {
      this.state.flags['gate:gate_canon'] = true;
      const gate = this.world.maps.aldea.objects.find(x => x.id === 'gate_canon');
      if (gate) gate.open = true;
      this.startQuest('sq_wolves');
      this.showScript(this.npcBase(o, [
        'Alto. El Cañón de Ceniza no perdona a los imprudentes.',
        'He visto cómo luchas. La puerta del este está abierta; cruza cuando estés listo.',
        'Los lobos de ceniza acosan a los viajeros. Trae cinco colmillos y te pagaré bien.',
      ], () => {
        this.audio.sfx('portal');
        this.toast('La Puerta del Cañón está abierta', 'good');
      }));
      return;
    }
    const q = this.state.quests.sq_wolves;
    if (q?.status === 'ready') {
      this.showScript(this.npcBase(o, [
        'Cinco colmillos. Los viajeros podrán dormir esta noche.',
        { text: 'Roderic extiende la mano.', choices: [
          { label: 'Entregar los colmillos', action: () => this.completeQuest('sq_wolves') },
          { label: 'Aún no' },
        ] },
      ]));
      return;
    }
    this.showScript(this.npcBase(o, [
      q && q.status !== 'done'
        ? `Llevas ${q.progress || 0}/5 lobos de ceniza. No bajes la guardia.`
        : 'El Cañón sigue siendo peligroso. La puerta está abierta para ti.',
    ]));
  }

  /* ---------------------------------------------------------------------- */
  /* Shops                                                                  */
  /* ---------------------------------------------------------------------- */
  buyItem(id) {
    const def = ITEMS[id];
    if (!def) return;
    const price = def.value || 0;
    if (this.state.gold < price) { this.toast('No tienes suficiente oro', 'bad'); this.audio.sfx('error'); return; }
    this.state.gold -= price;
    this.grantItem(id, 1);
    this.audio.sfx('coin');
    this.toast(`Compraste ${def.name}`, 'good');
  }

  sellItem(id) {
    const def = ITEMS[id];
    if (!def || !(this.state.inventory[id] > 0)) return;
    if (def.type === 'key') { this.toast('No puedes vender reliquias', 'bad'); return; }
    this.removeItem(id, 1);
    const price = Math.max(1, Math.floor((def.value || 0) / 2));
    this.state.gold += price;
    this.audio.sfx('coin');
    this.toast(`Vendiste ${def.name} (+${price} oro)`, 'gold');
  }

  /* ---------------------------------------------------------------------- */
  /* Inventory, equipment & skills                                          */
  /* ---------------------------------------------------------------------- */
  useItem(id) {
    const def = ITEMS[id];
    if (!def || def.type !== 'consumable') return;
    if (!(this.state.inventory[id] > 0)) { this.toast('No tienes ese objeto', 'bad'); return; }
    const eff = def.effect || {};
    if (eff.capture) { this.toast('Acércate a una criatura debilitada y pulsa interactuar', 'gold'); return; }
    let used = false;
    if (eff.heal) {
      if (this.state.hp >= this.derived.maxHp) { this.toast('Tu vida ya está al máximo', 'bad'); return; }
      const healed = this.player.heal(eff.heal);
      this.addDamage(this.player.x, this.player.y - 50, `+${healed}`, '#8fe3a4', 16);
      this.particles.push(...Particle.burst(this.player.x, this.player.y - 22, 14, '#8fe3a4', { speed: 80, size: 2.4, life: .7 }));
      this.audio.sfx('heal');
      used = true;
    }
    if (eff.mana) {
      if (this.state.mp >= this.derived.maxMp) { if (!used) { this.toast('Tu maná ya está al máximo', 'bad'); return; } }
      else { this.state.mp = Math.min(this.derived.maxMp, this.state.mp + eff.mana); this.audio.sfx('magic'); used = true; }
    }
    if (eff.stamina) {
      this.state.stamina = this.derived.maxStamina;
      used = true;
    }
    if (eff.creatureXp || eff.bond) {
      const c = this.getActiveCreature();
      if (!c) { this.toast('No tienes criatura activa', 'bad'); return; }
      if (eff.creatureXp) this.gainCreatureXp(c, eff.creatureXp);
      if (eff.bond) c.bond = clamp(c.bond + eff.bond, 0, 100);
      this.audio.sfx('pickup');
      used = true;
    }
    if (!used) { this.toast('No puedes usar ese objeto ahora', 'bad'); return; }
    this.removeItem(id, 1);
    this.toast(`${def.name} usado`, 'good');
  }

  equipItem(id) {
    const def = ITEMS[id];
    if (!def || !(this.state.inventory[id] > 0)) return;
    if (!['weapon', 'shield', 'armor', 'accessory'].includes(def.type)) return;
    const slot = def.slot || def.type;
    const prev = this.state.equipment[slot];
    if (prev === id) return;
    if (prev) this.grantItem(prev, 1);
    this.state.equipment[slot] = id;
    this.removeItem(id, 1);
    this.recalcDerived();
    this.state.hp = Math.min(this.state.hp, this.derived.maxHp);
    this.audio.sfx('confirm');
    this.toast(`Equipado: ${def.name}`, 'good');
  }

  unequip(slot) {
    const prev = this.state.equipment[slot];
    if (!prev) return;
    this.state.equipment[slot] = null;
    this.grantItem(prev, 1);
    this.recalcDerived();
    this.state.hp = Math.min(this.state.hp, this.derived.maxHp);
    this.audio.sfx('cancel');
    this.toast(`Desequipado: ${ITEMS[prev]?.name || prev}`, '');
  }

  unlockSkill(id) {
    const sk = SKILLS[id];
    if (!sk || this.state.skills.unlocked.includes(id)) return;
    if (this.state.level < sk.unlock) { this.toast(`Necesitas nivel ${sk.unlock}`, 'bad'); return; }
    if (this.state.skillPoints < sk.points) { this.toast('Puntos de habilidad insuficientes', 'bad'); return; }
    this.state.skillPoints -= sk.points;
    this.state.skills.unlocked.push(id);
    this.audio.sfx('levelup');
    this.toast(`Habilidad desbloqueada: ${sk.name}`, 'good');
  }

  setActiveSkill(id) {
    if (!this.state.skills.unlocked.includes(id)) return;
    this.state.skills.active = id;
    this.audio.sfx('confirm');
    this.toast(`Habilidad activa: ${SKILLS[id].name}`, 'good');
  }

  addStat(stat) {
    if (this.state.statPoints <= 0) return;
    if (this.state.stats[stat] == null) return;
    this.state.stats[stat] += 1;
    this.state.statPoints -= 1;
    this.recalcDerived();
    this.audio.sfx('confirm');
    const names = { str: 'Fuerza', def: 'Defensa', spd: 'Velocidad', int: 'Inteligencia', luck: 'Suerte' };
    this.toast(`${names[stat] || stat} +1`, 'good');
  }

  addXp(n) {
    if (!this.state || n <= 0) return;
    this.state.xp += n;
    while (this.state.xp >= this.state.xpNext) {
      this.state.xp -= this.state.xpNext;
      this.state.level += 1;
      this.state.xpNext = xpForLevel(this.state.level);
      this.state.skillPoints += 1;
      this.state.statPoints += 2;
      this.state.hp = this.derived.maxHp;
      this.state.mp = this.derived.maxMp;
      this.recalcDerived();
      this.state.hp = this.derived.maxHp;
      this.state.mp = this.derived.maxMp;
      this.audio.sfx('levelup');
      this.toast(`¡Nivel ${this.state.level}! +1 punto de habilidad, +2 de atributo`, 'gold');
      if (this.player) this.particles.push(...Particle.burst(this.player.x, this.player.y - 30, 30, '#ffd98a', { speed: 130, size: 2.8, life: .9 }));
    }
  }

  /* ---------------------------------------------------------------------- */
  /* Creatures                                                              */
  /* ---------------------------------------------------------------------- */
  gainCreatureXp(c, n) {
    if (!c || n <= 0) return;
    c.xp += n;
    let leveled = false;
    while (c.xp >= c.xpNext) {
      c.xp -= c.xpNext;
      c.level += 1;
      c.xpNext = creatureXpForLevel(c.level);
      const def = CREATURES[c.id];
      c.maxHp = Math.round(def.base.hp + c.level * 6.5);
      c.hp = c.maxHp;
      c.bond = clamp(c.bond + 4, 0, 100);
      leveled = true;
    }
    if (leveled) {
      this.audio.sfx('levelup');
      this.toast(`${this.creatureDisplayName(c)} alcanzó el nivel ${c.level}`, 'gold');
    }
  }

  trainCreature(index) {
    const c = this.state.creatures[index];
    if (!c) return;
    const cost = 25 + c.level * 8;
    if (this.state.gold < cost) { this.toast('No tienes suficiente oro para entrenar', 'bad'); return; }
    this.state.gold -= cost;
    this.gainCreatureXp(c, 24 + c.level * 5);
    c.bond = clamp(c.bond + 2, 0, 100);
    this.audio.sfx('confirm');
    this.toast(`${this.creatureDisplayName(c)} entrenó (+${24 + c.level * 5} XP)`, 'good');
  }

  feedCreature(index) {
    const c = this.state.creatures[index];
    if (!c) return;
    const food = ['festin', 'comida_criatura'].find(id => (this.state.inventory[id] || 0) > 0);
    if (!food) { this.toast('No tienes comida para criaturas', 'bad'); return; }
    const eff = ITEMS[food].effect || {};
    this.removeItem(food, 1);
    if (eff.creatureXp) this.gainCreatureXp(c, eff.creatureXp);
    if (eff.bond) c.bond = clamp(c.bond + eff.bond, 0, 100);
    this.audio.sfx('pickup');
    this.toast(`${this.creatureDisplayName(c)} comió ${ITEMS[food].name}`, 'good');
  }

  evolveCreature(index) {
    const c = this.state.creatures[index];
    if (!c) return;
    const def = CREATURES[c.id];
    if (c.evolved) { this.toast('Ya ha evolucionado', 'bad'); return; }
    if (c.level < def.evolveLevel) { this.toast(`Necesita nivel ${def.evolveLevel}`, 'bad'); return; }
    c.evolved = true;
    c.maxHp = Math.round(c.maxHp * 1.25);
    c.hp = c.maxHp;
    c.bond = clamp(c.bond + 10, 0, 100);
    this.audio.sfx('levelup');
    this.shake(5, .3);
    if (this.player) this.particles.push(...Particle.burst(this.player.x, this.player.y - 24, 34, CREATURES[c.id].colors[1], { speed: 150, size: 3, life: 1 }));
    this.toast(`${def.name} evolucionó a ${def.evolve}`, 'gold');
  }

  equipCharm(index, id) {
    const c = this.state.creatures[index];
    const def = ITEMS[id];
    if (!c || !def || def.type !== 'charm' || !(this.state.inventory[id] > 0)) return;
    if (c.charm) this.grantItem(c.charm, 1);
    c.charm = id;
    this.removeItem(id, 1);
    this.audio.sfx('confirm');
    this.toast(`${def.name} equipado en ${this.creatureDisplayName(c)}`, 'good');
  }

  unequipCharm(index) {
    const c = this.state.creatures[index];
    if (!c?.charm) return;
    this.grantItem(c.charm, 1);
    c.charm = null;
    this.audio.sfx('cancel');
    this.toast('Amuleto retirado', '');
  }

  setActiveCreature(index) {
    if (!this.state.creatures[index]) return;
    this.state.activeCreature = index;
    if (this.player) this.player.creatureCd = 0;
    this.audio.sfx('confirm');
    this.toast(`Criatura activa: ${this.creatureDisplayName(this.state.creatures[index])}`, 'good');
  }

  cycleWeapon() {
    if (!this.state) return;
    const ids = Object.keys(this.state.inventory)
      .filter(id => ITEMS[id]?.type === 'weapon' && this.state.inventory[id] > 0);
    if (!ids.length) { this.toast('No tienes otras armas en la bolsa', 'bad'); return; }
    const cur = this.state.equipment.weapon;
    const idx = ids.indexOf(cur);
    const next = ids[(idx + 1) % ids.length];
    this.equipItem(next);
    this.toast(`Arma: ${ITEMS[next]?.name || next}`, '');
  }

  cycleCreature() {
    if (!this.state?.creatures?.length) return;
    if (this.state.creatures.length < 2) { this.toast('Solo tienes una criatura', 'bad'); return; }
    this.state.activeCreature = (this.state.activeCreature + 1) % this.state.creatures.length;
    if (this.player) this.player.creatureCd = 0;
    this.audio.sfx('confirm');
    this.toast(`Criatura activa: ${this.creatureDisplayName(this.getActiveCreature())}`, 'good');
  }

  /* ---------------------------------------------------------------------- */
  /* Crafting                                                               */
  /* ---------------------------------------------------------------------- */
  canCraft(recipe) {
    if (!recipe) return false;
    return Object.entries(recipe.mats).every(([id, q]) => (this.state.inventory[id] || 0) >= q);
  }

  craft(id) {
    const recipe = RECIPES.find(r => r.id === id);
    if (!recipe) return;
    if (!this.canCraft(recipe)) { this.toast('Faltan materiales', 'bad'); this.audio.sfx('error'); return; }
    for (const [mid, q] of Object.entries(recipe.mats)) this.removeItem(mid, q);
    this.grantItem(recipe.out, recipe.qty);
    this.audio.sfx('confirm');
    this.toast(`Fabricaste ${ITEMS[recipe.out]?.name} ×${recipe.qty}`, 'good');
  }

  /* ---------------------------------------------------------------------- */
  /* Combat                                                                 */
  /* ---------------------------------------------------------------------- */
  findNearestEnemy(x, y, range = 320) {
    let best = null, bestD = range;
    for (const e of this.enemies) {
      if (!e.alive) continue;
      const d = Math.hypot(e.x - x, e.y - y);
      if (d < bestD) { best = e; bestD = d; }
    }
    for (const w of this.wilds) {
      if (!w.alive) continue;
      const d = Math.hypot(w.x - x, w.y - y);
      if (d < bestD) { best = w; bestD = d; }
    }
    return best;
  }

  spawnSlash(x, y, angle, radius, color = '#ffe6a0', arc = 1.6, life = .22) {
    this.slashes.push({ x, y, angle, radius, color, arc, life, maxLife: life });
  }

  performPlayerAttack(player) {
    const weapon = this.getWeapon();
    const w = weapon?.weapon || { kind: 'fist', dmg: 6, speed: 1, range: 58, arc: 1.5, crit: 0 };
    const ang = player.attackAngle ?? Math.atan2(dirVec(player.facing).y, dirVec(player.facing).x);
    if (w.projectile) {
      this.spawnPlayerProjectile(player, w, ang);
      return;
    }
    const comboMult = 1 + Math.max(0, (player.combo || 1) - 1) * .18;
    const base = (w.dmg + this.derived.atk * .55) * comboMult * (player.attackBuff > 0 ? 1.35 : 1);
    const range = w.range || 68;
    const arc = w.arc || 1.6;
    const color = w.celestial ? '#fff2c7' : w.kind === 'greatsword' ? '#ffd0a0' : '#cfe8ff';
    this.spawnSlash(player.x, player.y, ang, range, color, arc, .2);
    let hits = 0;
    const targets = [...this.enemies, ...this.wilds];
    for (const t of targets) {
      if (!t.alive) continue;
      const d = Math.hypot(t.x - player.x, t.y - player.y);
      if (d > range + t.radius) continue;
      const ta = Math.atan2(t.y - player.y, t.x - player.x);
      let diff = Math.abs(((ta - ang + Math.PI * 3) % (Math.PI * 2)) - Math.PI);
      if (diff > arc / 2 + .16) continue;
      const crit = Math.random() < this.derived.crit;
      const dmg = Math.max(1, Math.round(base * (crit ? 1.7 : 1)));
      t.takeDamage(dmg, {
        crit,
        knockback: w.kind === 'greatsword' ? 280 : w.kind === 'dagger' ? 70 : 140,
        angle: ang,
        heavy: w.kind === 'greatsword' || w.kind === 'spear',
      });
      hits++;
    }
    if (hits) {
      this.shake(w.kind === 'greatsword' ? 7 : 3, .12);
      this.hitstop(w.kind === 'greatsword' ? .06 : .035);
      this.input.rumble(w.kind === 'greatsword' ? .55 : .25, .2, 70);
      this.particles.push(...Particle.burst(
        player.x + Math.cos(ang) * range * .55,
        player.y - 22 + Math.sin(ang) * range * .55,
        hits > 1 ? 14 : 7, color, { speed: 120, size: 2.2, life: .4 }));
    }
  }

  spawnPlayerProjectile(player, w, ang) {
    const arrow = w.projectile === 'arrow';
    const speed = arrow ? 640 : 500;
    const color = arrow ? '#bfe9ff' : '#c8a8ff';
    this.projectiles.push(new Projectile(this, {
      x: player.x + Math.cos(ang) * 20,
      y: player.y - 26 + Math.sin(ang) * 20,
      vx: Math.cos(ang) * speed, vy: Math.sin(ang) * speed,
      damage: (w.dmg + this.derived.atk * .45) * (player.attackBuff > 0 ? 1.35 : 1),
      owner: 'player', color, life: 1.25, radius: arrow ? 4 : 7,
      kind: w.projectile, pierce: w.kind === 'staff' ? 1 : 0,
    }));
    this.audio.sfx(w.kind === 'staff' ? 'magic' : 'attack');
    this.particles.push(...Particle.burst(player.x + Math.cos(ang) * 20, player.y - 26 + Math.sin(ang) * 20, 5, color, { speed: 60, size: 1.6, life: .25 }));
  }

  castSkill(id) {
    const p = this.player, d = this.derived;
    if (!p) return;
    switch (id) {
      case 'corte': {
        this.spawnSlash(p.x, p.y, -Math.PI / 2, 170, '#fff2c7', Math.PI * 2, .45);
        for (const t of [...this.enemies, ...this.wilds]) {
          if (!t.alive) continue;
          if (Math.hypot(t.x - p.x, t.y - p.y) < 175) {
            t.takeDamage(Math.round(d.atk * 2.2 + 10), { crit: false, knockback: 220, angle: Math.atan2(t.y - p.y, t.x - p.x), heavy: true, color: '#fff2c7' });
          }
        }
        this.particles.push(...Particle.burst(p.x, p.y - 26, 30, '#fff2c7', { speed: 190, size: 3, life: .7 }));
        this.shake(7, .22);
        this.hitstop(.05);
        this.audio.sfx('heavy');
        break;
      }
      case 'barrera': {
        p.shieldTime = 5;
        p.shieldHp = 40 + d.int * 3;
        this.particles.push(...Particle.burst(p.x, p.y - 24, 22, '#7fe8ff', { speed: 100, size: 2.6, life: .8 }));
        this.audio.sfx('magic');
        this.toast(`Barrera de Lumen: ${Math.round(p.shieldHp)} de absorción`, 'good');
        break;
      }
      case 'curacion': {
        const amount = Math.round(d.maxHp * .35);
        const healed = p.heal(amount);
        this.addDamage(p.x, p.y - 50, `+${healed}`, '#8fe3a4', 18);
        this.particles.push(...Particle.burst(p.x, p.y - 24, 26, '#8fe3a4', { speed: 110, size: 2.6, life: .9 }));
        this.audio.sfx('heal');
        break;
      }
      case 'meteoro': {
        const targets = [...this.enemies].filter(e => e.alive && Math.hypot(e.x - p.x, e.y - p.y) < 360).slice(0, 3);
        if (!targets.length) {
          for (let i = 0; i < 3; i++) {
            this.addHazard(p.x + (Math.random() - .5) * 240, p.y + (Math.random() - .5) * 200, 66, d.atk * 1.8, '#ffb36b', .85, 1.6);
          }
        } else {
          for (const t of targets) this.addHazard(t.x, t.y, 70, d.atk * 1.8, '#ffb36b', .85, 1.6);
          if (targets.length < 3) this.addHazard(p.x + (Math.random() - .5) * 200, p.y + (Math.random() - .5) * 160, 66, d.atk * 1.8, '#ffb36b', .85, 1.6);
        }
        this.audio.sfx('fire');
        this.shake(5, .3);
        break;
      }
      case 'furia': {
        p.attackBuff = 8;
        this.particles.push(...Particle.burst(p.x, p.y - 26, 30, '#ffb36b', { speed: 150, size: 2.8, life: .9 }));
        this.audio.sfx('levelup');
        this.toast('Furia del Alba: ataque y velocidad aumentados', 'gold');
        break;
      }
      case 'paso': {
        p.dodgeTime = .26;
        p.invuln = .7;
        this.state.mp = Math.min(d.maxMp, this.state.mp + 20);
        this.particles.push(...Particle.burst(p.x, p.y - 20, 18, '#a68bff', { speed: 130, size: 2.4, life: .6 }));
        this.audio.sfx('dodge');
        break;
      }
      default: break;
    }
  }

  creatureAssist(c, target) {
    if (!c || !target) return;
    const def = CREATURES[c.id];
    if (!def) return;
    const el = ELEMENTS[def.element] || ELEMENTS.light;
    const charm = c.charm ? ITEMS[c.charm]?.charm : null;
    if (def.ability === 'heal') {
      const healed = this.player.heal(8 + c.level * 1.3);
      this.addDamage(this.player.x, this.player.y - 48, `+${healed}`, el.color, 13);
      this.particles.push(...Particle.burst(this.player.x, this.player.y - 22, 12, el.color, { speed: 70, size: 2, life: .6 }));
      this.audio.sfx('heal');
      return;
    }
    const ang = Math.atan2(target.y - (this.player.y - 26), target.x - this.player.x);
    const dmg = def.base.atk + c.level * 1.4 + (charm?.atk || 0);
    this.projectiles.push(new Projectile(this, {
      x: this.player.x + Math.cos(ang) * 18,
      y: this.player.y - 26 + Math.sin(ang) * 18,
      vx: Math.cos(ang) * 380, vy: Math.sin(ang) * 380,
      damage: dmg, owner: 'player', color: el.color, life: 1.4, radius: 6,
      kind: 'creature',
    }));
    this.particles.push(...Particle.burst(this.player.x, this.player.y - 26, 8, el.color, { speed: 80, size: 2, life: .45 }));
    this.audio.sfx('magic');
  }

  spawnEnemyProjectile(x, y, vx, vy, damage, color, radius = 6) {
    this.projectiles.push(new Projectile(this, {
      x, y, vx, vy, damage, owner: 'enemy', color, radius, life: 3, kind: 'enemy',
    }));
  }

  addHazard(x, y, radius, damage, color, warn = .8, active = 2) {
    this.hazards.push(new Hazard(this, x, y, radius, damage, color, warn, active));
  }

  addDamage(x, y, text, color = '#fff', size = 16) {
    if (!this.settings.damage) return;
    this.damageNumbers.push(new DamageNumber(x, y, text, color, size));
  }

  shake(amount, dur = .2) {
    if (!this.settings.shake) return;
    this.shakeMag = Math.max(this.shakeMag, amount);
    this.shakeTime = Math.max(this.shakeTime, dur);
    this.shakeDur = Math.max(this.shakeDur || 0, dur);
  }

  hitstop(dur) { this.hitstopTimer = Math.max(this.hitstopTimer, dur); }

  /* ---------------------------------------------------------------------- */
  /* Rewards, capture & death                                               */
  /* ---------------------------------------------------------------------- */
  onEnemyDeath(enemy) {
    if (enemy._rewarded) return;
    enemy._rewarded = true;
    const def = enemy.def;
    this.state.kills++;
    const gold = def.gold[0] + Math.floor(Math.random() * (def.gold[1] - def.gold[0] + 1));
    this.state.gold += gold;
    this.addXp(enemy.xp);
    const loot = [];
    for (const drop of def.drops || []) {
      if (Math.random() > drop.chance) continue;
      if (ITEMS[drop.id]?.type === 'key') continue;
      this.grantItem(drop.id, 1);
      loot.push(`${ITEMS[drop.id]?.name || drop.id}`);
    }
    if (loot.length) this.toast(`Botín: ${loot.join(', ')}`, 'gold');
    this.particles.push(...Particle.burst(enemy.x, enemy.y - def.height * .5, 10, '#ffd98a', { speed: 100, size: 2, life: .6 }));
    this.audio.sfx('coin');

    if (enemy.type === 'gelatina') this.addQuestProgress('q1');
    if (enemy.type === 'lobo') this.addQuestProgress('sq_wolves');

    if (enemy.boss) this.onBossDeath(enemy);
  }

  onBossDeath(enemy) {
    this.state.bossKills++;
    this.state.flags[`boss:${enemy.id}`] = true;
    if (enemy.id === 'boss_ruinas') {
      this.addQuestProgress('q2');
      this.toast('El Guardián cayó. La Runa de Aethel es accesible.', 'gold');
    }
    if (enemy.id === 'boss_final') {
      this.completeQuest('q3');
      this.state.flags.game_complete = true;
      this.grantItem('espada_celestial', 1);
      this.toast('Has obtenido la Espada Celestial', 'gold');
      this.equipItem('espada_celestial');
      this.boss = null;
      this.mode = 'victory';
      this.quickOpen = false;
      this.audio.playMusic('temple');
      this.audio.sfx('quest');
      this.ui.showVictory(this.state);
      this.saveAuto(true);
      return;
    }
    this.boss = null;
    this.playZoneMusic(true);
    this.saveAuto(true);
  }

  onWildDefeated(wild) {
    this.state.flags[`wild:${wild.id}`] = 'defeated';
    this.addXp(10 + wild.level * 3);
    this.state.gold += 3 + wild.level;
    this.toast(`La ${CREATURES[wild.creature]?.name || 'criatura'} se dispersó`, '');
  }

  attemptCapture(wild) {
    if (!wild?.alive) return;
    const def = CREATURES[wild.creature];
    const ratio = wild.hp / wild.maxHp;
    if (ratio > .4) {
      this.toast('Debilítala más antes de intentar sellarla', 'bad');
      this.audio.sfx('error');
      return;
    }
    let chance = .2 + (1 - ratio) * .55 + this.derived.luck * .012;
    let crystal = null;
    if ((this.state.inventory.cristal_sello_mayor || 0) > 0) { crystal = 'cristal_sello_mayor'; chance += .65; }
    else if ((this.state.inventory.cristal_sello || 0) > 0) { crystal = 'cristal_sello'; chance += .35; }
    chance = clamp(chance, .12, .96);
    if (crystal) this.removeItem(crystal, 1);
    this.audio.sfx('magic');
    this.particles.push(...Particle.burst(wild.x, wild.y - 20, 26, def.colors[1], { speed: 120, size: 2.6, life: .9 }));
    if (Math.random() < chance) {
      wild.captured = true;
      wild.dead = true;
      wild.deathTimer = .8;
      this.state.flags[`wild:${wild.id}`] = 'captured';
      const c = newCreature(wild.creature, wild.level);
      this.state.creatures.push(c);
      if (!this.state.collection.includes(wild.creature)) this.state.collection.push(wild.creature);
      this.state.captures++;
      if (this.state.creatures.length === 1) this.state.activeCreature = 0;
      this.audio.sfx('capture');
      this.particles.push(...Particle.burst(wild.x, wild.y - 26, 40, '#ffe9a8', { speed: 180, size: 3, life: 1.1 }));
      this.toast(`¡${def.name} capturada!`, 'good');
      this.addQuestProgress('sq_capture');
      this.saveAuto(true);
    } else {
      wild.provoked = true;
      wild.attackTimer = 1.2;
      this.audio.sfx('error');
      this.toast(`${def.name} rompió el sello y escapó`, 'bad');
    }
  }

  damagePlayer(amount, x = null, y = null) {
    if (!this.player) return;
    this.player.takeDamage(amount, x, y);
  }

  playerDown() {
    if (this.mode === 'gameover' || this.mode === 'victory') return;
    this.state.deaths++;
    this.state.gold = Math.floor(this.state.gold * .9);
    this.audio.sfx('death');
    this.mode = 'gameover';
    this.quickOpen = false;
    this.ui.showGameOver(this.state);
  }

  respawn() {
    if (!this.state) return;
    const cp = this.state.checkpoint || { zone: 'aldea', x: 19.5 * T, y: 16.5 * T };
    this.state.hp = this.derived.maxHp;
    this.state.mp = this.derived.maxMp;
    this.state.stamina = this.derived.maxStamina;
    if (this.player) {
      this.player.invuln = 2.2;
      this.player.dodgeTime = 0;
      this.player.attackTime = 0;
      this.player.blocking = false;
    }
    this.loadZone(cp.zone, null, { at: { x: cp.x, y: cp.y } });
    this.mode = 'playing';
    this.ui.hideScreen();
    this.ui.syncChrome();
    this.toast('Reapareces en el santuario', 'good');
    this.playZoneMusic(true);
    this.inputGuardUntil = performance.now() + 300;
  }

  victoryContinue() {
    this.mode = 'playing';
    this.quickOpen = false;
    this.ui.hideScreen();
    this.ui.syncChrome();
    this.audio.playMusic(ZONES[this.state.zone]?.music || 'temple');
    this.toast('El reino sigue abierto para ti', 'good');
  }

  /* ---------------------------------------------------------------------- */
  /* Rendering                                                              */
  /* ---------------------------------------------------------------------- */
  render(dt) {
    const ctx = this.ctx;
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    if (this.mode === 'title' || this.mode === 'creation' || this.mode === 'boot' || !this.state || !this.world.map) {
      this.renderTitleScene(dt);
      return;
    }
    this.renderWorld(ctx);
    this.renderScreenVignette(ctx);
  }

  renderWorld(ctx) {
    const cam = this.camera;
    let sx = 0, sy = 0;
    if (this.shakeTime > 0 && this.settings.shake) {
      const p = Math.max(0, this.shakeTime / Math.max(.001, this.shakeDur || .2));
      sx = (Math.random() - .5) * this.shakeMag * 2 * p;
      sy = (Math.random() - .5) * this.shakeMag * 2 * p;
    }
    ctx.save();
    ctx.translate(-cam.x + sx, -cam.y + sy);

    ctx.drawImage(this.world.groundCanvas, 0, 0);
    this.world.renderWater(ctx, cam);

    for (const h of this.hazards) h.render(ctx);

    const list = this.world.getDrawables(cam, this.getAbilities());
    for (const e of this.enemies) {
      if (e.dead && e.deathTimer <= 0) continue;
      list.push({ sortY: e.y + e.radius, draw: c => e.render(c) });
    }
    for (const w of this.wilds) {
      if (w.dead && w.deathTimer <= 0) continue;
      list.push({ sortY: w.y + 8, draw: c => w.render(c) });
    }
    if (this.player) list.push({ sortY: this.player.y + 6, draw: c => this.player.render(c) });
    list.sort((a, b) => a.sortY - b.sortY);
    for (const d of list) d.draw(ctx);

    for (const p of this.projectiles) p.render(ctx);
    for (const s of this.slashes) {
      const prog = 1 - s.life / s.maxLife;
      drawSlash(ctx, s.x, s.y, s.angle, s.radius, prog, s.color, s.arc);
    }
    for (const p of this.particles) p.render(ctx);

    this.renderLighting(ctx, cam);
    this.world.renderWeather(ctx, cam);
    for (const d of this.damageNumbers) d.render(ctx);

    ctx.restore();
  }

  renderLighting(ctx, cam) {
    const dark = ZONES[this.state.zone]?.dark || 0;
    if (dark > .02) {
      ctx.save();
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = `rgba(3,6,15,${dark})`;
      ctx.fillRect(cam.x - 80, cam.y - 80, cam.w + 160, cam.h + 160);
      ctx.globalCompositeOperation = 'lighter';
      const lights = this.world.lights.slice();
      if (this.player) lights.push({ x: this.player.x, y: this.player.y - 18, r: 150, color: '#ffe6b0', intensity: .55 });
      for (const l of lights) {
        if (l.x < cam.x - l.r || l.x > cam.x + cam.w + l.r || l.y < cam.y - l.r || l.y > cam.y + cam.h + l.r) continue;
        const flicker = .86 + Math.sin(this.time * 4.6 + l.x * .013) * .14;
        const g = ctx.createRadialGradient(l.x, l.y, 2, l.x, l.y, l.r);
        g.addColorStop(0, hexA(l.color, .2 * (l.intensity || .6) * flicker));
        g.addColorStop(.45, hexA(l.color, .09 * (l.intensity || .6) * flicker));
        g.addColorStop(1, 'transparent');
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(l.x, l.y, l.r, 0, 6.28); ctx.fill();
      }
      ctx.restore();
    }
  }

  renderScreenVignette(ctx) {
    const w = this.viewW, h = this.viewH;
    const vg = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * .34, w / 2, h / 2, Math.max(w, h) * .76);
    vg.addColorStop(0, 'transparent');
    vg.addColorStop(1, 'rgba(2,4,10,.42)');
    ctx.fillStyle = vg; ctx.fillRect(0, 0, w, h);
    if (this.state && this.mode === 'playing') {
      const hpPct = this.state.hp / Math.max(1, this.derived.maxHp);
      if (hpPct < .28) {
        const pulse = .18 + Math.sin(this.time * 5) * .07;
        const rg = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * .28, w / 2, h / 2, Math.max(w, h) * .7);
        rg.addColorStop(0, 'transparent');
        rg.addColorStop(1, `rgba(190,30,60,${pulse})`);
        ctx.fillStyle = rg; ctx.fillRect(0, 0, w, h);
      }
    }
  }
}
