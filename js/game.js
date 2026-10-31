// ============================================================
// LA ESPADA CELESTIAL — motor de juego
// ============================================================
import {
  REGIONS, CREATURES, CREATURE_BY_ID, WEAPONS, ARMORS, HELMETS, CHARMS,
  QUESTS, SIDE_QUESTS, ENEMY_TYPES, LORE_STONES, MAIN_STORY, ENDINGS,
  NPCS, ITEMS, ELEMENTS, SAVE_KEY, SETTINGS_KEY
} from './data.js';
import {
  TAU, clamp, lerp, rand, mulberry32, rgba, shade, rr, glow, polygon, ellipse,
  buildTerrain, drawProp, drawCharacter, drawNPC, drawCreature, drawEnemy,
  drawPortrait, drawSword, drawSlash, drawRing
} from './art.js';
import { audio } from './audio.js';

// ---------------- DOM ----------------
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
const canvas = $('#game');
const ctx = canvas.getContext('2d', { alpha: false });
const hudPortrait = $('#hud-portrait');
const creatorCanvas = $('#creator-canvas');
const sheetPortrait = $('#sheet-portrait');
const dialoguePortrait = $('#dialogue-portrait');
const minimap = $('#minimap');
const worldMap = $('#world-map');

// ---------------- Estado ----------------
const DEFAULT_SETTINGS = { volume: 70, music: 55, sfx: 80, motion: false, contrast: false, damage: true, touch: false };
const S = {
  mode: 'boot', time: 0, last: 0, w: innerWidth, h: innerHeight, dpr: 1,
  player: null, regionId: 'valdoria', world: null,
  stage: 0, flags: {}, side: { s0: 'inactive', s1: 'inactive', s2: 'inactive' },
  loreRead: [], seals: [false, false, false],
  camera: { x: 0, y: 0, zoom: 1, shake: 0, shakeX: 0, shakeY: 0 },
  keys: {}, touchMove: { x: 0, y: 0 }, blockHeld: false,
  particles: [], floaters: [], rings: [], projectiles: [], beams: [], telegraphs: [],
  hitStop: 0, boss: null, dialogue: null, cine: null,
  settings: { ...DEFAULT_SETTINGS }, playtime: 0, lastSave: 0,
  panelFromTitle: false, panelTab: 'hero', demoPlayer: null,
  titleT: 0, menuHover: 0, uiTick: 0, muted: false,
  objectivePulse: 0, lastFootstep: 0, transitionLock: false,
  tutorialShown: false, gameStarted: false, deathCount: 0
};

function loadSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) S.settings = { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {}
  applySettings();
}
function applySettings() {
  audio.setVolumes({ master: S.settings.volume / 100, music: S.settings.music / 100, sfx: S.settings.sfx / 100 });
  document.body.classList.toggle('reduced-motion', !!S.settings.motion);
  document.body.classList.toggle('high-contrast', !!S.settings.contrast);
  const showTouch = S.settings.touch || matchMedia('(pointer: coarse)').matches || innerWidth < 820;
  $('#touch-controls').classList.toggle('hidden', !showTouch);
  $('#touch-controls').style.display = showTouch ? 'flex' : 'none';
  $('.key-hints').style.display = showTouch ? 'none' : 'flex';
}
function saveSettings() {
  try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(S.settings)); } catch {}
}

// ---------------- Utilidades ----------------
const clamp01 = v => clamp(v, 0, 1);
const nowSec = () => performance.now() / 1000;
function fmt(n) { return Math.max(0, Math.round(n)).toLocaleString('es-ES'); }
function xpNeeded(level) { return 90 + (level - 1) * 60; }
function inRect(x, y, r) { return x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h; }
function circleRect(cx, cy, cr, r) {
  const nx = clamp(cx, r.x, r.x + r.w), ny = clamp(cy, r.y, r.y + r.h);
  return (cx - nx) ** 2 + (cy - ny) ** 2 < cr * cr;
}
function angleDiff(a, b) {
  let d = (a - b) % TAU;
  if (d > Math.PI) d -= TAU;
  if (d < -Math.PI) d += TAU;
  return d;
}
function pointToSegment(px, py, x1, y1, x2, y2) {
  const dx = x2 - x1, dy = y2 - y1;
  const len = dx * dx + dy * dy;
  const t = len ? clamp(((px - x1) * dx + (py - y1) * dy) / len, 0, 1) : 0;
  return Math.hypot(px - (x1 + dx * t), py - (y1 + dy * t));
}

// ---------------- Ajustes de pantalla ----------------
function resize() {
  S.w = innerWidth; S.h = innerHeight; S.dpr = Math.min(2, devicePixelRatio || 1);
  canvas.width = Math.floor(S.w * S.dpr);
  canvas.height = Math.floor(S.h * S.dpr);
  canvas.style.width = S.w + 'px'; canvas.style.height = S.h + 'px';
  S.camera.zoom = clamp(Math.min(S.w / 1200, S.h / 700), .66, 1.15);
  applySettings();
}

// ---------------- Jugador ----------------
function makePlayer(config = {}) {
  const cfg = {
    name: 'Aurel', face: 0, hair: 0, hairColor: '#3b2417', skin: '#e2b58e',
    armor: 0, helmet: 0, weapon: 0, accessory: 0, boon: 'str', ...config
  };
  const p = {
    name: cfg.name || 'Aurel', config: cfg,
    level: 1, xp: 0, xpNext: xpNeeded(1), statPoints: 0,
    stats: { vida: 5, mana: 4, res: 5, fuerza: 5, defensa: 4, velocidad: 5, inteligencia: 4, suerte: 4 },
    equipment: { weapon: 'alba', armor: 'tunica', helmet: 'ninguno', charm: 'ninguno' },
    owned: ['alba', 'tunica', 'ninguno', 'diadema'],
    inventory: { potion: 3, ether: 2 },
    materials: {},
    gold: 25,
    creatures: [], party: [], activeCreature: null, creatureCooldowns: {},
    x: 700, y: 1130, radius: 15, facing: 'down', dir: { x: 0, y: 1 },
    vx: 0, vy: 0, moving: false, speedNow: 0,
    hp: 1, mana: 1, stam: 1, maxHp: 1, maxMana: 1, maxStam: 1,
    atk: 1, def: 1, crit: 5, resPower: 1, moveSpeed: 150,
    attackTimer: 0, attackAnim: 0, attackHit: false, combo: 0, comboTimer: 0,
    dodgeTimer: 0, dodgeCooldown: 0, dodgeDir: { x: 0, y: 0 }, invuln: 0,
    hurt: 0, cast: 0, block: false, skillCooldown: 0, resonanceCooldown: 0,
    potionCooldown: 0, shield: 0, burn: 0, slow: 0, stun: 0,
    weaponUpgrade: 0, kills: 0, captured: 0, shrines: 0, questsDone: 0,
    playtime: 0, difficultyGrace: 0
  };
  if (cfg.boon === 'str') p.stats.fuerza += 2;
  if (cfg.boon === 'res') { p.stats.inteligencia += 2; }
  if (cfg.boon === 'agi') { p.stats.velocidad += 2; p.stats.res += 1; }
  if (cfg.boon === 'luck') { p.stats.suerte += 3; }
  derive(p);
  p.hp = p.maxHp; p.mana = p.maxMana; p.stam = p.maxStam;
  return p;
}

function equippedItem(p, slot) {
  const id = p.equipment[slot];
  const pool = slot === 'weapon' ? WEAPONS : slot === 'armor' ? ARMORS : slot === 'helmet' ? HELMETS : CHARMS;
  return pool.find(i => i.id === id) || pool[0];
}

function derive(p) {
  const st = p.stats;
  const weapon = equippedItem(p, 'weapon');
  const armor = equippedItem(p, 'armor');
  const helmet = equippedItem(p, 'helmet');
  const charm = equippedItem(p, 'charm');
  let hpFlat = 0, manaFlat = 0, stamFlat = 0, defFlat = 0, atkFlat = 0, critFlat = 0, luckFlat = 0, resFlat = 0, speedPct = 0, atkPct = 0, manaPct = 0, allStats = 0, skillCharge = 0;
  const party = (p.party || []).map(id => CREATURE_BY_ID[id]).filter(Boolean);
  for (const c of party) {
    const v = c.passiveValue || 0;
    switch (c.passiveKey) {
      case 'hpFlat': hpFlat += v; break;
      case 'manaFlat': manaFlat += v; break;
      case 'stamFlat': stamFlat += v; break;
      case 'defFlat': defFlat += v; break;
      case 'critFlat': critFlat += v; break;
      case 'speedPct': speedPct += v; break;
      case 'atkPct': atkPct += v; break;
      case 'manaPct': manaPct += v; break;
      case 'resPct': resFlat += v * .35; break;
      case 'allStats': allStats += v; break;
      case 'skillCharge': skillCharge += v; break;
    }
  }
  const level = p.level;
  p.maxHp = Math.round(86 + (st.vida - 5 + allStats) * 10 + (level - 1) * 12 + (armor.hp || 0) + hpFlat + (p.weaponUpgrade || 0) * 2);
  p.maxMana = Math.round((48 + (st.inteligencia - 4 + allStats) * 6 + (level - 1) * 4 + (armor.mana || 0) + (helmet.mana || 0) + (charm.mana || 0) + manaFlat) * (1 + manaPct / 100));
  p.maxStam = Math.round(82 + (st.res - 5 + allStats) * 6 + (level - 1) * 3 + stamFlat);
  p.atk = Math.round((8 + (st.fuerza - 5 + allStats) * 2.2 + (level - 1) * 1.15 + weapon.atk + (charm.atk || 0) + atkFlat + (p.weaponUpgrade || 0) * 2) * (1 + atkPct / 100));
  p.def = Math.round((st.defensa - 4 + allStats) * 1.1 + (armor.def || 0) + (helmet.def || 0) + defFlat);
  p.crit = Math.round((5 + (st.suerte - 4) * 1.2 + (helmet.crit || 0) + (charm.crit || 0) + critFlat) * 10) / 10;
  p.resPower = Math.round(100 + (st.inteligencia - 4) * 4 + (st.suerte - 4) * 2 + (charm.res || 0) + resFlat);
  p.moveSpeed = 150 + (st.velocidad - 5) * 5.2;
  p.moveSpeed *= 1 + speedPct / 100;
  p.luck = st.suerte + (charm.luck || 0) + luckFlat;
  p.skillCharges = 1 + skillCharge;
  p.hp = Math.min(p.hp, p.maxHp); p.mana = Math.min(p.mana, p.maxMana); p.stam = Math.min(p.stam, p.maxStam);
}

function getAppearance(p) {
  const cfg = p.config || {};
  const armor = equippedItem(p, 'armor');
  const weapon = equippedItem(p, 'weapon');
  const armorPalette = ['#d7c7a4', '#91a889', '#b66b4e', '#a99ad0'];
  const trimPalette = ['#c9a65a', '#9fc37a', '#e09a63', '#c4b2ea'];
  const helmet = p.equipment.helmet === 'diadema' ? 1 : p.equipment.helmet === 'yelmo' ? 2 : (cfg.helmet || 0);
  return {
    skin: cfg.skin || '#e2b58e', hairColor: cfg.hairColor || '#3b2417', hair: cfg.hair ?? 0,
    armorColor: armor.id === 'tunica' ? armorPalette[cfg.armor || 0] : armor.color,
    trim: trimPalette[cfg.armor || 0] || '#c9a65a',
    capeColor: shade(armor.id === 'tunica' ? armorPalette[cfg.armor || 0] : armor.color, -.38),
    helmet, accessory: cfg.accessory || 0,
    weaponData: { shape: weapon.shape ?? cfg.weapon ?? 0, color: weapon.color || '#d4b36a', blade: weapon.blade || '#fff1c2' },
    weapon: cfg.weapon || 0, eyeColor: cfg.eyeColor || '#58748c'
  };
}

function healPlayer(amount) {
  if (!S.player) return;
  const before = S.player.hp;
  S.player.hp = Math.min(S.player.maxHp, S.player.hp + amount);
  const real = S.player.hp - before;
  if (real > 0) {
    addFloater(S.player.x, S.player.y - 60, `+${Math.round(real)}`, '#8ce8a9', false, 'heal');
    spawnBurst(S.player.x, S.player.y - 25, '#8ce8a9', 12, 90, 'heal');
  }
}

function gainXp(amount) {
  const p = S.player; if (!p) return;
  p.xp += amount;
  addFloater(p.x, p.y - 75, `+${amount} XP`, '#b9d8ff', false, 'xp');
  while (p.xp >= p.xpNext) {
    p.xp -= p.xpNext;
    p.level++;
    p.statPoints += 3;
    p.xpNext = xpNeeded(p.level);
    p.hp = p.maxHp; p.mana = p.maxMana; p.stam = p.maxStam;
    derive(p);
    audio.levelUp();
    showToast(`Nivel ${p.level} · La Espada recuerda tu nombre`, 'gold', 3200);
    spawnBurst(p.x, p.y - 30, '#ffe2a1', 40, 180, 'level');
    addRing(p.x, p.y - 20, 20, 120, '#ffe2a1', .8, 3);
    updateHUD(true);
  }
}

function gainGold(n) {
  S.player.gold += n;
  addFloater(S.player.x, S.player.y - 55, `◈ ${n}`, '#ecd59f', false, 'gold');
  audio.coin();
}

// ---------------- Mundo ----------------
function addSolid(world, x, y, w, h, tag = 'solid') {
  world.solids.push({ x, y, w, h, tag });
}
function addProp(world, type, x, y, opts = {}, solid = null) {
  const p = { type, x, y, ...opts };
  world.props.push(p);
  if (solid) addSolid(world, x + solid.x, y + solid.y, solid.w, solid.h, type);
  return p;
}
function addTree(world, x, y, kind = 'tree', scale = 1) {
  addProp(world, kind, x, y, { scale }, { x: -11, y: -17, w: 22, h: 20 });
}
function addHouse(world, x, y, w = 160, h = 115, opts = {}) {
  addProp(world, 'house', x, y, { w, h, ...opts }, { x: -w / 2, y: -h, w, h });
}
function addNpc(world, id, x, y, extra = {}) {
  const def = NPCS[id];
  world.npcs.push({ id, x, y, def, ...extra });
}
function addWild(world, creatureId, x, y, opts = {}) {
  const def = CREATURE_BY_ID[creatureId];
  world.wilds.push({
    id: 'wild_' + creatureId + '_' + world.wilds.length, creatureId, x, y, home: { x, y },
    hp: def.base.hp * 2.6, maxHp: def.base.hp * 2.6, radius: 18, wanderT: rand(4),
    vx: 0, vy: 0, captured: false, questTarget: !!opts.questTarget,
    t: rand(10), hostile: false, hurt: 0
  });
}
function addEnemy(world, typeId, x, y, opts = {}) {
  const def = ENEMY_TYPES[typeId];
  const scale = opts.scale || 1;
  const e = {
    typeId, type: def, x, y, home: { x, y }, radius: def.radius * scale,
    hp: def.hp * scale, maxHp: def.hp * scale, atk: def.atk * scale,
    state: 'idle', stateTimer: rand(1.5), facing: 'right', seed: rand(20),
    moving: false, attackAngle: 0, hurt: 0, dead: false, deathTimer: 0,
    respawn: 0, boss: !!def.boss, phase: 1, specialTimer: 4, windup: 0,
    stun: 0, slow: 0, burn: 0, knockX: 0, knockY: 0, scale, aggro: def.aggro,
    elite: !!opts.elite, looted: false, intro: 0
  };
  world.enemies.push(e);
  return e;
}
function addGate(world, x, y, to, opts = {}) {
  const gate = { type: 'gate', x, y, to, locked: false, ...opts };
  world.gates.push(gate);
  addProp(world, 'gate', x, y, { locked: false, glow: opts.glow, color: opts.color }, { x: -70, y: -8, w: 22, h: 16 });
  return gate;
}
function addChest(world, x, y, loot = {}) {
  const p = addProp(world, 'chest', x, y, { opened: false, loot }, { x: -18, y: -24, w: 36, h: 25 });
  return p;
}
function addLore(world, loreId, x, y) {
  return addProp(world, 'lore', x, y, { loreId, read: false }, { x: -14, y: -20, w: 28, h: 20 });
}
function addOre(world, x, y, color = '#ff8a55') {
  return addProp(world, 'ore', x, y, { color, collected: false });
}
function addFlower(world, x, y) {
  return addProp(world, 'flower', x, y, { collected: false, color: '#f0c96b' });
}

function createWorld(regionId) {
  const region = REGIONS[regionId];
  const world = {
    regionId, region, props: [], solids: [], npcs: [], enemies: [], wilds: [], gates: [],
    chests: [], terrain: null, bossSpawned: false, time: 0, ambient: []
  };
  world.terrain = buildTerrain(region);
  const r = mulberry32(regionId.length * 9127 + 17);
  const W = region.width, H = region.height;
  // límites
  addSolid(world, -100, -100, W + 200, 100, 'edge');
  addSolid(world, -100, H, W + 200, 100, 'edge');
  addSolid(world, -100, 0, 100, H, 'edge');
  addSolid(world, W, 0, 100, H, 'edge');

  if (regionId === 'valdoria') buildValdoria(world, r);
  if (regionId === 'drakmor') buildDrakmor(world, r);
  if (regionId === 'kansordore') buildKansordore(world, r);

  // decoración común
  for (let i = 0; i < 70; i++) {
    const x = 80 + r() * (W - 160), y = 80 + r() * (H - 160);
    if (isNearImportant(world, x, y, 110)) continue;
    if (regionId === 'valdoria') {
      if (r() > .45) addTree(world, x, y, r() > .5 ? 'tree' : 'pine', .7 + r() * .6);
      else addProp(world, 'rock', x, y, { scale: .6 + r() * .7, color: '#5d5c50' }, { x: -18, y: -10, w: 36, h: 18 });
    } else if (regionId === 'drakmor') {
      if (r() > .55) addProp(world, 'rock', x, y, { scale: .7 + r() * .9, color: '#4a4141' }, { x: -20, y: -12, w: 40, h: 20 });
      else if (r() > .5) addProp(world, 'lavaVent', x, y, { scale: .7 + r() * .6 });
      else addProp(world, 'bones', x, y, { scale: .8 + r() * .5 });
    } else {
      if (r() > .6) addProp(world, 'crystal', x, y, { scale: .7 + r() * .7, color: r() > .5 ? '#b9d8ff' : '#d7c4ff' });
      else addProp(world, 'rock', x, y, { scale: .5 + r() * .6, color: '#5b5d6a' }, { x: -16, y: -10, w: 32, h: 18 });
    }
  }
  ensureBoss(world);
  return world;
}

function isNearImportant(world, x, y, pad = 80) {
  for (const p of world.props) {
    if (['house', 'shrine', 'gate', 'fountain', 'seal', 'statue', 'tent'].includes(p.type) && Math.hypot(p.x - x, p.y - y) < pad + 60) return true;
  }
  for (const n of world.npcs) if (Math.hypot(n.x - x, n.y - y) < pad) return true;
  return false;
}

function buildValdoria(world, r) {
  // Aldea de Lumen
  addHouse(world, 420, 1010, 170, 120, { roof: '#59402e', wall: '#b6a288' });
  addHouse(world, 835, 925, 150, 110, { roof: '#4f392b', wall: '#c0ad92' });
  addHouse(world, 1000, 1220, 180, 125, { roof: '#63452f', wall: '#a9967c' });
  addHouse(world, 450, 1300, 145, 105, { roof: '#50382a', wall: '#b9a58a' });
  addProp(world, 'fountain', 760, 1110, {}, { x: -55, y: -10, w: 110, h: 20 });
  addProp(world, 'statue', 760, 960, {}, { x: -26, y: -8, w: 52, h: 14 });
  addProp(world, 'shrine', 640, 1320, {}, { x: -46, y: -8, w: 92, h: 18 });
  addProp(world, 'tent', 940, 1020, { color: '#6a4d38' }, { x: -48, y: -8, w: 96, h: 16 });
  addProp(world, 'sign', 900, 1130, { label: 'LUMEN' });
  addProp(world, 'sign', 1230, 700, { label: 'BOSQUE' });
  addProp(world, 'brazier', 585, 1010, { color: '#ffb15e' });
  addProp(world, 'brazier', 860, 1010, { color: '#ffb15e' });

  addNpc(world, 'elara', 690, 985, { marker: '!' });
  addNpc(world, 'ordan', 510, 1175, { marker: '!' });
  addNpc(world, 'mira', 880, 1085, { marker: '!' });

  // Bosque de los Susurros
  for (let i = 0; i < 52; i++) {
    const x = 120 + r() * 1550, y = 80 + r() * 610;
    if (Math.hypot(x - 1110, y - 430) < 180) continue;
    if (pointToSegment(x, y, 880, 730, 1120, 620) < 90) continue;
    if (pointToSegment(x, y, 690, 900, 880, 730) < 80) continue;
    addTree(world, x, y, r() > .55 ? 'tree' : 'pine', .75 + r() * .7);
  }
  addProp(world, 'rock', 520, 620, { scale: 1.4, color: '#666357' }, { x: -32, y: -18, w: 64, h: 34 });
  addProp(world, 'rock', 1510, 540, { scale: 1.2, color: '#5d5a50' }, { x: -28, y: -16, w: 56, h: 30 });
  addProp(world, 'arch', 1110, 300, { scale: .8 }, { x: -76, y: -14, w: 26, h: 18 });
  addProp(world, 'flower', 1080, 450, { color: '#f0c96b', collected: false });
  addProp(world, 'flower', 1140, 470, { color: '#e8d39b', collected: false });
  addProp(world, 'lore', 1500, 1310, { loreId: 'lore1', read: false }, { x: -14, y: -20, w: 28, h: 20 });
  addProp(world, 'lore', 2110, 380, { loreId: 'lore2', read: false }, { x: -14, y: -20, w: 28, h: 20 });

  // Ruinas de Vael
  for (const [x, y, br] of [[1900, 590, false], [2325, 590, true], [1900, 940, true], [2325, 940, false], [2110, 540, false]]) {
    addProp(world, 'ruinPillar', x, y, { scale: 1.1, broken: br }, { x: -14, y: -8, w: 28, h: 14 });
  }
  addProp(world, 'arch', 2110, 1010, { scale: .9 }, { x: -80, y: -12, w: 28, h: 16 });
  addProp(world, 'statue', 2110, 520, { color: '#77715f' }, { x: -26, y: -8, w: 52, h: 14 });
  addProp(world, 'bones', 2260, 820, { scale: 1.2 });
  addChest(world, 2300, 1010, { gold: 55, item: 'potion', equip: 'guardiana' });
  addOre(world, 1210, 1370, '#ffb05e');
  addOre(world, 1760, 1140, '#ffb05e');
  addOre(world, 2380, 1120, '#ffb05e');
  addFlower(world, 1040, 430, '#f0c96b');
  addFlower(world, 1190, 390, '#e8d39b');
  addFlower(world, 870, 760, '#f0c96b');

  // agua del lago (colisión aproximada)
  addSolid(world, 360, 1370, 760, 360, 'water');
  addSolid(world, 300, 1280, 120, 400, 'water');
  addSolid(world, 1020, 1250, 90, 160, 'water');

  addGate(world, 2650, 900, 'drakmor', { label: 'Puerta de Brasa', color: '#7d6a4d', glow: '#ffb35e' });
  addProp(world, 'banner', 2540, 920, { color: '#7c2f2f' });
  addProp(world, 'banner', 2760, 920, { color: '#7c2f2f' });

  // criaturas salvajes
  addWild(world, 'lumin', 1110, 430, { questTarget: true });
  addWild(world, 'musgoso', 1120, 1480);
  addWild(world, 'brumito', 500, 420);
  addWild(world, 'silex', 2020, 880);

  // enemigos
  addEnemy(world, 'gelmo', 1320, 1000);
  addEnemy(world, 'gelmo', 1440, 1110);
  addEnemy(world, 'gelmo', 1580, 940);
  addEnemy(world, 'lobo', 740, 640);
  addEnemy(world, 'lobo', 980, 560);
  addEnemy(world, 'lobo', 1320, 430);
  addEnemy(world, 'bandido', 1700, 980);
  addEnemy(world, 'bandido', 1850, 1180);
  addEnemy(world, 'caballero', 2260, 700, { scale: 1.05 });

  // decoración floral
  for (let i = 0; i < 26; i++) {
    const x = 300 + r() * 700, y = 300 + r() * 600;
    if (Math.hypot(x - 1110, y - 430) < 200) addProp(world, 'flower', x, y, { color: r() > .5 ? '#e8d39b' : '#b9cce0' });
  }
}

function buildDrakmor(world, r) {
  addProp(world, 'tent', 430, 680, { color: '#5b3c30' }, { x: -48, y: -8, w: 96, h: 16 });
  addProp(world, 'brazier', 330, 700, { color: '#ff8a3e' });
  addProp(world, 'brazier', 560, 650, { color: '#ff8a3e' });
  addNpc(world, 'nyx', 470, 720, { marker: '!' });
  addProp(world, 'banner', 640, 780, { color: '#8f3f2f' });
  addProp(world, 'banner', 1710, 620, { color: '#8f3f2f' });
  addProp(world, 'lore', 560, 610, { loreId: 'lore3', read: false }, { x: -14, y: -20, w: 28, h: 20 });
  addProp(world, 'lore', 2130, 1280, { loreId: 'lore4', read: false }, { x: -14, y: -20, w: 28, h: 20 });
  addProp(world, 'statue', 1940, 520, { color: '#5c4a42' }, { x: -26, y: -8, w: 52, h: 14 });
  addProp(world, 'statue', 2260, 520, { color: '#5c4a42' }, { x: -26, y: -8, w: 52, h: 14 });
  addProp(world, 'arch', 2040, 1140, { scale: 1.1, color: '#5b4a40' }, { x: -80, y: -12, w: 28, h: 16 });
  for (const [x, y] of [[1790, 600], [1790, 900], [2360, 600], [2360, 900]]) {
    addProp(world, 'ruinPillar', x, y, { scale: 1.3, color: '#5a4a42', broken: r() > .5 }, { x: -16, y: -8, w: 32, h: 16 });
  }
  for (let i = 0; i < 16; i++) {
    addProp(world, 'lavaVent', 300 + r() * 2100, 120 + r() * 1550, { scale: .5 + r() * .8 });
  }
  addChest(world, 1120, 430, { gold: 70, item: 'ether', equip: 'manto' });
  addChest(world, 2380, 1370, { gold: 90, item: 'potion' });
  addOre(world, 520, 1120, '#ffb05e');
  addOre(world, 1280, 1420, '#ff8a55');
  addOre(world, 1730, 1260, '#ffb05e');
  addProp(world, 'bones', 900, 1250, { scale: 1.3 });
  addProp(world, 'bones', 1450, 980, { scale: 1.1 });

  addGate(world, 100, 920, 'valdoria', { label: 'Sendero de Ceniza', color: '#6b5548', glow: '#ffb35e' });
  addGate(world, 2510, 520, 'kansordore', { label: 'Portal de Ceniza', color: '#7a6a5a', glow: '#d9c7ff' });

  // lava: ríos con puentes
  addSolid(world, 770, 0, 100, 840, 'lava');
  addSolid(world, 770, 950, 100, 850, 'lava');
  addSolid(world, 1570, 0, 80, 640, 'lava');
  addSolid(world, 1570, 720, 80, 1080, 'lava');
  // fortaleza
  addSolid(world, 1810, 500, 30, 240, 'wall');
  addSolid(world, 1810, 860, 30, 260, 'wall');
  addSolid(world, 2300, 500, 30, 240, 'wall');
  addSolid(world, 2300, 860, 30, 260, 'wall');
  addSolid(world, 1810, 500, 520, 28, 'wall');

  addWild(world, 'chispa', 620, 1060);
  addWild(world, 'niebla', 1220, 1240);
  addWild(world, 'cinereo', 1440, 500);
  addWild(world, 'vortex', 2320, 380);

  addEnemy(world, 'sabueso', 1000, 1000);
  addEnemy(world, 'sabueso', 1180, 760);
  addEnemy(world, 'sabueso', 1420, 1080);
  addEnemy(world, 'golem', 1100, 520);
  addEnemy(world, 'golem', 1300, 1380);
  addEnemy(world, 'caballero', 1900, 700);
  addEnemy(world, 'caballero', 2180, 980);
  addEnemy(world, 'sabueso', 2280, 1100);
}

function buildKansordore(world, r) {
  addNpc(world, 'solen', 500, 720, { marker: '!' });
  addProp(world, 'statue', 700, 940, { color: '#8f8fa1' }, { x: -26, y: -8, w: 52, h: 14 });
  addProp(world, 'statue', 1300, 840, { color: '#8f8fa1' }, { x: -26, y: -8, w: 52, h: 14 });
  addProp(world, 'brazier', 620, 800, { color: '#b9d8ff' });
  addProp(world, 'brazier', 1000, 1040, { color: '#b9d8ff' });
  addProp(world, 'lore', 980, 480, { loreId: 'lore5', read: false }, { x: -14, y: -20, w: 28, h: 20 });
  addProp(world, 'lore', 1770, 1220, { loreId: 'lore6', read: false }, { x: -14, y: -20, w: 28, h: 20 });
  addProp(world, 'arch', 1410, 620, { scale: 1.1, color: '#77758a' }, { x: -80, y: -12, w: 28, h: 16 });
  for (const [x, y] of [[1690, 500], [1690, 960], [2290, 500], [2290, 960], [1990, 450]]) {
    addProp(world, 'ruinPillar', x, y, { scale: 1.4, color: '#8a899d', broken: false }, { x: -18, y: -8, w: 36, h: 16 });
  }
  addChest(world, 1450, 1380, { gold: 110, item: 'potion', equip: 'egida' });
  addChest(world, 2250, 250, { gold: 90, item: 'ether' });
  addOre(world, 1100, 1120, '#b9d8ff');
  addOre(world, 1850, 1420, '#d7c4ff');
  addFlower(world, 880, 980, '#b9d8ff');
  addFlower(world, 1160, 700, '#e8d39b');
  addFlower(world, 1540, 1100, '#b9d8ff');

  // sellos
  addProp(world, 'seal', 720, 600, { on: false, color: '#ffe2a1', sealIndex: 0 }, { x: -20, y: -8, w: 40, h: 14 });
  addProp(world, 'seal', 1210, 1250, { on: false, color: '#a6e5e1', sealIndex: 1 }, { x: -20, y: -8, w: 40, h: 14 });
  addProp(world, 'seal', 1850, 1180, { on: false, color: '#d4c2ff', sealIndex: 2 }, { x: -20, y: -8, w: 40, h: 14 });

  addGate(world, 100, 930, 'drakmor', { label: 'Regreso a Drakmor', color: '#6f6a7a', glow: '#b9d8ff' });

  addWild(world, 'custodio', 1460, 1040);
  addWild(world, 'serafin', 2080, 520);
  addWild(world, 'eco', 1510, 420);

  addEnemy(world, 'centinela', 800, 880);
  addEnemy(world, 'centinela', 1120, 620);
  addEnemy(world, 'centinela', 1350, 1120);
  addEnemy(world, 'caballero', 1650, 880);
  addEnemy(world, 'golem', 2050, 1080);
  addEnemy(world, 'centinela', 1980, 300);
}

function ensureBoss(world) {
  if (!world) return;
  const id = world.regionId;
  if (id === 'valdoria' && S.stage === 2 && !S.flags.guardianDefeated && !world.enemies.some(e => e.typeId === 'guardian')) {
    const b = addEnemy(world, 'guardian', 2140, 760);
    b.intro = 1;
    world.bossSpawned = true;
    S.boss = b;
  }
  if (id === 'drakmor' && S.stage === 4 && !S.flags.forjaDefeated && !world.enemies.some(e => e.typeId === 'forja')) {
    const b = addEnemy(world, 'forja', 2090, 830);
    b.intro = 1;
    world.bossSpawned = true;
    S.boss = b;
  }
  if (id === 'kansordore' && S.stage >= 6 && S.seals.every(Boolean) && !S.flags.vaelDefeated && !world.enemies.some(e => e.typeId === 'vael')) {
    const b = addEnemy(world, 'vael', 1990, 700);
    b.intro = 1;
    world.bossSpawned = true;
    S.boss = b;
  }
  if (!S.boss) S.boss = world.enemies.find(e => e.boss && !e.dead) || null;
}

// ---------------- Colisiones ----------------
function canMove(x, y, r) {
  if (!S.world) return false;
  if (x < 20 || y < 20 || x > S.world.region.width - 20 || y > S.world.region.height - 20) return false;
  for (const s of S.world.solids) {
    if (circleRect(x, y, r, s)) return false;
  }
  return true;
}
function moveWithCollision(e, dx, dy) {
  const r = e.radius || 14;
  let nx = e.x + dx;
  if (canMove(nx, e.y, r)) e.x = nx;
  let ny = e.y + dy;
  if (canMove(e.x, ny, r)) e.y = ny;
}

// ---------------- Cámara ----------------
function updateCamera(dt) {
  const p = S.player;
  if (!p) return;
  const viewW = S.w / S.camera.zoom, viewH = S.h / S.camera.zoom;
  const lookX = (p.dir?.x || 0) * 36, lookY = (p.dir?.y || 0) * 26;
  const targetX = p.x + lookX, targetY = p.y - 20 + lookY;
  S.camera.x = lerp(S.camera.x, targetX, 1 - Math.pow(.002, dt));
  S.camera.y = lerp(S.camera.y, targetY, 1 - Math.pow(.002, dt));
  if (viewW < S.world.region.width) S.camera.x = clamp(S.camera.x, viewW / 2, S.world.region.width - viewW / 2);
  else S.camera.x = S.world.region.width / 2;
  if (viewH < S.world.region.height) S.camera.y = clamp(S.camera.y, viewH / 2, S.world.region.height - viewH / 2);
  else S.camera.y = S.world.region.height / 2;
  S.camera.shake = Math.max(0, S.camera.shake - dt * 38);
  const sh = S.camera.shake;
  S.camera.shakeX = (Math.random() - .5) * sh * 2;
  S.camera.shakeY = (Math.random() - .5) * sh * 2;
}

// ---------------- Efectos ----------------
function addParticle(x, y, vx, vy, life, color, size = 2, kind = 'spark', gravity = 0) {
  if (S.particles.length > 520) S.particles.shift();
  S.particles.push({ x, y, vx, vy, life, max: life, color, size, kind, gravity });
}
function spawnBurst(x, y, color, count = 10, speed = 100, kind = 'spark') {
  for (let i = 0; i < count; i++) {
    const a = rand(TAU), s = rand(speed, speed * .2);
    addParticle(x, y, Math.cos(a) * s, Math.sin(a) * s, rand(.7, .25), color, rand(3.4, 1), kind, kind === 'ember' ? 80 : 0);
  }
}
function addFloater(x, y, text, color = '#fff', crit = false, kind = '') {
  S.floaters.push({ x: x + rand(10, -10), y, text, color, crit, kind, life: 1, max: 1 });
  if (S.floaters.length > 30) S.floaters.shift();
}
function addRing(x, y, r0, r1, color, life = .5, width = 2) {
  S.rings.push({ x, y, r0, r1, color, life, max: life, width });
}
function addBeam(x, y, angle, length, width, color, life = .3) {
  S.beams.push({ x, y, angle, length, width, color, life, max: life });
}
function addProjectile(opts) {
  S.projectiles.push({ x: 0, y: 0, vx: 0, vy: 0, r: 7, life: 2, color: '#fff', damage: 10, owner: 'enemy', kind: 'orb', ...opts });
}
function addTelegraph(x, y, r, life, color = '#ff6b6b', kind = 'circle') {
  S.telegraphs.push({ x, y, r, life, max: life, color, kind });
}

function updateEffects(dt) {
  for (const p of S.particles) {
    p.life -= dt;
    p.x += p.vx * dt; p.y += p.vy * dt;
    p.vx *= 1 - dt * 2.2; p.vy *= 1 - dt * 2.2; p.vy += p.gravity * dt;
  }
  S.particles = S.particles.filter(p => p.life > 0);
  for (const f of S.floaters) { f.life -= dt; f.y -= dt * 38; }
  S.floaters = S.floaters.filter(f => f.life > 0);
  for (const r of S.rings) r.life -= dt;
  S.rings = S.rings.filter(r => r.life > 0);
  for (const b of S.beams) b.life -= dt;
  S.beams = S.beams.filter(b => b.life > 0);
  for (const t of S.telegraphs) t.life -= dt;
  S.telegraphs = S.telegraphs.filter(t => t.life > 0);
  for (const pr of S.projectiles) {
    pr.life -= dt;
    pr.x += pr.vx * dt; pr.y += pr.vy * dt;
    if (pr.owner === 'player') {
      for (const e of S.world.enemies) {
        if (!e.dead && Math.hypot(e.x - pr.x, e.y - pr.y) < e.radius + pr.r) {
          damageEnemy(e, pr.damage, { color: pr.color, knock: 40 });
          pr.life = 0; break;
        }
      }
    } else {
      if (Math.hypot(S.player.x - pr.x, S.player.y - pr.y) < S.player.radius + pr.r) {
        damagePlayer(pr.damage, { color: pr.color });
        pr.life = 0;
      }
    }
  }
  S.projectiles = S.projectiles.filter(pr => pr.life > 0);
}

// ---------------- Combate ----------------
function attackAngleOf(p) {
  const d = p.dir || { x: 0, y: 1 };
  if (Math.abs(d.x) > Math.abs(d.y)) return d.x > 0 ? 0 : Math.PI;
  return d.y > 0 ? Math.PI / 2 : -Math.PI / 2;
}

function playerAttack() {
  const p = S.player;
  if (!p || S.mode !== 'playing') return;
  if (p.dodgeTimer > 0 || p.attackTimer > 0 || p.stun > 0) return;
  if (p.stam < 4) { showToast('Sin resistencia', 'danger', 900); return; }
  if (p.comboTimer > 0) p.combo = (p.combo + 1) % 3; else p.combo = 0;
  p.comboTimer = .62;
  p.attackTimer = .32;
  p.attackAnim = .001;
  p.attackHit = false;
  p.attackAngle = attackAngleOf(p);
  p.stam = Math.max(0, p.stam - 4);
  audio.attack(p.combo);
}
function playerDodge() {
  const p = S.player;
  if (!p || S.mode !== 'playing' || p.dodgeCooldown > 0 || p.dodgeTimer > 0) return;
  if (p.stam < 22) { showToast('Sin resistencia para esquivar', 'danger', 800); return; }
  let dx = p.dir.x, dy = p.dir.y;
  const ix = inputX(), iy = inputY();
  if (ix || iy) { const l = Math.hypot(ix, iy); dx = ix / l; dy = iy / l; }
  p.dodgeDir = { x: dx, y: dy };
  p.dodgeTimer = .34; p.dodgeCooldown = .72; p.invuln = .42;
  p.stam = Math.max(0, p.stam - 22);
  p.attackTimer = 0; p.attackAnim = 0;
  audio.dodge();
  spawnBurst(p.x, p.y - 10, '#cfe8ff', 8, 80, 'dust');
}
function playerSkill() {
  const p = S.player;
  if (!p || S.mode !== 'playing') return;
  if (p.skillCooldown > 0) return;
  const cost = 18;
  if (p.mana < cost) { showToast('Maná insuficiente', 'danger', 900); audio.error(); return; }
  p.mana -= cost; p.skillCooldown = 5.2; p.cast = .6;
  const angle = attackAngleOf(p);
  const range = 300;
  const color = '#b9d8ff';
  addBeam(p.x, p.y - 30, angle, range, 38, color, .38);
  audio.skill();
  S.camera.shake = 6;
  for (const e of S.world.enemies) {
    if (e.dead) continue;
    const d = Math.hypot(e.x - p.x, e.y - p.y);
    if (d > range + e.radius) continue;
    const a = Math.atan2(e.y - p.y, e.x - p.x);
    if (Math.abs(angleDiff(a, angle)) < .38) {
      const dmg = Math.round(p.atk * 1.6 + p.stats.inteligencia * 3 + p.resPower * .18);
      damageEnemy(e, dmg, { crit: Math.random() * 100 < p.crit + 10, color, knock: 90, skill: true });
    }
  }
  for (const w of S.world.wilds) {
    if (w.captured) continue;
    const d = Math.hypot(w.x - p.x, w.y - p.y);
    if (d < range) {
      const a = Math.atan2(w.y - p.y, w.x - p.x);
      if (Math.abs(angleDiff(a, angle)) < .38) damageWild(w, Math.round(p.atk * 1.3), color);
    }
  }
  for (let i = 0; i < 26; i++) {
    const d = rand(range);
    addParticle(p.x + Math.cos(angle) * d, p.y - 30 + Math.sin(angle) * d, rand(30, -30), rand(20, -20), rand(.6, .2), color, rand(3, 1), 'spark');
  }
  addRing(p.x, p.y - 20, 20, 70, color, .4, 3);
}
function playerResonance() {
  const p = S.player;
  if (!p || S.mode !== 'playing' || p.resonanceCooldown > 0) return;
  p.resonanceCooldown = 2.4;
  const wild = S.world.wilds
    .filter(w => !w.captured && Math.hypot(w.x - p.x, w.y - p.y) < 150)
    .sort((a, b) => Math.hypot(a.x - p.x, a.y - p.y) - Math.hypot(b.x - p.x, b.y - p.y))[0];
  if (wild) {
    if (wild.hp / wild.maxHp > .36 && !wild.questTarget) {
      showToast('La criatura aún resiste. Debilítala antes de invocar la Resonancia.', 'danger', 2200);
      audio.error();
      addRing(wild.x, wild.y - 20, 20, 60, '#ffd6a0', .4, 2);
      return;
    }
    attemptCapture(wild);
    return;
  }
  if (p.mana < 12) { showToast('Maná insuficiente', 'danger', 900); audio.error(); return; }
  p.mana -= 12;
  addRing(p.x, p.y - 20, 20, 160, '#ffe2a1', .6, 4);
  audio.skill();
  for (const e of S.world.enemies) {
    if (!e.dead && Math.hypot(e.x - p.x, e.y - p.y) < 170) {
      damageEnemy(e, Math.round(p.atk * .6 + p.resPower * .25), { color: '#ffe2a1', knock: 70, slow: 1.5 });
    }
  }
  for (const w of S.world.wilds) if (!w.captured && Math.hypot(w.x - p.x, w.y - p.y) < 170) damageWild(w, Math.round(p.atk * .4), '#ffe2a1');
}
function usePotion() {
  const p = S.player; if (!p) return;
  if (p.potionCooldown > 0) return;
  if ((p.inventory.potion || 0) <= 0) { showToast('No quedan elixires de Lumen', 'danger', 900); audio.error(); return; }
  p.inventory.potion--; p.potionCooldown = 1.1;
  healPlayer(55); audio.heal();
  showToast('Elixir de Lumen · +55 vida', 'blue', 1200);
}
function useEther() {
  const p = S.player; if (!p) return;
  if ((p.inventory.ether || 0) <= 0) { showToast('No queda esencia de Velo', 'danger', 900); audio.error(); return; }
  p.inventory.ether--; p.mana = Math.min(p.maxMana, p.mana + 38);
  audio.mana(); addFloater(p.x, p.y - 65, '+38 MP', '#8cc8ff', false, 'mana');
  showToast('Esencia de Velo · +38 maná', 'blue', 1200);
}

function damageEnemy(e, amount, opts = {}) {
  if (e.dead) return;
  const p = S.player;
  let crit = !!opts.crit;
  if (!crit && !opts.noCrit) crit = Math.random() * 100 < p.crit;
  let dmg = Math.max(1, Math.round(amount * (crit ? 1.65 : 1) * rand(1.08, .94)));
  e.hp -= dmg;
  e.hurt = .16;
  e.knockX += (opts.knock || 30) * Math.cos(e.attackAngle || 0);
  e.knockY += (opts.knock || 30) * Math.sin(e.attackAngle || 0);
  if (opts.slow) e.slow = Math.max(e.slow, opts.slow);
  if (opts.stun) e.stun = Math.max(e.stun, opts.stun);
  const color = opts.color || (crit ? '#ffd76e' : '#fff4dd');
  if (S.settings.damage) addFloater(e.x, e.y - (e.boss ? 90 : 48), `${crit ? '✦ ' : ''}${dmg}`, color, crit);
  spawnBurst(e.x, e.y - 20, opts.color || '#ffcf87', crit ? 16 : 8, crit ? 180 : 110, 'spark');
  addRing(e.x, e.y - 18, 6, crit ? 42 : 24, opts.color || '#ffe2a1', .24, 2);
  audio.hit(crit);
  S.camera.shake = Math.max(S.camera.shake, crit ? 8 : 4);
  S.hitStop = Math.max(S.hitStop, crit ? .075 : .04);
  if (e.hp <= 0) killEnemy(e);
}

function damageWild(w, amount, color = '#fff4dd') {
  if (w.captured) return;
  const dmg = Math.max(1, Math.round(amount));
  w.hp = Math.max(0, w.hp - dmg);
  w.hurt = .2;
  if (S.settings.damage) addFloater(w.x, w.y - 45, `${dmg}`, color, false);
  spawnBurst(w.x, w.y - 18, color, 7, 80, 'spark');
  audio.hit(false);
  if (w.hp <= 0) { w.hp = 1; w.captured = true; showToast(`${CREATURE_BY_ID[w.creatureId].name} ha desaparecido entre la luz. La próxima vez, usa Resonancia antes de herirla tanto.`, 'danger', 3400); }
}

function damagePlayer(amount, opts = {}) {
  const p = S.player;
  if (!p || p.invuln > 0 || p.dodgeTimer > 0) return;
  let dmg = amount * (13 / (13 + p.def * .85));
  if (p.block) {
    dmg *= .28;
    p.stam = Math.max(0, p.stam - 12);
    audio.block();
    addFloater(p.x, p.y - 60, 'BLOQUEO', '#9fd8ff', false, 'block');
    addRing(p.x, p.y - 25, 24, 44, '#b9d8ff', .3, 3);
  } else {
    audio.hurt();
  }
  if (p.shield > 0) {
    p.shield = Math.max(0, p.shield - dmg);
    dmg *= .3;
    addFloater(p.x, p.y - 70, 'ESCUDO', '#ffe2a1', false, 'block');
  }
  dmg = Math.max(1, Math.round(dmg * rand(1.05, .95)));
  p.hp -= dmg;
  p.hurt = .22;
  p.invuln = .5;
  S.camera.shake = Math.max(S.camera.shake, 7);
  S.hitStop = Math.max(S.hitStop, .04);
  if (S.settings.damage) addFloater(p.x, p.y - 64, `-${dmg}`, '#ff9b9b', false, 'hurt');
  spawnBurst(p.x, p.y - 30, '#e86161', 10, 100, 'blood');
  if (p.hp <= 0) playerDeath();
}

function playerDeath() {
  const p = S.player;
  p.hp = 0;
  S.deathCount++;
  S.mode = 'dying';
  S.deadTimer = 1.8;
  audio.death();
  S.camera.shake = 16;
  addRing(p.x, p.y - 20, 10, 160, '#e86161', 1, 5);
  showToast('La Espada te sostiene. Despiertas junto al último santuario.', 'danger', 3000);
  if (S.boss) {
    S.boss.difficultyGrace = (S.boss.difficultyGrace || 0) + 1;
    if (S.boss.difficultyGrace >= 3) {
      S.boss.atk *= .86;
      showToast('La Espada recuerda tu esfuerzo. La furia del guardián disminuye.', 'blue', 2800);
    }
  }
}
function respawnPlayer() {
  const p = S.player;
  const shrine = S.flags.lastShrine;
  if (shrine && shrine.region === S.regionId) {
    p.x = shrine.x; p.y = shrine.y + 60;
  } else {
    p.x = REGIONS[S.regionId].spawn.x; p.y = REGIONS[S.regionId].spawn.y;
  }
  p.hp = p.maxHp; p.mana = p.maxMana; p.stam = p.maxStam;
  p.invuln = 1.5; p.hurt = 0; p.block = false;
  S.mode = 'playing';
  S.camera.x = p.x; S.camera.y = p.y;
  updateCamera(0);
  updateHUD(true);
}

function killEnemy(e) {
  if (e.dead) return;
  e.dead = true;
  e.deathTimer = .8;
  e.hp = 0;
  e.state = 'dead';
  const p = S.player;
  p.kills++;
  const def = e.type;
  const xp = Math.round(def.xp * (e.elite ? 1.4 : 1));
  gainXp(xp);
  const gold = Math.round(rand(def.gold[1], def.gold[0]) * (e.elite ? 1.3 : 1));
  gainGold(gold);
  spawnBurst(e.x, e.y - 25, e.type.accent, e.boss ? 50 : 18, e.boss ? 220 : 120, 'ember');
  addRing(e.x, e.y - 20, 10, e.boss ? 220 : 80, e.type.accent, e.boss ? 1 : .5, e.boss ? 5 : 2);
  audio.hit(true);
  S.camera.shake = e.boss ? 18 : 5;
  if (!e.boss && Math.random() < .16) {
    p.inventory.potion = (p.inventory.potion || 0) + 1;
    showToast('Has encontrado un Elixir de Lumen.', 'blue', 1400);
  }
  if (!e.boss) {
    e.respawn = 26 + Math.random() * 18;
    // pequeño orbe de memoria
    addParticle(e.x, e.y - 25, 0, -30, 1.4, '#b9d8ff', 4, 'orb');
  }
  if (e.boss) {
    S.boss = null;
    if (e.typeId === 'guardian') {
      S.flags.guardianDefeated = true;
      addEquipment('lagrima');
      addEquipment('guardiana');
      p.materials.lagrima = 1;
      showToast('Has obtenido: Lágrima de la Primera Brasa', 'gold', 3600);
      setStage(3);
      playCinematic('lagrima', () => {
        showToast('La Puerta de Brasa ha despertado al este de Valdoria.', 'gold', 3200);
      });
    } else if (e.typeId === 'forja') {
      S.flags.forjaDefeated = true;
      addEquipment('obsidiana');
      addEquipment('manto');
      p.materials.core = 1;
      showToast('Has obtenido: Núcleo de Forja y Filo de Obsidiana', 'gold', 3600);
      setStage(5);
      playCinematic('forja', () => {
        showToast('El Portal de Ceniza se ha abierto. Kansordore te espera.', 'gold', 3200);
      });
    } else if (e.typeId === 'vael') {
      S.flags.vaelDefeated = true;
      setStage(7);
      if (p.creatures.length >= 11) {
        p.creatures.push('primigenio'); p.captured++;
        showToast('Primigenio ha reconocido tu Vínculo.', 'gold', 3500);
      }
      playCinematic('vael_reveal', () => showFinalChoice());
    }
  }
  updateHUD(true);
  saveGame(true);
}

function addEquipment(id) {
  const p = S.player;
  if (!p.owned.includes(id)) p.owned.push(id);
  const pool = [...WEAPONS, ...ARMORS, ...HELMETS, ...CHARMS];
  const item = pool.find(i => i.id === id);
  if (item) showToast(`Nuevo equipo: ${item.name}`, 'gold', 2600);
}

// ---------------- Enemigos ----------------
function enemyAttack(e) {
  const p = S.player;
  const def = e.type;
  const d = Math.hypot(p.x - e.x, p.y - e.y);
  const angle = Math.atan2(p.y - e.y, p.x - e.x);
  if (d < def.attackRange + 25) {
    if (e.boss) {
      damagePlayer(e.atk * (e.phase > 1 ? 1.1 : 1), {});
    } else if (Math.abs(angleDiff(angle, e.attackAngle)) < 1.15) {
      damagePlayer(e.atk);
    }
  }
  if (e.boss) {
    addRing(e.x, e.y - 30, 20, 120, e.type.accent, .45, 4);
    spawnBurst(e.x + Math.cos(angle) * 45, e.y - 20 + Math.sin(angle) * 45, e.type.accent, 14, 140, 'ember');
  } else {
    addBeam(e.x, e.y - 22, e.attackAngle, def.attackRange + 20, 10, e.type.accent, .18);
  }
}

function bossSpecial(e) {
  const p = S.player;
  const angle = Math.atan2(p.y - e.y, p.x - e.x);
  if (e.typeId === 'guardian') {
    // onda de choque
    addTelegraph(e.x, e.y - 10, 170, .7, '#ffcf87', 'shock');
    addRing(e.x, e.y - 10, 20, 170, '#ffcf87', .75, 5);
    S.camera.shake = 10;
    setTimeout(() => {
      if (e.dead) return;
      if (Math.hypot(p.x - e.x, p.y - e.y) < 185) damagePlayer(e.atk * 1.2);
    }, 620);
  } else if (e.typeId === 'forja') {
    // erupciones + proyectiles
    for (let i = 0; i < 3; i++) {
      const px = p.x + rand(140, -140), py = p.y + rand(110, -110);
      addTelegraph(px, py, 48, .9, '#ff6b3d', 'circle');
      setTimeout(() => {
        if (e.dead) return;
        addRing(px, py, 8, 52, '#ff7b45', .4, 4);
        spawnBurst(px, py, '#ff8a55', 18, 150, 'ember');
        if (Math.hypot(p.x - px, p.y - py) < 60) damagePlayer(e.atk * 1.15);
      }, 850);
    }
    for (let i = 0; i < 6; i++) {
      const a = angle + i * TAU / 6;
      addProjectile({ x: e.x, y: e.y - 30, vx: Math.cos(a) * 190, vy: Math.sin(a) * 190, r: 9, life: 2.4, color: '#ff7b45', damage: e.atk * .85, owner: 'enemy', kind: 'ember' });
    }
  } else if (e.typeId === 'vael') {
    if (e.phase === 1) {
      addTelegraph(p.x, p.y, 70, 1, '#c3b3f0', 'circle');
      setTimeout(() => {
        if (e.dead) return;
        addRing(p.x, p.y, 10, 78, '#c3b3f0', .5, 5);
        spawnBurst(p.x, p.y, '#c3b3f0', 26, 160, 'spark');
        if (Math.hypot(p.x - e.x, p.y - e.y) < 420) damagePlayer(e.atk * 1.1);
      }, 950);
    } else {
      for (let i = 0; i < 8; i++) {
        const a = angle + i * TAU / 8;
        addProjectile({ x: e.x, y: e.y - 30, vx: Math.cos(a) * 220, vy: Math.sin(a) * 220, r: 8, life: 2.2, color: '#e7d7ff', damage: e.atk * .8, owner: 'enemy', kind: 'void' });
      }
      if (e.phase >= 2 && Math.random() < .5) {
        const px = p.x + rand(100, -100), py = p.y + rand(100, -100);
        addTelegraph(px, py, 46, .7, '#e7d7ff');
        setTimeout(() => {
          if (e.dead) return;
          addRing(px, py, 5, 50, '#e7d7ff', .4, 4);
          if (Math.hypot(p.x - px, p.y - py) < 60) damagePlayer(e.atk * .9);
        }, 680);
      }
    }
  }
}

function updateEnemies(dt) {
  const p = S.player;
  for (const e of S.world.enemies) {
    if (e.dead) {
      e.deathTimer -= dt;
      if (!e.boss && e.respawn > 0) {
        e.respawn -= dt;
        if (e.respawn <= 0) {
          e.dead = false; e.hp = e.maxHp; e.x = e.home.x; e.y = e.home.y; e.state = 'idle'; e.stateTimer = 1; e.deathTimer = 0; e.hurt = 0;
        }
      }
      continue;
    }
    e.hurt = Math.max(0, e.hurt - dt);
    e.slow = Math.max(0, e.slow - dt);
    e.stun = Math.max(0, e.stun - dt);
    e.burn = Math.max(0, e.burn - dt);
    e.intro = Math.max(0, e.intro - dt);
    const dx = p.x - e.x, dy = p.y - e.y;
    const d = Math.hypot(dx, dy);
    const def = e.type;
    if (e.stun > 0) { e.moving = false; continue; }
    // knockback
    if (Math.abs(e.knockX) + Math.abs(e.knockY) > 1) {
      moveWithCollision(e, e.knockX * dt, e.knockY * dt);
      e.knockX *= 1 - dt * 8; e.knockY *= 1 - dt * 8;
    }
    if (e.boss && d < 900) {
      e.specialTimer -= dt;
      if (e.specialTimer <= 0) {
        e.specialTimer = e.phase >= 2 ? 3.6 : 5.2;
        bossSpecial(e);
        S.camera.shake = 8;
      }
      if (e.hp / e.maxHp < .66 && e.phase < 2) { e.phase = 2; showToast(`${def.name} cambia de fase`, 'danger', 2000); audio.boss(); }
      if (e.hp / e.maxHp < .33 && e.phase < 3) { e.phase = 3; showToast(`${def.name} desata su verdad`, 'danger', 2000); audio.boss(); }
    }
    if (e.state === 'windup') {
      e.stateTimer -= dt;
      e.moving = false;
      if (e.stateTimer <= 0) {
        enemyAttack(e);
        e.state = 'recover';
        e.stateTimer = def.cooldown * (e.boss ? .8 : 1);
      }
      continue;
    }
    if (e.state === 'recover') {
      e.stateTimer -= dt;
      e.moving = false;
      if (e.stateTimer <= 0) e.state = 'chase';
      continue;
    }
    if (d < e.aggro && d > 2) {
      e.state = 'chase';
      e.facing = dx < 0 ? 'left' : 'right';
      e.attackAngle = Math.atan2(dy, dx);
      const reach = def.attackRange * (e.boss ? 1.08 : 1);
      if (d < reach) {
        e.state = 'windup';
        e.stateTimer = e.boss ? .52 : .48;
        e.windup = 1;
        if (e.boss) addRing(e.x, e.y - 30, 20, reach + 18, def.accent, .5, 3);
      } else {
        const speed = def.speed * (e.slow > 0 ? .45 : 1) * (e.boss ? 1 : 1);
        moveWithCollision(e, (dx / d) * speed * dt, (dy / d) * speed * dt);
        e.moving = true;
      }
    } else {
      e.moving = false;
      if (e.state === 'idle') {
        e.stateTimer -= dt;
        if (e.stateTimer <= 0) { e.stateTimer = rand(4, 2); e.wanderAngle = rand(TAU); }
        if (e.stateTimer < 1.5) {
          const wx = e.home.x + Math.cos(e.wanderAngle || 0) * 12;
          const wy = e.home.y + Math.sin(e.wanderAngle || 0) * 8;
          const ddx = wx - e.x, ddy = wy - e.y;
          if (Math.hypot(ddx, ddy) > 4) { moveWithCollision(e, ddx * dt * .7, ddy * dt * .7); e.moving = true; e.facing = ddx < 0 ? 'left' : 'right'; }
        }
      }
    }
    // separación
    for (const o of S.world.enemies) {
      if (o === e || o.dead) continue;
      const od = Math.hypot(o.x - e.x, o.y - e.y);
      const min = e.radius + o.radius;
      if (od > 0 && od < min) {
        moveWithCollision(e, (e.x - o.x) / od * (min - od) * .5, (e.y - o.y) / od * (min - od) * .5);
      }
    }
  }
  // criatura activa
  updateCompanion(dt);
}

function updateCompanion(dt) {
  const p = S.player;
  if (!p.activeCreature) return;
  const def = CREATURE_BY_ID[p.activeCreature];
  if (!def) return;
  if (!p.companion) p.companion = { x: p.x - 40, y: p.y, t: 0, attack: 0, phase: 0 };
  const c = p.companion;
  c.t += dt;
  const targetX = p.x - (p.facing === 'left' ? -36 : 36);
  const targetY = p.y - 18 + Math.sin(c.t * 1.4) * 8;
  c.x = lerp(c.x, targetX, 1 - Math.pow(.001, dt));
  c.y = lerp(c.y, targetY, 1 - Math.pow(.001, dt));
  c.attack -= dt;
  if (c.attack <= 0) {
    const target = S.world.enemies
      .filter(e => !e.dead && Math.hypot(e.x - c.x, e.y - c.y) < 280)
      .sort((a, b) => Math.hypot(a.x - c.x, a.y - c.y) - Math.hypot(b.x - c.x, b.y - c.y))[0];
    if (target) {
      c.attack = 2.8;
      addProjectile({ x: c.x, y: c.y - 16, vx: (target.x - c.x) * 1.7, vy: (target.y - c.y) * 1.7, r: 7, life: 1.4, color: def.color, damage: Math.round(8 + def.base.atk * .7 + p.level * .8), owner: 'player', kind: 'creature' });
      addRing(c.x, c.y - 10, 4, 18, def.color, .3, 2);
      audio.creature();
    }
  }
}

function useCreatureAbility() {
  const p = S.player;
  if (!p.activeCreature) { showToast('No hay una criatura vinculada.', 'danger', 1200); return; }
  const def = CREATURE_BY_ID[p.activeCreature];
  const cd = p.creatureCooldowns[def.id] || 0;
  if (cd > 0) { showToast(`${def.ability} aún se está recuperando (${Math.ceil(cd)}s)`, 'danger', 1000); return; }
  p.creatureCooldowns[def.id] = def.cooldown;
  audio.creature();
  const pwr = 1 + p.level * .08 + p.resPower * .002;
  if (['lumin', 'niebla', 'cinereo', 'primigenio'].includes(def.id)) {
    const radius = def.id === 'primigenio' ? 260 : 170;
    addRing(p.x, p.y - 20, 15, radius, def.color, .8, 5);
    for (const e of S.world.enemies) {
      if (!e.dead && Math.hypot(e.x - p.x, e.y - p.y) < radius) {
        damageEnemy(e, Math.round((def.base.atk * 2 + p.level * 2) * pwr), { color: def.color, knock: 80, slow: def.id === 'lumin' ? 2 : 0, stun: def.id === 'primigenio' ? 1.5 : 0 });
      }
    }
    if (def.id === 'niebla') for (const e of S.world.enemies) if (!e.dead && Math.hypot(e.x - p.x, e.y - p.y) < radius) e.knockX += 280;
  } else if (def.id === 'musgoso') {
    addRing(p.x, p.y - 20, 20, 190, def.color, .9, 4);
    for (const e of S.world.enemies) if (!e.dead && Math.hypot(e.x - p.x, e.y - p.y) < 190) e.stun = Math.max(e.stun, 2);
    showToast('Raíz viva · enemigos atrapados', 'blue', 1200);
  } else if (def.id === 'silex' || def.id === 'custodio') {
    p.shield = Math.max(p.shield, 40 + p.level * 5);
    showToast(`${def.ability} · escudo activo`, 'blue', 1400);
  } else if (def.id === 'brumito') {
    const angle = attackAngleOf(p);
    moveWithCollision(p, Math.cos(angle) * 140, Math.sin(angle) * 140);
    p.invuln = .4;
    addBeam(p.x, p.y - 25, angle, 130, 18, def.color, .3);
  } else if (def.id === 'chispa') {
    const angle = attackAngleOf(p);
    addProjectile({ x: p.x, y: p.y - 30, vx: Math.cos(angle) * 360, vy: Math.sin(angle) * 360, r: 10, life: 1.6, color: def.color, damage: Math.round((def.base.atk * 2.5 + p.level * 3) * pwr), owner: 'player', kind: 'ember' });
  } else if (def.id === 'vortex') {
    p.captureBuff = 8;
    showToast('Ojo del Velo · captura amplificada durante 8s', 'blue', 1800);
    addRing(p.x, p.y - 20, 20, 220, def.color, .8, 3);
  } else if (def.id === 'serafin') {
    healPlayer(Math.round(p.maxHp * .35));
    p.mana = Math.min(p.maxMana, p.mana + 25);
    addRing(p.x, p.y - 20, 20, 150, def.color, .8, 3);
  } else if (def.id === 'eco') {
    for (const e of S.world.enemies) if (!e.dead && Math.hypot(e.x - p.x, e.y - p.y) < 220) e.stun = Math.max(e.stun, 3);
    addRing(p.x, p.y - 20, 20, 220, def.color, 1, 4);
    showToast('Silencio · el tiempo se detiene', 'blue', 1800);
  }
  updateHUD(true);
}

// ---------------- Entrada ----------------
function inputX() {
  let x = 0;
  if (S.keys['a'] || S.keys['arrowleft']) x -= 1;
  if (S.keys['d'] || S.keys['arrowright']) x += 1;
  x += S.touchMove.x;
  return clamp(x, -1, 1);
}
function inputY() {
  let y = 0;
  if (S.keys['w'] || S.keys['arrowup']) y -= 1;
  if (S.keys['s'] || S.keys['arrowdown']) y += 1;
  y += S.touchMove.y;
  return clamp(y, -1, 1);
}
function bindInput() {
  addEventListener('keydown', e => {
    const k = e.key.toLowerCase();
    if ([' ', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'tab'].includes(k)) e.preventDefault();
    if (!audio.ctx) audio.init();
    if (S.mode === 'title') {
      if (k === 'enter' || k === ' ') { if (!e.repeat) newGame(); }
      return;
    }
    if (S.mode === 'creator') {
      if (k === 'escape') showTitle();
      return;
    }
    if (S.mode === 'dialogue') {
      if (k === 'enter' || k === ' ' || k === 'e') { if (!e.repeat) advanceDialogue(); }
      if (k === 'escape') advanceDialogue();
      return;
    }
    if (S.mode === 'cinematic') {
      if (k === 'escape') { if (!e.repeat) endCinematic(); }
      else if (k === 'enter' || k === ' ') { if (!e.repeat) advanceCinematic(); }
      return;
    }
    if (S.mode === 'paused' || S.mode === 'title-panel') {
      if (k === 'escape' || k === 'tab') { if (!e.repeat) closePanel(); }
      return;
    }
    if (S.mode === 'ending') return;
    if (S.mode === 'dying') return;
    if (S.mode !== 'playing') return;
    if (k === 'escape' || k === 'tab') { if (!e.repeat) openPanel(k === 'tab' ? 'quests' : 'hero'); return; }
    if (k === 'm') { if (!e.repeat) openPanel('map'); return; }
    if (e.repeat) return;
    switch (k) {
      case 'j': case ' ': playerAttack(); break;
      case 'k': case 'shift': playerDodge(); break;
      case 'r': playerResonance(); break;
      case 'q': playerSkill(); break;
      case 'c': useCreatureAbility(); break;
      case 'e': interact(); break;
      case '1': case 'h': usePotion(); break;
      case '2': useEther(); break;
      case 'l': S.blockHeld = true; break;
    }
  });
  addEventListener('keyup', e => {
    const k = e.key.toLowerCase();
    if (k === 'l') S.blockHeld = false;
    if (k === 'shift') S.blockHeld = false;
    if (k === 'a' || k === 'd' || k === 'w' || k === 's' || k === 'arrowleft' || k === 'arrowright' || k === 'arrowup' || k === 'arrowdown') S.keys[k] = false;
  });
  // teclas mantenidas
  addEventListener('keydown', e => { S.keys[e.key.toLowerCase()] = true; });
  // ratón / touch del canvas para iniciar audio
  canvas.addEventListener('pointerdown', () => { if (!audio.ctx) audio.init(); });
  // joystick
  const joy = $('#joystick'), knob = $('#joystick-knob');
  let joyId = null;
  const joyMove = ev => {
    const rect = joy.getBoundingClientRect();
    const cx = rect.left + rect.width / 2, cy = rect.top + rect.height / 2;
    let dx = ev.clientX - cx, dy = ev.clientY - cy;
    const max = rect.width * .32;
    const l = Math.hypot(dx, dy);
    if (l > max) { dx = dx / l * max; dy = dy / l * max; }
    S.touchMove.x = dx / max; S.touchMove.y = dy / max;
    knob.style.transform = `translate(${dx}px,${dy}px)`;
  };
  joy.addEventListener('pointerdown', ev => {
    ev.preventDefault(); joyId = ev.pointerId; joy.setPointerCapture(ev.pointerId); joyMove(ev); audio.init();
  });
  joy.addEventListener('pointermove', ev => { if (ev.pointerId === joyId) joyMove(ev); });
  const joyEnd = ev => { if (ev.pointerId === joyId) { joyId = null; S.touchMove.x = 0; S.touchMove.y = 0; knob.style.transform = ''; } };
  joy.addEventListener('pointerup', joyEnd); joy.addEventListener('pointercancel', joyEnd);
  // botones táctiles
  $$('.tbtn').forEach(btn => {
    const action = btn.dataset.action;
    btn.addEventListener('pointerdown', ev => {
      ev.preventDefault(); audio.init();
      if (action === 'attack') playerAttack();
      if (action === 'dodge') playerDodge();
      if (action === 'resonance') playerResonance();
      if (action === 'skill') playerSkill();
      if (action === 'creature') useCreatureAbility();
      if (action === 'interact') interact();
      if (action === 'pause') openPanel('hero');
      if (action === 'block') { S.blockHeld = true; btn.classList.add('pressed'); }
    });
    btn.addEventListener('pointerup', () => { if (action === 'block') { S.blockHeld = false; btn.classList.remove('pressed'); } });
    btn.addEventListener('pointercancel', () => { if (action === 'block') { S.blockHeld = false; btn.classList.remove('pressed'); } });
  });
  // menú principal
  $('#btn-new').addEventListener('click', () => { audio.init(); audio.ui(); newGame(); });
  $('#btn-continue').addEventListener('click', () => { audio.init(); audio.ui(); loadGame(); });
  $('#btn-collection-menu').addEventListener('click', () => { audio.init(); audio.ui(); openTitlePanel('collection'); });
  $('#btn-options-menu').addEventListener('click', () => { audio.init(); audio.ui(); openTitlePanel('options'); });
  $('#creator-back').addEventListener('click', () => { audio.uiBack(); showTitle(); });
  $('#btn-start-game').addEventListener('click', () => { audio.init(); audio.ui(); startNewGame(); });
  $('#cine-skip').addEventListener('click', () => { audio.ui(); endCinematic(); });
  $('#cinematic').addEventListener('click', e => { if (e.target.id !== 'cine-skip') advanceCinematic(); });
  $('#dialogue').addEventListener('click', e => {
    if (e.target.closest('.dialogue-choice')) return;
    advanceDialogue();
  });
  $('#pause-save').addEventListener('click', () => { saveGame(); audio.ui(); });
  $('#pause-quit').addEventListener('click', () => { audio.uiBack(); closePanel(); showTitle(); });
  $('.close-panel').addEventListener('click', () => { audio.uiBack(); closePanel(); });
  $$('.pause-nav [data-tab]').forEach(btn => btn.addEventListener('click', () => {
    S.panelTab = btn.dataset.tab; audio.ui(); renderPanel();
  }));
  $('#ending-continue').addEventListener('click', () => { audio.ui(); $('#screen-ending').classList.remove('active'); S.mode = 'playing'; showHUD(true); saveGame(true); });
  $('#ending-title-btn').addEventListener('click', () => { audio.uiBack(); $('#screen-ending').classList.remove('active'); showTitle(); });
  // nombre
  const nameInput = $('#char-name');
  nameInput.addEventListener('input', () => {
    $('#name-count').textContent = `${nameInput.value.length}/16`;
    S.creatorConfig.name = nameInput.value.trim() || 'Aurel';
    drawCreatorPreview();
  });
  $$('.name-suggestions button').forEach(b => b.addEventListener('click', () => {
    nameInput.value = b.dataset.name; nameInput.dispatchEvent(new Event('input')); audio.ui();
  }));
  // opciones de creación
  $$('[data-group]').forEach(group => {
    const key = group.dataset.group;
    group.addEventListener('click', e => {
      const btn = e.target.closest('button[data-value]');
      if (!btn) return;
      $$('button', group).forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      let val = btn.dataset.value;
      if (['face', 'hair', 'armor', 'helmet', 'weapon', 'accessory'].includes(key)) val = parseInt(val, 10);
      S.creatorConfig[key] = val;
      audio.ui();
      drawCreatorPreview();
      updateCreatorStats();
    });
  });
  // estadísticas del héroe
  const statList = $('#stat-list');
  if (statList) statList.addEventListener('click', e => {
    const btn = e.target.closest('.stat-plus');
    if (!btn) return;
    const p = panelPlayer();
    if (!p || p.statPoints <= 0) { audio.error(); return; }
    const key = btn.dataset.stat;
    if (!(key in p.stats)) return;
    p.stats[key] += 1; p.statPoints -= 1;
    derive(p);
    if (p === S.player) {
      p.hp = Math.min(p.maxHp, p.hp + 6);
      p.mana = Math.min(p.maxMana, p.mana + 4);
      saveGame(true);
    }
    audio.ui(); renderPanel(); updateHUD(true);
  });
  const autoLevel = $('#auto-level');
  if (autoLevel) autoLevel.addEventListener('click', () => {
    const p = panelPlayer();
    if (!p || p.statPoints <= 0) { audio.error(); return; }
    const order = ['vida', 'fuerza', 'res', 'defensa', 'velocidad', 'inteligencia', 'suerte', 'mana'];
    let i = 0;
    while (p.statPoints > 0) {
      p.stats[order[i % order.length]] += 1;
      p.statPoints -= 1;
      i++;
    }
    derive(p);
    if (p === S.player) { p.hp = p.maxHp; p.mana = p.maxMana; p.stam = p.maxStam; saveGame(true); }
    audio.levelUp(); renderPanel(); updateHUD(true);
  });
  // opciones del panel
  const bindOption = (id, key, transform = v => v, event = 'input') => {
    const el = $(id); if (!el) return;
    el.addEventListener(event, () => {
      S.settings[key] = transform(el.type === 'checkbox' ? el.checked : el.value);
      applySettings(); saveSettings();
    });
  };
  bindOption('#opt-volume', 'volume', Number);
  bindOption('#opt-music', 'music', Number);
  bindOption('#opt-sfx', 'sfx', Number);
  bindOption('#opt-motion', 'motion', v => v, 'change');
  bindOption('#opt-contrast', 'contrast', v => v, 'change');
  bindOption('#opt-damage', 'damage', v => v, 'change');
  bindOption('#opt-touch', 'touch', v => v, 'change');
  addEventListener('resize', resize);
  addEventListener('orientationchange', () => setTimeout(resize, 200));
}

// ---------------- Actualización del jugador ----------------
function updatePlayer(dt) {
  const p = S.player;
  if (!p) return;
  p.hurt = Math.max(0, p.hurt - dt);
  p.invuln = Math.max(0, p.invuln - dt);
  p.dodgeCooldown = Math.max(0, p.dodgeCooldown - dt);
  p.skillCooldown = Math.max(0, p.skillCooldown - dt);
  p.resonanceCooldown = Math.max(0, p.resonanceCooldown - dt);
  p.potionCooldown = Math.max(0, p.potionCooldown - dt);
  p.comboTimer = Math.max(0, p.comboTimer - dt);
  p.cast = Math.max(0, p.cast - dt);
  p.shield = Math.max(0, p.shield - dt * 2);
  p.captureBuff = Math.max(0, (p.captureBuff || 0) - dt);
  p.block = S.blockHeld && p.stam > 0 && p.dodgeTimer <= 0;
  if (!p.block && p.stam < p.maxStam) p.stam = Math.min(p.maxStam, p.stam + 17 * dt);
  if (p.block) p.stam = Math.max(0, p.stam - 19 * dt);
  p.mana = Math.min(p.maxMana, p.mana + 2.7 * dt);
  for (const k of Object.keys(p.creatureCooldowns)) p.creatureCooldowns[k] = Math.max(0, p.creatureCooldowns[k] - dt);

  if (p.dodgeTimer > 0) {
    p.dodgeTimer -= dt;
    const t = p.dodgeTimer / .34;
    moveWithCollision(p, p.dodgeDir.x * 390 * t * dt, p.dodgeDir.y * 390 * t * dt);
    p.moving = true;
    if (Math.random() < .5) addParticle(p.x, p.y - 10, 0, 0, .3, '#b9d8ff', 5, 'dust');
  } else {
    let ix = inputX(), iy = inputY();
    const l = Math.hypot(ix, iy);
    if (l > 0) { ix /= l; iy /= l; p.dir = { x: ix, y: iy }; }
    let speed = p.moveSpeed;
    if (p.attackAnim > 0) speed *= .34;
    if (p.block) speed *= .38;
    if (p.stun > 0) speed = 0;
    p.stun = Math.max(0, p.stun - dt);
    if (l > 0) {
      moveWithCollision(p, ix * speed * dt, iy * speed * dt);
      p.moving = true;
      p.facing = Math.abs(ix) > Math.abs(iy) ? (ix < 0 ? 'left' : 'right') : (iy < 0 ? 'up' : 'down');
      p.speedNow = speed;
      if (S.time - S.lastFootstep > (p.block ? .55 : .32)) {
        S.lastFootstep = S.time;
        audio.footstep();
        addParticle(p.x + rand(5, -5), p.y, rand(8, -8), rand(4, -4), .35, 'rgba(190,180,150,.35)', 3, 'dust');
      }
    } else {
      p.moving = false; p.speedNow = 0;
    }
  }

  if (p.attackTimer > 0) {
    p.attackTimer -= dt;
    p.attackAnim = clamp(p.attackAnim + dt / .3, 0, 1);
    if (!p.attackHit && p.attackAnim > .25) {
      p.attackHit = true;
      performPlayerHit();
    }
  } else if (p.attackAnim > 0) {
    p.attackAnim = 0;
  }

  // prompt de interacción
  const near = findInteractable();
  S.nearInteract = near;
  const prompt = $('#interact-prompt');
  if (near && S.mode === 'playing') {
    prompt.classList.remove('hidden');
    $('#interact-text').textContent = near.text;
  } else prompt.classList.add('hidden');
  updateHUD();
}

function performPlayerHit() {
  const p = S.player;
  const range = 78 + p.combo * 7;
  const arc = 1.15;
  let hitAny = false;
  for (const e of S.world.enemies) {
    if (e.dead) continue;
    const d = Math.hypot(e.x - p.x, e.y - p.y);
    if (d > range + e.radius) continue;
    const a = Math.atan2(e.y - p.y, e.x - p.x);
    if (Math.abs(angleDiff(a, p.attackAngle)) > arc) continue;
    const dmg = p.atk * (1 + p.combo * .16) * (p.combo === 2 ? 1.35 : 1);
    damageEnemy(e, Math.round(dmg), { crit: Math.random() * 100 < p.crit, color: p.combo === 2 ? '#ffd76e' : '#fff4dd', knock: 55 });
    hitAny = true;
  }
  for (const w of S.world.wilds) {
    if (w.captured) continue;
    const d = Math.hypot(w.x - p.x, w.y - p.y);
    if (d > range + w.radius) continue;
    const a = Math.atan2(w.y - p.y, w.x - p.x);
    if (Math.abs(angleDiff(a, p.attackAngle)) > arc) continue;
    damageWild(w, Math.round(p.atk * .8), '#fff4dd');
    hitAny = true;
  }
  if (hitAny) {
    S.camera.shake = Math.max(S.camera.shake, p.combo === 2 ? 7 : 3);
    S.hitStop = Math.max(S.hitStop, .035);
  }
  addRing(p.x + Math.cos(p.attackAngle) * 35, p.y - 20 + Math.sin(p.attackAngle) * 35, 8, range * .7, p.combo === 2 ? '#ffd76e' : '#ffe2a1', .28, 2);
}

// ---------------- Interacción ----------------
function findInteractable() {
  if (!S.world || !S.player) return null;
  const p = S.player;
  let best = null, bestD = Infinity;
  const consider = (d, max, obj) => { if (d < max && d < bestD) { bestD = d; best = obj; } };
  for (const n of S.world.npcs) {
    const d = Math.hypot(n.x - p.x, n.y - p.y);
    consider(d, 92, { kind: 'npc', target: n, x: n.x, y: n.y, text: `Hablar con ${n.def.name}` });
  }
  for (const g of S.world.gates) {
    const d = Math.hypot(g.x - p.x, g.y - p.y);
    let text = g.label || 'Cruzar';
    if (g.to === 'drakmor' && S.stage < 3) text = 'La Puerta de Brasa está sellada';
    if (g.to === 'kansordore' && S.stage < 5) text = 'El Portal de Ceniza duerme';
    consider(d, 120, { kind: 'gate', target: g, x: g.x, y: g.y, text });
  }
  for (const c of S.world.props) {
    if (c.type === 'chest' && !c.opened) {
      const d = Math.hypot(c.x - p.x, c.y - p.y);
      consider(d, 82, { kind: 'chest', target: c, x: c.x, y: c.y, text: 'Abrir cofre' });
    }
    if (c.type === 'shrine') {
      const d = Math.hypot(c.x - p.x, c.y - p.y);
      consider(d, 105, { kind: 'shrine', target: c, x: c.x, y: c.y, text: 'Descansar en el santuario' });
    }
    if (c.type === 'lore' && !c.read) {
      const d = Math.hypot(c.x - p.x, c.y - p.y);
      consider(d, 90, { kind: 'lore', target: c, x: c.x, y: c.y, text: 'Escuchar la piedra de memoria' });
    }
    if (c.type === 'ore' && !c.collected) {
      const d = Math.hypot(c.x - p.x, c.y - p.y);
      consider(d, 70, { kind: 'ore', target: c, x: c.x, y: c.y, text: 'Recoger fragmento de brasa' });
    }
    if (c.type === 'flower' && !c.collected) {
      const d = Math.hypot(c.x - p.x, c.y - p.y);
      consider(d, 65, { kind: 'flower', target: c, x: c.x, y: c.y, text: 'Recoger flor de alba' });
    }
    if (c.type === 'seal') {
      const d = Math.hypot(c.x - p.x, c.y - p.y);
      consider(d, 100, { kind: 'seal', target: c, x: c.x, y: c.y, text: c.on ? 'Eco encendido' : 'Encender Eco del Templo' });
    }
    if (c.type === 'sign') {
      const d = Math.hypot(c.x - p.x, c.y - p.y);
      consider(d, 70, { kind: 'sign', target: c, x: c.x, y: c.y, text: 'Leer cartel' });
    }
  }
  for (const w of S.world.wilds) {
    if (w.captured) continue;
    const d = Math.hypot(w.x - p.x, w.y - p.y);
    const def = CREATURE_BY_ID[w.creatureId];
    let text = `Observar a ${def.name}`;
    if (w.questTarget && S.stage === 1) text = 'Ofrecer tu Resonancia a Lumín';
    else if (w.hp / w.maxHp <= .36) text = `Vincular a ${def.name} con Resonancia`;
    consider(d, 90, { kind: 'wild', target: w, x: w.x, y: w.y, text });
  }
  return best;
}

function interact() {
  if (S.mode !== 'playing') return;
  const near = S.nearInteract || findInteractable();
  if (!near) return;
  audio.ui();
  const { kind, target } = near;
  if (kind === 'npc') npcTalk(target);
  else if (kind === 'gate') tryGate(target);
  else if (kind === 'chest') openChest(target);
  else if (kind === 'shrine') restAtShrine(target);
  else if (kind === 'lore') readLore(target);
  else if (kind === 'ore') collectOre(target);
  else if (kind === 'flower') collectFlower(target);
  else if (kind === 'seal') activateSeal(target);
  else if (kind === 'sign') showToast(target.label || 'Lumen', 'gold', 1200);
  else if (kind === 'wild') inspectWild(target);
}

function openChest(c) {
  if (c.opened) return;
  c.opened = true;
  const loot = c.loot || {};
  if (loot.gold) gainGold(loot.gold);
  if (loot.item) { S.player.inventory[loot.item] = (S.player.inventory[loot.item] || 0) + 1; showToast(`Has encontrado ${ITEMS[loot.item]?.name || loot.item}`, 'blue', 1800); }
  if (loot.equip) addEquipment(loot.equip);
  spawnBurst(c.x, c.y - 20, '#e7c56e', 20, 100, 'spark');
  addRing(c.x, c.y - 15, 10, 55, '#e7c56e', .5, 3);
  audio.pickup();
  showToast('Cofre abierto', 'gold', 1200);
  saveGame(true);
}
function restAtShrine(s) {
  const p = S.player;
  p.hp = p.maxHp; p.mana = p.maxMana; p.stam = p.maxStam;
  S.flags.lastShrine = { region: S.regionId, x: s.x, y: s.y };
  p.shrines++;
  audio.heal();
  spawnBurst(s.x, s.y - 55, '#ffe2a1', 26, 120, 'spark');
  addRing(s.x, s.y - 20, 15, 90, '#ffe2a1', .7, 3);
  showToast('El santuario te reconoce. Vida, maná y resistencia restaurados.', 'gold', 2600);
  saveGame(true);
}
function readLore(prop) {
  const lore = LORE_STONES.find(l => l.id === prop.loreId);
  if (!lore) return;
  prop.read = true;
  if (!S.loreRead.includes(lore.id)) S.loreRead.push(lore.id);
  if (!S.world.regionId.includes('kansordore')) { /* el diario conserva la memoria */ }
  openDialogue({
    name: lore.title, role: 'PIEDRA DE MEMORIA', npcId: 'lore', lines: [lore.text],
    onEnd: () => {
      audio.quest();
      if (S.loreRead.length >= 3) showToast('Ecos de los caídos · habla con Solen en Kansordore.', 'blue', 2600);
      updateSideQuests();
      saveGame(true);
    }
  });
}
function collectOre(prop) {
  prop.collected = true;
  S.player.materials.ember = (S.player.materials.ember || 0) + 1;
  spawnBurst(prop.x, prop.y - 12, prop.color, 10, 80, 'spark');
  audio.pickup();
  showToast(`Fragmento de brasa (${S.player.materials.ember}/3)`, 'blue', 1600);
  updateSideQuests();
  saveGame(true);
}
function collectFlower(prop) {
  prop.collected = true;
  S.player.materials.flower = (S.player.materials.flower || 0) + 1;
  spawnBurst(prop.x, prop.y - 10, '#f0c96b', 10, 70, 'spark');
  audio.pickup();
  showToast(`Flor de alba (${S.player.materials.flower}/3)`, 'blue', 1600);
  updateSideQuests();
  saveGame(true);
}
function activateSeal(prop) {
  if (prop.on) { showToast('Este Eco ya está encendido.', 'blue', 1000); return; }
  if (S.stage < 6) { showToast('El Eco aún no responde. La Profecía debe despertar.', 'danger', 1800); return; }
  prop.on = true;
  S.seals[prop.sealIndex] = true;
  audio.seal();
  spawnBurst(prop.x, prop.y - 24, prop.color, 30, 160, 'spark');
  addRing(prop.x, prop.y - 24, 20, 160, prop.color, .9, 4);
  S.camera.shake = 8;
  const count = S.seals.filter(Boolean).length;
  showToast(`Eco ${count}/3 encendido. El Templo recuerda.`, 'gold', 2200);
  if (count === 3) {
    ensureBoss(S.world);
    showToast('Los tres Ecos convergen. Vael, Corazón del Velo, despierta.', 'danger', 3600);
    setTimeout(() => {
      if (S.boss && !S.boss.dead) { audio.boss(); S.camera.shake = 14; showBossBar(S.boss); }
    }, 900);
  }
  updateHUD(true); saveGame(true);
}

function inspectWild(w) {
  const def = CREATURE_BY_ID[w.creatureId];
  if (w.questTarget && S.stage === 1) {
    // vínculo garantizado de la historia
    captureWild(w, true);
    return;
  }
  if (w.hp / w.maxHp <= .36) { attemptCapture(w); return; }
  openDialogue({
    name: def.name, role: `${def.rarity.toUpperCase()} · ${ELEMENTS[def.element].name.toUpperCase()}`, npcId: 'creature', lines: [def.lore, `Debilita a ${def.name} y usa la Resonancia (R) para intentar vincularla.`], onEnd: () => {}
  });
}

function attemptCapture(w) {
  const p = S.player;
  const def = CREATURE_BY_ID[w.creatureId];
  if (p.creatures.includes(def.id)) {
    showToast(`Ya has vinculado a ${def.name}.`, 'blue', 1400);
    w.captured = true; return;
  }
  if (p.mana < 15) { showToast('Maná insuficiente para la Resonancia', 'danger', 1200); audio.error(); return; }
  p.mana -= 15;
  const hpFactor = 1 - w.hp / w.maxHp;
  let chance = .38 + hpFactor * .42 + p.luck * .015 + (p.captureBuff ? .2 : 0);
  if (w.questTarget) chance = 1;
  chance = clamp(chance, .2, .97);
  addRing(w.x, w.y - 20, 15, 120, def.color, 1, 4);
  spawnBurst(w.x, w.y - 20, def.color, 30, 120, 'spark');
  audio.capture();
  if (Math.random() < chance) {
    captureWild(w, false);
  } else {
    showToast(`La Resonancia no ha bastado (${Math.round(chance * 100)}%). La criatura aún resiste.`, 'danger', 2200);
    w.hp = Math.max(1, w.hp - 2);
    addFloater(w.x, w.y - 55, 'RESISTE', '#ffb0a0', false);
  }
}
function captureWild(w, story) {
  const p = S.player;
  const def = CREATURE_BY_ID[w.creatureId];
  w.captured = true;
  if (!p.creatures.includes(def.id)) {
    p.creatures.push(def.id);
    p.captured++;
    if (p.party.length < 3) p.party.push(def.id);
    if (!p.activeCreature) p.activeCreature = def.id;
  }
  derive(p);
  spawnBurst(w.x, w.y - 20, def.color, 50, 200, 'level');
  addRing(w.x, w.y - 20, 15, 160, def.color, 1.1, 5);
  S.camera.shake = 6;
  audio.capture();
  showToast(`✦ Vínculo establecido: ${def.name} · ${def.ability}`, 'gold', 3800);
  showToast(`${def.passive}`, 'blue', 3000);
  updatePartyUI(); updateHUD(true); saveGame(true);
  if (story || (def.id === 'lumin' && S.stage === 1)) {
    setStage(2);
    setTimeout(() => {
      openDialogue({
        name: 'Lumín', role: 'PRIMER VÍNCULO', npcId: 'creature', lines: ['La pequeña criatura se enrosca en tu muñeca como una hebra de luz. Por un instante, el cielo de Valdoria deja de temblar.', 'Elara te observa desde el sendero. En sus ojos hay algo que no es sorpresa: es reconocimiento.'], onEnd: () => showToast('Objetivo actualizado: investiga las Ruinas de Vael, al este.', 'gold', 3000)
      });
    }, 900);
  }
}

// ---------------- Diálogo ----------------
function drawDialoguePortrait(kind, name) {
  const c = dialoguePortrait, g = c.getContext('2d');
  g.clearRect(0, 0, c.width, c.height);
  if (kind === 'lore') {
    const bg = g.createRadialGradient(90, 80, 5, 90, 80, 85);
    bg.addColorStop(0, 'rgba(140,180,220,.24)'); bg.addColorStop(1, 'rgba(7,11,20,0)');
    g.fillStyle = bg; g.fillRect(0, 0, 180, 180);
    g.strokeStyle = 'rgba(180,210,255,.6)'; g.lineWidth = 2;
    g.beginPath(); g.arc(90, 86, 43, 0, TAU); g.stroke();
    g.beginPath(); g.arc(90, 86, 31, 0, TAU); g.stroke();
    for (let i = 0; i < 8; i++) { const a = i / 8 * TAU; g.beginPath(); g.moveTo(90 + Math.cos(a) * 31, 86 + Math.sin(a) * 31); g.lineTo(90 + Math.cos(a) * 43, 86 + Math.sin(a) * 43); g.stroke(); }
    g.fillStyle = '#dceaff'; g.beginPath(); g.arc(90, 86, 6, 0, TAU); g.fill();
    glow(g, 90, 86, 40, '#b9d8ff', .25);
    return;
  }
  if (kind === 'creature') {
    const def = CREATURE_BY_ID[name] || CREATURE_BY_ID['lumin'];
    const bg = g.createRadialGradient(90, 90, 4, 90, 90, 90);
    bg.addColorStop(0, rgba(def.color, .22)); bg.addColorStop(1, 'rgba(7,11,20,0)');
    g.fillStyle = bg; g.fillRect(0, 0, 180, 180);
    drawCreature(g, def, 90, 140, 2.2, S.time, { glow: .2 });
    return;
  }
  if (kind === 'sword') {
    g.fillStyle = 'rgba(7,11,20,.5)'; g.fillRect(0, 0, 180, 180);
    glow(g, 90, 84, 65, '#ffe2a1', .22);
    drawSword(g, { shape: 3, color: '#e9d7a1', blade: '#fffbe7' }, 90, 140, Math.PI, 1.5, true);
    return;
  }
  const npc = NPCS[kind] || null;
  const bg = g.createRadialGradient(90, 84, 4, 90, 84, 90);
  bg.addColorStop(0, npc ? rgba(npc.accent, .18) : 'rgba(236,213,159,.12)');
  bg.addColorStop(1, 'rgba(7,11,20,0)');
  g.fillStyle = bg; g.fillRect(0, 0, 180, 180);
  drawPortrait(c, S.player ? getAppearance(S.player) : {}, S.time, npc);
}

function openDialogue(opts) {
  S.dialogue = {
    name: opts.name || '???', role: opts.role || '', npcId: opts.npcId || 'elara',
    lines: opts.lines || [''], index: 0, chars: 0, timer: 0,
    choices: opts.choices || null, choiceShown: false, onEnd: opts.onEnd || null,
    full: '', typing: true
  };
  S.mode = 'dialogue';
  const d = S.dialogue;
  $('#dialogue-name').textContent = d.name;
  $('#dialogue-role').textContent = d.role;
  $('#dialogue-text').textContent = '';
  $('#dialogue-choices').classList.add('hidden');
  $('#dialogue-choices').innerHTML = '';
  $('#dialogue-next').style.visibility = 'hidden';
  $('#dialogue').classList.remove('hidden');
  $('#interact-prompt').classList.add('hidden');
  drawDialoguePortrait(d.npcId, d.name);
  audio.dialogue();
  startDialogueLine();
}

function startDialogueLine() {
  const d = S.dialogue; if (!d) return;
  d.full = d.lines[d.index] || '';
  d.chars = 0; d.timer = 0; d.typing = true;
  $('#dialogue-text').textContent = '';
  $('#dialogue-next').style.visibility = 'hidden';
  $('#dialogue-choices').classList.add('hidden');
}
function updateDialogue(dt) {
  const d = S.dialogue; if (!d || !d.typing) return;
  d.timer += dt;
  const speed = 52;
  const target = Math.min(d.full.length, Math.floor(d.timer * speed));
  if (target !== d.chars) {
    d.chars = target;
    $('#dialogue-text').textContent = d.full.slice(0, d.chars);
    if (Math.random() < .2) audio.dialogue();
  }
  if (d.chars >= d.full.length) {
    d.typing = false;
    $('#dialogue-next').style.visibility = 'visible';
    if (d.index >= d.lines.length - 1 && d.choices) showChoices();
  }
}
function advanceDialogue() {
  const d = S.dialogue; if (!d) return;
  if (d.typing) { d.typing = false; d.chars = d.full.length; $('#dialogue-text').textContent = d.full; $('#dialogue-next').style.visibility = 'visible'; if (d.index >= d.lines.length - 1 && d.choices) showChoices(); return; }
  if (d.choiceShown) return;
  if (d.index < d.lines.length - 1) { d.index++; startDialogueLine(); audio.dialogue(); return; }
  closeDialogue();
}
function showChoices() {
  const d = S.dialogue; if (!d || d.choiceShown) return;
  d.choiceShown = true;
  const wrap = $('#dialogue-choices');
  wrap.innerHTML = '';
  wrap.classList.remove('hidden');
  d.choices.forEach((ch, i) => {
    const btn = document.createElement('button');
    btn.className = 'dialogue-choice';
    btn.innerHTML = `<b>${i + 1}</b>${ch.text}`;
    btn.addEventListener('click', e => { e.stopPropagation(); chooseDialogue(ch); });
    wrap.appendChild(btn);
  });
  $('#dialogue-next').style.visibility = 'hidden';
}
function chooseDialogue(choice) {
  const d = S.dialogue; if (!d) return;
  const action = choice.action;
  closeDialogue(true);
  if (action) action();
}
function closeDialogue(fromChoice = false) {
  const d = S.dialogue; if (!d) return;
  const cb = d.onEnd;
  S.dialogue = null;
  $('#dialogue').classList.add('hidden');
  $('#dialogue-choices').classList.add('hidden');
  if (S.mode === 'dialogue') S.mode = 'playing';
  if (cb && !fromChoice) cb();
}

// ---------------- Cinemáticas ----------------
const EXTRA_CINEMATICS = {
  lagrima: {
    kicker: 'VALDORIA · RUINAS DE VAEL', lines: [
      'El Guardián cae de rodillas. No muere: recuerda. Durante un instante, sus ojos de piedra reflejan una ciudad que ya no existe.',
      'Entre sus manos hay una lágrima de cristal que arde sin consumirse. La Lágrima de la Primera Brasa. Al tocarla, la Puerta de Brasa, al este, abre los ojos.',
      'La Espada no te agradece nada. Solo te muestra el camino. Y por primera vez, el camino huele a ceniza.'
    ]
  },
  forja: {
    kicker: 'DRAKMOR · LA FORTALEZA VACÍA', lines: [
      'La Forja Corrupta se apaga. Sus engranajes siguen girando un momento, buscando una guerra que ya terminó.',
      'En su interior no hay un corazón. Hay una carta: «Para el siguiente que despierte. No dejes que el Velo te convenza de que estás solo».',
      'El Portal de Ceniza se abre sobre la montaña. Al otro lado, Kansordore brilla como una herida que alguien intentó cerrar con estrellas.'
    ]
  }
};

function playCinematic(id, onDone) {
  let data = MAIN_STORY.find(c => c.id === id) || EXTRA_CINEMATICS[id];
  if (!data) { onDone?.(); return; }
  S.cine = { ...data, index: 0, chars: 0, timer: 0, typing: true, onDone };
  S.mode = 'cinematic';
  $('#cinematic').classList.remove('hidden');
  $('#hud').classList.add('hidden');
  $('#cine-kicker').textContent = data.kicker;
  $('#cine-text').textContent = '';
  startCineLine();
  audio.portal();
}
function startCineLine() {
  const c = S.cine; if (!c) return;
  c.chars = 0; c.timer = 0; c.typing = true;
  $('#cine-text').textContent = '';
}
function updateCinematic(dt) {
  const c = S.cine; if (!c || !c.typing) return;
  c.timer += dt;
  const full = c.lines[c.index] || '';
  const target = Math.min(full.length, Math.floor(c.timer * 45));
  if (target !== c.chars) { c.chars = target; $('#cine-text').textContent = full.slice(0, c.chars); }
  if (c.chars >= full.length) c.typing = false;
}
function advanceCinematic() {
  const c = S.cine; if (!c) return;
  const full = c.lines[c.index] || '';
  if (c.typing) { c.typing = false; c.chars = full.length; $('#cine-text').textContent = full; return; }
  if (c.index < c.lines.length - 1) { c.index++; startCineLine(); audio.dialogue(); }
  else endCinematic();
}
function endCinematic() {
  const c = S.cine; if (!c) return;
  const cb = c.onDone;
  S.cine = null;
  $('#cinematic').classList.add('hidden');
  if (S.mode === 'cinematic') S.mode = 'playing';
  $('#hud').classList.remove('hidden');
  if (cb) cb();
}

// ---------------- Narrativa / misiones ----------------
function setStage(n) {
  if (!S.player) return;
  if (n <= S.stage && n !== 8) { updateHUD(true); return; }
  const prev = S.stage;
  if (n > S.stage && S.stage < QUESTS.length) {
    const q = QUESTS[S.stage];
    if (q && q.xp) gainXp(q.xp);
    if (q && q.gold) gainGold(q.gold);
    S.player.questsDone++;
    showToast(`Misión completada · ${q.title}`, 'gold', 3200);
  }
  S.stage = n;
  ensureBoss(S.world);
  updateQuestUI();
  updateHUD(true);
  saveGame(true);
  if (n === 1) setTimeout(() => showToast('Objetivo actualizado: encuentra a Lumín en el Bosque de los Susurros.', 'gold', 3000), 800);
  if (n === 2) setTimeout(() => showToast('Objetivo actualizado: investiga las Ruinas de Vael, al este.', 'gold', 3000), 600);
  if (n === 3) setTimeout(() => showToast('Objetivo actualizado: cruza la Puerta de Brasa, al este de Valdoria.', 'gold', 3000), 600);
  if (n === 5) setTimeout(() => showToast('Objetivo actualizado: cruza el Portal de Ceniza hacia Kansordore.', 'gold', 3000), 600);
  if (n === 6) setTimeout(() => showToast('Objetivo actualizado: enciende los tres Ecos del Templo.', 'gold', 3000), 600);
  if (n === 7) setTimeout(() => showToast('El Velo espera tu respuesta.', 'gold', 2600), 600);
  if (n > prev) audio.quest();
}

function questText() {
  if (S.stage >= 8) return { title: 'El mundo después', objective: 'La crónica sigue abierta. Explora, colecciona y deja que el mundo recuerde.' };
  const q = QUESTS[Math.min(S.stage, QUESTS.length - 1)];
  if (!q) return { title: 'El nombre de la Espada', objective: 'La Espada espera tu respuesta.' };
  if (S.stage === 6) {
    const c = S.seals.filter(Boolean).length;
    if (c < 3) return { title: q.title, objective: `Enciende los tres Ecos del Templo (${c}/3).` };
    return { title: q.title, objective: 'Derrota a Vael, Corazón del Velo, en el Templo del Primer Alba.' };
  }
  if (S.stage === 2 && S.flags.guardianDefeated) return { title: q.title, objective: 'La Lágrima ha despertado. Cruza la Puerta de Brasa, al este.' };
  return { title: q.title, objective: q.objective };
}

function getObjectiveTarget() {
  const region = S.regionId;
  if (S.stage >= 8) return null;
  if (S.stage === 0) return { x: 690, y: 985, region: 'valdoria', label: 'Elara' };
  if (S.stage === 1) return { x: 1110, y: 430, region: 'valdoria', label: 'Lumín' };
  if (S.stage === 2) return { x: 2140, y: 760, region: 'valdoria', label: 'Guardián de Vael' };
  if (S.stage === 3) return { x: 2650, y: 900, region: 'valdoria', label: 'Puerta de Brasa' };
  if (S.stage === 4) return { x: 2090, y: 830, region: 'drakmor', label: 'Forja Corrupta' };
  if (S.stage === 5) return { x: 2510, y: 520, region: 'drakmor', label: 'Portal de Ceniza' };
  if (S.stage === 6) {
    if (S.seals.every(Boolean)) return { x: 1990, y: 700, region: 'kansordore', label: 'Vael' };
    const seals = [{ x: 720, y: 600 }, { x: 1210, y: 1250 }, { x: 1850, y: 1180 }];
    const un = seals.find((s, i) => !S.seals[i]) || seals[0];
    return { ...un, region: 'kansordore', label: 'Eco del Templo' };
  }
  if (S.stage === 7) return { x: 1990, y: 700, region: 'kansordore', label: 'La Espada' };
  return null;
}

function updateQuestUI() {
  const q = questText();
  $('#quest-title').textContent = q.title;
  $('#quest-objective').textContent = q.objective;
}
function updateSideQuests() {
  if (S.player) {
    if (S.side.s0 === 'active' && (S.player.materials.ember || 0) >= 3) showToast('La brasa perdida · vuelve junto a Ordan.', 'blue', 2200);
    if (S.side.s1 === 'active' && (S.player.materials.flower || 0) >= 3) showToast('El jardín de Mira · vuelve junto a Mira.', 'blue', 2200);
    if (S.side.s2 === 'active' && S.loreRead.length >= 3) showToast('Ecos de los caídos · habla con Solen.', 'blue', 2200);
  }
  saveGame(true);
}

function npcTalk(npc) {
  const p = S.player;
  const id = npc.id;
  if (id === 'elara') {
    if (S.stage === 0) {
      openDialogue({
        name: 'Elara', role: 'Maestra de la Resonancia', npcId: 'elara', lines: [
          'Despiertas al fin. El santuario lleva tres noches llamándote y tú llevas tres noches respondiendo desde el sueño.',
          'No recuerdas tu nombre. Es normal. La Espada tampoco recuerda el suyo; solo recuerda a quién perteneció.',
          'El Velo se está rasgando. Las criaturas huyen, los muertos susurran y una Puerta que llevaba mil años cerrada ha empezado a arder.',
          'Antes de empuñar nada, necesitas recordar cómo se escucha. Ve al Bosque de los Susurros, al norte. Allí vive Lumín. Ofrécele tu mano, no tu acero.'
        ],
        choices: [
          { text: 'Acepto. Iré al bosque.', action: () => setStage(1) },
          { text: '¿Qué es el Velo?', action: () => { setStage(1); openDialogue({ name: 'Elara', role: 'Maestra de la Resonancia', npcId: 'elara', lines: ['El Velo es la costura entre lo que el mundo recuerda y lo que decidió olvidar. Alguien está tirando de esa costura. Y todo lo que amamos está al otro lado.'], onEnd: () => {} }); } }
        ],
        onEnd: () => setStage(1)
      });
    } else if (S.stage === 1) {
      openDialogue({ name: 'Elara', role: 'Maestra de la Resonancia', npcId: 'elara', lines: [
        'El Bosque de los Susurros está al norte. Sigue el sendero de flores y no hieras a Lumín. La Resonancia no se conquista: se acepta.',
        'Cuando la sientas, pulsa R. Si su luz aún resiste, debilítala primero. Pero recuerda: una criatura herida no olvida.'
      ], onEnd: () => {} });
    } else if (S.stage === 2) {
      openDialogue({ name: 'Elara', role: 'Maestra de la Resonancia', npcId: 'elara', lines: [
        'Las Ruinas de Vael se alzan al este, más allá del bosque. Allí duerme la Lágrima de la Primera Brasa.',
        'El Guardián que la protege ya no distingue entre ladrones y peregrinos. Si has de enfrentarlo, que sea con la verdad en la mano.',
        'Y si el Velo te habla... no le respondas todavía.'
      ], onEnd: () => {} });
    } else if (S.stage === 3) {
      openDialogue({ name: 'Elara', role: 'Maestra de la Resonancia', npcId: 'elara', lines: [
        'La Lágrima te ha reconocido. Eso significa que la Puerta de Brasa te dejará pasar.',
        'Drakmor no perdona. Lleva elixires, escucha a la cazadora Nyx y no mires demasiado tiempo el fuego: el fuego también mira.'
      ], onEnd: () => {} });
    } else if (S.stage === 4) {
      openDialogue({ name: 'Elara', role: 'Maestra de la Resonancia', npcId: 'elara', lines: [
        'La Forja Corrupta no es una bestia. Es una máquina que aprendió a tener miedo. Recuerda eso cuando la enfrentes.',
        'Nyx conoce la fortaleza mejor que nadie. Búscala en el campamento, al oeste.'
      ], onEnd: () => {} });
    } else if (S.stage >= 5 && S.stage < 7) {
      openDialogue({ name: 'Elara', role: 'Maestra de la Resonancia', npcId: 'elara', lines: [
        'Kansordore no es un lugar: es una pregunta que el mundo lleva mil años evitando.',
        'Enciende los tres Ecos. Y cuando Vael te hable, recuerda que la Profecía no te prometió una victoria. Te prometió una elección.'
      ], onEnd: () => {} });
    } else {
      openDialogue({ name: 'Elara', role: 'Maestra de la Resonancia', npcId: 'elara', lines: [
        S.stage >= 8 ? 'El mundo sigue aquí. Eso ya es un milagro. Lo demás lo escribiremos entre todos.' : 'La Espada espera tu respuesta. No hay respuesta correcta. Solo la tuya.'
      ], onEnd: () => {} });
    }
    return;
  }
  if (id === 'ordan') {
    const embers = p.materials.ember || 0;
    if (S.side.s0 === 'inactive') {
      openDialogue({
        name: 'Ordan', role: 'Herrero de Lumen', npcId: 'ordan', lines: [
          '¡Vaya! El Portador despierta y lo primero que ve es mi cara. Podría ser peor: podría ver la de mi hermano.',
          'Mi hermano se fue a Drakmor hace un año. Volvió convertido en ceniza y en una carta que no me atrevo a abrir.',
          'Si vas a bajar al fuego, tráeme tres fragmentos de brasa. Necesito forjar algo que no se apague con el recuerdo.'
        ],
        choices: [
          { text: 'Buscaré los fragmentos.', action: () => { S.side.s0 = 'active'; showToast('Eco secundario iniciado: La brasa perdida.', 'blue', 2200); saveGame(true); } },
          { text: 'Ahora no.', action: () => {} }
        ],
        onEnd: () => {}
      });
      return;
    }
    if (S.side.s0 === 'active' && embers >= 3) {
      openDialogue({
        name: 'Ordan', role: 'Herrero de Lumen', npcId: 'ordan', lines: [
          'Tres brasas. Todavía recuerdan el fuego. Buen trabajo.',
          'Toma. La forjé con la última luz de Valdoria. No es la Espada Celestial, pero corta lo que se le ponga delante.'
        ],
        onEnd: () => {
          S.side.s0 = 'done'; addEquipment('guardiana'); p.gold += 60; gainXp(80);
          showToast('Eco completado: La brasa perdida · Filo de la Guardiana', 'gold', 3400);
          audio.quest(); updateSideQuests(); saveGame(true);
        }
      });
      return;
    }
    openDialogue({
      name: 'Ordan', role: 'Herrero de Lumen', npcId: 'ordan', lines: [
        embers > 0 ? `Llevas ${embers} de 3 fragmentos. Sigue buscando, Portador.` : 'Las brasas duermen entre las ruinas y los caminos viejos. Tres bastarán.',
        'Si quieres que tu arma muerda más fuerte, puedo reforzarla. Cuesta 80 coronas y un poco de fe.'
      ],
      choices: [
        { text: `Reforzar arma (80 coronas) · +2 ataque`, action: () => forgeUpgrade() },
        { text: 'Solo pasaba a saludar.', action: () => {} }
      ],
      onEnd: () => {}
    });
    return;
  }
  if (id === 'mira') {
    const flowers = p.materials.flower || 0;
    if (S.side.s1 === 'inactive') {
      openDialogue({
        name: 'Mira', role: 'Niña de Lumen', npcId: 'mira', lines: [
          'Mi madre dice que las flores de alba solo abren cuando alguien recuerda algo importante.',
          'Quiero recoger tres para el jardín del santuario. ¿Me ayudas? Prometo no decirle a nadie que lloraste al despertar.'
        ],
        choices: [
          { text: 'Claro, pequeña.', action: () => { S.side.s1 = 'active'; showToast('Eco secundario iniciado: El jardín de Mira.', 'blue', 2200); saveGame(true); } },
          { text: 'Tengo prisa.', action: () => {} }
        ], onEnd: () => {}
      });
      return;
    }
    if (S.side.s1 === 'active' && flowers >= 3) {
      openDialogue({
        name: 'Mira', role: 'Niña de Lumen', npcId: 'mira', lines: [
          '¡Las tres! Huelen a noche y a pan caliente.',
          'Toma mi amuleto. Mi abuela decía que trae suerte a los que escuchan a los animales. Tú pareces de esos.'
        ],
        onEnd: () => {
          S.side.s1 = 'done'; addEquipment('amuleto'); p.gold += 30; gainXp(45);
          showToast('Eco completado: El jardín de Mira · Amuleto de Lumín', 'gold', 3400);
          audio.quest(); updateSideQuests(); saveGame(true);
        }
      });
      return;
    }
    openDialogue({ name: 'Mira', role: 'Niña de Lumen', npcId: 'mira', lines: [flowers > 0 ? `Llevas ${flowers} de 3 flores. ¡No las aplastes en la mochila!` : 'Las flores de alba crecen cerca de los caminos y del agua. Brilla un poquito, como si respiraran.'], onEnd: () => {} });
    return;
  }
  if (id === 'nyx') {
    if (S.stage < 4) {
      openDialogue({ name: 'Nyx', role: 'Cazadora de Drakmor', npcId: 'nyx', lines: ['Aún no has probado el fuego. Cuando lo hagas, vuelve. Y trae agua.'], onEnd: () => {} });
    } else if (S.stage === 4) {
      openDialogue({
        name: 'Nyx', role: 'Cazadora de Drakmor', npcId: 'nyx', lines: [
          'La Forja Corrupta está en el corazón de la fortaleza. No es un dios: es una máquina que se cree con derecho a decidir quién merece recordar.',
          'Sus hornos escupen proyectiles y abre el suelo bajo tus pies. Muévete. Y si ves una sombra con forma de niño, no la sigas.',
          'Yo me quedo aquí. Alguien tiene que contar lo que pase si tú no vuelves.'
        ],
        choices: [
          { text: '¿Qué es la Jarra de Origen?', action: () => openDialogue({ name: 'Nyx', role: 'Cazadora de Drakmor', npcId: 'nyx', lines: ['La Jarra contiene la primera decisión del mundo. Beberla entera te muestra quién creó el Velo. Dicen que nadie ha querido terminar.'], onEnd: () => {} }) },
          { text: 'Voy a por ella.', action: () => {} }
        ], onEnd: () => {}
      });
    } else {
      openDialogue({ name: 'Nyx', role: 'Cazadora de Drakmor', npcId: 'nyx', lines: ['La Forja calló. Drakmor sigue respirando. Eso tendrá que bastarnos por ahora.'], onEnd: () => {} });
    }
    return;
  }
  if (id === 'solen') {
    const loreCount = S.loreRead.filter(l => ['lore5', 'lore6'].includes(l)).length;
    if (S.side.s2 === 'inactive') {
      openDialogue({
        name: 'Solen', role: 'Archivista del Velo', npcId: 'solen', lines: [
          'Bienvenido a la biblioteca que el mundo decidió no leer. Aquí guardamos lo que el Velo no pudo borrar.',
          'Si escuchas las piedras de memoria, entenderás por qué Vael no es el villano de esta historia. Solo el primero en no soportarla.',
          'Escucha tres ecos y vuelve. Te daré algo que late al ritmo de las criaturas.'
        ],
        choices: [
          { text: 'Escucharé los ecos.', action: () => { S.side.s2 = 'active'; showToast('Eco secundario iniciado: Ecos de los caídos.', 'blue', 2200); saveGame(true); } },
          { text: 'Ya he oído suficiente.', action: () => {} }
        ], onEnd: () => {}
      });
      return;
    }
    if (S.side.s2 === 'active' && loreCount >= 3) {
      openDialogue({
        name: 'Solen', role: 'Archivista del Velo', npcId: 'solen', lines: ['Tres ecos. Tres versiones de la misma herida. Toma el Sello de Resonancia. Ahora las criaturas te oirán incluso cuando el Velo grite.'],
        onEnd: () => {
          S.side.s2 = 'done'; addEquipment('sello'); p.gold += 80; gainXp(100);
          showToast('Eco completado: Ecos de los caídos · Sello de Resonancia', 'gold', 3400);
          audio.quest(); updateSideQuests(); saveGame(true);
        }
      });
      return;
    }
    openDialogue({ name: 'Solen', role: 'Archivista del Velo', npcId: 'solen', lines: [
      S.stage === 6 ? 'Los tres Ecos no son cerraduras. Son preguntas. Enciéndelos y el Templo recordará cómo abrirse.' : 'El Velo no separa el mundo del vacío. Separa al mundo de su propia memoria.',
      'Cuando llegues ante Vael, pregúntale por su hermana. La respuesta cambiará lo que crees que estás salvando.'
    ], onEnd: () => {} });
  }
}

function forgeUpgrade() {
  const p = S.player;
  if (p.gold < 80) { showToast('No tienes suficientes coronas (80).', 'danger', 1600); audio.error(); return; }
  if ((p.weaponUpgrade || 0) >= 3) { showToast('Tu arma ya ha alcanzado su límite terrenal.', 'danger', 1800); return; }
  p.gold -= 80; p.weaponUpgrade = (p.weaponUpgrade || 0) + 1; derive(p);
  audio.levelUp(); spawnBurst(p.x, p.y - 25, '#ffb15e', 24, 100, 'ember');
  showToast(`Arma reforzada · +2 ataque (${p.weaponUpgrade}/3)`, 'gold', 2200);
  updateHUD(true); saveGame(true);
}

function tryGate(gate) {
  if (gate.to === 'drakmor' && S.stage < 3) {
    showToast('La Puerta de Brasa está sellada. La Lágrima de la Primera Brasa debe despertar.', 'danger', 2600);
    audio.error(); return;
  }
  if (gate.to === 'kansordore' && S.stage < 5) {
    showToast('El Portal de Ceniza duerme. La Forja Corrupta aún late en Drakmor.', 'danger', 2600);
    audio.error(); return;
  }
  transitionRegion(gate.to);
}

function transitionRegion(to) {
  if (S.transitionLock || !S.world) return;
  S.transitionLock = true;
  saveGame(true);
  const p = S.player;
  const spawns = {
    valdoria: { x: 2550, y: 900 }, drakmor: { x: 180, y: 920 }, kansordore: { x: 220, y: 930 }
  };
  const sp = spawns[to] || REGIONS[to].spawn;
  S.regionId = to;
  S.world = createWorld(to);
  p.x = sp.x; p.y = sp.y; p.hp = p.maxHp; p.mana = p.maxMana; p.stam = p.maxStam;
  p.companion = null;
  S.boss = null; S.projectiles = []; S.particles = []; S.telegraphs = []; S.rings = [];
  S.camera.x = p.x; S.camera.y = p.y;
  updateCamera(0);
  const region = REGIONS[to];
  showAreaBanner(region);
  audio.startMusic(to);
  if (to === 'drakmor' && S.stage === 3) setStage(4);
  if (to === 'kansordore' && S.stage === 5) setStage(6);
  ensureBoss(S.world);
  updateHUD(true);
  saveGame(true);
  setTimeout(() => { S.transitionLock = false; }, 900);
  if (to === 'drakmor') showToast('DRAKMOR · El aire sabe a hierro y a algo que recuerda a casa.', 'danger', 3400);
  if (to === 'kansordore') showToast('KANSORDORE · Bajo tus pies, el cielo aprende a caminar.', 'blue', 3400);
}

// ---------------- Final ----------------
function showFinalChoice() {
  const p = S.player;
  const choices = [
    { text: 'Forjar un nuevo Velo. Que el mundo duerma sin miedo. (Ascensión)', action: () => finishGame('ascension') },
    { text: 'Romper el Velo. Que el mundo vea lo que hay al otro lado. (Ruptura)', action: () => finishGame('rupture') }
  ];
  if (p.creatures.length >= 10) {
    choices.push({ text: 'Escuchar al Velo. Que nadie vuelva a ser solo un jugador. (Convergencia)', action: () => finishGame('convergence') });
  }
  openDialogue({
    name: 'La Espada Celestial', role: 'EL NOMBRE QUE RECUERDAS', npcId: 'sword',
    lines: [
      'Vael ya no está. En su lugar queda una grieta del tamaño exacto de una promesa.',
      'La Espada no te pide que ganes. Te pide que nombres lo que viene. El Velo escucha. El mundo escucha. Y tú, por primera vez, recuerdas tu nombre.',
      '¿Qué será de la costura entre lo que recordamos y lo que decidimos olvidar?'
    ],
    choices,
    onEnd: () => { if (S.mode !== 'ending') showFinalChoice(); }
  });
}

function finishGame(choice) {
  const p = S.player;
  S.stage = 8;
  S.flags.ending = choice;
  const ending = ENDINGS[choice];
  $('#ending-title').textContent = ending.title;
  $('#ending-text').textContent = ending.text;
  const mins = Math.floor((p.playtime || S.playtime) / 60);
  $('#ending-stats').innerHTML = `
    <div><span>Nivel</span><b>${p.level}</b></div>
    <div><span>Vínculos</span><b>${p.creatures.length}/12</b></div>
    <div><span>Misiones</span><b>${p.questsDone}</b></div>
    <div><span>Tiempo</span><b>${mins} min</b></div>`;
  $('#screen-ending').classList.add('active');
  $('#hud').classList.add('hidden');
  S.mode = 'ending';
  audio.startMusic('menu');
  saveGame(true);
}

function showEndingContinue() {
  $('#screen-ending').classList.remove('active');
  S.mode = 'playing';
  showHUD(true);
  saveGame(true);
}

// ---------------- Interfaz general ----------------
function showToast(text, type = '', duration = 2400) {
  const wrap = $('#toasts');
  const el = document.createElement('div');
  el.className = 'toast ' + type;
  el.textContent = text;
  wrap.appendChild(el);
  while (wrap.children.length > 4) wrap.firstChild.remove();
  setTimeout(() => { el.classList.add('out'); setTimeout(() => el.remove(), 420); }, duration);
}
function showAreaBanner(region) {
  const el = $('#area-banner');
  $('#area-kicker').textContent = region.chapter || 'REGIÓN';
  $('#area-name').textContent = region.name;
  $('#area-sub').textContent = region.subtitle;
  el.classList.add('hidden');
  void el.offsetWidth;
  el.classList.remove('hidden');
  clearTimeout(S.areaTimer);
  S.areaTimer = setTimeout(() => el.classList.add('hidden'), 4600);
}
function showHUD(show) {
  $('#hud').classList.toggle('hidden', !show);
}
function hideScreens() {
  $$('.screen').forEach(s => s.classList.remove('active'));
}
function showTitle() {
  if (S.player) saveGame(true);
  hideScreens();
  $('#screen-title').classList.add('active');
  $('#hud').classList.add('hidden');
  $('#dialogue').classList.add('hidden');
  $('#cinematic').classList.add('hidden');
  $('#screen-pause').classList.remove('active');
  $('#screen-ending').classList.remove('active');
  S.mode = 'title';
  S.boss = null;
  updateContinueButton();
  audio.startMusic('menu');
}
function updateContinueButton() {
  const has = !!localStorage.getItem(SAVE_KEY);
  $('#btn-continue').disabled = !has;
  if (has) {
    try {
      const data = JSON.parse(localStorage.getItem(SAVE_KEY));
      const r = REGIONS[data.regionId] || REGIONS.valdoria;
      $('#continue-sub').textContent = `${data.player?.name || 'Portador'} · ${r.name} · Nv. ${data.player?.level || 1}`;
    } catch { $('#continue-sub').textContent = 'Crónica guardada'; }
  } else $('#continue-sub').textContent = 'No hay crónica guardada';
}
function newGame() {
  hideScreens();
  S.mode = 'creator';
  S.creatorConfig = { name: 'Aurel', face: 0, hair: 0, hairColor: '#3b2417', skin: '#e2b58e', armor: 0, helmet: 0, weapon: 0, accessory: 0, boon: 'str' };
  syncCreatorUI();
  updateCreatorStats();
  drawCreatorPreview();
  $('#screen-creator').classList.add('active');
  $('#hud').classList.add('hidden');
  audio.startMusic('menu');
}
function syncCreatorUI() {
  const cfg = S.creatorConfig;
  $('#char-name').value = cfg.name;
  $('#name-count').textContent = `${cfg.name.length}/16`;
  $$('[data-group]').forEach(group => {
    const key = group.dataset.group;
    $$('button[data-value]', group).forEach(btn => {
      const v = btn.dataset.value;
      const match = typeof cfg[key] === 'number' ? String(cfg[key]) === v : cfg[key] === v;
      btn.classList.toggle('active', match);
    });
  });
}
function updateCreatorStats() {
  const p = makePlayer(S.creatorConfig);
  $('#preview-hp').textContent = p.maxHp;
  $('#preview-mana').textContent = p.maxMana;
  $('#preview-str').textContent = p.stats.fuerza;
  $('#preview-res').textContent = p.stats.inteligencia;
}
function startNewGame() {
  const cfg = { ...S.creatorConfig };
  const p = makePlayer(cfg);
  S.player = p;
  S.stage = 0; S.flags = {}; S.side = { s0: 'inactive', s1: 'inactive', s2: 'inactive' };
  S.loreRead = []; S.seals = [false, false, false];
  S.regionId = 'valdoria';
  S.world = createWorld('valdoria');
  p.x = REGIONS.valdoria.spawn.x; p.y = REGIONS.valdoria.spawn.y;
  S.camera.x = p.x; S.camera.y = p.y;
  S.camera.zoom = clamp(Math.min(S.w / 1200, S.h / 700), .66, 1.15);
  hideScreens();
  showHUD(true);
  S.mode = 'playing';
  S.gameStarted = true;
  S.playtime = 0;
  updateHUD(true);
  updateQuestUI();
  updatePartyUI();
  audio.startMusic('valdoria');
  saveGame(true);
  playCinematic('prologue', () => {
    playCinematic('awakening', () => {
      showAreaBanner(REGIONS.valdoria);
      const touch = S.settings.touch || matchMedia('(pointer: coarse)').matches || innerWidth < 820;
      showToast(touch ? 'Joystick: moverte · Atacar, Esquivar, Resonancia e Interactuar con los botones.' : 'WASD / joystick: moverte · J: atacar · K: esquivar · L: bloquear · E: interactuar', 'gold', 5200);
      setTimeout(() => showToast('Objetivo: habla con Elara en la plaza de Lumen.', 'blue', 3400), 1800);
    });
  });
}

// ---------------- Guardado ----------------
function saveGame(silent = false) {
  if (!S.player) return;
  try {
    const p = S.player;
    const data = {
      v: 1, timestamp: Date.now(), regionId: S.regionId, stage: S.stage,
      flags: S.flags, side: S.side, loreRead: S.loreRead, seals: S.seals,
      playtime: S.playtime,
      player: {
        name: p.name, config: p.config, level: p.level, xp: p.xp, xpNext: p.xpNext, statPoints: p.statPoints,
        stats: p.stats, equipment: p.equipment, owned: p.owned, inventory: p.inventory, materials: p.materials,
        gold: p.gold, creatures: p.creatures, party: p.party, activeCreature: p.activeCreature,
        creatureCooldowns: p.creatureCooldowns, x: p.x, y: p.y, hp: p.hp, mana: p.mana, stam: p.stam,
        weaponUpgrade: p.weaponUpgrade, kills: p.kills, captured: p.captured, shrines: p.shrines,
        questsDone: p.questsDone, playtime: p.playtime
      }
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify(data));
    S.lastSave = performance.now();
    updateContinueButton();
    if (!silent) { showToast('Crónica guardada en el Velo.', 'gold', 1800); audio.ui(); }
  } catch (e) { if (!silent) showToast('No se pudo guardar la crónica.', 'danger', 1800); }
}
function loadGame() {
  let data;
  try { data = JSON.parse(localStorage.getItem(SAVE_KEY)); } catch {}
  if (!data || !data.player) { showToast('No hay crónica guardada.', 'danger', 1500); return; }
  const p = makePlayer(data.player.config || {});
  Object.assign(p, data.player);
  p.config = data.player.config || p.config;
  p.stats = { ...makePlayer({}).stats, ...(data.player.stats || {}) };
  p.inventory = { ...data.player.inventory };
  p.materials = { ...data.player.materials };
  p.equipment = { ...data.player.equipment };
  p.creatureCooldowns = { ...(data.player.creatureCooldowns || {}) };
  p.owned = [...new Set([...p.owned, ...(data.player.owned || [])])];
  p.creatures = [...(data.player.creatures || [])];
  p.party = [...(data.player.party || [])];
  p.activeCreature = data.player.activeCreature || p.party[0] || null;
  p.companion = null;
  S.player = p;
  S.regionId = data.regionId || 'valdoria';
  S.stage = data.stage ?? 0;
  S.flags = data.flags || {};
  S.side = data.side || { s0: 'inactive', s1: 'inactive', s2: 'inactive' };
  S.loreRead = data.loreRead || [];
  S.seals = data.seals || [false, false, false];
  S.playtime = data.playtime || 0;
  derive(p);
  p.hp = Math.max(1, p.hp || p.maxHp); p.mana = p.mana ?? p.maxMana; p.stam = p.stam ?? p.maxStam;
  S.world = createWorld(S.regionId);
  // aplicar estado de props leídos/abiertos
  for (const prop of S.world.props) {
    if (prop.type === 'lore' && S.loreRead.includes(prop.loreId)) prop.read = true;
    if (prop.type === 'seal' && S.seals[prop.sealIndex]) prop.on = true;
  }
  S.camera.x = p.x; S.camera.y = p.y;
  S.boss = null;
  ensureBoss(S.world);
  hideScreens();
  showHUD(true);
  S.mode = 'playing';
  updateCamera(0);
  updateHUD(true); updateQuestUI(); updatePartyUI();
  audio.startMusic(S.regionId);
  showAreaBanner(REGIONS[S.regionId]);
  showToast(`Crónica recuperada · ${REGIONS[S.regionId].name}`, 'gold', 2600);
  saveGame(true);
}

// ---------------- Panel / diario ----------------
function openTitlePanel(tab) {
  if (!S.demoPlayer) S.demoPlayer = makePlayer({ name: 'Aurel' });
  S.panelFromTitle = true;
  S.demoPlayer.creatures = [];
  openPanel(tab, true);
}
function openPanel(tab = 'hero', fromTitle = false) {
  if (!S.player && !fromTitle) return;
  S.panelTab = tab;
  S.panelFromTitle = fromTitle;
  S.mode = fromTitle ? 'title-panel' : 'paused';
  hideScreens();
  $('#screen-pause').classList.add('active');
  $('#interact-prompt').classList.add('hidden');
  renderPanel();
  audio.ui();
}
function closePanel() {
  $('#screen-pause').classList.remove('active');
  if (S.panelFromTitle) {
    S.panelFromTitle = false;
    showTitle();
  } else {
    S.mode = 'playing';
    showHUD(true);
    updateHUD(true);
  }
}
function panelPlayer() { return S.player || S.demoPlayer || makePlayer({}); }

function renderPanel() {
  const p = panelPlayer();
  const tab = S.panelTab || 'hero';
  $$('.pause-nav [data-tab]').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
  $$('.tab-pane').forEach(pane => pane.classList.toggle('active', pane.id === 'tab-' + tab));
  $('#pause-place').textContent = S.panelFromTitle ? 'Códice del Velo' : `${REGIONS[S.regionId]?.name || 'Valdoria'} · ${regionPlace()}`;
  $('#pause-save').style.display = S.panelFromTitle ? 'none' : 'flex';
  $('#pause-quit').style.display = S.panelFromTitle ? 'none' : 'flex';
  $('#pause-heading').textContent = S.panelFromTitle ? (tab === 'collection' ? 'Códice de criaturas' : 'Opciones') : 'Diario de viaje';
  if (tab === 'hero') renderHero(p);
  if (tab === 'quests') renderQuests(p);
  if (tab === 'collection') renderCollection(p);
  if (tab === 'inventory') renderInventory(p);
  if (tab === 'map') renderWorldMapPanel(p);
  if (tab === 'options') renderOptions();
}
function regionPlace() {
  const places = { valdoria: 'Aldea de Lumen', drakmor: 'Campamento de Ceniza', kansordore: 'Templo del Primer Alba' };
  return places[S.regionId] || 'Sendero del Velo';
}

function renderHero(p) {
  const app = getAppearance(p);
  drawPortrait(sheetPortrait, app, S.time);
  $('#sheet-name').textContent = p.name;
  $('#sheet-level').textContent = p.level;
  $('#sheet-xp').textContent = `${p.xp} / ${p.xpNext} XP`;
  $('#sheet-xp-bar').style.width = `${clamp(p.xp / p.xpNext * 100, 0, 100)}%`;
  $('#points-left').textContent = p.statPoints;
  const stats = [
    ['vida', 'Vida', 'Vida máxima'], ['mana', 'Maná', 'Maná máximo'], ['res', 'Resistencia', 'Aguante y esquiva'],
    ['fuerza', 'Fuerza', 'Daño físico'], ['defensa', 'Defensa', 'Reduce el daño'], ['velocidad', 'Velocidad', 'Movimiento y ataque'],
    ['inteligencia', 'Inteligencia', 'Poder de Arte y Resonancia'], ['suerte', 'Suerte', 'Crítico, botín y captura']
  ];
  $('#stat-list').innerHTML = stats.map(([k, label, desc]) => `
    <div class="stat-row" title="${desc}">
      <span>${label}</span>
      <span class="stat-val">${p.stats[k]}</span>
      <button class="stat-plus ${p.statPoints <= 0 ? 'disabled' : ''}" data-stat="${k}" title="Añadir punto a ${label}">+</button>
    </div>`).join('');
  $('#derived-grid').innerHTML = `
    <div><span>Ataque</span><b>${p.atk}</b></div>
    <div><span>Defensa</span><b>${p.def}</b></div>
    <div><span>Crítico</span><b>${p.crit}%</b></div>
    <div><span>Resonancia</span><b>${p.resPower}</b></div>
    <div><span>Vida</span><b>${Math.ceil(p.hp)}/${p.maxHp}</b></div>
    <div><span>Maná</span><b>${Math.ceil(p.mana)}/${p.maxMana}</b></div>
    <div><span>Resistencia</span><b>${Math.ceil(p.stam)}/${p.maxStam}</b></div>
    <div><span>Captura</span><b>+${Math.round(p.luck * 1.5)}%</b></div>`;
  const slots = [['weapon', 'Arma'], ['armor', 'Armadura'], ['helmet', 'Casco'], ['charm', 'Talismán']];
  $('#equipment-slots').innerHTML = slots.map(([slot, label]) => {
    const it = equippedItem(p, slot);
    return `<div class="equip-slot" data-slot="${slot}"><span>${label}</span><b>${it.name}</b><small>${slot === 'weapon' ? '+' + it.atk + ' ataque' : slot === 'armor' ? '+' + it.def + ' defensa' : slot === 'helmet' ? '+' + it.def + ' defensa' : (it.luck ? '+' + it.luck + ' suerte' : '—')}</small></div>`;
  }).join('');
  const traits = [];
  for (const id of p.party) {
    const c = CREATURE_BY_ID[id];
    if (c) traits.push(`<div class="trait"><b>${c.name}</b><span>${c.passive}</span></div>`);
  }
  if (!traits.length) traits.push('<div class="trait"><span>Sin vínculos activos. Las criaturas capturadas otorgan dones pasivos.</span></div>');
  $('#trait-list').innerHTML = traits.join('');
  $$('#equipment-slots .equip-slot').forEach(el => el.addEventListener('click', () => { S.panelTab = 'inventory'; renderPanel(); }));
}
function renderQuests(p) {
  const main = QUESTS.map((q, i) => {
    const status = i < S.stage ? 'done' : i === S.stage ? 'active' : '';
    if (i > S.stage + 1) return '';
    return `<div class="quest-entry ${status}"><h5>${status === 'done' ? '✓ ' : status === 'active' ? '✦ ' : ''}${q.title}</h5><p>${q.objective}</p>${status === 'active' ? `<div class="q-reward">Recompensa: ${q.xp} XP · ${q.gold} coronas</div>` : ''}</div>`;
  }).join('');
  $('#main-quest-list').innerHTML = main || '<div class="quest-entry"><p>El Velo aún no ha escrito tu próxima página.</p></div>';
  const sides = SIDE_QUESTS.map(q => {
    const st = S.side[q.id];
    if (st === 'inactive') return `<div class="quest-entry"><h5>? ${q.title}</h5><p>Un eco espera ser escuchado. Habla con los habitantes del mundo.</p></div>`;
    return `<div class="quest-entry ${st === 'done' ? 'done' : 'active'}"><h5>${st === 'done' ? '✓ ' : '✦ '}${q.title}</h5><p>${q.objective}</p><div class="q-reward">${st === 'done' ? 'Completada' : 'Recompensa: ' + q.reward}</div></div>`;
  }).join('');
  $('#side-quest-list').innerHTML = sides;
}
function renderCollection(p) {
  const unlocked = new Set(p.creatures || []);
  $('#collection-count').textContent = `${unlocked.size} / ${CREATURES.length} resonancias descubiertas`;
  const grid = $('#creature-grid');
  grid.innerHTML = '';
  for (const c of CREATURES) {
    const isU = unlocked.has(c.id);
    const card = document.createElement('button');
    card.className = 'creature-card' + (isU ? '' : ' locked');
    card.innerHTML = `<span class="c-star">${'★'.repeat(c.stars)}</span><canvas width="100" height="100"></canvas><span class="c-name">${isU ? c.name : '???'}</span><span class="c-elem">${isU ? ELEMENTS[c.element].name : 'Eco perdido'}</span>`;
    const cv = card.querySelector('canvas');
    const g = cv.getContext('2d');
    if (isU) drawCreature(g, c, 50, 82, 1.45, S.time, { glow: .12 });
    else {
      g.fillStyle = 'rgba(180,200,220,.08)'; g.beginPath(); g.arc(50, 50, 30, 0, TAU); g.fill();
      g.fillStyle = 'rgba(180,200,220,.25)'; g.font = '28px serif'; g.textAlign = 'center'; g.fillText('?', 50, 60);
    }
    card.addEventListener('click', () => { S.selectedCreature = isU ? c.id : null; renderCollection(p); audio.ui(); });
    grid.appendChild(card);
  }
  const detail = $('#creature-detail');
  if (S.selectedCreature) {
    const c = CREATURE_BY_ID[S.selectedCreature];
    detail.classList.remove('hidden');
    detail.innerHTML = `<canvas width="100" height="100"></canvas><div><span class="cd-sub">${c.rarity} · ${ELEMENTS[c.element].name}</span><h3>${c.name}</h3><p>${c.lore}</p><div class="cd-stats"><span>${c.passive}</span></div><div class="cd-stats"><span>◈ ${c.ability}</span></div><p>${c.abilityDesc}</p></div>`;
    drawCreature(detail.querySelector('canvas').getContext('2d'), c, 50, 82, 1.4, S.time, { glow: .2 });
  } else detail.classList.add('hidden');
}
function renderInventory(p) {
  const all = [...WEAPONS, ...ARMORS, ...HELMETS, ...CHARMS];
  const owned = [...new Set(p.owned || [])].map(id => all.find(i => i.id === id)).filter(Boolean);
  const groups = [['Arma', 'weapon'], ['Armadura', 'armor'], ['Casco', 'helmet'], ['Talismán', 'charm']];
  $('#inventory-equipment').innerHTML = groups.map(([label, slot]) => {
    const items = owned.filter(i => i.slot === slot);
    return `<div class="inv-item" style="background:rgba(236,213,159,.03)"><div><b>${label}</b><small>${equippedItem(p, slot).name}</small></div><span class="inv-count">Equipado</span></div>` + items.map(it => {
      const eq = p.equipment[slot] === it.id;
      const stat = slot === 'weapon' ? `+${it.atk} ataque` : slot === 'armor' ? `+${it.def} def · +${it.hp} vida` : slot === 'helmet' ? `+${it.def} def` : [it.luck && `+${it.luck} suerte`, it.mana && `+${it.mana} maná`, it.atk && `+${it.atk} ataque`].filter(Boolean).join(' · ') || '—';
      return `<div class="inv-item ${eq ? 'equipped' : ''}" data-equip="${it.id}"><div><b>${it.name}</b><small>${stat}</small></div><span class="inv-count">${eq ? '✓' : 'Equipar'}</span></div>`;
    }).join('');
  }).join('');
  $('#inventory-items').innerHTML = Object.entries(p.inventory || {}).filter(([, n]) => n > 0).map(([id, n]) => {
    const it = ITEMS[id] || { name: id, icon: '•', desc: '' };
    return `<div class="inv-item" data-item="${id}"><div><b>${it.icon || '•'} ${it.name}</b><small>${it.desc}</small></div><span class="inv-count">×${n}</span></div>`;
  }).join('') || '<div class="inv-item"><div><b>Sin objetos</b><small>La alforja está vacía.</small></div></div>';
  $('#inventory-materials').innerHTML = Object.entries(p.materials || {}).filter(([, n]) => n > 0).map(([id, n]) => {
    const names = { ember: 'Fragmento de brasa', flower: 'Flor de alba', lagrima: 'Lágrima de la Primera Brasa', core: 'Núcleo de Forja', relic: 'Sello antiguo', key: 'Llave del Velo' };
    return `<div class="inv-item"><div><b>${names[id] || id}</b><small>Material de Resonancia</small></div><span class="inv-count">×${n}</span></div>`;
  }).join('') || '<div class="inv-item"><div><b>Sin materiales</b><small>El mundo aún guarda secretos.</small></div></div>';
  $$('#inventory-equipment [data-equip]').forEach(el => el.addEventListener('click', () => equipItem(el.dataset.equip)));
  $$('#inventory-items [data-item]').forEach(el => el.addEventListener('click', () => {
    if (el.dataset.item === 'potion') usePotion(); else if (el.dataset.item === 'ether') useEther();
    renderPanel(); updateHUD(true);
  }));
}
function equipItem(id) {
  const p = S.player; if (!p) return;
  const all = [...WEAPONS, ...ARMORS, ...HELMETS, ...CHARMS];
  const item = all.find(i => i.id === id); if (!item) return;
  p.equipment[item.slot] = id;
  derive(p);
  audio.ui();
  showToast(`Equipado: ${item.name}`, 'gold', 1600);
  updateHUD(true); renderPanel(); saveGame(true);
}
function renderWorldMapPanel(p) {
  drawWorldMap();
  $('#region-cards').innerHTML = Object.values(REGIONS).map(r => {
    const unlocked = r.id === 'valdoria' || (r.id === 'drakmor' && S.stage >= 3) || (r.id === 'kansordore' && S.stage >= 5);
    return `<div class="region-card ${unlocked ? '' : 'locked'}"><b>${r.name}</b><small>${unlocked ? r.subtitle : 'Sellada por el Velo'}</small></div>`;
  }).join('');
}
function renderOptions() {
  $('#opt-volume').value = S.settings.volume;
  $('#opt-music').value = S.settings.music;
  $('#opt-sfx').value = S.settings.sfx;
  $('#opt-motion').checked = !!S.settings.motion;
  $('#opt-contrast').checked = !!S.settings.contrast;
  $('#opt-damage').checked = !!S.settings.damage;
  $('#opt-touch').checked = !!S.settings.touch;
}
function drawWorldMap() {
  const g = worldMap.getContext('2d');
  const w = worldMap.width, h = worldMap.height;
  g.clearRect(0, 0, w, h);
  const bg = g.createRadialGradient(w * .5, h * .45, 50, w * .5, h * .5, 600);
  bg.addColorStop(0, '#162135'); bg.addColorStop(1, '#070b13');
  g.fillStyle = bg; g.fillRect(0, 0, w, h);
  // mar / niebla
  for (let i = 0; i < 30; i++) {
    g.strokeStyle = `rgba(120,160,200,${.02 + (i % 3) * .01})`; g.lineWidth = 1;
    g.beginPath(); g.ellipse(w * .5, h * .5, 130 + i * 24, 70 + i * 14, -.2, 0, TAU); g.stroke();
  }
  // VALDORIA
  g.save(); g.translate(245, 330);
  g.fillStyle = '#334d39'; g.strokeStyle = 'rgba(220,200,140,.45)'; g.lineWidth = 2;
  g.beginPath(); g.moveTo(-150, 15); g.bezierCurveTo(-120, -125, 60, -150, 160, -55); g.bezierCurveTo(210, 20, 140, 135, 30, 145); g.bezierCurveTo(-90, 155, -185, 100, -150, 15); g.fill(); g.stroke();
  g.fillStyle = 'rgba(190,210,160,.18)'; g.beginPath(); g.ellipse(-35, -20, 80, 55, .3, 0, TAU); g.fill();
  g.fillStyle = '#d9c583'; g.font = 'bold 13px Georgia'; g.textAlign = 'center'; g.fillText('VALDORIA', 0, 15);
  g.font = '9px sans-serif'; g.fillStyle = 'rgba(246,239,223,.55)'; g.fillText('Cuna de la Gema', 0, 31);
  g.restore();
  // DRAKMOR
  g.save(); g.translate(520, 275);
  g.fillStyle = '#4b2c28'; g.strokeStyle = 'rgba(255,150,100,.45)'; g.lineWidth = 2;
  g.beginPath(); g.moveTo(-135, -35); g.bezierCurveTo(-80, -135, 90, -140, 145, -30); g.bezierCurveTo(180, 50, 100, 125, -10, 130); g.bezierCurveTo(-120, 130, -180, 50, -135, -35); g.fill(); g.stroke();
  g.fillStyle = 'rgba(255,100,50,.35)'; g.beginPath(); g.moveTo(-30, -95); g.lineTo(5, -30); g.lineTo(-25, 50); g.lineTo(30, 115); g.lineWidth = 3; g.strokeStyle = 'rgba(255,120,60,.4)'; g.stroke();
  g.fillStyle = '#ffb27c'; g.font = 'bold 13px Georgia'; g.textAlign = 'center'; g.fillText('DRAKMOR', 0, 15);
  g.font = '9px sans-serif'; g.fillStyle = 'rgba(246,239,223,.55)'; g.fillText('Donde la montaña arde', 0, 31);
  g.restore();
  // KANSORDORE
  g.save(); g.translate(790, 350);
  g.fillStyle = '#313d59'; g.strokeStyle = 'rgba(180,210,255,.5)'; g.lineWidth = 2;
  g.beginPath(); g.moveTo(-130, -40); g.bezierCurveTo(-80, -135, 95, -120, 140, -20); g.bezierCurveTo(170, 70, 70, 135, -20, 130); g.bezierCurveTo(-120, 125, -175, 45, -130, -40); g.fill(); g.stroke();
  g.fillStyle = 'rgba(180,210,255,.2)'; g.beginPath(); g.ellipse(10, -10, 55, 55, 0, 0, TAU); g.fill();
  g.fillStyle = '#dce8ff'; g.font = 'bold 13px Georgia'; g.textAlign = 'center'; g.fillText('KANSORDORE', 0, 15);
  g.font = '9px sans-serif'; g.fillStyle = 'rgba(246,239,223,.55)'; g.fillText('El templo que sostiene el cielo', 0, 31);
  g.restore();
  // rutas
  g.strokeStyle = 'rgba(236,213,159,.35)'; g.lineWidth = 1.5; g.setLineDash([5, 6]);
  g.beginPath(); g.moveTo(390, 335); g.bezierCurveTo(440, 310, 460, 300, 485, 290); g.stroke();
  g.beginPath(); g.moveTo(665, 290); g.bezierCurveTo(700, 300, 710, 330, 730, 350); g.stroke();
  g.setLineDash([]);
  // marcador
  const pos = { valdoria: [245, 330], drakmor: [520, 275], kansordore: [790, 350] }[S.regionId] || [245, 330];
  const pulse = 8 + Math.sin(S.time * 3) * 3;
  g.strokeStyle = '#fff1c2'; g.lineWidth = 2; g.beginPath(); g.arc(pos[0], pos[1] - 28, pulse, 0, TAU); g.stroke();
  g.fillStyle = '#fff1c2'; g.beginPath(); g.arc(pos[0], pos[1] - 28, 3.5, 0, TAU); g.fill();
  g.fillStyle = 'rgba(246,239,223,.4)'; g.font = '10px sans-serif'; g.textAlign = 'left'; g.fillText('EL MUNDO DE LAS TRES LUCES', 34, 42);
  g.fillStyle = 'rgba(236,213,159,.6)'; g.font = '9px sans-serif'; g.fillText('La Convergencia se acerca.', 34, 58);
}

// ---------------- HUD ----------------
let hudTick = 0, portraitTick = 0, minimapTick = 0;
function updateHUD(force = false) {
  const p = S.player; if (!p) return;
  hudTick += 1;
  if (!force && hudTick % 4 !== 0) return;
  $('#hud-name').textContent = p.name;
  $('#hud-title').textContent = S.stage >= 7 ? 'Jugador Cero' : S.stage >= 3 ? 'Portador de la Lágrima' : 'Portador del Alba';
  $('#player-level').textContent = p.level;
  $('#hud-xp-level').textContent = p.level;
  $('#bar-hp').style.width = `${clamp(p.hp / p.maxHp * 100, 0, 100)}%`;
  $('#txt-hp').textContent = `${Math.ceil(p.hp)} / ${p.maxHp}`;
  $('#bar-mana').style.width = `${clamp(p.mana / p.maxMana * 100, 0, 100)}%`;
  $('#txt-mana').textContent = `${Math.ceil(p.mana)} / ${p.maxMana}`;
  $('#bar-stamina').style.width = `${clamp(p.stam / p.maxStam * 100, 0, 100)}%`;
  $('#bar-xp').style.width = `${clamp(p.xp / p.xpNext * 100, 0, 100)}%`;
  $('#hud-gold').textContent = `◈ ${fmt(p.gold)}`;
  const q = questText();
  $('#quest-title').textContent = q.title;
  $('#quest-objective').textContent = q.objective;
  $('#hud-region').textContent = REGIONS[S.regionId]?.name || 'VALDORIA';
  $('#hud-time').textContent = REGIONS[S.regionId]?.time || '06:40';
  const target = getObjectiveTarget();
  if (target && target.region === S.regionId) {
    const d = Math.hypot(target.x - p.x, target.y - p.y);
    $('#quest-distance').textContent = d < 100 ? 'Aquí · ' + target.label : `${Math.round(d / 10)} m · ${target.label}`;
    const a = Math.atan2(target.y - p.y, target.x - p.x);
    $('#quest-compass').style.transform = `rotate(${a + Math.PI / 2}rad)`;
  } else if (target) {
    $('#quest-distance').textContent = `En ${REGIONS[target.region]?.name || 'otra región'}`;
    $('#quest-compass').style.transform = 'rotate(0rad)';
  } else {
    $('#quest-distance').textContent = 'El mundo es tuyo';
    $('#quest-compass').style.transform = 'rotate(0rad)';
  }
  // retrato
  portraitTick++;
  if (force || portraitTick % 30 === 0) drawPortrait(hudPortrait, getAppearance(p), S.time);
  // estados
  const st = [];
  if (p.shield > 0) st.push('Escudo');
  if (p.captureBuff > 0) st.push('Ojo del Velo');
  if (p.block) st.push('Guardia');
  if (p.slow > 0) st.push('Ralentizado');
  $('#status-icons').innerHTML = st.map(s => `<span class="status-pill">${s}</span>`).join('');
  // jefe
  const boss = S.boss && !S.boss.dead && (
    S.boss.intro > 0 || S.boss.state !== 'idle' || S.boss.hp < S.boss.maxHp ||
    Math.hypot(S.boss.x - p.x, S.boss.y - p.y) < 620
  ) ? S.boss : null;
  if (boss) {
    $('#boss-bar').classList.remove('hidden');
    $('#boss-name').textContent = boss.type.name;
    $('#boss-sub').textContent = boss.type.title;
    const pct = clamp(boss.hp / boss.maxHp * 100, 0, 100);
    $('#boss-fill').style.width = pct + '%';
    $('#boss-ghost').style.transform = `scaleX(${pct / 100})`;
    $$('.boss-phases span').forEach((s, i) => s.classList.toggle('on', boss.phase > i));
  } else {
    $('#boss-bar').classList.add('hidden');
  }
  // minimapa
  minimapTick++;
  if (force || minimapTick % 6 === 0) drawMinimap();
}
function showBossBar(b) {
  if (!b) return;
  $('#boss-bar').classList.remove('hidden');
  $('#boss-name').textContent = b.type.name;
  $('#boss-sub').textContent = b.type.title;
}
function updatePartyUI() {
  const p = S.player; if (!p) return;
  const wrap = $('#party-slots'); wrap.innerHTML = '';
  for (let i = 0; i < 3; i++) {
    const id = p.party[i];
    const slot = document.createElement('button');
    slot.className = 'party-slot' + (id ? '' : ' empty') + (id && p.activeCreature === id ? ' active' : '');
    if (!id) { slot.innerHTML = '<span>+</span>'; slot.title = 'Vínculo vacío'; }
    else {
      const def = CREATURE_BY_ID[id];
      const cv = document.createElement('canvas'); cv.width = 58; cv.height = 58;
      slot.appendChild(cv);
      slot.title = `${def.name} · ${def.ability}`;
      const g = cv.getContext('2d');
      drawCreature(g, def, 29, 46, .9, S.time, { glow: .12 });
      const key = document.createElement('span'); key.className = 'key'; key.textContent = i + 1;
      slot.appendChild(key);
      slot.addEventListener('click', () => {
        p.activeCreature = id; p.companion = null; derive(p); updatePartyUI(); updateHUD(true); audio.ui();
        showToast(`Vínculo activo: ${def.name}`, 'blue', 1500);
      });
    }
    wrap.appendChild(slot);
  }
}
function drawMinimap() {
  const p = S.player, world = S.world;
  if (!p || !world) return;
  const g = minimap.getContext('2d');
  const w = minimap.width, h = minimap.height;
  g.clearRect(0, 0, w, h);
  g.fillStyle = '#0b1220'; g.fillRect(0, 0, w, h);
  const sx = w / world.region.width, sy = h / world.region.height;
  const scale = Math.min(sx, sy);
  const ox = (w - world.region.width * scale) / 2, oy = (h - world.region.height * scale) / 2;
  g.save(); g.translate(ox, oy); g.scale(scale, scale);
  g.globalAlpha = .65;
  g.drawImage(world.terrain, 0, 0, world.region.width, world.region.height);
  g.globalAlpha = 1;
  // enemigos
  g.fillStyle = 'rgba(216,95,98,.7)';
  for (const e of world.enemies) if (!e.dead && !e.boss) { g.beginPath(); g.arc(e.x, e.y, 16, 0, TAU); g.fill(); }
  // criaturas
  g.fillStyle = 'rgba(126,200,227,.9)';
  for (const c of world.wilds) if (!c.captured) { g.beginPath(); g.arc(c.x, c.y, 12, 0, TAU); g.fill(); }
  // aliados
  g.fillStyle = 'rgba(126,200,227,.8)';
  for (const n of world.npcs) { g.beginPath(); g.arc(n.x, n.y, 12, 0, TAU); g.fill(); }
  // objetivo
  const t = getObjectiveTarget();
  if (t && t.region === S.regionId) {
    g.strokeStyle = '#ffe2a1'; g.lineWidth = 10; g.beginPath(); g.arc(t.x, t.y, 34 + Math.sin(S.time * 3) * 8, 0, TAU); g.stroke();
    g.fillStyle = '#ffe2a1'; g.beginPath(); g.arc(t.x, t.y, 12, 0, TAU); g.fill();
  }
  // jugador
  g.fillStyle = '#fff'; g.beginPath(); g.arc(p.x, p.y, 15, 0, TAU); g.fill();
  g.strokeStyle = 'rgba(255,255,255,.4)'; g.lineWidth = 4; g.beginPath(); g.arc(p.x, p.y, 24 + Math.sin(S.time * 2) * 3, 0, TAU); g.stroke();
  g.restore();
  // marco
  g.strokeStyle = 'rgba(236,213,159,.15)'; g.lineWidth = 1; g.strokeRect(.5, .5, w - 1, h - 1);
}

// ---------------- Render del mundo ----------------
function initScenes() {
  const r = mulberry32(1447);
  S.titleStars = Array.from({ length: 150 }, () => ({ x: r(), y: r() * .7, s: .4 + r() * 1.7, p: r() * TAU, a: .2 + r() * .7 }));
  S.titleMotes = Array.from({ length: 55 }, () => ({ x: r(), y: r(), s: .6 + r() * 2.4, p: r() * TAU, sp: .2 + r() * .6 }));
  S.weather = Array.from({ length: 85 }, () => ({ x: r(), y: r(), s: .5 + r() * 2.2, p: r() * TAU, sp: .2 + r() * .8 }));
  S.titleRocks = Array.from({ length: 8 }, (_, i) => ({ x: .55 + r() * .38, y: .2 + r() * .4, s: .4 + r() * .8, p: r() * TAU, d: .2 + r() * .8 }));
}

function renderTitleBackground(t) {
  const w = S.w, h = S.h;
  ctx.setTransform(S.dpr, 0, 0, S.dpr, 0, 0);
  ctx.clearRect(0, 0, w, h);
  const horizon = h * .68;
  const sky = ctx.createLinearGradient(0, 0, 0, horizon);
  sky.addColorStop(0, '#04070f');
  sky.addColorStop(.25, '#0c1528');
  sky.addColorStop(.55, '#26334d');
  sky.addColorStop(.78, '#705b5a');
  sky.addColorStop(1, '#c79a67');
  ctx.fillStyle = sky; ctx.fillRect(0, 0, w, h);
  // estrellas
  ctx.save();
  for (const s of S.titleStars) {
    const x = s.x * w, y = s.y * h;
    const a = s.a * (.55 + .45 * Math.sin(t * .7 + s.p));
    ctx.fillStyle = `rgba(238,242,255,${a})`;
    ctx.beginPath(); ctx.arc(x, y, s.s, 0, TAU); ctx.fill();
    if (s.s > 1.5) { ctx.strokeStyle = `rgba(210,225,255,${a * .35})`; ctx.lineWidth = .6; ctx.beginPath(); ctx.moveTo(x - 5, y); ctx.lineTo(x + 5, y); ctx.moveTo(x, y - 5); ctx.lineTo(x, y + 5); ctx.stroke(); }
  }
  ctx.restore();
  // aurora
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 4; i++) {
    const g = ctx.createLinearGradient(w * .1, h * .1, w * .9, h * .45);
    g.addColorStop(0, 'rgba(80,140,170,0)');
    g.addColorStop(.45, `rgba(${100 + i * 8},${180 - i * 10},${200 + i * 4},${.018 + i * .004})`);
    g.addColorStop(1, 'rgba(80,120,160,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(0, h * (.16 + i * .04));
    ctx.bezierCurveTo(w * .25, h * (.1 + i * .03), w * .55, h * (.3 - i * .01), w, h * (.18 + i * .04));
    ctx.lineTo(w, h * (.28 + i * .04));
    ctx.bezierCurveTo(w * .6, h * (.34 + i * .02), w * .25, h * (.25 + i * .03), 0, h * (.26 + i * .04));
    ctx.closePath(); ctx.fill();
  }
  ctx.restore();
  // luna / gema
  const mx = w * .735, my = h * .33, mr = Math.min(w, h) * .155;
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  glow(ctx, mx, my, mr * 2.7, '#e9c88a', .14);
  glow(ctx, mx, my, mr * 1.7, '#ffe6ad', .12);
  ctx.restore();
  const moon = ctx.createRadialGradient(mx - mr * .25, my - mr * .3, mr * .08, mx, my, mr);
  moon.addColorStop(0, '#fffbe8');
  moon.addColorStop(.45, '#e8d49d');
  moon.addColorStop(.82, '#a9824c');
  moon.addColorStop(1, '#5c4328');
  ctx.fillStyle = moon; ctx.beginPath(); ctx.arc(mx, my, mr, 0, TAU); ctx.fill();
  // sombras de la luna
  ctx.fillStyle = 'rgba(82,62,45,.18)';
  ctx.beginPath(); ctx.ellipse(mx - mr * .25, my - mr * .1, mr * .23, mr * .15, -.5, 0, TAU); ctx.fill();
  ctx.beginPath(); ctx.ellipse(mx + mr * .26, my + mr * .25, mr * .16, mr * .1, .4, 0, TAU); ctx.fill();
  // anillo celestial
  ctx.save();
  ctx.translate(mx, my); ctx.rotate(-.22);
  ctx.strokeStyle = 'rgba(255,231,177,.38)'; ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.ellipse(0, 0, mr * 1.42, mr * .33, 0, 0, TAU); ctx.stroke();
  ctx.strokeStyle = 'rgba(255,231,177,.12)'; ctx.lineWidth = 5;
  ctx.beginPath(); ctx.ellipse(0, 0, mr * 1.47, mr * .36, 0, 0, TAU); ctx.stroke();
  ctx.restore();
  // nubes
  for (let i = 0; i < 5; i++) {
    const cy = h * (.48 + i * .035), cx = ((t * (3 + i) + i * 300) % (w + 600)) - 300;
    const cg = ctx.createLinearGradient(0, cy - 30, 0, cy + 30);
    cg.addColorStop(0, 'rgba(220,200,180,0)'); cg.addColorStop(.5, `rgba(220,200,180,${.025 + i * .008})`); cg.addColorStop(1, 'rgba(220,200,180,0)');
    ctx.fillStyle = cg; ctx.beginPath(); ctx.ellipse(cx, cy, 220 + i * 50, 18 + i * 4, 0, 0, TAU); ctx.fill();
  }
  // montañas
  drawMountainRange(w, h, horizon, .72, '#182233', 70, 2, 1);
  drawMountainRange(w, h, horizon, .84, '#111927', 50, 7, 2);
  drawMountainRange(w, h, horizon, .95, '#0a0f18', 30, 13, 3);
  // ciudad lejana
  ctx.fillStyle = 'rgba(10,13,22,.9)';
  const cityX = w * .82, cityY = horizon - 8;
  for (let i = 0; i < 8; i++) {
    const tw = 5 + (i % 3) * 4, th = 20 + (i % 4) * 12;
    ctx.fillRect(cityX + i * 12 - 45, cityY - th, tw, th);
    if (i % 2 === 0) { ctx.beginPath(); ctx.moveTo(cityX + i * 12 - 47, cityY - th); ctx.lineTo(cityX + i * 12 - 42, cityY - th - 13); ctx.lineTo(cityX + i * 12 - 36, cityY - th); ctx.fill(); }
  }
  // lago
  const lake = ctx.createLinearGradient(0, horizon, 0, h);
  lake.addColorStop(0, '#182433'); lake.addColorStop(.35, '#0d1722'); lake.addColorStop(1, '#05080f');
  ctx.fillStyle = lake; ctx.fillRect(0, horizon, w, h - horizon);
  // reflejo de luna
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 18; i++) {
    const yy = horizon + i * (h - horizon) / 20;
    const ww = mr * (1.1 - i * .04) + Math.sin(t * 2 + i) * 9;
    ctx.fillStyle = `rgba(235,208,145,${.055 - i * .0022})`;
    ctx.beginPath(); ctx.ellipse(mx + Math.sin(i * 3 + t) * 8, yy, ww, 1.2, 0, 0, TAU); ctx.fill();
  }
  ctx.restore();
  // islas flotantes
  for (const r of S.titleRocks) {
    const x = r.x * w + Math.sin(t * .2 + r.p) * 12, y = r.y * h + Math.cos(t * .3 + r.p) * 8;
    ctx.save(); ctx.translate(x, y); ctx.scale(r.s, r.s);
    ctx.fillStyle = 'rgba(12,18,28,.85)';
    ctx.beginPath(); ctx.moveTo(-28, 0); ctx.lineTo(-15, -13); ctx.lineTo(16, -16); ctx.lineTo(30, -2); ctx.lineTo(12, 8); ctx.lineTo(-14, 9); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(220,190,130,.18)'; ctx.lineWidth = 1; ctx.stroke();
    ctx.fillStyle = 'rgba(50,70,60,.6)'; ctx.beginPath(); ctx.ellipse(0, -12, 17, 4, 0, 0, TAU); ctx.fill();
    ctx.restore();
  }
  // rayos de luna
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 5; i++) {
    const a = -.9 + i * .28 + Math.sin(t * .1 + i) * .02;
    const g = ctx.createLinearGradient(mx, my, mx + Math.cos(a) * w, my + Math.sin(a) * h);
    g.addColorStop(0, 'rgba(255,230,170,.045)'); g.addColorStop(1, 'rgba(255,230,170,0)');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.moveTo(mx, my);
    ctx.lineTo(mx + Math.cos(a - .03) * w, my + Math.sin(a - .03) * h);
    ctx.lineTo(mx + Math.cos(a + .03) * w, my + Math.sin(a + .03) * h);
    ctx.closePath(); ctx.fill();
  }
  ctx.restore();
  // colina frontal
  ctx.fillStyle = '#04070d';
  ctx.beginPath(); ctx.moveTo(0, h); ctx.lineTo(0, h * .82);
  ctx.bezierCurveTo(w * .18, h * .74, w * .32, h * .8, w * .48, h * .85);
  ctx.bezierCurveTo(w * .65, h * .9, w * .82, h * .77, w, h * .84);
  ctx.lineTo(w, h); ctx.closePath(); ctx.fill();
  // figura solitaria
  const fx = w * .59, fy = h * .845;
  ctx.save(); ctx.translate(fx, fy); ctx.scale(Math.min(w, h) / 900, Math.min(w, h) / 900);
  ctx.fillStyle = 'rgba(3,5,9,.9)';
  ctx.beginPath(); ctx.ellipse(0, 0, 16, 5, 0, 0, TAU); ctx.fill();
  ctx.beginPath(); ctx.arc(0, -35, 7, 0, TAU); ctx.fill();
  ctx.beginPath(); ctx.moveTo(-8, -26); ctx.lineTo(8, -26); ctx.lineTo(5, -2); ctx.lineTo(-5, -2); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(3,5,9,.9)'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(9, -22); ctx.lineTo(23, -52); ctx.stroke();
  ctx.strokeStyle = 'rgba(236,213,159,.22)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(23, -52); ctx.lineTo(26, -59); ctx.stroke();
  ctx.restore();
  // motas
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  for (const m of S.titleMotes) {
    const x = (m.x * w + t * 7 * m.sp) % w;
    const y = m.y * h + Math.sin(t * .5 + m.p) * 18;
    const a = .15 + .2 * (Math.sin(t * 1.3 + m.p) * .5 + .5);
    glow(ctx, x, y, m.s * 4, '#ffe9b0', a);
  }
  ctx.restore();
  // viñeta
  const vg = ctx.createRadialGradient(w * .5, h * .45, Math.min(w, h) * .25, w * .5, h * .5, Math.max(w, h) * .7);
  vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(.72, 'rgba(0,0,0,.12)'); vg.addColorStop(1, 'rgba(0,0,0,.68)');
  ctx.fillStyle = vg; ctx.fillRect(0, 0, w, h);
}

function drawMountainRange(w, h, horizon, yFactor, color, amp, seed, layer) {
  const r = mulberry32(seed * 341 + 9);
  ctx.save();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(0, h);
  ctx.lineTo(0, horizon * yFactor);
  let x = 0;
  while (x < w + 100) {
    const step = 80 + r() * 160;
    const peak = horizon * yFactor - (r() * amp + amp * .2);
    ctx.lineTo(x + step * .5, peak);
    ctx.lineTo(x + step, horizon * yFactor + r() * 12);
    x += step;
  }
  ctx.lineTo(w, h); ctx.closePath(); ctx.fill();
  // nieve / luz
  if (layer < 3) {
    ctx.fillStyle = `rgba(210,200,180,${.035 / layer})`;
    ctx.beginPath(); ctx.moveTo(0, h); ctx.lineTo(0, horizon * yFactor + 8);
    ctx.lineTo(w, horizon * yFactor + 8); ctx.lineTo(w, h); ctx.closePath(); ctx.fill();
  }
  ctx.restore();
}

function drawCreatorPreview() {
  if (!S.creatorConfig) return;
  const g = creatorCanvas.getContext('2d');
  const w = creatorCanvas.width, h = creatorCanvas.height;
  g.clearRect(0, 0, w, h);
  const bg = g.createRadialGradient(w * .5, h * .42, 10, w * .5, h * .5, w * .7);
  bg.addColorStop(0, 'rgba(65,85,110,.35)'); bg.addColorStop(.55, 'rgba(14,22,37,.6)'); bg.addColorStop(1, 'rgba(5,8,15,.9)');
  g.fillStyle = bg; g.fillRect(0, 0, w, h);
  // círculos
  g.strokeStyle = 'rgba(236,213,159,.1)'; g.lineWidth = 1;
  for (let i = 0; i < 4; i++) { g.beginPath(); g.ellipse(w / 2, h * .72, 100 + i * 46, 24 + i * 10, 0, 0, TAU); g.stroke(); }
  // luz
  glow(g, w / 2, h * .62, 150, '#b9d8ff', .1);
  // runas
  for (let i = 0; i < 8; i++) {
    const a = i / 8 * TAU + S.time * .1;
    const x = w / 2 + Math.cos(a) * 190, y = h * .48 + Math.sin(a) * 90;
    glow(g, x, y, 8, '#ffe2a1', .2);
  }
  // plataforma
  g.fillStyle = 'rgba(8,12,20,.8)'; g.beginPath(); g.ellipse(w / 2, h * .8, 155, 33, 0, 0, TAU); g.fill();
  g.strokeStyle = 'rgba(236,213,159,.18)'; g.beginPath(); g.ellipse(w / 2, h * .8, 150, 30, 0, 0, TAU); g.stroke();
  const fake = { config: S.creatorConfig, equipment: { weapon: 'alba', armor: 'tunica', helmet: 'ninguno', charm: 'ninguno' } };
  drawCharacter(g, w / 2, h * .8, getAppearance(fake), S.time, { facing: 'down', moving: false, scale: 3.15, mark: false });
  // partículas
  g.save(); g.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 18; i++) {
    const a = S.time * .4 + i * 1.7;
    const x = w / 2 + Math.cos(a) * (60 + i * 7), y = h * .55 + Math.sin(a * .8) * 100;
    glow(g, x, y, 2 + (i % 3), '#ffe2a1', .15);
  }
  g.restore();
}

function renderGame(t) {
  const w = S.w, h = S.h;
  ctx.setTransform(S.dpr, 0, 0, S.dpr, 0, 0);
  ctx.clearRect(0, 0, w, h);
  if (!S.player || !S.world) { renderTitleBackground(t); return; }
  const cam = S.camera;
  ctx.save();
  ctx.translate(w / 2 + cam.shakeX, h / 2 + cam.shakeY);
  ctx.scale(cam.zoom, cam.zoom);
  ctx.translate(-cam.x, -cam.y);
  // terreno
  ctx.imageSmoothingEnabled = true;
  ctx.drawImage(S.world.terrain, 0, 0, S.world.region.width, S.world.region.height);
  drawWorldAmbientGround(t);
  drawObjectiveBeacon(t);
  drawTelegraphs(t);
  // objetos y entidades ordenados por Y
  const drawables = [];
  for (const p of S.world.props) {
    if (p.collected) continue;
    drawables.push({ y: p.y, draw: () => drawProp(ctx, p, t) });
  }
  for (const n of S.world.npcs) {
    const marker = npcMarker(n);
    drawables.push({ y: n.y, draw: () => drawNPC(ctx, n.x, n.y, n.def, t, { facing: 'down', marker }) });
  }
  for (const c of S.world.wilds) {
    if (c.captured) continue;
    const def = CREATURE_BY_ID[c.creatureId];
    drawables.push({
      y: c.y, draw: () => {
        drawCreature(ctx, def, c.x, c.y, .95, t + c.t, { glow: .16, phase: c.t });
        if (c.hurt > 0) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = `rgba(255,255,255,${c.hurt * .4})`; ctx.beginPath(); ctx.arc(c.x, c.y - 20, 24, 0, TAU); ctx.fill(); ctx.restore(); }
        if (c.hp < c.maxHp) drawSmallBar(c.x, c.y - 58, 44, c.hp / c.maxHp, def.color);
        if (c.questTarget && S.stage === 1) drawQuestMarker(c.x, c.y - 76, t, '✦', '#ffe2a1');
        if (c.hp / c.maxHp <= .36) drawRing(ctx, c.x, c.y - 20, 30 + Math.sin(t * 4) * 3, def.color, .45, 1.5);
      }
    });
  }
  for (const e of S.world.enemies) {
    if (e.dead && e.deathTimer <= 0) continue;
    drawables.push({ y: e.y, draw: () => drawEnemyEntity(e, t) });
  }
  const p = S.player;
  if (p.companion && p.activeCreature) {
    const def = CREATURE_BY_ID[p.activeCreature];
    drawables.push({ y: p.companion.y, draw: () => { drawCreature(ctx, def, p.companion.x, p.companion.y, .72, t, { glow: .15 }); } });
  }
  drawables.push({
    y: p.y, draw: () => {
      if (p.shield > 0) { drawRing(ctx, p.x, p.y - 22, 28 + Math.sin(t * 4) * 2, '#ffe2a1', .35, 2); glow(ctx, p.x, p.y - 25, 38, '#ffe2a1', .06); }
      drawCharacter(ctx, p.x, p.y, getAppearance(p), t, {
        facing: p.facing, moving: p.moving, speed: p.speedNow, attacking: p.attackAnim,
        blocking: p.block, dodging: p.dodgeTimer > 0 ? p.dodgeTimer / .34 : 0,
        hurt: p.hurt, cast: p.cast, scale: 1
      });
      if (p.attackAnim > 0) drawSlash(ctx, p.x, p.y, p.attackAngle, p.attackAnim, p.combo === 2 ? '#ffd76e' : '#ffe7ad', 78 + p.combo * 7);
      if (p.cast > 0) glow(ctx, p.x, p.y - 30, 55, '#b9d8ff', .1);
    }
  });
  drawables.sort((a, b) => a.y - b.y);
  for (const d of drawables) d.draw();
  // indicadores de ataque enemigo
  for (const e of S.world.enemies) {
    if (e.dead) continue;
    if (e.state === 'windup') {
      const def = e.type;
      ctx.save();
      ctx.strokeStyle = rgba(def.accent, .65); ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.arc(e.x, e.y - 22, def.attackRange + 10, e.attackAngle - 1.1, e.attackAngle + 1.1); ctx.stroke();
      ctx.strokeStyle = rgba('#ffffff', .18); ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(e.x, e.y - 22, def.attackRange + 6, e.attackAngle - 1.1, e.attackAngle + 1.1); ctx.stroke();
      ctx.restore();
    }
    if (e.stun > 0) {
      for (let i = 0; i < 3; i++) {
        const a = t * 2 + i * 2.1;
        glow(ctx, e.x + Math.cos(a) * 18, e.y - 60 + Math.sin(a) * 5, 3, '#b9d8ff', .3);
      }
    }
    if (e.burn > 0) for (let i = 0; i < 2; i++) addParticle(e.x + rand(14, -14), e.y - rand(30, 5), rand(20, -20), rand(-20, -50), .35, '#ff9a55', 2, 'ember');
  }
  // proyectiles
  for (const pr of S.projectiles) {
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    glow(ctx, pr.x, pr.y, pr.r * 3.4, pr.color, .4);
    ctx.fillStyle = pr.color; ctx.beginPath(); ctx.arc(pr.x, pr.y, pr.r, 0, TAU); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.75)'; ctx.beginPath(); ctx.arc(pr.x, pr.y, pr.r * .4, 0, TAU); ctx.fill();
    ctx.restore();
  }
  // haces
  for (const b of S.beams) {
    const a = b.life / b.max;
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    ctx.translate(b.x, b.y); ctx.rotate(b.angle);
    const grad = ctx.createLinearGradient(0, 0, b.length, 0);
    grad.addColorStop(0, rgba(b.color, .75 * a)); grad.addColorStop(.65, rgba(b.color, .35 * a)); grad.addColorStop(1, rgba(b.color, 0));
    ctx.fillStyle = grad; ctx.fillRect(0, -b.width / 2, b.length, b.width);
    ctx.fillStyle = rgba('#ffffff', .6 * a); ctx.fillRect(0, -b.width * .1, b.length, b.width * .2);
    ctx.restore();
  }
  // anillos
  for (const r of S.rings) {
    const prog = 1 - r.life / r.max;
    const rad = lerp(r.r0, r.r1, prog);
    drawRing(ctx, r.x, r.y, rad, r.color, (1 - prog) * .8, r.width || 2);
  }
  // partículas
  for (const part of S.particles) {
    const a = part.life / part.max;
    if (part.kind === 'spark' || part.kind === 'level') {
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      glow(ctx, part.x, part.y, part.size * 4, part.color, a * .4);
      ctx.fillStyle = rgba(part.color, a); ctx.beginPath(); ctx.arc(part.x, part.y, part.size, 0, TAU); ctx.fill();
      ctx.restore();
    } else if (part.kind === 'ember') {
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      glow(ctx, part.x, part.y, part.size * 5, part.color, a * .5);
      ctx.restore();
    } else if (part.kind === 'blood') {
      ctx.fillStyle = rgba(part.color, a); ctx.beginPath(); ctx.arc(part.x, part.y, part.size * .7, 0, TAU); ctx.fill();
    } else {
      ctx.fillStyle = rgba(part.color, a * .5); ctx.beginPath(); ctx.arc(part.x, part.y, part.size, 0, TAU); ctx.fill();
    }
  }
  // números
  for (const f of S.floaters) {
    const a = clamp(f.life / .6, 0, 1);
    ctx.save();
    ctx.globalAlpha = a;
    ctx.font = `${f.crit ? 'bold 23px' : 'bold 16px'} Georgia, serif`;
    ctx.textAlign = 'center';
    ctx.strokeStyle = 'rgba(0,0,0,.75)'; ctx.lineWidth = 4;
    ctx.strokeText(f.text, f.x, f.y);
    ctx.fillStyle = f.color; ctx.fillText(f.text, f.x, f.y);
    ctx.restore();
  }
  // resaltado de interacción
  if (S.nearInteract && S.mode === 'playing') {
    const n = S.nearInteract;
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    glow(ctx, n.x, n.y - 18, 34, '#ffe2a1', .08 + Math.sin(t * 3) * .02);
    ctx.restore();
  }
  ctx.restore();
  // atmósfera de pantalla
  drawScreenAtmosphere(t);
}

function drawWorldAmbientGround(t) {
  const world = S.world;
  if (!world) return;
  // destellos de santuario y portales
  for (const p of world.props) {
    if (p.type === 'shrine') glow(ctx, p.x, p.y - 50, 100, '#ffe2a1', .04 + Math.sin(t * 1.7) * .01);
    if (p.type === 'gate') glow(ctx, p.x, p.y - 80, 120, p.glow || '#ffe2a1', .035 + Math.sin(t * 1.2) * .008);
    if (p.type === 'seal' && p.on) glow(ctx, p.x, p.y - 30, 100, p.color || '#b9d8ff', .06);
    if (p.type === 'lavaVent') glow(ctx, p.x, p.y - 8, 55, '#ff6a35', .05 + Math.sin(t * 3 + p.x) * .012);
    if (p.type === 'crystal') glow(ctx, p.x, p.y - 25, 45, p.color || '#8fd2da', .035);
  }
  if (world.regionId === 'drakmor') {
    // brillo de ríos de lava
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (const s of world.solids) if (s.tag === 'lava') {
      ctx.fillStyle = 'rgba(255,100,40,.035)';
      ctx.fillRect(s.x, s.y, s.w, s.h);
    }
    ctx.restore();
  }
  if (world.regionId === 'kansordore') {
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 3; i++) {
      const y = 600 + i * 210 + Math.sin(t * .2 + i) * 20;
      ctx.fillStyle = `rgba(160,200,255,${.012 + i * .004})`;
      ctx.fillRect(200, y, 2000, 30);
    }
    ctx.restore();
  }
}

function drawObjectiveBeacon(t) {
  const target = getObjectiveTarget();
  if (!target || target.region !== S.regionId || S.stage >= 8) return;
  const d = Math.hypot(target.x - S.player.x, target.y - S.player.y);
  if (d < 90) return;
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const pulse = .5 + .5 * Math.sin(t * 2.4);
  const g = ctx.createLinearGradient(target.x, target.y - 300, target.x, target.y + 10);
  g.addColorStop(0, 'rgba(255,226,161,0)');
  g.addColorStop(.55, `rgba(255,226,161,${.035 + pulse * .025})`);
  g.addColorStop(1, 'rgba(255,226,161,0)');
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.moveTo(target.x - 14, target.y + 10); ctx.lineTo(target.x - 5, target.y - 300); ctx.lineTo(target.x + 5, target.y - 300); ctx.lineTo(target.x + 14, target.y + 10); ctx.closePath(); ctx.fill();
  drawRing(ctx, target.x, target.y, 24 + pulse * 12, '#ffe2a1', .3, 2);
  glow(ctx, target.x, target.y - 20, 42, '#ffe2a1', .08);
  ctx.restore();
}

function drawTelegraphs(t) {
  for (const tEl of S.telegraphs) {
    const prog = 1 - tEl.life / tEl.max;
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    ctx.strokeStyle = rgba(tEl.color, .5); ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(tEl.x, tEl.y, tEl.r, 0, TAU); ctx.stroke();
    ctx.fillStyle = rgba(tEl.color, .05 + prog * .06);
    ctx.beginPath(); ctx.arc(tEl.x, tEl.y, tEl.r * prog, 0, TAU); ctx.fill();
    ctx.restore();
  }
}
function drawSmallBar(x, y, w, pct, color) {
  ctx.fillStyle = 'rgba(4,7,12,.75)'; ctx.fillRect(x - w / 2, y, w, 5);
  ctx.fillStyle = color; ctx.fillRect(x - w / 2 + 1, y + 1, (w - 2) * clamp(pct, 0, 1), 3);
  ctx.strokeStyle = 'rgba(255,255,255,.12)'; ctx.lineWidth = 1; ctx.strokeRect(x - w / 2 + .5, y + .5, w - 1, 4);
}
function drawQuestMarker(x, y, t, glyph = '!', color = '#ffe2a1') {
  const bob = Math.sin(t * 2.6) * 4;
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  glow(ctx, x, y + bob, 26, color, .16);
  ctx.fillStyle = color; ctx.font = 'bold 18px Georgia, serif'; ctx.textAlign = 'center';
  ctx.fillText(glyph, x, y + bob + 6);
  ctx.restore();
}
function npcMarker(n) {
  if (n.id === 'elara' && S.stage === 0) return '!';
  if (n.id === 'ordan' && S.side.s0 !== 'done' && (S.side.s0 === 'inactive' || (S.player.materials.ember || 0) >= 3)) return '!';
  if (n.id === 'mira' && S.side.s1 !== 'done' && (S.side.s1 === 'inactive' || (S.player.materials.flower || 0) >= 3)) return '!';
  if (n.id === 'solen' && S.side.s2 !== 'done' && (S.side.s2 === 'inactive' || S.loreRead.length >= 3)) return '!';
  if (n.id === 'nyx' && S.stage === 4) return '!';
  if (S.side.s0 === 'active' || S.side.s1 === 'active' || S.side.s2 === 'active') return '?';
  return '';
}
function drawEnemyEntity(e, t) {
  if (e.dead && e.deathTimer > 0) {
    drawEnemy(ctx, e, t);
    return;
  }
  drawEnemy(ctx, e, t);
  if (!e.boss && (e.hurt > 0 || e.hp < e.maxHp)) drawSmallBar(e.x, e.y - 55, 48, e.hp / e.maxHp, e.type.accent);
  if (e.boss && e.intro > 0) {
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    drawRing(ctx, e.x, e.y - 20, 70 + Math.sin(t * 5) * 10, e.type.accent, .4, 3);
    ctx.restore();
  }
}

function drawScreenAtmosphere(t) {
  const w = S.w, h = S.h;
  const region = S.regionId;
  // color grading
  if (region === 'drakmor') {
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, 'rgba(255,80,30,.035)'); g.addColorStop(.6, 'rgba(255,80,30,0)'); g.addColorStop(1, 'rgba(255,120,50,.06)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
  } else if (region === 'kansordore') {
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, 'rgba(110,160,255,.05)'); g.addColorStop(.6, 'rgba(110,160,255,0)'); g.addColorStop(1, 'rgba(150,120,255,.04)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
  } else {
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, 'rgba(255,220,150,.035)'); g.addColorStop(.55, 'rgba(255,220,150,0)'); g.addColorStop(1, 'rgba(100,150,100,.03)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
  }
  // partículas climáticas
  const arr = S.weather || [];
  ctx.save();
  if (region === 'drakmor') ctx.globalCompositeOperation = 'lighter';
  for (const m of arr) {
    let x, y, a = .4;
    if (region === 'drakmor') {
      x = (m.x * w + Math.sin(t * .4 + m.p) * 30 + t * 5) % w;
      y = (m.y * h - t * (10 + m.sp * 25)) % h; if (y < 0) y += h;
      const fl = .4 + .6 * (Math.sin(t * 5 + m.p) * .5 + .5);
      ctx.fillStyle = `rgba(255,${120 + m.s * 20},70,${.18 * fl})`;
      ctx.beginPath(); ctx.arc(x, y, m.s * 1.3, 0, TAU); ctx.fill();
      if (m.s > 1.8) { ctx.strokeStyle = `rgba(255,150,80,${.06 * fl})`; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 2, y + 9); ctx.stroke(); }
    } else if (region === 'kansordore') {
      x = m.x * w; y = m.y * h;
      const tw = .25 + .75 * (Math.sin(t * 1.3 + m.p) * .5 + .5);
      ctx.fillStyle = `rgba(200,225,255,${.15 * tw})`;
      ctx.beginPath(); ctx.arc(x, y, m.s * .8, 0, TAU); ctx.fill();
    } else {
      x = (m.x * w + Math.sin(t * .3 + m.p) * 24 + t * 3) % w;
      y = (m.y * h + Math.cos(t * .25 + m.p) * 12) % h;
      ctx.fillStyle = `rgba(245,225,165,${.12 + .1 * (Math.sin(t + m.p) * .5 + .5)})`;
      ctx.beginPath(); ctx.arc(x, y, m.s * .8, 0, TAU); ctx.fill();
    }
  }
  ctx.restore();
  // niebla inferior
  const fog = ctx.createLinearGradient(0, h * .75, 0, h);
  fog.addColorStop(0, 'rgba(3,6,12,0)'); fog.addColorStop(1, 'rgba(3,6,12,.2)');
  ctx.fillStyle = fog; ctx.fillRect(0, 0, w, h);
}

// ---------------- Bucle principal / arranque ----------------
function updateGame(dt, t) {
  S.uiTick += dt;
  switch (S.mode) {
    case 'playing': {
      if (!S.player || !S.world) return;
      S.playtime += dt;
      S.player.playtime = S.playtime;
      updatePlayer(dt);
      updateEnemies(dt);
      updateEffects(dt);
      updateCamera(dt);
      break;
    }
    case 'dying': {
      S.deadTimer = (S.deadTimer || 0) - dt;
      updateEffects(dt);
      updateCamera(dt);
      if (S.deadTimer <= 0) respawnPlayer();
      break;
    }
    case 'dialogue':
      updateDialogue(dt);
      break;
    case 'cinematic':
      updateCinematic(dt);
      break;
    case 'title':
    case 'creator':
    case 'ending':
    case 'title-panel':
      S.titleT += dt;
      break;
    default:
      break;
  }
}

function renderFrame(t) {
  if (S.mode === 'creator') { drawCreatorPreview(); return; }
  if (S.mode === 'title-panel' || S.mode === 'ending' || S.mode === 'boot' || S.mode === 'title') {
    renderTitleBackground(t); return;
  }
  if (S.player && S.world) { renderGame(t); return; }
  renderTitleBackground(t);
}

function loop(now) {
  requestAnimationFrame(loop);
  const t = now / 1000;
  let dt = S.last ? t - S.last : 0;
  S.last = t;
  // Evita saltos tras cambiar de pestaña o desbloquear el dispositivo.
  dt = clamp(dt, 0, .05);
  S.time = t;
  const t0 = performance.now();
  try {
    updateGame(dt, t);
    const t1 = performance.now();
    renderFrame(t);
    S.perf = { update: t1 - t0, render: performance.now() - t1, dt };
  } catch (err) {
    // Un error de un fotograma no debe congelar toda la partida.
    console.error('[La Espada Celestial] Error en el bucle:', err);
  }
}

function init() {
  if (S.booted) return;
  S.booted = true;
  loadSettings();
  resize();
  initScenes();
  bindInput();
  S.demoPlayer = makePlayer({ name: 'Aurel' });
  addEventListener('blur', () => {
    S.keys = {};
    S.touchMove = { x: 0, y: 0 };
    S.blockHeld = false;
  });
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) S.last = performance.now() / 1000;
  });
  updateContinueButton();
  if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
    window.__S = S;
    window.__game = { createWorld, ensureBoss, killEnemy, setStage, finishGame, showFinalChoice, transitionRegion, saveGame, loadGame, derive, renderPanel, respawnPlayer };
  }
  showTitle();
  const loading = $('#loading');
  if (loading) {
    setTimeout(() => { loading.classList.add('done'); setTimeout(() => loading.remove(), 700); }, 350);
  }
  S.last = performance.now() / 1000;
  requestAnimationFrame(loop);
}

init();
