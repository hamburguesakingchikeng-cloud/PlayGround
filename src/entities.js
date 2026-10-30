import {
  WEAPONS, ARMORS, ACCESSORIES, ITEMS, SKILLS, STARTING_WEAPONS,
  ENEMY_TYPES, APPEARANCE_DEFAULT, CREATURES, HAIR_STYLES, HAIR_COLORS, OUTFITS,
} from './content.js'

const clamp = (v, a, b) => Math.max(a, Math.min(b, v))
const rand = (a, b) => a + Math.random() * (b - a)

export class Player {
  constructor(appearance = {}, options = {}) {
    this.appearance = {
      ...APPEARANCE_DEFAULT,
      ...appearance,
      hair: clamp(appearance.hair ?? 0, 0, HAIR_STYLES.length - 1),
      hairColor: clamp(appearance.hairColor ?? 0, 0, HAIR_COLORS.length - 1),
      outfit: clamp(appearance.outfit ?? 0, 0, OUTFITS.length - 1),
    }
    this.x = options.x ?? 1795
    this.y = options.y ?? 1285
    this.radius = 13
    this.facing = { x: 0, y: 1 }
    this.lastFacingX = 1
    this.walk = 0
    this.moving = false
    this.level = 1
    this.xp = 0
    this.xpNext = 60
    this.statPoints = 0
    this.attributes = { vitality: 8, endurance: 6, strength: 7, defense: 5, speed: 5, intelligence: 5, luck: 3 }
    this.weaponIds = [...STARTING_WEAPONS]
    this.armorIds = ['tunica_viajero']
    this.accessoryIds = []
    this.equipment = { weapon: 'sword_alba', armor: 'tunica_viajero', accessory: null }
    this.inventory = { pocion_vida: 3, pocion_mana: 2, sello_lumen: 2 }
    this.gold = 35
    this.skills = ['corte_alba']
    this.activeSkill = 'corte_alba'
    this.creatures = []
    this.activeCreature = null
    this.collectedCreatures = new Set()
    this.hp = 0
    this.mp = 0
    this.stamina = 0
    this.state = {
      attack: 0, attackT: 0, attackDur: .32, attacking: false, combo: 0, comboWindow: 0,
      hitDone: false, queued: false, roll: 0, rollT: 0, rollDur: .34, rolling: false, invuln: 0,
      block: 0, blocking: false, hurt: 0, cast: 0, skillCd: 0, dead: false, stepT: 0,
    }
    this.attackCd = 0
    this.staminaDelay = 0
    this.checkpoint = { x: this.x, y: this.y }
    this.recalc()
    this.hp = this.maxHp
    this.mp = this.maxMp
    this.stamina = this.maxStamina
    this.kills = 0
    this.bossKills = 0
  }

  get weapon() { return WEAPONS[this.equipment.weapon] || WEAPONS.sword_alba }
  get armor() { return ARMORS[this.equipment.armor] || ARMORS.tunica_viajero }
  get accessory() { return this.equipment.accessory ? ACCESSORIES[this.equipment.accessory] : null }
  get maxHp() { return Math.round(96 + this.attributes.vitality * 5 + this.level * 8 + (this.armor?.maxHp || 0) + (this.accessory?.maxHp || 0)) }
  get maxMp() { return Math.round(30 + this.attributes.intelligence * 4 + this.level * 3 + (this.armor?.maxMp || 0) + (this.accessory?.maxMp || 0)) }
  get maxStamina() { return Math.round(76 + this.attributes.endurance * 3 + this.level * 2 + (this.accessory?.stamina || 0)) }
  get attackPower() { return Math.round(7 + this.attributes.strength * 2 + this.level * 1.2 + this.weapon.damage) }
  get defense() { return Math.round(1 + this.attributes.defense * 1.4 + (this.armor?.defense || 0) + (this.accessory?.defense || 0)) }
  get moveSpeed() { return 142 + this.attributes.speed * 4 + (this.accessory?.speed || 0) }
  get critChance() { return clamp(.04 + this.attributes.luck * .005 + (this.weapon.crit || 0) + (this.accessory?.crit || 0), 0, .6) }
  get skill() { return SKILLS[this.activeSkill] || SKILLS.corte_alba }

  recalc(heal = false) {
    this.hp = clamp(heal ? this.maxHp : this.hp, 0, this.maxHp)
    this.mp = clamp(this.mp, 0, this.maxMp)
    this.stamina = clamp(this.stamina, 0, this.maxStamina)
  }

  addXp(amount) {
    this.xp += amount
    let levels = 0
    while (this.xp >= this.xpNext) {
      this.xp -= this.xpNext
      this.level++
      levels++
      this.xpNext = Math.round(60 * Math.pow(this.level, 1.32))
      this.statPoints += 3
      this.recalc(true)
      this.hp = this.maxHp
      this.mp = this.maxMp
      this.stamina = this.maxStamina
    }
    return levels
  }

  allocate(stat) {
    if (this.statPoints <= 0 || !(stat in this.attributes)) return false
    this.attributes[stat]++
    this.statPoints--
    this.recalc()
    return true
  }

  addItem(id, amount = 1) {
    this.inventory[id] = (this.inventory[id] || 0) + amount
  }

  removeItem(id, amount = 1) {
    if ((this.inventory[id] || 0) < amount) return false
    this.inventory[id] -= amount
    if (this.inventory[id] <= 0) delete this.inventory[id]
    return true
  }

  useItem(id) {
    const item = ITEMS[id]
    if (!item || !this.inventory[id]) return { ok: false, message: 'No tienes ese objeto.' }
    if (item.use === 'heal') {
      if (this.hp >= this.maxHp) return { ok: false, message: 'Tu vida ya está completa.' }
      this.removeItem(id)
      this.hp = Math.min(this.maxHp, this.hp + item.amount)
      return { ok: true, message: `+${item.amount} de vida`, kind: 'heal' }
    }
    if (item.use === 'mana') {
      if (this.mp >= this.maxMp) return { ok: false, message: 'Tu maná ya está completo.' }
      this.removeItem(id)
      this.mp = Math.min(this.maxMp, this.mp + item.amount)
      return { ok: true, message: `+${item.amount} de maná`, kind: 'mana' }
    }
    if (item.use === 'full') {
      this.removeItem(id)
      this.hp = this.maxHp; this.mp = this.maxMp; this.stamina = this.maxStamina
      return { ok: true, message: 'Vida y maná restaurados por completo', kind: 'heal' }
    }
    return { ok: false, message: 'Este objeto no se puede usar aquí.' }
  }

  equipWeapon(id) {
    if (!this.weaponIds.includes(id)) return false
    this.equipment.weapon = id
    this.appearance.weapon = id
    return true
  }

  cycleWeapon(dir = 1) {
    const list = this.weaponIds
    if (list.length <= 1) return false
    let i = list.indexOf(this.equipment.weapon)
    i = (i + dir + list.length) % list.length
    this.equipWeapon(list[i])
    return true
  }

  equipArmor(id) {
    if (!this.armorIds.includes(id)) return false
    this.equipment.armor = id
    this.recalc()
    return true
  }

  equipAccessory(id) {
    if (id && !this.accessoryIds.includes(id)) return false
    this.equipment.accessory = id
    this.recalc()
    return true
  }

  setActiveSkill(id) {
    if (!this.skills.includes(id)) return false
    this.activeSkill = id
    return true
  }

  cycleCreature(game) {
    if (!this.creatures.length) return null
    const idx = this.creatures.indexOf(this.activeCreature)
    this.activeCreature = this.creatures[(idx + 1 + this.creatures.length) % this.creatures.length]
    return this.activeCreature
  }

  serialize() {
    return {
      appearance: this.appearance, level: this.level, xp: this.xp, xpNext: this.xpNext,
      statPoints: this.statPoints, attributes: { ...this.attributes },
      weaponIds: [...this.weaponIds], armorIds: [...this.armorIds], accessoryIds: [...this.accessoryIds],
      equipment: { ...this.equipment }, inventory: { ...this.inventory }, gold: this.gold,
      skills: [...this.skills], activeSkill: this.activeSkill, creatures: [...this.creatures],
      activeCreature: this.activeCreature, collectedCreatures: [...this.collectedCreatures],
      hp: this.hp, mp: this.mp, stamina: this.stamina,
      x: this.x, y: this.y, checkpoint: { ...this.checkpoint }, kills: this.kills, bossKills: this.bossKills,
    }
  }

  load(data) {
    Object.assign(this, {
      appearance: { ...APPEARANCE_DEFAULT, ...data.appearance }, level: data.level || 1,
      xp: data.xp || 0, xpNext: data.xpNext || 60, statPoints: data.statPoints || 0,
      attributes: { ...this.attributes, ...(data.attributes || {}) },
      weaponIds: data.weaponIds || [...STARTING_WEAPONS], armorIds: data.armorIds || ['tunica_viajero'],
      accessoryIds: data.accessoryIds || [], equipment: { ...this.equipment, ...(data.equipment || {}) },
      inventory: data.inventory || {}, gold: data.gold || 0, skills: data.skills || ['corte_alba'],
      activeSkill: data.activeSkill || 'corte_alba', creatures: data.creatures || [],
      activeCreature: data.activeCreature || null,
      collectedCreatures: new Set(data.collectedCreatures || []),
      hp: data.hp || 1, mp: data.mp || 0, stamina: data.stamina || 0,
      x: data.x ?? this.x, y: data.y ?? this.y, checkpoint: data.checkpoint || { x: data.x, y: data.y },
      kills: data.kills || 0, bossKills: data.bossKills || 0,
    })
    this.recalc()
  }
}

export class Enemy {
  constructor(spawn, data, levelBonus = 0) {
    this.spawn = { ...spawn }
    this.type = data
    this.kind = data.kind
    this.id = `${spawn.type}_${Math.round(spawn.x)}_${Math.round(spawn.y)}`
    this.x = spawn.x
    this.y = spawn.y
    this.home = { x: spawn.x, y: spawn.y }
    this.radius = data.radius || 24
    this.scale = data.scale || 1
    this.level = data.level + levelBonus
    const scale = 1 + levelBonus * .14
    this.maxHp = Math.round(data.hp * scale)
    this.hp = this.maxHp
    this.damage = Math.round(data.damage * (1 + levelBonus * .08))
    this.defense = data.defense + levelBonus
    this.speed = data.speed
    this.xp = Math.round(data.xp * (1 + levelBonus * .1))
    this.gold = Math.round(data.gold * (1 + levelBonus * .1))
    this.facing = { x: 0, y: 1 }
    this.walk = Math.random() * 10
    this.moving = false
    this.seed = Math.random() * 100
    this.alpha = 1
    this.dying = 0
    this.dead = false
    this.state = { attack: 0, attackTimer: 0, attackDur: .6, attackHit: false, hurt: 0, attackKind: null }
    this.cooldown = rand(.3, 1.4)
    this.wander = { x: spawn.x, y: spawn.y, timer: rand(1, 4) }
    this.knockback = { x: 0, y: 0 }
    this.phase = 1
    this.isBoss = false
    this.captureReady = false
    this.hitFlash = 0
  }

  faceTo(x, y) {
    const dx = x - this.x, dy = y - this.y
    const len = Math.hypot(dx, dy) || 1
    this.facing.x = dx / len
    this.facing.y = dy / len
    if (Math.abs(this.facing.x) > .1) this.flip = this.facing.x < 0 ? -1 : 1
  }

  startAttack(kind, duration, game) {
    this.state.attackKind = kind
    this.state.attack = .0001
    this.state.attackTimer = 0
    this.state.attackDur = duration
    this.state.attackHit = false
    this.moving = false
    if (kind === 'wraithBolt') game.addTelegraph({ type: 'line', x: this.x, y: this.y, angle: Math.atan2(game.player.y - this.y, game.player.x - this.x), length: 340, width: 22, life: .7, maxLife: .7, color: '#a981ff' })
    if (kind === 'slimeSlam') game.addTelegraph({ type: 'circle', x: this.x + this.facing.x * 28, y: this.y + this.facing.y * 28, radius: 54, life: .48, maxLife: .48, color: '#71e7ad' })
    if (kind === 'beetleSlam') game.addTelegraph({ type: 'circle', x: this.x, y: this.y, radius: 82, life: .65, maxLife: .65, color: '#e7c468' })
  }

  update(dt, game) {
    if (this.dead) return
    if (this.dying > 0) {
      this.dying -= dt
      this.alpha = Math.max(0, this.dying / .7)
      if (this.dying <= 0) this.dead = true
      return
    }
    if (this.state.hurt > 0) {
      this.state.hurt -= dt
      this.x += this.knockback.x * dt
      this.y += this.knockback.y * dt
      this.knockback.x *= Math.pow(.02, dt)
      this.knockback.y *= Math.pow(.02, dt)
      this.hitFlash = Math.max(0, this.hitFlash - dt * 4)
      return
    }
    this.hitFlash = Math.max(0, this.hitFlash - dt * 4)
    const player = game.player
    const dx = player.x - this.x, dy = player.y - this.y
    const dist = Math.hypot(dx, dy)
    const dxn = dx / (dist || 1), dyn = dy / (dist || 1)
    this.walk += dt * (this.moving ? 2.5 : .6)
    this.cooldown -= dt

    if (this.state.attack > 0) {
      this.state.attackTimer += dt
      const p = this.state.attackTimer / this.state.attackDur
      this.state.attack = Math.min(1, p)
      const strikeAt = { slimeSlam: .58, wolfLunge: .52, beetleSlam: .72, wraithBolt: .76 }[this.state.attackKind] || .6
      if (!this.state.attackHit && p >= strikeAt) {
        this.state.attackHit = true
        game.resolveEnemyAttack(this)
      }
      if (p >= 1) {
        this.state.attack = 0
        this.state.attackKind = null
        this.cooldown = this.kind === 'wraith' ? rand(1.6, 2.4) : rand(1.4, 2.3)
      }
      return
    }

    const aggro = this.type.aggro || 260
    if (dist < aggro && !player.state.dead) {
      this.faceTo(player.x, player.y)
      if (this.kind === 'wraith') {
        // Mantiene la distancia y dispara.
        const ideal = 195
        const move = dist < ideal - 45 ? -.7 : dist > ideal + 55 ? .7 : 0
        const strafe = Math.sin(game.time * 1.3 + this.seed) * .22
        this.moving = Math.abs(move) + Math.abs(strafe) > .05
        const vx = dxn * this.speed * move + -dyn * this.speed * strafe
        const vy = dyn * this.speed * move + dxn * this.speed * strafe
        game.moveEntity(this, vx * dt, vy * dt)
        if (this.cooldown <= 0 && dist < 380) this.startAttack('wraithBolt', 1.05, game)
      } else if (this.kind === 'wolf') {
        if (dist > 96) {
          this.moving = true
          game.moveEntity(this, dxn * this.speed * dt, dyn * this.speed * dt)
        } else {
          this.moving = false
        }
        if (this.cooldown <= 0 && dist < 180) this.startAttack('wolfLunge', .62, game)
      } else if (this.kind === 'beetle') {
        if (dist > 86) {
          this.moving = true
          game.moveEntity(this, dxn * this.speed * dt, dyn * this.speed * dt)
        } else this.moving = false
        if (this.cooldown <= 0 && dist < 100) this.startAttack('beetleSlam', .92, game)
      } else {
        if (dist > 50) {
          this.moving = true
          game.moveEntity(this, dxn * this.speed * dt, dyn * this.speed * dt)
        } else this.moving = false
        if (this.cooldown <= 0 && dist < 68) this.startAttack('slimeSlam', .78, game)
      }
    } else {
      this.moving = false
      this.wander.timer -= dt
      if (this.wander.timer <= 0) {
        this.wander.timer = rand(1.8, 4.5)
        const a = Math.random() * Math.PI * 2
        const r = rand(15, 80)
        this.wander.x = this.home.x + Math.cos(a) * r
        this.wander.y = this.home.y + Math.sin(a) * r
      }
      const wx = this.wander.x - this.x, wy = this.wander.y - this.y
      const wd = Math.hypot(wx, wy)
      if (wd > 12) {
        this.moving = true
        this.faceTo(this.wander.x, this.wander.y)
        game.moveEntity(this, wx / wd * this.speed * .24 * dt, wy / wd * this.speed * .24 * dt)
      }
    }
  }

  takeDamage(amount, opts = {}) {
    if (this.dying || this.dead) return 0
    const reduced = Math.max(1, Math.round(amount - this.defense * .55))
    this.hp -= reduced
    this.state.hurt = opts.stagger ? .42 : .2
    this.hitFlash = 1
    const angle = opts.angle ?? Math.atan2(this.y - (opts.sourceY ?? this.y - 1), this.x - (opts.sourceX ?? this.x - 1))
    const power = opts.knockback ?? 130
    this.knockback.x = Math.cos(angle) * power
    this.knockback.y = Math.sin(angle) * power
    if (this.hp <= 0) {
      this.hp = 0
      this.dying = .7
      this.alpha = 1
    }
    this.captureReady = this.hp > 0 && this.hp <= this.maxHp * .25
    return reduced
  }
}

export class Projectile {
  constructor(opts) {
    this.x = opts.x; this.y = opts.y
    this.vx = opts.vx; this.vy = opts.vy
    this.radius = opts.radius || 6
    this.damage = opts.damage || 8
    this.owner = opts.owner || 'enemy'
    this.color = opts.color || '#b48cff'
    this.life = opts.life || 2.4
    this.maxLife = this.life
    this.pierce = opts.pierce || 0
    this.homing = opts.homing || 0
    this.target = opts.target || null
    this.kind = opts.kind || 'orb'
    this.angle = opts.angle || Math.atan2(this.vy, this.vx)
    this.dead = false
    this.hitSet = new Set()
    this.trail = []
  }
}

export class Companion {
  constructor(id) {
    const data = CREATURES[id]
    this.id = id
    this.data = data
    this.x = 0; this.y = 0
    this.cooldown = 1
    this.attackAnim = 0
    this.alpha = 0
  }
}
