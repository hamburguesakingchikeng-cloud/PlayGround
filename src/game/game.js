import { clamp, dist, angleTo, norm, rand, chance, lerp } from '../core/utils.js';
import { getRegion, TILE, tileAt, tileSolidAt, canStand, TERRAIN } from '../world/regions.js';
import { drawTerrain, drawWaterGlow } from '../art/terrain.js';
import { drawEnvironment, drawShrines, drawStones, glow, shadow } from '../art/props.js';
import { drawPlayer, drawNPC, drawEnemy, drawCreature } from '../art/characters.js';
import { Player } from './player.js';
import { Enemy, Projectile, SwordWave, Companion } from './entities.js';
import { CREATURES } from '../data/creatures.js';
import { ITEMS } from '../data/items.js';
import { ENEMIES, BOSS_INTROS } from '../data/enemies.js';
import { QUESTS, NPCS, CUTSCENES, dialogueFor } from '../data/story.js';
import { Camera } from './camera.js';
import { Effects } from './effects.js';
import { writeSave } from '../core/save.js';

const TRAVEL_POINTS = {
  valdoria: {
    start: { x: 24 * TILE, y: 61 * TILE },
    plaza: { x: 46 * TILE, y: 48 * TILE },
    bosque: { x: 38 * TILE, y: 72 * TILE },
  },
  drakmor: {
    start: { x: 25 * TILE, y: 66 * TILE },
    brasa: { x: 25 * TILE, y: 66 * TILE },
    forja: { x: 49 * TILE, y: 23 * TILE },
  },
  kansordore: {
    start: { x: 30 * TILE, y: 62 * TILE },
    archivo: { x: 30 * TILE, y: 58 * TILE },
    cumbre: { x: 44 * TILE, y: 22 * TILE },
  }
};

const BOSS_FLAGS = {
  guardian_espectral: 'guardian_defeated',
  kael: 'kael_defeated',
  malachar: 'malachar_defeated',
  coro_absoluto: 'coro_defeated'
};

const BOSS_QUEST = {
  guardian_espectral: 'm2',
  kael: 'm3',
  malachar: 'm4',
  coro_absoluto: 'm6'
};

export class Game {
  constructor(opts) {
    this.canvas = opts.canvas;
    this.ctx = this.canvas.getContext('2d', { alpha: false });
    this.audio = opts.audio;
    this.input = opts.input;
    this.ui = opts.ui;
    this.settings = opts.settings || {};
    this.onExitToTitle = opts.onExitToTitle || (() => {});
    this.saveData = opts.save || null;
    this.regionId = this.saveData?.regionId || 'valdoria';
    this.player = this.saveData?.player
      ? Player.deserialize(this.saveData.player)
      : new Player(opts.profile || {});
    this.quests = this.saveData?.quests || {};
    this.flags = this.saveData?.flags || {};
    this.regionState = this.saveData?.regionState || {};
    this.lastShrine = this.saveData?.lastShrine || null;
    this.playTime = this.saveData?.playTime || 0;
    this.fps = 60;
    this.time = 0;
    this.hudTimer = 0;
    this.autosaveTimer = 0;
    this.zoneTimer = 0;
    this.combatCheck = 0;
    this.running = false;
    this.started = false;
    this.playerDead = false;
    this.paused = false;
    this.enemies = [];
    this.projectiles = [];
    this.effects = new Effects();
    this.interaction = null;
    this.resonable = null;
    this.currentBoss = null;
    this.pointer = { x: 0, y: 0, active: false, last: -99 };
    this.hitStop = 0;
    this.bossSpawned = {};
    this.triggerCooldowns = {};
    this.spawnRuntime = {};
    this.markerTimer = 0;
    this.weather = { items: [] };
    this.ui?.setGame(this);
    this.createCamera();
    this.bindEvents();
    const sx = this.saveData?.player?.x;
    const sy = this.saveData?.player?.y;
    this.loadRegion(this.regionId, null, {
      position: (Number.isFinite(sx) && Number.isFinite(sy)) ? { x: sx, y: sy } : null,
      quiet: !!this.saveData,
    });
    if (this.player.activeCreature) this.ensureCompanion();
    this.applySettings();
  }

  createCamera() {
    this.camera = new Camera(this.viewW(), this.viewH());
  }

  viewW() { return Math.max(320, window.innerWidth || 960); }
  viewH() { return Math.max(240, window.innerHeight || 540); }

  bindEvents() {
    this._resize = () => {
      this.resize();
      this.camera?.resize(this.viewW(), this.viewH());
      this.camera?.clampToWorld();
    };
    window.addEventListener('resize', this._resize);
    window.addEventListener('orientationchange', this._resize);
    this._pointerMove = (e) => {
      if (e.pointerType && e.pointerType !== 'mouse') return;
      const r = this.canvas.getBoundingClientRect();
      this.pointer.x = e.clientX - r.left;
      this.pointer.y = e.clientY - r.top;
      this.pointer.active = true;
      this.pointer.last = performance.now();
    };
    this._pointerDown = (e) => {
      if (e.pointerType && e.pointerType !== 'mouse') return;
      if (e.button === 2) {
        this.input.actions.add('block');
        this.input.pressed.add('block');
        e.preventDefault();
      } else if (e.button === 0) {
        this.input.actions.add('attack');
        this.input.pressed.add('attack');
      }
    };
    this._pointerUp = (e) => {
      if (e.pointerType && e.pointerType !== 'mouse') return;
      if (e.button === 2) this.input.actions.delete('block');
      else if (e.button === 0) this.input.actions.delete('attack');
    };
    this._context = (e) => e.preventDefault();
    this.canvas.addEventListener('pointermove', this._pointerMove);
    this.canvas.addEventListener('pointerdown', this._pointerDown);
    window.addEventListener('pointerup', this._pointerUp);
    this.canvas.addEventListener('contextmenu', this._context);
  }

  resize() {
    const dpr = Math.min(2, window.devicePixelRatio || 1) * (this.settings.quality === 'low' ? .8 : 1);
    const w = this.viewW(), h = this.viewH();
    this.canvas.width = Math.round(w * dpr);
    this.canvas.height = Math.round(h * dpr);
    this.canvas.style.width = w + 'px';
    this.canvas.style.height = h + 'px';
    this.dpr = dpr;
  }

  applySettings() {
    const s = this.settings || {};
    this.audio.setMusicVolume(s.music ?? .55);
    this.audio.setSfxVolume(s.sfx ?? .7);
    this.audio.toggle(s.musicOn !== false || s.sfxOn !== false);
    document.body.classList.toggle('fx-lite', !!s.reduceFx);
    document.body.classList.toggle('large-text', !!s.largeText);
    this.resize();
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.started = true;
    this.lastTime = performance.now();
    this.ui?.showHud();
    this.ui?.showZone(this.region.name, this.region.subtitle);
    this.audio.playTheme(this.region.music || this.regionId);
    const loop = (ts) => {
      if (!this.running) return;
      const raw = (ts - this.lastTime) / 1000;
      this.lastTime = ts;
      const dt = Math.min(.05, Math.max(0, raw));
      this.fps = lerp(this.fps, 1 / Math.max(.001, raw), .05);
      try {
        this.update(dt);
        this.render(ts / 1000);
      } catch (err) {
        this.loopErrors = (this.loopErrors || 0) + 1;
        if (this.loopErrors <= 3) console.error('Error en el bucle del juego', err);
      }
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  stop() {
    this.running = false;
    this.started = false;
    window.removeEventListener('resize', this._resize);
    window.removeEventListener('orientationchange', this._resize);
    this.canvas.removeEventListener('pointermove', this._pointerMove);
    this.canvas.removeEventListener('pointerdown', this._pointerDown);
    window.removeEventListener('pointerup', this._pointerUp);
    this.canvas.removeEventListener('contextmenu', this._context);
    this.audio.stopMusic();
    this.ui?.hideHud();
  }

  /* ------------------------------------------------------------------ */
  /*  Región y mundo                                                     */
  /* ------------------------------------------------------------------ */

  stateFor(regionId = this.regionId) {
    if (!this.regionState[regionId]) {
      this.regionState[regionId] = { pickups: {}, stones: {}, shrines: {}, triggers: {}, bosses: {} };
    }
    const st = this.regionState[regionId];
    st.pickups ||= {}; st.stones ||= {}; st.shrines ||= {}; st.triggers ||= {}; st.bosses ||= {};
    return st;
  }

  loadRegion(regionId, spawnName = null, options = {}) {
    if (!TRAVEL_POINTS[regionId]) regionId = 'valdoria';
    this.regionId = regionId;
    this.region = getRegion(regionId);
    this.regionModule = { getRegion, TILE, tileAt, tileSolidAt, canStand, TERRAIN };
    this.state = this.stateFor(regionId);
    this.camera.setWorld(this.region.widthPx, this.region.heightPx);
    this.enemies = [];
    this.projectiles = [];
    this.effects.clear();
    this.interaction = null;
    this.resonable = null;
    this.currentBoss = null;
    this.triggerCooldowns = {};
    this.spawnRuntime = {};
    this.bossSpawned = {};
    this.ui?.setBoss(null);

    this.pickups = this.region.pickups.map(p => ({
      ...p, collected: !!this.state.pickups[p.id]
    }));
    this.npcs = this.region.npcs.map(n => ({
      ...n,
      hidden: n.hidden && !(n.id === 'kael_camp' && this.flags.kael_defeated),
      marker: false
    }));
    this.stones = this.region.interactables.filter(i => i.type === 'stone').map(i => ({
      ...i, active: !!this.state.stones[i.id]
    }));
    this.shrines = this.region.shrines.map(s => ({ ...s, discovered: !!this.state.shrines[s.id] }));

    const point = options.position
      || (typeof spawnName === 'string' && TRAVEL_POINTS[regionId][spawnName])
      || TRAVEL_POINTS[regionId].start
      || this.region.startSpawn;
    this.player.x = point.x;
    this.player.y = point.y;
    if (!canStand(this.region, this.player.x, this.player.y, this.player.radius)) {
      const fallback = this.region.startSpawn;
      this.player.x = fallback.x; this.player.y = fallback.y;
    }
    this.player.vx = 0; this.player.vy = 0;
    this.camera.snapTo(this.player.x, this.player.y);
    this.player.companion = null;
    if (this.player.activeCreature) this.ensureCompanion();

    for (const sp of this.region.spawners) {
      this.spawnRuntime[sp.id] = { respawn: sp.respawn, initialized: false };
      this.spawnFromSpawner(sp, true);
    }
    this.initWeather();
    this.updateQuestMarkers();
    this.flags[`visited_${regionId}`] = true;
    if (!options.quiet) {
      const meta = this.region;
      this.ui?.showZone(meta.name, meta.subtitle);
      this.audio.playTheme(meta.music || regionId);
      this.audio.sfx('portal');
    }
    this.applyStoryArrival(regionId);
    this.ui?.refresh();
  }

  spawnFromSpawner(sp, initial = false) {
    const count = sp.count || 2;
    for (let i = 0; i < count; i++) {
      const a = rand(0, Math.PI * 2);
      const r = rand(.8, Math.max(1.5, sp.radius / TILE * .65));
      let x = sp.x + Math.cos(a) * r * TILE;
      let y = sp.y + Math.sin(a) * r * TILE;
      if (!canStand(this.region, x, y, 18)) {
        x = sp.x + Math.cos(a) * TILE;
        y = sp.y + Math.sin(a) * TILE;
      }
      this.spawnEnemy(sp.type, x, y, { spawnerId: sp.id, elite: !initial && chance(.035) });
    }
  }

  spawnEnemy(typeId, x, y, opts = {}) {
    const data = ENEMIES[typeId];
    if (!data) return null;
    if (data.boss && this.flags[BOSS_FLAGS[typeId]]) return null;
    if (data.boss && this.enemies.some(e => !e.dead && e.typeId === typeId)) return null;
    const elite = opts.elite || (data.boss ? false : chance(.045));
    const e = new Enemy(data, x, y, { ...opts, elite, hpScale: opts.hpScale || 1 });
    e.resonanceAttempted = false;
    this.enemies.push(e);
    if (data.boss) {
      this.currentBoss = e;
      this.ui?.setBoss(e);
      this.audio.playTheme('boss');
      this.ui?.bossIntro(BOSS_INTROS[typeId] || { title: data.name, sub: data.title || '' });
      this.effects.screenFlash('#ffe0a0', .18);
    }
    return e;
  }

  /* ------------------------------------------------------------------ */
  /*  Bucle principal                                                    */
  /* ------------------------------------------------------------------ */

  update(dt) {
    const blocking = this.ui?.isBlocking?.() || false;
    // El mundo se congela tras menús, diálogos y cinemáticas.
    if (blocking || !this.started || this.playerDead) {
      this.input.endFrame();
      this.ui?.tick?.(dt);
      this.ui?.refreshHud?.();
      return;
    }
    this.time += dt;
    this.playTime += dt;
    this.hudTimer -= dt;
    this.autosaveTimer -= dt;
    if (this.autosaveTimer <= 0) {
      this.autosaveTimer = 45;
      this.save('auto', true);
    }
    if (this.zoneTimer > 0) this.zoneTimer -= dt;

    if (this.hitStop > 0) {
      this.hitStop = Math.max(0, this.hitStop - dt);
      dt *= .32;
    }

    this.handleActions();
    this.player.blocking = this.input.isDown('block') && !this.player.attackState
      && this.player.dodgeTimer <= 0 && this.player.stun <= 0 && this.player.stamina > 0;
    this.player.updateMovement(dt, this.input, this);
    this.player.update(dt, this);
    this.updateCompanion(dt);
    this.updateEnemies(dt);
    this.updateProjectiles(dt);
    this.effects.update(dt, this);
    this.updatePickups(dt);
    this.updateTriggers(dt);
    this.updateSpawners(dt);
    this.updateInteraction(dt);
    this.updateWeather(dt);
    this.camera.update(dt, this.player, this);
    this.updateMusic(dt);
    if (this.hudTimer <= 0) {
      this.hudTimer = .1;
      this.ui?.refreshHud();
    }
    this.markerTimer -= dt;
    if (this.markerTimer <= 0) { this.markerTimer = .55; this.updateQuestMarkers(); }
    this.input.endFrame();
    this.ui?.tick?.(dt);
  }

  handleActions() {
    const i = this.input;
    if (i.wasPressed('menu')) { this.ui?.openMenu('menu'); return; }
    if (i.wasPressed('journal')) { this.ui?.openMenu('quests'); return; }
    if (i.wasPressed('dodge')) this.player.tryDodge(i, this);
    if (i.wasPressed('attack')) this.player.startAttack(this);
    if (i.wasPressed('ability1')) this.player.useAbility(1, this);
    if (i.wasPressed('ability2')) this.player.useAbility(2, this);
    if (i.wasPressed('ability3')) this.player.useAbility(3, this);
    if (i.wasPressed('companion')) this.useCompanionAbility();
    if (i.wasPressed('interact')) this.interact();
    if (i.wasPressed('resonate')) this.tryResonate();
    if (i.wasPressed('item1')) this.player.usePotion('hp', this);
    if (i.wasPressed('item2')) this.player.usePotion('mana', this);
  }

  updateEnemies(dt) {
    for (const e of this.enemies) {
      if (e.dead) continue;
      if (e.state === 'dash') e.dashUpdate(dt, this);
      else e.update(dt, this);
      if (!e.boss && dist(e.x, e.y, this.player.x, this.player.y) < 26) {
        e.stuck += dt;
        if (e.stuck > 1.2) {
          e.stuck = 0;
          e.aggro = true;
        }
      }
    }
    this.enemies = this.enemies.filter(e => !e.dead);
    if (this.currentBoss?.dead) {
      this.currentBoss = null;
      this.ui?.setBoss(null);
    }
  }

  updateProjectiles(dt) {
    for (const p of this.projectiles) p.update(dt, this);
    this.projectiles = this.projectiles.filter(p => !p.dead);
  }

  updateCompanion(dt) {
    if (!this.player.activeCreature) { this.player.companion = null; return; }
    this.ensureCompanion();
    this.player.companion.update(dt, this);
  }

  ensureCompanion() {
    if (!this.player.activeCreature) { this.player.companion = null; return; }
    if (!this.player.companion || this.player.companion.dead) this.player.companion = new Companion(this.player);
  }

  updateSpawners(dt) {
    for (const sp of this.region.spawners) {
      const rt = this.spawnRuntime[sp.id] ||= { respawn: sp.respawn, initialized: true };
      const alive = this.enemies.some(e => !e.dead && e.spawnerId === sp.id);
      if (alive) { rt.respawn = sp.respawn; continue; }
      rt.respawn -= dt;
      if (rt.respawn <= 0 && dist(this.player.x, this.player.y, sp.x, sp.y) > 340) {
        this.spawnFromSpawner(sp);
        rt.respawn = sp.respawn;
      }
    }
  }

  updatePickups(dt) {
    for (const p of this.pickups) {
      if (p.collected) continue;
      p.bob = (p.bob || 0) + dt;
      if (dist(p.x, p.y, this.player.x, this.player.y) > 36) continue;
      this.collectPickup(p);
    }
  }

  collectPickup(p) {
    p.collected = true;
    this.state.pickups[p.id] = true;
    const item = ITEMS[p.item];
    this.player.addItem(p.item, p.qty || 1);
    if (p.item === 'martillo_borin') {
      this.flags.martillo_recogido = true;
      this.handleEvent('reach', 'ruinas_martillo');
    }
    if (p.item === 'eco') this.flags[`eco_pick_${p.id}`] = true;
    this.handleEvent('collect', p.item, p.qty || 1);
    this.audio.sfx(p.kind === 'chest' ? 'coin' : 'pickup');
    this.burst(p.x, p.y - 10, item?.rarity === 'legendary' ? '#ffe0a0' : '#c8f0d0', 14, 90);
    this.floatingText(p.x, p.y - 28, `+ ${item?.name || p.item}${(p.qty || 1) > 1 ? ' ×' + p.qty : ''}`, '#c8f0c0');
    if (p.kind === 'chest' || p.kind === 'quest') this.ui?.toast(`${item?.name || p.item}`, item?.rarity === 'legendary' ? 'gold' : 'creature');
    this.ui?.refresh();
  }

  updateTriggers(dt) {
    for (const key of Object.keys(this.triggerCooldowns)) {
      this.triggerCooldowns[key] -= dt;
      if (this.triggerCooldowns[key] <= 0) delete this.triggerCooldowns[key];
    }
    for (const t of this.region.triggers) {
      if (t.boss) continue;
      const cool = this.triggerCooldowns[t.id] || 0;
      if (cool > 0) continue;
      if (dist(this.player.x, this.player.y, t.x, t.y) > t.r) continue;
      this.triggerCooldowns[t.id] = 2.5;
      if (t.id === 'village_plaza') {
        this.handleEvent('reach', 'village_plaza');
      } else if (t.id === 'forja_ceniza' || t.id === 'mina' || t.id === 'archivo' || t.id === 'cumbre') {
        this.flags[`reached_${t.id}`] = true;
        this.handleEvent('reach', t.id);
      } else if (t.id === 'eco_uno' || t.id === 'eco_dos' || t.id === 'eco_tres') {
        this.flags[t.id] = true;
        this.handleEvent('reach', t.id);
        if (!this.flags[`echo_fx_${t.id}`]) {
          this.flags[`echo_fx_${t.id}`] = true;
          this.burst(t.x, t.y - 20, '#ffe8a0', 34, 160);
          this.audio.sfx('capture');
          this.ui?.toast('Un eco del Velo se une a tu memoria', 'creature');
        }
      } else if (t.id === 'ruinas_martillo') {
        if (this.flags.martillo_recogido) this.handleEvent('reach', 'ruinas_martillo');
      }
    }
    // Piedras ya activadas: si la misión llega a su paso, se resuelve sola.
    for (const stone of this.stones) {
      if (stone.active) this.handleEvent('reach', stone.id);
    }
    this.checkBossArenas(dt);
  }

  checkBossArenas(dt) {
    for (const t of this.region.triggers) {
      if (!t.boss) continue;
      const key = this.regionId + ':' + t.id;
      if (this.bossSpawned[key] || this.flags[BOSS_FLAGS[t.boss]]) continue;
      const d = dist(this.player.x, this.player.y, t.x, t.y);
      if (d > t.r + 80) continue;
      const qid = BOSS_QUEST[t.boss];
      const q = qid ? this.questState(qid) : null;
      const qd = qid ? QUESTS[qid] : null;
      const step = qd && q ? qd.steps[q.step] : null;
      if (!step || step.type !== 'boss' || step.target !== t.boss) continue;
      this.bossSpawned[key] = true;
      if (t.boss === 'coro_absoluto' && !this.flags.final_cutscene_seen) {
        this.flags.final_cutscene_seen = true;
        this.ui?.playCutscene(CUTSCENES.final, () => {
          this.spawnEnemy(t.boss, t.x, t.y, { arena: t.id, fixed: true });
        });
      } else {
        this.spawnEnemy(t.boss, t.x, t.y, { arena: t.id, fixed: true });
      }
    }
  }

  updateInteraction(dt) {
    let resonable = null;
    if (!this.playerDead) {
      for (const e of this.enemies) {
        if (e.dead || !e.creatureAvailable || e.resonanceAttempted) continue;
        if (e.hp / e.maxHp > .32) continue;
        const d = dist(e.x, e.y, this.player.x, this.player.y);
        if (d < 120 && (!resonable || d < resonable._d)) { e._d = d; resonable = e; }
      }
    }
    this.resonable = resonable;
    let action = null;
    if (!resonable) {
      let best = Infinity;
      for (const n of this.npcs) {
        if (n.hidden) continue;
        const d = dist(n.x, n.y, this.player.x, this.player.y);
        if (d < 82 && d < best) { best = d; action = { type: 'npc', target: n, text: `Hablar con ${NPCS[n.id]?.name || n.id}` }; }
      }
      for (const s of this.shrines) {
        const d = dist(s.x, s.y, this.player.x, this.player.y);
        if (d < 86 && d < best) { best = d; action = { type: 'shrine', target: s, text: s.discovered ? 'Descansar en el santuario' : `Descubrir ${s.name}` }; }
      }
      for (const st of this.stones) {
        const d = dist(st.x, st.y, this.player.x, this.player.y);
        if (d < 90 && d < best) { best = d; action = { type: 'stone', target: st, text: st.active ? `Escuchar ${st.name}` : `Despertar ${st.name}` }; }
      }
      for (const i of this.region.interactables) {
        if (i.type !== 'sign' && i.type !== 'well' && i.type !== 'astrolabe') continue;
        const d = dist(i.x, i.y, this.player.x, this.player.y);
        if (d < 72 && d < best) {
          best = d;
          action = { type: i.type, target: i, text: i.type === 'sign' ? 'Leer el letrero' : i.type === 'well' ? 'Observar el pozo' : 'Contemplar el astrolabio' };
        }
      }
    }
    this.interaction = action;
    this.ui?.setInteraction(resonable ? 'resonate' : action ? 'interact' : null, resonable ? 'Resonar con la criatura' : action?.text || '');
  }

  interact() {
    if (!this.interaction) return;
    const { type, target } = this.interaction;
    if (type === 'npc') this.talkTo(target);
    else if (type === 'shrine') this.ui?.openShrine(target);
    else if (type === 'stone') this.activateStone(target);
    else if (type === 'sign') this.ui?.showNarration('LETRERO', target.text);
    else if (type === 'well') {
      this.ui?.showNarration('POZO', target.lava
        ? 'El pozo exhala un calor imposible. Al fondo, algo late como una segunda forja.'
        : 'El agua repite tu nombre con una voz que no es la tuya. Cuando apartas la mirada, el pozo vuelve a estar en silencio.');
    } else if (type === 'astrolabe') {
      this.ui?.showNarration('ASTROLABIO', 'Las constelaciones giran al revés. En el centro, una nota grabada dice: "El que no estaba escrito aún puede elegir".');
      this.player.addBuff({ id: 'inspiracion', time: 9999 });
      this.flags.astrolabe_seen = true;
    }
  }

  talkTo(npc) {
    const data = NPCS[npc.id];
    if (!data) return;
    const dialogue = dialogueFor(npc.id, this);
    this.lastDialogueNpc = npc.id;
    this.audio.sfx('dialogue');
    this.ui?.startDialogue(npc.id, dialogue, () => this.handleEvent('talk', npc.id));
  }

  activateStone(stone) {
    if (stone.active) {
      this.ui?.showNarration(stone.name, 'La piedra sigue cálida. Su nota se mezcla con las demás, esperando la siguiente.');
      return;
    }
    stone.active = true;
    this.state.stones[stone.id] = true;
    this.flags[stone.id] = true;
    this.audio.sfx('shrine');
    this.burst(stone.x, stone.y - 40, stone.glow || '#ffe6a0', 34, 170);
    this.effects.ring(stone.x, stone.y, 90, stone.glow || '#ffe6a0', .8);
    this.effects.screenFlash(stone.glow || '#ffe6a0', .12);
    this.camera.shake(4, .2);
    this.ui?.toast(`${stone.name} despierta`, 'creature');
    const advanced = this.handleEvent('reach', stone.id);
    if (!advanced) this.ui?.showNarration(stone.name, 'La piedra canta, pero su nota aún no encaja en la canción que buscas. Otras piedras esperan.');
    this.requestSave();
    this.ui?.refresh();
  }

  tryResonate() {
    if (!this.resonable) return;
    const enemy = this.resonable;
    if (enemy.dead || enemy.hp / enemy.maxHp > .32) return;
    enemy.resonanceAttempted = true;
    this.audio.sfx('pulse');
    this.ui?.openResonance(enemy);
  }

  resonanceSuccess(enemy) {
    if (!enemy || enemy.dead) return;
    const isNew = this.player.addCreature(enemy.creatureId, this);
    const c = CREATURES[enemy.creatureId];
    if (isNew) {
      this.player.tamed++;
      this.ui?.toast(`✦ ${c?.name || enemy.creatureId} se ha unido a ti`, 'creature');
      this.audio.sfx('capture');
      this.effects.ring(enemy.x, enemy.y, 130, c?.palette?.[0] || '#a8d8ff', 1);
      this.effects.burst(enemy.x, enemy.y - 20, c?.palette?.[0] || '#a8d8ff', 42, 180);
      this.effects.screenFlash(c?.palette?.[0] || '#a8d8ff', .2);
    } else {
      this.ui?.toast('Vínculo reforzado · +2 esencia', 'creature');
      this.player.addItem('esencia', 2);
    }
    this.flags[`tamed_${enemy.creatureId}`] = true;
    enemy.hp = 0;
    enemy.dead = true;
    this.player.gainXp(Math.round(enemy.xp * .5), this);
    this.handleEvent('kill', enemy.typeId);
    this.ensureCompanion();
    this.ui?.refresh();
    this.requestSave();
  }

  resonanceFail(enemy) {
    if (!enemy) return;
    enemy.aggro = true;
    enemy.damage = Math.round(enemy.damage * 1.12);
    this.ui?.toast('La resonancia se ha quebrado', 'danger');
    this.audio.sfx('fail');
    this.floatingText(enemy.x, enemy.y - 60, 'RESONANCIA ROTA', '#ff9a9a');
  }

  /* ------------------------------------------------------------------ */
  /*  Combate                                                            */
  /* ------------------------------------------------------------------ */

  aimAngleFor(player, range = 140) {
    let near = null, nd = range;
    for (const e of this.enemies) {
      if (e.dead) continue;
      const d = dist(player.x, player.y, e.x, e.y);
      if (d < nd) { nd = d; near = e; }
    }
    if (near) return angleTo(player.x, player.y - 24, near.x, near.y - 20);
    if (this.pointer.active && performance.now() - this.pointer.last < 4000) {
      const w = this.camera.screenToWorld(this.pointer.x, this.pointer.y);
      return angleTo(player.x, player.y - 24, w.x, w.y);
    }
    return null;
  }

  playerMeleeHit(comboIndex, angle) {
    const p = this.player;
    const range = 82 + (p.weaponType === 'greatsword' ? 24 : p.weaponType === 'daggers' ? -8 : 0);
    const arc = comboIndex === 3 ? 2.7 : 2.3;
    let hit = 0;
    const critChance = p.stats.crit;
    for (const e of this.enemies) {
      if (e.dead) continue;
      const d = dist(p.x, p.y - 18, e.x, e.y);
      if (d > range + e.radius) continue;
      const a = angleTo(p.x, p.y - 18, e.x, e.y);
      let diff = Math.atan2(Math.sin(a - angle), Math.cos(a - angle));
      if (Math.abs(diff) > arc / 2) continue;
      const crit = chance(critChance / 100);
      let mult = comboIndex === 3 ? 1.55 : comboIndex === 2 ? 1.14 : 1;
      if (p.hasBuff('atkBuff')) mult *= 1.3;
      const burn = p.creatureBonuses().burn || 0;
      const dmg = p.stats.atk * mult * (burn ? 1 + burn / 100 : 1) * rand(.92, 1.06);
      e.takeDamage(dmg, this, { crit, knockback: comboIndex === 3 ? 16 : 8, angle, element: burn ? 'fire' : null });
      if (burn) e.applyBurn(4 + p.level * .3, 3);
      hit++;
      this.audio.sfx(crit ? 'crit' : 'hit', rand(.9, 1.1));
      this.burst(e.x, e.y - 28, crit ? '#ffe6a0' : '#ffd8a0', crit ? 16 : 8, 130);
      this.hitStop = Math.max(this.hitStop, crit ? .055 : .028);
      this.camera.shake(crit ? 6 : 3, crit ? .18 : .1);
      // El filo también puede desviar proyectiles cercanos.
      if (comboIndex === 3) {
        for (const pr of this.projectiles) {
          if (pr.owner === 'enemy' && !pr.dead && dist(pr.x, pr.y, e.x, e.y) < 80) {
            pr.dead = true;
            this.burst(pr.x, pr.y, '#ffe6a0', 6, 70);
          }
        }
      }
    }
    if (hit) this.effects.screenFlash('#fff0c0', .035);
  }

  spawnSlash(x, y, angle, combo = 1, color = '#fff2c9', scale = 1) {
    this.effects.slash(x, y, angle, combo, color, scale);
  }

  spawnSwordWave(player, angle) {
    const p = player;
    const damage = 20 + p.stats.spellPower * .95 + (p.stats.weaponAtk || 0) * .5;
    const wave = new SwordWave(p.x, p.y - 24, angle, damage, '#ffe6a0');
    wave.radius = 36;
    this.projectiles.push(wave);
    this.effects.ring(p.x, p.y - 24, 50, '#ffe6a0', .35);
  }

  spawnPulse(player) {
    const p = player;
    const radius = 178;
    const damage = 14 + p.stats.spellPower * 1.1;
    this.effects.ring(p.x, p.y, radius, '#b9a8ff', .7);
    this.effects.burst(p.x, p.y - 24, '#b9a8ff', 34, 220);
    this.effects.screenFlash('#a898ff', .1);
    this.camera.shake(6, .25);
    this.audio.sfx('pulse');
    for (const e of this.enemies) {
      if (e.dead) continue;
      if (dist(p.x, p.y, e.x, e.y) > radius + e.radius) continue;
      e.takeDamage(damage, this, { crit: chance(p.stats.crit / 100), knockback: 22, angle: angleTo(p.x, p.y, e.x, e.y) });
      if (!e.boss) e.stunHit(.65, this);
      e.marked = Math.max(e.marked, 4);
    }
    for (const pr of this.projectiles) {
      if (pr.owner === 'enemy' && dist(pr.x, pr.y, p.x, p.y) < radius) {
        pr.dead = true;
        this.burst(pr.x, pr.y, '#c8b8ff', 7, 80);
      }
    }
    p.mp = Math.min(p.maxMp, p.mp + 6);
  }

  veilStep(player, dir) {
    const start = { x: player.x, y: player.y };
    let travel = 170;
    let end = { x: start.x + dir.x * travel, y: start.y + dir.y * travel };
    while (travel > 30 && !canStand(this.region, end.x, end.y, player.radius)) {
      travel -= 14;
      end = { x: start.x + dir.x * travel, y: start.y + dir.y * travel };
    }
    player.x = end.x; player.y = end.y;
    player.invuln = Math.max(player.invuln, .36);
    player.vx = 0; player.vy = 0;
    this.effects.dashTrail(player);
    this.effects.burst(start.x, start.y - 26, '#9fd8ff', 20, 120);
    this.effects.ring(end.x, end.y, 60, '#9fd8ff', .45);
    this.effects.ring(start.x, start.y, 46, '#7fc8ff', .4);
    this.effects.screenFlash('#9fd8ff', .06);
    this.camera.shake(3, .12);
    const damage = 12 + player.stats.spellPower * .55;
    for (const e of this.enemies) {
      if (e.dead) continue;
      const along = this.distToSegment(e.x, e.y, start.x, start.y, end.x, end.y);
      if (along < 52 + e.radius) {
        e.takeDamage(damage, this, { knockback: 12, angle: dir.x >= 0 ? 0 : Math.PI });
        e.slow = Math.max(e.slow, 1.2);
      }
    }
  }

  distToSegment(px, py, x1, y1, x2, y2) {
    const dx = x2 - x1, dy = y2 - y1;
    const l2 = dx * dx + dy * dy || 1;
    const t = clamp(((px - x1) * dx + (py - y1) * dy) / l2, 0, 1);
    return Math.hypot(px - (x1 + dx * t), py - (y1 + dy * t));
  }

  spawnDashTrail(player) { this.effects.dashTrail(player); }

  spawnEnemyProjectile(source, x, y, vx, vy, opts = {}) {
    const p = new Projectile(x, y, vx, vy, {
      owner: 'enemy', damage: opts.damage || 10, size: opts.size || 10,
      type: opts.type || 'orb', range: opts.range || 2.5, pierce: opts.pierce,
      source, color: opts.color || source?.palette?.[2] || '#ffb060',
      life: opts.range || 2.5,
    });
    this.projectiles.push(p);
    return p;
  }

  useCompanionAbility() {
    const p = this.player;
    const c = p.activeCreatureData;
    if (!c) { this.toast('No tienes una criatura vinculada', 'danger'); return; }
    if (p.cooldowns.companion > 0) return;
    const cd = c.cooldown || 20;
    p.cooldowns.companion = cd;
    this.audio.sfx('magic');
    this.effects.ring(p.x, p.y, 80, c.palette[0], .6);
    this.burst(p.x, p.y - 26, c.palette[0], 22, 140);
    const near = this.enemies.filter(e => !e.dead).sort((a, b) => dist(p.x, p.y, a.x, a.y) - dist(p.x, p.y, b.x, b.y));
    const target = near.find(e => dist(p.x, p.y, e.x, e.y) < 360) || null;
    const aoe = (x, y, r, dmg, element = null) => {
      for (const e of this.enemies) {
        if (e.dead) continue;
        if (dist(x, y, e.x, e.y) <= r + e.radius) e.takeDamage(dmg, this, { knockback: 10, angle: angleTo(x, y, e.x, e.y), element });
      }
    };
    switch (c.id) {
      case 'lumito': {
        if (target) {
          const a = angleTo(p.x, p.y - 20, target.x, target.y);
          const pr = new Projectile(p.x, p.y - 26, Math.cos(a) * 500, Math.sin(a) * 500, {
            owner: 'player', damage: 16 + p.level * 2, size: 12, color: c.palette[0], pierce: true, life: 1.4
          });
          this.projectiles.push(pr);
          target.marked = Math.max(target.marked, 2);
        }
        break;
      }
      case 'flic': aoe(target?.x || p.x, target?.y || p.y, 110, 18 + p.level * 2, 'fire'); break;
      case 'musgo': p.heal(p.maxHp * .35, this); p.slowTimer = 0; break;
      case 'nix': p.addBuff({ id: 'bubble', time: 6 }); break;
      case 'roca': {
        for (let i = 0; i < 3; i++) {
          const x = (target?.x || p.x) + rand(-70, 70), y = (target?.y || p.y) + rand(-50, 50);
          this.groundSpike(x, y, 34, .25, c.palette[0], () => aoe(x, y, 64, 14 + p.level, 'earth'));
        }
        break;
      }
      case 'cuervo': {
        for (const e of near.slice(0, 3)) e.marked = 8;
        break;
      }
      case 'salamandra': {
        const ang = this.aimAngleFor(p, 220) ?? 0;
        for (const e of this.enemies) {
          if (e.dead) continue;
          const d = dist(p.x, p.y, e.x, e.y);
          if (d > 200) continue;
          const ea = angleTo(p.x, p.y, e.x, e.y);
          const diff = Math.atan2(Math.sin(ea - ang), Math.cos(ea - ang));
          if (Math.abs(diff) < .85) {
            e.takeDamage(20 + p.level * 2.4, this, { element: 'fire' });
            e.applyBurn(5 + p.level * .4, 4);
          }
        }
        break;
      }
      case 'cenizo': p.addBuff({ id: 'atkBuff', time: 8, power: 30 }); break;
      case 'obsidiana': p.addBuff({ id: 'stoneShield', time: 7 }); break;
      case 'luciernaga': p.mp = Math.min(p.maxMp, p.mp + 40); p.addBuff({ id: 'manaDiscount', time: 10 }); break;
      case 'grifo': {
        const x = target?.x || p.x, y = target?.y || p.y;
        this.effects.telegraphCircle(x, y, 80, .35, c.palette[0]);
        aoe(x, y, 105, 34 + p.level * 3);
        this.burst(x, y, c.palette[0], 32, 190);
        this.camera.shake(6, .2);
        break;
      }
      case 'aurora': {
        p.heal(p.maxHp * .5, this);
        aoe(p.x, p.y, 220, 30 + p.level * 2.4);
        this.effects.ring(p.x, p.y, 230, '#fff2c0', 1);
        this.effects.screenFlash('#fff8d0', .24);
        break;
      }
      default: break;
    }
    this.ui?.toast(`${c.ability} · ${c.name}`, 'creature');
    this.ui?.refresh();
  }

  /* ------------------------------------------------------------------ */
  /*  Muerte, santuarios y viaje                                         */
  /* ------------------------------------------------------------------ */

  onPlayerDeath() {
    if (this.playerDead) return;
    this.playerDead = true;
    this.player.deaths = (this.player.deaths || 0) + 1;
    this.audio.sfx('death');
    this.camera.shake(14, .7);
    this.effects.screenFlash('#7d1e2a', .5);
    this.burst(this.player.x, this.player.y - 26, '#ff8a8a', 46, 180);
    this.ui?.showDeath();
  }

  respawn() {
    this.playerDead = false;
    const p = this.player;
    p.hp = Math.max(1, Math.round(p.maxHp * .6));
    p.mp = Math.round(p.maxMp * .5);
    p.stamina = p.maxStam;
    p.invuln = 1.3;
    p.dead = false;
    const lost = Math.floor(p.gold * .1);
    p.gold = Math.max(0, p.gold - lost);
    this.effects.clear();
    const shrine = this.lastShrine;
    if (shrine && shrine.region && shrine.region !== this.regionId) {
      this.loadRegion(shrine.region, null, { position: { x: shrine.x, y: shrine.y }, quiet: true });
    } else if (shrine) {
      p.x = shrine.x; p.y = shrine.y;
      this.camera.snapTo(p.x, p.y);
    } else {
      const sp = this.region.startSpawn;
      p.x = sp.x; p.y = sp.y;
      this.camera.snapTo(p.x, p.y);
    }
    for (const e of this.enemies) {
      if (!e.boss && !e.spawnerId) e.dead = true;
    }
    this.playerDead = false;
    this.ui?.closeAll();
    this.ui?.toast(`Despiertas en el santuario · -${lost} de oro`, 'gold');
    this.effects.screenFlash('#ffe6a0', .2);
    this.audio.sfx('shrine');
    this.requestSave();
    this.ui?.refresh();
  }

  restAtShrine(shrine) {
    const p = this.player;
    p.hp = p.maxHp; p.mp = p.maxMp; p.stamina = p.maxStam;
    p.reviveUsed = false;
    p.buffs = p.buffs.filter(b => b.id === 'inspiracion');
    shrine.discovered = true;
    this.state.shrines[shrine.id] = true;
    this.lastShrine = { region: this.regionId, id: shrine.id, name: shrine.name, x: shrine.x, y: shrine.y };
    this.effects.ring(p.x, p.y, 120, '#ffe6a0', .9);
    this.effects.burst(p.x, p.y - 20, '#ffe6a0', 32, 150);
    this.audio.sfx('shrine');
    this.ui?.toast('Descansas · vida y maná restaurados', 'gold');
    this.ui?.closeAll();
    this.save('auto', true);
    this.ui?.refresh();
  }

  travel(regionId, spawnName = null, options = {}) {
    if (!TRAVEL_POINTS[regionId]) return;
    this.ui?.closeAll();
    this.audio.sfx('portal');
    this.save('auto', true);
    if (regionId === this.regionId && !options.forceReload) {
      const point = TRAVEL_POINTS[regionId][spawnName] || TRAVEL_POINTS[regionId].start;
      this.player.x = point.x; this.player.y = point.y;
      this.player.vx = 0; this.player.vy = 0;
      this.camera.snapTo(this.player.x, this.player.y);
      this.ui?.showZone(this.region.name, this.region.subtitle);
      this.ui?.refresh();
      return;
    }
    this.loadRegion(regionId, spawnName, { quiet: false });
    if (regionId === 'drakmor' && !this.flags.act2_seen) {
      this.flags.act2_seen = true;
      this.ui?.playCutscene(CUTSCENES.act2, () => this.ui?.showZone(this.region.name, this.region.subtitle));
    }
    if (regionId === 'kansordore' && !this.flags.act3_seen) {
      this.flags.act3_seen = true;
      this.ui?.playCutscene(CUTSCENES.act3, () => this.ui?.showZone(this.region.name, this.region.subtitle));
    }
    this.requestSave();
  }

  applyStoryArrival(regionId) {
    if (regionId === 'drakmor') {
      if (this.questState('m3')?.status === 'done' && !this.questState('m4')) this.startQuest('m4');
    }
    if (regionId === 'kansordore') {
      if (this.questState('m4')?.status === 'done' && !this.questState('m5')) this.startQuest('m5');
    }
    if (this.questState('s_kael')?.status === 'active') {
      const k = this.npcs.find(n => n.id === 'kael_camp');
      if (k) k.hidden = false;
    }
  }

  /* ------------------------------------------------------------------ */
  /*  Misiones                                                           */
  /* ------------------------------------------------------------------ */

  questState(id) { return this.quests[id] || null; }

  startQuest(id, silent = false) {
    const q = QUESTS[id];
    if (!q || this.quests[id]) return false;
    this.quests[id] = { status: 'active', step: 0, count: 0, startedAt: Date.now() };
    if (!silent) {
      this.audio.sfx('quest');
      this.ui?.toast(`MISIÓN · ${q.title}`, 'gold');
    }
    this.ui?.refresh();
    return true;
  }

  advanceQuest(id, silent = false) {
    const q = QUESTS[id];
    const st = this.quests[id];
    if (!q || !st || st.status !== 'active') return false;
    st.step++;
    st.count = 0;
    if (st.step >= q.steps.length) {
      this.completeQuest(id, silent);
      return true;
    }
    if (!silent) {
      this.audio.sfx('quest');
      const step = q.steps[st.step];
      this.ui?.toast(`OBJETIVO · ${step?.text || q.title}`, 'gold');
    }
    this.ui?.refresh();
    this.requestSave();
    return true;
  }

  completeQuest(id, silent = false) {
    const q = QUESTS[id];
    const st = this.quests[id];
    if (!q || !st) return false;
    st.status = 'done';
    st.step = q.steps.length;
    st.count = 0;
    const r = q.rewards || {};
    if (r.xp) this.player.gainXp(r.xp, this);
    if (r.gold) this.player.gold += r.gold;
    for (const it of r.items || []) this.player.addItem(it.id, it.qty || 1);
    this.player.questsDone = (this.player.questsDone || 0) + 1;
    this.flags[`quest_${id}`] = true;
    if (!silent) {
      this.audio.sfx('level');
      this.ui?.toast(`MISIÓN COMPLETADA · ${q.title}`, 'gold');
      this.ui?.toast(`+${q.rewards?.xp || 0} EXP · +${q.rewards?.gold || 0} oro`, 'gold');
      this.effects.ring(this.player.x, this.player.y, 110, '#ffe6a0', .9);
    }
    this.requestSave();
    this.ui?.refresh();
    return true;
  }

  handleEvent(type, target, amount = 1) {
    let progressed = false;
    for (const [id, st] of Object.entries(this.quests)) {
      if (st.status !== 'active') continue;
      const q = QUESTS[id];
      if (!q) continue;
      const step = q.steps[st.step];
      if (!step) continue;
      if (step.type !== type || step.target !== target) continue;
      st.count += amount;
      if (st.count >= (step.count || 1)) {
        this.advanceQuest(id);
        progressed = true;
      } else {
        this.ui?.refresh();
      }
    }
    return progressed;
  }

  updateQuestMarkers() {
    const targets = new Set();
    for (const [id, st] of Object.entries(this.quests)) {
      if (st.status !== 'active') continue;
      const step = QUESTS[id]?.steps?.[st.step];
      if (step?.type === 'talk') targets.add(step.target);
    }
    for (const n of this.npcs) n.marker = targets.has(n.id);
    if (this.regionId === 'kansordore') {
      const k = this.npcs.find(n => n.id === 'kael_camp');
      if (k && this.questState('s_kael')?.status === 'active') k.hidden = false;
    }
  }

  /* ------------------------------------------------------------------ */
  /*  Final y guardado                                                   */
  /* ------------------------------------------------------------------ */

  secretUnlocked() {
    return !!(this.flags.eco_uno && this.flags.eco_dos && this.flags.eco_tres)
      && (this.player.tamed >= 3 || this.player.creatures?.aurora);
  }

  showFinale() {
    if (this.flags.ending) return;
    this.ui?.showFinale(this.secretUnlocked());
  }

  finishEnding(key) {
    const flagKey = key === 'A' ? 'restore' : key === 'B' ? 'break' : 'free';
    this.flags.final_choice = flagKey;
    this.flags.ending = key;
    this.handleEvent('flag', 'final_choice');
    if (this.questState('m6')?.status === 'active') this.completeQuest('m6', true);
    this.audio.playTheme('ending');
    this.effects.screenFlash('#fff6dd', .35);
    const slides = [];
    const cut = CUTSCENES['ending' + key];
    if (cut) slides.push(cut);
    const epilogue = {
      A: { chapter: 'EPÍLOGO', title: 'Un mundo que olvida', text: 'En Valdoria, cada primavera nace una flor que nadie plantó. Nara las riega y, al hacerlo, tararea una canción que no recuerda haber aprendido. A veces, junto al santuario, aparece una espada oxidada. Nadie sabe de quién es. El mundo, por fin, descansa.' },
      B: { chapter: 'EPÍLOGO', title: 'Mil canciones', text: 'Los reinos aprenden a hablar con varias voces a la vez. Hay discusiones, risas y guerras nuevas. También hay criaturas que cantan su propio nombre al amanecer. Nadie sabe qué será del mundo. Por primera vez, el mundo tampoco lo sabe. Y eso, descubres, es otra forma de libertad.' },
      C: { chapter: 'EPÍLOGO SECRETO', title: 'La nota que faltaba', text: 'No hay profecía que describa lo que ocurre después. La Gema sigue brillando, pero ya no dicta. En la Cumbre, una figura de luz deja una espada clavada en la piedra y se aleja silbando. Tú recuerdas tu nombre. Lo pronuncias en voz alta. El mundo improvisa una respuesta.' }
    }[key];
    if (epilogue) slides.push({ ...epilogue, bg: cut?.bg || 'var(--cut-bg-12)' });
    this.ui?.playCutscene(slides, () => {
      this.ui?.showEnding(key);
      this.save('auto', true);
    });
  }

  serialize() {
    return {
      regionId: this.regionId,
      player: this.player.serialize(),
      quests: this.quests,
      flags: this.flags,
      regionState: this.regionState,
      lastShrine: this.lastShrine,
      playTime: this.playTime,
      settings: this.settings,
      completed: !!this.flags.ending,
    };
  }

  save(slot = 'auto', silent = false) {
    if (!this.started && slot !== 'auto') return null;
    const data = writeSave(slot, this.serialize());
    if (!silent) {
      this.ui?.toast(data ? 'Partida guardada' : 'No se pudo guardar', data ? 'gold' : 'danger');
      this.audio.sfx(data ? 'select' : 'error');
    }
    return data;
  }

  requestSave() {
    clearTimeout(this._saveTimer);
    this._saveTimer = setTimeout(() => { if (this.started) this.save('auto', true); }, 1800);
  }

  /* ------------------------------------------------------------------ */
  /*  Clima, audio y ayudas                                              */
  /* ------------------------------------------------------------------ */

  initWeather() {
    const type = this.region.weather || 'leaves';
    const count = this.settings.reduceFx ? 16 : 38;
    this.weather = {
      type,
      items: Array.from({ length: count }, () => ({
        x: rand(0, this.viewW()), y: rand(0, this.viewH()),
        vx: rand(-16, 16), vy: rand(-16, 16), s: rand(.6, 2.2), a: rand(.12, .55), p: rand(0, 6.28)
      }))
    };
  }

  updateWeather(dt) {
    const w = this.viewW(), h = this.viewH();
    const type = this.weather.type;
    for (const p of this.weather.items) {
      p.p += dt;
      if (type === 'embers') {
        p.x += Math.sin(p.p * 1.4 + p.s) * 10 * dt + p.vx * dt * .3;
        p.y -= (18 + p.s * 14) * dt;
      } else if (type === 'motes') {
        p.x += Math.sin(p.p * .8 + p.s * 2) * 12 * dt;
        p.y += Math.cos(p.p * .6 + p.s) * 8 * dt;
      } else {
        p.x += (12 + p.s * 8) * dt + Math.sin(p.p * 1.2) * 8 * dt;
        p.y += (8 + p.s * 5) * dt;
      }
      if (p.x < -10) p.x = w + 10; if (p.x > w + 10) p.x = -10;
      if (p.y < -10) p.y = h + 10; if (p.y > h + 10) p.y = -10;
    }
  }

  updateMusic(dt) {
    this.combatCheck -= dt;
    if (this.combatCheck > 0) return;
    this.combatCheck = .65;
    const inCombat = this.enemies.some(e => !e.dead && (e.aggro || e.boss) && dist(e.x, e.y, this.player.x, this.player.y) < 680);
    if (this.currentBoss && !this.currentBoss.dead) {
      if (this.audio.themeName !== 'boss') this.audio.playTheme('boss');
    } else if (inCombat) {
      if (this.audio.themeName !== `${this.region.music}Combat`) this.audio.playTheme(this.region.music || this.regionId, true);
    } else if (!this.audio.themeName || this.audio.themeName.endsWith('Combat')) {
      this.audio.playTheme(this.region.music || this.regionId);
    }
  }

  onEnemyDeath(e) {
    if (e.deadHandled) return;
    e.deadHandled = true;
    const p = this.player;
    this.audio.sfx(e.boss ? 'roar' : 'hit', e.boss ? .5 : 1);
    this.effects.burst(e.x, e.y - 20, e.palette?.[2] || '#ffd8a0', e.boss ? 60 : 18, e.boss ? 240 : 140);
    if (e.boss) {
      this.camera.shake(14, .8);
      this.effects.screenFlash(e.palette?.[0] || '#ffe6a0', .4);
      this.effects.bossPhase(e.x, e.y, e.palette?.[0] || '#ffe6a0');
    }
    p.kills++;
    p.gainXp(e.xp, this);
    p.gold += e.gold;
    this.floatingText(e.x, e.y - 46, `+${e.xp} EXP`, '#ffe6a0');
    if (e.gold > 0) this.floatingText(e.x, e.y - 62, `+${e.gold} oro`, '#ffd27a', .9);
    if (e.data.drops?.length) {
      for (const id of e.data.drops) {
        if (id === 'espada_celestial') {
          if (!e.boss) continue;
          p.addItem(id, 1);
          this.ui?.toast('✦ Has obtenido la Espada Celestial', 'gold');
          this.flags.has_celestial_sword = true;
        } else if (chance(e.data.dropChance ?? .3)) {
          p.addItem(id, 1);
          this.ui?.toast(`Objeto obtenido · ${ITEMS[id]?.name || id}`, 'creature');
          this.handleEvent('collect', id, 1);
        }
      }
    }
    this.handleEvent('kill', e.typeId);
    if (e.boss) {
      const flag = BOSS_FLAGS[e.typeId];
      if (flag) this.flags[flag] = true;
      this.flags[`boss_${e.typeId}`] = true;
      this.handleEvent('boss', e.typeId);
      this.ui?.setBoss(null);
      if (e.typeId === 'coro_absoluto') {
        this.flags.coro_defeated = true;
        setTimeout(() => this.showFinale(), 1400);
      }
    }
    this.requestSave();
    this.ui?.refresh();
  }

  toast(text, type = '') { this.ui?.toast(text, type); }
  burst(x, y, color = '#ffe6a0', count = 12, speed = 120) { this.effects.burst(x, y, color, count, speed); }
  floatingText(x, y, text, color = '#fff2d8', scale = 1) { this.effects.text(x, y, text, color, scale); }
  telegraphCircle(x, y, radius, life, color) { this.effects.telegraphCircle(x, y, radius, life, color); }
  telegraphLine(x1, y1, x2, y2, life, color, width) { this.effects.telegraphLine(x1, y1, x2, y2, life, color, width); }
  groundSpike(x, y, radius, delay, color, cb) { this.effects.groundSpike(x, y, radius, delay, color, cb); }
  groundRing(x, y, radius, color, life) { this.effects.ring(x, y, radius, color, life); }
  hazardPool(x, y, radius, life, dps, color) { this.effects.hazardPool(x, y, radius, life, dps, color); }
  lightBeam(x, y, angle, length, width, color, cb) { this.effects.lightBeam(x, y, angle, length, width, color, cb); }

  bossSweep(enemy, radius, arcWidth) {
    const p = this.player;
    const angle = angleTo(enemy.x, enemy.y, p.x, p.y);
    this.effects.slash(enemy.x, enemy.y - 22, angle, 3, enemy.palette?.[2] || '#ffb06a', 2.4);
    this.effects.ring(enemy.x, enemy.y, radius, enemy.palette?.[2] || '#ffb06a', .5);
    this.camera.shake(8, .3);
    this.audio.sfx('swing', .4);
    for (const a of [-1.1, 0, 1.1]) {
      // El barrido cubre un arco amplio, no 360 grados.
      if (dist(enemy.x, enemy.y, p.x, p.y) < radius) {
        const pa = angleTo(enemy.x, enemy.y, p.x, p.y);
        const diff = Math.atan2(Math.sin(pa - (angle + a)), Math.cos(pa - (angle + a)));
        if (Math.abs(diff) < .75) {
          p.takeDamage(enemy.damage * 1.1, this, enemy);
          break;
        }
      }
    }
  }

  bossPhase(enemy) {
    this.effects.bossPhase(enemy.x, enemy.y, enemy.palette?.[0] || '#ffe6a0');
    this.effects.ring(enemy.x, enemy.y, 220, enemy.palette?.[2] || '#ffe6a0', 1.1);
    this.camera.shake(12, .5);
    this.audio.sfx('roar');
    this.ui?.toast(`¡${enemy.name} se enfurece!`, 'danger');
    this.effects.screenFlash(enemy.palette?.[0] || '#ffe6a0', .25);
  }

  /* ------------------------------------------------------------------ */
  /*  Dibujo                                                             */
  /* ------------------------------------------------------------------ */

  render(time) {
    if (!this.region) return;
    const ctx = this.ctx;
    const dpr = this.dpr || 1;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, this.viewW(), this.viewH());
    const cam = this.camera;
    cam.visualX = cam.x + (cam.offsetX || 0);
    cam.visualY = cam.y + (cam.offsetY || 0);
    const view = { x: cam.visualX, y: cam.visualY, w: cam.w, h: cam.h };
    drawTerrain(ctx, this.region, view, time);
    drawWaterGlow(ctx, this.region, view, this.player, time);
    this.effects.drawGround(ctx, view, time);
    drawShrines(ctx, this.region, view, time);
    drawStones(ctx, { ...this.region, interactables: this.stones }, view, time);
    drawEnvironment(ctx, this.region, view, time);
    this.drawPickups(ctx, view, time);
    this.drawEntities(ctx, view, time);
    this.effects.drawAir(ctx, view, time);
    this.drawWeather(ctx, time);
    this.drawAtmosphere(ctx, view, time);
  }

  drawPickups(ctx, cam, time) {
    for (const p of this.pickups) {
      if (p.collected) continue;
      const x = p.x - cam.x, y = p.y - cam.y;
      if (x < -80 || y < -80 || x > cam.w + 80 || y > cam.h + 80) continue;
      const item = ITEMS[p.item];
      const bob = Math.sin(time * 2.2 + (p.bob || 0)) * 3;
      if (p.kind === 'chest') {
        shadow(ctx, x, y + 1, 17, 6, .35);
        glow(ctx, x, y - 12, 44, item?.rarity === 'legendary' ? '#ffe0a0' : '#d8c890', .16);
        ctx.fillStyle = '#6d4f30'; ctx.fillRect(x - 15, y - 18, 30, 18);
        ctx.fillStyle = '#8a653c'; ctx.fillRect(x - 16, y - 23, 32, 7);
        ctx.strokeStyle = '#c8a060'; ctx.lineWidth = 1.4; ctx.strokeRect(x - 15, y - 18, 30, 18);
        ctx.fillStyle = '#e8c878'; ctx.fillRect(x - 2, y - 18, 4, 8);
      } else {
        const color = item?.rarity === 'legendary' ? '#ffe0a0' : p.kind === 'quest' ? '#ffd070' : p.item === 'flor_lumen' ? '#c8f0b0' : p.item === 'eco' ? '#b8c8ff' : '#a8e0e8';
        glow(ctx, x, y - 12 + bob, 34, color, .2);
        ctx.save(); ctx.translate(x, y - 15 + bob); ctx.rotate(time * .9);
        ctx.fillStyle = color;
        ctx.beginPath(); ctx.moveTo(0, -7); ctx.lineTo(6, 0); ctx.lineTo(0, 7); ctx.lineTo(-6, 0); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,.7)'; ctx.lineWidth = .8; ctx.stroke();
        ctx.restore();
        ctx.fillStyle = 'rgba(255,255,255,.6)';
        ctx.beginPath(); ctx.arc(x + Math.cos(time * 2) * 10, y - 20 + Math.sin(time * 1.7) * 6, 1.2, 0, 6.3); ctx.fill();
      }
    }
  }

  drawEntities(ctx, cam, time) {
    const list = [];
    for (const n of this.npcs) if (!n.hidden) list.push({ y: n.y, kind: 'npc', n });
    for (const e of this.enemies) if (!e.dead) list.push({ y: e.y, kind: 'enemy', e });
    list.push({ y: this.player.y, kind: 'player' });
    if (this.player.companion?.visible) list.push({ y: this.player.companion.y, kind: 'companion' });
    list.sort((a, b) => a.y - b.y);
    for (const it of list) {
      if (it.kind === 'npc') drawNPC(ctx, it.n, cam, time);
      else if (it.kind === 'enemy') drawEnemy(ctx, it.e, cam, time);
      else if (it.kind === 'player') drawPlayer(ctx, this.player, cam, time);
      else if (it.kind === 'companion') this.player.companion.draw(ctx, cam, time);
    }
    // nombre de criatura resonable
    if (this.resonable && !this.resonable.dead) {
      const e = this.resonable;
      const x = e.x - cam.x, y = e.y - cam.y;
      ctx.save();
      ctx.font = '600 10px Georgia, serif'; ctx.textAlign = 'center';
      ctx.fillStyle = 'rgba(6,9,16,.75)';
      const label = (CREATURES[e.creatureId]?.name || 'Criatura') + ' · lista para resonar';
      const w = ctx.measureText(label).width + 14;
      ctx.fillRect(x - w / 2, y - 74, w, 17);
      ctx.fillStyle = '#d8d0ff';
      ctx.fillText(label, x, y - 62);
      ctx.restore();
    }
    // marcador del jugador
    if (this.pointer.active && performance.now() - this.pointer.last < 3000) {
      const w = this.camera.screenToWorld(this.pointer.x, this.pointer.y);
      ctx.save();
      ctx.strokeStyle = 'rgba(255,230,170,.35)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(w.x - cam.x, w.y - cam.y, 9, 0, 6.3); ctx.stroke();
      ctx.restore();
    }
  }

  drawWeather(ctx, time) {
    const type = this.weather.type;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (const p of this.weather.items) {
      if (type === 'embers') {
        ctx.fillStyle = `rgba(255,${120 + Math.sin(p.p) * 40},70,${p.a * .7})`;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.s * .9, 0, 6.3); ctx.fill();
      } else if (type === 'motes') {
        ctx.fillStyle = `rgba(255,242,200,${p.a * .55})`;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.s * .7, 0, 6.3); ctx.fill();
      } else {
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.p * .6);
        ctx.fillStyle = `rgba(190,220,150,${p.a * .45})`;
        ctx.beginPath(); ctx.ellipse(0, 0, p.s * 2.6, p.s * .8, 0, 0, 6.3); ctx.fill();
        ctx.restore();
      }
    }
    ctx.restore();
  }

  drawAtmosphere(ctx, cam, time) {
    const pal = this.region.palette;
    const g = ctx.createRadialGradient(cam.w * .5, cam.h * .48, Math.min(cam.w, cam.h) * .25, cam.w * .5, cam.h * .5, Math.max(cam.w, cam.h) * .72);
    g.addColorStop(0, 'rgba(0,0,0,0)');
    g.addColorStop(1, pal.vignette || 'rgba(4,8,12,.55)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, cam.w, cam.h);
    ctx.fillStyle = pal.ambient || 'rgba(0,0,0,.05)';
    ctx.fillRect(0, 0, cam.w, cam.h);
    if (this.regionId === 'drakmor') {
      const heat = ctx.createLinearGradient(0, cam.h, 0, cam.h * .55);
      heat.addColorStop(0, 'rgba(255,90,40,.06)'); heat.addColorStop(1, 'rgba(255,90,40,0)');
      ctx.fillStyle = heat; ctx.fillRect(0, 0, cam.w, cam.h);
    }
    // borde de daño
    if (this.player.hurtFlash > 0) {
      const v = ctx.createRadialGradient(cam.w / 2, cam.h / 2, Math.min(cam.w, cam.h) * .35, cam.w / 2, cam.h / 2, Math.max(cam.w, cam.h) * .7);
      v.addColorStop(0, 'rgba(180,20,30,0)');
      v.addColorStop(1, `rgba(180,20,30,${this.player.hurtFlash * .35})`);
      ctx.fillStyle = v; ctx.fillRect(0, 0, cam.w, cam.h);
    }
  }
}
