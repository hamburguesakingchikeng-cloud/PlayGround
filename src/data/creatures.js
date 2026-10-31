// Resonancias: criaturas coleccionables, sus ecos y sus lazos.
export const ELEMENTS = {
  naturaleza: { name: 'Naturaleza', color: '#8fd18a', icon: '❧' },
  fuego: { name: 'Fuego', color: '#ff9a5c', icon: '✦' },
  luz: { name: 'Luz', color: '#ffe7a8', icon: '☼' },
  sombra: { name: 'Sombra', color: '#b49ad9', icon: '☾' },
  cristal: { name: 'Cristal', color: '#9fe8ff', icon: '◇' },
};

export const CREATURES = {
  musgo: {
    name: 'Musgo Luminoso', element: 'naturaleza', role: 'Apoyo', rarity: 0, sprite: 'slime',
    colors: ['#7fbf6a', '#c9f29a', '#4d7a4a'], captureBase: 0.55,
    desc: 'Una colonia de musgo que aprendió a latir. Se esconde en las raíces de los árboles viejos y brilla cuando alguien está triste.',
    lore: 'Los aldeanos de Valdoria dicen que cada Musgo Luminoso guarda el último aliento de un bosque que ardió en otra era. No es cierto. Guardan algo más pequeño: la primera vez que alguien se detuvo a mirarlos.',
    active: { name: 'Pulso Vital', desc: 'Restaura un 28% de vida durante 4 s y limpia quemaduras.', cooldown: 18 },
    passive: { name: 'Savia Viva', desc: 'Regeneras 2 de vida por segundo.', stats: { hpRegen: 2 } },
    ascended: 'Musgo del Alba',
  },
  wolf: {
    name: 'Lobo de Espino', element: 'naturaleza', role: 'Depredador', rarity: 1, sprite: 'wolf',
    colors: ['#5d6b55', '#a9c98a', '#2f3a2f'], captureBase: 0.42,
    desc: 'Cazador de los bosques de Valdoria. Sus espinas no son defensa: son el recuerdo de cada rama que lo hirió.',
    lore: 'No aúlla a la luna. Aúlla a los caminos que ya no puede recorrer. Los peregrinos que responden a su llamada descubren que el Lobo de Espino siempre estaba esperando compañía.',
    active: { name: 'Embestida Espinosa', desc: 'Se lanza hacia el enemigo y provoca sangrado durante 5 s.', cooldown: 14 },
    passive: { name: 'Paso Salvaje', desc: 'Aumenta tu velocidad un 5%.', stats: { speedPct: 0.05 } },
    ascended: 'Lobo de la Espina Blanca',
  },
  firefly: {
    name: 'Luciérnaga de Ámbar', element: 'luz', role: 'Control', rarity: 1, sprite: 'moth',
    colors: ['#ffe7a8', '#ffb84d', '#8a6a2a'], captureBase: 0.5,
    desc: 'Una chispa con alas que solo aparece cuando el mundo contiene la respiración. Su luz no ilumina: revela.',
    lore: 'En Kansordore las llaman «las que recuerdan». Cada Luciérnaga es una promesa que alguien hizo en la oscuridad y no pudo cumplir. Brillan más cuanto más cerca está su deudor.',
    active: { name: 'Destello de Ámbar', desc: 'Ciega a los enemigos cercanos durante 3 s y revela secretos.', cooldown: 16 },
    passive: { name: 'Luz de Vigilia', desc: 'Aumenta un 25% el radio de tu luz.', stats: { lightRadius: 0.25 } },
    ascended: 'Luciérnaga del Primer Sol',
  },
  deer: {
    name: 'Ciervo de Cristal', element: 'cristal', role: 'Guardián', rarity: 2, sprite: 'deer',
    colors: ['#bfefff', '#e8fbff', '#5f8fa8'], captureBase: 0.3,
    desc: 'Sus astas crecen en espiral y cantan cuando el viento las roza. Solo se deja ver por quienes caminan sin prisa.',
    lore: 'El Ciervo de Cristal no bebe agua: bebe reflejos. Por eso los ríos de Valdoria guardan formas que nadie recuerda haber visto. Si te mira, una de tus memorias cambia de sitio.',
    active: { name: 'Piel de Cuarzo', desc: 'Otorga un escudo que absorbe daño durante 8 s.', cooldown: 20 },
    passive: { name: 'Corazón de Cristal', desc: 'Aumenta tu defensa en 8.', stats: { def: 8 } },
    ascended: 'Ciervo del Espejo Eterno',
  },
  imp: {
    name: 'Imp de Ceniza', element: 'fuego', role: 'Artillero', rarity: 1, sprite: 'imp',
    colors: ['#ff8a5c', '#ffd08a', '#6a3020'], captureBase: 0.45,
    desc: 'Nace en las grietas de Drakmor, donde el fuego sueña con ser chispa. Roba botones, piedras y secretos.',
    lore: 'Los Imp de Ceniza construyen nidos con cosas que no les pertenecen. Si encuentras tu anillo perdido en uno, no se lo quites: deja algo a cambio. El trueque es la única ley que respetan.',
    active: { name: 'Brasa Errante', desc: 'Lanza una bola de fuego que explota y quema.', cooldown: 12 },
    passive: { name: 'Chispa Adherente', desc: 'Tus ataques tienen un 10% de probabilidad de quemar.', stats: { burnChance: 0.1 } },
    ascended: 'Imp de la Brasa Madre',
  },
  salamander: {
    name: 'Salamandra de Magma', element: 'fuego', role: 'Demoledor', rarity: 2, sprite: 'lizard',
    colors: ['#ff6a3d', '#ffb35c', '#5a1f18'], captureBase: 0.32,
    desc: 'Duerme dentro de la roca líquida y despierta cuando el mundo tiembla. Su piel es un mapa de ríos que ya no existen.',
    lore: 'La Dama de la Brasa la llamaba «hermana pequeña». No porque fueran familia, sino porque ambas nacieron del mismo incendio y eligieron arder de formas distintas.',
    active: { name: 'Ola Ígnea', desc: 'Expande un anillo de fuego que empuja y quema a los enemigos.', cooldown: 16 },
    passive: { name: 'Piel de Magma', desc: 'Reduce el daño de fuego un 25%.', stats: { fireRes: 0.25 } },
    ascended: 'Salamandra del Corazón de Drakmor',
  },
  golem: {
    name: 'Golem de Obsidiana', element: 'cristal', role: 'Coloso', rarity: 2, sprite: 'golem',
    colors: ['#4a4a5e', '#8a7aa8', '#2a2a36'], captureBase: 0.24,
    desc: 'Una montaña que aprendió a caminar. Sus runas se encienden cuando protege a alguien.',
    lore: 'Fue tallado por los primeros herreros de Drakmor para custodiar la Forja. Cuando la Forja se apagó, siguió custodiando el silencio. Ahora que has llegado, no sabe qué proteger.',
    active: { name: 'Sismo de Obsidiana', desc: 'Golpea el suelo y aturde a los enemigos cercanos.', cooldown: 22 },
    passive: { name: 'Muro Vivo', desc: 'Reduce todo el daño recibido un 8%.', stats: { damageReduction: 0.08 } },
    ascended: 'Golem del Yunque Eterno',
  },
  raven: {
    name: 'Cuervo de Humo', element: 'sombra', role: 'Explorador', rarity: 2, sprite: 'bird',
    colors: ['#5a4a6e', '#a08ab8', '#241c30'], captureBase: 0.34,
    desc: 'No tiene plumas: tiene jirones de noche. Se posa en los hombros de quienes están a punto de decidir algo importante.',
    lore: 'El Cuervo de Humo no roba objetos. Roba la última palabra de las conversaciones. Si alguna vez olvidas lo que ibas a decir, quizá esté en su nido.',
    active: { name: 'Veladura', desc: 'Te vuelve invisible durante 3 s y deja un señuelo.', cooldown: 20 },
    passive: { name: 'Pluma de Sombra', desc: 'Reduce el enfriamiento de esquiva un 15%.', stats: { dodgeCd: 0.15 } },
    ascended: 'Cuervo del Velo Rasgado',
  },
  sentinel: {
    name: 'Centinela de Luz', element: 'luz', role: 'Centinela', rarity: 3, sprite: 'orb',
    colors: ['#ffe7a8', '#fffbe8', '#b8924a'], captureBase: 0.22,
    desc: 'Un ojo de cristal que vela los templos de Kansordore. No parpadea porque no duerme, y no duerme porque ya no sueña.',
    lore: 'Los Centinelas fueron creados para vigilar el Velo. Con el tiempo olvidaron qué había detrás. Ahora vigilan el hueco que dejó su propia pregunta.',
    active: { name: 'Rayo del Alba', desc: 'Dispara un rayo de luz que atraviesa a todos los enemigos en línea.', cooldown: 18 },
    passive: { name: 'Ojo Abierto', desc: 'Regeneras 2 de maná por segundo.', stats: { manaRegen: 2 } },
    ascended: 'Centinela del Sol Sin Ocaso',
  },
  seraph: {
    name: 'Serafín Corrupto', element: 'luz', role: 'Ejecutor', rarity: 3, sprite: 'angel',
    colors: ['#ffe7a8', '#c7a4ff', '#6a5a8a'], captureBase: 0.18,
    desc: 'Un ángel que miró demasiado tiempo el Velo. Sus alas siguen siendo blancas; sus ojos ya no.',
    lore: 'Los Serafines juraron proteger la Convergencia. Cuando entendieron lo que la Convergencia exigía, algunos aceptaron. Los que no, fueron llamados corruptos. La historia la escribieron los que aceptaron.',
    active: { name: 'Ala de Juicio', desc: 'Desata una ráfaga de plumas que corta y empuja.', cooldown: 17 },
    passive: { name: 'Gracia Marchita', desc: 'Aumenta tu probabilidad de crítico un 5%.', stats: { crit: 5 } },
    ascended: 'Serafín de la Verdad Desnuda',
  },
  abyss: {
    name: 'Aberración del Velo', element: 'sombra', role: 'Devorador', rarity: 3, sprite: 'eye',
    colors: ['#7d6a9e', '#c7a4ff', '#1e1628'], captureBase: 0.16,
    desc: 'Lo que queda de una criatura que miró el Velo y decidió mirar más adentro. Flota sin tocar el suelo para no recordar que existe.',
    lore: 'No es un monstruo. Es una pregunta con hambre. Si la capturas, te susurrará tu nombre verdadero. Tú decides si escucharlo.',
    active: { name: 'Marea Vacía', desc: 'Atrae a los enemigos y les roba vida durante 4 s.', cooldown: 24 },
    passive: { name: 'Hambre de Eco', desc: 'Robas un 4% del daño infligido como vida.', stats: { lifesteal: 0.04 } },
    ascended: 'Aberración del Nombre Verdadero',
  },
  aurel: {
    name: 'Aurel, Eco del Origen', element: 'luz', role: 'Legendario', rarity: 4, sprite: 'spirit',
    colors: ['#fff3c4', '#ffd98a', '#b8924a'], captureBase: 0.1,
    desc: 'El primer eco que la Jarra de Origen dejó al despertar. Tiene forma de zorro porque así lo recuerda el mundo, no porque sea un zorro.',
    lore: 'Aurel no es una criatura. Es el hueco que deja una criatura cuando el universo la olvida. Te acompaña porque tú eres el único que todavía se acuerda de su nombre. Eso basta.',
    active: { name: 'Convergencia', desc: 'Ralentiza el tiempo, te cura y potencia a tus aliados durante 5 s.', cooldown: 30 },
    passive: { name: 'Eco Primigenio', desc: 'Aumenta todas tus estadísticas en 3.', stats: { all: 3 } },
    ascended: 'Aurel, el Nombre que Permanece',
  },
};

export const CREATURE_IDS = Object.keys(CREATURES);

export function creatureName(id, bond = 1) {
  const c = CREATURES[id];
  if (!c) return 'Eco desconocido';
  return bond >= 5 ? c.ascended : c.name;
}
export function creatureElement(id) { return ELEMENTS[CREATURES[id]?.element] || ELEMENTS.luz; }
export function creaturePower(id, bond = 1, level = 1) {
  const c = CREATURES[id];
  if (!c) return 0;
  return Math.round((10 + c.rarity * 9 + bond * 6 + level * 3) * (1 + c.rarity * 0.15));
}
