import { HAIR_COLORS, OUTFITS, WEAPONS } from '../content.js'
import { TAU, rr, ellipse, glow, limbed, polygon } from './common.js'

const SKIN = '#efc7a5'
const SKIN_SHADE = '#b87963'
const OUTLINE = '#11192b'

function drawHairBack(ctx, style, hair, t) {
  ctx.fillStyle = hair.shade
  if (style === 0) {
    ctx.beginPath()
    ctx.moveTo(-12, -72)
    ctx.bezierCurveTo(-22, -60, -24 - Math.sin(t * 1.6) * 3, -34, -14, -25)
    ctx.bezierCurveTo(-6, -19, 0, -22, 2, -29)
    ctx.bezierCurveTo(8, -18, 19, -24, 20 + Math.sin(t * 1.4) * 4, -39)
    ctx.bezierCurveTo(21, -57, 15, -69, 8, -73)
    ctx.closePath()
    ctx.fill()
  } else if (style === 1) {
    // Coleta alta
    ctx.beginPath()
    ctx.moveTo(5, -73)
    ctx.bezierCurveTo(22, -76, 29 + Math.sin(t * 2) * 5, -58, 22, -38)
    ctx.bezierCurveTo(17, -26, 10, -21, 7, -28)
    ctx.bezierCurveTo(15, -42, 13, -57, 1, -65)
    ctx.closePath()
    ctx.fill()
  } else if (style === 3) {
    // Trenza
    ctx.strokeStyle = hair.shade
    ctx.lineWidth = 7
    ctx.lineCap = 'round'
    ctx.beginPath()
    ctx.moveTo(11, -71)
    ctx.bezierCurveTo(23, -57, 22, -43, 21, -28)
    ctx.stroke()
    for (let i = 0; i < 5; i++) {
      ellipse(ctx, 21 + Math.sin(i * 2.1) * 2, -30 - i * 5, 4.5, 3.2, 0.5)
      ctx.fillStyle = i % 2 ? hair.color : hair.shade
      ctx.fill()
    }
  }
}

function drawHairFront(ctx, style, hair) {
  ctx.fillStyle = hair.color
  ctx.beginPath()
  ctx.moveTo(-11, -68)
  ctx.bezierCurveTo(-12, -78, -2, -82, 7, -78)
  ctx.bezierCurveTo(15, -77, 18, -70, 15, -63)
  ctx.bezierCurveTo(11, -70, 7, -71, 4, -69)
  ctx.bezierCurveTo(1, -74, -5, -74, -7, -68)
  ctx.closePath()
  ctx.fill()
  // mechones frontales
  ctx.strokeStyle = hair.color
  ctx.lineWidth = 4
  ctx.lineCap = 'round'
  if (style === 2) {
    for (let i = -1; i <= 1; i++) {
      ctx.beginPath()
      ctx.moveTo(i * 6, -75)
      ctx.lineTo(i * 8 + 2, -65)
      ctx.stroke()
    }
  } else {
    ctx.beginPath(); ctx.moveTo(-7, -72); ctx.quadraticCurveTo(-10, -64, -13, -62); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(7, -74); ctx.quadraticCurveTo(12, -68, 14, -61); ctx.stroke()
  }
  ctx.strokeStyle = hair.shade
  ctx.lineWidth = 1.2
  ctx.beginPath(); ctx.moveTo(-7, -75); ctx.quadraticCurveTo(0, -78, 8, -74); ctx.stroke()
}

function drawWeapon(ctx, weapon, attack, time, glowColor) {
  const id = weapon?.id || 'sword_alba'
  const type = weapon?.type || 'Espada'
  const arc = attack > 0 ? attack : 0
  const angle = arc > 0 ? -2.65 + Math.sin(Math.min(1, arc) * Math.PI) * 2.8 : -0.72
  const handX = 13
  const handY = -34
  ctx.save()
  ctx.translate(handX, handY)
  ctx.rotate(angle)
  if (type === 'Escudo') {
    // Bash con el borde del escudo: un aro de luz y una pequeña maza ritual.
    ctx.rotate(-0.35)
    ellipse(ctx, 16, 0, 20, 24)
    const sg = ctx.createLinearGradient(2, -20, 32, 20)
    sg.addColorStop(0, '#d9f4ff'); sg.addColorStop(.45, '#7fa6c4'); sg.addColorStop(1, '#36516d')
    ctx.fillStyle = sg; ctx.fill()
    ctx.strokeStyle = '#16243a'; ctx.lineWidth = 2.2; ctx.stroke()
    ctx.strokeStyle = '#ecd28d'; ctx.lineWidth = 1.6
    ctx.beginPath(); ctx.ellipse(16, 0, 13, 16, 0, 0, TAU); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(16, -15); ctx.lineTo(16, 15); ctx.moveTo(3, 0); ctx.lineTo(29, 0); ctx.stroke()
    ctx.fillStyle = '#bdf4ff'
    ellipse(ctx, 16, 0, 3.4, 3.4); ctx.fill()
    glow(ctx, 16, 0, 20, glowColor, attack ? 0.55 : 0.2)
  } else if (id === 'arco_susurro') {
    ctx.strokeStyle = '#5b3e2a'
    ctx.lineWidth = 3
    ctx.beginPath(); ctx.arc(13, 0, 17, -1.3, 1.3); ctx.stroke()
    ctx.strokeStyle = '#d8edff'
    ctx.lineWidth = 1
    ctx.beginPath(); ctx.moveTo(17, -16); ctx.lineTo(17 + (arc ? -6 : 2), 0); ctx.lineTo(17, 16); ctx.stroke()
    ctx.strokeStyle = glowColor
    ctx.lineWidth = 1.5
    ctx.beginPath(); ctx.moveTo(19, 0); ctx.lineTo(46, 0); ctx.stroke()
    glow(ctx, 27, 0, 13, glowColor, 0.35)
  } else if (id === 'baston_aurora') {
    ctx.strokeStyle = '#59436e'
    ctx.lineWidth = 4
    ctx.beginPath(); ctx.moveTo(-5, -5); ctx.lineTo(27, 0); ctx.stroke()
    ctx.strokeStyle = '#b97aff'
    ctx.lineWidth = 2
    ctx.beginPath(); ctx.moveTo(22, 0); ctx.lineTo(34, 0); ctx.stroke()
    glow(ctx, 35, 0, 17, '#c18cff', 0.55 + Math.sin(time * 3) * 0.1)
    ellipse(ctx, 35, 0, 5, 5)
    ctx.fillStyle = '#f3ddff'; ctx.fill()
    ctx.strokeStyle = '#7e45c9'; ctx.lineWidth = 1; ctx.stroke()
  } else {
    const lengths = { Daga: 22, Mandoble: 54, Lanza: 68, 'Espada legendaria': 45, Espada: 38 }
    const length = lengths[type] || 38
    const wide = type === 'Mandoble' ? 7 : type === 'Daga' ? 4 : 5
    const blade = weapon?.color || '#d9ecff'
    // mango
    ctx.strokeStyle = '#3a251b'; ctx.lineWidth = 5; ctx.lineCap = 'round'
    ctx.beginPath(); ctx.moveTo(-9, 0); ctx.lineTo(0, 0); ctx.stroke()
    // guarda
    ctx.strokeStyle = '#d7b35e'; ctx.lineWidth = type === 'Mandoble' ? 4 : 3
    ctx.beginPath(); ctx.moveTo(0, -wide - 3); ctx.lineTo(0, wide + 3); ctx.stroke()
    // hoja
    const grad = ctx.createLinearGradient(0, -wide, length, 0)
    grad.addColorStop(0, '#f7fbff')
    grad.addColorStop(0.4, blade)
    grad.addColorStop(1, '#7d9dbc')
    ctx.fillStyle = grad
    ctx.beginPath()
    ctx.moveTo(0, -wide)
    ctx.lineTo(length - 9, -wide * 0.62)
    ctx.lineTo(length, 0)
    ctx.lineTo(length - 9, wide * 0.62)
    ctx.lineTo(0, wide)
    ctx.closePath()
    ctx.fill()
    ctx.strokeStyle = OUTLINE; ctx.lineWidth = 1.2; ctx.stroke()
    ctx.strokeStyle = 'rgba(255,255,255,.8)'; ctx.lineWidth = 1
    ctx.beginPath(); ctx.moveTo(5, -wide * 0.4); ctx.lineTo(length - 10, -1); ctx.stroke()
    if (weapon?.glow) glow(ctx, length * 0.72, 0, type === 'Mandoble' ? 22 : 13, weapon.glow, attack ? 0.5 : 0.2)
  }
  ctx.restore()
}

export function drawHero(ctx, opt) {
  const {
    x, y, appearance, weapon = WEAPONS[appearance?.weapon || 'sword_alba'],
    time = 0, walk = 0, moving = false, facing = { x: 0, y: 1 },
    state = {}, scale = 1, alpha = 1, shield = true, level = 1, ghost = false,
  } = opt
  const hair = HAIR_COLORS[appearance?.hairColor || 0]
  const outfit = OUTFITS[appearance?.outfit || 0]
  const attack = state.attack || 0
  const cast = state.cast || 0
  const hurt = state.hurt || 0
  const roll = state.roll || 0
  const block = state.block || 0
  const flip = facing.x < -0.12 ? -1 : 1
  const dir = facing.y < -0.55 ? 'up' : facing.y > 0.45 ? 'down' : 'side'
  const stride = Math.sin(walk * Math.PI * 2) * (moving ? 5.5 : 0)
  const bob = (moving ? Math.sin(walk * Math.PI * 4) * 1.4 : Math.sin(time * 2.1) * 0.55)
  let armAngle = -0.72
  if (attack > 0) armAngle = -2.65 + Math.sin(Math.min(1, attack) * Math.PI) * 2.8
  if (cast > 0) armAngle = -1.8 - cast * 0.6

  ctx.save()
  ctx.globalAlpha = alpha
  // Sombra
  ctx.save()
  ctx.translate(x, y + 2)
  ctx.scale(flip, 1)
  ellipse(ctx, 0, 0, 22, 7)
  ctx.fillStyle = `rgba(4,9,18,${ghost ? 0.08 : 0.34})`
  ctx.fill()
  ctx.restore()

  ctx.translate(x, y + bob)
  ctx.scale(flip * scale, scale)
  if (roll > 0) {
    const p = Math.sin(Math.min(1, roll) * Math.PI)
    ctx.translate(0, -14 - p * 7)
    ctx.rotate(p * Math.PI * 1.75)
    ctx.translate(0, 14)
  }

  // Aura leve de personaje
  if (!ghost) glow(ctx, 0, -32, 54, 'rgba(116,215,255,.13)', 0.8)

  drawHairBack(ctx, appearance?.hair || 0, hair, time)

  // Piernas y botas
  const legSwing = roll > 0 ? 0 : stride
  limbed(ctx, -6, -23, -7 - legSwing * 0.35, -2, 7, '#3b465d', OUTLINE)
  limbed(ctx, 6, -23, 7 + legSwing * 0.35, -2, 7, '#3b465d', OUTLINE)
  rr(ctx, -11 - legSwing * 0.35, -4, 9, 6, 2); ctx.fillStyle = '#1c2639'; ctx.fill()
  rr(ctx, 2 + legSwing * 0.35, -4, 9, 6, 2); ctx.fill()
  ctx.strokeStyle = outfit.trim; ctx.lineWidth = 1.4
  ctx.beginPath(); ctx.moveTo(-10, -2); ctx.lineTo(-3, -2); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(3, -2); ctx.lineTo(10, -2); ctx.stroke()

  // Capa
  const capeWave = Math.sin(time * 2.3) * 2.2
  ctx.fillStyle = outfit.dark
  ctx.strokeStyle = OUTLINE; ctx.lineWidth = 1.8
  ctx.beginPath()
  ctx.moveTo(-12, -49)
  ctx.quadraticCurveTo(-22 - capeWave, -29, -16, -9)
  ctx.quadraticCurveTo(-8, -4, -3, -12)
  ctx.lineTo(2, -53)
  ctx.closePath(); ctx.fill(); ctx.stroke()
  ctx.strokeStyle = outfit.trim; ctx.lineWidth = 1.2
  ctx.beginPath(); ctx.moveTo(-14, -15); ctx.quadraticCurveTo(-10, -8, -6, -13); ctx.stroke()

  // Túnica
  const clothGrad = ctx.createLinearGradient(-12, -52, 13, -17)
  clothGrad.addColorStop(0, outfit.cloth)
  clothGrad.addColorStop(1, outfit.dark)
  ctx.fillStyle = clothGrad
  ctx.strokeStyle = OUTLINE; ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(-10, -51)
  ctx.quadraticCurveTo(-16, -43, -13, -23)
  ctx.quadraticCurveTo(-7, -17, 0, -18)
  ctx.quadraticCurveTo(8, -17, 13, -23)
  ctx.quadraticCurveTo(16, -43, 10, -51)
  ctx.closePath(); ctx.fill(); ctx.stroke()
  // faldón
  ctx.fillStyle = outfit.dark
  ctx.beginPath()
  ctx.moveTo(-11, -25); ctx.lineTo(-15, -12); ctx.lineTo(-3, -15); ctx.lineTo(0, -11); ctx.lineTo(3, -15); ctx.lineTo(15, -12); ctx.lineTo(11, -25)
  ctx.closePath(); ctx.fill(); ctx.stroke()
  // cinturón
  rr(ctx, -13, -28, 26, 5, 1.5); ctx.fillStyle = '#51351f'; ctx.fill()
  rr(ctx, -3, -29, 6, 7, 1); ctx.fillStyle = outfit.trim; ctx.fill()
  ctx.strokeStyle = '#fff1bd'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(0, -25.5, 1.8, 0, TAU); ctx.stroke()
  // bordes dorados
  ctx.strokeStyle = outfit.trim; ctx.lineWidth = 1.3
  ctx.beginPath(); ctx.moveTo(0, -49); ctx.lineTo(0, -30); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(-10, -47); ctx.quadraticCurveTo(0, -41, 10, -47); ctx.stroke()

  // Hombreras
  for (const side of [-1, 1]) {
    ctx.save()
    ctx.translate(side * 13, -48 + bob * 0.1)
    ctx.rotate(side * 0.2)
    rr(ctx, -6, -4, 12, 9, 4)
    ctx.fillStyle = outfit.trim; ctx.fill(); ctx.strokeStyle = OUTLINE; ctx.lineWidth = 1.5; ctx.stroke()
    ctx.fillStyle = 'rgba(255,255,255,.24)'
    rr(ctx, -3, -2, 6, 2, 1); ctx.fill()
    ctx.restore()
  }

  // Brazo izquierdo / escudo
  const leftHandX = -15 - (block ? 4 : 0)
  const leftHandY = block ? -37 : -32 + stride * 0.2
  limbed(ctx, -12, -45, leftHandX, leftHandY, 6, outfit.cloth, OUTLINE)
  ellipse(ctx, leftHandX, leftHandY, 3.6, 3.6); ctx.fillStyle = SKIN; ctx.fill()
  if (shield) {
    ctx.save()
    ctx.translate(leftHandX - 4, leftHandY - 1)
    ctx.rotate(-0.15)
    ellipse(ctx, 0, 0, 10, 12)
    const sg = ctx.createLinearGradient(-9, -10, 8, 10)
    sg.addColorStop(0, '#6f829d'); sg.addColorStop(0.5, '#c7d6e6'); sg.addColorStop(1, '#475a74')
    ctx.fillStyle = sg; ctx.fill()
    ctx.strokeStyle = '#1a2438'; ctx.lineWidth = 2; ctx.stroke()
    ctx.strokeStyle = '#e0bf6d'; ctx.lineWidth = 1.2
    ctx.beginPath(); ctx.moveTo(0, -8); ctx.lineTo(0, 8); ctx.moveTo(-6, 0); ctx.lineTo(6, 0); ctx.stroke()
    ctx.restore()
  }

  // Brazo derecho y arma
  const ax = Math.cos(armAngle) * 15
  const ay = Math.sin(armAngle) * 15 - 35
  limbed(ctx, 12, -45, ax, ay, 6, outfit.cloth, OUTLINE)
  ellipse(ctx, ax, ay, 3.8, 3.8); ctx.fillStyle = SKIN; ctx.fill()
  drawWeapon(ctx, weapon, attack, time, weapon?.glow || '#8ed9ff')

  // Cuello y cabeza
  rr(ctx, -4, -58, 8, 8, 3); ctx.fillStyle = SKIN_SHADE; ctx.fill()
  const headY = -67
  const headGrad = ctx.createRadialGradient(-3, headY - 4, 1, 0, headY, 14)
  headGrad.addColorStop(0, '#ffe0c3')
  headGrad.addColorStop(0.7, SKIN)
  headGrad.addColorStop(1, SKIN_SHADE)
  ellipse(ctx, 0, headY, 10.5, 11.5)
  ctx.fillStyle = headGrad; ctx.fill()
  ctx.strokeStyle = OUTLINE; ctx.lineWidth = 1.8; ctx.stroke()
  // oreja
  ellipse(ctx, 9, headY + 1, 2.2, 3.4, 0.2); ctx.fillStyle = SKIN_SHADE; ctx.fill()

  // Rostro
  if (dir !== 'up') {
    const eyeY = headY + 1
    const eyeShift = dir === 'side' ? 2.8 : 0
    ctx.fillStyle = '#26324c'
    ellipse(ctx, -3.4 + eyeShift, eyeY, 1.2, 1.7); ctx.fill()
    ellipse(ctx, 3.4 + eyeShift, eyeY, 1.2, 1.7); ctx.fill()
    ctx.fillStyle = '#ffffff'
    ellipse(ctx, -3.1 + eyeShift, eyeY - 0.5, 0.4, 0.55); ctx.fill()
    ellipse(ctx, 3.7 + eyeShift, eyeY - 0.5, 0.4, 0.55); ctx.fill()
    ctx.strokeStyle = SKIN_SHADE; ctx.lineWidth = 0.8
    ctx.beginPath(); ctx.moveTo(0.5 + eyeShift, eyeY + 2); ctx.lineTo(1.8 + eyeShift, eyeY + 2.3); ctx.stroke()
    // marca de Luma
    ctx.fillStyle = 'rgba(146,242,224,.9)'
    ctx.beginPath(); ctx.moveTo(0, headY - 5.5); ctx.lineTo(1.4, headY - 2.8); ctx.lineTo(0, headY - 0.5); ctx.lineTo(-1.4, headY - 2.8); ctx.closePath(); ctx.fill()
  } else {
    ctx.strokeStyle = hair.shade; ctx.lineWidth = 1
    ctx.beginPath(); ctx.moveTo(-5, headY); ctx.quadraticCurveTo(0, headY + 2, 5, headY); ctx.stroke()
  }
  drawHairFront(ctx, appearance?.hair || 0, hair)

  // Detalles de nivel y túnica
  if (level >= 8) {
    ctx.strokeStyle = 'rgba(255,225,139,.55)'; ctx.lineWidth = 1
    ctx.beginPath(); ctx.moveTo(-7, -42); ctx.lineTo(0, -37); ctx.lineTo(7, -42); ctx.stroke()
  }

  if (hurt > 0) {
    ctx.globalCompositeOperation = 'lighter'
    ctx.globalAlpha = hurt * 0.6
    ellipse(ctx, 0, -37, 19, 34); ctx.fillStyle = '#ff657d'; ctx.fill()
  }
  ctx.restore()
}

export function drawHeroPortrait(canvas, appearance, weapon, level = 1) {
  const dpr = Math.min(2, window.devicePixelRatio || 1)
  const w = canvas.clientWidth || 140
  const h = canvas.clientHeight || 140
  if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
    canvas.width = Math.round(w * dpr)
    canvas.height = Math.round(h * dpr)
  }
  const ctx = canvas.getContext('2d')
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  ctx.clearRect(0, 0, w, h)
  // Fondo de retrato
  const bg = ctx.createRadialGradient(w * 0.5, h * 0.42, 4, w * 0.5, h * 0.5, w * 0.7)
  bg.addColorStop(0, '#31496c'); bg.addColorStop(1, '#111a2e')
  ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h)
  ctx.strokeStyle = 'rgba(232,200,122,.15)'; ctx.lineWidth = 1
  for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(w * .5, h * .48, w * (.22 + i * .1), 0, TAU); ctx.stroke() }
  const s = Math.min(w, h) / 110
  ctx.save()
  ctx.translate(w * 0.5, h * 0.93)
  drawHero(ctx, {
    x: 0, y: 0, appearance, weapon, time: 1, walk: 0, moving: false,
    facing: { x: 0, y: 1 }, state: {}, scale: s * 1.35, shield: true, level,
  })
  ctx.restore()
  // Viñeta
  const v = ctx.createRadialGradient(w / 2, h / 2, w * .2, w / 2, h / 2, w * .7)
  v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(2,7,17,.6)')
  ctx.fillStyle = v; ctx.fillRect(0, 0, w, h)
}
