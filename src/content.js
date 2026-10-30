/**
 * LA ESPADA CELESTIAL — contenido del juego
 * Todo el arte, la música y los textos son originales y se generan en tiempo real.
 */

export const WORLD = Object.freeze({
  width: 3600,
  height: 2300,
  spawn: { x: 1795, y: 1285 },
  village: { x: 1790, y: 1120 },
  forest: { x: 760, y: 1320 },
  ruins: { x: 2940, y: 1120 },
  arena: { x: 3220, y: 590 },
  gate: { x: 2598, y: 1000 },
  shrine: { x: 1810, y: 795 },
  boss: { x: 3220, y: 555 },
})

export const COLORS = Object.freeze({
  gold: '#e8c87a',
  goldBright: '#fff0b0',
  teal: '#62e4ce',
  blue: '#5a8fff',
  violet: '#ad7bff',
  rose: '#ff7c9c',
  ink: '#0b1324',
  parchment: '#f5e8c8',
  hp: '#e85d72',
  mp: '#5ac8fa',
  stamina: '#e8c65d',
})

export const HAIR_STYLES = ['Largo lunar', 'Coleta alta', 'Corto al viento', 'Trenza de lirio']
export const HAIR_COLORS = [
  { id: 'plata', name: 'Plata de luna', value: '#dce8f4', shade: '#8fa8c6' },
  { id: 'noche', name: 'Noche profunda', value: '#26344f', shade: '#121b2e' },
  { id: 'castaño', name: 'Castaño otoñal', value: '#7a4c34', shade: '#492b1e' },
  { id: 'carmesi', name: 'Carmesí del alba', value: '#a9474f', shade: '#652832' },
]
export const OUTFITS = [
  { id: 'azul', name: 'Azul del alba', cloth: '#315f86', trim: '#d7b86c', dark: '#1c3a55' },
  { id: 'verde', name: 'Verde de lirio', cloth: '#3e725d', trim: '#e5cc85', dark: '#234638' },
  { id: 'blanco', name: 'Marfil celestial', cloth: '#d8d3c2', trim: '#c8a353', dark: '#8f8a7c' },
  { id: 'rojo', name: 'Carmesí del ocaso', cloth: '#853e44', trim: '#e3c479', dark: '#52262c' },
]

export const WEAPONS = {
  sword_alba: {
    id: 'sword_alba', name: 'Filo del Alba', type: 'Espada', icon: 'sword', rarity: 'Común',
    damage: 12, speed: 1.05, range: 82, arc: 1.6, stamina: 11, combo: 3,
    color: '#d9ecff', glow: '#8ed9ff', desc: 'Una espada ligera que aún recuerda el primer amanecer de Luma.',
  },
  daga_lirio: {
    id: 'daga_lirio', name: 'Daga de Lirio', type: 'Daga', icon: 'dagger', rarity: 'Poco común',
    damage: 9, speed: 1.55, range: 58, arc: 1.25, stamina: 6, combo: 4, crit: 0.18,
    color: '#c7ffe6', glow: '#63ffc5', desc: 'Rápida como el pétalo que cae. Aumenta la probabilidad de golpe crítico.',
  },
  mandoble_luna: {
    id: 'mandoble_luna', name: 'Mandoble Lunar', type: 'Mandoble', icon: 'greatsword', rarity: 'Raro',
    damage: 27, speed: 0.63, range: 108, arc: 2.0, stamina: 25, combo: 2, stagger: 1.5,
    color: '#d9c6ff', glow: '#a87cff', desc: 'Forjado con fragmentos de meteorito. Cada golpe rompe la guardia enemiga.',
  },
  lanza_celeste: {
    id: 'lanza_celeste', name: 'Lanza del Zenit', type: 'Lanza', icon: 'spear', rarity: 'Raro',
    damage: 19, speed: 0.92, range: 126, arc: 0.72, stamina: 14, combo: 3, pierce: 2,
    color: '#ffe9ad', glow: '#ffc94e', desc: 'Alcanza a varios enemigos en línea recta. Ideal para romper formaciones.',
  },
  arco_susurro: {
    id: 'arco_susurro', name: 'Arco de los Susurros', type: 'Arco', icon: 'bow', rarity: 'Poco común',
    damage: 15, speed: 0.88, range: 480, arc: 0.12, stamina: 10, combo: 3, ranged: 'arrow',
    color: '#c7f4ff', glow: '#70d8ff', desc: 'Las flechas de viento atraviesan la penumbra sin hacer ruido.',
  },
  baston_aurora: {
    id: 'baston_aurora', name: 'Bastón de Aurora', type: 'Bastón', icon: 'staff', rarity: 'Épico',
    damage: 13, speed: 0.95, range: 390, arc: 0.15, stamina: 7, mana: 4, combo: 3, ranged: 'arcane', element: 'luz',
    color: '#d7b9ff', glow: '#b982ff', desc: 'Conduce la luz de las estrellas en descargas de energía arcana.',
  },
  escudo_aether: {
    id: 'escudo_aether', name: 'Égida de Aether', type: 'Escudo', icon: 'shield', rarity: 'Raro',
    damage: 8, speed: 0.82, range: 54, arc: 2.2, stamina: 9, combo: 2, stagger: 1.1, guard: 0.6,
    color: '#bfe8ff', glow: '#73d8ff', desc: 'Un escudo ritual de las ruinas. Bloquear con él consume mucha menos resistencia.',
  },
  espada_celestial: {
    id: 'espada_celestial', name: 'La Espada Celestial', type: 'Espada legendaria', icon: 'celestial', rarity: 'Legendaria',
    damage: 38, speed: 1.12, range: 102, arc: 1.8, stamina: 12, combo: 4, crit: 0.12, holy: true,
    color: '#fff6c7', glow: '#ffe481', desc: 'La hoja que separó la noche del mundo. Su filo canta con cada golpe.',
  },
}
export const STARTING_WEAPONS = ['sword_alba', 'daga_lirio']

export const ARMORS = {
  tunica_viajero: {
    id: 'tunica_viajero', name: 'Túnica de viajero', rarity: 'Común', defense: 3, maxHp: 10,
    desc: 'Ropa de camino reforzada con cuero flexible.', slot: 'armor',
  },
  manto_lirio: {
    id: 'manto_lirio', name: 'Manto de lirios', rarity: 'Poco común', defense: 7, maxHp: 24, maxMp: 10,
    desc: 'Tejido con fibras del bosque. Las flores nunca se marchitan.', slot: 'armor',
  },
  placas_guardian: {
    id: 'placas_guardian', name: 'Placas del guardián', rarity: 'Raro', defense: 13, maxHp: 45,
    desc: 'Acero antiguo marcado con runas de protección.', slot: 'armor',
  },
  vestido_celestial: {
    id: 'vestido_celestial', name: 'Vestidura celestial', rarity: 'Legendario', defense: 18, maxHp: 75, maxMp: 25,
    desc: 'Hilos de luz tejidos por las manos de la luna.', slot: 'armor',
  },
}

export const ACCESSORIES = {
  amuleto_luna: { id: 'amuleto_luna', name: 'Amuleto de luna', rarity: 'Raro', crit: 0.08, luck: 2, maxMp: 10, desc: 'Un colgante de obsidiana que brilla cuando la noche es más profunda.' },
  anillo_roble: { id: 'anillo_roble', name: 'Anillo de roble', rarity: 'Poco común', defense: 4, maxHp: 15, desc: 'La madera viva concede la paciencia del bosque.' },
  pluma_veloz: { id: 'pluma_veloz', name: 'Pluma de zorzal', rarity: 'Poco común', speed: 12, stamina: 15, desc: 'Ligera como un suspiro. Acelera el paso y la recuperación.' },
}

export const ITEMS = {
  pocion_vida: { id: 'pocion_vida', name: 'Poción de vida', icon: 'potion', color: '#ff7787', desc: 'Restaura 55 puntos de vida.', use: 'heal', amount: 55, price: 22 },
  pocion_mana: { id: 'pocion_mana', name: 'Poción de maná', icon: 'mana', color: '#66cfff', desc: 'Restaura 35 puntos de maná.', use: 'mana', amount: 35, price: 28 },
  elixir_luma: { id: 'elixir_luma', name: 'Elixir de Luma', icon: 'elixir', color: '#ffd575', desc: 'Restaura por completo la vida y el maná.', use: 'full', price: 90 },
  sello_lumen: { id: 'sello_lumen', name: 'Sello de Lumen', icon: 'seal', color: '#b592ff', desc: 'Permite sellar una criatura debilitada y convertirla en aliada.', use: 'seal', price: 45 },
  flor_luna: { id: 'flor_luna', name: 'Flor de luna', icon: 'flower', color: '#e8e1ff', desc: 'Pétalos que solo abren bajo la mirada de la luna.', quest: true },
  esquirla_runa: { id: 'esquirla_runa', name: 'Esquirla de runa', icon: 'rune', color: '#73e7d0', desc: 'Un fragmento de piedra que vibra cerca de la puerta antigua.', quest: true },
  colmillo_ceniza: { id: 'colmillo_ceniza', name: 'Colmillo de ceniza', icon: 'fang', color: '#d5d2c4', desc: 'Trofeo de un lobo de ceniza. Los herreros pagan bien por él.', price: 18 },
  caparazon_petro: { id: 'caparazon_petro', name: 'Caparazón pétreo', icon: 'shell', color: '#b9aa88', desc: 'Placa mineral extremadamente dura.', price: 24 },
  esencia_espectro: { id: 'esencia_espectro', name: 'Esencia espectral', icon: 'spirit', color: '#b48aff', desc: 'Frío azulado que susurra nombres olvidados.', price: 32 },
}

export const SKILLS = {
  corte_alba: {
    id: 'corte_alba', name: 'Corte del Alba', icon: 'burst', cost: 18, resource: 'stamina', cooldown: 3.2,
    damage: 1.9, radius: 126, desc: 'Un giro de hoja que corta a todos los enemigos cercanos y los empuja.',
  },
  juicio_lunar: {
    id: 'juicio_lunar', name: 'Juicio Lunar', icon: 'moon', cost: 24, resource: 'mana', cooldown: 8,
    damage: 2.6, radius: 190, desc: 'Invoca columnas de luz lunar sobre los enemigos cercanos.',
  },
  impulso_lumen: {
    id: 'impulso_lumen', name: 'Impulso de Lumen', icon: 'dash', cost: 16, resource: 'stamina', cooldown: 4.5,
    damage: 1.35, radius: 92, desc: 'Un tajo relámpago que atraviesa la distancia en un instante.',
  },
}

export const CREATURES = {
  lumen: {
    id: 'lumen', name: 'Lumen', title: 'Zorro de luz', rarity: 'Vínculo', color: '#8ff5e5',
    desc: 'Un pequeño guardián del bosque. Dispara destellos a los enemigos cercanos.',
    attack: 8, cooldown: 2.5, kind: 'ranged',
  },
  gelatina: {
    id: 'gelatina', name: 'Gelatina silvestre', title: 'Masa viviente', rarity: 'Común', color: '#8fe6b8',
    desc: 'Una criatura tranquila que, al luchar, restaura pequeñas cantidades de vida.',
    attack: 0, cooldown: 7, kind: 'heal', heal: 12,
  },
  lobo: {
    id: 'lobo', name: 'Lobo de ceniza', title: 'Cazador gris', rarity: 'Poco común', color: '#b9c4d4',
    desc: 'Un compañero feroz que se lanza contra el enemigo más cercano.',
    attack: 12, cooldown: 3.1, kind: 'dash',
  },
  escarabajo: {
    id: 'escarabajo', name: 'Escarabajo pétreo', title: 'Bastión mineral', rarity: 'Poco común', color: '#d0bd8e',
    desc: 'Su caparazón proyecta un escudo que reduce el daño recibido.',
    attack: 0, cooldown: 9, kind: 'shield',
  },
  espectro: {
    id: 'espectro', name: 'Espectro de las ruinas', title: 'Eco errante', rarity: 'Raro', color: '#b795ff',
    desc: 'Lanza orbes de energía a distancia. Un aliado silencioso y letal.',
    attack: 10, cooldown: 2.8, kind: 'ranged',
  },
}

export const ENEMY_TYPES = {
  gelatina: {
    id: 'gelatina', name: 'Gelatina silvestre', kind: 'slime', level: 1,
    hp: 52, damage: 8, defense: 1, xp: 18, gold: 7, speed: 58, radius: 22, aggro: 230,
    scale: 1, color: '#62d69e', dark: '#247a58', yOffset: 0,
    drops: [{ id: 'pocion_vida', chance: 0.16 }],
    lore: 'Una masa de savia y luz que rebota entre los lirios. Su núcleo es un pequeño sol verde.',
  },
  lobo: {
    id: 'lobo', name: 'Lobo de ceniza', kind: 'wolf', level: 3,
    hp: 84, damage: 13, defense: 2, xp: 28, gold: 12, speed: 110, radius: 25, aggro: 310,
    scale: 1, color: '#a7b3c4', dark: '#3d4658', yOffset: 0,
    drops: [{ id: 'colmillo_ceniza', chance: 0.4 }, { id: 'pocion_vida', chance: 0.12 }],
    lore: 'Nació de las brasas de un bosque quemado. Caza en silencio, pero su aullido helaría la sangre.',
  },
  escarabajo: {
    id: 'escarabajo', name: 'Escarabajo pétreo', kind: 'beetle', level: 5,
    hp: 138, damage: 16, defense: 11, xp: 38, gold: 18, speed: 52, radius: 29, aggro: 250,
    scale: 1, color: '#b9a77b', dark: '#4e4636', yOffset: 0,
    drops: [{ id: 'caparazon_petro', chance: 0.5 }, { id: 'sello_lumen', chance: 0.12 }],
    lore: 'Las runas de las ruinas despertaron a estos centinelas de piedra. Su caparazón detiene casi todo.',
  },
  espectro: {
    id: 'espectro', name: 'Espectro de las ruinas', kind: 'wraith', level: 7,
    hp: 106, damage: 19, defense: 4, xp: 48, gold: 24, speed: 76, radius: 24, aggro: 340,
    scale: 1, color: '#9d7dff', dark: '#39276d', yOffset: 0,
    drops: [{ id: 'esencia_espectro', chance: 0.55 }, { id: 'pocion_mana', chance: 0.2 }],
    lore: 'No recuerda su rostro, pero sí el juramento que lo ata a la puerta del guardián.',
  },
  guardian: {
    id: 'guardian', name: 'Guardián corrompido', kind: 'boss', level: 10,
    hp: 1450, damage: 23, defense: 12, xp: 700, gold: 250, speed: 72, radius: 58, aggro: 520,
    scale: 1, color: '#7d63b8', dark: '#1d143c', yOffset: 0,
    drops: [],
    lore: 'El último custodio del santuario. La Espada Celestial le fue arrebatada y la oscuridad ocupó su lugar.',
  },
}

export const APPEARANCE_DEFAULT = Object.freeze({
  name: 'Elian',
  hair: 0,
  hairColor: 0,
  outfit: 0,
  weapon: 'sword_alba',
})

export const QUESTS = [
  {
    id: 'q0', chapter: 'Capítulo I', title: 'El despertar de Luma',
    summary: 'Habla con la maestra Elara en el santuario de la aldea.',
    objective: 'Habla con Elara en el santuario',
    marker: 'elara', reward: 'Conocimiento antiguo',
  },
  {
    id: 'q1', chapter: 'Capítulo I', title: 'Flores bajo la luna',
    summary: 'Reúne tres flores de luna en el Bosque de Lirios y derrota a las bestias que lo corrompen.',
    objective: 'Flores de luna',
    marker: 'flowers', reward: 'Vínculo con Lumen + Juicio Lunar',
  },
  {
    id: 'q2', chapter: 'Capítulo II', title: 'Ecos en la piedra',
    summary: 'Los escarabajos pétreos guardan esquirlas de runa. Arrebátales tres para abrir la puerta de las ruinas.',
    objective: 'Esquirlas de runa',
    marker: 'beetles', reward: 'Acceso a las Ruinas de Aether',
  },
  {
    id: 'q3', chapter: 'Capítulo II', title: 'La puerta de Aether',
    summary: 'Abre la puerta de las ruinas con las tres esquirlas y desciende hasta el santuario del guardián.',
    objective: 'Abre la puerta de las ruinas',
    marker: 'gate', reward: 'Camino al santuario',
  },
  {
    id: 'q4', chapter: 'Capítulo III', title: 'El guardián corrompido',
    summary: 'El Guardián protege la Espada Celestial. Derrótalo y reclama la hoja que separó la noche del mundo.',
    objective: 'Derrota al Guardián corrompido',
    marker: 'boss', reward: 'La Espada Celestial',
  },
  {
    id: 'q5', chapter: 'Epílogo', title: 'Un nuevo amanecer',
    summary: 'La Espada Celestial ha despertado. Luma vuelve a respirar. El mundo aún guarda secretos.',
    objective: 'La leyenda continúa',
    marker: 'shrine', reward: 'Exploración libre',
  },
]

export const LORE = [
  {
    title: 'La Espada Celestial',
    text: 'Cuando la noche devoró el primer santuario, una hoja de luz cayó del cielo. Su filo separó la oscuridad del alba y dio nombre a Luma. Desde entonces, ningún guardián ha podido sostenerla sin perder algo de sí mismo.',
  },
  {
    title: 'Bosque de Lirios',
    text: 'Las flores de luna solo abren cuando la última luz del día toca sus pétalos. Los aldeanos dicen que son las lágrimas de la diosa que eligió quedarse.',
  },
  {
    title: 'Ruinas de Aether',
    text: 'Bajo las columnas dormidas yace un círculo de piedra que marca el pulso del mundo. Los ecos que lo habitan repiten juramentos que nadie recuerda haber hecho.',
  },
  {
    title: 'Las criaturas de Lumen',
    text: 'No todas las bestias nacen de la corrupción. Un vínculo sincero con una criatura debilitada puede convertirla en guardiana del caminante.',
  },
]

// Posiciones de interés del mundo. Se usan para marcadores, minimapa y colisiones.
export const LANDMARKS = [
  { id: 'elara', name: 'Santuario de Elara', x: 1810, y: 835, icon: 'npc' },
  { id: 'fountain', name: 'Fuente de Luma', x: 1790, y: 1130, icon: 'town' },
  { id: 'blacksmith', name: 'Forja de Rurik', x: 2155, y: 1240, icon: 'shop' },
  { id: 'merchant', name: 'Tienda de Mirea', x: 1450, y: 1205, icon: 'shop' },
  { id: 'forest_shrine', name: 'Claro de Lirios', x: 735, y: 1120, icon: 'shrine' },
  { id: 'ruins_gate', name: 'Puerta de Aether', x: 2598, y: 1000, icon: 'gate' },
  { id: 'arena', name: 'Santuario Celestial', x: 3220, y: 590, icon: 'boss' },
]

export const ENEMY_SPAWNS = [
  // Bosque de Lirios
  { type: 'gelatina', x: 1010, y: 1310 }, { type: 'gelatina', x: 860, y: 1410 },
  { type: 'gelatina', x: 1170, y: 1680 }, { type: 'gelatina', x: 640, y: 1280 },
  { type: 'gelatina', x: 420, y: 1620 }, { type: 'gelatina', x: 520, y: 1810 },
  { type: 'lobo', x: 720, y: 1560 }, { type: 'lobo', x: 1040, y: 900 },
  { type: 'lobo', x: 380, y: 1120 }, { type: 'lobo', x: 910, y: 1890 },
  { type: 'lobo', x: 560, y: 690 },
  // Ruinas de Aether
  { type: 'escarabajo', x: 2790, y: 1210 }, { type: 'escarabajo', x: 2940, y: 1320 },
  { type: 'escarabajo', x: 3040, y: 1140 }, { type: 'escarabajo', x: 3220, y: 1290 },
  { type: 'escarabajo', x: 3390, y: 1130 }, { type: 'escarabajo', x: 3480, y: 1370 },
  { type: 'espectro', x: 2850, y: 920 }, { type: 'espectro', x: 3120, y: 980 },
  { type: 'espectro', x: 3360, y: 860 }, { type: 'espectro', x: 3520, y: 1080 },
  { type: 'espectro', x: 3010, y: 760 }, { type: 'espectro', x: 3450, y: 690 },
  // Escarabajos del acceso oeste: sus esquirlas abren la Puerta de Aether.
  { type: 'escarabajo', x: 2330, y: 1370 }, { type: 'escarabajo', x: 2440, y: 830 },
  { type: 'escarabajo', x: 2390, y: 1720 }, { type: 'escarabajo', x: 2260, y: 1090 },
  // Senderos
  { type: 'gelatina', x: 1430, y: 1710 }, { type: 'lobo', x: 2310, y: 1530 },
]

export const CHESTS = [
  { id: 'chest_bow', x: 405, y: 1465, item: 'arco_susurro', kind: 'weapon', label: 'Arco de los Susurros' },
  { id: 'chest_great', x: 3430, y: 1310, item: 'mandoble_luna', kind: 'weapon', label: 'Mandoble Lunar' },
  { id: 'chest_spear', x: 1110, y: 1975, item: 'lanza_celeste', kind: 'weapon', label: 'Lanza del Zenit' },
  { id: 'chest_staff', x: 720, y: 610, item: 'baston_aurora', kind: 'weapon', label: 'Bastón de Aurora' },
  { id: 'chest_shield', x: 2860, y: 870, item: 'escudo_aether', kind: 'weapon', label: 'Égida de Aether' },
  { id: 'chest_armor1', x: 1485, y: 1510, item: 'manto_lirio', kind: 'armor', label: 'Manto de lirios' },
  { id: 'chest_armor2', x: 3300, y: 1420, item: 'placas_guardian', kind: 'armor', label: 'Placas del guardián' },
  { id: 'chest_ring', x: 1960, y: 470, item: 'anillo_roble', kind: 'accessory', label: 'Anillo de roble' },
  { id: 'chest_amulet', x: 690, y: 1890, item: 'amuleto_luna', kind: 'accessory', label: 'Amuleto de luna' },
]

export const MOONFLOWERS = [
  { id: 'flower1', x: 690, y: 1450 },
  { id: 'flower2', x: 445, y: 1020 },
  { id: 'flower3', x: 1070, y: 1780 },
  { id: 'flower4', x: 300, y: 1520 },
  { id: 'flower5', x: 930, y: 550 },
]

export const RUNE_SHRINES = [
  { id: 'rune_west', x: 2620, y: 760 },
  { id: 'rune_south', x: 2710, y: 1450 },
  { id: 'rune_north', x: 3270, y: 1570 },
]

export const SAVE_KEY = 'la-espada-celestial-save-v2'
export const SETTINGS_KEY = 'la-espada-celestial-settings-v2'
