import * as THREE from 'three'
import { createHumanoid, createNameTag } from '../world/models.js'
import { dampAngle, TAU } from '../utils/math.js'

const STYLES = {
  iria: { elder: true, accessory: 'circlet' },
  tovin: { beard: true },
  nara: { hood: true },
  mera: { veil: true },
  bruno: { hat: true },
  lia: { accessory: 'bandana' },
  kaelen: { cape: true },
  vesna: { hat: true },
  seraphine: { veil: true, eyes: 'glow' }
}

export class NPC {
  constructor(game, def, zone) {
    this.game = game
    this.def = def
    this.zone = zone
    const [x, z] = def.pos
    this.home = new THREE.Vector3(x, 0, z)
    this.pos = new THREE.Vector3(x, 0, z)
    this.facing = Math.PI
    this.phase = Math.random() * TAU
    this.id = def.id
    this.style = STYLES[def.id] || {}
    this.mesh = createHumanoid({
      colors: def.colors,
      appearance: {
        skin: def.colors?.skin,
        hairColor: def.colors?.hair,
        outfit: def.colors?.outfit,
        trim: def.colors?.trim,
        hairStyle: this.style.beard ? 'short' : def.id === 'seraphine' ? 'long' : 'braid',
        accessory: this.style.accessory || 'none'
      },
      npcStyle: this.style,
      weapon: null,
      scale: .97
    })
    const ground = zone.heightAt(x, z)
    this.pos.y = ground
    this.mesh.position.copy(this.pos)
    this.mesh.rotation.y = this.facing
    this.game.scene?.add(this.mesh)
    this.tag = createNameTag(def.name, def.role, 0xe4c27c)
    this.tag.scale.set(2.3, .72, 1)
    this.tag.position.y = 2.15
    this.mesh.add(this.tag)
    // Aura suave para que los personajes importantes destaquen
    const light = new THREE.PointLight(def.colors?.trim || 0xe4c27c, .22, 3)
    light.position.y = 1.3
    this.mesh.add(light)
  }

  update(dt) {
    const t = performance.now() * .001 + this.phase
    const rig = this.mesh.userData.rig
    if (rig) {
      rig.body.position.y = Math.sin(t * 1.3) * .012
      if (rig.head) rig.head.rotation.y = Math.sin(t * .45) * .1
      if (rig.armL) rig.armL.rotation.x = Math.sin(t * .7) * .045
      if (rig.armR) rig.armR.rotation.x = -Math.sin(t * .7) * .045
    }
    const player = this.game.player
    if (player) {
      const dx = player.pos.x - this.pos.x, dz = player.pos.z - this.pos.z
      const d = Math.hypot(dx, dz)
      if (d < 6.5) this.facing = dampAngle(this.facing, Math.atan2(dx, dz), 4, dt)
      this.mesh.rotation.y = this.facing
      this.tag.material.opacity = d < 24 ? .96 : Math.max(.18, 1 - (d - 24) / 30)
    }
  }

  remove() {
    if (!this.mesh.parent) return
    this.mesh.parent.remove(this.mesh)
    this.mesh.traverse(o => { o.geometry?.dispose?.(); if (o.material && !Array.isArray(o.material)) o.material.dispose() })
  }
}
