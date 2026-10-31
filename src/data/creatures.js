export const CREATURES = {
  lumifin: {
    name: 'Lumifín', region: 'Valdoria', role: 'Apoyo', element: 'Luz', rarity: 'Común',
    color: 0x9fe8ff, accent: 0xffffff, glyph: '❖', model: 'fox',
    hp: 60, attack: 8, cooldown: 14, captureBase: .32,
    lore: 'Zorros de cola luminosa que duermen bajo las raíces de los sauces. Su luz no quema: recuerda.',
    ability: 'Destello de Lumen', abilityDesc: 'Restaura un 32 % de tu vida y purga la corrupción cercana.',
    passive: 'Regeneración: +2 vida/s fuera de combate.'
  },
  bramiel: {
    name: 'Bramiel', region: 'Valdoria', role: 'Tanque', element: 'Naturaleza', rarity: 'Raro',
    color: 0x8fd6a0, accent: 0xd9ffb0, glyph: '♧', model: 'stag',
    hp: 110, attack: 11, cooldown: 18, captureBase: .22,
    lore: 'Ciervos de musgo antiguo. Cada cuerno guarda una estación distinta y ninguna quiere ceder el turno.',
    ability: 'Piel de Corteza', abilityDesc: 'Te otorga un escudo de 45 puntos y reduce el daño un 20 % durante 8 s.',
    passive: 'Raíces: +10 % defensa mientras esté invocado.'
  },
  grimpola: {
    name: 'Grímpola', region: 'Valdoria', role: 'Ataque', element: 'Tormenta', rarity: 'Raro',
    color: 0x8ab9ff, accent: 0xfff1a8, glyph: '⌁', model: 'bird',
    hp: 55, attack: 16, cooldown: 12, captureBase: .24,
    lore: 'Aves que anidan en las torres de los molinos. Cuando baten las alas, el cielo cambia de opinión.',
    ability: 'Cadena de Céfiro', abilityDesc: 'Un rayo salta entre hasta 4 enemigos y los electrocuta.',
    passive: 'Viento a favor: +5 % velocidad de movimiento.'
  },
  brasal: {
    name: 'Brasal', region: 'Drakmor', role: 'Ataque', element: 'Fuego', rarity: 'Raro',
    color: 0xff8a4c, accent: 0xffe09a, glyph: '▲', model: 'salamander',
    hp: 75, attack: 19, cooldown: 13, captureBase: .2,
    lore: 'Salamandras nacidas en la primera grieta. No comen: devoran el calor de las cosas que van a morir.',
    ability: 'Corona de Brasas', abilityDesc: 'Explosión de fuego alrededor que quema a los enemigos durante 6 s.',
    passive: 'Aura ígnea: los enemigos cercanos reciben daño leve.'
  },
  umbrino: {
    name: 'Umbrino', region: 'Drakmor', role: 'Asesino', element: 'Sombra', rarity: 'Épico',
    color: 0x8f7cc9, accent: 0xe0b8ff, glyph: '◐', model: 'cat',
    hp: 65, attack: 22, cooldown: 15, captureBase: .16,
    lore: 'Felinos que caminan por el envés de las sombras. Nunca ves dos veces al mismo Umbrino.',
    ability: 'Zarpazo del Envés', abilityDesc: 'Se desvanece y reaparece tras el enemigo con un golpe crítico garantizado.',
    passive: 'Instinto: +8 % probabilidad de crítico.'
  },
  cineronte: {
    name: 'Cineronte', region: 'Drakmor', role: 'Tanque', element: 'Ceniza', rarity: 'Raro',
    color: 0xa68f78, accent: 0xffb27a, glyph: '⬢', model: 'turtle',
    hp: 150, attack: 12, cooldown: 20, captureBase: .2,
    lore: 'Tortugas que cargan montañas en el caparazón. Cuando una montaña se cansa, la dejan descansar.',
    ability: 'La Montaña Recuerda', abilityDesc: 'Provoca a los enemigos y reduce el daño recibido un 35 % durante 7 s.',
    passive: 'Coraza: +18 % vida máxima.'
  },
  petreluz: {
    name: 'Petreluz', region: 'Kansordore', role: 'Control', element: 'Cosmos', rarity: 'Épico',
    color: 0xa6e5ff, accent: 0xe7c6ff, glyph: '✺', model: 'jelly',
    hp: 70, attack: 15, cooldown: 16, captureBase: .15,
    lore: 'Medusas que flotan entre las islas del cielo. Su campana contiene un instante que nunca termina de ocurrir.',
    ability: 'Instante Prestado', abilityDesc: 'Ralentiza a los enemigos un 55 % durante 5 s y acelera tus hechizos.',
    passive: 'Marea lunar: +15 % regeneración de maná.'
  },
  celemn: {
    name: 'Celemn', region: 'Kansordore', role: 'Legendario', element: 'Luz', rarity: 'Legendario',
    color: 0xffe0a0, accent: 0x9fe8ff, glyph: '✦', model: 'dragon',
    hp: 95, attack: 30, cooldown: 22, captureBase: .07,
    lore: 'El último dragón de bolsillo del primer cielo. Se dice que cabe en una mano porque el mundo aún no está listo para verlo entero.',
    ability: 'Aliento de la Primera Luz', abilityDesc: 'Un rayo celestial atraviesa el campo y deja cegados a los supervivientes.',
    passive: 'Majestad: +10 % a todas las estadísticas.'
  }
}

export const CREATURE_IDS = Object.keys(CREATURES)

export const CAPTURE_ORB_ANIM = 'resonancia'
