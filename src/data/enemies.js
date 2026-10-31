export const ENEMIES = {
  corrompido: {
    name: 'Corrompido', title: 'Raíz sin nombre', zone: 'valdoria', model: 'goblin', scale: 1,
    hp: 72, damage: 10, speed: 3.1, radius: .65, aggro: 15, attackRange: 2.2, cooldown: 1.8,
    xp: 24, gold: 6, color: 0x3d5c46, accent: 0xa9ff8a,
    loot: [['flor_lumen', .2], ['potion_vida', .12]]
  },
  espina: {
    name: 'Espina Errante', title: 'Semilla del Velo', zone: 'valdoria', model: 'spore', scale: 1,
    hp: 52, damage: 8, speed: 2.2, radius: .7, aggro: 17, attackRange: 12, cooldown: 2.6, ranged: true,
    xp: 22, gold: 7, color: 0x6a5a8a, accent: 0xc9a8ff,
    loot: [['flor_lumen', .3], ['potion_mana', .1]]
  },
  lobo_musgo: {
    name: 'Lobo de Musgo', title: 'Colmillo del bosque', zone: 'valdoria', model: 'wolf', scale: 1.05,
    hp: 62, damage: 9, speed: 4.7, radius: .62, aggro: 20, attackRange: 2, cooldown: 1.3,
    xp: 26, gold: 8, color: 0x4d5a3c, accent: 0xd8ff9a,
    loot: [['hierro_estelar', .08], ['potion_vida', .1]]
  },
  coloso_raiz: {
    name: 'Coloso de Raíz', title: 'Guardián de las Ruinas de Vael', zone: 'valdoria', model: 'colossus', scale: 2.5, boss: true,
    hp: 980, damage: 24, speed: 2.1, radius: 2.4, aggro: 24, attackRange: 4.6, cooldown: 2.6,
    xp: 620, gold: 240, color: 0x5e6a3e, accent: 0xffd77a,
    loot: [['espada_vael', 1], ['elixir_alba', 1]]
  },

  cenicero: {
    name: 'Cenicero', title: 'Soldado de la Ruptura', zone: 'drakmor', model: 'knight', scale: 1.02,
    hp: 118, damage: 14, speed: 3.0, radius: .72, aggro: 16, attackRange: 2.4, cooldown: 1.9,
    xp: 48, gold: 14, color: 0x4a3838, accent: 0xff7348,
    loot: [['memoria_ceniza', .05], ['potion_vida', .2], ['hierro_estelar', .15]]
  },
  aruspice: {
    name: 'Arúspice de Fuego', title: 'Lector de brasas', zone: 'drakmor', model: 'mage', scale: 1,
    hp: 82, damage: 12, speed: 2.4, radius: .68, aggro: 18, attackRange: 13, cooldown: 2.8, ranged: true,
    xp: 46, gold: 16, color: 0x533040, accent: 0xff9a48,
    loot: [['potion_mana', .24], ['memoria_ceniza', .06]]
  },
  sabueso: {
    name: 'Sabueso de Obsidiana', title: 'Cazador de la Grieta', zone: 'drakmor', model: 'hound', scale: 1.12,
    hp: 96, damage: 13, speed: 5.3, radius: .7, aggro: 22, attackRange: 2.1, cooldown: 1.1,
    xp: 50, gold: 15, color: 0x2c2431, accent: 0xff5c3c,
    loot: [['potion_vida', .18], ['hierro_estelar', .12]]
  },
  varok: {
    name: 'Varok, Señor de Ceniza', title: 'El que quiso detener el tiempo', zone: 'drakmor', model: 'lord', scale: 1.35, boss: true,
    hp: 1780, damage: 28, speed: 3.1, radius: 1.35, aggro: 28, attackRange: 3.2, cooldown: 2.2,
    xp: 1100, gold: 420, color: 0x3a2833, accent: 0xff7a45,
    loot: [['hoja_ceniza', 1], ['lagrima_brasa', 1], ['elixir_alba', 2]]
  },

  automata: {
    name: 'Autómata del Velo', title: 'Manuscrito armado', zone: 'kansordore', model: 'automaton', scale: 1.08,
    hp: 148, damage: 16, speed: 3.3, radius: .72, aggro: 17, attackRange: 2.5, cooldown: 1.8,
    xp: 72, gold: 22, color: 0x8f8aa0, accent: 0xc8f4ff,
    loot: [['esencia_resonancia', .2], ['sello_archivo', .02]]
  },
  custodiomenor: {
    name: 'Custodio Menor', title: 'Ojo del Archivo', zone: 'kansordore', model: 'watcher', scale: 1.15,
    hp: 108, damage: 15, speed: 2.2, radius: .8, aggro: 20, attackRange: 14, cooldown: 2.5, ranged: true,
    xp: 70, gold: 24, color: 0x6a6f8f, accent: 0x9fe8ff,
    loot: [['potion_mana', .25], ['esencia_resonancia', .18]]
  },
  espectro: {
    name: 'Espectro de Tinta', title: 'Frase sin terminar', zone: 'kansordore', model: 'wraith', scale: 1.05,
    hp: 122, damage: 19, speed: 4.2, radius: .65, aggro: 23, attackRange: 2.2, cooldown: 1.4, teleports: true,
    xp: 78, gold: 25, color: 0x3b3352, accent: 0xc7a8ff,
    loot: [['esencia_resonancia', .24], ['potion_vida', .1]]
  },
  custodio_velo: {
    name: 'Custodio del Velo', title: 'El último guardián de la historia', zone: 'kansordore', model: 'seraph', scale: 1.55, boss: true,
    hp: 2360, damage: 30, speed: 3.0, radius: 1.5, aggro: 30, attackRange: 3.4, cooldown: 2.0,
    xp: 1600, gold: 600, color: 0x2e3854, accent: 0xffe4a8,
    loot: [['diadema_velo', 1], ['corazon_cero', 1], ['elixir_alba', 2]]
  },
  convergencia: {
    name: 'La Convergencia', title: 'Jugador Cero', zone: 'kansordore', model: 'convergence', scale: 2.1, boss: true,
    hp: 3400, damage: 36, speed: 3.2, radius: 2.1, aggro: 32, attackRange: 4.0, cooldown: 1.9,
    xp: 3000, gold: 1200, color: 0x1c2033, accent: 0xffe6a8,
    loot: [['espada_celestial', 1], ['elixir_alba', 3]]
  }
}

export const BOSS_IDS = Object.entries(ENEMIES).filter(([, e]) => e.boss).map(([id]) => id)

export const ZONE_SPAWNS = {
  valdoria: [
    ['corrompido', 18, 22, 2], ['corrompido', 34, 28, 1], ['corrompido', -30, 34, 2],
    ['corrompido', -48, -22, 1], ['corrompido', -16, -52, 2], ['espina', 30, -26, 2],
    ['espina', -44, 24, 1], ['lobo_musgo', -36, -58, 2], ['lobo_musgo', 52, 38, 2],
    ['lobo_musgo', 22, -62, 1]
  ],
  drakmor: [
    ['cenicero', 10, 26, 2], ['cenicero', -34, 10, 2], ['cenicero', 38, -24, 2],
    ['aruspice', -16, -18, 2], ['aruspice', 46, 28, 1], ['sabueso', -48, -34, 2],
    ['sabueso', 22, -46, 2], ['sabueso', 30, 52, 1], ['cenicero', -8, -58, 1]
  ],
  kansordore: [
    ['automata', -28, 26, 2], ['automata', 28, 8, 2], ['custodiomenor', 44, 30, 2],
    ['custodiomenor', -52, -16, 1], ['espectro', 12, -34, 2], ['espectro', -16, 48, 1],
    ['automata', 52, -32, 1]
  ]
}

export function enemyDef(id) { return ENEMIES[id] }
