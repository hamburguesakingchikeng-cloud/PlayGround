import { REGIONS } from '../data/regions.js';
import { clamp, dist, fbm, hash2, mulberry32, pick, randRange } from '../core/utils.js';

export const TILE = 32;
export const T = {
  GRASS: 0, PATH: 1, WATER: 2, FLOOR: 3, WALL: 4, LAVA: 5, BRIDGE: 6,
  FLOWER: 7, ASH: 8, TEMPLE: 9, VOID: 10, SAND: 11, CLIFF: 12,
  TALLGRASS: 13, MUD: 14, CRYSTAL: 15,
};
const SOLID_TILES = new Set([T.WATER, T.WALL, T.LAVA, T.VOID, T.CLIFF, T.CRYSTAL]);
const WALKABLE_BASE = {
  valdoria: T.GRASS, drakmor: T.ASH, kansordore: T.TEMPLE,
};

function idx(w, x, y) { return y * w + x; }
function inMap(w, h, x, y) { return x >= 0 && y >= 0 && x < w && y < h; }

export class World {
  constructor(def, seed, saved = {}) {
    this.def = def;
    this.id = def.id;
    this.width = def.width;
    this.height = def.height;
    this.tile = TILE;
    this.seed = seed;
    this.rng = mulberry32(seed);
    this.tiles = new Uint8Array(this.width * this.height);
    this.blocked = new Uint8Array(this.width * this.height);
    this.props = [];
    this.interactables = [];
    this.npcs = [];
    this.enemyZones = def.enemyZones || [];
    this.boss = def.boss || null;
    this.waypoints = def.waypoints || [];
    this.saved = saved;
    this.ambient = [];
    this._generate();
  }

  get pixelWidth() { return this.width * TILE; }
  get pixelHeight() { return this.height * TILE; }

  _generate() {
    const { width: w, height: h, def } = this;
    const rng = this.rng;
    const base = WALKABLE_BASE[def.id] ?? T.GRASS;
    this.tiles.fill(base);
    const seed = this.seed;

    // 1. Manchas de terreno.
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const n = fbm(x * 0.085, y * 0.085, seed, 4);
        const n2 = fbm(x * 0.2 + 31, y * 0.2 + 7, seed + 9, 3);
        if (def.id === 'valdoria') {
          if (n > 0.63) this.tiles[idx(w, x, y)] = T.TALLGRASS;
          else if (n < 0.3 && n2 > 0.45) this.tiles[idx(w, x, y)] = T.FLOWER;
        } else if (def.id === 'drakmor') {
          if (n > 0.67) this.tiles[idx(w, x, y)] = T.MUD;
          else if (n < 0.28) this.tiles[idx(w, x, y)] = T.ASH;
          else if (n2 > 0.78) this.tiles[idx(w, x, y)] = T.CRYSTAL;
        } else {
          if (n > 0.66) this.tiles[idx(w, x, y)] = T.VOID;
          else if (n < 0.3) this.tiles[idx(w, x, y)] = T.FLOOR;
          else if (n2 > 0.8) this.tiles[idx(w, x, y)] = T.CRYSTAL;
        }
      }
    }

    // 2. Río / lava / abismos.
    if (def.features?.river) this._carveRiver(def.features.river, T.WATER);
    if (def.features?.lava) this._carveRiver(def.features.lava, T.LAVA);
    if (def.features?.void) this._carveVoid();

    // 3. Claros de hitos.
    const landmarkTiles = {
      village: T.GRASS, shrine: T.FLOOR, ruins: T.FLOOR, arena: T.FLOOR,
      outpost: T.ASH, fortress: T.FLOOR, darkForest: T.ASH,
      temple: T.TEMPLE, library: T.FLOOR, final: T.TEMPLE,
      gate: T.PATH, spawn: base,
    };
    for (const [name, lm] of Object.entries(def.landmarks || {})) {
      this._clearCircle(lm.x, lm.y, lm.r + 1, landmarkTiles[name] ?? base);
    }

    // 4. Caminos.
    for (const [a, b] of def.paths || []) {
      const A = def.landmarks[a], B = def.landmarks[b];
      if (A && B) this._carvePath(A.x, A.y, B.x, B.y, 2.2);
    }

    // 5. Arenas de jefe.
    if (def.boss?.arena) {
      const ar = def.boss.arena;
      const from = def.landmarks.ruins || def.landmarks.fortress || def.landmarks.final || def.landmarks.library;
      const angle = from ? Math.atan2(from.y - ar.y, from.x - ar.x) : Math.PI;
      this._buildArena(ar, angle);
    }

    // 6. Propiedades del paisaje.
    this._scatterProps();
    this._buildVillageProps();
    this._buildSpecialProps();

    // 7. Colisiones de props.
    for (const p of this.props) this._markProp(p);

    // 8. Puntos interactivos y PNJ.
    this._placeInteractables();
    this._placeNpcs();

    // 9. Bordes.
    this._buildBorders();
    for (const p of this.props) if (!p._marked) this._markProp(p);
    this._ambient = this._makeAmbient();
  }

  _carveRiver(cfg, tile) {
    const { width: w, height: h } = this;
    for (let y = 0; y < h; y++) {
      const cx = Math.round(cfg.base + Math.sin(y / cfg.freq) * cfg.amp);
      for (let x = cx - Math.floor(cfg.width / 2); x <= cx + Math.floor(cfg.width / 2); x++) {
        if (inMap(w, h, x, y)) this.tiles[idx(w, x, y)] = tile;
      }
    }
  }

  _carveVoid() {
    const { width: w, height: h, seed } = this;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const n = fbm(x * 0.12 + 17, y * 0.12 + 3, seed + 77, 3);
        if (n > 0.63) this.tiles[idx(w, x, y)] = T.VOID;
      }
    }
  }

  _clearCircle(cx, cy, r, tile) {
    const { width: w, height: h } = this;
    for (let y = Math.floor(cy - r); y <= Math.ceil(cy + r); y++) {
      for (let x = Math.floor(cx - r); x <= Math.ceil(cx + r); x++) {
        if (!inMap(w, h, x, y)) continue;
        if (dist(x, y, cx, cy) <= r) this.tiles[idx(w, x, y)] = tile;
      }
    }
  }

  _carvePath(ax, ay, bx, by, halfWidth) {
    const { width: w, height: h } = this;
    const steps = Math.ceil(dist(ax, ay, bx, by) * 3);
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const cx = ax + (bx - ax) * t;
      const cy = ay + (by - ay) * t;
      for (let y = Math.floor(cy - halfWidth); y <= Math.ceil(cy + halfWidth); y++) {
        for (let x = Math.floor(cx - halfWidth); x <= Math.ceil(cx + halfWidth); x++) {
          if (!inMap(w, h, x, y)) continue;
          if (dist(x, y, cx, cy) > halfWidth + 0.2) continue;
          const cur = this.tiles[idx(w, x, y)];
          const bridge = cur === T.WATER || cur === T.LAVA || cur === T.VOID;
          this.tiles[idx(w, x, y)] = bridge ? T.BRIDGE : T.PATH;
        }
      }
    }
  }

  _buildArena(ar, entranceAngle) {
    const { width: w, height: h } = this;
    this._clearCircle(ar.x, ar.y, ar.r, T.FLOOR);
    for (let a = 0; a < Math.PI * 2; a += 0.035) {
      let d = Math.abs(((a - entranceAngle + Math.PI) % (Math.PI * 2)) - Math.PI);
      if (d < 0.5) continue;
      const x = Math.round(ar.x + Math.cos(a) * ar.r);
      const y = Math.round(ar.y + Math.sin(a) * ar.r);
      if (inMap(w, h, x, y)) this.tiles[idx(w, x, y)] = T.WALL;
    }
    // Columnas decorativas fuera del muro.
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      if (Math.abs(((a - entranceAngle + Math.PI) % (Math.PI * 2)) - Math.PI) < 0.55) continue;
      this.props.push({ type: 'pillar', x: (ar.x + Math.cos(a) * (ar.r + 1.2)) * TILE, y: (ar.y + Math.sin(a) * (ar.r + 1.2)) * TILE, scale: 1, seed: i, solid: 14 });
    }
  }

  _scatterProps() {
    const { width: w, height: h, def, rng } = this;
    const reserved = this._reservedAreas();
    const forest = def.features?.forest ?? 0.62;
    for (let y = 2; y < h - 2; y++) {
      for (let x = 2; x < w - 2; x++) {
        const t = this.tiles[idx(w, x, y)];
        if (t === T.PATH || t === T.WATER || t === T.LAVA || t === T.VOID || t === T.WALL || t === T.BRIDGE || t === T.FLOOR || t === T.TEMPLE || t === T.CRYSTAL) continue;
        if (this._nearReserved(x, y, reserved, 2.4)) continue;
        const n = fbm(x * 0.11 + 5, y * 0.11 + 9, this.seed + 44, 3);
        const r = hash2(x, y, this.seed + 3);
        if (def.id === 'valdoria') {
          if (n > forest && r < 0.38) {
            this.props.push({ type: r < 0.15 ? 'pine' : 'tree', x: (x + 0.5) * TILE, y: (y + 0.8) * TILE, scale: randRange(rng, 0.82, 1.28), seed: (x * 31 + y * 17) | 0, solid: 11, canopy: true });
          } else if (r > 0.88) this.props.push({ type: 'bush', x: (x + 0.5) * TILE, y: (y + 0.5) * TILE, scale: randRange(rng, 0.7, 1.2), seed: x + y });
          else if (r > 0.84) this.props.push({ type: 'smallrock', x: (x + 0.5) * TILE, y: (y + 0.5) * TILE, scale: randRange(rng, 0.6, 1.1), seed: x * 7 + y });
          else if (r < 0.08) this.props.push({ type: 'flower', x: (x + 0.5) * TILE, y: (y + 0.5) * TILE, scale: randRange(rng, 0.6, 1.1), seed: x + y * 3 });
        } else if (def.id === 'drakmor') {
          if (n > forest && r < 0.24) {
            this.props.push({ type: r < 0.5 ? 'deadtree' : 'obsidian', x: (x + 0.5) * TILE, y: (y + 0.75) * TILE, scale: randRange(rng, 0.8, 1.3), seed: (x * 17 + y * 29) | 0, solid: 12, canopy: r < 0.5 });
          } else if (r > 0.88) this.props.push({ type: 'lavaRock', x: (x + 0.5) * TILE, y: (y + 0.5) * TILE, scale: randRange(rng, 0.7, 1.3), seed: x * 5 + y });
          else if (r > 0.8) this.props.push({ type: 'bone', x: (x + 0.5) * TILE, y: (y + 0.5) * TILE, scale: randRange(rng, 0.6, 1.1), seed: x + y * 2 });
          else if (r < 0.05) this.props.push({ type: 'emberflower', x: (x + 0.5) * TILE, y: (y + 0.5) * TILE, scale: randRange(rng, 0.7, 1.1), seed: x + y });
        } else {
          if (n > forest && r < 0.2) {
            this.props.push({ type: r < 0.4 ? 'crystalSpire' : 'column', x: (x + 0.5) * TILE, y: (y + 0.7) * TILE, scale: randRange(rng, 0.8, 1.4), seed: (x * 13 + y * 23) | 0, solid: 13, canopy: r < 0.4 });
          } else if (r > 0.9) this.props.push({ type: 'floatingRock', x: (x + 0.5) * TILE, y: (y + 0.5) * TILE, scale: randRange(rng, 0.7, 1.2), seed: x + y * 4 });
          else if (r > 0.84) this.props.push({ type: 'moteStone', x: (x + 0.5) * TILE, y: (y + 0.5) * TILE, scale: randRange(rng, 0.6, 1), seed: x * 9 + y });
        }
      }
    }
  }

  _reservedAreas() {
    const list = [];
    for (const lm of Object.values(this.def.landmarks || {})) list.push({ x: lm.x, y: lm.y, r: lm.r + 2 });
    for (const h of this.def.houses || []) list.push({ x: h.x, y: h.y, r: Math.max(h.w, h.h) * 0.7 + 2 });
    for (const it of this.def.interactables || []) list.push({ x: it.x, y: it.y, r: 2.2 });
    for (const npc of this.def.npcs || []) list.push({ x: npc.x, y: npc.y, r: 1.6 });
    return list;
  }
  _nearReserved(x, y, list, pad) {
    for (const r of list) if (dist(x, y, r.x, r.y) < r.r + pad) return true;
    return false;
  }

  _buildVillageProps() {
    const def = this.def;
    for (const h of def.houses || []) {
      this.props.push({ type: h.type, x: h.x * TILE, y: h.y * TILE, w: h.w * TILE, h: h.h * TILE, scale: 1, seed: (h.x * 13 + h.y * 7) | 0, solidRect: true });
    }
    if (def.id === 'valdoria') {
      // Valla alrededor de la aldea, con huecos.
      const c = def.landmarks.village;
      for (let i = 0; i < 34; i++) {
        const a = (i / 34) * Math.PI * 2;
        if (i % 9 === 0 || i % 9 === 1 || i % 9 === 5) continue;
        const x = c.x + Math.cos(a) * (c.r + 1.1);
        const y = c.y + Math.sin(a) * (c.r + 1.1);
        this.props.push({ type: 'fence', x: x * TILE, y: y * TILE, scale: 0.9, seed: i, solid: 9 });
      }
      this.props.push({ type: 'well', x: 21 * TILE, y: 45.5 * TILE, scale: 1, seed: 3, solid: 14 });
      this.props.push({ type: 'banner', x: 18 * TILE, y: 42 * TILE, scale: 1, seed: 1 });
      this.props.push({ type: 'banner', x: 23 * TILE, y: 42 * TILE, scale: 1, seed: 2 });
    }
    if (def.id === 'drakmor') {
      this.props.push({ type: 'banner', x: 20 * TILE, y: 24 * TILE, scale: 1.1, seed: 5 });
      this.props.push({ type: 'bonePile', x: 26 * TILE, y: 32 * TILE, scale: 1, seed: 8 });
    }
    if (def.id === 'kansordore') {
      this.props.push({ type: 'statue', x: 17 * TILE, y: 54 * TILE, scale: 1.2, seed: 4, solid: 14 });
      this.props.push({ type: 'statue', x: 23 * TILE, y: 54 * TILE, scale: 1.2, seed: 5, solid: 14 });
      this.props.push({ type: 'banner', x: 20 * TILE, y: 52 * TILE, scale: 1.2, seed: 6 });
    }
  }

  _buildSpecialProps() {
    const def = this.def;
    // Santuario de Valdoria.
    if (def.id === 'valdoria') {
      const s = def.landmarks.shrine;
      for (let i = 0; i < 7; i++) {
        const a = (i / 7) * Math.PI * 2;
        this.props.push({ type: 'runeStone', x: (s.x + Math.cos(a) * (s.r - 1)) * TILE, y: (s.y + Math.sin(a) * (s.r - 1)) * TILE, scale: 1, seed: i, solid: 10 });
      }
      const r = def.landmarks.ruins;
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2;
        if (i % 4 === 0) continue;
        this.props.push({ type: 'ruinPillar', x: (r.x + Math.cos(a) * (r.r - 1)) * TILE, y: (r.y + Math.sin(a) * (r.r - 1)) * TILE, scale: 1, seed: i, solid: 11 });
      }
      this.props.push({ type: 'arch', x: 86 * TILE, y: 60 * TILE, scale: 1.3, seed: 2 });
    }
    if (def.id === 'drakmor') {
      const f = def.landmarks.fortress;
      for (let i = 0; i < 14; i++) {
        const a = (i / 14) * Math.PI * 2;
        if (i % 5 === 0) continue;
        this.props.push({ type: 'fortressWall', x: (f.x + Math.cos(a) * (f.r - 0.5)) * TILE, y: (f.y + Math.sin(a) * (f.r - 0.5)) * TILE, scale: 1, seed: i, solid: 13 });
      }
      this.props.push({ type: 'forgeBig', x: 57 * TILE, y: 48 * TILE, scale: 1.2, seed: 7, solidRect: true, w: 3 * TILE, h: 2 * TILE });
    }
    if (def.id === 'kansordore') {
      const l = def.landmarks.library;
      for (let i = 0; i < 10; i++) {
        const a = (i / 10) * Math.PI * 2;
        this.props.push({ type: 'column', x: (l.x + Math.cos(a) * (l.r - 1)) * TILE, y: (l.y + Math.sin(a) * (l.r - 1)) * TILE, scale: 1.2, seed: i, solid: 12 });
      }
      const f = def.landmarks.final;
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2;
        if (Math.abs(((a - Math.PI) % (Math.PI * 2))) < 0.5) continue;
        this.props.push({ type: 'floatingObelisk', x: (f.x + Math.cos(a) * (f.r - 0.5)) * TILE, y: (f.y + Math.sin(a) * (f.r - 0.5)) * TILE, scale: 1, seed: i });
      }
    }
    // Sellos de jefe.
    if (def.boss) {
      const bd = (def.interactables || []).find(i => i.type === 'bossdoor');
      if (bd) this.props.push({ type: 'seal', x: bd.x * TILE, y: bd.y * TILE, scale: 1, seed: 99, solid: 18, bossdoor: bd.id });
    }
  }

  _placeInteractables() {
    for (const it of this.def.interactables || []) {
      const x = it.x * TILE, y = it.y * TILE;
      this.interactables.push({ ...it, x, y, radius: it.radius || 42 });
      // Despejar props cercanos, pero conservar el sello del jefe.
      this.props = this.props.filter(p => {
        if (p.type === 'seal') return true;
        if (it.type === 'bossdoor' && p.bossdoor === it.id) return true;
        return dist(p.x, p.y, x, y) > 26;
      });
    }
    // Los sellos deben quedar tras filtrar.
    for (const p of this.props) if (p.type === 'seal') p.solid = 18;
  }

  _placeNpcs() {
    for (const n of this.def.npcs || []) {
      this.npcs.push({ ...n, x: n.x * TILE, y: n.y * TILE, radius: 12 });
    }
  }

  _buildBorders() {
    const { width: w, height: h, def } = this;
    const border = def.id === 'kansordore' ? T.VOID : T.CLIFF;
    for (let x = 0; x < w; x++) {
      this.tiles[idx(w, x, 0)] = border;
      this.tiles[idx(w, x, h - 1)] = border;
    }
    for (let y = 0; y < h; y++) {
      this.tiles[idx(w, 0, y)] = border;
      this.tiles[idx(w, w - 1, y)] = border;
    }
  }

  _markProp(p) {
    p._marked = true;
    if (p.solidRect) {
      const x0 = Math.floor((p.x - p.w / 2) / TILE), x1 = Math.ceil((p.x + p.w / 2) / TILE);
      const y0 = Math.floor((p.y - p.h / 2) / TILE), y1 = Math.ceil((p.y + p.h / 2) / TILE);
      for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (inMap(this.width, this.height, x, y)) this.blocked[idx(this.width, x, y)] = 1;
    } else if (p.solid) {
      const tx = Math.floor(p.x / TILE), ty = Math.floor(p.y / TILE);
      if (inMap(this.width, this.height, tx, ty)) this.blocked[idx(this.width, tx, ty)] = 1;
      const r = Math.ceil((p.solid || 10) / TILE);
      for (let y = ty - r + 1; y <= ty + r - 1; y++) for (let x = tx - r + 1; x <= tx + r - 1; x++) {
        if (inMap(this.width, this.height, x, y) && dist((x + 0.5) * TILE, (y + 0.5) * TILE, p.x, p.y) < p.solid) this.blocked[idx(this.width, x, y)] = 1;
      }
    }
  }

  _makeAmbient() {
    const out = [];
    const count = this.def.id === 'valdoria' ? 26 : this.def.id === 'drakmor' ? 34 : 24;
    for (let i = 0; i < count; i++) {
      out.push({ x: Math.random(), y: Math.random(), speed: randRange(Math.random, 0.02, 0.09), phase: Math.random() * 6.28, size: randRange(Math.random, 1, 2.6) });
    }
    return out;
  }

  tileAtTile(tx, ty) {
    if (tx < 0 || ty < 0 || tx >= this.width || ty >= this.height) return T.CLIFF;
    return this.tiles[ty * this.width + tx];
  }
  tileAtPx(x, y) { return this.tileAtTile(Math.floor(x / TILE), Math.floor(y / TILE)); }
  isSolidTile(tx, ty) { return SOLID_TILES.has(this.tileAtTile(tx, ty)) || this.blocked[ty * this.width + tx] === 1; }
  isSolidPx(x, y) { return this.isSolidTile(Math.floor(x / TILE), Math.floor(y / TILE)); }

  circleBlocked(x, y, r) {
    const minX = Math.floor((x - r) / TILE), maxX = Math.floor((x + r) / TILE);
    const minY = Math.floor((y - r) / TILE), maxY = Math.floor((y + r) / TILE);
    for (let ty = minY; ty <= maxY; ty++) {
      for (let tx = minX; tx <= maxX; tx++) {
        if (!this.isSolidTile(tx, ty)) continue;
        const nx = clamp(x, tx * TILE, tx * TILE + TILE);
        const ny = clamp(y, ty * TILE, ty * TILE + TILE);
        if ((x - nx) ** 2 + (y - ny) ** 2 < r * r) return true;
      }
    }
    return false;
  }

  moveCircle(x, y, dx, dy, r) {
    let nx = x + dx, ny = y;
    if (this.circleBlocked(nx, ny, r)) {
      // Deslizar en pequeños pasos.
      const steps = Math.max(1, Math.ceil(Math.abs(dx) / 4));
      for (let i = 1; i <= steps; i++) {
        const tx = x + dx * (i / steps);
        if (this.circleBlocked(tx, ny, r)) break;
        nx = tx;
      }
    }
    let fy = y + dy;
    if (this.circleBlocked(nx, fy, r)) {
      const steps = Math.max(1, Math.ceil(Math.abs(dy) / 4));
      for (let i = 1; i <= steps; i++) {
        const ty = y + dy * (i / steps);
        if (this.circleBlocked(nx, ty, r)) break;
        fy = ty;
      }
    }
    return { x: nx, y: fy };
  }

  randomFreeNear(x, y, radius, rng = Math.random) {
    for (let i = 0; i < 40; i++) {
      const a = rng() * Math.PI * 2;
      const d = Math.sqrt(rng()) * radius;
      const px = x + Math.cos(a) * d, py = y + Math.sin(a) * d;
      if (!this.circleBlocked(px, py, 12)) return { x: px, y: py };
    }
    return { x, y };
  }

  // A* sobre la rejilla de colisión.
  findPath(sx, sy, tx, ty, maxNodes = 2600) {
    const startX = clamp(Math.floor(sx / TILE), 0, this.width - 1);
    const startY = clamp(Math.floor(sy / TILE), 0, this.height - 1);
    const goalX = clamp(Math.floor(tx / TILE), 0, this.width - 1);
    const goalY = clamp(Math.floor(ty / TILE), 0, this.height - 1);
    if (startX === goalX && startY === goalY) return [];
    if (this.isSolidTile(goalX, goalY)) {
      let found = null;
      for (let r = 1; r <= 3 && !found; r++) {
        for (let y = goalY - r; y <= goalY + r && !found; y++) for (let x = goalX - r; x <= goalX + r; x++) {
          if (!this.isSolidTile(x, y)) { found = { x, y }; break; }
        }
      }
      if (!found) return [];
      return this.findPath(sx, sy, (found.x + 0.5) * TILE, (found.y + 0.5) * TILE, maxNodes);
    }
    const w = this.width;
    const open = [{ x: startX, y: startY, g: 0, f: 0, parent: null }];
    const seen = new Map();
    const key = (x, y) => y * w + x;
    seen.set(key(startX, startY), 0);
    let nodes = 0;
    while (open.length && nodes < maxNodes) {
      let best = 0;
      for (let i = 1; i < open.length; i++) if (open[i].f < open[best].f) best = i;
      const cur = open.splice(best, 1)[0];
      nodes++;
      if (cur.x === goalX && cur.y === goalY) {
        const path = [];
        let n = cur;
        while (n && n.parent) { path.push({ x: (n.x + 0.5) * TILE, y: (n.y + 0.5) * TILE }); n = n.parent; }
        return path.reverse();
      }
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          if (!dx && !dy) continue;
          const nx = cur.x + dx, ny = cur.y + dy;
          if (nx < 0 || ny < 0 || nx >= this.width || ny >= this.height) continue;
          if (this.isSolidTile(nx, ny)) continue;
          if (dx && dy && (this.isSolidTile(cur.x + dx, cur.y) || this.isSolidTile(cur.x, cur.y + dy))) continue;
          const ng = cur.g + (dx && dy ? 1.414 : 1);
          const k = key(nx, ny);
          if (seen.has(k) && seen.get(k) <= ng) continue;
          seen.set(k, ng);
          const h = Math.abs(nx - goalX) + Math.abs(ny - goalY);
          open.push({ x: nx, y: ny, g: ng, f: ng + h, parent: cur });
        }
      }
    }
    return [];
  }

  removeProp(predicate) {
    this.props = this.props.filter(p => !predicate(p));
    this.blocked.fill(0);
    for (const p of this.props) this._markProp(p);
  }
}

export function createWorld(regionId, seed = 1337, saved = {}) {
  const def = REGIONS[regionId];
  if (!def) throw new Error('Región desconocida: ' + regionId);
  return new World(def, seed, saved);
}
