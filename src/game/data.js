export const ATTRIBUTES = [
  { id: 'vit', name: 'Vitalidad', short: 'VIT', effect: '+14 PV máximos' },
  { id: 'mana', name: 'Maná', short: 'MAN', effect: '+6 maná máximo' },
  { id: 'res', name: 'Resistencia', short: 'RES', effect: '+7 aguante máximo' },
  { id: 'str', name: 'Fuerza', short: 'FUE', effect: '+2,1 daño de arma' },
  { id: 'def', name: 'Defensa', short: 'DEF', effect: '+1,5 mitigación' },
  { id: 'spd', name: 'Velocidad', short: 'VEL', effect: '+0,13 m/s' },
  { id: 'int', name: 'Inteligencia', short: 'INT', effect: '+resonancia y maná' },
  { id: 'luck', name: 'Suerte', short: 'SUE', effect: '+0,9% crítico y botín' },
];

export const ORIGINS = [
  {
    id: 'vanguard',
    name: 'Vanguardia de Valdoria',
    short: 'Vanguardia',
    glyph: '⬡',
    desc: 'Forjado entre murallas de piedra. Aguanta lo que otros no pueden.',
    base: { vit: 4, mana: 1, res: 4, str: 3, def: 4, spd: 2, int: 1, luck: 2 },
    perk: '<b>Bastón de la Aurora.</b> Al bloquear, recuperas 2 de aguante por segundo. Los golpes perfectos generan un pulso de luz.',
    color: '#e4bf78',
  },
  {
    id: 'blade',
    name: 'Filo del Alba',
    short: 'Filo del Alba',
    glyph: '✧',
    desc: 'Una hoja que aprendió a moverse antes que su dueño. Velocidad y precisión.',
    base: { vit: 2, mana: 2, res: 3, str: 4, def: 2, spd: 5, int: 2, luck: 3 },
    perk: '<b>Segundo compás.</b> El tercer golpe de una cadena inflige un 35% más de daño y restaura aguante.',
    color: '#92e7df',
  },
  {
    id: 'sage',
    name: 'Sabio de Kansordore',
    short: 'Sabio',
    glyph: '◉',
    desc: 'Leyó lo que no debía. El Velo le respondió con un susurro.',
    base: { vit: 1, mana: 5, res: 2, str: 2, def: 2, spd: 2, int: 6, luck: 3 },
    perk: '<b>Eco profundo.</b> La resonancia es un 30% más rápida. Las criaturas invocadas duran más y sus habilidades cuestan menos.',
    color: '#bca3ee',
  },
];

export const HAIR_STYLES = [
  { id: 'short', name: 'Corto' },
  { id: 'long', name: 'Largo' },
  { id: 'braid', name: 'Trenza' },
  { id: 'wild', name: 'Salvaje' },
];

export const HAIR_COLORS = [
  { id: 'plata', name: 'Plata lunar', hex: '#d9d5cc' },
  { id: 'castano', name: 'Castaño', hex: '#6f4b35' },
  { id: 'negro', name: 'Negro ala', hex: '#23242b' },
  { id: 'cobre', name: 'Cobre', hex: '#b4613a' },
  { id: 'aurora', name: 'Aurora', hex: '#8ad8d3' },
  { id: 'violeta', name: 'Violeta', hex: '#9a82c4' },
];

export const SKIN_COLORS = [
  { id: 'marfil', name: 'Marfil', hex: '#e9c9a8' },
  { id: 'miel', name: 'Miel', hex: '#c99568' },
  { id: 'canela', name: 'Canela', hex: '#9a6648' },
  { id: 'caoba', name: 'Caoba', hex: '#6d4431' },
  { id: 'obsidiana', name: 'Obsidiana', hex: '#432f2b' },
];

export const OUTFITS = [
  { id: 'aurora', name: 'Aurora', primary: '#3e7d78', secondary: '#d6b16e', trim: '#f5e3b4', metal: '#c6a45f' },
  { id: 'bosque', name: 'Bosque', primary: '#445d3b', secondary: '#8f6c42', trim: '#c8d6a0', metal: '#9c7e4b' },
  { id: 'celeste', name: 'Celeste', primary: '#5b6f9f', secondary: '#d8d6cb', trim: '#9de2e2', metal: '#b7c8dc' },
  { id: 'ceniza', name: 'Ceniza', primary: '#453c3b', secondary: '#8b4a3d', trim: '#e49d70', metal: '#7c5d4b' },
];

export const REGIONS = {
  valdoria: {
    id: 'valdoria',
    numeral: 'REGIÓN I',
    name: 'VALDORIA',
    subtitle: 'El Jardín de la Aurora',
    epithet: 'Donde el Velo aprendió a florecer',
    spawn: { x: 0, z: 2 },
    bounds: 91,
    sky: { top: '#1e4565', mid: '#6f9bb0', low: '#f2c184', sun: '#ffe3a0', fog: '#9fb9ae' },
    sun: { color: '#ffd9a3', intensity: 2.55, position: [52, 66, 38] },
    hemi: { sky: '#a5c7d1', ground: '#4a5b36', intensity: 1.1 },
    water: { level: -1.65, color: '#3e8e8a', emissive: '#1c5158' },
    ground: ['#4f7646', '#678d4e', '#7c9e5a', '#93ad66'],
    path: '#b69a68',
    rock: '#7a7d70',
    weather: 'fireflies',
    music: 'valdoria',
    quest: {
      title: 'La llamada de la Aurora',
      steps: [
        { objective: 'Habla con Lira junto al santuario.', hint: 'La guardiana espera al borde del sendero.' },
        { objective: 'Purga los tres focos de corrupción.', hint: 'Los focos laten al oeste, al este y al sur del bosque.' },
        { objective: 'Entra en el Santuario de la Grieta.', hint: 'Las ruinas del noroeste han despertado.' },
        { objective: 'Recoge el Fragmento de la Gema.', hint: 'El altar aguarda bajo la mirada del Centinela.' },
        { objective: 'Atraviesa la Puerta de Drakmore.', hint: 'El portal de ceniza se ha abierto al norte.' },
      ],
    },
  },
  drakmore: {
    id: 'drakmore',
    numeral: 'REGIÓN II',
    name: 'DRAKMORE',
    subtitle: 'El Reino de la Primera Brasa',
    epithet: 'Donde el cielo aprendió a arder',
    spawn: { x: 0, z: -54 },
    bounds: 91,
    sky: { top: '#120d1d', mid: '#4b1e28', low: '#c35d35', sun: '#ff8a4a', fog: '#592a2c' },
    sun: { color: '#ff8a51', intensity: 2.2, position: [-42, 48, -26] },
    hemi: { sky: '#8e3e3e', ground: '#1d1215', intensity: 0.85 },
    water: { level: -1.9, color: '#ff6a22', emissive: '#ff3d0a' },
    ground: ['#2b2324', '#3b2b28', '#4b312b', '#5a3830'],
    path: '#5d4137',
    rock: '#292526',
    weather: 'embers',
    music: 'drakmore',
    quest: {
      title: 'La Lágrima de la Primera Brasa',
      steps: [
        { objective: 'Habla con Orin en el campamento de ceniza.', hint: 'El viejo herrero ha sobrevivido a la Ruptura.' },
        { objective: 'Rompe los dos sellos de la Fortaleza.', hint: 'Los sellos arden al este y al oeste del camino.' },
        { objective: 'Desafía a Kael, el Rey Cenizo.', hint: 'La fortaleza negra se alza al norte.' },
        { objective: 'Toma la Lágrima de la Primera Brasa.', hint: 'El trono de obsidiana aún respira.' },
        { objective: 'Cruza el Portal de Kansordore.', hint: 'La luz del templo rasga el horizonte.' },
      ],
    },
  },
  kansordore: {
    id: 'kansordore',
    numeral: 'REGIÓN III',
    name: 'KANSORDORE',
    subtitle: 'El Templo del Velo',
    epithet: 'Donde el mundo aprendió a soñar',
    spawn: { x: 0, z: -55 },
    bounds: 91,
    sky: { top: '#090c22', mid: '#2f315f', low: '#9b7bc5', sun: '#d9c6ff', fog: '#5f5c86' },
    sun: { color: '#cfc2ff', intensity: 1.9, position: [38, 72, -42] },
    hemi: { sky: '#8f9ad8', ground: '#2a2740', intensity: 0.9 },
    water: { level: -2.6, color: '#6f8fd6', emissive: '#4b5fa0' },
    ground: ['#b8b3c7', '#c9c3d3', '#d8d0dc', '#a9a3bd'],
    path: '#d9c9a1',
    rock: '#77738e',
    weather: 'motes',
    music: 'kansordore',
    quest: {
      title: 'La Profecía de Jugador Cero',
      steps: [
        { objective: 'Escucha al Testigo en el atrio del templo.', hint: 'Una figura sin rostro aguarda entre las columnas.' },
        { objective: 'Resuena con los tres Ecos Primordiales.', hint: 'Lumín, Chispa y Astral sostienen los sellos del templo.' },
        { objective: 'Abre la Puerta de la Convergencia.', hint: 'El centro del templo late con una luz imposible.' },
        { objective: 'Enfréntate a Jugador Cero.', hint: 'La profecía siempre tuvo tu rostro.' },
        { objective: 'Toca el Núcleo de la Convergencia.', hint: 'El Velo espera tu decisión.' },
      ],
    },
  },
};

export const CREATURES = {
  lumin: {
    id: 'lumin', name: 'Lumín', element: 'Luz', rarity: 'Común', glyph: '✦',
    color: '#ffe0a0', color2: '#d6a94d', region: 'valdoria',
    passive: 'Pulso vital: +8% de vida máxima.',
    ability: 'Destello curativo: restaura un 28% de vida.',
    lore: 'Pequeños zorros de luz que duermen dentro de las flores de Valdoria. Su cola guarda el último rayo de sol de cada día.',
    stats: { hp: 8, crit: 0, def: 0, speed: 0 },
  },
  bruma: {
    id: 'bruma', name: 'Bruma', element: 'Sombra', rarity: 'Rara', glyph: '☾',
    color: '#a99bd6', color2: '#574a86', region: 'valdoria',
    passive: 'Paso velado: +6% de probabilidad de crítico.',
    ability: 'Mordisco umbrío: inflige daño de sombra y ralentiza.',
    lore: 'Nacida de una promesa rota, Bruma no es maligna. Solo recuerda a quien la olvidó.',
    stats: { hp: 0, crit: 0.06, def: 0, speed: 0.2 },
  },
  terravok: {
    id: 'terravok', name: 'Terravok', element: 'Tierra', rarity: 'Rara', glyph: '⬢',
    color: '#9cc08b', color2: '#506344', region: 'valdoria',
    passive: 'Piel de piedra: +10% de defensa.',
    ability: 'Bastión: otorga un escudo que absorbe daño.',
    lore: 'Antes de las murallas, Valdoria ya tenía guardianes. Terravok recuerda el nombre de cada piedra.',
    stats: { hp: 0, crit: 0, def: 0.1, speed: -0.1 },
  },
  chispa: {
    id: 'chispa', name: 'Chispa', element: 'Fuego', rarity: 'Épica', glyph: '✹',
    color: '#ff9b57', color2: '#b5362e', region: 'drakmore',
    passive: 'Furia de brasa: +12% de daño de ataque.',
    ability: 'Nova de ceniza: una explosión ígnea alrededor del portador.',
    lore: 'La Primera Brasa no se apagó. Se dividió en miles de criaturas que aún buscan un hogar.',
    stats: { hp: 0, crit: 0, def: 0, speed: 0, damage: 0.12 },
  },
  aeris: {
    id: 'aeris', name: 'Aeris', element: 'Viento', rarity: 'Rara', glyph: '⌁',
    color: '#a7e3dc', color2: '#427c85', region: 'drakmore',
    passive: 'Pluma ligera: +10% de velocidad y aguante.',
    ability: 'Viento cortante: un proyectil que atraviesa a los enemigos.',
    lore: 'Las tormentas de Drakmore tienen alas. Aeris vuela entre relámpagos como si fueran venas del cielo.',
    stats: { hp: 0, crit: 0.03, def: 0, speed: 0.5 },
  },
  astral: {
    id: 'astral', name: 'Astral', element: 'Cosmos', rarity: 'Legendaria', glyph: '◉',
    color: '#bca3ee', color2: '#514b9f', region: 'kansordore',
    passive: 'Mente del Velo: +20% de resonancia y +10 maná.',
    ability: 'Rayo de convergencia: daño puro a todos los enemigos cercanos.',
    lore: 'Se dice que Astral es un fragmento del sueño de la Gema. Cuando parpadea, una estrella nace al otro lado del Velo.',
    stats: { hp: 0, crit: 0, def: 0, speed: 0, resonance: 0.2, mana: 10 },
  },
  seraph: {
    id: 'seraph', name: 'Seraph', element: 'Luz', rarity: 'Épica', glyph: '✧',
    color: '#f2e7bd', color2: '#c59b52', region: 'kansordore',
    passive: 'Coro del alba: la vida se regenera lentamente.',
    ability: 'Juicio sereno: cura y daña a la vez.',
    lore: 'Los serafines no son ángeles. Son ecos de quienes eligieron proteger algo hasta el final.',
    stats: { hp: 0.06, crit: 0, def: 0.04, speed: 0, resonance: 0.1 },
  },
};

export const ITEMS = {
  filo_alba: { id: 'filo_alba', name: 'Filo del Alba', type: 'weapon', icon: '⚔', rarity: 'Inicial', atk: 2, crit: 0.01, desc: 'La hoja que te entregó Lira. Aún recuerda la luz de su forja.', appearance: { blade: '#d8ecf1', edge: '#ffe5a8', scale: 1 } },
  espada_ceniza: { id: 'espada_ceniza', name: 'Espada de Ceniza', type: 'weapon', icon: '⚔', rarity: 'Épica', atk: 7, crit: 0.03, desc: 'Forjada con el último aliento de un guardián de Drakmore.', appearance: { blade: '#584b4b', edge: '#ff8a4a', scale: 1.08 } },
  filo_convergencia: { id: 'filo_convergencia', name: 'Filo de la Convergencia', type: 'weapon', icon: '⚔', rarity: 'Legendaria', atk: 13, crit: 0.06, desc: 'No corta la materia. Corta la distancia entre dos verdades.', appearance: { blade: '#d9d4ff', edge: '#bca3ee', scale: 1.15 } },
  tunica_valdoria: { id: 'tunica_valdoria', name: 'Túnica de Valdoria', type: 'armor', icon: '◈', rarity: 'Inicial', def: 2, hp: 10, desc: 'Lana, cuero y una promesa bordada en oro.', appearance: { outfit: 'aurora' } },
  manto_ceniza: { id: 'manto_ceniza', name: 'Manto de Ceniza', type: 'armor', icon: '◈', rarity: 'Épica', def: 7, hp: 28, desc: 'La ceniza nunca se aparta del todo de quien la lleva.', appearance: { outfit: 'ceniza' } },
  peto_celestial: { id: 'peto_celestial', name: 'Peto Celestial', type: 'armor', icon: '◈', rarity: 'Legendaria', def: 11, hp: 46, desc: 'Luz solidificada por la mano de los primeros guardianes.', appearance: { outfit: 'celeste' } },
  amuleto_lumin: { id: 'amuleto_lumin', name: 'Amuleto de Lumín', type: 'charm', icon: '✦', rarity: 'Rara', luck: 2, resonance: 0.08, desc: 'Una brasa de luz que nunca quema.', appearance: {} },
  lagrima_brasa: { id: 'lagrima_brasa', name: 'Lágrima de la Primera Brasa', type: 'charm', icon: '✹', rarity: 'Épica', atk: 3, crit: 0.03, desc: 'La primera chispa del mundo, todavía cálida.', appearance: {} },
  sello_velo: { id: 'sello_velo', name: 'Sello del Velo', type: 'charm', icon: '◉', rarity: 'Legendaria', mana: 18, resonance: 0.12, desc: 'Una pregunta sin respuesta que cabe en la palma.', appearance: {} },
  elixir: { id: 'elixir', name: 'Elixir de Aurora', type: 'consumable', icon: '◈', rarity: 'Común', desc: 'Restaura un 45% de la vida y 20 de maná.', appearance: {} },
};

export const LORE = [
  { id: 'gema', title: 'La Gema Celestial', text: 'El corazón del Velo. No era una piedra: era una decisión que el mundo tomó por todos nosotros.' },
  { id: 'jarra', title: 'La Jarra de Origen', text: 'El recipiente que derramó la primera luz sobre el vacío. Algunos dicen que aún está medio llena.' },
  { id: 'lagrima', title: 'La Lágrima de la Primera Brasa', text: 'La única llama que no nació del fuego, sino de la pena de un dios que decidió quedarse.' },
  { id: 'profecia', title: 'La Profecía de Jugador Cero', text: 'No habla de un héroe. Habla de una pieza que ninguna profecía previó: alguien que puede elegir no jugar.' },
  { id: 'convergencia', title: 'La Convergencia Absoluta', text: 'El instante en que todas las versiones del mundo coinciden. Solo una puede sobrevivir.' },
  { id: 'despertar', title: 'El Despertar', text: 'No es el fin del sueño. Es la primera vez que el soñador abre los ojos.' },
  { id: 'resonancia', title: 'La Resonancia', text: 'El lenguaje anterior a las palabras. Las criaturas lo hablan; los humanos solo lo recuerdan en la música.' },
  { id: 'velo', title: 'El Velo', text: 'La membrana entre lo que es y lo que podría ser. Se está rasgando, y algo al otro lado sonríe.' },
  { id: 'ruptura', title: 'La Ruptura', text: 'El día en que la Gema se quebró. Nadie recuerda quién empuñó el martillo. Todos recuerdan el sonido.' },
  { id: 'ascension', title: 'La Ascensión', text: 'El camino que recorren quienes aceptan convertirse en leyenda. No es un premio. Es una despedida.' },
];

export const INTRO_SLIDES = [
  { kicker: 'HACE MIL AÑOS', title: 'La Gema no se rompió.', text: 'La rompieron.', em: false },
  { kicker: 'ENTONCES LLEGÓ LA RUPTURA', title: 'El Velo se rasgó.', text: 'Y el mundo aprendió a vivir con una herida abierta en el cielo.', em: false },
  { kicker: 'LA PROFECÍA DE JUGADOR CERO', title: 'Nadie te eligió.', text: 'No estabas en la profecía. Eso te hace la única pieza que puede cambiarla.', em: true },
  { kicker: 'VALDORIA · EL JARDÍN DE LA AURORA', title: 'La Espada te espera.', text: 'Pero antes, alguien tiene que decidir qué clase de leyenda quieres ser.', em: false },
];

export const ENDING_TEXT = 'La Espada Celestial vuelve a cantar. El Velo se cierra… pero no del todo. Al otro lado, una figura con tu rostro abre los ojos. La Convergencia no ha terminado. Solo ha aprendido tu nombre.';

export const SAVE_KEY = 'la-espada-celestial-save-v1';

export const REGION_ORDER = ['valdoria', 'drakmore', 'kansordore'];
