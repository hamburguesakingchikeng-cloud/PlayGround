/* ==========================================================================
   WORLD — tile maps, collision, lighting, weather and interactables.
   Maps are authored with a small deterministic builder (no external art).
   ========================================================================== */

import { ZONES, ELEMENTS } from './data.js';
import { drawHumanoid, resolveAppearance, hexA, lighten, darken } from './render.js';

export const T = 48;
const SOLID = new Set(['t', 'r', 'S', 'W', 'w', 'l', 'c', 'h', 'B', 'M', 'H', 'A']);
const WALK_BASE = new Set(['g', 'p', 'P', 's', 'd', 'f', ',', 'u', 'e', 'R', 'i', 'b', 'o']);

/* deterministic hash / random */
function hash(x, y, s = 0) {
  let h = x * 374761393 + y * 668265263 + s * 2246822519;
  h = (h ^ (h >>> 13)) * 1274126177;
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}
function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

class MB {
  constructor(w, h, base = 'g') {
    this.w = w; this.h = h; this.base = base;
    this.t = Array.from({ length: h }, () => Array(w).fill(base));
  }
  inb(x, y) { return x >= 0 && y >= 0 && x < this.w && y < this.h; }
  set(x, y, c) { if (this.inb(x, y)) this.t[y][x] = c; }
  get(x, y) { return this.inb(x, y) ? this.t[y][x] : 't'; }
  rect(x, y, w, h, c) {
    for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) this.set(i, j, c);
  }
  border(c) {
    for (let x = 0; x < this.w; x++) { this.set(x, 0, c); this.set(x, this.h - 1, c); }
    for (let y = 0; y < this.h; y++) { this.set(0, y, c); this.set(this.w - 1, y, c); }
  }
  clearArea(x, y, r, c = 'g') {
    for (let j = y - r; j <= y + r; j++) for (let i = x - r; i <= x + r; i++) if (this.inb(i, j)) this.t[j][i] = c;
  }
  path(points, width = 2, c = 'p') {
    for (let p = 0; p < points.length - 1; p++) {
      const [x0, y0] = points[p], [x1, y1] = points[p + 1];
      const dist = Math.hypot(x1 - x0, y1 - y0);
      const steps = Math.max(1, Math.ceil(dist / .35));
      for (let s = 0; s <= steps; s++) {
        const x = Math.round(x0 + (x1 - x0) * s / steps);
        const y = Math.round(y0 + (y1 - y0) * s / steps);
        const x0b = x - Math.floor(width / 2), y0b = y - Math.floor(width / 2);
        for (let j = 0; j < width; j++) for (let i = 0; i < width; i++) this.set(x0b + i, y0b + j, c);
      }
    }
  }
  blob(cx, cy, rx, ry, c) {
    for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++)
      for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
        const d = ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2;
        if (d <= 1) this.set(x, y, c);
      }
  }
  scatter(x, y, w, h, c, chance, seed, over = this.base) {
    const r = rng(seed);
    for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) {
      if (this.get(i, j) === over && r() < chance) this.set(i, j, c);
    }
  }
}

/* -------------------------------------------------------------------------- */
/* Map definitions                                                            */
/* -------------------------------------------------------------------------- */
function buildAldea() {
  const b = new MB(40, 24, 'g');
  b.border('t');
  b.rect(19, 0, 2, 1, 'p');
  b.rect(19, 1, 2, 8, 'p');
  b.rect(17, 9, 7, 6, 'P');
  b.rect(19, 11, 2, 2, 'w');
  b.rect(3, 11, 14, 2, 'p');
  b.rect(24, 11, 14, 2, 'p');
  b.rect(36, 11, 4, 2, 'p');
  b.rect(39, 11, 1, 3, 'p');
  b.rect(19, 15, 2, 7, 'p');
  b.rect(15, 4, 10, 5, 'S');
  b.rect(19, 7, 2, 2, 's');
  b.rect(6, 6, 7, 4, 'S'); b.rect(12, 8, 1, 1, 's');
  b.rect(27, 6, 6, 4, 'S'); b.rect(29, 8, 1, 1, 's');
  b.rect(6, 16, 7, 4, 'S'); b.rect(9, 18, 1, 1, 's');
  b.scatter(2, 2, 36, 20, 'f', .07, 11);
  b.scatter(2, 2, 36, 20, ',', .05, 12);
  b.scatter(2, 2, 36, 20, 't', .07, 13);
  b.blob(4, 21, 2.4, 1.6, 'w');
  // key clearings
  [[20, 9], [13, 10], [27, 10], [13, 15], [22, 14], [35, 12], [15, 15], [17, 14], [3, 18]].forEach(([x, y]) => b.clearArea(x, y, 1, b.get(x, y) === 'P' ? 'P' : 'g'));
  b.rect(17, 9, 7, 6, 'P');
  b.rect(19, 11, 2, 2, 'w');
  b.rect(19, 15, 2, 7, 'p');
  const objects = [
    npc('elara', 20, 9.5, 'Anciana Elara', 'Guardián del Santuario', { hair: 'largo', hairColor: 'nieve', skin: 'clara', outfit: 'violeta', eyes: 'violeta' }, 'staff'),
    npc('mira', 13.5, 10.5, 'Mira', 'Mercader de Lumen', { hair: 'coleta', hairColor: 'cobre', skin: 'dorada', outfit: 'verde', eyes: 'ambar' }, null, 'shop_mira'),
    npc('torin', 27.5, 10.5, 'Torin', 'Herrero del Alba', { hair: 'rapado', hairColor: 'noche', skin: 'morena', outfit: 'rojo', eyes: 'ambar' }, 'hammer', 'forge'),
    npc('lia', 12.5, 15.5, 'Lía', 'Herbalista', { hair: 'ondulado', hairColor: 'verde', skin: 'clara', outfit: 'blanco', eyes: 'esmeralda' }, null, 'lia'),
    npc('nilo', 22.5, 14.5, 'Nilo', 'Aprendiz de explorador', { hair: 'corto', hairColor: 'oro', skin: 'dorada', outfit: 'azul', eyes: 'zafiro' }, null, 'nilo'),
    npc('roderic', 35.2, 12.5, 'Roderic', 'Guardián del Cañón', { hair: 'corto', hairColor: 'noche', skin: 'profunda', outfit: 'negro', eyes: 'ambar' }, 'spear', 'roderic'),
    { type: 'fountain', id: 'fountain_aldea', x: 19.5, y: 11.5, solid: true },
    { type: 'shrine', id: 'shrine_aldea', x: 15.5, y: 15.5, solid: true },
    { type: 'sign', id: 'sign_aldea', x: 17.3, y: 14.5, solid: true, text: 'Aldea de Lumen. Al norte, el Bosque de los Susurros. Al este, el Cañón de Ceniza (requiere permiso de Roderic).' },
    { type: 'chest', id: 'chest_aldea_1', x: 3.5, y: 18.5, solid: true, loot: { gold: 80, items: { potion_menor: 1, hierba: 1 } } },
    { type: 'gate', id: 'gate_canon', x: 38.2, y: 12.5, solid: true, label: 'Puerta del Cañón' },
    { type: 'brazier', id: 'brazier_aldea_1', x: 16.2, y: 10.5 },
    { type: 'brazier', id: 'brazier_aldea_2', x: 24.8, y: 10.5 },
  ];
  return {
    zone: 'aldea', w: b.w, h: b.h, base: 'g', tiles: b.t, objects,
    exits: [
      { id: 'aldea_north', rect: [19, 0, 2, 1], to: 'bosque', spawn: [3, 27], label: 'Bosque de los Susurros' },
      { id: 'aldea_east', rect: [39, 11, 1, 3], to: 'canon', spawn: [2, 14], label: 'Cañón de Ceniza', requires: 'gate_canon' },
    ],
    spawns: [], wilds: [], bosses: [],
    ambient: { type: 'leaves', color: '#d9c27a' },
  };
}

function buildBosque() {
  const b = new MB(44, 30, 'g');
  b.border('t');
  b.scatter(2, 2, 40, 26, ',', .18, 21);
  b.scatter(2, 2, 40, 26, 't', .13, 22);
  b.scatter(2, 2, 40, 26, 'f', .05, 23);
  b.scatter(2, 2, 40, 26, 'r', .025, 24);
  b.path([[2, 27], [7, 25], [12, 23], [16, 21], [20, 19], [24, 17], [28, 15], [31, 13], [33, 11], [35, 10], [37, 10], [40, 10], [41, 8], [41, 4], [42, 2]], 2, 'p');
  b.rect(2, 27, 2, 2, 'p');
  b.rect(42, 0, 2, 2, 'p');
  b.blob(30, 22, 4, 3, 'w');
  b.rect(30, 23, 1, 1, 'g');
  b.rect(27, 8, 15, 1, 'w');
  b.rect(27, 12, 15, 1, 'w');
  b.set(40, 8, 'b'); b.set(41, 8, 'b');
  b.set(40, 12, 'b'); b.set(41, 12, 'b');
  b.rect(32, 9, 3, 3, 'B');
  b.clearArea(3, 26, 1, 'p');
  b.clearArea(37, 10, 1, 'p');
  b.clearArea(35, 7, 2, 'g');
  b.clearArea(6, 25, 1, 'g');
  b.clearArea(17, 13, 1, 'g');
  b.clearArea(29, 24, 1, 'w');
  const objects = [
    { type: 'shrine', id: 'shrine_bosque', x: 3.5, y: 26.2, solid: true },
    { type: 'sign', id: 'sign_bosque_1', x: 5.5, y: 26.2, solid: true, text: 'Bosque de los Susurros. Las zarzas ancestrales solo temen al fuego. Los espíritus del agua pueden cruzar los arroyos.' },
    { type: 'sign', id: 'sign_bosque_2', x: 31.5, y: 13.5, solid: true, text: 'Más allá del arroyo duerme la Runa del Bosque. Una criatura de fuego puede abrir el paso; una de agua, rodearlo.' },
    { type: 'chest', id: 'chest_bosque_1', x: 17.5, y: 13.5, solid: true, loot: { gold: 70, items: { hierba: 2, potion_menor: 1 } } },
    { type: 'chest', id: 'chest_bosque_2', x: 30.5, y: 23.5, solid: true, requires: 'swim', loot: { gold: 90, items: { potion_mayor: 1, esencia: 1 } } },
    { type: 'chest', id: 'chest_bosque_secret', x: 6.5, y: 25.5, solid: true, hidden: true, requires: 'detect', loot: { gold: 160, items: { talisman_suerte: 1, fragmento: 1 } } },
    { type: 'relic', id: 'relic_runa_bosque', x: 37.5, y: 10.5, solid: true, item: 'runa_bosque', label: 'Runa del Bosque' },
    { type: 'brazier', id: 'brazier_bosque_1', x: 36.5, y: 8.5 },
    { type: 'brazier', id: 'brazier_bosque_2', x: 8.5, y: 24.5 },
    { type: 'crystal', id: 'crystal_bosque_1', x: 14.5, y: 9.5, solid: true, color: '#8fe3a4' },
    { type: 'crystal', id: 'crystal_bosque_2', x: 26.5, y: 21.5, solid: true, color: '#58b9ff' },
  ];
  return {
    zone: 'bosque', w: b.w, h: b.h, base: 'g', tiles: b.t, objects,
    exits: [
      { id: 'bosque_south', rect: [2, 28, 2, 1], to: 'aldea', spawn: [19, 17], label: 'Aldea de Lumen' },
      { id: 'bosque_north', rect: [42, 0, 2, 1], to: 'ruinas', spawn: [2, 25], label: 'Ruinas de Aethel' },
    ],
    spawns: [
      { enemy: 'gelatina', x: 9, y: 23, level: 1 }, { enemy: 'gelatina', x: 15, y: 20, level: 1 },
      { enemy: 'gelatina', x: 21, y: 18, level: 2 }, { enemy: 'gelatina', x: 27, y: 16, level: 2 },
      { enemy: 'gelatina', x: 10, y: 13, level: 2 },
      { enemy: 'lobo', x: 18, y: 9, level: 2 }, { enemy: 'lobo', x: 25, y: 23, level: 2 }, { enemy: 'lobo', x: 35, y: 14, level: 3 },
    ],
    wilds: [
      { id: 'wild_bosque_ignis', creature: 'ignis', x: 12, y: 8, level: 3 },
      { id: 'wild_bosque_aqua', creature: 'aqua', x: 29, y: 24, level: 3 },
      { id: 'wild_bosque_zephyra', creature: 'zephyra', x: 22, y: 13, level: 3 },
      { id: 'wild_bosque_sylva', creature: 'sylva', x: 7, y: 18, level: 3 },
      { id: 'wild_bosque_lumina', creature: 'lumina', x: 35, y: 7, level: 4 },
    ],
    bosses: [],
    ambient: { type: 'fireflies', color: '#c8ff9a' },
  };
}

function buildRuinas() {
  const b = new MB(44, 28, 's');
  b.border('S');
  b.rect(4, 3, 5, 4, 'S'); b.rect(12, 2, 7, 4, 'S'); b.rect(14, 16, 5, 4, 'S');
  b.rect(26, 15, 6, 4, 'S'); b.rect(30, 21, 8, 3, 'S'); b.rect(3, 15, 4, 3, 'S');
  b.rect(2, 26, 2, 2, 's');
  b.rect(2, 24, 40, 2, 's');
  b.rect(8, 8, 2, 17, 's');
  b.rect(8, 12, 35, 2, 's');
  b.rect(22, 5, 2, 20, 's');
  b.rect(22, 6, 21, 2, 's');
  b.rect(34, 5, 2, 20, 's');
  b.rect(30, 2, 12, 5, 's');
  b.rect(42, 12, 2, 2, 's');
  b.rect(8, 18, 2, 2, 'B');
  b.rect(22, 18, 2, 2, 'M');
  b.rect(16, 22, 2, 2, 'H');
  b.set(8, 9, 'R'); b.set(22, 9, 'R');
  b.rect(37, 21, 6, 5, 'v'); b.rect(39, 22, 2, 2, 's');
  b.blob(5, 6, 3, 2, 'w');
  b.scatter(2, 2, 40, 24, 'u', .055, 31);
  b.clearArea(4, 23, 1, 's');
  b.clearArea(18, 23, 1, 's');
  b.clearArea(27, 15, 1, 's');
  b.clearArea(36, 18, 1, 's');
  b.clearArea(36, 5, 2, 's');
  b.clearArea(39, 4, 1, 's');
  const objects = [
    { type: 'shrine', id: 'shrine_ruinas', x: 4.5, y: 22.5, solid: true },
    { type: 'sign', id: 'sign_ruinas_1', x: 6.5, y: 24.5, solid: true, text: 'Ruinas de Aethel. Dos runas dormidas: una bajo zarzas, otra tras el hielo antiguo. El Guardián despierta cuando ambas brillan.' },
    { type: 'rune', id: 'rune_ruinas_1', x: 8.5, y: 9.5, label: 'Runa del Alba', ability: 'switch' },
    { type: 'rune', id: 'rune_ruinas_2', x: 22.5, y: 9.5, label: 'Runa del Ocaso', ability: 'switch' },
    { type: 'chest', id: 'chest_ruinas_1', x: 13.5, y: 22.5, solid: true, loot: { gold: 90, items: { ether: 2, hierro: 1 } } },
    { type: 'chest', id: 'chest_ruinas_2', x: 39.5, y: 22.5, solid: true, requires: 'fly', loot: { gold: 150, items: { cristal_sello_mayor: 1, fragmento: 1 } } },
    { type: 'relic', id: 'relic_runa_aethel', x: 39.5, y: 4.5, solid: true, item: 'runa_aethel', label: 'Runa de Aethel', bossLocked: 'boss_ruinas' },
    { type: 'brazier', id: 'brazier_ruinas_1', x: 11.5, y: 24.5 },
    { type: 'brazier', id: 'brazier_ruinas_2', x: 25.5, y: 24.5 },
    { type: 'brazier', id: 'brazier_ruinas_3', x: 25.5, y: 12.5 },
    { type: 'brazier', id: 'brazier_ruinas_4', x: 33.5, y: 7.5 },
    { type: 'crystal', id: 'crystal_ruinas_1', x: 12.5, y: 13.5, solid: true, color: '#a68bff' },
    { type: 'crystal', id: 'crystal_ruinas_2', x: 30.5, y: 19.5, solid: true, color: '#9fe4ff' },
    { type: 'crystal', id: 'crystal_ruinas_3', x: 37.5, y: 12.5, solid: true, color: '#ffd27a' },
  ];
  return {
    zone: 'ruinas', w: b.w, h: b.h, base: 's', tiles: b.t, objects,
    exits: [
      { id: 'ruinas_south', rect: [2, 27, 2, 1], to: 'bosque', spawn: [40, 3], label: 'Bosque de los Susurros' },
      { id: 'ruinas_east', rect: [43, 12, 1, 2], to: 'canon', spawn: [2, 14], label: 'Cañón de Ceniza' },
    ],
    spawns: [
      { enemy: 'escarabajo', x: 12, y: 24, level: 3 }, { enemy: 'escarabajo', x: 30, y: 13, level: 3 },
      { enemy: 'escarabajo', x: 38, y: 8, level: 4 },
      { enemy: 'espectro', x: 16, y: 12, level: 4 }, { enemy: 'espectro', x: 26, y: 8, level: 4 },
      { enemy: 'espectro', x: 36, y: 14, level: 4 }, { enemy: 'espectro', x: 6, y: 14, level: 4 },
    ],
    wilds: [
      { id: 'wild_ruinas_volt', creature: 'volt', x: 18, y: 23, level: 4 },
      { id: 'wild_ruinas_glacius', creature: 'glacius', x: 27, y: 15, level: 4 },
      { id: 'wild_ruinas_umbra', creature: 'umbra', x: 36, y: 18, level: 4 },
      { id: 'wild_ruinas_zephyra', creature: 'zephyra', x: 14, y: 8, level: 4 },
    ],
    bosses: [
      { id: 'boss_ruinas', enemy: 'guardian', x: 36, y: 5, condition: 'runes2' },
    ],
    ambient: { type: 'dust', color: '#b9b0d8' },
  };
}

function buildCanon() {
  const b = new MB(42, 28, 'd');
  b.border('r');
  b.rect(0, 13, 3, 3, 'p');
  b.path([[2, 14], [10, 14], [18, 14], [21, 12], [21, 7], [21, 2]], 2, 'p');
  b.rect(20, 0, 2, 2, 'p');
  b.rect(0, 19, 42, 3, 'l');
  b.rect(8, 18, 2, 5, 'b'); b.rect(32, 18, 2, 5, 'b');
  b.blob(36, 10, 4, 3, 'l');
  b.rect(33, 22, 7, 4, 'e');
  b.path([[33, 22], [36, 24], [38, 25]], 2, 'p');
  b.rect(16, 9, 2, 2, 'H');
  b.scatter(2, 2, 38, 24, 'r', .07, 41);
  b.scatter(2, 2, 38, 24, 'e', .05, 42);
  b.clearArea(3, 14, 1, 'p');
  b.clearArea(10, 24, 1, 'e');
  b.clearArea(29, 10, 1, 'd');
  b.clearArea(35, 15, 1, 'e');
  b.clearArea(6, 5, 1, 'd');
  b.clearArea(16, 7, 1, 'd');
  b.clearArea(36, 24, 1, 'e');
  const objects = [
    { type: 'shrine', id: 'shrine_canon', x: 3.5, y: 14.5, solid: true },
    { type: 'sign', id: 'sign_canon_1', x: 5.5, y: 13.5, solid: true, text: 'Cañón de Ceniza. Los puentes cruzan la lava; no camines sobre las brasas. Al norte, el Templo Celestial exige las tres runas.' },
    { type: 'chest', id: 'chest_canon_1', x: 5.5, y: 5.5, solid: true, loot: { gold: 140, items: { hierro: 2, cristal_fuego: 1 } } },
    { type: 'chest', id: 'chest_canon_2', x: 24.5, y: 24.5, solid: true, loot: { gold: 120, items: { potion_mayor: 1, pluma: 2 } } },
    { type: 'chest', id: 'chest_canon_3', x: 16.5, y: 6.5, solid: true, requires: 'move', loot: { gold: 180, items: { fragmento: 1, esencia: 2 } } },
    { type: 'relic', id: 'relic_runa_ceniza', x: 36.5, y: 24.5, solid: true, item: 'runa_ceniza', label: 'Runa de Ceniza' },
    { type: 'brazier', id: 'brazier_canon_1', x: 18.5, y: 15.5 },
    { type: 'brazier', id: 'brazier_canon_2', x: 24.5, y: 9.5 },
    { type: 'crystal', id: 'crystal_canon_1', x: 12.5, y: 8.5, solid: true, color: '#ff7a45' },
    { type: 'crystal', id: 'crystal_canon_2', x: 33.5, y: 16.5, solid: true, color: '#ffd27a' },
  ];
  return {
    zone: 'canon', w: b.w, h: b.h, base: 'd', tiles: b.t, objects,
    exits: [
      { id: 'canon_west', rect: [0, 13, 1, 3], to: 'ruinas', spawn: [41, 13], label: 'Ruinas de Aethel' },
      { id: 'canon_north', rect: [20, 0, 2, 1], to: 'templo', spawn: [18, 24], label: 'Templo Celestial', requires: 'runas3' },
    ],
    spawns: [
      { enemy: 'lobo', x: 14, y: 22, level: 5 }, { enemy: 'lobo', x: 25, y: 18, level: 5 },
      { enemy: 'lobo', x: 30, y: 6, level: 5 }, { enemy: 'lobo', x: 38, y: 20, level: 5 },
      { enemy: 'escarabajo', x: 12, y: 8, level: 5 }, { enemy: 'escarabajo', x: 24, y: 24, level: 5 },
      { enemy: 'escarabajo', x: 34, y: 12, level: 5 }, { enemy: 'espectro', x: 18, y: 6, level: 5 },
    ],
    wilds: [
      { id: 'wild_canon_terron', creature: 'terron', x: 10, y: 24, level: 5 },
      { id: 'wild_canon_volt', creature: 'volt', x: 29, y: 10, level: 5 },
      { id: 'wild_canon_ignis', creature: 'ignis', x: 35, y: 15, level: 5 },
      { id: 'wild_canon_glacius', creature: 'glacius', x: 6, y: 5, level: 5 },
    ],
    bosses: [],
    ambient: { type: 'embers', color: '#ff9a55' },
  };
}

function buildTemplo() {
  const b = new MB(36, 26, 's');
  b.border('S');
  b.rect(17, 24, 2, 2, 's');
  b.rect(16, 10, 4, 15, 's');
  b.rect(7, 13, 22, 3, 's');
  b.rect(9, 3, 18, 8, 's');
  b.rect(4, 6, 2, 2, 'S'); b.rect(30, 6, 2, 2, 'S');
  b.rect(4, 16, 2, 2, 'S'); b.rect(30, 16, 2, 2, 'S');
  b.rect(3, 20, 5, 4, 'v'); b.rect(28, 20, 5, 4, 'v');
  b.set(10, 14, 'R'); b.set(18, 15, 'R'); b.set(26, 14, 'R');
  b.set(18, 12, 'A');
  b.clearArea(18, 23, 1, 's');
  b.clearArea(18, 5, 2, 's');
  const objects = [
    { type: 'shrine', id: 'shrine_templo', x: 15.5, y: 22.5, solid: true },
    { type: 'sign', id: 'sign_templo_1', x: 20.5, y: 22.5, solid: true, text: 'Templo Celestial. Las tres runas abren el camino. El altar concede el último vínculo antes del vacío.' },
    { type: 'runeDisplay', id: 'display_bosque', x: 10.5, y: 14.5, rune: 'runa_bosque', color: '#8fe3a4' },
    { type: 'runeDisplay', id: 'display_aethel', x: 18.5, y: 15.5, rune: 'runa_aethel', color: '#a68bff' },
    { type: 'runeDisplay', id: 'display_ceniza', x: 26.5, y: 14.5, rune: 'runa_ceniza', color: '#ff7a45' },
    { type: 'altar', id: 'altar_aether', x: 18.5, y: 12.5, solid: true },
    { type: 'gate', id: 'gate_templo', x: 18.5, y: 10.5, solid: true, label: 'Sello del Vacío', openFlag: 'temple_ready' },
    { type: 'chest', id: 'chest_templo_1', x: 30.5, y: 23.5, solid: true, loot: { gold: 250, items: { elixir: 2, fragmento: 1 } } },
    { type: 'chest', id: 'chest_templo_2', x: 5.5, y: 23.5, solid: true, loot: { gold: 220, items: { potion_mayor: 2, ether: 2 } } },
    { type: 'crystal', id: 'crystal_templo_1', x: 6.5, y: 11.5, solid: true, color: '#fff0a8' },
    { type: 'crystal', id: 'crystal_templo_2', x: 29.5, y: 11.5, solid: true, color: '#a68bff' },
    { type: 'crystal', id: 'crystal_templo_3', x: 10.5, y: 3.5, solid: true, color: '#ffd98a' },
    { type: 'crystal', id: 'crystal_templo_4', x: 25.5, y: 3.5, solid: true, color: '#ffd98a' },
  ];
  return {
    zone: 'templo', w: b.w, h: b.h, base: 's', tiles: b.t, objects,
    exits: [
      { id: 'templo_south', rect: [17, 25, 2, 1], to: 'canon', spawn: [21, 2], label: 'Cañón de Ceniza' },
    ],
    spawns: [],
    wilds: [],
    bosses: [
      { id: 'boss_final', enemy: 'boss', x: 18, y: 5, condition: 'temple_ready' },
    ],
    ambient: { type: 'stars', color: '#fff2c7' },
  };
}

function npc(id, x, y, name, role, appearance, weaponKind = null, dialogue = null) {
  return { type: 'npc', id, x, y, name, role, appearance, weaponKind, dialogue, solid: true };
}

export function buildMaps() {
  return {
    aldea: buildAldea(),
    bosque: buildBosque(),
    ruinas: buildRuinas(),
    canon: buildCanon(),
    templo: buildTemplo(),
  };
}

/* -------------------------------------------------------------------------- */
/* Palettes                                                                   */
/* -------------------------------------------------------------------------- */
const PAL = {
  aldea: {
    grass: '#4b7b4e', grass2: '#5d8e58', grass3: '#3f6a43', path: '#a38357', path2: '#8f7049',
    plaza: '#8c8a8c', plaza2: '#77757a', wall: '#76685c', wall2: '#5a4e45', tree: '#2e5a3c', tree2: '#3c6d47',
    water: '#3a7894', water2: '#5ba3b8', flower: '#f0d27a', tall: '#3d6d43', hedge: '#315f3a',
  },
  bosque: {
    grass: '#2e5a3e', grass2: '#3a6c48', grass3: '#244a33', path: '#7c6242', path2: '#6a5237',
    plaza: '#6e675c', plaza2: '#5c564d', wall: '#4f5548', wall2: '#3a4036', tree: '#1f4630', tree2: '#2d5c3b',
    water: '#2c6375', water2: '#4a93a4', flower: '#d9e88a', tall: '#2c5c3b', hedge: '#224c31',
  },
  ruinas: {
    grass: '#4a4d60', grass2: '#555a70', grass3: '#3f4254', path: '#777b8c', path2: '#666a7b',
    plaza: '#6b6e80', plaza2: '#5b5e70', wall: '#4a4b5c', wall2: '#353645', tree: '#35384a', tree2: '#45485c',
    water: '#334e68', water2: '#4e7793', flower: '#a8a0c8', tall: '#4a4d60', hedge: '#3d3f52',
  },
  canon: {
    grass: '#6c4939', grass2: '#7d5742', grass3: '#5c3d30', path: '#8a6247', path2: '#75513b',
    plaza: '#6f5a4d', plaza2: '#5c493e', wall: '#4f3a31', wall2: '#3b2b24', tree: '#503a2d', tree2: '#654834',
    water: '#b34b2d', water2: '#e0733c', flower: '#e3a05b', tall: '#634435', hedge: '#4c372b',
  },
  templo: {
    grass: '#3d4060', grass2: '#494d70', grass3: '#33354f', path: '#6b6e8c', path2: '#595c78',
    plaza: '#5e6180', plaza2: '#4e516d', wall: '#3f4261', wall2: '#2d2f47', tree: '#33364f', tree2: '#444866',
    water: '#3b3f70', water2: '#646bb0', flower: '#e8ddb0', tall: '#3d4060', hedge: '#363853',
  },
};

/* -------------------------------------------------------------------------- */
/* World                                                                      */
/* -------------------------------------------------------------------------- */
export class World {
  constructor(game) {
    this.game = game;
    this.maps = buildMaps();
    this.zoneKey = null;
    this.map = null;
    this.decor = [];
    this.groundCanvas = null;
    this.weather = [];
    this.time = 0;
    this.lights = [];
    this.tileAnimated = [];
    this.transitionCooldown = 0;
  }

  load(zoneKey, spawnTile) {
    this.zoneKey = zoneKey;
    this.zone = ZONES[zoneKey];
    const baseMap = this.maps[zoneKey];
    this.map = {
      ...baseMap,
      tiles: baseMap.tiles.map(row => row.slice()),
      objects: baseMap.objects.map(o => ({ ...o })),
    };
    this.applyFlags();
    this.buildDecor();
    this.bakeGround();
    this.buildLights();
    this.initWeather();
    this.time = 0;
    this.transitionCooldown = .8;
    if (spawnTile) {
      this.spawn = { x: (spawnTile[0] + .5) * T, y: (spawnTile[1] + .5) * T };
    }
  }

  applyFlags() {
    const flags = this.game.state?.flags || {};
    for (const o of this.map.objects) {
      if (o.type === 'obstacle') {
        if (flags[`obstacle:${this.zoneKey}:${o.tx},${o.ty}`]) o.cleared = true;
      }
      if (o.type === 'chest' && flags[`chest:${o.id}`]) o.opened = true;
      if (o.type === 'relic' && flags[`relic:${o.id}`]) o.taken = true;
      if (o.type === 'gate' && (flags[`gate:${o.id}`] || (o.openFlag && flags[o.openFlag]))) o.open = true;
      if (o.type === 'rune' && flags[`rune:${o.id}`]) o.active = true;
      if (o.type === 'runeDisplay') o.active = !!flags[`rune_taken:${o.rune}`] || !!flags[`relic:relic_${o.rune}`];
    }
    // Generate obstacle objects from tiles
    for (let y = 0; y < this.map.h; y++) for (let x = 0; x < this.map.w; x++) {
      const ch = this.map.tiles[y][x];
      if (ch === 'B' || ch === 'M' || ch === 'H') {
        const key = `obstacle:${this.zoneKey}:${x},${y}`;
        if (flags[key]) {
          this.map.tiles[y][x] = this.map.base;
        } else {
          this.map.objects.push({
            type: 'obstacle', id: `obs_${this.zoneKey}_${x}_${y}`, tx: x, ty: y,
            x: x + .5, y: y + .5, ability: ch === 'B' ? 'burn' : ch === 'M' ? 'freeze' : 'move',
            tile: ch, floor: this.map.base, solid: false,
          });
        }
      }
    }
  }

  buildDecor() {
    this.decor = [];
    const p = PAL[this.zoneKey] || PAL.aldea;
    for (let y = 0; y < this.map.h; y++) for (let x = 0; x < this.map.w; x++) {
      const ch = this.map.tiles[y][x];
      const h = hash(x, y, 3);
      if (ch === 't') {
        this.decor.push({
          kind: 'tree', tx: x, ty: y, x: x + .5, y: y + .5,
          sortY: (y + 1) * T + 6, variant: Math.floor(h * 4), phase: h * 6.28,
          canopy: p.tree, canopy2: p.tree2,
        });
      } else if (ch === 'r') {
        this.decor.push({ kind: 'rock', tx: x, ty: y, x: x + .5, y: y + .5, sortY: (y + 1) * T, variant: Math.floor(h * 3), color: p.wall2 });
      } else if (ch === 'c') {
        this.decor.push({ kind: 'crystal', tx: x, ty: y, x: x + .5, y: y + .5, sortY: (y + 1) * T, color: p.water2 });
      } else if (ch === 'e') {
        this.decor.push({ kind: 'ember', tx: x, ty: y, x: x + .5, y: y + .5, sortY: 0, phase: h * 6.28 });
      }
    }
    // obstacle decor
    for (const o of this.map.objects) {
      if (o.type === 'obstacle' && !o.cleared) {
        this.decor.push({ kind: 'obstacle', obj: o, tx: o.tx, ty: o.ty, x: o.x, y: o.y, sortY: (o.ty + 1) * T });
      }
    }
    this.decor.sort((a, b) => a.sortY - b.sortY);
  }

  buildLights() {
    this.lights = [];
    const add = (x, y, r, color, intensity = .8) => this.lights.push({ x: x * T, y: y * T, r, color, intensity });
    for (const o of this.map.objects) {
      if (o.type === 'shrine') add(o.x, o.y, 150, '#ffd98a', .85);
      if (o.type === 'brazier') add(o.x, o.y, 130, '#ff9a55', .7);
      if (o.type === 'crystal') add(o.x, o.y, 120, o.color || '#7fb4ff', .6);
      if (o.type === 'altar') add(o.x, o.y, 200, '#ffd98a', .9);
      if (o.type === 'rune' && o.active) add(o.x, o.y, 150, '#ffd27a', .8);
      if (o.type === 'relic' && !o.taken) add(o.x, o.y, 110, '#ffd27a', .55);
      if (o.type === 'fountain') add(o.x, o.y, 110, '#6fe8d4', .5);
      if (o.type === 'gate' && !o.open) add(o.x, o.y, 80, '#a68bff', .4);
    }
    // ambient crystals from decor
    for (const d of this.decor) if (d.kind === 'crystal') add(d.x, d.y, 100, d.color || '#7fb4ff', .45);
  }

  initWeather() {
    const type = this.map.ambient?.type || 'dust';
    const count = type === 'stars' ? 70 : type === 'fireflies' ? 45 : 55;
    this.weather = [];
    for (let i = 0; i < count; i++) {
      this.weather.push(this._newParticle(type, true));
    }
  }

  _newParticle(type, initial = false) {
    const player = this.game.player;
    const cx = player ? player.x : (this.map.w * T) / 2;
    const cy = player ? player.y : (this.map.h * T) / 2;
    const w = (this.game.viewW || 1100) + 300, h = (this.game.viewH || 650) + 300;
    const x = cx + (Math.random() - .5) * w;
    const y = cy + (Math.random() - .5) * h;
    const base = { type, x, y, phase: Math.random() * 6.28, alpha: .4 + Math.random() * .5 };
    if (type === 'leaves') return { ...base, vx: 12 + Math.random() * 22, vy: 8 + Math.random() * 12, size: 2 + Math.random() * 3, rot: Math.random() * 6.28, spin: (Math.random() - .5) * 2 };
    if (type === 'fireflies') return { ...base, vx: (Math.random() - .5) * 12, vy: (Math.random() - .5) * 12, size: 1.2 + Math.random() * 1.8 };
    if (type === 'dust') return { ...base, vx: 2 + Math.random() * 6, vy: -2 - Math.random() * 5, size: 1 + Math.random() * 2 };
    if (type === 'embers') return { ...base, vx: (Math.random() - .5) * 10, vy: -16 - Math.random() * 26, size: 1 + Math.random() * 2.2 };
    return { ...base, vx: (Math.random() - .5) * 3, vy: (Math.random() - .5) * 3, size: .8 + Math.random() * 1.8 };
  }

  update(dt, player, camera) {
    this.time += dt;
    if (this.transitionCooldown > 0) this.transitionCooldown -= dt;
    for (let i = 0; i < this.weather.length; i++) {
      const p = this.weather[i];
      p.x += p.vx * dt; p.y += p.vy * dt;
      p.phase += dt * 2;
      if (p.type === 'leaves') { p.rot += p.spin * dt; p.x += Math.sin(p.phase) * 8 * dt; }
      if (p.type === 'fireflies') { p.x += Math.sin(p.phase * 1.3) * 10 * dt; p.y += Math.cos(p.phase) * 10 * dt; }
      if (p.type === 'stars') { p.y += Math.sin(p.phase) * 2 * dt; }
      const margin = 220;
      if (p.x < camera.x - margin || p.x > camera.x + camera.w + margin || p.y < camera.y - margin || p.y > camera.y + camera.h + margin) {
        this.weather[i] = this._newParticle(p.type);
      }
    }
  }

  /* ---------------------------------------------------------------------- */
  /* Collision                                                              */
  /* ---------------------------------------------------------------------- */
  tileAt(tx, ty) {
    if (tx < 0 || ty < 0 || tx >= this.map.w || ty >= this.map.h) return 't';
    return this.map.tiles[ty][tx];
  }
  tileAtPx(px, py) {
    return this.tileAt(Math.floor(px / T), Math.floor(py / T));
  }

  isTileSolid(tx, ty, abilities = []) {
    const ch = this.tileAt(tx, ty);
    if (ch === 'w' || ch === 'W') return !abilities.includes('swim');
    if (ch === 'v') return !abilities.includes('fly');
    return SOLID.has(ch);
  }

  collidesCircle(x, y, r, abilities = []) {
    const x0 = Math.floor((x - r) / T), x1 = Math.floor((x + r) / T);
    const y0 = Math.floor((y - r) / T), y1 = Math.floor((y + r) / T);
    for (let ty = y0; ty <= y1; ty++) for (let tx = x0; tx <= x1; tx++) {
      if (this.isTileSolid(tx, ty, abilities)) {
        // circle vs tile AABB
        const cx = Math.max(tx * T, Math.min(x, (tx + 1) * T));
        const cy = Math.max(ty * T, Math.min(y, (ty + 1) * T));
        if ((x - cx) ** 2 + (y - cy) ** 2 < r * r) return true;
      }
    }
    for (const o of this.map.objects) {
      if (!this._objectSolid(o)) continue;
      const ox = o.x * T, oy = o.y * T;
      const half = o.type === 'fountain' ? 30 : o.type === 'altar' ? 28 : o.type === 'shrine' ? 20 : 17;
      const cx = Math.max(ox - half, Math.min(x, ox + half));
      const cy = Math.max(oy - half, Math.min(y, oy + half));
      if ((x - cx) ** 2 + (y - cy) ** 2 < r * r) return true;
    }
    return false;
  }

  _objectSolid(o) {
    if (o.cleared || o.taken) return false;
    if (o.type === 'gate') return !o.open;
    if (o.type === 'chest') return true;
    if (o.type === 'relic') return !o.taken;
    if (o.type === 'obstacle') return false;
    return !!o.solid;
  }

  moveEntity(ent, dx, dy, abilities = []) {
    const r = ent.radius || 14;
    let movedX = false, movedY = false;
    if (dx) {
      if (!this.collidesCircle(ent.x + dx, ent.y, r, abilities)) { ent.x += dx; movedX = true; }
      else {
        // slide small steps
        const step = Math.sign(dx);
        for (let i = 1; i <= Math.abs(dx); i++) {
          if (!this.collidesCircle(ent.x + step, ent.y, r, abilities)) { ent.x += step; movedX = true; } else break;
        }
      }
    }
    if (dy) {
      if (!this.collidesCircle(ent.x, ent.y + dy, r, abilities)) { ent.y += dy; movedY = true; }
      else {
        const step = Math.sign(dy);
        for (let i = 1; i <= Math.abs(dy); i++) {
          if (!this.collidesCircle(ent.x, ent.y + step, r, abilities)) { ent.y += step; movedY = true; } else break;
        }
      }
    }
    ent.x = Math.max(T * .4, Math.min((this.map.w - .4) * T, ent.x));
    ent.y = Math.max(T * .4, Math.min((this.map.h - .4) * T, ent.y));
    return { movedX, movedY };
  }

  /* ---------------------------------------------------------------------- */
  /* Interaction                                                            */
  /* ---------------------------------------------------------------------- */
  findInteractable(px, py, radius = 74, abilities = []) {
    let best = null, bestD = Infinity;
    for (const o of this.map.objects) {
      if (o.taken || o.cleared) continue;
      if (o.type === 'chest' && o.opened) continue;
      if (o.type === 'obstacle' && !o.cleared) {
        // handled below with ability hint
      }
      if (o.type === 'gate' && o.open) continue;
      if (o.type === 'relic' && o.taken) continue;
      if (o.type === 'chest' && o.hidden && !abilities.includes(o.requires)) continue;
      if (o.type === 'npc' || o.type === 'chest' || o.type === 'shrine' || o.type === 'sign' || o.type === 'relic' || o.type === 'rune' || o.type === 'altar' || o.type === 'gate' || o.type === 'obstacle' || o.type === 'runeDisplay') {
        const d = Math.hypot(o.x * T - px, o.y * T - py);
        if (d < radius && d < bestD) { best = o; bestD = d; }
      }
    }
    return best;
  }

  getExitAt(px, py) {
    for (const e of this.map.exits) {
      const [x, y, w, h] = e.rect;
      if (px >= x * T && px <= (x + w) * T && py >= y * T && py <= (y + h) * T) return e;
    }
    return null;
  }

  clearObstacle(obj) {
    obj.cleared = true;
    const tx = obj.tx, ty = obj.ty;
    this.map.tiles[ty][tx] = obj.floor;
    this.decor = this.decor.filter(d => d.obj !== obj);
    this.paintTile(tx, ty, obj.floor);
    this.buildLights();
  }

  /* ---------------------------------------------------------------------- */
  /* Ground baking / rendering                                              */
  /* ---------------------------------------------------------------------- */
  bakeGround() {
    const c = document.createElement('canvas');
    c.width = this.map.w * T; c.height = this.map.h * T;
    const g = c.getContext('2d');
    for (let y = 0; y < this.map.h; y++) for (let x = 0; x < this.map.w; x++) {
      this.paintTileTo(g, x, y, this.map.tiles[y][x]);
    }
    this.groundCanvas = c;
  }

  paintTile(tx, ty, ch) {
    if (!this.groundCanvas) return;
    const g = this.groundCanvas.getContext('2d');
    this.paintTileTo(g, tx, ty, ch);
  }

  paintTileTo(g, tx, ty, ch) {
    const p = PAL[this.zoneKey] || PAL.aldea;
    const x = tx * T, y = ty * T;
    const h = hash(tx, ty, 7);
    const h2 = hash(tx, ty, 11);
    switch (ch) {
      case 'g': case 'G': {
        g.fillStyle = h > .5 ? p.grass : p.grass2;
        g.fillRect(x, y, T, T);
        // blades
        g.strokeStyle = p.grass3; g.lineWidth = 1; g.globalAlpha = .45;
        for (let i = 0; i < 4; i++) {
          const bx = x + 6 + hash(tx, ty, i + 20) * 36;
          const by = y + 10 + hash(tx, ty, i + 30) * 30;
          g.beginPath(); g.moveTo(bx, by); g.lineTo(bx + 2, by - 4); g.stroke();
        }
        g.globalAlpha = 1;
        if (h2 > .86) {
          g.fillStyle = p.flower;
          g.globalAlpha = .8;
          for (let i = 0; i < 3; i++) {
            const fx = x + 12 + hash(tx, ty, i + 40) * 24;
            const fy = y + 12 + hash(tx, ty, i + 50) * 24;
            g.beginPath(); g.arc(fx, fy, 1.6, 0, 6.28); g.fill();
          }
          g.globalAlpha = 1;
        }
        break;
      }
      case ',': {
        g.fillStyle = p.tall; g.fillRect(x, y, T, T);
        g.strokeStyle = p.grass2; g.lineWidth = 1.4; g.globalAlpha = .8;
        for (let i = 0; i < 9; i++) {
          const bx = x + 5 + hash(tx, ty, i + 60) * 38;
          const by = y + 14 + hash(tx, ty, i + 70) * 28;
          g.beginPath(); g.moveTo(bx, by); g.quadraticCurveTo(bx + 3, by - 8, bx + 6, by - 13); g.stroke();
        }
        g.globalAlpha = 1;
        break;
      }
      case 'p': {
        g.fillStyle = h > .5 ? p.path : p.path2;
        g.fillRect(x, y, T, T);
        g.fillStyle = 'rgba(255,255,255,.06)';
        for (let i = 0; i < 5; i++) {
          const px = x + 4 + hash(tx, ty, i + 80) * 40;
          const py = y + 4 + hash(tx, ty, i + 90) * 40;
          g.beginPath(); g.arc(px, py, 1 + h2 * 1.5, 0, 6.28); g.fill();
        }
        break;
      }
      case 'P': {
        g.fillStyle = (tx + ty) % 2 ? p.plaza : p.plaza2;
        g.fillRect(x, y, T, T);
        g.strokeStyle = 'rgba(20,20,30,.25)'; g.lineWidth = 1;
        g.strokeRect(x + .5, y + .5, T - 1, T - 1);
        g.fillStyle = 'rgba(255,255,255,.05)';
        g.fillRect(x + 3, y + 3, T - 6, 2);
        break;
      }
      case 's': {
        g.fillStyle = (tx + ty) % 2 ? p.plaza : p.plaza2;
        g.fillRect(x, y, T, T);
        g.strokeStyle = 'rgba(10,12,22,.28)'; g.lineWidth = 1;
        g.strokeRect(x + .5, y + .5, T - 1, T - 1);
        if (h > .78) {
          g.strokeStyle = 'rgba(255,255,255,.09)'; g.beginPath();
          g.moveTo(x + 8, y + 10); g.lineTo(x + 16, y + 20); g.lineTo(x + 13, y + 30); g.stroke();
        }
        break;
      }
      case 'd': {
        g.fillStyle = h > .5 ? p.grass : p.grass2;
        g.fillRect(x, y, T, T);
        g.fillStyle = 'rgba(255,255,255,.04)';
        for (let i = 0; i < 3; i++) g.fillRect(x + 6 + h * 30, y + 8 + i * 13, 6, 2);
        break;
      }
      case 'S': {
        g.fillStyle = p.wall2; g.fillRect(x, y, T, T);
        g.fillStyle = p.wall; g.fillRect(x + 2, y + 2, T - 4, T - 8);
        g.strokeStyle = 'rgba(0,0,0,.3)'; g.lineWidth = 1;
        g.strokeRect(x + 2.5, y + 2.5, T - 5, T - 9);
        g.fillStyle = 'rgba(255,255,255,.1)'; g.fillRect(x + 4, y + 4, T - 8, 3);
        // bricks
        g.strokeStyle = 'rgba(0,0,0,.18)';
        g.beginPath(); g.moveTo(x + 16, y + 3); g.lineTo(x + 16, y + 26); g.stroke();
        g.beginPath(); g.moveTo(x + 32, y + 22); g.lineTo(x + 32, y + 43); g.stroke();
        break;
      }
      case 't': {
        g.fillStyle = p.grass; g.fillRect(x, y, T, T);
        break;
      }
      case 'r': {
        g.fillStyle = p.grass; g.fillRect(x, y, T, T);
        g.fillStyle = 'rgba(0,0,0,.08)'; g.beginPath(); g.arc(x + T / 2, y + T / 2 + 5, 16, 0, 6.28); g.fill();
        break;
      }
      case 'w': case 'W': {
        g.fillStyle = p.water; g.fillRect(x, y, T, T);
        g.fillStyle = p.water2; g.globalAlpha = .25;
        for (let i = 0; i < 3; i++) {
          g.beginPath();
          g.ellipse(x + 8 + i * 15 + Math.sin(hash(tx, ty, i) * 6) * 3, y + 12 + i * 12, 8, 2.2, 0, 0, 6.28);
          g.fill();
        }
        g.globalAlpha = 1;
        break;
      }
      case 'b': {
        g.fillStyle = '#7b5a36'; g.fillRect(x, y, T, T);
        g.strokeStyle = '#5c4026'; g.lineWidth = 2;
        for (let i = 0; i < 5; i++) { g.beginPath(); g.moveTo(x + 4 + i * 10, y + 2); g.lineTo(x + 4 + i * 10, y + T - 2); g.stroke(); }
        g.fillStyle = 'rgba(255,255,255,.1)'; g.fillRect(x, y + 4, T, 2);
        break;
      }
      case 'l': {
        const lg = g.createLinearGradient(x, y, x, y + T);
        lg.addColorStop(0, '#d2572b'); lg.addColorStop(.5, '#ff8a3c'); lg.addColorStop(1, '#a8321c');
        g.fillStyle = lg; g.fillRect(x, y, T, T);
        g.fillStyle = 'rgba(255,220,120,.35)';
        g.beginPath(); g.ellipse(x + 12 + h * 24, y + 14 + h2 * 20, 9, 3, 0, 0, 6.28); g.fill();
        break;
      }
      case 'v': {
        g.fillStyle = '#0a0818'; g.fillRect(x, y, T, T);
        g.fillStyle = 'rgba(140,110,255,.25)';
        for (let i = 0; i < 3; i++) {
          g.beginPath(); g.arc(x + 8 + hash(tx, ty, i) * 32, y + 8 + hash(tx, ty, i + 5) * 32, 1 + h, 0, 6.28); g.fill();
        }
        break;
      }
      case 'i': {
        g.fillStyle = '#9fdcf0'; g.fillRect(x, y, T, T);
        g.strokeStyle = 'rgba(255,255,255,.5)'; g.lineWidth = 1;
        g.beginPath(); g.moveTo(x + 6, y + 10); g.lineTo(x + 20, y + 24); g.lineTo(x + 16, y + 38); g.stroke();
        break;
      }
      case 'u': {
        g.fillStyle = p.plaza2; g.fillRect(x, y, T, T);
        g.fillStyle = 'rgba(180,180,200,.18)';
        for (let i = 0; i < 4; i++) g.fillRect(x + 6 + hash(tx, ty, i) * 30, y + 8 + hash(tx, ty, i + 3) * 28, 5 + h * 6, 3);
        break;
      }
      case 'e': {
        g.fillStyle = '#5b3a2e'; g.fillRect(x, y, T, T);
        g.fillStyle = 'rgba(255,130,60,.22)';
        g.beginPath(); g.arc(x + T / 2, y + T / 2, 14 + h * 6, 0, 6.28); g.fill();
        g.fillStyle = 'rgba(255,210,120,.4)';
        g.beginPath(); g.arc(x + 16 + h * 16, y + 20 + h2 * 12, 1.6, 0, 6.28); g.fill();
        break;
      }
      case 'h': {
        g.fillStyle = p.hedge; g.fillRect(x, y, T, T);
        g.fillStyle = 'rgba(255,255,255,.08)';
        g.beginPath(); g.arc(x + 14, y + 16, 9, 0, 6.28); g.fill();
        g.beginPath(); g.arc(x + 32, y + 28, 8, 0, 6.28); g.fill();
        break;
      }
      case 'B': case 'M': case 'H': case 'R': case 'A': case 'c': {
        g.fillStyle = p.grass; g.fillRect(x, y, T, T);
        if (ch === 'R') {
          g.strokeStyle = 'rgba(242,209,136,.5)'; g.lineWidth = 1.6;
          g.beginPath(); g.arc(x + T / 2, y + T / 2, 15, 0, 6.28); g.stroke();
          g.beginPath(); g.arc(x + T / 2, y + T / 2, 9, 0, 6.28); g.stroke();
          for (let i = 0; i < 4; i++) {
            const a = i * Math.PI / 2 + .4;
            g.beginPath(); g.moveTo(x + T / 2 + Math.cos(a) * 8, y + T / 2 + Math.sin(a) * 8);
            g.lineTo(x + T / 2 + Math.cos(a) * 15, y + T / 2 + Math.sin(a) * 15); g.stroke();
          }
        }
        break;
      }
      default: {
        g.fillStyle = p.grass; g.fillRect(x, y, T, T);
      }
    }
  }

  /* ---------------------------------------------------------------------- */
  /* Drawables & object rendering                                           */
  /* ---------------------------------------------------------------------- */
  visible(x, y, camera, margin = 130) {
    return x > camera.x - margin && x < camera.x + camera.w + margin && y > camera.y - margin && y < camera.y + camera.h + margin;
  }

  getDrawables(camera, abilities = []) {
    const list = [];
    for (const d of this.decor) {
      if (!this.visible(d.x * T, d.y * T, camera)) continue;
      if (d.kind === 'obstacle') {
        list.push({ sortY: d.sortY, draw: ctx => this.drawObstacle(ctx, d.obj) });
      } else if (d.kind === 'tree') list.push({ sortY: d.sortY, draw: ctx => this.drawTree(ctx, d) });
      else if (d.kind === 'rock') list.push({ sortY: d.sortY, draw: ctx => this.drawRock(ctx, d) });
      else if (d.kind === 'crystal') list.push({ sortY: d.sortY, draw: ctx => this.drawCrystal(ctx, d) });
      else if (d.kind === 'ember') list.push({ sortY: 0, draw: ctx => this.drawEmber(ctx, d) });
    }
    for (const o of this.map.objects) {
      if (o.cleared || o.taken) continue;
      if (!this.visible(o.x * T, o.y * T, camera)) continue;
      if (o.type === 'obstacle') continue;
      if (o.type === 'chest' && o.hidden && !abilities.includes(o.requires)) continue;
      const sortY = (o.y + .5) * T;
      list.push({ sortY, draw: ctx => this.drawObject(ctx, o, abilities) });
    }
    list.sort((a, b) => a.sortY - b.sortY);
    return list;
  }

  drawTree(ctx, d) {
    const x = d.x * T, y = d.y * T;
    const sway = Math.sin(this.time * 1.2 + d.phase) * 2.2;
    ctx.save();
    // trunk
    ctx.fillStyle = '#4a3323';
    ctx.beginPath(); ctx.moveTo(x - 5, y + 10); ctx.lineTo(x - 3, y - 34); ctx.lineTo(x + 3, y - 34); ctx.lineTo(x + 5, y + 10); ctx.fill();
    // canopy layers
    const c1 = d.canopy, c2 = d.canopy2;
    const g = ctx.createRadialGradient(x - 10 + sway, y - 62, 4, x, y - 50, 38);
    g.addColorStop(0, lighten(c2, 22)); g.addColorStop(.55, c1); g.addColorStop(1, darken(c1, 24));
    ctx.fillStyle = g;
    const r = 30 + d.variant * 3;
    ctx.beginPath(); ctx.arc(x + sway, y - 58, r, 0, 6.28); ctx.fill();
    ctx.beginPath(); ctx.arc(x - r * .65 + sway * .6, y - 42, r * .7, 0, 6.28); ctx.fill();
    ctx.beginPath(); ctx.arc(x + r * .65 + sway * .6, y - 44, r * .66, 0, 6.28); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.12)';
    ctx.beginPath(); ctx.arc(x - r * .32 + sway, y - 66, r * .3, 0, 6.28); ctx.fill();
    ctx.restore();
  }

  drawRock(ctx, d) {
    const x = d.x * T, y = d.y * T;
    const s = 13 + d.variant * 3;
    ctx.save();
    ctx.fillStyle = d.color;
    ctx.beginPath();
    ctx.moveTo(x - s, y + 8); ctx.lineTo(x - s * .8, y - s * .6);
    ctx.lineTo(x - s * .1, y - s); ctx.lineTo(x + s * .8, y - s * .45);
    ctx.lineTo(x + s, y + 8); ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.14)';
    ctx.beginPath(); ctx.moveTo(x - s * .6, y - s * .4); ctx.lineTo(x - s * .1, y - s); ctx.lineTo(x + s * .3, y - s * .5); ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(0,0,0,.2)'; ctx.beginPath(); ctx.ellipse(x, y + 8, s, 4, 0, 0, 6.28); ctx.fill();
    ctx.restore();
  }

  drawCrystal(ctx, d) {
    const x = d.x * T, y = d.y * T;
    const color = d.color || '#7fb4ff';
    const pulse = .7 + Math.sin(this.time * 2 + d.x) * .2;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const g = ctx.createRadialGradient(x, y - 22, 2, x, y - 22, 44);
    g.addColorStop(0, hexA(color, .32 * pulse)); g.addColorStop(1, 'transparent');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y - 22, 44, 0, 6.28); ctx.fill();
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = color;
    ctx.beginPath(); ctx.moveTo(x - 9, y + 8); ctx.lineTo(x - 5, y - 30); ctx.lineTo(x + 2, y - 44); ctx.lineTo(x + 9, y - 24); ctx.lineTo(x + 7, y + 8); ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.45)';
    ctx.beginPath(); ctx.moveTo(x - 2, y + 2); ctx.lineTo(x + 1, y - 38); ctx.lineTo(x + 4, y - 26); ctx.lineTo(x + 2, y + 2); ctx.closePath(); ctx.fill();
    ctx.restore();
  }

  drawEmber(ctx, d) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const a = .25 + Math.sin(this.time * 3 + d.phase) * .12;
    ctx.fillStyle = `rgba(255,140,70,${a})`;
    ctx.beginPath(); ctx.ellipse(d.x * T, d.y * T, 18, 6, 0, 0, 6.28); ctx.fill();
    ctx.restore();
  }

  drawObstacle(ctx, o) {
    if (o.cleared) return;
    const x = o.x * T, y = o.y * T;
    ctx.save();
    if (o.tile === 'B') {
      ctx.fillStyle = '#2a3d26';
      for (let i = 0; i < 5; i++) {
        const a = i * 1.3;
        ctx.beginPath(); ctx.ellipse(x + Math.cos(a) * 14, y - 6 + Math.sin(a) * 8, 11, 7, a, 0, 6.28); ctx.fill();
      }
      ctx.strokeStyle = '#5c3a2a'; ctx.lineWidth = 2.2;
      for (let i = 0; i < 5; i++) {
        const a = i * 1.7;
        ctx.beginPath(); ctx.moveTo(x, y + 2); ctx.lineTo(x + Math.cos(a) * 22, y - 18 + Math.sin(a) * 12); ctx.stroke();
      }
      ctx.fillStyle = '#d95a5a';
      for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.arc(x + Math.cos(i * 2) * 15, y - 10 + Math.sin(i * 2) * 8, 2, 0, 6.28); ctx.fill(); }
    } else if (o.tile === 'M') {
      ctx.fillStyle = '#7fc8e8';
      ctx.beginPath(); ctx.moveTo(x - 12, y + 6); ctx.lineTo(x - 9, y - 34); ctx.lineTo(x, y - 46); ctx.lineTo(x + 9, y - 34); ctx.lineTo(x + 12, y + 6); ctx.closePath(); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,.5)';
      ctx.beginPath(); ctx.moveTo(x - 3, y + 2); ctx.lineTo(x, y - 40); ctx.lineTo(x + 4, y - 28); ctx.lineTo(x + 3, y + 2); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = 'rgba(200,245,255,.7)'; ctx.lineWidth = 1.4;
      ctx.beginPath(); ctx.arc(x, y - 18, 20, 0, 6.28); ctx.stroke();
    } else {
      ctx.fillStyle = '#6b6577';
      ctx.fillRect(x - 19, y - 32, 38, 38);
      ctx.fillStyle = '#4b4658'; ctx.fillRect(x - 19, y - 32, 38, 6);
      ctx.strokeStyle = '#9b8fd0'; ctx.lineWidth = 1.4;
      ctx.strokeRect(x - 14, y - 26, 28, 26);
      ctx.beginPath(); ctx.arc(x, y - 13, 8, 0, 6.28); ctx.stroke();
    }
    ctx.restore();
  }

  drawObject(ctx, o, abilities = []) {
    const x = o.x * T, y = o.y * T;
    switch (o.type) {
      case 'npc': {
        drawHumanoid(ctx, {
          x, y: y + 8, time: this.time, facing: 'down', walk: 0,
          appearance: resolveAppearance(o.appearance),
          weapon: o.weaponKind ? { kind: o.weaponKind } : null,
          shield: o.weaponKind === 'spear',
          cape: o.id === 'elara' || o.id === 'roderic',
          aura: o.id === 'elara' ? 'rgba(166,139,255,.22)' : null,
        });
        break;
      }
      case 'chest': {
        const open = o.opened;
        ctx.save();
        if (!open) {
          ctx.globalCompositeOperation = 'lighter';
          const g = ctx.createRadialGradient(x, y - 10, 2, x, y - 10, 34);
          g.addColorStop(0, 'rgba(242,209,136,.25)'); g.addColorStop(1, 'transparent');
          ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y - 10, 34, 0, 6.28); ctx.fill();
          ctx.globalCompositeOperation = 'source-over';
        }
        ctx.fillStyle = open ? '#3d3227' : '#6b4a2c';
        ctx.fillRect(x - 18, y - 24, 36, 24);
        ctx.fillStyle = '#8d6438'; ctx.fillRect(x - 18, y - 24, 36, 5);
        ctx.strokeStyle = '#d9b15f'; ctx.lineWidth = 2; ctx.strokeRect(x - 17, y - 23, 34, 22);
        ctx.fillStyle = '#e8c979';
        ctx.fillRect(x - 3, y - 18, 6, 8);
        if (!open) {
          ctx.fillStyle = '#7a532f'; ctx.beginPath(); ctx.ellipse(x, y - 24, 18, 7, 0, Math.PI, 0); ctx.fill();
          ctx.strokeStyle = '#d9b15f'; ctx.stroke();
        } else {
          ctx.fillStyle = '#2a2118'; ctx.fillRect(x - 15, y - 23, 30, 6);
        }
        ctx.restore();
        break;
      }
      case 'shrine': {
        const pulse = .75 + Math.sin(this.time * 2) * .2;
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        const g = ctx.createRadialGradient(x, y - 34, 2, x, y - 34, 52);
        g.addColorStop(0, `rgba(255,225,150,${.3 * pulse})`); g.addColorStop(1, 'transparent');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y - 34, 52, 0, 6.28); ctx.fill();
        ctx.globalCompositeOperation = 'source-over';
        ctx.fillStyle = '#6b6a7c'; ctx.beginPath(); ctx.ellipse(x, y + 6, 20, 6, 0, 0, 6.28); ctx.fill();
        ctx.fillStyle = '#4c4b5c'; ctx.fillRect(x - 6, y - 20, 12, 26);
        ctx.fillStyle = '#ffe9a8';
        ctx.beginPath(); ctx.moveTo(x, y - 50); ctx.lineTo(x + 8, y - 34); ctx.lineTo(x, y - 18); ctx.lineTo(x - 8, y - 34); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = 'rgba(255,240,190,.6)'; ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.ellipse(x, y - 34, 18 + Math.sin(this.time * 2) * 3, 6, .2, 0, 6.28); ctx.stroke();
        ctx.restore();
        break;
      }
      case 'sign': {
        ctx.fillStyle = '#5b3e27'; ctx.fillRect(x - 3, y - 18, 6, 26);
        ctx.fillStyle = '#8a6238'; ctx.fillRect(x - 16, y - 34, 32, 18);
        ctx.strokeStyle = '#d2ac68'; ctx.lineWidth = 1; ctx.strokeRect(x - 15, y - 33, 30, 16);
        ctx.fillStyle = 'rgba(255,240,200,.4)';
        ctx.fillRect(x - 11, y - 29, 22, 1.5); ctx.fillRect(x - 11, y - 25, 16, 1.5);
        break;
      }
      case 'gate': {
        ctx.save();
        ctx.fillStyle = '#4a4658';
        ctx.fillRect(x - 24, y - 46, 8, 54); ctx.fillRect(x + 16, y - 46, 8, 54);
        ctx.fillStyle = '#6b667c';
        ctx.fillRect(x - 26, y - 50, 12, 8); ctx.fillRect(x + 14, y - 50, 12, 8);
        if (!o.open) {
          ctx.strokeStyle = '#a68bff'; ctx.globalAlpha = .8;
          for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(x - 14 + i * 9, y - 44); ctx.lineTo(x - 14 + i * 9, y + 4); ctx.stroke(); }
          ctx.globalAlpha = .25; ctx.fillStyle = '#a68bff'; ctx.fillRect(x - 16, y - 44, 32, 48);
        }
        ctx.restore();
        break;
      }
      case 'relic': {
        const bob = Math.sin(this.time * 2.2) * 4;
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        const g = ctx.createRadialGradient(x, y - 28 + bob, 2, x, y - 28 + bob, 46);
        g.addColorStop(0, 'rgba(255,230,150,.4)'); g.addColorStop(1, 'transparent');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y - 28 + bob, 46, 0, 6.28); ctx.fill();
        ctx.globalCompositeOperation = 'source-over';
        ctx.fillStyle = '#4c4b5c'; ctx.fillRect(x - 7, y - 6, 14, 14);
        ctx.fillStyle = '#ffe9a8';
        ctx.beginPath(); ctx.moveTo(x, y - 44 + bob); ctx.lineTo(x + 10, y - 28 + bob); ctx.lineTo(x, y - 12 + bob); ctx.lineTo(x - 10, y - 28 + bob); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = 'rgba(255,240,190,.7)'; ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.ellipse(x, y - 28 + bob, 17, 5, .3, 0, 6.28); ctx.stroke();
        ctx.restore();
        break;
      }
      case 'rune': {
        const active = o.active || false;
        const color = active ? '#ffd27a' : '#8f86b8';
        ctx.save();
        if (active) {
          ctx.globalCompositeOperation = 'lighter';
          const g = ctx.createRadialGradient(x, y - 4, 2, x, y - 4, 42);
          g.addColorStop(0, 'rgba(255,215,120,.35)'); g.addColorStop(1, 'transparent');
          ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y - 4, 42, 0, 6.28); ctx.fill();
        }
        ctx.strokeStyle = color; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.ellipse(x, y + 4, 20, 7, 0, 0, 6.28); ctx.stroke();
        ctx.beginPath(); ctx.arc(x, y - 6, 10, 0, 6.28); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x, y - 22); ctx.lineTo(x, y - 40); ctx.stroke();
        ctx.fillStyle = color;
        ctx.beginPath(); ctx.moveTo(x, y - 50); ctx.lineTo(x + 7, y - 40); ctx.lineTo(x, y - 30); ctx.lineTo(x - 7, y - 40); ctx.closePath(); ctx.fill();
        ctx.restore();
        break;
      }
      case 'runeDisplay': {
        const active = o.active;
        const color = active ? o.color : '#555a70';
        ctx.save();
        if (active) {
          ctx.globalCompositeOperation = 'lighter';
          const g = ctx.createRadialGradient(x, y - 20, 2, x, y - 20, 40);
          g.addColorStop(0, hexA(o.color, .35)); g.addColorStop(1, 'transparent');
          ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y - 20, 40, 0, 6.28); ctx.fill();
        }
        ctx.strokeStyle = color; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.ellipse(x, y + 4, 18, 6, 0, 0, 6.28); ctx.stroke();
        ctx.fillStyle = color;
        ctx.beginPath(); ctx.moveTo(x, y - 38); ctx.lineTo(x + 8, y - 20); ctx.lineTo(x, y - 4); ctx.lineTo(x - 8, y - 20); ctx.closePath(); ctx.fill();
        ctx.restore();
        break;
      }
      case 'altar': {
        const pulse = .8 + Math.sin(this.time * 2.4) * .15;
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        const g = ctx.createRadialGradient(x, y - 30, 4, x, y - 30, 64);
        g.addColorStop(0, `rgba(255,235,170,${.35 * pulse})`); g.addColorStop(1, 'transparent');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y - 30, 64, 0, 6.28); ctx.fill();
        ctx.globalCompositeOperation = 'source-over';
        ctx.fillStyle = '#5a5870'; ctx.fillRect(x - 20, y - 12, 40, 20);
        ctx.fillStyle = '#716f88'; ctx.fillRect(x - 16, y - 22, 32, 12);
        ctx.fillStyle = '#ffe9a8';
        ctx.beginPath(); ctx.arc(x, y - 32, 10, 0, 6.28); ctx.fill();
        ctx.strokeStyle = 'rgba(255,240,190,.7)'; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.ellipse(x, y - 32, 20 + Math.sin(this.time * 2) * 3, 7, .3, 0, 6.28); ctx.stroke();
        ctx.restore();
        break;
      }
      case 'fountain': {
        ctx.save();
        ctx.fillStyle = '#6c6a7b'; ctx.beginPath(); ctx.ellipse(x, y + 4, 32, 12, 0, 0, 6.28); ctx.fill();
        ctx.fillStyle = '#4e6f86'; ctx.beginPath(); ctx.ellipse(x, y - 1, 24, 8, 0, 0, 6.28); ctx.fill();
        ctx.fillStyle = '#7a7890'; ctx.fillRect(x - 5, y - 26, 10, 26);
        ctx.fillStyle = '#6fe8d4'; ctx.globalAlpha = .6;
        for (let i = 0; i < 4; i++) {
          const a = this.time * 1.5 + i * 1.57;
          ctx.beginPath(); ctx.arc(x + Math.cos(a) * 14, y - 18 + Math.sin(a * 2) * 6, 2, 0, 6.28); ctx.fill();
        }
        ctx.restore();
        break;
      }
      case 'brazier': {
        ctx.save();
        ctx.fillStyle = '#4a4658'; ctx.fillRect(x - 8, y - 8, 16, 14);
        ctx.fillStyle = '#ff9a55'; ctx.globalCompositeOperation = 'lighter';
        const f = 6 + Math.sin(this.time * 8 + x) * 2;
        ctx.beginPath(); ctx.ellipse(x, y - 16, 5, f, 0, 0, 6.28); ctx.fill();
        ctx.fillStyle = 'rgba(255,230,150,.8)'; ctx.beginPath(); ctx.ellipse(x, y - 14, 2.4, f * .55, 0, 0, 6.28); ctx.fill();
        ctx.restore();
        break;
      }
      case 'crystal': {
        this.drawCrystal(ctx, { x: o.x, y: o.y, color: o.color, variant: 1 });
        break;
      }
      default: break;
    }
  }

  /* ---------------------------------------------------------------------- */
  /* Weather / water                                                        */
  /* ---------------------------------------------------------------------- */
  renderWater(ctx, camera) {
    const x0 = Math.max(0, Math.floor(camera.x / T)), x1 = Math.min(this.map.w - 1, Math.ceil((camera.x + camera.w) / T));
    const y0 = Math.max(0, Math.floor(camera.y / T)), y1 = Math.min(this.map.h - 1, Math.ceil((camera.y + camera.h) / T));
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
      const ch = this.map.tiles[y][x];
      if (ch !== 'w' && ch !== 'W') continue;
      const t = this.time * 1.4 + x * .7 + y * .4;
      ctx.globalAlpha = .13 + Math.sin(t) * .05;
      ctx.strokeStyle = '#bff0ff'; ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(x * T + 6, y * T + 20 + Math.sin(t) * 3);
      ctx.quadraticCurveTo(x * T + 24, y * T + 16 + Math.sin(t + 1) * 3, x * T + 42, y * T + 21 + Math.sin(t + 2) * 2);
      ctx.stroke();
    }
    ctx.restore();
  }

  renderWeather(ctx, camera) {
    const type = this.map.ambient?.type;
    ctx.save();
    if (type === 'fireflies' || type === 'stars') ctx.globalCompositeOperation = 'lighter';
    for (const p of this.weather) {
      if (p.x < camera.x - 100 || p.x > camera.x + camera.w + 100 || p.y < camera.y - 100 || p.y > camera.y + camera.h + 100) continue;
      if (p.type === 'leaves') {
        ctx.save();
        ctx.translate(p.x, p.y); ctx.rotate(p.rot);
        ctx.globalAlpha = p.alpha * .7;
        ctx.fillStyle = '#d9c27a';
        ctx.beginPath(); ctx.ellipse(0, 0, p.size * 1.6, p.size * .7, 0, 0, 6.28); ctx.fill();
        ctx.restore();
      } else if (p.type === 'fireflies') {
        const a = .35 + Math.sin(p.phase) * .3;
        ctx.globalAlpha = a;
        ctx.fillStyle = '#c8ff9a'; ctx.shadowColor = '#c8ff9a'; ctx.shadowBlur = 8;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, 6.28); ctx.fill();
        ctx.shadowBlur = 0;
      } else if (p.type === 'dust') {
        ctx.globalAlpha = p.alpha * .3;
        ctx.fillStyle = '#cfd0e8';
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, 6.28); ctx.fill();
      } else if (p.type === 'embers') {
        ctx.globalAlpha = p.alpha * .8;
        ctx.fillStyle = '#ff9a55'; ctx.shadowColor = '#ff7a45'; ctx.shadowBlur = 6;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, 6.28); ctx.fill();
        ctx.shadowBlur = 0;
      } else if (p.type === 'stars') {
        ctx.globalAlpha = .25 + Math.sin(p.phase) * .25;
        ctx.fillStyle = '#fff2c7';
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, 6.28); ctx.fill();
      }
    }
    ctx.restore();
  }
}
