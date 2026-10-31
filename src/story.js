// ============================================================
// LA ESPADA CELESTIAL — mundo, historia, misiones y diálogos
// ============================================================

export const REGIONS = {
  valdoria: {
    id: 'valdoria', name: 'Valdoria', epithet: 'La tierra que aún recuerda la lluvia',
    color: '#7ddc9a', accent: '#d9b46a',
    desc: 'Aldeas de tejados rojos, praderas infinitas, bosques que escuchan y ruinas de una civilización que prefirió olvidar. Aquí la Ruptura abrió su primera grieta.',
  },
  drakmor: {
    id: 'drakmor', name: 'Drakmor', epithet: 'El reino que ardió dos veces',
    color: '#ff8a5c', accent: '#ffd166',
    desc: 'Ríos de lava, fortalezas de obsidiana y una ciudad que sigue en pie por pura terquedad. La ceniza cubre los nombres, pero no las promesas.',
  },
  kansordore: {
    id: 'kansordore', name: 'Kansordore', epithet: 'Donde el cielo aprendió a leer',
    color: '#b48cff', accent: '#9fe8ff',
    desc: 'Templos suspendidos, bibliotecas prohibidas y dimensiones que se pliegan sobre sí mismas. Aquí se guarda la verdad sobre el Velo y sobre ti.',
  },
};

export const ZONES = {
  // ==========================================================
  // VALDORIA
  // ==========================================================
  valdoria_village: {
    id: 'valdoria_village', name: 'Brisavelo', region: 'valdoria', level: 1, theme: 'village', music: 'valdoria',
    w: 2000, h: 1400, spawn: { x: 1000, y: 1100 }, ambient: 'fireflies',
    desc: 'Una aldea de tejados rojos al pie de las montañas. Huele a pan, a hierba y a algo que empieza a romperse.',
    worldPos: { x: 18, y: 70 },
    paths: [
      [{ x: 1000, y: 1400 }, { x: 1000, y: 800 }, { x: 1000, y: 620 }],
      [{ x: 150, y: 760 }, { x: 1850, y: 760 }],
      [{ x: 350, y: 1050 }, { x: 350, y: 760 }],
      [{ x: 1600, y: 1100 }, { x: 1600, y: 760 }],
      [{ x: 1750, y: 760 }, { x: 1940, y: 760 }],
    ],
    buildings: [
      { x: 820, y: 240, w: 360, h: 190, style: 'temple', roof: '#4a5d7c', wall: '#b9b09a' },
      { x: 250, y: 380, w: 220, h: 150, style: 'house', roof: '#9d4b3f', wall: '#d8c9a8' },
      { x: 1470, y: 360, w: 240, h: 160, style: 'house', roof: '#4f6b8a', wall: '#cfc2a4' },
      { x: 250, y: 1000, w: 240, h: 170, style: 'inn', roof: '#8c5a35', wall: '#d8c9a8' },
      { x: 1470, y: 1000, w: 220, h: 160, style: 'forge', roof: '#6b4a3a', wall: '#a89a82' },
      { x: 1460, y: 1220, w: 200, h: 120, style: 'house', roof: '#6b5a3a', wall: '#c2b496' },
    ],
    water: [{ x: 1850, y: 1240, rx: 115, ry: 70 }],
    scatter: { trees: 22, rocks: 14, bushes: 30, flowers: 55, mushrooms: 0, crystals: 0, debris: 6 },
    props: [
      { type: 'well', x: 1220, y: 900 }, { type: 'market', x: 610, y: 900 }, { type: 'market', x: 710, y: 900 },
      { type: 'lamp', x: 860, y: 760 }, { type: 'lamp', x: 1140, y: 760 }, { type: 'lamp', x: 940, y: 960 },
      { type: 'fence', x: 400, y: 1200 }, { type: 'fence', x: 440, y: 1200 }, { type: 'fence', x: 480, y: 1200 },
      { type: 'cart', x: 1320, y: 1120 }, { type: 'banner', x: 900, y: 450, color: '#4a5d7c' }, { type: 'banner', x: 1100, y: 450, color: '#4a5d7c' },
      { type: 'statue', x: 1000, y: 560 }, { type: 'bench', x: 880, y: 950 }, { type: 'bench', x: 1120, y: 950 },
    ],
    npcs: [
      { id: 'elara', x: 1000, y: 830 }, { id: 'marta', x: 470, y: 1090 }, { id: 'bron', x: 1570, y: 1090 },
      { id: 'lia', x: 760, y: 1060 }, { id: 'guard', x: 1800, y: 790 }, { id: 'farmer', x: 1740, y: 1180 },
    ],
    enemies: [],
    chests: [{ x: 300, y: 1300, tier: 1 }, { x: 1800, y: 1320, tier: 1 }, { x: 350, y: 300, tier: 2 }],
    shrines: [{ id: 'shrine_village', x: 1000, y: 620, name: 'Santuario de Brisavelo' }],
    portals: [{ x: 1950, y: 760, to: 'valdoria_meadow', toX: 120, toY: 900, label: 'Pradera de Lumen', dir: 'east' }],
    loreStones: [{ id: 'lore_village', x: 1200, y: 1320, lore: 'ruptura' }],
    herbs: [],
    objects: [],
    triggers: [],
    boss: null,
  },

  valdoria_meadow: {
    id: 'valdoria_meadow', name: 'Pradera de Lumen', region: 'valdoria', level: 2, theme: 'meadow', music: 'valdoria',
    w: 2600, h: 1800, spawn: { x: 120, y: 900 }, ambient: 'fireflies',
    desc: 'Un mar de hierba dorada atravesado por el río Espejo. Los ecos salvajes juegan entre las flores y los bandidos acechan en los caminos.',
    worldPos: { x: 33, y: 66 },
    paths: [
      [{ x: 60, y: 900 }, { x: 700, y: 900 }, { x: 1300, y: 900 }, { x: 1900, y: 900 }, { x: 2540, y: 900 }],
      [{ x: 1300, y: 900 }, { x: 1300, y: 500 }, { x: 1300, y: 60 }],
      [{ x: 700, y: 900 }, { x: 700, y: 760 }],
      [{ x: 1900, y: 900 }, { x: 2100, y: 700 }, { x: 2300, y: 550 }],
    ],
    water: [
      { x: 1900, y: 250, rx: 82, ry: 220 }, { x: 1900, y: 600, rx: 82, ry: 170 },
      { x: 1900, y: 1300, rx: 82, ry: 250 }, { x: 1900, y: 1660, rx: 82, ry: 140 },
      { x: 720, y: 1250, rx: 150, ry: 90 },
    ],
    buildings: [
      { x: 480, y: 440, w: 150, h: 150, style: 'windmill', roof: '#8c5a35', wall: '#d8c9a8' },
      { x: 650, y: 1120, w: 230, h: 150, style: 'house', roof: '#9d4b3f', wall: '#d8c9a8' },
    ],
    scatter: { trees: 48, rocks: 20, bushes: 45, flowers: 110, mushrooms: 5, crystals: 0, debris: 8 },
    props: [
      { type: 'bridge', x: 1900, y: 900 }, { type: 'windmill', x: 555, y: 515 },
      { type: 'stoneCircle', x: 2250, y: 520 }, { type: 'fence', x: 650, y: 1050 }, { type: 'fence', x: 690, y: 1050 },
      { type: 'fence', x: 730, y: 1050 }, { type: 'scarecrow', x: 900, y: 1150 }, { type: 'cart', x: 1100, y: 1000 },
    ],
    npcs: [{ id: 'kael', x: 700, y: 800 }, { id: 'farmer', x: 850, y: 1150 }],
    enemies: [
      { type: 'slime_lumen', x: 1500, y: 620, patrol: 80 }, { type: 'wolf_brisa', x: 1100, y: 420, patrol: 120 },
      { type: 'wisp', x: 2250, y: 1200, patrol: 100 }, { type: 'bandido', x: 2250, y: 620, patrol: 90 },
      { type: 'slime_lumen', x: 600, y: 1500, patrol: 70 }, { type: 'wolf_brisa', x: 1600, y: 1500, patrol: 120 },
      { type: 'wisp', x: 1050, y: 1600, patrol: 90 },
    ],
    chests: [{ x: 300, y: 300, tier: 1 }, { x: 2420, y: 1450, tier: 2 }, { x: 1200, y: 1620, tier: 1 }],
    shrines: [{ id: 'shrine_meadow', x: 400, y: 1400, name: 'Altar de la Pradera' }],
    portals: [
      { x: 60, y: 900, to: 'valdoria_village', toX: 1900, toY: 760, label: 'Brisavelo', dir: 'west' },
      { x: 1300, y: 60, to: 'valdoria_forest', toX: 1300, toY: 1800, label: 'Bosque de las Voces', dir: 'north' },
      { x: 2550, y: 900, to: 'valdoria_ruins', toX: 120, toY: 900, label: 'Ruinas de Alderion', dir: 'east', require: 'nima_met', lockText: 'El camino hacia Alderion está sellado por una niebla que susurra. Nima, en el bosque, sabrá cómo atravesarla.' },
    ],
    loreStones: [{ id: 'lore_meadow', x: 1000, y: 1320, lore: 'valdoria' }],
    herbs: [{ x: 900, y: 500, id: 'herb_brisa' }, { x: 1500, y: 1100, id: 'herb_brisa' }, { x: 2100, y: 800, id: 'herb_brisa' }],
    objects: [],
    triggers: [],
    boss: null,
  },

  valdoria_forest: {
    id: 'valdoria_forest', name: 'Bosque de las Voces', region: 'valdoria', level: 3, theme: 'forest', music: 'valdoria',
    w: 2600, h: 1900, spawn: { x: 1300, y: 1800 }, ambient: 'fireflies',
    desc: 'Los árboles repiten lo que oyen. Por eso los viajeros hablan poco. En el claro, una erudita de Kansordore escucha algo que no debería existir.',
    worldPos: { x: 46, y: 52 },
    paths: [
      [{ x: 1300, y: 1880 }, { x: 1300, y: 1300 }, { x: 1300, y: 900 }, { x: 1700, y: 760 }, { x: 2100, y: 650 }, { x: 2520, y: 600 }],
      [{ x: 1300, y: 900 }, { x: 1300, y: 500 }, { x: 1500, y: 300 }],
      [{ x: 700, y: 900 }, { x: 1300, y: 900 }],
    ],
    water: [{ x: 750, y: 900, rx: 150, ry: 100 }, { x: 1050, y: 600, rx: 80, ry: 50 }, { x: 1050, y: 500, rx: 60, ry: 40 }],
    buildings: [],
    scatter: { trees: 175, rocks: 24, bushes: 55, flowers: 30, mushrooms: 55, crystals: 0, debris: 12 },
    props: [
      { type: 'tent', x: 1350, y: 940 }, { type: 'campfire', x: 1250, y: 950 }, { type: 'banner', x: 1400, y: 880, color: '#4b3a6b' },
      { type: 'stoneCircle', x: 2100, y: 1150 }, { type: 'bridge', x: 750, y: 900 }, { type: 'log', x: 1100, y: 1050 },
      { type: 'log', x: 1500, y: 1100 }, { type: 'mushroomRing', x: 900, y: 600 }, { type: 'mushroomRing', x: 1800, y: 1450 },
    ],
    npcs: [{ id: 'nima', x: 1300, y: 850 }],
    enemies: [
      { type: 'wolf_brisa', x: 900, y: 600, patrol: 120 }, { type: 'wisp', x: 1700, y: 500, patrol: 100 },
      { type: 'treant', x: 2100, y: 1000, patrol: 70 }, { type: 'cultista', x: 1600, y: 1300, patrol: 100 },
      { type: 'wolf_brisa', x: 800, y: 1400, patrol: 130, elite: true }, { type: 'wisp', x: 2100, y: 1600, patrol: 90 },
    ],
    chests: [{ x: 400, y: 500, tier: 1 }, { x: 2300, y: 1600, tier: 2 }, { x: 1600, y: 1200, tier: 1 }],
    shrines: [{ id: 'shrine_forest', x: 600, y: 1600, name: 'Santuario de las Voces' }],
    portals: [
      { x: 1300, y: 1850, to: 'valdoria_meadow', toX: 1300, toY: 120, label: 'Pradera de Lumen', dir: 'south' },
      { x: 2550, y: 600, to: 'valdoria_ruins', toX: 120, toY: 900, label: 'Ruinas de Alderion', dir: 'east', require: 'nima_met', lockText: 'La niebla de Alderion no se abre aún. Habla con Nima.' },
    ],
    loreStones: [{ id: 'lore_forest_1', x: 900, y: 1300, lore: 'ecos' }, { id: 'lore_forest_2', x: 1800, y: 700, lore: 'resonancia' }],
    herbs: [{ x: 500, y: 1100, id: 'herb_brisa' }, { x: 1500, y: 1500, id: 'herb_brisa' }, { x: 2000, y: 400, id: 'herb_brisa' }],
    objects: [{ id: 'lost_echo', type: 'lost_echo', x: 2200, y: 400, label: 'Un eco perdido' }],
    triggers: [],
    boss: null,
  },

  valdoria_ruins: {
    id: 'valdoria_ruins', name: 'Ruinas de Alderion', region: 'valdoria', level: 5, theme: 'ruins', music: 'valdoria',
    w: 2400, h: 1800, spawn: { x: 120, y: 900 }, ambient: 'motes',
    desc: 'La ciudad que escuchó el primer sueño y decidió no contarlo. Bajo sus arcos duerme el Guardián de Raíces, y con él la Gema Celestial.',
    worldPos: { x: 58, y: 60 },
    paths: [
      [{ x: 60, y: 900 }, { x: 800, y: 900 }, { x: 1200, y: 900 }, { x: 1200, y: 500 }, { x: 1200, y: 60 }],
      [{ x: 1200, y: 900 }, { x: 500, y: 1100 }, { x: 500, y: 1300 }],
      [{ x: 1200, y: 900 }, { x: 1900, y: 900 }, { x: 1900, y: 600 }],
    ],
    buildings: [
      { x: 980, y: 230, w: 440, h: 220, style: 'ruin', roof: '#6a7a6a', wall: '#9a9a83' },
      { x: 350, y: 350, w: 220, h: 150, style: 'ruin', roof: '#5a6a5a', wall: '#8a8a74' },
      { x: 1800, y: 300, w: 220, h: 150, style: 'ruin', roof: '#5a6a5a', wall: '#8a8a74' },
    ],
    scatter: { trees: 35, rocks: 35, bushes: 25, flowers: 20, mushrooms: 10, crystals: 12, debris: 35 },
    props: [
      { type: 'arch', x: 800, y: 760 }, { type: 'arch', x: 1600, y: 760 }, { type: 'pillar', x: 700, y: 1000 },
      { type: 'pillar', x: 1700, y: 1000 }, { type: 'pillar', x: 900, y: 650 }, { type: 'pillar', x: 1500, y: 650 },
      { type: 'runeCircle', x: 1200, y: 700 }, { type: 'bell', x: 500, y: 1200 }, { type: 'statue', x: 1000, y: 950 },
      { type: 'statue', x: 1400, y: 950 }, { type: 'brazier', x: 1100, y: 1050 }, { type: 'brazier', x: 1300, y: 1050 },
      { type: 'crystal', x: 300, y: 600 }, { type: 'crystal', x: 2100, y: 1300 },
    ],
    npcs: [{ id: 'cael', x: 450, y: 1050 }],
    enemies: [
      { type: 'cultista', x: 700, y: 700, patrol: 100 }, { type: 'wisp', x: 1700, y: 700, patrol: 90 },
      { type: 'treant', x: 1900, y: 1200, patrol: 80 }, { type: 'cultista', x: 1600, y: 1400, patrol: 100 },
      { type: 'wisp', x: 700, y: 1500, patrol: 90 },
    ],
    chests: [{ x: 2000, y: 1300, tier: 2 }, { x: 300, y: 1500, tier: 1 }, { x: 1900, y: 500, tier: 2 }],
    shrines: [{ id: 'shrine_ruins', x: 300, y: 400, name: 'Altar de Alderion' }],
    portals: [
      { x: 60, y: 900, to: 'valdoria_forest', toX: 2500, toY: 600, label: 'Bosque de las Voces', dir: 'west' },
      { x: 1200, y: 60, to: 'drakmor_pass', toX: 1100, toY: 1500, label: 'Desfiladero de Ceniza', dir: 'north', require: 'gem_taken', lockText: 'La piedra del arco está vacía. Falta la Gema Celestial para abrir el camino a Drakmor.' },
    ],
    loreStones: [{ id: 'lore_ruins_1', x: 900, y: 1100, lore: 'alderion' }, { id: 'lore_ruins_2', x: 1600, y: 900, lore: 'gema' }],
    herbs: [],
    objects: [
      { id: 'altar_gem', type: 'altar_gem', x: 1200, y: 820, label: 'Altar de la Gema' },
      { id: 'bell_ruins', type: 'bell', x: 500, y: 1200, label: 'Campana Rota' },
      { id: 'rune_1', type: 'rune', x: 650, y: 1250, label: 'Runa del Alba' },
      { id: 'rune_2', type: 'rune', x: 400, y: 1300, label: 'Runa del Eco' },
      { id: 'rune_3', type: 'rune', x: 550, y: 1400, label: 'Runa del Silencio' },
    ],
    triggers: [],
    boss: {
      enemy: 'guardian_raiz', x: 1200, y: 480, triggerX: 1200, triggerY: 760, triggerR: 150,
      flag: 'boss_guardian', intro: 'guardian', outro: 'guardian_outro', questEvent: 'boss_guardian',
      arena: { x: 1200, y: 520, r: 360 }, music: 'boss',
    },
  },

  // ==========================================================
  // DRAKMOR
  // ==========================================================
  drakmor_pass: {
    id: 'drakmor_pass', name: 'Desfiladero de Ceniza', region: 'drakmor', level: 7, theme: 'pass', music: 'drakmor',
    w: 2200, h: 1600, spawn: { x: 1100, y: 1500 }, ambient: 'embers',
    desc: 'La primera puerta de Drakmor. El viento huele a hierro fundido y a una guerra que nunca terminó de terminar.',
    worldPos: { x: 68, y: 42 },
    paths: [
      [{ x: 1100, y: 1580 }, { x: 900, y: 1300 }, { x: 800, y: 1000 }, { x: 1000, y: 700 }, { x: 1100, y: 400 }, { x: 1100, y: 60 }],
      [{ x: 800, y: 1000 }, { x: 600, y: 1100 }],
    ],
    water: [],
    lava: [
      { x: 300, y: 700, rx: 150, ry: 100 }, { x: 1700, y: 600, rx: 180, ry: 110 },
      { x: 400, y: 1200, rx: 120, ry: 90 }, { x: 1800, y: 1300, rx: 160, ry: 100 },
    ],
    buildings: [
      { x: 450, y: 1000, w: 220, h: 150, style: 'camp', roof: '#5a3a32', wall: '#4a3a32' },
      { x: 1600, y: 250, w: 180, h: 120, style: 'ruin', roof: '#3a2a2a', wall: '#5a4a44' },
    ],
    scatter: { trees: 8, rocks: 50, bushes: 12, flowers: 0, mushrooms: 0, crystals: 18, debris: 30 },
    props: [
      { type: 'campfire', x: 650, y: 1080 }, { type: 'tent', x: 520, y: 1050 }, { type: 'banner', x: 1100, y: 1200, color: '#5c3530' },
      { type: 'lavaFall', x: 1700, y: 600 }, { type: 'obsidian', x: 900, y: 500 }, { type: 'obsidian', x: 1300, y: 900 },
      { type: 'cart', x: 1000, y: 1200 }, { type: 'skull', x: 700, y: 1400 }, { type: 'skull', x: 1500, y: 1000 },
    ],
    npcs: [{ id: 'ordo', x: 620, y: 1100 }],
    enemies: [
      { type: 'escorpion', x: 1400, y: 900, patrol: 100 }, { type: 'elemental_magma', x: 1500, y: 500, patrol: 90 },
      { type: 'cuervo', x: 800, y: 500, patrol: 120 }, { type: 'escorpion', x: 1700, y: 1100, patrol: 100 },
      { type: 'caballero_ceniza', x: 1000, y: 1300, patrol: 80, elite: true },
    ],
    chests: [{ x: 300, y: 300, tier: 2 }, { x: 1900, y: 1400, tier: 2 }, { x: 700, y: 500, tier: 1 }],
    shrines: [{ id: 'shrine_pass', x: 1800, y: 1200, name: 'Santuario de la Puerta' }],
    portals: [
      { x: 1100, y: 1550, to: 'valdoria_ruins', toX: 1200, toY: 120, label: 'Ruinas de Alderion', dir: 'south' },
      { x: 1100, y: 50, to: 'drakmor_city', toX: 1100, toY: 1400, label: 'Cindral', dir: 'north' },
    ],
    loreStones: [{ id: 'lore_pass', x: 1500, y: 900, lore: 'drakmor' }],
    herbs: [],
    objects: [],
    triggers: [],
    boss: null,
  },
  drakmor_city: {
    id: 'drakmor_city', name: 'Cindral', region: 'drakmor', level: 8, theme: 'city', music: 'drakmor',
    w: 2200, h: 1500, spawn: { x: 1100, y: 1400 }, ambient: 'ash',
    desc: 'La ciudad que ardió dos veces y se negó a arder una tercera. En sus calles conviven herreros, fantasmas y precios que suben con la temperatura.',
    worldPos: { x: 78, y: 55 },
    paths: [
      [{ x: 1100, y: 1500 }, { x: 1100, y: 1200 }, { x: 1100, y: 900 }, { x: 1100, y: 600 }, { x: 1100, y: 60 }],
      [{ x: 1100, y: 900 }, { x: 700, y: 900 }, { x: 650, y: 800 }],
      [{ x: 1100, y: 900 }, { x: 1500, y: 900 }, { x: 1500, y: 1050 }],
    ],
    water: [],
    lava: [{ x: 1900, y: 1300, rx: 150, ry: 90 }, { x: 300, y: 1300, rx: 120, ry: 70 }],
    buildings: [
      { x: 550, y: 650, w: 220, h: 160, style: 'forge', roof: '#6b3a2a', wall: '#8a6a52' },
      { x: 1350, y: 550, w: 240, h: 160, style: 'inn', roof: '#5a3a32', wall: '#a88a6a' },
      { x: 350, y: 300, w: 220, h: 150, style: 'ruin', roof: '#4a3a32', wall: '#7a6a5a' },
      { x: 1550, y: 300, w: 240, h: 150, style: 'ruin', roof: '#4a3a32', wall: '#7a6a5a' },
      { x: 350, y: 1000, w: 180, h: 120, style: 'ruin', roof: '#3a2a2a', wall: '#6a5a4a' },
    ],
    scatter: { trees: 10, rocks: 30, bushes: 10, flowers: 0, mushrooms: 0, crystals: 15, debris: 40 },
    props: [
      { type: 'banner', x: 900, y: 1100, color: '#5c3530' }, { type: 'banner', x: 1300, y: 1100, color: '#5c3530' },
      { type: 'anvil', x: 700, y: 850 }, { type: 'campfire', x: 1200, y: 1050 }, { type: 'obsidian', x: 1750, y: 800 },
      { type: 'statue', x: 1100, y: 700 }, { type: 'cart', x: 900, y: 1000 }, { type: 'skull', x: 400, y: 1200 },
      { type: 'lamp', x: 950, y: 900 }, { type: 'lamp', x: 1250, y: 900 },
    ],
    npcs: [
      { id: 'serah', x: 720, y: 900 }, { id: 'citizen', x: 1200, y: 950 }, { id: 'merchant', x: 1450, y: 1020 },
    ],
    enemies: [
      { type: 'caballero_ceniza', x: 400, y: 1200, patrol: 90 }, { type: 'cultista', x: 1700, y: 1200, patrol: 100 },
      { type: 'elemental_magma', x: 1800, y: 800, patrol: 80 }, { type: 'cuervo', x: 700, y: 400, patrol: 110 },
    ],
    chests: [{ x: 300, y: 1300, tier: 2 }, { x: 1900, y: 1300, tier: 2 }, { x: 1300, y: 400, tier: 1 }],
    shrines: [{ id: 'shrine_city', x: 1600, y: 1100, name: 'Santuario de Cindral' }],
    portals: [
      { x: 1100, y: 1450, to: 'drakmor_pass', toX: 1100, toY: 120, label: 'Desfiladero de Ceniza', dir: 'south' },
      { x: 1100, y: 50, to: 'drakmor_fortress', toX: 1200, toY: 1800, label: 'Fortaleza Calcinada', dir: 'north', require: 'm3_started', lockText: 'La puerta de la Fortaleza está cerrada. Habla con Serah; ella conoce el camino.' },
      { x: 2050, y: 700, to: 'kansordore_temple', toX: 1200, toY: 1750, label: 'Camino Celeste', dir: 'east', require: 'tear_forged', lockText: 'Un sendero de luz duerme sobre la roca. La Lágrima de la Primera Brasa aún no ha sido forjada.' },
    ],
    loreStones: [{ id: 'lore_city', x: 900, y: 1100, lore: 'cindral' }],
    herbs: [],
    objects: [],
    triggers: [],
    boss: null,
  },

  drakmor_fortress: {
    id: 'drakmor_fortress', name: 'Fortaleza Calcinada', region: 'drakmor', level: 10, theme: 'fortress', music: 'drakmor',
    w: 2400, h: 1900, spawn: { x: 1200, y: 1800 }, ambient: 'embers',
    desc: 'El trono de la Reina Calcinada. La lava sube por las murallas como si quisiera recuperar lo que le pertenece.',
    worldPos: { x: 88, y: 38 },
    paths: [
      [{ x: 1200, y: 1900 }, { x: 1200, y: 1500 }, { x: 1200, y: 1000 }, { x: 1200, y: 600 }, { x: 1200, y: 300 }],
      [{ x: 1200, y: 1500 }, { x: 400, y: 1550 }],
    ],
    water: [],
    lava: [
      { x: 400, y: 800, rx: 180, ry: 110 }, { x: 1800, y: 900, rx: 200, ry: 120 },
      { x: 500, y: 1500, rx: 140, ry: 80 }, { x: 1700, y: 1500, rx: 160, ry: 90 },
      { x: 900, y: 400, rx: 120, ry: 70 }, { x: 1500, y: 400, rx: 120, ry: 70 },
    ],
    buildings: [
      { x: 850, y: 250, w: 700, h: 260, style: 'fortress', roof: '#3a2026', wall: '#5a3a32' },
      { x: 300, y: 500, w: 180, h: 180, style: 'tower', roof: '#3a2a2a', wall: '#4a3a32' },
      { x: 1920, y: 500, w: 180, h: 180, style: 'tower', roof: '#3a2a2a', wall: '#4a3a32' },
    ],
    scatter: { trees: 4, rocks: 40, bushes: 8, flowers: 0, mushrooms: 0, crystals: 20, debris: 35 },
    props: [
      { type: 'throne', x: 1200, y: 400 }, { type: 'brazier', x: 1000, y: 700 }, { type: 'brazier', x: 1400, y: 700 },
      { type: 'banner', x: 1000, y: 600, color: '#5c2020' }, { type: 'banner', x: 1400, y: 600, color: '#5c2020' },
      { type: 'obsidian', x: 700, y: 1100 }, { type: 'obsidian', x: 1600, y: 1000 }, { type: 'lavaFall', x: 400, y: 800 },
      { type: 'skull', x: 900, y: 1400 }, { type: 'skull', x: 1500, y: 1600 },
    ],
    npcs: [],
    enemies: [
      { type: 'elemental_magma', x: 700, y: 1200, patrol: 90 }, { type: 'caballero_ceniza', x: 1600, y: 1200, patrol: 90 },
      { type: 'salamandra', x: 900, y: 800, patrol: 80 }, { type: 'cuervo', x: 1500, y: 600, patrol: 100 },
      { type: 'salamandra', x: 500, y: 300, patrol: 70, elite: true },
    ],
    chests: [{ x: 300, y: 400, tier: 3 }, { x: 2000, y: 1400, tier: 3 }, { x: 1900, y: 500, tier: 2 }],
    shrines: [{ id: 'shrine_fortress', x: 400, y: 1550, name: 'Brasero de la Fortaleza' }],
    portals: [{ x: 1200, y: 1850, to: 'drakmor_city', toX: 1100, toY: 120, label: 'Cindral', dir: 'south' }],
    loreStones: [{ id: 'lore_fortress', x: 700, y: 1500, lore: 'reina' }],
    herbs: [],
    objects: [{ id: 'altar_tear', type: 'altar_tear', x: 1200, y: 420, label: 'Altar de la Primera Brasa' }],
    triggers: [],
    boss: {
      enemy: 'reina_calcinada', x: 1200, y: 620, triggerX: 1200, triggerY: 1050, triggerR: 190,
      flag: 'boss_reina', intro: 'reina', outro: 'reina_outro', questEvent: 'boss_reina',
      arena: { x: 1200, y: 700, r: 420 }, music: 'boss',
    },
  },

  // ==========================================================
  // KANSORDORE
  // ==========================================================
  kansordore_temple: {
    id: 'kansordore_temple', name: 'Templo de Cristal', region: 'kansordore', level: 12, theme: 'temple', music: 'kansordore',
    w: 2400, h: 1800, spawn: { x: 1200, y: 1750 }, ambient: 'stars',
    desc: 'Un templo suspendido entre dos cielos. Sus tres altares guardan las tres formas de la Resonancia: recordar, entregar y renacer.',
    worldPos: { x: 24, y: 22 },
    paths: [
      [{ x: 1200, y: 1800 }, { x: 1200, y: 1450 }, { x: 1200, y: 1000 }, { x: 1200, y: 600 }, { x: 1200, y: 60 }],
      [{ x: 1200, y: 1000 }, { x: 600, y: 900 }],
      [{ x: 1200, y: 1000 }, { x: 1800, y: 900 }],
    ],
    water: [],
    buildings: [
      { x: 950, y: 300, w: 500, h: 240, style: 'temple', roof: '#5a6a9a', wall: '#cfd8e8' },
    ],
    scatter: { trees: 6, rocks: 16, bushes: 10, flowers: 30, mushrooms: 0, crystals: 45, debris: 10 },
    props: [
      { type: 'dais', x: 1200, y: 1000 }, { type: 'pillar', x: 800, y: 800 }, { type: 'pillar', x: 1600, y: 800 },
      { type: 'pillar', x: 800, y: 1200 }, { type: 'pillar', x: 1600, y: 1200 },
      { type: 'crystal', x: 600, y: 900 }, { type: 'crystal', x: 1800, y: 900 }, { type: 'crystal', x: 1200, y: 600 },
      { type: 'brazier', x: 1000, y: 1000 }, { type: 'brazier', x: 1400, y: 1000 }, { type: 'statue', x: 1200, y: 1300 },
    ],
    npcs: [{ id: 'archivista', x: 1200, y: 1250 }],
    enemies: [
      { type: 'serafin_corrupto', x: 700, y: 1200, patrol: 100 }, { type: 'golem_cristal', x: 1700, y: 1200, patrol: 80 },
      { type: 'espectro_velo', x: 1500, y: 700, patrol: 100 }, { type: 'serafin_corrupto', x: 900, y: 500, patrol: 100 },
    ],
    chests: [{ x: 300, y: 400, tier: 3 }, { x: 2100, y: 1400, tier: 3 }, { x: 1900, y: 500, tier: 2 }],
    shrines: [{ id: 'shrine_temple', x: 1200, y: 1450, name: 'Santuario del Templo' }],
    portals: [
      { x: 1200, y: 1800, to: 'drakmor_city', toX: 2000, toY: 750, label: 'Cindral', dir: 'south' },
      { x: 1200, y: 50, to: 'kansordore_library', toX: 1100, toY: 1500, label: 'Biblioteca Prohibida', dir: 'north', require: 'trial_done', lockText: 'La puerta de la Biblioteca está sellada. Completa la Prueba de las Tres Resonancias.' },
    ],
    loreStones: [{ id: 'lore_temple_1', x: 900, y: 1100, lore: 'convergencia' }, { id: 'lore_temple_2', x: 1500, y: 900, lore: 'ascension' }],
    herbs: [],
    objects: [
      { id: 'trial_altar_1', type: 'trial_altar', x: 600, y: 900, label: 'Altar del Recuerdo', index: 1 },
      { id: 'trial_altar_2', type: 'trial_altar', x: 1200, y: 600, label: 'Altar de la Entrega', index: 2 },
      { id: 'trial_altar_3', type: 'trial_altar', x: 1800, y: 900, label: 'Altar del Renacer', index: 3 },
    ],
    triggers: [
      { id: 'temple_enter', x: 1200, y: 1600, r: 160, once: true, condition: 'm3_done', scene: 'm4_intro', startQuest: 'm4' },
    ],
    boss: null,
  },

  kansordore_library: {
    id: 'kansordore_library', name: 'Biblioteca Prohibida', region: 'kansordore', level: 13, theme: 'library', music: 'kansordore',
    w: 2200, h: 1600, spawn: { x: 1100, y: 1500 }, ambient: 'motes',
    desc: 'Un laberinto de estanterías que se reescriben cuando nadie mira. Aquí se guarda la única copia de la verdad sobre el Jugador Cero.',
    worldPos: { x: 36, y: 14 },
    paths: [
      [{ x: 1100, y: 1600 }, { x: 1100, y: 1200 }, { x: 1100, y: 800 }, { x: 1100, y: 400 }, { x: 1100, y: 60 }],
      [{ x: 1100, y: 1200 }, { x: 400, y: 1200 }],
      [{ x: 1100, y: 800 }, { x: 1700, y: 800 }],
    ],
    water: [],
    buildings: [],
    scatter: { trees: 0, rocks: 0, bushes: 0, flowers: 0, mushrooms: 0, crystals: 12, debris: 10, shelves: 70 },
    props: [
      { type: 'shelf', x: 500, y: 600 }, { type: 'shelf', x: 700, y: 600 }, { type: 'shelf', x: 1500, y: 600 }, { type: 'shelf', x: 1700, y: 600 },
      { type: 'shelf', x: 500, y: 1000 }, { type: 'shelf', x: 700, y: 1000 }, { type: 'shelf', x: 1500, y: 1000 }, { type: 'shelf', x: 1700, y: 1000 },
      { type: 'candle', x: 1100, y: 1000 }, { type: 'candle', x: 900, y: 700 }, { type: 'candle', x: 1300, y: 700 },
      { type: 'dais', x: 1100, y: 650 }, { type: 'statue', x: 800, y: 1300 }, { type: 'statue', x: 1400, y: 1300 },
    ],
    npcs: [],
    enemies: [
      { type: 'espectro_velo', x: 600, y: 800, patrol: 100 }, { type: 'golem_cristal', x: 1600, y: 900, patrol: 80 },
      { type: 'serafin_corrupto', x: 1500, y: 1200, patrol: 100 }, { type: 'espectro_velo', x: 700, y: 1200, patrol: 100 },
      { type: 'golem_cristal', x: 1800, y: 400, patrol: 70, elite: true },
    ],
    chests: [{ x: 300, y: 300, tier: 3 }, { x: 1900, y: 1300, tier: 3 }, { x: 300, y: 1300, tier: 2 }],
    shrines: [{ id: 'shrine_library', x: 400, y: 1250, name: 'Lámpara de la Biblioteca' }],
    portals: [
      { x: 1100, y: 1550, to: 'kansordore_temple', toX: 1200, toY: 120, label: 'Templo de Cristal', dir: 'south' },
      { x: 1100, y: 50, to: 'kansordore_void', toX: 1000, toY: 1500, label: 'Fisura del Velo', dir: 'north', require: 'truth_known', lockText: 'La grieta aún está cerrada. La verdad debe ser leída antes de que el Velo te deje pasar.' },
    ],
    loreStones: [
      { id: 'lore_library_1', x: 800, y: 1100, lore: 'jugador_cero' },
      { id: 'lore_library_2', x: 1400, y: 1100, lore: 'jarra' },
      { id: 'lore_library_3', x: 1700, y: 600, lore: 'arquitecto' },
    ],
    herbs: [],
    objects: [{ id: 'altar_truth', type: 'altar_truth', x: 1100, y: 420, label: 'Altar de la Verdad' }],
    triggers: [],
    boss: {
      enemy: 'custodio_velo', x: 1100, y: 650, triggerX: 1100, triggerY: 950, triggerR: 170,
      flag: 'boss_custodio', intro: 'custodio', outro: 'custodio_outro', questEvent: 'boss_custodio',
      arena: { x: 1100, y: 700, r: 400 }, music: 'boss',
    },
  },

  kansordore_void: {
    id: 'kansordore_void', name: 'Corazón de la Convergencia', region: 'kansordore', level: 15, theme: 'void', music: 'void',
    w: 2000, h: 1600, spawn: { x: 1000, y: 1500 }, ambient: 'stars',
    desc: 'El lugar donde el sueño y el soñador se tocan. No hay suelo, solo la idea del suelo. Y una figura que lleva demasiado tiempo esperando.',
    worldPos: { x: 48, y: 8 },
    paths: [
      [{ x: 1000, y: 1600 }, { x: 1000, y: 1200 }, { x: 1000, y: 800 }, { x: 1000, y: 400 }],
    ],
    water: [],
    lava: [],
    buildings: [],
    scatter: { trees: 0, rocks: 0, bushes: 0, flowers: 0, mushrooms: 0, crystals: 30, debris: 20 },
    props: [
      { type: 'floatingRock', x: 500, y: 500, s: 1.4 }, { type: 'floatingRock', x: 1500, y: 600, s: 1.2 },
      { type: 'floatingRock', x: 600, y: 1100, s: 1.0 }, { type: 'floatingRock', x: 1450, y: 1150, s: 1.5 },
      { type: 'floatingRock', x: 400, y: 800, s: 0.8 }, { type: 'floatingRock', x: 1650, y: 900, s: 0.9 },
      { type: 'runeCircle', x: 1000, y: 700 }, { type: 'crystal', x: 800, y: 400 }, { type: 'crystal', x: 1200, y: 400 },
      { type: 'star', x: 1000, y: 300 },
    ],
    npcs: [],
    enemies: [
      { type: 'espectro_velo', x: 600, y: 1200, patrol: 80 }, { type: 'espectro_velo', x: 1400, y: 1200, patrol: 80 },
    ],
    chests: [{ x: 600, y: 500, tier: 3 }],
    shrines: [],
    portals: [{ x: 1000, y: 1550, to: 'kansordore_library', toX: 1100, toY: 120, label: 'Biblioteca Prohibida', dir: 'south' }],
    loreStones: [],
    herbs: [],
    objects: [{ id: 'altar_convergence', type: 'altar_convergence', x: 1000, y: 420, label: 'Altar de la Convergencia' }],
    triggers: [
      { id: 'void_enter', x: 1000, y: 1350, r: 140, once: true, condition: 'm4_done', scene: 'm5_intro', startQuest: 'm5' },
    ],
    boss: {
      enemy: 'arquitecto', x: 1000, y: 750, triggerX: 1000, triggerY: 1100, triggerR: 170,
      flag: 'boss_arquitecto', intro: 'arquitecto', outro: 'arquitecto_outro', questEvent: 'boss_arquitecto',
      arena: { x: 1000, y: 750, r: 430 }, music: 'boss',
    },
  },
  // ==========================================================
  // PERSONAJES
  // ==========================================================
};

// ============================================================
// DIÁLOGOS
// ============================================================
export const NPCS = {
  elara: {
    name: 'Maestra Elara', role: 'Maestra Resonadora', portrait: 'elara',
    dialogue(g) {
      const m1 = g.questState('m1');
      if (m1 === 'done' && !g.flags.nima_met) {
        return {
          portrait: 'elara', speaker: 'Elara', role: 'Maestra Resonadora',
          lines: [
            { text: 'La espada ha despertado, pero aún no te conoce del todo. Yo tampoco.' },
            { text: 'Escucha el bosque al norte de la pradera. Allí vive Nima, una erudita de Kansordore. Ella sabe por qué el Velo ha elegido Brisavelo.' },
            { text: 'Y {{name}}, no vayas solo. Los ecos responden a quien les ofrece un nombre. El tuyo acaba de empezar.' },
          ],
        };
      }
      if (g.flags.gem_taken && !g.flags.tear_forged) {
        return {
          portrait: 'elara', speaker: 'Elara', role: 'Maestra Resonadora',
          lines: [
            { text: 'La Gema canta incluso desde aquí. Esa canción tiene dos voces: una te llama y otra te advierte.' },
            { text: 'Cruza el Desfiladero de Ceniza. Busca a Ordo, el general que sobrevivió a la Reina. Y busca la Lágrima de la Primera Brasa.' },
            { text: 'Cuando la tengas, la espada dejará de ser un recuerdo y se convertirá en una decisión.' },
          ],
        };
      }
      if (g.flags.truth_known) {
        return {
          portrait: 'elara', speaker: 'Elara', role: 'Maestra Resonadora',
          lines: [
            { text: 'He pasado toda mi vida enseñando a otros a escuchar. Nunca me atreví a escucharme a mí misma.' },
            { text: 'La Profecía no dice que vencerás. Dice que elegirás. Eso es mucho más peligroso.' },
            { text: 'Sea cual sea tu decisión, no la tomes por miedo. Tómala por todo lo que has aprendido a querer.' },
          ],
        };
      }
      return {
        portrait: 'elara', speaker: 'Elara', role: 'Maestra Resonadora',
        lines: [
          { text: 'Has sentido la Ruptura, ¿verdad? El cielo se partió sobre Brisavelo y el Velo empezó a beber de nuestros recuerdos.' },
          { text: 'Esta espada te ha elegido. Se llama la Espada Celestial, y fue forjada con un fragmento del primer sueño.' },
          { text: 'Durante siglos ha esperado a alguien capaz de resonar con ella. Alguien que no estaba en el tablero.' },
          { text: 'No te pido que salves el mundo. Te pido que des el primer paso. ¿Lo harás?', choices: [
            { text: 'Acepto. Nadie debería perder sus recuerdos.', next: 4 },
            { text: 'Solo quiero proteger a los míos.', next: 4 },
            { text: '¿Y si la espada se equivoca conmigo?', next: 4 },
          ] },
          { text: 'Entonces aprende a equivocarte con ella. El santuario del centro de la aldea responderá. Lleva la espada, escucha su pulso y deja que el eco te encuentre.' },
          { text: 'Ah, y una cosa más: los ecos no son herramientas. Son memorias que aceptan caminar contigo. Trátalos como tales.', end: true },
        ],
        endEffect: { type: 'elara_blessing' },
      };
    },
  },

  marta: {
    name: 'Marta', role: 'Mercader de Brisavelo', portrait: 'marta',
    dialogue(g) {
      if (g.questState('s1') === 'active') {
        const herbs = g.itemCount('herb_brisa');
        if (herbs >= 3) {
          return {
            portrait: 'marta', speaker: 'Marta', role: 'Mercader de Brisavelo',
            lines: [
              { text: '¡Tres hierbas de brisa! Huelen a mañana. Con esto puedo hacer el guiso que mi madre hacía antes de que el cielo se agrietara.' },
              { text: 'Toma. No es mucho, pero en Brisavelo un plato caliente vale más que una promesa.' },
              { text: 'Y si vuelves con más, siempre habrá sitio en mi mesa. O en mi tienda. Sobre todo en mi tienda.', end: true },
            ],
          };
        }
        return {
          portrait: 'marta', speaker: 'Marta', role: 'Mercader de Brisavelo',
          lines: [
            { text: `Me faltan hierbas, cariño. Llevas ${herbs} de 3. Crecen en la Pradera de Lumen, donde el viento cambia de idea.` },
            { text: 'Y no te acerques a los lobos. Huelen el miedo y, sinceramente, el miedo huele fatal.' },
          ],
        };
      }
      return {
        portrait: 'marta', speaker: 'Marta', role: 'Mercader de Brisavelo',
        lines: [
          { text: 'Bienvenido a Brisavelo, aunque el recibimiento no sea el de antes. El cielo tiene una grieta y mi proveedor tiene miedo.' },
          { text: '¿Buscas algo? Tengo pociones, hierbas y opiniones no solicitadas.', choices: [
            { text: 'Muéstrame lo que vendes.', effect: { type: 'shop', id: 'marta' }, next: 2 },
            { text: '¿Necesitas ayuda con algo?', next: 3 },
            { text: 'Solo pasaba a saludar.', next: 5 },
          ] },
          { text: 'Tómate tu tiempo. Lo bueno tarda en elegirse.' },
          { text: 'Desde la Ruptura, las hierbas de brisa no crecen igual. Necesito tres para un guiso que caliente hasta los recuerdos. ¿Me las traerías?', choices: [
            { text: 'Claro. Tráeme la lista.', effect: { type: 'startQuest', id: 's1' }, next: 4 },
            { text: 'Ahora no puedo.', next: 5 },
          ] },
          { text: 'Gracias, cariño. Las encontrarás en la pradera, al este. Y si ves un lobo, corre en zigzag. No sé si funciona, pero es divertido.' },
          { text: 'Vuelve cuando quieras. La puerta está abierta y el té, caliente.' },
        ],
      };
    },
  },

  bron: {
    name: 'Bron', role: 'Herrero de Brisavelo', portrait: 'bron',
    dialogue(g) {
      return {
        portrait: 'bron', speaker: 'Bron', role: 'Herrero de Brisavelo',
        lines: [
          { text: 'Esa espada tiene más años que mi abuelo y menos paciencia que yo. Si quieres que no se rompa, tráeme materiales.' },
          { text: 'El acero no miente. Si se rompe, es que tú también.', choices: [
            { text: 'Quiero mejorar mi equipo.', effect: { type: 'forge' }, next: 2 },
            { text: 'Enséñame lo que tienes.', effect: { type: 'shop', id: 'bron' }, next: 2 },
            { text: 'Solo quería verte trabajar.', next: 3 },
          ] },
          { text: 'Cuando termines, vuelve. El fuego no espera y yo tampoco.' },
          { text: 'Mirar es gratis. Tocar el yunque, no.' },
        ],
      };
    },
  },

  lia: {
    name: 'Lía', role: 'Niña de Brisavelo', portrait: 'lia',
    dialogue(g) {
      return {
        portrait: 'lia', speaker: 'Lía', role: 'Niña de Brisavelo',
        lines: [
          { text: '¿Es verdad que la espada habla? Mi madre dice que las espadas no hablan. Pero mi madre también dice que las verduras son divertidas.' },
          { text: 'Si encuentras un eco, ¿le preguntas su nombre? La maestra Elara dice que los nombres son la primera cuerda de una resonancia.' },
          { text: 'Cuando sea mayor, quiero tener un eco que brille en la oscuridad. Como tú.' },
        ],
      };
    },
  },

  guard: {
    name: 'Guardia de Brisavelo', role: 'Centinela del Alba', portrait: 'guard',
    dialogue(g) {
      return {
        portrait: 'guard', speaker: 'Guardia', role: 'Centinela del Alba',
        lines: [
          { text: 'La aldea está a salvo por ahora, pero el bosque al norte no. Los viajeros oyen voces entre los árboles y algunos no vuelven.' },
          { text: 'Si vas a la pradera, sigue el camino. Los lobos de brisa cazan en parejas y siempre atacan desde donde no miras.' },
          { text: 'Y si ves una luz que flota y te llama por tu nombre, no la sigas. Aunque tu nombre suene muy convincente.' },
        ],
      };
    },
  },

  farmer: {
    name: 'Labriego', role: 'Agricultor de Brisavelo', portrait: 'farmer',
    dialogue(g) {
      return {
        portrait: 'farmer', speaker: 'Labriego', role: 'Agricultor',
        lines: [
          { text: 'La tierra está rara. Las semillas crecen, pero las flores miran hacia abajo, como si escucharan algo bajo el suelo.' },
          { text: 'Dicen que en la pradera hay hierbas de brisa. Si encuentras alguna, Marta las paga bien. Y su guiso, mejor.' },
          { text: 'Yo ya no salgo del camino. La última vez vi una piedra que respiraba. No pienso repetirlo.' },
        ],
      };
    },
  },

  kael: {
    name: 'Kael', role: 'Ladrón de buen corazón', portrait: 'kael',
    dialogue(g) {
      if (g.questState('s2') === 'active') {
        return {
          portrait: 'kael', speaker: 'Kael', role: 'Ladrón de buen corazón',
          lines: [
            { text: 'El eco perdido brilla como una luciérnaga con insomnio. Lo vi cerca del claro del este, en el Bosque de las Voces.' },
            { text: 'No lo asustes. Los ecos huyen de las voces fuertes y de las manos rápidas. Yo debería saberlo: me han robado más veces de las que he robado.' },
          ],
        };
      }
      if (g.questState('s2') === 'done') {
        return {
          portrait: 'kael', speaker: 'Kael', role: 'Ladrón de buen corazón',
          lines: [
            { text: '¿Ves? Los buenos ladrones devolvemos cosas. A veces incluso las que no hemos robado.' },
            { text: 'Ese eco te ha elegido. No lo estropees con gratitud excesiva.' },
          ],
        };
      }
      return {
        portrait: 'kael', speaker: 'Kael', role: 'Ladrón de buen corazón',
        lines: [
          { text: 'No soy un ladrón. Soy un redistribuidor de recuerdos. La diferencia es que yo cobro.' },
          { text: 'Oye, tú eres quien lleva la espada que canta, ¿verdad? Entonces quizá puedas ayudarme con algo que no tiene precio.' },
          { text: 'Un eco se perdió en el bosque. Lo vi en el claro del este, solo y asustado. Si lo encuentras, no lo captures: acompáñalo.', choices: [
            { text: 'Iré a buscarlo.', effect: { type: 'startQuest', id: 's2' }, next: 3 },
            { text: 'No tengo tiempo para ecos perdidos.', next: 4 },
          ] },
          { text: 'Gracias. Y si el eco te muerde, no te lo tomes a mal. Los recuerdos muerden cuando tienen miedo.' },
          { text: 'Entiendo. El mundo se está deshaciendo y tú tienes prisa. Yo también. Pero los ecos son lo único que nos queda cuando todo lo demás se olvida.' },
        ],
      };
    },
  },

  nima: {
    name: 'Nima', role: 'Erudita de Kansordore', portrait: 'nima',
    dialogue(g) {
      if (!g.flags.nima_met) {
        return {
          portrait: 'nima', speaker: 'Nima', role: 'Erudita de Kansordore',
          lines: [
            { text: 'No grites. El bosque escucha. Y, sinceramente, ya tiene suficiente con lo que oye.' },
            { text: 'Eres el Jugador Cero. La espada te ha elegido y el Velo ha empezado a girar a tu alrededor. No es una coincidencia; es una consecuencia.' },
            { text: 'La Gema Celestial está en las ruinas de Alderion. El Guardián de Raíces la protege, pero no la protege de ti: te protege a ti de ella.' },
            { text: 'Ve a las ruinas, recupera la Gema y vuelve. Si el Guardián te detiene, recuerda que no está enfadado. Está asustado.' },
            { text: 'Ah, y antes de que preguntes: sí, el bosque tiene nombres para ti. Todos los tienen. Ninguno es el tuyo.', end: true },
          ],
          endEffect: { type: 'nima_meeting' },
        };
      }
      if (g.flags.gem_taken && !g.flags.tear_forged) {
        return {
          portrait: 'nima', speaker: 'Nima', role: 'Erudita de Kansordore',
          lines: [
            { text: 'La Gema ha vuelto a cantar. Eso significa que la espada ya recuerda lo que era antes de ser espada.' },
            { text: 'Drakmor es el siguiente paso. La Lágrima de la Primera Brasa está en la Fortaleza Calcinada. La Reina no la entregará. Nunca lo hace.' },
            { text: 'Cuando la tengas, lleva la espada a Serah. Ella sabrá cómo forjar una memoria que no se rompa.' },
          ],
        };
      }
      if (g.flags.truth_known) {
        return {
          portrait: 'nima', speaker: 'Nima', role: 'Erudita de Kansordore',
          lines: [
            { text: 'He leído la verdad tres veces y las tres veces ha cambiado una palabra. Eso no es un libro. Es un espejo.' },
            { text: 'El Arquitecto no quiere destruir el mundo. Quiere ahorrarle el dolor de existir. Es la misma cosa, vista desde dentro.' },
            { text: 'Tu decisión será la primera que no esté escrita. Yo estaré contigo, aunque no esté allí.' },
          ],
        };
      }
      return {
        portrait: 'nima', speaker: 'Nima', role: 'Erudita de Kansordore',
        lines: [
          { text: 'Las ruinas están al este, más allá de la niebla. El Guardián no ataca a quien escucha. Pero tú llevas una espada, así que probablemente atacará.' },
          { text: 'Cuando lo venzas, no destruyas la Gema. Es la única memoria que le queda al primer sueño.' },
          { text: 'Y si encuentras un eco con forma de ciervo, no lo fuerces. Los ciervos de cristal solo se inclinan ante quien no quiere poseerlos.' },
        ],
      };
    },
  },

  cael: {
    name: 'Hermano Cael', role: 'Último custodio de Alderion', portrait: 'cael',
    dialogue(g) {
      if (g.questState('s4') === 'active') {
        return {
          portrait: 'cael', speaker: 'Cael', role: 'Último custodio de Alderion',
          lines: [
            { text: 'La campana está rota, pero no muda. Necesita tres fragmentos de cristal para recordar su voz.' },
            { text: 'Los encontrarás en los cofres y entre las ruinas. Cuando la campana vuelva a sonar, Alderion sabrá que alguien sigue escuchando.' },
          ],
        };
      }
      if (g.questState('s4') === 'done') {
        return {
          portrait: 'cael', speaker: 'Cael', role: 'Último custodio de Alderion',
          lines: [
            { text: 'La campana ha sonado. No sé si alguien la ha oído, pero el eco ya no está solo.' },
            { text: 'Gracias, Jugador Cero. Los lugares también necesitan que los recuerden.' },
          ],
        };
      }
      return {
        portrait: 'cael', speaker: 'Cael', role: 'Último custodio de Alderion',
        lines: [
          { text: 'Alderion no cayó en una guerra. Cayó en una conversación que nadie quiso terminar.' },
          { text: 'La campana de la plaza lleva siglos rota. Si me traes tres fragmentos de cristal, puedo devolverle la voz. No cambiará el mundo, pero cambiará este lugar.' },
          { text: '¿Me ayudarás?', choices: [
            { text: 'Traeré los fragmentos.', effect: { type: 'startQuest', id: 's4' }, next: 3 },
            { text: 'Ahora no.', next: 4 },
          ] },
          { text: 'Gracias. Los fragmentos están en los cofres de las ruinas y en los ecos que aún cantan.' },
          { text: 'Entiendo. El silencio también es una forma de respeto.' },
        ],
      };
    },
  },

  ordo: {
    name: 'Ordo', role: 'General exiliado', portrait: 'ordo',
    dialogue(g) {
      if (!g.flags.m3_started) {
        return {
          portrait: 'ordo', speaker: 'Ordo', role: 'General exiliado',
          lines: [
            { text: 'Así que la espada ha cruzado el desfiladero. Pensé que ya no quedaba nadie capaz de hacer cantar al acero.' },
            { text: 'Yo serví a la Reina Calcinada. Antes de que vendiera su corazón, antes de que Cindral se convirtiera en una hoguera con calles.' },
            { text: 'La Lágrima de la Primera Brasa está en su fortaleza. Si vas a por ella, no vayas como un héroe. Ve como alguien que quiere volver.' },
            { text: 'Te acompañaré con lo que sé. Y si encuentras a la Reina, dile que Ordo sigue vivo. Que alguien sigue recordando su nombre.', end: true },
          ],
          endEffect: { type: 'ordo_meeting' },
        };
      }
      if (g.questState('s3') === 'active') {
        return {
          portrait: 'ordo', speaker: 'Ordo', role: 'General exiliado',
          lines: [
            { text: 'La ceniza de Drakmor se pega a las botas y a los juramentos. Mata a cinco de sus criaturas y vuelve. No por venganza: para que el camino sea seguro.' },
          ],
        };
      }
      if (g.questState('s3') === 'done') {
        return {
          portrait: 'ordo', speaker: 'Ordo', role: 'General exiliado',
          lines: [
            { text: 'Has vuelto. Eso ya es más de lo que muchos consiguieron.' },
            { text: 'Toma esto. Un general sin ejército no necesita oro, pero un viajero siempre necesita una segunda oportunidad.' },
          ],
        };
      }
      return {
        portrait: 'ordo', speaker: 'Ordo', role: 'General exiliado',
        lines: [
          { text: 'La Reina está en la Fortaleza, al norte de Cindral. Pero antes de que te lances, hay algo que debes saber.' },
          { text: 'Drakmor no está maldito. Está de luto. Cada criatura que ves corrompida fue alguien que decidió quedarse cuando el fuego llegó.' },
          { text: 'Si quieres limpiar el camino, te pagaré por ello. Y si quieres entenderlo, te contaré la historia completa.', choices: [
            { text: 'Limpiaré el camino.', effect: { type: 'startQuest', id: 's3' }, next: 3 },
            { text: 'Cuéntame la historia.', next: 4 },
            { text: 'No tengo tiempo.', next: 5 },
          ] },
          { text: 'Bien. Cinco criaturas. Ni una más. La venganza también tiene un límite.' },
          { text: 'La Reina se llamaba Seraphine. Vendió su corazón a la Primera Brasa para salvar a Cindral de una erupción. La Brasa aceptó. El pueblo sobrevivió. Y luego la llamó monstruo.' },
          { text: 'El tiempo no perdona a los que dudan. Ve. Yo vigilaré el desfiladero.' },
        ],
      };
    },
  },

  serah: {
    name: 'Serah', role: 'Herrera de Cindral', portrait: 'serah',
    dialogue(g) {
      if (g.flags.m3_started && !g.flags.boss_reina) {
        return {
          portrait: 'serah', speaker: 'Serah', role: 'Herrera de Cindral',
          lines: [
            { text: 'La espada que llevas está incompleta. Puedo oírlo en el metal: le falta una lágrima.' },
            { text: 'La Lágrima de la Primera Brasa está en la Fortaleza Calcinada. La Reina la guarda en su trono, junto a lo que queda de su corazón.' },
            { text: 'Tráemela. Yo haré el resto. Y si la Reina te detiene, recuerda que el fuego también sabe llorar.' },
          ],
        };
      }
      if (g.flags.boss_reina && !g.flags.tear_forged) {
        return {
          portrait: 'serah', speaker: 'Serah', role: 'Herrera de Cindral',
          lines: [
            { text: 'La Lágrima. La noto desde aquí. Quema como un recuerdo que se niega a apagarse.' },
            { text: 'Dame la espada. Esto dolerá un poco. A mí, no a ti.' },
            { text: 'Cuando termine, la Espada Celestial despertará del todo. Y tú tendrás que decidir qué clase de arma quieres ser.', end: true },
          ],
          endEffect: { type: 'forge_tear' },
        };
      }
      if (g.flags.tear_forged) {
        return {
          portrait: 'serah', speaker: 'Serah', role: 'Herrera de Cindral',
          lines: [
            { text: 'La espada canta distinto desde que la forjé. Más alta. Más triste. Como si supiera algo que nosotros no.' },
            { text: 'El Camino Celeste está al este de la ciudad. La Lágrima ha abierto una grieta en el cielo. No mires demasiado tiempo al otro lado.' },
            { text: 'Y si vuelves, tráeme ceniza de Kansordore. Dicen que brilla. Quiero comprobarlo.', choices: [
              { text: 'Muéstrame tu forja.', effect: { type: 'shop', id: 'serah' }, next: 3 },
              { text: 'Solo pasaba a despedirme.', next: 4 },
            ] },
            { text: 'El fuego está encendido. El resto depende de ti.' },
            { text: 'Las despedidas son para los que no piensan volver. Tú vas a volver.' },
          ],
        };
      }
      return {
        portrait: 'serah', speaker: 'Serah', role: 'Herrera de Cindral',
        lines: [
          { text: 'Bienvenido a Cindral. No mires las ruinas demasiado tiempo; se ofenden.' },
          { text: 'Soy Serah. Forjo lo que el fuego permite y rompo lo que no. ¿Qué necesitas?', choices: [
            { text: 'Ver tu forja.', effect: { type: 'shop', id: 'serah' }, next: 2 },
            { text: '¿Qué le pasó a la ciudad?', next: 3 },
            { text: 'Nada. Solo pasaba.', next: 4 },
          ] },
          { text: 'Toca el yunque si quieres. Está caliente. Tú también lo estarás.' },
          { text: 'La Reina vendió su corazón para detener una erupción. La ciudad se salvó y luego se olvidó de quién la había salvado. Eso es Cindral: una gratitud que llegó tarde.' },
          { text: 'Cuando quieras hablar de fuego, ya sabes dónde estoy.' },
        ],
      };
    },
  },

  citizen: {
    name: 'Ciudadano de Cindral', role: 'Superviviente', portrait: 'citizen',
    dialogue(g) {
      return {
        portrait: 'citizen', speaker: 'Ciudadano', role: 'Superviviente de Cindral',
        lines: [
          { text: 'Antes teníamos un mercado, un teatro y un reloj que nunca se atrasaba. Ahora tenemos ceniza y un rey que ya no recuerda su nombre.' },
          { text: 'La Reina no era mala. Era desesperada. La diferencia importa cuando el fuego te llega a la puerta.' },
          { text: 'Si vas a la Fortaleza, no le digas que la perdonamos. Aún no estamos seguros.' },
        ],
      };
    },
  },

  merchant: {
    name: 'Bazar de Cindral', role: 'Comerciante', portrait: 'citizen',
    dialogue(g) {
      return {
        portrait: 'citizen', speaker: 'Comerciante', role: 'Bazar de Cindral',
        lines: [
          { text: 'Ceniza, recuerdos y precios justos. Justos para mí.' },
          { text: '¿Buscas algo que no te recuerde a la guerra? Tengo pociones. Las pociones no recuerdan nada.', choices: [
            { text: 'Veamos.', effect: { type: 'shop', id: 'ciudad' }, next: 2 },
            { text: 'Solo miraba.', next: 3 },
          ] },
          { text: 'Compra dos y te regalo una historia. La historia es mentira, pero el descuento no.' },
          { text: 'Mirar es gratis. Recordar, no.' },
        ],
      };
    },
  },

  archivista: {
    name: 'Archivista', role: 'Guardiana del Templo de Cristal', portrait: 'archivista',
    dialogue(g) {
      if (g.questState('s5') === 'active') {
        return {
          portrait: 'archivista', speaker: 'Archivista', role: 'Guardiana del Templo',
          lines: [
            { text: 'Las esquirlas de estrella cantan cuando las juntas. Llevas ' + g.itemCount('star_shard') + ' de 3.' },
            { text: 'Búscalas en los cofres del templo y en los ecos que aún recuerdan el cielo. No las fuerces: las estrellas se rompen si las agarras con prisa.' },
          ],
        };
      }
      if (g.questState('s5') === 'done') {
        return {
          portrait: 'archivista', speaker: 'Archivista', role: 'Guardiana del Templo',
          lines: [
            { text: 'Las tres esquirlas forman una constelación que no existía. La he llamado Jugador Cero.' },
            { text: 'No es un mapa del cielo. Es un mapa de ti.' },
          ],
        };
      }
      if (g.flags.truth_known) {
        return {
          portrait: 'archivista', speaker: 'Archivista', role: 'Guardiana del Templo',
          lines: [
            { text: 'Has leído la verdad. Ahora llevas una grieta dentro. No te preocupes: todos los que leen lo hacen.' },
            { text: 'La Fisura del Velo está al norte de la Biblioteca. El Arquitecto te espera. No como un enemigo, sino como alguien que lleva demasiado tiempo solo.' },
            { text: 'Decide con cuidado. El mundo no necesita otro dios. Necesita a alguien que se quede.' },
          ],
        };
      }
      return {
        portrait: 'archivista', speaker: 'Archivista', role: 'Guardiana del Templo',
        lines: [
          { text: 'Bienvenido al Templo de Cristal. Aquí no se reza: se recuerda.' },
          { text: 'La Prueba de las Tres Resonancias abre la Biblioteca. Necesitas tres ecos distintos y la voluntad de escucharlos.' },
          { text: 'Los altares del Recuerdo, la Entrega y el Renacer están en la nave. Actívalos con un eco presente. No con una posesión: con una presencia.' },
          { text: 'Y si encuentras esquirlas de estrella, tráemelas. Estoy reconstruyendo una constelación que desapareció la noche de la Ruptura.', choices: [
            { text: 'Buscaré las esquirlas.', effect: { type: 'startQuest', id: 's5' }, next: 4 },
            { text: 'Primero debo completar la prueba.', next: 5 },
          ] },
          { text: 'Gracias. Cada estrella que vuelve es una noche que no se pierde.' },
          { text: 'La prisa es una forma de olvido. Ve despacio; el templo te escucha.' },
        ],
      };
    },
  },
};
// ============================================================
// MISIONES
// ============================================================
export const QUESTS = {
  m1: {
    id: 'm1', title: 'El Despertar', main: true, level: 1,
    desc: 'La Ruptura ha abierto una grieta sobre Brisavelo. La Maestra Elara te ha entregado la Espada Celestial. Es hora de escuchar lo que tiene que decir.',
    steps: [
      { text: 'Habla con la Maestra Elara', event: { type: 'talk', id: 'elara' }, marker: { zone: 'valdoria_village', x: 1000, y: 830, label: 'Elara' } },
      { text: 'Despierta la espada en el santuario de Brisavelo', event: { type: 'interact', id: 'shrine_village' }, marker: { zone: 'valdoria_village', x: 1000, y: 620, label: 'Santuario' } },
    ],
    rewards: { xp: 90, gold: 45, items: [['potion_lumen', 2]] },
    onComplete: { flags: { m1_done: true }, toast: 'La Espada Celestial ha despertado. El Velo ya conoce tu nombre.' },
  },
  m2: {
    id: 'm2', title: 'La Gema Celestial', main: true, level: 3,
    desc: 'Nima, erudita de Kansordore, cree que la Gema Celestial duerme en las ruinas de Alderion. El Guardián de Raíces no permitirá que se la lleven sin una respuesta.',
    steps: [
      { text: 'Cruza la niebla y llega a las Ruinas de Alderion', event: { type: 'reach', zone: 'valdoria_ruins' }, marker: { zone: 'valdoria_ruins', x: 300, y: 900, label: 'Alderion' } },
      { text: 'Derrota al Guardián de Raíces', event: { type: 'boss', id: 'guardian_raiz' }, marker: { zone: 'valdoria_ruins', x: 1200, y: 520, label: 'Guardián' } },
      { text: 'Recupera la Gema Celestial del altar', event: { type: 'interact', id: 'altar_gem' }, marker: { zone: 'valdoria_ruins', x: 1200, y: 820, label: 'Altar de la Gema' } },
    ],
    rewards: { xp: 260, gold: 180, items: [['potion_lumen', 3], ['crystal_shard', 3]] },
    onComplete: { flags: { m2_done: true, gem_taken: true }, toast: 'Has recuperado la Gema Celestial. El camino a Drakmor está abierto.' },
  },
  m3: {
    id: 'm3', title: 'La Lágrima de la Primera Brasa', main: true, level: 7,
    desc: 'La espada necesita la Lágrima de la Primera Brasa para despertar del todo. La Reina Calcinada la guarda en su fortaleza, y no la entregará sin lucha.',
    steps: [
      { text: 'Llega a Cindral y habla con Serah, la herrera', event: { type: 'talk', id: 'serah' }, marker: { zone: 'drakmor_city', x: 720, y: 900, label: 'Serah' } },
      { text: 'Derrota a la Reina Calcinada en la Fortaleza', event: { type: 'boss', id: 'reina_calcinada' }, marker: { zone: 'drakmor_fortress', x: 1200, y: 620, label: 'La Reina' } },
      { text: 'Lleva la Lágrima a Serah y forja la Espada Celestial', event: { type: 'talk', id: 'serah' }, marker: { zone: 'drakmor_city', x: 720, y: 900, label: 'Serah' } },
    ],
    rewards: { xp: 520, gold: 360, items: [['potion_mayor', 3], ['dragon_scale', 2]] },
    onComplete: { flags: { m3_done: true, tear_forged: true }, toast: 'La Espada Celestial ha sido forjada de nuevo. El Camino Celeste se ha abierto.' },
  },
  m4: {
    id: 'm4', title: 'El Nombre del Velo', main: true, level: 12,
    desc: 'Kansordore guarda la verdad sobre el Jugador Cero. Para alcanzarla deberás superar la Prueba de las Tres Resonancias y enfrentarte al Custodio de la Biblioteca.',
    steps: [
      { text: 'Completa la Prueba de las Tres Resonancias', event: { type: 'trial', id: 'trial_done' }, marker: { zone: 'kansordore_temple', x: 1200, y: 900, label: 'Tres Altares' } },
      { text: 'Derrota al Custodio del Velo en la Biblioteca', event: { type: 'boss', id: 'custodio_velo' }, marker: { zone: 'kansordore_library', x: 1100, y: 650, label: 'Custodio' } },
      { text: 'Lee la verdad en el Altar de la Verdad', event: { type: 'interact', id: 'altar_truth' }, marker: { zone: 'kansordore_library', x: 1100, y: 420, label: 'Altar de la Verdad' } },
    ],
    rewards: { xp: 900, gold: 600, items: [['celestial_feather', 3], ['phoenix_tear', 1]] },
    onComplete: { flags: { m4_done: true, truth_known: true }, toast: 'Has leído la verdad. La Fisura del Velo te reconoce.' },
  },
  m5: {
    id: 'm5', title: 'La Convergencia Absoluta', main: true, level: 15,
    desc: 'El Arquitecto del Velo te espera en el Corazón de la Convergencia. Lo que decidas allí no estará escrito en ninguna profecía.',
    steps: [
      { text: 'Derrota al Arquitecto del Velo', event: { type: 'boss', id: 'arquitecto' }, marker: { zone: 'kansordore_void', x: 1000, y: 750, label: 'El Arquitecto' } },
      { text: 'Decide el destino del mundo en el Altar de la Convergencia', event: { type: 'interact', id: 'altar_convergence' }, marker: { zone: 'kansordore_void', x: 1000, y: 420, label: 'Altar' } },
    ],
    rewards: { xp: 0, gold: 0, items: [] },
    onComplete: { flags: { m5_done: true }, toast: 'La Convergencia ha terminado. El mundo recordará lo que elijas.' },
  },

  s1: {
    id: 's1', title: 'La despensa de Marta', main: false, level: 2,
    desc: 'Marta necesita tres hierbas de brisa para preparar el guiso que su madre hacía antes de la Ruptura.',
    steps: [
      { text: 'Recoge 3 hierbas de brisa en la Pradera de Lumen', event: { type: 'collect', id: 'herb_brisa', count: 3 }, marker: { zone: 'valdoria_meadow', x: 900, y: 500, label: 'Hierbas de brisa' } },
      { text: 'Lleva las hierbas a Marta', event: { type: 'talk', id: 'marta' }, marker: { zone: 'valdoria_village', x: 470, y: 1090, label: 'Marta' } },
    ],
    rewards: { xp: 120, gold: 90, items: [['potion_lumen', 3], ['stamina_herb', 2]] },
    onComplete: { toast: 'Marta ha recuperado una receta. El guiso vuelve a oler a hogar.' },
  },
  s2: {
    id: 's2', title: 'El eco perdido', main: false, level: 3,
    desc: 'Kael vio un eco asustado en el claro del este del Bosque de las Voces. No quiere capturarlo: quiere que alguien lo acompañe a casa.',
    steps: [
      { text: 'Encuentra al eco perdido en el Bosque de las Voces', event: { type: 'interact', id: 'lost_echo' }, marker: { zone: 'valdoria_forest', x: 2200, y: 400, label: 'Eco perdido' } },
      { text: 'Cuéntale a Kael que el eco está a salvo', event: { type: 'talk', id: 'kael' }, marker: { zone: 'valdoria_meadow', x: 700, y: 800, label: 'Kael' } },
    ],
    rewards: { xp: 160, gold: 120, items: [['amulet_resonancia', 1]] },
    onComplete: { toast: 'El eco perdido ha encontrado un nuevo hogar: tu compañía.' },
  },
  s3: {
    id: 's3', title: 'Ceniza en la sangre', main: false, level: 8,
    desc: 'Ordo quiere despejar el camino a Cindral. Cinco criaturas de Drakmor, ni una más. La venganza también tiene un límite.',
    steps: [
      { text: 'Derrota a 5 criaturas de Drakmor', event: { type: 'kill', tag: 'drakmor', count: 5 }, marker: { zone: 'drakmor_pass', x: 1400, y: 900, label: 'Criaturas de Drakmor' } },
      { text: 'Vuelve con Ordo', event: { type: 'talk', id: 'ordo' }, marker: { zone: 'drakmor_pass', x: 620, y: 1100, label: 'Ordo' } },
    ],
    rewards: { xp: 300, gold: 220, items: [['sword_ceniza', 1], ['potion_mayor', 2]] },
    onComplete: { toast: 'Ordo ha vuelto a sonreír. Es un gesto pequeño, pero pesa.' },
  },
  s4: {
    id: 's4', title: 'La campana rota', main: false, level: 6,
    desc: 'El Hermano Cael cuida de las ruinas de Alderion. Quiere devolver la voz a la campana de la plaza con tres fragmentos de cristal.',
    steps: [
      { text: 'Reúne 3 fragmentos de cristal', event: { type: 'collect', id: 'crystal_shard', count: 3 }, marker: { zone: 'valdoria_ruins', x: 1900, y: 500, label: 'Fragmentos de cristal' } },
      { text: 'Haz sonar la Campana Rota', event: { type: 'interact', id: 'bell_ruins' }, marker: { zone: 'valdoria_ruins', x: 500, y: 1200, label: 'Campana Rota' } },
      { text: 'Habla con el Hermano Cael', event: { type: 'talk', id: 'cael' }, marker: { zone: 'valdoria_ruins', x: 450, y: 1050, label: 'Cael' } },
    ],
    rewards: { xp: 260, gold: 150, items: [['ring_suerte', 1], ['crystal_shard', 2]] },
    onComplete: { toast: 'La campana de Alderion ha vuelto a sonar. Alguien, en algún lugar, ha levantado la cabeza.' },
  },
  s5: {
    id: 's5', title: 'Estrellas fugaces', main: false, level: 12,
    desc: 'La Archivista reconstruye una constelación perdida. Necesita tres esquirlas de estrella para completar el mapa.',
    steps: [
      { text: 'Reúne 3 esquirlas de estrella en Kansordore', event: { type: 'collect', id: 'star_shard', count: 3 }, marker: { zone: 'kansordore_temple', x: 1900, y: 500, label: 'Esquirlas de estrella' } },
      { text: 'Lleva las esquirlas a la Archivista', event: { type: 'talk', id: 'archivista' }, marker: { zone: 'kansordore_temple', x: 1200, y: 1250, label: 'Archivista' } },
    ],
    rewards: { xp: 500, gold: 300, items: [['eye_veil', 1], ['star_shard', 1]] },
    onComplete: { toast: 'La constelación del Jugador Cero vuelve a brillar.' },
  },
};

export const QUEST_ORDER = ['m1', 'm2', 'm3', 'm4', 'm5', 's1', 's2', 's3', 's4', 's5'];

// ============================================================
// CODEX / LORE
// ============================================================
export const LORE = {
  primera_brasa: { title: 'La Primera Brasa', category: 'Origen', text: 'Antes de los reinos, antes de los nombres, hubo una brasa que soñó. No soñó con dioses ni con héroes: soñó con un lugar donde las cosas pudieran elegir. De ese sueño nacieron el cielo, la tierra y los ecos. La Brasa sigue ardiendo en algún lugar bajo el mundo, y todo lo que existe es una chispa de su paciencia.' },
  gema: { title: 'La Gema Celestial', category: 'Reliquias', text: 'La Gema no es una piedra: es una memoria que aprendió a tener forma. Los antiguos la tallaron con el primer recuerdo del mundo y la engarzaron en la Espada Celestial para que nadie pudiera olvidar el origen. Quien la sostiene escucha una pregunta. La pregunta cambia según quien la escucha.' },
  jarra: { title: 'La Jarra de Origen', category: 'Reliquias', text: 'Un recipiente de barro sin fondo visible. En ella, los reyes-sabios de Kansordore encerraron el sueño de la Primera Brasa para que el mundo no se deshiciera. La Jarra no contiene agua ni vino: contiene la posibilidad de que todo vuelva a empezar. Romperla sería el acto más hermoso y más terrible que existe.' },
  lagrima: { title: 'La Lágrima de la Primera Brasa', category: 'Reliquias', text: 'Cuando la Primera Brasa vio por primera vez el dolor de sus criaturas, lloró. La lágrima no se evaporó: se volvió cristal. La Reina Calcinada la guardaba en su trono porque era lo único que le quedaba de un corazón que había vendido. La espada la necesita para recordar que el fuego también puede elegir no quemar.' },
  velo: { title: 'El Velo', category: 'El Velo', text: 'El Velo no es una tela ni una sombra. Es la herida entre lo soñado y lo que sueña. Cuando el mundo duele demasiado, el Velo se abre para ofrecer olvido. Su promesa es simple: si dejas de recordar, dejarás de sufrir. Su precio también es simple: dejarás de ser.' },
  ruptura: { title: 'La Ruptura', category: 'El Velo', text: 'La Ruptura fue el día en que el cielo se partió sobre Valdoria. No fue una explosión: fue un suspiro. Durante un instante, todos los habitantes del mundo olvidaron el nombre de la persona que más querían. Luego lo recordaron. Casi todos.' },
  resonancia: { title: 'La Resonancia', category: 'Ecos', text: 'Resonar es escuchar un recuerdo y permitir que te cambie. Los ecos no se capturan: se vinculan. Un vínculo no es una cadena, es un acorde. Si una de las dos voces deja de sonar, el acorde se rompe, pero la música no desaparece del todo.' },
  despertar: { title: 'El Despertar', category: 'Profecía', text: 'La Espada Celestial duerme hasta que encuentra a alguien que no quiere usarla. Entonces despierta, y con ella despiertan los ecos que habían elegido callar. El Despertar no es una victoria: es una responsabilidad.' },
  convergencia: { title: 'La Convergencia Absoluta', category: 'Profecía', text: 'Cuando el Velo haya bebido suficientes recuerdos, se tocará a sí mismo. Ese instante se llama Convergencia. En ese momento, todas las memorias del mundo estarán en el mismo lugar. Y alguien tendrá que decidir qué hacer con ellas.' },
  jugador_cero: { title: 'La Profecía de Jugador Cero', category: 'Profecía', text: 'Los oráculos predijeron a todos los héroes posibles. Nombraron reyes, traidores, santos y monstruos. Pero había una pieza que no aparecía en el tablero: alguien que no estaba destinado a nada. La Profecía lo llamó Jugador Cero. No porque no valga nada, sino porque todo empieza en él.' },
  valdoria: { title: 'Valdoria', category: 'Reinos', text: 'Tres valles, siete aldeas y un bosque que escucha. Valdoria sobrevivió a todas las guerras porque sus gentes aprendieron a olvidarlas. Ahora el Velo les está devolviendo el favor.' },
  drakmor: { title: 'Drakmor', category: 'Reinos', text: 'Un reino de lava y obsidiana que ardió dos veces: una por la montaña y otra por la gente. Sus habitantes dicen que el fuego no destruye: revela. Cindral sigue en pie porque alguien decidió que la ceniza también puede ser un hogar.' },
  cindral: { title: 'Cindral', category: 'Reinos', text: 'La ciudad que sobrevivió a la erupción gracias a un sacrificio que luego quiso olvidar. Sus calles huelen a hierro y a gratitud rancia. En su forja, Serah trabaja el metal con la misma furia con la que otros rezan.' },
  reina: { title: 'Seraphine, la Reina Calcinada', category: 'Personajes', text: 'No nació monstruo. Nació reina. Cuando la montaña despertó, ofreció su corazón a la Primera Brasa para salvar Cindral. La Brasa aceptó. El pueblo sobrevivió y, con el tiempo, prefirió recordarla como la causa del fuego y no como la razón de que siguiera habiendo ciudad.' },
  alderion: { title: 'Alderion', category: 'Reinos', text: 'La ciudad que escuchó el primer sueño. Sus sabios construyeron altares para recordar, no para adorar. Cuando el Velo llegó, no lucharon: discutieron. La discusión sigue abierta bajo las ruinas, y el Guardián de Raíces es su último argumento.' },
  ecos: { title: 'Los Ecos', category: 'Ecos', text: 'Las criaturas del mundo no son animales ni espíritus. Son recuerdos que tomaron forma para no perderse. Por eso cada eco tiene un nombre, una canción y un miedo. Quien aprende a escucharlos descubre que coleccionar no es poseer: es acompañar.' },
  arquitecto: { title: 'El Arquitecto del Velo', category: 'Personajes', text: 'Aldric, el primer rey-sabio de Kansordore, quiso encerrar el sufrimiento del mundo en un solo sueño. Lo consiguió. El sueño lo encerró a él. Durante mil años ha estado solo dentro de su propia obra, escuchando el dolor de todos y sin poder olvidar ninguno. Ahora cree que la única salida es la Convergencia.' },
  ascension: { title: 'La Ascensión', category: 'Profecía', text: 'Algunos textos hablan de una tercera vía: ni sellar el Velo ni romperlo, sino ascender a través de él. El que asciende deja de ser una persona y se convierte en una memoria que sostiene a las demás. No es una muerte. Es una forma muy solitaria de quedarse.' },
};

export const DEFAULT_LORE = ['primera_brasa', 'valdoria', 'resonancia', 'ecos'];

// ============================================================
// CINEMÁTICAS
// ============================================================
export const CINEMATICS = {
  intro: {
    id: 'intro', title: 'La Profecía de Jugador Cero', pages: [
      { eyebrow: 'ANTES DEL TIEMPO', title: 'La Primera Brasa', text: 'Antes de los reinos y de los nombres, una brasa soñó un lugar donde las cosas pudieran elegir. De su sueño nacieron el cielo, la tierra y los ecos: recuerdos que aprendieron a caminar.', art: 'ember' },
      { eyebrow: 'LOS ANTIGUOS', title: 'La Jarra de Origen', text: 'Los reyes-sabios encerraron aquel sueño en la Jarra de Origen y tallaron la Gema Celestial para que nadie pudiera olvidar el origen. Durante siglos, el mundo vivió dentro de una promesa.', art: 'jar' },
      { eyebrow: 'LA RUPTURA', title: 'El Velo', text: 'Pero toda memoria desea ser recordada. El Velo es la herida entre lo soñado y lo que sueña. Cuando el dolor se volvió demasiado grande, comenzó a beber los recuerdos de Valdoria.', art: 'veil' },
      { eyebrow: 'LA PROFECÍA', title: 'Jugador Cero', text: 'Los oráculos nombraron a todos los héroes posibles. A todos menos a uno. Alguien que no estaba en el tablero. Alguien que podría elegir. Ese alguien eres tú.', art: 'sword' },
    ],
  },
  awakening: {
    id: 'awakening', title: 'El Despertar', pages: [
      { eyebrow: 'SANTUARIO DE BRISAVELO', title: 'El pulso', text: 'La espada late en tus manos como un animal pequeño. El santuario responde con una luz que no viene de ninguna antorcha. Por primera vez, el Velo duda.', art: 'shrine' },
      { eyebrow: 'RESONANCIA', title: 'Lumito', text: 'Un zorro de luz sale de entre las piedras. No te teme. Inclina la cabeza, como si llevara mucho tiempo esperando una voz que dijera su nombre. Tú lo dices. El vínculo se cierra.', art: 'lumito' },
      { eyebrow: 'EL DESPERTAR', title: 'Una promesa', text: 'La Espada Celestial recuerda. No todo, pero sí lo suficiente para saber que fue creada para algo más que matar. Algo despierta en Valdoria. Y algo, muy lejos, abre los ojos.', art: 'sword' },
    ],
  },
  guardian: {
    id: 'guardian', title: 'El Guardián de Raíces', pages: [
      { eyebrow: 'ALDERION', title: 'La última pregunta', text: 'El Guardián no ruge. Se levanta como un bosque que hubiera estado arrodillado durante siglos. Su voz es el crujido de mil raíces y una pregunta que no tiene respuesta.', art: 'guardian' },
      { eyebrow: 'COMBATE', title: 'La Gema despierta', text: 'La Gema Celestial brilla en su pecho. No te ataca por odio: te ataca porque eres la primera persona que podría llevársela. Y él ya no sabe qué haría el mundo sin ella.', art: 'gem' },
    ],
  },
  guardian_outro: {
    id: 'guardian_outro', title: 'Una respuesta', pages: [
      { eyebrow: 'ALDERION', title: 'El bosque se inclina', text: 'El Guardián cae de rodillas y su cuerpo se convierte en un círculo de árboles nuevos. La Gema rueda hasta tus pies. Al tocarla, oyes una voz que no es la tuya: "Gracias por no destruirme."', art: 'gem' },
      { eyebrow: 'LA GEMA CELESTIAL', title: 'El camino a Drakmor', text: 'La espada absorbe la Gema. El metal canta. En algún lugar al norte, una puerta de piedra se abre y el viento huele a ceniza.', art: 'sword' },
    ],
  },
  reina: {
    id: 'reina', title: 'La Reina Calcinada', pages: [
      { eyebrow: 'FORTALEZA CALCINADA', title: 'Seraphine', text: 'La Reina no está sentada en el trono. Está de pie, rodeada de lava, con un corazón de brasa que ilumina su armadura desde dentro. "Así que Ordo sigue enviando héroes", dice. "Dile que ya no quedan."', art: 'queen' },
      { eyebrow: 'LA LÁGRIMA', title: 'Lo que quedó', text: 'En su mano izquierda brilla la Lágrima de la Primera Brasa. En la derecha, una espada que fue de su pueblo. Solo una de las dos es un arma. La otra es una disculpa.', art: 'tear' },
    ],
  },
  reina_outro: {
    id: 'reina_outro', title: 'El fuego que llora', pages: [
      { eyebrow: 'FORTALEZA CALCINADA', title: 'Una reina, al fin', text: 'La Reina cae y la lava se apaga a su alrededor. Antes de deshacerse, te mira sin odio. "No le cuentes a Cindral que lloré", dice. "Que recuerden el fuego. Es más fácil."', art: 'queen' },
      { eyebrow: 'LA LÁGRIMA', title: 'Una gota de origen', text: 'La Lágrima flota sobre su trono. Al tomarla, sientes el peso de todas las decisiones que el mundo tomó para seguir existiendo. La espada la reconoce. La espada recuerda.', art: 'tear' },
    ],
  },
  forge_tear: {
    id: 'forge_tear', title: 'La Espada Celestial', pages: [
      { eyebrow: 'FORJA DE CINDRAL', title: 'Serah', text: 'Serah coloca la Lágrima sobre la Gema y golpea el metal. El sonido no es metálico: es un acorde. La forja entera se ilumina y, por un instante, Cindral huele a lluvia.', art: 'forge' },
      { eyebrow: 'EL DESPERTAR', title: 'Una memoria con filo', text: 'La Espada Celestial despierta del todo. Ya no es un recuerdo: es una decisión. En su hoja ves reflejados a todos los que te han acompañado. Y a uno que todavía no conoces.', art: 'sword' },
    ],
  },
  m4_intro: {
    id: 'm4_intro', title: 'El Templo de Cristal', pages: [
      { eyebrow: 'KANSORDORE', title: 'Donde el cielo aprende', text: 'El Camino Celeste te deja en un templo suspendido entre dos cielos. No hay suelo bajo las columnas, solo estrellas que fingen ser suelo. Una archivista te espera con una lámpara que no alumbra: recuerda.', art: 'temple' },
      { eyebrow: 'LA PRUEBA', title: 'Tres resonancias', text: 'Para abrir la Biblioteca Prohibida deberás activar los altares del Recuerdo, la Entrega y el Renacer. No con una posesión. Con una presencia. Los ecos que llevas contigo tendrán que elegir quedarse.', art: 'temple' },
    ],
  },
  truth: {
    id: 'truth', title: 'La Verdad del Jugador Cero', pages: [
      { eyebrow: 'BIBLIOTECA PROHIBIDA', title: 'El libro que se escribe', text: 'El Altar de la Verdad abre un libro que no tiene páginas fijas. En él está la historia del mundo. Y, al final, una frase que cambia mientras la lees: "El Jugador Cero no vino a salvar el mundo. Vino a decidir si el mundo merece ser recordado."', art: 'library' },
      { eyebrow: 'LA JARRA', title: 'El sueño encerrado', text: 'La Jarra de Origen no está en Kansordore. Está en el Velo. El Arquitecto la ha convertido en el corazón de la Convergencia. Si se rompe, el mundo despertará. Si se sella, el mundo seguirá soñando. Si se abre, alguien tendrá que soñarlo de nuevo.', art: 'jar' },
      { eyebrow: 'EL ARQUITECTO', title: 'Aldric', text: 'No es un monstruo. Es un rey que quiso quitarle el dolor al mundo y se quedó solo con todo el dolor del mundo dentro. Te espera en la Fisura. No para luchar, sino para que alguien, por fin, le diga que puede parar.', art: 'architect' },
    ],
  },
  custodio: {
    id: 'custodio', title: 'El Custodio del Velo', pages: [
      { eyebrow: 'BIBLIOTECA PROHIBIDA', title: 'El último lector', text: 'El Custodio era el bibliotecario que leyó el último libro y descubrió que él era un personaje. Ahora guarda la puerta para que nadie más lo sepa. "No es crueldad", dice. "Es piedad."', art: 'custodian' },
      { eyebrow: 'COMBATE', title: 'Páginas cortantes', text: 'Las estanterías se abren como alas. Miles de páginas se convierten en filos. Detrás de su máscara, el Custodio llora. Pero no se aparta.', art: 'library' },
    ],
  },
  custodio_outro: {
    id: 'custodio_outro', title: 'La página en blanco', pages: [
      { eyebrow: 'BIBLIOTECA PROHIBIDA', title: 'Un lector libre', text: 'El Custodio cae y su máscara se rompe. Debajo no hay nada: solo una página en blanco. "Gracias", susurra. "Ahora puedes escribir lo que sigue."', art: 'library' },
    ],
  },
  m5_intro: {
    id: 'm5_intro', title: 'La Fisura del Velo', pages: [
      { eyebrow: 'CORAZÓN DE LA CONVERGENCIA', title: 'El lugar entre', text: 'No hay arriba ni abajo. Hay una figura sentada sobre una Jarra que flota en el vacío. A su alrededor, todos los recuerdos del mundo giran como un cielo enfermo.', art: 'void' },
      { eyebrow: 'EL ARQUITECTO', title: 'Mil años de soledad', text: '"Por fin", dice Aldric. "Alguien que no está en el libro. ¿Sabes cuánto tiempo llevo esperando a alguien que pueda elegir?" Su voz suena a todas las voces que ha olvidado.', art: 'architect' },
    ],
  },
  arquitecto: {
    id: 'arquitecto', title: 'El Arquitecto del Velo', pages: [
      { eyebrow: 'CONVERGENCIA', title: 'El primer rey-sabio', text: 'Aldric se levanta y el vacío se pliega a su alrededor. "Quise quitarle el dolor al mundo", dice. "Lo metí en un sueño. Pero el sueño me metió a mí dentro. Ahora el dolor y yo somos la misma cosa."', art: 'architect' },
      { eyebrow: 'COMBATE', title: 'El peso de todos', text: 'Detrás de él, la Jarra de Origen late con la forma de todos los recuerdos que ha bebido. No lucha para destruirte: lucha para que no lo obligues a seguir recordando.', art: 'jar' },
    ],
  },
  arquitecto_outro: {
    id: 'arquitecto_outro', title: 'El derecho a elegir', pages: [
      { eyebrow: 'CONVERGENCIA', title: 'Aldric', text: 'El Arquitecto cae de rodillas. La Jarra flota entre vosotros, llena de un sueño que pesa más que el mundo. "Elige tú", dice. "Yo ya no sé qué es piedad y qué es miedo."', art: 'jar' },
    ],
  },
};

// ============================================================
// FINALES
// ============================================================
export const FINAL_CHOICES = [
  {
    id: 'seal', title: 'Sellar el Velo', icon: '◈',
    desc: 'Cierra la herida con la Espada Celestial. El mundo seguirá soñando, pero olvidará todo lo que ocurrió. Tú también.',
    consequence: 'Bittersweet · El mundo olvida, pero vive.',
  },
  {
    id: 'ascend', title: 'Ascender', icon: '✧',
    desc: 'Entra en la Jarra y conviértete en la memoria que sostiene el sueño. Nadie volverá a estar solo, pero tú dejarás de ser una persona.',
    consequence: 'Trascendente · Te conviertes en la luz que guía.',
  },
  {
    id: 'break', title: 'Romper la Convergencia', icon: '✦',
    desc: 'Rompe la Jarra y devuelve al mundo el derecho a equivocarse. Requiere 8 ecos vinculados y haber leído la verdad.',
    consequence: 'Verdadero · El mundo despierta y elige por sí mismo.',
    req: { creatures: 8, flags: ['truth_known'] },
    locked: 'Necesitas al menos 8 ecos vinculados y haber leído la verdad en la Biblioteca.',
  },
];

export const ENDINGS = {
  seal: {
    id: 'seal', title: 'El Sueño Eterno', subtitle: 'Final del Sello', art: 'ending_seal',
    pages: [
      'Clavas la Espada Celestial en el corazón de la Jarra. El Velo se cierra como una herida que decide dejar de sangrar. El mundo respira.',
      'Valdoria vuelve a oler a pan. Cindral vuelve a tener mercado. Kansordore vuelve a leer. Nadie recuerda la Convergencia, ni al Arquitecto, ni a la Reina. Tampoco a ti.',
      'En Brisavelo, una niña llamada Lía encuentra una espada sin nombre clavada en el santuario. Al tocarla, sonríe sin saber por qué. En algún lugar, un zorro de luz levanta las orejas.',
      'El mundo sigue soñando. Es un final feliz, aunque nadie sepa que lo es. A veces, eso es suficiente.',
    ],
  },
  ascend: {
    id: 'ascend', title: 'La Nueva Estrella', subtitle: 'Final de la Ascensión', art: 'ending_ascend',
    pages: [
      'Entras en la Jarra. El dolor de mil años te atraviesa y, por primera vez, no te rompe. Te conviertes en la memoria que sostiene el sueño.',
      'Desde lo alto, ves a tus compañeros volver a casa. Nima escribe un libro que nadie cree. Serah forja una espada que no corta. Ordo planta un árbol en el desfiladero. Lumito duerme en tu lado del cielo.',
      'Los ecos que vinculaste llevan tu luz a todos los rincones del mundo. Nadie vuelve a estar solo. Pero tú ya no puedes bajar a caminar entre ellos.',
      'En las noches claras, una estrella nueva aparece sobre Valdoria. Los niños la llaman "la que escucha". No saben que, si les susurras, responde.',
    ],
  },
  break: {
    id: 'break', title: 'Jugador Cero', subtitle: 'Final Verdadero', art: 'ending_break',
    pages: [
      'Rompes la Jarra. No con la espada, sino con las manos. El sueño de la Primera Brasa se derrama sobre el Velo y, por primera vez en mil años, el mundo se ve a sí mismo sin filtros.',
      'El dolor no desaparece. La pérdida no se borra. Pero tampoco se queda quieta. La gente empieza a equivocarse, a elegir, a cambiar de opinión. Valdoria reconstruye sus casas sin saber si volverán a caer. Cindral enciende una forja que no promete nada. Kansordore abre sus bibliotecas y deja que los libros se equivoquen.',
      'El Arquitecto, libre al fin, se sienta en el borde del vacío y llora. No de tristeza. De alivio. "Gracias", dice, "por no darme la razón".',
      'Tú vuelves a ser mortal. La espada se convierte en una semilla y Lumito la entierra en el santuario de Brisavelo. Nadie escribe una profecía sobre lo que ocurre después. Es lo mejor que te podía pasar.',
      'Años más tarde, un viajero llega a la aldea y pregunta por la Espada Celestial. Lía, ya mayor, señala un árbol que brilla al atardecer y dice: "No era una espada. Era una pregunta. Y todavía estamos aprendiendo a contestarla."',
    ],
  },
};

// ============================================================
// BOTÍN, MAPA Y UTILIDADES
// ============================================================
export const LOOT_TABLES = {
  valdoria: {
    1: ['potion_lumen', 'herb_brisa', 'crystal_shard', 'mana_tears'],
    2: ['potion_lumen', 'crystal_shard', 'stamina_herb', 'amulet_resonancia', 'herb_brisa'],
    3: ['potion_mayor', 'crystal_shard', 'ring_suerte', 'boots_viento', 'bond_essence'],
  },
  drakmor: {
    1: ['potion_lumen', 'ember_ash', 'crystal_shard', 'stamina_herb'],
    2: ['potion_mayor', 'ember_ash', 'dragon_scale', 'sword_ceniza', 'mana_tears'],
    3: ['potion_mayor', 'dragon_scale', 'tear_ember', 'phoenix_tear', 'ember_ash'],
  },
  kansordore: {
    1: ['potion_mayor', 'star_shard', 'celestial_feather', 'mana_tears'],
    2: ['potion_mayor', 'star_shard', 'celestial_feather', 'eye_veil', 'phoenix_tear'],
    3: ['armor_celeste', 'diadema_celeste', 'star_shard', 'phoenix_tear', 'veil_core'],
  },
};

export const REGION_ZONES = {
  valdoria: ['valdoria_village', 'valdoria_meadow', 'valdoria_forest', 'valdoria_ruins'],
  drakmor: ['drakmor_pass', 'drakmor_city', 'drakmor_fortress'],
  kansordore: ['kansordore_temple', 'kansordore_library', 'kansordore_void'],
};

export const ZONE_ORDER = [
  'valdoria_village', 'valdoria_meadow', 'valdoria_forest', 'valdoria_ruins',
  'drakmor_pass', 'drakmor_city', 'drakmor_fortress',
  'kansordore_temple', 'kansordore_library', 'kansordore_void',
];

export const SHRINE_ZONES = ['valdoria_village', 'valdoria_meadow', 'valdoria_forest', 'valdoria_ruins', 'drakmor_pass', 'drakmor_city', 'drakmor_fortress', 'kansordore_temple', 'kansordore_library'];


