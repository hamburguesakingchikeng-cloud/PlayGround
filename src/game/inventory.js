import { ITEMS, itemRarity } from '../data/items.js';
import { clamp } from '../core/utils.js';

const EQUIP_SLOTS = ['weapon', 'armor', 'helmet', 'accessory'];

export class Inventory {
  constructor(data = null) {
    this.items = {};
    this.equipment = { weapon: 'rusty_sword', armor: 'tunic', helmet: null, accessory: null };
    this.upgrades = {};
    this.captureBuff = 0;
    if (data) this.deserialize(data);
    else this.add('potion_lumen', 2), this.add('elixir_mana', 1), this.add('crystal_resonance', 1);
  }

  count(id) { return this.items[id] || 0; }
  has(id, qty = 1) { return this.count(id) >= qty; }

  add(id, qty = 1) {
    if (!ITEMS[id]) return false;
    this.items[id] = (this.items[id] || 0) + qty;
    return true;
  }

  remove(id, qty = 1) {
    if ((this.items[id] || 0) < qty) return false;
    this.items[id] -= qty;
    if (this.items[id] <= 0) delete this.items[id];
    return true;
  }

  equip(id) {
    const item = ITEMS[id];
    if (!item || !EQUIP_SLOTS.includes(item.type)) return false;
    if (!this.has(id)) return false;
    this.equipment[item.type] = id;
    return true;
  }

  unequip(slot) {
    if (slot === 'weapon' || slot === 'armor') return false;
    this.equipment[slot] = null;
    return true;
  }

  isEquipped(id) { return Object.values(this.equipment).includes(id); }

  upgradeLevel(id) { return this.upgrades[id] || 0; }

  upgradeStats(id) {
    const item = ITEMS[id];
    const lvl = this.upgradeLevel(id);
    if (!item || lvl <= 0) return {};
    const scale = lvl;
    if (item.type === 'weapon') return { atk: Math.round((item.atk || 4) * 0.12 * scale) + scale };
    if (item.type === 'armor') return { def: Math.round((item.def || 3) * 0.12 * scale) + scale, hp: scale * 6 };
    if (item.type === 'helmet') return { def: Math.round((item.def || 2) * 0.12 * scale) + scale, hp: scale * 4 };
    return { luck: scale };
  }

  upgradeCost(id) {
    const item = ITEMS[id];
    if (!item) return null;
    const lvl = this.upgradeLevel(id);
    if (lvl >= 5) return null;
    const rarity = item.rarity || 0;
    return {
      gold: 60 + rarity * 90 + lvl * 70,
      iron: 2 + lvl * 2,
      gem_shard: lvl >= 3 ? 1 : 0,
      living_ash: rarity >= 3 && lvl >= 2 ? 2 : 0,
    };
  }

  upgrade(id) {
    const cost = this.upgradeCost(id);
    if (!cost) return { ok: false, msg: 'Este objeto ya está al máximo.' };
    if (!this.has(id)) return { ok: false, msg: 'No tienes ese objeto.' };
    return { ok: true, cost };
  }

  applyUpgrade(id) {
    const cost = this.upgradeCost(id);
    if (!cost) return false;
    this.upgrades[id] = (this.upgrades[id] || 0) + 1;
    return true;
  }

  equipmentStats() {
    const stats = {};
    for (const slot of EQUIP_SLOTS) {
      const id = this.equipment[slot];
      if (!id) continue;
      const item = ITEMS[id];
      if (!item) continue;
      for (const [k, v] of Object.entries(item)) {
        if (typeof v === 'number' && ['atk', 'def', 'hp', 'mp', 'crit', 'speed', 'luck', 'int', 'str', 'lifesteal', 'fireRes', 'capture', 'dodge', 'hpRegen', 'manaRegen', 'damageReduction'].includes(k)) {
          stats[k] = (stats[k] || 0) + v;
        }
      }
      for (const [k, v] of Object.entries(this.upgradeStats(id))) stats[k] = (stats[k] || 0) + v;
    }
    return stats;
  }

  weapon() {
    const id = this.equipment.weapon;
    return id ? { id, ...ITEMS[id], upgrade: this.upgradeLevel(id) } : null;
  }

  weaponType() { return this.weapon()?.weaponType || 'sword'; }

  use(id, player, game) {
    const item = ITEMS[id];
    if (!item || item.type !== 'consumable' || !this.has(id)) return { ok: false, msg: 'No puedes usar eso.' };
    let msg = '';
    if (item.heal) {
      const amount = Math.round(player.maxHp * item.heal);
      player.heal(amount);
      msg = `Recuperas ${amount} de vida.`;
    } else if (item.mana) {
      const amount = Math.round(player.maxMp * item.mana);
      player.restoreMana(amount);
      msg = `Recuperas ${amount} de maná.`;
    } else if (item.stamina) {
      player.stamina = player.maxStamina;
      msg = 'Recuperas toda la resistencia.';
    } else if (item.captureBonus) {
      this.captureBuff = Math.max(this.captureBuff, item.captureBonus);
      msg = 'El siguiente intento de captura será más fácil.';
    } else if (item.escape) {
      game.escapeCombat();
      msg = 'El humo cubre tu huida.';
    } else if (item.cleanse) {
      player.status = {};
      msg = 'Las impurezas abandonan tu cuerpo.';
    }
    this.remove(id, 1);
    game.audio.sfx('potion');
    return { ok: true, msg };
  }

  buyPrice(id) {
    const item = ITEMS[id];
    return item ? Math.round(item.value * 1.15) : 0;
  }
  sellPrice(id) {
    const item = ITEMS[id];
    return item ? Math.max(1, Math.round(item.value * 0.55)) : 0;
  }

  serialize() {
    return { items: { ...this.items }, equipment: { ...this.equipment }, upgrades: { ...this.upgrades } };
  }
  deserialize(data) {
    this.items = { ...(data.items || {}) };
    this.equipment = { weapon: 'rusty_sword', armor: 'tunic', helmet: null, accessory: null, ...(data.equipment || {}) };
    this.upgrades = { ...(data.upgrades || {}) };
    this.captureBuff = 0;
  }
}

export const SHOPS = {
  sela: {
    name: 'Sela, mercader de Lumen',
    greeting: 'Pociones frescas, rumores más frescos. Nada devuelve el dinero.',
    stock: ['potion_lumen', 'elixir_mana', 'tonic_stamina', 'antidote', 'crystal_resonance', 'smoke_bomb', 'lucky_charm', 'pilgrim_blade', 'tunic', 'hood', 'iron'],
  },
  nira: {
    name: 'Nira, chatarrera de Cendra',
    greeting: 'Todo tiene un precio. Hasta el aire, si sabes envasarlo.',
    stock: ['potion_lumen', 'elixir_mana', 'tonic_stamina', 'crystal_resonance', 'smoke_bomb', 'ash_cloak', 'ash_hood', 'ember_pendant', 'obsidian_helm', 'living_ash'],
  },
};

export function itemDescription(id) {
  const item = ITEMS[id];
  if (!item) return '';
  const r = itemRarity(item);
  return `${r.name} · ${item.desc}`;
}
