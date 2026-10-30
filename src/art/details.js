import { TAU, rr, ellipse, glow, mulberry32, polygon, limbed } from './common.js'

const OUTLINE = '#111724'
const SKIN = '#e8bea0'

export function drawChest(ctx, chest, time, opened = false) {
  ctx.save()
  ctx.translate(chest.x, chest.y)
  ellipse(ctx, 0, 2, 20, 6); ctx.fillStyle = 'rgba(3,7,14,.35)'; ctx.fill()
  if (!opened) glow(ctx, 0, -17, 28, 'rgba(255,211,112,.24)', .7)
  // cuerpo
  ctx.fillStyle = '#67452d'; ctx.strokeStyle = '#1d1514'; ctx.lineWidth = 1.5
  rr(ctx, -16, -25, 32, 22, 3); ctx.fill(); ctx.stroke()
  // madera
  ctx.strokeStyle = 'rgba(227,174,100,.22)'; ctx.lineWidth = 1
  ctx.beginPath(); ctx.moveTo(-11, -22); ctx.lineTo(-11, -5); ctx.moveTo(11, -22); ctx.lineTo(11, -5); ctx.stroke()
  // tapa
  ctx.save()
  ctx.translate(0, -25)
  ctx.rotate(opened ? -.95 : 0)
  ctx.fillStyle = '#7d5432'; ctx.strokeStyle = '#1d1514'; ctx.lineWidth = 1.5
  ctx.beginPath(); ctx.moveTo(-17, 0); ctx.quadraticCurveTo(0, -17, 17, 0); ctx.closePath(); ctx.fill(); ctx.stroke()
  ctx.strokeStyle = '#d3ad5f'; ctx.lineWidth = 2
  ctx.beginPath(); ctx.moveTo(-17, 0); ctx.quadraticCurveTo(0, -17, 17, 0); ctx.stroke()
  ctx.restore()
  // herrajes
  ctx.fillStyle = '#c9a557'
  rr(ctx, -4, -24, 8, 19, 1); ctx.fill()
  ctx.strokeStyle = '#5e431d'; ctx.lineWidth = 1; ctx.stroke()
  ctx.fillStyle = '#2c2117'; ctx.beginPath(); ctx.arc(0, -14, 2.4, 0, TAU); ctx.fill()
  ctx.fillStyle = '#f2d583'; ctx.beginPath(); ctx.arc(0, -14, 1, 0, TAU); ctx.fill()
  if (!opened) {
    for (let i = 0; i < 3; i++) {
      const a = time * 1.2 + i * 2.1
      ellipse(ctx, Math.cos(a) * 17, -34 + Math.sin(a * 1.3) * 9, 1.5, 1.5)
      ctx.fillStyle = 'rgba(255,230,155,.7)'; ctx.fill()
    }
  }
  ctx.restore()
}

export function drawMoonflower(ctx, flower, time, collected = false) {
  if (collected) return
  ctx.save()
  ctx.translate(flower.x, flower.y)
  const pulse = .7 + Math.sin(time * 2 + flower.x * .01) * .18
  glow(ctx, 0, -19, 34, 'rgba(203,194,255,.36)', pulse)
  ctx.strokeStyle = '#5b8065'; ctx.lineWidth = 2
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(-3, -12, 0, -23); ctx.stroke()
  ctx.strokeStyle = '#73987a'; ctx.lineWidth = 1.3
  ctx.beginPath(); ctx.moveTo(-1, -9); ctx.quadraticCurveTo(-10, -13, -12, -18); ctx.stroke()
  // pétalos
  for (let i = 0; i < 6; i++) {
    const a = i / 6 * TAU + Math.sin(time + i) * .05
    ctx.save(); ctx.translate(0, -25); ctx.rotate(a)
    ctx.fillStyle = i % 2 ? 'rgba(244,238,255,.93)' : 'rgba(211,204,255,.9)'
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(-4, -10, 0, -15); ctx.quadraticCurveTo(4, -10, 0, 0); ctx.fill()
    ctx.restore()
  }
  ctx.fillStyle = '#ffe7a3'; ctx.beginPath(); ctx.arc(0, -25, 3.4, 0, TAU); ctx.fill()
  // motas
  for (let i = 0; i < 4; i++) {
    const a = time * .7 + i * 1.7
    ellipse(ctx, Math.cos(a) * 13, -24 + Math.sin(a) * 10, 1.2, 1.2)
    ctx.fillStyle = 'rgba(242,238,255,.8)'; ctx.fill()
  }
  ctx.restore()
}

export function drawRock(ctx, rock) {
  const s = rock.scale || 1
  ctx.save(); ctx.translate(rock.x, rock.y); ctx.scale(s, s)
  ellipse(ctx, 2, 2, 22, 8); ctx.fillStyle = 'rgba(2,6,10,.32)'; ctx.fill()
  const g = ctx.createLinearGradient(-15, -30, 18, 2)
  g.addColorStop(0, '#868373'); g.addColorStop(.5, '#686a61'); g.addColorStop(1, '#3b403d')
  ctx.fillStyle = g; ctx.strokeStyle = '#1b211f'; ctx.lineWidth = 1.5
  ctx.beginPath(); ctx.moveTo(-23, 0); ctx.lineTo(-17, -20); ctx.lineTo(-4, -29); ctx.lineTo(14, -23); ctx.lineTo(23, -5); ctx.lineTo(16, 2); ctx.lineTo(-10, 4); ctx.closePath(); ctx.fill(); ctx.stroke()
  ctx.strokeStyle = 'rgba(228,224,198,.23)'; ctx.lineWidth = 1
  ctx.beginPath(); ctx.moveTo(-11, -21); ctx.lineTo(-1, -15); ctx.lineTo(8, -19); ctx.stroke()
  ctx.fillStyle = 'rgba(91,124,81,.4)'
  ellipse(ctx, -11, -7, 8, 3, -.2); ctx.fill()
  ctx.restore()
}

export function drawBush(ctx, bush, time) {
  const rand = mulberry32(bush.seed || 1)
  ctx.save(); ctx.translate(bush.x, bush.y)
  ellipse(ctx, 0, 2, 18, 6); ctx.fillStyle = 'rgba(3,9,10,.25)'; ctx.fill()
  for (let i = 0; i < 8; i++) {
    const a = i / 8 * TAU
    const x = Math.cos(a) * (7 + rand() * 8)
    const y = -8 + Math.sin(a) * (4 + rand() * 6)
    ellipse(ctx, x, y, 8 + rand() * 6, 6 + rand() * 4, rand())
    ctx.fillStyle = ['#2b5b3e', '#39704a', '#4f8052'][(rand() * 3) | 0]; ctx.fill()
  }
  if (bush.flowers) {
    for (let i = 0; i < 4; i++) {
      ellipse(ctx, (rand() - .5) * 26, -8 - rand() * 12, 1.8, 1.8)
      ctx.fillStyle = 'rgba(255,204,222,.85)'; ctx.fill()
    }
  }
  ctx.restore()
}

export function drawLantern(ctx, lantern, time) {
  const baseY = lantern.y
  ctx.save(); ctx.translate(lantern.x, baseY)
  ellipse(ctx, 0, 2, 13, 4); ctx.fillStyle = 'rgba(3,6,12,.32)'; ctx.fill()
  ctx.strokeStyle = '#302d2b'; ctx.lineWidth = 4; ctx.lineCap = 'round'
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -54); ctx.stroke()
  ctx.strokeStyle = '#b6985c'; ctx.lineWidth = 1.4
  ctx.beginPath(); ctx.moveTo(-10, -54); ctx.lineTo(10, -54); ctx.stroke()
  ctx.fillStyle = '#4a3a26'; rr(ctx, -8, -68, 16, 18, 2); ctx.fill()
  ctx.strokeStyle = '#d4b06b'; ctx.lineWidth = 1; ctx.stroke()
  const flicker = .68 + Math.sin(time * 9 + lantern.x) * .08 + Math.sin(time * 17) * .04
  ctx.fillStyle = `rgba(255,207,113,${flicker})`; rr(ctx, -5, -65, 10, 12, 1); ctx.fill()
  glow(ctx, 0, -59, 42, 'rgba(255,192,88,.42)', .9)
  glow(ctx, 0, -59, 10, 'rgba(255,246,200,.8)', .9)
  // cadena
  ctx.strokeStyle = '#7c6d52'; ctx.lineWidth = 1
  ctx.beginPath(); ctx.moveTo(-5, -68); ctx.lineTo(0, -75); ctx.lineTo(5, -68); ctx.stroke()
  ctx.restore()
}

export function drawSign(ctx, sign) {
  ctx.save(); ctx.translate(sign.x, sign.y)
  ellipse(ctx, 0, 2, 10, 3); ctx.fillStyle = 'rgba(3,7,11,.3)'; ctx.fill()
  ctx.strokeStyle = '#3a2a1f'; ctx.lineWidth = 5
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -42); ctx.stroke()
  ctx.fillStyle = '#6b4d32'; ctx.strokeStyle = '#221a16'; ctx.lineWidth = 1.5
  rr(ctx, -19, -50, 38, 21, 2); ctx.fill(); ctx.stroke()
  ctx.strokeStyle = 'rgba(242,213,157,.55)'; ctx.lineWidth = 1.2
  ctx.beginPath(); ctx.moveTo(-12, -44); ctx.lineTo(12, -44); ctx.moveTo(-8, -39); ctx.lineTo(5, -39); ctx.stroke()
  // flecha grabada
  ctx.strokeStyle = '#dfc087'; ctx.lineWidth = 1.4
  ctx.beginPath(); ctx.moveTo(18, -12); ctx.lineTo(29, -12); ctx.moveTo(25, -16); ctx.lineTo(29, -12); ctx.lineTo(25, -8); ctx.stroke()
  ctx.restore()
}

export function drawStall(ctx, stall, time) {
  ctx.save(); ctx.translate(stall.x, stall.y)
  ellipse(ctx, 0, 3, 58, 16); ctx.fillStyle = 'rgba(3,8,13,.36)'; ctx.fill()
  // mostrador
  ctx.fillStyle = '#61412c'; ctx.strokeStyle = '#1a1414'; ctx.lineWidth = 2
  rr(ctx, -50, -34, 100, 31, 3); ctx.fill(); ctx.stroke()
  rr(ctx, -56, -48, 112, 15, 2); ctx.fill(); ctx.stroke()
  ctx.strokeStyle = 'rgba(221,174,100,.35)'; ctx.lineWidth = 1
  ctx.beginPath(); ctx.moveTo(-46, -31); ctx.lineTo(46, -31); ctx.stroke()
  // postes y toldo
  for (const side of [-1, 1]) {
    ctx.strokeStyle = '#3a291e'; ctx.lineWidth = 4
    ctx.beginPath(); ctx.moveTo(side * 46, -24); ctx.lineTo(side * 46, -100); ctx.stroke()
  }
  const cloth = ctx.createLinearGradient(0, -110, 0, -78)
  cloth.addColorStop(0, '#7d3d49'); cloth.addColorStop(1, '#432631')
  ctx.fillStyle = cloth; ctx.strokeStyle = '#1b1317'; ctx.lineWidth = 1.6
  ctx.beginPath(); ctx.moveTo(-62, -88); ctx.lineTo(-45, -112); ctx.lineTo(45, -112); ctx.lineTo(62, -88); ctx.lineTo(52, -85); ctx.lineTo(42, -94); ctx.lineTo(30, -85); ctx.lineTo(18, -94); ctx.lineTo(4, -85); ctx.lineTo(-10, -94); ctx.lineTo(-24, -85); ctx.lineTo(-38, -94); ctx.lineTo(-52, -85); ctx.closePath(); ctx.fill(); ctx.stroke()
  // mercancía: pociones y frascos
  for (let i = 0; i < 5; i++) {
    const x = -38 + i * 18
    ctx.fillStyle = ['#bf6b7e', '#5aa3b4', '#c2a85e', '#8d6ec3'][i % 4]
    rr(ctx, x - 3, -46, 7, 11, 2); ctx.fill()
    ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.lineWidth = .8; ctx.stroke()
    ctx.fillStyle = '#d6d0bd'; ctx.fillRect(x - 1.5, -48, 4, 3)
  }
  // farolillo
  glow(ctx, 55, -105, 22, 'rgba(255,194,95,.32)', .8)
  ctx.fillStyle = '#f1c06e'; ctx.beginPath(); ctx.arc(55, -105, 3, 0, TAU); ctx.fill()
  ctx.restore()
}

export function drawAnvil(ctx, anvil) {
  ctx.save(); ctx.translate(anvil.x, anvil.y)
  ellipse(ctx, 0, 2, 24, 7); ctx.fillStyle = 'rgba(3,6,10,.35)'; ctx.fill()
  ctx.fillStyle = '#3c3e45'; ctx.strokeStyle = '#141821'; ctx.lineWidth = 1.4
  rr(ctx, -14, -17, 28, 16, 2); ctx.fill(); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(-23, -18); ctx.lineTo(22, -18); ctx.lineTo(15, -30); ctx.lineTo(-15, -30); ctx.closePath(); ctx.fill(); ctx.stroke()
  ctx.strokeStyle = 'rgba(255,191,101,.4)'; ctx.lineWidth = 1
  ctx.beginPath(); ctx.moveTo(-8, -28); ctx.lineTo(5, -28); ctx.stroke()
  // chispas
  ctx.globalCompositeOperation = 'lighter'
  ctx.fillStyle = 'rgba(255,191,89,.6)'
  ellipse(ctx, 6, -33, 1.2, 1.2); ctx.fill()
  ctx.restore()
}

export function drawStatue(ctx, statue, time) {
  ctx.save(); ctx.translate(statue.x, statue.y)
  ellipse(ctx, 0, 4, 30, 10); ctx.fillStyle = 'rgba(3,5,11,.36)'; ctx.fill()
  ctx.fillStyle = '#5e5a52'; ctx.strokeStyle = '#22242a'; ctx.lineWidth = 1.5
  rr(ctx, -28, -22, 56, 24, 2); ctx.fill(); ctx.stroke()
  rr(ctx, -18, -38, 36, 17, 2); ctx.fill(); ctx.stroke()
  // figura de manto
  ctx.fillStyle = '#777268'
  ctx.beginPath(); ctx.moveTo(-13, -38); ctx.lineTo(-10, -84); ctx.lineTo(0, -96); ctx.lineTo(11, -84); ctx.lineTo(14, -38); ctx.closePath(); ctx.fill(); ctx.stroke()
  ctx.beginPath(); ctx.arc(0, -102, 10, 0, TAU); ctx.fill(); ctx.stroke()
  ctx.strokeStyle = '#b5ad95'; ctx.lineWidth = 1.4
  ctx.beginPath(); ctx.moveTo(-9, -88); ctx.lineTo(9, -88); ctx.stroke()
  // espada de piedra
  ctx.strokeStyle = '#a29b88'; ctx.lineWidth = 3.5
  ctx.beginPath(); ctx.moveTo(16, -30); ctx.lineTo(16, -92); ctx.stroke()
  ctx.strokeStyle = 'rgba(122,255,221,.25)'; ctx.lineWidth = 1
  ctx.beginPath(); ctx.moveTo(16, -34); ctx.lineTo(16, -85); ctx.stroke()
  ctx.restore()
}

export function drawArenaPillar(ctx, p, time) {
  ctx.save(); ctx.translate(p.x, p.y)
  ellipse(ctx, 0, 4, 38, 12); ctx.fillStyle = 'rgba(2,3,8,.45)'; ctx.fill()
  ctx.fillStyle = '#433c53'; ctx.strokeStyle = '#100d18'; ctx.lineWidth = 2
  rr(ctx, -24, -128, 48, 132, 3); ctx.fill(); ctx.stroke()
  ctx.fillStyle = '#554c69'; rr(ctx, -32, -140, 64, 18, 2); ctx.fill(); ctx.stroke()
  ctx.fillStyle = '#4c445f'; rr(ctx, -29, -18, 58, 20, 2); ctx.fill(); ctx.stroke()
  const rune = p.color || '#b58cff'
  glow(ctx, 0, -76, 28, rune, .3)
  ctx.strokeStyle = rune; ctx.lineWidth = 1.4
  ctx.beginPath(); ctx.moveTo(0, -99); ctx.lineTo(-9, -84); ctx.lineTo(0, -68); ctx.lineTo(10, -84); ctx.closePath(); ctx.stroke()
  ctx.beginPath(); ctx.arc(0, -84, 4, 0, TAU); ctx.stroke()
  // cadenas flotantes
  ctx.strokeStyle = 'rgba(130,114,163,.5)'; ctx.lineWidth = 1.2; ctx.setLineDash([3, 4])
  ctx.beginPath(); ctx.moveTo(24, -120); ctx.quadraticCurveTo(40, -102, 23, -85); ctx.stroke()
  ctx.setLineDash([])
  ctx.restore()
}

export function drawPedestal(ctx, x, y, time, sword = true) {
  ctx.save(); ctx.translate(x, y)
  ellipse(ctx, 0, 4, 34, 10); ctx.fillStyle = 'rgba(2,3,8,.4)'; ctx.fill()
  ctx.fillStyle = '#5a5364'; ctx.strokeStyle = '#15131e'; ctx.lineWidth = 1.6
  rr(ctx, -28, -28, 56, 30, 3); ctx.fill(); ctx.stroke()
  ctx.fillStyle = '#736b7e'; rr(ctx, -22, -39, 44, 12, 2); ctx.fill(); ctx.stroke()
  // runas
  ctx.strokeStyle = 'rgba(255,225,139,.55)'; ctx.lineWidth = 1.2
  ctx.beginPath(); ctx.arc(0, -25, 10, 0, TAU); ctx.stroke()
  for (let i = 0; i < 4; i++) {
    const a = time * .2 + i / 4 * TAU
    ctx.beginPath(); ctx.moveTo(Math.cos(a) * 10, -25 + Math.sin(a) * 4); ctx.lineTo(Math.cos(a) * 15, -25 + Math.sin(a) * 6); ctx.stroke()
  }
  if (sword) {
    const bob = Math.sin(time * 1.5) * 3
    glow(ctx, 0, -80 + bob, 48, 'rgba(255,231,139,.55)', .9)
    ctx.save(); ctx.translate(0, -80 + bob); ctx.rotate(Math.sin(time * .8) * .04)
    // hoja
    ctx.fillStyle = '#fff4c3'; ctx.strokeStyle = '#b79345'; ctx.lineWidth = 1.2
    ctx.beginPath(); ctx.moveTo(-4, 24); ctx.lineTo(-4, -32); ctx.lineTo(0, -43); ctx.lineTo(4, -32); ctx.lineTo(4, 24); ctx.closePath(); ctx.fill(); ctx.stroke()
    ctx.fillStyle = '#d8b75c'; ctx.fillRect(-19, 22, 38, 5)
    ctx.fillStyle = '#4e3b22'; ctx.fillRect(-3, 27, 6, 14)
    ctx.fillStyle = '#e9c56b'; ctx.beginPath(); ctx.arc(0, 45, 3, 0, TAU); ctx.fill()
    ctx.restore()
  }
  ctx.restore()
}

export function drawRunePillar(ctx, rune, time, activated) {
  ctx.save(); ctx.translate(rune.x, rune.y)
  ellipse(ctx, 0, 2, 16, 6); ctx.fillStyle = 'rgba(2,4,9,.35)'; ctx.fill()
  ctx.fillStyle = '#514b5d'; ctx.strokeStyle = '#17131f'; ctx.lineWidth = 1.4
  rr(ctx, -10, -56, 20, 57, 2); ctx.fill(); ctx.stroke()
  ctx.strokeStyle = activated ? '#8dffe3' : 'rgba(128,215,193,.28)'; ctx.lineWidth = 1.6
  ctx.beginPath(); ctx.moveTo(0, -46); ctx.lineTo(-6, -34); ctx.lineTo(0, -22); ctx.lineTo(6, -34); ctx.closePath(); ctx.stroke()
  glow(ctx, 0, -34, activated ? 30 : 14, activated ? 'rgba(122,255,220,.5)' : 'rgba(122,255,220,.1)', .8)
  ctx.restore()
}

export function drawNPC(ctx, npc, time) {
  const x = npc.x, y = npc.y
  const role = npc.role
  const bob = Math.sin(time * 1.6 + x) * .8
  ctx.save()
  ctx.translate(x, y + bob)
  ellipse(ctx, 0, 2, 19, 6); ctx.fillStyle = 'rgba(3,7,13,.32)'; ctx.fill()
  const robe = role === 'elara' ? '#d6d2c0' : role === 'rurik' ? '#574131' : '#5b4059'
  const robeDark = role === 'elara' ? '#9a978d' : role === 'rurik' ? '#33251e' : '#332235'
  const trim = role === 'elara' ? '#6ed6c4' : role === 'rurik' ? '#cf9b54' : '#d4ad73'
  // ropaje
  ctx.fillStyle = robe; ctx.strokeStyle = OUTLINE; ctx.lineWidth = 1.7
  ctx.beginPath()
  ctx.moveTo(-10, -57); ctx.quadraticCurveTo(-18, -35, -15, -4); ctx.lineTo(-5, -1); ctx.lineTo(0, -5); ctx.lineTo(5, -1); ctx.lineTo(16, -4); ctx.quadraticCurveTo(18, -36, 10, -57); ctx.closePath()
  ctx.fill(); ctx.stroke()
  ctx.fillStyle = robeDark
  ctx.beginPath(); ctx.moveTo(-11, -48); ctx.quadraticCurveTo(0, -38, 11, -48); ctx.lineTo(13, -20); ctx.lineTo(0, -11); ctx.lineTo(-13, -20); ctx.closePath(); ctx.fill()
  ctx.strokeStyle = trim; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(0, -56); ctx.lineTo(0, -15); ctx.stroke()
  // brazos
  limbed(ctx, -10, -51, -16, -29, 5, robe, OUTLINE)
  limbed(ctx, 10, -51, 14, -29, 5, robe, OUTLINE)
  ellipse(ctx, -16, -28, 2.8, 2.8); ctx.fillStyle = SKIN; ctx.fill()
  ellipse(ctx, 14, -28, 2.8, 2.8); ctx.fill()
  // cabeza
  ellipse(ctx, 0, -66, 9, 10); ctx.fillStyle = role === 'rurik' ? '#d4a98a' : SKIN; ctx.fill(); ctx.strokeStyle = OUTLINE; ctx.lineWidth = 1.4; ctx.stroke()
  // cabello / barba / capucha
  if (role === 'elara') {
    ctx.fillStyle = '#e5e2d8'
    ctx.beginPath(); ctx.moveTo(-9, -70); ctx.quadraticCurveTo(-10, -82, 0, -82); ctx.quadraticCurveTo(11, -82, 9, -69); ctx.lineTo(7, -56); ctx.lineTo(2, -61); ctx.lineTo(-4, -55); ctx.lineTo(-9, -62); ctx.closePath(); ctx.fill()
    ctx.strokeStyle = '#9e9c90'; ctx.lineWidth = .7; ctx.stroke()
    // ojos sabios
    ctx.fillStyle = '#2b3644'; ellipse(ctx, -3.4, -65, 1, 1.2); ctx.fill(); ellipse(ctx, 3.4, -65, 1, 1.2); ctx.fill()
    // aureola
    glow(ctx, 0, -83, 18, 'rgba(116,255,220,.2)', .5)
    // bastón
    ctx.strokeStyle = '#5e4532'; ctx.lineWidth = 3.5
    ctx.beginPath(); ctx.moveTo(20, -3); ctx.lineTo(20, -78); ctx.stroke()
    glow(ctx, 20, -82, 16, 'rgba(108,255,221,.5)', .8)
    ctx.strokeStyle = '#8ae8d5'; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.arc(20, -82, 6, 0, TAU); ctx.stroke()
  } else if (role === 'rurik') {
    ctx.fillStyle = '#3a2a24'
    ctx.beginPath(); ctx.moveTo(-9, -73); ctx.quadraticCurveTo(0, -80, 9, -73); ctx.lineTo(8, -69); ctx.lineTo(-8, -69); ctx.closePath(); ctx.fill()
    // barba
    ctx.fillStyle = '#4a3125'
    ctx.beginPath(); ctx.moveTo(-7, -61); ctx.quadraticCurveTo(0, -50, 7, -61); ctx.lineTo(4, -56); ctx.lineTo(0, -58); ctx.lineTo(-4, -56); ctx.closePath(); ctx.fill()
    ctx.fillStyle = '#24201b'; ellipse(ctx, -3, -66, 1, 1.2); ctx.fill(); ellipse(ctx, 3, -66, 1, 1.2); ctx.fill()
    // delantal y martillo
    ctx.fillStyle = '#5b3c2a'; rr(ctx, -9, -47, 18, 29, 2); ctx.fill()
    ctx.strokeStyle = '#b18b5c'; ctx.lineWidth = 1; ctx.stroke()
    ctx.strokeStyle = '#513923'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(21, -2); ctx.lineTo(21, -47); ctx.stroke()
    ctx.fillStyle = '#676b72'; rr(ctx, 11, -54, 22, 11, 2); ctx.fill(); ctx.strokeStyle = '#1d2026'; ctx.lineWidth = 1; ctx.stroke()
  } else {
    // capucha
    ctx.fillStyle = '#4b3249'
    ctx.beginPath(); ctx.moveTo(-10, -69); ctx.quadraticCurveTo(-7, -82, 0, -82); ctx.quadraticCurveTo(9, -82, 11, -68); ctx.lineTo(5, -56); ctx.lineTo(-6, -57); ctx.closePath(); ctx.fill()
    ctx.strokeStyle = '#1b1420'; ctx.lineWidth = 1.2; ctx.stroke()
    ctx.fillStyle = '#f0cba9'; ctx.beginPath(); ctx.arc(0, -64, 6, 0, TAU); ctx.fill()
    ctx.fillStyle = '#201b26'; ellipse(ctx, -2.5, -65, 1, 1.1); ctx.fill(); ellipse(ctx, 2.5, -65, 1, 1.1); ctx.fill()
    // fardo y monedas
    ctx.fillStyle = '#7b5d39'; ctx.beginPath(); ctx.arc(-19, -34, 10, 0, TAU); ctx.fill(); ctx.strokeStyle = '#302419'; ctx.stroke()
    glow(ctx, 17, -32, 12, 'rgba(255,211,108,.3)', .6)
    ctx.fillStyle = '#e9c46d'; ellipse(ctx, 17, -32, 3, 3); ctx.fill()
  }
  // aura suave de NPC
  glow(ctx, 0, -38, 32, role === 'elara' ? 'rgba(102,255,221,.1)' : 'rgba(255,212,133,.06)', .5)
  ctx.restore()
}
