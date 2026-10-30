// Interfaz DOM: título, HUD, diálogos, paneles, tienda y guardado.
import { drawHero, drawPortrait } from './render.js';
import { drawHeroPortrait, esc } from './ui-model.js';
import { hasAnySave, listSaves } from './save.js';
import { openCreation } from './ui-creation.js';
import { openPause, drawMinimap } from './ui-panels.js';
import { openSettings, openControlEditor } from './ui-settings.js';
import { openShop, openSaves } from './ui-shop-saves.js';
import { showGameOver, showEnding, openHowTo, openCredits, showPrologue } from './ui-cinematics.js';

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

export class UI {
  constructor(game) {
    this.game = game;
    this.overlayRoot = document.getElementById('overlay-root');
    this.overlay = null;
    this.panel = null;
    this.settingsFromTitle = false;
    this._toastCount = 0;
    this._portraitKey = '';
    this._hudAccum = 0;
    this._minimapAccum = 0;
    this._clockNames = ['Amanecer', 'Mañana', 'Mediodía', 'Tarde', 'Crepúsculo', 'Noche', 'Madrugada'];
    this.pressedTouch = new Map();
    this.choiceIndex = 0;
    this.dialogue = null;
    this.isTouchDevice = (navigator.maxTouchPoints || 0) > 0 ||
      (window.matchMedia && window.matchMedia('(pointer: coarse)').matches);
    this.cache();
    this.bindTitle();
    this.bindTouch();
    this.bindGlobal();
  }

  cache() {
    const id = value => document.getElementById(value);
    this.el = {
      title: id('title-screen'),
      titleNote: id('title-save-note'),
      hud: id('hud'),
      hudPortrait: id('hud-portrait'),
      hudLevel: id('hud-level'),
      hudName: id('hud-name'),
      hudDifficulty: id('hud-difficulty'),
      hpFill: id('hp-fill'), hpText: id('hp-text'),
      mpFill: id('mp-fill'), mpText: id('mp-text'),
      staFill: id('sta-fill'), staText: id('sta-text'),
      xpFill: id('xp-fill'), xpText: id('xp-text'),
      chipWeapon: id('chip-weapon'), chipSkill: id('chip-skill'), chipCreature: id('chip-creature'),
      zoneName: id('zone-name'), clock: id('clock-label'),
      minimap: id('minimap'),
      questTitle: id('quest-title'), questDesc: id('quest-desc'), questProgress: id('quest-progress'),
      questCard: id('quest-card'),
      bossBar: id('boss-bar'), bossTitle: id('boss-title'), bossPhase: id('boss-phase'), bossFill: id('boss-fill'),
      prompt: id('interact-prompt'), promptText: id('interact-text'),
      combo: id('combo-indicator'),
      hint: id('hud-hint'),
      toastLayer: id('toast-layer'),
      dialogue: id('dialogue'), dialogueName: id('dialogue-name'), dialogueText: id('dialogue-text'),
      dialoguePortrait: id('dialogue-portrait'), dialogueChoices: id('dialogue-choices'),
      dialogueHint: id('dialogue-hint'),
      touch: id('touch-controls'), dpad: id('touch-dpad'), actions: id('touch-actions'),
      pause: id('touch-pause'), rotate: id('rotate-hint'),
      area: id('area-banner'), areaChapter: id('area-chapter'), areaTitle: id('area-title'),
      areaSubtitle: id('area-subtitle'), fps: id('fps'), flash: id('flash-layer')
    };
    this.musicInit = false;
  }

  bindTitle() {
    const actions = {
      new: () => this.game.startNewFlow(),
      continue: () => this.game.continueGame(),
      load: () => openSaves(this, this.game, { mode: 'load', fromTitle: true }),
      how: () => openHowTo(this, true),
      settings: () => openSettings(this, this.game, { fromTitle: true }),
      credits: () => openCredits(this, true)
    };
    document.querySelectorAll('[data-title-action]').forEach(button => {
      button.addEventListener('click', () => {
        this.game.audio.unlock();
        this.game.audio.sfx('ui_open', { volume: 0.6 });
        const action = actions[button.dataset.titleAction];
        if (action) action();
      });
    });
    this.updateSaveNote();
  }

  bindTouch() {
    const setAction = (action, down, pointerId) => {
      if (this.editorMode) return;
      if (action === 'pause') {
        if (down) this.game.togglePause();
        return;
      }
      this.game.input.setTouch(action, down);
      if (down) {
        const button = this.el.actions?.querySelector(`[data-touch-action="${action}"]`);
        button?.classList.add('pressed');
        if (navigator.vibrate && this.game.settings.haptics) navigator.vibrate(8);
      } else {
        this.el.actions?.querySelectorAll('.tbtn.pressed').forEach(el => el.classList.remove('pressed'));
      }
    };
    this.el.actions?.querySelectorAll('[data-touch-action]').forEach(button => {
      const action = button.dataset.touchAction;
      button.addEventListener('pointerdown', event => {
        event.preventDefault();
        event.stopPropagation();
        button.setPointerCapture?.(event.pointerId);
        setAction(action, true, event.pointerId);
      });
      const release = event => {
        event.preventDefault();
        setAction(action, false, event.pointerId);
      };
      button.addEventListener('pointerup', release);
      button.addEventListener('pointercancel', release);
      button.addEventListener('lostpointercapture', release);
    });

    this.el.dpad?.querySelectorAll('[data-touch-dir]').forEach(button => {
      const dir = button.dataset.touchDir;
      const down = event => {
        event.preventDefault();
        event.stopPropagation();
        if (this.editorMode) return;
        button.setPointerCapture?.(event.pointerId);
        this.game.input.setTouchDirection(dir, true);
        button.classList.add('pressed');
      };
      const up = event => {
        event.preventDefault();
        this.game.input.setTouchDirection(dir, false);
        button.classList.remove('pressed');
      };
      button.addEventListener('pointerdown', down);
      button.addEventListener('pointerup', up);
      button.addEventListener('pointercancel', up);
      button.addEventListener('lostpointercapture', up);
    });

    this.el.pause?.addEventListener('pointerdown', event => {
      event.preventDefault();
      if (this.editorMode) return;
      this.game.audio.unlock();
      this.game.togglePause();
    });
  }

  bindGlobal() {
    window.addEventListener('resize', () => this.updateViewport());
    window.addEventListener('orientationchange', () => setTimeout(() => this.updateViewport(), 250));
    this.el.dialogue?.querySelector('.dialogue-main')?.addEventListener('click', () => {
      if (this.dialogue) this.advanceDialogue();
    });
    this.el.dialogue?.addEventListener('click', event => {
      if (event.target === this.el.dialogue && this.dialogue) this.advanceDialogue();
    });
    this.updateViewport();
  }

  updateViewport() {
    const landscape = window.innerWidth >= window.innerHeight;
    document.body.classList.toggle('landscape', landscape);
    document.body.classList.toggle('portrait', !landscape);
    const showRotate = !landscape && this.isTouchDevice && this.game?.state === 'playing';
    this.el.rotate?.classList.toggle('hidden', !showRotate);
    this.layoutTouch();
  }

  showTitle(show) {
    this.el.title?.classList.toggle('hide', !show);
    this.el.hud?.classList.toggle('hidden', show);
    if (show) {
      this.el.touch?.classList.add('hidden');
      this.el.rotate?.classList.add('hidden');
    } else {
      this.updateViewport();
    }
    this.updateSaveNote();
  }

  updateSaveNote() {
    if (!this.el.titleNote) return;
    const saves = listSaves().filter(s => !s.empty);
    if (!saves.length) {
      this.el.titleNote.textContent = 'No hay partidas guardadas todavía';
    } else {
      const latest = saves.sort((a, b) => b.timestamp - a.timestamp)[0];
      this.el.titleNote.innerHTML = `Última partida: <strong>${esc(latest.name)}</strong> · Nv. ${latest.level}<br>${esc(latest.zone)} · ${esc(latest.quest)}`;
    }
    const continueButton = document.querySelector('[data-title-action="continue"]');
    if (continueButton) continueButton.disabled = !hasAnySave();
  }

  showHud(show) {
    this.el.hud?.classList.toggle('hidden', !show);
  }

  applySettings() {
    const settings = this.game.settings;
    const root = document.documentElement;
    root.style.setProperty('--touch-scale', String(settings.touchScale || 1));
    root.style.setProperty('--touch-opacity', String(settings.touchOpacity ?? 0.9));
    document.body.classList.toggle('touch', this.isTouchDevice || settings.touchMode === 'always');
    document.body.classList.toggle('reduce-motion', !!settings.reduceMotion);
    if (this.el.fps) this.el.fps.classList.toggle('hidden', !settings.showFps);
    if (this.el.minimap?.closest('.minimap-shell')) {
      this.el.minimap.closest('.minimap-shell').style.display = settings.showMinimap === false ? 'none' : '';
    }
    this.layoutTouch();
  }

  shouldShowTouch() {
    if (this.game.state !== 'playing' && this.game.state !== 'dialogue') return false;
    const mode = this.game.settings.touchMode;
    if (mode === 'off') return false;
    if (mode === 'always') return true;
    return this.isTouchDevice;
  }

  layoutTouch() {
    if (!this.el.touch) return;
    const s = this.game.settings;
    const show = this.shouldShowTouch() && window.innerWidth >= window.innerHeight;
    this.el.touch.classList.toggle('hidden', !show);
    if (!show) return;
    const dpad = this.el.dpad, actions = this.el.actions;
    if (!dpad || !actions) return;
    const clear = el => {
      el.style.left = ''; el.style.right = ''; el.style.top = ''; el.style.bottom = '';
    };
    if (s.leftHanded) {
      dpad.style.right = `${s.actionsX ?? 18}px`;
      dpad.style.left = 'auto';
      dpad.style.bottom = `${s.dpadY ?? 16}px`;
      actions.style.left = `${s.dpadX ?? 18}px`;
      actions.style.right = 'auto';
      actions.style.bottom = `${s.actionsY ?? 16}px`;
    } else {
      clear(dpad); clear(actions);
      if (s.dpadX != null) { dpad.style.left = `${s.dpadX}px`; dpad.style.right = 'auto'; }
      if (s.dpadY != null) dpad.style.bottom = `${s.dpadY}px`;
      if (s.actionsX != null) { actions.style.right = `${s.actionsX}px`; actions.style.left = 'auto'; }
      if (s.actionsY != null) actions.style.bottom = `${s.actionsY}px`;
    }
    dpad.dataset.label = 'Movimiento';
    actions.dataset.label = 'Acciones';
  }

  openOverlay(html, options = {}) {
    this.closeOverlay({ silent: true });
    this.overlayRoot.innerHTML = html;
    this.overlay = this.overlayRoot.firstElementChild;
    this.overlayClose = options.onClose || null;
    this.overlay.addEventListener('click', event => {
      const close = event.target.closest('[data-close]');
      if (close) {
        event.preventDefault();
        this.closeOverlay();
      }
    });
    return this.overlay;
  }

  closeOverlay(options = {}) {
    if (!this.overlay) {
      this.overlayRoot.innerHTML = '';
      return;
    }
    const callback = this.overlayClose;
    this.overlayRoot.innerHTML = '';
    this.overlay = null;
    this.overlayClose = null;
    this.panel = null;
    document.getElementById('touch-controls')?.classList.remove('control-editor');
    document.querySelector('.editor-panel')?.remove();
    if (!options.silent && callback) callback();
  }

  openPanel({ title, subtitle = '', tabs, active = null, footer = '', wide = false, onClose = null, panelClass = '' }) {
    const first = active || tabs[0]?.id;
    const html = `
      <div class="overlay-screen">
        <div class="panel ${wide ? 'wide' : ''} ${esc(panelClass)}">
          <div class="panel-head">
            <div><div class="panel-title">${esc(title)}</div><div class="panel-sub">${esc(subtitle)}</div></div>
            <button class="panel-close" data-close>✕ Cerrar</button>
          </div>
          <div class="panel-body">
            <nav class="panel-nav" aria-label="Secciones">
              ${tabs.map(tab => `<button class="nav-tab" data-tab="${esc(tab.id)}"><span class="ico">${tab.icon || '◆'}</span>${esc(tab.label)}</button>`).join('')}
            </nav>
            <div class="panel-content" id="panel-content"></div>
          </div>
          <div class="panel-foot">${footer || '<span>La Espada Celestial</span><span class="foot-hint"><span class="keycap">Esc</span> cerrar</span>'}</div>
        </div>
      </div>`;
    this.openOverlay(html, { onClose });
    this.panel = { tabs, active: first, content: this.overlay.querySelector('#panel-content'), title, subtitle };
    this.overlay.querySelectorAll('[data-tab]').forEach(button => {
      button.addEventListener('click', () => {
        this.game.audio.sfx('select', { volume: 0.45 });
        this.panel.active = button.dataset.tab;
        this.renderPanel();
      });
    });
    this.renderPanel();
    return this.overlay;
  }

  renderPanel() {
    if (!this.overlay || !this.panel) return;
    const { tabs, active, content } = this.panel;
    this.overlay.querySelectorAll('[data-tab]').forEach(button => {
      button.classList.toggle('active', button.dataset.tab === active);
    });
    const tab = tabs.find(item => item.id === active) || tabs[0];
    content.innerHTML = '';
    tab?.render?.(content, this, this.game);
  }

  refreshPanel() {
    this.renderPanel();
  }

  openPause(active = null) {
    openPause(this, this.game, active);
  }

  openSettings(options = {}) {
    openSettings(this, this.game, options);
  }

  openShop(vendor, stock, options = {}) {
    openShop(this, this.game, vendor, stock, options);
  }

  openSaves(options = {}) {
    openSaves(this, this.game, options);
  }

  openCreation(onConfirm) {
    openCreation(this, this.game, onConfirm);
  }

  openControlEditor() {
    openControlEditor(this, this.game);
  }

  showPrologue(onDone) {
    showPrologue(this, this.game, onDone);
  }

  showGameOver(stats, actions) {
    showGameOver(this, this.game, stats, actions);
  }

  showEnding(stats, actions) {
    showEnding(this, this.game, stats, actions);
  }

  openHowTo(fromTitle = false) {
    openHowTo(this, fromTitle);
  }

  openCredits(fromTitle = false) {
    openCredits(this, fromTitle);
  }

  setArea(zone, chapter = '') {
    if (!this.el.area) return;
    this.el.areaChapter.textContent = chapter || 'Lumen';
    this.el.areaTitle.textContent = zone.name;
    this.el.areaSubtitle.textContent = zone.subtitle || '';
    this.el.area.classList.add('show');
    clearTimeout(this._areaTimer);
    this._areaTimer = setTimeout(() => this.el.area.classList.remove('show'), 3800);
  }

  setPrompt(label) {
    if (!this.el.prompt) return;
    this.el.prompt.classList.toggle('hidden', !label);
    if (label) this.el.promptText.textContent = label;
  }

  flash(color = 'rgba(255,220,150,.28)') {
    if (!this.el.flash) return;
    this.el.flash.style.background = color;
    clearTimeout(this._flashTimer);
    this._flashTimer = setTimeout(() => { this.el.flash.style.background = 'transparent'; }, 110);
  }

  toast(title, text = '', type = 'info', duration = 3200) {
    if (!this.el.toastLayer) return;
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<div class="toast-title">${esc(title)}</div>${text ? `<div class="toast-text">${esc(text)}</div>` : ''}`;
    this.el.toastLayer.appendChild(toast);
    this._toastCount++;
    while (this.el.toastLayer.children.length > 4) this.el.toastLayer.firstElementChild.remove();
    setTimeout(() => {
      toast.classList.add('out');
      setTimeout(() => toast.remove(), 300);
    }, Math.max(900, duration));
  }

  updateHUD(game, dt = 0) {
    const player = game.player;
    if (!player) return;
    const stats = player.stats;
    const hpPct = clamp(player.hp / stats.maxHp * 100, 0, 100);
    const mpPct = clamp(player.mp / stats.maxMp * 100, 0, 100);
    const staPct = clamp(player.stamina / stats.maxStamina * 100, 0, 100);
    this.el.hpFill.style.width = `${hpPct}%`;
    this.el.mpFill.style.width = `${mpPct}%`;
    this.el.staFill.style.width = `${staPct}%`;
    this.el.hpText.textContent = `${Math.ceil(player.hp)} / ${stats.maxHp}`;
    this.el.mpText.textContent = `${Math.ceil(player.mp)} / ${stats.maxMp}`;
    this.el.staText.textContent = `${Math.round(player.stamina)}`;
    const xpPct = clamp(player.xp / player.xpNext * 100, 0, 100);
    this.el.xpFill.style.width = `${xpPct}%`;
    this.el.xpText.textContent = `Nv. ${player.level} · ${Math.floor(player.xp)} / ${player.xpNext}`;
    this.el.hudName.textContent = player.name;
    this.el.hudLevel.textContent = player.level;
    this.el.hudDifficulty.textContent = game.difficultyName || 'Aventura';
    this.el.chipWeapon.textContent = player.weapon?.name || 'Sin arma';
    this.el.chipSkill.textContent = game.skillName || 'Sin habilidad';
    this.el.chipCreature.textContent = player.activeCreature ? game.creatureName : 'Sin criatura';

    const key = `${player.level}|${player.equipment.weapon}|${player.equipment.armor}|${player.equipment.shield}|${player.equipment.accessory}|${JSON.stringify(player.appearance)}`;
    if (key !== this._portraitKey) {
      this._portraitKey = key;
      drawHeroPortrait(this.el.hudPortrait, player);
    }

    const zone = game.currentZone || game.world.getZone(player.x, player.y);
    this.el.zoneName.textContent = zone.name;
    const cycle = (game.world.time / 60) % 1;
    this.el.clock.textContent = this._clockNames[Math.floor(cycle * this._clockNames.length)] || 'Crepúsculo';

    const main = game.quests?.main ?? 0;
    const quest = game.questData.main;
    const stage = quest.stages[Math.min(main, quest.stages.length - 1)];
    this.el.questTitle.textContent = stage.title;
    this.el.questDesc.textContent = stage.desc;
    const seals = ['sello_bosque', 'sello_piedra', 'sello_espectro'].filter(id => player.countItem(id) > 0).length;
    this.el.questProgress.textContent = main >= 3 && !game.flags.gateOpen ? 'La puerta aguarda al norte' : `Sellos del Alba: ${seals} / 3`;

    const boss = game.currentBoss;
    this.el.bossBar.classList.toggle('hidden', !boss || boss.dead);
    if (boss && !boss.dead) {
      this.el.bossTitle.textContent = boss.name;
      this.el.bossPhase.textContent = boss.bossId === 'guardian' ? `Fase ${['I', 'I', 'II', 'III'][boss.phase] || 'I'}` : (boss.enraged ? 'Fase II' : 'Fase I');
      this.el.bossFill.style.width = `${clamp(boss.hp / boss.maxHp * 100, 0, 100)}%`;
    }

    const combo = player.combo > 1 && player.comboTimer > 0;
    this.el.combo.textContent = combo ? `×${player.combo}` : '';
    this.el.combo.classList.toggle('show', combo);

    this._hudAccum += dt;
    this._minimapAccum += dt;
    if (this._minimapAccum > 0.12) {
      this._minimapAccum = 0;
      if (game.settings.showMinimap !== false) drawMinimap(this.el.minimap, game, false);
    }
    if (game.settings.showFps && this.el.fps) {
      this.el.fps.textContent = `${Math.round(game.fps || 60)} FPS`;
    }
  }

  say(pages, options = {}) {
    const list = (Array.isArray(pages) ? pages : [pages]).map(page => typeof page === 'string' ? { text: page } : page);
    if (!list.length) return;
    this.dialogue = { pages: list, index: 0, typed: 0, full: '', typing: true, onEnd: options.onEnd || null };
    this.el.dialogue.classList.remove('hidden', 'choices-open');
    this.showDialoguePage();
  }

  showDialoguePage() {
    const dialogue = this.dialogue;
    if (!dialogue) return;
    const page = dialogue.pages[dialogue.index];
    const name = page.name || 'Lyss';
    this.el.dialogueName.textContent = name;
    this.el.dialogueText.textContent = '';
    this.el.dialogueChoices.innerHTML = '';
    this.el.dialogue.classList.remove('choices-open');
    this.choiceIndex = 0;
    dialogue.full = String(page.text || '');
    dialogue.typed = 0;
    dialogue.typing = true;
    dialogue.instant = !!page.instant;
    this.drawDialoguePortrait(page);
    if (page.instant) this.revealDialogue();
  }

  drawDialoguePortrait(page) {
    if (!this.el.dialoguePortrait) return;
    if (page.hero) {
      drawHeroPortrait(this.el.dialoguePortrait, this.game.player);
    } else {
      drawPortrait(this.el.dialoguePortrait, page.role || 'narrator', page.name || '', this.game.elapsed || 0);
    }
  }

  tick(dt) {
    const dialogue = this.dialogue;
    if (!dialogue || !dialogue.typing) return;
    const speed = dialogue.instant ? 240 : 52;
    dialogue.typed = Math.min(dialogue.full.length, dialogue.typed + dt * speed);
    this.el.dialogueText.textContent = dialogue.full.slice(0, Math.floor(dialogue.typed));
    if (dialogue.typed >= dialogue.full.length) this.revealDialogue();
  }

  revealDialogue() {
    const dialogue = this.dialogue;
    if (!dialogue) return;
    dialogue.typing = false;
    dialogue.typed = dialogue.full.length;
    this.el.dialogueText.textContent = dialogue.full;
    const page = dialogue.pages[dialogue.index];
    if (page.choices?.length) {
      this.el.dialogue.classList.add('choices-open');
      this.el.dialogueChoices.innerHTML = '';
      page.choices.forEach((choice, index) => {
        const button = document.createElement('button');
        button.className = 'dialogue-choice';
        button.innerHTML = `${esc(choice.label)}${choice.hint ? `<small>${esc(choice.hint)}</small>` : ''}`;
        button.addEventListener('click', event => {
          event.stopPropagation();
          this.chooseDialogue(index);
        });
        this.el.dialogueChoices.appendChild(button);
      });
      this.highlightChoice();
    } else {
      this.el.dialogueHint.innerHTML = '<span class="keycap">Y</span> continuar';
    }
  }

  highlightChoice() {
    const buttons = [...this.el.dialogueChoices.querySelectorAll('.dialogue-choice')];
    buttons.forEach((button, index) => button.classList.toggle('active', index === this.choiceIndex));
    buttons[this.choiceIndex]?.focus?.();
  }

  updateDialogueInput(input) {
    if (!this.dialogue) return;
    const page = this.dialogue.pages[this.dialogue.index];
    const choices = page.choices || [];
    if (choices.length && !this.dialogue.typing) {
      if (input.pressed('up')) {
        this.choiceIndex = (this.choiceIndex - 1 + choices.length) % choices.length;
        this.highlightChoice();
        this.game.audio.sfx('select', { volume: 0.5 });
      }
      if (input.pressed('down')) {
        this.choiceIndex = (this.choiceIndex + 1) % choices.length;
        this.highlightChoice();
        this.game.audio.sfx('select', { volume: 0.5 });
      }
      if (input.pressed('interact') || input.pressed('attack')) {
        this.chooseDialogue(this.choiceIndex);
      }
      return;
    }
    if (input.pressed('interact') || input.pressed('attack') || input.pressed('dodge')) {
      this.advanceDialogue();
    }
  }

  advanceDialogue() {
    if (!this.dialogue) return;
    if (this.dialogue.typing) {
      this.revealDialogue();
      this.game.audio.sfx('select', { volume: 0.35 });
      return;
    }
    const page = this.dialogue.pages[this.dialogue.index];
    if (page.choices?.length) return;
    if (this.dialogue.index < this.dialogue.pages.length - 1) {
      this.dialogue.index++;
      this.showDialoguePage();
      this.game.audio.sfx('select', { volume: 0.4 });
    } else {
      this.finishDialogue();
    }
  }

  chooseDialogue(index) {
    const dialogue = this.dialogue;
    if (!dialogue) return;
    const page = dialogue.pages[dialogue.index];
    const choice = page.choices?.[index];
    if (!choice) return;
    this.game.audio.sfx('confirm', { volume: 0.7 });
    this.finishDialogue(true);
    if (typeof choice.action === 'function') choice.action();
  }

  finishDialogue(silent = false) {
    if (!this.dialogue) return;
    const callback = this.dialogue.onEnd;
    this.dialogue = null;
    this.el.dialogue.classList.add('hidden');
    this.el.dialogueChoices.innerHTML = '';
    if (!silent) this.game.audio.sfx('back', { volume: 0.35 });
    if (callback) callback();
    this.game.onDialogueClosed?.();
  }

  closePanelAndResume() {
    this.closeOverlay();
  }

  update(time) {
    // El retrato del diálogo respira lentamente.
    if (this.dialogue && Math.floor(time) % 3 === 0) {
      const page = this.dialogue.pages[this.dialogue.index];
      if (page && !page.hero) this.drawDialoguePortrait(page);
    }
  }
}
