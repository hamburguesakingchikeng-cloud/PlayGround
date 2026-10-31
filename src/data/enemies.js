export const ENEMIES = {
  lobo_ceniza: {
    id: 'lobo_ceniza', name: 'Lobo de Ceniza', level: 2, hp: 42, damage: 9, speed: 112, radius: 17,
    xp: 20, gold: 7, ai: 'chaser', range: 48, windup: .38, recover: .55, creature: 'lumito', tame: .3,
    scale: 1, draw: 'wolf', palette: ['#5d5660', '#2e2933', '#e8a25e'], drops: ['colmillo'], dropChance: .4
  },
  espectro_lumen: {
    id: 'espectro_lumen', name: 'Espectro de Lumen', level: 3, hp: 34, damage: 11, speed: 74, radius: 15,
    xp: 24, gold: 9, ai: 'ranged', range: 250, windup: .55, recover: .9, creature: 'flic', tame: .26,
    scale: 1, draw: 'wisp', palette: ['#a8e6d8', '#3c8d84', '#e8fff8'], projectile: 'orb', drops: ['esencia'], dropChance: .35
  },
  bandido: {
    id: 'bandido', name: 'Bandido del Camino', level: 3, hp: 58, damage: 12, speed: 95, radius: 18,
    xp: 28, gold: 18, ai: 'chaser', range: 50, windup: .32, recover: .5, creature: 'cuervo', tame: .12,
    scale: 1, draw: 'bandit', palette: ['#8f6c4a', '#3b2a24', '#c8a778'], drops: ['pocion_menor'], dropChance: .25
  },
  golem_runico: {
    id: 'golem_runico', name: 'Golem Rúnico', level: 4, hp: 96, damage: 16, speed: 55, radius: 23,
    xp: 40, gold: 15, ai: 'brute', range: 60, windup: .62, recover: .8, creature: 'roca', tame: .24,
    scale: 1.08, draw: 'golem', palette: ['#8d8a80', '#4e4b48', '#7fe0d0'], drops: ['esencia'], dropChance: .5
  },
  ondina_corrupta: {
    id: 'ondina_corrupta', name: 'Ondina Corrupta', level: 4, hp: 62, damage: 13, speed: 85, radius: 17,
    xp: 34, gold: 12, ai: 'ranged', range: 210, windup: .48, recover: .8, creature: 'nix', tame: .25,
    scale: 1, draw: 'sprite', palette: ['#6f9ec8', '#2a4666', '#c0e8ff'], projectile: 'bolt', drops: ['esencia'], dropChance: .3
  },
  espiritu_musgo: {
    id: 'espiritu_musgo', name: 'Espíritu de Musgo', level: 5, hp: 88, damage: 14, speed: 62, radius: 21,
    xp: 38, gold: 11, ai: 'brute', range: 55, windup: .55, recover: .75, creature: 'musgo', tame: .28,
    scale: 1.05, draw: 'blob', palette: ['#6f9e62', '#31553a', '#c8e8a0'], drops: ['flor_lumen'], dropChance: .45
  },
  guardian_espectral: {
    id: 'guardian_espectral', name: 'Guardián Espectral', level: 8, hp: 760, damage: 18, speed: 68, radius: 44,
    xp: 260, gold: 120, ai: 'boss', range: 95, windup: .7, recover: .9, creature: null,
    scale: 1.9, draw: 'guardian', boss: true, title: 'Último guardián del Bosque de Lumen',
    palette: ['#8fe0c8', '#1d4f48', '#fff2c0'], drops: ['fragmento_gema'], dropChance: 1
  },
  kael: {
    id: 'kael', name: 'Kael, Caballero del Velo', level: 10, hp: 880, damage: 22, speed: 125, radius: 26,
    xp: 320, gold: 140, ai: 'boss', range: 90, windup: .42, recover: .55, creature: null,
    scale: 1.2, draw: 'knight', boss: true, title: 'El que juró proteger la grieta',
    palette: ['#4f5570', '#151826', '#b8a8ff'], drops: ['esencia'], dropChance: 1
  },
  salamandra_forja: {
    id: 'salamandra_forja', name: 'Salamandra de Forja', level: 8, hp: 82, damage: 16, speed: 102, radius: 18,
    xp: 48, gold: 16, ai: 'chaser', range: 52, windup: .3, recover: .45, creature: 'salamandra', tame: .24,
    scale: 1, draw: 'salamander', palette: ['#d86b3e', '#5e1f20', '#ffd27a'], projectile: null, drops: ['ascuas'], dropChance: .5
  },
  cultista_ceniza: {
    id: 'cultista_ceniza', name: 'Cultista de la Ceniza', level: 9, hp: 64, damage: 15, speed: 88, radius: 17,
    xp: 52, gold: 22, ai: 'ranged', range: 230, windup: .5, recover: .75, creature: 'flic', tame: .1,
    scale: 1, draw: 'cultist', palette: ['#7a2f37', '#26141c', '#ff9c5e'], projectile: 'fire', drops: ['pocion_mayor'], dropChance: .2
  },
  demonio_forja: {
    id: 'demonio_forja', name: 'Demonio de la Forja', level: 10, hp: 126, damage: 21, speed: 76, radius: 23,
    xp: 66, gold: 26, ai: 'brute', range: 62, windup: .55, recover: .7, creature: 'cenizo', tame: .12,
    scale: 1.08, draw: 'demon', palette: ['#8f3b2e', '#2a1014', '#ff9a48'], drops: ['esencia'], dropChance: .4
  },
  obsidiana_viva: {
    id: 'obsidiana_viva', name: 'Corazón de Obsidiana', level: 11, hp: 158, damage: 24, speed: 60, radius: 26,
    xp: 80, gold: 32, ai: 'brute', range: 66, windup: .65, recover: .85, creature: 'obsidiana', tame: .12,
    scale: 1.15, draw: 'golem', palette: ['#4a3e46', '#1b141c', '#ff6a3e'], drops: ['esencia'], dropChance: .55
  },
  malachar: {
    id: 'malachar', name: 'Malachar, Rey Ceniciento', level: 14, hp: 1680, damage: 26, speed: 84, radius: 50,
    xp: 520, gold: 260, ai: 'boss', range: 110, windup: .62, recover: .75, creature: null,
    scale: 2.05, draw: 'malachar', boss: true, title: 'El primer rey que escuchó el Velo',
    palette: ['#7e3e2c', '#1d1013', '#ffb050'], drops: ['lagrima_brasa'], dropChance: 1
  },
  centinela_celeste: {
    id: 'centinela_celeste', name: 'Centinela Celeste', level: 13, hp: 136, damage: 20, speed: 82, radius: 20,
    xp: 78, gold: 30, ai: 'ranged', range: 260, windup: .5, recover: .8, creature: 'luciernaga', tame: .14,
    scale: 1.05, draw: 'sentinel', palette: ['#d8d2b0', '#6d6a56', '#fff2b0'], projectile: 'light', drops: ['eco'], dropChance: .4
  },
  serafin_menor: {
    id: 'serafin_menor', name: 'Serafín Menor', level: 14, hp: 112, damage: 22, speed: 118, radius: 19,
    xp: 84, gold: 34, ai: 'flyer', range: 58, windup: .38, recover: .5, creature: 'grifo', tame: .1,
    scale: 1, draw: 'seraph', palette: ['#e8e2c8', '#9a8a5a', '#fff8e0'], drops: ['eco'], dropChance: .35
  },
  sombra_velo: {
    id: 'sombra_velo', name: 'Sombra del Velo', level: 12, hp: 78, damage: 18, speed: 138, radius: 17,
    xp: 60, gold: 24, ai: 'charger', range: 54, windup: .32, recover: .5, creature: 'cenizo', tame: .1,
    scale: 1, draw: 'shadow', palette: ['#554f74', '#161222', '#b8a0ff'], drops: ['esencia'], dropChance: .3
  },
  coro_absoluto: {
    id: 'coro_absoluto', name: 'Seraphine, Coro Absoluto', level: 18, hp: 2400, damage: 30, speed: 100, radius: 54,
    xp: 900, gold: 500, ai: 'boss', range: 120, windup: .55, recover: .7, creature: null,
    scale: 2.2, draw: 'seraphine', boss: true, title: 'La voz que quiso cantar sola',
    palette: ['#f0e8c0', '#8a7c4a', '#fffbe0'], drops: ['espada_celestial'], dropChance: 1
  }
};

export const BOSS_INTROS = {
  guardian_espectral: { title: 'GUARDIÁN ESPECTRAL', sub: 'El bosque recuerda a sus muertos' },
  kael: { title: 'KAEL, CABALLERO DEL VELO', sub: 'Un juramento puede ser una jaula' },
  malachar: { title: 'MALACHAR, REY CENICIENTO', sub: 'La primera brasa también sabe llorar' },
  coro_absoluto: { title: 'SERAPHINE, CORO ABSOLUTO', sub: 'El silencio que se disfraza de canción' },
};

export function getEnemy(id) { return ENEMIES[id] || null; }
