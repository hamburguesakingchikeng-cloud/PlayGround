import { ZONES, PORTALS, NPCS } from './data.js';

function tree(w, x, y, opts = {}) {
  w.addObject({ type: opts.pine ? 'pine' : 'tree', x, y, scale: opts.scale || 1, seed: w.nextSeed(), colors: opts.colors, big: opts.big, collider: { type: 'circle', r: 15 * (opts.scale || 1) } });
}
function pine(w, x, y, scale = 1) { tree(w, x, y, { pine: true, scale }); }
function bush(w, x, y, opts = {}) {
  w.addObject({ type: 'bush', x, y, scale: opts.scale || 1, seed: w.nextSeed(), berries: opts.berries, colors: opts.colors });
}
function rock(w, x, y, scale = 1, opts = {}) {
  w.addObject({ type: 'rock', x, y, scale, seed: w.nextSeed(), shape: opts.shape, collider: opts.walk ? null : { type: 'circle', r: 24 * scale } });
}
function lantern(w, x, y, color) {
  w.addObject({ type: 'lantern', x, y, color, light: { color: color || '#ffcf7a', r: 150, intensity: 0.55 } });
}
function crystal(w, x, y, color, scale = 1) {
  w.addObject({ type: 'crystal', x, y, color, scale, seed: w.nextSeed(), light: { color, r: 180, intensity: 0.5 } });
}
function chest(w, id, x, y, loot, opts = {}) {
  w.addObject({ type: 'chest', id, x, y, seed: w.nextSeed() });
  w.addInteractable({
    id: 'chest_' + id, type: 'chest', x, y, r: 60, label: 'Abrir cofre', chestId: id, loot,
    hidden: opts.hidden || null,
  });
}
function sign(w, x, y, text) {
  w.addObject({ type: 'sign', x, y, text, seed: w.nextSeed() });
  w.addInteractable({ id: 'sign_' + x + '_' + y, type: 'sign', x, y, r: 55, label: 'Leer inscripción', text });
}
function ruinWall(w, x, y, width, height, opts = {}) {
  w.addObject({ type: 'ruin_wall', x, y, w: width, h: height, seed: w.nextSeed(), jag: opts.jag ?? 0.13, collider: { type: 'rect', x: -width / 2, y: -height, w: width, h: height } });
}
function column(w, x, y, h = 130, broken = true) {
  w.addObject({ type: 'column', x, y, h, broken, seed: w.nextSeed(), collider: { type: 'circle', r: 18 } });
}
function grave(w, x, y) { w.addObject({ type: 'gravestone', x, y, seed: w.nextSeed() }); }
function house(w, x, y, opts = {}) {
  const width = opts.w || 250, height = opts.h || 140;
  w.addObject({
    type: 'house', x, y, w: width, h: height, wall: opts.wall, roof: opts.roof, label: opts.label,
    chimney: opts.chimney, seed: w.nextSeed(),
    collider: { type: 'rect', x: -width / 2, y: -height, w: width, h: height },
  });
}
function bench(w, x, y) { w.addObject({ type: 'bench', x, y, seed: w.nextSeed() }); }
function barrel(w, x, y) { w.addObject({ type: 'barrel', x, y, seed: w.nextSeed(), collider: { type: 'circle', r: 13 } }); }
function crate(w, x, y) { w.addObject({ type: 'crate', x, y, seed: w.nextSeed(), collider: { type: 'circle', r: 15 } }); }
function statue(w, x, y) { w.addObject({ type: 'statue', x, y, seed: w.nextSeed(), collider: { type: 'circle', r: 24 } }); }
function bones(w, x, y, rot = 0) { w.addObject({ type: 'bones', x, y, rot, seed: w.nextSeed() }); }

function portal(w, def) {
  w.addObject({ type: 'portal', x: def.x, y: def.y, color: def.color || (def.locked ? '#c08bff' : '#8ce7ff'), seed: w.nextSeed(), light: { color: def.color || '#8ce7ff', r: 170, intensity: 0.6 } });
  w.addInteractable({ id: 'portal_' + def.id, type: 'portal', x: def.x, y: def.y, r: 76, label: def.label, portal: def });
}

function npc(w, id, x, y, facing = Math.PI / 2) {
  const info = NPCS[id] || NPCS.aldeano;
  w.addNPC({ ...info, id, x, y, facing, seed: w.nextSeed() });
}

function shrine(w, x, y) {
  w.addObject({ type: 'shrine', x, y, seed: w.nextSeed(), light: { color: '#ffe49b', r: 230, intensity: 0.8 } });
  w.addInteractable({ id: 'shrine_' + x + '_' + y, type: 'shrine', x, y, r: 82, label: 'Descansar en el santuario' });
}

export function layoutZone(w) {
  const id = w.zoneId;
  if (id === 'bosque_lumen') return forest(w);
  if (id === 'aldea_alba') return village(w);
  if (id === 'ruinas_umbra') return ruins(w);
  return sanctuary(w);
}

function forest(w) {
  w.groundTheme = 'forest';
  w.density = { trees: 120, pines: 40, bushes: 55, rocks: 24 };
  w.paths = [
    { width: 96, points: [[40, 840], [220, 870], [420, 920], [650, 880], [900, 910], [1120, 930], [1360, 905], [1600, 890], [1860, 900], [2140, 870], [2460, 860]] },
    { width: 64, points: [[1760, 880], [1780, 680], [1830, 480], [1960, 360], [2100, 330]] },
    { width: 62, points: [[660, 880], [700, 1050], [760, 1230]] },
    { width: 58, points: [[1140, 920], [1110, 740], [1030, 590], [980, 500]] },
    { width: 50, points: [[1960, 880], [1980, 1040], [1930, 1200]] },
  ];
  w.clearings.push(
    { x: 400, y: 930, r: 190 }, { x: 860, y: 880, r: 110 }, { x: 1360, y: 900, r: 170 },
    { x: 1960, y: 350, r: 160 }, { x: 980, y: 500, r: 130 }, { x: 1960, y: 1200, r: 110 },
    { x: 2240, y: 270, r: 90 }, { x: 760, y: 1290, r: 100 }, { x: 2100, y: 1450, r: 110 },
  );
  w.addWater({ kind: 'river', x: 1360, y: 0, w: 190, h: w.h, bridgeY: 905, bridgeW: 210 });
  for (let y = 40; y < w.h; y += 62) {
    if (y > 792 && y < 1018) continue;
    w.addCollider({ type: 'circle', x: 1360, y, r: 92, kind: 'water', requiresAny: ['swim'] });
  }
  w.addCollider({ type: 'circle', x: 1360, y: 760, r: 52, kind: 'water', requiresAny: ['swim'] });
  w.addCollider({ type: 'circle', x: 1360, y: 1040, r: 52, kind: 'water', requiresAny: ['swim'] });

  // Santuario inicial
  shrine(w, 380, 940);
  npc(w, 'lira', 512, 820);
  w.addInteractable({ id: 'npc_lira', type: 'npc', npcId: 'lira', x: 512, y: 820, r: 66, label: 'Hablar con Lira' });
  sign(w, 665, 925, 'SANTUARIO DE LUMEN|RUINAS →');
  w.addInteractable({ id: 'lore_santuario', type: 'sign', x: 360, y: 1040, r: 70, label: 'Leer la piedra grabada', text: '«Aquí durmió la Espada hasta que el cielo volvió a llamarla.»' });
  w.addObject({ type: 'statue', x: 290, y: 1040, seed: w.nextSeed(), collider: { type: 'circle', r: 24 } });

  // Portales
  portal(w, { ...PORTALS.bosque_lumen[0] });
  portal(w, { ...PORTALS.bosque_lumen[1], locked: 'ruins', color: '#c08bff' });

  // Secretos
  w.addObject({ type: 'boulder', x: 760, y: 1260, seed: w.nextSeed(), collider: { type: 'circle', x: 0, y: -18, r: 34, flag: 'boulder_moved' } });
  w.addInteractable({ id: 'boulder_bosque', type: 'boulder', x: 760, y: 1245, r: 95, label: 'Roca enorme', ability: 'move', abilityName: 'Tierra' });
  chest(w, 'bosque_roca', 722, 1360, { gold: 80, items: { anillo_poder: 1, pocion_menor: 2 } });

  w.addObject({ type: 'bramble', x: 2100, y: 1450, seed: w.nextSeed(), collider: { type: 'circle', x: 0, y: -22, r: 48, flag: 'bramble_burned' } });
  w.addInteractable({ id: 'bramble_bosque', type: 'bramble', x: 2100, y: 1430, r: 105, label: 'Espinas ardientes', ability: 'burn', abilityName: 'Fuego' });
  chest(w, 'bosque_espinas', 2180, 1490, { gold: 110, items: { charm_brasa: 1, pocion_mayor: 1 } });

  chest(w, 'bosque_secreto', 2250, 265, { gold: 140, items: { esencia_celestial: 1, sello_maestro: 1 } }, { hidden: 'detect' });
  w.addInteractable({ id: 'secret_hint_bosque', type: 'secret', x: 2210, y: 310, r: 100, label: 'Sombra sospechosa', ability: 'detect', abilityName: 'Oscuridad', flag: 'secret_bosque' });

  // Paisaje principal
  tree(w, 1040, 520, { scale: 1.35, big: true, colors: ['#315f47', '#578f62', '#1b3c33', '#a5d78a'] });
  w.addObject({ type: 'tent', x: 1840, y: 410, seed: w.nextSeed() });
  bones(w, 1930, 1240, 0.2);
  bones(w, 2000, 1225, -0.4);
  w.addObject({ type: 'nest', x: 2160, y: 1280, seed: w.nextSeed() });
  rock(w, 620, 1180, 1.2);
  rock(w, 1850, 600, 0.9);
  rock(w, 1540, 1280, 1.1);
  bush(w, 560, 1080, { berries: '#ff7b8e' });
  bush(w, 720, 620, { berries: '#9de7ff' });
  bush(w, 1860, 980);
  bush(w, 1200, 1160, { berries: '#ffcf6e' });
  lantern(w, 820, 900);
  lantern(w, 1600, 900, '#a9f1d6');
  lantern(w, 2080, 860, '#ffcf7a');
  crystal(w, 1080, 460, '#9ce98a', 0.8);
  crystal(w, 2200, 880, '#8ce7ff', 0.7);

  for (let i = 0; i < 8; i++) {
    const a = i * 0.8;
    rock(w, 1100 + Math.cos(a) * 120, 470 + Math.sin(a) * 70, 0.65, { walk: true });
  }
  w.spawnPoint = { x: 430, y: 980 };
}

function village(w) {
  w.groundTheme = 'village';
  w.density = { trees: 38, pines: 4, bushes: 22, rocks: 8 };
  w.paths = [
    { width: 98, points: [[60, 760], [320, 760], [680, 760], [1100, 760], [1460, 760], [1760, 760], [2070, 760]] },
    { width: 68, points: [[1100, 220], [1100, 500], [1100, 760], [1100, 1030], [1100, 1320]] },
    { width: 55, points: [[480, 760], [480, 560], [480, 430]] },
    { width: 55, points: [[900, 760], [900, 560]] },
    { width: 55, points: [[1450, 760], [1450, 540]] },
  ];
  w.plaza = { x: 1100, y: 770, rx: 355, ry: 235 };
  w.clearings.push(
    { x: 520, y: 480, r: 170 }, { x: 900, y: 520, r: 135 }, { x: 1450, y: 500, r: 160 },
    { x: 500, y: 1080, r: 160 }, { x: 1450, y: 1100, r: 160 }, { x: 1100, y: 770, r: 290 },
    { x: 2000, y: 760, r: 130 }, { x: 900, y: 1250, r: 100 },
  );

  // Edificios
  house(w, 500, 450, { w: 280, h: 150, wall: '#c09a6b', roof: '#8c4a3f', label: 'CASA DE LA ANCIANA' });
  house(w, 500, 1090, { w: 270, h: 140, wall: '#b88b63', roof: '#71564b', label: 'POSADA DEL ALBA' });
  house(w, 1450, 1120, { w: 300, h: 150, wall: '#b78f67', roof: '#5e6578', label: 'BIBLIOTECA' });
  house(w, 1650, 440, { w: 230, h: 130, wall: '#c39b70', roof: '#7e4d3e' });
  house(w, 300, 1160, { w: 220, h: 120, wall: '#b89065', roof: '#7b534a' });

  w.addObject({ type: 'forge', x: 1450, y: 470, label: 'FORJA DE RURIK', seed: w.nextSeed(), collider: { type: 'rect', x: -102, y: -120, w: 204, h: 120 }, light: { color: '#ff9a4e', r: 190, intensity: 0.6 } });
  w.addObject({ type: 'stall', x: 900, y: 500, color: '#b5504b', seed: w.nextSeed(), collider: { type: 'rect', x: -78, y: -70, w: 156, h: 70 } });
  w.addObject({ type: 'fountain', x: 1100, y: 770, seed: w.nextSeed(), collider: { type: 'circle', x: 0, y: -12, r: 74 } });
  w.addObject({ type: 'clock', x: 1270, y: 640, seed: w.nextSeed() });
  shrine(w, 1280, 880);

  // NPCs
  npc(w, 'celia', 565, 555, 0.9);
  npc(w, 'mira', 900, 605, Math.PI / 2);
  npc(w, 'rurik', 1450, 620, Math.PI / 2);
  npc(w, 'aldeano', 1130, 690, 2.6);
  npc(w, 'aldeano', 760, 850, 0.4);
  npc(w, 'aldeano', 1010, 1050, -1.2);
  w.addInteractable({ id: 'npc_aldeano_1', type: 'npc', npcId: 'aldeano', x: 1130, y: 690, r: 60, label: 'Hablar con Aldeano' });
  w.addInteractable({ id: 'npc_aldeano_2', type: 'npc', npcId: 'aldeano', x: 760, y: 850, r: 60, label: 'Hablar con Aldeano' });
  w.addInteractable({ id: 'npc_aldeano_3', type: 'npc', npcId: 'aldeano', x: 1010, y: 1050, r: 60, label: 'Hablar con Aldeano' });
  w.addInteractable({ id: 'npc_celia', type: 'npc', npcId: 'celia', x: 565, y: 555, r: 66, label: 'Hablar con la Anciana Celia' });
  w.addInteractable({ id: 'npc_mira', type: 'npc', npcId: 'mira', x: 900, y: 605, r: 66, label: 'Hablar con Mira' });
  w.addInteractable({ id: 'npc_rurik', type: 'npc', npcId: 'rurik', x: 1450, y: 620, r: 66, label: 'Hablar con Rurik' });
  portal(w, { ...PORTALS.aldea_alba[0] });

  sign(w, 1860, 800, 'ALDEA DEL ALBA|El último hogar');
  sign(w, 1060, 930, 'PLAZA DE LA FUENTE|Descansa, viajero');
  bench(w, 930, 840); bench(w, 1280, 840); bench(w, 520, 720); bench(w, 1610, 780);
  barrel(w, 1350, 590); barrel(w, 1370, 610); crate(w, 1520, 700); crate(w, 1545, 700);
  barrel(w, 730, 520); crate(w, 620, 1100);
  lantern(w, 1010, 720); lantern(w, 1200, 720, '#ffcf7a'); lantern(w, 700, 760, '#a9f1d6');
  lantern(w, 1600, 760); lantern(w, 580, 950);

  // jardines
  for (let i = 0; i < 10; i++) {
    const a = i * 0.9;
    bush(w, 360 + Math.cos(a) * 70, 820 + Math.sin(a) * 50, { berries: i % 2 ? '#ffcf6e' : '#ff8b9e', scale: 0.8 });
  }
  for (let i = 0; i < 8; i++) bush(w, 1600 + i * 26, 920 + Math.sin(i) * 10, { scale: 0.7, berries: '#c08bff' });
  w.addObject({ type: 'nest', x: 1730, y: 855, seed: w.nextSeed() });
  w.spawnPoint = { x: 1880, y: 760 };
}

function ruins(w) {
  w.groundTheme = 'ruins';
  w.density = { trees: 26, pines: 4, bushes: 25, rocks: 28 };
  w.paths = [
    { width: 98, points: [[60, 860], [320, 870], [640, 860], [960, 850], [1280, 860], [1600, 850], [1940, 850], [2200, 820], [2420, 820]] },
    { width: 58, points: [[1140, 860], [1200, 640], [1280, 450]] },
    { width: 54, points: [[1700, 850], [1720, 1090], [1770, 1310]] },
    { width: 50, points: [[1370, 860], [1400, 1120], [1420, 1420]] },
    { width: 46, points: [[1940, 850], [2040, 580], [2100, 430]] },
  ];
  w.clearings.push(
    { x: 220, y: 860, r: 130 }, { x: 520, y: 1100, r: 120 }, { x: 990, y: 850, r: 110 },
    { x: 1280, y: 430, r: 120 }, { x: 1780, y: 1350, r: 110 }, { x: 1450, y: 1450, r: 120 },
    { x: 1970, y: 850, r: 300 }, { x: 2320, y: 250, r: 145 },
  );
  w.arena = { x: 1970, y: 850, r: 290 };
  w.bossTrigger = { x: 1970, y: 850, r: 250 };

  shrine(w, 300, 1010);
  portal(w, { ...PORTALS.ruinas_umbra[0] });
  portal(w, { ...PORTALS.ruinas_umbra[1], locked: 'boss', color: '#ffe49b' });
  sign(w, 520, 940, 'RUINAS DE UMBRA|La oscuridad recuerda');
  sign(w, 850, 940, 'SELLO DE ESCARCHA|El hielo obedece a quien lo escucha');

  // sello de hielo
  w.addObject({ type: 'ice_gate', x: 985, y: 855, seed: w.nextSeed(), collider: { type: 'rect', x: -66, y: -88, w: 132, h: 88, flag: 'ice_gate' } });
  w.addInteractable({ id: 'ice_gate', type: 'ice_gate', x: 985, y: 835, r: 112, label: 'Sello de Escarcha', ability: 'freeze', abilityName: 'Hielo' });

  // runa y puerta mágica
  w.addObject({ type: 'rune', x: 1280, y: 430, seed: w.nextSeed(), flat: true, collider: null, light: { color: '#ffe26e', r: 150, intensity: 0.45 } });
  w.addInteractable({ id: 'rune_ruins', type: 'rune', x: 1280, y: 430, r: 86, label: 'Runa del Relámpago', ability: 'power', abilityName: 'Rayo' });
  w.addObject({ type: 'barrier', x: 1280, y: 560, color: '#ffe26e', seed: w.nextSeed(), flag: 'rune_power', collider: { type: 'rect', x: -56, y: -140, w: 112, h: 140, flag: 'rune_power' }, light: { color: '#ffe26e', r: 160, intensity: 0.4 } });
  chest(w, 'ruinas_runa', 1280, 700, { gold: 160, items: { lanza_aurora: 1, sello_maestro: 1 } });

  // muro secreto y cofre
  w.addObject({ type: 'secret_wall', x: 1760, y: 1340, seed: w.nextSeed(), collider: { type: 'rect', x: -58, y: -118, w: 116, h: 118, flag: 'secret_ruins' } });
  w.addInteractable({ id: 'secret_ruins', type: 'secret', x: 1740, y: 1320, r: 95, label: 'Muro sospechoso', ability: 'detect', abilityName: 'Oscuridad', flag: 'secret_ruins' });
  chest(w, 'ruinas_secreto', 1850, 1380, { gold: 220, items: { espada_umbra: 1, elixir: 1 } });

  // abismo
  w.addObject({ type: 'gap', x: 1420, y: 1450, rot: 0.1, seed: w.nextSeed(), flat: true, collider: { type: 'rect', x: -104, y: -40, w: 208, h: 80, requiresAny: ['fly'], bridgeFlag: 'bridge_grown' } });
  w.addInteractable({ id: 'gap_ruins', type: 'gap', x: 1420, y: 1400, r: 100, label: 'Abismo insondable', abilities: ['fly', 'grow'], abilityName: 'Viento o Naturaleza' });
  chest(w, 'ruinas_abismo', 1535, 1495, { gold: 260, items: { arco_zefiro: 1, charm_lumen: 1 } });

  // arena
  for (let i = 0; i < 10; i++) {
    const a = Math.PI * 0.12 + i * Math.PI * 0.76 / 9;
    const x = 1970 + Math.cos(a) * 315;
    const y = 850 + Math.sin(a) * 270;
    column(w, x, y, 150 + (i % 3) * 25, i % 4 !== 0);
  }
  column(w, 1640, 620, 190, false);
  column(w, 1640, 1080, 190, true);
  w.addObject({ type: 'statue', x: 1970, y: 520, seed: w.nextSeed(), collider: { type: 'circle', r: 26 } });
  crystal(w, 1690, 730, '#b990ff', 1.1);
  crystal(w, 2240, 730, '#b990ff', 1.1);
  crystal(w, 1740, 1000, '#8ce7ff', 0.9);
  crystal(w, 2220, 1010, '#8ce7ff', 0.9);

  // otros restos
  ruinWall(w, 760, 620, 190, 110, { jag: 0.22 });
  ruinWall(w, 600, 1220, 220, 90, { jag: 0.18 });
  ruinWall(w, 1180, 1250, 190, 80, { jag: 0.25 });
  ruinWall(w, 2180, 1280, 230, 100, { jag: 0.2 });
  grave(w, 430, 540); grave(w, 480, 560); grave(w, 530, 535); grave(w, 580, 565);
  grave(w, 1030, 1210); grave(w, 1080, 1235);
  bones(w, 720, 760, 0.4); bones(w, 1550, 1010, -0.3); bones(w, 2040, 650, 0.9);
  rock(w, 620, 940, 1.2); rock(w, 1360, 640, 0.9); rock(w, 2260, 1120, 1.3);
  w.addObject({ type: 'crate', x: 340, y: 880, seed: w.nextSeed(), collider: { type: 'circle', r: 15 } });
  w.addObject({ type: 'barrel', x: 380, y: 880, seed: w.nextSeed(), collider: { type: 'circle', r: 13 } });
  lantern(w, 520, 880, '#8ce7ff');
  lantern(w, 1520, 880, '#c08bff');
  lantern(w, 2250, 850, '#8ce7ff');
  w.spawnPoint = { x: 230, y: 860 };
}

function sanctuary(w) {
  w.groundTheme = 'sanctuary';
  w.density = { trees: 0, pines: 0, bushes: 0, rocks: 0 };
  w.paths = [
    { width: 90, points: [[110, 1000], [300, 1000], [520, 850], [740, 690], [1000, 580], [1260, 560]] },
    { width: 55, points: [[1000, 580], [1200, 420], [1420, 360]] },
  ];
  w.clearings.push({ x: 1000, y: 580, r: 280 }, { x: 300, y: 1000, r: 150 }, { x: 1300, y: 400, r: 160 });
  w.platform = { x: 900, y: 760, rx: 850, ry: 620 };
  shrine(w, 390, 1080);
  portal(w, { ...PORTALS.santuario_celestial[0], color: '#ffe49b' });
  w.addObject({
    type: 'altar', x: 1010, y: 540, seed: w.nextSeed(),
    collider: { type: 'circle', x: 0, y: -18, r: 30 },
    light: { color: '#fff1b8', r: 300, intensity: 0.9 },
  });
  w.addInteractable({ id: 'altar_celestial', type: 'altar', x: 1010, y: 540, r: 100, label: 'Reclamar la Espada Celestial' });
  w.addObject({ type: 'barrier', x: 1320, y: 600, color: '#ffe49b', seed: w.nextSeed(), flag: 'celestial_seal', collider: { type: 'rect', x: -56, y: -140, w: 112, h: 140, flag: 'celestial_seal' }, light: { color: '#ffe49b', r: 180, intensity: 0.5 } });
  w.addInteractable({ id: 'celestial_seal', type: 'seal', x: 1320, y: 600, r: 100, label: 'Sello Celestial', ability: 'seal', abilityName: 'Energía Celestial' });
  chest(w, 'santuario_secreto', 1430, 620, { gold: 400, items: { armadura_celestial: 1, elixir: 2 } });

  // columnas y cristales
  for (let i = 0; i < 8; i++) {
    const a = Math.PI * 0.08 + i * Math.PI * 0.84 / 7;
    const x = 900 + Math.cos(a) * 700;
    const y = 760 + Math.sin(a) * 500;
    column(w, x, y, 210, false);
    crystal(w, x + 40, y + 30, i % 2 ? '#8ce7ff' : '#ffe49b', 0.65);
  }
  w.addObject({ type: 'statue', x: 820, y: 400, seed: w.nextSeed(), collider: { type: 'circle', r: 26 } });
  w.addObject({ type: 'statue', x: 1200, y: 400, seed: w.nextSeed(), collider: { type: 'circle', r: 26 } });
  for (let i = 0; i < 10; i++) {
    const a = i * 0.9;
    crystal(w, 700 + Math.cos(a) * 260, 800 + Math.sin(a) * 160, i % 2 ? '#b990ff' : '#8ce7ff', 0.5);
  }
  w.addObject({ type: 'bench', x: 700, y: 900, seed: w.nextSeed() });
  w.addObject({ type: 'bench', x: 1260, y: 900, seed: w.nextSeed() });
  w.spawnPoint = { x: 280, y: 1000 };
}
