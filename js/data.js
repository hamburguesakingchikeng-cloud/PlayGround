// Static game data: rarities, item bases, affixes, uniques, boons and enemies.

export const RARITIES = {
  common: {
    id: 'common', name: 'Common', color: '#c9c4b8', soft: 'rgba(201,196,184,.4)',
    affixes: [0, 0], weight: 54, salvage: 7, beam: 'rgba(201,196,184,.28)'
  },
  magic: {
    id: 'magic', name: 'Magic', color: '#6ea8ff', soft: 'rgba(110,168,255,.45)',
    affixes: [1, 2], weight: 29, salvage: 18, beam: 'rgba(110,168,255,.45)'
  },
  rare: {
    id: 'rare', name: 'Rare', color: '#f2cf66', soft: 'rgba(242,207,102,.5)',
    affixes: [3, 3], weight: 13, salvage: 42, beam: 'rgba(242,207,102,.55)'
  },
  legendary: {
    id: 'legendary', name: 'Legendary', color: '#ff9a3c', soft: 'rgba(255,154,60,.62)',
    affixes: [3, 3], weight: 4, salvage: 110, beam: 'rgba(255,154,60,.7)'
  }
};

export const RARITY_ORDER = ['common', 'magic', 'rare', 'legendary'];

export const SLOTS = ['weapon', 'armor', 'amulet', 'ring'];
export const SLOT_LABEL = { weapon: 'Weapon', armor: 'Armor', amulet: 'Amulet', ring: 'Ring' };

export const WEAPON_BASES = [
  {
    id: 'bone_wand', name: 'Bone Wand', kind: 'bolt', damage: 14, interval: 0.78,
    range: 460, speed: 570, color: '#8fe7ff', icon: 'wand',
    implicit: 'Hurls a necrotic bolt at the nearest foe.',
    flavor: 'Cut from the femur of a hanged witch.'
  },
  {
    id: 'rusted_cleaver', name: 'Rusted Cleaver', kind: 'cleave', damage: 22, interval: 0.86,
    range: 132, color: '#ffd28a', icon: 'cleaver',
    implicit: 'A wide arc that cuts every foe nearby.',
    flavor: 'It has forgotten how many throats it has opened.'
  },
  {
    id: 'grave_spear', name: 'Grave Spear', kind: 'spear', damage: 30, interval: 1.08,
    range: 520, speed: 760, pierce: 3, color: '#c7b3ff', icon: 'spear',
    implicit: 'Hurls a piercing spear through a line of enemies.',
    flavor: 'Buried with a king. Unearthed by worse things.'
  },
  {
    id: 'fang_knives', name: 'Fang Knives', kind: 'knives', damage: 9, interval: 0.6,
    range: 440, speed: 680, count: 2, color: '#b6ffcf', icon: 'knives',
    implicit: 'Flings a pair of fast, hungry blades.',
    flavor: 'Each tooth still remembers the jaw it came from.'
  },
  {
    id: 'cinder_orb', name: 'Cinder Orb', kind: 'orb', damage: 32, interval: 1.3,
    range: 450, speed: 380, radius: 82, color: '#ff9a3c', icon: 'orb',
    implicit: 'Lobs a fireball that detonates in a burst.',
    flavor: 'A coal from the first funeral pyre.'
  },
  {
    id: 'storm_scepter', name: 'Storm Scepter', kind: 'storm', damage: 19, interval: 1.12,
    range: 430, chains: 3, color: '#9fd0ff', icon: 'scepter',
    implicit: 'Calls lightning that leaps between three foes.',
    flavor: 'The sky is a graveyard too.'
  }
];

export const ARMOR_BASES = [
  {
    id: 'tattered_shroud', name: 'Tattered Shroud', armor: 4, maxLife: 8,
    implicit: 'A burial wrap that still smells of rain.',
    flavor: 'Someone died in this. They may still be in it.'
  },
  {
    id: 'boneplate', name: 'Boneplate', armor: 10, maxLife: 4,
    implicit: 'Ribs lashed together into a rattling cuirass.',
    flavor: 'Armor of a soldier who refused to lie down.'
  },
  {
    id: 'gravekeepers_robe', name: "Gravekeeper's Robe", armor: 5, maxLife: 16,
    implicit: 'Woven with grave-dirt and old prayers.',
    flavor: 'The keeper buried everyone but himself.'
  },
  {
    id: 'nightshroud', name: 'Nightshroud', armor: 3, moveSpeedPct: 6,
    implicit: 'Light as fog. Cold as the hour before dawn.',
    flavor: 'It does not keep you warm. It keeps you hidden.'
  }
];

export const AMULET_BASES = [
  {
    id: 'ashen_pendant', name: 'Ashen Pendant', maxLife: 7, pickup: 12,
    implicit: 'Ash from a saint, sealed in black glass.',
    flavor: 'It hums when the dead draw near.'
  },
  {
    id: 'bloodstone_amulet', name: 'Bloodstone Amulet', maxLife: 10, lifesteal: 1,
    implicit: 'A garnet that drinks what you spill.',
    flavor: 'Warm to the touch. Always warm.'
  },
  {
    id: 'reliquary', name: 'Reliquary', magicFind: 9, xpGain: 6,
    implicit: 'A finger bone of someone important, probably.',
    flavor: 'The faithful pay well for what it promises.'
  }
];

export const RING_BASES = [
  {
    id: 'copper_band', name: 'Copper Band', goldFind: 12,
    implicit: 'A cheap ring that always finds a coin.',
    flavor: 'Stolen from a corpse. Obviously.'
  },
  {
    id: 'onyx_ring', name: 'Onyx Ring', critChance: 2.5,
    implicit: 'Black stone that sharpens the eye.',
    flavor: 'Look closely and something looks back.'
  },
  {
    id: 'signet', name: 'Grave Signet', damagePct: 5,
    implicit: 'A signet of a house no one remembers.',
    flavor: 'The seal presses into flesh as easily as wax.'
  }
];

export const BASES = {
  weapon: WEAPON_BASES,
  armor: ARMOR_BASES,
  amulet: AMULET_BASES,
  ring: RING_BASES
};

export const AFFIXES = [
  { id: 'vicious', stat: 'damagePct', label: 'Damage', min: 7, max: 15, step: 1, slots: ['weapon', 'ring', 'amulet'], weight: 12, prefix: 'Vicious', format: v => `+${v}% Damage` },
  { id: 'swift', stat: 'attackSpeedPct', label: 'Attack Speed', min: 6, max: 13, step: 1, slots: ['weapon', 'ring', 'amulet'], weight: 10, prefix: 'Swift', format: v => `+${v}% Attack Speed` },
  { id: 'fleet', stat: 'moveSpeedPct', label: 'Move Speed', min: 4, max: 9, step: 1, slots: ['armor', 'ring', 'amulet'], weight: 9, prefix: 'Nimble', format: v => `+${v}% Move Speed` },
  { id: 'vital', stat: 'maxLife', label: 'Max Life', min: 12, max: 28, step: 2, slots: ['armor', 'amulet', 'ring'], weight: 11, prefix: 'Vital', format: v => `+${v} Max Life` },
  { id: 'bulwark', stat: 'armor', label: 'Armor', min: 3, max: 8, step: 1, slots: ['armor', 'ring', 'amulet'], weight: 9, prefix: 'Iron-Bound', format: v => `+${v} Armor` },
  { id: 'keen', stat: 'critChance', label: 'Crit Chance', min: 2, max: 6, step: 0.5, slots: ['weapon', 'ring', 'amulet'], weight: 9, prefix: 'Keen', format: v => `+${v}% Crit Chance` },
  { id: 'brutal', stat: 'critDamage', label: 'Crit Damage', min: 10, max: 25, step: 1, slots: ['weapon', 'ring'], weight: 7, prefix: 'Brutal', format: v => `+${v}% Crit Damage` },
  { id: 'grasping', stat: 'pickup', label: 'Pickup Radius', min: 12, max: 30, step: 2, slots: ['armor', 'amulet', 'ring'], weight: 8, prefix: 'Grasping', format: v => `+${v} Pickup Radius` },
  { id: 'gilded', stat: 'goldFind', label: 'Gold Find', min: 10, max: 30, step: 2, slots: ['amulet', 'ring', 'armor'], weight: 8, prefix: 'Gilded', format: v => `+${v}% Gold Find` },
  { id: 'occult', stat: 'magicFind', label: 'Magic Find', min: 8, max: 22, step: 2, slots: ['amulet', 'ring', 'armor'], weight: 7, prefix: 'Occult', format: v => `+${v}% Magic Find` },
  { id: 'sanguine', stat: 'lifesteal', label: 'Life Steal', min: 1, max: 3, step: 0.5, slots: ['weapon', 'amulet', 'ring'], weight: 6, prefix: 'Sanguine', format: v => `+${v}% Life Steal` },
  { id: 'verdant', stat: 'regen', label: 'Life Regen', min: 0.4, max: 1.2, step: 0.1, slots: ['armor', 'amulet', 'ring'], weight: 6, prefix: 'Verdant', format: v => `+${v}/s Life Regen` },
  { id: 'wide', stat: 'areaPct', label: 'Area', min: 6, max: 16, step: 1, slots: ['weapon', 'amulet', 'ring'], weight: 5, prefix: 'Wide', format: v => `+${v}% Area` },
  { id: 'learned', stat: 'xpGain', label: 'XP Gain', min: 6, max: 16, step: 1, slots: ['amulet', 'ring'], weight: 5, prefix: 'Learned', format: v => `+${v}% XP Gain` },
  { id: 'thorned', stat: 'thorns', label: 'Thorns', min: 3, max: 9, step: 1, slots: ['armor', 'ring'], weight: 4, prefix: 'Thorned', format: v => `+${v} Thorns` },
  { id: 'multitudinous', stat: 'projectiles', label: 'Projectile', min: 1, max: 1, step: 1, slots: ['weapon', 'amulet'], weight: 2, prefix: 'Echoing', format: () => '+1 Projectile', integer: true }
];

export const AFFIX_SUFFIX = {
  damagePct: 'of Ruin', attackSpeedPct: 'of Haste', moveSpeedPct: 'of the Gale',
  maxLife: 'of the Wolf', armor: 'of the Bulwark', critChance: 'of the Hawk',
  critDamage: 'of Slaughter', pickup: 'of the Magpie', goldFind: 'of Greed',
  magicFind: 'of the Eclipse', lifesteal: 'of the Leech', regen: 'of Spring',
  areaPct: 'of Carnage', xpGain: 'of Insight', thorns: 'of Spite', projectiles: 'of the Hydra'
};

// Unique legendary powers. `flags` are consumed by the game simulation.
export const UNIQUES = {
  weapon: [
    {
      id: 'wraithfang', base: 'fang_knives', name: 'Wraithfang',
      power: 'Knives fire an extra blade and pierce one additional foe.',
      stats: { projectiles: 1, attackSpeedPct: 10 }, flags: { pierce: 1 },
      flavor: 'It cuts the soul before the skin.'
    },
    {
      id: 'gravewhisper', base: 'bone_wand', name: 'Gravewhisper',
      power: 'Slain foes have a 30% chance to burst for 60% damage around them.',
      stats: { damagePct: 12 }, flags: { explodeOnKill: 0.3 },
      flavor: 'The dead answer when it speaks.'
    },
    {
      id: 'bloodmoon_cleaver', base: 'rusted_cleaver', name: 'Bloodmoon Cleaver',
      power: 'Critical strikes cause foes to bleed for 9 damage per second over 3s.',
      stats: { critDamage: 25, critChance: 4 }, flags: { bleedOnCrit: true },
      flavor: 'Under a red moon, every cut opens twice.'
    },
    {
      id: 'stormcaller', base: 'storm_scepter', name: 'Stormcaller',
      power: 'Lightning leaps to two additional foes and strikes 15% faster.',
      stats: { attackSpeedPct: 15 }, flags: { chainBonus: 2 },
      flavor: 'The storm remembers every name.'
    },
    {
      id: 'cinderheart', base: 'cinder_orb', name: 'Cinderheart',
      power: 'Explosions leave burning ground for 3s, scorching anything that crosses it.',
      stats: { areaPct: 15 }, flags: { burningGround: true },
      flavor: 'A heart that never stopped burning.'
    },
    {
      id: 'duskreaver', base: 'grave_spear', name: 'Duskreaver',
      power: 'Spears pierce every foe in their path and deal 25% more damage.',
      stats: { damagePct: 25 }, flags: { infinitePierce: true },
      flavor: 'It was forged to kill the setting sun.'
    }
  ],
  armor: [
    {
      id: 'shroud_of_night', base: 'nightshroud', name: 'Shroud of the Night',
      power: 'You have a 15% chance to evade incoming damage entirely.',
      stats: { moveSpeedPct: 12, armor: 5 }, flags: { evade: 0.15 },
      flavor: 'The dark is a door. This is its key.'
    },
    {
      id: 'tyrant_boneplate', base: 'boneplate', name: 'Boneplate of the Tyrant',
      power: 'Retaliate for 18 damage whenever a foe strikes you.',
      stats: { armor: 10, maxLife: 25 }, flags: { thorns: 18 },
      flavor: 'Every king is eventually worn by his subjects.'
    },
    {
      id: 'heart_of_grave', base: 'gravekeepers_robe', name: 'Heart of the Grave',
      power: 'Recover 2 life whenever you slay a foe.',
      stats: { maxLife: 35, regen: 1.5 }, flags: { healOnKill: 2 },
      flavor: 'The grave keeps what it is given.'
    }
  ],
  amulet: [
    {
      id: 'emberheart', base: 'ashen_pendant', name: 'Emberheart',
      power: 'Attacks set foes burning for 5 damage per second over 3s. +1 Projectile.',
      stats: { projectiles: 1, damagePct: 8 }, flags: { burnOnHit: 5 },
      flavor: 'A coal from the last hearth in the world.'
    },
    {
      id: 'soulcatcher', base: 'bloodstone_amulet', name: 'Soulcatcher',
      power: 'Heal for 5% of all damage dealt. +20 Max Life.',
      stats: { lifesteal: 5, maxLife: 20 }, flags: {},
      flavor: 'It holds the screams so you do not have to.'
    },
    {
      id: 'eye_of_eclipse', base: 'reliquary', name: 'Eye of the Eclipse',
      power: 'Gain 18% Magic Find and 10% Crit Chance.',
      stats: { magicFind: 18, critChance: 10 }, flags: {},
      flavor: 'It watches the moon. The moon watches back.'
    }
  ],
  ring: [
    {
      id: 'covetous_band', base: 'copper_band', name: 'Covetous Band',
      power: 'Gold pickups heal 3 life. Gain 60% Gold Find.',
      stats: { goldFind: 60 }, flags: { goldHeal: 3 },
      flavor: 'The hand that wears it never stops closing.'
    },
    {
      id: 'signet_of_ruin', base: 'signet', name: 'Signet of Ruin',
      power: 'Deal 25% more damage, but suffer 15 less Max Life.',
      stats: { damagePct: 25, maxLife: -15 }, flags: {},
      flavor: 'Power is a debt. This is the collateral.'
    },
    {
      id: 'warding_loop', base: 'onyx_ring', name: 'Warding Loop',
      power: 'Gain 8 Armor and 25 Pickup Radius.',
      stats: { armor: 8, pickup: 25 }, flags: {},
      flavor: 'A circle no ghost will cross.'
    },
    {
      id: 'bloodstone_ring', base: 'signet', name: 'Bloodstone Ring',
      power: 'Heal for 6% of all damage dealt and deal 10% more damage.',
      stats: { lifesteal: 6, damagePct: 10 }, flags: {},
      flavor: 'Blood in. Blood out.'
    }
  ]
};

export const BOONS = [
  { id: 'might', name: 'Might', icon: 'sword', max: 8, desc: '+15% Damage', apply: s => { s.damagePct += 15; } },
  { id: 'haste', name: 'Haste', icon: 'bolt', max: 8, desc: '+12% Attack Speed', apply: s => { s.attackSpeedPct += 12; } },
  { id: 'fleet', name: 'Fleet', icon: 'boot', max: 6, desc: '+8% Move Speed', apply: s => { s.moveSpeedPct += 8; } },
  { id: 'vitality', name: 'Vitality', icon: 'heart', max: 8, desc: '+25 Max Life. Heal 25.', apply: s => { s.maxLife += 25; } },
  { id: 'bulwark', name: 'Bulwark', icon: 'shield', max: 6, desc: '+3 Armor', apply: s => { s.armor += 3; } },
  { id: 'precision', name: 'Precision', icon: 'eye', max: 6, desc: '+7% Crit Chance', apply: s => { s.critChance += 7; } },
  { id: 'avarice', name: 'Avarice', icon: 'coin', max: 5, desc: '+25% Gold Find', apply: s => { s.goldFind += 25; } },
  { id: 'magnet', name: 'Magnet', icon: 'magnet', max: 5, desc: '+30 Pickup Radius', apply: s => { s.pickup += 30; } },
  { id: 'multishot', name: 'Multishot', icon: 'arrows', max: 4, desc: '+1 Projectile', apply: s => { s.projectiles += 1; } },
  { id: 'carnage', name: 'Carnage', icon: 'burst', max: 5, desc: '+18% Area of Effect', apply: s => { s.areaPct += 18; } },
  { id: 'regeneration', name: 'Regeneration', icon: 'leaf', max: 5, desc: '+0.6 Life Regen per second', apply: s => { s.regen += 0.6; } },
  { id: 'luck', name: 'Luck', icon: 'clover', max: 5, desc: '+12% Magic Find', apply: s => { s.magicFind += 12; } },
  { id: 'leech', name: 'Leech', icon: 'drop', max: 4, desc: '+2% Life Steal', apply: s => { s.lifesteal += 2; } },
  { id: 'insight', name: 'Insight', icon: 'book', max: 5, desc: '+12% XP Gain', apply: s => { s.xpGain += 12; } }
];

export const ENEMY_TYPES = {
  bat: {
    id: 'bat', name: 'Grave Bat', hp: 8, speed: 108, damage: 3, radius: 10,
    xp: 1, color: '#6b5b7a', accent: '#d66b7a', mass: 0.5
  },
  skeleton: {
    id: 'skeleton', name: 'Bonewalker', hp: 18, speed: 68, damage: 6, radius: 13,
    xp: 2, color: '#b7ad94', accent: '#e5dcc4', mass: 1
  },
  ghoul: {
    id: 'ghoul', name: 'Ghoul', hp: 46, speed: 54, damage: 9, radius: 18,
    xp: 3, color: '#6b7a5d', accent: '#b6e38b', mass: 1.7
  },
  cultist: {
    id: 'cultist', name: 'Cultist', hp: 24, speed: 58, damage: 7, radius: 13,
    xp: 4, color: '#5a3150', accent: '#c77dff', mass: 1, ranged: true
  },
  wraith: {
    id: 'wraith', name: 'Wraith', hp: 30, speed: 88, damage: 8, radius: 14,
    xp: 5, color: '#4d6b78', accent: '#9fe8ff', mass: 0.8, ghost: true
  },
  tyrant: {
    id: 'tyrant', name: 'Bone Tyrant', hp: 2200, speed: 44, damage: 22, radius: 48,
    xp: 60, color: '#8e846c', accent: '#ff8f5a', mass: 8, boss: true
  }
};

export const SPAWN_TABLE = [
  { t: 0, types: ['bat'] },
  { t: 25, types: ['bat', 'skeleton'] },
  { t: 70, types: ['bat', 'skeleton', 'ghoul'] },
  { t: 115, types: ['bat', 'skeleton', 'ghoul', 'cultist'] },
  { t: 165, types: ['skeleton', 'ghoul', 'cultist', 'wraith'] },
  { t: 225, types: ['ghoul', 'cultist', 'wraith'] }
];

export const WAVE_LABELS = [
  [0, 'The graveyard stirs'],
  [25, 'Bones remember how to walk'],
  [70, 'Something hungry in the mist'],
  [115, 'The cult begins its hymn'],
  [165, 'Wraiths slip through the veil'],
  [225, 'The dead are done waiting'],
  [285, 'The Bone Tyrant wakes']
];

export const RUN_DURATION = 360;
export const BOSS_TIME = 300;
export const INVENTORY_SIZE = 24;

export const STAT_LABEL = {
  damagePct: 'Damage', attackSpeedPct: 'Attack Speed', moveSpeedPct: 'Move Speed',
  maxLife: 'Max Life', armor: 'Armor', critChance: 'Crit Chance', critDamage: 'Crit Damage',
  pickup: 'Pickup Radius', goldFind: 'Gold Find', magicFind: 'Magic Find',
  regen: 'Life Regen', lifesteal: 'Life Steal', projectiles: 'Projectiles',
  areaPct: 'Area', xpGain: 'XP Gain', thorns: 'Thorns'
};
