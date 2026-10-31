import * as THREE from 'three'
import { ENEMIES } from '../data/enemies.js'
import { createEnemyModel } from '../world/models.js'
import { clamp, dampAngle, rand, TAU } from '../utils/math.js'

export class Enemy {
  constructor(game, defId, x, z, opts = {}) {
    this.game = game
    this.defId = defId
    this.def = ENEMIES[defId]
    if (!this.def) throw new Error(`Enemigo desconocido: ${defId}`)
    this.level = opts.level || 1
    const scale = 1 + Math.max(0, this.level - 1) * .08
    this.maxHp = Math.round(this.def.hp * (this.def.boss ? 1 : scale))
    this.hp = this.maxHp
    this.damage = this.def.damage * (this.def.boss ? 1 : 1 + Math.max(0, this.level - 1) * .05)
    this.alive = true
    this.boss = !!this.def.boss
    this.facing = Math.random() * TAU
    this.home = new THREE.Vector3(x, 0, z)
    this.pos = new THREE.Vector3(x, 0, z)
    this.state = 'idle'
    this.wanderTime = rand(1, 4)
    this.wanderDir = new THREE.Vector3()
    this.attackWindup = 0
    this.attackTimer = 0
    this.cooldown = rand(.8, 1.8)
    this.stagger = 0
    this.stunTime = 0
    this.slowTime = 0
    this.slowFactor = 1
    this.burnTime = 0
    this.burnDps = 0
    this.tauntTime = 0
    this.aggroTime = 0
    this.phase = 0
    this.phaseCount = this.boss ? 3 : 1
    this.specialTimer = 6
    this.invuln = 0
    this.deathTimer = 0
    this.bossDefeated = false
    this.orbit = Math.random() * TAU
    this.mesh = createEnemyModel(this.def)
    const ground = game.world?.zone?.heightAt(x, z) ?? 0
    this.pos.y = ground
    this.mesh.position.copy(this.pos)
    this.mesh.rotation.y = this.facing
    game.scene?.add(this.mesh)
    this.light = null
    if (this.boss) {
      this.light = new THREE.PointLight(this.def.accent, 1.4, 12)
      this.light.position.y = 2
      this.mesh.add(this.light)
    }
  }

  get radius() { return this.def.radius || .7 }

  update(dt) {
    if (!this.alive) {
      this.deathTimer += dt
      if (this.deathTimer > .2) {
        this.mesh.position.y -= dt * .6
        this.mesh.rotation.z += dt * .5
        this.mesh.traverse(o => { if (o.material?.opacity !== undefined && o.material.transparent) o.material.opacity = Math.max(0, o.material.opacity - dt * .6) })
      }
      if (this.deathTimer > 2.2) this.remove()
      return
    }
    if (this.game.state !== 'playing') return
    dt = Math.min(dt, .05)
    if (this.invuln > 0) this.invuln -= dt
    if (this.stunTime > 0) {
      this.stunTime -= dt
      this.animate(dt, true)
      return
    }
    if (this.slowTime > 0) { this.slowTime -= dt; if (this.slowTime <= 0) this.slowFactor = 1 }
    if (this.tauntTime > 0) this.tauntTime -= dt
    if (this.burnTime > 0) {
      this.burnTime -= dt
      this.burnTick = (this.burnTick || 0) + dt
      if (this.burnTick > .55) {
        this.burnTick = 0
        this.takeDamage(this.burnDps, { source: 'burn', silent: true })
        if (!this.alive) return
      }
    }

    const player = this.game.player
    if (!player || player.dead) { this.animate(dt, true); return }
    const dx = player.pos.x - this.pos.x, dz = player.pos.z - this.pos.z
    const dist = Math.hypot(dx, dz)
    if (dist < this.def.aggro && this.state === 'idle') {
      this.state = 'chase'
      if (this.boss) this.game.onBossAggro?.(this)
    }
    if (dist > this.def.aggro * 1.9 && !this.boss) {
      this.aggroTime += dt
      if (this.aggroTime > 6) { this.state = 'return'; this.aggroTime = 0 }
    } else this.aggroTime = 0

    if (this.def.boss) this.updatePhase(dist)

    if (this.cooldown > 0) this.cooldown -= dt
    if (this.specialTimer > 0) this.specialTimer -= dt

    if (this.state === 'return') {
      const hd = Math.hypot(this.home.x - this.pos.x, this.home.z - this.pos.z)
      if (hd < 1.5) { this.state = 'idle'; this.hp = Math.min(this.maxHp, this.hp + this.maxHp * .4) }
      else this.moveToward(this.home.x, this.home.z, this.def.speed * dt, dt)
      this.animate(dt)
      return
    }

    if (this.attackWindup > 0) {
      this.attackWindup -= dt
      this.facing = dampAngle(this.facing, Math.atan2(dx, dz), 6, dt)
      this.mesh.rotation.y = this.facing
      if (this.attackWindup <= 0) this.executeAttack(dist)
      this.animate(dt, false, true)
      return
    }

    if (this.state === 'idle') {
      this.wanderTime -= dt
      if (this.wanderTime <= 0) {
        this.wanderTime = rand(2.5, 6)
        const a = Math.random() * TAU, r = rand(1, 5)
        this.wanderTarget = { x: this.home.x + Math.cos(a) * r, z: this.home.z + Math.sin(a) * r }
      }
      if (this.wanderTarget) {
        const wd = Math.hypot(this.wanderTarget.x - this.pos.x, this.wanderTarget.z - this.pos.z)
        if (wd > .4) this.moveToward(this.wanderTarget.x, this.wanderTarget.z, this.def.speed * .32 * dt, dt)
        else this.wanderTarget = null
      }
      this.animate(dt, true)
      return
    }

    // Persecución
    this.facing = dampAngle(this.facing, Math.atan2(dx, dz), this.boss ? 4.2 : 7, dt)
    this.mesh.rotation.y = this.facing
    if (this.boss && this.specialTimer <= 0 && dist < 18) {
      this.useSpecial(dist)
      return
    }
    const range = this.def.attackRange
    if (dist > range) {
      const speed = this.def.speed * (this.boss ? 1 + this.phase * .1 : 1) * (this.slowFactor || 1)
      this.moveToward(player.pos.x, player.pos.z, speed * dt, dt)
    } else if (this.cooldown <= 0) {
      this.beginAttack()
    }
    this.animate(dt)
  }

  updatePhase(dist) {
    const pct = this.hp / this.maxHp
    const wanted = pct < .33 ? 2 : pct < .66 ? 1 : 0
    if (wanted > this.phase) {
      this.phase = wanted
      this.damage *= 1.12
      this.specialTimer = 1.6
      this.invuln = .5
      const pos = new THREE.Vector3(this.pos.x, this.pos.y + 1, this.pos.z)
      this.game.fx.ring(pos, this.def.accent, 6 + this.phase * 2, { life: 1 })
      this.game.fx.burst(pos, this.def.accent, 30, { speed: 5 })
      this.game.shakeCamera?.(.3, .35)
      this.game.audio?.sfx('boss')
      this.game.toast(`${this.def.name} cambia de fase.`, '⚠')
      this.game.ui?.updateBoss?.(pct, this.phase)
    }
  }

  beginAttack() {
    this.attackWindup = this.boss ? .72 : .46
    this.cooldown = (this.def.cooldown || 2) * (this.boss ? .9 : 1) * rand(.88, 1.12) / (1 + this.phase * .18)
    this.attackTimer = this.attackWindup
    this.game.audio?.sfx('swing')
    const pos = new THREE.Vector3(this.pos.x, this.pos.y + .12, this.pos.z)
    this.game.fx.ring(pos, this.def.boss ? 0xff6a4a : 0xffb28a, this.def.attackRange * .8, { life: this.attackWindup, opacity: .5 })
  }

  executeAttack(dist) {
    const player = this.game.player
    this.attackTimer = 0
    if (!player || player.dead) return
    this.game.audio?.sfx(this.def.boss ? 'heavy' : 'swing')
    if (this.def.ranged) {
      this.fireProjectile(player, this.def.boss ? 1.2 : 1)
      if (this.def.boss) this.fireFan(player, 3, .28)
    } else if (dist < this.def.attackRange + .9) {
      player.takeDamage(this.damage, { source: this, heavy: this.def.boss })
      this.game.fx.slash(new THREE.Vector3(this.pos.x, this.pos.y, this.pos.z), this.facing, this.def.accent, this.boss ? 2.5 : 1.4)
    }
    if (this.boss) {
      const pos = new THREE.Vector3(this.pos.x, this.pos.y, this.pos.z)
      this.game.fx.ring(pos, this.def.accent, this.def.attackRange + 2.5, { life: .6 })
    }
  }

  fireProjectile(player, spread = 0) {
    const from = new THREE.Vector3(this.pos.x, this.pos.y + 1.25, this.pos.z)
    const target = new THREE.Vector3(player.pos.x, player.pos.y + 1.1, player.pos.z)
    const dir = target.sub(from).normalize()
    if (spread) { dir.x += rand(-spread, spread); dir.z += rand(-spread, spread); dir.normalize() }
    this.game.fx.projectile({
      pos: from, dir, speed: this.def.boss ? 13 : 11, damage: this.damage,
      color: this.def.accent, owner: 'enemy', radius: .22, life: 4
    })
  }

  fireFan(player, count = 5, spread = .42) {
    const from = new THREE.Vector3(this.pos.x, this.pos.y + 1.3, this.pos.z)
    const target = new THREE.Vector3(player.pos.x, player.pos.y + 1, player.pos.z)
    const base = target.sub(from).normalize()
    for (let i = 0; i < count; i++) {
      const a = (i - (count - 1) / 2) * spread
      const dir = base.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), a)
      this.game.fx.projectile({
        pos: from.clone(), dir, speed: 10, damage: this.damage * .8,
        color: this.def.accent, owner: 'enemy', radius: .24, life: 4.5
      })
    }
  }

  useSpecial(dist) {
    this.specialTimer = this.boss ? rand(7.5, 11) : 10
    const player = this.game.player
    if (!player) return
    if (this.def.model === 'colossus') {
      this.slamAttack(player, 7.5)
    } else if (this.def.model === 'lord') {
      this.fireFan(player, 5, .5)
      this.game.fx.ring(new THREE.Vector3(this.pos.x, this.pos.y, this.pos.z), 0xff6a32, 4, { life: .8 })
      this.game.toast('Varok invoca la Corona de Brasas.', '⚠')
    } else if (this.def.model === 'convergence') {
      this.fireFan(player, 9, .32)
      this.slamAttack(player, 6.5, 1.2)
      this.game.toast('La Convergencia repite todos tus ataques.', '⚠')
    } else if (this.def.model === 'seraph') {
      this.slamAttack(player, 6)
      this.healSelf(this.maxHp * .03)
    } else {
      this.fireFan(player, 5, .45)
    }
  }

  slamAttack(player, radius = 6, delay = 1.05) {
    const target = new THREE.Vector3(player.pos.x, player.pos.y, player.pos.z)
    const ring = this.game.fx.ring(target, 0xff5a3c, radius, { life: delay, opacity: .8 })
    ring.material.opacity = .25
    setTimeout(() => {
      if (!this.alive || this.game.state === 'destroyed') return
      this.game.fx.ring(target, 0xff7a45, radius * 1.15, { life: .7 })
      this.game.fx.burst(new THREE.Vector3(target.x, target.y + .5, target.z), 0xff7a45, 30, { speed: 6 })
      this.game.shakeCamera?.(.45, .4)
      this.game.audio?.sfx('heavy')
      if (this.game.player && Math.hypot(this.game.player.pos.x - target.x, this.game.player.pos.z - target.z) < radius) {
        this.game.player.takeDamage(this.damage * 1.35, { source: this, heavy: true })
      }
      for (const e of this.game.world?.enemies || []) {
        if (e !== this && e.alive && Math.hypot(e.pos.x - target.x, e.pos.z - target.z) < radius) e.takeDamage(this.damage * .3, { silent: true })
      }
    }, delay * 1000)
  }

  moveToward(x, z, step, dt) {
    const dx = x - this.pos.x, dz = z - this.pos.z
    const d = Math.hypot(dx, dz) || 1
    const nx = this.pos.x + dx / d * step
    const nz = this.pos.z + dz / d * step
    const resolved = this.game.world?.resolveCollision?.(nx, nz, this.radius) || { x: nx, z: nz }
    this.pos.x = resolved.x
    this.pos.z = resolved.z
    const zone = this.game.world?.zone
    if (zone) this.pos.y = zone.heightAt(this.pos.x, this.pos.z)
    this.mesh.position.copy(this.pos)
    this.animate(dt)
  }

  healSelf(amount) {
    this.hp = Math.min(this.maxHp, this.hp + amount)
    this.game.fx.burst(new THREE.Vector3(this.pos.x, this.pos.y + 1.5, this.pos.z), 0x9fe7a2, 14, { speed: 2, gravity: 1 })
  }

  takeDamage(amount, opts = {}) {
    if (!this.alive || this.invuln > 0) return
    if (this.game.flags?.[`invuln_${this.defId}`]) return
    const dmg = Math.max(1, Math.round(amount))
    this.hp -= dmg
    this.state = 'chase'
    this.aggroTime = 0
    if (opts.dir) {
      const kb = opts.combo === 2 ? .35 : .15
      this.pos.x += opts.dir.x * kb
      this.pos.z += opts.dir.z * kb
      this.mesh.position.copy(this.pos)
    }
    if (!opts.silent) {
      this.game.ui?.setTarget?.(this)
      const p = this.game.projectPoint(new THREE.Vector3(this.pos.x, this.pos.y + (this.boss ? 3.2 : 1.8), this.pos.z))
      this.game.ui?.damageAt?.(p.x, p.y, `${dmg}`, opts.crit ? 'crit' : '')
      this.game.audio?.sfx(opts.crit ? 'crit' : 'hit')
      this.game.fx.burst(new THREE.Vector3(this.pos.x, this.pos.y + 1, this.pos.z), opts.crit ? 0xffd05e : this.def.accent, opts.crit ? 16 : 9, { speed: 2.6, life: .45 })
      this.stagger += opts.combo === 2 ? 14 : 6
      if (this.stagger > (this.boss ? 90 : 38)) {
        this.stagger = 0
        this.stun(this.boss ? .7 : 1.3)
        this.game.toast(`${this.def.name} está aturdido.`, '✦')
      }
    }
    if (this.boss) {
      this.game.ui?.updateBoss?.(this.hp / this.maxHp, this.phase)
      this.game.onBossHit?.(this)
    }
    if (this.hp <= 0) this.die()
  }

  stun(seconds) {
    if (!this.alive) return
    this.stunTime = Math.max(this.stunTime, this.boss ? seconds * .65 : seconds)
    this.attackWindup = 0
    this.game.fx.burst(new THREE.Vector3(this.pos.x, this.pos.y + 1.6, this.pos.z), 0xffe6a0, 14, { speed: 2 })
  }

  slow(seconds, factor = .5) {
    this.slowTime = Math.max(this.slowTime, seconds)
    this.slowFactor = Math.min(this.slowFactor, factor)
  }

  burn(seconds, dps) {
    this.burnTime = Math.max(this.burnTime, seconds)
    this.burnDps = Math.max(this.burnDps, dps)
  }

  taunt(player, seconds) {
    this.state = 'chase'
    this.tauntTime = seconds
    this.aggroTime = 0
  }

  knockback(from, force) {
    const dx = this.pos.x - from.x, dz = this.pos.z - from.z
    const d = Math.hypot(dx, dz) || 1
    this.pos.x += dx / d * force * (this.boss ? .2 : 1)
    this.pos.z += dz / d * force * (this.boss ? .2 : 1)
    this.mesh.position.copy(this.pos)
    this.stun(this.boss ? .25 : .6)
  }

  die() {
    if (!this.alive) return
    this.alive = false
    this.hp = 0
    this.state = 'dead'
    this.deathTimer = 0
    const p = new THREE.Vector3(this.pos.x, this.pos.y + 1, this.pos.z)
    this.game.fx.burst(p, this.def.accent, this.boss ? 60 : 24, { speed: this.boss ? 7 : 3.4, life: this.boss ? 1.6 : .9 })
    this.game.fx.ring(new THREE.Vector3(this.pos.x, this.pos.y, this.pos.z), this.def.accent, this.boss ? 8 : 2.4, { life: .8 })
    this.game.audio?.sfx(this.boss ? 'levelup' : 'hit')
    if (this.boss) {
      this.game.shakeCamera?.(.5, .8)
      this.game.ui?.hideBoss?.()
      this.game.fx.ring(new THREE.Vector3(this.pos.x, this.pos.y, this.pos.z), 0xffe6a8, 14, { life: 1.6 })
    }
    this.game.onEnemyDeath(this)
  }

  remove() {
    this.deadRemoved = true
    if (this.mesh.parent) this.mesh.parent.remove(this.mesh)
    this.mesh.traverse(o => { o.geometry?.dispose?.(); if (o.material && !Array.isArray(o.material)) o.material.dispose() })
  }

  animate(dt, stunned = false, windup = false) {
    const rig = this.mesh.userData.rig
    if (!rig) return
    const t = performance.now() * .001 + this.orbit
    const speed = this.state === 'chase' && !stunned ? this.def.speed : 1
    this.orbit += dt * (this.state === 'chase' ? .3 : .1)
    if (rig.body) {
      rig.body.position.y = (rig.baseY || 0) + Math.sin(t * 2.2) * .035
      if (this.boss) rig.body.position.y += Math.sin(t * 1.3) * .03
      rig.body.rotation.z = stunned ? Math.sin(t * 8) * .06 : 0
    }
    if (rig.legL && rig.legR) {
      const sw = Math.sin(t * 6 * Math.min(1.4, speed / 3)) * (this.state === 'chase' ? .5 : .18)
      rig.legL.rotation.x = sw
      rig.legR.rotation.x = -sw
    }
    if (rig.legs) rig.legs.forEach((l, i) => { l.rotation.x = Math.sin(t * 7 + (i % 2) * Math.PI) * .45 })
    if (rig.armL && rig.armR && rig.armR !== rig.weapon) {
      const sw = Math.sin(t * 5) * .18
      rig.armL.rotation.x = sw
      rig.armR.rotation.x = -sw
      if (windup) {
        rig.armR.rotation.x = -2.2
        rig.armR.rotation.z = -.5
      }
    }
    if (rig.armR && this.attackTimer > .1 && !windup) {
      rig.armR.rotation.x = -1.3 + Math.sin(t * 18) * .2
    }
    if (rig.head) {
      rig.head.rotation.y = Math.sin(t * .8) * .06
      if (this.boss) rig.head.rotation.x = Math.sin(t * .5) * .04
    }
    if (rig.wings) rig.wings.forEach((w, i) => { w.rotation.z = Math.sin(t * 3 + i) * .2 })
    if (rig.rings) {
      rig.body.children?.forEach(o => { if (o.userData.spin) { o.rotation.z += dt * o.userData.spin; o.rotation.y += dt * o.userData.spin * .4 } })
    }
    if (rig.shards) {
      rig.shards.children.forEach((s, i) => {
        s.rotation.y += dt; s.rotation.x += dt * .7
        s.position.y += Math.sin(t * 1.8 + i) * dt * .25
      })
    }
    const bodyChildren = rig.body?.children || []
    for (const o of bodyChildren) {
      if (o.userData.phase !== undefined) o.rotation.z = Math.sin(t * 2.4 + o.userData.phase) * .12
    }
    // Telegráfico
    if (windup) {
      const k = 1 + Math.sin(performance.now() * .03) * .04
      this.mesh.scale.setScalar((this.def.scale || 1) * k)
      if (this.light) this.light.intensity = 2.4
    } else {
      this.mesh.scale.setScalar(this.def.scale || 1)
      if (this.light) this.light.intensity = 1.2
    }
  }
}
