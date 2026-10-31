import { fbm, hash2, seededRandom, clamp } from '../core/utils.js';

export const TILE = 48;

export const TERRAIN = { GRASS: 0, DIRT: 1, STONE: 2, WATER: 3, LAVA: 4, ASH: 5, CELESTIAL: 6, CLIFF: 7, VOID: 8, BRIDGE: 9, MOSS: 10 };

export const REGION_META = {
  valdoria: {
    id: 'valdoria', name: 'VALDORIA', subtitle: 'Reino de los Prados de Lumen', music: 'valdoria',
    width: 112, height: 88, seed: 7719,
    palette: {
      key: '#4f7a4e', key2: '#3a5e42', grass: '#5b8a53', grass2: '#6d9a5f', moss: '#3f6b49',
      path: '#a58c62', path2: '#8c744f', water: '#3d7d8d', water2: '#2a5d72', cliff: '#5d5a55', stone: '#7d7a70',
      ambient: 'rgba(58,90,74,.10)', vignette: 'rgba(8,18,20,.55)', glow: '#e8c878', fog: 'rgba(150,190,180,.05)'
    },
    weather: 'leaves', fogDensity: .18
  },
  drakmor: {
    id: 'drakmor', name: 'DRAKMOR', subtitle: 'El reino que ardió dos veces', music: 'drakmor',
    width: 96, height: 80, seed: 2241,
    palette: {
      key: '#4a3632', key2: '#332524', grass: '#4a3f39', grass2: '#5a4a42', moss: '#3a302b',
      path: '#65544a', path2: '#4e4038', water: '#c94d2e', water2: '#7a2418', cliff: '#3d3230', stone: '#5a4d48',
      ambient: 'rgba(120,50,24,.12)', vignette: 'rgba(24,6,8,.62)', glow: '#ff8a48', fog: 'rgba(90,40,30,.08)'
    },
    weather: 'embers', fogDensity: .28
  },
  kansordore: {
    id: 'kansordore', name: 'KANSORDORE', subtitle: 'Los templos sobre el sueño del mundo', music: 'kansordore',
    width: 88, height: 76, seed: 9923,
    palette: {
      key: '#6c6a7c', key2: '#555466', grass: '#7d8270', grass2: '#949a84', moss: '#666d64',
      path: '#b0a98f', path2: '#958e76', water: '#7894b8', water2: '#4c618a', cliff: '#6a6674', stone: '#c0baa4',
      ambient: 'rgba(150,145,190,.10)', vignette: 'rgba(12,12,28,.52)', glow: '#f0e0a0', fog: 'rgba(200,200,230,.08)'
    },
    weather: 'motes', fogDensity: .34
  }
};

function idx(x, y, w) { return y * w + x; }

function distToSegment(px, py, x1, y1, x2, y2) {
  const dx = x2 - x1, dy = y2 - y1;
  const l2 = dx * dx + dy * dy;
  if (!l2) return Math.hypot(px - x1, py - y1);
  let t = ((px - x1) * dx + (py - y1) * dy) / l2;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy));
}

class RegionBuilder {
  constructor(meta) {
    this.meta = meta;
    this.w = meta.width; this.h = meta.height;
    this.tiles = new Uint8Array(this.w * this.h);
    this.solid = new Uint8Array(this.w * this.h);
    this.pathMask = new Uint8Array(this.w * this.h);
    this.propMask = new Uint8Array(this.w * this.h);
    this.rng = seededRandom(meta.seed);
    this.props = [];
    this.buildings = [];
    this.npcs = [];
    this.spawners = [];
    this.pickups = [];
    this.interactables = [];
    this.triggers = [];
    this.shrines = [];
    this.decor = [];
    this.clearings = [];
    this.tileDecor = [];
  }
  inBounds(x, y) { return x >= 0 && y >= 0 && x < this.w && y < this.h; }
  get(x, y) { return this.inBounds(x, y) ? this.tiles[idx(x, y, this.w)] : TERRAIN.CLIFF; }
  set(x, y, t, solid = null) {
    if (!this.inBounds(x, y)) return;
    this.tiles[idx(x, y, this.w)] = t;
    if (solid !== null) this.solid[idx(x, y, this.w)] = solid ? 1 : 0;
    else this.solid[idx(x, y, this.w)] = (t === TERRAIN.WATER || t === TERRAIN.LAVA || t === TERRAIN.CLIFF || t === TERRAIN.VOID) ? 1 : 0;
  }
  isSolidTile(x, y) { return this.inBounds(x, y) ? this.tiles[idx(x, y, this.w)] : TERRAIN.CLIFF; }
  isSolid(x, y) { return this.inBounds(x, y) ? this.solid[idx(x, y, this.w)] : 1; }
  addClearing(x, y, r) { this.clearings.push({ x, y, r }); }
  nearClearing(x, y, pad = 0) {
    for (const c of this.clearings) if (Math.hypot(x - c.x, y - c.y) < c.r + pad) return true;
    return false;
  }
  nearPath(x, y, pad = 2) {
    for (let yy = Math.floor(y - pad); yy <= y + pad; yy++) for (let xx = Math.floor(x - pad); xx <= x + pad; xx++) {
      if (this.inBounds(xx, yy) && this.pathMask[idx(xx, yy, this.w)]) return true;
    }
    return false;
  }
  carvePath(x1, y1, x2, y2, width = 2) {
    const steps = Math.ceil(Math.hypot(x2 - x1, y2 - y1) * 2);
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const cx = x1 + (x2 - x1) * t, cy = y1 + (y2 - y1) * t;
      for (let dy = -width; dy <= width; dy++) for (let dx = -width; dx <= width; dx++) {
        if (dx * dx + dy * dy > width * width + .4) continue;
        const x = Math.round(cx + dx), y = Math.round(cy + dy);
        if (!this.inBounds(x, y)) continue;
        const i2 = idx(x, y, this.w);
        this.pathMask[i2] = 1;
        const cur = this.tiles[i2];
        if (cur === TERRAIN.WATER) this.set(x, y, TERRAIN.BRIDGE, false);
        else if (cur === TERRAIN.LAVA) this.set(x, y, TERRAIN.BRIDGE, false);
        else if (cur !== TERRAIN.CLIFF && cur !== TERRAIN.VOID) this.set(x, y, TERRAIN.DIRT, false);
      }
    }
  }
  addProp(type, x, y, opts = {}) {
    const p = { type, x: x * TILE, y: y * TILE, tx: x, ty: y, seed: this.rng(), ...opts };
    this.props.push(p);
    if (opts.collide) {
      const r = opts.collide === true ? .5 : opts.collide;
      this.addCollider(x, y, r);
    }
    return p;
  }
  addCollider(tx, ty, r) {
    const key = `${Math.floor(tx)},${Math.floor(ty)}`;
    (this.colliderGrid ||= new Map());
    const arr = this.colliderGrid.get(key) || [];
    arr.push({ x: tx * TILE, y: ty * TILE, r: r * TILE });
    this.colliderGrid.set(key, arr);
  }
  addBuilding(b) {
    this.buildings.push({ ...b, x: b.x * TILE, y: b.y * TILE, w: b.w * TILE, h: b.h * TILE, tx: b.x, ty: b.y, tw: b.w, th: b.h });
    this.addClearing(b.x + b.w / 2, b.y + b.h / 2, Math.max(b.w, b.h) * .7);
    // block tiles under building, leave the front row walkable
    for (let yy = b.y; yy < b.y + b.h; yy++) for (let xx = b.x; xx < b.x + b.w; xx++) {
      if (this.inBounds(xx, yy)) { this.propMask[idx(xx, yy, this.w)] = 1; }
    }
    this.addCollider(b.x + b.w / 2, b.y + b.h * .55, 0);
    this.buildings[this.buildings.length - 1].collider = {
      x: b.x * TILE + TILE * .25, y: b.y * TILE + TILE * .42, w: b.w * TILE - TILE * .5, h: b.h * TILE - TILE * .2
    };
  }
  addNPC(id, x, y, opts = {}) {
    this.npcs.push({ id, x: x * TILE, y: y * TILE, anchorX: x * TILE, anchorY: y * TILE, facing: 'down', ...opts });
  }
  addSpawner(id, type, x, y, count = 3, radius = 5, respawn = 75) {
    this.spawners.push({ id, type, x: x * TILE, y: y * TILE, tx: x, ty: y, count, radius: radius * TILE, respawn });
  }
  addPickup(id, item, x, y, qty = 1, kind = 'item') {
    this.pickups.push({ id, item, x: x * TILE, y: y * TILE, qty, kind, bob: this.rng() * 6.28 });
  }
  addInteractable(type, x, y, data = {}) {
    this.interactables.push({ type, x: x * TILE, y: y * TILE, ...data });
  }
  addTrigger(id, x, y, r, data = {}) {
    this.triggers.push({ id, x: x * TILE, y: y * TILE, r: r * TILE, ...data });
  }
  addShrine(id, name, x, y, discovered = false) {
    const s = { id, name, x: x * TILE, y: y * TILE, discovered };
    this.shrines.push(s);
    this.addClearing(x, y, 4);
    return s;
  }
}

function buildValdoria() {
  const b = new RegionBuilder(REGION_META.valdoria);
  const { w, h } = b;
  // Base terrain: meadows, mossy forest and stone outcrops
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const forest = fbm(x * .055, y * .055, 12, 4);
    const detail = fbm(x * .17, y * .17, 33, 3);
    let t = TERRAIN.GRASS;
    if (forest > .53 && detail > .42) t = TERRAIN.MOSS;
    if (detail > .74 && forest > .58) t = TERRAIN.STONE;
    if (x < 3 || y < 3 || x >= w - 3 || y >= h - 3) t = TERRAIN.CLIFF;
    // The river Lumen
    const rc = 83 + Math.sin(y * .085) * 4.2 + Math.sin(y * .027 + 1.3) * 5.5;
    if (Math.abs(x - rc) < 2.1 && x > 3 && x < w - 3 && y > 3 && y < h - 3) t = TERRAIN.WATER;
    b.set(x, y, t);
  }
  // Clearings
  b.addClearing(45, 45, 11); b.addClearing(22, 60, 5); b.addClearing(14, 22, 5);
  b.addClearing(61, 32, 4); b.addClearing(28, 70, 5); b.addClearing(40, 78, 10);
  b.addClearing(96, 30, 8); b.addClearing(83, 34, 5);
  // Roads
  b.carvePath(22, 60, 31, 56, 2); b.carvePath(31, 56, 45, 53, 2);
  b.carvePath(45, 45, 38, 37, 2); b.carvePath(38, 37, 26, 30, 2); b.carvePath(26, 30, 14, 22, 2);
  b.carvePath(45, 45, 53, 38, 2); b.carvePath(53, 38, 61, 32, 2);
  b.carvePath(45, 45, 44, 57, 2); b.carvePath(44, 57, 34, 65, 2); b.carvePath(34, 65, 28, 70, 2);
  b.carvePath(28, 70, 36, 77, 2); b.carvePath(36, 77, 40, 78, 2);
  b.carvePath(45, 45, 56, 39, 2); b.carvePath(56, 39, 69, 35, 2); b.carvePath(69, 35, 83, 34, 3); b.carvePath(83, 34, 96, 30, 2);
  b.carvePath(45, 45, 54, 51, 2);
  // Bridge wideners
  for (let y = 31; y <= 37; y++) for (let x = 80; x <= 86; x++) if (b.get(x, y) === TERRAIN.WATER) b.set(x, y, TERRAIN.BRIDGE, false);

  // Buildings
  const houses = [
    { x: 42, y: 38, w: 5, h: 4, type: 'library', palette: '#6a5a48', roof: '#7a3f38', name: 'Archivo de Lumen' },
    { x: 51, y: 41, w: 4, h: 3, type: 'smith', palette: '#5a4a3c', roof: '#4a3d36', name: 'Forja' },
    { x: 36, y: 40, w: 4, h: 3, type: 'herb', palette: '#8a8168', roof: '#4d6448', name: 'Herbolario' },
    { x: 43, y: 50, w: 4, h: 3, type: 'bakery', palette: '#b09572', roof: '#8a5a42', name: 'Horno' },
    { x: 33, y: 46, w: 4, h: 3, type: 'house', palette: '#8a7058', roof: '#5f4a3e', name: 'Casa' },
    { x: 52, y: 48, w: 4, h: 3, type: 'house', palette: '#9a8068', roof: '#4e5666', name: 'Casa' },
    { x: 57, y: 43, w: 4, h: 3, type: 'house', palette: '#7a6a5a', roof: '#6a3f3a', name: 'Casa' },
  ];
  houses.forEach((hb) => b.addBuilding(hb));
  b.addClearing(46, 47, 4);

  // Shrines and stones
  b.addShrine('shrine_start', 'Santuario de Lumen', 22, 60);
  b.addShrine('shrine_forest', 'Altar del Bosque', 38, 72);
  b.addShrine('shrine_ruins', 'Santuario de las Ruinas', 95, 34);
  b.addInteractable('stone', 14, 22, { id: 'stone_lumen', name: 'Piedra de Lumen', order: 0, glow: '#9fe8c0' });
  b.addInteractable('stone', 61, 32, { id: 'stone_alba', name: 'Piedra del Alba', order: 1, glow: '#ffe0a0' });
  b.addInteractable('stone', 28, 70, { id: 'stone_rio', name: 'Piedra del Río', order: 2, glow: '#9fc8ff' });
  b.addTrigger('village_plaza', 46, 47, 3);
  b.addTrigger('guardian_arena', 40, 78, 8, { boss: 'guardian_espectral' });
  b.addTrigger('ruinas_martillo', 96, 31, 2.2, { event: 'martillo' });
  b.addInteractable('well', 46, 47);
  b.addInteractable('sign', 48, 53, { text: 'LUMEN · Plaza Mayor\nNorte: Bosque de Lumen' });

  // NPCs
  b.addNPC('nara', 45, 44, { facing: 'down', idle: true });
  b.addNPC('borin', 52, 45, { facing: 'down' });
  b.addNPC('elara', 38, 44, { facing: 'down' });
  b.addNPC('mira', 45, 54, { facing: 'up' });
  b.addNPC('tomo', 50, 54, { facing: 'up' });
  b.addNPC('ren', 48, 42, { facing: 'down' });
  b.addNPC('sibil', 23, 56, { facing: 'down', hidden: false });

  // Enemies
  b.addSpawner('v_wolves1', 'lobo_ceniza', 29, 56, 3, 5);
  b.addSpawner('v_wolves2', 'lobo_ceniza', 17, 52, 3, 5);
  b.addSpawner('v_wolves3', 'lobo_ceniza', 55, 59, 2, 4);
  b.addSpawner('v_wolves4', 'lobo_ceniza', 35, 72, 2, 4);
  b.addSpawner('v_wisp1', 'espectro_lumen', 52, 58, 3, 4);
  b.addSpawner('v_wisp2', 'espectro_lumen', 24, 68, 2, 4);
  b.addSpawner('v_bandit1', 'bandido', 66, 37, 2, 4);
  b.addSpawner('v_bandit2', 'bandido', 89, 34, 2, 4);
  b.addSpawner('v_golem1', 'golem_runico', 98, 37, 2, 4);
  b.addSpawner('v_ondina1', 'ondina_corrupta', 70, 18, 2, 4);
  b.addSpawner('v_musgo1', 'espiritu_musgo', 31, 79, 2, 5);

  // Pickups
  [['flor_lumen', 17, 57], ['flor_lumen', 24, 67], ['flor_lumen', 52, 61], ['flor_lumen', 10, 38], ['flor_lumen', 33, 68],
   ['ascuas', 87, 60], ['esencia', 44, 24], ['pocion_menor', 58, 62], ['flor_lumen', 8, 26], ['flor_lumen', 67, 63]].forEach(([it, x, y], i) => b.addPickup('val_pick_' + i, it, x, y));
  b.addPickup('val_chest_1', 'capa_guardian', 93, 27, 1, 'chest');
  b.addPickup('val_chest_2', 'pocion_mayor', 33, 80, 2, 'chest');
  b.addPickup('val_martillo', 'martillo_borin', 96, 31, 1, 'quest');

  // Props: trees
  const rng = b.rng;
  const isClear = (x, y, pad = 0) => b.nearClearing(x, y, pad) || b.nearPath(x, y, 1) || b.isSolid(x, y) || b.propMask[idx(x, y, b.w)];
  for (let i = 0; i < 520; i++) {
    const x = 4 + rng() * (w - 8), y = 4 + rng() * (h - 8);
    if (isClear(x, y, 1)) continue;
    const forest = fbm(x * .055, y * .055, 12, 4);
    if (forest < .38 && rng() < .7) continue;
    const tx = Math.floor(x), ty = Math.floor(y);
    b.propMask[idx(tx, ty, b.w)] = 1;
    b.addProp(rng() < .28 ? 'pine' : 'tree', tx + .5, ty + .5, { collide: .48, scale: .8 + rng() * .55, seed: rng() });
  }
  for (let i = 0; i < 150; i++) {
    const x = 4 + rng() * (w - 8), y = 4 + rng() * (h - 8);
    if (isClear(x, y, 0)) continue;
    b.addProp(rng() < .5 ? 'bush' : 'rock', Math.floor(x), Math.floor(y), { collide: rng() < .45 ? .38 : 0, scale: .7 + rng() * .5, seed: rng() });
  }
  for (let i = 0; i < 130; i++) {
    const x = 4 + rng() * (w - 8), y = 4 + rng() * (h - 8);
    if (b.isSolid(x, y) || b.nearPath(x, y, 0)) continue;
    b.addProp('flower', Math.floor(x), Math.floor(y), { seed: rng(), color: rng() < .5 ? '#f2e6a0' : rng() < .5 ? '#c8a0e8' : '#f0a0a0' });
  }
  // Ruins
  for (const [x, y] of [[92, 26], [93, 33], [99, 27], [99, 34], [90, 35], [101, 30]]) {
    b.addProp('column', x, y, { collide: .6, scale: .9 + rng() * .4, seed: rng() });
  }
  b.addProp('ruin_altar', 96, 30, { collide: .7, scale: 1, seed: rng() });
  b.addProp('arch', 96, 25, { collide: .8, scale: 1.05, seed: rng() });
  // Village props
  for (const [x, y] of [[40, 49], [55, 47], [42, 55], [58, 43], [31, 51], [57, 51]]) b.addProp('barrel', x, y, { collide: .3, seed: rng() });
  for (const [x, y] of [[33, 54], [56, 55], [43, 37], [53, 44], [61, 47]]) b.addProp('lamp', x, y, { collide: .25, scale: 1, seed: rng() });
  for (const [x, y] of [[41, 43], [48, 49], [34, 43], [52, 54], [59, 46], [37, 52]]) b.addProp('fence', x, y, { collide: .3, seed: rng() });
  // Boss arena ring
  for (let a = 0; a < 10; a++) {
    const ang = a / 10 * Math.PI * 2;
    b.addProp('standing_stone', 40 + Math.cos(ang) * 7.3, 78 + Math.sin(ang) * 6.2, { collide: .55, seed: rng(), scale: .9 + rng() * .3 });
  }
  b.addProp('banner', 47, 52, { collide: .2, seed: rng() });
  b.addProp('banner', 44, 41, { collide: .2, seed: rng() });

  const region = finalize(b, REGION_META.valdoria);
  region.startSpawn = { x: 24 * TILE, y: 61 * TILE, facing: 'up' };
  return region;
}

function buildDrakmor() {
  const b = new RegionBuilder(REGION_META.drakmor);
  const { w, h } = b;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const n = fbm(x * .06, y * .06, 71, 4);
    const d = fbm(x * .18, y * .18, 29, 3);
    let t = TERRAIN.ASH;
    if (n > .54 && d > .52) t = TERRAIN.STONE;
    if (x < 3 || y < 3 || x >= w - 3 || y >= h - 3) t = TERRAIN.CLIFF;
    const lava = 52 + Math.sin(y * .09 + .4) * 5 + y * .36;
    if (Math.abs(x - lava) < 1.8 && y > 4 && y < h - 4) t = TERRAIN.LAVA;
    // Lava lake near the forge
    if ((x - 46) ** 2 / 90 + (y - 17) ** 2 / 25 < 1) t = TERRAIN.LAVA;
    b.set(x, y, t);
  }
  b.addClearing(24, 57, 10); b.addClearing(46, 19, 6); b.addClearing(67, 28, 11);
  b.addClearing(27, 29, 5); b.addClearing(30, 62, 5); b.addClearing(58, 44, 5);
  // Paths
  b.carvePath(24, 62, 25, 48, 2); b.carvePath(25, 48, 26, 30, 2);
  b.carvePath(24, 57, 35, 52, 2); b.carvePath(35, 52, 47, 40, 2); b.carvePath(47, 40, 48, 22, 2);
  b.carvePath(24, 57, 40, 57, 2); b.carvePath(40, 57, 55, 47, 2); b.carvePath(55, 47, 67, 39, 2); b.carvePath(67, 39, 67, 31, 2);
  b.carvePath(24, 57, 48, 62, 2); b.carvePath(48, 62, 58, 44, 2);
  b.carvePath(26, 30, 16, 24, 2);
  // Bridge widen
  for (let y = 50; y <= 70; y++) for (let x = 53; x <= 60; x++) if (b.get(x, y) === TERRAIN.LAVA) b.set(x, y, TERRAIN.BRIDGE, false);
  for (let y = 37; y <= 43; y++) for (let x = 45; x <= 52; x++) if (b.get(x, y) === TERRAIN.LAVA) b.set(x, y, TERRAIN.BRIDGE, false);

  // Brasa Rota buildings
  [
    { x: 20, y: 51, w: 4, h: 3, type: 'ruin_house', palette: '#5a4038', roof: '#3a2a2a', name: 'Casa' },
    { x: 26, y: 51, w: 4, h: 3, type: 'ruin_house', palette: '#4a3833', roof: '#2d2526', name: 'Casa' },
    { x: 20, y: 59, w: 4, h: 3, type: 'house', palette: '#6a4a3a', roof: '#7a3a2a', name: 'Taberna' },
    { x: 27, y: 60, w: 4, h: 3, type: 'forge', palette: '#4a3430', roof: '#332624', name: 'Fundición' },
    { x: 14, y: 55, w: 3, h: 3, type: 'ruin_house', palette: '#453733', roof: '#2b2224', name: 'Ruina' },
  ].forEach((hb) => b.addBuilding(hb));
  // Fortress
  b.addBuilding({ x: 60, y: 22, w: 13, h: 5, type: 'fortress', palette: '#3f3738', roof: '#2b2428', name: 'Fortaleza Cenicienta' });
  b.addBuilding({ x: 58, y: 27, w: 4, h: 5, type: 'fortress_tower', palette: '#3f3738', roof: '#2b2428', name: 'Torre' });
  b.addBuilding({ x: 72, y: 27, w: 4, h: 5, type: 'fortress_tower', palette: '#3f3738', roof: '#2b2428', name: 'Torre' });
  b.addBuilding({ x: 42, y: 15, w: 6, h: 4, type: 'volcano_forge', palette: '#3a2c2a', roof: '#241c1c', name: 'Forja de los Reyes' });

  b.addShrine('shrine_brasa', 'Fogata de Brasa Rota', 24, 63);
  b.addShrine('shrine_forja', 'Altar de la Forja', 49, 23);
  b.addShrine('shrine_fortress', 'Santuario Ceniciento', 67, 40);
  b.addInteractable('well', 24, 59, { lava: true });
  b.addTrigger('forja_ceniza', 46, 24, 4, { poi: true });
  b.addTrigger('fortress_arena', 67, 31, 6, { boss: 'malachar' });
  b.addTrigger('mina', 27, 31, 3, { poi: true });
  b.addTrigger('ruinas_martillo', 27, 33, 2, { event: 'martillo' });
  b.addInteractable('sign', 32, 59, { text: 'BRASA ROTA\nNorte: Forja de los Reyes\nEste: Fortaleza Cenicienta' });

  b.addNPC('rhea', 26, 57, { facing: 'down' });
  b.addNPC('lyra', 30, 59, { facing: 'left' });
  b.addNPC('ash', 27, 52, { facing: 'down' });

  b.addSpawner('d_sala1', 'salamandra_forja', 36, 45, 3, 5);
  b.addSpawner('d_sala2', 'salamandra_forja', 55, 43, 2, 4);
  b.addSpawner('d_cult1', 'cultista_ceniza', 41, 55, 2, 4);
  b.addSpawner('d_cult2', 'cultista_ceniza', 58, 34, 2, 4);
  b.addSpawner('d_demon1', 'demonio_forja', 33, 34, 2, 4);
  b.addSpawner('d_demon2', 'demonio_forja', 53, 20, 2, 4);
  b.addSpawner('d_obs1', 'obsidiana_viva', 70, 47, 2, 4);
  b.addSpawner('d_obs2', 'obsidiana_viva', 44, 67, 2, 4);
  b.addSpawner('d_sombra1', 'sombra_velo', 18, 36, 2, 4);

  [['ascuas', 38, 49], ['ascuas', 47, 33], ['ascuas', 60, 48], ['ascuas', 70, 50], ['ascuas', 34, 36], ['ascuas', 47, 21],
   ['pocion_mayor', 43, 22], ['esencia', 62, 44], ['colmillo', 51, 58], ['ascuas', 20, 44]].forEach(([it, x, y], i) => b.addPickup('dra_pick_' + i, it, x, y));
  b.addPickup('dra_chest_1', 'corona_velo', 50, 25, 1, 'chest');
  b.addPickup('dra_chest_2', 'pocion_mayor', 73, 46, 2, 'chest');

  const rng = b.rng;
  for (let i = 0; i < 280; i++) {
    const x = 4 + rng() * (w - 8), y = 4 + rng() * (h - 8);
    if (b.nearPath(x, y, 1) || b.nearClearing(x, y, 0) || b.isSolid(x, y) || b.propMask[idx(Math.floor(x), Math.floor(y), w)]) continue;
    const tx = Math.floor(x), ty = Math.floor(y);
    b.propMask[idx(tx, ty, w)] = 1;
    b.addProp(rng() < .55 ? 'dead_tree' : 'basalt', tx + .5, ty + .5, { collide: .45, scale: .8 + rng() * .6, seed: rng() });
  }
  for (let i = 0; i < 120; i++) {
    const x = 4 + rng() * (w - 8), y = 4 + rng() * (h - 8);
    if (b.isSolid(x, y) || b.nearPath(x, y, 1)) continue;
    b.addProp('lava_rock', Math.floor(x), Math.floor(y), { collide: rng() < .5 ? .38 : 0, scale: .7 + rng() * .6, seed: rng() });
  }
  for (let i = 0; i < 90; i++) {
    const x = 4 + rng() * (w - 8), y = 4 + rng() * (h - 8);
    if (b.isSolid(x, y)) continue;
    b.addProp('ember_vent', Math.floor(x), Math.floor(y), { seed: rng(), scale: .7 + rng() * .5 });
  }
  for (let i = 0; i < 40; i++) {
    const x = 4 + rng() * (w - 8), y = 4 + rng() * (h - 8);
    if (b.isSolid(x, y) || b.nearPath(x, y, 0)) continue;
    b.addProp('bone', Math.floor(x), Math.floor(y), { seed: rng(), scale: .7 + rng() * .5 });
  }
  // Fortress walls / braziers
  for (let x = 57; x <= 76; x += 3) b.addProp('brazier', x, 42.2, { collide: .2, seed: rng() });
  for (const [x, y] of [[57, 44], [58, 44], [76, 44], [77, 44], [57, 30], [77, 30]]) b.addProp('rubble', x, y, { collide: .5, seed: rng() });
  b.addProp('banner_dark', 60, 33, { collide: .2, seed: rng() });
  b.addProp('banner_dark', 73, 33, { collide: .2, seed: rng() });
  for (const [x, y] of [[45, 18], [48, 18], [44, 21], [48, 15]]) b.addProp('chain', x, y, { collide: 0, seed: rng(), scale: 1 });
  b.addProp('skull_pile', 67, 33, { collide: .4, seed: rng() });

  const region = finalize(b, REGION_META.drakmor);
  region.startSpawn = { x: 25 * TILE, y: 66 * TILE, facing: 'up' };
  return region;
}

function buildKansordore() {
  const b = new RegionBuilder(REGION_META.kansordore);
  const { w, h } = b;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const n = fbm(x * .055, y * .055, 41, 4);
    const d = fbm(x * .16, y * .16, 87, 3);
    let t = TERRAIN.CELESTIAL;
    if (n > .52) t = TERRAIN.STONE;
    if (d > .66 && n > .55) t = TERRAIN.MOSS;
    const edge = Math.min(x, y, w - 1 - x, h - 1 - y);
    if (edge < 3) t = TERRAIN.VOID;
    else if (edge < 5 && fbm(x * .2, y * .2, 5, 2) > .45) t = TERRAIN.VOID;
    // chasm running north-south near the archive
    if (x > 60 && x < 65 && y > 10 && y < 68 && fbm(y * .15, 1, 9, 2) > .3) t = TERRAIN.VOID;
    // solid central island edges
    b.set(x, y, t);
  }
  b.addClearing(30, 52, 12); b.addClearing(44, 16, 12); b.addClearing(18, 38, 5);
  b.addClearing(46, 32, 5); b.addClearing(58, 50, 6); b.addClearing(30, 62, 5);
  // Paths
  b.carvePath(30, 64, 30, 58, 2); b.carvePath(30, 58, 30, 44, 2); b.carvePath(30, 44, 24, 38, 2);
  b.carvePath(30, 44, 38, 38, 2); b.carvePath(38, 38, 46, 32, 2);
  b.carvePath(30, 44, 44, 28, 2); b.carvePath(44, 28, 44, 16, 2);
  b.carvePath(30, 58, 42, 56, 2); b.carvePath(42, 56, 58, 50, 2); b.carvePath(58, 50, 44, 38, 2);
  b.carvePath(58, 50, 66, 52, 2);
  // Bridge over chasm
  for (let y = 41; y <= 48; y++) for (let x = 59; x <= 66; x++) if (b.get(x, y) === TERRAIN.VOID) b.set(x, y, TERRAIN.BRIDGE, false);
  for (let y = 48; y <= 54; y++) for (let x = 59; x <= 66; x++) if (b.get(x, y) === TERRAIN.VOID) b.set(x, y, TERRAIN.BRIDGE, false);

  // Archivo
  b.addBuilding({ x: 24, y: 46, w: 12, h: 8, type: 'archive', palette: '#c8c2ac', roof: '#8a846e', name: 'Archivo del Velo' });
  b.addBuilding({ x: 18, y: 33, w: 4, h: 4, type: 'temple_tower', palette: '#b8b29c', roof: '#847e68', name: 'Torre' });
  b.addBuilding({ x: 42, y: 12, w: 8, h: 6, type: 'summit', palette: '#d0cab4', roof: '#a49e88', name: 'Cumbre del Coro' });
  b.addBuilding({ x: 54, y: 48, w: 5, h: 4, type: 'camp', palette: '#8a8472', roof: '#5a5448', name: 'Campamento' });
  b.addBuilding({ x: 13, y: 41, w: 4, h: 3, type: 'temple_tower', palette: '#b8b29c', roof: '#847e68', name: 'Ruina' });

  b.addShrine('shrine_archivo', 'Santuario del Archivo', 30, 58);
  b.addShrine('shrine_cumbre', 'Altar de la Cumbre', 44, 22);
  b.addShrine('shrine_camp', 'Fogata del Campamento', 58, 53);
  b.addTrigger('archivo', 30, 55, 4, { poi: true });
  b.addTrigger('eco_uno', 18, 38, 2.5, { eco: true });
  b.addTrigger('eco_dos', 46, 32, 2.5, { eco: true });
  b.addTrigger('eco_tres', 58, 50, 2.5, { eco: true });
  b.addTrigger('cumbre', 44, 19, 4, { poi: true });
  b.addTrigger('summit_arena', 44, 17, 6, { boss: 'coro_absoluto' });
  b.addInteractable('sign', 33, 59, { text: 'ARCHIVO DEL VELO\n"Lo que se olvida, aún canta."' });
  b.addInteractable('astrolabe', 34, 51, { glow: '#ffe6a0' });

  b.addNPC('veyra', 31, 54, { facing: 'down' });
  b.addNPC('sel', 27, 54, { facing: 'down' });
  b.addNPC('kael_camp', 57, 54, { facing: 'down', hidden: true });

  b.addSpawner('k_cent1', 'centinela_celeste', 38, 47, 2, 5);
  b.addSpawner('k_cent2', 'centinela_celeste', 50, 40, 2, 5);
  b.addSpawner('k_cent3', 'centinela_celeste', 24, 26, 2, 4);
  b.addSpawner('k_ser1', 'serafin_menor', 58, 38, 3, 5);
  b.addSpawner('k_ser2', 'serafin_menor', 63, 30, 2, 4);
  b.addSpawner('k_sombra1', 'sombra_velo', 66, 55, 3, 5);
  b.addSpawner('k_sombra2', 'sombra_velo', 16, 50, 2, 4);
  b.addSpawner('k_obs1', 'obsidiana_viva', 52, 62, 2, 4);

  [['eco', 18, 40], ['eco', 46, 33], ['eco', 57, 48], ['eco', 64, 44], ['pocion_mayor', 28, 60], ['esencia', 40, 23],
   ['eco', 48, 20], ['eco', 21, 44], ['esencia', 56, 32]].forEach(([it, x, y], i) => b.addPickup('kan_pick_' + i, it, x, y));
  b.addPickup('kan_chest_1', 'placa_celestial', 68, 57, 1, 'chest');
  b.addPickup('kan_chest_2', 'elixir', 50, 25, 1, 'chest');
  b.addPickup('kan_chest_3', 'capa_aurora', 44, 13, 1, 'chest');

  const rng = b.rng;
  for (let i = 0; i < 180; i++) {
    const x = 4 + rng() * (w - 8), y = 4 + rng() * (h - 8);
    if (b.nearPath(x, y, 1) || b.nearClearing(x, y, 0) || b.isSolid(x, y) || b.propMask[idx(Math.floor(x), Math.floor(y), w)]) continue;
    const tx = Math.floor(x), ty = Math.floor(y);
    b.propMask[idx(tx, ty, w)] = 1;
    b.addProp(rng() < .6 ? 'silver_tree' : 'crystal', tx + .5, ty + .5, { collide: .42, scale: .75 + rng() * .65, seed: rng() });
  }
  for (let i = 0; i < 120; i++) {
    const x = 4 + rng() * (w - 8), y = 4 + rng() * (h - 8);
    if (b.isSolid(x, y) || b.nearPath(x, y, 0)) continue;
    b.addProp(rng() < .5 ? 'crystal_small' : 'marble_rock', Math.floor(x), Math.floor(y), { collide: rng() < .3 ? .3 : 0, scale: .6 + rng() * .6, seed: rng() });
  }
  for (let i = 0; i < 80; i++) {
    const x = 4 + rng() * (w - 8), y = 4 + rng() * (h - 8);
    if (b.isSolid(x, y) || b.nearPath(x, y, 0)) continue;
    b.addProp('star_flower', Math.floor(x), Math.floor(y), { seed: rng(), color: rng() < .5 ? '#ffe8a0' : '#c8c0ff' });
  }
  for (const [x, y] of [[36, 44], [36, 57], [23, 59], [44, 52], [26, 44], [32, 63]]) b.addProp('pillar', x, y, { collide: .55, scale: 1 + rng() * .3, seed: rng() });
  for (const [x, y] of [[30, 56], [46, 25], [18, 42], [58, 48]]) b.addProp('floating_rune', x, y, { collide: 0, seed: rng(), scale: 1 });
  for (const [x, y] of [[40, 19], [49, 19], [40, 14], [49, 14]]) b.addProp('celestial_pillar', x, y, { collide: .6, scale: 1.1, seed: rng() });
  b.addProp('throne', 44, 14.2, { collide: .8, seed: rng() });

  const region = finalize(b, REGION_META.kansordore);
  region.startSpawn = { x: 30 * TILE, y: 62 * TILE, facing: 'up' };
  return region;
}

function finalize(b, meta) {
  // Add building colliders to collider grid
  for (const bd of b.buildings) {
    if (!bd.collider) continue;
    const c = bd.collider;
    const tx = Math.floor((c.x + c.w / 2) / TILE), ty = Math.floor((c.y + c.h / 2) / TILE);
    const key = `${tx},${ty}`;
    const arr = b.colliderGrid.get(key) || [];
    arr.push({ x: c.x, y: c.y, r: 0, rect: { x: c.x, y: c.y, w: c.w, h: c.h } });
    b.colliderGrid.set(key, arr);
  }
  return {
    ...meta,
    tiles: b.tiles, solid: b.solid, pathMask: b.pathMask,
    props: b.props, buildings: b.buildings, npcs: b.npcs, spawners: b.spawners,
    pickups: b.pickups, interactables: b.interactables, triggers: b.triggers, shrines: b.shrines,
    colliderGrid: b.colliderGrid || new Map(),
    widthPx: b.w * TILE, heightPx: b.h * TILE,
    tileW: b.w, tileH: b.h
  };
}

const cache = {};
export function getRegion(id) {
  if (!cache[id]) {
    if (id === 'valdoria') cache[id] = buildValdoria();
    else if (id === 'drakmor') cache[id] = buildDrakmor();
    else if (id === 'kansordore') cache[id] = buildKansordore();
    else throw new Error('Región desconocida: ' + id);
  }
  return cache[id];
}

export function tileAt(region, px, py) {
  const x = Math.floor(px / TILE), y = Math.floor(py / TILE);
  if (x < 0 || y < 0 || x >= region.tileW || y >= region.tileH) return TERRAIN.CLIFF;
  return region.tiles[y * region.tileW + x];
}

export function tileSolidAt(region, px, py) {
  const x = Math.floor(px / TILE), y = Math.floor(py / TILE);
  if (x < 0 || y < 0 || x >= region.tileW || y >= region.tileH) return true;
  return !!region.solid[y * region.tileW + x];
}

export function collidersNear(region, x, y, r = 2) {
  const out = [];
  const cx = Math.floor(x / TILE), cy = Math.floor(y / TILE);
  for (let yy = cy - 2; yy <= cy + 2; yy++) for (let xx = cx - 2; xx <= cx + 2; xx++) {
    const arr = region.colliderGrid.get(`${xx},${yy}`);
    if (arr) out.push(...arr);
  }
  return out;
}

export function canStand(region, x, y, r = 13) {
  for (const [dx, dy] of [[-r, 0], [r, 0], [0, -r], [0, r], [0, 0]]) {
    if (tileSolidAt(region, x + dx, y + dy)) return false;
  }
  for (const c of collidersNear(region, x, y)) {
    if (c.rect) {
      const nx = clamp(x, c.rect.x, c.rect.x + c.rect.w), ny = clamp(y, c.rect.y, c.rect.y + c.rect.h);
      if ((x - nx) ** 2 + (y - ny) ** 2 < r * r) return false;
    } else if ((x - c.x) ** 2 + (y - c.y) ** 2 < (c.r + r * .75) ** 2) return false;
  }
  return true;
}

export function pointInWater(region, x, y) {
  const t = tileAt(region, x, y);
  return t === TERRAIN.WATER;
}
