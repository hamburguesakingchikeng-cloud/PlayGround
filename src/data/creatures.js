export const CREATURES = {
  lumito: {
    id: 'lumito', name: 'Lumito', title: 'Zorro de Luz', type: 'Luz', rarity: 'common', region: 'Valdoria',
    desc: 'Un zorro hecho de destellos. Roba pequeños objetos brillantes y devuelve los que no le sirven.',
    passive: '+8% velocidad de movimiento', passiveId: 'speed', passiveVal: 8,
    ability: 'Zarpazo de Luz', abilityDesc: 'Se lanza en línea recta, dañando a los enemigos y cegándolos.',
    cooldown: 18, power: 1.1, palette: ['#f7e6a8', '#e8b95e', '#fff8dd'], draw: 'fox'
  },
  flic: {
    id: 'flic', name: 'Flic', title: 'Polilla de Brasa', type: 'Fuego', rarity: 'common', region: 'Valdoria',
    desc: 'Sus alas dejan una estela de chispas. Duerme dentro de las linternas encendidas.',
    passive: '+12% daño de fuego y quemadura al golpear', passiveId: 'burn', passiveVal: 12,
    ability: 'Explosión de Polvo', abilityDesc: 'Libera una nube de esporas ardientes alrededor del objetivo.',
    cooldown: 16, power: 1.0, palette: ['#ffb15e', '#e85d3f', '#ffe2a8'], draw: 'moth'
  },
  musgo: {
    id: 'musgo', name: 'Musgo', title: 'Espíritu del Bosque', type: 'Tierra', rarity: 'rare', region: 'Valdoria',
    desc: 'Una criatura redonda cubierta de helechos. Ronca y, al hacerlo, las flores crecen.',
    passive: 'Regenera 1,5 de vida por segundo', passiveId: 'regen', passiveVal: 1.5,
    ability: 'Abrazo Verde', abilityDesc: 'Te cura un 35% de la vida máxima y elimina efectos negativos.',
    cooldown: 30, power: 0, palette: ['#7fbf7a', '#3f7b4f', '#d4e8a8'], draw: 'blob'
  },
  nix: {
    id: 'nix', name: 'Nix', title: 'Ondina del Río', type: 'Agua', rarity: 'rare', region: 'Valdoria',
    desc: 'Una niña de agua que corre por los arroyos. Llora cuando el río se ensucia y ríe cuando llueve.',
    passive: '+20 maná máximo y +15% regeneración de maná', passiveId: 'mana', passiveVal: 20,
    ability: 'Burbuja de Marea', abilityDesc: 'Te envuelve en una burbuja que absorbe daño durante 6 segundos.',
    cooldown: 24, power: 1.2, palette: ['#8fd8e8', '#3e87b8', '#e5fbff'], draw: 'sprite'
  },
  roca: {
    id: 'roca', name: 'Roco', title: 'Canto Vivo', type: 'Tierra', rarity: 'common', region: 'Valdoria',
    desc: 'Una piedra con opiniones. Se enamoró de un puente y se niega a moverse de su lado.',
    passive: '+4 defensa', passiveId: 'def', passiveVal: 4,
    ability: 'Muro de Piedra', abilityDesc: 'Invoca tres pilares que bloquean proyectiles y aturden enemigos.',
    cooldown: 26, power: .8, palette: ['#a9a08e', '#5d584f', '#e0d6bf'], draw: 'rock'
  },
  cuervo: {
    id: 'cuervo', name: 'Noct', title: 'Cuervo de Agüero', type: 'Aire', rarity: 'rare', region: 'Valdoria',
    desc: 'Ve un segundo del futuro y se ríe de lo que encuentra. Nunca se equivoca, pero tampoco avisa.',
    passive: '+8% probabilidad de crítico', passiveId: 'crit', passiveVal: 8,
    ability: 'Presagio', abilityDesc: 'Marca al enemigo más cercano: recibe 25% más daño durante 8 segundos.',
    cooldown: 20, power: .7, palette: ['#5d6580', '#232838', '#c7d0e8'], draw: 'bird'
  },
  salamandra: {
    id: 'salamandra', name: 'Ignis', title: 'Salamandra de Forja', type: 'Fuego', rarity: 'rare', region: 'Drakmor',
    desc: 'Nació dentro de un crisol y considera que el hierro fundido es una cama caliente.',
    passive: '+10% daño de ataque', passiveId: 'atk', passiveVal: 10,
    ability: 'Aliento de Forja', abilityDesc: 'Exhala una llama que quema a todos los enemigos en un cono.',
    cooldown: 18, power: 1.3, palette: ['#ff9a4d', '#c4382e', '#ffe8b0'], draw: 'lizard'
  },
  cenizo: {
    id: 'cenizo', name: 'Cenizo', title: 'Sabueso de Ceniza', type: 'Sombra', rarity: 'common', region: 'Drakmor',
    desc: 'Un perro que murió en la erupción y decidió quedarse a cuidar a los vivos.',
    passive: '+10% velocidad de ataque', passiveId: 'aspd', passiveVal: 10,
    ability: 'Aullido Fúnebre', abilityDesc: 'Aumenta tu ataque un 30% durante 8 segundos y atemoriza a los enemigos.',
    cooldown: 28, power: .9, palette: ['#8f8b8d', '#3d3740', '#ff9a68'], draw: 'hound'
  },
  obsidiana: {
    id: 'obsidiana', name: 'Varka', title: 'Corazón de Obsidiana', type: 'Tierra', rarity: 'epic', region: 'Drakmor',
    desc: 'Un golem pequeño con un corazón de lava. Cuando se enfada, el suelo tiembla bajo sus pies.',
    passive: '+8 defensa y +10 vida máxima', passiveId: 'def', passiveVal: 8,
    ability: 'Sello de Basalto', abilityDesc: 'Te cubre de roca viva: +40 defensa y no puedes ser empujado durante 7 s.',
    cooldown: 34, power: .5, palette: ['#5a4b4e', '#241d26', '#ff7a48'], draw: 'golem'
  },
  luciernaga: {
    id: 'luciernaga', name: 'Sera', title: 'Luciérnaga Celestial', type: 'Celestial', rarity: 'epic', region: 'Kansordore',
    desc: 'Una chispa de la Gema que aprendió a volar. Ilumina las páginas de los libros prohibidos.',
    passive: '+2 maná por segundo', passiveId: 'mregen', passiveVal: 2,
    ability: 'Coro de Luz', abilityDesc: 'Restaura 40 de maná y reduce un 40% el coste de tus habilidades durante 10 s.',
    cooldown: 32, power: .6, palette: ['#fff2b0', '#e8c45e', '#fffbe8'], draw: 'firefly'
  },
  grifo: {
    id: 'grifo', name: 'Aerion', title: 'Grifo de Altura', type: 'Aire', rarity: 'epic', region: 'Kansordore',
    desc: 'Mitad águila, mitad león, completamente orgulloso. Solo obedece a quien puede mirarle a los ojos.',
    passive: '+15% velocidad de ataque y +5% movimiento', passiveId: 'aspd', passiveVal: 15,
    ability: 'Picado Celeste', abilityDesc: 'Se lanza desde el cielo sobre la zona objetivo, causando daño masivo.',
    cooldown: 22, power: 1.8, palette: ['#e8e0c8', '#b89450', '#fff8e8'], draw: 'griffin'
  },
  aurora: {
    id: 'aurora', name: 'Aurora', title: 'La Primera Nota', type: 'Celestial', rarity: 'legendary', region: 'Kansordore',
    desc: 'No es una criatura: es el recuerdo de la primera canción del mundo tomando forma de zorra blanca. Solo aparece ante quien ha escuchado todas las canciones.',
    passive: 'Revives una vez por descanso con el 50% de vida', passiveId: 'revive', passiveVal: 50,
    ability: 'Amanecer', abilityDesc: 'Cura un 50% y golpea a todos los enemigos cercanos con luz pura.',
    cooldown: 45, power: 2.0, palette: ['#f4f0ff', '#a8c8ff', '#ffe6b8'], draw: 'aurora', secret: true
  }
};

export const CREATURE_ORDER = ['lumito', 'flic', 'musgo', 'nix', 'roca', 'cuervo', 'salamandra', 'cenizo', 'obsidiana', 'luciernaga', 'grifo', 'aurora'];

export const CREATURE_TYPES = {
  Luz: '#ffe2a0', Fuego: '#ff8a5e', Agua: '#7ec8ee', Tierra: '#a8b87a', Aire: '#c8d8f0', Sombra: '#b48ce8', Celestial: '#f0e8b0'
};
