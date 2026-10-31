// Loot generation, stat aggregation, icons and tooltips.

import {
  RARITIES, RARITY_ORDER, BASES, AFFIXES, AFFIX_SUFFIX, UNIQUES,
  SLOT_LABEL, STAT_LABEL
} from './data.js';

export class RNG {
  constructor(seed = Date.now()) {
    this.s = seed >>> 0;
  }
  next() {
    this.s = (this.s + 0x6D2B79F5) >>> 0;
    let t = this.s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
  range(min, max) { return min + this.next() * (max - min); }
  int(min, max) { return Math.floor(this.range(min, max + 1)); }
  pick(list) { return list[Math.floor(this.next() * list.length)]; }
  chance(p) { return this.next() < p; }
  weighted(entries) {
    const total = entries.reduce((n, e) => n + e.weight, 0);
    let roll = this.next() * total;
    for (const entry of entries) {
      roll -= entry.weight;
      if (roll <= 0) return entry;
    }
    return entries[entries.length - 1];
  }
}

let uidCounter = 1;
export function nextUid() { return `itm_${uidCounter++}`; }

export function emptyStats() {
  return {
    damagePct: 0, attackSpeedPct: 0, moveSpeedPct: 0, maxLife: 0, armor: 0,
    critChance: 0, critDamage: 0, pickup: 0, goldFind: 0, magicFind: 0,
    regen: 0, lifesteal: 0, projectiles: 0, areaPct: 0, xpGain: 0, thorns: 0
  };
}

export function addStats(target, source = {}) {
  for (const [key, value] of Object.entries(source)) {
    if (typeof value !== 'number') continue;
    if (key in target) target[key] += value;
    else target[key] = value;
  }
  return target;
}

export function rarityRank(rarity) { return RARITY_ORDER.indexOf(rarity); }

function rollRarity(rng, magicFind = 0, minRarity = 'common') {
  const mf = Math.max(0, magicFind);
  const entries = [
    { id: 'common', weight: Math.max(12, 54 - mf * 0.42) },
    { id: 'magic', weight: 29 + mf * 0.08 },
    { id: 'rare', weight: 13 + mf * 0.26 },
    { id: 'legendary', weight: 4 + mf * 0.09 }
  ];
  let rarity = rng.weighted(entries).id;
  if (rarityRank(rarity) < rarityRank(minRarity)) rarity = minRarity;
  return rarity;
}

function affixValue(affix, rng, ilvl) {
  if (affix.integer) return 1;
  const scale = 1 + (ilvl - 1) * 0.075;
  let value = rng.range(affix.min, affix.max) * scale;
  if (affix.step >= 1) value = Math.round(value);
  else value = Math.round(value * 10) / 10;
  return Math.max(affix.step, value);
}

function pickAffixes(rng, slot, count, ilvl, excluded = new Set()) {
  const pool = AFFIXES.filter(a => a.slots.includes(slot) && !excluded.has(a.stat));
  const picked = [];
  while (picked.length < count && pool.length) {
    const affix = rng.weighted(pool.map(a => ({ ...a, weight: a.weight })));
    const index = pool.findIndex(a => a.id === affix.id);
    if (index < 0) break;
    pool.splice(index, 1);
    if (excluded.has(affix.stat)) continue;
    excluded.add(affix.stat);
    const value = affixValue(affix, rng, ilvl);
    picked.push({
      id: affix.id,
      stat: affix.stat,
      label: affix.label,
      value,
      text: affix.format(value),
      prefix: affix.prefix
    });
  }
  return picked;
}

function scaledBase(slot, base, ilvl) {
  const growth = 1 + (ilvl - 1) * 0.16;
  const item = {
    slot,
    baseId: base.id,
    baseName: base.name,
    flavor: base.flavor || '',
    implicit: base.implicit || '',
    stats: {},
    implicitText: [],
    affixes: [],
    unique: null,
    flags: {},
    icon: base.icon || slot
  };
  if (slot === 'weapon') {
    item.damage = Math.round(base.damage * growth * 10) / 10;
    item.interval = base.interval;
    item.range = base.range;
    item.speed = base.speed;
    item.kind = base.kind;
    item.count = base.count || 1;
    item.pierce = base.pierce || 0;
    item.radius = base.radius || 0;
    item.chains = base.chains || 0;
    item.color = base.color;
    item.implicitText.push(`${item.damage} Damage`, `${base.interval.toFixed(2)}s Attack Time`);
  } else {
    for (const [key, value] of Object.entries(base)) {
      if (typeof value !== 'number') continue;
      const scaled = key === 'moveSpeedPct' || key === 'critChance'
        ? value
        : Math.round(value * (1 + (ilvl - 1) * 0.14) * 10) / 10;
      item.stats[key] = scaled;
      item.implicitText.push(formatStatValue(key, scaled));
    }
  }
  return item;
}

export function generateItem(rng, {
  ilvl = 1, minRarity = 'common', magicFind = 0, slot = null, forceUnique = false
} = {}) {
  ilvl = Math.max(1, Math.min(20, Math.round(ilvl)));
  const chosenSlot = slot || rng.pick(['weapon', 'armor', 'amulet', 'ring']);
  let rarity = forceUnique ? 'legendary' : rollRarity(rng, magicFind, minRarity);
  const uniqueChance = 0.72 + Math.min(0.18, magicFind / 300);
  const canBeUnique = rarity === 'legendary' && (forceUnique || rng.chance(uniqueChance));
  const uniques = UNIQUES[chosenSlot] || [];

  if (canBeUnique && uniques.length) {
    const unique = rng.pick(uniques);
    const base = BASES[chosenSlot].find(b => b.id === unique.base) || BASES[chosenSlot][0];
    const item = scaledBase(chosenSlot, base, ilvl);
    item.rarity = 'legendary';
    item.uid = nextUid();
    item.ilvl = ilvl;
    item.name = unique.name;
    item.unique = { id: unique.id, name: unique.name, power: unique.power, flavor: unique.flavor, stats: unique.stats };
    item.flags = { ...unique.flags };
    addStats(item.stats, unique.stats);
    // Legendary uniques carry three random affixes in addition to their fixed power.
    const excluded = new Set(Object.keys(unique.stats));
    item.affixes = pickAffixes(rng, chosenSlot, 3, ilvl, excluded);
    for (const affix of item.affixes) addStats(item.stats, { [affix.stat]: affix.value });
    item.salvage = Math.round(RARITIES.legendary.salvage + ilvl * 8 + 35);
    return item;
  }

  const base = rng.pick(BASES[chosenSlot]);
  const item = scaledBase(chosenSlot, base, ilvl);
  item.rarity = rarity;
  item.uid = nextUid();
  item.ilvl = ilvl;
  const [minAffixes, maxAffixes] = RARITIES[rarity].affixes;
  const count = rng.int(minAffixes, maxAffixes);
  item.affixes = pickAffixes(rng, chosenSlot, count, ilvl);
  for (const affix of item.affixes) addStats(item.stats, { [affix.stat]: affix.value });

  if (rarity === 'legendary') {
    // A legendary without a unique power is still a trophy: four affixes and a dread name.
    if (item.affixes.length < 4) {
      const excluded = new Set(item.affixes.map(a => a.stat));
      item.affixes.push(...pickAffixes(rng, chosenSlot, 4 - item.affixes.length, ilvl, excluded));
      for (const affix of item.affixes.slice(-(4 - count))) addStats(item.stats, { [affix.stat]: affix.value });
    }
    item.name = `Dread ${base.name} of the Abyss`;
  } else if (rarity === 'rare') {
    const prefix = item.affixes[0]?.prefix || 'Grim';
    const suffix = AFFIX_SUFFIX[item.affixes[1]?.stat || item.affixes[0]?.stat] || 'of the Grave';
    item.name = `${prefix} ${base.name} ${suffix}`;
  } else if (rarity === 'magic') {
    const prefix = item.affixes[0]?.prefix || 'Ashen';
    item.name = `${prefix} ${base.name}`;
  } else {
    item.name = base.name;
  }

  item.salvage = Math.round(RARITIES[rarity].salvage + ilvl * 3.5 + item.affixes.length * 4);
  return item;
}

export function formatStatValue(stat, value) {
  const v = Math.round(value * 10) / 10;
  switch (stat) {
    case 'damagePct': return `+${v}% Damage`;
    case 'attackSpeedPct': return `+${v}% Attack Speed`;
    case 'moveSpeedPct': return `+${v}% Move Speed`;
    case 'maxLife': return `${v >= 0 ? '+' : ''}${v} Max Life`;
    case 'armor': return `+${v} Armor`;
    case 'critChance': return `+${v}% Crit Chance`;
    case 'critDamage': return `+${v}% Crit Damage`;
    case 'pickup': return `+${v} Pickup Radius`;
    case 'goldFind': return `+${v}% Gold Find`;
    case 'magicFind': return `+${v}% Magic Find`;
    case 'regen': return `+${v}/s Life Regen`;
    case 'lifesteal': return `+${v}% Life Steal`;
    case 'projectiles': return `+${v} Projectile${v === 1 ? '' : 's'}`;
    case 'areaPct': return `+${v}% Area`;
    case 'xpGain': return `+${v}% XP Gain`;
    case 'thorns': return `+${v} Thorns`;
    default: return `+${v} ${STAT_LABEL[stat] || stat}`;
  }
}

export function aggregateEquipment(equipment, boonStats = emptyStats()) {
  const stats = emptyStats();
  addStats(stats, boonStats);
  const flags = {
    pierce: 0, explodeOnKill: 0, bleedOnCrit: false, chainBonus: 0,
    burningGround: false, infinitePierce: false, evade: 0, thorns: 0,
    healOnKill: 0, burnOnHit: 0, goldHeal: 0
  };
  for (const item of Object.values(equipment)) {
    if (!item) continue;
    addStats(stats, item.stats);
    if (item.flags) {
      flags.pierce += item.flags.pierce || 0;
      flags.explodeOnKill = Math.max(flags.explodeOnKill, item.flags.explodeOnKill || 0);
      flags.bleedOnCrit = flags.bleedOnCrit || !!item.flags.bleedOnCrit;
      flags.chainBonus += item.flags.chainBonus || 0;
      flags.burningGround = flags.burningGround || !!item.flags.burningGround;
      flags.infinitePierce = flags.infinitePierce || !!item.flags.infinitePierce;
      flags.evade = Math.max(flags.evade, item.flags.evade || 0);
      flags.thorns += item.flags.thorns || 0;
      flags.healOnKill += item.flags.healOnKill || 0;
      flags.burnOnHit = Math.max(flags.burnOnHit, item.flags.burnOnHit || 0);
      flags.goldHeal += item.flags.goldHeal || 0;
    }
  }

  const weaponItem = equipment.weapon;
  const weapon = weaponItem ? {
    id: weaponItem.baseId,
    name: weaponItem.name,
    kind: weaponItem.kind,
    damage: weaponItem.damage,
    interval: weaponItem.interval,
    range: weaponItem.range,
    speed: weaponItem.speed,
    count: weaponItem.count || 1,
    pierce: (weaponItem.pierce || 0) + flags.pierce,
    radius: weaponItem.radius || 0,
    chains: (weaponItem.chains || 0) + flags.chainBonus,
    color: weaponItem.color || '#8fe7ff'
  } : {
    id: 'fists', name: 'Bare Hands', kind: 'bolt', damage: 5, interval: 1,
    range: 300, speed: 480, count: 1, pierce: 0, radius: 0, chains: 0, color: '#d9d1bd'
  };

  flags.thorns += stats.thorns;
  const maxLife = Math.max(20, 120 + stats.maxLife);
  const critChance = Math.max(0, Math.min(0.8, (5 + stats.critChance) / 100));
  const critMult = 1.5 + stats.critDamage / 100;
  const damageMult = 1 + stats.damagePct / 100;
  const interval = weapon.interval / (1 + stats.attackSpeedPct / 100);
  const weaponDamage = weapon.damage * damageMult;
  let shots = 1;
  if (weapon.kind === 'knives') shots = weapon.count + stats.projectiles;
  else if (weapon.kind === 'bolt') shots = 1 + stats.projectiles;
  else if (weapon.kind === 'spear' || weapon.kind === 'orb') shots = 1 + Math.floor(stats.projectiles / 2);
  else if (weapon.kind === 'storm') shots = 1 + Math.max(0, weapon.chains - 1) * 0.4;
  const dps = weaponDamage * shots / Math.max(0.12, interval) * (1 + critChance * (critMult - 1));

  return {
    ...stats,
    maxLife,
    moveSpeed: 205 * (1 + stats.moveSpeedPct / 100),
    critChance,
    critMult,
    pickup: 110 + stats.pickup,
    damageMult,
    interval,
    weapon,
    weaponDamage,
    dps,
    flags
  };
}

export function itemScore(item, boonStats, equipment = {}) {
  const before = aggregateEquipment(equipment, boonStats);
  const after = aggregateEquipment({ ...equipment, [item.slot]: item }, boonStats);
  let score = (after.dps - before.dps) * 4;
  score += (after.maxLife - before.maxLife) * 0.35;
  score += (after.armor - before.armor) * 1.2;
  score += (after.moveSpeed - before.moveSpeed) * 0.6;
  score += (after.critChance - before.critChance) * 220;
  score += (after.pickup - before.pickup) * 0.15;
  score += (after.goldFind - before.goldFind) * 0.1;
  score += (after.magicFind - before.magicFind) * 0.12;
  score += (after.lifesteal - before.lifesteal) * 2.5;
  score += (after.projectiles - before.projectiles) * 12;
  score += (after.regen - before.regen) * 5;
  score += (after.thorns - before.thorns) * 0.4;
  return score;
}

export function compareRows(item, equipment, boonStats) {
  const before = aggregateEquipment(equipment, boonStats);
  const after = aggregateEquipment({ ...equipment, [item.slot]: item }, boonStats);
  const rows = [];
  const push = (label, a, b, suffix = '', decimals = 0) => {
    const diff = b - a;
    if (Math.abs(diff) < (decimals ? 0.05 : 0.5)) return;
    const sign = diff > 0 ? '+' : '';
    rows.push({
      label,
      text: `${sign}${diff.toFixed(decimals)}${suffix}`,
      up: diff > 0
    });
  };
  push('DPS', before.dps, after.dps, '', 1);
  push('Max Life', before.maxLife, after.maxLife);
  push('Armor', before.armor, after.armor);
  push('Move Speed', before.moveSpeed, after.moveSpeed);
  push('Crit Chance', before.critChance * 100, after.critChance * 100, '%', 1);
  push('Attack Speed', before.attackSpeedPct, after.attackSpeedPct, '%');
  push('Damage', before.damagePct, after.damagePct, '%');
  push('Pickup', before.pickup, after.pickup);
  push('Gold Find', before.goldFind, after.goldFind, '%');
  push('Magic Find', before.magicFind, after.magicFind, '%');
  push('Life Steal', before.lifesteal, after.lifesteal, '%', 1);
  push('Projectiles', before.projectiles, after.projectiles);
  push('Area', before.areaPct, after.areaPct, '%');
  push('Regen', before.regen, after.regen, '/s', 1);
  return rows;
}

function statLine(stat, value) {
  return formatStatValue(stat, value);
}

export function itemTooltipHTML(item, { equipment = {}, boonStats = emptyStats(), compact = false } = {}) {
  if (!item) return '';
  const rarity = RARITIES[item.rarity] || RARITIES.common;
  const base = BASES[item.slot]?.find(b => b.id === item.baseId);
  const current = equipment[item.slot];
  const rows = compact ? [] : compareRows(item, equipment, boonStats);
  const affixLines = item.affixes.map(a => `<div class="tt-affix">${a.text}</div>`).join('');
  const unique = item.unique ? `
    <div class="tt-unique">
      <b>Unique Power</b>
      <p>${item.unique.power}</p>
      ${item.unique.stats ? `<div class="tt-unique-stats">${Object.entries(item.unique.stats).map(([stat, value]) => formatStatValue(stat, value)).join(' · ')}</div>` : ''}
    </div>` : '';
  const compare = rows.length ? `
    <div class="tt-compare">
      ${rows.map(r => `<div><span>${r.label}</span><b class="${r.up ? 'up' : 'down'}">${r.text}</b></div>`).join('')}
    </div>` : (current && !compact ? `<div class="tt-compare"><div><span>Compared to equipped</span><b>No change</b></div></div>` : '');
  const equippedLine = current && !compact
    ? `<div class="tt-equipped">Equipped: ${current.name}</div>` : '';
  return `
    <div class="tt-name" style="color:${rarity.color}">${item.name}</div>
    <span class="tt-base">${SLOT_LABEL[item.slot]} · ${base?.name || item.baseName} · Item Level ${item.ilvl}</span>
    <div class="tt-sep"></div>
    <div class="tt-implicit">${item.implicitText.join('<br>')}</div>
    ${affixLines ? `<div class="tt-sep"></div>${affixLines}` : ''}
    ${unique}
    ${compare}
    ${equippedLine}
    <div class="tt-equipped" style="border:0;padding-top:4px;font-style:italic;opacity:.65">${item.flavor || ''}</div>
  `;
}

/* ---------------- icons ---------------- */

const SLOT_GLYPH = {
  weapon: `<path d="M10 38 34 14l4 4L14 42l-5 1 1-5Z"/><path d="m30 10 8 8M14 42l-5 1"/>`,
  armor: `<path d="M16 11 8 17l4 7 3-2v15h18V22l3 2 4-7-8-6-4 4h-8l-4-4Z"/><path d="M24 15v20"/>`,
  amulet: `<path d="M14 9c0 7 4 10 10 14 6-4 10-7 10-14"/><path d="m24 24 5 6-5 8-5-8 5-6Z"/>`,
  ring: `<circle cx="24" cy="27" r="9"/><path d="m24 11 5 7h-10l5-7Z"/><path d="m20 18 4-7 4 7"/>`
};

const ITEM_GLYPH = {
  wand: `<path d="M12 39 31 20"/><circle cx="35" cy="16" r="5"/><path d="M31 20l4-4"/><path d="M9 42l3-3M35 9v-3M42 16h3M38 8l2-2"/>`,
  cleaver: `<path d="M11 40 21 30"/><path d="M20 31 34 9l7 5-13 22-8-5Z"/><path d="M27 18l8 5M12 37l-3 5"/>`,
  spear: `<path d="M8 41 36 13"/><path d="m33 9 8 8-6 1-3-3 1-6Z"/><path d="M11 36l5 5M7 44l2-2"/>`,
  knives: `<path d="M9 30 24 12l4 3-13 20-6-5Z"/><path d="M22 38 37 20l4 3-13 20-6-5Z"/><path d="m13 30 5 4M27 38l5 4"/>`,
  orb: `<circle cx="24" cy="26" r="9"/><path d="M24 9c4 5 2 8-1 10-4-3-6-6 1-10Z"/><path d="M13 38c4 3 18 3 22 0"/><path d="M17 26h1M30 26h1"/>`,
  scepter: `<path d="M11 40 31 20"/><path d="m28 12 4 4 5-4-2 6 6 1-6 3 2 6-5-4-4 4 1-6-6-2 6-2-1-6Z"/>`,
  armor: `<path d="M16 10 8 16l4 8 3-2v16h18V22l3 2 4-8-8-6-4 4h-8l-4-4Z"/><path d="M24 14v20M16 25h16"/>`,
  amulet: `<path d="M14 8c0 8 4 11 10 15 6-4 10-7 10-15"/><path d="m24 23 6 7-6 9-6-9 6-7Z"/><path d="m21 30 3-2 3 2-3 3-3-3Z"/>`,
  ring: `<circle cx="24" cy="28" r="9"/><path d="m24 10 6 8H18l6-8Z"/><path d="m20 18 4-8 4 8"/><path d="m21 28 3-2 3 2-3 3-3-3Z"/>`
};

export function iconSVG(kind, className = '') {
  const glyph = ITEM_GLYPH[kind] || SLOT_GLYPH[kind] || SLOT_GLYPH.weapon;
  return `<svg class="${className}" viewBox="0 0 48 48" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${glyph}</svg>`;
}

export function slotGlyph(slot) {
  return iconSVG(slot, 'slot-glyph');
}

export function itemIconHTML(item, extraClass = '') {
  if (!item) return '';
  const rarity = item.rarity || 'common';
  const kind = item.slot === 'weapon' ? (item.icon || 'wand') : item.slot;
  return `<span class="item-icon rarity-${rarity} ${extraClass}">${iconSVG(kind)}</span>`;
}

export function itemPowerLabel(item, boonStats, equipment = {}) {
  if (!item) return '';
  const score = itemScore(item, boonStats, equipment);
  return score > 0.8 ? 'Upgrade' : score < -0.8 ? 'Downgrade' : 'Sidegrade';
}

export function makeStarterWeapon() {
  const base = BASES.weapon[0];
  const item = scaledBase('weapon', base, 1);
  item.rarity = 'common';
  item.uid = nextUid();
  item.ilvl = 1;
  item.name = base.name;
  item.affixes = [];
  item.salvage = 5;
  return item;
}

