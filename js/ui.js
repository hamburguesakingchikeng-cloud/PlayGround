// Interfaz DOM: título, creación, HUD, diálogos, menús y finales.
import {
  CLASSES, APPEARANCE, STATS, ITEMS, SKILLS, CREATURES, LORE, REGIONS
} from './data.js';
import { clamp, escapeHTML, formatPlaytime } from './util.js';
import { drawPortrait, drawCreaturePortrait, drawHero } from './figures.js';
import { drawCinematic, drawMinimap } from './worldview.js';
import { audio } from './audio.js';
import { ENDINGS, QUESTS } from './story.js';
import { MenuSystem } from './ui-menu.js';

const EYES = ['#6c8f8b', '#4d7c8a', '#7d5a37', '#3d5578', '#5a7048', '#7d2833', '#6b4a7a', '#8a6a2e'];
const $ = id => document.getElementById(id);
const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };

export class UI {
  constructor(game) {
    this.game = game;
    this.createState = null;
    this.dialogState = null;
    this.cineState = null;
    this.menuTab = 'character';
    this.mapRegion = null;
    this.mapWorlds = {};
    this.toastTimers = [];
    this._previewRAF = 0;
    this._subtitleTimer = 0;
    this._damageTimer = 0;
    this._captureEls = null;
    this.bind();
  }

  // ───────────────────────── enlaces ─────────────────────────
  bind() {
    $('btn-new')?.addEventListener('click', () => { audio.unlock?.(); this.openCreate(); });
    $('btn-continue')?.addEventListener('click', () => { audio.unlock?.(); this.game.loadGame(); });
    $('btn-title-options')?.addEventListener('click', () => this.openTitleOptions());
    $('btn-title-sound')?.addEventListener('click', () => {
      audio.unlock?.();
      this.game.settings.muted = !this.game.settings.muted;
      this.game.saveSettings();
      $('btn-title-sound').textContent = this.game.settings.muted ? '✕' : '♪';
      $('btn-title-sound').style.opacity = this.game.settings.muted ? '.4' : '1';
    });
    $('btn-create-back')?.addEventListener('click', () => this.showTitle());
    $('btn-begin')?.addEventListener('click', () => this.beginGame());
    $('inp-name')?.addEventListener('input', e => {
      this.createState.name = e.target.value.slice(0, 14);
      const prev = $('preview-name'); if (prev) prev.textContent = this.createState.name || 'Ariadne';
    });
    $('inp-gender')?.addEventListener('change', e => { if (this.createState) this.createState.gender = e.target.value; });

    $('dialog-next')?.addEventListener('click', () => this.advanceDialog());
    $('dialog')?.addEventListener('click', e => { if (e.target.id === 'dialog' || e.target.closest('.dialog-box') && !e.target.closest('button') && !e.target.closest('.dialog-choices')) this.advanceDialog(); });
    $('cinematic')?.addEventListener('click', e => {
      if (e.target.closest('#btn-skip-cine')) return;
      this.advanceCine();
    });
    $('btn-skip-cine')?.addEventListener('click', e => { e.stopPropagation(); this.skipCine(); });

    $('btn-menu')?.addEventListener('click', () => this.openMenu());
    $('btn-map')?.addEventListener('click', () => this.openMenu('map'));
    $('btn-menu-close')?.addEventListener('click', () => this.closeMenu());
    $('btn-save')?.addEventListener('click', () => this.game.save(true));
    $('menu-tabs')?.addEventListener('click', e => {
      const b = e.target.closest('button[data-tab]');
      if (!b) return;
      this.menuTab = b.dataset.tab;
      document.querySelectorAll('#menu-tabs button').forEach(x => x.classList.toggle('active', x === b));
      this.renderMenu();
    });
    $('btn-ending-continue')?.addEventListener('click', () => this.game.postEnding());
    $('btn-ending-title')?.addEventListener('click', () => this.returnToTitle());
    $('modal-layer')?.addEventListener('click', e => { if (e.target.id === 'modal-layer' && !$('modal-layer').dataset.sticky) this.closeModal(); });
    window.addEventListener('resize', () => this.resizeCineCanvas());
  }

  // ───────────────────────── pantallas ─────────────────────────
  showTitle() {
    this.cancelPreview();
    this.game.inGame = false;
    this.game.setMode('title');
    $('loading')?.classList.add('hidden');
    document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
    $('hud')?.classList.add('hidden');
    $('title-screen')?.classList.remove('hidden');
    $('menu')?.classList.add('hidden');
    $('ending')?.classList.add('hidden');
    $('create-screen')?.classList.add('hidden');
    $('cinematic')?.classList.add('hidden');
    $('dialog')?.classList.add('hidden');
    const cont = $('btn-continue');
    if (cont) {
      const has = this.game.hasSave();
      cont.disabled = !has;
      cont.style.opacity = has ? '1' : '.35';
    }
    if (!this.game.settings.muted) audio.playMusic?.('title');
    $('letterbox')?.classList.remove('active');
  }

  hideTitle() { $('title-screen')?.classList.add('hidden'); }

  setLoading(fill, text) {
    $('loading')?.classList.remove('hidden', 'fade');
    const bar = $('load-fill'); if (bar) bar.style.width = clamp(fill, 0, 1) * 100 + '%';
    const t = $('load-text'); if (t && text) t.textContent = text;
  }

  hideLoading() {
    const l = $('loading');
    if (!l) return;
    l.classList.add('fade');
    setTimeout(() => l.classList.add('hidden'), 850);
  }

  // ───────────────────────── creación ─────────────────────────
  openCreate() {
    this.hideTitle();
    this.cancelPreview();
    const cls = Object.values(CLASSES)[0];
    this.createState = {
      name: 'Ariadne', gender: 'ella', classId: 'guardian',
      appearance: { ...APPEARANCE.skins[0] ? {} : {}, skin: 0, hair: 1, hairStyle: 1, outfit: 0, cape: 0, face: 1, eye: EYES[0] },
      alloc: Object.fromEntries(Object.keys(STATS).map(k => [k, 0])),
      points: 6,
      difficulty: this.game.settings.difficulty || 'guardian'
    };
    $('inp-name').value = 'Ariadne';
    $('inp-gender').value = 'ella';
    $('create-screen')?.classList.remove('hidden');
    this.renderCreate();
    this.previewLoop();
    audio.playMusic?.('title');
  }

  renderCreate() {
    const st = this.createState;
    if (!st) return;
    $('preview-name').textContent = st.name || 'Ariadne';
    $('preview-class').textContent = CLASSES[st.classId].name;
    $('points-left').textContent = st.points + ' puntos libres';
    $('create-warning').textContent = st.points > 0 ? 'Aún te quedan puntos por repartir. La profecía no decide por ti.' : 'La profecía no promete un final feliz. Solo uno tuyo.';
    $('btn-begin').disabled = st.points > 0;

    const classBox = $('class-cards');
    classBox.innerHTML = '';
    for (const [id, c] of Object.entries(CLASSES)) {
      const card = el('button', 'class-card' + (st.classId === id ? ' active' : ''),
        `<b>${escapeHTML(c.name)}</b><small>${escapeHTML(c.desc)}</small><em>${escapeHTML(c.perk)}</em>`);
      card.addEventListener('click', () => { st.classId = id; audio.sfx?.('click'); this.renderCreate(); });
      classBox.appendChild(card);
    }

    const grid = $('appearance-grid');
    grid.innerHTML = '';
    grid.appendChild(this.appRow('PIEL', APPEARANCE.skins.map((s, i) => ({ style: `background:${s.c}`, id: i })), st.appearance.skin, v => { st.appearance.skin = v; }));
    grid.appendChild(this.appRow('PELO', APPEARANCE.hairs.map((h, i) => ({ style: `background:${h.c}`, id: i })), st.appearance.hair, v => { st.appearance.hair = v; }));
    grid.appendChild(this.optRow('CORTE', APPEARANCE.hairStyles, st.appearance.hairStyle, v => { st.appearance.hairStyle = v; }));
    grid.appendChild(this.appRow('ROPA', APPEARANCE.outfits.map((o, i) => ({ style: `background:${o.c}`, id: i })), st.appearance.outfit, v => { st.appearance.outfit = v; }));
    grid.appendChild(this.appRow('CAPA', APPEARANCE.capes.map((c, i) => ({ style: `background:${c.c}`, id: i })), st.appearance.cape, v => { st.appearance.cape = v; }));
    grid.appendChild(this.optRow('ROSTRO', APPEARANCE.faces, st.appearance.face, v => { st.appearance.face = v; }));
    grid.appendChild(this.appRow('OJOS', EYES.map((c, i) => ({ style: `background:${c}`, id: i })), EYES.indexOf(st.appearance.eye), v => { st.appearance.eye = EYES[v]; }));

    // dificultad (se inyecta una sola vez)
    let diff = $('create-difficulty');
    if (!diff) {
      diff = el('div', 'section-label');
      diff.id = 'create-difficulty';
      diff.innerHTML = '<span>DIFICULTAD</span><i></i><small id="diff-note"></small>';
      const rowEl = el('div', 'seg'); rowEl.id = 'create-diff-row';
      $('create-form')?.insertBefore(diff, $('create-form').querySelector('.create-footer'));
      $('create-form')?.insertBefore(rowEl, $('create-form').querySelector('.create-footer'));
    }
    const diffRow = $('create-diff-row');
    diffRow.innerHTML = '';
    for (const [id, d] of Object.entries({ viajero: 'VIAJERO', guardian: 'GUARDIÁN', celestial: 'CELESTIAL' })) {
      const b = el('button', st.difficulty === id ? 'active' : '', d);
      b.title = (id === 'viajero' ? 'Daño recibido -25%.' : id === 'celestial' ? 'Daño recibido +55%.' : 'Experiencia pretendida.');
      b.addEventListener('click', () => { st.difficulty = id; this.renderCreate(); });
      diffRow.appendChild(b);
    }
    $('diff-note').textContent = st.difficulty === 'viajero' ? 'El relato por encima de todo' : st.difficulty === 'celestial' ? 'Para quienes no temen al Velo' : 'Un mundo que responde';

    const alloc = $('stat-alloc');
    alloc.innerHTML = '';
    const base = this.previewStats(st);
    for (const [key, def] of Object.entries(STATS)) {
      const row = el('div', 'stat-line');
      const eff = key === 'vitalidad' ? `${base.maxHp} PV` : key === 'mana' ? `${base.maxMp} PM` : key === 'aguante' ? `${base.maxSt} AG` :
        key === 'fuerza' ? `${Math.round(base.atk)} ATQ` : key === 'defensa' ? `${Math.round(base.def)} DEF` :
        key === 'velocidad' ? `${Math.round(base.speed)} VEL` : key === 'inteligencia' ? `+${Math.round(base.s.inteligencia * 3.5)}%` : `${Math.round(base.crit * 100)}% CRIT`;
      row.innerHTML = `<span class="sn">${def.name}</span><button data-k="${key}" data-v="-1" ${st.alloc[key] <= 0 ? 'disabled' : ''}>−</button><span class="sv">${6 + (CLASSES[st.classId].bonus[key] || 0) + st.alloc[key]}</span><button data-k="${key}" data-v="1" ${st.points <= 0 ? 'disabled' : ''}>+</button><span class="eff">${eff}</span>`;
      row.querySelectorAll('button').forEach(b => b.addEventListener('click', () => {
        const k = b.dataset.k, dv = Number(b.dataset.v);
        if (dv > 0 && st.points > 0) { st.alloc[k]++; st.points--; }
        if (dv < 0 && st.alloc[k] > 0) { st.alloc[k]--; st.points++; }
        audio.sfx?.('click'); this.renderCreate();
      }));
      alloc.appendChild(row);
    }
    const ps = $('preview-stats');
    ps.innerHTML = '';
    for (const key of Object.keys(STATS)) {
      const d = el('div', '', `<span>${STATS[key].short}</span><b>${base.s[key]}</b>`);
      ps.appendChild(d);
    }
  }

  appRow(label, colors, active, set) {
    const row = el('div', 'app-row');
    row.appendChild(el('span', '', label));
    const sw = el('div', 'swatches');
    colors.forEach(c => {
      const b = el('button', 'swatch' + (active === c.id ? ' active' : ''));
      b.style.cssText = c.style;
      b.title = APPEARANCE.skins[c.id]?.id || APPEARANCE.hairs[c.id]?.id || '';
      b.addEventListener('click', () => { audio.sfx?.('click'); set(c.id); this.renderCreate(); });
      sw.appendChild(b);
    });
    row.appendChild(sw);
    return row;
  }

  optRow(label, options, active, set) {
    const row = el('div', 'app-row');
    row.appendChild(el('span', '', label));
    const wrap = el('div', 'swatches');
    options.forEach((o, i) => {
      const b = el('button', 'opt-btn' + (active === i ? ' active' : ''), escapeHTML(o));
      b.addEventListener('click', () => { audio.sfx?.('click'); set(i); this.renderCreate(); });
      wrap.appendChild(b);
    });
    row.appendChild(wrap);
    return row;
  }

  previewStats(st) {
    const cls = CLASSES[st.classId];
    const s = {};
    for (const k of Object.keys(STATS)) s[k] = 6 + (cls.bonus[k] || 0) + st.alloc[k];
    const item = ITEMS[cls.startWeapon], armor = ITEMS[cls.startArmor];
    for (const [k, v] of Object.entries({ ...(item?.stats || {}), ...(armor?.stats || {}) })) s[k] += v;
    return {
      s, maxHp: Math.round(55 + s.vitalidad * 13), maxMp: Math.round(24 + s.mana * 8),
      maxSt: Math.round(52 + s.aguante * 7), atk: 5 + s.fuerza * 1.9 + (item?.atk || 0) * 2.2,
      def: Math.round(s.defensa * 1.6 + (armor?.def || 0)), speed: 154 + s.velocidad * 4.6,
      crit: clamp(.05 + s.suerte * .016 + (item?.crit || 0) * .01, .05, .62)
    };
  }

  previewLoop() {
    cancelAnimationFrame(this._previewRAF);
    const tick = () => {
      if ($('create-screen').classList.contains('hidden') || !this.createState) return;
      const canvas = $('preview-canvas');
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const W = canvas.width, H = canvas.height, t = performance.now() / 1000;
      ctx.clearRect(0, 0, W, H);
      const g = ctx.createRadialGradient(W * .5, H * .58, 10, W * .5, H * .58, W * .68);
      g.addColorStop(0, 'rgba(56,76,112,.42)'); g.addColorStop(.55, 'rgba(14,22,38,.3)'); g.addColorStop(1, 'rgba(5,8,14,0)');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = 'rgba(232,195,122,.18)'; ctx.lineWidth = 1;
      for (let i = 0; i < 3; i++) {
        ctx.beginPath(); ctx.ellipse(W / 2, H * .77, W * (.22 + i * .09), H * (.045 + i * .018), 0, 0, Math.PI * 2); ctx.stroke();
      }
      const cls = CLASSES[this.createState.classId];
      const hero = {
        x: W / 2, y: H * .78, appearance: this.createState.appearance,
        equipment: { weapon: cls.startWeapon, armor: cls.startArmor, helm: null, cape: null, relic: null },
        classId: this.createState.classId, state: 'idle', stateT: t, walkPhase: 0,
        facing: Math.PI / 2, hurtT: 0
      };
      drawHero(ctx, hero, t, { scale: 4.35 });
      this._previewRAF = requestAnimationFrame(tick);
    };
    this._previewRAF = requestAnimationFrame(tick);
  }

  cancelPreview() { cancelAnimationFrame(this._previewRAF); this._previewRAF = 0; }

  beginGame() {
    const st = this.createState;
    if (!st || st.points > 0) return;
    audio.unlock?.();
    this.cancelPreview();
    $('create-screen')?.classList.add('hidden');
    this.game.settings.difficulty = st.difficulty;
    this.game.newGame({
      name: $('inp-name').value.trim() || 'Ariadne', gender: $('inp-gender').value,
      classId: st.classId, appearance: st.appearance, alloc: st.alloc, difficulty: st.difficulty
    });
  }

  enterGame() {
    $('title-screen')?.classList.add('hidden');
    $('create-screen')?.classList.add('hidden');
    $('ending')?.classList.add('hidden');
    $('menu')?.classList.add('hidden');
    $('hud')?.classList.remove('hidden');
    this.hideLoading();
    this.refreshSkillWheel();
    const pc = $('hud-portrait');
    if (pc) drawPortrait(pc.querySelector('canvas'), 'hero', this.game.appearance, this.game.classId);
    this.updateHUD(0);
  }

  // ───────────────────────── HUD ─────────────────────────
  updateHUD(dt = 0) {
    const g = this.game, p = g.player;
    if (!p || !g.inGame || $('hud').classList.contains('hidden')) return;
    const setW = (id, v) => { const e = $(id); if (e) e.style.width = clamp(v, 0, 1) * 100 + '%'; };
    setW('bar-hp', p.hp / p.maxHp);
    setW('bar-mp', p.mp / p.maxMp);
    setW('bar-st', p.stamina / p.maxStamina);
    setW('bar-xp', g.xp / g.xpNeeded());
    const t = (id, v) => { const e = $(id); if (e && e.textContent !== v) e.textContent = v; };
    t('txt-hp', `${Math.ceil(p.hp)} / ${Math.round(p.maxHp)}`);
    t('txt-mp', `${Math.ceil(p.mp)} / ${Math.round(p.maxMp)}`);
    t('txt-st', `${Math.ceil(p.stamina)} / ${Math.round(p.maxStamina)}`);
    t('hud-name', g.name); t('hud-level', String(g.level));
    t('hud-class', CLASSES[g.classId]?.name || '');
    t('hud-gold', String(g.gold)); t('hud-shards', String(g.shards));
    const def = g.world?.def;
    if (def) {
      t('hud-region', def.name);
      let nearest = null, nd = 1e9;
      for (const poi of def.pois) {
        const d = Math.hypot(g.player.x - (poi.x * 64 + 32), g.player.y - (poi.y * 64 + 32));
        if (d < nd) { nd = d; nearest = poi; }
      }
      t('hud-subloc', nearest ? nearest.name : def.subtitle);
    }
    const q = this.currentQuest();
    if (q) {
      const stage = QUESTS[q.id]?.stages[q.stage];
      t('hud-quest', stage?.text || 'El Velo espera');
      if (g.questTarget) {
        const d = Math.hypot(g.player.x - g.questTarget.x, g.player.y - g.questTarget.y);
        t('hud-quest-dist', d > 1200 ? `${(d / 1000).toFixed(1)} km` : `${Math.round(d / 10)} m`);
      } else t('hud-quest-dist', '');
    } else {
      t('hud-quest', 'Explora el Velo'); t('hud-quest-dist', '');
    }
    const prompt = $('interact-prompt');
    if (g.nearInteract && g.mode === 'playing') {
      prompt?.classList.remove('hidden');
      const txt = $('interact-text'); if (txt) txt.textContent = g.nearInteract.label || 'Interactuar';
      document.querySelector('.act-interact')?.classList.remove('hidden');
    } else {
      prompt?.classList.add('hidden');
      document.querySelector('.act-interact')?.classList.add('hidden');
    }
    const combo = $('combo-indicator');
    if (combo) {
      combo.classList.toggle('show', p.combo > 1 && p.comboT > 0);
      combo.querySelector('b').textContent = p.combo;
    }
    $('danger-vignette')?.classList.toggle('show', p.hp / p.maxHp < .25 && !p.dead);
    const comp = $('companion-chip');
    if (g.ally && !g.ally.dead) {
      comp?.classList.remove('hidden');
      t('companion-name', g.ally.data.name);
      const hp = $('companion-hp'); if (hp) hp.style.width = clamp(g.ally.hp / g.ally.maxHp, 0, 1) * 100 + '%';
      drawCreaturePortrait($('companion-portrait'), g.ally.species, g.time);
    } else comp?.classList.add('hidden');
    if (g.boss && !g.boss.dead) {
      $('boss-wrap')?.classList.remove('hidden');
      t('boss-name', g.boss.data.name);
      t('boss-epithet', g.boss.data.epithet || 'GUARDIÁN');
      t('boss-phase', g.boss.phase > 1 ? 'FASE II · EL VELO SE ABRE' : 'FASE I');
      setW('boss-hp', g.boss.hp / g.boss.maxHp);
      const d = $('boss-delay'); if (d) d.style.width = clamp(g.boss.hp / g.boss.maxHp, 0, 1) * 100 + '%';
    } else $('boss-wrap')?.classList.add('hidden');
    if (g.time % .4 < .1) {
      try { drawMinimap($('minimap'), g); } catch { /* canvas no listo */ }
    }
    this.updateCooldowns();
  }

  currentQuest() {
    const active = Object.values(this.game.quests || {}).filter(q => q.started && !q.done);
    const main = active.filter(q => QUESTS[q.id]?.type === 'main');
    return (main[0] || active[0] || null);
  }

  refreshSkillWheel() {
    const g = this.game;
    const wheel = $('skill-wheel');
    const row = $('cooldown-row');
    if (!wheel || !row) return;
    wheel.innerHTML = '';
    row.innerHTML = '';
    g.activeSkillSlots.forEach((id, i) => {
      const sk = SKILLS[id];
      const b = el('button', 'skill-slot' + (sk ? '' : ' locked'), sk ? sk.icon : '·');
      b.title = sk ? `${sk.name} — ${sk.desc}` : 'Ranura vacía';
      b.innerHTML = `${sk ? sk.icon : '·'}<small>${i + 1}</small>`;
      if (sk) b.addEventListener('click', () => g.castSkill(i));
      wheel.appendChild(b);
      const c = el('div', 'skill-slot', sk ? sk.icon : '·');
      c.innerHTML = `${sk ? sk.icon : '·'}<div class="cd"></div>`;
      row.appendChild(c);
    });
  }

  updateCooldowns() {
    const g = this.game;
    const row = $('cooldown-row');
    if (!row) return;
    [...row.children].forEach((node, i) => {
      const id = g.activeSkillSlots[i];
      const cd = id ? (g.cooldowns[id] || 0) : 0;
      const ov = node.querySelector('.cd');
      if (ov) {
        ov.style.display = cd > 0 ? 'grid' : 'none';
        ov.textContent = cd > 0 ? Math.ceil(cd) : '';
      }
    });
    const wheel = $('skill-wheel');
    if (wheel) [...wheel.children].forEach((node, i) => {
      const id = g.activeSkillSlots[i];
      const cd = id ? (g.cooldowns[id] || 0) : 0;
      node.style.opacity = cd > 0 ? '.45' : '';
    });
  }

  // ───────────────────────── avisos ─────────────────────────
  toast(text, kind = '') {
    const layer = $('toast-layer');
    if (!layer || !text) return;
    while (layer.children.length >= 4) layer.firstElementChild.remove();
    const n = el('div', 'toast ' + kind, escapeHTML(text));
    layer.appendChild(n);
    setTimeout(() => { n.style.opacity = '0'; n.style.transform = 'translateY(-6px)'; setTimeout(() => n.remove(), 350); }, 2800);
  }

  subtitle(text, seconds = 4) {
    const s = $('subtitle');
    if (!s) return;
    s.textContent = text;
    s.classList.add('show');
    clearTimeout(this._subtitleTimer);
    this._subtitleTimer = setTimeout(() => s.classList.remove('show'), seconds * 1000);
  }

  flashDamage() {
    const v = $('danger-vignette');
    if (!v) return;
    v.classList.add('show');
    this._damageTimer = setTimeout(() => {
      if (!this.game.player || this.game.player.hp / this.game.player.maxHp >= .25) v.classList.remove('show');
    }, 260);
  }

  showBoss(e) {
    const w = $('boss-wrap');
    if (!w) return;
    w.classList.remove('hidden');
    $('boss-name').textContent = e.data.name;
    $('boss-epithet').textContent = e.data.epithet || 'GUARDIÁN';
    $('boss-phase').textContent = 'FASE I';
  }
  hideBoss() { $('boss-wrap')?.classList.add('hidden'); }

  onRegionChange(regionId) {
    const def = REGIONS[regionId];
    if (!def) return;
    this.subtitle(`${def.name} — ${def.subtitle}`, 4.5);
    const pc = $('hud-portrait');
    if (pc) drawPortrait(pc.querySelector('canvas'), 'hero', this.game.appearance, this.game.classId);
  }

  // ───────────────────────── diálogo ─────────────────────────
  dialog(opts) {
    if (this.dialogState) return Promise.resolve();
    const data = Array.isArray(opts) ? { lines: opts } : opts || {};
    const lines = (data.lines || []).filter(Boolean);
    if (!lines.length) { data.onEnd?.(); return Promise.resolve(); }
    this.game.setMode('dialog');
    this.game.input?.clear?.();
    $('dialog')?.classList.remove('hidden');
    this.dialogState = { lines, index: 0, onEnd: data.onEnd, typing: false, timer: null, full: '', resolve: null, pendingThen: null };
    return new Promise(resolve => {
      this.dialogState.resolve = resolve;
      this.showDialogLine();
    });
  }

  showDialogLine() {
    const st = this.dialogState;
    if (!st) return;
    const line = st.lines[st.index];
    if (!line) { this.finishDialog(); return; }
    $('dialog-speaker').textContent = line.speaker || '';
    $('dialog-role').textContent = line.role || '';
    const canvas = $('dialog-portrait');
    if (canvas) drawPortrait(canvas, line.look || 'book', this.game.appearance, this.game.classId);
    const textEl = $('dialog-text');
    const choices = $('dialog-choices');
    choices.innerHTML = '';
    choices.classList.add('hidden');
    $('dialog-next').classList.remove('hidden');
    st.full = line.text || '…';
    st.typing = true;
    textEl.textContent = '';
    let i = 0;
    clearInterval(st.timer);
    st.timer = setInterval(() => {
      i += 2;
      textEl.textContent = st.full.slice(0, i);
      if (i >= st.full.length) {
        clearInterval(st.timer);
        st.typing = false;
        if (line.choices?.length) this.showChoices(line.choices);
      }
    }, 16);
    st.hasChoices = !!line.choices?.length;
  }

  showChoices(choices) {
    const st = this.dialogState;
    if (!st) return;
    const box = $('dialog-choices');
    box.innerHTML = '';
    $('dialog-next').classList.add('hidden');
    choices.forEach(ch => {
      const b = el('button', '', escapeHTML(ch.text));
      b.addEventListener('click', e => {
        e.stopPropagation();
        clearInterval(st.timer);
        try { ch.action?.(); } catch (err) { console.error(err); }
        if (ch.then?.length) {
          st.lines.splice(st.index + 1, 0, ...ch.then);
          st.index++;
          this.showDialogLine();
        } else {
          this.advanceDialog(true);
        }
      });
      box.appendChild(b);
    });
    box.classList.remove('hidden');
  }

  advanceDialog(force = false) {
    const st = this.dialogState;
    if (!st) return;
    if (st.typing && !force) {
      clearInterval(st.timer);
      st.typing = false;
      $('dialog-text').textContent = st.full;
      const line = st.lines[st.index];
      if (line?.choices?.length) this.showChoices(line.choices);
      return;
    }
    if (st.hasChoices && !force) return;
    clearInterval(st.timer);
    st.index++;
    if (st.index >= st.lines.length) this.finishDialog();
    else { st.hasChoices = false; this.showDialogLine(); }
  }

  finishDialog() {
    const st = this.dialogState;
    if (!st) return;
    clearInterval(st.timer);
    this.dialogState = null;
    $('dialog')?.classList.add('hidden');
    $('dialog-choices')?.classList.add('hidden');
    if (this.game.inGame && !this.cineState && this.game.mode === 'dialog') this.game.setMode('playing');
    const resolve = st.resolve;
    try { st.onEnd?.(); } catch (err) { console.error(err); }
    resolve?.();
  }

  // ───────────────────────── cinemáticas ─────────────────────────
  playCinematic(slides) {
    if (this.cineState) return Promise.resolve();
    return new Promise(resolve => {
      this.game.setMode('cinematic');
      this.game.input?.clear?.();
      $('cinematic')?.classList.remove('hidden');
      $('letterbox')?.classList.add('active');
      this.cineState = { slides, index: 0, t: 0, resolve, raf: 0, textTimer: null, full: '', typing: false, shownAt: performance.now() };
      this.resizeCineCanvas();
      this.showCineSlide();
      const loop = () => {
        if (!this.cineState) return;
        this.cineState.t += .016;
        const c = $('cine-canvas');
        if (c) {
          const ctx = c.getContext('2d');
          drawCinematic(ctx, c.width, c.height, this.cineState.slides[this.cineState.index]?.art || 'despertar', this.cineState.t);
        }
        this.cineState.raf = requestAnimationFrame(loop);
      };
      loop();
    });
  }

  resizeCineCanvas() {
    const c = $('cine-canvas');
    if (!c) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    c.width = Math.floor(window.innerWidth * dpr);
    c.height = Math.floor(window.innerHeight * dpr);
    const ctx = c.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  showCineSlide() {
    const st = this.cineState;
    if (!st) return;
    const s = st.slides[st.index];
    if (!s) { this.finishCine(); return; }
    $('cine-chapter').textContent = s.chapter || 'EL VELO';
    const elText = $('cine-text');
    elText.innerHTML = '';
    st.full = s.text || '';
    st.lineEl = null;
    if (s.title) {
      const em = el('em', '', escapeHTML(s.title));
      const line = el('span');
      line.style.display = 'block';
      line.style.marginTop = '6px';
      elText.append(em, line);
      st.lineEl = line;
    }
    const target = st.lineEl || elText;
    st.typing = true;
    st.len = 0;
    clearInterval(st.textTimer);
    st.textTimer = setInterval(() => {
      st.len += 2;
      target.textContent = st.full.slice(0, st.len);
      if (st.len >= st.full.length) { clearInterval(st.textTimer); st.typing = false; }
    }, 17);
    $('cine-continue').textContent = 'Toca para continuar';
    st.shownAt = performance.now();
  }

  advanceCine() {
    const st = this.cineState;
    if (!st) return;
    if (st.typing) {
      clearInterval(st.textTimer);
      st.typing = false;
      if (st.lineEl) st.lineEl.textContent = st.full;
      else $('cine-text').textContent = st.full;
      return;
    }
    st.index++;
    if (st.index >= st.slides.length) this.finishCine();
    else this.showCineSlide();
  }

  skipCine() {
    if (!this.cineState) return;
    this.finishCine();
  }

  finishCine() {
    const st = this.cineState;
    if (!st) return;
    cancelAnimationFrame(st.raf);
    clearInterval(st.textTimer);
    this.cineState = null;
    $('cinematic')?.classList.add('hidden');
    $('letterbox')?.classList.remove('active');
    if (this.game.inGame) this.game.setMode('playing');
    st.resolve?.();
  }

  // ───────────────────────── captura de ecos ─────────────────────────
  ensureCaptureEls() {
    if (this._captureEls) return this._captureEls;
    const wrap = el('div', 'capture-overlay hidden');
    wrap.id = 'capture-overlay';
    wrap.innerHTML = `
      <div class="capture-card">
        <span class="cap-kicker">RESONANCIA DE ECO</span>
        <b id="cap-name">Lumi</b>
        <small>Detén la luz en el centro. Pulsa Resonar o toca aquí.</small>
        <div class="cap-track"><div class="cap-zone" id="cap-zone"></div><div class="cap-marker" id="cap-marker"></div></div>
        <div class="cap-actions"><button id="cap-btn">RESONAR</button></div>
      </div>`;
    document.body.appendChild(wrap);
    wrap.addEventListener('click', e => { if (e.target.id !== 'capture-overlay') this.game.pressSummon(); });
    this._captureEls = { wrap, name: wrap.querySelector('#cap-name'), marker: wrap.querySelector('#cap-marker'), zone: wrap.querySelector('#cap-zone'), btn: wrap.querySelector('#cap-btn') };
    this._captureEls.btn.addEventListener('click', e => { e.stopPropagation(); this.game.pressSummon(); });
    return this._captureEls;
  }

  startCaptureOverlay(c) {
    const e = this.ensureCaptureEls();
    e.wrap.classList.remove('hidden');
    e.name.textContent = c.data.name;
    const zonePct = (c.zone || .1) * 100;
    e.zone.style.left = (50 - zonePct) + '%';
    e.zone.style.width = (zonePct * 2) + '%';
    e.marker.style.left = '0%';
    audio.sfx?.('resonance');
  }

  updateCaptureOverlay(capture) {
    if (!this._captureEls) return;
    if (!capture) { this._captureEls.wrap.classList.add('hidden'); return; }
    this._captureEls.wrap.classList.remove('hidden');
    this._captureEls.marker.style.left = (capture.value * 100) + '%';
  }

  endCaptureOverlay(success) {
    if (!this._captureEls) return;
    const e = this._captureEls;
    e.wrap.classList.add(success ? 'success' : 'fail');
    setTimeout(() => { e.wrap.classList.add('hidden'); e.wrap.classList.remove('success', 'fail'); }, 380);
  }

  playPortalTransition(cb) {
    const f = el('div', 'fade-transition');
    document.body.appendChild(f);
    requestAnimationFrame(() => f.classList.add('on'));
    setTimeout(() => {
      cb?.();
      f.classList.remove('on');
      setTimeout(() => f.remove(), 700);
    }, 560);
  }

  // ───────────────────────── muerte ─────────────────────────
  showDeath() {
    const layer = $('modal-layer');
    layer.classList.remove('hidden');
    layer.dataset.sticky = '1';
    $('modal-title').textContent = 'HAS CAÍDO';
    $('modal-body').innerHTML = '<p>El Velo te devuelve al último lugar donde tu memoria echó raíces. No es piedad. Es otra oportunidad.</p>';
    const actions = $('modal-actions');
    actions.innerHTML = '';
    const revive = el('button', 'btn btn-primary', 'DESPERTAR');
    revive.addEventListener('click', () => { layer.classList.add('hidden'); delete layer.dataset.sticky; this.game.revive(); });
    const load = el('button', 'btn', 'CARGAR PARTIDA');
    load.addEventListener('click', () => { layer.classList.add('hidden'); delete layer.dataset.sticky; this.game.loadGame(); });
    const title = el('button', 'btn btn-ghost', 'VOLVER AL TÍTULO');
    title.addEventListener('click', () => { layer.classList.add('hidden'); delete layer.dataset.sticky; this.returnToTitle(); });
    actions.append(revive, load, title);
  }

  hideDeath() {
    const layer = $('modal-layer');
    layer.classList.add('hidden');
    delete layer.dataset.sticky;
  }

  // ───────────────────────── final ─────────────────────────
  showEnding(choice, data) {
    const d = data || ENDINGS[choice];
    if (!d) return;
    $('hud')?.classList.add('hidden');
    $('ending')?.classList.remove('hidden');
    $('ending-eyebrow').textContent = d.eyebrow;
    $('ending-title').textContent = d.title;
    $('ending-text').textContent = d.text;
    const st = $('ending-stats');
    st.innerHTML = '';
    const entries = [
      ['NIVEL', this.game.level], ['HORAS', formatPlaytime(this.game.playtime)],
      ['ECOS', this.game.captured.length], ['ORO', this.game.gold], ['MISIONES', Object.values(this.game.quests).filter(q => q.done).length]
    ];
    for (const [label, value] of entries) st.appendChild(el('div', '', `<b>${escapeHTML(String(value))}</b><span>${label}</span>`));
    audio.sfx?.('ending');
  }

  hideEnding() {
    $('ending')?.classList.add('hidden');
    $('hud')?.classList.remove('hidden');
    this.updateHUD(0);
  }

  returnToTitle() {
    if (this.game.inGame) this.game.save(false);
    this.hideDeath();
    this.closeMenu(true);
    this.game.inGame = false;
    $('hud')?.classList.add('hidden');
    $('ending')?.classList.add('hidden');
    $('menu')?.classList.add('hidden');
    this.showTitle();
  }

  // ───────────────────────── menú y tienda (mixin) ─────────────────────────
  closeModal() {
    const layer = $('modal-layer');
    layer.classList.add('hidden');
    delete layer.dataset.sticky;
  }

  openTitleOptions() {
    const layer = $('modal-layer');
    layer.classList.remove('hidden');
    $('modal-title').textContent = 'OPCIONES';
    const s = this.game.settings;
    $('modal-body').innerHTML = `
      <p>La Espada Celestial se juega mejor en horizontal, con sonido.</p>
      <div class="setting-row"><div class="label">Dificultad<small>Se aplica al empezar una partida</small></div><div class="control"><div class="seg" id="title-diff">${['viajero', 'guardian', 'celestial'].map(k => `<button data-k="${k}" class="${s.difficulty === k ? 'active' : ''}">${k.toUpperCase()}</button>`).join('')}</div></div></div>
      <div class="setting-row"><div class="label">Volumen maestro</div><div class="control"><input type="range" min="0" max="1" step=".05" value="${s.master}" id="title-vol"><span class="val">${Math.round(s.master * 100)}%</span></div></div>`;
    const actions = $('modal-actions');
    actions.innerHTML = '';
    const close = el('button', 'btn btn-primary', 'CERRAR');
    close.addEventListener('click', () => this.closeModal());
    actions.appendChild(close);
    $('title-diff').addEventListener('click', e => {
      const b = e.target.closest('button'); if (!b) return;
      s.difficulty = b.dataset.k; this.game.difficulty = s.difficulty; this.game.saveSettings();
      $('title-diff').querySelectorAll('button').forEach(x => x.classList.toggle('active', x === b));
    });
    $('title-vol').addEventListener('input', e => {
      s.master = Number(e.target.value); this.game.saveSettings();
      e.target.nextElementSibling.textContent = Math.round(s.master * 100) + '%';
    });
  }
}

Object.assign(UI.prototype, MenuSystem);
