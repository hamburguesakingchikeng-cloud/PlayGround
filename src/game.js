// ============================================================
// LA ESPADA CELESTIAL — lógica de juego
// Estado, combate, misiones, vínculos, forja, guardado y finales.
// ============================================================
import {
  clamp, dist, dist2, angleTo, angleDiff, norm, choose, chance, TAU,
  fmt, SaveSystem, detectQuality, STAT_KEYS, ELEMENTS,
} from './core.js';
import {
  ITEMS, SPELLS, SKILLS, CREATURES, ENEMIES, SHOPS, GAME,
  CREATURE_IDS, RARITY,
} from './data.js';
import {
  ZONES, NPCS, QUESTS, QUEST_ORDER, LORE, DEFAULT_LORE, CINEMATICS,
  FINAL_CHOICES, ENDINGS, LOOT_TABLES, REGIONS, REGION_ZONES, SHRINE_ZONES,
} from './story.js';
import { Player, Enemy, Companion, Projectile } from './entities.js';
import { World } from './world.js';

const SETTINGS_KEY = 'espada_celestial_settings_v1';

function loadSettings() {
  const fallback = {
    master: 0.75, music: 0.55, sfx: 0.7, muted: false,
    quality: detectQuality(), shake: true, damageNumbers: true,
    touch: 'auto', reduceMotion: false, fontScale: 1,
  };
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    return raw ? { ...fallback, ...JSON.parse(raw) } : fallback;
  } catch { return fallback; }
}

export class Game {
  constructor({ renderer, input, audio, ui }) {
    this.renderer = renderer;
    this.input = input;
    this.audio = audio;
    this.ui = ui;
    this.world = new World();
    this.state = 'title';
    this.time = 0;
    this.playtime = 0;
    this.slot = 0;
    this.profile = null;
    this.player = null;
    this.zone = null;
    this.zoneId = null;
    this.enemies = [];
    this.projectiles = [];
    this.particles = [];
    this.floatingTexts = [];
    this.loot = [];
    this.effects = { slashes: [], rings: [], beams: [], spawns: [] };
    this.companion = null;
    this.inventory = {};
    this.equipment = {};
    this.itemUpgrades = {};
    this.skills = new Set();
    this.creatures = {};
    this.activeCreature = null;
    this.quests = {};
    this.flags = {};
    this.lore = new Set(DEFAULT_LORE);
    this.trialState = [];
    this.doneObjects = new Set();
    this.triggered = new Set();
    this.regionKills = {};
    this.nearInteractable = null;
    this.targetEnemy = null;
    this.boss = null;
    this.bossSpawned = false;
    this.lastShrine = null;
    this.dialogueOpen = false;
    this.endingId = null;
    this.settings = loadSettings();
    this.autosaveTimer = 0;
    this.hudTimer = 0;
    this.fadeTimer = null;
    this._pendingBoss = null;
    this._ambient = 0;
    this.ui.blockingInput = false;
    this.applySettings();
  }

  // ==========================================================
  // CICLO
  // ==========================================================
  update(dt) {
    this.time += dt;
    if (this.state === 'playing' && !this.ui.blockingInput) {
      this.playtime += dt;
      this.handleGlobalInput();
      this.updatePlayer(dt);
      this.updateEnemies(dt);
      this.updateProjectiles(dt);
      this.updateCompanion(dt);
      this.updateLoot(dt);
      this.updateTriggers(dt);
      this.updateBattleMusic();
      this.autosaveTimer += dt;
      if (this.autosaveTimer > 30) { this.autosaveTimer = 0; this.save(this.slot, true); }
    }
    this.updateParticles(dt);
    this.updateEffects(dt);
    this.updateFloatingTexts(dt);
    this.updateInteractions();
    this.hudTimer += dt;
    if (this.hudTimer > 0.08 && this.player) {
      this.hudTimer = 0;
      this.ui.updateHUD(this);
    }
  }

  handleGlobalInput() {
    if (this.input.consume('pause')) { this.ui.openMenu('character'); return; }
    if (this.input.consume('menu')) { this.ui.openMenu('journal'); return; }
    if (this.input.consume('map')) { this.ui.openMenu('map'); return; }
    if (this.input.consume('codex')) { this.ui.openMenu('creatures'); return; }
    if (this.input.consume('interact')) this.onInteract();
  }

  updatePlayer(dt) {
    if (!this.player) return;
    this.player.update(dt, this);
    if (this.player.dead) return;
    // Caída fuera del mundo por seguridad
    if (this.player.x < 0 || this.player.y < 0 || this.player.x > this.zone.w || this.player.y > this.zone.h) {
      this.player.x = clamp(this.player.x, 30, this.zone.w - 30);
      this.player.y = clamp(this.player.y, 30, this.zone.h - 30);
    }
  }

  updateEnemies(dt) {
    for (const e of this.enemies) {
      if (!e.dead) e.update(dt, this);
      else e.update(dt, this);
    }
    this.enemies = this.enemies.filter(e => !e.dead || e.deathTime < 3);
    if (this.boss && (this.boss.dead || !this.enemies.includes(this.boss))) this.boss = null;
  }

  updateCompanion(dt) {
    if (this.companion) {
      this.companion.update(dt, this);
      if (this.companion.def && this.player && this.companion.hp > 0) {
        const passive = this.companion.def.passive;
        if (passive?.name === 'Savia' && this.companion.hp < this.companion.maxHP) this.companion.hp = Math.min(this.companion.maxHP, this.companion.hp + this.companion.maxHP * 0.01 * dt);
      }
    }
  }

  updateProjectiles(dt) {
    for (const p of this.projectiles) p.update(dt, this);
    this.projectiles = this.projectiles.filter(p => !p.dead);
  }

  updateParticles(dt) {
    for (const p of this.particles) {
      p.life -= dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vx *= 1 - (p.drag ?? 1.8) * dt;
      p.vy *= 1 - (p.drag ?? 1.8) * dt;
      p.vy += (p.gravity ?? 0) * dt;
    }
    const max = this.settings.quality === 'low' ? 90 : this.settings.quality === 'medium' ? 180 : 320;
    if (this.particles.length > max) this.particles.splice(0, this.particles.length - max);
    this.particles = this.particles.filter(p => p.life > 0);
  }

  updateEffects(dt) {
    for (const k of ['slashes', 'rings', 'beams', 'spawns']) {
      for (const e of this.effects[k]) e.life -= dt;
      this.effects[k] = this.effects[k].filter(e => e.life > 0);
    }
  }

  updateFloatingTexts(dt) {
    for (const f of this.floatingTexts) {
      f.life -= dt;
      f.y -= (f.vy ?? 28) * dt;
      f.x += (f.vx ?? 0) * dt;
    }
    this.floatingTexts = this.floatingTexts.filter(f => f.life > 0);
  }

  updateLoot(dt) {
    for (const l of this.loot) {
      l.life -= dt;
      l.age = (l.age || 0) + dt;
      if (!this.player) continue;
      const d = dist(l.x, l.y, this.player.x, this.player.y);
      if (d < 110 && l.age > 0.25) {
        const n = norm(this.player.x - l.x, this.player.y - l.y);
        l.x += n.x * 190 * dt; l.y += n.y * 190 * dt;
      }
      if (d < 30) {
        l.picked = true;
        this.addItem(l.itemId, l.amount || 1, true);
        this.spawnParticles(l.x, l.y, 5, l.color || '#ffd06a', 50, 0.4, 2);
        this.audio.sfx('ui');
        if (ITEMS[l.itemId]?.rarity === 'rare' || ITEMS[l.itemId]?.rarity === 'epic' || ITEMS[l.itemId]?.rarity === 'legendary') {
          this.toast(`${ITEMS[l.itemId].name}${l.amount > 1 ? ' ×' + l.amount : ''}`, 'rare');
        }
        this.checkCollectQuests();
      }
    }
    this.loot = this.loot.filter(l => !l.picked && l.life > 0);
  }

  updateInteractions() {
    if (!this.zone || !this.player) return;
    this.nearInteractable = this.zone.nearestInteractable(this.player.x, this.player.y, 80);
    this.targetEnemy = null;
    let best = 170;
    for (const e of this.enemies) {
      if (e.dead || !e.canCapture) continue;
      const d = dist(e.x, e.y, this.player.x, this.player.y);
      if (d < best) { best = d; this.targetEnemy = e; }
    }
    if (this.ui && this.state === 'playing') this.ui.updatePrompts(this);
  }

  updateBattleMusic() {
    if (!this.zone) return;
    const inBattle = this.enemies.some(e => !e.dead && e.aggro && dist(e.x, e.y, this.player.x, this.player.y) < 650);
    if (this.boss && !this.boss.dead) this.audio.setMode('boss', true);
    else this.audio.setMode(this.zone.def.music || 'valdoria', inBattle);
  }

  updateTriggers() {
    if (!this.zone) return;
    const p = this.player;
    // jefes
    if (this.zone.boss && !this.flags[this.zone.boss.flag] && !this.bossSpawned) {
      const b = this.zone.boss;
      if (dist(p.x, p.y, b.triggerX, b.triggerY) < b.triggerR) this.startBossEncounter();
    }
    // disparadores narrativos
    for (const tr of this.zone.def.triggers || []) {
      if (this.triggered.has(tr.id)) continue;
      if (tr.condition && !this.flags[tr.condition]) continue;
      if (dist(p.x, p.y, tr.x, tr.y) < tr.r) {
        this.triggered.add(tr.id);
        if (tr.startQuest) this.startQuest(tr.startQuest);
        if (tr.scene && CINEMATICS[tr.scene]) {
          this.state = 'cinematic';
          this.ui.blockingInput = true;
          this.ui.playCinematic(CINEMATICS[tr.scene], () => {
            this.ui.blockingInput = false;
            this.state = 'playing';
          });
        }
      }
    }
    // alcance de misión
    if (!this._zoneReached) {
      this._zoneReached = true;
      this.questEvent('reach', this.zone.id);
    }
  }

  // ==========================================================
  // INICIO Y ZONAS
  // ==========================================================
  newGame(profile) {
    this.profile = { ...profile };
    this.player = null;
    this.state = 'playing';
    this.time = 0;
    this.playtime = 0;
    this.inventory = { potion_lumen: 3, mana_tears: 1, herb_brisa: 1 };
    this.equipment = { weapon: 'sword_alba', armor: 'armor_viajero', helmet: 'hood_viajero', accessory: null };
    this.itemUpgrades = {};
    this.skills = new Set();
    this.creatures = {};
    this.activeCreature = null;
    this.companion = null;
    this.quests = {};
    this.flags = { m1_started: true };
    this.lore = new Set(DEFAULT_LORE);
    this.trialState = [];
    this.doneObjects = new Set();
    this.triggered = new Set();
    this.regionKills = {};
    this.lastShrine = null;
    this.endingId = null;
    this.slot = this.slot ?? 0;
    this.player = new Player(this, profile);
    this.player.x = 1000; this.player.y = 1100;
    this.setZone('valdoria_village', { x: 1000, y: 1100 }, true);
    this.startQuest('m1');
    this.ui.enterGame(this);
    this.state = 'cinematic';
    this.ui.blockingInput = true;
    this.ui.playCinematic(CINEMATICS.intro, () => {
      this.ui.blockingInput = false;
      this.state = 'playing';
      this.ui.showBanner('VALDORIA', 'Brisavelo', 'La Ruptura ha abierto una grieta sobre la aldea.');
      this.ui.toast('Habla con la Maestra Elara en el santuario', 'good');
      this.save(this.slot, true);
    });
  }

  setZone(id, spawn = null, initial = false) {
    const def = ZONES[id];
    if (!def) { this.toast('Esa región aún no existe.', 'bad'); return; }
    this.zoneId = id;
    this.zone = this.world.get(id);
    this._zoneReached = false;
    this.bossSpawned = false;
    this.boss = null;
    this.enemies = [];
    this.projectiles = [];
    this.loot = [];
    this.nearInteractable = null;
    this.targetEnemy = null;
    const rawSpawn = spawn || def.spawn;
    const safe = this.zone.safeSpawn(
      clamp(rawSpawn.x, 30, def.w - 30),
      clamp(rawSpawn.y, 30, def.h - 30),
      18,
    );
    const sp = safe;
    if (this.player) {
      this.player.x = sp.x;
      this.player.y = sp.y;
      this.player.vx = this.player.vy = 0;
      this.player.state = 'idle';
      this.player.dead = false;
      this.player.deathTime = 0;
      this.player.invuln = 1;
    }
    // enemigos de zona
    for (const e of this.zone.enemies) {
      if (!ENEMIES[e.type]) continue;
      const enemy = new Enemy(this, e.type, e.x, e.y, { elite: !!e.elite });
      enemy.spawnX = e.spawnX ?? e.x;
      enemy.spawnY = e.spawnY ?? e.y;
      this.enemies.push(enemy);
    }
    // acompañante
    if (this.companion) {
      this.companion.x = this.player.x - 38;
      this.companion.y = this.player.y + 28;
      this.companion.downed = false;
      this.companion.hp = Math.max(this.companion.hp, this.companion.maxHP * 0.5);
    }
    // cámara instantánea
    const r = this.renderer;
    const vw = r.w / r.zoom, vh = r.h / r.zoom;
    r.camera.x = clamp(this.player.x - vw / 2, 0, Math.max(0, def.w - vw));
    r.camera.y = clamp(this.player.y - vh / 2, 0, Math.max(0, def.h - vh));
    this.audio.setMode(def.music || 'valdoria', false);
    if (!initial) {
      this.ui.showBanner(REGIONS[def.region]?.name || '', def.name, def.desc);
      this.audio.sfx('portal');
    }
    this.questEvent('reach', id);
  }

  travelZone(id, spawn = null) {
    if (this.ui.blockingInput) return;
    this.ui.fade(true, `Viajando a ${ZONES[id]?.name || 'otro lugar'}…`);
    this.audio.sfx('portal');
    setTimeout(() => {
      this.setZone(id, spawn, false);
      this.ui.fade(false);
      this.save(this.slot, true);
    }, 420);
  }

  portalLocked(portal) {
    if (!portal.require) return false;
    if (this.flags[portal.require]) return false;
    if (portal.require === 'trial_done') return !this.flags.trial_done;
    return !this.flags[portal.require];
  }

  startBossEncounter() {
    const b = this.zone.boss;
    if (!b || this.bossSpawned || this.flags[b.flag]) return;
    this.bossSpawned = true;
    const intro = CINEMATICS[b.intro];
    if (intro) {
      this.state = 'cinematic';
      this.ui.blockingInput = true;
      this.ui.playCinematic(intro, () => {
        this.spawnBoss(b);
        this.ui.blockingInput = false;
        this.state = 'playing';
      });
    } else this.spawnBoss(b);
  }

  spawnBoss(b) {
    if (!b || this.flags[b.flag]) return;
    const enemy = new Enemy(this, b.enemy, b.x, b.y, { level: this.zone.level + 2 });
    enemy.awake = true;
    enemy.aggro = true;
    enemy.boss = true;
    this.enemies.push(enemy);
    this.boss = enemy;
    this.audio.setMode('boss', true);
    this.audio.sfx('roar');
    this.shake(10, 0.5);
    this.ui.showBanner('AMENAZA', enemy.name, 'La arena ha despertado.');
    this.spawnRing(b.x, b.y, 190, enemy.def.colors.glow, 0.8);
    this.spawnParticles(b.x, b.y - 20, 30, enemy.def.colors.glow, 160, 1.2, 4);
  }

  onBossPhase(enemy) {
    this.toast(`${enemy.name} entra en la Fase ${['I', 'II', 'III'][enemy.phase - 1] || enemy.phase}`, 'bad');
    this.audio.sfx('roar');
    this.shake(14, 0.5);
    this.spawnRing(enemy.x, enemy.y, 220, enemy.def.colors.glow, 0.7);
    this.spawnParticles(enemy.x, enemy.y, 26, enemy.def.colors.glow, 150, 1, 4);
  }

  // ==========================================================
  // ENTRADA E INTERACCIÓN
  // ==========================================================
  onInteract() {
    const it = this.nearInteractable;
    if (!it) { this.toast('No hay nada cerca', 'bad'); return; }
    if (it.kind === 'npc') return this.talkTo(it.npc);
    if (it.kind === 'chest') return this.openChest(it.chest);
    if (it.kind === 'shrine') return this.useShrine(it.shrine);
    if (it.kind === 'portal') return this.usePortal(it.portal);
    if (it.kind === 'lore') return this.readLore(it.loreStone);
    if (it.kind === 'herb') return this.gatherHerb(it.herb);
    if (it.kind === 'object') return this.useObject(it.object);
  }

  talkTo(npc) {
    const def = NPCS[npc.id];
    if (!def) return;
    const dialogue = def.dialogue(this);
    if (!dialogue) return;
    this.dialogueOpen = true;
    this.ui.blockingInput = true;
    this.audio.sfx('ui');
    this.ui.openDialogue(dialogue, {
      npcId: npc.id,
      onEffect: (effect) => this.applyDialogueEffect(effect),
      onEnd: () => {
        this.dialogueOpen = false;
        this.ui.blockingInput = false;
        if (dialogue.endEffect) this.applyDialogueEffect(dialogue.endEffect);
        this.questEvent('talk', npc.id);
        this.checkCollectQuests();
      },
    });
  }

  applyDialogueEffect(effect) {
    if (!effect) return;
    switch (effect.type) {
      case 'shop': this.ui.openShop(effect.id); break;
      case 'forge': this.ui.openForge(); break;
      case 'startQuest': this.startQuest(effect.id); break;
      case 'give': {
        if (Array.isArray(effect.id)) this.addItem(effect.id[0], effect.id[1] || 1);
        else if (typeof effect.id === 'string') this.addItem(effect.id, effect.count || 1);
        break;
      }
      case 'flag': this.flags[effect.id] = true; break;
      case 'elara_blessing':
        this.flags.elara_met = true;
        this.startQuest('m1');
        this.toast('La Espada Celestial late con más fuerza', 'good');
        break;
      case 'nima_meeting':
        this.flags.nima_met = true;
        this.startQuest('m2');
        this.toast('Nima ha marcado el camino a Alderion', 'good');
        break;
      case 'ordo_meeting':
        this.flags.m3_started = true;
        this.startQuest('m3');
        this.toast('El camino a la Fortaleza Calcinada está abierto', 'good');
        break;
      case 'forge_tear':
        this.forgeCelestialSword();
        break;
      case 'ending': this.ui.showEndingChoices(this); break;
      default: break;
    }
  }

  openChest(chest) {
    if (chest.opened) return;
    chest.opened = true;
    this.audio.sfx('chest');
    this.spawnParticles(chest.x, chest.y - 15, 16, '#ffd06a', 90, 0.8, 3);
    this.addGold(18 + chest.tier * 22 + Math.floor(Math.random() * 24));
    const region = this.zone.region;
    const table = LOOT_TABLES[region] || LOOT_TABLES.valdoria;
    const pool = table[Math.min(3, chest.tier)] || table[1];
    const count = chest.tier >= 3 ? 3 : 2;
    for (let i = 0; i < count; i++) {
      const id = choose(pool);
      this.dropLoot(chest.x + (Math.random() - 0.5) * 34, chest.y - 8 + (Math.random() - 0.5) * 20, id, 1);
    }
    this.toast('Cofre abierto', 'good');
    this.questEvent('interact', chest.id);
    this.save(this.slot, true);
  }

  useShrine(shrine) {
    shrine.active = true;
    this.player.hp = this.player.maxHP;
    this.player.mp = this.player.maxMP;
    this.player.stamina = this.player.maxStamina;
    this.player.statuses = { burn: 0, poison: 0, slow: 0, weaken: 0, shield: 0, haste: 0 };
    this.lastShrine = { zone: this.zoneId, x: shrine.x, y: shrine.y, name: shrine.name };
    this.audio.sfx('heal');
    this.spawnRing(shrine.x, shrine.y - 10, 100, '#9fe8ff', 0.8);
    this.spawnParticles(shrine.x, shrine.y - 20, 22, '#9fe8ff', 80, 1, 3);
    this.toast(`${shrine.name}: salud, maná y resistencia restaurados`, 'good');
    this.questEvent('interact', shrine.id);
    // El primer santuario despierta a Lumito
    if (shrine.id === 'shrine_village' && !this.creatures.lumito) {
      this.bindCreature('lumito', true);
      this.state = 'cinematic';
      this.ui.blockingInput = true;
      this.ui.playCinematic(CINEMATICS.awakening, () => {
        this.ui.blockingInput = false;
        this.state = 'playing';
      });
    }
    this.save(this.slot, true);
  }

  usePortal(portal) {
    if (this.portalLocked(portal)) {
      this.toast(portal.lockText || 'El camino está cerrado.', 'bad');
      this.audio.sfx('error');
      return;
    }
    this.travelZone(portal.to, { x: portal.toX, y: portal.toY });
  }

  readLore(stone) {
    if (!stone.read) {
      stone.read = true;
      this.addLore(stone.lore);
    }
    this.ui.openLore(stone.lore);
    this.audio.sfx('ui');
  }

  gatherHerb(herb) {
    if (herb.gathered) return;
    herb.gathered = true;
    this.addItem(herb.id || 'herb_brisa', 1);
    this.spawnParticles(herb.x, herb.y - 10, 10, '#7ddc9a', 60, 0.6, 2);
    this.audio.sfx('ui');
    this.toast('Hierba de Brisa recogida', 'good');
    this.checkCollectQuests();
  }

  useObject(o) {
    const done = this.doneObjects.has(o.id);
    switch (o.type) {
      case 'altar_gem':
        if (!this.flags.boss_guardian) { this.toast('El altar está protegido por el Guardián de Raíces.', 'bad'); return; }
        if (this.flags.gem_taken) { this.toast('La Gema Celestial ya está en tu espada.', 'good'); return; }
        this.addItem('gem_celestial', 1);
        this.flags.gem_taken = true;
        this.doneObjects.add(o.id);
        this.audio.sfx('levelup');
        this.spawnRing(o.x, o.y - 30, 120, '#9fe8ff', 1);
        this.spawnParticles(o.x, o.y - 30, 28, '#9fe8ff', 110, 1.2, 3);
        this.ui.showBanner('RELIQUIA', 'Gema Celestial', 'La espada recuerda el primer sueño del mundo.');
        this.questEvent('interact', o.id);
        this.save(this.slot, true);
        break;
      case 'altar_tear':
        if (!this.flags.boss_reina) { this.toast('La Lágrima aún está custodiada por la Reina Calcinada.', 'bad'); return; }
        if (!this.inventory.tear_first_ember) this.addItem('tear_first_ember', 1);
        this.doneObjects.add(o.id);
        this.toast('La Lágrima de la Primera Brasa te reconoce', 'rare');
        break;
      case 'altar_truth':
        if (!this.flags.boss_custodio) { this.toast('El Custodio del Velo aún guarda la verdad.', 'bad'); return; }
        if (this.flags.truth_known) { this.ui.openLore('arquitecto'); return; }
        this.state = 'cinematic';
        this.ui.blockingInput = true;
        this.ui.playCinematic(CINEMATICS.truth, () => {
          this.flags.truth_known = true;
          this.doneObjects.add(o.id);
          this.addLore('arquitecto');
          this.addLore('jarra');
          this.questEvent('interact', o.id);
          this.ui.blockingInput = false;
          this.state = 'playing';
          this.ui.showBanner('LA VERDAD', 'Jugador Cero', 'La Fisura del Velo te reconoce.');
          this.save(this.slot, true);
        });
        break;
      case 'altar_convergence':
        if (!this.flags.boss_arquitecto) { this.toast('El Arquitecto del Velo aún espera.', 'bad'); return; }
        this.questEvent('interact', o.id);
        this.ui.showEndingChoices(this);
        break;
      case 'trial_altar': {
        if (this.trialState.includes(o.index)) { this.toast('Este altar ya ha resonado.', 'good'); return; }
        if (!this.activeCreature) { this.toast('Necesitas un eco activo para resonar.', 'bad'); return; }
        this.trialState.push(o.index);
        this.doneObjects.add(o.id);
        this.audio.sfx('spell');
        this.spawnRing(o.x, o.y - 20, 90, '#9fe8ff', 0.8);
        this.spawnParticles(o.x, o.y - 20, 16, '#9fe8ff', 80, 0.8, 3);
        const labels = ['', 'Recuerdo', 'Entrega', 'Renacer'];
        this.toast(`Altar del ${labels[o.index] || 'eco'} activado (${this.trialState.length}/3)`, 'good');
        if (this.trialState.length >= 3) {
          this.flags.trial_done = true;
          this.questEvent('trial', 'trial_done');
          this.ui.showBanner('PRUEBA SUPERADA', 'Tres Resonancias', 'La Biblioteca Prohibida se ha abierto.');
          this.audio.sfx('quest');
          this.save(this.slot, true);
        }
        break;
      }
      case 'lost_echo':
        if (done) { this.toast('El eco ya está a salvo.', 'good'); return; }
        this.doneObjects.add(o.id);
        this.flags.lost_echo_saved = true;
        this.bindCreature('lumito', true);
        this.audio.sfx('capture');
        this.spawnParticles(o.x, o.y - 20, 24, '#dcc9ff', 100, 1, 3);
        this.ui.showBanner('VÍNCULO', 'Lumito', 'El eco perdido ha elegido caminar contigo.');
        this.questEvent('interact', o.id);
        this.save(this.slot, true);
        break;
      case 'bell':
        if (done) { this.toast('La campana ya ha recuperado su voz.', 'good'); return; }
        if (this.questState('s4') === 'active' && this.itemCount('crystal_shard') >= 3) {
          this.removeItem('crystal_shard', 3);
          this.doneObjects.add(o.id);
          this.flags.bell_rung = true;
          this.audio.sfx('quest');
          this.spawnRing(o.x, o.y - 30, 140, '#ffd06a', 1);
          this.ui.showBanner('ALDERION', 'La campana rota', 'Su voz cruza las ruinas como una marea lenta.');
          this.questEvent('interact', o.id);
          this.save(this.slot, true);
        } else {
          this.toast('La campana necesita 3 fragmentos de cristal.', 'bad');
        }
        break;
      case 'rune':
        if (!done) {
          this.doneObjects.add(o.id);
          this.toast('La runa murmura una palabra antigua', 'good');
          this.addLore(choose(['primera_brasa', 'resonancia', 'gema', 'ruptura']));
        }
        break;
      default:
        this.toast(o.label || 'No ocurre nada', 'bad');
    }
  }

  // ==========================================================
  // COMBATE
  // ==========================================================
  getAimAngle(entity) {
    const p = entity || this.player;
    if (this.input.mouse.active) {
      const w = this.renderer.screenToWorld(this.input.mouse.x, this.input.mouse.y);
      if (dist(w.x, w.y, p.x, p.y) > 8) return Math.atan2(w.y - p.y, w.x - p.x);
    }
    if (this.input.moving) return Math.atan2(this.input.moveY, this.input.moveX);
    const near = this.nearestEnemy(p.x, p.y, 280, true);
    if (near) return angleTo(p.x, p.y, near.x, near.y);
    return p.facing;
  }

  moveEntity(entity, dx, dy) {
    if (!this.zone) return;
    const nx = entity.x + dx, ny = entity.y + dy;
    if (!this.zone.isBlocked(nx, ny, entity.r || 14)) { entity.x = nx; entity.y = ny; return; }
    if (!this.zone.isBlocked(nx, entity.y, entity.r || 14)) { entity.x = nx; return; }
    if (!this.zone.isBlocked(entity.x, ny, entity.r || 14)) { entity.y = ny; }
  }

  nearestEnemy(x, y, max = 400, aliveOnly = true) {
    let best = null, bd = max;
    for (const e of this.enemies) {
      if (aliveOnly && e.dead) continue;
      const d = dist(x, y, e.x, e.y);
      if (d < bd) { bd = d; best = e; }
    }
    return best;
  }

  playerMeleeHit(player, heavy) {
    const range = heavy ? 86 : 64;
    const arc = heavy ? 2.5 : 2.1;
    const base = player.attack * (heavy ? 1.55 : 1.0) * player.allDmg;
    const skill = this.skillBonus();
    let hits = 0;
    for (const e of this.enemies) {
      if (e.dead) continue;
      const d = dist(player.x, player.y, e.x, e.y);
      if (d > range + e.r) continue;
      if (Math.abs(angleDiff(player.facing, angleTo(player.x, player.y, e.x, e.y))) > arc * 0.55) continue;
      let dmg = base * (heavy ? 1 + (skill.heavyDmg || 0) : 1 + (skill.lightDmg || 0));
      const crit = Math.random() * 100 < player.crit;
      if (crit) dmg *= player.critDmg;
      const element = player.weaponElement || 'luz';
      const dealt = this.damageEnemy(e, dmg, {
        element, crit, heavy, source: player,
        status: element === 'fuego' ? 'burn' : element === 'sombra' ? 'weaken' : undefined,
        statusDuration: 3, statusPower: player.attack * 0.2,
      });
      if (dealt > 0) {
        hits++;
        player.stamina = Math.min(player.maxStamina, player.stamina + 2);
        if (crit) this.shake(3, 0.12);
      }
    }
    if (heavy) {
      this.spawnSlash(player.x, player.y - 16, player.facing, range + 10, player.weaponGlow || '#ffe9a8', 0.34, 8);
      if (skill.heavyWave) {
        this.spawnRing(player.x, player.y, 95, player.weaponGlow || '#ffe9a8', 0.45);
        for (const e of this.enemies) {
          if (!e.dead && dist(player.x, player.y, e.x, e.y) < 110) this.damageEnemy(e, base * 0.35, { element: player.weaponElement, source: player });
        }
      }
    } else {
      this.spawnSlash(player.x, player.y - 14, player.facing, range + 4, player.weaponGlow || '#ffe9a8', 0.24, 5);
    }
    if (hits > 0) {
      this.audio.sfx(heavy ? 'heavy' : 'hit');
      this.shake(heavy ? 6 : 2.5, heavy ? 0.22 : 0.1);
      player.hitstop = heavy ? 0.06 : 0.025;
    }
  }

  damageEnemy(enemy, amount, opts = {}) {
    if (!enemy || enemy.dead) return 0;
    const dmg = enemy.takeDamage(amount, this, opts);
    if (opts.crit) this.addText(enemy.x, enemy.y - enemy.r - 36, '¡CRÍTICO!', '#ffd06a', 10);
    return dmg;
  }

  damagePlayer(amount, opts = {}) {
    const p = this.player;
    if (!p || p.dead) return 0;
    const src = opts.source;
    let ang = p.facing + Math.PI;
    if (src) ang = angleTo(p.x, p.y, src.x, src.y);
    if (p.blocking && p.stamina > 2 && Math.abs(angleDiff(p.facing, ang)) < 1.35) {
      const perfect = p.blockTime < 0.22;
      const staminaCost = amount * (perfect ? 0.25 : 0.55);
      if (p.stamina >= staminaCost * 0.35) {
        p.stamina = Math.max(0, p.stamina - staminaCost);
        p.staminaDelay = 0.5;
        this.audio.sfx(perfect ? 'parry' : 'block');
        this.spawnParticles(p.x + Math.cos(ang) * 20, p.y - 24, perfect ? 14 : 7, perfect ? '#ffe9a8' : '#c7f0e0', 80, 0.4, 2);
        if (perfect) {
          this.addText(p.x, p.y - 62, '¡PARRY!', '#ffe9a8', 16);
          this.shake(4, 0.15);
          if (src && !src.dead) {
            src.stagger = Math.max(src.stagger, src.boss ? 0.6 : 1.4);
            src.poise = 0;
            this.damageEnemy(src, p.attack * 1.2, { source: p, element: p.weaponElement, crit: true });
          }
          const shock = this.skillBonus().parryShock;
          if (shock) {
            this.spawnRing(p.x, p.y, 120, '#ffe9a8', 0.5);
            for (const e of this.enemies) if (!e.dead && dist(p.x, p.y, e.x, e.y) < 130) this.damageEnemy(e, shock + p.attack, { source: p, element: 'luz' });
          }
        } else {
          const reduced = amount * (1 - 0.68 * (1 + (this.skillBonus().defPct || 0)));
          p.hp -= Math.max(1, reduced * (100 / (100 + p.defense * 0.55)));
          this.addText(p.x, p.y - 52, 'BLOQUEO', '#c7f0e0', 11);
          if (p.hp <= 0) p.die(this);
        }
        return 0;
      }
    }
    const dealt = p.takeDamage(amount, this, opts);
    if (this.settings.damageNumbers === false) { /* el texto se genera en Player.takeDamage */ }
    return dealt;
  }

  projectileHit(pr, target) {
    if (!target) return;
    if (pr.team === 'enemy') {
      this.damagePlayer(pr.damage, { source: pr.source, element: pr.element, knockback: { x: pr.vx, y: pr.vy } });
      this.spawnParticles(pr.x, pr.y, 6, pr.color || '#b48cff', 60, 0.35, 2);
    } else {
      this.damageEnemy(target, pr.damage, {
        source: pr.source, element: pr.element,
        status: pr.element === 'fuego' ? 'burn' : pr.element === 'sombra' ? 'weaken' : undefined,
        statusDuration: 3, statusPower: pr.damage * 0.18,
      });
      this.spawnParticles(pr.x, pr.y, 5, pr.color || '#ffe9a8', 60, 0.3, 2);
    }
  }

  lineHit(x1, y1, angle, range, width, x2, y2, r = 12) {
    const ex = x1 + Math.cos(angle) * range, ey = y1 + Math.sin(angle) * range;
    const dx = ex - x1, dy = ey - y1;
    const l2 = dx * dx + dy * dy || 1;
    let t = ((x2 - x1) * dx + (y2 - y1) * dy) / l2;
    t = clamp(t, 0, 1);
    const px = x1 + dx * t, py = y1 + dy * t;
    return dist2(x2, y2, px, py) < (width / 2 + r) ** 2;
  }

  castSpell(index) {
    const p = this.player;
    if (!p || p.dead) return;
    const spell = Object.values(SPELLS)[index];
    if (!spell) return;
    const cost = Math.round(spell.cost * (1 - (this.skillBonus().spellCost || 0)));
    if (p.spellCooldowns[index] > 0) { this.toast(`Hechizo en ${p.spellCooldowns[index].toFixed(1)} s`, 'bad'); return; }
    if (p.mp < cost) { this.toast('Maná insuficiente', 'bad'); this.audio.sfx('error'); return; }
    p.mp -= cost;
    p.manaDelay = 1.2;
    p.spellCooldowns[index] = 2.2;
    p.startCast(this, index, this.getAimAngle(p));
    this.audio.sfx('spell');
  }

  executeSpell(index, aim) {
    const p = this.player;
    const spell = Object.values(SPELLS)[index];
    if (!spell || !p) return;
    const power = p.spellPower * spell.power * p.allDmg;
    if (spell.type === 'projectile') {
      this.spawnProjectile({
        x: p.x, y: p.y - 20, vx: Math.cos(aim) * spell.speed, vy: Math.sin(aim) * spell.speed,
        r: spell.radius, damage: power, team: 'player', element: spell.element,
        color: spell.color, life: 1.6, pierce: 3, source: p, type: 'blade',
      });
      this.spawnParticles(p.x, p.y - 20, 8, spell.color, 60, 0.4, 2);
    } else if (spell.type === 'nova') {
      this.spawnRing(p.x, p.y, spell.radius, spell.color, 0.7, false, true);
      this.shake(7, 0.3);
      for (const e of this.enemies) {
        if (e.dead) continue;
        const d = dist(p.x, p.y, e.x, e.y);
        if (d < spell.radius + e.r) {
          this.damageEnemy(e, power, { element: spell.element, source: p });
          const n = norm(e.x - p.x, e.y - p.y);
          this.moveEntity(e, n.x * (spell.knockback || 180) * 0.18, n.y * (spell.knockback || 180) * 0.18);
        }
      }
      this.spawnParticles(p.x, p.y, 24, spell.color, 160, 0.8, 3);
    } else if (spell.type === 'zone') {
      const zx = p.x + Math.cos(aim) * 130, zy = p.y + Math.sin(aim) * 130;
      this.spawnRing(zx, zy, spell.radius, spell.color, 0.8, false, true);
      this.effects.spawns.push({ x: zx, y: zy, life: 0.8, maxLife: 0.8, color: spell.color });
      for (const e of this.enemies) {
        if (e.dead) continue;
        if (dist(zx, zy, e.x, e.y) < spell.radius + e.r) {
          this.damageEnemy(e, power, { element: spell.element, source: p });
          e.applyStatus('slow', spell.stun || 1.8, 1);
        }
      }
      this.audio.sfx('spell_dark');
      this.shake(5, 0.25);
    }
  }

  usePotion() {
    const p = this.player;
    if (!p || p.dead) return;
    const choice = (this.inventory.potion_mayor && p.hpPct < 0.45) ? 'potion_mayor'
      : (this.inventory.potion_lumen ? 'potion_lumen' : (this.inventory.potion_mayor ? 'potion_mayor' : null));
    if (!choice) { this.toast('No quedan pociones', 'bad'); this.audio.sfx('error'); return; }
    this.useItem(choice);
  }

  useItem(id) {
    const item = ITEMS[id];
    if (!item || item.type !== 'consumable') return false;
    if (this.itemCount(id) <= 0) { this.toast('No tienes ese objeto', 'bad'); return false; }
    const p = this.player;
    if (!p) return false;
    const eff = item.effect || {};
    if (eff.healPct) p.heal(p.maxHP * eff.healPct, this);
    if (eff.manaPct) p.mp = Math.min(p.maxMP, p.mp + p.maxMP * eff.manaPct);
    if (eff.staminaFull) p.stamina = p.maxStamina;
    if (eff.haste) p.statuses.haste = Math.max(p.statuses.haste, eff.haste);
    if (eff.cleanse) p.statuses.burn = 0;
    if (eff.bondBuff) this.flags.bond_buff = (this.flags.bond_buff || 0) + eff.bondBuff;
    if (eff.revive) this.flags.phoenix_charged = true;
    this.removeItem(id, 1);
    this.audio.sfx('heal');
    this.spawnParticles(p.x, p.y - 20, 14, '#7ddc9a', 80, 0.7, 3);
    this.toast(item.name, 'good');
    this.ui.refreshMenu();
    return true;
  }

  useCreatureSkill() {
    if (!this.companion) { this.toast('No tienes un eco activo', 'bad'); return; }
    this.companion.useAbility(this);
  }

  tryCaptureNearest() {
    const e = this.targetEnemy;
    if (!e) { this.toast('Ningún eco está listo para el vínculo', 'bad'); return; }
    if (!e.canCapture) { this.toast('El eco debe estar debilitado y aturdido', 'bad'); return; }
    const def = CREATURES[e.capturable];
    if (!def) return;
    const bonus = this.player.captureBonus + (this.flags.bond_buff || 0);
    let p = def.capture + bonus - e.hpPct * 0.25;
    p = clamp(p, 0.06, 0.95);
    this.flags.bond_buff = 0;
    this.audio.sfx('capture');
    this.spawnRing(e.x, e.y, 90, def.colors.glow, 0.8);
    if (Math.random() < p) {
      this.bindCreature(e.capturable, true);
      e.dead = true; e.deathTime = 0; e.aggro = false;
      this.spawnParticles(e.x, e.y, 30, def.colors.glow, 130, 1, 4);
      this.gainXP(Math.round(e.xp * 0.6));
      this.ui.showBanner('VÍNCULO', def.name, def.epithet);
      this.save(this.slot, true);
    } else {
      e.captureImmune = 6;
      e.rage = 3;
      e.aggro = true;
      e.hp = Math.max(1, e.hp - e.maxHP * 0.03);
      this.toast('El eco se resiste. Vuelve a intentarlo.', 'bad');
      this.audio.sfx('capture_fail');
      this.spawnParticles(e.x, e.y, 12, '#b48cff', 70, 0.5, 2);
    }
  }

  bindCreature(id, makeActive = false) {
    const def = CREATURES[id];
    if (!def) return;
    if (!this.creatures[id]) {
      this.creatures[id] = { level: Math.max(1, this.player.level - 1), xp: 0 };
      this.toast(`Nuevo eco vinculado: ${def.name}`, 'rare');
    } else {
      this.creatures[id].level = Math.min(20, this.creatures[id].level + 1);
      this.toast(`${def.name} ha fortalecido su vínculo`, 'good');
    }
    if (makeActive || !this.activeCreature) this.setActiveCreature(id);
  }

  setActiveCreature(id) {
    if (!this.creatures[id]) return;
    this.activeCreature = id;
    const data = this.creatures[id];
    this.companion = new Companion(this, id, data.level || 1);
    this.companion.x = this.player.x - 36;
    this.companion.y = this.player.y + 24;
    this.toast(`${CREATURES[id].name} te acompaña`, 'good');
    this.player.recalc(this);
    this.ui.refreshMenu();
  }

  // ==========================================================
  // XP, OBJETOS, ORO
  // ==========================================================
  gainXP(amount) {
    if (!this.player || amount <= 0) return;
    this.player.xp += amount;
    this.addText(this.player.x, this.player.y - 70, '+' + amount + ' XP', '#9fe8ff', 11);
    while (this.player.xp >= this.player.xpNext) {
      this.player.xp -= this.player.xpNext;
      this.player.level++;
      this.player.xpNext = Math.round(60 * Math.pow(1.34, this.player.level - 1));
      this.player.points++;
      this.player.skillPoints++;
      this.player.recalc(this);
      this.player.hp = this.player.maxHP;
      this.player.mp = this.player.maxMP;
      this.player.stamina = this.player.maxStamina;
      this.audio.sfx('levelup');
      this.ui.showBanner('NIVEL ' + this.player.level, 'La espada recuerda', '+1 punto de atributo · +1 punto de habilidad');
      this.spawnRing(this.player.x, this.player.y, 120, '#ffe9a8', 1);
      this.spawnParticles(this.player.x, this.player.y - 20, 26, '#ffe9a8', 120, 1, 3);
      if (this.companion) this.companion.recalc(this);
    }
  }

  addGold(amount) {
    if (!this.player) return;
    const bonus = 1 + (this.skillBonus().gold || 0);
    const val = Math.round(amount * bonus);
    this.player.gold += val;
    this.addText(this.player.x, this.player.y - 58, '+' + val + ' oro', '#ffd06a', 11);
  }

  addItem(id, count = 1, silent = false) {
    if (!ITEMS[id]) return;
    this.inventory[id] = (this.inventory[id] || 0) + count;
    if (!silent) this.toast(`${ITEMS[id].name}${count > 1 ? ' ×' + count : ''}`, ITEMS[id].rarity === 'legendary' ? 'rare' : 'good');
    if (id === 'crystal_shard' || id === 'herb_brisa' || id === 'star_shard') this.checkCollectQuests();
    if (this.player) this.player.recalc(this);
  }

  removeItem(id, count = 1) {
    if (!this.inventory[id]) return false;
    this.inventory[id] -= count;
    if (this.inventory[id] <= 0) delete this.inventory[id];
    if (this.player) this.player.recalc(this);
    return true;
  }

  itemCount(id) { return this.inventory[id] || 0; }

  addLore(id) {
    if (!LORE[id]) return;
    if (this.lore.has(id)) return;
    this.lore.add(id);
    this.gainXP(18);
    this.toast('Nueva entrada en el códice: ' + LORE[id].title, 'rare');
    this.save(this.slot, true);
  }

  dropLoot(x, y, id, count = 1) {
    const item = ITEMS[id];
    if (!item) return;
    this.loot.push({
      x, y, itemId: id, amount: count, name: item.name, icon: item.icon,
      color: RARITY[item.rarity]?.color || '#ffd06a', life: 60, age: 0,
    });
  }

  dropLootForEnemy(e) {
    const drops = e.def.drops || [];
    for (const d of drops) {
      if (Math.random() < (d.p ?? 0.2)) {
        this.dropLoot(e.x + (Math.random() - 0.5) * 26, e.y + (Math.random() - 0.5) * 18, d.id, d.count || 1);
      }
    }
    const regionTable = LOOT_TABLES[this.zone.region] || LOOT_TABLES.valdoria;
    if (Math.random() < 0.25) {
      const pool = regionTable[Math.min(2, Math.max(1, Math.ceil(this.zone.level / 5)))];
      this.dropLoot(e.x, e.y, choose(pool), 1);
    }
  }

  // ==========================================================
  // MUERTE Y JEFES
  // ==========================================================
  onEnemyKilled(enemy) {
    if (!enemy) return;
    this.audio.sfx('death');
    this.gainXP(enemy.xp);
    this.addGold(enemy.gold);
    this.dropLootForEnemy(enemy);
    const tag = this.zone.region;
    this.regionKills[tag] = (this.regionKills[tag] || 0) + 1;
    this.questEvent('kill', tag, { count: this.regionKills[tag] });
    if (enemy.boss) {
      const b = this.zone.boss;
      if (b) {
        this.flags[b.flag] = true;
        this.questEvent('boss', enemy.id);
        const echo = enemy.def.echo;
        if (echo && !this.creatures[echo]) {
          this.bindCreature(echo, false);
          this.toast(`El eco de ${enemy.name} se ha vinculado`, 'rare');
        }
        this.ui.showBanner('VICTORIA', enemy.name, 'La arena vuelve a respirar.');
        this.spawnRing(enemy.x, enemy.y, 240, enemy.def.colors.glow, 1.2);
        this.shake(18, 0.7);
        if (b.outro && CINEMATICS[b.outro]) {
          this.state = 'cinematic';
          this.ui.blockingInput = true;
          this.ui.playCinematic(CINEMATICS[b.outro], () => {
            this.ui.blockingInput = false;
            this.state = 'playing';
            this.save(this.slot, true);
          });
        } else this.save(this.slot, true);
      }
      this.boss = null;
    }
    if (this.companion && this.companion.def?.passive?.name === 'Hambre') this.companion.hp = Math.min(this.companion.maxHP, this.companion.hp + this.companion.maxHP * 0.05);
  }

  onPlayerDeath() {
    if (!this.player) return;
    if (this.flags.phoenix_charged || this.itemCount('phoenix_tear') > 0) {
      this.flags.phoenix_charged = false;
      this.removeItem('phoenix_tear', 1);
      this.player.dead = false;
      this.player.hp = this.player.maxHP * 0.6;
      this.player.invuln = 2;
      this.player.state = 'idle';
      this.player.deathTime = 0;
      this.audio.sfx('levelup');
      this.ui.showBanner('LÁGRIMA DE FÉNIX', 'Has vuelto', 'La muerte te soltó por esta vez.');
      return;
    }
    this.audio.sfx('death');
    this.state = 'dead';
    this.ui.blockingInput = true;
    this.ui.showDeath(this);
  }

  respawn() {
    const p = this.player;
    if (!p) return;
    const lost = Math.round(p.gold * 0.1);
    p.gold = Math.max(0, p.gold - lost);
    p.dead = false;
    p.deathTime = 0;
    p.hp = Math.max(1, p.maxHP * 0.65);
    p.mp = p.maxMP * 0.6;
    p.stamina = p.maxStamina;
    p.state = 'idle';
    p.statuses = { burn: 0, poison: 0, slow: 0, weaken: 0, shield: 0, haste: 0 };
    if (this.lastShrine) this.setZone(this.lastShrine.zone, { x: this.lastShrine.x + 50, y: this.lastShrine.y + 50 });
    else this.setZone(this.zoneId, null);
    this.state = 'playing';
    this.ui.blockingInput = false;
    this.ui.closeOverlay();
    this.save(this.slot, true);
  }

  // ==========================================================
  // MISIONES
  // ==========================================================
  questState(id) { return this.quests[id]?.state || null; }
  questStep(id) { return this.quests[id]?.step || 0; }
  questDef(id) { return QUESTS[id]; }

  startQuest(id) {
    const def = QUESTS[id];
    if (!def || this.quests[id]) return;
    this.quests[id] = { state: 'active', step: 0, progress: 0 };
    this.audio.sfx('quest');
    this.toast(`Misión iniciada: ${def.title}`, 'good');
    if (id === 'm3') this.flags.m3_started = true;
    if (id === 'm4') this.flags.m4_started = true;
    if (id === 'm5') this.flags.m5_started = true;
    this.checkCollectQuests();
    this.save(this.slot, true);
  }

  questEvent(type, id, data = {}) {
    for (const qid of QUEST_ORDER) {
      const q = this.quests[qid];
      if (!q || q.state !== 'active') continue;
      const def = QUESTS[qid];
      const step = def.steps[q.step];
      if (!step || !step.event) continue;
      const ev = step.event;
      if (ev.type !== type) continue;
      if (type === 'reach') {
        if (ev.zone !== id) continue;
      } else if (type === 'kill') {
        if (ev.tag !== id) continue;
        q.progress = data.count || 0;
        if (q.progress < (ev.count || 1)) continue;
      } else if (type === 'collect') {
        if (ev.id !== id) continue;
        if (this.itemCount(id) < (ev.count || 1)) continue;
      } else if (type === 'trial') {
        if (ev.id !== id) continue;
      } else {
        if (ev.id !== id) continue;
      }
      this.advanceQuest(qid);
    }
  }

  checkCollectQuests() {
    for (const qid of QUEST_ORDER) {
      const q = this.quests[qid];
      if (!q || q.state !== 'active') continue;
      const ev = QUESTS[qid].steps[q.step]?.event;
      if (ev?.type === 'collect' && this.itemCount(ev.id) >= (ev.count || 1)) this.advanceQuest(qid);
    }
  }

  advanceQuest(id) {
    const q = this.quests[id];
    const def = QUESTS[id];
    if (!q || !def) return;
    q.step++;
    if (q.step >= def.steps.length) this.completeQuest(id);
    else {
      this.toast('Objetivo actualizado: ' + def.steps[q.step].text, 'good');
      this.save(this.slot, true);
    }
  }

  completeQuest(id) {
    const q = this.quests[id];
    const def = QUESTS[id];
    if (!q || q.state === 'done') return;
    q.state = 'done';
    q.step = def.steps.length;
    // consumibles de misión
    if (id === 's1') this.removeItem('herb_brisa', 3);
    if (id === 's5') this.removeItem('star_shard', 3);
    const r = def.rewards || {};
    if (r.xp) this.gainXP(r.xp);
    if (r.gold) this.addGold(r.gold);
    for (const [item, count] of r.items || []) this.addItem(item, count);
    if (def.onComplete?.flags) Object.assign(this.flags, def.onComplete.flags);
    if (def.onComplete?.toast) this.toast(def.onComplete.toast, 'rare');
    this.audio.sfx('quest');
    this.ui.showBanner('MISIÓN COMPLETADA', def.title, def.onComplete?.toast || 'Tu leyenda crece.');
    this.spawnRing(this.player.x, this.player.y, 90, '#ffe9a8', 0.8);
    // progresión principal
    if (id === 'm1') { this.startQuest('m2'); this.flags.nima_met = this.flags.nima_met || false; }
    if (id === 'm2') this.startQuest('m3');
    if (id === 'm3') { this.flags.tear_forged = true; }
    if (id === 'm4') { this.flags.truth_known = true; }
    this.save(this.slot, true);
  }

  npcHasQuest(npcId) {
    const q = (id) => this.quests[id];
    if (npcId === 'elara') {
      if (q('m1')?.state === 'active' && this.questStep('m1') === 0) return true;
      return this.questState('m1') === 'done' && !this.flags.nima_met;
    }
    if (npcId === 'marta') {
      if (!q('s1')) return true;
      return q('s1').state === 'active' && this.questStep('s1') === 1 && this.itemCount('herb_brisa') >= 3;
    }
    if (npcId === 'kael') {
      if (!q('s2')) return true;
      return q('s2').state === 'active' && this.questStep('s2') === 1;
    }
    if (npcId === 'cael') {
      if (!q('s4')) return true;
      return q('s4').state === 'active' && this.questStep('s4') === 2;
    }
    if (npcId === 'ordo') {
      if (!q('s3') && this.flags.m3_started) return true;
      return q('s3')?.state === 'active' && this.questStep('s3') === 1;
    }
    if (npcId === 'serah') {
      return (q('m3')?.state === 'active' && [0, 2].includes(this.questStep('m3'))) || (this.flags.boss_reina && !this.flags.tear_forged);
    }
    if (npcId === 'nima') return !this.flags.nima_met;
    if (npcId === 'archivista') {
      if (!q('s5')) return true;
      return q('s5').state === 'active' && this.questStep('s5') === 1 && this.itemCount('star_shard') >= 3;
    }
    return false;
  }

  // ==========================================================
  // FORJA, TIENDA Y HABILIDADES
  // ==========================================================
  forgeCelestialSword() {
    this.flags.tear_forged = true;
    this.addItem('sword_celestial', 1, true);
    this.equipment.weapon = 'sword_celestial';
    this.player.recalc(this);
    this.player.hp = this.player.maxHP;
    this.player.mp = this.player.maxMP;
    this.audio.sfx('levelup');
    this.ui.showBanner('ESPADA CELESTIAL', 'Forjada de nuevo', 'La Lágrima y la Gema han recordado su nombre.');
    this.spawnRing(this.player.x, this.player.y, 160, '#9fe8ff', 1.2);
    this.spawnParticles(this.player.x, this.player.y - 20, 36, '#9fe8ff', 140, 1.2, 4);
    this.questEvent('talk', 'serah');
    this.save(this.slot, true);
  }

  forgeUpgrade(itemId) {
    const item = ITEMS[itemId];
    if (!item || !['weapon', 'armor', 'helmet', 'accessory'].includes(item.type)) return false;
    if (!this.ownsItem(itemId)) { this.toast('No posees ese objeto', 'bad'); return false; }
    const lvl = this.itemUpgrades[itemId] || 0;
    if (lvl >= 5) { this.toast('El objeto ya está al máximo', 'bad'); return false; }
    const goldCost = Math.round(60 * Math.pow(1.6, lvl) + (item.value || 40) * 0.3);
    const shards = 1 + lvl;
    if (this.player.gold < goldCost) { this.toast(`Faltan ${goldCost - this.player.gold} de oro`, 'bad'); return false; }
    if (this.itemCount('crystal_shard') < shards) { this.toast(`Faltan ${shards - this.itemCount('crystal_shard')} fragmentos de cristal`, 'bad'); return false; }
    this.player.gold -= goldCost;
    this.removeItem('crystal_shard', shards);
    this.itemUpgrades[itemId] = lvl + 1;
    this.player.recalc(this);
    this.audio.sfx('chest');
    this.toast(`${item.name} reforjado a +${lvl + 1}`, 'rare');
    this.ui.refreshMenu();
    this.save(this.slot, true);
    return true;
  }

  itemUpgradeBonus(itemId, key) {
    const lvl = this.itemUpgrades[itemId] || 0;
    const base = ITEMS[itemId]?.stats?.[key] || 0;
    return Math.round(base * 0.12 * lvl);
  }

  ownsItem(id) {
    return this.itemCount(id) > 0 || Object.values(this.equipment).includes(id);
  }

  equipItem(id) {
    const item = ITEMS[id];
    if (!item || !['weapon', 'armor', 'helmet', 'accessory'].includes(item.type)) return;
    if (!this.ownsItem(id)) { this.toast('No posees ese objeto', 'bad'); return; }
    const slot = item.type;
    const old = this.equipment[slot];
    if (old === id) return;
    if (old) this.addItem(old, 1, true);
    this.removeItem(id, 1);
    this.equipment[slot] = id;
    this.player.recalc(this);
    this.audio.sfx('ui');
    this.toast(`${item.name} equipado`, 'good');
    this.ui.refreshMenu();
    this.save(this.slot, true);
  }

  unequip(slot) {
    const old = this.equipment[slot];
    if (!old) return;
    this.addItem(old, 1, true);
    this.equipment[slot] = null;
    this.player.recalc(this);
    this.audio.sfx('ui');
    this.ui.refreshMenu();
  }

  buyItem(shopId, itemId) {
    const item = ITEMS[itemId];
    if (!item) return;
    const price = Math.max(1, Math.round((item.value || 20) * (RARITY[item.rarity]?.mult || 1)));
    if (this.player.gold < price) { this.toast('Oro insuficiente', 'bad'); this.audio.sfx('error'); return; }
    this.player.gold -= price;
    this.addItem(itemId, 1, true);
    this.audio.sfx('chest');
    this.toast(`Compraste ${item.name}`, 'good');
    this.ui.refreshMenu();
  }

  sellItem(itemId) {
    const item = ITEMS[itemId];
    if (!item || item.type === 'key') return;
    if (this.itemCount(itemId) <= 0) return;
    this.removeItem(itemId, 1);
    const price = Math.max(1, Math.round((item.value || 10) * 0.45));
    this.player.gold += price;
    this.audio.sfx('ui');
    this.toast(`Vendiste ${item.name} por ${price} de oro`, 'good');
    this.ui.refreshMenu();
  }

  skillBonus() {
    const out = {};
    for (const id of this.skills) {
      const s = SKILLS[id];
      if (!s) continue;
      for (const [k, v] of Object.entries(s.effects || {})) {
        if (typeof v === 'number') out[k] = (out[k] || 0) + v;
      }
    }
    return out;
  }

  hasSkill(id) { return this.skills.has(id); }

  learnSkill(id) {
    const s = SKILLS[id];
    if (!s || this.skills.has(id)) return;
    if (this.player.skillPoints < s.cost) { this.toast('Puntos de habilidad insuficientes', 'bad'); return; }
    if (!(s.req || []).every(r => this.skills.has(r))) { this.toast('Falta una habilidad previa', 'bad'); return; }
    this.player.skillPoints -= s.cost;
    this.skills.add(id);
    this.player.recalc(this);
    this.audio.sfx('levelup');
    this.toast(`Habilidad aprendida: ${s.name}`, 'good');
    this.ui.refreshMenu();
    this.save(this.slot, true);
  }

  spendAttribute(key) {
    if (!this.player || this.player.points <= 0) return;
    this.player.attrs[key] = (this.player.attrs[key] || 0) + 1;
    this.player.points--;
    this.player.recalc(this);
    this.audio.sfx('ui');
    this.ui.refreshMenu();
  }

  // ==========================================================
  // EFECTOS
  // ==========================================================
  spawnSlash(x, y, angle, range, color, life = 0.25, width = 5) {
    this.effects.slashes.push({ x, y, angle, range, color, life, maxLife: life, width, arc: 2.2 });
  }
  spawnRing(x, y, maxRadius, color, life = 0.5, inward = false, fill = false) {
    this.effects.rings.push({ x, y, maxRadius, color, life, maxLife: life, inward, fill });
  }
  spawnBeam(x, y, angle, range, width, color, life = 0.4) {
    this.effects.beams.push({ x, y, angle, range, width, color, life, maxLife: life });
  }
  spawnProjectile(opts) {
    this.projectiles.push(new Projectile(opts));
  }
  spawnParticles(x, y, count, color, speed = 80, life = 0.5, size = 2, opts = {}) {
    const n = Math.min(count, this.settings.quality === 'low' ? Math.ceil(count * 0.55) : count);
    for (let i = 0; i < n; i++) {
      const a = Math.random() * TAU, sp = speed * (0.25 + Math.random() * 0.75);
      this.particles.push({
        x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - (opts.up || 0),
        life: life * (0.5 + Math.random() * 0.8), maxLife: life, size: size * (0.5 + Math.random()),
        color, gravity: opts.gravity ?? 0, drag: opts.drag ?? 1.6,
      });
    }
  }
  spawnEnemy(id, x, y, opts = {}) {
    if (!ENEMIES[id]) return null;
    const e = new Enemy(this, id, x, y, opts);
    e.awake = true;
    e.aggro = true;
    this.enemies.push(e);
    this.spawnRing(x, y, 70, e.def.colors.glow, 0.5);
    return e;
  }
  addText(x, y, text, color = '#fff3c4', size = 13) {
    if (this.settings.damageNumbers === false && /^[−+]?\d/.test(String(text))) return;
    this.floatingTexts.push({ x, y, text, color, size, life: 1.1, maxLife: 1.1, vy: 30 });
    if (this.floatingTexts.length > 70) this.floatingTexts.shift();
  }
  shake(strength, time) {
    if (this.settings.shake === false) return;
    const c = this.renderer.camera;
    c.shake = Math.max(c.shake, strength);
    c.shakeTime = Math.max(c.shakeTime, time);
  }
  toast(text, kind = '') { this.ui.toast(text, kind); }
  applyPlayerStatus(name, duration) {
    if (!this.player) return;
    if (name in this.player.statuses) this.player.statuses[name] = Math.max(this.player.statuses[name], duration);
  }

  // ==========================================================
  // FINALES
  // ==========================================================
  chooseEnding(id) {
    const choice = FINAL_CHOICES.find(c => c.id === id);
    if (!choice) return;
    if (choice.req) {
      if (choice.req.creatures && Object.keys(this.creatures).length < choice.req.creatures) {
        this.toast(choice.locked, 'bad'); return;
      }
      if (choice.req.flags && !choice.req.flags.every(f => this.flags[f])) {
        this.toast(choice.locked, 'bad'); return;
      }
    }
    this.endingId = id;
    this.flags.m5_done = true;
    if (this.quests.m5 && this.quests.m5.state === 'active') {
      this.quests.m5.state = 'done';
      this.quests.m5.step = QUESTS.m5.steps.length;
    }
    this.state = 'ending';
    this.ui.blockingInput = true;
    this.save(this.slot, true);
    this.ui.playEnding(ENDINGS[id], this);
  }

  // ==========================================================
  // GUARDADO
  // ==========================================================
  serialize() {
    return {
      version: GAME.version,
      profile: this.profile,
      slot: this.slot,
      zoneId: this.zoneId,
      playtime: this.playtime,
      player: this.player ? {
        name: this.player.name, look: this.player.look, attrs: this.player.attrs,
        level: this.player.level, xp: this.player.xp, xpNext: this.player.xpNext,
        points: this.player.points, skillPoints: this.player.skillPoints,
        gold: this.player.gold, hp: this.player.hp, mp: this.player.mp,
        stamina: this.player.stamina, x: this.player.x, y: this.player.y,
      } : null,
      inventory: this.inventory,
      equipment: this.equipment,
      itemUpgrades: this.itemUpgrades,
      skills: [...this.skills],
      creatures: this.creatures,
      activeCreature: this.activeCreature,
      quests: this.quests,
      flags: this.flags,
      lore: [...this.lore],
      trialState: this.trialState,
      doneObjects: [...this.doneObjects],
      triggered: [...this.triggered],
      regionKills: this.regionKills,
      lastShrine: this.lastShrine,
      endingId: this.endingId,
      settings: this.settings,
    };
  }

  save(slot = this.slot, silent = false) {
    if (!this.player) return false;
    this.slot = slot;
    const ok = SaveSystem.save(slot, this.serialize());
    if (ok && !silent) this.toast('Partida guardada', 'good');
    if (ok) this.ui.updateContinue?.();
    return ok;
  }

  load(slot) {
    const data = SaveSystem.load(slot);
    if (!data || !data.player) { this.toast('No hay partida en esa ranura', 'bad'); return false; }
    this.applySave(data);
    return true;
  }

  applySave(data) {
    this.slot = data.slot ?? 0;
    this.profile = data.profile || { name: data.player.name };
    this.inventory = { ...(data.inventory || {}) };
    this.equipment = { ...(data.equipment || {}) };
    this.itemUpgrades = { ...(data.itemUpgrades || {}) };
    this.skills = new Set(data.skills || []);
    this.creatures = JSON.parse(JSON.stringify(data.creatures || {}));
    this.activeCreature = data.activeCreature || null;
    this.quests = JSON.parse(JSON.stringify(data.quests || {}));
    this.flags = { ...(data.flags || {}) };
    this.lore = new Set(data.lore || DEFAULT_LORE);
    this.trialState = [...(data.trialState || [])];
    this.doneObjects = new Set(data.doneObjects || []);
    this.triggered = new Set(data.triggered || []);
    this.regionKills = { ...(data.regionKills || {}) };
    this.lastShrine = data.lastShrine || null;
    this.endingId = data.endingId || null;
    this.playtime = data.playtime || 0;
    this.settings = { ...loadSettings(), ...(data.settings || {}) };
    this.applySettings();
    this.player = new Player(this, { ...this.profile, ...(data.player || {}) });
    this.player.level = data.player.level || 1;
    this.player.xp = data.player.xp || 0;
    this.player.xpNext = data.player.xpNext || 60;
    this.player.points = data.player.points || 0;
    this.player.skillPoints = data.player.skillPoints || 0;
    this.player.gold = data.player.gold || 0;
    this.player.recalc(this);
    this.player.hp = Math.max(1, data.player.hp || this.player.maxHP);
    this.player.mp = data.player.mp ?? this.player.maxMP;
    this.player.stamina = data.player.stamina ?? this.player.maxStamina;
    this.player.dead = false;
    this.player.state = 'idle';
    this.companion = null;
    this.state = 'playing';
    this.ui.blockingInput = false;
    this.setZone(data.zoneId || 'valdoria_village', { x: data.player.x, y: data.player.y }, true);
    if (this.activeCreature && this.creatures[this.activeCreature]) {
      this.companion = new Companion(this, this.activeCreature, this.creatures[this.activeCreature].level || 1);
      this.companion.x = this.player.x - 36;
      this.companion.y = this.player.y + 24;
    }
    this.ui.enterGame(this);
    this.ui.showBanner(REGIONS[ZONES[this.zoneId]?.region]?.name || '', this.zone.name, 'La memoria continúa donde la dejaste.');
    this.toast('Partida cargada', 'good');
  }

  applySettings() {
    const s = this.settings;
    this.audio.setVolume('master', s.master);
    this.audio.setVolume('music', s.music);
    this.audio.setVolume('sfx', s.sfx);
    this.audio.setMuted(!!s.muted);
    this.renderer._quality = s.quality;
    if (s.fontScale) document.documentElement.style.setProperty('--font-scale', s.fontScale);
    try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(s)); } catch {}
  }

  setSetting(key, value) {
    this.settings[key] = value;
    this.applySettings();
    this.ui.refreshMenu();
  }

  // ==========================================================
  // UTILIDADES
  // ==========================================================
  timeLabel() {
    const day = Math.floor(this.playtime / 240) + 1;
    const frac = (this.playtime % 240) / 240;
    const hour = Math.floor(8 + frac * 12) % 24;
    const min = Math.floor((8 + frac * 12) * 60) % 60;
    return `Día ${day} · ${String(hour).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
  }

  get currentQuest() {
    for (const id of QUEST_ORDER) {
      if (this.quests[id]?.state === 'active') return id;
    }
    return null;
  }

  get questObjective() {
    const id = this.currentQuest;
    if (!id) return 'Explora los tres reinos';
    const q = this.quests[id], def = QUESTS[id];
    return def.steps[q.step]?.text || 'Completa tu leyenda';
  }

  get capturedCount() { return Object.keys(this.creatures).length; }

  get totalStats() {
    const p = this.player;
    if (!p) return [];
    return STAT_KEYS.map(s => ({ ...s, value: p.attrs[s.id] }));
  }

  get regionInfo() { return REGIONS[this.zone?.region] || null; }
}

export { SETTINGS_KEY };
