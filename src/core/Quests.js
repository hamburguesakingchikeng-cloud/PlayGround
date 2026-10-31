import { QUESTS, MAIN_ORDER } from '../data/quests.js'
import { item } from '../data/items.js'

export class QuestManager {
  constructor(game) {
    this.game = game
    this.state = {}
    this.completedRecently = new Map()
    this.tracked = null
  }

  start(id, silent = false) {
    const def = QUESTS[id]
    if (!def || this.state[id]) return false
    this.state[id] = { state: 'active', step: 0, progress: def.steps.map(() => 0), interacted: [], captures: [], startedAt: Date.now() }
    if (def.type === 'main' || !this.tracked) this.tracked = id
    if (!silent) {
      this.game.ui?.questBanner('Nueva misión', def.title)
      this.game.audio?.sfx('quest')
      this.game.toast(`Misión iniciada: <b>${def.title}</b>`, '✦')
      this.game.autoSave()
    }
    this.updateCollect(id)
    this.game.onQuestStep?.(id, def.steps[0])
    return true
  }

  restore(saved) {
    this.state = saved?.state || {}
    this.tracked = saved?.tracked || null
    for (const [id, s] of Object.entries(this.state)) {
      if (!Array.isArray(s.progress)) s.progress = QUESTS[id]?.steps.map(() => 0) || []
      if (!Array.isArray(s.interacted)) s.interacted = []
      if (!Array.isArray(s.captures)) s.captures = []
      const def = QUESTS[id]
      if (s.state === 'active' && def) this.game.onQuestStep?.(id, def.steps[s.step])
    }
  }

  serialize() { return { state: this.state, tracked: this.tracked } }

  isActive(id) { return this.state[id]?.state === 'active' }
  isComplete(id) { return this.state[id]?.state === 'complete' }
  isStarted(id) { return !!this.state[id] }
  def(id) { return QUESTS[id] }
  stepIndex(id) { return this.state[id]?.step ?? 0 }
  currentStep(id) { const s = this.state[id]; return s ? QUESTS[id]?.steps[s.step] : null }
  stepProgress(id, i) { return this.state[id]?.progress?.[i] ?? 0 }
  wasJustCompleted(id) { const t = this.completedRecently.get(id); return t && performance.now() - t < 8000 }

  activeQuests() {
    return Object.entries(this.state).filter(([, s]) => s.state === 'active').map(([id]) => id)
      .sort((a, b) => (QUESTS[a].type === 'main' ? 0 : 1) - (QUESTS[b].type === 'main' ? 0 : 1))
  }

  trackedQuest() {
    if (this.tracked && this.isActive(this.tracked)) return this.tracked
    const act = this.activeQuests()
    return act[0] || null
  }

  setTracked(id) { if (this.isActive(id)) this.tracked = id }

  advance(id, stepIndex = null) {
    const s = this.state[id]
    const def = QUESTS[id]
    if (!s || s.state !== 'active') return
    if (stepIndex !== null && s.step !== stepIndex) return
    const step = def.steps[s.step]
    if (!step) return
    s.step++
    if (s.step >= def.steps.length) this.complete(id)
    else {
      this.game.onQuestStep?.(id, def.steps[s.step])
      this.game.ui?.refreshHUD()
      this.game.autoSave()
    }
  }

  complete(id) {
    const s = this.state[id]
    const def = QUESTS[id]
    if (!s || s.state === 'complete') return
    s.state = 'complete'
    s.completedAt = Date.now()
    this.completedRecently.set(id, performance.now())
    const r = def.rewards || {}
    if (r.xp) this.game.addXP(r.xp, true)
    if (r.gold) this.game.addGold(r.gold, true)
    if (r.items) r.items.forEach(it => this.game.addItem(it.id, it.qty, true))
    if (r.resonance) this.game.addResonance(r.resonance)
    if (def.completionFlag) this.game.flags[def.completionFlag] = true
    this.game.ui?.questBanner('Misión completada', def.title)
    this.game.audio?.sfx('levelup')
    this.game.toast(`<b>${def.title}</b> completada`, '✧')
    this.game.autoSave()
    this.game.onQuestComplete?.(id)
    if (def.next && !this.state[def.next]) setTimeout(() => { if (!this.game.destroyed) this.start(def.next) }, 1400)
    if (this.tracked === id) this.tracked = this.activeQuests()[0] || null
    this.game.ui?.refreshHUD()
  }

  notifyTalk(npcId) {
    for (const id of this.activeQuests()) {
      const step = this.currentStep(id)
      if (!step) continue
      if (step.type === 'talk' && step.target === npcId) this.advance(id)
      if (QUESTS[id].region && QUESTS[id].region !== this.game.zoneId) continue
    }
  }

  notifyKill(enemyId) {
    for (const id of this.activeQuests()) {
      const step = this.currentStep(id)
      if (!step) continue
      if (step.type === 'kill' && (step.target === enemyId || step.target === 'any')) {
        const s = this.state[id]
        s.progress[s.step] = Math.min(step.count || 1, (s.progress[s.step] || 0) + 1)
        if (s.progress[s.step] >= (step.count || 1)) this.advance(id)
        else this.game.ui?.refreshHUD()
      }
      if (step.type === 'boss' && step.target === enemyId) this.advance(id)
    }
  }

  notifyCapture(creatureId) {
    for (const id of this.activeQuests()) {
      const step = this.currentStep(id)
      if (!step || step.type !== 'capture') continue
      const s = this.state[id]
      if (step.target !== 'any' && step.target !== creatureId) continue
      if (!s.captures.includes(creatureId)) s.captures.push(creatureId)
      s.progress[s.step] = Math.min(step.count || 1, s.captures.length)
      this.game.ui?.captureFlash?.()
      if (s.progress[s.step] >= (step.count || 1)) this.advance(id)
      else this.game.ui?.refreshHUD()
    }
  }

  notifyInteract(target, objectId) {
    for (const id of this.activeQuests()) {
      const step = this.currentStep(id)
      if (!step || step.type !== 'interact' || step.target !== target) continue
      const s = this.state[id]
      if (s.interacted.includes(objectId)) continue
      s.interacted.push(objectId)
      s.progress[s.step] = (s.progress[s.step] || 0) + 1
      if (s.progress[s.step] >= (step.count || 1)) this.advance(id)
      else this.game.ui?.refreshHUD()
    }
  }

  notifyGoto(zoneId, x, z) {
    for (const id of this.activeQuests()) {
      const def = QUESTS[id]
      if (def.region !== zoneId) continue
      const step = this.currentStep(id)
      if (!step || step.type !== 'goto' || !step.pos) continue
      const d = Math.hypot(x - step.pos[0], z - step.pos[1])
      if (d <= (step.radius || 4)) {
        this.advance(id)
        this.game.audio?.sfx('discover')
        this.game.ui?.flashZone?.()
      }
    }
  }

  updateCollect(id = null) {
    const ids = id ? [id] : this.activeQuests()
    for (const qid of ids) {
      if (!this.isActive(qid)) continue
      const step = this.currentStep(qid)
      if (!step || step.type !== 'collect') continue
      const s = this.state[qid]
      const have = this.game.inventoryCount(step.target)
      s.progress[s.step] = Math.min(step.count, have)
      if (have >= step.count) this.advance(qid)
    }
    this.game.ui?.refreshHUD?.()
  }

  objectiveLabel(id) {
    const step = this.currentStep(id)
    if (!step) return ''
    const s = this.state[id]
    const n = s.progress[s.step] || 0
    const count = step.count || 1
    return { text: step.label, current: n, count, done: count > 1 && n >= count, pos: step.pos, zone: QUESTS[id].region }
  }

  mainProgress() {
    const done = MAIN_ORDER.filter(id => this.isComplete(id)).length
    return { done, total: MAIN_ORDER.length, pct: done / MAIN_ORDER.length }
  }

  regionFor(id) { return QUESTS[id]?.region }
  rewardText(id) {
    const r = QUESTS[id].rewards || {}
    const parts = []
    if (r.xp) parts.push(`${r.xp} px`)
    if (r.gold) parts.push(`${r.gold} oro`)
    if (r.items) r.items.forEach(i => parts.push(item(i.id).name))
    return parts
  }
}
