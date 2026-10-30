// ============================================================
// LA ESPADA CELESTIAL — interfaz, menús y pantallas
// ============================================================
import {
  ITEMS, SPELLS, SKILLS, CREATURES, AFFINITIES, QUESTS, RECIPES,
  ZONES, ZONE_ORDER, itemDef, itemName, HAIR_STYLES, HAIR_COLORS,
  SKIN_TONES, OUTFIT_COLORS, ACCESSORY_STYLES, OUTFIT_STYLES,
  DEFAULT_APPEARANCE, STAT_LABELS,
} from './data.js';
import { drawPreview, drawNpcPortrait, drawCreatureIcon } from './art.js';
import { renderTab, handleTabAction, drawTabCanvases } from './ui-menus.js';

export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
export const pct = (v, max) => `${clamp(max > 0 ? v / max * 100 : 0, 0, 100).toFixed(1)}%`;
export const fmt = (n) => Math.round(Number(n) || 0).toLocaleString('es-ES');
export const icon = (name, cls = 'ico') => `<svg class="${cls}" aria-hidden="true"><use href="#i-${esc(name)}"></use></svg>`;
export const RARITY = ['', '#8b9bb8', '#7be3b0', '#75b9ff', '#b994ff', '#f4d998'];
export const RARITY_NAME = ['', 'Común', 'Poco común', 'Raro', 'Épico', 'Celestial'];
export const KIND_NAME = {
  weapon: 'Arma', armor: 'Armadura', accessory: 'Accesorio', consumable: 'Consumible',
  material: 'Material', food: 'Alimento', seal: 'Sello', key: 'Llave',
};
export const SLOT_NAME = { weapon: 'Arma', armor: 'Armadura', accessory: 'Accesorio' };
export const STAT_KEYS = ['strength', 'defense', 'speed', 'intelligence', 'luck'];
export const TABS = [
  { id: 'stats', label: 'Estado', heading: 'Diario de viaje' },
  { id: 'inventory', label: 'Mochila', heading: 'Mochila' },
  { id: 'equipment', label: 'Equipo', heading: 'Equipamiento' },
  { id: 'skills', label: 'Habilidades', heading: 'Habilidades y magia' },
  { id: 'map', label: 'Mapa', heading: 'Mapa del valle' },
  { id: 'quests', label: 'Misiones', heading: 'Misiones' },
  { id: 'creatures', label: 'Criaturas', heading: 'Criaturas' },
  { id: 'collection', label: 'Colección', heading: 'Colección celestial' },
  { id: 'craft', label: 'Forja', heading: 'Forja y creación' },
  { id: 'shop', label: 'Tienda', heading: 'Bazar' },
  { id: 'save', label: 'Guardar', heading: 'Partidas' },
  { id: 'settings', label: 'Ajustes', heading: 'Ajustes' },
  { id: 'guide', label: 'Guía', heading: 'Guía y alcance' },
];
export const TAB_ICON = {
  stats: 'stats', inventory: 'bag', equipment: 'armor', skills: 'star', map: 'map',
  quests: 'quest', creatures: 'paw', collection: 'creature', craft: 'hammer',
  shop: 'shop', save: 'save', settings: 'settings', guide: 'book',
};

export const itemKindLabel = (def) => def ? (KIND_NAME[def.kind] || 'Objeto') : 'Objeto';
export const rarityStars = (n = 1) => '★'.repeat(clamp(Number(n) || 1, 1, 5));
export const timeText = (seconds = 0) => {
  const s = Math.max(0, Math.floor(seconds));
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60);
  return h > 0 ? `${h}:${String(m).padStart(2, '0')} h` : `${m}:${String(s % 60).padStart(2, '0')}`;
};
export const dateText = (ts) => {
  if (!ts) return '—';
  try {
    return new Date(ts).toLocaleString('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
  } catch { return '—'; }
};

export class UI {
  constructor(game) {
    this.game = game;
    this.creator = {
      name: 'Astra',
      appearance: { ...DEFAULT_APPEARANCE },
      stats: { strength: 3, defense: 3, speed: 3, intelligence: 3, luck: 3 },
      points: 5,
    };
    this.menuOpen = false;
    this.activeTab = 'stats';
    this.dialogueOpen = false;
    this.modalOpen = false;
    this.gameOverShown = false;
    this.endingShown = false;
    this.dialogueState = null;
    this.invSel = null;
    this.creatureSel = null;
    this.shopTab = 'buy';
    this._avatarSig = '';
    this._banner = null;
    this._lastTab = 'stats';
    this.bind();
    this.applyVisualSettings();
    this.updateContinueLabel();
    this.startAudioUnlock();
  }

  q(sel, root = document) { return root.querySelector(sel); }
  qa(sel, root = document) { return [...root.querySelectorAll(sel)]; }

  // ---------------------------------------------------------- bindings
  bind() {
    // Título
    this.q('#btn-new')?.addEventListener('click', () => this.showCreate());
    this.q('#btn-continue')?.addEventListener('click', () => this.continueGame());
    this.q('#btn-title-settings')?.addEventListener('click', () => this.openSettingsModal());
    this.q('#btn-credits')?.addEventListener('click', () => this.openCredits());

    // Creación
    this.q('#create-back')?.addEventListener('click', () => this.showTitle());
    this.q('#create-help')?.addEventListener('click', () => this.openCreatorHelp());
    this.q('#btn-randomize')?.addEventListener('click', () => this.randomizeCreator());
    this.q('#btn-begin')?.addEventListener('click', () => this.beginGame());
    this.q('#name-input')?.addEventListener('input', (e) => {
      this.creator.name = e.target.value;
      const display = this.q('#create-name-display');
      if (display) display.textContent = e.target.value.trim() || 'Astra';
    });
    this.q('#create-form')?.addEventListener('click', (e) => {
      const sw = e.target.closest('[data-create]');
      if (sw) {
        this.pickCreate(sw.dataset.create, sw.dataset.value);
        return;
      }
      const st = e.target.closest('[data-stat][data-delta]');
      if (st) this.adjustStat(st.dataset.stat, Number(st.dataset.delta));
    });

    // HUD
    this.q('#btn-pause')?.addEventListener('click', () => this.game.openMenu(this.activeTab || 'stats'));
    this.q('#btn-quick')?.addEventListener('click', () => this.game.quickItem());
    this.bindActionButtons();

    // Menú
    this.q('#menu-close')?.addEventListener('click', () => this.game.closeMenu());
    this.q('#menu-nav')?.addEventListener('click', (e) => {
      const b = e.target.closest('[data-tab]');
      if (b) this.setTab(b.dataset.tab);
    });
    this.q('#menu-content')?.addEventListener('click', (e) => this.onMenuClick(e));
    this.q('#menu-content')?.addEventListener('input', (e) => this.onSettingInput(e));
    this.q('#menu-content')?.addEventListener('change', (e) => this.onSettingInput(e));

    // Diálogo
    const dlg = this.q('#dialogue-layer');
    dlg?.addEventListener('click', (e) => {
      if (e.target.closest('#dialogue-choices')) return;
      this.advanceDialogue();
    });

    // Modal
    this.q('#modal-card')?.addEventListener('click', (e) => {
      const b = e.target.closest('[data-modal-action]');
      if (!b) return;
      const i = Number(b.dataset.modalAction);
      const a = this._modalActions?.[i];
      this.closeModal();
      if (a?.action) a.action();
    });
    this.q('#modal-layer')?.addEventListener('click', (e) => {
      if (e.target === this.q('#modal-layer')) this.closeModal();
    });

    // Final y derrota
    this.q('#ending-continue')?.addEventListener('click', () => this.hideEnding());
    this.q('#btn-revive')?.addEventListener('click', () => {
      this.hideGameOver();
      this.game.revive();
      this.showGame();
    });
    this.q('#btn-load')?.addEventListener('click', () => this.showLoadDialog());
  }

  bindActionButtons() {
    const map = { attack: 'attack', dodge: 'dodge', magic: 'castSpell', interact: 'interact', creature: 'creatureAction', weapon: 'cycleWeapon' };
    this.qa('#action-cluster [data-action]').forEach(btn => {
      const act = btn.dataset.action;
      if (act === 'guard') {
        const on = (e) => { e.preventDefault(); this.game.input.touchGuard = true; btn.classList.add('pressed'); };
        const off = () => { this.game.input.touchGuard = false; btn.classList.remove('pressed'); };
        btn.addEventListener('pointerdown', on);
        btn.addEventListener('pointerup', off);
        btn.addEventListener('pointercancel', off);
        btn.addEventListener('pointerleave', off);
        return;
      }
      btn.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        btn.classList.add('pressed');
        const fn = map[act];
        if (fn && typeof this.game[fn] === 'function') this.game[fn]();
      });
      const up = () => btn.classList.remove('pressed');
      btn.addEventListener('pointerup', up);
      btn.addEventListener('pointercancel', up);
      btn.addEventListener('pointerleave', up);
    });
  }

  startAudioUnlock() {
    const unlock = () => {
      this.game.audio.unlock();
      if (this.game.screen === 'title' && !this.game.titleMusic) {
        this.game.audio.music('title');
        this.game.titleMusic = true;
      }
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
    };
    window.addEventListener('pointerdown', unlock, { passive: true });
    window.addEventListener('keydown', unlock);
  }

  // ---------------------------------------------------------- pantallas
  showTitle() {
    document.getElementById('screen-title')?.classList.remove('hidden');
    document.getElementById('screen-create')?.classList.add('hidden');
    document.getElementById('screen-menu')?.classList.add('hidden');
    document.getElementById('screen-ending')?.classList.add('hidden');
    document.getElementById('screen-gameover')?.classList.add('hidden');
    document.getElementById('hud')?.classList.add('hidden');
    document.getElementById('touch-layer')?.classList.add('hidden');
    this.q('#dialogue-layer')?.classList.add('hidden');
    this.q('#modal-layer')?.classList.add('hidden');
    this.menuOpen = false; this.dialogueOpen = false; this.modalOpen = false;
    this.game.screen = 'title';
    this.game.overlay = false; this.game.paused = false;
    this.game.titleMusic = false;
    this.game.audio.unlock();
    this.game.audio.music('title');
    this.game.titleMusic = true;
    this.updateContinueLabel();
  }

  showCreate() {
    this.game.audio.unlock();
    this.game.audio.stopMusic();
    this.game.screen = 'create';
    document.getElementById('screen-title')?.classList.add('hidden');
    document.getElementById('screen-create')?.classList.remove('hidden');
    document.getElementById('hud')?.classList.add('hidden');
    document.getElementById('touch-layer')?.classList.add('hidden');
    this.game.overlay = false; this.game.paused = false;
    this.renderCreator();
  }

  continueGame() {
    if (!this.game.hasSave()) {
      this.toast('No hay ninguna partida guardada todavía.', 'bad');
      this.game.audio.sfx('error');
      return;
    }
    this.game.audio.unlock();
    if (this.game.load('latest')) {
      this.showGame();
      this.updateContinueLabel();
    }
  }

  updateContinueLabel() {
    const label = document.getElementById('continue-label');
    const btn = document.getElementById('btn-continue');
    if (!label) return;
    const save = this.game.latestSave?.();
    if (!save) {
      label.textContent = 'Sin partidas guardadas';
      if (btn) btn.disabled = true;
      return;
    }
    if (btn) btn.disabled = false;
    const zone = ZONES[save.zone]?.name || save.zone || 'Valle';
    label.textContent = `${save.player?.name || 'Astra'} · Nv. ${save.player?.level || 1} · ${zone}`;
  }

  showGame() {
    document.getElementById('screen-title')?.classList.add('hidden');
    document.getElementById('screen-create')?.classList.add('hidden');
    document.getElementById('screen-menu')?.classList.add('hidden');
    document.getElementById('screen-ending')?.classList.add('hidden');
    document.getElementById('screen-gameover')?.classList.add('hidden');
    document.getElementById('hud')?.classList.remove('hidden');
    this.q('#dialogue-layer')?.classList.add('hidden');
    this.q('#modal-layer')?.classList.add('hidden');
    this.menuOpen = false;
    this.dialogueOpen = false;
    this.modalOpen = false;
    this.gameOverShown = false;
    this.endingShown = false;
    this.game.screen = 'playing';
    this.game.overlay = false;
    this.game.paused = false;
    this.game.input.clearActions();
    const coarse = window.matchMedia?.('(pointer:coarse)').matches || navigator.maxTouchPoints > 0;
    const touch = document.getElementById('touch-layer');
    if (touch) touch.classList.toggle('hidden', !coarse);
    this.applyVisualSettings();
    this.updateHUD(this.game);
    this.updateCreatureChip(this.game);
    this.refreshQuest(this.game);
    this.updateContinueLabel();
  }

  // ---------------------------------------------------------- creador
  renderCreator() {
    const c = this.creator;
    const nameInput = this.q('#name-input');
    if (nameInput && nameInput.value !== c.name) nameInput.value = c.name;
    this.q('#create-name-display').textContent = (c.name || 'Astra').trim() || 'Astra';
    this.q('#create-class-display').textContent = this.game.classFor(c.stats);
    const preview = this.q('#create-preview');
    if (preview) drawPreview(preview, { ...c.appearance });
    this.q('#points-left').textContent = c.points;
    this.q('#hair-style-row').innerHTML = HAIR_STYLES.map(h =>
      `<button class="swatch ${c.appearance.hairStyle === h.id ? 'selected' : ''}" data-create="hairStyle" data-value="${h.id}" title="${esc(h.name)}">${'I'.repeat(Math.min(3, h.id + 1))}</button>`
    ).join('');
    this.q('#hair-color-row').innerHTML = HAIR_COLORS.map(col =>
      `<button class="swatch colors ${c.appearance.hairColor === col ? 'selected' : ''}" data-create="hairColor" data-value="${col}" title="${col}" style="--sw:${col}"></button>`
    ).join('');
    this.q('#outfit-row').innerHTML = OUTFIT_STYLES.map(o =>
      `<button class="swatch ${c.appearance.outfit === o.id ? 'selected' : ''}" data-create="outfit" data-value="${o.id}" title="${esc(o.name)}">${esc(o.name.slice(0, 1))}</button>`
    ).join('');
    this.q('#outfit-color-row').innerHTML = OUTFIT_COLORS.map(col =>
      `<button class="swatch colors ${c.appearance.outfitColor === col ? 'selected' : ''}" data-create="outfitColor" data-value="${col}" title="${col}" style="--sw:${col}"></button>`
    ).join('');
    this.q('#skin-row').innerHTML = SKIN_TONES.map(col =>
      `<button class="swatch colors ${c.appearance.skin === col ? 'selected' : ''}" data-create="skin" data-value="${col}" title="${col}" style="--sw:${col}"></button>`
    ).join('');
    this.q('#accessory-row').innerHTML = ACCESSORY_STYLES.map(a => {
      const labels = { diadema: 'Diadema', pluma: 'Pluma', arete: 'Arete', ninguno: 'Ninguno' };
      const icons = { diadema: 'celestial', pluma: 'wind', arete: 'star', ninguno: 'close' };
      return `<button class="swatch ${c.appearance.accessory === a ? 'selected' : ''}" data-create="accessory" data-value="${a}" title="${labels[a]}">${icon(icons[a])}</button>`;
    }).join('');
    this.q('#stat-allocation').innerHTML = STAT_KEYS.map(k =>
      `<div class="stat-line"><span>${STAT_LABELS[k]}</span><div style="display:flex;align-items:center;gap:4px"><button class="step" data-stat="${k}" data-delta="-1">−</button><b>${c.stats[k]}</b><button class="step" data-stat="${k}" data-delta="1">+</button></div></div>`
    ).join('');
  }

  pickCreate(kind, value) {
    const c = this.creator;
    if (kind === 'hairStyle') c.appearance.hairStyle = Number(value);
    else if (['hairColor', 'outfitColor', 'skin'].includes(kind)) c.appearance[kind] = value;
    else c.appearance[kind] = value;
    this.game.audio.sfx('menu');
    this.renderCreator();
  }

  adjustStat(key, delta) {
    const c = this.creator;
    if (!STAT_KEYS.includes(key)) return;
    if (delta > 0 && c.points > 0 && c.stats[key] < 10) { c.stats[key]++; c.points--; }
    else if (delta < 0 && c.stats[key] > 3) { c.stats[key]--; c.points++; }
    else return;
    this.game.audio.sfx('menu');
    this.renderCreator();
  }

  randomizeCreator() {
    const c = this.creator;
    const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
    c.appearance = {
      hairStyle: pick(HAIR_STYLES).id,
      hairColor: pick(HAIR_COLORS),
      outfit: pick(OUTFIT_STYLES).id,
      outfitColor: pick(OUTFIT_COLORS),
      skin: pick(SKIN_TONES),
      accessory: pick(ACCESSORY_STYLES),
    };
    c.stats = { strength: 3, defense: 3, speed: 3, intelligence: 3, luck: 3 };
    c.points = 5;
    while (c.points > 0) { c.stats[pick(STAT_KEYS)]++; c.points--; }
    this.game.audio.sfx('confirm');
    this.renderCreator();
  }

  beginGame() {
    const name = (this.q('#name-input')?.value || this.creator.name || '').trim();
    if (name.length < 2 || name.length > 16) {
      this.modal({
        title: 'Nombre inválido',
        html: '<p>El nombre de tu heroína debe tener entre 2 y 16 caracteres.</p>',
        actions: [{ label: 'Volver a intentarlo', primary: true }],
      });
      this.q('#name-input')?.focus();
      return;
    }
    this.creator.name = name;
    this.game.audio.unlock();
    this.game.newGame({
      name,
      appearance: { ...this.creator.appearance },
      stats: { ...this.creator.stats },
    });
    this.showGame();
    this.updateContinueLabel();
  }

  openCreatorHelp() {
    this.modal({
      title: 'Cómo se juega',
      html: `<div class="help-block">
        <h4>Movimiento y combate</h4>
        <table>
          <tr><td>WASD / flechas</td><td>Mover a tu heroína</td></tr>
          <tr><td>J / Z / Espacio</td><td>Atacar con el arma equipada</td></tr>
          <tr><td>K / Mayús</td><td>Esquivar con invulnerabilidad breve</td></tr>
          <tr><td>Q (mantener)</td><td>Bloquear daño frontal</td></tr>
          <tr><td>X</td><td>Lanzar la magia activa</td></tr>
          <tr><td>E / Y</td><td>Interactuar, hablar, leer, viajar</td></tr>
          <tr><td>U / C</td><td>Cambiar de arma</td></tr>
          <tr><td>R</td><td>Capturar criatura débil o atacar con la activa</td></tr>
          <tr><td>Tab / 1</td><td>Usar poción rápida</td></tr>
          <tr><td>Esc / P</td><td>Abrir el diario y los menús</td></tr>
        </table>
        <h4>Progresión</h4>
        <p>Gana experiencia, aprende habilidades y recupera los tres fragmentos celestiales. Las criaturas salvajes se capturan cuando su vida baja del 42 %; después puedes entrenarlas, alimentarlas y evolucionarlas.</p>
      </div>`,
      actions: [{ label: 'Entendido', primary: true }],
    });
  }

  // ---------------------------------------------------------- menú
  openMenu(tab = 'stats') {
    this.menuOpen = true;
    this.setTab(tab || 'stats', true);
    document.getElementById('screen-menu')?.classList.remove('hidden');
    this.q('#dialogue-layer')?.classList.add('hidden');
    this.game.input.clearActions();
  }

  hideMenu() {
    document.getElementById('screen-menu')?.classList.add('hidden');
    this.menuOpen = false;
    this.game.input.clearActions();
  }

  setTab(tab, silent = false) {
    if (!TABS.some(t => t.id === tab)) tab = 'stats';
    this.activeTab = tab;
    this.lastTab = tab;
    if (!silent) this.game.audio.sfx('menu');
    this.renderMenu();
  }

  cycleTab(dir) {
    const idx = TABS.findIndex(t => t.id === this.activeTab);
    const next = (idx + dir + TABS.length) % TABS.length;
    this.setTab(TABS[next].id);
  }

  renderMenu() {
    if (!this.menuOpen) return;
    const p = this.game.player, s = this.game.state;
    if (!p || !s) return;
    const nav = this.q('#menu-nav');
    if (nav) {
      nav.innerHTML = TABS.map(t =>
        `<button class="nav-btn ${t.id === this.activeTab ? 'active' : ''}" data-tab="${t.id}">${icon(TAB_ICON[t.id])}<span>${t.label}</span></button>`
      ).join('');
    }
    const tab = TABS.find(t => t.id === this.activeTab) || TABS[0];
    this.q('#menu-heading').textContent = tab.heading;
    this.q('#menu-gold').textContent = fmt(p.gold);
    this.q('#menu-level').textContent = `Nv. ${p.level}`;
    this.q('#menu-time').textContent = timeText(s.playTime);
    const content = this.q('#menu-content');
    if (!content) return;
    content.innerHTML = renderTab(this, this.activeTab);
    const context = this.q('#menu-context');
    if (context) context.textContent = this.menuContextText();
    drawTabCanvases(this, this.activeTab);
    this.bindModalFreeInputs(content);
  }

  menuContextText() {
    const p = this.game.player;
    if (!p) return '';
    const map = {
      stats: `${p.className} · Nv. ${p.level}`,
      inventory: `${Object.values(p.inventory).reduce((a, b) => a + b, 0)} objetos · ${fmt(p.gold)} oro`,
      equipment: `${p.weaponDef?.name || 'Sin arma'} · defensa ${Math.round(p.defenseTotal)}`,
      skills: `${p.skillPoints} punto${p.skillPoints === 1 ? '' : 's'} disponible${p.skillPoints === 1 ? '' : 's'}`,
      map: `${this.game.zone?.name || ''} · ${this.game.state?.discovered?.length || 0}/${ZONE_ORDER.length} zonas`,
      quests: 'Misión principal y encargos del valle',
      creatures: `${p.creatures.length} criatura${p.creatures.length === 1 ? '' : 's'} · ${this.game.state?.stats?.captures || 0} capturas`,
      collection: `${new Set(p.creatures.map(c => c.species)).size}/${Object.keys(CREATURES).length} especies`,
      craft: `${fmt(p.gold)} oro · ${Object.keys(p.inventory).length} tipos de material`,
      shop: this.game.shopName || 'Bazar de Elio',
      save: 'Guardado local del navegador',
      settings: 'Audio · pantalla · controles',
      guide: 'Teclado · mando · táctil',
    };
    return map[this.activeTab] || '';
  }

  onMenuClick(e) {
    const el = e.target.closest('[data-act]');
    if (!el) return;
    e.preventDefault();
    handleTabAction(this, el.dataset.act, el, e);
  }

  onSettingInput(e) {
    const input = e.target.closest('[data-setting]');
    if (!input) return;
    const key = input.dataset.setting;
    const val = input.type === 'checkbox' ? input.checked : input.value;
    const g = this.game;
    if (['master', 'music', 'sfx', 'touchOpacity'].includes(key)) g.settings[key] = Number(val) / 100;
    else if (key === 'quality') g.settings.quality = Number(val);
    else if (key === 'touchSize') g.settings.touchSize = Number(val) / 100;
    else if (key === 'shake' || key === 'damageNumbers') g.settings[key] = !!val;
    g.saveSettings();
    this.applyVisualSettings();
    const row = input.closest('.setting-row');
    const out = row?.querySelector('output');
    if (out) out.textContent = key === 'quality' ? ['Baja', 'Media', 'Alta'][Number(val)] : (input.type === 'checkbox' ? (val ? 'Activado' : 'Desactivado') : `${Math.round(Number(val))}%`);
  }

  bindModalFreeInputs(root) {
    root.querySelectorAll('[data-setting]').forEach(input => {
      input.addEventListener('input', (e) => this.onSettingInput(e));
      input.addEventListener('change', (e) => this.onSettingInput(e));
    });
  }

  applyVisualSettings() {
    const st = this.game.settings || {};
    const root = document.documentElement.style;
    root.setProperty('--touch-opacity', String(st.touchOpacity ?? .82));
    root.setProperty('--touch-scale', String(st.touchSize ?? 1));
  }

  // ---------------------------------------------------------- HUD
  updateHUD(game = this.game) {
    const p = game.player, z = game.zone;
    if (!p || !z) return;
    const el = (id) => document.getElementById(id);
    if (el('hud-name')) el('hud-name').textContent = p.name;
    if (el('hud-class')) el('hud-class').textContent = p.className;
    if (el('hud-level')) el('hud-level').textContent = p.level;
    if (el('bar-hp')) el('bar-hp').style.width = pct(p.hp, p.maxHp);
    if (el('bar-mp')) el('bar-mp').style.width = pct(p.mana, p.maxMana);
    if (el('bar-sp')) el('bar-sp').style.width = pct(p.stamina, p.maxStamina);
    if (el('bar-xp')) el('bar-xp').style.width = pct(p.xp, p.xpNext);
    if (el('txt-hp')) el('txt-hp').textContent = `${Math.ceil(p.hp)} / ${Math.round(p.maxHp)}`;
    if (el('txt-mp')) el('txt-mp').textContent = `${Math.ceil(p.mana)} / ${Math.round(p.maxMana)}`;
    if (el('txt-sp')) el('txt-sp').textContent = `${Math.ceil(p.stamina)} / ${Math.round(p.maxStamina)}`;
    if (el('hud-gold')) el('hud-gold').textContent = fmt(p.gold);
    if (el('hud-zone')) el('hud-zone').textContent = z.name;
    if (el('hud-clock')) el('hud-clock').textContent = z.clock || '';
    if (el('mini-zone')) el('mini-zone').textContent = z.name.toUpperCase().slice(0, 11);
    if (el('quick-count')) el('quick-count').textContent = p.inventory.pocion || 0;
    const sig = JSON.stringify(p.appearance) + '|' + p.level;
    if (sig !== this._avatarSig) {
      this._avatarSig = sig;
      const av = el('avatar-canvas');
      if (av) game.renderer.drawAvatar(av, p.appearance);
    }
    if (game.currentBoss && !game.currentBoss.hidden && !game.currentBoss.dead) this.updateBoss(game.currentBoss);
    const prompt = el('interaction-prompt');
    if (prompt && !prompt.classList.contains('hidden') && this._promptText === undefined) this._promptText = '';
  }

  updateCreatureChip(game = this.game) {
    const name = document.getElementById('creature-name');
    const lv = document.getElementById('creature-lv');
    const cv = document.getElementById('creature-icon');
    if (!name || !lv || !cv) return;
    const inst = game.activeCreatureInst();
    if (!inst) {
      name.textContent = 'Sin criatura';
      lv.textContent = '—';
      const ctx = cv.getContext('2d');
      ctx.clearRect(0, 0, cv.width, cv.height);
      return;
    }
    const def = CREATURES[inst.species];
    name.textContent = inst.nickname || def?.name || inst.species;
    lv.textContent = `Nv. ${inst.level}`;
    drawCreatureIcon(cv, inst.species);
  }

  showBoss(e) {
    if (!e) return;
    document.getElementById('boss-wrap')?.classList.remove('hidden');
    this.updateBoss(e);
  }

  updateBoss(e) {
    if (!e) return;
    const wrap = document.getElementById('boss-wrap');
    if (!wrap) return;
    wrap.classList.remove('hidden');
    const name = document.getElementById('boss-name');
    const phase = document.getElementById('boss-phase');
    const fill = document.getElementById('boss-fill');
    if (name) name.textContent = e.def?.name || 'Guardián';
    if (phase) phase.textContent = `Fase ${['I', 'II', 'III'][Math.max(0, (e.phase || 1) - 1)]}`;
    if (fill) fill.style.width = pct(e.hp, e.maxHp);
  }

  hideBoss() {
    document.getElementById('boss-wrap')?.classList.add('hidden');
  }

  refreshQuest(game = this.game) {
    const info = game.getMainQuestInfo?.();
    if (!info) return;
    const title = document.getElementById('tracker-title');
    const text = document.getElementById('tracker-text');
    if (title) title.textContent = info.title;
    if (text) text.textContent = info.text;
  }

  questPulse() {
    const tracker = document.getElementById('quest-tracker');
    if (!tracker) return;
    tracker.classList.remove('pulse');
    void tracker.offsetWidth;
    tracker.classList.add('pulse');
    setTimeout(() => tracker.classList.remove('pulse'), 1800);
  }

  zoneBanner(zone) {
    if (!zone) return;
    this._banner?.remove();
    const banner = document.createElement('div');
    banner.className = 'zone-banner';
    banner.innerHTML = `<span>${esc(zone.region || 'Valle de Lumen')}</span><strong>${esc(zone.name)}</strong><small>${esc(zone.subtitle || '')}</small>`;
    document.getElementById('app')?.appendChild(banner);
    this._banner = banner;
    this._bannerUntil = performance.now() + 3300;
    requestAnimationFrame(() => banner.classList.add('show'));
    setTimeout(() => {
      banner.classList.remove('show');
      setTimeout(() => banner.remove(), 600);
    }, 2600);
  }

  spellFlash(spell) {
    if (!spell) return;
    const el = document.createElement('div');
    el.className = 'spell-flash';
    el.style.setProperty('--spell', spell.color || '#ffe6a8');
    el.innerHTML = `${icon(spell.icon || 'celestial')}<span>${esc(spell.name)}</span>`;
    document.getElementById('hud')?.appendChild(el);
    setTimeout(() => el.remove(), 950);
  }

  toast(text, kind = '') {
    // No tapar el cartel de zona: encola los avisos hasta que termine.
    if (this._bannerUntil && performance.now() < this._bannerUntil) {
      this._toastQueue = this._toastQueue || [];
      this._toastQueue.push([text, kind]);
      if (!this._toastTimer) {
        this._toastTimer = setTimeout(() => {
          const queue = this._toastQueue || [];
          this._toastQueue = [];
          this._toastTimer = null;
          this._bannerUntil = 0;
          queue.forEach(([t, k]) => this.toast(t, k));
        }, Math.max(350, this._bannerUntil - performance.now() + 80));
      }
      return;
    }
    const stack = document.getElementById('toast-stack');
    if (!stack) return;
    const div = document.createElement('div');
    div.className = `toast ${kind}`.trim();
    const ico = kind === 'bad' ? 'close' : kind === 'gold' ? 'star' : kind === 'good' ? 'check' : 'celestial';
    div.innerHTML = `${icon(ico)}<span>${esc(text)}</span>`;
    stack.appendChild(div);
    while (stack.children.length > 4) stack.firstElementChild.remove();
    setTimeout(() => {
      div.classList.add('out');
      setTimeout(() => div.remove(), 300);
    }, 3300);
  }

  damageFlash() {
    const flash = document.getElementById('damage-flash');
    if (!flash) return;
    flash.classList.add('on');
    clearTimeout(this._dmgTimer);
    this._dmgTimer = setTimeout(() => flash.classList.remove('on'), 150);
  }

  setPrompt(text, key = 'Y') {
    const prompt = document.getElementById('interaction-prompt');
    if (!prompt) return;
    if (!text) {
      prompt.classList.add('hidden');
      this._promptText = undefined;
      return;
    }
    prompt.classList.remove('hidden');
    this._promptText = text;
    const t = document.getElementById('interaction-text');
    if (t) t.textContent = text;
    const k = prompt.querySelector('.key');
    if (k) k.textContent = key;
  }

  // ---------------------------------------------------------- diálogo
  dialogue(opts = {}) {
    const pages = Array.isArray(opts.pages) ? opts.pages.filter(Boolean) : [opts.pages].filter(Boolean);
    if (!pages.length) return;
    this.dialogueState = {
      name: opts.name || 'Habitante', npc: opts.npc || null,
      pages, choices: opts.choices || null, onEnd: opts.onEnd || null,
      page: 0, chars: 0, done: false, shownChoices: false,
    };
    this.dialogueOpen = true;
    this.game.overlay = true;
    this.game.input.clearActions();
    document.getElementById('dialogue-layer')?.classList.remove('hidden');
    const name = document.getElementById('dialogue-name');
    const text = document.getElementById('dialogue-text');
    const choices = document.getElementById('dialogue-choices');
    const next = document.getElementById('dialogue-next');
    if (name) name.textContent = this.dialogueState.name;
    if (text) text.textContent = '';
    if (choices) choices.innerHTML = '';
    if (next) next.classList.remove('hidden');
    if (opts.npc) {
      const cv = document.getElementById('dialogue-portrait');
      if (cv) drawNpcPortrait(cv, opts.npc);
    }
    this.renderDialoguePage();
  }

  renderDialoguePage() {
    const d = this.dialogueState;
    if (!d) return;
    const text = document.getElementById('dialogue-text');
    if (text) text.textContent = '';
    const choices = document.getElementById('dialogue-choices');
    if (choices) choices.innerHTML = '';
    const next = document.getElementById('dialogue-next');
    if (next) next.classList.remove('hidden');
    d.chars = 0;
    d.done = false;
    d.shownChoices = false;
  }

  advanceDialogue() {
    const d = this.dialogueState;
    if (!d) return;
    const page = d.pages[d.page] || '';
    if (!d.done) {
      d.chars = page.length;
      d.done = true;
      this.paintDialogue();
      if (d.page === d.pages.length - 1 && d.choices) this.showDialogueChoices();
      return;
    }
    if (d.page < d.pages.length - 1) {
      d.page++;
      this.renderDialoguePage();
      return;
    }
    if (d.choices) { this.showDialogueChoices(); return; }
    this.closeDialogue(true);
  }

  paintDialogue() {
    const d = this.dialogueState;
    if (!d) return;
    const page = d.pages[d.page] || '';
    const text = document.getElementById('dialogue-text');
    if (text) text.textContent = page.slice(0, Math.floor(d.chars));
    if (d.done && d.page === d.pages.length - 1 && d.choices) this.showDialogueChoices();
  }

  showDialogueChoices() {
    const d = this.dialogueState;
    if (!d || !d.choices || d.shownChoices) return;
    d.shownChoices = true;
    d.done = true;
    const choices = document.getElementById('dialogue-choices');
    const next = document.getElementById('dialogue-next');
    if (next) next.classList.add('hidden');
    if (!choices) return;
    choices.innerHTML = '';
    d.choices.forEach((c, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.textContent = c.label;
      b.addEventListener('click', (e) => {
        e.stopPropagation();
        this.game.audio.sfx('confirm');
        this.closeDialogue(false);
        c.action?.();
        if (d.onEnd) d.onEnd();
      });
      choices.appendChild(b);
    });
  }

  closeDialogue(callEnd = false) {
    const d = this.dialogueState;
    this.dialogueState = null;
    this.dialogueOpen = false;
    document.getElementById('dialogue-layer')?.classList.add('hidden');
    this.game.overlay = false;
    this.game.input.clearActions();
    if (callEnd && d?.onEnd) d.onEnd();
  }

  // ---------------------------------------------------------- modal
  modal(opts = {}) {
    this._modalPrevOverlay = this.game.overlay;
    this._modalActions = opts.actions || [{ label: 'Cerrar', primary: true }];
    this.modalOpen = true;
    this.game.overlay = true;
    this.game.input.clearActions();
    const layer = document.getElementById('modal-layer');
    const card = document.getElementById('modal-card');
    if (!layer || !card) return;
    card.innerHTML = `
      <h3>${esc(opts.title || 'Aviso')}</h3>
      <div class="modal-body">${opts.html || ''}</div>
      <div class="modal-actions">${this._modalActions.map((a, i) =>
        `<button type="button" class="mini-btn ${a.primary ? 'gold' : ''} ${a.danger ? 'danger' : ''}" data-modal-action="${i}">${esc(a.label)}</button>`
      ).join('')}</div>`;
    layer.classList.remove('hidden');
    this.bindModalFreeInputs(card);
    opts.onMount?.(card);
    setTimeout(() => card.querySelector('button, input')?.focus?.(), 20);
  }

  closeModal() {
    this.modalOpen = false;
    document.getElementById('modal-layer')?.classList.add('hidden');
    const card = document.getElementById('modal-card');
    if (card) card.innerHTML = '';
    this.game.input.clearActions();
    if (this._modalPrevOverlay !== undefined) this.game.overlay = this._modalPrevOverlay;
    this._modalPrevOverlay = undefined;
    this._modalActions = null;
  }

  confirm(title, text, onYes, yesLabel = 'Confirmar') {
    this.modal({
      title,
      html: `<p>${esc(text)}</p>`,
      actions: [
        { label: 'Cancelar' },
        { label: yesLabel, primary: true, action: onYes },
      ],
    });
  }

  openRename(uid) {
    const inst = this.game.player?.creatures.find(c => c.uid === uid);
    if (!inst) return;
    const current = inst.nickname || CREATURES[inst.species]?.name || '';
    let draft = inst.nickname || '';
    this.modal({
      title: 'Renombrar criatura',
      html: `<label class="field"><span>Nombre (2–16 caracteres; vacío restaura el original)</span><input id="rename-input" maxlength="16" value="${esc(inst.nickname || '')}" placeholder="${esc(current)}" autocomplete="off"></label>`,
      actions: [
        { label: 'Cancelar' },
        { label: 'Guardar nombre', primary: true, action: () => {
          const v = draft.trim();
          if (v.length === 1) { this.toast('El nombre es demasiado corto.', 'bad'); return; }
          this.game.renameCreature(uid, v);
          this.creatureSel = uid;
          this.renderMenu();
        } },
      ],
      onMount: (card) => {
        const input = card.querySelector('#rename-input');
        input?.addEventListener('input', () => { draft = input.value; });
        setTimeout(() => input?.focus(), 30);
      },
    });
  }

  // ---------------------------------------------------------- ajustes / créditos
  settingsHtml() {
    const s = this.game.settings;
    const vol = (key, label, hint) => `
      <div class="setting-row"><div><label for="set-${key}">${label}</label><small>${hint}</small></div>
      <input id="set-${key}" type="range" min="0" max="100" step="1" value="${Math.round((s[key] ?? .5) * 100)}" data-setting="${key}"><output>${Math.round((s[key] ?? .5) * 100)}%</output></div>`;
    return `<div class="settings-panel">
      ${vol('master', 'Volumen general', 'Afecta a música y efectos')}
      ${vol('music', 'Música', 'Melodías sintetizadas en tiempo real')}
      ${vol('sfx', 'Efectos', 'Golpes, magia, pasos y avisos')}
      <div class="setting-row"><div><label for="set-quality">Calidad visual</label><small>Partículas, luces y clima</small></div>
        <select id="set-quality" class="setting-select" data-setting="quality">
          <option value="0" ${s.quality === 0 ? 'selected' : ''}>Baja</option>
          <option value="1" ${s.quality === 1 ? 'selected' : ''}>Media</option>
          <option value="2" ${s.quality === 2 ? 'selected' : ''}>Alta</option>
        </select><output>${['Baja', 'Media', 'Alta'][s.quality ?? 2]}</output></div>
      <div class="setting-row"><div><label for="set-shake">Sacudida de cámara</label><small>Impactos y ataques de jefes</small></div>
        <input id="set-shake" type="checkbox" data-setting="shake" ${s.shake !== false ? 'checked' : ''}><output>${s.shake !== false ? 'Activado' : 'Desactivado'}</output></div>
      <div class="setting-row"><div><label for="set-damageNumbers">Números de daño</label><small>Muestra el daño flotante</small></div>
        <input id="set-damageNumbers" type="checkbox" data-setting="damageNumbers" ${s.damageNumbers !== false ? 'checked' : ''}><output>${s.damageNumbers !== false ? 'Activado' : 'Desactivado'}</output></div>
      ${vol('touchOpacity', 'Opacidad táctil', 'Controles en pantallas táctiles')}
      ${vol('touchSize', 'Tamaño táctil', 'Escala de joystick y botones')}
      <div class="setting-row"><div><label>Probar sonido</label><small>Comprueba el audio del navegador</small></div><button class="mini-btn" data-act="test-sound">Reproducir</button></div>
    </div>`;
  }

  openSettingsModal() {
    this.modal({
      title: 'Ajustes',
      html: this.settingsHtml() + `<p class="scope-note">${icon('lock')} Los ajustes se guardan en este navegador. El audio necesita una interacción para activarse.</p>`,
      actions: [{ label: 'Cerrar', primary: true }],
    });
  }

  openCredits() {
    this.modal({
      title: 'La Espada Celestial',
      html: `<div class="credits">
        <p><strong>Un RPG de acción, magia y criaturas coleccionables.</strong> Arte, música, efectos y mundo se generan proceduralmente en Canvas 2D y Web Audio. No se descarga ningún recurso externo.</p>
        <p><strong>Controles:</strong> teclado, mando estándar (Gamepad API) y pantalla táctil. En Android, el juego funciona en el navegador; no se distribuye como aplicación nativa ni usa Bluetooth directamente.</p>
        <p><strong>Guardado:</strong> tres ranuras manuales y guardado automático en santuarios, capturas y jefes, almacenados en <code>localStorage</code> de este navegador.</p>
        <p><strong>Alcance web:</strong> no hay exportación APK, vibración garantizada, compras reales ni multijugador. Los mandos Bluetooth funcionan si el sistema y el navegador los exponen como gamepad estándar.</p>
        <p>Versión 1.0 · Hecho para jugar sin instalaciones.</p>
      </div>`,
      actions: [{ label: 'Volver', primary: true }],
    });
  }

  // ---------------------------------------------------------- final / derrota
  showGameOver() {
    this.gameOverShown = true;
    this.game.overlay = true;
    document.getElementById('screen-gameover')?.classList.remove('hidden');
    document.getElementById('screen-gameover')?.classList.remove('hidden');
    this.q('#dialogue-layer')?.classList.add('hidden');
  }

  hideGameOver() {
    this.gameOverShown = false;
    document.getElementById('screen-gameover')?.classList.add('hidden');
  }

  showLoadDialog() {
    const saves = this.game.getSaves?.() || {};
    const entries = Object.entries(saves).sort((a, b) => (b[1]?.timestamp || 0) - (a[1]?.timestamp || 0));
    if (!entries.length) {
      this.toast('No hay partidas guardadas para cargar.', 'bad');
      return;
    }
    const actions = entries.map(([slot, d]) => ({
      label: `${String(slot) === 'auto' ? 'Auto' : 'Ranura ' + slot} · ${d.player?.name || 'Astra'} Nv.${d.player?.level || 1}`,
      action: () => {
        this.hideGameOver();
        this.game.deathTimer = 0;
        if (!this.game.load(slot)) this.showGameOver();
        else this.showGame();
      },
    }));
    actions.push({ label: 'Cancelar' });
    this.modal({ title: 'Cargar partida', html: '<p>Elige una partida guardada. La partida actual sin guardar se perderá.</p>', actions });
  }

  showEnding(game = this.game) {
    this.endingShown = true;
    game.overlay = true;
    const s = game.state, p = game.player;
    const title = document.getElementById('ending-title');
    const text = document.getElementById('ending-text');
    const stats = document.getElementById('ending-stats');
    if (title) title.textContent = 'La Espada Celestial';
    if (text) text.textContent = `El Avatar del Eclipse se disuelve en polvo de estrellas. ${p.name} alza la espada forjada y el valle vuelve a respirar. Las criaturas que la acompañaron levantan la mirada hacia un cielo que, por fin, recuerda su nombre.`;
    if (stats) {
      stats.innerHTML = [
        ['Nivel', p.level],
        ['Tiempo', timeText(s.playTime)],
        ['Enemigos', fmt(s.stats.kills)],
        ['Criaturas', p.creatures.length],
        ['Capturas', fmt(s.stats.captures)],
        ['Jefes', fmt(s.stats.bosses)],
      ].map(([k, v]) => `<div><b>${esc(v)}</b>${esc(k)}</div>`).join('');
    }
    document.getElementById('screen-ending')?.classList.remove('hidden');
    document.getElementById('hud')?.classList.add('hidden');
  }

  hideEnding() {
    this.endingShown = false;
    document.getElementById('screen-ending')?.classList.add('hidden');
    document.getElementById('hud')?.classList.remove('hidden');
    this.game.overlay = false;
    this.game.screen = 'playing';
    if (this.game.zone) this.game.audio.music(this.game.zone.music || 'village');
    this.updateHUD(this.game);
  }

  // ---------------------------------------------------------- bucle UI
  takeBack() {
    const a = this.game.input;
    const b = a.consume('back');
    const p = a.consume('pause');
    return b || p;
  }

  tick(dt) {
    const input = this.game.input;
    if (this.dialogueOpen) {
      const d = this.dialogueState;
      if (d && !d.done) {
        d.chars += dt * 62;
        const page = d.pages[d.page] || '';
        if (d.chars >= page.length) { d.chars = page.length; d.done = true; }
        this.paintDialogue();
      }
      if (input.consume('confirm') || input.consume('interact') || input.consume('attack') || input.consume('jump') || this.takeBack()) this.advanceDialogue();
      if (input.consume('up') || input.consume('down') || input.consume('left') || input.consume('right')) { /* evita mover el mundo */ }
      return;
    }
    if (this.modalOpen) {
      if (this.takeBack() || input.consume('confirm')) this.closeModal();
      return;
    }
    if (this.menuOpen) {
      if (this.takeBack()) { this.game.closeMenu(); return; }
      if (input.consume('left')) { this.cycleTab(-1); return; }
      if (input.consume('right')) { this.cycleTab(1); return; }
      return;
    }
    if (this.game.screen === 'playing' && !this.game.overlay && !this.game.paused) {
      if (input.consume('map')) { this.game.openMenu('map'); return; }
    }
  }

  tickTitle() { /* el renderizador anima el cielo del título */ }
  tickCreate() { /* la vista previa es estática */ }
}
