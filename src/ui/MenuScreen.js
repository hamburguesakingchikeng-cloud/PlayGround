import { ATTRS, derive, effectiveStats, xpForLevel, statName } from '../core/stats.js'
import { ITEMS, item, JURAMENTOS, RARITY, DIFFICULTIES, STARTING_EQUIPMENT } from '../data/items.js'
import { QUESTS } from '../data/quests.js'
import { CREATURES } from '../data/creatures.js'
import { ZONES } from '../data/zones.js'
import { clamp, formatNumber, formatTime } from '../utils/math.js'
import { installMenuExtras } from './MenuExtra.js'

const TABS = [
  ['personaje', '☉', 'Personaje'], ['equipo', '◈', 'Equipo'], ['inventario', '▣', 'Inventario'],
  ['criaturas', '❖', 'Criaturas'], ['misiones', '◇', 'Misiones'], ['mapa', '⌖', 'Mapa'],
  ['ajustes', '⚙', 'Ajustes'], ['sistema', '▤', 'Sistema']
]

export class MenuScreen {
  constructor(ui) {
    this.ui = ui
    this.game = ui.game
    this.el = null
    this.tab = 'personaje'
    this.fromTitle = false
    this.selectedItem = null
    this.selectedCreature = null
    this.invFilter = 'todos'
    this.confirmCb = null
  }

  open(tab = 'personaje', fromTitle = false) {
    this.fromTitle = fromTitle
    this.tab = tab
    if (this.el) { this.setTab(tab); return }
    this.el = document.createElement('div')
    this.el.className = 'menu-screen pause-menu'
    this.el.innerHTML = `
      <div class="menu-head">
        <div class="menu-brand">
          <svg class="sigil" viewBox="0 0 100 100" aria-hidden="true"><path d="M50 7l7 26 18-8-12 21 24 4-24 9 17 18-26-9-4 27-4-27-26 9 17-18-24-9 24-4-12-21 18 8z" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>
          <div><h2>La Espada Celestial</h2><small>Diario del Jugador Cero · el Velo recuerda</small></div>
        </div>
        <button class="menu-close" data-action="close">✕ <span>Cerrar</span></button>
      </div>
      <div class="menu-main">
        <nav class="menu-nav" id="menu-nav">
          ${TABS.map(([id, ico, name]) => `<button data-tab="${id}" class="${id === tab ? 'on' : ''}"><span class="n-ico">${ico}</span>${name}</button>`).join('')}
          <div class="nav-spacer"></div>
          <div class="nav-foot">TAB / ESC<br>PARA VOLVER AL MUNDO</div>
        </nav>
        <div class="menu-content scroll" id="menu-content"></div>
      </div>
    `
    this.ui.uiEl.appendChild(this.el)
    this.el.addEventListener('click', e => this.onClick(e))
    this.el.addEventListener('input', e => this.onInput(e))
    this.render()
  }

  close() {
    const fromTitle = this.fromTitle
    this.el?.remove(); this.el = null
    if (fromTitle) { this.game.returnToTitle(); return }
    this.game.closeMenu()
  }

  setTab(tab) {
    if (!TABS.some(t => t[0] === tab)) tab = 'personaje'
    this.tab = tab
    this.selectedItem = null
    this.el?.querySelectorAll('#menu-nav [data-tab]').forEach(b => b.classList.toggle('on', b.dataset.tab === tab))
    this.render()
  }

  refresh() {
    if (!this.el) return
    this.render()
  }

  render() {
    if (!this.el) return
    const content = this.el.querySelector('#menu-content')
    const s = this.game.save
    if (!s && this.tab !== 'ajustes') { content.innerHTML = '<div class="inventory-empty">No hay partida activa.</div>'; return }
    const d = s ? derive(effectiveStats(s.stats, s.className), s.equipment, s.level) : null
    switch (this.tab) {
      case 'personaje': content.innerHTML = this.renderSummary(s, d); break
      case 'equipo': content.innerHTML = this.renderEquipment(s, d); break
      case 'inventario': content.innerHTML = this.renderInventory(s, d); break
      case 'criaturas': content.innerHTML = this.renderCreatures(s); break
      case 'misiones': content.innerHTML = this.renderQuests(s); break
      case 'mapa': content.innerHTML = this.renderMap(s); break
      case 'ajustes': content.innerHTML = this.renderSettings(s); break
      case 'sistema': content.innerHTML = this.renderSystem(s); break
      default: content.innerHTML = this.renderSummary(s, d)
    }
    if (this.tab === 'mapa') requestAnimationFrame(() => this.ui.drawFullMap(document.getElementById('full-map')))
  }

  // ───────────── Personaje ─────────────
  renderSummary(s, d) {
    const cls = JURAMENTOS[s.className] || JURAMENTOS.filo
    const xpNext = xpForLevel(s.level)
    const prog = clamp(s.xp / xpNext, 0, 1)
    const mp = this.game.quests.mainProgress()
    return `
      <div class="menu-panel-title"><div><h3>Personaje</h3><p>${this.esc(s.name)} · ${cls.title}</p></div><div class="p-actions"><span class="tag">${DIFFICULTIES[s.difficulty]?.name || 'Aventura'}</span></div></div>
      <div class="pause-hero">
        <div class="ph-portrait">${this.ui.portrait('player')}</div>
        <div><div class="ph-name">${this.esc(s.name)}</div><div class="ph-meta">NIVEL ${s.level} · ${cls.name.toUpperCase()} · ${(this.game.zoneId || s.zone || 'valdoria').toUpperCase()}</div></div>
        <div class="ph-progress">PROGRESO DEL VELO <b>${mp.done} / ${mp.total}</b></div>
      </div>
      <div class="menu-stats-grid">
        ${this.statCard('Vida', Math.round(d.hp), `${Math.ceil(this.game.player?.hp ?? d.hp)} actual`)}
        ${this.statCard('Ataque', Math.round(d.attack), `${Math.round(d.crit * 100)} % crítico`)}
        ${this.statCard('Defensa', `${Math.round(d.reduction * 100)} %`, `${d.total.defensa} puntos`)}
        ${this.statCard('Poder mágico', `${Math.round(d.power * 100)} %`, `${Math.round(d.mp)} maná`)}
      </div>
      <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:4px"><span class="field-label" style="margin:0">Experiencia</span><span style="font-family:var(--sans);font-size:9px;color:#8d887a">${formatNumber(s.xp)} / ${formatNumber(xpNext)}</span></div>
      <div class="bar hp" style="height:6px;margin-bottom:16px"><i style="width:${prog * 100}%;background:linear-gradient(90deg,#a97b32,#e4c27c,#fff0c0)"></i></div>
      <div class="character-layout">
        <div class="equipment-paper">
          <div class="field-label" style="margin-bottom:7px">Atributos <b>${s.freePoints} libres</b></div>
          ${ATTRS.map(a => `<div class="attr-line"><span>${a.name}<small>${a.desc.split('.')[0]}</small></span><b>${s.stats[a.key] + (cls.bonus[a.key] || 0)}</b><button class="plus" data-attr="${a.key}" ${s.freePoints <= 0 ? 'disabled' : ''} aria-label="Subir ${a.name}">+</button></div>`).join('')}
          <div class="menu-note">${s.freePoints > 0 ? 'Reparte los puntos que has ganado al subir de nivel.' : 'Sube de nivel derrotando enemigos y completando misiones.'}</div>
        </div>
        <div class="equipment-paper">
          <div class="field-label" style="margin-bottom:7px">Estado del viaje</div>
          <div class="attr-line"><span>Tiempo de juego</span><b style="font-size:11px">${formatTime(s.playTime || 0)}</b></div>
          <div class="attr-line"><span>Resonancia</span><b>${Math.round(s.resonance || 0)}</b></div>
          <div class="attr-line"><span>Criaturas vinculadas</span><b>${s.creatures.length} / 8</b></div>
          <div class="attr-line"><span>Oro</span><b>${formatNumber(s.gold)}</b></div>
          <div class="attr-line"><span>Esencia de resonancia</span><b>${formatNumber(s.essence || 0)}</b></div>
          <div class="attr-line"><span>Misiones completadas</span><b>${Object.values(this.game.quests.state).filter(q => q.state === 'complete').length}</b></div>
          <div class="menu-note">«No eres el héroe que el mundo esperaba. Eres el que el mundo no sabía que necesitaba.»</div>
        </div>
      </div>
      <div class="menu-actions-row">
        <button class="gold-btn" data-tab="equipo">Equipamiento</button>
        <button class="gold-btn" data-tab="criaturas">Criaturas</button>
        <button class="ghost-btn" data-tab="misiones">Diario de misiones</button>
      </div>
    `
  }

  statCard(label, value, sub) {
    return `<div class="stat-card"><div class="sc-label">${label}</div><div class="sc-val">${value}</div><div class="sc-sub">${sub || ''}</div></div>`
  }

  // ───────────── Equipo ─────────────
  renderEquipment(s, d) {
    const slots = [['weapon', 'Arma'], ['armor', 'Armadura'], ['helm', 'Casco'], ['amulet', 'Amuleto']]
    const equipped = this.selectedItem && Object.values(s.equipment).includes(this.selectedItem) ? this.selectedItem : null
    const available = Object.keys(ITEMS).filter(id => ITEMS[id].type === 'weapon' || ITEMS[id].type === 'armor' || ITEMS[id].type === 'helm' || ITEMS[id].type === 'amulet').filter(id => id === s.equipment.weapon || id === s.equipment.armor || id === s.equipment.helm || id === s.equipment.amulet || this.game.inventoryCount(id) > 0)
    const sel = this.selectedItem ? item(this.selectedItem) : null
    return `
      <div class="menu-panel-title"><div><h3>Equipamiento</h3><p>El filo, la coraza y los ecos que llevas contigo</p></div></div>
      <div class="character-layout">
        <div class="equipment-paper">
          <div class="field-label">Ranuras</div>
          <div class="equip-slots">
            ${slots.map(([type, name]) => {
              const id = s.equipment[type]
              const it = id ? item(id) : null
              return `<div class="equip-slot" data-item="${id || ''}" data-slot="${type}"><div class="es-ico">${it?.icon || '·'}</div><div class="es-info"><div class="es-name">${it ? this.esc(it.name) : 'Vacío'}</div><div class="es-type">${name}</div></div></div>`
            }).join('')}
          </div>
          <div class="field-label" style="margin-top:14px">Estadísticas actuales</div>
          <div class="attr-line"><span>Ataque físico</span><b>${Math.round(d.attack)}</b></div>
          <div class="attr-line"><span>Reducción de daño</span><b>${Math.round(d.reduction * 100)} %</b></div>
          <div class="attr-line"><span>Vida máxima</span><b>${Math.round(d.hp)}</b></div>
          <div class="attr-line"><span>Maná máximo</span><b>${Math.round(d.mp)}</b></div>
          <div class="attr-line"><span>Probabilidad de crítico</span><b>${Math.round(d.crit * 100)} %</b></div>
        </div>
        <div class="equipment-paper">
          <div class="field-label">Mochila de equipo</div>
          <div class="inventory-grid" style="max-height:190px;overflow-y:auto">
            ${available.length ? available.map(id => { const it = item(id); const eq = Object.values(s.equipment).includes(id); return `<button class="inv-item" data-item="${id}" style="${eq ? 'border-color:rgba(228,194,124,.5)' : ''}"><div class="ii-ico" style="color:${this.ui.rarityColor(it.rarity)}">${it.icon}</div><div><div class="ii-name">${this.esc(it.name)}</div><div class="ii-count">${eq ? '<b>EQUIPADO</b>' : RARITY[it.rarity]?.name || ''}</div></div></button>` }).join('') : '<div class="inventory-empty">No hay equipo disponible.</div>'}
          </div>
          <div id="equip-detail" class="equip-detail" style="margin-top:12px">
            ${sel ? this.itemDetailHTML(sel, s, 'equip') : '<div class="ed-desc">Selecciona una pieza para ver sus estadísticas y equiparla.</div>'}
          </div>
        </div>
      </div>
    `
  }

  itemDetailHTML(it, s, mode = 'use') {
    const id = Object.keys(ITEMS).find(k => ITEMS[k] === it)
    const isEquip = ['weapon', 'armor', 'helm', 'amulet'].includes(it.type)
    const equipped = id && Object.values(s.equipment).includes(id)
    const stats = it.stats ? Object.entries(it.stats).map(([k, v]) => `<span class="ed-stat plus">${statName(k)} +${v}</span>`).join('') : ''
    const dmg = it.dmg ? `<span class="ed-stat plus">Ataque +${it.dmg}</span>` : ''
    const heal = it.heal ? `<span class="ed-stat plus">Restaura ${it.heal} vida</span>` : ''
    const mana = it.mana ? `<span class="ed-stat plus">Restaura ${it.mana} maná</span>` : ''
    const essence = it.essence ? `<span class="ed-stat plus">+${it.essence} esencia</span>` : ''
    return `<div class="ed-name">${this.esc(it.name)}</div><div class="ed-type">${RARITY[it.rarity]?.name || ''} · ${it.type}</div><div class="ed-desc">${this.esc(it.desc)}</div><div class="ed-stats">${dmg}${stats}${heal}${mana}${essence}</div>
      ${isEquip ? (equipped ? '<div class="menu-note">Ya está equipado.</div>' : `<button class="gold-btn" data-action="equip" data-item="${id}" style="margin-top:9px">Equipar</button>`) : ''}
      ${it.type === 'consumable' ? `<button class="gold-btn" data-action="use-item" data-item="${id}" style="margin-top:9px">Usar</button>` : ''}`
  }

  // ───────────── Inventario ─────────────
  renderInventory(s) {
    const filters = [['todos', 'Todo'], ['consumable', 'Consumibles'], ['weapon', 'Armas'], ['armor', 'Armaduras'], ['helm', 'Cascos'], ['amulet', 'Amuletos'], ['material', 'Materiales'], ['quest', 'Misión']]
    const ids = Object.keys(s.inventory).filter(id => (s.inventory[id] || 0) > 0)
    const list = ids.filter(id => this.invFilter === 'todos' || ITEMS[id]?.type === this.invFilter)
    const sel = this.selectedItem ? item(this.selectedItem) : null
    return `
      <div class="menu-panel-title"><div><h3>Inventario</h3><p>Lo que cargas dice tanto como lo que dejas atrás</p></div><div class="p-actions"><span class="tag">◉ ${formatNumber(s.gold)} oro</span><span class="tag">✧ ${formatNumber(s.essence || 0)}</span></div></div>
      <div class="option-row" style="grid-template-columns:repeat(8,1fr);margin-bottom:12px">
        ${filters.map(([id, n]) => `<button class="option-btn ${this.invFilter === id ? 'on' : ''}" data-filter="${id}" style="font-size:7px">${n}</button>`).join('')}
      </div>
      <div class="inventory-grid">
        ${list.length ? list.map(id => { const it = item(id); return `<button class="inv-item" data-item="${id}"><div class="ii-ico" style="color:${this.ui.rarityColor(it.rarity)}">${it.icon}</div><div><div class="ii-name">${this.esc(it.name)}</div><div class="ii-count"><b>×${s.inventory[id]}</b> · ${RARITY[it.rarity]?.name || ''}</div></div></button>` }).join('') : '<div class="inventory-empty">No hay objetos en esta categoría. Explora, derrota enemigos y abre cofres.</div>'}
      </div>
      <div class="equipment-paper" style="margin-top:14px;min-height:120px" id="inv-detail">
        ${sel ? this.itemDetailHTML(sel, s) : '<div class="ed-desc" style="color:#77746a;font-size:14px">Selecciona un objeto para leer su descripción. Los objetos de misión no se pueden usar ni vender.</div>'}
      </div>
    `
  }

  // ───────────── Events ─────────────
  onClick(e) {
    const nav = e.target.closest('[data-tab]')
    if (nav) { this.game.audio?.sfx('ui'); this.setTab(nav.dataset.tab); return }
    const filter = e.target.closest('[data-filter]')
    if (filter) { this.invFilter = filter.dataset.filter; this.render(); return }
    const itemBtn = e.target.closest('[data-item]')
    if (itemBtn) {
      const id = itemBtn.dataset.item
      if (id) { this.selectedItem = id; this.render(); this.game.audio?.sfx('hover') }
      return
    }
    const attr = e.target.closest('[data-attr]')
    if (attr) { this.game.spendAttribute(attr.dataset.attr); this.render(); return }
    const action = e.target.closest('[data-action]')?.dataset.action
    const itemId = e.target.closest('[data-item]')?.dataset.item
    if (action === 'close') { this.game.audio?.sfx('ui'); this.close(); return }
    if (action === 'equip') { this.game.equipItem(itemId); this.selectedItem = itemId; this.render(); return }
    if (action === 'use-item') { this.game.useItem(itemId); this.render(); return }
    if (action === 'creature-select') { this.selectedCreature = e.target.closest('[data-creature]').dataset.creature; this.render(); return }
    if (action === 'creature-active') { this.game.summonCreature(e.target.closest('[data-creature]').dataset.creature); this.render(); return }
    if (action === 'creature-upgrade') { this.game.upgradeCreature(e.target.closest('[data-creature]').dataset.creature); this.render(); return }
    if (action === 'quest-track') { this.game.quests.setTracked(e.target.closest('[data-quest]').dataset.quest); this.ui.toast('Misión seguida en el HUD.', '◇'); this.render(); return }
    if (action === 'save') { this.game.saveGame(true); this.render(); return }
    if (action === 'title') { this.confirm('¿Volver al menú principal? Se guardará tu progreso actual.', () => this.game.returnToTitle(true)); return }
    if (action === 'help') { this.ui.showHelp('pause'); return }
    if (action === 'credits') { this.ui.showCredits('pause'); return }
    if (action === 'load') { this.confirm('¿Cargar la última partida guardada? Perderás el progreso no guardado.', () => this.game.loadGameFromMenu()); return }
    if (action === 'reset') { this.confirm('¿Borrar la partida guardada y empezar de cero? Esta acción no se puede deshacer.', () => this.game.resetSave()); return }
    if (action === 'travel') { const wp = e.target.closest('[data-wp]')?.dataset.wp; if (wp) this.game.fastTravel(wp); return }
    if (action === 'quality') { const v = e.target.closest('[data-value]')?.dataset.value; if (v) { this.game.settings.quality = v; this.game.applySettings(); this.render(); } return }
    if (action === 'uiscale') { const v = e.target.closest('[data-value]')?.dataset.value; if (v) { this.game.settings.uiScale = Number(v); this.game.applySettings(); this.render(); } return }
    if (action === 'difficulty') { const v = e.target.closest('[data-value]')?.dataset.value; if (v) { this.game.setDifficulty(v); this.render(); } return }
    if (action === 'toggle') {
      const key = e.target.closest('[data-setting]')?.dataset.setting
      if (key) { this.game.settings[key] = !this.game.settings[key]; this.game.applySettings(); this.render() }
      return
    }
    if (action === 'mute') { this.game.settings.muted = !this.game.settings.muted; this.game.applySettings(); this.render(); return }
    if (action === 'close-help') { this.closeOverlay(); return }
  }

  onInput(e) {
    if (e.target.dataset.setting === 'music') { this.game.settings.music = Number(e.target.value); this.game.applySettings(); return }
    if (e.target.dataset.setting === 'sfx') { this.game.settings.sfx = Number(e.target.value); this.game.applySettings(); return }
  }

  confirm(message, onYes) {
    const ov = document.createElement('div')
    ov.className = 'menu-screen'
    ov.style.zIndex = '70'
    ov.innerHTML = `<div style="margin:auto;width:min(460px,90vw);border:1px solid rgba(228,194,124,.25);background:rgba(8,11,19,.98);padding:26px;text-align:center">
      <div class="eyebrow" style="justify-content:center">CONFIRMACIÓN</div>
      <p style="font-family:var(--body);font-size:18px;line-height:1.5;margin:14px 0 20px;color:#d6ccb8">${this.esc(message)}</p>
      <div style="display:flex;gap:8px;justify-content:center"><button class="gold-btn" data-confirm="yes">Sí, continuar</button><button class="ghost-btn" data-confirm="no">Cancelar</button></div>
    </div>`
    this.ui.uiEl.appendChild(ov)
    ov.addEventListener('click', ev => {
      const v = ev.target.closest('[data-confirm]')?.dataset.confirm
      if (!v) return
      ov.remove()
      if (v === 'yes') onYes()
    })
  }

  closeOverlay() {
    document.getElementById('help-overlay')?.remove()
    this.open(this.tab, this.fromTitle)
  }

  // Placeholders; MenuExtra añade las pestañas restantes.
  renderCreatures() { return '' }
  renderQuests() { return '' }
  renderMap() { return '' }
  renderSettings() { return '' }
  renderSystem() { return '' }
  openShop() {}
  closeShop() {}
  showHelp() {}
  showCredits() {}

  esc(s = '') { return this.ui.escape(s) }
}

installMenuExtras(MenuScreen.prototype)
