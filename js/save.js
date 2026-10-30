const SAVE_PREFIX = 'espada_celestial_save_v1_';
const SETTINGS_KEY = 'espada_celestial_settings_v1';

export const DEFAULT_SETTINGS = {
  music: 0.5,
  sfx: 0.72,
  touch: 'auto',
  touchScale: 1,
  touchOpacity: 0.82,
  leftHanded: false,
  shake: true,
  damageNumbers: true,
  reduceMotion: false,
  quality: 'alta',
  showHints: true,
  tilt: false,
  language: 'es',
  fullscreen: false,
};

function read(key) {
  try { return localStorage.getItem(key); } catch { return null; }
}
function write(key, value) {
  try { localStorage.setItem(key, value); return true; } catch { return false; }
}
function remove(key) {
  try { localStorage.removeItem(key); return true; } catch { return false; }
}

export class SaveStore {
  constructor() {
    this.settings = { ...DEFAULT_SETTINGS, ...this.loadSettings() };
  }

  loadSettings() {
    try { return JSON.parse(read(SETTINGS_KEY) || '{}'); } catch { return {}; }
  }

  saveSettings(settings = this.settings) {
    this.settings = settings;
    write(SETTINGS_KEY, JSON.stringify(settings));
  }

  saveSlot(slot, state) {
    const payload = {
      version: 1,
      savedAt: Date.now(),
      meta: {
        name: state.player?.name || 'Portador',
        level: state.player?.level || 1,
        classId: state.player?.classId || 'vanguardia',
        zone: state.zoneId,
        playTime: state.playTime || 0,
        quest: state.quests?.main_luz?.title || 'La luz que despierta',
        creatures: state.player?.creatures?.length || 0,
      },
      state,
    };
    return write(SAVE_PREFIX + slot, JSON.stringify(payload));
  }

  loadSlot(slot) {
    try {
      const raw = read(SAVE_PREFIX + slot);
      if (!raw) return null;
      const payload = JSON.parse(raw);
      if (!payload?.state?.player) return null;
      return payload;
    } catch { return null; }
  }

  deleteSlot(slot) {
    if (slot === 0) return false;
    return remove(SAVE_PREFIX + slot);
  }

  listSlots() {
    return [0, 1, 2, 3].map((slot) => {
      const payload = this.loadSlot(slot);
      return payload
        ? { slot, empty: false, savedAt: payload.savedAt, meta: payload.meta, auto: slot === 0 }
        : { slot, empty: true, auto: slot === 0 };
    });
  }

  latestSlot() {
    let best = null;
    for (const slot of [0, 1, 2, 3]) {
      const payload = this.loadSlot(slot);
      if (payload && (!best || payload.savedAt > best.savedAt)) best = { ...payload, slot };
    }
    return best;
  }

  hasSave() {
    return this.listSlots().some((s) => !s.empty);
  }
}

export function formatPlayTime(seconds = 0) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return h > 0 ? `${h}h ${String(m).padStart(2, '0')}m` : `${m}m ${String(s).padStart(2, '0')}s`;
}

export function formatDate(ts) {
  if (!ts) return '';
  try {
    return new Intl.DateTimeFormat('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(ts));
  } catch { return new Date(ts).toLocaleString(); }
}
