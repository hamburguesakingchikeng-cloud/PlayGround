// Procedural pixel-art renderer. No external images: every sprite is drawn with canvas paths,
// so the build stays tiny and the page can never break on a missing asset.

import { TILE, MAP_W, MAP_H, TT } from './data.js'

const PAL = {
  night: '#05070d',
  grass: '#17362b',
  grassAlt: '#1c4034',
  grassLit: '#245043',
  tall: '#1d4534',
  tallLit: '#2f6d51',
  tree: '#0e2721',
  treeMid: '#15392c',
  treeLit: '#1d4c39',
  trunk: '#2a1f17',
  water: '#112234',
  waterLit: '#2a5b7c',
  waterFoam: '#4b86a8',
  stone: '#2b303d',
  stoneAlt: '#333a49',
  stoneLine: '#20242e',
  path: '#4a3d2e',
  pathAlt: '#574935',
  wood: '#4a3626',
  woodLit: '#5f4630',
  roof: '#6b3a32',
  roofDark: '#4b2823',
  wall: '#3b2f2a',
  wallLit: '#584437',
  rock: '#2a3038',
  rockLit: '#3a424e',
  gold: '#f2c66d',
  goldDim: '#b98f3e',
  jade: '#5fe0b0',
  crimson: '#e0575f',
  skin: '#e7c3a2',
}

const clamp = (v, a, b) => Math.max(a, Math.min(b, v))

function hash2(x, y, salt = 0) {
  let h = Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263) + Math.imul(salt | 0, 1274126177)
  h = Math.imul(h ^ (h >>> 13), 1274126177)
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296
}

function rr(ctx, x, y, w, h, r) {
  const radius = Math.min(r, w / 2, h / 2)
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.arcTo(x + w, y, x + w, y + h, radius)
  ctx.arcTo(x + w, y + h, x, y + h, radius)
  ctx.arcTo(x, y + h, x, y, radius)
  ctx.arcTo(x, y, x + w, y, radius)
  ctx.closePath()
}

/* ------------------------------------------------------------------ map art */

function paintGrass(ctx, px, py, x, y, lit = false) {
  ctx.fillStyle = lit ? PAL.grassAlt : PAL.grass
  ctx.fillRect(px, py, TILE, TILE)
  for (let i = 0; i < 5; i++) {
    const rx = px + hash2(x, y, i) * TILE
    const ry = py + hash2(x, y, i + 17) * TILE
    ctx.fillStyle = hash2(x, y, i + 31) > 0.5 ? PAL.grassLit : PAL.grassAlt
    ctx.fillRect(Math.round(rx), Math.round(ry), 2, hash2(x, y, i + 7) > 0.6 ? 3 : 2)
  }
}

function paintTile(ctx, world, x, y) {
  const px = x * TILE
  const py = y * TILE
  const type = world.grid[y * MAP_W + x]
  const above = y > 0 ? world.grid[(y - 1) * MAP_W + x] : -1

  switch (type) {
    case TT.GRASS:
      paintGrass(ctx, px, py, x, y)
      break
    case TT.FLOWER: {
      paintGrass(ctx, px, py, x, y)
      for (let i = 0; i < 3; i++) {
        const fx = px + 6 + hash2(x, y, i) * 20
        const fy = py + 6 + hash2(x, y, i + 9) * 20
        ctx.fillStyle = ['#d7a0bd', '#e8d39a', '#c9869f'][i % 3]
        ctx.fillRect(Math.round(fx), Math.round(fy), 3, 3)
        ctx.fillStyle = 'rgba(255,255,255,0.35)'
        ctx.fillRect(Math.round(fx), Math.round(fy), 1, 1)
      }
      break
    }
    case TT.TALL: {
      ctx.fillStyle = PAL.tall
      ctx.fillRect(px, py, TILE, TILE)
      for (let i = 0; i < 7; i++) {
        const bx = px + 3 + i * 4
        const sway = Math.round(hash2(x, y, i + 3) * 3)
        const bh = 8 + Math.round(hash2(x, y, i + 11) * 9)
        ctx.fillStyle = i % 3 === 0 ? PAL.tallLit : '#255a43'
        ctx.fillRect(bx + sway, py + TILE - bh, 2, bh)
      }
      ctx.fillStyle = 'rgba(0,0,0,0.12)'
      ctx.fillRect(px, py + TILE - 4, TILE, 4)
      break
    }
    case TT.TREE: {
      paintGrass(ctx, px, py, x, y)
      const cx = px + TILE / 2
      const cy = py + TILE / 2 + 2
      ctx.fillStyle = PAL.trunk
      ctx.fillRect(cx - 3, cy + 2, 6, 13)
      const blobs = [
        [0, -6, 15], [-9, 1, 10], [9, 0, 10], [0, -17, 9],
      ]
      ctx.fillStyle = PAL.tree
      for (const [bx, by, r] of blobs) {
        ctx.beginPath()
        ctx.arc(cx + bx, cy + by, r, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.fillStyle = PAL.treeMid
      for (const [bx, by, r] of blobs) {
        ctx.beginPath()
        ctx.arc(cx + bx - 1.5, cy + by - 2, r * 0.78, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.fillStyle = PAL.treeLit
      ctx.beginPath()
      ctx.arc(cx - 3, cy - 12, 5.5, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = 'rgba(0,0,0,0.22)'
      ctx.beginPath()
      ctx.ellipse(cx, cy + 16, 12, 4, 0, 0, Math.PI * 2)
      ctx.fill()
      break
    }
    case TT.WATER: {
      const g = ctx.createLinearGradient(px, py, px, py + TILE)
      g.addColorStop(0, '#0e1d2e')
      g.addColorStop(1, PAL.water)
      ctx.fillStyle = g
      ctx.fillRect(px, py, TILE, TILE)
      for (let i = 0; i < 3; i++) {
        const wx = px + ((hash2(x, y, i) * TILE + i * 9) % (TILE - 12))
        const wy = py + 5 + i * 9
        ctx.fillStyle = i % 2 ? PAL.waterLit : PAL.waterFoam
        ctx.globalAlpha = 0.45
        ctx.fillRect(Math.round(wx), Math.round(wy), 10 - i * 2, 1)
        ctx.globalAlpha = 1
      }
      break
    }
    case TT.BRIDGE: {
      ctx.fillStyle = '#1b2b39'
      ctx.fillRect(px, py, TILE, TILE)
      ctx.fillStyle = PAL.wood
      ctx.fillRect(px, py, TILE, TILE)
      for (let i = 0; i < 4; i++) {
        ctx.fillStyle = i % 2 ? PAL.woodLit : '#3d2c1f'
        ctx.fillRect(px, py + i * 8, TILE, 7)
      }
      ctx.fillStyle = '#2a1c12'
      ctx.fillRect(px, py, 3, TILE)
      ctx.fillRect(px + TILE - 3, py, 3, TILE)
      break
    }
    case TT.PATH: {
      ctx.fillStyle = PAL.path
      ctx.fillRect(px, py, TILE, TILE)
      for (let i = 0; i < 4; i++) {
        const rx = px + hash2(x, y, i) * (TILE - 5)
        const ry = py + hash2(x, y, i + 5) * (TILE - 5)
        ctx.fillStyle = hash2(x, y, i + 12) > 0.5 ? PAL.pathAlt : '#3e3227'
        ctx.fillRect(Math.round(rx), Math.round(ry), 3 + Math.round(hash2(x, y, i + 3) * 3), 2)
      }
      break
    }
    case TT.STONE: {
      ctx.fillStyle = PAL.stone
      ctx.fillRect(px, py, TILE, TILE)
      ctx.strokeStyle = PAL.stoneLine
      ctx.lineWidth = 1
      ctx.strokeRect(px + 0.5, py + 0.5, TILE - 1, TILE - 1)
      ctx.fillStyle = PAL.stoneAlt
      ctx.fillRect(px + 3, py + 3, TILE - 6, 1)
      if (hash2(x, y, 4) > 0.6) {
        ctx.fillStyle = 'rgba(95,224,176,0.10)'
        ctx.fillRect(px + 6, py + TILE - 10, 12, 2)
      }
      break
    }
    case TT.HOUSE: {
      if (above === TT.HOUSE || above === TT.WALL) {
        ctx.fillStyle = PAL.wall
        ctx.fillRect(px, py, TILE, TILE)
        ctx.fillStyle = PAL.wallLit
        ctx.fillRect(px, py, TILE, 3)
        ctx.fillStyle = '#241b17'
        ctx.fillRect(px, py + TILE - 5, TILE, 5)
        if (hash2(x, y, 2) > 0.5) {
          ctx.fillStyle = '#1b1410'
          ctx.fillRect(px + 7, py + 9, 18, 15)
          ctx.fillStyle = 'rgba(242,198,109,0.55)'
          ctx.fillRect(px + 9, py + 11, 14, 11)
          ctx.fillStyle = 'rgba(255,236,190,0.75)'
          ctx.fillRect(px + 9, py + 11, 5, 5)
        }
      } else {
        ctx.fillStyle = PAL.roofDark
        ctx.fillRect(px, py, TILE, TILE)
        for (let i = 0; i < 4; i++) {
          ctx.fillStyle = i % 2 ? PAL.roof : '#7a453a'
          ctx.fillRect(px, py + i * 8 + 2, TILE, 6)
        }
        ctx.fillStyle = '#2c1a16'
        ctx.fillRect(px, py + TILE - 4, TILE, 4)
        ctx.fillStyle = 'rgba(255,255,255,0.07)'
        ctx.fillRect(px + 2, py + 2, TILE - 4, 1)
      }
      break
    }
    case TT.WALL: {
      ctx.fillStyle = '#242a36'
      ctx.fillRect(px, py, TILE, TILE)
      ctx.fillStyle = '#39404f'
      ctx.fillRect(px + 1, py + 1, TILE - 2, TILE - 4)
      ctx.fillStyle = '#2b3140'
      ctx.fillRect(px + 1, py + 13, TILE - 2, 2)
      ctx.fillStyle = 'rgba(242,198,109,0.5)'
      ctx.fillRect(px + 2, py + 2, TILE - 4, 2)
      ctx.fillStyle = 'rgba(0,0,0,0.25)'
      ctx.fillRect(px, py + TILE - 4, TILE, 4)
      break
    }
    case TT.ALTAR: {
      ctx.fillStyle = PAL.stone
      ctx.fillRect(px, py, TILE, TILE)
      ctx.fillStyle = '#3b4354'
      ctx.fillRect(px + 4, py + 10, 24, 20)
      ctx.fillStyle = '#4b5568'
      ctx.fillRect(px + 7, py + 7, 18, 5)
      ctx.strokeStyle = 'rgba(242,198,109,0.85)'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(px + 16, py + 2)
      ctx.lineTo(px + 16, py + 12)
      ctx.moveTo(px + 13, py + 12)
      ctx.lineTo(px + 19, py + 12)
      ctx.stroke()
      break
    }
    case TT.ROCK: {
      paintGrass(ctx, px, py, x, y)
      ctx.fillStyle = PAL.rock
      ctx.beginPath()
      ctx.moveTo(px + 4, py + 26)
      ctx.lineTo(px + 8, py + 12)
      ctx.lineTo(px + 18, py + 8)
      ctx.lineTo(px + 27, py + 16)
      ctx.lineTo(px + 28, py + 27)
      ctx.closePath()
      ctx.fill()
      ctx.fillStyle = PAL.rockLit
      ctx.beginPath()
      ctx.moveTo(px + 8, py + 13)
      ctx.lineTo(px + 18, py + 9)
      ctx.lineTo(px + 20, py + 15)
      ctx.lineTo(px + 11, py + 18)
      ctx.closePath()
      ctx.fill()
      break
    }
    default:
      paintGrass(ctx, px, py, x, y)
  }
}

function buildMapCanvas(world) {
  const canvas = document.createElement('canvas')
  canvas.width = MAP_W * TILE
  canvas.height = MAP_H * TILE
  const ctx = canvas.getContext('2d')
  for (let y = 0; y < MAP_H; y++) {
    for (let x = 0; x < MAP_W; x++) paintTile(ctx, world, x, y)
  }
  return canvas
}

/* ------------------------------------------------------------------ sprites */

function drawHero(ctx, x, y, dir, opts = {}) {
  const { moving = false, phase = 0, t = 0, scale = 1 } = opts
  const bob = moving ? Math.abs(Math.sin(phase * Math.PI)) * 1.6 : Math.sin(t * 2) * 0.7
  const step = moving ? Math.sin(phase * Math.PI * 2) * 2.4 : 0
  ctx.save()
  ctx.translate(x, y + bob)
  ctx.scale(scale, scale)

  ctx.fillStyle = 'rgba(0,0,0,0.4)'
  ctx.beginPath()
  ctx.ellipse(0, 16, 10, 4, 0, 0, Math.PI * 2)
  ctx.fill()

  // legs
  ctx.fillStyle = '#1b2438'
  ctx.fillRect(-6 + step * 0.4, 6, 5, 9)
  ctx.fillRect(1 - step * 0.4, 6, 5, 9)
  ctx.fillStyle = '#0f1524'
  ctx.fillRect(-7 + step * 0.4, 13, 7, 3)
  ctx.fillRect(0 - step * 0.4, 13, 7, 3)

  // robe
  const robe = ctx.createLinearGradient(0, -10, 0, 14)
  robe.addColorStop(0, '#33497a')
  robe.addColorStop(1, '#233356')
  ctx.fillStyle = robe
  ctx.beginPath()
  ctx.moveTo(-8, -6)
  ctx.lineTo(8, -6)
  ctx.lineTo(11, 10)
  ctx.lineTo(-11, 10)
  ctx.closePath()
  ctx.fill()
  ctx.fillStyle = 'rgba(255,255,255,0.08)'
  ctx.fillRect(-2, -5, 3, 14)

  // sash
  ctx.fillStyle = PAL.goldDim
  ctx.fillRect(-9, 1, 18, 3)
  ctx.fillStyle = PAL.gold
  ctx.fillRect(-9, 1, 18, 1)

  // arms
  ctx.fillStyle = '#2b3d66'
  ctx.fillRect(-10, -4, 3, 8)
  ctx.fillRect(7, -4, 3, 8)

  // scarf
  ctx.fillStyle = '#b8454f'
  ctx.beginPath()
  ctx.moveTo(-5, -6)
  ctx.lineTo(3, -6)
  ctx.lineTo(-2, 0)
  ctx.lineTo(-6, -1)
  ctx.closePath()
  ctx.fill()

  // head
  ctx.fillStyle = PAL.skin
  ctx.beginPath()
  ctx.arc(0, -13, 6, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#15111a'
  ctx.beginPath()
  ctx.arc(0, -15, 6.2, Math.PI * 0.95, Math.PI * 2.05)
  ctx.fill()
  ctx.fillStyle = '#15111a'
  ctx.beginPath()
  ctx.arc(0, -20, 2.6, 0, Math.PI * 2)
  ctx.fill()

  if (dir === 'down') {
    ctx.fillStyle = '#1b1620'
    ctx.fillRect(-3.4, -14, 1.6, 1.6)
    ctx.fillRect(1.8, -14, 1.6, 1.6)
    ctx.fillStyle = 'rgba(255,120,120,0.25)'
    ctx.fillRect(-4.6, -11.5, 2.2, 1)
    ctx.fillRect(2.4, -11.5, 2.2, 1)
  } else if (dir === 'left' || dir === 'right') {
    const s = dir === 'left' ? -1 : 1
    ctx.fillStyle = '#1b1620'
    ctx.fillRect(s * 1.2 - 0.8, -14, 1.8, 1.8)
    ctx.fillStyle = PAL.skin
    ctx.fillRect(s * 4.4, -14.5, 1.8, 2.6)
  }

  // sword on the back / hip
  ctx.save()
  ctx.rotate(dir === 'up' ? -0.7 : -0.55)
  ctx.fillStyle = '#2a1c12'
  ctx.fillRect(-15, -2, 4, 4)
  ctx.fillStyle = '#8e99ad'
  ctx.fillRect(-13, -1.4, 17, 2.4)
  ctx.fillStyle = '#d7dfea'
  ctx.fillRect(-13, -1.4, 17, 1)
  ctx.restore()

  ctx.restore()
}

function drawNpc(ctx, npc, t) {
  const palette = {
    elder: { robe: '#5b3040', trim: '#c9a86b', hair: '#d8d4cc' },
    child: { robe: '#3d6b4a', trim: '#d9b45c', hair: '#2a1f16' },
    guard: { robe: '#3d4a5e', trim: '#9fb0c6', hair: '#2a2a30' },
  }[npc.sprite] || { robe: '#444', trim: '#aaa', hair: '#222' }
  const small = npc.sprite === 'child' ? 0.82 : 1
  const bob = Math.sin(t * 1.6 + npc.x) * 0.8
  ctx.save()
  ctx.translate(npc.x * TILE + TILE / 2, npc.y * TILE + TILE / 2 + bob)
  ctx.scale(small, small)

  ctx.fillStyle = 'rgba(0,0,0,0.38)'
  ctx.beginPath()
  ctx.ellipse(0, 16, 9, 3.6, 0, 0, Math.PI * 2)
  ctx.fill()

  if (npc.sprite === 'guard') {
    ctx.fillStyle = '#2c3546'
    ctx.fillRect(-5, 4, 4, 11)
    ctx.fillRect(1, 4, 4, 11)
    ctx.fillStyle = palette.robe
    ctx.beginPath()
    ctx.moveTo(-8, -7)
    ctx.lineTo(8, -7)
    ctx.lineTo(9, 8)
    ctx.lineTo(-9, 8)
    ctx.closePath()
    ctx.fill()
    ctx.fillStyle = palette.trim
    ctx.fillRect(-8, -3, 16, 2)
    ctx.fillStyle = '#20262f'
    ctx.fillRect(-6, -20, 12, 8)
    ctx.fillStyle = palette.trim
    ctx.fillRect(-6, -13, 12, 2)
    ctx.fillRect(-1, -22, 2, 4)
    // spear
    ctx.fillStyle = '#5a3f28'
    ctx.fillRect(11, -22, 2, 34)
    ctx.fillStyle = '#c8d3e2'
    ctx.beginPath()
    ctx.moveTo(12, -30)
    ctx.lineTo(15, -22)
    ctx.lineTo(9, -22)
    ctx.closePath()
    ctx.fill()
  } else {
    ctx.fillStyle = palette.robe
    ctx.beginPath()
    ctx.moveTo(-8, -6)
    ctx.lineTo(8, -6)
    ctx.lineTo(10, 11)
    ctx.lineTo(-10, 11)
    ctx.closePath()
    ctx.fill()
    ctx.fillStyle = palette.trim
    ctx.fillRect(-9, 0, 18, 2)
    ctx.fillStyle = PAL.skin
    ctx.beginPath()
    ctx.arc(0, -13, 5.6, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = palette.hair
    ctx.beginPath()
    ctx.arc(0, -15, 5.8, Math.PI * 0.9, Math.PI * 2.1)
    ctx.fill()
    if (npc.sprite === 'elder') {
      ctx.beginPath()
      ctx.arc(0, -20, 2.6, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = '#3a2a1c'
      ctx.fillRect(9, -8, 2, 20)
    } else {
      ctx.fillStyle = '#1b1620'
      ctx.fillRect(-2.2, -14, 1.4, 1.4)
      ctx.fillRect(1, -14, 1.4, 1.4)
    }
  }
  ctx.restore()
}

/* ------------------------------------------------------------------ enemies */

function enemyFlash(ctx, flash, w, h) {
  if (flash <= 0) return
  ctx.save()
  ctx.globalAlpha = clamp(flash, 0, 1) * 0.7
  ctx.globalCompositeOperation = 'lighter'
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(-w / 2, -h, w, h * 1.2)
  ctx.restore()
}

function drawBambooSpirit(ctx, t, flash) {
  const sway = Math.sin(t * 1.4) * 3
  ctx.save()
  ctx.translate(0, sway)
  // stalks
  for (let i = -1; i <= 1; i++) {
    const sx = i * 22
    const hgt = 120 - Math.abs(i) * 22
    ctx.fillStyle = i === 0 ? '#2f6b4d' : '#275c43'
    ctx.fillRect(sx - 5, -hgt, 10, hgt)
    ctx.fillStyle = 'rgba(0,0,0,0.25)'
    for (let s = -hgt + 12; s < 0; s += 18) ctx.fillRect(sx - 5, s, 10, 2)
    ctx.fillStyle = '#5fe0b0'
    ctx.fillRect(sx - 5, -hgt, 2, hgt)
    // leaves
    ctx.fillStyle = '#3d8a63'
    ctx.beginPath()
    ctx.ellipse(sx + (i >= 0 ? 12 : -12), -hgt + 16, 14, 4, i >= 0 ? -0.4 : 0.4, 0, Math.PI * 2)
    ctx.fill()
  }
  // face
  ctx.fillStyle = 'rgba(8,20,16,0.85)'
  ctx.beginPath()
  ctx.ellipse(0, -74, 20, 24, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = PAL.jade
  ctx.shadowColor = PAL.jade
  ctx.shadowBlur = 14
  ctx.beginPath()
  ctx.ellipse(-7, -78, 3.4, 5, 0, 0, Math.PI * 2)
  ctx.ellipse(7, -78, 3.4, 5, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.shadowBlur = 0
  ctx.fillStyle = 'rgba(95,224,176,0.25)'
  ctx.beginPath()
  ctx.ellipse(0, -20, 44, 10, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
  enemyFlash(ctx, flash, 80, 130)
}

function drawMistWolf(ctx, t, flash) {
  const bob = Math.sin(t * 2.2) * 2
  ctx.save()
  ctx.translate(0, bob)
  ctx.fillStyle = 'rgba(0,0,0,0.35)'
  ctx.beginPath()
  ctx.ellipse(0, 2, 60, 10, 0, 0, Math.PI * 2)
  ctx.fill()
  // legs
  ctx.fillStyle = '#242b3a'
  for (const lx of [-32, -18, 16, 30]) ctx.fillRect(lx, -24, 7, 28)
  // body
  ctx.fillStyle = '#39445a'
  ctx.beginPath()
  ctx.ellipse(0, -44, 46, 26, -0.05, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#4a5670'
  ctx.beginPath()
  ctx.ellipse(-6, -50, 34, 16, -0.08, 0, Math.PI * 2)
  ctx.fill()
  // head
  ctx.fillStyle = '#3e4a61'
  ctx.beginPath()
  ctx.ellipse(40, -62, 20, 15, 0.12, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.moveTo(50, -70)
  ctx.lineTo(74, -58)
  ctx.lineTo(48, -52)
  ctx.closePath()
  ctx.fill()
  // ears
  ctx.beginPath()
  ctx.moveTo(30, -74)
  ctx.lineTo(34, -90)
  ctx.lineTo(43, -76)
  ctx.closePath()
  ctx.fill()
  // tail
  ctx.strokeStyle = '#39445a'
  ctx.lineWidth = 10
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(-44, -46)
  ctx.quadraticCurveTo(-74, -62, -66, -84)
  ctx.stroke()
  // eyes
  ctx.fillStyle = '#a8e8ff'
  ctx.shadowColor = '#7fd3ff'
  ctx.shadowBlur = 12
  ctx.fillRect(48, -66, 6, 3)
  ctx.shadowBlur = 0
  // mist
  ctx.fillStyle = 'rgba(160,200,220,0.12)'
  for (let i = 0; i < 3; i++) {
    ctx.beginPath()
    ctx.ellipse(-60 + i * 46, -6 + Math.sin(t + i) * 3, 40, 6, 0, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.restore()
  enemyFlash(ctx, flash, 90, 100)
}

function drawGuardian(ctx, t, flash, enraged) {
  const float = Math.sin(t * 1.1) * 6
  ctx.save()
  ctx.translate(0, float)
  // aura
  const aura = ctx.createRadialGradient(0, -90, 10, 0, -90, 120)
  aura.addColorStop(0, enraged ? 'rgba(224,87,95,0.30)' : 'rgba(95,224,176,0.24)')
  aura.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = aura
  ctx.beginPath()
  ctx.arc(0, -90, 120, 0, Math.PI * 2)
  ctx.fill()

  // rotating rings
  for (let i = 0; i < 2; i++) {
    ctx.save()
    ctx.translate(0, -90)
    ctx.rotate(t * (i ? -0.5 : 0.35))
    ctx.strokeStyle = enraged ? 'rgba(224,87,95,0.55)' : 'rgba(95,224,176,0.45)'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.ellipse(0, 0, 74 + i * 14, 20 + i * 6, 0, 0, Math.PI * 2)
    ctx.stroke()
    ctx.restore()
  }

  // skirt / base
  ctx.fillStyle = '#1e3a34'
  ctx.beginPath()
  ctx.moveTo(-40, -28)
  ctx.lineTo(40, -28)
  ctx.lineTo(26, -128)
  ctx.lineTo(-26, -128)
  ctx.closePath()
  ctx.fill()
  ctx.fillStyle = '#2b5a4c'
  ctx.fillRect(-30, -120, 10, 90)
  ctx.fillRect(20, -120, 10, 90)

  // torso
  ctx.fillStyle = '#356b5a'
  ctx.beginPath()
  ctx.moveTo(-34, -140)
  ctx.lineTo(34, -140)
  ctx.lineTo(40, -96)
  ctx.lineTo(-40, -96)
  ctx.closePath()
  ctx.fill()
  ctx.fillStyle = PAL.jade
  ctx.globalAlpha = 0.25
  ctx.fillRect(-24, -132, 48, 6)
  ctx.globalAlpha = 1

  // pauldrons
  ctx.fillStyle = '#1f4a3e'
  ctx.beginPath()
  ctx.ellipse(-42, -136, 16, 12, -0.3, 0, Math.PI * 2)
  ctx.ellipse(42, -136, 16, 12, 0.3, 0, Math.PI * 2)
  ctx.fill()

  // helmet
  ctx.fillStyle = '#2b5a4c'
  ctx.beginPath()
  ctx.moveTo(-18, -160)
  ctx.lineTo(18, -160)
  ctx.lineTo(16, -142)
  ctx.lineTo(-16, -142)
  ctx.closePath()
  ctx.fill()
  ctx.fillStyle = '#0f231e'
  ctx.fillRect(-14, -154, 28, 6)
  ctx.fillStyle = enraged ? PAL.crimson : PAL.jade
  ctx.shadowColor = enraged ? PAL.crimson : PAL.jade
  ctx.shadowBlur = 14
  ctx.fillRect(-12, -153, 8, 4)
  ctx.fillRect(4, -153, 8, 4)
  ctx.shadowBlur = 0

  // crown
  ctx.fillStyle = PAL.gold
  ctx.beginPath()
  ctx.moveTo(-16, -160)
  ctx.lineTo(-8, -172)
  ctx.lineTo(0, -162)
  ctx.lineTo(8, -172)
  ctx.lineTo(16, -160)
  ctx.closePath()
  ctx.fill()

  // sword held low
  ctx.save()
  ctx.translate(48, -110)
  ctx.rotate(0.35 + Math.sin(t) * 0.03)
  ctx.fillStyle = '#9fe8cc'
  ctx.fillRect(-4, 0, 8, 96)
  ctx.fillStyle = 'rgba(255,255,255,0.65)'
  ctx.fillRect(-4, 0, 3, 96)
  ctx.fillStyle = PAL.gold
  ctx.fillRect(-12, -6, 24, 6)
  ctx.restore()

  ctx.restore()
  enemyFlash(ctx, flash, 100, 180)
}

/* ------------------------------------------------------------------ renderer */

export class Renderer {
  constructor(canvas, world) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')
    this.world = world
    this.mapCanvas = buildMapCanvas(world)
    this.dpr = 1
    this.w = 0
    this.h = 0
    this.layout = { groundY: 0, enemyX: 0, enemyY: 0, playerX: 0, playerY: 0, scale: 1 }
    this.fireflies = Array.from({ length: 44 }, (_, i) => ({
      x: (hash2(i, 3, 1) * 0.86 + 0.07) * MAP_W * TILE,
      y: (hash2(i, 7, 2) * 0.72 + 0.1) * MAP_H * TILE,
      phase: hash2(i, 11, 3) * Math.PI * 2,
    }))
    this.petals = Array.from({ length: 34 }, (_, i) => ({
      x: hash2(i, 2, 5),
      y: hash2(i, 5, 6),
      speed: 0.35 + hash2(i, 8, 7) * 0.7,
      size: 2 + hash2(i, 9, 8) * 3,
      phase: hash2(i, 12, 9) * Math.PI * 2,
    }))
    this.vignette = null
    this.resize()
  }

  resize() {
    const rect = this.canvas.getBoundingClientRect()
    this.dpr = Math.min(window.devicePixelRatio || 1, 2)
    this.w = Math.max(320, Math.round(rect.width) || window.innerWidth)
    this.h = Math.max(320, Math.round(rect.height) || window.innerHeight)
    this.canvas.width = Math.round(this.w * this.dpr)
    this.canvas.height = Math.round(this.h * this.dpr)
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0)

    const compact = this.w < 780 || this.h < 640
    const panel = compact ? Math.min(310, this.h * 0.4) : Math.min(280, this.h * 0.3)
    const scale = clamp(Math.min(this.w / 1120, this.h / 780), 0.52, 1.3)
    this.layout = {
      groundY: this.h - panel - (compact ? 34 : 14),
      enemyX: compact ? this.w * 0.64 : this.w * 0.68,
      enemyY: this.h - panel - (compact ? 52 : 26),
      playerX: compact ? this.w * 0.24 : this.w * 0.25,
      playerY: this.h - panel - (compact ? 30 : 10),
      scale,
      compact,
    }

    const g = this.ctx.createRadialGradient(
      this.w * 0.5, this.h * 0.46, Math.min(this.w, this.h) * 0.25,
      this.w * 0.5, this.h * 0.5, Math.max(this.w, this.h) * 0.78,
    )
    g.addColorStop(0, 'rgba(0,0,0,0)')
    g.addColorStop(0.68, 'rgba(3,6,12,0.28)')
    g.addColorStop(1, 'rgba(3,6,12,0.82)')
    this.vignette = g
  }

  begin() {
    const ctx = this.ctx
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0)
    ctx.clearRect(0, 0, this.w, this.h)
    ctx.imageSmoothingEnabled = true
    return ctx
  }

  drawWorld(game, t) {
    const ctx = this.begin()
    const cam = game.cam
    ctx.fillStyle = PAL.night
    ctx.fillRect(0, 0, this.w, this.h)

    ctx.save()
    ctx.translate(-cam.x, -cam.y)
    ctx.drawImage(this.mapCanvas, 0, 0)

    // Altar glow.
    const ax = this.world.altar.x * TILE + TILE / 2
    const ay = this.world.altar.y * TILE + TILE / 2
    const pulse = 0.6 + Math.sin(t * 1.8) * 0.15
    const glow = ctx.createRadialGradient(ax, ay, 4, ax, ay, 120)
    glow.addColorStop(0, `rgba(242,198,109,${0.32 * pulse})`)
    glow.addColorStop(0.45, `rgba(95,224,176,${0.1 * pulse})`)
    glow.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = glow
    ctx.beginPath()
    ctx.arc(ax, ay, 120, 0, Math.PI * 2)
    ctx.fill()

    const entities = [
      ...this.world.npcs.map((npc) => ({ kind: 'npc', npc, px: npc.x * TILE + TILE / 2, py: npc.y * TILE + TILE / 2 })),
      { kind: 'player', px: game.player.px, py: game.player.py },
    ].sort((a, b) => a.py - b.py)

    for (const entity of entities) {
      if (entity.kind === 'player') {
        drawHero(ctx, entity.px, entity.py + 6, game.player.dir, {
          moving: game.player.moving,
          phase: game.player.phase,
          t,
          scale: 1.08,
        })
      } else {
        drawNpc(ctx, entity.npc, t)
      }
    }

    // Fireflies.
    for (const fly of this.fireflies) {
      const fx = fly.x + Math.sin(t * 0.8 + fly.phase) * 14
      const fy = fly.y + Math.cos(t * 0.6 + fly.phase) * 10
      if (fx < cam.x - 20 || fx > cam.x + this.w + 20 || fy < cam.y - 20 || fy > cam.y + this.h + 20) continue
      const alpha = 0.35 + 0.35 * Math.sin(t * 2 + fly.phase)
      ctx.fillStyle = `rgba(190,240,190,${alpha})`
      ctx.beginPath()
      ctx.arc(fx, fy, 1.6, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.restore()

    ctx.fillStyle = this.vignette
    ctx.fillRect(0, 0, this.w, this.h)
  }

  drawTitle(t) {
    const ctx = this.begin()
    const w = this.w
    const h = this.h
    const sky = ctx.createLinearGradient(0, 0, 0, h)
    sky.addColorStop(0, '#060a15')
    sky.addColorStop(0.45, '#0c1730')
    sky.addColorStop(0.78, '#1b2b46')
    sky.addColorStop(1, '#0a1220')
    ctx.fillStyle = sky
    ctx.fillRect(0, 0, w, h)

    // stars
    for (let i = 0; i < 110; i++) {
      const sx = hash2(i, 1, 21) * w
      const sy = hash2(i, 4, 22) * h * 0.62
      const a = 0.15 + 0.55 * hash2(i, 6, 23) * (0.7 + 0.3 * Math.sin(t * 1.4 + i))
      ctx.fillStyle = `rgba(215,230,255,${a})`
      ctx.fillRect(sx, sy, 1.4, 1.4)
    }

    // moon
    const mx = w * 0.72
    const my = h * 0.27
    const mr = Math.min(w, h) * 0.115
    const halo = ctx.createRadialGradient(mx, my, mr * 0.4, mx, my, mr * 3.4)
    halo.addColorStop(0, 'rgba(242,214,150,0.30)')
    halo.addColorStop(0.5, 'rgba(242,198,109,0.10)')
    halo.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = halo
    ctx.beginPath()
    ctx.arc(mx, my, mr * 3.4, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#f4e3bb'
    ctx.beginPath()
    ctx.arc(mx, my, mr, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = 'rgba(206,186,143,0.45)'
    for (let i = 0; i < 5; i++) {
      ctx.beginPath()
      ctx.arc(mx + (hash2(i, 2, 31) - 0.5) * mr * 1.1, my + (hash2(i, 5, 32) - 0.5) * mr * 1.1, mr * (0.08 + hash2(i, 8, 33) * 0.14), 0, Math.PI * 2)
      ctx.fill()
    }

    // clouds
    ctx.fillStyle = 'rgba(30,44,70,0.55)'
    for (let i = 0; i < 4; i++) {
      const cy = h * (0.3 + i * 0.06)
      const off = (t * (6 + i * 3) + i * 220) % (w + 500)
      ctx.beginPath()
      ctx.ellipse(off - 250, cy, 190, 16, 0, 0, Math.PI * 2)
      ctx.fill()
    }

    // mountains, three layers
    const layers = [
      { y: h * 0.62, color: '#14213a', peaks: 5, amp: h * 0.14 },
      { y: h * 0.7, color: '#0f1a2e', peaks: 4, amp: h * 0.1 },
      { y: h * 0.79, color: '#0a1222', peaks: 3, amp: h * 0.07 },
    ]
    for (const layer of layers) {
      ctx.fillStyle = layer.color
      ctx.beginPath()
      ctx.moveTo(0, h)
      ctx.lineTo(0, layer.y)
      for (let i = 0; i <= layer.peaks; i++) {
        const px = (w / layer.peaks) * i
        const py = layer.y - (i % 2 === 0 ? layer.amp : layer.amp * 0.4)
        ctx.quadraticCurveTo(px - w / layer.peaks / 2, layer.y - layer.amp * 0.55, px, py)
      }
      ctx.lineTo(w, h)
      ctx.closePath()
      ctx.fill()
    }

    // bamboo silhouettes on the edges
    ctx.strokeStyle = '#0a141f'
    ctx.lineWidth = 7
    for (let i = 0; i < 7; i++) {
      const bx = i < 4 ? w * (0.02 + i * 0.035) : w * (0.86 + (i - 4) * 0.032)
      const lean = Math.sin(t * 0.6 + i) * 3
      ctx.beginPath()
      ctx.moveTo(bx, h * 1.02)
      ctx.quadraticCurveTo(bx + lean, h * 0.6, bx + lean * 1.6, h * 0.08)
      ctx.stroke()
      ctx.fillStyle = '#0a141f'
      for (let l = 0; l < 4; l++) {
        ctx.beginPath()
        ctx.ellipse(bx + lean + (l % 2 ? 16 : -16), h * (0.25 + l * 0.14), 22, 4, l % 2 ? -0.4 : 0.4, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    // lone swordsman
    ctx.save()
    ctx.translate(w * 0.63, h * 0.87)
    ctx.scale(1.5, 1.5)
    ctx.fillStyle = 'rgba(0,0,0,0.5)'
    ctx.beginPath()
    ctx.ellipse(0, 14, 16, 4, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#060a12'
    ctx.beginPath()
    ctx.moveTo(-8, -18)
    ctx.lineTo(8, -18)
    ctx.lineTo(12, 12)
    ctx.lineTo(-12, 12)
    ctx.closePath()
    ctx.fill()
    ctx.beginPath()
    ctx.arc(0, -24, 6, 0, Math.PI * 2)
    ctx.fill()
    ctx.save()
    ctx.rotate(-0.8)
    ctx.fillStyle = '#060a12'
    ctx.fillRect(-2, -46, 3, 46)
    ctx.restore()
    ctx.restore()

    // petals
    for (const petal of this.petals) {
      const px = ((petal.x + t * 0.012 * petal.speed) % 1) * w
      const py = ((petal.y + t * 0.02 * petal.speed) % 1) * h
      const drift = Math.sin(t * 0.9 + petal.phase) * 18
      ctx.fillStyle = 'rgba(240,190,170,0.55)'
      ctx.beginPath()
      ctx.ellipse(px + drift, py, petal.size, petal.size * 0.55, petal.phase + t * 0.4, 0, Math.PI * 2)
      ctx.fill()
    }

    // fog at the base
    const fog = ctx.createLinearGradient(0, h * 0.72, 0, h)
    fog.addColorStop(0, 'rgba(10,18,32,0)')
    fog.addColorStop(1, 'rgba(8,14,26,0.95)')
    ctx.fillStyle = fog
    ctx.fillRect(0, h * 0.72, w, h * 0.28)

    ctx.fillStyle = this.vignette
    ctx.fillRect(0, 0, w, h)
  }

  drawCombat(game, t) {
    const ctx = this.begin()
    const { w, h } = this
    const combat = game.combat
    const L = this.layout

    const sky = ctx.createLinearGradient(0, 0, 0, L.groundY + 60)
    sky.addColorStop(0, combat.boss ? '#170b18' : '#080d1a')
    sky.addColorStop(0.55, combat.boss ? '#2a1320' : '#111e33')
    sky.addColorStop(1, combat.boss ? '#3a1a24' : '#1b2c42')
    ctx.fillStyle = sky
    ctx.fillRect(0, 0, w, h)

    const mx = w * 0.78
    const my = h * 0.2
    const mr = Math.min(w, h) * 0.09
    const halo = ctx.createRadialGradient(mx, my, mr * 0.4, mx, my, mr * 3)
    halo.addColorStop(0, combat.boss ? 'rgba(224,87,95,0.28)' : 'rgba(242,214,150,0.24)')
    halo.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = halo
    ctx.beginPath()
    ctx.arc(mx, my, mr * 3, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = combat.boss ? '#f0c0b6' : '#f2e2bb'
    ctx.beginPath()
    ctx.arc(mx, my, mr, 0, Math.PI * 2)
    ctx.fill()

    // mountains
    ctx.fillStyle = '#0b1322'
    ctx.beginPath()
    ctx.moveTo(0, L.groundY)
    ctx.lineTo(0, h * 0.52)
    for (let i = 0; i <= 4; i++) {
      const px = (w / 4) * i
      ctx.quadraticCurveTo(px - w / 8, h * 0.44, px, h * 0.52 - (i % 2 ? 40 : 90))
    }
    ctx.lineTo(w, L.groundY)
    ctx.closePath()
    ctx.fill()

    // bamboo silhouettes
    ctx.strokeStyle = 'rgba(8,18,28,0.85)'
    ctx.lineWidth = 6
    for (let i = 0; i < 9; i++) {
      const bx = (i / 8) * w
      const top = h * (0.18 + hash2(i, 3, 41) * 0.2)
      ctx.beginPath()
      ctx.moveTo(bx, L.groundY + 30)
      ctx.quadraticCurveTo(bx + 10, h * 0.5, bx + Math.sin(t * 0.7 + i) * 6, top)
      ctx.stroke()
    }

    // ground
    const ground = ctx.createLinearGradient(0, L.groundY - 40, 0, h)
    ground.addColorStop(0, combat.boss ? '#2a1720' : '#152437')
    ground.addColorStop(1, '#05080f')
    ctx.fillStyle = ground
    ctx.fillRect(0, L.groundY - 40, w, h - L.groundY + 40)

    // mist
    for (let i = 0; i < 3; i++) {
      ctx.fillStyle = 'rgba(190,220,240,0.05)'
      ctx.beginPath()
      ctx.ellipse(w * 0.5 + Math.sin(t * 0.3 + i) * 60, L.groundY + i * 16, w * 0.42, 12, 0, 0, Math.PI * 2)
      ctx.fill()
    }

    const shake = combat.shake || 0
    const sx = (Math.random() - 0.5) * 14 * shake
    const sy = (Math.random() - 0.5) * 8 * shake

    // player
    ctx.save()
    ctx.translate(L.playerX + sx * 0.4, L.playerY + sy)
    ctx.scale(L.scale, L.scale)
    ctx.fillStyle = 'rgba(0,0,0,0.45)'
    ctx.beginPath()
    ctx.ellipse(0, 14, 18, 5, 0, 0, Math.PI * 2)
    ctx.fill()
    drawHero(ctx, 0, 0, 'up', { t, scale: 1.3 })
    if (combat.guard > 0) {
      ctx.strokeStyle = 'rgba(95,224,176,0.75)'
      ctx.lineWidth = 2.5
      ctx.beginPath()
      ctx.arc(0, -14, 30, 0, Math.PI * 2)
      ctx.stroke()
      ctx.fillStyle = 'rgba(95,224,176,0.12)'
      ctx.fill()
    }
    ctx.restore()

    // enemy
    ctx.save()
    const breathe = 1 + Math.sin(t * 2) * 0.015
    ctx.translate(L.enemyX + sx, L.enemyY + sy)
    ctx.scale(L.scale * breathe, L.scale * breathe)
    if (combat.sprite === 'bamboo') drawBambooSpirit(ctx, t, combat.flash)
    else if (combat.sprite === 'wolf') drawMistWolf(ctx, t, combat.flash)
    else drawGuardian(ctx, t, combat.flash, combat.enraged)
    ctx.restore()

    this.drawCombatFx(ctx, combat, t)
    ctx.fillStyle = this.vignette
    ctx.fillRect(0, 0, w, h)
  }

  drawCombatFx(ctx, combat, t) {
    for (const fx of combat.fx || []) {
      const p = 1 - fx.life / fx.maxLife
      ctx.save()
      ctx.globalAlpha = Math.max(0, Math.min(1, fx.life / fx.maxLife * 1.6))
      const y = fx.y - p * 52
      ctx.font = `700 ${Math.round(fx.size * (1 + p * 0.15))}px ui-serif, Georgia, serif`
      ctx.textAlign = 'center'
      ctx.lineWidth = 4
      ctx.strokeStyle = 'rgba(4,7,12,0.85)'
      ctx.strokeText(fx.text, fx.x, y)
      ctx.fillStyle = fx.color
      ctx.fillText(fx.text, fx.x, y)
      ctx.restore()
    }
    if (combat.hintFx) {
      ctx.save()
      ctx.globalAlpha = Math.min(1, combat.hintFx.life)
      ctx.font = '600 14px ui-sans-serif, system-ui, sans-serif'
      ctx.textAlign = 'center'
      ctx.fillStyle = 'rgba(242,198,109,0.85)'
      ctx.fillText(combat.hintFx.text, this.w / 2, this.layout.groundY - 120)
      ctx.restore()
    }
  }
}
