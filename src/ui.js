import {
  WEAPONS, ARMORS, ACCESSORIES, ITEMS, SKILLS, CREATURES, QUESTS, LORE,
  HAIR_STYLES, HAIR_COLORS, OUTFITS, APPEARANCE_DEFAULT, SETTINGS_KEY,
} from './content.js'
import { drawHero, drawHeroPortrait } from './art/hero.js'
import { TAU, rr, ellipse, glow } from './art/common.js'

const $ = (id) => document.getElementById(id)
const clamp = (v, a, b) => Math.max(a, Math.min(b, v))
const fmt = (n) => Math.round(n).toLocaleString('es-ES')

export class UI {
  constructor(game) {
    this.game = game
    this.toastTimers = new Set()
    this.currentDialogue = null
    this.dialogueIndex = 0
    this.menuTab = 'status'
    this.creatorAppearance = { ...APPEARANCE_DEFAULT }
    this.titleIndex = 0
    this.lastHud = 0
    this.lastMini = 0
    this.creatorRaf = null
    this.touchOffsets = { joyX: 0, joyY: 0, actX: 0, actY: 0 }
    this.settingsSource = null
    this.editingTouch = false
    this.bindStatic()
    this.bindKeyboard()
    this.bindTouchControls()
    this.loadSettings()
  }

  /* ============================== PANTALLAS ============================== */
  bindStatic() {
    document.querySelectorAll('[data-action="start"]').forEach((b) => b.addEventListener('click', () => { this.game.audio.init(); this.game.startNew({ ...APPEARANCE_DEFAULT }); }))
    document.querySelectorAll('[data-action="continue"]').forEach((b) => b.addEventListener('click', () => { this.game.audio.init(); this.game.continueGame() }))
    document.querySelectorAll('[data-action="create"]').forEach((b) => b.addEventListener('click', () => { this.game.audio.init(); this.openCreator() }))
    document.querySelectorAll('[data-action="settings"]').forEach((b) => b.addEventListener('click', () => { this.openSettings('title') }))
    document.querySelectorAll('[data-menu-close]').forEach((b) => b.addEventListener('click', () => this.closePause()))
    document.querySelector('[data-menu-save]')?.addEventListener('click', () => { this.game.save(); this.toast('Partida guardada en el santuario de Luma', { icon: '◈', type: 'good' }); this.flashSave() })
    document.querySelector('[data-menu-title]')?.addEventListener('click', () => { this.game.save(); this.closePause(); this.game.quitToTitle() })
    document.querySelectorAll('[data-ending-continue]').forEach((b) => b.addEventListener('click', () => this.game.closeEnding()))
    document.querySelectorAll('[data-ending-title]').forEach((b) => b.addEventListener('click', () => { this.hideEnding(); this.game.quitToTitle() }))
    document.querySelectorAll('[data-retry]').forEach((b) => b.addEventListener('click', () => this.game.retry()))
    document.querySelectorAll('[data-gameover-title]').forEach((b) => b.addEventListener('click', () => { this.hideGameOver(); this.game.quitToTitle() }))
    document.querySelectorAll('[data-settings-close]').forEach((b) => b.addEventListener('click', () => this.closeSettings()))
    document.querySelectorAll('[data-rotate-dismiss]').forEach((b) => b.addEventListener('click', () => $('rotate-hint').classList.add('hidden')))
    document.querySelectorAll('[data-creator-action="back"]').forEach((b) => b.addEventListener('click', () => this.closeCreator()))
    document.querySelectorAll('[data-creator-action="begin"]').forEach((b) => b.addEventListener('click', () => this.beginCreator()))
    document.querySelectorAll('[data-creator-action="random"]').forEach((b) => b.addEventListener('click', () => this.randomizeCreator()))
    document.querySelectorAll('.option-row').forEach((row) => {
      const key = row.dataset.option
      row.querySelectorAll('.cycle-btn').forEach((b) => b.addEventListener('click', () => this.cycleCreator(key, Number(b.dataset.dir))))
    })
    $('hero-name')?.addEventListener('input', () => {
      this.creatorAppearance.name = $('hero-name').value.slice(0, 16) || 'Elian'
      $('hero-name').value = this.creatorAppearance.name
      this.drawCreatorPreview(performance.now() / 1000)
    })
    $('hero-name')?.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); this.beginCreator() } })

    document.querySelectorAll('[data-quick]').forEach((b) => b.addEventListener('click', () => {
      const map = {
        potion: () => this.game.usePotion(), weapon: () => this.game.cycleWeapon(),
        skill: () => this.game.useSkill(), companion: () => this.game.toggleCompanion(),
      }
      map[b.dataset.quick]?.()
    }))
    $('pause-layer')?.addEventListener('click', (e) => { if (e.target === $('pause-layer')) this.closePause() })
    $('dialogue-box')?.addEventListener('click', (e) => { if (!e.target.closest('button')) this.advanceDialogue() })
    document.querySelectorAll('#menu-tabs button').forEach((b) => b.addEventListener('click', () => this.openTab(b.dataset.tab)))
    this.updateContinueButton()
  }

  bindKeyboard() {
    window.addEventListener('keydown', (e) => {
      if (e.target instanceof HTMLInputElement) return
      if (!this.isTitleVisible()) return
      const buttons = [...document.querySelectorAll('.title-menu .title-btn')].filter((b) => !b.hidden && getComputedStyle(b).display !== 'none')
      if (!buttons.length) return
      if (['ArrowDown', 'ArrowUp'].includes(e.key)) {
        e.preventDefault()
        this.titleIndex = (this.titleIndex + (e.key === 'ArrowDown' ? 1 : -1) + buttons.length) % buttons.length
        buttons[this.titleIndex]?.focus()
      } else if (e.key === 'Enter' && !buttons.includes(document.activeElement)) {
        e.preventDefault()
        buttons.find((b) => b.dataset.action === 'start')?.click()
      }
    })
  }

  isTitleVisible() { return !$('title-screen').classList.contains('hidden') }

  showTitle() {
    $('title-screen').classList.remove('hidden')
    $('creator-screen').classList.add('hidden')
    $('hud').classList.add('hidden')
    $('dialogue-layer').classList.add('hidden')
    $('pause-layer').classList.add('hidden')
    $('settings-layer').classList.add('hidden')
    $('ending-screen').classList.add('hidden')
    $('gameover-screen').classList.add('hidden')
    this.updateContinueButton()
    document.body.classList.remove('touch-active')
  }

  updateContinueButton() {
    const meta = this.game.getSaveMeta()
    const btn = $('btn-continue')
    if (!btn) return
    btn.hidden = !meta
    if (meta) $('continue-label').textContent = `${meta.name} · Nv. ${meta.level} · ${meta.zone}`
  }

  showHUD(show = true) {
    $('hud').classList.toggle('hidden', !show)
    if (show) this.refreshTouchVisibility()
  }

  /* ============================== CREADOR ============================== */
  openCreator() {
    $('title-screen').classList.add('hidden')
    $('creator-screen').classList.remove('hidden')
    this.creatorAppearance = { ...APPEARANCE_DEFAULT, name: 'Elian' }
    $('hero-name').value = this.creatorAppearance.name
    this.updateCreatorLabels()
    this.creatorRaf = true
    this.drawCreatorPreview(performance.now() / 1000)
    const loop = (t) => {
      if (!this.creatorRaf) return
      this.drawCreatorPreview(t / 1000)
      requestAnimationFrame(loop)
    }
    requestAnimationFrame(loop)
  }

  closeCreator() {
    this.creatorRaf = null
    $('creator-screen').classList.add('hidden')
    $('title-screen').classList.remove('hidden')
  }

  cycleCreator(key, dir) {
    const app = this.creatorAppearance
    if (key === 'hair') app.hair = (app.hair + dir + HAIR_STYLES.length) % HAIR_STYLES.length
    if (key === 'hairColor') app.hairColor = (app.hairColor + dir + HAIR_COLORS.length) % HAIR_COLORS.length
    if (key === 'outfit') app.outfit = (app.outfit + dir + OUTFITS.length) % OUTFITS.length
    if (key === 'weapon') {
      const list = ['sword_alba', 'daga_lirio', 'arco_susurro', 'baston_aurora']
      let i = list.indexOf(app.weapon)
      i = (i + dir + list.length) % list.length
      app.weapon = list[i]
    }
    this.updateCreatorLabels()
  }

  randomizeCreator() {
    const app = this.creatorAppearance
    app.hair = Math.floor(Math.random() * HAIR_STYLES.length)
    app.hairColor = Math.floor(Math.random() * HAIR_COLORS.length)
    app.outfit = Math.floor(Math.random() * OUTFITS.length)
    const list = ['sword_alba', 'daga_lirio', 'arco_susurro', 'baston_aurora']
    app.weapon = list[Math.floor(Math.random() * list.length)]
    this.updateCreatorLabels()
  }

  updateCreatorLabels() {
    const a = this.creatorAppearance
    $('opt-hair').textContent = HAIR_STYLES[a.hair]
    $('opt-hairColor').textContent = HAIR_COLORS[a.hairColor].name
    $('opt-outfit').textContent = OUTFITS[a.outfit].name
    $('opt-weapon').textContent = WEAPONS[a.weapon].name
    $('creator-desc').textContent = WEAPONS[a.weapon].desc
    const stats = this.previewStats()
    $('creator-hp').textContent = stats.hp
    $('creator-mp').textContent = stats.mp
    $('creator-atk').textContent = stats.atk
    $('creator-def').textContent = stats.def
  }

  previewStats() {
    const w = WEAPONS[this.creatorAppearance.weapon]
    return { hp: 120, mp: 42, atk: 21 + Math.round(w.damage * .5), def: 6 }
  }

  drawCreatorPreview(time) {
    const canvas = $('creator-canvas')
    if (!canvas || $('creator-screen').classList.contains('hidden')) return
    const dpr = Math.min(2, window.devicePixelRatio || 1)
    const w = canvas.clientWidth || 420, h = canvas.clientHeight || 560
    if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr)
    }
    const ctx = canvas.getContext('2d')
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, w, h)
    const bg = ctx.createRadialGradient(w * .5, h * .42, 10, w * .5, h * .5, w * .8)
    bg.addColorStop(0, '#263f5c'); bg.addColorStop(.5, '#101f36'); bg.addColorStop(1, '#060c18')
    ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h)
    // anillos y runas
    const cx = w * .5, cy = h * .48
    for (let i = 0; i < 3; i++) {
      ctx.strokeStyle = `rgba(232,200,122,${.11 - i * .025})`; ctx.lineWidth = 1
      ctx.beginPath(); ctx.arc(cx, cy, w * (.18 + i * .11), 0, TAU); ctx.stroke()
    }
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(time * .05)
    ctx.strokeStyle = 'rgba(111,232,210,.13)'; ctx.lineWidth = 1
    for (let i = 0; i < 8; i++) {
      const a = i / 8 * TAU
      ctx.beginPath(); ctx.moveTo(Math.cos(a) * w * .24, Math.sin(a) * w * .24); ctx.lineTo(Math.cos(a) * w * .31, Math.sin(a) * w * .31); ctx.stroke()
    }
    ctx.restore()
    // partículas
    for (let i = 0; i < 22; i++) {
      const a = time * .25 + i * 2.1
      const r = 30 + (i % 5) * 22
      ellipse(ctx, cx + Math.cos(a) * r, cy + Math.sin(a * 1.2) * r * .6, 1.2, 1.2)
      ctx.fillStyle = i % 3 ? 'rgba(255,231,162,.38)' : 'rgba(115,247,221,.35)'; ctx.fill()
    }
    // plataforma
    ellipse(ctx, cx, h * .88, w * .28, h * .045)
    ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.fill()
    ctx.strokeStyle = 'rgba(232,200,122,.3)'; ctx.lineWidth = 1
    ellipse(ctx, cx, h * .88, w * .28, h * .045); ctx.stroke()
    glow(ctx, cx, h * .82, w * .3, 'rgba(111,214,206,.12)', .7)
    const scale = Math.min(w / 130, h / 220)
    drawHero(ctx, {
      x: cx, y: h * .88, appearance: this.creatorAppearance,
      weapon: WEAPONS[this.creatorAppearance.weapon], time, walk: 0, moving: false,
      facing: { x: 0, y: 1 }, state: {}, scale, shield: true, level: 1,
    })
    // viñeta
    const v = ctx.createRadialGradient(cx, cy, w * .15, cx, cy, w * .65)
    v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(2,6,13,.62)')
    ctx.fillStyle = v; ctx.fillRect(0, 0, w, h)
  }

  beginCreator() {
    const name = ($('hero-name').value || '').trim().slice(0, 16) || 'Elian'
    this.creatorAppearance.name = name
    this.creatorRaf = null
    this.game.audio.init()
    this.game.startNew({ ...this.creatorAppearance })
  }

  /* ============================== HUD ============================== */
  updateHUD(force = false) {
    const now = performance.now()
    if (!force && now - this.lastHud < 80) return
    this.lastHud = now
    const p = this.game.player
    if (!p || this.game.mode === 'title') return
    const hpPct = p.hp / p.maxHp * 100
    $('hp-fill').style.width = `${clamp(hpPct, 0, 100)}%`
    $('mp-fill').style.width = `${clamp(p.mp / p.maxMp * 100, 0, 100)}%`
    $('st-fill').style.width = `${clamp(p.stamina / p.maxStamina * 100, 0, 100)}%`
    $('hp-text').textContent = `${fmt(p.hp)} / ${fmt(p.maxHp)}`
    $('mp-text').textContent = `${fmt(p.mp)} / ${fmt(p.maxMp)}`
    $('st-text').textContent = `${fmt(p.stamina)} / ${fmt(p.maxStamina)}`
    $('hud-level').textContent = p.level
    $('hud-name').textContent = p.appearance.name || 'Elian'
    $('hud-title').textContent = p.level >= 8 ? 'Guardián de Luma' : p.level >= 4 ? 'Caminante de Luma' : 'Novicio de Luma'
    $('xp-fill').style.width = `${clamp(p.xp / p.xpNext * 100, 0, 100)}%`
    $('xp-text').textContent = `${fmt(p.xp)} / ${fmt(p.xpNext)}`
    $('chip-gold').textContent = `◈ ${fmt(p.gold)}`
    const zone = this.game.currentZone()
    $('chip-zone').textContent = zone.name
    $('minimap-zone').textContent = zone.name.toUpperCase()
    const quest = this.game.questState()
    $('quest-chapter').textContent = quest.chapter
    $('quest-count').textContent = String(this.game.story.step + 1).padStart(2, '0')
    $('quest-title').textContent = quest.title
    $('quest-objective').textContent = quest.objective
    $('quest-progress').innerHTML = quest.dots.map((on) => `<span class="q-dot ${on ? 'on' : ''}"></span>`).join('')
    $('quick-weapon').textContent = p.weapon.name
    $('quick-skill').textContent = p.skill.name
    $('quick-potion').textContent = `Poción ×${p.inventory.pocion_vida || 0}`
    $('quick-companion').textContent = p.activeCreature ? CREATURES[p.activeCreature]?.name : (p.creatures.length ? 'Invocar criatura' : 'Sin vínculo')
    $('quick-slot')?.classList.remove('hidden')
    const potionBtn = document.querySelector('[data-quick="potion"]')
    potionBtn?.classList.toggle('cooling', !(p.inventory.pocion_vida > 0))
    const skillSlot = document.querySelector('[data-quick="skill"]')
    skillSlot?.classList.toggle('cooling', p.state.skillCd > 0)
    document.body.classList.toggle('low-hp', hpPct < 25 && !p.state.dead)

    const boss = this.game.boss
    if (boss && !boss.dead && !boss.dying && this.game.bossActive) {
      $('boss-hud').classList.remove('hidden')
      $('boss-fill').style.width = `${clamp(boss.hp / boss.maxHp * 100, 0, 100)}%`
      $('boss-text').textContent = `${fmt(boss.hp)} / ${fmt(boss.maxHp)}`
      $('boss-phase').textContent = ['FASE I', 'FASE II', 'FASE III'][boss.phase - 1] || 'FASE I'
    } else $('boss-hud').classList.add('hidden')

    const combo = this.game.comboCount
    if (combo > 1) {
      $('combo-display').classList.add('on')
      $('combo-count').textContent = combo
      $('combo-mult').textContent = (1 + (combo - 1) * .18).toFixed(1)
    } else $('combo-display').classList.remove('on')

    const target = this.game.activeInteract
    if (target && this.game.mode === 'playing') {
      const key = target.capture ? 'Y' : 'E'
      $('interact-text').textContent = target.label
      $('interact-prompt').querySelector('.interact-key').textContent = key
      $('interact-prompt').classList.remove('hidden')
      $('capture-prompt').classList.add('hidden')
    } else if (this.game.captureTarget && this.game.mode === 'playing') {
      $('capture-chance').textContent = `${Math.round(this.game.captureChance() * 100)}%`
      $('capture-prompt').classList.remove('hidden')
      $('interact-prompt').classList.add('hidden')
    } else {
      $('interact-prompt').classList.add('hidden')
      $('capture-prompt').classList.add('hidden')
    }

    if (now - this.lastMini > 160) {
      this.lastMini = now
      this.drawMinimap()
    }
  }

  drawMinimap() {
    const canvas = $('minimap')
    if (!canvas) return
    const g = this.game
    const p = g.player
    if (!p) return
    const size = canvas.width
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, size, size)
    const bg = ctx.createLinearGradient(0, 0, size, size)
    bg.addColorStop(0, '#16283c'); bg.addColorStop(1, '#091421')
    ctx.fillStyle = bg; ctx.fillRect(0, 0, size, size)
    const sx = size / 3600, sy = size / 2300
    const s = Math.min(sx, sy)
    const ox = (size - 3600 * s) / 2, oy = (size - 2300 * s) / 2
    if (g.worldSurface) {
      ctx.save(); ctx.globalAlpha = .85
      ctx.drawImage(g.worldSurface, 0, 0, 3600, 2300, ox, oy, 3600 * s, 2300 * s)
      ctx.restore()
    }
    ctx.strokeStyle = 'rgba(232,200,122,.12)'; ctx.lineWidth = 1
    ctx.strokeRect(ox, oy, 3600 * s, 2300 * s)
    // enemigos cercanos
    for (const e of g.enemies) {
      if (e.dead || e.dying) continue
      if (Math.hypot(e.x - p.x, e.y - p.y) > 720) continue
      ctx.fillStyle = e.isBoss ? '#ff5c8a' : '#e86b78'
      ctx.beginPath(); ctx.arc(ox + e.x * s, oy + e.y * s, e.isBoss ? 3 : 1.6, 0, TAU); ctx.fill()
    }
    // NPC
    for (const npc of g.npcs) {
      if (npc.hidden) continue
      ctx.fillStyle = 'rgba(232,200,122,.8)'
      ctx.beginPath(); ctx.arc(ox + npc.x * s, oy + npc.y * s, 2, 0, TAU); ctx.fill()
    }
    // objetivo
    const marker = g.questMarker()
    if (marker) {
      const t = performance.now() / 500
      const mx = ox + marker.x * s, my = oy + marker.y * s
      ctx.strokeStyle = '#ffe18c'; ctx.lineWidth = 1.5
      ctx.beginPath(); ctx.arc(mx, my, 5 + Math.sin(t) * 2, 0, TAU); ctx.stroke()
      ctx.fillStyle = '#ffe18c'; ctx.beginPath(); ctx.arc(mx, my, 2, 0, TAU); ctx.fill()
    }
    // jugador
    const px = ox + p.x * s, py = oy + p.y * s
    ctx.save(); ctx.translate(px, py); ctx.rotate(Math.atan2(p.facing.y, p.facing.x) + Math.PI / 2)
    ctx.fillStyle = '#8effe4'; ctx.shadowColor = '#8effe4'; ctx.shadowBlur = 7
    ctx.beginPath(); ctx.moveTo(0, -6); ctx.lineTo(4.5, 5); ctx.lineTo(0, 2.5); ctx.lineTo(-4.5, 5); ctx.closePath(); ctx.fill()
    ctx.restore()
    // niebla del mapa
    const fog = ctx.createRadialGradient(px, py, size * .05, px, py, size * .38)
    fog.addColorStop(0, 'rgba(3,8,16,0)'); fog.addColorStop(1, 'rgba(3,8,16,.18)')
    ctx.fillStyle = fog; ctx.fillRect(0, 0, size, size)
  }

  /* ============================== AVISOS ============================== */
  toast(message, opts = {}) {
    const stack = $('toast-stack')
    const el = document.createElement('div')
    el.className = `toast ${opts.type || ''}`
    el.innerHTML = `<span class="t-icon">${opts.icon || '✦'}</span><span>${message}</span>`
    stack.appendChild(el)
    const timer = setTimeout(() => {
      el.classList.add('out')
      setTimeout(() => el.remove(), 400)
      this.toastTimers.delete(timer)
    }, opts.duration || 3000)
    this.toastTimers.add(timer)
    while (stack.children.length > 5) stack.firstElementChild.remove()
  }

  chapter(chapter, title, duration = 4200) {
    const el = $('chapter-card')
    el.querySelector('span').textContent = chapter
    el.querySelector('b').textContent = title
    el.classList.add('on')
    clearTimeout(this._chapterTimer)
    this._chapterTimer = setTimeout(() => el.classList.remove('on'), duration)
  }

  region(name, subtitle) {
    const el = $('region-toast')
    el.querySelector('b').textContent = name
    el.querySelector('i').textContent = subtitle
    el.classList.add('on')
    clearTimeout(this._regionTimer)
    this._regionTimer = setTimeout(() => el.classList.remove('on'), 3200)
  }

  subtitle(text, duration = 3500) {
    const bar = $('subtitle-bar')
    $('subtitle-text').textContent = text
    bar.classList.remove('hidden')
    clearTimeout(this._subtitleTimer)
    this._subtitleTimer = setTimeout(() => bar.classList.add('hidden'), duration)
  }

  flashSave() {
    const el = $('save-state')
    if (!el) return
    el.innerHTML = '<span></span> Guardado ahora mismo'
    setTimeout(() => { el.innerHTML = '<span></span> Guardado automático activo' }, 2200)
  }

  /* ============================== DIÁLOGO ============================== */
  showDialogue(entries, onEnd = null) {
    if (!entries?.length) return
    this.currentDialogue = { entries, onEnd, index: 0 }
    this.game.mode = 'dialogue'
    $('dialogue-layer').classList.remove('hidden')
    this.renderDialogueLine()
  }

  renderDialogueLine() {
    const d = this.currentDialogue
    if (!d) return
    const entry = d.entries[d.index]
    if (!entry) return this.finishDialogue()
    $('dialogue-speaker').textContent = entry.speaker || 'NARRADOR'
    $('dialogue-role').textContent = entry.role || ''
    $('dialogue-text').textContent = entry.text
    const portrait = $('dialogue-portrait')
    this.drawSpeakerPortrait(portrait, entry.portrait || entry.speaker || 'narrator')
    const choices = $('dialogue-choices')
    choices.innerHTML = ''
    if (entry.choices?.length) {
      for (const choice of entry.choices) {
        const b = document.createElement('button')
        b.innerHTML = `<span>›</span>${choice.label}`
        b.addEventListener('click', (e) => {
          e.stopPropagation()
          this.game.audio.play('ui')
          choice.action?.()
          if (choice.after !== false) this.advanceDialogue()
        })
        choices.appendChild(b)
      }
    }
    $('dialogue-box').animate([{ opacity: .7, transform: 'translateY(4px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 170, easing: 'ease-out' })
  }

  advanceDialogue() {
    const d = this.currentDialogue
    if (!d) return
    const entry = d.entries[d.index]
    if (entry?.choices?.length) return
    d.index++
    if (d.index >= d.entries.length) this.finishDialogue()
    else this.renderDialogueLine()
  }

  finishDialogue() {
    const d = this.currentDialogue
    this.currentDialogue = null
    $('dialogue-layer').classList.add('hidden')
    if (this.game.mode === 'dialogue') this.game.mode = 'playing'
    this.game.input?.clear()
    d?.onEnd?.()
  }

  drawSpeakerPortrait(canvas, who) {
    const dpr = Math.min(2, window.devicePixelRatio || 1)
    const w = canvas.clientWidth || 180, h = canvas.clientHeight || 180
    if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr)
    }
    const ctx = canvas.getContext('2d')
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, w, h)
    const bg = ctx.createRadialGradient(w * .5, h * .4, 2, w * .5, h * .5, w * .7)
    bg.addColorStop(0, '#243b56'); bg.addColorStop(1, '#091321')
    ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h)
    ctx.strokeStyle = 'rgba(232,200,122,.12)'; ctx.lineWidth = 1
    ctx.beginPath(); ctx.arc(w * .5, h * .48, w * .42, 0, TAU); ctx.stroke()
    if (who === 'player' || who === 'Elian') {
      drawHeroPortrait(canvas, this.game.player?.appearance || APPEARANCE_DEFAULT, this.game.player?.weapon, this.game.player?.level)
      return
    }
    if (who === 'narrator' || who === 'NARRADOR') {
      glow(ctx, w / 2, h / 2, w * .4, 'rgba(232,200,122,.18)', .7)
      ctx.fillStyle = '#e8c87a'; ctx.font = `${w * .24}px Cinzel`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillText('✦', w / 2, h / 2)
      return
    }
    // Retrato genérico de PNJ
    const role = who === 'Elara' ? 'elara' : who === 'Rurik' ? 'rurik' : 'mirea'
    const skin = '#e9c1a3'
    ctx.save(); ctx.translate(w / 2, h * .92)
    ctx.fillStyle = role === 'elara' ? '#d5d1c0' : role === 'rurik' ? '#574131' : '#5b4059'
    ctx.beginPath(); ctx.moveTo(-w * .28, 0); ctx.quadraticCurveTo(-w * .34, -h * .4, -w * .17, -h * .56); ctx.quadraticCurveTo(0, -h * .63, w * .17, -h * .56); ctx.quadraticCurveTo(w * .34, -h * .4, w * .28, 0); ctx.closePath(); ctx.fill()
    ctx.strokeStyle = '#111724'; ctx.lineWidth = 2; ctx.stroke()
    // cabeza
    const hy = -h * .64
    ctx.fillStyle = skin; ctx.beginPath(); ctx.ellipse(0, hy, w * .13, h * .15, 0, 0, TAU); ctx.fill(); ctx.stroke()
    if (role === 'elara') {
      ctx.fillStyle = '#e9e6dc'; ctx.beginPath(); ctx.moveTo(-w * .13, hy - h * .03); ctx.quadraticCurveTo(-w * .1, hy - h * .2, w * .01, hy - h * .19); ctx.quadraticCurveTo(w * .13, hy - h * .18, w * .12, hy - h * .02); ctx.lineTo(w * .1, hy + h * .12); ctx.lineTo(w * .03, hy + h * .05); ctx.lineTo(-w * .05, hy + h * .13); ctx.closePath(); ctx.fill()
      glow(ctx, 0, hy - h * .18, w * .23, 'rgba(111,255,221,.2)', .6)
      ctx.strokeStyle = '#7fe6d3'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(0, hy - h * .18, w * .15, 0, TAU); ctx.stroke()
    } else if (role === 'rurik') {
      ctx.fillStyle = '#3a2a24'; ctx.beginPath(); ctx.moveTo(-w * .13, hy - h * .08); ctx.quadraticCurveTo(0, hy - h * .22, w * .13, hy - h * .08); ctx.lineTo(w * .1, hy); ctx.lineTo(-w * .1, hy); ctx.closePath(); ctx.fill()
      ctx.fillStyle = '#4b3225'; ctx.beginPath(); ctx.moveTo(-w * .1, hy + h * .05); ctx.quadraticCurveTo(0, hy + h * .2, w * .1, hy + h * .05); ctx.closePath(); ctx.fill()
    } else {
      ctx.fillStyle = '#4b3249'; ctx.beginPath(); ctx.moveTo(-w * .15, hy); ctx.quadraticCurveTo(-w * .12, hy - h * .22, 0, hy - h * .21); ctx.quadraticCurveTo(w * .13, hy - h * .21, w * .15, hy); ctx.lineTo(w * .08, hy + h * .08); ctx.lineTo(-w * .07, hy + h * .08); ctx.closePath(); ctx.fill()
    }
    ctx.fillStyle = '#273044'
    ellipse(ctx, -w * .04, hy, w * .012, h * .014); ctx.fill(); ellipse(ctx, w * .04, hy, w * .012, h * .014); ctx.fill()
    ctx.restore()
    const v = ctx.createRadialGradient(w / 2, h / 2, w * .18, w / 2, h / 2, w * .65)
    v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(2,6,13,.6)')
    ctx.fillStyle = v; ctx.fillRect(0, 0, w, h)
  }

  /* ============================== PAUSA / MENÚS ============================== */
  openPause(tab = 'status') {
    if (!this.game.player) return
    this.game.mode = 'paused'
    this.game.input.clear()
    $('pause-layer').classList.remove('hidden')
    $('menu-name').textContent = this.game.player.appearance.name
    $('menu-level').textContent = `Nivel ${this.game.player.level} · ${this.game.player.level >= 8 ? 'Guardián de Luma' : 'Caminante de Luma'}`
    drawHeroPortrait($('menu-portrait'), this.game.player.appearance, this.game.player.weapon, this.game.player.level)
    this.openTab(tab)
  }

  closePause() {
    if ($('pause-layer').classList.contains('hidden')) return
    $('pause-layer').classList.add('hidden')
    if (this.game.mode === 'paused') this.game.mode = 'playing'
    this.game.input.clear()
  }

  openTab(tab) {
    this.menuTab = tab
    document.querySelectorAll('#menu-tabs button').forEach((b) => b.classList.toggle('active', b.dataset.tab === tab))
    const content = $('menu-content')
    content.innerHTML = ''
    if (tab === 'status') this.renderStatus(content)
    else if (tab === 'equipment') this.renderEquipment(content)
    else if (tab === 'inventory') this.renderInventory(content)
    else if (tab === 'skills') this.renderSkills(content)
    else if (tab === 'bestiary') this.renderBestiary(content)
    else if (tab === 'quests') this.renderQuests(content)
    else if (tab === 'settings') this.renderSettings(content, true)
    this.game.audio.play('ui')
  }

  menuHead(title, subtitle, right = '') {
    return `<div class="menu-section-head"><div><span class="mini-label">${subtitle}</span><h2>${title}</h2></div>${right}</div>`
  }

  renderStatus(el) {
    const p = this.game.player
    const statNames = { vitality: 'VITALIDAD', endurance: 'RESISTENCIA', strength: 'FUERZA', defense: 'DEFENSA', speed: 'VELOCIDAD', intelligence: 'INTELIGENCIA', luck: 'SUERTE' }
    const max = 24
    el.innerHTML = `${this.menuHead('ESTADO DEL CAMINANTE', 'ALMA · NIVEL ' + p.level)}
      <div class="status-layout">
        <div>
          <div class="big-hero-card">
            <canvas id="status-portrait" width="94" height="94"></canvas>
            <div><h3>${p.appearance.name}</h3><span class="class-line">CAMINANTE DE LUMA · NIVEL ${p.level}</span>
              <div class="xl"><div><b>${fmt(p.hp)}</b><span>VIDA</span></div><div><b>${fmt(p.attackPower)}</b><span>ATAQUE</span></div><div><b>${fmt(p.defense)}</b><span>DEFENSA</span></div></div>
            </div>
          </div>
          <div class="stat-points"><span>Puntos de atributo disponibles</span><b>${p.statPoints}</b></div>
          ${Object.entries(p.attributes).map(([key, value]) => `
            <div class="stat-row"><span>${statNames[key]}</span><div class="stat-bar"><i style="width:${clamp(value / max * 100, 3, 100)}%"></i></div><b>${value}</b><button class="plus-btn" data-stat="${key}" ${p.statPoints ? '' : 'disabled'}>+</button></div>`).join('')}
        </div>
        <div>
          <div class="equip-group-title">EQUIPAMIENTO ACTUAL</div>
          <div class="equip-mini">
            <div class="equip-mini-row"><span class="ei">⚔</span><div><span>ARMA</span><b>${p.weapon.name}</b></div></div>
            <div class="equip-mini-row"><span class="ei">◇</span><div><span>ARMADURA</span><b>${p.armor.name}</b></div></div>
            <div class="equip-mini-row"><span class="ei">✦</span><div><span>ACCESORIO</span><b>${p.accessory?.name || 'Sin accesorio'}</b></div></div>
          </div>
          <div class="lore-box"><h4>CAMINO RECORRIDO</h4><p>${p.kills} criaturas derrotadas. ${p.bossKills} guardianes han caído. Cada paso deja una huella en el bosque.</p></div>
          <div class="equip-group-title">ESTADÍSTICAS DERIVADAS</div>
          <div class="equip-mini">
            <div class="equip-mini-row"><span class="ei">✧</span><div><span>CRÍTICO</span><b>${Math.round(p.critChance * 100)}%</b></div></div>
            <div class="equip-mini-row"><span class="ei">➤</span><div><span>VELOCIDAD</span><b>${Math.round(p.moveSpeed)}</b></div></div>
            <div class="equip-mini-row"><span class="ei">◈</span><div><span>ORO</span><b>${fmt(p.gold)}</b></div></div>
          </div>
        </div>
      </div>`
    drawHeroPortrait($('status-portrait'), p.appearance, p.weapon, p.level)
    el.querySelectorAll('[data-stat]').forEach((b) => b.addEventListener('click', () => {
      if (this.game.allocateStat(b.dataset.stat)) { this.game.audio.play('level'); this.openTab('status') }
    }))
  }

  renderEquipment(el) {
    const p = this.game.player
    const card = (item, selected, kind, wpn = false) => {
      const icon = wpn ? (item.type === 'Arco' ? '➶' : item.type === 'Bastón' ? '✦' : item.type === 'Daga' ? '◂' : item.type === 'Mandoble' ? '⚔' : item.type === 'Escudo' ? '⛨' : '†') : kind === 'armor' ? '◇' : '✧'
      const stats = wpn
        ? `<span>ATQ <b>${item.damage}</b></span><span>VEL <b>${item.speed.toFixed(2)}</b></span><span>ALC <b>${item.range}</b></span>`
        : `<span>DEF <b>${item.defense || 0}</b></span><span>VIDA <b>+${item.maxHp || 0}</b></span>${item.maxMp ? `<span>MANÁ <b>+${item.maxMp}</b></span>` : ''}${item.crit ? `<span>CRIT <b>+${Math.round(item.crit * 100)}%</b></span>` : ''}${item.speed ? `<span>VEL <b>+${item.speed}</b></span>` : ''}`
      return `<button class="equip-card ${selected ? 'selected' : ''}" data-equip="${kind}" data-id="${item.id}">
        ${selected ? '<span class="equipped-tag">EQUIPADO</span>' : ''}
        <span class="icon-box">${icon}</span><span><h4>${item.name}</h4><span class="rarity">${item.rarity}</span><div class="stats-inline">${stats}</div></span></button>`
    }
    el.innerHTML = `${this.menuHead('EQUIPO DEL CAMINANTE', 'FORJA TU ESTILO', `<span class="mini-label">◈ ${fmt(p.gold)} ORO</span>`)}
      <div class="equip-group-title">ARMAS · ${p.weaponIds.length}</div>
      <div class="equip-grid">${p.weaponIds.map((id) => card(WEAPONS[id], p.equipment.weapon === id, 'weapon', true)).join('')}</div>
      <div class="equip-group-title">ARMADURAS</div>
      <div class="equip-grid">${p.armorIds.map((id) => card(ARMORS[id], p.equipment.armor === id, 'armor')).join('')}</div>
      <div class="equip-group-title">ACCESORIOS</div>
      <div class="equip-grid">${p.accessoryIds.length ? p.accessoryIds.map((id) => card(ACCESSORIES[id], p.equipment.accessory === id, 'accessory')).join('') : '<p class="empty-note">Encuentra accesorios en cofres y ruinas.</p>'}</div>`
    el.querySelectorAll('[data-equip]').forEach((b) => b.addEventListener('click', () => {
      const kind = b.dataset.equip, id = b.dataset.id
      if (kind === 'weapon') p.equipWeapon(id)
      else if (kind === 'armor') p.equipArmor(id)
      else p.equipAccessory(id)
      this.game.audio.play('ui')
      this.game.updateAppearance()
      drawHeroPortrait($('menu-portrait'), p.appearance, p.weapon, p.level)
      this.renderEquipment(el)
    }))
  }

  renderInventory(el) {
    const p = this.game.player
    const entries = Object.entries(p.inventory).filter(([, qty]) => qty > 0)
    const rows = entries.map(([id, qty]) => {
      const item = ITEMS[id]
      if (!item) return ''
      const usable = item.use && item.use !== 'seal'
      return `<div class="item-row"><span class="item-icon" style="color:${item.color}">${this.itemGlyph(item.icon)}</span>
        <div class="item-copy"><h4>${item.name}</h4><p>${item.desc}</p></div><span class="qty">×${qty}</span>
        <button class="use-btn" data-use="${id}" ${usable ? '' : 'disabled'}>${usable ? 'USAR' : 'MISIÓN'}</button></div>`
    }).join('')
    el.innerHTML = `${this.menuHead('BOLSA DE VIAJE', 'OBJETOS Y RELIQUIAS', `<span class="mini-label">◈ ${fmt(p.gold)} ORO</span>`)}
      <div class="item-list">${rows || '<p class="empty-note">Tu bolsa está vacía. El bosque proveerá.</p>'}</div>
      <div class="lore-box"><h4>SELLOS DE LUMEN</h4><p>Debilita a una criatura hasta que su aura parpadee y pulsa Y para sellarla. Los sellos convierten a las bestias en compañeras.</p></div>`
    el.querySelectorAll('[data-use]').forEach((b) => b.addEventListener('click', () => {
      const result = this.game.player.useItem(b.dataset.use)
      if (result.ok) {
        this.game.audio.play(result.kind === 'mana' ? 'magic' : 'heal')
        this.toast(result.message, { icon: '✦', type: 'good' })
        this.renderInventory(el)
      } else this.toast(result.message, { icon: '!', type: 'bad' })
    }))
  }

  itemGlyph(icon) {
    return { potion: '⚗', mana: '◈', elixir: '✧', seal: '❖', flower: '✿', rune: 'ᛉ', fang: '⌁', shell: '◒', spirit: '☾' }[icon] || '◇'
  }

  renderSkills(el) {
    const p = this.game.player
    const all = Object.values(SKILLS)
    el.innerHTML = `${this.menuHead('HABILIDADES DE LUMA', 'ARTE DE COMBATE', '<span class="mini-label">X PARA USAR</span>')}
      ${all.map((s) => {
        const learned = p.skills.includes(s.id)
        return `<div class="skill-card ${p.activeSkill === s.id ? 'active' : ''} ${learned ? '' : 'locked'}">
          <span class="skill-icon">${s.icon === 'burst' ? '✹' : s.icon === 'moon' ? '☾' : '➤'}</span>
          <div><h4>${s.name}</h4><div class="skill-meta">${s.cost} ${s.resource === 'mana' ? 'MANÁ' : 'RESISTENCIA'} · RECARGA ${s.cooldown}s</div><p>${s.desc}</p></div>
          <div class="skill-action">${learned ? (p.activeSkill === s.id ? '<span class="mini-label">ACTIVA</span>' : `<button data-skill="${s.id}">EQUIPAR</button>`) : '<span class="mini-label">BLOQUEADA</span>'}</div></div>`
      }).join('')}
      <div class="lore-box"><h4>HABILIDADES Y CRIATURAS</h4><p>La tecla X ejecuta la habilidad activa. La tecla R invoca o cambia de criatura. Cada criatura aporta un estilo de apoyo distinto.</p></div>`
    el.querySelectorAll('[data-skill]').forEach((b) => b.addEventListener('click', () => {
      p.setActiveSkill(b.dataset.skill); this.game.audio.play('ui'); this.renderSkills(el)
    }))
  }

  renderBestiary(el) {
    const p = this.game.player
    const all = Object.values(CREATURES)
    el.innerHTML = `${this.menuHead('VÍNCULOS DE LUMA', 'CRIATURAS COLECCIONABLES', `<span class="mini-label">${p.creatures.length} / ${all.length} VÍNCULOS</span>`)}
      <div class="creature-grid">${all.map((c) => {
        const owned = p.creatures.includes(c.id)
        return `<div class="creature-card ${owned ? '' : 'locked'} ${p.activeCreature === c.id ? 'active' : ''}">
          <div class="c-sigil">${owned ? '❖' : '?'}</div><h4>${owned ? c.name : 'Criatura desconocida'}</h4><div class="c-title">${owned ? c.title : 'SÉLLALA PARA DESCUBRIRLA'}</div>
          <p>${owned ? c.desc : 'Debilita a una criatura del bosque y usa un Sello de Lumen para descubrir su vínculo.'}</p>
          ${owned ? `<div class="c-action">${p.activeCreature === c.id ? '<span class="mini-label">INVOCADA</span>' : `<button data-creature="${c.id}">INVOCAR</button>`}</div>` : ''}</div>`
      }).join('')}</div>
      <div class="lore-box"><h4>EL VÍNCULO</h4><p>Las criaturas no son armas. Luchan a tu lado porque eligieron caminar contigo. Cambia de compañera con R en cualquier momento.</p></div>`
    el.querySelectorAll('[data-creature]').forEach((b) => b.addEventListener('click', () => {
      p.activeCreature = b.dataset.creature
      this.game.summonCompanion()
      this.game.audio.play('seal')
      this.renderBestiary(el)
    }))
  }

  renderQuests(el) {
    const g = this.game
    const current = g.story.step
    el.innerHTML = `${this.menuHead('DIARIO DE CAMINANTE', 'HISTORIA Y MEMORIAS', `<span class="mini-label">CAPÍTULO ${Math.min(6, current + 1)}</span>`)}
      ${QUESTS.map((q, i) => {
        const state = i < current ? 'done' : i === current ? 'active' : 'locked'
        if (i > current + 1) return ''
        return `<div class="quest-entry ${state}"><div class="q-head"><div><div class="q-chapter">${q.chapter.toUpperCase()}</div><h4>${q.title}</h4></div><span class="q-state ${state === 'done' ? 'done' : ''}">${state === 'done' ? 'COMPLETADA' : state === 'active' ? 'EN CURSO' : 'PENDIENTE'}</span></div>
          <p>${q.summary}</p></div>`
      }).join('')}
      ${LORE.slice(0, Math.min(LORE.length, 1 + Math.floor(current / 2))).map((l) => `<div class="lore-box"><h4>${l.title.toUpperCase()}</h4><p>${l.text}</p></div>`).join('')}`
  }

  renderSettings(el, inMenu = false) {
    const s = this.game.settings
    el.innerHTML = `${inMenu ? this.menuHead('AJUSTES', 'AFINA TU EXPERIENCIA') : ''}
      <div class="settings-list">
        <div class="setting-row"><div><b>Música</b><span>Melodías originales del bosque, la aldea y el santuario.</span></div><div class="setting-control"><input type="range" min="0" max="100" value="${Math.round(s.music * 100)}" data-setting="music"><output>${Math.round(s.music * 100)}%</output></div></div>
        <div class="setting-row"><div><b>Efectos de sonido</b><span>Golpes, magia, pasos y susurros de las criaturas.</span></div><div class="setting-control"><input type="range" min="0" max="100" value="${Math.round(s.sfx * 100)}" data-setting="sfx"><output>${Math.round(s.sfx * 100)}%</output></div></div>
        <div class="setting-row"><div><b>Silenciar todo</b><span>Desactiva por completo el audio del juego.</span></div><div class="setting-control"><button class="toggle ${s.muted ? 'on' : ''}" data-toggle="muted"></button></div></div>
        <div class="setting-row"><div><b>Controles táctiles</b><span>Muestra la cruceta y los botones en pantalla.</span></div><div class="setting-control"><button class="toggle ${s.touch ? 'on' : ''}" data-toggle="touch"></button></div></div>
        <div class="setting-row"><div><b>Tamaño de controles</b><span>Ajusta la cruceta y los botones para tu pulgar.</span></div><div class="setting-control"><input type="range" min="70" max="130" value="${Math.round(s.touchScale * 100)}" data-setting="touchScale"><output>${Math.round(s.touchScale * 100)}%</output></div></div>
        <div class="setting-row"><div><b>Opacidad táctil</b><span>Haz los controles más discretos sobre la acción.</span></div><div class="setting-control"><input type="range" min="30" max="100" value="${Math.round(s.touchOpacity * 100)}" data-setting="touchOpacity"><output>${Math.round(s.touchOpacity * 100)}%</output></div></div>
        <div class="setting-row"><div><b>Distribución</b><span>Cambia los controles al lado contrario para zurdos.</span></div><div class="setting-control"><div class="segmented"><button data-layout="right" class="${s.leftHanded ? '' : 'active'}">DIESTRO</button><button data-layout="left" class="${s.leftHanded ? 'active' : ''}">ZURDO</button></div><button class="btn btn-ghost" data-edit-touch style="min-height:28px;font-size:7px;padding:0 9px">MOVER</button></div></div>
        <div class="setting-row"><div><b>Vibración</b><span>Respuesta háptica en ataques y golpes críticos.</span></div><div class="setting-control"><button class="toggle ${s.vibration ? 'on' : ''}" data-toggle="vibration"></button></div></div>
        <div class="setting-row"><div><b>Calidad gráfica</b><span>Auto se adapta al dispositivo. Alto añade más partículas y resolución.</span></div><div class="setting-control"><div class="segmented">${['auto', 'high', 'low'].map((q) => `<button data-quality="${q}" class="${s.quality === q ? 'active' : ''}">${q.toUpperCase()}</button>`).join('')}</div></div></div>
        <div class="setting-row"><div><b>Pantalla completa</b><span>Sumérgete en Luma. Disponible en navegadores compatibles.</span></div><div class="setting-control"><button class="toggle ${document.fullscreenElement ? 'on' : ''}" data-toggle="fullscreen"></button></div></div>
      </div>
      <div class="settings-note"><b>Mando Bluetooth:</b> conecta el mando antes de entrar al juego. Se detecta automáticamente y usa la disposición estándar (A atacar, B esquivar, X habilidad, Y interactuar, L/R cambiar arma/criatura).</div>
      <div class="settings-note"><b>Nota técnica:</b> La música y todos los efectos se sintetizan en tiempo real con WebAudio. No hay pistas ni imágenes externas.</div>`
    this.bindSettings(el, inMenu)
  }

  bindSettings(el, inMenu) {
    const s = this.game.settings
    el.querySelectorAll('[data-setting]').forEach((input) => {
      input.addEventListener('input', () => {
        const key = input.dataset.setting
        const value = Number(input.value) / 100
        if (key === 'touchScale') s.touchScale = value
        else if (key === 'touchOpacity') s.touchOpacity = value
        else s[key] = value
        input.parentElement.querySelector('output').textContent = `${Math.round(value * 100)}%`
        this.game.applySettings()
      })
    })
    el.querySelectorAll('[data-toggle]').forEach((b) => b.addEventListener('click', () => {
      const key = b.dataset.toggle
      if (key === 'fullscreen') {
        if (document.fullscreenElement) document.exitFullscreen?.()
        else document.documentElement.requestFullscreen?.().catch(() => this.toast('Pantalla completa no disponible en este navegador', { type: 'bad', icon: '!' }))
        return
      }
      s[key] = !s[key]
      if (key === 'touch') this.refreshTouchVisibility()
      this.game.applySettings()
      this.renderSettings(el, inMenu)
    }))
    el.querySelectorAll('[data-layout]').forEach((b) => b.addEventListener('click', () => {
      s.leftHanded = b.dataset.layout === 'left'
      document.body.classList.toggle('left-handed', s.leftHanded)
      this.game.applySettings()
      this.renderSettings(el, inMenu)
    }))
    el.querySelectorAll('[data-quality]').forEach((b) => b.addEventListener('click', () => {
      s.quality = b.dataset.quality
      this.game.applySettings()
      this.renderSettings(el, inMenu)
    }))
    el.querySelector('[data-edit-touch]')?.addEventListener('click', () => this.startTouchEdit(inMenu))
  }

  openSettings(source = 'pause') {
    this.settingsSource = source
    this.game.audio.play('ui')
    if (source === 'title') {
      $('settings-layer').classList.remove('hidden')
      const content = $('settings-content')
      content.innerHTML = ''
      this.renderSettings(content, false)
    } else {
      this.openPause('settings')
    }
  }

  closeSettings() {
    $('settings-layer').classList.add('hidden')
    if (this.settingsSource === 'title') this.game.mode = 'title'
  }

  startTouchEdit(inMenu) {
    this.editingTouch = true
    this.game.settings.touch = true
    this.refreshTouchVisibility()
    if (inMenu) {
      $('pause-layer').classList.add('hidden')
      this.game.mode = 'paused'
    }
    document.body.classList.add('touch-editing')
    this.toast('Arrastra la cruceta y los botones. Pulsa LISTO.', { icon: '✥', duration: 5000 })
    let done = $('touch-edit-done')
    if (!done) {
      done = document.createElement('button')
      done.id = 'touch-edit-done'
      done.className = 'btn btn-primary'
      done.style.cssText = 'position:absolute;z-index:90;top:calc(14px + var(--safe-top));left:50%;transform:translateX(-50%);pointer-events:auto'
      done.textContent = 'LISTO'
      document.getElementById('app').appendChild(done)
      done.addEventListener('click', () => this.finishTouchEdit(inMenu))
    }
    done.classList.remove('hidden')
    this.dragHandlers = []
    for (const [id, keyX, keyY] of [['joystick-zone', 'joyX', 'joyY'], ['touch-actions', 'actX', 'actY']]) {
      const el = $(id)
      let startX = 0, startY = 0, baseX = this.touchOffsets[keyX], baseY = this.touchOffsets[keyY], active = false
      const down = (e) => {
        if (!this.editingTouch) return
        active = true
        startX = e.clientX; startY = e.clientY
        baseX = this.touchOffsets[keyX]; baseY = this.touchOffsets[keyY]
        el.setPointerCapture?.(e.pointerId)
        e.preventDefault(); e.stopPropagation()
      }
      const move = (e) => {
        if (!active) return
        this.touchOffsets[keyX] = baseX + e.clientX - startX
        this.touchOffsets[keyY] = baseY + e.clientY - startY
        this.applyTouchOffsets()
        e.preventDefault(); e.stopPropagation()
      }
      const up = () => { active = false; this.saveSettings() }
      el.addEventListener('pointerdown', down)
      el.addEventListener('pointermove', move)
      el.addEventListener('pointerup', up)
      el.addEventListener('pointercancel', up)
      this.dragHandlers.push({ el, down, move, up })
    }
  }

  finishTouchEdit(inMenu) {
    this.editingTouch = false
    document.body.classList.remove('touch-editing')
    $('touch-edit-done')?.classList.add('hidden')
    for (const h of this.dragHandlers || []) {
      h.el.removeEventListener('pointerdown', h.down)
      h.el.removeEventListener('pointermove', h.move)
      h.el.removeEventListener('pointerup', h.up)
      h.el.removeEventListener('pointercancel', h.up)
    }
    this.dragHandlers = []
    this.saveSettings()
    if (inMenu) this.openPause('settings')
    else this.showTitle()
  }

  applyTouchOffsets() {
    const rs = document.documentElement.style
    rs.setProperty('--joy-dx', `${this.touchOffsets.joyX}px`)
    rs.setProperty('--joy-dy', `${this.touchOffsets.joyY}px`)
    rs.setProperty('--act-dx', `${this.touchOffsets.actX}px`)
    rs.setProperty('--act-dy', `${this.touchOffsets.actY}px`)
  }

  /* ============================== CONTROLES TÁCTILES ============================== */
  bindTouchControls() {
    const zone = $('joystick-zone')
    const knob = $('joystick-knob')
    let pointerId = null
    let center = { x: 0, y: 0 }
    const update = (e) => {
      const radius = zone.clientWidth * .4
      let dx = e.clientX - center.x, dy = e.clientY - center.y
      const len = Math.hypot(dx, dy)
      if (len > radius) { dx = dx / len * radius; dy = dy / len * radius }
      knob.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`
      this.game.input.setTouchMove(dx / radius, dy / radius)
    }
    zone.addEventListener('pointerdown', (e) => {
      if (this.editingTouch) return
      pointerId = e.pointerId
      const rect = zone.getBoundingClientRect()
      center = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
      zone.setPointerCapture?.(e.pointerId)
      update(e); e.preventDefault()
    })
    zone.addEventListener('pointermove', (e) => { if (e.pointerId === pointerId && !this.editingTouch) { update(e); e.preventDefault() } })
    const release = (e) => {
      if (e.pointerId !== pointerId) return
      pointerId = null
      knob.style.transform = 'translate(-50%, -50%)'
      this.game.input.setTouchMove(0, 0)
    }
    zone.addEventListener('pointerup', release)
    zone.addEventListener('pointercancel', release)
    document.querySelectorAll('[data-touch]').forEach((b) => {
      const action = b.dataset.touch
      const press = (e) => {
        if (this.editingTouch) return
        e.preventDefault(); e.stopPropagation()
        b.classList.add('pressed')
        this.game.audio.init()
        this.game.input.touchAction(action, true)
      }
      const releaseBtn = (e) => {
        e.preventDefault()
        b.classList.remove('pressed')
        this.game.input.touchAction(action, false)
      }
      b.addEventListener('pointerdown', press)
      b.addEventListener('pointerup', releaseBtn)
      b.addEventListener('pointercancel', releaseBtn)
      b.addEventListener('pointerleave', releaseBtn)
      b.addEventListener('contextmenu', (e) => e.preventDefault())
    })
  }

  refreshTouchVisibility() {
    const s = this.game.settings
    const touchAvailable = navigator.maxTouchPoints > 0 || 'ontouchstart' in window || window.innerWidth < 900
    const show = (s.touch && touchAvailable) || window.innerWidth < 900
    document.body.classList.toggle('touch-active', show && this.game.mode !== 'title' && this.game.mode !== 'creator')
    if (this.game.mode === 'title' || this.game.mode === 'creator') document.body.classList.remove('touch-active')
    $('touch-ui').classList.toggle('hidden', !show)
    document.documentElement.style.setProperty('--touch-scale', s.touchScale)
    document.documentElement.style.setProperty('--touch-opacity', s.touchOpacity)
    document.body.classList.toggle('left-handed', s.leftHanded)
    this.applyTouchOffsets()
  }

  /* ============================== FINAL / DERROTA ============================== */
  showEnding(stats) {
    $('ending-screen').classList.remove('hidden')
    $('ending-stats').innerHTML = stats.map((s) => `<div><b>${s.value}</b><span>${s.label}</span></div>`).join('')
    this.game.audio.setMode('victory')
  }

  hideEnding() { $('ending-screen').classList.add('hidden') }

  showGameOver() {
    $('gameover-screen').classList.remove('hidden')
    $('hud').classList.add('hidden')
    this.game.audio.setMode('title')
  }

  hideGameOver() { $('gameover-screen').classList.add('hidden') }

  /* ============================== AJUSTES PERSISTENTES ============================== */
  loadSettings() {
    try {
      const raw = localStorage.getItem(SETTINGS_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        this.game.settings = { ...this.game.settings, ...parsed }
        this.touchOffsets = { ...this.touchOffsets, ...(parsed.touchOffsets || {}) }
      }
    } catch {}
    this.applyTouchOffsets()
    this.game.applySettings(false)
  }

  saveSettings() {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify({ ...this.game.settings, touchOffsets: this.touchOffsets }))
    } catch {}
  }
}
