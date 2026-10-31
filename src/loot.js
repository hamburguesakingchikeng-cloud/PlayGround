import { RARITY, RARITY_ORDER, SLOTS, SLOT_ORDER, BASES, AFFIXES, POWERS, RARE_ADJ, RARE_NOUN } from './data.js';
import { clamp, rand, randInt, pick, round1, shuffle } from './core.js';

let nextItemId = 1;

export const STAT_META = {
  weaponDamage: { label: 'Weapon Damage', fmt: 'flat', weight: 2.2 },
  armor: { label: 'Armor', fmt: 'flat', weight: 1.35 },
  maxHp: { label: 'Max Life', fmt: 'flat', weight: 0.55 },
  might: { label: 'Might', fmt: 'pct', weight: 3.2 },
  speed: { label: 'Move Speed', fmt: 'pct', weight: 2.2 },
  cdr: { label: 'Cooldown Reduction', fmt: 'pct', weight: 2.6 },
  area: { label: 'Area', fmt: 'pct', weight: 1.8 },
  magnet: { label: 'Magnet', fmt: 'flat', weight: 0.25 },
  crit: { label: 'Crit Chance', fmt: 'pct', weight: 5 },
  critDmg: { label: 'Crit Damage', fmt: 'pct', weight: 0.9 },
  regen: { label: 'Life Regen', fmt: 'dec', weight: 9 },
  xp: { label: 'Experience Gain', fmt: 'pct', weight: 0.5 },
  gold: { label: 'Gold Find', fmt: 'pct', weight: 0.2 },
  luck: { label: 'Luck', fmt: 'pct', weight: 0.9 },
};

export function rarityOf(item) {
  return RARITY[item.rarity];
}

export function rollRarity(luck = 0, minRarity = null) {
  const l = clamp(luck, 0, 120);
  const weights = {
    common: Math.max(8, RARITY.common.weight - l * 0.9),
    magic: RARITY.magic.weight + l * 0.35,
    rare: RARITY.rare.weight + l * 0.55,
    legendary: RARITY.legendary.weight + l * 0.28,
  };
  let total = 0;
  for (const k of RARITY_ORDER) total += weights[k];
  let roll = Math.random() * total;
  let result = 'common';
  for (const k of RARITY_ORDER) {
    roll -= weights[k];
    if (roll <= 0) {
      result = k;
      break;
    }
  }
  if (minRarity) {
    const minIdx = RARITY_ORDER.indexOf(minRarity);
    if (RARITY_ORDER.indexOf(result) < minIdx) result = minRarity;
  }
  return result;
}

function weightedSlot() {
  const weights = { weapon: 18, helm: 13, chest: 13, gloves: 13, boots: 13, ring: 15, amulet: 15 };
  let total = 0;
  for (const k of SLOT_ORDER) total += weights[k];
  let roll = Math.random() * total;
  for (const k of SLOT_ORDER) {
    roll -= weights[k];
    if (roll <= 0) return k;
  }
  return 'weapon';
}

function chooseBase(slot, ilvl) {
  const maxTier = clamp(1 + Math.floor(ilvl / 8), 1, 3);
  const options = BASES[slot].filter((b) => b.tier <= maxTier);
  const weights = options.map((b) => 1 + (b.tier - 1) * 2.5);
  let total = 0;
  for (const w of weights) total += w;
  let roll = Math.random() * total;
  for (let i = 0; i < options.length; i++) {
    roll -= weights[i];
    if (roll <= 0) return options[i];
  }
  return options[options.length - 1];
}

function scaled(range, ilvl, scale, rarityMult, fmt) {
  const raw = rand(range[1], range[0]) * (1 + (ilvl - 1) * scale) * rarityMult;
  if (fmt === 'dec') return Math.max(0.1, round1(raw));
  return Math.max(1, Math.round(raw));
}

function chooseAffixes(count, ilvl, rarityMult, fmtOverride = {}) {
  const pool = shuffle(AFFIXES);
  const out = [];
  for (const def of pool) {
    if (out.length >= count) break;
    const value = scaled(def.range, ilvl, def.scale, rarityMult, def.fmt);
    out.push({
      id: def.id,
      stat: def.stat,
      label: def.label,
      fmt: def.fmt,
      value,
      prefix: def.prefix,
      suffix: def.suffix,
    });
  }
  return out;
}

function implicitFor(base, slot, ilvl, rarityMult) {
  if (slot === 'weapon') {
    const lo = Math.max(1, Math.round(base.dmg[0] * (1 + (ilvl - 1) * 0.3) * rarityMult));
    const hi = Math.max(lo + 1, Math.round(base.dmg[1] * (1 + (ilvl - 1) * 0.3) * rarityMult));
    return { stat: 'weaponDamage', label: 'Weapon Damage', fmt: 'range', lo, hi, value: (lo + hi) / 2 };
  }
  if (slot === 'ring') {
    const lo = Math.max(1, Math.round(base.crit[0] * (1 + (ilvl - 1) * 0.1) * rarityMult));
    const hi = Math.max(lo + 1, Math.round(base.crit[1] * (1 + (ilvl - 1) * 0.1) * rarityMult));
    return { stat: 'crit', label: 'Crit Chance', fmt: 'pct', lo, hi, value: (lo + hi) / 2 };
  }
  if (slot === 'amulet') {
    const lo = Math.max(1, Math.round(base.hp[0] * (1 + (ilvl - 1) * 0.18) * rarityMult));
    const hi = Math.max(lo + 1, Math.round(base.hp[1] * (1 + (ilvl - 1) * 0.18) * rarityMult));
    return { stat: 'maxHp', label: 'Max Life', fmt: 'flat', lo, hi, value: (lo + hi) / 2 };
  }
  const lo = Math.max(1, Math.round(base.armor[0] * (1 + (ilvl - 1) * 0.22) * rarityMult));
  const hi = Math.max(lo + 1, Math.round(base.armor[1] * (1 + (ilvl - 1) * 0.22) * rarityMult));
  return { stat: 'armor', label: 'Armor', fmt: 'flat', lo, hi, value: (lo + hi) / 2 };
}

function makeName(item) {
  const base = item.base.name;
  if (item.rarity === 'legendary') return item.power.title;
  if (item.rarity === 'common') return base;
  const first = item.affixes[0];
  const second = item.affixes[1];
  if (item.rarity === 'rare') {
    const adj = pick(RARE_ADJ);
    const suffix = (item.affixes[item.affixes.length - 1] || first || {}).suffix || '';
    return `${adj} ${base}${suffix ? ' ' + suffix : ''}`;
  }
  if (item.affixes.length >= 2) {
    return `${first.prefix} ${base} ${second.suffix}`;
  }
  if (first && Math.random() < 0.5) return `${first.prefix} ${base}`;
  if (first) return `${base} ${first.suffix}`;
  return base;
}

export function makeItem({ ilvl = 1, slot = null, rarity = null, luck = 0, baseId = null, minRarity = null } = {}) {
  ilvl = Math.max(1, Math.round(ilvl));
  slot = slot || weightedSlot();
  rarity = rarity || rollRarity(luck, minRarity);
  const rar = RARITY[rarity];
  const base = baseId
    ? BASES[slot].find((b) => b.id === baseId) || chooseBase(slot, ilvl)
    : chooseBase(slot, ilvl);

  let count;
  if (rarity === 'common') {
    count = Math.random() < 0.55 ? 0 : 1;
  } else {
    count = randInt(rar.affixes[0], rar.affixes[1]);
  }
  const affixes = chooseAffixes(count, ilvl, rar.mult);
  const item = {
    id: nextItemId++,
    slot,
    base,
    rarity,
    ilvl,
    implicit: implicitFor(base, slot, ilvl, rar.mult),
    affixes,
    power: 0,
    legendaryPower: null,
    name: '',
    sellValue: 0,
  };

  if (rarity === 'legendary') {
    item.legendaryPower = pick(POWERS);
  }
  item.name = makeName(item);
  item.power = powerOf(item);
  item.sellValue = Math.max(2, Math.round((3 + ilvl * 1.4) * rar.sell));
  return item;
}

export function powerOf(item) {
  const rar = RARITY[item.rarity];
  let score = 4 + rar.order * 7;
  score += (STAT_META[item.implicit.stat]?.weight || 1) * item.implicit.value;
  for (const a of item.affixes) {
    score += (STAT_META[a.stat]?.weight || 1) * a.value;
  }
  if (item.legendaryPower) score += 28;
  return Math.round(score);
}

export function contributions(item) {
  const out = {};
  if (!item) return out;
  const add = (stat, value) => {
    out[stat] = (out[stat] || 0) + value;
  };
  add(item.implicit.stat, item.implicit.value);
  for (const a of item.affixes) add(a.stat, a.value);
  return out;
}

export function aggregate(equipment) {
  const stats = {
    weaponDamage: 0, armor: 0, maxHp: 0, might: 0, speed: 0, cdr: 0,
    area: 0, magnet: 0, crit: 0, critDmg: 0, regen: 0, xp: 0, gold: 0, luck: 0,
    powers: [],
  };
  for (const slot of SLOT_ORDER) {
    const item = equipment[slot];
    if (!item) continue;
    stats[item.implicit.stat] += item.implicit.value;
    for (const a of item.affixes) stats[a.stat] += a.value;
    if (item.legendaryPower) stats.powers.push(item.legendaryPower);
  }
  return stats;
}

export function formatStat(fmt, value) {
  if (fmt === 'pct') return `${Math.round(value)}%`;
  if (fmt === 'dec') return `+${round1(value)}`;
  if (fmt === 'range') return `${Math.round(value)}`;
  return `${Math.round(value)}`;
}

export function itemImplicitText(item) {
  const imp = item.implicit;
  if (imp.fmt === 'range') return `${imp.lo}–${imp.hi} Weapon Damage`;
  if (imp.fmt === 'pct') return `+${Math.round(imp.lo)}–${Math.round(imp.hi)}% ${imp.label}`;
  return `+${imp.lo}–${imp.hi} ${imp.label}`;
}

export function affixText(a) {
  return `+${formatStat(a.fmt, a.value)} ${a.label}`;
}

export function compareLines(item, equipped) {
  const mine = contributions(item);
  const theirs = contributions(equipped);
  const stats = new Set([...Object.keys(mine), ...Object.keys(theirs)]);
  const lines = [];
  for (const stat of stats) {
    const meta = STAT_META[stat];
    if (!meta) continue;
    const value = mine[stat] || 0;
    const other = theirs[stat] || 0;
    const delta = value - other;
    if (Math.abs(delta) < 0.01 && value === 0) continue;
    lines.push({
      stat,
      label: meta.label,
      fmt: meta.fmt,
      value,
      other,
      delta,
      weight: meta.weight,
    });
  }
  lines.sort((a, b) => b.weight - a.weight);
  return lines;
}

export function itemLevelFor(time, playerLevel) {
  return Math.max(1, Math.round(1 + time / 34 + playerLevel * 0.42));
}

export function makeStartingItem(relic) {
  const item = makeItem({
    ilvl: 1,
    slot: 'weapon',
    rarity: 'magic',
    baseId: relic.baseId,
    minRarity: 'magic',
  });
  item.name = `${relic.name} of Beginnings`;
  item.power = powerOf(item);
  return item;
}
