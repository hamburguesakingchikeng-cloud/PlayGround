import * as THREE from 'three'
import { ZONES } from '../data/zones.js'
import { ZONE_SPAWNS } from '../data/enemies.js'
import { Enemy } from '../entities/Enemy.js'
import { Creature } from '../entities/Creature.js'
import { NPC } from '../entities/NPC.js'
import { createNameTag } from './models.js'
import { clamp, rand, TAU } from '../utils/math.js'

const CREATURE_SPAWNS = {
  valdoria: [
    ['lumifin', -34, -44], ['lumifin', -24, -37], ['bramiel', -43, -53],
    ['grimpola', 44, 43], ['grimpola', 30, 48]
  ],
  drakmor: [
    ['brasal', 35, 14], ['brasal', -39, 31], ['umbrino', -52, -31],
    ['cineronte', 27, -51]
  ],
  kansordore: [
    ['petreluz', 45, 27], ['petreluz', -56, 25], ['celemn', 10, -52]
  ]
}

const ZONE_LEVEL = { valdoria: 1, drakmor: 4, kansordore: 8 }

function rng(seed) {
  let s = seed >>> 0
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 4294967296
  }
}

function std(color, opts = {}) {
  return new THREE.MeshStandardMaterial({
    color, roughness: .86, metalness: .04, flatShading: true, ...opts
  })
}

function glow(color, opacity = .8) {
  return new THREE.MeshBasicMaterial({
    color, transparent: true, opacity, blending: THREE.AdditiveBlending,
    depthWrite: false, side: THREE.DoubleSide
  })
}

function box(w, h, d, material, x = 0, y = 0, z = 0) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material)
  m.position.set(x, y, z)
  m.castShadow = true
  m.receiveShadow = true
  return m
}

function cyl(rt, rb, h, seg, material, x = 0, y = 0, z = 0) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), material)
  m.position.set(x, y, z)
  m.castShadow = true
  m.receiveShadow = true
  return m
}

function cone(r, h, seg, material, x = 0, y = 0, z = 0) {
  const m = new THREE.Mesh(new THREE.ConeGeometry(r, h, seg), material)
  m.position.set(x, y, z)
  m.castShadow = true
  m.receiveShadow = true
  return m
}

function sphere(r, material, x = 0, y = 0, z = 0, seg = 8) {
  const m = new THREE.Mesh(new THREE.SphereGeometry(r, seg, Math.max(4, seg - 2)), material)
  m.position.set(x, y, z)
  m.castShadow = true
  m.receiveShadow = true
  return m
}

function makeSunTexture() {
  const c = document.createElement('canvas')
  c.width = 128; c.height = 128
  const ctx = c.getContext('2d')
  const g = ctx.createRadialGradient(64, 64, 4, 64, 64, 62)
  g.addColorStop(0, 'rgba(255,255,255,1)')
  g.addColorStop(.22, 'rgba(255,245,210,.95)')
  g.addColorStop(.5, 'rgba(255,220,150,.35)')
  g.addColorStop(1, 'rgba(255,200,100,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 128, 128)
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

export function buildSky(scene, palette, radius = 280) {
  const uniforms = {
    topColor: { value: new THREE.Color(palette.skyTop) },
    bottomColor: { value: new THREE.Color(palette.skyBottom) },
    offset: { value: 18 },
    exponent: { value: .72 }
  }
  const sky = new THREE.Mesh(
    new THREE.SphereGeometry(radius, 32, 20),
    new THREE.ShaderMaterial({
      uniforms,
      side: THREE.BackSide,
      depthWrite: false,
      vertexShader: `
        varying vec3 vWorld;
        void main() {
          vec4 world = modelMatrix * vec4(position, 1.0);
          vWorld = world.xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }`,
      fragmentShader: `
        uniform vec3 topColor;
        uniform vec3 bottomColor;
        uniform float offset;
        uniform float exponent;
        varying vec3 vWorld;
        void main() {
          float h = normalize(vWorld + vec3(0.0, offset, 0.0)).y;
          float t = pow(max(h * 0.5 + 0.5, 0.0), exponent);
          gl_FragColor = vec4(mix(bottomColor, topColor, t), 1.0);
        }`
    })
  )
  sky.frustumCulled = false
  scene.add(sky)

  const sunTex = makeSunTexture()
  const sun = new THREE.Sprite(new THREE.SpriteMaterial({
    map: sunTex, color: palette.sun, transparent: true, opacity: .9,
    depthWrite: false, blending: THREE.AdditiveBlending
  }))
  sun.scale.set(38, 38, 1)
  sun.position.fromArray(palette.sunPos)
  if (sun.position.length() > radius * .85) sun.position.normalize().multiplyScalar(radius * .82)
  scene.add(sun)

  scene.background = new THREE.Color(palette.skyBottom)
  scene.fog = new THREE.FogExp2(palette.fog, palette.fogDensity)
  return { sky, sun, sunTex }
}

export function buildLights(scene, palette, shadows = true) {
  const hemi = new THREE.HemisphereLight(palette.hemiSky, palette.hemiGround, palette.hemiIntensity)
  scene.add(hemi)
  const ambient = new THREE.AmbientLight(palette.ambient, .55)
  scene.add(ambient)
  const dir = new THREE.DirectionalLight(palette.sun, 2.1)
  dir.position.fromArray(palette.sunPos)
  dir.castShadow = shadows
  if (shadows) {
    dir.shadow.mapSize.set(2048, 2048)
    dir.shadow.camera.near = 1
    dir.shadow.camera.far = 220
    dir.shadow.camera.left = -70
    dir.shadow.camera.right = 70
    dir.shadow.camera.top = 70
    dir.shadow.camera.bottom = -70
    dir.shadow.bias = -.0007
    dir.shadow.normalBias = .03
  }
  scene.add(dir)
  const target = new THREE.Object3D()
  target.position.set(0, 0, 0)
  scene.add(target)
  dir.target = target
  return { hemi, ambient, dir, target }
}

export class World {
  constructor(game, zoneId) {
    this.game = game
    this.zoneId = zoneId
    this.zone = ZONES[zoneId]
    if (!this.zone) throw new Error(`Región desconocida: ${zoneId}`)
    this.group = new THREE.Group()
    this.group.name = `world-${zoneId}`
    game.scene.add(this.group)

    this.time = 0
    this.quality = game.settings.quality
    this.enemies = []
    this.enemySpawns = []
    this.respawnQueue = []
    this.creatureSpawns = []
    this.npcs = []
    this.waypoints = []
    this.portals = []
    this.interactables = []
    this.colliders = []
    this.reserved = []
    this.flames = []
    this.floaters = []
    this.spinners = []
    this.focus = null
    this.bossArenaLock = null
    this.gotoTimer = 0
    this.rand = rng(zoneId.split('').reduce((a, c) => a + c.charCodeAt(0), 17))

    this.buildEnvironment()
    this.buildTerrain()
    this.buildLandmarks()
    this.buildWaypoints()
    this.buildPortals()
    this.buildInteractables()
    this.buildNPCs()
    this.buildProps()
    this.buildMotes()
    this.buildCreatures()
    this.buildEnemies()
  }

  // ───────────────────────────── Entorno ─────────────────────────────
  buildEnvironment() {
    const p = this.zone.palette
    this.sky = buildSky(this.game.scene, p)
    this.lights = buildLights(this.game.scene, p, this.quality !== 'baja')
    this.buildDistantLandscape()
    this.buildWater()
  }

  buildDistantLandscape() {
    const p = this.zone.palette
    const b = this.zone.bounds
    const r = this.rand
    const material = std(this.zoneId === 'drakmor' ? 0x2c2326 : this.zoneId === 'kansordore' ? 0x59627e : 0x33473d, { roughness: 1 })
    for (let i = 0; i < 26; i++) {
      const a = (i / 26) * TAU + r() * .12
      const dist = b + 26 + r() * 55
      const h = 8 + r() * 27
      const m = cone(7 + r() * 9, h, 5, material, Math.cos(a) * dist, -4 + h / 2, Math.sin(a) * dist)
      m.castShadow = false
      this.group.add(m)
      if (this.zoneId === 'kansordore' && i % 3 === 0) {
        const isle = new THREE.Group()
        isle.position.set(Math.cos(a) * (b + 5 + r() * 18), 9 + r() * 12, Math.sin(a) * (b + 5 + r() * 18))
        isle.add(cyl(2.4 + r() * 2.4, 1.1, 1.2, 6, std(0x7e849c), 0, 0, 0))
        isle.add(cone(1.1, 2.8, 5, std(0x9aa0b4), 0, -1.7, 0))
        isle.add(sphere(1.4, std(0x6d7f8f, { emissive: p.accent, emissiveIntensity: .08 }), 0, 1.2, 0, 6))
        isle.userData.baseY = isle.position.y
        isle.userData.speed = .3 + r() * .4
        this.group.add(isle)
        this.floaters.push(isle)
      }
    }
  }

  buildWater() {
    const p = this.zone.palette
    const size = this.zone.bounds * 2.4
    const isLava = this.zoneId === 'drakmor'
    const y = isLava ? -2.35 : this.zoneId === 'kansordore' ? -3.6 : -2.55
    const mat = new THREE.MeshStandardMaterial({
      color: p.water,
      roughness: isLava ? .4 : .22,
      metalness: isLava ? .1 : .35,
      transparent: true,
      opacity: isLava ? .96 : this.zoneId === 'kansordore' ? .5 : .84,
      emissive: isLava ? p.water : 0x000000,
      emissiveIntensity: isLava ? .42 : 0
    })
    const water = new THREE.Mesh(new THREE.PlaneGeometry(size, size, 1, 1), mat)
    water.rotation.x = -Math.PI / 2
    water.position.y = y
    water.receiveShadow = false
    this.group.add(water)
    this.water = water
    if (this.zoneId === 'kansordore') {
      const cloud = new THREE.Mesh(new THREE.PlaneGeometry(size * 2, size * 2), new THREE.MeshBasicMaterial({
        color: 0xdce8ff, transparent: true, opacity: .18, depthWrite: false
      }))
      cloud.rotation.x = -Math.PI / 2
      cloud.position.y = y - 1.4
      this.group.add(cloud)
      this.cloudSea = cloud
    }
  }

  buildTerrain() {
    const zone = this.zone
    const size = zone.bounds * 2
    const seg = this.quality === 'alta' ? 160 : this.quality === 'media' ? 120 : this.quality === 'baja' ? 78 : 136
    const geo = new THREE.PlaneGeometry(size, size, seg, seg)
    geo.rotateX(-Math.PI / 2)
    const pos = geo.attributes.position
    const colors = []
    const cGround = new THREE.Color(zone.palette.ground)
    const cGround2 = new THREE.Color(zone.palette.ground2)
    const cRock = new THREE.Color(zone.palette.rock)
    const cWater = new THREE.Color(zone.palette.water)
    const tmp = new THREE.Color()
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i), z = pos.getZ(i)
      const h = zone.heightAt(x, z)
      pos.setY(i, h)
      const alt = clamp((h + 2) / 14, 0, 1)
      tmp.copy(cGround).lerp(cGround2, alt)
      if (h > 5.5) tmp.lerp(cRock, clamp((h - 5.5) / 8, 0, .7))
      if (zone.isWater?.(x, z) && h < -1.1) tmp.lerp(cWater, .65)
      const variation = .88 + (Math.sin(x * 1.7 + z * 2.3) * .5 + .5) * .2
      tmp.multiplyScalar(variation)
      colors.push(tmp.r, tmp.g, tmp.b)
    }
    geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))
    geo.computeVertexNormals()
    const mat = new THREE.MeshStandardMaterial({
      vertexColors: true, roughness: 1, metalness: 0, flatShading: true
    })
    const terrain = new THREE.Mesh(geo, mat)
    terrain.receiveShadow = true
    this.group.add(terrain)
    this.terrain = terrain
  }

  buildMotes() {
    const p = this.zone.palette
    const count = this.zoneId === 'drakmor' ? 260 : 200
    const positions = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const a = Math.random() * TAU, r = Math.random() * 52
      positions[i * 3] = Math.cos(a) * r
      positions[i * 3 + 1] = 1.2 + Math.random() * 16
      positions[i * 3 + 2] = Math.sin(a) * r
    }
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    const mat = new THREE.PointsMaterial({
      color: p.particle, size: this.zoneId === 'drakmor' ? .16 : .1,
      transparent: true, opacity: .55, depthWrite: false,
      blending: THREE.AdditiveBlending, sizeAttenuation: true
    })
    this.motes = new THREE.Points(geo, mat)
    this.motes.frustumCulled = false
    this.game.scene.add(this.motes)
  }

  // ───────────────────────────── Utilidades ─────────────────────────────
  reserve(x, z, radius = 3) { this.reserved.push({ x, z, r: radius }) }

  isReserved(x, z, pad = 0) {
    for (const r of this.reserved) if (Math.hypot(x - r.x, z - r.z) < r.r + pad) return true
    return false
  }

  addCollider(x, z, radius) { this.colliders.push({ x, z, r: radius }) }

  isWaterDeep(x, z) {
    return this.zone.isWater?.(x, z) && this.zone.heightAt(x, z) < (this.zoneId === 'drakmor' ? -1.9 : -2.3)
  }

  // ───────────────────────────── Arquitectura ─────────────────────────────
  buildLandmarks() {
    for (const lm of this.zone.landmarks) this.reserve(lm.pos[0], lm.pos[1], 8)
    for (const npc of this.zone.npcs) this.reserve(npc.pos[0], npc.pos[1], 2.5)
    for (const wp of this.zone.waypoints) this.reserve(wp.pos[0], wp.pos[1], 3)
    for (const portal of this.zone.portals) this.reserve(portal.pos[0], portal.pos[1], 4)
    for (const it of this.zone.interactables) this.reserve(it.pos[0], it.pos[1], 2)
    for (const arena of Object.values(this.zone.bossArenas || {})) this.reserve(arena.pos[0], arena.pos[1], arena.radius * .55)

    if (this.zoneId === 'valdoria') this.buildValdoria()
    else if (this.zoneId === 'drakmor') this.buildDrakmor()
    else this.buildKansordore()
  }

  buildValdoria() {
    this.buildVillage()
    this.buildRuins()
    this.buildForestShrine()
  }

  buildVillage() {
    const houses = [
      [-12, 7, .25, 0x8b7d63], [16, 18, -.4, 0x9a8665], [-19, 25, .3, 0x7d735e],
      [22, 3, -.2, 0x95896d], [-8, 28, .5, 0x81775f]
    ]
    for (const [x, z, rot, color] of houses) this.buildCottage(x, z, rot, color)
    // Pozo y plaza
    const well = new THREE.Group()
    const h = this.zone.heightAt(2, 13)
    well.position.set(2, h, 13)
    well.add(cyl(1.05, 1.2, .6, 12, std(0x817c6e), 0, .3, 0))
    well.add(cyl(.82, .82, .1, 12, std(0x2f4856, { metalness: .2 }), 0, .61, 0))
    for (const x of [-.9, .9]) well.add(cyl(.08, .1, 1.8, 5, std(0x5c4630), x, 1.1, 0))
    well.add(box(2.2, .12, .14, std(0x5c4630), 0, 2, 0))
    well.add(cone(1.6, .9, 4, std(0x6f553c, { side: THREE.DoubleSide }), 0, 2.45, 0))
    this.group.add(well)
    this.addCollider(2, 13, 1.2)
    // Vallas
    const fenceMat = std(0x5b4631)
    for (let i = 0; i < 7; i++) {
      const x = -24 + i * 3.6, z = 16.5 + Math.sin(i) * .5
      this.group.add(box(.1, .85, .1, fenceMat, x, this.zone.heightAt(x, z) + .42, z))
      if (i < 6) this.group.add(box(3.5, .08, .08, fenceMat, x + 1.75, this.zone.heightAt(x, z) + .62, z))
    }
    // Altar de los caídos
    const ax = 6, az = 15
    const altar = new THREE.Group()
    altar.position.set(ax, this.zone.heightAt(ax, az), az)
    altar.add(cyl(1.5, 1.7, .35, 8, std(0x8c8777), 0, .18, 0))
    altar.add(box(1.5, .8, .8, std(0x777366), 0, .75, 0))
    altar.add(box(1.8, .14, 1.05, std(0xa69b80), 0, 1.2, 0))
    for (let i = 0; i < 5; i++) {
      const candle = new THREE.Mesh(new THREE.SphereGeometry(.06, 6, 5), glow(0xffd88a, .9))
      candle.position.set(-.6 + i * .3, 1.35, 0)
      altar.add(candle)
    }
    altar.add(new THREE.PointLight(0xffd08a, .8, 5).translateY(1.7))
    this.group.add(altar)
    this.addCollider(ax, az, 1.5)
    this.spinners.push({ obj: altar.children[3], speed: .3 })
  }

  buildCottage(x, z, rot, wallColor) {
    const y = this.zone.heightAt(x, z)
    const g = new THREE.Group()
    g.position.set(x, y, z)
    g.rotation.y = rot
    const walls = std(wallColor)
    const roof = std(this.zoneId === 'drakmor' ? 0x4b2d2c : 0x694638, { roughness: .95 })
    const trim = std(0x4d3527)
    g.add(box(4, 2.5, 3.2, walls, 0, 1.25, 0))
    g.add(cone(3.25, 1.6, 4, roof, 0, 3.05, 0).rotateY(Math.PI / 4))
    g.add(box(.82, 1.45, .12, trim, 0, .73, 1.65))
    for (const wx of [-1.25, 1.25]) {
      const win = new THREE.Mesh(new THREE.PlaneGeometry(.62, .5), new THREE.MeshBasicMaterial({
        color: 0xffcb7a, transparent: true, opacity: .78
      }))
      win.position.set(wx, 1.45, 1.665)
      g.add(win)
    }
    g.add(box(.35, 1.2, .35, std(0x5a4433), 1.2, 3.4, -.55))
    this.group.add(g)
    this.addCollider(x, z, 2.55)
    this.reserve(x, z, 3.5)
  }

  buildRuins() {
    const cx = -54, cz = -24
    const stone = std(0x777363)
    const dark = std(0x56544a)
    const ground = this.zone.heightAt(cx, cz)
    // Plataforma
    const platform = cyl(13, 13.5, .45, 16, stone, cx, ground + .16, cz)
    this.group.add(platform)
    // Columnas
    for (let i = 0; i < 8; i++) {
      const a = i / 8 * TAU
      const x = cx + Math.cos(a) * 10.5, z = cz + Math.sin(a) * 10.5
      const h = this.zone.heightAt(x, z)
      const broken = i === 2 || i === 5 || i === 7
      const height = broken ? 2.1 + (i % 2) : 5.4
      const col = cyl(.55, .68, height, 8, i % 3 ? stone : dark, x, h + height / 2, z)
      col.rotation.z = broken ? .13 : 0
      this.group.add(col)
      this.addCollider(x, z, .8)
      if (!broken) {
        this.group.add(box(1.6, .28, 1.6, stone, x, h + height + .15, z))
        const rune = new THREE.Mesh(new THREE.RingGeometry(.18, .24, 6), glow(0x9fe8ff, .45))
        rune.position.set(x, h + height * .55, z + .7)
        rune.rotation.x = Math.PI / 2
        this.group.add(rune)
        this.spinners.push({ obj: rune, speed: .12 })
      }
    }
    // Arco central
    const arch = new THREE.Group()
    arch.position.set(cx, ground, cz - 3)
    arch.add(cyl(.55, .7, 5.4, 8, stone, -2.2, 2.7, 0))
    arch.add(cyl(.55, .7, 5.4, 8, stone, 2.2, 2.7, 0))
    arch.add(box(5.4, .75, 1.1, dark, 0, 5.4, 0))
    arch.add(new THREE.Mesh(new THREE.OctahedronGeometry(.45, 0), glow(0xffe0a0, .5)).translateY(5.4))
    this.group.add(arch)
    this.addCollider(cx - 2.2, cz - 3, .9)
    this.addCollider(cx + 2.2, cz - 3, .9)
    // Inscripción
    for (let i = 0; i < 7; i++) {
      const rune = new THREE.Mesh(new THREE.RingGeometry(.13, .19, 6), glow(0xffe4a8, .3))
      rune.rotation.x = -Math.PI / 2
      rune.position.set(cx - 5 + i * 1.7, ground + .42, cz + 6.5)
      this.group.add(rune)
    }
  }

  buildForestShrine() {
    const x = -30, z = -40
    const y = this.zone.heightAt(x, z)
    const g = new THREE.Group()
    g.position.set(x, y, z)
    g.add(cyl(3.2, 3.7, .3, 10, std(0x6f7a5a), 0, .15, 0))
    for (let i = 0; i < 5; i++) {
      const a = i / 5 * TAU
      const stone = cyl(.35, .45, 2.5, 6, std(0x7b7e69), Math.cos(a) * 2.6, 1.25, Math.sin(a) * 2.6)
      g.add(stone)
    }
    const orb = new THREE.Mesh(new THREE.IcosahedronGeometry(.36, 0), glow(0x9fe8ff, .55))
    orb.position.y = 2.2
    g.add(orb)
    g.add(new THREE.PointLight(0x9fe8ff, .7, 6).translateY(2.2))
    this.group.add(g)
    this.spinners.push({ obj: orb, speed: .6, bob: true })
  }

  buildDrakmor() {
    this.buildCamp()
    this.buildFortress()
    this.buildSanctuary()
    this.buildBeacon()
  }

  buildCamp() {
    const tents = [[-10, 56, .3, 0x5a3a33], [9, 61, -.4, 0x4d3a35], [-2, 51, .1, 0x59413a], [14, 52, .5, 0x49362f]]
    for (const [x, z, rot, color] of tents) {
      const y = this.zone.heightAt(x, z)
      const g = new THREE.Group()
      g.position.set(x, y, z)
      g.rotation.y = rot
      g.add(cone(2.3, 2.6, 5, std(color), 0, 1.3, 0))
      g.add(box(.8, 1.4, .1, std(0x2a2220), 0, .7, 1.9))
      g.add(cyl(.04, .04, 2.8, 4, std(0x6a4c34), 0, 1.4, 0))
      const flag = new THREE.Mesh(new THREE.PlaneGeometry(.8, .5), new THREE.MeshBasicMaterial({ color: 0xd06a3e, side: THREE.DoubleSide }))
      flag.position.set(.42, 2.6, 0)
      g.add(flag)
      this.group.add(g)
      this.addCollider(x, z, 2.1)
    }
    // Hoguera
    const hx = 0, hz = 57
    const y = this.zone.heightAt(hx, hz)
    const fire = new THREE.Group()
    fire.position.set(hx, y, hz)
    for (let i = 0; i < 7; i++) {
      const a = i / 7 * TAU
      fire.add(box(.24, .18, .55, std(0x3a2b26), Math.cos(a) * .7, .1, Math.sin(a) * .7).rotateY(a))
    }
    const flame = cone(.5, 1.5, 7, glow(0xff7a3c, .8), 0, .85, 0)
    fire.add(flame)
    fire.add(new THREE.PointLight(0xff7438, 1.6, 9).translateY(1))
    this.group.add(fire)
    this.flames.push({ mesh: flame, base: .8, speed: 1.6 })
    this.addCollider(hx, hz, 1)
    // Cajas
    for (const [bx, bz] of [[6, 57], [-6, 54], [5, 53]]) {
      this.group.add(box(.9, .8, .9, std(0x5a4330), bx, this.zone.heightAt(bx, bz) + .4, bz))
    }
  }

  buildFortress() {
    const zWall = -41
    const stone = std(0x3d3333)
    const dark = std(0x2b2426)
    const glowMat = glow(0xff6a3a, .5)
    // Muralla con portón central
    for (const side of [-1, 1]) {
      for (let i = 0; i < 5; i++) {
        const x = side * (4 + i * 3.1)
        const y = this.zone.heightAt(x, zWall)
        this.group.add(box(3, 5.2 + (i % 2) * .8, 1.8, i % 2 ? stone : dark, x, y + 2.6, zWall))
        this.addCollider(x, zWall, 1.7)
      }
      // Torreta
      const tx = side * 12
      const y = this.zone.heightAt(tx, zWall + 1)
      const tower = cyl(2.2, 2.6, 8.5, 7, stone, tx, y + 4.2, zWall + 1)
      this.group.add(tower)
      this.group.add(cone(3, 2.6, 7, dark, tx, y + 9.7, zWall + 1))
      this.group.add(new THREE.PointLight(0xff5a2e, .7, 11).translateY(6))
      this.addCollider(tx, zWall + 1, 2.6)
    }
    // Portón
    const gy = this.zone.heightAt(0, -36)
    const gate = new THREE.Group()
    gate.position.set(0, gy, -36)
    for (const side of [-1, 1]) {
      const door = box(2.1, 4.4, .32, std(0x3b2b27, { metalness: .25 }), side * 1.08, 2.2, 0)
      door.name = side < 0 ? 'doorL' : 'doorR'
      gate.add(door)
      gate.add(box(.12, 4.5, .4, std(0x7a5a3a, { metalness: .5 }), side * .08, 2.2, .05))
    }
    gate.add(box(4.8, .5, .6, dark, 0, 4.65, 0))
    this.group.add(gate)
    this.gateModel = gate
    this.gateCollider = { x: 0, z: -36, r: 2.6 }
    this.colliders.push(this.gateCollider)
    // Forja / trono
    const ty = this.zone.heightAt(0, -62)
    this.group.add(cyl(7.5, 8, .7, 10, dark, 0, ty + .3, -61))
    this.group.add(box(3.8, 1.2, 1.5, stone, 0, ty + 1.1, -63))
    this.group.add(box(2.6, 2.8, .5, stone, 0, ty + 2.4, -63.7))
    for (const x of [-1.1, 1.1]) this.group.add(cyl(.25, .25, 2.2, 5, glowMat, x, ty + 2.1, -63.1))
    // Cadenas / antorchas
    for (const [x, z] of [[-8, -54], [8, -54], [-8, -46], [8, -46]]) {
      const y = this.zone.heightAt(x, z)
      const torch = new THREE.Group()
      torch.position.set(x, y, z)
      torch.add(cyl(.09, .12, 1.8, 5, std(0x332724), 0, .9, 0))
      const flame = cone(.28, .8, 6, glow(0xff7a42, .8), 0, 1.95, 0)
      torch.add(flame)
      torch.add(new THREE.PointLight(0xff6a32, .8, 6).translateY(2))
      this.group.add(torch)
      this.flames.push({ mesh: flame, base: .25, speed: 2.1 })
    }
    this.reserve(0, -58, 20)
  }

  buildSanctuary() {
    const cx = 46, cz = 20
    const y = this.zone.heightAt(cx, cz)
    const stone = std(0x574b45)
    const g = new THREE.Group()
    g.position.set(cx, y, cz)
    g.add(cyl(6.2, 6.8, .4, 12, stone, 0, .2, 0))
    for (let i = 0; i < 8; i++) {
      const a = i / 8 * TAU
      const x = Math.cos(a) * 5.2, z = Math.sin(a) * 5.2
      g.add(cyl(.32, .42, 3.6, 6, stone, x, 2, z))
      const flame = cone(.14, .5, 5, glow(0xff9a52, .7), x, 3.9, z)
      g.add(flame)
      this.flames.push({ mesh: flame, base: .16, speed: 2.6 })
    }
    g.add(cyl(1.6, 2, .7, 8, std(0x3c302e), 0, .75, 0))
    const brazier = cone(.7, 1.9, 7, glow(0xffa04e, .75), 0, 1.9, 0)
    g.add(brazier)
    g.add(new THREE.PointLight(0xff8a46, 2, 12).translateY(2))
    this.group.add(g)
    this.flames.push({ mesh: brazier, base: .7, speed: 1.1 })
    this.addCollider(cx, cz, 2.1)
    this.reserve(cx, cz, 8)
  }

  buildBeacon() {
    const x = -58, z = 34
    const y = this.zone.heightAt(x, z)
    const g = new THREE.Group()
    g.position.set(x, y, z)
    g.add(cyl(2.3, 2.9, 6.2, 7, std(0x4b3d38), 0, 3.1, 0))
    g.add(cyl(2.7, 2.5, .5, 7, std(0x2f2928), 0, 6.3, 0))
    const flame = cone(1.3, 3.2, 7, glow(0xff8144, .65), 0, 7.7, 0)
    flame.visible = !!this.game.flags?.used_faro_ceniza
    g.add(flame)
    g.add(new THREE.PointLight(0xff7438, flame.visible ? 2.2 : .1, 16).translateY(8))
    this.group.add(g)
    this.flames.push({ mesh: flame, base: 1.1, speed: .9 })
    this.addCollider(x, z, 2.8)
    this.reserve(x, z, 6)
  }

  buildKansordore() {
    this.buildLibrary()
    this.buildCity()
    this.buildTemple()
  }

  buildLibrary() {
    const x = -48, z = 6
    const y = this.zone.heightAt(x, z)
    const g = new THREE.Group()
    g.position.set(x, y, z)
    const stone = std(0x7b7d96)
    const pale = std(0xa7a8b8)
    const gold = std(0xc9b47e, { metalness: .35 })
    g.add(cyl(7.6, 8.2, .5, 14, stone, 0, .25, 0))
    g.add(cyl(6.2, 6.6, 4.8, 14, pale, 0, 2.9, 0))
    g.add(cyl(7.4, 6.2, 3.4, 14, stone, 0, 6.9, 0))
    g.add(cone(9.4, 3.4, 14, gold, 0, 9.5, 0))
    for (let i = 0; i < 10; i++) {
      const a = i / 10 * TAU
      g.add(cyl(.32, .4, 4.6, 6, pale, Math.cos(a) * 6.9, 2.5, Math.sin(a) * 6.9))
    }
    // Puerta luminosa
    const door = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 3.8), new THREE.MeshBasicMaterial({
      color: 0xffe4a8, transparent: true, opacity: .36, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false
    }))
    door.position.set(0, 2.1, 6.25)
    g.add(door)
    this.group.add(g)
    this.addCollider(x, z, 7.4)
    // Libros flotantes alrededor
    for (let i = 0; i < 12; i++) {
      const b = box(.14, .05, .32, std(i % 3 ? 0x8a6a54 : 0x6c5a93), 0, 0, 0)
      const a = i / 12 * TAU
      b.position.set(x + Math.cos(a) * (10 + Math.random() * 3), y + 4 + Math.random() * 7, z + Math.sin(a) * (10 + Math.random() * 3))
      b.userData.angle = a
      b.userData.radius = 10 + Math.random() * 3
      b.userData.baseY = b.position.y
      this.group.add(b)
      this.floaters.push(b)
    }
    this.reserve(x, z, 10)
  }

  buildCity() {
    const towers = [[31, -6, 4.2, 11], [43, -1, 3.4, 8], [40, -14, 2.8, 6.5], [49, 6, 2.4, 5.5]]
    for (const [x, z, r, h] of towers) {
      const y = this.zone.heightAt(x, z)
      const stone = std(0x7f829d)
      const g = new THREE.Group()
      g.position.set(x, y, z)
      g.add(cyl(r, r * 1.16, h, 8, stone, 0, h / 2, 0))
      g.add(cyl(r + .4, r + .3, .4, 8, std(0xa09eb0), 0, h + .2, 0))
      g.add(cone(r * .95, 3.2, 8, std(0x4b5475), 0, h + 1.9, 0))
      for (let i = 0; i < 3; i++) {
        const a = i / 3 * TAU
        const win = new THREE.Mesh(new THREE.PlaneGeometry(.35, .8), new THREE.MeshBasicMaterial({ color: 0xffe4a8, transparent: true, opacity: .7 }))
        win.position.set(Math.cos(a) * r * .99, h * .55, Math.sin(a) * r * .99)
        win.lookAt(0, h * .55, 0)
        g.add(win)
      }
      this.group.add(g)
      this.addCollider(x, z, r + .4)
    }
    // Puentes de luz
    for (const [x1, z1, x2, z2] of [[31, -6, 43, -1], [43, -1, 40, -14]]) {
      const len = Math.hypot(x2 - x1, z2 - z1)
      const bridge = box(len, .16, .9, new THREE.MeshBasicMaterial({ color: 0xa9d8ff, transparent: true, opacity: .26 }), (x1 + x2) / 2, 6, (z1 + z2) / 2)
      bridge.rotation.y = -Math.atan2(z2 - z1, x2 - x1)
      this.group.add(bridge)
    }
    this.reserve(39, -5, 16)
  }

  buildTemple() {
    const cx = 0, cz = -58
    const y = this.zone.heightAt(cx, cz)
    const pale = std(0xb0afc0)
    const gold = std(0xc7b78e, { metalness: .35 })
    const g = new THREE.Group()
    g.position.set(cx, y, cz)
    g.add(cyl(11, 12, .5, 12, pale, 0, .25, 0))
    g.add(cyl(8.6, 9, .5, 12, pale, 0, .8, 0))
    g.add(cyl(6.2, 6.6, .5, 12, pale, 0, 1.35, 0))
    for (let i = 0; i < 10; i++) {
      const a = i / 10 * TAU
      const x = Math.cos(a) * 8.8, z = Math.sin(a) * 8.8
      g.add(cyl(.38, .5, 6.4, 7, pale, x, 3.9, z))
      g.add(box(1.5, .3, 1.5, gold, x, 7.2, z))
    }
    const arch = new THREE.Mesh(new THREE.TorusGeometry(3.2, .22, 6, 24, Math.PI), gold)
    arch.position.set(0, 6.5, 0)
    arch.rotation.z = Math.PI
    g.add(arch)
    const veils = []
    for (let i = 0; i < 3; i++) {
      const veil = new THREE.Mesh(new THREE.TorusGeometry(4 + i * .8, .025, 4, 40), glow(0xc7b8ff, .35))
      veil.position.y = 5 + i * .5
      veil.rotation.x = Math.PI / 2 + (i - 1) * .18
      g.add(veil)
      veils.push(veil)
    }
    this.group.add(g)
    this.spinners.push({ obj: veils[0], speed: .18, axis: 'z' }, { obj: veils[1], speed: -.12, axis: 'z' }, { obj: veils[2], speed: .08, axis: 'z' })
    for (let i = 0; i < 4; i++) {
      const a = i / 4 * TAU + .4
      this.addCollider(cx + Math.cos(a) * 8.8, cz + Math.sin(a) * 8.8, 1)
    }
    this.reserve(cx, cz, 14)
    // Altar de la Convergencia
    const az = -66
    const ay = this.zone.heightAt(0, az)
    const altar = new THREE.Group()
    altar.position.set(0, ay, az)
    altar.add(cyl(2.6, 3.1, .6, 8, pale, 0, .3, 0))
    altar.add(box(2.1, .75, 1.3, gold, 0, .9, 0))
    for (let i = 0; i < 3; i++) {
      const shard = new THREE.Mesh(new THREE.OctahedronGeometry(.3 + i * .08, 0), glow(0xffe6a8, .55))
      shard.position.set((i - 1) * .6, 1.7 + Math.sin(i) * .3, 0)
      altar.add(shard)
      this.floaters.push(shard)
    }
    altar.add(new THREE.PointLight(0xffe0a0, 1.4, 10).translateY(2))
    this.group.add(altar)
    this.addCollider(0, az, 2.4)
    this.reserve(0, az, 6)
  }

  // ───────────────────────────── Vegetación y detalles ─────────────────────────────
  buildProps() {
    const props = this.zone.props
    const p = this.zone.palette
    let treeCount = props.treeCount
    let rockCount = props.rockCount
    let flowerCount = props.flowerCount
    let grassCount = props.grassCount
    if (this.quality === 'baja') { treeCount = Math.round(treeCount * .6); grassCount = Math.round(grassCount * .4); flowerCount = Math.round(flowerCount * .5) }
    if (this.quality === 'media') { treeCount = Math.round(treeCount * .8); grassCount = Math.round(grassCount * .75) }

    // Árboles: tronco y copa instanciados
    const style = props.treeStyle
    const trunkMat = std(style === 'dead' ? 0x3d302b : style === 'celestial' ? 0x8b899c : 0x5a4028, { roughness: .95 })
    const leafMat = style === 'dead'
      ? std(0x3a2f2c)
      : style === 'celestial'
        ? std(0x8fc5cf, { emissive: p.accent, emissiveIntensity: .13 })
        : std(p.ground2, { roughness: .95 })
    const trunkGeo = new THREE.CylinderGeometry(.16, .28, 2.8, 5)
    const leafGeo = style === 'dead' ? new THREE.ConeGeometry(.9, 2.2, 4) : new THREE.IcosahedronGeometry(1.55, 0)
    const trunks = new THREE.InstancedMesh(trunkGeo, trunkMat, treeCount)
    const leaves = new THREE.InstancedMesh(leafGeo, leafMat, treeCount)
    trunks.castShadow = leaves.castShadow = this.quality !== 'baja'
    trunks.receiveShadow = leaves.receiveShadow = true
    const dummy = new THREE.Object3D()
    let ti = 0
    let tries = 0
    while (ti < treeCount && tries < treeCount * 14) {
      tries++
      const x = (this.rand() - .5) * this.zone.bounds * 1.84
      const z = (this.rand() - .5) * this.zone.bounds * 1.84
      if (this.isReserved(x, z, 1.5) || this.isWaterDeep(x, z)) continue
      const h = this.zone.heightAt(x, z)
      if (h > 11) continue
      const s = .75 + this.rand() * .85
      dummy.position.set(x, h + 1.4 * s, z)
      dummy.rotation.y = this.rand() * TAU
      dummy.scale.set(s * (.8 + this.rand() * .3), s, s * (.8 + this.rand() * .3))
      dummy.updateMatrix()
      trunks.setMatrixAt(ti, dummy.matrix)
      dummy.position.y = h + (style === 'dead' ? 2.8 : 2.9) * s
      dummy.rotation.z = style === 'dead' ? (this.rand() - .5) * .3 : 0
      dummy.updateMatrix()
      leaves.setMatrixAt(ti, dummy.matrix)
      ti++
    }
    trunks.count = leaves.count = ti
    this.group.add(trunks, leaves)
    this.treeMeshes = [trunks, leaves]

    // Rocas
    const rockGeo = new THREE.DodecahedronGeometry(.8, 0)
    const rockMat = std(p.rock, { roughness: 1 })
    const rocks = new THREE.InstancedMesh(rockGeo, rockMat, rockCount)
    rocks.castShadow = rocks.receiveShadow = this.quality !== 'baja'
    let ri = 0
    tries = 0
    while (ri < rockCount && tries < rockCount * 12) {
      tries++
      const x = (this.rand() - .5) * this.zone.bounds * 1.8
      const z = (this.rand() - .5) * this.zone.bounds * 1.8
      if (this.isReserved(x, z, 1) || this.isWaterDeep(x, z)) continue
      const s = .5 + this.rand() * 1.8
      dummy.position.set(x, this.zone.heightAt(x, z) + s * .22, z)
      dummy.rotation.set(this.rand() * TAU, this.rand() * TAU, this.rand() * TAU)
      dummy.scale.set(s, s * (.55 + this.rand() * .5), s)
      dummy.updateMatrix()
      rocks.setMatrixAt(ri, dummy.matrix)
      ri++
    }
    rocks.count = ri
    this.group.add(rocks)

    // Hierba
    if (grassCount > 0) {
      const grassGeo = new THREE.PlaneGeometry(.16, .5)
      grassGeo.translate(0, .25, 0)
      const grassMat = new THREE.MeshStandardMaterial({
        color: this.zoneId === 'drakmor' ? 0x4a3a2d : this.zoneId === 'kansordore' ? 0x7f8e91 : 0x5f7a45,
        roughness: 1, side: THREE.DoubleSide
      })
      const grass = new THREE.InstancedMesh(grassGeo, grassMat, grassCount)
      let gi = 0
      tries = 0
      while (gi < grassCount && tries < grassCount * 10) {
        tries++
        const x = (this.rand() - .5) * this.zone.bounds * 1.9
        const z = (this.rand() - .5) * this.zone.bounds * 1.9
        if (this.isReserved(x, z, .5) || this.isWaterDeep(x, z)) continue
        dummy.position.set(x, this.zone.heightAt(x, z), z)
        dummy.rotation.set(0, this.rand() * TAU, (this.rand() - .5) * .12)
        dummy.scale.setScalar(.7 + this.rand() * .8)
        dummy.updateMatrix()
        grass.setMatrixAt(gi, dummy.matrix)
        gi++
      }
      grass.count = gi
      grass.receiveShadow = true
      this.group.add(grass)
    }

    // Flores / motas de luz
    if (flowerCount > 0) {
      const positions = new Float32Array(flowerCount * 3)
      const cols = new Float32Array(flowerCount * 3)
      const col = new THREE.Color(p.particle)
      let fi = 0
      tries = 0
      while (fi < flowerCount && tries < flowerCount * 10) {
        tries++
        const x = (this.rand() - .5) * this.zone.bounds * 1.8
        const z = (this.rand() - .5) * this.zone.bounds * 1.8
        if (this.isReserved(x, z, .6) || this.isWaterDeep(x, z)) continue
        positions[fi * 3] = x
        positions[fi * 3 + 1] = this.zone.heightAt(x, z) + .25
        positions[fi * 3 + 2] = z
        cols[fi * 3] = col.r; cols[fi * 3 + 1] = col.g; cols[fi * 3 + 2] = col.b
        fi++
      }
      const geo = new THREE.BufferGeometry()
      geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
      geo.setAttribute('color', new THREE.BufferAttribute(cols, 3))
      const flowers = new THREE.Points(geo, new THREE.PointsMaterial({
        size: .19, vertexColors: true, transparent: true, opacity: .9,
        depthWrite: false, blending: THREE.AdditiveBlending
      }))
      flowers.count = fi
      this.group.add(flowers)
    }

    // Cristales
    if (props.crystals > 0) {
      const geo = new THREE.OctahedronGeometry(.55, 0)
      geo.scale(.55, 1.4, .55)
      const mat = new THREE.MeshStandardMaterial({
        color: this.zoneId === 'drakmor' ? 0x5d2b25 : 0x7d9db7,
        emissive: p.accent, emissiveIntensity: this.zoneId === 'drakmor' ? .4 : .22,
        roughness: .3, metalness: .4, flatShading: true
      })
      const crystals = new THREE.InstancedMesh(geo, mat, props.crystals)
      let ci = 0
      tries = 0
      while (ci < props.crystals && tries < props.crystals * 12) {
        tries++
        const x = (this.rand() - .5) * this.zone.bounds * 1.75
        const z = (this.rand() - .5) * this.zone.bounds * 1.75
        if (this.isReserved(x, z, .8) || this.isWaterDeep(x, z)) continue
        const s = .5 + this.rand() * 1.5
        dummy.position.set(x, this.zone.heightAt(x, z) + s * .35, z)
        dummy.rotation.set((this.rand() - .5) * .4, this.rand() * TAU, (this.rand() - .5) * .4)
        dummy.scale.setScalar(s)
        dummy.updateMatrix()
        crystals.setMatrixAt(ci, dummy.matrix)
        ci++
      }
      crystals.count = ci
      this.group.add(crystals)
    }
  }

  // ───────────────────────────── Puntos de interés ─────────────────────────────
  buildWaypoints() {
    for (const def of this.zone.waypoints) {
      const [x, z] = def.pos
      const y = this.zone.heightAt(x, z)
      const g = new THREE.Group()
      g.position.set(x, y, z)
      g.add(cyl(1.1, 1.4, .28, 8, std(0x777a70), 0, .14, 0))
      g.add(cyl(.55, .75, .34, 8, std(0x8c8f80), 0, .4, 0))
      const crystal = new THREE.Mesh(new THREE.OctahedronGeometry(.42, 0), glow(0x9fd8ff, .55))
      crystal.position.y = 1.6
      crystal.scale.set(.7, 1.5, .7)
      g.add(crystal)
      const ring = new THREE.Mesh(new THREE.TorusGeometry(.7, .025, 4, 26), glow(0x9fd8ff, .4))
      ring.rotation.x = Math.PI / 2
      ring.position.y = 1.6
      g.add(ring)
      const light = new THREE.PointLight(0x9fd8ff, .15, 6)
      light.position.y = 1.7
      g.add(light)
      const tag = createNameTag(def.name, 'Santuario de viaje', 0x9fd8ff)
      tag.scale.set(2.1, .64, 1)
      tag.position.y = 2.55
      g.add(tag)
      this.group.add(g)
      this.addCollider(x, z, .9)
      this.reserve(x, z, 3)
      this.waypoints.push({ def, pos: new THREE.Vector3(x, y, z), mesh: g, crystal, ring, light, tag })
    }
    this.refreshWaypoints()
  }

  refreshWaypoints() {
    for (const w of this.waypoints) {
      const discovered = this.game.isWaypointDiscovered(w.def.id)
      w.crystal.material.color.setHex(discovered ? 0xffe4a8 : 0x6a7d92)
      w.crystal.material.opacity = discovered ? .7 : .35
      w.ring.material.color.setHex(discovered ? 0xffe4a8 : 0x6a7d92)
      w.light.color.setHex(discovered ? 0xffe4a8 : 0x6a7d92)
      w.light.intensity = discovered ? .75 : .12
    }
  }

  buildPortals() {
    for (const def of this.zone.portals) {
      const [x, z] = def.pos
      const y = this.zone.heightAt(x, z)
      const g = new THREE.Group()
      g.position.set(x, y, z)
      const stone = std(this.zoneId === 'kansordore' ? 0x8a8ca6 : 0x6c665c)
      const accent = this.zoneId === 'drakmor' ? 0xff7a42 : this.zoneId === 'kansordore' ? 0xb9a8ff : 0xa8d8ff
      g.add(box(1.1, 4.6, 1.1, stone, -2.4, 2.3, 0))
      g.add(box(1.1, 4.6, 1.1, stone, 2.4, 2.3, 0))
      g.add(box(6, .9, 1.1, stone, 0, 4.9, 0))
      g.add(box(7.2, .4, 1.6, stone, 0, .2, 0))
      for (let i = 0; i < 5; i++) {
        const rune = new THREE.Mesh(new THREE.RingGeometry(.16, .24, 6), glow(accent, .55))
        rune.position.set(-2.8 + i * 1.4, 4.9, .58)
        g.add(rune)
      }
      const swirl = new THREE.Mesh(new THREE.CircleGeometry(2, 32), new THREE.MeshBasicMaterial({
        color: accent, transparent: true, opacity: .38, side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending, depthWrite: false
      }))
      swirl.position.set(0, 2.5, 0)
      g.add(swirl)
      const inner = new THREE.Mesh(new THREE.RingGeometry(.4, 1.8, 32), glow(accent, .45))
      inner.position.set(0, 2.5, .02)
      g.add(inner)
      g.add(new THREE.PointLight(accent, .9, 8).translateY(2.5))
      const tag = createNameTag(def.name, def.requires ? 'Portal sellado' : 'Portal de región', accent)
      tag.scale.set(2.2, .68, 1)
      tag.position.y = 5.6
      g.add(tag)
      this.group.add(g)
      this.portals.push({ def, pos: new THREE.Vector3(x, y, z), mesh: g, swirl, inner, tag, accent })
    }
  }

  buildInteractables() {
    for (const def of this.zone.interactables) {
      const obj = this.buildInteractable(def)
      this.interactables.push(obj)
      this.reserve(def.pos[0], def.pos[1], 1)
    }
    // Puerta de la fortaleza: su apertura depende de una bandera
    if (this.zoneId === 'drakmor' && this.game.flags?.gate_open && this.gateCollider) {
      const i = this.colliders.indexOf(this.gateCollider)
      if (i >= 0) this.colliders.splice(i, 1)
      this.openGateVisual()
    }
  }

  buildInteractable(def) {
    const [x, z] = def.pos
    const y = this.zone.heightAt(x, z)
    const g = new THREE.Group()
    g.position.set(x, y, z)
    const obj = { def, type: def.type, pos: new THREE.Vector3(x, y, z), mesh: g, used: !!this.game.flags?.[`used_${def.id}`] }
    const wood = std(0x5c4430)
    const metal = std(0x8b7b55, { metalness: .45, roughness: .5 })
    const stone = std(0x777263)
    if (def.type === 'chest') {
      g.add(box(1, .6, .68, wood, 0, .3, 0))
      const lid = box(1.04, .24, .72, wood, 0, .67, -.02)
      lid.geometry.translate(0, 0, .34)
      lid.position.z = -.36
      g.add(lid)
      g.add(box(1.08, .08, .1, metal, 0, .62, .3))
      g.add(box(.14, .2, .06, metal, 0, .48, .37))
      const glowLight = new THREE.PointLight(0xffd78a, obj.used ? 0 : .45, 3)
      glowLight.position.y = .8
      g.add(glowLight)
      obj.lid = lid; obj.light = glowLight
    } else if (def.type === 'ore') {
      const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(.65, 0), std(0x5c5a54))
      rock.position.y = .35
      g.add(rock)
      for (let i = 0; i < 5; i++) {
        const shard = new THREE.Mesh(new THREE.OctahedronGeometry(.18 + Math.random() * .1, 0), std(0xa9c6e2, { emissive: 0x7faad4, emissiveIntensity: .28, metalness: .45 }))
        shard.position.set((Math.random() - .5) * .8, .45 + Math.random() * .4, (Math.random() - .5) * .8)
        shard.rotation.set(Math.random(), Math.random(), Math.random())
        g.add(shard)
      }
    } else if (def.type === 'herb') {
      for (let i = 0; i < 5; i++) {
        const a = i / 5 * TAU
        const stem = cyl(.025, .035, .42, 4, std(0x5d7b4a), Math.cos(a) * .14, .21, Math.sin(a) * .14)
        g.add(stem)
        const bud = new THREE.Mesh(new THREE.SphereGeometry(.1, 6, 5), glow(this.zone.palette.particle, .85))
        bud.position.set(Math.cos(a) * .14, .46, Math.sin(a) * .14)
        g.add(bud)
      }
      const l = new THREE.PointLight(this.zone.palette.particle, .35, 2.4)
      l.position.y = .5
      g.add(l)
    } else if (def.type === 'echo') {
      const shard = new THREE.Mesh(new THREE.OctahedronGeometry(.34, 0), glow(this.zoneId === 'kansordore' ? 0xd8b8ff : 0x9fe8ff, .65))
      shard.position.y = 1.2
      g.add(shard)
      for (let i = 0; i < 2; i++) {
        const ring = new THREE.Mesh(new THREE.TorusGeometry(.55 + i * .18, .02, 4, 22), glow(this.zoneId === 'kansordore' ? 0xd8b8ff : 0x9fe8ff, .35))
        ring.position.y = 1.2
        ring.rotation.x = Math.PI / 2 + i * .5
        g.add(ring)
        this.spinners.push({ obj: ring, speed: .3 + i * .12 })
      }
      g.add(cyl(.5, .7, .3, 6, stone, 0, .15, 0))
      g.add(new THREE.PointLight(this.zoneId === 'kansordore' ? 0xd8b8ff : 0x9fe8ff, .8, 5).translateY(1.2))
      this.floaters.push(shard)
    } else if (def.type === 'brazier') {
      g.add(cyl(.45, .6, .25, 8, stone, 0, .14, 0))
      g.add(cyl(.1, .12, .8, 5, stone, 0, .6, 0))
      g.add(cyl(.62, .4, .38, 8, metal, 0, 1.05, 0))
      const flame = cone(.48, 1.2, 7, glow(0xffb15a, .8), 0, 1.75, 0)
      flame.visible = obj.used
      g.add(flame)
      const light = new THREE.PointLight(0xffa04e, obj.used ? 1.6 : 0, 6)
      light.position.y = 1.8
      g.add(light)
      obj.flame = flame; obj.light = light
      if (obj.used) this.flames.push({ mesh: flame, base: .5, speed: 1.9 })
    } else if (def.type === 'gate') {
      // La puerta real se construye en la fortaleza. Aquí solo un marcador de misión.
      g.add(cyl(.4, .5, .16, 6, metal, 0, .1, 0))
      const mark = new THREE.Mesh(new THREE.RingGeometry(.2, .3, 6), glow(0xffc06a, .5))
      mark.rotation.x = -Math.PI / 2
      mark.position.y = .18
      g.add(mark)
      this.spinners.push({ obj: mark, speed: .25, axis: 'z' })
    } else if (def.type === 'memory') {
      const glass = new THREE.Mesh(new THREE.OctahedronGeometry(.3, 0), new THREE.MeshStandardMaterial({
        color: 0xff8a4c, emissive: 0xff6a32, emissiveIntensity: .5, transparent: true, opacity: .85, roughness: .2
      }))
      glass.position.y = 1.1
      g.add(glass)
      g.add(cyl(.32, .5, .22, 6, stone, 0, .11, 0))
      g.add(new THREE.PointLight(0xff7a42, .7, 4).translateY(1.1))
      this.floaters.push(glass)
      obj.glass = glass
    } else if (def.type === 'seal') {
      g.add(cyl(.55, .7, .4, 8, stone, 0, .2, 0))
      const seal = new THREE.Mesh(new THREE.TorusGeometry(.38, .06, 5, 6), glow(0xc2b3ff, .7))
      seal.position.y = 1.15
      seal.rotation.x = Math.PI / 2
      g.add(seal)
      const core = new THREE.Mesh(new THREE.OctahedronGeometry(.18, 0), glow(0xe4d8ff, .7))
      core.position.y = 1.15
      g.add(core)
      this.spinners.push({ obj: seal, speed: .5 })
      this.floaters.push(core)
      g.add(new THREE.PointLight(0xc2b3ff, .7, 5).translateY(1.2))
      obj.core = core
    } else if (def.type === 'beacon') {
      g.add(cyl(.7, .95, .3, 8, stone, 0, .15, 0))
      g.add(cyl(1.2, .8, .6, 8, metal, 0, .58, 0))
      const flame = cone(1.1, 2.6, 7, glow(0xffa04e, .75), 0, 2, 0)
      flame.visible = obj.used
      g.add(flame)
      g.add(new THREE.PointLight(0xff8a46, obj.used ? 2 : 0, 12).translateY(2))
      obj.flame = flame
      if (obj.used) this.flames.push({ mesh: flame, base: .9, speed: 1.4 })
    } else if (def.type === 'altar') {
      g.add(cyl(1.8, 2.2, .5, 8, stone, 0, .25, 0))
      g.add(box(1.4, .7, .9, metal, 0, .85, 0))
      for (let i = 0; i < 3; i++) {
        const rune = new THREE.Mesh(new THREE.RingGeometry(.12, .18, 6), glow(0xffe6a8, .55))
        rune.rotation.x = -Math.PI / 2
        rune.position.set((i - 1) * .4, 1.25, 0)
        g.add(rune)
      }
      g.add(new THREE.PointLight(0xffe0a0, 1, 7).translateY(1.5))
      obj.light = g.children[g.children.length - 1]
    }
    this.group.add(g)
    obj.baseY = g.position.y
    this.applyInteractableState(obj)
    return obj
  }

  applyInteractableState(obj) {
    const used = obj.used
    if (obj.type === 'chest') {
      if (obj.lid) obj.lid.rotation.x = used ? -1.05 : 0
      if (obj.light) obj.light.intensity = used ? 0 : .45
    } else if (obj.type === 'ore') {
      obj.mesh.visible = !used
    } else if (obj.type === 'herb') {
      obj.mesh.visible = !used
    } else if (obj.type === 'memory') {
      if (obj.glass) obj.glass.visible = !used
    } else if (obj.type === 'seal') {
      if (obj.core) obj.core.material.opacity = used ? .2 : .7
    } else if (obj.type === 'brazier' || obj.type === 'beacon') {
      if (obj.flame) obj.flame.visible = used
      if (obj.light) obj.light.intensity = used ? (obj.type === 'beacon' ? 2 : 1.6) : 0
      if (used && obj.flame && !this.flames.some(f => f.mesh === obj.flame)) this.flames.push({ mesh: obj.flame, base: obj.type === 'beacon' ? .9 : .5, speed: 1.8 })
    }
  }

  markUsed(obj) {
    if (!obj) return
    obj.used = true
    if (obj.def?.id) this.game.flags[`used_${obj.def.id}`] = true
    this.applyInteractableState(obj)
  }

  openGateVisual() {
    const gate = this.gateModel
    if (!gate) return
    const left = gate.getObjectByName('doorL')
    const right = gate.getObjectByName('doorR')
    if (left) left.rotation.y = -1.35
    if (right) right.rotation.y = 1.35
  }

  // ───────────────────────────── Habitantes ─────────────────────────────
  buildNPCs() {
    for (const def of this.zone.npcs) {
      const npc = new NPC(this.game, def, this.zone)
      this.npcs.push(npc)
      this.reserve(def.pos[0], def.pos[1], 2.4)
    }
  }

  buildCreatures() {
    const spawns = CREATURE_SPAWNS[this.zoneId] || []
    const level = Math.max(1, Math.floor((this.game.save?.level || 1) * .7) + (this.zoneId === 'kansordore' ? 2 : 0))
    for (const [id, x, z] of spawns) {
      this.creatureSpawns.push(new Creature(this.game, id, x, z, { level }))
    }
  }

  buildEnemies() {
    const spawns = ZONE_SPAWNS[this.zoneId] || []
    const baseLevel = ZONE_LEVEL[this.zoneId] || 1
    const playerLevel = this.game.save?.level || 1
    const level = Math.max(1, baseLevel + Math.floor(playerLevel / 3))
    for (const [id, x, z, count] of spawns) {
      for (let i = 0; i < count; i++) {
        const ox = x + rand(-3.5, 3.5), oz = z + rand(-3.5, 3.5)
        this.enemySpawns.push([id, ox, oz, level])
        this.spawnEnemy(id, ox, oz, level)
      }
    }
  }

  spawnEnemy(id, x, z, level) {
    const enemy = new Enemy(this.game, id, x, z, { level })
    this.enemies.push(enemy)
    return enemy
  }

  spawnBoss(id) {
    const alive = this.enemies.find(e => e.defId === id && e.alive)
    if (alive) return alive
    const arena = this.zone.bossArenas?.[id]
    const [x, z] = arena?.pos || [0, 0]
    const boss = new Enemy(this.game, id, x, z, { level: 1 })
    this.enemies.push(boss)
    return boss
  }

  findNPC(id) { return this.npcs.find(n => n.def.id === id) }
  findWaypoint(id) { return this.waypoints.find(w => w.def.id === id) }

  // ───────────────────────────── Bucle ─────────────────────────────
  update(dt) {
    this.time += dt
    const active = this.game.state === 'playing'
    for (const npc of this.npcs) npc.update(dt)
    for (const c of this.creatureSpawns) c.update(dt)
    for (const e of this.enemies) e.update(dt)
    if (active) {
      this.updateFocus()
      this.gotoTimer += dt
      if (this.gotoTimer > .45) {
        this.gotoTimer = 0
        const p = this.game.player?.pos
        if (p) this.game.quests.notifyGoto(this.zoneId, p.x, p.z)
        this.checkWaypointDiscovery()
      }
    } else {
      this.focus = null
      this.game.ui?.setInteract?.(false)
    }
    this.updateAmbient(dt)
    this.updateSpawns(dt)
  }

  updateFocus() {
    if (!this.game.player || this.game.player.dead) {
      this.focus = null
      this.game.ui?.setInteract?.(false)
      return
    }
    if (this.bossArenaLock) {
      // Durante el combate contra un jefe no se puede interactuar con el entorno.
      this.focus = null
      this.game.ui?.setInteract?.(false)
      return
    }
    const p = this.game.player.pos
    let best = null, bestD = Infinity
    const consider = (d, range, data) => {
      if (d > range || d >= bestD) return
      bestD = d; best = data
    }
    for (const n of this.npcs) {
      const d = Math.hypot(n.pos.x - p.x, n.pos.z - p.z)
      consider(d, 3.4, { kind: 'npc', target: n, label: `Hablar con <b>${n.def.name}</b>`, key: 'E' })
    }
    for (const o of this.interactables) {
      if (o.used && o.type !== 'echo') continue
      if (o.type === 'gate' && this.game.flags?.gate_open) continue
      const d = Math.hypot(o.pos.x - p.x, o.pos.z - p.z)
      const labels = {
        chest: 'Abrir cofre', ore: 'Extraer hierro estelar', herb: 'Recoger flor de lumen',
        brazier: o.used ? 'Brasero encendido' : 'Encender brasero', memory: 'Escuchar memoria',
        gate: 'Abrir la puerta', seal: 'Reclamar sello', echo: 'Escuchar eco',
        beacon: o.used ? 'Faro encendido' : 'Encender el faro', altar: 'Tocar el altar'
      }
      consider(d, o.type === 'gate' ? 3.8 : 2.8, { kind: 'interactable', target: o, label: labels[o.type] || 'Interactuar', key: 'E' })
    }
    for (const w of this.waypoints) {
      const d = Math.hypot(w.pos.x - p.x, w.pos.z - p.z)
      consider(d, 3.8, { kind: 'waypoint', target: w, label: this.game.isWaypointDiscovered(w.def.id) ? `Viajar desde <b>${w.def.name}</b>` : `Activar <b>${w.def.name}</b>`, key: 'E' })
    }
    for (const portal of this.portals) {
      const d = Math.hypot(portal.pos.x - p.x, portal.pos.z - p.z)
      const locked = portal.def.requires && !this.game.flags?.[portal.def.requires]
      consider(d, 4.2, { kind: 'portal', target: portal, label: locked ? `Inspeccionar <b>${portal.def.name}</b>` : `Cruzar <b>${portal.def.name}</b>`, key: 'E', locked })
    }
    this.focus = best
    if (best) this.game.ui?.setInteract?.(true, best.label, best.key)
    else this.game.ui?.setInteract?.(false)
  }

  checkWaypointDiscovery() {
    const p = this.game.player?.pos
    if (!p || !this.game.save) return
    for (const w of this.waypoints) {
      if (this.game.isWaypointDiscovered(w.def.id)) continue
      if (Math.hypot(w.pos.x - p.x, w.pos.z - p.z) < 5) {
        this.game.save.discoveredWaypoints.push(w.def.id)
        this.game.setCheckpoint?.(w.pos.x, w.pos.z)
        this.game.toast(`Santuario descubierto: <b>${w.def.name}</b>`, '⌖')
        this.game.audio?.sfx('discover')
        this.game.fx.ring(w.pos.clone(), 0xffe4a8, 3.6, { life: 1 })
        this.refreshWaypoints()
        this.game.autoSave()
      }
    }
  }

  updateAmbient(dt) {
    const t = this.time
    for (const f of this.flames) {
      if (!f.mesh.visible) continue
      f.mesh.scale.y = f.base * (1 + Math.sin(t * 6 + f.speed) * .22)
      f.mesh.scale.x = f.mesh.scale.z = f.base * (1 + Math.sin(t * 4.5 + f.speed) * .12)
      f.mesh.rotation.y += dt * .7
    }
    for (const s of this.spinners) {
      if (s.axis === 'z') s.obj.rotation.z += dt * s.speed
      else if (s.axis === 'x') s.obj.rotation.x += dt * s.speed
      else s.obj.rotation.y += dt * s.speed
      if (s.bob) s.obj.position.y += Math.sin(t * 2) * dt * .12
    }
    for (const f of this.floaters) {
      f.position.y += Math.sin(t * 1.6 + f.id) * dt * .09
      f.rotation.y += dt * .2
      if (f.position.y > (f.userData.baseY || f.position.y) + .4) f.position.y -= .4
    }
    for (const e of this.enemies) {
      if (e.def.boss && e.alive) e.light && (e.light.intensity = 1.1 + Math.sin(t * 3) * .35)
    }
    for (const portal of this.portals) {
      portal.swirl.rotation.z += dt * .55
      portal.inner.rotation.z -= dt * .3
      const locked = portal.def.requires && !this.game.flags?.[portal.def.requires]
      portal.swirl.material.opacity = locked ? .12 : .34 + Math.sin(t * 2.2) * .08
      portal.inner.material.opacity = locked ? .1 : .42
      portal.swirl.scale.setScalar(1 + Math.sin(t * 1.8) * .03)
    }
    for (const w of this.waypoints) {
      w.crystal.rotation.y += dt * .6
      w.crystal.position.y = 1.6 + Math.sin(t * 1.8) * .06
      w.ring.rotation.z += dt * .25
    }
    for (const n of this.npcs) {
      // pequeños destellos de polvo alrededor de los NPC importantes
      if (Math.random() < dt * .35) this.game.fx?.burst(new THREE.Vector3(n.pos.x, n.pos.y + .15, n.pos.z), 0xe4c27c, 2, { speed: .35, life: .9, size: .05, gravity: .2 })
    }
    if (this.motes) {
      this.motes.rotation.y += dt * .008
      if (this.game.player) this.motes.position.set(this.game.player.pos.x, 0, this.game.player.pos.z)
    }
    if (this.cloudSea) this.cloudSea.position.x = Math.sin(t * .02) * 4
    if (this.water) {
      this.water.material.emissiveIntensity = this.zoneId === 'drakmor' ? .34 + Math.sin(t * .6) * .08 : 0
    }
    for (const f of this.floaters) {
      if (f.userData.speed) f.position.y = (f.userData.baseY || f.position.y) + Math.sin(t * f.userData.speed) * 1.2
    }
  }

  updateSpawns(dt) {
    // Enemigos derrotados: eliminarlos y programar su regreso
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const e = this.enemies[i]
      if (e.deadRemoved) {
        this.enemies.splice(i, 1)
        if (!e.boss) this.respawnQueue.push({ id: e.defId, x: e.home.x, z: e.home.z, level: e.level, at: this.time + 40 })
        continue
      }
      // Enemigos que se alejan demasiado del jugador no se actualizan en detalle
    }
    for (let i = this.respawnQueue.length - 1; i >= 0; i--) {
      const r = this.respawnQueue[i]
      if (this.time < r.at) continue
      const farFromPlayer = !this.game.player || Math.hypot(this.game.player.pos.x - r.x, this.game.player.pos.z - r.z) > 18
      if (!farFromPlayer) continue
      this.spawnEnemy(r.id, r.x, r.z, r.level)
      this.respawnQueue.splice(i, 1)
    }
  }

  resolveCollision(x, z, radius = .55) {
    let nx = x, nz = z
    for (const c of this.colliders) {
      const dx = nx - c.x, dz = nz - c.z
      const d = Math.hypot(dx, dz)
      const min = c.r + radius
      if (d < min && d > .0001) {
        nx = c.x + dx / d * min
        nz = c.z + dz / d * min
      } else if (d <= .0001) {
        nx = c.x + min
      }
    }
    return { x: nx, z: nz }
  }

  dispose() {
    const scene = this.game.scene
    for (const npc of this.npcs) npc.remove()
    for (const creature of this.creatureSpawns) creature.remove()
    for (const enemy of this.enemies) {
      if (enemy.mesh?.parent) enemy.mesh.parent.remove(enemy.mesh)
      enemy.mesh?.traverse?.(o => { o.geometry?.dispose?.(); if (o.material && !Array.isArray(o.material)) o.material.dispose() })
    }
    if (this.motes?.parent) this.motes.parent.remove(this.motes)
    this.motes?.geometry?.dispose?.()
    this.motes?.material?.dispose?.()
    if (this.sky) {
      if (this.sky.sky) { scene?.remove(this.sky.sky); this.sky.sky.geometry?.dispose?.(); this.sky.sky.material?.dispose?.() }
      if (this.sky.sun) { scene?.remove(this.sky.sun); this.sky.sun.material?.dispose?.() }
      this.sky.sunTex?.dispose?.()
    }
    if (this.lights) {
      for (const key of ['hemi', 'ambient', 'dir', 'target']) {
        const obj = this.lights[key]
        if (obj) scene?.remove(obj)
      }
    }
    this.group.traverse(o => {
      if (o.geometry) o.geometry.dispose()
      if (o.material) {
        if (Array.isArray(o.material)) o.material.forEach(m => m.dispose())
        else o.material.dispose()
      }
    })
    this.group.parent?.remove(this.group)
    if (scene) { scene.fog = null }
    this.bossArenaLock = null
    this.enemies = []
    this.creatureSpawns = []
    this.npcs = []
  }
}
