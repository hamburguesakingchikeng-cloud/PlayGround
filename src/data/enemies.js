// Enemigos, comportamientos, botín y jefes.
export const ENEMIES = {
  musgo: {
    name: 'Musgo Hostil', level: 1, hp: 42, atk: 7, def: 1, speed: 38, radius: 13, aggro: 190, range: 28,
    xp: 14, gold: [2, 6], behavior: 'melee', sprite: 'slime', scale: 0.9, capture: 'musgo',
    loot: [{ id: 'resonance_essence', chance: 0.35, qty: [1, 1] }],
  },
  wolf: {
    name: 'Lobo de Espino', level: 2, hp: 58, atk: 10, def: 2, speed: 74, radius: 14, aggro: 280, range: 34,
    xp: 22, gold: [3, 9], behavior: 'melee', sprite: 'wolf', scale: 1, capture: 'wolf', lunge: true,
    loot: [{ id: 'resonance_essence', chance: 0.3, qty: [1, 2] }, { id: 'iron', chance: 0.2, qty: [1, 1] }],
  },
  bandit: {
    name: 'Bandido de Valdoria', level: 3, hp: 78, atk: 13, def: 4, speed: 66, radius: 13, aggro: 260, range: 38,
    xp: 30, gold: [8, 18], behavior: 'melee', sprite: 'human', scale: 1, human: true, dodge: true,
    loot: [{ id: 'iron', chance: 0.45, qty: [1, 2] }, { id: 'potion_lumen', chance: 0.18, qty: [1, 1] }],
  },
  wraith: {
    name: 'Espectro de Raíz', level: 3, hp: 62, atk: 12, def: 2, speed: 52, radius: 15, aggro: 330, range: 210,
    xp: 34, gold: [4, 10], behavior: 'ranged', sprite: 'wraith', scale: 1, projectile: 'root', teleport: true,
    loot: [{ id: 'resonance_essence', chance: 0.35, qty: [1, 2] }, { id: 'moon_lily', chance: 0.25, qty: [1, 1] }],
  },
  imp: {
    name: 'Imp de Ceniza', level: 4, hp: 82, atk: 15, def: 3, speed: 60, radius: 13, aggro: 320, range: 230,
    xp: 40, gold: [7, 15], behavior: 'ranged', sprite: 'imp', scale: 1, projectile: 'fire', capture: 'imp',
    loot: [{ id: 'living_ash', chance: 0.35, qty: [1, 2] }, { id: 'resonance_essence', chance: 0.25, qty: [1, 1] }],
  },
  golem: {
    name: 'Golem de Obsidiana', level: 5, hp: 190, atk: 21, def: 12, speed: 38, radius: 22, aggro: 260, range: 44,
    xp: 75, gold: [14, 26], behavior: 'charger', sprite: 'golem', scale: 1.35, capture: 'golem',
    loot: [{ id: 'iron', chance: 0.7, qty: [2, 4] }, { id: 'gem_shard', chance: 0.12, qty: [1, 1] }],
  },
  fallen_knight: {
    name: 'Caballero Caído', level: 6, hp: 165, atk: 24, def: 14, speed: 58, radius: 15, aggro: 300, range: 42,
    xp: 85, gold: [16, 30], behavior: 'melee', sprite: 'knight', scale: 1.05, human: true, block: true,
    loot: [{ id: 'living_ash', chance: 0.4, qty: [1, 2] }, { id: 'iron', chance: 0.5, qty: [2, 3] }, { id: 'ash_cloak', chance: 0.05, qty: [1, 1] }],
  },
  salamander: {
    name: 'Salamandra de Magma', level: 6, hp: 150, atk: 22, def: 8, speed: 62, radius: 18, aggro: 300, range: 95,
    xp: 90, gold: [13, 24], behavior: 'breather', sprite: 'lizard', scale: 1.1, capture: 'salamander',
    loot: [{ id: 'living_ash', chance: 0.5, qty: [1, 3] }, { id: 'ember_pendant', chance: 0.04, qty: [1, 1] }],
  },
  sentinel: {
    name: 'Centinela de Luz', level: 7, hp: 130, atk: 25, def: 10, speed: 46, radius: 16, aggro: 360, range: 260,
    xp: 105, gold: [18, 30], behavior: 'beam', sprite: 'orb', scale: 1, capture: 'sentinel',
    loot: [{ id: 'celestial_plume', chance: 0.25, qty: [1, 1] }, { id: 'resonance_essence', chance: 0.4, qty: [1, 2] }],
  },
  seraph: {
    name: 'Serafín Corrupto', level: 8, hp: 175, atk: 29, def: 9, speed: 86, radius: 17, aggro: 380, range: 80,
    xp: 130, gold: [20, 38], behavior: 'diver', sprite: 'angel', scale: 1.1, capture: 'seraph',
    loot: [{ id: 'celestial_plume', chance: 0.4, qty: [1, 2] }, { id: 'halo', chance: 0.04, qty: [1, 1] }],
  },
  abyss: {
    name: 'Aberración del Velo', level: 9, hp: 210, atk: 32, def: 11, speed: 54, radius: 19, aggro: 420, range: 190,
    xp: 160, gold: [24, 44], behavior: 'teleporter', sprite: 'eye', scale: 1.1, capture: 'abyss',
    loot: [{ id: 'resonance_essence', chance: 0.6, qty: [2, 3] }, { id: 'veil_eye', chance: 0.05, qty: [1, 1] }],
  },
  firefly: {
    name: 'Luciérnaga de Ámbar', level: 3, hp: 40, atk: 8, def: 1, speed: 80, radius: 10, aggro: 120, range: 30,
    xp: 26, gold: [2, 5], behavior: 'flee', sprite: 'moth', scale: 1, capture: 'firefly',
    loot: [{ id: 'moon_lily', chance: 0.3, qty: [1, 1] }],
  },
  deer: {
    name: 'Ciervo de Cristal', level: 4, hp: 95, atk: 11, def: 6, speed: 95, radius: 18, aggro: 0, range: 30,
    xp: 55, gold: [0, 0], behavior: 'flee', sprite: 'deer', scale: 1.1, capture: 'deer', rare: true,
    loot: [{ id: 'celestial_plume', chance: 0.15, qty: [1, 1] }],
  },
  raven: {
    name: 'Cuervo de Humo', level: 5, hp: 70, atk: 14, def: 2, speed: 110, radius: 12, aggro: 0, range: 30,
    xp: 48, gold: [0, 0], behavior: 'flee', sprite: 'bird', scale: 1, capture: 'raven', rare: true,
    loot: [{ id: 'resonance_essence', chance: 0.3, qty: [1, 1] }],
  },
};

export const BOSSES = {
  guardian: {
    name: 'Guardián de Raíces', title: 'El que sostiene lo que queda', level: 5,
    hp: 950, atk: 24, def: 10, speed: 44, radius: 40, aggro: 620, range: 100,
    xp: 520, gold: [120, 180], sprite: 'treant', scale: 2.2, boss: true,
    phases: [1, 0.55], patterns: ['roots', 'sweep', 'summon', 'poison'],
    loot: [{ id: 'gem_shard', chance: 1, qty: [1, 1] }, { id: 'guardian_seal', chance: 1, qty: [1, 1] }, { id: 'lumen_blade', chance: 0.5, qty: [1, 1] }],
    intro: 'La raíz que no se rompe',
  },
  dama: {
    name: 'Dama de la Brasa', title: 'La que recuerda el primer fuego', level: 7,
    hp: 1400, atk: 30, def: 12, speed: 62, radius: 26, aggro: 700, range: 120,
    xp: 850, gold: [220, 320], sprite: 'flameLady', scale: 1.9, boss: true,
    phases: [1, 0.6], patterns: ['wave', 'meteors', 'dash', 'clones'],
    loot: [{ id: 'first_tear', chance: 1, qty: [1, 1] }, { id: 'obsidian_greatsword', chance: 1, qty: [1, 1] }, { id: 'obsidian_plate', chance: 0.6, qty: [1, 1] }],
    intro: 'La Lágrima de la Primera Brasa',
  },
  veil: {
    name: 'El Velo', title: 'El rostro que no debes recordar', level: 10,
    hp: 2200, atk: 36, def: 16, speed: 58, radius: 44, aggro: 900, range: 160,
    xp: 1800, gold: [400, 600], sprite: 'veil', scale: 2.5, boss: true,
    phases: [1, 0.66, 0.33], patterns: ['projectiles', 'collapse', 'mirrors', 'beam'],
    loot: [{ id: 'veil_edge', chance: 1, qty: [1, 1] }, { id: 'veil_shroud', chance: 0.7, qty: [1, 1] }],
    intro: 'La Convergencia Absoluta',
  },
};

export const ENEMY_IDS = Object.keys(ENEMIES);
export const BOSS_IDS = Object.keys(BOSSES);

export const BEHAVIOR_LABELS = {
  melee: 'Cuerpo a cuerpo', ranged: 'A distancia', charger: 'Embestida',
  breather: 'Aliento ígneo', beam: 'Rayo', diver: 'Picado', teleporter: 'Teletransporte', flee: 'Esquivo',
};
