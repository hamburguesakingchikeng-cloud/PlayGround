import { JURAMENTOS, DIFFICULTIES, STARTING_EQUIPMENT } from '../data/items.js'
import { basePlayerStats, derive, ATTRS } from '../core/stats.js'

const NAMES = ['Aurel', 'Sael', 'Nerida', 'Kael', 'Yara', 'Iven', 'Mirea', 'Thane', 'Elara', 'Riven', 'Sora', 'Dorian', 'Nima', 'Vael', 'Liora', 'Ashen']
const HAIR_STYLES = [['short', 'Corto'], ['long', 'Largo'], ['braid', 'Trenza'], ['twintails', 'Coletas'], ['bun', 'Moño']]
const ACCESSORIES = [['none', 'Ninguno'], ['circlet', 'Diadema'], ['scarf', 'Bufanda'], ['bandana', 'Cinta']]
const HAIR_COLORS = [0x2a211d, 0x5e3a24, 0x9a6439, 0xc8b28b, 0xe4ded1, 0x7e3d35, 0x4a3d6b, 0x2f5d55]
const SKINS = [0xf0c9a0, 0xd9a878, 0xb77a52, 0x8b5738, 0x633f2c]
const OUTFITS = [0x45526d, 0x5c3b46, 0x3f5b4a, 0x6b573b, 0x3c4865, 0x6b3d3d]
const TRIMS = [0xe4c27c, 0x9fe0d4, 0xd39a8e, 0xb8c98b, 0x9eb9e8, 0xe0b17c]

export class CreationScreen {
  constructor(ui) {
    this.ui = ui
    this.game = ui.game
    this.el = null
    this.draft = null
    this.nameEl = null
  }

  defaultDraft() {
    return {
      name: 'Aurel',
      className: 'filo',
      difficulty: 'aventura',
      appearance: {
        skin: SKINS[1], hairColor: HAIR_COLORS[1], hairStyle: 'short', outfit: OUTFITS[0],
        trim: TRIMS[0], accessory: 'none', face: 0
      },
      stats: basePlayerStats(),
      freePoints: 5
    }
  }

  show() {
    this.draft = this.defaultDraft()
    this.ui.clearScreens()
    this.el = document.createElement('div')
    this.el.className = 'creation-screen'
    this.el.innerHTML = `
      <div class="creation-left">
        <div class="creation-heading">
          <div class="eyebrow left">PERSONAJE · JUGADOR CERO</div>
          <h2 id="creation-name-display">${this.draft.name}</h2>
          <p>El Velo no recuerda tu rostro. Tú decidirás cuál merece recordar.</p>
        </div>
        <div class="creation-preview">
          <div>
            <div class="preview-badge"><span class="dot"></span><span>VISTA PREVIA EN TIEMPO REAL · ARRASTRA PARA GIRAR</span></div>
            <div class="creation-stats-float" id="creation-stats"></div>
          </div>
        </div>
      </div>
      <div class="creation-panel">
        <div class="creation-top"><h3>Forja tu leyenda</h3><div class="creation-steps"><span class="on"></span><span class="on"></span><span></span><span></span></div></div>
        <div class="creation-body scroll" id="creation-body"></div>
        <div class="creation-footer">
          <button class="ghost-btn" data-action="back">◂ Volver</button>
          <button class="gold-btn primary" data-action="start" id="creation-start">Forjar leyenda ▸</button>
        </div>
      </div>
    `
    this.ui.uiEl.appendChild(this.el)
    this.el.addEventListener('click', e => this.onClick(e))
    this.el.addEventListener('input', e => this.onInput(e))
    this.el.addEventListener('pointermove', e => {
      if (e.buttons & 1) this.game.rotateCreationPreview?.(e.movementX * .008)
    })
    document.addEventListener('keydown', this._key = e => {
      if (e.code === 'Enter' && e.target?.tagName !== 'INPUT') { e.preventDefault(); this.start() }
      if (e.code === 'Escape') this.back()
    })
    this.render()
    this.applyPreview()
  }

  render() {
    if (!this.el) return
    const body = this.el.querySelector('#creation-body')
    const scroll = body.scrollTop
    const s = this.draft
    const bonus = JURAMENTOS[s.className].bonus
    const total = {}
    for (const k of Object.keys(s.stats)) total[k] = s.stats[k] + (bonus[k] || 0)
    const d = derive(total, STARTING_EQUIPMENT, 1)
    this.el.querySelector('#creation-name-display').textContent = s.name || 'Sin nombre'
    this.el.querySelector('#creation-stats').innerHTML = [
      ['♥', 'Vida', Math.round(d.hp)], ['✦', 'Maná', Math.round(d.mp)], ['⚔', 'Ataque', Math.round(d.attack)],
      ['◈', 'Reducción', `${Math.round(d.reduction * 100)}%`], ['➤', 'Velocidad', d.speed.toFixed(1)], ['✧', 'Crítico', `${Math.round(d.crit * 100)}%`]
    ].map(([i, n, v]) => `<div class="stat-chip"><span>${i}</span><span>${n}</span><b>${v}</b></div>`).join('')

    body.innerHTML = `
      <div class="field">
        <label for="player-name">Nombre del protagonista <b id="name-count">${s.name.length}/18</b></label>
        <div style="display:flex;gap:7px">
          <input id="player-name" class="name-input" maxlength="18" value="${this.ui.escape(s.name)}" placeholder="Escribe tu nombre" autocomplete="off" spellcheck="false" />
          <button class="ghost-btn" data-action="random-name" style="padding:0 12px;white-space:nowrap">Aleatorio</button>
        </div>
        <div class="creation-lore">«Los nombres son la primera cosa que el Velo devora. Elegir uno es un acto de rebeldía.» — Anciana Iria</div>
      </div>

      <div class="field">
        <span class="field-label">Juramento <b>define tu habilidad y tus estadísticas</b></span>
        <div class="option-row">
          ${Object.entries(JURAMENTOS).map(([id, j]) => `
            <button class="juramento-card ${s.className === id ? 'on' : ''}" data-opt="className" data-val="${id}">
              <div class="j-icon">${j.icon}</div>
              <h4>${j.name}</h4>
              <p>${j.desc}</p>
              <div class="j-bonus">${Object.entries(j.bonus).map(([k, v]) => `${ATTRS.find(a => a.key === k)?.name || k} +${v}`).join(' · ')}</div>
            </button>`).join('')}
        </div>
      </div>

      <div class="field">
        <span class="field-label">Rasgos del rostro</span>
        <div class="option-row">
          ${[0, 1, 2].map(i => `<button class="option-btn ${s.appearance.face === i ? 'on' : ''}" data-opt="face" data-val="${i}">Rostro ${roman(i + 1)}<small>${['Sereno', 'Afilado', 'Cálido'][i]}</small></button>`).join('')}
        </div>
      </div>

      <div class="field">
        <span class="field-label">Cabello <b>${HAIR_STYLES.find(h => h[0] === s.appearance.hairStyle)?.[1] || ''}</b></span>
        <div class="option-row">
          ${HAIR_STYLES.map(([id, n]) => `<button class="option-btn ${s.appearance.hairStyle === id ? 'on' : ''}" data-opt="hairStyle" data-val="${id}">${n}</button>`).join('')}
        </div>
      </div>

      <div class="field">
        <span class="field-label">Color de pelo</span>
        <div class="swatches">
          ${HAIR_COLORS.map(c => `<button class="swatch ${s.appearance.hairColor === c ? 'on' : ''}" data-color="hairColor" data-val="${c}" style="background:#${c.toString(16).padStart(6, '0')}" aria-label="Color de pelo"></button>`).join('')}
        </div>
      </div>

      <div class="field">
        <span class="field-label">Tono de piel</span>
        <div class="swatches">
          ${SKINS.map(c => `<button class="swatch ${s.appearance.skin === c ? 'on' : ''}" data-color="skin" data-val="${c}" style="background:#${c.toString(16).padStart(6, '0')}" aria-label="Tono de piel"></button>`).join('')}
        </div>
      </div>

      <div class="field">
        <span class="field-label">Vestimenta <b>el color tiñe tu armadura</b></span>
        <div class="swatches">
          ${OUTFITS.map(c => `<button class="swatch ${s.appearance.outfit === c ? 'on' : ''}" data-color="outfit" data-val="${c}" style="background:#${c.toString(16).padStart(6, '0')}" aria-label="Color de vestimenta"></button>`).join('')}
        </div>
      </div>

      <div class="field">
        <span class="field-label">Accesorio</span>
        <div class="option-row four">
          ${ACCESSORIES.map(([id, n]) => `<button class="option-btn ${s.appearance.accessory === id ? 'on' : ''}" data-opt="accessory" data-val="${id}">${n}</button>`).join('')}
        </div>
      </div>

      <div class="field">
        <div class="field-label">Atributos <b>${s.freePoints} punto${s.freePoints === 1 ? '' : 's'} libre${s.freePoints === 1 ? '' : 's'}</b></div>
        <div class="points-note"><span>Reparte tus puntos. Cada atributo tiene un efecto real en combate.</span><b>${s.freePoints}</b></div>
        ${ATTRS.map(a => {
          const val = s.stats[a.key] + (bonus[a.key] || 0)
          return `<div class="attr-row"><span class="an" title="${a.desc}">${a.name}</span><span class="av">${val}</span><button class="plus" data-plus="${a.key}" ${s.freePoints <= 0 ? 'disabled' : ''} aria-label="Aumentar ${a.name}">+</button></div>`
        }).join('')}
      </div>

      <div class="field">
        <span class="field-label">Dificultad</span>
        <div class="option-row">
          ${Object.entries(DIFFICULTIES).map(([id, df]) => `<button class="option-btn ${s.difficulty === id ? 'on' : ''}" data-opt="difficulty" data-val="${id}">${df.name}<small>${df.desc}</small></button>`).join('')}
        </div>
      </div>

      <div class="field" style="margin-bottom:0">
        <div class="field-label">Habilidad de juramento <b>${JURAMENTOS[s.className].skillName}</b></div>
        <div class="creation-lore">${JURAMENTOS[s.className].skillDesc}</div>
      </div>
    `
    // Mantener el foco en el nombre si el usuario está escribiendo
    const active = document.activeElement
    if (active?.id === 'player-name') {
      const input = body.querySelector('#player-name')
      if (input) { input.focus(); input.setSelectionRange(input.value.length, input.value.length) }
    }
    body.scrollTop = scroll
    this.applyPreview()
  }

  onClick(e) {
    const plus = e.target.closest('[data-plus]')
    if (plus) {
      if (this.draft.freePoints <= 0) return
      this.draft.stats[plus.dataset.plus]++
      this.draft.freePoints--
      this.game.audio?.sfx('ui')
      this.render()
      return
    }
    const color = e.target.closest('[data-color]')
    if (color) {
      this.draft.appearance[color.dataset.color] = Number(color.dataset.val)
      this.game.audio?.sfx('ui')
      this.render()
      return
    }
    const opt = e.target.closest('[data-opt]')
    if (opt) {
      const field = opt.dataset.opt
      const val = opt.dataset.val
      if (field === 'className') this.draft.className = val
      else if (field === 'difficulty') this.draft.difficulty = val
      else if (field === 'face') this.draft.appearance.face = Number(val)
      else this.draft.appearance[field] = val
      this.game.audio?.sfx('ui')
      this.render()
      return
    }
    const action = e.target.closest('[data-action]')?.dataset.action
    if (action === 'random-name') {
      this.draft.name = NAMES[Math.floor(Math.random() * NAMES.length)]
      this.render()
      this.el.querySelector('#player-name')?.focus()
    }
    if (action === 'back') this.back()
    if (action === 'start') this.start()
  }

  onInput(e) {
    if (e.target.id !== 'player-name') return
    this.draft.name = e.target.value.replace(/[<>]/g, '').slice(0, 18)
    this.el.querySelector('#creation-name-display').textContent = this.draft.name || 'Sin nombre'
    const c = this.el.querySelector('#name-count')
    if (c) c.textContent = `${this.draft.name.length}/18`
  }

  applyPreview() {
    this.game.setCreationPreview?.(this.draft)
  }

  start() {
    const name = this.draft.name.trim()
    if (name.length < 2) {
      this.ui.toast('Escribe un nombre de al menos dos letras.', '⚠')
      this.el.querySelector('#player-name')?.focus()
      this.game.audio?.sfx('error')
      return
    }
    this.draft.name = name
    this.game.audio?.sfx('levelup')
    this.game.startNewGame(structuredClone(this.draft))
  }

  back() {
    this.hide()
    this.game.returnToTitle()
  }

  refresh() { this.render() }

  hide() {
    if (this._key) document.removeEventListener('keydown', this._key)
    this.el?.remove()
    this.el = null
  }
}

const roman = n => ['I', 'II', 'III', 'IV'][n] || n
