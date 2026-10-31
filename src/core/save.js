// Guardado local persistente con ranuras y ajustes.
const SAVE_KEY = 'la-espada-celestial.saves.v1';
const SETTINGS_KEY = 'la-espada-celestial.settings.v1';
const SLOTS = 3;

const DEFAULT_SETTINGS = {
  music: 0.55,
  sfx: 0.72,
  master: 0.85,
  textSpeed: 1,
  largeText: false,
  shake: true,
  flashes: true,
  damageNumbers: true,
  autoAim: true,
  difficulty: 'caballero',
  touchOpacity: 0.85,
  showFps: false,
};

function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch { return fallback; }
}

export class SaveSystem {
  constructor() {
    this.slots = this._readSlots();
    this.settings = { ...DEFAULT_SETTINGS, ...readJSON(SETTINGS_KEY, {}) };
  }

  _readSlots() {
    const data = readJSON(SAVE_KEY, { slots: {} });
    const slots = {};
    for (let i = 1; i <= SLOTS; i++) slots[i] = data.slots?.[i] || null;
    return slots;
  }

  _writeSlots() {
    try { localStorage.setItem(SAVE_KEY, JSON.stringify({ version: 1, slots: this.slots })); }
    catch (e) { console.warn('No se pudo guardar la partida', e); return false; }
    return true;
  }

  save(slot, data) {
    const now = Date.now();
    const record = {
      version: 1,
      savedAt: now,
      meta: {
        name: data.player?.name || 'Peregrino',
        level: data.player?.level || 1,
        region: data.regionName || data.player?.region || 'Valdoria',
        playtime: data.playtime || 0,
        quest: data.questTitle || '',
      },
      data,
    };
    this.slots[slot] = record;
    return this._writeSlots();
  }

  load(slot) {
    return this.slots[slot]?.data || null;
  }

  latestSlot() {
    let best = null, bestTime = -1;
    for (let i = 1; i <= SLOTS; i++) {
      const s = this.slots[i];
      if (s && s.savedAt > bestTime) { bestTime = s.savedAt; best = i; }
    }
    return best;
  }

  latest() {
    const slot = this.latestSlot();
    return slot ? { slot, ...this.slots[slot] } : null;
  }

  remove(slot) {
    this.slots[slot] = null;
    this._writeSlots();
  }

  clearAll() {
    this.slots = { 1: null, 2: null, 3: null };
    try { localStorage.removeItem(SAVE_KEY); } catch {}
  }

  saveSettings() {
    try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(this.settings)); } catch {}
  }

  resetSettings() {
    this.settings = { ...DEFAULT_SETTINGS };
    this.saveSettings();
  }
}

export { DEFAULT_SETTINGS, SLOTS };
