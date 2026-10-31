import * as THREE from 'three'
import { derive, effectiveStats, xpForLevel } from '../core/stats.js'
import { JURAMENTOS, ITEMS } from '../data/items.js'
import { CREATURES } from '../data/creatures.js'
import { createHumanoid, createCreatureModel } from '../world/models.js'
import { clamp, dampAngle, TAU } from '../utils/math.js'

const HALF_PI = Math.PI / 2

export class Player {
  constructor(game, save) {
    this.game = game
    this.save = save
    this.pos = new THREE.Vector3()
    this.velocity = new THREE.Vector3()
    this.derived = derive(save.stats, save.equipment, save.level)
    this.hp = this.derived.hp
    this.mp = this.derived.mp
    this.stamina = this.derived.stamina
    this.dead = false
    this.facing = Math.PI
    this.moveSpeed = 0
    this.cooldowns = { skill1: 0, skill2: 0, creature: 0, potion: 0, capture: 0 }
    this.skillData = { cd1: 8, cd2: 16 }
    this.creatureCooldown = 14
    this.effects = []
    this.shield = 0
    this.blocking = false
    this.blockTime = 0
    this.parryReady = 0
    this.iFrames = 0
    this.dodgeTime = 0
    this.dodgeDir = new THREE.Vector3()
    this.attackTimer = 0
    this.attackHitAt = 0
    this.attackDidHit = false
    this.comboIndex = 0
    this.comboTimer = 0
    this.comboQueued = false
    this.attackCD = 0
    this.hurtFlash = 0
    this.captureTarget = null
    this.companion = null
    this.companionData = null
    this.companionOffset = new THREE.Vector3(1.3, 0, 1.1)
    this.auraItem = null
    this.outOfCombat = 0
    this.walkPhase = 0
    this.tmp = new THREE.Vector3()
    this.beamCooldown = 0
    this.brasalTick = 0
    this.mesh = this.buildMesh()
  }

  buildMesh() {
    const mesh = createHumanoid({
      appearance: this.save.appearance,
      equipment: this.save.equipment,
      scale: 1,
      weaponScale: 1.05
    })
    mesh.position.copy(this.pos)
    mesh.rotation.y = this.facing
    return mesh
  }

  rebuildMesh() {
    const old = this.mesh
    const parent = old?.parent
    const next = this.buildMesh()
    next.position.copy(old?.position || this.pos)
    next.rotation.copy(old?.rotation || new THREE.Euler(0, this.facing, 0))
    if (parent) { parent.remove(old); parent.add(next) }
    old?.traverse(o => {
      if (o.geometry) o.geometry.dispose()
      if (o.material && !Array.isArray(o.material)) o.material.dispose()
    })
    this.mesh = next
    if (this.save.activeCreature) this.setCompanion(this.save.activeCreature)
  }

  place(x, z) {
    const zone = this.game.world?.zone
    this.pos.set(x, zone ? zone.heightAt(x, z) + .03 : 0, z)
    this.mesh.position.copy(this.pos)
    this.velocity.set(0, 0, 0)
    this.game.cameraFocus?.copy(this.pos)
  }

  passiveMods() {
    const active = this.save.activeCreature
    const def = active ? CREATURES[active] : null
    const mods = { hp: 1, mp: 1, speed: 1, defense: 0, crit: 0, manaRegen: 1, regen: 0, attack: 1 }
    // Nota: las claves hp/mp son multiplicadores; se mantienen separadas de attack.
    if (!def) return mods
    if (active === 'bramiel') mods.defense += .1
    if (active === 'grimpola') mods.speed += .05
    if (active === 'umbrino') mods.crit += .08
    if (active === 'cineronte') mods.hp += .18
    if (active === 'petreluz') mods.manaRegen += .15
    if (active === 'celemn') { mods.hp += .1; mods.mp += .1; mods.attack += .1; mods.defense += .1; mods.speed += .1; mods.crit += .1 }
    return mods
  }

  recalc(full = false) {
    const base = derive(effectiveStats(this.save.stats, this.save.className), this.save.equipment, this.save.level)
    const mods = this.passiveMods()
    base.hp = Math.round(base.hp * mods.hp)
    base.mp = Math.round(base.mp * mods.mp)
    base.attack *= mods.attack
    base.speed *= mods.speed
    base.reduction = Math.min(.82, base.reduction + mods.defense)
    base.crit = Math.min(.8, base.crit + mods.crit)
    base.manaRegen *= mods.manaRegen
    this.derived = base
    if (full) { this.hp = base.hp; this.mp = base.mp; this.stamina = base.stamina }
    else {
      this.hp = Math.min(this.hp, base.hp)
      this.mp = Math.min(this.mp, base.mp)
      this.stamina = Math.min(this.stamina, base.stamina)
    }
    this.game.ui?.refreshHUD?.()
  }

  setCompanion(id) {
    if (this.companion) {
      this.game.scene?.remove(this.companion)
      this.companion.traverse(o => { o.geometry?.dispose?.(); o.material?.dispose?.() })
      this.companion = null
    }
    const owned = this.save.creatures.find(c => c.id === id)
    const def = CREATURES[id]
    if (!owned || !def) { this.companionData = null; return }
    const model = createCreatureModel(def)
    model.scale.setScalar(.58)
    const lvl = owned.level || 1
    model.userData.phase = Math.random() * TAU
    const light = new THREE.PointLight(def.color, .45, 3.4)
    light.position.y = 1
    model.add(light)
    this.game.scene?.add(model)
    this.companion = model
    this.companionData = { def, level: lvl, id }
    this.recalc()
  }

  update(dt) {
    if (this.dead) return
    const game = this.game
    if (game.state !== 'playing') { this.animate(dt, true); return }
    dt = Math.min(dt, .05)

    this.tickTimers(dt)
    this.updateEffects(dt)
    const input = game.input
    const axis = input.axis()
    const yaw = game.cameraYaw
    const forward = { x: -Math.sin(yaw), z: -Math.cos(yaw) }
    const right = { x: Math.cos(yaw), z: -Math.sin(yaw) }
    let mx = right.x * axis.x + forward.x * (-axis.y)
    let mz = right.z * axis.x + forward.z * (-axis.y)
    const mlen = Math.hypot(mx, mz)
    if (mlen > .01) { mx /= mlen; mz /= mlen }
    const moving = mlen > .05

    let speed = this.derived.speed
    if (this.blocking) speed *= .44
    if (this.attackTimer > 0) speed *= .16
    if (this.dodgeTime > 0) speed = 0

    if (this.dodgeTime > 0) {
      this.pos.x += this.dodgeDir.x * 13.5 * dt
      this.pos.z += this.dodgeDir.z * 13.5 * dt
      this.facing = Math.atan2(this.dodgeDir.x, this.dodgeDir.z)
    } else if (moving) {
      this.pos.x += mx * speed * dt
      this.pos.z += mz * speed * dt
      this.facing = dampAngle(this.facing, Math.atan2(mx, mz), 14, dt)
      this.moveSpeed = speed
    } else {
      this.moveSpeed = 0
      if (this.attackTimer > 0) this.facing = dampAngle(this.facing, yaw + Math.PI, 16, dt)
    }

    this.clampPosition()
    const zone = game.world?.zone
    const ground = zone ? zone.heightAt(this.pos.x, this.pos.z) : 0
    this.pos.y = ground + .03
    this.mesh.position.copy(this.pos)
    this.mesh.rotation.y = this.facing

    // Animación de ataque
    if (this.attackTimer > 0) {
      this.attackTimer -= dt
      const spent = (this.comboIndex === 2 ? .46 : .34) - this.attackTimer
      if (!this.attackDidHit && spent >= this.attackHitAt) {
        this.attackDidHit = true
        this.performHit()
      }
      if (this.attackTimer <= 0) {
        this.attackTimer = 0
        if (this.comboQueued && this.comboIndex < 2) this.startAttack(true)
        else this.attackCD = .08
      }
    } else if (this.comboTimer > 0) {
      this.comboTimer -= dt
      if (this.comboTimer <= 0) this.comboIndex = 0
    }

    if (this.blocking && this.parryReady > 0) this.parryReady -= dt
    if (this.iFrames > 0) this.iFrames -= dt
    if (this.dodgeTime > 0) {
      this.dodgeTime -= dt
      if (this.dodgeTime <= 0) this.dodgeTime = 0
    }

    // Regeneración
    this.outOfCombat += dt
    if (this.outOfCombat > 4.5) {
      this.hp = Math.min(this.derived.hp, this.hp + this.derived.hpRegen * dt)
      const regen = this.passiveMods().regen + (this.save.activeCreature === 'lumifin' ? 2 : 0)
      if (regen) this.hp = Math.min(this.derived.hp, this.hp + regen * dt)
    }
    this.mp = Math.min(this.derived.mp, this.mp + this.derived.manaRegen * dt)
    this.stamina = Math.min(this.derived.stamina, this.stamina + this.derived.staminaRegen * (this.blocking ? .18 : 1) * dt)

    this.updateCompanion(dt)
    this.updateAura()
    this.updateCaptureTarget()
    this.updateBrasalAura(dt)
    this.animate(dt)
  }

  tickTimers(dt) {
    for (const k of Object.keys(this.cooldowns)) this.cooldowns[k] = Math.max(0, this.cooldowns[k] - dt)
    if (this.attackCD > 0) this.attackCD -= dt
  }

  updateEffects(dt) {
    for (let i = this.effects.length - 1; i >= 0; i--) {
      const e = this.effects[i]
      e.time -= dt
      if (e.time <= 0) {
        if (e.id === 'shield') this.shield = 0
        this.effects.splice(i, 1)
      }
    }
  }

  clampPosition() {
    const world = this.game.world
    if (!world) return
    const zone = world.zone
    const b = zone.bounds - 4
    this.pos.x = clamp(this.pos.x, -b, b)
    this.pos.z = clamp(this.pos.z, -b, b)
    if (zone.isWater?.(this.pos.x, this.pos.z)) {
      const h = zone.heightAt(this.pos.x, this.pos.z)
      if (h < (zone.id === 'drakmor' ? -1.8 : -2.5)) {
        this.pos.x -= this.velocity.x * .01
        this.pos.z -= this.velocity.z * .01
      }
    }
    const c = world.resolveCollision?.(this.pos.x, this.pos.z, .55)
    if (c) { this.pos.x = c.x; this.pos.z = c.z }
    if (world.bossArenaLock) {
      const a = world.bossArenaLock
      const d = Math.hypot(this.pos.x - a.x, this.pos.z - a.z)
      if (d > a.radius) {
        const k = a.radius / d
        this.pos.x = a.x + (this.pos.x - a.x) * k
        this.pos.z = a.z + (this.pos.z - a.z) * k
      }
    }
  }

  updateCaptureTarget() {
    this.captureTarget = null
    if (!this.game.world) return
    let best = null, bestD = 8
    for (const c of this.game.world.creatureSpawns) {
      if (c.caught || c.dead) continue
      const d = Math.hypot(c.pos.x - this.pos.x, c.pos.z - this.pos.z)
      if (d < bestD && c.hp / c.maxHp <= .45) { best = c; bestD = d }
    }
    this.captureTarget = best
  }

  updateCompanion(dt) {
    if (!this.companion) return
    const t = performance.now() * .001
    const side = Math.sin(t * .7 + this.companion.userData.phase) * .45
    const targetX = this.pos.x + Math.cos(this.facing) * this.companionOffset.z + Math.sin(this.facing) * (1.2 + side)
    const targetZ = this.pos.z - Math.sin(this.facing) * this.companionOffset.z + Math.cos(this.facing) * (1.2 + side)
    const ground = this.game.world?.zone?.heightAt(targetX, targetZ) ?? 0
    const targetY = ground + 1.15 + Math.sin(t * 2.2 + (this.companion.userData.phase || 0)) * .12
    this.companion.position.x += (targetX - this.companion.position.x) * Math.min(1, dt * 3.4)
    this.companion.position.z += (targetZ - this.companion.position.z) * Math.min(1, dt * 3.4)
    this.companion.position.y += (targetY - this.companion.position.y) * Math.min(1, dt * 4.2)
    this.companion.rotation.y = dampAngle(this.companion.rotation.y, this.facing, 6, dt)
    const rig = this.companion.userData.rig
    if (rig?.wings) rig.wings.forEach((w, i) => { w.rotation.z = Math.sin(t * 8 + i * Math.PI) * .35 })
    if (rig?.body) rig.body.position.y = Math.sin(t * 2.4) * .04
  }

  updateAura() {
    const shieldEffect = this.effects.find(e => e.id === 'shield' || e.id === 'bastion' || e.id === 'bark')
    if (shieldEffect && !this.auraItem) {
      this.auraItem = this.game.fx.aura(this.mesh, shieldEffect.color || 0x9fe8ff, 1.1)
    } else if (!shieldEffect && this.auraItem) {
      this.game.fx.removeAura(this.auraItem); this.auraItem = null
    }
  }

  updateBrasalAura(dt) {
    if (this.save.activeCreature !== 'brasal' || !this.game.world) return
    this.brasalTick += dt
    if (this.brasalTick < 1.1) return
    this.brasalTick = 0
    for (const e of this.game.world.enemies) {
      if (!e.alive) continue
      if (Math.hypot(e.pos.x - this.pos.x, e.pos.z - this.pos.z) < 3.8) e.takeDamage(4 + this.save.level * .7, { source: 'aura', silent: true })
    }
  }

  animate(dt, frozen = false) {
    const rig = this.mesh.userData.rig
    if (!rig) return
    const t = performance.now() * .001
    let speed = frozen ? 0 : this.moveSpeed
    if (this.dodgeTime > 0) speed = 12
    this.walkPhase += dt * (2.4 + speed * .72)
    const swing = Math.sin(this.walkPhase) * Math.min(.75, speed * .07)
    const bob = Math.abs(Math.sin(this.walkPhase * 2)) * Math.min(.06, speed * .006)
    rig.body.position.y = bob + (this.dead ? -.35 : 0)
    rig.legL.rotation.x = swing
    rig.legR.rotation.x = -swing
    rig.armL.rotation.x = -swing * .7
    rig.armR.rotation.x = swing * .35
    rig.armL.rotation.z = -.08
    rig.armR.rotation.z = .08
    rig.body.rotation.z = this.dodgeTime > 0 ? .25 : 0
    rig.head.rotation.y = Math.sin(t * .7) * .04
    rig.head.rotation.x = this.blocking ? .12 : 0

    if (this.attackTimer > 0) {
      const total = this.comboIndex === 2 ? .46 : .34
      const p = 1 - this.attackTimer / total
      const ang = this.comboIndex === 2
        ? -2.3 + p * 3.6
        : (this.comboIndex === 1 ? 1.8 - p * 3.4 : -1.4 + p * 2.9)
      rig.armR.rotation.x = ang
      rig.armR.rotation.z = -.45 + Math.sin(p * Math.PI) * .9
      rig.body.rotation.y = Math.sin(p * Math.PI) * (this.comboIndex === 2 ? .55 : .32)
    } else {
      rig.body.rotation.y = 0
    }
    if (this.blocking) {
      rig.armL.rotation.x = -1.2
      rig.armL.rotation.z = .8
      rig.armR.rotation.x = -.45
    }
    if (this.hurtFlash > 0) {
      this.hurtFlash -= dt
      this.mesh.traverse(o => { if (o.material?.emissive) o.material.emissive.setHex(0x6a1a14) })
    } else if (this.mesh.userData.lastFlash) {
      this.mesh.userData.lastFlash = false
      this.rebuildMaterialsEmission()
    }
  }

  rebuildMaterialsEmission() {
    this.mesh.traverse(o => {
      if (o.material?.emissive && o.material.userData.baseEmissive !== undefined) {
        o.material.emissive.setHex(o.material.userData.baseEmissive)
      }
    })
  }

  // ───────────── Acciones ─────────────
  startAttack(queued = false) {
    if (this.dead || this.attackCD > 0 || this.attackTimer > 0) return
    if (this.stamina < 5) { this.game.toast('Sin aguante para atacar.', '⚠'); return }
    if (!queued) {
      if (this.comboTimer > 0) this.comboIndex = (this.comboIndex + 1) % 3
      else this.comboIndex = 0
    } else this.comboIndex++
    this.stamina -= 5
    this.attackTimer = this.comboIndex === 2 ? .46 : .34
    this.attackHitAt = this.comboIndex === 2 ? .22 : .13
    this.attackDidHit = false
    this.comboQueued = false
    this.comboTimer = .9
    this.outOfCombat = 0
    this.game.audio?.sfx(this.comboIndex === 2 ? 'heavy' : 'swing')
    this.game.shakeCamera?.(this.comboIndex === 2 ? .08 : .035, .12)
  }

  queueCombo() {
    if (this.attackTimer > 0) {
      if (this.attackTimer < .24 && this.comboIndex < 2) this.comboQueued = true
      return true
    }
    return false
  }

  performHit() {
    const game = this.game
    const reach = this.comboIndex === 2 ? 3.1 : 2.45
    const arc = this.comboIndex === 2 ? Math.PI * .9 : Math.PI * .62
    const dmgBase = this.derived.attack * (this.comboIndex === 2 ? 1.85 : this.comboIndex === 1 ? 1.12 : 1)
    const origin = new THREE.Vector3(this.pos.x, this.pos.y + 1, this.pos.z)
    const dir = new THREE.Vector3(Math.sin(this.facing), 0, Math.cos(this.facing))
    game.fx.slash(this.pos, this.facing, this.comboIndex === 2 ? 0xffc46a : 0xffe6c0, this.comboIndex === 2 ? 2 : 1.45)
    let hits = 0
    for (const enemy of game.world?.enemies || []) {
      if (!enemy.alive) continue
      const to = new THREE.Vector3(enemy.pos.x - this.pos.x, 0, enemy.pos.z - this.pos.z)
      const d = to.length()
      if (d > reach + enemy.def.radius) continue
      to.normalize()
      const dot = dir.dot(to)
      if (dot < Math.cos(arc / 2)) continue
      const crit = Math.random() < this.derived.crit
      let dmg = dmgBase * (crit ? this.derived.critMult : 1) * (0.93 + Math.random() * .14)
      if (enemy.def.boss) dmg *= .92
      enemy.takeDamage(Math.round(dmg), { crit, source: 'player', dir: to.clone(), combo: this.comboIndex })
      hits++
    }
    // Las criaturas salvajes también pueden ser debilitadas con la espada.
    for (const creature of game.world?.creatureSpawns || []) {
      if (creature.caught || creature.dead) continue
      const to = new THREE.Vector3(creature.pos.x - this.pos.x, 0, creature.pos.z - this.pos.z)
      const d = to.length()
      if (d > reach + creature.radius) continue
      to.normalize()
      if (dir.dot(to) < Math.cos(arc / 2)) continue
      const crit = Math.random() < this.derived.crit
      const dmg = dmgBase * (crit ? this.derived.critMult : 1) * (0.9 + Math.random() * .12)
      creature.takeDamage(Math.round(dmg), { crit })
      hits++
    }
    if (hits) {
      this.outOfCombat = 0
      game.hitStop = Math.max(game.hitStop, this.comboIndex === 2 ? .11 : .055)
      game.shakeCamera?.(this.comboIndex === 2 ? .24 : .12, .18)
      game.audio?.sfx('hit')
      if (this.comboIndex === 2) game.fx.ring(new THREE.Vector3(this.pos.x, this.pos.y, this.pos.z), 0xffd28a, 2.8, { life: .45 })
    }
  }

  dodge() {
    if (this.dead || this.dodgeTime > 0 || this.stamina < this.derived.dodgeCost) return
    const axis = this.game.input.axis()
    let dx = 0, dz = 0
    if (Math.abs(axis.x) + Math.abs(axis.y) > .1) {
      const yaw = this.game.cameraYaw
      const forward = { x: -Math.sin(yaw), z: -Math.cos(yaw) }
      const right = { x: Math.cos(yaw), z: -Math.sin(yaw) }
      dx = right.x * axis.x + forward.x * (-axis.y)
      dz = right.z * axis.x + forward.z * (-axis.y)
    } else {
      dx = Math.sin(this.facing); dz = Math.cos(this.facing)
    }
    const len = Math.hypot(dx, dz) || 1
    this.dodgeDir.set(dx / len, 0, dz / len)
    this.stamina -= this.derived.dodgeCost
    this.dodgeTime = .28
    this.iFrames = .34
    this.outOfCombat = 0
    this.game.audio?.sfx('dodge')
    this.game.fx.burst(new THREE.Vector3(this.pos.x, this.pos.y + .5, this.pos.z), 0xd8e8ff, 12, { speed: 1.5, life: .4 })
  }

  startBlock() {
    if (this.dead) return
    this.blocking = true
    this.blockTime = 0
    this.parryReady = .22
  }

  stopBlock() {
    this.blocking = false
    this.parryReady = 0
  }

  skill1() {
    if (this.dead || this.cooldowns.skill1 > 0) return
    const cls = JURAMENTOS[this.save.className] || JURAMENTOS.filo
    const cost = 22
    if (this.mp < cost) { this.game.toast('Maná insuficiente.', '✦'); return }
    this.mp -= cost
    this.cooldowns.skill1 = 7.5
    this.skillData.cd1 = 7.5
    this.outOfCombat = 0
    this.game.audio?.sfx('magic')
    const dir = new THREE.Vector3(Math.sin(this.facing), 0, Math.cos(this.facing))
    if (cls.skill === 'bastion') {
      this.shield = Math.max(this.shield, 75)
      this.addEffect('bastion', 'Bastión', 5, { color: 0xffe0a8, reduction: .55 })
      this.game.fx.ring(new THREE.Vector3(this.pos.x, this.pos.y, this.pos.z), 0xffe0a8, 4.4, { life: .8 })
      for (const e of this.game.world.enemies) {
        if (!e.alive) continue
        const d = Math.hypot(e.pos.x - this.pos.x, e.pos.z - this.pos.z)
        if (d < 5) e.knockback(this.pos, 6)
      }
      this.game.toast('Bastión del Alba: daño reducido y enemigos empujados.', '⬡')
    } else if (cls.skill === 'tajo') {
      const start = this.pos.clone()
      this.pos.addScaledVector(dir, 6.5)
      this.clampPosition()
      const path = new THREE.Vector3().subVectors(this.pos, start)
      this.game.fx.slash(this.pos, this.facing, 0xffb08a, 2.6)
      this.game.fx.burst(new THREE.Vector3(this.pos.x, this.pos.y + 1, this.pos.z), 0xffb08a, 26, { speed: 5 })
      for (const e of this.game.world.enemies) {
        if (!e.alive) continue
        const to = new THREE.Vector3(e.pos.x - start.x, 0, e.pos.z - start.z)
        if (to.length() < 3 + path.length() * .55) {
          const dot = to.clone().normalize().dot(dir)
          if (dot > -.35) e.takeDamage(Math.round(this.derived.attack * 1.7), { source: 'skill', dir: dir.clone(), crit: true })
        }
      }
      this.game.shakeCamera?.(-.2, .2)
    } else {
      const from = new THREE.Vector3(this.pos.x, this.pos.y + 1.25, this.pos.z)
      const to = from.clone().addScaledVector(dir, 22)
      this.game.fx.beam(from, to, 0x9cd8ff, .16)
      this.game.fx.burst(from, 0x9cd8ff, 20, { speed: 4 })
      for (const e of this.game.world.enemies) {
        if (!e.alive) continue
        const toE = new THREE.Vector3(e.pos.x - this.pos.x, 0, e.pos.z - this.pos.z)
        if (toE.length() > 22) continue
        if (toE.clone().normalize().dot(dir) > .93) {
          e.takeDamage(Math.round(this.derived.attack * 1.8 * this.derived.powerSkill), { source: 'skill', crit: true })
          e.slow(1.6, .5)
        }
      }
      this.mp = Math.min(this.derived.mp, this.mp + 8)
    }
    this.game.ui?.refreshHUD?.()
  }

  skill2() {
    if (this.dead || this.cooldowns.skill2 > 0) return
    if (this.mp < 30) { this.game.toast('Maná insuficiente.', '✦'); return }
    this.mp -= 30
    this.cooldowns.skill2 = 16
    this.skillData.cd2 = 16
    this.outOfCombat = 0
    const dmg = this.derived.attack * 1.35 * this.derived.powerSkill
    this.game.fx.ring(new THREE.Vector3(this.pos.x, this.pos.y, this.pos.z), 0x9fc8ff, 6.2, { life: 1.1 })
    this.game.fx.burst(new THREE.Vector3(this.pos.x, this.pos.y + 1, this.pos.z), 0x9fc8ff, 34, { speed: 7, life: .9 })
    for (const e of this.game.world.enemies) {
      if (!e.alive) continue
      const d = Math.hypot(e.pos.x - this.pos.x, e.pos.z - this.pos.z)
      if (d < 7) {
        e.takeDamage(Math.round(dmg), { source: 'skill', crit: false })
        e.slow(3.2, .55)
      }
    }
    this.game.audio?.sfx('magic')
    this.game.toast('Don del Velo: onda de resonancia.', '✦')
  }

  useCreature() {
    if (this.dead || this.cooldowns.creature > 0) return
    const data = this.companionData
    if (!data) { this.game.toast('No hay una criatura invocada.', '❖'); return }
    const def = data.def
    this.cooldowns.creature = Math.max(8, def.cooldown - (data.level - 1) * .5)
    this.creatureCooldown = this.cooldowns.creature
    this.outOfCombat = 0
    this.game.audio?.sfx('capture')
    const pos = new THREE.Vector3(this.pos.x, this.pos.y + 1, this.pos.z)
    const enemies = this.game.world.enemies.filter(e => e.alive)
    switch (data.id) {
      case 'lumifin':
        this.heal(this.derived.hp * .32)
        this.addEffect('purify', 'Luz de Lumen', 5, { color: 0x9fe8ff })
        this.game.fx.ring(new THREE.Vector3(this.pos.x, this.pos.y, this.pos.z), 0x9fe8ff, 3.2, { life: .8 })
        break
      case 'bramiel':
        this.shield = Math.max(this.shield, 45)
        this.addEffect('bark', 'Piel de Corteza', 8, { color: 0x8fd6a0, reduction: .2 })
        break
      case 'grimpola': {
        const targets = enemies.sort((a, b) => Math.hypot(a.pos.x - this.pos.x, a.pos.z - this.pos.z) - Math.hypot(b.pos.x - this.pos.x, b.pos.z - this.pos.z)).slice(0, 4)
        let last = pos.clone()
        for (const e of targets) {
          const to = new THREE.Vector3(e.pos.x, e.pos.y + 1, e.pos.z)
          this.game.fx.beam(last, to, 0x8ab9ff, .07)
          e.takeDamage(Math.round(20 + this.save.level * 3), { source: 'creature' })
          e.stun(1.1)
          last = to
        }
        break
      }
      case 'brasal':
        this.game.fx.ring(new THREE.Vector3(this.pos.x, this.pos.y, this.pos.z), 0xff8a4c, 5.2, { life: .9 })
        for (const e of enemies) {
          if (Math.hypot(e.pos.x - this.pos.x, e.pos.z - this.pos.z) < 6) {
            e.takeDamage(Math.round(34 + this.save.level * 4), { source: 'creature' })
            e.burn(6, 5)
          }
        }
        break
      case 'umbrino': {
        const target = enemies.sort((a, b) => Math.hypot(a.pos.x - this.pos.x, a.pos.z - this.pos.z) - Math.hypot(b.pos.x - this.pos.x, b.pos.z - this.pos.z))[0]
        if (target) {
          const behind = new THREE.Vector3(target.pos.x - Math.sin(target.facing || 0) * 2.2, target.pos.y, target.pos.z - Math.cos(target.facing || 0) * 2.2)
          this.pos.copy(behind)
          this.facing = Math.atan2(target.pos.x - this.pos.x, target.pos.z - this.pos.z)
          this.game.fx.burst(pos, 0x8f7cc9, 20, { speed: 3 })
          target.takeDamage(Math.round((45 + this.save.level * 5) * 1.6), { source: 'creature', crit: true })
        }
        break
      }
      case 'cineronte':
        this.addEffect('taunt', 'La Montaña Recuerda', 7, { color: 0xc2a98a, reduction: .35 })
        for (const e of enemies) if (Math.hypot(e.pos.x - this.pos.x, e.pos.z - this.pos.z) < 9) e.taunt(this, 7)
        break
      case 'petreluz':
        for (const e of enemies) if (Math.hypot(e.pos.x - this.pos.x, e.pos.z - this.pos.z) < 12) e.slow(5, .55)
        this.game.fx.ring(new THREE.Vector3(this.pos.x, this.pos.y, this.pos.z), 0xa6e5ff, 9, { life: 1.2 })
        break
      case 'celemn': {
        const from = new THREE.Vector3(this.pos.x, this.pos.y + 1.4, this.pos.z)
        const to = from.clone().addScaledVector(new THREE.Vector3(Math.sin(this.facing), .1, Math.cos(this.facing)), 26)
        this.game.fx.beam(from, to, 0xffe0a0, .28)
        for (const e of enemies) {
          const d = Math.hypot(e.pos.x - this.pos.x, e.pos.z - this.pos.z)
          if (d < 15) { e.takeDamage(Math.round(80 + this.save.level * 6), { source: 'creature', crit: true }); e.stun(1.4) }
        }
        break
      }
      default: break
    }
    this.game.toast(`${def.name}: ${def.ability}`, '❖')
    this.game.ui?.refreshHUD?.()
  }

  potion() {
    if (this.dead) return
    if (!this.game.usePotion()) this.game.toast('No tienes pociones.', '⚠')
  }

  capture() {
    if (this.dead) return
    this.game.tryCapture(this.captureTarget)
  }

  heal(amount) {
    const before = this.hp
    this.hp = Math.min(this.derived.hp, this.hp + amount)
    const healed = Math.round(this.hp - before)
    if (healed > 0) {
      this.game.fx.burst(new THREE.Vector3(this.pos.x, this.pos.y + 1.2, this.pos.z), 0x9fe7a2, 14, { speed: 1.8, gravity: 1.2 })
      this.game.ui?.damageAt?.(...this.game.projectPoint(new THREE.Vector3(this.pos.x, this.pos.y + 2, this.pos.z)), `+${healed}`, 'heal')
    }
    return healed
  }

  restoreMana(amount) {
    this.mp = Math.min(this.derived.mp, this.mp + amount)
  }

  addEffect(id, label, duration, opts = {}) {
    const existing = this.effects.find(e => e.id === id)
    if (existing) { existing.time = Math.max(existing.time, duration); return }
    this.effects.push({ id, label, time: duration, duration, ...opts })
  }

  effectiveReduction() {
    let r = this.derived.reduction
    for (const e of this.effects) if (e.reduction) r = 1 - (1 - r) * (1 - e.reduction)
    return Math.min(.9, r)
  }

  takeDamage(amount, opts = {}) {
    if (this.dead) return
    if (this.iFrames > 0 || this.dodgeTime > 0) {
      if (opts.source?.def) this.game.ui?.damageAt?.(...this.game.projectPoint(new THREE.Vector3(this.pos.x, this.pos.y + 2, this.pos.z)), 'ESQUIVA', 'capture')
      return
    }
    this.outOfCombat = 0
    let dmg = amount * (this.game.difficulty?.taken ?? 1)
    let parried = false
    if (this.blocking) {
      const attacker = opts.source
      if (this.parryReady > 0 && attacker?.stun && Math.hypot(attacker.pos.x - this.pos.x, attacker.pos.z - this.pos.z) < 4.5) {
        parried = true
        attacker.stun(2.4)
        this.stamina = Math.min(this.derived.stamina, this.stamina + 25)
        this.game.audio?.sfx('parry')
        this.game.toast('¡Paro perfecto!', '◈')
        this.game.fx.ring(new THREE.Vector3(this.pos.x, this.pos.y, this.pos.z), 0xffffff, 2.8, { life: .4 })
      } else {
        const cost = this.derived.blockCost * (opts.heavy ? 2 : 1)
        if (this.stamina <= 0) {
          this.game.toast('¡Guardia rota!', '⚠')
        } else {
          dmg *= .24
          this.stamina = Math.max(0, this.stamina - cost)
        }
      }
    }
    if (!parried) {
      dmg *= 1 - this.effectiveReduction()
      if (this.shield > 0) {
        const absorbed = Math.min(this.shield, dmg)
        this.shield -= absorbed
        dmg -= absorbed
        this.game.fx.burst(new THREE.Vector3(this.pos.x, this.pos.y + 1.2, this.pos.z), 0x9fe8ff, 10, { speed: 2 })
      }
      dmg = Math.max(1, Math.round(dmg))
      this.hp -= dmg
      this.hurtFlash = .12
      this.mesh.userData.lastFlash = true
      this.applyHurtFlash()
      this.game.audio?.sfx('hit')
      this.game.ui?.flash?.('rgba(255,70,50,.16)')
      this.game.shakeCamera?.(.25, .2)
      this.game.hitStop = Math.max(this.game.hitStop, .04)
      const p = this.game.projectPoint(new THREE.Vector3(this.pos.x, this.pos.y + 1.9, this.pos.z))
      this.game.ui?.damageAt?.(p.x, p.y, `−${dmg}`, 'player')
    }
    this.game.ui?.refreshHUD?.()
    if (this.hp <= 0) this.die()
  }

  applyHurtFlash() {
    this.mesh.traverse(o => {
      if (o.material?.emissive) {
        if (o.material.userData.baseEmissive === undefined) o.material.userData.baseEmissive = o.material.emissive.getHex()
        o.material.emissive.setHex(0x7a1e16)
      }
    })
  }

  die() {
    if (this.dead) return
    this.dead = true
    this.hp = 0
    this.blocking = false
    this.game.audio?.sfx('death')
    this.game.fx.burst(new THREE.Vector3(this.pos.x, this.pos.y + 1, this.pos.z), 0xffe0a8, 30, { speed: 3.5, life: 1.2 })
    this.game.onPlayerDeath()
  }

  screenPos() {
    return this.game.projectPoint(new THREE.Vector3(this.pos.x, this.pos.y + 2.1, this.pos.z))
  }
}
