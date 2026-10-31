// ============================================================
// LA ESPADA CELESTIAL — mundo y colisiones
// ============================================================
import { clamp, dist, dist2, seededFor, mulberry32, circleRectOverlap } from './core.js';
import { ZONES, REGIONS, NPCS, LORE } from './story.js';
import { ENEMIES } from './data.js';

const SOLID_PROPS = {
  well: 24, market: 26, cart: 24, anvil: 14, tent: 34, campfire: 12, brazier: 10,
  statue: 20, pillar: 18, arch: 26, shelf: 22, throne: 30, dais: 40, lamp: 8,
  fence: 26, scarecrow: 10, log: 18, mushroomRing: 12, crystal: 14, obsidian: 16,
  skull: 6, lavaFall: 20, floatingRock: 40, star: 12, banner: 8, bench: 16,
};

const TREE_TYPES = {
  village: ['oak', 'oak', 'poplar', 'blossom'],
  meadow: ['oak', 'poplar', 'blossom', 'willow'],
  forest: ['oak', 'pine', 'willow', 'glowtree', 'oak'],
  ruins: ['dead', 'oak', 'dead'],
  pass: ['dead', 'obsidianTree'],
  city: ['dead', 'dead'],
  fortress: ['dead'],
  temple: ['crystalTree'],
  library: [],
  void: [],
};

const ROCK_TYPES = {
  village: ['rock', 'mossrock'], meadow: ['rock', 'mossrock'], forest: ['rock', 'mossrock'],
  ruins: ['rock', 'mossrock'], pass: ['obsidian', 'rock'], city: ['obsidian', 'rock'],
  fortress: ['obsidian'], temple: ['crystalRock'], library: ['crystalRock'], void: ['voidRock'],
};

function segDist(px, py, ax, ay, bx, by) {
  const dx = bx - ax, dy = by - ay;
  const l2 = dx * dx + dy * dy;
  if (l2 === 0) return dist(px, py, ax, ay);
  let t = ((px - ax) * dx + (py - ay) * dy) / l2;
  t = clamp(t, 0, 1);
  return dist(px, py, ax + t * dx, ay + t * dy);
}

export class Zone {
  constructor(def) {
    this.def = def;
    this.id = def.id;
    this.name = def.name;
    this.region = def.region;
    this.regionName = REGIONS[def.region]?.name || def.region;
    this.w = def.w; this.h = def.h;
    this.theme = def.theme;
    this.level = def.level;
    this.spawn = def.spawn;
    this.paths = def.paths || [];
    this.water = def.water || [];
    this.lava = def.lava || [];
    this.buildings = def.buildings || [];
    this.npcs = [];
    this.enemies = [];
    this.chests = [];
    this.shrines = [];
    this.portals = [];
    this.loreStones = [];
    this.herbs = [];
    this.objects = [];
    this.props = [];
    this.decor = [];
    this.colliders = [];
    this.grid = new Map();
    this.interactables = [];
    this.boss = def.boss ? { ...def.boss, defeated: false } : null;
    this.bridges = [];
    this.rng = seededFor('zone', def.id);
    this._build();
  }

  _build() {
    const def = this.def;
    const rng = this.rng;
    const margin = 70;
    const reserved = [];

    // Landmarks reservados
    for (const b of this.buildings) reserved.push({ x: b.x + b.w / 2, y: b.y + b.h / 2, r: Math.max(b.w, b.h) * 0.62 });
    for (const w of this.water) reserved.push({ x: w.x, y: w.y, r: Math.max(w.rx, w.ry) + 35 });
    for (const l of this.lava) reserved.push({ x: l.x, y: l.y, r: Math.max(l.rx, l.ry) + 35 });
    for (const p of def.props || []) reserved.push({ x: p.x, y: p.y, r: 55 });
    for (const n of def.npcs || []) reserved.push({ x: n.x, y: n.y, r: 80 });
    for (const c of def.chests || []) reserved.push({ x: c.x, y: c.y, r: 55 });
    for (const s of def.shrines || []) reserved.push({ x: s.x, y: s.y, r: 80 });
    for (const p of def.portals || []) reserved.push({ x: p.x, y: p.y, r: 90 });
    for (const l of def.loreStones || []) reserved.push({ x: l.x, y: l.y, r: 55 });
    for (const h of def.herbs || []) reserved.push({ x: h.x, y: h.y, r: 45 });
    for (const o of def.objects || []) reserved.push({ x: o.x, y: o.y, r: 75 });
    if (def.boss) reserved.push({ x: def.boss.x, y: def.boss.y, r: 110 });
    reserved.push({ x: this.spawn.x, y: this.spawn.y, r: 100 });

    const isReserved = (x, y, pad = 0) => {
      for (const r of reserved) if (dist2(x, y, r.x, r.y) < (r.r + pad) ** 2) return true;
      return false;
    };
    const nearPath = (x, y, pad = 38) => {
      for (const path of this.paths) {
        for (let i = 0; i < path.length - 1; i++) {
          if (segDist(x, y, path[i].x, path[i].y, path[i + 1].x, path[i + 1].y) < pad) return true;
        }
      }
      return false;
    };
    const inWater = (x, y, pad = 20) => this.water.some(w => ((x - w.x) / (w.rx + pad)) ** 2 + ((y - w.y) / (w.ry + pad)) ** 2 < 1);
    const inLava = (x, y, pad = 20) => this.lava.some(l => ((x - l.x) / (l.rx + pad)) ** 2 + ((y - l.y) / (l.ry + pad)) ** 2 < 1);
    const inBuilding = (x, y, pad = 18) => this.buildings.some(b => circleRectOverlap(x, y, pad, b.x, b.y, b.w, b.h));

    const place = (count, fn, { pathPad = 34, reservedPad = 8, waterPad = 10, allowPath = false } = {}) => {
      let placed = 0, attempts = 0;
      const max = Math.max(40, count * 14);
      while (placed < count && attempts < max) {
        attempts++;
        const x = margin + rng() * (this.w - margin * 2);
        const y = margin + rng() * (this.h - margin * 2);
        if (inBuilding(x, y, 26) || inWater(x, y, waterPad) || inLava(x, y, waterPad)) continue;
        if (isReserved(x, y, reservedPad)) continue;
        if (!allowPath && nearPath(x, y, pathPad)) continue;
        fn(x, y);
        placed++;
      }
    };

    const scatter = def.scatter || {};
    // Árboles
    const trees = scatter.trees || 0;
    const treeTypes = TREE_TYPES[this.theme] || ['oak'];
    place(trees, (x, y) => {
      const type = treeTypes[Math.floor(rng() * treeTypes.length)];
      const s = 0.82 + rng() * 0.5;
      this.addProp({ type, x, y, s, rot: rng() * 6.28, seed: rng() * 1000, solid: true, cr: type === 'pine' ? 11 : 14 });
    }, { pathPad: this.theme === 'forest' ? 26 : 40, reservedPad: 2 });

    // Rocas
    const rocks = scatter.rocks || 0;
    const rockTypes = ROCK_TYPES[this.theme] || ['rock'];
    place(rocks, (x, y) => {
      const type = rockTypes[Math.floor(rng() * rockTypes.length)];
      const s = 0.7 + rng() * 0.9;
      this.addProp({ type, x, y, s, rot: rng() * 6.28, seed: rng() * 1000, solid: true, cr: 11 * s });
    }, { pathPad: 38, reservedPad: 4 });

    // Arbustos
    place(scatter.bushes || 0, (x, y) => {
      this.addDecor({ type: rng() < 0.3 ? 'berryBush' : 'bush', x, y, s: 0.7 + rng() * 0.7, seed: rng() * 1000 });
    }, { pathPad: 20, reservedPad: 0, allowPath: true });

    // Flores
    place(scatter.flowers || 0, (x, y) => {
      this.addDecor({ type: rng() < 0.5 ? 'flower' : 'flower2', x, y, s: 0.6 + rng() * 0.8, seed: rng() * 1000 });
    }, { pathPad: 8, reservedPad: 0, allowPath: true });

    // Setas
    place(scatter.mushrooms || 0, (x, y) => {
      this.addDecor({ type: rng() < 0.25 ? 'glowshroom' : 'mushroom', x, y, s: 0.7 + rng() * 0.8, seed: rng() * 1000 });
    }, { pathPad: 18, reservedPad: 0, allowPath: true });

    // Cristales decorativos
    place(scatter.crystals || 0, (x, y) => {
      const s = 0.6 + rng() * 0.9;
      this.addProp({ type: this.theme === 'void' ? 'voidCrystal' : 'crystalShard', x, y, s, rot: rng() * 6.28, seed: rng() * 1000, solid: true, cr: 8 * s });
    }, { pathPad: 26, reservedPad: 4 });

    // Escombros / estanterías
    place(scatter.debris || 0, (x, y) => {
      this.addDecor({ type: rng() < 0.5 ? 'debris' : 'rubble', x, y, s: 0.6 + rng() * 0.8, seed: rng() * 1000 });
    }, { pathPad: 14, reservedPad: 0, allowPath: true });

    if (scatter.shelves) {
      place(scatter.shelves, (x, y) => {
        this.addProp({ type: 'shelf', x, y, s: 1, rot: 0, seed: rng() * 1000, solid: true, cr: 18 });
      }, { pathPad: 46, reservedPad: 8, allowPath: false });
    }

    // Hierba decorativa
    const grassCount = this.theme === 'library' || this.theme === 'void' ? 0 : Math.round((this.w * this.h) / 8500);
    for (let i = 0; i < grassCount; i++) {
      const x = margin + rng() * (this.w - margin * 2);
      const y = margin + rng() * (this.h - margin * 2);
      if (inBuilding(x, y, 10) || inWater(x, y, 4) || inLava(x, y, 4)) continue;
      this.addDecor({ type: 'grass', x, y, s: 0.7 + rng() * 0.9, seed: rng() * 1000 });
    }

    // Props explícitos
    for (const p of def.props || []) {
      if (p.type === 'bell') continue;
      const solid = SOLID_PROPS[p.type] !== undefined;
      this.addProp({ ...p, s: p.s || 1, rot: p.rot || 0, seed: rng() * 1000, solid, cr: solid ? (SOLID_PROPS[p.type] || 12) * (p.s || 1) : 0 });
    }
    // Edificios (colisión rectangular)
    for (const b of this.buildings) this.colliders.push({ kind: 'rect', x: b.x, y: b.y, w: b.w, h: b.h });

    // NPCs
    for (const n of def.npcs || []) {
      const npc = NPCS[n.id];
      if (!npc) continue;
      this.npcs.push({ id: n.id, x: n.x, y: n.y, name: npc.name, role: npc.role, portrait: npc.portrait || n.id, phase: rng() * 6.28 });
    }
    // Enemigos
    for (const e of def.enemies || []) {
      this.enemies.push({ ...e, spawnX: e.x, spawnY: e.y });
    }
    // Cofres
    (def.chests || []).forEach((c, i) => {
      this.chests.push({ ...c, id: `${def.id}_chest_${i}`, opened: false });
    });
    // Santuarios
    for (const s of def.shrines || []) this.shrines.push({ ...s, kind: 'shrine', active: false });
    // Portales
    for (const p of def.portals || []) this.portals.push({ ...p, kind: 'portal' });
    // Piedras de saber
    for (const l of def.loreStones || []) this.loreStones.push({ ...l, kind: 'lore' });
    // Hierbas
    (def.herbs || []).forEach((h, i) => this.herbs.push({ ...h, id: `${def.id}_herb_${i}`, kind: 'herb', gathered: false }));
    // Objetos interactivos
    for (const o of def.objects || []) this.objects.push({ ...o, kind: 'object' });
    // Puentes
    this.bridges = this.props.filter(p => p.type === 'bridge');
    // Interactables
    this._rebuildInteractables();
  }

  addProp(p) {
    this.props.push(p);
    if (p.solid) this.addCollider({ kind: 'circle', x: p.x, y: p.y, r: p.cr || 12 });
  }
  addDecor(d) { this.decor.push(d); }
  addCollider(c) {
    this.colliders.push(c);
    if (c.kind === 'circle') {
      const cell = 128;
      const cx = Math.floor(c.x / cell), cy = Math.floor(c.y / cell);
      for (let ox = -1; ox <= 1; ox++) for (let oy = -1; oy <= 1; oy++) {
        const key = `${cx + ox},${cy + oy}`;
        if (!this.grid.has(key)) this.grid.set(key, []);
        this.grid.get(key).push(c);
      }
    }
  }

  _rebuildInteractables() {
    const list = [];
    for (const n of this.npcs) list.push({ id: 'npc_' + n.id, kind: 'npc', x: n.x, y: n.y, r: 28, label: 'Hablar con ' + n.name, npc: n });
    for (const c of this.chests) list.push({ id: c.id, kind: 'chest', x: c.x, y: c.y, r: 28, label: 'Abrir cofre', chest: c });
    for (const s of this.shrines) list.push({ id: s.id, kind: 'shrine', x: s.x, y: s.y, r: 34, label: s.active ? 'Usar santuario' : 'Activar santuario', shrine: s });
    for (const p of this.portals) list.push({ id: 'portal_' + p.to, kind: 'portal', x: p.x, y: p.y, r: 38, label: p.label, portal: p });
    for (const l of this.loreStones) list.push({ id: l.id, kind: 'lore', x: l.x, y: l.y, r: 30, label: 'Leer inscripción', loreStone: l });
    for (const h of this.herbs) list.push({ id: h.id, kind: 'herb', x: h.x, y: h.y, r: 24, label: 'Recoger hierba de brisa', herb: h });
    for (const o of this.objects) list.push({ id: o.id, kind: 'object', x: o.x, y: o.y, r: o.type === 'lost_echo' ? 34 : 38, label: o.label || 'Examinar', object: o });
    this.interactables = list;
  }

  isBridge(x, y) {
    for (const b of this.bridges) if (Math.abs(x - b.x) < 82 && Math.abs(y - b.y) < 54) return true;
    return false;
  }

  isBlocked(x, y, r = 14) {
    if (x < r || y < r || x > this.w - r || y > this.h - r) return true;
    for (const w of this.water) {
      if (((x - w.x) / (w.rx + r)) ** 2 + ((y - w.y) / (w.ry + r)) ** 2 < 1 && !this.isBridge(x, y)) return true;
    }
    for (const l of this.lava) {
      if (((x - l.x) / (l.rx + r)) ** 2 + ((y - l.y) / (l.ry + r)) ** 2 < 1) return true;
    }
    for (const b of this.buildings) if (circleRectOverlap(x, y, r, b.x, b.y, b.w, b.h)) return true;
    const cell = 128;
    const cx = Math.floor(x / cell), cy = Math.floor(y / cell);
    for (let ox = -1; ox <= 1; ox++) for (let oy = -1; oy <= 1; oy++) {
      const arr = this.grid.get(`${cx + ox},${cy + oy}`);
      if (!arr) continue;
      for (const c of arr) if (dist2(x, y, c.x, c.y) < (c.r + r) ** 2) return true;
    }
    return false;
  }

  safeSpawn(x, y, r = 18) {
    if (!this.isBlocked(x, y, r)) return { x, y };
    for (let radius = 26; radius <= 280; radius += 26) {
      const steps = 12 + Math.floor(radius / 26) * 4;
      for (let i = 0; i < steps; i++) {
        const a = (i / steps) * Math.PI * 2;
        const nx = x + Math.cos(a) * radius;
        const ny = y + Math.sin(a) * radius;
        if (!this.isBlocked(nx, ny, r)) return { x: nx, y: ny };
      }
    }
    return { x, y };
  }

  nearestInteractable(x, y, maxDist = 76) {
    let best = null, bestD = maxDist;
    for (const it of this.interactables) {
      if (it.kind === 'chest' && it.chest.opened) continue;
      if (it.kind === 'herb' && it.herb.gathered) continue;
      const d = dist(x, y, it.x, it.y);
      if (d < bestD) { bestD = d; best = it; }
    }
    return best;
  }

  getLore(id) { return LORE[id] || null; }
}

export class World {
  constructor() {
    this.zones = {};
  }
  get(id) {
    if (!this.zones[id]) {
      const def = ZONES[id];
      if (!def) throw new Error('Zona desconocida: ' + id);
      this.zones[id] = new Zone(def);
    }
    return this.zones[id];
  }
  reset(id) { delete this.zones[id]; }
  all() { return Object.keys(ZONES).map(id => this.get(id)); }
}

export const ENEMY_BY_ID = ENEMIES;
