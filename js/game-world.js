// Mundo, guardado, misiones, interacción y finales.
import {
  TILE, REGIONS, CLASSES, APPEARANCE, STATS, ENEMIES, CREATURES, ITEMS,
  LORE, SHOP_STOCK, DIFFICULTY, DEFAULT_APPEARANCE
} from './data.js';
import { buildWorld, markExplored, findInteractable } from './world.js';
import { clamp, dist, TAU } from './util.js';
import { audio } from './audio.js';
import { QUESTS, npcTalk, onQuestComplete, ENDINGS } from './story.js';
import { drawWorld } from './worldview.js';

const SAVE_KEY = 'la_espada_celestial_save_v1';
const STAT_KEYS = Object.keys(STATS);

function encodeExplored(arr) {
  if (!arr) return '';
  let s = '';
  const chunk = 0x8000;
  for (let i = 0; i < arr.length; i += chunk) s += String.fromCharCode.apply(null, arr.subarray(i, i + chunk));
  try { return btoa(s); } catch { return ''; }
}
function decodeExplored(str, len) {
  const out = new Uint8Array(len);
  if (!str) return out;
  try {
    const raw = atob(str);
    for (let i = 0; i < Math.min(raw.length, len); i++) out[i] = raw.charCodeAt(i);
  } catch { /* noop */ }
  return out;
}
function safeJSON(key) {
  try { return JSON.parse(localStorage.getItem(key) || 'null'); } catch { return null; }
}

export const WorldSystem = {
  // ───────────────────────── guardado ─────────────────────────
  hasSave() {
    try { return !!localStorage.getItem(SAVE_KEY); } catch { return false; }
  },

  save(manual = false) {
    if (!this.inGame || !this.player || !this.world) return false;
    this.exploredMemory[this.regionId] = encodeExplored(this.world.explored);
    const data = {
      version: 1, savedAt: Date.now(),
      name: this.name, gender: this.gender, classId: this.classId,
      appearance: this.appearance, alloc: this.alloc,
      level: this.level, xp: this.xp, statPoints: this.statPoints, skillPoints: this.skillPoints,
      gold: this.gold, shards: this.shards, inventory: this.inventory, equipment: this.equipment,
      flags: this.flags, quests: this.quests, lore: [...this.lore],
      unlockedSkills: this.unlockedSkills, activeSkillSlots: this.activeSkillSlots,
      captured: this.captured, activeCreature: this.activeCreature,
      regionId: this.regionId, px: this.player.x, py: this.player.y,
      hp: this.player.hp, mp: this.player.mp, stamina: this.player.stamina,
      playtime: this.playtime, difficulty: this.settings.difficulty,
      explored: this.exploredMemory, lastShrine: this.lastShrine,
      settings: this.settings
    };
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(data));
      if (manual) this.ui?.toast?.('Partida guardada', 'gold');
      return true;
    } catch {
      this.ui?.toast?.('No se pudo guardar la partida', 'danger');
      return false;
    }
  },

  autoSave() {
    if (!this.inGame || this._savingBlocked) return;
    this.save(false);
  },

  deleteSave() {
    try { localStorage.removeItem(SAVE_KEY); } catch { /* noop */ }
  },

  loadGame() {
    const data = safeJSON(SAVE_KEY);
    if (!data || !REGIONS[data.regionId]) {
      this.ui?.toast?.('No hay una partida válida', 'danger');
      return false;
    }
    this.name = data.name || 'Ariadne';
    this.gender = data.gender || 'ella';
    this.classId = CLASSES[data.classId] ? data.classId : 'guardian';
    this.appearance = { ...DEFAULT_APPEARANCE, ...(data.appearance || {}) };
    this.alloc = {};
    for (const k of STAT_KEYS) this.alloc[k] = Math.max(0, Math.round(data.alloc?.[k] || 0));
    this.level = data.level || 1;
    this.xp = data.xp || 0;
    this.statPoints = data.statPoints || 0;
    this.skillPoints = data.skillPoints || 0;
    this.gold = data.gold || 0;
    this.shards = data.shards || 0;
    this.inventory = data.inventory || {};
    this.equipment = { weapon: null, armor: null, helm: null, cape: null, relic: null, ...(data.equipment || {}) };
    this.flags = data.flags || {};
    this.quests = data.quests || {};
    this.lore = new Set(data.lore || ['valdoria']);
    this.unlockedSkills = data.unlockedSkills || [];
    this.activeSkillSlots = Array.isArray(data.activeSkillSlots) ? data.activeSkillSlots.slice(0, 4) : [null, null, null, null];
    while (this.activeSkillSlots.length < 4) this.activeSkillSlots.push(null);
    this.captured = data.captured || [];
    this.activeCreature = data.activeCreature || null;
    this.exploredMemory = data.explored || {};
    this.lastShrine = data.lastShrine || null;
    this.playtime = data.playtime || 0;
    this.settings = { ...this.settings, ...(data.settings || {}) };
    this.settings.difficulty = data.difficulty || this.settings.difficulty || 'guardian';
    this.difficulty = this.settings.difficulty;
    this.player = {
      x: data.px || 0, y: data.py || 0, radius: 15, facing: Math.PI / 2,
      state: 'idle', stateT: 0, stateDur: 0, walkPhase: 0,
      hp: 100, maxHp: 100, mp: 40, maxMp: 40, stamina: 60, maxStamina: 60,
      shield: 0, invuln: 0, hurtT: 0, dead: false, burning: 0, marked: 0,
      critBuff: 0, dmgBuff: 0, slowT: 0, attackDuration: .34, attackCd: 0,
      combo: 0, comboT: 0, blockT: 0, blocking: false, perfectWindow: 0,
      dodgeT: 0, bondGlow: 0, lastHurt: 0
    };
    this.recomputeStats(false);
    this.player.hp = clamp(data.hp ?? this.player.maxHp, 1, this.player.maxHp);
    this.player.mp = clamp(data.mp ?? this.player.maxMp, 0, this.player.maxMp);
    this.player.stamina = clamp(data.stamina ?? this.player.maxStamina, 0, this.player.maxStamina);
    this.inGame = true;
    this.buildRegion(data.regionId, { spawnAtStart: false, position: { x: data.px, y: data.py } });
    this.setMode('playing');
    this.ui?.enterGame?.();
    this.ui?.toast?.('Partida restaurada', 'gold');
    this.applySettings();
    audio.unlock?.();
    audio.playMusic?.(this.regionId);
    this.autoSave();
    return true;
  },

  // ───────────────────────── construcción del mundo ─────────────────────────
  buildRegion(regionId, opts = {}) {
    if (!REGIONS[regionId]) return false;
    if (this.world && this.regionId) this.exploredMemory[this.regionId] = encodeExplored(this.world.explored);
    this.regionId = regionId;
    this.world = buildWorld(regionId, this.flags);
    const w = this.world;
    const mem = this.exploredMemory[regionId];
    if (typeof mem === 'string' && mem) w.explored = decodeExplored(mem, w.W * w.H);
    for (const npc of w.npcs) {
      if (npc.hideIf && this.flags[npc.hideIf]) npc.hidden = true;
      if (npc.id === 'kael_k' && !this.flags.kael_resolved) npc.hidden = !(this.quests.velo && this.quests.velo.stage >= 3);
      if (npc.ghost && this.flags['banished_' + npc.id]) npc.hidden = true;
    }
    for (const it of w.interactables) {
      if (it.type === 'chest' && it.opened) it.disabled = true;
      if (it.type === 'gather' && it.gathered) it.disabled = true;
    }
    this.enemies = [];
    this.creatures = [];
    this.projectiles = [];
    this.effects = [];
    this.capture = null;
    this.ally = null;
    this.boss = null;
    this.bossActive = false;
    for (const sp of w.spawns) this.enemies.push(this.makeEnemy(sp.type, sp.x, sp.y, { elite: sp.elite, levelScale: sp.levelScale }));
    for (const cs of w.creatureSpawns) {
      if (this.captured.includes(cs.species)) continue;
      this.creatures.push(this.makeCreature(cs.species, cs.x, cs.y));
    }
    let pos = opts.position;
    if (!pos) pos = w.playerStart || { x: w.W * TILE / 2, y: w.H * TILE / 2 };
    if (this.player) {
      this.player.x = pos.x;
      this.player.y = pos.y;
      this.player.dead = false;
      this.player.state = 'idle';
      this.player.stateT = 0;
      this.player.invuln = 1.5;
    }
    if (w.isBlocked(pos.x, pos.y, 16)) {
      const start = w.playerStart || { x: w.W * TILE / 2, y: w.H * TILE / 2 };
      this.player.x = start.x;
      this.player.y = start.y;
    }
    this.camera.x = this.player.x;
    this.camera.y = this.player.y;
    markExplored(w, this.player.x, this.player.y, 7);
    audio.playMusic?.(regionId);
    this.refreshQuestTarget();
    this.ui?.onRegionChange?.(regionId);
    return true;
  },

  makeEnemy(type, x, y, opts = {}) {
    const data = ENEMIES[type];
    if (!data) throw new Error('Enemigo desconocido: ' + type);
    const elite = !!opts.elite && !data.boss;
    const scale = (data.boss ? 1.12 : 1) * (elite ? 1.16 : 1);
    return {
      id: 'e' + Math.random().toString(36).slice(2, 8),
      type, data, x, y, homeX: x, homeY: y,
      hp: Math.round(data.hp * (elite ? 1.55 : 1)),
      maxHp: Math.round(data.hp * (elite ? 1.55 : 1)),
      dmg: data.dmg * (elite ? 1.25 : 1),
      speed: data.speed * (elite ? 1.05 : 1),
      radius: data.radius || 18,
      facing: Math.random() * TAU,
      state: 'idle', stateT: 0, attackCd: .6 + Math.random() * data.cooldown,
      hurtT: 0, flash: 0, dead: false, walkPhase: 0,
      elite, scale, level: data.level + (opts.levelScale ? 0 : 0),
      telegraph: null, attackKind: null, pattern: null,
      phase: 1, marked: 0, aggro: false, patrolT: Math.random() * 2,
      dashDir: { x: 0, y: 0 }, didHit: false, enraged: 0, slowT: 0
    };
  },

  makeCreature(species, x, y) {
    const data = CREATURES[species];
    return {
      id: 'c' + Math.random().toString(36).slice(2, 8),
      species, data, x, y, homeX: x, homeY: y,
      hp: data.hp, maxHp: data.hp, radius: 22,
      facing: Math.random() * TAU, state: 'wander', stateT: 0,
      wanderT: Math.random() * 2, walkPhase: 0, scale: data.size || 1,
      seed: Math.random() * 10, resonance: 0, capturable: false,
      captured: false, dead: false, enraged: 0
    };
  },

  travel(regionId) {
    if (!REGIONS[regionId] || regionId === this.regionId) return false;
    this.buildRegion(regionId, { spawnAtStart: true });
    this.player.hp = Math.min(this.player.maxHp, this.player.hp + this.player.maxHp * .25);
    this.questEvent('region', regionId);
    this.ui?.toast?.(REGIONS[regionId].name, 'gold');
    this.ui?.subtitle?.(REGIONS[regionId].subtitle, 4);
    audio.sfx?.('portal');
    this.autoSave();
    return true;
  },

  // ───────────────────────── misiones ─────────────────────────
  startQuest(id) {
    const def = QUESTS[id];
    if (!def || this.quests[id]?.done) return false;
    if (this.quests[id]) return true;
    this.quests[id] = { id, stage: 0, progress: 0, started: true, done: false };
    this.ui?.toast?.(`Nueva misión: ${def.title}`, 'gold');
    audio.sfx?.('quest');
    this.refreshQuestTarget();
    return true;
  },

  questEvent(type, target, amount = 1) {
    let changed = false;
    for (const q of Object.values(this.quests)) {
      if (!q.started || q.done) continue;
      const def = QUESTS[q.id];
      const stage = def?.stages[q.stage];
      if (!stage || stage.type !== type) continue;
      if (stage.target && target && stage.target !== target) continue;
      if (stage.count) {
        q.progress = (q.progress || 0) + amount;
        if (q.progress < stage.count) { changed = true; continue; }
      }
      q.stage++;
      q.progress = 0;
      changed = true;
      if (q.stage >= def.stages.length) this.completeQuest(q.id);
      else {
        this.ui?.toast?.(def.stages[q.stage].text, 'gold');
        audio.sfx?.('quest');
      }
      this.refreshQuestTarget();
    }
    if (changed) this.autoSave();
  },

  completeQuest(id) {
    const def = QUESTS[id];
    const q = this.quests[id];
    if (!def || !q || q.done) return;
    q.done = true;
    q.stage = def.stages.length;
    const r = def.reward || {};
    if (r.xp) this.addXp(r.xp);
    if (r.gold) this.addGold(r.gold);
    if (r.shards) this.addShards(r.shards);
    if (r.items) for (const [item, qty] of Object.entries(r.items)) this.addInventory(item, qty);
    this.ui?.toast?.(`Misión completada: ${def.title}`, 'gold');
    this.ui?.subtitle?.(`${def.title} — completada`, 3);
    audio.sfx?.('quest');
    onQuestComplete(this, id);
    this.refreshQuestTarget();
    this.autoSave();
  },

  checkReachQuests() {
    if (!this.world || !this.player) return;
    for (const q of Object.values(this.quests)) {
      if (!q.started || q.done) continue;
      const def = QUESTS[q.id];
      const stage = def?.stages[q.stage];
      if (!stage || stage.type !== 'reach' || !stage.poi) continue;
      const poi = this.world.def.pois.find(p => p.id === stage.poi);
      if (!poi) continue;
      const radius = stage.radius || 460;
      if (dist(this.player.x, this.player.y, poi.x * TILE + TILE / 2, poi.y * TILE + TILE / 2) < radius) {
        this.questEvent('reach', stage.target);
      }
    }
  },

  refreshQuestTarget() {
    this.questTarget = null;
    if (!this.world) return;
    const active = Object.values(this.quests).filter(q => q.started && !q.done).sort((a, b) => (QUESTS[a.id]?.type === 'main' ? -1 : 1) - (QUESTS[b.id]?.type === 'main' ? -1 : 1));
    for (const q of active) {
      const def = QUESTS[q.id], stage = def?.stages[q.stage];
      if (!stage) continue;
      if (stage.poi) {
        const poi = this.world.def.pois.find(p => p.id === stage.poi);
        if (poi) { this.questTarget = { x: poi.x * TILE + TILE / 2, y: poi.y * TILE + TILE / 2, name: poi.name, quest: q.id }; return; }
      }
      if (stage.type === 'region' && stage.target && stage.target !== this.regionId) {
        const portal = this.world.def.pois.find(p => p.type === 'portal');
        if (portal) { this.questTarget = { x: portal.x * TILE + TILE / 2, y: portal.y * TILE + TILE / 2, name: portal.name, quest: q.id }; return; }
      }
      if (stage.type === 'boss' && this.world.bossArena) {
        this.questTarget = { x: this.world.bossArena.x, y: this.world.bossArena.y, name: stage.text, quest: q.id }; return;
      }
    }
  },

  journalUnlock(id) {
    if (!LORE[id] || this.lore.has(id)) return;
    this.lore.add(id);
    this.ui?.toast?.(`Códice: ${LORE[id].title}`, 'gold');
    audio.sfx?.('quest');
    this.autoSave();
  },

  // ───────────────────────── interacción ─────────────────────────
  interact() {
    if (this.mode !== 'playing' || !this.nearInteract) return;
    const it = this.nearInteract;
    if (it.type === 'npc') return this.talkToNpc(it.npc);
    if (it.type === 'chest') return this.openChest(it);
    if (it.type === 'lore') {
      const lore = LORE[it.lore];
      if (!lore) return;
      this.journalUnlock(it.lore);
      it.read = true;
      this.ui?.dialog({ lines: [{ look: 'book', speaker: lore.title, role: 'Códice del Velo', text: lore.text }] });
      return;
    }
    if (it.type === 'gather') return this.gatherNode(it);
    if (it.type === 'shrine') { this.restAtShrine(it); return; }
    if (it.type === 'portal') return this.usePortal(it);
    if (it.type === 'sign' || it.type === 'well') {
      this.ui?.dialog({ lines: [{ look: 'book', speaker: it.type === 'well' ? 'El pozo' : 'Inscripción', role: 'Brumavela', text: it.text || 'La piedra ha perdido sus palabras.' }] });
      return;
    }
  },

  talkToNpc(npc) {
    if (!npc || npc.hidden) return;
    if (npc.id === 'kael_k' && this.quests.velo?.stage === 3 && !this.flags.kael_duel_started) {
      this.flags.kael_duel_started = true;
      npc.hidden = true;
      this.ui?.dialog({
        lines: [
          { look: 'kael', speaker: 'Kael', role: 'Heredero de la Orden', text: 'La Orden dice que el heredero debe probarse antes de la Ascensión. Yo digo que ya sabemos cómo termina esto.' },
          { look: 'kael', speaker: 'Kael', role: 'Heredero de la Orden', text: 'No quiero tu corona. Quiero saber si el Velo se equivocó al elegirte. Desenvaina.' }
        ],
        onEnd: () => {
          this.spawnBoss('kael', npc.x - 60, npc.y - 20);
          this.ui?.subtitle?.('Kael, el Heredero', 3);
        }
      });
      return;
    }
    const script = npcTalk(this, npc);
    if (!script) return;
    this.ui?.dialog({ lines: script.lines, onEnd: script.onEnd });
  },

  openChest(it) {
    if (it.opened) { this.ui?.toast?.('El cofre está vacío'); return; }
    it.opened = true;
    it.disabled = true;
    this.flags['opened_' + it.id] = true;
    const loot = it.loot || {};
    if (loot.gold) this.addGold(loot.gold);
    if (loot.shards) this.addShards(loot.shards);
    const names = [];
    for (const id of loot.items || []) {
      if (this.addInventory(id, 1)) names.push(ITEMS[id]?.name || id);
    }
    audio.sfx?.('chest');
    this.spawnBurst(it.x, it.y - 16, '#e8c37a', 22, 100);
    const msg = [loot.gold ? `${loot.gold} oro` : '', ...names].filter(Boolean).join(' · ');
    this.ui?.toast?.('Cofre abierto: ' + (msg || 'recuerdos'), 'gold');
    this.autoSave();
  },

  gatherNode(it) {
    if (it.gathered) { this.ui?.toast?.('Ya has recogido esto'); return; }
    it.gathered = true;
    it.disabled = true;
    this.flags['gathered_' + it.id] = true;
    if (it.prop) it.prop.harvested = true;
    const id = it.gather;
    this.addInventory(id, 1);
    this.questEvent('gather', id);
    audio.sfx?.('pickup');
    this.spawnBurst(it.x, it.y - 12, '#a9e6a0', 14, 70);
    this.floatText(it.x, it.y - 50, `+1 ${ITEMS[id]?.name || 'recurso'}`, '#b8e6a0');
    this.autoSave();
  },

  usePortal(it) {
    const target = it.target;
    if (target === 'drakmor' && !this.flags.drakmor_open) {
      this.ui?.dialog({ lines: [{ look: 'book', speaker: 'Puerta de Ceniza', role: 'Sello antiguo', text: 'La puerta está cerrada. En el centro de la piedra hay un hueco con forma de gema. Algo dentro de ti late al acercarte.' }] });
      this.ui?.toast?.('Necesitas la Gema Celestial', 'danger');
      return;
    }
    if (target === 'kansordore' && !this.flags.kansordore_open) {
      this.ui?.dialog({ lines: [{ look: 'book', speaker: 'Cicatriz del Velo', role: 'Herida del mundo', text: 'La grieta respira. Aún no está lista para dejarte pasar. La Lágrima debe elegir antes.' }] });
      this.ui?.toast?.('Necesitas la Lágrima de la Primera Brasa', 'danger');
      return;
    }
    this.ui?.playPortalTransition?.(() => this.travel(target));
  },

  restAtShrine(it) {
    if (!this.player) return;
    this.player.hp = this.player.maxHp;
    this.player.mp = this.player.maxMp;
    this.player.stamina = this.player.maxStamina;
    this.player.burning = 0;
    this.player.shield = 0;
    this.lastShrine = { regionId: this.regionId, x: it?.x ?? this.player.x, y: it?.y ?? this.player.y };
    audio.sfx?.('shrine');
    this.spawnBurst(this.player.x, this.player.y - 20, '#bde7f0', 26, 90);
    this.ui?.toast?.('Has descansado. Vida, maná y aguante restaurados.', 'gold');
    this.autoSave();
  },

  spawnBoss(type, x, y) {
    if (!ENEMIES[type]) return null;
    const existing = this.enemies.find(e => e.type === type && !e.dead);
    if (existing) return existing;
    const e = this.makeEnemy(type, x, y);
    e.aggro = true;
    e.state = 'chase';
    this.enemies.push(e);
    this.boss = e;
    this.bossActive = true;
    this.ui?.showBoss?.(e);
    audio.sfx?.('boss');
    audio.setBattle?.(true);
    this.shake = Math.max(this.shake, 8);
    return e;
  },

  // ───────────────────────── muerte y finales ─────────────────────────
  playerDied() {
    if (!this.player || this.player.dead) return;
    this.player.dead = true;
    this.player.hp = 0;
    this.setMode('dead');
    audio.setBattle?.(false);
    audio.sfx?.('death');
    this.ui?.showDeath?.();
  },

  revive() {
    if (!this.player) return;
    const p = this.lastShrine || this.world?.playerStart || { x: this.world.W * TILE / 2, y: this.world.H * TILE / 2 };
    this.player.x = p.x; this.player.y = p.y;
    this.player.hp = Math.round(this.player.maxHp * .65);
    this.player.mp = Math.round(this.player.maxMp * .5);
    this.player.stamina = this.player.maxStamina;
    this.player.dead = false;
    this.player.invuln = 2;
    this.player.state = 'idle';
    this.player.burning = 0;
    this.player.shield = 0;
    this.enemies.forEach(e => { if (!e.data.boss) { e.aggro = false; e.state = 'idle'; } });
    this.setMode('playing');
    this.ui?.hideDeath?.();
    this.ui?.toast?.('Despiertas junto al último santuario.', 'gold');
    this.autoSave();
  },

  finishEnding(choice) {
    if (!ENDINGS[choice]) return;
    this.flags.ending = choice;
    this.flags.ending_done = true;
    this.autoSave();
    this.setMode('ending');
    audio.setBattle?.(false);
    audio.playMusic?.(choice === 'ruptura' ? 'title' : 'kansordore');
    this.ui?.showEnding?.(choice, ENDINGS[choice]);
  },

  postEnding() {
    this.setMode('playing');
    this.ui?.hideEnding?.();
    this.ui?.toast?.('El mundo sigue. Tú también.', 'gold');
    audio.playMusic?.(this.regionId || 'valdoria');
  },

  // ───────────────────────── render ─────────────────────────
  render(ctx, W, H) {
    if (!this.inGame || !this.world || !this.player) return;
    const cam = this.camera;
    const sx = cam.x, sy = cam.y;
    if (this.shake > .1 && this.settings.screenShake) {
      cam.x += (Math.random() - .5) * this.shake;
      cam.y += (Math.random() - .5) * this.shake;
    }
    drawWorld(ctx, this, W, H);
    cam.x = sx; cam.y = sy;
    this.shake *= .88;
    if (this.shake < .1) this.shake = 0;
  }
};
