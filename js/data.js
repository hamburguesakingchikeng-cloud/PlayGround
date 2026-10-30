// Datos del juego: armas, reliquias, criaturas, enemigos y secretos de Lumen.
export const RARITY = [
  { name: 'Común', color: '#c8c4b8', glow: 'rgba(200,196,184,.25)' },
  { name: 'Fino', color: '#77c98d', glow: 'rgba(119,201,141,.25)' },
  { name: 'Raro', color: '#6bb7e8', glow: 'rgba(107,183,232,.3)' },
  { name: 'Épico', color: '#c084f5', glow: 'rgba(192,132,245,.32)' },
  { name: 'Celestial', color: '#f1cf79', glow: 'rgba(241,207,121,.38)' }
];

export const ELEMENTS = {
  physical: { name: 'Físico', color: '#d8d4c8', icon: '✦' },
  light: { name: 'Luz', color: '#ffe6a3', icon: '✧' },
  fire: { name: 'Fuego', color: '#ff8a4f', icon: '🔥' },
  moon: { name: 'Luna', color: '#9fd8ff', icon: '☾' },
  stone: { name: 'Tierra', color: '#c4a56f', icon: '◆' },
  shadow: { name: 'Sombra', color: '#b68ce8', icon: '✹' },
  leaf: { name: 'Bosque', color: '#86d69b', icon: '❧' }
};

export const WEAPONS = {
  espada_alba: {
    id: 'espada_alba', name: 'Espada del Alba', type: 'weapon', weaponType: 'sword', icon: 'sword',
    rarity: 2, price: 180, element: 'light',
    stats: { atk: 11, def: 1, agi: 1 },
    speed: 1.02, range: 62, arc: 1.55, knockback: 150,
    desc: 'Hoja ceremonial de Vado Lirio. Su filo recuerda el primer amanecer.',
    lore: 'Forjada con una esquirlа del astro que cayó sobre el bosque.'
  },
  daga_viento: {
    id: 'daga_viento', name: 'Daga del Viento', type: 'weapon', weaponType: 'dagger', icon: 'dagger',
    rarity: 1, price: 120, element: 'physical',
    stats: { atk: 7, agi: 4, luck: 2 },
    speed: 1.52, range: 44, arc: 1.25, knockback: 70, crit: 8,
    desc: 'Rápida como una mentira susurrada. Favorece los golpes certeros.',
    lore: 'La empuñadura apenas pesa. El viento hace el resto.'
  },
  lanza_alba: {
    id: 'lanza_alba', name: 'Lanza del Alba', type: 'weapon', weaponType: 'spear', icon: 'spear',
    rarity: 1, price: 140, element: 'physical',
    stats: { atk: 9, def: 2 },
    speed: 0.92, range: 92, arc: 0.5, knockback: 180,
    desc: 'Alcance generoso y una punta que brilla cuando hay peligro.',
    lore: 'Los centinelas de la puerta celestial aún la consideran un arma sagrada.'
  },
  mandoble_obsidiana: {
    id: 'mandoble_obsidiana', name: 'Mandoble de Obsidiana', type: 'weapon', weaponType: 'greatsword', icon: 'greatsword',
    rarity: 3, price: 420, element: 'fire',
    stats: { atk: 23, def: 3, agi: -3 },
    speed: 0.68, range: 76, arc: 2.0, knockback: 300,
    desc: 'Pesa como una culpa, corta como un eclipse.',
    lore: 'Bran la templó siete noches con ceniza de lobo.'
  },
  arco_bosque: {
    id: 'arco_bosque', name: 'Arco del Bosque', type: 'weapon', weaponType: 'bow', icon: 'bow',
    rarity: 2, price: 260, element: 'leaf',
    stats: { atk: 10, agi: 3 },
    speed: 0.82, range: 390, arc: 0.35, boltSpeed: 620, projectile: true,
    desc: 'Dispara flechas de savia que atraviesan la niebla.',
    lore: 'Tallado de una rama que nunca dejó de florecer.'
  },
  baston_estrellas: {
    id: 'baston_estrellas', name: 'Bastón de Estrellas', type: 'weapon', weaponType: 'staff', icon: 'staff',
    rarity: 3, price: 460, element: 'moon',
    stats: { atk: 8, int: 7, mp: 15 },
    speed: 0.78, range: 360, arc: 0.4, boltSpeed: 480, projectile: true, magic: true,
    desc: 'Cada orbe contiene el último aliento de una estrella.',
    lore: 'La Anciana Lyss lo guardaba para quien pudiera oír cantar al cielo.'
  },
  espada_celestial: {
    id: 'espada_celestial', name: 'Espada Celestial', type: 'weapon', weaponType: 'sword', icon: 'celestial',
    rarity: 4, price: 0, element: 'light',
    stats: { atk: 34, def: 8, agi: 5, int: 6, luck: 4 },
    speed: 1.18, range: 78, arc: 1.85, knockback: 260, crit: 8,
    desc: 'El cielo hecho filo. Solo existe mientras alguien decida protegerlo.',
    lore: 'No fue forjada para vencer. Fue forjada para que otros pudieran vivir.'
  }
};

export const SHIELDS = {
  escudo_roble: {
    id: 'escudo_roble', name: 'Escudo de Roble', type: 'shield', icon: 'shield', rarity: 1, price: 90,
    stats: { def: 5, agi: -1 }, block: 0.58,
    desc: 'Madera endurecida con resina. Bloquea el 58% del daño frontal.',
    lore: 'Todavía huele a bosque después de la lluvia.'
  },
  escudo_lunar: {
    id: 'escudo_lunar', name: 'Escudo Lunar', type: 'shield', icon: 'shield_moon', rarity: 3, price: 360,
    stats: { def: 10, mp: 10 }, block: 0.76, magicBlock: 0.35,
    desc: 'Un disco de plata que devuelve la mirada a la noche.',
    lore: 'En las ruinas, los escudos cantan cuando la luna está alta.'
  }
};

export const ARMORS = {
  tunica_viajero: {
    id: 'tunica_viajero', name: 'Túnica de Viajero', type: 'armor', icon: 'armor', rarity: 0, price: 40,
    stats: { def: 2, hp: 8, agi: 1 }, palette: '#3b5f86',
    desc: 'Tela resistente, bolsillos profundos y una capa para el camino.'
  },
  coraza_ceniza: {
    id: 'coraza_ceniza', name: 'Coraza de Ceniza', type: 'armor', icon: 'armor', rarity: 2, price: 240,
    stats: { def: 8, hp: 24, agi: -1 }, palette: '#6b5b58',
    desc: 'Placas oscuras templadas con fuego de lobo.',
    lore: 'El herrero jura que la ceniza aparta las pesadillas.'
  },
  manto_ruinas: {
    id: 'manto_ruinas', name: 'Manto de las Ruinas', type: 'armor', icon: 'robe', rarity: 3, price: 330,
    stats: { def: 5, hp: 12, mp: 22, int: 4 }, palette: '#51437a',
    desc: 'Tejido con polvo de espectro. La magia fluye sin hacer ruido.',
    lore: 'Solo pesa cuando mientes.'
  },
  armadura_celestial: {
    id: 'armadura_celestial', name: 'Armadura Celestial', type: 'armor', icon: 'armor_gold', rarity: 4, price: 0,
    stats: { def: 16, hp: 45, mp: 20, agi: 2 }, palette: '#d6b45d',
    desc: 'Un manto de luz sólida que reconoce a su portador.',
    lore: 'El Guardián la llevó antes de que el Vacío le robara el nombre.'
  }
};

export const ACCESSORIES = {
  amuleto_lunar: {
    id: 'amuleto_lunar', name: 'Amuleto Lunar', type: 'accessory', icon: 'amulet', rarity: 2, price: 170,
    stats: { int: 3, mp: 18, luck: 2 },
    desc: 'Un colgante de piedra lechosa que se enfría antes de una emboscada.',
    lore: 'Mira dice que las lilas crecen donde alguien recordó un nombre.'
  },
  anillo_suerte: {
    id: 'anillo_suerte', name: 'Anillo de la Suerte', type: 'accessory', icon: 'ring', rarity: 2, price: 210,
    stats: { luck: 6, crit: 3 },
    desc: 'Una moneda antigua engarzada en plata. A veces cae del lado correcto.'
  },
  talisman_fenix: {
    id: 'talisman_fenix', name: 'Talismán del Fénix', type: 'accessory', icon: 'talisman', rarity: 4, price: 0,
    stats: { hp: 35, crit: 6, atk: 3 },
    desc: 'Una pluma que arde sin consumirse. Reaviva el valor en la oscuridad.',
    lore: 'Renacer no es volver. Es seguir con lo aprendido.'
  },
  broche_velocidad: {
    id: 'broche_velocidad', name: 'Broche del Corredor', type: 'accessory', icon: 'brooch', rarity: 2, price: 190,
    stats: { agi: 4, stamina: 15 },
    desc: 'Un broche con forma de hoja. El viento lo empuja un poco.'
  }
};

export const CONSUMABLES = {
  pocion_vida: {
    id: 'pocion_vida', name: 'Poción de Vida', type: 'consumable', icon: 'potion_red', rarity: 0, price: 22,
    heal: 58, desc: 'Restaura 58 puntos de vida.', flavor: 'Sabe a bayas y a decisiones apresuradas.'
  },
  pocion_mana: {
    id: 'pocion_mana', name: 'Poción de Maná', type: 'consumable', icon: 'potion_blue', rarity: 0, price: 26,
    mana: 38, desc: 'Restaura 38 puntos de maná.', flavor: 'Efervescente, fría, con un deje de tormenta.'
  },
  elixir_alba: {
    id: 'elixir_alba', name: 'Elixir del Alba', type: 'consumable', icon: 'elixir', rarity: 3, price: 110,
    healFull: true, manaFull: true, desc: 'Restaura toda la vida y el maná.', flavor: 'Un amanecer embotellado. Úsalo cuando la noche apriete.'
  },
  tonico_resistencia: {
    id: 'tonico_resistencia', name: 'Tónico de Resistencia', type: 'consumable', icon: 'potion_green', rarity: 1, price: 34,
    staminaFull: true, desc: 'Restaura toda la resistencia.', flavor: 'Sabe a menta, cuero y segunda oportunidad.'
  },
  sello_vinculo: {
    id: 'sello_vinculo', name: 'Sello de Vínculo', type: 'consumable', icon: 'seal', rarity: 1, price: 48,
    desc: 'Permite intentar sellar a una criatura debilitada con Y.', flavor: 'Un círculo de tinta luminosa. Las bestias recuerdan su calor.'
  }
};

export const MATERIALS = {
  nucleo_piedra: {
    id: 'nucleo_piedra', name: 'Núcleo de Piedra', type: 'material', icon: 'core', rarity: 1, price: 30,
    desc: 'El corazón mineral de un escarabajo pétreo.'
  },
  esencia_ceniza: {
    id: 'esencia_ceniza', name: 'Esencia de Ceniza', type: 'material', icon: 'ember', rarity: 1, price: 28,
    desc: 'Polvo cálido que aún recuerda la forma de un lobo.'
  },
  lirio_lunar: {
    id: 'lirio_lunar', name: 'Lirio Lunar', type: 'material', icon: 'flower', rarity: 1, price: 0, quest: true,
    desc: 'Una flor que solo abre cuando nadie la mira.'
  },
  fragmento_alma: {
    id: 'fragmento_alma', name: 'Fragmento de Alma', type: 'material', icon: 'soul', rarity: 2, price: 45,
    desc: 'Una esquina de memoria atrapada en cristal.'
  },
  pluma_fenix: {
    id: 'pluma_fenix', name: 'Pluma de Fénix', type: 'material', icon: 'feather', rarity: 3, price: 150,
    desc: 'Arde al tacto, pero no quema.'
  }
};

export const KEY_ITEMS = {
  sello_bosque: {
    id: 'sello_bosque', name: 'Sello del Bosque', type: 'quest', icon: 'sigil_leaf', rarity: 3, price: 0,
    desc: 'Primer Sello del Alba. Late como un corazón de savia.'
  },
  sello_piedra: {
    id: 'sello_piedra', name: 'Sello de la Piedra', type: 'quest', icon: 'sigil_stone', rarity: 3, price: 0,
    desc: 'Segundo Sello del Alba. Pesa más de lo que debería.'
  },
  sello_espectro: {
    id: 'sello_espectro', name: 'Sello del Vacío', type: 'quest', icon: 'sigil_moon', rarity: 3, price: 0,
    desc: 'Tercer Sello del Alba. Está frío incluso bajo el sol.'
  },
  espada_madera: {
    id: 'espada_madera', name: 'Espada de Madera', type: 'quest', icon: 'wood_sword', rarity: 0, price: 0,
    desc: 'La espada de juguete de Nilo. Tiene una muesca con forma de sonrisa.'
  },
  reliquia_fenix: {
    id: 'reliquia_fenix', name: 'Reliquia del Fénix', type: 'quest', icon: 'feather', rarity: 4, price: 0,
    desc: 'Un huevo de brasa dormido. Al tocarlo, una criatura responde.'
  },
  llave_ruinas: {
    id: 'llave_ruinas', name: 'Llave de Aethel', type: 'quest', icon: 'key', rarity: 2, price: 0,
    desc: 'Abre el santuario interior de las ruinas.'
  }
};

export const ITEMS = { ...WEAPONS, ...SHIELDS, ...ARMORS, ...ACCESSORIES, ...CONSUMABLES, ...MATERIALS, ...KEY_ITEMS };

export function getItem(id) {
  return ITEMS[id] || null;
}

export const EQUIPMENT_SLOTS = [
  { id: 'weapon', name: 'Arma', types: ['weapon'] },
  { id: 'shield', name: 'Escudo', types: ['shield'] },
  { id: 'armor', name: 'Armadura', types: ['armor'] },
  { id: 'accessory', name: 'Accesorio', types: ['accessory'] }
];

export const SKILLS = {
  corte_celestial: {
    id: 'corte_celestial', name: 'Corte Celestial', level: 1, mana: 12, cooldown: 1.4, element: 'light',
    icon: 'slash', color: '#ffe5a0',
    desc: 'Proyecta una media luna de luz que atraviesa a los enemigos.',
    damage: 2.05
  },
  danza_hojas: {
    id: 'danza_hojas', name: 'Danza de Hojas', level: 3, mana: 20, cooldown: 3.2, element: 'leaf',
    icon: 'spin', color: '#9df0ae',
    desc: 'Gira con el filo extendido y golpea todo lo que te rodea.',
    damage: 1.45
  },
  sanacion_lunar: {
    id: 'sanacion_lunar', name: 'Sanación Lunar', level: 5, mana: 26, cooldown: 9, element: 'moon',
    icon: 'heal', color: '#b7e8ff',
    desc: 'Invoca un círculo de luna que restaura vida durante unos segundos.',
    damage: 0
  },
  lanza_aurora: {
    id: 'lanza_aurora', name: 'Lanza de Aurora', level: 7, mana: 24, cooldown: 4.5, element: 'light',
    icon: 'spear', color: '#ffd27a',
    desc: 'Una lanza de luz perfora la línea de enemigos frente a ti.',
    damage: 2.8
  }
};

export const CREATURES = {
  lumito: {
    id: 'lumito', name: 'Lumito', type: 'gelatina', element: 'light', rarity: 1,
    color: '#9be8b1', accent: '#e8ffd8',
    passive: 'Pulso de vida: +1.5 vida por segundo.',
    active: 'Destello curativo: restaura un 22% de vida.',
    desc: 'Una gelatina curiosa que se alimenta de rocío y de canciones.'
  },
  lobo_ceniza: {
    id: 'lobo_ceniza', name: 'Lobo de Ceniza', type: 'lobo', element: 'fire', rarity: 2,
    color: '#8d7f7b', accent: '#ff8e52',
    passive: 'Paso salvaje: +8% velocidad de movimiento.',
    active: 'Mordisco de brasa: se lanza contra el enemigo más cercano.',
    desc: 'Un cachorro de ceniza que aún no sabe si morder o jugar.'
  },
  escarabajo_petreo: {
    id: 'escarabajo_petreo', name: 'Escarabajo Pétreo', type: 'escarabajo', element: 'stone', rarity: 2,
    color: '#8b7d62', accent: '#e0c47a',
    passive: 'Caparazón: +6 defensa.',
    active: 'Muro de piedra: reduce el daño recibido durante 8 segundos.',
    desc: 'Lleva una montaña pequeña en la espalda. Ronca como un temblor.'
  },
  espectro_ruinas: {
    id: 'espectro_ruinas', name: 'Espectro de las Ruinas', type: 'espectro', element: 'shadow', rarity: 3,
    color: '#8d86b8', accent: '#bff4ff',
    passive: 'Susurro arcano: +12 maná máximo.',
    active: 'Orbe de las almas: dispara tres orbes espectrales.',
    desc: 'Ya no recuerda su nombre, pero sí recuerda cómo proteger a un amigo.'
  },
  fenix_brasa: {
    id: 'fenix_brasa', name: 'Fénix de Brasa', type: 'fenix', element: 'fire', rarity: 4,
    color: '#ef9b47', accent: '#ffe28a',
    passive: 'Pluma ardiente: +8% probabilidad de crítico.',
    active: 'Llama purificadora: incendia a todos los enemigos cercanos.',
    desc: 'Nació de la última chispa de un sol que se negó a apagarse.'
  }
};

export const CREATURE_ORDER = ['lumito', 'lobo_ceniza', 'escarabajo_petreo', 'espectro_ruinas', 'fenix_brasa'];

// Enemigos con comportamiento, recompensas y posibilidad de vínculo.
export const ENEMIES = {
  gelatina: {
    id: 'gelatina', name: 'Gelatina Silvestre', draw: 'slime', hp: 52, atk: 9, def: 2, speed: 52,
    radius: 19, xp: 14, lumens: 8, aggro: 210, attackRange: 42, windup: 0.48, recovery: 0.75,
    element: 'leaf', color: '#74c98b', accent: '#c8ffd2', captureCreature: 'lumito',
    drops: [['pocion_vida', 0.22, 1], ['sello_vinculo', 0.06, 1], ['esencia_ceniza', 0.12, 1]],
    desc: 'Rebota hacia ti con una sonrisa transparente.'
  },
  lobo: {
    id: 'lobo', name: 'Lobo de Ceniza', draw: 'wolf', hp: 68, atk: 13, def: 3, speed: 112,
    radius: 20, xp: 22, lumens: 12, aggro: 300, attackRange: 48, windup: 0.34, recovery: 0.55,
    element: 'fire', color: '#8a7b75', accent: '#ff9154', captureCreature: 'lobo_ceniza',
    drops: [['esencia_ceniza', 0.72, 1], ['pocion_vida', 0.18, 1], ['sello_vinculo', 0.08, 1]],
    desc: 'Caza en silencio. Su aliento deja marcas grises en la hierba.'
  },
  escarabajo: {
    id: 'escarabajo', name: 'Escarabajo Pétreo', draw: 'beetle', hp: 112, atk: 16, def: 13, speed: 42,
    radius: 24, xp: 30, lumens: 18, aggro: 190, attackRange: 52, windup: 0.72, recovery: 1.05,
    element: 'stone', color: '#8c7c60', accent: '#d9bd78', captureCreature: 'escarabajo_petreo',
    drops: [['nucleo_piedra', 0.8, 1], ['pocion_vida', 0.15, 1], ['sello_vinculo', 0.1, 1]],
    desc: 'Su caparazón ha detenido cien tormentas. Tú no eres una tormenta.'
  },
  espectro: {
    id: 'espectro', name: 'Espectro de las Ruinas', draw: 'wraith', hp: 80, atk: 15, def: 4, speed: 68,
    radius: 19, xp: 32, lumens: 20, aggro: 360, attackRange: 270, windup: 0.8, recovery: 0.9,
    element: 'shadow', color: '#8078a7', accent: '#bff5ff', flying: true, ranged: true,
    captureCreature: 'espectro_ruinas',
    drops: [['fragmento_alma', 0.7, 1], ['pocion_mana', 0.22, 1], ['sello_vinculo', 0.12, 1]],
    desc: 'Flota entre columnas, repitiendo el nombre de una ciudad que ya no existe.'
  },
  fenix_salvaje: {
    id: 'fenix_salvaje', name: 'Fénix de Brasa', draw: 'fenix', hp: 160, atk: 22, def: 8, speed: 90,
    radius: 22, xp: 80, lumens: 60, aggro: 420, attackRange: 230, windup: 0.7, recovery: 1.1,
    element: 'fire', color: '#e98b3e', accent: '#ffe699', flying: true, ranged: true,
    captureCreature: 'fenix_brasa', elite: true,
    drops: [['pluma_fenix', 1, 1], ['elixir_alba', 0.5, 1]],
    desc: 'Un sol pequeño que decidió quedarse entre las ruinas.'
  },
  guardian: {
    id: 'guardian', name: 'Guardián Corrompido', draw: 'guardian', hp: 1650, atk: 26, def: 14, speed: 76,
    radius: 46, xp: 600, lumens: 500, aggro: 700, attackRange: 92, windup: 0.75, recovery: 0.95,
    element: 'shadow', color: '#55506b', accent: '#d3b2ff', boss: true,
    desc: 'El último centinela del cielo. El Vacío le robó el nombre y le dejó la espada.'
  }
};

export const BOSSES = {
  alfa_ceniza: {
    id: 'alfa_ceniza', base: 'lobo', name: 'Alfa de Ceniza', title: 'Señor de los Aullidos',
    hp: 430, atk: 20, def: 8, speed: 126, radius: 30, xp: 160, lumens: 120,
    color: '#6f5f5b', accent: '#ffb26b', element: 'fire', boss: true,
    drops: [['sello_bosque', 1, 1], ['esencia_ceniza', 1, 3], ['coraza_ceniza', 1, 1]],
    desc: 'El primero de los sellos. Su aullido despierta a todo el bosque.'
  },
  matriarca_petrea: {
    id: 'matriarca_petrea', base: 'escarabajo', name: 'Matriarca Pétrea', title: 'Corazón de la Cantera',
    hp: 620, atk: 24, def: 22, speed: 48, radius: 38, xp: 220, lumens: 150,
    color: '#7d6d50', accent: '#f0ce7c', element: 'stone', boss: true,
    drops: [['sello_piedra', 1, 1], ['nucleo_piedra', 1, 4], ['escudo_lunar', 1, 1]],
    desc: 'El segundo sello. Cada paso suyo reescribe el mapa de la cantera.'
  },
  rey_espectro: {
    id: 'rey_espectro', base: 'espectro', name: 'Rey Espectro de Aethel', title: 'Corona sin Reino',
    hp: 560, atk: 26, def: 10, speed: 92, radius: 30, xp: 240, lumens: 170,
    color: '#6f6a98', accent: '#d7ffff', element: 'shadow', boss: true,
    drops: [['sello_espectro', 1, 1], ['fragmento_alma', 1, 5], ['manto_ruinas', 1, 1]],
    desc: 'El tercer sello. Su corte son las estatuas que no pudieron huir.'
  }
};

// Los jefes heredan las animaciones y ataques base de estas criaturas.
export const BOSS_BASE = {
  alfa_ceniza: ENEMIES.lobo,
  matriarca_petrea: ENEMIES.escarabajo,
  rey_espectro: ENEMIES.espectro
};

export const SHOP_STOCK = {
  tilo: [
    'pocion_vida', 'pocion_mana', 'tonico_resistencia', 'sello_vinculo', 'pocion_vida',
    'escudo_roble', 'arco_bosque', 'anillo_suerte'
  ],
  bran: [
    'daga_viento', 'lanza_alba', 'mandoble_obsidiana', 'coraza_ceniza', 'tonico_resistencia',
    'escudo_lunar', 'baston_estrellas'
  ]
};

export const QUEST_DATA = {
  main: {
    name: 'Los Tres Sellos del Alba',
    type: 'main',
    stages: [
      { title: 'El cielo roto', desc: 'Habla con la Anciana Lyss en la plaza de Vado Lirio.' },
      { title: 'Los tres sellos', desc: 'Recupera los tres Sellos del Alba: Bosque, Piedra y Vacío.' },
      { title: 'La puerta celestial', desc: 'Los sellos han despertado. Abre la Puerta Celestial al norte.' },
      { title: 'El último centinela', desc: 'Derrota al Guardián Corrompido en el santuario del cielo.' },
      { title: 'Un nuevo amanecer', desc: 'La Espada Celestial ha elegido a su portador. El reino respira.' }
    ]
  },
  lirios: {
    name: 'Flores para los que no duermen',
    type: 'side',
    stages: [
      { title: 'Un encargo de Mira', desc: 'La sanadora necesita 3 Lirios Lunares del bosque.' },
      { title: 'Lirios reunidos', desc: 'Lleva los 3 Lirios Lunares a Mira en Vado Lirio.' },
      { title: 'Hecho', desc: 'Mira preparó un amuleto para protegerte de las pesadillas.' }
    ]
  },
  forja: {
    name: 'El fuego de Bran',
    type: 'side',
    stages: [
      { title: 'La forja apagada', desc: 'Bran necesita 3 Núcleos de Piedra de los escarabajos de la cantera.' },
      { title: 'Mineral reunido', desc: 'Lleva los 3 Núcleos de Piedra a Bran.' },
      { title: 'Hecho', desc: 'La forja vuelve a rugir. Bran puede crear mejores armas.' }
    ]
  },
  nino: {
    name: 'La espada de juguete',
    type: 'side',
    stages: [
      { title: 'Perdida entre helechos', desc: 'Nilo perdió su espada de madera en el bosque, cerca del claro de las lilas.' },
      { title: 'Encontrada', desc: 'Devuelve la espada de madera a Nilo.' },
      { title: 'Hecho', desc: 'Nilo ahora protege la plaza de dragones imaginarios.' }
    ]
  }
};

export const APPEARANCE = {
  hairStyles: [
    { id: 0, name: 'Melena del alba', desc: 'Larga, suelta, con reflejos dorados.' },
    { id: 1, name: 'Coleta del viento', desc: 'Práctica, valiente, siempre en movimiento.' },
    { id: 2, name: 'Corto de ceniza', desc: 'Rebelde y fácil de llevar bajo la capucha.' }
  ],
  hairColors: [
    { name: 'Castaño', value: '#6b3f2a' },
    { name: 'Plata', value: '#cfd4dc' },
    { name: 'Cobre', value: '#b95c35' },
    { name: 'Noche', value: '#2d2b3f' },
    { name: 'Lino', value: '#d9b978' },
    { name: 'Bruma', value: '#6e8e9b' }
  ],
  outfitColors: [
    { name: 'Azul celestial', value: '#315d8a' },
    { name: 'Carmesí', value: '#8e3a45' },
    { name: 'Verde bosque', value: '#3e6b50' },
    { name: 'Violeta arcano', value: '#5f4f8b' },
    { name: 'Marfil', value: '#c8b995' },
    { name: 'Carbón', value: '#3b3b46' }
  ],
  skinColors: [
    { name: 'Arena', value: '#e6b58f' },
    { name: 'Miel', value: '#c98e63' },
    { name: 'Oliva', value: '#a97452' },
    { name: 'Nieve', value: '#f1cfb6' },
    { name: 'Caoba', value: '#7e4c38' }
  ],
  cloakColors: [
    { name: 'Alba', value: '#d7b56e' },
    { name: 'Fuego', value: '#a94a3e' },
    { name: 'Musgo', value: '#4c7258' },
    { name: 'Crepúsculo', value: '#4e5382' }
  ]
};

export const STARTING_WEAPONS = ['espada_alba', 'daga_viento', 'lanza_alba'];

export const DIFFICULTIES = {
  historia: { name: 'Historia', desc: 'Combate amable. La historia siempre avanza.', enemyHp: 0.78, enemyDmg: 0.62, xp: 1.15 },
  normal: { name: 'Aventura', desc: 'La experiencia equilibrada de Lumen.', enemyHp: 1, enemyDmg: 1, xp: 1 },
  heroe: { name: 'Héroe', desc: 'Los enemigos muerden de verdad. Para veteranos.', enemyHp: 1.3, enemyDmg: 1.45, xp: 1.25 }
};
