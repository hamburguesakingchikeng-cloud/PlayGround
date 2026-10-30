// Orquestación del juego: mundo, combate, misiones, cámara, guardado y bucle principal.
import { TILE, WORLD_PX_W, WORLD_PX_H, World } from './world.js';
import { Player, Enemy, Projectile, Companion, LootOrb, Hazard } from './entities.js';
import { drawHero, drawEnemy, drawCompanion, drawProjectile } from './render.js';
import { Effects } from './effects.js';
import { AudioEngine } from './audio.js';
import { Input } from './input.js';
import { UI } from './ui.js';
import { useConsumable } from './ui-panels.js';
import { loadSettings, saveSettings, writeSave, readSave, latestSaveSlot, listSaves } from './save.js';
import { QUEST_DATA, DIFFICULTIES, SHOP_STOCK, SKILLS, CREATURES, BOSSES, getItem } from './data.js';
import { TAU, clamp, dist, lerp, rgba } from './utils.js';

const saveFlags = () => ({ chests: {}, lilies: {}, pickups: {}, gateOpen: false });
const saveQuests = () => ({ main: 0, lirios: 0, forja: 0, nino: 0 });
const BOSS_TYPES = {
  alfa_ceniza: 'lobo',
  matriarca_petrea: 'escarabajo',
  rey_espectro: 'espectro',
  guardian: 'guardian'
};

export class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { alpha: false });
    this.settings = loadSettings();
    this.difficultyName = DIFFICULTIES[this.settings.difficulty]?.name || 'Aventura';
    this.state = 'title';
    this.world = new World();
    this.world.time = 60 * 0.62;
    this.audio = new AudioEngine();
    this.audio.setVolumes(this.settings);
    this.input = new Input(this);
    this.ui = new UI(this);
    this.effects = new Effects(this);
    this.camera = { x: TILE * 19, y: TILE * 52, shake: 0 };
    this.titleCam = { x: TILE * 19, y: TILE * 52, shake: 0 };
    this.player = null;
    this.enemies = [];
    this.projectiles = [];
    this.hazards = [];
    this.loot = [];
    this.companion = null;
    this.timers = [];
    this.packStates = new Map();
    this.bossSpawned = new Set();
    this.specialSpawned = new Set();
    this.flags = saveFlags();
    this.quests = saveQuests();
    this.questData = QUEST_DATA;
    this.currentZone = null;
    this.currentBoss = null;
    this.interaction = null;
    this.zoneId = null;
    this.slot = null;
    this.checkpoint = { x: TILE * 16, y: TILE * 56 };
    this.playtime = 0;
    this.kills = 0;
    this.elapsed = 0;
    this.titleTime = 0;
    this.hitstop = 0;
    this.flash = 0;
    this.deathFade = 0;
    this.autoTimer = 0;
    this.hudTimer = 0;
    this.promptTimer = 0;
    this.titleFocus = 0;
    this.fps = 60;
    this.lastFrame = 0;
    this.running = false;
    this.skillName = SKILLS.corte_celestial.name;
    this.creatureName = 'Sin criatura';
    this.resize();
    this.bindEvents();
    this.ui.applySettings();
    this.ui.showTitle(true);
    this.ui.showHud(false);
    this.audio.setTrack('title');
    this.audio.setVolumes(this.settings);
  }

  bindEvents() {
    window.addEventListener('resize', () => this.resize());
    window.addEventListener('orientationchange', () => setTimeout(() => this.resize(), 180));
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && this.state === 'playing') this.openPause();
    });
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.lastFrame = performance.now();
    this.input.attach();
    if (this.settings.tilt) this.input.enableTilt(false);
    const loop = now => {
      const raw = (now - this.lastFrame) / 1000;
      this.lastFrame = now;
      const dt = clamp(raw || 0.016, 0.0001, 0.05);
      this.fps = lerp(this.fps, 1 / dt, 0.08);
      this.tick(dt);
      this.render();
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  resize() {
    const w = Math.max(1, window.innerWidth);
    const h = Math.max(1, window.innerHeight);
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    this.width = w;
    this.height = h;
    this.dpr = dpr;
    this.canvas.width = Math.round(w * dpr);
    this.canvas.height = Math.round(h * dpr);
    this.zoom = clamp(Math.min(w / 980, h / 560), 0.85, 1.65);
    if (this.player) this.snapCamera();
  }

  // ---------------------------------- Bucle ----------------------------------
  tick(dt) {
    this.elapsed += dt;
    this.input.update();
    this.ui.tick(dt);
    this.ui.update(this.elapsed);

    if (this.state === 'dialogue') this.ui.updateDialogueInput(this.input);
    this.handleGlobalInput();

    if (this.state === 'title') {
      this.updateTitle(dt);
      this.handleTitleInput();
    } else if (this.state === 'creation' || this.state === 'prologue') {
      this.updateTitle(dt);
    } else if (this.state === 'playing') {
      this.updateTimers(dt);
      this.updatePlaying(dt);
    } else if (this.state === 'dying') {
      this.updateTimers(dt);
      this.updateDying(dt);
    } else {
      this.flash = Math.max(0, this.flash - dt * 2.5);
    }
  }

  updateTitle(dt) {
    this.titleTime += dt;
    this.world.time += dt * 0.65;
    this.titleCam.x = TILE * 19 + Math.sin(this.titleTime * 0.055) * TILE * 3.4;
    this.titleCam.y = TILE * 51 + Math.cos(this.titleTime * 0.042) * TILE * 2.2;
    this.titleCam.shake = 0;
  }

  updatePlaying(dt) {
    this.playtime += dt;
    this.world.time += dt;
    this.autoTimer += dt;
    this.flash = Math.max(0, this.flash - dt * 3);
    this.camera.shake = Math.max(0, this.camera.shake - dt * 26);

    if (this.hitstop > 0) {
      this.hitstop = Math.max(0, this.hitstop - dt);
      this.effects.update(dt * 0.35);
      this.updateCamera(dt);
      this.updateHud(dt);
      return;
    }

    this.handleCombatInput();
    this.player.update(dt, this);
    if (this.state !== 'playing') {
      this.effects.update(dt);
      this.updateHud(dt);
      return;
    }

    this.updateSpawns(dt);

    for (const e of this.enemies) {
      e.update(dt, this);
      if (this.state !== 'playing') break;
    }
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      if (this.enemies[i].remove) this.enemies.splice(i, 1);
    }

    for (const p of this.projectiles) p.update(dt);
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      if (this.projectiles[i].dead) this.projectiles.splice(i, 1);
    }
    for (const h of this.hazards) h.update(dt);
    for (let i = this.hazards.length - 1; i >= 0; i--) {
      if (this.hazards[i].remove) this.hazards.splice(i, 1);
    }
    for (const orb of this.loot) orb.update(dt);
    for (let i = this.loot.length - 1; i >= 0; i--) {
      if (this.loot[i].collected) this.loot.splice(i, 1);
    }

    if (this.companion) {
      this.companion.update(dt);
      if (this.companion.dead) this.companion = null;
    }

    if (!this.currentBoss) {
      const boss = this.enemies.find(e => e.boss && !e.dead && dist(e.x, e.y, this.player.x, this.player.y) < 640);
      if (boss) this.triggerBoss(boss);
    }

    this.effects.update(dt);
    this.updateCamera(dt);
    this.updateZone();
    this.promptTimer += dt;
    if (this.promptTimer > 0.11) {
      this.promptTimer = 0;
      this.updatePrompt();
    }
    this.updateHud(dt);

    if (this.autoTimer > 42) {
      this.autoTimer = 0;
      const danger = this.currentBoss || this.enemies.some(e => !e.dead && e.aggro && dist(e.x, e.y, this.player.x, this.player.y) < 760);
      if (!danger) this.autosave();
    }
  }

  updateDying(dt) {
    this.deathFade += dt;
    this.world.time += dt * 0.35;
    this.flash = Math.max(0, this.flash - dt * 2);
    this.camera.shake = Math.max(0, this.camera.shake - dt * 18);
    this.effects.update(dt * 0.55);
    this.updateCamera(dt);
  }

  updateTimers(dt) {
    for (let i = this.timers.length - 1; i >= 0; i--) {
      const entry = this.timers[i];
      entry.time -= dt;
      if (entry.time <= 0) {
        this.timers.splice(i, 1);
        try { entry.fn(); } catch (error) { console.warn(error); }
      }
    }
  }

  schedule(delay, fn) {
    this.timers.push({ time: Math.max(0, delay), fn });
  }

  // -------------------------------- Entrada ---------------------------------
  handleGlobalInput() {
    if (!this.input.pressed('pause')) return;
    if (this.state === 'playing') this.openPause();
    else if (this.state === 'paused' || this.state === 'shop') this.ui.closeOverlay();
    else if (this.state === 'title' && this.ui.overlay) this.ui.closeOverlay();
  }

  handleTitleInput() {
    if (this.ui.overlay) return;
    const buttons = [...document.querySelectorAll('[data-title-action]')].filter(button => !button.disabled);
    if (!buttons.length) return;
    if (this.input.pressed('down') || this.input.pressed('right')) {
      this.titleFocus = (this.titleFocus + 1) % buttons.length;
      buttons[this.titleFocus].focus();
      this.audio.sfx('select', { volume: 0.35 });
    }
    if (this.input.pressed('up') || this.input.pressed('left')) {
      this.titleFocus = (this.titleFocus - 1 + buttons.length) % buttons.length;
      buttons[this.titleFocus].focus();
      this.audio.sfx('select', { volume: 0.35 });
    }
    if (this.input.pressed('interact') || this.input.pressed('attack')) {
      const focused = document.activeElement && document.activeElement.matches?.('[data-title-action]')
        ? document.activeElement : buttons[Math.min(this.titleFocus, buttons.length - 1)];
      focused?.click();
    }
  }

  handleCombatInput() {
    const p = this.player;
    const input = this.input;
    if (input.pressed('attack')) p.tryAttack(this);
    if (input.pressed('skill')) p.trySkill(this);
    if (input.pressed('dodge') && !p.shield) p.tryDodge(this);
    if (input.pressed('interact')) this.interact();
    if (input.pressed('switchWeapon')) this.switchWeapon();
    if (input.pressed('creature')) this.creatureAction();
    if (input.pressed('potion')) this.quickUse('pocion_vida');
    if (input.pressed('mana')) this.quickUse('pocion_mana');
    if (input.pressed('resist')) this.quickUse('tonico_resistencia');
    if (input.pressed('map')) this.openPause('map');
    if (input.pressed('select')) this.openPause('inventory');
  }

  // ------------------------------- Flujo de juego -------------------------------
  startNewFlow() {
    if (this.state === 'creation') return;
    this.ui.closeOverlay({ silent: true });
    this.state = 'creation';
    this.ui.showTitle(false);
    this.ui.showHud(false);
    this.ui.setPrompt(null);
    this.ui.openCreation(result => {
      if (!result || result.cancel) {
        this.state = 'title';
        this.ui.showTitle(true);
        this.ui.showHud(false);
        return;
      }
      this.settings.difficulty = result.difficulty || 'normal';
      saveSettings(this.settings);
      this.difficultyName = DIFFICULTIES[this.settings.difficulty]?.name || 'Aventura';
      const player = new Player(this, {
        name: result.name,
        appearance: result.appearance,
        weapon: result.weapon,
        x: TILE * 16,
        y: TILE * 56
      });
      this.player = player;
      const empty = listSaves().find(save => save.empty);
      this.slot = empty ? empty.slot : 1;
      this.flags = saveFlags();
      this.quests = saveQuests();
      this.playtime = 0;
      this.kills = 0;
      this.checkpoint = { x: player.x, y: player.y };
      this.resetScene();
      this.state = 'prologue';
      this.ui.showHud(false);
      this.ui.showPrologue(() => this.startAdventure());
    });
  }

  startAdventure() {
    if (!this.player) return;
    this.state = 'playing';
    this.ui.showTitle(false);
    this.ui.showHud(true);
    this.ui.applySettings();
    this.ui.showHud(true);
    this.ui.setPrompt(null);
    const zone = this.world.getZone(this.player.x, this.player.y);
    this.currentZone = zone;
    this.zoneId = zone.id;
    this.ui.setArea(zone, 'Capítulo I');
    this.audio.setTrack(zone.music, true);
    this.ui.updateHUD(this, 0.1);
    this.ui.toast('Misión principal', 'Habla con la Anciana Lyss en la plaza de Vado Lirio.', 'info', 4600);
    this.autosave();
  }

  continueGame() {
    const slot = latestSaveSlot();
    if (!slot) {
      this.toast('Sin partidas', 'Inicia una nueva aventura o guarda en un cristal.', 'info', 3200);
      return;
    }
    if (!this.loadSlot(slot)) this.toast('No se pudo cargar', 'La partida guardada está incompleta.', 'warning', 3400);
  }

  returnToTitle() {
    this.state = 'title';
    this.titleFocus = 0;
    this.ui.closeOverlay({ silent: true });
    if (this.ui.dialogue) {
      this.ui.dialogue = null;
      this.ui.el.dialogue.classList.add('hidden');
      this.ui.el.dialogueChoices.innerHTML = '';
    }
    this.ui.setPrompt(null);
    this.ui.showTitle(true);
    this.ui.showHud(false);
    this.audio.setTrack('title', true);
    this.camera.shake = 0;
    this.currentBoss = null;
    this.updateSaveNoteSafe();
  }

  updateSaveNoteSafe() {
    try { this.ui.updateSaveNote(); } catch (error) { console.warn(error); }
  }

  openPause(active = null) {
    if (this.state !== 'playing') return;
    this.state = 'paused';
    this.ui.setPrompt(null);
    this.ui.openPause(active);
  }

  resume() {
    if (this.state !== 'paused' && this.state !== 'shop') return;
    this.state = 'playing';
    this.ui.setPrompt(null);
    this.ui.showHud(true);
    this.ui.layoutTouch();
    this.input.clearAll();
  }

  togglePause() {
    if (this.state === 'playing') this.openPause();
    else if (this.state === 'paused' || this.state === 'shop') this.ui.closeOverlay();
  }

  openShop(vendor) {
    this.state = 'shop';
    this.ui.setPrompt(null);
    this.ui.openShop(vendor, SHOP_STOCK[vendor] || [], { onClose: () => this.resume() });
  }

  openSavesAtCrystal(object) {
    this.checkpoint = { x: object.x, y: object.y + 54 };
    this.state = 'paused';
    this.ui.setPrompt(null);
    this.audio.sfx('save', { volume: 0.5 });
    this.ui.openSaves({ mode: 'save', onClose: () => this.resume() });
  }

  setDifficulty(value) {
    this.settings.difficulty = value;
    this.difficultyName = DIFFICULTIES[value]?.name || 'Aventura';
    this.ui.updateHUD(this, 0.1);
  }

  applySettings() {
    this.audio.setVolumes(this.settings);
    if (this.settings.tilt && !this.input.tilt.enabled) this.input.enableTilt(false);
    if (!this.settings.tilt && this.input.tilt.enabled) this.input.disableTilt();
    this.ui.applySettings();
  }

  // --------------------------------- Escena ---------------------------------
  resetScene() {
    this.enemies = [];
    this.projectiles = [];
    this.hazards = [];
    this.loot = [];
    this.companion = null;
    this.timers = [];
    this.effects = new Effects(this);
    this.packStates = new Map();
    for (const pack of this.world.enemyPacks) {
      this.packStates.set(pack.id, { state: 'idle', timer: 0, members: [] });
    }
    this.bossSpawned.clear();
    this.specialSpawned.clear();
    this.currentBoss = null;
    this.hitstop = 0;
    this.flash = 0;
    this.deathFade = 0;
    this.autoTimer = 0;
    this.hudTimer = 0;
    this.promptTimer = 0;
    this.zoneId = null;
    this.currentZone = this.world.getZone(this.player.x, this.player.y);
    this.camera = { x: this.player.x, y: this.player.y, shake: 0 };
    this.snapCamera();
    this.ui.el.bossBar?.classList.add('hidden');
    this.creatureName = this.player.activeCreature ? CREATURES[this.player.activeCreature].name : 'Sin criatura';
    this.skillName = SKILLS[this.player.activeSkill]?.name || 'Sin habilidad';
  }

  snapCamera() {
    if (!this.player) return;
    this.camera.x = this.player.x + Math.cos(this.player.facing) * 26;
    this.camera.y = this.player.y - 30 + Math.sin(this.player.facing) * 18;
  }

  updateCamera(dt) {
    if (!this.player) return;
    const p = this.player;
    const look = 32;
    const targetX = p.x + Math.cos(p.facing) * look;
    const targetY = p.y - 28 + Math.sin(p.facing) * look * 0.6;
    const k = clamp(dt * 6.5, 0, 1);
    this.camera.x = lerp(this.camera.x, targetX, k);
    this.camera.y = lerp(this.camera.y, targetY, k);
  }

  computeView(cam) {
    const vw = this.width / this.zoom;
    const vh = this.height / this.zoom;
    const x = clamp(cam.x - vw / 2, 0, Math.max(0, WORLD_PX_W - vw));
    const y = clamp(cam.y - vh / 2, 0, Math.max(0, WORLD_PX_H - vh));
    return { x, y, w: vw, h: vh };
  }

  updateZone() {
    const zone = this.world.getZone(this.player.x, this.player.y);
    if (zone.id === this.zoneId) {
      this.currentZone = zone;
      return;
    }
    this.zoneId = zone.id;
    this.currentZone = zone;
    const chapter = zone.id === 'celestial' ? 'Capítulo III' : (zone.id === 'ruins' || zone.id === 'quarry') ? 'Capítulo II' : 'Capítulo I';
    this.ui.setArea(zone, chapter);
    if (!this.currentBoss) this.audio.setTrack(zone.music);
  }

  // -------------------------------- Guardado --------------------------------
  buildSaveData() {
    const zone = this.currentZone || this.world.getZone(this.player.x, this.player.y);
    const stage = QUEST_DATA.main.stages[Math.min(this.quests.main, QUEST_DATA.main.stages.length - 1)];
    return {
      version: 1,
      timestamp: Date.now(),
      playtime: this.playtime,
      kills: this.kills,
      difficulty: this.settings.difficulty,
      zoneName: zone.name,
      questTitle: stage.title,
      creatures: [...this.player.creatures],
      player: this.player.serialize(),
      flags: JSON.parse(JSON.stringify(this.flags)),
      quests: { ...this.quests },
      checkpoint: { ...this.checkpoint }
    };
  }

  saveToSlot(slot) {
    if (!this.player || this.state === 'title' || this.state === 'creation' || this.state === 'prologue') return false;
    const ok = writeSave(slot, this.buildSaveData());
    if (ok) {
      this.slot = slot;
      this.updateSaveNoteSafe();
      this.audio.sfx('save', { volume: 0.6 });
    }
    return ok;
  }

  autosave() {
    if (!this.player || this.slot == null) return false;
    const ok = writeSave(this.slot, this.buildSaveData());
    if (ok) this.updateSaveNoteSafe();
    return ok;
  }

  loadSlot(slot) {
    const data = readSave(slot);
    if (!data || !data.player) return false;
    try {
      this.settings.difficulty = data.difficulty || this.settings.difficulty;
      saveSettings(this.settings);
      this.difficultyName = DIFFICULTIES[this.settings.difficulty]?.name || 'Aventura';
      const player = new Player(this);
      player.hydrate(data.player);
      this.player = player;
      const f = data.flags || {};
      this.flags = { ...saveFlags(), ...f };
      this.flags.chests = { ...(f.chests || {}) };
      this.flags.lilies = { ...(f.lilies || {}) };
      this.flags.pickups = { ...(f.pickups || {}) };
      this.flags.gateOpen = !!f.gateOpen;
      this.quests = { ...saveQuests(), ...(data.quests || {}) };
      this.playtime = data.playtime || 0;
      this.kills = data.kills || 0;
      this.checkpoint = data.checkpoint || { x: player.x, y: player.y };
      this.slot = slot;
      this.resetScene();
      this.state = 'playing';
      this.ui.closeOverlay({ silent: true });
      this.ui.showTitle(false);
      this.ui.showHud(true);
      this.ui.applySettings();
      this.ui.setPrompt(null);
      const zone = this.world.getZone(player.x, player.y);
      this.currentZone = zone;
      this.zoneId = zone.id;
      this.ui.setArea(zone, zone.id === 'celestial' ? 'Capítulo III' : 'Capítulo II');
      this.audio.setTrack(zone.music, true);
      this.ui.updateHUD(this, 0.1);
      this.audio.sfx('save', { volume: 0.5 });
      return true;
    } catch (error) {
      console.warn('Partida corrupta:', error);
      return false;
    }
  }

  // ------------------------------ Combate y mundo ------------------------------
  findNearestEnemy(x, y, range = 260) {
    let best = null;
    let bestD = range;
    for (const e of this.enemies) {
      if (e.dead) continue;
      const d = dist(x, y, e.x, e.y);
      if (d < bestD) { bestD = d; best = e; }
    }
    return best;
  }

  spawnProjectile(options) {
    const projectile = new Projectile(this, options);
    this.projectiles.push(projectile);
    return projectile;
  }

  spawnEnemy(type, x, y, options = {}) {
    const enemy = new Enemy(this, type, x, y, options);
    this.enemies.push(enemy);
    return enemy;
  }

  damageEnemy(enemy, amount, options = {}) {
    if (!enemy || enemy.dead) return 0;
    const damage = enemy.receiveDamage(amount, options);
    if (damage > 0) {
      this.effects.damage(enemy.x, enemy.y - (enemy.boss ? 74 : 38), damage, options.crit, options.element);
      if (!enemy.dead && options.hitType !== 'melee' && Math.random() < 0.42) {
        this.audio.sfx(options.crit ? 'crit' : 'hit', { volume: 0.5 });
      }
    }
    return damage;
  }

  addHazard(options) {
    const hazard = new Hazard(this, options);
    this.hazards.push(hazard);
    return hazard;
  }

  toast(title, text = '', type = 'info', duration = 3200) {
    this.ui.toast(title, text, type, duration);
  }

  onBossPhase(boss, phase) {
    const numeral = ['', 'I', 'II', 'III'][phase] || 'I';
    this.toast(boss.name, `La fase ${numeral} despierta. El aire cambia.`, 'danger', 4200);
    this.audio.sfx('boss', { volume: 0.85 });
    this.camera.shake = Math.max(this.camera.shake, 12);
    this.ui.flash('rgba(184,140,255,.24)');
  }

  onEnemyDeath(enemy) {
    if (enemy.rewarded) return;
    enemy.rewarded = true;
    this.kills++;
    const def = enemy.def;
    const diff = DIFFICULTIES[this.settings.difficulty] || DIFFICULTIES.normal;
    const xp = Math.max(1, Math.round((def.xp || 10) * diff.xp * (enemy.elite ? 1.7 : 1)));
    this.player.gainXp(xp);

    if (enemy.boss) {
      this.currentBoss = null;
      if (enemy.spawnRef) this.flags[enemy.spawnRef.flag] = true;
      if (enemy.type === 'guardian' || enemy.bossId === 'guardian') this.flags.guardian = true;
      this.effects.burst(enemy.x, enemy.y - 30, def.accent || '#ffe0a8', 46, { minSpeed: 50, maxSpeed: 240, maxLife: 1.3 });
      this.effects.ring(enemy.x, enemy.y, enemy.radius * 4, '#ffe6a8', 8, 1.1, 20);
      this.camera.shake = Math.max(this.camera.shake, 16);
      this.ui.flash('rgba(255,230,170,.3)');
      this.audio.sfx('boss', { volume: 0.9 });
      this.toast(enemy.name, 'El sello se rompe. Una luz antigua queda libre.', 'success', 5000);
      // Los objetos únicos del jefe se entregan de inmediato para no perderlos.
      for (const [id, chance, qty] of def.drops || []) {
        if (Math.random() <= chance) {
          const item = getItem(id);
          this.player.addItem(id, qty);
          this.toast(item?.name || id, qty > 1 ? `×${qty}` : 'Reliquia recuperada', 'loot', 4200);
        }
      }
      for (let i = 0; i < 4; i++) {
        const orb = new LootOrb(this, enemy.x + (Math.random() - 0.5) * 80, enemy.y - 20, 'lumens', Math.max(1, Math.round((def.lumens || 40) / 4)));
        this.loot.push(orb);
      }
      this.syncQuest();
      const zone = this.world.getZone(this.player.x, this.player.y);
      if (zone.id !== 'celestial') this.audio.setTrack(zone.music);
      this.autosave();
      if (enemy.type === 'guardian' || enemy.bossId === 'guardian') {
        this.schedule(2.2, () => this.victory());
      }
      return;
    }

    if (enemy.type === 'fenix_salvaje' && enemy.special) this.flags.fenix = true;
    for (const [id, chance, qty] of def.drops || []) {
      if (Math.random() <= chance) {
        const amount = qty || 1;
        this.loot.push(new LootOrb(this, enemy.x + (Math.random() - 0.5) * 24, enemy.y - 18, id, amount));
      }
    }
    const lumens = Math.max(1, Math.round((def.lumens || 6) * (0.65 + Math.random() * 0.7)));
    this.loot.push(new LootOrb(this, enemy.x, enemy.y - 12, 'lumens', lumens));
    if (Math.random() < 0.5) {
      this.loot.push(new LootOrb(this, enemy.x + (Math.random() - 0.5) * 26, enemy.y - 16, 'xp', Math.max(2, Math.round(xp * 0.3))));
    }
    this.effects.burst(enemy.x, enemy.y - 20, def.accent || '#ffe0a8', 18, { minSpeed: 30, maxSpeed: 170, maxLife: 0.8 });
    this.audio.sfx('die', { volume: 0.45 });
    this.syncQuest();
  }

  onPlayerDeath() {
    if (this.state === 'dying' || this.state === 'gameover') return;
    this.state = 'dying';
    this.deathFade = 0;
    this.ui.setPrompt(null);
    this.companion = null;
    this.camera.shake = Math.max(this.camera.shake, 10);
    this.ui.flash('rgba(160,30,45,.34)');
    this.audio.setTrack('ruins', true);
    this.schedule(1.45, () => {
      if (this.state !== 'dying') return;
      this.presentGameOver();
    });
  }

  presentGameOver() {
    this.state = 'gameover';
    this.audio.setTrack('title', true);
    this.ui.showGameOver(
      { kills: this.kills, playtime: this.playtime },
      {
        onRetry: () => this.retry(),
        onLoad: () => this.openLoadFromGameOver(),
        onTitle: () => this.returnToTitle()
      }
    );
  }

  openLoadFromGameOver() {
    this.state = 'gameover';
    this.ui.openSaves({
      mode: 'load',
      fromTitle: true,
      onClose: () => { if (this.state !== 'playing') this.presentGameOver(); }
    });
  }

  retry() {
    const p = this.player;
    if (!p) return;
    this.ui.closeOverlay({ silent: true });
    this.state = 'playing';
    this.deathFade = 0;
    this.hitstop = 0;
    this.flash = 0;
    this.projectiles = [];
    this.hazards = [];
    this.currentBoss = null;
    this.companion = null;
    p.dead = false;
    p.state = 'idle';
    p.hp = p.stats.maxHp;
    p.mp = p.stats.maxMp;
    p.stamina = p.stats.maxStamina;
    p.invuln = 2.2;
    p.hurtTimer = 0;
    p.attackTimer = 0;
    p.attackCd = 0;
    p.dodgeTimer = 0;
    p.blocking = false;
    p.combo = 0;
    p.comboTimer = 0;
    p.x = clamp(this.checkpoint.x, 32, WORLD_PX_W - 32);
    p.y = clamp(this.checkpoint.y, 32, WORLD_PX_H - 32);
    p.facing = -Math.PI / 2;
    p.fx = 0; p.fy = -1;
    for (const e of this.enemies) {
      if (e.dead) continue;
      e.hp = e.maxHp;
      e.aggro = false;
      e.state = 'idle';
      e.windup = 0;
      e.dashTimer = 0;
      e.recovery = 0;
      e.stagger = 0;
      e.phase = 1;
      e.enraged = false;
      e.x = e.spawnX;
      e.y = e.spawnY;
    }
    this.snapCamera();
    this.ui.closeOverlay({ silent: true });
    this.ui.showTitle(false);
    this.ui.showHud(true);
    this.ui.applySettings();
    this.ui.setPrompt(null);
    const zone = this.world.getZone(p.x, p.y);
    this.currentZone = zone;
    this.zoneId = zone.id;
    this.ui.setArea(zone, 'Un nuevo intento');
    this.audio.setTrack(zone.music, true);
    this.ui.updateHUD(this, 0.1);
    this.toast('La luz regresa', 'Despiertas junto a tu último cristal de guardado.', 'success', 3600);
  }

  victory() {
    if (this.state === 'ending') return;
    const p = this.player;
    this.state = 'ending';
    this.quests.main = 4;
    this.flags.guardian = true;
    this.audio.setTrack('ending', true);
    this.audio.sfx('seal', { volume: 0.9 });
    p.addItem('espada_celestial', 1);
    this.autosave();
    this.ui.showEnding(
      { kills: this.kills, playtime: this.playtime },
      {
        onContinue: () => {
          this.state = 'playing';
          this.ui.showTitle(false);
          this.ui.showHud(true);
          const zone = this.world.getZone(p.x, p.y);
          this.currentZone = zone;
          this.zoneId = zone.id;
          this.audio.setTrack(zone.music, true);
          this.toast('El reino sigue abierto', 'La Espada Celestial descansa en tu inventario.', 'success', 4200);
        },
        onTitle: () => this.returnToTitle()
      }
    );
  }

  // --------------------------------- Spawns ---------------------------------
  updateSpawns(dt) {
    const p = this.player;
    for (const pack of this.world.enemyPacks) {
      const state = this.packStates.get(pack.id);
      if (!state) continue;
      if (state.state === 'idle') {
        const spawn = pack.members[0];
        if (dist(p.x, p.y, spawn.x, spawn.y) < 1120) {
          state.state = 'alive';
          state.members = [];
          for (const member of pack.members) {
            const enemy = this.spawnEnemy(member.type, member.x, member.y, { elite: !!pack.elite });
            enemy.packId = pack.id;
            state.members.push(enemy);
          }
        }
      } else if (state.state === 'alive') {
        if (state.members.length && state.members.every(e => e.dead || e.remove)) {
          state.state = 'cooldown';
          state.timer = pack.respawn || 50;
          state.members = [];
        }
      } else if (state.state === 'cooldown') {
        state.timer -= dt;
        if (state.timer <= 0) state.state = 'idle';
      }
    }

    for (const spawn of this.world.bossSpawns) {
      if (this.flags[spawn.flag]) continue;
      if (spawn.final && !this.flags.gateOpen) continue;
      if (this.bossSpawned.has(spawn.id)) continue;
      if (dist(p.x, p.y, spawn.x, spawn.y) > 680) continue;
      const type = BOSS_TYPES[spawn.boss] || 'lobo';
      const boss = this.spawnEnemy(type, spawn.x, spawn.y, { bossId: spawn.boss });
      boss.spawnRef = spawn;
      this.bossSpawned.add(spawn.id);
      this.triggerBoss(boss);
    }

    if (!this.flags.fenix && !this.specialSpawned.has('fenix')) {
      const fx = TILE * 71.5;
      const fy = TILE * 33.2;
      if (dist(p.x, p.y, fx, fy) < 700) {
        const fenix = this.spawnEnemy('fenix_salvaje', fx, fy, {});
        fenix.special = 'fenix';
        this.specialSpawned.add('fenix');
        this.toast('Fénix de Brasa', 'Una chispa eterna vigila las ruinas.', 'warning', 4000);
        this.audio.sfx('magic', { volume: 0.7 });
      }
    }
  }

  triggerBoss(boss) {
    this.currentBoss = boss;
    this.audio.setTrack('boss', true);
    this.audio.sfx('boss', { volume: 0.7 });
    this.camera.shake = Math.max(this.camera.shake, 7);
    this.toast(boss.name, boss.title || 'Un poder antiguo despierta', 'danger', 4600);
    this.ui.flash('rgba(160,100,220,.2)');
  }

  // ------------------------------- Interacción -------------------------------
  updatePrompt() {
    const found = this.findInteraction();
    this.interaction = found;
    this.ui.setPrompt(found ? found.label : null);
  }

  findInteraction() {
    if (!this.player || this.player.dead) return null;
    const p = this.player;
    let best = null;
    const consider = (kind, target, x, y, range, label, priority = 0) => {
      const d = dist(p.x, p.y, x, y);
      if (d > range) return;
      const score = d - priority;
      if (!best || score < best.score) best = { kind, target, label, score, distance: d };
    };

    for (const npc of this.world.npcs) {
      consider('npc', npc, npc.x, npc.y, 88, `Hablar con ${npc.name}`, 8);
    }

    for (const object of this.world.interactables) {
      if (object.type === 'chest' && this.flags.chests[object.id]) continue;
      if (object.type === 'lily' && this.flags.lilies[object.id]) continue;
      if (object.type === 'pickup' && this.flags.pickups[object.id]) continue;
      const labels = {
        chest: 'Abrir cofre antiguo',
        crystal: 'Guardar en el cristal',
        lily: 'Recoger Lirio Lunar',
        pickup: `Recoger ${getItem(object.item)?.name || 'objeto'}`,
        lore: 'Leer la inscripción',
        shrine: 'Descansar en el Altar de la Luna'
      };
      const label = labels[object.type];
      if (!label) continue;
      const range = object.type === 'lore' || object.type === 'shrine' ? 82 : 68;
      consider('object', object, object.x, object.y, range, label);
    }

    if (!this.flags.gateOpen) {
      const barrier = this.world.objects.find(o => o.type === 'barrier');
      if (barrier) consider('gate', barrier, barrier.x, barrier.y, 142, 'Abrir la Puerta Celestial', 18);
    }

    for (const enemy of this.enemies) {
      if (!enemy.canCapture()) continue;
      consider('capture', enemy, enemy.x, enemy.y, 98, `Sellar ${enemy.name}`, 5);
    }
    return best;
  }

  interact() {
    const found = this.findInteraction();
    this.interaction = found;
    if (!found) return;
    if (found.kind === 'npc') {
      this.talkTo(found.target);
    } else if (found.kind === 'capture') {
      this.captureEnemy(found.target);
    } else if (found.kind === 'gate') {
      this.tryOpenGate();
    } else if (found.kind === 'object') {
      this.useInteractable(found.target);
    }
  }

  useInteractable(object) {
    const p = this.player;
    switch (object.type) {
      case 'chest': {
        if (this.flags.chests[object.id]) { this.toast('Cofre vacío', 'Alguien ya se llevó lo que brillaba.', 'info', 2200); return; }
        this.flags.chests[object.id] = true;
        this.audio.sfx('chest', { volume: 0.8 });
        this.effects.burst(object.x, object.y - 22, '#ffe3a0', 24, { minSpeed: 30, maxSpeed: 150, maxLife: 0.8 });
        this.effects.ring(object.x, object.y, 52, '#ffe6a0', 4, 0.6);
        this.ui.flash('rgba(255,225,150,.16)');
        for (const [id, qty] of object.loot || []) {
          const item = getItem(id);
          p.addItem(id, qty);
          this.toast(item?.name || id, qty > 1 ? `×${qty}` : 'Objeto encontrado', 'loot', 3800);
        }
        this.autosave();
        break;
      }
      case 'lily': {
        if (this.flags.lilies[object.id]) return;
        this.flags.lilies[object.id] = true;
        p.addItem('lirio_lunar', 1);
        this.effects.heal(object.x, object.y - 16, 18);
        this.audio.sfx('pickup', { volume: 0.55 });
        this.toast('Lirio Lunar', 'Una flor que solo abre cuando nadie la mira.', 'loot', 3000);
        if (this.quests.lirios === 0) {
          this.quests.lirios = 1;
          this.questToast('Flores para los que no duermen', 'Lleva 3 Lirios Lunares a Mira en Vado Lirio.');
        } else {
          this.toast('Progreso de Mira', `${Math.min(3, p.countItem('lirio_lunar'))} / 3 Lirios Lunares.`, 'info', 2400);
        }
        this.autosave();
        break;
      }
      case 'pickup': {
        if (this.flags.pickups[object.id]) return;
        this.flags.pickups[object.id] = true;
        p.addItem(object.item, 1);
        const item = getItem(object.item);
        this.audio.sfx('pickup', { volume: 0.65 });
        this.effects.burst(object.x, object.y - 18, '#ffe3a0', 16, { minSpeed: 20, maxSpeed: 100, maxLife: 0.7 });
        this.toast(item?.name || 'Objeto', 'Encontrado entre los helechos.', 'loot', 3200);
        if (object.item === 'espada_madera' && this.quests.nino < 2) {
          this.quests.nino = Math.max(this.quests.nino, 1);
          this.questToast('La espada de juguete', 'Devuelve la Espada de Madera a Nilo.');
        }
        this.autosave();
        break;
      }
      case 'crystal':
        this.openSavesAtCrystal(object);
        break;
      case 'shrine': {
        p.hp = p.stats.maxHp;
        p.mp = p.stats.maxMp;
        p.stamina = p.stats.maxStamina;
        this.effects.heal(p.x, p.y - 20, 36);
        this.effects.ring(object.x, object.y, 90, '#bcecff', 5, 1.1, 10);
        this.checkpoint = { x: object.x, y: object.y + 56 };
        this.audio.sfx('heal', { volume: 0.9 });
        this.toast('Altar de la Luna', 'La luz te devuelve el aliento. Punto de retorno actualizado.', 'success', 4000);
        this.autosave();
        break;
      }
      case 'lore': {
        this.state = 'dialogue';
        this.ui.setPrompt(null);
        this.ui.say([{ name: object.title || 'Inscripción', role: 'narrator', text: object.text || '' }]);
        this.audio.sfx('seal', { volume: 0.4 });
        break;
      }
    }
  }

  tryOpenGate() {
    const seals = this.sealCount();
    if (seals < 3) {
      this.toast('La barrera resiste', `Faltan sellos: ${seals} / 3. Bosque, Piedra y Vacío.`, 'warning', 4200);
      this.audio.sfx('fail', { volume: 0.55 });
      return;
    }
    this.flags.gateOpen = true;
    this.quests.main = 3;
    this.audio.sfx('gate', { volume: 1 });
    this.ui.flash('rgba(255,240,190,.42)');
    this.camera.shake = Math.max(this.camera.shake, 14);
    this.effects.ring(TILE * 44, TILE * 15.7, 220, '#ffe8a8', 9, 1.6, 20);
    this.effects.burst(TILE * 44, TILE * 15.7 - 30, '#fff0b8', 40, { minSpeed: 60, maxSpeed: 260, maxLife: 1.4 });
    this.toast('La Puerta Celestial', 'Los tres sellos cantan a la vez. El cielo vuelve a estar abierto.', 'success', 5600);
    this.questToast(QUEST_DATA.main.stages[3].title, QUEST_DATA.main.stages[3].desc);
    this.autosave();
  }

  captureEnemy(enemy) {
    if (!enemy || enemy.dead) return;
    const p = this.player;
    if (p.countItem('sello_vinculo') <= 0) {
      this.toast('Sin Sello de Vínculo', 'Compra uno a Tilo o encuentra un cofre antes de intentarlo.', 'warning', 3600);
      this.audio.sfx('fail', { volume: 0.5 });
      return;
    }
    p.removeItem('sello_vinculo', 1);
    const creatureId = enemy.def.captureCreature;
    enemy.dead = true;
    enemy.remove = true;
    enemy.rewarded = true;
    if (creatureId) {
      if (!p.creatures.includes(creatureId)) {
        p.creatures.push(creatureId);
        if (!p.activeCreature) {
          p.activeCreature = creatureId;
          p.recomputeStats(true);
        }
        this.toast('Vínculo sellado', `${CREATURES[creatureId]?.name || enemy.name} se une a ti.`, 'success', 4600);
      } else {
        p.lumens += 60;
        this.toast('Vínculo repetido', 'La criatura ya te acompaña. Recibes 60 lumenes.', 'loot', 3400);
      }
      if (creatureId === 'fenix_brasa') this.flags.fenix = true;
    }
    p.gainXp(20);
    this.effects.ring(enemy.x, enemy.y, 100, '#bff4ff', 6, 0.9, 12);
    this.effects.burst(enemy.x, enemy.y - 20, '#bff4ff', 30, { minSpeed: 40, maxSpeed: 180, maxLife: 1 });
    this.audio.sfx('capture', { volume: 0.9 });
    this.autosave();
  }

  sealCount() {
    return ['sello_bosque', 'sello_piedra', 'sello_espectro'].filter(id => this.player.countItem(id) > 0).length;
  }

  questToast(title, text) {
    this.toast('Misión actualizada', text || title, 'success', 4600);
    this.audio.sfx('quest', { volume: 0.65 });
  }

  syncQuest() {
    const before = this.quests.main;
    if (this.sealCount() >= 3 && this.quests.main < 2) this.quests.main = 2;
    if (this.flags.gateOpen && this.quests.main < 3) this.quests.main = 3;
    if (this.flags.guardian && this.quests.main < 4) this.quests.main = 4;
    if (this.quests.main !== before) {
      const stage = QUEST_DATA.main.stages[Math.min(this.quests.main, QUEST_DATA.main.stages.length - 1)];
      this.toast('Misión principal', stage.title, 'success', 4800);
      this.audio.sfx('quest', { volume: 0.65 });
      this.autosave();
    }
  }

  // -------------------------------- Criaturas --------------------------------
  creatureAction() {
    const p = this.player;
    if (!p || !p.activeCreature) {
      this.toast('Sin criatura', 'Debilita a una bestia y usa un Sello de Vínculo con Y.', 'info', 3200);
      return;
    }
    if (p.creatureCooldown > 0) {
      this.toast('Vínculo en recarga', `Podrás invocarla de nuevo en ${Math.ceil(p.creatureCooldown)} s.`, 'info', 2600);
      return;
    }
    if (this.companion) {
      this.companion.useAbility();
      this.effects.ring(this.companion.x, this.companion.y, 60, '#d8fff0', 4, 0.6);
      this.companion.dead = true;
      this.companion = null;
      p.creatureCooldown = Math.max(8, p.creatureCooldown);
      this.audio.sfx('confirm', { volume: 0.6 });
      return;
    }
    this.companion = new Companion(this, p.activeCreature);
    p.creatureCooldown = p.maxCreatureCooldown;
    this.creatureName = CREATURES[p.activeCreature]?.name || 'Criatura';
    this.effects.ring(p.x, p.y, 70, '#bff4ff', 4, 0.7, 8);
    this.audio.sfx('capture', { volume: 0.55 });
    this.toast(this.creatureName, 'Acude a tu lado. Pulsa R de nuevo para usar su habilidad.', 'success', 3200);
  }

  // -------------------------------- Objetos ---------------------------------
  switchWeapon() {
    const p = this.player;
    const ids = [...new Set([p.equipment.weapon, ...Object.keys(p.inventory)])]
      .filter(id => getItem(id)?.type === 'weapon');
    if (ids.length <= 1) {
      this.toast('Sin otra arma', 'Encuentra o compra otra arma para cambiar de estilo.', 'info', 2600);
      return;
    }
    const index = Math.max(0, ids.indexOf(p.equipment.weapon));
    const next = ids[(index + 1) % ids.length];
    p.equipment.weapon = next;
    p.recomputeStats(true);
    this.audio.sfx('confirm', { volume: 0.6 });
    this.toast('Arma equipada', p.weapon?.name || next, 'success', 2200);
  }

  quickUse(itemId) {
    const item = getItem(itemId);
    const p = this.player;
    if (!item || !p) return;
    if (p.countItem(itemId) <= 0) {
      this.toast('Sin objetos', `No te queda ${item.name}.`, 'warning', 2400);
      return;
    }
    if (useConsumable(this.ui, this, item)) {
      this.audio.sfx('heal', { volume: 0.65 });
      this.ui.updateHUD(this, 0.1);
    }
  }

  // -------------------------------- Diálogos --------------------------------
  startDialogue(pages, onEnd = null) {
    this.state = 'dialogue';
    this.ui.setPrompt(null);
    this.ui.say(pages, { onEnd });
  }

  onDialogueClosed() {
    if (this.state === 'dialogue') this.state = 'playing';
  }

  talkTo(npc) {
    const p = this.player;
    switch (npc.id) {
      case 'elder': {
        if (this.quests.main === 0) {
          this.startDialogue([
            { name: 'Anciana Lyss', role: 'elder', text: 'Así que al fin has venido. El cielo lleva tres noches crujiendo como una viga vieja, y yo ya no tengo manos para sostenerlo.' },
            { name: 'Anciana Lyss', role: 'elder', text: 'Los tres Sellos del Alba se han roto. Uno duerme bajo el bosque, otro en la cantera y el último entre las ruinas de Aethel. Sin ellos, la Puerta Celestial seguirá cerrada.' },
            { name: 'Anciana Lyss', role: 'elder', text: 'No te pido que seas un héroe. Te pido que vuelvas. Eso es todo lo que Lumen necesita de ti.', instant: false }
          ], () => {
            this.quests.main = 1;
            this.questToast(QUEST_DATA.main.stages[1].title, 'Recupera los tres Sellos del Alba: Bosque, Piedra y Vacío.');
            this.autosave();
          });
        } else if (this.quests.main === 1) {
          const count = this.sealCount();
          this.startDialogue([
            { name: 'Anciana Lyss', role: 'elder', text: count === 0 ? 'El bosque susurra tu nombre, pero aún no has traído ninguna prueba. Empieza por el Alfa de Ceniza.' : `Sellos recuperados: ${count} de 3. El cielo aún espera.` },
            { name: 'Anciana Lyss', role: 'elder', text: 'El Alfa aúlla en el claro del bosque. La Matriarca duerme bajo la cantera. El Rey Espectro reina entre las ruinas. Escucha antes de golpear.' }
          ]);
        } else if (this.quests.main === 2) {
          this.startDialogue([
            { name: 'Anciana Lyss', role: 'elder', text: 'Los tres sellos laten en tu bolsa. Sube al norte, al antiguo camino. La Puerta reconocerá su luz.' },
            { name: 'Anciana Lyss', role: 'elder', text: 'Y si el Guardián aún está allí… no le guardes rencor. El Vacío le robó el nombre mucho antes de que tú nacieras.' }
          ]);
        } else if (this.quests.main === 3) {
          this.startDialogue([
            { name: 'Anciana Lyss', role: 'elder', text: 'La puerta está abierta. Ahora solo queda el último centinela. Lleva contigo algo que merezca ser protegido.' }
          ]);
        } else {
          this.startDialogue([
            { name: 'Anciana Lyss', role: 'elder', text: 'Amanece, y el reino sigue aquí. No sé si los dioses lo entenderán, pero yo sí: elegiste volver.' }
          ]);
        }
        break;
      }
      case 'mira': {
        const lilies = p.countItem('lirio_lunar');
        if (this.quests.lirios === 0) {
          this.startDialogue([
            { name: 'Mira', role: 'healer', text: 'Lyss dice que el bosque está inquieto. Yo solo sé que mis pacientes no duermen. Necesito Lirios Lunares para un remedio.' },
            { name: 'Mira', role: 'healer', text: 'Crecen en el claro de las lilas, donde el sendero se vuelve musgo. Tráeme tres, ¿sí?' }
          ], () => {
            this.quests.lirios = 1;
            this.questToast(QUEST_DATA.lirios.stages[1].title, 'La sanadora necesita 3 Lirios Lunares del bosque.');
            this.autosave();
          });
        } else if (this.quests.lirios === 1 && lilies >= 3) {
          this.startDialogue([
            { name: 'Mira', role: 'healer', text: 'Tres lirios. Huelen a lluvia limpia. Déjame ver…' },
            { name: 'Mira', role: 'healer', text: 'Toma este amuleto. Lo hice con la primera flor que abrió esta primavera. No dejes que las pesadillas te encuentren despierto.' }
          ], () => {
            p.removeItem('lirio_lunar', 3);
            p.addItem('amuleto_lunar', 1);
            this.quests.lirios = 2;
            this.effects.heal(p.x, p.y - 20, 24);
            this.audio.sfx('heal', { volume: 0.8 });
            this.toast('Amuleto Lunar', 'Mira ha completado su remedio. Ahora puedes equiparlo.', 'success', 4200);
            this.questToast(QUEST_DATA.lirios.stages[2].title, QUEST_DATA.lirios.stages[2].desc);
            this.autosave();
          });
        } else if (this.quests.lirios === 1) {
          this.startDialogue([
            { name: 'Mira', role: 'healer', text: `Te faltan ${3 - lilies} Lirios Lunares. Busca el claro del bosque, al este del camino. Las flores brillan incluso de noche.` }
          ]);
        } else {
          this.startDialogue([
            { name: 'Mira', role: 'healer', text: 'El amuleto te queda bien. Si alguna vez vuelves con el corazón roto, aquí habrá té y una cama.' }
          ]);
        }
        break;
      }
      case 'bran': {
        const cores = p.countItem('nucleo_piedra');
        if (this.quests.forja === 0) {
          this.startDialogue([
            { name: 'Bran', role: 'smith', text: 'La forja está fría desde que los escarabajos se llevaron el mineral bueno. Tres Núcleos de Piedra y volveré a golpear el acero como es debido.' },
            { name: 'Bran', role: 'smith', text: 'Los encontrarás en la cantera, al sureste. Cuanto más grande el caparazón, más puro el corazón. Y más feo el humor.' }
          ], () => {
            this.quests.forja = 1;
            this.questToast(QUEST_DATA.forja.stages[1].title, 'Bran necesita 3 Núcleos de Piedra de los escarabajos de la cantera.');
            this.autosave();
          });
        } else if (this.quests.forja === 1 && cores >= 3) {
          this.startDialogue([
            { name: 'Bran', role: 'smith', text: 'Tres núcleos. Bien. Esto vuelve a calentar hasta el hierro viejo.' },
            { name: 'Bran', role: 'smith', text: 'No hago milagros, pero sí armas honestas. Toma estos lumenes y no me rompas nada que no pueda arreglar.' }
          ], () => {
            p.removeItem('nucleo_piedra', 3);
            p.lumens += 280;
            p.addItem('pocion_vida', 2);
            this.quests.forja = 2;
            this.audio.sfx('coin', { volume: 0.8 });
            this.toast('Forja reavivada', '+280 lumenes · 2 Pociones de Vida', 'loot', 4000);
            this.questToast(QUEST_DATA.forja.stages[2].title, QUEST_DATA.forja.stages[2].desc);
            this.autosave();
          });
        } else if (this.quests.forja === 1) {
          this.startDialogue([
            { name: 'Bran', role: 'smith', text: `Núcleos: ${cores} de 3. La cantera está al sureste, pasando el lago. No te caigas en un agujero.` }
          ]);
        } else {
          this.startDialogue([
            { name: 'Bran', role: 'smith', text: 'La forja ruge otra vez. Si necesitas acero, ya sabes dónde encontrarme. Si necesitas consejo, cobro lo mismo.' }
          ]);
        }
        break;
      }
      case 'tilo':
        this.startDialogue([
          { name: 'Tilo', role: 'merchant', text: '¡Ah, el héroe del alba! Tengo pociones, acero y algún que otro secreto a buen precio.' },
          {
            name: 'Tilo', role: 'merchant', text: '¿Qué te llevas hoy?',
            choices: [
              { label: 'Ver mercancía', hint: 'Comprar y vender', action: () => this.openShop('tilo') },
              { label: 'Despedirse', hint: 'Volver al camino' }
            ]
          }
        ]);
        break;
      case 'bran':
        break;
      case 'nilo': {
        if (this.quests.nino === 0) {
          this.startDialogue([
            { name: 'Nilo', role: 'child', text: 'Mi espada de madera se cayó entre los helechos. Era la capitana de la guardia, ¿sabes? Sin ella no puedo proteger la plaza.' },
            { name: 'Nilo', role: 'child', text: 'Está cerca del claro de las lilas. Si la encuentras, te dejo ser mi lugarteniente.' }
          ], () => {
            this.quests.nino = 1;
            this.questToast(QUEST_DATA.nino.stages[1].title, 'Nilo perdió su espada de madera en el bosque, cerca del claro de las lilas.');
            this.autosave();
          });
        } else if (this.quests.nino === 1 && p.countItem('espada_madera') > 0) {
          this.startDialogue([
            { name: 'Nilo', role: 'child', text: '¡La encontraste! Tiene la muesca de la sonrisa. Ahora sí puedo defender la plaza de los dragones.' },
            { name: 'Nilo', role: 'child', text: 'Toma, es todo lo que tengo. Y un consejo: los dragones odian que les mires a los ojos.' }
          ], () => {
            p.removeItem('espada_madera', 1);
            p.lumens += 120;
            p.addItem('pocion_vida', 2);
            this.quests.nino = 2;
            this.audio.sfx('coin', { volume: 0.7 });
            this.toast('La espada de juguete', '+120 lumenes · 2 Pociones de Vida', 'loot', 3800);
            this.questToast(QUEST_DATA.nino.stages[2].title, QUEST_DATA.nino.stages[2].desc);
            this.autosave();
          });
        } else if (this.quests.nino === 1) {
          this.startDialogue([
            { name: 'Nilo', role: 'child', text: '¿La has visto? Es de madera, con una muesca. Brilla un poquito cuando la luna está alta. O eso creo.' }
          ]);
        } else {
          this.startDialogue([
            { name: 'Nilo', role: 'child', text: 'La guardia está lista. Tú eres lugarteniente. Yo pongo las capas y tú las espadas de verdad.' }
          ]);
        }
        break;
      }
      case 'guard': {
        const seals = this.sealCount();
        if (this.flags.gateOpen && !this.flags.guardBlessing) {
          this.flags.guardBlessing = true;
          p.addItem('elixir_alba', 1);
          this.startDialogue([
            { name: 'Celador Orin', role: 'guard', text: 'Has abierto la puerta. Yo llevo treinta años mirándola sin saber si sería capaz.' },
            { name: 'Celador Orin', role: 'guard', text: 'Lleva este elixir. No es valor, pero se le parece cuando la noche aprieta. El Guardián espera arriba.' }
          ], () => {
            this.toast('Elixir del Alba', 'El celador te entrega un amanecer embotellado.', 'loot', 4000);
            this.autosave();
          });
        } else if (this.flags.gateOpen) {
          this.startDialogue([
            { name: 'Celador Orin', role: 'guard', text: 'El Guardián está arriba, en el santuario. No le tengas miedo a la espada. Témele a lo que recuerda.' }
          ]);
        } else if (seals >= 3) {
          this.startDialogue([
            { name: 'Celador Orin', role: 'guard', text: 'Tres sellos. Entonces es verdad. La barrera cederá si apoyas la luz en ella. Yo cubriré tu espalda desde aquí.' }
          ]);
        } else {
          this.startDialogue([
            { name: 'Celador Orin', role: 'guard', text: `La Puerta Celestial sigue cerrada. Sellos: ${seals} de 3. El bosque, la cantera y las ruinas guardan lo que falta.` },
            { name: 'Celador Orin', role: 'guard', text: 'No cruces la barrera sin ellos. No es una advertencia de viejo. Es una advertencia de quien ha visto lo que hay detrás.' }
          ]);
        }
        break;
      }
    }
  }

  // -------------------------------- Render ---------------------------------
  render() {
    if (!this.width || this.width !== window.innerWidth || this.height !== window.innerHeight) this.resize();
    const ctx = this.ctx;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = '#070b12';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    const scenic = this.state === 'title' || this.state === 'creation' || this.state === 'prologue';
    const cam = scenic ? this.titleCam : this.camera;
    const view = this.computeView(cam);
    const shake = (this.settings.shake || 0) * (this.settings.reduceMotion ? 0.25 : 1);
    const sx = cam.shake && shake ? (Math.random() - 0.5) * cam.shake * shake : 0;
    const sy = cam.shake && shake ? (Math.random() - 0.5) * cam.shake * shake : 0;
    ctx.setTransform(this.dpr * this.zoom, 0, 0, this.dpr * this.zoom, (-view.x + sx) * this.dpr * this.zoom, (-view.y + sy) * this.dpr * this.zoom);

    this.renderWorld(ctx, view, !scenic);

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.drawScreenAtmosphere(ctx);
    if (this.flash > 0.001) {
      ctx.fillStyle = `rgba(255,235,180,${clamp(this.flash, 0, 0.55)})`;
      ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }

  renderWorld(ctx, view, showPlayer) {
    this.world.drawTerrain(ctx, this, view);
    this.drawHazards(ctx, view);
    if (showPlayer) this.drawTelegraphs(ctx, view);

    const drawables = [];
    const visible = (x, y, pad = 180) => x > view.x - pad && x < view.x + view.w + pad && y > view.y - pad && y < view.y + view.h + pad;

    for (const object of this.world.objects) {
      if (!visible(object.x, object.y, 210)) continue;
      drawables.push({ y: object.y, draw: () => this.world.drawObject(ctx, object, this, this.world.time) });
    }
    for (const npc of this.world.npcs) {
      if (!visible(npc.x, npc.y, 120)) continue;
      drawables.push({ y: npc.y, draw: () => this.world.drawNpc(ctx, npc, this, this.world.time) });
    }
    for (const enemy of this.enemies) {
      if (!visible(enemy.x, enemy.y, 190)) continue;
      const alpha = enemy.dead ? clamp(enemy.deathTimer / (enemy.boss ? 1.8 : 0.55), 0, 1) : 1;
      drawables.push({
        y: enemy.y,
        draw: () => {
          ctx.save();
          ctx.globalAlpha = alpha;
          if (enemy.boss && !enemy.dead) this.drawBossAura(ctx, enemy);
          drawEnemy(ctx, enemy, this, this.world.time);
          ctx.restore();
          if (!enemy.dead) this.drawEnemyStatus(ctx, enemy);
        }
      });
    }
    for (const orb of this.loot) {
      if (!visible(orb.x, orb.y, 60)) continue;
      drawables.push({ y: orb.y, draw: () => this.drawLoot(ctx, orb) });
    }
    if (this.companion) {
      const c = this.companion;
      drawables.push({ y: c.y, draw: () => drawCompanion(ctx, c, this.world.time) });
    }
    if (showPlayer && this.player) {
      const p = this.player;
      drawables.push({
        y: p.y,
        draw: () => {
          ctx.save();
          if (p.dead) ctx.globalAlpha = clamp(1 - this.deathFade * 0.7, 0.18, 1);
          this.renderPlayerAt(ctx, {});
          ctx.restore();
        }
      });
    }
    drawables.sort((a, b) => a.y - b.y);
    for (const item of drawables) item.draw();

    for (const projectile of this.projectiles) {
      if (!visible(projectile.x, projectile.y, 80)) continue;
      drawProjectile(ctx, projectile, this.world.time);
    }

    this.effects.drawWorld(ctx, 'all');
  }

  renderHero(ctx, data) {
    drawHero(ctx, data);
  }

  renderPlayerAt(ctx, override = {}) {
    if (!this.player) return;
    const data = Object.assign(this.player.getRenderData(), override);
    drawHero(ctx, data);
  }

  drawBossAura(ctx, enemy) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const radius = (enemy.radius || 30) * 2.5;
    const grad = ctx.createRadialGradient(enemy.x, enemy.y - 20, 4, enemy.x, enemy.y - 20, radius);
    const color = enemy.def?.accent || '#d0b3ff';
    grad.addColorStop(0, rgba(color, 0.16));
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(enemy.x, enemy.y - 20, radius, 0, TAU);
    ctx.fill();
    ctx.restore();
  }

  drawEnemyStatus(ctx, enemy) {
    const y = enemy.y - (enemy.draw === 'guardian' ? 132 : enemy.draw === 'fenix' ? 60 : 52) * (enemy.visualScale || 1);
    if (enemy.hp < enemy.maxHp && !enemy.boss) {
      const w = 34;
      ctx.save();
      ctx.fillStyle = 'rgba(6,8,14,.7)';
      ctx.fillRect(enemy.x - w / 2, y, w, 4);
      ctx.fillStyle = enemy.elite ? '#f0c76b' : '#d86b66';
      ctx.fillRect(enemy.x - w / 2, y, w * clamp(enemy.hp / enemy.maxHp, 0, 1), 4);
      ctx.restore();
    }
    if (enemy.canCapture()) {
      const t = this.world.time;
      const pulse = 0.55 + Math.sin(t * 5) * 0.25;
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = pulse;
      ctx.strokeStyle = '#aef4ff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(enemy.x, enemy.y + 2, 24 + Math.sin(t * 4) * 3, 9, 0, 0, TAU);
      ctx.stroke();
      ctx.fillStyle = '#dffcff';
      ctx.font = 'bold 9px Lato, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Y', enemy.x, enemy.y - 62);
      ctx.restore();
    }
  }

  drawTelegraphs(ctx, view) {
    for (const enemy of this.enemies) {
      if (enemy.dead || enemy.windup <= 0) continue;
      if (enemy.x < view.x - 120 || enemy.x > view.x + view.w + 120 || enemy.y < view.y - 120 || enemy.y > view.y + view.h + 120) continue;
      const progress = clamp(1 - enemy.windup / (enemy.windupMax || 1), 0, 1);
      const radius = enemy.pending === 'dash' || enemy.pending === 'charge' ? 112 :
        enemy.pending === 'ranged' ? 90 : Math.max(54, (enemy.def.attackRange || 54) * 1.1);
      ctx.save();
      ctx.globalAlpha = 0.12 + progress * 0.32;
      ctx.fillStyle = enemy.def.element === 'shadow' ? '#b78cff' : enemy.def.accent || '#ffb08a';
      ctx.beginPath();
      ctx.ellipse(enemy.x, enemy.y, radius, radius * 0.36, 0, 0, TAU);
      ctx.fill();
      ctx.globalAlpha = 0.3 + progress * 0.55;
      ctx.strokeStyle = ctx.fillStyle;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(enemy.x, enemy.y, radius * progress, radius * 0.36 * progress, 0, 0, TAU);
      ctx.stroke();
      ctx.restore();
    }
  }

  drawHazards(ctx, view) {
    for (const hazard of this.hazards) {
      if (hazard.x < view.x - 100 || hazard.x > view.x + view.w + 100 || hazard.y < view.y - 100 || hazard.y > view.y + view.h + 100) continue;
      const progress = clamp(1 - hazard.delay / hazard.maxDelay, 0, 1);
      ctx.save();
      ctx.globalAlpha = 0.14 + progress * 0.38;
      ctx.fillStyle = hazard.color;
      ctx.beginPath();
      ctx.ellipse(hazard.x, hazard.y, hazard.radius, hazard.radius * 0.46, 0, 0, TAU);
      ctx.fill();
      ctx.globalAlpha = 0.4 + progress * 0.5;
      ctx.strokeStyle = hazard.color;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.ellipse(hazard.x, hazard.y, hazard.radius * Math.max(0.18, progress), hazard.radius * 0.46 * Math.max(0.18, progress), 0, 0, TAU);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(hazard.x - 6, hazard.y);
      ctx.lineTo(hazard.x + 6, hazard.y);
      ctx.moveTo(hazard.x, hazard.y - 6);
      ctx.lineTo(hazard.x, hazard.y + 6);
      ctx.stroke();
      ctx.restore();
    }
  }

  drawLoot(ctx, orb) {
    const t = this.world.time;
    const bob = Math.sin(t * 4 + orb.bob) * 4;
    const color = orb.item === 'lumens' ? '#ffd76b' : orb.item === 'xp' ? '#a9e8ff' :
      (getItem(orb.item)?.rarity === 4 ? '#ffe9a1' : getItem(orb.item)?.rarity === 3 ? '#d9b0ff' : '#d8f7ff');
    ctx.save();
    ctx.translate(orb.x, orb.y + bob);
    ctx.globalCompositeOperation = 'lighter';
    const glow = ctx.createRadialGradient(0, 0, 1, 0, 0, 20);
    glow.addColorStop(0, color);
    glow.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.globalAlpha = 0.55;
    ctx.fillStyle = glow;
    ctx.beginPath(); ctx.arc(0, 0, 20, 0, TAU); ctx.fill();
    ctx.globalAlpha = 0.95;
    ctx.translate(0, -4);
    ctx.rotate(Math.PI / 4);
    ctx.fillStyle = color;
    ctx.fillRect(-3.5, -3.5, 7, 7);
    ctx.restore();
  }

  drawScreenAtmosphere(ctx) {
    if (this.state === 'title' || this.state === 'creation' || this.state === 'prologue') return;
    const cycle = (this.world.time / 60) % 1;
    const night = 0.08 + 0.12 * (0.5 + 0.5 * Math.cos(cycle * TAU));
    const zone = this.currentZone || this.world.getZone(this.player?.x || 0, this.player?.y || 0);
    ctx.save();
    ctx.fillStyle = rgba(zone?.tint || '#30404a', 0.05);
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    ctx.fillStyle = `rgba(8,12,26,${night})`;
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    ctx.restore();
  }

  updateHud(dt) {
    this.hudTimer += dt;
    if (this.hudTimer < 0.07) return;
    const step = this.hudTimer;
    this.hudTimer = 0;
    if (this.player) {
      this.skillName = SKILLS[this.player.activeSkill]?.name || 'Sin habilidad';
      this.creatureName = this.player.activeCreature ? CREATURES[this.player.activeCreature].name : 'Sin criatura';
    }
    this.ui.updateHUD(this, step);
  }
}
