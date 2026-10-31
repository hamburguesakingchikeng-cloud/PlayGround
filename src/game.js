import * as THREE from 'three';
import {
  ARMORS, CHARMS, CREATURES, ENEMIES, LORE, MAIN_STAGES, REGIONS, SIDE_QUESTS,
  SKILLS, WEAPONS, DIFFICULTIES, SAVE_KEY, xpForLevel,
} from './data.js';
import {
  buildPlayer, updatePlayerModel, rebuildPlayerModel, buildEnemy, updateEnemyModel,
  buildCreature, updateCreatureModel, buildNPC, updateNPCModel,
} from './models.js';
import { World } from './world.js';
import {
  TAU, clamp, damp, dampAngle, makeNameSprite, disposeObject,
} from './three-utils.js';
import {
  introCinematic, chapterCinematic, lyraDialogue, nimaDialogue, miraDialogue,
  orinDialogue, kaelDialogue, bossIntro, convergenceDialogue, endingCinematic,
} from './story.js';

const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'XIII', 'XIV'];
const FOOT_OFFSET = -0.2;
const INTERACT_KEY = 'E';

const dist2 = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);
const vec3 = (x, y, z) => new THREE.Vector3(x, y, z);
const rand = (a, b) => a + Math.random() * (b - a);
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

export class Game {
  /* ------------------------------------------------------------------ */
  /* Construction & state                                                */
  /* ------------------------------------------------------------------ */

  constructor(app, state, options = {}) {
    this.app = app;
    this.ui = app.ui;
    this.audio = app.audio;
    this.camera = app.camera;
    this.state = this.normalizeState(state);

    this.scene = null;
    this.world = null;
    this.enemies = [];
    this.creatures = [];
    this.npcs = [];
    this.projectiles = [];
    this.effects = [];
    this.telegraphs = [];
    this.extraInteractables = [];
    this.companion = null;
    this.captureTarget = null;

    this.time = 0;
    this.playTime = this.state.playTime || 0;
    this.frozen = false;
    this.deathShown = false;
    this.deathTimer = 0;
    this.autoSaveTimer = 0;
    this.shake = 0;
    this.iframe = 0;
    this.hurtTimer = 0;
    this.attack = null;
    this.queuedAttack = null;
    this.attackCooldown = 0;
    this.dodge = null;
    this.cast = null;
    this.comboChain = 0;
    this.comboTimer = 0;
    this.comboDisplay = 0;
    this.blockStart = -10;
    this.footstepTimer = 0;
    this.speedBuff = 0;
    this.speedBuffTimer = 0;
    this.shield = 0;
    this.cooldowns = { spell: 0, spellMax: 6, creature: 0, creatureMax: 10, ultimate: 0, ultimateMax: 22, potion: 0 };
    this.keys = new Set();
    this.nearby = null;
    this.lastRegion = null;
    this.introPlayed = false;

    this.player = {
      group: null,
      model: null,
      blocking: false,
      dead: false,
      moving: 0,
    };

    this.buildPlayerModel();
    this.loadRegion(this.state.region || 'valdoria', options.spawn || null);

    // Clamp stored resources after gear/levels have been recalculated.
    const stats = this.getStats();
    const p = this.state.player;
    p.hp = clamp(Number(p.hp) || stats.maxHp, 1, stats.maxHp);
    p.mp = clamp(Number(p.mp) || stats.maxMp, 0, stats.maxMp);
    p.sp = clamp(Number(p.sp) || stats.maxSp, 0, stats.maxSp);

    this.spawnCompanion();
    this.updateCamera(0.016, true);
  }

  static createState(profile, difficulty = 'equilibrado') {
    const weapon = profile.weapon || 'filo_aurora';
    const armor = profile.armor || 'tunica_viajero';
    return {
      version: 1,
      createdAt: Date.now(),
      playTime: 0,
      difficulty,
      player: {
        name: profile.name || 'Aurel',
        origin: profile.origin || 'filo',
        appearance: { ...(profile.appearance || {}) },
        stats: { ...(profile.stats || {}) },
        level: 1,
        xp: 0,
        xpNext: xpForLevel(1),
        hp: profile.maxHp || 110,
        mp: profile.maxMp || 60,
        sp: profile.maxSp || 75,
        weapon,
        armor,
        charm: null,
        skillPoints: 0,
      },
      region: 'valdoria',
      mainStage: 0,
      stageProgress: {},
      sideQuests: {},
      lore: [],
      creatures: [],
      inventory: {
        pocion_luz: 3,
        esencia_eco: 3,
        fragmentos: 2,
        cristal_resonancia: 1,
      },
      ownedWeapons: [weapon],
      ownedArmors: [armor],
      ownedCharms: [],
      upgrades: { weapon: 0, armor: 0 },
      skills: {},
      unlockedRegions: ['valdoria'],
      flags: {},
      stats: { kills: 0, chests: 0, quests: 0, captures: 0, deaths: 0 },
      defeated: [],
      ending: null,
      checkpoint: { region: 'valdoria', ...REGIONS.valdoria.spawn },
      lastPosition: null,
    };
  }

  normalizeState(raw) {
    const s = raw || {};
    const base = Game.createState({
      name: s.player?.name,
      origin: s.player?.origin,
      appearance: s.player?.appearance,
      stats: s.player?.stats,
      weapon: s.player?.weapon,
      armor: s.player?.armor,
      maxHp: s.player?.hp,
      maxMp: s.player?.mp,
      maxSp: s.player?.sp,
    }, s.difficulty);
    const merged = {
      ...base,
      ...s,
      player: { ...base.player, ...(s.player || {}) },
      inventory: { ...base.inventory, ...(s.inventory || {}) },
      upgrades: { ...base.upgrades, ...(s.upgrades || {}) },
      stats: { ...base.stats, ...(s.stats || {}) },
      flags: { ...(s.flags || {}) },
      skills: { ...(s.skills || {}) },
      sideQuests: { ...(s.sideQuests || {}) },
      stageProgress: { ...(s.stageProgress || {}) },
      unlockedRegions: Array.isArray(s.unlockedRegions) && s.unlockedRegions.length ? [...s.unlockedRegions] : ['valdoria'],
      ownedWeapons: Array.isArray(s.ownedWeapons) ? [...s.ownedWeapons] : [base.player.weapon],
      ownedArmors: Array.isArray(s.ownedArmors) ? [...s.ownedArmors] : [base.player.armor],
      ownedCharms: Array.isArray(s.ownedCharms) ? [...s.ownedCharms] : [],
      creatures: Array.isArray(s.creatures) ? s.creatures.map((c) => ({ ...c })) : [],
      lore: Array.isArray(s.lore) ? [...s.lore] : [],
      defeated: Array.isArray(s.defeated) ? [...s.defeated] : [],
    };
    merged.mainStage = clamp(Number(merged.mainStage) || 0, 0, MAIN_STAGES.length - 1);
    merged.region = REGIONS[merged.region] ? merged.region : 'valdoria';
    merged.player.xpNext = xpForLevel(merged.player.level || 1);
    if (!merged.checkpoint || !REGIONS[merged.checkpoint.region]) {
      merged.checkpoint = { region: merged.region, x: REGIONS[merged.region].spawn.x, z: REGIONS[merged.region].spawn.z };
    }
    return merged;
  }

  get difficulty() {
    return DIFFICULTIES.find((d) => d.id === this.state.difficulty) || DIFFICULTIES[1];
  }

  /* ------------------------------------------------------------------ */
  /* Player model                                                        */
  /* ------------------------------------------------------------------ */

  buildPlayerModel() {
    const p = this.state.player;
    if (this.player.group && this.scene) this.scene.remove(this.player.group);
    const model = buildPlayer(p.appearance, p.weapon, p.armor, p.appearance.headgear || 'ninguno');
    model.group.userData.kind = 'player';
    this.player.group = model.group;
    this.player.model = model;
    this.player.blocking = false;
    if (this.scene) {
      this.scene.add(model.group);
      this.placePlayer(this.player.group.position.x, this.player.group.position.z);
    }
  }

  rebuildPlayer() {
    if (!this.player.model) return;
    const old = this.player.model;
    const next = rebuildPlayerModel(old, this.state.player.appearance, this.state.player.weapon, this.state.player.armor, this.state.player.appearance.headgear || 'ninguno');
    if (this.scene) {
      this.scene.remove(old.group);
      this.scene.add(next.group);
    }
    this.player.group = next.group;
    this.player.model = next;
    next.group.position.y = this.world ? this.world.heightAt(next.group.position.x, next.group.position.z) + FOOT_OFFSET : FOOT_OFFSET;
  }

  /* ------------------------------------------------------------------ */
  /* World & spawns                                                      */
  /* ------------------------------------------------------------------ */

  loadRegion(regionId, spawn = null) {
    if (this.scene && this.player.group) this.scene.remove(this.player.group);
    if (this.companion?.group && this.scene) this.scene.remove(this.companion.group);
    this.companion = null;

    if (this.scene) disposeObject(this.scene);
    this.enemies = [];
    this.creatures = [];
    this.npcs = [];
    this.projectiles = [];
    this.effects = [];
    this.telegraphs = [];
    this.extraInteractables = [];
    this.captureTarget = null;

    this.state.region = regionId;
    this.world = new World(this, regionId);
    this.scene = this.world.scene;
    this.world.addQuestMarker();
    this.scene.add(this.player.group);

    this.spawnEntities();
    this.restoreWorldState();

    let point = spawn;
    if (!point && this.state.lastPosition && this.state.region === regionId) point = this.state.lastPosition;
    if (!point && this.state.checkpoint?.region === regionId) point = this.state.checkpoint;
    if (!point) point = REGIONS[regionId].spawn;
    this.placePlayer(point.x, point.z);
    if (this.state.mainStage >= 13) this.addConvergence();

    this.audio.setTheme(regionId, false);
    this.updateQuestMarker();
    this.spawnCompanion();
    this.updateCamera(0.016, true);
    this.lastRegion = regionId;
  }

  spawnEntities() {
    for (const spawn of this.world.getEnemySpawns()) {
      const uid = `${this.world.regionId}:${spawn.type}:${spawn.x}:${spawn.z}`;
      if (!spawn.respawn && this.state.defeated.includes(uid)) continue;
      if (spawn.seal && (this.state.flags.sealsBroken || []).includes(spawn.seal)) continue;
      this.spawnEnemy(spawn.type, spawn.level || 1, spawn.x, spawn.z, { ...spawn, uid });
    }
    for (const spawn of this.world.getCreatureSpawns()) {
      this.spawnCreature(spawn.species, spawn.x, spawn.z);
    }
    for (const spawn of this.world.getNpcSpawns()) {
      this.spawnNpc(spawn);
    }
    this.ensureBosses();
  }

  spawnEnemy(type, level, x, z, spawn = {}) {
    const def = ENEMIES[type];
    if (!def) return null;
    const model = buildEnemy(def, level);
    const y = this.world.heightAt(x, z);
    model.group.position.set(x, y, z);
    model.group.rotation.y = spawn.rotation || Math.random() * TAU;
    this.scene.add(model.group);
    const scale = 1 + (level - 1) * 0.06;
    const enemy = {
      uid: spawn.uid || `${this.world.regionId}:${type}:${x}:${z}`,
      type,
      def,
      level,
      group: model.group,
      model,
      spawn,
      home: { x, z },
      hp: def.hp * scale,
      maxHp: def.hp * scale,
      dmg: def.dmg * (1 + (level - 1) * 0.07),
      defStat: def.def,
      speed: def.speed,
      range: def.range,
      radius: def.radius,
      dead: false,
      deadProgress: 0,
      deathTimer: 0,
      respawnTimer: 0,
      aggro: false,
      windup: 0,
      attackCooldown: rand(0.2, 1.1),
      hurt: 0,
      stagger: 0,
      moveAmount: 0,
      attacking: false,
      attackProgress: 0,
      active: !def.boss,
      introPlayed: false,
      phase: 1,
      specialTimer: rand(4, 7),
      patrolTimer: rand(1, 4),
      patrolAngle: Math.random() * TAU,
      status: { stun: 0, root: 0, slow: 0, burn: 0, weaken: 0 },
    };
    if (def.boss) {
      enemy.hp = def.hp * (1 + (level - 1) * 0.05);
      enemy.maxHp = enemy.hp;
      enemy.active = false;
      enemy.introPlayed = false;
    }
    this.enemies.push(enemy);
    return enemy;
  }

  ensureBosses() {
    const stage = this.state.mainStage;
    const region = this.world.regionId;
    if (region === 'valdoria' && stage === 4 && !this.state.defeated.includes('boss:guardian')) {
      this.spawnEnemy('guardian', 5, 58, -24, { uid: 'boss:guardian', boss: true });
    }
    if (region === 'drakmor' && stage === 8 && !this.state.defeated.includes('boss:reina')) {
      this.spawnEnemy('reina', 8, 25, -24, { uid: 'boss:reina', boss: true });
    }
    if (region === 'kansordore' && stage === 12 && !this.state.defeated.includes('boss:vex')) {
      this.spawnEnemy('vex', 11, 0, -50, { uid: 'boss:vex', boss: true });
    }
  }

  spawnCreature(speciesId, x, z) {
    const species = CREATURES[speciesId];
    if (!species) return null;
    const model = buildCreature(species);
    const y = this.world.heightAt(x, z);
    model.group.position.set(x, y + 0.05, z);
    this.scene.add(model.group);
    const creature = {
      speciesId,
      species,
      group: model.group,
      model,
      home: { x, z },
      x,
      z,
      captured: false,
      wanderTimer: rand(1, 4),
      target: null,
      moving: false,
      phase: Math.random() * TAU,
    };
    this.creatures.push(creature);
    return creature;
  }

  spawnNpc(spawn) {
    const model = buildNPC(spawn.id);
    const y = this.world.heightAt(spawn.x, spawn.z);
    model.group.position.set(spawn.x, y + FOOT_OFFSET, spawn.z);
    model.group.rotation.y = spawn.rotation || 0;
    this.scene.add(model.group);

    const name = makeNameSprite(spawn.name || spawn.id, '#fff0c2');
    name.position.set(0, 2.55, 0);
    name.scale.multiplyScalar(0.72);
    model.group.add(name);

    const quest = makeNameSprite('!', '#f4d58d');
    quest.position.set(0, 3.15, 0);
    quest.scale.multiplyScalar(0.8);
    quest.visible = false;
    model.group.add(quest);

    const npc = { ...spawn, model, group: model.group, nameSprite: name, questSprite: quest };
    this.npcs.push(npc);
    return npc;
  }

  addConvergence() {
    if (this.extraInteractables.some((i) => i.id === 'convergence')) return;
    const x = 0;
    const z = -50;
    const y = this.world.heightAt(x, z);
    const group = new THREE.Group();
    group.position.set(x, y, z);
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(1.8, 2.5, 48),
      new THREE.MeshBasicMaterial({ color: '#fff0a8', transparent: true, opacity: 0.6, side: THREE.DoubleSide, blending: THREE.AdditiveBlending }),
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.16;
    group.add(ring);
    const gem = new THREE.Mesh(new THREE.OctahedronGeometry(0.45, 0), new THREE.MeshBasicMaterial({ color: '#fff0a8' }));
    gem.position.y = 1.8;
    group.add(gem);
    const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: this.world.sky.material.uniforms ? null : null }));
    glow.visible = false;
    this.scene.add(group);
    this.extraInteractables.push({ id: 'convergence', type: 'convergence', x, z, radius: 5, label: 'La Convergencia', mesh: group, ring, gem });
  }

  restoreWorldState() {
    const f = this.state.flags;
    const opened = new Set(f.chestsOpened || []);
    const braziers = new Set(f.braziersLit || []);
    const lamps = new Set(f.lampsLit || []);
    const seals = new Set(f.sealsBroken || []);
    for (const item of this.world.getInteractables()) {
      if (item.type === 'chest' && opened.has(item.id)) {
        item.opened = true;
        if (item.lid) item.lid.rotation.x = -1.1;
      }
      if (item.type === 'brazier' && braziers.has(item.id)) {
        item.lit = true;
        item.flame.material.opacity = 0.9;
        item.flame.scale.setScalar(2.1);
      }
      if (item.type === 'lamp' && lamps.has(item.id)) {
        item.lit = true;
        item.flame.material.opacity = 0.9;
        item.flame.scale.setScalar(2.4);
      }
      if (item.type === 'lore' && this.state.lore.includes(item.id)) {
        item.mesh.visible = false;
      }
    }
    for (const id of seals) {
      const dyn = this.world.dynamic.find((d) => d.type === 'seal' && d.id === id);
      if (dyn) {
        dyn.ring.visible = false;
        dyn.mesh.material.color.set('#555064');
      }
    }
    for (const item of this.world.getInteractables()) {
      if (item.type === 'seal' && seals.has(item.id)) item.activated = true;
    }
  }

  placePlayer(x, z) {
    const bounds = REGIONS[this.state.region]?.bounds || 90;
    const px = clamp(x, -bounds, bounds);
    const pz = clamp(z, -bounds, bounds);
    const y = this.world ? this.world.heightAt(px, pz) + FOOT_OFFSET : 0;
    this.player.group.position.set(px, y, pz);
    this.state.lastPosition = { x: px, z: pz };
  }

  /* ------------------------------------------------------------------ */
  /* Stats, cooldowns, equipment                                         */
  /* ------------------------------------------------------------------ */

  getStats() {
    const p = this.state.player;
    const base = p.stats || {};
    const weapon = WEAPONS[p.weapon] || WEAPONS.filo_aurora;
    const armor = ARMORS[p.armor] || ARMORS.tunica_viajero;
    const charm = p.charm ? CHARMS[p.charm] : null;
    const skills = this.state.skills || {};
    const active = this.state.creatures.find((c) => c.active);
    const passive = active ? (CREATURES[active.id]?.passiveEffect || {}) : {};
    const level = Math.max(1, p.level || 1);
    const lv = level - 1;

    const maxHp = Math.round(80 + (base.vitalidad || 0) * 8 + armor.hp + lv * 5 + (skills.corazon_lumen || 0) * 18 + (passive.hp || 0));
    const maxMp = Math.round(40 + (base.resonancia || 0) * 6 + (armor.mp || 0) + (charm?.mp || 0) + lv * 2 + (skills.resonancia_profunda || 0) * 18 + (passive.mp || 0));
    const maxSp = Math.round(60 + (base.resistencia || 0) * 5 + lv * 2);
    const attack = Math.round((8 + (base.fuerza || 0) * 2.2 + weapon.atk + (this.state.upgrades.weapon || 0) * 2 + lv * 0.9) * (1 + (skills.filo_aurora || 0) * 0.06 + (passive.attackPct || 0)));
    const defense = Math.round((3 + (base.defensa || 0) * 1.6 + (base.resistencia || 0) * 0.5 + armor.def + (this.state.upgrades.armor || 0) + lv * 0.7) * (1 + (passive.defensePct || 0)));
    const crit = clamp(0.03 + (base.suerte || 0) * 0.008 + (weapon.crit || 0) + (skills.instinto || 0) * 0.04 + (passive.crit || 0), 0, 0.75);
    const speed = 6.1 * (1 + (base.velocidad || 0) * 0.015 + (skills.velo_ligero || 0) * 0.06 + (passive.speedPct || 0) + (this.speedBuff || 0));
    const spellPower = Math.round((12 + (base.inteligencia || 0) * 2 + lv * 1.2) * (1 + (skills.resonancia_profunda || 0) * 0.08 + (passive.spellPct || 0) + (charm?.spell || 0)));
    const capture = clamp(0.18 + (base.suerte || 0) * 0.012 + (charm?.capture || 0) + (skills.eco_afin || 0) * 0.1 + (passive.capture || 0), 0.08, 0.95);
    const dodgeCost = Math.max(6, 16 * (1 - (skills.velo_ligero || 0) * 0.08));

    return {
      stats: { ...base },
      maxHp, maxMp, maxSp, attack, defense, crit, speed, spellPower, capture, dodgeCost,
      parry: 0.2 + (skills.guardia_alba || 0) * 0.06,
      comboBonus: 1 + (skills.torrente || 0) * 0.07,
      weapon, armor, charm, level,
    };
  }

  getCooldowns() {
    return {
      spell: this.cooldowns.spell,
      spellMax: this.cooldowns.spellMax,
      creature: this.cooldowns.creature,
      creatureMax: this.cooldowns.creatureMax,
      ultimate: this.cooldowns.ultimate,
      ultimateMax: this.cooldowns.ultimateMax,
    };
  }

  hasUltimate() {
    return (this.state.skills.juicio || 0) > 0;
  }

  equip(type, id) {
    const p = this.state.player;
    if (type === 'weapon' && this.state.ownedWeapons.includes(id) && WEAPONS[id]) {
      p.weapon = id;
    } else if (type === 'armor' && this.state.ownedArmors.includes(id) && ARMORS[id]) {
      p.armor = id;
    } else if (type === 'charm' && this.state.ownedCharms.includes(id) && CHARMS[id]) {
      p.charm = id;
    } else {
      return;
    }
    this.rebuildPlayer();
    this.audio.play('ui');
    this.save();
    this.ui.toast('Equipamiento actualizado', `${(WEAPONS[id] || ARMORS[id] || CHARMS[id])?.name || id}`, 'quest');
  }

  upgradeCost(type) {
    const level = this.state.upgrades[type] || 0;
    return [2, 4, 7][level] ?? 0;
  }

  upgrade(type) {
    if (type !== 'weapon' && type !== 'armor') return;
    const level = this.state.upgrades[type] || 0;
    if (level >= 3) {
      this.ui.toast('Forja completa', 'Este equipo ya alcanzó su forma máxima.', 'error');
      return;
    }
    const cost = this.upgradeCost(type);
    if ((this.state.inventory.fragmentos || 0) < cost) {
      this.ui.toast('Fragmentos insuficientes', `Necesitas ${cost} fragmentos de cielo.`, 'error');
      return;
    }
    this.state.inventory.fragmentos -= cost;
    this.state.upgrades[type] = level + 1;
    this.audio.play('chest');
    this.ui.toast('Forjado', `${type === 'weapon' ? 'Arma' : 'Armadura'} mejorada a Nv. ${level + 1}.`, 'level');
    this.save();
  }

  learnSkill(id) {
    const skill = SKILLS.find((s) => s.id === id);
    const p = this.state.player;
    if (!skill || p.skillPoints <= 0) return;
    const rank = this.state.skills[id] || 0;
    if (rank >= skill.max) return;
    this.state.skills[id] = rank + 1;
    p.skillPoints -= 1;
    this.audio.play('levelup');
    this.ui.toast('Habilidad despertada', `${skill.name} · rango ${rank + 1}`, 'level');
    this.save();
  }

  setActiveCreature(id) {
    const owned = this.state.creatures.find((c) => c.id === id);
    if (!owned) return;
    for (const c of this.state.creatures) c.active = c.id === id;
    this.spawnCompanion();
    this.audio.play('capture');
    this.ui.toast('Eco invocado', `${CREATURES[id]?.name || id} te acompaña.`, 'capture');
    this.save();
  }

  /* ------------------------------------------------------------------ */
  /* Companion                                                           */
  /* ------------------------------------------------------------------ */

  spawnCompanion() {
    if (this.companion?.group && this.scene) this.scene.remove(this.companion.group);
    this.companion = null;
    const active = this.state.creatures.find((c) => c.active);
    if (!active || !this.scene) return;
    const species = CREATURES[active.id];
    if (!species) return;
    const model = buildCreature(species);
    const p = this.player.group.position;
    model.group.position.set(p.x + 1.4, p.y + 0.15, p.z + 1.1);
    model.group.scale.multiplyScalar(0.86);
    this.scene.add(model.group);
    this.companion = { id: active.id, model, group: model.group, phase: Math.random() * TAU, skillTimer: 0 };
  }

  updateCompanion(dt, idle = false) {
    if (!this.companion) return;
    const c = this.companion;
    const p = this.player.group.position;
    const angle = this.time * 0.55 + c.phase;
    const targetX = p.x + Math.cos(angle) * 1.7;
    const targetZ = p.z + Math.sin(angle) * 1.7;
    c.group.position.x = damp(c.group.position.x, targetX, 4, dt);
    c.group.position.z = damp(c.group.position.z, targetZ, 4, dt);
    const ground = this.world.heightAt(c.group.position.x, c.group.position.z) + 0.1;
    c.group.position.y = damp(c.group.position.y, ground + 0.16, 6, dt);
    c.group.rotation.y = dampAngle(c.group.rotation.y, Math.atan2(p.x - c.group.position.x, p.z - c.group.position.z), 5, dt);
    updateCreatureModel(c.model, dt, this.time, { hover: true, moving: !idle && this.player.moving > 0.1 });
  }

  /* ------------------------------------------------------------------ */
  /* Input & player movement                                             */
  /* ------------------------------------------------------------------ */

  setKey(code, down) {
    if (down) this.keys.add(code);
    else this.keys.delete(code);
  }

  inputVector() {
    let x = 0;
    let z = 0;
    const j = this.ui.joystick;
    if (j.active && Math.hypot(j.x, j.y) > 0.12) {
      x += j.x;
      z += j.y;
    }
    if (this.keys.has('KeyA') || this.keys.has('ArrowLeft')) x -= 1;
    if (this.keys.has('KeyD') || this.keys.has('ArrowRight')) x += 1;
    if (this.keys.has('KeyW') || this.keys.has('ArrowUp')) z -= 1;
    if (this.keys.has('KeyS') || this.keys.has('ArrowDown')) z += 1;
    const len = Math.hypot(x, z);
    if (len > 1) {
      x /= len;
      z /= len;
    }
    return { x, z, len: Math.min(1, len), sprint: this.keys.has('ShiftLeft') || this.keys.has('ShiftRight') };
  }

  updatePlayer(dt) {
    const p = this.state.player;
    const stats = this.getStats();
    const model = this.player.model;
    if (!model) return;
    const pose = model.pose;

    p.hp = clamp(p.hp, 0, stats.maxHp);
    p.mp = clamp(p.mp, 0, stats.maxMp);
    p.sp = clamp(p.sp, 0, stats.maxSp);

    if (this.player.dead) {
      pose.dead = true;
      updatePlayerModel(model, dt, this.time);
      return;
    }

    // Regen
    const regenMp = (0.9 + (stats.charm?.regen || 0)) * (this.player.blocking ? 0.4 : 1);
    p.mp = clamp(p.mp + regenMp * dt, 0, stats.maxMp);
    p.sp = clamp(p.sp + (this.player.blocking ? 4 : 9) * dt, 0, stats.maxSp);

    // Timers
    this.iframe = Math.max(0, this.iframe - dt);
    this.hurtTimer = Math.max(0, this.hurtTimer - dt);
    this.attackCooldown = Math.max(0, this.attackCooldown - dt);
    this.comboTimer = Math.max(0, this.comboTimer - dt);
    if (this.comboTimer <= 0 && this.comboDisplay > 0) {
      this.comboDisplay = 0;
      this.comboChain = 0;
      this.ui.showCombo(0);
    }
    if (this.speedBuffTimer > 0) {
      this.speedBuffTimer -= dt;
      if (this.speedBuffTimer <= 0) this.speedBuff = 0;
    }
    for (const key of Object.keys(this.cooldowns)) {
      if (key.endsWith('Max')) continue;
      this.cooldowns[key] = Math.max(0, this.cooldowns[key] - dt);
    }

    const input = this.inputVector();
    this.player.moving = input.len;
    const attacking = !!this.attack;
    const casting = !!this.cast;
    const dodging = !!this.dodge;

    if (this.dodge) {
      this.dodge.time += dt;
      const q = clamp(this.dodge.time / this.dodge.duration, 0, 1);
      pose.dodging = true;
      pose.dodgeProgress = q;
      const speed = stats.speed * 3.1 * (1 - q * 0.35);
      this.tryMovePlayer(this.dodge.dirX * speed * dt, this.dodge.dirZ * speed * dt);
      if (this.dodge.time >= this.dodge.duration) {
        this.dodge = null;
        pose.dodging = false;
      }
    } else {
      pose.dodging = false;
      const blockingSlow = this.player.blocking ? 0.42 : 1;
      const actionSlow = attacking ? 0.22 : casting ? 0 : 1;
      const sprint = input.sprint && input.len > 0.1 && p.sp > 2 && !attacking && !casting && !this.player.blocking;
      if (sprint) p.sp = Math.max(0, p.sp - 11 * dt);
      const speed = stats.speed * blockingSlow * actionSlow * (sprint ? 1.34 : 1);
      if (input.len > 0.08) {
        const len = Math.hypot(input.x, input.z) || 1;
        const dx = input.x / len;
        const dz = input.z / len;
        this.tryMovePlayer(dx * speed * input.len * dt, dz * speed * input.len * dt);
        const targetAngle = Math.atan2(dx, dz);
        if (!attacking && !casting && !this.player.blocking) {
          this.player.group.rotation.y = dampAngle(this.player.group.rotation.y, targetAngle, 12, dt);
        }
        pose.moving = input.len;
        pose.sprinting = sprint;
        this.footstepTimer -= dt;
        if (this.footstepTimer <= 0) {
          this.footstepTimer = sprint ? 0.24 : 0.36;
          this.audio.play('footstep');
        }
      } else {
        pose.moving = 0;
        pose.sprinting = false;
      }
    }

    // Attack lifecycle
    if (this.attack) {
      this.attack.time += dt;
      pose.attacking = true;
      pose.attackType = this.attack.type;
      pose.attackProgress = clamp(this.attack.time / this.attack.duration, 0, 1);
      pose.combo = this.attack.combo;
      if (!this.attack.hitDone && this.attack.time >= this.attack.hitAt) {
        this.attack.hitDone = true;
        this.performAttackHit(this.attack);
      }
      if (this.attack.time >= this.attack.duration) {
        this.attack = null;
        pose.attacking = false;
        if (this.queuedAttack) {
          const next = this.queuedAttack;
          this.queuedAttack = null;
          this.startAttack(next);
        }
      }
    } else {
      pose.attacking = false;
    }

    // Cast lifecycle
    if (this.cast) {
      this.cast.time += dt;
      pose.casting = true;
      pose.castProgress = clamp(this.cast.time / this.cast.duration, 0, 1);
      if (this.cast.time >= this.cast.duration) {
        const cast = this.cast;
        this.cast = null;
        pose.casting = false;
        cast.execute?.();
      }
    } else {
      pose.casting = false;
    }

    pose.blocking = this.player.blocking && !this.attack && !this.dodge && !this.cast;
    pose.hurt = this.hurtTimer;
    pose.dead = false;

    // Ground snap
    const ground = this.world.heightAt(this.player.group.position.x, this.player.group.position.z);
    this.player.group.position.y = damp(this.player.group.position.y, ground + FOOT_OFFSET, 18, dt);
    this.state.lastPosition = { x: this.player.group.position.x, z: this.player.group.position.z };

    updatePlayerModel(model, dt, this.time);
  }

  tryMovePlayer(dx, dz) {
    const pos = this.player.group.position;
    const bounds = REGIONS[this.state.region]?.bounds || 90;
    const nx = clamp(pos.x + dx, -bounds, bounds);
    if (!this.collides(nx, pos.z, 0.42)) pos.x = nx;
    const nz = clamp(pos.z + dz, -bounds, bounds);
    if (!this.collides(pos.x, nz, 0.42)) pos.z = nz;
  }

  collides(x, z, radius = 0.42) {
    if (!this.world) return false;
    for (const c of this.world.colliders) {
      const rr = c.r + radius;
      if ((x - c.x) * (x - c.x) + (z - c.z) * (z - c.z) < rr * rr) return true;
    }
    return false;
  }

  /* ------------------------------------------------------------------ */
  /* Actions                                                             */
  /* ------------------------------------------------------------------ */

  action(type) {
    if (this.frozen || this.player.dead) return;
    const stats = this.getStats();
    switch (type) {
      case 'attack':
        this.startAttack('light');
        break;
      case 'heavy':
        if (this.state.player.sp < 18) {
          this.ui.toast('Sin aguante', 'Necesitas 18 de aguante para el golpe pesado.', 'error');
          return;
        }
        this.state.player.sp -= 18;
        this.startAttack('heavy');
        break;
      case 'dodge':
        this.startDodge(stats);
        break;
      case 'block':
        this.setBlocking(true);
        break;
      case 'spell':
        this.castSpell(stats);
        break;
      case 'creature':
        this.castCreatureSkill();
        break;
      case 'ultimate':
        this.castUltimate(stats);
        break;
      case 'potion':
        this.usePotion(stats);
        break;
      default:
        break;
    }
  }

  setBlocking(value) {
    if (this.player.dead) value = false;
    if (value && !this.player.blocking) this.blockStart = this.time;
    this.player.blocking = !!value;
  }

  startAttack(type = 'light') {
    if (this.frozen || this.player.dead) return;
    if (this.cast || this.dodge) return;
    if (this.attack) {
      if (this.attack.time > this.attack.duration * 0.42) this.queuedAttack = type;
      return;
    }
    if (this.attackCooldown > 0) return;
    this.player.blocking = false;
    const stats = this.getStats();
    const weaponSpeed = stats.weapon.speed || 1;
    const duration = (type === 'heavy' ? 0.84 : 0.46) / weaponSpeed;
    const combo = this.comboChain % 3;
    this.comboChain = (this.comboChain + 1) % 3;
    this.attack = {
      type,
      time: 0,
      duration,
      hitAt: duration * 0.42,
      hitDone: false,
      combo,
      range: type === 'heavy' ? 4.2 : 3.4,
    };
    this.attackCooldown = duration * 0.62;
    // Soft auto-targeting keeps mobile combat readable.
    if (this.ui.settings.autoTarget !== false) {
      const target = this.nearestEnemy(type === 'heavy' ? 6 : 5);
      if (target) {
        const dx = target.group.position.x - this.player.group.position.x;
        const dz = target.group.position.z - this.player.group.position.z;
        this.player.group.rotation.y = Math.atan2(dx, dz);
      }
    }
    this.audio.play(type === 'heavy' ? 'heavy' : 'swing');
  }

  performAttackHit(attack) {
    const stats = this.getStats();
    const origin = this.player.group.position;
    const facing = this.player.group.rotation.y;
    const fx = Math.sin(facing);
    const fz = Math.cos(facing);
    let hits = 0;
    for (const e of this.enemies) {
      if (e.dead || !e.active) continue;
      const dx = e.group.position.x - origin.x;
      const dz = e.group.position.z - origin.z;
      const d = Math.hypot(dx, dz);
      if (d > attack.range + e.radius) continue;
      const dot = (dx * fx + dz * fz) / (d || 1);
      if (dot < (d < 1.8 ? -1 : -0.15)) continue;
      let dmg = stats.attack * (attack.type === 'heavy' ? 1.75 : 1);
      if (attack.combo === 2) dmg *= 1.25 * stats.comboBonus;
      dmg *= rand(0.92, 1.08);
      const crit = Math.random() < stats.crit;
      if (crit) dmg *= 1.8;
      this.damageEnemy(e, dmg, { crit, heavy: attack.type === 'heavy' });
      hits++;
    }
    const color = attack.type === 'heavy' ? '#ffb347' : '#bfe9ff';
    this.spawnSlash(origin, facing, attack.type === 'heavy' ? 2.6 : 1.9, color);
    if (hits > 0) {
      this.audio.play('hit');
      this.shake = Math.min(1, this.shake + (attack.type === 'heavy' ? 0.4 : 0.16));
      this.comboDisplay += hits;
      this.comboTimer = 2;
      this.ui.showCombo(this.comboDisplay);
    }
  }

  startDodge(stats) {
    if (this.frozen || this.player.dead || this.dodge || this.cast) return;
    if (this.state.player.sp < stats.dodgeCost) {
      this.ui.toast('Sin aguante', 'No puedes esquivar todavía.', 'error');
      return;
    }
    this.state.player.sp -= stats.dodgeCost;
    const input = this.inputVector();
    let dx = input.x;
    let dz = input.z;
    if (input.len < 0.1) {
      dx = Math.sin(this.player.group.rotation.y);
      dz = Math.cos(this.player.group.rotation.y);
    }
    const len = Math.hypot(dx, dz) || 1;
    this.attack = null;
    this.queuedAttack = null;
    this.player.blocking = false;
    this.dodge = { time: 0, duration: 0.36, dirX: dx / len, dirZ: dz / len };
    this.iframe = 0.28 + (stats.charm?.iframes || 0);
    this.audio.play('dodge');
  }

  castSpell(stats) {
    if (this.frozen || this.player.dead || this.cast || this.attack || this.dodge) return;
    if (this.cooldowns.spell > 0) return;
    if (this.state.player.mp < 22) {
      this.ui.toast('Resonancia insuficiente', 'Necesitas 22 de maná.', 'error');
      return;
    }
    this.state.player.mp -= 22;
    this.cooldowns.spell = this.cooldowns.spellMax;
    this.player.blocking = false;
    this.audio.play('spell');
    this.cast = {
      time: 0,
      duration: 0.44,
      execute: () => {
        const origin = this.player.group.position.clone();
        this.spawnRing(origin, '#7ee8fa', 8, 0.65);
        this.spawnPillar(origin, '#7ee8fa', 1.0, 0.9);
        this.shake = Math.min(1, this.shake + 0.3);
        for (const e of this.enemies) {
          if (e.dead || !e.active) continue;
          const d = dist2(e.group.position, origin);
          if (d < 8.2) {
            this.damageEnemy(e, stats.spellPower * rand(0.92, 1.08), { spell: true });
            e.status.stun = Math.max(e.status.stun, 0.8);
            e.aggro = true;
          }
        }
      },
    };
  }

  castCreatureSkill() {
    if (this.frozen || this.player.dead || this.cast || this.dodge) return;
    const active = this.state.creatures.find((c) => c.active);
    if (!active) {
      this.ui.toast('Sin eco activo', 'Abre el diario y elige un eco que te acompañe.', 'error');
      return;
    }
    if (this.cooldowns.creature > 0) return;
    const species = CREATURES[active.id];
    if (!species) return;
    this.cooldowns.creature = species.skill.cooldown;
    this.cooldowns.creatureMax = species.skill.cooldown;
    this.player.blocking = false;
    this.audio.play('capture');
    this.cast = {
      time: 0,
      duration: 0.35,
      execute: () => this.executeCreatureSkill(species, active),
    };
  }

  executeCreatureSkill(species, active) {
    const origin = this.player.group.position.clone();
    const stats = this.getStats();
    const power = species.skill.power * (1 + (active.level - 1) * 0.08) * (1 + (stats.spellPower / 100));
    const effect = species.skill.effect;
    const color = species.colors.accent;
    this.spawnRing(origin, color, effect === 'judgment' ? 11 : 6.5, 0.7);
    this.audio.play('spell');
    const nearby = this.enemies.filter((e) => !e.dead && e.active && dist2(e.group.position, origin) < (effect === 'judgment' ? 13 : 7.5));
    if (effect === 'heal') {
      this.state.player.hp = clamp(this.state.player.hp + stats.maxHp * 0.25, 0, stats.maxHp);
      this.spawnPillar(origin, color, 0.7, 0.7);
    } else if (effect === 'shield') {
      this.shield = Math.max(this.shield, power * 1.6);
      this.spawnPillar(origin, color, 0.8, 0.6);
    } else if (effect === 'haste') {
      this.speedBuff = 0.28;
      this.speedBuffTimer = 4;
      this.spawnPillar(origin, color, 0.6, 0.6);
    }
    for (const e of nearby) {
      if (effect !== 'heal' && effect !== 'shield' && effect !== 'haste') this.damageEnemy(e, power, { spell: true });
      if (effect === 'blind') e.status.stun = Math.max(e.status.stun, 1.5);
      if (effect === 'root') e.status.root = Math.max(e.status.root, 1.4);
      if (effect === 'burn') e.status.burn = Math.max(e.status.burn, 3);
      if (effect === 'weaken') e.status.weaken = Math.max(e.status.weaken, 5);
      if (effect === 'slow') e.status.slow = Math.max(e.status.slow, 4);
      e.aggro = true;
    }
    if (effect === 'judgment') this.shake = Math.min(1, this.shake + 0.55);
    this.ui.toast(species.skill.name, `${species.name} responde a tu llamada.`, 'capture');
  }

  castUltimate(stats) {
    if (this.frozen || this.player.dead || this.cast || this.dodge) return;
    if (!this.hasUltimate()) {
      this.ui.toast('Juicio no desbloqueado', 'Aprende la habilidad Juicio Celestial.', 'error');
      return;
    }
    if (this.cooldowns.ultimate > 0) return;
    if (this.state.player.mp < 50) {
      this.ui.toast('Resonancia insuficiente', 'El Juicio requiere 50 de maná.', 'error');
      return;
    }
    this.state.player.mp -= 50;
    this.cooldowns.ultimate = this.cooldowns.ultimateMax;
    this.player.blocking = false;
    this.audio.play('ultimate');
    this.cast = {
      time: 0,
      duration: 0.9,
      execute: () => {
        const origin = this.player.group.position.clone();
        this.spawnPillar(origin, '#fff0a8', 5, 1.5);
        this.spawnRing(origin, '#fff0a8', 16, 1.0);
        this.spawnRing(origin, '#7ee8fa', 11, 0.8);
        this.shake = Math.min(1, this.shake + 0.8);
        for (const e of this.enemies) {
          if (e.dead || !e.active) continue;
          const d = dist2(e.group.position, origin);
          if (d < 16) {
            this.damageEnemy(e, stats.spellPower * 2.6 * rand(0.94, 1.06), { spell: true, crit: true });
            e.status.stun = Math.max(e.status.stun, 1.2);
          }
        }
        this.state.player.hp = clamp(this.state.player.hp + stats.maxHp * 0.25, 0, stats.maxHp);
        this.ui.toast('Juicio Celestial', 'La luz atraviesa el Velo.', 'level');
      },
    };
  }

  usePotion(stats) {
    if (this.frozen || this.player.dead || this.cooldowns.potion > 0) return;
    const count = this.state.inventory.pocion_luz || 0;
    if (count <= 0) {
      this.ui.toast('Sin pociones', 'Encuentra Pociones de Luz en cofres y misiones.', 'error');
      return;
    }
    if (this.state.player.hp >= stats.maxHp) return;
    this.state.inventory.pocion_luz = count - 1;
    this.state.player.hp = clamp(this.state.player.hp + stats.maxHp * 0.45, 0, stats.maxHp);
    this.cooldowns.potion = 1;
    this.audio.play('potion');
    this.spawnPillar(this.player.group.position, '#ffd58a', 0.55, 0.5);
  }

  /* ------------------------------------------------------------------ */
  /* Damage                                                              */
  /* ------------------------------------------------------------------ */

  receiveDamage(raw, source = null) {
    if (this.player.dead || this.iframe > 0 || this.frozen) return;
    const stats = this.getStats();
    let dmg = raw * this.difficulty.dmg;
    let parried = false;

    if (this.player.blocking) {
      const perfect = this.time - this.blockStart <= stats.parry && this.state.player.sp > 4;
      if (perfect) {
        this.state.player.sp -= 4;
        parried = true;
        this.audio.play('parry');
        this.spawnRing(this.player.group.position, '#fff0a8', 3.2, 0.45);
        this.shake = Math.min(1, this.shake + 0.3);
        if (source && !source.dead) source.status.stun = Math.max(source.status.stun, 1.3);
      } else {
        dmg *= 0.28;
        this.state.player.sp = Math.max(0, this.state.player.sp - 9);
        this.audio.play('block');
        this.spawnRing(this.player.group.position, '#7ee8fa', 2.2, 0.3);
      }
    }

    if (parried) return;

    if (this.shield > 0) {
      const absorbed = Math.min(this.shield, dmg);
      this.shield -= absorbed;
      dmg -= absorbed;
      if (this.shield <= 0) this.ui.toast('Coraza rota', 'El escudo de tu eco se ha disipado.', 'error');
    }

    const reduction = stats.defense / (stats.defense + 70);
    dmg = Math.max(1, Math.round(dmg * (1 - reduction)));
    this.state.player.hp = Math.max(0, this.state.player.hp - dmg);
    this.hurtTimer = 0.3;
    this.iframe = 0.35;
    this.audio.play('hit');
    this.shake = Math.min(1, this.shake + 0.42);
    this.ui.spawnDamage(this.screenPosition(this.player.group.position.clone().add(vec3(0, 1.6, 0))), `-${dmg}`, 'player');
    if (this.state.player.hp <= 0) this.die();
  }

  damageEnemy(enemy, amount, opts = {}) {
    if (!enemy || enemy.dead) return;
    const weaken = enemy.status.weaken > 0 ? 1.25 : 1;
    const reduction = enemy.defStat / (enemy.defStat + 45);
    let dmg = Math.max(1, Math.round(amount * (1 - reduction) * weaken * rand(0.96, 1.04)));
    if (opts.crit) dmg = Math.round(dmg * 1.35);
    enemy.hp -= dmg;
    enemy.hurt = 0.24;
    enemy.aggro = true;
    if (opts.heavy) enemy.stagger = Math.max(enemy.stagger, 0.45);
    const pos = enemy.group.position.clone().add(vec3(0, (enemy.def.height || 2) * 0.75, 0));
    this.ui.spawnDamage(this.screenPosition(pos), `${opts.crit ? '✦' : ''}${dmg}`, opts.crit ? 'crit' : opts.spell ? 'spell' : '');
    if (opts.crit) this.audio.play('crit');
    if (enemy.hp <= 0) this.killEnemy(enemy);
  }

  die() {
    if (this.player.dead) return;
    this.player.dead = true;
    this.state.player.hp = 0;
    this.state.stats.deaths = (this.state.stats.deaths || 0) + 1;
    this.attack = null;
    this.cast = null;
    this.dodge = null;
    this.player.blocking = false;
    this.deathShown = false;
    this.deathTimer = 0;
    this.audio.play('death');
    this.audio.setTheme(this.state.region, false);
    this.ui.hideBoss();
  }

  /* ------------------------------------------------------------------ */
  /* Enemy death & progression                                           */
  /* ------------------------------------------------------------------ */

  killEnemy(enemy) {
    if (enemy.dead) return;
    enemy.dead = true;
    enemy.deadProgress = 0;
    enemy.deathTimer = 0;
    enemy.attacking = false;
    enemy.windup = 0;
    this.state.stats.kills = (this.state.stats.kills || 0) + 1;
    this.spawnRing(enemy.group.position, enemy.def.boss ? '#ffb347' : '#7ee8fa', enemy.def.boss ? 8 : 3.5, 0.8);
    this.audio.play(enemy.def.boss ? 'victory' : 'hit');

    const essence = enemy.def.essence || 1;
    this.state.inventory.esencia_eco = (this.state.inventory.esencia_eco || 0) + essence;
    if (enemy.def.boss || enemy.def.elite) {
      this.state.inventory.fragmentos = (this.state.inventory.fragmentos || 0) + (enemy.def.boss ? 4 : 2);
    }
    this.gainXp(enemy.def.xp * (1 + (enemy.level - 1) * 0.08));

    if (enemy.uid) this.state.defeated.push(enemy.uid);
    if (!enemy.spawn?.respawn) enemy.respawnTimer = -1;
    else enemy.respawnTimer = 9;

    // Quest / stage hooks.
    const id = enemy.def.id;
    const f = this.state.flags;
    if (id === 'sombra') {
      f.sombras = (f.sombras || 0) + 1;
      if (this.state.mainStage === 1) {
        this.bumpStageProgress(1, f.sombras, 3);
      }
    }
    if (id === 'guardia') {
      f.guardias = (f.guardias || 0) + 1;
      if (this.state.mainStage === 7) this.bumpStageProgress(7, f.guardias, 3);
    }
    if (id === 'centinela') {
      if (enemy.spawn?.seal) this.breakSeal(enemy.spawn.seal);
    }
    if (id === 'devorador') {
      f.devoradorDead = true;
      const q = this.state.sideQuests.deuda;
      if (q?.started && !q.done) {
        q.progress = 1;
        this.ui.toast('Devorador derrotado', 'Vuelve con Kael en el Campamento de Ceniza.', 'quest');
      }
    }
    if (id === 'guardian') this.onGuardianDeath();
    if (id === 'reina') this.onReinaDeath();
    if (id === 'vex') this.onVexDeath();

    if (enemy.def.boss) {
      this.ui.hideBoss();
      this.audio.setTheme(this.state.region, false);
      this.save();
    }
  }

  bumpStageProgress(stage, value, total) {
    this.state.stageProgress[stage] = Math.min(total, value);
    if (value >= total) this.advanceStage(stage + 1);
    else this.save();
    this.updateQuestMarker();
  }

  onGuardianDeath() {
    this.state.flags.guardianDead = true;
    this.grantArmor('coraza_valdoria');
    this.unlockRegion('drakmor');
    this.advanceStage(5);
  }

  onReinaDeath() {
    this.state.flags.reinaDead = true;
    this.grantArmor('manto_ceniza');
    this.grantWeapon('filo_draconico');
    this.unlockRegion('kansordore');
    this.advanceStage(9);
  }

  onVexDeath() {
    this.state.flags.vexDead = true;
    this.grantWeapon('espada_celestial');
    this.grantArmor('armadura_celestial');
    this.advanceStage(13);
  }

  gainXp(amount) {
    const p = this.state.player;
    p.xp += Math.round(amount);
    let leveled = false;
    while (p.xp >= p.xpNext) {
      p.xp -= p.xpNext;
      p.level += 1;
      p.skillPoints += 1;
      p.xpNext = xpForLevel(p.level);
      leveled = true;
    }
    if (leveled) {
      const stats = this.getStats();
      p.hp = stats.maxHp;
      p.mp = stats.maxMp;
      p.sp = stats.maxSp;
      this.audio.play('levelup');
      this.spawnPillar(this.player.group.position, '#fff0a8', 1.2, 1.2);
      this.ui.toast('Nivel ' + p.level, 'La Espada recuerda una forma nueva. +1 punto de habilidad.', 'level');
      this.save();
    }
  }

  /* ------------------------------------------------------------------ */
  /* Main update                                                         */
  /* ------------------------------------------------------------------ */

  update(dt) {
    this.time += dt;
    if (!this.world) return;
    this.world.update(dt);
    this.updateCamera(dt);

    if (this.frozen) {
      this.updateEffects(dt);
      this.updateCompanion(dt, true);
      if (this.player.dead) this.updateDeath(dt);
      return;
    }

    this.state.playTime = (this.state.playTime || 0) + dt;
    this.updatePlayer(dt);
    this.updateEnemies(dt);
    this.updateCreatures(dt);
    this.updateNPCs(dt);
    this.updateCompanion(dt);
    this.updateProjectiles(dt);
    this.updateTelegraphs(dt);
    this.updateEffects(dt);
    this.updateInteractions();
    this.updateQuestTriggers();
    this.updateBossBars();
    this.ui.updateHUD(this, dt);

    if (this.player.dead) this.updateDeath(dt);

    this.autoSaveTimer += dt;
    if (this.autoSaveTimer > 75) {
      this.autoSaveTimer = 0;
      this.save();
    }
  }

  updateDeath(dt) {
    if (this.deathShown) return;
    this.deathTimer += dt;
    if (this.deathTimer > 1.15) {
      this.deathShown = true;
      this.frozen = true;
      this.app.enterDeath();
    }
  }

  updateCamera(dt, snap = false) {
    if (!this.player.group) return;
    const pos = this.player.group.position;
    const input = this.inputVector();
    const desired = vec3(
      pos.x + input.x * 1.2,
      pos.y + 9.6,
      pos.z + 12.6 + input.z * 1.2,
    );
    const lambda = snap ? 100 : 5.2;
    if (snap) this.camera.position.copy(desired);
    else {
      this.camera.position.x = damp(this.camera.position.x, desired.x, lambda, dt);
      this.camera.position.y = damp(this.camera.position.y, desired.y, lambda, dt);
      this.camera.position.z = damp(this.camera.position.z, desired.z, lambda, dt);
    }
    this.shake = Math.max(0, this.shake - dt * 2.4);
    const sx = this.shake > 0 ? (Math.random() - 0.5) * this.shake * 0.55 : 0;
    const sy = this.shake > 0 ? (Math.random() - 0.5) * this.shake * 0.4 : 0;
    this.camera.lookAt(pos.x + sx, pos.y + 1.2 + sy, pos.z - 2.4);
  }

  /* ------------------------------------------------------------------ */
  /* Enemies                                                             */
  /* ------------------------------------------------------------------ */

  updateEnemies(dt) {
    for (const e of this.enemies) {
      if (e.dead) {
        e.deathTimer += dt;
        e.deadProgress = Math.min(1, e.deadProgress + dt * 1.8);
        updateEnemyModel(e.model, dt, this.time, {
          dead: true, deadProgress: e.deadProgress, showHp: false, hp: 0, maxHp: e.maxHp, boss: e.def.boss,
        });
        if (e.respawnTimer > 0) {
          e.respawnTimer -= dt;
          if (e.respawnTimer <= 0) this.respawnEnemy(e);
        } else if (e.respawnTimer < 0 && e.deathTimer > 5) {
          e.group.visible = false;
        }
        continue;
      }
      if (!e.active) {
        this.updateBossIntro(e);
        updateEnemyModel(e.model, dt, this.time, { moveAmount: 0, showHp: false, hp: e.hp, maxHp: e.maxHp, boss: true });
        continue;
      }
      this.updateEnemyAI(e, dt);
      this.updateEnemyModel(e, dt);
    }
  }

  updateEnemyModel(e, dt) {
    const near = dist2(e.group.position, this.player.group.position) < 22;
    e.hurt = Math.max(0, e.hurt - dt);
    e.stagger = Math.max(0, e.stagger - dt);
    updateEnemyModel(e.model, dt, this.time, {
      moveAmount: e.moveAmount,
      attacking: e.attacking,
      attackProgress: e.attackProgress,
      combo: 0,
      blocking: false,
      hurt: e.hurt,
      stagger: e.stagger,
      dead: false,
      deadProgress: 0,
      casting: false,
      castProgress: 0,
      showHp: near || e.hurt > 0,
      hp: e.hp,
      maxHp: e.maxHp,
      boss: e.def.boss,
      windup: e.windup > 0 ? 0.4 : 0,
    });
    e.model.hpBar.rotation.y = -e.group.rotation.y;
    const ground = this.world.heightAt(e.group.position.x, e.group.position.z);
    e.group.position.y = damp(e.group.position.y, ground, 12, dt);
    if (e.def.model === 'wisp') e.group.position.y += 0.05;
  }

  updateEnemyAI(e, dt) {
    const playerPos = this.player.group.position;
    const dx = playerPos.x - e.group.position.x;
    const dz = playerPos.z - e.group.position.z;
    const d = Math.hypot(dx, dz);
    const status = e.status;
    for (const key of ['stun', 'root', 'slow', 'weaken']) status[key] = Math.max(0, status[key] - dt);
    if (status.burn > 0) {
      status.burn -= dt;
      e.hp -= (e.def.boss ? 3 : 5) * dt;
      if (e.hp <= 0) {
        this.killEnemy(e);
        return;
      }
    }

    e.attackCooldown = Math.max(0, e.attackCooldown - dt);
    e.hurt = Math.max(0, e.hurt - dt);
    e.stagger = Math.max(0, e.stagger - dt);
    const aggroRange = e.def.boss ? 23 : 15;
    if (d < aggroRange) e.aggro = true;

    if (e.def.boss && e.hp <= e.maxHp * 0.5 && e.phase === 1) {
      e.phase = 2;
      e.speed *= 1.18;
      e.dmg *= 1.12;
      this.spawnRing(e.group.position, '#ff8a4a', 6, 0.9);
      this.ui.toast('FASE II', `${e.def.name} despierta su verdadera forma.`, 'error');
      this.shake = Math.min(1, this.shake + 0.5);
    }

    if (status.stun > 0) {
      e.moveAmount = 0;
      e.attacking = false;
      return;
    }

    if (!e.aggro) {
      e.moveAmount = 0;
      e.patrolTimer -= dt;
      if (e.patrolTimer <= 0) {
        e.patrolTimer = rand(2.5, 5.5);
        e.patrolAngle = Math.random() * TAU;
      }
      const hx = e.home.x - e.group.position.x;
      const hz = e.home.z - e.group.position.z;
      if (Math.hypot(hx, hz) > 1.5) {
        const len = Math.hypot(hx, hz) || 1;
        this.moveEnemy(e, (hx / len) * e.speed * 0.22 * dt, (hz / len) * e.speed * 0.22 * dt);
        e.moveAmount = 0.22;
      }
      e.group.rotation.y = dampAngle(e.group.rotation.y, Math.atan2(dx, dz), 4, dt);
      return;
    }

    if (d > 0.1) {
      const targetAngle = Math.atan2(dx, dz);
      e.group.rotation.y = dampAngle(e.group.rotation.y, targetAngle, e.def.boss ? 5 : 8, dt);
    }

    if (e.windup > 0) {
      e.windup -= dt;
      e.attacking = true;
      e.attackProgress = 1 - Math.max(0, e.windup) / (e.def.attackTime || 0.6);
      e.moveAmount = 0;
      if (e.windup <= 0) {
        e.attacking = false;
        this.enemyStrike(e, d);
      }
      return;
    }

    if (e.def.boss) {
      e.specialTimer -= dt;
      if (e.specialTimer <= 0 && d < 24) {
        e.specialTimer = rand(6, 9);
        this.bossSpecial(e);
      }
    }

    if (d <= e.range + 0.4 && e.attackCooldown <= 0) {
      e.windup = e.def.attackTime || 0.6;
      e.attackCooldown = (e.def.cooldown || 1.7) * rand(0.9, 1.15);
      e.attacking = true;
      e.attackProgress = 0;
      e.moveAmount = 0;
      if (e.def.ranged) this.spawnEnemyProjectile(e);
      return;
    }

    if (d > e.range * 0.82 && status.root <= 0) {
      const slow = status.slow > 0 ? 0.5 : 1;
      const speed = e.speed * slow;
      const nx = (dx / (d || 1)) * speed * dt;
      const nz = (dz / (d || 1)) * speed * dt;
      this.moveEnemy(e, nx, nz);
      e.moveAmount = 1;
    } else {
      e.moveAmount = 0;
    }
  }

  moveEnemy(e, dx, dz) {
    const pos = e.group.position;
    const bounds = REGIONS[this.state.region]?.bounds || 90;
    const nx = clamp(pos.x + dx, -bounds, bounds);
    const nz = clamp(pos.z + dz, -bounds, bounds);
    if (!this.collides(nx, pos.z, e.radius * 0.7)) pos.x = nx;
    if (!this.collides(pos.x, nz, e.radius * 0.7)) pos.z = nz;
  }

  enemyStrike(e, d) {
    const stats = this.getStats();
    if (e.def.ranged) {
      this.spawnEnemyProjectile(e);
      e.attackCooldown = (e.def.cooldown || 2) * 1.1;
      return;
    }
    if (d <= e.range + 0.9) {
      this.receiveDamage(e.dmg * rand(0.9, 1.12), e);
      const facing = e.group.rotation.y;
      this.spawnSlash(e.group.position, facing, 1.7, e.def.boss ? '#ff8a4a' : '#ff7a6b');
    }
    e.attackCooldown = (e.def.cooldown || 1.7) * rand(0.9, 1.2);
  }

  spawnEnemyProjectile(e) {
    const origin = e.group.position.clone().add(vec3(0, e.def.height * 0.55, 0));
    const target = this.player.group.position.clone().add(vec3(0, 1, 0));
    const dir = target.sub(origin).normalize();
    const color = e.def.model === 'sentinel' ? '#c6b7ff' : '#ff8a4a';
    const mesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.22, 8, 6),
      new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending }),
    );
    mesh.position.copy(origin);
    const glow = new THREE.Sprite(new THREE.SpriteMaterial({
      map: this.glowTexture(), color, transparent: true, opacity: 0.65, depthWrite: false, blending: THREE.AdditiveBlending,
    }));
    glow.scale.setScalar(1.4);
    mesh.add(glow);
    this.scene.add(mesh);
    this.projectiles.push({ mesh, pos: origin.clone(), vel: dir.multiplyScalar(9), life: 4, dmg: e.dmg * 0.9, color, radius: 0.65 });
  }

  bossSpecial(e) {
    const playerPos = this.player.group.position.clone();
    const bossPos = e.group.position.clone();
    if (e.type === 'guardian') {
      this.spawnTelegraph(playerPos, 4.2, 1.15, e.dmg * 1.25, '#9ef0ff');
      for (let i = 0; i < 4; i++) {
        const a = (i / 4) * TAU;
        this.spawnRing(bossPos.clone().add(vec3(Math.cos(a) * 3, 0, Math.sin(a) * 3)), '#9ef0ff', 3, 0.7);
      }
      this.ui.toast('El Guardián invoca', 'La piedra recuerda su juramento.', 'error');
    } else if (e.type === 'reina') {
      this.spawnTelegraph(playerPos, 4.6, 1.05, e.dmg * 1.35, '#ff6b3d');
      for (let i = 0; i < 7; i++) {
        const a = (i / 7) * TAU;
        const origin = bossPos.clone().add(vec3(0, 2, 0));
        const dir = vec3(Math.cos(a), 0.15, Math.sin(a)).normalize();
        const mesh = new THREE.Mesh(
          new THREE.SphereGeometry(0.24, 8, 6),
          new THREE.MeshBasicMaterial({ color: '#ff6b3d', transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending }),
        );
        mesh.position.copy(origin);
        this.scene.add(mesh);
        this.projectiles.push({ mesh, pos: origin.clone(), vel: dir.multiplyScalar(7), life: 4.2, dmg: e.dmg * 0.75, color: '#ff6b3d', radius: 0.65 });
      }
      this.ui.toast('La Reina arde', 'La ceniza no distingue amigos.', 'error');
    } else if (e.type === 'vex') {
      const angle = Math.random() * TAU;
      const tx = clamp(playerPos.x + Math.cos(angle) * 5, -80, 80);
      const tz = clamp(playerPos.z + Math.sin(angle) * 5, -80, 80);
      this.spawnRing(bossPos, '#c6b7ff', 4, 0.6);
      e.group.position.set(tx, this.world.heightAt(tx, tz), tz);
      this.spawnRing(e.group.position, '#ffd166', 4, 0.6);
      for (let i = 0; i < 3; i++) {
        const p = playerPos.clone().add(vec3(rand(-4, 4), 0, rand(-4, 4)));
        this.spawnTelegraph(p, 2.6, 1.3 + i * 0.25, e.dmg * 0.95, '#ffd166');
      }
      this.ui.toast('Vex se desplaza', 'El Velo no tiene una sola puerta.', 'error');
    }
    this.audio.play('heavy');
  }

  updateBossIntro(e) {
    if (e.introPlayed || this.frozen) return;
    const d = dist2(e.group.position, this.player.group.position);
    if (d > 14) return;
    e.introPlayed = true;
    this.frozen = true;
    this.audio.setTheme(this.state.region, true);
    const data = bossIntro(e.type);
    this.ui.showDialogue({
      ...data,
      onEnd: () => {
        this.frozen = false;
        e.active = true;
        e.aggro = true;
        this.ui.showBoss(e.def.name, e.hp, e.maxHp, e.phase);
        this.audio.setTheme(this.state.region, true);
      },
    });
  }

  respawnEnemy(e) {
    e.dead = false;
    e.deadProgress = 0;
    e.deathTimer = 0;
    e.respawnTimer = 0;
    e.hp = e.maxHp;
    e.active = true;
    e.aggro = false;
    e.group.visible = true;
    e.group.position.set(e.home.x, this.world.heightAt(e.home.x, e.home.z), e.home.z);
    e.model.pose.dead = false;
    e.model.body.rotation.x = 0;
  }

  updateBossBars() {
    const boss = this.enemies.find((e) => e.def.boss && !e.dead && e.active && dist2(e.group.position, this.player.group.position) < 30);
    if (boss) this.ui.showBoss(boss.def.name, boss.hp, boss.maxHp, boss.phase);
    else this.ui.hideBoss();
  }

  /* ------------------------------------------------------------------ */
  /* Projectiles, telegraphs, effects                                    */
  /* ------------------------------------------------------------------ */

  glowTexture() {
    if (!this._glowTex) {
      const c = document.createElement('canvas');
      c.width = 64;
      c.height = 64;
      const ctx = c.getContext('2d');
      const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
      g.addColorStop(0, 'rgba(255,255,255,1)');
      g.addColorStop(0.3, 'rgba(255,255,255,.8)');
      g.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, 64, 64);
      this._glowTex = new THREE.CanvasTexture(c);
    }
    return this._glowTex;
  }

  updateProjectiles(dt) {
    const playerPos = this.player.group.position;
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const pr = this.projectiles[i];
      pr.life -= dt;
      pr.pos.addScaledVector(pr.vel, dt);
      pr.mesh.position.copy(pr.pos);
      const d = dist2(pr.pos, playerPos);
      if (d < pr.radius + 0.55 && Math.abs(pr.pos.y - (playerPos.y + 1)) < 2.2) {
        this.receiveDamage(pr.dmg);
        this.spawnRing(pr.pos, pr.color, 2, 0.35);
        this.removeProjectile(i);
        continue;
      }
      if (pr.life <= 0) this.removeProjectile(i);
    }
  }

  removeProjectile(index) {
    const pr = this.projectiles[index];
    if (!pr) return;
    this.scene.remove(pr.mesh);
    pr.mesh.geometry?.dispose();
    pr.mesh.material?.dispose();
    this.projectiles.splice(index, 1);
  }

  spawnTelegraph(pos, radius, delay, damage, color = '#ff7a6b') {
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(radius * 0.82, radius, 48),
      new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.5, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false }),
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.set(pos.x, this.world.heightAt(pos.x, pos.z) + 0.12, pos.z);
    this.scene.add(ring);
    this.telegraphs.push({ pos: { x: pos.x, z: pos.z }, radius, time: 0, delay, damage, color, ring });
  }

  updateTelegraphs(dt) {
    for (let i = this.telegraphs.length - 1; i >= 0; i--) {
      const t = this.telegraphs[i];
      t.time += dt;
      const q = clamp(t.time / t.delay, 0, 1);
      t.ring.material.opacity = 0.22 + q * 0.5;
      t.ring.scale.setScalar(0.85 + q * 0.15);
      if (t.time >= t.delay) {
        this.scene.remove(t.ring);
        t.ring.geometry.dispose();
        t.ring.material.dispose();
        this.spawnRing(vec3(t.pos.x, this.world.heightAt(t.pos.x, t.pos.z), t.pos.z), t.color, t.radius, 0.5);
        if (dist2(t.pos, this.player.group.position) < t.radius + 0.5) this.receiveDamage(t.damage);
        this.telegraphs.splice(i, 1);
      }
    }
  }

  spawnRing(pos, color, radius = 3, duration = 0.6) {
    const mesh = new THREE.Mesh(
      new THREE.RingGeometry(0.55, 0.72, 40),
      new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.8, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false }),
    );
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.set(pos.x, this.world.heightAt(pos.x, pos.z) + 0.14, pos.z);
    this.scene.add(mesh);
    this.effects.push({ mesh, time: 0, duration, radius, type: 'ring' });
  }

  spawnSlash(pos, facing, radius = 2, color = '#bfe9ff') {
    const geo = new THREE.RingGeometry(radius * 0.45, radius, 24, 1, -0.9, 1.8);
    const mesh = new THREE.Mesh(
      geo,
      new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.75, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false }),
    );
    mesh.rotation.x = -Math.PI / 2;
    mesh.rotation.z = -facing + Math.PI / 2;
    mesh.position.set(pos.x, this.world.heightAt(pos.x, pos.z) + 1.0, pos.z);
    this.scene.add(mesh);
    this.effects.push({ mesh, time: 0, duration: 0.28, type: 'slash' });
  }

  spawnPillar(pos, color, radius = 1, duration = 0.8) {
    const mesh = new THREE.Mesh(
      new THREE.CylinderGeometry(radius * 0.55, radius, 14, 20, 1, true),
      new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.38, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false }),
    );
    mesh.position.set(pos.x, this.world.heightAt(pos.x, pos.z) + 7, pos.z);
    this.scene.add(mesh);
    this.effects.push({ mesh, time: 0, duration, type: 'pillar' });
  }

  updateEffects(dt) {
    for (let i = this.effects.length - 1; i >= 0; i--) {
      const fx = this.effects[i];
      fx.time += dt;
      const q = clamp(fx.time / fx.duration, 0, 1);
      if (fx.type === 'ring') {
        fx.mesh.scale.setScalar(0.5 + q * fx.radius * 1.25);
        fx.mesh.material.opacity = (1 - q) * 0.8;
      } else if (fx.type === 'slash') {
        fx.mesh.scale.setScalar(0.8 + q * 0.8);
        fx.mesh.material.opacity = (1 - q) * 0.8;
      } else if (fx.type === 'pillar') {
        fx.mesh.scale.y = 0.6 + q * 0.7;
        fx.mesh.material.opacity = (1 - q) * 0.4;
      }
      if (fx.time >= fx.duration) {
        this.scene.remove(fx.mesh);
        fx.mesh.geometry?.dispose();
        fx.mesh.material?.dispose();
        this.effects.splice(i, 1);
      }
    }
  }

  /* ------------------------------------------------------------------ */
  /* Creatures & NPCs                                                    */
  /* ------------------------------------------------------------------ */

  updateCreatures(dt) {
    for (const c of this.creatures) {
      if (c.captured) continue;
      const d = dist2(c.group.position, this.player.group.position);
      c.wanderTimer -= dt;
      if (d < 9) {
        c.group.rotation.y = dampAngle(c.group.rotation.y, Math.atan2(this.player.group.position.x - c.group.position.x, this.player.group.position.z - c.group.position.z), 5, dt);
      }
      if (c.wanderTimer <= 0) {
        c.wanderTimer = rand(2.5, 5);
        const a = Math.random() * TAU;
        const r = rand(1.5, 5);
        c.target = { x: c.home.x + Math.cos(a) * r, z: c.home.z + Math.sin(a) * r };
      }
      if (c.target) {
        const dx = c.target.x - c.group.position.x;
        const dz = c.target.z - c.group.position.z;
        const dist = Math.hypot(dx, dz);
        if (dist < 0.35) c.target = null;
        else {
          const speed = 1.1;
          const nx = c.group.position.x + (dx / dist) * speed * dt;
          const nz = c.group.position.z + (dz / dist) * speed * dt;
          if (!this.collides(nx, nz, 0.3)) {
            c.group.position.x = nx;
            c.group.position.z = nz;
          }
          c.group.rotation.y = dampAngle(c.group.rotation.y, Math.atan2(dx, dz), 6, dt);
          c.moving = true;
        }
      } else {
        c.moving = false;
      }
      c.group.position.y = damp(c.group.position.y, this.world.heightAt(c.group.position.x, c.group.position.z) + 0.08, 10, dt);
      const hover = ['bird', 'butterfly', 'seraph'].includes(c.species.model);
      updateCreatureModel(c.model, dt, this.time + c.phase, { hover, moving: c.moving });
    }
  }

  updateNPCs(dt) {
    for (const npc of this.npcs) {
      const d = dist2(npc.group.position, this.player.group.position);
      if (d < 7) {
        npc.group.rotation.y = dampAngle(npc.group.rotation.y, Math.atan2(this.player.group.position.x - npc.group.position.x, this.player.group.position.z - npc.group.position.z), 3, dt);
      }
      updateNPCModel(npc.model, dt, this.time);
      npc.questSprite.visible = this.npcHasQuest(npc.id);
    }
  }

  npcHasQuest(id) {
    const stage = this.state.mainStage;
    if (id === 'lyra' && (stage === 0 || stage === 2)) return true;
    if (id === 'nima' && !this.state.sideQuests.ecos?.started && stage >= 1) return true;
    if (id === 'mira' && !this.state.sideQuests.campanas?.started) return true;
    if (id === 'orin' && !this.state.flags.orinGift) return true;
    if (id === 'kael' && stage === 6) return true;
    return false;
  }

  /* ------------------------------------------------------------------ */
  /* Interactions                                                        */
  /* ------------------------------------------------------------------ */

  updateInteractions() {
    const pos = this.player.group.position;
    let best = null;
    let bestDist = Infinity;
    const consider = (type, obj, x, z, radius, label, extra = {}) => {
      const d = Math.hypot(pos.x - x, pos.z - z);
      if (d <= radius && d < bestDist) {
        bestDist = d;
        best = { type, obj, x, z, radius, label, ...extra };
      }
    };
    for (const npc of this.npcs) consider('npc', npc, npc.group.position.x, npc.group.position.z, 3.6, `Hablar con ${npc.name}`);
    for (const c of this.creatures) {
      if (!c.captured) consider('creature', c, c.group.position.x, c.group.position.z, 4.2, `Resonar con ${c.species.name}`);
    }
    for (const item of this.world.getInteractables()) {
      if (item.type === 'chest' && !item.opened) consider('chest', item, item.x, item.z, item.radius, 'Abrir cofre');
      if (item.type === 'brazier' && !item.lit) consider('brazier', item, item.x, item.z, item.radius, 'Encender brasero');
      if (item.type === 'lamp' && !item.lit) consider('lamp', item, item.x, item.z, item.radius, 'Encender Lámpara del Alba');
      if (item.type === 'lore' && !this.state.lore.includes(item.id)) consider('lore', item, item.x, item.z, item.radius, `Leer ${item.label}`);
      if (item.type === 'waystone') consider('waystone', item, item.x, item.z, item.radius, 'Descansar en el altar');
      if (item.type === 'seal' && !item.activated) {
        const guarded = this.enemies.some((e) => !e.dead && e.spawn?.seal === item.id);
        consider('seal', item, item.x, item.z, item.radius, guarded ? 'El sello aún está custodiado' : 'Romper sello del Archivo', { guarded });
      }
    }
    for (const item of this.extraInteractables) {
      consider('convergence', item, item.x, item.z, item.radius, 'Afrontar la Convergencia');
    }
    this.nearby = best;
    if (best) this.ui.showInteraction(`${best.label} · ${INTERACT_KEY}`);
    else this.ui.showInteraction('');
  }

  interact() {
    if (this.frozen || this.player.dead || !this.nearby) return;
    const n = this.nearby;
    if (n.type === 'npc') this.talkTo(n.obj);
    else if (n.type === 'creature') this.requestCapture(n.obj);
    else if (n.type === 'chest') this.openChest(n.obj);
    else if (n.type === 'brazier') this.lightBrazier(n.obj);
    else if (n.type === 'lamp') this.lightLamp(n.obj);
    else if (n.type === 'lore') this.readLore(n.obj);
    else if (n.type === 'waystone') this.restAtWaystone(n.obj);
    else if (n.type === 'seal') {
      if (n.guarded) this.ui.toast('Sello custodiado', 'Derrota al Centinela del Velo que lo protege.', 'error');
      else this.breakSeal(n.obj.id);
    } else if (n.type === 'convergence') this.openConvergence();
  }

  openChest(item) {
    if (item.opened) return;
    item.opened = true;
    if (item.lid) item.lid.rotation.x = -1.1;
    this.state.stats.chests = (this.state.stats.chests || 0) + 1;
    this.state.flags.chestsOpened = this.state.flags.chestsOpened || [];
    this.state.flags.chestsOpened.push(item.id);
    const loot = item.loot || {};
    const parts = [];
    if (loot.essence) {
      this.state.inventory.esencia_eco = (this.state.inventory.esencia_eco || 0) + loot.essence;
      parts.push(`${loot.essence} esencia`);
    }
    if (loot.potion) {
      this.state.inventory.pocion_luz = (this.state.inventory.pocion_luz || 0) + loot.potion;
      parts.push(`${loot.potion} poción${loot.potion > 1 ? 'es' : ''}`);
    }
    if (loot.fragments) {
      this.state.inventory.fragmentos = (this.state.inventory.fragmentos || 0) + loot.fragments;
      parts.push(`${loot.fragments} fragmentos`);
    }
    this.chestBonus(item.id);
    this.audio.play('chest');
    this.spawnPillar(vec3(item.x, 0, item.z), '#f4d58d', 0.7, 0.7);
    this.ui.toast('Cofre abierto', parts.join(' · ') || 'Un recuerdo del Velo.', 'quest');
    this.save();
  }

  chestBonus(id) {
    if (id === 'chest_val_3') this.grantArmor('coraza_valdoria');
    if (id === 'chest_drak_2') this.grantCharm('anillo_resonancia');
    if (id === 'chest_kan_1') this.grantCharm('lagrima_brasa');
    if (id === 'chest_kan_3') this.grantCharm('pluma_eco');
    if (id === 'chest_ruins') this.grantCharm('amuleto_lumi');
  }

  lightBrazier(item) {
    if (item.lit) return;
    item.lit = true;
    item.flame.material.opacity = 0.9;
    item.flame.scale.setScalar(2.1);
    this.state.flags.braziersLit = this.state.flags.braziersLit || [];
    this.state.flags.braziersLit.push(item.id);
    const count = this.state.flags.braziersLit.length;
    this.state.flags.braziers = count;
    const q = this.state.sideQuests.campanas;
    if (q?.started && !q.done) q.progress = count;
    this.audio.play('spell');
    this.spawnPillar(vec3(item.x, 0, item.z), '#ffb347', 0.8, 0.8);
    this.ui.toast('Brasero encendido', `${count} de 3. Lumen recuerda un poco más.`, 'quest');
    if (count >= 3 && q?.started && !q.done) this.ui.toast('Campanas dormidas', 'Vuelve con la Anciana Mira.', 'quest');
    this.save();
  }

  lightLamp(item) {
    if (item.lit) return;
    item.lit = true;
    item.flame.material.opacity = 0.9;
    item.flame.scale.setScalar(2.4);
    this.state.flags.lampsLit = this.state.flags.lampsLit || [];
    this.state.flags.lampsLit.push(item.id);
    const count = this.state.flags.lampsLit.length;
    this.state.flags.lamps = count;
    if (this.state.mainStage === 3) this.state.stageProgress[3] = count;
    this.audio.play('seal');
    this.spawnPillar(vec3(item.x, 0, item.z), '#9ef0ff', 1.0, 1.0);
    this.ui.toast('Lámpara del Alba', `${count} de 3 encendidas.`, 'quest');
    if (count >= 3 && this.state.mainStage === 3) {
      this.advanceStage(4);
      this.ensureBosses();
      this.ui.toast('El Santuario despierta', 'Algo enorme se alza entre las piedras.', 'error');
    }
    this.updateQuestMarker();
    this.save();
  }

  breakSeal(id) {
    if (!id) return;
    this.state.flags.sealsBroken = this.state.flags.sealsBroken || [];
    if (this.state.flags.sealsBroken.includes(id)) return;
    this.state.flags.sealsBroken.push(id);
    const item = this.world.getInteractables().find((i) => i.type === 'seal' && i.id === id);
    if (item) item.activated = true;
    const dyn = this.world.dynamic.find((d) => d.type === 'seal' && d.id === id);
    if (dyn) {
      dyn.ring.visible = false;
      dyn.mesh.material.color.set('#555064');
    }
    const count = this.state.flags.sealsBroken.length;
    this.state.flags.seals = count;
    if (this.state.mainStage === 10) this.state.stageProgress[10] = count;
    this.audio.play('seal');
    this.spawnPillar(vec3(item?.x || 0, 0, item?.z || 0), '#c6b7ff', 1.4, 1.1);
    this.ui.toast('Sello roto', `${count} de 3. El Archivo recuerda tu nombre.`, 'quest');
    if (count >= 3 && this.state.mainStage === 10) {
      this.advanceStage(11);
      this.ui.toast('La Cumbre se abre', 'Sube al norte. Vex te espera.', 'quest');
    }
    this.updateQuestMarker();
    this.save();
  }

  readLore(item) {
    if (this.state.lore.includes(item.id)) return;
    this.state.lore.push(item.id);
    item.mesh.visible = false;
    const q = this.state.sideQuests.memoria;
    if (q?.started && !q.done) q.progress = this.state.lore.length;
    this.audio.play('quest');
    this.spawnPillar(vec3(item.x, 0, item.z), '#f4d58d', 0.8, 0.8);
    const data = item.data || LORE.find((l) => l.id === item.id);
    this.frozen = true;
    this.ui.showDialogue({
      speaker: data?.name || 'Eco del pasado',
      portrait: 'lyra',
      lines: [data?.text || 'El recuerdo se deshace antes de que puedas leerlo.'],
      onEnd: () => {
        this.frozen = false;
        if (q?.started && !q.done && this.state.lore.length >= 3) {
          this.ui.toast('Memorias reunidas', 'Vuelve con Lyra.', 'quest');
        }
        this.save();
      },
    });
  }

  restAtWaystone(item) {
    const stats = this.getStats();
    this.state.player.hp = stats.maxHp;
    this.state.player.mp = stats.maxMp;
    this.state.player.sp = stats.maxSp;
    this.state.checkpoint = { region: this.state.region, x: item.x, z: item.z };
    this.audio.play('quest');
    this.spawnRing(vec3(item.x, 0, item.z), '#7ee8fa', 5, 0.9);
    this.ui.toast('Altar de Resonancia', 'Vida, maná y aguante restaurados. Punto de retorno fijado.', 'level');
    this.save();
  }

  requestCapture(creature) {
    if (creature.captured) return;
    const stats = this.getStats();
    const rarityBonus = { Común: 0.12, Raro: 0.02, Épico: -0.08, Legendario: -0.18 }[creature.species.rarity] || 0;
    const chance = clamp(stats.capture + rarityBonus, 0.12, 0.94);
    const canAfford = (this.state.inventory.esencia_eco || 0) > 0;
    this.captureTarget = creature;
    this.frozen = true;
    this.ui.showCapture(
      creature.species,
      chance,
      canAfford,
      () => this.confirmCapture(),
      () => this.cancelCapture(),
    );
  }

  confirmCapture() {
    const creature = this.captureTarget;
    if (!creature) return;
    if ((this.state.inventory.esencia_eco || 0) <= 0) {
      this.ui.toast('Sin esencia', 'Necesitas Esencia de Eco para resonar.', 'error');
      return;
    }
    this.state.inventory.esencia_eco -= 1;
    const stats = this.getStats();
    const rarityBonus = { Común: 0.12, Raro: 0.02, Épico: -0.08, Legendario: -0.18 }[creature.species.rarity] || 0;
    const chance = clamp(stats.capture + rarityBonus, 0.12, 0.94);
    const success = Math.random() < chance;
    this.ui.hideCapture();
    this.captureTarget = null;
    this.frozen = false;
    if (!success) {
      this.audio.play('error');
      this.spawnRing(creature.group.position, '#ff7a6b', 2.5, 0.5);
      this.ui.toast('La resonancia falla', `${creature.species.name} se aleja entre la hierba.`, 'error');
      creature.home = {
        x: clamp(creature.home.x + rand(-8, 8), -80, 80),
        z: clamp(creature.home.z + rand(-8, 8), -80, 80),
      };
      this.save();
      return;
    }

    const existing = this.state.creatures.find((c) => c.id === creature.speciesId);
    if (existing) {
      existing.level = Math.min(5, (existing.level || 1) + 1);
      this.ui.toast('Eco reforzado', `${creature.species.name} alcanza el nivel ${existing.level}.`, 'capture');
    } else {
      this.state.creatures.push({ id: creature.speciesId, level: 1, active: this.state.creatures.length === 0 });
      this.ui.toast('Eco capturado', `${creature.species.name} · ${creature.species.title}`, 'capture');
    }
    this.state.stats.captures = (this.state.stats.captures || 0) + 1;
    creature.captured = true;
    creature.group.visible = false;
    this.audio.play('capture');
    this.spawnPillar(creature.group.position, creature.species.colors.accent, 1.2, 1.1);
    this.spawnRing(creature.group.position, creature.species.colors.accent, 4, 0.9);
    const q = this.state.sideQuests.ecos;
    if (q?.started && !q.done) {
      q.progress = this.state.creatures.length;
      if (q.progress >= 3) this.ui.toast('Jardín de Nima', 'Vuelve con Nima en Lumen.', 'quest');
    }
    if (this.state.creatures.length === 1) this.spawnCompanion();
    this.save();
  }

  cancelCapture() {
    this.ui.hideCapture();
    this.captureTarget = null;
    this.frozen = false;
  }

  /* ------------------------------------------------------------------ */
  /* Dialogue & story                                                    */
  /* ------------------------------------------------------------------ */

  talkTo(npc) {
    if (this.frozen) return;
    const id = npc.id;
    let data = null;
    if (id === 'lyra') data = lyraDialogue(this.state);
    else if (id === 'nima') data = nimaDialogue(this.state);
    else if (id === 'mira') data = miraDialogue(this.state);
    else if (id === 'orin') data = orinDialogue(this.state);
    else if (id === 'kael') data = kaelDialogue(this.state);
    if (!data) return;
    this.frozen = true;
    this.ui.showDialogue({
      ...data,
      onEnd: (choice) => {
        this.frozen = false;
        this.resolveNpcEnd(id, choice);
      },
    });
  }

  resolveNpcEnd(id, choice) {
    const s = this.state;
    const stageBefore = s.mainStage;
    if (id === 'lyra') {
      if (stageBefore === 0) {
        if (choice?.id === 'ask') {
          this.ui.toast('La Espada Celestial', 'No fue forjada para matar. Fue forjada para recordar.', 'quest');
        }
        this.advanceStage(1);
      } else if (stageBefore === 2) {
        this.advanceStage(3);
      } else {
        const q = s.sideQuests.memoria;
        if (!q?.started && stageBefore >= 3 && choice?.id === 'accept') {
          this.startSideQuest('memoria');
        } else if (q?.started && !q.done && s.lore.length >= 3) {
          this.completeSideQuest('memoria');
          this.grantArmor('vestiduras_astrales');
        }
      }
    } else if (id === 'nima') {
      const q = s.sideQuests.ecos;
      if (!q?.started && choice?.id === 'accept') this.startSideQuest('ecos');
      else if (q?.started && !q.done && s.creatures.length >= 3) {
        this.completeSideQuest('ecos');
        this.grantCharm('amuleto_lumi');
      }
    } else if (id === 'mira') {
      const q = s.sideQuests.campanas;
      if (!q?.started && choice?.id === 'accept') this.startSideQuest('campanas');
      else if (q?.started && !q.done && (s.flags.braziers || 0) >= 3) {
        this.completeSideQuest('campanas');
        s.inventory.pocion_luz = (s.inventory.pocion_luz || 0) + 3;
        s.inventory.esencia_eco = (s.inventory.esencia_eco || 0) + 4;
        this.ui.toast('Recompensa', '3 Pociones de Luz y 4 Esencia de Eco.', 'quest');
      }
    } else if (id === 'orin') {
      if (!s.flags.orinGift) {
        s.flags.orinGift = true;
        s.inventory.fragmentos = (s.inventory.fragmentos || 0) + 2;
        this.ui.toast('Regalo de Orin', '2 Fragmentos de cielo. La forja te espera.', 'quest');
      }
    } else if (id === 'kael') {
      const q = s.sideQuests.deuda;
      if (stageBefore === 6) {
        if (choice?.id === 'deuda') this.startSideQuest('deuda');
        this.advanceStage(7);
      } else if (q?.started && !q.done && s.flags.devoradorDead) {
        this.completeSideQuest('deuda');
        this.grantWeapon('filo_draconico');
      }
    }
    this.save();
    this.updateQuestMarker();
  }

  startSideQuest(id) {
    const def = SIDE_QUESTS[id];
    if (!def || this.state.sideQuests[id]?.started) return;
    this.state.sideQuests[id] = { started: true, done: false, progress: 0 };
    this.audio.play('quest');
    this.ui.toast('Misión secundaria', def.name, 'quest');
    this.save();
  }

  completeSideQuest(id) {
    const def = SIDE_QUESTS[id];
    const q = this.state.sideQuests[id];
    if (!def || !q || q.done) return;
    q.done = true;
    q.progress = def.target;
    this.state.stats.quests = (this.state.stats.quests || 0) + 1;
    this.audio.play('quest');
    this.ui.toast('Misión completada', `${def.name} · ${def.reward}`, 'level');
    this.save();
  }

  startIntro() {
    if (this.introPlayed) return;
    this.introPlayed = true;
    this.frozen = true;
    this.ui.showCinematic({
      ...introCinematic(this.state.player.name),
      onEnd: () => {
        this.frozen = false;
        this.ui.toast('La llamada del Velo', 'Habla con Lyra en la plaza de Lumen.', 'quest');
        this.save();
      },
    });
  }

  playCinematic(data, onEnd) {
    if (!data) {
      onEnd?.();
      return;
    }
    this.frozen = true;
    this.ui.showCinematic({
      ...data,
      onEnd: () => {
        this.frozen = false;
        onEnd?.();
      },
    });
  }

  advanceStage(stage) {
    const next = clamp(stage, 0, MAIN_STAGES.length - 1);
    if (next <= this.state.mainStage) return;
    this.state.mainStage = next;
    this.updateQuestMarker();
    this.audio.play('quest');
    if (next === 5) {
      this.playCinematic(chapterCinematic(5), () => {
        this.ui.toast('Drakmor desbloqueada', 'Abre el mapa y viaja al Campamento de Ceniza.', 'quest');
        this.save();
      });
    } else if (next === 9) {
      this.playCinematic(chapterCinematic(9), () => {
        this.ui.toast('Kansordore desbloqueada', 'El Archivo Prohibido espera.', 'quest');
        this.save();
      });
    } else if (next === 11) {
      this.playCinematic(chapterCinematic(11), () => {
        this.ui.toast('La Cumbre de la Convergencia', 'Asciende al norte del Archivo.', 'quest');
        this.save();
      });
    } else if (next === 13) {
      this.playCinematic(chapterCinematic(13), () => {
        this.ui.toast('La Espada Celestial', 'Afronta la Convergencia en la Cumbre.', 'level');
        this.save();
      });
    } else {
      const def = MAIN_STAGES[next];
      if (def) this.ui.toast('Nuevo objetivo', def.objective, 'quest');
      this.save();
    }
    this.checkStageAuto();
  }

  checkStageAuto() {
    const s = this.state;
    const f = s.flags;
    if (s.mainStage === 1 && (f.sombras || 0) >= 3) this.advanceStage(2);
    if (s.mainStage === 3 && (f.lamps || 0) >= 3) {
      this.advanceStage(4);
      this.ensureBosses();
    }
    if (s.mainStage === 7 && (f.guardias || 0) >= 3) {
      this.advanceStage(8);
      this.ensureBosses();
    }
    if (s.mainStage === 10 && (f.seals || 0) >= 3) this.advanceStage(11);
  }

  unlockRegion(id) {
    if (!this.state.unlockedRegions.includes(id)) {
      this.state.unlockedRegions.push(id);
      this.ui.toast('Región desbloqueada', REGIONS[id].name, 'level');
      this.save();
    }
  }

  updateQuestTriggers() {
    const s = this.state;
    if (s.region === 'kansordore' && s.mainStage === 11) {
      const d = Math.hypot(this.player.group.position.x - 0, this.player.group.position.z + 62);
      if (d < 17) {
        this.advanceStage(12);
        this.ensureBosses();
        this.ui.toast('La Cumbre', 'Vex, el Custodio del Velo, te espera.', 'error');
      }
    }
  }

  openConvergence() {
    if (this.frozen || this.state.mainStage < 13) return;
    this.frozen = true;
    this.ui.showDialogue({
      ...convergenceDialogue(this.state),
      onEnd: (choice) => {
        this.frozen = false;
        if (choice?.id) this.completeEnding(choice.id);
        else this.ui.toast('La Convergencia espera', 'Vuelve cuando hayas decidido.', 'quest');
      },
    });
  }

  completeEnding(id) {
    const ending = id || 'restaurar';
    this.state.ending = ending;
    this.audio.play('victory');
    this.save();
    this.playCinematic(endingCinematic(ending, this.state.player.name), () => {
      this.app.enterEnding(ending);
      this.save();
    });
  }

  /* ------------------------------------------------------------------ */
  /* Quest info & markers                                                */
  /* ------------------------------------------------------------------ */

  getQuestInfo() {
    const s = this.state;
    const stage = MAIN_STAGES[s.mainStage] || MAIN_STAGES[0];
    let progress = 0;
    let total = stage.progress || 0;
    if (s.mainStage === 1) progress = Math.min(3, s.flags.sombras || 0);
    if (s.mainStage === 3) progress = Math.min(3, s.flags.lamps || 0);
    if (s.mainStage === 7) progress = Math.min(3, s.flags.guardias || 0);
    if (s.mainStage === 10) progress = Math.min(3, s.flags.seals || 0);
    return {
      kind: 'MISIÓN PRINCIPAL',
      step: ROMAN[s.mainStage] || 'I',
      title: stage.title,
      objective: stage.objective,
      progress,
      total,
    };
  }

  updateQuestMarker() {
    if (!this.world) return;
    const s = this.state;
    const region = this.world.regionId;
    const stage = s.mainStage;
    let pos = null;
    let label = '';
    if (stage === 0 || stage === 2) {
      if (region === 'valdoria') {
        const lyra = this.npcs.find((n) => n.id === 'lyra');
        pos = lyra ? { x: lyra.group.position.x, z: lyra.group.position.z } : { x: 4, z: 5 };
        label = 'Lyra';
      }
    } else if (stage === 1) {
      if (region === 'valdoria') {
        pos = { x: 24, z: -16 };
        label = 'Sombras del Velo';
      }
    } else if (stage === 3 || stage === 4) {
      if (region === 'valdoria') {
        pos = this.world.landmarks.shrine;
        label = stage === 3 ? 'Lámparas del Alba' : 'Guardián Astado';
      }
    } else if (stage === 6) {
      if (region === 'drakmor') {
        const kael = this.npcs.find((n) => n.id === 'kael');
        pos = kael ? { x: kael.group.position.x, z: kael.group.position.z } : this.world.landmarks.camp;
        label = 'Kael';
      }
    } else if (stage === 7) {
      if (region === 'drakmor') {
        pos = this.world.landmarks.gate;
        label = 'Puerta de Obsidiana';
      }
    } else if (stage === 8) {
      if (region === 'drakmor') {
        pos = this.world.landmarks.fortress?.arena || this.world.landmarks.fortress;
        label = 'Reina Ceniza';
      }
    } else if (stage === 10) {
      if (region === 'kansordore') {
        const broken = new Set(s.flags.sealsBroken || []);
        const seal = this.world.getInteractables().find((i) => i.type === 'seal' && !broken.has(i.id));
        pos = seal ? { x: seal.x, z: seal.z } : null;
        label = 'Sello del Archivo';
      }
    } else if (stage === 11 || stage === 12 || stage === 13) {
      if (region === 'kansordore') {
        pos = stage === 13 ? { x: 0, z: -50 } : this.world.landmarks.summit;
        label = stage === 13 ? 'La Convergencia' : 'Cumbre de la Convergencia';
      }
    }
    this.world.setQuestTarget(pos, label);
  }

  /* ------------------------------------------------------------------ */
  /* Rewards                                                             */
  /* ------------------------------------------------------------------ */

  grantWeapon(id) {
    if (!WEAPONS[id]) return;
    if (this.state.ownedWeapons.includes(id)) {
      this.state.inventory.fragmentos = (this.state.inventory.fragmentos || 0) + 2;
      return;
    }
    this.state.ownedWeapons.push(id);
    this.ui.toast('Arma obtenida', WEAPONS[id].name, 'level');
    this.audio.play('quest');
  }

  grantArmor(id) {
    if (!ARMORS[id]) return;
    if (this.state.ownedArmors.includes(id)) {
      this.state.inventory.fragmentos = (this.state.inventory.fragmentos || 0) + 2;
      return;
    }
    this.state.ownedArmors.push(id);
    this.ui.toast('Armadura obtenida', ARMORS[id].name, 'level');
    this.audio.play('quest');
  }

  grantCharm(id) {
    if (!CHARMS[id]) return;
    if (this.state.ownedCharms.includes(id)) {
      this.state.inventory.fragmentos = (this.state.inventory.fragmentos || 0) + 1;
      return;
    }
    this.state.ownedCharms.push(id);
    this.ui.toast('Talismán obtenido', CHARMS[id].name, 'level');
    this.audio.play('quest');
  }

  /* ------------------------------------------------------------------ */
  /* Save / travel / revive / dispose                                    */
  /* ------------------------------------------------------------------ */

  serialize() {
    const s = this.state;
    if (this.player.group) s.lastPosition = { x: this.player.group.position.x, z: this.player.group.position.z };
    return {
      version: 1,
      savedAt: Date.now(),
      playTime: s.playTime,
      difficulty: s.difficulty,
      player: s.player,
      region: s.region,
      mainStage: s.mainStage,
      stageProgress: s.stageProgress,
      sideQuests: s.sideQuests,
      lore: s.lore,
      creatures: s.creatures,
      inventory: s.inventory,
      ownedWeapons: s.ownedWeapons,
      ownedArmors: s.ownedArmors,
      ownedCharms: s.ownedCharms,
      upgrades: s.upgrades,
      skills: s.skills,
      unlockedRegions: s.unlockedRegions,
      flags: s.flags,
      stats: s.stats,
      defeated: s.defeated,
      ending: s.ending,
      checkpoint: s.checkpoint,
      lastPosition: s.lastPosition,
    };
  }

  save(notify = false) {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(this.serialize()));
      if (notify) this.ui.toast('Partida guardada', 'La Espada recuerda este momento.', 'quest');
      this.app?.ui?.updateContinueButton?.();
    } catch {
      if (notify) this.ui.toast('No se pudo guardar', 'El almacenamiento del navegador no está disponible.', 'error');
    }
  }

  travelTo(regionId) {
    if (!REGIONS[regionId]) return;
    if (!this.state.unlockedRegions.includes(regionId)) {
      this.ui.toast('Región bloqueada', 'Aún no puedes cruzar ese umbral.', 'error');
      return;
    }
    if (this.state.region === regionId) {
      this.ui.toast('Ya estás aquí', REGIONS[regionId].name, 'quest');
      return;
    }
    this.app.closeMap();
    this.loadRegion(regionId, REGIONS[regionId].spawn);
    this.state.checkpoint = { region: regionId, x: REGIONS[regionId].spawn.x, z: REGIONS[regionId].spawn.z };
    this.ui.toast('Viaje rápido', REGIONS[regionId].name, 'quest');
    this.audio.play('quest');
    if (this.state.mainStage === 5 && regionId === 'drakmor') this.advanceStage(6);
    if (this.state.mainStage === 9 && regionId === 'kansordore') this.advanceStage(10);
    this.updateQuestMarker();
    this.save();
  }

  revive() {
    const stats = this.getStats();
    const cp = this.state.checkpoint;
    if (cp && REGIONS[cp.region] && cp.region !== this.state.region) {
      this.loadRegion(cp.region, cp);
    } else if (cp) {
      this.placePlayer(cp.x, cp.z);
    }
    const p = this.state.player;
    p.hp = Math.round(stats.maxHp * 0.65);
    p.mp = Math.round(stats.maxMp * 0.55);
    p.sp = stats.maxSp;
    this.player.dead = false;
    this.deathShown = false;
    this.deathTimer = 0;
    this.iframe = 1.5;
    this.attack = null;
    this.cast = null;
    this.dodge = null;
    this.shake = 0;
    if (this.player.model) {
      this.player.model.pose.dead = false;
      this.player.model.pose.deadProgress = 0;
    }
    this.spawnPillar(this.player.group.position, '#7ee8fa', 1.2, 1.2);
    this.ui.toast('La Espada te recuerda', 'Continúas desde el último altar.', 'level');
    this.app.resumeFromDeath();
    this.save();
  }

  dispose() {
    if (this.scene) disposeObject(this.scene);
    this.scene = null;
    this.world = null;
    this.enemies = [];
    this.creatures = [];
    this.npcs = [];
    this.projectiles = [];
    this.effects = [];
    this.telegraphs = [];
    this.companion = null;
    this.audio.setTheme('title', false);
  }
}
