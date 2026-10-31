import { ATTRS, derive, xpForLevel, statName } from '../core/stats.js'
import { ITEMS, item, JURAMENTOS, RARITY, DIFFICULTIES } from '../data/items.js'
import { QUESTS, MAIN_ORDER } from '../data/quests.js'
import { CREATURES, CREATURE_IDS } from '../data/creatures.js'
import { formatNumber, formatTime } from '../utils/math.js'

const SHOP = [
  { id: 'potion_vida', price: 30 },
  { id: 'potion_mana', price: 35 },
  { id: 'elixir_alba', price: 140 },
  { id: 'esencia_resonancia', price: 60 }
]

export function installMenuExtras(proto) {
  proto.renderCreatures = function (s) {
    const owned = new Map(s.creatures.map(c => [c.id, c]))
    const active = s.activeCreature
    if (!this.selectedCreature) this.selectedCreature = active || s.creatures[0]?.id || null
    const sel = this.selectedCreature
    const selDef = sel ? CREATURES[sel] : null
    const selOwned = sel ? owned.get(sel) : null
    const essence = s.essence || 0
    const cost = 40
    return `
      <div class="menu-panel-title"><div><h3>Criaturas</h3><p>Ocho canciones. Ocho formas de no estar solo.</p></div><div class="p-actions"><span class="tag">✧ ${formatNumber(essence)} esencia</span><span class="tag">${s.creatures.length} / 8</span></div></div>
      <div class="character-layout" style="grid-template-columns:1.2fr .8fr">
        <div class="creature-list">
          ${CREATURE_IDS.map(id => {
            const c = CREATURES[id]; const o = owned.get(id); const isActive = active === id
            return `<div class="creature-card ${isActive ? 'active' : ''} ${o ? '' : 'locked'}" data-action="creature-select" data-creature="${id}" data-item="${id}">
              <div class="cc-level">${o ? `Nv. ${o.level}` : '???'}</div>
              <div class="cc-top"><div class="cc-ico" style="color:#${c.color.toString(16).padStart(6, '0')}">${c.glyph}</div><div><div class="cc-name">${this.esc(c.name)}</div><div class="cc-role">${c.region} · ${c.role} · ${c.rarity}</div></div></div>
              <div class="cc-lore">${o ? this.esc(c.lore) : 'Aún no has escuchado su canción. Explora ' + c.region + ' y debilítala para intentar un vínculo.'}</div>
              <div class="cc-stats"><span>♥ ${o ? Math.round(c.hp * (1 + (o.level - 1) * .14)) : '—'}</span><span>⚔ ${o ? Math.round(c.attack * (1 + (o.level - 1) * .12)) : '—'}</span><span>✦ ${c.element}</span></div>
              ${isActive ? '<div class="tag" style="margin-top:7px;display:inline-block">VÍNCULO ACTIVO</div>' : ''}
            </div>`
          }).join('')}
        </div>
        <div class="equipment-paper" style="align-self:start;position:sticky;top:0">
          ${selDef ? `
            <div class="field-label">Ficha de vínculo</div>
            <div style="display:flex;gap:12px;align-items:center;margin-bottom:8px"><div class="cc-ico" style="width:54px;height:54px;font-size:26px;color:#${selDef.color.toString(16).padStart(6, '0')}">${selDef.glyph}</div><div><div class="ed-name" style="font-size:19px">${this.esc(selDef.name)}</div><div class="ed-type">${selDef.element} · ${selDef.role}</div></div></div>
            <div class="ed-desc">${this.esc(selDef.lore)}</div>
            <div class="field-label" style="margin-top:10px">Habilidad activa</div>
            <div class="ed-name" style="font-size:14px">${this.esc(selDef.ability)}</div>
            <div class="ed-desc">${this.esc(selDef.abilityDesc)}</div>
            <div class="ed-desc" style="color:#8ce9e5;margin-top:5px">${this.esc(selDef.passive)}</div>
            ${selOwned ? `
              <div class="attr-line" style="margin-top:8px"><span>Nivel</span><b>${selOwned.level}</b></div>
              <div class="attr-line"><span>Vida base</span><b>${Math.round(selDef.hp * (1 + (selOwned.level - 1) * .14))}</b></div>
              <div class="attr-line"><span>Ataque base</span><b>${Math.round(selDef.attack * (1 + (selOwned.level - 1) * .12))}</b></div>
              <div class="attr-line"><span>Enfriamiento</span><b>${selDef.cooldown} s</b></div>
              <div class="menu-actions-row">
                ${active === sel ? '<span class="tag">INVOCADA</span>' : `<button class="gold-btn" data-action="creature-active" data-creature="${sel}">Invocar</button>`}
                <button class="ghost-btn" data-action="creature-upgrade" data-creature="${sel}" ${essence < cost ? 'disabled' : ''}>Mejorar · ${cost} ✧</button>
              </div>
              <div class="menu-note">Mejorar aumenta su vida y ataque. La esencia se obtiene de enemigos, cofres y misiones.</div>
            ` : `<div class="menu-note" style="margin-top:12px">Aún no has vinculado esta criatura. Debilítala en ${selDef.region} y usa <b>Capturar</b> cuando su vida esté baja.</div>`}
          ` : '<div class="inventory-empty">Aún no has vinculado criaturas. Busca seres luminosos en Valdoria.</div>'}
        </div>
      </div>
    `
  }

  proto.renderQuests = function (s) {
    const active = this.game.quests.activeQuests()
    const completed = Object.entries(this.game.quests.state).filter(([, st]) => st.state === 'complete').map(([id]) => id)
    const mp = this.game.quests.mainProgress()
    return `
      <div class="menu-panel-title"><div><h3>Diario de misiones</h3><p>La historia se escribe caminando</p></div><div class="p-actions"><span class="tag">PRINCIPAL ${mp.done}/${mp.total}</span></div></div>
      <div class="bar hp" style="height:5px;margin-bottom:14px"><i style="width:${mp.pct * 100}%;background:linear-gradient(90deg,#a97b32,#e4c27c)"></i></div>
      <div class="quest-list">
        ${active.length ? active.map(id => {
          const def = QUESTS[id]; const st = this.game.quests.state[id]; const step = def.steps[st.step]
          const n = st.progress?.[st.step] || 0; const count = step?.count || 1
          return `<div class="quest-item ${def.type}">
            <div class="qi-head"><div class="qi-title">${this.esc(def.title)}</div><div class="qi-region">${def.type === 'main' ? 'Principal' : 'Secundaria'} · ${def.region}</div></div>
            <div class="qi-desc">${this.esc(def.desc)}</div>
            <div class="qi-objs"><div class="qi-obj"><span class="mark"></span><span>${this.esc(step?.label || '')}</span>${count > 1 ? `<span class="qi-count">${n} / ${count}</span>` : ''}</div></div>
            <div class="qi-rewards"><span>RECOMPENSAS <b>${this.game.quests.rewardText(id).join(' · ') || '—'}</b></span></div>
            <div class="menu-actions-row" style="margin-top:8px"><button class="ghost-btn" data-action="quest-track" data-quest="${id}" style="font-size:7px;padding:6px 10px">${this.game.quests.tracked === id ? '✓ Seguida' : 'Seguir en el HUD'}</button></div>
          </div>`
        }).join('') : '<div class="inventory-empty">No hay misiones activas. Habla con los habitantes de cada región: sus problemas también son la historia.</div>'}
      </div>
      ${completed.length ? `<div class="field-label" style="margin-top:16px">Completadas <b>${completed.length}</b></div><div class="quest-list">${completed.map(id => `<div class="quest-item" style="opacity:.55"><div class="qi-head"><div class="qi-title">✓ ${this.esc(QUESTS[id]?.title || id)}</div><div class="qi-region">${QUESTS[id]?.region || ''}</div></div></div>`).join('')}</div>` : ''}
    `
  }

  proto.renderMap = function (s) {
    const zone = this.game.world?.zone
    if (!zone) return '<div class="inventory-empty">Mapa no disponible.</div>'
    const waypoints = this.game.world.waypoints
    return `
      <div class="menu-panel-title"><div><h3>Mapa de ${zone.name}</h3><p>${zone.subtitle}</p></div><div class="p-actions"><span class="tag">${zone.act}</span></div></div>
      <div class="map-layout">
        <div class="map-canvas-wrap" style="height:min(52vh,440px)"><canvas id="full-map"></canvas>
          <div class="map-legend"><span><i style="background:#78b8ff"></i>Santuario</span><span><i style="background:#e8c77a"></i>Personaje</span><span><i style="background:#ffebaa"></i>Objetivo</span><span><i style="background:#b39cff"></i>Portal</span><span><i style="background:#ffcf6a"></i>Jefe</span></div>
        </div>
        <div class="map-side scroll">
          <div class="field-label">Santuarios de viaje</div>
          ${waypoints.map(w => {
            const disc = this.game.isWaypointDiscovered(w.def.id)
            return `<div class="waypoint-item ${disc ? '' : 'disabled'}"><div><span class="wp-name">${disc ? this.esc(w.def.name) : 'Santuario sin descubrir'}</span><span class="wp-region">${w.def.region}</span></div><button class="gold-btn" data-action="travel" data-wp="${w.def.id}" ${disc ? '' : 'disabled'}>${disc ? 'Viajar' : '—'}</button></div>`
          }).join('')}
          <div class="menu-note">Descubre un santuario acercándote a él. Viajar solo es posible fuera de combate y dentro de la región actual.</div>
          <div class="field-label">Lugares</div>
          ${zone.landmarks.map(l => `<div class="waypoint-item"><span class="wp-name">${this.esc(l.name)}</span><span class="wp-region">${l.icon}</span></div>`).join('')}
        </div>
      </div>
    `
  }

  proto.renderSettings = function (s) {
    const g = this.game.settings
    const diff = s?.difficulty || g.difficulty || 'aventura'
    const toggle = (key, label, sub) => `<div class="setting-row"><div><span class="st-label">${label}</span><span class="st-sub">${sub}</span></div><button class="toggle ${g[key] ? 'on' : ''}" data-action="toggle" data-setting="${key}" aria-label="${label}"></button></div>`
    return `
      <div class="menu-panel-title"><div><h3>Ajustes</h3><p>Que el Velo se adapte a ti, no al revés</p></div></div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px" class="settings-columns">
        <div>
          <div class="settings-group"><h4>Audio</h4>
            <div class="setting-row"><div><span class="st-label">Música</span><span class="st-sub">Composición procedural adaptativa</span></div><input class="range" type="range" min="0" max="1" step=".05" value="${g.music}" data-setting="music" aria-label="Volumen de música"></div>
            <div class="setting-row"><div><span class="st-label">Efectos</span><span class="st-sub">Golpes, magia, interfaz</span></div><input class="range" type="range" min="0" max="1" step=".05" value="${g.sfx}" data-setting="sfx" aria-label="Volumen de efectos"></div>
            ${toggle('muted', 'Silenciar todo', 'Atajo rápido para jugar sin sonido')}
          </div>
          <div class="settings-group"><h4>Rendimiento</h4>
            <div class="setting-row"><div><span class="st-label">Calidad gráfica</span><span class="st-sub">Sombras, resolución y densidad de vegetación</span></div><div class="seg">${['auto', 'alta', 'media', 'baja'].map(q => `<button class="${g.quality === q ? 'on' : ''}" data-action="quality" data-value="${q}">${q}</button>`).join('')}</div></div>
            ${toggle('shake', 'Vibración de cámara', 'Sacudidas al recibir golpes y usar habilidades')}
            ${toggle('damageNumbers', 'Números de daño', 'Muestra el daño y la curación flotante')}
          </div>
          <div class="settings-group"><h4>Accesibilidad</h4>
            ${toggle('colorblind', 'Modo daltonismo', 'Marcadores de enemigos y objetivos de alto contraste')}
            ${toggle('reducedMotion', 'Movimiento reducido', 'Desactiva sacudidas y animaciones de interfaz')}
            <div class="setting-row"><div><span class="st-label">Tamaño de interfaz</span><span class="st-sub">Texto y controles táctiles</span></div><div class="seg">${[[.95, 'Compacta'], [1, 'Normal'], [1.1, 'Grande']].map(([v, n]) => `<button class="${Math.abs(g.uiScale - v) < .01 ? 'on' : ''}" data-action="uiscale" data-value="${v}">${n}</button>`).join('')}</div></div>
          </div>
        </div>
        <div>
          <div class="settings-group"><h4>Combate y cámara</h4>
            ${toggle('aimAssist', 'Asistencia de apuntado', 'Orienta el ataque hacia el enemigo más cercano')}
            ${toggle('autoAim', 'Autoenfoque suave', 'La cámara acompaña al objetivo seleccionado')}
            ${toggle('invertCamera', 'Invertir cámara vertical', 'Para quien prefiere el eje invertido')}
            ${toggle('subtitles', 'Subtítulos cinematográficos', 'Siempre recomendado')}
          </div>
          <div class="settings-group"><h4>Dificultad</h4>
            <div class="option-row" style="grid-template-columns:1fr">${Object.entries(DIFFICULTIES).map(([id, df]) => `<button class="option-btn ${diff === id ? 'on' : ''}" data-action="difficulty" data-value="${id}" style="text-align:left;padding:8px 10px">${df.name}<small>${df.desc}</small></button>`).join('')}</div>
            <div class="menu-note">Puedes cambiarla en cualquier momento. No afecta a la historia ni a los logros.</div>
          </div>
          <div class="settings-group"><h4>Idioma</h4>
            <div class="setting-row"><div><span class="st-label">Español (España)</span><span class="st-sub">Texto, interfaz y voces sintetizadas</span></div><span class="tag">FIJADO</span></div>
          </div>
        </div>
      </div>
      <div class="settings-footer"><button class="ghost-btn" data-action="help">Cómo jugar</button><button class="ghost-btn" data-action="save">Guardar ajustes</button></div>
    `
  }

  proto.renderSystem = function (s) {
    const summary = this.game.saveSummary()
    return `
      <div class="menu-panel-title"><div><h3>Sistema</h3><p>El Velo recuerda tu partida en este dispositivo</p></div></div>
      <div class="pause-hero">
        <div class="ph-portrait">${this.ui.portrait('player')}</div>
        <div><div class="ph-name">${this.esc(s.name)}</div><div class="ph-meta">NIVEL ${s.level} · ${this.game.zoneId.toUpperCase()} · ${formatTime(s.playTime || 0)}</div></div>
        <div class="ph-progress">ÚLTIMO GUARDADO <b>${summary?.savedAt ? new Date(summary.savedAt).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) : '—'}</b></div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px" class="system-grid">
        <div class="equipment-paper">
          <div class="field-label">Partida</div>
          <div class="menu-actions-row"><button class="gold-btn primary" data-action="save">Guardar ahora</button><button class="ghost-btn" data-action="load">Cargar guardado</button></div>
          <div class="menu-note">Guardado automático al cambiar de región, completar misiones y subir de nivel.</div>
        </div>
        <div class="equipment-paper">
          <div class="field-label">Mundo</div>
          <div class="menu-actions-row"><button class="gold-btn" data-action="title">Volver al título</button><button class="ghost-btn" data-action="help">Ayuda</button><button class="ghost-btn" data-action="credits">Créditos</button></div>
          <div class="menu-note">Volver al título guarda automáticamente tu progreso.</div>
        </div>
      </div>
      <div class="equipment-paper" style="margin-top:10px">
        <div class="field-label">Datos</div>
        <div class="attr-line"><span>Versión</span><b>1.0.0</b></div>
        <div class="attr-line"><span>Guardado</span><b>Local · ${summary ? 'disponible' : 'vacío'}</b></div>
        <div class="attr-line"><span>Región actual</span><b>${this.game.zoneId}</b></div>
        <div class="attr-line"><span>Resonancia</span><b>${Math.round(s.resonance || 0)}</b></div>
        <div class="menu-actions-row"><button class="ghost-btn" data-action="reset">Borrar partida guardada</button></div>
        <div class="menu-note">La Espada Celestial es una obra original de fantasía. El GOTY es una aspiración de excelencia, no un premio obtenido.</div>
      </div>
    `
  }

  // ───────────── Tienda ─────────────
  proto.openShop = function () {
    if (this.shopEl) return
    this.shopEl = document.createElement('div')
    this.shopEl.className = 'menu-screen'
    this.shopEl.style.zIndex = '66'
    this.ui.uiEl.appendChild(this.shopEl)
    this.shopEl.addEventListener('click', e => {
      const action = e.target.closest('[data-action]')?.dataset.action
      if (action === 'shut') { this.closeShop(); return }
      if (action === 'buy') {
        const id = e.target.closest('[data-item]')?.dataset.item
        if (id) { this.game.buyItem(id); this.renderShop() }
      }
    })
    this.renderShop()
  }

  proto.renderShop = function () {
    if (!this.shopEl) return
    const s = this.game.save
    this.shopEl.innerHTML = `
      <div class="menu-head"><div class="menu-brand"><div class="sigil">◈</div><div><h2>Mercado de ceniza</h2><small>Vesna · «todo tiene un precio, incluso la esperanza»</small></div></div><button class="menu-close" data-action="shut">✕ <span>Cerrar</span></button></div>
      <div class="menu-main" style="grid-template-columns:1fr">
        <div class="menu-content">
          <div class="menu-panel-title"><div><h3>Mercancía</h3><p>Pociones, elixires y esencia de resonancia</p></div><div class="p-actions"><span class="tag">◉ ${formatNumber(s.gold)} oro</span></div></div>
          <div class="inventory-grid">
            ${SHOP.map(entry => {
              const it = item(entry.id)
              return `<div class="inv-item" style="cursor:default"><div class="ii-ico" style="color:${this.ui.rarityColor(it.rarity)}">${it.icon}</div><div style="flex:1"><div class="ii-name">${this.esc(it.name)}</div><div class="ii-count">◉ ${entry.price} · Tienes <b>${this.game.inventoryCount(entry.id)}</b></div><button class="gold-btn" data-action="buy" data-item="${entry.id}" style="margin-top:5px;font-size:7px;padding:5px 9px" ${s.gold < entry.price ? 'disabled' : ''}>Comprar</button></div></div>`
            }).join('')}
          </div>
          <div class="menu-note" style="margin-top:14px">Vesna no vende armas: dice que las armas eligen a su dueño y no quiere discutir con ellas.</div>
        </div>
      </div>
    `
  }

  proto.closeShop = function () {
    this.shopEl?.remove(); this.shopEl = null
    this.game.closeShop()
  }

  // ───────────── Ayuda ─────────────
  proto.showHelp = function (from = 'pause') {
    document.getElementById('help-overlay')?.remove()
    const ov = document.createElement('div')
    ov.id = 'help-overlay'
    ov.className = 'menu-screen'
    ov.style.zIndex = '64'
    ov.innerHTML = `
      <div class="menu-head"><div class="menu-brand"><div class="sigil">?</div><div><h2>Cómo jugar</h2><small>Todo lo que el Velo no te dirá</small></div></div><button class="menu-close" data-action="close-help">✕ <span>Volver</span></button></div>
      <div class="menu-main" style="grid-template-columns:1fr">
        <div class="menu-content">
          <div class="menu-panel-title"><div><h3>El mundo es tuyo</h3><p>Explora, escucha y elige. No hay una única forma correcta de salvar un mundo.</p></div></div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px" class="help-grid">
            <div class="equipment-paper">
              <div class="field-label">Controles · teclado y ratón</div>
              <div class="attr-line"><span>Mover</span><b>W A S D</b></div>
              <div class="attr-line"><span>Atacar / combo</span><b>Espacio · clic</b></div>
              <div class="attr-line"><span>Esquivar (invulnerable)</span><b>Shift</b></div>
              <div class="attr-line"><span>Bloquear / parar golpe</span><b>K · clic derecho</b></div>
              <div class="attr-line"><span>Habilidades de juramento</span><b>Q · R</b></div>
              <div class="attr-line"><span>Don de criatura</span><b>F</b></div>
              <div class="attr-line"><span>Capturar criatura</span><b>C</b></div>
              <div class="attr-line"><span>Interactuar</span><b>E</b></div>
              <div class="attr-line"><span>Poción</span><b>1</b></div>
              <div class="attr-line"><span>Cámara / zoom</span><b>Arrastrar · rueda</b></div>
              <div class="attr-line"><span>Menú</span><b>Tab · Esc</b></div>
            </div>
            <div class="equipment-paper">
              <div class="field-label">Controles · móvil horizontal</div>
              <div class="attr-line"><span>Movimiento</span><b>Joystick izquierdo</b></div>
              <div class="attr-line"><span>Cámara</span><b>Arrastra la mitad derecha</b></div>
              <div class="attr-line"><span>Atacar</span><b>⚔</b></div>
              <div class="attr-line"><span>Esquivar</span><b>➤</b></div>
              <div class="attr-line"><span>Bloquear</span><b>◈ (mantén)</b></div>
              <div class="attr-line"><span>Habilidades</span><b>Q · R</b></div>
              <div class="attr-line"><span>Criatura / Capturar</span><b>❖ · ◎</b></div>
              <div class="attr-line"><span>Interactuar</span><b>Toca el aviso central</b></div>
              <div class="attr-line"><span>Poción</span><b>♥</b></div>
              <div class="attr-line"><span>Menú</span><b>☰</b></div>
            </div>
            <div class="equipment-paper">
              <div class="field-label">Combate</div>
              <p class="menu-note" style="font-size:13px;line-height:1.5">Pulsa atacar varias veces para encadenar un combo de tres golpes. El tercer golpe hace más daño y empuja. Esquivar consume aguante y te hace invulnerable durante un instante. Bloquear reduce el daño; si bloqueas justo en el momento del impacto, ejecutas un <b>paro</b> que aturde al enemigo y rellena aguante. La barra verde se agota: sin aguante no puedes esquivar ni bloquear.</p>
            </div>
            <div class="equipment-paper">
              <div class="field-label">Resonancia y criaturas</div>
              <p class="menu-note" style="font-size:13px;line-height:1.5">Debilita a una criatura por debajo de un tercio de su vida y pulsa <b>Capturar</b>. La probabilidad depende de su vida restante, tu suerte y la rareza. Las criaturas capturadas luchan a tu lado: invoca una y usa su habilidad con <b>F</b>. La esencia de resonancia las fortalece.</p>
            </div>
            <div class="equipment-paper">
              <div class="field-label">Progresión</div>
              <p class="menu-note" style="font-size:13px;line-height:1.5">Sube de nivel con experiencia, reparte puntos de atributo y equipa armas, armaduras, cascos y amuletos. Cada atributo tiene un efecto medible: vitalidad, maná, aguante, daño, defensa, velocidad, poder mágico, crítico y captura. Las misiones principales avanzan la historia; las secundarias dan equipo único y lore.</p>
            </div>
            <div class="equipment-paper">
              <div class="field-label">Mapa y viaje</div>
              <p class="menu-note" style="font-size:13px;line-height:1.5">Descubre santuarios acercándote a ellos. Desde el mapa puedes viajar entre santuarios descubiertos de la región actual, siempre fuera de combate. Los portales conectan Valdoria, Drakmor y Kansordore cuando la historia lo permite.</p>
            </div>
          </div>
          <div class="settings-footer"><button class="gold-btn" data-action="close-help">Entendido</button></div>
        </div>
      </div>
    `
    this.ui.uiEl.appendChild(ov)
    ov.addEventListener('click', e => {
      if (e.target.closest('[data-action="close-help"]')) {
        ov.remove()
      }
    })
  }

  // ───────────── Créditos ─────────────
  proto.showCredits = function (from = 'pause') {
    document.getElementById('credits-overlay')?.remove()
    const ov = document.createElement('div')
    ov.id = 'credits-overlay'
    ov.className = 'credits-screen'
    ov.innerHTML = `
      <div class="eyebrow" style="justify-content:center">UNA LEYENDA ORIGINAL DE IA GAME LAB</div>
      <h2 class="gold-text">La Espada Celestial</h2>
      <div class="credits-sub">El Velo se está rompiendo. Alguien tiene que decidir qué hay al otro lado.</div>
      <div class="credits-block"><h3>DIRECCIÓN Y DISEÑO</h3><p>IA Game Lab · mundo, narrativa, sistemas y dirección de arte originales</p></div>
      <div class="credits-block"><h3>PROGRAMACIÓN</h3><p>Motor de acción y exploración en Three.js<br>Sistemas de combate, IA, misiones, criaturas, guardado y accesibilidad</p></div>
      <div class="credits-block"><h3>ARTE</h3><p>Modelos, escenarios, retratos y efectos generados proceduralmente para esta obra<br>Dirección de color: Valdoria, Drakmor y Kansordore</p></div>
      <div class="credits-block"><h3>MÚSICA Y SONIDO</h3><p>Composición y síntesis procedural en Web Audio<br>Temas adaptativos por región e intensidad de combate</p></div>
      <div class="credits-block"><h3>TECNOLOGÍA</h3><p>Three.js · Vite · Web Audio API · Canvas 2D<br>Tipografías Cinzel y Cormorant Garamond (SIL Open Font License)</p></div>
      <div class="credits-block long"><p>Todo el contenido de La Espada Celestial —personajes, criaturas, regiones, historia, música y arte— es original. No se han utilizado personajes, historias, diseños ni propiedades intelectuales de terceros. Cualquier parecido con leyendas conocidas es solo eso: el Velo repitiendo viejas canciones.</p></div>
      <div class="credits-block long"><p>El objetivo de esta obra es la excelencia. «GOTY» es una aspiración, no un premio obtenido. Gracias por jugar, por explorar y por escuchar a las criaturas.</p></div>
      <div class="credits-block"><h3>GRACIAS</h3><p>A ti, Jugador Cero.<br>El mundo seguirá existiendo mientras alguien recuerde haberlo elegido.</p></div>
      <button class="gold-btn" data-action="close-credits" style="margin-top:8px">Volver</button>
      <div class="credits-sub" style="margin-top:20px;font-size:12px">v1.0.0 · 2026 · Hecho para navegador y Android</div>
    `
    this.ui.uiEl.appendChild(ov)
    ov.addEventListener('click', e => {
      if (e.target.closest('[data-action="close-credits"]')) {
        ov.remove()
      }
    })
  }
}
