import { portraitSVG, playerPortrait } from './portraits.js'
import { item, JURAMENTOS } from '../data/items.js'
import { QUESTS } from '../data/quests.js'
import { CREATURES } from '../data/creatures.js'
import { formatNumber } from '../utils/math.js'
import { TitleScreen } from './TitleScreen.js'
import { CreationScreen } from './CreationScreen.js'
import { MenuScreen } from './MenuScreen.js'
import { EndScreens } from './EndScreens.js'

export const ICONS = {
  sword: '⚔', shield: '◈', spark: '✦', capture: '◎', heart: '♥', mana: '✦',
  creature: '❖', map: '⌖', quest: '◇', user: '☉', bag: '▣', settings: '⚙',
  save: '▤', exit: '↩', help: '?', gold: '◉', essence: '✧', potion: '♨'
}

export class UI {
  constructor(game) {
    this.game = game
    this.bootEl = document.getElementById('boot')
    this.bootBar = document.getElementById('boot-progress')
    this.bootStatus = document.getElementById('boot-status')
    this.hudEl = document.getElementById('hud')
    this.uiEl = document.getElementById('ui')
    this.toastLayer = document.getElementById('toast-layer')
    this.cineEl = document.getElementById('cinematic')
    this.subtitleEl = document.getElementById('subtitle')
    this.fadeEl = document.getElementById('fade')
    this.grainEl = document.getElementById('grain')
    this.portraitLock = document.getElementById('portrait-lock')
    this.damageLayer = null
    this.hud = null
    this.dialogue = null
    this.prompt = { show: false, label: '', key: 'E', action: false }
    this.target = null
    this.shopOpen = false
    this._toastCount = 0
    this._bannerTimer = null
    this._regionTimer = null
    this._typer = null
    this.titleScreen = new TitleScreen(this)
    this.creationScreen = new CreationScreen(this)
    this.menuScreen = new MenuScreen(this)
    this.endScreens = new EndScreens(this)
    this.lastMinimap = 0
    this.minimapCanvas = null
    this.minimapCtx = null
    this.minimapZone = null
    this.terrainCache = {}
    document.getElementById('skip-cinematic')?.addEventListener('click', () => this.game.skipCinematic?.())
  }

  // ───────────── Boot & fade ─────────────
  boot(progress, status) {
    if (this.bootBar) this.bootBar.style.width = `${Math.round(progress * 100)}%`
    if (this.bootStatus && status) this.bootStatus.textContent = status
  }

  finishBoot() {
    if (!this.bootEl) return
    this.bootEl.classList.add('out')
    setTimeout(() => { this.bootEl?.classList.add('hidden') }, 900)
  }

  fadeIn(ms = 700, white = false) {
    const f = this.fadeEl
    if (!f) return
    f.classList.toggle('white', white)
    f.classList.add('on')
    return new Promise(resolve => setTimeout(() => {
      f.style.transition = 'none'
      f.classList.remove('on')
      void f.offsetWidth
      f.style.transition = ''
      setTimeout(resolve, Math.min(ms, 400))
    }, ms))
  }

  async fadeOut(ms = 500, white = false) {
    const f = this.fadeEl
    if (!f) return
    f.classList.toggle('white', white)
    f.classList.add('on')
    await new Promise(r => setTimeout(r, ms))
  }

  fadeClear() { this.fadeEl?.classList.remove('on', 'white') }

  // ───────────── Screens facade ─────────────
  showTitle(state) {
    this.menuScreen.el?.remove()
    this.menuScreen.el = null
    this.menuScreen.shopEl?.remove()
    this.menuScreen.shopEl = null
    this.dialogue = null
    this.hideDialogue()
    this.creationScreen.hide()
    this.titleScreen.hide()
    this.titleScreen.show(state)
  }
  hideTitle() { this.titleScreen.hide() }
  showCharacterCreation() { this.creationScreen.show() }
  hideCharacterCreation() { this.creationScreen.hide() }
  refreshCreation() { this.creationScreen.refresh() }
  openMenu(tab) { this.menuScreen.open(tab) }
  closeMenu() { this.menuScreen.close() }
  refreshMenu() { this.menuScreen.refresh() }
  openSettings(from = 'pause') { this.settingsFrom = from; this.menuScreen.open('ajustes', from === 'title') }
  refreshHUD() { if (this.hud) this.updateHUD(0) }
  captureFlash() { this.flash('rgba(120,225,255,.22)') }
  openShop() { this.menuScreen.openShop() }
  closeShop() { this.menuScreen.closeShop() }
  showHelp(from = 'pause') { this.menuScreen.showHelp(from) }
  showCredits(from = 'pause') { this.menuScreen.showCredits(from) }
  showDeath(data) { this.endScreens.showDeath(data) }
  hideDeath() { this.endScreens.hideDeath() }
  showEnding(type, data) { this.endScreens.showEnding(type, data) }
  showCreditsScreen(data) { this.endScreens.showCredits(data) }

  clearScreens() {
    this.uiEl.innerHTML = ''
    this.uiEl.classList.remove('hidden')
  }

  // ───────────── HUD ─────────────
  buildHUD() {
    const s = this.game.save
    if (!s) return
    const cls = JURAMENTOS[s.className] || JURAMENTOS.filo
    const portrait = playerPortrait(s)
    this.hudEl.innerHTML = `
      <div class="hud-vitals">
        <div class="portrait-medallion">
          <div class="ring">${portrait}</div>
          <div class="lvl" id="hud-level">1</div>
        </div>
        <div class="vital-bars">
          <div class="vital-name"><span class="nm" id="hud-name">${this.escape(s.name)}</span><span class="cls">${cls.name}</span></div>
          <div class="bar hp"><i id="hud-hp"></i><span class="lag" id="hud-hp-lag"></span><span class="bar-label" id="hud-hp-label">100 / 100</span></div>
          <div class="bar mp"><i id="hud-mp"></i><span class="bar-label" id="hud-mp-label">50 / 50</span></div>
          <div class="bar st"><i id="hud-st"></i><span class="bar-label" id="hud-st-label">100 / 100</span></div>
          <div class="effects-row" id="hud-effects"></div>
        </div>
      </div>
      <div class="hud-top-right">
        <button class="hud-menu-btn" id="hud-menu" aria-label="Abrir menú" style="pointer-events:auto;width:24px;height:24px;border:1px solid rgba(228,194,124,.35);color:#e4c27c;background:rgba(6,9,16,.75);font-size:11px;border-radius:50%;">☰</button>
        <div class="zone-label"><span class="dot"></span><span id="hud-zone">VALDORIA</span><small id="hud-act">ACTO I</small></div>
        <div class="minimap-wrap"><canvas id="minimap" width="256" height="256"></canvas><span class="compass">N</span></div>
        <div class="quest-tracker" id="hud-quest">
          <div class="q-act">MISIÓN PRINCIPAL</div>
          <div class="q-title">El despertar</div>
          <div class="q-obj"><span class="q-box"></span><span>Habla con Iria</span></div>
        </div>
        <div class="currency-row"><span>◉ <b id="hud-gold">0</b></span><span>✧ <b id="hud-essence">0</b></span><span>❖ <b id="hud-creatures">0</b></span></div>
      </div>
      <div class="hud-bottom-left">
        <div class="joystick" id="joystick" aria-label="Control de movimiento">
          <div class="knob" id="joystick-knob"></div>
          <div class="directions"><span>▲</span><span>▼</span><span>◀</span><span>▶</span></div>
        </div>
      </div>
      <div class="hud-buttons">
        <button class="action-btn atk" data-control="attack" aria-label="Atacar"><span class="glyph">⚔</span><span class="lbl">Atacar</span><span class="key">Espacio</span></button>
        <button class="action-btn dodge" data-control="dodge" aria-label="Esquivar"><span class="glyph">➤</span><span class="lbl">Esquivar</span><span class="key">Shift</span></button>
        <button class="action-btn block" data-control="block" aria-label="Bloquear"><span class="glyph">◈</span><span class="lbl">Bloquear</span><span class="key">K</span></button>
        <button class="action-btn skill1" data-control="skill1" id="btn-skill1" aria-label="Habilidad"><span class="glyph" id="skill1-glyph">${cls.icon}</span><span class="lbl">${cls.skillName.split(' ')[0]}</span><span class="key">Q</span><span class="cd"></span></button>
        <button class="action-btn skill2" data-control="skill2" aria-label="Habilidad secundaria"><span class="glyph">✦</span><span class="lbl">Don</span><span class="key">R</span><span class="cd"></span></button>
        <button class="action-btn creature-btn" data-control="creature" id="btn-creature" aria-label="Don de criatura"><span class="glyph">❖</span><span class="lbl">Vínculo</span><span class="key">F</span><span class="cd"></span></button>
        <button class="action-btn capture-btn" data-control="capture" id="btn-capture" aria-label="Capturar criatura"><span class="glyph">◎</span><span class="lbl">Capturar</span><span class="key">C</span></button>
        <button class="action-btn potion-btn" data-control="potion" id="btn-potion" aria-label="Usar poción"><span class="glyph">♥</span><span class="lbl">Poción</span><span class="key">1</span><span class="key" id="potion-count" style="right:-2px;top:auto;bottom:-2px;font-size:6px;">0</span></button>
      </div>
      <div class="interact-prompt" id="interact-prompt"><div class="ip-key">E</div><div class="ip-label" id="interact-label">Hablar</div></div>
      <div class="target-info" id="target-info"><div class="t-name" id="target-name"></div><div class="t-bar"><i id="target-hp"></i></div></div>
      <div class="boss-bar" id="boss-bar"><div class="b-name" id="boss-name"></div><div class="b-title" id="boss-title"></div><div class="b-track"><i id="boss-hp"></i></div><div class="b-phase" id="boss-phase"></div></div>
      <div class="desktop-hints"><span><kbd>WASD</kbd> mover</span><span><kbd>Espacio</kbd> atacar</span><span><kbd>Shift</kbd> esquivar</span><span><kbd>K</kbd> bloquear</span><span><kbd>Q</kbd>/<kbd>R</kbd> habilidades</span><span><kbd>E</kbd> interactuar</span><span><kbd>Tab</kbd> menú</span></div>
    `
    this.hudEl.classList.remove('hidden')
    this.hud = {
      hp: document.getElementById('hud-hp'), hpLag: document.getElementById('hud-hp-lag'), hpLabel: document.getElementById('hud-hp-label'),
      mp: document.getElementById('hud-mp'), mpLabel: document.getElementById('hud-mp-label'),
      st: document.getElementById('hud-st'), stLabel: document.getElementById('hud-st-label'),
      name: document.getElementById('hud-name'), level: document.getElementById('hud-level'),
      effects: document.getElementById('hud-effects'), zone: document.getElementById('hud-zone'), act: document.getElementById('hud-act'),
      quest: document.getElementById('hud-quest'), gold: document.getElementById('hud-gold'), essence: document.getElementById('hud-essence'),
      creatures: document.getElementById('hud-creatures'), prompt: document.getElementById('interact-prompt'), promptLabel: document.getElementById('interact-label'),
      target: document.getElementById('target-info'), targetName: document.getElementById('target-name'), targetHp: document.getElementById('target-hp'),
      boss: document.getElementById('boss-bar'), bossName: document.getElementById('boss-name'), bossTitle: document.getElementById('boss-title'),
      bossHp: document.getElementById('boss-hp'), bossPhase: document.getElementById('boss-phase'),
      potion: document.getElementById('potion-count'), skill1: document.getElementById('btn-skill1'), skill2: document.getElementById('btn-skill2'),
      creature: document.getElementById('btn-creature'), capture: document.getElementById('btn-capture'), potionBtn: document.getElementById('btn-potion')
    }
    this.minimapCanvas = document.getElementById('minimap')
    this.minimapCtx = this.minimapCanvas?.getContext('2d')
    this.minimapZone = this.game.zoneId
    this.hudCache = {}
    this._bindHUD()
    this.updateHUD(1)
  }

  _bindHUD() {
    document.getElementById('hud-menu')?.addEventListener('click', () => this.game.openMenu('personaje'))
    // Joystick
    const joy = document.getElementById('joystick')
    const knob = document.getElementById('joystick-knob')
    if (joy) {
      let id = null
      const radius = () => joy.clientWidth * .34
      const move = e => {
        if (e.pointerId !== id) return
        const r = joy.getBoundingClientRect()
        let dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2)
        const max = radius(), len = Math.hypot(dx, dy)
        if (len > max) { dx = dx / len * max; dy = dy / len * max }
        knob.style.transform = `translate(${dx}px, ${dy}px)`
        this.game.input.setJoystick(dx / max, dy / max)
      }
      const end = e => {
        if (e.pointerId !== id) return
        id = null; knob.style.transform = 'translate(0px, 0px)'
        this.game.input.setJoystick(0, 0)
      }
      joy.addEventListener('pointerdown', e => {
        e.preventDefault(); e.stopPropagation()
        id = e.pointerId; joy.setPointerCapture?.(id); move(e)
      })
      joy.addEventListener('pointermove', move)
      joy.addEventListener('pointerup', end)
      joy.addEventListener('pointercancel', end)
    }
    // Action buttons
    this.hudEl.querySelectorAll('[data-control]').forEach(btn => {
      const name = btn.dataset.control
      let pressed = false
      btn.addEventListener('pointerdown', e => {
        e.preventDefault(); e.stopPropagation(); pressed = true
        btn.classList.add('on'); btn.setPointerCapture?.(e.pointerId)
        this.game.controlDown(name)
      })
      const up = e => {
        if (!pressed) return
        pressed = false; btn.classList.remove('on')
        this.game.controlUp(name)
      }
      btn.addEventListener('pointerup', up)
      btn.addEventListener('pointercancel', up)
      btn.addEventListener('pointerleave', e => { if (pressed && e.buttons === 0) up(e) })
    })
    // Interact prompt
    this.hud.prompt?.addEventListener('pointerdown', e => {
      e.preventDefault(); e.stopPropagation(); this.game.interact()
    })
    this.hud.prompt.style.pointerEvents = 'auto'
    setTimeout(() => document.querySelector('.desktop-hints')?.classList.add('show'), 1200)
  }

  stopHUD() {
    this.hudEl.classList.add('hidden')
    this.hudEl.innerHTML = ''
    this.hud = null
    this.minimapCanvas = null
    this.minimapCtx = null
  }

  updateHUD(dt = 0) {
    const p = this.game.player
    const s = this.game.save
    if (!this.hud || !p || !s) return
    const d = p.derived
    const hpPct = Math.max(0, p.hp / d.hp)
    const mpPct = Math.max(0, p.mp / d.mp)
    const stPct = Math.max(0, p.stamina / d.stamina)
    this.hud.hp.style.width = `${hpPct * 100}%`
    this.hud.hpLag.style.width = `${hpPct * 100}%`
    this.hud.mp.style.width = `${mpPct * 100}%`
    this.hud.st.style.width = `${stPct * 100}%`
    this.hud.hpLabel.textContent = `${Math.ceil(p.hp)} / ${Math.round(d.hp)}`
    this.hud.mpLabel.textContent = `${Math.ceil(p.mp)} / ${Math.round(d.mp)}`
    this.hud.stLabel.textContent = `${Math.ceil(p.stamina)} / ${Math.round(d.stamina)}`
    this.hud.level.textContent = s.level
    this.hud.name.textContent = s.name
    this.hud.gold.textContent = money(s.gold)
    this.hud.essence.textContent = money(s.essence || 0)
    this.hud.creatures.textContent = s.creatures.length
    this.hud.potion.textContent = this.game.inventoryCount('potion_vida') + this.game.inventoryCount('potion_mana')
    const zone = this.game.world?.zone
    if (zone) {
      this.hud.zone.textContent = zone.name.toUpperCase()
      this.hud.act.textContent = zone.act.toUpperCase()
    }
    // Efectos
    const effects = p.effects || []
    const effKey = effects.map(e => e.id + (e.time || 0).toFixed(0)).join(',')
    if (this.hudCache.effKey !== effKey) {
      this.hudCache.effKey = effKey
      this.hud.effects.innerHTML = effects.map(e => `<span class="effect-pip">${e.label}</span>`).join('')
    }
    // Misión seguida
    const qid = this.game.quests.trackedQuest()
    const qhash = qid + JSON.stringify(this.game.quests.state[qid]?.step) + JSON.stringify(this.game.quests.state[qid]?.progress)
    if (this.hudCache.qhash !== qhash) {
      this.hudCache.qhash = qhash
      this.hud.quest.innerHTML = this.questTrackerHTML(qid)
    } else if (qid) {
      const step = this.game.quests.currentStep(qid)
      const distEl = this.hud.quest.querySelector('.q-dist')
      if (distEl && step?.pos && this.game.player) {
        const d2 = Math.hypot(this.game.player.pos.x - step.pos[0], this.game.player.pos.z - step.pos[1])
        distEl.textContent = d2 < 999 ? `${Math.round(d2)} m` : ''
      }
    }
    // Cooldowns
    const setCD = (el, rem, total) => {
      if (!el) return
      const cd = el.querySelector('.cd')
      if (cd) cd.style.setProperty('--cd', `${Math.max(0, Math.min(1, rem / total)) * 360}deg`)
      el.classList.toggle('disabled', rem > 0)
    }
    setCD(this.hud.skill1, p.cooldowns.skill1 || 0, p.skillData?.cd1 || 8)
    setCD(this.hud.skill2, p.cooldowns.skill2 || 0, p.skillData?.cd2 || 16)
    setCD(this.hud.creature, p.cooldowns.creature || 0, p.creatureCooldown || 14)
    this.hud.capture?.classList.toggle('disabled', !p.captureTarget)
    this.hud.potionBtn?.classList.toggle('disabled', this.game.inventoryCount('potion_vida') + this.game.inventoryCount('potion_mana') <= 0)
    // Prompt
    if (this.prompt.show) {
      this.hud.prompt.classList.add('show')
      this.hud.promptLabel.innerHTML = this.prompt.label
      this.hud.prompt.querySelector('.ip-key').textContent = this.prompt.key
    } else this.hud.prompt.classList.remove('show')
    // Objetivo
    if (this.target) {
      this.hud.target.classList.add('show')
      this.hud.targetName.textContent = this.target.name
      this.hud.targetHp.style.width = `${Math.max(0, this.target.pct) * 100}%`
    } else this.hud.target.classList.remove('show')
    // Minimapa
    this.lastMinimap += dt
    if (this.lastMinimap > .1) { this.lastMinimap = 0; this.drawMinimap() }
  }

  questTrackerHTML(qid) {
    if (!qid) return '<div class="q-act">DIARIO</div><div class="q-title">Sin misión activa</div><div class="q-obj"><span>Explora el mundo y habla con sus gentes.</span></div>'
    const def = QUESTS[qid]
    const st = this.game.quests.state[qid]
    const step = def.steps[st.step]
    if (!step) return ''
    const n = st.progress?.[st.step] || 0
    const count = step.count || 1
    const dist = step.pos && this.game.player ? Math.round(Math.hypot(this.game.player.pos.x - step.pos[0], this.game.player.pos.z - step.pos[1])) : null
    return `<div class="q-act">${def.type === 'main' ? 'MISIÓN PRINCIPAL' : 'MISIÓN SECUNDARIA'} · ${def.region.toUpperCase()}</div>
      <div class="q-title">${def.title}</div>
      <div class="q-obj"><span class="q-box"></span><span>${step.label}${count > 1 ? ` (${n}/${count})` : ''}</span>${dist !== null ? `<span class="q-dist">${dist} m</span>` : ''}</div>`
  }

  setInteract(show, label = '', key = 'E') {
    this.prompt = { show, label, key }
  }

  setTarget(enemy) {
    if (!enemy) this.target = null
    else this.target = { name: enemy.def.name, pct: enemy.hp / enemy.maxHp }
  }

  // ───────────── Minimap / map ─────────────
  getTerrainCanvas(zoneId, size = 256) {
    const key = `${zoneId}:${size}`
    if (this.terrainCache[key]) return this.terrainCache[key]
    const zone = this.game.zones[zoneId]
    const c = document.createElement('canvas'); c.width = size; c.height = size
    const ctx = c.getContext('2d')
    const img = ctx.createImageData(size, size)
    const palette = zone.palette
    const rgb = n => [(n >> 16) & 255, (n >> 8) & 255, n & 255]
    const colorAt = (x, z, h) => {
      const shade = .55 + .45 * Math.max(0, Math.min(1, (h + 3) / 12))
      if (zone.isWater?.(x, z)) return rgb(palette.water).map(c => c * .9)
      const v = Math.max(0, Math.min(1, (h + 3) / 16))
      if (v > .55) return rgb(palette.rock).map(c => c * shade)
      const base = rgb(palette.ground), alt = rgb(palette.ground2)
      return [
        (base[0] + (alt[0] - base[0]) * v) * shade,
        (base[1] + (alt[1] - base[1]) * v) * shade,
        (base[2] + (alt[2] - base[2]) * v) * shade
      ]
    }
    for (let py = 0; py < size; py++) {
      for (let px = 0; px < size; px++) {
        const x = (px / size - .5) * zone.bounds * 2
        const z = (py / size - .5) * zone.bounds * 2
        const h = zone.heightAt(x, z)
        const [r, g, b] = colorAt(x, z, h)
        const i = (py * size + px) * 4
        img.data[i] = r; img.data[i + 1] = g; img.data[i + 2] = b; img.data[i + 3] = 255
      }
    }
    ctx.putImageData(img, 0, 0)
    // Textura de líneas suaves
    ctx.globalAlpha = .08
    for (let i = 0; i < 40; i++) {
      ctx.strokeStyle = i % 2 ? '#fff' : '#000'
      ctx.beginPath()
      const x = Math.random() * size, y = Math.random() * size
      ctx.moveTo(x, y); ctx.lineTo(x + (Math.random() - .5) * 60, y + (Math.random() - .5) * 60)
      ctx.stroke()
    }
    ctx.globalAlpha = 1
    this.terrainCache[key] = c
    return c
  }

  drawMinimap() {
    const ctx = this.minimapCtx
    if (!ctx || !this.game.world || !this.game.player) return
    const size = 256
    const zone = this.game.world.zone
    if (this.minimapZone !== zone.id) { this.minimapZone = zone.id }
    ctx.clearRect(0, 0, size, size)
    const base = this.getTerrainCanvas(zone.id, 512)
    const p = this.game.player.pos
    const scale = 1.45 // unidades del mundo por píxel
    const view = size / 2
    ctx.save()
    ctx.beginPath(); ctx.arc(view, view, view, 0, Math.PI * 2); ctx.clip()
    ctx.fillStyle = '#070a12'; ctx.fillRect(0, 0, size, size)
    // Mapa rotado para que el jugador mire hacia arriba
    ctx.translate(view, view)
    ctx.rotate(-this.game.cameraYaw - Math.PI)
    ctx.scale(size / (zone.bounds * 2) * 1.35, size / (zone.bounds * 2) * 1.35)
    ctx.translate(-p.x, -p.z)
    ctx.globalAlpha = .9
    ctx.drawImage(base, -zone.bounds, -zone.bounds, zone.bounds * 2, zone.bounds * 2)
    ctx.globalAlpha = 1
    // Marcadores cercanos
    const project = (x, z) => [x, z]
    const marker = (x, z, color, r = 3.2, shape = 'dot') => {
      ctx.fillStyle = color
      ctx.strokeStyle = 'rgba(0,0,0,.6)'; ctx.lineWidth = 1.2
      if (shape === 'diamond') {
        ctx.beginPath(); ctx.moveTo(x, z - r); ctx.lineTo(x + r, z); ctx.lineTo(x, z + r); ctx.lineTo(x - r, z); ctx.closePath(); ctx.fill(); ctx.stroke()
      } else { ctx.beginPath(); ctx.arc(x, z, r, 0, Math.PI * 2); ctx.fill(); ctx.stroke() }
    }
    // Enemigos
    for (const e of this.game.world.enemies) {
      if (!e.alive) continue
      const d = Math.hypot(e.pos.x - p.x, e.pos.z - p.z)
      if (d > 55) continue
      marker(e.pos.x, e.pos.z, e.def.boss ? '#ffcf6a' : '#ff6c5c', e.def.boss ? 5 : 2.4)
    }
    // Criaturas
    for (const c of this.game.world.creatureSpawns || []) {
      if (c.caught || c.dead) continue
      const d = Math.hypot(c.pos.x - p.x, c.pos.z - p.z)
      if (d > 55) continue
      marker(c.pos.x, c.pos.z, '#77e5ee', 3)
    }
    // NPC
    for (const n of this.game.world.npcs) marker(n.pos.x, n.pos.z, '#e8c77a', 3, 'diamond')
    // Cofres / objetos
    for (const o of this.game.world.interactables) {
      if (o.used || o.type === 'gate' || o.type === 'altar' || o.type === 'memory' || o.type === 'seal' || o.type === 'echo') continue
      marker(o.pos.x, o.pos.z, '#bfa86a', 2)
    }
    // Waypoints
    for (const w of this.game.world.waypoints) marker(w.pos.x, w.pos.z, this.game.isWaypointDiscovered(w.def.id) ? '#78b8ff' : '#5c6b80', 3.4, 'diamond')
    // Portal
    for (const portal of this.game.world.portals) marker(portal.pos.x, portal.pos.z, '#b39cff', 4, 'diamond')
    // Objetivo de misión
    const qid = this.game.quests.trackedQuest()
    const step = qid ? this.game.quests.currentStep(qid) : null
    if (step?.pos) {
      const pulse = 1 + Math.sin(performance.now() * .004) * .25
      marker(step.pos[0], step.pos[1], 'rgba(255,232,160,.9)', 5.2 * pulse, 'diamond')
    }
    ctx.restore()
    // Jugador (flecha)
    ctx.save()
    ctx.translate(view, view)
    const angle = -this.game.player.mesh.rotation.y
    ctx.rotate(angle)
    ctx.fillStyle = '#fff3cf'; ctx.strokeStyle = '#241a0a'; ctx.lineWidth = 2
    ctx.beginPath(); ctx.moveTo(0, -11); ctx.lineTo(7, 8); ctx.lineTo(0, 4); ctx.lineTo(-7, 8); ctx.closePath(); ctx.fill(); ctx.stroke()
    ctx.restore()
    // Anillo y norte
    ctx.strokeStyle = 'rgba(228,194,124,.28)'; ctx.lineWidth = 2
    ctx.beginPath(); ctx.arc(view, view, view - 3, 0, Math.PI * 2); ctx.stroke()
  }

  drawFullMap(canvas) {
    if (!canvas || !this.game.world) return
    const zone = this.game.world.zone
    const size = canvas.width = Math.max(320, canvas.clientWidth * (window.devicePixelRatio || 1))
    canvas.height = Math.max(240, canvas.clientHeight * (window.devicePixelRatio || 1))
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    const base = this.getTerrainCanvas(zone.id, 512)
    const s = Math.min(canvas.width, canvas.height)
    ctx.save()
    ctx.translate(canvas.width / 2, canvas.height / 2)
    ctx.rotate(0)
    const k = s / (zone.bounds * 2) * .94
    ctx.scale(k, k)
    ctx.drawImage(base, -zone.bounds, -zone.bounds, zone.bounds * 2, zone.bounds * 2)
    ctx.strokeStyle = 'rgba(228,194,124,.30)'; ctx.lineWidth = 1.2 / k
    ctx.strokeRect(-zone.bounds, -zone.bounds, zone.bounds * 2, zone.bounds * 2)
    // Rutas
    const project = (x, z) => [x, z]
    const marker = (x, z, color, r, shape = 'dot', label = '') => {
      ctx.fillStyle = color; ctx.strokeStyle = 'rgba(0,0,0,.65)'; ctx.lineWidth = 1.5 / k
      if (shape === 'diamond') {
        ctx.beginPath(); ctx.moveTo(x, z - r); ctx.lineTo(x + r, z); ctx.lineTo(x, z + r); ctx.lineTo(x - r, z); ctx.closePath(); ctx.fill(); ctx.stroke()
      } else { ctx.beginPath(); ctx.arc(x, z, r, 0, Math.PI * 2); ctx.fill(); ctx.stroke() }
      if (label) {
        ctx.save(); ctx.translate(x, z - r - 3); ctx.scale(1 / k, 1 / k)
        ctx.fillStyle = 'rgba(240,232,210,.85)'; ctx.font = '11px "Trebuchet MS", sans-serif'; ctx.textAlign = 'center'
        ctx.fillText(label, 0, 0); ctx.restore()
      }
    }
    for (const lm of zone.landmarks) marker(lm.pos[0], lm.pos[1], 'rgba(228,194,124,.35)', 3)
    for (const w of this.game.world.waypoints) {
      const disc = this.game.isWaypointDiscovered(w.def.id)
      marker(w.pos.x, w.pos.z, disc ? '#78b8ff' : '#536074', 4, 'diamond', disc ? w.def.name : '')
    }
    for (const n of this.game.world.npcs) marker(n.pos.x, n.pos.z, '#e8c77a', 3.4, 'dot', n.def.name)
    for (const portal of this.game.world.portals) marker(portal.pos.x, portal.pos.z, '#b39cff', 4.4, 'diamond', portal.def.name)
    const qid = this.game.quests.trackedQuest()
    const step = qid ? this.game.quests.currentStep(qid) : null
    if (step?.pos) {
      const pulse = 4.5 + Math.sin(performance.now() * .005) * 1.4
      marker(step.pos[0], step.pos[1], 'rgba(255,235,170,.95)', pulse, 'diamond', step.label)
    }
    for (const e of this.game.world.enemies) if (e.alive && e.def.boss) marker(e.pos.x, e.pos.z, '#ffcf6a', 5.5, 'dot', e.def.name)
    // Jugador
    const p = this.game.player.pos
    marker(p.x, p.z, '#fff3cf', 4.5)
    ctx.restore()
    ctx.fillStyle = 'rgba(5,7,12,.6)'; ctx.fillRect(0, 0, canvas.width, 26)
    ctx.fillStyle = 'rgba(228,194,124,.85)'; ctx.font = `${Math.max(10, 11 * (window.devicePixelRatio || 1))}px "Trebuchet MS", sans-serif`; ctx.textAlign = 'left'
    ctx.fillText(`${zone.name.toUpperCase()} · ${zone.act.toUpperCase()}`, 12 * (window.devicePixelRatio || 1), 17 * (window.devicePixelRatio || 1))
  }

  // ───────────── Dialogue ─────────────
  showDialogue(data, handlers) {
    this.hideDialogue()
    const overlay = document.createElement('div')
    overlay.className = 'dialogue-overlay'
    overlay.id = 'dialogue-overlay'
    const portrait = portraitSVG(data.portraitId || 'player', data.colors || {}, this.game.save?.appearance || {})
    overlay.innerHTML = `<div class="dialogue-box" role="dialog" aria-modal="true">
      <div class="dialogue-portrait"><div class="p-glow"></div>${portrait}</div>
      <div class="dialogue-body">
        <button class="dialogue-close" aria-label="Cerrar">✕</button>
        <div class="dialogue-speaker">${this.escape(data.speaker || '')}<span class="dialogue-role">${this.escape(data.role || '')}</span></div>
        <div class="dialogue-text typing" id="dialogue-text"></div>
        ${data.moral ? `<div class="dialogue-moral">${data.moral}</div>` : ''}
        <div class="dialogue-choices" id="dialogue-choices"></div>
        <div class="dialogue-hint">${data.hint || 'CLIC / ESPACIO PARA CONTINUAR'}</div>
      </div>
    </div>`
    this.uiEl.appendChild(overlay)
    this.dialogue = { overlay, data, handlers, full: data.text, typing: true, index: 0, timer: null }
    const textEl = overlay.querySelector('#dialogue-text')
    const close = () => handlers.onClose?.()
    overlay.querySelector('.dialogue-close').addEventListener('click', e => { e.stopPropagation(); close() })
    overlay.addEventListener('pointerdown', e => {
      if (e.target.closest('.dialogue-choice') || e.target.closest('.dialogue-close')) return
      this.advanceDialogue()
    })
    this.typeDialogue(data.text)
    if (!data.choices || !data.choices.length) {
      // Sin opciones: se avanza con clic
    }
  }

  typeDialogue(text) {
    const d = this.dialogue
    if (!d) return
    const el = d.overlay.querySelector('#dialogue-text')
    clearInterval(d.timer)
    d.full = text
    d.index = 0
    d.typing = true
    el.classList.add('typing')
    el.textContent = ''
    d.timer = setInterval(() => {
      d.index += 2
      el.textContent = text.slice(0, d.index)
      if (d.index >= text.length) {
        clearInterval(d.timer)
        d.typing = false
        el.classList.remove('typing')
        el.textContent = text
        this.renderDialogueChoices()
      }
    }, 14)
  }

  renderDialogueChoices() {
    const d = this.dialogue
    if (!d) return
    const wrap = d.overlay.querySelector('#dialogue-choices')
    if (!d.data.choices?.length) { wrap.innerHTML = ''; return }
    wrap.innerHTML = d.data.choices.map((c, i) => `<button class="dialogue-choice" data-choice="${i}"><span class="num">${i + 1}</span>${this.escape(c.label)}${c.sub ? `<span style="display:block;font-size:10px;color:#7d786b;margin-left:19px;margin-top:2px">${this.escape(c.sub)}</span>` : ''}</button>`).join('')
    wrap.querySelectorAll('.dialogue-choice').forEach(b => b.addEventListener('click', e => {
      e.stopPropagation()
      const i = Number(b.dataset.choice)
      if (this.dialogue?.typing) { this.completeDialogueTyping(); return }
      this.dialogue.handlers.onChoice?.(i)
    }))
  }

  completeDialogueTyping() {
    const d = this.dialogue
    if (!d) return
    clearInterval(d.timer)
    d.typing = false
    d.index = d.full?.length || 0
    const el = d.overlay.querySelector('#dialogue-text')
    el.classList.remove('typing')
    el.textContent = d.full
    this.renderDialogueChoices()
  }

  advanceDialogue() {
    const d = this.dialogue
    if (!d) return
    if (d.typing) { this.completeDialogueTyping(); return }
    if (d.data.choices?.length) return
    d.handlers.onAdvance?.()
  }

  updateDialogue(data) {
    const d = this.dialogue
    if (!d) return
    d.data = data
    d.overlay.querySelector('.dialogue-speaker').innerHTML = `${this.escape(data.speaker || '')}<span class="dialogue-role">${this.escape(data.role || '')}</span>`
    const portrait = d.overlay.querySelector('.dialogue-portrait')
    if (portrait) portrait.innerHTML = `<div class="p-glow"></div>${portraitSVG(data.portraitId || 'player', data.colors || {}, this.game.save?.appearance || {})}`
    d.overlay.querySelector('#dialogue-choices').innerHTML = ''
    this.typeDialogue(data.text)
  }

  hideDialogue() {
    if (this.dialogue) {
      clearInterval(this.dialogue.timer)
      this.dialogue.overlay.remove()
      this.dialogue = null
    }
  }

  dialogueKey(e) {
    if (!this.dialogue) return false
    if (e.code === 'Escape') { this.dialogue.handlers.onClose?.(); return true }
    if (e.code === 'Space' || e.code === 'Enter') { this.advanceDialogue(); return true }
    if (/^Digit[1-4]$/.test(e.code)) {
      const i = Number(e.code.slice(-1)) - 1
      if (!this.dialogue.typing && this.dialogue.data.choices?.[i]) this.dialogue.handlers.onChoice?.(i)
      return true
    }
    return true
  }

  // ───────────── Notifications ─────────────
  toast(html, icon = '✦') {
    if (!this.toastLayer) return
    if (this._toastCount > 3) this.toastLayer.firstElementChild?.remove()
    const el = document.createElement('div')
    el.className = 'toast'
    el.innerHTML = `<span class="ico">${icon}</span><span>${html}</span>`
    this.toastLayer.appendChild(el)
    this._toastCount++
    setTimeout(() => { el.remove(); this._toastCount = Math.max(0, this._toastCount - 1) }, 3100)
  }

  questBanner(type, title) {
    const el = document.createElement('div')
    el.className = 'quest-banner'
    el.innerHTML = `<div class="qb-type">${this.escape(type)}</div><div class="qb-name">${this.escape(title)}</div><div class="qb-line"></div>`
    document.getElementById('ui').appendChild(el)
    requestAnimationFrame(() => el.classList.add('show'))
    clearTimeout(this._bannerTimer)
    this._bannerTimer = setTimeout(() => { el.classList.remove('show'); setTimeout(() => el.remove(), 600) }, 2600)
  }

  regionCard(kicker, name, subtitle, duration = 3600) {
    let el = document.getElementById('region-card')
    if (!el) {
      el = document.createElement('div'); el.id = 'region-card'; el.className = 'region-card'
      document.getElementById('ui').appendChild(el)
    }
    el.innerHTML = `<div class="rc-kicker">${this.escape(kicker)}</div><h2>${this.escape(name)}</h2><div class="rc-line"></div><div class="rc-sub">${this.escape(subtitle)}</div>`
    requestAnimationFrame(() => el.classList.add('show'))
    clearTimeout(this._regionTimer)
    this._regionTimer = setTimeout(() => { el.classList.remove('show') }, duration)
  }

  flashZone() {
    const f = document.createElement('div')
    f.className = 'screen-flash on'
    f.style.background = 'radial-gradient(circle at 50% 50%, rgba(255,235,170,.18), transparent 70%)'
    document.body.appendChild(f)
    setTimeout(() => f.classList.remove('on'), 120)
    setTimeout(() => f.remove(), 600)
  }

  flash(color = 'rgba(255,120,80,.18)') {
    if (!this.game.settings.shake && color.includes('255,120')) return
    const f = document.createElement('div')
    f.className = 'screen-flash on'
    f.style.background = `radial-gradient(circle at 50% 50%, ${color}, transparent 74%)`
    document.body.appendChild(f)
    setTimeout(() => f.classList.remove('on'), 90)
    setTimeout(() => f.remove(), 500)
  }

  damageAt(x, y, text, kind = '') {
    if (!this.game.settings.damageNumbers) return
    if (!this.damageLayer) {
      this.damageLayer = document.createElement('div')
      this.damageLayer.className = 'damage-layer'
      document.getElementById('app').appendChild(this.damageLayer)
    }
    const el = document.createElement('div')
    el.className = `dmg ${kind}`
    el.textContent = text
    el.style.left = `${x}px`; el.style.top = `${y}px`
    this.damageLayer.appendChild(el)
    setTimeout(() => el.remove(), 1000)
  }

  // ───────────── Boss bar ─────────────
  showBoss(name, title, phases = 1) {
    if (!this.hud) return
    this.hud.bossName.textContent = name
    this.hud.bossTitle.textContent = title
    this.hud.bossHp.style.width = '100%'
    this.hud.bossPhase.innerHTML = Array.from({ length: phases }, () => '<span></span>').join('')
    this.hud.boss.classList.add('show')
  }

  updateBoss(pct, phaseIndex = 0) {
    if (!this.hud) return
    this.hud.bossHp.style.width = `${Math.max(0, Math.min(1, pct)) * 100}%`
    this.hud.bossPhase.querySelectorAll('span').forEach((s, i) => s.classList.toggle('on', i <= phaseIndex))
  }

  hideBoss() { this.hud?.boss.classList.remove('show') }

  // ───────────── Cinematic ─────────────
  showCinematic() {
    this.cineEl.classList.remove('hidden')
    this.cineEl.classList.add('show')
    this.uiEl.classList.add('hidden')
  }

  endCinematic() {
    this.cineEl.classList.add('hidden')
    this.cineEl.classList.remove('show')
    this.subtitleEl.innerHTML = ''
    this.uiEl.classList.remove('hidden')
  }

  setSubtitle(speaker, text) {
    this.subtitleEl.innerHTML = `${speaker ? `<span class="speaker">${this.escape(speaker)}</span>` : ''}${this.escape(text)}`
    this.subtitleEl.style.opacity = '1'
  }

  clearSubtitle() { this.subtitleEl.innerHTML = '' }

  // ───────────── Utility ─────────────
  escape(str = '') {
    return String(str).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))
  }

  portrait(id, colors) { return portraitSVG(id, colors, this.game.save?.appearance || {}) }

  rarityColor(r) { return { comun: '#c9c3b3', fino: '#7fd3a0', raro: '#78b8ff', epico: '#c39bff', legendario: '#ffd47a', reliquia: '#ff9b6b' }[r] || '#c9c3b3' }

  goldIcon() { return '◉' }
}
