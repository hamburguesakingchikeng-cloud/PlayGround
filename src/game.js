/**
 * LA ESPADA CELESTIAL — motor de juego.
 * Combate en tiempo real, exploración, misiones, criaturas, guardado y jefe.
 * Todo el arte y el audio se generan de forma procedural en el navegador.
 */
import {
  WORLD, ENEMY_TYPES, ENEMY_SPAWNS, CHESTS, MOONFLOWERS, RUNE_SHRINES,
  ITEMS, WEAPONS, ARMORS, ACCESSORIES, CREATURES, QUESTS, SKILLS,
  SAVE_KEY, APPEARANCE_DEFAULT,
} from './content.js'
import { Player, Enemy, Projectile, Companion } from './entities.js'
import { Input } from './input.js'
import { AudioEngine } from './audio.js'
import { UI } from './ui.js'
import { createWorldData, zoneAt, drawProp, drawInteractive, pointBlocked } from './world.js'
import {
  drawTitleBackdrop, createWorldSurface, drawHero, drawEnemy, drawCompanion, drawNPC,
} from './art/index.js'

const clamp = (v, a, b) => Math.max(a, Math.min(b, v))
const lerp = (a, b, t) => a + (b - a) * t
const dist = (ax, ay, bx, by) => Math.hypot(bx - ax, by - ay)
const rand = (a, b) => a + Math.random() * (b - a)
const fmt = (n) => Math.round(n).toLocaleString('es-ES')

const DEFAULT_SETTINGS = {
  music: .55,
  sfx: .72,
  muted: false,
  touch: true,
  touchScale: 1,
  touchOpacity: .86,
  leftHanded: false,
  vibration: true,
  quality: 'auto',
}

const ZONE_AUDIO = {
  village: 'village', meadow: 'forest', forest: 'forest',
  path: 'ruins', ruins: 'ruins', arena: 'boss',
}

export class Game {
  constructor(canvas) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d', { alpha: false })
    this.settings = { ...DEFAULT_SETTINGS }
    this.mode = 'title'
    this.time = 0
    this.lastFrame = 0
    this.cssWidth = 1280
    this.cssHeight = 720
    this.dpr = 1
    this.qualityFactor = 1

    this.input = new Input()
    this.input.bind()
    this.audio = new AudioEngine()

    this.worldData = null
    this.worldSurface = null
    this.obstacles = []
    this.props = []
    this.npcs = []
    this.chests = []
    this.flowers = []
    this.runeShrines = []

    this.player = null
    this.enemies = []
    this.projectiles = []
    this.particles = []
    this.floaters = []
    this.telegraphs = []
    this.slashes = []
    this.companion = null
    this.boss = null
    this.bossActive = false

    this.story = { step: 0, flags: {} }
    this.gateOpen = false
    this.bossDefeated = false
    this.openedChests = new Set()
    this.collectedFlowers = new Set()
    this.activatedRunes = new Set()
    this.defeated = new Set()

    this.camera = { x: WORLD.spawn.x, y: WORLD.spawn.y, zoom: 1 }
    this.camLook = { x: 0, y: 0 }
    this.shake = 0
    this.damageFlash = 0
    this.flashTimer = 0
    this.comboCount = 0
    this.comboTimer = 0
    this.activeInteract = null
    this.captureTarget = null
    this.lastZone = null
    this.zoneBanner = 0
    this.potionCd = 0
    this.autosaveTimer = 0
    this.pendingIntro = 0
    this.pendingEnding = 0
    this.deathTimer = 0
    this.endingShown = false
    this.spawnTimer = 0

    this.resize()
    this.ui = new UI(this)
    this.ui.showHUD(false)
    this.ui.updateContinueButton()
  }

  /* ======================================================================
     MUNDO, PARTIDAS Y PERSISTENCIA
     ====================================================================== */

  ensureWorld() {
    if (this.worldData) return
    this.worldData = createWorldData()
    this.props = this.worldData.props
    this.obstacles = [...this.worldData.obstacles, this.worldData.gateBarrier]
    this.worldSurface = createWorldSurface()
    this.npcs = this.worldData.npcs.map((npc) => ({ ...npc }))
    this.chests = CHESTS.map((c) => ({ ...c, opened: false }))
    this.flowers = MOONFLOWERS.map((f) => ({ ...f, collected: false }))
    this.runeShrines = RUNE_SHRINES.map((r) => ({ ...r, activated: false }))
  }

  resetRunState() {
    this.story = { step: 0, flags: {} }
    this.gateOpen = false
    this.bossDefeated = false
    this.openedChests = new Set()
    this.collectedFlowers = new Set()
    this.activatedRunes = new Set()
    this.defeated = new Set()
    this.enemies = []
    this.projectiles = []
    this.particles = []
    this.floaters = []
    this.telegraphs = []
    this.slashes = []
    this.companion = null
    this.boss = null
    this.bossActive = false
    this.comboCount = 0
    this.comboTimer = 0
    this.potionCd = 0
    this.autosaveTimer = 0
    this.pendingIntro = .75
    this.pendingEnding = 0
    this.deathTimer = 0
    this.endingShown = false
    this.shake = 0
    this.damageFlash = 0
    this.zoneBanner = 0
    this.captureTarget = null
    this.activeInteract = null
    this.chests = CHESTS.map((c) => ({ ...c, opened: false }))
    this.flowers = MOONFLOWERS.map((f) => ({ ...f, collected: false }))
    this.runeShrines = RUNE_SHRINES.map((r) => ({ ...r, activated: false }))
    this.npcs = this.worldData.npcs.map((npc) => ({ ...npc }))
  }

  startNew(appearance = {}) {
    this.ensureWorld()
    this.audio.init()
    this.audio.play('ui')
    this.resetRunState()
    const app = { ...APPEARANCE_DEFAULT, ...appearance }
    const start = { ...WORLD.spawn }
    this.player = new Player(app, start)
    // El creador permite empezar con arco o bastón: se regalan como equipo inicial.
    if (app.weapon && WEAPONS[app.weapon] && !this.player.weaponIds.includes(app.weapon)) {
      this.player.weaponIds.push(app.weapon)
      this.player.equipWeapon(app.weapon)
    }
    this.player.appearance.weapon = this.player.equipment.weapon
    this.player.checkpoint = { ...start }
    this.spawnEnemies()
    this.camera.x = this.player.x
    this.camera.y = this.player.y
    this.lastZone = zoneAt(this.player.x, this.player.y)
    this.mode = 'playing'
    this.enterGameScreens()
    this.audio.setMode('village')
    this.audio.setCombat(0)
    this.ui.refreshTouchVisibility()
    this.ui.updateHUD(true)
    this.ui.region(this.lastZone.name, this.lastZone.subtitle)
    this.ui.chapter('CAPÍTULO I', 'EL DESPERTAR DE LUMA')
    this.save(true)
  }

  spawnEnemies() {
    this.enemies = []
    for (const spawn of ENEMY_SPAWNS) {
      const data = ENEMY_TYPES[spawn.type]
      if (!data) continue
      const enemy = new Enemy(spawn, data, 0)
      if (this.defeated.has(enemy.id)) continue
      let x = spawn.x, y = spawn.y
      for (let i = 0; i < 9 && pointBlocked(this.obstacles, x, y, enemy.radius, this.gateOpen); i++) {
        const a = Math.random() * Math.PI * 2
        x = spawn.x + Math.cos(a) * (40 + i * 14)
        y = spawn.y + Math.sin(a) * (40 + i * 14)
      }
      enemy.x = x; enemy.y = y; enemy.home.x = x; enemy.home.y = y
      this.enemies.push(enemy)
    }
  }

  enterGameScreens() {
    document.getElementById('title-screen')?.classList.add('hidden')
    document.getElementById('creator-screen')?.classList.add('hidden')
    document.getElementById('loading-screen')?.classList.add('done')
    document.getElementById('gameover-screen')?.classList.add('hidden')
    document.getElementById('ending-screen')?.classList.add('hidden')
    document.getElementById('dialogue-layer')?.classList.add('hidden')
    document.getElementById('pause-layer')?.classList.add('hidden')
    document.getElementById('settings-layer')?.classList.add('hidden')
    this.ui.showHUD(true)
    document.body.classList.remove('low-hp')
  }

  serialize() {
    return {
      version: 2,
      savedAt: Date.now(),
      player: this.player?.serialize(),
      story: JSON.parse(JSON.stringify(this.story)),
      gateOpen: this.gateOpen,
      bossDefeated: this.bossDefeated,
      openedChests: [...this.openedChests],
      collectedFlowers: [...this.collectedFlowers],
      activatedRunes: [...this.activatedRunes],
      defeated: [...this.defeated],
      zone: this.player ? this.currentZone().name : 'Aldea de Luma',
      playTime: Math.floor(this.time),
    }
  }

  save(silent = false) {
    if (!this.player) return false
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(this.serialize()))
      if (!silent) this.ui.flashSave()
      return true
    } catch (error) {
      if (!silent) this.ui.toast('No se pudo guardar la partida en este navegador.', { type: 'bad', icon: '!' })
      return false
    }
  }

  getSaveMeta() {
    try {
      const raw = localStorage.getItem(SAVE_KEY)
      if (!raw) return null
      const data = JSON.parse(raw)
      const p = data?.player
      if (!p) return null
      const x = p.x ?? WORLD.spawn.x
      const y = p.y ?? WORLD.spawn.y
      return {
        name: p.appearance?.name || 'Elian',
        level: p.level || 1,
        zone: zoneAt(x, y).name,
        timestamp: data.savedAt || 0,
        playTime: data.playTime || 0,
      }
    } catch { return null }
  }

  continueGame() {
    let data = null
    try {
      const raw = localStorage.getItem(SAVE_KEY)
      if (raw) data = JSON.parse(raw)
    } catch { data = null }
    if (!data?.player) return this.startNew(APPEARANCE_DEFAULT)
    this.ensureWorld()
    this.audio.init()
    this.resetRunState()
    const saved = data.player
    this.player = new Player(saved.appearance || APPEARANCE_DEFAULT, { x: saved.x, y: saved.y })
    this.player.load(saved)
    this.player.state.dead = false
    this.player.state.hurt = 0
    this.player.state.rolling = false
    this.player.state.attacking = false
    this.player.hp = clamp(this.player.hp, 1, this.player.maxHp)
    this.story = { step: data.story?.step || 0, flags: data.story?.flags || {} }
    this.gateOpen = Boolean(data.gateOpen)
    this.bossDefeated = Boolean(data.bossDefeated)
    this.openedChests = new Set(data.openedChests || [])
    this.collectedFlowers = new Set(data.collectedFlowers || [])
    this.activatedRunes = new Set(data.activatedRunes || [])
    this.defeated = new Set(data.defeated || [])
    for (const chest of this.chests) chest.opened = this.openedChests.has(chest.id)
    for (const flower of this.flowers) flower.collected = this.collectedFlowers.has(flower.id)
    for (const rune of this.runeShrines) rune.activated = this.activatedRunes.has(rune.id)
    this.spawnEnemies()
    if (this.player.activeCreature && this.player.creatures.includes(this.player.activeCreature)) this.summonCompanion(true)
    this.camera.x = this.player.x
    this.camera.y = this.player.y
    this.camLook.x = 0; this.camLook.y = 0
    this.lastZone = zoneAt(this.player.x, this.player.y)
    this.mode = 'playing'
    this.pendingIntro = 0
    this.pendingEnding = 0
    this.deathTimer = 0
    this.enterGameScreens()
    const audioMode = ZONE_AUDIO[this.lastZone.id] || 'village'
    this.audio.setMode(audioMode === 'boss' ? 'ruins' : audioMode)
    this.ui.refreshTouchVisibility()
    this.ui.updateHUD(true)
    this.ui.region(this.lastZone.name, this.lastZone.subtitle)
    this.ui.toast(`Partida de ${this.player.appearance.name} restaurada · Nv. ${this.player.level}`, { icon: '◷', type: 'good' })
  }

  quitToTitle() {
    if (this.player) this.save(true)
    this.mode = 'title'
    this.input.clear()
    this.ui.showTitle()
    this.ui.showHUD(false)
    this.ui.updateContinueButton()
    this.audio.setMode('title')
    this.audio.setCombat(0)
    document.body.classList.remove('low-hp', 'touch-active')
  }

  retry() {
    if (!this.player) return
    this.ui.hideGameOver()
    const p = this.player
    p.state.dead = false
    p.state.hurt = 0
    p.state.rolling = false
    p.state.attacking = false
    p.state.invuln = 1.2
    p.hp = p.maxHp
    p.mp = p.maxMp
    p.stamina = p.maxStamina
    p.x = p.checkpoint?.x ?? WORLD.spawn.x
    p.y = p.checkpoint?.y ?? WORLD.spawn.y
    this.boss = null
    this.bossActive = false
    this.enemies = this.enemies.filter((e) => !e.isBoss)
    this.projectiles = []
    this.telegraphs = []
    this.slashes = []
    this.deathTimer = 0
    this.mode = 'playing'
    this.camera.x = p.x
    this.camera.y = p.y
    this.audio.setMode('village')
    this.ui.showHUD(true)
    this.ui.refreshTouchVisibility()
    this.ui.toast('El santuario te devuelve al camino. Respira.', { icon: '✦', type: 'good' })
  }

  closeEnding() {
    this.ui.hideEnding()
    this.mode = 'playing'
    this.ui.showHUD(true)
    this.ui.refreshTouchVisibility()
    const mode = ZONE_AUDIO[this.currentZone().id] || 'forest'
    this.audio.setMode(mode === 'boss' ? 'ruins' : mode)
  }

  /* ======================================================================
     DATOS PARA LA INTERFAZ
     ====================================================================== */

  currentZone() {
    const x = this.player?.x ?? WORLD.spawn.x
    const y = this.player?.y ?? WORLD.spawn.y
    return zoneAt(x, y)
  }

  questState() {
    const quest = QUESTS[Math.min(this.story.step, QUESTS.length - 1)] || QUESTS[0]
    const flowers = this.player?.inventory?.flor_luna || 0
    const runes = this.player?.inventory?.esquirla_runa || 0
    let objective = quest.objective
    let dots = [this.story.flags?.talkedElara || this.story.step > 0]
    if (this.story.step === 1) {
      objective = `Flores de luna ${Math.min(3, flowers)} / 3`
      dots = [flowers >= 1, flowers >= 2, flowers >= 3]
    } else if (this.story.step === 2) {
      objective = `Esquirlas de runa ${Math.min(3, runes)} / 3`
      dots = [runes >= 1, runes >= 2, runes >= 3]
    } else if (this.story.step === 3) {
      objective = this.gateOpen ? 'La puerta está abierta' : 'Abre la puerta de Aether'
      dots = [this.gateOpen]
    } else if (this.story.step === 4) {
      objective = this.bossDefeated ? 'El Guardián ha caído' : 'Derrota al Guardián corrompido'
      dots = [this.bossDefeated]
    } else if (this.story.step >= 5) {
      objective = quest.objective
      dots = [true]
    }
    return { ...quest, objective, dots }
  }

  questMarker() {
    const step = this.story.step
    if (step <= 0) {
      const elara = this.npcs.find((n) => n.id === 'elara')
      return elara ? { x: elara.x, y: elara.y - 30 } : { x: WORLD.shrine.x, y: WORLD.shrine.y }
    }
    if (step === 1) {
      let best = null, bestD = Infinity
      const px = this.player?.x ?? 0, py = this.player?.y ?? 0
      for (const f of this.flowers) {
        if (f.collected) continue
        const d = dist(px, py, f.x, f.y)
        if (d < bestD) { best = f; bestD = d }
      }
      return best ? { x: best.x, y: best.y - 28 } : { x: WORLD.shrine.x, y: WORLD.shrine.y }
    }
    if (step === 2) {
      let best = null, bestD = Infinity
      const px = this.player?.x ?? 0, py = this.player?.y ?? 0
      for (const e of this.enemies) {
        if (e.dead || e.dying || e.type.id !== 'escarabajo') continue
        const d = dist(px, py, e.x, e.y)
        if (d < bestD) { best = e; bestD = d }
      }
      return best ? { x: best.x, y: best.y - 45 } : { x: WORLD.gate.x, y: WORLD.gate.y }
    }
    if (step === 3) return { x: WORLD.gate.x, y: WORLD.gate.y }
    if (step === 4) return { x: this.boss?.x ?? WORLD.boss.x, y: (this.boss?.y ?? WORLD.boss.y) - 60 }
    return { x: WORLD.shrine.x, y: WORLD.shrine.y }
  }

  captureChance() {
    const e = this.captureTarget
    if (!e) return 0
    const missing = 1 - e.hp / e.maxHp
    return clamp(.42 + missing * .48 + (this.player?.attributes?.luck || 0) * .012, .18, .95)
  }

  updateAppearance() {
    if (!this.player) return
    this.player.appearance.weapon = this.player.equipment.weapon
  }

  allocateStat(stat) {
    if (!this.player) return false
    const ok = this.player.allocate(stat)
    if (ok) {
      this.player.recalc()
      this.ui.updateHUD(true)
    }
    return ok
  }

  /* ======================================================================
     ACCIONES RÁPIDAS DE LA INTERFAZ
     ====================================================================== */

  usePotion() {
    if (!this.player || this.mode !== 'playing' || this.player.state.dead) return
    if (this.potionCd > 0) return
    const result = this.player.useItem('pocion_vida')
    if (result.ok) {
      this.potionCd = .8
      this.audio.play('heal')
      this.ui.toast(result.message, { icon: '⚗', type: 'good' })
      this.burst(this.player.x, this.player.y - 30, '#ff9aae', 18, { speed: 80, life: .8 })
      this.addFloater(`+${ITEMS.pocion_vida.amount}`, this.player.x, this.player.y - 70, '#9dffcf')
      this.ui.updateHUD(true)
    } else {
      this.audio.play('ui')
      this.ui.toast(result.message, { icon: '!', type: 'bad' })
    }
  }

  cycleWeapon() {
    if (!this.player || this.mode !== 'playing') return
    if (this.player.cycleWeapon(1)) {
      this.updateAppearance()
      this.audio.play('ui')
      this.ui.toast(`Arma equipada: ${this.player.weapon.name}`, { icon: '⚔' })
      this.ui.updateHUD(true)
    }
  }

  useSkill() {
    if (!this.player || this.mode !== 'playing' || this.player.state.dead) return
    this.castSkill()
  }

  toggleCompanion() {
    if (!this.player || this.mode !== 'playing') return
    if (!this.player.creatures.length) {
      this.ui.toast('Aún no has sellado ninguna criatura. Debilita a una y usa un Sello de Lumen.', { icon: '❖' })
      return
    }
    if (this.player.activeCreature && this.companion) {
      this.companion = null
      this.player.activeCreature = null
      this.audio.play('ui')
      this.ui.toast('Tu criatura descansa en el vínculo.', { icon: '❖' })
    } else {
      if (!this.player.activeCreature) this.player.activeCreature = this.player.creatures[0]
      this.summonCompanion()
    }
    this.ui.updateHUD(true)
  }

  summonCompanion(silent = false) {
    if (!this.player) return
    if (!this.player.activeCreature && this.player.creatures.length) this.player.activeCreature = this.player.creatures[0]
    const id = this.player.activeCreature
    if (!id || !CREATURES[id]) { this.companion = null; return }
    this.companion = new Companion(id)
    this.companion.x = this.player.x - 34
    this.companion.y = this.player.y - 8
    this.companion.alpha = 0
    if (!silent) {
      this.audio.play('seal')
      this.ui.toast(`${CREATURES[id].name} responde a tu llamada.`, { icon: '❖', type: 'good' })
    }
    this.ui.updateHUD(true)
  }

  /* ======================================================================
     AJUSTES Y TAMAÑO
     ====================================================================== */

  applySettings(persist = true) {
    if (!this.settings) return
    this.audio.setVolumes(this.settings.music, this.settings.sfx, this.settings.muted)
    document.body.classList.toggle('left-handed', Boolean(this.settings.leftHanded))
    this.qualityFactor = this.settings.quality === 'high' ? 1.3 : this.settings.quality === 'low' ? .55 : 1
    if (this.canvas) this.resize()
    this.ui?.refreshTouchVisibility()
    if (persist) {
      try { this.ui?.saveSettings() } catch {}
    }
  }

  resize() {
    const rect = this.canvas.getBoundingClientRect()
    this.cssWidth = Math.max(320, Math.round(rect.width || window.innerWidth || 1280))
    this.cssHeight = Math.max(240, Math.round(rect.height || window.innerHeight || 720))
    const cap = this.settings.quality === 'high' ? 2 : this.settings.quality === 'low' ? 1 : 1.6
    this.dpr = Math.max(1, Math.min(window.devicePixelRatio || 1, cap))
    const w = Math.round(this.cssWidth * this.dpr)
    const h = Math.round(this.cssHeight * this.dpr)
    if (this.canvas.width !== w || this.canvas.height !== h) {
      this.canvas.width = w
      this.canvas.height = h
    }
  }

  /* ======================================================================
     BUCLE PRINCIPAL
     ====================================================================== */

  update(dt) {
    dt = Math.min(.05, Math.max(0, dt))
    this.time += dt
    this.input.pollGamepad()

    if (this.mode === 'title' || this.mode === 'creator') {
      this.audio.update()
      return
    }
    if (this.mode === 'dialogue') {
      if (this.input.pressed('interact') || this.input.pressed('attack') || this.input.pressed('pause')) {
        this.ui.advanceDialogue()
      }
      this.audio.update()
      return
    }
    if (this.mode === 'paused') {
      if (this.input.pressed('pause')) this.ui.closePause()
      this.audio.update()
      return
    }
    if (this.mode === 'gameover') {
      if (this.input.pressed('pause') || this.input.pressed('interact')) this.retry()
      this.audio.update()
      return
    }
    if (this.mode === 'ending') {
      if (this.input.pressed('pause') || this.input.pressed('interact')) this.closeEnding()
      this.audio.update()
      return
    }
    if (this.mode !== 'playing' || !this.player) {
      this.audio.update()
      return
    }

    if (this.input.pressed('pause')) { this.ui.openPause('status'); return }
    if (this.input.pressed('journal')) { this.ui.openPause('quests'); return }
    if (this.input.pressed('bestiary')) { this.ui.openPause('bestiary'); return }
    if (this.input.pressed('map')) {
      const zone = this.currentZone()
      this.ui.toast(`${zone.name} · ${zone.subtitle}`, { icon: '▤' })
    }
    if (this.input.pressed('potion')) this.usePotion()
    if (this.input.pressed('prevWeapon')) this.cycleWeapon()
    if (this.input.pressed('companion')) this.toggleCompanion()

    this.updateTimers(dt)
    this.updatePlayer(dt)
    this.updateEnemies(dt)
    this.updateCompanion(dt)
    this.updateProjectiles(dt)
    this.updateTelegraphs(dt)
    this.updateParticles(dt)
    this.updateInteraction()

    if (this.input.pressed('interact')) this.interact()

    this.maybeAdvanceQuests()
    this.updateZoneAndAudio()
    this.updateCamera(dt)

    if (this.pendingIntro > 0) {
      this.pendingIntro -= dt
      if (this.pendingIntro <= 0) this.showIntro()
    }
    if (this.pendingEnding > 0) {
      this.pendingEnding -= dt
      if (this.pendingEnding <= 0 && !this.endingShown) this.finishEnding()
    }
    if (this.player.state.dead) {
      this.deathTimer += dt
      if (this.deathTimer > 1.1 && this.mode === 'playing') {
        this.mode = 'gameover'
        this.input.clear()
        this.ui.showGameOver()
      }
    }

    this.autosaveTimer += dt
    if (this.autosaveTimer > 28) {
      this.autosaveTimer = 0
      this.save(true)
    }
    this.audio.update()
  }

  updateTimers(dt) {
    const p = this.player
    const st = p.state
    st.invuln = Math.max(0, st.invuln - dt)
    st.hurt = Math.max(0, st.hurt - dt)
    st.comboWindow = Math.max(0, st.comboWindow - dt)
    st.skillCd = Math.max(0, st.skillCd - dt)
    st.cast = Math.max(0, st.cast - dt * 3)
    p.attackCd = Math.max(0, p.attackCd - dt)
    p.staminaDelay = Math.max(0, p.staminaDelay - dt)
    p.shieldT = Math.max(0, (p.shieldT || 0) - dt)
    this.potionCd = Math.max(0, this.potionCd - dt)
    this.comboTimer = Math.max(0, this.comboTimer - dt)
    if (this.comboTimer <= 0) this.comboCount = 0
    this.shake = Math.max(0, this.shake - dt * 14)
    this.damageFlash = Math.max(0, this.damageFlash - dt * 1.8)
    this.zoneBanner = Math.max(0, this.zoneBanner - dt)
  }

  updatePlayer(dt) {
    const p = this.player
    const st = p.state
    if (st.dead) return

    if (st.hurt > 0) {
      st.attack = 0
      st.attacking = false
      st.blocking = false
      st.block = Math.max(0, st.block - dt * 4)
      this.regen(dt)
      return
    }

    if (st.rolling) {
      st.rollT += dt
      st.roll = clamp(st.rollT / st.rollDur, 0, 1)
      const speed = p.moveSpeed * 2.9 * Math.sin(Math.min(1, st.roll) * Math.PI)
      this.moveEntity(p, p.rollDir.x * speed * dt, p.rollDir.y * speed * dt, p.radius)
      p.walk += dt * 4
      p.moving = true
      if (st.rollT >= st.rollDur) {
        st.rolling = false
        st.roll = 0
        st.rollT = 0
      }
      this.regen(dt)
      return
    }

    // Esquivar. Mantener pulsado después permite bloquear.
    if (this.input.pressed('dodge') && !st.attacking && p.stamina > 14) this.startRoll()
    st.blocking = !st.attacking && !st.rolling && this.input.isDown('dodge') && p.stamina > 1
    if (st.blocking) {
      st.block = Math.min(1, st.block + dt * 8)
      p.stamina = Math.max(0, p.stamina - dt * (p.weapon.type === 'Escudo' ? 4.5 : 9))
      p.staminaDelay = .5
      if (p.stamina <= 0) st.blocking = false
    } else {
      st.block = Math.max(0, st.block - dt * 7)
    }

    const move = this.input.move
    if (move.length > .06 && !st.rolling) {
      const nx = move.x / Math.max(move.length, .001)
      const ny = move.y / Math.max(move.length, .001)
      p.facing.x = nx
      p.facing.y = ny
      p.lastFacingX = nx < -.1 ? -1 : 1
      let speed = p.moveSpeed
      if (st.attacking) speed *= .34
      if (st.blocking) speed *= .48
      this.moveEntity(p, nx * speed * dt * move.length, ny * speed * dt * move.length, p.radius)
      p.moving = true
      p.walk += dt * (1.5 + move.length)
      if (move.length > .35) this.audio.footstep()
    } else {
      p.moving = false
      p.walk += dt * .35
    }

    if (st.attacking) {
      st.attackT += dt
      st.attack = clamp(st.attackT / st.attackDur, 0, 1)
      if (!st.hitDone && st.attack >= .4) {
        st.hitDone = true
        this.resolvePlayerAttack()
      }
      if (st.attack >= 1) {
        st.attacking = false
        st.attack = 0
        st.attackT = 0
        p.attackCd = .07
      }
    } else if (this.input.pressed('attack') || (this.input.isDown('attack') && p.attackCd <= 0 && st.comboWindow > 0)) {
      this.startAttack()
    }

    if (this.input.pressed('skill')) this.castSkill()
    this.regen(dt)
  }

  regen(dt) {
    const p = this.player
    const st = p.state
    if (p.staminaDelay <= 0 && !st.attacking && !st.rolling && !st.blocking) {
      p.stamina = Math.min(p.maxStamina, p.stamina + (17 + p.attributes.endurance * .9) * dt)
    }
    if (!st.attacking && !st.rolling) {
      p.mp = Math.min(p.maxMp, p.mp + (1.7 + p.attributes.intelligence * .16) * dt)
    }
    p.recalc()
  }

  startRoll() {
    const p = this.player
    const st = p.state
    const move = this.input.move
    const dx = move.length > .08 ? move.x : p.facing.x
    const dy = move.length > .08 ? move.y : p.facing.y
    const len = Math.hypot(dx, dy) || 1
    st.rolling = true
    st.rollT = 0
    st.roll = 0
    st.invuln = .38
    st.blocking = false
    p.rollDir = { x: dx / len, y: dy / len }
    p.stamina = Math.max(0, p.stamina - 16)
    p.staminaDelay = .85
    this.audio.play('dodge')
    this.burst(p.x, p.y - 8, 'rgba(158,224,255,.75)', 8, { speed: 65, life: .35, gravity: 0 })
  }

  startAttack() {
    const p = this.player
    const st = p.state
    const w = p.weapon
    if (this.input.move.length > .12) {
      const len = Math.hypot(this.input.move.x, this.input.move.y) || 1
      p.facing.x = this.input.move.x / len
      p.facing.y = this.input.move.y / len
      p.lastFacingX = p.facing.x < 0 ? -1 : 1
    }
    if (p.stamina < w.stamina * .65) {
      this.addFloater('Sin resistencia', p.x, p.y - 74, '#e4c45f')
      this.audio.play('ui')
      return
    }
    p.stamina = Math.max(0, p.stamina - w.stamina)
    p.staminaDelay = .8
    st.attacking = true
    st.attack = .0001
    st.attackT = 0
    st.attackDur = clamp(.46 / (w.speed || 1), .22, .72)
    st.hitDone = false
    st.combo = st.comboWindow > 0 ? Math.min(5, (st.combo || 0) + 1) : 1
    st.comboWindow = .85
    p.attackCd = .1
    this.audio.play(w.type === 'Mandoble' ? 'heavySwing' : 'swing')
  }

  resolvePlayerAttack() {
    const p = this.player
    const w = p.weapon
    const st = p.state
    const len = Math.hypot(p.facing.x, p.facing.y) || 1
    const dirX = p.facing.x / len
    const dirY = p.facing.y / len
    const comboMult = 1 + Math.max(0, (st.combo || 1) - 1) * .065
    this.slashes.push({
      x: p.x, y: p.y - 27, angle: Math.atan2(dirY, dirX),
      range: Math.min(150, w.range * .9), arc: w.arc || 1.4,
      life: .24, maxLife: .24, color: w.glow || '#dff4ff',
    })

    if (w.ranged) {
      const crit = Math.random() < p.critChance
      const angle = Math.atan2(dirY, dirX)
      this.spawnProjectile({
        x: p.x + dirX * 27, y: p.y - 36 + dirY * 7,
        vx: Math.cos(angle) * (w.ranged === 'arrow' ? 780 : 620),
        vy: Math.sin(angle) * (w.ranged === 'arrow' ? 780 : 620),
        radius: w.ranged === 'arrow' ? 4 : 8,
        damage: p.attackPower * (crit ? 1.8 : 1) * comboMult,
        owner: 'player', color: w.glow || '#a8ecff',
        kind: w.ranged, pierce: w.ranged === 'arcane' ? 1 : 0,
        life: 1.25,
      })
      this.audio.play(w.ranged === 'arrow' ? 'swing' : 'magic')
      return
    }

    let hits = 0
    for (const enemy of this.enemies) {
      if (enemy.dead || enemy.dying || enemy.captured) continue
      const dx = enemy.x - p.x, dy = enemy.y - p.y
      const d = Math.hypot(dx, dy)
      if (d > w.range + enemy.radius + 12) continue
      if (d > 38) {
        const dot = (dx * dirX + dy * dirY) / d
        if (dot < Math.cos((w.arc || 1.4) / 2)) continue
      }
      const crit = Math.random() < p.critChance
      const damage = p.attackPower * (crit ? 1.85 : 1) * comboMult
      this.hitEnemy(enemy, damage, {
        crit, sourceX: p.x, sourceY: p.y,
        knockback: crit ? 230 : (w.type === 'Mandoble' ? 220 : 130),
        stagger: Boolean(w.stagger),
      })
      hits++
    }
    if (hits) this.shake = Math.max(this.shake, w.type === 'Mandoble' ? 7 : 2.6)
  }

  moveEntity(entity, dx, dy, radius = entity.radius || 12) {
    if (!this.worldData) return
    const nx = entity.x + dx
    if (!pointBlocked(this.obstacles, nx, entity.y, radius, this.gateOpen)) entity.x = nx
    const ny = entity.y + dy
    if (!pointBlocked(this.obstacles, entity.x, ny, radius, this.gateOpen)) entity.y = ny
  }

  hitEnemy(enemy, amount, opts = {}) {
    if (!enemy || enemy.dead || enemy.dying || enemy.captured) return
    const dealt = enemy.takeDamage(amount, opts)
    const value = Math.max(1, Math.round(dealt))
    this.addFloater(`${value}${opts.crit ? '!' : ''}`, enemy.x + rand(-8, 8), enemy.y - 74, opts.crit ? '#ffe082' : '#f3f0e4', opts.crit ? 15 : 12)
    this.burst(enemy.x, enemy.y - 45, opts.crit ? '#ffe18e' : '#d9f4ff', opts.crit ? 14 : 7, { speed: opts.crit ? 140 : 85, life: .45 })
    this.audio.play(opts.crit ? 'critical' : 'hit')
    this.comboCount++
    this.comboTimer = 2.4
    if (this.settings.vibration && opts.crit && navigator.vibrate) navigator.vibrate(18)
    if (enemy.hp <= 0 && !enemy.rewarded) this.onEnemyKilled(enemy)
    if (enemy.isBoss) this.checkBossPhase()
  }

  damagePlayer(amount, source = null, opts = {}) {
    const p = this.player
    if (!p || p.state.dead || p.state.invuln > 0 || p.state.rolling) return
    let damage = Math.max(1, amount - p.defense * .34)
    let blocked = false
    if (p.state.blocking && p.stamina > 0) {
      blocked = true
      damage *= p.weapon?.type === 'Escudo' ? .16 : .26
      p.stamina = Math.max(0, p.stamina - damage * (p.weapon?.type === 'Escudo' ? .8 : 1.35))
      p.staminaDelay = .7
      this.audio.play('block')
      this.burst(p.x, p.y - 35, '#ffe7a0', 10, { speed: 95, life: .35 })
      if (p.stamina <= 0) {
        p.state.blocking = false
        damage *= 1.7
      }
    }
    if ((p.shieldT || 0) > 0) damage *= .7
    damage = Math.max(1, Math.round(damage))
    p.hp -= damage
    p.state.invuln = .62
    p.state.hurt = .22
    p.state.attack = 0
    p.state.attacking = false
    this.shake = Math.max(this.shake, blocked ? 5 : 8)
    this.damageFlash = Math.max(this.damageFlash, blocked ? .25 : .55)
    this.audio.play('hurt')
    this.addFloater(`-${damage}`, p.x, p.y - 80, blocked ? '#ffe6a6' : '#ff8a9d', blocked ? 12 : 14)
    this.burst(p.x, p.y - 40, '#ff7188', blocked ? 8 : 14, { speed: 110, life: .5 })
    if (this.settings.vibration && navigator.vibrate) navigator.vibrate(blocked ? 8 : 24)
    if (source) {
      const angle = Math.atan2(p.y - source.y, p.x - source.x)
      this.moveEntity(p, Math.cos(angle) * 22, Math.sin(angle) * 22, p.radius)
    }
    if (p.hp <= 0) {
      p.hp = 0
      this.playerDied()
    }
    this.ui.updateHUD(true)
  }

  playerDied() {
    const p = this.player
    p.state.dead = true
    p.state.attacking = false
    p.state.rolling = false
    p.state.hurt = 0
    this.deathTimer = 0
    this.audio.play('death')
    this.audio.setMode('title')
    this.burst(p.x, p.y - 34, '#b7d6ff', 28, { speed: 150, life: 1.1 })
  }

  resolveEnemyAttack(enemy) {
    if (!this.player || this.player.state.dead) return
    const kind = enemy.state.attackKind
    const d = dist(enemy.x, enemy.y, this.player.x, this.player.y)
    if (kind === 'wraithBolt') {
      const angle = Math.atan2(this.player.y - enemy.y, this.player.x - enemy.x)
      this.spawnProjectile({
        x: enemy.x, y: enemy.y - 38,
        vx: Math.cos(angle) * 285, vy: Math.sin(angle) * 285,
        radius: 8, damage: Math.round(enemy.damage * 1.15),
        owner: 'enemy', color: '#b48aff', kind: 'wraith', life: 3.2,
      })
      this.audio.play('magic')
      return
    }
    if (kind === 'beetleSlam' && d < 112) this.damagePlayer(enemy.damage, enemy)
    else if (kind === 'slimeSlam' && d < 78) this.damagePlayer(enemy.damage, enemy)
    else if (kind === 'wolfLunge' && d < 105) this.damagePlayer(enemy.damage, enemy)
  }

  /* ======================================================================
     ENEMIGOS Y JEFE
     ====================================================================== */

  updateEnemies(dt) {
    for (const enemy of [...this.enemies]) {
      if (enemy === this.boss) {
        this.updateBoss(dt)
        continue
      }
      if (enemy.captured) {
        enemy.dying -= dt
        enemy.alpha = Math.max(0, enemy.alpha - dt * 2)
        if (enemy.dying <= 0) enemy.dead = true
        continue
      }
      if (!enemy.dead) enemy.update(dt, this)
    }

    // Separación suave para que las criaturas no se apilen.
    for (let i = 0; i < this.enemies.length; i++) {
      const a = this.enemies[i]
      if (a.dead || a.dying || a.isBoss) continue
      for (let j = i + 1; j < this.enemies.length; j++) {
        const b = this.enemies[j]
        if (b.dead || b.dying || b.isBoss) continue
        const dx = b.x - a.x, dy = b.y - a.y
        const d = Math.hypot(dx, dy)
        const min = a.radius + b.radius
        if (d > 0 && d < min) {
          const push = (min - d) * .5
          const nx = dx / d, ny = dy / d
          this.moveEntity(a, -nx * push, -ny * push, a.radius)
          this.moveEntity(b, nx * push, ny * push, b.radius)
        }
      }
    }
    this.enemies = this.enemies.filter((e) => !e.dead || (e.isBoss && !this.bossDefeated))
  }

  startBoss() {
    if (this.bossActive || this.bossDefeated) return
    const data = ENEMY_TYPES.guardian
    const boss = new Enemy({ type: 'guardian', x: WORLD.boss.x, y: WORLD.boss.y }, data, 0)
    boss.isBoss = true
    boss.id = 'boss_guardian'
    boss.phase = 1
    boss.cooldown = 1.5
    boss.aggro = 760
    boss.speed = data.speed
    boss.flags = { minions2: false, minions3: false }
    this.boss = boss
    this.bossActive = true
    this.enemies.push(boss)
    this.player.checkpoint = { x: 2950, y: 1030 }
    this.ui.chapter('CAPÍTULO III', 'EL GUARDIÁN CORROMPIDO', 4800)
    this.ui.toast('El Guardián corrompido despierta. La Espada Celestial te observa.', { icon: '⚔', type: 'bad', duration: 4500 })
    this.audio.play('roar')
    this.audio.setMode('boss')
    this.shake = 12
    this.save(true)
  }

  updateBoss(dt) {
    const boss = this.boss
    if (!boss) return
    if (boss.dead) return
    if (boss.dying > 0) {
      boss.dying -= dt
      boss.alpha = Math.max(0, boss.dying / .9)
      if (boss.dying <= 0) boss.dead = true
      return
    }
    if (boss.state.hurt > 0) {
      boss.state.hurt -= dt
      boss.hitFlash = Math.max(0, boss.hitFlash - dt * 4)
      return
    }
    boss.hitFlash = Math.max(0, boss.hitFlash - dt * 4)
    const p = this.player
    const dx = p.x - boss.x, dy = p.y - boss.y
    const d = Math.hypot(dx, dy) || 1
    boss.faceTo(p.x, p.y)
    boss.walk += dt * 2
    boss.phase = boss.hp / boss.maxHp < .33 ? 3 : boss.hp / boss.maxHp < .67 ? 2 : boss.phase

    if (boss.state.attack > 0) {
      boss.state.attackTimer += dt
      const prog = boss.state.attackTimer / boss.state.attackDur
      boss.state.attack = Math.min(1, prog)
      if (!boss.state.attackHit && prog >= .7) {
        boss.state.attackHit = true
        this.resolveBossAttack(boss)
      }
      if (prog >= 1) {
        boss.state.attack = 0
        boss.state.attackKind = null
        boss.cooldown = boss.phase === 3 ? rand(1.05, 1.5) : boss.phase === 2 ? rand(1.5, 2.1) : rand(2, 2.7)
      }
      return
    }

    boss.cooldown -= dt
    const ideal = boss.phase === 1 ? 150 : boss.phase === 2 ? 175 : 145
    if (d > ideal) {
      boss.moving = true
      const speed = boss.speed * (boss.phase === 3 ? 1.35 : boss.phase === 2 ? 1.18 : 1)
      this.moveEntity(boss, dx / d * speed * dt, dy / d * speed * dt, boss.radius)
    } else {
      boss.moving = false
      const strafe = Math.sin(this.time * 1.3) * .25
      this.moveEntity(boss, -dy / d * boss.speed * strafe * dt, dx / d * boss.speed * strafe * dt, boss.radius)
    }
    if (boss.cooldown <= 0) {
      const roll = Math.random()
      let kind
      if (boss.phase === 1) kind = roll < .58 ? 'bossSlam' : 'bossCharge'
      else if (boss.phase === 2) kind = roll < .42 ? 'bossSlam' : roll < .7 ? 'bossOrbs' : 'bossCharge'
      else kind = roll < .34 ? 'bossRain' : roll < .62 ? 'bossOrbs' : roll < .82 ? 'bossSlam' : 'bossCharge'
      this.startBossAttack(kind)
    }
  }

  startBossAttack(kind) {
    const boss = this.boss
    if (!boss) return
    boss.state.attackKind = kind
    boss.state.attack = .0001
    boss.state.attackTimer = 0
    boss.state.attackDur = kind === 'bossRain' ? 1.35 : kind === 'bossOrbs' ? 1.05 : .95
    boss.state.attackHit = false
    boss.moving = false
    const px = this.player.x, py = this.player.y
    if (kind === 'bossSlam') {
      this.addTelegraph({ type: 'circle', x: boss.x, y: boss.y, radius: boss.phase >= 3 ? 190 : 160, life: .8, maxLife: .8, color: '#ff6a91' })
      this.audio.play('roar')
    } else if (kind === 'bossCharge') {
      this.bossChargeAngle = Math.atan2(py - boss.y, px - boss.x)
      this.addTelegraph({
        type: 'line', x: boss.x, y: boss.y, angle: this.bossChargeAngle,
        length: 340, width: boss.phase >= 3 ? 100 : 82, life: .72, maxLife: .72, color: '#c08cff',
      })
      this.audio.play('heavySwing')
    } else if (kind === 'bossOrbs') {
      this.addTelegraph({ type: 'circle', x: boss.x, y: boss.y, radius: 120, life: .55, maxLife: .55, color: '#b38cff' })
    } else if (kind === 'bossRain') {
      const count = boss.phase >= 3 ? 6 : 4
      for (let i = 0; i < count; i++) {
        const a = Math.random() * Math.PI * 2
        const r = i === 0 ? 0 : rand(70, 210)
        const tx = px + Math.cos(a) * r
        const ty = py + Math.sin(a) * r
        this.addTelegraph({
          type: 'circle', x: tx, y: ty, radius: 66, life: .95 + i * .07, maxLife: .95 + i * .07,
          color: '#ff719d',
          onEnd: () => {
            if (dist(this.player.x, this.player.y, tx, ty) < 66 + this.player.radius) {
              this.damagePlayer(22 + boss.phase * 3, boss)
            }
            this.burst(tx, ty, '#ff86aa', 16, { speed: 130, life: .55 })
          },
        })
      }
    }
  }

  resolveBossAttack(boss) {
    const p = this.player
    const kind = boss.state.attackKind
    if (kind === 'bossSlam') {
      const radius = boss.phase >= 3 ? 190 : 160
      if (dist(boss.x, boss.y, p.x, p.y) < radius + p.radius) {
        this.damagePlayer(30 + boss.phase * 3, boss)
      }
      this.shake = Math.max(this.shake, 13)
      this.burst(boss.x, boss.y, '#ff9eb8', 26, { speed: 190, life: .7 })
    } else if (kind === 'bossCharge') {
      const a = this.bossChargeAngle || 0
      const steps = 20
      let hit = false
      for (let i = 0; i < steps; i++) {
        this.moveEntity(boss, Math.cos(a) * 15, Math.sin(a) * 15, boss.radius)
        if (!hit && dist(boss.x, boss.y, p.x, p.y) < 96) {
          this.damagePlayer(26 + boss.phase * 2, boss)
          hit = true
        }
      }
      this.shake = Math.max(this.shake, 10)
      this.burst(boss.x, boss.y, '#c7a6ff', 20, { speed: 170, life: .6 })
    } else if (kind === 'bossOrbs') {
      const count = boss.phase >= 3 ? 14 : boss.phase === 2 ? 11 : 8
      for (let i = 0; i < count; i++) {
        const a = i / count * Math.PI * 2 + this.time * .2
        this.spawnProjectile({
          x: boss.x + Math.cos(a) * 40, y: boss.y - 42 + Math.sin(a) * 30,
          vx: Math.cos(a) * 245, vy: Math.sin(a) * 245,
          radius: 8, damage: 16 + boss.phase * 3, owner: 'enemy',
          color: boss.phase >= 3 ? '#ff6b93' : '#bc8cff', kind: 'bossOrb', life: 3.4,
        })
      }
      this.audio.play('magic')
    }
  }

  checkBossPhase() {
    const boss = this.boss
    if (!boss || boss.dead || boss.dying) return
    const wanted = boss.hp / boss.maxHp < .33 ? 3 : boss.hp / boss.maxHp < .67 ? 2 : 1
    if (wanted > boss.phase) {
      boss.phase = wanted
      boss.cooldown = .9
      this.audio.play('roar')
      this.shake = 14
      this.ui.toast(wanted === 2 ? 'El Guardián despierta su segunda fase.' : 'El Guardián ha perdido todo control. ¡Cuidado!', { icon: '⚔', type: 'bad', duration: 3500 })
      this.burst(boss.x, boss.y - 40, wanted === 3 ? '#ff6b93' : '#c39bff', 34, { speed: 220, life: .9 })
      if (wanted >= 2 && !boss.flags.minions2) {
        boss.flags.minions2 = true
        this.spawnMinion('espectro', boss.x - 150, boss.y + 80)
        this.spawnMinion('espectro', boss.x + 150, boss.y + 80)
      }
      if (wanted >= 3 && !boss.flags.minions3) {
        boss.flags.minions3 = true
        this.spawnMinion('espectro', boss.x - 200, boss.y - 40)
        this.spawnMinion('espectro', boss.x + 200, boss.y - 40)
      }
    }
  }

  spawnMinion(type, x, y) {
    const data = ENEMY_TYPES[type]
    if (!data) return
    const minion = new Enemy({ type, x, y }, data, Math.max(0, (this.player?.level || 1) - 3))
    minion.x = x; minion.y = y; minion.home = { x, y }
    this.enemies.push(minion)
    this.burst(x, y - 30, '#c79bff', 12, { speed: 110, life: .5 })
  }

  onEnemyKilled(enemy) {
    if (!enemy || enemy.rewarded) return
    enemy.rewarded = true
    const p = this.player
    if (enemy.isBoss) {
      this.onBossDefeated()
      return
    }
    this.defeated.add(enemy.id)
    p.kills++
    const levels = p.addXp(enemy.xp)
    p.gold += enemy.gold
    this.addFloater(`+${enemy.xp} XP`, enemy.x, enemy.y - 96, '#9de8ff', 11)
    this.addFloater(`+${enemy.gold} ◈`, enemy.x, enemy.y - 112, '#f4d278', 10)
    this.audio.play('coin')
    if (levels > 0) {
      this.audio.play('level')
      this.ui.toast(`¡Nivel ${p.level}! +3 puntos de atributo`, { icon: '✦', type: 'good', duration: 4200 })
      this.burst(p.x, p.y - 45, '#fff0a9', 36, { speed: 190, life: 1 })
      this.shake = 6
    }

    // Botín normal.
    for (const drop of enemy.type.drops || []) {
      if (Math.random() < drop.chance && ITEMS[drop.id]) {
        p.addItem(drop.id)
        this.ui.toast(`Obtuviste ${ITEMS[drop.id].name}`, { icon: '◇', type: 'good', duration: 2300 })
      }
    }
    // Las esquirlas de runa son una garantía de progresión, no una lotería.
    if (enemy.type.id === 'escarabajo' && (p.inventory.esquirla_runa || 0) < 3) {
      p.addItem('esquirla_runa')
      this.ui.toast('El caparazón deja caer una esquirla de runa.', { icon: 'ᛉ', type: 'quest', duration: 3000 })
      this.burst(enemy.x, enemy.y - 40, '#73e7d0', 20, { speed: 120, life: .8 })
    }
    this.maybeAdvanceQuests()
    this.ui.updateHUD(true)
  }

  onBossDefeated() {
    if (this.bossDefeated) return
    const p = this.player
    this.bossDefeated = true
    this.bossActive = false
    p.bossKills = (p.bossKills || 0) + 1
    p.addXp(600)
    p.gold += 250
    this.story.step = 5
    this.story.flags.bossDefeated = true
    if (!p.weaponIds.includes('espada_celestial')) p.weaponIds.push('espada_celestial')
    p.equipWeapon('espada_celestial')
    if (!p.armorIds.includes('vestido_celestial')) p.armorIds.push('vestido_celestial')
    p.equipArmor('vestido_celestial')
    this.updateAppearance()
    p.hp = p.maxHp; p.mp = p.maxMp; p.stamina = p.maxStamina
    this.audio.play('bossDown')
    this.audio.setMode('victory')
    this.shake = 20
    this.damageFlash = 0
    this.burst(this.boss?.x || p.x, (this.boss?.y || p.y) - 60, '#ffe58e', 60, { speed: 260, life: 1.4 })
    this.ui.toast('Has reclamado la Espada Celestial. El cielo vuelve a respirar.', { icon: '✦', type: 'good', duration: 6000 })
    this.ui.chapter('EPÍLOGO', 'UN NUEVO AMANECER', 6000)
    this.pendingEnding = 2.8
    this.save(true)
  }

  /* ======================================================================
     PROYECTILES, CRIATURAS Y EFECTOS
     ====================================================================== */

  spawnProjectile(opts) {
    const p = new Projectile(opts)
    this.projectiles.push(p)
    this.burst(opts.x, opts.y, opts.color || '#b48aff', 5, { speed: 55, life: .25, gravity: 0 })
    return p
  }

  updateProjectiles(dt) {
    const p = this.player
    for (const proj of this.projectiles) {
      if (proj.dead) continue
      proj.life -= dt
      if (proj.life <= 0) { proj.dead = true; continue }
      if (proj.homing && proj.target && !proj.target.dead) {
        const desired = Math.atan2(proj.target.y - proj.y, proj.target.x - proj.x)
        const speed = Math.hypot(proj.vx, proj.vy) || 1
        const angle = Math.atan2(proj.vy, proj.vx)
        let diff = desired - angle
        while (diff > Math.PI) diff -= Math.PI * 2
        while (diff < -Math.PI) diff += Math.PI * 2
        const turn = clamp(diff, -proj.homing * dt, proj.homing * dt)
        proj.vx = Math.cos(angle + turn) * speed
        proj.vy = Math.sin(angle + turn) * speed
      }
      proj.trail.push({ x: proj.x, y: proj.y })
      if (proj.trail.length > 7) proj.trail.shift()
      proj.x += proj.vx * dt
      proj.y += proj.vy * dt
      if (proj.x < 0 || proj.y < 0 || proj.x > WORLD.width || proj.y > WORLD.height) { proj.dead = true; continue }

      if (proj.owner === 'enemy') {
        if (!p.state.dead && dist(proj.x, proj.y, p.x, p.y - 30) < proj.radius + p.radius + 10) {
          this.damagePlayer(proj.damage, proj)
          proj.dead = true
        }
      } else {
        for (const enemy of this.enemies) {
          if (enemy.dead || enemy.dying || proj.hitSet.has(enemy)) continue
          if (dist(proj.x, proj.y, enemy.x, enemy.y - 30) < proj.radius + enemy.radius) {
            proj.hitSet.add(enemy)
            this.hitEnemy(enemy, proj.damage, {
              sourceX: proj.x, sourceY: proj.y, crit: Math.random() < p.critChance,
              knockback: 110,
            })
            if (proj.pierce > 0) proj.pierce--
            else { proj.dead = true; break }
          }
        }
      }
    }
    this.projectiles = this.projectiles.filter((proj) => !proj.dead)
  }

  updateCompanion(dt) {
    const c = this.companion
    const p = this.player
    if (!c) return
    const data = CREATURES[c.id]
    if (!data) { this.companion = null; return }
    c.alpha = Math.min(1, c.alpha + dt * 3)
    c.cooldown -= dt
    if (c.attackAnim > 0) c.attackAnim -= dt
    const followX = p.x - (p.facing.x < 0 ? -36 : 36)
    const followY = p.y - 6
    const d = dist(c.x, c.y, followX, followY)
    if (d > 55) {
      const speed = Math.min(260, 130 + d * 1.2)
      c.x += (followX - c.x) / d * speed * dt
      c.y += (followY - c.y) / d * speed * dt
    }
    let target = null, best = Infinity
    for (const e of this.enemies) {
      if (e.dead || e.dying || e.captured) continue
      const ed = dist(c.x, c.y, e.x, e.y)
      if (ed < 380 && ed < best) { target = e; best = ed }
    }
    if (c.cooldown <= 0) {
      if (data.kind === 'heal') {
        if (p.hp < p.maxHp * .9) {
          p.hp = Math.min(p.maxHp, p.hp + data.heal)
          c.cooldown = data.cooldown
          c.attackAnim = .4
          this.addFloater(`+${data.heal}`, p.x, p.y - 76, '#9dffcf', 12)
          this.burst(p.x, p.y - 30, '#9dffcf', 12, { speed: 70, life: .6 })
          this.audio.play('heal')
        }
      } else if (target) {
        c.cooldown = data.cooldown
        c.attackAnim = .35
        if (data.kind === 'ranged') {
          const angle = Math.atan2(target.y - 30 - (c.y - 20), target.x - c.x)
          this.spawnProjectile({
            x: c.x, y: c.y - 20,
            vx: Math.cos(angle) * 390, vy: Math.sin(angle) * 390,
            radius: 6, damage: Math.round(data.attack * 1.9), owner: 'ally',
            color: data.color, kind: 'allyOrb', life: 1.8, homing: 1.4, target,
          })
          this.audio.play('magic')
        } else if (data.kind === 'dash') {
          const angle = Math.atan2(target.y - c.y, target.x - c.x)
          c.x += Math.cos(angle) * 45
          c.y += Math.sin(angle) * 45
          this.hitEnemy(target, Math.round(data.attack * 1.8), { sourceX: c.x, sourceY: c.y, knockback: 90 })
          this.burst(c.x, c.y - 15, data.color, 12, { speed: 95, life: .4 })
        } else if (data.kind === 'shield') {
          p.shieldT = 6
          this.addFloater('Escudo mineral', p.x, p.y - 80, '#ffe3a4', 11)
          this.burst(p.x, p.y - 35, data.color, 18, { speed: 75, life: .7 })
          this.audio.play('block')
        }
      }
    }
  }

  updateTelegraphs(dt) {
    for (const t of this.telegraphs) {
      t.life -= dt
      if (t.life <= 0 && !t.fired) {
        t.fired = true
        t.onEnd?.()
      }
    }
    this.telegraphs = this.telegraphs.filter((t) => t.life > 0)
  }

  addTelegraph(opts) {
    this.telegraphs.push({ ...opts, life: opts.life ?? .6, maxLife: opts.maxLife ?? opts.life ?? .6, fired: false })
  }

  burst(x, y, color, count = 10, opts = {}) {
    const quality = clamp(this.qualityFactor, .4, 1.4)
    const n = Math.max(2, Math.round(count * quality))
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2
      const speed = (opts.speed ?? 90) * rand(.35, 1)
      this.particles.push({
        x, y, vx: Math.cos(a) * speed, vy: Math.sin(a) * speed - (opts.lift ?? 20),
        life: (opts.life ?? .6) * rand(.65, 1.15), maxLife: opts.life ?? .6,
        size: rand(1.4, 3.8), color, gravity: opts.gravity ?? 90, drag: opts.drag ?? 1.4,
      })
    }
  }

  addFloater(text, x, y, color = '#fff', size = 12) {
    this.floaters.push({ text, x, y, color, size, life: .95, maxLife: .95, vy: -34 })
  }

  updateParticles(dt) {
    for (const p of this.particles) {
      p.life -= dt
      p.vy += p.gravity * dt
      p.vx *= Math.pow(.12, dt * p.drag)
      p.vy *= Math.pow(.35, dt * p.drag)
      p.x += p.vx * dt
      p.y += p.vy * dt
    }
    this.particles = this.particles.filter((p) => p.life > 0)
    for (const f of this.floaters) {
      f.life -= dt
      f.y += f.vy * dt
      f.vy *= Math.pow(.25, dt)
    }
    this.floaters = this.floaters.filter((f) => f.life > 0)
    for (const s of this.slashes) s.life -= dt
    this.slashes = this.slashes.filter((s) => s.life > 0)
  }

  /* ======================================================================
     HABILIDADES
     ====================================================================== */

  castSkill() {
    const p = this.player
    const st = p.state
    if (st.skillCd > 0 || st.dead || st.rolling) return
    const skill = p.skill
    const pool = skill.resource === 'mana' ? p.mp : p.stamina
    if (pool < skill.cost) {
      this.ui.toast(skill.resource === 'mana' ? 'No tienes maná suficiente.' : 'No tienes resistencia suficiente.', { icon: '!', type: 'bad', duration: 1600 })
      this.audio.play('ui')
      return
    }
    if (skill.resource === 'mana') p.mp -= skill.cost
    else { p.stamina -= skill.cost; p.staminaDelay = 1 }
    st.skillCd = skill.cooldown
    st.cast = .4
    const dirX = p.facing.x, dirY = p.facing.y
    const len = Math.hypot(dirX, dirY) || 1

    if (skill.id === 'corte_alba') {
      this.audio.play('heavySwing')
      this.slashes.push({ x: p.x, y: p.y - 28, angle: Math.atan2(dirY, dirX), range: skill.radius, arc: Math.PI * 1.5, life: .42, maxLife: .42, color: '#ffe493' })
      for (const e of this.enemies) {
        if (e.dead || e.dying || e.captured) continue
        if (dist(p.x, p.y, e.x, e.y) < skill.radius + e.radius) {
          this.hitEnemy(e, p.attackPower * skill.damage, { sourceX: p.x, sourceY: p.y, knockback: 280, stagger: true })
        }
      }
      this.burst(p.x, p.y - 30, '#ffe6a0', 26, { speed: 200, life: .65 })
      this.shake = 5
    } else if (skill.id === 'juicio_lunar') {
      this.audio.play('magic')
      const targets = this.enemies
        .filter((e) => !e.dead && !e.dying && !e.captured && dist(p.x, p.y, e.x, e.y) < skill.radius)
        .sort((a, b) => dist(p.x, p.y, a.x, a.y) - dist(p.x, p.y, b.x, b.y))
        .slice(0, 6)
      targets.forEach((e, i) => {
        this.addTelegraph({
          type: 'circle', x: e.x, y: e.y, radius: 52, life: .22 + i * .06, maxLife: .22 + i * .06,
          color: '#a8e6ff',
          onEnd: () => {
            if (!e.dead) this.hitEnemy(e, p.attackPower * skill.damage, { sourceX: e.x, sourceY: e.y - 60, knockback: 60, crit: false })
            this.burst(e.x, e.y, '#c8f3ff', 16, { speed: 150, life: .55, lift: 90 })
          },
        })
      })
      for (let i = 0; i < 18; i++) {
        const a = Math.random() * Math.PI * 2
        this.burst(p.x + Math.cos(a) * rand(20, 170), p.y + Math.sin(a) * rand(10, 90) - 40, '#b9ecff', 2, { speed: 60, life: .8, gravity: 0 })
      }
      this.shake = 4
    } else if (skill.id === 'impulso_lumen') {
      this.audio.play('dodge')
      this.audio.play('heavySwing')
      st.invuln = Math.max(st.invuln, .35)
      const hitSet = new Set()
      const stepX = dirX / len * 13, stepY = dirY / len * 13
      for (let i = 0; i < 19; i++) {
        this.moveEntity(p, stepX, stepY, p.radius)
        for (const e of this.enemies) {
          if (e.dead || e.dying || e.captured || hitSet.has(e)) continue
          if (dist(p.x, p.y, e.x, e.y) < 86 + e.radius) {
            hitSet.add(e)
            this.hitEnemy(e, p.attackPower * skill.damage, { sourceX: p.x, sourceY: p.y, knockback: 160 })
          }
        }
        if (i % 4 === 0) this.burst(p.x, p.y - 30, '#bff7ff', 4, { speed: 45, life: .35, gravity: 0 })
      }
      this.slashes.push({ x: p.x, y: p.y - 28, angle: Math.atan2(dirY, dirX), range: 110, arc: 2.2, life: .32, maxLife: .32, color: '#d7fbff' })
      this.shake = 4
    }
    this.ui.updateHUD(true)
  }

  /* ======================================================================
     INTERACCIÓN, MISIONES Y DIÁLOGOS
     ====================================================================== */

  updateInteraction() {
    if (!this.player) return
    const p = this.player
    let best = null, bestD = Infinity
    const consider = (type, target, label, radius, x, y) => {
      const d = dist(p.x, p.y, x, y)
      if (d < radius && d < bestD) {
        bestD = d
        best = { type, target, label, x, y }
      }
    }

    for (const npc of this.npcs) {
      if (npc.hidden) continue
      consider('npc', npc, `Hablar con ${npc.name}`, 84, npc.x, npc.y)
    }
    for (const chest of this.chests) {
      if (!chest.opened) consider('chest', chest, 'Abrir cofre', 72, chest.x, chest.y)
    }
    for (const flower of this.flowers) {
      if (!flower.collected) consider('flower', flower, 'Recoger flor de luna', 66, flower.x, flower.y)
    }
    if (!this.gateOpen) {
      consider('gate', this.worldData.gate, this.story.step >= 3 ? 'Abrir la Puerta de Aether' : 'Puerta de Aether sellada', 118, WORLD.gate.x, WORLD.gate.y)
    }
    for (const rune of this.runeShrines) {
      consider('rune', rune, rune.activated ? 'Meditar en la runa' : 'Activar la runa antigua', 82, rune.x, rune.y)
    }
    if (!this.bossActive && !this.bossDefeated) {
      consider('rest', null, 'Descansar en el santuario', 105, WORLD.shrine.x, WORLD.shrine.y + 10)
    }
    if (this.bossDefeated) {
      consider('pedestal', null, 'Contemplar la Espada Celestial', 100, WORLD.arena.x, WORLD.arena.y - 72)
    }
    this.activeInteract = best

    this.captureTarget = null
    let capD = 190
    for (const e of this.enemies) {
      if (e.dead || e.dying || e.captured || e.isBoss || !e.captureReady) continue
      if (!CREATURES[e.type.id]) continue
      const d = dist(p.x, p.y, e.x, e.y)
      if (d < capD) { capD = d; this.captureTarget = e }
    }
  }

  interact() {
    if (this.mode !== 'playing' || !this.player) return
    if (this.activeInteract) {
      const { type, target } = this.activeInteract
      if (type === 'npc') this.talkTo(target)
      else if (type === 'chest') this.openChest(target)
      else if (type === 'flower') this.collectFlower(target)
      else if (type === 'gate') this.tryGate()
      else if (type === 'rune') this.activateRune(target)
      else if (type === 'rest') this.restAtShrine()
      else if (type === 'pedestal') this.inspectPedestal()
      return
    }
    if (this.captureTarget) this.attemptCapture()
  }

  tryGate() {
    const runes = this.player.inventory.esquirla_runa || 0
    if (this.gateOpen) return
    if (this.story.step < 3 || runes < 3) {
      this.ui.showDialogue([
        { speaker: 'Narrador', role: 'LA PUERTA DE AETHER', portrait: 'narrator', text: `La barrera de la puerta zumba con una luz violeta. Tres esquirlas de runa encajarían en sus muescas. Tienes ${Math.min(runes, 3)} de 3.` },
        { speaker: 'Elara', role: 'MAESTRA DEL SANTUARIO', portrait: 'Elara', text: 'Los escarabajos pétreos del oeste y de las ruinas portan fragmentos de la puerta. Su caparazón recuerda el juramento de Aether.' },
      ])
      this.audio.play('ui')
      return
    }
    this.player.removeItem('esquirla_runa', 3)
    this.gateOpen = true
    this.story.step = 4
    this.story.flags.gateOpen = true
    this.player.checkpoint = { x: 2670, y: 1000 }
    this.audio.play('quest')
    this.audio.play('swordUnsheathe')
    this.burst(WORLD.gate.x, WORLD.gate.y - 40, '#9dffe4', 42, { speed: 200, life: 1.1 })
    this.ui.toast('La Puerta de Aether se abre. El santuario del Guardián te espera.', { icon: '✦', type: 'quest', duration: 4500 })
    this.ui.chapter('CAPÍTULO II', 'LA PUERTA DE AETHER', 4500)
    this.save(true)
  }

  openChest(chest) {
    if (chest.opened) return
    chest.opened = true
    this.openedChests.add(chest.id)
    const p = this.player
    this.audio.play('pickup')
    this.burst(chest.x, chest.y - 24, '#ffe09a', 24, { speed: 120, life: .8, gravity: 50 })
    if (chest.kind === 'weapon' && WEAPONS[chest.item]) {
      if (!p.weaponIds.includes(chest.item)) p.weaponIds.push(chest.item)
      p.equipWeapon(chest.item)
      this.updateAppearance()
      this.ui.toast(`Arma obtenida y equipada: ${WEAPONS[chest.item].name}`, { icon: '⚔', type: 'good', duration: 4000 })
    } else if (chest.kind === 'armor' && ARMORS[chest.item]) {
      if (!p.armorIds.includes(chest.item)) p.armorIds.push(chest.item)
      p.equipArmor(chest.item)
      this.ui.toast(`Armadura obtenida: ${ARMORS[chest.item].name}`, { icon: '◇', type: 'good', duration: 4000 })
    } else if (chest.kind === 'accessory' && ACCESSORIES[chest.item]) {
      if (!p.accessoryIds.includes(chest.item)) p.accessoryIds.push(chest.item)
      if (!p.equipment.accessory) p.equipAccessory(chest.item)
      this.ui.toast(`Accesorio obtenido: ${ACCESSORIES[chest.item].name}`, { icon: '✧', type: 'good', duration: 4000 })
    }
    this.ui.updateHUD(true)
    this.save(true)
  }

  collectFlower(flower) {
    if (flower.collected) return
    flower.collected = true
    this.collectedFlowers.add(flower.id)
    this.player.addItem('flor_luna')
    this.audio.play('pickup')
    this.burst(flower.x, flower.y - 25, '#e8e1ff', 18, { speed: 85, life: .75, gravity: 20 })
    this.ui.toast(`Flor de luna recogida (${Math.min(3, this.player.inventory.flor_luna || 0)} / 3)`, { icon: '✿', type: 'good' })
    this.maybeAdvanceQuests()
    this.save(true)
  }

  activateRune(rune) {
    const first = !rune.activated
    rune.activated = true
    this.activatedRunes.add(rune.id)
    this.player.hp = this.player.maxHp
    this.player.mp = this.player.maxMp
    this.player.stamina = this.player.maxStamina
    this.player.checkpoint = { x: rune.x, y: rune.y + 45 }
    this.audio.play('quest')
    this.burst(rune.x, rune.y - 34, '#8dffe3', 24, { speed: 100, life: .9 })
    this.ui.toast(first ? 'La runa antigua te reconoce. Vida y maná restaurados. Punto de control actualizado.' : 'La runa vuelve a cantar. Descansas bajo su luz.', { icon: 'ᛉ', type: 'good', duration: 4200 })
    this.save(true)
  }

  restAtShrine() {
    const p = this.player
    p.hp = p.maxHp
    p.mp = p.maxMp
    p.stamina = p.maxStamina
    p.checkpoint = { x: WORLD.shrine.x, y: WORLD.shrine.y + 118 }
    this.audio.play('heal')
    this.burst(p.x, p.y - 35, '#a8ffe9', 22, { speed: 80, life: .9, lift: 40 })
    this.ui.toast('El santuario restaura tu aliento. Punto de control guardado.', { icon: '✦', type: 'good' })
    this.save(true)
  }

  inspectPedestal() {
    this.ui.showDialogue([
      { speaker: 'Narrador', role: 'SANTUARIO CELESTIAL', portrait: 'narrator', text: 'El pedestal está vacío, pero la luz que lo atravesó durante mil años aún calienta el aire. La Espada Celestial reconoce a quien la liberó.' },
      { speaker: this.player.appearance.name, role: 'CAMINANTE DE LUMA', portrait: 'player', text: 'No sé qué haré con este poder. Pero el bosque ya no está solo.' },
    ])
  }

  attemptCapture() {
    const e = this.captureTarget
    const p = this.player
    if (!e) return
    if (p.creatures.includes(e.type.id)) {
      this.ui.toast(`${CREATURES[e.type.id].name} ya camina contigo.`, { icon: '❖', duration: 2200 })
      return
    }
    if ((p.inventory.sello_lumen || 0) <= 0) {
      this.ui.toast('Necesitas un Sello de Lumen para sellar a esta criatura.', { icon: '!', type: 'bad' })
      return
    }
    p.removeItem('sello_lumen')
    const chance = this.captureChance()
    this.audio.play('seal')
    if (Math.random() < chance) {
      p.creatures.push(e.type.id)
      p.collectedCreatures.add(e.type.id)
      if (!p.activeCreature) {
        p.activeCreature = e.type.id
        this.summonCompanion(true)
      }
      e.captured = true
      e.hp = 0
      e.dying = .55
      e.alpha = 1
      this.audio.play('quest')
      this.ui.toast(`${CREATURES[e.type.id].name} se ha vinculado a ti. Pulsa R para invocarla.`, { icon: '❖', type: 'good', duration: 4200 })
      this.burst(e.x, e.y - 35, CREATURES[e.type.id].color || '#b9fff0', 30, { speed: 140, life: 1 })
      this.save(true)
    } else {
      this.ui.toast('El sello se rompe. La criatura resiste; debilítala más.', { icon: '!', type: 'bad', duration: 2800 })
      this.burst(e.x, e.y - 30, '#b48aff', 12, { speed: 100, life: .6 })
      e.cooldown = Math.max(e.cooldown, .8)
    }
    this.captureTarget = null
    this.ui.updateHUD(true)
  }

  maybeAdvanceQuests() {
    const p = this.player
    if (!p) return
    const flowers = p.inventory.flor_luna || 0
    const runes = p.inventory.esquirla_runa || 0
    if (this.story.step === 1 && flowers >= 3) {
      this.story.step = 2
      this.grantLumen()
      this.ui.toast('Las flores de luna completan el ritual. Lumen se une a ti.', { icon: '✦', type: 'quest', duration: 5000 })
      this.ui.chapter('CAPÍTULO I', 'FLORES BAJO LA LUNA', 4200)
      this.audio.play('quest')
      this.save(true)
    }
    if (this.story.step === 2 && runes >= 3) {
      this.story.step = 3
      this.ui.toast('Las tres esquirlas vibran al unísono. La Puerta de Aether puede abrirse.', { icon: 'ᛉ', type: 'quest', duration: 4800 })
      this.audio.play('quest')
      this.save(true)
    }
  }

  grantLumen() {
    const p = this.player
    if (!p.creatures.includes('lumen')) p.creatures.push('lumen')
    p.collectedCreatures.add('lumen')
    if (!p.activeCreature) p.activeCreature = 'lumen'
    if (!p.skills.includes('juicio_lunar')) p.skills.push('juicio_lunar')
    this.summonCompanion(true)
    this.burst(p.x, p.y - 40, '#8ff5e5', 32, { speed: 150, life: 1 })
    this.ui.updateHUD(true)
  }

  showIntro() {
    if (this.mode !== 'playing' || this.story.step > 0) return
    this.ui.showDialogue([
      { speaker: 'Narrador', role: 'LUMA · HACE MIL AÑOS', portrait: 'narrator', text: 'Cuando la noche devoró el primer santuario, una hoja de luz cayó del cielo. Su filo separó la oscuridad del alba y dio nombre a Luma.' },
      { speaker: 'Narrador', role: 'ALDEA DE LUMA · CREPÚSCULO', portrait: 'narrator', text: 'Ahora el Bosque de Lirios vuelve a susurrar. Las flores se marchitan y las bestias han perdido el miedo. Elara te espera en el santuario.' },
      { speaker: this.player.appearance.name, role: 'CAMINANTE DE LUMA', portrait: 'player', text: 'Si la Espada Celestial aún existe, la encontraré. Pero primero debo escuchar al bosque.' },
    ])
  }

  talkTo(npc) {
    this.audio.play('interact')
    if (npc.id === 'elara') {
      const step = this.story.step
      const entries = []
      if (step === 0) {
        entries.push(
          { speaker: 'Elara', role: 'MAESTRA DEL SANTUARIO', portrait: 'Elara', text: `${this.player.appearance.name}, llegas justo cuando la luna se despierta. El Bosque de Lirios está enfermo: sus flores ya no cantan y las bestias atacan sin hambre.` },
          { speaker: 'Elara', role: 'MAESTRA DEL SANTUARIO', portrait: 'Elara', text: 'Necesito tres flores de luna. Crecen donde la luz del crepúsculo toca la hierba. Tráelas y podremos abrir el camino hacia Aether.' },
          { speaker: this.player.appearance.name, role: 'CAMINANTE DE LUMA', portrait: 'player', text: 'Tráeme las flores. Y si las bestias se interponen... les recordaré quién protege este bosque.' },
        )
      } else if (step === 1) {
        entries.push(
          { speaker: 'Elara', role: 'MAESTRA DEL SANTUARIO', portrait: 'Elara', text: `Has encontrado ${Math.min(3, this.player.inventory.flor_luna || 0)} de 3 flores. El Bosque de Lirios guarda algunas en sus claros del oeste y del sur.` },
          { speaker: 'Elara', role: 'MAESTRA DEL SANTUARIO', portrait: 'Elara', text: 'No temas a las gelatinas ni a los lobos de ceniza. Su furia es herida, no maldad.' },
        )
      } else if (step === 2) {
        entries.push(
          { speaker: 'Elara', role: 'MAESTRA DEL SANTUARIO', portrait: 'Elara', text: 'Las flores han despertado a Lumen, el zorro de luz. Las esquirlas de runa que buscas están en los escarabajos pétreos.' },
          { speaker: 'Elara', role: 'MAESTRA DEL SANTUARIO', portrait: 'Elara', text: 'Hay escarabajos al oeste de la Puerta de Aether, en el bosque. No necesitas cruzar la barrera para conseguir las tres esquirlas.' },
          { speaker: 'Elara', role: 'MAESTRA DEL SANTUARIO', portrait: 'Elara', text: 'Cuando las tengas, pulsa E junto a la puerta. El camino al Guardián se abrirá.' },
        )
      } else if (step === 3) {
        entries.push(
          { speaker: 'Elara', role: 'MAESTRA DEL SANTUARIO', portrait: 'Elara', text: `Las esquirlas cantan en tu bolsa (${Math.min(3, this.player.inventory.esquirla_runa || 0)} de 3). Ve a la Puerta de Aether, al este de la aldea.` },
          { speaker: 'Elara', role: 'MAESTRA DEL SANTUARIO', portrait: 'Elara', text: 'Detrás aguarda el Guardián corrompido. La Espada Celestial lo sostuvo durante mil años; ahora la oscuridad la usa como anzuelo.' },
        )
      } else if (step === 4) {
        entries.push(
          { speaker: 'Elara', role: 'MAESTRA DEL SANTUARIO', portrait: 'Elara', text: 'La Puerta de Aether está abierta. Siento al Guardián moverse en el santuario. No vayas solo: Lumen y las criaturas que selles lucharán contigo.' },
          { speaker: 'Elara', role: 'MAESTRA DEL SANTUARIO', portrait: 'Elara', text: 'Recuerda bloquear con K y esquivar sin miedo. La oscuridad castiga la prisa, no la valentía.' },
        )
      } else {
        entries.push(
          { speaker: 'Elara', role: 'MAESTRA DEL SANTUARIO', portrait: 'Elara', text: 'La Espada Celestial vuelve a brillar. Luma respira, y el bosque ya no susurra con miedo.' },
          { speaker: 'Elara', role: 'MAESTRA DEL SANTUARIO', portrait: 'Elara', text: 'Aún quedan ruinas que escuchar y criaturas que conocer. Tu leyenda no termina aquí, caminante.' },
        )
      }
      this.ui.showDialogue(entries, () => {
        if (this.story.step === 0) {
          this.story.step = 1
          this.story.flags.talkedElara = true
          this.audio.play('quest')
          this.ui.toast('Nueva misión: Flores bajo la luna', { icon: '▤', type: 'quest', duration: 4000 })
          this.ui.chapter('CAPÍTULO I', 'FLORES BAJO LA LUNA', 3800)
          this.maybeAdvanceQuests()
          this.save(true)
        }
      })
    } else if (npc.id === 'rurik') {
      this.openSmith(npc)
    } else if (npc.id === 'mirea') {
      this.openMerchant(npc)
    } else {
      this.ui.showDialogue([
        { speaker: npc.name, role: npc.title.toUpperCase(), portrait: npc.role, text: 'La luna está inquieta esta noche. Si vas al bosque, lleva pociones y no dejes que las flores te vean dudar.' },
        { speaker: npc.name, role: npc.title.toUpperCase(), portrait: npc.role, text: 'Elara dice que la Espada Celestial aún duerme en el santuario. Yo digo que las espadas no duermen: esperan.' },
      ])
    }
  }

  openSmith(npc) {
    const p = this.player
    const canBuy = (item) => p.gold >= item.price
    this.ui.showDialogue([
      {
        speaker: 'Rurik', role: 'HERRERO DE LUMA', portrait: 'Rurik',
        text: `El acero recuerda cada golpe, ${p.appearance.name}. Tengo piezas que harían cantar hasta a un escarabajo. ¿Qué necesitas?`,
        choices: [
          {
            label: `Comprar Mandoble Lunar · 180 ◈`, after: false,
            action: () => {
              if (p.weaponIds.includes('mandoble_luna')) return this.ui.toast('Ya forjaste ese mandoble.', { icon: '⚔' })
              if (!canBuy({ price: 180 })) return this.ui.toast('No tienes oro suficiente.', { icon: '!', type: 'bad' })
              p.gold -= 180; p.weaponIds.push('mandoble_luna'); this.audio.play('coin')
              this.ui.toast('Mandoble Lunar añadido a tu equipo.', { icon: '⚔', type: 'good' })
            },
          },
          {
            label: `Comprar Placas del guardián · 150 ◈`, after: false,
            action: () => {
              if (p.armorIds.includes('placas_guardian')) return this.ui.toast('Ya tienes esas placas.', { icon: '◇' })
              if (!canBuy({ price: 150 })) return this.ui.toast('No tienes oro suficiente.', { icon: '!', type: 'bad' })
              p.gold -= 150; p.armorIds.push('placas_guardian'); this.audio.play('coin')
              this.ui.toast('Placas del guardián añadidas al equipo.', { icon: '◇', type: 'good' })
            },
          },
          {
            label: `Reparar equipo y descansar · 25 ◈`, after: false,
            action: () => {
              if (p.gold < 25) return this.ui.toast('No tienes oro suficiente.', { icon: '!', type: 'bad' })
              p.gold -= 25; p.hp = p.maxHp; p.mp = p.maxMp; p.stamina = p.maxStamina
              this.audio.play('heal'); this.ui.toast('Rurik repara tus armas y te devuelve el aliento.', { icon: '✦', type: 'good' })
            },
          },
          { label: 'Despedirse', after: false, action: () => this.ui.finishDialogue() },
        ],
      },
    ])
  }

  openMerchant(npc) {
    const p = this.player
    this.ui.showDialogue([
      {
        speaker: 'Mirea', role: 'MERCADER DE RELIQUIAS', portrait: 'Mirea',
        text: 'Reliquias, pociones y sellos de Lumen. El bosque cobra caro a quienes olvidan prepararse, querido caminante.',
        choices: [
          {
            label: 'Poción de vida · 24 ◈', after: false,
            action: () => this.buyItem('pocion_vida', 24),
          },
          {
            label: 'Poción de maná · 30 ◈', after: false,
            action: () => this.buyItem('pocion_mana', 30),
          },
          {
            label: 'Sello de Lumen · 45 ◈', after: false,
            action: () => this.buyItem('sello_lumen', 45),
          },
          {
            label: 'Elixir de Luma · 90 ◈', after: false,
            action: () => this.buyItem('elixir_luma', 90),
          },
          { label: 'Despedirse', after: false, action: () => this.ui.finishDialogue() },
        ],
      },
    ])
  }

  buyItem(id, price) {
    const p = this.player
    if (p.gold < price) {
      this.ui.toast('No tienes oro suficiente.', { icon: '!', type: 'bad' })
      return
    }
    p.gold -= price
    p.addItem(id)
    this.audio.play('coin')
    this.ui.toast(`Compraste ${ITEMS[id]?.name || 'un objeto'}.`, { icon: '◈', type: 'good' })
    this.ui.updateHUD(true)
  }

  /* ======================================================================
     ZONAS, CÁMARA Y FINAL
     ====================================================================== */

  updateZoneAndAudio() {
    const p = this.player
    if (!p) return
    const zone = this.currentZone()
    if (!this.lastZone || this.lastZone.id !== zone.id) {
      this.lastZone = zone
      this.zoneBanner = 1
      if (this.mode === 'playing') this.ui.region(zone.name, zone.subtitle)
    }

    if (zone.id === 'arena' && this.story.step >= 4 && !this.bossDefeated && !this.bossActive) {
      if (dist(p.x, p.y, WORLD.arena.x, WORLD.arena.y) < 365) this.startBoss()
    }

    if (this.bossActive && this.boss && !this.boss.dead) {
      this.audio.setMode('boss')
      this.audio.setCombat(1)
      return
    }

    let nearest = Infinity
    for (const e of this.enemies) {
      if (e.dead || e.dying || e.captured) continue
      const d = dist(p.x, p.y, e.x, e.y)
      if (d < nearest) nearest = d
    }
    if (nearest < 390) {
      this.audio.setMode('combat')
      this.audio.setCombat(clamp(1 - nearest / 430, .25, 1))
    } else {
      this.audio.setCombat(0)
      const mode = ZONE_AUDIO[zone.id] || 'forest'
      this.audio.setMode(mode === 'boss' ? 'ruins' : mode)
    }
  }

  updateCamera(dt) {
    const p = this.player
    if (!p) return
    const zoomTarget = clamp(Math.min(this.cssWidth / 1180, this.cssHeight / 650), .6, 1.22) * (this.bossActive ? .95 : 1)
    this.camera.zoom = lerp(this.camera.zoom, zoomTarget, 1 - Math.pow(.001, dt))
    const lookX = p.facing.x * 26 + this.input.move.x * 20
    const lookY = p.facing.y * 22 + this.input.move.y * 14
    this.camLook.x = lerp(this.camLook.x, lookX, 1 - Math.pow(.01, dt))
    this.camLook.y = lerp(this.camLook.y, lookY, 1 - Math.pow(.01, dt))
    const zoom = this.camera.zoom
    const halfW = this.cssWidth / (2 * zoom)
    const halfH = this.cssHeight / (2 * zoom)
    let tx = p.x + this.camLook.x
    let ty = p.y + this.camLook.y
    tx = clamp(tx, halfW, Math.max(halfW, WORLD.width - halfW))
    ty = clamp(ty, halfH, Math.max(halfH, WORLD.height - halfH))
    this.camera.x = lerp(this.camera.x, tx, 1 - Math.pow(.0001, dt))
    this.camera.y = lerp(this.camera.y, ty, 1 - Math.pow(.0001, dt))
  }

  finishEnding() {
    if (this.endingShown) return
    this.endingShown = true
    this.mode = 'ending'
    this.input.clear()
    const p = this.player
    this.ui.showHUD(false)
    this.ui.refreshTouchVisibility()
    this.ui.showEnding([
      { value: String(p.level), label: 'NIVEL' },
      { value: `${p.kills}`, label: 'CRIATURAS' },
      { value: `${Math.max(1, Math.floor(this.time / 60))} min`, label: 'TIEMPO' },
      { value: `${fmt(p.gold)}`, label: 'ORO' },
    ])
    this.save(true)
  }

  /* ======================================================================
     RENDER
     ====================================================================== */

  render() {
    const c = this.ctx
    const vw = this.cssWidth
    const vh = this.cssHeight
    if (!c) return
    c.setTransform(this.dpr, 0, 0, this.dpr, 0, 0)
    c.clearRect(0, 0, vw, vh)
    c.fillStyle = '#060c16'
    c.fillRect(0, 0, vw, vh)

    if (this.mode === 'title' || !this.player || !this.worldSurface) {
      drawTitleBackdrop(c, vw, vh, this.time)
      return
    }
    this.renderWorld(c, vw, vh)
  }

  renderWorld(c, vw, vh) {
    const cam = this.camera
    const zoom = cam.zoom || 1
    const shake = this.shake
    const sx = shake ? rand(-shake, shake) : 0
    const sy = shake ? rand(-shake, shake) : 0
    const left = cam.x - vw / (2 * zoom)
    const top = cam.y - vh / (2 * zoom)
    const right = left + vw / zoom
    const bottom = top + vh / zoom

    c.save()
    c.translate(vw / 2 + sx, vh / 2 + sy)
    c.scale(zoom, zoom)
    c.translate(-cam.x, -cam.y)

    // Suelo pre-renderizado.
    const bx = clamp(left - 90, 0, WORLD.width)
    const by = clamp(top - 120, 0, WORLD.height)
    const bw = clamp(right - left + 180, 1, WORLD.width - bx)
    const bh = clamp(bottom - top + 240, 1, WORLD.height - by)
    c.drawImage(this.worldSurface, bx, by, bw, bh, bx, by, bw, bh)

    this.drawTelegraphs(c)

    // Culling y orden por profundidad. La y de los objetos es su punto de apoyo.
    const items = []
    for (const prop of this.props) {
      if (prop.x < left - 150 || prop.x > right + 150 || prop.y < top - 300 || prop.y > bottom + 130) continue
      items.push({ y: prop.y, kind: 'prop', ref: prop })
    }
    for (const chest of this.chests) {
      if (chest.x < left - 80 || chest.x > right + 80 || chest.y < top - 100 || chest.y > bottom + 80) continue
      items.push({ y: chest.y, kind: 'chest', ref: chest })
    }
    for (const flower of this.flowers) {
      if (flower.collected) continue
      if (flower.x < left - 60 || flower.x > right + 60 || flower.y < top - 80 || flower.y > bottom + 60) continue
      items.push({ y: flower.y, kind: 'flower', ref: flower })
    }
    for (const rune of this.runeShrines) {
      if (rune.x < left - 80 || rune.x > right + 80 || rune.y < top - 100 || rune.y > bottom + 80) continue
      items.push({ y: rune.y, kind: 'rune', ref: rune })
    }
    for (const npc of this.npcs) {
      if (npc.hidden) continue
      if (npc.x < left - 90 || npc.x > right + 90 || npc.y < top - 140 || npc.y > bottom + 80) continue
      items.push({ y: npc.y, kind: 'npc', ref: npc })
    }
    for (const enemy of this.enemies) {
      if (enemy.dead) continue
      if (enemy.x < left - 140 || enemy.x > right + 140 || enemy.y < top - 220 || enemy.y > bottom + 120) continue
      items.push({ y: enemy.y, kind: 'enemy', ref: enemy })
    }
    if (this.companion) {
      items.push({ y: this.companion.y + 2, kind: 'companion', ref: this.companion })
    }
    if (this.player) items.push({ y: this.player.y + 3, kind: 'player', ref: this.player })
    items.sort((a, b) => a.y - b.y)

    for (const item of items) {
      if (item.kind === 'prop') {
        drawProp(c, item.ref, this.time, { gateOpen: this.gateOpen, bossDefeated: this.bossDefeated })
      } else if (item.kind === 'chest') {
        drawInteractive(c, 'chest', item.ref, this.time, { opened: item.ref.opened })
      } else if (item.kind === 'flower') {
        drawInteractive(c, 'flower', item.ref, this.time, { collected: false })
      } else if (item.kind === 'rune') {
        drawInteractive(c, 'rune', item.ref, this.time, { activated: item.ref.activated })
      } else if (item.kind === 'npc') {
        drawNPC(c, item.ref, this.time)
        if (item.ref.id === 'elara' && this.story.step === 0) this.drawNpcMark(c, item.ref)
      } else if (item.kind === 'enemy') {
        this.drawEnemy(c, item.ref)
      } else if (item.kind === 'companion') {
        const data = CREATURES[item.ref.id]
        if (data) {
          c.save()
          c.globalAlpha = item.ref.alpha
          drawCompanion(c, data, item.ref, this.time)
          c.restore()
        }
      } else if (item.kind === 'player') {
        this.drawPlayer(c, item.ref)
      }
    }

    this.drawProjectiles(c)
    this.drawEnemyBars(c)
    this.drawSlashes(c)
    this.drawParticles(c)
    this.drawFloaters(c)
    this.drawQuestMarker(c)
    this.drawInteractRing(c)
    c.restore()

    this.drawScreenOverlay(c, vw, vh)
  }

  drawPlayer(c, p) {
    c.save()
    if (p.state.dead) {
      c.globalAlpha = .55
      c.translate(p.x, p.y - 10)
      c.rotate(1.15)
      c.translate(-p.x, -p.y + 10)
    }
    if ((p.shieldT || 0) > 0) {
      c.save()
      c.strokeStyle = 'rgba(236,206,126,.55)'
      c.lineWidth = 1.6
      c.setLineDash([5, 5])
      c.beginPath(); c.ellipse(p.x, p.y - 34, 32, 44, 0, 0, Math.PI * 2); c.stroke()
      c.setLineDash([])
      c.restore()
    }
    drawHero(c, {
      x: p.x, y: p.y, appearance: p.appearance, weapon: p.weapon,
      time: this.time, walk: p.walk, moving: p.moving, facing: p.facing,
      state: p.state, scale: 1.04, level: p.level,
    })
    c.restore()
  }

  drawEnemy(c, e) {
    c.save()
    if (e.dying > 0) c.globalAlpha = Math.max(0, e.alpha)
    drawEnemy(c, e, this.time)
    c.restore()
    if (e.captureReady && !e.dead && !e.dying && !e.captured) {
      const pulse = .6 + Math.sin(this.time * 5) * .25
      c.save()
      c.strokeStyle = `rgba(199,160,255,${pulse})`
      c.lineWidth = 1.4
      c.setLineDash([4, 5])
      c.beginPath(); c.ellipse(e.x, e.y + 2, e.radius + 11, (e.radius + 11) * .32, 0, 0, Math.PI * 2); c.stroke()
      c.setLineDash([])
      c.fillStyle = `rgba(220,190,255,${pulse})`
      c.font = '11px Cinzel, serif'
      c.textAlign = 'center'
      c.fillText('❖', e.x, e.y - e.radius - 30)
      c.restore()
    }
  }

  drawNpcMark(c, npc) {
    const bob = Math.sin(this.time * 3) * 5
    const y = npc.y - 110 + bob
    c.save()
    c.globalCompositeOperation = 'lighter'
    c.fillStyle = 'rgba(255,224,133,.18)'
    c.beginPath(); c.arc(npc.x, y, 22, 0, Math.PI * 2); c.fill()
    c.globalCompositeOperation = 'source-over'
    c.fillStyle = '#ffe39a'
    c.font = '16px Cinzel, serif'
    c.textAlign = 'center'
    c.fillText('!', npc.x, y + 5)
    c.restore()
  }

  drawTelegraphs(c) {
    for (const t of this.telegraphs) {
      const total = t.maxLife || t.life || .6
      const elapsed = clamp(1 - t.life / total, 0, 1)
      c.save()
      c.globalCompositeOperation = 'lighter'
      c.globalAlpha = .08 + elapsed * .24
      c.fillStyle = t.color || '#ff6a91'
      if (t.type === 'circle') {
        c.beginPath()
        c.arc(t.x, t.y, Math.max(2, t.radius * (.25 + elapsed * .75)), 0, Math.PI * 2)
        c.fill()
        c.globalAlpha = .38
        c.strokeStyle = t.color || '#ff6a91'
        c.lineWidth = 1.6
        c.beginPath(); c.arc(t.x, t.y, t.radius, 0, Math.PI * 2); c.stroke()
      } else if (t.type === 'line') {
        c.translate(t.x, t.y)
        c.rotate(t.angle || 0)
        c.fillRect(0, -(t.width || 24) / 2, (t.length || 200) * (.25 + elapsed * .75), t.width || 24)
        c.globalAlpha = .4
        c.strokeStyle = t.color || '#ff6a91'
        c.lineWidth = 1.4
        c.strokeRect(0, -(t.width || 24) / 2, t.length || 200, t.width || 24)
      }
      c.restore()
    }
  }

  drawProjectiles(c) {
    for (const p of this.projectiles) {
      c.save()
      c.globalCompositeOperation = 'lighter'
      if (p.trail.length > 1) {
        c.strokeStyle = p.color
        c.globalAlpha = .35
        c.lineWidth = Math.max(1.5, p.radius * .8)
        c.beginPath()
        c.moveTo(p.trail[0].x, p.trail[0].y)
        for (let i = 1; i < p.trail.length; i++) c.lineTo(p.trail[i].x, p.trail[i].y)
        c.lineTo(p.x, p.y)
        c.stroke()
      }
      c.globalAlpha = .55
      c.fillStyle = p.color
      c.beginPath(); c.arc(p.x, p.y, p.radius * 2.4, 0, Math.PI * 2); c.fill()
      c.globalAlpha = 1
      c.fillStyle = '#fffdf0'
      c.beginPath(); c.arc(p.x, p.y, Math.max(2, p.radius * .7), 0, Math.PI * 2); c.fill()
      c.restore()
    }
  }

  drawEnemyBars(c) {
    for (const e of this.enemies) {
      if (e.dead || e.dying || e.captured || e.isBoss) continue
      if (e.hp >= e.maxHp) continue
      const w = e.kind === 'wolf' ? 40 : e.kind === 'beetle' ? 46 : 34
      const y = e.y - e.radius - 58
      c.save()
      c.fillStyle = 'rgba(4,8,14,.72)'
      c.fillRect(e.x - w / 2 - 1, y - 1, w + 2, 5)
      c.fillStyle = e.type.color
      c.fillRect(e.x - w / 2, y, w * clamp(e.hp / e.maxHp, 0, 1), 3)
      c.restore()
    }
  }

  drawSlashes(c) {
    for (const s of this.slashes) {
      const prog = 1 - s.life / s.maxLife
      const alpha = Math.sin(prog * Math.PI) * .8
      c.save()
      c.globalCompositeOperation = 'lighter'
      c.globalAlpha = alpha
      c.strokeStyle = s.color
      c.lineWidth = 4 + prog * 2
      c.beginPath()
      c.arc(s.x, s.y, s.range * (.55 + prog * .4), s.angle - s.arc / 2, s.angle - s.arc / 2 + s.arc * Math.min(1, prog * 2.2))
      c.stroke()
      c.restore()
    }
  }

  drawParticles(c) {
    c.save()
    c.globalCompositeOperation = 'lighter'
    for (const p of this.particles) {
      const alpha = clamp(p.life / Math.max(.001, p.maxLife), 0, 1)
      c.globalAlpha = alpha * .9
      c.fillStyle = p.color
      c.beginPath(); c.arc(p.x, p.y, p.size * (.45 + alpha * .65), 0, Math.PI * 2); c.fill()
    }
    c.restore()
  }

  drawFloaters(c) {
    c.save()
    c.textAlign = 'center'
    c.textBaseline = 'middle'
    for (const f of this.floaters) {
      const alpha = clamp(f.life / f.maxLife, 0, 1)
      c.globalAlpha = alpha
      c.font = `700 ${f.size}px Manrope, sans-serif`
      c.lineWidth = 3
      c.strokeStyle = 'rgba(3,7,14,.72)'
      c.strokeText(f.text, f.x, f.y)
      c.fillStyle = f.color
      c.fillText(f.text, f.x, f.y)
    }
    c.restore()
  }

  drawQuestMarker(c) {
    if (!this.player || this.mode === 'title') return
    const marker = this.questMarker()
    if (!marker) return
    const bob = Math.sin(this.time * 2.6) * 5
    const y = marker.y - 38 + bob
    c.save()
    c.globalCompositeOperation = 'lighter'
    c.fillStyle = 'rgba(255,220,126,.15)'
    c.beginPath(); c.arc(marker.x, y, 20, 0, Math.PI * 2); c.fill()
    c.globalCompositeOperation = 'source-over'
    c.save()
    c.translate(marker.x, y)
    c.rotate(Math.PI / 4)
    c.fillStyle = '#ffe59a'
    c.strokeStyle = 'rgba(88,62,15,.85)'
    c.lineWidth = 1
    c.fillRect(-5, -5, 10, 10)
    c.strokeRect(-5, -5, 10, 10)
    c.restore()
    c.strokeStyle = 'rgba(255,224,140,.55)'
    c.lineWidth = 1
    c.beginPath(); c.moveTo(marker.x, y + 8); c.lineTo(marker.x, marker.y + 6); c.stroke()
    c.restore()
  }

  drawInteractRing(c) {
    if (this.activeInteract) {
      const t = this.activeInteract
      const pulse = .65 + Math.sin(this.time * 3.2) * .2
      c.save()
      c.strokeStyle = `rgba(255,224,142,${pulse})`
      c.lineWidth = 1.4
      c.setLineDash([4, 4])
      c.beginPath(); c.ellipse(t.x, t.y + 2, 25 + pulse * 4, 8 + pulse, 0, 0, Math.PI * 2); c.stroke()
      c.restore()
    }
    if (this.captureTarget && !this.activeInteract) {
      const e = this.captureTarget
      const pulse = .55 + Math.sin(this.time * 4) * .2
      c.save()
      c.strokeStyle = `rgba(192,146,255,${pulse})`
      c.lineWidth = 1.4
      c.setLineDash([3, 5])
      c.beginPath(); c.ellipse(e.x, e.y + 2, e.radius + 16, (e.radius + 16) * .33, 0, 0, Math.PI * 2); c.stroke()
      c.restore()
    }
  }

  drawScreenOverlay(c, vw, vh) {
    // Motas ambientales (polen, brasas, luciérnagas).
    const zone = this.currentZone()
    const motes = zone.id === 'ruins' || zone.id === 'arena' ? 18 : zone.id === 'village' ? 10 : 26
    c.save()
    c.globalCompositeOperation = 'lighter'
    for (let i = 0; i < motes * clamp(this.qualityFactor, .5, 1.2); i++) {
      const x = (i * 137.3 + this.time * (5 + i % 5) + Math.sin(this.time + i) * 18) % vw
      const y = (i * 83.7 + Math.sin(this.time * .7 + i * 1.7) * 24) % vh
      const a = .18 + Math.sin(this.time * 1.4 + i) * .12
      c.globalAlpha = Math.max(.03, a)
      c.fillStyle = i % 4 === 0 ? '#ffe5a3' : '#a8ffea'
      c.beginPath(); c.arc(x, y, 1.1 + (i % 3) * .5, 0, Math.PI * 2); c.fill()
    }
    c.restore()

    // Luz cálida alrededor del héroe.
    if (this.player) {
      const zoom = this.camera.zoom || 1
      const px = (this.player.x - this.camera.x) * zoom + vw / 2
      const py = (this.player.y - this.camera.y) * zoom + vh / 2 - 32 * zoom
      const light = c.createRadialGradient(px, py, 20, px, py, Math.max(180, vw * .3))
      light.addColorStop(0, 'rgba(255,226,158,.045)')
      light.addColorStop(.55, 'rgba(138,206,255,.018)')
      light.addColorStop(1, 'rgba(0,0,0,0)')
      c.fillStyle = light
      c.fillRect(0, 0, vw, vh)
    }

    const vignette = c.createRadialGradient(vw / 2, vh / 2, Math.min(vw, vh) * .28, vw / 2, vh / 2, Math.max(vw, vh) * .74)
    vignette.addColorStop(0, 'rgba(0,0,0,0)')
    vignette.addColorStop(.72, 'rgba(2,5,11,.12)')
    vignette.addColorStop(1, 'rgba(1,3,8,.58)')
    c.fillStyle = vignette
    c.fillRect(0, 0, vw, vh)

    if (this.damageFlash > 0) {
      const damage = c.createRadialGradient(vw / 2, vh / 2, Math.min(vw, vh) * .2, vw / 2, vh / 2, Math.max(vw, vh) * .7)
      damage.addColorStop(0, 'rgba(255,20,50,0)')
      damage.addColorStop(1, `rgba(176,20,50,${this.damageFlash * .7})`)
      c.fillStyle = damage
      c.fillRect(0, 0, vw, vh)
    }
  }

}
