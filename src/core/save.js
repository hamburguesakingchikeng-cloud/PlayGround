const PREFIX = 'laEspadaCelestial';
const SAVE_VERSION = 1;

export const SAVE_SLOTS = [
  { id: 'auto', name: 'Guardado automático' },
  { id: '1', name: 'Ranura I' },
  { id: '2', name: 'Ranura II' },
  { id: '3', name: 'Ranura III' },
];

export const DEFAULT_SETTINGS = {
  music: 0.55,
  sfx: 0.7,
  musicOn: true,
  sfxOn: true,
  reduceFx: false,
  vibration: true,
  largeText: false,
  touchControls: 'auto',
  quality: 'auto',
};

function safeStorage() {
  try {
    const k = '__test__';
    localStorage.setItem(k, '1');
    localStorage.removeItem(k);
    return localStorage;
  } catch (e) {
    const mem = new Map();
    return {
      getItem: (k) => mem.get(k) ?? null,
      setItem: (k, v) => mem.set(k, String(v)),
      removeItem: (k) => mem.delete(k),
    };
  }
}

export const storage = safeStorage();

export function saveKey(slot) { return `${PREFIX}.save.${slot}`; }

export function readSave(slot) {
  try {
    const raw = storage.getItem(saveKey(slot));
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (!data || !data.player) return null;
    return data;
  } catch (e) {
    console.warn('No se pudo leer la partida', slot, e);
    return null;
  }
}

export function writeSave(slot, data) {
  try {
    const payload = { ...data, version: SAVE_VERSION, savedAt: Date.now() };
    storage.setItem(saveKey(slot), JSON.stringify(payload));
    return payload;
  } catch (e) {
    console.warn('No se pudo guardar la partida', e);
    return null;
  }
}

export function deleteSave(slot) {
  try { storage.removeItem(saveKey(slot)); } catch (e) { /* ignore */ }
}

export function listSaves() {
  return SAVE_SLOTS.map(s => ({ ...s, data: readSave(s.id) }))
    .filter(s => s.data)
    .sort((a, b) => (b.data.savedAt || 0) - (a.data.savedAt || 0));
}

export function latestSave() {
  return listSaves()[0] || null;
}

export function hasAnySave() { return listSaves().length > 0; }

export function loadSettings() {
  try {
    const raw = storage.getItem(`${PREFIX}.settings`);
    return { ...DEFAULT_SETTINGS, ...(raw ? JSON.parse(raw) : {}) };
  } catch (e) {
    return { ...DEFAULT_SETTINGS };
  }
}

export function persistSettings(settings) {
  try { storage.setItem(`${PREFIX}.settings`, JSON.stringify(settings)); } catch (e) { /* ignore */ }
}

export function formatPlayTime(seconds = 0) {
  const s = Math.max(0, Math.floor(seconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  return h > 0 ? `${h}h ${String(m).padStart(2, '0')}m` : `${m}m ${String(s % 60).padStart(2, '0')}s`;
}

export function formatDate(ts) {
  if (!ts) return '—';
  try {
    return new Date(ts).toLocaleString('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
  } catch (e) { return '—'; }
}
