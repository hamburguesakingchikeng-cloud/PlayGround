// Diablo-inspired item generation: rarities, affixes, legendary powers, power score.
// Pure module, no DOM, safe to unit test with Node.

import { pick, rand, weightedPick } from './rng.js';

export const SLOTS = ['weapon', 'helm', 'armor', 'boots', 'amulet', 'ring'];

export const SLOT_META = {
  weapon: { label: 'Weapon', glyph: '⚔' },
  helm: { label: 'Helm', glyph: '♜' },
  armor: { label: 'Chest', glyph: '⛨' },
  boots: { label: 'Boots', glyph: '➶' },
  amulet: { label: 'Amulet', glyph: '✦' },
  ring: { label: 'Ring', glyph: '◈' },
};

export const RARITIES = {
  common: { key: 'common', label: 'Common', color: '#cfc8b8', affixes: 1, mult: 0.82, order: 0 },
  magic: { key: 'magic', label: 'Magic', color: '#6f9dff', affixes: 2, mult: 1.0, order: 1 },
  rare: { key: 'rare', label: 'Rare', color: '#ffd764', affixes: 3, mult: 1.16, order: 2 },
  legendary: { key: 'legendary', label: 'Legendary', color: '#ff9138', affixes: 4, mult: 1.38, order: 3 },
  mythic: { key: 'mythic', label: 'Mythic', color: '#ff3b5c', affixes: 5, mult: 1.62, order: 4 },
};

export const STAT_DEFS = {
  damagePct: { label: 'Damage', suffix: '%', pct: true, weight: 2.4 },
  flatDamage: { label: 'Attack Damage', suffix: '', pct: false, weight: 1.7 },
  attackSpeed: { label: 'Attack Speed', suffix: '%', pct: true, weight: 2.8 },
  critChance: { label: 'Crit Chance', suffix: '%', pct: true, weight: 2.2 },
  critDamage: { label: 'Crit Damage', suffix: '%', pct: true, weight: 1.35 },
  maxHp: { label: 'Max Health', suffix: '', pct: false, weight: 0.5 },
  armor: { label: 'Armor', suffix: '', pct: false, weight: 0.65 },
  moveSpeed: { label: 'Move Speed', suffix: '%', pct: true, weight: 1.7 },
  pickup: { label: 'Pickup Radius', suffix: '', pct: false, weight: 0.34 },
  xpGain: { label: 'Experience Gain', suffix: '%', pct: true, weight: 0.8 },
  lifeOnHit: { label: 'Life on Hit', suffix: '', pct: false, weight: 1.3 },
  regen: { label: 'Health Regen', suffix: '/s', pct: false, weight: 1.05, decimals: 1 },
  luck: { label: 'Luck', suffix: '%', pct: true, weight: 1.25 },
  area: { label: 'Area of Effect', suffix: '%', pct: true, weight: 1.5 },
  projectiles: { label: 'Projectiles', suffix: '', pct: false, weight: 12, flat: true },
};

const SLOT_AFFIXES = {
  weapon: [
    { stat: 'damagePct', min: 6, max: 18, weight: 10 },
    { stat: 'flatDamage', min: 2, max: 9, weight: 10 },
    { stat: 'attackSpeed', min: 4, max: 12, weight: 8 },
    { stat: 'critChance', min: 2, max: 8, weight: 7 },
    { stat: 'critDamage', min: 8, max: 28, weight: 7 },
    { stat: 'lifeOnHit', min: 1, max: 4, weight: 5 },
    { stat: 'area', min: 4, max: 14, weight: 4 },
    { stat: 'projectiles', min: 1, max: 1, weight: 1.1 },
  ],
  helm: [
    { stat: 'maxHp', min: 8, max: 26, weight: 10 },
    { stat: 'armor', min: 4, max: 13, weight: 9 },
    { stat: 'critChance', min: 1, max: 6, weight: 6 },
    { stat: 'xpGain', min: 4, max: 12, weight: 6 },
    { stat: 'regen', min: 0.3, max: 1.4, weight: 6 },
    { stat: 'luck', min: 3, max: 10, weight: 5 },
    { stat: 'pickup', min: 8, max: 28, weight: 4 },
  ],
  armor: [
    { stat: 'maxHp', min: 14, max: 42, weight: 11 },
    { stat: 'armor', min: 8, max: 22, weight: 11 },
    { stat: 'regen', min: 0.5, max: 2.2, weight: 7 },
    { stat: 'damagePct', min: 3, max: 9, weight: 5 },
    { stat: 'pickup', min: 10, max: 34, weight: 5 },
    { stat: 'lifeOnHit', min: 1, max: 3, weight: 4 },
    { stat: 'xpGain', min: 3, max: 9, weight: 4 },
  ],
  boots: [
    { stat: 'moveSpeed', min: 4, max: 14, weight: 12 },
    { stat: 'armor', min: 3, max: 10, weight: 7 },
    { stat: 'maxHp', min: 6, max: 18, weight: 7 },
    { stat: 'pickup', min: 10, max: 30, weight: 7 },
    { stat: 'xpGain', min: 3, max: 10, weight: 5 },
    { stat: 'critChance', min: 1, max: 5, weight: 4 },
    { stat: 'regen', min: 0.2, max: 1.0, weight: 4 },
  ],
  amulet: [
    { stat: 'damagePct', min: 5, max: 15, weight: 10 },
    { stat: 'critChance', min: 2, max: 8, weight: 8 },
    { stat: 'critDamage', min: 10, max: 36, weight: 8 },
    { stat: 'xpGain', min: 4, max: 14, weight: 6 },
    { stat: 'luck', min: 4, max: 14, weight: 6 },
    { stat: 'area', min: 4, max: 16, weight: 5 },
    { stat: 'projectiles', min: 1, max: 1, weight: 1.2 },
    { stat: 'lifeOnHit', min: 1, max: 3, weight: 4 },
  ],
  ring: [
    { stat: 'damagePct', min: 4, max: 12, weight: 10 },
    { stat: 'attackSpeed', min: 3, max: 10, weight: 8 },
    { stat: 'critChance', min: 2, max: 7, weight: 8 },
    { stat: 'flatDamage', min: 1, max: 6, weight: 7 },
    { stat: 'lifeOnHit', min: 1, max: 4, weight: 6 },
    { stat: 'pickup', min: 8, max: 26, weight: 5 },
    { stat: 'luck', min: 3, max: 11, weight: 5 },
    { stat: 'area', min: 3, max: 12, weight: 4 },
  ],
};

const BASE_NAMES = {
  weapon: ["Grave Scythe", 'Bone Reaper', 'Soul Cleaver', "Widow's Fang", 'Carrion Edge', 'Requiem Blade', 'Mourning Star'],
  helm: ['Crypt Hood', 'Ossuary Crown', "Penitent's Cowl", 'Dread Visage', "Gravekeeper's Mask", 'Halo of Thorns'],
  armor: ['Ragged Shroud', 'Bloodweave Vestment', 'Boneplate Harness', 'Vestment of Sighs', 'Carrion Mail', 'Winding Sheet'],
  boots: ['Ashen Treads', 'Gravewalker Boots', 'Wraithhide Striders', "Mourner's Steps", 'Tombstone Spurs'],
  amulet: ['Blood Rosary', 'Reliquary Pendant', 'Tear of the Saint', 'Ossified Heart', 'Crimson Sigil'],
  ring: ['Ossuary Band', 'Signet of Hunger', 'Grave Ring', 'Bloodbound Circle', 'Ring of the Pale'],
};

const PREFIXES = {
  damagePct: ['Cruel', 'Bloodthirsty', 'Vicious', 'Grim', 'Savage'],
  flatDamage: ['Honed', 'Jagged', 'Bonecarved'],
  attackSpeed: ['Swift', 'Frenzied', 'Rapid'],
  critChance: ['Precise', 'Deadly', 'Keen'],
  critDamage: ['Brutal', 'Wicked', 'Merciless'],
  maxHp: ['Stalwart', 'Gravid', 'Stout'],
  armor: ['Warded', 'Ironbound', 'Graveforged'],
  moveSpeed: ['Wraithstep', 'Fleet', 'Shadow'],
  pickup: ['Greedy', 'Magnetic', 'Covetous'],
  xpGain: ['Ancestral', 'Scholarly', 'Elder'],
  lifeOnHit: ['Vampiric', 'Sanguine', 'Leeching'],
  regen: ['Restful', 'Mending', 'Everliving'],
  luck: ['Fortunate', 'Omenbound', 'Charmed'],
  area: ['Wide', 'Sweeping', 'Ravenous'],
  projectiles: ['Splintered', 'Manyfold', 'Swarming'],
};

const SUFFIXES = [
  'of the Grave', 'of the Blood Moon', 'of Rot', 'of the Hollow', 'of Night',
  'of the Ossuary', 'of Thorns', 'of the Drowned', 'of Ash', 'of the Covenant',
];

export const LEGENDARY_POWERS = [
  { id: 'vampiric', name: 'The Thirst', desc: 'Heal for 8% of all damage you deal.' },
  { id: 'chain', name: 'Chained Souls', desc: 'Soul Bolts chain to 2 additional targets.' },
  { id: 'nova', name: 'Blood Nova', desc: 'Every 4s, erupt for 45 damage around you.' },
  { id: 'gravity', name: 'Grave Gravity', desc: '+140 pickup radius. Loot is pulled to you.' },
  { id: 'berserk', name: 'Last Rites', desc: 'Deal 30% more damage below 50% health.' },
  { id: 'reaper', name: 'Harvest', desc: 'Scythe strikes execute enemies below 18% health.' },
  { id: 'orbit', name: 'Bone Halo', desc: 'Gain 2 orbiting blades, even without the skill.' },
  { id: 'swift', name: 'Quickening', desc: '+15% move speed and +10% attack speed.' },
];

export const RARITY_ORDER = ['common', 'magic', 'rare', 'legendary', 'mythic'];

let itemCounter = 0;

export function rarityRank(key) {
  return RARITY_ORDER.indexOf(key);
}

export function rarityInfo(key) {
  return RARITIES[key] || RARITIES.common;
}

export function rollRarity(rng, { luck = 0, minRarity = 'common' } = {}) {
  const min = rarityRank(minRarity);
  const luckScale = 1 + Math.max(0, luck) / 100;
  const entries = [
    { value: 'common', weight: 1000 },
    { value: 'magic', weight: 350 * Math.pow(luckScale, 0.55) },
    { value: 'rare', weight: 88 * Math.pow(luckScale, 1.15) },
    { value: 'legendary', weight: 20 * Math.pow(luckScale, 1.8) },
    { value: 'mythic', weight: 2.6 * Math.pow(luckScale, 2.5) },
  ].filter((entry) => rarityRank(entry.value) >= min);
  return weightedPick(rng, entries);
}

export function affixValue(stat, min, max, ilvl, rarityKey, rng) {
  const levelScale = 1 + Math.max(0, ilvl - 1) * 0.082;
  const rarityScale = RARITIES[rarityKey]?.mult || 1;
  let value = rand(rng, min, max) * levelScale * rarityScale;
  if (stat === 'regen') value = Math.round(value * 10) / 10;
  else if (STAT_DEFS[stat]?.pct) value = Math.round(value);
  else value = Math.max(1, Math.round(value));
  return value;
}

export function formatAffix(affix) {
  const def = STAT_DEFS[affix.stat] || { label: affix.stat, suffix: '' };
  const value = def.flat ? `+${affix.value}` : `+${affix.value}${def.suffix || ''}`;
  return `${def.label} ${value}`;
}

function makeName(rng, slot, rarityKey, affixes) {
  const base = pick(rng, BASE_NAMES[slot]);
  if (rarityKey === 'common') return base;
  const primary = affixes[0]?.stat;
  const prefixes = PREFIXES[primary] || ['Pale'];
  const prefix = pick(rng, prefixes);
  if (rarityKey === 'magic') return `${prefix} ${base}`;
  const suffix = pick(rng, SUFFIXES);
  return `${prefix} ${base} ${suffix}`;
}

export function itemScore(item) {
  if (!item) return 0;
  let score = 0;
  for (const affix of item.affixes || []) {
    const def = STAT_DEFS[affix.stat];
    score += (def?.weight || 1) * affix.value;
  }
  if (item.legendary) score += 24;
  return Math.round(score);
}

export function generateItem(rng, options = {}) {
  const slot = options.slot || pick(rng, SLOTS);
  const ilvl = Math.max(1, Math.round(options.ilvl || 1));
  const rarityKey = options.rarity || rollRarity(rng, { luck: options.luck || 0, minRarity: options.minRarity || 'common' });
  const rarity = RARITIES[rarityKey] || RARITIES.common;
  const pool = SLOT_AFFIXES[slot].slice();
  const affixes = [];
  const count = Math.min(rarity.affixes, pool.length);

  for (let i = 0; i < count; i++) {
    const chosen = weightedPick(rng, pool.map((entry) => ({ value: entry, weight: entry.weight })));
    const index = pool.indexOf(chosen);
    pool.splice(index, 1);
    affixes.push({
      stat: chosen.stat,
      value: affixValue(chosen.stat, chosen.min, chosen.max, ilvl, rarityKey, rng),
    });
  }

  let legendary = null;
  if (rarityKey === 'legendary' || rarityKey === 'mythic') {
    legendary = pick(rng, LEGENDARY_POWERS);
  }

  itemCounter = (itemCounter + 1) % 100000;
  const item = {
    id: `it_${itemCounter}_${Math.floor(rng() * 1e9).toString(36)}`,
    slot,
    rarity: rarityKey,
    ilvl,
    affixes,
    legendary,
    name: makeName(rng, slot, rarityKey, affixes),
  };
  item.score = itemScore(item);
  return item;
}

export function aggregateStats(items) {
  const totals = {};
  for (const item of items) {
    if (!item) continue;
    for (const affix of item.affixes) {
      totals[affix.stat] = (totals[affix.stat] || 0) + affix.value;
    }
  }
  return totals;
}

export function hasPower(items, id) {
  return items.some((item) => item?.legendary?.id === id);
}

export function statDisplay(stat, value, signed = true) {
  const def = STAT_DEFS[stat] || { label: stat, suffix: '' };
  const sign = signed ? (value >= 0 ? '+' : '') : '';
  return `${sign}${value}${def.suffix || ''}`;
}

export function rarityCounts(items) {
  const counts = { common: 0, magic: 0, rare: 0, legendary: 0, mythic: 0 };
  for (const item of items) {
    if (item && counts[item.rarity] !== undefined) counts[item.rarity]++;
  }
  return counts;
}

export function compareItemToEquipped(item, equipped) {
  const mine = item ? item.score : 0;
  const theirs = equipped ? equipped.score : 0;
  return { power: mine, equippedPower: theirs, delta: mine - theirs };
}
