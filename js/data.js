// LA ESPADA CELESTIAL — contenido del juego
// Todo el contenido es original y se dibuja de forma procedural en canvas.

export const GAME_TITLE = 'La Espada Celestial';
export const GAME_SUBTITLE = 'Crónicas de Lumen';

export const AFFINITIES = {
  luz:        { name: 'Luz',        color: '#ffe7a1', dark: '#8f6a21', glyph: '✦', ability: 'Iluminar',        desc: 'Disipa la oscuridad y revela lo oculto.' },
  fuego:      { name: 'Fuego',      color: '#ff8b5f', dark: '#8f2d1d', glyph: '▲', ability: 'Quemar',          desc: 'Consume obstáculos y derrite el hielo.' },
  agua:       { name: 'Agua',       color: '#67d9ff', dark: '#1d6485', glyph: '≈', ability: 'Nadar',           desc: 'Permite cruzar corrientes profundas.' },
  tierra:     { name: 'Tierra',     color: '#d3a46b', dark: '#6b4728', glyph: '◆', ability: 'Mover rocas',     desc: 'Desplaza moles pesadas y abre pasos.' },
  viento:     { name: 'Viento',     color: '#a9f1d6', dark: '#276b59', glyph: '≋', ability: 'Planear',         desc: 'Cruza abismos y activa mecanismos de aire.' },
  rayo:       { name: 'Rayo',       color: '#ffe26e', dark: '#8d6d12', glyph: 'ϟ', ability: 'Activar',         desc: 'Alimenta runas y dispositivos antiguos.' },
  hielo:      { name: 'Hielo',      color: '#bfeaff', dark: '#2e6f8e', glyph: '❄', ability: 'Congelar',        desc: 'Detiene mecanismos y enfría cristales.' },
  oscuridad:  { name: 'Oscuridad',  color: '#b990ff', dark: '#432376', glyph: '☾', ability: 'Detectar',        desc: 'Siente tesoros y muros secretos.' },
  naturaleza: { name: 'Naturaleza', color: '#9ce98a', dark: '#356b2d', glyph: '❧', ability: 'Florecer',        desc: 'Hace crecer puentes y plantas antiguas.' },
  celestial:  { name: 'Energía Celestial', color: '#fff1b8', dark: '#8a6817', glyph: '✧', ability: 'Sellar portales', desc: 'La afinidad de la Espada que rompió el cielo.' },
};

export const RARITIES = {
  comun:    { name: 'Común',    color: '#b7c3d8', glow: 'rgba(183,195,216,.35)' },
  raro:     { name: 'Raro',     color: '#6fd7ff', glow: 'rgba(111,215,255,.35)' },
  epico:    { name: 'Épico',    color: '#c08bff', glow: 'rgba(192,139,255,.35)' },
  legendario:{ name:'Legendario',color:'#ffd470', glow: 'rgba(255,212,112,.4)' },
};

export const CLASSES = {
  vanguardia: {
    id: 'vanguardia', name: 'Vanguardia del Alba', short: 'Vanguardia',
    role: 'Equilibrado · Espada y escudo',
    desc: 'Un combatiente sereno que convierte cada golpe en una promesa. Domina el ritmo del combate y protege a sus aliados.',
    weapon: 'espada_alba', offhand: 'escudo_roble', armor: 'tunica_viajero', accessory: 'amuleto_lumen',
    attrs: { vida: 12, mana: 6, res: 10, str: 9, def: 9, spd: 8, int: 5, luck: 6 },
    skill: 'tajo_celestial',
    hair: 'corto', hairColor: '#2a1b17', skin: '#e3a87e', outfit: '#2c6ea3', accent: '#f5c86f',
    quote: 'La luz no elige a los fuertes. Elige a los que se levantan.',
  },
  guardian: {
    id: 'guardian', name: 'Guardián de Ceniza', short: 'Guardián',
    role: 'Tanque · Mandoble',
    desc: 'Criado entre ruinas y tormentas. Su mandoble abre surcos en la tierra, y su voluntad resiste el embate de las sombras.',
    weapon: 'mandoble_ceniza', offhand: null, armor: 'cota_lumen', accessory: 'anillo_poder',
    attrs: { vida: 16, mana: 4, res: 12, str: 12, def: 11, spd: 6, int: 4, luck: 5 },
    skill: 'escudo_alba',
    hair: 'erizado', hairColor: '#a84e2c', skin: '#c98d65', outfit: '#5f2c26', accent: '#e8b45c',
    quote: 'No cargo una espada. Cargo a quienes ya no pueden alzarse.',
  },
  vidente: {
    id: 'vidente', name: 'Vidente de Astrales', short: 'Vidente',
    role: 'Magia · Bastón',
    desc: 'Lee el pulso de las estrellas en el agua. Su bastón teje luz, hielo y fuego con la precisión de un susurro.',
    weapon: 'baston_estelar', offhand: null, armor: 'manto_umbra', accessory: 'broche_mana',
    attrs: { vida: 9, mana: 14, res: 7, str: 5, def: 6, spd: 9, int: 13, luck: 8 },
    skill: 'bola_fuego',
    hair: 'largo', hairColor: '#e7d7ff', skin: '#f0c7a2', outfit: '#3b2b72', accent: '#9de7ff',
    quote: 'El cielo no está lejos. Solo hay que aprender a escucharlo.',
  },
};

export const ITEMS = {
  // — Armas —
  espada_alba: {
    name: 'Espada del Alba', type: 'weapon', subtype: 'sword', slot: 'weapon', rarity: 'raro', value: 180, icon: 'sword',
    color: '#d8efff', dmg: 14, speed: 1.05, reach: 72, arc: 1.55, combo: [1, 1.12, 1.42], knock: 130,
    desc: 'Forjada con un fragmento del primer amanecer. Corta la niebla como si fuese seda.',
  },
  filo_celeste: {
    name: 'Filo Celestial', type: 'weapon', subtype: 'sword', slot: 'weapon', rarity: 'legendario', value: 640, icon: 'sword',
    color: '#ffe49b', dmg: 23, speed: 1.18, reach: 82, arc: 1.7, combo: [1, 1.15, 1.55], knock: 180,
    desc: 'La hoja que sella el cielo. Vibra al compás de las estrellas.',
  },
  mandoble_ceniza: {
    name: 'Mandoble de Ceniza', type: 'weapon', subtype: 'greatsword', slot: 'weapon', rarity: 'raro', value: 210, icon: 'greatsword',
    color: '#ffb47e', dmg: 27, speed: 0.68, reach: 96, arc: 2.05, combo: [1, 1.18], knock: 270,
    desc: 'Pesado como un juramento. Su filo guarda el calor de un volcán dormido.',
  },
  daga_crepusculo: {
    name: 'Daga del Crepúsculo', type: 'weapon', subtype: 'dagger', slot: 'weapon', rarity: 'raro', value: 165, icon: 'dagger',
    color: '#c9a6ff', dmg: 9, speed: 1.75, reach: 50, arc: 1.05, combo: [1, 1.08, 1.16, 1.48], knock: 70,
    desc: 'Tan rápida que el aire tarda en darse cuenta. Prefiere la espalda y las sombras.',
  },
  lanza_aurora: {
    name: 'Lanza de Aurora', type: 'weapon', subtype: 'spear', slot: 'weapon', rarity: 'epico', value: 280, icon: 'spear',
    color: '#8ce7ff', dmg: 17, speed: 0.95, reach: 118, arc: 0.62, combo: [1, 1.1, 1.35], knock: 150,
    desc: 'Su punta atraviesa la mañana. Mantiene a las bestias a una distancia prudente.',
  },
  arco_zefiro: {
    name: 'Arco de Zéfiro', type: 'weapon', subtype: 'bow', slot: 'weapon', rarity: 'epico', value: 260, icon: 'bow',
    color: '#a8f0d0', dmg: 12, speed: 0.95, reach: 420, arc: 0.2, combo: [1, 1.1], knock: 45, ranged: 'arrow', projectileSpeed: 620,
    desc: 'Cada flecha es una ráfaga que recuerda el nombre del viento.',
  },
  baston_estelar: {
    name: 'Bastón Estelar', type: 'weapon', subtype: 'staff', slot: 'weapon', rarity: 'raro', value: 200, icon: 'staff',
    color: '#9de7ff', dmg: 11, speed: 0.82, reach: 380, arc: 0.2, combo: [1], knock: 40, magic: 'arcane', projectileSpeed: 430,
    desc: 'Una constelación atrapada en madera de luna. Convierte la voluntad en proyectiles.',
  },
  espada_umbra: {
    name: 'Espada de Umbra', type: 'weapon', subtype: 'sword', slot: 'weapon', rarity: 'epico', value: 330, icon: 'sword',
    color: '#b990ff', dmg: 20, speed: 1.0, reach: 78, arc: 1.5, combo: [1, 1.14, 1.5], knock: 150,
    desc: 'Recuperada del Guardián. La oscuridad que contiene obedece a quien no le teme.',
  },
  // — Escudos —
  escudo_roble: {
    name: 'Escudo de Roble', type: 'shield', slot: 'offhand', rarity: 'comun', value: 80, icon: 'shield',
    color: '#b48752', block: 0.45, def: 2, desc: 'Madera endurecida por generaciones de guardias rurales.',
  },
  escudo_celestial: {
    name: 'Escudo Celestial', type: 'shield', slot: 'offhand', rarity: 'legendario', value: 520, icon: 'shield',
    color: '#ffe49b', block: 0.68, def: 6, hp: 25, desc: 'Un fragmento de cielo que se niega a caer.',
  },
  // — Armaduras —
  tunica_viajero: {
    name: 'Túnica de Viajero', type: 'armor', slot: 'armor', rarity: 'comun', value: 100, icon: 'armor',
    color: '#2c6ea3', def: 3, hp: 8, spd: 1, desc: 'Ligera, gastada y llena de historias de caminos.',
  },
  cota_lumen: {
    name: 'Cota de Lumen', type: 'armor', slot: 'armor', rarity: 'raro', value: 250, icon: 'armor',
    color: '#547fa8', def: 7, hp: 22, res: 2, desc: 'Escamas plateadas que brillan cuando la luz las toca.',
  },
  manto_umbra: {
    name: 'Manto de Umbra', type: 'armor', slot: 'armor', rarity: 'epico', value: 290, icon: 'armor',
    color: '#4d347d', def: 4, hp: 12, mana: 16, int: 3, desc: 'Tejido con hilo de noche. Ahoga los pasos y agudiza la mente.',
  },
  armadura_celestial: {
    name: 'Armadura Celestial', type: 'armor', slot: 'armor', rarity: 'legendario', value: 700, icon: 'armor',
    color: '#d9bd6e', def: 12, hp: 45, res: 5, luck: 3, desc: 'Oro lunar y plumas de sol. La última herencia de los portadores.',
  },
  // — Accesorios —
  amuleto_lumen: {
    name: 'Amuleto de Lumen', type: 'accessory', slot: 'accessory', rarity: 'comun', value: 90, icon: 'amulet',
    color: '#ffe49b', mana: 8, luck: 1, desc: 'Una semilla de luz que late al ritmo de su portador.',
  },
  anillo_poder: {
    name: 'Anillo de Poder', type: 'accessory', slot: 'accessory', rarity: 'raro', value: 180, icon: 'ring',
    color: '#ff9a6e', str: 3, def: 1, desc: 'El metal recuerda cada golpe que ha detenido.',
  },
  broche_mana: {
    name: 'Broche de Maná', type: 'accessory', slot: 'accessory', rarity: 'raro', value: 170, icon: 'amulet',
    color: '#8ce7ff', mana: 16, int: 2, desc: 'Cristal de escarcha pulido hasta convertirse en una segunda respiración.',
  },
  colgante_suerte: {
    name: 'Colgante de la Suerte', type: 'accessory', slot: 'accessory', rarity: 'epico', value: 250, icon: 'amulet',
    color: '#c3ff9e', luck: 6, desc: 'Los dados siempre caen bien... o eso dice su anterior dueño.',
  },
  // — Consumibles —
  pocion_menor: {
    name: 'Poción de Lumen', type: 'consumable', rarity: 'comun', value: 25, icon: 'potion', color: '#ff7b8e',
    effect: { hp: 45 }, desc: 'Restaura 45 puntos de vida.',
  },
  pocion_mayor: {
    name: 'Poción Mayor', type: 'consumable', rarity: 'raro', value: 70, icon: 'potion', color: '#ff4d6d',
    effect: { hp: 130 }, desc: 'Restaura 130 puntos de vida.',
  },
  ether: {
    name: 'Éter Lunar', type: 'consumable', rarity: 'comun', value: 35, icon: 'potion', color: '#68d5ff',
    effect: { mp: 35 }, desc: 'Restaura 35 puntos de maná.',
  },
  elixir: {
    name: 'Elixir Celestial', type: 'consumable', rarity: 'legendario', value: 220, icon: 'potion', color: '#ffe49b',
    effect: { hp: 999, mp: 999 }, desc: 'Restaura toda la vida y el maná. Sabe a amanecer.',
  },
  sello_luz: {
    name: 'Sello de Luz', type: 'seal', rarity: 'comun', value: 30, icon: 'seal', color: '#ffe49b',
    capture: 1.0, desc: 'Un círculo de luz para invitar a una criatura a unirse.',
  },
  sello_maestro: {
    name: 'Sello Maestro', type: 'seal', rarity: 'epico', value: 120, icon: 'seal', color: '#c08bff',
    capture: 1.65, desc: 'Un sello antiguo que calma incluso a las criaturas más orgullosas.',
  },
  carne_asada: {
    name: 'Carne Asada', type: 'food', rarity: 'comun', value: 18, icon: 'food', color: '#d99a5c',
    effect: { creatureBond: 8 }, desc: 'Favorita de las criaturas. Aumenta el vínculo en 8.',
  },
  baya_lumen: {
    name: 'Baya de Lumen', type: 'food', rarity: 'comun', value: 12, icon: 'food', color: '#ffd36e',
    effect: { creatureXp: 30, creatureBond: 3 }, desc: 'Una baya dulce que fortalece a una criatura.',
  },
  // — Materiales —
  gelatina: { name: 'Esencia de Gelatina', type: 'material', rarity: 'comun', value: 8, icon: 'material', color: '#67d9ff', desc: 'Un tembloroso fragmento de vida silvestre.' },
  hierba_lunar: { name: 'Hierba Lunar', type: 'material', rarity: 'comun', value: 6, icon: 'herb', color: '#9ce98a', desc: 'Crece donde la noche toca el bosque.' },
  colmillo_ceniza: { name: 'Colmillo de Ceniza', type: 'material', rarity: 'comun', value: 14, icon: 'fang', color: '#d7c2ab', desc: 'Todavía tibio. Corta como un mal recuerdo.' },
  caparazon_petreo: { name: 'Caparazón Pétreo', type: 'material', rarity: 'raro', value: 18, icon: 'shell', color: '#b7a07e', desc: 'Placas de piedra viva que no se rompen con facilidad.' },
  polvo_espectral: { name: 'Polvo Espectral', type: 'material', rarity: 'raro', value: 22, icon: 'dust', color: '#b990ff', desc: 'Susurra nombres que ya nadie recuerda.' },
  pluma_zefiro: { name: 'Pluma de Zéfiro', type: 'material', rarity: 'raro', value: 20, icon: 'feather', color: '#a9f1d6', desc: 'Tan ligera que cae hacia arriba.' },
  cristal_escarcha: { name: 'Cristal de Escarcha', type: 'material', rarity: 'raro', value: 24, icon: 'crystal', color: '#bfeaff', desc: 'Guarda el invierno de una montaña entera.' },
  esencia_celestial: { name: 'Esencia Celestial', type: 'material', rarity: 'legendario', value: 80, icon: 'star', color: '#fff1b8', desc: 'Una chispa de la Espada. Cálida incluso en la oscuridad.' },
  corazon_guardian: { name: 'Corazón del Guardián', type: 'material', rarity: 'legendario', value: 300, icon: 'heart', color: '#b990ff', desc: 'Late débilmente. Contiene mil años de furia y deber.' },
  // — Amuletos de criatura —
  charm_brasa: { name: 'Cascabel de Brasa', type: 'charm', rarity: 'raro', value: 100, icon: 'charm', color: '#ff8b5f', atk: 4, desc: 'Equipable en una criatura. Aumenta su ataque en 4.' },
  charm_escarcha: { name: 'Nido de Escarcha', type: 'charm', rarity: 'raro', value: 100, icon: 'charm', color: '#bfeaff', def: 4, hp: 12, desc: 'Equipable en una criatura. Aumenta su defensa y vida.' },
  charm_lumen: { name: 'Pluma de Lumen', type: 'charm', rarity: 'epico', value: 150, icon: 'charm', color: '#ffe49b', atk: 3, spd: 3, desc: 'Equipable en una criatura. Aumenta ataque y velocidad.' },
  // — Objetos clave —
  mapa_antiguo: { name: 'Mapa Antiguo', type: 'key', rarity: 'raro', value: 0, icon: 'map', color: '#e9d6ab', desc: 'Marca senderos olvidados entre el bosque y las ruinas.' },
  llave_umbra: { name: 'Llave de Umbra', type: 'key', rarity: 'epico', value: 0, icon: 'key', color: '#d6b56b', desc: 'Abre la puerta interior de las ruinas. Todavía está fría.' },
};

export const SKILLS = {
  tajo_celestial: {
    name: 'Tajo Celestial', icon: 'slash', element: 'luz', cost: 12, cd: 3.2, level: 1, type: 'arc',
    power: 2.1, radius: 108, arc: 2.3, color: '#ffe49b', desc: 'Un arco de luz que corta a todos los enemigos cercanos.',
  },
  escudo_alba: {
    name: 'Bastión del Alba', icon: 'shield', element: 'luz', cost: 20, cd: 10, level: 1, type: 'guard',
    power: 0, duration: 5, color: '#ffe49b', desc: 'Un escudo de luz absorbe daño durante 5 segundos.',
  },
  bola_fuego: {
    name: 'Bola de Fuego', icon: 'fire', element: 'fuego', cost: 15, cd: 3.6, level: 1, type: 'projectile',
    power: 2.4, speed: 480, radius: 24, color: '#ff8b5f', desc: 'Lanza una esfera incandescente que explota al impactar.',
  },
  curacion: {
    name: 'Bendición de Lumen', icon: 'heal', element: 'luz', cost: 28, cd: 9, level: 3, type: 'heal',
    power: 0.38, color: '#a8ffb5', desc: 'Restaura un 38% de la vida máxima.',
  },
  nova_escarcha: {
    name: 'Nova de Escarcha', icon: 'ice', element: 'hielo', cost: 22, cd: 6.5, level: 4, type: 'nova',
    power: 1.5, radius: 165, color: '#bfeaff', slow: 2.2, desc: 'Una explosión de hielo daña y ralentiza a los enemigos.',
  },
  cadena_rayo: {
    name: 'Cadena de Rayo', icon: 'bolt', element: 'rayo', cost: 24, cd: 5.8, level: 5, type: 'chain',
    power: 2.0, radius: 210, color: '#ffe26e', desc: 'Un relámpago salta entre hasta cuatro enemigos.',
  },
  paso_viento: {
    name: 'Paso de Zéfiro', icon: 'wind', element: 'viento', cost: 14, cd: 4.2, level: 6, type: 'dash',
    power: 1.2, radius: 60, color: '#a9f1d6', desc: 'Un impulso veloz que atraviesa enemigos y deja una estela de viento.',
  },
  lanza_umbra: {
    name: 'Lanza de Umbra', icon: 'dark', element: 'oscuridad', cost: 20, cd: 5, level: 7, type: 'projectile',
    power: 3.0, speed: 560, radius: 18, pierce: true, color: '#b990ff', desc: 'Una lanza de sombra que perfora a todos los enemigos en línea.',
  },
  fruto_vida: {
    name: 'Fruto de Vida', icon: 'leaf', element: 'naturaleza', cost: 26, cd: 11, level: 8, type: 'regen',
    power: 0.12, duration: 6, color: '#9ce98a', desc: 'Regenera vida lentamente y purga la fatiga.',
  },
  juicio_celestial: {
    name: 'Juicio Celestial', icon: 'star', element: 'celestial', cost: 40, cd: 12, level: 10, type: 'nova',
    power: 3.8, radius: 230, color: '#fff1b8', slow: 1.2, desc: 'El cielo responde con una lluvia de estrellas. Daño masivo en área.',
  },
};

export const CREATURES = {
  lumito: {
    name: 'Lumito', affinity: 'luz', base: { hp: 34, atk: 9, def: 4, spd: 10 }, skill: 'destello',
    explore: { type: 'light', label: 'Iluminar la oscuridad' }, evolvesTo: 'lumistar', evolveLevel: 7,
    shape: 'orb', scale: 0.72, rarity: 'comun', lore: 'Una chispa que aprendió a tener nombre. Duerme dentro de las flores de luna.',
    colors: ['#fff3bd', '#ffcf62', '#fff9de'],
  },
  lumistar: {
    name: 'Lumistar', affinity: 'luz', base: { hp: 80, atk: 22, def: 13, spd: 18 }, skill: 'destello',
    explore: { type: 'light', label: 'Iluminar la oscuridad', strong: true }, evolvesTo: null, evolveLevel: 0,
    shape: 'star', scale: 0.95, rarity: 'raro', lore: 'Una constelación diminuta que guía a los perdidos hacia el alba.',
    colors: ['#fff8d6', '#ffd75e', '#fffef2'],
  },
  brasa: {
    name: 'Brasa', affinity: 'fuego', base: { hp: 38, atk: 12, def: 3, spd: 9 }, skill: 'chispa_ardiente',
    explore: { type: 'burn', label: 'Quemar espinas' }, evolvesTo: 'pirobrasa', evolveLevel: 7,
    shape: 'fox', scale: 0.7, rarity: 'comun', lore: 'Nació de una brasa que se negó a apagarse. Sus pasos dejan flores de ceniza.',
    colors: ['#ffb26b', '#ff6d3d', '#ffe1a8'],
  },
  pirobrasa: {
    name: 'Pirobrasa', affinity: 'fuego', base: { hp: 88, atk: 28, def: 10, spd: 16 }, skill: 'chispa_ardiente',
    explore: { type: 'burn', label: 'Quemar espinas', strong: true }, evolvesTo: null, evolveLevel: 0,
    shape: 'fox', scale: 1.05, rarity: 'raro', lore: 'Su melena es un pequeño verano. Los caminos se abren a su paso.',
    colors: ['#ff9b68', '#d94122', '#ffe0a1'],
  },
  nimbo: {
    name: 'Nimbo', affinity: 'agua', base: { hp: 42, atk: 8, def: 6, spd: 8 }, skill: 'burbuja',
    explore: { type: 'swim', label: 'Nadar contracorriente' }, evolvesTo: 'mareon', evolveLevel: 7,
    shape: 'orb', scale: 0.78, rarity: 'comun', lore: 'Una gota de lluvia que decidió quedarse a vivir en el río.',
    colors: ['#b5f1ff', '#57c9f0', '#e8fbff'],
  },
  mareon: {
    name: 'Mareon', affinity: 'agua', base: { hp: 104, atk: 20, def: 16, spd: 14 }, skill: 'burbuja',
    explore: { type: 'swim', label: 'Nadar contracorriente', strong: true }, evolvesTo: null, evolveLevel: 0,
    shape: 'drake', scale: 1.0, rarity: 'raro', lore: 'El eco de una marea antigua. Nada entre los reflejos del cielo.',
    colors: ['#9feaff', '#3a9fc9', '#e4fcff'],
  },
  terravor: {
    name: 'Terravor', affinity: 'tierra', base: { hp: 55, atk: 10, def: 12, spd: 5 }, skill: 'roca',
    explore: { type: 'move', label: 'Mover rocas', mount: true }, evolvesTo: 'titanor', evolveLevel: 8,
    shape: 'golem', scale: 0.85, rarity: 'comun', lore: 'Un montículo de tierra con ojos curiosos. Carga el peso del mundo sin quejarse.',
    colors: ['#c7a675', '#84603b', '#e4cda3'],
  },
  titanor: {
    name: 'Titanor', affinity: 'tierra', base: { hp: 140, atk: 26, def: 30, spd: 9 }, skill: 'roca',
    explore: { type: 'move', label: 'Mover rocas', strong: true, mount: true }, evolvesTo: null, evolveLevel: 0,
    shape: 'golem', scale: 1.2, rarity: 'raro', lore: 'Una cordillera con corazón. Cada paso suyo reordena el paisaje.',
    colors: ['#b38c5c', '#5d4227', '#e6d1a9'],
  },
  zefiro: {
    name: 'Zéfiro', affinity: 'viento', base: { hp: 32, atk: 9, def: 3, spd: 15 }, skill: 'rafaga',
    explore: { type: 'fly', label: 'Planear sobre abismos', mount: true }, evolvesTo: 'ventisca', evolveLevel: 8,
    shape: 'bird', scale: 0.7, rarity: 'comun', lore: 'Una pluma con voluntad propia. Solo se posa sobre quienes sonríen al viento.',
    colors: ['#c8ffe8', '#69c9a9', '#ecfff8'],
  },
  ventisca: {
    name: 'Ventisca', affinity: 'viento', base: { hp: 84, atk: 24, def: 10, spd: 27 }, skill: 'rafaga',
    explore: { type: 'fly', label: 'Planear sobre abismos', strong: true, mount: true }, evolvesTo: null, evolveLevel: 0,
    shape: 'bird', scale: 1.1, rarity: 'raro', lore: 'El aliento de las alturas. Bajo sus alas, el mundo parece pequeño.',
    colors: ['#b8ffe4', '#4aa888', '#ecfff8'],
  },
  chispa: {
    name: 'Chispa', affinity: 'rayo', base: { hp: 30, atk: 13, def: 3, spd: 14 }, skill: 'chispazo',
    explore: { type: 'power', label: 'Activar runas' }, evolvesTo: 'fulgor', evolveLevel: 8,
    shape: 'orb', scale: 0.65, rarity: 'comun', lore: 'Un trueno pequeño que se esconde en las tormentas de verano.',
    colors: ['#fff4a8', '#f0c52e', '#fffbe0'],
  },
  fulgor: {
    name: 'Fulgor', affinity: 'rayo', base: { hp: 78, atk: 31, def: 9, spd: 24 }, skill: 'chispazo',
    explore: { type: 'power', label: 'Activar runas', strong: true }, evolvesTo: null, evolveLevel: 0,
    shape: 'star', scale: 1.0, rarity: 'raro', lore: 'Un relámpago domesticado. Ilumina las ruinas con cada latido.',
    colors: ['#fffbd1', '#d9a900', '#fffef0'],
  },
  escarcha: {
    name: 'Escarcha', affinity: 'hielo', base: { hp: 40, atk: 8, def: 8, spd: 8 }, skill: 'carambano',
    explore: { type: 'freeze', label: 'Congelar mecanismos' }, evolvesTo: 'glaciar', evolveLevel: 7,
    shape: 'fox', scale: 0.72, rarity: 'comun', lore: 'Una zorra de nieve que conoce el silencio de los lagos congelados.',
    colors: ['#d7f5ff', '#79c8e8', '#f2fdff'],
  },
  glaciar: {
    name: 'Glaciar', affinity: 'hielo', base: { hp: 96, atk: 22, def: 22, spd: 13 }, skill: 'carambano',
    explore: { type: 'freeze', label: 'Congelar mecanismos', strong: true }, evolvesTo: null, evolveLevel: 0,
    shape: 'fox', scale: 1.08, rarity: 'raro', lore: 'El invierno que camina. Donde pisa, el tiempo aprende a detenerse.',
    colors: ['#c9efff', '#4c9cba', '#f5ffff'],
  },
  nocturne: {
    name: 'Nocturne', affinity: 'oscuridad', base: { hp: 38, atk: 11, def: 5, spd: 11 }, skill: 'mordida_sombra',
    explore: { type: 'detect', label: 'Detectar secretos' }, evolvesTo: 'umbrix', evolveLevel: 8,
    shape: 'fox', scale: 0.74, rarity: 'comun', lore: 'Un gatito hecho de la sombra de una vela. Colecciona secretos.',
    colors: ['#c7a6ff', '#5b3b8f', '#efe4ff'],
  },
  umbrix: {
    name: 'Umbrix', affinity: 'oscuridad', base: { hp: 92, atk: 27, def: 13, spd: 19 }, skill: 'mordida_sombra',
    explore: { type: 'detect', label: 'Detectar secretos', strong: true }, evolvesTo: null, evolveLevel: 0,
    shape: 'fox', scale: 1.06, rarity: 'raro', lore: 'Ninguna cerradura es un misterio para sus ojos de luna nueva.',
    colors: ['#b78cff', '#3e246b', '#e9dcff'],
  },
  verdin: {
    name: 'Verdín', affinity: 'naturaleza', base: { hp: 44, atk: 8, def: 7, spd: 8 }, skill: 'zarza',
    explore: { type: 'grow', label: 'Hacer crecer puentes' }, evolvesTo: 'silvano', evolveLevel: 8,
    shape: 'golem', scale: 0.68, rarity: 'comun', lore: 'Un brote con patas. Sujeta el bosque con raíces diminutas.',
    colors: ['#c6f5a1', '#5fa33e', '#ecffd9'],
  },
  silvano: {
    name: 'Silvano', affinity: 'naturaleza', base: { hp: 110, atk: 21, def: 24, spd: 12 }, skill: 'zarza',
    explore: { type: 'grow', label: 'Hacer crecer puentes', strong: true }, evolvesTo: null, evolveLevel: 0,
    shape: 'golem', scale: 1.12, rarity: 'raro', lore: 'Un fragmento del bosque original. Cada hoja suya recuerda el primer día.',
    colors: ['#a8e889', '#3e7a2f', '#e7ffd2'],
  },
  astral: {
    name: 'Astral', affinity: 'celestial', base: { hp: 46, atk: 14, def: 9, spd: 13 }, skill: 'rayo_astral',
    explore: { type: 'seal', label: 'Abrir sellos celestiales', fly: true, mount: true }, evolvesTo: 'serafin', evolveLevel: 9,
    shape: 'star', scale: 0.8, rarity: 'epico', lore: 'Una estrella caída que aún recuerda cómo volver al cielo.',
    colors: ['#fff3b0', '#e8c65b', '#fffceb'],
  },
  serafin: {
    name: 'Serafín', affinity: 'celestial', base: { hp: 120, atk: 34, def: 24, spd: 22 }, skill: 'rayo_astral',
    explore: { type: 'seal', label: 'Abrir sellos celestiales', strong: true, fly: true, mount: true }, evolvesTo: null, evolveLevel: 0,
    shape: 'star', scale: 1.15, rarity: 'legendario', lore: 'Un mensajero del cielo sin mensaje. Aun así, todos entienden su luz.',
    colors: ['#fff9cf', '#d1a72f', '#fffef4'],
  },
};

export const CREATURE_SKILLS = {
  destello:      { name: 'Destello', color: '#ffe49b', power: 1.2, kind: 'bolt' },
  chispa_ardiente:{ name: 'Chispa Ardiente', color: '#ff8b5f', power: 1.4, kind: 'fire' },
  burbuja:       { name: 'Burbuja', color: '#67d9ff', power: 1.1, kind: 'bolt' },
  roca:          { name: 'Roca Viva', color: '#d3a46b', power: 1.5, kind: 'rock' },
  rafaga:        { name: 'Ráfaga', color: '#a9f1d6', power: 1.2, kind: 'wind' },
  chispazo:      { name: 'Chispazo', color: '#ffe26e', power: 1.5, kind: 'bolt' },
  carambano:     { name: 'Carámbano', color: '#bfeaff', power: 1.3, kind: 'ice' },
  mordida_sombra:{ name: 'Mordida de Sombra', color: '#b990ff', power: 1.4, kind: 'dark' },
  zarza:         { name: 'Zarza Viva', color: '#9ce98a', power: 1.2, kind: 'nature' },
  rayo_astral:   { name: 'Rayo Astral', color: '#fff1b8', power: 1.8, kind: 'star' },
};

export const ENEMIES = {
  gelatina: {
    name: 'Gelatina Silvestre', kind: 'gelatina', hp: 48, dmg: 8, speed: 62, radius: 24, xp: 17,
    gold: [4, 9], def: 1, behavior: 'bounce', affinity: 'agua', weakness: 'rayo', scale: 0.9,
    drops: [{ id: 'gelatina', chance: 0.82 }, { id: 'hierba_lunar', chance: 0.22 }],
    lore: 'Una criatura transparente que imita el color de la lluvia. Se sobresalta con su propia sombra.',
  },
  lobo: {
    name: 'Lobo de Ceniza', kind: 'lobo', hp: 76, dmg: 13, speed: 112, radius: 25, xp: 28,
    gold: [7, 14], def: 2, behavior: 'lunge', affinity: 'fuego', weakness: 'agua', scale: 1.0,
    drops: [{ id: 'colmillo_ceniza', chance: 0.68 }, { id: 'hierba_lunar', chance: 0.15 }],
    lore: 'Cazador de los bosques quemados. Su aullido parece el crujido de una hoguera moribunda.',
  },
  escarabajo: {
    name: 'Escarabajo Pétreo', kind: 'escarabajo', hp: 130, dmg: 15, speed: 50, radius: 28, xp: 38,
    gold: [10, 20], def: 8, behavior: 'charge', affinity: 'tierra', weakness: 'rayo', scale: 1.05,
    drops: [{ id: 'caparazon_petreo', chance: 0.72 }, { id: 'gelatina', chance: 0.18 }],
    lore: 'Su caparazón es más antiguo que las ruinas que habita. Rueda como una pequeña avalancha.',
  },
  espectro: {
    name: 'Espectro de las Ruinas', kind: 'espectro', hp: 88, dmg: 12, speed: 78, radius: 24, xp: 44,
    gold: [12, 24], def: 3, behavior: 'ranged', affinity: 'oscuridad', weakness: 'luz', scale: 1.0,
    drops: [{ id: 'polvo_espectral', chance: 0.66 }, { id: 'esencia_celestial', chance: 0.08 }],
    lore: 'Un recuerdo que se negó a desvanecerse. Lanza ecos de un dolor que ya no tiene nombre.',
  },
  guardian: {
    name: 'Guardián Corrompido', kind: 'guardian', hp: 1650, dmg: 26, speed: 66, radius: 48, xp: 620,
    gold: [220, 320], def: 12, behavior: 'boss', affinity: 'oscuridad', weakness: 'luz', scale: 1.9, boss: true,
    drops: [{ id: 'corazon_guardian', chance: 1 }, { id: 'esencia_celestial', chance: 1 }, { id: 'llave_umbra', chance: 1 }],
    lore: 'El primer guardián de la Espada. Mil años de deber se retorcieron en una sola pregunta: ¿por qué proteger a quienes olvidan?',
  },
};

export const ZONES = {
  bosque_lumen: {
    id: 'bosque_lumen', name: 'Bosque de Lumen', subtitle: 'Donde la luz aprende a caminar',
    w: 2500, h: 1650, ambient: 0.17, music: 'forest', danger: 'Nivel 1-4', color: '#2b5542',
    desc: 'Un bosque antiguo atravesado por el río Susurro. Las ruinas de un santuario duermen entre raíces de plata.',
    spawns: [
      { kind: 'gelatina', x: 1050, y: 1060 },
      { kind: 'gelatina', x: 1720, y: 480 },
      { kind: 'lobo', x: 1850, y: 1180 },
      { kind: 'lobo', x: 760, y: 420 },
      { kind: 'gelatina', x: 2080, y: 820 },
      { kind: 'lobo', x: 1320, y: 1320 },
    ],
    creatureSpawns: [
      { species: 'lumito', x: 640, y: 650 },
      { species: 'brasa', x: 1960, y: 440 },
      { species: 'escarcha', x: 1480, y: 1230 },
      { species: 'zefiro', x: 2100, y: 1280 },
      { species: 'verdin', x: 560, y: 1180 },
    ],
  },
  aldea_alba: {
    id: 'aldea_alba', name: 'Aldea del Alba', subtitle: 'El último hogar antes de la noche',
    w: 2100, h: 1450, ambient: 0.2, music: 'village', danger: 'Zona segura', color: '#3d5d48',
    desc: 'Casas de piedra cálida y tejados dorados. Aquí todavía se canta mientras se amasa el pan.',
    spawns: [], creatureSpawns: [{ species: 'lumito', x: 1420, y: 960 }],
  },
  ruinas_umbra: {
    id: 'ruinas_umbra', name: 'Ruinas de Umbra', subtitle: 'El silencio tiene memoria',
    w: 2450, h: 1700, ambient: 0.68, music: 'ruins', danger: 'Nivel 5-8', color: '#2a2a43',
    desc: 'La ciudad que cayó cuando el cielo se partió. Bajo sus arcos, la oscuridad respira.',
    spawns: [
      { kind: 'espectro', x: 900, y: 700 },
      { kind: 'espectro', x: 1540, y: 1120 },
      { kind: 'escarabajo', x: 760, y: 1230 },
      { kind: 'escarabajo', x: 1720, y: 520 },
      { kind: 'lobo', x: 1260, y: 870 },
      { kind: 'gelatina', x: 600, y: 900 },
    ],
    creatureSpawns: [
      { species: 'nocturne', x: 1120, y: 420 },
      { species: 'chispa', x: 1880, y: 1380 },
      { species: 'escarcha', x: 520, y: 1100 },
    ],
  },
  santuario_celestial: {
    id: 'santuario_celestial', name: 'Santuario Celestial', subtitle: 'El corazón del cielo',
    w: 1800, h: 1350, ambient: 0.35, music: 'sanctuary', danger: 'Sagrado', color: '#4b4b76',
    desc: 'Una isla suspendida entre constelaciones. La Espada dejó aquí su primer recuerdo.',
    spawns: [], creatureSpawns: [{ species: 'astral', x: 1120, y: 380 }],
  },
};

export const ZONE_ORDER = ['bosque_lumen', 'aldea_alba', 'ruinas_umbra', 'santuario_celestial'];

export const PORTALS = {
  bosque_lumen: [
    { id: 'to_village', x: 160, y: 840, to: 'aldea_alba', toX: 1930, toY: 760, label: 'Aldea del Alba' },
    { id: 'to_ruins', x: 2380, y: 860, to: 'ruinas_umbra', toX: 180, toY: 860, label: 'Ruinas de Umbra', locked: 'ruins' },
  ],
  aldea_alba: [
    { id: 'to_forest', x: 2005, y: 760, to: 'bosque_lumen', toX: 250, toY: 840, label: 'Bosque de Lumen' },
  ],
  ruinas_umbra: [
    { id: 'to_forest', x: 110, y: 860, to: 'bosque_lumen', toX: 2300, toY: 860, label: 'Bosque de Lumen' },
    { id: 'to_sanctuary', x: 2340, y: 250, to: 'santuario_celestial', toX: 300, toY: 1000, label: 'Santuario Celestial', locked: 'boss' },
  ],
  santuario_celestial: [
    { id: 'to_ruins', x: 180, y: 1000, to: 'ruinas_umbra', toX: 2230, toY: 300, label: 'Ruinas de Umbra' },
  ],
};

export const QUESTS = {
  main_luz: {
    id: 'main_luz', type: 'main', title: 'La luz que despierta', giver: 'Lira',
    desc: 'La Espada Celestial te eligió. Averigua por qué el sello de Umbra se está rompiendo.',
    steps: [
      { text: 'Habla con Lira junto al santuario', target: { type: 'talk', id: 'lira' } },
      { text: 'Visita a la Anciana Celia en la aldea', target: { type: 'talk', id: 'celia' } },
      { text: 'Entra en las Ruinas de Umbra', target: { type: 'zone', id: 'ruinas_umbra' } },
      { text: 'Congela el Sello de Escarcha con una criatura de hielo', target: { type: 'flag', id: 'ice_gate' } },
      { text: 'Derrota al Guardián Corrompido', target: { type: 'kill', id: 'guardian', count: 1 } },
      { text: 'Reclama la Espada en el Santuario Celestial', target: { type: 'flag', id: 'ending' } },
    ],
    rewards: { gold: 300, items: { esencia_celestial: 2, elixir: 1 } },
  },
  side_gelatinas: {
    id: 'side_gelatinas', type: 'side', title: 'Gelatinas traviesas', giver: 'Lira',
    desc: 'Las gelatinas están robando las flores de luna del santuario. Detén a cuatro.',
    steps: [
      { text: 'Derrota gelatinas silvestres', target: { type: 'kill', id: 'gelatina', count: 4 } },
      { text: 'Vuelve con Lira', target: { type: 'talk', id: 'lira' } },
    ],
    rewards: { gold: 90, items: { pocion_menor: 3, sello_luz: 2 }, xp: 60 },
  },
  side_plumas: {
    id: 'side_plumas', type: 'side', title: 'Plumas para un sueño', giver: 'Mira',
    desc: 'Mira necesita tres plumas de Zéfiro para un talismán. Las criaturas del viento rondan las ruinas.',
    steps: [
      { text: 'Reúne 3 plumas de Zéfiro', target: { type: 'collect', id: 'pluma_zefiro', count: 3 } },
      { text: 'Entrega las plumas a Mira', target: { type: 'talk', id: 'mira' } },
    ],
    rewards: { gold: 140, items: { colgante_suerte: 1 }, xp: 80 },
  },
  side_corazon: {
    id: 'side_corazon', type: 'side', title: 'El corazón de piedra', giver: 'Rurik',
    desc: 'Rurik quiere estudiar los caparazones de los escarabajos pétreos de Umbra.',
    steps: [
      { text: 'Consigue 2 caparazones pétreos', target: { type: 'collect', id: 'caparazon_petreo', count: 2 } },
      { text: 'Lleva los caparazones a Rurik', target: { type: 'talk', id: 'rurik' } },
    ],
    rewards: { gold: 120, items: { charm_escarcha: 1 }, xp: 70 },
  },
  side_captura: {
    id: 'side_captura', type: 'side', title: 'Un hogar para la luz', giver: 'Celia',
    desc: 'La Anciana desea saber si las criaturas del bosque aún responden al llamado de la Espada.',
    steps: [
      { text: 'Captura una criatura silvestre', target: { type: 'capture', count: 1 } },
      { text: 'Habla con la Anciana Celia', target: { type: 'talk', id: 'celia' } },
    ],
    rewards: { gold: 100, items: { sello_maestro: 1, baya_lumen: 2 }, xp: 70 },
  },
};

export const RECIPES = {
  pocion_menor: { out: 'pocion_menor', qty: 2, cost: 10, mats: { gelatina: 1, hierba_lunar: 1 } },
  pocion_mayor: { out: 'pocion_mayor', qty: 1, cost: 30, mats: { gelatina: 2, hierba_lunar: 2 } },
  ether: { out: 'ether', qty: 2, cost: 15, mats: { cristal_escarcha: 1, hierba_lunar: 1 } },
  sello_luz: { out: 'sello_luz', qty: 2, cost: 20, mats: { polvo_espectral: 1, hierba_lunar: 1 } },
  sello_maestro: { out: 'sello_maestro', qty: 1, cost: 80, mats: { polvo_espectral: 2, esencia_celestial: 1 } },
  carne_asada: { out: 'carne_asada', qty: 1, cost: 8, mats: { colmillo_ceniza: 1, hierba_lunar: 1 } },
  cota_lumen: { out: 'cota_lumen', qty: 1, cost: 100, mats: { caparazon_petreo: 2, gelatina: 2, colmillo_ceniza: 1 } },
  espada_umbra: { out: 'espada_umbra', qty: 1, cost: 180, mats: { corazon_guardian: 1, esencia_celestial: 1, polvo_espectral: 3 } },
  escudo_celestial: { out: 'escudo_celestial', qty: 1, cost: 250, mats: { esencia_celestial: 2, caparazon_petreo: 3, cristal_escarcha: 2 } },
  charm_brasa: { out: 'charm_brasa', qty: 1, cost: 60, mats: { colmillo_ceniza: 2, cristal_escarcha: 1 } },
  charm_lumen: { out: 'charm_lumen', qty: 1, cost: 90, mats: { pluma_zefiro: 2, esencia_celestial: 1 } },
};

export const SHOP_STOCK = {
  mira: ['pocion_menor', 'pocion_mayor', 'ether', 'sello_luz', 'sello_maestro', 'carne_asada', 'baya_lumen', 'amuleto_lumen', 'colgante_suerte'],
  rurik: ['escudo_roble', 'daga_crepusculo', 'lanza_aurora', 'arco_zefiro', 'cota_lumen', 'anillo_poder', 'broche_mana', 'charm_brasa'],
};

// NPC placement is handled by world.js; this is their identity and colour language.
export const NPCS = {
  lira: { name: 'Lira', title: 'Guía del Alba', color: '#ffe49b', hair: '#f4d9a5', outfit: '#467d5d', hairStyle: 'largo' },
  celia: { name: 'Anciana Celia', title: 'Custodia de la Memoria', color: '#c7a6ff', hair: '#e7e2dc', outfit: '#5a4a7a', hairStyle: 'largo' },
  mira: { name: 'Mira', title: 'Mercader de Maravillas', color: '#ffb47e', hair: '#8a3f2c', outfit: '#a65d46', hairStyle: 'coleta' },
  rurik: { name: 'Rurik', title: 'Forjador de Ceniza', color: '#ff9a6e', hair: '#6b4a36', outfit: '#4d4d55', hairStyle: 'erizado' },
  aldeano: { name: 'Aldeano', title: 'Vecino del Alba', color: '#b7c3d8', hair: '#5d4636', outfit: '#6b7d89', hairStyle: 'corto' },
};

export const TIPS = [
  'Mantén B para bloquear. Un bloqueo perfecto aturde al enemigo.',
  'Las criaturas debilitadas pueden sellarse con Y. Un sello maestro mejora las probabilidades.',
  'El equipamiento cambia la silueta de tu personaje y sus estadísticas.',
  'Cada criatura tiene una habilidad de exploración distinta. Prueba a cambiar de compañera con R.',
  'Los secretos suelen estar detrás de rocas, espinas, muros falsos o abismos.',
  'Puedes asignar dos armas y alternarlas con L en pleno combate.',
  'La Suerte aumenta las probabilidades de captura y los golpes críticos.',
  'Los santuarios restauran vida, maná y guardan tu partida automáticamente.',
  'Los jefes tienen fases. Observa el color de su aura antes de atacar.',
  'Habla con todos los aldeanos. Algunos encargos cambian el destino de la aldea.',
];

export const INTRO_LINES = [
  'Hace mil años, el cielo se partió sobre el reino de Aetheria.',
  'La Espada Celestial selló al Devorador de Sombras y durmió entre las raíces del mundo.',
  'Ahora, el sello de Umbra se agrieta. Las criaturas susurran nombres que nadie recuerda.',
  'Y tú has despertado con la Espada en la mano.',
];

export const LEVEL_XP = (level) => Math.floor(48 + level * 34 + Math.pow(level, 1.65) * 12);

export function xpToNext(level) {
  return LEVEL_XP(level);
}

export function itemValue(id) {
  return ITEMS[id]?.value ?? 1;
}

export function isEquippable(item) {
  return item && ['weapon', 'shield', 'armor', 'accessory'].includes(item.type);
}

export function isStackable(item) {
  return item && !isEquippable(item);
}
