// ============================================================
// LA ESPADA CELESTIAL — contenido original del mundo
// ============================================================

export const GAME_VERSION = '1.0.0';
export const SAVE_KEY = 'la-espada-celestial-save-v1';
export const SETTINGS_KEY = 'la-espada-celestial-settings-v1';

export const ELEMENTS = {
  luz:      { name: 'Luz', color: '#ffe3a0', dark: '#a97e35', icon: '✦' },
  naturaleza:{ name: 'Naturaleza', color: '#8edb9f', dark: '#3b7c4d', icon: '❧' },
  sombra:   { name: 'Sombra', color: '#b9a4e8', dark: '#5d4a87', icon: '☾' },
  tierra:   { name: 'Tierra', color: '#d7b27e', dark: '#7c5a32', icon: '⬢' },
  fuego:    { name: 'Fuego', color: '#ff9b6a', dark: '#a53b2a', icon: '✹' },
  aire:     { name: 'Aire', color: '#a6e5e1', dark: '#4b8a8b', icon: '≈' },
  vacio:    { name: 'Vacío', color: '#d4c2ff', dark: '#6d5b9a', icon: '◌' },
  origen:   { name: 'Origen', color: '#fff2c4', dark: '#b99042', icon: '❂' },
};

export const CREATURES = [
  {
    id: 'lumin', name: 'Lumín', title: 'La chispa que recuerda', element: 'luz', rarity: 'Común', stars: 1,
    shape: 'fox', color: '#ffe2a1', accent: '#fff8dc', region: 'valdoria',
    lore: 'Pequeños espíritus que nacen donde la luz toca por primera vez una hoja. Se dice que guardan el último sueño de los que parten.',
    passive: '+8% de maná máximo.', passiveKey: 'manaPct', passiveValue: 8,
    ability: 'Destello', abilityDesc: 'Un estallido de luz que daña y ralentiza a los enemigos cercanos.', cooldown: 8,
    base: { hp: 30, atk: 7, def: 2, speed: 1.1 },
    hint: 'Se muestra curioso ante quien no alza la espada.'
  },
  {
    id: 'musgoso', name: 'Musgoso', title: 'El guardián de raíces', element: 'naturaleza', rarity: 'Común', stars: 1,
    shape: 'turtle', color: '#8fce94', accent: '#d7edb4', region: 'valdoria',
    lore: 'Duerme durante décadas y despierta cuando el bosque necesita memoria. Su caparazón es un mapa vivo de Valdoria.',
    passive: '+12 de vida máxima.', passiveKey: 'hpFlat', passiveValue: 12,
    ability: 'Raíz viva', abilityDesc: 'Atrapa a los enemigos en raíces durante dos segundos.', cooldown: 10,
    base: { hp: 48, atk: 5, def: 5, speed: 0.72 },
    hint: 'Le gustan las flores amarillas y la calma.'
  },
  {
    id: 'brumito', name: 'Brumito', title: 'El paso que no se oye', element: 'sombra', rarity: 'Común', stars: 1,
    shape: 'cat', color: '#9c8ac6', accent: '#e3d7ff', region: 'valdoria',
    lore: 'Los aldeanos culpan a Brumito cuando desaparece una cuchara. En realidad, solo colecciona cosas que brillan para su nido.',
    passive: '+5% de velocidad de movimiento.', passiveKey: 'speedPct', passiveValue: 5,
    ability: 'Paso umbrío', abilityDesc: 'Te desplaza hacia delante y deja una sombra que distrae.', cooldown: 7,
    base: { hp: 26, atk: 8, def: 1, speed: 1.35 },
    hint: 'Aparece y desaparece entre la niebla del bosque.'
  },
  {
    id: 'silex', name: 'Sílex', title: 'El que escucha la montaña', element: 'tierra', rarity: 'Poco común', stars: 2,
    shape: 'beetle', color: '#c9a36b', accent: '#f4dfb6', region: 'valdoria',
    lore: 'Cada piedra de su cuerpo fue elegida por una montaña. Cuando camina, el suelo recuerda antiguas erupciones.',
    passive: '+2 de defensa.', passiveKey: 'defFlat', passiveValue: 2,
    ability: 'Muro de piedra', abilityDesc: 'Alza un muro que bloquea proyectiles durante cuatro segundos.', cooldown: 12,
    base: { hp: 55, atk: 6, def: 8, speed: 0.62 },
    hint: 'Se esconde entre las rocas de las ruinas.'
  },
  {
    id: 'chispa', name: 'Chispa', title: 'La pluma que arde', element: 'fuego', rarity: 'Poco común', stars: 2,
    shape: 'bird', color: '#ff9d63', accent: '#ffe0a8', region: 'drakmor',
    lore: 'Nace de las brasas que sobreviven a un incendio. Nunca olvida el nombre de quien le dio calor por primera vez.',
    passive: '+6% de daño de ataque.', passiveKey: 'atkPct', passiveValue: 6,
    ability: 'Pluma ardiente', abilityDesc: 'Lanza una pluma incandescente que explota al impactar.', cooldown: 6,
    base: { hp: 28, atk: 11, def: 1, speed: 1.25 },
    hint: 'Danzan sobre las grietas de Drakmor.'
  },
  {
    id: 'niebla', name: 'Niebla', title: 'La liebre del viento', element: 'aire', rarity: 'Poco común', stars: 2,
    shape: 'hare', color: '#a8e0dc', accent: '#e5fffb', region: 'drakmor',
    lore: 'Corre tan rápido que a veces llega antes de haber salido. Los cartógrafos la usan para medir distancias imposibles.',
    passive: '+10 de resistencia máxima.', passiveKey: 'stamFlat', passiveValue: 10,
    ability: 'Ráfaga', abilityDesc: 'Una ráfaga que empuja a los enemigos y rompe su guardia.', cooldown: 8,
    base: { hp: 24, atk: 7, def: 2, speed: 1.6 },
    hint: 'Se oculta en las cenizas que flotan.'
  },
  {
    id: 'cinereo', name: 'Cinéreo', title: 'El aullido de la ceniza', element: 'fuego', rarity: 'Raro', stars: 3,
    shape: 'wolf', color: '#b64e42', accent: '#ffc176', region: 'drakmor',
    lore: 'Fue lobo antes de que la Forja Corrupta quemara su bosque. Ahora protege a los suyos con un fuego que no consume.',
    passive: '+8% de probabilidad de crítico.', passiveKey: 'critFlat', passiveValue: 8,
    ability: 'Aullido de ceniza', abilityDesc: 'Un aullido que quema a todos los enemigos alrededor.', cooldown: 11,
    base: { hp: 44, atk: 13, def: 3, speed: 1.2 },
    hint: 'Su aullido se oye antes que sus pasos.'
  },
  {
    id: 'vortex', name: 'Vórtex', title: 'El ojo del Velo', element: 'aire', rarity: 'Raro', stars: 3,
    shape: 'owl', color: '#8fd2da', accent: '#f0f9ff', region: 'drakmor',
    lore: 'Sus ojos ven las costuras del mundo. Parpadea y una montaña cambia de lugar. No le gusta que le pregunten por qué.',
    passive: '+12% de poder de Resonancia.', passiveKey: 'resPct', passiveValue: 12,
    ability: 'Ojo del Velo', abilityDesc: 'Revela criaturas ocultas y aumenta la captura durante seis segundos.', cooldown: 14,
    base: { hp: 32, atk: 10, def: 3, speed: 1.15 },
    hint: 'Gira en círculos sobre las fortalezas en ruinas.'
  },
  {
    id: 'custodio', name: 'Custodio', title: 'La garra del templo', element: 'luz', rarity: 'Raro', stars: 3,
    shape: 'lion', color: '#e6cf93', accent: '#fff6d9', region: 'kansordore',
    lore: 'Los templos de Kansordore no tienen puertas: tienen Custodios. Solo abre el camino quien ha aprendido a no tener prisa.',
    passive: '+4 de defensa.', passiveKey: 'defFlat', passiveValue: 4,
    ability: 'Bastión', abilityDesc: 'Un escudo celestial absorbe daño durante cinco segundos.', cooldown: 13,
    base: { hp: 62, atk: 9, def: 10, speed: 0.7 },
    hint: 'Patrulla los puentes del Templo del Primer Alba.'
  },
  {
    id: 'serafin', name: 'Serafín', title: 'La voz del amanecer', element: 'luz', rarity: 'Épico', stars: 4,
    shape: 'serpent', color: '#ffe7a6', accent: '#fffdf0', region: 'kansordore',
    lore: 'No canta para los vivos ni para los muertos. Canta para el instante exacto en que ambos se dan la mano.',
    passive: '+18 de maná máximo.', passiveKey: 'manaFlat', passiveValue: 18,
    ability: 'Canto de alba', abilityDesc: 'Restaura vida y maná, y purifica la corrupción cercana.', cooldown: 18,
    base: { hp: 40, atk: 12, def: 5, speed: 1.0 },
    hint: 'Solo aparece ante quien lleva una Lágrima.'
  },
  {
    id: 'eco', name: 'Eco', title: 'El niño sin nombre', element: 'vacio', rarity: 'Épico', stars: 4,
    shape: 'spirit', color: '#c3b3f0', accent: '#f2eaff', region: 'kansordore',
    lore: 'Fue el primer Portador. No el primero en empuñar la Espada, sino el primero en preguntarse si debía hacerlo.',
    passive: '+1 carga de Arte Celestial.', passiveKey: 'skillCharge', passiveValue: 1,
    ability: 'Silencio', abilityDesc: 'Detiene el tiempo de los enemigos durante tres segundos.', cooldown: 20,
    base: { hp: 36, atk: 14, def: 4, speed: 1.1 },
    hint: 'Habita en los ecos de la biblioteca prohibida.'
  },
  {
    id: 'primigenio', name: 'Primigenio', title: 'El mundo antes del mundo', element: 'origen', rarity: 'Legendario', stars: 5,
    shape: 'world', color: '#f6d98d', accent: '#ffffff', region: 'kansordore',
    lore: 'La primera criatura. La última canción. Cuando la Espada se alce, estará allí para recordarte que incluso los dioses fueron niños una vez.',
    passive: '+2 a todos los atributos y +10% a todas las resistencias.', passiveKey: 'allStats', passiveValue: 2,
    ability: 'Convergencia', abilityDesc: 'Une las tres Luces en un golpe que atraviesa el Velo.', cooldown: 24,
    base: { hp: 80, atk: 18, def: 9, speed: 1.0 },
    hint: 'No se captura. Se reconoce.'
  }
];

export const CREATURE_BY_ID = Object.fromEntries(CREATURES.map(c => [c.id, c]));

export const WEAPONS = [
  { id: 'alba', name: 'Espada del Alba', type: 'weapon', slot: 'weapon', atk: 4, desc: 'Forjada con el primer reflejo del sol sobre Valdoria.', rarity: 'Reliquia', color: '#ecd59f', blade: '#fff1c2', shape: 0 },
  { id: 'guardiana', name: 'Filo de la Guardiana', type: 'weapon', slot: 'weapon', atk: 7, desc: 'La hoja que el Guardián de Vael no pudo blandir.', rarity: 'Raro', color: '#c9a65a', blade: '#d8ecff', shape: 1 },
  { id: 'mandoble', name: 'Mandoble de Vael', type: 'weapon', slot: 'weapon', atk: 11, desc: 'Demasiado pesada para un rey. Perfecta para un portador.', rarity: 'Épico', color: '#9b6b3b', blade: '#ffb36a', shape: 1 },
  { id: 'obsidiana', name: 'Filo de Obsidiana', type: 'weapon', slot: 'weapon', atk: 14, desc: 'Cortó la montaña que separaba Drakmor del mar.', rarity: 'Épico', color: '#8c4f38', blade: '#ff704f', shape: 2 },
  { id: 'celestial', name: 'Espada Celestial', type: 'weapon', slot: 'weapon', atk: 20, desc: 'No fue forjada. Fue recordada. La hoja que nombra al Portador.', rarity: 'Mítico', color: '#f5df9f', blade: '#fffbe5', shape: 3 },
];

export const ARMORS = [
  { id: 'tunica', name: 'Túnica del Alba', type: 'armor', slot: 'armor', def: 2, hp: 10, desc: 'Lino de Valdoria cosido con hilo de plata.', color: '#d7c7a4', rarity: 'Común' },
  { id: 'coraza', name: 'Coraza de Valdoria', type: 'armor', slot: 'armor', def: 5, hp: 25, desc: 'Cada abolladura cuenta una batalla que se ganó.', color: '#8095a8', rarity: 'Poco común' },
  { id: 'manto', name: 'Manto de Brasa', type: 'armor', slot: 'armor', def: 8, hp: 40, desc: 'Tejido con ceniza de dragón. Nunca está frío.', color: '#a95c3d', rarity: 'Raro' },
  { id: 'egida', name: 'Égida del Velo', type: 'armor', slot: 'armor', def: 12, hp: 60, desc: 'El Velo mismo se apartó para dejarla pasar.', color: '#b7a8d9', rarity: 'Épico' },
];

export const HELMETS = [
  { id: 'ninguno', name: 'Sin casco', type: 'helmet', slot: 'helmet', def: 0, desc: 'Que el mundo vea tu rostro.', rarity: 'Común' },
  { id: 'diadema', name: 'Diadema de Lumen', type: 'helmet', slot: 'helmet', def: 1, mana: 10, desc: 'Tres puntas que señalan el amanecer.', rarity: 'Poco común' },
  { id: 'yelmo', name: 'Yelmo del Cuervo', type: 'helmet', slot: 'helmet', def: 4, crit: 4, desc: 'El cuervo no canta. Observa.', rarity: 'Raro' },
];

export const CHARMS = [
  { id: 'ninguno', name: 'Sin talismán', type: 'charm', slot: 'charm', desc: 'A veces el valor basta.', rarity: 'Común' },
  { id: 'amuleto', name: 'Amuleto de Lumín', type: 'charm', slot: 'charm', luck: 3, mana: 8, desc: 'Un pequeño sol que no se apaga.', rarity: 'Poco común' },
  { id: 'sello', name: 'Sello de Resonancia', type: 'charm', slot: 'charm', res: 4, luck: 2, desc: 'Late cuando una criatura recuerda tu nombre.', rarity: 'Raro' },
  { id: 'lagrima', name: 'Lágrima de la Primera Brasa', type: 'charm', slot: 'charm', atk: 4, crit: 6, desc: 'El calor de un mundo que aún no sabía arder.', rarity: 'Épico' },
];

export const ITEMS = {
  potion: { id: 'potion', name: 'Elixir de Lumen', desc: 'Restaura 50 de vida.', icon: '✚', color: '#e76b6b' },
  ether: { id: 'ether', name: 'Esencia de Velo', desc: 'Restaura 35 de maná.', icon: '◈', color: '#7cbcf0' },
  flower: { id: 'flower', name: 'Flor de Alba', desc: 'Una flor que solo abre de noche.', icon: '✿', color: '#f0c96b' },
  ember: { id: 'ember', name: 'Fragmento de brasa', desc: 'Aún recuerda el fuego que la creó.', icon: '✹', color: '#ff9a64' },
  relic: { id: 'relic', name: 'Sello antiguo', desc: 'Un sello de la primera civilización.', icon: '◎', color: '#d8c38f' },
  key: { id: 'key', name: 'Llave del Velo', desc: 'Abre lo que no debería abrirse.', icon: '⚿', color: '#b8a6df' },
  core: { id: 'core', name: 'Núcleo de Forja', desc: 'El corazón palpitante de una máquina que soñaba.', icon: '⬢', color: '#ff8a57' },
};

export const QUESTS = [
  { id: 'q0', title: 'El eco de la Espada', objective: 'Habla con la maestra Elara en la plaza de Lumen.', hint: 'La plaza está al norte del santuario.', xp: 40, gold: 20 },
  { id: 'q1', title: 'El primer vínculo', objective: 'Encuentra a Lumín en el Bosque de los Susurros y ofrecele tu Resonancia.', hint: 'Sigue el sendero de flores hacia el norte de la aldea.', xp: 80, gold: 35 },
  { id: 'q2', title: 'La Lágrima de la Primera Brasa', objective: 'Investiga las Ruinas de Vael, al este. Derrota al Guardián.', hint: 'Las ruinas se alzan más allá del bosque, al este.', xp: 160, gold: 80 },
  { id: 'q3', title: 'La puerta de brasa', objective: 'Cruza la Puerta de Brasa hacia Drakmor.', hint: 'La puerta está al extremo este de Valdoria.', xp: 100, gold: 60 },
  { id: 'q4', title: 'El corazón de Drakmor', objective: 'Encuentra a Nyx en el campamento y derrota a la Forja Corrupta.', hint: 'La fortaleza se alza entre dos ríos de lava.', xp: 260, gold: 150 },
  { id: 'q5', title: 'La última biblioteca', objective: 'Cruza el Portal de Ceniza hacia Kansordore.', hint: 'El portal se abre tras la caída de la Forja.', xp: 180, gold: 100 },
  { id: 'q6', title: 'La Profecía de Jugador Cero', objective: 'Enciende los tres Ecos del Templo y enfrenta a Vael.', hint: 'Los tres sellos rodean el Templo del Primer Alba.', xp: 400, gold: 250 },
  { id: 'q7', title: 'El nombre de la Espada', objective: 'Elige qué será del Velo. La Espada espera tu respuesta.', hint: 'No hay respuesta correcta. Solo la tuya.', xp: 0, gold: 0 },
];

export const SIDE_QUESTS = [
  { id: 's0', title: 'La brasa perdida', giver: 'Ordan', objective: 'Recupera 3 fragmentos de brasa en Valdoria.', reward: 'Filo de la Guardiana', xp: 60, gold: 50 },
  { id: 's1', title: 'El jardín de Mira', giver: 'Mira', objective: 'Recoge 3 flores de alba para Mira.', reward: 'Amuleto de Lumín', xp: 45, gold: 30 },
  { id: 's2', title: 'Ecos de los caídos', giver: 'Solen', objective: 'Escucha 3 piedras de memoria en Kansordore.', reward: 'Sello de Resonancia', xp: 100, gold: 80 },
];

export const REGIONS = {
  valdoria: {
    id: 'valdoria', name: 'VALDORIA', subtitle: 'Cuna de la Gema Celestial', chapter: 'CAPÍTULO I',
    width: 2800, height: 1900, spawn: { x: 700, y: 1185 },
    palette: { base: '#263d2b', base2: '#1b2c21', path: '#5b5034', path2: '#756544', water: '#183f4b', water2: '#2c7180', glow: '#d7c17d', fog: '#16251d', accent: '#e8d39b' },
    time: '06:40', weather: 'pollen',
  },
  drakmor: {
    id: 'drakmor', name: 'DRAKMOR', subtitle: 'Donde la montaña aprendió a arder', chapter: 'CAPÍTULO II',
    width: 2600, height: 1800, spawn: { x: 170, y: 920 },
    palette: { base: '#2a1d1b', base2: '#1a1112', path: '#4a3028', path2: '#6c4030', water: '#5d1c12', water2: '#ff6a35', glow: '#ff8a55', fog: '#1b0e0d', accent: '#ffb27c' },
    time: '18:20', weather: 'embers',
  },
  kansordore: {
    id: 'kansordore', name: 'KANSORDORE', subtitle: 'El templo que sostiene el cielo', chapter: 'CAPÍTULO III',
    width: 2400, height: 1800, spawn: { x: 220, y: 930 },
    palette: { base: '#202838', base2: '#151b2b', path: '#69657a', path2: '#918aa4', water: '#1b2f52', water2: '#66a9cf', glow: '#b9d8ff', fog: '#121828', accent: '#e4d7b6' },
    time: '23:59', weather: 'stars',
  },
};

export const ENEMY_TYPES = {
  gelmo: {
    id: 'gelmo', name: 'Gelmo de musgo', title: 'CRIATURA DE VALDORIA', hp: 42, atk: 8, def: 1, speed: 46, radius: 20,
    xp: 22, gold: [3, 8], aggro: 230, attackRange: 52, cooldown: 1.4, color: '#5e9c62', accent: '#b8e38e', shape: 'slime', tier: 1,
  },
  lobo: {
    id: 'lobo', name: 'Lobo de bruma', title: 'DEPREDADOR DEL BOSQUE', hp: 55, atk: 11, def: 2, speed: 92, radius: 20,
    xp: 30, gold: [5, 12], aggro: 300, attackRange: 60, cooldown: 1.1, color: '#5a5b73', accent: '#c3c7e8', shape: 'wolf', tier: 1,
  },
  bandido: {
    id: 'bandido', name: 'Saqueador de Vael', title: 'MERCENARIO', hp: 70, atk: 13, def: 4, speed: 76, radius: 20,
    xp: 38, gold: [10, 22], aggro: 280, attackRange: 62, cooldown: 1.3, color: '#6f4d39', accent: '#d0a06c', shape: 'bandit', tier: 2,
  },
  caballero: {
    id: 'caballero', name: 'Caballero Cenizo', title: 'GUARDIÁN CORROMPIDO', hp: 110, atk: 17, def: 8, speed: 62, radius: 22,
    xp: 55, gold: [15, 30], aggro: 300, attackRange: 70, cooldown: 1.5, color: '#59606a', accent: '#c5ccd4', shape: 'knight', tier: 2,
  },
  sabueso: {
    id: 'sabueso', name: 'Sabueso de magma', title: 'BESTIA DE DRAKMOR', hp: 92, atk: 18, def: 4, speed: 104, radius: 20,
    xp: 50, gold: [12, 24], aggro: 340, attackRange: 58, cooldown: 1.0, color: '#8f3f2f', accent: '#ffa46a', shape: 'hound', tier: 2,
  },
  golem: {
    id: 'golem', name: 'Coloso de basalto', title: 'MÁQUINA DE GUERRA', hp: 180, atk: 24, def: 14, speed: 46, radius: 28,
    xp: 90, gold: [22, 40], aggro: 260, attackRange: 82, cooldown: 1.8, color: '#4a4141', accent: '#ff7549', shape: 'golem', tier: 3,
  },
  centinela: {
    id: 'centinela', name: 'Centinela del Alba', title: 'CONSTRUCTO SAGRADO', hp: 130, atk: 20, def: 10, speed: 70, radius: 22,
    xp: 70, gold: [18, 34], aggro: 330, attackRange: 76, cooldown: 1.4, color: '#8b8b9e', accent: '#c9e4ff', shape: 'sentinel', tier: 3,
  },
  guardian: {
    id: 'guardian', name: 'Guardián de Vael', title: 'GUARDIÁN DE LAS RUINAS', hp: 620, atk: 24, def: 10, speed: 58, radius: 38,
    xp: 300, gold: [120, 160], aggro: 500, attackRange: 104, cooldown: 1.6, color: '#746a58', accent: '#f4d796', shape: 'guardian', tier: 4, boss: true,
    bossPhase: 2, lore: 'Juró proteger la Lágrima incluso después de que su reino olvidara su nombre.'
  },
  forja: {
    id: 'forja', name: 'La Forja Corrupta', title: 'CORAZÓN DE DRAKMOR', hp: 980, atk: 30, def: 14, speed: 52, radius: 46,
    xp: 520, gold: [220, 280], aggro: 560, attackRange: 120, cooldown: 1.5, color: '#59302a', accent: '#ff9a55', shape: 'forge', tier: 5, boss: true,
    bossPhase: 2, lore: 'Una máquina construida para fabricar esperanza. Aprendió a fabricar miedo.'
  },
  vael: {
    id: 'vael', name: 'Vael, Corazón del Velo', title: 'EL PRIMER PORTADOR', hp: 1600, atk: 34, def: 16, speed: 64, radius: 46,
    xp: 1200, gold: [500, 600], aggro: 900, attackRange: 150, cooldown: 1.2, color: '#2a2845', accent: '#e7d7ff', shape: 'vael', tier: 6, boss: true,
    bossPhase: 3, lore: 'Quiso romper el cielo para que nadie volviera a perder a nadie. El cielo se rompió. Nadie volvió.'
  },
};

export const LORE_STONES = [
  { id: 'lore1', region: 'valdoria', x: 1500, y: 1310, title: 'I. La Gema que eligió caer', text: 'Antes de los reinos, una gema cayó del cielo. No cayó porque fuera expulsada: cayó porque quiso aprender qué era el peso. Al tocar la tierra, se rompió en tres lágrimas. Una se hundió. Una ardió. Una despertó.' },
  { id: 'lore2', region: 'valdoria', x: 2110, y: 380, title: 'II. El Primer Portador', text: 'Vael no fue un rey. Fue un niño que encontró una espada en un campo de trigo. La espada le dijo su nombre. Él respondió con el nombre de su hermana. Desde entonces, el Velo escucha.' },
  { id: 'lore3', region: 'drakmor', x: 560, y: 610, title: 'III. La Jarra de Origen', text: 'La Jarra no contiene agua. Contiene la primera decisión del mundo: elegir entre recordar y olvidar. Quien la beba entera verá el rostro de quien creó el Velo. Nadie ha bebido entera.' },
  { id: 'lore4', region: 'drakmor', x: 2130, y: 1280, title: 'IV. La Ruptura', text: 'Cuando Vael rasgó el cielo, no salió un monstruo. Salió silencio. El silencio se llama Velo. Y el Velo no odia: solo tiene hambre de lo que no puede nombrar.' },
  { id: 'lore5', region: 'kansordore', x: 980, y: 480, title: 'V. La Profecía de Jugador Cero', text: 'Habrá un jugador que no juegue para ganar. Llevará una espada que recuerda. Ante la Convergencia, no elegirá salvar el mundo: elegirá qué mundo merece ser salvado. Ese es el Jugador Cero.' },
  { id: 'lore6', region: 'kansordore', x: 1770, y: 1220, title: 'VI. La Ascensión', text: 'No es subir. Es aceptar. La Espada no corona a nadie: desnuda. Al final, el Portador comprende que el Velo no separa el mundo del vacío. Separa al mundo de su propia memoria.' },
];

export const MAIN_STORY = [
  {
    id: 'prologue', kicker: 'HACE MIL AÑOS · EL PRIMER ALBA',
    lines: [
      'La Gema Celestial cayó sobre un mundo sin nombre. Al tocar la tierra, se rompió en tres lágrimas: una se hundió en la piedra, una ardió en la montaña y una despertó en el corazón de un niño.',
      'El niño se llamó Vael. La Espada le dijo su nombre. Él respondió con el nombre de su hermana. Y el Velo, que todo lo escucha, aprendió a tener hambre.',
      'Hoy, en Valdoria, una grieta cruza el cielo como una cicatriz. Los animales huyen. Las estrellas parpadean en el orden equivocado. Y tú despiertas en el santuario de Lumen sin recordar tu nombre.',
    ]
  },
  {
    id: 'awakening', kicker: 'VALDORIA · SANTUARIO DE LUMEN',
    lines: [
      'El agua del santuario refleja un cielo que no es el tuyo. En tu mano, una marca de luz late al ritmo de algo que se acerca.',
      'Una voz te llama desde la plaza. No recuerdas su rostro, pero tu corazón sí.',
    ]
  },
  {
    id: 'vael_reveal', kicker: 'KANSORDORE · EL PRIMER ALBA',
    lines: [
      'El Velo se abre. Al otro lado no hay monstruos. Hay un niño sentado en un campo de trigo, con una espada demasiado grande para sus manos.',
      '—También te dijeron que eras el elegido —dice Vael—. Nadie te dijo que el mundo no estaba esperando a un héroe. Estaba esperando a alguien que se atreviera a mirarlo.',
      'La Espada reconoce a su primer portador. Y tú comprendes, demasiado tarde, que la Profecía nunca habló de vencer. Habló de elegir.',
    ]
  }
];

export const ENDINGS = {
  ascension: {
    title: 'La Ascensión',
    text: 'Forjaste un nuevo Velo con tu propia memoria. El cielo dejó de sangrar. Valdoria volvió a tener noches limpias, Drakmor aprendió a apagar sus hornos y Kansordore olvidó tu nombre. Pero cada amanecer, una espada aparece clavada en un campo de trigo, esperando a alguien que se atreva a preguntar. La Gema Celestial no se apagó: aprendió a dormir.',
  },
  rupture: {
    title: 'La Ruptura',
    text: 'Rompiste el Velo. El mundo vio por primera vez lo que había al otro lado: no un vacío, sino un espejo. Los reinos se miraron a los ojos y descubrieron que llevaban mil años siendo el mismo sueño. No hubo dioses que salvaran el día. Hubo personas que decidieron recordar. Y la Espada, al fin, dejó de hablar.',
  },
  convergence: {
    title: 'La Convergencia',
    text: 'No elegiste salvar el Velo ni romperlo. Elegiste escucharlo. Las tres Luces se reunieron en tu mano y el Velo dejó de ser una herida para convertirse en una puerta. Vael no fue derrotado: fue recordado. Y por primera vez en mil años, el mundo no necesitó un héroe. Necesitó una historia. La escribisteis juntos.',
  }
};

export const NPCS = {
  elara: { name: 'Elara', role: 'Maestra de la Resonancia', color: '#d8c39e', hair: '#e8e0cf', robe: '#394e65', accent: '#c9b47a' },
  ordan: { name: 'Ordan', role: 'Herrero de Lumen', color: '#b67e52', hair: '#5d2e1c', robe: '#6b3d2a', accent: '#d9a45e' },
  mira: { name: 'Mira', role: 'Niña de Lumen', color: '#d6a17d', hair: '#7c4b2b', robe: '#8a6a9e', accent: '#e7c86d' },
  nyx: { name: 'Nyx', role: 'Cazadora de Drakmor', color: '#c59074', hair: '#1f1b2b', robe: '#3c2d3e', accent: '#d37b5b' },
  solen: { name: 'Solen', role: 'Archivista del Velo', color: '#d7b99a', hair: '#c8d4e5', robe: '#3e4c6e', accent: '#a9c8e8' },
  vael: { name: 'Vael', role: 'El Primer Portador', color: '#cdb9a1', hair: '#e4ddc9', robe: '#2b2944', accent: '#d9c7ff' },
};

export const REGION_MUSIC = {
  valdoria: { root: 196, scale: [0, 2, 4, 7, 9], tempo: 72, mood: 'pastoral' },
  drakmor: { root: 146.83, scale: [0, 1, 5, 7, 8], tempo: 84, mood: 'dark' },
  kansordore: { root: 220, scale: [0, 2, 4, 7, 11], tempo: 64, mood: 'celestial' },
  menu: { root: 174.61, scale: [0, 3, 5, 7, 10], tempo: 60, mood: 'mystic' },
};
