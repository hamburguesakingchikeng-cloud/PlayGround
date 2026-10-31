// La Espada Celestial — world data, stats and dialogue.
// Pure data + a deterministic map builder so every worker renders the same world.

export const TILE = 32
export const MAP_W = 48
export const MAP_H = 36
export const WALK_TIME = 0.15

export const TT = Object.freeze({
  GRASS: 0,
  TALL: 1,
  TREE: 2,
  WATER: 3,
  STONE: 4,
  HOUSE: 5,
  WALL: 6,
  ALTAR: 7,
  FLOWER: 8,
  ROCK: 9,
  BRIDGE: 10,
  PATH: 11,
})

export const SOLID = new Set([TT.TREE, TT.WATER, TT.HOUSE, TT.WALL, TT.ROCK, TT.ALTAR])

function mulberry32(seed) {
  let a = seed >>> 0
  return function random() {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function buildWorld() {
  const grid = new Uint8Array(MAP_W * MAP_H).fill(TT.GRASS)
  const random = mulberry32(0x5eed1a2b)
  const inside = (x, y) => x >= 0 && y >= 0 && x < MAP_W && y < MAP_H
  const set = (x, y, type) => {
    if (inside(x, y)) grid[y * MAP_W + x] = type
  }
  const rect = (x0, y0, x1, y1, type) => {
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) set(x, y, type)
  }

  // Stone frame of the valley.
  rect(0, 0, MAP_W - 1, 1, TT.ROCK)
  rect(0, 0, 1, MAP_H - 1, TT.ROCK)
  rect(MAP_W - 2, 0, MAP_W - 1, MAP_H - 1, TT.ROCK)
  rect(0, MAP_H - 2, MAP_W - 1, MAP_H - 1, TT.TREE)

  // Temple of the Celestial Sword.
  rect(20, 3, 28, 7, TT.STONE)
  rect(19, 2, 29, 2, TT.WALL)
  rect(19, 2, 19, 8, TT.WALL)
  rect(29, 2, 29, 8, TT.WALL)
  rect(19, 8, 29, 8, TT.WALL)
  rect(23, 8, 25, 8, TT.STONE)
  rect(24, 4, 24, 4, TT.ALTAR)

  // The long path from temple gate to the village.
  rect(23, 9, 25, 27, TT.PATH)

  // River Luna with a wooden bridge.
  rect(2, 20, 45, 21, TT.WATER)
  rect(23, 20, 25, 21, TT.BRIDGE)

  // Village plaza.
  rect(20, 28, 28, 32, TT.STONE)
  rect(23, 27, 25, 27, TT.STONE)

  // Houses.
  rect(7, 26, 13, 29, TT.HOUSE)
  rect(32, 26, 37, 29, TT.HOUSE)
  set(21, 31, TT.ROCK) // the old well

  // Bamboo forest: trees and tall grass, never on the road.
  for (let y = 9; y <= 19; y++) {
    for (let x = 3; x <= 44; x++) {
      if (x >= 22 && x <= 26) continue
      const current = grid[y * MAP_W + x]
      if (current !== TT.GRASS) continue
      const roll = random()
      if (roll < 0.2) set(x, y, TT.TREE)
      else if (roll < 0.62) set(x, y, TT.TALL)
      else if (roll < 0.66) set(x, y, TT.FLOWER)
    }
  }

  // A softer ring of trees and brush along the river banks.
  for (let x = 3; x <= 44; x++) {
    if (x >= 22 && x <= 26) continue
    if (random() < 0.35) set(x, 19, TT.TALL)
    if (random() < 0.25) set(x, 22, TT.TALL)
  }

  // Village outskirts: flowers, rocks and a few tall patches.
  for (let y = 25; y <= 32; y++) {
    for (let x = 3; x <= 44; x++) {
      const current = grid[y * MAP_W + x]
      if (current !== TT.GRASS) continue
      const roll = random()
      if (roll < 0.05) set(x, y, TT.ROCK)
      else if (roll < 0.16) set(x, y, TT.FLOWER)
      else if (roll < 0.22) set(x, y, TT.TALL)
    }
  }

  // Keep the spawn and NPC tiles clear.
  const clear = [
    [24, 32], [23, 32], [25, 32], [24, 31], [24, 33],
    [21, 29], [22, 29], [20, 30], [27, 31], [28, 31], [26, 23], [25, 23],
  ]
  for (const [x, y] of clear) if (grid[y * MAP_W + x] === TT.TREE || grid[y * MAP_W + x] === TT.ROCK) set(x, y, TT.GRASS)

  const npcs = [
    { id: 'mei', name: 'Anciana Mei', x: 21, y: 29, sprite: 'elder', facing: 'down' },
    { id: 'jun', name: 'Jun', x: 27, y: 31, sprite: 'child', facing: 'left' },
    { id: 'su', name: 'Vigía Su', x: 26, y: 23, sprite: 'guard', facing: 'down' },
  ]

  return { grid, spawn: { x: 24, y: 32 }, npcs, altar: { x: 24, y: 4 } }
}

export function tileAt(world, x, y) {
  if (x < 0 || y < 0 || x >= MAP_W || y >= MAP_H) return TT.ROCK
  return world.grid[y * MAP_W + x]
}

export function zoneAt(y) {
  if (y <= 8) return 'Templo del Filo'
  if (y <= 19) return 'Bosque de Bambú'
  if (y <= 24) return 'Ribera del Río Luna'
  return 'Aldea de Lianhua'
}

export function xpToNext(level) {
  return 40 + (level - 1) * 55
}

export const SKILLS = {
  tajo: {
    id: 'tajo', name: 'Tajo', cost: 0, kind: 'attack', mult: 1, hits: 1, crit: 0.08,
    desc: 'Un corte firme con la espada de madera.',
  },
  viento: {
    id: 'viento', name: 'Tajo de Viento', cost: 8, kind: 'attack', mult: 0.68, hits: 2, crit: 0.12,
    desc: 'Dos cortes rápidos que cortan el aire.',
  },
  lunar: {
    id: 'lunar', name: 'Filo Lunar', cost: 12, kind: 'attack', mult: 1.85, hits: 1, crit: 0.28,
    desc: 'Un golpe amplio cargado de luz fría.',
  },
  respiracion: {
    id: 'respiracion', name: 'Respiración', cost: 0, kind: 'heal', heal: 0.22, qi: 6,
    desc: 'Recupera un 22% de vida y 6 de qi.',
  },
  guardia: {
    id: 'guardia', name: 'Guardia de Jade', cost: 0, kind: 'guard', guard: 0.45, qi: 8,
    desc: 'Reduce el próximo daño un 45% y recupera 8 de qi.',
  },
  celestial: {
    id: 'celestial', name: 'Filo Celestial', cost: 14, kind: 'attack', mult: 2.5, hits: 1, crit: 0.35,
    desc: 'El filo que partió la noche. Daño devastador.',
  },
}

export const ITEMS = {
  potion: { id: 'potion', name: 'Poción de Qi', desc: 'Restaura 40 de vida.', heal: 40 },
  herb: { id: 'herb', name: 'Hierba de Loto', desc: 'Restaura 25 de vida y 8 de qi.', heal: 25, qi: 8 },
  elixir: { id: 'elixir', name: 'Elixir del Alba', desc: 'Restaura toda la vida y el qi.', full: true },
}

export const ENEMIES = {
  bamboo: {
    key: 'bamboo', name: 'Espíritu de Bambú', sprite: 'bamboo', hp: 38, atk: 8, def: 1, xp: 22,
    intro: 'El bambú cruje y algo te observa entre los tallos.',
    moves: [
      { name: 'Látigo de bambú', mult: 1, weight: 3, text: 'Un tallo golpea tu costado.' },
      { name: 'Susurro verde', mult: 0.7, weight: 2, text: 'El espíritu susurra y te desequilibra.' },
    ],
  },
  wolf: {
    key: 'wolf', name: 'Lobo de Niebla', sprite: 'wolf', hp: 54, atk: 11, def: 2, xp: 34,
    intro: 'La niebla se rompe en colmillos.',
    moves: [
      { name: 'Mordida gris', mult: 1.1, weight: 3, text: 'El lobo se lanza a tu brazo.' },
      { name: 'Zarpazo', mult: 0.85, weight: 2, text: 'Las garras te rozan el hombro.' },
    ],
  },
  guardian: {
    key: 'guardian', name: 'Guardián de Jade', sprite: 'guardian', hp: 190, atk: 15, def: 4, xp: 240,
    boss: true,
    intro: 'El Guardián de Jade abre los ojos. Cien años de polvo caen de su espada.',
    moves: [
      { name: 'Filo de Jade', mult: 1.15, weight: 3, text: 'La espada de jade silba junto a tu oreja.' },
      { name: 'Sello antiguo', mult: 0.9, weight: 2, text: 'Un sello brillante te empuja hacia atrás.' },
    ],
    enraged: {
      line: 'El jade se agrieta. El Guardián ya no mide sus fuerzas.',
      moves: [
        { name: 'Tormenta de Jade', mult: 0.55, hits: 3, weight: 3, text: 'Tres filos de luz te alcanzan a la vez.' },
        { name: 'Filo de Jade', mult: 1.2, weight: 2, text: 'La espada de jade busca tu pecho.' },
      ],
    },
  },
}

export const DIALOGUE = {
  mei: {
    0: [
      { s: 'Anciana Mei', t: 'Lian… has crecido mirando esa montaña sin saber lo que guarda.' },
      { s: 'Anciana Mei', t: 'En el templo del norte duerme la Espada Celestial. Su último portador cayó hace cien años.' },
      { s: 'Anciana Mei', t: 'Cruza el bosque de bambú. Si el altar te reconoce, sabrás qué hacer.' },
      { s: 'Lian', t: '¿Y si no me reconoce?' },
      { s: 'Anciana Mei', t: 'Entonces vuelve con vida, muchacho. Eso también es una respuesta.' },
    ],
    1: [
      { s: 'Anciana Mei', t: 'El sendero cruza el río y sube hasta el templo. No te detengas entre los bambúes.' },
      { s: 'Anciana Mei', t: 'Y si el Guardián despierta… recuerda respirar antes de cortar.' },
    ],
    2: [
      { s: 'Anciana Mei', t: 'La espada… te ha elegido. Puedo sentir su filo desde aquí.' },
      { s: 'Anciana Mei', t: 'Lianhua tiene un guardián de nuevo. Pero el cielo sigue oscuro; esto solo es el principio.' },
    ],
    3: [
      { s: 'Anciana Mei', t: 'Descansa, Lian. Mañana el filo tendrá trabajo.' },
    ],
  },
  jun: {
    0: [
      { s: 'Jun', t: '¡Dicen que el Guardián de Jade tiene un ojo de jade de verdad!' },
      { s: 'Jun', t: 'Yo solo tengo dos de carne. Qué injusto.' },
    ],
    1: [
      { s: 'Jun', t: 'Si ves al Guardián, dile que yo también quiero una espada. Pero no muy pesada.' },
    ],
    2: [
      { s: 'Jun', t: '¡Se te ve distinto! Como si la luna te hubiera peinado.' },
    ],
  },
  su: {
    0: [
      { s: 'Vigía Su', t: 'No cruces el puente sin entrenar. Los lobos de niebla muerden más rápido que tu sombra.' },
      { s: 'Vigía Su', t: 'Los espíritus de bambú aguantan poco. Dos tajos bien puestos y se rinden.' },
    ],
    1: [
      { s: 'Vigía Su', t: 'El templo está al norte, más allá del río. Yo vigilo el puente; tú vigila tu espalda.' },
    ],
    2: [
      { s: 'Vigía Su', t: 'Así que era verdad. El filo volvió a cantar.' },
    ],
  },
  altar: {
    0: [
      { s: 'Altar', t: 'El altar está sellado por un sello antiguo. La Anciana Mei sabrá más.' },
    ],
    1: [
      { s: 'Altar', t: 'El aire se vuelve denso. Una voz antigua pregunta: «¿Portas el filo o el miedo?»' },
      { s: 'Lian', t: 'Porto las dos cosas. Pero el filo va delante.' },
      { s: 'Altar', t: 'La losa tiembla. El Guardián despierta.' },
    ],
    2: [
      { s: 'Altar', t: 'La espada ya te eligió. El altar guarda silencio, satisfecho.' },
    ],
  },
}
