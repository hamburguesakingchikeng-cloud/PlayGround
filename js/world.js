import { TILE, REGIONS, CREATURES, ENEMIES } from './data.js';
import { mulberry32, hash2, clamp, dist, circleRect } from './util.js';

const idx = (w, x, y) => y * w + x;

export function poiPos(def, id) {
  const p = def.pois.find(q => q.id === id);
  return p ? { x: p.x * TILE + TILE / 2, y: p.y * TILE + TILE / 2, ...p } : null;
}

export function buildWorld(regionId, flags = {}) {
  const def = REGIONS[regionId];
  if (!def) throw new Error('Región desconocida: ' + regionId);
  const rng = mulberry32(def.seed);
  const W = def.width, H = def.height;
  const terrain = new Uint8Array(W * H);
  const solid = new Uint8Array(W * H);
  const explored = new Uint8Array(W * H);
  const props = [];
  const interactables = [];
  const lights = [];
  const npcs = [];
  const spawns = [];
  const creatureSpawns = [];
  const markers = [];
  let uidCounter = 0;

  const world = {
    id: regionId, def, W, H, terrain, solid, explored,
    props, interactables, lights, npcs, spawns, creatureSpawns, markers,
    playerStart: null, bossSpawn: null, bossArena: null,
    time: 0, name: def.name
  };

  const inBounds = (x, y) => x >= 0 && y >= 0 && x < W && y < H;
  const tAt = (x, y) => inBounds(x, y) ? terrain[idx(W, x, y)] : 7;
  const setT = (x, y, v) => { if (inBounds(x, y)) terrain[idx(W, x, y)] = v; };
  const px = t => t * TILE + TILE / 2;
  const poi = id => poiPos(def, id);

  // ── base terrain ───────────────────────────────────────────
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const n = hash2(x, y, def.seed);
      terrain[idx(W, x, y)] = n > .5 ? 0 : 1;
      if (x < 2 || y < 2 || x >= W - 2 || y >= H - 2) {
        terrain[idx(W, x, y)] = 7;
        solid[idx(W, x, y)] = 1;
      }
    }
  }

  // lagos / lava / vacío
  const lakeType = regionId === 'drakmor' ? 3 : regionId === 'kansordore' ? 3 : 3;
  for (const lake of def.lakes || []) {
    for (let y = Math.floor(lake.y - lake.ry); y <= Math.ceil(lake.y + lake.ry); y++) {
      for (let x = Math.floor(lake.x - lake.rx); x <= Math.ceil(lake.x + lake.rx); x++) {
        if (!inBounds(x, y)) continue;
        const d = ((x - lake.x) / lake.rx) ** 2 + ((y - lake.y) / lake.ry) ** 2;
        const wobble = (hash2(x, y, 77) - .5) * .14;
        if (d + wobble < 1) {
          setT(x, y, lakeType);
          solid[idx(W, x, y)] = 1;
        }
      }
    }
  }

  // caminos
  const carve = (ax, ay, bx, by, width, curve) => {
    const steps = Math.ceil(dist(ax, ay, bx, by) / 10);
    const mx = (ax + bx) / 2, my = (ay + by) / 2;
    const dx = bx - ax, dy = by - ay;
    const len = Math.hypot(dx, dy) || 1;
    const nx = -dy / len, ny = dx / len;
    const cx = mx + nx * curve, cy = my + ny * curve;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const x = (1 - t) * (1 - t) * ax + 2 * (1 - t) * t * cx + t * t * bx;
      const y = (1 - t) * (1 - t) * ay + 2 * (1 - t) * t * cy + t * t * by;
      const wob = Math.sin(t * 11 + ax) * .55;
      for (let yy = -width; yy <= width; yy++) {
        for (let xx = -width; xx <= width; xx++) {
          const rr = Math.hypot(xx + wob, yy) / width;
          if (rr > 1) continue;
          const tx = Math.round(x + xx), ty = Math.round(y + yy);
          if (!inBounds(tx, ty)) continue;
          const cur = tAt(tx, ty);
          if (cur === 3) {
            setT(tx, ty, 5);
            solid[idx(W, tx, ty)] = 0;
          } else if (cur !== 7) {
            setT(tx, ty, 2);
            solid[idx(W, tx, ty)] = 0;
          }
        }
      }
    }
  };
  for (const [a, b] of def.roads) {
    const A = poi(a), B = poi(b);
    if (!A || !B) continue;
    carve(A.x, A.y, B.x, B.y, 2.3, (hash2(Math.round(A.x), Math.round(B.y), def.seed) - .5) * 8);
  }

  // plazas seguras
  for (const p of def.pois) {
    if (!p.safe) continue;
    const cx = p.x, cy = p.y;
    const r = Math.min(p.safe * .48, 4.6);
    for (let y = Math.floor(cy - r); y <= Math.ceil(cy + r); y++) {
      for (let x = Math.floor(cx - r); x <= Math.ceil(cx + r); x++) {
        if (!inBounds(x, y)) continue;
        if (Math.hypot(x - cx, y - cy) <= r) {
          if (tAt(x, y) !== 3) { setT(x, y, p.type === 'boss' ? 0 : 4); solid[idx(W, x, y)] = 0; }
        }
      }
    }
  }

  // ── utilidades de props ─────────────────────────────────────
  const prop = (type, wx, wy, opts = {}) => {
    const p = { id: ++uidCounter, type, x: wx, y: wy, solid: opts.solid ?? false, r: opts.r || 18, sortY: opts.sortY ?? wy, ...opts };
    props.push(p);
    if (p.light) lights.push({ x: p.x, y: p.y - (p.lightY || 22), r: p.lightR || 120, color: p.light, intensity: p.lightI || .7, flicker: p.flicker ?? .2 });
    return p;
  };
  const add = (type, x, y, radius = 500) => { const a = Math.atan2(rng() - .5, rng() - .5); const d = rng() * radius; return prop(type, x + Math.cos(a) * d, y + Math.sin(a) * d); };
  const nearPath = (x, y) => tAt(x, y) === 2 || tAt(x, y) === 4 || tAt(x, y) === 5;
  const nearPoi = (wx, wy, pad = 0) => def.pois.some(p => dist(wx, wy, px(p.x), px(p.y)) < p.safe * TILE * .52 + pad);
  const safeSpot = (wx, wy) => !isBlockedRaw(world, wx, wy, 20, props, solid, W, H) && !nearPoi(wx, wy, 8);

  // ── estructuras del mundo ───────────────────────────────────
  const addStructure = (kind, tx, ty, tw, th, opts = {}) => {
    const x = px(tx), y = px(ty);
    const p = prop(kind, x, y, {
      solid: true, rect: { x: x - tw * TILE / 2, y: y - th * TILE / 2, w: tw * TILE, h: th * TILE },
      sortY: y + th * TILE / 2, w: tw, h: th, ...opts
    });
    return p;
  };

  const addNPC = (id, name, role, tx, ty, look, opts = {}) => {
    const npc = {
      id, name, role, x: px(tx), y: px(ty), look, facing: 2, ...opts,
      baseY: px(ty)
    };
    npcs.push(npc);
    interactables.push({ id: 'npc_' + id, type: 'npc', npc, x: npc.x, y: npc.y, r: 54, label: 'Hablar', icon: 'talk' });
    return npc;
  };
  const addInteract = (type, tx, ty, id, label, icon, data = {}) => {
    const it = { id, type, x: px(tx), y: px(ty), r: 55, label, icon, ...data };
    interactables.push(it);
    return it;
  };

  // ── Valdoria ────────────────────────────────────────────────
  if (regionId === 'valdoria') {
    // aldea
    addStructure('hall', 13.4, 57.6, 5, 4, { name: 'Casa de la Maestra' });
    addStructure('house', 21.8, 57.2, 4, 3.4, { variant: 1, name: 'Casa de los Vela' });
    addStructure('house', 15.2, 66.6, 3.6, 3, { variant: 2, name: 'Casa de los Ríos' });
    addStructure('house', 22.4, 64.4, 3.2, 2.8, { variant: 0, name: 'Panadería' });
    addStructure('forge', 9.4, 70.2, 4.4, 3.6, { name: 'Fragua de Bram' });
    addStructure('shop', 25.2, 70.0, 4, 3.2, { name: 'Bazar de Aldric' });
    prop('fountain', px(18), px(62.8), { solid: true, r: 30, light: '#bfe4dc', lightR: 90, lightI: .25 });
    addInteract('well', 18, 62.8, 'well_valdoria', 'Escuchar el pozo', 'talk', { text: 'El agua repite tu nombre con una voz que no es la tuya. Decides no preguntar más.' });
    addInteract('sign', 20.7, 60.5, 'sign_plaza', 'Leer el letrero', 'read', { text: 'BRUMAVELA · «Donde la bruma se aparta, el Alba espera.»' });
    prop('lamp', px(16.2), px(61.2), { light: '#ffcd7a', lightR: 150, lightI: .55, flicker: .3 });
    prop('lamp', px(20.4), px(63.8), { light: '#ffcd7a', lightR: 150, lightI: .55, flicker: .3 });
    // molino
    addStructure('windmill', 39, 42, 5, 5.5, { name: 'Molino de Musgo' });
    addInteract('sign', 37, 47, 'sign_mill', 'Leer el letrero', 'read', { text: 'MOLINO DE MUSGO · Cerrado desde la última cosecha. Si oyes cantar, no respondas.' });
    for (let i = 0; i < 3; i++) prop('sack', px(36.4 + i * .6), px(46.2 + (i % 2) * .5), { solid: false });
    // ruinas
    for (let i = 0; i < 9; i++) {
      const a = i / 9 * Math.PI * 2;
      prop('ruin_column', px(67 + Math.cos(a) * 5.6), px(31 + Math.sin(a) * 4.4), { solid: true, r: 16, broken: i % 3 === 0 });
    }
    prop('statue', px(67), px(31), { solid: true, r: 28, light: '#e8c37a', lightR: 170, lightI: .45 });
    addInteract('lore', 68.2, 33.4, 'lore_profecia', 'Leer la inscripción', 'read', { lore: 'profecia' });
    addInteract('chest', 70.2, 28.4, 'chest_valdoria_1', 'Abrir cofre', 'chest', { loot: { gold: 70, items: ['vial_savia', 'vial_savia', 'esquirla_hierro'] } });
    addInteract('chest', 63.6, 35.2, 'chest_valdoria_2', 'Abrir cofre', 'chest', { loot: { gold: 45, items: ['amuleto_eco'] } });
    // santuario
    for (let i = 0; i < 6; i++) {
      const a = -Math.PI / 2 + i / 6 * Math.PI * 2;
      prop('pillar', px(84 + Math.cos(a) * 3.8), px(65 + Math.sin(a) * 3.2), { solid: true, r: 14, light: '#b8e2ef', lightR: 110, lightI: .25 });
    }
    prop('moon_statue', px(84), px(65), { solid: true, r: 28, light: '#cbeaf6', lightR: 260, lightI: .6 });
    addInteract('shrine', 84, 66.4, 'shrine_valdoria', 'Descansar en el santuario', 'shrine', { heal: true });
    addInteract('lore', 82.2, 66.6, 'lore_resonancia', 'Leer la inscripción', 'read', { lore: 'resonancia' });
    addInteract('chest', 86.4, 66.2, 'chest_valdoria_3', 'Abrir cofre', 'chest', { loot: { gold: 80, items: ['corona_lunar', 'esencia_azul'] } });
    // arena del ciervo
    for (let i = 0; i < 12; i++) {
      const a = i / 12 * Math.PI * 2;
      prop('standing_stone', px(93 + Math.cos(a) * 7.2), px(22 + Math.sin(a) * 6.2), { solid: true, r: 18, rune: i % 2 === 0 });
    }
    prop('antler_arch', px(93), px(22), { solid: false, light: '#a88ac9', lightR: 240, lightI: .4 });
    addInteract('lore', 89.5, 26.5, 'lore_valdoria', 'Leer la inscripción', 'read', { lore: 'valdoria' });
    // puerta de ceniza
    prop('portal', px(103), px(11), { solid: true, r: 34, region: 'drakmor', light: '#d8824d', lightR: 260, lightI: .8, flicker: .35 });
    addInteract('portal', 103, 12.6, 'portal_drakmor', 'Atravesar la Puerta de Ceniza', 'portal', { target: 'drakmor' });
    // campamento de Nara
    prop('tent', px(51.4), px(72.6), { solid: true, r: 38 });
    prop('campfire', px(53.4), px(72.8), { solid: false, light: '#ffb063', lightR: 190, lightI: .8, flicker: .35 });
    prop('bedroll', px(50.2), px(74.2), {});
    // huerto
    for (let i = 0; i < 6; i++) prop('orchard_tree', px(9 + Math.cos(i) * 2.2), px(45 + Math.sin(i) * 1.7), { solid: true, r: 16 });
    prop('scarecrow', px(9), px(42.4), { solid: true, r: 14 });
    addInteract('lore', 8.4, 46.8, 'lore_valdoria2', 'Leer el diario', 'read', { lore: 'gema' });
    // recursos
    const herbSpots = [[36, 45], [44, 50], [56, 48], [61, 39], [78, 58], [74, 68], [45, 28], [28, 50], [14, 52], [89, 58], [52, 62], [64, 74]];
    herbSpots.forEach(([x, y], i) => {
      const p = prop('herb', px(x), px(y), { solid: false, glow: '#a9e6a0' });
      addInteract('gather', x, y, 'node_valdoria_herb_' + i, 'Recoger savia lunar', 'gather', { gather: 'vial_savia', prop: p });
    });
    const oreSpots = [[65, 27], [71, 34], [60, 37], [94, 29], [80, 73], [99, 18], [31, 38]];
    oreSpots.forEach(([x, y], i) => {
      const p = prop('ore', px(x), px(y), { solid: true, r: 14 });
      addInteract('gather', x, y, 'node_valdoria_ore_' + i, 'Extraer esquirlas', 'gather', { gather: 'esquirla_hierro', prop: p });
    });
    // cofres extra
    addInteract('chest', 33.5, 47.5, 'chest_valdoria_4', 'Abrir cofre', 'chest', { loot: { gold: 40, items: ['pan_viaje', 'tonico_aguante'] } });
    // señales
    addInteract('sign', 40.5, 38.2, 'sign_ruins', 'Leer el letrero', 'read', { text: 'RUINAS DE AEL · «Lo que aquí se olvidó, aún está decidiendo si volver.»' });
    addInteract('sign', 88.5, 57.5, 'sign_shrine', 'Leer el letrero', 'read', { text: 'SANTUARIO DE LA LUNA · Ofrece una pregunta, no una moneda.' });
    // NPCs
    addNPC('iria', 'Maestra Iria', 'Orden del Alba', 18.2, 60.4, 'iria', { marker: true });
    addNPC('bram', 'Bram', 'Maestro de la Fragua', 9.4, 68.2, 'bram');
    addNPC('aldric', 'Aldric', 'Mercader de Brumavela', 25.2, 67.8, 'aldric');
    addNPC('ren', 'Ren', 'Guardián de la aldea', 21.6, 61.8, 'ren');
    addNPC('milo', 'Milo', 'Aprendiz de la Orden', 16.8, 64.8, 'milo');
    addNPC('nara', 'Nara', 'Erudita de Ecos', 52.4, 73.4, 'nara');
    addNPC('hermit', 'Viejo Ordo', 'Hortelano', 10.2, 46.2, 'hermit');
    addNPC('eira', 'Eira', 'Sacerdotisa de la Luna', 84.6, 67.2, 'eira');
    addNPC('ghost_ael', 'Eco de Ael', 'Memoria sin nombre', 65.2, 34.4, 'ghost', { ghost: true, hideIf: 'boss_valdoria' });
    world.playerStart = { x: px(18), y: px(65) };
    world.bossSpawn = { x: px(93), y: px(22), type: 'boss_ciervo' };
    world.bossArena = { x: px(93), y: px(22), r: 8 * TILE, id: 'valdoria' };
    markers.push(
      { id: 'brumavela', x: px(18), y: px(62), icon: 'village', name: 'Brumavela' },
      { id: 'ruins', x: px(67), y: px(31), icon: 'ruin', name: 'Ruinas de Ael' },
      { id: 'arena', x: px(93), y: px(22), icon: 'boss', name: 'Claro del Ciervo' },
      { id: 'portal', x: px(103), y: px(11), icon: 'portal', name: 'Puerta de Ceniza' }
    );
  }

  // ── Drakmor ─────────────────────────────────────────────────
  if (regionId === 'drakmor') {
    prop('tent', px(14.4), px(71.2), { solid: true, r: 38, charred: true });
    prop('campfire', px(16.4), px(71.8), { solid: false, light: '#ff8a4a', lightR: 200, lightI: .8, flicker: .4 });
    prop('banner', px(12.4), px(68.4), { solid: true, r: 16 });
    addInteract('shrine', 14, 70.2, 'shrine_drakmor', 'Descansar junto a la Última Brasa', 'shrine', { heal: true });
    addInteract('chest', 17.4, 69.2, 'chest_drakmor_1', 'Abrir cofre', 'chest', { loot: { gold: 110, items: ['vial_savia', 'vial_savia', 'incienso'] } });
    // puente
    prop('bone_arch', px(31), px(57), { solid: false });
    addInteract('sign', 29.4, 59.2, 'sign_bridge', 'Leer el letrero', 'read', { text: 'PUENTE DE COSTILLAS · «El río no perdona. El puente tampoco, pero al menos es honesto.»' });
    addInteract('lore', 32.6, 55.6, 'lore_drakmor', 'Leer la inscripción', 'read', { lore: 'drakmor' });
    // fortaleza
    for (let i = 0; i < 8; i++) {
      const a = i / 8 * Math.PI * 2;
      prop('fortress_wall', px(48 + Math.cos(a) * 6.4), px(43 + Math.sin(a) * 5.4), { solid: true, r: 24, broken: i % 2 === 0, rot: a });
    }
    prop('throne', px(48), px(41.5), { solid: true, r: 28, light: '#e86a3a', lightR: 190, lightI: .5 });
    addInteract('chest', 45.2, 46.2, 'chest_drakmor_2', 'Abrir cofre', 'chest', { loot: { gold: 140, items: ['manto_brasa', 'esencia_azul'] } });
    addInteract('lore', 51.2, 45.6, 'lore_ruptura', 'Leer la inscripción', 'read', { lore: 'ruptura' });
    // bosque de ceniza
    for (let i = 0; i < 7; i++) prop('dead_tree', px(71 + Math.cos(i * 2.1) * 3.4), px(65 + Math.sin(i * 1.7) * 2.8), { solid: true, r: 16 });
    prop('campfire', px(70), px(67), { solid: false, light: '#ff9d50', lightR: 160, lightI: .5, flicker: .5 });
    addInteract('lore', 72.6, 67.4, 'lore_lagrima', 'Leer la inscripción', 'read', { lore: 'lagrima' });
    addInteract('chest', 74.2, 63.4, 'chest_drakmor_3', 'Abrir cofre', 'chest', { loot: { gold: 90, items: ['ceniza_viva', 'bomba_solar'] } });
    // torre vigía
    prop('watchtower', px(64), px(25), { solid: true, r: 30, light: '#ff8a4a', lightR: 240, lightI: .4 });
    addInteract('shrine', 65.6, 27.4, 'shrine_watch', 'Encender el brasero', 'shrine', { heal: true });
    // forja del corazón
    for (let i = 0; i < 10; i++) {
      const a = i / 10 * Math.PI * 2;
      prop('forge_pillar', px(83 + Math.cos(a) * 7), px(29 + Math.sin(a) * 6), { solid: true, r: 20, light: '#ff6b2e', lightR: 120, lightI: .5 });
    }
    prop('anvil', px(83), px(29), { solid: true, r: 22, light: '#ffae5e', lightR: 240, lightI: .7 });
    addInteract('lore', 87.6, 32.8, 'lore_convergencia', 'Leer la inscripción', 'read', { lore: 'convergencia' });
    // portal
    prop('portal', px(94), px(11), { solid: true, r: 34, region: 'kansordore', light: '#9ed8e8', lightR: 260, lightI: .85, flicker: .3 });
    addInteract('portal', 94, 12.6, 'portal_kansordore', 'Atravesar la Cicatriz del Velo', 'portal', { target: 'kansordore' });
    // jardín de reyes
    for (let i = 0; i < 5; i++) prop('grave', px(35 + (i - 2) * 1.3), px(74 + (i % 2) * 1.4), { solid: false });
    addInteract('lore', 35, 77.2, 'lore_reyes', 'Leer la lápida', 'read', { lore: 'ascension' });
    // recursos
    const oreSpots = [[38, 47], [43, 38], [55, 49], [60, 42], [72, 58], [78, 38], [87, 24], [64, 20], [30, 52], [50, 70], [24, 62]];
    oreSpots.forEach(([x, y], i) => {
      const p = prop('ore', px(x), px(y), { solid: true, r: 14, ember: true });
      addInteract('gather', x, y, 'node_drakmor_ore_' + i, 'Extraer ceniza viva', 'gather', { gather: 'ceniza_viva', prop: p });
    });
    const herbSpots = [[18, 64], [36, 61], [58, 70], [69, 60], [77, 45], [90, 40], [41, 70], [28, 70]];
    herbSpots.forEach(([x, y], i) => {
      const p = prop('ember_flower', px(x), px(y), { solid: false, glow: '#ff9a5c' });
      addInteract('gather', x, y, 'node_drakmor_herb_' + i, 'Recoger flor de brasa', 'gather', { gather: 'vial_savia', prop: p });
    });
    addInteract('sign', 16, 63, 'sign_drakmor', 'Leer el letrero', 'read', { text: 'DRAKMOR · «Aquí no hay ceniza: hay memoria que no se atrevió a irse.»' });
    // NPCs
    addNPC('kael', 'Kael', 'Heredero de la Orden', 15.2, 68.2, 'kael', { marker: true });
    addNPC('sera', 'Sera', 'Cartógrafa de la Brasa', 12.6, 72.2, 'sera');
    addNPC('orda', 'Orda', 'Forjadora errante', 17.6, 73.0, 'orda');
    addNPC('king_ghost', 'Rey Aldric IV', 'El que ardió de pie', 35.2, 76.2, 'king', { ghost: true });
    world.playerStart = { x: px(14), y: px(67) };
    world.bossSpawn = { x: px(83), y: px(29), type: 'boss_brasa' };
    world.bossArena = { x: px(83), y: px(29), r: 8 * TILE, id: 'drakmor' };
    markers.push(
      { id: 'camp', x: px(14), y: px(69), icon: 'camp', name: 'Última Brasa' },
      { id: 'fortress', x: px(48), y: px(43), icon: 'fortress', name: 'Fortaleza Calcinada' },
      { id: 'forge', x: px(83), y: px(29), icon: 'boss', name: 'Forja del Corazón' },
      { id: 'portal', x: px(94), y: px(11), icon: 'portal', name: 'Cicatriz del Velo' }
    );
  }

  // ── Kansordore ──────────────────────────────────────────────
  if (regionId === 'kansordore') {
    // atrio
    for (let i = 0; i < 6; i++) {
      const a = i / 6 * Math.PI * 2;
      prop('crystal_pillar', px(17 + Math.cos(a) * 4), px(68 + Math.sin(a) * 3.4), { solid: true, r: 16, light: '#a9e0ea', lightR: 140, lightI: .4 });
    }
    prop('astral_well', px(17), px(68), { solid: true, r: 30, light: '#bfeaf2', lightR: 220, lightI: .55 });
    addInteract('shrine', 17, 69.8, 'shrine_kansordore', 'Descansar en el Atrio', 'shrine', { heal: true });
    addInteract('chest', 20.2, 70.6, 'chest_kansordore_1', 'Abrir cofre', 'chest', { loot: { gold: 180, items: ['esencia_azul', 'esencia_azul', 'cristal_astral'] } });
    addInteract('lore', 14.4, 65.6, 'lore_ecos', 'Leer la inscripción', 'read', { lore: 'ecos' });
    // puentes
    prop('floating_bridge', px(34), px(54), { solid: false, light: '#9dd6e8', lightR: 150, lightI: .25 });
    addInteract('sign', 32.4, 56.2, 'sign_bridges', 'Leer el letrero', 'read', { text: 'PUENTES SUSPENDIDOS · «No mires abajo. Abajo también eres tú.»' });
    addInteract('lore', 36.2, 52.4, 'lore_velo', 'Leer la inscripción', 'read', { lore: 'velo' });
    // biblioteca
    addStructure('library', 50, 38.6, 7, 5.5, { name: 'Biblioteca Prohibida' });
    for (let i = 0; i < 5; i++) prop('book_pile', px(46 + i * .8), px(43.4 + (i % 2) * .6), { solid: false });
    addInteract('lore', 50, 42.4, 'lore_jarra', 'Leer el códice', 'read', { lore: 'jarra' });
    addInteract('chest', 53.2, 42.4, 'chest_kansordore_2', 'Abrir cofre', 'chest', { loot: { gold: 200, items: ['cristal_astral', 'velo_estelar'] } });
    // templo
    for (let i = 0; i < 8; i++) {
      const a = i / 8 * Math.PI * 2;
      prop('temple_column', px(69 + Math.cos(a) * 4.4), px(60 + Math.sin(a) * 3.6), { solid: true, r: 16, light: '#d8eef2', lightR: 100, lightI: .2 });
    }
    prop('ascension_altar', px(69), px(59.4), { solid: true, r: 26, light: '#f4e4ae', lightR: 240, lightI: .6 });
    addInteract('lore', 69, 62.2, 'lore_ascension', 'Leer la inscripción', 'read', { lore: 'ascension' });
    addInteract('shrine', 71.8, 62.4, 'shrine_temple', 'Orar en el altar', 'shrine', { heal: true });
    // observatorio
    prop('orrery', px(72), px(34), { solid: true, r: 26, light: '#c7b6ff', lightR: 220, lightI: .55 });
    addInteract('lore', 74.2, 36.2, 'lore_velo2', 'Leer las notas', 'read', { lore: 'velo' });
    addInteract('chest', 69.4, 36.2, 'chest_kansordore_3', 'Abrir cofre', 'chest', { loot: { gold: 220, items: ['ojo_velo', 'incienso'] } });
    // falla
    for (let i = 0; i < 12; i++) {
      const a = i / 12 * Math.PI * 2;
      prop('void_obelisk', px(85 + Math.cos(a) * 7), px(23 + Math.sin(a) * 6), { solid: true, r: 18, light: '#c29bf0', lightR: 150, lightI: .45 });
    }
    prop('rift', px(85), px(23), { solid: false, light: '#d7b3ff', lightR: 300, lightI: .85, flicker: .3 });
    addInteract('lore', 88.6, 26.8, 'lore_convergencia2', 'Leer la inscripción', 'read', { lore: 'convergencia' });
    // jardín
    for (let i = 0; i < 8; i++) prop('name_flower', px(30 + Math.cos(i * 1.9) * 2.8), px(76 + Math.sin(i * 1.3) * 2), { solid: false, glow: '#cdeff0' });
    addInteract('lore', 30, 78.4, 'lore_nombres', 'Leer el jardín', 'read', { lore: 'despertar' });
    // recursos
    const herbSpots = [[24, 62], [37, 59], [45, 50], [57, 48], [62, 55], [75, 52], [80, 40], [90, 32], [28, 71], [52, 70]];
    herbSpots.forEach(([x, y], i) => {
      const p = prop('star_flower', px(x), px(y), { solid: false, glow: '#c8e8f0' });
      addInteract('gather', x, y, 'node_kansordore_herb_' + i, 'Recoger flor astral', 'gather', { gather: 'esencia_azul', prop: p });
    });
    const oreSpots = [[41, 51], [55, 42], [63, 40], [76, 45], [89, 35], [78, 25], [58, 31], [22, 55]];
    oreSpots.forEach(([x, y], i) => {
      const p = prop('crystal_ore', px(x), px(y), { solid: true, r: 14, light: '#a9e0ea', lightR: 70, lightI: .3 });
      addInteract('gather', x, y, 'node_kansordore_ore_' + i, 'Extraer cristal astral', 'gather', { gather: 'cristal_astral', prop: p });
    });
    // NPCs
    addNPC('sibil', 'Sibil', 'Guardiana de la Biblioteca', 50, 43.2, 'sibil', { marker: true });
    addNPC('kael_k', 'Kael', 'Heredero de la Orden', 18.4, 70.4, 'kael');
    addNPC('keeper', 'Custodio Vael', 'Último custodio', 69, 63.4, 'keeper');
    addNPC('echo_child', 'Niña de los Nombres', 'Eco del jardín', 30, 76.2, 'child', { ghost: true });
    world.playerStart = { x: px(17), y: px(70) };
    world.bossSpawn = { x: px(85), y: px(23), type: 'boss_voz' };
    world.bossArena = { x: px(85), y: px(23), r: 8 * TILE, id: 'kansordore' };
    markers.push(
      { id: 'atrio', x: px(17), y: px(68), icon: 'shrine', name: 'Atrio de Cristal' },
      { id: 'library', x: px(50), y: px(39), icon: 'library', name: 'Biblioteca Prohibida' },
      { id: 'temple', x: px(69), y: px(60), icon: 'temple', name: 'Templo de la Ascensión' },
      { id: 'rift', x: px(85), y: px(23), icon: 'boss', name: 'Falla del Velo' }
    );
  }

  // ── vegetación y decoración orgánica ─────────────────────────
  const isForest = regionId === 'valdoria';
  const decoTrees = isForest ? ['tree_oak', 'tree_pine', 'tree_oak', 'tree_birch'] : regionId === 'drakmor' ? ['dead_tree', 'dead_tree', 'charred_stump', 'obsidian'] : ['crystal_tree', 'pale_tree', 'crystal_tree'];
  const decoRocks = regionId === 'valdoria' ? ['rock', 'rock_moss', 'bush'] : regionId === 'drakmor' ? ['obsidian', 'rock_ash', 'bones'] : ['crystal_shard', 'floating_stone', 'rock_pale'];
  for (let y = 2; y < H - 2; y++) {
    for (let x = 2; x < W - 2; x++) {
      const t = tAt(x, y);
      if (t === 2 || t === 4 || t === 5 || t === 3 || t === 7) continue;
      const wx = px(x) + (hash2(x, y, 3) - .5) * 50;
      const wy = px(y) + (hash2(x, y, 4) - .5) * 50;
      if (nearPoi(wx, wy, 24)) continue;
      const cluster = hash2(Math.floor(x / 7), Math.floor(y / 7), def.seed + 9);
      const forest = cluster > .63;
      const chance = forest ? (regionId === 'valdoria' ? .16 : .1) : .025;
      const h = hash2(x, y, 11);
      if (h < chance) {
        if (nearPath(x, y)) continue;
        const type = decoTrees[Math.floor(hash2(x, y, 21) * decoTrees.length)];
        if (type === 'crystal_tree' || type === 'pale_tree') {
          prop(type, wx, wy, { solid: true, r: 14, glow: '#a9e0ea', light: '#bfeaf2', lightR: 55, lightI: .2 });
        } else {
          prop(type, wx, wy, { solid: type !== 'bush', r: type === 'tree_oak' ? 18 : 14, variant: Math.floor(h * 4) });
        }
      } else if (h > .93) {
        const type = decoRocks[Math.floor(hash2(x, y, 31) * decoRocks.length)];
        prop(type, wx, wy, { solid: type !== 'bush' && type !== 'bones', r: 12 });
      } else if (h > .90) {
        prop(regionId === 'drakmor' ? 'ember_flower' : regionId === 'kansordore' ? 'star_flower' : 'flower', wx, wy, { solid: false });
      }
    }
  }

  // cristales / luces ambientales por región
  if (regionId === 'drakmor') {
    for (let i = 0; i < 12; i++) {
      const x = 6 + rng() * (W - 12), y = 6 + rng() * (H - 12);
      if (tAt(Math.floor(x), Math.floor(y)) === 3) {
        lights.push({ x: x * TILE, y: y * TILE, r: 90, color: '#ff7138', intensity: .5, flicker: .5 });
      }
    }
  }

  // ── enemigos ────────────────────────────────────────────────
  world.isBlocked = (x, y, r) => isBlockedRaw(world, x, y, r, props, solid, W, H);
  const levelScale = { valdoria: 1, drakmor: 1, kansordore: 1 };
  for (const zone of def.enemyZones) {
    const p = poi(zone.poi);
    if (!p) continue;
    const cx = p.x * TILE + TILE / 2, cy = p.y * TILE + TILE / 2;
    for (let i = 0; i < zone.count; i++) {
      const type = zone.types[i % zone.types.length];
      const spot = freeSpot(world, cx, cy, zone.radius * TILE, rng, 22);
      if (!spot) continue;
      spawns.push({
        type, x: spot.x, y: spot.y,
        elite: rng() < .12, levelScale: levelScale[regionId] || 1,
        id: 'enemy_' + regionId + '_' + spawns.length
      });
    }
  }

  // ── criaturas ───────────────────────────────────────────────
  for (const zone of def.creatureZones) {
    const p = poi(zone.poi);
    if (!p) continue;
    const cx = p.x * TILE + TILE / 2, cy = p.y * TILE + TILE / 2;
    for (let i = 0; i < zone.count; i++) {
      const species = zone.species[i % zone.species.length];
      const spot = freeSpot(world, cx, cy, 5 * TILE, rng, 22);
      if (!spot) continue;
      creatureSpawns.push({ species, x: spot.x, y: spot.y, id: 'creature_' + species + '_' + regionId });
    }
  }

  // ── aplicar estado guardado ─────────────────────────────────
  for (const it of interactables) {
    if (flags['opened_' + it.id]) { it.opened = true; if (it.prop) it.prop.harvested = true; }
    if (flags['gathered_' + it.id]) { it.gathered = true; if (it.prop) it.prop.harvested = true; }
  }
  for (const p of props) if (p.harvested) p.visible = false;

  world.isBlocked = (x, y, r) => isBlockedRaw(world, x, y, r, props, solid, W, H);
  return world;
}

export function isBlockedRaw(world, x, y, r, props, solid, W, H) {
  if (x < TILE || y < TILE || x > (W - 1) * TILE || y > (H - 1) * TILE) return true;
  const tx0 = Math.floor((x - r) / TILE), tx1 = Math.floor((x + r) / TILE);
  const ty0 = Math.floor((y - r) / TILE), ty1 = Math.floor((y + r) / TILE);
  for (let ty = ty0; ty <= ty1; ty++) {
    for (let tx = tx0; tx <= tx1; tx++) {
      if (tx < 0 || ty < 0 || tx >= W || ty >= H) return true;
      if (solid[ty * W + tx]) {
        if (circleRect(x, y, r, tx * TILE, ty * TILE, TILE, TILE)) return true;
      }
    }
  }
  for (const p of props) {
    if (!p.solid || p.visible === false || p.harvested) continue;
    if (Math.abs(p.x - x) > 360 || Math.abs(p.y - y) > 360) continue;
    if (p.rect) {
      if (circleRect(x, y, r, p.rect.x, p.rect.y, p.rect.w, p.rect.h)) return true;
    } else if (p.r) {
      if ((p.x - x) ** 2 + (p.y - y) ** 2 < (p.r + r) ** 2) return true;
    }
  }
  return false;
}

export function freeSpot(world, cx, cy, radius, rng = Math.random, pad = 20) {
  for (let i = 0; i < 80; i++) {
    const a = rng() * Math.PI * 2;
    const d = Math.sqrt(rng()) * radius;
    const x = cx + Math.cos(a) * d, y = cy + Math.sin(a) * d;
    if (world.isBlocked(x, y, pad)) continue;
    if (world.def.pois.some(p => {
      if (!p.safe) return false;
      return dist(x, y, p.x * TILE + TILE / 2, p.y * TILE + TILE / 2) < p.safe * TILE * .42;
    })) continue;
    return { x, y };
  }
  return null;
}

export function markExplored(world, x, y, radius = 6) {
  const cx = Math.floor(x / TILE), cy = Math.floor(y / TILE);
  for (let ty = cy - radius; ty <= cy + radius; ty++) {
    for (let tx = cx - radius; tx <= cx + radius; tx++) {
      if (tx < 0 || ty < 0 || tx >= world.W || ty >= world.H) continue;
      if ((tx - cx) ** 2 + (ty - cy) ** 2 <= radius * radius) world.explored[ty * world.W + tx] = 1;
    }
  }
}

export function findInteractable(world, x, y, maxDist = 65) {
  let best = null, bestD = maxDist;
  for (const it of world.interactables) {
    if (it.disabled) continue;
    if (it.type === 'npc') {
      const npc = it.npc;
      if (npc.hidden) continue;
    }
    const d = dist(x, y, it.x, it.y);
    if (d < bestD) { best = it; bestD = d; }
  }
  return best;
}

export function regionSpawnInfo(regionId) {
  const def = REGIONS[regionId];
  return { level: def.level, name: def.name };
}
