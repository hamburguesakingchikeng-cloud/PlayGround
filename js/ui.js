// DOM interface: HUD, satchel, level-up cards, legendary reveal, menus.

import {
  RARITIES, SLOTS, SLOT_LABEL, BOONS, RUN_DURATION
} from './data.js';
import {
  itemTooltipHTML, itemIconHTML, slotGlyph, iconSVG, itemPowerLabel
} from './loot.js';

const BOON_ICONS = {
  sword: `<path d="M8 34 28 14l5 5L13 39l-6 1 1-6Z"/><path d="m25 11 7 7M12 36l5 5"/>`,
  bolt: `<path d="M27 5 13 27h9l-3 16 15-24h-9l2-14Z"/>`,
  boot: `<path d="M12 10v18l-3 7h21c2 0 3-1 3-3 0-5-5-8-10-9l-3-13h-8Z"/><path d="M12 28h17"/>`,
  heart: `<path d="M24 40S8 30 8 18a8 8 0 0 1 16-2 8 8 0 0 1 16 2c0 12-16 22-16 22Z"/>`,
  shield: `<path d="M24 5 9 11v10c0 10 7 17 15 21 8-4 15-11 15-21V11L24 5Z"/><path d="M24 11v24M16 18h16"/>`,
  eye: `<path d="M5 24s7-11 19-11 19 11 19 11-7 11-19 11S5 24 5 24Z"/><circle cx="24" cy="24" r="5"/>`,
  coin: `<circle cx="24" cy="24" r="15"/><path d="M24 13v22M18 18h9a4 4 0 0 1 0 8h-6a4 4 0 0 0 0 8h9"/>`,
  magnet: `<path d="M12 9v16a12 12 0 0 0 24 0V9h-8v16a4 4 0 0 1-8 0V9h-8Z"/><path d="M8 9h8M32 9h8"/>`,
  arrows: `<path d="M8 24h24M20 12l12 12-12 12M14 18l6 6-6 6"/>`,
  burst: `<path d="m24 5 4 12 11-6-6 11 12 4-12 4 6 11-11-6-4 12-4-12-11 6 6-11-12-4 12-4-6-11 11 6 4-12Z"/>`,
  leaf: `<path d="M38 8C18 10 10 20 12 34c14 2 24-6 26-26Z"/><path d="M12 36c5-10 12-16 22-20"/>`,
  clover: `<path d="M24 24c-9-9-16-4-13 2 2 4 7 4 13-2Zm0 0c9-9 16-4 13 2-2 4-7 4-13-2Zm0 0c-9 9-4 16 2 13 4-2 4-7-2-13Zm0 0c9 9 4 16-2 13-4-2-4-7 2-13Z"/><path d="M24 27v13"/>`,
  drop: `<path d="M24 5C16 16 12 21 12 28a12 12 0 0 0 24 0c0-7-4-12-12-23Z"/><path d="M18 29a6 6 0 0 0 6 6"/>`,
  book: `<path d="M9 9h13a4 4 0 0 1 4 4v27a5 5 0 0 0-5-5H9V9Z"/><path d="M39 9H26a4 4 0 0 0-4 4v27a5 5 0 0 1 5-5h12V9Z"/><path d="M15 17h6M15 23h6M27 17h6M27 23h6"/>`,
  magnet2: `<circle cx="24" cy="24" r="16"/><circle cx="24" cy="24" r="8"/>`
};

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

function formatTime(seconds) {
  const s = Math.max(0, Math.floor(seconds));
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}

function boonIcon(name) {
  const glyph = BOON_ICONS[name] || BOON_ICONS.burst;
  return `<svg viewBox="0 0 48 48" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${glyph}</svg>`;
}

export class UI {
  constructor(game, audio) {
    this.game = game;
    this.audio = audio;
    this.$ = id => document.getElementById(id);
    this.menu = this.$('menu');
    this.hud = this.$('hud');
    this.levelup = this.$('levelup');
    this.inventory = this.$('inventory');
    this.legendary = this.$('legendary');
    this.pause = this.$('pause');
    this.end = this.$('end');
    this.tooltip = this.$('tooltip');
    this.hint = this.$('hint');
    this.toasts = this.$('toasts');
    this.bagGrid = this.$('bagGrid');
    this.paperdollSlots = this.$('paperdollSlots');
    this.statList = this.$('statList');
    this.boonCards = this.$('boonCards');
    this.inventoryMap = new Map();
    this.hintTimer = 0;
    this.toastTimer = 0;
    this.longPressTimer = null;
    this.longPressFired = false;
    this.bound = false;
    this.lastDock = '';
    this.audioReady = false;
    this.initBindings();
    this.updateBest();
    this.audio.setMuted(localStorage.getItem('grimhoard.muted') === '1');
    this.updateMuteButton();
  }

  initBindings() {
    if (this.bound) return;
    this.bound = true;
    const click = (id, fn) => {
      const el = this.$(id);
      if (el) el.addEventListener('click', event => { event.preventDefault(); this.ensureAudio(); fn(event); });
    };
    click('startBtn', () => this.startRun());
    click('inventoryBtn', () => this.toggleInventory());
    click('pauseBtn', () => this.game.togglePause());
    click('muteBtn', () => this.toggleMute());
    click('resumeBtn', () => this.game.togglePause());
    click('pauseInventoryBtn', () => { this.game.togglePause(); this.game.toggleInventory(); });
    click('restartBtn', () => this.startRun());
    click('closeInventory', () => { if (this.game.state === 'inventory') this.game.toggleInventory(); });
    click('salvageCommons', () => { this.game.salvageCommons(); this.renderInventory(); });
    click('gambleBtn', () => { this.game.gamble(); this.renderInventory(); });
    click('rerollBtn', () => {
      if (this.game.rerollBoons()) this.renderLevelUp(this.game.choices, this.game.level, this.game.rerollCost);
    });
    click('legendaryEquip', () => this.game.resolveLegendary('equip'));
    click('legendaryKeep', () => this.game.resolveLegendary('take'));
    click('legendarySalvage', () => this.game.resolveLegendary('salvage'));
    click('againBtn', () => this.startRun());
    click('menuBtn', () => this.goMenu());

    this.$('equipDock').addEventListener('click', () => this.toggleInventory());
    this.boonCards.addEventListener('click', event => {
      const card = event.target.closest('[data-boon]');
      if (!card) return;
      this.game.chooseBoon(card.dataset.boon);
    });
    this.boonCards.addEventListener('keydown', event => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      const card = event.target.closest('[data-boon]');
      if (!card) return;
      event.preventDefault();
      this.game.chooseBoon(card.dataset.boon);
    });

    this.bagGrid.addEventListener('click', event => {
      if (this.longPressFired) { this.longPressFired = false; return; }
      const cell = event.target.closest('[data-uid]');
      if (!cell) return;
      const item = this.inventoryMap.get(cell.dataset.uid);
      if (!item) return;
      this.game.equipItem(item, { fromInventory: true });
      this.renderInventory();
    });
    this.bagGrid.addEventListener('contextmenu', event => {
      const cell = event.target.closest('[data-uid]');
      if (!cell) return;
      event.preventDefault();
      const item = this.inventoryMap.get(cell.dataset.uid);
      if (!item) return;
      this.game.salvageItem(item, { fromInventory: true });
      this.renderInventory();
    });
    this.bagGrid.addEventListener('pointerdown', event => {
      const cell = event.target.closest('[data-uid]');
      if (!cell) return;
      this.longPressFired = false;
      const item = this.inventoryMap.get(cell.dataset.uid);
      if (!item) return;
      this.longPressTimer = window.setTimeout(() => {
        this.longPressFired = true;
        this.game.salvageItem(item, { fromInventory: true });
        this.renderInventory();
      }, 620);
    });
    const cancelLong = () => { if (this.longPressTimer) { clearTimeout(this.longPressTimer); this.longPressTimer = null; } };
    this.bagGrid.addEventListener('pointerup', cancelLong);
    this.bagGrid.addEventListener('pointercancel', cancelLong);
    this.bagGrid.addEventListener('pointerleave', cancelLong);
    this.bagGrid.addEventListener('pointerover', event => {
      const cell = event.target.closest('[data-uid]');
      if (!cell) return;
      const item = this.inventoryMap.get(cell.dataset.uid);
      if (item) this.showTooltip(item, event);
    });
    this.bagGrid.addEventListener('pointermove', event => {
      if (this.tooltip.classList.contains('hidden')) return;
      this.positionTooltip(event);
    });
    this.bagGrid.addEventListener('pointerout', event => {
      if (event.relatedTarget && this.bagGrid.contains(event.relatedTarget)) return;
      this.hideTooltip();
    });
    this.paperdollSlots.addEventListener('click', event => {
      const cell = event.target.closest('[data-slot]');
      if (!cell) return;
      const item = this.game.equipment[cell.dataset.slot];
      if (item) this.showTooltip(item, event, true);
    });
    this.paperdollSlots.addEventListener('pointerout', () => this.hideTooltip());
    this.paperdollSlots.addEventListener('contextmenu', event => {
      const cell = event.target.closest('[data-slot]');
      if (!cell) return;
      event.preventDefault();
      this.game.unequip(cell.dataset.slot);
      this.renderInventory();
    });
    this.inventory.addEventListener('click', event => {
      if (event.target === this.inventory) {
        if (this.game.state === 'inventory') this.game.toggleInventory();
      }
    });
    this.legendary.addEventListener('click', event => {
      if (event.target === this.legendary) {
        // Clicking outside a legendary does not discard it; the player must choose.
      }
    });
  }

  ensureAudio() {
    if (!this.audioReady) {
      this.audio.ensure();
      this.audioReady = true;
    }
  }

  toggleMute() {
    const muted = !this.audio.muted;
    this.audio.setMuted(muted);
    localStorage.setItem('grimhoard.muted', muted ? '1' : '0');
    this.updateMuteButton();
    if (!muted) this.audio.play('ui');
  }

  updateMuteButton() {
    const btn = this.$('muteBtn');
    if (btn) btn.classList.toggle('muted', this.audio.muted);
  }

  /* ---------------- run lifecycle ---------------- */

  startRun() {
    this.ensureAudio();
    this.hideAllOverlays();
    this.menu.classList.add('hidden');
    this.hud.classList.remove('hidden');
    this.hint.classList.remove('fade');
    this.hintTimer = 0;
    this.game.startRun();
    this.renderDock();
    this.updateHud();
    this.toast('Survive six minutes. Loot the dead.', 'gold');
    this.audio.play('ui');
  }

  goMenu() {
    this.game.reset('menu');
    this.hideAllOverlays();
    this.hud.classList.add('hidden');
    this.menu.classList.remove('hidden');
    this.updateBest();
    this.hideTooltip();
  }

  hideAllOverlays() {
    for (const el of [this.levelup, this.inventory, this.legendary, this.pause, this.end]) el.classList.add('hidden');
    this.hideTooltip();
  }

  updateBest() {
    const el = this.$('bestRun');
    try {
      const best = JSON.parse(localStorage.getItem('grimhoard.best') || '{}');
      if (best.time > 0) {
        el.classList.remove('hidden');
        el.innerHTML = `Best run · ${formatTime(best.time)} · ${best.kills || 0} kills · Level ${best.level || 1}${best.victory ? ' · <span style="color:#f0d28e">Dawn survived</span>' : ''}`;
      } else {
        el.classList.add('hidden');
      }
    } catch {
      el.classList.add('hidden');
    }
  }

  toggleInventory() {
    this.game.toggleInventory();
    if (this.game.state === 'inventory') this.renderInventory();
  }

  /* ---------------- frame update ---------------- */

  update(dt) {
    this.hintTimer += dt;
    if (this.hintTimer > 9) this.hint.classList.add('fade');
    if (this.hintTimer > 12) this.hint.classList.add('hidden');
    this.updateHud();
  }

  updateHud() {
    const g = this.game;
    if (!g || g.state === 'menu') return;
    const d = g.derived;
    const p = g.player;
    this.$('levelBadge').textContent = g.level;
    this.$('hpFill').style.width = `${clamp(p.hp / d.maxLife, 0, 1) * 100}%`;
    this.$('hpText').textContent = `${Math.ceil(Math.max(0, p.hp))} / ${Math.round(d.maxLife)}`;
    this.$('xpFill').style.width = `${clamp(g.xp / g.xpNext, 0, 1) * 100}%`;
    this.$('xpText').textContent = `${Math.floor(g.xp)} / ${g.xpNext} XP`;
    this.$('timer').textContent = formatTime(g.time);
    this.$('waveLabel').textContent = g.waveLabel();
    this.$('goldText').textContent = Math.floor(g.gold);
    this.$('killsText').textContent = g.kills;
    this.$('statDps').textContent = `DPS ${d.dps.toFixed(1)}`;
    this.$('statArmor').textContent = `ARMOR ${Math.round(d.armor)}`;
    this.$('statCrit').textContent = `CRIT ${Math.round(d.critChance * 100)}%`;

    const bossBar = this.$('bossBar');
    if (g.boss && !g.boss.dead) {
      bossBar.classList.remove('hidden');
      const pct = clamp(g.boss.hp / g.boss.maxHp, 0, 1);
      this.$('bossFill').style.width = `${pct * 100}%`;
      this.$('bossHpText').textContent = `${Math.ceil(pct * 100)}%`;
    } else {
      bossBar.classList.add('hidden');
    }

    const dock = this.dockSignature();
    if (dock !== this.lastDock) {
      this.lastDock = dock;
      this.renderDock();
    }
  }

  dockSignature() {
    return SLOTS.map(s => {
      const i = this.game.equipment[s];
      return i ? `${i.uid}:${i.rarity}` : '-';
    }).join('|');
  }

  renderDock() {
    const dock = this.$('equipDock');
    dock.innerHTML = SLOTS.map(slot => {
      const item = this.game.equipment[slot];
      const rarity = item ? item.rarity : '';
      return `<button class="equip-slot ${item ? 'rarity-' + rarity : ''}" data-dock-slot="${slot}" title="${item ? item.name : 'Empty ' + SLOT_LABEL[slot]}" aria-label="${item ? item.name : 'Empty ' + SLOT_LABEL[slot]}">
        ${item ? itemIconHTML(item) : slotGlyph(slot)}
        <span class="slot-key">${SLOT_LABEL[slot][0]}</span>
      </button>`;
    }).join('');
  }

  /* ---------------- level up ---------------- */

  showLevelUp(choices, level, rerollCost) {
    this.levelup.classList.remove('hidden');
    this.renderLevelUp(choices, level, rerollCost);
    this.audio.play('levelup');
  }

  renderLevelUp(choices, level, rerollCost) {
    this.$('levelupLevel').textContent = level;
    this.$('levelupGold').textContent = Math.floor(this.game.gold);
    this.$('rerollCost').textContent = rerollCost;
    const reroll = this.$('rerollBtn');
    reroll.disabled = this.game.gold < rerollCost;
    this.boonCards.innerHTML = choices.map(boon => {
      const stacks = this.game.boonStacks[boon.id] || 0;
      const stackText = boon.max < 90 ? `${stacks} / ${boon.max}` : '';
      return `<button class="card" data-boon="${boon.id}" role="button">
        <span class="card-icon">${boonIcon(boon.icon)}</span>
        <span class="card-name">${boon.name}</span>
        <span class="card-desc">${boon.desc}</span>
        <span class="card-tag">${boon.special ? 'Blood' : 'Boon'}</span>
        <span class="card-stack">${stackText}</span>
      </button>`;
    }).join('');
  }

  closeLevelUp() {
    this.levelup.classList.add('hidden');
  }

  /* ---------------- inventory ---------------- */

  renderInventory() {
    if (this.game.state !== 'inventory') return;
    this.renderPaperdoll();
    this.renderBag();
    this.renderStats();
    this.$('bagCount').textContent = `${this.game.inventory.length} / 24`;
    this.$('gambleCost').textContent = this.game.gambleCost;
    this.$('gambleBtn').disabled = this.game.gold < this.game.gambleCost;
  }

  renderPaperdoll() {
    this.paperdollSlots.innerHTML = SLOTS.map(slot => {
      const item = this.game.equipment[slot];
      return `<div class="equip-cell ${item ? 'rarity-' + item.rarity : 'empty'}" data-slot="${slot}" tabindex="0" role="button" aria-label="${item ? item.name : 'Empty ' + SLOT_LABEL[slot]}">
        ${item ? itemIconHTML(item) : slotGlyph(slot)}
        <span class="slot-label">${SLOT_LABEL[slot]}</span>
      </div>`;
    }).join('');
  }

  renderBag() {
    this.inventoryMap.clear();
    const cells = [];
    for (let i = 0; i < 24; i++) {
      const item = this.game.inventory[i];
      if (!item) {
        cells.push('<div class="item-cell empty"></div>');
        continue;
      }
      this.inventoryMap.set(item.uid, item);
      cells.push(`<button class="item-cell rarity-${item.rarity}" data-uid="${item.uid}" aria-label="${item.name}">
        ${itemIconHTML(item)}
        ${item.isNew ? '<span class="new-dot"></span>' : ''}
      </button>`);
    }
    this.bagGrid.innerHTML = cells.join('');
  }

  renderStats() {
    const d = this.game.derived;
    const rows = [
      ['DPS', d.dps.toFixed(1), true],
      ['Damage', `+${Math.round(d.damagePct)}%`],
      ['Attack Speed', `+${Math.round(d.attackSpeedPct)}%`],
      ['Move Speed', `${Math.round(d.moveSpeed)}`],
      ['Max Life', `${Math.round(d.maxLife)}`, true],
      ['Armor', `${Math.round(d.armor)}`],
      ['Crit Chance', `${(d.critChance * 100).toFixed(1)}%`],
      ['Crit Damage', `${Math.round(d.critMult * 100)}%`],
      ['Pickup', `${Math.round(d.pickup)}`],
      ['Gold Find', `+${Math.round(d.goldFind)}%`],
      ['Magic Find', `+${Math.round(d.magicFind)}%`],
      ['Life Steal', `${d.lifesteal.toFixed(1)}%`],
      ['Regen', `${d.regen.toFixed(1)}/s`],
      ['Thorns', `${Math.round(d.flags.thorns)}`],
      ['Projectiles', `${d.projectiles}`]
    ];
    this.statList.innerHTML = rows.map(([label, value, hl]) => `<div class="${hl ? 'hl' : ''}"><span>${label}</span><b>${value}</b></div>`).join('');
  }

  showTooltip(item, event, equipped = false) {
    if (!item) return;
    const equipment = equipped
      ? { ...this.game.equipment, [item.slot]: null }
      : this.game.equipment;
    this.tooltip.innerHTML = itemTooltipHTML(item, {
      equipment,
      boonStats: this.game.boonStats,
      compact: equipped
    });
    this.tooltip.classList.remove('hidden');
    this.positionTooltip(event);
  }

  positionTooltip(event) {
    const pad = 12;
    const rect = this.tooltip.getBoundingClientRect();
    let x = (event.clientX || 0) + 18;
    let y = (event.clientY || 0) + 18;
    if (x + rect.width > window.innerWidth - pad) x = (event.clientX || 0) - rect.width - 18;
    if (y + rect.height > window.innerHeight - pad) y = window.innerHeight - rect.height - pad;
    this.tooltip.style.left = `${Math.max(pad, x)}px`;
    this.tooltip.style.top = `${Math.max(pad, y)}px`;
  }

  hideTooltip() {
    this.tooltip.classList.add('hidden');
  }

  /* ---------------- legendary ---------------- */

  showLegendary(item, current) {
    this.legendary.classList.remove('hidden');
    this.$('legendaryGold').textContent = item.salvage;
    const equipped = current ? { ...this.game.equipment, [item.slot]: null } : this.game.equipment;
    this.$('legendaryCard').innerHTML = `<div class="tooltip">${itemTooltipHTML(item, {
      equipment: equipped,
      boonStats: this.game.boonStats
    })}</div>`;
    this.audio.play('legendary');
  }

  closeLegendary() {
    this.legendary.classList.add('hidden');
  }

  /* ---------------- pause / end ---------------- */

  showPause(show) {
    this.pause.classList.toggle('hidden', !show);
  }

  showEnd(summary) {
    this.hideAllOverlays();
    this.hud.classList.add('hidden');
    this.end.classList.remove('hidden');
    const win = summary.victory;
    this.$('endEyebrow').textContent = win ? 'The night is broken' : 'The graveyard claims another';
    const title = this.$('endTitle');
    title.textContent = win ? 'DAWN BREAKS' : 'YOU DIED';
    title.className = win ? 'win' : 'lose';
    this.$('endSub').textContent = win
      ? 'You survived six minutes. The hoard is yours.'
      : 'Your hoard passes to the next fool.';
    this.$('endStats').innerHTML = [
      ['Time', formatTime(summary.time)],
      ['Kills', summary.kills],
      ['Level', summary.level],
      ['Gold', Math.floor(summary.gold)],
      ['Loot looted', summary.itemsLooted],
      ['Damage dealt', summary.damageDealt.toLocaleString()],
      ['Bone Tyrant', summary.bossDefeated ? 'Slain' : 'Alive'],
      ['Victory', win ? 'Yes' : 'No']
    ].map(([label, value]) => `<div><span>${label}</span><b>${value}</b></div>`).join('');
    this.updateBest();
    this.audio.play(win ? 'legendary' : 'hurt');
  }

  /* ---------------- toasts ---------------- */

  toast(text, tone = '') {
    const el = document.createElement('div');
    el.className = `toast ${tone || ''}`;
    el.textContent = text;
    this.toasts.appendChild(el);
    while (this.toasts.children.length > 4) this.toasts.removeChild(this.toasts.firstChild);
    window.setTimeout(() => {
      el.style.opacity = '0';
      el.style.transition = 'opacity .3s ease';
      window.setTimeout(() => el.remove(), 320);
    }, 2600);
  }
}
