/**
 * Generación del mundo de Luma.
 * El terreno se pinta en un lienzo grande; los objetos se ordenan por profundidad
 * y comparten una lista de colisiones independiente del render.
 */
import { WORLD, CHESTS, MOONFLOWERS, RUNE_SHRINES } from './content.js'
import { mulberry32, TAU } from './art/common.js'
import {
  drawTree, drawHouse, drawShrine, drawFountain, drawGate, drawRuinColumn, drawCrystal,
  drawChest, drawMoonflower, drawRock, drawBush, drawLantern, drawSign, drawStall,
  drawAnvil, drawStatue, drawArenaPillar, drawPedestal, drawRunePillar,
} from './art/index.js'

const dist = (x1, y1, x2, y2) => Math.hypot(x2 - x1, y2 - y1)

const PATHS = [
  [[150, 1180], [540, 1210], [930, 1290], [1320, 1200], [1570, 1140], [1790, 1120]],
  [[1790, 1120], [1900, 1370], [1740, 1660], [1540, 2000], [1500, 2300]],
  [[1790, 1120], [2210, 1080], [2470, 1010], [2598, 1000], [2780, 980], [2980, 1030], [3140, 860], [3220, 590]],
  [[2598, 1000], [2820, 1180], [3060, 1190], [3220, 1090]],
]

function segmentDist(px, py, ax, ay, bx, by) {
  const dx = bx - ax, dy = by - ay
  const len = dx * dx + dy * dy
  let t = len ? ((px - ax) * dx + (py - ay) * dy) / len : 0
  t = Math.max(0, Math.min(1, t))
  return Math.hypot(px - (ax + dx * t), py - (ay + dy * t))
}

export function pathDistance(x, y) {
  let best = Infinity
  for (const path of PATHS) {
    for (let i = 0; i < path.length - 1; i++) {
      const d = segmentDist(x, y, path[i][0], path[i][1], path[i + 1][0], path[i + 1][1])
      if (d < best) best = d
    }
  }
  return best
}

export const ZONES = [
  { id: 'village', name: 'Aldea de Luma', subtitle: 'Donde el bosque aprende a soñar' },
  { id: 'meadow', name: 'Pradera de Luma', subtitle: 'La última luz besa la hierba' },
  { id: 'forest', name: 'Bosque de Lirios', subtitle: 'Las flores recuerdan tu nombre' },
  { id: 'path', name: 'Sendero de Aether', subtitle: 'Las piedras susurran juramentos' },
  { id: 'ruins', name: 'Ruinas de Aether', subtitle: 'Ecos dormidos bajo la luna' },
  { id: 'arena', name: 'Santuario Celestial', subtitle: 'El cielo sostiene su aliento' },
]

export function zoneAt(x, y) {
  if (dist(x, y, WORLD.arena.x, WORLD.arena.y) < 390) return ZONES[5]
  if (x > 2570) return ZONES[4]
  if (x > 2200) return ZONES[3]
  if (x < 1320) return ZONES[2]
  if (dist(x, y, WORLD.village.x, WORLD.village.y) < 330) return ZONES[0]
  return ZONES[1]
}

const NPCS = [
  {
    id: 'elara', name: 'Elara', role: 'elara', title: 'Maestra del santuario',
    x: 1810, y: 922, radius: 18,
  },
  {
    id: 'rurik', name: 'Rurik', role: 'rurik', title: 'Herrero de Luma',
    x: 2150, y: 1245, radius: 18,
  },
  {
    id: 'mirea', name: 'Mirea', role: 'mirea', title: 'Mercader de reliquias',
    x: 1450, y: 1215, radius: 18,
  },
  {
    id: 'bruna', name: 'Bruna', role: 'mirea', title: 'Guardiana de la aldea',
    x: 1722, y: 1045, radius: 17,
  },
]

const HOUSE_SPOTS = [
  [1512, 1002, 188, 132],
  [2058, 1006, 210, 144],
  [1492, 1382, 196, 136],
  [2080, 1402, 184, 128],
  [1632, 874, 176, 124],
  [1938, 876, 180, 126],
  [1678, 1568, 178, 124],
]

const PROTECTED = []
function protect(x, y, r) { PROTECTED.push({ x, y, r }) }
function isProtected(x, y, extra = 0) {
  for (const p of PROTECTED) if (dist(x, y, p.x, p.y) < p.r + extra) return true
  return false
}

export function createWorldData() {
  const rand = mulberry32(0x1a2b3c4d)
  const props = []
  const obstacles = []
  const npcs = NPCS.map((npc) => ({ ...npc, hidden: false, bob: rand() * TAU }))

  // Zonas que deben quedar despejadas para que la aventura sea legible.
  protect(WORLD.spawn.x, WORLD.spawn.y, 150)
  protect(WORLD.village.x, WORLD.village.y, 250)
  protect(WORLD.shrine.x, WORLD.shrine.y + 110, 185)
  for (const npc of npcs) protect(npc.x, npc.y, 76)
  for (const chest of CHESTS) protect(chest.x, chest.y, 62)
  for (const flower of MOONFLOWERS) protect(flower.x, flower.y, 45)
  for (const rune of RUNE_SHRINES) protect(rune.x, rune.y, 58)
  protect(WORLD.gate.x, WORLD.gate.y, 105)
  protect(WORLD.arena.x, WORLD.arena.y, 350)

  const add = (kind, data, collision) => {
    props.push({ kind, ...data })
    if (collision) obstacles.push({ kind, ...collision })
  }
  const circle = (x, y, r, kind = 'circle') => ({ type: kind, x, y, r })
  const rect = (x, y, w, h, kind = 'rect') => ({ type: kind, x, y, w, h })

  // ---------- Aldea ----------
  for (const [x, y, w, h] of HOUSE_SPOTS) {
    add('house', { x, y, w, h }, rect(x - w * .46, y - 34, w * .92, 44, 'house'))
    protect(x, y - 20, Math.max(w, h) * .56)
  }
  add('fountain', { x: 1790, y: 1130 }, circle(1790, 1128, 60, 'fountain'))
  protect(1790, 1130, 95)
  add('shrine', { x: WORLD.shrine.x, y: WORLD.shrine.y }, circle(WORLD.shrine.x, WORLD.shrine.y - 24, 54, 'shrine'))
  add('statue', { x: 1688, y: 900 }, circle(1688, 898, 24))
  add('statue', { x: 1932, y: 900 }, circle(1932, 898, 24))
  add('stall', { x: 1398, y: 1150 }, rect(1348, 1120, 100, 42, 'stall'))
  add('stall', { x: 1372, y: 1268 }, rect(1322, 1238, 100, 42, 'stall'))
  add('anvil', { x: 2202, y: 1192 }, circle(2202, 1190, 20))
  add('sign', { x: 1888, y: 1168 })
  add('sign', { x: 2260, y: 1062 })
  add('sign', { x: 1316, y: 1250 })

  for (let i = 0; i < 9; i++) {
    const a = i / 9 * TAU + .2
    add('lantern', { x: 1790 + Math.cos(a) * 228, y: 1124 + Math.sin(a) * 178 })
  }
  add('lantern', { x: 1420, y: 1305 })
  add('lantern', { x: 2180, y: 1330 })
  add('lantern', { x: 1640, y: 960 })
  add('lantern', { x: 1960, y: 960 })

  // ---------- Árboles del bosque ----------
  let attempts = 0
  let trees = 0
  while (trees < 104 && attempts++ < 900) {
    const x = 75 + rand() * 1190
    const y = 90 + rand() * 2140
    if (pathDistance(x, y) < 88 || isProtected(x, y, 14)) continue
    if (dist(x, y, 1790, 1120) < 340) continue
    const scale = .78 + rand() * .62
    const variant = rand() < .14 ? 1 : rand() < .12 ? 2 : 0
    add('tree', { x, y, scale, variant, seed: (rand() * 1e9) | 0 }, circle(x, y - 4, 13 * scale, 'tree'))
    trees++
  }
  // Árboles del borde y del este, más dispersos.
  for (let i = 0; i < 74; i++) {
    let x, y
    if (i < 34) { x = 80 + rand() * 3440; y = rand() < .5 ? 55 + rand() * 90 : 2180 + rand() * 80 }
    else { x = 1240 + rand() * 1280; y = 80 + rand() * 2150 }
    if (pathDistance(x, y) < 75 || isProtected(x, y, 20) || dist(x, y, WORLD.arena.x, WORLD.arena.y) < 380) continue
    const scale = .8 + rand() * .7
    add('tree', { x, y, scale, variant: rand() < .26 ? 2 : 0, seed: (rand() * 1e9) | 0 }, circle(x, y - 4, 12 * scale, 'tree'))
  }

  // ---------- Maleza, rocas y flores ----------
  for (let i = 0; i < 230; i++) {
    const inForest = rand() < .66
    const x = inForest ? 50 + rand() * 1250 : 1250 + rand() * 2300
    const y = 50 + rand() * 2200
    if (pathDistance(x, y) < 58 || isProtected(x, y)) continue
    if (dist(x, y, WORLD.arena.x, WORLD.arena.y) < 330) continue
    add('bush', { x, y, seed: (rand() * 1e9) | 0, flowers: rand() < .26 })
  }
  for (let i = 0; i < 125; i++) {
    const x = 60 + rand() * 3420
    const y = 60 + rand() * 2180
    if (pathDistance(x, y) < 50 || isProtected(x, y, 4)) continue
    if (dist(x, y, WORLD.arena.x, WORLD.arena.y) < 330) continue
    const scale = .45 + rand() * .7
    add('rock', { x, y, scale }, circle(x, y - 4, 14 * scale, 'rock'))
  }
  for (let i = 0; i < 150; i++) {
    const x = 40 + rand() * 3400
    const y = 40 + rand() * 2200
    if (pathDistance(x, y) < 22 || dist(x, y, WORLD.village.x, WORLD.village.y) < 280) continue
    add('flower', { x, y, hue: (rand() * 4) | 0 })
  }

  // ---------- Ruinas ----------
  for (let i = 0; i < 31; i++) {
    const x = 2625 + rand() * 915
    const y = 255 + rand() * 1190
    if (pathDistance(x, y) < 68 || dist(x, y, WORLD.arena.x, WORLD.arena.y) < 340) continue
    if (isProtected(x, y, 10)) continue
    const height = 80 + rand() * 100
    add('column', { x, y, height, broken: rand() < .42, glow: rand() < .35 }, circle(x, y - 4, 18, 'column'))
  }
  for (let i = 0; i < 26; i++) {
    let x, y
    if (rand() < .6) { x = 80 + rand() * 1200; y = 80 + rand() * 2100 }
    else { x = 2650 + rand() * 850; y = 300 + rand() * 1150 }
    if (pathDistance(x, y) < 60 || isProtected(x, y, 8)) continue
    if (dist(x, y, WORLD.arena.x, WORLD.arena.y) < 340) continue
    add('crystal', {
      x, y, scale: .5 + rand() * .75,
      color: rand() < .45 ? '#8ff5e5' : rand() < .7 ? '#ad7bff' : '#ffb0d0',
    }, circle(x, y - 4, 11, 'crystal'))
  }

  // ---------- Arena celestial ----------
  for (let i = 0; i < 8; i++) {
    const a = i / 8 * TAU + .12
    const x = WORLD.arena.x + Math.cos(a) * 304
    const y = WORLD.arena.y + Math.sin(a) * 264
    add('arenaPillar', { x, y, color: i % 3 ? '#b58cff' : '#8ff5e5' }, circle(x, y - 4, 22, 'pillar'))
  }
  add('pedestal', { x: WORLD.arena.x, y: WORLD.arena.y - 145 }, circle(WORLD.arena.x, WORLD.arena.y - 145, 27, 'pedestal'))
  add('gate', { x: WORLD.gate.x, y: WORLD.gate.y }, null)

  // Un poco de vida en los accesos.
  add('lantern', { x: 2540, y: 1000 })
  add('lantern', { x: 2660, y: 1000 })
  add('sign', { x: 2520, y: 1140 })

  return {
    props,
    obstacles,
    npcs,
    // Obstáculo dinámico: la barrera de la puerta sólo existe mientras está cerrada.
    gateBarrier: rect(WORLD.gate.x - 27, WORLD.gate.y - 116, 54, 232, 'gate'),
    gate: props.find((p) => p.kind === 'gate'),
  }
}

export function drawProp(ctx, prop, time, state = {}) {
  switch (prop.kind) {
    case 'tree': drawTree(ctx, prop, time); break
    case 'house': drawHouse(ctx, prop, time); break
    case 'shrine': drawShrine(ctx, prop, time, true); break
    case 'fountain': drawFountain(ctx, prop, time); break
    case 'statue': drawStatue(ctx, prop, time); break
    case 'stall': drawStall(ctx, prop, time); break
    case 'anvil': drawAnvil(ctx, prop); break
    case 'sign': drawSign(ctx, prop); break
    case 'lantern': drawLantern(ctx, prop, time); break
    case 'bush': drawBush(ctx, prop, time); break
    case 'rock': drawRock(ctx, prop); break
    case 'column': drawRuinColumn(ctx, prop, time); break
    case 'crystal': drawCrystal(ctx, prop, time); break
    case 'arenaPillar': drawArenaPillar(ctx, prop, time); break
    case 'pedestal': drawPedestal(ctx, prop.x, prop.y, time, !state.bossDefeated); break
    case 'gate': drawGate(ctx, prop, time, Boolean(state.gateOpen)); break
    case 'flower': {
      ctx.save()
      const colors = ['rgba(255,210,226,.72)', 'rgba(255,239,170,.72)', 'rgba(190,224,255,.72)', 'rgba(190,255,226,.72)']
      ctx.fillStyle = colors[prop.hue % colors.length]
      for (let i = 0; i < 4; i++) {
        const a = i / 4 * TAU + prop.x * .01
        ctx.beginPath(); ctx.arc(prop.x + Math.cos(a) * 2.5, prop.y + Math.sin(a) * 1.5, 1.4, 0, TAU); ctx.fill()
      }
      ctx.restore()
      break
    }
    default: break
  }
}

export function drawInteractive(ctx, type, item, time, state = {}) {
  if (type === 'chest') drawChest(ctx, item, time, state.opened)
  else if (type === 'flower') drawMoonflower(ctx, item, time, state.collected)
  else if (type === 'rune') drawRunePillar(ctx, item, time, state.activated)
}

export function pointBlocked(obstacles, x, y, radius, gateOpen) {
  if (x < 45 || y < 45 || x > WORLD.width - 45 || y > WORLD.height - 45) return true
  for (const o of obstacles) {
    if (o.type === 'rect') {
      if (gateOpen && o.kind === 'gate') continue
      const nx = Math.max(o.x, Math.min(x, o.x + o.w))
      const ny = Math.max(o.y, Math.min(y, o.y + o.h))
      if ((x - nx) ** 2 + (y - ny) ** 2 < radius * radius) return true
    } else if ((x - o.x) ** 2 + (y - o.y) ** 2 < (radius + o.r) ** 2) {
      return true
    }
  }
  return false
}
