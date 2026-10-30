// Mundo de Lumen: mapa pintado por código, colisiones, objetos y secretos.
import {
  TAU, clamp, hash2, hashString, lerp, dist, rgba, shade, seededNoise, fbm
} from './utils.js';

export const TILE = 48;
export const WORLD_W = 88;
export const WORLD_H = 76;
export const WORLD_PX_W = WORLD_W * TILE;
export const WORLD_PX_H = WORLD_H * TILE;
const CHUNK_TILES = 16;
const CHUNK_PX = CHUNK_TILES * TILE;

export const TERRAIN = {
  GRASS: 0, PATH: 1, FOREST: 2, WATER: 3, STONE: 4, CLIFF: 5,
  SAND: 6, MOUNTAIN: 7, ARENA: 8, COBBLE: 9, STEPS: 10, MOSS: 11
};

const COLORS = {
  [TERRAIN.GRASS]: ['#557b48', '#5d8450', '#4f7444', '#628857'],
  [TERRAIN.FOREST]: ['#355b3d', '#3a6242', '#315438', '#3f6847'],
  [TERRAIN.PATH]: ['#9b835e', '#a48c65', '#907954', '#a88f67'],
  [TERRAIN.WATER]: ['#28606e', '#2b6876', '#245967', '#2f6f7c'],
  [TERRAIN.STONE]: ['#6c6c74', '#74747b', '#64646c', '#7b7a81'],
  [TERRAIN.CLIFF]: ['#3d3b49', '#444252', '#373542', '#4a4758'],
  [TERRAIN.SAND]: ['#c9b789', '#d2c093', '#bfad80', '#d6c497'],
  [TERRAIN.MOUNTAIN]: ['#56525c', '#5d5964', '#4e4b55', '#625e69'],
  [TERRAIN.ARENA]: ['#5c5b74', '#64637d', '#55546c', '#6b6a85'],
  [TERRAIN.COBBLE]: ['#77716a', '#7f7971', '#6e6862', '#867f76'],
  [TERRAIN.STEPS]: ['#8b8c83', '#94958b', '#818279', '#9d9e93'],
  [TERRAIN.MOSS]: ['#466b47', '#4c724d', '#3f613f', '#527a53']
};

const T = v => v * TILE;
const pt = (tx, ty) => ({ x: tx * TILE, y: ty * TILE });

const PATHS = [
  [[16, 52], [18, 47], [22, 43], [28, 41], [34, 40]],
  [[34, 40], [40, 37], [47, 34], [54, 31], [60, 29], [66, 27]],
  [[34, 40], [40, 43], [47, 47], [55, 50], [61, 51]],
  [[34, 40], [37, 34], [40, 27], [42, 20], [44, 16]],
  [[16, 52], [24, 55], [33, 58], [42, 57], [49, 55]],
  [[66, 27], [59, 23], [53, 19], [48, 17], [44, 16]],
  [[16, 52], [13, 49], [12, 45], [14, 42]],
  [[66, 27], [70, 31], [72, 35]]
];

const CLEARINGS = [
  { x: 16, y: 52, r: 9.4 },
  { x: 34, y: 40, r: 5.4 },
  { x: 37, y: 35, r: 4.8 },
  { x: 38, y: 29.5, r: 4.2 },
  { x: 29, y: 34, r: 3.4 },
  { x: 46, y: 39, r: 3.2 },
  { x: 49, y: 32, r: 3.0 },
  { x: 31, y: 25, r: 3.2 },
  { x: 42, y: 44, r: 3.0 },
  { x: 60, y: 34, r: 3.2 },
  { x: 66, y: 27, r: 10.4 },
  { x: 63, y: 51, r: 7.6 },
  { x: 53, y: 56, r: 3.0 },
  { x: 44, y: 9.5, r: 10.5 },
  { x: 44, y: 16.5, r: 3.6 }
];

export class World {
  constructor() {
    this.w = WORLD_W;
    this.h = WORLD_H;
    this.tile = TILE;
    this.tiles = new Uint8Array(WORLD_W * WORLD_H);
    this.objects = [];
    this.interactables = [];
    this.npcs = [];
    this.enemyPacks = [];
    this.bossSpawns = [];
    this.chunks = new Map();
    this.solidGrid = new Map();
    this.cell = 128;
    this.time = 0;
    this.pathMask = new Uint8Array(WORLD_W * WORLD_H);
    this.protected = [];
    this.generate();
  }

  idx(x, y) { return y * WORLD_W + x; }
  inside(x, y) { return x >= 0 && y >= 0 && x < WORLD_W && y < WORLD_H; }
  terrainAt(x, y) { return this.inside(x, y) ? this.tiles[this.idx(x, y)] : TERRAIN.CLIFF; }
  terrainAtPx(x, y) { return this.terrainAt(Math.floor(x / TILE), Math.floor(y / TILE)); }

  set(x, y, type) {
    if (this.inside(x, y)) this.tiles[this.idx(x, y)] = type;
  }

  generate() {
    // 1. Base de hierba.
    for (let y = 0; y < WORLD_H; y++) {
      for (let x = 0; x < WORLD_W; x++) {
        const n = fbm(x * 0.09, y * 0.09, 11, 3);
        this.set(x, y, n > 0.58 ? TERRAIN.MOSS : TERRAIN.GRASS);
      }
    }

    // 2. Bosque central.
    for (let y = 0; y < WORLD_H; y++) {
      for (let x = 0; x < WORLD_W; x++) {
        const n = fbm(x * 0.055 + 3, y * 0.055, 23, 4);
        if (x > 25 && x < 54 && y > 21 && y < 48 && n > 0.34) {
          this.set(x, y, TERRAIN.FOREST);
        }
      }
    }

    // 3. Lago y orilla.
    for (let y = 0; y < WORLD_H; y++) {
      for (let x = 0; x < WORLD_W; x++) {
        const d = Math.pow((x - 52.5) / 9.8, 2) + Math.pow((y - 56.2) / 6.4, 2);
        if (d < 0.74) this.set(x, y, TERRAIN.WATER);
        else if (d < 1.03) this.set(x, y, TERRAIN.SAND);
      }
    }

    // 4. Ruinas de Aethel.
    for (let y = 0; y < WORLD_H; y++) {
      for (let x = 0; x < WORLD_W; x++) {
        const d = Math.pow((x - 66) / 13.5, 2) + Math.pow((y - 27) / 10.5, 2);
        if (d < 1.0) {
          const n = hash2(x, y, 77);
          this.set(x, y, n > 0.2 ? TERRAIN.STONE : TERRAIN.MOSS);
        }
      }
    }

    // 5. Cantera.
    for (let y = 0; y < WORLD_H; y++) {
      for (let x = 0; x < WORLD_W; x++) {
        const d = Math.pow((x - 63) / 10.8, 2) + Math.pow((y - 51.5) / 7.8, 2);
        if (d < 1.0 && this.terrainAt(x, y) !== TERRAIN.WATER) {
          this.set(x, y, hash2(x, y, 91) > 0.18 ? TERRAIN.STONE : TERRAIN.SAND);
        }
      }
    }

    // 6. Montañas del norte y acantilados del borde.
    for (let y = 0; y < WORLD_H; y++) {
      for (let x = 0; x < WORLD_W; x++) {
        const n = fbm(x * 0.08, y * 0.08, 41, 3);
        if (y < 17 && n > 0.37) this.set(x, y, TERRAIN.MOUNTAIN);
        if (x < 2 || y < 2 || x > WORLD_W - 3 || y > WORLD_H - 3) this.set(x, y, TERRAIN.CLIFF);
      }
    }
    // Cañón de entrada al cielo.
    for (let y = 4; y < 19; y++) {
      for (let x = 39; x <= 49; x++) {
        const edge = Math.abs(x - 44);
        if (edge > 5 - Math.max(0, y - 14) * 0.2) this.set(x, y, TERRAIN.MOUNTAIN);
      }
    }

    // 7. Plaza de Vado Lirio.
    for (let y = 0; y < WORLD_H; y++) {
      for (let x = 0; x < WORLD_W; x++) {
        const d = Math.pow((x - 16) / 9.0, 2) + Math.pow((y - 53) / 8.2, 2);
        if (d < 1.0) this.set(x, y, TERRAIN.COBBLE);
      }
    }

    // 8. Caminos.
    for (const path of PATHS) this.paintPath(path);
    for (let y = 0; y < WORLD_H; y++) {
      for (let x = 0; x < WORLD_W; x++) {
        if (this.pathMask[this.idx(x, y)]) {
          this.set(x, y, TERRAIN.PATH);
        }
      }
    }

    // 9. Arena celestial (sobre el camino y la montaña).
    for (let y = 3; y <= 17; y++) {
      for (let x = 33; x <= 55; x++) {
        const d = Math.pow((x - 44) / 12.0, 2) + Math.pow((y - 9.5) / 7.3, 2);
        if (d < 1.0) this.set(x, y, TERRAIN.ARENA);
      }
    }

    // 10. Sendero de piedras hacia la isla del lago.
    const steps = [[45, 55], [46, 55], [47, 55], [48, 55], [49, 56], [50, 56], [51, 56], [52, 56]];
    for (const [x, y] of steps) this.set(x, y, TERRAIN.STEPS);
    for (let y = 54; y <= 58; y++) for (let x = 50; x <= 55; x++) {
      if (Math.pow((x - 53) / 2.6, 2) + Math.pow((y - 56.2) / 2.0, 2) < 1) this.set(x, y, TERRAIN.SAND);
    }

    // 11. Senderos de tierra del claro al este.
    this.buildProtected();
    this.buildObjects();
    this.buildNPCs();
    this.buildEnemyPacks();
    this.buildInteractables();
    this.buildCollisionGrid();
  }

  paintPath(points) {
    for (let i = 0; i < points.length - 1; i++) {
      const [x1, y1] = points[i], [x2, y2] = points[i + 1];
      const steps = Math.ceil(Math.hypot(x2 - x1, y2 - y1) * 3);
      for (let s = 0; s <= steps; s++) {
        const t = s / steps;
        const cx = lerp(x1, x2, t), cy = lerp(y1, y2, t);
        const radius = 2.0 + seededNoise(cx * 0.4, cy * 0.4, 5) * 1.1;
        for (let y = Math.floor(cy - radius - 1); y <= Math.ceil(cy + radius + 1); y++) {
          for (let x = Math.floor(cx - radius - 1); x <= Math.ceil(cx + radius + 1); x++) {
            if (!this.inside(x, y)) continue;
            const d = Math.hypot(x + 0.5 - cx, y + 0.5 - cy);
            if (d < radius + (hash2(x, y, 3) - 0.5) * 0.85) this.pathMask[this.idx(x, y)] = 1;
          }
        }
      }
    }
  }

  buildProtected() {
    this.protected = [];
    for (let y = 0; y < WORLD_H; y++) for (let x = 0; x < WORLD_W; x++) {
      if (this.pathMask[this.idx(x, y)]) this.protected.push({ x: x + 0.5, y: y + 0.5, r: 2.8 });
    }
    for (const c of CLEARINGS) this.protected.push(c);
    // Zonas de edificios y puntos de interés.
    const places = [
      [14, 46.5, 4.5], [21.5, 46, 4], [9.5, 50.5, 4], [21, 57, 4], [8.5, 57.5, 4],
      [16.5, 52.5, 3.2], [19.5, 55.5, 3], [11.4, 52.8, 2.6], [13, 52.4, 2.2],
      [37, 35, 5], [38, 29.5, 4.2], [63, 51, 5], [67, 25, 5], [44, 9.5, 8],
      [53, 56, 3.2], [46, 40, 2.6], [29, 34, 2.8], [42, 44, 2.6]
    ];
    for (const [x, y, r] of places) this.protected.push({ x, y, r });
  }

  isProtected(tx, ty, margin = 0) {
    for (const p of this.protected) {
      if (Math.hypot(tx - p.x, ty - p.y) < p.r + margin) return true;
    }
    return false;
  }

  buildObjects() {
    this.objects = [];

    // Árboles del bosque y alrededores.
    for (let ty = 2; ty < WORLD_H - 2; ty++) {
      for (let tx = 2; tx < WORLD_W - 2; tx++) {
        const t = this.terrainAt(tx, ty);
        if (t !== TERRAIN.GRASS && t !== TERRAIN.FOREST && t !== TERRAIN.MOSS) continue;
        if (this.isProtected(tx + 0.5, ty + 0.5, 0.2)) continue;
        const forest = (tx > 23 && tx < 56 && ty > 20 && ty < 49);
        const n = fbm(tx * 0.11, ty * 0.11, 71, 3);
        let chance = forest ? 0.34 + n * 0.35 : 0.025 + n * 0.07;
        if (tx < 7 || ty < 7 || tx > WORLD_W - 8 || ty > WORLD_H - 8) chance += 0.3;
        if (Math.hypot(tx - 16, ty - 53) < 13) chance *= 0.18;
        if (hash2(tx, ty, 17) < chance) {
          const variant = hash2(tx, ty, 21) < 0.2 ? 'pine' : (hash2(tx, ty, 22) < 0.22 ? 'willow' : 'oak');
          const x = tx * TILE + 24 + (hash2(tx, ty, 23) - 0.5) * 26;
          const y = ty * TILE + 28 + (hash2(tx, ty, 24) - 0.5) * 22;
          this.addTree(x, y, variant, tx, ty);
        }
      }
    }

    // Rocas en cantera, ruinas y montaña.
    for (let ty = 2; ty < WORLD_H - 2; ty++) {
      for (let tx = 2; tx < WORLD_W - 2; tx++) {
        const t = this.terrainAt(tx, ty);
        if (![TERRAIN.STONE, TERRAIN.MOSS, TERRAIN.MOUNTAIN, TERRAIN.ARENA].includes(t)) continue;
        if (this.isProtected(tx + 0.5, ty + 0.5, 0.3)) continue;
        const quarry = tx > 52 && tx < 75 && ty > 42 && ty < 61;
        const ruins = tx > 53 && tx < 79 && ty > 17 && ty < 39;
        const chance = quarry ? 0.16 : ruins ? 0.08 : 0.05;
        if (hash2(tx, ty, 61) < chance) {
          this.addRock(tx * TILE + 24 + (hash2(tx, ty, 62) - 0.5) * 22, ty * TILE + 30, 0.75 + hash2(tx, ty, 63) * 0.8);
        }
      }
    }

    // Casas de Vado Lirio.
    this.addHouse(T(14), T(46.8), 5.0, 3.4, 0, 'Casa de la Anciana');
    this.addHouse(T(21.5), T(46.2), 4.2, 3.2, 2, 'Botica de Mira');
    this.addHouse(T(9.4), T(50.6), 4.7, 3.5, 1, 'Forja de Bran');
    this.addHouse(T(21), T(57.4), 4.3, 3.1, 3, 'Tienda de Tilo');
    this.addHouse(T(8.4), T(57.8), 4.4, 3.2, 0, 'Casa de los Hollin');
    this.addHouse(T(15.5), T(62.4), 6.0, 3.6, 2, 'Posada del Lirio');

    // Detalles de la plaza.
    this.addObject({
      type: 'fountain', x: T(16), y: T(52.9), radius: 40, solid: true,
      label: 'Fuente de Vado Lirio'
    });
    this.addObject({
      type: 'stall', x: T(20.6), y: T(55.7), w: 138, h: 78, solid: true,
      color: '#8f493f', label: 'Puesto de Tilo'
    });
    this.addObject({
      type: 'forge', x: T(8.2), y: T(53.3), w: 92, h: 62, solid: true,
      label: 'Fragua'
    });
    this.addObject({ type: 'garden', x: T(24.7), y: T(50.2), w: 110, h: 66, solid: false });
    this.addObject({ type: 'well', x: T(23.3), y: T(58.7), radius: 26, solid: true });
    this.addObject({ type: 'lamp', x: T(19.8), y: T(49.2), radius: 10, solid: false });
    this.addObject({ type: 'lamp', x: T(12.0), y: T(49.6), radius: 10, solid: false });
    this.addObject({ type: 'lamp', x: T(18.5), y: T(58.2), radius: 10, solid: false });
    this.addObject({ type: 'banner', x: T(19.2), y: T(44.4), solid: false });
    this.addObject({ type: 'crates', x: T(22.8), y: T(54.3), w: 52, h: 36, solid: true });
    this.addObject({ type: 'crates', x: T(10.7), y: T(55.7), w: 44, h: 32, solid: true });

    // Ruinas: columnas, muros y estatua.
    const columns = [[58,23],[62,21],[70,21],[73,26],[71,31],[61,31],[57,28],[64,18],[75,22],[69,35]];
    for (const [x, y] of columns) this.addColumn(T(x), T(y), hash2(x, y, 8) < 0.3);
    const walls = [[60,18,4,1],[67,17,5,1],[73,18,4,1],[76,24,1,5],[75,31,1,4],[64,35,4,1],[58,34,3,1]];
    for (const [x, y, w, h] of walls) this.addWall(T(x), T(y), w * TILE, h * TILE);
    this.addObject({ type: 'statue', x: T(67), y: T(30), radius: 34, solid: true });

    // Puerta Celestial.
    this.addObject({ type: 'gate_arch', x: T(44), y: T(16.5), w: 270, h: 190, solid: false, label: 'Puerta Celestial' });
    this.addObject({
      type: 'barrier', x: T(44), y: T(15.7), w: 128, h: 120, solid: true, dynamic: true,
      rect: { x: T(44) - 132, y: T(15.7) - 128, w: 264, h: 130 }, label: 'Barrera Celestial'
    });
    this.addObject({ type: 'celestial_pillar', x: T(35), y: T(11), radius: 15, solid: true });
    this.addObject({ type: 'celestial_pillar', x: T(53), y: T(11), radius: 15, solid: true });
    this.addObject({ type: 'celestial_pillar', x: T(38), y: T(4.5), radius: 15, solid: true });
    this.addObject({ type: 'celestial_pillar', x: T(50), y: T(4.5), radius: 15, solid: true });
    this.addObject({ type: 'broken_sword', x: T(44), y: T(7.2), w: 54, h: 90, solid: false, label: 'Espada Rota' });

    // Árboles de la isla y detalles del lago.
    this.addTree(T(54.2), T(57), 'willow', 54, 57);
    this.addTree(T(51.4), T(54.7), 'oak', 51, 54);
    this.addObject({ type: 'reeds', x: T(45.8), y: T(59.5), w: 90, h: 46, solid: false });
    this.addObject({ type: 'reeds', x: T(57.8), y: T(52.6), w: 100, h: 44, solid: false });

    // Señales, fogatas y detalles del camino.
    this.addObject({ type: 'sign', x: T(19.4), y: T(44.6), solid: false, text: 'Vado Lirio\nBosque de Ceniza →' });
    this.addObject({ type: 'sign', x: T(36.4), y: T(42.0), solid: false, text: 'Ruinas de Aethel →\nCantera ↓' });
    this.addObject({ type: 'campfire', x: T(41.6), y: T(42.0), radius: 16, solid: false });
    this.addObject({ type: 'campfire', x: T(45.2), y: T(18.6), radius: 16, solid: false });
    this.addObject({ type: 'ruin_rubble', x: T(56.4), y: T(33.2), w: 86, h: 38, solid: false });
    this.addObject({ type: 'ruin_rubble', x: T(74.2), y: T(29.4), w: 74, h: 34, solid: false });
    this.addObject({ type: 'bones', x: T(61.8), y: T(53.2), w: 70, h: 34, solid: false });
  }

  addObject(o) {
    this.objects.push(o);
    return o;
  }

  addTree(x, y, variant, tx, ty) {
    this.addObject({
      type: 'tree', variant, x, y, radius: variant === 'pine' ? 15 : 18, solid: true,
      wind: hash2(tx, ty, 99) * TAU, scale: 0.82 + hash2(tx, ty, 100) * 0.38
    });
  }

  addRock(x, y, scale = 1) {
    this.addObject({ type: 'rock', x, y, scale, radius: 16 * scale, solid: true });
  }

  addHouse(x, y, wTiles, hTiles, style, label) {
    this.addObject({
      type: 'house', x, y, w: wTiles * TILE, h: hTiles * TILE, style, label,
      solid: true, rect: { x: x - wTiles * TILE * 0.44, y: y - hTiles * TILE * 0.38, w: wTiles * TILE * 0.88, h: hTiles * TILE * 0.4 }
    });
  }

  addColumn(x, y, broken) {
    this.addObject({ type: 'column', x, y, solid: true, radius: 18, broken, scale: broken ? 0.7 : 1 });
  }

  addWall(x, y, w, h) {
    this.addObject({ type: 'wall', x, y, solid: true, rect: { x: x - w / 2, y: y - 20, w, h: 28 }, w, h });
  }

  buildNPCs() {
    this.npcs = [
      { id: 'elder', name: 'Anciana Lyss', role: 'elder', x: T(16), y: T(48.9), palette: '#6f5e8f', hair: '#e3e5ee' },
      { id: 'mira', name: 'Mira', role: 'healer', x: T(21.1), y: T(49.2), palette: '#5c8b71', hair: '#b97845' },
      { id: 'bran', name: 'Bran', role: 'smith', x: T(9.6), y: T(53.4), palette: '#63463c', hair: '#8b4a2b' },
      { id: 'tilo', name: 'Tilo', role: 'merchant', x: T(20.4), y: T(56.4), palette: '#7b5f3c', hair: '#d2a45e' },
      { id: 'nilo', name: 'Nilo', role: 'child', x: T(13.7), y: T(55.8), palette: '#4e709e', hair: '#cb8b4c' },
      { id: 'guard', name: 'Celador Orin', role: 'guard', x: T(38.4), y: T(22.6), palette: '#5a677f', hair: '#43434d' }
    ];
  }

  buildEnemyPacks() {
    const pack = (id, type, spots, respawn = 48, elite = false) => ({
      id, type, respawn,
      members: spots.map(([x, y]) => ({ type, x: T(x), y: T(y), elite })),
      timer: 0, alive: false
    });
    this.enemyPacks = [
      pack('fj1', 'gelatina', [[28.4, 39.2], [29.2, 37.9]], 40),
      pack('fj2', 'gelatina', [[31.6, 31.8], [30.3, 33.1], [32.4, 30.6]], 46),
      pack('fj3', 'gelatina', [[41.8, 43.3], [43.0, 44.2]], 42),
      pack('fw1', 'lobo', [[34.6, 42.2], [36.1, 43.1]], 52),
      pack('fw2', 'lobo', [[43.1, 36.6], [44.2, 35.1]], 54),
      pack('fw3', 'lobo', [[29.0, 24.8], [30.2, 26.1]], 52),
      pack('fw4', 'lobo', [[48.2, 38.2]], 55),
      pack('fb1', 'escarabajo', [[57.4, 32.8], [59.1, 33.9]], 58),
      pack('fs1', 'espectro', [[59.3, 25.4], [61.6, 24.2]], 60),
      pack('fs2', 'espectro', [[70.7, 22.6], [72.1, 25.5]], 62),
      pack('fs3', 'espectro', [[62.2, 33.4]], 60),
      pack('fq1', 'escarabajo', [[58.6, 48.4], [60.1, 49.1]], 58),
      pack('fq2', 'escarabajo', [[66.8, 54.1], [68.2, 52.7]], 60),
      pack('fq3', 'escarabajo', [[55.9, 54.0]], 60),
      pack('fn1', 'lobo', [[38.2, 25.8], [39.6, 24.6]], 58),
      pack('fn2', 'espectro', [[42.8, 20.1], [45.1, 19.3]], 62),
      pack('fl1', 'gelatina', [[45.7, 57.2], [47.1, 58.2]], 44),
      pack('fl2', 'gelatina', [[57.7, 58.8]], 44)
    ];
    this.bossSpawns = [
      { id: 'alfa', boss: 'alfa_ceniza', x: T(37.5), y: T(35.2), flag: 'alfa' },
      { id: 'matriarca', boss: 'matriarca_petrea', x: T(64.2), y: T(50.7), flag: 'matriarca' },
      { id: 'rey', boss: 'rey_espectro', x: T(67.2), y: T(24.5), flag: 'rey' },
      { id: 'guardian', boss: 'guardian', x: T(44), y: T(9.4), flag: 'guardian', final: true }
    ];
  }

  buildInteractables() {
    this.interactables = [];
    const add = o => { this.interactables.push(o); this.objects.push(o); return o; };

    add({ id: 'crystal_village', type: 'crystal', x: T(13.2), y: T(52.2), solid: true, radius: 20, label: 'Cristal de Guardado' });
    add({ id: 'crystal_gate', type: 'crystal', x: T(44.8), y: T(18.3), solid: true, radius: 20, label: 'Cristal de Guardado' });

    const chests = [
      ['chest_village', 12.0, 50.6, [['pocion_vida', 2], ['sello_vinculo', 1]]],
      ['chest_forest1', 29.4, 21.6, [['pocion_mana', 2], ['broche_velocidad', 1]]],
      ['chest_forest2', 47.5, 43.8, [['daga_viento', 1], ['pocion_vida', 1]]],
      ['chest_forest3', 31.0, 28.8, [['anillo_suerte', 1], ['sello_vinculo', 1]]],
      ['chest_ruins1', 72.4, 30.4, [['escudo_roble', 1], ['pocion_vida', 2]]],
      ['chest_ruins2', 58.1, 20.5, [['manto_ruinas', 1], ['elixir_alba', 1]]],
      ['chest_quarry', 61.2, 57.1, [['mandoble_obsidiana', 1], ['nucleo_piedra', 2]]],
      ['chest_island', 53.4, 55.8, [['reliquia_fenix', 1], ['elixir_alba', 1]]],
      ['chest_gate', 48.2, 17.1, [['armadura_celestial', 1], ['sello_vinculo', 2]]]
    ];
    for (const [id, x, y, loot] of chests) {
      add({ id, type: 'chest', x: T(x), y: T(y), solid: false, loot, label: 'Cofre antiguo' });
    }

    const lilies = [
      ['lily1', 38.1, 29.2], ['lily2', 39.4, 30.8], ['lily3', 36.7, 30.6],
      ['lily4', 40.8, 28.4]
    ];
    for (const [id, x, y] of lilies) {
      add({ id, type: 'lily', x: T(x), y: T(y), solid: false, label: 'Lirio Lunar' });
    }

    add({ id: 'wood_sword', type: 'pickup', x: T(43.7), y: T(30.2), solid: false, item: 'espada_madera', label: 'Espada de Madera' });

    add({
      id: 'lore_forest', type: 'lore', x: T(43.1), y: T(32.3), solid: true, radius: 18,
      title: 'Piedra de los Susurros',
      text: '«El bosque no recuerda a los reyes. Recuerda a quienes se detuvieron a escuchar.»'
    });
    add({
      id: 'lore_ruins', type: 'lore', x: T(63.5), y: T(28.7), solid: true, radius: 18,
      title: 'Crónica de Aethel',
      text: '«La ciudad no cayó en una noche. Cayó en mil pequeñas decisiones de mirar hacia otro lado.»'
    });
    add({
      id: 'lore_gate', type: 'lore', x: T(40.9), y: T(17.2), solid: true, radius: 18,
      title: 'Juramento del Centinela',
      text: '«Guardaré la puerta hasta que el último nombre sea pronunciado. Aunque el cielo olvide el mío.»'
    });

    add({ id: 'shrine', type: 'shrine', x: T(50.8), y: T(21.8), solid: true, radius: 24, label: 'Altar de la Luna' });
  }

  buildCollisionGrid() {
    this.solidGrid = new Map();
    for (const o of this.objects) {
      if (!o.solid) continue;
      this.insertSolid(o);
    }
  }

  insertSolid(o) {
    let minX, minY, maxX, maxY;
    if (o.rect) {
      minX = o.rect.x; minY = o.rect.y;
      maxX = o.rect.x + o.rect.w; maxY = o.rect.y + o.rect.h;
    } else {
      const r = o.radius || 18;
      minX = o.x - r; minY = o.y - r; maxX = o.x + r; maxY = o.y + r;
    }
    const c = this.cell;
    for (let gy = Math.floor(minY / c); gy <= Math.floor(maxY / c); gy++) {
      for (let gx = Math.floor(minX / c); gx <= Math.floor(maxX / c); gx++) {
        const key = gx + ',' + gy;
        if (!this.solidGrid.has(key)) this.solidGrid.set(key, []);
        this.solidGrid.get(key).push(o);
      }
    }
  }

  querySolids(x, y, radius) {
    const c = this.cell;
    const out = [];
    const seen = new Set();
    for (let gy = Math.floor((y - radius) / c); gy <= Math.floor((y + radius) / c); gy++) {
      for (let gx = Math.floor((x - radius) / c); gx <= Math.floor((x + radius) / c); gx++) {
        const list = this.solidGrid.get(gx + ',' + gy);
        if (!list) continue;
        for (const o of list) {
          if (seen.has(o)) continue;
          seen.add(o);
          out.push(o);
        }
      }
    }
    return out;
  }

  isBlocked(x, y, radius = 14, game = null) {
    if (x - radius < 0 || y - radius < 0 || x + radius > WORLD_PX_W || y + radius > WORLD_PX_H) return true;
    const t = this.terrainAtPx(x, y);
    if (t === TERRAIN.WATER || t === TERRAIN.CLIFF || t === TERRAIN.MOUNTAIN) return true;
    // Las orillas y esquinas también se comprueban para no atravesar muros finos.
    const tx = Math.floor(x / TILE), ty = Math.floor(y / TILE);
    for (let oy = -1; oy <= 1; oy++) for (let ox = -1; ox <= 1; ox++) {
      const nt = this.terrainAt(tx + ox, ty + oy);
      if (nt === TERRAIN.WATER || nt === TERRAIN.CLIFF || nt === TERRAIN.MOUNTAIN) {
        if (ox !== 0 || oy !== 0) {
          const cx = clamp(x, (tx + ox) * TILE, (tx + ox + 1) * TILE);
          const cy = clamp(y, (ty + oy) * TILE, (ty + oy + 1) * TILE);
          if (dist(x, y, cx, cy) < radius * 0.82) return true;
        }
      }
    }
    for (const o of this.querySolids(x, y, radius + 20)) {
      if (!o.solid) continue;
      if (o.dynamic && o.type === 'barrier' && game?.flags?.gateOpen) continue;
      if (o.rect) {
        const cx = clamp(x, o.rect.x, o.rect.x + o.rect.w);
        const cy = clamp(y, o.rect.y, o.rect.y + o.rect.h);
        if (dist(x, y, cx, cy) < radius) return true;
      } else {
        const rr = (o.radius || 18) * (o.type === 'tree' ? 0.62 : 1);
        if (dist(x, y, o.x, o.y - 4) < radius + rr) return true;
      }
    }
    return false;
  }

  moveWithCollision(entity, dx, dy, game, radius = entity.radius || 14) {
    let moved = false;
    if (dx !== 0) {
      const nx = entity.x + dx;
      if (!this.isBlocked(nx, entity.y, radius, game)) { entity.x = nx; moved = true; }
      else {
        // Deslizar en diagonal junto a muros.
        const step = Math.sign(dx) * Math.min(Math.abs(dx), 2);
        if (!this.isBlocked(entity.x + step, entity.y, radius, game)) { entity.x += step; moved = true; }
      }
    }
    if (dy !== 0) {
      const ny = entity.y + dy;
      if (!this.isBlocked(entity.x, ny, radius, game)) { entity.y = ny; moved = true; }
      else {
        const step = Math.sign(dy) * Math.min(Math.abs(dy), 2);
        if (!this.isBlocked(entity.x, entity.y + step, radius, game)) { entity.y += step; moved = true; }
      }
    }
    return moved;
  }

  getZone(x, y) {
    if (y < 18 * TILE && x > 28 * TILE && x < 62 * TILE) {
      return { id: 'celestial', name: 'Santuario Celestial', subtitle: 'Donde el cielo aprendió a sangrar', music: 'boss', tint: '#5b4d80', light: '#c7b3ff' };
    }
    if (x > 53 * TILE && y < 41 * TILE) {
      return { id: 'ruins', name: 'Ruinas de Aethel', subtitle: 'Una corona sin reino', music: 'ruins', tint: '#4d4066', light: '#a6d8dd' };
    }
    if (x > 49 * TILE && y > 41 * TILE && y < 64 * TILE) {
      return { id: 'quarry', name: 'Cantera de los Ecos', subtitle: 'La montaña que respira', music: 'quarry', tint: '#5d5347', light: '#e3c17d' };
    }
    if (x > 42 * TILE && y > 48 * TILE) {
      return { id: 'lake', name: 'Lago Espejo', subtitle: 'El agua recuerda otros cielos', music: 'forest', tint: '#3b6070', light: '#a7e3f2' };
    }
    if (x < 27 * TILE && y > 40 * TILE) {
      return { id: 'village', name: 'Vado Lirio', subtitle: 'Donde siempre queda una luz encendida', music: 'village', tint: '#7e6b4d', light: '#ffd99a' };
    }
    if (x < 56 * TILE && y > 18 * TILE && y < 50 * TILE) {
      return { id: 'forest', name: 'Bosque de Ceniza', subtitle: 'Cada hoja guarda un secreto', music: 'forest', tint: '#3f5c49', light: '#bde9c1' };
    }
    return { id: 'wilds', name: 'Tierras de Lumen', subtitle: 'El camino entre dos leyendas', music: 'forest', tint: '#4c5d52', light: '#d8e4ba' };
  }

  // --------------------------- Render del terreno ---------------------------
  getChunk(cx, cy) {
    const key = cx + ',' + cy;
    if (this.chunks.has(key)) return this.chunks.get(key);
    const canvas = document.createElement('canvas');
    canvas.width = CHUNK_PX;
    canvas.height = CHUNK_PX;
    const ctx = canvas.getContext('2d');
    const startX = cx * CHUNK_TILES, startY = cy * CHUNK_TILES;
    for (let ty = 0; ty < CHUNK_TILES; ty++) {
      for (let tx = 0; tx < CHUNK_TILES; tx++) {
        this.drawTile(ctx, startX + tx, startY + ty, tx * TILE, ty * TILE);
      }
    }
    this.chunks.set(key, canvas);
    if (this.chunks.size > 80) {
      const first = this.chunks.keys().next().value;
      this.chunks.delete(first);
    }
    return canvas;
  }

  drawTile(ctx, tx, ty, px, py) {
    const type = this.terrainAt(tx, ty);
    const pal = COLORS[type] || COLORS[TERRAIN.GRASS];
    const h = hash2(tx, ty, 5);
    ctx.fillStyle = pal[Math.floor(h * pal.length)];
    ctx.fillRect(px, py, TILE, TILE);

    if (type === TERRAIN.GRASS || type === TERRAIN.FOREST || type === TERRAIN.MOSS) {
      const n = 3 + Math.floor(h * 4);
      for (let i = 0; i < n; i++) {
        const hx = hash2(tx, ty, 30 + i), hy = hash2(tx, ty, 50 + i);
        const gx = px + 5 + hx * (TILE - 10), gy = py + 6 + hy * (TILE - 12);
        ctx.strokeStyle = type === TERRAIN.FOREST ? `rgba(125,177,120,${0.12 + hx * 0.13})` : `rgba(167,199,121,${0.12 + hx * 0.14})`;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(gx, gy);
        ctx.quadraticCurveTo(gx + (hx - 0.5) * 5, gy - 5, gx + (hx - 0.5) * 8, gy - 8 - hy * 4);
        ctx.stroke();
      }
      if (type === TERRAIN.FOREST && h > 0.72) {
        ctx.fillStyle = 'rgba(43,82,50,.5)';
        ctx.beginPath(); ctx.arc(px + 16 + h * 20, py + 18 + h * 18, 6 + h * 4, 0, TAU); ctx.fill();
      }
      if (h > 0.93) {
        const colors = ['#e6d27e', '#d9e8ff', '#e8a8c4', '#f2f0d0'];
        ctx.fillStyle = colors[Math.floor(hash2(tx, ty, 55) * colors.length)];
        for (let i = 0; i < 3; i++) {
          const fx = px + 10 + hash2(tx, ty, 60 + i) * 28;
          const fy = py + 12 + hash2(tx, ty, 70 + i) * 24;
          ctx.beginPath(); ctx.arc(fx, fy, 1.6, 0, TAU); ctx.fill();
        }
      }
    } else if (type === TERRAIN.PATH) {
      for (let i = 0; i < 3; i++) {
        const sx = px + 8 + hash2(tx, ty, 80 + i) * 32;
        const sy = py + 8 + hash2(tx, ty, 90 + i) * 32;
        ctx.fillStyle = `rgba(70,57,43,${0.12 + hash2(tx, ty, 95 + i) * 0.13})`;
        ctx.beginPath(); ctx.ellipse(sx, sy, 1.3 + hash2(tx, ty, 99 + i) * 1.4, 0.8, 0, 0, TAU); ctx.fill();
      }
      this.drawEdge(ctx, tx, ty, px, py, type);
    } else if (type === TERRAIN.WATER) {
      ctx.fillStyle = 'rgba(80,155,165,.1)';
      for (let i = 0; i < 2; i++) {
        const wy = py + 14 + i * 19 + hash2(tx, ty, 100 + i) * 5;
        ctx.strokeStyle = 'rgba(155,226,226,.16)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(px + 6, wy);
        ctx.bezierCurveTo(px + 18, wy - 3, px + 30, wy + 3, px + 42, wy);
        ctx.stroke();
      }
      this.drawEdge(ctx, tx, ty, px, py, type);
    } else if (type === TERRAIN.STONE) {
      const offset = (ty % 2) * 18;
      ctx.strokeStyle = 'rgba(43,42,50,.24)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(px, py + 24); ctx.lineTo(px + TILE, py + 24);
      ctx.moveTo(px + 16 + offset, py); ctx.lineTo(px + 16 + offset, py + 24);
      ctx.moveTo(px + 34 - offset, py + 24); ctx.lineTo(px + 34 - offset, py + TILE);
      ctx.stroke();
      if (h > 0.82) {
        ctx.strokeStyle = 'rgba(180,198,178,.18)';
        ctx.beginPath(); ctx.moveTo(px + 8 + h * 16, py + 8); ctx.lineTo(px + 16 + h * 14, py + 30); ctx.stroke();
      }
    } else if (type === TERRAIN.COBBLE) {
      for (let iy = 0; iy < 3; iy++) for (let ix = 0; ix < 3; ix++) {
        const ox = px + ix * 16 + (iy % 2) * 5 + 2;
        const oy = py + iy * 16 + 2;
        const hh = hash2(tx * 7 + ix, ty * 7 + iy, 112);
        ctx.fillStyle = `rgb(${105 + hh * 28},${99 + hh * 25},${92 + hh * 22})`;
        ctx.beginPath();
        ctx.roundRect(ox, oy, 12 + hh * 4, 11 + hh * 3, 3);
        ctx.fill();
        ctx.strokeStyle = 'rgba(50,46,44,.22)'; ctx.lineWidth = 1; ctx.stroke();
      }
    } else if (type === TERRAIN.STEPS) {
      ctx.fillStyle = '#7d8987';
      ctx.beginPath();
      ctx.ellipse(px + 24, py + 26, 20, 13, 0, 0, TAU);
      ctx.fill();
      ctx.fillStyle = 'rgba(200,213,205,.22)';
      ctx.beginPath(); ctx.ellipse(px + 20, py + 22, 11, 7, -0.2, 0, TAU); ctx.fill();
    } else if (type === TERRAIN.CLIFF || type === TERRAIN.MOUNTAIN) {
      ctx.fillStyle = 'rgba(23,22,31,.22)';
      ctx.beginPath();
      ctx.moveTo(px, py + TILE);
      ctx.lineTo(px + 10, py + 10 + h * 10);
      ctx.lineTo(px + 26, py + 5);
      ctx.lineTo(px + 43, py + 18);
      ctx.lineTo(px + TILE, py + 40);
      ctx.lineTo(px + TILE, py + TILE);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = 'rgba(145,143,165,.2)';
      ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.moveTo(px + 4, py + 34); ctx.lineTo(px + 18, py + 42); ctx.lineTo(px + 32, py + 36); ctx.stroke();
    } else if (type === TERRAIN.ARENA) {
      ctx.strokeStyle = 'rgba(231,202,125,.22)';
      ctx.lineWidth = 1;
      const off = (ty % 2) * 24;
      ctx.strokeRect(px + 4, py + 4, TILE - 8, TILE - 8);
      ctx.beginPath();
      ctx.moveTo(px + off % TILE + 4, py); ctx.lineTo(px + off % TILE + 4, py + TILE);
      ctx.stroke();
    } else if (type === TERRAIN.SAND) {
      for (let i = 0; i < 3; i++) {
        ctx.fillStyle = `rgba(255,246,202,${0.14 + hash2(tx, ty, 120 + i) * 0.15})`;
        ctx.fillRect(px + hash2(tx, ty, 125 + i) * 40, py + hash2(tx, ty, 130 + i) * 40, 1.6, 1.6);
      }
    }
  }

  drawEdge(ctx, tx, ty, px, py, type) {
    const neighbors = [
      [0, -1, px, py, TILE, 3], [0, 1, px, py + TILE - 3, TILE, 3],
      [-1, 0, px, py, 3, TILE], [1, 0, px + TILE - 3, py, 3, TILE]
    ];
    for (const [dx, dy, x, y, w, h] of neighbors) {
      const nt = this.terrainAt(tx + dx, ty + dy);
      if (nt === type) continue;
      if (type === TERRAIN.WATER) {
        ctx.fillStyle = nt === TERRAIN.SAND ? 'rgba(210,236,222,.28)' : 'rgba(117,197,188,.18)';
      } else if (type === TERRAIN.PATH) {
        ctx.fillStyle = 'rgba(83,70,48,.18)';
      } else continue;
      ctx.fillRect(x, y, w, h);
      if (type === TERRAIN.WATER) {
        ctx.fillStyle = 'rgba(225,255,248,.13)';
        if (dx === 0) ctx.fillRect(x + 4, y, w - 8, 1.5);
        else ctx.fillRect(x, y + 4, 1.5, h - 8);
      }
    }
  }

  drawTerrain(ctx, game, view) {
    const minCX = Math.max(0, Math.floor(view.x / CHUNK_PX));
    const maxCX = Math.min(Math.ceil(WORLD_W / CHUNK_TILES) - 1, Math.floor((view.x + view.w) / CHUNK_PX));
    const minCY = Math.max(0, Math.floor(view.y / CHUNK_PX));
    const maxCY = Math.min(Math.ceil(WORLD_H / CHUNK_TILES) - 1, Math.floor((view.y + view.h) / CHUNK_PX));
    for (let cy = minCY; cy <= maxCY; cy++) {
      for (let cx = minCX; cx <= maxCX; cx++) {
        ctx.drawImage(this.getChunk(cx, cy), cx * CHUNK_PX, cy * CHUNK_PX);
      }
    }
    // Brillo animado sobre el agua visible.
    const t0x = Math.max(0, Math.floor(view.x / TILE)), t1x = Math.min(WORLD_W - 1, Math.floor((view.x + view.w) / TILE));
    const t0y = Math.max(0, Math.floor(view.y / TILE)), t1y = Math.min(WORLD_H - 1, Math.floor((view.y + view.h) / TILE));
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (let ty = t0y; ty <= t1y; ty++) {
      for (let tx = t0x; tx <= t1x; tx++) {
        if (this.terrainAt(tx, ty) !== TERRAIN.WATER) continue;
        const h = hash2(tx, ty, 5);
        const a = 0.08 + Math.sin(this.time * 1.3 + h * 8) * 0.045;
        ctx.globalAlpha = Math.max(0, a);
        ctx.strokeStyle = '#a9f3ed';
        ctx.lineWidth = 1.2;
        const sx = tx * TILE + 6 + Math.sin(this.time * 0.6 + h * 5) * 7;
        ctx.beginPath();
        ctx.moveTo(sx, ty * TILE + 16 + h * 14);
        ctx.quadraticCurveTo(sx + 12, ty * TILE + 13 + h * 14, sx + 24, ty * TILE + 16 + h * 14);
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  drawObject(ctx, o, game, time) {
    ctx.save();
    switch (o.type) {
      case 'tree': this.drawTree(ctx, o, time); break;
      case 'rock': this.drawRock(ctx, o); break;
      case 'house': this.drawHouse(ctx, o, time); break;
      case 'fountain': this.drawFountain(ctx, o, time); break;
      case 'stall': this.drawStall(ctx, o, time); break;
      case 'forge': this.drawForge(ctx, o, time); break;
      case 'garden': this.drawGarden(ctx, o, time); break;
      case 'well': this.drawWell(ctx, o); break;
      case 'lamp': this.drawLamp(ctx, o, time); break;
      case 'banner': this.drawBanner(ctx, o, time); break;
      case 'crates': this.drawCrates(ctx, o); break;
      case 'column': this.drawColumn(ctx, o); break;
      case 'wall': this.drawWall(ctx, o); break;
      case 'statue': this.drawStatue(ctx, o, time); break;
      case 'gate_arch': this.drawGateArch(ctx, o, game, time); break;
      case 'barrier': this.drawBarrier(ctx, o, game, time); break;
      case 'celestial_pillar': this.drawCelestialPillar(ctx, o, time); break;
      case 'broken_sword': this.drawBrokenSword(ctx, o, time); break;
      case 'sign': this.drawSign(ctx, o); break;
      case 'campfire': this.drawCampfire(ctx, o, time); break;
      case 'reeds': this.drawReeds(ctx, o, time); break;
      case 'ruin_rubble': this.drawRubble(ctx, o); break;
      case 'bones': this.drawBones(ctx, o); break;
      case 'chest': this.drawChest(ctx, o, game); break;
      case 'crystal': this.drawCrystal(ctx, o, time); break;
      case 'lily': this.drawLily(ctx, o, time, game); break;
      case 'pickup': this.drawPickup(ctx, o, time, game); break;
      case 'lore': this.drawLore(ctx, o, time); break;
      case 'shrine': this.drawShrine(ctx, o, time); break;
      default: break;
    }
    ctx.restore();
  }

  drawShadow(ctx, x, y, rx, ry, alpha = 0.28) {
    ctx.fillStyle = `rgba(8,12,18,${alpha})`;
    ctx.beginPath();
    ctx.ellipse(x, y, rx, ry, 0, 0, TAU);
    ctx.fill();
  }

  drawTree(ctx, o, time) {
    const s = o.scale || 1;
    const sway = Math.sin(time * 0.9 + o.wind) * 2.2 * s;
    ctx.save();
    ctx.translate(o.x, o.y);
    ctx.scale(s, s);
    this.drawShadow(ctx, 0, 4, 28, 9, 0.3);
    ctx.fillStyle = '#4a3827';
    ctx.beginPath();
    ctx.moveTo(-6, 2); ctx.lineTo(-4, -62); ctx.lineTo(5, -62); ctx.lineTo(7, 2); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#5f4932';
    ctx.fillRect(-2, -60, 3, 55);
    ctx.strokeStyle = '#3a2c1f'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(0, -35); ctx.lineTo(19, -58); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-1, -46); ctx.lineTo(-19, -64); ctx.stroke();

    if (o.variant === 'pine') {
      for (let i = 0; i < 3; i++) {
        const yy = -50 - i * 27 + sway * (0.4 + i * 0.15);
        const ww = 38 - i * 8;
        ctx.fillStyle = i % 2 ? '#2e573e' : '#356347';
        ctx.beginPath();
        ctx.moveTo(0, yy - 43); ctx.lineTo(-ww, yy + 38); ctx.lineTo(ww, yy + 38); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = 'rgba(149,199,137,.2)'; ctx.lineWidth = 2; ctx.stroke();
      }
    } else {
      const blobs = [
        [0, -102, 42, '#3f7049'], [-27, -89, 28, '#386743'], [28, -87, 29, '#4b7a50'],
        [-12, -119, 24, '#5a8958'], [18, -118, 22, '#4f7d50'], [0, -82, 30, '#44734b']
      ];
      for (const [x, y, r, c] of blobs) {
        ctx.fillStyle = c;
        ctx.beginPath(); ctx.arc(x + sway, y, r, 0, TAU); ctx.fill();
      }
      ctx.fillStyle = 'rgba(176,214,129,.16)';
      for (const [x, y, r] of blobs.slice(0, 4)) {
        ctx.beginPath(); ctx.arc(x + sway - r * 0.18, y - r * 0.2, r * 0.55, 0, TAU); ctx.fill();
      }
      if (o.variant === 'willow') {
        ctx.strokeStyle = 'rgba(92,139,83,.55)'; ctx.lineWidth = 2;
        for (let i = 0; i < 8; i++) {
          const x = -30 + i * 8.5;
          ctx.beginPath(); ctx.moveTo(x + sway, -80); ctx.quadraticCurveTo(x + sway + 5, -45, x + sway + Math.sin(time + i) * 3, -20); ctx.stroke();
        }
      }
    }
    ctx.restore();
  }

  drawRock(ctx, o) {
    const s = o.scale || 1;
    ctx.save();
    ctx.translate(o.x, o.y);
    ctx.scale(s, s);
    this.drawShadow(ctx, 0, 4, 24, 8, 0.3);
    ctx.fillStyle = '#65646b';
    ctx.beginPath();
    ctx.moveTo(-24, 0); ctx.lineTo(-18, -24); ctx.lineTo(2, -34); ctx.lineTo(22, -18); ctx.lineTo(27, 2); ctx.lineTo(8, 9); ctx.lineTo(-12, 7); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#7d7c83';
    ctx.beginPath(); ctx.moveTo(-18, -24); ctx.lineTo(2, -34); ctx.lineTo(8, -17); ctx.lineTo(-10, -11); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(44,43,50,.55)'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(4, -31); ctx.lineTo(8, -13); ctx.lineTo(19, -4); ctx.stroke();
    if (o.scale > 1.15) {
      ctx.fillStyle = 'rgba(116,151,90,.5)';
      ctx.beginPath(); ctx.arc(-12, -7, 6, 0, TAU); ctx.fill();
    }
    ctx.restore();
  }

  drawHouse(ctx, o, time) {
    const w = o.w, h = o.h;
    const x = o.x, y = o.y;
    const style = o.style || 0;
    const wall = ['#cfbd9b', '#b7a98d', '#c7b18d', '#c9c1a8'][style % 4];
    const beam = ['#5f412f', '#4d3a34', '#563d2c', '#635343'][style % 4];
    const roof = ['#7a3f3b', '#5b4b48', '#385a5a', '#6b4b36'][style % 4];
    const win = ['#f7cf88', '#ffd99a', '#bde8de', '#f7cf88'][style % 4];
    ctx.save();
    ctx.translate(x, y);
    this.drawShadow(ctx, 0, 5, w * 0.52, 17, 0.34);
    // Base de piedra.
    ctx.fillStyle = '#706b62';
    ctx.fillRect(-w * 0.48, -h * 0.28, w * 0.96, h * 0.3);
    ctx.fillStyle = wall;
    ctx.fillRect(-w * 0.44, -h * 0.76, w * 0.88, h * 0.52);
    // Vigas.
    ctx.fillStyle = beam;
    ctx.fillRect(-w * 0.44, -h * 0.76, 6, h * 0.52);
    ctx.fillRect(w * 0.44 - 6, -h * 0.76, 6, h * 0.52);
    ctx.fillRect(-w * 0.44, -h * 0.52, w * 0.88, 5);
    ctx.globalAlpha = 0.4;
    ctx.fillRect(-w * 0.3, -h * 0.74, 4, h * 0.48);
    ctx.fillRect(w * 0.22, -h * 0.74, 4, h * 0.48);
    ctx.globalAlpha = 1;
    // Ventanas.
    const winCount = style === 3 ? 2 : 1;
    for (let i = 0; i < winCount; i++) {
      const wx = winCount === 1 ? -20 : (i === 0 ? -w * 0.27 : w * 0.07);
      const wy = -h * 0.6;
      ctx.fillStyle = '#3a2c27';
      ctx.fillRect(wx - 3, wy - 3, 34, 28);
      ctx.fillStyle = win;
      ctx.shadowBlur = 16; ctx.shadowColor = win;
      ctx.fillRect(wx, wy, 28, 22);
      ctx.shadowBlur = 0;
      ctx.strokeStyle = '#4c3429'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(wx + 14, wy); ctx.lineTo(wx + 14, wy + 22); ctx.moveTo(wx, wy + 11); ctx.lineTo(wx + 28, wy + 11); ctx.stroke();
    }
    // Puerta.
    ctx.fillStyle = '#453126';
    ctx.beginPath(); ctx.roundRect(-18, -h * 0.26, 36, h * 0.24, 6); ctx.fill();
    ctx.fillStyle = '#75543b';
    ctx.beginPath(); ctx.roundRect(-14, -h * 0.24, 28, h * 0.2, 4); ctx.fill();
    ctx.fillStyle = '#e6c479';
    ctx.beginPath(); ctx.arc(8, -h * 0.14, 2, 0, TAU); ctx.fill();
    // Tejado.
    ctx.fillStyle = roof;
    ctx.beginPath();
    ctx.moveTo(-w * 0.56, -h * 0.72);
    ctx.quadraticCurveTo(-w * 0.18, -h * 1.22, 0, -h * 1.18);
    ctx.quadraticCurveTo(w * 0.2, -h * 1.22, w * 0.56, -h * 0.72);
    ctx.lineTo(w * 0.4, -h * 0.68);
    ctx.quadraticCurveTo(w * 0.1, -h * 1.02, -w * 0.4, -h * 0.68);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(30,22,24,.4)'; ctx.lineWidth = 2; ctx.stroke();
    // Tejas.
    ctx.strokeStyle = 'rgba(255,220,170,.14)'; ctx.lineWidth = 1;
    for (let i = 1; i < 5; i++) {
      ctx.beginPath();
      ctx.moveTo(-w * 0.38 + i * w * 0.19, -h * 0.72);
      ctx.lineTo(-w * 0.2 + i * w * 0.1, -h * 0.98);
      ctx.stroke();
    }
    // Chimenea y humo.
    if (style !== 2) {
      ctx.fillStyle = '#5f5149';
      ctx.fillRect(w * 0.24, -h * 1.13, 16, 38);
      ctx.fillStyle = '#8b7e74';
      ctx.fillRect(w * 0.22, -h * 1.16, 20, 6);
      for (let i = 0; i < 4; i++) {
        const t = (time * 0.25 + i * 0.25) % 1;
        ctx.globalAlpha = (1 - t) * 0.18;
        ctx.fillStyle = '#d8d0c4';
        ctx.beginPath(); ctx.arc(w * 0.27 + Math.sin(time + i) * 5, -h * 1.17 - t * 70, 7 + t * 12, 0, TAU); ctx.fill();
      }
      ctx.globalAlpha = 1;
    }
    // Banderín.
    ctx.fillStyle = '#b04a43';
    ctx.beginPath(); ctx.moveTo(-w * 0.34, -h * 0.86); ctx.lineTo(-w * 0.26, -h * 0.86); ctx.lineTo(-w * 0.3, -h * 0.6); ctx.closePath(); ctx.fill();
    ctx.restore();
  }

  drawFountain(ctx, o, time) {
    ctx.save();
    ctx.translate(o.x, o.y);
    this.drawShadow(ctx, 0, 6, 46, 14, 0.32);
    ctx.fillStyle = '#706c68';
    ctx.beginPath(); ctx.ellipse(0, 0, 43, 18, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = '#8f8a83';
    ctx.beginPath(); ctx.ellipse(0, -5, 36, 14, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = '#2e7782';
    ctx.beginPath(); ctx.ellipse(0, -5, 30, 10.5, 0, 0, TAU); ctx.fill();
    ctx.strokeStyle = 'rgba(185,241,240,.55)'; ctx.lineWidth = 1.5;
    for (let i = 0; i < 3; i++) {
      const r = 9 + i * 8;
      ctx.beginPath(); ctx.ellipse(0, -5, r + Math.sin(time + i) * 2, (r + Math.sin(time + i) * 2) * 0.34, 0, 0, TAU); ctx.stroke();
    }
    ctx.fillStyle = '#8b8475';
    ctx.fillRect(-7, -44, 14, 40);
    ctx.beginPath(); ctx.arc(0, -48, 13, 0, TAU); ctx.fill();
    ctx.fillStyle = '#c9b56d';
    ctx.beginPath(); ctx.arc(0, -48, 8, 0, TAU); ctx.fill();
    ctx.fillStyle = 'rgba(190,245,255,.7)';
    for (let i = 0; i < 5; i++) {
      const a = time * 0.8 + i * 1.25;
      ctx.beginPath(); ctx.arc(Math.cos(a) * 15, -34 + Math.sin(a * 1.7) * 4, 1.5, 0, TAU); ctx.fill();
    }
    ctx.restore();
  }

  drawStall(ctx, o, time) {
    ctx.save();
    ctx.translate(o.x, o.y);
    this.drawShadow(ctx, 0, 4, o.w * 0.5, 13, 0.3);
    ctx.fillStyle = '#5b412c';
    ctx.fillRect(-o.w / 2, -45, 6, 48);
    ctx.fillRect(o.w / 2 - 6, -45, 6, 48);
    ctx.fillStyle = '#6d4b30';
    ctx.fillRect(-o.w / 2, -28, o.w, 10);
    // Toldo a rayas.
    for (let i = 0; i < 6; i++) {
      ctx.fillStyle = i % 2 ? '#d8c09a' : '#9a4841';
      ctx.beginPath();
      ctx.moveTo(-o.w / 2 + i * o.w / 6, -48);
      ctx.lineTo(-o.w / 2 + (i + 1) * o.w / 6, -48);
      ctx.lineTo(-o.w / 2 + (i + 1) * o.w / 6 + 5, -74);
      ctx.lineTo(-o.w / 2 + i * o.w / 6 + 5, -74);
      ctx.closePath(); ctx.fill();
    }
    ctx.strokeStyle = '#493325'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(-o.w / 2, -48); ctx.lineTo(o.w / 2, -48); ctx.stroke();
    // Mercancía.
    ctx.fillStyle = '#c9a45e';
    ctx.beginPath(); ctx.arc(-28, -34, 6, 0, TAU); ctx.fill();
    ctx.fillStyle = '#9b5a43';
    ctx.fillRect(-8, -39, 12, 10);
    ctx.fillStyle = '#7db786';
    ctx.beginPath(); ctx.arc(18, -34, 5, 0, TAU); ctx.fill();
    ctx.restore();
  }

  drawForge(ctx, o, time) {
    ctx.save();
    ctx.translate(o.x, o.y);
    this.drawShadow(ctx, 0, 3, 48, 12, 0.32);
    ctx.fillStyle = '#574940';
    ctx.fillRect(-46, -32, 92, 34);
    ctx.fillStyle = '#3c3634';
    ctx.fillRect(-34, -48, 68, 22);
    ctx.fillStyle = '#27252b';
    ctx.beginPath(); ctx.roundRect(-18, -40, 36, 22, 5); ctx.fill();
    ctx.fillStyle = '#ff9b4d';
    ctx.shadowBlur = 22; ctx.shadowColor = '#ff793c';
    ctx.beginPath(); ctx.arc(0, -31, 11 + Math.sin(time * 5) * 2, 0, TAU); ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = '#b9a99a'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(36, -54); ctx.lineTo(58, -30); ctx.stroke();
    ctx.fillStyle = '#d7b46a';
    ctx.fillRect(-42, -55, 15, 5);
    ctx.restore();
  }

  drawGarden(ctx, o, time) {
    ctx.save();
    ctx.translate(o.x, o.y);
    ctx.fillStyle = 'rgba(68,91,54,.55)';
    ctx.beginPath(); ctx.roundRect(-o.w / 2, -o.h / 2, o.w, o.h, 10); ctx.fill();
    for (let i = 0; i < 16; i++) {
      const x = -o.w / 2 + 10 + hash2(i, 4, 8) * (o.w - 20);
      const y = -o.h / 2 + 8 + hash2(i, 9, 2) * (o.h - 16);
      ctx.strokeStyle = '#6b9a5c'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.sin(time + i) * 2, y - 10); ctx.stroke();
      ctx.fillStyle = ['#e3c96f', '#df9bb8', '#b9d8f1'][i % 3];
      ctx.beginPath(); ctx.arc(x + Math.sin(time + i) * 2, y - 11, 3, 0, TAU); ctx.fill();
    }
    ctx.restore();
  }

  drawWell(ctx, o) {
    ctx.save(); ctx.translate(o.x, o.y);
    this.drawShadow(ctx, 0, 4, 30, 9, 0.3);
    ctx.fillStyle = '#6d665f';
    ctx.beginPath(); ctx.ellipse(0, 0, 26, 10, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = '#858078';
    ctx.fillRect(-23, -19, 46, 20);
    ctx.fillStyle = '#2c3030';
    ctx.beginPath(); ctx.ellipse(0, -19, 20, 7, 0, 0, TAU); ctx.fill();
    ctx.strokeStyle = '#574331'; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(-18, -19); ctx.lineTo(-18, -52); ctx.lineTo(18, -52); ctx.lineTo(18, -19); ctx.stroke();
    ctx.fillStyle = '#7b3e39';
    ctx.beginPath(); ctx.moveTo(-26, -52); ctx.lineTo(0, -66); ctx.lineTo(26, -52); ctx.closePath(); ctx.fill();
    ctx.restore();
  }

  drawLamp(ctx, o, time) {
    ctx.save(); ctx.translate(o.x, o.y);
    this.drawShadow(ctx, 0, 3, 8, 4, 0.25);
    ctx.strokeStyle = '#3a3130'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -54); ctx.stroke();
    ctx.fillStyle = '#4a3d33';
    ctx.fillRect(-9, -62, 18, 18);
    const glow = 0.6 + Math.sin(time * 4 + o.x) * 0.15;
    ctx.fillStyle = '#ffd58b'; ctx.shadowBlur = 24 * glow; ctx.shadowColor = '#ffc46b';
    ctx.fillRect(-5, -59, 10, 12);
    ctx.restore();
  }

  drawBanner(ctx, o, time) {
    ctx.save(); ctx.translate(o.x, o.y);
    ctx.strokeStyle = '#5c4938'; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -100); ctx.stroke();
    ctx.fillStyle = '#7b3f48';
    ctx.beginPath();
    ctx.moveTo(0, -96); ctx.lineTo(42, -92 + Math.sin(time * 2) * 3);
    ctx.lineTo(34, -54); ctx.lineTo(0, -58); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#e4c578';
    ctx.beginPath(); ctx.arc(19, -76, 7, 0, TAU); ctx.fill();
    ctx.fillStyle = '#7b3f48';
    ctx.beginPath(); ctx.arc(19, -76, 4, 0, TAU); ctx.fill();
    ctx.restore();
  }

  drawCrates(ctx, o) {
    ctx.save(); ctx.translate(o.x, o.y);
    this.drawShadow(ctx, 0, 3, o.w * 0.55, 8, 0.3);
    ctx.fillStyle = '#715139';
    ctx.fillRect(-o.w / 2, -o.h, o.w, o.h);
    ctx.strokeStyle = '#493524'; ctx.lineWidth = 2;
    ctx.strokeRect(-o.w / 2, -o.h, o.w, o.h);
    ctx.beginPath(); ctx.moveTo(-o.w / 2, -o.h); ctx.lineTo(o.w / 2, 0); ctx.moveTo(o.w / 2, -o.h); ctx.lineTo(-o.w / 2, 0); ctx.stroke();
    ctx.restore();
  }

  drawColumn(ctx, o) {
    ctx.save(); ctx.translate(o.x, o.y);
    const s = o.scale || 1;
    ctx.scale(s, s);
    this.drawShadow(ctx, 0, 4, 26, 8, 0.32);
    ctx.fillStyle = '#77777f';
    ctx.fillRect(-20, -8, 40, 12);
    ctx.fillStyle = '#82828a';
    ctx.fillRect(-14, -o.broken ? 44 : 96, 28, o.broken ? 52 : 104);
    ctx.fillStyle = '#929299';
    ctx.fillRect(-12, -o.broken ? 44 : 96, 7, o.broken ? 50 : 102);
    ctx.strokeStyle = 'rgba(51,50,61,.45)'; ctx.lineWidth = 2;
    for (let i = 0; i < 4; i++) {
      ctx.beginPath(); ctx.moveTo(-12, -o.broken ? 18 + i * 11 : -80 + i * 24); ctx.lineTo(12, -o.broken ? 20 + i * 11 : -78 + i * 24); ctx.stroke();
    }
    if (!o.broken) {
      ctx.fillStyle = '#8b8b93';
      ctx.fillRect(-19, -104, 38, 10);
    } else {
      ctx.fillStyle = '#8b8b93';
      ctx.beginPath(); ctx.moveTo(-14, -44); ctx.lineTo(8, -50); ctx.lineTo(14, -40); ctx.lineTo(-6, -36); ctx.closePath(); ctx.fill();
    }
    ctx.fillStyle = 'rgba(82,126,77,.5)';
    ctx.beginPath(); ctx.arc(-9, o.broken ? -12 : -16, 5, 0, TAU); ctx.fill();
    ctx.restore();
  }

  drawWall(ctx, o) {
    ctx.save(); ctx.translate(o.x, o.y);
    this.drawShadow(ctx, 0, 4, o.w * 0.5, 8, 0.28);
    const blocks = Math.max(2, Math.round(o.w / 32));
    for (let i = 0; i < blocks; i++) {
      const x = -o.w / 2 + i * (o.w / blocks);
      const hh = 42 + hash2(i, o.x, 4) * 26;
      ctx.fillStyle = i % 2 ? '#74747c' : '#6b6b73';
      ctx.fillRect(x + 1, -hh, o.w / blocks - 2, hh);
      ctx.strokeStyle = 'rgba(43,42,52,.4)'; ctx.lineWidth = 2;
      ctx.strokeRect(x + 1, -hh, o.w / blocks - 2, hh);
      if (hash2(i, o.y, 8) > 0.55) {
        ctx.fillStyle = 'rgba(84,125,77,.45)';
        ctx.beginPath(); ctx.arc(x + o.w / blocks * 0.5, -hh + 8, 5, 0, TAU); ctx.fill();
      }
    }
    ctx.restore();
  }

  drawStatue(ctx, o, time) {
    ctx.save(); ctx.translate(o.x, o.y);
    this.drawShadow(ctx, 0, 5, 40, 12, 0.32);
    ctx.fillStyle = '#696972';
    ctx.fillRect(-31, -22, 62, 26);
    ctx.fillStyle = '#7b7b85';
    ctx.fillRect(-20, -82, 40, 62);
    ctx.beginPath(); ctx.arc(0, -92, 16, 0, TAU); ctx.fill();
    ctx.fillStyle = '#5e5e68';
    ctx.beginPath(); ctx.moveTo(-12, -104); ctx.lineTo(0, -122); ctx.lineTo(12, -104); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#8e8e98'; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(18, -70); ctx.lineTo(36, -108); ctx.stroke();
    ctx.fillStyle = 'rgba(111,243,224,.32)';
    ctx.beginPath(); ctx.arc(-5, -93, 2.5, 0, TAU); ctx.fill();
    ctx.restore();
  }

  drawGateArch(ctx, o, game, time) {
    const open = game?.flags?.gateOpen;
    ctx.save(); ctx.translate(o.x, o.y);
    this.drawShadow(ctx, 0, 8, 150, 24, 0.4);
    ctx.fillStyle = '#5c5b6a';
    ctx.fillRect(-145, -170, 54, 178);
    ctx.fillRect(91, -170, 54, 178);
    ctx.fillStyle = '#747383';
    ctx.fillRect(-146, -178, 58, 16);
    ctx.fillRect(88, -178, 58, 16);
    ctx.strokeStyle = 'rgba(237,209,136,.55)'; ctx.lineWidth = 3;
    for (let i = 0; i < 5; i++) {
      const y = -150 + i * 28;
      ctx.beginPath(); ctx.moveTo(-130, y); ctx.lineTo(-112, y - 8); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(130, y); ctx.lineTo(112, y - 8); ctx.stroke();
    }
    // Arco superior.
    ctx.strokeStyle = '#6a697a'; ctx.lineWidth = 22;
    ctx.beginPath(); ctx.arc(0, -168, 122, Math.PI, TAU); ctx.stroke();
    ctx.strokeStyle = 'rgba(233,204,131,.35)'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(0, -168, 112, Math.PI, TAU); ctx.stroke();
    for (let i = 0; i <= 6; i++) {
      const a = Math.PI + i / 6 * Math.PI;
      const x = Math.cos(a) * 122, y = -168 + Math.sin(a) * 122;
      ctx.fillStyle = open ? '#ffe8a8' : '#a99ccb';
      ctx.shadowBlur = 18; ctx.shadowColor = open ? '#ffe08a' : '#b79cff';
      ctx.beginPath(); ctx.arc(x, y, 5 + Math.sin(time * 3 + i) * 1.2, 0, TAU); ctx.fill();
      ctx.shadowBlur = 0;
    }
    ctx.restore();
  }

  drawBarrier(ctx, o, game, time) {
    const open = game?.flags?.gateOpen;
    if (open) return;
    ctx.save(); ctx.translate(o.x, o.y);
    const grad = ctx.createLinearGradient(0, -120, 0, 10);
    grad.addColorStop(0, 'rgba(180,145,255,.05)');
    grad.addColorStop(0.5, 'rgba(183,151,255,.46)');
    grad.addColorStop(1, 'rgba(112,203,255,.12)');
    ctx.fillStyle = grad;
    ctx.fillRect(-64, -118, 128, 120);
    ctx.strokeStyle = 'rgba(209,187,255,.55)'; ctx.lineWidth = 2;
    for (let i = 0; i < 5; i++) {
      const y = -110 + i * 25 + Math.sin(time * 2 + i) * 5;
      ctx.beginPath(); ctx.moveTo(-64, y); ctx.lineTo(64, y + Math.sin(time + i) * 4); ctx.stroke();
    }
    ctx.fillStyle = 'rgba(230,211,255,.7)';
    for (let i = 0; i < 20; i++) {
      const x = -58 + ((i * 37 + time * 14) % 116);
      const y = -20 - ((i * 53 + time * 24) % 96);
      ctx.globalAlpha = 0.25 + (i % 3) * 0.2;
      ctx.beginPath(); ctx.arc(x, y, 1.3, 0, TAU); ctx.fill();
    }
    ctx.restore();
  }

  drawCelestialPillar(ctx, o, time) {
    ctx.save(); ctx.translate(o.x, o.y);
    this.drawShadow(ctx, 0, 5, 26, 8, 0.32);
    ctx.fillStyle = '#55546a';
    ctx.fillRect(-20, -140, 40, 144);
    ctx.fillStyle = '#6b6a83';
    ctx.fillRect(-15, -140, 12, 140);
    ctx.fillStyle = '#d6b76f';
    ctx.shadowBlur = 16; ctx.shadowColor = '#e8cf8f';
    ctx.beginPath(); ctx.arc(0, -150, 7 + Math.sin(time * 2 + o.x) * 1.5, 0, TAU); ctx.fill();
    ctx.restore();
  }

  drawBrokenSword(ctx, o, time) {
    ctx.save(); ctx.translate(o.x, o.y);
    this.drawShadow(ctx, 0, 5, 34, 10, 0.3);
    ctx.fillStyle = '#3c3a4c';
    ctx.beginPath(); ctx.moveTo(-28, 0); ctx.lineTo(-16, -28); ctx.lineTo(16, -30); ctx.lineTo(30, 0); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#c7cbd8'; ctx.shadowBlur = 18; ctx.shadowColor = '#d8c7ff';
    ctx.beginPath(); ctx.moveTo(-3, -18); ctx.lineTo(1, -94); ctx.lineTo(6, -18); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#d2ad62';
    ctx.fillRect(-15, -20, 30, 5);
    ctx.globalAlpha = 0.45 + Math.sin(time * 2) * 0.1;
    ctx.strokeStyle = '#f0e3ac'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(0, -40, 26 + Math.sin(time * 0.8) * 3, 0, TAU); ctx.stroke();
    ctx.restore();
  }

  drawSign(ctx, o) {
    ctx.save(); ctx.translate(o.x, o.y);
    this.drawShadow(ctx, 0, 2, 13, 5, 0.25);
    ctx.strokeStyle = '#4b3727'; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -42); ctx.stroke();
    ctx.fillStyle = '#7b5a3a';
    ctx.beginPath(); ctx.roundRect(-34, -54, 68, 24, 3); ctx.fill();
    ctx.strokeStyle = '#4b3727'; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.fillStyle = 'rgba(239,222,183,.5)';
    ctx.fillRect(-27, -48, 48, 2);
    ctx.fillRect(-27, -42, 36, 1.5);
    ctx.restore();
  }

  drawCampfire(ctx, o, time) {
    ctx.save(); ctx.translate(o.x, o.y);
    this.drawShadow(ctx, 0, 2, 20, 7, 0.3);
    ctx.strokeStyle = '#4f3929'; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(-16, 0); ctx.lineTo(16, -4); ctx.moveTo(-14, -5); ctx.lineTo(14, 1); ctx.stroke();
    for (let i = 0; i < 3; i++) {
      const f = Math.sin(time * 7 + i * 2) * 4;
      ctx.fillStyle = ['#ff8a3c', '#ffc04f', '#ff5c37'][i];
      ctx.shadowBlur = 18; ctx.shadowColor = '#ff8a3c';
      ctx.beginPath();
      ctx.moveTo(-10 + i * 7, -2);
      ctx.quadraticCurveTo(-6 + i * 6 + f, -22 - i * 5, -2 + i * 7, -6);
      ctx.closePath(); ctx.fill();
    }
    ctx.restore();
  }

  drawReeds(ctx, o, time) {
    ctx.save(); ctx.translate(o.x, o.y);
    for (let i = 0; i < 14; i++) {
      const x = -o.w / 2 + i * (o.w / 14);
      const h = 24 + hash2(i, 4, 9) * 30;
      ctx.strokeStyle = i % 2 ? '#5e7e57' : '#748d5e'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.quadraticCurveTo(x + Math.sin(time + i) * 5, -h * 0.5, x + Math.sin(time + i) * 8, -h); ctx.stroke();
      if (i % 3 === 0) {
        ctx.fillStyle = '#8b6448';
        ctx.beginPath(); ctx.ellipse(x + Math.sin(time + i) * 8, -h, 3, 7, 0.2, 0, TAU); ctx.fill();
      }
    }
    ctx.restore();
  }

  drawRubble(ctx, o) {
    ctx.save(); ctx.translate(o.x, o.y);
    for (let i = 0; i < 6; i++) {
      const x = -o.w / 2 + hash2(i, o.x, 5) * o.w;
      const y = 4 - hash2(i, o.y, 7) * 16;
      ctx.fillStyle = i % 2 ? '#686871' : '#5b5b64';
      ctx.beginPath();
      ctx.moveTo(x - 9, y); ctx.lineTo(x - 3, y - 9); ctx.lineTo(x + 9, y - 4); ctx.lineTo(x + 5, y + 4); ctx.closePath(); ctx.fill();
    }
    ctx.restore();
  }

  drawBones(ctx, o) {
    ctx.save(); ctx.translate(o.x, o.y);
    ctx.strokeStyle = 'rgba(210,202,180,.55)'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(-24, 0); ctx.quadraticCurveTo(-8, -8, 8, 0); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-10, -8); ctx.lineTo(-4, 2); ctx.moveTo(0, -7); ctx.lineTo(8, 1); ctx.stroke();
    ctx.fillStyle = 'rgba(220,211,190,.5)';
    ctx.beginPath(); ctx.arc(-28, -1, 4, 0, TAU); ctx.fill();
    ctx.restore();
  }

  drawChest(ctx, o, game) {
    const opened = game?.flags?.chests?.[o.id];
    ctx.save(); ctx.translate(o.x, o.y);
    this.drawShadow(ctx, 0, 3, 20, 7, 0.32);
    if (!opened) {
      ctx.shadowBlur = 16 + Math.sin(this.time * 3 + o.x) * 4; ctx.shadowColor = 'rgba(255,214,120,.55)';
    }
    ctx.fillStyle = '#6d4a2f';
    ctx.beginPath(); ctx.roundRect(-20, -18, 40, 20, 4); ctx.fill();
    ctx.fillStyle = opened ? '#4b3a2a' : '#7c5534';
    ctx.beginPath(); ctx.roundRect(-20, -36, 40, 20, 5); ctx.fill();
    ctx.strokeStyle = '#d5b163'; ctx.lineWidth = 2.5;
    ctx.strokeRect(-20, -18, 40, 20);
    ctx.beginPath(); ctx.moveTo(-20, -27); ctx.lineTo(20, -27); ctx.stroke();
    ctx.fillStyle = '#d5b163';
    ctx.fillRect(-4, -26, 8, 9);
    if (opened) {
      ctx.fillStyle = 'rgba(16,13,20,.5)';
      ctx.fillRect(-17, -16, 34, 15);
    } else {
      ctx.globalAlpha = 0.6 + Math.sin(this.time * 4) * 0.2;
      ctx.fillStyle = '#ffe5a2';
      ctx.beginPath(); ctx.arc(0, -24, 2.5, 0, TAU); ctx.fill();
    }
    ctx.restore();
  }

  drawCrystal(ctx, o, time) {
    ctx.save(); ctx.translate(o.x, o.y);
    this.drawShadow(ctx, 0, 3, 17, 6, 0.3);
    ctx.fillStyle = '#5b5670';
    ctx.beginPath(); ctx.ellipse(0, 0, 16, 7, 0, 0, TAU); ctx.fill();
    const bob = Math.sin(time * 1.8 + o.x) * 3;
    ctx.translate(0, -20 + bob);
    ctx.shadowBlur = 26; ctx.shadowColor = 'rgba(137,226,255,.75)';
    const grad = ctx.createLinearGradient(0, -26, 0, 26);
    grad.addColorStop(0, '#e3fdff'); grad.addColorStop(0.45, '#8adcf0'); grad.addColorStop(1, '#6877d0');
    ctx.fillStyle = grad;
    ctx.beginPath(); ctx.moveTo(0, -28); ctx.lineTo(13, -7); ctx.lineTo(0, 24); ctx.lineTo(-13, -7); ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.65)';
    ctx.beginPath(); ctx.moveTo(0, -24); ctx.lineTo(5, -7); ctx.lineTo(0, 18); ctx.lineTo(-2, -6); ctx.closePath(); ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = 'rgba(187,244,255,.45)'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.ellipse(0, 2, 21 + Math.sin(time * 2) * 3, 8, 0, 0, TAU); ctx.stroke();
    ctx.restore();
  }

  drawLily(ctx, o, time, game) {
    const taken = game?.flags?.lilies?.[o.id];
    if (taken) return;
    ctx.save(); ctx.translate(o.x, o.y);
    ctx.fillStyle = 'rgba(151,234,231,.18)';
    ctx.beginPath(); ctx.arc(0, -10, 16 + Math.sin(time * 2) * 2, 0, TAU); ctx.fill();
    ctx.strokeStyle = '#5f8b61'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(0, 2); ctx.quadraticCurveTo(-3, -10, 0, -22); ctx.stroke();
    for (let i = 0; i < 6; i++) {
      const a = i / 6 * TAU + time * 0.15;
      ctx.fillStyle = i % 2 ? '#dffbff' : '#b5e8ff';
      ctx.beginPath(); ctx.ellipse(Math.cos(a) * 6, -23 + Math.sin(a) * 3, 6, 3, a, 0, TAU); ctx.fill();
    }
    ctx.fillStyle = '#fff3b0';
    ctx.beginPath(); ctx.arc(0, -23, 4, 0, TAU); ctx.fill();
    ctx.restore();
  }

  drawPickup(ctx, o, time, game) {
    const taken = game?.flags?.pickups?.[o.id];
    if (taken) return;
    ctx.save(); ctx.translate(o.x, o.y + Math.sin(time * 2.5) * 3);
    ctx.globalAlpha = 0.65;
    ctx.fillStyle = 'rgba(255,216,123,.22)';
    ctx.beginPath(); ctx.arc(0, -18, 22, 0, TAU); ctx.fill();
    ctx.globalAlpha = 1;
    ctx.strokeStyle = '#c9914d'; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(-10, -6); ctx.lineTo(10, -30); ctx.stroke();
    ctx.strokeStyle = '#e1ba73'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(-12, -12); ctx.lineTo(-3, -3); ctx.stroke();
    ctx.restore();
  }

  drawLore(ctx, o, time) {
    ctx.save(); ctx.translate(o.x, o.y);
    this.drawShadow(ctx, 0, 3, 18, 6, 0.3);
    ctx.fillStyle = '#65636f';
    ctx.beginPath(); ctx.moveTo(-14, 0); ctx.lineTo(-10, -40); ctx.lineTo(7, -47); ctx.lineTo(14, -4); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#7e7d8a';
    ctx.beginPath(); ctx.moveTo(-10, -40); ctx.lineTo(7, -47); ctx.lineTo(4, -12); ctx.lineTo(-6, -8); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(134,228,219,.5)'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(-2, -37); ctx.lineTo(1, -17); ctx.moveTo(3, -34); ctx.lineTo(5, -22); ctx.stroke();
    ctx.globalAlpha = 0.35 + Math.sin(time * 2 + o.x) * 0.12;
    ctx.fillStyle = '#9cebe4';
    ctx.beginPath(); ctx.arc(2, -28, 11, 0, TAU); ctx.fill();
    ctx.restore();
  }

  drawShrine(ctx, o, time) {
    ctx.save(); ctx.translate(o.x, o.y);
    this.drawShadow(ctx, 0, 4, 32, 10, 0.32);
    ctx.fillStyle = '#656071';
    ctx.fillRect(-28, -32, 56, 36);
    ctx.fillStyle = '#7b7589';
    ctx.beginPath(); ctx.arc(0, -32, 26, Math.PI, TAU); ctx.fill();
    ctx.fillStyle = '#f0df9e';
    ctx.shadowBlur = 20; ctx.shadowColor = '#f5e5a3';
    ctx.beginPath(); ctx.arc(0, -42, 9 + Math.sin(time * 1.7) * 1.4, 0, TAU); ctx.fill();
    ctx.strokeStyle = 'rgba(218,201,255,.5)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.ellipse(0, -10, 30 + Math.sin(time) * 2, 10, 0, 0, TAU); ctx.stroke();
    ctx.restore();
  }

  drawNpc(ctx, npc, game, time) {
    // Delegado al renderizador de personajes para mantener un estilo coherente.
    if (game?.renderHero) game.renderHero(ctx, {
      x: npc.x, y: npc.y, facing: Math.PI / 2, appearance: {
        hairStyle: npc.role === 'elder' ? 0 : npc.role === 'child' ? 2 : 1,
        hairColor: npc.hair, outfitColor: npc.palette, skinColor: npc.role === 'elder' ? '#d9b49a' : '#e4b28e',
        cloakColor: npc.palette
      },
      equipment: { weapon: npc.role === 'guard' ? 'lanza_alba' : npc.role === 'elder' ? 'baston_estrellas' : null, armor: null },
      npc: true, walk: 0, attack: 0, time, npcRole: npc.role, name: npc.name
    });
  }
}
