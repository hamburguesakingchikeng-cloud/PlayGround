import { TAU, mulberry32, ellipse, glow, polygon } from './common.js'

const rand = mulberry32(91377)
const STARS = Array.from({ length: 190 }, () => ({
  x: rand() * 1600,
  y: rand() * 520,
  r: .5 + rand() * 1.8,
  a: .25 + rand() * .7,
  p: rand() * TAU,
}))

function starfield(ctx, t) {
  for (const s of STARS) {
    const a = s.a * (.65 + .35 * Math.sin(t * 1.2 + s.p))
    ctx.globalAlpha = a
    ctx.fillStyle = s.r > 1.5 ? '#e9f4ff' : '#9bbcdf'
    ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, TAU); ctx.fill()
  }
  ctx.globalAlpha = 1
  // estrella fugaz ocasional
  const cycle = (t * .12) % 1
  if (cycle < .05) {
    const p = cycle / .05
    const x = 200 + p * 520, y = 110 + p * 130
    const g = ctx.createLinearGradient(x, y, x - 70, y - 18)
    g.addColorStop(0, 'rgba(255,246,212,.9)'); g.addColorStop(1, 'rgba(255,246,212,0)')
    ctx.strokeStyle = g; ctx.lineWidth = 1.6
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 70, y - 18); ctx.stroke()
  }
}

function mountainLayer(ctx, baseY, color, seed, amp, alpha = 1) {
  const r = mulberry32(seed)
  ctx.globalAlpha = alpha
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.moveTo(-100, 900)
  ctx.lineTo(-100, baseY)
  let x = -100
  let y = baseY
  while (x < 1700) {
    const step = 90 + r() * 150
    const peak = baseY - (20 + r() * amp)
    ctx.quadraticCurveTo(x + step * .5, y - r() * amp * .25, x + step, peak)
    x += step
    y = peak
  }
  ctx.lineTo(1700, 900)
  ctx.closePath(); ctx.fill()
  ctx.globalAlpha = 1
}

function moon(ctx, x, y, r, t) {
  const halo = ctx.createRadialGradient(x, y, r * .1, x, y, r * 2.6)
  halo.addColorStop(0, 'rgba(219,245,255,.34)')
  halo.addColorStop(.35, 'rgba(148,208,235,.14)')
  halo.addColorStop(1, 'rgba(60,130,180,0)')
  ctx.fillStyle = halo
  ctx.beginPath(); ctx.arc(x, y, r * 2.6, 0, TAU); ctx.fill()
  const disc = ctx.createRadialGradient(x - r * .32, y - r * .34, r * .1, x, y, r)
  disc.addColorStop(0, '#f7fbdf'); disc.addColorStop(.6, '#dcecf0'); disc.addColorStop(1, '#a8c4d2')
  ctx.fillStyle = disc
  ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill()
  // cráteres suaves
  ctx.fillStyle = 'rgba(124,157,173,.18)'
  ellipse(ctx, x - r * .32, y - r * .18, r * .17, r * .12, -.3); ctx.fill()
  ellipse(ctx, x + r * .22, y + r * .19, r * .23, r * .15, .4); ctx.fill()
  ellipse(ctx, x + r * .04, y - r * .43, r * .1, r * .07, 0); ctx.fill()
  // anillo de luz
  ctx.strokeStyle = 'rgba(234,250,255,.28)'; ctx.lineWidth = 1
  ctx.beginPath(); ctx.arc(x, y, r * 1.02, 0, TAU); ctx.stroke()
  glow(ctx, x, y, r * 1.1, 'rgba(189,239,255,.2)', .6)
}

function cloudBand(ctx, y, width, alpha, t, seed) {
  const r = mulberry32(seed)
  ctx.save()
  ctx.globalAlpha = alpha
  for (let i = 0; i < 8; i++) {
    const x = ((r() * 1800 + t * (4 + r() * 6)) % 1800) - 100
    ellipse(ctx, x, y + Math.sin(t * .1 + i) * 5, width * (.35 + r() * .5), 5 + r() * 8)
    const g = ctx.createLinearGradient(x - width, y, x + width, y)
    g.addColorStop(0, 'rgba(180,213,227,0)'); g.addColorStop(.5, 'rgba(193,224,235,.28)'); g.addColorStop(1, 'rgba(180,213,227,0)')
    ctx.fillStyle = g; ctx.fill()
  }
  ctx.restore()
}

function arch(ctx, t) {
  ctx.save()
  ctx.translate(0, 0)
  // arco roto principal
  ctx.strokeStyle = '#1b2330'; ctx.lineWidth = 38; ctx.lineCap = 'round'
  ctx.beginPath(); ctx.arc(1210, 590, 250, Math.PI * .98, Math.PI * 1.96); ctx.stroke()
  ctx.strokeStyle = '#34404e'; ctx.lineWidth = 28
  ctx.beginPath(); ctx.arc(1210, 590, 250, Math.PI * .99, Math.PI * 1.95); ctx.stroke()
  // sillares
  ctx.strokeStyle = 'rgba(149,160,166,.2)'; ctx.lineWidth = 1.4
  for (let i = 0; i < 12; i++) {
    const a = Math.PI + i / 12 * Math.PI
    ctx.beginPath(); ctx.moveTo(1210 + Math.cos(a) * 235, 590 + Math.sin(a) * 235); ctx.lineTo(1210 + Math.cos(a) * 265, 590 + Math.sin(a) * 265); ctx.stroke()
  }
  // pilares
  for (const side of [-1, 1]) {
    const x = 1210 + side * 250
    ctx.fillStyle = '#26303e'; ctx.strokeStyle = '#10151d'; ctx.lineWidth = 3
    ctx.beginPath(); ctx.moveTo(x - 24, 600); ctx.lineTo(x - 17, 805); ctx.lineTo(x + 22, 815); ctx.lineTo(x + 26, 600); ctx.closePath(); ctx.fill(); ctx.stroke()
    ctx.fillStyle = '#334050'; ctx.fillRect(x - 36, 585, 70, 18)
    ctx.strokeStyle = 'rgba(116,181,174,.18)'; ctx.lineWidth = 1.2
    ctx.beginPath(); ctx.moveTo(x - 10, 632); ctx.lineTo(x + 4, 674); ctx.lineTo(x - 4, 706); ctx.stroke()
  }
  // enredaderas
  ctx.strokeStyle = 'rgba(68,103,80,.65)'; ctx.lineWidth = 3
  ctx.beginPath(); ctx.moveTo(950, 565); ctx.bezierCurveTo(960, 640, 932, 690, 940, 792); ctx.stroke()
  ctx.strokeStyle = 'rgba(79,121,92,.55)'; ctx.lineWidth = 2
  for (let i = 0; i < 12; i++) {
    const yy = 585 + i * 17
    ellipse(ctx, 943 + Math.sin(i * 2) * 13, yy, 5, 2.4, Math.sin(i) * .8)
    ctx.fillStyle = 'rgba(73,111,83,.5)'; ctx.fill()
  }
  // runas tenues
  glow(ctx, 1210, 354, 60, 'rgba(134,235,220,.14)', .7)
  ctx.restore()
}

function swordAndStone(ctx, t) {
  const x = 1180, baseY = 735
  // resplandor
  glow(ctx, x, 560, 145, 'rgba(255,228,135,.26)', .9)
  // haz de luz
  const beam = ctx.createLinearGradient(x, 300, x, 740)
  beam.addColorStop(0, 'rgba(255,239,177,0)')
  beam.addColorStop(.52, 'rgba(255,238,176,.08)')
  beam.addColorStop(1, 'rgba(255,236,162,.2)')
  ctx.fillStyle = beam
  ctx.beginPath(); ctx.moveTo(x - 6, 320); ctx.lineTo(x + 7, 320); ctx.lineTo(x + 35, 760); ctx.lineTo(x - 33, 760); ctx.closePath(); ctx.fill()
  // piedra
  const stone = ctx.createLinearGradient(x - 110, 700, x + 100, 810)
  stone.addColorStop(0, '#3d4754'); stone.addColorStop(.55, '#252d39'); stone.addColorStop(1, '#10151e')
  ctx.fillStyle = stone; ctx.strokeStyle = '#0a0e15'; ctx.lineWidth = 3
  ctx.beginPath()
  ctx.moveTo(x - 120, 790); ctx.lineTo(x - 92, 716); ctx.lineTo(x - 44, 691); ctx.lineTo(x + 15, 706); ctx.lineTo(x + 91, 696); ctx.lineTo(x + 130, 782); ctx.lineTo(x + 74, 807); ctx.lineTo(x - 54, 812); ctx.closePath(); ctx.fill(); ctx.stroke()
  // musgo
  ctx.fillStyle = 'rgba(63,99,75,.48)'
  ellipse(ctx, x - 72, 749, 28, 8, -.2); ctx.fill()
  ellipse(ctx, x + 55, 770, 19, 5, .1); ctx.fill()
  // brillo de runas
  ctx.strokeStyle = 'rgba(255,225,132,.5)'; ctx.lineWidth = 1.3
  ctx.beginPath(); ctx.arc(x, 746, 31, 0, TAU); ctx.stroke()
  for (let i = 0; i < 5; i++) {
    const a = i / 5 * TAU + t * .06
    ctx.beginPath(); ctx.moveTo(x + Math.cos(a) * 31, 746 + Math.sin(a) * 10); ctx.lineTo(x + Math.cos(a) * 41, 746 + Math.sin(a) * 14); ctx.stroke()
  }
  // espada
  ctx.save(); ctx.translate(x, 575)
  // hoja
  const blade = ctx.createLinearGradient(0, -245, 0, 100)
  blade.addColorStop(0, '#fffce2'); blade.addColorStop(.4, '#ffe89b'); blade.addColorStop(1, '#b98e39')
  ctx.fillStyle = blade; ctx.strokeStyle = '#d6b65f'; ctx.lineWidth = 1.5
  ctx.beginPath(); ctx.moveTo(-8, 150); ctx.lineTo(-8, -208); ctx.lineTo(0, -250); ctx.lineTo(8, -208); ctx.lineTo(8, 150); ctx.closePath(); ctx.fill(); ctx.stroke()
  // filo
  ctx.strokeStyle = 'rgba(255,255,240,.9)'; ctx.lineWidth = 1.3
  ctx.beginPath(); ctx.moveTo(-2, 138); ctx.lineTo(-2, -205); ctx.stroke()
  // guarda
  ctx.fillStyle = '#d7ad51'; ctx.strokeStyle = '#7e5f27'; ctx.lineWidth = 1.5
  ctx.beginPath(); ctx.moveTo(-52, 150); ctx.quadraticCurveTo(-41, 166, -16, 161); ctx.lineTo(16, 161); ctx.quadraticCurveTo(41, 166, 52, 150); ctx.lineTo(45, 140); ctx.lineTo(16, 148); ctx.lineTo(-16, 148); ctx.lineTo(-45, 140); ctx.closePath(); ctx.fill(); ctx.stroke()
  // empuñadura
  ctx.fillStyle = '#3a2c1d'; ctx.fillRect(-7, 162, 14, 53)
  ctx.strokeStyle = '#d8b25f'; ctx.lineWidth = 1
  for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.moveTo(-7, 169 + i * 9); ctx.lineTo(7, 173 + i * 9); ctx.stroke() }
  ctx.fillStyle = '#f0cf78'; ctx.beginPath(); ctx.arc(0, 221, 8, 0, TAU); ctx.fill()
  ctx.strokeStyle = '#7a5b27'; ctx.stroke()
  ctx.restore()
  // partículas alrededor
  ctx.globalCompositeOperation = 'lighter'
  for (let i = 0; i < 22; i++) {
    const a = t * .25 + i * 2.4
    const r = 30 + (i % 5) * 15
    const px = x + Math.cos(a) * r
    const py = 610 + Math.sin(a * 1.4) * (55 + (i % 3) * 22)
    ellipse(ctx, px, py, 1.2 + (i % 2), 1.2 + (i % 2))
    ctx.fillStyle = i % 3 ? 'rgba(255,230,145,.6)' : 'rgba(175,255,235,.45)'; ctx.fill()
  }
  ctx.globalCompositeOperation = 'source-over'
}

function heroSilhouette(ctx, t) {
  const x = 760, y = 760
  ctx.save()
  ctx.translate(x, y)
  ellipse(ctx, 14, 2, 43, 9); ctx.fillStyle = 'rgba(2,5,10,.55)'; ctx.fill()
  // capa
  ctx.fillStyle = '#101522'; ctx.strokeStyle = '#080c14'; ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(-16, -118)
  ctx.bezierCurveTo(-39 - Math.sin(t * .8) * 5, -73, -45, -23, -34, -2)
  ctx.lineTo(-10, -20); ctx.lineTo(0, -10); ctx.lineTo(13, -24); ctx.lineTo(37, -4)
  ctx.bezierCurveTo(48, -50, 35, -93, 15, -118)
  ctx.closePath(); ctx.fill(); ctx.stroke()
  // piernas
  ctx.strokeStyle = '#0d1220'; ctx.lineWidth = 13; ctx.lineCap = 'round'
  ctx.beginPath(); ctx.moveTo(-8, -45); ctx.lineTo(-14, -6); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(8, -45); ctx.lineTo(13, -6); ctx.stroke()
  // torso
  ctx.fillStyle = '#151d2d'; ctx.strokeStyle = '#070b13'; ctx.lineWidth = 2
  ctx.beginPath(); ctx.moveTo(-17, -120); ctx.quadraticCurveTo(-25, -95, -18, -49); ctx.lineTo(0, -42); ctx.lineTo(18, -49); ctx.quadraticCurveTo(25, -96, 17, -120); ctx.closePath(); ctx.fill(); ctx.stroke()
  // cabeza
  ctx.fillStyle = '#1b2331'
  ctx.beginPath(); ctx.arc(0, -135, 15, 0, TAU); ctx.fill(); ctx.stroke()
  // pelo
  ctx.fillStyle = '#0b111c'
  ctx.beginPath(); ctx.moveTo(-16, -134); ctx.quadraticCurveTo(-10, -155, 10, -153); ctx.quadraticCurveTo(19, -144, 14, -124); ctx.lineTo(7, -132); ctx.lineTo(-2, -122); ctx.lineTo(-7, -134); ctx.closePath(); ctx.fill()
  // espada al hombro
  ctx.save(); ctx.translate(21, -92); ctx.rotate(-.68)
  ctx.fillStyle = '#2d3744'; ctx.fillRect(-6, -6, 12, 80)
  ctx.fillStyle = '#6e7d8d'; ctx.fillRect(-2, -6, 3, 72)
  ctx.strokeStyle = '#d5b45e'; ctx.lineWidth = 2
  ctx.beginPath(); ctx.moveTo(-14, -6); ctx.lineTo(14, -6); ctx.stroke()
  ctx.restore()
  // borde de luz lunar
  ctx.globalCompositeOperation = 'lighter'
  ctx.strokeStyle = 'rgba(181,223,239,.45)'; ctx.lineWidth = 1.4
  ctx.beginPath(); ctx.moveTo(14, -146); ctx.quadraticCurveTo(27, -123, 22, -101); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(17, -119); ctx.lineTo(34, -79); ctx.stroke()
  ctx.restore()
}

function foreground(ctx, t) {
  // niebla baja
  const fog = ctx.createLinearGradient(0, 650, 0, 900)
  fog.addColorStop(0, 'rgba(87,131,142,0)')
  fog.addColorStop(.45, 'rgba(99,158,163,.09)')
  fog.addColorStop(1, 'rgba(38,60,72,.4)')
  ctx.fillStyle = fog; ctx.fillRect(0, 620, 1600, 280)
  // siluetas de hierba
  const r = mulberry32(552)
  for (let i = 0; i < 380; i++) {
    const x = r() * 1600
    const y = 790 + r() * 120
    const h = 9 + r() * 34
    ctx.strokeStyle = `rgba(${16 + r() * 20},${27 + r() * 24},${30 + r() * 20},${.4 + r() * .5})`
    ctx.lineWidth = .8 + r() * 1.2
    ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + Math.sin(t + i) * 5, y - h * .6, x + 3, y - h); ctx.stroke()
  }
  // pétalos flotantes
  ctx.globalCompositeOperation = 'lighter'
  for (let i = 0; i < 32; i++) {
    const a = t * .18 + i * 1.71
    const x = 300 + ((i * 137 + t * (8 + i % 4)) % 1300)
    const y = 280 + (i * 71) % 500 + Math.sin(a) * 16
    ellipse(ctx, x, y, 2.1, 1, a)
    ctx.fillStyle = i % 4 ? 'rgba(255,194,211,.5)' : 'rgba(255,242,184,.42)'; ctx.fill()
  }
  ctx.globalCompositeOperation = 'source-over'
}

export function drawTitleBackdrop(ctx, width, height, t = 0) {
  const scale = Math.max(width / 1600, height / 900)
  const ox = (width - 1600 * scale) / 2
  const oy = (height - 900 * scale) / 2
  ctx.save()
  ctx.translate(ox, oy)
  ctx.scale(scale, scale)
  // cielo
  const sky = ctx.createLinearGradient(0, 0, 0, 900)
  sky.addColorStop(0, '#060b19')
  sky.addColorStop(.34, '#101e33')
  sky.addColorStop(.58, '#274356')
  sky.addColorStop(.75, '#536a67')
  sky.addColorStop(.86, '#8b826b')
  sky.addColorStop(1, '#1b242b')
  ctx.fillStyle = sky; ctx.fillRect(0, 0, 1600, 900)
  starfield(ctx, t)
  moon(ctx, 1180, 228, 126, t)
  cloudBand(ctx, 255, 340, .5, t, 77)
  cloudBand(ctx, 390, 500, .28, t, 81)
  // montañas
  mountainLayer(ctx, 550, '#233342', 3, 200, .8)
  mountainLayer(ctx, 605, '#1a2834', 9, 160, .9)
  mountainLayer(ctx, 655, '#121c27', 17, 120, 1)
  // bosque lejano
  const fr = mulberry32(44)
  ctx.fillStyle = '#0c151d'
  ctx.beginPath(); ctx.moveTo(0, 720)
  for (let x = 0; x <= 1600; x += 12) {
    const h = 22 + fr() * 55
    ctx.lineTo(x, 680 - h)
  }
  ctx.lineTo(1600, 900); ctx.lineTo(0, 900); ctx.closePath(); ctx.fill()
  // suelo
  const ground = ctx.createLinearGradient(0, 690, 0, 900)
  ground.addColorStop(0, '#1b292c'); ground.addColorStop(.5, '#10191d'); ground.addColorStop(1, '#070b0e')
  ctx.fillStyle = ground; ctx.fillRect(0, 700, 1600, 200)
  // luz cálida de horizonte
  const horizon = ctx.createRadialGradient(1210, 680, 20, 1210, 680, 520)
  horizon.addColorStop(0, 'rgba(246,177,105,.12)'); horizon.addColorStop(1, 'rgba(246,177,105,0)')
  ctx.fillStyle = horizon; ctx.fillRect(0, 400, 1600, 500)
  arch(ctx, t)
  swordAndStone(ctx, t)
  heroSilhouette(ctx, t)
  // niebla/rayos
  ctx.save()
  ctx.globalCompositeOperation = 'lighter'
  for (let i = 0; i < 3; i++) {
    const grad = ctx.createLinearGradient(850 + i * 120, 0, 700 + i * 80, 740)
    grad.addColorStop(0, 'rgba(183,222,228,0)'); grad.addColorStop(.5, `rgba(183,222,228,${.014 + i * .006})`); grad.addColorStop(1, 'rgba(183,222,228,0)')
    ctx.fillStyle = grad
    ctx.beginPath(); ctx.moveTo(880 + i * 100, 0); ctx.lineTo(1010 + i * 100, 0); ctx.lineTo(760 + i * 70, 760); ctx.lineTo(660 + i * 70, 760); ctx.closePath(); ctx.fill()
  }
  ctx.restore()
  foreground(ctx, t)
  // viñeta
  const v = ctx.createRadialGradient(820, 430, 220, 820, 430, 900)
  v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(.7, 'rgba(2,7,13,.25)'); v.addColorStop(1, 'rgba(2,6,11,.8)')
  ctx.fillStyle = v; ctx.fillRect(0, 0, 1600, 900)
  // fundido lateral para el menú
  const side = ctx.createLinearGradient(0, 0, 780, 0)
  side.addColorStop(0, 'rgba(4,9,17,.86)'); side.addColorStop(.46, 'rgba(4,9,17,.54)'); side.addColorStop(1, 'rgba(4,9,17,0)')
  ctx.fillStyle = side; ctx.fillRect(0, 0, 780, 900)
  // grano sutil
  ctx.globalAlpha = .055
  ctx.fillStyle = '#d8e6ef'
  for (let i = 0; i < 800; i++) {
    const x = (i * 71 + Math.floor(t * 2) * 37) % 1600
    const y = (i * 131) % 900
    ctx.fillRect(x, y, .7, .7)
  }
  ctx.globalAlpha = 1
  ctx.restore()
}
