/* Núcleo: estado, bucle, guardado, menús, tienda y transiciones */
(function () {
  const EG = window.EG;
  const D = () => EG.data;

  const SAVE_SLOTS = ['slot1', 'slot2', 'slot3'];

  const game = {
    canvas: null,
    ctx: null,
    dpr: 1,
    last: 0,
    mode: 'title',
    state: null,
    overlays: [],
    touchUI: false,
    titleFocus: 0,
    titleTime: 0,
    shake: 0,
    fade: 0,
    fadeCb: null,
    endingTime: 0,
    newGamePending: false,

    init() {
      this.canvas = document.getElementById('game');
      this.ctx = this.canvas.getContext('2d');
      if (!this.ctx) {
        document.getElementById('boot-msg').textContent = 'Tu navegador no soporta canvas.';
        return;
      }
      EG.art.init();
      EG.Input.bind(this.canvas);
      this.touchUI = ('ontouchstart' in window) || navigator.maxTouchPoints > 0 || window.matchMedia('(pointer: coarse)').matches;

      const settings = EG.store.get('settings', { music: true, sfx: true });
      EG.Audio.init();
      EG.Audio.setMusic(settings.music);
      EG.Audio.setSfx(settings.sfx);
      this.settings = settings;

      EG.Input.onGesture = () => {
        EG.Audio.init();
        if (this.mode !== 'title' && this.state) {
          const map = EG.maps[this.state.zone];
          if (map) EG.Audio.music(map.bgm);
        } else if (this.mode === 'title') {
          EG.Audio.music('title');
        } else if (this.mode === 'battle') {
          // la música de combate ya está fijada
        }
      };

      this.resize();
      window.addEventListener('resize', () => this.resize());
      window.addEventListener('orientationchange', () => setTimeout(() => this.resize(), 250));
      const trail = () => {
        this.resize();
        document.getElementById('boot').classList.add('hide');
        setTimeout(() => {
          const b = document.getElementById('boot');
          if (b && b.parentNode) b.parentNode.removeChild(b);
        }, 500);
        EG.Audio.music('title');
      };
      trail();
      this.last = performance.now();
      requestAnimationFrame((t) => this.frame(t));
    },

    resize() {
      const rect = this.canvas.getBoundingClientRect();
      const w = Math.max(240, Math.round(rect.width));
      const h = Math.max(240, Math.round(rect.height));
      this.dpr = Math.min(2, window.devicePixelRatio || 1);
      this.canvas.width = Math.round(w * this.dpr);
      this.canvas.height = Math.round(h * this.dpr);
      this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
      EG.UI.setCtx(this.ctx, w, h);
      if (EG.world && EG.world.map) EG.world.snapCamera();
    },

    frame(ts) {
      const dt = Math.min(0.05, Math.max(0, (ts - this.last) / 1000));
      this.last = ts;
      this.update(dt);
      this.draw();
      EG.Input.endFrame();
      requestAnimationFrame((t) => this.frame(t));
    },

    /* ------------------------------- UPDATE ------------------------------- */

    update(dt) {
      EG.UI.processTaps();
      EG.UI.beginFrame();
      this.shake = Math.max(0, this.shake - dt * 20);

      const top = this.overlays[this.overlays.length - 1];
      if (top) {
        top.update(dt);
      } else if (this.mode === 'title') {
        this.updateTitle(dt);
      } else if (this.mode === 'world') {
        EG.world.update(dt);
      } else if (this.mode === 'battle') {
        EG.battle.update(dt);
      } else if (this.mode === 'ending') {
        this.updateEnding(dt);
      }
      EG.UI.drawToast(dt);
    },

    /* -------------------------------- DRAW -------------------------------- */

    draw() {
      const ctx = this.ctx;
      const W = EG.UI.W, H = EG.UI.H;
      ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      ctx.imageSmoothingEnabled = false;

      if (this.mode === 'title') {
        this.drawTitle();
      } else if (this.mode === 'battle' && EG.battle.active) {
        EG.battle.draw();
      } else if (this.mode === 'ending') {
        this.drawEnding();
      } else if (this.mode === 'world') {
        EG.world.draw();
      } else {
        ctx.fillStyle = '#05070f';
        ctx.fillRect(0, 0, W, H);
      }

      for (const o of this.overlays) o.draw();
      if (this.fade > 0) {
        ctx.save();
        ctx.fillStyle = `rgba(3,5,12,${this.fade})`;
        ctx.fillRect(0, 0, W, H);
        ctx.restore();
      }
    },

    /* -------------------------------- TÍTULO -------------------------------- */

    updateTitle(dt) {
      this.titleTime += dt;
      const saves = this.saveList();
      const items = this.titleItems(saves);
      if (this.titleFocus >= items.length) this.titleFocus = items.length - 1;
      if (EG.Input.pressed('up')) { this.titleFocus = (this.titleFocus + items.length - 1) % items.length; EG.Audio.sfx('cursor'); }
      if (EG.Input.pressed('down')) { this.titleFocus = (this.titleFocus + 1) % items.length; EG.Audio.sfx('cursor'); }
      if (EG.Input.pressed('ok')) { EG.Audio.sfx('select'); items[this.titleFocus].action(); }
    },

    titleItems(saves) {
      const items = [];
      if (saves.length) {
        items.push({ label: 'Continuar', sub: 'Retoma la última partida guardada', action: () => this.continueGame() });
      }
      items.push({ label: 'Nueva partida', sub: 'La Espada Celestial te espera', action: () => this.newGamePrompt() });
      items.push({ label: 'Cómo jugar', sub: 'Controles y consejos', action: () => this.showHowToPlay() });
      items.push({ label: 'Ajustes', sub: 'Sonido y datos', action: () => this.openSettings() });
      return items;
    },

    drawTitle() {
      const UI = EG.UI, ctx = UI.ctx;
      const W = UI.W, H = UI.H;
      const t = this.titleTime;

      const g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, '#0a1226');
      g.addColorStop(0.5, '#0d1730');
      g.addColorStop(1, '#060a14');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);

      // estrellas
      for (let i = 0; i < 70; i++) {
        const x = (i * 97.13) % W;
        const y = ((i * 53.7) % (H * 0.62));
        const a = 0.25 + 0.65 * Math.abs(Math.sin(t * 0.8 + i));
        ctx.fillStyle = `rgba(220,232,255,${a * 0.7})`;
        ctx.fillRect(x, y, i % 9 === 0 ? 2 : 1, i % 9 === 0 ? 2 : 1);
      }

      // luna
      const mx = W * 0.79, my = H * 0.17, mr = Math.min(W, H) * 0.085;
      ctx.save();
      const glow = ctx.createRadialGradient(mx, my, mr * 0.4, mx, my, mr * 2.6);
      glow.addColorStop(0, 'rgba(240,232,200,0.35)');
      glow.addColorStop(1, 'rgba(240,232,200,0)');
      ctx.fillStyle = glow;
      ctx.fillRect(mx - mr * 3, my - mr * 3, mr * 6, mr * 6);
      ctx.beginPath();
      ctx.arc(mx, my, mr, 0, Math.PI * 2);
      ctx.fillStyle = '#eae0c2';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(mx - mr * 0.35, my - mr * 0.2, mr * 0.18, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(190,180,150,0.55)';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(mx + mr * 0.28, my + mr * 0.3, mr * 0.12, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // montañas
      ctx.save();
      ctx.fillStyle = '#0a1020';
      ctx.beginPath();
      ctx.moveTo(0, H * 0.68);
      ctx.lineTo(W * 0.16, H * 0.5);
      ctx.lineTo(W * 0.32, H * 0.66);
      ctx.lineTo(W * 0.5, H * 0.46);
      ctx.lineTo(W * 0.68, H * 0.64);
      ctx.lineTo(W * 0.85, H * 0.52);
      ctx.lineTo(W, H * 0.66);
      ctx.lineTo(W, H);
      ctx.lineTo(0, H);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // espada clavada
      const sx = W * 0.13, sy = H * 0.42;
      ctx.save();
      ctx.translate(sx, sy);
      ctx.rotate(-0.06);
      const len = Math.min(H * 0.36, 280);
      const glow2 = ctx.createLinearGradient(0, -len, 0, 0);
      glow2.addColorStop(0, 'rgba(255,246,214,0.9)');
      glow2.addColorStop(1, 'rgba(200,190,150,0.15)');
      ctx.strokeStyle = glow2;
      ctx.lineWidth = Math.max(4, W * 0.008);
      ctx.beginPath();
      ctx.moveTo(0, -len);
      ctx.lineTo(0, 0);
      ctx.stroke();
      ctx.fillStyle = '#d8c88a';
      ctx.fillRect(-Math.max(14, W * 0.026), -len * 0.14, Math.max(28, W * 0.052), Math.max(6, W * 0.011));
      ctx.fillStyle = '#8a6a2e';
      ctx.fillRect(-3, 0, 6, len * 0.2);
      for (let i = 0; i < 5; i++) {
        const ang = t * 1.4 + i * 1.26;
        ctx.globalAlpha = 0.25 + 0.25 * Math.sin(t * 2 + i);
        ctx.fillStyle = '#fff3c4';
        ctx.fillRect(Math.cos(ang) * (26 + i * 8), -len * 0.5 + Math.sin(ang * 1.3) * 18, 2, 2);
      }
      ctx.restore();

      // título
      const titleSize = EG.clamp(W * 0.056, 22, 52);
      const ty = H * 0.15;
      ctx.save();
      ctx.textAlign = 'center';
      ctx.font = `600 ${titleSize}px ${UI.serif}`;
      ctx.shadowColor = 'rgba(232,198,106,0.45)';
      ctx.shadowBlur = 26;
      ctx.fillStyle = '#f2e3b6';
      ctx.fillText('LA ESPADA', W / 2, ty);
      ctx.fillText('CELESTIAL', W / 2, ty + titleSize * 1.1);
      ctx.restore();
      UI.txt('Un RPG de luz y eclipse', W / 2, ty + titleSize * 2.28, {
        size: EG.clamp(W * 0.017, 11, 15), color: 'rgba(200,214,245,0.6)', align: 'center', serif: true,
      });

      // menú
      const items = this.titleItems(this.saveList());
      const bw = Math.min(W - 48, 340);
      const bh = 46;
      const startY = Math.max(H * 0.5, ty + titleSize * 2.6);
      items.forEach((it, i) => {
        const y = startY + i * (bh + 8);
        if (y + bh > H - 24) return;
        UI.button((W - bw) / 2, y, bw, bh, it.label, {
          focused: this.titleFocus === i,
          size: 15,
          sub: this.touchUI ? null : it.sub,
          onPick: () => { this.titleFocus = i; EG.Audio.sfx('select'); it.action(); },
        });
      });

      UI.txt('v1.0 · aventura completa por turnos', W / 2, H - 12, {
        size: 9.5, color: 'rgba(160,175,205,0.35)', align: 'center', baseline: 'bottom',
      });
    },

    showHowToPlay() {
      EG.UI.dialog({
        pages: [
          { who: 'Cómo jugar', text: 'Muévete con las flechas, WASD o el panel táctil. Pulsa A (o Z/Enter) para hablar, abrir cofres y confirmar.' },
          { who: 'Cómo jugar', text: 'B (o X/Esc) abre el menú. En combate, elige Atacar, Habilidad, Objeto, Defender o Huir. Las debilidades elementales hacen mucho daño.' },
          { who: 'Cómo jugar', text: 'La hierba alta y las mazmorras tienen encuentros. Descansa en la posada para curarte y guardar. El juego también guarda solo al cambiar de zona.' },
          { who: 'Cómo jugar', text: 'Objetivo: reunir los tres fragmentos de la Espada Celestial y derrotar a Lord Eclipse antes de que apague la luna.' },
        ],
      });
    },

    /* ------------------------------ PARTIDA ------------------------------ */

    newGamePrompt() {
      const existing = this.saveList();
      if (!existing.length) return this.newGame();
      EG.UI.dialog({
        pages: [{
          who: 'Nueva partida',
          text: 'Ya hay partidas guardadas. ¿Empezar de cero? No se borrarán tus guardados.',
          choices: [
            { label: 'Empezar de cero', action: () => this.newGame() },
            { label: 'Cancelar', action: () => {} },
          ],
        }],
      });
    },

    newGame() {
      this.state = {
        version: 1,
        zone: 'alba', tx: 14, ty: 17, dir: 'up',
        gold: 60,
        items: Object.assign({}, D().STARTER_ITEMS),
        party: [D().newActor('kael')],
        flags: {},
        quests: { main: 'active', flores: 'locked', colmillos: 'locked' },
        chests: {}, collected: {}, triggers: {},
        fragments: 0,
        playtime: 0, stepsSinceBattle: 0, wins: 0, deaths: 0,
        savedAt: 0,
      };
      this.mode = 'world';
      EG.world.enter('alba', 14, 17, 'up');
      this.overlays.length = 0;
      this.autoSave();
      EG.story.intro();
    },

    saveList() {
      const out = [];
      for (const slot of SAVE_SLOTS.concat(['auto'])) {
        const data = EG.store.get(slot, null);
        if (data && data.meta) out.push({ slot, meta: data.meta });
      }
      out.sort((a, b) => b.meta.savedAt - a.meta.savedAt);
      return out;
    },

    metaOf(state) {
      return {
        name: state.party[0] ? state.party[0].name : 'Kael',
        lvl: state.party[0] ? state.party[0].lvl : 1,
        zone: (EG.maps[state.zone] || {}).name || state.zone,
        playtime: state.playtime,
        fragments: state.fragments,
        savedAt: Date.now(),
        party: state.party.map((p) => p.name).join(', '),
      };
    },

    saveTo(slot) {
      if (!this.state) return false;
      this.state.savedAt = Date.now();
      const ok = EG.store.set(slot, { state: this.state, meta: this.metaOf(this.state) });
      if (ok) {
        EG.Audio.sfx('save');
        EG.UI.showToast('Partida guardada', 'gold');
      } else {
        EG.UI.showToast('No se pudo guardar', 'bad');
      }
      return ok;
    },

    autoSave() {
      if (!this.state) return;
      this.state.savedAt = Date.now();
      EG.store.set('auto', { state: this.state, meta: this.metaOf(this.state) });
    },

    continueGame() {
      const list = this.saveList();
      if (!list.length) return this.newGame();
      this.loadSlot(list[0].slot);
    },

    loadSlot(slot) {
      const data = EG.store.get(slot, null);
      if (!data || !data.state) { EG.UI.showToast('Guardado no válido', 'bad'); return; }
      const st = data.state;
      st.flags = st.flags || {};
      st.quests = st.quests || {};
      st.chests = st.chests || {};
      st.collected = st.collected || {};
      st.triggers = st.triggers || {};
      st.items = st.items || {};
      st.fragments = st.fragments || 0;
      this.state = st;
      this.mode = 'world';
      this.overlays.length = 0;
      EG.Audio.sfx('save');
      EG.world.enter(st.zone || 'alba', st.tx || 14, st.ty || 17, st.dir || 'down');
      EG.UI.showToast(`Partida cargada · ${EG.clock(st.playtime || 0)}`);
    },

    travel(zone, tx, ty) {
      EG.world.enter(zone, tx, ty, 'down');
      this.autoSave();
    },

    revertStep() {
      const p = EG.world.player;
      if (!p) return;
      const map = EG.world.map;
      const deltas = { up: [0, 1], down: [0, -1], left: [1, 0], right: [-1, 0] };
      const [dx, dy] = deltas[p.dir] || [0, 0];
      const nx = p.tx + dx, ny = p.ty + dy;
      if (!map || EG.world.blockerAt(nx, ny)) return;
      p.tx = nx; p.ty = ny;
      p.px = nx * 16; p.py = ny * 16;
      p.moving = false;
      this.state.tx = nx; this.state.ty = ny;
    },

    portalUnlocked(portal) {
      const need = portal.need;
      if (!need) return true;
      if (need.fragments && this.state.fragments < need.fragments) return false;
      if (need.item && this.countItem(need.item) <= 0) return false;
      if (need.flag && !this.state.flags[need.flag]) return false;
      return true;
    },

    /* ------------------------------ INVENTARIO ------------------------------ */

    countItem(id) {
      return (this.state.items[id] || 0);
    },

    addItem(id, n) {
      if (!D().ITEMS[id]) return false;
      const cur = this.state.items[id] || 0;
      const next = cur + (n === undefined ? 1 : n);
      if (next <= 0) delete this.state.items[id];
      else this.state.items[id] = next;
      return true;
    },

    consumables() {
      return Object.entries(this.state.items).filter(([id, n]) => {
        const it = D().ITEMS[id];
        return it && it.kind === 'consumible' && n > 0;
      }).map(([id]) => id);
    },

    equipmentInBag(kind) {
      return Object.entries(this.state.items)
        .filter(([id, n]) => {
          const it = D().ITEMS[id];
          return it && it.kind === kind && n > 0;
        })
        .map(([id, n]) => ({ id, n, item: D().ITEMS[id] }));
    },

    equip(actor, slot, itemId) {
      const current = actor.equip[slot];
      if (current) this.addItem(current, 1);
      if (itemId) this.addItem(itemId, -1);
      actor.equip[slot] = itemId || null;
      const stats = D().statsOf(actor);
      actor.hp = Math.min(actor.hp, stats.hp);
      actor.mp = Math.min(actor.mp, stats.mp);
      EG.Audio.sfx('select');
    },

    useItemOutside(id, actor) {
      const it = D().ITEMS[id];
      if (!it || it.kind !== 'consumible' || this.countItem(id) <= 0) return false;
      const stats = D().statsOf(actor);
      let did = false;
      if (it.use && it.use.hp) {
        const before = actor.hp;
        actor.hp = Math.min(stats.hp, actor.hp + it.use.hp);
        did = did || actor.hp > before;
      }
      if (it.use && it.use.mp) {
        const before = actor.mp;
        actor.mp = Math.min(stats.mp, actor.mp + it.use.mp);
        did = did || actor.mp > before;
      }
      if (it.use && it.use.cure) did = true;
      if (it.use && it.use.damage) return false;
      if (!did) {
        EG.UI.showToast('No tiene efecto ahora', 'bad');
        return false;
      }
      this.addItem(id, -1);
      EG.Audio.sfx('heal');
      EG.UI.showToast(`${actor.name} usa ${it.name}`);
      return true;
    },

    healParty() {
      for (const a of this.state.party) {
        const s = D().statsOf(a);
        a.hp = s.hp;
        a.mp = s.mp;
      }
    },

    leaderSprite() {
      const a = this.state && this.state.party[0];
      return a ? D().ACTORS[a.id].sprite : 'kael';
    },

    spriteOf(ref) {
      const a = ref && D().ACTORS[ref.id];
      return a ? a.sprite : 'kael';
    },

    /* ------------------------------- EVENTOS ------------------------------- */

    openChest(chest) {
      if (this.state.chests[chest.id]) {
        EG.story.say('', 'El cofre está vacío.');
        return;
      }
      this.state.chests[chest.id] = true;
      const loot = chest.loot || {};
      const lines = [];
      if (loot.gold) {
        this.state.gold += loot.gold;
        lines.push(`${loot.gold} de oro`);
      }
      if (loot.item) {
        this.addItem(loot.item, loot.count || 1);
        lines.push(`${D().ITEMS[loot.item].name}${loot.count > 1 ? ' ×' + loot.count : ''}`);
      }
      EG.Audio.sfx('chest');
      EG.UI.showToast('¡Has encontrado ' + (lines.join(' y ') || 'polvo') + '!', 'gold');
      EG.story.say('', 'Dentro hay: ' + (lines.join(' y ') || 'sólo polvo y telarañas') + '.');
    },

    startEncounter(enc) {
      const count = EG.chance(0.25) ? 2 : 1;
      const ids = [];
      for (let i = 0; i < count; i++) ids.push(EG.pick(enc.pool));
      this.startBattle(ids, { boss: false });
    },

    startBattle(ids, opts) {
      if (!this.state) return;
      this.mode = 'battle';
      this.overlays.length = 0;
      EG.battle.start(ids, opts || {});
      this.shake = 6;
    },

    endBattle(result, rewards, opts) {
      if (!this.state) return;
      const b = EG.battle.s;
      if (b && b.party) {
        b.party.forEach((c, i) => {
          const ref = this.state.party[i];
          if (!ref) return;
          ref.hp = Math.max(result === 'win' ? 1 : 0, Math.round(c.hp));
          ref.mp = Math.max(0, Math.round(c.mp));
        });
      }
      this.mode = 'world';
      const map = EG.maps[this.state.zone];
      if (map) EG.Audio.music(map.bgm);

      if (result === 'lose') {
        const lost = Math.round(this.state.gold * 0.1);
        this.state.gold = Math.max(0, this.state.gold - lost);
        this.healParty();
        this.mode = 'world';
        EG.world.enter('posada', 6, 7, 'up');
        this.autoSave();
        EG.UI.showToast(`Has caído. Pierdes ${lost} de oro.`, 'bad');
        setTimeout(() => {
          EG.story.say('Bruno', 'Te trajeron de vuelta. Descansa; la luna no se apagará esta noche. Tus heridas están curadas, pero tu bolsa pesa menos.');
        }, 250);
        return;
      }

      if (result === 'win') {
        this.autoSave();
        if (rewards && rewards.levels && rewards.levels.length) {
          EG.Audio.sfx('level');
          const names = rewards.levels.map((l) => `${l.name} alcanza el nivel ${l.lvl}`);
          EG.UI.showToast(names.join(' · '), 'gold');
          const skills = rewards.levels.flatMap((l) => l.skills.map((s) => `${l.name}: ${D().SKILLS[s].name}`));
          if (skills.length) {
            setTimeout(() => {
              EG.story.say('', 'Nuevas habilidades: ' + skills.join(' · '));
            }, 350);
          }
        } else if (rewards) {
          EG.UI.showToast(`+${rewards.xp} EXP · +${rewards.gold} oro`, 'gold');
        }
        if (rewards && rewards.drops && rewards.drops.length) {
          const names = [...new Set(rewards.drops)].map((id) => D().ITEMS[id].name);
          EG.UI.showToast('Botín: ' + names.join(', '), 'gold');
        }
        if (opts && opts.onWin) opts.onWin(rewards);
        return;
      }

      if (result === 'flee') {
        EG.UI.showToast('Escapaste del combate');
      }
    },

    /* ------------------------------- MENÚS ------------------------------- */

    openOverlay(overlay) {
      this.overlays.push(overlay);
      return overlay;
    },

    closeOverlay(overlay) {
      const i = this.overlays.indexOf(overlay);
      if (i >= 0) this.overlays.splice(i, 1);
    },

    openFieldMenu() {
      const self = this;
      const items = () => [
        { label: 'Objetos', sub: `${self.state.party.length} aliados · ${Object.keys(self.state.items).length} tipos`, action: () => self.openItems() },
        { label: 'Equipo', sub: 'Armas, armaduras y accesorios', action: () => self.openEquip() },
        { label: 'Habilidades', sub: 'Consulta lo que sabe cada héroe', action: () => self.openSkills() },
        { label: 'Diario', sub: `Fragmentos ${self.state.fragments}/3`, action: () => self.openJournal() },
        { label: 'Guardar', sub: 'Tres ranuras + autoguardado', action: () => self.openSaveMenu() },
        { label: 'Ajustes', sub: 'Sonido y datos', action: () => self.openSettings() },
        { label: 'Volver', sub: '', action: () => {} },
      ];
      const partyInfo = this.state.party.map((a) => `${a.name} Nv${a.lvl}`).join(' · ');
      const overlay = EG.UI.listPanel({
        title: 'MENÚ',
        subtitle: `${partyInfo}   |   ${EG.fmt(this.state.gold)} oro   |   ${EG.clock(this.state.playtime)}`,
        items,
        footer: 'Los corazones de la espada laten en tu mochila.',
      });
      const origClose = overlay.close.bind(overlay);
      overlay.close = () => {
        if (this.overlays[this.overlays.length - 1] === overlay) origClose();
      };
    },

    openItems() {
      const self = this;
      const items = () => {
        const list = [];
        for (const [id, n] of Object.entries(self.state.items)) {
          const it = D().ITEMS[id];
          if (!it || n <= 0) continue;
          list.push({
            label: `${it.name} ×${n}`,
            sub: it.desc,
            right: it.kind === 'consumible' ? 'USAR' : it.kind.toUpperCase(),
            color: it.kind === 'clave' ? EG.COLORS.gold : EG.COLORS.ink,
            disabled: it.kind === 'clave',
            action: () => {
              if (it.kind !== 'consumible') return;
              self.pickAlly(`Usar ${it.name}`, (actor) => self.useItemOutside(id, actor));
            },
          });
        }
        if (!list.length) list.push({ label: 'Mochila vacía', sub: 'Compra pociones en la herrería', disabled: true });
        return list;
      };
      EG.UI.listPanel({ title: 'OBJETOS', subtitle: `${EG.fmt(self.state.gold)} oro`, items, footer: 'A usar · B volver' });
    },

    pickAlly(title, cb) {
      const self = this;
      let ov = null;
      ov = EG.UI.listPanel({
        title,
        subtitle: 'Elige un aliado',
        items: () => self.state.party.map((a) => {
          const s = D().statsOf(a);
          return {
            label: a.name,
            sub: `Nv ${a.lvl} · PV ${Math.round(a.hp)}/${s.hp} · PM ${Math.round(a.mp)}/${s.mp}`,
            right: `${Math.round((a.hp / s.hp) * 100)}%`,
            action: () => {
              const used = cb(a);
              if (used !== false && ov) ov.close();
            },
          };
        }),
      });
    },

    openEquip() {
      const self = this;
      EG.UI.listPanel({
        title: 'EQUIPO',
        subtitle: 'Elige a un héroe',
        items: () => self.state.party.map((a) => ({
          label: a.name,
          sub: `${D().ACTORS[a.id].role} · Nv ${a.lvl}`,
          action: () => self.openEquipSlots(a),
        })),
      });
    },

    openEquipSlots(actor) {
      const self = this;
      const slots = [['arma', 'Arma'], ['armadura', 'Armadura'], ['accesorio', 'Accesorio']];
      const items = () => slots.map(([slot, label]) => {
        const id = actor.equip[slot];
        const it = id ? D().ITEMS[id] : null;
        return {
          label,
          sub: it ? it.name : '— vacío —',
          right: it && it.stats ? statLine(it.stats) : '',
          action: () => self.openEquipPick(actor, slot),
        };
      });
      const s = D().statsOf(actor);
      EG.UI.listPanel({
        title: actor.name.toUpperCase(),
        subtitle: `ATQ ${s.atk} · DEF ${s.def} · MAG ${s.mag} · RES ${s.res} · VEL ${s.spd}`,
        items,
        footer: 'El equipo cambia tus estadísticas al instante.',
      });
    },

    openEquipPick(actor, slot) {
      const self = this;
      const kind = slot === 'arma' ? 'arma' : slot === 'armadura' ? 'armadura' : 'accesorio';
      let ov = null;
      ov = EG.UI.listPanel({
        title: 'ELEGIR ' + slot.toUpperCase(),
        subtitle: 'Objetos en la mochila',
        items: () => {
          const list = self.equipmentInBag(kind).map((e) => ({
            label: `${e.item.name} ×${e.n}`,
            sub: e.item.desc,
            right: e.item.stats ? statLine(e.item.stats) : '',
            action: () => {
              self.equip(actor, slot, e.id);
              EG.UI.showToast(`${actor.name} equipa ${e.item.name}`);
              if (ov) ov.close();
            },
          }));
          if (actor.equip[slot]) {
            list.unshift({
              label: 'Desequipar',
              sub: 'Devuelve el objeto a la mochila',
              action: () => {
                self.equip(actor, slot, null);
                if (ov) ov.close();
              },
            });
          }
          if (!list.length) list.push({ label: 'Nada que equipar', sub: 'Compra en la herrería', disabled: true });
          return list;
        },
      });
    },

    openSkills() {
      const self = this;
      EG.UI.listPanel({
        title: 'HABILIDADES',
        subtitle: 'Elige a un héroe',
        items: () => self.state.party.map((a) => ({
          label: a.name,
          sub: `${a.skills.length} habilidades · Nv ${a.lvl}`,
          action: () => self.openSkillList(a),
        })),
      });
    },

    openSkillList(actor) {
      EG.UI.listPanel({
        title: actor.name.toUpperCase(),
        subtitle: `PM ${Math.round(actor.mp)}/${D().statsOf(actor).mp}`,
        items: () => actor.skills.map((id) => {
          const sk = D().SKILLS[id];
          return {
            label: sk.name,
            sub: sk.desc,
            right: `${sk.mp} PM`,
            action: () => {},
          };
        }),
      });
    },

    openJournal() {
      const self = this;
      EG.UI.listPanel({
        title: 'DIARIO',
        subtitle: `Fragmentos celestiales: ${self.state.fragments}/3`,
        items: () => EG.story.journal(self.state),
        footer: 'La luna recuerda cada paso que das.',
      });
    },

    openSaveMenu() {
      const self = this;
      EG.UI.listPanel({
        title: 'GUARDAR',
        subtitle: 'Elige una ranura',
        items: () => SAVE_SLOTS.map((slot, i) => {
          const data = EG.store.get(slot, null);
          const meta = data && data.meta;
          return {
            label: `Ranura ${i + 1}` + (meta ? ` · ${meta.name} Nv${meta.lvl}` : ' · vacía'),
            sub: meta ? `${meta.zone} · ${EG.clock(meta.playtime)} · ${new Date(meta.savedAt).toLocaleDateString('es-ES')}` : 'Guardar aquí',
            right: meta ? 'GUARDAR' : 'GUARDAR',
            action: () => {
              if (meta) {
                EG.UI.dialog({
                  pages: [{
                    who: 'Sobrescribir',
                    text: `¿Sobrescribir la ranura ${i + 1}?`,
                    choices: [
                      { label: 'Sí, guardar', action: () => self.saveTo(slot) },
                      { label: 'Cancelar', action: () => {} },
                    ],
                  }],
                });
              } else {
                self.saveTo(slot);
              }
            },
          };
        }),
        footer: 'El autoguardado se actualiza al cambiar de zona.',
      });
    },

    openSettings() {
      const self = this;
      const settings = () => EG.store.get('settings', { music: true, sfx: true });
      EG.UI.listPanel({
        title: 'AJUSTES',
        subtitle: 'Se guardan en este dispositivo',
        items: () => {
          const st = settings();
          return [
            {
              label: 'Música',
              sub: st.music ? 'Activada' : 'Desactivada',
              right: st.music ? 'SÍ' : 'NO',
              action: () => {
                st.music = !st.music;
                EG.store.set('settings', st);
                EG.Audio.setMusic(st.music);
                EG.Audio.sfx('cursor');
              },
            },
            {
              label: 'Efectos de sonido',
              sub: st.sfx ? 'Activados' : 'Desactivados',
              right: st.sfx ? 'SÍ' : 'NO',
              action: () => {
                st.sfx = !st.sfx;
                EG.store.set('settings', st);
                EG.Audio.setSfx(st.sfx);
                EG.Audio.sfx('cursor');
              },
            },
            {
              label: 'Cómo jugar',
              sub: 'Controles, combate y guardado',
              action: () => self.showHowToPlay(),
            },
            {
              label: 'Borrar progreso guardado',
              sub: 'Elimina las tres ranuras y el autoguardado',
              color: '#e08585',
              action: () => {
                EG.UI.dialog({
                  pages: [{
                    who: 'Borrar datos',
                    text: '¿Borrar todas las partidas guardadas de este dispositivo? No se puede deshacer.',
                    choices: [
                      { label: 'Borrar todo', action: () => {
                        for (const s of SAVE_SLOTS.concat(['auto'])) EG.store.remove(s);
                        EG.UI.showToast('Datos borrados');
                      } },
                      { label: 'Cancelar', action: () => {} },
                    ],
                  }],
                });
              },
            },
            { label: 'Volver', sub: '', action: () => {} },
          ];
        },
      });
    },

    /* -------------------------------- TIENDA -------------------------------- */

    openShop(name, goods) {
      const self = this;
      let tab = 'buy';
      let focus = 0;
      let scroll = 0;
      const overlay = {
        modal: true,
        update(dt) {
          const list = this.list();
          if (EG.Input.pressed('left') || EG.Input.pressed('right')) {
            tab = tab === 'buy' ? 'sell' : 'buy';
            focus = 0; scroll = 0;
            EG.Audio.sfx('cursor');
          }
          if (EG.Input.pressed('up') && list.length) { focus = (focus + list.length - 1) % list.length; EG.Audio.sfx('cursor'); }
          if (EG.Input.pressed('down') && list.length) { focus = (focus + 1) % list.length; EG.Audio.sfx('cursor'); }
          if (EG.Input.pressed('ok')) {
            const it = list[focus];
            if (it) this.activate(it);
          }
          if (EG.Input.pressed('back')) { EG.Audio.sfx('cancel'); this.close(); }
        },
        list() {
          if (tab === 'buy') {
            return goods.map((id) => {
              const it = D().ITEMS[id];
              return { id, item: it, price: it.price, label: it.name, sub: it.desc, right: `${it.price} oro` };
            });
          }
          return Object.entries(self.state.items)
            .filter(([id, n]) => n > 0 && D().ITEMS[id] && D().ITEMS[id].kind !== 'clave')
            .map(([id, n]) => {
              const it = D().ITEMS[id];
              return { id, item: it, price: Math.floor(it.price * 0.5), label: `${it.name} ×${n}`, sub: it.desc, right: `+${Math.floor(it.price * 0.5)} oro` };
            });
        },
        activate(it) {
          if (tab === 'buy') {
            if (self.state.gold < it.price) { EG.Audio.sfx('cancel'); EG.UI.showToast('No tienes oro suficiente', 'bad'); return; }
            self.state.gold -= it.price;
            self.addItem(it.id, 1);
            EG.Audio.sfx('coin');
            EG.UI.showToast(`Compraste ${it.item.name}`);
            focus = Math.min(focus, this.list().length - 1);
          } else {
            if (self.countItem(it.id) <= 0) return;
            self.addItem(it.id, -1);
            self.state.gold += it.price;
            EG.Audio.sfx('coin');
            EG.UI.showToast(`Vendiste ${it.item.name} por ${it.price}`);
            focus = Math.min(focus, Math.max(0, this.list().length - 1));
          }
        },
        close() { self.closeOverlay(this); },
        draw() {
          const UI = EG.UI, ctx = UI.ctx;
          const W = UI.W, H = UI.H;
          UI.backdrop(0.75);
          const m = Math.min(18, W * 0.04);
          const bw = W - m * 2, bh = H - m * 2 - 10;
          const bx = m, by = m;
          UI.panel(bx, by, bw, bh, { glow: true });
          UI.txt(name, bx + 18, by + 14, { size: 16, color: EG.COLORS.gold, weight: 'bold', serif: true });
          UI.txt(`${EG.fmt(self.state.gold)} oro`, bx + bw - 18, by + 17, { size: 13, color: EG.COLORS.gold, align: 'right' });
          const tabY = by + 44;
          ['Comprar', 'Vender'].forEach((t, i) => {
            const tw = 96;
            const tx = bx + 18 + i * (tw + 8);
            const active = (i === 0 && tab === 'buy') || (i === 1 && tab === 'sell');
            ctx.save();
            EG.roundRect(ctx, tx, tabY, tw, 30, 8);
            ctx.fillStyle = active ? 'rgba(232,198,106,0.2)' : 'rgba(255,255,255,0.05)';
            ctx.fill();
            ctx.strokeStyle = active ? EG.COLORS.gold : 'rgba(140,150,180,0.3)';
            ctx.stroke();
            ctx.restore();
            UI.txt(t, tx + tw / 2, tabY + 8, { size: 12.5, color: active ? '#f2e3b6' : '#9aa3bd', align: 'center', weight: 'bold' });
            UI.region(tx, tabY, tw, 30, () => {
              tab = i === 0 ? 'buy' : 'sell';
              focus = 0; scroll = 0;
              EG.Audio.sfx('cursor');
            });
          });

          const list = this.list();
          const listY = tabY + 44;
          const rowH = 50;
          const vis = Math.max(1, Math.floor((by + bh - listY - 40) / rowH));
          if (focus < scroll) scroll = focus;
          if (focus >= scroll + vis) scroll = focus - vis + 1;
          list.slice(scroll, scroll + vis).forEach((it, i) => {
            const idx = scroll + i;
            const y = listY + i * rowH;
            const focused = idx === focus;
            ctx.save();
            EG.roundRect(ctx, bx + 12, y, bw - 24, rowH - 4, 8);
            ctx.fillStyle = focused ? 'rgba(232,198,106,0.12)' : 'rgba(255,255,255,0.03)';
            ctx.fill();
            ctx.restore();
            UI.txt(it.label, bx + 26, y + 8, { size: 13.5, color: '#f0ead8', weight: 'bold' });
            UI.txt(it.sub || '', bx + 26, y + 27, { size: 10.5, color: '#9aa3bd' });
            UI.txt(it.right, bx + bw - 26, y + 14, {
              size: 12, color: tab === 'buy' && self.state.gold < it.price ? '#e06060' : EG.COLORS.gold,
              align: 'right', weight: 'bold',
            });
            UI.region(bx + 12, y, bw - 24, rowH - 4, () => { focus = idx; this.activate(it); });
          });
          UI.txt(tab === 'buy' ? '◀ ▶ cambiar pestaña · A comprar · B salir' : '◀ ▶ cambiar pestaña · A vender · B salir', bx + bw / 2, by + bh - 22, {
            size: 10.5, color: 'rgba(200,210,235,0.45)', align: 'center',
          });
        },
      };
      this.openOverlay(overlay);
    },

    /* ------------------------------ FINAL ------------------------------ */

    ending() {
      this.mode = 'ending';
      this.endingTime = 0;
      this.overlays.length = 0;
      EG.Audio.stopMusic();
      EG.Audio.music('ending');
      this.state.flags.ending = true;
      this.autoSave();
    },

    updateEnding(dt) {
      this.endingTime += dt;
      const lines = this.endingLines();
      const total = lines.reduce((n, l) => n + (l.dur || 3), 0);
      if (this.endingTime > total + 2 || EG.Input.pressed('ok')) {
        if (EG.Input.pressed('ok') || this.endingTime > total + 8) {
          this.mode = 'title';
          this.titleTime = 0;
          this.state = null;
          EG.Audio.music('title');
        }
      }
    },

    endingLines() {
      const st = this.state || { playtime: 0, wins: 0 };
      return [
        { text: 'La Espada Celestial vuelve a brillar.', dur: 3.2 },
        { text: 'La luna respira. El eclipse se rompe como cristal.', dur: 3.2 },
        { text: 'Alba celebra. Brann duerme por primera vez en cien años.', dur: 3.2 },
        { text: 'Lyra escribe tu nombre en el margen de un mapa viejo.', dur: 3.2 },
        { text: 'Tú guardas la espada. No como rey, sino como promesa.', dur: 3.4 },
        { text: `Tiempo de juego: ${EG.clock(st.playtime || 0)}  ·  Victorias: ${st.wins || 0}`, dur: 3.6 },
        { text: 'FIN', dur: 4.2, big: true },
        { text: 'Gracias por jugar a LA ESPADA CELESTIAL.', dur: 3.2 },
        { text: 'Toca para volver al título.', dur: 20 },
      ];
    },

    drawEnding() {
      const UI = EG.UI, ctx = UI.ctx;
      const W = UI.W, H = UI.H;
      const t = this.endingTime;
      const g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, '#0a1224');
      g.addColorStop(1, '#08060f');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
      // luna
      ctx.save();
      const glow = ctx.createRadialGradient(W / 2, H * 0.24, 10, W / 2, H * 0.24, Math.min(W, H) * 0.42);
      glow.addColorStop(0, 'rgba(240,232,200,0.22)');
      glow.addColorStop(1, 'rgba(240,232,200,0)');
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, W, H);
      ctx.beginPath();
      ctx.arc(W / 2, H * 0.24, Math.min(W, H) * 0.09, 0, Math.PI * 2);
      ctx.fillStyle = '#eae0c2';
      ctx.fill();
      ctx.restore();

      const lines = this.endingLines();
      let acc = 0;
      let current = null;
      for (const l of lines) {
        if (t >= acc && t < acc + l.dur) { current = l; break; }
        acc += l.dur;
      }
      if (current) {
        const local = t - acc;
        const a = Math.min(1, local * 2) * Math.min(1, (current.dur - local) * 1.6);
        ctx.save();
        ctx.globalAlpha = Math.max(0, Math.min(1, a));
        if (current.big) {
          UI.txt(current.text, W / 2, H * 0.52, {
            size: Math.min(64, W * 0.14), color: '#f2e3b6', align: 'center', baseline: 'middle', serif: true, weight: 'bold',
          });
        } else {
          const size = Math.min(20, W * 0.032);
          const linesWrapped = UI.wrap(current.text, W - 64, Math.max(15, size));
          linesWrapped.forEach((ln, i) => {
            UI.txt(ln, W / 2, H * 0.5 + (i - (linesWrapped.length - 1) / 2) * (size * 1.5), {
              size: Math.max(15, size), color: '#efe8d6', align: 'center', baseline: 'middle', serif: true,
            });
          });
        }
        ctx.restore();
      }
      EG.UI.hint('Toca o pulsa A para continuar');
    },

    /* ------------------------------- DEBUG ------------------------------- */

    debug: {
      giveAll() {
        const g = EG.game;
        for (const id of Object.keys(D().ITEMS)) g.addItem(id, 3);
        g.state.gold += 5000;
        EG.UI.showToast('Debug: objetos y oro');
      },
      warp(zone, x, y) {
        EG.game.state.fragments = Math.max(EG.game.state.fragments, zone === 'castillo' ? 2 : 0);
        EG.world.enter(zone, x, y, 'down');
        EG.game.mode = 'world';
      },
      battle(ids) {
        EG.game.startBattle(ids || ['limo'], { boss: false });
      },
      state() { return EG.game.state; },
    },
  };

  function statLine(stats) {
    const parts = [];
    const names = { atk: 'ATQ', def: 'DEF', mag: 'MAG', res: 'RES', spd: 'VEL', maxmp: 'PM' };
    for (const [k, v] of Object.entries(stats)) parts.push(`+${v} ${names[k] || k}`);
    return parts.join(' ');
  }

  EG.game = game;
  window.addEventListener('load', () => {
    try {
      game.init();
    } catch (err) {
      console.error(err);
      const msg = document.getElementById('boot-msg');
      if (msg) msg.textContent = 'Error al iniciar: ' + err.message;
    }
  });
})();
