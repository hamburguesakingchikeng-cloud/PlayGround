import { WORLD } from '../content.js'
import { TAU, mulberry32, ellipse, rr, glow } from './common.js'

function noisePoints(ctx, rand, count, x, y, w, h, colors, minR, maxR) {
  for (let i = 0; i < count; i++) {
    const px = x + rand() * w
    const py = y + rand() * h
    const r = minR + rand() * (maxR - minR)
    ctx.fillStyle = colors[(rand() * colors.length) | 0]
    ctx.beginPath()
    ctx.ellipse(px, py, r, r * (0.45 + rand() * 0.7), rand() * TAU, 0, TAU)
    ctx.fill()
  }
}

function pathStroke(ctx, points, width, color, border = null) {
  const draw = () => {
    ctx.beginPath()
    ctx.moveTo(points[0][0], points[0][1])
    for (let i = 1; i < points.length - 1; i++) {
      const midX = (points[i][0] + points[i + 1][0]) / 2
      const midY = (points[i][1] + points[i + 1][1]) / 2
      ctx.quadraticCurveTo(points[i][0], points[i][1], midX, midY)
    }
    const last = points[points.length - 1]
    ctx.lineTo(last[0], last[1])
  }
  if (border) {
    draw(); ctx.strokeStyle = border; ctx.lineWidth = width + 16; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.stroke()
  }
  draw(); ctx.strokeStyle = color; ctx.lineWidth = width; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.stroke()
}

function roadPebbles(ctx, rand, points, count, spread, color) {
  // Reparte piedrecillas cerca de los segmentos del camino.
  for (let i = 0; i < count; i++) {
    const seg = Math.floor(rand() * (points.length - 1))
    const a = points[seg], b = points[seg + 1]
    const t = rand()
    const x = a[0] + (b[0] - a[0]) * t + (rand() - .5) * spread
    const y = a[1] + (b[1] - a[1]) * t + (rand() - .5) * spread
    ellipse(ctx, x, y, 1.5 + rand() * 4, 1 + rand() * 2.3, rand())
    ctx.fillStyle = color[(rand() * color.length) | 0]
    ctx.fill()
  }
}

function cobblePlaza(ctx, rand, cx, cy, radius) {
  const g = ctx.createRadialGradient(cx, cy, 10, cx, cy, radius)
  g.addColorStop(0, '#8b826d'); g.addColorStop(.68, '#726b5a'); g.addColorStop(1, 'rgba(82,79,65,0)')
  ctx.fillStyle = g
  ctx.beginPath(); ctx.arc(cx, cy, radius, 0, TAU); ctx.fill()
  for (let ring = 1; ring < 9; ring++) {
    const r = radius * ring / 9
    const n = Math.max(8, Math.floor(r / 9))
    for (let i = 0; i < n; i++) {
      const a = i / n * TAU + ring * .18
      const px = cx + Math.cos(a) * r
      const py = cy + Math.sin(a) * r
      ctx.save(); ctx.translate(px, py); ctx.rotate(a)
      rr(ctx, -5, -3, 10 + rand() * 3, 6 + rand() * 2, 2)
      ctx.fillStyle = ['#8f8771', '#786f5c', '#9c9279', '#6c6656'][(rand() * 4) | 0]
      ctx.fill()
      ctx.strokeStyle = 'rgba(40,38,30,.25)'; ctx.lineWidth = .6; ctx.stroke()
      ctx.restore()
    }
  }
}

function ruinsFloor(ctx, rand) {
  ctx.save()
  ctx.beginPath()
  ctx.moveTo(2500, 178)
  ctx.lineTo(3570, 240)
  ctx.lineTo(3590, 1500)
  ctx.lineTo(2460, 1515)
  ctx.closePath()
  ctx.clip()
  const g = ctx.createLinearGradient(2500, 200, 3540, 1500)
  g.addColorStop(0, '#3f3b4b'); g.addColorStop(.5, '#37343f'); g.addColorStop(1, '#2c2b34')
  ctx.fillStyle = g; ctx.fillRect(2450, 150, 1160, 1400)
  for (let y = 240; y < 1520; y += 64) {
    for (let x = 2490; x < 3600; x += 90) {
      const off = ((y / 64) | 0) % 2 ? 45 : 0
      ctx.fillStyle = ['#464252', '#403d4a', '#383741', '#4a4657'][(rand() * 4) | 0]
      rr(ctx, x + off + 2, y + 2, 84, 58, 3); ctx.fill()
      ctx.strokeStyle = 'rgba(18,17,24,.55)'; ctx.lineWidth = 1.5; ctx.stroke()
      if (rand() < .18) {
        ctx.strokeStyle = 'rgba(18,18,24,.7)'; ctx.lineWidth = .8
        ctx.beginPath(); ctx.moveTo(x + off + 15, y + 8); ctx.lineTo(x + off + 35, y + 28); ctx.lineTo(x + off + 24, y + 50); ctx.stroke()
      }
      if (rand() < .12) {
        ctx.fillStyle = 'rgba(70,99,67,.35)'
        ctx.beginPath(); ctx.arc(x + off + 65, y + 20, 5 + rand() * 7, 0, TAU); ctx.fill()
      }
    }
  }
  ctx.restore()
  // borde musgoso
  ctx.strokeStyle = 'rgba(43,70,58,.45)'; ctx.lineWidth = 8
  ctx.beginPath(); ctx.moveTo(2502, 185); ctx.lineTo(3565, 242); ctx.lineTo(3584, 1494); ctx.lineTo(2468, 1508); ctx.stroke()
}

function arenaFloor(ctx, rand) {
  const { x, y } = WORLD.arena
  const g = ctx.createRadialGradient(x, y, 20, x, y, 360)
  g.addColorStop(0, '#403752'); g.addColorStop(.6, '#332e3d'); g.addColorStop(1, 'rgba(28,26,34,0)')
  ctx.fillStyle = g
  ctx.beginPath(); ctx.arc(x, y, 350, 0, TAU); ctx.fill()
  // losas radiales
  for (let ring = 0; ring < 5; ring++) {
    const r = 80 + ring * 58
    const n = 18 + ring * 4
    for (let i = 0; i < n; i++) {
      const a = i / n * TAU
      ctx.save(); ctx.translate(x + Math.cos(a) * r, y + Math.sin(a) * r); ctx.rotate(a + Math.PI / 2)
      rr(ctx, -12, -7, 24, 14, 2)
      ctx.fillStyle = ['#494255', '#3e3948', '#51485e', '#393440'][(rand() * 4) | 0]
      ctx.fill(); ctx.strokeStyle = 'rgba(15,13,21,.5)'; ctx.lineWidth = 1; ctx.stroke()
      ctx.restore()
    }
  }
  // círculo mágico
  ctx.strokeStyle = 'rgba(146,111,211,.35)'; ctx.lineWidth = 2
  for (const r of [92, 188, 286]) { ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.stroke() }
  ctx.strokeStyle = 'rgba(146,111,211,.23)'; ctx.lineWidth = 1
  for (let i = 0; i < 12; i++) {
    const a = i / 12 * TAU
    ctx.beginPath(); ctx.moveTo(x + Math.cos(a) * 92, y + Math.sin(a) * 92); ctx.lineTo(x + Math.cos(a) * 286, y + Math.sin(a) * 286); ctx.stroke()
  }
  // grietas
  for (let i = 0; i < 18; i++) {
    const a = rand() * TAU, r = 60 + rand() * 250
    const px = x + Math.cos(a) * r, py = y + Math.sin(a) * r
    ctx.strokeStyle = 'rgba(10,9,15,.55)'; ctx.lineWidth = 1 + rand() * 1.4
    ctx.beginPath(); ctx.moveTo(px, py)
    let lx = px, ly = py
    for (let k = 0; k < 4; k++) { lx += (rand() - .5) * 22; ly += (rand() - .5) * 22; ctx.lineTo(lx, ly) }
    ctx.stroke()
  }
}

export function createWorldSurface() {
  const canvas = document.createElement('canvas')
  canvas.width = WORLD.width
  canvas.height = WORLD.height
  const ctx = canvas.getContext('2d')
  const rand = mulberry32(771983)

  // Base de hierba: tres zonas con transición suave.
  const base = ctx.createLinearGradient(0, 0, WORLD.width, WORLD.height)
  base.addColorStop(0, '#263f33')
  base.addColorStop(.32, '#344d39')
  base.addColorStop(.58, '#4d543f')
  base.addColorStop(.78, '#3a3d3b')
  base.addColorStop(1, '#292a32')
  ctx.fillStyle = base; ctx.fillRect(0, 0, WORLD.width, WORLD.height)

  // Manchas de hierba y tierra
  noisePoints(ctx, rand, 1250, 0, 0, WORLD.width, WORLD.height,
    ['#2d4937', '#3b5941', '#405d40', '#314838', '#52623f', '#3d4637'], 18, 90)
  noisePoints(ctx, rand, 900, 0, 0, WORLD.width, WORLD.height,
    ['rgba(138,127,82,.10)', 'rgba(90,110,71,.15)', 'rgba(31,53,42,.2)'], 8, 35)

  // Bosque: musgo, helechos y raíces.
  ctx.save()
  ctx.beginPath(); ctx.rect(0, 0, 1320, WORLD.height); ctx.clip()
  const forestShade = ctx.createRadialGradient(650, 1250, 120, 650, 1250, 1150)
  forestShade.addColorStop(0, 'rgba(78,103,68,.13)'); forestShade.addColorStop(1, 'rgba(8,25,21,.38)')
  ctx.fillStyle = forestShade; ctx.fillRect(0, 0, 1320, WORLD.height)
  for (let i = 0; i < 700; i++) {
    const x = rand() * 1320, y = rand() * WORLD.height
    ctx.strokeStyle = ['rgba(92,132,79,.35)', 'rgba(55,92,62,.4)', 'rgba(111,145,81,.26)'][(rand() * 3) | 0]
    ctx.lineWidth = .8 + rand() * .8
    ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + 3, y - 7, x + (rand() - .5) * 8, y - 12); ctx.stroke()
  }
  ctx.restore()

  // Caminos
  const road = ['#8a7d66', '#978a71', '#7d725e']
  pathStroke(ctx, [[150, 1180], [540, 1210], [930, 1290], [1320, 1200], [1570, 1140], [1790, 1120]], 112, '#7f735e', 'rgba(42,48,35,.45)')
  pathStroke(ctx, [[1790, 1120], [1900, 1370], [1740, 1660], [1540, 2000], [1500, 2300]], 98, '#857962', 'rgba(42,48,35,.35)')
  pathStroke(ctx, [[1790, 1120], [2210, 1080], [2470, 1010], [2598, 1000], [2780, 980], [2980, 1030], [3140, 860], [3220, 590]], 108, '#7b7060', 'rgba(36,38,35,.4)')
  roadPebbles(ctx, rand, [[150, 1180], [540, 1210], [930, 1290], [1320, 1200], [1570, 1140], [1790, 1120]], 240, 86, road)
  roadPebbles(ctx, rand, [[1790, 1120], [1900, 1370], [1740, 1660], [1540, 2000], [1500, 2300]], 180, 78, road)
  roadPebbles(ctx, rand, [[1790, 1120], [2210, 1080], [2470, 1010], [2598, 1000], [2780, 980], [2980, 1030], [3140, 860], [3220, 590]], 220, 84, road)

  // Plaza central
  cobblePlaza(ctx, rand, 1790, 1120, 260)
  // pequeños charcos de luz
  for (let i = 0; i < 40; i++) {
    const x = 1550 + rand() * 480, y = 900 + rand() * 430
    if (Math.hypot(x - 1790, y - 1120) > 270) continue
    ctx.fillStyle = 'rgba(224,196,124,.055)'
    ctx.beginPath(); ctx.arc(x, y, 2 + rand() * 7, 0, TAU); ctx.fill()
  }

  // Zona de ruinas
  ruinsFloor(ctx, rand)
  arenaFloor(ctx, rand)

  // Senderos de piedra dentro de ruinas
  pathStroke(ctx, [[2598, 1000], [2810, 970], [3020, 900], [3220, 590]], 82, '#5d5665', 'rgba(19,18,25,.45)')
  pathStroke(ctx, [[2598, 1000], [2820, 1180], [3060, 1190], [3220, 1090]], 54, '#56505e', 'rgba(19,18,25,.3)')

  // Flores y detalles del prado
  for (let i = 0; i < 520; i++) {
    const x = rand() * 2500, y = 180 + rand() * 2100
    if (x > 1250 && x < 2450 && Math.hypot(x - 1790, y - 1120) < 300) continue
    const palette = ['rgba(238,226,161,.55)', 'rgba(201,219,255,.42)', 'rgba(241,168,187,.35)', 'rgba(137,220,201,.34)']
    ctx.fillStyle = palette[(rand() * palette.length) | 0]
    const r = .8 + rand() * 2.2
    ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill()
    if (rand() < .3) {
      ctx.strokeStyle = 'rgba(100,142,87,.38)'; ctx.lineWidth = .6
      ctx.beginPath(); ctx.moveTo(x, y + 2); ctx.lineTo(x + (rand() - .5) * 4, y + 6); ctx.stroke()
    }
  }

  // Hojas caídas
  for (let i = 0; i < 350; i++) {
    const x = rand() * 1500, y = rand() * WORLD.height
    ctx.save(); ctx.translate(x, y); ctx.rotate(rand() * TAU)
    ctx.fillStyle = ['rgba(177,145,84,.32)', 'rgba(121,154,102,.26)', 'rgba(96,73,77,.3)'][(rand() * 3) | 0]
    ellipse(ctx, 0, 0, 2 + rand() * 3, 1 + rand(), 0); ctx.fill(); ctx.restore()
  }

  // Vignette de terreno en los bordes
  const edge = ctx.createLinearGradient(0, 0, 260, 0)
  edge.addColorStop(0, 'rgba(6,16,15,.7)'); edge.addColorStop(1, 'rgba(6,16,15,0)')
  ctx.fillStyle = edge; ctx.fillRect(0, 0, 260, WORLD.height)
  const edgeR = ctx.createLinearGradient(WORLD.width, 0, WORLD.width - 240, 0)
  edgeR.addColorStop(0, 'rgba(8,7,14,.66)'); edgeR.addColorStop(1, 'rgba(8,7,14,0)')
  ctx.fillStyle = edgeR; ctx.fillRect(WORLD.width - 240, 0, 240, WORLD.height)
  const edgeT = ctx.createLinearGradient(0, 0, 0, 180)
  edgeT.addColorStop(0, 'rgba(5,13,18,.76)'); edgeT.addColorStop(1, 'rgba(5,13,18,0)')
  ctx.fillStyle = edgeT; ctx.fillRect(0, 0, WORLD.width, 180)
  const edgeB = ctx.createLinearGradient(0, WORLD.height, 0, WORLD.height - 180)
  edgeB.addColorStop(0, 'rgba(5,8,12,.7)'); edgeB.addColorStop(1, 'rgba(5,8,12,0)')
  ctx.fillStyle = edgeB; ctx.fillRect(0, WORLD.height - 180, WORLD.width, 180)

  return canvas
}
