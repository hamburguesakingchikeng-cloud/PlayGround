/* Combate por turnos: iniciativa, habilidades, estados, objetos, jefes y recompensas */
(function () {
  const EG = window.EG;

  const B = {
    active: false,
    s: null,

    start(enemyIds, opts) {
      const game = EG.game;
      const state = game.state;
      const enemies = enemyIds.map((id, i) => makeEnemy(id, i));
      const party = state.party.map((a, i) => makeAlly(a, i));
      const s = {
        party,
        enemies,
        order: [],
        turn: 0,
        round: 1,
        phase: 'intro',
        timer: 1.1,
        log: [],
        popups: [],
        anim: null,
        cursor: 0,
        subCursor: 0,
        target: 0,
        actor: null,
        pending: null,
        after: null,
        opts: opts || {},
        time: 0,
        result: null,
        rewards: null,
        taunt: null,
        shake: 0,
        flash: 0,
      };
      this.s = s;
      this.active = true;
      const boss = enemies.some((e) => e.isBoss);
      EG.Audio.music(boss ? 'boss' : 'battle');
      this.log(boss ? '¡Un poder inmenso bloquea el camino!' : '¡Enemigos a la vista!');
      s.order = this.buildOrder();
    },

    buildOrder() {
      const s = this.s;
      const all = [...s.party, ...s.enemies].filter((c) => c.hp > 0);
      all.sort((a, b) => (b.spd + Math.random() * 3) - (a.spd + Math.random() * 3));
      return all;
    },

    log(text) {
      if (!this.s) return;
      this.s.log.push(text);
      if (this.s.log.length > 6) this.s.log.shift();
    },

    current() {
      const s = this.s;
      return s.order[s.turn];
    },

    alliesAlive() {
      return this.s.party.filter((a) => a.hp > 0);
    },
    enemiesAlive() {
      return this.s.enemies.filter((a) => a.hp > 0);
    },

    /* ------------------------------- TURNOS ------------------------------- */

    nextTurn() {
      const s = this.s;
      if (!this.active) return;
      if (this.enemiesAlive().length === 0) return this.victory();
      if (this.alliesAlive().length === 0) return this.defeat();

      if (s.turn >= s.order.length) {
        s.round++;
        s.order = this.buildOrder();
        s.turn = 0;
        this.log('— Ronda ' + s.round + ' —');
      }
      const c = s.order[s.turn];
      if (!c || c.hp <= 0) { s.turn++; return this.nextTurn(); }

      s.actor = c;
      s.pending = null;
      s.cursor = 0;
      s.subCursor = 0;
      s.taunt = s.taunt && s.taunt.hp > 0 ? s.taunt : null;

      // estados al inicio del turno
      const dot = this.tickStatus(c);
      if (dot) return this.wait(0.7, () => { s.turn++; this.nextTurn(); });
      if (c.hp <= 0) return this.wait(0.5, () => { s.turn++; this.nextTurn(); });

      if (c.status.aturdido > 0) {
        c.status.aturdido--;
        this.log(`${c.name} está aturdido y pierde el turno.`);
        return this.wait(0.7, () => { s.turn++; this.nextTurn(); });
      }

      if (c.side === 'ally') {
        s.phase = 'command';
      } else {
        s.phase = 'enemyThink';
        s.timer = 0.65;
      }
    },

    tickStatus(c) {
      let any = false;
      if (c.hp <= 0) return false;
      if (c.status.veneno > 0) {
        c.status.veneno--;
        const dmg = Math.max(1, Math.round(c.maxhp * 0.07));
        c.hp = Math.max(0, c.hp - dmg);
        this.popup(c, dmg, '#9ce87a');
        this.log(`${c.name} sufre veneno (${dmg}).`);
        any = true;
        if (c.hp <= 0) this.log(`${c.name} cae.`);
      }
      if (c.status.quemado > 0) {
        c.status.quemado--;
        const dmg = Math.max(1, Math.round(c.maxhp * 0.055));
        c.hp = Math.max(0, c.hp - dmg);
        this.popup(c, dmg, '#ff9a5a');
        this.log(`${c.name} arde (${dmg}).`);
        any = true;
        if (c.hp <= 0) this.log(`${c.name} cae.`);
      }
      for (const k of ['atk', 'def']) {
        if (c.buffs[k]) {
          c.buffs[k].turns--;
          if (c.buffs[k].turns <= 0) delete c.buffs[k];
        }
      }
      if (any) EG.Audio.sfx('hit');
      return any;
    },

    wait(seconds, cb) {
      const s = this.s;
      s.phase = 'wait';
      s.timer = seconds;
      s.after = cb;
    },

    /* ------------------------------ ACCIONES ------------------------------ */

    commands() {
      const a = this.s.actor;
      const skills = a.ref ? a.ref.skills : [];
      const items = EG.game.consumables();
      return [
        { label: 'Atacar', icon: 'sword', enabled: true },
        { label: 'Habilidad', icon: 'star', enabled: skills.length > 0, sub: skills.length ? `${skills.length} disponibles` : 'Sin habilidades' },
        { label: 'Objeto', icon: 'potion', enabled: items.length > 0, sub: items.length ? `${items.length} tipos` : 'Sin objetos' },
        { label: 'Defender', icon: 'shield', enabled: true },
        { label: 'Huir', icon: 'boot', enabled: !this.s.enemies.some((e) => e.isBoss) },
      ];
    },

    actorSkills() {
      const a = this.s.actor;
      if (!a.ref) return [];
      return a.ref.skills.map((id) => {
        const sk = EG.data.SKILLS[id];
        return { id, ...sk, enabled: a.mp >= (sk.mp || 0) };
      }).filter((x) => x.name);
    },

    actorItems() {
      const list = [];
      for (const [id, n] of Object.entries(EG.game.state.items)) {
        const it = EG.data.ITEMS[id];
        if (!it || it.kind !== 'consumible' || n <= 0) continue;
        list.push({ id, ...it, count: n });
      }
      return list;
    },

    chooseCommand(idx) {
      const s = this.s;
      const cmd = this.commands()[idx];
      if (!cmd || !cmd.enabled) { EG.Audio.sfx('cancel'); return; }
      EG.Audio.sfx('select');
      if (idx === 0) {
        s.pending = { kind: 'attack' };
        this.beginTarget('enemy');
      } else if (idx === 1) {
        s.phase = 'skill';
        s.subCursor = 0;
      } else if (idx === 2) {
        s.phase = 'item';
        s.subCursor = 0;
      } else if (idx === 3) {
        this.execute({ kind: 'defend' });
      } else if (idx === 4) {
        this.execute({ kind: 'flee' });
      }
    },

    beginTarget(kind) {
      const s = this.s;
      const list = kind === 'enemy' ? this.enemiesAlive() : this.alliesAlive();
      s.phase = 'target';
      s.target = 0;
      s.targetKind = kind;
      s.targetList = list;
      if (!list.length) { s.turn++; this.nextTurn(); }
    },

    validTargets(kind) {
      return kind === 'enemy' ? this.enemiesAlive() : this.alliesAlive();
    },

    confirmTarget() {
      const s = this.s;
      const t = s.targetList[s.target];
      if (!t) return;
      const pending = s.pending;
      EG.Audio.sfx('select');
      if (pending.kind === 'attack') this.execute({ kind: 'attack', target: t });
      else if (pending.kind === 'skill') {
        const sk = pending.skill;
        this.execute({ kind: 'skill', skill: sk, target: sk.target === 'allEnemies' || sk.target === 'allAllies' ? null : t });
      } else if (pending.kind === 'item') {
        this.execute({ kind: 'item', item: pending.item, target: t });
      }
    },

    followUp(kind) {
      const s = this.s;
      s.pending = { kind };
      this.beginTarget(kind === 'enemy' ? 'enemy' : 'ally');
    },

    /* ------------------------------- EJECUTAR ------------------------------- */

    execute(action) {
      const s = this.s;
      const actor = s.actor;
      if (!actor || actor.hp <= 0) { s.turn++; return this.nextTurn(); }
      s.phase = 'anim';
      s.anim = { t: 0, dur: 0.75 };
      s.timer = 0.75;
      s.pending = action;
      this.resolve(actor, action);
      s.after = () => {
        s.turn++;
        this.nextTurn();
      };
      if (action.kind === 'flee') {
        s.phase = 'wait';
        s.timer = 0.5;
        s.after = () => {
          if (s.fled) this.finish('flee');
          else { s.turn++; this.nextTurn(); }
        };
      }
    },

    resolve(actor, action) {
      const s = this.s;
      if (!action) return;
      if (action.kind === 'defend') {
        actor.defending = true;
        this.log(`${actor.name} se protege.`);
        EG.Audio.sfx('select');
        return;
      }
      if (action.kind === 'flee') {
        this.log(`${actor.name} intenta huir…`);
        EG.Audio.sfx('flee');
        const enemySpd = Math.max(...this.enemiesAlive().map((e) => e.spd));
        const chance = 0.5 + (actor.spd - enemySpd) * 0.02;
        if (Math.random() < chance) {
          s.fled = true;
          this.log('¡Habéis escapado!');
        } else {
          this.log('¡No hay escapatoria!');
        }
        return;
      }
      if (action.kind === 'attack') {
        const target = action.target;
        if (!target || target.hp <= 0) return;
        const weapon = actor.ref ? actor.ref.equip.arma : null;
        const element = (weapon && EG.data.ITEMS[weapon] && EG.data.ITEMS[weapon].element) || 'fisico';
        this.dealDamage(actor, target, { power: 100, element, physical: true });
        this.tryStatus(target, { id: null });
        actor.anim = { type: 'lunge', t: 0 };
        return;
      }
      if (action.kind === 'skill') {
        const sk = action.skill;
        if (actor.mp < (sk.mp || 0)) { this.log('No hay suficiente PM.'); return; }
        actor.mp -= sk.mp || 0;
        this.log(`${actor.name} usa ${sk.name}.`);
        EG.Audio.sfx(sk.heal ? 'heal' : 'magic');
        actor.anim = { type: 'cast', t: 0 };
        const targets = sk.target === 'allEnemies' ? this.enemiesAlive()
          : sk.target === 'allAllies' ? this.alliesAlive()
            : sk.target === 'self' ? [actor]
              : sk.target === 'ally' ? [action.target || actor]
                : [action.target].filter(Boolean);
        if (sk.buff) {
          for (const t of targets) {
            const key = sk.buff.atk ? 'atk' : 'def';
            t.buffs[key] = { amt: sk.buff.atk || sk.buff.def, turns: sk.buff.turns };
            this.popup(t, key === 'atk' ? 'ATQ↑' : 'DEF↑', '#ffe066');
          }
          return;
        }
        if (sk.heal) {
          for (const t of targets) {
            const amount = Math.min(sk.heal, t.maxhp - t.hp);
            t.hp += amount;
            this.popup(t, '+' + amount, '#7fe89a');
          }
          return;
        }
        if (sk.taunt) {
          s.taunt = actor;
          this.log(`${actor.name} atrae la atención de los enemigos.`);
          this.popup(actor, 'PROVOCA', '#ffe066');
          return;
        }
        for (const t of targets) {
          if (!t || t.hp <= 0) continue;
          this.dealDamage(actor, t, {
            power: sk.power, element: sk.element, magic: sk.magic, drain: sk.drain, drainMp: sk.drainMp,
          });
          if (sk.status && t.hp > 0) this.tryStatus(t, sk.status);
        }
        return;
      }
      if (action.kind === 'item') {
        const it = action.item;
        if (!EG.game.countItem(it.id)) { this.log('Ya no queda.'); return; }
        EG.game.addItem(it.id, -1);
        this.log(`${actor.name} usa ${it.name}.`);
        EG.Audio.sfx('heal');
        const target = action.target || actor;
        if (it.use) {
          if (it.use.hp) {
            const amount = Math.min(it.use.hp, target.maxhp - target.hp);
            target.hp += amount;
            this.popup(target, '+' + amount, '#7fe89a');
          }
          if (it.use.mp) {
            const amount = Math.min(it.use.mp, target.maxmp - target.mp);
            target.mp += amount;
            this.popup(target, '+' + amount + ' PM', '#7fd8e8');
          }
          if (it.use.cure) for (const st of it.use.cure) delete target.status[st];
          if (it.use.damage) {
            for (const e of this.enemiesAlive()) this.dealDamage(actor, e, { power: it.use.damage, element: it.use.element, magic: true });
          }
        }
        return;
      }
    },

    tryStatus(target, status) {
      if (!status || !status.id) return;
      if (Math.random() > (status.chance || 0.3)) return;
      const id = status.id;
      if (id === 'aturdido') {
        target.status.aturdido = 1;
        this.popup(target, 'ATURDIDO', '#ffe066');
        this.log(`${target.name} queda aturdido.`);
      } else {
        target.status[id] = 3;
        this.popup(target, id === 'veneno' ? 'VENENO' : 'QUEMADO', id === 'veneno' ? '#9ce87a' : '#ff9a5a');
        this.log(`${target.name} sufre ${id}.`);
      }
    },

    dealDamage(source, target, opts) {
      const s = this.s;
      const element = opts.element || 'fisico';
      const physical = opts.physical || !opts.magic;
      const atk = physical ? this.stat(source, 'atk') : this.stat(source, 'mag');
      let def = physical ? this.stat(target, 'def') : this.stat(target, 'res');
      if (target.defending) def *= 2;
      const crit = Math.random() < 0.09;
      let dmg = EG.data.damage({
        atk, power: opts.power || 100, def, element,
        target: target.data || {}, crit,
      });
      const mult = EG.data.elementMult(target.data || {}, element);
      if (mult === 0) {
        this.popup(target, 'INMUNE', '#9aa3bd');
        this.log(`${target.name} es inmune a ${EG.data.ELEMENTS[element].name}.`);
        return;
      }
      target.hp = Math.max(0, target.hp - dmg);
      this.popup(target, dmg, crit ? '#ffd166' : EG.data.ELEMENTS[element].color);
      if (mult > 1.2) this.popup(target, '¡DÉBIL!', '#ffe066', 18);
      if (mult < 0.9) this.popup(target, 'RESISTE', '#9aa3bd', 18);
      if (crit) this.log('¡Golpe crítico!');
      if (element === 'luz') this.log(`${target.name} recibe ${dmg} de luz.`);
      else if (element !== 'fisico') this.log(`${target.name} recibe ${dmg} de ${EG.data.ELEMENTS[element].name.toLowerCase()}.`);
      else this.log(`${target.name} recibe ${dmg} de daño.`);
      EG.Audio.sfx(crit ? 'crit' : 'hit');
      s.shake = Math.min(8, 3 + dmg * 0.05);
      target.hitT = 0.25;
      if (opts.drain) {
        const heal = Math.round(dmg * 0.5);
        source.hp = Math.min(source.maxhp, source.hp + heal);
        this.popup(source, '+' + heal, '#7fe89a');
      }
      if (opts.drainMp && target.mp > 0) {
        const mp = Math.min(12, target.mp);
        target.mp -= mp;
        source.mp = Math.min(source.maxmp, source.mp + mp);
        this.popup(source, '+' + mp + ' PM', '#7fd8e8');
      }
      if (target.hp <= 0) {
        this.log(`${target.name} cae.`);
        if (target.side === 'enemy') EG.Audio.sfx('coin');
      }
    },

    stat(c, key) {
      let v = c[key] || 0;
      if (key === 'atk' && c.status && c.status.quemado) v *= 0.8;
      if (c.buffs && c.buffs[key]) v *= 1 + c.buffs[key].amt;
      if (c.defending && key === 'def') v *= 1.6;
      return v;
    },

    popup(c, text, color, offset) {
      this.s.popups.push({
        x: c.slotX || 0, y: c.slotY || 0, text: String(text), color: color || '#fff', t: 0, life: 1.1, off: offset || 0,
      });
    },

    /* -------------------------------- IA -------------------------------- */

    enemyAct() {
      const s = this.s;
      const c = s.actor;
      if (!c || c.hp <= 0) { s.turn++; return this.nextTurn(); }
      const def = c.data;
      let move = null;
      const pool = (def.moves || []).filter((m) => EG.data.SKILLS[m.id]);
      if (pool.length) {
        const total = pool.reduce((n, m) => n + (m.w || 1), 0);
        let r = Math.random() * total;
        for (const m of pool) { r -= m.w || 1; if (r <= 0) { move = EG.data.SKILLS[m.id]; break; } }
      }
      if (!move) move = EG.data.SKILLS.embestida;

      // fase 2 del jefe final
      if (def.id === 'lord_eclipse' && !c.phase2 && c.hp < c.maxhp * 0.5) {
        c.phase2 = true;
        c.buffs.atk = { amt: 0.3, turns: 99 };
        c.buffs.def = { amt: 0.15, turns: 99 };
        this.log('Lord Eclipse se despoja de su forma mortal. ¡La noche se espesa!');
        this.popup(c, 'ECLIPSE TOTAL', '#b07aff', 22);
        EG.Audio.sfx('magic');
        s.anim = { t: 0, dur: 0.9 };
        s.phase = 'anim';
        s.timer = 0.9;
        s.after = () => { s.turn++; this.nextTurn(); };
        return;
      }
      if ((def.id === 'arana_reina') && !c.phase2 && c.hp < c.maxhp * 0.4) {
        c.phase2 = true;
        c.buffs.atk = { amt: 0.25, turns: 99 };
        this.log('La Araña Reina entra en frenesí. Su veneno hierve.');
        EG.Audio.sfx('magic');
      }

      const allies = this.alliesAlive();
      let target;
      if (s.taunt && s.taunt.hp > 0 && Math.random() < 0.8) target = s.taunt;
      else if (move.target === 'allEnemies') target = null;
      else target = allies[Math.floor(Math.random() * allies.length)];
      if (!target && move.target !== 'allEnemies') { s.turn++; return this.nextTurn(); }

      this.log(`${c.name} usa ${move.name}.`);
      EG.Audio.sfx('magic');
      s.anim = { t: 0, dur: 0.7 };
      s.phase = 'anim';
      s.timer = 0.7;

      if (move.buff) {
        const key = move.buff.atk ? 'atk' : 'def';
        c.buffs[key] = { amt: move.buff.atk || move.buff.def, turns: move.buff.turns };
        this.popup(c, key === 'atk' ? 'ATQ↑' : 'DEF↑', '#ffe066');
      } else if (move.heal) {
        c.hp = Math.min(c.maxhp, c.hp + move.heal);
        this.popup(c, '+' + move.heal, '#7fe89a');
      } else if (move.status && !move.power) {
        for (const t of move.target === 'allEnemies' ? allies : [target]) this.tryStatus(t, move.status);
      } else {
        const targets = move.target === 'allEnemies' ? allies : [target];
        for (const t of targets) {
          if (!t || t.hp <= 0) continue;
          this.dealDamage(c, t, { power: move.power, element: move.element, magic: move.magic, drain: move.drain, drainMp: move.drainMp });
          if (move.status && t.hp > 0) this.tryStatus(t, move.status);
        }
      }
      s.after = () => { s.turn++; this.nextTurn(); };
    },

    /* ------------------------------- FIN ------------------------------- */

    victory() {
      const s = this.s;
      s.phase = 'victory';
      s.result = 'win';
      s.timer = 2.6;
      EG.Audio.stopMusic();
      EG.Audio.sfx('victory');
      let xp = 0, gold = 0;
      const drops = [];
      for (const e of s.enemies) {
        xp += e.data.xp || 0;
        gold += e.data.gold || 0;
        for (const d of e.data.drops || []) {
          if (Math.random() < d.chance && EG.game.addItem(d.item, 1)) drops.push(d.item);
        }
      }
      s.rewards = { xp, gold, drops, levels: [] };
      EG.game.state.gold += gold;
      for (const a of EG.game.state.party) {
        if (a.hp <= 0) a.hp = 1;
        a.xp += xp;
        const ups = EG.data.levelUp(a);
        for (const u of ups) s.rewards.levels.push({ name: a.name, lvl: u.lvl, skills: u.skills });
        const mx = EG.data.maxHp(a);
        if (a.hp < 1) a.hp = 1;
        if (a.hp > mx) a.hp = mx;
        const mm = EG.data.maxMp(a);
        if (a.mp > mm) a.mp = mm;
      }
      s.rewards.xp = xp;
      s.rewards.gold = gold;
      EG.game.state.wins++;
    },

    defeat() {
      const s = this.s;
      s.phase = 'defeat';
      s.result = 'lose';
      s.timer = 2.2;
      EG.Audio.stopMusic();
      EG.Audio.sfx('gameover');
      EG.game.state.deaths++;
    },

    finish(result) {
      this.active = false;
      const s = this.s;
      const opts = s.opts;
      const outcome = result || s.result;
      EG.game.endBattle(outcome, s.rewards, opts);
      this.s = null;
    },

    /* -------------------------------- UPDATE -------------------------------- */

    update(dt) {
      const s = this.s;
      if (!this.active || !s) return;
      s.time += dt;
      s.shake = Math.max(0, s.shake - dt * 30);
      s.flash = Math.max(0, s.flash - dt * 3);

      for (const c of [...s.party, ...s.enemies]) {
        if (c.hitT) c.hitT = Math.max(0, c.hitT - dt);
        if (c.anim) {
          c.anim.t += dt;
          if (c.anim.t > 0.32) c.anim = null;
        }
      }
      s.popups = s.popups.filter((p) => {
        p.t += dt;
        return p.t < p.life;
      });

      if (s.phase === 'wait' || s.phase === 'anim') {
        s.timer -= dt;
        if (s.timer <= 0) {
          const cb = s.after;
          s.after = null;
          if (cb) cb();
        }
        return;
      }
      if (s.phase === 'intro') {
        s.timer -= dt;
        if (s.timer <= 0) this.nextTurn();
        return;
      }
      if (s.phase === 'enemyThink') {
        s.timer -= dt;
        if (s.timer <= 0) this.enemyAct();
        return;
      }
      if (s.phase === 'victory' || s.phase === 'defeat') {
        s.timer -= dt;
        if (s.timer <= 0 || EG.Input.pressed('ok')) this.finish(s.result);
        return;
      }
      if (s.phase === 'command') return this.updateCommand(dt);
      if (s.phase === 'skill') return this.updateSkill(dt);
      if (s.phase === 'item') return this.updateItem(dt);
      if (s.phase === 'target') return this.updateTarget(dt);
    },

    updateCommand(dt) {
      const s = this.s;
      const cmds = this.commands();
      if (EG.Input.pressed('up')) { s.cursor = (s.cursor + cmds.length - 1) % cmds.length; EG.Audio.sfx('cursor'); }
      if (EG.Input.pressed('down')) { s.cursor = (s.cursor + 1) % cmds.length; EG.Audio.sfx('cursor'); }
      if (EG.Input.pressed('ok')) this.chooseCommand(s.cursor);
      if (EG.Input.pressed('back')) { EG.Audio.sfx('cancel'); }
    },

    updateSkill(dt) {
      const s = this.s;
      const list = this.actorSkills();
      if (!list.length) { s.phase = 'command'; return; }
      if (EG.Input.pressed('up')) { s.subCursor = (s.subCursor + list.length - 1) % list.length; EG.Audio.sfx('cursor'); }
      if (EG.Input.pressed('down')) { s.subCursor = (s.subCursor + 1) % list.length; EG.Audio.sfx('cursor'); }
      if (EG.Input.pressed('back')) { EG.Audio.sfx('cancel'); s.phase = 'command'; return; }
      if (EG.Input.pressed('ok')) {
        const sk = list[s.subCursor];
        if (!sk.enabled) { EG.Audio.sfx('cancel'); return; }
        EG.Audio.sfx('select');
        s.pending = { kind: 'skill', skill: sk };
        if (sk.target === 'allEnemies' || sk.target === 'allAllies' || sk.target === 'self') {
          s.target = 0;
          s.targetList = [s.actor];
          this.execute({ kind: 'skill', skill: sk, target: sk.target === 'self' ? s.actor : null });
        } else if (sk.target === 'ally') {
          this.beginTarget('ally');
        } else {
          this.beginTarget('enemy');
        }
      }
    },

    updateItem(dt) {
      const s = this.s;
      const list = this.actorItems();
      if (!list.length) { s.phase = 'command'; return; }
      if (EG.Input.pressed('up')) { s.subCursor = (s.subCursor + list.length - 1) % list.length; EG.Audio.sfx('cursor'); }
      if (EG.Input.pressed('down')) { s.subCursor = (s.subCursor + 1) % list.length; EG.Audio.sfx('cursor'); }
      if (EG.Input.pressed('back')) { EG.Audio.sfx('cancel'); s.phase = 'command'; return; }
      if (EG.Input.pressed('ok')) {
        const it = list[s.subCursor];
        EG.Audio.sfx('select');
        s.pending = { kind: 'item', item: it };
        if (it.target === 'allEnemies') this.execute({ kind: 'item', item: it, target: null });
        else this.beginTarget(it.target === 'enemy' ? 'enemy' : 'ally');
      }
    },

    updateTarget(dt) {
      const s = this.s;
      const list = s.targetList || [];
      if (!list.length) { s.phase = 'command'; return; }
      if (EG.Input.pressed('left') || EG.Input.pressed('up')) { s.target = (s.target + list.length - 1) % list.length; EG.Audio.sfx('cursor'); }
      if (EG.Input.pressed('right') || EG.Input.pressed('down')) { s.target = (s.target + 1) % list.length; EG.Audio.sfx('cursor'); }
      if (EG.Input.pressed('back')) { EG.Audio.sfx('cancel'); s.phase = 'command'; return; }
      if (EG.Input.pressed('ok')) this.confirmTarget();
    },

    /* --------------------------------- DRAW --------------------------------- */

    layout() {
      const W = EG.UI.W, H = EG.UI.H;
      const portrait = H > W * 1.05;
      if (portrait) {
        return {
          portrait,
          enemyArea: { x: 8, y: 56, w: W - 16, h: H * 0.34 },
          logArea: { x: 12, y: H * 0.43, w: W - 24, h: H * 0.08 },
          partyArea: { x: 8, y: H * 0.53, w: W - 16, h: H * 0.12 },
          panel: { x: 8, y: H * 0.67, w: W - 16, h: H * 0.31 },
        };
      }
      return {
        portrait,
        enemyArea: { x: W * 0.42, y: 40, w: W * 0.56, h: H * 0.52 },
        logArea: { x: 14, y: H * 0.56, w: W * 0.4, h: H * 0.12 },
        partyArea: { x: 12, y: H * 0.6, w: W * 0.36, h: H * 0.24 },
        panel: { x: W * 0.42, y: H * 0.58, w: W * 0.56, h: H * 0.4 },
      };
    },

    draw() {
      const s = this.s;
      const UI = EG.UI, ctx = UI.ctx;
      const W = UI.W, H = UI.H;
      const L = this.layout();
      this.layoutCache = L;

      // fondo
      const map = EG.maps[EG.game.state.zone] || EG.maps.camino;
      const g = ctx.createLinearGradient(0, 0, 0, H);
      const dark = map.tint ? true : false;
      if (s.opts.boss) {
        g.addColorStop(0, '#250d2b'); g.addColorStop(0.55, '#160a20'); g.addColorStop(1, '#08050f');
      } else if (dark) {
        g.addColorStop(0, '#141c30'); g.addColorStop(0.6, '#0c1120'); g.addColorStop(1, '#060810');
      } else {
        g.addColorStop(0, '#2a3f5e'); g.addColorStop(0.55, '#1b2a40'); g.addColorStop(1, '#0b111c');
      }
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);

      // siluetas del escenario
      ctx.save();
      ctx.globalAlpha = 0.32;
      ctx.fillStyle = '#05070f';
      for (let i = 0; i < 7; i++) {
        const bx = (i / 7) * W + 10;
        const hgt = 60 + ((i * 37) % 70);
        ctx.beginPath();
        ctx.moveTo(bx - 26, H);
        ctx.lineTo(bx, H - hgt);
        ctx.lineTo(bx + 26, H);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();

      // suelo
      ctx.save();
      ctx.fillStyle = 'rgba(0,0,0,0.35)';
      ctx.beginPath();
      ctx.ellipse(L.enemyArea.x + L.enemyArea.w / 2, L.enemyArea.y + L.enemyArea.h * 0.82, L.enemyArea.w * 0.42, 18, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      this.drawEnemies(L);
      this.drawParty(L);
      this.drawPopups();
      this.drawLog(L);
      this.drawPanel(L);

      if (s.shake > 0) {
        // sacudida dibujada en el próximo frame mediante translate no es trivial aquí; usamos flash
      }
      if (s.flash > 0) {
        ctx.save();
        ctx.fillStyle = `rgba(255,255,255,${s.flash * 0.25})`;
        ctx.fillRect(0, 0, W, H);
        ctx.restore();
      }
    },

    drawEnemies(L) {
      const s = this.s;
      const UI = EG.UI, ctx = UI.ctx;
      const list = s.enemies;
      const alive = list.filter((e) => e.hp > 0);
      const n = Math.max(1, list.length);
      const area = L.enemyArea;
      const cellW = area.w / n;
      const boss = list.some((e) => e.isBoss);
      const baseSize = Math.min(area.h * 0.78, cellW * 0.86);
      const maxSize = boss ? Math.min(area.h * 0.95, 220) : 150;
      const size = EG.clamp(baseSize, 52, maxSize);
      const frame = Math.floor(s.time * 2) % 2;

      list.forEach((e, i) => {
        const cx = area.x + cellW * (i + 0.5);
        const cy = area.y + area.h * 0.78;
        e.slotX = cx;
        e.slotY = cy - size * 0.9;
        if (e.hp <= 0) {
          ctx.save();
          ctx.globalAlpha = 0.25;
          const img = EG.art.enemies[e.sprite][0];
          ctx.drawImage(img, cx - size * 0.4, cy - size * 0.5, size * 0.8, size * 0.8);
          ctx.restore();
          return;
        }
        const bob = Math.sin(s.time * 2 + i * 1.7) * 2.5;
        const lunge = e.anim && e.anim.type === 'lunge' ? Math.sin(Math.min(1, e.anim.t / 0.32) * Math.PI) * -10 : 0;
        ctx.save();
        if (e.hitT > 0) {
          ctx.globalAlpha = 0.55 + Math.random() * 0.45;
        }
        const img = EG.art.enemies[e.sprite][frame];
        const dw = size, dh = size;
        ctx.drawImage(img, cx - dw / 2 + lunge, cy - dh + bob, dw, dh);
        ctx.restore();

        // nombre y barra
        const bw = Math.min(120, Math.max(74, size * 0.7));
        const hy = cy - size - 12 + bob;
        let bossTag = e.isBoss ? ' ◆' : '';
        UI.txt(e.name + bossTag, cx, hy - 4, {
          size: L.portrait ? 11.5 : 12.5, color: e.isBoss ? '#f0c0e0' : '#e8e4d8', align: 'center', baseline: 'bottom', weight: 'bold', shadow: true,
        });
        UI.bar(cx - bw / 2, hy + 1, bw, 5, e.hp, e.maxhp, e.isBoss ? '#c95a8a' : '#c9564f');

        // objetivo
        if (s.phase === 'target' && s.targetKind === 'enemy' && s.targetList && s.targetList[s.target] === e) {
          const yy = cy - size - 34 + Math.sin(s.time * 6) * 3;
          UI.txt('▼', cx, yy, { size: 20, color: '#ffe066', align: 'center', baseline: 'middle' });
        }
        EG.UI.region(cx - size / 2, cy - size, size, size, () => {
          if (s.phase === 'target' && s.targetKind === 'enemy') {
            const idx = s.targetList.indexOf(e);
            if (idx >= 0) { s.target = idx; this.confirmTarget(); }
          }
        });
      });

      // debilidades conocidas
      if (s.phase === 'target' || s.phase === 'command' || s.phase === 'skill') {
        const t = s.phase === 'target' ? s.targetList[s.target] : alive[0];
        if (t && t.data && (t.data.weak || []).length) {
          const names = t.data.weak.map((w) => EG.data.ELEMENTS[w].name).join(', ');
          UI.txt('Punto débil: ' + names, L.enemyArea.x + L.enemyArea.w / 2, L.enemyArea.y + L.enemyArea.h * 0.9, {
            size: 11, color: 'rgba(232,198,106,0.75)', align: 'center',
          });
        }
      }
    },

    drawParty(L) {
      const s = this.s;
      const UI = EG.UI, ctx = UI.ctx;
      const area = L.partyArea;
      const n = s.party.length;
      const rowH = area.h / n;
      s.party.forEach((c, i) => {
        const x = area.x + 4;
        const y = area.y + i * rowH;
        c.slotX = x + 34;
        c.slotY = y + rowH * 0.4;
        const dead = c.hp <= 0;
        ctx.save();
        if (dead) ctx.globalAlpha = 0.4;
        // sprite mini
        const set = EG.art.chars[EG.game.spriteOf(c.ref)];
        if (set) {
          ctx.imageSmoothingEnabled = false;
          ctx.drawImage(set.down[0], x, y + rowH * 0.5 - 20, 22, 30);
        }
        ctx.restore();
        const tx = x + 30;
        const nameY = y + rowH * 0.12;
        UI.txt(c.name, tx, nameY, {
          size: L.portrait ? 12 : 13, color: dead ? '#8a5a5a' : '#f0ead8', weight: 'bold', shadow: true,
        });
        UI.txt(`Nv ${c.ref.lvl}`, tx + UI.measure(c.name, 12, 'bold') + 8, nameY + 1, { size: 10, color: 'rgba(232,198,106,0.8)' });
        const bw = Math.max(70, area.w - 46 - (L.portrait ? 52 : 70));
        UI.bar(tx, nameY + 15, bw, 5, c.hp, c.maxhp, EG.COLORS.hp);
        UI.bar(tx, nameY + 22, bw, 4, c.mp, c.maxmp, EG.COLORS.mp);
        if (L.portrait) {
          UI.txt(`${Math.max(0, Math.round(c.hp))}`, tx + bw + 6, nameY + 12, { size: 9.5, color: 'rgba(240,245,255,0.7)' });
        }
        // estados
        const tags = [];
        if (c.defending) tags.push('DEF');
        if (c.status.veneno) tags.push('VEN');
        if (c.status.quemado) tags.push('QUE');
        if (c.status.aturdido) tags.push('ATD');
        if (c.buffs.atk) tags.push('ATQ↑');
        if (c.buffs.def) tags.push('DEF↑');
        if (tags.length) {
          UI.txt(tags.join(' '), tx + bw + (L.portrait ? 26 : 0), nameY + 12, { size: 8.5, color: 'rgba(200,220,255,0.6)' });
        }
        if (s.actor === c && (s.phase === 'command' || s.phase === 'skill' || s.phase === 'item' || s.phase === 'target')) {
          const yy = y + rowH / 2;
          UI.txt('▶', x - 2, yy, { size: 14, color: '#ffe066', baseline: 'middle' });
        }
        EG.UI.region(area.x, y, area.w, rowH, () => {
          if (s.phase === 'target' && s.targetKind === 'ally') {
            const idx = s.targetList.indexOf(c);
            if (idx >= 0) { s.target = idx; this.confirmTarget(); }
          }
        });
      });
    },

    drawLog(L) {
      const s = this.s;
      const UI = EG.UI;
      const area = L.logArea;
      const lines = s.log.slice(-2);
      lines.forEach((line, i) => {
        UI.txt(line, area.x + 4, area.y + i * 17, {
          size: L.portrait ? 11.5 : 12.5, color: i === lines.length - 1 ? '#e8e4d8' : 'rgba(220,225,240,0.55)',
        });
      });
    },

    drawPanel(L) {
      const s = this.s;
      const UI = EG.UI, ctx = UI.ctx;
      const p = L.panel;
      UI.panel(p.x, p.y, p.w, p.h, { fill: 'rgba(8,11,22,0.9)', radius: 12 });

      if (s.phase === 'command') {
        const actor = s.actor;
        UI.txt(actor.name, p.x + 16, p.y + 12, { size: 13, color: '#e8c66a', weight: 'bold' });
        UI.txt(`PV ${Math.round(actor.hp)}/${actor.maxhp}   PM ${Math.round(actor.mp)}/${actor.maxmp}`, p.x + p.w - 16, p.y + 13, {
          size: 10.5, color: 'rgba(220,228,245,0.6)', align: 'right',
        });
        const cmds = this.commands();
        const cols = p.w > 520 ? 2 : 1;
        const gap = 6;
        const bh = Math.min(44, (p.h - 52 - (cmds.length / cols) * gap) / Math.ceil(cmds.length / cols));
        const bw = (p.w - 32 - (cols - 1) * 8) / cols;
        cmds.forEach((c, i) => {
          const col = i % cols;
          const row = Math.floor(i / cols);
          const bx = p.x + 16 + col * (bw + 8);
          const by = p.y + 40 + row * (bh + gap);
          UI.button(bx, by, bw, bh, c.label, {
            focused: s.cursor === i,
            disabled: !c.enabled,
            size: 14,
            onPick: () => { s.cursor = i; this.chooseCommand(i); },
          });
        });
        UI.txt('A elegir · B volver', p.x + p.w - 14, p.y + p.h - 10, { size: 9.5, color: 'rgba(200,210,235,0.35)', align: 'right' });
        return;
      }

      if (s.phase === 'skill' || s.phase === 'item') {
        const isSkill = s.phase === 'skill';
        const list = isSkill ? this.actorSkills() : this.actorItems();
        UI.txt(isSkill ? 'HABILIDADES' : 'OBJETOS', p.x + 16, p.y + 10, { size: 12, color: '#e8c66a', weight: 'bold' });
        const actor = s.actor;
        UI.txt(`PM ${Math.round(actor.mp)}`, p.x + p.w - 16, p.y + 11, { size: 11, color: 'rgba(99,169,232,0.8)', align: 'right' });
        const rowH = Math.min(38, (p.h - 44) / Math.max(1, Math.min(5, list.length)));
        const start = EG.clamp(s.subCursor - 2, 0, Math.max(0, list.length - Math.min(5, list.length)));
        list.slice(start, start + 5).forEach((it, i) => {
          const idx = start + i;
          const y = p.y + 32 + i * (rowH + 2);
          const label = isSkill ? it.name : `${it.name} ×${it.count}`;
          const right = isSkill ? `${it.mp} PM` : '';
          const disabled = isSkill ? !it.enabled : false;
          UI.button(p.x + 14, y, p.w - 28, rowH, label, {
            focused: s.subCursor === idx,
            disabled,
            left: true,
            size: 13,
            onPick: () => {
              s.subCursor = idx;
              if (isSkill) {
                if (!it.enabled) { EG.Audio.sfx('cancel'); return; }
                s.pending = { kind: 'skill', skill: it };
                if (it.target === 'allEnemies' || it.target === 'allAllies' || it.target === 'self') {
                  this.execute({ kind: 'skill', skill: it, target: it.target === 'self' ? s.actor : null });
                } else if (it.target === 'ally') this.beginTarget('ally');
                else this.beginTarget('enemy');
              } else {
                s.pending = { kind: 'item', item: it };
                if (it.target === 'allEnemies') this.execute({ kind: 'item', item: it, target: null });
                else this.beginTarget(it.target === 'enemy' ? 'enemy' : 'ally');
              }
            },
          });
          if (right) UI.txt(right, p.x + p.w - 22, y + rowH / 2 - 6, { size: 11, color: disabled ? '#5d6579' : '#9bb8e8', align: 'right' });
        });
        const focusItem = list[s.subCursor];
        if (focusItem && focusItem.desc) {
          UI.txt(focusItem.desc, p.x + 16, p.y + p.h - 26, {
            size: 10, color: 'rgba(200,210,235,0.5)',
          });
        }
        UI.txt('B volver', p.x + p.w - 14, p.y + p.h - 10, { size: 9.5, color: 'rgba(200,210,235,0.35)', align: 'right' });
        return;
      }

      if (s.phase === 'target') {
        const t = s.targetList && s.targetList[s.target];
        UI.txt('ELIGE OBJETIVO', p.x + 16, p.y + 12, { size: 12, color: '#e8c66a', weight: 'bold' });
        if (t) {
          UI.txt(t.name, p.x + 16, p.y + 30, { size: 16, color: '#f0ead8', weight: 'bold' });
          if (t.side === 'enemy') {
            UI.txt(`Nv ${t.lvl}`, p.x + p.w - 16, p.y + 33, {
              size: 11, color: 'rgba(232,198,106,0.9)', align: 'right',
            });
          }
          UI.bar(p.x + 16, p.y + 52, p.w - 32, 7, t.hp, t.maxhp, t.side === 'enemy' ? '#c9564f' : EG.COLORS.hp);
          UI.txt(`${Math.max(0, Math.round(t.hp))} / ${t.maxhp}`, p.x + 16, p.y + 63, {
            size: 10, color: 'rgba(230,235,245,0.65)',
          });
          if (t.side === 'enemy' && t.data && (t.data.weak || []).length) {
            const wn = t.data.weak.map((w) => EG.data.ELEMENTS[w].name).join(', ');
            UI.txt('Débil a: ' + wn, p.x + p.w - 16, p.y + 63, {
              size: 10.5, color: '#e8c66a', align: 'right',
            });
          }
        }
        UI.txt('◀ ▶ elegir · A confirmar · B volver', p.x + p.w / 2, p.y + p.h - 14, {
          size: 11, color: 'rgba(210,220,240,0.5)', align: 'center',
        });
        return;
      }

      if (s.phase === 'victory' || s.phase === 'defeat') {
        const win = s.phase === 'victory';
        UI.txt(win ? 'VICTORIA' : 'DERROTA', p.x + p.w / 2, p.y + 18, {
          size: 22, color: win ? '#e8c66a' : '#e06060', align: 'center', weight: 'bold', serif: true,
        });
        if (win && s.rewards) {
          UI.txt(`+${s.rewards.xp} EXP   +${s.rewards.gold} oro`, p.x + p.w / 2, p.y + 54, {
            size: 14, color: '#f0ead8', align: 'center',
          });
        }
        UI.txt(win ? 'La luz se serena…' : 'La oscuridad te alcanza…', p.x + p.w / 2, p.y + p.h - 30, {
          size: 12, color: 'rgba(210,220,240,0.55)', align: 'center',
        });
        return;
      }

      if (s.phase === 'wait' || s.phase === 'anim' || s.phase === 'enemyThink' || s.phase === 'intro') {
        const dots = '.'.repeat(1 + (Math.floor(s.time * 3) % 3));
        UI.txt(s.phase === 'enemyThink' ? 'El enemigo se prepara' + dots : '…', p.x + p.w / 2, p.y + p.h / 2 - 8, {
          size: 13, color: 'rgba(210,220,240,0.4)', align: 'center',
        });
      }
    },

    drawPopups() {
      const s = this.s;
      const UI = EG.UI, ctx = UI.ctx;
      for (const p of s.popups) {
        const t = p.t / p.life;
        const y = p.y - 14 - t * 26 - p.off;
        ctx.save();
        ctx.globalAlpha = 1 - t * t;
        UI.txt(p.text, p.x, y, {
          size: 16, color: p.color, align: 'center', baseline: 'middle', weight: 'bold', shadow: true,
        });
        ctx.restore();
      }
    },
  };

  function makeAlly(actor, i) {
    const stats = EG.data.statsOf(actor);
    return {
      side: 'ally', ref: actor, name: actor.name, id: actor.id,
      hp: actor.hp, maxhp: stats.hp, mp: actor.mp, maxmp: stats.mp,
      atk: stats.atk, def: stats.def, mag: stats.mag, res: stats.res, spd: stats.spd,
      status: {}, buffs: {}, defending: false, sprite: null,
    };
  }

  function makeEnemy(id, i) {
    const def = EG.data.ENEMIES[id];
    return {
      side: 'enemy', data: def, name: def.name, id,
      hp: def.hp, maxhp: def.hp, mp: 0, maxmp: 0,
      atk: def.atk, def: def.def, mag: def.mag, res: def.res, spd: def.spd,
      status: {}, buffs: {}, defending: false, sprite: def.sprite,
      isBoss: !!def.boss, lvl: def.lvl, phase2: false,
    };
  }

  EG.battle = B;
})();
