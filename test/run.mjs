// Loot-system tests. Node needs the source copied next to a "type":"module"
// package.json because the browser files use .js ESM with no package manifest.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, cpSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const stage = mkdtempSync(join(tmpdir(), 'gravebound-test-'));
cpSync(new URL('../src', import.meta.url), join(stage, 'src'), { recursive: true });
writeFileSync(join(stage, 'package.json'), '{"type":"module"}\n');

const L = await import(pathToFileURL(join(stage, 'src/loot.js')).href);
const { mulberry32 } = await import(pathToFileURL(join(stage, 'src/rng.js')).href);

const {
  SLOTS, RARITIES, LEGENDARY_POWERS, RARITY_ORDER,
  generateItem, rollRarity, itemScore, aggregateStats, hasPower,
  formatAffix, rarityInfo, rarityRank, compareItemToEquipped, rarityCounts,
} = L;

process.on('exit', () => rmSync(stage, { recursive: true, force: true }));

test('generation is deterministic for a given seed', () => {
  const a = generateItem(mulberry32(1234), { ilvl: 7, luck: 25, slot: 'weapon' });
  const b = generateItem(mulberry32(1234), { ilvl: 7, luck: 25, slot: 'weapon' });
  assert.equal(a.name, b.name);
  assert.equal(a.rarity, b.rarity);
  assert.equal(a.score, b.score);
  assert.deepEqual(a.affixes, b.affixes);
});

test('affix counts match rarity rules', () => {
  for (const [rarity, def] of Object.entries(RARITIES)) {
    for (let i = 0; i < 80; i++) {
      const item = generateItem(mulberry32(i + 1), { rarity, ilvl: 10 });
      assert.equal(item.affixes.length, def.affixes, `${rarity} should have ${def.affixes} affixes`);
      assert.equal(item.rarity, rarity);
    }
  }
});

test('generated items have valid slots, ids and positive affix values', () => {
  const rng = mulberry32(99);
  const ids = new Set();
  for (let i = 0; i < 600; i++) {
    const item = generateItem(rng, { ilvl: 1 + (i % 30), luck: i % 120 });
    assert.ok(SLOTS.includes(item.slot));
    assert.ok(RARITY_ORDER.includes(item.rarity));
    assert.ok(item.name.length > 2);
    assert.ok(item.score >= 0);
    assert.ok(!ids.has(item.id), 'item ids must be unique');
    ids.add(item.id);
    for (const affix of item.affixes) {
      assert.ok(L.STAT_DEFS[affix.stat], `unknown stat ${affix.stat}`);
      assert.ok(affix.value > 0);
    }
  }
});

test('legendary powers only appear on legendary and mythic items', () => {
  const rng = mulberry32(2026);
  for (let i = 0; i < 400; i++) {
    const item = generateItem(rng, { ilvl: 5, luck: 100 });
    const isHigh = item.rarity === 'legendary' || item.rarity === 'mythic';
    assert.equal(Boolean(item.legendary), isHigh);
    if (isHigh) {
      assert.ok(LEGENDARY_POWERS.some((p) => p.id === item.legendary.id));
      assert.ok(item.legendary.name && item.legendary.desc);
    }
  }
});

test('minRarity never rolls below the requested floor', () => {
  for (const minRarity of ['magic', 'rare', 'legendary']) {
    const rng = mulberry32(42);
    for (let i = 0; i < 700; i++) {
      const rarity = rollRarity(rng, { luck: 40, minRarity });
      assert.ok(rarityRank(rarity) >= rarityRank(minRarity), `${rarity} < ${minRarity}`);
    }
  }
});

test('luck raises the average rarity', () => {
  const sample = (luck) => {
    const rng = mulberry32(777);
    let total = 0;
    for (let i = 0; i < 3000; i++) total += rarityRank(rollRarity(rng, { luck }));
    return total / 3000;
  };
  const plain = sample(0);
  const lucky = sample(200);
  assert.ok(lucky > plain + 0.15, `expected luck to help (${plain} -> ${lucky})`);
});

test('higher item level produces stronger affixes on average', () => {
  const average = (ilvl) => {
    const rng = mulberry32(5150);
    let sum = 0;
    for (let i = 0; i < 300; i++) {
      sum += generateItem(rng, { ilvl, rarity: 'rare', slot: 'weapon' }).score;
    }
    return sum / 300;
  };
  assert.ok(average(25) > average(1) * 1.5);
});

test('names follow rarity conventions', () => {
  const common = generateItem(mulberry32(8), { rarity: 'common', ilvl: 3 });
  assert.equal(common.name.split(' ').length <= 3, true);
  const magic = generateItem(mulberry32(8), { rarity: 'magic', ilvl: 3 });
  assert.ok(magic.name.split(' ').length >= 3);
  const rare = generateItem(mulberry32(8), { rarity: 'rare', ilvl: 3 });
  assert.match(rare.name, / of /);
});

test('aggregateStats sums every affix', () => {
  const a = { affixes: [{ stat: 'damagePct', value: 10 }, { stat: 'armor', value: 4 }] };
  const b = { affixes: [{ stat: 'damagePct', value: 5 }, { stat: 'regen', value: 1.5 }] };
  assert.deepEqual(aggregateStats([a, b, null]), { damagePct: 15, armor: 4, regen: 1.5 });
});

test('hasPower finds legendary powers across a gear set', () => {
  const rng = mulberry32(33);
  let found = null;
  for (let i = 0; i < 200; i++) {
    const item = generateItem(rng, { rarity: 'legendary', ilvl: 8 });
    if (item.legendary.id === 'gravity') { found = item; break; }
  }
  assert.ok(found, 'expected a Grave Gravity item in the sample');
  assert.equal(hasPower([null, found], 'gravity'), true);
  assert.equal(hasPower([found], 'orbit'), false);
});

test('itemScore weights affixes and rewards legendary powers', () => {
  const base = { affixes: [{ stat: 'damagePct', value: 10 }] };
  assert.equal(itemScore(base), Math.round(2.4 * 10));
  assert.equal(itemScore({ ...base, legendary: { id: 'x' } }), Math.round(2.4 * 10 + 24));
  assert.equal(itemScore(null), 0);
});

test('formatting and comparison helpers are consistent', () => {
  assert.equal(formatAffix({ stat: 'damagePct', value: 12 }), 'Damage +12%');
  assert.equal(formatAffix({ stat: 'regen', value: 1.5 }), 'Health Regen +1.5/s');
  const item = generateItem(mulberry32(4), { rarity: 'rare', ilvl: 9 });
  const equipped = generateItem(mulberry32(5), { rarity: 'magic', ilvl: 9 });
  const cmp = compareItemToEquipped(item, equipped);
  assert.equal(cmp.delta, item.score - equipped.score);
  assert.equal(compareItemToEquipped(item, null).delta, item.score);
  assert.equal(rarityInfo('mythic').label, 'Mythic');
});

test('rarityCounts handles empty and mixed inventories', () => {
  assert.deepEqual(rarityCounts([]), { common: 0, magic: 0, rare: 0, legendary: 0, mythic: 0 });
  const rng = mulberry32(12);
  const items = Array.from({ length: 40 }, (_, i) => generateItem(rng, { ilvl: 4, rarity: RARITY_ORDER[i % 5] }));
  const counts = rarityCounts(items);
  assert.deepEqual(counts, { common: 8, magic: 8, rare: 8, legendary: 8, mythic: 8 });
});
