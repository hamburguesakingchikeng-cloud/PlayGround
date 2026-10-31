import { NPCS, SCRIPTED } from '../data/dialogues.js'

// Intérprete de árboles de diálogo. Los nodos pueden encadenarse con `next`,
// las elecciones pueden ejecutar acciones y devolver otro nodo.
export class DialogueSystem {
  constructor(game) {
    this.game = game
    this.node = null
    this.ctx = null
    this.open = false
  }

  npc(npc) {
    const fn = NPCS[npc.def.id]
    if (!fn) return null
    return fn(this.game)
  }

  scripted(id, ctx = {}) {
    const fn = SCRIPTED[id]
    if (!fn) return null
    return fn(this.game, ctx)
  }

  startNpc(npc) {
    const node = this.npc(npc)
    if (!node) return false
    this.start(node, {
      npc,
      portraitId: npc.def.portrait || npc.def.id,
      colors: npc.def.colors,
      onClose: () => { this.game.onDialogueClosed(npc) }
    })
    return true
  }

  startScripted(id, ctx = {}) {
    const node = this.scripted(id, ctx)
    if (!node) return false
    this.start(node, {
      portraitId: ctx.portraitId || 'player',
      colors: ctx.colors || {},
      onClose: () => { this.game.onDialogueClosed(null, ctx) }
    })
    return true
  }

  start(node, ctx = {}) {
    this.open = true
    this.ctx = ctx
    this.show(node)
  }

  normalize(node) {
    if (typeof node === 'function') node = node(this.game)
    if (!node || node === 'close') return null
    if (typeof node === 'string') return { text: node, next: 'close' }
    return node
  }

  show(node) {
    node = this.normalize(node)
    if (!node) { this.close(); return }
    this.node = node
    const data = {
      speaker: node.speaker || this.ctx?.npc?.def?.name || '',
      role: node.role || this.ctx?.npc?.def?.role || '',
      text: node.text || '',
      choices: (node.choices || []).map(c => ({ label: c.label, sub: c.sub })),
      portraitId: node.portraitId || this.ctx?.portraitId || 'player',
      colors: node.colors || this.ctx?.colors || {},
      moral: node.moral,
      hint: node.choices?.length ? 'ELIGE UNA RESPUESTA' : 'CLIC / ESPACIO PARA CONTINUAR'
    }
    if (this.game.ui.dialogue) this.game.ui.updateDialogue(data)
    else this.game.ui.showDialogue(data, {
      onAdvance: () => this.advance(),
      onChoice: i => this.choose(i),
      onClose: () => this.close()
    })
    this.game.audio?.sfx('ui')
  }

  advance() {
    if (!this.open) return
    const node = this.node
    if (!node) { this.close(); return }
    if (node.next) {
      const next = typeof node.next === 'function' ? node.next(this.game) : node.next
      if (next && next !== 'close') this.show(next)
      else this.close()
      return
    }
    this.close()
  }

  choose(index) {
    if (!this.open || !this.node) return
    const choice = this.node.choices?.[index]
    if (!choice) return
    try { choice.act?.(this.game) } catch (err) { console.error('Error en elección de diálogo', err) }
    const to = typeof choice.to === 'function' ? choice.to(this.game) : choice.to
    if (to && to !== 'close') {
      this.show(to)
      return
    }
    this.close()
  }

  close() {
    if (!this.open) return
    this.open = false
    this.game.ui.hideDialogue()
    const ctx = this.ctx
    this.ctx = null
    this.node = null
    setTimeout(() => ctx?.onClose?.(), 30)
  }
}
