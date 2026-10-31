// ─────────────────────────────────────────────────────────────
// LA ESPADA CELESTIAL — contenido del mundo
// Todo el arte es procedural. Todo el texto es original.
// ─────────────────────────────────────────────────────────────

export const TILE = 64;

export const STATS = {
  vitalidad: { name: 'Vitalidad', short: 'VIT', desc: 'Aumenta la vida máxima.' },
  mana: { name: 'Maná', short: 'MAN', desc: 'Aumenta el maná máximo y su regeneración.' },
  aguante: { name: 'Aguante', short: 'AGU', desc: 'Aumenta el aguante y la resistencia al bloqueo.' },
  fuerza: { name: 'Fuerza', short: 'FUE', desc: 'Aumenta el daño de armas y habilidades físicas.' },
  defensa: { name: 'Defensa', short: 'DEF', desc: 'Reduce el daño recibido.' },
  velocidad: { name: 'Velocidad', short: 'VEL', desc: 'Aumenta el movimiento, la cadencia y la esquiva.' },
  inteligencia: { name: 'Inteligencia', short: 'INT', desc: 'Potencia las habilidades y los ecos.' },
  suerte: { name: 'Suerte', short: 'SUE', desc: 'Aumenta críticos, botín y vínculos.' }
};

export const CLASSES = {
  guardian: {
    name: 'Guardián del Alba',
    epithet: 'El juramento se blande como un escudo',
    desc: 'Un combatiente sereno. Convierte el aguante en una segunda vida y el contraataque en sentencia.',
    bonus: { vitalidad: 3, fuerza: 2, defensa: 2, aguante: 1 },
    startWeapon: 'filo_aprendiz', startArmor: 'cuero_brumavela',
    perk: 'Los bloqueos perfectos restauran 10 de aguante.',
    color: '#c9a05a'
  },
  vinculo: {
    name: 'Vínculo de Cristal',
    epithet: 'Escucha el latido de lo que no habla',
    desc: 'Un alma abierta a los ecos. Sus criaturas combaten más tiempo y su magia sana heridas antiguas.',
    bonus: { inteligencia: 3, mana: 3, suerte: 1, vitalidad: 1 },
    startWeapon: 'daga_velo', startArmor: 'tunica_viajero',
    perk: 'Los ecos invocados duran un 35% más y heredan parte de tu inteligencia.',
    color: '#79b4c9'
  },
  velo: {
    name: 'Danza del Velo',
    epithet: 'Entre dos latidos cabe una vida',
    desc: 'Una sombra que aprende rápido. Vive del crítico, la esquiva perfecta y la velocidad imposible.',
    bonus: { velocidad: 3, suerte: 3, aguante: 1, fuerza: 1 },
    startWeapon: 'hoja_gemela', startArmor: 'tunica_viajero',
    perk: 'Las esquivas perfectas garantizan un crítico durante 3 s.',
    color: '#b58fd0'
  }
};

export const APPEARANCE = {
  skins: [
    { id: 'porcelana', c: '#f2d3b8' }, { id: 'miel', c: '#e2b18c' },
    { id: 'ámbar', c: '#c98e63' }, { id: 'canela', c: '#a06a48' },
    { id: 'caoba', c: '#70442a' }, { id: 'ébano', c: '#4a2c1f' }
  ],
  hairs: [
    { id: 'negro', c: '#241d1a' }, { id: 'castaño', c: '#5c3b22' },
    { id: 'cobrizo', c: '#a8552b' }, { id: 'rubio', c: '#d8b56e' },
    { id: 'platino', c: '#e8e2d2' }, { id: 'granate', c: '#7d2833' },
    { id: 'índigo', c: '#2f3d63' }, { id: 'amatista', c: '#61457e' },
    { id: 'rosa', c: '#c96a9a' }, { id: 'escarcha', c: '#b9ced6' }
  ],
  outfits: [
    { id: 'océano', c: '#203f63' }, { id: 'musgo', c: '#39482f' },
    { id: 'vino', c: '#5c2d3a' }, { id: 'ametista', c: '#44345c' },
    { id: 'abismo', c: '#253c40' }, { id: 'arena', c: '#6a5230' }
  ],
  capes: [
    { id: 'sangre', c: '#792232' }, { id: 'marea', c: '#1f486f' },
    { id: 'bosque', c: '#2c5338' }, { id: 'crepúsculo', c: '#4a3166' },
    { id: 'sol', c: '#8a6a2e' }, { id: 'noche', c: '#202a3a' }
  ],
  faces: ['serena', 'decidida', 'curiosa', 'marcada'],
  hairStyles: ['corto', 'largo', 'trenza', 'rapado', 'mechones']
};

export const REGIONS = {
  valdoria: {
    id: 'valdoria', name: 'VALDORIA', subtitle: 'La tierra que aún recuerda la luz',
    level: '1 – 6', music: 'valdoria', weather: 'leaves',
    width: 112, height: 86, seed: 1701,
    ambient: '#d9b96f', fog: 'rgba(226,190,116,0.10)',
    palette: {
      grass1: '#2f4a33', grass2: '#37553a', grass3: '#405f3e', grass4: '#283f2c',
      path: '#7a6447', path2: '#8b7350', water: '#274a58', water2: '#336377', foam: '#9dc5c4',
      cliff: '#3b3a33', cliff2: '#4d4a3f', dark: '#1c2c24', bloom: '#d8c063', stone: '#8a806d'
    },
    pois: [
      { id: 'plaza', name: 'Brumavela', x: 18, y: 62, type: 'village', icon: 'village', safe: 9, map: true },
      { id: 'forge', name: 'Fragua de Bram', x: 10, y: 69, type: 'village', icon: 'forge', safe: 4 },
      { id: 'shop', name: 'Bazar de Aldric', x: 25, y: 69, type: 'village', icon: 'shop', safe: 4 },
      { id: 'mill', name: 'Molino de Musgo', x: 39, y: 43, type: 'ruin', icon: 'mill', safe: 4, map: true },
      { id: 'ruins', name: 'Ruinas de Ael', x: 67, y: 31, type: 'ruin', icon: 'ruin', safe: 6, map: true },
      { id: 'shrine', name: 'Santuario de la Luna', x: 84, y: 65, type: 'shrine', icon: 'shrine', safe: 5, map: true },
      { id: 'arena', name: 'Claro del Ciervo', x: 93, y: 22, type: 'boss', icon: 'boss', safe: 10, map: true },
      { id: 'portal', name: 'Puerta de Ceniza', x: 103, y: 11, type: 'portal', icon: 'portal', safe: 5, map: true },
      { id: 'camp', name: 'Campamento de Nara', x: 52, y: 72, type: 'camp', icon: 'camp', safe: 4 },
      { id: 'orchard', name: 'Huerto de las Viudas', x: 9, y: 45, type: 'grove', icon: 'grove', safe: 3 }
    ],
    roads: [['plaza', 'mill'], ['mill', 'ruins'], ['ruins', 'arena'], ['plaza', 'shrine'], ['shrine', 'arena'], ['arena', 'portal'], ['plaza', 'camp'], ['mill', 'orchard'], ['plaza', 'forge'], ['plaza', 'shop']],
    lakes: [{ x: 26, y: 23, rx: 9, ry: 6 }, { x: 58, y: 56, rx: 5, ry: 9 }, { x: 77, y: 47, rx: 4, ry: 3 }],
    enemyZones: [
      { poi: 'mill', types: ['lobo_sombra', 'lobo_sombra', 'espectro'], count: 5, radius: 7 },
      { poi: 'ruins', types: ['bandido', 'espectro', 'jabali'], count: 6, radius: 8 },
      { poi: 'shrine', types: ['espectro', 'lobo_sombra', 'bandido'], count: 5, radius: 7 },
      { poi: 'orchard', types: ['jabali', 'lobo_sombra'], count: 4, radius: 6 },
      { poi: 'camp', types: ['lobo_sombra'], count: 3, radius: 6 }
    ],
    creatureZones: [
      { poi: 'mill', species: ['lumi', 'zarzal'], count: 2 },
      { poi: 'orchard', species: ['grifo'], count: 1 },
      { poi: 'shrine', species: ['lumi'], count: 1 },
      { poi: 'camp', species: ['zarzal'], count: 1 }
    ]
  },
  drakmor: {
    id: 'drakmor', name: 'DRAKMOR', subtitle: 'Donde el cielo aprendió a arder',
    level: '6 – 12', music: 'drakmor', weather: 'ash',
    width: 104, height: 84, seed: 2407,
    ambient: '#e08050', fog: 'rgba(160,60,30,0.13)',
    palette: {
      grass1: '#3a2c27', grass2: '#46312a', grass3: '#52362b', grass4: '#2b221f',
      path: '#5c4740', path2: '#6d554a', water: '#9a3a1e', water2: '#d4612a', foam: '#ffb45e',
      cliff: '#2e2624', cliff2: '#41302b', dark: '#1d1716', bloom: '#e8894a', stone: '#6b5b51'
    },
    pois: [
      { id: 'camp', name: 'Última Brasa', x: 14, y: 69, type: 'camp', icon: 'camp', safe: 8, map: true },
      { id: 'bridge', name: 'Puente de Costillas', x: 31, y: 57, type: 'ruin', icon: 'bridge', safe: 4, map: true },
      { id: 'fortress', name: 'Fortaleza Calcinada', x: 48, y: 43, type: 'ruin', icon: 'fortress', safe: 6, map: true },
      { id: 'grove', name: 'Bosque de Ceniza', x: 71, y: 65, type: 'grove', icon: 'grove', safe: 5, map: true },
      { id: 'forge', name: 'Forja del Corazón', x: 83, y: 29, type: 'boss', icon: 'boss', safe: 10, map: true },
      { id: 'portal', name: 'Cicatriz del Velo', x: 94, y: 11, type: 'portal', icon: 'portal', safe: 5, map: true },
      { id: 'watch', name: 'Torre Vigía', x: 64, y: 25, type: 'shrine', icon: 'shrine', safe: 4 },
      { id: 'grave', name: 'Jardín de Reyes', x: 35, y: 76, type: 'ruin', icon: 'ruin', safe: 4 }
    ],
    roads: [['camp', 'bridge'], ['bridge', 'fortress'], ['fortress', 'grove'], ['grove', 'forge'], ['forge', 'portal'], ['fortress', 'watch'], ['bridge', 'grave']],
    lakes: [{ x: 56, y: 57, rx: 8, ry: 5 }, { x: 20, y: 32, rx: 6, ry: 8 }, { x: 88, y: 55, rx: 5, ry: 6 }],
    enemyZones: [
      { poi: 'bridge', types: ['imp', 'sabueso_magma'], count: 5, radius: 7 },
      { poi: 'fortress', types: ['caballero_ceniza', 'cultista', 'imp'], count: 6, radius: 8 },
      { poi: 'grove', types: ['sabueso_magma', 'cultista', 'caballero_ceniza'], count: 6, radius: 8 },
      { poi: 'watch', types: ['imp', 'sabueso_magma'], count: 5, radius: 7 },
      { poi: 'grave', types: ['cultista'], count: 4, radius: 7 }
    ],
    creatureZones: [
      { poi: 'camp', species: ['ascua'], count: 1 },
      { poi: 'grove', species: ['cuervo_humo', 'testudo_magma'], count: 2 },
      { poi: 'watch', species: ['ascua'], count: 1 },
      { poi: 'grave', species: ['cuervo_humo'], count: 1 }
    ]
  },
  kansordore: {
    id: 'kansordore', name: 'KANSORDORE', subtitle: 'El archivo de todo lo que pudo ser',
    level: '12 – 20', music: 'kansordore', weather: 'motes',
    width: 96, height: 82, seed: 3313,
    ambient: '#9ac6d8', fog: 'rgba(120,170,190,0.12)',
    palette: {
      grass1: '#263a45', grass2: '#2d4552', grass3: '#355162', grass4: '#202f39',
      path: '#8b8fa0', path2: '#a3a7b7', water: '#173c55', water2: '#2d6685', foam: '#bde7f0',
      cliff: '#27313d', cliff2: '#3a4757', dark: '#17212b', bloom: '#b9d6de', stone: '#b6b8c6'
    },
    pois: [
      { id: 'atrio', name: 'Atrio de Cristal', x: 17, y: 68, type: 'shrine', icon: 'shrine', safe: 7, map: true },
      { id: 'bridges', name: 'Puentes Suspendidos', x: 34, y: 54, type: 'ruin', icon: 'bridge', safe: 4, map: true },
      { id: 'library', name: 'Biblioteca Prohibida', x: 50, y: 39, type: 'ruin', icon: 'library', safe: 6, map: true },
      { id: 'temple', name: 'Templo de la Ascensión', x: 69, y: 60, type: 'shrine', icon: 'temple', safe: 6, map: true },
      { id: 'rift', name: 'Falla del Velo', x: 85, y: 23, type: 'boss', icon: 'boss', safe: 10, map: true },
      { id: 'observatory', name: 'Observatorio Roto', x: 72, y: 34, type: 'camp', icon: 'camp', safe: 4, map: true },
      { id: 'garden', name: 'Jardín de Nombres', x: 30, y: 76, type: 'grove', icon: 'grove', safe: 4 }
    ],
    roads: [['atrio', 'bridges'], ['bridges', 'library'], ['library', 'temple'], ['temple', 'rift'], ['library', 'observatory'], ['observatory', 'rift'], ['atrio', 'garden']],
    lakes: [{ x: 14, y: 42, rx: 7, ry: 5 }, { x: 44, y: 66, rx: 9, ry: 4 }, { x: 82, y: 55, rx: 6, ry: 8 }],
    enemyZones: [
      { poi: 'bridges', types: ['centinela', 'serafin'], count: 5, radius: 7 },
      { poi: 'library', types: ['devorador', 'centinela'], count: 6, radius: 8 },
      { poi: 'temple', types: ['serafin', 'centinela', 'devorador'], count: 6, radius: 8 },
      { poi: 'observatory', types: ['serafin'], count: 4, radius: 6 },
      { poi: 'garden', types: ['devorador'], count: 4, radius: 6 }
    ],
    creatureZones: [
      { poi: 'garden', species: ['polilla_oraculo'], count: 1 },
      { poi: 'observatory', species: ['zorro_estelar'], count: 1 },
      { poi: 'bridges', species: ['guardian_cristal'], count: 1 },
      { poi: 'atrio', species: ['polilla_oraculo'], count: 1 }
    ]
  }
};

export const ELEMENTS = {
  fisico: { name: 'Físico', color: '#e0d6c2', icon: '✦' },
  fuego: { name: 'Fuego', color: '#ef7448', icon: '🜂' },
  hielo: { name: 'Hielo', color: '#8ed4e8', icon: '❄' },
  naturaleza: { name: 'Naturaleza', color: '#8fc77a', icon: '❧' },
  celestial: { name: 'Celestial', color: '#f2d98e', icon: '✧' },
  sombra: { name: 'Sombra', color: '#a382c4', icon: '◑' },
  cristal: { name: 'Cristal', color: '#9fc8dd', icon: '◇' },
  astral: { name: 'Astral', color: '#b7a6f2', icon: '✶' }
};

export const ENEMIES = {
  lobo_sombra: {
    id: 'lobo_sombra', name: 'Lobo de Sombra', family: 'bestia', level: 2,
    hp: 52, dmg: 9, speed: 128, radius: 18, xp: 24, shards: 4, element: 'sombra',
    kind: 'quadruped', color: '#3b3a4a', accent: '#8d7fb0', aggro: 280, range: 46, cooldown: 1.25,
    behavior: 'lunge', barks: ['Un aullido atraviesa la maleza.', 'La sombra se agazapa.']
  },
  bandido: {
    id: 'bandido', name: 'Bandido de la Ciénaga', family: 'humano', level: 3,
    hp: 78, dmg: 11, speed: 105, radius: 18, xp: 32, shards: 9, element: 'fisico',
    kind: 'humanoid', color: '#4b3b34', accent: '#a1785a', aggro: 300, range: 58, cooldown: 1.5,
    behavior: 'melee', barks: ['«Este camino tiene peaje.»', '«La Gema no es para ti.»']
  },
  espectro: {
    id: 'espectro', name: 'Espectro de Ael', family: 'espíritu', level: 3,
    hp: 44, dmg: 12, speed: 82, radius: 16, xp: 30, shards: 6, element: 'sombra',
    kind: 'spirit', color: '#6c7d9e', accent: '#c0e3ee', aggro: 340, range: 230, cooldown: 2.2,
    behavior: 'ranged', projectile: 'orb', barks: ['El aire huele a lluvia vieja.']
  },
  jabali: {
    id: 'jabali', name: 'Jabalí Corrupto', family: 'bestia', level: 4,
    hp: 110, dmg: 15, speed: 95, radius: 22, xp: 42, shards: 8, element: 'naturaleza',
    kind: 'quadruped', color: '#4a3a2e', accent: '#8fb06a', aggro: 250, range: 52, cooldown: 1.8,
    behavior: 'charge', barks: ['La tierra tiembla bajo sus pezuñas.']
  },
  boss_ciervo: {
    id: 'boss_ciervo', name: 'El Ciervo de Ceniza', epithet: 'GUARDIÁN DE LA GEMA',
    family: 'espíritu', level: 6, hp: 680, dmg: 17, speed: 112, radius: 34, xp: 280, shards: 90,
    element: 'sombra', kind: 'stag', color: '#2c303c', accent: '#d0a85f', aggro: 520, range: 95, cooldown: 1.7,
    behavior: 'boss', boss: true, phases: 2,
    barks: ['«No estás despierto. Solo estás de pie.»']
  },
  imp: {
    id: 'imp', name: 'Diablillo de Brasa', family: 'demonio', level: 7,
    hp: 88, dmg: 14, speed: 140, radius: 15, xp: 52, shards: 9, element: 'fuego',
    kind: 'imp', color: '#6e2c22', accent: '#f19a45', aggro: 310, range: 48, cooldown: 1.3,
    behavior: 'lunge', barks: ['Una risa de chispas.']
  },
  caballero_ceniza: {
    id: 'caballero_ceniza', name: 'Caballero de Ceniza', family: 'no-muerto', level: 8,
    hp: 165, dmg: 19, speed: 82, radius: 22, xp: 72, shards: 15, element: 'fisico',
    kind: 'armored', color: '#3a3430', accent: '#b06a45', aggro: 280, range: 66, cooldown: 1.8,
    behavior: 'melee', barks: ['El metal recuerda a su dueño.']
  },
  sabueso_magma: {
    id: 'sabueso_magma', name: 'Sabueso de Magma', family: 'bestia', level: 8,
    hp: 120, dmg: 17, speed: 148, radius: 19, xp: 64, shards: 12, element: 'fuego',
    kind: 'quadruped', color: '#52251d', accent: '#e56b32', aggro: 320, range: 50, cooldown: 1.2,
    behavior: 'charge', barks: ['Deja un rastro de arena fundida.']
  },
  cultista: {
    id: 'cultista', name: 'Cultista del Velo', family: 'humano', level: 9,
    hp: 105, dmg: 20, speed: 88, radius: 18, xp: 70, shards: 14, element: 'sombra',
    kind: 'humanoid', color: '#332f47', accent: '#c58bdb', aggro: 360, range: 250, cooldown: 2.4,
    behavior: 'ranged', projectile: 'void', barks: ['«La Ruptura nos hará libres.»']
  },
  boss_brasa: {
    id: 'boss_brasa', name: 'El Señor de la Primera Brasa', epithet: 'REY DE LA FORJA ROTA',
    family: 'no-muerto', level: 12, hp: 1350, dmg: 25, speed: 100, radius: 38, xp: 620, shards: 180,
    element: 'fuego', kind: 'king', color: '#3f231d', accent: '#ff9a3c', aggro: 620, range: 105, cooldown: 1.6,
    behavior: 'boss', boss: true, phases: 2,
    barks: ['«La primera llama no se apaga. Se hereda.»']
  },
  centinela: {
    id: 'centinela', name: 'Centinela del Velo', family: 'constructo', level: 13,
    hp: 210, dmg: 21, speed: 76, radius: 24, xp: 110, shards: 20, element: 'cristal',
    kind: 'armored', color: '#48566a', accent: '#a7e3f0', aggro: 300, range: 70, cooldown: 1.9,
    behavior: 'melee', barks: ['El cristal vibra en una nota imposible.']
  },
  serafin: {
    id: 'serafin', name: 'Serafín Caído', family: 'celestial', level: 14,
    hp: 165, dmg: 23, speed: 105, radius: 20, xp: 120, shards: 24, element: 'celestial',
    kind: 'winged', color: '#908a74', accent: '#f4dfa0', aggro: 380, range: 240, cooldown: 2.1,
    behavior: 'ranged', projectile: 'light', barks: ['Un ala de luz se rompe contra el suelo.']
  },
  devorador: {
    id: 'devorador', name: 'Devorador de Nombres', family: 'sombra', level: 15,
    hp: 260, dmg: 26, speed: 94, radius: 27, xp: 145, shards: 28, element: 'sombra',
    kind: 'aberration', color: '#2b2538', accent: '#a77fd6', aggro: 340, range: 62, cooldown: 1.7,
    behavior: 'melee', barks: ['Pronuncia un nombre que casi recuerdas.']
  },
  kael: {
    id: 'kael', name: 'Kael, el Heredero', epithet: 'DUELO ENTRE HERMANOS DE JURA',
    family: 'humano', level: 13, hp: 780, dmg: 22, speed: 138, radius: 22, xp: 420, shards: 100,
    element: 'fisico', kind: 'humanoid', color: '#2e3a52', accent: '#d8b56e', aggro: 560, range: 82, cooldown: 1.1,
    behavior: 'duelist', boss: true, phases: 2, barks: ['«La profecía también me nombró, ¿lo sabías?»']
  },
  boss_voz: {
    id: 'boss_voz', name: 'La Voz del Velo', epithet: 'JUGADOR CERO',
    family: 'sombra', level: 20, hp: 2400, dmg: 31, speed: 118, radius: 36, xp: 1400, shards: 400,
    element: 'sombra', kind: 'veil', color: '#1d1e2c', accent: '#d7b3ff', aggro: 700, range: 110, cooldown: 1.5,
    behavior: 'boss', boss: true, phases: 3, final: true,
    barks: ['«Yo también desperté creyendo ser el héroe.»']
  }
};

export const CREATURES = {
  lumi: {
    id: 'lumi', name: 'Lumi', title: 'La chispa que no se apaga', family: 'Espíritu', region: 'valdoria',
    element: 'celestial', rarity: 'común', hp: 90, dmg: 11, speed: 120,
    draw: 'fox', color: '#f3d58a', accent: '#fff6d8', eye: '#4d7c8a', size: 1,
    ability: { name: 'Luz de Vínculo', type: 'heal', power: 26, cooldown: 11, desc: 'Sana un 26% de tu vida máxima y purga una herida.' },
    lore: 'Los lumi nacen donde alguien recuerda un nombre con cariño. Su cola guarda una chispa que nunca quema. Dicen que los primeros viajeros los confundían con estrellas bajas.'
  },
  zarzal: {
    id: 'zarzal', name: 'Zarzal', title: 'El jardinero obstinado', family: 'Bestia', region: 'valdoria',
    element: 'naturaleza', rarity: 'común', hp: 150, dmg: 13, speed: 88,
    draw: 'boar', color: '#4e6338', accent: '#a9c26f', eye: '#f0d77a', size: 1.15,
    ability: { name: 'Muro de Espinas', type: 'shield', power: 30, cooldown: 14, desc: 'Te otorga un escudo de 30 y espinas que devuelven daño durante 6 s.' },
    lore: 'Un zarzal no protege un jardín: protege la idea de que algo merece crecer. Son tercos, leales y terriblemente lentos para perdonar a quien pisa una flor.'
  },
  grifo: {
    id: 'grifo', name: 'Grifo de Musgo', title: 'Ala prestada del bosque', family: 'Alado', region: 'valdoria',
    element: 'naturaleza', rarity: 'raro', hp: 105, dmg: 17, speed: 158,
    draw: 'griffin', color: '#6b8152', accent: '#d6d2a0', eye: '#e8b552', size: 1.05,
    ability: { name: 'Picado de Musgo', type: 'dash', power: 42, cooldown: 9, desc: 'Se lanza con el héroe y golpea a los enemigos en línea.' },
    lore: 'Nunca aterrizan dos veces en el mismo árbol. Los cazadores dicen que un grifo de musgo puede oler una mentira antes de que se pronuncie.'
  },
  ascua: {
    id: 'ascua', name: 'Ascua', title: 'La salamandra que recuerda', family: 'Reptil', region: 'drakmor',
    element: 'fuego', rarity: 'común', hp: 120, dmg: 18, speed: 128,
    draw: 'salamander', color: '#8a3c24', accent: '#ffb35c', eye: '#fff0b0', size: .95,
    ability: { name: 'Brasa Compartida', type: 'burn', power: 55, cooldown: 10, desc: 'Prende a los enemigos cercanos durante 5 s.' },
    lore: 'Las ascuas se alimentan de recuerdos calientes: una hoguera, una primera victoria, una mano que no soltó la otra. Si les das frío, se apagan.'
  },
  cuervo_humo: {
    id: 'cuervo_humo', name: 'Cuervo de Humo', title: 'Mensajero de lo ausente', family: 'Alado', region: 'drakmor',
    element: 'sombra', rarity: 'raro', hp: 95, dmg: 20, speed: 150,
    draw: 'crow', color: '#3a3142', accent: '#b99bd6', eye: '#f2d06c', size: .95,
    ability: { name: 'Vuelo Ciego', type: 'ranged', power: 48, cooldown: 8, desc: 'Dispara tres plumas sombrías que atraviesan a los enemigos.' },
    lore: 'No traen cartas. Traen la certeza de que una carta existió. En Drakmor se les deja comer en la mesa: negarse se considera de mala suerte.'
  },
  testudo_magma: {
    id: 'testudo_magma', name: 'Testudo de Magma', title: 'La fortaleza que camina', family: 'Reptil', region: 'drakmor',
    element: 'fuego', rarity: 'raro', hp: 210, dmg: 15, speed: 66,
    draw: 'turtle', color: '#58382b', accent: '#e27b3e', eye: '#ffe2a0', size: 1.25,
    ability: { name: 'Caparazón Ígneo', type: 'shield', power: 44, cooldown: 16, desc: 'Escudo de 44 y explosión de fuego al romperse.' },
    lore: 'Su caparazón está hecho de capas de lava enfriada durante siglos. Cada estrato cuenta una erupción. La última capa aún está caliente.'
  },
  polilla_oraculo: {
    id: 'polilla_oraculo', name: 'Polilla Oráculo', title: 'La que leyó el último verso', family: 'Insecto', region: 'kansordore',
    element: 'astral', rarity: 'épico', hp: 115, dmg: 21, speed: 135,
    draw: 'moth', color: '#8b80aa', accent: '#d9c8ff', eye: '#fff1b8', size: 1,
    ability: { name: 'Polvo de Presagio', type: 'buff', power: 35, cooldown: 15, desc: 'Aumenta tu daño un 35% y ralentiza a los enemigos durante 6 s.' },
    lore: 'Sus alas contienen mapas de futuros que no ocurrieron. Al batirlas, el aire huele a tinta y a lluvia sobre piedra caliente.'
  },
  zorro_estelar: {
    id: 'zorro_estelar', name: 'Zorro Estelar', title: 'El que corre entre dos cielos', family: 'Espíritu', region: 'kansordore',
    element: 'astral', rarity: 'épico', hp: 130, dmg: 25, speed: 172,
    draw: 'fox', color: '#4a4f78', accent: '#c9b6ff', eye: '#9df0ef', size: 1.05,
    ability: { name: 'Zarpazo de Constelación', type: 'dash', power: 66, cooldown: 10, desc: 'Se teletransporta contigo y deja una estela de estrellas.' },
    lore: 'Los zorros estelares no viven en Kansordore: viven en el hueco entre Kansordore y su reflejo. A veces cruzan para robar constelaciones pequeñas.'
  },
  guardian_cristal: {
    id: 'guardian_cristal', name: 'Guardián de Cristal', title: 'El que guarda una puerta inexistente', family: 'Constructo', region: 'kansordore',
    element: 'cristal', rarity: 'legendario', hp: 240, dmg: 24, speed: 78,
    draw: 'golem', color: '#5b7284', accent: '#b9f0f5', eye: '#ffffff', size: 1.3,
    ability: { name: 'Sello de Cristal', type: 'shield', power: 55, cooldown: 18, desc: 'Escudo de 55 y congelación de enemigos cercanos durante 3 s.' },
    lore: 'Fue creado para custodiar la puerta del primer recuerdo. La puerta ya no existe. El guardián sigue aquí, porque nadie le dijo que podía marcharse.'
  }
};

export const ITEMS = {
  filo_aprendiz: { id: 'filo_aprendiz', name: 'Filo del Aprendiz', slot: 'weapon', type: 'weapon', rarity: 'común', glyph: '†', price: 0, stats: { fuerza: 1 }, atk: 2, desc: 'Una hoja sencilla, bien equilibrada. La primera que recuerda tu mano.' },
  daga_velo: { id: 'daga_velo', name: 'Daga del Velo', slot: 'weapon', type: 'weapon', rarity: 'raro', glyph: '⸸', price: 180, stats: { velocidad: 1, suerte: 1 }, atk: 1, crit: 3, desc: 'Ligera como una excusa. Corta la distancia antes que la carne.' },
  hoja_gemela: { id: 'hoja_gemela', name: 'Hoja Gemela', slot: 'weapon', type: 'weapon', rarity: 'raro', glyph: '⚔', price: 220, stats: { fuerza: 1, velocidad: 1 }, atk: 2, desc: 'Forjada de una sola pieza de acero que recuerda haber sido dos.' },
  espada_bruma: { id: 'espada_bruma', name: 'Espada de Bruma', slot: 'weapon', type: 'weapon', rarity: 'raro', glyph: '†', price: 420, stats: { fuerza: 2, defensa: 1 }, atk: 7, desc: 'El filo atrae la niebla de los caminos viejos. Brumavela la llamó suya sin pedir permiso.' },
  filo_ceniza: { id: 'filo_ceniza', name: 'Filo de Ceniza', slot: 'weapon', type: 'weapon', rarity: 'épico', glyph: '⚔', price: 0, stats: { fuerza: 3 }, atk: 12, element: 'fuego', desc: 'Recuperada de la Forja del Corazón. Calienta la empuñadura cuando hay peligro.' },
  espada_alba: { id: 'espada_alba', name: 'Espada del Alba', slot: 'weapon', type: 'weapon', rarity: 'legendario', glyph: '✧', price: 0, stats: { fuerza: 4, inteligencia: 2, suerte: 2 }, atk: 18, crit: 5, element: 'celestial', desc: 'La hoja que la Gema recuerda haber sido. No es la Espada Celestial: es su promesa.' },
  tunica_viajero: { id: 'tunica_viajero', name: 'Túnica de Viajero', slot: 'armor', type: 'armor', rarity: 'común', glyph: '◈', price: 0, stats: { defensa: 1 }, def: 1, desc: 'Lino tratado con cera de abeja. Huele a camino.' },
  cuero_brumavela: { id: 'cuero_brumavela', name: 'Cuero de Brumavela', slot: 'armor', type: 'armor', rarity: 'común', glyph: '◈', price: 150, stats: { defensa: 2, aguante: 1 }, def: 3, desc: 'Cuero curtido con corteza de roble lunar. Los arqueros de la aldea lo juran invulnerable al rocío.' },
  malla_guardia: { id: 'malla_guardia', name: 'Malla de la Guardia', slot: 'armor', type: 'armor', rarity: 'raro', glyph: '◈', price: 320, stats: { defensa: 3, vitalidad: 1 }, def: 5, desc: 'Cada anilla fue remachada por alguien que esperaba volver a casa.' },
  placas_ceniza: { id: 'placas_ceniza', name: 'Placas de Ceniza', slot: 'armor', type: 'armor', rarity: 'épico', glyph: '▣', price: 0, stats: { defensa: 5, vitalidad: 2 }, def: 9, desc: 'Armadura del Señor de la Brasa. Aún late despacio.' },
  manto_celestial: { id: 'manto_celestial', name: 'Manto Celestial', slot: 'armor', type: 'armor', rarity: 'legendario', glyph: '✧', price: 0, stats: { defensa: 6, inteligencia: 2, mana: 1 }, def: 11, desc: 'Tejido con hilo de constelación. No pesa; recuerda.' },
  capucha_viajero: { id: 'capucha_viajero', name: 'Capucha de Viajero', slot: 'helm', type: 'helm', rarity: 'común', glyph: '⌂', price: 80, stats: { defensa: 1 }, def: 1, desc: 'Protege de la lluvia y de las preguntas indiscretas.' },
  yelmo_guardia: { id: 'yelmo_guardia', name: 'Yelmo de la Guardia', slot: 'helm', type: 'helm', rarity: 'raro', glyph: '⌂', price: 250, stats: { defensa: 2, vitalidad: 1 }, def: 2, desc: 'La visera está abollada en el sitio exacto donde una vez hubo una sonrisa.' },
  corona_lunar: { id: 'corona_lunar', name: 'Corona Lunar', slot: 'helm', type: 'helm', rarity: 'épico', glyph: '♛', price: 0, stats: { inteligencia: 2, mana: 2, suerte: 1 }, def: 2, desc: 'Hallada en el Santuario de la Luna. Sus puntas señalan un cielo que ya no existe.' },
  capa_viajero: { id: 'capa_viajero', name: 'Capa de Viajero', slot: 'cape', type: 'cape', rarity: 'común', glyph: '⌇', price: 60, stats: { velocidad: 1 }, def: 0, desc: 'Liviana, remendada, tuya.' },
  manto_brasa: { id: 'manto_brasa', name: 'Manto de Brasa', slot: 'cape', type: 'cape', rarity: 'raro', glyph: '⌇', price: 300, stats: { defensa: 1, fuerza: 1 }, def: 2, desc: 'El borde nunca termina de arder. Se alimenta de tu prisa.' },
  velo_estelar: { id: 'velo_estelar', name: 'Velo Estelar', slot: 'cape', type: 'cape', rarity: 'legendario', glyph: '⌇', price: 0, stats: { velocidad: 2, suerte: 2, mana: 1 }, def: 3, desc: 'Una tela que contiene más noche de la que debería. Al caminar, deja un rastro de estrellas.' },
  amuleto_eco: { id: 'amuleto_eco', name: 'Amuleto de Eco', slot: 'relic', type: 'relic', rarity: 'raro', glyph: '◉', price: 280, stats: { suerte: 2, inteligencia: 1 }, desc: 'Un cristal que vibra cuando una criatura te recuerda.' },
  semilla_resonancia: { id: 'semilla_resonancia', name: 'Semilla de Resonancia', slot: 'relic', type: 'relic', rarity: 'épico', glyph: '❧', price: 0, stats: { inteligencia: 2, suerte: 2 }, desc: 'Late como un corazón pequeño. Los ecos te reconocen antes de verte.' },
  ojo_velo: { id: 'ojo_velo', name: 'Ojo del Velo', slot: 'relic', type: 'relic', rarity: 'legendario', glyph: '◉', price: 0, stats: { inteligencia: 3, suerte: 2, mana: 1 }, desc: 'Mira a través de ti y se alegra de lo que encuentra. O eso prefieres creer.' },
  vial_savia: { id: 'vial_savia', name: 'Vial de Savia', slot: 'consume', type: 'consume', rarity: 'común', glyph: '⚗', price: 35, stack: 9, heal: .45, desc: 'Restaura un 45% de la vida máxima. Sabe a corteza y a casa.' },
  esencia_azul: { id: 'esencia_azul', name: 'Esencia Azul', slot: 'consume', type: 'consume', rarity: 'común', glyph: '⚱', price: 40, stack: 9, mana: .55, desc: 'Restaura un 55% del maná máximo. Fría incluso en verano.' },
  tonico_aguante: { id: 'tonico_aguante', name: 'Tónico de Aguante', slot: 'consume', type: 'consume', rarity: 'común', glyph: '⚗', price: 30, stack: 9, stamina: 1, desc: 'Restaura todo el aguante. Un trago valiente antes de un salto cobarde.' },
  incienso: { id: 'incienso', name: 'Incienso de Resonancia', slot: 'consume', type: 'consume', rarity: 'raro', glyph: '❁', price: 90, stack: 5, captureBonus: .28, desc: 'Durante el próximo intento de vínculo, amplía la zona perfecta.' },
  bomba_solar: { id: 'bomba_solar', name: 'Bomba Solar', slot: 'consume', type: 'consume', rarity: 'raro', glyph: '☀', price: 70, stack: 5, bomb: 120, desc: 'Estalla en luz y daña a todos los enemigos cercanos.' },
  pan_viaje: { id: 'pan_viaje', name: 'Pan de Viaje', slot: 'consume', type: 'consume', rarity: 'común', glyph: '◒', price: 15, stack: 9, heal: .18, stamina: .5, desc: 'Duro como una promesa. Reconforta más de lo que debería.' },
  esquirla_hierro: { id: 'esquirla_hierro', name: 'Esquirla de Hierro', slot: 'material', type: 'material', rarity: 'común', glyph: '◆', price: 18, stack: 99, desc: 'Metal de las ruinas. La fragua de Bram lo compra sin preguntar.' },
  ceniza_viva: { id: 'ceniza_viva', name: 'Ceniza Viva', slot: 'material', type: 'material', rarity: 'raro', glyph: '❖', price: 45, stack: 99, desc: 'Aún cálida. Susurra nombres de reyes olvidados.' },
  cristal_astral: { id: 'cristal_astral', name: 'Cristal Astral', slot: 'material', type: 'material', rarity: 'épico', glyph: '✧', price: 85, stack: 99, desc: 'Materia de un cielo que nunca llegó a formarse.' },
  esencia_eco: { id: 'esencia_eco', name: 'Esencia de Eco', slot: 'material', type: 'material', rarity: 'raro', glyph: '◉', price: 60, stack: 99, desc: 'Lo que queda de una criatura que confió en ti. Se usa para fortalecer vínculos.' },
  gema_celestial: { id: 'gema_celestial', name: 'Gema Celestial', slot: 'key', type: 'key', rarity: 'legendario', glyph: '✦', price: 0, desc: 'El corazón de la Espada Celestial. Está partida en tres latidos.' },
  lagrima_brasa: { id: 'lagrima_brasa', name: 'Lágrima de la Primera Brasa', slot: 'key', type: 'key', rarity: 'legendario', glyph: '◍', price: 0, desc: 'Una gota de fuego que no consume. La primera llama lloró una vez.' },
  jarra_origen: { id: 'jarra_origen', name: 'Jarra de Origen', slot: 'key', type: 'key', rarity: 'legendario', glyph: '♜', price: 0, desc: 'No contiene agua. Contiene el recuerdo de quien la llenó por primera vez.' }
};

export const SKILLS = {
  tajo_arcano: {
    id: 'tajo_arcano', branch: 'alba', name: 'Tajo Arcano', icon: '⚔', type: 'active', cost: 1, requires: null,
    mana: 10, cooldown: 4.5,
    desc: 'Proyecta un arco de luz que atraviesa enemigos. 140% de daño y marca durante 4 s.'
  },
  acero_eco: {
    id: 'acero_eco', branch: 'alba', name: 'Acero del Eco', icon: '✦', type: 'passive', cost: 1, requires: 'tajo_arcano',
    desc: 'Aumenta un 12% el daño de arma. Cada tercer golpe recupera 4 de maná.'
  },
  juicio: {
    id: 'juicio', branch: 'alba', name: 'Juicio Celestial', icon: '✧', type: 'active', cost: 2, requires: 'acero_eco',
    mana: 32, cooldown: 15,
    desc: 'Invoca una columna de luz. 320% de daño en área, derriba y ralentiza 3 s.'
  },
  vinculo: {
    id: 'vinculo', branch: 'vinculo', name: 'Vínculo Profundo', icon: '◉', type: 'passive', cost: 1, requires: null,
    desc: 'Los ecos hacen un 20% más de daño y su vínculo crece el doble.'
  },
  aliento: {
    id: 'aliento', branch: 'vinculo', name: 'Aliento del Eco', icon: '❧', type: 'active', cost: 1, requires: 'vinculo',
    mana: 20, cooldown: 18,
    desc: 'Sana un 30% de tu vida y un 45% de la de tu eco. Purga quemadura y veneno.'
  },
  pacto: {
    id: 'pacto', branch: 'vinculo', name: 'Pacto de Cristal', icon: '◇', type: 'passive', cost: 2, requires: 'aliento',
    desc: 'Al invocar, tu eco y tú compartís un escudo de 40. Los ecos capturados otorgan +1 suerte permanente.'
  },
  paso_velo: {
    id: 'paso_velo', branch: 'velo', name: 'Paso del Velo', icon: '⌁', type: 'active', cost: 1, requires: null,
    mana: 16, cooldown: 10,
    desc: 'Atraviesas el espacio y golpeas a todo lo que dejas atrás. Inmunidad breve; ralentiza el tiempo 1.5 s.'
  },
  contragolpe: {
    id: 'contragolpe', branch: 'velo', name: 'Contragolpe', icon: '↯', type: 'passive', cost: 1, requires: 'paso_velo',
    desc: 'Las esquivas perfectas y los bloqueos perfectos generan una onda de choque de 90 de daño.'
  },
  marca: {
    id: 'marca', branch: 'velo', name: 'Marca del Jugador Cero', icon: '◑', type: 'passive', cost: 2, requires: 'contragolpe',
    desc: 'Los enemigos marcados reciben un 25% más de daño. Los críticos extienden la marca.'
  }
};

export const LORE = {
  gema: { title: 'La Gema Celestial', text: 'No era el corazón de una espada, sino la espada entera doblada sobre un recuerdo. Cuando se partió, el mundo olvidó cómo sostenerse.' },
  jarra: { title: 'La Jarra de Origen', text: 'La primera vasija no se llenó de agua. Se llenó de la memoria de quien la sostuvo. Todo lo que existe bebe de ese olvido.' },
  lagrima: { title: 'La Lágrima de la Primera Brasa', text: 'La primera llama no nació del fuego, sino del primer adiós. Por eso arde sin consumir: se alimenta de lo que ya no está.' },
  profecia: { title: 'La Profecía de Jugador Cero', text: '«Cuando el Velo se canse, llamará a alguien que no pertenezca a ningún lado. Ese alguien elegirá si el mundo merece seguir siendo recordado.»' },
  convergencia: { title: 'La Convergencia Absoluta', text: 'Todos los caminos posibles existen a la vez. La Convergencia no los une: obliga a uno a mirar a los demás y decidir cuál es real.' },
  despertar: { title: 'El Despertar', text: 'Un eco no despierta: es despertado por una pregunta. La pregunta siempre es la misma. La respuesta, nunca.' },
  resonancia: { title: 'La Resonancia', text: 'Dos criaturas que se reconocen sin haberse visto antes. Los eruditos discuten si es magia; los niños saben que es memoria.' },
  velo: { title: 'El Velo', text: 'La membrana entre lo que fue y lo que podría haber sido. No es una pared. Es una decisión que aún no se ha tomado.' },
  ruptura: { title: 'La Ruptura', text: 'La herejía de quienes creen que un mundo roto merece descansar. Peligrosa porque, a veces, tienen razón.' },
  ascension: { title: 'La Ascensión', text: 'No es subir. Es aceptar que ya no puedes volver a ser lo que eras, y elegir qué forma toma esa pérdida.' },
  valdoria: { title: 'Valdoria', text: 'Tierra de aldeas y ruinas que se niegan a ser ruinas. Aquí la luz es dorada porque alguien decidió que debía serlo.' },
  drakmor: { title: 'Drakmor', text: 'Un reino que ardió tan despacio que nadie se dio cuenta de que estaba ardiendo. Sus reyes aún esperan en la forja.' },
  kansordore: { title: 'Kansordore', text: 'El archivo de todo lo que pudo ser. Sus bibliotecas no guardan libros: guardan versiones de ti que no llegaste a ser.' },
  ecos: { title: 'Los Ecos', text: 'Criaturas hechas de recuerdos que decidieron tener patas, alas o raíces. Cuando confían en alguien, comparten una parte de ese recuerdo.' }
};

export const SHOP_STOCK = {
  alchemy: ['vial_savia', 'esencia_azul', 'tonico_aguante', 'pan_viaje', 'incienso', 'bomba_solar'],
  forge: ['espada_bruma', 'malla_guardia', 'yelmo_guardia', 'amuleto_eco', 'capa_viajero', 'manto_brasa', 'daga_velo', 'hoja_gemela'],
  kansordore: ['espada_alba', 'manto_celestial', 'corona_lunar', 'velo_estelar', 'ojo_velo', 'semilla_resonancia']
};

export const DIFFICULTY = {
  viajero: { name: 'VIAJERO', desc: 'El relato por encima de todo. Daño recibido -25%.', dmgTaken: .75, dmgDealt: 1.1, capture: 1.15 },
  guardian: { name: 'GUARDIÁN', desc: 'La experiencia pretendida. Un mundo que responde.', dmgTaken: 1, dmgDealt: 1, capture: 1 },
  celestial: { name: 'CELESTIAL', desc: 'Para quienes no temen al Velo. Daño recibido +55%.', dmgTaken: 1.55, dmgDealt: .95, capture: .9 }
};

export const DEFAULT_APPEARANCE = {
  skin: 0, hair: 1, hairStyle: 1, outfit: 0, cape: 0, face: 1, eye: '#6c8f8b'
};
