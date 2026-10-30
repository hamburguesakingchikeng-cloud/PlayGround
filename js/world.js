// Mundo: cuatro regiones dibujadas por procedimiento, colisiones, objetos e interacción.

import { RNG, TAU, clamp, dist, hexToRgba, chance } from './core.js';
import { drawProp, drawMote, drawGlow } from './art.js';

const P = (type, x, y, opts = {}) => ({ type, x, y, ...opts });
const NPC = (id, x, y, opts = {}) => ({ id, x, y, ...opts });

const TREE_COLORS = ['#2f6b4f', '#356f4a', '#275c45', '#3a7052', '#2a5f4a'];
const AUTUMN = ['#8a5a2b', '#a35d2d', '#7a4a2a', '#b06a35'];

function tree(x, y, opts = {}) {
  const s = opts.scale ?? 0.9 + Math.random() * 0.45;
  return P('tree', x, y, { scale: s, seed: Math.random() * TAU, color: opts.color || TREE_COLORS[Math.floor(Math.random() * TREE_COLORS.length)], ...opts });
}
function pine(x, y, opts = {}) {
  const s = opts.scale ?? 0.9 + Math.random() * 0.4;
  return P('pine', x, y, { scale: s, seed: Math.random() * TAU, color: opts.color || '#2b5f4a', ...opts });
}
function rock(x, y, opts = {}) {
  return P('rock', x, y, { scale: opts.scale ?? 0.8 + Math.random() * 0.6, color: opts.color || '#6f7480', ...opts });
}
function bush(x, y, opts = {}) {
  return P('bush', x, y, { scale: opts.scale ?? 0.8 + Math.random() * 0.5, seed: Math.random() * TAU, color: opts.color || '#2f6b4f', ...opts });
}
function mushroom(x, y, opts = {}) {
  return P('mushroom', x, y, { scale: opts.scale ?? 0.7 + Math.random() * 0.7, color: opts.color || '#9fe3ff', ...opts });
}

// ---------------------------------------------------------------------------
// ALDEA DEL ALBA
// ---------------------------------------------------------------------------

function buildVillage() {
  const props = [];
  const npcs = [];
  const rng = new RNG(1024);

  // Casas principales.
  props.push(P('house', 470, 470, { w: 260, h: 150, roof: '#8a3f3f', wall: '#d8c7a2', sign: 'TEMPLO', chimney: true }));
  props.push(P('house', 1280, 430, { w: 280, h: 160, roof: '#4a5a8a', wall: '#e0d2b4', sign: 'POSADA', chimney: true }));
  props.push(P('house', 1460, 840, { w: 240, h: 140, roof: '#7a3f3f', wall: '#d8c7a2', sign: 'MERCADO', chimney: false }));
  props.push(P('house', 330, 860, { w: 230, h: 140, roof: '#5a4a3a', wall: '#c9b692', sign: 'FORJA', chimney: true }));
  props.push(P('house', 760, 1060, { w: 190, h: 120, roof: '#6b3f5a', wall: '#e0d2b4', chimney: true }));

  // Plaza, pozo y santuario.
  props.push(P('well', 1120, 1010));
  props.push(P('shrine', 760, 610, { id: 'village', interact: { kind: 'shrine', id: 'village' } }));
  props.push(P('statue', 950, 690, { glow: '#9fe3ff', color: '#9aa6b8' }));
  props.push(P('chest', 1660, 1130, { id: 'village_secret', interact: { kind: 'chest', id: 'village_secret', gold: 90, items: [{ id: 'potion', qty: 2 }, { id: 'ether', qty: 1 }] } }));
  props.push(P('sign', 950, 1140, { text: 'Aldea del Alba\n«Donde el primer rayo toca la piedra.»', interact: { kind: 'sign', text: 'Aldea del Alba. Al norte, el Bosque de Lumen. Al este, el mercado. Al oeste, la forja.' } }));
  props.push(P('sign', 120, 690, { text: 'Forja', interact: { kind: 'sign', text: 'Forja de Brann. «El acero recuerda cada golpe.»' } }));

  // Portal norte.
  props.push(P('portal', 950, 120, {
    color: '#9fe3ff', label: 'Bosque de Lumen',
    interact: { kind: 'portal', to: 'forest', spawn: { x: 1200, y: 1560 }, label: 'Bosque de Lumen' },
  }));
  props.push(P('arch', 950, 160, { scale: 0.9 }));

  // Cercas y decoración.
  for (let i = 0; i < 5; i++) props.push(P('fence', 520 + i * 80, 1110, { n: 4 }));
  for (let i = 0; i < 4; i++) props.push(P('fence', 1500 + i * 70, 650, { n: 3 }));
  props.push(P('torch', 880, 890, { seed: 1 }));
  props.push(P('torch', 1020, 890, { seed: 2 }));
  props.push(P('torch', 880, 570, { seed: 3 }));
  props.push(P('torch', 1020, 570, { seed: 4 }));
  props.push(P('torch', 700, 1030, { seed: 5 }));
  props.push(P('campfire', 1600, 1040));

  // Árboles en el perímetro.
  const edge = [];
  for (let x = 60; x < 1880; x += 70) { edge.push([x, 70]); edge.push([x, 1260]); }
  for (let y = 140; y < 1260; y += 70) { edge.push([40, y]); edge.push([1860, y]); }
  for (const [x, y] of edge) {
    if (x > 760 && x < 1140 && y < 240) continue;
    if (rng.chance(0.8)) props.push(tree(x + rng.range(-18, 18), y + rng.range(-14, 14), { scale: rng.range(0.8, 1.25), color: rng.pick(TREE_COLORS) }));
  }
  // Árboles interiores.
  for (const [x, y] of [[180, 320], [700, 330], [1720, 330], [1740, 720], [160, 1080], [650, 1180], [1720, 1180], [1240, 1120]]) {
    props.push(tree(x, y, { scale: rng.range(0.9, 1.3), color: rng.pick(TREE_COLORS) }));
  }
  for (let i = 0; i < 16; i++) {
    const x = rng.range(120, 1780), y = rng.range(180, 1200);
    if (dist(x, y, 950, 950) < 250) continue;
    props.push(bush(x, y, { berries: rng.chance(0.25) }));
  }
  for (let i = 0; i < 10; i++) props.push(mushroom(rng.range(100, 1800), rng.range(200, 1200), { color: '#ffcf5a' }));
  props.push(P('log', 1480, 1150, { rot: 0.4, moss: true }));
  props.push(P('banner', 850, 640, { color: '#8a3f3f' }));
  props.push(P('banner', 1050, 640, { color: '#4a5a8a' }));

  // NPCs.
  npcs.push(NPC('mira', 930, 560, { name: 'Anciana Mira', title: 'Custodia del Alba', color: '#6b4a7a', accent: '#e8c56a', hair: '#d8d2c4', job: 'elder', hat: 'hood', seed: 1.2 }));
  npcs.push(NPC('brann', 455, 790, { name: 'Brann', title: 'Herrero', color: '#5a4030', accent: '#d9a441', hair: '#3b2a1d', job: 'smith', seed: 2.1 }));
  npcs.push(NPC('sela', 1400, 760, { name: 'Sela', title: 'Mercader', color: '#7a3f5a', accent: '#e8c56a', hair: '#5a3423', job: 'merchant', hat: 'hat', seed: 3.4 }));
  npcs.push(NPC('lia', 1080, 1055, { name: 'Lía', title: 'Niña del pozo', color: '#3d6fb0', accent: '#ffe6a0', hair: '#a35d2d', job: 'child', seed: 4.2 }));
  npcs.push(NPC('guard', 950, 260, { name: 'Capitán Rovan', title: 'Guardia del Alba', color: '#4a4e60', accent: '#c9d3df', hair: '#6b3f22', job: 'guard', seed: 5.3 }));

  const extraObstacles = [];
  return {
    id: 'village', name: 'Aldea del Alba', subtitle: 'Donde despierta la luz',
    w: 1900, h: 1300, safe: true, music: 'village', ambience: 'day',
    spawn: { x: 950, y: 1060 },
    palette: { base: '#4d7a45', base2: '#3d6639', path: '#b89a6a', path2: '#9a7f55', stone: '#a8a08a' },
    props, npcs, extraObstacles,
    spawners: [],
    ambient: { leaves: 24, motes: 18, embers: 0, stars: 0, color: '#c8ff9a' },
    lights: [
      { x: 880, y: 890, r: 150, color: '#ffb35a' }, { x: 1020, y: 890, r: 150, color: '#ffb35a' },
      { x: 880, y: 570, r: 150, color: '#ffb35a' }, { x: 1020, y: 570, r: 150, color: '#ffb35a' },
      { x: 700, y: 1030, r: 130, color: '#ffb35a' }, { x: 760, y: 610, r: 170, color: '#9fe3ff' },
      { x: 950, y: 120, r: 180, color: '#9fe3ff' }, { x: 1600, y: 1040, r: 140, color: '#ffb35a' },
    ],
  };
}

// ---------------------------------------------------------------------------
// BOSQUE DE LUMEN
// ---------------------------------------------------------------------------

function buildForest() {
  const props = [];
  const npcs = [];
  const rng = new RNG(2401);
  const pathPoints = [[1200, 1680], [1180, 1460], [1000, 1240], [1050, 1020], [1250, 900], [1250, 760], [1010, 600], [1100, 430], [1200, 260]];
  const nearPath = (x, y, pad = 95) => {
    for (let i = 0; i < pathPoints.length - 1; i++) {
      const [x1, y1] = pathPoints[i], [x2, y2] = pathPoints[i + 1];
      const dx = x2 - x1, dy = y2 - y1;
      const t = clamp(((x - x1) * dx + (y - y1) * dy) / (dx * dx + dy * dy), 0, 1);
      const px = x1 + dx * t, py = y1 + dy * t;
      if (dist(x, y, px, py) < pad) return true;
    }
    return false;
  };

  // Santuario, altar y portal.
  props.push(P('shrine', 520, 1260, { id: 'forest', interact: { kind: 'shrine', id: 'forest' } }));
  props.push(P('altar', 1200, 270, { interact: { kind: 'altar' } }));
  props.push(P('portal', 2290, 470, {
    color: '#c9a6ff', label: 'Ruinas de Aether',
    interact: { kind: 'portal', to: 'ruins', spawn: { x: 1200, y: 1660 }, label: 'Ruinas de Aether', requires: 'ruins' },
  }));
  props.push(P('barrier', 2290, 470, { color: '#c9a6ff', w: 130, h: 100, active: (g) => (g.state.quests.main.stage || 0) < 2 }));
  props.push(P('portal', 1040, 1590, {
    color: '#9fe3ff', label: 'Aldea del Alba',
    interact: { kind: 'portal', to: 'village', spawn: { x: 950, y: 200 }, label: 'Aldea del Alba' },
  }));
  props.push(P('sign', 1200, 1510, { text: 'Bosque de Lumen', interact: { kind: 'sign', text: 'Bosque de Lumen. «No sigas las luces si no quieres encontrar algo.» — Rook' } }));
  props.push(P('sign', 1140, 640, { text: 'Sendero antiguo', interact: { kind: 'sign', text: 'Un sendero de piedra conduce al Altar del Alba. Las luciérnagas parecen señalar el camino.' } }));

  // Cofres.
  props.push(P('chest', 1930, 1330, { id: 'forest_chest1', interact: { kind: 'chest', id: 'forest_chest1', gold: 120, items: [{ id: 'potion_mayor', qty: 1 }, { id: 'ether', qty: 1 }] } }));
  props.push(P('chest', 270, 400, { id: 'forest_secret', interact: { kind: 'chest', id: 'forest_secret', gold: 220, items: [{ id: 'lanza_alba', qty: 1, equipment: true }, { id: 'bomba', qty: 2 }] } }));
  props.push(P('chest', 880, 520, { id: 'forest_chest2', interact: { kind: 'chest', id: 'forest_chest2', gold: 60, items: [{ id: 'fruta', qty: 3 }] } }));

  // Luciérnagas.
  const ff = [[420, 880], [1760, 700], [1980, 300], [700, 470]];
  ff.forEach(([x, y], i) => {
    props.push(P('firefly', x, y, { id: `ff${i + 1}`, seed: i * 1.7, interact: { kind: 'firefly', id: `ff${i + 1}` } }));
  });

  // Campamento de Rook.
  props.push(P('tent', 1360, 1460));
  props.push(P('campfire', 1280, 1480));
  props.push(P('log', 1420, 1510, { rot: -0.2 }));
  npcs.push(NPC('rook', 1320, 1420, { name: 'Rook', title: 'Cazador de ceniza', color: '#4a5a3a', accent: '#c9a25a', hair: '#3b2a1d', job: 'hunter', hat: 'hood', seed: 2.7 }));

  // Árboles: densidad alta con claros.
  const forbidden = [
    { x: 1200, y: 270, r: 190 }, { x: 520, y: 1260, r: 130 }, { x: 2290, y: 470, r: 150 },
    { x: 1320, y: 1420, r: 220 }, { x: 270, y: 400, r: 90 }, { x: 1930, y: 1330, r: 100 },
    { x: 880, y: 520, r: 90 }, { x: 1200, y: 1510, r: 110 }, { x: 1040, y: 1590, r: 110 },
  ];
  const isForbidden = (x, y, pad = 0) => forbidden.some((f) => dist(x, y, f.x, f.y) < f.r + pad) || nearPath(x, y, 85 + pad);

  for (let i = 0; i < 150; i++) {
    const x = rng.range(70, 2330);
    const y = rng.range(90, 1620);
    if (isForbidden(x, y, 20)) continue;
    const roll = rng.next();
    if (roll < 0.16) props.push(pine(x, y, { scale: rng.range(0.85, 1.35), color: rng.pick(['#2b5f4a', '#245540', '#336b50']) }));
    else props.push(tree(x, y, { scale: rng.range(0.85, 1.5), color: rng.chance(0.12) ? rng.pick(AUTUMN) : rng.pick(TREE_COLORS), glow: rng.chance(0.08) ? '#9fe3ff' : null }));
  }
  // Árboles que enmarcan el altar.
  for (const [x, y] of [[980, 300], [1420, 300], [900, 210], [1500, 210], [1100, 160], [1300, 160]]) props.push(tree(x, y, { scale: rng.range(1.05, 1.4), color: '#2f6b4f' }));
  // Rocas, troncos, arbustos y hongos.
  for (let i = 0; i < 32; i++) {
    const x = rng.range(100, 2300), y = rng.range(120, 1600);
    if (isForbidden(x, y, 10)) continue;
    props.push(rock(x, y, { scale: rng.range(0.7, 1.4), color: rng.pick(['#5f6b5a', '#6f7480', '#4a5a4a']) }));
  }
  for (let i = 0; i < 45; i++) {
    const x = rng.range(90, 2310), y = rng.range(100, 1620);
    if (isForbidden(x, y, 0)) continue;
    props.push(bush(x, y, { scale: rng.range(0.7, 1.3), color: rng.pick(['#2f6b4f', '#356f4a', '#3a7052']), berries: rng.chance(0.18) }));
  }
  for (let i = 0; i < 28; i++) {
    const x = rng.range(120, 2280), y = rng.range(140, 1600);
    if (isForbidden(x, y, 0)) continue;
    props.push(mushroom(x, y, { scale: rng.range(0.6, 1.2), color: rng.pick(['#9fe3ff', '#c8ff9a', '#ffcf5a', '#c9a6ff']) }));
  }
  for (let i = 0; i < 8; i++) {
    const x = rng.range(180, 2200), y = rng.range(180, 1500);
    if (isForbidden(x, y, 0)) continue;
    props.push(P('log', x, y, { rot: rng.range(-0.6, 0.6), moss: rng.chance(0.5) }));
  }
  props.push(P('bones', 1600, 1200));
  props.push(P('bones', 620, 780));

  // Puente y agua (obstáculos invisibles).
  props.push(P('bridge', 1250, 900, { w: 170, h: 120 }));
  const extraObstacles = [
    { kind: 'rect', x: 0, y: 842, w: 1165, h: 116 },
    { kind: 'rect', x: 1335, y: 842, w: 1065, h: 116 },
  ];

  return {
    id: 'forest', name: 'Bosque de Lumen', subtitle: 'Susurros entre las raíces',
    w: 2400, h: 1700, safe: false, music: 'forest', ambience: 'forest',
    spawn: { x: 1200, y: 1580 },
    palette: { base: '#1f4a3a', base2: '#173c31', path: '#6b5a3a', path2: '#54452e', water: '#2a5f6f', stone: '#5f6b5a' },
    props, npcs, extraObstacles,
    spawners: [
      { type: 'gelatina', x: 900, y: 1280, level: 1 },
      { type: 'gelatina', x: 1420, y: 1180, level: 1 },
      { type: 'gelatina', x: 760, y: 760, level: 2 },
      { type: 'lobo', x: 1550, y: 1050, level: 2 },
      { type: 'lobo', x: 900, y: 610, level: 2 },
      { type: 'lobo', x: 1780, y: 480, level: 3 },
      { type: 'gelatina', x: 1900, y: 1150, level: 2 },
      { type: 'lobo', x: 620, y: 380, level: 3 },
      { type: 'gelatina', x: 1450, y: 380, level: 3 },
    ],
    ambient: { leaves: 46, motes: 34, embers: 0, stars: 0, color: '#c8ff9a' },
    lights: [
      { x: 520, y: 1260, r: 170, color: '#9fe3ff' }, { x: 1200, y: 270, r: 200, color: '#ffe6a0' },
      { x: 2290, y: 470, r: 160, color: '#c9a6ff' }, { x: 1280, y: 1480, r: 150, color: '#ffb35a' },
      { x: 420, y: 880, r: 80, color: '#c8ff9a' }, { x: 1760, y: 700, r: 80, color: '#c8ff9a' },
    ],
  };
}

// ---------------------------------------------------------------------------
// RUINAS DE AETHER
// ---------------------------------------------------------------------------

function buildRuins() {
  const props = [];
  const npcs = [];
  const rng = new RNG(7311);

  // Santuario y cofres.
  props.push(P('shrine', 380, 1460, { id: 'ruins', interact: { kind: 'shrine', id: 'ruins' } }));
  props.push(P('chest', 2030, 1510, { id: 'ruins_chest1', interact: { kind: 'chest', id: 'ruins_chest1', gold: 180, items: [{ id: 'potion_mayor', qty: 2 }, { id: 'bomba', qty: 2 }] } }));
  props.push(P('chest', 520, 1080, { id: 'ruins_chest2', interact: { kind: 'chest', id: 'ruins_chest2', gold: 100, items: [{ id: 'ether', qty: 2 }, { id: 'antidote', qty: 1 }] } }));
  props.push(P('chest', 1760, 640, { id: 'ruins_chest3', interact: { kind: 'chest', id: 'ruins_chest3', gold: 240, items: [{ id: 'vestiduras_aether', qty: 1, equipment: true }] } }));

  // Runas y piedra de lore.
  props.push(P('rune', 760, 760, { runeId: 'sol', interact: { kind: 'rune', runeId: 'sol' } }));
  props.push(P('rune', 1200, 560, { runeId: 'luna', interact: { kind: 'rune', runeId: 'luna' } }));
  props.push(P('rune', 1640, 760, { runeId: 'estrella', interact: { kind: 'rune', runeId: 'estrella' } }));
  props.push(P('loreStone', 1200, 950, { interact: { kind: 'lore', text: 'Tres runas sostienen el cielo: primero el SOL que despierta, después la LUNA que recuerda, al final la ESTRELLA que guía. Quien invierta el orden despertará al Guardián antes de tiempo.' } }));
  props.push(P('barrier', 1200, 370, { color: '#c9a6ff', w: 200, h: 130, active: (g) => !(g.state.flags.rune_sol && g.state.flags.rune_luna && g.state.flags.rune_estrella) }));

  // Portal al santuario y puerta de regreso.
  props.push(P('portal', 1200, 100, {
    color: '#ffe6a0', label: 'Santuario Celestial',
    interact: { kind: 'portal', to: 'sanctuary', spawn: { x: 1000, y: 1340 }, label: 'Santuario Celestial', requires: 'sanctuary' },
  }));
  props.push(P('barrier', 1200, 100, { color: '#ffe6a0', w: 180, h: 120, active: (g) => !g.state.flags.guardian_defeated }));
  props.push(P('portal', 1200, 1680, {
    color: '#9fe3ff', label: 'Bosque de Lumen',
    interact: { kind: 'portal', to: 'forest', spawn: { x: 2220, y: 470 }, label: 'Bosque de Lumen' },
  }));
  props.push(P('sign', 1200, 1580, { text: 'Ruinas de Aether', interact: { kind: 'sign', text: 'Ruinas de Aether. «El cielo cayó aquí, y aún no ha terminado de caer.»' } }));

  // Ecos de memoria.
  [[700, 500], [1900, 900], [1450, 1550]].forEach(([x, y], i) => {
    props.push(P('echo', x, y, { id: `echo${i + 1}`, seed: i * 2.3, interact: { kind: 'echo', id: `echo${i + 1}` } }));
  });

  // NPC espíritu.
  npcs.push(NPC('elian', 1740, 1200, { name: 'Espíritu de Aether', title: 'Memoria sin nombre', color: '#3c4a8a', accent: '#9fe3ff', hair: '#c9d8ff', job: 'spirit', hat: 'hood', seed: 1.8 }));

  // Columnas y arquitectura.
  for (const [x, y] of [[300, 500], [500, 700], [900, 500], [1500, 500], [1900, 700], [2100, 500], [300, 1100], [600, 1250], [1800, 1250], [2100, 1100], [900, 1350], [1500, 1350]]) {
    props.push(P('pillar', x, y, { scale: rng.range(0.8, 1.2), rune: rng.chance(0.4) }));
  }
  for (const [x, y] of [[1200, 1280], [1200, 780], [680, 980], [1720, 980]]) props.push(P('statue', x, y, { color: '#6a6f88', glow: rng.chance(0.5) ? '#9fe3ff' : null }));
  for (const [x, y] of [[1200, 1450], [1200, 450], [450, 900], [1950, 900]]) props.push(P('arch', x, y, { scale: 1.05 }));
  props.push(P('throne', 1200, 260));
  props.push(P('banner', 850, 420, { color: '#3c4a8a' }));
  props.push(P('banner', 1550, 420, { color: '#3c4a8a' }));

  // Cristales, escombros, tumbas.
  for (let i = 0; i < 18; i++) {
    const x = rng.range(180, 2220), y = rng.range(200, 1600);
    if (dist(x, y, 1200, 700) < 250) continue;
    props.push(P('crystal', x, y, { scale: rng.range(0.6, 1.3), color: rng.pick(['#9fe3ff', '#c9a6ff', '#8fd8ff']), seed: rng.next() * 6 }));
  }
  for (let i = 0; i < 22; i++) props.push(P('debris', rng.range(200, 2200), rng.range(200, 1600), { seed: rng.next() * 6, scale: rng.range(0.6, 1.3) }));
  for (let i = 0; i < 8; i++) props.push(P('gravestone', rng.range(250, 2150), rng.range(300, 1500), { glow: rng.chance(0.25) ? '#9fe3ff' : null }));
  for (let i = 0; i < 10; i++) props.push(P('bones', rng.range(250, 2150), rng.range(300, 1500)));
  for (let i = 0; i < 16; i++) props.push(P('torch', 420 + (i % 4) * 520, 1300 + Math.floor(i / 4) * 120, { seed: rng.next() * 6 }));
  for (let i = 0; i < 10; i++) props.push(rock(rng.range(180, 2220), rng.range(250, 1600), { scale: rng.range(0.8, 1.5), color: '#5a5f72' }));

  return {
    id: 'ruins', name: 'Ruinas de Aether', subtitle: 'Memoria que no descansa',
    w: 2400, h: 1800, safe: false, music: 'ruins', ambience: 'night',
    spawn: { x: 1200, y: 1700 },
    palette: { base: '#25253a', base2: '#1b1b2c', path: '#3f3f5c', path2: '#30304a', stone: '#4a4a66', moss: '#3f5a4a' },
    props, npcs, extraObstacles: [],
    spawners: [
      { type: 'escarabajo', x: 600, y: 1300, level: 4 },
      { type: 'escarabajo', x: 1850, y: 1350, level: 4 },
      { type: 'espectro', x: 500, y: 950, level: 4 },
      { type: 'espectro', x: 1900, y: 1000, level: 5 },
      { type: 'espectro', x: 900, y: 850, level: 5 },
      { type: 'escarabajo', x: 1550, y: 900, level: 5 },
      { type: 'espectro', x: 1600, y: 400, level: 6 },
      { type: 'escarabajo', x: 800, y: 400, level: 6 },
      { type: 'guardian', x: 1200, y: 230, level: 7, once: true, flag: 'guardian_defeated', trigger: { x: 1200, y: 360, r: 430 } },
    ],
    ambient: { leaves: 0, motes: 46, embers: 10, stars: 0, color: '#9fe3ff' },
    lights: [
      { x: 380, y: 1460, r: 170, color: '#9fe3ff' }, { x: 1200, y: 100, r: 190, color: '#ffe6a0' },
      { x: 760, y: 760, r: 120, color: '#9fe3ff' }, { x: 1200, y: 560, r: 120, color: '#9fe3ff' },
      { x: 1640, y: 760, r: 120, color: '#9fe3ff' }, { x: 1200, y: 260, r: 200, color: '#c9a6ff' },
      { x: 1200, y: 950, r: 100, color: '#c9a6ff' },
    ],
  };
}

// ---------------------------------------------------------------------------
// SANTUARIO CELESTIAL
// ---------------------------------------------------------------------------

function buildSanctuary() {
  const props = [];
  const npcs = [];
  const rng = new RNG(9901);

  props.push(P('shrine', 1000, 1240, { id: 'sanctuary', interact: { kind: 'shrine', id: 'sanctuary' } }));
  props.push(P('portal', 1000, 1430, {
    color: '#9fe3ff', label: 'Ruinas de Aether',
    interact: { kind: 'portal', to: 'ruins', spawn: { x: 1200, y: 200 }, label: 'Ruinas de Aether' },
  }));
  props.push(P('barrier', 1000, 1080, { color: '#e8c56a', w: 340, h: 120, active: (g) => g.state.flags.kael_active && !g.state.flags.kael_defeated }));
  props.push(P('throne', 1000, 300));
  props.push(P('statue', 760, 900, { color: '#c9b58a', glow: '#ffe6a0' }));
  props.push(P('statue', 1240, 900, { color: '#c9b58a', glow: '#ffe6a0' }));
  for (const [x, y] of [[520, 520], [1480, 520], [420, 900], [1580, 900], [620, 1200], [1380, 1200], [700, 380], [1300, 380]]) {
    props.push(P('pillar', x, y, { scale: 1.15, rune: true }));
  }
  for (const [x, y] of [[760, 600], [1240, 600], [520, 1080], [1480, 1080]]) props.push(P('arch', x, y, { scale: 1.15 }));
  for (const [x, y] of [[620, 700], [1380, 700], [600, 1000], [1400, 1000], [900, 430], [1100, 430]]) {
    props.push(P('crystal', x, y, { scale: rng.range(0.8, 1.4), color: rng.pick(['#ffe6a0', '#9fe3ff', '#fff3c4']), seed: rng.next() * 6 }));
  }
  for (let i = 0; i < 16; i++) props.push(P('debris', rng.range(300, 1700), rng.range(250, 1300), { seed: rng.next() * 6, scale: rng.range(0.7, 1.4) }));
  for (let i = 0; i < 8; i++) props.push(P('cloud', rng.range(200, 1800), rng.range(200, 1200), { seed: rng.next() * 6, scale: rng.range(0.8, 1.6), alpha: rng.range(0.05, 0.14), color: rng.pick(['#c9d8ff', '#ffe6a0', '#c9a6ff']) }));
  for (let i = 0; i < 6; i++) props.push(P('banner', 620 + i * 150, 760, { color: i % 2 ? '#3c4a8a' : '#8a3f3f' }));
  for (let i = 0; i < 12; i++) props.push(P('torch', 520 + (i % 6) * 190, 1140 + Math.floor(i / 6) * 80, { seed: rng.next() * 6 }));
  // Restos de la orden.
  for (let i = 0; i < 8; i++) props.push(P('bones', rng.range(450, 1550), rng.range(500, 1300)));
  props.push(P('gravestone', 760, 1120, { glow: '#ffe6a0' }));
  props.push(P('gravestone', 1240, 1120, { glow: '#ffe6a0' }));

  return {
    id: 'sanctuary', name: 'Santuario Celestial', subtitle: 'El último amanecer',
    w: 2000, h: 1500, safe: false, music: 'sanctuary', ambience: 'cosmic',
    spawn: { x: 1000, y: 1340 },
    palette: { base: '#080b18', base2: '#0d1228', path: '#c9c2b0', path2: '#a89f8a', stone: '#d8d2c4', gold: '#e8c56a' },
    props, npcs, extraObstacles: [],
    spawners: [
      { type: 'espectro', x: 700, y: 900, level: 8 },
      { type: 'espectro', x: 1300, y: 900, level: 8 },
      { type: 'kael', x: 1000, y: 560, level: 10, once: true, flag: 'kael_defeated', trigger: { x: 1000, y: 980, r: 420 }, boss: true },
    ],
    ambient: { leaves: 0, motes: 60, embers: 14, stars: 80, color: '#ffe6a0' },
    lights: [
      { x: 1000, y: 1240, r: 200, color: '#9fe3ff' }, { x: 1000, y: 300, r: 260, color: '#ffe6a0' },
      { x: 1000, y: 1430, r: 170, color: '#9fe3ff' }, { x: 760, y: 900, r: 120, color: '#ffe6a0' },
      { x: 1240, y: 900, r: 120, color: '#ffe6a0' }, { x: 1000, y: 560, r: 300, color: '#c9a6ff' },
    ],
  };
}

const BUILDERS = { village: buildVillage, forest: buildForest, ruins: buildRuins, sanctuary: buildSanctuary };

// ---------------------------------------------------------------------------
// CLASE WORLD
// ---------------------------------------------------------------------------

export class World {
  constructor(id, game) {
    const def = BUILDERS[id] ? BUILDERS[id]() : buildVillage();
    this.def = def;
    this.id = def.id;
    this.w = def.w;
    this.h = def.h;
    this.game = game;
    this.props = def.props;
    this.npcs = def.npcs;
    this.extraObstacles = def.extraObstacles || [];
    this.obstacles = [];
    this.interactables = [];
    this.ambient = [];
    this.time = 0;
    this.ground = null;
    this.minimapBase = null;
    this.build();
  }

  build() {
    const props = this.props;
    // Ordenar por profundidad.
    props.sort((a, b) => a.y - b.y);
    for (const p of props) {
      const o = this._obstacleFor(p);
      if (o) this.obstacles.push(o);
      if (p.interact) this.interactables.push(p);
    }
    for (const n of this.npcs) {
      this.obstacles.push({ kind: 'circle', x: n.x, y: n.y - 6, r: 12, npc: n });
      this.interactables.push({ ...n, type: 'npc', interact: { kind: 'npc', id: n.id } });
    }
    this.obstacles.push(...this.extraObstacles.map((o) => ({ ...o, extra: true })));
    this.ground = this._renderGround();
    this.minimapBase = this._renderMinimapBase();
    this._initAmbient();
  }

  _obstacleFor(p) {
    const s = p.scale || 1;
    switch (p.type) {
      case 'tree': return { kind: 'circle', x: p.x, y: p.y - 4, r: 12 * s };
      case 'pine': return { kind: 'circle', x: p.x, y: p.y - 2, r: 10 * s };
      case 'house': return { kind: 'rect', x: p.x - (p.w || 230) / 2, y: p.y - 34, w: p.w || 230, h: 42 };
      case 'rock': return { kind: 'circle', x: p.x, y: p.y - 4, r: 17 * s };
      case 'pillar': return { kind: 'circle', x: p.x, y: p.y - 4, r: 13 * s };
      case 'crystal': return { kind: 'circle', x: p.x, y: p.y - 2, r: 12 * s };
      case 'torch': return { kind: 'circle', x: p.x, y: p.y - 2, r: 4 };
      case 'fence': return { kind: 'rect', x: p.x - ((p.n || 4) * 20 * s) / 2, y: p.y - 14, w: (p.n || 4) * 20 * s, h: 18 };
      case 'well': return { kind: 'circle', x: p.x, y: p.y - 6, r: 31 };
      case 'statue': return { kind: 'circle', x: p.x, y: p.y - 4, r: 18 * s };
      case 'shrine': return { kind: 'circle', x: p.x, y: p.y - 6, r: 24 };
      case 'chest': return { kind: 'circle', x: p.x, y: p.y - 4, r: 17 };
      case 'portal': return { kind: 'circle', x: p.x, y: p.y - 4, r: 28 };
      case 'rune': return { kind: 'circle', x: p.x, y: p.y - 4, r: 16 };
      case 'altar': return { kind: 'circle', x: p.x, y: p.y - 6, r: 30 };
      case 'barrier': return { kind: 'barrier', x: p.x - (p.w || 120) / 2, y: p.y - (p.h || 80), w: p.w || 120, h: p.h || 80, prop: p };
      case 'mushroom': return { kind: 'circle', x: p.x, y: p.y - 2, r: 5 * s };
      case 'bush': return { kind: 'circle', x: p.x, y: p.y - 2, r: 8 * s };
      case 'log': return { kind: 'rect', x: p.x - 22 * s, y: p.y - 10 * s, w: 44 * s, h: 16 * s };
      case 'campfire': return { kind: 'circle', x: p.x, y: p.y - 2, r: 15 };
      case 'tent': return { kind: 'rect', x: p.x - 34, y: p.y - 12, w: 68, h: 18 };
      case 'gravestone': return { kind: 'circle', x: p.x, y: p.y - 2, r: 11 };
      case 'throne': return { kind: 'rect', x: p.x - 34, y: p.y - 16, w: 68, h: 20 };
      case 'arch': return { kind: 'rect', x: p.x - 58 * s, y: p.y - 12, w: 116 * s, h: 16 };
      case 'banner': return { kind: 'circle', x: p.x, y: p.y - 2, r: 5 };
      case 'bones': return null;
      case 'debris': return null;
      case 'bridge': return null;
      case 'cloud': return null;
      case 'echo': return null;
      case 'firefly': return null;
      case 'sign': return { kind: 'circle', x: p.x, y: p.y - 2, r: 7 };
      case 'loreStone': return { kind: 'circle', x: p.x, y: p.y - 2, r: 18 };
      default: return null;
    }
  }

  collides(x, y, r = 13) {
    if (x < 24 + r || y < 24 + r || x > this.w - 24 - r || y > this.h - 24 - r) return true;
    for (const o of this.obstacles) {
      if (o.kind === 'circle') {
        const rr = o.r + r;
        if ((x - o.x) ** 2 + (y - o.y) ** 2 < rr * rr) return true;
      } else if (o.kind === 'rect') {
        if (x + r > o.x && x - r < o.x + o.w && y + r > o.y && y - r < o.y + o.h) return true;
      } else if (o.kind === 'barrier') {
        if (o.prop?.active?.(this.game) === false) continue;
        if (x + r > o.x && x - r < o.x + o.w && y + r > o.y && y - r < o.y + o.h) return true;
      }
    }
    return false;
  }

  nearInteractable(x, y, radius = 88) {
    let best = null;
    let bestD = radius;
    for (const it of this.interactables) {
      if (it.interact?.kind === 'sign') {
        // Los letreros son opcionales; se muestran igual.
      }
      const d = dist(x, y, it.x, it.y);
      if (d < bestD) { best = it; bestD = d; }
    }
    return best;
  }

  getPropById(id) {
    return this.props.find((p) => p.id === id);
  }

  _initAmbient() {
    const cfg = this.def.ambient || {};
    const rng = new RNG(this.id.length * 999 + 17);
    const add = (type, n) => {
      for (let i = 0; i < n; i++) {
        this.ambient.push({
          type, x: rng.range(40, this.w - 40), y: rng.range(40, this.h - 40),
          vx: rng.range(-8, 8), vy: rng.range(-10, 6), size: rng.range(1.2, 3.4),
          phase: rng.next() * TAU, speed: rng.range(0.3, 1.1), alpha: rng.range(0.25, 0.7),
        });
      }
    };
    if (cfg.leaves) add('leaf', cfg.leaves);
    if (cfg.motes) add('mote', cfg.motes);
    if (cfg.embers) add('ember', cfg.embers);
    if (cfg.stars) add('star', cfg.stars);
  }

  update(dt) {
    this.time += dt;
    for (const a of this.ambient) {
      a.x += (a.vx + Math.sin(this.time * a.speed + a.phase) * 8) * dt;
      a.y += (a.vy + Math.cos(this.time * a.speed * 0.8 + a.phase) * 5) * dt;
      if (a.type === 'ember') a.y -= 18 * dt;
      if (a.type === 'leaf') a.y += 4 * dt;
      if (a.x < 0) a.x += this.w;
      if (a.x > this.w) a.x -= this.w;
      if (a.y < 0) a.y += this.h;
      if (a.y > this.h) a.y -= this.h;
    }
  }

  drawGround(ctx, camX, camY, vw, vh) {
    if (!this.ground) return;
    ctx.drawImage(this.ground, camX, camY, vw, vh, camX, camY, vw, vh);
  }

  drawAmbientBack(ctx, cam, vw, vh) {
    const t = this.time;
    ctx.save();
    for (const a of this.ambient) {
      if (a.x < cam.x - 40 || a.x > cam.x + vw + 40 || a.y < cam.y - 40 || a.y > cam.y + vh + 40) continue;
      if (a.type === 'leaf') {
        ctx.save();
        ctx.translate(a.x, a.y);
        ctx.rotate(Math.sin(t * 0.8 + a.phase) * 1.2);
        ctx.fillStyle = hexToRgba('#8fbf6a', a.alpha * 0.75);
        ctx.beginPath(); ctx.ellipse(0, 0, a.size * 1.7, a.size * 0.7, 0, 0, TAU); ctx.fill();
        ctx.restore();
      } else if (a.type === 'star') {
        ctx.fillStyle = `rgba(255,243,196,${a.alpha * (0.4 + Math.sin(t * 2 + a.phase) * 0.3)})`;
        ctx.beginPath(); ctx.arc(a.x, a.y, a.size * 0.55, 0, TAU); ctx.fill();
      }
    }
    ctx.restore();
  }

  drawAmbientFront(ctx, cam, vw, vh) {
    const t = this.time;
    for (const a of this.ambient) {
      if (a.x < cam.x - 40 || a.x > cam.x + vw + 40 || a.y < cam.y - 40 || a.y > cam.y + vh + 40) continue;
      if (a.type === 'mote') {
        drawMote(ctx, a.x, a.y + Math.sin(t * 1.4 + a.phase) * 6, a.size * 2.4, this.def.ambient?.color || '#9fe3ff', a.alpha * (0.35 + Math.sin(t * 2 + a.phase) * 0.15));
      } else if (a.type === 'ember') {
        drawMote(ctx, a.x, a.y, a.size * 2.2, '#ff8a3d', a.alpha * 0.7);
      }
    }
  }

  drawMinimap(ctx, w, h, player, enemies, questMarkers = []) {
    if (!this.minimapBase) return;
    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(this.minimapBase, 0, 0, w, h);
    const sx = w / this.w, sy = h / this.h;
    for (const m of questMarkers) {
      ctx.fillStyle = '#ffe6a0';
      ctx.beginPath(); ctx.arc(m.x * sx, m.y * sy, 3, 0, TAU); ctx.fill();
    }
    for (const e of enemies) {
      if (e.dead) continue;
      ctx.fillStyle = e.def?.boss ? '#ff6b6b' : '#e0566a';
      ctx.beginPath(); ctx.arc(e.x * sx, e.y * sy, e.def?.elite ? 3 : 2, 0, TAU); ctx.fill();
    }
    // Jugador.
    ctx.save();
    ctx.translate(player.x * sx, player.y * sy);
    ctx.rotate((player.facing || 0) + Math.PI / 2);
    ctx.fillStyle = '#fff3c4';
    ctx.beginPath(); ctx.moveTo(0, -5); ctx.lineTo(3.5, 4); ctx.lineTo(0, 2.2); ctx.lineTo(-3.5, 4); ctx.closePath(); ctx.fill();
    ctx.restore();
    // Marco.
    ctx.strokeStyle = 'rgba(232,197,106,.45)';
    ctx.lineWidth = 1;
    ctx.strokeRect(0.5, 0.5, w - 1, h - 1);
  }

  _renderMinimapBase() {
    const c = document.createElement('canvas');
    c.width = 240;
    c.height = Math.round(240 * this.h / this.w);
    const ctx = c.getContext('2d');
    const pal = this.def.palette;
    ctx.fillStyle = pal.base;
    ctx.fillRect(0, 0, c.width, c.height);
    const sx = c.width / this.w, sy = c.height / this.h;
    // Obstáculos grandes.
    for (const o of this.obstacles) {
      if (o.kind === 'circle') {
        if (o.r < 10) continue;
        ctx.fillStyle = this.id === 'village' ? 'rgba(30,50,35,.55)' : 'rgba(10,15,25,.55)';
        ctx.beginPath(); ctx.arc(o.x * sx, o.y * sy, Math.max(1, o.r * sx), 0, TAU); ctx.fill();
      } else if (o.kind === 'rect') {
        ctx.fillStyle = this.id === 'village' ? 'rgba(60,45,35,.6)' : 'rgba(10,15,25,.6)';
        ctx.fillRect(o.x * sx, o.y * sy, Math.max(1, o.w * sx), Math.max(1, o.h * sy));
      }
    }
    // Portales.
    for (const p of this.props) {
      if (p.type === 'portal') {
        ctx.fillStyle = '#9fe3ff';
        ctx.beginPath(); ctx.arc(p.x * sx, p.y * sy, 2.5, 0, TAU); ctx.fill();
      } else if (p.type === 'shrine') {
        ctx.fillStyle = '#ffe6a0';
        ctx.beginPath(); ctx.arc(p.x * sx, p.y * sy, 2.2, 0, TAU); ctx.fill();
      }
    }
    return c;
  }

  _renderGround() {
    const c = document.createElement('canvas');
    c.width = this.w;
    c.height = this.h;
    const ctx = c.getContext('2d');
    const pal = this.def.palette;
    const rng = new RNG(this.w + this.h + this.id.length * 71);
    // Base.
    const base = ctx.createLinearGradient(0, 0, this.w, this.h);
    base.addColorStop(0, pal.base);
    base.addColorStop(0.5, pal.base2);
    base.addColorStop(1, pal.base);
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, this.w, this.h);

    if (this.id === 'village') this._groundVillage(ctx, rng, pal);
    else if (this.id === 'forest') this._groundForest(ctx, rng, pal);
    else if (this.id === 'ruins') this._groundRuins(ctx, rng, pal);
    else this._groundSanctuary(ctx, rng, pal);

    // Viñeta de terreno.
    const vg = ctx.createRadialGradient(this.w / 2, this.h / 2, Math.min(this.w, this.h) * 0.3, this.w / 2, this.h / 2, Math.max(this.w, this.h) * 0.7);
    vg.addColorStop(0, 'rgba(0,0,0,0)');
    vg.addColorStop(1, 'rgba(0,0,0,.28)');
    ctx.fillStyle = vg;
    ctx.fillRect(0, 0, this.w, this.h);
    return c;
  }

  _path(ctx, points, width, color, alpha = 1) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(points[0][0], points[0][1]);
    for (let i = 1; i < points.length - 1; i++) {
      const xc = (points[i][0] + points[i + 1][0]) / 2;
      const yc = (points[i][1] + points[i + 1][1]) / 2;
      ctx.quadraticCurveTo(points[i][0], points[i][1], xc, yc);
    }
    const last = points[points.length - 1];
    ctx.lineTo(last[0], last[1]);
    ctx.stroke();
    ctx.restore();
  }

  _groundVillage(ctx, rng, pal) {
    const w = this.w, h = this.h;
    // Manchas de hierba.
    for (let i = 0; i < 380; i++) {
      const x = rng.range(0, w), y = rng.range(0, h);
      const r = rng.range(18, 80);
      const g = ctx.createRadialGradient(x, y, 1, x, y, r);
      g.addColorStop(0, hexToRgba(rng.chance(0.5) ? '#5d8a50' : '#3d6639', rng.range(0.06, 0.18)));
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
    }
    // Caminos.
    this._path(ctx, [[950, 1290], [950, 1120], [950, 900], [950, 700], [950, 470], [950, 150]], 150, pal.path);
    this._path(ctx, [[950, 1120], [1120, 1040], [1280, 940], [1460, 860]], 110, pal.path);
    this._path(ctx, [[950, 900], [760, 860], [560, 820], [420, 820]], 100, pal.path);
    this._path(ctx, [[950, 700], [950, 610], [760, 610], [620, 590], [520, 540]], 86, pal.path);
    this._path(ctx, [[950, 610], [1120, 580], [1280, 540], [1380, 500]], 80, pal.path);
    this._path(ctx, [[950, 1120], [800, 1180], [700, 1220]], 70, pal.path);
    // Textura de camino.
    for (let i = 0; i < 900; i++) {
      const x = rng.range(400, 1700), y = rng.range(180, 1250);
      const near = Math.abs(x - 950) < 95 || (y > 580 && y < 650 && x < 1200) || (y > 780 && y < 900 && x < 1000);
      if (!near && rng.chance(0.65)) continue;
      ctx.fillStyle = hexToRgba(rng.chance(0.5) ? '#d0b98a' : '#8a6f4a', rng.range(0.12, 0.35));
      ctx.beginPath(); ctx.ellipse(x, y, rng.range(1, 4), rng.range(0.7, 2), rng.next() * 3, 0, TAU); ctx.fill();
    }
    // Plaza.
    const pg = ctx.createRadialGradient(950, 950, 20, 950, 950, 200);
    pg.addColorStop(0, 'rgba(190,180,150,.8)');
    pg.addColorStop(0.7, 'rgba(160,150,125,.5)');
    pg.addColorStop(1, 'rgba(160,150,125,0)');
    ctx.fillStyle = pg;
    ctx.beginPath(); ctx.arc(950, 950, 200, 0, TAU); ctx.fill();
    for (let i = 0; i < 90; i++) {
      const a = rng.next() * TAU, d = rng.range(20, 185);
      const x = 950 + Math.cos(a) * d, y = 950 + Math.sin(a) * d;
      ctx.fillStyle = hexToRgba('#b8ae92', rng.range(0.15, 0.4));
      ctx.fillRect(x, y, rng.range(3, 10), rng.range(2, 6));
    }
    // Hierba y flores.
    for (let i = 0; i < 1500; i++) {
      const x = rng.range(20, w - 20), y = rng.range(20, h - 20);
      if (Math.abs(x - 950) < 90 || dist(x, y, 950, 950) < 190) continue;
      ctx.strokeStyle = hexToRgba(rng.chance(0.5) ? '#6f9a58' : '#3d6639', rng.range(0.2, 0.5));
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + rng.range(-2, 2), y - rng.range(3, 8)); ctx.stroke();
      if (rng.chance(0.06)) {
        ctx.fillStyle = rng.pick(['#f0cf7a', '#e8a0b8', '#c9d8ff', '#f4e6c8']);
        ctx.beginPath(); ctx.arc(x, y - 6, rng.range(1.2, 2.4), 0, TAU); ctx.fill();
      }
    }
    // Piedras y bordes.
    for (let i = 0; i < 120; i++) {
      const x = rng.range(40, w - 40), y = rng.range(40, h - 40);
      ctx.fillStyle = hexToRgba('#7a7f8c', rng.range(0.12, 0.3));
      ctx.beginPath(); ctx.ellipse(x, y, rng.range(2, 6), rng.range(1, 3), rng.next() * 3, 0, TAU); ctx.fill();
    }
  }

  _groundForest(ctx, rng, pal) {
    const w = this.w, h = this.h;
    // Manchas de musgo y sombra.
    for (let i = 0; i < 420; i++) {
      const x = rng.range(0, w), y = rng.range(0, h);
      const r = rng.range(20, 100);
      const g = ctx.createRadialGradient(x, y, 1, x, y, r);
      g.addColorStop(0, hexToRgba(rng.pick(['#2f6b4f', '#173c31', '#3a7052', '#1a3028']), rng.range(0.08, 0.22)));
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
    }
    // Sendero.
    this._path(ctx, [[1200, 1690], [1180, 1460], [1000, 1240], [1050, 1020], [1250, 900], [1250, 760], [1010, 600], [1100, 430], [1200, 260]], 100, pal.path);
    this._path(ctx, [[1200, 1690], [1180, 1460], [1000, 1240], [1050, 1020], [1250, 900], [1250, 760], [1010, 600], [1100, 430], [1200, 260]], 48, pal.path2, 0.7);
    // Arroyo.
    const stream = ctx.createLinearGradient(0, 840, 0, 960);
    stream.addColorStop(0, 'rgba(30,80,90,.0)');
    stream.addColorStop(0.15, hexToRgba(pal.water, 0.85));
    stream.addColorStop(0.5, hexToRgba('#3f8a9f', 0.9));
    stream.addColorStop(0.85, hexToRgba(pal.water, 0.85));
    stream.addColorStop(1, 'rgba(30,80,90,0)');
    ctx.fillStyle = stream;
    ctx.fillRect(0, 840, w, 120);
    // Orillas.
    ctx.strokeStyle = 'rgba(100,150,110,.25)'; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(0, 844); ctx.lineTo(w, 844); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, 956); ctx.lineTo(w, 956); ctx.stroke();
    // Ondas.
    for (let i = 0; i < 110; i++) {
      const x = rng.range(0, w), y = rng.range(855, 945);
      ctx.strokeStyle = hexToRgba(rng.chance(0.5) ? '#9fe3ff' : '#6fb8c9', rng.range(0.1, 0.3));
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.ellipse(x, y, rng.range(4, 16), rng.range(1, 3), 0, 0, TAU); ctx.stroke();
    }
    // Nenúfares.
    for (let i = 0; i < 16; i++) {
      const x = rng.range(40, w - 40), y = rng.range(860, 940);
      ctx.fillStyle = 'rgba(80,140,90,.6)';
      ctx.beginPath(); ctx.ellipse(x, y, rng.range(4, 9), rng.range(2, 4), rng.next() * 3, 0, TAU); ctx.fill();
    }
    // Hierba, helechos y hongos pintados.
    for (let i = 0; i < 1800; i++) {
      const x = rng.range(20, w - 20), y = rng.range(20, h - 20);
      if (y > 835 && y < 965) continue;
      ctx.strokeStyle = hexToRgba(rng.pick(['#4f8a5a', '#2f6b4f', '#6f9a58', '#1a4a3a']), rng.range(0.15, 0.5));
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + rng.range(-3, 3), y - rng.range(3, 11)); ctx.stroke();
      if (rng.chance(0.02)) {
        ctx.fillStyle = hexToRgba(rng.pick(['#9fe3ff', '#c8ff9a', '#c9a6ff']), 0.7);
        ctx.beginPath(); ctx.arc(x, y - 4, 1.5, 0, TAU); ctx.fill();
      }
    }
    // Hojas caídas.
    for (let i = 0; i < 260; i++) {
      const x = rng.range(20, w - 20), y = rng.range(20, h - 20);
      ctx.save();
      ctx.translate(x, y); ctx.rotate(rng.next() * TAU);
      ctx.fillStyle = hexToRgba(rng.pick(['#8a5a2b', '#6b4a30', '#a35d2d', '#3d6639']), rng.range(0.15, 0.4));
      ctx.beginPath(); ctx.ellipse(0, 0, rng.range(2, 5), rng.range(0.8, 2), 0, 0, TAU); ctx.fill();
      ctx.restore();
    }
  }

  _groundRuins(ctx, rng, pal) {
    const w = this.w, h = this.h;
    // Losa base.
    ctx.fillStyle = pal.base;
    ctx.fillRect(0, 0, w, h);
    // Baldosas.
    const tile = 80;
    for (let y = 0; y < h; y += tile) {
      for (let x = 0; x < w; x += tile) {
        const shade = rng.range(-0.06, 0.06);
        ctx.fillStyle = hexToRgba(rng.chance(0.5) ? '#3a3a55' : '#30304a', 0.55 + shade);
        ctx.fillRect(x + 2, y + 2, tile - 4, tile - 4);
        ctx.strokeStyle = 'rgba(10,10,20,.35)'; ctx.lineWidth = 1;
        ctx.strokeRect(x + 1.5, y + 1.5, tile - 3, tile - 3);
        if (rng.chance(0.08)) {
          ctx.strokeStyle = 'rgba(10,10,20,.55)';
          ctx.beginPath(); ctx.moveTo(x + rng.range(10, 60), y + 8); ctx.lineTo(x + rng.range(10, 70), y + rng.range(20, 70)); ctx.stroke();
        }
      }
    }
    // Musgo.
    for (let i = 0; i < 180; i++) {
      const x = rng.range(0, w), y = rng.range(0, h);
      const r = rng.range(8, 50);
      const g = ctx.createRadialGradient(x, y, 1, x, y, r);
      g.addColorStop(0, hexToRgba(pal.moss, rng.range(0.08, 0.2)));
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
    }
    // Pasillo central y patios.
    this._path(ctx, [[1200, 1760], [1200, 1400], [1200, 1100], [1200, 800], [1200, 500], [1200, 180]], 230, '#343450', 0.7);
    this._path(ctx, [[1200, 950], [900, 900], [600, 850], [420, 800]], 150, '#343450', 0.55);
    this._path(ctx, [[1200, 950], [1500, 900], [1800, 850], [1980, 800]], 150, '#343450', 0.55);
    // Mosaico circular.
    ctx.save();
    ctx.translate(1200, 800);
    for (let i = 0; i < 4; i++) {
      ctx.strokeStyle = hexToRgba(i % 2 ? '#c9a6ff' : '#9fe3ff', 0.18);
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(0, 0, 110 - i * 24, 0, TAU); ctx.stroke();
    }
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * TAU;
      ctx.strokeStyle = 'rgba(201,166,255,.15)'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(Math.cos(a) * 28, Math.sin(a) * 28); ctx.lineTo(Math.cos(a) * 104, Math.sin(a) * 104); ctx.stroke();
    }
    ctx.restore();
    // Grietas.
    for (let i = 0; i < 50; i++) {
      const x = rng.range(0, w), y = rng.range(0, h);
      ctx.strokeStyle = 'rgba(8,8,16,.6)'; ctx.lineWidth = rng.range(0.5, 1.6);
      ctx.beginPath(); ctx.moveTo(x, y);
      let px = x, py = y;
      for (let j = 0; j < 5; j++) { px += rng.range(-18, 18); py += rng.range(-18, 18); ctx.lineTo(px, py); }
      ctx.stroke();
    }
    // Polvo y escombros.
    for (let i = 0; i < 600; i++) {
      const x = rng.range(0, w), y = rng.range(0, h);
      ctx.fillStyle = hexToRgba(rng.chance(0.5) ? '#5a5f72' : '#2a2a3f', rng.range(0.1, 0.35));
      ctx.fillRect(x, y, rng.range(1, 4), rng.range(1, 3));
    }
  }

  _groundSanctuary(ctx, rng, pal) {
    const w = this.w, h = this.h;
    // Vacío estrellado.
    const bg = ctx.createRadialGradient(w / 2, h / 2, 100, w / 2, h / 2, w * 0.7);
    bg.addColorStop(0, '#1a2038');
    bg.addColorStop(0.55, '#0d1228');
    bg.addColorStop(1, '#050711');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);
    // Estrellas.
    for (let i = 0; i < 700; i++) {
      const x = rng.range(0, w), y = rng.range(0, h);
      const a = rng.range(0.08, 0.6);
      ctx.fillStyle = `rgba(255,243,196,${a})`;
      ctx.fillRect(x, y, rng.range(0.5, 2), rng.range(0.5, 2));
    }
    // Plataforma.
    ctx.save();
    ctx.translate(w / 2, h / 2);
    const pg = ctx.createRadialGradient(0, 0, 80, 0, 0, 720);
    pg.addColorStop(0, '#3a3f55');
    pg.addColorStop(0.6, '#252a40');
    pg.addColorStop(0.85, '#181c2e');
    pg.addColorStop(1, 'rgba(8,11,24,0)');
    ctx.fillStyle = pg;
    ctx.beginPath(); ctx.ellipse(0, 0, 860, 640, 0, 0, TAU); ctx.fill();
    // Anillos.
    for (let i = 0; i < 5; i++) {
      ctx.strokeStyle = hexToRgba(i % 2 ? pal.gold : '#9fe3ff', 0.16);
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.ellipse(0, 0, 260 + i * 100, 180 + i * 70, 0, 0, TAU); ctx.stroke();
    }
    // Mosaico central.
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * TAU;
      ctx.strokeStyle = hexToRgba(pal.gold, 0.2); ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(Math.cos(a) * 60, Math.sin(a) * 45); ctx.lineTo(Math.cos(a) * 240, Math.sin(a) * 170); ctx.stroke();
    }
    // Grietas doradas.
    for (let i = 0; i < 24; i++) {
      const a = rng.next() * TAU, d = rng.range(100, 500);
      const x = Math.cos(a) * d, y = Math.sin(a) * d * 0.72;
      ctx.strokeStyle = hexToRgba(pal.gold, rng.range(0.08, 0.25));
      ctx.lineWidth = rng.range(1, 2.5);
      ctx.beginPath(); ctx.moveTo(x, y);
      let px = x, py = y;
      for (let j = 0; j < 4; j++) { px += rng.range(-30, 30); py += rng.range(-20, 20); ctx.lineTo(px, py); }
      ctx.stroke();
    }
    ctx.restore();
    // Bruma.
    for (let i = 0; i < 120; i++) {
      const x = rng.range(0, w), y = rng.range(0, h);
      const r = rng.range(30, 140);
      const g = ctx.createRadialGradient(x, y, 1, x, y, r);
      g.addColorStop(0, hexToRgba(rng.chance(0.5) ? '#9fe3ff' : '#c9a6ff', rng.range(0.02, 0.08)));
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
    }
  }
}

export function createWorld(id, game) {
  return new World(id, game);
}

export function getSpawnersFor(id) {
  const def = BUILDERS[id] ? BUILDERS[id]() : buildVillage();
  return def.spawners || [];
}
