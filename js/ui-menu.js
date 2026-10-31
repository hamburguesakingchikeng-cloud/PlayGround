// Menús, personaje, inventario, ecos, diario, mapa, ajustes y tienda.
import { CLASSES, APPEARANCE, STATS, ITEMS, SKILLS, CREATURES, LORE, REGIONS, SHOP_STOCK, DIFFICULTY } from './data.js';
import { clamp, escapeHTML, formatPlaytime } from './util.js';
import { drawPortrait, drawCreaturePortrait } from './figures.js';
import { drawFullMap } from './worldview.js';
import { buildWorld } from './world.js';
import { audio } from './audio.js';
import { ENDINGS, QUESTS } from './story.js';

const $ = id => document.getElementById(id);
const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
const rarityClass = r => ({ 'común': 'rarity-common', 'raro': 'rarity-rare', 'épico': 'rarity-epic', 'legendario': 'rarity-legendary' }[r] || 'rarity-common');
const SLOT_NAME = { weapon: 'ARMA', armor: 'ARMADURA', helm: 'YELMO', cape: 'CAPA', relic: 'RELIQUIA' };
const BRANCHES = { alba: ['ALBA', 'Luz, juicio y acero'], vinculo: ['VÍNCULO', 'Ecos y sanación'], velo: ['VELO', 'Sombras y velocidad'] };
const SHOP_PRICE = { legendario: 1200, 'épico': 780, raro: 320, común: 90 };

export const MenuSystem = {
  openMenu(tab = 'character') {
    const g = this.game;
    if (!g.inGame || this.dialogState || this.cineState) return;
    this.menuTab = tab;
    this.mapRegion = g.regionId;
    g.setMode('menu');
    g.input?.clear?.();
    $('menu')?.classList.remove('hidden');
    $('hud')?.classList.add('hidden');
    document.querySelectorAll('#menu-tabs button').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
    $('menu-playtime').textContent = formatPlaytime(g.playtime);
    this.renderMenu();
  },

  closeMenu(silent = false) {
    const g = this.game;
    const wasOpen = !$('menu')?.classList.contains('hidden');
    $('menu')?.classList.add('hidden');
    if (wasOpen && !silent && g.inGame && g.mode === 'menu') {
      g.setMode('playing');
      $('hud')?.classList.remove('hidden');
      this.updateHUD(0);
    }
  },

  renderMenu() {
    const g = this.game;
    const box = $('menu-content');
    if (!box) return;
    $('menu-playtime').textContent = formatPlaytime(g.playtime);
    if (this.menuTab === 'character') this.renderCharacter(box);
    else if (this.menuTab === 'inventory') this.renderInventory(box);
    else if (this.menuTab === 'ecos') this.renderEcos(box);
    else if (this.menuTab === 'journal') this.renderJournal(box);
    else if (this.menuTab === 'map') this.renderMap(box);
    else this.renderSettings(box);
  },

  // ───────────────────────── personaje ─────────────────────────
  renderCharacter(box) {
    const g = this.game, p = g.player, s = p.stats;
    box.innerHTML = `
      <div class="menu-title"><h2>${escapeHTML(g.name)}</h2><p>${escapeHTML(CLASSES[g.classId]?.epithet || '')}</p><span class="right eyebrow">NIVEL ${g.level}</span></div>
      <div class="char-grid">
        <div>
          <div class="char-card">
            <div class="char-hero"><canvas id="menu-portrait" width="160" height="160"></canvas><div><b>${escapeHTML(g.name)}</b><small>${escapeHTML(CLASSES[g.classId]?.name || '')} · ${escapeHTML(DIFFICULTY[g.difficulty]?.name || '')}</small></div></div>
            <div class="stat-grid" id="menu-stats"></div>
            <div class="derived">
              <div><span>ATAQUE</span><b>${Math.round(p.atk)}</b></div>
              <div><span>DEFENSA</span><b>${p.defense}</b></div>
              <div><span>CRÍTICO</span><b>${Math.round(p.crit * 100)}%</b></div>
              <div><span>VELOCIDAD</span><b>${Math.round(p.speed)}</b></div>
              <div><span>PODER ECO</span><b>${Math.round(p.power * 100)}%</b></div>
              <div><span>PUNTOS</span><b>${g.statPoints}</b></div>
            </div>
          </div>
          <div class="char-card" style="margin-top:10px">
            <div class="menu-title" style="margin-bottom:8px"><h2 style="font-size:17px">EQUIPO</h2><p>La apariencia cambia contigo</p></div>
            <div class="equip-panel" id="menu-equip"></div>
          </div>
        </div>
        <div>
          <div class="skill-branch" style="margin-bottom:10px">
            <h4>Ranuras de habilidad</h4><small>Asigna talentos activos a los botones 1–4</small>
            <div class="tabs-mini" id="skill-slots" style="margin-top:8px"></div>
          </div>
          <div class="skills-wrap" id="menu-skills"></div>
        </div>
      </div>`;
    drawPortrait($('menu-portrait'), 'hero', g.appearance, g.classId);
    const stats = $('menu-stats');
    for (const [key, def] of Object.entries(STATS)) {
      const row = el('div', '', `<span>${def.name}</span><b>${s[key]}</b>`);
      if (g.statPoints > 0) {
        const b = el('button', '', '+');
        b.title = 'Añadir punto';
        b.style.cssText = 'margin-left:6px;color:#e8c37a;border:1px solid rgba(232,195,122,.3);width:18px;height:18px;font-size:11px';
        b.addEventListener('click', () => { if (g.allocateStat(key)) { audio.sfx?.('click'); this.renderMenu(); } });
        row.appendChild(b);
      }
      stats.appendChild(row);
    }
    const eq = $('menu-equip');
    for (const slot of Object.keys(SLOT_NAME)) {
      const id = g.equipment[slot];
      const item = ITEMS[id];
      const row = el('div', 'equip-row');
      row.innerHTML = `<span class="slot">${SLOT_NAME[slot]}</span><span class="item-name">${item ? escapeHTML(item.name) + `<small>+${Object.entries(item.stats || {}).map(([k, v]) => v + ' ' + STATS[k].short).join(' ')}</small>` : '<span class="empty">vacío</span>'}</span>`;
      if (item) {
        const b = el('button', '', 'QUITAR');
        b.addEventListener('click', () => { g.unequip(slot); audio.sfx?.('click'); this.renderMenu(); });
        row.appendChild(b);
      }
      eq.appendChild(row);
    }
    // ranuras
    const slots = $('skill-slots');
    g.activeSkillSlots.forEach((id, i) => {
      const active = g.unlockedSkills.filter(sid => SKILLS[sid]?.type === 'active');
      const select = el('select');
      select.style.cssText = 'background:#0d1422;border:1px solid rgba(232,195,122,.25);color:#f2e6cd;font-size:9px;padding:4px';
      select.innerHTML = `<option value="">— ${i + 1} —</option>` + active.map(sid => `<option value="${sid}" ${sid === id ? 'selected' : ''}>${SKILLS[sid].name}</option>`).join('');
      select.addEventListener('change', () => { g.setSkillSlot(i, select.value || null); this.refreshSkillWheel(); this.renderMenu(); });
      const wrap = el('div', '', ''); wrap.appendChild(select); slots.appendChild(wrap);
    });
    // árbol
    const tree = $('menu-skills');
    for (const [branch, [name, desc]] of Object.entries(BRANCHES)) {
      const wrap = el('div', 'skill-branch');
      wrap.innerHTML = `<h4>${name}</h4><small>${desc}</small>`;
      for (const sk of Object.values(SKILLS).filter(x => x.branch === branch)) {
        const unlocked = g.unlockedSkills.includes(sk.id);
        const avail = g.skillAvailable(sk.id);
        const node = el('div', 'skill-node ' + (unlocked ? 'unlocked' : avail ? 'available' : ''));
        node.innerHTML = `<b>${sk.icon} ${escapeHTML(sk.name)}<i>${sk.type === 'active' ? sk.mana + ' PM' : 'PASIVO'} · ${sk.cost}</i></b><small>${escapeHTML(sk.desc)}</small>`;
        if (!unlocked) {
          const b = el('button', '', avail ? 'APRENDER' : (sk.requires ? 'REQUIERE ' + SKILLS[sk.requires].name.toUpperCase() : 'BLOQUEADO'));
          b.disabled = !avail || g.skillPoints < sk.cost;
          b.addEventListener('click', () => { if (g.unlockSkill(sk.id)) { this.refreshSkillWheel(); this.renderMenu(); } });
          node.appendChild(b);
        }
        wrap.appendChild(node);
      }
      tree.appendChild(wrap);
    }
  },

  // ───────────────────────── inventario ─────────────────────────
  renderInventory(box) {
    const g = this.game;
    box.innerHTML = `<div class="menu-title"><h2>Inventario</h2><p>Todo lo que cargas, y todo lo que te carga</p><span class="right eyebrow">${g.gold} ORO · ${g.shards} ESQUIRLAS</span></div>
      <div class="tabs-mini"><button class="active">TODO</button></div><div class="inv-grid" id="inv-grid"></div>`;
    const grid = $('inv-grid');
    const entries = Object.entries(g.inventory).filter(([id]) => ITEMS[id]);
    const order = { weapon: 0, armor: 1, helm: 2, cape: 3, relic: 4, consume: 5, material: 6, key: 7 };
    entries.sort((a, b) => (order[ITEMS[a[0]].slot] ?? 8) - (order[ITEMS[b[0]].slot] ?? 8) || ITEMS[a[0]].name.localeCompare(ITEMS[b[0]].name));
    if (!entries.length) grid.innerHTML = '<p style="color:#a9a58f;font-size:12px">No llevas nada. El camino proveerá.</p>';
    for (const [id, qty] of entries) {
      const item = ITEMS[id];
      const equipped = Object.values(g.equipment).includes(id);
      const card = el('div', 'inv-item');
      card.innerHTML = `<div class="item-glyph ${rarityClass(item.rarity)}">${item.glyph || '·'}</div><div class="meta"><b class="${rarityClass(item.rarity)}">${escapeHTML(item.name)}</b><small>${escapeHTML(item.desc || '')}</small>${equipped ? '<span class="equip-tag">EQUIPADO</span>' : ''}</div><div style="text-align:right"><span class="qty">×${qty}</span><div class="actions"></div></div>`;
      const actions = card.querySelector('.actions');
      if (['weapon', 'armor', 'helm', 'cape', 'relic'].includes(item.slot) && !equipped) {
        const b = el('button', 'use', 'EQUIPAR');
        b.addEventListener('click', () => { if (g.equipItem(id)) { this.refreshSkillWheel(); this.renderMenu(); } });
        actions.appendChild(b);
      } else if (item.slot === 'consume') {
        const b = el('button', 'use', 'USAR');
        b.addEventListener('click', () => { if (g.useItem(id)) { audio.sfx?.('potion'); this.renderMenu(); } });
        actions.appendChild(b);
      } else if (item.slot === 'material' || item.slot === 'consume') {
        const b = el('button', 'use', 'VENDER');
        b.addEventListener('click', () => { this.sellItem(id); this.renderMenu(); });
        actions.appendChild(b);
      }
      card.dataset.item = id;
      grid.appendChild(card);
    }
  },

  sellItem(id) {
    const g = this.game, item = ITEMS[id];
    if (!item || !g.inventory[id]) return;
    if (['weapon', 'armor', 'helm', 'cape', 'relic', 'key'].includes(item.slot)) { this.toast('No puedes vender equipo desde aquí'); return; }
    const value = Math.max(1, Math.round((item.price || 10) * .5));
    g.removeInventory(id, 1); g.addGold(value);
    audio.sfx?.('coin'); this.toast(`+${value} oro`); g.autoSave();
  },

  // ───────────────────────── ecos ─────────────────────────
  renderEcos(box) {
    const g = this.game;
    box.innerHTML = `<div class="menu-title"><h2>Ecos</h2><p>Memorias que decidieron acompañarte</p><span class="right eyebrow">${g.captured.length} / ${Object.keys(CREATURES).length} VINCULADOS</span></div><div class="eco-grid" id="eco-grid"></div>`;
    const grid = $('eco-grid');
    for (const c of Object.values(CREATURES)) {
      const owned = g.captured.includes(c.id);
      const active = g.activeCreature === c.id;
      const card = el('div', 'eco-card ' + (owned ? 'owned' : 'locked') + (active ? ' active' : ''));
      card.innerHTML = `<canvas width="260" height="118"></canvas>${active ? '<span class="bind">ACTIVO</span>' : ''}<div class="eco-meta"><b>${owned ? escapeHTML(c.name) : '???'}<em>${escapeHTML(c.rarity)}</em></b><small>${owned ? escapeHTML(c.title) : `Un eco de ${escapeHTML(REGIONS[c.region]?.name || c.region)}. Debilítalo y resuena con él.`}</small><span class="family-tag">${escapeHTML(c.family)} · ${escapeHTML(c.element)}</span><div class="eco-actions"></div></div>`;
      grid.appendChild(card);
      const cv = card.querySelector('canvas');
      if (owned) drawCreaturePortrait(cv, c.id, g.time);
      else {
        const ctx = cv.getContext('2d');
        ctx.fillStyle = 'rgba(255,255,255,.03)'; ctx.fillRect(0, 0, cv.width, cv.height);
      }
      if (owned) {
        const act = el('button', '', active ? 'ACTIVO' : 'ACTIVAR');
        act.addEventListener('click', () => { g.activeCreature = c.id; audio.sfx?.('click'); g.autoSave(); this.renderMenu(); });
        const sum = el('button', '', 'INVOCAR');
        sum.addEventListener('click', () => { g.summonCreature(c.id); this.closeMenu(); });
        card.querySelector('.eco-actions').append(act, sum);
      }
    }
  },

  // ───────────────────────── diario ─────────────────────────
  renderJournal(box) {
    const g = this.game;
    const quests = Object.values(QUESTS).filter(q => g.quests[q.id]?.started || q.type === 'main');
    let html = `<div class="menu-title"><h2>Diario</h2><p>Lo que el Velo aún no ha borrado</p></div><div class="journal-list">`;
    for (const q of quests) {
      const qs = g.quests[q.id];
      const done = qs?.done, active = qs?.started && !done;
      const stage = active ? q.stages[qs.stage] : null;
      const prog = stage?.count ? ` (${qs.progress || 0}/${stage.count})` : '';
      html += `<div class="quest-entry ${q.type} ${done ? 'done' : ''}"><h4>${escapeHTML(q.title)}<small>${done ? 'COMPLETADA' : active ? 'EN CURSO' : 'NO INICIADA'} · ${q.type.toUpperCase()}</small></h4><p>${escapeHTML(q.summary)}</p>${stage ? `<div class="quest-objective">${escapeHTML(stage.text)}${prog}</div>` : ''}</div>`;
    }
    html += '</div><div class="section-label" style="margin-top:22px"><span>CÓDICE DEL VELO</span><i></i><small>' + g.lore.size + ' / ' + Object.keys(LORE).length + '</small></div><div class="lore-grid">';
    for (const [id, l] of Object.entries(LORE)) {
      const open = g.lore.has(id);
      html += `<div class="lore-card ${open ? '' : 'locked'}"><b>${open ? escapeHTML(l.title) : '???'}</b><p>${open ? escapeHTML(l.text) : 'Aún no has encontrado esta memoria.'}</p></div>`;
    }
    html += '</div>';
    box.innerHTML = html;
  },

  // ───────────────────────── mapa ─────────────────────────
  renderMap(box) {
    const g = this.game;
    const visited = new Set([g.regionId, ...Object.keys(g.exploredMemory).filter(k => g.exploredMemory[k])]);
    const tabs = Object.values(REGIONS).map(r => `<button data-r="${r.id}" class="${this.mapRegion === r.id ? 'active' : ''}" ${visited.has(r.id) ? '' : 'disabled style="opacity:.3"'}>${r.name}</button>`).join('');
    box.innerHTML = `<div class="menu-title"><h2>Mapa</h2><p>${escapeHTML(REGIONS[this.mapRegion]?.subtitle || '')}</p></div><div class="map-region-tabs">${tabs}</div><div class="map-screen"><div class="map-wrap"><canvas id="full-map" width="900" height="620"></canvas></div><div class="map-legend"><b>LEYENDA</b><div><span style="background:#e8c37a"></span>Santuario / aldea</div><div><span style="background:#b8463f"></span>Guardián</div><div><span style="background:#b58fd0"></span>Portal del Velo</div><div><span style="background:#8fd0b3"></span>Eco salvaje</div><hr style="border-color:rgba(232,195,122,.15);margin:12px 0"><b>REGIÓN</b><div>${escapeHTML(REGIONS[this.mapRegion]?.name || '')}</div><div>Nivel ${escapeHTML(REGIONS[this.mapRegion]?.level || '')}</div><div style="margin-top:10px;line-height:1.5">La niebla cubre lo que aún no has caminado.</div></div></div>`;
    box.querySelector('.map-region-tabs').addEventListener('click', e => {
      const b = e.target.closest('button'); if (!b || b.disabled) return;
      this.mapRegion = b.dataset.r; this.renderMenu();
    });
    requestAnimationFrame(() => {
      const cv = $('full-map');
      if (!cv) return;
      const wrap = cv.parentElement;
      cv.width = Math.max(640, wrap.clientWidth);
      cv.height = Math.max(380, wrap.clientHeight);
      let world;
      if (this.mapRegion === g.regionId) world = g.world;
      else world = this.mapWorlds[this.mapRegion] || (this.mapWorlds[this.mapRegion] = buildWorld(this.mapRegion, g.flags));
      const px = g.player.x, py = g.player.y;
      if (world !== g.world) { g.player.x = world.playerStart.x; g.player.y = world.playerStart.y; }
      try { drawFullMap(cv, g, world); } catch (err) { console.error(err); }
      g.player.x = px; g.player.y = py;
    });
  },

  // ───────────────────────── ajustes ─────────────────────────
  renderSettings(box) {
    const g = this.game, s = g.settings;
    box.innerHTML = `<div class="menu-title"><h2>Opciones</h2><p>El Velo escucha</p></div>
      <div class="setting-row"><div class="label">Dificultad<small>Cambia el daño recibido y la captura</small></div><div class="control"><div class="seg" id="set-diff">${Object.entries(DIFFICULTY).map(([k, d]) => `<button data-k="${k}" class="${g.difficulty === k ? 'active' : ''}">${d.name}</button>`).join('')}</div></div></div>
      <div class="setting-row"><div class="label">Volumen maestro</div><div class="control"><input type="range" min="0" max="1" step=".05" value="${s.master}" id="set-master"><span class="val">${Math.round(s.master * 100)}%</span></div></div>
      <div class="setting-row"><div class="label">Música</div><div class="control"><input type="range" min="0" max="1" step=".05" value="${s.music}" id="set-music"><span class="val">${Math.round(s.music * 100)}%</span></div></div>
      <div class="setting-row"><div class="label">Efectos</div><div class="control"><input type="range" min="0" max="1" step=".05" value="${s.sfx}" id="set-sfx"><span class="val">${Math.round(s.sfx * 100)}%</span></div></div>
      <div class="setting-row"><div class="label">Silenciar<small>Todo el audio</small></div><div class="control"><button class="toggle ${s.muted ? 'on' : ''}" id="set-mute"></button></div></div>
      <div class="setting-row"><div class="label">Números de daño</div><div class="control"><button class="toggle ${s.showDamage ? 'on' : ''}" id="set-dmg"></button></div></div>
      <div class="setting-row"><div class="label">Sacudida de cámara</div><div class="control"><button class="toggle ${s.screenShake ? 'on' : ''}" id="set-shake"></button></div></div>
      <div class="setting-row"><div class="label">Ayudas en pantalla</div><div class="control"><button class="toggle ${s.hints ? 'on' : ''}" id="set-hints"></button></div></div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:22px">
        <button class="btn btn-small" id="set-save">GUARDAR AHORA</button>
        <button class="btn btn-ghost btn-small" id="set-title">VOLVER AL TÍTULO</button>
        <button class="btn btn-ghost btn-small" id="set-delete" style="border-color:rgba(184,70,63,.4);color:#e0a0a0">BORRAR PARTIDA</button>
      </div>
      <p style="margin-top:18px;font-size:9px;color:#6f756f;line-height:1.6">Consejo: en móvil, mantén el joystick con el pulgar izquierdo y usa los botones de la derecha. La esquiva tiene invulnerabilidad breve. El bloqueo perfecto se consigue en el primer instante.</p>`;
    $('set-diff').addEventListener('click', e => {
      const b = e.target.closest('button'); if (!b) return;
      g.difficulty = b.dataset.k; s.difficulty = g.difficulty; g.saveSettings();
      $('set-diff').querySelectorAll('button').forEach(x => x.classList.toggle('active', x === b));
      this.toast('Dificultad: ' + DIFFICULTY[b.dataset.k].name, 'gold');
    });
    for (const [key, id] of [['master', 'set-master'], ['music', 'set-music'], ['sfx', 'set-sfx']]) {
      $(id).addEventListener('input', e => {
        s[key] = Number(e.target.value); g.saveSettings();
        e.target.nextElementSibling.textContent = Math.round(s[key] * 100) + '%';
      });
    }
    const toggle = (id, key) => $(id).addEventListener('click', () => {
      s[key] = !s[key]; g.saveSettings();
      $(id).classList.toggle('on', s[key]);
      if (key === 'muted') audio.setMuted?.(s.muted);
    });
    toggle('set-mute', 'muted'); toggle('set-dmg', 'showDamage'); toggle('set-shake', 'screenShake'); toggle('set-hints', 'hints');
    $('set-save').addEventListener('click', () => g.save(true));
    $('set-title').addEventListener('click', () => { if (confirm('¿Volver al título? La partida se guardará.')) this.returnToTitle(); });
    $('set-delete').addEventListener('click', () => {
      if (!confirm('¿Borrar la partida guardada? Esta acción no se puede deshacer.')) return;
      g.deleteSave(); this.toast('Partida borrada', 'danger'); this.returnToTitle();
    });
  },

  // ───────────────────────── tienda ─────────────────────────
  openShop(type, name = 'Mercader') {
    const g = this.game;
    if (!g.inGame) return;
    g.setMode('shop');
    this.shop = { type: type === 'drakmor' ? 'forge' : type, name };
    const layer = $('modal-layer');
    layer.classList.remove('hidden');
    layer.dataset.sticky = '1';
    this.renderShop();
  },

  shopPrice(item) {
    return item.price > 0 ? item.price : (SHOP_PRICE[item.rarity] || 100);
  },

  renderShop() {
    const g = this.game, shop = this.shop;
    if (!shop) return;
    const stock = (SHOP_STOCK[shop.type] || []).map(id => ITEMS[id]).filter(Boolean);
    $('modal-title').textContent = shop.name;
    let html = `<p>Oro disponible: <b style="color:#e8c37a">${g.gold}</b>. Aldric no hace preguntas; Bram tampoco, pero cobra más.</p><div class="shop-grid">`;
    for (const item of stock) {
      const price = this.shopPrice(item);
      html += `<div class="shop-item"><div class="item-glyph ${rarityClass(item.rarity)}">${item.glyph || '·'}</div><div class="meta"><b class="${rarityClass(item.rarity)}">${escapeHTML(item.name)}</b><small>${escapeHTML(item.desc || '')}</small></div><div class="shop-buy"><span>${price} oro</span><button data-buy="${item.id}" ${g.gold < price ? 'disabled' : ''}>COMPRAR</button></div></div>`;
    }
    html += `</div><div class="section-label" style="margin-top:18px"><span>VENDER MATERIALES</span><i></i></div><div class="shop-sell">`;
    const sellable = Object.entries(g.inventory).filter(([id]) => ITEMS[id] && ['material', 'consume'].includes(ITEMS[id].slot));
    if (!sellable.length) html += '<p style="font-size:10px;color:#6f756f">No hay materiales que vender.</p>';
    for (const [id, qty] of sellable) {
      const item = ITEMS[id];
      const price = Math.max(1, Math.round((item.price || 10) * .5));
      html += `<button data-sell="${id}">${escapeHTML(item.name)} ×${qty} · +${price}</button>`;
    }
    html += '</div>';
    $('modal-body').innerHTML = html;
    const actions = $('modal-actions');
    actions.innerHTML = '';
    const close = el('button', 'btn btn-primary', 'SALIR');
    close.addEventListener('click', () => this.closeShop());
    actions.appendChild(close);
    $('modal-body').addEventListener('click', e => {
      const buy = e.target.closest('[data-buy]');
      if (buy) { this.buyItem(buy.dataset.buy); return; }
      const sell = e.target.closest('[data-sell]');
      if (sell) {
        const id = sell.dataset.sell, item = ITEMS[id];
        if (!item || !g.inventory[id]) return;
        const value = Math.max(1, Math.round((item.price || 10) * .5));
        g.removeInventory(id, 1); g.addGold(value);
        audio.sfx?.('coin'); this.toast(`+${value} oro`); g.autoSave();
        this.renderShop();
      }
    }, { once: true });
  },

  buyItem(id) {
    const g = this.game, item = ITEMS[id];
    if (!item) return;
    const price = this.shopPrice(item);
    if (g.gold < price) { this.toast('No tienes suficiente oro', 'danger'); return; }
    g.gold -= price; g.addInventory(id, 1);
    audio.sfx?.('coin');
    this.toast(`Comprado: ${item.name}`, 'gold');
    g.autoSave();
    this.renderShop();
  },

  closeShop() {
    const g = this.game;
    $('modal-layer').classList.add('hidden');
    delete $('modal-layer').dataset.sticky;
    this.shop = null;
    if (g.inGame && g.mode === 'shop') g.setMode('playing');
  },

  // ───────────────────────── elección final ─────────────────────────
  chooseEnding() {
    const g = this.game;
    g.setMode('menu');
    const layer = $('modal-layer');
    layer.classList.remove('hidden');
    layer.dataset.sticky = '1';
    $('modal-title').textContent = 'EL VELO ESPERA';
    $('modal-body').innerHTML = `<p>La Gema, la Lágrima y la Jarra laten al unísono. No hay una respuesta correcta. Hay una tuya.</p>
      <div class="ending-choices">
        <button data-choice="ascension"><b>LA ASCENSIÓN</b><span>Cierra el Velo desde dentro. El mundo sigue sin ti. Tú te conviertes en la promesa de que algo fue recordado.</span></button>
        <button data-choice="convergencia"><b>LA CONVERGENCIA</b><span>Todos los mundos posibles se derraman a la vez. Tú serás el puente entre lo que fue y lo que pudo ser.</span></button>
        <button data-choice="ruptura"><b>LA RUPTURA</b><span>Rompe el Velo y deja que el mundo sea pequeño, sólido y mortal. Sin magia. Sin ecos. Sin ti.</span></button>
      </div>`;
    const actions = $('modal-actions');
    actions.innerHTML = '';
    return new Promise(resolve => {
      $('modal-body').addEventListener('click', e => {
        const b = e.target.closest('[data-choice]');
        if (!b) return;
        const choice = b.dataset.choice;
        layer.classList.add('hidden');
        delete layer.dataset.sticky;
        resolve(choice);
      }, { once: true });
    });
  }
};
