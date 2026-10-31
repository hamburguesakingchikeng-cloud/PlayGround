// La Espada Celestial — game loop, exploration, turn-based combat and UI wiring.

import {
  TILE, MAP_W, MAP_H, TT, SOLID, WALK_TIME,
  buildWorld, tileAt, zoneAt, xpToNext, SKILLS, ITEMS, ENEMIES, DIALOGUE,
} from './data.js'
import { Renderer } from './renderer.js'

const $ = (selector, root = document) => root.querySelector(selector)
const SAVE_KEY = 'la-espada-celestial.v1'
const clamp = (value, min, max) => Math.max(min, Math.min(max, value))
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const DIRS = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
}

const KEY_DIRS = {
  ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right',
  w: 'up', a: 'left', s: 'down', d: 'right',
  W: 'up', A: 'left', S: 'down', D: 'right',
}

const QUEST_TEXT = {
  0: 'Habla con la Anciana Mei en la plaza',
  1: 'Llega al Templo del Filo, al norte del bosque',
  2: 'Vuelve con la Anciana Mei',
  3: 'El filo descansa. Explora Lianhua',
}

class Sound {
  constructor() {
    this.ctx = null
    this.enabled = true
  }

  ensure() {
    if (!this.enabled) return null
    try {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext
        if (!AudioCtx) return null
        this.ctx = new AudioCtx()
      }
      if (this.ctx.state === 'suspended') this.ctx.resume()
      return this.ctx
    } catch {
      return null
    }
  }

  tone(freq, dur, type = 'sine', gain = 0.04, slide = 0) {
    const ctx = this.ensure()
    if (!ctx) return
    try {
      const now = ctx.currentTime
      const osc = ctx.createOscillator()
      const vol = ctx.createGain()
      osc.type = type
      osc.frequency.setValueAtTime(freq, now)
      if (slide) osc.frequency.exponentialRampToValueAtTime(Math.max(40, freq + slide), now + dur)
      vol.gain.setValueAtTime(gain, now)
      vol.gain.exponentialRampToValueAtTime(0.0001, now + dur)
      osc.connect(vol).connect(ctx.destination)
      osc.start(now)
      osc.stop(now + dur + 0.02)
    } catch {
      /* audio is a nicety, never a failure */
    }
  }

  play(kind) {
    if (!this.enabled) return
    switch (kind) {
      case 'select': this.tone(520, 0.07, 'triangle', 0.025); break
      case 'hit': this.tone(150, 0.15, 'square', 0.04, -70); break
      case 'crit': this.tone(240, 0.22, 'sawtooth', 0.045, -140); break
      case 'heal': this.tone(620, 0.24, 'sine', 0.035, 140); break
      case 'encounter': this.tone(110, 0.5, 'sine', 0.05, 30); break
      case 'level': this.tone(440, 0.2, 'triangle', 0.04, 240); break
      default: break
    }
  }
}

function pickWeighted(moves) {
  const total = moves.reduce((sum, move) => sum + (move.weight || 1), 0)
  let roll = Math.random() * total
  for (const move of moves) {
    roll -= move.weight || 1
    if (roll <= 0) return move
  }
  return moves[moves.length - 1]
}

class Game {
  constructor() {
    this.canvas = $('#game')
    this.world = buildWorld()
    this.renderer = new Renderer(this.canvas, this.world)
    this.sound = new Sound()

    this.ui = {
      hud: $('#hud'),
      hpFill: $('#hp-fill'),
      hpText: $('#hp-text'),
      qiFill: $('#qi-fill'),
      qiText: $('#qi-text'),
      level: $('#hud-level'),
      name: $('#hud-name'),
      quest: $('#quest-text'),
      hint: $('#hint'),
      touch: $('#touch'),
      banner: $('#zone-banner'),
      toast: $('#toast'),
      dialogue: $('#dialogue'),
      dlgSpeaker: $('#dlg-speaker'),
      dlgText: $('#dlg-text'),
      dlgNext: $('#dlg-next'),
      combat: $('#combat'),
      enemyName: $('#enemy-name'),
      enemyTag: $('#enemy-tag'),
      enemyFill: $('#enemy-fill'),
      enemyHint: $('#enemy-hint'),
      combatLog: $('#combat-log'),
      combatActions: $('#combat-actions'),
      menu: $('#screen-menu'),
      menuStats: $('#menu-stats'),
      menuItems: $('#menu-items'),
      menuQuest: $('#menu-quest'),
      menuSound: $('#menu-sound'),
      title: $('#screen-title'),
      continueBtn: $('#btn-continue'),
      ending: $('#screen-ending'),
      endingStats: $('#ending-stats'),
      gameover: $('#screen-gameover'),
      help: $('#screen-help'),
    }

    this.mode = 'title'
    this.time = 0
    this.playTime = 0
    this.last = performance.now()
    this.ready = false
    this.keys = new Set()
    this.touchDir = null
    this.zone = ''
    this.cam = { x: 0, y: 0 }
    this.combat = null
    this.dialogue = null
    this.actionButtons = []
    this.toastQueue = []
    this.toastActive = false
    this.bannerTimer = 0

    this.player = this.createPlayer()
    this.bindUi()
    this.bindInput()
    this.resize()
    this.snapCamera()
    this.refreshTitle()

    window.addEventListener('resize', () => this.resize())
    window.__espada = this
    requestAnimationFrame(this.frame)
  }

  createPlayer() {
    const spawn = this.world.spawn
    return {
      x: spawn.x, y: spawn.y,
      px: spawn.x * TILE + TILE / 2,
      py: spawn.y * TILE + TILE / 2,
      fromX: spawn.x, fromY: spawn.y,
      dir: 'up', moving: false, t: 0, phase: 0,
      level: 1, xp: 0,
      hp: 64, maxHp: 64, qi: 30, maxQi: 30, atk: 9, def: 3,
      items: { potion: 2, herb: 1 },
      skills: ['tajo', 'viento', 'respiracion'],
      questStage: 0, hasSword: false, defeated: 0,
    }
  }

  /* ------------------------------------------------------------ lifecycle */

  frame = (now) => {
    const dt = Math.min(0.05, Math.max(0, (now - this.last) / 1000))
    this.last = now
    this.update(dt)
    this.draw()
    if (!this.ready) {
      this.ready = true
      window.__gameReady = true
    }
    requestAnimationFrame(this.frame)
  }

  update(dt) {
    this.time += dt

    if (this.bannerTimer > 0) {
      this.bannerTimer -= dt
      if (this.bannerTimer <= 0) this.ui.banner.classList.remove('show')
    }

    if (this.mode === 'map') {
      this.playTime += dt
      this.updateMovement(dt)
      this.updateCamera(dt)
    }

    if (this.combat) {
      const c = this.combat
      c.flash = Math.max(0, c.flash - dt * 4)
      c.shake = Math.max(0, c.shake - dt * 3)
      for (const fx of c.fx) fx.life -= dt
      c.fx = c.fx.filter((fx) => fx.life > 0)
      if (c.hintFx) {
        c.hintFx.life -= dt * 0.6
        if (c.hintFx.life <= 0) c.hintFx = null
      }
    }
  }

  draw() {
    if (this.mode === 'title') this.renderer.drawTitle(this.time)
    else if (this.combat && (this.mode === 'combat' || this.mode === 'gameover')) this.renderer.drawCombat(this, this.time)
    else this.renderer.drawWorld(this, this.time)
  }

  resize() {
    this.renderer.resize()
    this.snapCamera()
  }

  /* ------------------------------------------------------------- movement */

  heldDirection() {
    if (this.touchDir) return this.touchDir
    for (const dir of this.keys) if (DIRS[dir]) return dir
    return null
  }

  updateMovement(dt) {
    const p = this.player
    if (p.moving) {
      p.t += dt / WALK_TIME
      const k = Math.min(1, p.t)
      p.phase = k
      p.px = (p.fromX + (p.x - p.fromX) * k) * TILE + TILE / 2
      p.py = (p.fromY + (p.y - p.fromY) * k) * TILE + TILE / 2
      if (p.t >= 1) {
        p.moving = false
        p.phase = 0
        p.px = p.x * TILE + TILE / 2
        p.py = p.y * TILE + TILE / 2
        this.afterStep()
      }
      return
    }
    const dir = this.heldDirection()
    if (dir) this.startStep(dir)
  }

  startStep(dir) {
    const p = this.player
    p.dir = dir
    p.phase = 0
    const delta = DIRS[dir]
    const nx = p.x + delta.x
    const ny = p.y + delta.y
    if (!this.walkable(nx, ny)) {
      this.refreshHint()
      return
    }
    p.fromX = p.x
    p.fromY = p.y
    p.x = nx
    p.y = ny
    p.moving = true
    p.t = 0
  }

  walkable(x, y) {
    if (x < 0 || y < 0 || x >= MAP_W || y >= MAP_H) return false
    if (SOLID.has(tileAt(this.world, x, y))) return false
    return !this.npcAt(x, y)
  }

  npcAt(x, y) {
    return this.world.npcs.find((npc) => npc.x === x && npc.y === y) || null
  }

  frontTile() {
    const delta = DIRS[this.player.dir]
    return { x: this.player.x + delta.x, y: this.player.y + delta.y }
  }

  afterStep() {
    const p = this.player
    const zone = zoneAt(p.y)
    if (zone !== this.zone) {
      this.zone = zone
      this.ui.banner.textContent = zone
      this.ui.banner.classList.add('show')
      this.bannerTimer = 2.4
    }
    this.refreshHint()

    if (tileAt(this.world, p.x, p.y) === TT.TALL && zone !== 'Templo del Filo') {
      if (Math.random() < 0.13) {
        this.startCombat(Math.random() < 0.62 ? 'bamboo' : 'wolf')
      }
    }
  }

  updateCamera(dt) {
    const p = this.player
    const mapW = MAP_W * TILE
    const mapH = MAP_H * TILE
    let tx = p.px - this.renderer.w / 2
    let ty = p.py - this.renderer.h / 2
    tx = mapW > this.renderer.w ? clamp(tx, 0, mapW - this.renderer.w) : (mapW - this.renderer.w) / 2
    ty = mapH > this.renderer.h ? clamp(ty, 0, mapH - this.renderer.h) : (mapH - this.renderer.h) / 2
    const k = Math.min(1, dt * 9)
    this.cam.x += (tx - this.cam.x) * k
    this.cam.y += (ty - this.cam.y) * k
  }

  snapCamera() {
    const mapW = MAP_W * TILE
    const mapH = MAP_H * TILE
    const p = this.player
    let tx = p.px - this.renderer.w / 2
    let ty = p.py - this.renderer.h / 2
    tx = mapW > this.renderer.w ? clamp(tx, 0, mapW - this.renderer.w) : (mapW - this.renderer.w) / 2
    ty = mapH > this.renderer.h ? clamp(ty, 0, mapH - this.renderer.h) : (mapH - this.renderer.h) / 2
    this.cam = { x: tx, y: ty }
  }

  /* ----------------------------------------------------------- interaction */

  primary() {
    if (this.mode === 'dialogue') return this.advanceDialogue()
    if (this.mode === 'title') return this.newGame()
    if (this.mode === 'map') return this.interact()
    return undefined
  }

  interact() {
    if (this.mode !== 'map') return
    const front = this.frontTile()
    const npc = this.npcAt(front.x, front.y)
    if (npc) return this.talkTo(npc)
    if (front.x === this.world.altar.x && front.y === this.world.altar.y) return this.touchAltar()
    if (tileAt(this.world, front.x, front.y) === TT.HOUSE) {
      return this.toast('La puerta está cerrada. Mei te espera en la plaza.')
    }
    return this.toast('No hay nada al alcance.')
  }

  talkTo(npc) {
    const stage = clamp(this.player.questStage, 0, npc.id === 'mei' ? 3 : 2)
    const lines = DIALOGUE[npc.id]?.[stage] || DIALOGUE[npc.id]?.[0]
    if (!lines) return
    this.openDialogue(lines, () => {
      if (npc.id === 'mei' && this.player.questStage === 0) this.setQuest(1)
      else if (npc.id === 'mei' && this.player.questStage === 2) {
        this.setQuest(3)
        this.showEnding()
      }
    })
  }

  touchAltar() {
    const stage = clamp(this.player.questStage, 0, 2)
    const lines = DIALOGUE.altar[stage]
    this.openDialogue(lines, () => {
      if (stage === 1) this.startCombat('guardian')
    })
  }

  openDialogue(lines, onDone) {
    this.dialogue = { lines, index: 0, onDone }
    this.mode = 'dialogue'
    this.ui.dialogue.classList.remove('hidden')
    this.ui.touch.classList.add('hidden')
    this.ui.hint.classList.add('hidden')
    this.showLine()
    this.sound.play('select')
  }

  showLine() {
    const line = this.dialogue?.lines[this.dialogue.index]
    if (!line) return
    this.ui.dlgSpeaker.textContent = line.s
    this.ui.dlgText.textContent = line.t
  }

  advanceDialogue() {
    if (!this.dialogue) return
    this.dialogue.index += 1
    if (this.dialogue.index >= this.dialogue.lines.length) return this.closeDialogue()
    this.showLine()
    this.sound.play('select')
  }

  closeDialogue() {
    if (!this.dialogue) return
    const done = this.dialogue.onDone
    this.dialogue = null
    this.ui.dialogue.classList.add('hidden')
    if (this.mode === 'dialogue') this.mode = 'map'
    this.syncWorldUi()
    if (typeof done === 'function') done()
  }

  /* ---------------------------------------------------------------- combat */

  startCombat(key) {
    if (this.mode !== 'map') return
    const def = ENEMIES[key]
    if (!def) return
    if (this.dialogue) {
      this.dialogue = null
      this.ui.dialogue.classList.add('hidden')
    }
    this.mode = 'combat'
    this.combat = {
      key,
      name: def.name,
      sprite: def.sprite,
      hp: def.hp,
      maxHp: def.hp,
      atk: def.atk,
      def: def.def,
      xp: def.xp,
      boss: Boolean(def.boss),
      moves: def.moves,
      enragedMoves: def.enraged?.moves || null,
      enrageLine: def.enraged?.line || '',
      enraged: false,
      busy: true,
      guard: 0,
      fx: [],
      flash: 0,
      shake: 0,
      hintFx: null,
    }
    this.sound.play('encounter')
    this.ui.hud.classList.add('hidden')
    this.ui.hint.classList.add('hidden')
    this.ui.touch.classList.add('hidden')
    this.ui.combat.classList.remove('hidden')
    this.ui.enemyName.textContent = def.name
    this.ui.enemyTag.textContent = def.boss ? 'Guardián' : 'Criatura'
    this.ui.enemyHint.textContent = def.boss ? 'El sello del templo' : 'Acecha entre los bambúes'
    this.setCombatLog(def.intro)
    this.updateEnemyBar()
    this.refreshCombatActions(false)
    this.updateHud()

    const token = this.combat
    wait(850).then(() => {
      if (this.combat !== token || this.mode !== 'combat') return
      token.busy = false
      this.setCombatLog('Elige tu acción.')
      this.refreshCombatActions(true)
    })
  }

  setCombatLog(text) {
    const el = this.ui.combatLog
    el.textContent = text
    el.classList.remove('pulse')
    void el.offsetWidth
    el.classList.add('pulse')
  }

  updateEnemyBar() {
    const c = this.combat
    if (!c) return
    const ratio = clamp(c.hp / c.maxHp, 0, 1)
    this.ui.enemyFill.style.width = `${ratio * 100}%`
    this.ui.enemyFill.classList.toggle('low', ratio < 0.35)
    this.ui.enemyHint.textContent = c.enraged
      ? 'El jade se ha agrietado'
      : c.boss ? 'El sello del templo' : 'Acecha entre los bambúes'
  }

  refreshCombatActions(enabled) {
    const wrap = this.ui.combatActions
    wrap.innerHTML = ''
    this.actionButtons = []
    const p = this.player
    let index = 0

    for (const id of p.skills) {
      const skill = SKILLS[id]
      const button = document.createElement('button')
      button.type = 'button'
      button.className = 'action'
      button.innerHTML = `<span class="hotkey">${index + 1}</span><span class="action-name">${skill.name}</span><span class="action-cost">${skill.cost ? `${skill.cost} qi` : 'sin coste'}</span><span class="action-desc">${skill.desc}</span>`
      button.disabled = !enabled || p.qi < skill.cost
      button.addEventListener('click', () => this.act({ type: 'skill', id }))
      wrap.appendChild(button)
      this.actionButtons.push({ button, action: { type: 'skill', id } })
      index += 1
    }

    for (const [id, count] of Object.entries(p.items)) {
      if (!count) continue
      const item = ITEMS[id]
      const button = document.createElement('button')
      button.type = 'button'
      button.className = 'action item'
      const full = p.hp >= p.maxHp && (item.full || (item.qi || 0) === 0)
      button.innerHTML = `<span class="hotkey">${index + 1}</span><span class="action-name">${item.name} ×${count}</span><span class="action-cost">objeto</span><span class="action-desc">${item.desc}</span>`
      button.disabled = !enabled || full
      button.addEventListener('click', () => this.act({ type: 'item', id }))
      wrap.appendChild(button)
      this.actionButtons.push({ button, action: { type: 'item', id } })
      index += 1
    }

    const flee = document.createElement('button')
    flee.type = 'button'
    flee.className = 'action flee'
    flee.innerHTML = `<span class="hotkey">${index + 1}</span><span class="action-name">Huir</span><span class="action-cost">riesgo</span><span class="action-desc">Intenta escapar del combate.</span>`
    flee.disabled = !enabled || Boolean(this.combat?.boss)
    flee.addEventListener('click', () => this.act({ type: 'flee' }))
    wrap.appendChild(flee)
    this.actionButtons.push({ button: flee, action: { type: 'flee' } })
  }

  setActionsEnabled(enabled) {
    for (const { button, action } of this.actionButtons) {
      if (!button) continue
      let allowed = enabled
      if (action.type === 'skill' && SKILLS[action.id].cost > this.player.qi) allowed = false
      if (action.type === 'flee' && this.combat?.boss) allowed = false
      button.disabled = !allowed
    }
  }

  hitFx(amount, crit) {
    const c = this.combat
    if (!c) return
    const L = this.renderer.layout
    c.fx.push({
      x: L.enemyX + (Math.random() - 0.5) * 50,
      y: L.enemyY - 70 * L.scale,
      life: 1,
      maxLife: 1,
      text: crit ? `¡${amount}!` : `${amount}`,
      color: crit ? '#ffd166' : '#f6f1e4',
      size: crit ? 36 : 27,
    })
    c.flash = 1
    c.shake = 1
  }

  healFx(amount, label) {
    const c = this.combat
    if (!c) return
    const L = this.renderer.layout
    c.fx.push({
      x: L.playerX + 10,
      y: L.playerY - 60 * L.scale,
      life: 1,
      maxLife: 1,
      text: label || `+${amount}`,
      color: '#8ef0c4',
      size: 24,
    })
  }

  hurtFx(amount) {
    const c = this.combat
    if (!c) return
    const L = this.renderer.layout
    c.fx.push({
      x: L.playerX + (Math.random() - 0.5) * 30,
      y: L.playerY - 52 * L.scale,
      life: 1,
      maxLife: 1,
      text: `-${amount}`,
      color: '#ff8a90',
      size: 23,
    })
    c.shake = 1
  }

  act(action) {
    const c = this.combat
    if (!c || c.busy || this.mode !== 'combat') return
    c.busy = true
    this.setActionsEnabled(false)
    this.resolveAction(action).catch((error) => {
      console.error(error)
      if (this.combat === c) {
        c.busy = false
        this.setActionsEnabled(true)
      }
    })
  }

  async resolveAction(action) {
    const c = this.combat
    if (!c) return
    const p = this.player

    if (action.type === 'skill') {
      const skill = SKILLS[action.id]
      if (!skill || p.qi < skill.cost) {
        c.busy = false
        this.setActionsEnabled(true)
        return
      }
      p.qi -= skill.cost
      if (skill.kind === 'attack') {
        let total = 0
        const hits = skill.hits || 1
        for (let i = 0; i < hits; i++) {
          const crit = Math.random() < (skill.crit || 0.08)
          let damage = Math.max(1, Math.round(p.atk * skill.mult * (0.9 + Math.random() * 0.2)) - c.def)
          if (crit) damage = Math.round(damage * 1.6)
          total += damage
          c.hp = Math.max(0, c.hp - damage)
          this.hitFx(damage, crit)
          this.sound.play(crit ? 'crit' : 'hit')
          this.updateEnemyBar()
          if (hits > 1) await wait(260)
          if (c.hp <= 0) break
        }
        this.setCombatLog(`${skill.name}: ${total} de daño.`)
      } else if (skill.kind === 'heal') {
        const heal = Math.round(p.maxHp * skill.heal)
        p.hp = Math.min(p.maxHp, p.hp + heal)
        p.qi = Math.min(p.maxQi, p.qi + (skill.qi || 0))
        this.healFx(heal)
        this.sound.play('heal')
        this.setCombatLog(`Respiras hondo y recuperas ${heal} de vida.`)
      } else if (skill.kind === 'guard') {
        c.guard = skill.guard
        p.qi = Math.min(p.maxQi, p.qi + (skill.qi || 0))
        this.healFx(0, 'Guardia')
        this.setCombatLog('Levantas una guardia de jade.')
      }
    } else if (action.type === 'item') {
      const item = ITEMS[action.id]
      if (!item || !p.items[action.id]) {
        c.busy = false
        this.setActionsEnabled(true)
        return
      }
      p.items[action.id] -= 1
      if (p.items[action.id] <= 0) delete p.items[action.id]
      if (item.full) {
        p.hp = p.maxHp
        p.qi = p.maxQi
      } else {
        p.hp = Math.min(p.maxHp, p.hp + (item.heal || 0))
        p.qi = Math.min(p.maxQi, p.qi + (item.qi || 0))
      }
      this.healFx(item.full ? p.maxHp : item.heal || 0)
      this.sound.play('heal')
      this.setCombatLog(`Usas ${item.name}.`)
    } else if (action.type === 'flee') {
      if (!c.boss && Math.random() < 0.6) {
        this.setCombatLog('Escapas entre la maleza.')
        await wait(550)
        this.finishCombat()
        this.toast('Escapaste del combate')
        return
      }
      this.setCombatLog('No logras escapar.')
      this.sound.play('select')
      await wait(350)
    }

    this.updateHud()
    this.refreshCombatActions(false)
    await wait(320)
    if (this.combat !== c) return
    if (c.hp <= 0) return this.victory()
    return this.enemyTurn()
  }

  async enemyTurn() {
    const c = this.combat
    if (!c || this.mode !== 'combat') return
    const p = this.player
    await wait(420)
    if (this.combat !== c) return

    if (c.boss && !c.enraged && c.hp <= c.maxHp * 0.5) {
      c.enraged = true
      c.moves = c.enragedMoves || c.moves
      c.shake = 1
      this.updateEnemyBar()
      this.setCombatLog(c.enrageLine)
      this.sound.play('crit')
      await wait(900)
      if (this.combat !== c) return
    }

    const move = pickWeighted(c.moves)
    const hits = move.hits || 1
    let total = 0
    for (let i = 0; i < hits; i++) {
      let damage = Math.max(1, Math.round(c.atk * move.mult * (0.9 + Math.random() * 0.2)) - p.def * 0.6)
      if (c.guard > 0) damage = Math.max(1, Math.round(damage * (1 - c.guard)))
      total += damage
      p.hp = Math.max(0, p.hp - damage)
      this.hurtFx(damage)
      this.sound.play('hit')
      this.updateHud()
      await wait(240)
      if (p.hp <= 0) break
    }
    c.guard = 0
    this.setCombatLog(`${c.name} usa ${move.name}. ${total} de daño.`)
    this.updateEnemyBar()
    await wait(650)
    if (this.combat !== c) return
    if (p.hp <= 0) return this.defeat()
    c.busy = false
    this.refreshCombatActions(true)
    this.setCombatLog('Elige tu acción.')
    return undefined
  }

  async victory() {
    const c = this.combat
    if (!c) return
    c.busy = true
    this.setActionsEnabled(false)
    this.setCombatLog(`${c.name} cae.`)
    this.sound.play('level')
    await wait(850)
    const isBoss = c.boss
    const xp = c.xp
    this.player.defeated += 1
    this.finishCombat()
    this.gainXp(xp)
    if (!isBoss && Math.random() < 0.45) {
      this.player.items.potion = (this.player.items.potion || 0) + 1
      this.toast('Encontraste una Poción de Qi')
    }
    if (isBoss) this.onBossDefeated()
    this.save()
    this.updateHud()
    this.refreshHint()
  }

  finishCombat() {
    this.combat = null
    this.ui.combat.classList.add('hidden')
    this.actionButtons = []
    this.mode = 'map'
    this.syncWorldUi()
    this.updateHud()
  }

  defeat() {
    this.mode = 'gameover'
    this.setActionsEnabled(false)
    this.ui.gameover.classList.remove('hidden')
    this.sound.play('crit')
  }

  onBossDefeated() {
    this.player.hasSword = true
    this.learn('celestial')
    this.setQuest(2)
    this.openDialogue([
      { s: 'Lian', t: 'La espada baja del altar y se posa en mi mano. Pesa menos de lo que esperaba.' },
      { s: 'Espada Celestial', t: '«Portador. El cielo aún no está en calma.»' },
    ], () => this.toast('Obtuviste: Espada Celestial'))
  }

  learn(id) {
    if (SKILLS[id] && !this.player.skills.includes(id)) this.player.skills.push(id)
  }

  gainXp(amount) {
    const p = this.player
    p.xp += amount
    this.toast(`+${amount} XP`)
    let leveled = false
    while (p.level < 9 && p.xp >= xpToNext(p.level)) {
      p.xp -= xpToNext(p.level)
      p.level += 1
      p.maxHp += 14
      p.maxQi += 6
      p.atk += 2
      p.def += 1
      p.hp = p.maxHp
      p.qi = p.maxQi
      leveled = true
      if (p.level === 2) this.learn('lunar')
      if (p.level === 3) this.learn('guardia')
    }
    if (leveled) {
      this.sound.play('level')
      this.toast(`¡Nivel ${p.level}!`)
    }
  }

  /* ------------------------------------------------------------------- ui */

  syncWorldUi() {
    const inCombat = this.mode === 'combat' || this.mode === 'gameover'
    this.ui.hud.classList.toggle('hidden', this.mode === 'title' || inCombat)
    this.ui.touch.classList.toggle('hidden', this.mode !== 'map')
    this.ui.hint.classList.toggle('hidden', this.mode !== 'map')
    this.ui.combat.classList.toggle('hidden', this.mode !== 'combat')
    this.refreshHint()
  }

  updateHud() {
    const p = this.player
    this.ui.hpFill.style.width = `${clamp((p.hp / p.maxHp) * 100, 0, 100)}%`
    this.ui.qiFill.style.width = `${clamp((p.qi / p.maxQi) * 100, 0, 100)}%`
    this.ui.hpText.textContent = `${Math.ceil(p.hp)} / ${p.maxHp}`
    this.ui.qiText.textContent = `${Math.ceil(p.qi)} / ${p.maxQi}`
    this.ui.level.textContent = `Nv. ${p.level}`
    this.ui.quest.textContent = QUEST_TEXT[clamp(p.questStage, 0, 3)]
  }

  refreshHint() {
    if (this.mode !== 'map') {
      this.ui.hint.classList.add('hidden')
      return
    }
    const front = this.frontTile()
    const npc = this.npcAt(front.x, front.y)
    let text = ''
    if (npc) text = `Hablar con ${npc.name}`
    else if (front.x === this.world.altar.x && front.y === this.world.altar.y) {
      text = this.player.questStage >= 1 ? 'Examinar el altar' : 'Examinar el altar sellado'
    }
    if (text) {
      this.ui.hint.innerHTML = `<kbd>E</kbd> ${text}`
      this.ui.hint.classList.remove('hidden')
    } else {
      this.ui.hint.classList.add('hidden')
    }
  }

  toast(text, ms = 2100) {
    this.toastQueue.push({ text, ms })
    if (!this.toastActive) this.nextToast()
  }

  nextToast() {
    const item = this.toastQueue.shift()
    if (!item) {
      this.toastActive = false
      return
    }
    this.toastActive = true
    this.ui.toast.textContent = item.text
    this.ui.toast.classList.add('show')
    clearTimeout(this.toastTimer)
    this.toastTimer = setTimeout(() => {
      this.ui.toast.classList.remove('show')
      this.toastTimer = setTimeout(() => {
        this.toastActive = false
        this.nextToast()
      }, 220)
    }, item.ms)
  }

  /* ---------------------------------------------------------------- screens */

  refreshTitle() {
    this.ui.continueBtn.disabled = !this.hasSave()
  }

  showTitle() {
    this.mode = 'title'
    this.combat = null
    this.dialogue = null
    this.ui.title.classList.remove('hidden')
    this.ui.menu.classList.add('hidden')
    this.ui.ending.classList.add('hidden')
    this.ui.gameover.classList.add('hidden')
    this.ui.help.classList.add('hidden')
    this.ui.dialogue.classList.add('hidden')
    this.ui.combat.classList.add('hidden')
    this.ui.hud.classList.add('hidden')
    this.ui.touch.classList.add('hidden')
    this.ui.hint.classList.add('hidden')
    this.updateHud()
    this.refreshTitle()
  }

  newGame() {
    this.player = this.createPlayer()
    this.mode = 'map'
    this.combat = null
    this.zone = ''
    this.ui.title.classList.add('hidden')
    this.ui.help.classList.add('hidden')
    this.ui.ending.classList.add('hidden')
    this.ui.gameover.classList.add('hidden')
    this.snapCamera()
    this.updateHud()
    this.syncWorldUi()
    this.save()
    this.toast('La Anciana Mei te espera en la plaza', 2600)
  }

  openMenu() {
    if (this.mode !== 'map') return
    this.mode = 'menu'
    this.ui.menu.classList.remove('hidden')
    this.ui.touch.classList.add('hidden')
    this.ui.hint.classList.add('hidden')
    this.renderMenu()
  }

  closeMenu() {
    if (this.mode !== 'menu') return
    this.ui.menu.classList.add('hidden')
    this.mode = 'map'
    this.syncWorldUi()
  }

  renderMenu() {
    const p = this.player
    this.ui.menuStats.innerHTML = [
      ['Nivel', `${p.level}`],
      ['Vida', `${Math.ceil(p.hp)} / ${p.maxHp}`],
      ['Qi', `${Math.ceil(p.qi)} / ${p.maxQi}`],
      ['Ataque', `${p.atk}`],
      ['Defensa', `${p.def}`],
      ['Derrotados', `${p.defeated}`],
    ].map(([label, value]) => `<div class="stat"><span>${label}</span><strong>${value}</strong></div>`).join('')

    this.ui.menuItems.innerHTML = ''
    const entries = Object.entries(p.items).filter(([, count]) => count > 0)
    if (!entries.length) {
      this.ui.menuItems.innerHTML = '<li class="muted">No llevas objetos.</li>'
    }
    for (const [id, count] of entries) {
      const item = ITEMS[id]
      const li = document.createElement('li')
      li.innerHTML = `<div><strong>${item.name}</strong> <span class="muted">×${count}</span><p>${item.desc}</p></div>`
      const button = document.createElement('button')
      button.type = 'button'
      button.className = 'small-btn'
      button.textContent = 'Usar'
      button.disabled = p.hp >= p.maxHp && !item.qi
      button.addEventListener('click', () => {
        if (item.full) {
          p.hp = p.maxHp
          p.qi = p.maxQi
        } else {
          p.hp = Math.min(p.maxHp, p.hp + (item.heal || 0))
          p.qi = Math.min(p.maxQi, p.qi + (item.qi || 0))
        }
        p.items[id] -= 1
        if (p.items[id] <= 0) delete p.items[id]
        this.updateHud()
        this.renderMenu()
        this.save()
      })
      li.appendChild(button)
      this.ui.menuItems.appendChild(li)
    }

    this.ui.menuQuest.textContent = QUEST_TEXT[clamp(p.questStage, 0, 3)]
    this.ui.menuSound.textContent = `Sonido: ${this.sound.enabled ? 'sí' : 'no'}`
  }

  showEnding() {
    const p = this.player
    const minutes = Math.floor(this.playTime / 60)
    const seconds = Math.floor(this.playTime % 60)
    this.mode = 'ending'
    this.ui.endingStats.innerHTML = [
      ['Nivel final', `${p.level}`],
      ['Enemigos derrotados', `${p.defeated}`],
      ['Tiempo de viaje', `${minutes}:${String(seconds).padStart(2, '0')}`],
      ['Filo', 'Espada Celestial'],
    ].map(([label, value]) => `<div class="stat"><span>${label}</span><strong>${value}</strong></div>`).join('')
    this.ui.ending.classList.remove('hidden')
    this.ui.hud.classList.add('hidden')
    this.ui.touch.classList.add('hidden')
    this.ui.hint.classList.add('hidden')
    this.save()
  }

  setQuest(stage) {
    this.player.questStage = stage
    this.updateHud()
    this.save()
  }

  /* ------------------------------------------------------------------ save */

  hasSave() {
    try {
      return Boolean(localStorage.getItem(SAVE_KEY))
    } catch {
      return false
    }
  }

  save() {
    const p = this.player
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify({
        v: 1,
        level: p.level, xp: p.xp,
        hp: p.hp, maxHp: p.maxHp, qi: p.qi, maxQi: p.maxQi,
        atk: p.atk, def: p.def,
        items: p.items, skills: p.skills,
        questStage: p.questStage, hasSword: p.hasSword, defeated: p.defeated,
        x: p.x, y: p.y, playTime: this.playTime,
        savedAt: Date.now(),
      }))
      this.refreshTitle()
    } catch {
      /* private mode: keep playing without persistence */
    }
  }

  loadSave() {
    try {
      const raw = localStorage.getItem(SAVE_KEY)
      if (!raw) return false
      const data = JSON.parse(raw)
      if (!data || data.v !== 1) return false
      const p = this.createPlayer()
      p.level = Number(data.level) || 1
      p.xp = Number(data.xp) || 0
      p.maxHp = Number(data.maxHp) || 64
      p.maxQi = Number(data.maxQi) || 30
      p.hp = clamp(Number(data.hp) || p.maxHp, 1, p.maxHp)
      p.qi = clamp(Number(data.qi) || p.maxQi, 0, p.maxQi)
      p.atk = Number(data.atk) || 9
      p.def = Number(data.def) || 3
      p.items = data.items && typeof data.items === 'object' ? data.items : { potion: 2 }
      p.skills = Array.isArray(data.skills) && data.skills.length ? data.skills.filter((id) => SKILLS[id]) : p.skills
      p.questStage = clamp(Number(data.questStage) || 0, 0, 3)
      p.hasSword = Boolean(data.hasSword)
      p.defeated = Number(data.defeated) || 0
      p.x = clamp(Number(data.x) || this.world.spawn.x, 1, MAP_W - 2)
      p.y = clamp(Number(data.y) || this.world.spawn.y, 1, MAP_H - 2)
      p.px = p.x * TILE + TILE / 2
      p.py = p.y * TILE + TILE / 2
      if (!this.walkable(p.x, p.y)) {
        p.x = this.world.spawn.x
        p.y = this.world.spawn.y
        p.px = p.x * TILE + TILE / 2
        p.py = p.y * TILE + TILE / 2
      }
      this.player = p
      this.playTime = Number(data.playTime) || 0
      this.mode = 'map'
      this.combat = null
      this.zone = ''
      this.ui.title.classList.add('hidden')
      this.ui.menu.classList.add('hidden')
      this.ui.ending.classList.add('hidden')
      this.ui.gameover.classList.add('hidden')
      this.ui.dialogue.classList.add('hidden')
      this.ui.combat.classList.add('hidden')
      this.snapCamera()
      this.updateHud()
      this.syncWorldUi()
      this.toast('Partida cargada')
      return true
    } catch {
      return false
    }
  }

  /* ----------------------------------------------------------------- input */

  bindUi() {
    $('#btn-new').addEventListener('click', () => this.newGame())
    this.ui.continueBtn.addEventListener('click', () => this.loadSave())
    $('#btn-help').addEventListener('click', () => this.ui.help.classList.remove('hidden'))
    $('#help-close').addEventListener('click', () => this.ui.help.classList.add('hidden'))
    this.ui.dlgNext.addEventListener('click', () => this.advanceDialogue())
    this.ui.dialogue.addEventListener('click', (event) => {
      if (event.target === this.ui.dlgNext) return
      this.advanceDialogue()
    })
    $('#btn-menu').addEventListener('click', () => this.openMenu())
    $('#btn-action').addEventListener('click', () => this.primary())
    $('#menu-close').addEventListener('click', () => this.closeMenu())
    $('#menu-save').addEventListener('click', () => {
      this.save()
      this.toast('Partida guardada')
    })
    this.ui.menuSound.addEventListener('click', () => {
      this.sound.enabled = !this.sound.enabled
      if (this.sound.enabled) this.sound.play('select')
      this.renderMenu()
    })
    $('#menu-title').addEventListener('click', () => {
      this.save()
      this.showTitle()
    })
    $('#ending-continue').addEventListener('click', () => {
      this.ui.ending.classList.add('hidden')
      this.mode = 'map'
      this.syncWorldUi()
      this.updateHud()
    })
    $('#ending-new').addEventListener('click', () => {
      this.ui.ending.classList.add('hidden')
      this.newGame()
    })
    $('#gameover-retry').addEventListener('click', () => {
      this.ui.gameover.classList.add('hidden')
      if (this.hasSave()) {
        if (this.loadSave()) return
      }
      this.player.hp = Math.max(1, Math.round(this.player.maxHp * 0.5))
      this.player.x = this.world.spawn.x
      this.player.y = this.world.spawn.y
      this.player.px = this.player.x * TILE + TILE / 2
      this.player.py = this.player.y * TILE + TILE / 2
      this.mode = 'map'
      this.combat = null
      this.snapCamera()
      this.syncWorldUi()
      this.updateHud()
    })
    $('#gameover-title').addEventListener('click', () => this.showTitle())

    document.querySelectorAll('[data-dir]').forEach((button) => {
      const dir = button.dataset.dir
      const press = (event) => {
        event.preventDefault()
        this.touchDir = dir
        button.classList.add('active')
      }
      const release = (event) => {
        if (event) event.preventDefault()
        if (this.touchDir === dir) this.touchDir = null
        button.classList.remove('active')
      }
      button.addEventListener('pointerdown', press)
      button.addEventListener('pointerup', release)
      button.addEventListener('pointercancel', release)
      button.addEventListener('pointerleave', release)
    })

    this.canvas.addEventListener('pointerdown', () => {
      if (this.mode === 'title') return
      if (this.mode === 'dialogue') this.advanceDialogue()
    })
  }

  bindInput() {
    window.addEventListener('keydown', (event) => {
      const tag = (event.target?.tagName || '').toLowerCase()
      if (tag === 'input' || tag === 'textarea') return
      const key = event.key
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(key)) event.preventDefault()

      if (this.mode === 'title') {
        if (key === 'Enter' || key === ' ') this.newGame()
        return
      }
      if (key === 'Escape' || key === 'm' || key === 'M') {
        if (this.mode === 'menu') return this.closeMenu()
        if (this.mode === 'map') return this.openMenu()
        if (this.mode === 'help') return this.ui.help.classList.add('hidden')
        return undefined
      }
      if (this.mode === 'dialogue') {
        if (['e', 'E', ' ', 'Enter'].includes(key)) return this.advanceDialogue()
        return
      }
      if (this.mode === 'combat') {
        const number = Number(key)
        if (Number.isInteger(number) && number >= 1 && number <= this.actionButtons.length) {
          const entry = this.actionButtons[number - 1]
          if (entry && !entry.button.disabled) entry.button.click()
        }
        return
      }
      if (this.mode !== 'map') return
      const dir = KEY_DIRS[key]
      if (dir) {
        this.keys.add(dir)
        return
      }
      if (key === 'e' || key === 'E' || key === ' ' || key === 'Enter') this.interact()
    })

    window.addEventListener('keyup', (event) => {
      const dir = KEY_DIRS[event.key]
      if (dir) this.keys.delete(dir)
    })
    window.addEventListener('blur', () => {
      this.keys.clear()
      this.touchDir = null
    })
    window.addEventListener('pointerup', () => {
      this.touchDir = null
      document.querySelectorAll('[data-dir].active').forEach((button) => button.classList.remove('active'))
    })
  }
}

new Game()
