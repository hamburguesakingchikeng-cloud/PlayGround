import * as THREE from 'three'
import { ITEMS } from '../data/items.js'

const std = (color, opts = {}) => new THREE.MeshStandardMaterial({
  color,
  roughness: opts.roughness ?? .82,
  metalness: opts.metalness ?? 0,
  flatShading: opts.flat ?? true,
  emissive: opts.emissive ?? 0x000000,
  emissiveIntensity: opts.emissiveIntensity ?? 1,
  transparent: opts.transparent ?? false,
  opacity: opts.opacity ?? 1,
  side: opts.side ?? THREE.FrontSide,
  depthWrite: opts.depthWrite ?? true
})

const glowMat = (color, opacity = .85) => new THREE.MeshBasicMaterial({
  color, transparent: true, opacity, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide
})

function mesh(geo, material, x = 0, y = 0, z = 0, cast = true) {
  const m = new THREE.Mesh(geo, material)
  m.position.set(x, y, z)
  m.castShadow = cast
  m.receiveShadow = cast
  return m
}

function group(x = 0, y = 0, z = 0) {
  const g = new THREE.Group()
  g.position.set(x, y, z)
  return g
}

const hexColor = n => Number(n) || 0x777777

function hairGroup(style, color) {
  const g = group()
  const m = std(color, { roughness: .9 })
  if (style === 'long') {
    g.add(mesh(new THREE.SphereGeometry(.235, 8, 6, 0, Math.PI * 2, 0, Math.PI * .72), m, 0, .04, -.03))
    g.add(mesh(new THREE.BoxGeometry(.38, .4, .11), m, 0, -.23, -.15))
  } else if (style === 'braid') {
    g.add(mesh(new THREE.SphereGeometry(.23, 8, 6, 0, Math.PI * 2, 0, Math.PI * .68), m, 0, .03, 0))
    const b = mesh(new THREE.CylinderGeometry(.055, .035, .48, 5), m, -.21, -.28, -.12)
    b.rotation.z = .22
    g.add(b)
  } else if (style === 'twintails') {
    g.add(mesh(new THREE.SphereGeometry(.23, 8, 6, 0, Math.PI * 2, 0, Math.PI * .7), m, 0, .03, 0))
    const a = mesh(new THREE.ConeGeometry(.075, .38, 5), m, -.25, -.14, -.08)
    a.rotation.z = .28
    const b = mesh(new THREE.ConeGeometry(.075, .38, 5), m, .25, -.14, -.08)
    b.rotation.z = -.28
    g.add(a, b)
  } else if (style === 'bun') {
    g.add(mesh(new THREE.SphereGeometry(.23, 8, 6, 0, Math.PI * 2, 0, Math.PI * .72), m, 0, .03, 0))
    g.add(mesh(new THREE.SphereGeometry(.1, 7, 5), m, 0, .23, -.03))
  } else {
    g.add(mesh(new THREE.SphereGeometry(.235, 8, 6, 0, Math.PI * 2, 0, Math.PI * .62), m, 0, .04, 0))
    g.add(mesh(new THREE.BoxGeometry(.42, .1, .2), m, 0, .06, -.08))
  }
  return g
}

function swordMesh(itemId, scale = 1) {
  const it = ITEMS[itemId] || { color: 0xcfd9e8, dmg: 8 }
  const color = it.color || 0xcfd9e8
  const g = group()
  const metal = std(color, { roughness: .28, metalness: .7, emissive: it.rarity === 'legendario' ? color : 0x000000, emissiveIntensity: .22 })
  const dark = std(0x2b2520, { roughness: .7, metalness: .2 })
  const gold = std(0xd9b56a, { roughness: .4, metalness: .6 })
  const blade = mesh(new THREE.BoxGeometry(.055, .74, .012), metal, 0, .43, 0)
  const tip = mesh(new THREE.ConeGeometry(.04, .14, 4), metal, 0, .87, 0)
  const guard = mesh(new THREE.BoxGeometry(.25, .035, .045), gold, 0, .05, 0)
  const grip = mesh(new THREE.CylinderGeometry(.025, .03, .19, 6), dark, 0, -.07, 0)
  const pommel = mesh(new THREE.SphereGeometry(.04, 6, 4), gold, 0, -.18, 0)
  g.add(blade, tip, guard, grip, pommel)
  if (it.rarity === 'legendario' || it.rarity === 'reliquia') {
    const halo = new THREE.Mesh(new THREE.TorusGeometry(.2, .006, 4, 24), glowMat(color, .55))
    halo.rotation.x = Math.PI / 2
    halo.position.y = .42
    g.add(halo)
  }
  g.scale.setScalar(scale)
  return g
}

export function createHumanoid(opts = {}) {
  const a = opts.appearance || {}
  const eq = opts.equipment || {}
  const c = opts.colors || {}
  const skin = hexColor(c.skin ?? a.skin ?? 0xd2a47e)
  const hairColor = hexColor(c.hair ?? a.hairColor ?? 0x3a2a24)
  const outfit = hexColor(c.outfit ?? a.outfit ?? 0x45526d)
  const trim = hexColor(c.trim ?? a.trim ?? 0xd6b46e)
  const style = opts.npcStyle || {}
  const scale = opts.scale || 1
  const root = group()
  const body = group()
  root.add(body)
  const skinMat = std(skin, { roughness: .78 })
  const outfitMat = std(outfit, { roughness: .85 })
  const trimMat = std(trim, { roughness: .5, metalness: .25 })
  const darkMat = std(0x191a21, { roughness: .9 })
  const bootMat = std(0x2c2622, { roughness: .95 })

  // Armadura visible del equipo
  const armorItem = eq.armor && ITEMS[eq.armor]
  const armorMat = std(armorItem?.color ?? outfit, { roughness: armorItem ? .52 : .9, metalness: armorItem ? .34 : 0 })
  const heavy = !!eq.armor && !['tunica_viajero'].includes(eq.armor)
  const chest = mesh(new THREE.BoxGeometry(.5, .58, .29), heavy ? armorMat : outfitMat, 0, 1.2, 0)
  chest.geometry.translate(0, 0, 0)
  body.add(chest)
  const belt = mesh(new THREE.BoxGeometry(.53, .075, .31), trimMat, 0, .93, 0)
  body.add(belt)
  body.add(mesh(new THREE.BoxGeometry(.2, .26, .03), trimMat, 0, 1.23, .16, false))
  const pelvis = mesh(new THREE.BoxGeometry(.38, .18, .25), darkMat, 0, .84, 0)
  body.add(pelvis)

  // Piernas
  const legL = group(-.14, .8, 0)
  const legR = group(.14, .8, 0)
  for (const [leg, side] of [[legL, -1], [legR, 1]]) {
    const thigh = mesh(new THREE.CylinderGeometry(.075, .065, .38, 6), outfitMat, 0, -.18, 0)
    const shin = mesh(new THREE.CylinderGeometry(.062, .055, .36, 6), leg === legL ? outfitMat : outfitMat, 0, -.5, 0)
    const boot = mesh(new THREE.BoxGeometry(.13, .11, .23), bootMat, 0, -.7, .035)
    leg.add(thigh, shin, boot)
    body.add(leg)
  }

  // Brazos
  const armL = group(-.31, 1.39, 0)
  const armR = group(.31, 1.39, 0)
  for (const [arm, side] of [[armL, -1], [armR, 1]]) {
    const upper = mesh(new THREE.CylinderGeometry(.062, .055, .28, 6), heavy && side === -1 ? armorMat : outfitMat, 0, -.13, 0)
    const fore = mesh(new THREE.CylinderGeometry(.052, .045, .27, 6), skinMat, 0, -.38, 0)
    const hand = mesh(new THREE.SphereGeometry(.055, 6, 4), skinMat, 0, -.53, 0)
    arm.add(upper, fore, hand)
    if (heavy) {
      const pauldron = mesh(new THREE.SphereGeometry(.115, 7, 5, 0, Math.PI * 2, 0, Math.PI * .62), armorMat, 0, .015, 0)
      arm.add(pauldron)
    }
    body.add(arm)
  }

  // Cabeza
  const head = group(0, 1.55, 0)
  const headMesh = mesh(new THREE.SphereGeometry(.185, 9, 8), skinMat, 0, .11, 0)
  headMesh.scale.set(1, 1.08, .96)
  const nose = mesh(new THREE.ConeGeometry(.028, .075, 4), skinMat, 0, .1, .19)
  nose.rotation.x = Math.PI / 2
  const eyeMat = std(style.eyes === 'glow' ? 0xbdefff : 0x221d1b, { emissive: style.eyes === 'glow' ? 0x8feaff : 0, emissiveIntensity: .8 })
  const eyeL = mesh(new THREE.SphereGeometry(.024, 6, 4), eyeMat, -.065, .13, .165, false)
  const eyeR = mesh(new THREE.SphereGeometry(.024, 6, 4), eyeMat, .065, .13, .165, false)
  head.add(headMesh, nose, eyeL, eyeR)
  const hair = hairGroup(a.hairStyle || style.hair || 'short', hairColor)
  hair.position.y = .07
  head.add(hair)
  // Rostro: tres variantes sutiles
  if (a.face === 1) headMesh.scale.set(.96, 1.14, .94)
  if (a.face === 2) headMesh.scale.set(1.05, 1.02, 1)
  if (style.veil) {
    const veil = new THREE.Mesh(new THREE.ConeGeometry(.27, .72, 10, 1, true), std(0xe9e4ef, { transparent: true, opacity: .22, side: THREE.DoubleSide, depthWrite: false }))
    veil.position.y = -.08
    head.add(veil)
  }
  if (style.hood) {
    const hood = new THREE.Mesh(new THREE.ConeGeometry(.29, .44, 8, 1, true), std(0x34462f, { side: THREE.DoubleSide }))
    hood.position.y = .11
    head.add(hood)
  }
  if (style.hat) {
    const brim = mesh(new THREE.CylinderGeometry(.3, .3, .025, 12), outfitMat, 0, .24, 0)
    const top = mesh(new THREE.ConeGeometry(.18, .2, 9), outfitMat, 0, .33, 0)
    head.add(brim, top)
  }
  if (style.beard) {
    const beard = mesh(new THREE.ConeGeometry(.13, .25, 6), hairColor, 0, -.09, .12)
    beard.rotation.x = .22
    head.add(beard)
  }
  if (style.elder) {
    head.add(mesh(new THREE.BoxGeometry(.03, .015, .015), std(0xe8ded0), -.035, .045, .17, false))
  }
  body.add(head)

  // Accesorios
  const accessory = a.accessory || style.accessory || 'none'
  if (accessory === 'circlet') {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(.19, .012, 4, 18), trimMat)
    ring.rotation.x = Math.PI / 2
    ring.position.y = .2
    head.add(ring)
    head.add(mesh(new THREE.OctahedronGeometry(.035), trimMat, 0, .22, .14))
  }
  if (accessory === 'scarf') {
    const scarf = mesh(new THREE.TorusGeometry(.17, .045, 5, 12), trimMat, 0, 1.4, 0)
    scarf.rotation.x = Math.PI / 2
    body.add(scarf)
    const tail = mesh(new THREE.BoxGeometry(.11, .34, .035), trimMat, .17, 1.18, -.06)
    tail.rotation.z = .22
    body.add(tail)
  }
  if (accessory === 'bandana') {
    const band = mesh(new THREE.BoxGeometry(.4, .07, .38), trimMat, 0, .2, 0)
    head.add(band)
  }
  if (style.cape) {
    const cape = mesh(new THREE.ConeGeometry(.33, .9, 7, 1, true, 0, Math.PI * 2), std(0x3f3358, { side: THREE.DoubleSide }), 0, 1.05, -.12)
    cape.rotation.x = -.08
    body.add(cape)
  }
  if (eq.helm && ITEMS[eq.helm]) {
    const hm = std(ITEMS[eq.helm].color || 0x7d8b9c, { metalness: .55, roughness: .45 })
    const helm = mesh(new THREE.SphereGeometry(.215, 8, 6, 0, Math.PI * 2, 0, Math.PI * .55), hm, 0, .15, 0)
    const noseGuard = mesh(new THREE.BoxGeometry(.028, .16, .03), hm, 0, .06, .19)
    head.add(helm, noseGuard)
  }
  if (eq.amulet && ITEMS[eq.amulet]) {
    const gemColor = ITEMS[eq.amulet].color || 0xffd47a
    const gem = new THREE.Mesh(new THREE.OctahedronGeometry(.055), glowMat(gemColor, .95))
    gem.position.set(0, 1.22, .19)
    body.add(gem)
    const light = new THREE.PointLight(gemColor, .35, 2.2)
    light.position.copy(gem.position)
    body.add(light)
  }
  // Arma
  let weapon = null
  if (opts.weapon !== null) {
    const weaponId = eq.weapon || opts.defaultWeapon
    weapon = weaponId ? swordMesh(weaponId, opts.weaponScale ?? 1) : null
    if (weapon) {
      weapon.position.set(0, -.54, .03)
      weapon.rotation.x = -.1
      armR.add(weapon)
    }
  }
  if (opts.staff) {
    const staff = group()
    const wood = mesh(new THREE.CylinderGeometry(.025, .035, 1.35, 5), std(0x5a4030), 0, .35, 0)
    const orb = new THREE.Mesh(new THREE.IcosahedronGeometry(.09, 0), glowMat(opts.staffColor || 0xff9a48))
    orb.position.y = 1.03
    staff.add(wood, orb)
    staff.position.set(0, -.5, 0)
    armR.add(staff)
  }
  root.scale.setScalar(scale)
  root.userData.rig = { body, head, armL, armR, legL, legR, hair, weapon, chest, baseY: 0 }
  root.userData.kind = 'humanoid'
  return root
}

function quadruped(def, opts = {}) {
  const color = def.color || 0x4d5a3c, accent = def.accent || 0xd8ff9a
  const root = group()
  const body = group()
  root.add(body)
  const m = std(color, { roughness: .9 })
  const a = std(accent, { emissive: accent, emissiveIntensity: .22 })
  const bodyMesh = mesh(new THREE.SphereGeometry(.42, 8, 6), m, 0, .85, 0)
  bodyMesh.scale.set(.72, .62, 1.35)
  body.add(bodyMesh)
  const neck = mesh(new THREE.CylinderGeometry(.18, .25, .45, 6), m, 0, 1.1, .48)
  neck.rotation.x = -.55
  const head = group(0, 1.2, .72)
  head.add(mesh(new THREE.SphereGeometry(.23, 7, 6), m, 0, 0, 0))
  head.add(mesh(new THREE.BoxGeometry(.18, .13, .28), m, 0, -.04, .22))
  head.add(mesh(new THREE.SphereGeometry(.035, 5, 4), a, -.09, .06, .17, false))
  head.add(mesh(new THREE.SphereGeometry(.035, 5, 4), a, .09, .06, .17, false))
  const earL = mesh(new THREE.ConeGeometry(.06, .18, 4), m, -.12, .2, -.02)
  const earR = mesh(new THREE.ConeGeometry(.06, .18, 4), m, .12, .2, -.02)
  head.add(earL, earR)
  body.add(neck, head)
  const legs = []
  for (const [x, z] of [[-.22, .45], [.22, .45], [-.22, -.42], [.22, -.42]]) {
    const leg = group(x, .68, z)
    leg.add(mesh(new THREE.CylinderGeometry(.075, .06, .55, 5), m, 0, -.26, 0))
    leg.add(mesh(new THREE.BoxGeometry(.14, .1, .2), m, 0, -.57, .03))
    body.add(leg); legs.push(leg)
  }
  const tail = group(0, .95, -.55)
  const tailMesh = mesh(new THREE.ConeGeometry(.11, .7, 5), m, 0, -.15, -.25)
  tailMesh.rotation.x = -1.0
  tail.add(tailMesh)
  if (opts.tailGlow) {
    const g = new THREE.Mesh(new THREE.SphereGeometry(.12, 6, 5), glowMat(accent, .7))
    g.position.set(0, -.45, -.5)
    tail.add(g)
  }
  body.add(tail)
  root.userData.rig = { body, head, legL: legs[0], legR: legs[1], legs, tail, baseY: 0 }
  root.userData.kind = 'quadruped'
  root.scale.setScalar(def.scale || 1)
  return root
}

export function createEnemyModel(def) {
  const color = def.color || 0x3d5c46, accent = def.accent || 0xa9ff8a
  const scale = def.scale || 1
  let root
  if (def.model === 'wolf' || def.model === 'hound') {
    root = quadruped(def, { tailGlow: def.model === 'hound' })
    if (def.model === 'hound') {
      const glow = new THREE.Mesh(new THREE.TorusGeometry(.22, .015, 4, 16), glowMat(accent, .6))
      glow.rotation.x = Math.PI / 2
      glow.position.y = 1.24
      root.add(glow)
    }
  } else if (def.model === 'goblin') {
    root = createHumanoid({ colors: { skin: color, hair: 0x1f2a1f, outfit: 0x2f392e, trim: accent }, npcStyle: { eyes: 'glow' }, weapon: null, scale: .9 })
    root.userData.rig.armR.add(swordMesh('filo_alba', .8))
    const horn = mesh(new THREE.ConeGeometry(.05, .2, 4), std(0xd8c9a0), 0, .25, 0)
    root.userData.rig.head.add(horn)
  } else if (def.model === 'spore') {
    root = group()
    const body = group()
    root.add(body)
    const bulb = mesh(new THREE.SphereGeometry(.55, 8, 6), std(color, { transparent: true, opacity: .92 }), 0, 1.15, 0)
    bulb.scale.y = 1.15
    body.add(bulb)
    const cap = mesh(new THREE.ConeGeometry(.6, .45, 9), std(accent, { emissive: accent, emissiveIntensity: .18 }), 0, 1.62, 0)
    body.add(cap)
    for (let i = 0; i < 6; i++) {
      const t = group(Math.cos(i / 6 * Math.PI * 2) * .32, 1.0, Math.sin(i / 6 * Math.PI * 2) * .32)
      const tent = mesh(new THREE.CylinderGeometry(.035, .015, .8, 4), std(color))
      tent.position.y = -.35
      t.add(tent)
      body.add(t)
      t.userData.phase = i
    }
    const eye = new THREE.Mesh(new THREE.SphereGeometry(.13, 6, 5), glowMat(accent, .9))
    eye.position.set(0, 1.18, .5)
    body.add(eye)
    root.userData.rig = { body, head: bulb, baseY: 0 }
  } else if (def.model === 'colossus') {
    root = group()
    const body = group()
    root.add(body)
    const bark = std(0x4d4a30, { roughness: 1 })
    const moss = std(0x687a40, { roughness: 1 })
    const core = new THREE.Mesh(new THREE.IcosahedronGeometry(.48, 1), glowMat(accent, .85))
    body.add(mesh(new THREE.CylinderGeometry(.85, 1.05, 2.4, 7), bark, 0, 1.6, 0))
    const chest = mesh(new THREE.IcosahedronGeometry(.95, 0), bark, 0, 2.5, .15)
    chest.scale.set(1, .8, .7)
    body.add(chest)
    core.position.set(0, 2.55, .78)
    body.add(core)
    const head = group(0, 3.05, .25)
    head.add(mesh(new THREE.DodecahedronGeometry(.42, 0), moss, 0, 0, 0))
    head.add(mesh(new THREE.SphereGeometry(.08, 5, 4), glowMat(accent, .95), -.16, .06, .3, false))
    head.add(mesh(new THREE.SphereGeometry(.08, 5, 4), glowMat(accent, .95), .16, .06, .3, false))
    body.add(head)
    const arms = []
    for (const [side, x] of [[-1, -1.12], [1, 1.12]]) {
      const arm = group(x, 2.8, 0)
      const upper = mesh(new THREE.CylinderGeometry(.28, .22, 1.2, 6), bark, 0, -.55, 0)
      const fore = mesh(new THREE.CylinderGeometry(.24, .17, 1.1, 6), moss, 0, -1.55, .05)
      const fist = mesh(new THREE.DodecahedronGeometry(.34, 0), bark, 0, -2.13, .1)
      arm.add(upper, fore, fist)
      body.add(arm); arms.push(arm)
      const branch = mesh(new THREE.ConeGeometry(.08, .6, 4), moss, side * .2, -.25, 0)
      branch.rotation.z = side * .7
      arm.add(branch)
    }
    const legs = []
    for (const x of [-.45, .45]) {
      const leg = group(x, .55, 0)
      leg.add(mesh(new THREE.CylinderGeometry(.3, .4, .9, 6), bark, 0, -.3, 0))
      leg.add(mesh(new THREE.BoxGeometry(.58, .28, .72), bark, 0, -.8, .1))
      body.add(leg); legs.push(leg)
    }
    root.userData.rig = { body, head, armL: arms[0], armR: arms[1], legL: legs[0], legR: legs[1], core, baseY: 0 }
  } else if (def.model === 'automaton') {
    root = group()
    const body = group()
    root.add(body)
    const stone = std(0x8c8aa0, { metalness: .45, roughness: .5 })
    const glyph = glowMat(accent, .9)
    body.add(mesh(new THREE.OctahedronGeometry(.55, 0), stone, 0, 1.5, 0))
    body.add(mesh(new THREE.BoxGeometry(.9, .12, .9), stone, 0, .85, 0))
    for (let i = 0; i < 3; i++) {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(.75 + i * .13, .018, 4, 26), glowMat(accent, .45 - i * .08))
      ring.rotation.x = Math.PI / 2 + i * .5
      ring.rotation.y = i * .7
      ring.position.y = 1.5
      ring.userData.spin = .2 + i * .14
      body.add(ring)
    }
    const eye = new THREE.Mesh(new THREE.SphereGeometry(.11, 6, 5), glyph)
    eye.position.set(0, 1.55, .5)
    body.add(eye)
    const arms = []
    for (const x of [-.62, .62]) {
      const arm = group(x, 1.65, 0)
      arm.add(mesh(new THREE.BoxGeometry(.12, .7, .12), stone, 0, -.32, 0))
      arm.add(mesh(new THREE.BoxGeometry(.2, .2, .2), glyph, 0, -.7, 0))
      body.add(arm); arms.push(arm)
    }
    root.userData.rig = { body, head: body, armL: arms[0], armR: arms[1], baseY: 0, rings: true }
  } else if (def.model === 'watcher') {
    root = group()
    const body = group()
    root.add(body)
    const orb = mesh(new THREE.SphereGeometry(.62, 10, 8), std(0x5b617c, { roughness: .6 }), 0, 1.7, 0)
    body.add(orb)
    const iris = new THREE.Mesh(new THREE.SphereGeometry(.28, 8, 6), glowMat(accent, .95))
    iris.position.set(0, 1.7, .55)
    body.add(iris)
    const pupil = new THREE.Mesh(new THREE.SphereGeometry(.12, 6, 5), std(0x080b12))
    pupil.position.set(0, 1.7, .75)
    body.add(pupil)
    for (let i = 0; i < 5; i++) {
      const t = group(Math.cos(i / 5 * Math.PI * 2) * .4, 1.35, Math.sin(i / 5 * Math.PI * 2) * .4)
      const tent = mesh(new THREE.CylinderGeometry(.045, .012, 1.05, 4), std(0x6b6f8f))
      tent.position.y = -.5
      t.add(tent); body.add(t); t.userData.phase = i
    }
    root.userData.rig = { body, head: orb, baseY: 0 }
  } else if (def.model === 'wraith') {
    root = group()
    const body = group()
    root.add(body)
    const cloth = new THREE.Mesh(new THREE.ConeGeometry(.55, 1.65, 8, 1, true), std(0x312a45, { transparent: true, opacity: .88, side: THREE.DoubleSide }))
    cloth.position.y = 1.0
    body.add(cloth)
    const hood = mesh(new THREE.SphereGeometry(.3, 8, 6, 0, Math.PI * 2, 0, Math.PI * .7), std(0x211c30), 0, 1.85, 0)
    body.add(hood)
    const eye = new THREE.Mesh(new THREE.SphereGeometry(.045, 5, 4), glowMat(accent, .95))
    eye.position.set(-.08, 1.82, .24)
    const eye2 = eye.clone(); eye2.position.x = .08
    body.add(eye, eye2)
    const arms = []
    for (const x of [-.5, .5]) {
      const arm = group(x, 1.6, 0)
      arm.add(mesh(new THREE.CylinderGeometry(.045, .03, .8, 4), std(0x2a2439), 0, -.35, 0))
      body.add(arm); arms.push(arm)
    }
    root.userData.rig = { body, head: hood, armL: arms[0], armR: arms[1], baseY: 0 }
  } else if (def.model === 'seraph') {
    root = createHumanoid({ colors: { skin: 0xcfd1da, hair: 0xf0e2b0, outfit: 0x2e3854, trim: 0xffe4a8 }, npcStyle: { eyes: 'glow', veil: true }, equipment: { armor: 'armadura_celestial', weapon: 'espada_celestial' }, scale: 1.1, weaponScale: 1.2 })
    const wings = group()
    for (const side of [-1, 1]) {
      for (let i = 0; i < 3; i++) {
        const feather = mesh(new THREE.ConeGeometry(.16, 1.2 - i * .18, 4), std(0xe9dfc4, { emissive: 0xffe4a8, emissiveIntensity: .1, transparent: true, opacity: .9 }), side * (.38 + i * .18), 1.55 + i * .12, -.2)
        feather.rotation.z = side * (.55 + i * .2)
        feather.rotation.x = -.3
        wings.add(feather)
      }
    }
    root.userData.rig.body.add(wings)
    root.userData.rig.wings = wings
  } else if (def.model === 'convergence') {
    root = group()
    const body = group()
    root.add(body)
    const dark = std(0x171a29, { metalness: .3, roughness: .5 })
    const light = glowMat(0xffe6a8, .75)
    body.add(mesh(new THREE.CylinderGeometry(.48, .78, 2.2, 7), dark, 0, 1.35, 0))
    const head = mesh(new THREE.SphereGeometry(.33, 9, 7), std(0x22243a, { emissive: 0x5a567e, emissiveIntensity: .15 }), 0, 2.75, 0)
    body.add(head)
    const face = new THREE.Mesh(new THREE.SphereGeometry(.17, 8, 6), light)
    face.position.set(0, 2.75, .3)
    body.add(face)
    for (let i = 0; i < 3; i++) {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(1.25 + i * .16, .012, 4, 36), glowMat(0xffe6a8, .28))
      ring.position.y = 1.5 + i * .35
      ring.rotation.x = Math.PI / 2 + (i - 1) * .22
      body.add(ring)
      ring.userData.spin = .1 + i * .08
    }
    for (const x of [-.68, .68]) {
      const arm = group(x, 2.15, 0)
      arm.add(mesh(new THREE.CylinderGeometry(.08, .06, 1.1, 5), dark, 0, -.5, 0))
      body.add(arm)
    }
    const shards = new THREE.Group()
    for (let i = 0; i < 14; i++) {
      const sh = new THREE.Mesh(new THREE.TetrahedronGeometry(.12 + Math.random() * .14), glowMat(0xffe6a8, .35 + Math.random() * .4))
      sh.position.set((Math.random() - .5) * 3.4, 1 + Math.random() * 3, (Math.random() - .5) * 3.4)
      sh.userData.orbit = Math.random() * Math.PI * 2
      shards.add(sh)
    }
    body.add(shards)
    root.userData.rig = { body, head, baseY: 0, shards }
  } else if (def.model === 'lord') {
    root = createHumanoid({ colors: { skin: 0x8b6a58, hair: 0x1c1718, outfit: 0x2b2028, trim: 0xff7a45 }, npcStyle: { eyes: 'glow', cape: true }, equipment: { armor: 'manto_drakmor', helm: 'yelmo_guardian', weapon: 'hoja_ceniza' }, scale: 1.05, weaponScale: 1.15 })
    const crown = group(0, 1.84, 0)
    for (let i = 0; i < 5; i++) {
      const spike = mesh(new THREE.ConeGeometry(.03, .18 + (i === 2 ? .08 : 0), 4), std(0xffb05a, { emissive: 0xff5a1e, emissiveIntensity: .35 }), (i - 2) * .09, 0, 0)
      crown.add(spike)
    }
    root.userData.rig.head.add(crown)
    const fire = new THREE.Mesh(new THREE.IcosahedronGeometry(.16, 0), glowMat(0xff6a32, .7))
    fire.position.set(0, 1.2, .4)
    root.userData.rig.body.add(fire)
  } else if (def.model === 'mage') {
    root = createHumanoid({ colors: { skin: color, hair: 0x1e171c, outfit: 0x3e2838, trim: accent }, npcStyle: { eyes: 'glow', hood: true }, staff: true, staffColor: accent, weapon: null, scale: .95 })
    const orb = new THREE.Mesh(new THREE.IcosahedronGeometry(.24, 0), glowMat(accent, .35))
    orb.position.set(.48, 1.7, 0)
    root.userData.rig.body.add(orb)
  } else if (def.model === 'knight') {
    root = createHumanoid({ colors: { skin: 0x9a7a5a, hair: 0x241c18, outfit: 0x4a3838, trim: accent }, npcStyle: { eyes: 'glow' }, equipment: { armor: 'coraza_guardian', helm: 'yelmo_guardian', weapon: 'espada_vael' }, scale: .98 })
    const shield = group(-.42, 1.1, .1)
    shield.add(mesh(new THREE.CylinderGeometry(.34, .34, .06, 8), std(0x3a2e2e, { metalness: .5 }), 0, 0, 0))
    shield.rotation.x = Math.PI / 2
    shield.rotation.z = Math.PI / 2
    root.userData.rig.body.add(shield)
  } else {
    root = createHumanoid({ colors: { skin: color, hair: 0x1e1e26, outfit: color, trim: accent }, npcStyle: { eyes: 'glow' }, weapon: null, scale: .9 })
  }
  root.scale.setScalar(scale)
  root.userData.kind = root.userData.kind || 'enemy'
  return root
}

export function createCreatureModel(def) {
  const color = def.color || 0x9fe8ff, accent = def.accent || 0xffffff
  const root = group()
  const body = group()
  root.add(body)
  const m = std(color, { roughness: .6, emissive: color, emissiveIntensity: .08 })
  const a = std(accent, { emissive: accent, emissiveIntensity: .25 })
  if (def.model === 'fox') {
    const b = mesh(new THREE.SphereGeometry(.36, 8, 6), m, 0, .75, 0); b.scale.set(.7, .62, 1.15); body.add(b)
    const head = group(0, 1.02, .42)
    head.add(mesh(new THREE.SphereGeometry(.22, 7, 6), m))
    head.add(mesh(new THREE.ConeGeometry(.11, .26, 5), m, 0, -.02, .2).rotateX(Math.PI / 2))
    for (const x of [-.11, .11]) {
      const ear = mesh(new THREE.ConeGeometry(.07, .2, 4), a, x, .2, -.02); head.add(ear)
      head.add(mesh(new THREE.SphereGeometry(.026, 5, 4), glowMat(0xffffff, .9), x * .65, .03, .19, false))
    }
    body.add(head)
    for (const [x, z] of [[-.2, .3], [.2, .3], [-.2, -.28], [.2, -.28]]) {
      const leg = mesh(new THREE.CylinderGeometry(.05, .04, .4, 4), m, x, .4, z); body.add(leg)
    }
    for (let i = 0; i < 3; i++) {
      const tail = new THREE.Mesh(new THREE.SphereGeometry(.16 - i * .025, 6, 5), glowMat(accent, .55 + i * .12))
      tail.position.set(0, .85 + i * .13, -.48 - i * .1)
      body.add(tail)
    }
    root.userData.rig = { body, head, baseY: .1 }
  } else if (def.model === 'stag') {
    const b = mesh(new THREE.SphereGeometry(.42, 8, 6), m, 0, 1.0, 0); b.scale.set(.75, .7, 1.2); body.add(b)
    const head = group(0, 1.45, .55)
    head.add(mesh(new THREE.SphereGeometry(.2, 7, 6), m, 0, 0, .1))
    head.add(mesh(new THREE.ConeGeometry(.08, .22, 4), m, 0, -.03, .3).rotateX(Math.PI / 2))
    for (const side of [-1, 1]) {
      for (let i = 0; i < 3; i++) {
        const antler = mesh(new THREE.CylinderGeometry(.02, .015, .3 - i * .05, 4), a, side * (.08 + i * .08), .18 + i * .12, -.02)
        antler.rotation.z = side * (.2 + i * .32)
        head.add(antler)
      }
    }
    body.add(head)
    for (const [x, z] of [[-.24, .38], [.24, .38], [-.24, -.38], [.24, -.38]]) {
      const leg = mesh(new THREE.CylinderGeometry(.06, .045, .75, 4), m, x, .5, z); body.add(leg)
    }
    for (let i = 0; i < 5; i++) {
      const leaf = new THREE.Mesh(new THREE.SphereGeometry(.09, 5, 4), glowMat(accent, .55))
      leaf.position.set((Math.random() - .5) * .7, .6 + Math.random() * .8, (Math.random() - .5) * .7)
      body.add(leaf)
    }
    root.userData.rig = { body, head, baseY: 0 }
  } else if (def.model === 'bird') {
    const b = mesh(new THREE.SphereGeometry(.28, 8, 6), m, 0, 1.2, 0); b.scale.set(.8, .8, 1.1); body.add(b)
    const head = mesh(new THREE.SphereGeometry(.16, 7, 6), m, 0, 1.48, .22); body.add(head)
    body.add(mesh(new THREE.ConeGeometry(.05, .18, 4), a, 0, 1.45, .42).rotateX(Math.PI / 2))
    const wings = []
    for (const side of [-1, 1]) {
      const wing = group(side * .2, 1.28, 0)
      const w1 = mesh(new THREE.ConeGeometry(.14, .75, 4), a, side * .32, .05, 0); w1.rotation.z = side * 1.1
      wing.add(w1)
      body.add(wing); wings.push(wing)
    }
    for (let i = 0; i < 2; i++) {
      const tail = mesh(new THREE.ConeGeometry(.08, .42, 4), a, 0, 1.12 - i * .12, -.35 - i * .08)
      tail.rotation.x = -1.2
      body.add(tail)
    }
    root.userData.rig = { body, head, wings, baseY: 0 }
  } else if (def.model === 'salamander') {
    const b = mesh(new THREE.SphereGeometry(.34, 8, 6), m, 0, .62, 0); b.scale.set(.75, .55, 1.3); body.add(b)
    const head = mesh(new THREE.SphereGeometry(.2, 7, 6), m, 0, .7, .42); body.add(head)
    for (const x of [-.08, .08]) body.add(mesh(new THREE.SphereGeometry(.028, 5, 4), glowMat(accent, .9), x, .75, .59, false))
    const tail = mesh(new THREE.ConeGeometry(.12, .7, 5), m, 0, .62, -.55); tail.rotation.x = -Math.PI / 2; body.add(tail)
    for (const [x, z] of [[-.22, .24], [.22, .24], [-.22, -.22], [.22, -.22]]) {
      body.add(mesh(new THREE.CylinderGeometry(.045, .035, .25, 4), m, x, .4, z))
    }
    for (let i = 0; i < 5; i++) {
      const flame = new THREE.Mesh(new THREE.ConeGeometry(.05, .24, 4), glowMat(accent, .5))
      flame.position.set((i - 2) * .11, .98 + (i % 2) * .1, -.1 + i * .06)
      body.add(flame)
    }
    root.userData.rig = { body, head, baseY: 0 }
  } else if (def.model === 'cat') {
    const b = mesh(new THREE.SphereGeometry(.28, 8, 6), m, 0, .58, 0); b.scale.set(.8, .7, 1.3); body.add(b)
    const head = group(0, .82, .36)
    head.add(mesh(new THREE.SphereGeometry(.18, 7, 6), m))
    for (const x of [-.1, .1]) {
      const ear = mesh(new THREE.ConeGeometry(.055, .16, 4), m, x, .17, 0); head.add(ear)
      head.add(mesh(new THREE.SphereGeometry(.022, 5, 4), glowMat(accent, .9), x * .7, .02, .15, false))
    }
    body.add(head)
    for (const [x, z] of [[-.16, .24], [.16, .24], [-.16, -.22], [.16, -.22]]) {
      body.add(mesh(new THREE.CylinderGeometry(.04, .03, .35, 4), m, x, .3, z))
    }
    const tail = mesh(new THREE.ConeGeometry(.05, .65, 4), m, .18, .82, -.35); tail.rotation.x = -1.1; tail.rotation.z = .4; body.add(tail)
    root.userData.rig = { body, head, baseY: 0 }
  } else if (def.model === 'turtle') {
    const shell = mesh(new THREE.SphereGeometry(.55, 8, 6, 0, Math.PI * 2, 0, Math.PI / 2), std(color, { roughness: .9 }), 0, .55, 0)
    shell.scale.set(1.05, .75, 1.25)
    body.add(shell)
    body.add(mesh(new THREE.TorusGeometry(.45, .05, 4, 14), a, 0, .58, 0).rotateX(Math.PI / 2))
    const head = mesh(new THREE.SphereGeometry(.16, 7, 6), m, 0, .48, .56); body.add(head)
    for (const [x, z] of [[-.34, .3], [.34, .3], [-.34, -.28], [.34, -.28]]) {
      body.add(mesh(new THREE.CylinderGeometry(.09, .075, .22, 4), m, x, .25, z))
    }
    root.userData.rig = { body, head, baseY: 0 }
  } else if (def.model === 'jelly') {
    const bell = mesh(new THREE.SphereGeometry(.5, 10, 8, 0, Math.PI * 2, 0, Math.PI * .62), std(color, { transparent: true, opacity: .75, emissive: color, emissiveIntensity: .2 }), 0, 1.45, 0)
    bell.scale.y = .9
    body.add(bell)
    for (let i = 0; i < 7; i++) {
      const t = group(Math.cos(i / 7 * Math.PI * 2) * .3, 1.25, Math.sin(i / 7 * Math.PI * 2) * .3)
      const tent = mesh(new THREE.CylinderGeometry(.025, .012, .85 + (i % 3) * .18, 4), std(accent, { transparent: true, opacity: .55, emissive: accent, emissiveIntensity: .3 }))
      tent.position.y = -.42
      t.add(tent); t.userData.phase = i; body.add(t)
    }
    const core = new THREE.Mesh(new THREE.IcosahedronGeometry(.16, 0), glowMat(0xffffff, .7)); core.position.y = 1.42; body.add(core)
    root.userData.rig = { body, head: bell, baseY: 0 }
  } else {
    // Dragón de bolsillo
    const b = mesh(new THREE.SphereGeometry(.34, 8, 6), m, 0, .9, 0); b.scale.set(.8, .85, 1.15); body.add(b)
    const head = group(0, 1.22, .38)
    head.add(mesh(new THREE.SphereGeometry(.2, 8, 6), m))
    head.add(mesh(new THREE.ConeGeometry(.1, .3, 5), m, 0, -.03, .23).rotateX(Math.PI / 2))
    for (const x of [-.1, .1]) head.add(mesh(new THREE.ConeGeometry(.035, .18, 4), a, x, .2, -.04))
    for (const x of [-.07, .07]) head.add(mesh(new THREE.SphereGeometry(.024, 5, 4), glowMat(0xffffff, .95), x, .04, .18, false))
    body.add(head)
    const wings = []
    for (const side of [-1, 1]) {
      const wing = group(side * .22, 1.0, 0)
      const w = mesh(new THREE.ConeGeometry(.2, .6, 3), std(accent, { transparent: true, opacity: .6, emissive: accent, emissiveIntensity: .3 }), side * .3, .08, 0)
      w.rotation.z = side * 1.2
      wing.add(w); body.add(wing); wings.push(wing)
    }
    const tail = mesh(new THREE.ConeGeometry(.08, .75, 5), m, 0, .78, -.55); tail.rotation.x = -1.4; body.add(tail)
    for (let i = 0; i < 3; i++) {
      const sh = new THREE.Mesh(new THREE.OctahedronGeometry(.06), glowMat(accent, .6))
      sh.position.set((i - 1) * .3, 1.4 + i * .12, -.2)
      body.add(sh)
    }
    root.userData.rig = { body, head, wings, baseY: 0 }
  }
  root.scale.setScalar(1.15)
  root.userData.kind = 'creature'
  return root
}

export function createNameTag(text, sub = '', accent = 0xe4c27c) {
  const canvas = document.createElement('canvas')
  canvas.width = 512; canvas.height = 160
  const ctx = canvas.getContext('2d')
  ctx.clearRect(0, 0, 512, 160)
  ctx.textAlign = 'center'
  ctx.font = '600 44px Cinzel, serif'
  ctx.fillStyle = '#f2e7cc'
  ctx.shadowColor = 'rgba(0,0,0,.9)'; ctx.shadowBlur = 12
  ctx.fillText(text, 256, 62)
  ctx.font = '500 26px "Trebuchet MS", sans-serif'
  ctx.fillStyle = '#' + accent.toString(16).padStart(6, '0')
  ctx.fillText(sub, 256, 104)
  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false, opacity: .96 })
  const sprite = new THREE.Sprite(mat)
  sprite.scale.set(2.4, .75, 1)
  return sprite
}

export function createSword(itemId, scale = 1) { return swordMesh(itemId, scale) }

export function makeGlow(color, radius = .4) {
  const mat = glowMat(color, .4)
  return new THREE.Mesh(new THREE.SphereGeometry(radius, 8, 6), mat)
}
