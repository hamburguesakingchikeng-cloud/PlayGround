// ============================================================
// LA ESPADA CELESTIAL — motor de juego
// ============================================================
import {
  ZONES, WEAPONS, ARMORS, ACCESSORIES, ITEMS, GEAR, SPELLS, SKILLS, CREATURES,
  ENEMIES, QUESTS, RECIPES, SHOP_STOCK, AFFINITIES, SOLID_TILES, itemDef, itemName,
  DEFAULT_APPEARANCE, CAPTURE_SPECIES, ZONE_ORDER
} from './data.js';
import { Renderer } from './renderer.js';
import { Input } from './input.js';
import { AudioEngine } from './audio.js';
import { drawCreature } from './art.js';
import { drawProjectile, drawParticle, drawEffect, spawnBurst } from './effects.js';

const TAU = Math.PI * 2;
const TS = 48;
const SAVE_KEY = 'lac_saves_v2';
const SETTINGS_KEY = 'lac_settings_v2';
const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
const rand = (a, b) => a + Math.random() * (b - a);
const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const clone = (o) => typeof structuredClone === 'function' ? structuredClone(o) : JSON.parse(JSON.stringify(o));

export class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.audio = new AudioEngine();
    this.settings = this.loadSettings();
    this.audio.setSettings({ master: this.settings.master, music: this.settings.music, sfx: this.settings.sfx });
    this.renderer = new Renderer(canvas, this);
    this.input = new Input(canvas);
    this.ui = null;
    this.screen = 'title';
    this.time = 0;
    this.last = 0;
    this.zone = null;
    this.player = null;
    this.state = null;
    this.zones = null;
    this.enemies = [];
    this.wilds = [];
    this.projectiles = [];
    this.effects = [];
    this.particles = [];
    this.loot = [];
    this.follower = null;
    this.cat = null;
    this.currentBoss = null;
    this.currentInteract = null;
    this.prompt = '';
    this.shake = 0;
    this.playerPulse = 0;
    this.zoomPulse = 1;
    this.fade = 0;
    this.transition = null;
    this.paused = false;
    this.overlay = false;
    this.hudTimer = 0;
    this.miniTimer = 0;
    this.saveTimer = 0;
    this.titleMusic = false;
    this.storySeen = false;
    this.debug = this.makeDebug();
    requestAnimationFrame((t) => this.loop(t));
  }

  loadSettings() {
    const def = { master: .75, music: .5, sfx: .8, quality: 2, shake: true, touchSize: 1, touchOpacity: .82, damageNumbers: true };
    try { return { ...def, ...JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}') }; }
    catch { return def; }
  }
  saveSettings() {
    try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(this.settings)); } catch {}
    this.audio.setSettings({ master: this.settings.master, music: this.settings.music, sfx: this.settings.sfx });
  }

  loop(ts) {
    const dt = Math.min(.05, Math.max(0, (ts - (this.last || ts)) / 1000));
    this.last = ts;
    this.time += dt;
    this.input.update();
    this.ui?.tick?.(dt);

    if (this.screen === 'title') {
      this.renderer.drawTitle(this.time);
      this.ui?.tickTitle(dt);
    } else if (this.screen === 'create') {
      this.ui?.tickCreate(dt);
    } else if (this.screen === 'playing') {
      if (!this.overlay) this.update(dt);
      else this.updateOverlay(dt);
      this.renderer.draw(this, this.time, dt);
      this.hudTimer += dt; this.miniTimer += dt;
      if (this.hudTimer > .08) { this.hudTimer = 0; this.ui?.updateHUD(this); }
      if (this.miniTimer > .18) { this.miniTimer = 0; this.renderer.drawMinimap(this); }
    }
    requestAnimationFrame((t) => this.loop(t));
  }

  // ---------------- creación y partida ----------------
  newGame(config) {
    this.audio.unlock();
    const appearance = { ...DEFAULT_APPEARANCE, ...config.appearance };
    this.zones = clone(ZONES);
    this.state = {
      mainStage: 0, shards: 0, forged: false, discovered: ['aldea'],
      quests: { herbs: { stage: 0 }, cat: { stage: 0 }, jelly: { stage: 0, count: 0 } },
      openedChests: {}, clearedObstacles: {}, litRunes: {}, litBraziers: {}, defeatedBosses: {},
      catFound: false, talked: {}, stats: { kills: 0, captures: 0, steps: 0, jellies: 0, damage: 0, bosses: 0, chests: 0 },
      respawn: { zone: 'aldea', x: 15.5, y: 13.2 }, playTime: 0,
      seen: { brasita: true }, finalDefeated: false,
    };
    const stats = config.stats || { strength: 3, defense: 3, speed: 3, intelligence: 3, luck: 3 };
    this.player = this.makePlayer(config.name || 'Astra', appearance, stats);
    this.screen = 'playing';
    this.overlay = false;
    this.input.clearActions();
    this.playerPulse = 1;
    this.loadZone('aldea', { x: 15.5, y: 13.2 });
    this.ui?.showGame();
    this.ui?.zoneBanner(this.zone);
    this.toast('Tu leyenda comienza en Aldea Alba.', 'gold');
    this.ui?.questPulse();
    this.audio.music('village');
    this.titleMusic = false;
  }

  makePlayer(name, appearance, base) {
    const p = {
      name, appearance, className: this.classFor(base),
      level: 1, xp: 0, xpNext: 60, skillPoints: 1,
      gold: 120,
      baseStats: { ...base },
      weapon: 'espada_alba',
      equipment: { weapon: 'espada_alba', armor: 'tunica_viajera', accessory: null },
      inventory: { pocion: 3, eter: 1, sello: 4, hierba: 2, baya: 3 },
      creatures: [], activeCreature: null,
      skills: [], spells: ['fuego'], activeSpell: 'fuego',
      buffs: [], petBuff: false,
      x: 0, y: 0, vx: 0, vy: 0, facing: { x: 0, y: 1 }, aimAngle: Math.PI / 2,
      moving: false, walkPhase: 0, radius: 11,
      attackAnim: null, attackCooldown: 0, comboIndex: 0, comboTimer: 0, attackHitDone: false,
      dodgeTimer: 0, dodgeCooldown: 0, dodgeDir: { x: 0, y: 1 }, invuln: 0,
      blocking: false, blockTime: 0, hurtFlash: 0, dead: false,
      spellCooldown: 0, petCooldown: 1.2,
      hp: 1, maxHp: 1, mana: 1, maxMana: 1, stamina: 1, maxStamina: 1,
      stats: {}, statsTimer: 0, armorColor: null, auraTimer: 0,
    };
    this.recalc(p, true);
    p.hp = p.maxHp; p.mana = p.maxMana; p.stamina = p.maxStamina;
    // criatura inicial: Brasita, para mostrar el sistema desde el comienzo
    const inst = this.makeCreature('brasita', 2, true);
    p.creatures.push(inst);
    p.activeCreature = inst.uid;
    return p;
  }

  classFor(base) {
    const pairs = [['strength', 'Guerrera del Alba'], ['intelligence', 'Arcanista de Lumen'], ['speed', 'Danzante de Niebla'], ['luck', 'Exploradora del Destino'], ['defense', 'Guardiana de Elyra']];
    let best = 'strength';
    for (const [k] of pairs) if (base[k] > base[best]) best = k;
    return pairs.find(p => p[0] === best)[1];
  }

  recalc(p = this.player, full = false) {
    const b = p.baseStats;
    const weapon = WEAPONS[p.equipment.weapon] || WEAPONS[p.weapon] || WEAPONS.espada_alba;
    const armor = ARMORS[p.equipment.armor] || null;
    const acc = p.equipment.accessory ? ACCESSORIES[p.equipment.accessory] : null;
    const accStats = acc?.stats || {};
    const levelBonus = Math.floor((p.level - 1) / 2);
    const has = (id) => p.skills.includes(id);
    const stats = {
      strength: b.strength + levelBonus + (accStats.strength || 0),
      defense: b.defense + levelBonus + (accStats.defense || 0),
      speed: b.speed + levelBonus + (accStats.speed || 0),
      intelligence: b.intelligence + levelBonus + (accStats.intelligence || 0),
      luck: b.luck + levelBonus + (accStats.luck || 0),
    };
    if (has('celestial')) for (const k of Object.keys(stats)) stats[k] = Math.round(stats[k] * 1.15 * 10) / 10;
    const old = { maxHp: p.maxHp, maxMana: p.maxMana, maxStamina: p.maxStamina };
    p.stats = stats;
    p.maxHp = 62 + stats.defense * 5 + (has('vitalidad') ? 25 : 0) + p.level * 5 + (armor?.hp || 0);
    p.maxMana = 34 + stats.intelligence * 6 + (has('flujo') ? 20 : 0) + (has('mago') ? 10 : 0) + p.level * 2 + (armor?.mana || 0);
    p.maxStamina = 68 + stats.speed * 4 + p.level * 3;
    p.moveSpeed = 150 + stats.speed * 5;
    p.attackPower = (weapon.damage + stats.strength * 1.25) * (has('filo') ? 1.12 : 1);
    p.spellPower = 1 + stats.intelligence * .055 + (has('mago') ? .2 : 0);
    p.defenseTotal = stats.defense * 1.15 + (armor?.defense || 0);
    p.crit = (weapon.crit || 0) + stats.luck * .008 + (has('cazador') ? .15 : 0);
    p.critMult = 1.7;
    p.captureBonus = stats.luck * .012 + (has('fortuna') ? .1 : 0);
    p.goldBonus = 1 + (has('fortuna') ? .15 : 0);
    p.attackSpeed = 1 + stats.speed * .008 + (has('cazador') ? .12 : 0);
    p.maxCombo = (weapon.combo || 3) + (has('combo') ? 1 : 0);
    p.dodgeCost = has('esquiva') ? 9 : 14;
    p.dodgeDuration = has('esquiva') ? .29 : .22;
    p.weaponDef = weapon;
    p.armorColor = armor?.color || null;
    if (full) { p.hp = p.maxHp; p.mana = p.maxMana; p.stamina = p.maxStamina; }
    else {
      p.hp = Math.min(p.maxHp, old.maxHp ? p.hp + (p.maxHp - old.maxHp) : p.hp);
      p.mana = Math.min(p.maxMana, old.maxMana ? p.mana + (p.maxMana - old.maxMana) : p.mana);
      p.stamina = Math.min(p.maxStamina, old.maxStamina ? p.stamina + (p.maxStamina - old.maxStamina) : p.stamina);
    }
  }

  makeCreature(species, level = 1, captured = false) {
    return {
      uid: 'c' + Math.random().toString(36).slice(2, 9),
      species, level, xp: 0, xpNext: 30 + level * 18,
      bond: captured ? 12 : 0, hunger: 70, captured, nickname: null,
      evolved: false,
    };
  }

  // ---------------- guardado ----------------
  serialize() {
    const p = this.player;
    const player = {
      name: p.name, appearance: p.appearance, className: p.className,
      level: p.level, xp: p.xp, xpNext: p.xpNext, skillPoints: p.skillPoints,
      gold: p.gold, baseStats: p.baseStats, weapon: p.weapon, equipment: p.equipment,
      inventory: p.inventory, creatures: p.creatures, activeCreature: p.activeCreature,
      skills: p.skills, spells: p.spells, activeSpell: p.activeSpell,
      hp: p.hp, mana: p.mana, stamina: p.stamina,
    };
    return {
      v: 2, timestamp: Date.now(), zone: this.zone.id,
      x: p.x, y: p.y, player, state: this.state,
    };
  }

  save(slot = 'auto') {
    if (!this.player || !this.state) return false;
    try {
      const all = JSON.parse(localStorage.getItem(SAVE_KEY) || '{}');
      all[slot] = this.serialize();
      all[slot].slot = slot;
      localStorage.setItem(SAVE_KEY, JSON.stringify(all));
      this.toast(slot === 'auto' ? 'Partida guardada automáticamente.' : 'Partida guardada.', 'gold');
      return true;
    } catch (e) { console.error(e); this.toast('No se pudo guardar la partida.', 'bad'); return false; }
  }

  getSaves() {
    try {
      const all = JSON.parse(localStorage.getItem(SAVE_KEY) || '{}');
      return all;
    } catch { return {}; }
  }
  latestSave() {
    const all = this.getSaves();
    return Object.values(all).sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))[0] || null;
  }
  hasSave() { return !!this.latestSave(); }

  load(slot) {
    let data;
    if (slot === 'latest') data = this.latestSave();
    else data = this.getSaves()[slot];
    if (!data) { this.toast('No hay partida en esa ranura.', 'bad'); return false; }
    this.audio.unlock();
    this.zones = clone(ZONES);
    this.state = clone(data.state);
    this.state.quests = this.state.quests || { herbs: { stage: 0 }, cat: { stage: 0 }, jelly: { stage: 0, count: 0 } };
    this.state.stats = this.state.stats || { kills: 0, captures: 0, steps: 0, jellies: 0, damage: 0, bosses: 0, chests: 0 };
    this.state.seen = this.state.seen || { brasita: true };
    this.state.discovered = this.state.discovered || ['aldea'];
    this.state.mainStage = this.state.mainStage || 0;
    this.player = this.makePlayer(data.player.name, data.player.appearance, data.player.baseStats);
    Object.assign(this.player, {
      level: data.player.level, xp: data.player.xp, xpNext: data.player.xpNext,
      skillPoints: data.player.skillPoints, gold: data.player.gold, weapon: data.player.weapon,
      equipment: clone(data.player.equipment), inventory: clone(data.player.inventory),
      creatures: clone(data.player.creatures), activeCreature: data.player.activeCreature,
      skills: clone(data.player.skills), spells: clone(data.player.spells), activeSpell: data.player.activeSpell,
      className: data.player.className,
    });
    this.recalc(this.player, true);
    this.player.hp = Math.max(1, Math.min(this.player.maxHp, data.player.hp));
    this.player.mana = Math.min(this.player.maxMana, data.player.mana);
    this.player.stamina = Math.min(this.player.maxStamina, data.player.stamina);
    this.applyWorldFlags();
    this.screen = 'playing';
    this.overlay = false;
    this.input.clearActions();
    this.loadZone(data.zone, { x: data.x / TS, y: data.y / TS });
    this.ui?.showGame();
    this.ui?.zoneBanner(this.zone);
    this.toast('Partida cargada. La aventura continúa.', 'gold');
    this.ui?.questPulse();
    return true;
  }

  deleteSave(slot) {
    try {
      const all = this.getSaves(); delete all[slot];
      localStorage.setItem(SAVE_KEY, JSON.stringify(all));
      this.ui?.renderMenu();
      this.toast('Ranura eliminada.', 'bad');
    } catch {}
  }

  applyWorldFlags() {
    for (const id of ZONE_ORDER) {
      const z = this.zones[id]; if (!z) continue;
      for (const ch of z.chests || []) if (this.state.openedChests[ch.id]) ch.opened = true;
      for (const o of z.obstacles || []) if (this.state.clearedObstacles[o.id]) o.cleared = true;
      for (const r of z.runes || []) if (this.state.litRunes[r.id]) r.lit = true;
      for (const b of z.braziers || []) if (this.state.litBraziers[b.id]) b.lit = true;
      if (z.altar && this.state.forged) z.altar.forged = true;
      if (z.boss && this.state.defeatedBosses[z.boss.type]) z.boss.defeated = true;
    }
  }

  // ---------------- zonas ----------------
  loadZone(id, spawn) {
    const zone = this.zones[id];
    if (!zone) return;
    this.zone = zone;
    this.enemies = [];
    this.wilds = [];
    this.projectiles = [];
    this.effects = [];
    this.particles = [];
    this.loot = [];
    this.currentBoss = null;
    const sp = spawn || zone.spawn;
    const p = this.player;
    p.x = sp.x * TS; p.y = sp.y * TS;
    p.vx = p.vy = 0; p.moving = false; p.dead = false;
    p.hp = Math.max(p.hp, p.maxHp * .35);
    if (!this.state.discovered.includes(id)) this.state.discovered.push(id);
    if (zone.boss && !this.state.defeatedBosses[zone.boss.type]) {
      const b = this.spawnEnemy(zone.boss.type, zone.boss.x * TS, zone.boss.y * TS, { boss: true, hidden: true });
      b.zoneBoss = zone.boss;
      this.bossRef = b;
    } else this.bossRef = null;
    for (const s of zone.spawns || []) this.spawnEnemy(s.type, s.x * TS, s.y * TS, { wander: (s.wander || 0) * TS });
    for (const w of zone.wilds || []) {
      this.spawnWild(w.species, w.x * TS, w.y * TS);
    }
    // gato de Lía
    this.cat = null;
    if (id === 'bosque' && this.state.quests.cat.stage === 1) {
      this.cat = { x: 6.4 * TS, y: 29.0 * TS, name: 'Nube', found: false };
    }
    this.renderer.setZone(zone);
    this.renderer.cam = { x: p.x, y: p.y };
    this.audio.music(zone.music || 'village');
    this.currentInteract = null;
    this.prompt = '';
    this.ui?.hideBoss();
    this.ui?.refreshQuest(this);
    this.ui?.updateCreatureChip(this);
  }

  travel(portal) {
    if (portal.requiresShards && this.state.shards < portal.requiresShards) {
      this.toast(portal.lockedText || 'El camino está sellado.', 'bad');
      this.audio.sfx('error');
      return;
    }
    if (this.transition) return;
    this.transition = { phase: 'out', t: 0, id: portal.to, spawn: portal.spawn };
    this.audio.sfx('portal');
    this.overlay = true;
  }

  updateTransition(dt) {
    if (!this.transition) return;
    const tr = this.transition;
    tr.t += dt;
    if (tr.phase === 'out') {
      this.fade = Math.min(1, tr.t / .38);
      if (tr.t >= .38) {
        this.loadZone(tr.id, tr.spawn);
        this.ui?.zoneBanner(this.zone);
        tr.phase = 'in'; tr.t = 0;
      }
    } else {
      this.fade = Math.max(0, 1 - tr.t / .45);
      if (tr.t >= .45) { this.fade = 0; this.transition = null; this.overlay = false; }
    }
  }

  // ---------------- bucle de juego ----------------
  update(dt) {
    if (this.state) this.state.playTime += dt;
    this.updateTransition(dt);
    if (this.transition) return;
    const p = this.player;
    if (!p || p.dead) { this.updateEffects(dt); return; }
    this.handleInput(dt);
    this.updatePlayer(dt);
    this.updateFollower(dt);
    this.updateEnemies(dt);
    this.updateWilds(dt);
    this.updateProjectiles(dt);
    this.updateLoot(dt);
    this.updateEffects(dt);
    this.updateInteractable();
    this.updateCat(dt);
    this.playerPulse = Math.max(0, this.playerPulse - dt * 2.5);
    this.zoomPulse += (1 - this.zoomPulse) * Math.min(1, dt * 8);
    if (!this.settings.shake) this.shake = 0;
  }

  updateOverlay(dt) {
    // el mundo se congela; solo se animan efectos mínimos y transiciones de zona
    this.updateTransition(dt);
    this.updateEffects(dt);
  }

  handleInput(dt) {
    const input = this.input;
    if (!this.ui || this.ui.dialogueOpen || this.ui.modalOpen) return;
    if (input.consume('pause') || input.consume('back')) { this.openMenu(); return; }
    if (input.consume('quick')) this.quickItem();
    if (input.consume('weapon')) this.cycleWeapon();
    if (input.consume('interact')) this.interact();
    if (input.consume('magic')) this.castSpell();
    if (input.consume('creature')) this.creatureAction();
    if (input.consume('dodge')) this.dodge();
    if (input.consume('attack')) this.attack();
  }

  updatePlayer(dt) {
    const p = this.player, input = this.input;
    p.attackCooldown = Math.max(0, p.attackCooldown - dt);
    p.spellCooldown = Math.max(0, p.spellCooldown - dt);
    p.dodgeCooldown = Math.max(0, p.dodgeCooldown - dt);
    p.invuln = Math.max(0, p.invuln - dt);
    p.hurtFlash = Math.max(0, p.hurtFlash - dt * 3.5);
    p.comboTimer = Math.max(0, p.comboTimer - dt);
    if (p.comboTimer <= 0) p.comboIndex = 0;
    p.blocking = input.guard && !p.attackAnim && p.dodgeTimer <= 0 && p.stamina > 2;
    if (p.blocking) p.blockTime += dt; else p.blockTime = 0;

    // regeneración
    const inCombat = this.enemies.some(e => !e.dead && dist(e, p) < 270);
    p.stamina = Math.min(p.maxStamina, p.stamina + dt * (p.blocking ? 4 : inCombat ? 16 : 24));
    p.mana = Math.min(p.maxMana, p.mana + dt * (.8 + p.stats.intelligence * .06));
    if (p.blocking) p.stamina = Math.max(0, p.stamina - dt * 8);

    if (p.attackAnim) {
      const a = p.attackAnim;
      a.t += dt / a.duration;
      if (!p.attackHitDone && a.t >= .38) { p.attackHitDone = true; this.resolveAttack(); }
      if (a.t >= 1) p.attackAnim = null;
    }
    if (p.dodgeTimer > 0) {
      p.dodgeTimer -= dt;
      const sp = 430;
      const nx = p.x + p.dodgeDir.x * sp * dt, ny = p.y + p.dodgeDir.y * sp * dt;
      this.moveWithCollision(p, nx - p.x, ny - p.y, 10);
      if (Math.random() < .6) this.particles.push({ type: 'spark', x: p.x + rand(-6, 6), y: p.y + rand(-30, -5), vx: -p.dodgeDir.x * 30, vy: -p.dodgeDir.y * 30, life: .35, max: .35, color: 'rgba(150,220,255,.7)', size: 1.2 });
      this.updateAimFromVector(p.dodgeDir.x, p.dodgeDir.y);
      return;
    }

    const mv = input.moveVector();
    p.moving = mv.mag > .12 && !p.attackAnim && !p.blocking;
    let speed = p.moveSpeed * (p.blocking ? .38 : 1) * (p.attackAnim ? .45 : 1);
    if (mv.mag > .12) {
      const dx = mv.x * speed * dt, dy = mv.y * speed * dt;
      this.moveWithCollision(p, dx, dy, p.radius);
      this.updateAimFromVector(mv.x, mv.y);
      p.walkPhase += dt * (p.blocking ? 1.2 : 2.2);
      this.state.stats.steps += Math.hypot(dx, dy) / 8;
      if (Math.random() < dt * 6 && this.zone.tiles[Math.floor(p.y / TS)]?.[Math.floor(p.x / TS)] === 'flower') {
        this.particles.push({ type: 'leaf', x: p.x + rand(-8, 8), y: p.y, vx: rand(-10, 10), vy: rand(-24, -10), life: .8, max: .8, color: '#cfe8b0', size: 1.5, rot: Math.random() * TAU });
      }
    } else {
      p.walkPhase += dt * .4;
    }
    // autoapuntado suave
    if (!p.moving && !p.attackAnim) {
      const near = this.nearestEnemy(p.x, p.y, 230);
      if (near) {
        const target = Math.atan2(near.y - p.y, near.x - p.x);
        let diff = ((target - p.aimAngle + Math.PI * 3) % TAU) - Math.PI;
        p.aimAngle += diff * Math.min(1, dt * 4);
        p.facing = { x: Math.cos(p.aimAngle), y: Math.sin(p.aimAngle) };
      }
    }
    p.statsTimer += dt;
    if (p.statsTimer > 1) { p.statsTimer = 0; this.recalc(p); }
  }

  updateAimFromVector(x, y) {
    if (Math.hypot(x, y) < .05) return;
    this.player.aimAngle = Math.atan2(y, x);
    this.player.facing = { x, y };
  }

  moveWithCollision(ent, dx, dy, r) {
    if (!dx && !dy) return;
    if (this.canWalk(ent.x + dx, ent.y, r)) ent.x += dx;
    else if (Math.abs(dx) > .01 && this.canWalk(ent.x + dx, ent.y + Math.sign(dy || 1) * 1, r)) ent.x += dx * .4;
    if (this.canWalk(ent.x, ent.y + dy, r)) ent.y += dy;
    else if (Math.abs(dy) > .01 && this.canWalk(ent.x + Math.sign(dx || 1) * 1, ent.y + dy, r)) ent.y += dy * .4;
  }

  canWalk(x, y, r = 11) {
    if (!this.zone) return false;
    const z = this.zone;
    if (x - r < 4 || y - r < 4 || x + r > z.width * TS - 4 || y + r > z.height * TS - 4) return false;
    const pts = [[-r, -r], [r, -r], [-r, r], [r, r], [0, 0], [0, -r], [0, r], [-r, 0], [r, 0]];
    for (const [ox, oy] of pts) {
      const tx = Math.floor((x + ox) / TS), ty = Math.floor((y + oy) / TS);
      const t = z.tiles[ty]?.[tx];
      if (t === undefined || SOLID_TILES.has(t)) return false;
    }
    // edificios
    for (const b of z.buildings || []) {
      const bx = b.x * TS, by = b.y * TS, bw = b.w * TS, bh = b.h * TS;
      if (x + r > bx + 4 && x - r < bx + bw - 4 && y + r > by + 22 && y - r < by + bh) return false;
    }
    // obstáculos dinámicos
    for (const o of z.obstacles || []) {
      if (o.cleared) continue;
      const ox = o.x * TS, oy = o.y * TS;
      if (o.type === 'gate') {
        if (Math.abs(x - ox) < 52 && Math.abs(y - oy) < 22) return false;
      } else if (Math.hypot(x - ox, y - oy) < r + 20) return false;
    }
    return true;
  }

  // ---------------- combate ----------------
  attack() {
    const p = this.player;
    if (!p || p.dead || p.dodgeTimer > 0) return;
    const w = p.weaponDef || WEAPONS[p.weapon];
    if (!w || p.attackCooldown > 0) return;
    if (p.stamina < w.stamina * .55) { this.audio.sfx('error'); this.toast('Sin resistencia.', 'bad'); return; }
    // apuntado asistido hacia el enemigo más cercano
    const near = this.nearestTarget(p.x, p.y, 155);
    if (near) {
      p.aimAngle = Math.atan2(near.y - p.y, near.x - p.x);
      p.facing = { x: Math.cos(p.aimAngle), y: Math.sin(p.aimAngle) };
    }
    p.stamina = Math.max(0, p.stamina - w.stamina);
    p.attackCooldown = Math.max(.16, 1 / (w.speed * p.attackSpeed));
    if (p.comboTimer > 0) p.comboIndex = (p.comboIndex + 1) % Math.max(1, p.maxCombo);
    else p.comboIndex = 0;
    p.comboTimer = 1.15;
    const dur = clamp(.46 / (w.speed / 2.4), .18, .62);
    p.attackAnim = { t: 0, duration: dur, type: w.type };
    p.attackHitDone = false;
    p.blocking = false;
    this.audio.sfx(w.type === 'arco' ? 'arrow' : w.type === 'mandoble' ? 'heavy' : 'attack');
    spawnBurst(this.particles, p.x + Math.cos(p.aimAngle) * 24, p.y - 22 + Math.sin(p.aimAngle) * 24, w.color || '#dff4ff', 5, 'spark', 70);
    // pequeño impulso
    const lunge = w.type === 'mandoble' ? 3 : 1.5;
    this.moveWithCollision(p, Math.cos(p.aimAngle) * lunge, Math.sin(p.aimAngle) * lunge, p.radius);
  }

  resolveAttack() {
    const p = this.player;
    const w = p.weaponDef || WEAPONS[p.weapon];
    if (!w) return;
    if (w.projectile) {
      const speed = w.projectile === 'arrow' ? 640 : 540;
      this.spawnProjectile({
        owner: 'player', type: w.projectile, x: p.x + Math.cos(p.aimAngle) * 20, y: p.y - 20 + Math.sin(p.aimAngle) * 20,
        vx: Math.cos(p.aimAngle) * speed, vy: Math.sin(p.aimAngle) * speed,
        damage: p.attackPower * (1 + p.comboIndex * .06) * rand(.92, 1.08),
        radius: 8, life: 1.2, color: w.color, element: w.element,
        magic: w.magic ? p.spellPower : 1,
      });
      return;
    }
    const range = w.range;
    const arc = w.arc;
    let hits = 0;
    const targets = [...this.enemies.filter(e => !e.dead && !e.hidden), ...this.wilds.filter(w2 => !w2.dead && w2.aggro)];
    for (const e of targets) {
      const d = dist(p, e);
      if (d > range + (e.radius || 12)) continue;
      const ang = Math.atan2(e.y - p.y, e.x - p.x);
      let diff = Math.abs(((ang - p.aimAngle + Math.PI * 3) % TAU) - Math.PI);
      if (diff > arc / 2) continue;
      const combo = 1 + p.comboIndex * .1;
      let dmg = p.attackPower * combo * rand(.9, 1.1);
      const crit = Math.random() < p.crit;
      if (crit) dmg *= p.critMult;
      this.damageEnemy(e, dmg, { crit, element: w.element, knock: w.knock || 80, source: 'weapon' });
      hits++;
    }
    this.effects.push({ type: 'slash', x: p.x, y: p.y - 20, angle: p.aimAngle, radius: range * 1.05, arc, color: w.color || '#eaf7ff', life: .22, max: .22 });
    if (hits) { this.shake = Math.max(this.shake, .25); }
  }

  dodge() {
    const p = this.player;
    if (p.dodgeCooldown > 0 || p.dodgeTimer > 0 || p.stamina < 14) return;
    const mv = this.input.moveVector();
    let dx = mv.mag > .1 ? mv.x : Math.cos(p.aimAngle), dy = mv.mag > .1 ? mv.y : Math.sin(p.aimAngle);
    const m = Math.hypot(dx, dy) || 1; dx /= m; dy /= m;
    p.dodgeDir = { x: dx, y: dy };
    p.dodgeTimer = .22; p.dodgeCooldown = .7; p.invuln = .38;
    p.stamina -= 14; p.attackAnim = null;
    p.aimAngle = Math.atan2(dy, dx); p.facing = { x: dx, y: dy };
    this.audio.sfx('dodge');
    this.effects.push({ type: 'ring', x: p.x, y: p.y - 18, radius: 30, color: '#a8dcff', life: .26, max: .26 });
    for (let i = 0; i < 6; i++) this.particles.push({ type: 'spark', x: p.x + rand(-7, 7), y: p.y - rand(4, 30), vx: -dx * rand(30, 90), vy: -dy * rand(30, 90), life: .3, max: .3, color: 'rgba(160,230,255,.8)', size: 1.4 });
  }

  castSpell() {
    const p = this.player;
    if (p.dead || p.spellCooldown > 0) return;
    const spell = SPELLS[p.activeSpell] || SPELLS.fuego;
    if (!p.spells.includes(spell.id)) { this.toast('Magia no desbloqueada.', 'bad'); return; }
    if (p.mana < spell.cost) { this.audio.sfx('error'); this.toast('Maná insuficiente.', 'bad'); return; }
    let target = this.nearestTarget(p.x, p.y, 320);
    if (target) { p.aimAngle = Math.atan2(target.y - p.y, target.x - p.x); p.facing = { x: Math.cos(p.aimAngle), y: Math.sin(p.aimAngle) }; }
    p.mana -= spell.cost;
    p.spellCooldown = spell.cooldown;
    if (spell.id === 'fuego') {
      this.audio.sfx('fire');
      this.spawnProjectile({ owner: 'player', type: 'fireball', x: p.x + Math.cos(p.aimAngle) * 22, y: p.y - 20 + Math.sin(p.aimAngle) * 22, vx: Math.cos(p.aimAngle) * 430, vy: Math.sin(p.aimAngle) * 430, damage: spell.damage * p.spellPower, radius: 10, life: 1.3, color: '#ff8a5c', aoe: 64, element: 'fuego' });
      this.effects.push({ type: 'burst', x: p.x + Math.cos(p.aimAngle) * 30, y: p.y - 20 + Math.sin(p.aimAngle) * 30, radius: 22, color: '#ffb36b', life: .3, max: .3, seed: Math.random() * 5 });
    } else if (spell.id === 'hielo') {
      this.audio.sfx('ice');
      this.spawnProjectile({ owner: 'player', type: 'ice', x: p.x + Math.cos(p.aimAngle) * 22, y: p.y - 20 + Math.sin(p.aimAngle) * 22, vx: Math.cos(p.aimAngle) * 500, vy: Math.sin(p.aimAngle) * 500, damage: spell.damage * p.spellPower, radius: 8, life: 1.2, color: '#b9e8ff', freeze: 2.4, element: 'hielo' });
    } else if (spell.id === 'rayo') {
      this.audio.sfx('lightning');
      const targets = [...this.enemies.filter(e => !e.dead && !e.hidden), ...this.wilds.filter(w => !w.dead && w.aggro)]
        .filter(e => dist(p, e) < 300).sort((a, b) => dist(p, a) - dist(p, b)).slice(0, 3);
      let from = { x: p.x, y: p.y - 24 };
      for (const e of targets) {
        const ang = Math.atan2(e.y - 20 - from.y, e.x - from.x);
        this.effects.push({ type: 'beam', x: from.x, y: from.y, angle: ang, length: dist(from, e), color: '#ffe169', life: .22, max: .22, width: 7 });
        this.damageEnemy(e, spell.damage * p.spellPower, { crit: false, element: 'rayo', knock: 40, source: 'spell' });
        from = { x: e.x, y: e.y - 20 };
        this.effects.push({ type: 'burst', x: e.x, y: e.y - 20, radius: 20, color: '#ffe169', life: .25, max: .25, seed: Math.random() * 6 });
      }
      if (!targets.length) {
        const end = 240;
        this.effects.push({ type: 'beam', x: p.x, y: p.y - 24, angle: p.aimAngle, length: end, color: '#ffe169', life: .2, max: .2, width: 5 });
      }
    } else if (spell.id === 'luz') {
      this.audio.sfx('heal');
      this.healPlayer(spell.heal + p.stats.intelligence * 1.5);
      this.effects.push({ type: 'heal', x: p.x, y: p.y - 20, life: .8, max: .8 });
    }
    this.playerPulse = 1;
    this.ui?.spellFlash(spell);
  }

  healPlayer(amount) {
    const p = this.player;
    const real = Math.min(p.maxHp - p.hp, amount);
    p.hp = Math.min(p.maxHp, p.hp + amount);
    this.effects.push({ type: 'text', x: p.x, y: p.y - 62, text: `+${Math.round(real)}`, color: '#9bffc4', life: .9, max: .9, serif: true });
    for (let i = 0; i < 10; i++) this.particles.push({ type: 'star', x: p.x + rand(-16, 16), y: p.y - rand(0, 40), vx: rand(-10, 10), vy: rand(-45, -18), life: .7, max: .7, color: '#a5ffcc', size: 1.6 });
  }

  nearestEnemy(x, y, r, includeWild = false) {
    let best = null, bd = r;
    for (const e of this.enemies) {
      if (e.dead || e.hidden) continue;
      const d = Math.hypot(e.x - x, e.y - y);
      if (d < bd) { bd = d; best = e; }
    }
    if (includeWild) for (const w of this.wilds) {
      if (w.dead) continue;
      const d = Math.hypot(w.x - x, w.y - y);
      if (d < bd) { bd = d; best = w; }
    }
    return best;
  }
  nearestTarget(x, y, r) { return this.nearestEnemy(x, y, r, true); }

  damageEnemy(e, amount, opts = {}) {
    if (!e || e.dead) return;
    let dmg = Math.max(1, amount - (e.defense || 0) * .3);
    if (opts.crit) dmg *= 1;
    e.hp -= dmg;
    e.hurt = .28;
    e.aggro = true;
    e.stun = Math.max(e.stun || 0, opts.stun || (opts.crit ? .22 : .08));
    this.state.stats.damage += dmg;
    if (opts.knock && !e.boss) {
      const a = Math.atan2(e.y - this.player.y, e.x - this.player.x);
      e.x += Math.cos(a) * Math.min(28, opts.knock / 5);
      e.y += Math.sin(a) * Math.min(28, opts.knock / 5);
    }
    this.effects.push({ type: 'text', x: e.x + rand(-5, 5), y: e.y - (e.radius || 16) * 2.2, text: `${Math.round(dmg)}${opts.crit ? '!' : ''}`, color: opts.crit ? '#ffe169' : '#fff2d6', life: .8, max: .8, big: opts.crit, serif: false });
    spawnBurst(this.particles, e.x, e.y - (e.radius || 16), opts.crit ? '#ffe169' : (opts.element ? (AFFINITIES[opts.element]?.color || '#fff') : '#ffd0b0'), opts.crit ? 15 : 8, 'spark', opts.crit ? 160 : 100);
    this.audio.sfx(opts.crit ? 'crit' : 'hit');
    this.shake = Math.max(this.shake, opts.crit ? .42 : .18);
    if (e.hp <= 0) this.killEnemy(e, opts);
  }

  killEnemy(e, opts = {}) {
    if (e.dead) return;
    e.dead = true;
    const def = ENEMIES[e.type] || {};
    const wild = e.species ? CREATURES[e.species] : null;
    const xp = wild ? 22 + e.level * 6 : (def.xp || 10);
    this.gainXp(xp);
    const gold = Math.round((def.gold || (wild ? 4 : 5)) * this.player.goldBonus * rand(.8, 1.2));
    this.dropCoins(gold, e.x, e.y);
    const drop = wild ? null : def.drop;
    if (drop && Math.random() < (def.dropChance || .2)) this.dropItem(drop, 1, e.x, e.y);
    if (e.type === 'jelly' || (wild && wild.id === 'brotito')) {
      this.state.quests.jelly.count = (this.state.quests.jelly.count || 0) + 1;
      this.state.stats.jellies++;
    }
    this.state.stats.kills++;
    if (e.type === 'jelly' && Math.random() < .55) this.dropItem('hierba', 1, e.x + rand(-10, 10), e.y + rand(-6, 6));
    spawnBurst(this.particles, e.x, e.y - 14, def.color || '#a5f0c0', 18, 'spark', 130);
    this.effects.push({ type: 'ring', x: e.x, y: e.y - 12, radius: 44, color: def.color || '#a5f0c0', life: .45, max: .45 });
    if (e.boss) this.onBossDefeated(e);
    this.audio.sfx(def.boss ? 'victory' : 'hit');
    this.ui?.refreshQuest(this);
  }

  gainXp(amount) {
    const p = this.player;
    p.xp += Math.round(amount);
    while (p.xp >= p.xpNext) {
      p.xp -= p.xpNext;
      p.level++;
      p.xpNext = Math.round(60 * Math.pow(p.level, 1.32));
      p.skillPoints++;
      this.recalc(p);
      p.hp = Math.min(p.maxHp, p.hp + p.maxHp * .45);
      p.mana = Math.min(p.maxMana, p.mana + p.maxMana * .45);
      this.effects.push({ type: 'levelup', x: p.x, y: p.y, life: 1.5, max: 1.5 });
      this.effects.push({ type: 'text', x: p.x, y: p.y - 80, text: '¡NIVEL ' + p.level + '!', color: '#ffe6a8', life: 1.4, max: 1.4, big: true, serif: true });
      this.toast(`Nivel ${p.level}. +1 punto de habilidad.`, 'gold');
      this.audio.sfx('level');
      this.playerPulse = 1;
      spawnBurst(this.particles, p.x, p.y - 22, '#ffe6a8', 24, 'star', 120);
    }
  }

  damagePlayer(amount, source = null, opts = {}) {
    const p = this.player;
    if (!p || p.dead || p.invuln > 0 || p.dodgeTimer > 0) return;
    if (p.blocking && !opts.unblockable) {
      const parry = p.skills.includes('parry') && p.blockTime < .5;
      const reduce = p.skills.includes('guardia') ? .32 : .45;
      const stam = Math.min(p.stamina, 12);
      p.stamina -= stam;
      this.audio.sfx('block');
      this.effects.push({ type: 'burst', x: p.x + Math.cos(p.aimAngle) * 18, y: p.y - 26, radius: 22, color: '#cfe8ff', life: .25, max: .25, seed: Math.random() * 6 });
      this.shake = Math.max(this.shake, .2);
      if (parry && source && !source.boss) {
        source.stun = 1.4;
        this.toast('¡Contraataque!', 'gold');
        this.effects.push({ type: 'ring', x: source.x, y: source.y - 15, radius: 40, color: '#ffe6a8', life: .4, max: .4 });
      }
      amount *= reduce;
    }
    const dmg = Math.max(2, amount - p.defenseTotal * .36);
    p.hp -= dmg;
    p.hurtFlash = 1;
    p.invuln = .55;
    this.shake = Math.max(this.shake, .65);
    this.audio.sfx('hurt');
    this.ui?.damageFlash();
    this.effects.push({ type: 'text', x: p.x, y: p.y - 58, text: `-${Math.round(dmg)}`, color: '#ff9aa6', life: .9, max: .9, big: true });
    spawnBurst(this.particles, p.x, p.y - 24, '#ff8090', 9, 'spark', 90);
    if (p.hp <= 0) this.playerDeath();
  }

  playerDeath() {
    if (this.player.dead) return;
    this.player.dead = true;
    this.player.hp = 0;
    this.audio.sfx('death');
    this.audio.music('ruins');
    this.overlay = true;
    this.deathTimer = 1.3;
    this.effects.push({ type: 'burst', x: this.player.x, y: this.player.y - 24, radius: 52, color: '#ff8090', life: .8, max: .8, seed: 1 });
  }

  revive() {
    const p = this.player;
    const lost = Math.round(p.gold * .1);
    p.gold = Math.max(0, p.gold - lost);
    p.dead = false;
    p.hp = p.maxHp; p.mana = p.maxMana; p.stamina = p.maxStamina;
    p.invuln = 2;
    this.overlay = false;
    this.ui?.hideGameOver();
    const r = this.state.respawn || { zone: 'aldea', x: 9.5, y: 18.5 };
    this.loadZone(r.zone, { x: r.x, y: r.y });
    this.ui?.zoneBanner(this.zone);
    this.toast(`Has renacido en el santuario. -${lost} oro.`, 'bad');
    this.audio.music(this.zone.music);
  }

  cycleWeapon() {
    const p = this.player;
    const owned = Object.keys(WEAPONS).filter(id => id === p.equipment.weapon || (p.inventory[id] || 0) > 0);
    if (owned.length < 2) { this.toast('Solo tienes un arma. Visita la forja o el bazar.', 'bad'); return; }
    const i = owned.indexOf(p.equipment.weapon);
    const next = owned[(i + 1) % owned.length];
    p.equipment.weapon = next; p.weapon = next; p.attackAnim = null;
    this.recalc(p);
    this.audio.sfx('menu');
    this.toast(`Arma equipada: ${WEAPONS[next].name}`, 'gold');
    this.ui?.updateHUD(this);
  }

  quickItem() {
    const p = this.player;
    if (p.hp < p.maxHp * .95 && p.inventory.pocion > 0) { this.useItem('pocion'); return; }
    if (p.mana < p.maxMana * .7 && p.inventory.eter > 0) { this.useItem('eter'); return; }
    if (p.inventory.elixir > 0) { this.useItem('elixir'); return; }
    this.toast('No tienes objetos de recuperación.', 'bad');
    this.audio.sfx('error');
  }

  useItem(id) {
    const p = this.player;
    const def = ITEMS[id];
    if (!def || !(p.inventory[id] > 0)) return;
    if (def.effect) {
      if (def.effect.hp) this.healPlayer(def.effect.hp);
      if (def.effect.mana) {
        const real = Math.min(p.maxMana - p.mana, def.effect.mana);
        p.mana += real;
        this.effects.push({ type: 'text', x: p.x, y: p.y - 78, text: `+${Math.round(real)} MP`, color: '#8fd0ff', life: .9, max: .9 });
      }
      p.inventory[id]--;
      if (p.inventory[id] <= 0) delete p.inventory[id];
      this.audio.sfx('pickup');
      this.toast(`${def.name} utilizada.`, 'good');
      this.ui?.updateHUD(this);
      this.ui?.renderMenu();
    } else if (def.kind === 'food') {
      this.toast('Eso es alimento de criaturas. Úsalo desde el menú Criaturas.', 'bad');
    }
  }

  // ---------------- proyectiles, botín, efectos ----------------
  spawnProjectile(o) {
    this.projectiles.push({
      ...o, life: o.life || 1.2, maxLife: o.life || 1.2,
      trail: [], radius: o.radius || 7, pierce: o.pierce || false,
    });
  }

  updateProjectiles(dt) {
    const p = this.player;
    for (const pr of this.projectiles) {
      if (pr.dead) continue;
      pr.life -= dt;
      pr.x += pr.vx * dt; pr.y += pr.vy * dt;
      if (pr.life <= 0) { pr.dead = true; if (pr.aoe) this.explode(pr.x, pr.y, pr.aoe, pr.damage, pr.owner, pr.element); continue; }
      const tx = Math.floor(pr.x / TS), ty = Math.floor(pr.y / TS);
      const tile = this.zone.tiles[ty]?.[tx];
      if (tile && SOLID_TILES.has(tile) && tile !== 'water') {
        pr.dead = true;
        if (pr.aoe) this.explode(pr.x, pr.y, pr.aoe, pr.damage, pr.owner, pr.element);
        else this.effects.push({ type: 'burst', x: pr.x, y: pr.y, radius: 12, color: pr.color || '#fff', life: .2, max: .2, seed: Math.random() * 6 });
        continue;
      }
      if (pr.owner === 'player' || pr.owner === 'pet') {
        let hit = null;
        for (const e of [...this.enemies, ...this.wilds]) {
          if (e.dead || e.hidden || (e.species && !e.aggro)) continue;
          if (Math.hypot(e.x - pr.x, e.y - 18 - pr.y) < (e.radius || 14) + pr.radius) { hit = e; break; }
        }
        if (hit) {
          pr.dead = true;
          if (pr.aoe) this.explode(pr.x, pr.y, pr.aoe, pr.damage, pr.owner, pr.element);
          else {
            this.damageEnemy(hit, pr.damage, { crit: Math.random() < p.crit, element: pr.element, knock: 50, source: pr.owner });
            if (pr.freeze) { hit.stun = Math.max(hit.stun || 0, pr.freeze); this.effects.push({ type: 'ring', x: hit.x, y: hit.y - 15, radius: 24, color: '#b9e8ff', life: .3, max: .3 }); }
          }
        }
      } else if (pr.owner === 'enemy') {
        if (!p.dead && Math.hypot(p.x - pr.x, p.y - 20 - pr.y) < p.radius + pr.radius + 4) {
          pr.dead = true;
          this.damagePlayer(pr.damage, pr.source, { unblockable: pr.unblockable });
          if (pr.aoe) this.effects.push({ type: 'burst', x: pr.x, y: pr.y, radius: pr.aoe, color: pr.color || '#ff8090', life: .3, max: .3, seed: Math.random() * 6 });
        }
      }
    }
    this.projectiles = this.projectiles.filter(p2 => !p2.dead);
  }

  explode(x, y, radius, damage, owner, element, source = null) {
    const color = element ? (AFFINITIES[element]?.color || '#ffb36b') : '#ffb36b';
    this.effects.push({ type: 'burst', x, y, radius, color, life: .38, max: .38, seed: Math.random() * 6 });
    this.effects.push({ type: 'ring', x, y, radius: radius * .9, color, life: .35, max: .35 });
    this.shake = Math.max(this.shake, .3);
    if (owner === 'player' || owner === 'pet') {
      for (const e of [...this.enemies, ...this.wilds]) {
        if (e.dead || e.hidden) continue;
        if (Math.hypot(e.x - x, e.y - y) < radius + (e.radius || 14)) this.damageEnemy(e, damage, { element, knock: 40, source: owner });
      }
    } else {
      if (Math.hypot(this.player.x - x, this.player.y - y) < radius + 10) this.damagePlayer(damage, source);
    }
    spawnBurst(this.particles, x, y, color, 22, 'spark', 190);
  }

  dropCoins(amount, x, y) {
    let left = amount;
    const n = Math.min(7, Math.max(1, Math.ceil(amount / 9)));
    for (let i = 0; i < n; i++) {
      const val = Math.max(1, Math.round(left / (n - i)));
      left -= val;
      this.loot.push({ kind: 'coin', item: 'coin', amount: val, x: x + rand(-18, 18), y: y + rand(-10, 14), vx: rand(-30, 30), vy: rand(-40, -10), life: 30, seed: Math.random() * 6, color: '#ffd77a' });
    }
  }

  dropItem(id, amount, x, y) {
    const def = itemDef(id);
    const kind = def?.kind === 'weapon' || def?.kind === 'armor' || def?.kind === 'accessory' ? 'gear' : def?.kind === 'seal' ? 'seal' : def?.kind === 'material' ? 'crystal' : 'potion';
    this.loot.push({ kind, item: id, amount, x, y, vx: rand(-40, 40), vy: rand(-52, -18), life: 30, seed: Math.random() * 6, color: def?.color || (def?.icon === 'crystal' ? '#a6b4ff' : '#ffd77a') });
  }

  updateLoot(dt) {
    const p = this.player;
    for (const l of this.loot) {
      l.life -= dt;
      l.x += (l.vx || 0) * dt; l.y += (l.vy || 0) * dt;
      l.vx = (l.vx || 0) * .94; l.vy = (l.vy || 0) * .94;
      if (l.life <= 0) { l.dead = true; continue; }
      if (!p.dead && Math.hypot(p.x - l.x, p.y - l.y) < 38) {
        l.dead = true;
        if (l.kind === 'coin') {
          p.gold += l.amount;
          this.audio.sfx('coin');
          this.effects.push({ type: 'text', x: p.x, y: p.y - 54, text: `+${l.amount}`, color: '#ffe6a8', life: .8, max: .8 });
        } else {
          p.inventory[l.item] = (p.inventory[l.item] || 0) + l.amount;
          this.audio.sfx('pickup');
          this.toast(`Obtienes ${itemName(l.item)}${l.amount > 1 ? ' ×' + l.amount : ''}.`, 'good');
          if (itemDef(l.item)?.kind === 'weapon' || itemDef(l.item)?.kind === 'armor' || itemDef(l.item)?.kind === 'accessory') this.toast(`Equípatelo desde el menú Equipo.`, 'gold');
        }
      }
    }
    this.loot = this.loot.filter(l => !l.dead);
  }

  updateEffects(dt) {
    for (const e of this.effects) e.life -= dt;
    this.effects = this.effects.filter(e => e.life > 0);
    for (const pa of this.particles) {
      pa.life -= dt;
      pa.x += (pa.vx || 0) * dt; pa.y += (pa.vy || 0) * dt;
      pa.vx = (pa.vx || 0) * .95; pa.vy = (pa.vy || 0) * .95;
      if (pa.type === 'leaf') pa.rot = (pa.rot || 0) + dt * 3;
      else if (pa.type !== 'spark') pa.vy = (pa.vy || 0) + 28 * dt;
    }
    this.particles = this.particles.filter(p => p.life > 0);
    for (const l of this.loot) l.life -= dt;
    this.loot = this.loot.filter(l => l.life > 0);
    // cadáveres se desvanecen
    if (this.player?.dead) {
      this.deathTimer = (this.deathTimer || 0) - dt;
      if (this.deathTimer <= 0 && !this.ui?.gameOverShown) this.ui?.showGameOver();
    }
    if (this.pendingEnding > 0) {
      this.pendingEnding -= dt;
      if (this.pendingEnding <= 0) { this.pendingEnding = 0; this.ui?.showEnding(this); }
    }
  }

  // ---------------- enemigos y criaturas salvajes ----------------
  spawnEnemy(type, x, y, opts = {}) {
    const def = ENEMIES[type];
    if (!def) return null;
    const plvl = this.player?.level || 1;
    const scale = opts.boss ? 1 : 1 + Math.max(0, plvl - 1) * .055;
    const hp = Math.round((def.hp || 30) * scale);
    const e = {
      type, def, x, y, homeX: x, homeY: y, level: opts.level || plvl,
      hp, maxHp: hp, atk: (def.atk || 5) * (opts.boss ? 1 : 1 + Math.max(0, plvl - 1) * .035),
      speed: def.speed || 50, radius: def.radius || 16, seed: Math.random() * 11,
      facing: 'right', dead: false, aggro: false, boss: !!def.boss,
      hidden: !!opts.hidden, phase: 1, stun: 0, hurt: 0, windup: 0, windupStruck: false,
      attackCd: rand(.6, 1.6), casting: 0, aim: 0, vx: 0, vy: 0,
      wobble: Math.random() * TAU, wander: opts.wander || 0, deathT: 0,
      chargeT: 0, chargeDir: { x: 0, y: 0 }, pat: 0,
      attackRange: def.behavior === 'caster' ? 250 : def.behavior === 'bounce' ? 30 : def.boss ? 90 : 38,
      zoneBoss: null,
    };
    if (def.boss) { e.attackRange = 104; e.attackCd = 1.4; }
    this.enemies.push(e);
    return e;
  }

  spawnWild(species, x, y, opts = {}) {
    const def = CREATURES[species];
    if (!def) return null;
    const level = opts.level || Math.max(2, Math.round((this.player?.level || 1) * .5) + 1 + Math.floor(Math.random() * 2));
    const hp = Math.round(def.base.hp * (1 + level * .14));
    const w = {
      species, def, x, y, homeX: x, homeY: y, level, hp, maxHp: hp,
      atk: def.base.atk * (1 + level * .08), defense: def.base.def || 0,
      radius: 17, seed: Math.random() * 10, flip: Math.random() < .5 ? -1 : 1,
      aggro: false, dead: false, hurt: 0, stun: 0, windup: 0, windupStruck: false,
      attackCd: rand(.8, 2), capturable: false, wobble: Math.random() * TAU, deathT: 0,
    };
    this.wilds.push(w);
    if (this.state) {
      this.state.seen = this.state.seen || {};
      this.state.seen[species] = true;
    }
    return w;
  }

  updateEnemies(dt) {
    const p = this.player;
    if (!p) return;
    for (const e of this.enemies) {
      if (e.dead) { e.deathT = (e.deathT || 0) + dt; continue; }
      e.hurt = Math.max(0, e.hurt - dt * 3);
      e.stun = Math.max(0, (e.stun || 0) - dt);
      e.attackCd = Math.max(0, (e.attackCd || 0) - dt);
      e.casting = Math.max(0, (e.casting || 0) - dt);
      if (e.boss) { this.updateBoss(e, dt); continue; }
      if (e.hidden) continue;
      const dx = p.x - e.x, dy = p.y - e.y;
      const d = Math.hypot(dx, dy) || 1;
      if (!p.dead && d < 275) e.aggro = true;
      if (!e.aggro) { this.wanderEnemy(e, dt); continue; }
      if (e.stun > 0) continue;
      e.facing = dx < 0 ? 'left' : 'right';
      e.aim = Math.atan2(dy, dx);
      if (e.windup > 0) {
        e.windup -= dt;
        if (!e.windupStruck && e.windup <= 0) { e.windupStruck = true; this.enemyStrike(e); }
        continue;
      }
      if (d > e.attackRange) {
        let sp = e.speed;
        if (e.def.behavior === 'bounce') sp *= .8;
        const nx = e.x + (dx / d) * sp * dt, ny = e.y + (dy / d) * sp * dt;
        this.moveWithCollision(e, nx - e.x, ny - e.y, e.radius * .75);
      } else if (e.attackCd <= 0) {
        e.windup = e.def.behavior === 'tank' ? .62 : e.def.behavior === 'caster' ? .5 : .38;
        e.windupStruck = false;
        e.casting = e.def.behavior === 'caster' ? e.windup : 0;
        e.attackCd = rand(1.15, 2.1) + e.windup;
        this.effects.push({ type: 'ring', x: e.x, y: e.y - 12, radius: e.radius + 12, color: e.def.color || '#ff8090', life: e.windup, max: e.windup });
      }
      this.separateEnemy(e);
    }
    this.enemies = this.enemies.filter(e => !e.dead);
  }

  wanderEnemy(e, dt) {
    if (!e.wander) return;
    const tx = e.homeX + Math.cos(this.time * .45 + e.seed) * e.wander * .5;
    const ty = e.homeY + Math.sin(this.time * .38 + e.seed * 1.7) * e.wander * .35;
    const dx = tx - e.x, dy = ty - e.y, d = Math.hypot(dx, dy);
    if (d > 6) this.moveWithCollision(e, (dx / d) * Math.min(24, d) * dt, (dy / d) * Math.min(24, d) * dt, e.radius * .7);
    e.facing = dx < 0 ? 'left' : 'right';
  }

  separateEnemy(e) {
    for (const o of this.enemies) {
      if (o === e || o.dead) continue;
      const dx = e.x - o.x, dy = e.y - o.y;
      const d = Math.hypot(dx, dy);
      const min = e.radius + o.radius + 6;
      if (d > 0 && d < min) {
        const push = (min - d) * .5;
        this.moveWithCollision(e, (dx / d) * push, (dy / d) * push, e.radius * .7);
      }
    }
  }

  enemyStrike(e) {
    const p = this.player;
    if (!p || p.dead) return;
    const d = dist(e, p);
    if (e.def.behavior === 'caster') {
      const ang = Math.atan2(p.y - 20 - (e.y - 18), p.x - e.x);
      const shots = e.type === 'specter' ? 2 : 1;
      for (let i = 0; i < shots; i++) {
        const a = ang + (i - (shots - 1) / 2) * .16;
        this.spawnProjectile({
          owner: 'enemy', type: 'orb', source: e,
          x: e.x + Math.cos(a) * 22, y: e.y - 18 + Math.sin(a) * 22,
          vx: Math.cos(a) * 205, vy: Math.sin(a) * 205,
          damage: e.atk * .85, radius: 8, life: 2.4,
          color: e.def.color || '#b899ff',
        });
      }
      this.audio.sfx('magic');
      this.effects.push({ type: 'burst', x: e.x, y: e.y - 20, radius: 22, color: e.def.color || '#b899ff', life: .25, max: .25, seed: Math.random() * 6 });
      return;
    }
    if (e.def.behavior === 'tank' || e.def.behavior === 'boss') {
      this.effects.push({ type: 'shockwave', x: e.x, y: e.y, radius: 74, color: e.def.color2 || '#c9a06c', life: .35, max: .35, width: 4 });
      this.shake = Math.max(this.shake, .3);
      if (d < 82) this.damagePlayer(e.atk * 1.25, e);
      return;
    }
    if (d < e.radius + p.radius + 24) {
      this.damagePlayer(e.atk, e);
      this.effects.push({ type: 'slash', x: e.x, y: e.y - 16, angle: e.aim, radius: 42, arc: 1.4, color: e.def.color || '#ff9a9a', life: .18, max: .18 });
    }
    this.audio.sfx('attack');
  }

  requirementsMet(req) {
    if (!req) return true;
    if (req === 'runas') return (this.zone.runes || []).length > 0 && this.zone.runes.every(r => r.lit);
    if (req === 'braziers') return (this.zone.braziers || []).length > 0 && this.zone.braziers.every(b => b.lit);
    if (req === 'altar') return !!this.state.forged;
    return true;
  }

  updateBoss(e, dt) {
    const p = this.player;
    if (!p) return;
    if (e.hidden) {
      const req = this.zone.boss?.requires;
      if (this.requirementsMet(req) && dist(e, p) < 360 && !p.dead) {
        e.hidden = false;
        this.currentBoss = e;
        this.ui?.showBoss(e);
        this.ui?.updateBoss?.(e);
        this.audio.music('boss');
        this.audio.sfx('boss');
        this.shake = Math.max(this.shake, .8);
        this.toast(`${ENEMIES[e.type].name} despierta.`, 'bad');
        this.effects.push({ type: 'ring', x: e.x, y: e.y - 20, radius: 120, color: e.def.color, life: .8, max: .8, width: 4 });
        spawnBurst(this.particles, e.x, e.y - 30, e.def.color, 30, 'star', 180);
      }
      return;
    }
    this.currentBoss = e;
    e.hurt = Math.max(0, e.hurt - dt * 3);
    e.stun = Math.max(0, (e.stun || 0) - dt);
    e.attackCd = Math.max(0, e.attackCd - dt);
    const ratio = e.hp / e.maxHp;
    const phases = e.def.phases || 2;
    let targetPhase = 1;
    if (phases >= 3) targetPhase = ratio > .66 ? 1 : ratio > .33 ? 2 : 3;
    else targetPhase = ratio > .5 ? 1 : 2;
    if (targetPhase > e.phase) {
      e.phase = targetPhase;
      e.attackCd = Math.max(e.attackCd, .9);
      e.stun = Math.max(e.stun, .35);
      this.shake = Math.max(this.shake, .7);
      this.audio.sfx('boss');
      this.ui?.showBoss(e);
      this.toast(`${e.def.name} · Fase ${e.phase === 2 ? 'II' : 'III'}`, 'bad');
      this.effects.push({ type: 'burst', x: e.x, y: e.y - 26, radius: 70, color: e.def.color, life: .55, max: .55, seed: Math.random() * 6 });
      spawnBurst(this.particles, e.x, e.y - 28, e.def.color, 26, 'star', 190);
    }
    if (p.dead || e.stun > 0) return;
    e.aim = Math.atan2(p.y - e.y, p.x - e.x);
    e.facing = p.x < e.x ? 'left' : 'right';
    if (e.chargeT > 0) {
      e.chargeT -= dt;
      this.moveWithCollision(e, e.chargeDir.x * 470 * dt, e.chargeDir.y * 470 * dt, e.radius * .8);
      if (Math.random() < .55) this.particles.push({ type: 'spark', x: e.x + rand(-10, 10), y: e.y - rand(8, 30), vx: rand(-25, 25), vy: rand(-15, 15), life: .3, max: .3, color: e.def.color, size: 1.5 });
      if (dist(e, p) < e.radius + p.radius + 8) this.damagePlayer(e.atk * 1.2, e);
      return;
    }
    if (e.windup > 0) {
      e.windup -= dt;
      if (!e.windupStruck && e.windup <= 0) { e.windupStruck = true; this.enemyStrike(e); }
      return;
    }
    const d = dist(e, p);
    const moveSpeed = e.speed * (1 + (e.phase - 1) * .12);
    if (d > 150) {
      this.moveWithCollision(e, Math.cos(e.aim) * moveSpeed * dt, Math.sin(e.aim) * moveSpeed * dt, e.radius * .75);
    } else if (e.attackCd <= 0) {
      e.attackCd = Math.max(.65, 1.75 - (e.phase - 1) * .22) + rand(0, .3);
      this.bossPattern(e, d);
    } else if (d < 105) {
      // orbitar lentamente
      const side = Math.sin(this.time * 1.3 + e.seed) > 0 ? 1 : -1;
      this.moveWithCollision(e, Math.cos(e.aim + Math.PI / 2) * side * 34 * dt, Math.sin(e.aim + Math.PI / 2) * side * 34 * dt, e.radius * .7);
    }
  }

  bossPattern(e, d) {
    const p = this.player;
    const ang = Math.atan2(p.y - 20 - (e.y - 24), p.x - e.x);
    e.pat++;
    const fire = (a, speed, dmg, type = 'orb', color = e.def.color, radius = 9, life = 2.6) => {
      this.spawnProjectile({
        owner: 'enemy', type, source: e,
        x: e.x + Math.cos(a) * (e.radius + 8), y: e.y - 22 + Math.sin(a) * (e.radius + 8),
        vx: Math.cos(a) * speed, vy: Math.sin(a) * speed,
        damage: dmg, radius, life, color,
      });
    };
    const ring = (n, speed, dmg, color = e.def.color, offset = 0) => {
      for (let i = 0; i < n; i++) fire(offset + i / n * TAU, speed, dmg, 'orb', color);
    };
    if (e.type === 'queen') {
      if (e.pat % 3 === 0) {
        this.effects.push({ type: 'shockwave', x: e.x, y: e.y, radius: 120, color: '#8fe3a0', life: .45, max: .45, width: 5 });
        this.shake = Math.max(this.shake, .45);
        if (d < 130) this.damagePlayer(e.atk * 1.2, e);
      } else {
        const n = 2 + e.phase;
        for (let i = 0; i < n; i++) fire(ang + (i - (n - 1) / 2) * .2, 175, e.atk * .8, 'orb', e.def.color, 10, 2.8);
        if (e.phase >= 2 && e.pat % 2 === 0) ring(6, 110, e.atk * .6, '#b6ffd0', this.time);
      }
      this.audio.sfx('magic');
    } else if (e.type === 'guardian') {
      if (d > 170) {
        e.chargeT = .5;
        e.chargeDir = { x: Math.cos(ang), y: Math.sin(ang) };
        this.effects.push({ type: 'ring', x: e.x, y: e.y - 20, radius: 42, color: '#ffcf7a', life: .3, max: .3 });
      } else {
        ring(8 + (e.phase - 1) * 3, 150, e.atk * .78, '#c9a06c', Math.random() * TAU);
        this.effects.push({ type: 'shockwave', x: e.x, y: e.y, radius: 90, color: '#e0b77a', life: .4, max: .4, width: 5 });
        if (d < 100) this.damagePlayer(e.atk * 1.15, e);
      }
      this.audio.sfx('heavy');
    } else if (e.type === 'tide') {
      if (e.pat % 2 === 0) ring(10 + (e.phase - 1) * 2, 132, e.atk * .72, '#66c8ff', this.time * .5);
      else {
        for (let i = 0; i < 3 + e.phase; i++) fire(ang + (i - (2 + e.phase) / 2) * .18, 225, e.atk * .85, 'wave', '#8fe3ff', 11, 2.3);
      }
      this.effects.push({ type: 'ring', x: e.x, y: e.y - 18, radius: 80, color: '#66c8ff', life: .45, max: .45, width: 3 });
      this.audio.sfx('ice');
    } else if (e.type === 'eclipse') {
      if (e.pat % 5 === 0) {
        const minions = this.enemies.filter(x => !x.boss && x.type === 'specter' && !x.dead).length;
        if (minions < 2) {
          const a = Math.random() * TAU;
          const s = this.spawnEnemy('specter', e.x + Math.cos(a) * 70, e.y + Math.sin(a) * 70);
          if (s) { s.aggro = true; this.effects.push({ type: 'burst', x: s.x, y: s.y - 18, radius: 34, color: '#b899ff', life: .4, max: .4, seed: 2 }); }
        }
      } else if (e.phase >= 2 && e.pat % 3 === 0) {
        // haces oscuros
        for (let i = -2; i <= 2; i++) {
          const a = ang + i * .18;
          this.effects.push({ type: 'beam', x: e.x, y: e.y - 24, angle: a, length: 360, color: '#c9a6ff', life: .45, max: .45, width: 9 });
          const lx = p.x, ly = p.y - 20;
          const dx = lx - e.x, dy = ly - e.y;
          const proj = dx * Math.cos(a) + dy * Math.sin(a);
          const perp = Math.abs(-dx * Math.sin(a) + dy * Math.cos(a));
          if (proj > 0 && proj < 360 && perp < 20) this.damagePlayer(e.atk * 1.1, e);
        }
        this.audio.sfx('lightning');
      } else {
        const n = 4 + e.phase;
        for (let i = 0; i < n; i++) fire(ang + (i - (n - 1) / 2) * .16, 210, e.atk * .8, 'orb', i % 2 ? '#b899ff' : '#f4d998', 10, 2.5);
        if (e.phase >= 3) ring(9, 120, e.atk * .55, '#7d55e8', this.time * .3);
      }
      this.audio.sfx('magic');
    }
  }

  updateWilds(dt) {
    const p = this.player;
    for (const w of this.wilds) {
      if (w.dead) { w.deathT = (w.deathT || 0) + dt; continue; }
      w.hurt = Math.max(0, (w.hurt || 0) - dt * 3);
      w.stun = Math.max(0, (w.stun || 0) - dt);
      w.attackCd = Math.max(0, (w.attackCd || 0) - dt);
      const wasC = w.capturable;
      w.capturable = w.hp / w.maxHp <= .42;
      if (w.capturable && !wasC) {
        this.effects.push({ type: 'ring', x: w.x, y: w.y - 18, radius: 30, color: '#ffe6a8', life: .55, max: .55 });
        this.toast(`${w.def.name} está debilitada. Pulsa R para capturarla.`, 'gold');
      }
      if (w.windup > 0) {
        w.windup -= dt;
        if (!w.windupStruck && w.windup <= 0) {
          w.windupStruck = true;
          if (dist(w, p) < 48) this.damagePlayer(w.atk, w);
          this.effects.push({ type: 'slash', x: w.x, y: w.y - 14, angle: Math.atan2(p.y - w.y, p.x - w.x), radius: 36, arc: 1.3, color: w.def.color, life: .2, max: .2 });
        }
        continue;
      }
      const dx = p.x - w.x, dy = p.y - w.y, d = Math.hypot(dx, dy) || 1;
      if (!w.aggro && d < 230 && !p.dead) w.aggro = true;
      if (!w.aggro) {
        const tx = w.homeX + Math.cos(this.time * .5 + w.wobble) * 26;
        const ty = w.homeY + Math.sin(this.time * .42 + w.wobble) * 20;
        const ax = tx - w.x, ay = ty - w.y, ad = Math.hypot(ax, ay);
        if (ad > 5) this.moveWithCollision(w, (ax / ad) * 16 * dt, (ay / ad) * 16 * dt, w.radius * .65);
        w.flip = ax < 0 ? -1 : 1;
      } else if (w.stun <= 0) {
        w.flip = dx < 0 ? -1 : 1;
        if (d > 36) this.moveWithCollision(w, (dx / d) * 46 * dt, (dy / d) * 46 * dt, w.radius * .65);
        else if (w.attackCd <= 0) {
          w.windup = .34; w.windupStruck = false; w.attackCd = rand(1.3, 2);
        }
      }
    }
    this.wilds = this.wilds.filter(w => !w.dead);
  }

  // ---------------- mascota / captura ----------------
  activeCreatureInst() {
    const p = this.player;
    if (!p || !p.activeCreature) return null;
    return p.creatures.find(c => c.uid === p.activeCreature) || null;
  }

  updateFollower(dt) {
    const inst = this.activeCreatureInst();
    if (!inst) { this.follower = null; return; }
    const p = this.player;
    if (!this.follower || this.follower.uid !== inst.uid) {
      this.follower = { uid: inst.uid, species: inst.species, x: p.x - 30, y: p.y + 8, seed: Math.random() * 6 };
    }
    this.follower.species = inst.species;
    const tx = p.x - Math.cos(p.aimAngle) * 34 + Math.cos(this.time * 1.3 + this.follower.seed) * 6;
    const ty = p.y + 12 + Math.sin(this.time * 1.7 + this.follower.seed) * 5;
    this.follower.x += (tx - this.follower.x) * Math.min(1, dt * 5.5);
    this.follower.y += (ty - this.follower.y) * Math.min(1, dt * 5.5);
    this.petAutoCd = Math.max(0, (this.petAutoCd || 0) - dt);
    if (this.petAutoCd <= 0 && !p.dead) {
      const target = this.nearestEnemy(p.x, p.y, 310, false) || this.wilds.find(w => !w.dead && w.aggro && dist(w, p) < 280);
      if (target) {
        this.petAutoCd = p.skills.includes('invocacion') ? 2.4 : 3.4;
        this.petFire(target, inst, 1);
      }
    }
  }

  petFire(target, inst, shots = 1) {
    const def = CREATURES[inst.species];
    if (!def) return;
    const ang = Math.atan2(target.y - 20 - (this.follower.y - 18), target.x - this.follower.x);
    const col = AFFINITIES[def.affinity]?.color || def.color;
    const type = def.affinity === 'fuego' ? 'fireball' : def.affinity === 'hielo' ? 'ice' : def.affinity === 'rayo' ? 'star' : 'orb';
    const dmg = 5 + def.base.atk * .36 + inst.level * 1.6;
    for (let i = 0; i < shots; i++) {
      const a = ang + (i - (shots - 1) / 2) * .18;
      this.spawnProjectile({
        owner: 'pet', type, x: this.follower.x, y: this.follower.y - 18,
        vx: Math.cos(a) * 290, vy: Math.sin(a) * 290,
        damage: dmg, radius: 8, life: 1.5, color: col,
      });
    }
    this.effects.push({ type: 'burst', x: this.follower.x, y: this.follower.y - 20, radius: 18, color: col, life: .22, max: .22, seed: Math.random() * 6 });
    this.audio.sfx('magic');
  }

  creatureAction() {
    const p = this.player;
    if (!p) return;
    const wild = this.wilds.filter(w => !w.dead && w.capturable && dist(w, p) < 100)
      .sort((a, b) => dist(a, p) - dist(b, p))[0];
    if (wild) { this.captureCreature(wild); return; }
    const inst = this.activeCreatureInst();
    if (!inst) {
      if (p.creatures.length) { this.activateCreature(p.creatures[0].uid); return; }
      this.toast('No tienes criaturas. Debilita a una salvaje y usa un sello.', 'bad');
      this.audio.sfx('error');
      return;
    }
    if ((this.petActionCd || 0) > 0) return;
    const target = this.nearestEnemy(p.x, p.y, 360, true);
    if (!target) { this.toast(`${CREATURES[inst.species].name} está alerta, pero no hay enemigos cerca.`, 'gold'); return; }
    this.petActionCd = 2.2;
    this.petFire(target, inst, p.skills.includes('invocacion') ? 4 : 3);
    this.effects.push({ type: 'ring', x: p.x, y: p.y - 22, radius: 40, color: AFFINITIES[CREATURES[inst.species].affinity]?.color || '#ffe6a8', life: .35, max: .35 });
    this.toast(`${CREATURES[inst.species].name} ataca.`, 'good');
  }

  captureCreature(w) {
    const p = this.player;
    if (!w || w.dead) return;
    if (!w.capturable) { this.toast(`Debilita a ${w.def.name} antes de capturarla.`, 'bad'); this.audio.sfx('error'); return; }
    if (!(p.inventory.sello > 0)) { this.toast('No tienes Sellos Celestiales.', 'bad'); this.audio.sfx('error'); return; }
    p.inventory.sello--;
    if (p.inventory.sello <= 0) delete p.inventory.sello;
    const hpRatio = w.hp / w.maxHp;
    const chance = clamp(.18 + (1 - hpRatio) * .52 + p.captureBonus + (p.skills.includes('fortuna') ? .05 : 0), .12, .94);
    this.effects.push({ type: 'capture', x: w.x, y: w.y, color: '#ffe6a8', life: .8, max: .8 });
    this.audio.sfx('capture');
    w.aggro = true;
    if (Math.random() < chance) {
      const inst = this.makeCreature(w.species, w.level, true);
      p.creatures.push(inst);
      if (!p.activeCreature) p.activeCreature = inst.uid;
      this.state.stats.captures++;
      this.state.seen[w.species] = true;
      if (this.state.quests.jelly && w.species === 'brotito') this.state.quests.jelly.count++;
      w.dead = true;
      spawnBurst(this.particles, w.x, w.y - 18, w.def.color, 24, 'star', 140);
      this.effects.push({ type: 'ring', x: w.x, y: w.y - 16, radius: 48, color: '#ffe6a8', life: .5, max: .5 });
      this.toast(`¡${w.def.name} capturada! Nv. ${w.level}.`, 'gold');
      this.audio.sfx('success');
      if (!p.activeCreature) this.activateCreature(inst.uid);
      this.ui?.updateCreatureChip(this);
      this.ui?.renderMenu();
      this.save('auto');
    } else {
      this.toast('El sello se rompió. La criatura sigue libre.', 'bad');
      this.effects.push({ type: 'burst', x: w.x, y: w.y - 18, radius: 24, color: '#ff9aa6', life: .35, max: .35, seed: Math.random() * 6 });
    }
  }

  activateCreature(uid) {
    const p = this.player;
    const inst = p.creatures.find(c => c.uid === uid);
    if (!inst) return;
    p.activeCreature = uid;
    this.follower = null;
    this.toast(`${inst.nickname || CREATURES[inst.species].name} te acompaña.`, 'gold');
    this.audio.sfx('confirm');
    this.ui?.updateCreatureChip(this);
    this.ui?.renderMenu();
  }

  feedCreature(uid, itemId = 'baya') {
    const p = this.player;
    const inst = p.creatures.find(c => c.uid === uid);
    if (!inst) return;
    if (!(p.inventory[itemId] > 0)) { this.toast('No tienes bayas estelares.', 'bad'); this.audio.sfx('error'); return; }
    p.inventory[itemId]--;
    if (p.inventory[itemId] <= 0) delete p.inventory[itemId];
    inst.bond = Math.min(100, (inst.bond || 0) + 14);
    inst.hunger = Math.min(100, (inst.hunger ?? 70) + 24);
    this.creatureGainXp(inst, 20);
    this.audio.sfx('pickup');
    this.toast(`${CREATURES[inst.species].name} devora la baya. Vínculo ${inst.bond}.`, 'good');
    this.ui?.renderMenu();
  }

  trainCreature(uid) {
    const p = this.player;
    const inst = p.creatures.find(c => c.uid === uid);
    if (!inst) return;
    if (p.gold < 20) { this.toast('Necesitas 20 de oro para entrenar.', 'bad'); this.audio.sfx('error'); return; }
    p.gold -= 20;
    inst.bond = Math.min(100, (inst.bond || 0) + 5);
    inst.hunger = Math.max(0, (inst.hunger ?? 70) - 7);
    this.creatureGainXp(inst, 35);
    this.audio.sfx('level');
    this.toast(`Entrenamiento completado. ${CREATURES[inst.species].name} gana experiencia.`, 'gold');
    this.ui?.updateHUD(this);
    this.ui?.renderMenu();
  }

  creatureGainXp(inst, amount) {
    inst.xp = (inst.xp || 0) + amount;
    inst.xpNext = inst.xpNext || 30 + inst.level * 18;
    while (inst.xp >= inst.xpNext) {
      inst.xp -= inst.xpNext;
      inst.level++;
      inst.xpNext = Math.round((30 + inst.level * 18) * 1.12);
      inst.bond = Math.min(100, (inst.bond || 0) + 4);
      this.effects.push({ type: 'text', x: this.player.x, y: this.player.y - 72, text: `${CREATURES[inst.species].name} Nv.${inst.level}`, color: '#ffe6a8', life: 1, max: 1 });
    }
  }

  evolveCreature(uid) {
    const p = this.player;
    const inst = p.creatures.find(c => c.uid === uid);
    if (!inst) return;
    const def = CREATURES[inst.species];
    if (!def?.evolveTo) { this.toast('Esta criatura no puede evolucionar.', 'bad'); return; }
    if (inst.evolved) { this.toast('Ya ha alcanzado su forma final.', 'bad'); return; }
    if (inst.level < def.evolveLevel) { this.toast(`Alcanza el nivel ${def.evolveLevel} para evolucionar.`, 'bad'); return; }
    inst.species = def.evolveTo;
    inst.evolved = true;
    inst.bond = Math.min(100, inst.bond + 15);
    if (this.follower?.uid === inst.uid) this.follower = null;
    this.effects.push({ type: 'levelup', x: p.x, y: p.y, life: 1.6, max: 1.6 });
    spawnBurst(this.particles, p.x, p.y - 22, CREATURES[inst.species].color, 30, 'star', 160);
    this.audio.sfx('success');
    this.toast(`¡${def.name} evolucionó a ${CREATURES[inst.species].name}!`, 'gold');
    this.ui?.updateCreatureChip(this);
    this.ui?.renderMenu();
  }

  renameCreature(uid, name) {
    const inst = this.player?.creatures.find(c => c.uid === uid);
    if (!inst) return;
    const clean = String(name || '').trim().slice(0, 16);
    inst.nickname = clean || null;
    this.toast(clean ? `Criatura renombrada: ${clean}.` : 'Nombre restaurado.', 'gold');
    this.ui?.updateCreatureChip(this);
    this.ui?.renderMenu();
  }

  releaseCreature(uid) {
    const p = this.player;
    const idx = p.creatures.findIndex(c => c.uid === uid);
    if (idx < 0) return;
    const inst = p.creatures[idx];
    p.creatures.splice(idx, 1);
    if (p.activeCreature === uid) p.activeCreature = p.creatures[0]?.uid || null;
    this.follower = null;
    this.audio.sfx('error');
    this.toast(`${inst.nickname || CREATURES[inst.species].name} vuelve a la naturaleza.`, 'bad');
    this.ui?.updateCreatureChip(this);
    this.ui?.renderMenu();
  }

  // ---------------- interacción / mundo ----------------
  updateInteractable() {
    if (!this.player || this.player.dead || this.ui?.dialogueOpen || this.ui?.modalOpen) {
      this.currentInteract = null; this.ui?.setPrompt(''); return;
    }
    const p = this.player;
    const zone = this.zone;
    const candidates = [];
    const add = (type, ref, label, range = 64, key = 'Y', tile = true) => {
      const rx = tile ? ref.x * TS : ref.x;
      const ry = tile ? ref.y * TS : ref.y;
      const d = Math.hypot(rx - p.x, (ry - p.y) * .85);
      if (d < range) candidates.push({ type, ref, label, key, d });
    };
    for (const npc of zone.npcs || []) add('npc', npc, `Hablar con ${npc.name}`, 68);
    for (const s of zone.shrines || []) add('shrine', s, 'Descansar en el santuario', 66);
    for (const c of zone.chests || []) if (!c.opened) add('chest', c, 'Abrir cofre', 58);
    for (const s of zone.signs || []) add('sign', s, 'Leer letrero', 56);
    for (const p2 of zone.portals || []) {
      const center = { x: (p2.x + p2.w / 2) * TS, y: (p2.y + p2.h / 2) * TS };
      const d = Math.hypot(center.x - p.x, center.y - p.y);
      if (d < 92) candidates.push({ type: 'portal', ref: p2, label: p2.requiresShards && this.state.shards < p2.requiresShards ? `Portal sellado · ${p2.label}` : `Viajar a ${p2.label}`, key: 'Y', d: d / TS });
    }
    for (const r of zone.runes || []) if (!r.lit) add('rune', r, `Encender ${r.name}`, 62);
    for (const b of zone.braziers || []) if (!b.lit) add('brazier', b, `Encender ${b.name}`, 62);
    if (zone.altar) add('altar', zone.altar, zone.altar.forged ? 'Invocar al Avatar del Eclipse' : 'Forjar la Espada Celestial', 76);
    for (const o of zone.obstacles || []) if (!o.cleared) add('obstacle', o, o.label || 'Despejar el camino', 64);
    if (this.cat && !this.cat.found) add('cat', this.cat, 'Recoger a Nube', 64, 'Y', false);
    for (const w of this.wilds) if (!w.dead && w.capturable) add('wild', w, `Capturar a ${w.def.name}`, 104, 'R', false);
    candidates.sort((a, b) => a.d - b.d);
    this.currentInteract = candidates[0] || null;
    if (this.currentInteract) this.ui?.setPrompt(this.currentInteract.label, this.currentInteract.key);
    else this.ui?.setPrompt('');
  }

  interact() {
    const it = this.currentInteract;
    if (!it) return;
    this.audio.sfx('confirm');
    switch (it.type) {
      case 'npc': this.talkTo(it.ref); break;
      case 'shrine': this.useShrine(it.ref); break;
      case 'chest': this.openChest(it.ref); break;
      case 'sign': this.readSign(it.ref); break;
      case 'portal': this.travel(it.ref); break;
      case 'rune': this.lightRune(it.ref); break;
      case 'brazier': this.lightBrazier(it.ref); break;
      case 'altar': this.useAltar(); break;
      case 'obstacle': this.clearObstacle(it.ref); break;
      case 'cat': this.findCat(); break;
      case 'wild': this.captureCreature(it.ref); break;
    }
  }

  useShrine(s) {
    const p = this.player;
    p.hp = p.maxHp; p.mana = p.maxMana; p.stamina = p.maxStamina;
    this.state.respawn = { zone: this.zone.id, x: s.x, y: s.y + 1.1 };
    this.audio.sfx('heal');
    this.effects.push({ type: 'heal', x: s.x * TS, y: s.y * TS - 12, life: 1, max: 1 });
    this.effects.push({ type: 'ring', x: s.x * TS, y: s.y * TS, radius: 54, color: '#9fe8ff', life: .6, max: .6 });
    spawnBurst(this.particles, s.x * TS, s.y * TS - 30, '#bff4ff', 18, 'star', 110);
    this.toast('Descansas en el santuario. Vida y maná restaurados. Guardado automático.', 'gold');
    this.save('auto');
  }

  openChest(c) {
    if (c.opened) return;
    c.opened = true;
    this.state.openedChests[c.id] = true;
    const def = itemDef(c.item);
    this.player.inventory[c.item] = (this.player.inventory[c.item] || 0) + (c.amount || 1);
    this.audio.sfx('chest');
    this.state.stats.chests = (this.state.stats.chests || 0) + 1;
    this.effects.push({ type: 'burst', x: c.x * TS, y: c.y * TS - 16, radius: 34, color: '#ffd77a', life: .5, max: .5, seed: Math.random() * 6 });
    spawnBurst(this.particles, c.x * TS, c.y * TS - 20, '#ffe6a8', 20, 'star', 120);
    this.toast(`Cofre abierto: ${def?.name || itemName(c.item)}${c.amount > 1 ? ' ×' + c.amount : ''}.`, 'gold');
    if (def?.kind === 'weapon' || def?.kind === 'armor' || def?.kind === 'accessory') this.toast('Equípatelo desde el menú Equipo.', 'good');
    this.ui?.renderMenu();
  }

  readSign(s) {
    this.ui?.modal({
      title: 'Letrero antiguo',
      html: `<p style="white-space:pre-line">${String(s.text || '').replace(/</g, '&lt;')}</p>`,
      actions: [{ label: 'Cerrar', primary: true }],
    });
  }

  lightRune(r) {
    if (r.lit) return;
    const p = this.player;
    if (!p.spells.includes('fuego')) { this.toast('Necesitas la magia Fuego Solar.', 'bad'); this.audio.sfx('error'); return; }
    if (p.mana < 6) { this.toast('Maná insuficiente para encender la runa.', 'bad'); this.audio.sfx('error'); return; }
    p.mana -= 6;
    r.lit = true;
    this.state.litRunes[r.id] = true;
    this.audio.sfx('fire');
    this.effects.push({ type: 'burst', x: r.x * TS, y: r.y * TS - 24, radius: 34, color: '#ffe169', life: .5, max: .5, seed: Math.random() * 6 });
    spawnBurst(this.particles, r.x * TS, r.y * TS - 22, '#ffe169', 16, 'star', 100);
    this.toast(`${r.name} se enciende.`, 'gold');
    const all = (this.zone.runes || []).every(x => x.lit);
    if (all) {
      const gate = (this.zone.obstacles || []).find(o => o.required === 'runas');
      if (gate) { gate.cleared = true; this.state.clearedObstacles[gate.id] = true; }
      this.toast('Las tres runas despiertan la puerta de la arena.', 'gold');
      this.audio.sfx('success');
      this.shake = Math.max(this.shake, .35);
    }
    this.ui?.refreshQuest(this);
  }

  lightBrazier(b) {
    if (b.lit) return;
    const p = this.player;
    if (!p.spells.includes('fuego')) { this.toast('Necesitas la magia Fuego Solar.', 'bad'); this.audio.sfx('error'); return; }
    if (p.mana < 5) { this.toast('Maná insuficiente para encender el brasero.', 'bad'); this.audio.sfx('error'); return; }
    p.mana -= 5;
    b.lit = true;
    this.state.litBraziers[b.id] = true;
    this.audio.sfx('fire');
    this.effects.push({ type: 'burst', x: b.x * TS, y: b.y * TS - 28, radius: 36, color: '#ffb36b', life: .5, max: .5, seed: Math.random() * 6 });
    spawnBurst(this.particles, b.x * TS, b.y * TS - 26, '#ffcf7a', 18, 'star', 90);
    this.toast(`${b.name} arde de nuevo.`, 'gold');
    if ((this.zone.braziers || []).every(x => x.lit)) {
      this.toast('Los tres braseros llaman a la marea. El Leviatán despierta.', 'bad');
      this.audio.sfx('boss');
    }
    this.ui?.refreshQuest(this);
  }

  useAltar() {
    const a = this.zone.altar;
    if (!a) return;
    if (this.state.shards < 3) {
      this.toast(`El altar está incompleto. Fragmentos: ${this.state.shards}/3.`, 'bad');
      this.audio.sfx('error');
      return;
    }
    if (!this.state.forged) {
      this.state.forged = true;
      a.forged = true;
      this.state.mainStage = Math.max(3, this.state.mainStage);
      this.audio.sfx('success');
      this.audio.music('boss');
      this.shake = Math.max(this.shake, .8);
      this.effects.push({ type: 'ring', x: a.x * TS, y: a.y * TS - 20, radius: 120, color: '#ffe6a8', life: 1, max: 1, width: 4 });
      spawnBurst(this.particles, a.x * TS, a.y * TS - 60, '#ffe6a8', 40, 'star', 180);
      this.toast('La Espada Celestial vuelve a brillar. El Eclipse desciende.', 'gold');
      this.ui?.questPulse();
      this.ui?.refreshQuest(this);
      this.save('auto');
    } else if (!this.state.defeatedBosses.eclipse) {
      this.toast('El Avatar del Eclipse ya te espera.', 'bad');
    } else {
      this.toast('La espada descansa. El valle está en paz.', 'gold');
    }
  }

  clearObstacle(o) {
    if (o.cleared) return;
    const p = this.player;
    const pet = this.activeCreatureInst();
    const petAff = pet ? CREATURES[pet.species]?.affinity : null;
    const req = o.required;
    let ok = false;
    if (req === 'fuego') ok = p.spells.includes('fuego') || petAff === 'fuego';
    else if (req === 'tierra') ok = petAff === 'tierra';
    else if (req === 'agua') ok = petAff === 'agua';
    else if (req === 'rayo') ok = p.spells.includes('rayo') || petAff === 'rayo';
    else if (req === 'hielo') ok = p.spells.includes('hielo') || petAff === 'hielo';
    else if (req === 'naturaleza') ok = petAff === 'naturaleza';
    else if (req === 'runas') { this.toast('Las runas de la arena deben encenderse primero.', 'bad'); return; }
    if (!ok) {
      const need = { fuego: 'Fuego Solar o una criatura de fuego', tierra: 'una criatura de tierra', agua: 'una criatura de agua', rayo: 'Rayo o una criatura de rayo', hielo: 'Escarcha o una criatura de hielo', naturaleza: 'una criatura de naturaleza' }[req] || 'otro poder';
      this.toast(`Necesitas ${need} para despejar ${o.label}.`, 'bad');
      this.audio.sfx('error');
      return;
    }
    o.cleared = true;
    this.state.clearedObstacles[o.id] = true;
    this.audio.sfx('heavy');
    this.shake = Math.max(this.shake, .35);
    this.effects.push({ type: 'burst', x: o.x * TS, y: o.y * TS - 18, radius: 46, color: o.required === 'fuego' ? '#ff9a5c' : '#c9a06c', life: .55, max: .55, seed: Math.random() * 6 });
    spawnBurst(this.particles, o.x * TS, o.y * TS - 16, '#ffcf7a', 24, 'spark', 150);
    this.toast(`${o.label} despejado.`, 'gold');
    this.ui?.refreshQuest(this);
  }

  findCat() {
    if (!this.cat || this.cat.found) return;
    this.cat.found = true;
    this.state.catFound = true;
    this.audio.sfx('success');
    this.effects.push({ type: 'ring', x: this.cat.x, y: this.cat.y - 14, radius: 32, color: '#ffe6a8', life: .5, max: .5 });
    spawnBurst(this.particles, this.cat.x, this.cat.y - 18, '#ffe6a8', 16, 'star', 90);
    this.toast('Has encontrado a Nube. Vuelve junto a Lía en Aldea Alba.', 'gold');
    this.cat = null;
    this.ui?.refreshQuest(this);
  }

  updateCat(dt) {
    if (!this.cat) return;
    if (!this.zone || this.zone.id !== 'bosque') { this.cat = null; return; }
    const p = this.player;
    const d = Math.hypot(this.cat.x - p.x, this.cat.y - p.y);
    if (d < 140 && !this.cat.found) {
      this.cat.x += (p.x - this.cat.x) * dt * .18;
      this.cat.y += (p.y + 8 - this.cat.y) * dt * .18;
      if (Math.random() < dt * 1.5) this.particles.push({ type: 'star', x: this.cat.x + rand(-8, 8), y: this.cat.y - rand(2, 18), vx: rand(-5, 5), vy: rand(-18, -6), life: .7, max: .7, color: '#ffe6a8', size: 1.2 });
    }
  }

  // ---------------- diálogos y misiones ----------------
  startDialogue(opts) { this.ui?.dialogue(opts); }

  talkTo(npc) {
    const p = this.player;
    const q = this.state.quests;
    const name = npc.name;
    const say = (pages, choices, onEnd) => this.startDialogue({ name, npc, pages: Array.isArray(pages) ? pages : [pages], choices, onEnd });
    if (npc.id === 'mirra') {
      if (this.state.mainStage === 0) {
        say([
          'Astra… la Espada Celestial se ha roto. Su luz se apaga y las sombras se atreven a mirar el valle.',
          'Tres fragmentos cayeron: uno en el Bosque de Lumen, otro en las Ruinas de Elyra y el último en el Lago Espejo.',
          'Recupéralos, viajera. Cuando los tengas, sube a la Cima Celestial y forja de nuevo la espada en el Altar del Firmamento.'
        ], [
          { label: 'Aceptaré la misión', primary: true, action: () => {
            this.state.mainStage = 1;
            this.state.talked.mirra = true;
            this.audio.sfx('quest');
            this.toast('Misión principal: La Espada Rota.', 'gold');
            this.ui?.questPulse();
            this.ui?.refreshQuest(this);
          } },
          { label: 'Necesito prepararme', action: () => {} }
        ]);
      } else if (this.state.shards < 3) {
        say([
          `El valle aún guarda ${3 - this.state.shards} fragmento${3 - this.state.shards === 1 ? '' : 's'}. La Reina Gelatina protege el bosque; el Guardián Corrompido, las ruinas; el Leviatán, el lago.`,
          'En las ruinas, enciende las tres runas con Fuego Solar. En el lago, los tres braseros. Solo entonces se abrirán los caminos a sus guardianes.',
          'Si caes, los santuarios te devolverán al mundo. No tengas miedo de volver.'
        ]);
      } else if (!this.state.forged) {
        say([
          'Los tres fragmentos cantan en tu mochila. La Cima Celestial te espera más allá del Lago Espejo.',
          'Enciende el Altar del Firmamento y la espada recordará su nombre. Después… solo queda el Eclipse.'
        ]);
      } else if (!this.state.defeatedBosses.eclipse) {
        say('El Avatar del Eclipse ha descendido. No está solo: la oscuridad llama a sus espectros. Acaba con él y devuelve la luz al firmamento.');
      } else {
        say('El valle respira otra vez. La Espada Celestial brilla en tu mano, y cada criatura que has salvado recuerda tu nombre. Gracias, Astra.');
      }
    } else if (npc.id === 'elio') {
      say([
        '¡Ah, la viajera de la espada rota! Tengo pociones, sellos y acero de sobra.',
        'El oro abre todas las puertas del valle. ¿Qué te apetece mirar?'
      ], [
        { label: 'Ver mercancía', primary: true, action: () => this.openShop('Bazar de Elio', SHOP_STOCK) },
        { label: 'Solo pasaba', action: () => {} }
      ]);
    } else if (npc.id === 'bruma') {
      say([
        'El hierro recuerda cada golpe. Tu espada también, aunque esté rota.',
        'Trae cristales y esencias; puedo convertir basura en armadura. La forja está abierta para ti.'
      ], [
        { label: 'Abrir la forja', primary: true, action: () => this.openMenu('craft') },
        { label: 'Quizá luego', action: () => {} }
      ]);
    } else if (npc.id === 'nara') {
      if (q.herbs.stage === 0) {
        say([
          'Las heridas del valle no se curan solo con vendas. Necesito cinco Hierbas de Lumen para preparar un ungüento.',
          'Las gelatinas del bosque y del sendero las sueltan a menudo. ¿Me ayudarás?'
        ], [
          { label: 'Cuenta conmigo', primary: true, action: () => { q.herbs.stage = 1; this.audio.sfx('quest'); this.toast('Misión secundaria: Las hierbas de Nara.', 'gold'); this.ui?.refreshQuest(this); } },
          { label: 'Ahora no', action: () => {} }
        ]);
      } else if (q.herbs.stage === 1) {
        if ((p.inventory.hierba || 0) >= 5) {
          say([
            'Huelo la luz en tu mochila. Tienes las hierbas, ¿verdad?',
            'Dámelas y prepararé algo para el camino.'
          ], [
            { label: 'Entregar 5 hierbas', primary: true, action: () => this.completeHerbQuest() },
            { label: 'Todavía no', action: () => {} }
          ]);
        } else {
          say(`Te faltan ${5 - (p.inventory.hierba || 0)} hierbas de Lumen. Las gelatinas verdes del bosque las dejan caer.`);
        }
      } else {
        say('El ungüento funcionó. Que la luz te acompañe, viajera.');
      }
    } else if (npc.id === 'lia') {
      if (q.cat.stage === 0) {
        say([
          '¿Has visto a mi gato? Se llama Nube y tiene los ojos como dos lunas pequeñas.',
          'Se escapó hacia el Bosque de Lumen. Yo no puedo entrar sola… ¿lo buscarías por mí?'
        ], [
          { label: 'Buscaré a Nube', primary: true, action: () => { q.cat.stage = 1; this.audio.sfx('quest'); this.toast('Misión secundaria: El gato de Lía.', 'gold'); this.ui?.refreshQuest(this); } },
          { label: 'Ahora no', action: () => {} }
        ]);
      } else if (q.cat.stage === 1) {
        if (this.state.catFound) {
          say([
            '¡Nube! ¡Estás aquí!',
            'Gracias, viajera. Mi madre me dio este amuleto para quien encontrara a Nube. Ahora es tuyo.'
          ], null, () => this.completeCatQuest());
        } else {
          say('Nube suele esconderse cerca del claro del santuario, al sur del bosque. Busca junto al agua quieta.');
        }
      } else {
        say('Nube duerme a mi lado. Dice que le caes bien. Yo también.');
      }
    } else if (npc.id === 'garet') {
      if (q.jelly.stage === 0) {
        say([
          'Las gelatinas están creciendo demasiado. Se comen el grano y espantan a la caza.',
          'Derriba cinco y vuelve. Te pagaré bien.'
        ], [
          { label: 'Acepto el encargo', primary: true, action: () => { q.jelly.stage = 1; this.audio.sfx('quest'); this.toast('Misión secundaria: Gelatinas del sendero.', 'gold'); this.ui?.refreshQuest(this); } },
          { label: 'Ahora no', action: () => {} }
        ]);
      } else if (q.jelly.stage === 1) {
        if (q.jelly.count >= 5) {
          say([
            `Has derribado ${q.jelly.count}. El sendero vuelve a ser seguro.`,
            'Toma esto. Un cazador siempre paga sus deudas.'
          ], null, () => this.completeJellyQuest());
        } else {
          say(`Llevas ${q.jelly.count || 0} de 5. Las encontrarás en el bosque y cerca de los caminos.`);
        }
      } else {
        say('El bosque está más tranquilo. Si ves una gelatina dorada, no la subestimes.');
      }
    } else if (npc.id === 'sylva') {
      say([
        'Soy Sylva, voz de los árboles. La Reina Gelatina no siempre fue un monstruo.',
        'El fragmento celestial la volvió celosa. Cuando la venzas, no la odies: libérala.',
        'El claro del norte guarda su trono. Si necesitas fuerzas, el santuario del sur aún canta.'
      ]);
    } else {
      say([
        `Soy ${name}. El valle está lleno de historias, y casi todas empiezan con alguien que se atreve a salir de casa.`,
        'Si buscas a la Anciana Mirra, está en la plaza. El Bazar de Elio queda al noreste.'
      ]);
    }
  }

  completeHerbQuest() {
    const p = this.player;
    if ((p.inventory.hierba || 0) < 5 || this.state.quests.herbs.stage !== 1) return;
    p.inventory.hierba -= 5;
    if (p.inventory.hierba <= 0) delete p.inventory.hierba;
    this.state.quests.herbs.stage = 2;
    const r = QUESTS.herbs.reward;
    p.gold += r.gold;
    p.inventory[r.item] = (p.inventory[r.item] || 0) + r.amount;
    this.audio.sfx('quest');
    this.toast(`Misión completada: Las hierbas de Nara. +${r.gold} oro, ${itemName(r.item)} ×${r.amount}.`, 'gold');
    this.ui?.refreshQuest(this);
    this.ui?.updateHUD(this);
  }

  completeCatQuest() {
    if (!this.state.catFound || this.state.quests.cat.stage !== 1) return;
    this.state.quests.cat.stage = 2;
    const r = QUESTS.cat.reward;
    this.player.gold += r.gold;
    this.player.inventory[r.item] = (this.player.inventory[r.item] || 0) + r.amount;
    this.audio.sfx('quest');
    this.toast(`Misión completada: El gato de Lía. +${r.gold} oro, ${itemName(r.item)}.`, 'gold');
    this.ui?.refreshQuest(this);
    this.ui?.updateHUD(this);
  }

  completeJellyQuest() {
    if (this.state.quests.jelly.stage !== 1 || this.state.quests.jelly.count < 5) return;
    this.state.quests.jelly.stage = 2;
    const r = QUESTS.jelly.reward;
    this.player.gold += r.gold;
    this.player.inventory[r.item] = (this.player.inventory[r.item] || 0) + r.amount;
    this.audio.sfx('quest');
    this.toast(`Misión completada: Gelatinas del sendero. +${r.gold} oro, ${itemName(r.item)} ×${r.amount}.`, 'gold');
    this.ui?.refreshQuest(this);
    this.ui?.updateHUD(this);
  }

  npcHasQuest(npc) {
    if (!npc || !this.state) return false;
    const q = this.state.quests;
    if (npc.id === 'mirra') return this.state.mainStage === 0 || (this.state.shards >= 3 && !this.state.forged);
    if (npc.id === 'nara') return q.herbs.stage === 0 || (q.herbs.stage === 1 && (this.player?.inventory.hierba || 0) >= 5);
    if (npc.id === 'lia') return q.cat.stage === 0 || (q.cat.stage === 1 && this.state.catFound);
    if (npc.id === 'garet') return q.jelly.stage === 0 || (q.jelly.stage === 1 && q.jelly.count >= 5);
    return false;
  }

  // ---------------- tienda / forja / habilidades ----------------
  openShop(name = 'Bazar de Elio', stock = null) {
    this.shopName = name;
    this.shopStock = stock || SHOP_STOCK;
    this.openMenu('shop');
  }

  itemOwned(id) {
    const p = this.player;
    if (!p) return false;
    if (p.inventory[id] > 0) return true;
    return Object.values(p.equipment || {}).includes(id);
  }

  buyItem(id) {
    const p = this.player;
    const def = itemDef(id);
    if (!def) return;
    const price = def.price || 10;
    if (p.gold < price) { this.toast('No tienes suficiente oro.', 'bad'); this.audio.sfx('error'); return; }
    if ((def.kind === 'weapon' || def.kind === 'armor' || def.kind === 'accessory') && this.itemOwned(id)) {
      this.toast('Ya posees ese equipo.', 'bad'); this.audio.sfx('error'); return;
    }
    p.gold -= price;
    p.inventory[id] = (p.inventory[id] || 0) + 1;
    this.audio.sfx('coin');
    this.toast(`Compraste ${def.name} por ${price} oro.`, 'good');
    this.ui?.updateHUD(this);
    this.ui?.renderMenu();
  }

  sellItem(id) {
    const p = this.player;
    const def = itemDef(id);
    if (!def || !(p.inventory[id] > 0)) return;
    if (Object.values(p.equipment || {}).includes(id)) { this.toast('No puedes vender el equipo que llevas puesto.', 'bad'); return; }
    const price = Math.max(1, Math.floor((def.price || 10) * .5));
    p.inventory[id]--;
    if (p.inventory[id] <= 0) delete p.inventory[id];
    p.gold += price;
    this.audio.sfx('coin');
    this.toast(`Vendiste ${def.name} por ${price} oro.`, 'good');
    this.ui?.updateHUD(this);
    this.ui?.renderMenu();
  }

  craftRecipe(id) {
    const recipe = RECIPES.find(r => r.id === id);
    const p = this.player;
    if (!recipe) return;
    for (const [mat, n] of Object.entries(recipe.ingredients)) {
      if ((p.inventory[mat] || 0) < n) { this.toast(`Falta ${itemName(mat)} ×${n}.`, 'bad'); this.audio.sfx('error'); return; }
    }
    for (const [mat, n] of Object.entries(recipe.ingredients)) {
      p.inventory[mat] -= n;
      if (p.inventory[mat] <= 0) delete p.inventory[mat];
    }
    p.inventory[recipe.output] = (p.inventory[recipe.output] || 0) + recipe.amount;
    this.audio.sfx('success');
    this.toast(`Forjaste ${itemName(recipe.output)}${recipe.amount > 1 ? ' ×' + recipe.amount : ''}.`, 'gold');
    this.effects.push({ type: 'burst', x: p.x, y: p.y - 28, radius: 34, color: '#ffcf7a', life: .4, max: .4, seed: Math.random() * 6 });
    this.ui?.renderMenu();
  }

  learnSkill(id) {
    const p = this.player;
    const sk = SKILLS[id];
    if (!sk) return;
    if (p.skills.includes(id)) { this.toast('Ya conoces esa habilidad.', 'bad'); return; }
    if (p.skillPoints <= 0) { this.toast('No tienes puntos de habilidad.', 'bad'); this.audio.sfx('error'); return; }
    if (sk.requires && !p.skills.includes(sk.requires)) { this.toast(`Requiere: ${SKILLS[sk.requires]?.name || sk.requires}.`, 'bad'); this.audio.sfx('error'); return; }
    if (id === 'celestial' && !this.state.forged) { this.toast('La espada debe estar forjada en el Altar del Firmamento.', 'bad'); this.audio.sfx('error'); return; }
    if (p.skillPoints < sk.cost) { this.toast('Puntos insuficientes.', 'bad'); return; }
    p.skillPoints -= sk.cost;
    p.skills.push(id);
    if (SPELLS[id] && !p.spells.includes(id)) p.spells.push(id);
    this.recalc(p);
    this.audio.sfx('level');
    this.toast(`Habilidad aprendida: ${sk.name}.`, 'gold');
    this.playerPulse = 1;
    spawnBurst(this.particles, p.x, p.y - 22, '#ffe6a8', 18, 'star', 100);
    this.ui?.renderMenu();
    this.ui?.updateHUD(this);
  }

  setSpell(id) {
    if (!this.player?.spells.includes(id)) return;
    this.player.activeSpell = id;
    this.audio.sfx('menu');
    this.toast(`Magia activa: ${SPELLS[id]?.name || id}.`, 'gold');
    this.ui?.renderMenu();
  }

  equip(id) {
    const p = this.player;
    const def = itemDef(id);
    if (!def || !(p.inventory[id] > 0)) return;
    let slot = null;
    if (def.kind === 'weapon') slot = 'weapon';
    else if (def.kind === 'armor') slot = 'armor';
    else if (def.kind === 'accessory') slot = 'accessory';
    if (!slot) return;
    const old = p.equipment[slot];
    p.equipment[slot] = id;
    p.inventory[id]--;
    if (p.inventory[id] <= 0) delete p.inventory[id];
    if (old && old !== id) p.inventory[old] = (p.inventory[old] || 0) + 1;
    p.weapon = p.equipment.weapon;
    this.recalc(p);
    this.audio.sfx('confirm');
    this.toast(`Equipado: ${def.name}.`, 'gold');
    this.ui?.updateHUD(this);
    this.ui?.renderMenu();
  }

  unequip(slot) {
    const p = this.player;
    if (slot === 'weapon') { this.toast('Debes llevar un arma equipada.', 'bad'); return; }
    const id = p.equipment[slot];
    if (!id) return;
    p.inventory[id] = (p.inventory[id] || 0) + 1;
    p.equipment[slot] = null;
    this.recalc(p);
    this.audio.sfx('menu');
    this.toast(`${itemName(id)} guardado en la mochila.`, 'good');
    this.ui?.renderMenu();
    this.ui?.updateHUD(this);
  }

  // ---------------- flujo de juego / HUD ----------------
  toast(text, kind = '') { this.ui?.toast(text, kind); }

  openMenu(tab = 'stats') {
    if (this.screen !== 'playing') return;
    this.overlay = true;
    this.paused = true;
    this.input.clearActions();
    this.audio.sfx('menu');
    this.ui?.openMenu(tab);
  }

  closeMenu() {
    this.overlay = false;
    this.paused = false;
    this.input.clearActions();
    this.ui?.hideMenu();
  }

  onBossDefeated(e) {
    this.currentBoss = null;
    this.ui?.hideBoss();
    this.state.defeatedBosses[e.type] = true;
    this.state.stats.bosses = (this.state.stats.bosses || 0) + 1;
    const zb = this.zone.boss;
    if (zb && zb.type === e.type) zb.defeated = true;
    if (zb && zb.shard && !e.def.final) {
      this.toast(`Fragmento celestial recuperado (${this.state.shards + 1}/3).`, 'gold');
      this.effects.push({ type: 'text', x: e.x, y: e.y - 70, text: 'FRAGMENTO CELESTIAL', color: '#ffe6a8', life: 2.2, max: 2.2, big: true, serif: true });
      this.effects.push({ type: 'ring', x: e.x, y: e.y - 20, radius: 100, color: '#ffe6a8', life: .9, max: .9, width: 3 });
      spawnBurst(this.particles, e.x, e.y - 30, '#ffe6a8', 34, 'star', 170);
    }
    this.state.shards = ['bosque', 'ruinas', 'lago'].filter(z => {
      const zz = this.zones?.[z];
      return zz?.boss && this.state.defeatedBosses[zz.boss.type];
    }).length;
    if (this.state.shards >= 3 && !this.state.forged) {
      this.state.mainStage = Math.max(2, this.state.mainStage);
      this.toast('Los tres fragmentos están completos. Sube al Altar del Firmamento.', 'gold');
      this.ui?.questPulse();
    }
    const gold = Math.round((e.def.gold || 100) * this.player.goldBonus);
    this.dropCoins(gold, e.x, e.y);
    this.dropItem('pocion', 2, e.x + 22, e.y);
    this.dropItem('sello', 3, e.x - 22, e.y);
    if (e.def.drop) this.dropItem(e.def.drop, 1, e.x, e.y - 16);
    this.shake = 1;
    this.audio.sfx('victory');
    this.effects.push({ type: 'text', x: this.player.x, y: this.player.y - 80, text: '¡VICTORIA!', color: '#ffe6a8', life: 2, max: 2, big: true, serif: true });
    if (e.def.final) {
      this.state.finalDefeated = true;
      this.state.mainStage = 4;
      this.pendingEnding = 2.4;
      this.overlay = true;
      this.audio.music('victory');
      this.save('auto');
    } else {
      this.save('auto');
      this.ui?.refreshQuest(this);
      window.setTimeout(() => { if (this.screen === 'playing' && !this.paused) this.audio.music(this.zone.music || 'village'); }, 3600);
      if (e.type === 'guardian') {
        const chest = this.zone.chests?.find(c => c.item === 'mandoble_astral');
        if (chest) chest.opened = false;
      }
    }
  }

  finishGame() {
    this.state.mainStage = 4;
    this.state.finalDefeated = true;
    this.overlay = true;
    this.audio.music('victory');
    this.save('auto');
    this.ui?.showEnding(this);
  }

  getMainQuestInfo() {
    const s = this.state;
    if (!s) return { title: 'La Espada Rota', text: '' };
    if (s.mainStage === 0) return { title: 'La Espada Rota', text: 'Habla con la Anciana Mirra en la plaza de Aldea Alba.' };
    if (s.mainStage === 1) {
      if (s.shards < 3) return { title: 'La Espada Rota', text: `Recupera los fragmentos celestiales (${s.shards}/3). Explora el Bosque, las Ruinas y el Lago.` };
      return { title: 'La Espada Rota', text: 'Los fragmentos están completos. Sube a la Cima Celestial.' };
    }
    if (s.mainStage === 2) return { title: 'La Espada Rota', text: 'Lleva los tres fragmentos al Altar del Firmamento.' };
    if (s.mainStage === 3) return { title: 'La Espada Rota', text: 'Derrota al Avatar del Eclipse en la Cima Celestial.' };
    return { title: 'La Espada Rota', text: 'La paz ha vuelto al valle. Explora y completa tu colección.' };
  }

  makeDebug() {
    const g = this;
    return {
      game: g,
      state: () => g.state,
      player: () => g.player,
      giveGold: (n = 1000) => { if (g.player) { g.player.gold += n; g.ui?.updateHUD(g); g.ui?.renderMenu(); } return g.player?.gold; },
      giveItem: (id, n = 1) => { if (g.player) { g.player.inventory[id] = (g.player.inventory[id] || 0) + n; g.ui?.updateHUD(g); g.ui?.renderMenu(); } return g.player?.inventory; },
      xp: (n = 100) => { g.gainXp(n); return g.player?.level; },
      setLevel: (n = 5) => { if (g.player) { g.player.level = n; g.recalc(g.player, true); g.ui?.updateHUD(g); } return g.player?.level; },
      heal: () => { if (g.player) { g.player.hp = g.player.maxHp; g.player.mana = g.player.maxMana; g.player.stamina = g.player.maxStamina; g.ui?.updateHUD(g); } },
      learnAll: () => { if (g.player) { g.player.skillPoints = 99; for (const id of Object.keys(SKILLS)) if (!g.player.skills.includes(id)) g.learnSkill(id); } },
      shards: (n = 3) => { if (g.state) { g.state.shards = n; g.state.mainStage = n >= 3 ? 2 : Math.max(1, g.state.mainStage); g.ui?.refreshQuest(g); } return g.state?.shards; },
      unlock: () => { if (g.state) { g.state.shards = 3; g.state.mainStage = 2; g.state.forged = false; g.ui?.refreshQuest(g); } },
      capture: (species) => { if (!g.player) return; const inst = g.makeCreature(species, 8, true); g.player.creatures.push(inst); g.state.seen[species] = true; g.ui?.renderMenu(); g.ui?.updateCreatureChip(g); return inst; },
      captureAll: () => { if (!g.player) return; for (const sp of CAPTURE_SPECIES) if (!g.player.creatures.some(c => c.species === sp)) g.player.creatures.push(g.makeCreature(sp, 8, true)); for (const sp of Object.keys(CREATURES)) g.state.seen[sp] = true; g.ui?.renderMenu(); g.ui?.updateCreatureChip(g); },
      teleport: (zone, x, y) => { g.loadZone(zone, { x: x ?? 5, y: y ?? 5 }); g.ui?.showGame(); g.ui?.zoneBanner(g.zone); return g.zone?.id; },
      defeatBoss: (type) => { const e = g.enemies.find(x => x.type === type && !x.dead); if (e) { e.hidden = false; e.hp = 1; g.damageEnemy(e, 99999, { crit: true }); } return !!e; },
      openMenu: (t = 'stats') => g.openMenu(t),
      closeMenu: () => g.closeMenu(),
      ending: () => g.finishGame(),
      toast: (text, kind) => g.toast(text, kind),
      save: (slot = 'auto') => g.save(slot),
      load: (slot = 'latest') => g.load(slot),
      clearSaves: () => { localStorage.removeItem(SAVE_KEY); g.ui?.updateContinueLabel(); },
    };
  }
}
