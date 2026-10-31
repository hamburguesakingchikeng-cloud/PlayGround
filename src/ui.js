// ============================================================
// LA ESPADA CELESTIAL — interfaz, diálogos, cines y controles
// ============================================================
import {
  clamp, fmt, formatPlaytime, SaveSystem, STAT_KEYS, ELEMENTS,
} from './core.js';
import {
  APPEARANCE, ITEMS, SPELLS, CREATURES, SKILLS, RARITY, PORTRAITS,
} from './data.js';
import { ZONES, REGIONS, LORE, QUESTS, ENDINGS } from './story.js';
import { drawCreature } from './art.js';
import {
  renderMenuShell, renderSaveSlots, renderOptions, renderCredits, renderLore,
  renderShop, renderForge, renderEndingChoices, renderDeath, renderEndingEpilogue,
  paintOverlay, esc,
} from './menu.js';

const $ = id => document.getElementById(id);
const SPELL_LIST = Object.values(SPELLS);
const BASE_ATTR = 5;

function defaultCreation(slot = 0) {
  const attrs = {};
  for (const s of STAT_KEYS) attrs[s.id] = BASE_ATTR;
  return {
    slot, name: 'Aurora', face: 'serena', hair: 'corto', hairColor: 'azabache',
    outfit: 'viajero', accessory: 'ninguno', attrs, points: 6,
  };
}

function nowString() {
  return new Date().toLocaleString('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}

export class UI {
  constructor({ renderer, input, audio }) {
    this.renderer = renderer;
    this.input = input;
    this.audio = audio;
    this.game = null;
    this.blockingInput = false;
    this._time = 0;
    this._lastPortrait = 0;
    this._lastMinimap = 0;
    this._lastCompanion = 0;
    this._bannerTimer = null;
    this._hintTimer = null;
    this._toastTimers = [];
    this._confirmDeleteSlot = null;
    this._pausedDialogue = false;
    this._overlayFromGame = false;
    this._optionsFrom = 'title';
    this._slotMode = 'load';
    this.menuOpen = false;
    this.menuTab = 'character';
    this.overlayMode = null;
    this.mapZone = null;
    this.selectedCreature = null;
    this.touchActive = false;
    this.touchSpell = 0;
    this.creation = defaultCreation(0);
    this.dialogue = null;
    this.cinematic = null;
    this.refs = {
      app: $('app'), canvas: $('game-canvas'), hud: $('hud'), touch: $('touch'),
      titleScreen: $('title-screen'), titleCanvas: $('title-canvas'),
      creationScreen: $('creation-screen'), previewCanvas: $('preview-canvas'),
      overlay: $('overlay'), dialogueLayer: $('dialogue-layer'), cinematicLayer: $('cinematic-layer'),
      toasts: $('toasts'), banner: $('banner'), fade: $('fade'), boot: $('boot'),
      rotateHint: $('rotate-hint'),
    };
    this._bindTitle();
    this._bindCreation();
    this._bindOverlay();
    this._bindDialogue();
    this._bindCinematic();
    this._bindTouch();
    this._bindKeyboard();
    this.applyTouchMode();
    this.updateContinue();
  }

  attach(game) {
    this.game = game;
    this.applyTouchMode();
    this.updateContinue();
    this.refs.hud.classList.add('hidden');
    this.refs.touch.classList.add('hidden');
    this.refs.dialogueLayer.classList.add('hidden');
    this.refs.cinematicLayer.classList.add('hidden');
    this.refs.overlay.classList.add('hidden');
  }

  // ==========================================================
  // PANTALLAS
  // ==========================================================
  _bindTitle() {
    $('btn-new').addEventListener('click', () => {
      this.audio.sfx('ui');
      this.showSaveSlots('new');
    });
    $('btn-continue').addEventListener('click', () => {
      if (!SaveSystem.hasAny()) { this.toast('No hay partidas guardadas', 'bad'); return; }
      this.audio.sfx('ui');
      this.showSaveSlots('load');
    });
    $('btn-options-title').addEventListener('click', () => {
      this.audio.sfx('ui');
      this.openOptions('title');
    });
    $('btn-credits').addEventListener('click', () => {
      this.audio.sfx('ui');
      this.openCredits();
    });
  }

  updateContinue() {
    const latest = SaveSystem.latest();
    const btn = $('btn-continue');
    const sub = $('continue-sub');
    if (!btn) return;
    if (latest && latest.player) {
      btn.disabled = false;
      const zone = ZONES[latest.zoneId]?.name || 'el camino';
      sub.textContent = `${latest.player.name || 'Aurora'} · Nv. ${latest.player.level || 1} · ${zone}`;
    } else {
      btn.disabled = true;
      sub.textContent = 'No hay partidas guardadas';
    }
  }

  startCreation(slot = 0) {
    this.creation = defaultCreation(slot);
    this.creation.slot = slot;
    this.refs.titleScreen.classList.add('hidden');
    this.refs.creationScreen.classList.remove('hidden');
    this.refs.overlay.classList.add('hidden');
    this.overlayMode = null;
    this.renderCreation();
    this.audio.sfx('ui');
  }

  _bindCreation() {
    $('creation-back').addEventListener('click', () => {
      this.audio.sfx('ui_back');
      this.refs.creationScreen.classList.add('hidden');
      this.refs.titleScreen.classList.remove('hidden');
    });
    $('btn-randomize').addEventListener('click', () => {
      this.audio.sfx('ui');
      this.randomizeCreation();
    });
    $('btn-begin').addEventListener('click', () => this.beginGame());
    $('char-name').addEventListener('input', e => {
      this.creation.name = e.target.value.slice(0, 16) || 'Aurora';
      $('preview-name').textContent = this.creation.name.toUpperCase();
    });
    for (const b of document.querySelectorAll('[data-name]')) {
      b.addEventListener('click', () => {
        this.creation.name = b.dataset.name;
        $('char-name').value = this.creation.name;
        $('preview-name').textContent = this.creation.name.toUpperCase();
        this.audio.sfx('ui');
      });
    }
    $('appearance-options').addEventListener('click', e => {
      const b = e.target.closest('[data-app]');
      if (!b) return;
      this.cycleAppearance(b.dataset.app, Number(b.dataset.dir));
    });
    $('stat-grid').addEventListener('click', e => {
      const b = e.target.closest('[data-char-attr]');
      if (!b) return;
      this.changeCreationAttr(b.dataset.charAttr, Number(b.dataset.dir));
    });
  }

  creationLook() {
    return {
      face: this.creation.face, hair: this.creation.hair, hairColor: this.creation.hairColor,
      outfit: this.creation.outfit, accessory: this.creation.accessory,
    };
  }

  creationTitle() {
    const attrs = this.creation.attrs;
    const top = Object.entries(attrs).sort((a, b) => b[1] - a[1])[0]?.[0];
    return ({
      vida: 'Corazón del Alba', mana: 'Voz del Velo', resistencia: 'Muro de Brisa',
      fuerza: 'Filo del Alba', defensa: 'Guardián de los Reinos', velocidad: 'Paso de Cometa',
      inteligencia: 'Erudito de Kansordore', suerte: 'Jugador Cero',
    })[top] || 'Resonante del Alba';
  }

  cycleAppearance(key, dir) {
    const lists = {
      face: APPEARANCE.faces, hair: APPEARANCE.hairs, hairColor: APPEARANCE.hairColors,
      outfit: APPEARANCE.outfits, accessory: APPEARANCE.accessories,
    };
    const list = lists[key];
    if (!list) return;
    const cur = list.findIndex(o => o.id === this.creation[key]);
    const next = (cur + dir + list.length) % list.length;
    this.creation[key] = list[next].id;
    this.renderCreation();
    this.audio.sfx('ui');
  }

  changeCreationAttr(key, dir) {
    const attrs = this.creation.attrs;
    if (dir > 0 && this.creation.points > 0) {
      attrs[key]++;
      this.creation.points--;
    } else if (dir < 0 && attrs[key] > BASE_ATTR) {
      attrs[key]--;
      this.creation.points++;
    } else return;
    this.renderCreation();
    this.audio.sfx('ui');
  }

  randomizeCreation() {
    const pick = arr => arr[Math.floor(Math.random() * arr.length)].id;
    this.creation.face = pick(APPEARANCE.faces);
    this.creation.hair = pick(APPEARANCE.hairs);
    this.creation.hairColor = pick(APPEARANCE.hairColors);
    this.creation.outfit = pick(APPEARANCE.outfits);
    this.creation.accessory = pick(APPEARANCE.accessories);
    const keys = STAT_KEYS.map(s => s.id);
    const attrs = {};
    for (const k of keys) attrs[k] = BASE_ATTR;
    let pts = 6;
    while (pts > 0) { attrs[keys[Math.floor(Math.random() * keys.length)]]++; pts--; }
    this.creation.attrs = attrs;
    this.creation.points = 0;
    this.renderCreation();
  }

  renderCreation() {
    const c = this.creation;
    const option = (key, label, list) => {
      const cur = list.find(o => o.id === c[key]) || list[0];
      return `<div class="option-row"><span class="opt-label">${label}</span><button data-app="${key}" data-dir="-1" aria-label="Anterior ${label}">‹</button><span class="opt-value">${esc(cur.name)}</span><button data-app="${key}" data-dir="1" aria-label="Siguiente ${label}">›</button></div>`;
    };
    $('appearance-options').innerHTML = [
      option('face', 'Rostro', APPEARANCE.faces),
      option('hair', 'Pelo', APPEARANCE.hairs),
      option('hairColor', 'Color', APPEARANCE.hairColors),
      option('outfit', 'Ropa', APPEARANCE.outfits),
      option('accessory', 'Detalle', APPEARANCE.accessories),
    ].join('');
    $('stat-grid').innerHTML = STAT_KEYS.map(s => {
      const v = c.attrs[s.id];
      return `<div class="stat-cell" title="${esc(s.desc)}"><span class="sname">${s.icon} ${s.short}</span><span class="sval"><button data-char-attr="${s.id}" data-dir="-1" ${v <= BASE_ATTR ? 'disabled' : ''} aria-label="Bajar ${esc(s.name)}">−</button><b>${v}</b><button data-char-attr="${s.id}" data-dir="1" ${c.points <= 0 ? 'disabled' : ''} aria-label="Subir ${esc(s.name)}">+</button></span></div>`;
    }).join('');
    $('points-left').textContent = `${c.points} punto${c.points === 1 ? '' : 's'} disponible${c.points === 1 ? '' : 's'}`;
    $('preview-name').textContent = (c.name || 'Aurora').toUpperCase();
    $('preview-title').textContent = this.creationTitle();
    $('char-name').value = c.name;
  }

  beginGame() {
    const name = ($('char-name').value || '').trim().slice(0, 16) || 'Aurora';
    this.creation.name = name;
    const profile = {
      name,
      ...this.creationLook(),
      attributes: { ...this.creation.attrs },
    };
    this.audio.sfx('ui');
    this.refs.creationScreen.classList.add('hidden');
    if (!this.game) return;
    this.game.slot = this.creation.slot || 0;
    this.game.newGame(profile);
  }

  enterGame(game) {
    this.refs.titleScreen.classList.add('hidden');
    this.refs.creationScreen.classList.add('hidden');
    this.refs.hud.classList.remove('hidden');
    this.refs.overlay.classList.add('hidden');
    this.refs.dialogueLayer.classList.add('hidden');
    this.refs.cinematicLayer.classList.add('hidden');
    this.dialogue = null;
    this.cinematic = null;
    this.menuOpen = false;
    this.overlayMode = null;
    this.selectedCreature = game.activeCreature || null;
    this.applyTouchMode();
    this.updateContinue();
    this.updateHUD(game);
    this.showHint(this.touchActive
      ? 'Mueve con el joystick. Ataca, esquiva y bloquea con los botones. Pulsa Acción junto a personas y objetos.'
      : 'WASD para moverte · J atacar · K pesado · Espacio esquivar · L bloquear · E interactuar', 9000);
  }

  returnToTitle() {
    if (this.game?.player) this.game.save(this.game.slot, true);
    this.closeOverlay({ silent: true });
    this.refs.overlay.classList.add('hidden');
    this.refs.dialogueLayer.classList.add('hidden');
    this.refs.cinematicLayer.classList.add('hidden');
    this.refs.hud.classList.add('hidden');
    this.refs.touch.classList.add('hidden');
    this.refs.creationScreen.classList.add('hidden');
    this.refs.titleScreen.classList.remove('hidden');
    this.dialogue = null;
    this.cinematic = null;
    this.blockingInput = false;
    this._pausedDialogue = false;
    this.overlayMode = null;
    this.menuOpen = false;
    if (this.game) {
      this.game.state = 'title';
      this.game.player = null;
      this.game.zone = null;
      this.game.zoneId = null;
      this.game.enemies = [];
      this.game.boss = null;
      this.game.projectiles = [];
      this.game.loot = [];
      this.game.nearInteractable = null;
      this.game.targetEnemy = null;
    }
    this.audio.setMode('title', false);
    this.updateContinue();
  }

  // ==========================================================
  // HUD
  // ==========================================================
  updateHUD(game) {
    const p = game.player;
    if (!p) return;
    const setBar = (id, txt, value, max) => {
      const el = $(id);
      if (el) el.style.transform = `scaleX(${clamp(value / Math.max(1, max), 0, 1)})`;
      const t = $(txt);
      if (t) t.textContent = `${Math.ceil(value)} / ${Math.round(max)}`;
    };
    setBar('bar-hp', 'txt-hp', p.hp, p.maxHP);
    setBar('bar-mp', 'txt-mp', p.mp, p.maxMP);
    setBar('bar-st', 'txt-st', p.stamina, p.maxStamina);
    const xp = $('bar-xp');
    if (xp) xp.style.transform = `scaleX(${clamp(p.xp / Math.max(1, p.xpNext), 0, 1)})`;
    const xt = $('txt-xp');
    if (xt) xt.textContent = `${fmt(p.xp)} / ${fmt(p.xpNext)} XP`;
    $('hud-name').textContent = p.name;
    $('hud-level').textContent = `Nv. ${p.level}`;
    $('hud-element').textContent = (ELEMENTS[p.weaponElement]?.name || 'Luz').toUpperCase();
    const zone = game.zone;
    $('region-label').textContent = (REGIONS[zone?.region]?.name || '').toUpperCase();
    $('zone-label').textContent = zone?.name || '';
    $('time-label').textContent = game.timeLabel();
    $('gold-label').textContent = `◈ ${fmt(p.gold)}`;
    const q = game.currentQuest;
    $('quest-title').textContent = q ? QUESTS[q].title : 'Explora los tres reinos';
    $('quest-objective').textContent = game.questObjective;
    const qEyebrow = document.querySelector('#quest-tracker .quest-eyebrow');
    if (qEyebrow) qEyebrow.textContent = q && QUESTS[q]?.main ? 'MISIÓN PRINCIPAL' : 'MISIÓN SECUNDARIA';
    const bossBar = $('boss-bar');
    if (game.boss && !game.boss.dead) {
      bossBar.classList.remove('hidden');
      $('boss-name').textContent = game.boss.name;
      $('boss-phase').textContent = `FASE ${['I', 'II', 'III'][game.boss.phase - 1] || game.boss.phase}`;
      $('boss-fill').style.transform = `scaleX(${clamp(game.boss.hpPct, 0, 1)})`;
    } else bossBar.classList.add('hidden');
    const chip = $('companion-chip');
    if (game.companion) {
      chip.classList.remove('hidden');
      $('companion-name').textContent = game.companion.def.name;
      $('companion-state').textContent = game.companion.downed ? 'Caído' : (game.companion.abilityCooldown > 0 ? `${Math.ceil(game.companion.abilityCooldown)} s` : 'Listo');
    } else chip.classList.add('hidden');
    this._paintSpellButton();
    if (this._time - this._lastPortrait > 0.18) {
      this._lastPortrait = this._time;
      const c = $('hud-portrait');
      if (c) this.renderer.drawPortrait(c, 'player', p.look, this._time);
      if (game.companion) {
        const cc = $('companion-icon');
        if (cc) this._paintCreatureIcon(cc, game.companion.def.id);
      }
    }
    if (this._time - this._lastMinimap > 0.35) {
      this._lastMinimap = this._time;
      const mm = $('minimap');
      if (mm) this.renderer.drawMinimap(mm, game);
    }
  }

  _paintCreatureIcon(canvas, id) {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawCreature(ctx, id, canvas.width / 2, canvas.height * 0.8, canvas.width / 105, this._time, 0, 'idle');
  }

  _paintSpellButton() {
    const btn = document.querySelector('.tbtn-spell');
    if (!btn) return;
    const spell = SPELL_LIST[this.touchSpell] || SPELL_LIST[0];
    const span = btn.querySelector('span');
    const small = btn.querySelector('small');
    if (span) span.textContent = spell.icon;
    if (small) small.textContent = spell.name.split(' ')[0];
  }

  updatePrompts(game) {
    const it = game.nearInteractable;
    const prompt = $('interact-prompt');
    const touchInteract = $('touch-interact');
    if (it && !this.blockingInput && game.state === 'playing' && !this.dialogue && !this.cinematic) {
      prompt.classList.remove('hidden');
      $('interact-text').textContent = it.label;
      touchInteract.classList.remove('hidden');
    } else {
      prompt.classList.add('hidden');
      touchInteract.classList.add('hidden');
    }
    const target = game.targetEnemy;
    const cp = $('capture-prompt');
    const tc = $('touch-capture');
    if (target && target.canCapture && !this.blockingInput && game.state === 'playing') {
      const def = CREATURES[target.capturable];
      let p = def.capture + game.player.captureBonus + (game.flags.bond_buff || 0) - target.hpPct * 0.25;
      p = clamp(p, 0.06, 0.95);
      cp.classList.remove('hidden');
      $('capture-chance').textContent = `${Math.round(p * 100)}%`;
      tc.classList.remove('hidden');
    } else {
      cp.classList.add('hidden');
      tc.classList.add('hidden');
    }
  }

  showHint(text, duration = 5000) {
    const h = $('hint');
    if (!h) return;
    h.textContent = text;
    h.classList.remove('hidden');
    h.style.opacity = '1';
    clearTimeout(this._hintTimer);
    this._hintTimer = setTimeout(() => {
      h.style.opacity = '0';
      setTimeout(() => h.classList.add('hidden'), 420);
    }, duration);
  }

  // ==========================================================
  // DIÁLOGOS
  // ==========================================================
  _bindDialogue() {
    $('dialogue-next').addEventListener('click', () => this.advanceDialogue());
    $('dialogue-choices').addEventListener('click', e => {
      const b = e.target.closest('[data-choice]');
      if (b) this.chooseDialogue(Number(b.dataset.choice));
    });
    this.refs.dialogueLayer.addEventListener('click', e => {
      if (e.target === this.refs.dialogueLayer || e.target.classList.contains('dialogue-letterbox')) this.advanceDialogue();
    });
  }

  openDialogue(data, opts = {}) {
    if (!data || !Array.isArray(data.lines)) return;
    this.dialogue = {
      data, opts, index: 0, shown: 0, typing: true, finished: false,
    };
    this.refs.overlay.classList.add('hidden');
    this.overlayMode = null;
    this.menuOpen = false;
    this.refs.dialogueLayer.classList.remove('hidden');
    this.blockingInput = true;
    this._renderDialogueLine();
  }

  _renderDialogueLine() {
    const d = this.dialogue;
    if (!d) return;
    const line = d.data.lines[d.index];
    if (!line) { this.finishDialogue(); return; }
    const speaker = line.speaker || d.data.speaker || (d.opts.npcId ? (d.data.role || 'Habitante') : 'Voz');
    $('dialogue-speaker').textContent = speaker;
    const role = line.role || d.data.role || '';
    $('dialogue-role').textContent = role;
    const portrait = line.portrait || d.data.portrait || d.opts.npcId || 'elara';
    const c = $('dialogue-portrait');
    if (c) this.renderer.drawPortrait(c, portrait, this.game?.player?.look, this._time);
    const raw = String(line.text || '').replace(/\{\{name\}\}/g, this.game?.player?.name || 'Aurora');
    d.fullText = raw;
    d.shown = 0;
    d.typing = true;
    $('dialogue-text').textContent = '';
    $('dialogue-text').classList.add('typing');
    $('dialogue-choices').innerHTML = '';
    const next = $('dialogue-next');
    next.classList.add('hidden');
    next.innerHTML = 'Continuar <kbd>Espacio</kbd>';
    if (this.game?.settings?.reduceMotion) {
      d.shown = raw.length;
      d.typing = false;
      $('dialogue-text').textContent = raw;
      $('dialogue-text').classList.remove('typing');
      this._showDialogueOptions();
    }
  }

  _showDialogueOptions() {
    const d = this.dialogue;
    if (!d) return;
    const line = d.data.lines[d.index];
    if (!line) return;
    const choices = line.choices || [];
    if (choices.length) {
      $('dialogue-choices').innerHTML = choices.map((c, i) => `<button class="dialogue-choice" data-choice="${i}">${esc(c.text)}${c.effect ? '<small>▸ Elige esta respuesta</small>' : ''}</button>`).join('');
      $('dialogue-next').classList.add('hidden');
    } else {
      $('dialogue-choices').innerHTML = '';
      const next = $('dialogue-next');
      next.classList.remove('hidden');
      next.innerHTML = line.end ? 'Terminar <kbd>Espacio</kbd>' : 'Continuar <kbd>Espacio</kbd>';
    }
  }

  advanceDialogue() {
    const d = this.dialogue;
    if (!d || d.finished) return;
    const line = d.data.lines[d.index];
    if (!line) { this.finishDialogue(); return; }
    if (d.typing) {
      d.typing = false;
      d.shown = d.fullText.length;
      $('dialogue-text').textContent = d.fullText;
      $('dialogue-text').classList.remove('typing');
      this._showDialogueOptions();
      this.audio.sfx('ui');
      return;
    }
    if ((line.choices || []).length) return;
    if (line.end) { this.finishDialogue(); return; }
    if (line.next != null && d.data.lines[line.next]) d.index = line.next;
    else d.index++;
    this.audio.sfx('ui');
    if (d.index >= d.data.lines.length) this.finishDialogue();
    else this._renderDialogueLine();
  }

  chooseDialogue(index) {
    const d = this.dialogue;
    if (!d) return;
    const line = d.data.lines[d.index];
    const choice = line?.choices?.[index];
    if (!choice) return;
    this.audio.sfx('ui');
    if (choice.effect && d.opts.onEffect) d.opts.onEffect(choice.effect);
    if (choice.end) { this.finishDialogue(); return; }
    if (choice.next != null && d.data.lines[choice.next]) d.index = choice.next;
    else d.index++;
    if (d.index >= d.data.lines.length) this.finishDialogue();
    else this._renderDialogueLine();
  }

  finishDialogue() {
    const d = this.dialogue;
    if (!d || d.finished) return;
    d.finished = true;
    this.refs.dialogueLayer.classList.add('hidden');
    this.dialogue = null;
    this.input.just.clear();
    if (d.opts.onEnd) d.opts.onEnd();
    else this.blockingInput = false;
  }

  // ==========================================================
  // CINEMÁTICAS
  // ==========================================================
  _bindCinematic() {
    $('cine-next').addEventListener('click', () => this.advanceCinematic());
    $('cine-skip').addEventListener('click', () => this.skipCinematic());
    this.refs.cinematicLayer.addEventListener('click', e => {
      if (e.target === this.refs.cinematicLayer || e.target === $('cine-canvas')) this.advanceCinematic();
    });
  }

  playCinematic(data, onDone) {
    if (!data || !Array.isArray(data.pages) || !data.pages.length) { onDone?.(); return; }
    this.refs.overlay.classList.add('hidden');
    this.refs.dialogueLayer.classList.add('hidden');
    this.dialogue = null;
    this.cinematic = { data, onDone, index: 0, finished: false, ending: null };
    this.refs.cinematicLayer.classList.remove('hidden');
    this.blockingInput = true;
    this._renderCinePage();
  }

  playEnding(ending, game) {
    const pages = ending.pages.map((text, i) => ({
      eyebrow: ending.subtitle || 'FINAL',
      title: i === 0 ? ending.title : '',
      text,
      art: ending.art,
    }));
    this.cinematic = {
      data: { title: ending.title, pages },
      onDone: null,
      index: 0,
      finished: false,
      ending,
    };
    this.refs.overlay.classList.add('hidden');
    this.refs.dialogueLayer.classList.add('hidden');
    this.refs.cinematicLayer.classList.remove('hidden');
    this.blockingInput = true;
    this._renderCinePage();
    this.audio.sfx('levelup');
  }

  _renderCinePage() {
    const c = this.cinematic;
    if (!c) return;
    const page = c.data.pages[c.index];
    if (!page) { this.finishCinematic(); return; }
    $('cine-eyebrow').textContent = page.eyebrow || c.data.title || '';
    const titleEl = $('cine-title');
    titleEl.textContent = page.title || '';
    titleEl.style.display = page.title ? '' : 'none';
    $('cine-text').textContent = page.text || '';
    const dots = $('cine-dots');
    dots.innerHTML = c.data.pages.map((_, i) => `<i class="${i === c.index ? 'on' : ''}"></i>`).join('');
    const next = $('cine-next');
    next.innerHTML = `<span><b>${c.index >= c.data.pages.length - 1 ? (c.ending ? 'Ver epílogo' : 'Continuar') : 'Siguiente'}</b></span>`;
    $('cine-skip').textContent = c.ending ? 'Saltar epílogo' : 'Saltar';
    this.renderer.drawCinematic(page.art || 'sword', this._time);
  }

  advanceCinematic() {
    const c = this.cinematic;
    if (!c || c.finished) return;
    if (c.index >= c.data.pages.length - 1) { this.finishCinematic(); return; }
    c.index++;
    this.audio.sfx('ui');
    this._renderCinePage();
  }

  skipCinematic() {
    const c = this.cinematic;
    if (!c || c.finished) return;
    c.index = c.data.pages.length - 1;
    this.finishCinematic();
  }

  finishCinematic() {
    const c = this.cinematic;
    if (!c || c.finished) return;
    c.finished = true;
    this.refs.cinematicLayer.classList.add('hidden');
    this.cinematic = null;
    this.input.just.clear();
    if (c.ending) {
      this.showEndingEpilogue(c.ending);
      return;
    }
    if (c.onDone) c.onDone();
    else this.blockingInput = false;
  }

  // ==========================================================
  // OVERLAYS Y MENÚS
  // ==========================================================
  _bindOverlay() {
    const overlay = this.refs.overlay;
    overlay.addEventListener('click', e => {
      const toggle = e.target.closest('[data-setting][data-kind="toggle"]');
      if (toggle && this.game) {
        const key = toggle.dataset.setting;
        this.game.setSetting(key, !this.game.settings[key]);
        this.audio.sfx('ui');
        return;
      }
      const el = e.target.closest('[data-cmd]');
      if (!el || el.disabled) return;
      this.handleCommand(el.dataset.cmd, el.dataset, el);
    });
    overlay.addEventListener('change', e => {
      const el = e.target.closest('[data-setting]');
      if (!el || !this.game) return;
      this.applySettingControl(el);
    });
    overlay.addEventListener('input', e => {
      const el = e.target.closest('input[type="range"][data-setting]');
      if (!el || !this.game) return;
      this.applySettingControl(el);
    });
  }

  applySettingControl(el) {
    const key = el.dataset.setting;
    const kind = el.dataset.kind;
    if (!key || !this.game) return;
    let value;
    if (kind === 'range') value = Number(el.value);
    else if (kind === 'toggle') value = !this.game.settings[key];
    else value = el.value;
    this.game.setSetting(key, value);
  }

  handleCommand(cmd, data, el) {
    const game = this.game;
    switch (cmd) {
      case 'close-overlay': this.audio.sfx('ui_back'); this.closeOverlay(); break;
      case 'menu-tab':
        this.menuTab = data.tab;
        this.audio.sfx('ui');
        this.refreshMenu();
        break;
      case 'spend-attr': game.spendAttribute(data.key); this.audio.sfx('ui'); this.refreshMenu(); break;
      case 'equip': game.equipItem(data.id); this.refreshMenu(); break;
      case 'unequip': game.unequip(data.slot); this.refreshMenu(); break;
      case 'use-item': game.useItem(data.id); this.refreshMenu(); break;
      case 'sell-item': game.sellItem(data.id); this.refreshMenu(); break;
      case 'learn-skill': game.learnSkill(data.id); this.refreshMenu(); break;
      case 'select-creature': this.selectedCreature = data.id; this.audio.sfx('ui'); this.refreshMenu(); break;
      case 'activate-creature': game.setActiveCreature(data.id); this.selectedCreature = data.id; this.refreshMenu(); break;
      case 'map-zone': this.mapZone = data.zone; this.audio.sfx('ui'); this.refreshMenu(); break;
      case 'open-lore': this.openLore(data.id); break;
      case 'save-slot': game.save(Number(data.slot)); this.refreshMenu(); break;
      case 'load-slot': this.loadSlot(Number(data.slot)); break;
      case 'delete-slot': this.deleteSlot(Number(data.slot)); break;
      case 'new-slot': this.startCreation(Number(data.slot)); break;
      case 'shop-buy': game.buyItem(data.shop, data.id); this.refreshMenu(); break;
      case 'shop-sell': game.sellItem(data.id); this.refreshMenu(); break;
      case 'forge-open': this.openForge(); break;
      case 'forge-upgrade': game.forgeUpgrade(data.id); this.refreshMenu(); break;
      case 'choose-ending':
        this.refs.overlay.classList.add('hidden');
        this.overlayMode = null;
        this.menuOpen = false;
        game.chooseEnding(data.id);
        break;
      case 'respawn': game.respawn(); break;
      case 'death-load': this.showSaveSlots('load'); break;
      case 'to-title': this.returnToTitle(); break;
      case 'noop': break;
      default: break;
    }
  }

  openMenu(tab = 'character') {
    const game = this.game;
    if (!game || !game.player || game.state === 'dead' || game.state === 'ending' || this.dialogue || this.cinematic) return;
    this.menuOpen = true;
    this.menuTab = tab || 'character';
    this.overlayMode = 'menu';
    this._overlayFromGame = true;
    this.blockingInput = true;
    this.mapZone = this.mapZone || game.zoneId;
    this.refs.overlay.classList.remove('hidden');
    this.refs.overlay.innerHTML = renderMenuShell(this, this.menuTab);
    paintOverlay(this);
    this.audio.sfx('ui');
    $('hud')?.classList.add('hidden');
  }

  refreshMenu() {
    if (!this.overlayMode) return;
    const active = document.activeElement;
    if (active && active.tagName === 'INPUT' && active.type === 'range') return;
    if (this.overlayMode === 'menu' && this.menuOpen) {
      this.refs.overlay.innerHTML = renderMenuShell(this, this.menuTab);
      paintOverlay(this);
    } else if (this.overlayMode === 'shop') {
      this.refs.overlay.innerHTML = renderShop(this, this._shopId);
      paintOverlay(this);
    } else if (this.overlayMode === 'forge') {
      this.refs.overlay.innerHTML = renderForge(this);
      paintOverlay(this);
    } else if (this.overlayMode === 'options') {
      this.refs.overlay.innerHTML = renderOptions(this, this._optionsFrom);
      paintOverlay(this);
    } else if (this.overlayMode === 'slots') {
      this.refs.overlay.innerHTML = renderSaveSlots(this, this._slotMode);
      paintOverlay(this);
    } else if (this.overlayMode === 'lore') {
      this.refs.overlay.innerHTML = renderLore(this, this._loreId);
      paintOverlay(this);
    } else if (this.overlayMode === 'ending') {
      this.refs.overlay.innerHTML = renderEndingChoices(this);
      paintOverlay(this);
    }
  }

  closeOverlay(opts = {}) {
    const wasFromGame = this._overlayFromGame;
    const paused = this._pausedDialogue;
    this.refs.overlay.classList.add('hidden');
    this.refs.overlay.innerHTML = '';
    this.menuOpen = false;
    this.overlayMode = null;
    this._overlayFromGame = false;
    this._pausedDialogue = false;
    this._confirmDeleteSlot = null;
    if (paused) {
      this.refs.dialogueLayer.classList.remove('hidden');
      this.blockingInput = true;
      return;
    }
    if (wasFromGame && !opts.silent) this.blockingInput = false;
    if (wasFromGame) $('hud')?.classList.remove('hidden');
  }

  openShop(shopId) {
    this._shopId = shopId;
    if (this.dialogue) {
      this._pausedDialogue = true;
      this.refs.dialogueLayer.classList.add('hidden');
    }
    this.overlayMode = 'shop';
    this._overlayFromGame = !!this.game?.player;
    this.menuOpen = false;
    this.blockingInput = true;
    this.refs.overlay.classList.remove('hidden');
    this.refs.overlay.innerHTML = renderShop(this, shopId);
    paintOverlay(this);
    this.audio.sfx('ui');
    $('hud')?.classList.add('hidden');
  }

  openForge() {
    if (this.dialogue) {
      this._pausedDialogue = true;
      this.refs.dialogueLayer.classList.add('hidden');
    }
    this.overlayMode = 'forge';
    this._overlayFromGame = !!this.game?.player;
    this.menuOpen = false;
    this.blockingInput = true;
    this.refs.overlay.classList.remove('hidden');
    this.refs.overlay.innerHTML = renderForge(this);
    paintOverlay(this);
    this.audio.sfx('ui');
    $('hud')?.classList.add('hidden');
  }

  openLore(id) {
    this._loreId = id;
    this.overlayMode = 'lore';
    this._overlayFromGame = !!this.game?.player;
    this.menuOpen = false;
    this.blockingInput = true;
    this.refs.overlay.classList.remove('hidden');
    this.refs.overlay.innerHTML = renderLore(this, id);
    paintOverlay(this);
    this.audio.sfx('ui');
    $('hud')?.classList.add('hidden');
  }

  openOptions(from = 'game') {
    this._optionsFrom = from;
    this.overlayMode = 'options';
    this._overlayFromGame = from === 'game';
    this.menuOpen = false;
    if (from === 'game') this.blockingInput = true;
    this.refs.overlay.classList.remove('hidden');
    this.refs.overlay.innerHTML = renderOptions(this, from);
    paintOverlay(this);
  }

  openCredits() {
    this.overlayMode = 'credits';
    this._overlayFromGame = false;
    this.menuOpen = false;
    this.refs.overlay.classList.remove('hidden');
    this.refs.overlay.innerHTML = renderCredits();
  }

  showSaveSlots(mode = 'load') {
    this._slotMode = mode;
    this.overlayMode = 'slots';
    this._overlayFromGame = !!this.game?.player && this.game?.state !== 'title';
    this.menuOpen = false;
    if (this._overlayFromGame) this.blockingInput = true;
    this.refs.overlay.classList.remove('hidden');
    this.refs.overlay.innerHTML = renderSaveSlots(this, mode);
  }

  loadSlot(slot) {
    if (!this.game) return;
    if (!this.game.load(slot)) return;
    this.refs.overlay.classList.add('hidden');
    this.overlayMode = null;
    this.menuOpen = false;
    this._overlayFromGame = false;
    this._pausedDialogue = false;
    this.blockingInput = false;
    this.refs.hud.classList.remove('hidden');
    this.updateContinue();
  }

  deleteSlot(slot) {
    if (this._confirmDeleteSlot !== slot) {
      this._confirmDeleteSlot = slot;
      this.refreshMenu();
      return;
    }
    SaveSystem.delete(slot);
    this._confirmDeleteSlot = null;
    this.audio.sfx('ui_back');
    this.toast(`Ranura ${slot + 1} borrada`, 'bad');
    this.updateContinue();
    this.refreshMenu();
  }

  showEndingChoices(game) {
    this.overlayMode = 'ending';
    this._overlayFromGame = true;
    this.menuOpen = false;
    this.blockingInput = true;
    this.refs.overlay.classList.remove('hidden');
    this.refs.overlay.innerHTML = renderEndingChoices(this);
    this.audio.sfx('quest');
    $('hud')?.classList.add('hidden');
  }

  showEndingEpilogue(ending) {
    this.overlayMode = 'epilogue';
    this._overlayFromGame = true;
    this.blockingInput = true;
    this.refs.overlay.classList.remove('hidden');
    this.refs.overlay.innerHTML = renderEndingEpilogue(this, ending);
    this.audio.setMode('title', false);
  }

  showDeath(game) {
    this.overlayMode = 'death';
    this._overlayFromGame = true;
    this.blockingInput = true;
    this.refs.overlay.classList.remove('hidden');
    this.refs.overlay.innerHTML = renderDeath(this);
    this.audio.sfx('death');
    $('hud')?.classList.add('hidden');
  }

  // ==========================================================
  // AVISOS
  // ==========================================================
  toast(text, kind = '') {
    const box = this.refs.toasts;
    if (!box) return;
    const el = document.createElement('div');
    el.className = `toast ${kind}`;
    const glyph = kind === 'good' ? '✓' : kind === 'bad' ? '✕' : kind === 'rare' ? '✦' : '◆';
    el.innerHTML = `<span class="tg">${glyph}</span><span>${esc(text)}</span>`;
    box.appendChild(el);
    while (box.children.length > 4) box.removeChild(box.firstChild);
    const timer = setTimeout(() => {
      el.classList.add('out');
      setTimeout(() => el.remove(), 320);
    }, 3200);
    this._toastTimers.push(timer);
  }

  showBanner(eyebrow, title, sub) {
    const b = this.refs.banner;
    if (!b) return;
    $('banner-eyebrow').textContent = eyebrow || '';
    $('banner-title').textContent = title || '';
    $('banner-sub').textContent = sub || '';
    b.classList.remove('hidden');
    clearTimeout(this._bannerTimer);
    this._bannerTimer = setTimeout(() => b.classList.add('hidden'), 3800);
  }

  fade(on, text = '') {
    const f = this.refs.fade;
    if (!f) return;
    if (text) f.innerHTML = `<div class="fade-text">${esc(text)}</div>`;
    else if (on) f.innerHTML = '';
    f.classList.toggle('on', !!on);
  }

  // ==========================================================
  // CONTROLES TÁCTILES
  // ==========================================================
  applyTouchMode() {
    const s = this.game?.settings || { touch: 'auto' };
    let on = s.touch === 'always';
    if (s.touch === 'auto') on = window.matchMedia?.('(pointer: coarse)').matches || window.matchMedia?.('(hover: none)').matches;
    this.touchActive = !!on;
    this._updateTouchVisibility();
  }

  _updateTouchVisibility() {
    const playing = this.game && this.game.player && this.game.state !== 'title';
    this.refs.touch.classList.toggle('hidden', !(this.touchActive && playing));
  }

  _bindTouch() {
    const joy = $('joystick');
    const knob = $('joy-knob');
    if (joy && knob) {
      let active = false;
      const reset = () => {
        active = false;
        this.input.setJoystick(0, 0, false);
        knob.style.transform = 'translate(0,0)';
        joy.classList.remove('active');
      };
      const move = e => {
        if (!active) return;
        const r = joy.getBoundingClientRect();
        const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
        let dx = e.clientX - cx, dy = e.clientY - cy;
        const max = r.width * 0.32;
        const d = Math.hypot(dx, dy);
        if (d > max) { dx = dx / d * max; dy = dy / d * max; }
        this.input.setJoystick(dx / max, dy / max, true);
        knob.style.transform = `translate(${dx}px,${dy}px)`;
      };
      joy.addEventListener('pointerdown', e => {
        e.preventDefault();
        active = true;
        joy.classList.add('active');
        joy.setPointerCapture?.(e.pointerId);
        move(e);
      });
      joy.addEventListener('pointermove', move);
      joy.addEventListener('pointerup', e => { e.preventDefault(); reset(); });
      joy.addEventListener('pointercancel', reset);
      joy.addEventListener('lostpointercapture', reset);
    }
    const actions = document.querySelectorAll('.tbtn[data-action]');
    for (const btn of actions) {
      const action = btn.dataset.action;
      const hold = action === 'attack' || action === 'block';
      const down = e => {
        e.preventDefault();
        btn.classList.add('pressed');
        if (action === 'spell1') {
          this.input.press(`spell${this.touchSpell + 1}`);
          this.touchSpell = (this.touchSpell + 1) % SPELL_LIST.length;
          this._paintSpellButton();
        } else {
          this.input.press(action);
          if (hold) this.input.down.add(action);
        }
      };
      const up = e => {
        e.preventDefault();
        btn.classList.remove('pressed');
        if (hold) this.input.release(action);
      };
      btn.addEventListener('pointerdown', down);
      btn.addEventListener('pointerup', up);
      btn.addEventListener('pointercancel', up);
      btn.addEventListener('pointerleave', up);
      btn.addEventListener('contextmenu', e => e.preventDefault());
    }
    window.addEventListener('resize', () => this.applyTouchMode());
  }

  // ==========================================================
  // TECLADO GLOBAL
  // ==========================================================
  _bindKeyboard() {
    window.addEventListener('keydown', e => {
      const key = e.code;
      if (this.dialogue) {
        if (key === 'Space' || key === 'Enter') { e.preventDefault(); this.advanceDialogue(); }
        else if (key === 'Escape') { e.preventDefault(); this.finishDialogue(); }
        return;
      }
      if (this.cinematic) {
        if (key === 'Space' || key === 'Enter') { e.preventDefault(); this.advanceCinematic(); }
        else if (key === 'Escape') { e.preventDefault(); this.skipCinematic(); }
        return;
      }
      if (this.overlayMode) {
        if (key === 'Escape' || key === 'Tab') {
          e.preventDefault();
          if (this.overlayMode === 'death' || this.overlayMode === 'ending' || this.overlayMode === 'epilogue') return;
          this.closeOverlay();
          // La misma tecla también la escucha el juego: evita que reabra el menú.
          this.input.just.clear();
        }
      }
    });
  }

  // ==========================================================
  // CICLO DE INTERFAZ
  // ==========================================================
  tick(dt, time) {
    this._time = time;
    const titleVisible = !this.refs.titleScreen.classList.contains('hidden');
    if (titleVisible) this.renderer.drawTitle(time);
    const creationVisible = !this.refs.creationScreen.classList.contains('hidden');
    if (creationVisible) {
      this.renderer.drawPreview(this.refs.previewCanvas, this.creationLook(), time);
    }
    if (this.cinematic) {
      const page = this.cinematic.data.pages[this.cinematic.index];
      if (page) this.renderer.drawCinematic(page.art || 'sword', time);
    }
    if (this.dialogue && this.dialogue.typing) {
      const d = this.dialogue;
      d.shown = Math.min(d.fullText.length, d.shown + dt * 52);
      const n = Math.floor(d.shown);
      $('dialogue-text').textContent = d.fullText.slice(0, n);
      if (n >= d.fullText.length) {
        d.typing = false;
        $('dialogue-text').classList.remove('typing');
        this._showDialogueOptions();
      }
    }
    this._updateTouchVisibility();
  }
}
