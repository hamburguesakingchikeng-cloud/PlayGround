import { BASE_STATS, DEFAULT_APPEARANCE } from '../game/player.js';
import { ORIGINS, STAT_INFO, SKILL_TREES, DIFFICULTIES } from '../data/skills.js';
import { ITEMS, itemRarity, itemStatLine } from '../data/items.js';
import { CREATURES, ELEMENTS, creatureName, creaturePower } from '../data/creatures.js';
import { ENEMIES, BOSSES, BEHAVIOR_LABELS } from '../data/enemies.js';
import { QUESTS } from '../data/quests.js';
import { SCRIPTS, ENDINGS, PORTRAITS } from '../data/story.js';
import { REGIONS } from '../data/regions.js';
import { SHOPS } from '../game/inventory.js';
import { clamp, formatTime } from '../core/utils.js';

const $ = (id) => document.getElementById(id);

const HAIR_STYLES = ['Corto', 'Largo', 'Trenza', 'Rapado', 'Ondulado', 'Moño'];
const HAIR_COLORS = ['#2a1a10', '#3a2a1a', '#6a4a2a', '#a06a3a', '#c8a060', '#d8d0e8', '#c86a3a', '#8a3a4a'];
const SKIN_COLORS = ['#f2d6b8', '#e8c9a8', '#d8a87a', '#b88a62', '#8a5a3a', '#5a3a2a'];
const OUTFIT_COLORS = ['#4a6a4a', '#3a4a6a', '#6a3a4a', '#6a5a3a', '#4a4a5a', '#7a6a4a'];
const ARMOR_COLORS = ['#6f8f63', '#8a8a9a', '#9fc9d8', '#a06a4a', '#cfc2ff', '#5a5568'];
const CAPE_COLORS = ['#7a3a4a', '#3a4a7a', '#4a6a4a', '#6a4a7a', '#8a6a2a', '#2a2a3a'];
const NAMES = ['Peregrino', 'Ari', 'Cael', 'Nara', 'Iven', 'Sombra', 'Lyra', 'Oria', 'Vero', 'Kael'];

const ITEM_ICONS = {
  weapon: '⚔', armor: '❖', helmet: '⌂', accessory: '◈',
  consumable: '✚', material: '◆', quest: '✦',
};

function esc(value) {
  return String(value ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function pct(v) { return `${Math.round(clamp(v, 0, 1) * 100)}%`; }

function itemIcon(item) { return ITEM_ICONS[item?.type] || '◇'; }

export class UI {
  constructor(game) {
    this.game = game;
    this.el = {
      title: $('screen-title'),
      creator: $('screen-creator'),
      hud: $('hud'),
      dialogue: $('dialogue'),
      dialoguePortrait: $('dialogue-portrait'),
      dialogueName: $('dialogue-name'),
      dialogueRole: $('dialogue-role'),
      dialogueText: $('dialogue-text'),
      dialogueChoices: $('dialogue-choices'),
      dialogueNext: $('dialogue-next'),
      panel: $('panel-screen'),
      panelCard: $('panel-card'),
      menu: $('menu-screen'),
      death: $('death-screen'),
      deathText: $('death-text'),
      ending: $('ending-screen'),
      toasts: $('toasts'),
      minimap: $('minimap'),
      hudPortrait: $('hud-portrait'),
      creatorPreview: $('creator-preview'),
      rotate: $('rotate-hint'),
      continueBtn: $('btn-continue'),
      loading: $('loading'),
      fatal: $('fatal'),
    };
    this.dialog = null;
    this.panel = null;
    this.panelReturn = null;
    this.creator = this.freshCreator();
    this.hudTimer = 0;
    this.portraitTimer = 0;
    this.minimapTimer = 0;
    this.toastSeq = 0;
    this.rotateDismissed = false;
    this.rotateTimer = null;
    this._bind();
    this._renderCreator();
    this.showTitle();
  }

  freshCreator() {
    const origin = 'brasa';
    return {
      name: 'Peregrino',
      origin,
      difficulty: this.game.settings?.difficulty || 'caballero',
      points: 8,
      baseStats: this.statsWithOrigin(origin),
      bonusCrit: (ORIGINS[origin]?.bonus?.crit || 0) * 0.02,
      appearance: { ...DEFAULT_APPEARANCE },
    };
  }

  statsWithOrigin(originId) {
    const out = { ...BASE_STATS };
    const bonus = ORIGINS[originId]?.bonus || {};
    for (const [k, v] of Object.entries(bonus)) {
      if (k === 'crit') continue;
      out[k] = (out[k] || 0) + v;
    }
    return out;
  }

  creatorConfig() {
    return {
      name: (this.creator.name || 'Peregrino').trim().slice(0, 18) || 'Peregrino',
      origin: this.creator.origin,
      baseStats: { ...this.creator.baseStats },
      bonusCrit: this.creator.bonusCrit,
      appearance: { ...this.creator.appearance },
      difficulty: this.creator.difficulty,
    };
  }

  // ── Enlaces ────────────────────────────────────────────────────────────
  _bind() {
    $('btn-play')?.addEventListener('click', () => {
      this.game.audio.sfx('ui');
      this.game.quickStart();
    });
    this.el.continueBtn?.addEventListener('click', () => {
      this.game.audio.sfx('ui');
      this.game.continueGame();
    });
    $('btn-creator')?.addEventListener('click', () => {
      this.game.audio.sfx('ui');
      this.openCreator();
    });
    $('btn-title-settings')?.addEventListener('click', () => {
      this.game.audio.sfx('ui');
      this.openPanel('settings', { fromTitle: true });
    });
    $('btn-creator-back')?.addEventListener('click', () => {
      this.game.audio.sfx('ui');
      this.showTitle();
    });
    $('btn-start-game')?.addEventListener('click', () => {
      this.game.audio.sfx('ui');
      this.game.startNewGame(this.creatorConfig());
    });
    $('btn-randomize')?.addEventListener('click', () => {
      this.game.audio.sfx('ui');
      this.randomizeCreator();
    });
    $('char-name')?.addEventListener('input', (e) => {
      this.creator.name = e.target.value.slice(0, 18);
    });
    $('char-cape')?.addEventListener('change', (e) => {
      this.creator.appearance.cape = e.target.checked;
    });
    $('char-helmet')?.addEventListener('change', (e) => {
      this.creator.appearance.helmet = e.target.checked;
    });

    this.el.creator?.addEventListener('click', (e) => {
      const originBtn = e.target.closest('[data-origin]');
      if (originBtn) { this.selectOrigin(originBtn.dataset.origin); return; }
      const hairBtn = e.target.closest('[data-hair-style]');
      if (hairBtn) { this.creator.appearance.hairStyle = Number(hairBtn.dataset.hairStyle); this._renderCreator(); return; }
      const hairColor = e.target.closest('[data-hair-color]');
      if (hairColor) { this.creator.appearance.hairColor = hairColor.dataset.hairColor; this._renderCreator(); return; }
      const skin = e.target.closest('[data-skin]');
      if (skin) { this.creator.appearance.skin = skin.dataset.skin; this._renderCreator(); return; }
      const outfit = e.target.closest('[data-outfit]');
      if (outfit) { this.creator.appearance.outfit = outfit.dataset.outfit; this._renderCreator(); return; }
      const armor = e.target.closest('[data-armor]');
      if (armor) { this.creator.appearance.armorColor = armor.dataset.armor; this._renderCreator(); return; }
      const cape = e.target.closest('[data-cape]');
      if (cape) { this.creator.appearance.capeColor = cape.dataset.cape; this._renderCreator(); return; }
      const statBtn = e.target.closest('[data-stat]');
      if (statBtn) { this.changeStat(statBtn.dataset.stat, Number(statBtn.dataset.dir)); return; }
      const diffBtn = e.target.closest('[data-difficulty]');
      if (diffBtn) { this.creator.difficulty = diffBtn.dataset.difficulty; this._renderCreator(); }
    });

    this.el.dialogue?.addEventListener('click', (e) => {
      const choice = e.target.closest('[data-choice]');
      if (choice) { this.choose(Number(choice.dataset.choice)); return; }
      if (e.target.closest('#dialogue-next') || e.target.closest('.dialogue-main') || e.target.closest('.dialogue-portrait-wrap')) {
        this.advanceDialogue();
      }
    });

    this.el.panelCard?.addEventListener('click', (e) => this.onPanelClick(e));
    this.el.panelCard?.addEventListener('input', (e) => this.onPanelInput(e));
    this.el.panelCard?.addEventListener('change', (e) => this.onPanelInput(e));

    document.querySelectorAll('[data-menu]').forEach((btn) => {
      btn.addEventListener('click', () => this.menuAction(btn.dataset.menu));
    });
    $('btn-menu')?.addEventListener('click', () => { this.game.audio.sfx('ui'); this.openPause(); });
    $('btn-map')?.addEventListener('click', () => { this.game.audio.sfx('ui'); this.openPanel('map'); });
    $('btn-revive')?.addEventListener('click', () => this.game.revive());
    $('btn-death-title')?.addEventListener('click', () => this.game.returnToTitle());
    $('btn-ending-title')?.addEventListener('click', () => this.game.returnToTitle());
    $('rotate-dismiss')?.addEventListener('click', () => {
      this.rotateDismissed = true;
      this.el.rotate.classList.add('hidden');
    });

    window.addEventListener('keydown', (e) => this.onKeyDown(e));
    window.addEventListener('resize', () => this.checkOrientation());
  }

  onKeyDown(e) {
    if (this.el.dialogue && !this.el.dialogue.classList.contains('hidden')) {
      if (e.code === 'Space' || e.code === 'Enter' || e.code === 'KeyE') {
        e.preventDefault();
        this.advanceDialogue();
      } else if (/^Digit[1-3]$/.test(e.code)) {
        const idx = Number(e.code.slice(5)) - 1;
        const buttons = this.el.dialogueChoices.querySelectorAll('[data-choice]');
        if (buttons[idx]) this.choose(idx);
      }
      return;
    }
    if (this.panel) {
      if (e.code === 'Escape') { e.preventDefault(); this.closePanel(); }
      return;
    }
    if (this.el.menu && !this.el.menu.classList.contains('hidden')) {
      if (e.code === 'Escape') { e.preventDefault(); this.resume(); }
    }
  }

  // ── Título / creador ──────────────────────────────────────────────────
  showTitle() {
    this.el.title.classList.remove('hidden');
    this.el.creator.classList.add('hidden');
    this.el.hud.classList.add('hidden');
    this.el.dialogue.classList.add('hidden');
    this.el.panel.classList.add('hidden');
    this.el.menu.classList.add('hidden');
    this.el.death.classList.add('hidden');
    this.el.ending.classList.add('hidden');
    this.el.rotate.classList.add('hidden');
    this.panel = null;
    this.dialog = null;
    this.game.state = 'title';
    this.game.paused = false;
    this.game.dialogueActive = false;
    this.refreshTitle();
    this.game.audio.setTrack('title');
  }

  refreshTitle() {
    const latest = this.game.latestSaveInfo();
    if (latest) {
      this.el.continueBtn.classList.remove('hidden');
      this.el.continueBtn.textContent = `CONTINUAR · ${latest.meta?.name || 'Peregrino'} · ${latest.meta?.region || 'Valdoria'}`;
    } else {
      this.el.continueBtn.classList.add('hidden');
    }
  }

  openCreator() {
    this.el.title.classList.add('hidden');
    this.el.creator.classList.remove('hidden');
    this.el.hud.classList.add('hidden');
    this.el.panel.classList.add('hidden');
    this.el.menu.classList.add('hidden');
    this.el.dialogue.classList.add('hidden');
    this.el.death.classList.add('hidden');
    this.el.ending.classList.add('hidden');
    this.game.state = 'creator';
    this.game.paused = false;
    this._renderCreator();
    $('char-name')?.focus();
  }

  selectOrigin(id) {
    if (!ORIGINS[id]) return;
    this.creator.origin = id;
    this.creator.baseStats = this.statsWithOrigin(id);
    this.creator.points = 8;
    this.creator.bonusCrit = (ORIGINS[id].bonus.crit || 0) * 0.02;
    this.game.audio.sfx('hover');
    this._renderCreator();
  }

  changeStat(stat, dir) {
    const c = this.creator;
    if (!(stat in c.baseStats)) return;
    const base = this.statsWithOrigin(c.origin)[stat] || 0;
    if (dir > 0 && c.points > 0) {
      c.baseStats[stat]++;
      c.points--;
      this.game.audio.sfx('hover');
    } else if (dir < 0 && c.baseStats[stat] > base) {
      c.baseStats[stat]--;
      c.points++;
      this.game.audio.sfx('hover');
    }
    this._renderCreator();
  }

  randomizeCreator() {
    const origins = Object.keys(ORIGINS);
    const origin = origins[Math.floor(Math.random() * origins.length)];
    const c = this.creator;
    c.origin = origin;
    c.name = NAMES[Math.floor(Math.random() * NAMES.length)];
    c.baseStats = this.statsWithOrigin(origin);
    c.points = 8;
    c.bonusCrit = (ORIGINS[origin].bonus.crit || 0) * 0.02;
    c.appearance = {
      ...DEFAULT_APPEARANCE,
      hairStyle: Math.floor(Math.random() * HAIR_STYLES.length),
      hairColor: HAIR_COLORS[Math.floor(Math.random() * HAIR_COLORS.length)],
      skin: SKIN_COLORS[Math.floor(Math.random() * SKIN_COLORS.length)],
      outfit: OUTFIT_COLORS[Math.floor(Math.random() * OUTFIT_COLORS.length)],
      armorColor: ARMOR_COLORS[Math.floor(Math.random() * ARMOR_COLORS.length)],
      capeColor: CAPE_COLORS[Math.floor(Math.random() * CAPE_COLORS.length)],
      cape: Math.random() > 0.2,
      helmet: Math.random() > 0.55,
      eyeColor: Math.random() > 0.5 ? '#4a7a8a' : '#7a5a3a',
    };
    const stats = Object.keys(BASE_STATS);
    for (let i = 0; i < 8; i++) {
      const stat = stats[Math.floor(Math.random() * stats.length)];
      c.baseStats[stat]++;
    }
    $('char-name').value = c.name;
    $('char-cape').checked = c.appearance.cape;
    $('char-helmet').checked = c.appearance.helmet;
    this._renderCreator();
  }

  _renderCreator() {
    const c = this.creator;
    const origin = ORIGINS[c.origin] || ORIGINS.brasa;
    const originName = $('origin-name');
    const originEpithet = $('origin-epithet');
    const originDesc = $('origin-desc');
    if (originName) originName.textContent = origin.name;
    if (originEpithet) originEpithet.textContent = origin.epithet;
    if (originDesc) originDesc.textContent = origin.desc;

    const originCards = $('origin-cards');
    if (originCards) {
      originCards.innerHTML = Object.values(ORIGINS).map((o) => {
        const bonus = Object.entries(o.bonus).filter(([k]) => k !== 'crit').map(([k, v]) => `${STAT_INFO[k]?.name || k} +${v}`).join(' · ');
        const crit = o.bonus.crit ? ` · Crítico +${o.bonus.crit}%` : '';
        return `<button class="origin-card ${o.id === c.origin ? 'selected' : ''}" data-origin="${o.id}" type="button">
          <span class="oc-icon" style="color:${o.color}">${o.icon}</span>
          <strong>${esc(o.name)}</strong>
          <small>${esc(bonus + crit)}</small>
        </button>`;
      }).join('');
    }

    const hairStyles = $('hair-styles');
    if (hairStyles) {
      hairStyles.innerHTML = HAIR_STYLES.map((name, i) =>
        `<button class="chip ${c.appearance.hairStyle === i ? 'selected' : ''}" data-hair-style="${i}" type="button">${name}</button>`).join('');
    }
    const swatches = (id, colors, current, attr) => {
      const node = $(id);
      if (!node) return;
      node.innerHTML = colors.map((color) =>
        `<button class="swatch ${current === color ? 'selected' : ''}" data-${attr}="${color}" style="background:${color}" aria-label="${color}" type="button"></button>`).join('');
    };
    swatches('hair-colors', HAIR_COLORS, c.appearance.hairColor, 'hair-color');
    swatches('skin-colors', SKIN_COLORS, c.appearance.skin, 'skin');
    swatches('outfit-colors', OUTFIT_COLORS, c.appearance.outfit, 'outfit');
    swatches('armor-colors', ARMOR_COLORS, c.appearance.armorColor, 'armor');
    swatches('cape-colors', CAPE_COLORS, c.appearance.capeColor, 'cape');

    const statGrid = $('stat-grid');
    if (statGrid) {
      statGrid.innerHTML = Object.entries(STAT_INFO).map(([key, info]) => {
        const value = c.baseStats[key] || 0;
        return `<div class="stat-row" title="${esc(info.desc)}">
          <span class="stat-name">${info.name}</span>
          <span class="stat-value" style="color:${info.color}">${value}</span>
          <div class="stat-btns">
            <button data-stat="${key}" data-dir="-1" ${c.points >= 8 ? 'disabled' : ''} aria-label="Quitar ${info.name}">−</button>
            <button data-stat="${key}" data-dir="1" ${c.points <= 0 ? 'disabled' : ''} aria-label="Añadir ${info.name}">+</button>
          </div>
        </div>`;
      }).join('');
    }
    const points = $('points-left');
    if (points) points.textContent = `${c.points} punto${c.points === 1 ? '' : 's'} libre${c.points === 1 ? '' : 's'}`;

    const diffs = $('difficulty-cards');
    if (diffs) {
      diffs.innerHTML = Object.values(DIFFICULTIES).map((d) =>
        `<button class="difficulty-card ${c.difficulty === d.name.toLowerCase() ? 'selected' : ''}" data-difficulty="${d.name.toLowerCase()}" type="button">
          <strong>${esc(d.name)}</strong><small>${esc(d.desc)}</small>
        </button>`).join('');
    }
    const nameInput = $('char-name');
    if (nameInput && document.activeElement !== nameInput) nameInput.value = c.name;
    const capeBox = $('char-cape');
    const helmetBox = $('char-helmet');
    if (capeBox) capeBox.checked = c.appearance.cape !== false;
    if (helmetBox) helmetBox.checked = Boolean(c.appearance.helmet);
  }

  // ── HUD ────────────────────────────────────────────────────────────────
  showHud(show = true) {
    this.el.hud.classList.toggle('hidden', !show);
    if (show) this.syncHud(0, true);
  }

  syncHud(dt = 0, force = false) {
    const game = this.game;
    const p = game.player;
    if (!p) return;
    this.hudTimer -= dt;
    if (!force && this.hudTimer > 0) return;
    this.hudTimer = 0.075;

    const setBar = (id, txt, value, max, label) => {
      const bar = $(id);
      if (bar) bar.style.width = `${clamp(value / Math.max(1, max), 0, 1) * 100}%`;
      const t = $(txt);
      if (t) t.textContent = label || `${Math.ceil(value)} / ${Math.round(max)}`;
    };
    setBar('bar-hp', 'txt-hp', p.hp, p.maxHp);
    setBar('bar-mp', 'txt-mp', p.mp, p.maxMp);
    setBar('bar-st', 'txt-st', p.stamina, p.maxStamina);
    const name = $('hud-name');
    if (name) name.textContent = p.name;
    const origin = $('hud-origin');
    if (origin) origin.textContent = ORIGINS[p.origin]?.name || 'Peregrino';
    const level = $('hud-level');
    if (level) level.textContent = p.level;
    const gold = $('hud-gold');
    if (gold) gold.textContent = `◈ ${p.gold}`;
    const ult = $('hud-ult');
    if (ult) ult.textContent = `ULT ${Math.round(p.ult)}%`;
    const region = REGIONS[game.regionId] || REGIONS.valdoria;
    const regionName = $('region-name');
    if (regionName) regionName.textContent = region.name;
    const regionLevel = $('region-level');
    if (regionLevel) regionLevel.textContent = `Nv. ${region.level}`;

    const boss = game.bosses.find((b) => !b.dead) || game.activeBoss;
    const bossBar = $('boss-bar');
    if (bossBar) bossBar.classList.toggle('hidden', !boss);
    if (boss) {
      const bn = $('boss-name');
      if (bn) bn.textContent = boss.name;
      const bp = $('boss-phase');
      if (bp) bp.textContent = `FASE ${boss.phase + 1} / ${boss.phaseCount}`;
      const bb = $('bar-boss');
      if (bb) bb.style.width = `${boss.hpRatio * 100}%`;
    }

    const tracked = game.quests?.trackedObjective();
    const qTitle = $('quest-title');
    const qObj = $('quest-objective');
    const qProg = $('quest-progress');
    if (tracked) {
      if (qTitle) qTitle.textContent = tracked.def.title;
      if (qObj) qObj.textContent = tracked.objective.label || tracked.stage.text;
      if (qProg) {
        const need = tracked.need || 1;
        qProg.textContent = need > 1 ? `${tracked.progress} / ${need}` : '';
      }
    } else {
      if (qTitle) qTitle.textContent = 'Sin misión activa';
      if (qObj) qObj.textContent = 'Explora, habla y escucha los ecos.';
      if (qProg) qProg.textContent = '';
    }

    const comp = game.companions.find((c) => !c.temp && !c.dead);
    const chip = $('companion-chip');
    if (chip) chip.classList.toggle('hidden', !comp);
    if (comp) {
      const cn = $('companion-name');
      if (cn) cn.textContent = creatureName(comp.id, comp.entry.bond);
      const cd = $('companion-cd');
      if (cd) cd.textContent = comp.abilityCd <= 0 ? 'Eco listo' : `Recarga ${comp.abilityCd.toFixed(1)} s`;
    }

    const prompt = $('interact-prompt');
    const target = game.nearTarget;
    if (prompt) prompt.classList.toggle('hidden', !target || game.dialogueActive || game.paused);
    if (target) {
      const text = $('interact-text');
      if (text) text.textContent = target.label || 'Interactuar';
    }

    const touchUlt = document.querySelector('.btn-ult');
    if (touchUlt) touchUlt.classList.toggle('ready', p.ult >= 100 && Boolean(p.ultType));

    this.portraitTimer -= dt;
    if (force || this.portraitTimer <= 0) {
      this.portraitTimer = 0.4;
      game.renderer.drawPortrait(this.el.hudPortrait, 'player', p, game.time);
    }
    this.minimapTimer -= dt;
    if (force || this.minimapTimer <= 0) {
      this.minimapTimer = 0.35;
      game.renderer.drawMinimap(this.el.minimap);
    }
  }

  regionBanner(name, subtitle) {
    const banner = $('region-banner');
    const n = $('region-banner-name');
    const s = $('region-banner-sub');
    if (!banner) return;
    if (n) n.textContent = name;
    if (s) s.textContent = subtitle || '';
    banner.classList.remove('hidden');
    clearTimeout(this._bannerTimer);
    this._bannerTimer = setTimeout(() => banner.classList.add('hidden'), 3400);
  }

  // ── Diálogo ────────────────────────────────────────────────────────────
  openDialogue(scriptId, { context = {}, onAction, onScriptEnd, onClosed } = {}) {
    const script = SCRIPTS[scriptId];
    if (!script) { onClosed?.(); return; }
    this.el.panel.classList.add('hidden');
    this.el.menu.classList.add('hidden');
    this.panel = null;
    this.dialog = {
      scriptId, script, index: 0, shown: 0, complete: false,
      context, onAction, onScriptEnd, onClosed, ended: false,
    };
    this.el.dialogue.classList.remove('hidden');
    this.game.dialogueActive = true;
    this.game.input.enabled = false;
    this.renderDialogueBeat();
  }

  renderDialogueBeat() {
    const d = this.dialog;
    if (!d) return;
    const beat = d.script.beats[d.index];
    if (!beat) { this.finishDialogue(); return; }
    const portrait = beat.portrait || '';
    const narrator = Boolean(beat.narrator);
    this.el.dialogueName.textContent = narrator ? 'Narración' : (beat.speaker || 'Eco');
    const pInfo = PORTRAITS[portrait];
    this.el.dialogueRole.textContent = narrator ? '' : (pInfo?.role || (portrait === 'player' ? 'Jugador Cero' : ''));
    this.el.dialogueText.classList.toggle('narrator', narrator);
    this.el.dialogueText.textContent = '';
    this.el.dialogueChoices.innerHTML = '';
    this.el.dialogueChoices.classList.add('hidden');
    this.el.dialogueNext.classList.remove('hidden');
    d.shown = 0;
    d.complete = false;
    this.game.renderer.drawPortrait(this.el.dialoguePortrait, portrait || 'echo', this.game.player, this.game.time);
  }

  updateDialogue(dt) {
    const d = this.dialog;
    if (!d) return;
    const beat = d.script.beats[d.index];
    if (!beat || d.complete) return;
    const speed = 46 * (this.game.settings.textSpeed || 1);
    d.shown += dt * speed;
    const text = beat.text || '';
    const count = Math.min(text.length, Math.floor(d.shown));
    if (this.el.dialogueText.textContent.length !== count) {
      this.el.dialogueText.textContent = text.slice(0, count);
    }
    if (count >= text.length) this.completeDialogueText();
  }

  completeDialogueText() {
    const d = this.dialog;
    if (!d) return;
    const beat = d.script.beats[d.index];
    if (!beat) return;
    this.el.dialogueText.textContent = beat.text || '';
    d.complete = true;
    if (beat.choices?.length) {
      this.el.dialogueNext.classList.add('hidden');
      this.el.dialogueChoices.classList.remove('hidden');
      this.el.dialogueChoices.innerHTML = beat.choices.map((c, i) =>
        `<button class="choice-btn" data-choice="${i}" type="button">${esc(c.text)}</button>`).join('');
    } else {
      this.el.dialogueNext.classList.remove('hidden');
    }
  }

  advanceDialogue() {
    const d = this.dialog;
    if (!d) return;
    const beat = d.script.beats[d.index];
    if (!beat) { this.finishDialogue(); return; }
    if (!d.complete) { this.completeDialogueText(); return; }
    if (beat.choices?.length) return;
    d.index++;
    if (d.index >= d.script.beats.length) this.finishDialogue();
    else this.renderDialogueBeat();
  }

  choose(index) {
    const d = this.dialog;
    if (!d) return;
    const beat = d.script.beats[d.index];
    const choice = beat?.choices?.[index];
    if (!choice) return;
    this.game.audio.sfx('ui');
    let result = null;
    for (const action of choice.actions || []) {
      const r = d.onAction?.(action);
      if (r) result = r;
    }
    if (result === 'ending') {
      const endingId = this.game.pendingEnding;
      this.finishDialogue();
      if (endingId) this.game.showEnding(endingId);
      return;
    }
    if (choice.next && choice.next !== 'end') {
      const next = choice.next;
      this.runScriptEnd();
      this.openDialogue(next, {
        context: d.context,
        onAction: d.onAction,
        onScriptEnd: d.onScriptEnd,
        onClosed: d.onClosed,
      });
    } else {
      this.finishDialogue();
    }
  }

  runScriptEnd() {
    const d = this.dialog;
    if (!d || d.ended) return;
    d.ended = true;
    d.onScriptEnd?.(d.scriptId, d.context);
  }

  finishDialogue() {
    const d = this.dialog;
    if (!d) return;
    this.runScriptEnd();
    const context = d.context;
    const onClosed = d.onClosed;
    this.dialog = null;
    this.el.dialogue.classList.add('hidden');
    this.game.dialogueActive = false;
    this.game.input.enabled = true;
    this.game.input.clear();
    onClosed?.(context);
  }

  // ── Pausa / paneles ────────────────────────────────────────────────────
  openPause() {
    if (this.game.state !== 'playing' || this.game.dialogueActive) return;
    this.el.menu.classList.remove('hidden');
    this.el.panel.classList.add('hidden');
    this.panel = null;
    this.panelReturn = 'menu';
    this.game.paused = true;
    this.game.input.enabled = false;
    const sub = $('menu-subtitle');
    const region = REGIONS[this.game.regionId];
    if (sub) sub.textContent = `${region?.name || 'Valdoria'} · Nivel ${this.game.player?.level || 1}`;
  }

  resume() {
    this.el.menu.classList.add('hidden');
    this.el.panel.classList.add('hidden');
    this.panel = null;
    this.game.paused = false;
    this.game.input.enabled = true;
    this.game.input.clear();
  }

  menuAction(action) {
    this.game.audio.sfx('ui');
    switch (action) {
      case 'resume': this.resume(); break;
      case 'inventory': this.openPanel('inventory', { returnTo: 'menu' }); break;
      case 'skills': this.openPanel('skills', { returnTo: 'menu' }); break;
      case 'journal': this.openPanel('journal', { returnTo: 'menu' }); break;
      case 'codex': this.openPanel('codex', { returnTo: 'menu' }); break;
      case 'map': this.openPanel('map', { returnTo: 'menu' }); break;
      case 'save': this.openPanel('save', { returnTo: 'menu' }); break;
      case 'settings': this.openPanel('settings', { returnTo: 'menu' }); break;
      case 'help': this.openPanel('help', { returnTo: 'menu' }); break;
      case 'title': this.game.returnToTitle(); break;
      default: break;
    }
  }

  openPanel(type, opts = {}) {
    const fromTitle = Boolean(opts.fromTitle);
    this.panel = {
      type,
      opts,
      tab: opts.tab || this.defaultTab(type),
      returnTo: opts.returnTo || null,
    };
    if (!fromTitle && this.game.state === 'playing') {
      this.game.paused = true;
      this.game.input.enabled = false;
      if (opts.returnTo !== 'menu') this.panelReturn = null;
    }
    this.el.menu.classList.add('hidden');
    this.el.panel.classList.remove('hidden');
    this.renderPanel();
  }

  defaultTab(type) {
    if (type === 'inventory') return 'items';
    if (type === 'codex') return 'creatures';
    if (type === 'shop') return 'buy';
    return null;
  }

  closePanel() {
    this.el.panel.classList.add('hidden');
    const returnTo = this.panel?.returnTo;
    this.panel = null;
    if (this.game.state === 'playing') {
      if (returnTo === 'menu') {
        this.openPause();
      } else {
        this.game.paused = false;
        this.game.input.enabled = !this.game.dialogueActive;
        this.game.input.clear();
      }
    }
  }

  renderPanel() {
    if (!this.panel) return;
    const { type } = this.panel;
    switch (type) {
      case 'inventory': this.el.panelCard.innerHTML = this.panelInventory(); break;
      case 'skills': this.el.panelCard.innerHTML = this.panelSkills(); break;
      case 'journal': this.el.panelCard.innerHTML = this.panelJournal(); break;
      case 'codex': this.el.panelCard.innerHTML = this.panelCodex(); break;
      case 'map': this.el.panelCard.innerHTML = this.panelMap(); break;
      case 'settings': this.el.panelCard.innerHTML = this.panelSettings(); break;
      case 'shop': this.el.panelCard.innerHTML = this.panelShop(); break;
      case 'forge': this.el.panelCard.innerHTML = this.panelForge(); break;
      case 'save': this.el.panelCard.innerHTML = this.panelSave(); break;
      case 'help': this.el.panelCard.innerHTML = this.panelHelp(); break;
      case 'lore': this.el.panelCard.innerHTML = this.panelLore(); break;
      default: this.el.panelCard.innerHTML = this.panelHead('Panel', '') + '<p class="panel-empty">Nada que mostrar.</p>';
    }
    if (type === 'map') {
      requestAnimationFrame(() => {
        const canvas = $('big-map-canvas');
        if (canvas) this.game.renderer.drawMinimap(canvas);
      });
    }
    this.el.panelCard.scrollTop = 0;
  }

  panelHead(title, subtitle, extra = '') {
    return `<div class="panel-head">
      <div><p class="eyebrow">La Espada Celestial</p><h2>${esc(title)}</h2>${subtitle ? `<p>${esc(subtitle)}</p>` : ''}</div>
      <div style="display:flex;gap:8px;align-items:center">${extra}<button class="btn btn-ghost btn-small panel-close" data-panel-close type="button">CERRAR ✕</button></div>
    </div>`;
  }

  panelTabs(tabs) {
    const current = this.panel?.tab;
    return `<div class="panel-tabs">${tabs.map(([id, label]) =>
      `<button class="panel-tab ${id === current ? 'selected' : ''}" data-tab="${id}" type="button">${esc(label)}</button>`).join('')}</div>`;
  }

  onPanelClick(e) {
    if (e.target.closest('[data-panel-close]')) { this.game.audio.sfx('ui'); this.closePanel(); return; }
    const tab = e.target.closest('[data-tab]');
    if (tab && this.panel) { this.panel.tab = tab.dataset.tab; this.renderPanel(); return; }
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const action = btn.dataset.action;
    const id = btn.dataset.id;
    const slot = btn.dataset.slot;
    this.game.audio.sfx('ui');
    switch (action) {
      case 'use': this.useItem(id); break;
      case 'equip': this.equipItem(id); break;
      case 'unequip': this.unequipItem(slot); break;
      case 'allocate': this.allocateStat(id); break;
      case 'skill': this.unlockSkill(id); break;
      case 'set-active': this.setActiveCreature(id); break;
      case 'feed': this.feedCreature(id); break;
      case 'buy': this.buyItem(id); break;
      case 'sell': this.sellItem(id); break;
      case 'upgrade': this.upgradeItem(id); break;
      case 'save-slot': this.saveSlot(Number(id)); break;
      case 'load-slot': this.loadSlot(Number(id)); break;
      case 'delete-slot': this.deleteSlot(Number(id)); break;
      case 'reset-settings': this.resetSettings(); break;
      case 'fullscreen': this.toggleFullscreen(); break;
      default: break;
    }
  }

  onPanelInput(e) {
    const input = e.target.closest('[data-setting]');
    if (!input || !this.panel || this.panel.type !== 'settings') return;
    const key = input.dataset.setting;
    let value;
    if (input.type === 'checkbox') value = input.checked;
    else if (input.type === 'range') value = Number(input.value);
    else if (input.tagName === 'SELECT') value = input.value;
    else value = input.value;
    this.game.settings[key] = value;
    if (key === 'difficulty') this.game.difficulty = DIFFICULTIES[value] || DIFFICULTIES.caballero;
    this.game.saveSystem.saveSettings();
    this.game.applySettings();
    const label = input.closest('.setting-row')?.querySelector('label small');
    if (label && input.type === 'range') label.textContent = this.settingValueLabel(key, value);
  }

  settingValueLabel(key, value) {
    if (['music', 'sfx', 'master', 'touchOpacity'].includes(key)) return pct(value);
    if (key === 'textSpeed') return `${Number(value).toFixed(1)}×`;
    return '';
  }

  // ── Inventario ────────────────────────────────────────────────────────
  panelInventory() {
    const inv = this.game.inventory;
    const p = this.game.player;
    if (!inv || !p) return this.panelHead('Inventario', '') + '<p class="panel-empty">No hay peregrino.</p>';
    const tabs = this.panelTabs([['items', 'Objetos'], ['stats', 'Atributos'], ['resonances', 'Resonancias']]);
    let body = '';
    if (this.panel.tab === 'stats') body = this.inventoryStats();
    else if (this.panel.tab === 'resonances') body = this.inventoryResonances();
    else body = this.inventoryItems();
    return this.panelHead('Inventario', `${p.name} · Nivel ${p.level} · ◈ ${p.gold}`, tabs) + body;
  }

  inventoryItems() {
    const inv = this.game.inventory;
    const p = this.game.player;
    const slotLabels = { weapon: 'Arma', armor: 'Armadura', helmet: 'Yelmo', accessory: 'Accesorio' };
    const equipHtml = Object.entries(slotLabels).map(([slot, label]) => {
      const id = inv.equipment[slot];
      const item = id ? ITEMS[id] : null;
      const lvl = id ? inv.upgradeLevel(id) : 0;
      return `<div class="equip-slot">
        <span class="item-icon">${item ? itemIcon(item) : '·'}</span>
        <div style="flex:1;min-width:0">
          <span class="slot-label">${label}</span>
          <strong>${item ? esc(item.name) + (lvl ? ` +${lvl}` : '') : 'Vacío'}</strong>
        </div>
        ${id && (slot === 'helmet' || slot === 'accessory') ? `<button class="mini-btn" data-action="unequip" data-slot="${slot}" type="button">QUITAR</button>` : ''}
      </div>`;
    }).join('');

    const stats = inv.equipmentStats();
    const statHtml = `<div class="stat-summary">
      <div class="stat-pill"><span>VIDA</span><strong>${p.maxHp}</strong></div>
      <div class="stat-pill"><span>MANÁ</span><strong>${p.maxMp}</strong></div>
      <div class="stat-pill"><span>ATAQUE</span><strong>${Math.round(p.attack)}</strong></div>
      <div class="stat-pill"><span>DEFENSA</span><strong>${Math.round(p.defense)}</strong></div>
      <div class="stat-pill"><span>CRÍTICO</span><strong>${pct(p.crit)}</strong></div>
      <div class="stat-pill"><span>VELOCIDAD</span><strong>${Math.round(p.speed)}</strong></div>
      <div class="stat-pill"><span>SUERTE</span><strong>${Math.round(p.luck)}</strong></div>
      <div class="stat-pill"><span>PUNTOS</span><strong>${p.points}</strong></div>
    </div>`;

    const entries = Object.entries(inv.items).filter(([, qty]) => qty > 0)
      .sort((a, b) => {
        const ia = ITEMS[a[0]], ib = ITEMS[b[0]];
        return (ia?.type || '').localeCompare(ib?.type || '') || (ib?.rarity || 0) - (ia?.rarity || 0) || (ia?.name || '').localeCompare(ib?.name || '');
      });
    const list = entries.length ? entries.map(([id, qty]) => {
      const item = ITEMS[id];
      if (!item) return '';
      const rarity = itemRarity(item);
      const equipped = inv.isEquipped(id);
      const slot = item.type;
      const canEquip = ['weapon', 'armor', 'helmet', 'accessory'].includes(slot);
      const canUse = item.type === 'consumable';
      const statsLine = itemStatLine(item).map((s) => `${s.label} ${s.value}`).join(' · ');
      return `<div class="item-row">
        <span class="item-icon" style="color:${rarity.color};border-color:${rarity.color}55">${itemIcon(item)}</span>
        <div class="item-body">
          <strong style="color:${rarity.color}">${esc(item.name)}${equipped ? ' · EQUIPADO' : ''}</strong>
          <small>${esc(rarity.name)}${statsLine ? ' · ' + esc(statsLine) : ''}</small>
          <small>${esc(item.desc || '')}</small>
        </div>
        <span class="item-qty">×${qty}</span>
        <div class="item-actions">
          ${canUse ? `<button class="mini-btn" data-action="use" data-id="${id}" type="button">USAR</button>` : ''}
          ${canEquip && !equipped ? `<button class="mini-btn" data-action="equip" data-id="${id}" type="button">EQUIPAR</button>` : ''}
        </div>
      </div>`;
    }).join('') : '<p class="panel-empty">Tu zurrón está vacío. El mundo está lleno.</p>';

    return `<div class="panel-grid">
      <div>
        <div class="panel-section"><h3>Equipo</h3><div class="equip-slots">${equipHtml}</div></div>
        <div class="panel-section" style="margin-top:14px"><h3>Atributos derivados</h3>${statHtml}</div>
      </div>
      <div class="panel-section"><h3>Objetos</h3><div class="item-list">${list}</div></div>
    </div>`;
  }

  inventoryStats() {
    const p = this.game.player;
    const baseHtml = Object.entries(STAT_INFO).map(([key, info]) => {
      const value = p.baseStats[key] || 0;
      return `<div class="stat-row" title="${esc(info.desc)}">
        <span class="stat-name">${info.name}</span>
        <span class="stat-value" style="color:${info.color}">${value}</span>
        <div class="stat-btns">
          <button data-action="allocate" data-id="${key}" ${p.points <= 0 ? 'disabled' : ''} type="button">+</button>
        </div>
      </div>`;
    }).join('');
    return `<div class="panel-grid">
      <div class="panel-section">
        <h3>Atributos · ${p.points} puntos libres</h3>
        <div class="stat-grid">${baseHtml}</div>
        <p style="color:var(--muted);font-size:13px;line-height:1.4">Cada nivel otorga 2 puntos de atributo y 1 de habilidad. La Vida, el Maná y la Resistencia crecen con sus atributos; la Fuerza y la Inteligencia cambian el daño; la Suerte mejora críticos, botín y captura.</p>
      </div>
      <div class="panel-section">
        <h3>Estado del peregrino</h3>
        <div class="stat-summary">
          <div class="stat-pill"><span>VIDA</span><strong>${Math.ceil(p.hp)}/${p.maxHp}</strong></div>
          <div class="stat-pill"><span>MANÁ</span><strong>${Math.ceil(p.mp)}/${p.maxMp}</strong></div>
          <div class="stat-pill"><span>RESIST.</span><strong>${Math.ceil(p.stamina)}/${p.maxStamina}</strong></div>
          <div class="stat-pill"><span>NIVEL</span><strong>${p.level}</strong></div>
          <div class="stat-pill"><span>XP</span><strong>${p.xp}/${p.xpNext}</strong></div>
          <div class="stat-pill"><span>ORO</span><strong>◈ ${p.gold}</strong></div>
          <div class="stat-pill"><span>ASESINATOS</span><strong>${p.kills}</strong></div>
          <div class="stat-pill"><span>CAPTURAS</span><strong>${p.captures}</strong></div>
        </div>
        <p style="color:var(--muted);font-size:13px;line-height:1.4;margin-top:12px">Daño físico: ${Math.round(p.attack)} · Poder mágico: ${Math.round(p.spellPower)} · Reducción de daño: ${pct(p.damageReduction)} · Crítico: ${pct(p.crit)}</p>
      </div>
    </div>`;
  }

  inventoryResonances() {
    const col = this.game.collection;
    const owned = col?.list() || [];
    if (!owned.length) return '<p class="panel-empty">Aún no has sintonizado ninguna resonancia. Debilita a una criatura y pulsa SINTONIZAR.</p>';
    const cards = owned.map((entry) => {
      const def = entry.def;
      if (!def) return '';
      const element = ELEMENTS[def.element] || ELEMENTS.luz;
      const active = col.active === entry.id;
      return `<div class="codex-card" style="border-color:${active ? element.color : 'rgba(217,180,106,0.13)'}">
        <strong style="color:${element.color}">${esc(creatureName(entry.id, entry.bond))}</strong>
        <em>${element.icon} ${element.name} · ${def.role} · Vínculo ${entry.bond}/5 · Nv. ${entry.level}</em>
        <p>${esc(def.desc)}</p>
        <p style="color:var(--gold);margin-top:6px">Poder ${creaturePower(entry.id, entry.bond, entry.level)} · ${esc(def.passive.name)}</p>
        <div style="display:flex;gap:5px;margin-top:8px;flex-wrap:wrap">
          <button class="mini-btn" data-action="set-active" data-id="${entry.id}" ${active ? 'disabled' : ''} type="button">${active ? 'ACTIVA' : 'ACTIVAR'}</button>
          <button class="mini-btn" data-action="feed" data-id="${entry.id}" type="button">ALIMENTAR (2 ESENCIAS)</button>
        </div>
      </div>`;
    }).join('');
    return `<div class="panel-section"><h3>Resonancias · ${owned.length} / ${Object.keys(CREATURES).length}</h3><div class="codex-grid">${cards}</div></div>`;
  }

  useItem(id) {
    const result = this.game.inventory.use(id, this.game.player, this.game);
    if (result.ok) this.toast('Objeto usado', result.msg || ITEMS[id]?.name || '', 'loot');
    else this.toast('No puedes usarlo', result.msg || '', 'warn');
    this.game.player.recalc();
    this.renderPanel();
    this.syncHud(0, true);
  }

  equipItem(id) {
    if (!this.game.inventory.equip(id)) { this.toast('No puedes equiparlo', '', 'warn'); return; }
    this.game.player.recalc(true);
    this.game.audio.sfx('pickup');
    this.toast('Equipado', ITEMS[id]?.name || '', 'loot');
    this.renderPanel();
    this.syncHud(0, true);
  }

  unequipItem(slot) {
    if (!this.game.inventory.unequip(slot)) return;
    this.game.player.recalc(true);
    this.game.audio.sfx('ui');
    this.renderPanel();
    this.syncHud(0, true);
  }

  allocateStat(stat) {
    if (!this.game.player.allocate(stat)) return;
    this.game.audio.sfx('levelup');
    this.renderPanel();
    this.syncHud(0, true);
  }

  // ── Habilidades ───────────────────────────────────────────────────────
  panelSkills() {
    const p = this.game.player;
    if (!p) return this.panelHead('Habilidades', '') + '<p class="panel-empty">No hay peregrino.</p>';
    const branch = p.skillBranch();
    const trees = Object.entries(SKILL_TREES).map(([key, tree]) => {
      const nodes = tree.nodes.map((node) => {
        const unlocked = p.hasSkill(node.id);
        const reqOk = !node.requires || p.hasSkill(node.requires);
        const affordable = p.skillPoints >= node.cost;
        const locked = !unlocked && (!reqOk || !affordable);
        return `<div class="skill-node ${unlocked ? 'unlocked' : locked ? 'locked' : ''}">
          <span class="node-icon" style="color:${tree.color}">${unlocked ? '✓' : tree.icon}</span>
          <div style="flex:1;min-width:0"><strong>${esc(node.name)}</strong><small>${esc(node.desc)}</small></div>
          ${unlocked ? '<span class="node-cost" style="color:var(--green)">APRENDIDA</span>' :
            `<button class="mini-btn" data-action="skill" data-id="${node.id}" ${locked ? 'disabled' : ''} type="button">${node.cost} PTO${node.cost > 1 ? 'S' : ''}</button>`}
        </div>`;
      }).join('');
      return `<div class="panel-section" style="${key === branch ? 'border-color:' + tree.color + '66' : ''}">
        <h3 style="color:${tree.color}">${tree.icon} ${esc(tree.name)}${key === branch ? ' · TU SENDA' : ''}</h3>
        <p style="color:var(--muted);font-size:13px;margin:0 0 9px">${esc(tree.desc)}</p>
        <div class="skill-tree">${nodes}</div>
      </div>`;
    }).join('');
    const ult = p.ultType ? `<p style="color:var(--gold-bright)">Definitiva desbloqueada: ${esc(p.ultType === 'blade' ? 'Tormenta Celestial' : p.ultType === 'veil' ? 'Nova del Velo' : 'Despertar')}.</p>` : '<p style="color:var(--muted)">Aprende una definitiva al final de una senda.</p>';
    return this.panelHead('Habilidades', `${p.skillPoints} punto${p.skillPoints === 1 ? '' : 's'} de habilidad`, `<span style="font-family:var(--font-display);font-size:10px;color:var(--gold)">${p.skillPoints} PTS</span>`) +
      `<div class="panel-grid three">${trees}</div><div class="panel-section" style="margin-top:14px">${ult}</div>`;
  }

  unlockSkill(id) {
    if (!this.game.player.unlockSkill(id)) { this.toast('No puedes aprenderla', 'Falta un requisito o puntos de habilidad.', 'warn'); return; }
    this.game.player.recalc();
    this.renderPanel();
    this.syncHud(0, true);
    this.game.autosave();
  }

  // ── Diario ────────────────────────────────────────────────────────────
  panelJournal() {
    const q = this.game.quests;
    if (!q) return this.panelHead('Diario', '') + '<p class="panel-empty">No hay historias todavía.</p>';
    const active = Object.keys(q.active);
    const completed = [...q.completed];
    const questCard = (id, done = false) => {
      const def = QUESTS[id];
      if (!def) return '';
      if (done) {
        return `<div class="quest-card done"><strong>${esc(def.title)}</strong><p>${esc(def.desc)}</p><p style="color:var(--green)">Completada.</p></div>`;
      }
      const a = q.active[id];
      const stage = def.stages[a.stage];
      const objectives = stage.objectives.map((obj, i) => {
        const need = obj.count || 1;
        const have = a.progress[i] || 0;
        const ok = have >= need;
        return `<span class="${ok ? 'done' : ''}">${ok ? '✓' : '◇'} ${esc(obj.label || obj.target)}${need > 1 ? ` · ${have}/${need}` : ''}</span>`;
      }).join('');
      return `<div class="quest-card ${def.type === 'main' ? 'main' : ''}">
        <strong>${esc(def.title)} <span style="color:var(--muted);font-size:10px">${def.type === 'main' ? 'PRINCIPAL' : 'SECUNDARIA'}</span></strong>
        <p>${esc(stage.text)}</p>
        <div class="quest-objectives">${objectives}</div>
      </div>`;
    };
    return this.panelHead('Diario', `${active.length} misión${active.length === 1 ? '' : 'es'} activa${active.length === 1 ? '' : 's'} · ${completed.length} completada${completed.length === 1 ? '' : 's'}`) +
      `<div class="panel-grid">
        <div class="panel-section"><h3>Misiones activas</h3>${active.length ? active.map((id) => questCard(id)).join('') : '<p class="panel-empty">No hay misiones activas. Habla con la gente.</p>'}</div>
        <div class="panel-section"><h3>Crónicas cerradas</h3>${completed.length ? completed.map((id) => questCard(id, true)).join('') : '<p class="panel-empty">La historia aún no tiene cicatrices.</p>'}</div>
      </div>`;
  }

  // ── Códice ────────────────────────────────────────────────────────────
  panelCodex() {
    const tabs = this.panelTabs([['creatures', 'Resonancias'], ['characters', 'Personajes'], ['bestiary', 'Bestiario'], ['lore', 'Lugares y ecos']]);
    let body = '';
    if (this.panel.tab === 'characters') body = this.codexCharacters();
    else if (this.panel.tab === 'bestiary') body = this.codexBestiary();
    else if (this.panel.tab === 'lore') body = this.codexLore();
    else body = this.codexCreatures();
    return this.panelHead('Códice del Velo', 'Lo que el mundo recuerda, y lo que intenta olvidar.', tabs) + body;
  }

  codexCreatures() {
    const col = this.game.collection;
    const cards = Object.entries(CREATURES).map(([id, def]) => {
      const owned = col?.get(id);
      const element = ELEMENTS[def.element] || ELEMENTS.luz;
      if (!owned) {
        return `<div class="codex-card locked"><strong>???</strong><em>${element.icon} ${element.name} · ${def.role}</em><p>Una resonancia que aún no has escuchado. Debilita a la criatura y usa SINTONIZAR.</p></div>`;
      }
      return `<div class="codex-card"><strong style="color:${element.color}">${esc(creatureName(id, owned.bond))}</strong>
        <em>${element.icon} ${element.name} · ${def.role} · Vínculo ${owned.bond}/5 · Nv. ${owned.level}</em>
        <p>${esc(def.desc)}</p><p style="color:var(--dim);font-style:italic;margin-top:6px">${esc(def.lore)}</p></div>`;
    }).join('');
    return `<div class="panel-section"><h3>Resonancias · ${col?.count() || 0} / ${Object.keys(CREATURES).length}</h3><div class="codex-grid">${cards}</div></div>`;
  }

  codexCharacters() {
    const flags = this.game.flags || {};
    const met = (id) => {
      if (id === 'player') return true;
      if (id === 'maren') return flags.met_maren;
      if (id === 'lyra') return flags.lyra_ally || flags.shrine_done;
      if (id === 'orin') return flags.hammer || this.game.quests?.isActive('side_hammer') || this.game.quests?.isCompleted('side_hammer');
      if (id === 'sela') return flags.met_maren;
      if (id === 'elna') return flags.met_maren;
      if (id === 'tilo') return flags.met_maren;
      if (id === 'roderic') return flags.met_maren;
      if (id === 'kael') return flags.kael_met;
      if (id === 'nira') return flags.kael_met;
      if (id === 'aurel') return flags.aurel_met;
      if (id === 'vela') return flags.vela_met;
      if (id === 'echo') return flags.veil_defeated || flags.aurel_met;
      if (id === 'survivor') return flags.survivors;
      return false;
    };
    const cards = Object.entries(PORTRAITS).map(([id, p]) => {
      const known = met(id);
      return `<div class="codex-card ${known ? '' : 'locked'}"><strong>${known ? esc(p.name) : '???'}</strong><em>${known ? esc(p.role) : 'Aún no lo recuerdas'}</em><p>${known ? esc(p.role) : 'Una figura espera en algún lugar de la historia.'}</p></div>`;
    }).join('');
    return `<div class="panel-section"><h3>Personajes</h3><div class="codex-grid">${cards}</div></div>`;
  }

  codexBestiary() {
    const best = this.game.bestiary || {};
    const cards = Object.entries(ENEMIES).map(([id, def]) => {
      const known = Boolean(best[id]);
      return `<div class="codex-card ${known ? '' : 'locked'}"><strong>${known ? esc(def.name) : '???'}</strong><em>Nv. ${def.level} · ${known ? esc(BEHAVIOR_LABELS[def.behavior] || def.behavior) : 'Desconocido'}</em><p>${known ? `Vida ${def.hp} · Ataque ${def.atk} · Defensa ${def.def} · Velocidad ${def.speed}` : 'Encuéntralo para registrar su eco.'}</p></div>`;
    }).join('');
    const bosses = Object.entries(BOSSES).map(([id, def]) => {
      const known = Boolean(best[id]);
      return `<div class="codex-card ${known ? '' : 'locked'}" style="border-color:rgba(255,123,77,0.25)"><strong>${known ? esc(def.name) : '???'}</strong><em>${known ? esc(def.title) : 'Un sello sin nombre'}</em><p>${known ? `Nv. ${def.level} · Vida ${def.hp} · ${def.phases.length} fases · ${esc(def.intro)}` : 'La puerta aún no se ha abierto.'}</p></div>`;
    }).join('');
    return `<div class="panel-section"><h3>Criaturas hostiles</h3><div class="codex-grid">${cards}</div></div>
      <div class="panel-section" style="margin-top:14px"><h3>Jefes</h3><div class="codex-grid">${bosses}</div></div>`;
  }

  codexLore() {
    const visited = this.game.flags || {};
    const lore = Object.entries(this.game.lore || {});
    const regionCards = Object.values(REGIONS).map((r) => {
      const known = visited['visited:' + r.id];
      return `<div class="codex-card ${known ? '' : 'locked'}"><strong>${known ? esc(r.name) : '???'}</strong><em>${known ? esc(r.subtitle) : 'Tierra no recorrida'}</em><p>${known ? `Niveles ${r.level} · ${r.weather === 'leaves' ? 'Hojas al viento' : r.weather === 'embers' ? 'Brasas suspendidas' : 'Motas de luz'}` : 'Aún no has cruzado este umbral.'}</p></div>`;
    }).join('');
    const loreCards = lore.length ? lore.map(([id, entry]) =>
      `<div class="codex-card"><strong>${esc(entry.title)}</strong><em>${esc(entry.region || 'Eco')}</em><p>${esc(entry.text).replace(/\n/g, '<br>')}</p></div>`).join('') :
      '<p class="panel-empty">No has leído ninguna inscripción. Examina piedras, señales y murales.</p>';
    return `<div class="panel-section"><h3>Reinos</h3><div class="codex-grid">${regionCards}</div></div>
      <div class="panel-section" style="margin-top:14px"><h3>Inscripciones y ecos</h3><div class="codex-grid">${loreCards}</div></div>`;
  }

  // ── Mapa ──────────────────────────────────────────────────────────────
  panelMap() {
    const game = this.game;
    const region = REGIONS[game.regionId] || REGIONS.valdoria;
    const waypoints = game.world?.waypoints || [];
    const wpList = waypoints.map((wp) => {
      const active = game.flags['waypoint:' + wp.id];
      return `<div class="item-row"><span class="item-icon" style="color:${active ? 'var(--cyan)' : 'var(--dim)'}">${active ? '◉' : '○'}</span><div class="item-body"><strong>${esc(wp.name)}</strong><small>${active ? 'Punto de guardado activo' : 'Aún no activado'}</small></div></div>`;
    }).join('');
    const regionList = Object.values(REGIONS).map((r) => {
      const visited = game.flags['visited:' + r.id];
      const current = r.id === game.regionId;
      return `<div class="item-row"><span class="item-icon" style="color:${current ? 'var(--gold-bright)' : visited ? 'var(--muted)' : 'var(--dim)'}">${current ? '◆' : visited ? '◇' : '·'}</span><div class="item-body"><strong>${current ? esc(r.name) + ' · AQUÍ' : visited ? esc(r.name) : '???'}</strong><small>${visited ? `Niveles ${r.level} · ${esc(r.subtitle)}` : 'Aún no explorado'}</small></div></div>`;
    }).join('');
    return this.panelHead('Mapa', `${region.name} · ${region.subtitle}`) +
      `<div class="map-layout">
        <div><div class="big-map"><canvas id="big-map-canvas" width="800" height="624" aria-label="Mapa grande de la región"></canvas></div>
          <div class="map-legend"><span><i class="legend-dot" style="background:#fff3c4"></i>Tú</span><span><i class="legend-dot" style="background:#ffe7a8"></i>PNJ</span><span><i class="legend-dot" style="background:#ff7b7b"></i>Enemigos</span><span><i class="legend-dot" style="background:#ff5a2a"></i>Jefe</span><span><i class="legend-dot" style="background:#9fe8ff"></i>Punto de guardado</span></div>
        </div>
        <div>
          <div class="panel-section"><h3>Puntos de guardado</h3>${wpList || '<p class="panel-empty">Sin puntos en esta región.</p>'}</div>
          <div class="panel-section" style="margin-top:14px"><h3>Reinos</h3>${regionList}</div>
        </div>
      </div>`;
  }

  // ── Ajustes ───────────────────────────────────────────────────────────
  panelSettings() {
    const s = this.game.settings;
    const rowRange = (key, label, desc) => `<div class="setting-row"><label>${label}<small data-value>${this.settingValueLabel(key, s[key])}</small></label><input type="range" min="0" max="1" step="0.01" value="${s[key]}" data-setting="${key}"></div>`;
    const rowCheck = (key, label, desc) => `<div class="setting-row"><label>${label}<small>${desc}</small></label><input type="checkbox" ${s[key] ? 'checked' : ''} data-setting="${key}"></div>`;
    const diffOptions = Object.values(DIFFICULTIES).map((d) => `<option value="${d.name.toLowerCase()}" ${s.difficulty === d.name.toLowerCase() ? 'selected' : ''}>${esc(d.name)}</option>`).join('');
    return this.panelHead('Ajustes', 'El Velo escucha mejor si lo ajustas a tu medida.') +
      `<div class="panel-grid">
        <div class="panel-section"><h3>Audio</h3><div class="settings-list">
          ${rowRange('master', 'Volumen general', '')}
          ${rowRange('music', 'Música', '')}
          ${rowRange('sfx', 'Efectos', '')}
        </div></div>
        <div class="panel-section"><h3>Interfaz y accesibilidad</h3><div class="settings-list">
          <div class="setting-row"><label>Velocidad del texto<small data-value>${this.settingValueLabel('textSpeed', s.textSpeed)}</small></label><input type="range" min="0.5" max="2" step="0.1" value="${s.textSpeed}" data-setting="textSpeed"></div>
          ${rowCheck('largeText', 'Texto grande', 'Aumenta el tamaño de los diálogos y paneles.')}
          ${rowCheck('shake', 'Sacudida de cámara', 'Desactiva el movimiento de cámara en combate.')}
          ${rowCheck('flashes', 'Destellos', 'Reduce los destellos intensos.')}
          ${rowCheck('damageNumbers', 'Números de daño', 'Muestra el daño flotante.')}
          ${rowCheck('autoAim', 'Apuntado automático', 'Apunta al enemigo más cercano con ratón.')}
          ${rowCheck('showFps', 'Mostrar FPS', 'Para medir el rendimiento.')}
          ${rowRange('touchOpacity', 'Opacidad táctil', '')}
        </div></div>
      </div>
      <div class="panel-grid" style="margin-top:14px">
        <div class="panel-section"><h3>Dificultad</h3><div class="setting-row"><label>Dificultad de combate<small>Se aplica a los enemigos futuros.</small></label><select data-setting="difficulty">${diffOptions}</select></div></div>
        <div class="panel-section"><h3>Pantalla</h3><div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn btn-ghost btn-small" data-action="fullscreen" type="button">PANTALLA COMPLETA</button><button class="btn btn-danger btn-small" data-action="reset-settings" type="button">RESTABLECER AJUSTES</button></div></div>
      </div>`;
  }

  resetSettings() {
    this.game.saveSystem.resetSettings();
    this.game.settings = this.game.saveSystem.settings;
    this.game.applySettings();
    this.renderPanel();
    this.toast('Ajustes restablecidos', 'Todo vuelve a su cauce.', 'loot');
  }

  toggleFullscreen() {
    const el = document.documentElement;
    if (!document.fullscreenElement) {
      el.requestFullscreen?.().catch(() => this.toast('Pantalla completa', 'El navegador no permite activarla aquí.', 'warn'));
    } else {
      document.exitFullscreen?.();
    }
  }

  // ── Tienda ────────────────────────────────────────────────────────────
  panelShop() {
    const shopId = this.panel.opts.shopId || 'sela';
    const shop = SHOPS[shopId] || SHOPS.sela;
    const p = this.game.player;
    const inv = this.game.inventory;
    if (!p || !inv) return this.panelHead('Tienda', '') + '<p class="panel-empty">No hay peregrino.</p>';
    const tabs = this.panelTabs([['buy', 'Comprar'], ['sell', 'Vender']]);
    let body = '';
    if (this.panel.tab === 'sell') {
      const entries = Object.entries(inv.items).filter(([id, qty]) => qty > 0 && ITEMS[id] && ITEMS[id].type !== 'quest' && !ITEMS[id].unique);
      body = `<div class="item-list">${entries.length ? entries.map(([id, qty]) => {
        const item = ITEMS[id];
        const rarity = itemRarity(item);
        return `<div class="item-row"><span class="item-icon" style="color:${rarity.color}">${itemIcon(item)}</span><div class="item-body"><strong>${esc(item.name)}</strong><small>${esc(rarity.name)} · ×${qty}</small></div><div class="item-actions"><button class="mini-btn" data-action="sell" data-id="${id}" type="button">VENDER ◈${inv.sellPrice(id)}</button></div></div>`;
      }).join('') : '<p class="panel-empty">No tienes nada que vender.</p>'}</div>`;
    } else {
      body = `<div class="item-list">${shop.stock.map((id) => {
        const item = ITEMS[id];
        if (!item) return '';
        const rarity = itemRarity(item);
        const price = inv.buyPrice(id);
        const can = p.gold >= price;
        return `<div class="item-row"><span class="item-icon" style="color:${rarity.color}">${itemIcon(item)}</span><div class="item-body"><strong>${esc(item.name)}</strong><small>${esc(rarity.name)} · ${esc(item.desc || '')}</small></div><div class="item-actions"><button class="mini-btn" data-action="buy" data-id="${id}" ${can ? '' : 'disabled'} type="button">COMPRAR ◈${price}</button></div></div>`;
      }).join('')}</div>`;
    }
    return this.panelHead(shop.name, shop.greeting, `<span class="shop-wallet" style="margin:0">◈ ${p.gold}</span>`) + tabs + body;
  }

  buyItem(id) {
    const p = this.game.player;
    const inv = this.game.inventory;
    const price = inv.buyPrice(id);
    if (p.gold < price) { this.toast('Oro insuficiente', `Necesitas ◈ ${price}.`, 'warn'); return; }
    p.gold -= price;
    inv.add(id, 1);
    this.game.audio.sfx('buy');
    this.toast('Compra realizada', `${ITEMS[id]?.name || id} · ◈ ${price}`, 'loot');
    this.game.quests?.refreshCollect();
    this.renderPanel();
    this.syncHud(0, true);
  }

  sellItem(id) {
    const inv = this.game.inventory;
    const p = this.game.player;
    if (!inv.remove(id, 1)) return;
    const price = inv.sellPrice(id);
    p.gold += price;
    this.game.audio.sfx('gold');
    this.toast('Venta realizada', `${ITEMS[id]?.name || id} · +◈ ${price}`, 'loot');
    this.renderPanel();
    this.syncHud(0, true);
  }

  // ── Forja ─────────────────────────────────────────────────────────────
  panelForge() {
    const inv = this.game.inventory;
    const p = this.game.player;
    if (!inv || !p) return this.panelHead('Forja', '') + '<p class="panel-empty">No hay peregrino.</p>';
    const owned = Object.keys(inv.items).filter((id) => ITEMS[id] && ['weapon', 'armor', 'helmet', 'accessory'].includes(ITEMS[id].type));
    const cards = owned.length ? owned.map((id) => {
      const item = ITEMS[id];
      const lvl = inv.upgradeLevel(id);
      const cost = inv.upgradeCost(id);
      const equipped = inv.isEquipped(id);
      const stats = itemStatLine(item).map((s) => `${s.label} ${s.value}`).join(' · ');
      const costText = cost ? `◈ ${cost.gold}${cost.iron ? ` · Hierro ×${cost.iron}` : ''}${cost.gem_shard ? ` · Fragmento ×${cost.gem_shard}` : ''}${cost.living_ash ? ` · Ceniza ×${cost.living_ash}` : ''}` : 'Máximo';
      const can = cost && p.gold >= cost.gold && inv.has('iron', cost.iron) && (!cost.gem_shard || inv.has('gem_shard', cost.gem_shard)) && (!cost.living_ash || inv.has('living_ash', cost.living_ash));
      return `<div class="item-row"><span class="item-icon" style="color:${itemRarity(item).color}">${itemIcon(item)}</span>
        <div class="item-body"><strong>${esc(item.name)} ${lvl ? `+${lvl}` : ''}${equipped ? ' · EQUIPADO' : ''}</strong><small>${esc(stats)}</small><small style="color:var(--gold)">${esc(costText)}</small></div>
        <div class="item-actions">${cost ? `<button class="mini-btn" data-action="upgrade" data-id="${id}" ${can ? '' : 'disabled'} type="button">MEJORAR</button>` : '<span class="item-qty">MÁX.</span>'}</div>
      </div>`;
    }).join('') : '<p class="panel-empty">No tienes equipo que mejorar. Encuentra hierro y fragmentos.</p>';
    return this.panelHead('Forja de Orin', 'El acero recuerda. Dale algo que recordar.') +
      `<div class="shop-wallet"><span>◈ ${p.gold}</span><span>Hierro ×${inv.count('iron')} · Fragmentos ×${inv.count('gem_shard')} · Ceniza ×${inv.count('living_ash')}</span></div>
      <div class="panel-section"><h3>Equipo mejorable</h3><div class="item-list">${cards}</div></div>`;
  }

  upgradeItem(id) {
    const inv = this.game.inventory;
    const p = this.game.player;
    const cost = inv.upgradeCost(id);
    if (!cost) return;
    if (p.gold < cost.gold || !inv.has('iron', cost.iron) || (cost.gem_shard && !inv.has('gem_shard', cost.gem_shard)) || (cost.living_ash && !inv.has('living_ash', cost.living_ash))) {
      this.toast('Materiales insuficientes', 'La forja no perdona las deudas.', 'warn');
      return;
    }
    p.gold -= cost.gold;
    if (cost.iron) inv.remove('iron', cost.iron);
    if (cost.gem_shard) inv.remove('gem_shard', cost.gem_shard);
    if (cost.living_ash) inv.remove('living_ash', cost.living_ash);
    inv.applyUpgrade(id);
    p.recalc(true);
    this.game.audio.sfx('heavy');
    this.toast('Forja completada', `${ITEMS[id]?.name || id} +${inv.upgradeLevel(id)}`, 'loot');
    this.renderPanel();
    this.syncHud(0, true);
    this.game.autosave();
  }

  // ── Guardado ──────────────────────────────────────────────────────────
  panelSave() {
    const game = this.game;
    const slots = game.saveSystem.slots;
    const cards = [1, 2, 3].map((n) => {
      const s = slots[n];
      const meta = s?.meta;
      return `<div class="save-slot">
        <div><strong>Ranura ${n}${meta ? ` · ${esc(meta.name)}` : ' · Vacía'}</strong>
          <small>${meta ? `${esc(meta.region)} · Nivel ${meta.level} · ${formatTime(meta.playtime)}${meta.quest ? ` · ${esc(meta.quest)}` : ''}` : 'Sin ecos guardados.'}</small>
          <small>${s ? new Date(s.savedAt).toLocaleString('es-ES') : ''}</small></div>
        <div class="save-actions">
          ${game.player ? `<button class="mini-btn" data-action="save-slot" data-id="${n}" type="button">GUARDAR</button>` : ''}
          ${s ? `<button class="mini-btn" data-action="load-slot" data-id="${n}" type="button">CARGAR</button>` : ''}
          ${s ? `<button class="mini-btn danger" data-action="delete-slot" data-id="${n}" type="button">BORRAR</button>` : ''}
        </div>
      </div>`;
    }).join('');
    const auto = game.getAutoSave();
    const autoInfo = auto ? `<p style="color:var(--muted);font-size:13px">Eco automático: ${esc(auto.meta?.name || 'Peregrino')} · ${esc(auto.meta?.region || 'Valdoria')} · Nivel ${auto.meta?.level || 1} · ${formatTime(auto.meta?.playtime || 0)}</p>` : '<p style="color:var(--muted);font-size:13px">Todavía no hay un eco automático.</p>';
    return this.panelHead('Guardar / Cargar', 'Tres ranuras y un eco que el mundo deja por ti.') +
      `<div class="save-slots">${cards}</div><div class="panel-section" style="margin-top:14px"><h3>Eco automático</h3>${autoInfo}</div>`;
  }

  saveSlot(slot) {
    if (!this.game.player) return;
    if (this.game.saveSlot(slot)) {
      this.toast('Partida guardada', `Ranura ${slot}.`, 'loot');
      this.renderPanel();
    } else this.toast('No se pudo guardar', 'El almacenamiento local está bloqueado.', 'warn');
  }

  loadSlot(slot) {
    if (!this.game.loadSlot(slot)) { this.toast('No se pudo cargar', 'La ranura está vacía o dañada.', 'warn'); return; }
    this.closePanel();
    this.el.menu.classList.add('hidden');
    this.toast('Partida cargada', 'La travesía continúa.', 'quest');
  }

  deleteSlot(slot) {
    this.game.saveSystem.remove(slot);
    this.toast('Ranura borrada', `Ranura ${slot}.`, 'warn');
    this.renderPanel();
    this.refreshTitle();
  }

  // ── Ayuda ─────────────────────────────────────────────────────────────
  panelHelp() {
    return this.panelHead('Cómo jugar', 'La Espada Celestial no se juega con prisa.') +
      `<div class="help-grid">
        <div class="panel-section"><h3>Teclado y ratón</h3><div class="key-list">
          <kbd>WASD</kbd><span>Moverte</span>
          <kbd>Ratón</kbd><span>Apuntar</span>
          <kbd>J</kbd><span>Ataque ligero (combo de 3)</span>
          <kbd>K</kbd><span>Ataque pesado</span>
          <kbd>Espacio</kbd><span>Esquivar (invulnerable)</span>
          <kbd>L</kbd><span>Bloquear / parry</span>
          <kbd>E</kbd><span>Interactuar / hablar</span>
          <kbd>U</kbd><span>Lanzar hechizo</span>
          <kbd>1 2 3</kbd><span>Elegir hechizo</span>
          <kbd>C</kbd><span>Habilidad de resonancia</span>
          <kbd>R</kbd><span>Definitiva</span>
          <kbd>Q</kbd><span>Poción de Lumen</span>
          <kbd>V</kbd><span>Sintonizar criatura debilitada</span>
          <kbd>M</kbd><span>Mapa</span>
          <kbd>Tab / Esc</kbd><span>Pausa</span>
        </div></div>
        <div class="panel-section"><h3>Táctil</h3><div class="key-list">
          <kbd>◉</kbd><span>Joystick de movimiento</span>
          <kbd>⚔</kbd><span>Atacar</span>
          <kbd>➤</kbd><span>Esquivar</span>
          <kbd>✦</kbd><span>Hechizo</span>
          <kbd>❧</kbd><span>Resonancia</span>
          <kbd>◇</kbd><span>Sintonizar</span>
          <kbd>★</kbd><span>Definitiva</span>
          <kbd>E</kbd><span>Interactuar</span>
          <kbd>✚</kbd><span>Poción</span>
        </div>
        <p style="color:var(--muted);font-size:13px;line-height:1.5;margin-top:12px">Gira el dispositivo a horizontal para una experiencia más amplia. Los controles táctiles respetan las áreas seguras del sistema.</p>
        </div>
      </div>
      <div class="panel-section" style="margin-top:14px"><h3>Consejos del peregrino</h3>
        <p style="color:var(--muted);font-size:14px;line-height:1.55">Los enemigos telegrafían sus ataques con un destello o una postura. Esquivar en el último instante otorga invulnerabilidad breve. Un parry perfecto (bloquear justo antes del golpe) restaura maná y aturde. Las criaturas con un aro violeta pueden sintonizarse cuando su vida baja del 60%. Los puntos de guardado restauran tu vitalidad y guardan el progreso. Si caes, vuelves al último eco sin perder la historia.</p>
      </div>`;
  }

  panelLore() {
    const opts = this.panel.opts;
    return this.panelHead(opts.title || 'Eco', opts.subtitle || '') +
      `<div class="panel-section"><p style="font-size:17px;line-height:1.65;color:#d8cdbd;white-space:pre-wrap">${esc(opts.text || '')}</p></div>`;
  }

  // ── Muerte / final ────────────────────────────────────────────────────
  showDeath(text) {
    this.el.deathText.textContent = text || 'La octava vida no termina aquí. El Velo aún tiembla.';
    this.el.death.classList.remove('hidden');
    this.el.hud.classList.add('hidden');
    this.el.dialogue.classList.add('hidden');
    this.el.menu.classList.add('hidden');
    this.el.panel.classList.add('hidden');
  }

  hideDeath() {
    this.el.death.classList.add('hidden');
    this.el.hud.classList.remove('hidden');
  }

  showEnding(endingId) {
    const ending = ENDINGS[endingId] || ENDINGS.restore;
    this.el.death.classList.add('hidden');
    this.el.dialogue.classList.add('hidden');
    this.el.menu.classList.add('hidden');
    this.el.panel.classList.add('hidden');
    this.el.hud.classList.add('hidden');
    this.el.ending.classList.remove('hidden');
    const title = $('ending-title');
    const subtitle = $('ending-subtitle');
    const lines = $('ending-lines');
    const epilogue = $('ending-epilogue');
    const stats = $('ending-stats');
    if (title) { title.textContent = ending.title; title.style.color = ending.color; }
    if (subtitle) subtitle.textContent = ending.subtitle;
    if (lines) {
      lines.innerHTML = ending.lines.map((line, i) =>
        `<p style="animation-delay:${0.5 + i * 0.55}s">${esc(line)}</p>`).join('');
    }
    if (epilogue) epilogue.textContent = ending.epilogue;
    const p = this.game.player;
    if (stats && p) {
      stats.innerHTML = `
        <div><strong>${p.level}</strong><span>Nivel</span></div>
        <div><strong>${this.game.collection?.count() || 0}</strong><span>Resonancias</span></div>
        <div><strong>${p.kills}</strong><span>Enemigos</span></div>
        <div><strong>${p.captures}</strong><span>Capturas</span></div>
        <div><strong>${formatTime(p.playtime)}</strong><span>Tiempo</span></div>`;
    }
  }

  hideEnding() {
    this.el.ending.classList.add('hidden');
  }

  // ── Toasts y orientación ──────────────────────────────────────────────
  toast(title, text, type = '') {
    if (!this.el.toasts) return;
    while (this.el.toasts.children.length >= 4) this.el.toasts.firstElementChild?.remove();
    const node = document.createElement('div');
    node.className = `toast ${type}`.trim();
    const strong = document.createElement('strong');
    strong.textContent = title || '';
    const span = document.createElement('span');
    span.textContent = text || '';
    node.append(strong, span);
    this.el.toasts.appendChild(node);
    const id = ++this.toastSeq;
    setTimeout(() => {
      if (!node.isConnected) return;
      node.classList.add('out');
      setTimeout(() => node.remove(), 380);
    }, 3600 + (id % 3) * 200);
  }

  checkOrientation() {
    const portrait = window.innerHeight > window.innerWidth;
    const gameplay = this.game.state === 'playing';
    if (!portrait || !gameplay || this.rotateDismissed) {
      this.el.rotate.classList.add('hidden');
      clearTimeout(this.rotateTimer);
      this.rotateTimer = null;
      return;
    }
    if (this.rotateTimer) return;
    this.rotateTimer = setTimeout(() => {
      this.rotateTimer = null;
      if (this.game.state === 'playing' && !this.rotateDismissed && window.innerHeight > window.innerWidth && !this.game.paused && !this.game.dialogueActive) {
        this.el.rotate.classList.remove('hidden');
      }
    }, 1800);
  }

  showLoading(show) {
    this.el.loading.classList.toggle('hidden', !show);
  }

  showFatal(error) {
    this.el.fatal.classList.remove('hidden');
    this.el.fatal.textContent = `LA ESPADA CELESTIAL\n\nSe ha roto un hilo del Velo.\n\n${error?.stack || error?.message || error}`;
  }
}
