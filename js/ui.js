// Interfaz: HUD, menús, creación de personaje, tienda, diálogos, cinemáticas y controles táctiles.

import { CLASSES, WEAPONS, ARMORS, SHIELDS, ACCESSORIES, ITEMS, SPELLS, CREATURES, ENEMIES, QUESTS, ACHIEVEMENTS, CONTROL_INFO, TIPS, ZONE_INFO } from './data.js';
import { clamp, formatTime, formatNumber, escapeHtml, hexToRgba, listSaves, deleteSave, readSave, storageAvailable } from './core.js';
import { icon } from './icons.js';
import { drawPlayer, drawPortrait, drawGlow, drawStar, drawEllipse, SKIN_TONES, HAIR_COLORS, OUTFIT_COLORS } from './art.js';

const STAT_NAMES = { vit: 'Vitalidad', str: 'Fuerza', def: 'Defensa', spd: 'Velocidad', int: 'Inteligencia', luck: 'Suerte' };
const STAT_ICONS = { vit: 'heart', str: 'sword', def: 'shield', spd: 'boot', int: 'mana', luck: 'star' };
const SLOT_NAMES = { weapon: 'Arma', armor: 'Armadura', shield: 'Escudo', accessory: 'Accesorio' };

const RANDOM_NAMES = ['Aria', 'Kaelen', 'Lyra', 'Soren', 'Mira', 'Elian', 'Neria', 'Dorian', 'Yuna', 'Cael', 'Selene', 'Rook', 'Aster', 'Vesper', 'Iris', 'Thane'];
const HAIR_STYLE_NAMES = ['Corto', 'Largo', 'Coleta', 'Trenza', 'Salvaje'];

const el = (id) => document.getElementById(id);
const qs = (sel, root = document) => root.querySelector(sel);
const qsa = (sel, root = document) => [...root.querySelectorAll(sel)];

const itemIcon = (def, fallback = 'star') => icon(def?.icon || fallback);
const itemColor = (def) => def?.color || (def?.tier >= 4 ? '#ffe6a0' : def?.tier === 3 ? '#c9a6ff' : def?.tier === 2 ? '#8fd8ff' : '#9aa8c2');

export class UI {
  constructor(game) {
    this.game = game;
    this.draft = null;
    this.previewRaf = 0;
    this.previewT = 0;
    this.pauseTab = 'summary';
    this.shopTab = 'buy';
    this.shopNpc = 'sela';
    this.shopSelected = null;
    this.selectedItem = null;
    this.modalReturn = 'title';
    this.dialogueState = null;
    this.cineState = null;
    this.editingTouch = false;
    this.dragState = null;
    this.lastHud = 0;
    this.lastMinimap = 0;
    this.hudDirty = true;
    this.toastCount = 0;
    this.confirmCallback = null;
    this.bound = false;
    this.init();
  }

  init() {
    // Iconos estáticos.
    for (const node of qsa('[data-icon]')) {
      if (!node.firstElementChild) node.innerHTML = icon(node.dataset.icon);
    }
    this.buildCreation();
    this.bindEvents();
    this.bindTouch();
    this.updateTitle();
    this.applyTouchLayout();
    this.updateAudioButton();
    this.updateTouchVisibility();
    window.addEventListener('resize', () => this.onResize());
    window.addEventListener('orientationchange', () => setTimeout(() => this.onResize(), 200));
    this.onResize();
  }

  bindEvents() {
    if (this.bound) return;
    this.bound = true;
    document.addEventListener('click', (e) => {
      const actionEl = e.target.closest('[data-action]');
      if (actionEl) {
        const action = actionEl.dataset.action;
        // No procesar acciones mientras se edita la disposición táctil.
        if (this.editingTouch && actionEl.closest('#touch-controls') && actionEl.dataset.drag) {
          e.preventDefault();
          return;
        }
        this.game.audio.unlock();
        this.handleAction(action, actionEl, e);
        return;
      }
      const choice = e.target.closest('[data-choice]');
      if (choice) {
        this.game.audio.unlock();
        this.selectDialogueChoice(Number(choice.dataset.choice));
        return;
      }
      if (e.target.closest('#dialogue')) this.advanceDialogue();
    });

    // Actualización en vivo de ajustes.
    document.addEventListener('input', (e) => {
      const input = e.target;
      if (input.id === 'create-name' && this.draft) {
        this.draft.name = input.value;
        const preview = el('preview-name');
        if (preview) preview.textContent = input.value.trim() || 'Héroe';
      }
      if (input.dataset.setting) {
        let val = input.type === 'checkbox' ? input.checked : input.value;
        if (input.type === 'range') val = Number(val);
        this.game.updateSetting(input.dataset.setting, val);
        this.applyTouchLayout();
        this.updateAudioButton();
      }
    });

    document.addEventListener('change', (e) => {
      const input = e.target;
      if (input.dataset.setting) {
        let val = input.type === 'checkbox' ? input.checked : input.value;
        if (input.type === 'range') val = Number(val);
        this.game.updateSetting(input.dataset.setting, val);
        this.applyTouchLayout();
      }
    });

    // Solo los menús que no controla el bucle principal. El resto de escenas
    // (juego, pausa, diálogo, cinemática y menú rápido) se gestionan en Game.
    window.addEventListener('keydown', (e) => {
      if (e.code !== 'Escape') return;
      if (this.game.scene === 'shop') {
        e.preventDefault();
        this.game.closeShop();
      } else if (this.game.scene === 'modal') {
        e.preventDefault();
        this.closeModal();
      }
    });

    // Evitar menú contextual del botón derecho en el juego.
    document.addEventListener('contextmenu', (e) => { if (e.target.closest('#app')) e.preventDefault(); });

    // Pausa automática al perder el foco.
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && this.game.scene === 'playing') this.game.togglePause(true);
    });
  }

  handleAction(action, target, ev) {
    const g = this.game;
    switch (action) {
      case 'new-game': g.showCreation(); break;
      case 'continue': g.continueLatest(); break;
      case 'load-menu': this.openLoadMenu(target.dataset.from || (g.scene === 'paused' ? 'pause' : 'title')); break;
      case 'settings': this.openSettings(target.dataset.from || 'title'); break;
      case 'how-to': this.openHowTo(); break;
      case 'credits': this.openCredits(); break;
      case 'back-title': g.backToTitle(); break;
      case 'random-name': this.randomName(); break;
      case 'select-class': this.selectClass(target.dataset.class); break;
      case 'set-hair-style': this.setAppearance('hairStyle', Number(target.dataset.value)); break;
      case 'set-hair-color': this.setAppearance('hair', target.dataset.value); break;
      case 'set-skin': this.setAppearance('skin', target.dataset.value); break;
      case 'set-outfit': this.setAppearance('outfit', target.dataset.value); break;
      case 'start-game': g.startNewGame(this.draft); break;
      case 'pause': g.togglePause(); break;
      case 'resume': g.resume(); break;
      case 'quick': g.openQuick(); break;
      case 'close-quick': g.closeQuick(); break;
      case 'quit-title': g.confirmQuit(); break;
      case 'pause-tab': this.renderPause(target.dataset.tab); break;
      case 'close-modal': this.closeModal(); break;
      case 'close-shop': g.closeShop(); break;
      case 'shop-tab': this.renderShop(target.dataset.tab); break;
      case 'select-shop-item': this.shopSelected = target.dataset.id; this.renderShopDetail(); break;
      case 'buy-item': this.buySelected(); break;
      case 'sell-item': this.sellSelected(); break;
      case 'forge-upgrade': this.forgeUpgrade(); break;
      case 'select-item': this.selectedItem = target.dataset.id; this.renderPause('inventory'); break;
      case 'use-item': g.useItem(target.dataset.id); this.renderPause('inventory'); this.hudDirty = true; break;
      case 'drop-item': g.dropItem(target.dataset.id); this.selectedItem = null; this.renderPause('inventory'); break;
      case 'equip-item': g.equipItem(target.dataset.id, target.dataset.type); this.renderPause('equipment'); this.hudDirty = true; break;
      case 'equip-spell': g.equipSpell(target.dataset.id); this.renderPause('skills'); this.hudDirty = true; break;
      case 'equip-creature': g.equipCreature(target.dataset.id); this.renderPause('creatures'); this.hudDirty = true; break;
      case 'alloc-stat': g.allocateStat(target.dataset.stat); this.renderPause('summary'); this.hudDirty = true; break;
      case 'save-slot': this.saveSlot(target.dataset.slot); break;
      case 'load-slot': this.loadSlot(target.dataset.slot); break;
      case 'delete-slot': this.confirmDeleteSlot(target.dataset.slot); break;
      case 'toggle-setting': this.toggleSetting(target.dataset.setting); break;
      case 'edit-touch': this.startTouchEditor(); break;
      case 'reset-touch': g.resetTouchLayout(); this.applyTouchLayout(); break;
      case 'touch-reset': g.resetTouchLayout(); this.applyTouchLayout(); break;
      case 'touch-editor-done': this.finishTouchEditor(); break;
      case 'toggle-audio': g.toggleAudio(); this.updateAudioButton(); break;
      case 'fullscreen': g.toggleFullscreen(); break;
      case 'respawn': g.respawn(); break;
      case 'ending-continue': g.endingContinue(); break;
      case 'ending-credits': this.openCredits(true); break;
      case 'cine-next': this.advanceCinematic(); break;
      case 'cine-skip': this.skipCinematic(); break;
      case 'weapon-cycle': g.cycleWeapon(); break;
      case 'spell-cycle': g.cycleSpell(); break;
      case 'creature-summon': g.summonCreature(); break;
      case 'quick-spell': g.castSpell(Number(target.dataset.index)); g.closeQuick(); break;
      case 'quick-potion': g.quickPotion(); g.closeQuick(); break;
      case 'quick-creature': g.summonCreature(); g.closeQuick(); break;
      case 'quick-weapon': g.cycleWeapon(); this.renderQuick(); break;
      case 'confirm-yes': {
        const cb = this.confirmCallback; this.confirmCallback = null;
        this.closeModal();
        cb?.();
        break;
      }
      case 'confirm-no': this.confirmCallback = null; this.closeModal(); break;
      case 'open-controls': this.openHowTo(); break;
      default: break;
    }
  }

  // -------------------------------------------------------------------------
  // TÍTULO
  // -------------------------------------------------------------------------

  updateTitle() {
    const saves = listSaves();
    const list = Object.entries(saves).filter(([, v]) => v);
    list.sort((a, b) => (b[1].timestamp || 0) - (a[1].timestamp || 0));
    const btn = el('btn-continue');
    const sub = el('continue-sub');
    if (!btn) return;
    if (list.length) {
      const latest = list[0][1];
      const slotName = list[0][0] === 'auto' ? 'Autoguardado' : `Ranura ${list[0][0]}`;
      sub.textContent = `${latest.player?.name || 'Héroe'} · Nv. ${latest.player?.level || 1} · ${slotName}`;
      btn.classList.remove('is-disabled');
      btn.disabled = false;
    } else {
      sub.textContent = 'Sin partida guardada';
      btn.classList.add('is-disabled');
      btn.disabled = false;
    }
  }

  showTitle() {
    this.cancelPreview();
    this.showScreen('title');
    this.updateTitle();
    el('hud').classList.add('hidden');
    this.setTouchVisible(false);
    document.body.classList.remove('dialogue-open');
    this.hidePrompt();
  }

  showScreen(name) {
    for (const id of ['screen-title', 'screen-create', 'screen-pause', 'screen-shop', 'screen-quick', 'screen-modal', 'screen-gameover', 'screen-ending']) {
      const node = el(id);
      if (node) node.classList.toggle('hidden', id !== `screen-${name}`);
    }
    if (name !== 'create') this.cancelPreview();
  }

  hideAllScreens() {
    for (const id of ['screen-title', 'screen-create', 'screen-pause', 'screen-shop', 'screen-quick', 'screen-modal', 'screen-gameover', 'screen-ending']) {
      const node = el(id);
      if (node) node.classList.add('hidden');
    }
    this.cancelPreview();
  }

  // -------------------------------------------------------------------------
  // CREACIÓN
  // -------------------------------------------------------------------------

  buildCreation() {
    const cards = el('class-cards');
    if (cards) {
      cards.innerHTML = Object.values(CLASSES).map((c) => {
        const stats = [c.stats.vit, c.stats.str, c.stats.def, c.stats.spd, c.stats.int, c.stats.luck];
        return `<button class="class-card" data-action="select-class" data-class="${c.id}">
          <div class="class-icon">${icon(c.weapon === 'baston_aether' ? 'staff' : c.weapon === 'mandoble_ceniza' ? 'greatsword' : 'sword')}</div>
          <b>${c.name}</b><small>${c.tag}</small>
          <div class="mini-stats">${stats.map((v) => `<i style="--v:${clamp(v / 12 * 100, 20, 100)}%"></i>`).join('')}</div>
        </button>`;
      }).join('');
    }
    const hs = el('hair-styles');
    if (hs) hs.innerHTML = HAIR_STYLE_NAMES.map((n, i) => `<button class="swatch hair-style" data-action="set-hair-style" data-value="${i}" title="${n}">${n.slice(0, 2)}</button>`).join('');
    const hc = el('hair-colors');
    if (hc) hc.innerHTML = HAIR_COLORS.map((c) => `<button class="swatch" data-action="set-hair-color" data-value="${c}" style="--c:${c}" aria-label="Cabello ${c}"></button>`).join('');
    const sc = el('skin-colors');
    if (sc) sc.innerHTML = SKIN_TONES.map((c) => `<button class="swatch" data-action="set-skin" data-value="${c}" style="--c:${c}" aria-label="Piel ${c}"></button>`).join('');
    const oc = el('outfit-colors');
    if (oc) oc.innerHTML = OUTFIT_COLORS.map((c) => `<button class="swatch" data-action="set-outfit" data-value="${c}" style="--c:${c}" aria-label="Vestimenta ${c}"></button>`).join('');
  }

  resetDraft() {
    const cls = CLASSES.caballero;
    this.draft = {
      name: RANDOM_NAMES[Math.floor(Math.random() * RANDOM_NAMES.length)],
      classId: 'caballero',
      appearance: {
        hairStyle: 1,
        hair: cls.portraitHair,
        skin: SKIN_TONES[0],
        outfit: cls.colors.outfit,
        accent: cls.colors.accent,
        cloak: cls.colors.cloak,
      },
    };
    const nameInput = el('create-name');
    if (nameInput) nameInput.value = this.draft.name;
  }

  showCreation() {
    if (!this.draft) this.resetDraft();
    const nameInput = el('create-name');
    if (nameInput) {
      if (!nameInput.value.trim()) nameInput.value = this.draft.name || 'Aria';
      this.draft.name = nameInput.value;
    }
    this.showScreen('create');
    this.renderCreation();
    this.startPreview();
  }

  renderCreation() {
    const d = this.draft;
    if (!d) return;
    const cls = CLASSES[d.classId];
    for (const card of qsa('.class-card')) card.classList.toggle('active', card.dataset.class === d.classId);
    for (const sw of qsa('[data-action="set-hair-style"]')) sw.classList.toggle('active', Number(sw.dataset.value) === d.appearance.hairStyle);
    for (const sw of qsa('[data-action="set-hair-color"]')) sw.classList.toggle('active', sw.dataset.value === d.appearance.hair);
    for (const sw of qsa('[data-action="set-skin"]')) sw.classList.toggle('active', sw.dataset.value === d.appearance.skin);
    for (const sw of qsa('[data-action="set-outfit"]')) sw.classList.toggle('active', sw.dataset.value === d.appearance.outfit);
    el('preview-name').textContent = d.name || 'Héroe';
    el('preview-class').textContent = cls.name;
    el('preview-tag').textContent = cls.tag;
    const weapon = WEAPONS[cls.weapon];
    el('preview-weapon').innerHTML = `${icon(weapon.icon)} ${weapon.name} · ${weapon.damage} daño`;
    const stats = el('create-stats');
    if (stats) {
      stats.innerHTML = Object.entries(cls.stats).map(([k, v]) => `<div class="stat-pill"><span>${STAT_NAMES[k]}</span><b>${v}</b></div>`).join('');
    }
    const nameInput = el('create-name');
    if (nameInput && nameInput.value !== d.name) nameInput.value = d.name;
    this.drawPreview();
  }

  selectClass(id) {
    if (!CLASSES[id]) return;
    const cls = CLASSES[id];
    this.draft.classId = id;
    this.draft.appearance.outfit = cls.colors.outfit;
    this.draft.appearance.accent = cls.colors.accent;
    this.draft.appearance.cloak = cls.colors.cloak;
    this.renderCreation();
    this.game.audio.sfx('ui');
  }

  setAppearance(key, value) {
    this.draft.appearance[key] = value;
    this.renderCreation();
    this.game.audio.sfx('ui');
  }

  randomName() {
    const current = this.draft.name;
    let name = current;
    while (name === current) name = RANDOM_NAMES[Math.floor(Math.random() * RANDOM_NAMES.length)];
    this.draft.name = name;
    el('create-name').value = name;
    this.renderCreation();
    this.game.audio.sfx('ui');
  }

  startPreview() {
    this.cancelPreview();
    const loop = (ts) => {
      if (el('screen-create').classList.contains('hidden')) return;
      this.previewT = ts / 1000;
      this.drawPreview();
      this.previewRaf = requestAnimationFrame(loop);
    };
    this.previewRaf = requestAnimationFrame(loop);
  }

  cancelPreview() {
    if (this.previewRaf) cancelAnimationFrame(this.previewRaf);
    this.previewRaf = 0;
  }

  drawPreview() {
    const canvas = el('create-portrait');
    if (!canvas || !this.draft) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const W = 220, H = 260;
    if (canvas.width !== W * dpr) { canvas.width = W * dpr; canvas.height = H * dpr; }
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    const cls = CLASSES[this.draft.classId];
    // Fondo.
    const bg = ctx.createRadialGradient(W / 2, H * 0.42, 10, W / 2, H * 0.45, H * 0.7);
    bg.addColorStop(0, 'rgba(232,197,106,.16)');
    bg.addColorStop(0.55, 'rgba(20,32,56,.45)');
    bg.addColorStop(1, 'rgba(5,8,16,0)');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);
    // Anillos.
    ctx.save();
    ctx.translate(W / 2, 222);
    ctx.strokeStyle = 'rgba(232,197,106,.2)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath(); ctx.ellipse(0, 0, 52 + i * 17, 12 + i * 4, 0, 0, Math.PI * 2); ctx.stroke();
    }
    ctx.restore();
    // Partículas.
    for (let i = 0; i < 9; i++) {
      const a = this.previewT * 0.4 + i * 1.7;
      const x = W / 2 + Math.cos(a) * (55 + i * 4);
      const y = 60 + Math.sin(a * 1.3) * 45 + i * 3;
      drawGlow(ctx, x, y, 5, '#ffe6a0', 0.25);
      ctx.fillStyle = 'rgba(255,243,196,.55)';
      ctx.beginPath(); ctx.arc(x, y, 1, 0, Math.PI * 2); ctx.fill();
    }
    // Personaje.
    const fake = {
      x: 0, y: 0, facing: -Math.PI / 2, state: 'idle', animTime: this.previewT,
      appearance: { ...this.draft.appearance },
      armor: { color: this.draft.appearance.outfit, trim: this.draft.appearance.accent, tier: cls.id === 'guardian' ? 3 : cls.id === 'vidente' ? 2 : 2 },
      weapon: WEAPONS[cls.weapon],
      shield: cls.shield ? SHIELDS[cls.shield] : null,
      accessory: cls.accessory ? ACCESSORIES[cls.accessory] : null,
      attackProgress: 0, hurtFlash: 0, blocking: false, afterimages: [],
    };
    ctx.save();
    ctx.translate(W / 2, 218);
    ctx.scale(2.45, 2.45);
    drawPlayer(ctx, fake, this.previewT);
    ctx.restore();
    // Brillo inferior.
    const floor = ctx.createLinearGradient(0, 210, 0, 250);
    floor.addColorStop(0, 'rgba(232,197,106,.08)');
    floor.addColorStop(1, 'rgba(232,197,106,0)');
    ctx.fillStyle = floor;
    ctx.fillRect(0, 200, W, 60);
  }

  // -------------------------------------------------------------------------
  // HUD
  // -------------------------------------------------------------------------

  showHUD() {
    el('hud').classList.remove('hidden');
    this.updateHUD(true);
    this.updateTouchVisibility();
  }

  hideHUD() {
    el('hud').classList.add('hidden');
  }

  updateHUD(force = false, dt = 0) {
    const g = this.game;
    if (!g.player || !g.state) return;
    const now = performance.now();
    if (!force && now - this.lastHud < 90) return;
    this.lastHud = now;
    const p = g.player;
    const s = g.state.player;
    const hpPct = clamp(p.hp / p.maxHp * 100, 0, 100);
    const mpPct = clamp(p.mp / p.maxMp * 100, 0, 100);
    const stPct = clamp(p.stamina / p.maxStamina * 100, 0, 100);
    el('bar-hp').style.width = `${hpPct}%`;
    el('bar-mp').style.width = `${mpPct}%`;
    el('bar-st').style.width = `${stPct}%`;
    el('hud-hp-text').textContent = `${Math.ceil(p.hp)} / ${p.maxHp}`;
    el('hud-mp-text').textContent = `${Math.ceil(p.mp)} / ${p.maxMp}`;
    el('hud-st-text').textContent = `${Math.ceil(p.stamina)} / ${p.maxStamina}`;
    const xpNeed = g.xpToNext();
    const xpPct = clamp((s.xp / xpNeed) * 100, 0, 100);
    el('bar-xp').style.width = `${xpPct}%`;
    el('hud-level').textContent = s.level;
    el('hud-name').textContent = s.name;
    el('hud-class').textContent = CLASSES[s.classId]?.name || '';
    el('hud-gold').textContent = formatNumber(s.gold);
    el('hud-zone').textContent = g.world?.def.name || '';
    if (this.hudDirty) {
      drawPortrait(el('hud-portrait'), p);
      this.hudDirty = false;
    }
    // Chips.
    const w = p.weapon;
    el('chip-weapon').innerHTML = `${icon(w.icon)}<span>${w.name}</span>`;
    const spell = SPELLS[s.spellId] || SPELLS.fuego;
    const spellCd = p.magicCd > 0 ? ` <span class="chip-cd">${p.magicCd.toFixed(1)}s</span>` : '';
    el('chip-spell').innerHTML = `${icon(spell.icon)}<span>${spell.name}${spellCd}</span>`;
    const creature = CREATURES[s.creatureId];
    if (creature) {
      const cd = p.creatureCd > 0 ? ` <span class="chip-cd">${p.creatureCd.toFixed(1)}s</span>` : '';
      el('chip-creature').innerHTML = `${icon(creature.icon)}<span>${creature.name}${cd}</span>`;
    } else {
      el('chip-creature').innerHTML = `${icon('slime')}<span>Sin criatura</span>`;
    }
    // Misión principal.
    const main = s.quests.main;
    const stage = QUESTS.main.stages[main.stage] || QUESTS.main.stages[0];
    el('quest-name').textContent = main.stage >= 4 ? 'La Espada Celestial · Completada' : 'La Espada Celestial';
    el('quest-objective').textContent = stage.objective;
    // Combo.
    const combo = g.comboCount || 0;
    el('hud-combo').classList.toggle('hidden', combo < 2);
    if (combo >= 2) el('combo-count').textContent = combo;
    // Minimapa.
    if (g.world && now - this.lastMinimap > 180) {
      this.lastMinimap = now;
      const mm = el('minimap');
      if (mm) {
        const ctx = mm.getContext('2d');
        g.world.drawMinimap(ctx, mm.width, mm.height, p, g.enemies, g.questMarkers || []);
      }
    }
  }

  setPrompt(html) {
    const node = el('interaction-prompt');
    if (!node) return;
    if (!html) { node.classList.add('hidden'); return; }
    node.innerHTML = html;
    node.classList.remove('hidden');
  }

  hidePrompt() { el('interaction-prompt')?.classList.add('hidden'); }

  // -------------------------------------------------------------------------
  // TOUCH
  // -------------------------------------------------------------------------

  bindTouch() {
    const stick = el('joystick');
    const knob = el('joystick-knob');
    if (stick) {
      let pointer = null;
      const update = (e) => {
        const rect = stick.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        let dx = e.clientX - cx;
        let dy = e.clientY - cy;
        const max = rect.width * 0.34;
        const len = Math.hypot(dx, dy);
        if (len > max) { dx = dx / len * max; dy = dy / len * max; }
        this.game.input.setStick(dx / max, dy / max);
        if (knob) knob.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
      };
      stick.addEventListener('pointerdown', (e) => {
        if (this.editingTouch) return;
        e.preventDefault();
        pointer = e.pointerId;
        stick.setPointerCapture(pointer);
        stick.classList.add('pressed');
        update(e);
      });
      stick.addEventListener('pointermove', (e) => {
        if (pointer !== e.pointerId) return;
        e.preventDefault();
        update(e);
      });
      const end = (e) => {
        if (pointer !== e.pointerId) return;
        pointer = null;
        this.game.input.clearStick();
        stick.classList.remove('pressed');
        if (knob) knob.style.transform = 'translate(-50%, -50%)';
      };
      stick.addEventListener('pointerup', end);
      stick.addEventListener('pointercancel', end);
      stick.addEventListener('lostpointercapture', end);
    }

    for (const btn of qsa('#touch-controls [data-touch]')) {
      const action = btn.dataset.touch;
      const down = (e) => {
        if (this.editingTouch) return;
        e.preventDefault();
        e.stopPropagation();
        btn.setPointerCapture?.(e.pointerId);
        btn.classList.add('pressed');
        this.game.input.setVirtual(action, true);
        this.game.vibrate(8);
      };
      const up = (e) => {
        if (this.editingTouch) return;
        e.preventDefault();
        btn.classList.remove('pressed');
        this.game.input.setVirtual(action, false);
      };
      btn.addEventListener('pointerdown', down);
      btn.addEventListener('pointerup', up);
      btn.addEventListener('pointercancel', up);
      btn.addEventListener('pointerleave', (e) => { if (e.buttons === 0) up(e); });
      btn.addEventListener('lostpointercapture', up);
    }

    // Editor de disposición.
    const tc = el('touch-controls');
    if (tc) {
      tc.addEventListener('pointerdown', (e) => {
        if (!this.editingTouch) return;
        const target = e.target.closest('[data-drag]');
        if (!target) return;
        e.preventDefault();
        e.stopPropagation();
        const rect = tc.getBoundingClientRect();
        this.dragState = { target, rect, key: target.dataset.drag, pointerId: e.pointerId };
        target.setPointerCapture?.(e.pointerId);
        target.classList.add('dragging');
      }, true);
      tc.addEventListener('pointermove', (e) => {
        if (!this.editingTouch || !this.dragState || this.dragState.pointerId !== e.pointerId) return;
        e.preventDefault();
        const { target, rect, key } = this.dragState;
        const nx = clamp((e.clientX - rect.left) / rect.width, 0.04, 0.96);
        const ny = clamp((e.clientY - rect.top) / rect.height, 0.06, 0.94);
        target.style.left = `${nx * 100}%`;
        target.style.top = `${ny * 100}%`;
        target.style.right = 'auto';
        target.style.bottom = 'auto';
        this.game.setTouchPosition(key, nx, ny);
      }, true);
      const endDrag = (e) => {
        if (!this.dragState) return;
        if (this.dragState.pointerId !== e.pointerId) return;
        this.dragState.target.classList.remove('dragging');
        this.dragState = null;
      };
      tc.addEventListener('pointerup', endDrag, true);
      tc.addEventListener('pointercancel', endDrag, true);
    }
  }

  applyTouchLayout() {
    const layout = this.game.settings.touchLayout;
    if (!layout) return;
    const map = {
      joystick: '#joystick', attack: '[data-drag="attack"]', dodge: '[data-drag="dodge"]', skill: '[data-drag="skill"]',
      interact: '[data-drag="interact"]', magic: '[data-drag="magic"]', block: '[data-drag="block"]', weapon: '[data-drag="weapon"]',
      creature: '[data-drag="creature"]', potion: '[data-drag="potion"]', pause: '[data-drag="pause"]', quick: '[data-drag="quick"]',
    };
    const tc = el('touch-controls');
    if (tc) tc.style.setProperty('--touch-scale', this.game.settings.touchScale || 1);
    if (tc) tc.style.setProperty('--touch-opacity', this.game.settings.touchOpacity || 0.92);
    for (const [key, sel] of Object.entries(map)) {
      const node = qs(sel);
      const pos = layout[key];
      if (!node || !pos) continue;
      node.style.left = `${pos.x * 100}%`;
      node.style.top = `${pos.y * 100}%`;
      node.style.right = 'auto';
      node.style.bottom = 'auto';
    }
  }

  updateTouchVisibility() {
    const mode = this.game.settings.touchMode || 'auto';
    const coarse = window.matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window;
    const show = mode === 'always' || (mode === 'auto' && coarse);
    const playing = this.game.scene === 'playing' || this.game.scene === 'paused' || this.game.scene === 'dialogue' || this.game.scene === 'quick' || this.game.scene === 'shop';
    this.setTouchVisible(show && playing);
    document.body.classList.toggle('touch-mode', show && playing);
  }

  setTouchVisible(v) {
    const tc = el('touch-controls');
    if (!tc) return;
    tc.classList.toggle('hidden', !v);
  }

  startTouchEditor() {
    this.game.updateSetting('touchMode', 'always');
    this.updateTouchVisibility();
    this.editingTouch = true;
    this.game.input.clear();
    el('touch-controls').classList.add('editing');
    el('touch-controls').classList.remove('hidden');
    el('touch-editor-bar').classList.remove('hidden');
    this.applyTouchLayout();
    this.game.audio.sfx('ui');
  }

  finishTouchEditor() {
    this.editingTouch = false;
    el('touch-controls').classList.remove('editing');
    el('touch-editor-bar').classList.add('hidden');
    this.game.updateSetting('touchMode', this.game.settings.touchMode === 'always' ? 'always' : 'auto');
    this.updateTouchVisibility();
    this.game.audio.sfx('ui');
    this.game.saveSettings();
  }

  onResize() {
    const portrait = window.innerHeight > window.innerWidth;
    const coarse = window.matchMedia('(pointer: coarse)').matches;
    el('rotate-hint').classList.toggle('hidden', !(portrait && coarse && this.game.scene === 'playing'));
    this.applyTouchLayout();
    this.game.resize();
  }

  // -------------------------------------------------------------------------
  // PAUSA
  // -------------------------------------------------------------------------

  openPause(tab = 'summary') {
    this.showScreen('pause');
    this.renderPause(tab);
  }

  renderPause(tab) {
    this.pauseTab = tab;
    for (const t of qsa('.pause-tab')) t.classList.toggle('active', t.dataset.tab === tab);
    const titles = {
      summary: ['DIARIO', 'Resumen'], inventory: ['MOCHILA', 'Inventario'], equipment: ['ARSENAL', 'Equipo'],
      skills: ['JURAMENTOS', 'Habilidades'], creatures: ['VÍNCULOS', 'Criaturas'], quests: ['CRÓNICA', 'Misiones'],
      settings: ['SISTEMA', 'Ajustes'], save: ['MEMORIA', 'Guardar partida'],
    };
    const t = titles[tab] || titles.summary;
    el('pause-eyebrow').textContent = t[0];
    el('pause-title').textContent = t[1];
    const content = el('pause-content');
    if (!content) return;
    if (tab === 'summary') content.innerHTML = this.renderSummary();
    else if (tab === 'inventory') content.innerHTML = this.renderInventory();
    else if (tab === 'equipment') content.innerHTML = this.renderEquipment();
    else if (tab === 'skills') content.innerHTML = this.renderSkills();
    else if (tab === 'creatures') content.innerHTML = this.renderCreatures();
    else if (tab === 'quests') content.innerHTML = this.renderQuests();
    else if (tab === 'settings') content.innerHTML = this.renderSettings('pause');
    else if (tab === 'save') content.innerHTML = this.renderSaveSlots('pause');
    if (tab === 'summary') this.drawSummaryPortrait();
  }

  renderSummary() {
    const s = this.game.state.player;
    const cls = CLASSES[s.classId];
    const stats = Object.entries(s.stats).map(([k, v]) => `
      <div class="stat-box"><span>${STAT_NAMES[k]}</span><b>${v}</b>${s.statPoints > 0 ? `<button class="plus" data-action="alloc-stat" data-stat="${k}" title="Añadir punto">+</button>` : ''}</div>`).join('');
    const ach = ACHIEVEMENTS.map((a) => {
      const unlocked = this.game.state.achievements?.[a.id];
      return `<div class="achievement ${unlocked ? '' : 'locked'}"><div class="ach-icon">${icon(unlocked ? 'star' : 'lock')}</div><div><b>${a.name}</b><small>${a.desc}</small></div></div>`;
    }).join('');
    return `
      <div class="summary-hero">
        <div class="summary-portrait"><canvas id="summary-portrait" width="150" height="150"></canvas></div>
        <div class="summary-info">
          <h3>${escapeHtml(s.name)}</h3>
          <div class="summary-class">${cls.name} · Nivel ${s.level}</div>
          <div class="summary-line">${cls.desc}</div>
          <div class="summary-meta">
            <span class="meta-pill">${icon('quest')} ${formatTime(this.game.state.playTime)}</span>
            <span class="meta-pill">${icon('gold')} ${formatNumber(s.gold)}</span>
            <span class="meta-pill">${icon('skull')} ${this.game.state.kills || 0} enemigos</span>
            <span class="meta-pill">${icon('star')} ${this.game.state.quests.main.stage >= 4 ? 'Espada restaurada' : 'En camino'}</span>
          </div>
        </div>
      </div>
      <div class="section-title"><h3>Atributos</h3>${s.statPoints > 0 ? `<span class="points-badge">${icon('spark')} ${s.statPoints} puntos disponibles</span>` : '<span>Sube de nivel para obtener puntos</span>'}</div>
      <div class="stat-grid">${stats}</div>
      <div class="section-title"><h3>Progreso</h3><span>${s.xp} / ${this.game.xpToNext()} XP</span></div>
      <div class="panel-card"><p><b class="gold">Objetivo actual:</b> ${QUESTS.main.stages[s.quests.main.stage]?.objective || 'Aventura completada.'}</p></div>
      <div class="section-title"><h3>Logros</h3><span>${Object.values(this.game.state.achievements || {}).filter(Boolean).length} / ${ACHIEVEMENTS.length}</span></div>
      ${ach}
      <div class="section-title"><h3>Ayuda</h3><span>Controles y consejos</span></div>
      <button class="btn btn-sm" data-action="open-controls">${icon('book')} Ver controles y consejos</button>
    `;
  }

  drawSummaryPortrait() {
    const c = el('summary-portrait');
    if (c) drawPortrait(c, this.game.player);
  }

  renderInventory() {
    const inv = this.game.state.inventory || {};
    const items = Object.entries(inv).filter(([, q]) => q > 0);
    const selected = this.selectedItem && ITEMS[this.selectedItem];
    let detail = '<div class="empty-state">' + icon('bag') + '<div>Selecciona un objeto para ver sus detalles.</div></div>';
    if (selected) {
      const usable = selected.use && !selected.quest;
      detail = `<div class="detail-panel">
        <div class="detail-head"><div class="detail-icon" style="color:${itemColor(selected)}">${itemIcon(selected)}</div><div><h4>${selected.name}</h4><div class="detail-type">${selected.quest ? 'Objeto de misión' : selected.key ? 'Objeto clave' : 'Consumible'}</div></div></div>
        <p>${selected.desc}</p>
        <div class="detail-stats"><span class="detail-stat">Cantidad: ${inv[selected.id]}</span>${selected.sell ? `<span class="detail-stat">Valor: ${selected.sell} oro</span>` : ''}</div>
        <div class="detail-actions">
          ${usable ? `<button class="btn btn-primary btn-sm" data-action="use-item" data-id="${selected.id}">${icon('play')} Usar</button>` : ''}
          ${!selected.quest && !selected.key ? `<button class="btn btn-sm" data-action="drop-item" data-id="${selected.id}">${icon('close')} Descartar</button>` : ''}
        </div>
      </div>`;
    }
    const cards = items.map(([id, q]) => {
      const it = ITEMS[id];
      if (!it) return '';
      return `<button class="item-card ${this.selectedItem === id ? 'selected' : ''}" data-action="select-item" data-id="${id}">
        <span class="qty">x${q}</span>
        <div class="item-icon" style="color:${itemColor(it)}">${itemIcon(it)}</div>
        <b>${it.name}</b><small>${it.quest ? 'Misión' : it.use ? 'Consumible' : 'Objeto'}</small>
        <span class="rarity" style="--r:${itemColor(it)}"></span>
      </button>`;
    }).join('');
    return `<div class="section-title"><h3>Consumibles y objetos</h3><span>${items.length} tipos · ${Object.values(inv).reduce((a, b) => a + b, 0)} objetos</span></div>
      ${items.length ? `<div class="item-grid">${cards}</div>` : '<div class="empty-state">' + icon('bag') + '<div>Tu mochila está vacía.</div></div>'}
      ${detail}`;
  }

  renderEquipment() {
    const s = this.game.state.player;
    const slots = ['weapon', 'armor', 'shield', 'accessory'];
    const equipped = {
      weapon: WEAPONS[s.weaponId], armor: ARMORS[s.armorId], shield: SHIELDS[s.shieldId], accessory: ACCESSORIES[s.accessoryId],
    };
    const slotHtml = slots.map((slot) => {
      const e = equipped[slot];
      return `<div class="equip-slot ${e ? 'filled' : ''}"><span class="slot-label">${SLOT_NAMES[slot]}</span><span class="slot-icon">${icon(e?.icon || (slot === 'shield' ? 'shield' : slot === 'armor' ? 'armor' : 'sword'))}</span><b>${e ? e.name : 'Vacío'}</b>${e ? `<small>${slot === 'weapon' ? `${e.damage} daño` : slot === 'armor' ? `+${e.def} def` : slot === 'shield' ? `${Math.round((e.block || 0) * 100)}% bloqueo` : (e.desc.match(/\+[^.]*/)?.[0] || '')}</small>` : ''}</div>`;
    }).join('');

    const lists = [];
    const ownedWeapons = s.ownedWeapons || { [s.weaponId]: 0 };
    for (const [id, up] of Object.entries(ownedWeapons)) {
      const w = WEAPONS[id]; if (!w) continue;
      lists.push({ type: 'weapon', id, name: w.name, icon: w.icon, sub: `${w.damage + (up || 0) * 3} daño · ${w.kind}${up ? ` · +${up}` : ''}`, equipped: s.weaponId === id, tier: w.tier });
    }
    const ownedArmors = s.ownedArmors || { [s.armorId]: true };
    for (const id of Object.keys(ownedArmors)) {
      const a = ARMORS[id]; if (!a) continue;
      lists.push({ type: 'armor', id, name: a.name, icon: a.icon, sub: `+${a.def} defensa · +${a.hp} vida`, equipped: s.armorId === id, tier: a.tier });
    }
    const ownedShields = s.ownedShields || {};
    for (const id of Object.keys(ownedShields)) {
      const sh = SHIELDS[id]; if (!sh) continue;
      lists.push({ type: 'shield', id, name: sh.name, icon: sh.icon, sub: `+${sh.def} def · ${Math.round(sh.block * 100)}% bloqueo`, equipped: s.shieldId === id, tier: sh.tier });
    }
    const ownedAcc = s.ownedAccessories || {};
    for (const id of Object.keys(ownedAcc)) {
      const a = ACCESSORIES[id]; if (!a) continue;
      lists.push({ type: 'accessory', id, name: a.name, icon: a.icon, sub: Object.entries(a.stats).map(([k, v]) => `+${v} ${STAT_NAMES[k]}`).join(' · '), equipped: s.accessoryId === id, tier: a.tier });
    }
    const rows = lists.map((r) => `<div class="list-row">
      <div class="row-icon" style="color:${r.tier >= 3 ? '#ffe6a0' : '#e8c56a'}">${icon(r.icon)}</div>
      <div class="row-main"><b>${r.name} ${r.equipped ? '<span class="tag equipped">Equipado</span>' : ''}</b><small>${r.sub}</small></div>
      <div class="row-actions">${r.equipped ? '' : `<button class="btn btn-sm" data-action="equip-item" data-id="${r.id}" data-type="${r.type}">Equipar</button>`}</div>
    </div>`).join('');
    const p = this.game.player;
    return `<div class="section-title"><h3>Equipo actual</h3><span>El aspecto cambia con tu armadura y arma</span></div>
      <div class="equip-slots">${slotHtml}</div>
      <div class="section-title"><h3>Estadísticas derivadas</h3><span>Con el equipo actual</span></div>
      <div class="stat-grid">
        <div class="stat-box"><span>Vida</span><b>${p.maxHp}</b></div>
        <div class="stat-box"><span>Maná</span><b>${p.maxMp}</b></div>
        <div class="stat-box"><span>Ataque</span><b>${Math.round(p.attackPower)}</b></div>
        <div class="stat-box"><span>Defensa</span><b>${Math.round(p.defense)}</b></div>
        <div class="stat-box"><span>Crítico</span><b>${Math.round(p.critChance * 100)}%</b></div>
        <div class="stat-box"><span>Bloqueo</span><b>${Math.round(p.blockReduction * 100)}%</b></div>
      </div>
      <div class="section-title"><h3>Arsenal</h3><span>${lists.length} objetos</span></div>
      ${rows || '<div class="empty-state">Sin equipo adicional.</div>'}`;
  }

  renderSkills() {
    const s = this.game.state.player;
    const w = WEAPONS[s.weaponId];
    const learned = s.spells || ['fuego'];
    const spellCards = Object.values(SPELLS).map((sp) => {
      const unlocked = learned.includes(sp.id) || s.level >= sp.unlock;
      const equipped = s.spellId === sp.id;
      return `<div class="skill-card" style="${unlocked ? '' : 'opacity:.45'}">
        <h4>${icon(sp.icon)} ${sp.name} ${equipped ? '<span class="tag equipped">Equipado</span>' : ''}</h4>
        <p>${sp.desc}</p>
        <div class="skill-meta"><span class="detail-stat">${sp.cost} maná</span><span class="detail-stat">${sp.cooldown}s recarga</span><span class="detail-stat">${unlocked ? 'Aprendido' : `Nivel ${sp.unlock}`}</span></div>
        ${unlocked && !equipped ? `<div class="detail-actions"><button class="btn btn-sm" data-action="equip-spell" data-id="${sp.id}">Equipar hechizo</button></div>` : ''}
      </div>`;
    }).join('');
    const creature = CREATURES[s.creatureId];
    return `<div class="skill-card">
      <h4>${icon(w.icon)} ${w.skill.name} <span class="tag owned">Habilidad de arma</span></h4>
      <p>${w.skill.desc}</p>
      <div class="skill-meta"><span class="detail-stat">${w.skill.cost} ${w.skill.resource === 'mp' ? 'maná' : 'resistencia'}</span><span class="detail-stat">${w.skill.cooldown}s recarga</span><span class="detail-stat">Arma: ${w.name}</span></div>
    </div>
    <div class="section-title"><h3>Hechizos</h3><span>${learned.length} aprendidos · ${spellCards ? '' : ''}</span></div>
    ${spellCards}
    <div class="section-title"><h3>Criatura vinculada</h3><span>Poder pasivo y activo</span></div>
    ${creature ? `<div class="skill-card"><h4>${icon(creature.icon)} ${creature.name}</h4><p>${creature.desc}</p><div class="skill-meta"><span class="detail-stat" style="color:#8fe3a0">${creature.passive}</span><span class="detail-stat">${creature.active} · ${creature.cooldown}s</span></div></div>` : '<div class="empty-state">Aún no has vinculado ninguna criatura.</div>'}`;
  }

  renderCreatures() {
    const owned = this.game.state.creatures || {};
    const equipped = this.game.state.player.creatureId;
    const cards = Object.values(CREATURES).map((c) => {
      const o = owned[c.id];
      const isEq = equipped === c.id;
      return `<div class="creature-card ${o ? 'owned' : ''} ${isEq ? 'equipped' : ''}">
        <div class="creature-orb" style="color:${c.color}">${o ? icon(c.icon) : icon('lock')}</div>
        <h4>${o ? c.name : '???'}</h4>
        <div class="creature-lvl">${o ? `Nivel ${o.level}` : 'No vinculada'}</div>
        <p>${o ? c.desc : 'Derrota o debilita a esta criatura y usa Y para intentar vincularla.'}</p>
        ${o ? `<div class="creature-passive">${c.passive}</div><div class="creature-actions">${isEq ? '<span class="tag equipped">Invocada</span>' : `<button class="btn btn-sm" data-action="equip-creature" data-id="${c.id}">Vincular</button>`}</div>` : ''}
      </div>`;
    }).join('');
    return `<div class="section-title"><h3>Colección</h3><span>${Object.keys(owned).length} / ${Object.values(CREATURES).length} criaturas</span></div>
      <div class="panel-card" style="margin-bottom:12px"><p><b class="gold">Cómo vincular:</b> debilita a una criatura hasta que su vida baje del 32% y pulsa <span class="kbd">Y</span> cerca de ella. La Suerte aumenta la probabilidad. El Guardián Corrompido se vincula automáticamente al ser derrotado.</p></div>
      <div class="creature-grid">${cards}</div>`;
  }

  renderQuests() {
    const qs = this.game.state.quests;
    const order = ['main', 'fireflies', 'fangs', 'iron', 'echoes'];
    const cards = order.map((id) => {
      const def = QUESTS[id];
      const st = qs[id];
      if (!def || !st) return '';
      const stage = def.stages[st.stage] || def.stages[0];
      const done = st.status === 'complete' || st.stage >= def.stages.length - 1;
      let progress = '';
      if (id === 'fireflies' && st.stage === 1) progress = `<div class="progress-track"><i style="width:${clamp((this.game.countItem('luciernaga') / 3) * 100, 0, 100)}%"></i></div><div class="hint">${Math.min(3, this.game.countItem('luciernaga'))} / 3 luciérnagas</div>`;
      if (id === 'fangs' && st.stage === 1) progress = `<div class="progress-track"><i style="width:${clamp((this.game.countItem('colmillo') / 5) * 100, 0, 100)}%"></i></div><div class="hint">${Math.min(5, this.game.countItem('colmillo'))} / 5 colmillos</div>`;
      if (id === 'iron' && st.stage === 1) progress = `<div class="progress-track"><i style="width:${clamp((this.game.countItem('hierro') / 3) * 100, 0, 100)}%"></i></div><div class="hint">${Math.min(3, this.game.countItem('hierro'))} / 3 piedras de hierro</div>`;
      if (id === 'echoes' && st.stage === 1) progress = `<div class="progress-track"><i style="width:${clamp((this.game.countItem('memoria') / 3) * 100, 0, 100)}%"></i></div><div class="hint">${Math.min(3, this.game.countItem('memoria'))} / 3 ecos</div>`;
      return `<div class="quest-card ${id === 'main' ? 'main' : ''} ${done ? 'done' : ''}">
        <span class="quest-status">${done ? 'Completada' : st.status === 'inactive' ? 'No iniciada' : 'Activa'}</span>
        <h4>${def.name}</h4>
        <p>${def.desc}</p>
        <div class="objective">${icon('target')} ${stage.objective}</div>
        ${stage.hint ? `<div class="hint">${stage.hint}</div>` : ''}
        ${progress}
      </div>`;
    }).join('');
    return `<div class="section-title"><h3>Diario de misiones</h3><span>${order.filter((id) => qs[id]?.status === 'active').length} activas</span></div>${cards}`;
  }

  renderSettings(from = 'pause') {
    const s = this.game.settings;
    const sel = (v, o) => (v === o ? 'selected' : '');
    const toggle = (key, val) => `<button class="toggle ${val ? 'on' : ''}" data-action="toggle-setting" data-setting="${key}" aria-label="Alternar"></button>`;
    return `<div class="settings-grid">
      <div class="settings-group">
        <h3>Audio</h3>
        <div class="setting-row"><div><label>Música</label><small>Banda sonora procedural</small></div><input type="range" min="0" max="1" step="0.05" value="${s.music}" data-setting="music"></div>
        <div class="setting-row"><div><label>Efectos</label><small>Golpes, magia y ambiente</small></div><input type="range" min="0" max="1" step="0.05" value="${s.sfx}" data-setting="sfx"></div>
        <div class="setting-row"><div><label>Silenciar todo</label><small>Música y efectos</small></div>${toggle('muted', s.muted)}</div>
      </div>
      <div class="settings-group">
        <h3>Imagen y juego</h3>
        <div class="setting-row"><div><label>Sacudida de cámara</label><small>Impacto de los golpes</small></div>${toggle('shake', s.shake)}</div>
        <div class="setting-row"><div><label>Números de daño</label><small>Muestra el daño infligido</small></div>${toggle('damageNumbers', s.damageNumbers)}</div>
        <div class="setting-row"><div><label>Vibración</label><small>En dispositivos compatibles</small></div>${toggle('vibration', s.vibration)}</div>
        <div class="setting-row"><div><label>Calidad</label><small>Partículas y efectos</small></div><select data-setting="quality"><option value="high" ${sel('high', s.quality)}>Alta</option><option value="medium" ${sel('medium', s.quality)}>Media</option><option value="low" ${sel('low', s.quality)}>Baja</option></select></div>
        <div class="setting-row"><div><label>Pantalla completa</label><small>Inmersión total</small></div><button class="btn btn-sm" data-action="fullscreen">${icon('map')} Activar</button></div>
      </div>
      <div class="settings-group">
        <h3>Controles táctiles</h3>
        <div class="setting-row"><div><label>Mostrar controles</label><small>Automático en móviles</small></div><select data-setting="touchMode"><option value="auto" ${sel('auto', s.touchMode)}>Automático</option><option value="always" ${sel('always', s.touchMode)}>Siempre</option><option value="never" ${sel('never', s.touchMode)}>Nunca</option></select></div>
        <div class="setting-row"><div><label>Tamaño</label><small>Escala de botones</small></div><input type="range" min="0.75" max="1.35" step="0.05" value="${s.touchScale}" data-setting="touchScale"></div>
        <div class="setting-row"><div><label>Opacidad</label><small>Visibilidad en pantalla</small></div><input type="range" min="0.35" max="1" step="0.05" value="${s.touchOpacity}" data-setting="touchOpacity"></div>
        <div class="setting-row"><div><label>Editar disposición</label><small>Arrastra botones y joystick</small></div><button class="btn btn-sm" data-action="edit-touch">${icon('swap')} Editar</button></div>
        <div class="setting-row"><div><label>Restablecer</label><small>Volver a la disposición original</small></div><button class="btn btn-sm" data-action="reset-touch">${icon('close')} Restablecer</button></div>
      </div>
      <div class="settings-group">
        <h3>Información</h3>
        <p style="color:var(--muted);font-size:.72rem;line-height:1.5">La Espada Celestial es una obra original. Todo el arte, la música y los efectos se generan por procedimiento. No usa recursos protegidos.</p>
        <div class="setting-row"><div><label>Guardado</label><small>${storageAvailable() ? 'Local disponible' : 'Almacenamiento no disponible'}</small></div><span class="tag ${storageAvailable() ? 'equipped' : ''}">${storageAvailable() ? 'Activo' : 'Bloqueado'}</span></div>
        <div class="setting-row"><div><label>Controles</label><small>Teclado, mando y táctil</small></div><button class="btn btn-sm" data-action="open-controls">${icon('book')} Ver</button></div>
      </div>
    </div>`;
  }

  renderSaveSlots(context) {
    const saves = listSaves();
    const slots = ['auto', '1', '2', '3'];
    const cards = slots.map((slot) => {
      const data = saves[slot];
      const isAuto = slot === 'auto';
      const canSave = context === 'pause' && !isAuto;
      if (!data) {
        return `<div class="save-slot empty"><div class="slot-num">${isAuto ? 'A' : slot}</div><div class="slot-info"><b>${isAuto ? 'Autoguardado' : `Ranura ${slot}`}</b><small>Vacía</small></div><div class="slot-actions">${canSave ? `<button class="btn btn-sm btn-primary" data-action="save-slot" data-slot="${slot}">${icon('save')} Guardar</button>` : ''}</div></div>`;
      }
      const p = data.player || {};
      return `<div class="save-slot"><div class="slot-num">${isAuto ? 'A' : slot}</div><div class="slot-info"><b>${escapeHtml(p.name || 'Héroe')} · Nv. ${p.level || 1} · ${CLASSES[p.classId]?.name || ''}</b><small>${ZONE_INFO[data.mapId]?.name || data.mapId || ''} · ${formatTime(data.playTime)} · ${new Date(data.timestamp || Date.now()).toLocaleString('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</small></div><div class="slot-actions">${canSave ? `<button class="btn btn-sm" data-action="save-slot" data-slot="${slot}">${icon('save')} Sobrescribir</button>` : ''}<button class="btn btn-sm btn-primary" data-action="load-slot" data-slot="${slot}">${icon('play')} Cargar</button><button class="btn btn-sm" data-action="delete-slot" data-slot="${slot}">${icon('close')}</button></div></div>`;
    }).join('');
    return `<div class="section-title"><h3>${context === 'pause' ? 'Guardar progreso' : 'Cargar partida'}</h3><span>El autoguardado se actualiza al viajar y en los santuarios</span></div><div class="save-grid">${cards}</div>`;
  }

  // -------------------------------------------------------------------------
  // MODALES
  // -------------------------------------------------------------------------

  openModal(title, eyebrow, body, footer = '') {
    el('modal-title').textContent = title;
    el('modal-eyebrow').textContent = eyebrow;
    el('modal-body').innerHTML = body;
    el('modal-footer').innerHTML = footer;
    this.game.scene = 'modal';
    this.showScreen('modal');
    this.setTouchVisible(false);
  }

  closeModal() {
    const ret = this.modalReturn;
    if (ret === 'pause') {
      this.game.scene = 'paused';
      this.showScreen('pause');
      this.renderPause(this.pauseTab);
      this.setTouchVisible(false);
    } else if (ret === 'gameover') {
      this.game.scene = 'gameover';
      this.showScreen('gameover');
      this.setTouchVisible(false);
    } else if (ret === 'ending') {
      this.game.scene = 'ending';
      this.showScreen('ending');
      this.setTouchVisible(false);
    } else if (ret === 'playing' && this.game.state) {
      this.game.scene = 'playing';
      this.hideAllScreens();
      this.showHUD();
      this.game.ui.updateTouchVisibility();
      this.game.input.clear();
    } else {
      this.game.scene = 'title';
      this.showTitle();
    }
  }

  openLoadMenu(from) {
    this.modalReturn = from === 'gameover' ? 'gameover' : from === 'pause' ? 'pause' : 'title';
    this.openModal('Cargar partida', 'MEMORIA DE AURELIA', this.renderSaveSlots(from), `<button class="btn btn-sm" data-action="close-modal">${icon('close')} Cerrar</button>`);
  }

  openSettings(from) {
    this.modalReturn = from === 'pause' ? 'pause' : 'title';
    this.openModal('Ajustes', 'SISTEMA', this.renderSettings('modal'), `<button class="btn btn-primary btn-sm" data-action="close-modal">${icon('check')} Listo</button>`);
  }

  openHowTo() {
    this.modalReturn = this.game.scene === 'paused' ? 'pause' : this.game.scene === 'title' ? 'title' : 'title';
    const rows = CONTROL_INFO.map((c) => `<tr><td>${c.action}</td><td><span class="kbd">${c.key}</span></td><td>${c.pad}</td><td>${c.touch}</td></tr>`).join('');
    const tips = TIPS.map((t) => `<li>${t}</li>`).join('');
    this.openModal('Cómo jugar', 'GUÍA DEL AVENTURERO', `
      <h3>Controles</h3>
      <table class="control-table"><thead><tr><th>Acción</th><th>Teclado</th><th>Mando</th><th>Táctil</th></tr></thead><tbody>${rows}</tbody></table>
      <h3>Consejos</h3><ul>${tips}</ul>
      <h3>Objetivo</h3>
      <p>Reúne los tres fragmentos de la Espada Celestial: el Alba en el Bosque de Lumen, Aether en las Ruinas y el fragmento Celestial en el Santuario. Habla con todos los NPC, explora los cofres y vincula criaturas para volverte más fuerte.</p>
      <p class="muted" style="margin-top:10px">El juego guarda automáticamente al cambiar de región y al usar un santuario. También puedes guardar manualmente desde el menú de pausa.</p>
    `, `<button class="btn btn-primary btn-sm" data-action="close-modal">${icon('check')} Entendido</button>`);
  }

  openCredits(fromEnding = false) {
    this.modalReturn = fromEnding ? 'ending' : this.game.scene === 'paused' ? 'pause' : 'title';
    this.openModal('Créditos', 'LA ORDEN DEL ALBA', `
      <div style="text-align:center;padding:10px 0 18px">
        <div style="font-size:2.4rem;color:var(--gold);margin-bottom:8px">${icon('celestial')}</div>
        <h3 style="font-size:1.5rem;color:var(--gold-2);letter-spacing:.08em">LA ESPADA CELESTIAL</h3>
        <p style="letter-spacing:.28em;font-size:.62rem;color:var(--muted)">RPG RETRO · v1.0</p>
      </div>
      <h3>Un juego original</h3>
      <p>Diseño, programación, arte procedural, música generativa, efectos de sonido, narrativa y pruebas realizados para esta obra. No se utilizan personajes, mapas, música ni recursos protegidos de terceros.</p>
      <h3>Motor</h3>
      <p>HTML5 Canvas 2D · WebAudio API · Web Storage · Gamepad API · Pointer Events · PWA. Sin dependencias externas.</p>
      <h3>Contenido</h3>
      <p>4 regiones · 6 enemigos únicos · 2 jefes · 7 armas · 6 criaturas coleccionables · 5 hechizos · 5 misiones · 3 ranuras de guardado + autoguardado.</p>
      <h3>Agradecimiento</h3>
      <p>A quien se atreva a cruzar el Bosque de Lumen sin mirar atrás.</p>
    `, `<button class="btn btn-primary btn-sm" data-action="close-modal">${icon('check')} Volver</button>`);
  }

  openConfirm(title, text, callback) {
    this.confirmCallback = callback;
    this.modalReturn = this.game.scene === 'paused' ? 'pause' : this.game.scene === 'gameover' ? 'gameover' : 'title';
    this.openModal(title, 'CONFIRMACIÓN', `<p style="font-family:var(--serif);font-size:1rem;color:#e6e1d2;line-height:1.6">${text}</p>`, `
      <button class="btn btn-sm" data-action="confirm-no">${icon('close')} Cancelar</button>
      <button class="btn btn-primary btn-sm" data-action="confirm-yes">${icon('check')} Confirmar</button>`);
  }

  saveSlot(slot) {
    if (slot === 'auto') return;
    const existing = readSave(slot);
    const doSave = () => {
      const ok = this.game.saveGame(slot);
      if (ok) {
        this.toast('Partida guardada', `Ranura ${slot} actualizada.`, 'success');
        this.renderPause('save');
        this.updateTitle();
      } else this.toast('No se pudo guardar', 'El almacenamiento local no está disponible.', 'error');
    };
    if (existing) this.openConfirm('Sobrescribir partida', `La ranura ${slot} ya contiene una partida. ¿Quieres reemplazarla?`, doSave);
    else doSave();
  }

  loadSlot(slot) {
    if (!readSave(slot)) { this.toast('Ranura vacía', 'No hay partida en esta ranura.', 'error'); return; }
    this.game.loadGame(slot);
  }

  confirmDeleteSlot(slot) {
    this.openConfirm('Borrar partida', `¿Seguro que quieres borrar la ranura ${slot}? Esta acción no se puede deshacer.`, () => {
      deleteSave(slot);
      this.updateTitle();
      this.renderPause('save');
      this.toast('Partida borrada', `Ranura ${slot} eliminada.`, 'info');
    });
  }

  toggleSetting(key) {
    const s = this.game.settings;
    if (key === 'muted' || key === 'shake' || key === 'damageNumbers' || key === 'vibration') {
      this.game.updateSetting(key, !s[key]);
      if (this.game.scene === 'paused') this.renderPause('settings');
      else this.openSettings(this.modalReturn);
    }
  }

  // -------------------------------------------------------------------------
  // TIENDA
  // -------------------------------------------------------------------------

  openShop(npcId) {
    this.shopNpc = npcId || 'sela';
    this.shopTab = 'buy';
    this.shopSelected = null;
    const isSmith = this.shopNpc === 'brann';
    el('shop-title').textContent = isSmith ? 'Brann, el herrero' : 'Sela, la mercader';
    el('shop-eyebrow').textContent = isSmith ? 'FORJA DE ALDEA DEL ALBA' : 'MERCADO DE ALDEA DEL ALBA';
    el('shop-subtitle').textContent = isSmith ? '«El acero recuerda cada golpe. Yo también.»' : '«Lo que necesitas, lo tengo. Lo que no, lo consigo.»';
    el('forge-tab').classList.toggle('hidden', !isSmith);
    this.showScreen('shop');
    this.renderShop('buy');
  }

  renderShop(tab) {
    this.shopTab = tab;
    for (const t of qsa('.shop-tab')) t.classList.toggle('active', t.dataset.tab === tab);
    el('shop-gold').textContent = formatNumber(this.game.state.player.gold);
    const list = el('shop-list');
    if (tab === 'forge') {
      this.renderForge();
      return;
    }
    const items = tab === 'buy' ? this.game.getShopInventory(this.shopNpc) : this.game.getSellInventory();
    if (!items.length) {
      list.innerHTML = '<div class="empty-state">' + icon('bag') + '<div>No hay objetos disponibles.</div></div>';
      this.shopSelected = null;
    } else {
      if (!items.some((i) => i.key === this.shopSelected)) this.shopSelected = items[0].key;
      list.innerHTML = items.map((it) => {
        const def = it.def;
        const price = tab === 'buy' ? it.price : it.sell;
        const qty = it.qty ? `<span class="qty">x${it.qty}</span>` : '';
        return `<button class="item-card ${this.shopSelected === it.key ? 'selected' : ''}" data-action="select-shop-item" data-id="${it.key}">
          ${qty}<div class="item-icon" style="color:${itemColor(def)}">${itemIcon(def)}</div>
          <b>${def.name}</b><small>${tab === 'buy' ? 'Comprar' : 'Vender'} · ${price} oro</small><span class="rarity" style="--r:${itemColor(def)}"></span>
        </button>`;
      }).join('');
    }
    this.renderShopDetail();
    el('shop-hint').textContent = tab === 'buy' ? 'Compra consumibles y equipo. El oro se obtiene de enemigos, cofres y misiones.' : 'Vende objetos que no necesites. Los objetos de misión no se pueden vender.';
  }

  renderShopDetail() {
    const detail = el('shop-detail');
    if (!detail) return;
    const items = this.shopTab === 'buy' ? this.game.getShopInventory(this.shopNpc) : this.shopTab === 'sell' ? this.game.getSellInventory() : [];
    const it = items.find((i) => i.key === this.shopSelected);
    if (!it) { detail.innerHTML = '<div class="empty-state">' + icon('bag') + '<div>Selecciona un objeto.</div></div>'; return; }
    const def = it.def;
    const price = this.shopTab === 'buy' ? it.price : it.sell;
    const isEquip = ['weapon', 'armor', 'shield', 'accessory'].includes(it.type);
    let stats = '';
    if (it.type === 'weapon') stats = `<span class="detail-stat">${def.damage} daño</span><span class="detail-stat">${def.speed.toFixed(2)} vel.</span><span class="detail-stat">${def.combo} golpes</span><span class="detail-stat">${def.range} alcance</span>`;
    else if (it.type === 'armor') stats = `<span class="detail-stat">+${def.def} defensa</span><span class="detail-stat">+${def.hp} vida</span>${def.mp ? `<span class="detail-stat">+${def.mp} maná</span>` : ''}`;
    else if (it.type === 'shield') stats = `<span class="detail-stat">+${def.def} defensa</span><span class="detail-stat">${Math.round(def.block * 100)}% bloqueo</span>`;
    else if (it.type === 'accessory') stats = Object.entries(def.stats).map(([k, v]) => `<span class="detail-stat">+${v} ${STAT_NAMES[k]}</span>`).join('');
    const can = this.shopTab === 'buy' ? this.game.state.player.gold >= price : true;
    detail.innerHTML = `<div class="detail-head"><div class="detail-icon" style="color:${itemColor(def)}">${itemIcon(def)}</div><div><h4>${def.name}</h4><div class="detail-type">${isEquip ? SLOT_NAMES[it.type] : def.quest ? 'Misión' : 'Consumible'}</div></div></div>
      <p>${def.desc || ''}</p>
      <div class="detail-stats">${stats}${it.qty ? `<span class="detail-stat">En mochila: ${it.qty}</span>` : ''}</div>
      <div class="detail-actions">
        <button class="btn ${can ? 'btn-primary' : ''} btn-sm" data-action="${this.shopTab === 'buy' ? 'buy-item' : 'sell-item'}" ${can ? '' : 'disabled'}>${icon('gold')} ${this.shopTab === 'buy' ? `Comprar · ${price} oro` : `Vender · ${price} oro`}</button>
      </div>
      ${!can ? '<p style="color:var(--red);font-size:.66rem;margin-top:6px">No tienes oro suficiente.</p>' : ''}`;
  }

  buySelected() {
    const r = this.game.buyItem(this.shopSelected);
    if (r.ok) { this.toast('Compra realizada', r.msg, 'success'); this.game.audio.sfx('coin'); this.renderShop('buy'); }
    else this.toast('No se pudo comprar', r.msg, 'error');
  }

  sellSelected() {
    const r = this.game.sellItem(this.shopSelected);
    if (r.ok) { this.toast('Venta realizada', r.msg, 'success'); this.game.audio.sfx('coin'); this.renderShop('sell'); }
    else this.toast('No se pudo vender', r.msg, 'error');
  }

  renderForge() {
    const list = el('shop-list');
    const detail = el('shop-detail');
    const s = this.game.state.player;
    const w = WEAPONS[s.weaponId];
    const up = (s.ownedWeapons?.[s.weaponId] || 0);
    const cost = 120 + up * 90;
    const iron = this.game.countItem('hierro');
    const ironNeed = 1 + Math.floor(up / 2);
    const maxed = up >= 5;
    list.innerHTML = `<div class="panel-card" style="grid-column:1/-1"><h3>${icon('sword')} Yunque de Brann</h3><p>Refuerza el arma equipada. Cada mejora añade +3 de daño y un brillo nuevo al filo. Las armas de rango máximo brillan con luz propia.</p></div>`;
    detail.innerHTML = `<div class="detail-head"><div class="detail-icon">${icon(w.icon)}</div><div><h4>${w.name}</h4><div class="detail-type">Mejora +${up} / +5</div></div></div>
      <div class="detail-stats"><span class="detail-stat">${w.damage + up * 3} daño actual</span><span class="detail-stat">${w.damage + (up + 1) * 3} tras mejorar</span></div>
      <p>Coste: <b class="gold">${maxed ? '—' : `${cost} oro`}</b> · Hierro: <b class="${iron >= ironNeed ? 'gold' : ''}">${iron} / ${ironNeed}</b></p>
      <div class="detail-actions"><button class="btn btn-primary btn-sm" data-action="forge-upgrade" ${maxed || iron < ironNeed || s.gold < cost ? 'disabled' : ''}>${icon('spark')} ${maxed ? 'Arma al máximo' : 'Reforzar arma'}</button></div>
      <p style="margin-top:8px;font-size:.64rem;color:var(--muted)">El hierro lo sueltan los escarabajos pétreos de las Ruinas de Aether.</p>`;
    el('shop-hint').textContent = 'La forja consume oro y piedra de hierro. Sube el daño de tu arma equipada.';
  }

  forgeUpgrade() {
    const r = this.game.forgeUpgrade();
    if (r.ok) { this.toast('Arma reforzada', r.msg, 'success'); this.game.audio.sfx('levelup'); this.renderShop('forge'); }
    else this.toast('No se pudo reforzar', r.msg, 'error');
  }

  // -------------------------------------------------------------------------
  // MENÚ RÁPIDO
  // -------------------------------------------------------------------------

  openQuick() {
    this.showScreen('quick');
    this.renderQuick();
  }

  renderQuick() {
    const g = this.game;
    const s = g.state.player;
    const grid = el('quick-grid');
    if (!grid) return;
    const spells = (s.spells || ['fuego']).map((id, i) => {
      const sp = SPELLS[id];
      return `<button class="quick-card ${s.spellId === id ? 'active' : ''}" data-action="quick-spell" data-index="${i}">
        <div class="quick-icon" style="color:${sp.color}">${icon(sp.icon)}</div><b>${sp.name}</b><small>${sp.desc}</small>
        <span class="quick-meta">${sp.cost} maná · ${sp.cooldown}s · tecla ${i + 1}</span>
      </button>`;
    }).join('');
    const creature = CREATURES[s.creatureId];
    grid.innerHTML = `${spells}
      <button class="quick-card" data-action="quick-potion"><div class="quick-icon" style="color:#e0566a">${icon('potion')}</div><b>Poción de Alba</b><small>Restaura 50 de vida al instante.</small><span class="quick-meta">${g.countItem('potion')} en mochila · tecla H</span></button>
      <button class="quick-card" data-action="quick-creature"><div class="quick-icon" style="color:${creature?.color || '#9fe3ff'}">${icon(creature?.icon || 'slime')}</div><b>${creature ? creature.active : 'Sin criatura'}</b><small>${creature ? creature.activeDesc : 'Vincula una criatura para invocarla.'}</small><span class="quick-meta">${creature ? `${creature.cooldown}s recarga · tecla R` : '—'}</span></button>
      <button class="quick-card" data-action="quick-weapon"><div class="quick-icon">${icon(g.player.weapon.icon)}</div><b>${g.player.weapon.name}</b><small>${g.player.weapon.skill.desc}</small><span class="quick-meta">${g.player.weapon.skill.cost} ${g.player.weapon.skill.resource === 'mp' ? 'maná' : 'resistencia'} · tecla L</span></button>
      <div class="quick-card"><div class="quick-icon" style="color:#8fd8ff">${icon('shield')}</div><b>Guardia</b><small>Mantén bloqueo para reducir el daño. Consume resistencia.</small><span class="quick-meta">Shift · LT · Botón escudo</span></div>`;
  }

  // -------------------------------------------------------------------------
  // DIÁLOGO
  // -------------------------------------------------------------------------

  openDialogue(data) {
    this.dialogueState = {
      data,
      page: 0,
      char: 0,
      timer: 0,
      typing: true,
      text: data.pages[0]?.text || '',
      choices: data.pages[0]?.choices || null,
      done: false,
    };
    document.body.classList.add('dialogue-open');
    el('dialogue').classList.remove('hidden');
    el('dialogue-name').textContent = data.name || '';
    el('dialogue-title').textContent = data.title || '';
    el('dialogue-text').textContent = '';
    el('dialogue-choices').innerHTML = '';
    el('dialogue-hint').classList.remove('hidden');
    const portrait = el('dialogue-portrait');
    if (portrait) {
      const fake = {
        appearance: {
          hairStyle: data.hairStyle ?? 1, hair: data.hair || '#5a3423', skin: data.skin || SKIN_TONES[1],
          outfit: data.color || '#4a5a3a', accent: data.accent || '#e8c56a', cloak: data.color || '#2b3a2a',
        },
        armor: { color: data.color || '#4a5a3a', trim: data.accent || '#e8c56a', tier: 2 },
        weapon: data.weapon || null, shield: null, accessory: null,
      };
      drawPortrait(portrait, fake);
    }
    this.game.audio.sfx('ui');
  }

  updateDialogue(dt) {
    if (!this.dialogueState) return;
    const st = this.dialogueState;
    if (!st.typing) return;
    st.timer += dt;
    const speed = 0.022;
    while (st.timer > speed && st.char < st.text.length) {
      st.timer -= speed;
      st.char++;
    }
    el('dialogue-text').textContent = st.text.slice(0, st.char);
    if (st.char >= st.text.length) {
      st.typing = false;
      el('dialogue-text').innerHTML = escapeHtml(st.text) + '<span class="cursor">▍</span>';
      this.showDialogueChoices();
    }
  }

  advanceDialogue() {
    const st = this.dialogueState;
    if (!st) return;
    if (st.typing) {
      st.char = st.text.length;
      st.typing = false;
      el('dialogue-text').innerHTML = escapeHtml(st.text) + '<span class="cursor">▍</span>';
      this.showDialogueChoices();
      return;
    }
    if (st.choices && st.choices.length) return;
    this.nextDialoguePage();
  }

  showDialogueChoices() {
    const st = this.dialogueState;
    if (!st) return;
    const box = el('dialogue-choices');
    if (!st.choices || !st.choices.length) { box.innerHTML = ''; el('dialogue-hint').classList.remove('hidden'); return; }
    el('dialogue-hint').classList.add('hidden');
    box.innerHTML = st.choices.map((c, i) => `<button class="dialogue-choice" data-choice="${i}">${escapeHtml(c.text)}</button>`).join('');
  }

  nextDialoguePage() {
    const st = this.dialogueState;
    if (!st) return;
    if (st.page < st.data.pages.length - 1) {
      st.page++;
      const page = st.data.pages[st.page];
      st.text = page.text;
      st.char = 0;
      st.timer = 0;
      st.typing = true;
      st.choices = page.choices || null;
      el('dialogue-text').textContent = '';
      el('dialogue-choices').innerHTML = '';
      el('dialogue-hint').classList.remove('hidden');
    } else {
      this.game.closeDialogue();
    }
  }

  selectDialogueChoice(index) {
    const st = this.dialogueState;
    if (!st || !st.choices || !st.choices[index]) return;
    const choice = st.choices[index];
    const result = this.game.handleDialogueChoice(choice);
    if (result?.next !== undefined && st.data.pages[result.next]) {
      st.page = result.next;
      st.text = st.data.pages[st.page].text;
      st.char = 0;
      st.timer = 0;
      st.typing = true;
      st.choices = st.data.pages[st.page].choices || null;
      el('dialogue-text').textContent = '';
      el('dialogue-choices').innerHTML = '';
      el('dialogue-hint').classList.remove('hidden');
    } else if (result?.stay) {
      // El juego actualiza el diálogo (por ejemplo, una tienda).
    } else {
      this.game.closeDialogue();
    }
  }

  closeDialogue() {
    this.dialogueState = null;
    el('dialogue').classList.add('hidden');
    document.body.classList.remove('dialogue-open');
  }

  // -------------------------------------------------------------------------
  // CINEMÁTICA
  // -------------------------------------------------------------------------

  playCinematic(pages, onDone) {
    this.cineState = { pages, index: 0, onDone };
    el('cinematic').classList.remove('hidden');
    this.renderCinematic();
    this.game.audio.sfx('portal');
  }

  renderCinematic() {
    const st = this.cineState;
    if (!st) return;
    const page = st.pages[st.index];
    el('cine-chapter').textContent = page.chapter || 'AURELIA';
    el('cine-title').textContent = page.title || '';
    el('cine-text').textContent = page.text || '';
    el('cine-progress').innerHTML = st.pages.map((_, i) => `<i class="${i <= st.index ? 'on' : ''}"></i>`).join('');
    el('cine-next').innerHTML = st.index >= st.pages.length - 1 ? `Comenzar <span data-icon="chevron"></span>` : `Continuar <span data-icon="chevron"></span>`;
    const node = el('cine-next');
    node.querySelectorAll('[data-icon]').forEach((n) => { n.innerHTML = icon('chevron'); });
  }

  advanceCinematic() {
    const st = this.cineState;
    if (!st) return;
    if (st.index < st.pages.length - 1) {
      st.index++;
      this.renderCinematic();
      this.game.audio.sfx('ui');
    } else {
      this.finishCinematic();
    }
  }

  skipCinematic() {
    this.finishCinematic();
  }

  finishCinematic() {
    const cb = this.cineState?.onDone;
    this.cineState = null;
    el('cinematic').classList.add('hidden');
    cb?.();
  }

  // -------------------------------------------------------------------------
  // TOASTS / BANNERS
  // -------------------------------------------------------------------------

  toast(title, text = '', type = 'info', duration = 2800) {
    const wrap = el('toasts');
    if (!wrap) return;
    if (this.toastCount > 4) wrap.firstElementChild?.remove();
    const node = document.createElement('div');
    node.className = `toast ${type}`;
    const ic = type === 'success' ? 'check' : type === 'error' ? 'close' : type === 'warning' ? 'spark' : type === 'danger' ? 'skull' : 'star';
    node.innerHTML = `<span class="toast-icon">${icon(ic)}</span><div><b>${escapeHtml(title)}</b>${text ? `<small>${escapeHtml(text)}</small>` : ''}</div>`;
    wrap.appendChild(node);
    this.toastCount++;
    setTimeout(() => {
      node.classList.add('out');
      setTimeout(() => { node.remove(); this.toastCount = Math.max(0, this.toastCount - 1); }, 260);
    }, duration);
  }

  zoneBanner(name, subtitle) {
    const node = el('zone-banner');
    if (!node) return;
    el('zone-name').textContent = name;
    el('zone-sub').textContent = subtitle || '';
    node.classList.add('hidden');
    void node.offsetWidth;
    node.classList.remove('hidden');
    clearTimeout(this._zoneTimer);
    this._zoneTimer = setTimeout(() => node.classList.add('hidden'), 4300);
  }

  fadeOut(cb) {
    const f = el('fade');
    if (!f) { cb?.(); return; }
    f.classList.add('on');
    setTimeout(() => cb?.(), 420);
  }

  fadeIn() {
    const f = el('fade');
    if (f) f.classList.remove('on');
  }

  updateAudioButton() {
    const muted = this.game.settings.muted;
    for (const b of qsa('[data-action="toggle-audio"] [data-icon]')) {
      b.innerHTML = icon(muted ? 'close' : 'mana');
    }
  }

  // -------------------------------------------------------------------------
  // GAME OVER / FINAL
  // -------------------------------------------------------------------------

  showGameOver() {
    this.showScreen('gameover');
    el('hud').classList.add('hidden');
    this.setTouchVisible(false);
    const s = this.game.state;
    el('gameover-text').textContent = 'Pero el amanecer aún puede encontrarte. Reaparecerás en el último santuario visitado y perderás parte del oro.';
    el('gameover-stats').innerHTML = `
      <span class="meta-pill">${icon('skull')} ${s.kills || 0} enemigos derrotados</span>
      <span class="meta-pill">${icon('quest')} ${formatTime(s.playTime)}</span>
      <span class="meta-pill">${icon('gold')} ${formatNumber(s.player.gold)} oro</span>`;
  }

  showEnding() {
    this.showScreen('ending');
    el('hud').classList.add('hidden');
    this.setTouchVisible(false);
    const s = this.game.state;
    el('ending-stats').innerHTML = `
      <span class="meta-pill">${icon('star')} Nivel ${s.player.level}</span>
      <span class="meta-pill">${icon('quest')} ${formatTime(s.playTime)}</span>
      <span class="meta-pill">${icon('skull')} ${s.kills || 0} enemigos</span>
      <span class="meta-pill">${icon('slime')} ${Object.keys(s.creatures || {}).length} criaturas</span>`;
  }
}
