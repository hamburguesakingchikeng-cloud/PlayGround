import { item, JURAMENTOS } from '../data/items.js'

export const ATTRS = [
  { key: 'vitalidad', name: 'Vitalidad', desc: 'Aumenta la vida máxima y la regeneración.' },
  { key: 'mana', name: 'Maná', desc: 'Aumenta el maná máximo y su recuperación.' },
  { key: 'resistencia', name: 'Resistencia', desc: 'Aumenta el aguante y su regeneración.' },
  { key: 'fuerza', name: 'Fuerza', desc: 'Aumenta el daño de las armas y las habilidades físicas.' },
  { key: 'defensa', name: 'Defensa', desc: 'Reduce el daño recibido.' },
  { key: 'velocidad', name: 'Velocidad', desc: 'Aumenta la velocidad de movimiento y de ataque.' },
  { key: 'inteligencia', name: 'Inteligencia', desc: 'Aumenta el daño mágico y la efectividad de los vínculos.' },
  { key: 'suerte', name: 'Suerte', desc: 'Aumenta críticos, botín y probabilidad de captura.' }
]

export function emptyStats() {
  return { vitalidad: 0, mana: 0, resistencia: 0, fuerza: 0, defensa: 0, velocidad: 0, inteligencia: 0, suerte: 0 }
}

export function equipmentStats(equipment) {
  const out = emptyStats()
  for (const id of Object.values(equipment)) {
    if (!id) continue
    const it = item(id)
    if (it.stats) for (const [k, v] of Object.entries(it.stats)) out[k] = (out[k] || 0) + v
  }
  return out
}

export function weaponDamage(equipment) {
  return equipment.weapon ? (item(equipment.weapon).dmg || 8) : 8
}

export function derive(stats, equipment, level = 1) {
  const total = { ...stats }
  const bonus = equipmentStats(equipment)
  for (const k of Object.keys(total)) total[k] += bonus[k] || 0
  const hp = Math.round(90 + total.vitalidad * 8 + level * 6)
  const mp = Math.round(45 + total.mana * 4)
  const stamina = Math.round(80 + total.resistencia * 4)
  const attack = (weaponDamage(equipment) + total.fuerza * 1.4 + level * .6)
  const reduction = total.defensa / (total.defensa + 58)
  const speed = 6.0 + total.velocidad * .055
  const power = 1 + total.inteligencia * .035
  const crit = Math.min(.65, .05 + total.suerte * .006)
  const capture = 1 + total.suerte * .01
  return {
    total, hp, mp, stamina, attack, reduction, speed, power, crit, capture,
    hpRegen: .35 + total.vitalidad * .022,
    manaRegen: 1.9 + total.mana * .05,
    staminaRegen: 13 + total.resistencia * .32,
    critMult: 1.65 + total.suerte * .01,
    dodgeCost: Math.max(16, 23 - total.resistencia * .12),
    blockCost: Math.max(4, 10 - total.defensa * .06),
    powerSkill: 1 + total.inteligencia * .045
  }
}

export function effectiveStats(stats, className) {
  const out = { ...stats }
  const bonus = JURAMENTOS[className]?.bonus || {}
  for (const [k, v] of Object.entries(bonus)) out[k] = (out[k] || 0) + v
  return out
}

export function basePlayerStats() {
  return { vitalidad: 5, mana: 5, resistencia: 5, fuerza: 5, defensa: 5, velocidad: 5, inteligencia: 5, suerte: 5 }
}

export function xpForLevel(level) {
  return Math.round(80 * Math.pow(level, 1.42) + level * 40)
}

export function statName(key) { return ATTRS.find(a => a.key === key)?.name || key }
