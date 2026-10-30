// Persistencia local: ajustes y tres ranuras de partida.
const SETTINGS_KEY = 'espada_celestial_settings_v1';
const SAVE_PREFIX = 'espada_celestial_save_v1_';

export const DEFAULT_SETTINGS = {
  music: 0.55,
  sfx: 0.72,
  muted: false,
  shake: 1,
  touchMode: 'auto',
  touchScale: 1,
  touchOpacity: 0.9,
  leftHanded: false,
  tilt: false,
  tiltSensitivity: 1.2,
  haptics: true,
  showMinimap: true,
  difficulty: 'normal',
  showFps: false,
  reduceMotion: false,
  dpadX: null,
  dpadY: null,
  actionsX: null,
  actionsY: null
};

export function loadSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return { ...DEFAULT_SETTINGS };
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveSettings(settings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    return true;
  } catch {
    return false;
  }
}

function keyFor(slot) {
  return SAVE_PREFIX + slot;
}

export function listSaves() {
  const out = [];
  for (let slot = 1; slot <= 3; slot++) {
    try {
      const raw = localStorage.getItem(keyFor(slot));
      if (!raw) { out.push({ slot, empty: true }); continue; }
      const data = JSON.parse(raw);
      out.push({
        slot,
        empty: false,
        name: data.player?.name || 'Sin nombre',
        level: data.player?.level || 1,
        zone: data.zoneName || 'Lumen',
        playtime: data.playtime || 0,
        timestamp: data.timestamp || 0,
        quest: data.questTitle || '',
        difficulty: data.difficulty || 'normal',
        captured: data.creatures?.length || 0
      });
    } catch {
      out.push({ slot, empty: true, corrupt: true });
    }
  }
  return out;
}

export function writeSave(slot, data) {
  try {
    localStorage.setItem(keyFor(slot), JSON.stringify(data));
    return true;
  } catch (error) {
    console.warn('No se pudo guardar la partida:', error);
    return false;
  }
}

export function readSave(slot) {
  try {
    const raw = localStorage.getItem(keyFor(slot));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function deleteSave(slot) {
  try {
    localStorage.removeItem(keyFor(slot));
    return true;
  } catch {
    return false;
  }
}

export function latestSaveSlot() {
  let best = null;
  for (const save of listSaves()) {
    if (!save.empty && (!best || save.timestamp > best.timestamp)) best = save;
  }
  return best ? best.slot : null;
}

export function hasAnySave() {
  return latestSaveSlot() !== null;
}
