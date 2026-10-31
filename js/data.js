/* ==========================================================================
   DATA — world rules, items, creatures, enemies, skills, quests.
   Pure data + tiny helpers. No DOM access.
   ========================================================================== */

export const RARITY = {
  common: { name: 'Común', color: '#93a6c7' },
  uncommon: { name: 'Inusual', color: '#8fe3a4' },
  rare: { name: 'Raro', color: '#7fb4ff' },
  epic: { name: 'Épico', color: '#a68bff' },
  legendary: { name: 'Legendario', color: '#f2d188' },
  key: { name: 'Reliquia', color: '#ffd27a' },
};

export const ELEMENTS = {
  fire: { name: 'Fuego', color: '#ff7a45', soft: '#ffb36b' },
  water: { name: 'Agua', color: '#58b9ff', soft: '#9fdcff' },
  earth: { name: 'Tierra', color: '#c0905a', soft: '#e6c08d' },
  wind: { name: 'Viento', color: '#8fe8c9', soft: '#c6fff0' },
  lightning: { name: 'Rayo', color: '#ffe066', soft: '#fff4a8' },
  ice: { name: 'Hielo', color: '#9fe4ff', soft: '#dcf7ff' },
  light: { name: 'Luz', color: '#fff0a8', soft: '#fff9d8' },
  dark: { name: 'Oscuridad', color: '#a68bff', soft: '#d3c5ff' },
  nature: { name: 'Naturaleza', color: '#8fe3a4', soft: '#c9ffd4' },
  celestial: { name: 'Energía Celestial', color: '#ffd98a', soft: '#fff2c7' },
};

export const APPEARANCE = {
  hairStyles: [
    { id: 'corto', name: 'Corto' },
    { id: 'largo', name: 'Largo' },
    { id: 'coleta', name: 'Coleta' },
    { id: 'ondulado', name: 'Ondulado' },
    { id: 'rapado', name: 'Rapado' },
  ],
  hairColors: [
    { id: 'nieve', name: 'Nieve', color: '#f4efe2' },
    { id: 'oro', name: 'Oro', color: '#f0c96a' },
    { id: 'cobre', name: 'Cobre', color: '#c96f3d' },
    { id: 'noche', name: 'Noche', color: '#2d3550' },
    { id: 'violeta', name: 'Violeta', color: '#9a7be0' },
    { id: 'verde', name: 'Musgo', color: '#5f9c7a' },
  ],
  skins: [
    { id: 'clara', name: 'Clara', color: '#f3cba8' },
    { id: 'dorada', name: 'Dorada', color: '#dba574' },
    { id: 'morena', name: 'Morena', color: '#a96e4c' },
    { id: 'profunda', name: 'Profunda', color: '#6d4430' },
  ],
  outfits: [
    { id: 'azul', name: 'Azul astral', color: '#35578f', accent: '#79c6e8' },
    { id: 'rojo', name: 'Carmesí', color: '#8a3145', accent: '#f0a06d' },
    { id: 'verde', name: 'Bosque', color: '#376b4b', accent: '#b8e08a' },
    { id: 'blanco', name: 'Marfil', color: '#d9d2bd', accent: '#8ba7d8' },
    { id: 'violeta', name: 'Arcana', color: '#563f8f', accent: '#c8a8ff' },
    { id: 'negro', name: 'Cuervo', color: '#252a3b', accent: '#7f8db5' },
  ],
  eyes: [
    { id: 'ambar', name: 'Ámbar', color: '#f3b45e' },
    { id: 'esmeralda', name: 'Esmeralda', color: '#66d3a1' },
    { id: 'zafiro', name: 'Zafiro', color: '#6aa8ff' },
    { id: 'violeta', name: 'Violeta', color: '#b28cff' },
  ],
};

export const STARTERS = [
  { creature: 'ignis', weapon: 'espada_aprendiz', label: 'Vanguardia de brasa', desc: 'Ignis + Espada de Aprendiz' },
  { creature: 'aqua', weapon: 'daga_sombria', label: 'Sombra de marea', desc: 'Aqua + Daga Sombría' },
  { creature: 'zephyra', weapon: 'arco_lunar', label: 'Cazador del viento', desc: 'Zephyra + Arco Lunar' },
];

/* -------------------------------------------------------------------------- */
/* Items                                                                      */
/* -------------------------------------------------------------------------- */
export const ITEMS = {
  potion_menor: { name: 'Poción de Lumen', type: 'consumable', icon: 'potion', rarity: 'common', value: 25, desc: 'Restaura 45 de vida.', effect: { heal: 45 } },
  potion_mayor: { name: 'Elixir de Alba', type: 'consumable', icon: 'potion', rarity: 'rare', value: 70, desc: 'Restaura 130 de vida.', effect: { heal: 130 } },
  ether: { name: 'Éter Astral', type: 'consumable', icon: 'ether', rarity: 'common', value: 35, desc: 'Restaura 35 de maná.', effect: { mana: 35 } },
  tonico: { name: 'Tónico de Vigor', type: 'consumable', icon: 'food', rarity: 'common', value: 20, desc: 'Restaura toda la resistencia.', effect: { stamina: 999 } },
  elixir: { name: 'Elixir Celestial', type: 'consumable', icon: 'crystal', rarity: 'legendary', value: 180, desc: 'Restaura por completo vida y maná.', effect: { heal: 9999, mana: 9999 } },
  comida_criatura: { name: 'Baya Estelar', type: 'consumable', icon: 'food', rarity: 'common', value: 18, desc: 'Da 40 de experiencia a una criatura.', effect: { creatureXp: 40 } },
  festin: { name: 'Festín Lunar', type: 'consumable', icon: 'food', rarity: 'rare', value: 60, desc: 'Da 140 de experiencia y sube el vínculo.', effect: { creatureXp: 140, bond: 12 } },
  cristal_sello: { name: 'Cristal de Sello', type: 'consumable', icon: 'crystal', rarity: 'common', value: 30, desc: 'Sella criaturas debilitadas. +35% de captura.', effect: { capture: 0.35 } },
  cristal_sello_mayor: { name: 'Sello Prismático', type: 'consumable', icon: 'gem', rarity: 'rare', value: 90, desc: 'Sello de alta pureza. +65% de captura.', effect: { capture: 0.65 } },

  gelatina: { name: 'Núcleo de Gelatina', type: 'material', icon: 'gem', rarity: 'common', value: 8, desc: 'Materia blanda y luminosa.' },
  colmillo: { name: 'Colmillo de Ceniza', type: 'material', icon: 'pelt', rarity: 'common', value: 12, desc: 'Colmillo de un lobo de ceniza.' },
  caparazon: { name: 'Placa Pétrea', type: 'material', icon: 'ore', rarity: 'uncommon', value: 15, desc: 'Fragmento de caparazón endurecido.' },
  esencia: { name: 'Esencia Espectral', type: 'material', icon: 'ether', rarity: 'uncommon', value: 18, desc: 'Susurro atrapado en cristal.' },
  hierba: { name: 'Hierba Lunar', type: 'material', icon: 'herb', rarity: 'common', value: 10, desc: 'Crece donde la luna toca el bosque.' },
  hierro: { name: 'Hierro Estelar', type: 'material', icon: 'ore', rarity: 'uncommon', value: 22, desc: 'Metal frío con vetas de luz.' },
  cuero: { name: 'Cuero de Lobo', type: 'material', icon: 'pelt', rarity: 'common', value: 14, desc: 'Resistente y ligero.' },
  cristal_fuego: { name: 'Cristal Ígneo', type: 'material', icon: 'fire', rarity: 'rare', value: 30, desc: 'Arde sin consumirse.' },
  pluma: { name: 'Pluma de Zephyr', type: 'material', icon: 'wind', rarity: 'uncommon', value: 16, desc: 'Flota incluso sin viento.' },
  fragmento: { name: 'Fragmento Celestial', type: 'material', icon: 'spark', rarity: 'epic', value: 80, desc: 'Un trozo de la Espada Celestial.' },
  runa_bosque: { name: 'Runa del Bosque', type: 'key', icon: 'rune', rarity: 'key', value: 0, desc: 'Primera llave del Templo Celestial.' },
  runa_aethel: { name: 'Runa de Aethel', type: 'key', icon: 'rune', rarity: 'key', value: 0, desc: 'Segunda llave del Templo Celestial.' },
  runa_ceniza: { name: 'Runa de Ceniza', type: 'key', icon: 'rune', rarity: 'key', value: 0, desc: 'Tercera llave del Templo Celestial.' },
  llave_templo: { name: 'Sello del Templo', type: 'key', icon: 'key', rarity: 'key', value: 0, desc: 'Abre el portal del Templo Celestial.' },

  espada_aprendiz: { name: 'Espada de Aprendiz', type: 'weapon', slot: 'weapon', icon: 'sword', rarity: 'common', value: 0, desc: 'Equilibrada y fiable. El primer paso de toda leyenda.', weapon: { kind: 'sword', dmg: 10, speed: 1.0, range: 68, arc: 1.75, crit: 0.05 }, stats: { str: 1 } },
  mandoble_alba: { name: 'Mandoble del Alba', type: 'weapon', slot: 'weapon', icon: 'greatsword', rarity: 'rare', value: 260, desc: 'Lento y devastador. Su arco corta el aire en dos.', weapon: { kind: 'greatsword', dmg: 24, speed: 0.72, range: 88, arc: 2.25, crit: 0.04 }, stats: { str: 4, spd: -1 } },
  daga_sombria: { name: 'Daga Sombría', type: 'weapon', slot: 'weapon', icon: 'dagger', rarity: 'uncommon', value: 180, desc: 'Rápida como un susurro. Alta probabilidad de crítico.', weapon: { kind: 'dagger', dmg: 8, speed: 1.65, range: 50, arc: 1.3, crit: 0.18 }, stats: { spd: 2 } },
  lanza_viento: { name: 'Lanza del Viento', type: 'weapon', slot: 'weapon', icon: 'spear', rarity: 'rare', value: 220, desc: 'Alcance excepcional. Golpea antes de que te vean.', weapon: { kind: 'spear', dmg: 15, speed: 1.05, range: 98, arc: 0.75, crit: 0.06 }, stats: { str: 2, spd: 1 } },
  arco_lunar: { name: 'Arco Lunar', type: 'weapon', slot: 'weapon', icon: 'bow', rarity: 'rare', value: 240, desc: 'Dispara flechas de luz a distancia.', weapon: { kind: 'bow', dmg: 13, speed: 0.9, range: 430, arc: 0.2, crit: 0.1, projectile: 'arrow', mpCost: 0 }, stats: { spd: 1, luck: 1 } },
  baston_estrellas: { name: 'Bastón de Estrellas', type: 'weapon', slot: 'weapon', icon: 'staff', rarity: 'rare', value: 250, desc: 'Canaliza proyectiles arcanos. Escala con Inteligencia.', weapon: { kind: 'staff', dmg: 9, speed: 0.85, range: 390, arc: 0.2, crit: 0.08, projectile: 'magic', mpCost: 0, magic: true }, stats: { int: 4, mp: 15 } },
  espada_celestial: { name: 'Espada Celestial', type: 'weapon', slot: 'weapon', icon: 'sword', rarity: 'legendary', value: 0, desc: 'La hoja que atravesó el cielo. Late con luz propia.', weapon: { kind: 'sword', dmg: 31, speed: 1.15, range: 80, arc: 2.0, crit: 0.12, celestial: true }, stats: { str: 6, int: 3, luck: 2 } },

  escudo_roble: { name: 'Escudo de Roble', type: 'shield', slot: 'shield', icon: 'shield', rarity: 'common', value: 120, desc: 'Aguanta lo suficiente para contraatacar.', stats: { def: 4 } },
  escudo_celestial: { name: 'Escudo Celestial', type: 'shield', slot: 'shield', icon: 'shield', rarity: 'legendary', value: 420, desc: 'Un muro de luz estelar.', stats: { def: 9, hp: 20 } },

  tunica_viajero: { name: 'Túnica de Viajero', type: 'armor', slot: 'armor', icon: 'armor', rarity: 'common', value: 0, desc: 'Ligera, gastada y llena de historias.', stats: { def: 2, spd: 1 } },
  cota_malla: { name: 'Cota de Malla', type: 'armor', slot: 'armor', icon: 'armor', rarity: 'uncommon', value: 180, desc: 'Anillos de hierro entrelazados.', stats: { def: 6, spd: -0.3 } },
  manto_estelar: { name: 'Manto Estelar', type: 'armor', slot: 'armor', icon: 'armor', rarity: 'rare', value: 260, desc: 'Tejido con hilos de constelaciones.', stats: { def: 5, int: 3, mp: 15 } },
  armadura_celestial: { name: 'Armadura Celestial', type: 'armor', slot: 'armor', icon: 'armor', rarity: 'legendary', value: 600, desc: 'Forjada para resistir el vacío.', stats: { def: 10, hp: 35, str: 2 } },

  amuleto_zorro: { name: 'Amuleto del Zorro', type: 'accessory', slot: 'accessory', icon: 'amulet', rarity: 'uncommon', value: 140, desc: 'La suerte favorece a los audaces.', stats: { luck: 2, spd: 1 } },
  anillo_sabio: { name: 'Anillo del Sabio', type: 'accessory', slot: 'accessory', icon: 'ring', rarity: 'rare', value: 200, desc: 'Cada runa susurra un secreto.', stats: { int: 3, mp: 20 } },
  bota_veloz: { name: 'Botas del Viento', type: 'accessory', slot: 'accessory', icon: 'boot', rarity: 'rare', value: 160, desc: 'El suelo apenas te toca.', stats: { spd: 2 } },
  talisman_suerte: { name: 'Talismán de Suerte', type: 'accessory', slot: 'accessory', icon: 'amulet', rarity: 'epic', value: 220, desc: 'Cuatro estrellas guardan tu camino.', stats: { luck: 4 } },

  collar_brasa: { name: 'Collar de Brasa', type: 'charm', slot: 'charm', icon: 'fire', rarity: 'rare', value: 120, desc: 'Amuleto para criaturas. +6 de ataque.', charm: { atk: 6 } },
  colgante_marea: { name: 'Colgante de Marea', type: 'charm', slot: 'charm', icon: 'water', rarity: 'rare', value: 120, desc: 'Amuleto para criaturas. +20 de vida.', charm: { hp: 20 } },
  pluma_zephyr: { name: 'Pluma de Zephyr', type: 'charm', slot: 'charm', icon: 'wind', rarity: 'rare', value: 120, desc: 'Amuleto para criaturas. +8% de velocidad de asistencia.', charm: { haste: 0.08 } },
};

export const SHOP_MIRA = ['potion_menor', 'potion_mayor', 'ether', 'tonico', 'comida_criatura', 'festin', 'cristal_sello', 'cristal_sello_mayor', 'hierba', 'hierro'];
export const SHOP_TORIN = ['mandoble_alba', 'daga_sombria', 'lanza_viento', 'arco_lunar', 'baston_estrellas', 'escudo_roble', 'cota_malla', 'manto_estelar', 'amuleto_zorro', 'anillo_sabio', 'bota_veloz'];

/* -------------------------------------------------------------------------- */
/* Creatures                                                                  */
/* -------------------------------------------------------------------------- */
export const CREATURES = {
  ignis: {
    name: 'Ignis', title: 'Zorro de Brasa', element: 'fire', ability: 'burn', abilityName: 'Quemar zarzas',
    skill: 'Colmillo Ígneo', desc: 'Un zorro de pelaje ardiente. Su cola deja estelas de chispas.',
    evolve: 'Pyraxis', evolveLevel: 8, rarity: 'común', habitat: 'Bosque de los Susurros',
    base: { hp: 52, atk: 13, spd: 9 }, colors: ['#ff8a4c', '#ffd166'], wild: { hp: 58, atk: 10, spd: 54 },
  },
  aqua: {
    name: 'Aqua', title: 'Nutria de Marea', element: 'water', ability: 'swim', abilityName: 'Nadar',
    skill: 'Burbuja Prismática', desc: 'Juega entre corrientes y puede respirar bajo el agua.',
    evolve: 'Nereida', evolveLevel: 8, rarity: 'común', habitat: 'Estanque del Bosque',
    base: { hp: 60, atk: 10, spd: 8 }, colors: ['#58b9ff', '#b7ecff'], wild: { hp: 64, atk: 9, spd: 50 },
  },
  terron: {
    name: 'Terron', title: 'Topo de Granito', element: 'earth', ability: 'move', abilityName: 'Mover bloques',
    skill: 'Roca Rodante', desc: 'Un pequeño coloso. Puede cargar con bloques enormes y llevar jinete.',
    evolve: 'Golem', evolveLevel: 8, rarity: 'poco común', habitat: 'Cañón de Ceniza',
    base: { hp: 78, atk: 14, spd: 5 }, colors: ['#c0905a', '#e6c08d'], wild: { hp: 86, atk: 11, spd: 38 },
  },
  zephyra: {
    name: 'Zephyra', title: 'Halcón de Brisa', element: 'wind', ability: 'fly', abilityName: 'Volar y detectar',
    skill: 'Vendaval', desc: 'Sus alas revelan senderos ocultos entre la maleza.',
    evolve: 'Tempestad', evolveLevel: 8, rarity: 'poco común', habitat: 'Claro del Bosque',
    base: { hp: 48, atk: 12, spd: 13 }, colors: ['#8fe8c9', '#d6fff5'], wild: { hp: 52, atk: 10, spd: 74 },
  },
  volt: {
    name: 'Volt', title: 'Lince de Chispa', element: 'lightning', ability: 'switch', abilityName: 'Activar runas',
    skill: 'Cadena de Chispas', desc: 'Su pelaje erizado ilumina los mecanismos antiguos.',
    evolve: 'Tormenta', evolveLevel: 8, rarity: 'raro', habitat: 'Ruinas de Aethel',
    base: { hp: 54, atk: 15, spd: 12 }, colors: ['#ffe066', '#fff4a8'], wild: { hp: 58, atk: 12, spd: 68 },
  },
  glacius: {
    name: 'Glacius', title: 'Zorro de Escarcha', element: 'ice', ability: 'freeze', abilityName: 'Congelar mecanismos',
    skill: 'Lanza Gélida', desc: 'Cada paso suyo deja una flor de hielo que no se derrite.',
    evolve: 'Borealis', evolveLevel: 8, rarity: 'raro', habitat: 'Ruinas de Aethel',
    base: { hp: 56, atk: 14, spd: 9 }, colors: ['#9fe4ff', '#e8fbff'], wild: { hp: 60, atk: 11, spd: 56 },
  },
  lumina: {
    name: 'Lumina', title: 'Ciervo de Alba', element: 'light', ability: 'light', abilityName: 'Iluminar la oscuridad',
    skill: 'Destello Sagrado', desc: 'Su cornamenta guarda la primera luz del amanecer.',
    evolve: 'Aurora', evolveLevel: 8, rarity: 'raro', habitat: 'Santuario del Bosque',
    base: { hp: 58, atk: 13, spd: 10 }, colors: ['#fff0a8', '#fffbe0'], wild: { hp: 62, atk: 10, spd: 58 },
  },
  umbra: {
    name: 'Umbra', title: 'Gato de Sombra', element: 'dark', ability: 'detect', abilityName: 'Detectar secretos',
    skill: 'Garra Umbría', desc: 'Ve lo que otros no ven, incluso a través de la piedra.',
    evolve: 'Nocturno', evolveLevel: 8, rarity: 'raro', habitat: 'Ruinas de Aethel',
    base: { hp: 50, atk: 16, spd: 11 }, colors: ['#a68bff', '#d8cbff'], wild: { hp: 54, atk: 13, spd: 64 },
  },
  sylva: {
    name: 'Sylva', title: 'Espíritu de Savia', element: 'nature', ability: 'heal', abilityName: 'Regeneración natural',
    skill: 'Látigo de Savia', desc: 'Un pequeño guardián de raíces que cura las heridas del bosque.',
    evolve: 'Dryada', evolveLevel: 8, rarity: 'poco común', habitat: 'Bosque de los Susurros',
    base: { hp: 64, atk: 11, spd: 7 }, colors: ['#8fe3a4', '#d5ffdd'], wild: { hp: 70, atk: 9, spd: 44 },
  },
  aether: {
    name: 'Aether', title: 'Heredero Celestial', element: 'celestial', ability: 'celestial', abilityName: 'Abrir portales celestiales',
    skill: 'Juicio Estelar', desc: 'La criatura que la Espada Celestial dejó al partirse. Solo responde a quien reúne las runas.',
    evolve: 'Aether Supremo', evolveLevel: 15, rarity: 'legendario', habitat: 'Templo Celestial',
    base: { hp: 72, atk: 18, spd: 12 }, colors: ['#ffd98a', '#fff6d8'], wild: null,
  },
};

export const ABILITY_LABELS = {
  burn: 'Quemar zarzas', swim: 'Nadar', move: 'Mover bloques', fly: 'Volar', switch: 'Activar runas',
  freeze: 'Congelar mecanismos', light: 'Iluminar', detect: 'Detectar secretos', heal: 'Regeneración', celestial: 'Portal celestial',
};

/* -------------------------------------------------------------------------- */
/* Enemies                                                                    */
/* -------------------------------------------------------------------------- */
export const ENEMIES = {
  gelatina: { name: 'Gelatina Silvestre', kind: 'blob', hp: 38, atk: 7, def: 0, speed: 46, radius: 17, aggro: 190, xp: 22, gold: [4, 9], colors: ['#79d98f', '#d9ffe1'], drops: [{ id: 'gelatina', chance: 0.85 }, { id: 'hierba', chance: 0.15 }], height: 30, level: 1 },
  lobo: { name: 'Lobo de Ceniza', kind: 'wolf', hp: 54, atk: 10, def: 1, speed: 86, radius: 17, aggro: 270, xp: 34, gold: [7, 14], colors: ['#8d8fa8', '#e8d9c5'], drops: [{ id: 'colmillo', chance: 0.8 }, { id: 'cuero', chance: 0.55 }], height: 30, level: 2 },
  escarabajo: { name: 'Escarabajo Pétreo', kind: 'beetle', hp: 92, atk: 12, def: 4, speed: 38, radius: 19, aggro: 200, xp: 48, gold: [10, 18], colors: ['#9b7b4d', '#e0c08a'], drops: [{ id: 'caparazon', chance: 0.8 }, { id: 'hierro', chance: 0.3 }], height: 30, level: 3 },
  espectro: { name: 'Espectro de las Ruinas', kind: 'wraith', hp: 66, atk: 13, def: 1, speed: 58, radius: 16, aggro: 330, xp: 58, gold: [12, 22], colors: ['#8c7bd8', '#d8ccff'], drops: [{ id: 'esencia', chance: 0.75 }, { id: 'fragmento', chance: 0.06 }], height: 38, level: 4 },
  guardian: { name: 'Guardián Corrompido', kind: 'guardian', hp: 460, atk: 18, def: 6, speed: 50, radius: 26, aggro: 420, xp: 260, gold: [120, 180], colors: ['#6e3a55', '#ff9caf'], drops: [{ id: 'fragmento', chance: 1 }, { id: 'runa_aethel', chance: 1 }], height: 54, level: 8, boss: true },
  boss: { name: 'Avatar del Vacío', kind: 'boss', hp: 1180, atk: 26, def: 8, speed: 56, radius: 34, aggro: 600, xp: 1000, gold: [600, 800], colors: ['#4b2c78', '#ff8ab5'], drops: [{ id: 'fragmento', chance: 1 }], height: 70, level: 12, boss: true },
};

/* -------------------------------------------------------------------------- */
/* Skills                                                                     */
/* -------------------------------------------------------------------------- */
export const SKILLS = {
  corte: { name: 'Corte Celestial', glyph: '✦', cost: 12, unlock: 1, points: 0, desc: 'Un arco de luz corta a todos los enemigos cercanos. 220% de daño.', cooldown: 2.4, kind: 'slash' },
  barrera: { name: 'Barrera de Lumen', glyph: '◇', cost: 18, unlock: 3, points: 1, desc: 'Un escudo de luz absorbe daño durante 5 segundos.', cooldown: 9, kind: 'shield' },
  curacion: { name: 'Aliento Vital', glyph: '❋', cost: 22, unlock: 4, points: 1, desc: 'Restaura un 35% de la vida máxima.', cooldown: 12, kind: 'heal' },
  meteoro: { name: 'Lluvia Estelar', glyph: '☄', cost: 30, unlock: 6, points: 2, desc: 'Invoca tres meteoros sobre la zona. 180% de daño por impacto.', cooldown: 10, kind: 'meteor' },
  furia: { name: 'Furia del Alba', glyph: '✹', cost: 28, unlock: 8, points: 2, desc: 'Aumenta ataque y velocidad un 35% durante 8 segundos.', cooldown: 16, kind: 'buff' },
  paso: { name: 'Paso Fantasma', glyph: '➶', cost: 14, unlock: 10, points: 2, desc: 'Esquiva instantánea sin coste de resistencia y regenera maná.', cooldown: 7, kind: 'ghost' },
};

/* -------------------------------------------------------------------------- */
/* Crafting                                                                   */
/* -------------------------------------------------------------------------- */
export const RECIPES = [
  { id: 'r_potion_mayor', out: 'potion_mayor', qty: 1, mats: { potion_menor: 2, hierba: 1, gelatina: 1 } },
  { id: 'r_ether', out: 'ether', qty: 2, mats: { esencia: 1, hierba: 1 } },
  { id: 'r_sello', out: 'cristal_sello', qty: 2, mats: { gelatina: 2, esencia: 1 } },
  { id: 'r_sello_mayor', out: 'cristal_sello_mayor', qty: 1, mats: { cristal_sello: 2, fragmento: 1 } },
  { id: 'r_mandoble', out: 'mandoble_alba', qty: 1, mats: { hierro: 3, cuero: 2, cristal_fuego: 1 } },
  { id: 'r_daga', out: 'daga_sombria', qty: 1, mats: { hierro: 2, esencia: 2, colmillo: 1 } },
  { id: 'r_lanza', out: 'lanza_viento', qty: 1, mats: { hierro: 3, pluma: 3, cristal_fuego: 1 } },
  { id: 'r_arco', out: 'arco_lunar', qty: 1, mats: { hierro: 2, cuero: 3, pluma: 2 } },
  { id: 'r_baston', out: 'baston_estrellas', qty: 1, mats: { hierro: 2, esencia: 2, fragmento: 1 } },
  { id: 'r_cota', out: 'cota_malla', qty: 1, mats: { hierro: 4, cuero: 2 } },
  { id: 'r_manto', out: 'manto_estelar', qty: 1, mats: { esencia: 2, pluma: 2, fragmento: 1 } },
  { id: 'r_armadura', out: 'armadura_celestial', qty: 1, mats: { fragmento: 2, hierro: 5, cristal_fuego: 1 } },
  { id: 'r_escudo_celestial', out: 'escudo_celestial', qty: 1, mats: { fragmento: 2, hierro: 4, esencia: 2 } },
  { id: 'r_collar', out: 'collar_brasa', qty: 1, mats: { cristal_fuego: 1, colmillo: 1 } },
  { id: 'r_colgante', out: 'colgante_marea', qty: 1, mats: { esencia: 1, gelatina: 2 } },
  { id: 'r_pluma', out: 'pluma_zephyr', qty: 1, mats: { pluma: 2, hierro: 1 } },
  { id: 'r_elixir', out: 'elixir', qty: 1, mats: { potion_mayor: 2, esencia: 1, hierba: 1 } },
  { id: 'r_espada_celestial', out: 'espada_celestial', qty: 1, mats: { fragmento: 3, cristal_fuego: 2, runa_aethel: 1 } },
];

/* -------------------------------------------------------------------------- */
/* Quests                                                                     */
/* -------------------------------------------------------------------------- */
export const QUESTS = {
  q1: {
    id: 'q1', title: 'El despertar', type: 'main', giver: 'Elara',
    desc: 'La Espada Celestial se ha roto y el vacío despierta. La Anciana Elara tiene respuestas.',
    stages: [
      { text: 'Habla con la Anciana Elara en la plaza de Lumen.', count: 1 },
      { text: 'Derrota 3 gelatinas silvestres en el Bosque de los Susurros.', count: 3 },
      { text: 'Regresa con la Anciana Elara.', count: 1 },
    ],
    reward: { gold: 120, xp: 150, items: { potion_mayor: 2, cristal_sello: 2 } },
  },
  q2: {
    id: 'q2', title: 'Ruinas dormidas', type: 'main', giver: 'Elara',
    desc: 'Dos runas duermen en las Ruinas de Aethel. Despiértalas y recupera la Runa de Aethel.',
    stages: [
      { text: 'Activa las 2 runas de las Ruinas de Aethel.', count: 2 },
      { text: 'Derrota al Guardián Corrompido.', count: 1 },
      { text: 'Lleva la Runa de Aethel ante Elara.', count: 1 },
    ],
    reward: { gold: 260, xp: 420, items: { fragmento: 1, potion_mayor: 2 } },
  },
  q3: {
    id: 'q3', title: 'La Espada Celestial', type: 'main', giver: 'Elara',
    desc: 'Tres runas, un templo, una última espada. El vacío aguarda en la cima.',
    stages: [
      { text: 'Reúne las 3 Runas: Bosque, Aethel y Ceniza.', count: 3 },
      { text: 'Abre el Templo Celestial y derrota al Avatar del Vacío.', count: 1 },
    ],
    reward: { gold: 1000, xp: 1500, items: { fragmento: 2 } },
  },
  sq_herbs: {
    id: 'sq_herbs', title: 'Hierbas para Lía', type: 'side', giver: 'Lía',
    desc: 'Lía necesita 3 Hierbas Lunares para preparar sus remedios.',
    stages: [{ text: 'Reúne 3 Hierbas Lunares y entrégaselas a Lía.', count: 3 }],
    reward: { gold: 90, xp: 80, items: { potion_mayor: 1, ether: 1 } },
  },
  sq_wolves: {
    id: 'sq_wolves', title: 'Colmillos de ceniza', type: 'side', giver: 'Roderic',
    desc: 'Los lobos de ceniza acosan a los viajeros del cañón. Roderic quiere cinco colmillos.',
    stages: [{ text: 'Derrota 5 Lobos de Ceniza.', count: 5 }],
    reward: { gold: 200, xp: 180, items: { hierro: 2, cuero: 2 } },
  },
  sq_capture: {
    id: 'sq_capture', title: 'El coleccionista', type: 'side', giver: 'Nilo',
    desc: 'Nilo sueña con ver criaturas de todos los elementos. Captura tres para su álbum.',
    stages: [{ text: 'Captura 3 criaturas distintas.', count: 3 }],
    reward: { gold: 150, xp: 120, items: { cristal_sello_mayor: 2 } },
  },
  sq_secret: {
    id: 'sq_secret', title: 'El secreto del bosque', type: 'side', giver: 'Nilo',
    desc: 'Se dice que un cofre antiguo duerme bajo las raíces del bosque. Solo algo de sombra puede verlo.',
    stages: [{ text: 'Encuentra el cofre oculto del Bosque de los Susurros.', count: 1 }],
    reward: { gold: 220, xp: 160, items: { amuleto_zorro: 1 } },
  },
};

/* -------------------------------------------------------------------------- */
/* Zones                                                                      */
/* -------------------------------------------------------------------------- */
export const ZONES = {
  aldea: { name: 'Aldea de Lumen', subtitle: 'Hogar de los últimos portadores', level: 1, map: 'aldea', music: 'town', dark: 0.0, weather: 'leaves', safe: true, palette: ['#4c7c4f', '#7fae63'] },
  bosque: { name: 'Bosque de los Susurros', subtitle: 'Donde la luz aprende a esconderse', level: 2, map: 'bosque', music: 'forest', dark: 0.12, weather: 'fireflies', palette: ['#2d5a3e', '#5c8c5c'] },
  ruinas: { name: 'Ruinas de Aethel', subtitle: 'Ecos de una ciudad que tocó el cielo', level: 4, map: 'ruinas', music: 'ruins', dark: 0.38, weather: 'dust', palette: ['#3c4158', '#747a94'] },
  canon: { name: 'Cañón de Ceniza', subtitle: 'El fuego que nunca duerme', level: 5, map: 'canon', music: 'canyon', dark: 0.16, weather: 'embers', palette: ['#5b3b32', '#a56445'] },
  templo: { name: 'Templo Celestial', subtitle: 'La última puerta antes del vacío', level: 8, map: 'templo', music: 'temple', dark: 0.3, weather: 'stars', palette: ['#2c3155', '#7e7ab8'] },
};

export const ZONE_ORDER = ['aldea', 'bosque', 'ruinas', 'canon', 'templo'];

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */
export const item = id => ITEMS[id] || null;
export const creature = id => CREATURES[id] || null;

export function xpForLevel(level) {
  return Math.round(72 * Math.pow(level, 1.42) + level * 34);
}

export function creatureXpForLevel(level) {
  return Math.round(50 * Math.pow(level, 1.35) + level * 22);
}

export function newPlayerStats() {
  return { hp: 100, mp: 45, stamina: 100, str: 5, def: 3, spd: 5, int: 4, luck: 3 };
}

export function defaultAppearance() {
  return { hair: 'corto', hairColor: 'nieve', skin: 'clara', outfit: 'azul', eyes: 'ambar' };
}

export function newCreature(id, level = 3) {
  const def = CREATURES[id];
  const maxHp = Math.round(def.base.hp + level * 6.5);
  return {
    id, level, xp: 0, xpNext: creatureXpForLevel(level),
    hp: maxHp, maxHp, bond: 20, charm: null, evolved: false,
    nickname: null,
  };
}
