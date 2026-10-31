// Pantallas de muerte, finales y créditos.
const DEATH_QUOTES = [
  '«El Velo no borra a los que caen. Solo borra el nombre que llevaban.» — Anciana Iria',
  '«Volver a empezar no es rendirse. Es recordar que aún queda una página.» — Seraphine',
  '«La ceniza pesa menos cuando alguien la mira.» — Kaelen',
  '«Las criaturas siguen cantando. Escucha: todavía hay una canción para ti.» — Nara'
]

export class EndScreens {
  constructor(ui) {
    this.ui = ui
    this.game = ui.game
    this.el = null
  }

  showDeath(data = {}) {
    this.hideDeath()
    const quote = data.quote || DEATH_QUOTES[Math.floor(Math.random() * DEATH_QUOTES.length)]
    const quest = this.game.quests?.trackedQuest?.()
    const questTitle = quest ? this.game.quests.def(quest)?.title : null
    const el = document.createElement('div')
    el.className = 'death-screen'
    el.id = 'death-screen'
    el.innerHTML = `
      <div class="eyebrow" style="justify-content:center">EL VELO TE RECUERDA</div>
      <h2>Has caído</h2>
      <p>${questTitle ? `La historia se detuvo en «${this.esc(questTitle)}».` : 'Pero una página en blanco siempre espera.'}</p>
      <div class="death-quote">${this.esc(quote)}</div>
      <div class="menu-actions-row">
        <button class="gold-btn primary" data-action="retry">Volver a intentarlo</button>
        <button class="ghost-btn" data-action="load">Cargar guardado</button>
        <button class="ghost-btn" data-action="title">Menú principal</button>
      </div>
      <div class="death-quote" style="margin-top:14px;font-size:11px">Reintentar te devuelve al último santuario o al inicio de la región, con la vida restaurada.</div>
    `
    document.getElementById('ui').appendChild(el)
    this.el = el
    el.addEventListener('click', e => {
      const action = e.target.closest('[data-action]')?.dataset.action
      if (!action) return
      this.game.audio?.sfx('ui')
      if (action === 'retry') { this.hideDeath(); this.game.retryFromCheckpoint() }
      if (action === 'load') { this.hideDeath(); this.game.loadGameFromMenu() }
      if (action === 'title') { this.hideDeath(); this.game.returnToTitle(true) }
    })
  }

  hideDeath() {
    document.getElementById('death-screen')?.remove()
    this.el = null
  }

  showEnding(type, data = {}) {
    document.querySelectorAll('.ending-screen, .credits-screen').forEach(e => e.remove())
    const open = type === 'open'
    const s = data.save || this.game.save || {}
    const stats = data.stats || {}
    const title = open ? 'El Velo Abierto' : 'El Velo Cerrado'
    const kicker = open ? 'FINAL · LA RUPTURA' : 'FINAL · LA ASCENSIÓN'
    const paragraphs = open ? [
      'La Espada Celestial se convierte en una grieta de luz sobre el cielo de Kansordore. No duele. Por primera vez en trescientos doce intentos, el mundo respira sin pedir permiso.',
      'Valdoria florece más allá de sus murallas. Drakmor aprende que el fuego también puede calentar. Las criaturas alzan la cabeza y cantan una canción que nadie les enseñó, porque nadie la había escrito todavía.',
      'Tú desapareces de la historia. No como un héroe recordado, sino como una elección que late dentro de cada historia futura. El Velo está abierto. El mundo ya no es un libro: es una página en blanco.'
    ] : [
      'La Espada Celestial se apaga despacio, como una vela que acepta su final. Las grietas se cierran sobre Kansordore y el cielo recupera un azul que llevaba siglos olvidado.',
      'Valdoria duerme entre sus sauces. Drakmor guarda su fuego bajo la ceniza. Las criaturas se acurrucan en los santuarios, soñando con voces que las llamaron por su nombre. Nadie vuelve a perder a nadie. Nadie vuelve a elegir tampoco.',
      'Solo tú recuerdas. Solo tú sabes lo que costó llegar hasta aquí. El Velo está cerrado, y en el silencio perfecto de un instante que no termina, tu nombre sigue siendo la única cosa que el mundo no pudo borrar.'
    ]
    const epilogue = []
    if (data.spared) epilogue.push('Varok conservó su nombre. Drakmor recuerda a un padre que aprendió a soltar.')
    else if (data.consumed) epilogue.push('Varok ardió sin nombre. Drakmor es libre, pero hay una silla vacía junto al fuego.')
    if ((s.creatures || []).length >= 6) epilogue.push(`Los ocho vínculos resonaron: ${s.creatures.length} criaturas guardan tu canción.`)
    else if ((s.creatures || []).length > 0) epilogue.push(`${s.creatures.length} criatura${s.creatures.length === 1 ? '' : 's'} recuerdan tu mano.`)
    if ((s.resonance || 0) >= 60) epilogue.push('Tu resonancia era tan alta que el Velo te confundió con una de sus canciones.')
    if ((s.resonance || 0) < 20) epilogue.push('Elegiste con la espada más que con el corazón. El mundo sobrevive; la pregunta es si aprendió algo.')
    if (data.sideQuests >= 4) epilogue.push('Los pequeños encargos tejieron una red de afectos que ninguna profecía pudo prever.')
    if (this.game.flags?.lia_gift) epilogue.push('Lía aún guarda la flor que le diste, aunque ya no recuerde de dónde salió.')

    const el = document.createElement('div')
    el.className = 'ending-screen'
    el.id = 'ending-screen'
    el.innerHTML = `
      <div class="ending-card">
        <div class="ec-kicker">${kicker}</div>
        <h2 class="gold-text">${title}</h2>
        <div class="ec-line"></div>
        ${paragraphs.map(p => `<p>${this.esc(p)}</p>`).join('')}
        ${epilogue.length ? `<div class="ec-line" style="width:90px;margin:20px auto 12px"></div>${epilogue.map(p => `<p style="font-size:14px;color:#938d7f">${this.esc(p)}</p>`).join('')}` : ''}
        <div class="ec-stats">
          <div class="ec-stat"><b>${s.level || 1}</b><span>Nivel final</span></div>
          <div class="ec-stat"><b>${(s.creatures || []).length} / 8</b><span>Criaturas</span></div>
          <div class="ec-stat"><b>${Math.round(s.resonance || 0)}</b><span>Resonancia</span></div>
          <div class="ec-stat"><b>${stats.quests ?? 0} / ${stats.questTotal ?? 13}</b><span>Misiones</span></div>
          <div class="ec-stat"><b>${this.time(stats.playTime || s.playTime || 0)}</b><span>Tiempo</span></div>
        </div>
        <p class="ec-sign">«No eres el héroe que el mundo esperaba. Eres el que el mundo no sabía que necesitaba.»</p>
        <div class="menu-actions-row" style="justify-content:center">
          <button class="gold-btn primary" data-action="credits">Ver créditos</button>
          <button class="ghost-btn" data-action="resume">Seguir explorando</button>
          <button class="ghost-btn" data-action="title">Menú principal</button>
        </div>
        <div class="ec-sign" style="font-size:11px;margin-top:14px">El GOTY es una aspiración de excelencia, no un premio obtenido. Gracias por jugar.</div>
      </div>
    `
    document.getElementById('ui').appendChild(el)
    this.el = el
    el.addEventListener('click', e => {
      const action = e.target.closest('[data-action]')?.dataset.action
      if (!action) return
      this.game.audio?.sfx('ui')
      if (action === 'credits') this.showCredits(data)
      if (action === 'resume') { el.remove(); this.el = null; this.game.resumeAfterEnding() }
      if (action === 'title') { el.remove(); this.el = null; this.game.returnToTitle(true) }
    })
    this.game.audio?.sfx('levelup')
  }

  showCredits(data = {}) {
    document.querySelectorAll('.ending-screen, .credits-screen').forEach(e => e.remove())
    const el = document.createElement('div')
    el.className = 'credits-screen'
    el.id = 'credits-screen'
    el.innerHTML = `
      <div class="eyebrow" style="justify-content:center">UNA LEYENDA ORIGINAL DE IA GAME LAB</div>
      <h2 class="gold-text">La Espada Celestial</h2>
      <div class="credits-sub">El Velo se está rompiendo. Alguien tenía que decidir qué hay al otro lado.</div>
      <div class="credits-block"><h3>DIRECCIÓN Y DISEÑO</h3><p>IA Game Lab · mundo, narrativa, sistemas y dirección de arte originales</p></div>
      <div class="credits-block"><h3>PROGRAMACIÓN</h3><p>Motor de acción y exploración en Three.js<br>Combate, IA, misiones, criaturas, guardado y accesibilidad</p></div>
      <div class="credits-block"><h3>ARTE</h3><p>Modelos, escenarios, retratos y efectos generados proceduralmente<br>Valdoria · Drakmor · Kansordore</p></div>
      <div class="credits-block"><h3>MÚSICA Y SONIDO</h3><p>Composición y síntesis procedural en Web Audio<br>Temas adaptativos por región e intensidad de combate</p></div>
      <div class="credits-block"><h3>TECNOLOGÍA</h3><p>Three.js · Vite · Web Audio API · Canvas 2D<br>Tipografías Cinzel y Cormorant Garamond (SIL Open Font License)</p></div>
      <div class="credits-block long"><p>Todo el contenido de La Espada Celestial —personajes, criaturas, regiones, historia, música y arte— es original. No se han utilizado personajes, historias, diseños ni propiedades intelectuales de terceros.</p></div>
      <div class="credits-block long"><p>El objetivo de esta obra es la excelencia. «GOTY» es una aspiración, no un premio obtenido. Gracias por jugar, por explorar y por escuchar a las criaturas.</p></div>
      <div class="credits-block"><h3>GRACIAS</h3><p>A ti, Jugador Cero.<br>El mundo seguirá existiendo mientras alguien recuerde haberlo elegido.</p></div>
      <div class="menu-actions-row" style="justify-content:center">
        <button class="gold-btn primary" data-action="back-ending">Volver al final</button>
        <button class="ghost-btn" data-action="title">Menú principal</button>
      </div>
      <div class="credits-sub" style="margin-top:24px;font-size:12px">v1.0.0 · 2026 · Navegador y Android</div>
    `
    document.getElementById('ui').appendChild(el)
    el.addEventListener('click', e => {
      const action = e.target.closest('[data-action]')?.dataset.action
      if (!action) return
      if (action === 'back-ending') {
        el.remove()
        const type = this.game.flags?.ending || 'open'
        this.showEnding(type, { ...data, save: this.game.save })
      }
      if (action === 'title') { el.remove(); this.game.returnToTitle(true) }
    })
  }

  time(seconds) {
    const h = Math.floor(seconds / 3600), m = Math.floor((seconds % 3600) / 60)
    return h > 0 ? `${h}h ${m}m` : `${m}m`
  }

  esc(s = '') { return this.ui.escape(s) }
}
