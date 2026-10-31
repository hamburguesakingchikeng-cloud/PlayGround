// ─────────────────────────────────────────────────────────────
// LA ESPADA CELESTIAL — motor principal
// Estado, progresión, mundo, misiones, guardado y bucle.
// ─────────────────────────────────────────────────────────────
import {
  TILE, REGIONS, CLASSES, APPEARANCE, STATS, ENEMIES, CREATURES, ITEMS,
  SKILLS, LORE, SHOP_STOCK, DIFFICULTY, DEFAULT_APPEARANCE
} from './data.js';
import { buildWorld, markExplored, findInteractable } from './world.js';
import { clamp, lerp, dist, angleDiff, TAU } from './util.js';
import { audio } from './audio.js';
import {
  QUESTS, playIntro, npcTalk, specialUpdate, onBossDefeated,
  onQuestComplete, ENDINGS
} from './story.js';
import { drawWorld } from './worldview.js';
import { Combat } from './combat.js';

const SAVE_KEY = 'la_espada_celestial_save_v1';
const SETTINGS_KEY = 'la_espada_celestial_settings_v1';
const STAT_KEYS = Object.keys(STATS);

function encodeExplored(arr) {
  if (!arr) return '';
  let s = '';
  const chunk = 0x8000;
  for (let i = 0; i < arr.length; i += chunk) {
    s += String.fromCharCode.apply(null, arr.subarray(i, i + chunk));
  }
  try { return btoa(s); } catch { return ''; }
}
function decodeExplored(str, len) {
  const out = new Uint8Array(len);
  if (!str) return out;
  try {
    const raw = atob(str);
    for (let i = 0; i < Math.min(raw.length, len); i++) out[i] = raw.charCodeAt(i);
  } catch { /* guardado antiguo */ }
  return out;
}

export class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.input = null;
    this.ui = null;
    this.mode = 'title';
    this.inGame = false;
    this.time = 0;
    this.playtime = 0;
    this.regionId = null;
    this.world = null;
    this.player = null;
    this.enemies = [];
    this.creatures = [];
    this.ally = null;
    this.projectiles = [];
    this.effects = [];
    this.camera = { x: 0, y: 0 };
    this.zoom = 1;
    this.shake = 0;
    this.nearInteract = null;
    this.questTarget = null;
    this.boss = null;
    this.bossActive = false;
    this.capture = null;
    this.flags = {};
    this.quests = {};
    this.inventory = {};
    this.equipment = {};
    this.captured = [];
    this.activeCreature = null;
    this.lore = new Set();
    this.unlockedSkills = [];
    this.activeSkillSlots = [null, null, null, null];
    this.cooldowns = {};
    this.level = 1;
    this.xp = 0;
    this.gold = 0;
    this.shards = 0;
    this.statPoints = 0;
    this.skillPoints = 0;
    this.alloc = {};
    this.difficulty = 'guardian';
    this.exploredMemory = {};
    this.lastShrine = null;
    this.classId = 'guardian';
    this.gender = 'ella';
    this.name = 'Ariadne';
    this.settings = this.loadSettings();
    this._hudAccum = 0;
    this._exploreAccum = 0;
    this._lastBlock = false;
    this._runHold = 0;
    this._pendingProjectiles = [];
    this._saveTimer = 0;
    this.movement = { x: 0, y: 0, len: 0 };
  }

  // ───────────────────────── ajustes ─────────────────────────
  loadSettings() {
    const defaults = {
      difficulty: 'guardian', master: .7, music: .42, sfx: .75, muted: false,
      showDamage: true, screenShake: true, touch: true, hints: true
    };
    try {
      const raw = localStorage.getItem(SETTINGS_KEY);
      if (raw) Object.assign(defaults, JSON.parse(raw));
    } catch { /* sin almacenamiento */ }
    return defaults;
  }

  saveSettings() {
    try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(this.settings)); } catch { /* noop */ }
    audio.setVolumes?.({ master: this.settings.master, music: this.settings.music, sfx: this.settings.sfx });
    audio.setMuted?.(this.settings.muted);
  }

  applySettings() {
    this.difficulty = this.settings.difficulty || 'guardian';
    audio.setVolumes?.({ master: this.settings.master, music: this.settings.music, sfx: this.settings.sfx });
    audio.setMuted?.(this.settings.muted);
  }

  setMode(mode) {
    this.mode = mode;
    if (mode !== 'playing') this.input?.clear?.();
  }

  // ───────────────────────── nueva partida ─────────────────────────
  newGame(config = {}) {
    this.name = (config.name || 'Ariadne').trim().slice(0, 14) || 'Ariadne';
    this.gender = config.gender || 'ella';
    this.classId = CLASSES[config.classId] ? config.classId : 'guardian';
    const app = { ...DEFAULT_APPEARANCE, ...(config.appearance || {}) };
    app.eye = app.eye || '#6c8f8b';
    this.appearance = app;
    this.alloc = {};
    for (const k of STAT_KEYS) this.alloc[k] = Math.max(0, Math.round(config.alloc?.[k] || 0));
    this.settings.difficulty = config.difficulty || this.settings.difficulty || 'guardian';
    this.difficulty = this.settings.difficulty;
    this.saveSettings();

    this.level = 1;
    this.xp = 0;
    this.statPoints = 0;
    this.skillPoints = 1;
    this.gold = 45;
    this.shards = 0;
    this.inventory = { vial_savia: 3, pan_viaje: 2, esencia_azul: 1, tonico_aguante: 1, capa_viajero: 1 };
    this.unlockedSkills = [];
    this.activeSkillSlots = [null, null, null, null];
    this.captured = [];
    this.activeCreature = null;
    this.lore = new Set(['valdoria']);
    this.flags = { drakmor_open: false, kansordore_open: false, kael_trust: false, choice_seen: false };
    this.quests = {};
    this.cooldowns = {};
    this.exploredMemory = {};
    this.lastShrine = null;
    this.classId = config.classId && CLASSES[config.classId] ? config.classId : 'guardian';
    const cls = CLASSES[this.classId];
    this.equipment = { weapon: cls.startWeapon, armor: cls.startArmor, helm: null, cape: null, relic: null };

    this.player = {
      x: 0, y: 0, radius: 15, facing: Math.PI / 2,
      state: 'idle', stateT: 0, stateDur: 0, walkPhase: 0,
      hp: 100, maxHp: 100, mp: 40, maxMp: 40, stamina: 60, maxStamina: 60,
      shield: 0, invuln: 0, hurtT: 0, dead: false,
      burning: 0, marked: 0, critBuff: 0, dmgBuff: 0, slowT: 0,
      attackDuration: .34, attackCd: 0, combo: 0, comboT: 0,
      blockT: 0, blocking: false, perfectWindow: 0, dodgeT: 0,
      bondGlow: 0, lastHurt: 0
    };
    this.recomputeStats(false);
    this.player.hp = this.player.maxHp;
    this.player.mp = this.player.maxMp;
    this.player.stamina = this.player.maxStamina;

    this.inGame = true;
    this.mode = 'playing';
    this.buildRegion('valdoria', { spawnAtStart: true });
    this.startQuest('despertar');
    this.ui?.enterGame?.();
    audio.unlock?.();
    audio.playMusic?.('valdoria');
    this.ui?.toast?.('Has despertado en Brumavela', 'gold');
    playIntro(this).then(() => {
      this.setMode('playing');
      this.ui?.subtitle?.('La maestra Iria te espera en la plaza.', 5);
      this.autoSave();
    });
    return true;
  }

  // ───────────────────────── estadísticas ─────────────────────────
  baseStats() {
    const cls = CLASSES[this.classId] || CLASSES.guardian;
    const out = {};
    for (const k of STAT_KEYS) out[k] = 6 + (cls.bonus[k] || 0) + (this.alloc[k] || 0);
    return out;
  }

  totalStats() {
    const stats = this.baseStats();
    for (const slot of Object.keys(this.equipment || {})) {
      const item = ITEMS[this.equipment[slot]];
      if (!item?.stats) continue;
      for (const [k, v] of Object.entries(item.stats)) stats[k] = (stats[k] || 0) + v;
    }
    return stats;
  }

  recomputeStats(keepRatio = true) {
    if (!this.player) return;
    const p = this.player;
    const oldHp = p.maxHp, oldMp = p.maxMp, oldSt = p.maxStamina;
    const s = this.totalStats();
    let gearDef = 0;
    for (const slot of Object.keys(this.equipment || {})) gearDef += ITEMS[this.equipment[slot]]?.def || 0;
    const weapon = ITEMS[this.equipment?.weapon];
    p.stats = s;
    p.maxHp = Math.round(55 + s.vitalidad * 13 + (this.level - 1) * 8);
    p.maxMp = Math.round(24 + s.mana * 8 + (this.level - 1) * 2);
    p.maxStamina = Math.round(52 + s.aguante * 7);
    p.atk = 5 + s.fuerza * 1.9 + (this.level - 1) * .9 + (weapon?.atk || 0) * 2.2;
    p.defense = Math.round(s.defensa * 1.6 + gearDef + (this.level - 1) * .5);
    p.crit = clamp(.05 + s.suerte * .016 + (weapon?.crit || 0) * .01, .05, .62);
    p.speed = 154 + s.velocidad * 4.6;
    p.power = 1 + s.inteligencia * .035;
    if (keepRatio) {
      p.hp = clamp(p.hp / oldHp * p.maxHp, 1, p.maxHp);
      p.mp = clamp(p.mp / oldMp * p.maxMp, 0, p.maxMp);
      p.stamina = clamp(p.stamina / oldSt * p.maxStamina, 0, p.maxStamina);
    } else {
      p.hp = p.maxHp; p.mp = p.maxMp; p.stamina = p.maxStamina;
    }
    const armor = ITEMS[this.equipment?.armor];
    p.appearance = this.appearance;
    p.name = this.name;
    p.classId = this.classId;
    p.equipment = this.equipment;
    p.armor = armor;
  }

  addXp(amount) {
    if (!amount) return;
    this.xp += Math.round(amount);
    audio.sfx?.('xp');
    let guard = 0;
    while (this.xp >= this.xpNeeded() && guard++ < 30) {
      this.xp -= this.xpNeeded();
      this.level++;
      this.statPoints += 3;
      this.skillPoints += 1;
      this.recomputeStats(true);
      this.player.hp = this.player.maxHp;
      this.player.mp = this.player.maxMp;
      this.player.stamina = this.player.maxStamina;
      this.effects.push({ kind: 'column', x: this.player.x, y: this.player.y, color: '#f2d98e', life: 1.2, max: 1.2 });
      this.spawnBurst(this.player.x, this.player.y - 34, '#f2d98e', 28, 120);
      this.ui?.toast?.(`Nivel ${this.level} — +3 atributos, +1 talento`, 'gold');
      audio.sfx?.('levelup');
      this.autoSave();
    }
  }

  xpNeeded() { return Math.round(90 * Math.pow(this.level, 1.32)); }
  addGold(n) { this.gold = Math.max(0, this.gold + Math.round(n)); }
  addShards(n) { this.shards = Math.max(0, this.shards + Math.round(n)); }

  // ───────────────────────── inventario ─────────────────────────
  addInventory(id, qty = 1) {
    if (!ITEMS[id] || qty <= 0) return false;
    const max = ITEMS[id].stack || 99;
    this.inventory[id] = Math.min(max, (this.inventory[id] || 0) + qty);
    this.autoSave();
    return true;
  }

  removeInventory(id, qty = 1) {
    if (!this.inventory[id]) return false;
    this.inventory[id] -= qty;
    if (this.inventory[id] <= 0) delete this.inventory[id];
    return true;
  }

  itemCount(id) { return this.inventory[id] || 0; }

  useItem(id) {
    const item = ITEMS[id];
    if (!item || !this.inventory[id] || !this.player) return false;
    const p = this.player;
    if (item.heal) {
      if (p.hp >= p.maxHp) { this.ui?.toast?.('Tu vida ya está completa'); return false; }
      p.hp = Math.min(p.maxHp, p.hp + p.maxHp * item.heal);
      audio.sfx?.('heal');
      this.floatText(p.x, p.y - 66, `+${Math.round(p.maxHp * item.heal)}`, '#8fd0b3');
    }
    if (item.mana) {
      if (p.mp >= p.maxMp) { this.ui?.toast?.('Tu maná ya está completo'); return false; }
      p.mp = Math.min(p.maxMp, p.mp + p.maxMp * item.mana);
      audio.sfx?.('heal');
    }
    if (item.stamina) {
      p.stamina = Math.min(p.maxStamina, p.stamina + p.maxStamina * (item.stamina > 1 ? 1 : item.stamina));
      audio.sfx?.('heal');
    }
    if (item.bomb) {
      for (const e of this.enemies) if (!e.dead && dist(e.x, e.y, p.x, p.y) < 270) this.damageEnemy(e, item.bomb * p.power, { element: 'fuego' });
      this.effects.push({ kind: 'ring', x: p.x, y: p.y, r0: 20, r1: 280, color: '#ffb45e', width: 5, life: .7, max: .7 });
      this.spawnBurst(p.x, p.y - 30, '#ffb45e', 34, 260);
      this.shake = Math.max(this.shake, 7);
      audio.sfx?.('explode');
    }
    if (item.captureBonus) {
      this.captureBonus = (this.captureBonus || 0) + item.captureBonus;
      this.ui?.toast?.('El incienso amplía la Resonancia');
      audio.sfx?.('heal');
    }
    this.removeInventory(id, 1);
    audio.sfx?.('potion');
    this.autoSave();
    return true;
  }

  equipItem(id) {
    const item = ITEMS[id];
    if (!item || !this.inventory[id]) return false;
    const slot = item.slot;
    if (!['weapon', 'armor', 'helm', 'cape', 'relic'].includes(slot)) return false;
    const old = this.equipment[slot];
    if (old) this.addInventory(old, 1);
    this.removeInventory(id, 1);
    this.equipment[slot] = id;
    this.recomputeStats(true);
    audio.sfx?.('equip');
    this.ui?.toast?.(`Equipado: ${item.name}`, 'gold');
    this.autoSave();
    return true;
  }

  unequip(slot) {
    const id = this.equipment[slot];
    if (!id) return false;
    this.equipment[slot] = null;
    this.addInventory(id, 1);
    this.recomputeStats(true);
    this.autoSave();
    return true;
  }

  allocateStat(key) {
    if (this.statPoints <= 0 || !STAT_KEYS.includes(key)) return false;
    this.statPoints--;
    this.alloc[key] = (this.alloc[key] || 0) + 1;
    this.recomputeStats(true);
    audio.sfx?.('click');
    this.autoSave();
    return true;
  }

  // ───────────────────────── talentos ─────────────────────────
  skillAvailable(id) {
    const sk = SKILLS[id];
    if (!sk || this.unlockedSkills.includes(id)) return false;
    return !sk.requires || this.unlockedSkills.includes(sk.requires);
  }

  unlockSkill(id) {
    if (!this.skillAvailable(id)) return false;
    const sk = SKILLS[id];
    if (this.skillPoints < sk.cost) { this.ui?.toast?.('No tienes suficientes puntos de talento'); return false; }
    this.skillPoints -= sk.cost;
    this.unlockedSkills.push(id);
    if (sk.type === 'active') {
      const slot = this.activeSkillSlots.findIndex(s => !s);
      if (slot >= 0) this.activeSkillSlots[slot] = id;
    }
    audio.sfx?.('levelup');
    this.ui?.toast?.(`Talento aprendido: ${sk.name}`, 'gold');
    this.autoSave();
    return true;
  }

  setSkillSlot(slot, id) {
    if (slot < 0 || slot > 3) return;
    if (id && (!SKILLS[id] || SKILLS[id].type !== 'active' || !this.unlockedSkills.includes(id))) return;
    const existing = this.activeSkillSlots.indexOf(id);
    if (id && existing >= 0) this.activeSkillSlots[existing] = this.activeSkillSlots[slot];
    this.activeSkillSlots[slot] = id;
    this.ui?.refreshSkillWheel?.();
    this.autoSave();
  }
}
import { WorldSystem } from './game-world.js';
import { LoopSystem } from './game-loop.js';

Object.assign(Game.prototype, WorldSystem, LoopSystem, Combat);
