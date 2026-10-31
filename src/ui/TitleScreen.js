import { QUESTS } from '../data/quests.js'
import { formatTime } from '../utils/math.js'

export class TitleScreen {
  constructor(ui) {
    this.ui = ui
    this.game = ui.game
    this.el = null
    this.selected = 0
  }

  show(state = {}) {
    this.ui.hideDialogue()
    this.ui.stopHUD()
    this.ui.clearScreens()
    const save = state.save
    const q = save?.questTitle || QUESTS[state.questId]?.title
    const resume = save ? `<button data-action="continue" class="play-new selected" aria-label="Continuar partida"><span>Continuar</span><small>${this.esc(save.name)} · Nivel ${save.level} · ${formatTime(save.playTime || 0)}</small></button>` : ''
    this.el = document.createElement('div')
    this.el.className = 'title-screen'
    this.el.innerHTML = `
      <div class="title-top">
        <div class="eyebrow left">UNA LEYENDA ORIGINAL DE IA GAME LAB</div>
        <div class="title-edition"><b>EDICIÓN</b> DEL VELO<br>ANDROID · NAVEGADOR<br>ESPAÑOL (ES)</div>
      </div>
      <div class="title-main">
        <div class="game-logo">
          <div class="logo-kicker">RPG DE ACCIÓN · FANTASÍA ÉPICA</div>
          <h1><span class="gold-text">La Espada</span><span class="gold-text small">Celestial</span></h1>
          <div class="logo-divider"><span class="line"></span><span class="diamond"></span><span class="sub">El Velo se está rompiendo</span></div>
        </div>
        <p class="title-tagline">Tres reinos. Ocho criaturas legendarias. Un nombre que el mundo ha olvidado. Despierta, forja vínculos y decide si la historia merece un final.</p>
        <div class="title-menu" id="title-menu">
          ${resume}
          <button data-action="new" ${!save ? 'class="play-new selected"' : ''} aria-label="Nueva partida · Start Game"><span>Nueva partida</span><small>Forja tu nombre y tu juramento</small></button>
          <button data-action="help"><span>Cómo jugar</span><small>Controles, combate y resonancia</small></button>
          <button data-action="settings"><span>Ajustes</span><small>Sonido, accesibilidad y rendimiento</small></button>
          <button data-action="credits"><span>Créditos</span><small>El equipo detrás del Velo</small></button>
        </div>
      </div>
      <div class="title-bottom">
        <div class="title-footer">FANTASÍA MEDIEVAL CINEMATOGRÁFICA · PERSONAJE Y CRIATURAS ORIGINALES<br>MUNDO ABIERTO POR REGIONES · COMBATE DE ACCIÓN · COLECCIÓN DE CRIATURAS</div>
        <div class="title-controls">
          <button data-action="sound" id="title-sound">${this.game.settings.muted ? '🔇' : '🔊'} Sonido</button>
          <button data-action="fullscreen" id="title-fs">⛶ Pantalla completa</button>
          <button data-action="help">?</button>
        </div>
      </div>
      <div class="title-build">v1.0 · BUILD 2026.10<br>${save ? `PARTIDA GUARDADA · ${q || 'El despertar'}` : 'SIN PARTIDA GUARDADA'}</div>
      <div class="title-scroll-hint">ELIGE TU CAMINO</div>
    `
    this.ui.uiEl.appendChild(this.el)
    this.ui.uiEl.classList.remove('hidden')
    this.el.addEventListener('click', e => {
      const btn = e.target.closest('[data-action]')
      if (!btn) return
      this.ui.game.audio?.sfx('ui')
      this.action(btn.dataset.action)
    })
    this.el.addEventListener('pointerover', e => {
      const btn = e.target.closest('.title-menu button')
      if (btn) { this.ui.game.audio?.sfx('hover'); this.setSelected(Array.from(btn.parentElement.children).indexOf(btn)) }
    })
    this.selected = save ? 0 : 0
    setTimeout(() => this.focus(), 60)
    this.ui.game.setTitleScene?.()
  }

  action(a) {
    switch (a) {
      case 'continue': this.game.continueGame(); break
      case 'new': this.game.beginCharacterCreation(); break
      case 'help': this.ui.showHelp('title'); break
      case 'settings': this.ui.openSettings('title'); break
      case 'credits': this.ui.showCredits('title'); break
      case 'sound':
        this.game.settings.muted = !this.game.settings.muted
        this.game.applySettings()
        document.getElementById('title-sound').innerHTML = `${this.game.settings.muted ? '🔇' : '🔊'} Sonido`
        break
      case 'fullscreen':
        if (!document.fullscreenElement) document.documentElement.requestFullscreen?.().catch(() => {})
        else document.exitFullscreen?.()
        break
    }
  }

  focus() {
    const buttons = this.el?.querySelectorAll('#title-menu button') || []
    buttons[this.selected]?.focus({ preventScroll: true })
  }

  setSelected(i) {
    this.selected = Math.max(0, Math.min(i, (this.el?.querySelectorAll('#title-menu button').length || 1) - 1))
    this.el?.querySelectorAll('#title-menu button').forEach((b, j) => b.classList.toggle('selected', j === this.selected))
  }

  key(e) {
    if (!this.el) return
    const buttons = Array.from(this.el.querySelectorAll('#title-menu button'))
    if (e.code === 'ArrowDown') { this.setSelected((this.selected + 1) % buttons.length); this.focus(); return true }
    if (e.code === 'ArrowUp') { this.setSelected((this.selected - 1 + buttons.length) % buttons.length); this.focus(); return true }
    if (e.code === 'Enter' || e.code === 'Space') { buttons[this.selected]?.click(); return true }
    return false
  }

  hide() {
    this.el?.classList.add('out')
    this.el?.remove()
    this.el = null
  }

  esc(s = '') { return this.ui.escape(s) }
}
