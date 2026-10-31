/* ===========================================================
   LA ESPADA CELESTIAL — datos del mundo
   Utilidades, audio, mapas, misiones y enemigos.
   =========================================================== */
'use strict';

const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const lerp = (a, b, t) => a + (b - a) * t;
const dist2 = (ax, ay, bx, by) => (ax - bx) ** 2 + (ay - by) ** 2;
const dist = (ax, ay, bx, by) => Math.hypot(ax - bx, ay - by);
const rand = (a = 0, b = 1) => a + Math.random() * (b - a);
const angleDiff = (a, b) => Math.abs(Math.atan2(Math.sin(a - b), Math.cos(a - b)));
const $ = (id) => document.getElementById(id);

function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function distToSegment(px, py, x1, y1, x2, y2) {
  const dx = x2 - x1, dy = y2 - y1;
  const len = dx * dx + dy * dy;
  let t = len ? ((px - x1) * dx + (py - y1) * dy) / len : 0;
  t = clamp(t, 0, 1);
  return Math.hypot(px - (x1 + dx * t), py - (y1 + dy * t));
}

/* ----------------------------- Audio ----------------------------- */
const AudioFX = {
  ctx: null,
  muted: false,
  init() {
    if (!this.ctx) {
      try {
        const AC = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AC();
      } catch (e) {
        this.ctx = null;
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
  },
  tone(freq, dur, type = 'sine', vol = 0.05, slide = 0) {
    if (this.muted || !this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, t);
      if (slide) osc.frequency.exponentialRampToValueAtTime(Math.max(30, freq + slide), t + dur);
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(vol, t + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      osc.connect(gain).connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + dur + 0.02);
    } catch (e) { /* audio no disponible */ }
  },
  swing() { this.tone(520, 0.11, 'triangle', 0.035, -260); },
  hit() { this.tone(170, 0.12, 'square', 0.045, -90); },
  hurt() { this.tone(120, 0.22, 'sawtooth', 0.05, -55); },
  heal() { this.tone(520, 0.3, 'sine', 0.05, 220); setTimeout(() => this.tone(780, 0.28, 'sine', 0.04, 120), 90); },
  pickup() { this.tone(740, 0.1, 'sine', 0.05, 220); setTimeout(() => this.tone(990, 0.14, 'sine', 0.04, 160), 80); },
  level() { [523, 659, 784, 1046].forEach((f, i) => setTimeout(() => this.tone(f, 0.24, 'triangle', 0.05), i * 95)); },
  portal() { this.tone(300, 0.4, 'sine', 0.04, 300); },
  boss() { this.tone(90, 0.9, 'sawtooth', 0.06, -30); setTimeout(() => this.tone(70, 0.9, 'square', 0.04, -20), 150); },
  chest() { [392, 523, 659].forEach((f, i) => setTimeout(() => this.tone(f, 0.22, 'triangle', 0.05), i * 110)); }
};

/* ----------------------------- Misiones ----------------------------- */
const QUESTS = [
  { id: 1, title: 'El llamado de la Espada', desc: 'Habla con la Anciana Mira, junto a la fuente de la aldea.' },
  { id: 2, title: 'Limo y ceniza', desc: 'Derrota 5 limos en el Bosque Susurrante.', goal: 5 },
  { id: 3, title: 'El Fragmento de Ceniza', desc: 'Derrota 6 espectros en las Ruinas y reclama el fragmento.', goal: 6 },
  { id: 4, title: 'El Señor de la Ceniza', desc: 'Entra en el Templo Celestial y derrota al Señor de la Ceniza.' },
  { id: 5, title: 'El cielo recuerda', desc: 'La ceniza se ha apagado. El reino respira de nuevo.' }
];

const ENEMY_DEFS = {
  slime: { name: 'Limo de musgo', hp: 46, speed: 52, dmg: 8, r: 16, xp: 16, gold: 6, aggro: 250, color: '#69b06a' },
  ghost: { name: 'Espectro de ceniza', hp: 92, speed: 74, dmg: 13, r: 16, xp: 34, gold: 13, aggro: 340, color: '#a9c7e8' },
  boss: { name: 'Señor de la Ceniza', hp: 880, speed: 58, dmg: 26, r: 38, xp: 520, gold: 260, aggro: 400, color: '#e08050' }
};

/* ----------------------------- Mapas ----------------------------- */
function baseMap(id, name, w, h, ground, accent, ambient) {
  return {
    id, name, w, h, ground, accent, ambient,
    props: [], obstacles: [], paths: [], portals: [], npcs: [], spawn: { x: w / 2, y: h / 2 },
    enemies: [], chest: null, shrine: null, objectif: null, _seed: 1
  };
}

function addTree(map, x, y, s = 1, tone = 0) {
  map.props.push({ kind: 'tree', x, y, s, tone });
  map.obstacles.push({ t: 'c', x, y: y - 4, r: 10 * s });
}
function addRock(map, x, y, s = 1) {
  map.props.push({ kind: 'rock', x, y, s });
  map.obstacles.push({ t: 'c', x, y: y - 2, r: 13 * s });
}
function addBush(map, x, y, s = 1) {
  map.props.push({ kind: 'bush', x, y, s });
}
function addHouse(map, x, y, w, h, tone = 0) {
  map.props.push({ kind: 'house', x, y, w, h, tone });
  map.obstacles.push({ t: 'r', x: x - w / 2, y: y - h, w, h: h * 0.92 });
}
function addPillar(map, x, y, s = 1, broken = false) {
  map.props.push({ kind: 'pillar', x, y, s, broken });
  map.obstacles.push({ t: 'c', x, y: y - 6, r: 17 * s });
}
function addCrystal(map, x, y, color) {
  map.props.push({ kind: 'crystal', x, y, color });
  map.obstacles.push({ t: 'c', x, y: y - 4, r: 12 });
}
function addTorch(map, x, y) {
  map.props.push({ kind: 'torch', x, y });
}
function addBones(map, x, y) {
  map.props.push({ kind: 'bones', x, y });
}
function addFlower(map, x, y, color) {
  map.props.push({ kind: 'flower', x, y, color });
}
function addPortal(map, portal) {
  map.portals.push(portal);
  map.props.push({ kind: 'portal', x: portal.x, y: portal.y, portal });
}
function addHouseVillage(map) { /* compatibilidad */ }

function scatter(map, seed, count, avoid, kind, opts = {}) {
  const rng = mulberry32(seed);
  let placed = 0, attempts = 0;
  const max = count * 80;
  while (placed < count && attempts < max) {
    attempts++;
    const x = 60 + rng() * (map.w - 120);
    const y = 90 + rng() * (map.h - 160);
    if (avoid.some((a) => dist2(x, y, a.x, a.y) < a.r * a.r)) continue;
    if (map.props.some((p) => dist2(x, y, p.x, p.y) < (opts.spacing || 78) ** 2)) continue;
    if (map.paths.some((p) => distToSegment(x, y, p.x1, p.y1, p.x2, p.y2) < p.w * 0.62 + 18)) continue;
    if (kind === 'tree') addTree(map, x, y, 0.82 + rng() * 0.55, rng() < 0.35 ? 1 : 0);
    else if (kind === 'rock') addRock(map, x, y, 0.7 + rng() * 0.7);
    else if (kind === 'bush') addBush(map, x, y, 0.75 + rng() * 0.6);
    placed++;
  }
}

function borderTrees(map, seed, opts = {}) {
  const rng = mulberry32(seed);
  const gap = opts.gap || 0;
  const step = 78;
  for (let x = 34; x < map.w - 20; x += step) {
    if (gap && Math.abs(x - map.w / 2) < gap && opts.gapTop) continue;
    addTree(map, x + rng() * 22, 34 + rng() * 16, 0.9 + rng() * 0.5, rng() < 0.3 ? 1 : 0);
    addTree(map, x + rng() * 22, map.h - 26 + rng() * 10, 0.9 + rng() * 0.5, rng() < 0.3 ? 1 : 0);
  }
  for (let y = 110; y < map.h - 70; y += step) {
    addTree(map, 28 + rng() * 14, y + rng() * 20, 0.9 + rng() * 0.5, rng() < 0.3 ? 1 : 0);
    addTree(map, map.w - 28 + rng() * 12, y + rng() * 20, 0.9 + rng() * 0.5, rng() < 0.3 ? 1 : 0);
  }
}

/* ---------------- Aldea Luz de Luna ---------------- */
function buildVillage() {
  const m = baseMap('village', 'Aldea Luz de Luna', 1500, 1000, '#223b2c', '#2f5140', 'fireflies');
  m.spawn = { x: 750, y: 840 };
  m._seed = 11;
  m.paths.push(
    { x1: 750, y1: 90, x2: 750, y2: 1010, w: 94 },
    { x1: 80, y1: 620, x2: 1420, y2: 620, w: 68 },
    { x1: 300, y1: 620, x2: 300, y2: 560, w: 54 }
  );

  addHouse(m, 290, 520, 220, 142, 0);
  addHouse(m, 1215, 520, 240, 152, 1);
  addHouse(m, 520, 300, 190, 124, 0);
  addHouse(m, 980, 300, 190, 124, 1);

  m.props.push({ kind: 'fountain', x: 750, y: 545 });
  m.obstacles.push({ t: 'c', x: 750, y: 545, r: 56 });

  m.npcs.push({ id: 'mira', name: 'Anciana Mira', x: 618, y: 664, robe: '#5c4b8a', hair: '#cfd3dc' });
  m.npcs.push({ id: 'herrero', name: 'Herrero Bruno', x: 372, y: 576, robe: '#6b4a33', hair: '#3a2a22' });

  addPortal(m, {
    x: 750, y: 108, r: 48, to: 'forest', spawn: { x: 800, y: 1070 },
    label: 'Bosque Susurrante', color: '#8fe0c0'
  });

  for (let i = 0; i < 12; i++) {
    const rng = mulberry32(300 + i);
    addFlower(m, 470 + rng() * 560, 700 + rng() * 220, rng() < 0.5 ? '#e3c26a' : '#c58fd8');
  }
  addTorch(m, 660, 700);
  addTorch(m, 840, 700);

  const avoid = [
    { x: 750, y: 840, r: 120 }, { x: 750, y: 108, r: 150 }, { x: 618, y: 664, r: 100 },
    { x: 372, y: 576, r: 90 }, { x: 750, y: 545, r: 120 }, { x: 290, y: 460, r: 150 },
    { x: 1215, y: 460, r: 150 }, { x: 520, y: 250, r: 130 }, { x: 980, y: 250, r: 130 }
  ];
  scatter(m, 77, 14, avoid, 'tree', { spacing: 110 });
  scatter(m, 78, 8, avoid, 'bush', { spacing: 60 });
  borderTrees(m, 79, { gapTop: true, gap: 100 });
  return m;
}

/* ---------------- Bosque Susurrante ---------------- */
function buildForest() {
  const m = baseMap('forest', 'Bosque Susurrante', 1600, 1200, '#1b3125', '#27452f', 'leaves');
  m.spawn = { x: 800, y: 1070 };
  m._seed = 22;
  m.paths.push(
    { x1: 800, y1: 1170, x2: 800, y2: 640, w: 88 },
    { x1: 800, y1: 640, x2: 1540, y2: 640, w: 74 },
    { x1: 800, y1: 640, x2: 330, y2: 640, w: 60 },
    { x1: 330, y1: 640, x2: 330, y2: 300, w: 52 }
  );

  addPortal(m, {
    x: 800, y: 1150, r: 48, to: 'village', spawn: { x: 750, y: 190 },
    label: 'Aldea Luz de Luna', color: '#e9c977'
  });
  addPortal(m, {
    x: 1548, y: 640, r: 46, to: 'ruins', spawn: { x: 225, y: 620 },
    label: 'Ruinas de Ceniza', color: '#ff9d6b', needStage: 3
  });

  m.shrine = { x: 330, y: 292 };
  m.props.push({ kind: 'shrine', x: 330, y: 300 });
  m.obstacles.push({ t: 'c', x: 330, y: 300, r: 22 });

  addTorch(m, 470, 580);
  addTorch(m, 1130, 700);

  const slimes = [
    { x: 470, y: 860 }, { x: 1120, y: 900 }, { x: 1260, y: 420 },
    { x: 590, y: 420 }, { x: 960, y: 860 }
  ];
  for (const s of slimes) m.enemies.push({ type: 'slime', x: s.x, y: s.y, home: { x: s.x, y: s.y } });

  addBones(m, 1050, 320);
  addBones(m, 560, 980);
  addRock(m, 470, 330, 1.2);

  const avoid = [
    { x: 800, y: 1070, r: 130 }, { x: 800, y: 1150, r: 150 }, { x: 1548, y: 640, r: 150 },
    { x: 330, y: 300, r: 130 }, { x: 800, y: 640, r: 120 }, ...slimes.map((s) => ({ ...s, r: 95 }))
  ];
  scatter(m, 201, 62, avoid, 'tree', { spacing: 62 });
  scatter(m, 202, 14, avoid, 'rock', { spacing: 80 });
  scatter(m, 203, 22, avoid, 'bush', { spacing: 55 });
  borderTrees(m, 204);
  return m;
}

/* ---------------- Ruinas de Ceniza ---------------- */
function buildRuins() {
  const m = baseMap('ruins', 'Ruinas de Ceniza', 1600, 1200, '#2a2730', '#3a3440', 'embers');
  m.spawn = { x: 225, y: 620 };
  m._seed = 33;
  m.paths.push(
    { x1: 40, y1: 620, x2: 1580, y2: 620, w: 96 },
    { x1: 800, y1: 60, x2: 800, y2: 1160, w: 82 }
  );

  addPortal(m, {
    x: 58, y: 620, r: 46, to: 'forest', spawn: { x: 1470, y: 640 },
    label: 'Bosque Susurrante', color: '#8fe0c0'
  });
  addPortal(m, {
    x: 800, y: 90, r: 46, to: 'temple', spawn: { x: 550, y: 780 },
    label: 'Templo Celestial', color: '#ffd88a', needStage: 4
  });

  const pillars = [
    [310, 300], [310, 900], [1290, 300], [1290, 900],
    [560, 250], [1040, 250], [560, 960], [1040, 960]
  ];
  for (const [x, y] of pillars) addPillar(m, x, y, 1.05, Math.random() < 0.25);

  m.chest = { x: 800, y: 780, opened: false };

  const ghosts = [
    { x: 460, y: 360 }, { x: 1160, y: 350 }, { x: 420, y: 870 },
    { x: 1210, y: 880 }, { x: 980, y: 620 }, { x: 640, y: 300 }
  ];
  for (const g of ghosts) m.enemies.push({ type: 'ghost', x: g.x, y: g.y, home: { x: g.x, y: g.y } });

  addBones(m, 700, 500);
  addBones(m, 950, 880);
  addBones(m, 380, 620);
  addCrystal(m, 250, 750, '#ff9d6b');
  addCrystal(m, 1350, 760, '#ffb37a');
  addTorch(m, 690, 400);
  addTorch(m, 910, 400);
  addTorch(m, 690, 900);
  addTorch(m, 910, 900);

  const avoid = [
    { x: 225, y: 620, r: 110 }, { x: 58, y: 620, r: 140 }, { x: 800, y: 90, r: 150 },
    { x: 800, y: 780, r: 100 }, ...ghosts.map((g) => ({ ...g, r: 85 })),
    ...pillars.map(([x, y]) => ({ x, y, r: 80 }))
  ];
  scatter(m, 301, 18, avoid, 'rock', { spacing: 100 });
  scatter(m, 302, 10, avoid, 'bush', { spacing: 70 });
  scatter(m, 303, 6, avoid, 'tree', { spacing: 120 });
  borderTrees(m, 304);
  return m;
}

/* ---------------- Templo Celestial ---------------- */
function buildTemple() {
  const m = baseMap('temple', 'Templo Celestial', 1100, 900, '#191521', '#241d2c', 'embers');
  m.spawn = { x: 550, y: 780 };
  m._seed = 44;
  m.paths.push({ x1: 550, y1: 60, x2: 550, y2: 880, w: 190 });

  addPortal(m, {
    x: 550, y: 862, r: 46, to: 'ruins', spawn: { x: 800, y: 210 },
    label: 'Ruinas de Ceniza', color: '#ff9d6b'
  });

  addPillar(m, 220, 250, 1.2);
  addPillar(m, 880, 250, 1.2);
  addPillar(m, 220, 640, 1.2);
  addPillar(m, 880, 640, 1.2);
  addTorch(m, 400, 240);
  addTorch(m, 700, 240);
  addTorch(m, 340, 660);
  addTorch(m, 760, 660);
  addCrystal(m, 180, 450, '#9fd8ff');
  addCrystal(m, 920, 450, '#9fd8ff');
  addBones(m, 460, 520);
  addBones(m, 650, 560);

  m.enemies.push({ type: 'boss', x: 550, y: 330, home: { x: 550, y: 330 } });
  return m;
}

const MAP_BUILDERS = {
  village: buildVillage,
  forest: buildForest,
  ruins: buildRuins,
  temple: buildTemple
};

const ZONE_NAMES = {
  village: 'Aldea Luz de Luna',
  forest: 'Bosque Susurrante',
  ruins: 'Ruinas de Ceniza',
  temple: 'Templo Celestial'
};
