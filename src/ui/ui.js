import { clamp, rand, dist } from '../core/utils.js';
import { drawHumanoid, drawCreature, drawPortrait } from '../art/characters.js';
import { ITEMS, EQUIP_SLOTS, STARTING_KITS, STAT_DEFS, itemStats, statLine } from '../data/items.js';
import { CREATURES, CREATURE_ORDER, CREATURE_TYPES } from '../data/creatures.js';
import { NPCS, QUESTS, CUTSCENES } from '../data/story.js';
import { getRegion, TILE } from '../world/regions.js';
import { listSaves, readSave, writeSave, deleteSave, formatPlayTime, formatDate, persistSettings } from '../core/save.js';

const $ = (id) => document.getElementById(id);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const REGION_NAMES = { valdoria: 'Valdoria', drakmor: 'Drakmor', kansordore: 'Kansordore' };
const SLOT_LABELS = { weapon: 'Arma', armor: 'Armadura', helm: 'Casco', accessory: 'Accesorio', cloak: 'Capa' };
const TYPE_LABELS = { weapon: 'Armas', armor: 'Armaduras', helm: 'Cascos', accessory: 'Accesorios', cloak: 'Capas', consumable: 'Consumibles', material: 'Materiales', key: 'Objetos clave' };

const SHOPS = {
  borin: {
    name: 'Forja de Borin', keeper: 'Borin', subtitle: 'Acero honesto, precios honestos',
    items: ['filo_lumen', 'coraza_guardia', 'yelmo_guardia', 'mandoble_ceniza', 'capa_guardian', 'pocion_menor']
  },
  ash: {
    name: 'Fundición de Ash', keeper: 'Ash', subtitle: 'Todo está caliente. Incluso los precios',
    items: ['dagas_susurro', 'baston_resonancia', 'cota_ceniza', 'anillo_filo', 'pocion_mayor', 'eter']
  },
  elara: {
    name: 'Herbolario de Elara', keeper: 'Elara', subtitle: 'Remedios, provisiones y algo de consuelo',
    items: ['pocion_menor', 'pan_viaje', 'eter', 'incienso', 'amuleto_lumen']
  }
};

const TABS = [
  { id: 'quests', label: 'Diario' },
  { id: 'equip', label: 'Equipo' },
  { id: 'inventory', label: 'Inventario' },
  { id: 'creatures', label: 'Criaturas' },
  { id: 'map', label: 'Mapa' },
  { id: 'save', label: 'Guardar' },
  { id: 'settings', label: 'Ajustes' },
];

const OUTFITS = [
  { outfit: '#445a80', accent: '#c8a060' },
  { outfit: '#3d4c64', accent: '#96a8bc' },
  { outfit: '#4a3f63', accent: '#b8a0e8' },
];
const ARMOR_ITEMS = ['tunica_errante', 'coraza_guardia', 'manto_erudito'];

export class UIController {
  constructor(opts = {}) {
    this.audio = opts.audio;
    this.settings = opts.settings || {};
    this.onNewGame = opts.onNewGame || (() => {});
    this.onLoadSave = opts.onLoadSave || (() => {});
    this.onExitToTitle = opts.onExitToTitle || (() => {});
    this.onSettingsChange = opts.onSettingsChange || (() => {});
    this.game = null;
    this.overlayMode = null;
    this.currentTab = 'quests';
    this.standaloneSettings = false;
    this.dlg = null;
    this.cut = null;
    this.res = null;
    this.toastTimer = null;
    this.typeTimer = null;
    this.zoneTimer = null;
    this.creation = null;
    this.creationRAF = null;
    this.equipSlot = 'weapon';
    this.lastPortraitKey = '';
    this.lastMinimap = 0;
    this.bind();
    this.renderGearCards();
    this.renderStatAlloc();
  }

  /* ------------------------------------------------------------------ */
  /*  Enlaces básicos                                                    */
  /* ------------------------------------------------------------------ */

  bind() {
    $('btn-journal')?.addEventListener('click', () => this.game && this.openMenu('quests'));
    $('btn-menu')?.addEventListener('click', () => this.game && this.openMenu('main'));
    $('overlay-close')?.addEventListener('click', () => this.closeAll());
    $('overlay')?.addEventListener('click', (e) => { if (e.target.id === 'overlay') this.closeAll(); });
    $('overlay-tabs')?.addEventListener('click', (e) => {
      const b = e.target.closest('[data-tab]');
      if (b) this.openTab(b.dataset.tab);
    });
    $('overlay-body')?.addEventListener('click', (e) => this.onOverlayClick(e));
    $('overlay-body')?.addEventListener('input', (e) => this.onOverlayInput(e));
    $('overlay-body')?.addEventListener('change', (e) => this.onOverlayInput(e));

    $('dialogue')?.addEventListener('click', (e) => {
      if (e.target.closest('.dialogue-choices')) return;
      this.advanceDialogue();
    });
    $('cutscene-skip')?.addEventListener('click', () => this.advanceCutscene());
    $('cutscene')?.addEventListener('click', (e) => { if (!e.target.closest('button')) this.advanceCutscene(); });
    $('res-strike')?.addEventListener('click', () => this.strikeResonance());

    this._key = (e) => {
      if (e.code === 'Escape') {
        if (!this.dlg?.hidden) return;
        if (!this.overlay?.classList.contains('hidden')) { e.preventDefault(); this.closeAll(); return; }
        if (!this.resonanceEl?.classList.contains('hidden')) return;
      }
      if (!this.dlg?.hidden && (e.code === 'Space' || e.code === 'Enter' || e.code === 'KeyE')) {
        e.preventDefault();
        this.advanceDialogue();
      } else if (!this.resonanceEl?.classList.contains('hidden') && (e.code === 'Space' || e.code === 'Enter' || e.code === 'KeyE')) {
        e.preventDefault();
        this.strikeResonance();
      } else if (!this.cutsceneEl?.classList.contains('hidden') && (e.code === 'Space' || e.code === 'Enter' || e.code === 'KeyE')) {
        e.preventDefault();
        this.advanceCutscene();
      }
    };
    window.addEventListener('keydown', this._key);
    this._resize = () => this.applyTouchVisibility();
    window.addEventListener('resize', this._resize);
    this.bindCreation();
  }

  bindCreation() {
    const screen = $('creation-screen');
    if (!screen) return;

    screen.querySelectorAll('[data-ctab]').forEach(tab => {
      tab.addEventListener('click', () => this.setCreationTab(tab.dataset.ctab));
    });

    screen.querySelectorAll('[data-opt]').forEach(wrap => {
      wrap.addEventListener('click', (e) => {
        const btn = e.target.closest('button[data-value]');
        if (!btn) return;
        this.selectCreationOption(wrap.dataset.opt, btn.dataset.value, btn);
        this.audio?.sfx('select');
      });
    });

    $('input-name')?.addEventListener('input', (e) => {
      if (!this.creation) return;
      const clean = String(e.target.value || '').trimStart().slice(0, 16);
      this.creation.name = clean;
      this.drawCreationPreview(performance.now() / 1000);
    });
    $('input-name')?.addEventListener('blur', (e) => {
      if (!this.creation) return;
      if (!String(e.target.value || '').trim()) {
        this.creation.name = 'Aurel';
        e.target.value = 'Aurel';
      }
    });

    $('btn-creation-back')?.addEventListener('click', () => {
      this.creation = null;
      cancelAnimationFrame(this.creationRAF);
      this.creationRAF = null;
      screen.classList.add('hidden');
      $('title-screen')?.classList.remove('hidden');
      this.audio?.sfx('menu');
    });

    $('btn-begin')?.addEventListener('click', () => {
      if (!this.creation || this.creation.points > 0) return;
      const profile = this.buildProfile();
      this.creation = null;
      cancelAnimationFrame(this.creationRAF);
      this.creationRAF = null;
      screen.classList.add('hidden');
      this.onNewGame(profile);
    });
  }

  setCreationTab(tab) {
    const names = { look: '01 · ASPECTO', stats: '02 · ATRIBUTOS', gear: '03 · EQUIPO' };
    const index = ['look', 'stats', 'gear'].indexOf(tab);
    document.querySelectorAll('.ctab').forEach(t => t.classList.toggle('active', t.dataset.ctab === tab));
    ['look', 'stats', 'gear'].forEach(id => $('ctab-' + id)?.classList.toggle('hidden', id !== tab));
    const label = $('creation-step-label');
    if (label) label.textContent = names[tab] || names.look;
    document.querySelectorAll('.creation-dots i').forEach((dot, i) => dot.classList.toggle('active', i === index));
    if (tab === 'stats') this.renderStatAlloc();
    if (tab === 'gear') this.renderGearCards();
    this.audio?.sfx('select');
  }

  syncCreationControls() {
    const c = this.creation;
    if (!c) return;
    document.querySelectorAll('[data-opt]').forEach(wrap => {
      const group = wrap.dataset.opt;
      const value = String(group === 'hairColor' ? c.hairColor : c[group]);
      wrap.querySelectorAll('button[data-value]').forEach(btn => {
        btn.classList.toggle('sel', String(btn.dataset.value) === value);
      });
    });
  }

  refresh() {
    this.refreshHud();
    this.lastMinimap = 0;
  }

  setGame(game) {
    this.game = game;
    this.applyTouchVisibility();
    this.refreshHud();
  }

  showHud() { $('hud')?.classList.remove('hidden'); this.applyTouchVisibility(); }
  hideHud() { $('hud')?.classList.add('hidden'); }

  applyTouchVisibility() {
    const el = $('touch-controls');
    if (!el) return;
    const coarse = window.matchMedia?.('(pointer:coarse)')?.matches;
    const mode = this.settings.touchControls || 'auto';
    const show = mode === 'on' || (mode === 'auto' && (coarse || window.innerWidth <= 1020));
    el.classList.toggle('hidden', !show);
  }

  isBlocking() {
    return !$('overlay')?.classList.contains('hidden')
      || !$('dialogue')?.classList.contains('hidden')
      || !$('resonance')?.classList.contains('hidden')
      || !$('cutscene')?.classList.contains('hidden');
  }

  /* ------------------------------------------------------------------ */
  /*  HUD                                                                */
  /* ------------------------------------------------------------------ */

  refreshHud() {
    const g = this.game;
    if (!g || !g.player || !g.region) return;
    const p = g.player;
    $('hud-name').textContent = p.name;
    $('hud-level').textContent = p.level;
    $('hud-region').textContent = g.region?.name || '';
    const gold = $('hud-gold');
    if (gold) gold.textContent = `◈ ${p.gold}`;
    const hpPct = clamp(p.hp / p.maxHp * 100, 0, 100);
    const mpPct = clamp(p.mp / p.maxMp * 100, 0, 100);
    const spPct = clamp(p.stamina / p.maxStam * 100, 0, 100);
    $('bar-hp').style.width = hpPct + '%';
    $('bar-mp').style.width = mpPct + '%';
    $('bar-sp').style.width = spPct + '%';
    $('hp-text').textContent = `${Math.max(0, Math.ceil(p.hp))} / ${Math.round(p.maxHp)}`;
    $('mp-text').textContent = `${Math.max(0, Math.ceil(p.mp))} / ${Math.round(p.maxMp)}`;
    $('sp-text').textContent = `${Math.max(0, Math.ceil(p.stamina))}`;
    this.drawHudPortrait();

    // Misión activa
    let activeId = null;
    for (const [id, st] of Object.entries(g.quests)) {
      if (st.status === 'active' && QUESTS[id]?.type === 'main') { activeId = id; break; }
    }
    if (!activeId) {
      for (const [id, st] of Object.entries(g.quests)) {
        if (st.status === 'active') { activeId = id; break; }
      }
    }
    if (activeId) {
      const q = QUESTS[activeId];
      const st = g.quests[activeId];
      const step = q.steps[st.step];
      $('quest-tracker').classList.remove('hidden');
      $('quest-kicker').textContent = q.type === 'main' ? 'MISIÓN PRINCIPAL' : 'MISIÓN SECUNDARIA';
      $('quest-title').textContent = q.title;
      const count = step?.count ? ` · ${Math.min(st.count, step.count)}/${step.count}` : '';
      $('quest-objective').textContent = (step?.text || 'Sigue adelante') + count;
    } else if (!g.quests.m1) {
      $('quest-tracker').classList.remove('hidden');
      $('quest-kicker').textContent = 'PRÓLOGO';
      $('quest-title').textContent = 'El primer latido';
      $('quest-objective').textContent = 'Habla con Nara en la plaza de Lumen';
    } else {
      $('quest-tracker').classList.remove('hidden');
      $('quest-kicker').textContent = 'DIARIO';
      $('quest-title').textContent = 'La canción continúa';
      $('quest-objective').textContent = 'Explora, vincula criaturas y escucha al mundo';
    }

    // Criatura activa
    const c = p.activeCreatureData;
    if (c) {
      $('creature-party')?.classList.remove('hidden');
      $('party-name').textContent = `${c.name} · ${CREATURES[p.activeCreature]?.title || ''}`;
      $('party-hp-fill').style.width = '100%';
      $('companion-name').textContent = c.name;
      const icon = $('party-icon');
      if (icon) {
        const ctx = icon.getContext('2d');
        ctx.clearRect(0, 0, icon.width, icon.height);
        drawCreature(ctx, p.activeCreature, 32, 46, .82, performance.now() / 1000, { seed: 2 });
      }
      const ci = $('companion-icon');
      if (ci) ci.style.background = `radial-gradient(circle at 40% 35%, ${c.palette[0]}, ${c.palette[1]} 75%)`;
    } else {
      $('creature-party')?.classList.add('hidden');
      $('companion-name').textContent = 'Sin criatura';
      const ci = $('companion-icon');
      if (ci) ci.style.background = '';
    }

    // Enfriamientos
    this.updateCooldown('attack', p.attackState ? .15 : p.attackCooldown, .4);
    for (const k of ['ability1', 'ability2', 'ability3', 'companion']) {
      const max = k === 'ability1' ? 5.5 : k === 'ability2' ? 10 : k === 'ability3' ? 8 : (c?.cooldown || 20);
      this.updateCooldown(k, p.cooldowns[k], max);
    }

    this.updateBossBar();
    this.updateMinimap();
  }

  updateCooldown(action, value, max) {
    const el = document.getElementById('cd-' + action);
    if (!el) return;
    const btn = el.closest('.ability');
    if (value > .12) {
      btn?.classList.add('cooling');
      el.textContent = value >= 1 ? Math.ceil(value) : value.toFixed(1);
    } else {
      btn?.classList.remove('cooling');
      el.textContent = '';
    }
  }

  drawHudPortrait() {
    const g = this.game;
    if (!g) return;
    const key = JSON.stringify(g.player.look) + g.player.level;
    if (key === this.lastPortraitKey) return;
    this.lastPortraitKey = key;
    const canvas = $('hud-portrait');
    if (canvas) drawPortrait(canvas, 'hero', g.player.look, performance.now() / 1000);
  }

  setBoss(enemy) {
    this.boss = enemy;
    const bar = $('boss-bar');
    if (!enemy) {
      if (bar) setTimeout(() => { if (!this.boss) bar.classList.add('hidden'); }, 900);
      return;
    }
    bar?.classList.remove('hidden');
    $('boss-name').textContent = enemy.name.toUpperCase();
    $('boss-sub').textContent = enemy.data?.title || 'Guardián del Velo';
    this.updateBossBar(true);
  }

  updateBossBar(force = false) {
    const bar = $('boss-bar');
    if (!bar) return;
    if (!this.boss || this.boss.dead) { bar.classList.add('hidden'); return; }
    bar.classList.remove('hidden');
    const pct = clamp(this.boss.hp / this.boss.maxHp * 100, 0, 100);
    $('bar-boss').style.width = pct + '%';
    const lag = $('bar-boss-lag');
    if (lag) lag.style.transform = `scaleX(${pct / 100})`;
  }

  bossIntro(def) {
    this.showZone(def.title, def.sub || '');
    this.audio?.sfx('roar');
  }

  showZone(name, subtitle) {
    const el = $('zone-banner');
    if (!el) return;
    el.classList.remove('hidden');
    $('zone-name').textContent = name;
    $('zone-sub').textContent = subtitle || '';
    $('minimap-label').textContent = name;
    el.style.animation = 'none';
    void el.offsetWidth;
    el.style.animation = '';
    clearTimeout(this.zoneTimer);
    this.zoneTimer = setTimeout(() => el.classList.add('hidden'), 4200);
  }

  setInteraction(kind, text) {
    const inter = $('interaction');
    const res = $('resonate-prompt');
    if (!kind) {
      inter?.classList.add('hidden');
      res?.classList.add('hidden');
      return;
    }
    if (kind === 'resonate') {
      inter?.classList.add('hidden');
      res?.classList.remove('hidden');
      const span = res?.querySelector('span');
      if (span) span.textContent = text || 'Resonar con la criatura';
    } else {
      res?.classList.add('hidden');
      inter?.classList.remove('hidden');
      $('interaction-text').textContent = text || 'Interactuar';
    }
  }

  toast(text, type = '') {
    const stack = $('toast-stack');
    if (!stack) return;
    const el = document.createElement('div');
    el.className = 'toast ' + type;
    el.textContent = text;
    stack.appendChild(el);
    while (stack.children.length > 4) stack.removeChild(stack.firstChild);
    setTimeout(() => { el.style.opacity = '0'; el.style.transition = 'opacity .3s'; setTimeout(() => el.remove(), 320); }, 2900);
  }

  tick(dt) { this.updateBossBar(); }

  /* ------------------------------------------------------------------ */
  /*  Minimapa                                                           */
  /* ------------------------------------------------------------------ */

  updateMinimap() {
    const g = this.game;
    if (!g || !g.region || !g.player) return;
    const now = performance.now();
    if (now - this.lastMinimap < 140) return;
    this.lastMinimap = now;
    const canvas = $('minimap');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width, h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    const region = g.region;
    const scale = Math.min(w / region.tileW, h / region.tileH);
    const ox = (w - region.tileW * scale) / 2;
    const oy = (h - region.tileH * scale) / 2;
    const colors = {
      0: '#4a7048', 1: '#8b7655', 2: '#77746a', 3: '#2d5f74', 4: '#a33b22',
      5: '#4b3c36', 6: '#a9a68f', 7: '#34352f', 8: '#080b14', 9: '#69553d', 10: '#395e40'
    };
    for (let y = 0; y < region.tileH; y++) {
      for (let x = 0; x < region.tileW; x++) {
        const t = region.tiles[y * region.tileW + x];
        ctx.fillStyle = colors[t] || '#444';
        ctx.fillRect(ox + x * scale, oy + y * scale, Math.ceil(scale), Math.ceil(scale));
      }
    }
    // niebla suave
    const grd = ctx.createRadialGradient(w / 2, h / 2, w * .2, w / 2, h / 2, w * .55);
    grd.addColorStop(0, 'rgba(6,10,18,0)');
    grd.addColorStop(1, 'rgba(6,10,18,.55)');
    ctx.fillStyle = grd; ctx.fillRect(0, 0, w, h);
    const tx = (x) => ox + x / TILE * scale;
    const ty = (y) => oy + y / TILE * scale;
    for (const s of g.shrines) {
      if (!s.discovered) continue;
      ctx.fillStyle = '#ffe6a0';
      ctx.beginPath(); ctx.arc(tx(s.x), ty(s.y), 2.4, 0, 6.3); ctx.fill();
    }
    for (const n of g.npcs) {
      if (n.hidden) continue;
      ctx.fillStyle = n.marker ? '#ffe08a' : 'rgba(230,220,200,.55)';
      ctx.beginPath(); ctx.arc(tx(n.x), ty(n.y), n.marker ? 2.5 : 1.5, 0, 6.3); ctx.fill();
    }
    for (const e of g.enemies) {
      if (e.dead || dist(e.x, e.y, g.player.x, g.player.y) > 760) continue;
      ctx.fillStyle = e.boss ? '#ff8a5e' : 'rgba(255,100,90,.75)';
      ctx.beginPath(); ctx.arc(tx(e.x), ty(e.y), e.boss ? 3.5 : 1.6, 0, 6.3); ctx.fill();
    }
    // jugador
    const px = tx(g.player.x), py = ty(g.player.y);
    ctx.save(); ctx.translate(px, py); ctx.rotate(g.player.aimAngle + Math.PI / 2);
    ctx.fillStyle = '#ffffff';
    ctx.beginPath(); ctx.moveTo(0, -6); ctx.lineTo(4.5, 5); ctx.lineTo(0, 2.5); ctx.lineTo(-4.5, 5); ctx.closePath(); ctx.fill();
    ctx.restore();
    ctx.strokeStyle = 'rgba(255,230,170,.8)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(px, py, 7, 0, 6.3); ctx.stroke();
  }

  /* ------------------------------------------------------------------ */
  /*  Diálogo                                                            */
  /* ------------------------------------------------------------------ */

  startDialogue(npcId, dialogue, onClose = null) {
    const nodes = dialogue?.start || dialogue?.repeat || [];
    this.dlg = {
      npcId, stack: [{ nodes, index: 0 }], onClose,
      hidden: false, current: null, typing: false, fullText: '', typeTimer: null,
      lastSpeaker: npcId, choices: false, hidePortrait: false
    };
    $('dialogue')?.classList.remove('hidden');
    this.setInteraction?.(null, '');
    this.renderDialogueNext();
  }

  startNarration(title, text) {
    const nodes = [{ speaker: title, role: 'Registro del mundo', portrait: 'hero', text }];
    this.dlg = {
      npcId: 'hero', stack: [{ nodes, index: 0 }], onClose: null,
      hidden: false, current: null, typing: false, fullText: '', typeTimer: null,
      lastSpeaker: 'hero', choices: false, hidePortrait: true
    };
    $('dialogue')?.classList.remove('hidden');
    const portrait = $('dialogue-portrait');
    if (portrait) { const ctx = portrait.getContext('2d'); ctx.clearRect(0, 0, portrait.width, portrait.height); portrait.style.visibility = 'hidden'; }
    this.renderDialogueNext();
  }

  renderDialogueNext() {
    const d = this.dlg;
    if (!d) return;
    let guard = 0;
    while (guard++ < 40) {
      if (!d.stack.length) { this.closeDialogue(); return; }
      const frame = d.stack[d.stack.length - 1];
      if (frame.index >= frame.nodes.length) {
        d.stack.pop();
        continue;
      }
      const node = frame.nodes[frame.index++];
      if (!node) continue;
      if (node.choices) {
        d.current = node;
        d.choices = true;
        d.typing = false;
        $('dialogue-next').classList.add('hidden');
        this.renderChoices(node.choices);
        return;
      }
      if (node.text) {
        d.current = node;
        d.choices = false;
        $('dialogue-choices').innerHTML = '';
        $('dialogue-next').classList.remove('hidden');
        this.showDialogueLine(node);
        return;
      }
      if (node.action) {
        this.performAction(node.action);
        if (this.dlg !== d) return;
        if (node.next?.length) d.stack.push({ nodes: node.next, index: 0 });
        continue;
      }
      if (node.next?.length) d.stack.push({ nodes: node.next, index: 0 });
    }
  }

  showDialogueLine(node) {
    const d = this.dlg;
    if (!d) return;
    d.fullText = node.text || '';
    d.typing = true;
    d.lastSpeaker = node.portrait || d.lastSpeaker;
    $('dialogue-name').textContent = node.speaker || NPCS[node.portrait]?.name || 'Narrador';
    $('dialogue-role').textContent = node.role || NPCS[node.portrait]?.role || '';
    const portrait = $('dialogue-portrait');
    if (d.hidePortrait) {
      if (portrait) portrait.style.visibility = 'hidden';
    } else {
      if (portrait) {
        portrait.style.visibility = 'visible';
        const who = node.portrait === 'hero' || node.portrait === 'player' ? 'hero' : node.portrait;
        drawPortrait(portrait, who || 'nara', this.game?.player?.look, performance.now() / 1000);
      }
    }
    const textEl = $('dialogue-text');
    textEl.textContent = '';
    let i = 0;
    clearInterval(d.typeTimer);
    this.audio?.sfx('dialogue');
    d.typeTimer = setInterval(() => {
      if (!this.dlg || this.dlg !== d) { clearInterval(d.typeTimer); return; }
      if (i >= d.fullText.length) {
        clearInterval(d.typeTimer);
        d.typing = false;
        textEl.textContent = d.fullText;
        return;
      }
      i = Math.min(d.fullText.length, i + 2);
      textEl.textContent = d.fullText.slice(0, i);
      if (i % 12 === 0) this.audio?.sfx('dialogue');
    }, 17);
  }

  renderChoices(choices) {
    const wrap = $('dialogue-choices');
    if (!wrap) return;
    wrap.innerHTML = '';
    choices.forEach((c, i) => {
      const b = document.createElement('button');
      b.textContent = `${i + 1}. ${c.text}`;
      b.addEventListener('click', (e) => { e.stopPropagation(); this.chooseDialogue(c); });
      wrap.appendChild(b);
    });
    $('dialogue-next').classList.add('hidden');
  }

  chooseDialogue(choice) {
    const d = this.dlg;
    if (!d) return;
    d.choices = false;
    $('dialogue-choices').innerHTML = '';
    if (choice.action) {
      this.performAction(choice.action);
      if (this.dlg !== d) return;
    }
    if (choice.next?.length) d.stack.push({ nodes: choice.next, index: 0 });
    this.renderDialogueNext();
  }

  advanceDialogue() {
    const d = this.dlg;
    if (!d || d.choices) return;
    if (d.typing) {
      d.typing = false;
      clearInterval(d.typeTimer);
      $('dialogue-text').textContent = d.fullText;
      return;
    }
    const node = d.current;
    if (node?.action) {
      this.performAction(node.action);
      if (this.dlg !== d) return;
    }
    if (node?.next?.length) d.stack.push({ nodes: node.next, index: 0 });
    this.renderDialogueNext();
  }

  closeDialogue(silent = false) {
    const d = this.dlg;
    if (!d) return;
    clearInterval(d.typeTimer);
    this.dlg = null;
    $('dialogue')?.classList.add('hidden');
    $('dialogue-choices').innerHTML = '';
    $('dialogue-next').classList.remove('hidden');
    const portrait = $('dialogue-portrait');
    if (portrait) portrait.style.visibility = 'visible';
    const cb = d.onClose;
    if (!silent && cb) cb();
    this.clearTransientInput();
  }

  /* ------------------------------------------------------------------ */
  /*  Acciones de historia                                               */
  /* ------------------------------------------------------------------ */

  performAction(action) {
    if (!action || !this.game) return;
    const [kind, ...parts] = action.split(':');
    const g = this.game;
    switch (kind) {
      case 'startQuest': g.startQuest(parts[0]); break;
      case 'advance': g.advanceQuest(parts[0]); break;
      case 'completeQuest': g.completeQuest(parts[0]); break;
      case 'setFlag': {
        const [name, value] = parts;
        g.flags[name] = value ?? true;
        break;
      }
      case 'travel': {
        const region = parts[0], spawn = parts[1];
        this.closeDialogue(true);
        this.closeAll(true);
        g.travel(region, spawn);
        return;
      }
      case 'shop': {
        const vendor = parts[0];
        this.closeDialogue();
        this.openShop(vendor);
        return;
      }
      case 'buy': {
        const [id, price] = parts;
        this.buyItem(id, Number(price));
        break;
      }
      case 'giveItem': {
        const id = parts[0], qty = Number(parts[1] || 1);
        g.player.addItem(id, qty);
        this.toast(`Objeto obtenido · ${ITEMS[id]?.name || id}`, 'gold');
        break;
      }
      case 'gold': {
        const amount = Number(parts[0] || 0);
        g.player.gold = Math.max(0, g.player.gold + amount);
        this.toast(`${amount >= 0 ? '+' : ''}${amount} oro`, 'gold');
        break;
      }
      case 'creature': {
        g.player.addCreature(parts[0], g);
        this.toast(`Criatura vinculada · ${CREATURES[parts[0]]?.name || parts[0]}`, 'creature');
        break;
      }
      case 'cutscene': {
        const slides = CUTSCENES[parts[0]] || [];
        this.closeDialogue(true);
        this.closeAll(true);
        this.playCutscene(slides);
        return;
      }
      case 'ending': {
        this.closeDialogue(true);
        this.closeAll(true);
        g.showFinale();
        return;
      }
      case 'close': {
        this.closeDialogue();
        return;
      }
      default: break;
    }
    this.refreshHud();
  }

  /* ------------------------------------------------------------------ */
  /*  Menú superpuesto                                                   */
  /* ------------------------------------------------------------------ */

  openMenu(tab = 'main') {
    if (!this.game) return;
    this.overlayMode = 'menu';
    this.standaloneSettings = false;
    $('overlay-close')?.classList.remove('hidden');
    this.currentTab = tab;
    $('overlay')?.classList.remove('hidden');
    this.renderTabs(tab);
    this.renderOverlay();
    this.audio?.sfx('menu');
    this.clearTransientInput();
  }

  openTab(tab) {
    this.currentTab = tab;
    this.renderTabs(tab);
    this.renderOverlay();
    this.audio?.sfx('select');
  }

  renderTabs(active) {
    const tabs = $('overlay-tabs');
    if (!tabs) return;
    tabs.innerHTML = TABS.map(t => `<button class="otab ${t.id === active ? 'active' : ''}" data-tab="${t.id}">${t.label.toUpperCase()}</button>`).join('');
    tabs.classList.remove('hidden');
  }

  renderOverlay() {
    if (!this.game) return;
    const titles = {
      main: ['MENÚ DE VIAJE', 'La Espada Celestial'],
      quests: ['DIARIO', 'Misiones'],
      equip: ['EQUIPO', 'Armadura y filo'],
      inventory: ['MOCHILA', 'Inventario'],
      creatures: ['RESONANCIA', 'Criaturas vinculadas'],
      map: ['CARTOGRAFÍA', 'Mapa del mundo'],
      save: ['ARCHIVO', 'Guardar y cargar'],
      settings: ['AJUSTES', 'Sensibilidad y rendimiento'],
    };
    const [eyebrow, title] = titles[this.currentTab] || titles.main;
    $('overlay-eyebrow').textContent = eyebrow;
    $('overlay-title').textContent = title;
    const body = $('overlay-body');
    if (!body) return;
    body.innerHTML = this.renderTabBody(this.currentTab);
    $('overlay-foot').innerHTML = `<span>${esc(this.game.player.name)} · Nivel ${this.game.player.level} · ${esc(this.game.region.name)}</span><span>◈ ${this.game.player.gold} ORO</span>`;
    this.afterRenderTab(this.currentTab);
  }

  renderTabBody(tab) {
    switch (tab) {
      case 'main': return this.renderMainMenu();
      case 'quests': return this.renderQuests();
      case 'equip': return this.renderEquip();
      case 'inventory': return this.renderInventory();
      case 'creatures': return this.renderCreatures();
      case 'map': return this.renderMap();
      case 'save': return this.renderSave();
      case 'settings': return this.renderSettings();
      default: return this.renderQuests();
    }
  }

  renderMainMenu() {
    const p = this.game.player;
    const active = Object.keys(this.game.quests).filter(id => this.game.quests[id].status === 'active').length;
    return `
      <div class="menu-grid">
        <div class="menu-list">
          ${TABS.map(t => `<button data-tab="${t.id}"><span class="mi">◆</span>${t.label}</button>`).join('')}
        </div>
        <div class="menu-detail">
          <div class="panel-card">
            <h3>${esc(p.name)}</h3>
            <div class="sub">PORTADOR DE LA RESONANCIA · NIVEL ${p.level}</div>
            <p>${active} misiones activas · ${p.tamed} criaturas vinculadas · ${p.kills} enemigos derrotados.</p>
          </div>
          <div class="section-title">ESTADO</div>
          <div class="stat-grid">
            <div class="stat-line"><span>Vida</span><b>${Math.ceil(p.hp)} / ${Math.round(p.maxHp)}</b></div>
            <div class="stat-line"><span>Maná</span><b>${Math.ceil(p.mp)} / ${Math.round(p.maxMp)}</b></div>
            <div class="stat-line"><span>Ataque</span><b>${Math.round(p.stats.atk)}</b></div>
            <div class="stat-line"><span>Defensa</span><b>${Math.round(p.stats.defense)}</b></div>
            <div class="stat-line"><span>Crítico</span><b>${Math.round(p.stats.crit)}%</b></div>
            <div class="stat-line"><span>Tiempo de juego</span><b>${formatPlayTime(this.game.playTime)}</b></div>
          </div>
          <div class="section-title">ATAJOS</div>
          <div class="menu-list">
            <button data-tab="save"><span class="mi">◈</span>Guardar partida</button>
            <button data-action="return-title"><span class="mi">↩</span>Volver al título</button>
            <button data-action="close-menu"><span class="mi">✕</span>Continuar jugando</button>
          </div>
        </div>
      </div>`;
  }

  renderQuests() {
    const g = this.game;
    const ids = Object.keys(g.quests).filter(id => QUESTS[id]);
    ids.sort((a, b) => {
      const aa = g.quests[a].status === 'active' ? 0 : 1;
      const bb = g.quests[b].status === 'active' ? 0 : 1;
      if (aa !== bb) return aa - bb;
      return (QUESTS[a].type === 'main' ? 0 : 1) - (QUESTS[b].type === 'main' ? 0 : 1);
    });
    if (!ids.length) {
      return `<div class="empty-note">Ninguna misión registrada todavía.<br>La aventura empieza cuando hables con Nara, en la plaza de la Aldea de Lumen.</div>`;
    }
    const rows = ids.map(id => {
      const q = QUESTS[id], st = g.quests[id];
      const step = q.steps[st.step];
      const done = st.status === 'done';
      const count = step?.count ? ` (${Math.min(st.count, step.count)}/${step.count})` : '';
      return `<div class="quest-item ${q.type === 'main' ? 'main' : ''} ${done ? 'done' : ''}">
        <h4>${esc(q.title)}</h4>
        <div class="qmeta">${q.type === 'main' ? 'MISIÓN PRINCIPAL' : 'MISIÓN SECUNDARIA'} · ${done ? 'COMPLETADA' : 'EN CURSO'}</div>
        <p class="qobj">${done ? esc(step?.text || q.summary) : esc((step?.text || q.summary) + count)}</p>
        ${done ? `<span class="done-mark">✦ RECOMPENSA RECIBIDA</span>` : ''}
      </div>`;
    }).join('');
    const active = ids.filter(id => g.quests[id].status === 'active');
    return `<div class="section-title">EN CURSO · ${active.length}</div>
      <div class="quest-list">${rows}</div>`;
  }

  renderEquip() {
    const p = this.game.player;
    const slots = EQUIP_SLOTS.map(slot => {
      const id = p.equipment[slot.id];
      const item = ITEMS[id];
      return `<button class="equip-slot ${this.equipSlot === slot.id ? 'active' : ''}" data-equip-slot="${slot.id}">
        <span class="es-icon">${slot.icon}</span>
        <span class="es-name">${esc(item?.name || '— ' + slot.label + ' —')}</span>
        <span class="es-stat">${item ? esc(statLine(item)) : ''}</span>
      </button>`;
    }).join('');
    const candidates = Object.entries(p.inventory).filter(([id, qty]) => qty > 0 && ITEMS[id]?.slot === this.equipSlot);
    const inv = candidates.length ? candidates.map(([id, qty]) => {
      const it = ITEMS[id];
      return `<button class="inv-item rarity-${it.rarity}" data-equip="${id}">
        <span class="ii-name">${esc(it.name)} ${p.equipment[it.slot] === id ? '· EQUIPADO' : ''}</span>
        <span class="ii-meta">${esc(statLine(it))}</span>
        <span class="ii-qty">×${qty}</span>
      </button>`;
    }).join('') : `<div class="empty-note">No hay objetos de este tipo en la mochila.</div>`;
    const attrs = Object.entries(p.attributes).map(([k, v]) => {
      const def = STAT_DEFS.find(d => d.id === k);
      return `<div class="stat-line"><span>${def?.name || k}</span><b>${v}</b></div>`;
    }).join('');
    const weapon = p.weaponItem;
    return `<div class="equip-layout">
      <div>
        <div class="section-title">EQUIPO ACTUAL</div>
        <div class="equip-slots">${slots}</div>
        <div style="display:flex;gap:8px;margin-top:8px">
          <button class="btn-ghost" style="flex:1;padding:9px" data-unequip="${this.equipSlot}">DESEQUIPAR ${SLOT_LABELS[this.equipSlot].toUpperCase()}</button>
        </div>
        <div class="section-title">APARIENCIA</div>
        <div class="panel-card"><p>Tu arma actual es <b>${esc(weapon?.name || 'ninguna')}</b>. La armadura, el casco, la capa y los accesorios cambian tu silueta y tus estadísticas. Todo lo que llevas se ve en el mundo.</p></div>
        <div class="section-title">ATRIBUTOS</div>
        <div class="stat-grid">${attrs}</div>
        ${p.statPoints ? `<div class="section-title">PUNTOS SIN REPARTIR · ${p.statPoints}</div>${STAT_DEFS.map(d => `<button class="inv-item" data-allocate="${d.id}"><span class="ii-name">${d.icon} ${d.name}</span><span class="ii-meta">${d.desc}</span><span class="ii-qty">+1 punto</span></button>`).join('')}` : ''}
      </div>
      <div>
        <div class="section-title">${SLOT_LABELS[this.equipSlot].toUpperCase()} EN LA MOCHILA</div>
        <div class="inv-grid">${inv}</div>
        <div class="section-title">ESTADÍSTICAS DERIVADAS</div>
        <div class="stat-grid">
          <div class="stat-line"><span>Ataque</span><b>${Math.round(p.stats.atk)}</b></div>
          <div class="stat-line"><span>Defensa</span><b>${Math.round(p.stats.defense)}</b></div>
          <div class="stat-line"><span>Vida</span><b>${Math.round(p.maxHp)}</b></div>
          <div class="stat-line"><span>Maná</span><b>${Math.round(p.maxMp)}</b></div>
          <div class="stat-line"><span>Resistencia</span><b>${Math.round(p.maxStam)}</b></div>
          <div class="stat-line"><span>Velocidad</span><b>${Math.round(p.stats.moveSpeed)}</b></div>
          <div class="stat-line"><span>Crítico</span><b>${Math.round(p.stats.crit)}%</b></div>
          <div class="stat-line"><span>Poder arcano</span><b>${Math.round(p.stats.spellPower)}</b></div>
        </div>
        <div class="section-title">PASIVA DE CRIATURA</div>
        <div class="panel-card"><p>${p.activeCreatureData ? esc(p.activeCreatureData.passive) : 'Ninguna criatura vinculada. Explora y usa la resonancia cuando un enemigo esté debilitado.'}</p></div>
      </div>
    </div>`;
  }

  renderInventory() {
    const p = this.game.player;
    const groups = {};
    for (const [id, qty] of Object.entries(p.inventory)) {
      if (!qty) continue;
      const it = ITEMS[id];
      if (!it) continue;
      (groups[it.type] ||= []).push([id, qty]);
    }
    const order = ['consumable', 'weapon', 'armor', 'helm', 'accessory', 'cloak', 'material', 'key'];
    const sections = order.filter(t => groups[t]).map(type => {
      const rows = groups[type].sort((a, b) => a[0].localeCompare(b[0])).map(([id, qty]) => {
        const it = ITEMS[id];
        const meta = it.slot ? statLine(it) : it.type === 'consumable' ? (it.desc) : it.desc;
        const btn = it.type === 'consumable'
          ? `<span class="ii-qty">USAR</span>`
          : it.slot ? `<span class="ii-qty">EQUIPAR</span>` : `<span class="ii-qty">×${qty}</span>`;
        return `<button class="inv-item rarity-${it.rarity}" data-inv-action="${id}">
          <span class="ii-name">${esc(it.name)}${it.type === 'consumable' ? ` ×${qty}` : ''}</span>
          <span class="ii-meta">${esc(meta || '')}</span>
          ${it.type === 'consumable' ? `<span class="ii-qty">${qty} · USAR</span>` : btn}
        </button>`;
      }).join('');
      return `<div class="section-title">${TYPE_LABELS[type] || type}</div><div class="inv-grid">${rows}</div>`;
    }).join('');
    return sections || `<div class="empty-note">Tu mochila está vacía. Los cofres y las criaturas del mundo contienen objetos.</div>`;
  }

  renderCreatures() {
    const p = this.game.player;
    const cards = CREATURE_ORDER.map(id => {
      const c = CREATURES[id];
      const owned = p.creatures[id];
      const active = p.activeCreature === id;
      return `<button class="creature-card ${owned ? '' : 'locked'} ${active ? 'active' : ''}" ${owned ? `data-setcreature="${id}"` : ''}>
        <canvas class="cc-canvas" data-creature="${id}" width="170" height="74"></canvas>
        <b>${owned ? esc(c.name) : '???'}</b>
        <div class="cc-type">${esc(c.type.toUpperCase())} · ${esc(c.rarity.toUpperCase())} · ${esc(c.region)}</div>
        <p>${owned ? esc(c.desc) : 'Aún no has escuchado su nota. Debilita a una criatura y usa la resonancia.'}</p>
        <div class="cc-passive">${owned ? esc(c.passive) : '—'}</div>
        ${owned ? `<div class="cc-passive">Nv. ${owned.level} · Vínculo ${owned.bond || 1}% · ${active ? 'ACTIVA' : 'PULSA PARA ACTIVAR'}</div>` : ''}
      </button>`;
    }).join('');
    return `<div class="panel-card"><h3>${p.tamed} / ${CREATURE_ORDER.length}</h3><div class="sub">CRIATURAS VINCULADAS</div><p>Las criaturas activas luchan a tu lado, otorgan una pasiva medible y pueden desatar una habilidad propia. Su vínculo crece al volver a resonar con su especie.</p></div>
      <div class="creature-grid">${cards}</div>`;
  }

  renderMap() {
    const g = this.game;
    const shrines = this.allDiscoveredShrines();
    const rows = shrines.length ? shrines.map(s => `<button class="slot-btn" data-shrine-travel="${s.region}:${s.id}">
      <span><b>${esc(s.name)}</b><span>${esc(REGION_NAMES[s.region] || s.region)}</span></span><em>VIAJAR</em>
    </button>`).join('') : `<div class="empty-note">Descubre santuarios para desbloquear viaje rápido.</div>`;
    return `<div class="map-wrap">
      <div><canvas id="worldmap-canvas" width="640" height="450"></canvas></div>
      <div>
        <div class="section-title">LEYENDA</div>
        <div class="map-legend">
          <div><i style="background:#fff"></i>Tú</div>
          <div><i style="background:#ffe6a0"></i>Santuario descubierto</div>
          <div><i style="background:#ff8a5e"></i>Peligro / jefe</div>
          <div><i style="background:#8fb0ff"></i>Objetivo de misión</div>
        </div>
        <div class="section-title">VIAJE RÁPIDO</div>
        <div class="slot-list">${rows}</div>
      </div>
    </div>`;
  }

  allDiscoveredShrines() {
    const out = [];
    const g = this.game;
    for (const [regionId, st] of Object.entries(g.regionState)) {
      for (const [id, discovered] of Object.entries(st.shrines || {})) {
        if (!discovered) continue;
        const s = getRegion(regionId).shrines.find(x => x.id === id);
        if (s) out.push({ ...s, region: regionId });
      }
    }
    return out;
  }

  renderSave() {
    const saves = listSaves();
    const byId = Object.fromEntries(saves.map(s => [s.id, s.data]));
    const rows = ['auto', '1', '2', '3'].map(slot => {
      const data = byId[slot];
      const name = slot === 'auto' ? 'Guardado automático' : `Ranura ${slot}`;
      const meta = data ? `${data.player?.name || 'Aurel'} · Nv. ${data.player?.level || 1} · ${REGION_NAMES[data.regionId] || data.regionId} · ${formatPlayTime(data.playTime)} · ${formatDate(data.savedAt)}` : 'Vacía';
      return `<div class="slot-btn" style="cursor:default">
        <span><b>${name}</b><span>${esc(meta)}</span></span>
        <span style="display:flex;gap:7px;align-items:center">
          ${slot === 'auto' ? '<em>AUTO</em>' : `<button class="buy-btn" data-save-slot="${slot}">GUARDAR</button>`}
          ${data ? `<button class="buy-btn" data-load-slot="${slot}">CARGAR</button>` : ''}
          ${data && slot !== 'auto' ? `<button class="buy-btn" data-delete-slot="${slot}" style="border-color:rgba(255,100,100,.4);color:#ffb0b0">BORRAR</button>` : ''}
        </span>
      </div>`;
    }).join('');
    return `<div class="panel-card"><h3>Partida actual</h3><div class="sub">${esc(this.game.player.name)} · NIVEL ${this.game.player.level}</div><p>El juego guarda automáticamente cada 45 segundos y al viajar entre regiones. Puedes guardar en tres ranuras manuales.</p></div>
      <div class="section-title">RANURAS</div><div class="slot-list">${rows}</div>`;
  }

  renderSettings() {
    const s = this.settings;
    const toggle = (id, label, desc, on) => `<div class="setting-row"><div class="sl">${label}<small>${desc}</small></div><button class="toggle ${on ? 'on' : ''}" data-setting-toggle="${id}" aria-label="${label}"></button></div>`;
    return `<div class="settings-list">
      ${toggle('musicOn', 'Música', 'Tema procedural de cada región', s.musicOn !== false)}
      ${toggle('sfxOn', 'Efectos de sonido', 'Golpes, pasos, criaturas y ambiente', s.sfxOn !== false)}
      <div class="setting-row"><div class="sl">Volumen de música<small>${Math.round((s.music ?? .55) * 100)}%</small></div><input class="range" type="range" min="0" max="1" step="0.05" value="${s.music ?? .55}" data-setting-range="music" /></div>
      <div class="setting-row"><div class="sl">Volumen de efectos<small>${Math.round((s.sfx ?? .7) * 100)}%</small></div><input class="range" type="range" min="0" max="1" step="0.05" value="${s.sfx ?? .7}" data-setting-range="sfx" /></div>
      ${toggle('reduceFx', 'Reducir destellos', 'Menos partículas, clima y flashes', !!s.reduceFx)}
      ${toggle('largeText', 'Texto grande', 'Aumenta el tamaño de la interfaz', !!s.largeText)}
      ${toggle('vibration', 'Vibración', 'Respuesta háptica en móvil compatible', s.vibration !== false)}
      <div class="setting-row"><div class="sl">Controles táctiles<small>Se muestran en pantallas pequeñas</small></div>
        <div class="opt-buttons">
          ${['auto', 'on', 'off'].map(v => `<button data-setting-touch="${v}" class="${(s.touchControls || 'auto') === v ? 'sel' : ''}">${v === 'auto' ? 'AUTO' : v === 'on' ? 'SÍ' : 'NO'}</button>`).join('')}
        </div>
      </div>
      <div class="setting-row"><div class="sl">Calidad gráfica<small>La opción baja reduce la resolución interna</small></div>
        <div class="opt-buttons">
          ${['auto', 'low', 'high'].map(v => `<button data-setting-quality="${v}" class="${(s.quality || 'auto') === v ? 'sel' : ''}">${v.toUpperCase()}</button>`).join('')}
        </div>
      </div>
      <div class="setting-row"><div class="sl">Pantalla completa<small>Recomendado en Android horizontal</small></div><button class="buy-btn" data-action="fullscreen">ACTIVAR</button></div>
      <div class="setting-row"><div class="sl">Restablecer controles<small>Borra únicamente los ajustes, no la partida</small></div><button class="buy-btn" data-action="reset-settings">RESTABLECER</button></div>
    </div>`;
  }

  afterRenderTab(tab) {
    if (tab === 'creatures') {
      const p = this.game.player;
      for (const canvas of document.querySelectorAll('#overlay-body canvas[data-creature]')) {
        const id = canvas.dataset.creature;
        const owned = !!p.creatures[id];
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const grd = ctx.createRadialGradient(canvas.width / 2, 40, 3, canvas.width / 2, 40, 75);
        grd.addColorStop(0, owned ? 'rgba(90,120,170,.35)' : 'rgba(30,34,44,.4)');
        grd.addColorStop(1, 'rgba(8,11,20,0)');
        ctx.fillStyle = grd; ctx.fillRect(0, 0, canvas.width, canvas.height);
        drawCreature(ctx, id, canvas.width / 2, 54, .85, performance.now() / 1000, { seed: 2, noShadow: true });
        if (!owned) {
          ctx.save();
          ctx.globalCompositeOperation = 'source-atop';
          ctx.fillStyle = 'rgba(6,8,14,.7)'; ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.restore();
        }
      }
    } else if (tab === 'map') {
      const canvas = $('worldmap-canvas');
      if (canvas) this.drawWorldmap(canvas);
    }
  }

  drawWorldmap(canvas) {
    const g = this.game;
    const region = g.region;
    const ctx = canvas.getContext('2d');
    const w = canvas.width, h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    const colors = {
      0: '#4a7048', 1: '#8b7655', 2: '#77746a', 3: '#2d5f74', 4: '#a33b22',
      5: '#4b3c36', 6: '#a9a68f', 7: '#34352f', 8: '#080b14', 9: '#69553d', 10: '#395e40'
    };
    const scale = Math.min(w / region.widthPx, h / region.heightPx);
    const ox = (w - region.widthPx * scale) / 2;
    const oy = (h - region.heightPx * scale) / 2;
    for (let y = 0; y < region.tileH; y++) for (let x = 0; x < region.tileW; x++) {
      const t = region.tiles[y * region.tileW + x];
      ctx.fillStyle = colors[t] || '#444';
      ctx.fillRect(ox + x * TILE * scale, oy + y * TILE * scale, Math.ceil(TILE * scale) + 1, Math.ceil(TILE * scale) + 1);
    }
    // paths
    ctx.fillStyle = 'rgba(220,200,160,.15)';
    for (let y = 0; y < region.tileH; y++) for (let x = 0; x < region.tileW; x++) {
      if (region.pathMask[y * region.tileW + x]) ctx.fillRect(ox + x * TILE * scale, oy + y * TILE * scale, Math.ceil(TILE * scale) + 1, Math.ceil(TILE * scale) + 1);
    }
    // markers
    const dot = (x, y, color, r = 3) => { ctx.fillStyle = color; ctx.beginPath(); ctx.arc(ox + x * scale, oy + y * scale, r, 0, 6.3); ctx.fill(); };
    for (const s of g.shrines) dot(s.x, s.y, s.discovered ? '#ffe6a0' : 'rgba(200,200,180,.35)', s.discovered ? 4 : 2.5);
    for (const n of g.npcs) if (!n.hidden) dot(n.x, n.y, n.marker ? '#ffe08a' : 'rgba(235,225,200,.7)', n.marker ? 3.5 : 2.2);
    for (const e of g.enemies) if (!e.dead) dot(e.x, e.y, e.boss ? '#ff7a4e' : 'rgba(255,110,90,.6)', e.boss ? 5 : 2);
    dot(g.player.x, g.player.y, '#ffffff', 5);
    ctx.strokeStyle = '#ffe6a0'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(ox + g.player.x * scale, oy + g.player.y * scale, 8, 0, 6.3); ctx.stroke();
    // grain frame
    ctx.strokeStyle = 'rgba(230,189,109,.25)'; ctx.strokeRect(ox, oy, region.widthPx * scale, region.heightPx * scale);
    ctx.fillStyle = 'rgba(10,13,22,.8)'; ctx.fillRect(10, 10, 190, 28);
    ctx.fillStyle = '#ffe6a0'; ctx.font = '12px Georgia, serif'; ctx.textAlign = 'left';
    ctx.fillText(`${region.name} · ${region.subtitle}`, 20, 29);
  }

  onOverlayClick(e) {
    const el = e.target.closest('[data-action],[data-tab],[data-equip],[data-unequip],[data-use],[data-buy],[data-setcreature],[data-save-slot],[data-load-slot],[data-delete-slot],[data-shrine-travel],[data-ending],[data-respawn],[data-allocate],[data-inv-action],[data-equip-slot]');
    if (!el) return;
    const d = el.dataset;
    if (d.tab) { this.openTab(d.tab); return; }
    if (d.action) { this.overlayAction(d.action); return; }
    if (d.equipSlot) { this.equipSlot = d.equipSlot; this.renderOverlay(); return; }
    if (d.equip) {
      if (this.game.player.equip(d.equip)) {
        this.audio?.sfx('select'); this.toast('Equipado · ' + (ITEMS[d.equip]?.name || d.equip), 'gold');
        this.game.player.refreshStats();
        this.game.ui?.refresh();
        this.renderOverlay();
      }
      return;
    }
    if (d.unequip) {
      this.game.player.unequip(d.unequip);
      this.toast('Objeto desequipado');
      this.renderOverlay(); this.refreshHud(); return;
    }
    if (d.invAction || d.use) {
      const id = d.invAction || d.use;
      const it = ITEMS[id];
      if (!it) return;
      if (it.type === 'consumable') {
        if (this.game.player.useItem(id, this.game)) { this.renderOverlay(); this.refreshHud(); }
      } else if (it.slot) {
        if (this.game.player.equip(id)) {
          this.audio?.sfx('select'); this.toast('Equipado · ' + it.name, 'gold');
          this.equipSlot = it.slot;
          this.game.player.refreshStats();
          this.renderOverlay(); this.refreshHud();
        }
      }
      return;
    }
    if (d.buy) { this.buyItem(d.buy, Number(d.price)); this.renderOverlay(); return; }
    if (d.setcreature) {
      this.game.player.setActiveCreature(d.setcreature);
      this.game.ensureCompanion();
      this.audio?.sfx('capture');
      this.toast(`${CREATURES[d.setcreature]?.name} te acompaña`, 'creature');
      this.renderOverlay(); this.refreshHud(); return;
    }
    if (d.saveSlot) { this.game.save(d.saveSlot); this.renderOverlay(); return; }
    if (d.loadSlot) {
      const data = readSave(d.loadSlot);
      if (data) { this.closeAll(); this.onLoadSave(data); }
      return;
    }
    if (d.deleteSlot) {
      deleteSave(d.deleteSlot); this.toast('Ranura borrada'); this.renderOverlay(); return;
    }
    if (d.shrineTravel) {
      const [regionId, id] = d.shrineTravel.split(':');
      const region = getRegion(regionId);
      const shrine = region.shrines.find(s => s.id === id);
      if (shrine) {
        this.closeAll();
        this.game.loadRegion(regionId, null, { position: { x: shrine.x, y: shrine.y }, quiet: false });
        this.game.lastShrine = { region: regionId, id, name: shrine.name, x: shrine.x, y: shrine.y };
        this.game.save('auto', true);
        this.toast(`Viajas a ${shrine.name}`, 'gold');
      }
      return;
    }
    if (d.ending) { this.startEnding(d.ending); return; }
    if (d.respawn) { this.closeAll(); this.game.respawn(); return; }
    if (d.allocate) {
      if (this.game.player.allocate(d.allocate)) { this.audio?.sfx('select'); this.renderOverlay(); this.refreshHud(); }
      return;
    }
  }

  overlayAction(action) {
    switch (action) {
      case 'close-menu': this.closeAll(); break;
      case 'return-title': this.closeAll(true); this.onExitToTitle(); break;
      case 'fullscreen': {
        try {
          if (!document.fullscreenElement) document.documentElement.requestFullscreen?.();
          else document.exitFullscreen?.();
        } catch (e) { this.toast('Pantalla completa no disponible', 'danger'); }
        break;
      }
      case 'reset-settings': {
        this.settings = { ...this.settings, music: .55, sfx: .7, musicOn: true, sfxOn: true, reduceFx: false, vibration: true, largeText: false, touchControls: 'auto', quality: 'auto' };
        this.saveSettings(); this.renderOverlay(); break;
      }
      case 'rest': this.game.restAtShrine(this.currentShrine); break;
      case 'death-load': {
        const data = readSave('auto');
        if (data) { this.closeAll(); this.onLoadSave(data); }
        break;
      }
      case 'death-retry': this.closeAll(); this.game.respawn(); break;
      default: break;
    }
  }

  onOverlayInput(e) {
    const el = e.target;
    if (el.dataset.settingToggle) {
      const key = el.dataset.settingToggle;
      this.settings[key] = !(this.settings[key] !== false);
      el.classList.toggle('on', !!this.settings[key]);
      this.saveSettings();
      this.applySettings();
      return;
    }
    if (el.dataset.settingRange) {
      this.settings[el.dataset.settingRange] = Number(el.value);
      this.saveSettings(); this.applySettings();
      const small = el.closest('.setting-row')?.querySelector('small');
      if (small) small.textContent = Math.round(Number(el.value) * 100) + '%';
      return;
    }
    if (el.dataset.settingTouch) {
      this.settings.touchControls = el.dataset.settingTouch;
      this.saveSettings(); this.applySettings(); this.renderOverlay(); return;
    }
    if (el.dataset.settingQuality) {
      this.settings.quality = el.dataset.settingQuality;
      this.saveSettings(); this.applySettings(); this.renderOverlay(); return;
    }
  }

  saveSettings() {
    persistSettings(this.settings);
    this.onSettingsChange(this.settings);
    if (this.game) { this.game.settings = this.settings; this.game.applySettings(); }
  }

  applySettings() {
    if (this.game) this.game.applySettings();
    this.applyTouchVisibility();
    document.body.classList.toggle('large-text', !!this.settings.largeText);
  }

  openSettingsStandalone() {
    this.standaloneSettings = true;
    this.overlayMode = 'settings';
    $('overlay-eyebrow').textContent = 'AJUSTES';
    $('overlay-title').textContent = 'Sensibilidad y rendimiento';
    $('overlay-body').innerHTML = this.renderSettings();
    $('overlay-foot').innerHTML = '<span>Los ajustes se guardan en este dispositivo</span><span>ESC · CERRAR</span>';
    $('overlay-tabs').classList.add('hidden');
    $('overlay-close').classList.remove('hidden');
    $('overlay').classList.remove('hidden');
    this.audio?.sfx('menu');
  }

  closeAll(silent = false) {
    $('overlay')?.classList.add('hidden');
    $('overlay-tabs')?.classList.remove('hidden');
    $('overlay-close')?.classList.remove('hidden');
    this.overlayMode = null;
    if (!silent && this.dlg) this.closeDialogue(true);
    $('overlay-body').innerHTML = '';
    this.clearTransientInput();
  }

  clearTransientInput() {
    const i = this.game?.input;
    if (!i) return;
    i.pressed?.delete('menu'); i.pressed?.delete('journal');
    i.actions?.delete('interact');
  }

  /* ------------------------------------------------------------------ */
  /*  Tienda y santuario                                                 */
  /* ------------------------------------------------------------------ */

  openShop(vendorId) {
    const shop = SHOPS[vendorId];
    if (!shop) return;
    this.overlayMode = 'shop';
    this.vendorId = vendorId;
    $('overlay-eyebrow').textContent = 'COMERCIO';
    $('overlay-title').textContent = shop.name;
    $('overlay-tabs').classList.add('hidden');
    $('overlay-close').classList.remove('hidden');
    $('overlay').classList.remove('hidden');
    $('overlay-body').innerHTML = this.renderShop(shop);
    $('overlay-foot').innerHTML = `<span>${esc(shop.subtitle)}</span><span>◈ ${this.game.player.gold} ORO</span>`;
    this.audio?.sfx('menu');
  }

  renderShop(shop) {
    const p = this.game.player;
    const items = shop.items.map(id => {
      const it = ITEMS[id];
      if (!it) return '';
      const can = p.gold >= (it.price || 0);
      return `<div class="shop-item">
        <div class="si-info"><b>${esc(it.name)}</b><span>${esc(it.desc)}</span><span style="color:#8fe0c8">${esc(statLine(it) || '')}</span></div>
        <button class="buy-btn" data-buy="${id}" data-price="${it.price}" ${can ? '' : 'disabled'}>◈ ${it.price}</button>
      </div>`;
    }).join('');
    return `<div class="shop-grid">
      <div><div class="section-title">A LA VENTA</div><div class="shop-list">${items}</div></div>
      <div><div class="section-title">TU BOLSA</div><div class="panel-card"><h3>${p.gold} de oro</h3><div class="sub">${esc(shop.keeper)}</div><p>Compra objetos para mejorar tu equipo. También puedes encontrar reliquias en cofres y en las criaturas que vinculas.</p></div>
        <div class="section-title">CONSEJO</div><div class="panel-card"><p>El equipo cambia tanto tus estadísticas como tu aspecto. Prueba armas distintas: el mandoble golpea más lento pero rompe la guardia enemiga.</p></div></div>
    </div>`;
  }

  buyItem(id, price) {
    const it = ITEMS[id];
    if (!it || !this.game) return false;
    const cost = Number.isFinite(price) ? price : it.price || 0;
    if (this.game.player.gold < cost) { this.toast('No tienes oro suficiente', 'danger'); this.audio?.sfx('error'); return false; }
    this.game.player.gold -= cost;
    this.game.player.addItem(id, 1);
    this.audio?.sfx('coin');
    this.toast(`${it.name} comprado · -${cost} oro`, 'gold');
    this.refreshHud();
    return true;
  }

  openShrine(shrine) {
    this.currentShrine = shrine;
    this.overlayMode = 'shrine';
    shrine.discovered = true;
    this.game.state.shrines[shrine.id] = true;
    $('overlay-eyebrow').textContent = 'SANTUARIO';
    $('overlay-title').textContent = shrine.name;
    $('overlay-tabs').classList.add('hidden');
    $('overlay-close').classList.remove('hidden');
    const discovered = this.allDiscoveredShrines().filter(s => !(s.region === this.game.regionId && s.id === shrine.id));
    const travel = discovered.length ? discovered.map(s => `<button class="slot-btn" data-shrine-travel="${s.region}:${s.id}">
      <span><b>${esc(s.name)}</b><span>${esc(REGION_NAMES[s.region] || s.region)}</span></span><em>VIAJAR</em>
    </button>`).join('') : `<div class="empty-note">Aún no conoces otros santuarios.</div>`;
    $('overlay-body').innerHTML = `<div class="panel-card"><h3>${esc(shrine.name)}</h3><div class="sub">${esc(this.game.region.name)} · LUGAR DE DESCANSO</div><p>La luz del santuario restaura tu vida, tu maná y tu resistencia. También reinicia la protección de tu criatura y guarda la partida.</p><button class="btn-primary" data-action="rest" style="margin-top:10px">DESCANSAR Y GUARDAR</button></div>
      <div class="section-title">VIAJE RÁPIDO</div><div class="slot-list">${travel}</div>`;
    $('overlay-foot').innerHTML = `<span>El descanso restaura y guarda automáticamente</span><span>ESC · CERRAR</span>`;
    this.audio?.sfx('shrine');
    $('overlay').classList.remove('hidden');
    this.clearTransientInput();
  }

  showNarration(title, text) { this.startNarration(title, text); }

  /* ------------------------------------------------------------------ */
  /*  Resonancia                                                         */
  /* ------------------------------------------------------------------ */

  openResonance(enemy) {
    this.resonanceEl = $('resonance');
    if (!this.resonanceEl) return;
    const c = CREATURES[enemy.creatureId];
    $('res-name').textContent = c?.name || 'CRIATURA';
    $('res-copy').innerHTML = `Sincroniza tu pulso con el de <em>${esc(c?.name || 'la criatura')}</em>. Pulsa <kbd>ESPACIO</kbd> cuando la marca cruce la zona dorada.`;
    $('res-fill').style.width = '0%';
    $('res-strike').textContent = 'SINTONIZAR';
    $('res-strike').disabled = false;
    this.resonanceEl.classList.remove('hidden');
    const width = clamp(.34 + (enemy.tameChance || .2) * .85 + (this.game.player.stats.tameBonus || 0) * .003, .26, 1.15);
    this.res = {
      enemy, angle: -Math.PI / 2, speed: .95 + Math.random() * .35,
      zone: rand(0, Math.PI * 2), width, active: true, done: false,
      raf: null, started: performance.now(), result: null
    };
    this.loopResonance();
    this.audio?.sfx('pulse');
    this.clearTransientInput();
  }

  loopResonance() {
    if (!this.res) return;
    const now = performance.now();
    const dt = Math.min(.05, (now - (this.res.last || now)) / 1000);
    this.res.last = now;
    this.res.angle += this.res.speed * dt * 2 * Math.PI;
    this.drawResonance();
    const p = ((this.res.angle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
    const z0 = this.res.zone, z1 = this.res.zone + this.res.width;
    const inside = (p >= z0 && (p <= z1 || z1 > Math.PI * 2 && p + Math.PI * 2 <= z1));
    if (inside) this.res.inside = true;
    this.res.raf = requestAnimationFrame(() => this.loopResonance());
  }

  drawResonance() {
    const canvas = $('resonance-canvas');
    if (!canvas || !this.res) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width, h = canvas.height;
    const cx = w / 2, cy = h / 2, r = w * .34;
    ctx.clearRect(0, 0, w, h);
    // fondo
    const bg = ctx.createRadialGradient(cx, cy, 8, cx, cy, w * .5);
    bg.addColorStop(0, 'rgba(60,54,120,.3)'); bg.addColorStop(1, 'rgba(10,8,24,0)');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h);
    // anillos
    for (let i = 0; i < 3; i++) {
      ctx.strokeStyle = `rgba(160,140,255,${.18 - i * .04})`;
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(cx, cy, r + 20 + i * 15, 0, Math.PI * 2); ctx.stroke();
    }
    ctx.strokeStyle = 'rgba(200,190,255,.24)'; ctx.lineWidth = 5;
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
    // zona dorada
    const z0 = this.res.zone, z1 = this.res.zone + this.res.width;
    ctx.strokeStyle = 'rgba(255,224,140,.9)'; ctx.lineWidth = 13;
    ctx.lineCap = 'butt';
    ctx.beginPath(); ctx.arc(cx, cy, r, z0, z1); ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,230,.9)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(cx, cy, r, z0, z1); ctx.stroke();
    // marcas
    for (let i = 0; i < 24; i++) {
      const a = i / 24 * Math.PI * 2;
      ctx.strokeStyle = 'rgba(220,215,255,.2)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(cx + Math.cos(a) * (r + 12), cy + Math.sin(a) * (r + 12));
      ctx.lineTo(cx + Math.cos(a) * (r + 16), cy + Math.sin(a) * (r + 16)); ctx.stroke();
    }
    // marcador
    const a = this.res.angle;
    const mx = cx + Math.cos(a) * r, my = cy + Math.sin(a) * r;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const g = ctx.createRadialGradient(mx, my, 1, mx, my, 26);
    g.addColorStop(0, 'rgba(255,255,255,.95)'); g.addColorStop(.4, 'rgba(160,150,255,.55)'); g.addColorStop(1, 'rgba(130,110,255,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(mx, my, 26, 0, 6.3); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(mx, my, 5, 0, 6.3); ctx.fill();
    ctx.restore();
    // centro
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(performance.now() / 4000);
    for (let i = 0; i < 6; i++) {
      ctx.rotate(Math.PI / 3);
      ctx.strokeStyle = 'rgba(220,210,255,.45)'; ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.moveTo(0, -18); ctx.lineTo(0, -62); ctx.stroke();
    }
    ctx.restore();
    ctx.fillStyle = 'rgba(240,238,255,.9)'; ctx.font = '22px Georgia, serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('✦', cx, cy + 1);
    const prog = clamp((performance.now() - this.res.started) / 9000, 0, 1);
    const fill = $('res-fill');
    if (fill) fill.style.width = (prog * 100) + '%';
    if (prog >= 1 && !this.res.done) this.resolveResonance(false, true);
  }

  strikeResonance() {
    if (!this.res || this.res.done) return;
    const p = ((this.res.angle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
    const z0 = this.res.zone, z1 = this.res.zone + this.res.width;
    const inside = p >= z0 && (p <= z1 || z1 > Math.PI * 2 && p + Math.PI * 2 <= z1);
    this.resolveResonance(inside);
  }

  resolveResonance(success, timeout = false) {
    if (!this.res || this.res.done) return;
    this.res.done = true;
    cancelAnimationFrame(this.res.raf);
    const enemy = this.res.enemy;
    $('res-strike').disabled = true;
    $('res-strike').textContent = success ? 'VÍNCULO ESTABLECIDO' : 'LA NOTA SE ROMPE';
    $('res-copy').innerHTML = success
      ? 'Tu pulso y el suyo se encuentran. Una nueva nota se suma a tu canción.'
      : timeout ? 'La marca se ha escapado. La criatura ya no confía en ti.' : 'La marca pasó demasiado lejos. La criatura se ha vuelto hostil.';
    const canvas = $('resonance-canvas');
    if (canvas) {
      const ctx = canvas.getContext('2d');
      const grd = ctx.createRadialGradient(210, 210, 4, 210, 210, 200);
      grd.addColorStop(0, success ? 'rgba(255,240,190,.5)' : 'rgba(200,100,140,.4)');
      grd.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grd; ctx.fillRect(0, 0, 420, 420);
    }
    setTimeout(() => {
      this.res = null;
      $('resonance')?.classList.add('hidden');
      if (success) this.game.resonanceSuccess(enemy);
      else this.game.resonanceFail(enemy);
      this.clearTransientInput();
    }, success ? 700 : 850);
  }

  /* ------------------------------------------------------------------ */
  /*  Cinemáticas, finales y muerte                                      */
  /* ------------------------------------------------------------------ */

  playCutscene(slides, onDone = null) {
    if (!slides?.length) { onDone?.(); return; }
    this.cut = { slides, index: 0, onDone };
    this.cutsceneEl = $('cutscene');
    this.renderCutscene();
    this.cutsceneEl.classList.remove('hidden');
    this.clearTransientInput();
  }

  renderCutscene() {
    const c = this.cut;
    if (!c) return;
    const s = c.slides[c.index];
    $('cutscene-chapter').textContent = s.chapter || '';
    $('cutscene-title').textContent = s.title || '';
    $('cutscene-text').textContent = s.text || '';
    const bg = $('cutscene-bg');
    if (bg) bg.style.background = s.bg || 'var(--cut-bg-1)';
    $('cutscene-skip').textContent = c.index >= c.slides.length - 1 ? 'CONTINUAR ▸' : 'SIGUIENTE ▸';
    const content = document.querySelector('.cutscene-content');
    if (content) { content.style.animation = 'none'; void content.offsetWidth; content.style.animation = ''; }
  }

  advanceCutscene() {
    if (!this.cut) return;
    this.cut.index++;
    if (this.cut.index >= this.cut.slides.length) {
      const done = this.cut.onDone;
      this.cut = null;
      $('cutscene')?.classList.add('hidden');
      this.clearTransientInput();
      done?.();
    } else {
      this.audio?.sfx('select');
      this.renderCutscene();
    }
  }

  showDeath() {
    this.overlayMode = 'death';
    $('overlay-eyebrow').textContent = 'EL VELO TE RECLAMA';
    $('overlay-title').textContent = 'Has caído';
    $('overlay-tabs').classList.add('hidden');
    $('overlay-close').classList.add('hidden');
    const p = this.game.player;
    $('overlay-body').innerHTML = `<div class="panel-card"><h3>La canción se interrumpe</h3><div class="sub">${esc(this.game.region.name)}</div><p>Despiertas junto al último santuario que visitaste. Perderás un 10% de tu oro, pero conservarás tu equipo, tus criaturas y tus misiones. También puedes cargar el guardado automático.</p></div>
      <div class="section-title">ESTADÍSTICAS</div>
      <div class="stat-grid">
        <div class="stat-line"><span>Nivel</span><b>${p.level}</b></div>
        <div class="stat-line"><span>Enemigos derrotados</span><b>${p.kills}</b></div>
        <div class="stat-line"><span>Criaturas vinculadas</span><b>${p.tamed}</b></div>
        <div class="stat-line"><span>Oro</span><b>${p.gold}</b></div>
      </div>
      <div style="display:flex;gap:10px;margin-top:18px;flex-wrap:wrap">
        <button class="btn-primary" data-respawn="1">DESPERTAR EN EL SANTUARIO</button>
        <button class="btn-ghost" data-action="death-load">CARGAR GUARDADO AUTOMÁTICO</button>
      </div>`;
    $('overlay-foot').innerHTML = '<span>La muerte no borra tu leyenda</span><span>—</span>';
    $('overlay').classList.remove('hidden');
    this.clearTransientInput();
    this.audio?.sfx('death');
  }

  showFinale(secret) {
    this.overlayMode = 'finale';
    $('overlay-eyebrow').textContent = 'CAPÍTULO FINAL';
    $('overlay-title').textContent = 'La nota que falta';
    $('overlay-tabs').classList.add('hidden');
    $('overlay-close').classList.add('hidden');
    const secretCard = secret ? `<div class="panel-card" style="border-color:rgba(255,220,140,.55);box-shadow:inset 0 0 26px rgba(255,200,100,.08)">
      <h3>La nota libre</h3><div class="sub">FINAL SECRETO · REQUIERE LOS TRES ECOS Y TRES VÍNCULOS</div>
      <p>No restaurar. No romper. Cantar lo que nadie escribió. La Profecía no puede castigar una nota que no conocía.</p>
      <button class="btn-primary" data-ending="C" style="margin-top:10px">CANTAR LA NOTA LIBRE</button>
    </div>` : `<div class="panel-card" style="opacity:.55"><h3>La nota libre</h3><div class="sub">FINAL SECRETO · BLOQUEADO</div><p>Escucha los tres ecos del Archivo del Velo y vincula al menos tres criaturas para descubrir una tercera opción.</p></div>`;
    $('overlay-body').innerHTML = `<div class="panel-card"><h3>El Coro ha callado</h3><p>La Gema, la Jarra de Origen y la Lágrima de la Primera Brasa flotan ante ti. Seraphine ya no canta. El mundo espera tu decisión.</p></div>
      <div class="section-title">ELIGE EL DESTINO DE LA CANCIÓN</div>
      <div class="panel-card"><h3>Restaurar el Velo</h3><div class="sub">FINAL A · EL MUNDO OLVIDA</div><p>Vuelve a cerrar el Velo y devuelve al mundo su canción original. La grieta desaparecerá. Tú también, de su memoria.</p><button class="btn-ghost" data-ending="A" style="margin-top:10px">RESTAURAR EL VELO</button></div>
      <div class="panel-card"><h3>Quebrar la Jarra</h3><div class="sub">FINAL B · MIL CANCIONES</div><p>Libera todas las voces que el Velo silenció. El mundo perderá su unidad y ganará una libertad que nadie sabe usar.</p><button class="btn-ghost" data-ending="B" style="margin-top:10px">QUEBRAR LA JARRA</button></div>
      ${secretCard}`;
    $('overlay-foot').innerHTML = '<span>Tres destinos. Ninguno estaba escrito del todo.</span><span>—</span>';
    $('overlay').classList.remove('hidden');
    this.audio.playTheme('ending');
  }

  startEnding(key) {
    this.closeAll(true);
    this.game.finishEnding(key);
  }

  showEnding(key) {
    const p = this.game.player;
    const titles = {
      A: 'El mundo olvida tu nombre',
      B: 'Una canción sin dueño',
      C: 'El que no estaba escrito',
    };
    this.overlayMode = 'ending';
    $('overlay-eyebrow').textContent = 'LA ESPADA CELESTIAL';
    $('overlay-title').textContent = titles[key] || 'Fin';
    $('overlay-tabs').classList.add('hidden');
    $('overlay-close').classList.add('hidden');
    const quests = Object.keys(this.game.quests).filter(id => this.game.quests[id].status === 'done').length;
    $('overlay-body').innerHTML = `<div class="panel-card" style="border-color:rgba(255,220,140,.55);text-align:center;padding:34px">
      <div class="sub">FINAL ${key}${key === 'C' ? ' · SECRETO' : ''}</div>
      <h3 style="font-size:32px;margin:10px 0">${esc(titles[key] || 'Fin')}</h3>
      <p style="max-width:520px;margin:0 auto">La canción continúa, distinta. Esa es la única promesa que el Velo nunca pudo romper.</p>
      </div>
      <div class="section-title">TU LEYENDA</div>
      <div class="stat-grid">
        <div class="stat-line"><span>Nombre</span><b>${esc(p.name)}</b></div>
        <div class="stat-line"><span>Nivel</span><b>${p.level}</b></div>
        <div class="stat-line"><span>Misiones completadas</span><b>${quests}</b></div>
        <div class="stat-line"><span>Criaturas vinculadas</span><b>${p.tamed} / 12</b></div>
        <div class="stat-line"><span>Enemigos derrotados</span><b>${p.kills}</b></div>
        <div class="stat-line"><span>Tiempo de juego</span><b>${formatPlayTime(this.game.playTime)}</b></div>
      </div>
      <div style="display:flex;gap:10px;margin-top:22px;flex-wrap:wrap">
        <button class="btn-primary" data-action="return-title">VOLVER AL TÍTULO</button>
        <button class="btn-ghost" data-action="close-menu">SEGUIR EXPLORANDO</button>
      </div>`;
    $('overlay-foot').innerHTML = `<span>Gracias por jugar · ${esc(p.name)}</span><span>LA ESPADA CELESTIAL</span>`;
    $('overlay').classList.remove('hidden');
    this.audio.playTheme('ending');
  }

  /* ------------------------------------------------------------------ */
  /*  Creación de personaje                                              */
  /* ------------------------------------------------------------------ */

  openCreation() {
    this.creation = {
      name: 'Aurel', face: 0, hair: 0, hairColor: '#e8d9b8', outfit: 0, armorLook: 0, accessory: 0,
      alloc: Object.fromEntries(STAT_DEFS.map(d => [d.id, 0])), points: 8, kit: 'errante'
    };
    $('title-screen')?.classList.add('hidden');
    $('creation-screen')?.classList.remove('hidden');
    $('input-name').value = 'Aurel';
    this.syncCreationControls();
    this.setCreationTab('look');
    this.renderGearCards();
    this.renderStatAlloc();
    this.updateCreationPreview();
    this.startCreationPreview();
  }

  updateCreationPreview() {
    if (!this.creation) return;
    this.drawCreationPreview(performance.now() / 1000);
  }

  startCreationPreview() {
    cancelAnimationFrame(this.creationRAF);
    const loop = () => {
      if (!this.creation || $('creation-screen')?.classList.contains('hidden')) return;
      this.drawCreationPreview(performance.now() / 1000);
      this.creationRAF = requestAnimationFrame(loop);
    };
    this.creationRAF = requestAnimationFrame(loop);
  }

  buildProfile() {
    const c = this.creation;
    const kit = STARTING_KITS.find(k => k.id === c.kit) || STARTING_KITS[0];
    const outfit = OUTFITS[c.outfit] || OUTFITS[0];
    const weapon = ITEMS[kit.weapon]?.weapon || 'sword';
    const attributes = {};
    for (const d of STAT_DEFS) attributes[d.id] = 5 + (c.alloc[d.id] || 0);
    const look = {
      skin: '#e8bd96', hair: c.hairColor, hairStyle: c.hair, outfit: outfit.outfit, accent: outfit.accent,
      baseOutfit: outfit.outfit, baseAccent: outfit.accent, accessory: c.accessory, face: c.face,
      scar: c.face === 1, height: c.face === 2 ? .94 : 1,
      armorLook: c.armorLook, helmet: c.accessory === 3, weapon,
    };
    return { name: c.name || 'Aurel', look, attributes, kit: c.kit, armorPick: ARMOR_ITEMS[c.armorLook] };
  }

  drawCreationPreview(time) {
    const canvas = $('creation-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width, h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    const bg = ctx.createRadialGradient(w * .5, h * .4, 20, w * .5, h * .5, w * .7);
    bg.addColorStop(0, 'rgba(48,64,98,.5)'); bg.addColorStop(1, 'rgba(8,10,20,.1)');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h);
    // círculo ritual
    ctx.save();
    ctx.translate(w * .5, h * .52);
    ctx.rotate(time * .12);
    ctx.strokeStyle = 'rgba(230,189,109,.18)'; ctx.lineWidth = 1;
    for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(0, 0, 90 + i * 26, 0, Math.PI * 2); ctx.stroke(); }
    for (let i = 0; i < 12; i++) {
      const a = i / 12 * Math.PI * 2;
      ctx.beginPath(); ctx.moveTo(Math.cos(a) * 100, Math.sin(a) * 100); ctx.lineTo(Math.cos(a) * 112, Math.sin(a) * 112); ctx.stroke();
    }
    ctx.restore();
    const profile = this.buildProfile();
    const look = { ...profile.look, weapon: ITEMS[STARTING_KITS.find(k => k.id === this.creation.kit)?.weapon]?.weapon || 'sword' };
    drawHumanoid(ctx, w * .5, h * .88, {
      look, facing: 'down', moving: false, phase: 0, time, scale: 3.4, weapon: look.weapon, weaponGlow: look.weapon === 'celestial', seed: 1
    });
    // aura
    const aura = ctx.createRadialGradient(w / 2, h * .55, 20, w / 2, h * .55, 170);
    aura.addColorStop(0, 'rgba(230,189,109,.07)'); aura.addColorStop(1, 'rgba(230,189,109,0)');
    ctx.fillStyle = aura; ctx.fillRect(0, 0, w, h);
  }

  selectCreationOption(group, value, btn) {
    const c = this.creation;
    if (!c) return;
    if (group === 'hairColor') c.hairColor = value;
    else if (['face', 'hair', 'outfit', 'armorLook', 'accessory'].includes(group)) c[group] = Number(value);
    const wrap = btn?.parentElement;
    if (wrap) for (const b of wrap.querySelectorAll('button')) b.classList.toggle('sel', b === btn);
    this.drawCreationPreview(performance.now() / 1000);
  }

  renderGearCards() {
    const wrap = $('gear-cards');
    if (!wrap) return;
    wrap.innerHTML = STARTING_KITS.map(k => `<button class="gear-card ${this.creation?.kit === k.id ? 'sel' : ''}" data-kit="${k.id}">
      <b>${k.name}</b><em>${k.tag}</em><span>${k.desc}</span>
    </button>`).join('');
    for (const b of wrap.querySelectorAll('[data-kit]')) {
      b.addEventListener('click', () => {
        if (!this.creation) return;
        this.creation.kit = b.dataset.kit;
        for (const x of wrap.querySelectorAll('[data-kit]')) x.classList.toggle('sel', x === b);
        $('signature-preview').textContent = STARTING_KITS.find(k => k.id === b.dataset.kit)?.signature || '';
        this.drawCreationPreview(performance.now() / 1000);
      });
    }
    const sel = STARTING_KITS.find(k => k.id === (this.creation?.kit || 'errante'));
    const sig = $('signature-preview');
    if (sig) sig.textContent = sel?.signature || '';
  }

  renderStatAlloc() {
    const wrap = $('stat-alloc-list');
    if (!wrap) return;
    const c = this.creation;
    if (!c) return;
    wrap.innerHTML = STAT_DEFS.map(d => {
      const v = c.alloc[d.id] || 0;
      return `<div class="stat-row"><div><span class="sname">${d.icon} ${d.name}</span><span class="sdesc">${d.desc}</span></div>
        <div class="stat-bar">${Array.from({ length: 8 }, (_, i) => `<i class="${i < v ? 'on' : ''}"></i>`).join('')}</div>
        <button class="stat-plus" data-stat="${d.id}" ${c.points <= 0 ? 'disabled' : ''}>+</button></div>`;
    }).join('');
    $('points-left').textContent = c.points;
    for (const b of wrap.querySelectorAll('[data-stat]')) {
      b.addEventListener('click', () => {
        if (!this.creation || this.creation.points <= 0) return;
        this.creation.alloc[b.dataset.stat]++;
        this.creation.points--;
        this.renderStatAlloc();
      });
    }
    const begin = $('btn-begin');
    if (begin) {
      begin.disabled = c.points > 0;
      begin.textContent = c.points > 0 ? `REPARTE ${c.points} PUNTO${c.points === 1 ? '' : 'S'}` : 'COMENZAR LA TRAVESÍA';
    }
  }
}

export { SHOPS };
