import { icon } from './icons.js';
import { RARITY, RARITY_ORDER, SLOTS, SLOT_ORDER, RELICS, ARCH } from './data.js';
import { itemImplicitText, affixText, compareLines, formatStat } from './loot.js';
import { formatTime, formatNum, clamp, round1, store } from './core.js';

const $ = (id) => document.getElementById(id);

export class UI {
  constructor(game, audio) {
    this.game = game;
    this.audio = audio;
    this.selected = null;
    this.choices = [];
    this.returnState = 'playing';
    this.announceTimer = null;
    this.bossShown = false;
    this.hudCache = {};

    game.ui = this;

    this.el = {
      hud: $('hud'), xpfill: $('xpfill'), hpfill: $('hpfill'), hptext: $('hptext'),
      hpregen: $('hpregen'), armorVal: $('armorVal'), levelNum: $('levelNum'),
      timer: $('timer'), kills: $('kills'), goldNum: $('goldNum'),
      bossbar: $('bossbar'), bossName: $('bossName'), bossfill: $('bossfill'), bossPct: $('bossPct'),
      weaponChip: $('weaponChip'), weaponIcon: $('weaponIcon'), weaponName: $('weaponName'), weaponSub: $('weaponSub'),
      announce: $('announce'), toasts: $('toasts'),
      menu: $('menu'), relicCards: $('relicCards'), bestRecord: $('bestRecord'), menuCrest: $('menuCrest'),
      levelup: $('levelup'), luLevel: $('luLevel'), luCards: $('luCards'), btnReroll: $('btnReroll'), rerollCost: $('rerollCost'),
      inventory: $('inventory'), invGoldNum: $('invGoldNum'), equipSlots: $('equipSlots'), statList: $('statList'),
      bagCount: $('bagCount'), bagGrid: $('bagGrid'), itemDetail: $('itemDetail'), autoEquip: $('autoEquip'),
      pause: $('pause'), gameover: $('gameover'), endEyebrow: $('endEyebrow'), endTitle: $('endTitle'),
      endFlavor: $('endFlavor'), endStats: $('endStats'), endBest: $('endBest'),
      joystick: $('joystick'),
    };

    this.bind();
    this.buildMenu();
    this.refreshBest();
    this.refreshMute();
    this.el.autoEquip.checked = game.autoEquip;
  }

  show(node) { node?.classList.remove('hidden'); }
  hide(node) { node?.classList.add('hidden'); }

  bind() {
    $('btnBag').innerHTML = icon('bag');
    $('btnMute').innerHTML = icon('sound');
    $('btnPause').innerHTML = icon('pause');
    $('btnInvClose').innerHTML = icon('cross');
    this.el.menuCrest.innerHTML = icon('skull');

    $('btnBag').addEventListener('click', () => {
      if (this.game.state === 'playing' || this.game.state === 'paused') this.openInventory();
    });
    $('btnMute').addEventListener('click', () => this.toggleMute());
    $('btnPause').addEventListener('click', () => this.pauseGame());
    $('btnResume').addEventListener('click', () => this.resumeGame());
    $('btnPauseBag').addEventListener('click', () => this.openInventory('paused'));
    $('btnQuit').addEventListener('click', () => this.quitToMenu());
    $('btnInvClose').addEventListener('click', () => this.closeInventory());
    $('btnSort').addEventListener('click', () => { this.game.sortBag(); this.renderInventory(); this.audio.ui(); });
    $('btnSellJunk').addEventListener('click', () => {
      const total = this.game.sellJunk();
      if (total) {
        this.selected = null;
        this.renderInventory();
      }
    });
    this.el.autoEquip.addEventListener('change', (e) => {
      this.game.setAutoEquip(e.target.checked);
      this.toast('Auto-equip', e.target.checked ? 'Upgrades are equipped automatically.' : 'Upgrades go to your satchel.', 'magic', 'bag');
    });

    this.el.relicCards.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-relic]');
      if (btn) this.startRun(btn.dataset.relic);
    });

    this.el.luCards.addEventListener('click', (e) => {
      const card = e.target.closest('[data-index]');
      if (card) this.chooseUpgrade(Number(card.dataset.index));
    });
    this.el.btnReroll.addEventListener('click', () => this.reroll());

    this.el.equipSlots.addEventListener('click', (e) => {
      const slotEl = e.target.closest('[data-slot]');
      if (!slotEl) return;
      const item = this.game.equipment[slotEl.dataset.slot];
      if (item) this.select(item, 'equip', slotEl.dataset.slot);
      else {
        this.selected = null;
        this.renderDetail();
        this.audio.ui();
      }
    });

    this.el.bagGrid.addEventListener('click', (e) => {
      const cell = e.target.closest('[data-item]');
      if (!cell) return;
      const item = this.game.inventory.find((i) => i.id === Number(cell.dataset.item));
      if (item) this.select(item, 'bag');
    });

    this.el.itemDetail.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-act]');
      if (!btn || !this.selected) return;
      const { item, from, slot } = this.selected;
      if (btn.dataset.act === 'equip') {
        if (this.game.equipItem(item)) {
          this.selected = { item, from: 'equip', slot: item.slot };
          this.renderInventory();
          this.audio.equip();
        }
      } else if (btn.dataset.act === 'sell') {
        if (this.game.sellItem(item)) {
          this.selected = null;
          this.renderInventory();
        }
      } else if (btn.dataset.act === 'unequip') {
        if (this.game.unequip(slot)) {
          this.selected = { item, from: 'bag', slot: null };
          this.renderInventory();
          this.audio.equip();
        }
      }
    });

    $('btnAgain').addEventListener('click', () => this.startRun(this.game.relic?.id || 'wand'));
    $('btnEndBag').addEventListener('click', () => this.openInventory(this.game.state));
    $('btnMenu').addEventListener('click', () => this.quitToMenu());

    // prevent clicks in empty overlay space from reaching the canvas
    document.querySelectorAll('.overlay').forEach((o) => o.addEventListener('pointerdown', (e) => e.stopPropagation()));
  }

  /* ── menu ──────────────────────────────────────────────────── */
  buildMenu() {
    this.el.relicCards.innerHTML = RELICS.map((r) => `
      <button class="relic" data-relic="${r.id}">
        <span class="relic-ico">${icon(r.icon)}</span>
        <span class="relic-title">${r.title}</span>
        <b>${r.name}</b>
        <span class="relic-desc">${r.desc}</span>
        <span class="relic-perk">${r.perk}</span>
        <span class="relic-cta">Begin the descent</span>
      </button>
    `).join('');
  }

  refreshBest() {
    const best = store.get('cryptfall.best', null);
    if (!best) {
      this.el.bestRecord.textContent = 'No descent recorded yet.';
      return;
    }
    const item = best.itemName ? ` · best find: ${best.itemName}` : '';
    this.el.bestRecord.innerHTML = `BEST DESCENT · ${formatTime(best.time)} · LEVEL ${best.level} · ${formatNum(best.kills)} SLAIN${best.win ? ' · CLEARED' : ''}${item}`;
  }

  refreshMute() {
    $('btnMute').innerHTML = icon(this.audio.muted ? 'mute' : 'sound');
    $('btnMute').classList.toggle('muted', this.audio.muted);
  }

  toggleMute() {
    this.audio.setMuted(!this.audio.muted);
    this.refreshMute();
    this.audio.ui();
  }

  startRun(relicId) {
    this.audio.resume();
    this.hide(this.el.menu);
    this.hide(this.el.gameover);
    this.hide(this.el.levelup);
    this.hide(this.el.inventory);
    this.hide(this.el.pause);
    this.hide(this.el.bossbar);
    this.bossShown = false;
    this.game.start(relicId);
    this.show(this.el.hud);
    this.selected = null;
    this.returnState = 'playing';
    this.updateWeaponChip(true);
    this.announce('DESCEND', 'good');
    this.toast('Relic claimed', `${this.game.equipment.weapon.name} · ${this.game.equipment.weapon.affixes.length ? affixText(this.game.equipment.weapon.affixes[0]) : 'A beginning'}`, 'magic', 'wand', 4200);
  }

  quitToMenu() {
    this.hide(this.el.pause);
    this.hide(this.el.gameover);
    this.hide(this.el.inventory);
    this.hide(this.el.levelup);
    this.hide(this.el.hud);
    this.hide(this.el.bossbar);
    this.game.reset();
    this.game.state = 'menu';
    this.show(this.el.menu);
    this.refreshBest();
    this.audio.ui();
  }

  /* ── HUD ───────────────────────────────────────────────────── */
  updateHUD() {
    const g = this.game;
    const p = g.player;
    const s = g.stats;
    const c = this.hudCache;

    const hpPct = clamp((p.hp / p.maxHp) * 100, 0, 100);
    if (c.hp !== Math.ceil(p.hp) || c.maxHp !== Math.round(p.maxHp)) {
      this.el.hpfill.style.width = hpPct + '%';
      this.el.hptext.textContent = `${Math.ceil(p.hp)} / ${Math.round(p.maxHp)}`;
      this.el.hpfill.classList.toggle('low', hpPct < 30);
      c.hp = Math.ceil(p.hp);
      c.maxHp = Math.round(p.maxHp);
    }
    if (c.regen !== round1(s.regen)) {
      this.el.hpregen.textContent = `+${round1(s.regen)} /s`;
      c.regen = round1(s.regen);
    }
    if (c.armor !== Math.round(s.armor)) {
      this.el.armorVal.textContent = `${Math.round(s.armor)} ARMOR`;
      c.armor = Math.round(s.armor);
    }
    const xpPct = clamp((p.xp / p.xpNext) * 100, 0, 100);
    if (c.xp !== xpPct) {
      this.el.xpfill.style.width = xpPct + '%';
      c.xp = xpPct;
    }
    if (c.level !== p.level) {
      this.el.levelNum.textContent = p.level;
      c.level = p.level;
    }
    const timeStr = formatTime(g.time);
    if (c.time !== timeStr) {
      this.el.timer.textContent = timeStr;
      c.time = timeStr;
    }
    if (c.kills !== g.kills) {
      this.el.kills.innerHTML = `<b>${formatNum(g.kills)}</b> SLAIN`;
      c.kills = g.kills;
    }
    if (c.gold !== g.gold) {
      this.el.goldNum.textContent = formatNum(g.gold);
      c.gold = g.gold;
    }

    const weapon = g.equipment.weapon;
    const wid = weapon ? weapon.id : 'fist';
    if (c.weaponId !== wid) this.updateWeaponChip(true);

    if (g.boss && !g.boss.dead) {
      if (!this.bossShown) this.showBoss(g.boss);
      this.el.bossfill.style.width = `${clamp((g.boss.hp / g.boss.maxHp) * 100, 0, 100)}%`;
      this.el.bossPct.textContent = `${Math.ceil((g.boss.hp / g.boss.maxHp) * 100)}%`;
    } else if (this.bossShown) {
      this.hideBoss();
    }
  }

  updateWeaponChip(force = false) {
    const g = this.game;
    const item = g.equipment.weapon;
    const base = item?.base || { arch: 'fist', name: 'Bare Hands', color: '#cfc7b8' };
    const arch = ARCH[base.arch] || ARCH.fist;
    const iconName = { wand: 'wand', sword: 'sword', bow: 'bow', scythe: 'scythe', fist: 'gloves' }[base.arch] || 'sword';
    this.el.weaponIcon.innerHTML = icon(iconName);
    const color = item ? RARITY[item.rarity].color : '#cfc7b8';
    this.el.weaponIcon.style.color = color;
    this.el.weaponName.textContent = item ? item.name : 'Bare Hands';
    this.el.weaponName.style.color = item ? color : '';
    this.el.weaponSub.textContent = `${arch.name} · ${Math.round(g.stats.weaponDamage || 4)} dmg`;
    this.hudCache.weaponId = item ? item.id : 'fist';
  }

  showBoss(e) {
    this.bossShown = true;
    this.el.bossName.textContent = e.name;
    this.el.bossbar.classList.remove('hidden');
    this.el.bossfill.style.width = '100%';
    this.el.bossPct.textContent = '100%';
  }

  hideBoss() {
    this.bossShown = false;
    this.el.bossbar.classList.add('hidden');
  }

  /* ── announcements & toasts ───────────────────────────────── */
  announce(text, kind = 'good') {
    const el = this.el.announce;
    el.textContent = text;
    el.className = `show ${kind}`;
    clearTimeout(this.announceTimer);
    this.announceTimer = setTimeout(() => {
      el.className = '';
    }, kind === 'boss' || kind === 'victory' ? 3400 : 2300);
  }

  toast(title, sub = '', rarity = 'common', iconName = 'skull', duration = 3400) {
    const rar = RARITY[rarity] || RARITY.common;
    const el = document.createElement('div');
    el.className = 'toast';
    el.style.setProperty('--rar', rar.color);
    el.innerHTML = `
      <span class="toast-ico">${icon(iconName)}</span>
      <span class="toast-body"><b>${title}</b>${sub ? `<span>${sub}</span>` : ''}</span>
    `;
    el.addEventListener('click', () => {
      if (this.game.state === 'playing') this.openInventory();
    });
    this.el.toasts.prepend(el);
    while (this.el.toasts.children.length > 4) this.el.toasts.lastChild.remove();
    setTimeout(() => {
      el.classList.add('out');
      setTimeout(() => el.remove(), 400);
    }, duration);
  }

  lootToast(item, result) {
    const rar = RARITY[item.rarity];
    const slotName = SLOTS[item.slot].name;
    const stat = item.affixes.length ? affixText(item.affixes[0]) : itemImplicitText(item);
    let action = 'Equipped';
    let cls = 'up';
    if (result.action === 'upgraded') {
      action = `Upgraded · +${Math.round(result.compare)} power`;
    } else if (result.action === 'stashed') {
      action = result.compare > 0 ? `Stashed · ▲ ${Math.round(result.compare)} power` : `Stashed · ▼ ${Math.abs(Math.round(result.compare))} power`;
      cls = result.compare > 0 ? 'up' : 'down';
    } else if (result.action === 'sold') {
      action = `Satchel full · sold for ${result.sold}g`;
      cls = 'neutral';
    }
    const el = document.createElement('div');
    el.className = 'toast loot';
    el.style.setProperty('--rar', rar.color);
    el.innerHTML = `
      <span class="toast-ico">${icon(SLOTS[item.slot].icon)}</span>
      <span class="toast-body">
        <b style="color:${rar.color}">${item.name}</b>
        <span class="tmeta">${rar.name} ${slotName} · iLvl ${item.ilvl} · ${item.power} power</span>
        <span class="tstat">${stat}</span>
        <span class="taction ${cls}">${action}</span>
      </span>
    `;
    el.addEventListener('click', () => {
      if (this.game.state === 'playing') this.openInventory();
    });
    this.el.toasts.prepend(el);
    while (this.el.toasts.children.length > 4) this.el.toasts.lastChild.remove();
    setTimeout(() => {
      el.classList.add('out');
      setTimeout(() => el.remove(), 400);
    }, item.rarity === 'legendary' ? 6000 : 4200);
  }

  /* ── level up ─────────────────────────────────────────────── */
  openLevelUp() {
    const g = this.game;
    g.state = 'levelup';
    this.choices = g.getUpgradeChoices();
    this.el.luLevel.textContent = g.player.level;
    const eyebrow = this.el.levelup.querySelector('.eyebrow');
    eyebrow.textContent = g.pendingLevels > 1 ? `THE CRYPT REWARDS YOU · ${g.pendingLevels} BOONS` : 'THE CRYPT REWARDS YOU';
    this.renderChoices();
    this.show(this.el.levelup);
    this.audio.ui();
  }

  renderChoices() {
    const g = this.game;
    this.el.luCards.innerHTML = this.choices.map(({ skill, level }, i) => {
      const maxed = !skill.repeatable && level >= skill.max;
      const pips = skill.repeatable
        ? `<span class="pipnote">Repeatable</span>`
        : Array.from({ length: skill.max }, (_, k) => `<span class="pip ${k < level ? 'on' : k === level ? 'next' : ''}"></span>`).join('');
      return `
        <button class="card ${maxed ? 'maxed' : ''}" data-index="${i}">
          <span class="key">${i + 1}</span>
          <span class="card-ico">${icon(skill.icon)}</span>
          <span class="card-name">${skill.name}</span>
          <span class="card-desc">${skill.desc}</span>
          <span class="pips">${pips}</span>
          ${skill.special === 'item' ? '<span class="cardspecial">RARE+ LOOT</span>' : ''}
        </button>
      `;
    }).join('');
    this.el.rerollCost.textContent = g.rerollCost;
    this.el.btnReroll.disabled = g.gold < g.rerollCost;
    this.el.btnReroll.classList.toggle('disabled', g.gold < g.rerollCost);
  }

  chooseUpgrade(index) {
    if (this.game.state !== 'levelup') return;
    const choice = this.choices[index];
    if (!choice) return;
    this.game.applyUpgrade(choice.skill);
    if (this.game.pendingLevels > 0) {
      this.openLevelUp();
    } else {
      this.hide(this.el.levelup);
      this.game.state = 'playing';
      this.audio.ui();
    }
  }

  reroll() {
    if (this.game.state !== 'levelup') return;
    if (!this.game.rerollChoices()) {
      this.toast('Not enough gold', `Reroll costs ${this.game.rerollCost}g.`, 'common', 'coin');
      return;
    }
    this.choices = this.game.getUpgradeChoices();
    this.renderChoices();
  }

  /* ── inventory ────────────────────────────────────────────── */
  openInventory(fromState = null) {
    const g = this.game;
    if (g.state === 'levelup' || g.state === 'menu') return;
    this.returnState = fromState || (g.state === 'inventory' ? this.returnState : g.state);
    if (this.returnState === 'dead' || this.returnState === 'victory') this.hide(this.el.gameover);
    this.hide(this.el.pause);
    g.state = 'inventory';
    this.renderInventory();
    this.show(this.el.inventory);
    this.audio.ui();
  }

  closeInventory() {
    const g = this.game;
    this.hide(this.el.inventory);
    if (this.returnState === 'dead' || this.returnState === 'victory') {
      g.state = this.returnState;
      this.show(this.el.gameover);
    } else if (this.returnState === 'paused') {
      g.state = 'paused';
      this.show(this.el.pause);
    } else {
      g.state = 'playing';
    }
    this.audio.ui();
  }

  refreshInventory() {
    if (this.game.state === 'inventory') this.renderInventory();
  }

  renderInventory() {
    const g = this.game;
    this.el.invGoldNum.textContent = formatNum(g.gold);
    this.el.bagCount.textContent = `${g.inventory.length} / 30`;
    this.el.autoEquip.checked = g.autoEquip;

    this.renderEquipSlots();
    this.renderStats();
    this.renderBag();
    this.renderDetail();
  }

  renderEquipSlots() {
    const g = this.game;
    this.el.equipSlots.innerHTML = SLOT_ORDER.map((slot) => {
      const item = g.equipment[slot];
      const rar = item ? RARITY[item.rarity] : null;
      const active = this.selected?.from === 'equip' && this.selected?.item === item ? 'sel' : '';
      return `
        <button class="eqslot ${item ? '' : 'empty'} ${active}" data-slot="${slot}" style="--rar:${rar ? rar.color : '#3a3341'}">
          <span class="eqlabel">${SLOTS[slot].name}</span>
          <span class="eqico">${icon(item ? SLOTS[slot].icon : SLOTS[slot].icon)}</span>
          <span class="eqmeta">
            <span class="eqname">${item ? item.name : 'Empty'}</span>
            <span class="eqilvl">${item ? `iLvl ${item.ilvl} · ${item.power} pwr` : '—'}</span>
          </span>
        </button>
      `;
    }).join('');
  }

  renderStats() {
    const g = this.game;
    const s = g.stats;
    const cd = Math.max(0.1, g.weaponCooldown());
    const dps = (s.weaponDamage || 4) * s.damageMult * (1 + (s.crit / 100) * (s.critMult - 1)) / cd;
    const rows = [
      ['Est. DPS', formatNum(dps)],
      ['Damage / hit', formatNum((s.weaponDamage || 4) * s.damageMult)],
      ['Attack rate', `${(1 / cd).toFixed(2)}/s`],
      ['Crit', `${Math.round(s.crit)}% · ${Math.round(s.critMult * 100)}%`],
      ['Max life', Math.round(s.maxHp)],
      ['Armor', `${Math.round(s.armor)} · ${Math.round((s.armor / (s.armor + 100)) * 100)}%`],
      ['Regen', `+${round1(s.regen)}/s`],
      ['Move speed', Math.round(s.speed)],
      ['Cooldown', `-${Math.round(s.cdr)}%`],
      ['Area', `+${Math.round(s.area)}%`],
      ['Magnet', Math.round(s.magnet)],
      ['Luck', `+${Math.round(s.luck)}%`],
      ['Gold find', `+${Math.round(s.gold)}%`],
      ['XP gain', `+${Math.round(s.xp)}%`],
    ];
    this.el.statList.innerHTML = rows.map(([k, v]) => `<div class="statrow"><span>${k}</span><b>${v}</b></div>`).join('');
  }

  renderBag() {
    const g = this.game;
    const cells = g.inventory.map((item) => {
      const rar = RARITY[item.rarity];
      const sel = this.selected?.from === 'bag' && this.selected?.item === item ? 'sel' : '';
      return `
        <button class="bagcell ${sel}" data-item="${item.id}" style="--rar:${rar.color}" title="${item.name}">
          <span class="bico">${icon(SLOTS[item.slot].icon)}</span>
          <span class="bilvl">${item.ilvl}</span>
          <span class="bpower">${item.power}</span>
        </button>
      `;
    }).join('');
    const empties = Math.max(0, 30 - g.inventory.length);
    this.el.bagGrid.innerHTML = cells + '<div class="bagcell empty"></div>'.repeat(empties);
  }

  select(item, from, slot = null) {
    this.selected = { item, from, slot: slot || item.slot };
    this.renderEquipSlots();
    this.renderBag();
    this.renderDetail();
    this.audio.ui();
  }

  renderDetail() {
    const g = this.game;
    const sel = this.selected;
    if (!sel) {
      this.el.itemDetail.innerHTML = '<span class="muted">Select an item to inspect it. Equipped items compare against your satchel.</span>';
      return;
    }
    const item = sel.item;
    const rar = RARITY[item.rarity];
    const equipped = sel.from === 'bag' ? g.equipment[item.slot] : null;
    const compare = equipped ? compareLines(item, equipped) : null;
    const powerDiff = equipped ? item.power - equipped.power : null;

    const affixes = item.affixes.length
      ? item.affixes.map((a) => `<div class="dline">${affixText(a)}</div>`).join('')
      : '<div class="dline muted">No affixes</div>';

    const power = equipped
      ? `<div class="dpower">Power <b>${item.power}</b> <span class="${powerDiff > 0 ? 'up' : powerDiff < 0 ? 'down' : 'neutral'}">${powerDiff > 0 ? '▲ +' : powerDiff < 0 ? '▼ ' : '— '}${powerDiff !== 0 ? Math.abs(Math.round(powerDiff)) : ''}</span></div>`
      : `<div class="dpower">Power <b>${item.power}</b>${sel.from === 'equip' ? '<span class="equipped-tag">EQUIPPED</span>' : ''}</div>`;

    const diffHtml = compare && compare.length
      ? `<div class="dcompare">${compare.map((l) => {
        const delta = l.delta;
        const sign = delta > 0 ? 'up' : delta < 0 ? 'down' : 'neutral';
        const arrow = delta > 0 ? '▲' : delta < 0 ? '▼' : '—';
        const val = l.fmt === 'pct' ? `${Math.round(l.value)}%` : l.fmt === 'dec' ? round1(l.value) : Math.round(l.value);
        return `<div class="statline"><span>${val} ${l.label}</span><span class="${sign}">${arrow} ${Math.abs(Math.round(delta * 10) / 10)}</span></div>`;
      }).join('')}</div>`
      : '';

    const legendary = item.legendaryPower
      ? `<div class="dlegend">
          <div class="dlegend-title">${icon(item.legendaryPower.icon)} ${item.legendaryPower.title}</div>
          <p>${item.legendaryPower.text}</p>
        </div>`
      : '';

    let actions = '';
    if (sel.from === 'bag') {
      actions = `<button class="btn tiny primary" data-act="equip">Equip</button>
                 <button class="btn tiny danger" data-act="sell">Sell · ${item.sellValue}g</button>`;
    } else {
      actions = `<button class="btn tiny" data-act="unequip">Unequip</button>`;
    }

    this.el.itemDetail.innerHTML = `
      <div class="dhead">
        <div class="dname" style="color:${rar.color}">${item.name}</div>
        <div class="dsub">${rar.name} ${SLOTS[item.slot].name} · Item Level ${item.ilvl}</div>
      </div>
      <div class="dimpl">${itemImplicitText(item)}</div>
      <div class="daffixes">${affixes}</div>
      ${legendary}
      ${power}
      ${diffHtml}
      <div class="dactions">${actions}</div>
    `;
  }

  /* ── pause / end ──────────────────────────────────────────── */
  pauseGame() {
    if (this.game.state !== 'playing') return;
    this.game.state = 'paused';
    this.show(this.el.pause);
    this.audio.ui();
  }

  resumeGame() {
    if (this.game.state !== 'paused') return;
    this.hide(this.el.pause);
    this.game.state = 'playing';
    this.audio.resume();
    this.audio.ui();
  }

  showEnd(result, reason) {
    const g = this.game;
    this.hide(this.el.levelup);
    this.hide(this.el.inventory);
    this.hide(this.el.pause);
    this.hideBoss();
    this.el.announce.className = '';

    let eyebrow = 'THE CRYPT CLAIMS YOU';
    let title = 'You Died';
    let flavor = 'The dark keeps what it takes.';
    if (result === 'victory') {
      if (reason === 'boss') {
        eyebrow = 'THE PALE KING FALLS';
        title = 'Crypt Cleared';
        flavor = 'The crown rolls into the dust. For one dawn, the dead are still.';
      } else {
        eyebrow = 'THE NIGHT ENDS';
        title = 'Dawn Breaks';
        flavor = 'You survived until the light. The crypt will remember your name.';
      }
    }
    this.el.endEyebrow.textContent = eyebrow;
    this.el.endTitle.textContent = title;
    this.el.endTitle.className = `endtitle ${result === 'dead' ? 'dead' : 'won'}`;
    this.el.endFlavor.textContent = flavor;

    const stats = [
      ['TIME', formatTime(g.time)],
      ['LEVEL', g.player.level],
      ['SLAIN', formatNum(g.kills)],
      ['GOLD', formatNum(g.gold)],
      ['ITEMS', g.itemsFound],
      ['BEST FIND', g.bestItem ? `${g.bestItem.power} pwr` : '—'],
    ];
    this.el.endStats.innerHTML = stats.map(([k, v]) => `<div class="endstat"><span>${k}</span><b>${v}</b></div>`).join('');

    if (g.bestItem) {
      const rar = RARITY[g.bestItem.rarity];
      this.el.endBest.innerHTML = `<span class="muted">BEST FIND</span> <b style="color:${rar.color}">${g.bestItem.name}</b> <span class="muted">${rar.name} ${SLOTS[g.bestItem.slot].name}</span>`;
    } else {
      this.el.endBest.innerHTML = '<span class="muted">No relics recovered.</span>';
    }

    this.show(this.el.gameover);
    this.refreshBest();
  }
}
