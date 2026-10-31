import * as THREE from 'three'

const rand = (a, b) => a + Math.random() * (b - a)

function additive(color, opacity = .9) {
  return new THREE.PointsMaterial({
    color, size: .13, transparent: true, opacity, depthWrite: false,
    blending: THREE.AdditiveBlending, sizeAttenuation: true
  })
}

export class Effects {
  constructor(game) {
    this.game = game
    this.bursts = []
    this.rings = []
    this.slashes = []
    this.beams = []
    this.auras = []
    this.projectiles = []
  }

  burst(pos, color = 0xffe0a8, count = 18, opts = {}) {
    const n = Math.max(4, count)
    const positions = new Float32Array(n * 3)
    const velocities = []
    for (let i = 0; i < n; i++) {
      positions[i * 3] = pos.x + rand(-.15, .15)
      positions[i * 3 + 1] = pos.y + rand(-.1, .2)
      positions[i * 3 + 2] = pos.z + rand(-.15, .15)
      const a = Math.random() * Math.PI * 2
      const up = rand(.2, 1.1)
      const sp = rand(opts.speedMin ?? .8, opts.speed ?? 3.4)
      velocities.push(new THREE.Vector3(Math.cos(a) * sp, up * sp, Math.sin(a) * sp))
    }
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    const mat = additive(color, opts.opacity ?? .9)
    mat.size = opts.size ?? .13
    const points = new THREE.Points(geo, mat)
    points.frustumCulled = false
    this.game.scene.add(points)
    this.bursts.push({
      points, velocities, life: 0, maxLife: opts.life ?? .7,
      gravity: opts.gravity ?? -3.2, drag: opts.drag ?? .96
    })
  }

  ring(pos, color = 0xffe0a8, radius = 2.4, opts = {}) {
    const geo = new THREE.RingGeometry(.18, .34, 32)
    const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: .85, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, depthWrite: false })
    const m = new THREE.Mesh(geo, mat)
    m.rotation.x = -Math.PI / 2
    m.position.copy(pos)
    m.position.y += .06
    this.game.scene.add(m)
    this.rings.push({ mesh: m, life: 0, maxLife: opts.life ?? .65, radius, color })
    return m
  }

  slash(pos, yaw, color = 0xffd9a0, scale = 1.5) {
    const geo = new THREE.RingGeometry(scale * .45, scale * 1.1, 24, 1, -Math.PI * .32, Math.PI * .64)
    const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: .8, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, depthWrite: false })
    const m = new THREE.Mesh(geo, mat)
    m.rotation.x = -Math.PI / 2
    m.rotation.z = -yaw + Math.PI / 2
    m.position.copy(pos)
    m.position.y += 1.0
    this.game.scene.add(m)
    this.slashes.push({ mesh: m, life: 0, maxLife: .26 })
  }

  beam(from, to, color = 0x9fe8ff, width = .09) {
    const dir = new THREE.Vector3().subVectors(to, from)
    const len = dir.length()
    const geo = new THREE.CylinderGeometry(width, width * .45, len, 6, 1, true)
    const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: .9, blending: THREE.AdditiveBlending, depthWrite: false })
    const m = new THREE.Mesh(geo, mat)
    m.position.copy(from).add(to).multiplyScalar(.5)
    m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize())
    this.game.scene.add(m)
    this.beams.push({ mesh: m, life: 0, maxLife: .3 })
  }

  aura(target, color = 0x9fe8ff, radius = 1.1) {
    const g = new THREE.Group()
    const ring1 = new THREE.Mesh(new THREE.TorusGeometry(radius, .025, 4, 28), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: .65, blending: THREE.AdditiveBlending, depthWrite: false }))
    ring1.rotation.x = Math.PI / 2
    const ring2 = ring1.clone()
    ring2.rotation.z = Math.PI / 3
    ring2.rotation.x = Math.PI / 3
    g.add(ring1, ring2)
    const light = new THREE.PointLight(color, .7, radius * 4)
    g.add(light)
    target.add(g)
    const item = { group: g, target, life: 0, maxLife: 1e9, color, radius }
    this.auras.push(item)
    return item
  }

  removeAura(item) {
    if (!item) return
    item.target?.remove(item.group)
    item.group.traverse(o => { o.geometry?.dispose?.(); o.material?.dispose?.() })
    const i = this.auras.indexOf(item)
    if (i >= 0) this.auras.splice(i, 1)
  }

  projectile(opts) {
    const color = opts.color ?? 0xff8a4c
    const radius = opts.radius ?? .22
    const mesh = new THREE.Mesh(
      new THREE.IcosahedronGeometry(radius, 0),
      new THREE.MeshBasicMaterial({ color, transparent: true, opacity: .95, blending: THREE.AdditiveBlending, depthWrite: false })
    )
    mesh.position.copy(opts.pos)
    const light = new THREE.PointLight(color, .8, 4)
    mesh.add(light)
    const halo = new THREE.Mesh(new THREE.SphereGeometry(radius * 1.8, 8, 6), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: .16, blending: THREE.AdditiveBlending, depthWrite: false }))
    mesh.add(halo)
    this.game.scene.add(mesh)
    const dir = opts.dir.clone().normalize()
    const p = {
      mesh, pos: mesh.position, dir, speed: opts.speed ?? 18, damage: opts.damage ?? 10,
      owner: opts.owner ?? 'enemy', life: 0, maxLife: opts.life ?? 3, radius,
      onHit: opts.onHit, homing: opts.homing ?? 0, target: opts.target || null, color
    }
    this.projectiles.push(p)
    return p
  }

  update(dt) {
    const game = this.game
    for (let i = this.bursts.length - 1; i >= 0; i--) {
      const b = this.bursts[i]
      b.life += dt
      const arr = b.points.geometry.attributes.position.array
      for (let j = 0; j < b.velocities.length; j++) {
        const v = b.velocities[j]
        v.y += b.gravity * dt
        v.multiplyScalar(Math.pow(b.drag, dt * 60))
        arr[j * 3] += v.x * dt
        arr[j * 3 + 1] += v.y * dt
        arr[j * 3 + 2] += v.z * dt
      }
      b.points.geometry.attributes.position.needsUpdate = true
      b.points.material.opacity = Math.max(0, 1 - b.life / b.maxLife)
      if (b.life >= b.maxLife) {
        game.scene.remove(b.points)
        b.points.geometry.dispose(); b.points.material.dispose()
        this.bursts.splice(i, 1)
      }
    }
    for (let i = this.rings.length - 1; i >= 0; i--) {
      const r = this.rings[i]
      r.life += dt
      const t = Math.min(1, r.life / r.maxLife)
      r.mesh.scale.setScalar(.6 + t * r.radius)
      r.mesh.material.opacity = (1 - t) * .7
      if (t >= 1) {
        game.scene.remove(r.mesh); r.mesh.geometry.dispose(); r.mesh.material.dispose()
        this.rings.splice(i, 1)
      }
    }
    for (let i = this.slashes.length - 1; i >= 0; i--) {
      const s = this.slashes[i]
      s.life += dt
      const t = Math.min(1, s.life / s.maxLife)
      s.mesh.material.opacity = (1 - t) * .85
      s.mesh.scale.setScalar(1 + t * .25)
      if (t >= 1) {
        game.scene.remove(s.mesh); s.mesh.geometry.dispose(); s.mesh.material.dispose()
        this.slashes.splice(i, 1)
      }
    }
    for (let i = this.beams.length - 1; i >= 0; i--) {
      const b = this.beams[i]
      b.life += dt
      const t = Math.min(1, b.life / b.maxLife)
      b.mesh.material.opacity = (1 - t) * .9
      if (t >= 1) {
        game.scene.remove(b.mesh); b.mesh.geometry.dispose(); b.mesh.material.dispose()
        this.beams.splice(i, 1)
      }
    }
    for (const a of this.auras) {
      a.life += dt
      a.group.rotation.y += dt * 1.3
      a.group.children[0].rotation.z += dt * .7
      a.group.children[1].rotation.x += dt * .5
    }
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i]
      p.life += dt
      if (p.homing && p.target?.alive) {
        const want = new THREE.Vector3(p.target.pos.x, p.target.pos.y + 1, p.target.pos.z).sub(p.pos).normalize()
        p.dir.lerp(want, Math.min(1, p.homing * dt)).normalize()
      }
      p.pos.addScaledVector(p.dir, p.speed * dt)
      if (p.life >= p.maxLife) {
        this.removeProjectile(i); continue
      }
      if (p.owner === 'enemy' && game.player && !game.player.dead) {
        const d = Math.hypot(p.pos.x - game.player.pos.x, p.pos.z - game.player.pos.z)
        const dy = Math.abs(p.pos.y - (game.player.pos.y + 1))
        if (d < .75 + p.radius && dy < 1.4) {
          p.onHit?.(game.player)
          game.player.takeDamage(p.damage, { ranged: true })
          game.fx.burst(p.pos, p.color, 10, { speed: 2 })
          this.removeProjectile(i); continue
        }
      } else if (p.owner === 'player' && game.world) {
        for (const e of game.world.enemies) {
          if (!e.alive) continue
          const d = Math.hypot(p.pos.x - e.pos.x, p.pos.z - e.pos.z)
          if (d < e.def.radius + p.radius && Math.abs(p.pos.y - (e.pos.y + 1)) < 1.6) {
            e.takeDamage(p.damage, { source: 'skill' })
            game.fx.burst(p.pos, p.color, 12, { speed: 2.4 })
            p.onHit?.(e)
            this.removeProjectile(i); break
          }
        }
      }
    }
  }

  removeProjectile(i) {
    const p = this.projectiles[i]
    if (!p) return
    this.game.scene.remove(p.mesh)
    p.mesh.traverse(o => { o.geometry?.dispose?.(); o.material?.dispose?.() })
    this.projectiles.splice(i, 1)
  }

  clearProjectiles() {
    for (let i = this.projectiles.length - 1; i >= 0; i--) this.removeProjectile(i)
  }

  dispose() {
    for (const b of this.bursts) { this.game.scene?.remove(b.points); b.points.geometry.dispose(); b.points.material.dispose() }
    for (const r of this.rings) { this.game.scene?.remove(r.mesh); r.mesh.geometry.dispose(); r.mesh.material.dispose() }
    for (const s of this.slashes) { this.game.scene?.remove(s.mesh); s.mesh.geometry.dispose(); s.mesh.material.dispose() }
    for (const b of this.beams) { this.game.scene?.remove(b.mesh); b.mesh.geometry.dispose(); b.mesh.material.dispose() }
    for (const a of [...this.auras]) this.removeAura(a)
    this.clearProjectiles()
    this.bursts = []; this.rings = []; this.slashes = []; this.beams = []
  }
}
