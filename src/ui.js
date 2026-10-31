// DOM UI: HUD, boon cards, Diablo-style inventory, loot feed, banners and end screens.
import { SLOTS, SLOT_META, STAT_DEFS, rarityInfo, itemScore, formatAffix } from './loot.js';

const ABILITY_META = {
  scythe: { icon: '☾', name: 'Grave Scythe', tag: 'Weapon' },
  bolt: { icon: '✦', name: 'Soul Bolt', tag: 'Weapon' },
  blades: { icon: '✧', name: 'Bone Halo', tag: 'Weapon' },
  aura: { icon: '◉', name: 'Blood Miasma', tag: 'Weapon' },
  storm: { icon: '⚡', name: 'Grave Storm', tag: 'Weapon' },
  vitality: { icon: '♥', name: 'Vitality', tag: 'Rite' },
  swift: { icon: '➤', name: 'Wraithstep', tag: 'Rite' },
  precision: { icon: '✜', name: 'Precision', tag: 'Rite' },
  magnetism: { icon: '◈', name: 'Grave Magnet', tag: 'Rite' },
  bulwark: { icon: '⛨', name: 'Bone Bulwark', tag: 'Rite' },
  blood: { icon: '♰', name: 'Blood Offering', tag: 'Rite' },
};
const ABILITY_ORDER = ['scythe', 'bolt', 'blades', 'aura', 'storm', 'vitality', 'swift', 'precision', 'magnetism', 'bulwark', 'blood'];
const SLOT_ICON = { weapon: 'i-scythe', helm: 'i-helm', armor: 'i-armor', boots: 'i-boots', amulet: 'i-amulet', ring: 'i-ring' };

function $(id) { return document.getElementById(id); }
function fmtTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}
function esc(text) {
  return String(text).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

export class UI {
  constructor(game) {
    this.game = game;
    game.ui = this;
    this.selectedId = null;
    this.lastHud = 0;
    this.abilityKey = '';
    this.chipKey = '';
    this.bannerTimer = null;
    this.feedTimers = new Set();
    this.el = {
      hud: $('hud'), title: $('title'), levelup: $('levelup'), inventory: $('inventory'),
      pause: $('pause'), end: $('end'), cards: $('levelup-cards'), bag: $('bag-grid'),
      detail: $('item-detail'), stats: $('char-stats'), bagCount: $('bag-count'),
      souls: $('souls'), hpFill: $('hp-fill'), hpText: $('hp-text'), xpFill: $('xp-fill'),
      xpText: $('xp-text'), level: $('level-num'), timer: $('timer'), objective: $('objective'),
      abilities: $('abilities'), chips: $('stat-chips'), feed: $('loot-feed'),
      bossWrap: $('boss-wrap'), bossFill: $('boss-fill'), bossName: $('boss-name'),
      badge: $('bag-badge'), lowhp: $('lowhp'), flash: $('flash'), banner: $('banner'),
      bossWarning: $('boss-warning'), joystick: $('joystick'), knob: $('stick-knob'),
      hint: $('hint-bar'),
      endTitle: $('end-title'), endEyebrow: $('end-eyebrow'), endSub: $('end-sub'),
      endStats: $('end-stats'), endLoot: $('end-loot'), pauseStats: $('pause-stats'),
      muteBtn: $('btn-mute'),
    };
    this.bind();
    this.setMuted(game.audio.muted);
    this.updateHud(true);
  }

  bind() {
    $('btn-start').addEventListener('click', () => this.game.startRun());
    $('btn-restart').addEventListener('click', () => this.game.startRun());
    $('btn-resume').addEventListener('click', () => this.game.resume());
    $('btn-pause-inv').addEventListener('click', () => this.game.openInventory());
    $('btn-pause-restart').addEventListener('click', () => this.game.startRun());
    $('btn-inv-close').addEventListener('click', () => this.game.closeInventory());
    $('btn-pause').addEventListener('click', () => this.game.pause());
    $('btn-inventory').addEventListener('click', () => this.game.openInventory());
    this.el.muteBtn.addEventListener('click', () => this.game.toggleMute());

    this.el.cards.addEventListener('click', (event) => {
      const card = event.target.closest('[data-offer]');
      if (!card) return;
      this.game.chooseOffer(Number(card.dataset.offer));
    });

    this.el.bag.addEventListener('click', (event) => {
      const cell = event.target.closest('[data-item-id]');
      if (!cell) return;
      this.selectedId = cell.dataset.itemId;
      this.renderInventory(this.game);
      this.game.audio.click();
      if (window.innerWidth <= 720) {
        requestAnimationFrame(() => this.el.detail.scrollIntoView({ block: 'nearest', behavior: 'smooth' }));
      }
    });

    document.querySelectorAll('[data-ui="equip-slot"]').forEach((slot) => {
      slot.addEventListener('click', () => {
        const item = this.game.equipment[slot.dataset.slot];
        if (!item) return;
        this.selectedId = item.id;
        this.renderInventory(this.game);
        this.game.audio.click();
      });
    });

    this.el.detail.addEventListener('click', (event) => {
      const button = event.target.closest('[data-action]');
      if (!button) return;
      const item = this.findItem(button.dataset.itemId);
      if (!item) return;
      if (button.dataset.action === 'equip') {
        this.game.equipItem(item);
        this.selectedId = item.id;
        this.renderInventory(this.game);
      } else if (button.dataset.action === 'salvage') {
        this.game.salvageItem(item);
        if (this.game.state === 'inventory') {
          this.selectedId = null;
          this.renderInventory(this.game);
        }
      }
    });
  }

  /* ---------------------------------------------------------- run lifecycle */

  startRun() {
    this.el.title.classList.remove('show');
    this.el.levelup.classList.remove('show');
    this.el.inventory.classList.remove('show');
    this.el.pause.classList.remove('show');
    this.el.end.classList.remove('show');
    this.el.hud.classList.remove('hidden');
    this.el.bossWrap.classList.add('hidden');
    this.el.bossWarning.classList.add('hidden');
    this.el.feed.innerHTML = '';
    this.feedTimers.forEach((timer) => clearTimeout(timer));
    this.feedTimers.clear();
    this.selectedId = null;
    this.abilityKey = '';
    this.chipKey = '';
    this.setLowHp(false);
    this.updateHud(true);
  }

  showPause(game) {
    const summary = game.getSummary();
    this.el.pauseStats.innerHTML = `
      <span>Time <b>${fmtTime(summary.time)}</b></span>
      <span>Kills <b>${summary.kills}</b></span>
      <span>Level <b>${summary.level}</b></span>
      <span>Power <b>${Math.round(this.gearPower(game))}</b></span>`;
    this.el.pause.classList.add('show');
  }

  hidePause() {
    this.el.pause.classList.remove('show');
  }

  /* ---------------------------------------------------------- HUD */

  updateHud(force = false) {
    const game = this.game;
    const now = performance.now();
    if (!force && now - this.lastHud < 45) return;
    this.lastHud = now;
    if (game.state === 'title') return;
    const p = game.player;

    const hpPct = Math.max(0, Math.min(1, p.hp / p.maxHp));
    this.el.hpFill.style.width = `${hpPct * 100}%`;
    this.el.hpText.textContent = `${Math.max(0, Math.ceil(p.hp))} / ${Math.round(p.maxHp)}`;
    const xpPct = p.xpNext > 0 ? Math.min(1, p.xp / p.xpNext) : 0;
    this.el.xpFill.style.width = `${xpPct * 100}%`;
    this.el.level.textContent = p.level;
    this.el.xpText.textContent = `${Math.floor(p.xp)} / ${p.xpNext}`;
    this.el.timer.textContent = fmtTime(game.run.time);

    if (game.boss && !game.boss.dead) {
      this.el.objective.innerHTML = 'Slay <b>The Blood Count</b>';
      this.el.bossWrap.classList.remove('hidden');
      this.el.bossFill.style.width = `${Math.max(0, game.boss.hp / game.boss.maxHp) * 100}%`;
      this.el.bossName.textContent = game.boss.name;
    } else {
      this.el.bossWrap.classList.add('hidden');
      if (game.bossState.dead) {
        this.el.objective.innerHTML = '<b>The graveyard is yours</b>';
      } else if (game.run.time >= 236) {
        this.el.objective.innerHTML = '<b>The Blood Count awakens</b>';
      } else {
        const remaining = Math.max(0, 236 - game.run.time);
        this.el.objective.innerHTML = `The Blood Count rises in <b>${fmtTime(remaining)}</b>`;
      }
    }

    this.setLowHp(game.state === 'playing' && hpPct < 0.3);
    this.el.hint.classList.toggle('faded', game.run.time > 18);

    const count = game.bag.length;
    this.el.badge.textContent = count;
    this.el.badge.classList.toggle('hidden', count === 0);

    const abilityKey = ABILITY_ORDER.map((id) => `${id}:${game.upgrades[id] || 0}`).join('|');
    if (abilityKey !== this.abilityKey) {
      this.abilityKey = abilityKey;
      this.renderAbilities(game);
    }
    const chipKey = [
      Math.round(game.stats.damagePct || 0), Math.round((game.stats.attackSpeed - 1) * 100),
      Math.round((game.stats.critChance || 0) * 100), Math.round(game.stats.armor || 0),
      Math.round((game.stats.moveSpeed / 228 - 1) * 100), Math.round(game.stats.luck || 0),
      Math.round(game.stats.projectiles || 0),
    ].join(',');
    if (chipKey !== this.chipKey) {
      this.chipKey = chipKey;
      this.renderChips(game);
    }
  }

  renderAbilities(game) {
    const html = ABILITY_ORDER
      .filter((id) => (game.upgrades[id] || 0) > 0)
      .map((id) => {
        const def = ABILITY_META[id];
        const rank = game.upgrades[id];
        const max = id === 'blood' ? 99 : 5;
        return `<div class="ability" title="${esc(def.name)} — rank ${rank}"><span>${def.icon}</span><span class="rank ${rank >= max ? 'max' : ''}">${rank}</span></div>`;
      }).join('');
    this.el.abilities.innerHTML = html;
  }

  renderChips(game) {
    const s = game.stats;
    const chips = [
      `DMG <b>+${Math.round(s.damagePct)}%</b>`,
      `SPD <b>+${Math.round((s.attackSpeed - 1) * 100)}%</b>`,
      `CRIT <b>${Math.round(s.critChance * 100)}%</b>`,
      `ARMOR <b>${Math.round(s.armorDR * 100)}%</b>`,
      `MOVE <b>${Math.round((s.moveSpeed / 228 - 1) * 100)}%</b>`,
      `LUCK <b>+${Math.round(s.luck)}</b>`,
    ];
    if (s.projectiles > 0) chips.push(`PROJ <b>+${s.projectiles}</b>`);
    this.el.chips.innerHTML = chips.map((chip) => `<span class="chip">${chip}</span>`).join('');
  }

  setLowHp(on) {
    this.el.lowhp.classList.toggle('on', on);
  }

  setMuted(muted) {
    this.el.muteBtn.innerHTML = `<svg><use href="#${muted ? 'i-mute' : 'i-sound'}"/></svg>`;
    this.el.muteBtn.title = muted ? 'Sound off (M)' : 'Sound on (M)';
  }

  flash() {
    this.el.flash.classList.remove('fire');
    void this.el.flash.offsetWidth;
    this.el.flash.classList.add('fire');
    setTimeout(() => this.el.flash.classList.remove('fire'), 500);
  }

  /* ---------------------------------------------------------- feed & banner */

  pushFeed(item, delta, note = '') {
    if (!item) return;
    const info = rarityInfo(item.rarity);
    const row = document.createElement('div');
    row.className = `feed-item r-${item.rarity}`;
    let power = '';
    if (delta === null || delta === undefined) power = `<span class="feed-power">PWR ${item.score}</span>`;
    else if (delta > 0) power = `<span class="feed-power">▲ ${delta}</span>`;
    else if (delta < 0) power = `<span class="feed-power down">▼ ${Math.abs(delta)}</span>`;
    else power = `<span class="feed-power">PWR ${item.score}</span>`;
    row.innerHTML = `
      <div style="min-width:0">
        <div class="feed-name">${esc(item.name)}</div>
        <div class="feed-meta">${note ? esc(note) : `${info.label} ${SLOT_META[item.slot].label}`}</div>
      </div>
      ${power}`;
    this.el.feed.prepend(row);
    while (this.el.feed.children.length > 5) this.el.feed.lastElementChild.remove();
    const timer = setTimeout(() => {
      row.classList.add('fade');
      this.feedTimers.delete(timer);
      setTimeout(() => row.remove(), 420);
    }, 8000);
    this.feedTimers.add(timer);
  }

  banner({ kicker = '', name = '', sub = '', color = '#f2d79a', duration = 2600 }) {
    clearTimeout(this.bannerTimer);
    this.el.banner.classList.remove('out');
    this.el.banner.innerHTML = `
      <div class="b-kicker">${esc(kicker)}</div>
      <div class="b-name" style="color:${color}">${esc(name)}</div>
      ${sub ? `<div class="b-sub">${esc(sub)}</div>` : ''}`;
    this.el.banner.classList.remove('hidden');
    this.el.banner.style.animation = 'none';
    void this.el.banner.offsetWidth;
    this.el.banner.style.animation = '';
    this.bannerTimer = setTimeout(() => {
      this.el.banner.classList.add('out');
      setTimeout(() => {
        this.el.banner.classList.add('hidden');
        this.el.banner.classList.remove('out');
      }, 600);
    }, duration);
  }

  bossWarning(show) {
    this.el.bossWarning.classList.toggle('hidden', !show);
  }

  showBoss(boss) {
    this.el.bossWrap.classList.remove('hidden');
    this.el.bossName.textContent = boss.name;
    this.el.bossFill.style.width = '100%';
  }

  hideBoss() {
    this.el.bossWrap.classList.add('hidden');
  }

  /* ---------------------------------------------------------- level up */

  showLevelUp(offers) {
    this.renderCards(offers);
    this.el.levelup.classList.add('show');
  }

  refreshLevelUp(offers) {
    this.renderCards(offers);
    this.el.levelup.classList.add('show');
  }

  hideLevelUp() {
    this.el.levelup.classList.remove('show');
  }

  renderCards(offers) {
    this.el.cards.innerHTML = offers.map((offer, index) => {
      const max = offer.max > 5 ? 5 : offer.max;
      const pips = Array.from({ length: max }, (_, i) => `<span class="pip ${i < offer.rank ? 'on' : ''}"></span>`).join('');
      return `
        <button class="card ${offer.isNew ? 'new' : ''}" data-offer="${index}" type="button">
          <span class="num">${index + 1}</span>
          <div class="card-icon">${offer.icon}</div>
          <div class="card-tag">${esc(offer.tag)}${offer.isNew ? ' · NEW' : ''}</div>
          <h3>${esc(offer.name)}</h3>
          <p>${esc(offer.desc)}</p>
          <div class="pips">${pips}<span class="pip-label">${offer.max > 5 ? `RANK ${offer.rank}` : `${offer.rank} / ${offer.max}`}</span></div>
        </button>`;
    }).join('');
  }

  /* ---------------------------------------------------------- inventory */

  openInventory(game) {
    this.selectedId = null;
    this.el.inventory.classList.add('show');
    this.renderInventory(game);
  }

  hideInventory() {
    this.el.inventory.classList.remove('show');
  }

  refreshInventory(game) {
    if (!this.el.inventory.classList.contains('show')) return;
    this.renderInventory(game);
  }

  findItem(id) {
    const game = this.game;
    if (!id) return null;
    for (const slot of SLOTS) if (game.equipment[slot]?.id === id) return game.equipment[slot];
    return game.bag.find((item) => item.id === id) || null;
  }

  gearPower(game) {
    let total = 0;
    for (const slot of SLOTS) if (game.equipment[slot]) total += game.equipment[slot].score;
    return total;
  }

  renderInventory(game) {
    this.el.souls.textContent = game.souls;
    this.el.bagCount.textContent = `${game.bag.length} / 24`;

    document.querySelectorAll('[data-ui="equip-slot"]').forEach((slotEl) => {
      const slot = slotEl.dataset.slot;
      const item = game.equipment[slot];
      const info = item ? rarityInfo(item.rarity) : null;
      slotEl.className = `pd-slot ${item ? 'filled' : ''}`;
      slotEl.style.color = item ? info.color : '';
      slotEl.dataset.itemId = item ? item.id : '';
      slotEl.innerHTML = `
        <svg><use href="#${SLOT_ICON[slot]}"/></svg>
        <span class="slot-label">${SLOT_META[slot].label}</span>
        ${item ? `<span class="slot-score" style="color:${info.color}">${item.score}</span>` : ''}`;
    });

    const cells = [];
    for (let i = 0; i < 24; i++) {
      const item = game.bag[i];
      if (!item) {
        cells.push('<div class="bag-cell empty"></div>');
        continue;
      }
      const info = rarityInfo(item.rarity);
      cells.push(`
        <div class="bag-cell has-item ${item.id === this.selectedId ? 'selected' : ''}" data-item-id="${item.id}"
             style="color:${info.color};border-color:${info.color}66"
             title="${esc(item.name)} · Power ${item.score}">
          <span class="item-glyph">${SLOT_META[item.slot].glyph}</span>
          <span class="bag-dot"></span>
        </div>`);
    }
    this.el.bag.innerHTML = cells.join('');

    const stats = game.stats;
    const rows = [
      ['Damage', `+${Math.round(stats.damagePct)}%`],
      ['Atk Speed', `+${Math.round((stats.attackSpeed - 1) * 100)}%`],
      ['Crit', `${Math.round(stats.critChance * 100)}% · x${stats.critMult.toFixed(2)}`],
      ['Health', `${Math.ceil(game.player.hp)} / ${Math.round(game.player.maxHp)}`],
      ['Armor', `${Math.round(stats.armor)} (${Math.round(stats.armorDR * 100)}%)`],
      ['Move', `${Math.round(stats.moveSpeed)}`],
      ['Pickup', `${Math.round(stats.pickupRadius)}`],
      ['XP Gain', `+${Math.round((stats.xpMult - 1) * 100)}%`],
      ['Regen', `${stats.regen.toFixed(1)}/s`],
      ['Luck', `+${Math.round(stats.luck)}`],
    ];
    this.el.stats.innerHTML = rows.map(([label, value]) => `<div class="char-stat"><span>${label}</span><b>${value}</b></div>`).join('');

    const item = this.findItem(this.selectedId);
    if (!item) {
      this.el.detail.innerHTML = '<div class="detail-empty">Select a relic to inspect its affixes.<br><span style="opacity:0.6">Loot is pulled from beams by walking over them.</span></div>';
      return;
    }
    this.renderDetail(item, game);
  }

  renderDetail(item, game) {
    const info = rarityInfo(item.rarity);
    const equipped = game.equipment[item.slot];
    const isEquipped = equipped?.id === item.id;
    const delta = isEquipped ? 0 : item.score - (equipped ? equipped.score : 0);
    const affixes = item.affixes.map((affix) => `<li>${esc(formatAffix(affix))}</li>`).join('');
    const power = item.legendary ? `
      <div class="power-block">
        <div class="p-tag">${item.rarity === 'mythic' ? 'MYTHIC' : 'LEGENDARY'} POWER</div>
        <div class="p-name">${esc(item.legendary.name)}</div>
        <div class="p-desc">${esc(item.legendary.desc)}</div>
      </div>` : '';
    const compare = equipped && !isEquipped ? `
      <div class="compare">
        <div class="compare-title">Compared to equipped</div>
        <div class="compare-row"><span>${esc(equipped.name)}</span><b style="color:${rarityInfo(equipped.rarity).color}">${equipped.score}</b></div>
        <div class="compare-row"><span>Power change</span><b class="${delta >= 0 ? 'power-delta up' : 'power-delta down'}">${delta >= 0 ? '+' : ''}${delta}</b></div>
      </div>` : '';
    const actions = isEquipped
      ? '<div class="detail-actions"><div class="action-btn wide" style="opacity:0.6;cursor:default">EQUIPPED</div></div>'
      : `<div class="detail-actions">
           <button class="action-btn" data-action="equip" data-item-id="${item.id}">EQUIP</button>
           <button class="action-btn danger" data-action="salvage" data-item-id="${item.id}">DEVOUR<br><span style="font-size:8px;letter-spacing:0.06em">+${4 + item.ilvl * 3 + Math.round(item.score / 12)} XP</span></button>
         </div>`;

    this.el.detail.innerHTML = `
      <div class="item-name" style="color:${info.color}">${esc(item.name)}</div>
      <div class="item-sub">
        <span class="rarity-tag" style="color:${info.color}">${info.label}</span>
        <span>${SLOT_META[item.slot].label}</span>
        <span>· Item level ${item.ilvl}</span>
      </div>
      <div class="item-power">
        <span class="p-label">Power</span>
        <span class="p-val">${item.score}</span>
        ${isEquipped ? '<span class="power-delta up">equipped</span>' : `<span class="power-delta ${delta >= 0 ? 'up' : 'down'}">${delta >= 0 ? '+' : ''}${delta} vs equipped</span>`}
      </div>
      <ul class="affix-list">${affixes}</ul>
      ${power}
      ${compare}
      ${actions}`;
  }

  /* ---------------------------------------------------------- end screen */

  showEnd(kind, game) {
    const summary = game.getSummary();
    const victory = kind === 'victory';
    this.el.endEyebrow.textContent = victory ? 'THE BLOOD COUNT IS ASH' : 'THE GRAVE CLAIMS YOU';
    this.el.endTitle.textContent = victory ? 'Victory' : 'You Died';
    this.el.endSub.textContent = victory
      ? 'The graveyard is yours. For now.'
      : 'The horde takes another name. The loot remains.';
    const stats = [
      ['Time', fmtTime(summary.time)],
      ['Level', summary.level],
      ['Kills', summary.kills],
      ['Relics', summary.itemsFound],
      ['Legendary', summary.legendary],
      ['Power', Math.round(this.gearPower(game))],
    ];
    this.el.endStats.innerHTML = stats.map(([label, value]) => `<div class="end-stat"><b>${value}</b><span>${label}</span></div>`).join('');
    const loot = [...SLOTS.map((slot) => game.equipment[slot]).filter(Boolean), ...game.bag]
      .sort((a, b) => b.score - a.score)
      .slice(0, 18);
    this.el.endLoot.innerHTML = loot.length
      ? loot.map((item) => {
        const info = rarityInfo(item.rarity);
        return `<span class="el" style="color:${info.color}">${esc(item.name)}</span>`;
      }).join('')
      : '<span style="font-size:10px;color:rgba(233,225,207,0.35)">No relics claimed. A pauper\'s grave.</span>';
    this.el.hud.classList.add('hidden');
    this.el.pause.classList.remove('show');
    this.el.inventory.classList.remove('show');
    this.el.end.classList.add('show');
    this.el.bossWrap.classList.add('hidden');
    this.el.bossWarning.classList.add('hidden');
    this.setLowHp(false);
  }

  /* ---------------------------------------------------------- joystick */

  showJoystick(x, y) {
    this.el.joystick.classList.remove('hidden');
    this.el.joystick.style.left = `${x}px`;
    this.el.joystick.style.top = `${y}px`;
    this.el.knob.style.transform = 'translate(0, 0)';
  }

  moveJoystick(dx, dy) {
    this.el.knob.style.transform = `translate(${dx}px, ${dy}px)`;
  }

  hideJoystick() {
    this.el.joystick.classList.add('hidden');
  }
}
