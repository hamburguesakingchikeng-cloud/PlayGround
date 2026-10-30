import { TAU, rr, ellipse, glow, mulberry32, polygon } from './common.js'

const OUTLINE = '#101522'

function seededClusters(seed) {
  const rand = mulberry32(seed)
  const clusters = []
  for (let i = 0; i < 15; i++) {
    const a = rand() * TAU
    const r = Math.sqrt(rand())
    clusters.push({
      x: Math.cos(a) * r * 62,
      y: Math.sin(a) * r * 42 - 116,
      s: 24 + rand() * 22,
      layer: rand(),
      hue: rand(),
    })
  }
  return clusters
}

function drawLeafCluster(ctx, x, y, s, color, highlight, time, sway) {
  const wobble = Math.sin(time * .9 + x * .03) * sway
  ctx.save()
  ctx.translate(x + wobble, y)
  ctx.fillStyle = color
  ctx.beginPath()
  // forma de hoja ancha con borde irregular
  ctx.moveTo(-s, 2)
  ctx.bezierCurveTo(-s * 1.08, -s * .55, -s * .55, -s * 1.02, 0, -s * .88)
  ctx.bezierCurveTo(s * .62, -s * 1.03, s * 1.04, -s * .48, s * .94, 3)
  ctx.bezierCurveTo(s * .6, s * .45, s * .22, s * .27, 0, s * .4)
  ctx.bezierCurveTo(-s * .3, s * .25, -s * .7, s * .55, -s, 2)
  ctx.closePath()
  ctx.fill()
  ctx.fillStyle = highlight
  ctx.globalAlpha = .5
  ellipse(ctx, -s * .25, -s * .38, s * .52, s * .30, -.5)
  ctx.fill()
  ctx.globalAlpha = 1
  ctx.restore()
}

export function drawTree(ctx, tree, time) {
  const scale = tree.scale || 1
  const variant = tree.variant || 0
  const sway = variant === 1 ? 2.2 : 1.2
  const rand = mulberry32(tree.seed || 7)
  const clusters = tree.clusters || (tree.clusters = seededClusters(tree.seed || 7))
  const palette = variant === 1
    ? ['#1b5b5b', '#277a73', '#3f9b83', '#7ed7ac']
    : variant === 2
      ? ['#573e5e', '#885a78', '#c27e94', '#ffc5ce']
      : ['#1e4b35', '#2d6743', '#43834e', '#82bb67']

  ctx.save()
  ctx.translate(tree.x, tree.y)
  ctx.scale(scale, scale)
  // sombra
  ellipse(ctx, 8, 2, 57, 15)
  ctx.fillStyle = 'rgba(3,10,13,.35)'; ctx.fill()
  // raíces
  ctx.strokeStyle = '#2f241c'; ctx.lineWidth = 5; ctx.lineCap = 'round'
  ctx.beginPath(); ctx.moveTo(-3, -6); ctx.quadraticCurveTo(-23, -1, -31, 7); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(4, -5); ctx.quadraticCurveTo(20, 2, 28, 6); ctx.stroke()
  // tronco
  const trunk = ctx.createLinearGradient(-14, -80, 14, 0)
  trunk.addColorStop(0, '#72553c'); trunk.addColorStop(.45, '#4c3828'); trunk.addColorStop(1, '#2b211b')
  ctx.fillStyle = trunk; ctx.strokeStyle = OUTLINE; ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(-13, 0)
  ctx.bezierCurveTo(-8, -25, -12, -50, -4, -77 + Math.sin(time + tree.seed) * .7)
  ctx.lineTo(7, -79)
  ctx.bezierCurveTo(12, -50, 8, -25, 14, 0)
  ctx.closePath(); ctx.fill(); ctx.stroke()
  // corteza
  ctx.strokeStyle = 'rgba(220,180,130,.18)'; ctx.lineWidth = 1.2
  ctx.beginPath(); ctx.moveTo(-7, -3); ctx.quadraticCurveTo(-10, -35, -2, -64); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(4, -5); ctx.quadraticCurveTo(9, -30, 5, -58); ctx.stroke()
  // ramas
  ctx.strokeStyle = '#3d2d23'; ctx.lineWidth = 3.3
  for (const side of [-1, 1]) {
    ctx.beginPath(); ctx.moveTo(side * 4, -63); ctx.quadraticCurveTo(side * 28, -79, side * 59, -89 + rand() * 10); ctx.stroke()
  }
  // copa por capas
  const sorted = clusters.slice().sort((a, b) => a.layer - b.layer)
  for (const c of sorted) {
    const idx = c.hue < .45 ? 0 : c.hue < .78 ? 1 : c.hue < .94 ? 2 : 3
    drawLeafCluster(ctx, c.x, c.y, c.s, palette[idx], palette[Math.min(3, idx + 1)], time, sway)
  }
  // hojas sueltas brillantes
  if (variant === 1 || variant === 2) {
    ctx.globalCompositeOperation = 'lighter'
    for (let i = 0; i < 9; i++) {
      const a = time * .35 + i * 1.9
      const x = Math.cos(a) * (40 + (i % 3) * 14)
      const y = -115 + Math.sin(a * 1.4) * 35 + (i % 4) * 8
      ctx.fillStyle = variant === 2 ? 'rgba(255,181,202,.6)' : 'rgba(120,255,210,.45)'
      ellipse(ctx, x, y, 1.5, 1.5); ctx.fill()
    }
  }
  ctx.restore()
}

export function drawHouse(ctx, house, time) {
  const w = house.w || 220
  const h = house.h || 156
  const x = house.x
  const y = house.y
  ctx.save()
  ctx.translate(x, y)
  // sombra
  ellipse(ctx, 14, 6, w * .55, 22)
  ctx.fillStyle = 'rgba(4,10,16,.42)'; ctx.fill()
  // pared
  const wall = ctx.createLinearGradient(0, -h, 0, 0)
  wall.addColorStop(0, '#d4c29d'); wall.addColorStop(.55, '#b5a07c'); wall.addColorStop(1, '#7d6a54')
  ctx.fillStyle = wall; ctx.strokeStyle = OUTLINE; ctx.lineWidth = 2.4
  rr(ctx, -w / 2, -h, w, h, 4); ctx.fill(); ctx.stroke()
  // madera estructural
  ctx.strokeStyle = '#58402d'; ctx.lineWidth = 7
  ctx.beginPath(); ctx.moveTo(-w / 2 + 10, -h + 6); ctx.lineTo(-w / 2 + 10, -6); ctx.moveTo(w / 2 - 10, -h + 6); ctx.lineTo(w / 2 - 10, -6); ctx.stroke()
  ctx.lineWidth = 4
  ctx.beginPath(); ctx.moveTo(-w / 2 + 12, -h * .62); ctx.lineTo(w / 2 - 12, -h * .62); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(-w / 2 + 12, -h * .62); ctx.lineTo(w / 2 - 12, -h + 14); ctx.moveTo(w / 2 - 12, -h * .62); ctx.lineTo(-w / 2 + 12, -h + 14); ctx.stroke()
  // ventanas cálidas
  for (const wx of [-w * .27, w * .27]) {
    glow(ctx, wx, -h * .55, 49, 'rgba(255,183,86,.26)', .8)
    ctx.fillStyle = '#ffcf7d'; ctx.strokeStyle = '#4c3828'; ctx.lineWidth = 4
    rr(ctx, wx - 19, -h * .62, 38, 30, 2); ctx.fill(); ctx.stroke()
    ctx.strokeStyle = 'rgba(108,72,39,.7)'; ctx.lineWidth = 2
    ctx.beginPath(); ctx.moveTo(wx, -h * .62); ctx.lineTo(wx, -h * .62 + 30); ctx.moveTo(wx - 19, -h * .49); ctx.lineTo(wx + 19, -h * .49); ctx.stroke()
    ctx.fillStyle = 'rgba(255,242,195,.5)'
    rr(ctx, wx - 15, -h * .60, 9, 9, 1); ctx.fill()
  }
  // puerta
  ctx.fillStyle = '#4b3325'; ctx.strokeStyle = '#261b17'; ctx.lineWidth = 3
  rr(ctx, -21, -49, 42, 49, 19); ctx.fill(); ctx.stroke()
  ctx.fillStyle = '#c7a85f'; ctx.beginPath(); ctx.arc(12, -24, 2.2, 0, TAU); ctx.fill()
  ctx.strokeStyle = 'rgba(166,129,77,.5)'; ctx.lineWidth = 1.4
  ctx.beginPath(); ctx.arc(-20, -38, 4, 0, TAU); ctx.stroke()
  // tejado
  const roofY = -h - 9
  ctx.fillStyle = '#402e37'; ctx.strokeStyle = '#17151d'; ctx.lineWidth = 2.5
  ctx.beginPath()
  ctx.moveTo(-w / 2 - 25, roofY + 20)
  ctx.quadraticCurveTo(-w / 2 + 8, roofY - 26, -w * .18, roofY - 48)
  ctx.quadraticCurveTo(0, roofY - 60, w * .18, roofY - 48)
  ctx.quadraticCurveTo(w / 2 - 8, roofY - 26, w / 2 + 25, roofY + 20)
  ctx.lineTo(w / 2 + 15, roofY + 41)
  ctx.quadraticCurveTo(0, roofY + 12, -w / 2 - 15, roofY + 41)
  ctx.closePath(); ctx.fill(); ctx.stroke()
  // tejas
  ctx.strokeStyle = 'rgba(214,154,122,.23)'; ctx.lineWidth = 1.2
  for (let i = 0; i < 5; i++) {
    ctx.beginPath()
    ctx.moveTo(-w / 2 - 20 + i * 4, roofY + 23 + i * 2)
    ctx.quadraticCurveTo(0, roofY - 24 + i * 6, w / 2 + 20 - i * 4, roofY + 23 + i * 2)
    ctx.stroke()
  }
  // chimenea
  ctx.fillStyle = '#6a5a4a'; ctx.strokeStyle = '#1b1719'; ctx.lineWidth = 2
  rr(ctx, w * .28, -h - 90, 27, 50, 3); ctx.fill(); ctx.stroke()
  // humo
  ctx.globalAlpha = .18
  for (let i = 0; i < 4; i++) {
    const a = time * .4 + i * 1.5
    ellipse(ctx, w * .28 + 13 + Math.sin(a) * 12, -h - 92 - i * 14, 8 + i * 3, 5 + i * 2)
    ctx.fillStyle = '#cbd4d5'; ctx.fill()
  }
  ctx.globalAlpha = 1
  // enredaderas y estandarte
  ctx.strokeStyle = '#43633e'; ctx.lineWidth = 2
  ctx.beginPath(); ctx.moveTo(-w / 2 - 4, -8); ctx.quadraticCurveTo(-w / 2 - 8, -h * .3, -w / 2 + 2, -h * .62); ctx.stroke()
  const bannerX = -w * .41
  ctx.fillStyle = '#31536b'; ctx.strokeStyle = '#d3ae5e'; ctx.lineWidth = 1.2
  ctx.beginPath(); ctx.moveTo(bannerX - 10, roofY + 20); ctx.lineTo(bannerX + 10, roofY + 20); ctx.lineTo(bannerX + 7, roofY + 57); ctx.lineTo(bannerX, roofY + 48); ctx.lineTo(bannerX - 7, roofY + 57); ctx.closePath(); ctx.fill(); ctx.stroke()
  ctx.restore()
}

export function drawShrine(ctx, shrine, time, active = true) {
  const x = shrine.x, y = shrine.y
  ctx.save()
  ctx.translate(x, y)
  ellipse(ctx, 0, 2, 78, 20); ctx.fillStyle = 'rgba(3,8,20,.4)'; ctx.fill()
  // escalones
  for (let i = 0; i < 3; i++) {
    ctx.fillStyle = ['#777262', '#8a8574', '#98927f'][i]
    rr(ctx, -48 - i * 7, -14 - i * 7, 96 + i * 14, 10, 2); ctx.fill()
    ctx.strokeStyle = '#3a3a36'; ctx.lineWidth = 1; ctx.stroke()
  }
  // plataforma
  ellipse(ctx, 0, -26, 42, 13); ctx.fillStyle = '#8c8674'; ctx.fill(); ctx.strokeStyle = '#3b3a35'; ctx.lineWidth = 1.5; ctx.stroke()
  // pilares
  for (const side of [-1, 1]) {
    ctx.fillStyle = '#6d6b61'; ctx.strokeStyle = '#24272c'; ctx.lineWidth = 1.5
    rr(ctx, side * 31 - 7, -99, 14, 76, 2); ctx.fill(); ctx.stroke()
    ctx.fillStyle = '#8d8a7d'; rr(ctx, side * 31 - 10, -103, 20, 8, 2); ctx.fill(); ctx.stroke()
    ctx.strokeStyle = 'rgba(89,172,152,.5)'; ctx.lineWidth = 1.2
    ctx.beginPath(); ctx.moveTo(side * 31, -91); ctx.lineTo(side * 31, -77); ctx.stroke()
  }
  // arco
  ctx.strokeStyle = '#55574f'; ctx.lineWidth = 9
  ctx.beginPath(); ctx.arc(0, -93, 42, Math.PI + .1, -.1); ctx.stroke()
  ctx.strokeStyle = '#b5ad94'; ctx.lineWidth = 2
  ctx.beginPath(); ctx.arc(0, -93, 46, Math.PI + .1, -.1); ctx.stroke()
  // altar
  ctx.fillStyle = '#9b9073'; rr(ctx, -17, -48, 34, 26, 3); ctx.fill(); ctx.strokeStyle = '#3b382e'; ctx.stroke()
  // sigilo flotante
  const bob = Math.sin(time * 1.7) * 3
  glow(ctx, 0, -76 + bob, 32, active ? 'rgba(118,255,221,.45)' : 'rgba(140,120,180,.25)', .8)
  ctx.save(); ctx.translate(0, -76 + bob); ctx.rotate(time * .3)
  ctx.strokeStyle = active ? '#b9ffe9' : '#a99bc9'; ctx.lineWidth = 1.3
  ctx.beginPath(); ctx.arc(0, 0, 11, 0, TAU); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(0, -16); ctx.lineTo(5, -5); ctx.lineTo(16, 0); ctx.lineTo(5, 5); ctx.lineTo(0, 16); ctx.lineTo(-5, 5); ctx.lineTo(-16, 0); ctx.lineTo(-5, -5); ctx.closePath(); ctx.stroke()
  ctx.restore()
  // luz vertical
  if (active) {
    const beam = ctx.createLinearGradient(0, -180, 0, -40)
    beam.addColorStop(0, 'rgba(110,255,221,0)'); beam.addColorStop(.65, 'rgba(110,255,221,.075)'); beam.addColorStop(1, 'rgba(110,255,221,0)')
    ctx.fillStyle = beam
    ctx.beginPath(); ctx.moveTo(-13, -175); ctx.lineTo(13, -175); ctx.lineTo(26, -35); ctx.lineTo(-26, -35); ctx.closePath(); ctx.fill()
  }
  ctx.restore()
}

export function drawFountain(ctx, fountain, time) {
  const x = fountain.x, y = fountain.y
  ctx.save()
  ctx.translate(x, y)
  ellipse(ctx, 0, 5, 70, 18); ctx.fillStyle = 'rgba(3,9,17,.4)'; ctx.fill()
  // base de piedra
  ellipse(ctx, 0, -9, 60, 25); ctx.fillStyle = '#7d7869'; ctx.fill(); ctx.strokeStyle = '#363a38'; ctx.lineWidth = 2; ctx.stroke()
  ellipse(ctx, 0, -14, 57, 19); ctx.fillStyle = '#59636a'; ctx.fill()
  // agua
  const water = ctx.createRadialGradient(-8, -20, 3, 0, -14, 48)
  water.addColorStop(0, '#85e9e0'); water.addColorStop(.5, '#3c9eab'); water.addColorStop(1, '#235b75')
  ellipse(ctx, 0, -14, 51, 15); ctx.fillStyle = water; ctx.fill()
  // ondas
  ctx.strokeStyle = 'rgba(197,255,247,.35)'; ctx.lineWidth = .9
  for (let i = 0; i < 3; i++) {
    const t = (time * .25 + i / 3) % 1
    ellipse(ctx, 0, -14, 10 + t * 40, 2 + t * 11); ctx.stroke()
  }
  // pilar y estatua
  ctx.fillStyle = '#898474'; rr(ctx, -8, -58, 16, 40, 2); ctx.fill(); ctx.strokeStyle = '#353a3a'; ctx.lineWidth = 1.2; ctx.stroke()
  ctx.fillStyle = '#a7a18d'
  ctx.beginPath(); ctx.arc(0, -64, 8, 0, TAU); ctx.fill()
  ctx.strokeStyle = '#3b3d3b'; ctx.lineWidth = 1.2; ctx.stroke()
  // alas de la estatua
  polygon(ctx, [[-4, -65], [-34, -83], [-26, -62]], '#8d8978', '#3a3c39', 1)
  polygon(ctx, [[4, -65], [34, -83], [26, -62]], '#8d8978', '#3a3c39', 1)
  // aura de agua
  glow(ctx, 0, -24, 45, 'rgba(101,246,228,.22)', .8)
  // pétalos flotantes
  for (let i = 0; i < 7; i++) {
    const a = time * .35 + i * 1.2
    const r = 20 + (i % 3) * 12
    ellipse(ctx, Math.cos(a) * r, -15 + Math.sin(a) * r * .25, 2, 1, a)
    ctx.fillStyle = 'rgba(255,220,236,.6)'; ctx.fill()
  }
  ctx.restore()
}

export function drawGate(ctx, gate, time, open = false) {
  const x = gate.x, y = gate.y
  ctx.save()
  ctx.translate(x, y)
  // pilares a ambos lados del camino (vertical en el mapa)
  for (const side of [-1, 1]) {
    const py = side * 108
    ellipse(ctx, 0, py + 6, 22, 8); ctx.fillStyle = 'rgba(3,5,12,.38)'; ctx.fill()
    ctx.fillStyle = '#4a4555'; ctx.strokeStyle = '#151420'; ctx.lineWidth = 2
    rr(ctx, -13, py - 105, 26, 111, 3); ctx.fill(); ctx.stroke()
    ctx.fillStyle = '#625b75'; rr(ctx, -18, py - 115, 36, 14, 2); ctx.fill(); ctx.stroke()
    ctx.strokeStyle = open ? '#88ffdd' : '#a77bff'; ctx.lineWidth = 1.4
    for (let i = 0; i < 3; i++) {
      ctx.beginPath(); ctx.moveTo(-6, py - 88 + i * 22); ctx.lineTo(6, py - 80 + i * 22); ctx.lineTo(-3, py - 70 + i * 22); ctx.stroke()
    }
    glow(ctx, 0, py - 55, 32, open ? 'rgba(122,255,221,.35)' : 'rgba(167,123,255,.28)', .6)
    // remate
    polygon(ctx, [[-18, py - 114], [-6, py - 139], [0, py - 121], [6, py - 139], [18, py - 114]], '#5a526b', '#171522', 1.4)
  }
  if (!open) {
    // barrera mágica entre pilares
    const barrier = ctx.createLinearGradient(-25, 0, 25, 0)
    barrier.addColorStop(0, 'rgba(120,82,210,.05)')
    barrier.addColorStop(.5, 'rgba(171,123,255,.42)')
    barrier.addColorStop(1, 'rgba(120,82,210,.05)')
    ctx.fillStyle = barrier
    ctx.fillRect(-25, -108, 50, 216)
    ctx.strokeStyle = 'rgba(198,158,255,.64)'; ctx.lineWidth = 1.4
    for (let i = 0; i < 6; i++) {
      const yy = -102 + ((time * 20 + i * 38) % 204)
      ctx.beginPath(); ctx.moveTo(-24, yy); ctx.quadraticCurveTo(0, yy - 9, 24, yy); ctx.stroke()
    }
    for (let i = 0; i < 8; i++) {
      const yy = -98 + ((i * 31 + time * 13) % 196)
      ellipse(ctx, Math.sin(time + i) * 17, yy, 1.6, 1.6); ctx.fillStyle = 'rgba(224,199,255,.7)'; ctx.fill()
    }
    glow(ctx, 0, -3, 80, 'rgba(151,101,255,.2)', .8)
  }
  ctx.restore()
}

export function drawRuinColumn(ctx, col, time) {
  const h = col.height || 135
  ctx.save()
  ctx.translate(col.x, col.y)
  ellipse(ctx, 0, 4, 24, 9); ctx.fillStyle = 'rgba(2,4,10,.38)'; ctx.fill()
  ctx.fillStyle = '#5e5968'; ctx.strokeStyle = '#171621'; ctx.lineWidth = 2
  rr(ctx, -16, -h, 32, h, 2); ctx.fill(); ctx.stroke()
  // tambores
  ctx.strokeStyle = 'rgba(27,25,37,.45)'; ctx.lineWidth = 1
  for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.moveTo(-16, -h + 20 + i * 22); ctx.lineTo(16, -h + 20 + i * 22); ctx.stroke() }
  // capitel roto
  if (col.broken) {
    ctx.fillStyle = '#6e6878'
    polygon(ctx, [[-19, -h + 3], [-5, -h - 16], [10, -h + 1], [22, -h + 9], [-18, -h + 9]], '#6e6878', '#171621', 1.2)
    ctx.fillStyle = '#3b3447'
  } else {
    rr(ctx, -23, -h - 12, 46, 13, 2); ctx.fillStyle = '#6f6979'; ctx.fill(); ctx.stroke()
    rr(ctx, -20, -h - 22, 40, 11, 2); ctx.fillStyle = '#625c6d'; ctx.fill(); ctx.stroke()
  }
  // musgo y runas
  ctx.fillStyle = 'rgba(79,116,79,.38)'
  ellipse(ctx, -11, -h + 8, 8, 4, -.2); ctx.fill()
  ellipse(ctx, 12, -h * .35, 5, 2, .3); ctx.fill()
  ctx.strokeStyle = 'rgba(148,120,222,.5)'; ctx.lineWidth = 1.2
  ctx.beginPath(); ctx.moveTo(-2, -h * .7); ctx.lineTo(5, -h * .63); ctx.lineTo(-1, -h * .55); ctx.stroke()
  if (col.glow) glow(ctx, 0, -h * .62, 20, 'rgba(163,129,255,.28)', .6)
  ctx.restore()
}

export function drawCrystal(ctx, crystal, time) {
  const scale = crystal.scale || 1
  ctx.save()
  ctx.translate(crystal.x, crystal.y)
  ctx.scale(scale, scale)
  ellipse(ctx, 0, 3, 20, 7); ctx.fillStyle = 'rgba(2,5,13,.35)'; ctx.fill()
  const color = crystal.color || '#a77cff'
  glow(ctx, 0, -22, 40, color, .36 + Math.sin(time * 2 + crystal.x) * .05)
  for (let i = 0; i < 4; i++) {
    const h = 24 + i * 10
    const ox = (i - 1.5) * 7
    const tilt = (i % 2 ? 1 : -1) * .18
    ctx.save(); ctx.translate(ox, 0); ctx.rotate(tilt)
    const g = ctx.createLinearGradient(0, -h, 0, 0)
    g.addColorStop(0, '#eadcff'); g.addColorStop(.35, color); g.addColorStop(1, '#38265b')
    polygon(ctx, [[-5, 0], [-7, -h * .6], [0, -h], [7, -h * .6], [5, 0]], g, '#1a142a', 1.2)
    ctx.restore()
  }
  ctx.restore()
}
