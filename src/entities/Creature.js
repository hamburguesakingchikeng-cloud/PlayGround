import * as THREE from 'three'
import { CREATURES } from '../data/creatures.js'
import { createCreatureModel, createNameTag } from '../world/models.js'
import { clamp, dampAngle, rand, TAU } from '../utils/math.js'

// Criatura salvaje: deambula, huye si te acercas y puede ser debilitada y capturada.
// No ataca al jugador; su desafío es acercarse sin asustarla y medir sus fuerzas.
export class Creature {
  constructor(game, defId, x, z, opts = {}) {
    this.game = game
    this.defId = defId
    this.def = CREATURES[defId]
    if (!this.def) throw new Error(`Criatura desconocida: ${defId}`)
    this.level = opts.level || 1
    this.maxHp = Math.round(this.def.hp * (1 + (this.level - 1) * .14))
    this.hp = this.maxHp
    this.radius = .55
    this.caught = false
    this.dead = false
    this.deadTimer = 0
    this.respawnTimer = 0
    this.home = new THREE.Vector3(x, 0, z)
    this.pos = new THREE.Vector3(x, 0, z)
    this.facing = Math.random() * TAU
    this.wanderTimer = rand(1.5, 5)
    this.wanderTarget = null
    this.fleeTime = 0
    this.hurtFlash = 0
    this.hitCooldown = 0
    this.phase = Math.random() * TAU
    this.mesh = createCreatureModel(this.def)
    this.mesh.scale.setScalar(1.02)
    const ground = game.world?.zone?.heightAt(x, z) ?? 0
    this.pos.y = ground
    this.mesh.position.copy(this.pos)
    this.mesh.rotation.y = this.facing
    this.light = new THREE.PointLight(this.def.color, .55, 4.5)
    this.light.position.y = 1
    this.mesh.add(this.light)
    this.tag = createNameTag(this.def.name, `${this.def.element} · ${this.def.rarity}`, this.def.color)
    this.tag.scale.set(1.8, .56, 1)
    this.tag.position.y = 2.05
    this.mesh.add(this.tag)
    game.scene?.add(this.mesh)
    // Pequeñas motas de su elemento
    this.motes = this.createMotes()
    this.mesh.add(this.motes)
  }

  createMotes() {
    const count = 9
    const positions = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      positions[i * 3] = rand(-.55, .55)
      positions[i * 3 + 1] = rand(.25, 1.5)
      positions[i * 3 + 2] = rand(-.55, .55)
    }
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    const mat = new THREE.PointsMaterial({
      color: this.def.color, size: .055, transparent: true, opacity: .8,
      depthWrite: false, blending: THREE.AdditiveBlending
    })
    return new THREE.Points(geo, mat)
  }

  update(dt) {
    if (this.caught) return
    if (this.dead) {
      this.deadTimer += dt
      this.respawnTimer -= dt
      if (this.deadTimer > .25) {
        this.mesh.position.y -= dt * .25
        this.mesh.rotation.z += dt * .3
        this.mesh.visible = this.deadTimer < 2.1
      }
      if (this.respawnTimer <= 0) this.respawn()
      return
    }
    if (this.game.state !== 'playing') {
      this.animate(dt, 0)
      return
    }
    dt = Math.min(dt, .05)
    if (this.hitCooldown > 0) this.hitCooldown -= dt
    if (this.hurtFlash > 0) {
      this.hurtFlash -= dt
      this.mesh.traverse(o => { if (o.material?.emissive) o.material.emissive.setHex(this.hurtFlash > 0 ? 0x7a1e16 : 0x000000) })
    }
    const player = this.game.player
    let speed = 0
    if (player && !player.dead) {
      const dx = player.pos.x - this.pos.x, dz = player.pos.z - this.pos.z
      const dist = Math.hypot(dx, dz)
      if (dist < 3.4) {
        this.fleeTime = 1.4
        const away = Math.atan2(-dx, -dz)
        this.facing = dampAngle(this.facing, away, 8, dt)
        speed = 2.35
      } else if (this.fleeTime > 0) {
        this.fleeTime -= dt
        speed = 2.1
      }
    }
    if (speed > 0) {
      const nx = this.pos.x + Math.sin(this.facing) * speed * dt
      const nz = this.pos.z + Math.cos(this.facing) * speed * dt
      const zone = this.game.world?.zone
      const b = (zone?.bounds || 70) - 5
      const resolved = this.game.world?.resolveCollision?.(nx, nz, this.radius) || { x: nx, z: nz }
      this.pos.x = clamp(resolved.x, -b, b)
      this.pos.z = clamp(resolved.z, -b, b)
      // No huir hacia el agua profunda
      if (zone?.isWater?.(this.pos.x, this.pos.z) && zone.heightAt(this.pos.x, this.pos.z) < -1.8) {
        this.pos.x -= Math.sin(this.facing) * speed * dt * 2
        this.pos.z -= Math.cos(this.facing) * speed * dt * 2
      }
    } else {
      this.wanderTimer -= dt
      if (this.wanderTimer <= 0) {
        this.wanderTimer = rand(2.6, 6.5)
        const a = Math.random() * TAU, r = rand(1, 5.2)
        this.wanderTarget = { x: this.home.x + Math.cos(a) * r, z: this.home.z + Math.sin(a) * r }
      }
      if (this.wanderTarget) {
        const dx = this.wanderTarget.x - this.pos.x, dz = this.wanderTarget.z - this.pos.z
        const d = Math.hypot(dx, dz)
        if (d > .35) {
          this.facing = dampAngle(this.facing, Math.atan2(dx, dz), 5, dt)
          this.pos.x += Math.sin(this.facing) * 1.05 * dt
          this.pos.z += Math.cos(this.facing) * 1.05 * dt
          speed = 1.05
        } else this.wanderTarget = null
      }
      // Regeneración lenta si no ha recibido daño recientemente
      if (this.hitCooldown <= -5) this.hp = Math.min(this.maxHp, this.hp + this.maxHp * .04 * dt)
    }
    const zone = this.game.world?.zone
    this.pos.y = zone ? zone.heightAt(this.pos.x, this.pos.z) : 0
    this.mesh.position.copy(this.pos)
    this.mesh.rotation.y = this.facing
    // Etiqueta: solo visible cerca
    if (player) {
      const d = Math.hypot(player.pos.x - this.pos.x, player.pos.z - this.pos.z)
      this.tag.material.opacity = d < 18 ? .92 : 0
      this.light.intensity = d < 22 ? .55 : 0
    }
    this.motes.rotation.y += dt * .8
    this.animate(dt, speed)
  }

  animate(dt, speed = 0) {
    const rig = this.mesh.userData.rig
    if (!rig) return
    this.phase += dt * (2 + speed * 1.4)
    const t = this.phase
    if (rig.body) {
      rig.body.position.y = (rig.baseY || 0) + Math.sin(t * 2) * .035
      rig.body.rotation.z = Math.sin(t * 1.2) * .025
    }
    if (rig.head) rig.head.rotation.y = Math.sin(t * .7) * .08
    if (rig.legL && rig.legR) {
      rig.legL.rotation.x = Math.sin(t * 4) * .2 * Math.min(1, speed)
      rig.legR.rotation.x = -Math.sin(t * 4) * .2 * Math.min(1, speed)
    }
    if (rig.legs) rig.legs.forEach((l, i) => { l.rotation.x = Math.sin(t * 4 + (i % 2) * Math.PI) * .2 * Math.min(1, speed) })
    if (rig.wings) rig.wings.forEach((w, i) => { w.rotation.z = Math.sin(t * 5 + i) * .28 })
  }

  takeDamage(amount, opts = {}) {
    if (this.dead || this.caught || this.hitCooldown > 0) return
    const dmg = Math.max(1, Math.round(amount))
    this.hp = Math.max(0, this.hp - dmg)
    this.hitCooldown = .18
    this.hurtFlash = .12
    this.fleeTime = 1.8
    this.game.ui?.setTarget?.(this)
    const p = this.game.projectPoint(new THREE.Vector3(this.pos.x, this.pos.y + 1.7, this.pos.z))
    this.game.ui?.damageAt?.(p.x, p.y, `${dmg}`, opts.crit ? 'crit' : '')
    this.game.audio?.sfx(opts.crit ? 'crit' : 'hit')
    this.game.fx.burst(new THREE.Vector3(this.pos.x, this.pos.y + .8, this.pos.z), this.def.color, 10, { speed: 2.2, life: .4 })
    this.game.ui?.refreshHUD?.()
    if (this.hp <= 0) this.die()
  }

  die() {
    if (this.dead) return
    this.dead = true
    this.deadTimer = 0
    this.respawnTimer = 45
    this.game.ui?.setTarget?.(null)
    this.game.fx.burst(new THREE.Vector3(this.pos.x, this.pos.y + .8, this.pos.z), this.def.color, 26, { speed: 3, life: 1 })
    this.game.audio?.sfx('death')
    this.game.toast(`${this.def.name} se desvanece. Volverá a cantar en otro momento.`, '❖')
  }

  respawn() {
    this.dead = false
    this.deadTimer = 0
    this.hp = this.maxHp
    this.mesh.visible = true
    this.mesh.position.copy(this.pos)
    this.mesh.rotation.set(0, this.facing, 0)
    this.game.fx?.burst(new THREE.Vector3(this.pos.x, this.pos.y + .8, this.pos.z), this.def.color, 16, { speed: 2 })
  }

  capture() {
    if (this.caught || this.dead) return false
    this.caught = true
    this.game.fx.burst(new THREE.Vector3(this.pos.x, this.pos.y + .9, this.pos.z), this.def.color, 40, { speed: 3.5, life: 1.2 })
    this.game.fx.ring(new THREE.Vector3(this.pos.x, this.pos.y, this.pos.z), this.def.color, 3.2, { life: .8 })
    this.game.audio?.sfx('capture')
    this.remove()
    return true
  }

  remove() {
    if (!this.mesh.parent) return
    this.mesh.parent.remove(this.mesh)
    this.mesh.traverse(o => { o.geometry?.dispose?.(); if (o.material && !Array.isArray(o.material)) o.material.dispose() })
  }
}
