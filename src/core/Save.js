const KEY = 'la-espada-celestial:save:v1'
const SETTINGS_KEY = 'la-espada-celestial:settings:v1'
export const SAVE_VERSION = 1

export const DEFAULT_SETTINGS = {
  music: .55,
  sfx: .8,
  muted: false,
  quality: 'auto',
  invertCamera: false,
  shake: true,
  damageNumbers: true,
  aimAssist: true,
  colorblind: false,
  uiScale: 1,
  subtitles: true,
  difficulty: 'aventura',
  autoAim: true,
  reducedMotion: false
}

export function loadSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    if (!raw) return { ...DEFAULT_SETTINGS }
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) }
  } catch { return { ...DEFAULT_SETTINGS } }
}

export function saveSettings(settings) {
  try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)) } catch {}
}

export function hasSave() {
  try { return Boolean(localStorage.getItem(KEY)) } catch { return false }
}

export function loadSave() {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    const data = JSON.parse(raw)
    if (!data || data.version !== SAVE_VERSION) return null
    return data
  } catch { return null }
}

export function writeSave(data) {
  try {
    data.version = SAVE_VERSION
    data.savedAt = Date.now()
    localStorage.setItem(KEY, JSON.stringify(data))
    return true
  } catch { return false }
}

export function clearSave() {
  try { localStorage.removeItem(KEY) } catch {}
}

export function saveSummary(data) {
  if (!data) return null
  return {
    name: data.name || 'Sin nombre',
    level: data.level || 1,
    zone: data.zone || 'valdoria',
    playTime: data.playTime || 0,
    savedAt: data.savedAt || 0,
    quest: data.questTitle || 'El despertar'
  }
}
