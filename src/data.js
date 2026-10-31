/* ── Rarity ─────────────────────────────────────────────────────── */
export const RARITY = {
  common: {
    key: 'common', name: 'Common', color: '#cfc7b8', soft: '#8d877d',
    affixes: [0, 1], mult: 1.0, sell: 1.0, order: 0,
    weight: 52,
  },
  magic: {
    key: 'magic', name: 'Magic', color: '#5aa8ff', soft: '#2f5f9c',
    affixes: [1, 2], mult: 1.16, sell: 3.2, order: 1,
    weight: 30,
  },
  rare: {
    key: 'rare', name: 'Rare', color: '#ffd75e', soft: '#9a7b22',
    affixes: [2, 3], mult: 1.38, sell: 9, order: 2,
    weight: 12,
  },
  legendary: {
    key: 'legendary', name: 'Legendary', color: '#ff8a3d', soft: '#a34a16',
    affixes: [3, 4], mult: 1.72, sell: 26, order: 3,
    weight: 4,
  },
};

export const RARITY_ORDER = ['common', 'magic', 'rare', 'legendary'];

/* ── Slots ──────────────────────────────────────────────────────── */
export const SLOTS = {
  weapon: { name: 'Weapon', icon: 'sword' },
  helm: { name: 'Helm', icon: 'helm' },
  chest: { name: 'Chest', icon: 'chest' },
  gloves: { name: 'Gloves', icon: 'gloves' },
  boots: { name: 'Boots', icon: 'boots' },
  ring: { name: 'Ring', icon: 'ring' },
  amulet: { name: 'Amulet', icon: 'amulet' },
};
export const SLOT_ORDER = ['weapon', 'helm', 'chest', 'gloves', 'boots', 'ring', 'amulet'];

/* ── Weapon archetypes ──────────────────────────────────────────── */
export const ARCH = {
  wand: { name: 'Arcane Bolt', range: 600, blurb: 'seeking bolt' },
  sword: { name: 'Cleave', range: 118, blurb: 'wide cleave' },
  bow: { name: 'Piercing Shot', range: 720, blurb: 'piercing arrow' },
  scythe: { name: 'Reaping Whirl', range: 122, blurb: 'spinning reap' },
  fist: { name: 'Desperate Strike', range: 92, blurb: 'bare knuckles' },
};

/* ── Item bases ─────────────────────────────────────────────────── */
export const BASES = {
  weapon: [
    { id: 'wand', name: 'Bone Wand', arch: 'wand', tier: 1, dmg: [6, 10], cd: 0.84, color: '#7fe6ff' },
    { id: 'blade', name: 'Graveblade', arch: 'sword', tier: 1, dmg: [10, 15], cd: 0.7, color: '#e8dcc0' },
    { id: 'bow', name: "Hunter's Bow", arch: 'bow', tier: 1, dmg: [8, 12], cd: 0.7, color: '#c9e8a0' },
    { id: 'staff', name: 'Staff of Cinders', arch: 'wand', tier: 2, dmg: [11, 17], cd: 0.8, color: '#ffb15e' },
    { id: 'greatsword', name: 'Tomb Greatsword', arch: 'sword', tier: 2, dmg: [17, 25], cd: 0.94, color: '#e8dcc0' },
    { id: 'longbow', name: 'Longbow of the Hunt', arch: 'bow', tier: 2, dmg: [13, 19], cd: 0.74, color: '#c9e8a0' },
    { id: 'scythe', name: "Reaper's Scythe", arch: 'scythe', tier: 2, dmg: [19, 28], cd: 1.55, color: '#ff8a8a' },
    { id: 'voidwand', name: 'Wand of the Void', arch: 'wand', tier: 3, dmg: [17, 25], cd: 0.74, color: '#c39bff' },
    { id: 'kingslayer', name: 'Kingslayer', arch: 'sword', tier: 3, dmg: [27, 39], cd: 0.86, color: '#ffd75e' },
    { id: 'windpiercer', name: 'Windpiercer', arch: 'bow', tier: 3, dmg: [21, 31], cd: 0.64, color: '#bff5ff' },
    { id: 'pale', name: 'The Pale Reaper', arch: 'scythe', tier: 3, dmg: [31, 45], cd: 1.5, color: '#9fe8ff' },
  ],
  helm: [
    { id: 'coif', name: 'Rusted Coif', tier: 1, armor: [2, 4] },
    { id: 'hood', name: "Gravekeeper's Hood", tier: 2, armor: [5, 8] },
    { id: 'crown', name: 'Crown of Ash', tier: 3, armor: [9, 14] },
  ],
  chest: [
    { id: 'shroud', name: 'Tattered Shroud', tier: 1, armor: [4, 7] },
    { id: 'cuirass', name: 'Bone Cuirass', tier: 2, armor: [8, 13] },
    { id: 'vestment', name: 'Vestment of Dusk', tier: 3, armor: [14, 20] },
  ],
  gloves: [
    { id: 'wraps', name: 'Worn Wraps', tier: 1, armor: [2, 3] },
    { id: 'gauntlets', name: 'Gravebound Gauntlets', tier: 2, armor: [4, 7] },
    { id: 'emberfists', name: 'Emberfists', tier: 3, armor: [8, 12] },
  ],
  boots: [
    { id: 'boots', name: 'Mud-Caked Boots', tier: 1, armor: [1, 3] },
    { id: 'greaves', name: 'Wraithstep Greaves', tier: 2, armor: [4, 6] },
    { id: 'tombwalkers', name: 'Tombwalkers', tier: 3, armor: [7, 11] },
  ],
  ring: [
    { id: 'copper', name: 'Copper Band', tier: 1, crit: [1, 2] },
    { id: 'onyx', name: 'Onyx Ring', tier: 2, crit: [2, 3] },
    { id: 'signet', name: 'Signet of the Pale', tier: 3, crit: [3, 5] },
  ],
  amulet: [
    { id: 'talisman', name: 'Cracked Talisman', tier: 1, hp: [5, 10] },
    { id: 'charm', name: 'Bone Charm', tier: 2, hp: [12, 20] },
    { id: 'heart', name: 'Heart of the Crypt', tier: 3, hp: [22, 35] },
  ],
};

/* ── Affixes ────────────────────────────────────────────────────── */
/* range is at item level 1. scale grows it per item level. */
export const AFFIXES = [
  { id: 'life', label: 'Max Life', stat: 'maxHp', range: [8, 16], scale: 0.12, fmt: 'flat', prefix: 'Vital', suffix: 'of Vitality', weight: 10 },
  { id: 'armor', label: 'Armor', stat: 'armor', range: [3, 7], scale: 0.1, fmt: 'flat', prefix: 'Warded', suffix: 'of Warding', weight: 10 },
  { id: 'might', label: 'Might', stat: 'might', range: [4, 8], scale: 0.035, fmt: 'pct', prefix: 'Cruel', suffix: 'of Might', weight: 12 },
  { id: 'speed', label: 'Move Speed', stat: 'speed', range: [3, 6], scale: 0.02, fmt: 'pct', prefix: 'Swift', suffix: 'of the Fox', weight: 7 },
  { id: 'cdr', label: 'Cooldown Reduction', stat: 'cdr', range: [2, 5], scale: 0.015, fmt: 'pct', prefix: 'Hasty', suffix: 'of Alacrity', weight: 7 },
  { id: 'area', label: 'Area', stat: 'area', range: [4, 9], scale: 0.03, fmt: 'pct', prefix: 'Wide', suffix: 'of Dominion', weight: 6 },
  { id: 'magnet', label: 'Magnet', stat: 'magnet', range: [10, 20], scale: 0.12, fmt: 'flat', prefix: 'Grasping', suffix: 'of Attraction', weight: 6 },
  { id: 'crit', label: 'Crit Chance', stat: 'crit', range: [2, 4], scale: 0.012, fmt: 'pct', prefix: 'Keen', suffix: 'of Precision', weight: 8 },
  { id: 'critdmg', label: 'Crit Damage', stat: 'critDmg', range: [8, 18], scale: 0.05, fmt: 'pct', prefix: 'Brutal', suffix: 'of Ruin', weight: 8 },
  { id: 'regen', label: 'Life Regen', stat: 'regen', range: [0.3, 0.8], scale: 0.012, fmt: 'dec', prefix: 'Verdant', suffix: 'of Renewal', weight: 5 },
  { id: 'xp', label: 'Experience Gain', stat: 'xp', range: [5, 12], scale: 0.025, fmt: 'pct', prefix: 'Sage', suffix: 'of Wisdom', weight: 5 },
  { id: 'gold', label: 'Gold Find', stat: 'gold', range: [10, 25], scale: 0.05, fmt: 'pct', prefix: 'Gilded', suffix: 'of Greed', weight: 6 },
  { id: 'luck', label: 'Luck', stat: 'luck', range: [4, 10], scale: 0.03, fmt: 'pct', prefix: 'Fated', suffix: 'of Fortune', weight: 5 },
];

export const RARE_ADJ = ['Grim', 'Bone', 'Dusk', 'Ember', 'Pale', 'Hollow', 'Sanguine', 'Umbral', 'Grave', 'Ashen', 'Raven', 'Cinder'];
export const RARE_NOUN = ['Warden', 'Reaver', 'Herald', 'Wanderer', 'Bane', 'Whisper', 'Vigil', 'Doom'];

/* ── Legendary powers ───────────────────────────────────────────── */
export const POWERS = [
  {
    id: 'emberheart', title: 'Cinderfall', icon: 'flame',
    text: 'Attacks have a 30% chance to set foes ablaze, burning for 45% of weapon damage over 3s.',
  },
  {
    id: 'echo', title: 'Whisper of the Twin', icon: 'bolt',
    text: '25% chance to strike twice.',
  },
  {
    id: 'leech', title: 'Sanguine Oath', icon: 'heart',
    text: 'Recover 2 life for each foe slain.',
  },
  {
    id: 'chain', title: 'Stormlink', icon: 'bolt',
    text: 'Hits arc to a nearby foe for 50% damage.',
  },
  {
    id: 'nova', title: 'Gravebloom', icon: 'circle',
    text: 'Every 5th kill erupts in a bone nova, dealing 70 damage around you.',
  },
  {
    id: 'thorns', title: 'Crown of Spite', icon: 'shield',
    text: 'When wounded, unleash a 90 damage blast around you.',
  },
  {
    id: 'frost', title: "Winter's Grip", icon: 'circle',
    text: 'Hits chill foes, slowing them 35% for 1.5s.',
  },
  {
    id: 'greed', title: 'Midas Shroud', icon: 'coin',
    text: '+30% Gold Find. The dead shed coins more readily.',
  },
];

/* ── Level-up boons ────────────────────────────────────────────── */
export const SKILLS = [
  { id: 'might', name: 'Bloodlust', icon: 'sword', desc: '+10% damage.', max: 8, weight: 12 },
  { id: 'training', name: 'Weapon Training', icon: 'target', desc: '+12% weapon damage.', max: 7, weight: 11 },
  { id: 'haste', name: 'Quickening', icon: 'hourglass', desc: '-6% weapon cooldown.', max: 6, weight: 9 },
  { id: 'fleet', name: 'Fleetfoot', icon: 'boots', desc: '+7% move speed.', max: 5, weight: 8 },
  { id: 'vitality', name: 'Vitality', icon: 'heart', desc: '+18 max life. Heals the same.', max: 6, weight: 9 },
  { id: 'bulwark', name: 'Bulwark', icon: 'shield', desc: '+7 armor.', max: 6, weight: 8 },
  { id: 'magnet', name: 'Magnetism', icon: 'magnet', desc: '+30 pickup radius.', max: 4, weight: 6 },
  { id: 'luck', name: 'Fortune', icon: 'clover', desc: '+8 luck. Rarer loot.', max: 5, weight: 8 },
  { id: 'crit', name: 'Precision', icon: 'target', desc: '+3% crit chance.', max: 5, weight: 8 },
  { id: 'critdmg', name: 'Savagery', icon: 'skull', desc: '+20% crit damage.', max: 5, weight: 7 },
  { id: 'regen', name: 'Rejuvenation', icon: 'leaf', desc: '+0.5 life regen / s.', max: 5, weight: 6 },
  { id: 'area', name: 'Dominion', icon: 'circle', desc: '+10% area of effect.', max: 5, weight: 6 },
  { id: 'xp', name: 'Scholarship', icon: 'book', desc: '+12% experience gained.', max: 4, weight: 5 },
  { id: 'greed', name: 'Avarice', icon: 'coin', desc: '+20% gold found.', max: 4, weight: 5 },
  { id: 'mend', name: 'Blood Ritual', icon: 'heart', desc: 'Recover 35% of max life now.', max: 99, weight: 4, repeatable: true, special: 'heal' },
  { id: 'reliquary', name: 'Reliquary', icon: 'chest', desc: 'Gain a random Rare or better item.', max: 99, weight: 5, repeatable: true, special: 'item' },
];

/* ── Enemies ────────────────────────────────────────────────────── */
export const ENEMIES = {
  bat: { name: 'Crypt Bat', hp: 7, speed: 104, dmg: 5, r: 10, xp: 1, gold: [1, 2], color: '#8d7bb0', draw: 'bat' },
  skeleton: { name: 'Bone Thrall', hp: 16, speed: 60, dmg: 8, r: 12, xp: 2, gold: [1, 3], color: '#d8cbb2', draw: 'skeleton' },
  hound: { name: 'Grave Hound', hp: 12, speed: 128, dmg: 7, r: 11, xp: 2, gold: [1, 2], color: '#9c5f5f', draw: 'hound' },
  cultist: { name: 'Ashen Cultist', hp: 26, speed: 48, dmg: 7, r: 12, xp: 4, gold: [2, 4], color: '#c46a5a', draw: 'cultist', ranged: true },
  ghoul: { name: 'Rotting Ghoul', hp: 38, speed: 44, dmg: 12, r: 15, xp: 4, gold: [2, 4], color: '#7f9c6a', draw: 'ghoul' },
  wraith: { name: 'Pale Wraith', hp: 24, speed: 84, dmg: 9, r: 12, xp: 3, gold: [2, 5], color: '#8fd8e8', draw: 'wraith' },
  brute: { name: 'Crypt Brute', hp: 105, speed: 38, dmg: 18, r: 21, xp: 9, gold: [4, 8], color: '#a37b5c', draw: 'brute' },
};

export function enemyPool(time) {
  const pool = [['bat', 10], ['skeleton', 11]];
  if (time > 40) pool.push(['hound', 6]);
  if (time > 80) pool.push(['cultist', 4]);
  if (time > 140) pool.push(['ghoul', 5], ['wraith', 4]);
  if (time > 230) pool.push(['brute', 3]);
  return pool;
}

export const BOSSES = [
  {
    id: 'tyrant', name: 'The Bone Tyrant', at: 300, hp: 3400, speed: 48, dmg: 26, r: 44, xp: 90,
    color: '#e2d3ac', crown: '#ffcf5e', flavor: 'A throne of ribs drags itself upright.',
  },
  {
    id: 'pale', name: 'The Pale King', at: 480, hp: 7600, speed: 42, dmg: 34, r: 52, xp: 180,
    color: '#b9e6ff', crown: '#9fe8ff', flavor: 'The crown remembers a kingdom that never was.',
  },
];

/* ── Relics (starting weapon) ──────────────────────────────────── */
export const RELICS = [
  {
    id: 'wand', baseId: 'wand', name: 'Bone Wand', icon: 'wand',
    title: 'The Scholar', desc: 'Arcane bolts seek the nearest foe. Safe, steady, and always aimed.',
    perk: '+8% Cooldown Reduction',
  },
  {
    id: 'sword', baseId: 'blade', name: 'Graveblade', icon: 'sword',
    title: 'The Reaver', desc: 'Wide cleaves carve through packs. Step into the horde and stay there.',
    perk: '+12 Armor',
  },
  {
    id: 'bow', baseId: 'bow', name: "Hunter's Bow", icon: 'bow',
    title: 'The Stalker', desc: 'Piercing arrows skew long lines of the dead. Keep your distance.',
    perk: '+8% Move Speed',
  },
];

/* ── World dressing ────────────────────────────────────────────── */
export const TORCHES = [
  [180, 180], [1300, 140], [2420, 180], [160, 1300], [2440, 1300],
  [220, 2420], [1300, 2460], [2400, 2420],
];
