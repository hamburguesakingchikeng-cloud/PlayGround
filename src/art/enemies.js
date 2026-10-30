import { TAU, rr, ellipse, glow, limbed, polygon, clamp } from './common.js'

const OUTLINE = '#101524'

function shadow(ctx, x, y, rx, ry, alpha = 0.34) {
  ellipse(ctx, x, y, rx, ry)
  ctx.fillStyle = `rgba(3,8,16,${alpha})`
  ctx.fill()
}

function slime(ctx, e, t) {
  const wob = e.state?.attack > 0 ? Math.sin(e.state.attack * Math.PI) : Math.sin(t * 2.3 + (e.seed || 0)) * 0.06
  const sx = 1 + wob * 0.18
  const sy = 1 - wob * 0.13
  ctx.save()
  ctx.translate(e.x, e.y)
  shadow(ctx, 0, 0, 25, 8, 0.32)
  ctx.scale(sx, sy)
  const y = -24
  const body = ctx.createRadialGradient(-7, y - 11, 3, 2, y, 34)
  body.addColorStop(0, '#d9ffe7')
  body.addColorStop(0.22, e.type.color)
  body.addColorStop(0.8, e.type.dark)
  body.addColorStop(1, 'rgba(35,110,83,.95)')
  ctx.fillStyle = body
  ctx.strokeStyle = '#194b3d'; ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(-28, -2)
  ctx.bezierCurveTo(-33, -25, -19, -45, 0, -45)
  ctx.bezierCurveTo(21, -45, 33, -25, 28, -2)
  ctx.bezierCurveTo(17, 5, -16, 5, -28, -2)
  ctx.closePath(); ctx.fill(); ctx.stroke()
  // brillo
  ellipse(ctx, -10, -32, 8, 5, -0.5)
  ctx.fillStyle = 'rgba(255,255,255,.5)'; ctx.fill()
  ellipse(ctx, 10, -18, 4, 3, 0.3)
  ctx.fillStyle = 'rgba(255,255,255,.24)'; ctx.fill()
  // núcleo y burbujas
  glow(ctx, 0, -20, 19, 'rgba(179,255,210,.55)', 0.55)
  ellipse(ctx, 0, -20, 7, 8)
  ctx.fillStyle = 'rgba(214,255,224,.9)'; ctx.fill()
  ctx.fillStyle = 'rgba(255,255,255,.25)'
  for (let i = 0; i < 5; i++) {
    const bx = Math.sin(i * 7.4 + t * 0.5) * 17
    const by = -12 - ((t * 8 + i * 9) % 27)
    ellipse(ctx, bx, by, 1.4, 1.4); ctx.fill()
  }
  // ojos
  ctx.fillStyle = '#17372d'
  ellipse(ctx, -7, -21, 2.4, 3.1); ctx.fill()
  ellipse(ctx, 7, -21, 2.4, 3.1); ctx.fill()
  ctx.fillStyle = '#f1fff6'
  ellipse(ctx, -7.7, -22.2, 0.8, 0.9); ctx.fill()
  ellipse(ctx, 6.3, -22.2, 0.8, 0.9); ctx.fill()
  ctx.strokeStyle = '#22604b'; ctx.lineWidth = 1
  ctx.beginPath(); ctx.arc(0, -16, 3.5, 0.2, Math.PI - 0.2); ctx.stroke()
  // flor
  ctx.fillStyle = '#f9e8ae'
  for (let i = 0; i < 5; i++) {
    const a = i / 5 * TAU
    ellipse(ctx, 13 + Math.cos(a) * 3.5, -40 + Math.sin(a) * 3.5, 2.4, 1.5, a); ctx.fill()
  }
  ctx.fillStyle = '#e0a85a'; ctx.beginPath(); ctx.arc(13, -40, 2, 0, TAU); ctx.fill()
  if (e.state?.hurt > 0) {
    ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = e.state.hurt * 0.7
    ellipse(ctx, 0, -24, 29, 24); ctx.fillStyle = '#ff8397'; ctx.fill()
  }
  ctx.restore()
}

function wolf(ctx, e, t) {
  const flip = (e.facing?.x || 0) < -0.1 ? -1 : 1
  const moving = e.moving || (e.state?.attack || 0) > 0
  const stride = Math.sin((e.walk || 0) * Math.PI * 4) * (moving ? 6 : 0)
  const lunge = e.state?.attack > 0 ? Math.sin(e.state.attack * Math.PI) * 10 : 0
  ctx.save()
  ctx.translate(e.x, e.y)
  shadow(ctx, 0, 0, 31, 9, 0.4)
  ctx.scale(flip, 1)
  ctx.translate(lunge, 0)
  const fur = ctx.createLinearGradient(0, -33, 0, -3)
  fur.addColorStop(0, '#c7d1df'); fur.addColorStop(0.55, e.type.color); fur.addColorStop(1, e.type.dark)
  // cola
  ctx.strokeStyle = e.type.dark; ctx.lineWidth = 8; ctx.lineCap = 'round'
  ctx.beginPath(); ctx.moveTo(-20, -20); ctx.quadraticCurveTo(-40, -28 + Math.sin(t * 4) * 5, -44, -12); ctx.stroke()
  ctx.strokeStyle = '#8794a8'; ctx.lineWidth = 3
  ctx.beginPath(); ctx.moveTo(-21, -22); ctx.quadraticCurveTo(-37, -28, -43, -13); ctx.stroke()
  // patas
  limbed(ctx, -14, -15, -16 + stride, -2, 5, '#5e687a', OUTLINE)
  limbed(ctx, -8, -15, -7 - stride, -2, 5, '#7d899b', OUTLINE)
  limbed(ctx, 12, -15, 13 - stride, -2, 5, '#5e687a', OUTLINE)
  limbed(ctx, 18, -15, 19 + stride, -2, 5, '#7d899b', OUTLINE)
  // cuerpo
  ellipse(ctx, 1, -23, 25, 14)
  ctx.fillStyle = fur; ctx.fill(); ctx.strokeStyle = OUTLINE; ctx.lineWidth = 2; ctx.stroke()
  // lomo
  ctx.fillStyle = 'rgba(255,255,255,.18)'
  ellipse(ctx, -2, -29, 17, 5); ctx.fill()
  // cuello y cabeza
  ctx.save(); ctx.translate(22, -31); ctx.rotate(-0.15)
  ellipse(ctx, 0, 0, 15, 11)
  ctx.fillStyle = e.type.color; ctx.fill(); ctx.strokeStyle = OUTLINE; ctx.lineWidth = 2; ctx.stroke()
  // hocico
  ctx.beginPath(); ctx.moveTo(7, -5); ctx.quadraticCurveTo(23, -5, 22, 2); ctx.quadraticCurveTo(18, 7, 7, 6); ctx.closePath()
  ctx.fillStyle = '#d6dce6'; ctx.fill(); ctx.strokeStyle = OUTLINE; ctx.lineWidth = 1.5; ctx.stroke()
  ellipse(ctx, 21, 1, 3, 2.2); ctx.fillStyle = '#1a1d26'; ctx.fill()
  // orejas
  polygon(ctx, [[-7, -9], [-10, -26], [2, -13]], e.type.dark, OUTLINE, 1.4)
  polygon(ctx, [[2, -10], [6, -25], [12, -8]], e.type.dark, OUTLINE, 1.4)
  polygon(ctx, [[-6, -12], [-7, -21], [-1, -13]], '#e7b2b2', null)
  // ojos
  glow(ctx, 0, -2, 10, 'rgba(255,94,90,.4)', .45)
  ctx.fillStyle = '#ff625e'
  ellipse(ctx, -2, -2, 2.4, 1.7); ctx.fill()
  ellipse(ctx, 7, -2, 2.1, 1.5); ctx.fill()
  ctx.fillStyle = '#ffe5a8'
  ellipse(ctx, -2, -2, .8, .8); ctx.fill()
  ellipse(ctx, 7, -2, .7, .7); ctx.fill()
  // marcas de ceniza
  ctx.strokeStyle = 'rgba(255,164,92,.5)'; ctx.lineWidth = 1.3
  ctx.beginPath(); ctx.moveTo(-3, -8); ctx.lineTo(3, -4); ctx.moveTo(6, -9); ctx.lineTo(10, -5); ctx.stroke()
  ctx.restore()
  // patas traseras
  if (e.state?.hurt > 0) {
    ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = e.state.hurt * .6
    ellipse(ctx, 3, -22, 33, 24); ctx.fillStyle = '#ff7e8f'; ctx.fill()
  }
  ctx.restore()
}

function beetle(ctx, e, t) {
  const flip = (e.facing?.x || 0) < -0.1 ? -1 : 1
  const stride = Math.sin((e.walk || 0) * Math.PI * 4) * ((e.moving || e.state?.attack) ? 3 : 0)
  ctx.save()
  ctx.translate(e.x, e.y)
  shadow(ctx, 0, 0, 34, 10, .42)
  ctx.scale(flip, 1)
  // patas
  for (let i = 0; i < 3; i++) {
    limbed(ctx, -12 + i * 11, -15, -20 + i * 13 + stride * (i % 2 ? 1 : -1), -1, 4, '#5a5140', OUTLINE)
    limbed(ctx, -10 + i * 11, -14, -3 + i * 12 - stride * (i % 2 ? 1 : -1), -1, 3.5, '#82765d', OUTLINE)
  }
  // cuerpo
  const shell = ctx.createRadialGradient(-9, -32, 4, 2, -20, 32)
  shell.addColorStop(0, '#e5d9ba'); shell.addColorStop(.45, e.type.color); shell.addColorStop(1, e.type.dark)
  ellipse(ctx, 0, -20, 27, 19)
  ctx.fillStyle = shell; ctx.fill(); ctx.strokeStyle = OUTLINE; ctx.lineWidth = 2.3; ctx.stroke()
  // alas / placas
  ctx.strokeStyle = '#6a5d42'; ctx.lineWidth = 1.8
  ctx.beginPath(); ctx.moveTo(0, -37); ctx.quadraticCurveTo(-2, -20, 0, -6); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(-16, -33); ctx.quadraticCurveTo(-9, -20, -5, -7); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(16, -33); ctx.quadraticCurveTo(9, -20, 5, -7); ctx.stroke()
  // runas
  glow(ctx, 0, -23, 15, 'rgba(111,235,206,.32)', .38)
  ctx.strokeStyle = '#a8ffe1'; ctx.lineWidth = 1.4
  ctx.beginPath(); ctx.moveTo(-4, -29); ctx.lineTo(3, -24); ctx.lineTo(-2, -17); ctx.stroke()
  ctx.beginPath(); ctx.arc(1, -24, 6, 0.4, 3.3); ctx.stroke()
  // cabeza
  ellipse(ctx, 24, -17, 11, 9)
  ctx.fillStyle = '#8e8064'; ctx.fill(); ctx.strokeStyle = OUTLINE; ctx.lineWidth = 1.8; ctx.stroke()
  // cuerno
  ctx.strokeStyle = '#d8ca9e'; ctx.lineWidth = 5; ctx.lineCap = 'round'
  ctx.beginPath(); ctx.moveTo(27, -22); ctx.quadraticCurveTo(35, -34, 48, -32); ctx.stroke()
  ctx.strokeStyle = OUTLINE; ctx.lineWidth = 1; ctx.stroke()
  // ojos
  glow(ctx, 29, -19, 8, 'rgba(255,145,80,.4)', .4)
  ellipse(ctx, 27, -19, 2.3, 1.6); ctx.fillStyle = '#ff9b57'; ctx.fill()
  ellipse(ctx, 33, -18, 1.9, 1.4); ctx.fill()
  // grietas
  ctx.strokeStyle = '#3d3528'; ctx.lineWidth = .8
  ctx.beginPath(); ctx.moveTo(-18, -34); ctx.lineTo(-12, -27); ctx.lineTo(-16, -21); ctx.moveTo(14, -34); ctx.lineTo(9, -28); ctx.stroke()
  if (e.state?.hurt > 0) {
    ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = e.state.hurt * .55
    ellipse(ctx, 4, -21, 31, 25); ctx.fillStyle = '#ffd795'; ctx.fill()
  }
  ctx.restore()
}

function wraith(ctx, e, t) {
  const float = Math.sin(t * 2.2 + (e.seed || 0)) * 5
  const flip = (e.facing?.x || 0) < -0.1 ? -1 : 1
  ctx.save()
  ctx.translate(e.x, e.y + float)
  shadow(ctx, 0, -float, 22, 7, .25)
  ctx.scale(flip, 1)
  // estela
  ctx.fillStyle = 'rgba(111,81,189,.14)'
  for (let i = 0; i < 4; i++) {
    ellipse(ctx, Math.sin(t * 1.8 + i) * 9, -16 + i * 5, 20 - i * 3, 8, 0)
    ctx.fill()
  }
  // ropaje
  const grad = ctx.createLinearGradient(0, -63, 0, -5)
  grad.addColorStop(0, '#7e65c7'); grad.addColorStop(.5, e.type.color); grad.addColorStop(1, 'rgba(42,27,81,.2)')
  ctx.fillStyle = grad
  ctx.strokeStyle = OUTLINE; ctx.lineWidth = 1.6
  ctx.beginPath()
  ctx.moveTo(-11, -53)
  ctx.bezierCurveTo(-24, -40, -22, -19, -18 + Math.sin(t * 3) * 4, -4)
  ctx.lineTo(-12, -10); ctx.lineTo(-8, -2); ctx.lineTo(-2, -11); ctx.lineTo(4, -3); ctx.lineTo(8, -13); ctx.lineTo(14, -4); ctx.lineTo(18 + Math.cos(t * 2.5) * 3, -19)
  ctx.bezierCurveTo(22, -39, 18, -50, 11, -54)
  ctx.closePath(); ctx.fill(); ctx.stroke()
  // capucha
  ctx.fillStyle = '#3a2b64'; ctx.strokeStyle = OUTLINE; ctx.lineWidth = 1.6
  ctx.beginPath()
  ctx.moveTo(-14, -56); ctx.quadraticCurveTo(-12, -79, 1, -81); ctx.quadraticCurveTo(15, -78, 15, -56); ctx.quadraticCurveTo(0, -47, -14, -56)
  ctx.closePath(); ctx.fill(); ctx.stroke()
  // vacío
  ellipse(ctx, 1, -62, 9, 10)
  ctx.fillStyle = '#0a0b18'; ctx.fill()
  glow(ctx, 1, -62, 13, 'rgba(160,114,255,.35)', .6)
  ctx.fillStyle = '#d2b7ff'
  ellipse(ctx, -3, -63, 1.8, 2.3); ctx.fill()
  ellipse(ctx, 5, -63, 1.8, 2.3); ctx.fill()
  // manos
  limbed(ctx, -9, -42, -23, -31 + Math.sin(t * 3) * 2, 4, '#6f58ad', OUTLINE)
  limbed(ctx, 10, -42, 24, -30 + Math.cos(t * 3) * 2, 4, '#6f58ad', OUTLINE)
  glow(ctx, -24, -31, 8, 'rgba(180,130,255,.4)', .4)
  glow(ctx, 25, -30, 8, 'rgba(180,130,255,.4)', .4)
  // orbe de ataque
  if (e.state?.attack > 0) {
    glow(ctx, 8, -28, 22, 'rgba(172,104,255,.8)', .55)
    ellipse(ctx, 8, -28, 5, 5); ctx.fillStyle = '#e6ccff'; ctx.fill()
  }
  if (e.state?.hurt > 0) {
    ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = e.state.hurt * .55
    ellipse(ctx, 0, -38, 26, 35); ctx.fillStyle = '#d7b8ff'; ctx.fill()
  }
  ctx.restore()
}

function boss(ctx, e, t) {
  const flip = (e.facing?.x || 0) < -0.1 ? -1 : 1
  const moving = e.moving
  const stride = Math.sin((e.walk || 0) * Math.PI * 4) * (moving ? 6 : 0)
  const attack = e.state?.attack || 0
  const phase = e.phase || 1
  const breathe = Math.sin(t * 1.4) * 1.8
  ctx.save()
  ctx.translate(e.x, e.y)
  shadow(ctx, 0, 0, 58, 17, .52)
  ctx.scale(flip * 1.18, 1.18)
  // aura
  glow(ctx, 0, -44, 88, phase >= 3 ? 'rgba(255,64,118,.23)' : 'rgba(136,88,255,.18)', .8)
  // capa
  const cape = ctx.createLinearGradient(0, -98, 0, -8)
  cape.addColorStop(0, '#32234f'); cape.addColorStop(1, '#100b22')
  ctx.fillStyle = cape; ctx.strokeStyle = OUTLINE; ctx.lineWidth = 2.5
  ctx.beginPath()
  ctx.moveTo(-29, -95)
  ctx.bezierCurveTo(-58, -75, -54, -30, -43, -2)
  ctx.lineTo(-17, -15); ctx.lineTo(0, -2); ctx.lineTo(19, -15); ctx.lineTo(45, -3)
  ctx.bezierCurveTo(55, -34, 57, -72, 29, -96)
  ctx.closePath(); ctx.fill(); ctx.stroke()
  // piernas
  limbed(ctx, -16, -41, -21 - stride * .3, -4, 12, '#372d4b', OUTLINE)
  limbed(ctx, 16, -41, 21 + stride * .3, -4, 12, '#372d4b', OUTLINE)
  rr(ctx, -30 - stride * .3, -8, 17, 9, 3); ctx.fillStyle = '#171225'; ctx.fill(); ctx.strokeStyle = '#7660a0'; ctx.lineWidth = 1; ctx.stroke()
  rr(ctx, 13 + stride * .3, -8, 17, 9, 3); ctx.fill()
  // torso
  const armor = ctx.createLinearGradient(-30, -88, 30, -32)
  armor.addColorStop(0, '#8c78b5'); armor.addColorStop(.32, '#4d3d70'); armor.addColorStop(.7, '#2f2548'); armor.addColorStop(1, '#17101f')
  ctx.fillStyle = armor; ctx.strokeStyle = '#0b0a14'; ctx.lineWidth = 2.5
  ctx.beginPath()
  ctx.moveTo(-28, -91); ctx.lineTo(-35, -69); ctx.lineTo(-24, -35); ctx.lineTo(0, -29); ctx.lineTo(24, -35); ctx.lineTo(35, -69); ctx.lineTo(28, -91); ctx.closePath()
  ctx.fill(); ctx.stroke()
  // runas pecho
  const runeColor = phase >= 3 ? '#ff4f81' : '#bb8cff'
  glow(ctx, 0, -63, 21, 'rgba(177,111,255,.36)', .5)
  ctx.strokeStyle = runeColor; ctx.lineWidth = 1.8
  ctx.beginPath(); ctx.moveTo(0, -78); ctx.lineTo(-8, -66); ctx.lineTo(0, -52); ctx.lineTo(9, -67); ctx.closePath(); ctx.stroke()
  ctx.beginPath(); ctx.arc(0, -66, 4, 0, TAU); ctx.stroke()
  // hombreras
  for (const side of [-1, 1]) {
    ctx.save(); ctx.translate(side * 34, -82); ctx.rotate(side * .2)
    polygon(ctx, [[-13, -8], [-3, -19], [15, -9], [12, 9], [-9, 13]], '#655184', '#100c1b', 2)
    ctx.fillStyle = '#655184'; ctx.fill(); ctx.stroke()
    ctx.strokeStyle = runeColor; ctx.lineWidth = 1.2
    ctx.beginPath(); ctx.moveTo(-5, -7); ctx.lineTo(0, 0); ctx.lineTo(6, -8); ctx.stroke()
    ctx.restore()
  }
  // brazos
  const ax = attack > 0 ? 31 + Math.sin(attack * Math.PI) * 12 : 35
  const ay = attack > 0 ? -63 + Math.sin(attack * Math.PI) * 20 : -54
  limbed(ctx, -28, -79, -36, -48 + stride * .2, 10, '#42345d', OUTLINE)
  limbed(ctx, 28, -79, ax, ay, 10, '#42345d', OUTLINE)
  ellipse(ctx, ax, ay, 7, 7); ctx.fillStyle = '#6a568e'; ctx.fill(); ctx.strokeStyle = OUTLINE; ctx.stroke()
  // espadón
  ctx.save(); ctx.translate(ax + 2, ay); ctx.rotate(attack > 0 ? -2.2 + attack * 3.7 : -0.75)
  ctx.fillStyle = '#2a2137'; ctx.fillRect(-18, -6, 22, 12)
  ctx.strokeStyle = '#b99aff'; ctx.lineWidth = 1.3; ctx.strokeRect(-18, -6, 22, 12)
  const blade = ctx.createLinearGradient(0, -9, 82, 4)
  blade.addColorStop(0, '#c7b8e7'); blade.addColorStop(.55, '#6b5b8a'); blade.addColorStop(1, '#f4eaff')
  ctx.fillStyle = blade
  ctx.beginPath(); ctx.moveTo(4, -8); ctx.lineTo(74, -5); ctx.lineTo(89, 1); ctx.lineTo(73, 7); ctx.lineTo(4, 9); ctx.closePath(); ctx.fill()
  ctx.strokeStyle = '#0d0a16'; ctx.lineWidth = 1.5; ctx.stroke()
  if (attack > 0) glow(ctx, 55, 0, 32, 'rgba(188,128,255,.65)', .7)
  ctx.restore()
  // cabeza / yelmo
  ctx.save(); ctx.translate(0, -101 + breathe * .3)
  ctx.fillStyle = '#3b2d57'; ctx.strokeStyle = '#0c0913'; ctx.lineWidth = 2
  ctx.beginPath(); ctx.moveTo(-16, 2); ctx.quadraticCurveTo(-19, -20, 0, -26); ctx.quadraticCurveTo(19, -20, 16, 2); ctx.quadraticCurveTo(0, 10, -16, 2); ctx.closePath(); ctx.fill(); ctx.stroke()
  // cuernos
  polygon(ctx, [[-12, -12], [-29, -30], [-19, -3]], '#5b477e', '#0d0915', 1.5)
  polygon(ctx, [[12, -12], [29, -30], [19, -3]], '#5b477e', '#0d0915', 1.5)
  glow(ctx, -5, -7, 10, 'rgba(255,79,129,.5)', .6)
  ctx.fillStyle = phase >= 3 ? '#ff6b93' : '#d6b3ff'
  ellipse(ctx, -5, -7, 2.4, 1.8); ctx.fill()
  ellipse(ctx, 5, -7, 2.4, 1.8); ctx.fill()
  // corona
  ctx.strokeStyle = '#d3b16b'; ctx.lineWidth = 1.3
  ctx.beginPath(); ctx.moveTo(-8, -23); ctx.lineTo(-4, -29); ctx.lineTo(0, -23); ctx.lineTo(4, -29); ctx.lineTo(8, -23); ctx.stroke()
  ctx.restore()
  // partículas de fase
  ctx.globalCompositeOperation = 'lighter'
  for (let i = 0; i < 8; i++) {
    const a = t * (0.7 + phase * .2) + i * .8
    const r = 35 + (i % 3) * 14
    ellipse(ctx, Math.cos(a) * r, -52 + Math.sin(a) * r * .55, 1.8, 1.8)
    ctx.fillStyle = phase >= 3 ? 'rgba(255,103,142,.7)' : 'rgba(188,142,255,.6)'
    ctx.fill()
  }
  if (e.state?.hurt > 0) {
    ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = e.state.hurt * .45
    ellipse(ctx, 0, -60, 60, 68); ctx.fillStyle = '#ff8397'; ctx.fill()
  }
  ctx.restore()
}

export function drawEnemy(ctx, e, time) {
  const alpha = e.alpha ?? 1
  ctx.save()
  ctx.globalAlpha = alpha
  switch (e.kind) {
    case 'slime': slime(ctx, e, time); break
    case 'wolf': wolf(ctx, e, time); break
    case 'beetle': beetle(ctx, e, time); break
    case 'wraith': wraith(ctx, e, time); break
    case 'boss': boss(ctx, e, time); break
    default: slime(ctx, e, time)
  }
  ctx.restore()
}

export function drawCompanion(ctx, creature, c, t) {
  const float = Math.sin(t * 2.5) * 4
  ctx.save()
  ctx.translate(c.x, c.y)
  shadow(ctx, 0, 0, 14, 4, .18)
  if (creature.id === 'lumen') {
    ctx.translate(0, float - 20)
    glow(ctx, 0, 0, 32, 'rgba(130,255,235,.5)', .55)
    // colas
    ctx.strokeStyle = 'rgba(145,255,237,.65)'; ctx.lineWidth = 4; ctx.lineCap = 'round'
    for (let i = 0; i < 3; i++) {
      ctx.beginPath(); ctx.moveTo(-8, 3); ctx.bezierCurveTo(-20, -4, -26, 8 + i * 3, -38, 3 + i * 5); ctx.stroke()
    }
    // cuerpo
    const g = ctx.createRadialGradient(-3, -3, 1, 0, 0, 18)
    g.addColorStop(0, '#f0fffd'); g.addColorStop(.45, '#8ff5e5'); g.addColorStop(1, '#40b8ad')
    ctx.fillStyle = g
    ctx.beginPath(); ctx.ellipse(0, 0, 16, 11, 0, 0, TAU); ctx.fill()
    ctx.strokeStyle = '#1d756e'; ctx.lineWidth = 1.2; ctx.stroke()
    polygon(ctx, [[-8, -5], [-11, -19], [-1, -9]], '#7fe4d7', '#1d756e', 1)
    polygon(ctx, [[5, -6], [10, -18], [13, -4]], '#7fe4d7', '#1d756e', 1)
    // cabeza
    ellipse(ctx, 12, -7, 10, 9)
    ctx.fillStyle = '#b9fff5'; ctx.fill(); ctx.strokeStyle = '#1d756e'; ctx.lineWidth = 1.2; ctx.stroke()
    ellipse(ctx, 18, -6, 3, 2.4); ctx.fillStyle = '#f6ffff'; ctx.fill()
    ctx.fillStyle = '#1b4d4a'
    ellipse(ctx, 10, -9, 1.5, 1.8); ctx.fill(); ellipse(ctx, 16, -9, 1.5, 1.8); ctx.fill()
    // marca
    ctx.fillStyle = '#fff4bb'; ctx.beginPath(); ctx.arc(3, 0, 2, 0, TAU); ctx.fill()
  } else {
    const fake = {
      ...c, type: {
        color: creature.color || '#aaa', dark: creature.dark || '#333', name: creature.name,
      },
      kind: creature.id === 'lobo' ? 'wolf' : creature.id === 'escarabajo' ? 'beetle' : creature.id === 'espectro' ? 'wraith' : 'slime',
      state: {}, walk: t * 2, moving: false, seed: 3,
    }
    ctx.scale(.64, .64)
    ctx.translate(0, 18)
    drawEnemy(ctx, fake, t)
  }
  ctx.restore()
  // Aro de aliado
  ctx.save()
  ctx.strokeStyle = 'rgba(128,245,224,.55)'; ctx.lineWidth = 1.2; ctx.setLineDash([3, 4])
  ellipse(ctx, c.x, c.y + 2, 17, 5); ctx.stroke()
  ctx.restore()
}
