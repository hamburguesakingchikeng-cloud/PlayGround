import { CREATURES, creatureName, creaturePower } from '../data/creatures.js';
import { clamp } from '../core/utils.js';

export class Collection {
  constructor(game) {
    this.game = game;
    this.owned = {};
    this.active = null;
    this.captureBuff = 0;
  }

  has(id) { return Boolean(this.owned[id]); }
  get(id) { return this.owned[id] || null; }
  list() { return Object.keys(this.owned).map(id => ({ id, ...this.owned[id], def: CREATURES[id] })); }
  count() { return Object.keys(this.owned).length; }

  add(id, { bond = 1, level = 1, silent = false } = {}) {
    if (!CREATURES[id]) return false;
    if (this.owned[id]) {
      this.owned[id].bond = Math.min(5, this.owned[id].bond + 1);
      return false;
    }
    this.owned[id] = { bond, level, xp: 0, capturedAt: Date.now() };
    if (!this.active) this.active = id;
    if (!silent) {
      this.game.ui.toast('Nueva resonancia', creatureName(id, bond), 'creature');
      this.game.audio.sfx('capture');
    }
    this.game.events.emit('creatureAdded', { id });
    return true;
  }

  setActive(id) {
    if (!this.owned[id]) return false;
    this.active = id;
    this.game.events.emit('companionChanged', { id });
    return true;
  }

  gainXp(amount) {
    if (!this.active || !this.owned[this.active]) return;
    const c = this.owned[this.active];
    c.xp += amount;
    while (c.level < 10 && c.xp >= this.xpToNext(c.level)) {
      c.xp -= this.xpToNext(c.level);
      c.level++;
      this.game.ui.toast('Resonancia fortalecida', `${creatureName(this.active, c.bond)} alcanza el nivel ${c.level}.`, 'creature');
      this.game.audio.sfx('levelup');
    }
  }

  xpToNext(level) { return 60 + level * 35; }

  bondUp(id) {
    const c = this.owned[id];
    if (!c) return;
    c.bond = Math.min(5, c.bond + 1);
  }

  feed(id) {
    const c = this.owned[id];
    if (!c) return { ok: false, msg: 'No tienes esa resonancia.' };
    if (c.bond >= 5) return { ok: false, msg: 'El vínculo ya es absoluto.' };
    if (!this.game.inventory.has('resonance_essence', 2)) return { ok: false, msg: 'Necesitas 2 Esencias de Resonancia.' };
    this.game.inventory.remove('resonance_essence', 2);
    c.bond++;
    this.game.ui.toast('Vínculo fortalecido', `${creatureName(id, c.bond)} · Vínculo ${c.bond}`, 'creature');
    this.game.audio.sfx('capture');
    return { ok: true, msg: 'El vínculo se fortalece.' };
  }

  passiveStats() {
    if (!this.active) return {};
    const c = CREATURES[this.active];
    if (!c) return {};
    const stats = { ...(c.passive?.stats || {}) };
    if (stats.all) {
      for (const k of ['vit', 'mana', 'res', 'str', 'def', 'vel', 'int', 'luck']) stats[k] = (stats[k] || 0) + stats.all;
      delete stats.all;
    }
    return stats;
  }

  activeDef() {
    return this.active ? CREATURES[this.active] : null;
  }

  captureChance(enemy) {
    if (!enemy?.def?.capture || enemy.def.boss || enemy.def.human) return 0;
    const ratio = 1 - clamp(enemy.hp / enemy.maxHp, 0, 1);
    const base = (CREATURES[enemy.def.capture]?.captureBase || 0.2);
    const luck = this.game.player.stats.luck * 0.008;
    const ring = this.game.inventory.equipment.accessory === 'resonance_ring' ? 0.08 : 0;
    const int = this.game.player.stats.int * 0.006;
    return clamp(base * 0.45 + ratio * 0.55 + luck + ring + int + this.captureBuff, 0.05, 0.95);
  }

  serialize() {
    return { owned: JSON.parse(JSON.stringify(this.owned)), active: this.active };
  }
  deserialize(data) {
    this.owned = data?.owned || {};
    this.active = data?.active || Object.keys(this.owned)[0] || null;
  }
}

export function creatureSummary(id, entry) {
  const def = CREATURES[id];
  return {
    id,
    name: creatureName(id, entry.bond),
    element: def.element,
    role: def.role,
    level: entry.level,
    bond: entry.bond,
    power: creaturePower(id, entry.bond, entry.level),
    desc: def.desc,
    lore: def.lore,
    active: def.active,
    passive: def.passive,
  };
}
