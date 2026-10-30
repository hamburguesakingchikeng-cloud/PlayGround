// LA ESPADA CELESTIAL: RPG RETRO
// Datos de juego: clases, armas, objetos, hechizos, criaturas, enemigos y misiones.
// Todo el contenido es original y se dibuja por procedimiento en tiempo real.

export const VERSION = 1;
export const SAVE_PREFIX = 'espada-celestial.v1.';
export const SAVE_SLOTS = ['auto', '1', '2', '3'];

export const CLASSES = {
  caballero: {
    id: 'caballero',
    name: 'Caballero del Alba',
    tag: 'Equilibrado · Espada',
    desc: 'Un juramento de luz y acero. Domina el combate cercano, encadena cortes y se adapta a cualquier situación.',
    long: 'La senda clásica: velocidad, fuerza y defensa en armonía. Ideal para aprender el ritmo del combate y descubrir todos los secretos de Aurelia.',
    stats: { vit: 7, str: 7, def: 6, spd: 6, int: 4, luck: 5 },
    weapon: 'espada_alba',
    armor: 'gambeson',
    shield: 'escudo_roble',
    accessory: null,
    spell: 'fuego',
    creature: 'gelatina',
    colors: { outfit: '#3d6fb0', accent: '#f0cf7a', cloak: '#1d3557' },
    portraitHair: '#6b3f22',
  },
  guardian: {
    id: 'guardian',
    name: 'Guardián de Aether',
    tag: 'Resistente · Mandoble',
    desc: 'Una muralla que camina. Cambia movilidad por una fuerza demoledora y una defensa casi impenetrable.',
    long: 'Forjado en las ruinas flotantes de Aether. Sus golpes son lentos pero capaces de quebrar la piedra. Perfecto para quien prefiera resistir y contraatacar.',
    stats: { vit: 10, str: 9, def: 9, spd: 3, int: 3, luck: 3 },
    weapon: 'mandoble_ceniza',
    armor: 'placas_viejas',
    shield: 'escudo_roble',
    accessory: null,
    spell: 'hielo',
    creature: 'escarabajo',
    colors: { outfit: '#6b5a7a', accent: '#d9a441', cloak: '#2d2438' },
    portraitHair: '#d8d2c4',
  },
  vidente: {
    id: 'vidente',
    name: 'Vidente del Bosque',
    tag: 'Ágil · Magia',
    desc: 'Escucha el susurro de las estrellas. Frágil en apariencia, devastadora a distancia con magia y arcos.',
    long: 'Los videntes leen el porvenir en el vuelo de las luciérnagas. Su mana fluye como un río y sus hechizos pueden cambiar el curso de una batalla.',
    stats: { vit: 5, str: 4, def: 4, spd: 8, int: 10, luck: 7 },
    weapon: 'baston_aether',
    armor: 'robe_verde',
    shield: null,
    accessory: 'talisman_mana',
    spell: 'rayo',
    creature: 'espectro',
    colors: { outfit: '#2f7a68', accent: '#9fe3c9', cloak: '#173c35' },
    portraitHair: '#d9b46a',
  },
};

export const WEAPONS = {
  espada_alba: {
    id: 'espada_alba', name: 'Espada del Alba', kind: 'sword', icon: 'sword',
    desc: 'Acero bendecido por el primer amanecer. Rápida, fiable y sedienta de luz.',
    damage: 15, speed: 1.05, range: 66, arc: 1.55, combo: 3, knockback: 90,
    crit: 0.06, element: 'luz', price: 0, tier: 1,
    skill: { id: 'whirl', name: 'Corte del Alba', desc: 'Gira el filo en un torbellino de luz que golpea dos veces a todo enemigo cercano.', cost: 24, resource: 'stamina', cooldown: 5 },
  },
  mandoble_ceniza: {
    id: 'mandoble_ceniza', name: 'Mandoble de Ceniza', kind: 'greatsword', icon: 'greatsword',
    desc: 'Una hoja enorme forjada con carbón de volcán. Cada golpe pesa como un derrumbe.',
    damage: 28, speed: 0.66, range: 82, arc: 1.95, combo: 2, knockback: 190,
    crit: 0.04, element: 'fuego', price: 0, tier: 2,
    skill: { id: 'slam', name: 'Rompecielos', desc: 'Clava el mandoble y libera una onda sísmica que atraviesa el suelo.', cost: 32, resource: 'stamina', cooldown: 6 },
  },
  dagas_sombra: {
    id: 'dagas_sombra', name: 'Dagas de Sombra', kind: 'daggers', icon: 'dagger',
    desc: 'Dos colmillos de obsidiana. No buscan la fuerza, sino el instante exacto.',
    damage: 8, speed: 1.55, range: 50, arc: 1.25, combo: 4, knockback: 40,
    crit: 0.18, element: 'sombra', price: 360, tier: 2,
    skill: { id: 'shadowstep', name: 'Paso Sombrío', desc: 'Atraviesa a los enemigos en línea recta y deja una estela de filos.', cost: 22, resource: 'stamina', cooldown: 5 },
  },
  lanza_alba: {
    id: 'lanza_alba', name: 'Lanza del Alba', kind: 'spear', icon: 'spear',
    desc: 'Alcance de tres pasos. La distancia correcta es una forma de misericordia.',
    damage: 18, speed: 0.92, range: 100, arc: 0.85, combo: 3, knockback: 80,
    crit: 0.07, element: 'luz', price: 280, tier: 2,
    skill: { id: 'pierce', name: 'Perforación', desc: 'Arroja una lanza de luz que atraviesa a todos los enemigos en línea.', cost: 25, resource: 'stamina', cooldown: 5 },
  },
  arco_lumen: {
    id: 'arco_lumen', name: 'Arco de Lumen', kind: 'bow', icon: 'bow',
    desc: 'Madera viva tensada con seda de luciérnaga. Dispara flechas que buscan la luz.',
    damage: 13, speed: 0.9, range: 380, arc: 0.25, combo: 2, knockback: 55,
    crit: 0.12, element: 'luz', price: 300, tier: 2, projectile: 'arrow',
    skill: { id: 'rain', name: 'Lluvia de Lumen', desc: 'Invoca una lluvia de flechas sobre una zona amplia.', cost: 27, resource: 'stamina', cooldown: 6 },
  },
  baston_aether: {
    id: 'baston_aether', name: 'Bastón de Aether', kind: 'staff', icon: 'staff',
    desc: 'Un fragmento de cielo atrapado en cristal. Convierte la voluntad en proyectiles.',
    damage: 11, speed: 0.82, range: 330, arc: 0.25, combo: 2, knockback: 45,
    crit: 0.08, element: 'arcano', price: 0, tier: 2, projectile: 'arcane',
    skill: { id: 'nova', name: 'Nova Arcana', desc: 'Detona una nova de energía arcana alrededor del objetivo.', cost: 22, resource: 'mp', cooldown: 5 },
  },
  espada_celestial: {
    id: 'espada_celestial', name: 'Espada Celestial', kind: 'sword', icon: 'celestial',
    desc: 'La hoja que cortó la noche. Tres fragmentos, un solo juramento. Solo puede empuñarla quien ha visto el amanecer.',
    damage: 38, speed: 1.15, range: 76, arc: 1.75, combo: 4, knockback: 150,
    crit: 0.14, element: 'celestial', price: 0, tier: 4,
    skill: { id: 'celestial', name: 'Juicio Celestial', desc: 'Desata un pilar de luz que barre el campo y purifica la corrupción.', cost: 38, resource: 'stamina', cooldown: 8 },
  },
};

export const ARMORS = {
  gambeson: {
    id: 'gambeson', name: 'Gambesón del Alba', icon: 'armor', slot: 'armor',
    desc: 'Tela acolchada con hilo de plata. Ligera y reconfortante.',
    def: 4, hp: 12, mp: 0, spd: 0, price: 0, tier: 1, color: '#3d6fb0', trim: '#f0cf7a',
  },
  placas_viejas: {
    id: 'placas_viejas', name: 'Placas de Aether', icon: 'armor', slot: 'armor',
    desc: 'Placas de un guardián olvidado. Pesadas, pero aún recuerdan cómo proteger.',
    def: 11, hp: 30, mp: 0, spd: -1, price: 0, tier: 2, color: '#6b5a7a', trim: '#d9a441',
  },
  robe_verde: {
    id: 'robe_verde', name: 'Ropajes del Bosque', icon: 'robe', slot: 'armor',
    desc: 'Tejido con fibras de luz lunar. El viento lo obedece.',
    def: 3, hp: 8, mp: 24, spd: 1, price: 0, tier: 1, color: '#2f7a68', trim: '#9fe3c9',
  },
  cuero_sombrio: {
    id: 'cuero_sombrio', name: 'Cuero Sombraverde', icon: 'armor', slot: 'armor',
    desc: 'Ligero como una hoja seca. Favorece la velocidad y la precisión.',
    def: 6, hp: 16, mp: 6, spd: 2, price: 180, tier: 2, color: '#365b46', trim: '#b9d48a',
  },
  placas_alba: {
    id: 'placas_alba', name: 'Placas del Alba', icon: 'armor', slot: 'armor',
    desc: 'Acero pulido por los herreros de Aldea del Alba. Un muro con forma de hombre.',
    def: 14, hp: 48, mp: 0, spd: -1, price: 480, tier: 3, color: '#8792a6', trim: '#f0cf7a',
  },
  vestiduras_aether: {
    id: 'vestiduras_aether', name: 'Vestiduras de Aether', icon: 'robe', slot: 'armor',
    desc: 'Hilos de constelaciones cosidos a mano. La magia fluye sin resistencia.',
    def: 8, hp: 20, mp: 50, spd: 1, price: 520, tier: 3, color: '#3c4a8a', trim: '#9fe3ff',
  },
  armadura_celestial: {
    id: 'armadura_celestial', name: 'Armadura Celestial', icon: 'armor', slot: 'armor',
    desc: 'Reliquia de la orden de Kael. Brilla con la luz de un sol pequeño.',
    def: 22, hp: 80, mp: 40, spd: 0, price: 0, tier: 4, color: '#d8c79a', trim: '#fff3c4',
  },
};

export const SHIELDS = {
  escudo_roble: {
    id: 'escudo_roble', name: 'Escudo de Roble', icon: 'shield', slot: 'shield',
    desc: 'Madera dura y un aro de hierro. Bloquea el 55% del daño.',
    def: 2, block: 0.55, hp: 8, price: 90, tier: 1,
  },
  escudo_aether: {
    id: 'escudo_aether', name: 'Escudo de Aether', icon: 'shield', slot: 'shield',
    desc: 'Un disco de piedra flotante. Bloquea el 70% del daño.',
    def: 5, block: 0.7, hp: 16, price: 380, tier: 2,
  },
  escudo_celestial: {
    id: 'escudo_celestial', name: 'Baluarte Celestial', icon: 'shield', slot: 'shield',
    desc: 'La última defensa de la orden. Bloquea el 80% del daño y refleja la magia.',
    def: 8, block: 0.8, hp: 30, price: 0, tier: 4,
  },
};

export const ACCESSORIES = {
  amuleto_luz: {
    id: 'amuleto_luz', name: 'Amuleto de Luciérnaga', icon: 'amulet', slot: 'accessory',
    desc: 'Una luz diminuta que nunca se apaga. +3 Suerte.',
    stats: { luck: 3 }, price: 180, tier: 1,
  },
  anillo_fuerza: {
    id: 'anillo_fuerza', name: 'Anillo del Yunque', icon: 'ring', slot: 'accessory',
    desc: 'Hierro comprimido hasta convertirse en voluntad. +4 Fuerza.',
    stats: { str: 4 }, price: 240, tier: 2,
  },
  talisman_mana: {
    id: 'talisman_mana', name: 'Talismán de Aether', icon: 'amulet', slot: 'accessory',
    desc: 'Un cristal que respira. +4 Inteligencia, +15 Maná.',
    stats: { int: 4 }, mp: 15, price: 220, tier: 2,
  },
  bota_viento: {
    id: 'bota_viento', name: 'Botas del Viento', icon: 'boot', slot: 'accessory',
    desc: 'Cada paso pesa menos que el anterior. +5 Velocidad.',
    stats: { spd: 5 }, price: 280, tier: 2,
  },
  colgante_celestial: {
    id: 'colgante_celestial', name: 'Colgante Celestial', icon: 'amulet', slot: 'accessory',
    desc: 'Un fragmento de estrella que late al ritmo de tu corazón. +3 a todos los atributos.',
    stats: { vit: 3, str: 3, def: 3, spd: 3, int: 3, luck: 3 }, price: 0, tier: 4,
  },
};

export const ITEMS = {
  potion: { id: 'potion', name: 'Poción de Alba', icon: 'potion', desc: 'Restaura 50 de vida.', price: 32, sell: 12, use: 'heal', value: 50, color: '#e0566a' },
  potion_mayor: { id: 'potion_mayor', name: 'Poción Solar', icon: 'potion2', desc: 'Restaura 140 de vida.', price: 85, sell: 32, use: 'heal', value: 140, color: '#ff9a4d' },
  ether: { id: 'ether', name: 'Éter de Luna', icon: 'ether', desc: 'Restaura 35 de maná.', price: 42, sell: 16, use: 'mana', value: 35, color: '#6fb8ff' },
  elixir: { id: 'elixir', name: 'Elixir Celestial', icon: 'elixir', desc: 'Restaura toda la vida y el maná.', price: 220, sell: 80, use: 'full', value: 999, color: '#ffe6a0' },
  antidote: { id: 'antidote', name: 'Hierba Clara', icon: 'herb', desc: 'Cura quemaduras y veneno.', price: 26, sell: 9, use: 'cleanse', value: 0, color: '#9fe3a0' },
  bomba: { id: 'bomba', name: 'Bomba de Ceniza', icon: 'bomb', desc: 'Explota al instante e inflige 55 de daño en área.', price: 48, sell: 18, use: 'bomb', value: 55, color: '#ff8a3d' },
  fruta: { id: 'fruta', name: 'Fruta de Lumen', icon: 'fruit', desc: 'Restaura 22 de vida. Dulce y luminosa.', price: 12, sell: 4, use: 'heal', value: 22, color: '#ffcf5a' },
  luciernaga: { id: 'luciernaga', name: 'Luciérnaga de Lumen', icon: 'firefly', desc: 'Una chispa viva. Lía las colecciona.', price: 0, sell: 0, quest: true, color: '#c8ff9a' },
  colmillo: { id: 'colmillo', name: 'Colmillo de Ceniza', icon: 'fang', desc: 'Trofeo de un lobo de ceniza. Rook los busca.', price: 0, sell: 6, quest: true, color: '#d8d2c4' },
  hierro: { id: 'hierro', name: 'Piedra de Hierro', icon: 'ore', desc: 'Mineral denso arrancado de un escarabajo pétreo.', price: 0, sell: 8, quest: true, color: '#9aa6b8' },
  memoria: { id: 'memoria', name: 'Eco de Memoria', icon: 'echo', desc: 'Un recuerdo cristalizado de Aether.', price: 0, sell: 0, quest: true, color: '#9fe3ff' },
  fragmento_alba: { id: 'fragmento_alba', name: 'Fragmento del Alba', icon: 'shard', desc: 'El primer fragmento de la Espada Celestial. Cálido como un amanecer.', price: 0, sell: 0, quest: true, key: true, color: '#ffe6a0' },
  fragmento_aether: { id: 'fragmento_aether', name: 'Fragmento de Aether', icon: 'shard', desc: 'El segundo fragmento. Zumba con la memoria de las estrellas.', price: 0, sell: 0, quest: true, key: true, color: '#9fe3ff' },
  fragmento_celestial: { id: 'fragmento_celestial', name: 'Fragmento Celestial', icon: 'shard', desc: 'El corazón de la espada. Late con una luz imposible.', price: 0, sell: 0, quest: true, key: true, color: '#fff3c4' },
};

export const SPELLS = {
  fuego: {
    id: 'fuego', name: 'Llama del Alba', icon: 'fire', element: 'fuego', cost: 12, cooldown: 2.6,
    desc: 'Lanza una bola de fuego que explota al impactar y quema al enemigo.',
    color: '#ff8a3d', unlock: 1,
  },
  hielo: {
    id: 'hielo', name: 'Lanza de Escarcha', icon: 'ice', element: 'hielo', cost: 11, cooldown: 2.8,
    desc: 'Un proyectil de hielo que ralentiza y puede congelar brevemente.',
    color: '#8fd8ff', unlock: 1,
  },
  rayo: {
    id: 'rayo', name: 'Cadena de Tormenta', icon: 'lightning', element: 'rayo', cost: 16, cooldown: 4,
    desc: 'Un rayo salta entre enemigos cercanos. El tercer salto inflige daño doble.',
    color: '#c9a6ff', unlock: 1,
  },
  cura: {
    id: 'cura', name: 'Bendición de Lumen', icon: 'heal', element: 'luz', cost: 24, cooldown: 8,
    desc: 'Restaura vida y purga los males. Aprende a nivel 3.',
    color: '#9fe3a0', unlock: 3,
  },
  luz: {
    id: 'luz', name: 'Nova Celestial', icon: 'star', element: 'celestial', cost: 32, cooldown: 12,
    desc: 'Una explosión de luz pura que daña a todos los enemigos y te cura un poco.',
    color: '#fff3c4', unlock: 8,
  },
};

export const CREATURES = {
  gelatina: {
    id: 'gelatina', name: 'Gelatina Silvestre', icon: 'slime', element: 'naturaleza',
    desc: 'Una gota de bosque con ojos curiosos. Se regenera con el rocío del alba.',
    passive: '+18 vida máxima.', passiveKey: 'hp', passiveValue: 18,
    active: 'Rocío Curativo', activeDesc: 'Restaura un 30% de tu vida máxima.',
    cooldown: 18, color: '#8fe3b0',
  },
  lobo: {
    id: 'lobo', name: 'Lobo de Ceniza', icon: 'wolf', element: 'fuego',
    desc: 'Nacido entre brasas y raíces. Su aullido huele a tormenta.',
    passive: '+8% velocidad de movimiento.', passiveKey: 'speed', passiveValue: 0.08,
    active: 'Embate de Ceniza', activeDesc: 'Se lanza hacia delante y desgarra a los enemigos.',
    cooldown: 14, color: '#d8b08a',
  },
  escarabajo: {
    id: 'escarabajo', name: 'Escarabajo Pétreo', icon: 'beetle', element: 'tierra',
    desc: 'Un pequeño fortín con patas. Ha sobrevivido a tres imperios.',
    passive: '+7 defensa.', passiveKey: 'def', passiveValue: 7,
    active: 'Caparazón de Piedra', activeDesc: 'Te otorga un escudo que absorbe daño durante 5 segundos.',
    cooldown: 20, color: '#b8a58a',
  },
  espectro: {
    id: 'espectro', name: 'Espectro de las Ruinas', icon: 'ghost', element: 'arcano',
    desc: 'Un recuerdo que se niega a desvanecerse. Susurra nombres olvidados.',
    passive: '+22 maná máximo.', passiveKey: 'mp', passiveValue: 22,
    active: 'Orbe Espectral', activeDesc: 'Dispara un orbe que atraviesa enemigos y los ralentiza.',
    cooldown: 16, color: '#9fb8ff',
  },
  guardian: {
    id: 'guardian', name: 'Guardián Redimido', icon: 'guardian', element: 'celestial',
    desc: 'La chispa de honor que quedó dentro de una armadura corrompida.',
    passive: '+10% daño infligido.', passiveKey: 'damage', passiveValue: 0.1,
    active: 'Aura de Aether', activeDesc: 'Una explosión de energía que daña y aturde a los enemigos cercanos.',
    cooldown: 30, color: '#ffe6a0',
  },
};

export const ENEMIES = {
  gelatina: {
    id: 'gelatina', name: 'Gelatina Silvestre', kind: 'slime', icon: 'slime',
    hp: 38, damage: 8, speed: 54, aggro: 300, range: 48, radius: 26,
    xp: 15, gold: 7, armor: 0, capture: 0.42, color: '#74d6a0', elite: false,
    drops: [{ id: 'fruta', chance: 0.25 }, { id: 'potion', chance: 0.07 }],
    lore: 'Una criatura mansa hasta que su charca es amenazada. Su gelatina cura heridas.',
  },
  lobo: {
    id: 'lobo', name: 'Lobo de Ceniza', kind: 'wolf', icon: 'wolf',
    hp: 58, damage: 12, speed: 128, aggro: 390, range: 62, radius: 27,
    xp: 26, gold: 11, armor: 1, capture: 0.3, color: '#b98b68', elite: false,
    drops: [{ id: 'colmillo', chance: 0.62 }, { id: 'potion', chance: 0.1 }],
    lore: 'Cazadores de las brasas. Su pelaje conserva el calor de los incendios antiguos.',
  },
  escarabajo: {
    id: 'escarabajo', name: 'Escarabajo Pétreo', kind: 'beetle', icon: 'beetle',
    hp: 105, damage: 15, speed: 46, aggro: 320, range: 60, radius: 30,
    xp: 38, gold: 16, armor: 10, capture: 0.24, color: '#a8967d', elite: false,
    drops: [{ id: 'hierro', chance: 0.75 }, { id: 'ether', chance: 0.08 }],
    lore: 'Su caparazón es más duro que la piedra de las ruinas. Ataca en línea recta.',
  },
  espectro: {
    id: 'espectro', name: 'Espectro de las Ruinas', kind: 'wraith', icon: 'ghost',
    hp: 72, damage: 14, speed: 82, aggro: 430, range: 250, radius: 25,
    xp: 44, gold: 19, armor: 0, capture: 0.2, color: '#9fb8ff', elite: false,
    drops: [{ id: 'ether', chance: 0.24 }, { id: 'memoria', chance: 0.12 }],
    lore: 'No odia a los vivos. Solo intenta recordar cómo se sentía estar vivo.',
  },
  guardian: {
    id: 'guardian', name: 'Guardián Corrompido', kind: 'guardian', icon: 'guardian',
    hp: 460, damage: 24, speed: 76, aggro: 560, range: 95, radius: 44,
    xp: 220, gold: 150, armor: 14, capture: 1, color: '#8f7ac9', elite: true,
    drops: [{ id: 'potion_mayor', chance: 1 }, { id: 'escudo_aether', chance: 1, equipment: true }],
    lore: 'El último centinela de Aether. La corrupción lo obliga a proteger un trono vacío.',
  },
  kael: {
    id: 'kael', name: 'Kael, el Guardián Corrompido', kind: 'boss', icon: 'boss',
    hp: 1350, damage: 30, speed: 96, aggro: 9999, range: 120, radius: 54,
    xp: 700, gold: 600, armor: 18, capture: 0, color: '#e8c56a', elite: true, boss: true,
    drops: [],
    lore: 'El primer Caballero Celestial. Vendió el amanecer para que la noche no terminara.',
  },
};

export const QUESTS = {
  main: {
    id: 'main', name: 'La Espada Celestial', type: 'main', icon: 'sword',
    desc: 'Tres fragmentos, tres juramentos. Reúne la hoja que cortó la noche.',
    stages: [
      { objective: 'Habla con la Anciana Mira en Aldea del Alba.', hint: 'La anciana espera junto al santuario del pueblo.' },
      { objective: 'Encuentra el Altar del Alba en el Bosque de Lumen.', hint: 'Cruza la puerta norte de la aldea y sigue el sendero de luciérnagas.' },
      { objective: 'Recupera el Fragmento de Aether en las Ruinas.', hint: 'Activa las tres runas en el orden que revela la piedra de lore y derrota al Guardián Corrompido.' },
      { objective: 'Entra en el Santuario Celestial y derrota a Kael.', hint: 'El portal se abre al norte de las ruinas, tras el Guardián.' },
      { objective: 'La Espada Celestial ha sido restaurada.', hint: 'Aurelia vuelve a ver el amanecer.' },
    ],
  },
  fireflies: {
    id: 'fireflies', name: 'La luz perdida', type: 'side', icon: 'firefly',
    desc: 'Lía perdió sus luciérnagas en el bosque. Recoge tres y devuélvelas.',
    stages: [
      { objective: 'Encuentra a Lía cerca del pozo de la aldea.', hint: 'La niña juega junto al pozo, al sureste de la plaza.' },
      { objective: 'Recoge 3 luciérnagas en el Bosque de Lumen.', hint: 'Brillan entre los árboles. Sigue el resplandor verde.' },
      { objective: 'Devuelve las luciérnagas a Lía.', hint: 'Lía te espera junto al pozo.' },
      { objective: 'Completada. Lía vuelve a sonreír.', hint: '' },
    ],
    reward: { gold: 120, item: 'amuleto_luz' },
  },
  fangs: {
    id: 'fangs', name: 'Colmillos de ceniza', type: 'side', icon: 'fang',
    desc: 'Rook necesita cinco colmillos de lobo para rastrear a la manada corrupta.',
    stages: [
      { objective: 'Habla con Rook en la entrada del Bosque de Lumen.', hint: 'El cazador acampa al sur del bosque.' },
      { objective: 'Reúne 5 colmillos de ceniza.', hint: 'Los lobos de ceniza vagan por el bosque.' },
      { objective: 'Entrega los colmillos a Rook.', hint: 'Rook sigue en su campamento.' },
      { objective: 'Completada. Rook te dio las Dagas de Sombra.', hint: '' },
    ],
    reward: { gold: 80, weapon: 'dagas_sombra' },
  },
  iron: {
    id: 'iron', name: 'El yunque roto', type: 'side', icon: 'ore',
    desc: 'Brann necesita piedra de hierro de los escarabajos para reparar su yunque.',
    stages: [
      { objective: 'Habla con Brann en la forja de la aldea.', hint: 'La forja humea al oeste de la plaza.' },
      { objective: 'Consigue 3 piedras de hierro.', hint: 'Los escarabajos pétreos habitan las Ruinas de Aether.' },
      { objective: 'Lleva el hierro a Brann.', hint: 'Brann te espera en su forja.' },
      { objective: 'Completada. Brann reforzó tu equipo.', hint: '' },
    ],
    reward: { gold: 100, armor: 'placas_alba' },
  },
  echoes: {
    id: 'echoes', name: 'Ecos de Aether', type: 'side', icon: 'echo',
    desc: 'Un espíritu olvidó su nombre. Recupera tres ecos de memoria en las ruinas.',
    stages: [
      { objective: 'Escucha al Espíritu de Aether.', hint: 'Vaga por el patio este de las ruinas.' },
      { objective: 'Recupera 3 ecos de memoria.', hint: 'Los espectros y los cristales antiguos conservan recuerdos.' },
      { objective: 'Devuelve los ecos al espíritu.', hint: 'El espíritu espera en el patio este.' },
      { objective: 'Completada. El espíritu recordó su nombre: Elian.', hint: '' },
    ],
    reward: { gold: 150, item: 'colgante_celestial' },
  },
};

export const ACHIEVEMENTS = [
  { id: 'first_blood', name: 'Primer filo', desc: 'Derrota a tu primer enemigo.' },
  { id: 'combo_10', name: 'Danza de acero', desc: 'Alcanza un combo de 10 golpes.' },
  { id: 'collector', name: 'Vínculo salvaje', desc: 'Colecciona 3 criaturas distintas.' },
  { id: 'explorer', name: 'Cartógrafo de Aurelia', desc: 'Visita las cuatro regiones.' },
  { id: 'guardian_slayer', name: 'El trono vacío', desc: 'Derrota al Guardián Corrompido.' },
  { id: 'celestial', name: 'El amanecer', desc: 'Restaura la Espada Celestial.' },
];

export const LORE = {
  village: [
    'Hace mil años, la Espada Celestial partió la noche en dos y devolvió el sol a Aurelia.',
    'La orden de Kael juró protegerla. Pero los juramentos también envejecen.',
  ],
  forest: [
    'Los árboles de Lumen crecieron sobre las cenizas de la primera batalla. Aún recuerdan el fuego.',
    'Las luciérnagas no son insectos: son fragmentos de luz que se niegan a apagarse.',
  ],
  ruins: [
    'Aether flotaba sobre el mundo antes de que los hombres aprendieran a escribir.',
    'Tres runas sostienen el cielo: Sol, Luna y Estrella. El orden importa.',
    'El Guardián no duerme. Espera.',
  ],
  sanctuary: [
    'Aquí terminó la primera noche. Aquí comienza la última.',
    'Kael no quiso destruir el mundo. Quiso detener el tiempo para no perderlo.',
  ],
};

export const ZONE_INFO = {
  village: { name: 'Aldea del Alba', subtitle: 'Donde despierta la luz', music: 'village', ambience: 'day' },
  forest: { name: 'Bosque de Lumen', subtitle: 'Susurros entre las raíces', music: 'forest', ambience: 'forest' },
  ruins: { name: 'Ruinas de Aether', subtitle: 'Memoria que no descansa', music: 'ruins', ambience: 'night' },
  sanctuary: { name: 'Santuario Celestial', subtitle: 'El último amanecer', music: 'sanctuary', ambience: 'cosmic' },
};

export const CONTROL_INFO = [
  { action: 'Mover', key: 'WASD / Flechas', pad: 'Stick / Cruceta', touch: 'Joystick virtual' },
  { action: 'Atacar', key: 'J / Espacio', pad: 'A', touch: 'Botón A' },
  { action: 'Esquivar', key: 'K', pad: 'B', touch: 'Botón B' },
  { action: 'Habilidad', key: 'L', pad: 'X', touch: 'Botón X' },
  { action: 'Interactuar', key: 'E', pad: 'Y', touch: 'Botón Y' },
  { action: 'Bloquear', key: 'Shift', pad: 'LT', touch: 'Escudo' },
  { action: 'Magia', key: 'F', pad: 'RT', touch: 'Magia' },
  { action: 'Cambiar hechizo', key: 'G / 1-4', pad: '—', touch: 'Chip de hechizo' },
  { action: 'Cambiar arma', key: 'Q', pad: 'LB', touch: 'Botón L' },
  { action: 'Criatura', key: 'R', pad: 'RB', touch: 'Botón R' },
  { action: 'Poción rápida', key: 'H', pad: '—', touch: 'Poción' },
  { action: 'Pausa', key: 'Esc', pad: 'Start', touch: 'Pausa' },
  { action: 'Menú rápido', key: 'Tab', pad: 'Select', touch: 'Select' },
];

export const TIPS = [
  'Mantén BLOQUEO para reducir el daño. La barra de resistencia se agota si bloqueas demasiado.',
  'Encadena ataques con el ritmo correcto: el tercer golpe de la espada inflige más daño.',
  'Las criaturas con poca vida pueden ser vinculadas con Y. Aumenta tu Suerte para lograrlo.',
  'Cada arma tiene una habilidad distinta. Prueba todas antes de elegir favorita.',
  'Los santuarios restauran vida y maná, y guardan tu partida automáticamente.',
  'La esquiva otorga invulnerabilidad breve. Úsala para atravesar ataques telegrafiados.',
  'Los escarabajos reciben menos daño de frente. Golpéalos por la espalda.',
  'El fuego quema, el hielo ralentiza y el rayo salta entre enemigos. Combina hechizos.',
  'Puedes personalizar el tamaño, la posición y la opacidad de los controles táctiles.',
  'Explora los rincones del mapa: hay cofres ocultos y pasajes secretos.',
];
