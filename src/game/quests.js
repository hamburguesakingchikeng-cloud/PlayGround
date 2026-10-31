import { QUESTS } from '../data/quests.js';

export class QuestSystem {
  constructor(game) {
    this.game = game;
    this.active = {};
    this.completed = new Set();
    this.justCompleted = null;
  }

  start(id, silent = false) {
    const def = QUESTS[id];
    if (!def || this.active[id] || this.completed.has(id)) return false;
    this.active[id] = { stage: 0, progress: def.stages[0].objectives.map(() => 0), startedAt: Date.now() };
    if (!silent) {
      this.game.ui.toast('Nueva misión', def.title, 'quest');
      this.game.audio.sfx('quest');
    }
    this.refreshCollect(id);
    this.game.events.emit('questStart', { id, def });
    this.game.autosave();
    return true;
  }

  isActive(id) { return Boolean(this.active[id]); }
  isCompleted(id) { return this.completed.has(id); }
  stageIndex(id) { return this.active[id]?.stage ?? -1; }
  def(id) { return QUESTS[id]; }

  currentStage(id) {
    const a = this.active[id];
    if (!a) return null;
    return QUESTS[id]?.stages[a.stage] || null;
  }

  objectiveProgress(id, index) {
    return this.active[id]?.progress[index] || 0;
  }

  event(type, target, amount = 1) {
    for (const id of Object.keys(this.active)) {
      const def = QUESTS[id];
      const a = this.active[id];
      const stage = def?.stages[a.stage];
      if (!stage) continue;
      let changed = false;
      stage.objectives.forEach((obj, i) => {
        if (obj.type !== type || obj.target !== target) return;
        const need = obj.count || 1;
        const before = a.progress[i] || 0;
        a.progress[i] = Math.min(need, before + amount);
        if (a.progress[i] !== before) changed = true;
      });
      if (changed) this.check(id);
    }
  }

  refreshCollect(id = null) {
    const ids = id ? [id] : Object.keys(this.active);
    for (const qid of ids) {
      const def = QUESTS[qid], a = this.active[qid];
      if (!def || !a) continue;
      const stage = def.stages[a.stage];
      if (!stage) continue;
      let changed = false;
      stage.objectives.forEach((obj, i) => {
        if (obj.type !== 'collect') return;
        const need = obj.count || 1;
        const have = Math.min(need, this.game.inventory.count(obj.target));
        if (have !== a.progress[i]) { a.progress[i] = have; changed = true; }
      });
      if (changed) this.check(qid);
    }
  }

  check(id) {
    const def = QUESTS[id], a = this.active[id];
    if (!def || !a) return;
    const stage = def.stages[a.stage];
    if (!stage) return;
    const done = stage.objectives.every((obj, i) => (a.progress[i] || 0) >= (obj.count || 1));
    if (!done) return;
    if (a.stage < def.stages.length - 1) {
      a.stage++;
      a.progress = def.stages[a.stage].objectives.map(() => 0);
      this.game.ui.toast('Misión actualizada', def.stages[a.stage].text, 'quest');
      this.game.audio.sfx('quest');
      this.refreshCollect(id);
      this.check(id);
    } else {
      this.complete(id);
    }
  }

  complete(id) {
    const def = QUESTS[id];
    if (!def) return;
    delete this.active[id];
    this.completed.add(id);
    this.justCompleted = id;
    this.game.ui.toast('Misión completada', def.title, 'complete');
    this.game.audio.sfx('levelup');
    this.game.giveRewards(def.rewards || {});
    if (def.onComplete?.flags) {
      for (const [flag, value] of Object.entries(def.onComplete.flags)) this.game.setFlag(flag, value);
    }
    this.game.events.emit('questComplete', { id, def });
    if (def.next) this.start(def.next);
    this.game.autosave();
  }

  tracked() {
    const mains = Object.keys(this.active).filter(id => QUESTS[id]?.type === 'main');
    const sides = Object.keys(this.active).filter(id => QUESTS[id]?.type === 'side');
    return mains[0] || sides[0] || null;
  }

  trackedObjective() {
    const id = this.tracked();
    if (!id) return null;
    const def = QUESTS[id], a = this.active[id];
    const stage = def.stages[a.stage];
    if (!stage) return null;
    const obj = stage.objectives.find((o, i) => (a.progress[i] || 0) < (o.count || 1)) || stage.objectives[0];
    const idx = stage.objectives.indexOf(obj);
    return { quest: id, def, stage, objective: obj, progress: a.progress[idx] || 0, need: obj.count || 1 };
  }

  markers() {
    const out = [];
    for (const id of Object.keys(this.active)) {
      const def = QUESTS[id], a = this.active[id];
      const stage = def.stages[a.stage];
      if (!stage) continue;
      stage.objectives.forEach((obj, i) => {
        if ((a.progress[i] || 0) >= (obj.count || 1)) return;
        out.push({ ...obj, quest: id, main: def.type === 'main', progress: a.progress[i] || 0, need: obj.count || 1 });
      });
    }
    return out;
  }

  serialize() {
    return { active: JSON.parse(JSON.stringify(this.active)), completed: [...this.completed] };
  }
  deserialize(data) {
    this.active = data?.active || {};
    this.completed = new Set(data?.completed || []);
  }
}
