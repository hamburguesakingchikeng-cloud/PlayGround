/* ==========================================================================
   UI — HUD, menus, dialogue, shops, creation, save slots and settings.
   ========================================================================== */

import {
  ITEMS, SKILLS, CREATURES, ELEMENTS, QUESTS, RECIPES, ZONES, ZONE_ORDER,
  APPEARANCE, STARTERS, RARITY, item, creature, xpForLevel, creatureXpForLevel,
} from './data.js';
import { icon } from './icons.js';
import { drawPortrait } from './render.js';

const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fmtTime = s => {
  s = Math.floor(s || 0);
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m ${s % 60}s`;
};
const rarityColor = r => RARITY[r]?.color || '#93a6c7';
const rarityName = r => RARITY[r]?.name || 'Común';
const typeName = t => ({
  consumable: 'Consumible', material: 'Material', weapon: 'Arma', shield: 'Escudo',
  armor: 'Armadura', accessory: 'Accesorio', charm: 'Amuleto', key: 'Reliquia',
}[t] || 'Objeto');
const element = e => ELEMENTS[e] || ELEMENTS.light;

const TABS = [
  ['inventory', 'Inventario', 'bag'],
  ['equipment', 'Equipo', 'shield'],
  ['skills', 'Habilidades', 'spark'],
  ['map', 'Mapa', 'map'],
  ['quests', 'Misiones', 'quest'],
  ['creatures', 'Criaturas', 'creature'],
  ['collection', 'Colección', 'collection'],
  ['crafting', 'Fabricación', 'hammer'],
  ['stats', 'Estadísticas', 'stats'],
  ['save', 'Guardar', 'save'],
  ['settings', 'Ajustes', 'settings'],
];

export class UI {
  constructor(game) {
    this.game = game;
    this.root = document.getElementById('ui');
    this.modalRoot = document.getElementById('modal');
    this.currentTab = 'inventory';
    this.selectedItem = null;
    this.selectedRecipe = RECIPES[0]?.id || null;
    this.selectedCreature = 0;
    this.shop = null;
    this.dialogue = null;
    this.creation = {
      name: 'Astra', starter: 0,
      appearance: { hair: 'corto', hairColor: 'nieve', skin: 'clara', outfit: 'azul', eyes: 'ambar' },
    };
    this.mapZone = null;
    this.toastTimers = [];
    this.promptText = '';
    this.portraitFor = null;
    this._bind();
  }

  _bind() {
    this.root.addEventListener('click', e => this._onClick(e));
    this.modalRoot.addEventListener('click', e => {
      if (e.target === this.modalRoot) this.closeModal();
      this._onClick(e);
    });
    this.root.addEventListener('input', e => this._onInput(e));
    window.addEventListener('keydown', e => {
      if (!this.dialogue) return;
      if (e.code === 'Space' || e.code === 'Enter' || e.code === 'KeyE') { e.preventDefault(); this.advanceDialogue(); }
      if (e.code === 'Escape') { e.preventDefault(); this.closeDialogue(); }
    });
  }

  /* ---------------------------------------------------------------------- */
  /* Screens                                                                */
  /* ---------------------------------------------------------------------- */
  screen(html, cls = '') {
    this.root.innerHTML = `<div class="screen ${cls}">${html}</div>`;
    this.root.firstElementChild.classList.add('fade-in');
  }
  hideScreen() { this.root.innerHTML = ''; }

  showBoot(p = 0, text = 'Invocando el reino…') {
    const fill = document.getElementById('boot-fill');
    const status = document.getElementById('boot-status');
    if (fill) fill.style.width = `${p}%`;
    if (status) status.textContent = text;
  }
  hideBoot() {
    const boot = document.getElementById('boot');
    if (!boot) return;
    boot.classList.add('done');
    setTimeout(() => boot.remove(), 700);
  }

  showTitle() {
    const hasSave = this.game.hasAnySave();
    this.hideScreen();
    this.screen(`
      <div class="title-content">
        <div class="title-eyebrow">Un RPG de acción y criaturas</div>
        <div class="title-emblem">${icon('celestial', 'title-svg')}</div>
        <h1 class="game-title"><span>La Espada</span><span>Celestial</span></h1>
        <p class="title-sub">RPG Retro · Edición del Alba</p>
        <div class="title-menu">
          <button class="btn primary" data-action="new-game">${icon('play')} Nueva partida</button>
          <button class="btn" data-action="continue" ${hasSave ? '' : 'disabled'}>${icon('save')} Continuar</button>
          <button class="btn" data-action="load" ${hasSave ? '' : 'disabled'}>${icon('book')} Cargar partida</button>
          <button class="btn ghost" data-action="settings-title">${icon('settings')} Ajustes</button>
          <button class="btn ghost" data-action="credits">${icon('scroll')} Créditos</button>
        </div>
        <div class="title-foot">
          <span><i></i> Mundo abierto</span>
          <span><i></i> 10 criaturas</span>
          <span><i></i> Combate en tiempo real</span>
        </div>
      </div>
      <aside class="title-side">
        <div class="feature"><b>✦</b> Una espada rota</div>
        <div class="feature"><b>◈</b> Diez afinidades</div>
        <div class="feature"><b>⚔</b> Cinco guardianes</div>
        <div class="feature"><b>☾</b> Un reino que resiste</div>
      </aside>
    `, 'title-screen');
    this.game.setMode('title');
    this.syncChrome();
  }

  showCreation() {
    const c = this.creation;
    const app = c.appearance;
    const opts = (list, group, current, render) => list.map(o => render(o, group, current)).join('');
    this.screen(`
      <div class="creation-wrap">
        <div class="creation-preview">
          <canvas id="createPreview" width="280" height="340"></canvas>
          <div class="preview-caption"><b id="createPreviewName">${esc(c.name || 'Astra')}</b><span>Portador del Alba</span></div>
        </div>
        <div class="creation-panel">
          <header class="creation-head">
            <div class="kicker">PASO 1 DE 1 · FORJA TU LEYENDA</div>
            <h2>Crea a tu portador</h2>
            <p>Elige tu nombre, apariencia, arma inicial y la criatura que responderá a tu llamada. Todo se reflejará en el mundo.</p>
          </header>
          <div class="creation-scroll">
            <div class="field">
              <label for="createName">Nombre</label>
              <input class="text-input" id="createName" maxlength="16" value="${esc(c.name)}" autocomplete="off" spellcheck="false">
            </div>
            <div class="field">
              <span class="field-label">Peinado</span>
              <div class="choice-row">${opts(APPEARANCE.hairStyles, 'hair', app.hair, (o, g, cur) => `<button class="choice ${cur === o.id ? 'selected' : ''}" data-action="create-choice" data-group="${g}" data-value="${o.id}">${o.name}</button>`)}</div>
            </div>
            <div class="field">
              <span class="field-label">Color de cabello</span>
              <div class="choice-row">${opts(APPEARANCE.hairColors, 'hairColor', app.hairColor, (o, g, cur) => `<button class="choice ${cur === o.id ? 'selected' : ''}" data-action="create-choice" data-group="${g}" data-value="${o.id}"><span class="swatch" style="background:${o.color}"></span>${o.name}</button>`)}</div>
            </div>
            <div class="field">
              <span class="field-label">Tono de piel</span>
              <div class="choice-row">${opts(APPEARANCE.skins, 'skin', app.skin, (o, g, cur) => `<button class="choice ${cur === o.id ? 'selected' : ''}" data-action="create-choice" data-group="${g}" data-value="${o.id}"><span class="swatch" style="background:${o.color}"></span>${o.name}</button>`)}</div>
            </div>
            <div class="field">
              <span class="field-label">Ropa</span>
              <div class="choice-row">${opts(APPEARANCE.outfits, 'outfit', app.outfit, (o, g, cur) => `<button class="choice ${cur === o.id ? 'selected' : ''}" data-action="create-choice" data-group="${g}" data-value="${o.id}"><span class="swatch" style="background:${o.color}"></span>${o.name}</button>`)}</div>
            </div>
            <div class="field">
              <span class="field-label">Color de ojos</span>
              <div class="choice-row">${opts(APPEARANCE.eyes, 'eyes', app.eyes, (o, g, cur) => `<button class="choice ${cur === o.id ? 'selected' : ''}" data-action="create-choice" data-group="${g}" data-value="${o.id}"><span class="swatch" style="background:${o.color}"></span>${o.name}</button>`)}</div>
            </div>
            <div class="field">
              <span class="field-label">Vínculo inicial</span>
              <div class="option-grid">${STARTERS.map((s, i) => `<button class="option-card ${c.starter === i ? 'selected' : ''}" data-action="create-choice" data-group="starter" data-value="${i}"><b>${s.label}</b><span>${s.desc}</span></button>`).join('')}</div>
            </div>
          </div>
          <footer class="creation-foot">
            <button class="btn ghost" data-action="back-title">Volver</button>
            <button class="btn primary" data-action="start-adventure">${icon('play')} Comenzar aventura</button>
          </footer>
        </div>
      </div>
    `, 'creation-screen');
    this.game.setMode('creation');
    this.syncChrome();
    requestAnimationFrame(() => this.game.drawCreationPreview(document.getElementById('createPreview'), c));
  }

  showPause(tab = this.currentTab) {
    this.currentTab = tab;
    this.selectedItem = this.selectedItem || null;
    const meta = TABS.find(t => t[0] === tab) || TABS[0];
    const content = this.renderTab(tab);
    this.screen(`
      <div class="pause-shell">
        <aside class="pause-rail">
          <div class="rail-head">
            <div class="kicker">LA ESPADA CELESTIAL</div>
            <h3>${esc(this.game.state.name)}</h3>
            <p>Nv. ${this.game.state.level} · ${esc(ZONES[this.game.state.zone]?.name || '')}</p>
          </div>
          <nav class="rail-nav">
            ${TABS.map(([id, label, ic]) => `<button class="rail-btn ${id === tab ? 'active' : ''}" data-action="open-tab" data-tab="${id}">${icon(ic)}<span>${label}</span><small>${id === 'save' ? 'F5' : ''}</small></button>`).join('')}
          </nav>
          <div class="rail-foot">
            <button class="btn ghost small" data-action="resume">${icon('arrow')} <span>Volver al juego</span></button>
            <button class="btn ghost small" data-action="back-title-confirm">${icon('home')} <span>Título</span></button>
          </div>
        </aside>
        <main class="pause-main">
          <header class="panel-head">
            <div><div class="kicker">${meta[1].toUpperCase()}</div><h2>${meta[1]}</h2></div>
            <div class="panel-actions">
              <button class="btn icon-only ghost small" data-action="resume" title="Cerrar">${icon('close')}</button>
            </div>
          </header>
          <div class="panel-body" id="panelBody">${content}</div>
        </main>
      </div>
    `, 'pause-screen');
    this.syncChrome();
    requestAnimationFrame(() => this.afterTabRender(tab));
  }

  afterTabRender(tab) {
    if (tab === 'map') {
      const cv = document.getElementById('mapCanvas');
      if (cv) this.game.drawMiniMap(cv, this.mapZone || this.game.state.zone);
    }
    if (tab === 'equipment') {
      const cv = document.getElementById('equipPreview');
      if (cv) this.game.drawEquipmentPreview(cv);
    }
    if (tab === 'creatures' || tab === 'collection') {
      // portraits are CSS orbs; nothing else
    }
  }

  renderTab(tab) {
    switch (tab) {
      case 'inventory': return this.renderInventory();
      case 'equipment': return this.renderEquipment();
      case 'skills': return this.renderSkills();
      case 'map': return this.renderMap();
      case 'quests': return this.renderQuests();
      case 'creatures': return this.renderCreatures();
      case 'collection': return this.renderCollection();
      case 'crafting': return this.renderCrafting();
      case 'stats': return this.renderStats();
      case 'save': return this.renderSaveSlots('pause');
      case 'settings': return this.renderSettings('pause');
      default: return '';
    }
  }

  /* ---------------------------------------------------------------------- */
  /* Inventory                                                              */
  /* ---------------------------------------------------------------------- */
  invList() {
    const st = this.game.state;
    return Object.entries(st.inventory)
      .filter(([id, q]) => q > 0 && ITEMS[id])
      .map(([id, q]) => ({ id, qty: q, def: ITEMS[id] }))
      .sort((a, b) => {
        const order = { weapon: 1, shield: 1, armor: 1, accessory: 1, charm: 1, consumable: 2, material: 3, key: 4 };
        return (order[a.def.type] || 5) - (order[b.def.type] || 5) || a.def.name.localeCompare(b.def.name);
      });
  }

  renderInventory() {
    const list = this.invList();
    if (!list.length) return `<div class="empty-note"><b>Tu bolsa está vacía</b>Explora, derrota enemigos y abre cofres.</div>`;
    if (!this.selectedItem || !list.find(i => i.id === this.selectedItem)) this.selectedItem = list[0].id;
    const sel = list.find(i => i.id === this.selectedItem) || list[0];
    const d = sel.def;
    const stats = this.itemStatsHtml(d);
    const action = this.itemAction(d, sel.id);
    return `
      <div class="inventory-layout">
        <div>
          <div class="section-title">Bolsa · ${list.reduce((a, b) => a + b.qty, 0)} objetos</div>
          <div class="inv-grid">
            ${list.map(i => `<button class="item-card ${i.id === sel.id ? 'selected' : ''}" data-action="select-item" data-id="${i.id}"><span class="rarity" style="--r:${rarityColor(i.def.rarity)}"></span><span class="item-ico" style="color:${rarityColor(i.def.rarity)}">${icon(i.def.icon)}</span><b>${esc(i.def.name)}</b><span class="qty">×${i.qty}</span></button>`).join('')}
          </div>
        </div>
        <aside class="detail-panel">
          <div class="detail-head">
            <div class="detail-ico" style="color:${rarityColor(d.rarity)}">${icon(d.icon)}</div>
            <div><h4>${esc(d.name)}</h4><span>${rarityName(d.rarity)} · ${typeName(d.type)}</span></div>
          </div>
          <div class="tag-row">${d.type ? `<span class="tag">${typeName(d.type)}</span>` : ''}${d.slot ? `<span class="tag teal">${typeName(d.slot)}</span>` : ''}${d.value ? `<span class="tag gold">${d.value} oro</span>` : ''}</div>
          <p class="detail-desc">${esc(d.desc)}</p>
          ${stats}
          <div class="detail-actions">${action}</div>
        </aside>
      </div>`;
  }

  itemStatsHtml(d) {
    const rows = [];
    if (d.weapon) {
      rows.push(['Daño', d.weapon.dmg]);
      rows.push(['Velocidad', `${d.weapon.speed.toFixed(2)}×`]);
      rows.push(['Alcance', d.weapon.projectile ? 'A distancia' : `${d.weapon.range} px`]);
      rows.push(['Crítico', `${Math.round(d.weapon.crit * 100)}%`]);
    }
    if (d.stats) for (const [k, v] of Object.entries(d.stats)) {
      const label = { hp: 'Vida', mp: 'Maná', str: 'Fuerza', def: 'Defensa', spd: 'Velocidad', int: 'Inteligencia', luck: 'Suerte' }[k] || k;
      rows.push([label, `${v > 0 ? '+' : ''}${v}`]);
    }
    if (d.charm) for (const [k, v] of Object.entries(d.charm)) {
      const label = { atk: 'Ataque de criatura', hp: 'Vida de criatura', haste: 'Celeridad de asistencia' }[k] || k;
      rows.push([label, k === 'haste' ? `+${Math.round(v * 100)}%` : `+${v}`]);
    }
    if (d.effect) for (const [k, v] of Object.entries(d.effect)) {
      const label = { heal: 'Vida', mana: 'Maná', stamina: 'Resistencia', creatureXp: 'XP de criatura', bond: 'Vínculo', capture: 'Captura' }[k] || k;
      rows.push([label, k === 'capture' ? `+${Math.round(v * 100)}%` : `+${v}`]);
    }
    if (!rows.length) return '';
    return `<div>${rows.map(([a, b]) => `<div class="stat-row"><span>${a}</span><b>${b}</b></div>`).join('')}</div>`;
  }

  itemAction(d, id) {
    if (d.type === 'consumable') return `<button class="btn primary" data-action="use-item" data-id="${id}">${icon('spark')} Usar</button>`;
    if (['weapon', 'shield', 'armor', 'accessory'].includes(d.type)) return `<button class="btn primary" data-action="equip-item" data-id="${id}">${icon('check')} Equipar</button>`;
    if (d.type === 'charm') return `<button class="btn ghost" data-action="open-tab" data-tab="creatures">${icon('creature')} Equipar en criatura</button>`;
    if (d.type === 'key') return `<div class="empty-note" style="padding:10px">Reliquia de la historia. No se puede usar desde la bolsa.</div>`;
    return `<div class="empty-note" style="padding:10px">Material de fabricación. Llévalo al yunque de Torin.</div>`;
  }

  /* ---------------------------------------------------------------------- */
  /* Equipment                                                              */
  /* ---------------------------------------------------------------------- */
  renderEquipment() {
    const st = this.game.state, d = this.game.derived;
    const slots = [
      ['weapon', 'Arma', 'sword'], ['shield', 'Escudo', 'shield'],
      ['armor', 'Armadura', 'armor'], ['accessory', 'Accesorio', 'amulet'],
    ];
    return `
      <div class="equip-layout">
        <div>
          <div class="equip-slots">
            ${slots.map(([slot, label, ic]) => {
              const it = item(st.equipment[slot]);
              return `<button class="equip-slot" data-action="open-equip-picker" data-slot="${slot}">
                <span class="slot-ico" style="color:${it ? rarityColor(it.rarity) : '#65738f'}">${icon(it?.icon || ic)}</span>
                <span class="slot-meta"><span>${label}</span><b>${it ? esc(it.name) : '— Vacío —'}</b></span>
              </button>`;
            }).join('')}
            <div class="equip-preview">
              <span class="preview-badge">VISTA DEL PORTADOR</span>
              <canvas id="equipPreview"></canvas>
            </div>
          </div>
        </div>
        <aside class="detail-panel">
          <h4 style="margin:0 0 8px;font-family:var(--font-display);font-weight:500">Atributos derivados</h4>
          <div class="derived-stats">
            <div class="derived-stat"><span>${icon('heart')} Vida máxima</span><b>${d.maxHp}</b></div>
            <div class="derived-stat"><span>${icon('mana')} Maná máximo</span><b>${d.maxMp}</b></div>
            <div class="derived-stat"><span>${icon('sword')} Ataque</span><b>${d.atk}</b></div>
            <div class="derived-stat"><span>${icon('shield')} Defensa</span><b>${d.def}</b></div>
            <div class="derived-stat"><span>${icon('dodge')} Velocidad</span><b>${d.spd.toFixed(1)}</b></div>
            <div class="derived-stat"><span>${icon('spark')} Inteligencia</span><b>${d.int}</b></div>
            <div class="derived-stat"><span>${icon('star')} Suerte</span><b>${d.luck}</b></div>
            <div class="derived-stat"><span>${icon('crown')} Crítico</span><b>${Math.round(d.crit * 100)}%</b></div>
          </div>
          <div class="divider"></div>
          <p class="detail-desc" style="margin:0">Haz clic en una ranura para cambiar el objeto equipado. Las armas cambian tu estilo de combate y el equipamiento se refleja en el personaje.</p>
        </aside>
      </div>`;
  }

  openEquipPicker(slot) {
    const st = this.game.state;
    const types = slot === 'weapon' ? ['weapon'] : slot === 'shield' ? ['shield'] : slot === 'armor' ? ['armor'] : ['accessory'];
    const list = Object.entries(st.inventory).filter(([id, q]) => q > 0 && ITEMS[id] && types.includes(ITEMS[id].type));
    this.showModalHTML('Elegir equipamiento', `
      <div class="inv-grid" style="max-height:340px;overflow:auto">
        ${list.map(([id, q]) => `<button class="item-card" data-action="equip-pick" data-id="${id}"><span class="item-ico" style="color:${rarityColor(ITEMS[id].rarity)}">${icon(ITEMS[id].icon)}</span><b>${esc(ITEMS[id].name)}</b><span class="qty">×${q}</span></button>`).join('')}
        ${st.equipment[slot] ? `<button class="item-card" data-action="unequip-slot" data-slot="${slot}"><span class="item-ico">${icon('close')}</span><b>Desequipar</b></button>` : ''}
      </div>
      ${list.length ? '' : '<div class="empty-note">No tienes objetos compatibles en la bolsa.</div>'}
      <div class="modal-actions" style="margin-top:10px"><button class="btn ghost" data-action="close-modal">Cerrar</button></div>
    `);
  }

  /* ---------------------------------------------------------------------- */
  /* Skills                                                                 */
  /* ---------------------------------------------------------------------- */
  renderSkills() {
    const st = this.game.state;
    const d = this.game.derived;
    return `
      <div class="row between" style="margin-bottom:12px">
        <div class="pill">${icon('spark')} Puntos de habilidad: <b class="gold">${st.skillPoints}</b></div>
        <div class="pill">Maná: <b class="teal">${Math.floor(st.mp)} / ${d.maxMp}</b></div>
      </div>
      <div class="skill-grid">
        ${Object.entries(SKILLS).map(([id, sk]) => {
          const unlocked = st.skills.unlocked.includes(id);
          const active = st.skills.active === id;
          const canUnlock = !unlocked && st.level >= sk.unlock && st.skillPoints >= sk.points;
          return `<div class="skill-card ${unlocked ? '' : 'locked'} ${active ? 'active-skill' : ''}">
            ${active ? '<span class="ribbon">ACTIVA</span>' : ''}
            <div class="skill-top"><div class="skill-glyph">${sk.glyph}</div><div><h4>${sk.name}</h4><span>${unlocked ? 'Desbloqueada' : `Nivel ${sk.unlock} · ${sk.points} punto${sk.points === 1 ? '' : 's'}`}</span></div></div>
            <p class="skill-desc">${sk.desc}</p>
            <div class="skill-foot">
              <span class="skill-cost">${icon('mana')} ${sk.cost} maná · ${sk.cooldown}s</span>
              ${unlocked
                ? `<button class="btn ${active ? 'primary' : 'ghost'}" data-action="set-skill" data-id="${id}" ${active ? 'disabled' : ''}>${active ? 'Activa' : 'Seleccionar'}</button>`
                : `<button class="btn ${canUnlock ? 'primary' : 'ghost'}" data-action="unlock-skill" data-id="${id}" ${canUnlock ? '' : 'disabled'}>Desbloquear</button>`}
            </div>
          </div>`;
        }).join('')}
      </div>
      <div class="empty-note mt14" style="padding:12px">La habilidad activa se lanza con <span class="kbd">L</span> o el botón <b>X</b>. Gana puntos de habilidad subiendo de nivel.</div>`;
  }

  /* ---------------------------------------------------------------------- */
  /* Map                                                                    */
  /* ---------------------------------------------------------------------- */
  renderMap() {
    const st = this.game.state;
    const zone = this.mapZone || st.zone;
    return `
      <div class="map-layout">
        <div class="map-canvas-wrap">
          <canvas id="mapCanvas"></canvas>
          <div class="map-legend"><span><i style="background:#7fb4ff"></i>Agua</span><span><i style="background:#f2d188"></i>Ruta</span><span><i style="background:#ff7d9d"></i>Tú</span></div>
        </div>
        <aside>
          <div class="section-title">Regiones</div>
          <div class="zone-list">
            ${ZONE_ORDER.map(z => {
              const zz = ZONES[z];
              const discovered = st.discovered?.includes(z);
              const current = st.zone === z;
              return `<button class="zone-item ${current ? 'current' : ''} ${discovered ? '' : 'locked'}" data-action="map-zone" data-zone="${z}" ${discovered ? '' : 'disabled'}>
                <span class="z-ico">${current ? '✦' : discovered ? '◇' : '?'}</span>
                <span><b>${discovered ? esc(zz.name) : 'Región desconocida'}</b><span>${discovered ? `Nv. ${zz.level}+` : 'Explora para descubrir'}</span></span>
              </button>`;
            }).join('')}
          </div>
          <div class="divider"></div>
          <div class="stat-row"><span>Región actual</span><b>${esc(ZONES[zone]?.name || '')}</b></div>
          <div class="stat-row"><span>Criaturas avistadas</span><b>${st.collection.length} / 10</b></div>
          <div class="stat-row"><span>Runas</span><b>${this.game.runeCount()} / 3</b></div>
        </aside>
      </div>`;
  }

  /* ---------------------------------------------------------------------- */
  /* Quests                                                                 */
  /* ---------------------------------------------------------------------- */
  renderQuests() {
    const st = this.game.state;
    const entries = Object.entries(st.quests).filter(([id]) => QUESTS[id]);
    const main = entries.filter(([id]) => QUESTS[id].type === 'main');
    const side = entries.filter(([id]) => QUESTS[id].type === 'side');
    const card = ([id, q]) => {
      const def = QUESTS[id];
      const stage = def.stages[Math.min(q.stage, def.stages.length - 1)];
      const count = stage?.count || 1;
      const prog = Math.min(q.progress || 0, count);
      const done = q.status === 'done';
      const ready = q.status === 'ready';
      return `<div class="quest-card ${def.type} ${done ? 'done' : ''}">
        <div class="quest-mark ${def.type === 'side' ? 'side' : ''}">${done ? '✓' : ready ? '!' : def.type === 'main' ? '✦' : '◇'}</div>
        <div class="quest-body">
          <h4>${def.title} ${done ? '<span class="tag green">Completada</span>' : ready ? '<span class="tag gold">Lista para entregar</span>' : ''}</h4>
          <p>${stage?.text || def.desc}</p>
          <div class="quest-progress"><div class="track"><i style="width:${done ? 100 : Math.round(prog / count * 100)}%"></i></div><span>${done ? 'Completada' : `${prog} / ${count}`}</span></div>
          <div class="quest-reward">
            <span class="tag gold">${def.reward.gold} oro</span>
            <span class="tag violet">${def.reward.xp} XP</span>
            ${Object.entries(def.reward.items || {}).map(([iid, qty]) => `<span class="tag">${esc(ITEMS[iid]?.name || iid)} ×${qty}</span>`).join('')}
          </div>
        </div>
      </div>`;
    };
    return `
      <div class="section-title">Historia principal</div>
      <div class="quest-list">${main.length ? main.map(card).join('') : '<div class="empty-note">No hay misiones principales activas.</div>'}</div>
      <div class="section-title" style="margin-top:16px">Misiones secundarias</div>
      <div class="quest-list">${side.length ? side.map(card).join('') : '<div class="empty-note"><b>Sin encargos</b>Habla con los aldeanos para encontrar aventuras.</div>'}</div>`;
  }

  /* ---------------------------------------------------------------------- */
  /* Creatures & collection                                                 */
  /* ---------------------------------------------------------------------- */
  renderCreatures() {
    const st = this.game.state;
    const list = st.creatures;
    if (!list.length) return `<div class="empty-note"><b>Sin criaturas</b>Debilita criaturas salvajes y séllalas con cristales.</div>`;
    if (this.selectedCreature >= list.length) this.selectedCreature = 0;
    const c = list[this.selectedCreature] || list[0];
    const def = CREATURES[c.id];
    const el = element(def.element);
    const active = st.activeCreature === this.selectedCreature;
    const name = this.game.creatureDisplayName(c);
    const charm = c.charm ? ITEMS[c.charm] : null;
    const xpPct = Math.min(100, Math.round(c.xp / Math.max(1, c.xpNext) * 100));
    const canEvolve = c.level >= def.evolveLevel && !c.evolved;
    const trainCost = 25 + c.level * 8;
    return `
      <div class="creature-layout">
        <div>
          <div class="creature-grid">
            ${list.map((cc, i) => {
              const dd = CREATURES[cc.id], ee = element(dd.element);
              return `<button class="creature-card ${i === this.selectedCreature ? 'active' : ''}" data-action="select-creature" data-index="${i}">
                <span class="c-lv">Nv.${cc.level}</span>
                <span class="c-orb" style="--el:${ee.color}"></span>
                <b>${esc(this.game.creatureDisplayName(cc))}</b><span>${ee.name}</span>
              </button>`;
            }).join('')}
          </div>
          <div class="empty-note mt14" style="padding:12px">Criatura activa: <b>${esc(this.game.getActiveCreature() ? this.game.creatureDisplayName(this.game.getActiveCreature()) : 'ninguna')}</b>. Su habilidad de exploración se usa con <span class="kbd">E</span> cerca de obstáculos.</div>
        </div>
        <aside class="creature-detail">
          <div class="creature-hero">
            <div class="big-orb" style="--el:${el.color}"></div>
            <div><h4>${esc(name)}</h4><span>${esc(def.title)} · ${el.name}</span></div>
          </div>
          <div class="tag-row"><span class="tag ${active ? 'teal' : ''}">${active ? 'ACTIVA' : 'EN RESERVA'}</span><span class="tag">Nv. ${c.level}</span><span class="tag gold">Vínculo ${c.bond}%</span>${c.evolved ? '<span class="tag violet">Evolucionada</span>' : ''}${def.ability === 'move' ? '<span class="tag teal">MONTURA +22%</span>' : ''}</div>
          <div class="stat-row"><span>Vida</span><b>${c.hp} / ${c.maxHp}</b></div>
          <div class="stat-row"><span>Ataque</span><b>${Math.round(def.base.atk + c.level * 1.4 + (charm?.charm?.atk || 0))}</b></div>
          <div class="stat-row"><span>Habilidad</span><b>${def.abilityName}</b></div>
          <div class="stat-row"><span>Asistencia</span><b>${def.skill}</b></div>
          <div class="stat-row"><span>Equipo</span><b>${charm ? esc(charm.name) : '—'}</b></div>
          <div class="bond-bar"><span>Vínculo</span><div class="track"><i style="width:${c.bond}%"></i></div><span>${c.bond}%</span></div>
          <div class="xp-rail" style="margin:9px 0 2px"><i style="width:${xpPct}%"></i><span style="top:6px">${c.xp} / ${c.xpNext} XP</span></div>
          <p class="detail-desc mt10">${esc(def.desc)}</p>
          <div class="creature-actions">
            <button class="btn ${active ? 'primary' : ''}" data-action="activate-creature" data-index="${this.selectedCreature}" ${active ? 'disabled' : ''}>${icon('check')} ${active ? 'Activa' : 'Activar'}</button>
            <button class="btn" data-action="train-creature" data-index="${this.selectedCreature}">${icon('stats')} Entrenar (${trainCost}g)</button>
            <button class="btn" data-action="feed-creature" data-index="${this.selectedCreature}">${icon('food')} Alimentar</button>
            <button class="btn ${canEvolve ? 'primary' : ''}" data-action="evolve-creature" data-index="${this.selectedCreature}" ${canEvolve ? '' : 'disabled'}>${icon('spark')} Evolucionar</button>
            <button class="btn wide" data-action="charm-creature" data-index="${this.selectedCreature}">${icon('amulet')} ${charm ? 'Cambiar amuleto' : 'Equipar amuleto'}</button>
            ${charm ? `<button class="btn wide ghost" data-action="uncharm-creature" data-index="${this.selectedCreature}">Quitar amuleto</button>` : ''}
          </div>
        </aside>
      </div>`;
  }

  renderCollection() {
    const st = this.game.state;
    const caught = st.collection || [];
    const pct = Math.round(caught.length / Object.keys(CREATURES).length * 100);
    return `
      <div class="collection-progress"><b>${caught.length}</b><span>de ${Object.keys(CREATURES).length} criaturas</span><div class="track"><i style="width:${pct}%"></i></div><span>${pct}%</span></div>
      <div class="collection-grid">
        ${Object.entries(CREATURES).map(([id, def]) => {
          const seen = caught.includes(id);
          const el = element(def.element);
          return `<div class="collection-card ${seen ? '' : 'unseen'}">
            <span class="c-orb" style="--el:${el.color}"></span>
            <span><b>${seen ? esc(def.name) : '???'}</b><span>${seen ? esc(def.title) : 'No descubierta'}</span><span class="tag" style="margin-top:3px">${el.name}</span></span>
            ${seen ? `<span class="seen-mark">✓</span>` : ''}
          </div>`;
        }).join('')}
      </div>
      <div class="empty-note mt14" style="padding:12px">Cada criatura aporta una habilidad de exploración única: quemar, congelar, nadar, volar, iluminar, detectar secretos, mover bloques, activar runas o abrir portales.</div>`;
  }

  openCharmPicker(index) {
    const st = this.game.state;
    const list = Object.entries(st.inventory).filter(([id, q]) => q > 0 && ITEMS[id]?.type === 'charm');
    this.showModalHTML('Amuleto de criatura', `
      <div class="inv-grid" style="max-height:300px;overflow:auto">
        ${list.map(([id, q]) => `<button class="item-card" data-action="charm-pick" data-id="${id}" data-index="${index}"><span class="item-ico" style="color:${rarityColor(ITEMS[id].rarity)}">${icon(ITEMS[id].icon)}</span><b>${esc(ITEMS[id].name)}</b><span class="qty">×${q}</span></button>`).join('')}
      </div>
      ${list.length ? '' : '<div class="empty-note">No tienes amuletos de criatura. Fabrícalos o encuéntralos en cofres.</div>'}
      <div class="modal-actions" style="margin-top:10px"><button class="btn ghost" data-action="close-modal">Cerrar</button></div>
    `);
  }

  /* ---------------------------------------------------------------------- */
  /* Crafting                                                               */
  /* ---------------------------------------------------------------------- */
  renderCrafting() {
    const st = this.game.state;
    const selected = RECIPES.find(r => r.id === this.selectedRecipe) || RECIPES[0];
    if (!selected) return '<div class="empty-note">No hay recetas.</div>';
    const out = ITEMS[selected.out];
    const can = this.game.canCraft(selected);
    return `
      <div class="craft-layout">
        <div>
          <div class="section-title">Recetas · ${RECIPES.length}</div>
          <div class="recipe-list">
            ${RECIPES.map(r => {
              const it = ITEMS[r.out];
              const ok = this.game.canCraft(r);
              return `<button class="recipe-card ${r.id === selected.id ? 'selected' : ''}" data-action="select-recipe" data-id="${r.id}">
                <span class="recipe-ico" style="color:${rarityColor(it.rarity)}">${icon(it.icon)}</span>
                <span><b>${esc(it.name)}</b><span>${typeName(it.type)} · ×${r.qty}</span></span>
                <span class="${ok ? 'can' : 'cannot'}">${ok ? 'Listo' : 'Faltan materiales'}</span>
              </button>`;
            }).join('')}
          </div>
        </div>
        <aside class="detail-panel">
          <div class="detail-head">
            <div class="detail-ico" style="color:${rarityColor(out.rarity)}">${icon(out.icon)}</div>
            <div><h4>${esc(out.name)}</h4><span>${rarityName(out.rarity)}</span></div>
          </div>
          <p class="detail-desc">${esc(out.desc)}</p>
          <div class="section-title">Materiales</div>
          <div class="mats-list">
            ${Object.entries(selected.mats).map(([id, q]) => {
              const have = st.inventory[id] || 0;
              return `<div class="mat-row"><span>${esc(ITEMS[id]?.name || id)}</span><b class="${have >= q ? '' : 'miss'}">${have} / ${q}</b></div>`;
            }).join('')}
          </div>
          <div class="detail-actions">
            <button class="btn ${can ? 'primary' : 'ghost'}" data-action="craft" data-id="${selected.id}" ${can ? '' : 'disabled'}>${icon('hammer')} Fabricar</button>
          </div>
        </aside>
      </div>`;
  }

  /* ---------------------------------------------------------------------- */
  /* Stats                                                                  */
  /* ---------------------------------------------------------------------- */
  renderStats() {
    const st = this.game.state, d = this.game.derived;
    const attrs = [
      ['str', 'Fuerza', 'Aumenta el daño físico.'],
      ['def', 'Defensa', 'Reduce el daño recibido.'],
      ['spd', 'Velocidad', 'Aumenta movimiento y resistencia.'],
      ['int', 'Inteligencia', 'Aumenta maná y magia.'],
      ['luck', 'Suerte', 'Mejora críticos y capturas.'],
    ];
    return `
      <div class="stats-layout">
        <div class="stat-block">
          <h4>Portador</h4>
          <div class="stat-big"><b>${st.level}</b><span>Nivel</span></div>
          <div class="stat-row"><span>Experiencia</span><b>${st.xp} / ${st.xpNext}</b></div>
          <div class="stat-row"><span>Vida</span><b>${Math.floor(st.hp)} / ${d.maxHp}</b></div>
          <div class="stat-row"><span>Maná</span><b>${Math.floor(st.mp)} / ${d.maxMp}</b></div>
          <div class="stat-row"><span>Ataque</span><b>${d.atk}</b></div>
          <div class="stat-row"><span>Defensa</span><b>${d.def}</b></div>
          <div class="stat-row"><span>Crítico</span><b>${Math.round(d.crit * 100)}%</b></div>
          <div class="stat-row"><span>Oro</span><b class="gold">${st.gold}</b></div>
          <div class="stat-row"><span>Tiempo de juego</span><b>${fmtTime(st.playtime)}</b></div>
        </div>
        <div class="stat-block">
          <h4>Atributos <span class="tag gold" style="margin-left:5px">${st.statPoints} puntos</span></h4>
          ${attrs.map(([k, label, desc]) => `<div class="attr-row"><span title="${desc}">${label}<br><small style="color:var(--muted-2);font-size:7.5px">${desc}</small></span><b>${st.stats[k]}</b><button class="plus" data-action="stat-plus" data-stat="${k}" ${st.statPoints > 0 ? '' : 'disabled'}>+</button></div>`).join('')}
          <div class="divider"></div>
          <h4>Registro de aventura</h4>
          <div class="stat-row"><span>Enemigos derrotados</span><b>${st.kills}</b></div>
          <div class="stat-row"><span>Criaturas capturadas</span><b>${st.captures}</b></div>
          <div class="stat-row"><span>Jefes derrotados</span><b>${st.bossKills}</b></div>
          <div class="stat-row"><span>Caídas</span><b>${st.deaths}</b></div>
          <div class="stat-row"><span>Criaturas en colección</span><b>${st.collection.length} / 10</b></div>
        </div>
      </div>`;
  }

  /* ---------------------------------------------------------------------- */
  /* Save slots                                                             */
  /* ---------------------------------------------------------------------- */
  renderSaveSlots(from = 'pause') {
    const slots = this.game.getSlots();
    const auto = this.game.getAutosave();
    const row = (slot, data, autoRow = false) => {
      const label = autoRow ? 'Autoguardado' : `Ranura ${slot}`;
      return `<div class="save-slot">
        <span class="slot-num">${autoRow ? 'A' : slot}</span>
        <span class="slot-info"><b>${data ? esc(data.name) + ` · Nv. ${data.level}` : 'Vacía'}</b><span>${data ? `${esc(ZONES[data.zone]?.name || '')} · ${fmtTime(data.playtime)} · ${new Date(data.date).toLocaleDateString()}` : 'Sin datos de partida'}</span></span>
        <span class="slot-actions">
          ${data ? `<button class="btn small ${from === 'title' ? 'primary' : ''}" data-action="load-game" data-slot="${autoRow ? 'auto' : slot}">${icon('play')} Cargar</button>` : ''}
          ${!autoRow && from === 'pause' ? `<button class="btn small ${data ? 'ghost' : 'primary'}" data-action="save-game" data-slot="${slot}">${icon('save')} ${data ? 'Sobrescribir' : 'Guardar'}</button>` : ''}
        </span>
      </div>`;
    };
    return `
      ${from === 'title' ? '<div class="row between" style="margin-bottom:12px"><div class="section-title" style="margin:0">Selecciona una partida</div><button class="btn ghost small" data-action="back-title">Volver</button></div>' : ''}
      <div class="save-list">
        ${row(1, slots[0])}
        ${row(2, slots[1])}
        ${row(3, slots[2])}
        ${auto ? row('auto', auto, true) : ''}
      </div>
      <div class="empty-note mt14" style="padding:12px">Los santuarios guardan automáticamente. También puedes guardar aquí en cualquier momento desde el menú de pausa.</div>`;
  }

  /* ---------------------------------------------------------------------- */
  /* Settings                                                               */
  /* ---------------------------------------------------------------------- */
  renderSettings(from = 'pause') {
    const s = this.game.settings;
    const slider = (key, label, desc) => `<div class="setting-row"><div class="s-label"><b>${label}</b><span>${desc}</span></div><div class="setting-control"><input type="range" min="0" max="100" value="${Math.round((s[key] ?? .5) * 100)}" data-setting="${key}"><span class="range-val">${Math.round((s[key] ?? .5) * 100)}</span></div></div>`;
    const toggle = (key, label, desc) => `<div class="setting-row"><div class="s-label"><b>${label}</b><span>${desc}</span></div><button class="toggle ${s[key] ? 'on' : ''}" data-action="toggle-setting" data-key="${key}" aria-label="${label}"></button></div>`;
    return `
      <div class="settings-list">
        ${slider('master', 'Volumen general', 'Afecta a todos los sonidos del juego.')}
        ${slider('music', 'Música', 'Puntuación procedural por región y combate.')}
        ${slider('sfx', 'Efectos', 'Golpes, magia, interfaz y criaturas.')}
        ${toggle('shake', 'Sacudida de pantalla', 'Vibración de cámara en impactos y jefes.')}
        ${toggle('damage', 'Números de daño', 'Muestra el daño infligido y recibido.')}
        ${toggle('hints', 'Ayudas de control', 'Muestra la barra de atajos en pantalla.')}
        <div class="setting-row"><div class="s-label"><b>Controles táctiles</b><span>Automático, siempre visibles u ocultos.</span></div><button class="select-like" data-action="cycle-touch">${s.touch === 'auto' ? 'Automático' : s.touch === 'on' ? 'Siempre' : 'Ocultos'}</button></div>
        <div class="setting-row"><div class="s-label"><b>Tamaño táctil</b><span>Ajusta joystick y botones.</span></div><button class="select-like" data-action="cycle-touch-size">${s.touchScale === 'compact' ? 'Compacto' : 'Normal'}</button></div>
        <div class="setting-row"><div class="s-label"><b>Mano táctil</b><span>Intercambia joystick y botones de lado.</span></div><button class="select-like" data-action="cycle-touch-hand">${s.touchHand === 'left' ? 'Izquierda' : 'Derecha'}</button></div>
        <div class="setting-row"><div class="s-label"><b>Inclinación</b><span>Usa el acelerómetro para moverte (móvil).</span></div><button class="toggle ${s.tilt ? 'on' : ''}" data-action="toggle-setting" data-key="tilt" aria-label="Inclinación"></button></div>
        <div class="setting-row"><div class="s-label"><b>Pantalla completa</b><span>Ideal para Android en horizontal.</span></div><button class="btn small" data-action="fullscreen">${icon('up')} Activar</button></div>
        <div class="setting-row"><div class="s-label"><b>Mando</b><span>${this.game.input.padConnected ? esc(this.game.input.padName) : 'Conecta un mando Bluetooth y pulsa un botón.'}</span></div><span class="pill">${this.game.input.padConnected ? 'Conectado' : 'Sin mando'}</span></div>
        <div class="setting-row"><div class="s-label"><b>Reiniciar progreso</b><span>Borra todas las partidas guardadas y ajustes.</span></div><button class="btn small danger" data-action="reset-save">${icon('trash')} Borrar todo</button></div>
      </div>
      ${from === 'title' ? '<div class="modal-actions" style="margin-top:16px"><button class="btn ghost" data-action="back-title">Volver al título</button></div>' : ''}
      <div class="empty-note mt14" style="padding:12px">En Android, gira el dispositivo a horizontal. En iOS, la pantalla completa y el audio se activan tras tu primer toque.</div>`;
  }

  showSettingsTitle() {
    this.screen(`
      <div style="width:min(680px,94vw);max-height:88vh;display:flex;flex-direction:column">
        <div class="panel-head" style="border:1px solid var(--line);border-radius:14px 14px 0 0"><div><div class="kicker">AJUSTES</div><h2>Preferencias</h2></div><button class="btn icon-only ghost small" data-action="back-title">${icon('close')}</button></div>
        <div class="panel-body" style="border:1px solid var(--line);border-top:0;border-radius:0 0 14px 14px;background:rgba(7,12,23,.92)">${this.renderSettings('title')}</div>
      </div>
    `, '');
    this.syncChrome();
  }

  /* ---------------------------------------------------------------------- */
  /* Shop                                                                   */
  /* ---------------------------------------------------------------------- */
  showShop(kind = 'mira') {
    this.shop = { kind, tab: 'buy' };
    this.renderShop();
    this.syncChrome();
  }

  renderShop() {
    if (!this.shop) return;
    const { kind, tab } = this.shop;
    const st = this.game.state;
    const isMira = kind === 'mira';
    const stock = isMira ? this.game.shopMira : this.game.shopTorin;
    const items = tab === 'buy'
      ? stock.map(id => ({ id, def: ITEMS[id], price: ITEMS[id].value }))
      : this.invList().filter(i => i.def.value > 0 && i.def.type !== 'key').map(i => ({ id: i.id, def: i.def, price: Math.max(1, Math.floor(i.def.value / 2)), qty: i.qty }));
    this.screen(`
      <div class="shop-shell">
        <header class="shop-head">
          <div class="shop-portrait">${isMira ? 'M' : 'T'}</div>
          <div><h3>${isMira ? 'Mira, la mercader' : 'Torin, el herrero'}</h3><p>${isMira ? '“Todo tiene un precio, incluso los milagros.”' : '“El acero recuerda cada golpe.”'}</p></div>
          <div class="shop-gold">${icon('coin')} ${st.gold}</div>
        </header>
        <div class="shop-tabs">
          <button class="shop-tab ${tab === 'buy' ? 'active' : ''}" data-action="shop-tab" data-tab="buy">Comprar</button>
          <button class="shop-tab ${tab === 'sell' ? 'active' : ''}" data-action="shop-tab" data-tab="sell">Vender</button>
          <button class="shop-tab" data-action="shop-craft" style="margin-left:auto">${icon('hammer')} Fabricar</button>
        </div>
        <div class="shop-body">
          <div class="shop-grid">
            ${items.length ? items.map(i => `<button class="shop-item" data-action="${tab === 'buy' ? 'buy' : 'sell'}" data-id="${i.id}">
              <span class="s-ico" style="color:${rarityColor(i.def.rarity)}">${icon(i.def.icon)}</span>
              <span class="s-info"><b>${esc(i.def.name)}</b><span>${tab === 'buy' ? esc(i.def.desc) : `Tienes ${i.qty}`}</span></span>
              <span class="price ${tab === 'buy' && st.gold < i.price ? 'cant' : ''}">${icon('coin')} ${i.price}</span>
            </button>`).join('') : '<div class="empty-note">No hay objetos en esta pestaña.</div>'}
          </div>
        </div>
        <footer class="shop-foot"><span>Compra con clic o toque. Vende a mitad de precio.</span><button class="btn ghost small" data-action="close-shop">Cerrar</button></footer>
      </div>
    `, 'shop-screen');
  }

  /* ---------------------------------------------------------------------- */
  /* Dialogue                                                               */
  /* ---------------------------------------------------------------------- */
  showDialogue(script) {
    this.dialogue = { script, line: 0, char: 0, typing: true, timer: null, text: '' };
    this.renderDialogue();
    this.startTyping();
    this.game.setMode('dialogue');
    this.syncChrome();
  }

  renderDialogue() {
    const d = this.dialogue;
    if (!d) return;
    const line = d.script.lines[d.line];
    if (!line) { this.closeDialogue(true); return; }
    const text = typeof line === 'string' ? line : line.text;
    const speaker = d.script.speaker || '???';
    const role = d.script.role || '';
    this.root.innerHTML = `
      <div class="dialogue-layer">
        <div class="dialogue-box" data-action="dialogue-advance">
          <div class="dialogue-portrait"><canvas id="dialoguePortrait" width="92" height="104"></canvas></div>
          <div class="dialogue-main">
            <div class="dialogue-name"><b>${esc(speaker)}</b><span>${esc(role)}</span></div>
            <p class="dialogue-text" id="dialogueText"></p>
            <div class="dialogue-choices" id="dialogueChoices"></div>
            <div class="dialogue-next" id="dialogueNext">Continuar <kbd>E</kbd></div>
          </div>
        </div>
      </div>`;
    this.dialogue.text = text;
    this.dialogue.char = 0;
    this.dialogue.typing = true;
    const next = document.getElementById('dialogueNext');
    if (next) next.style.visibility = 'hidden';
    requestAnimationFrame(() => {
      const cv = document.getElementById('dialoguePortrait');
      if (cv) drawPortrait(cv, d.script.appearance || { hair: 'largo', hairColor: 'nieve', skin: 'clara', outfit: 'violeta', eyes: 'violeta' }, { glow: d.script.glow });
    });
  }

  startTyping() {
    const d = this.dialogue;
    if (!d) return;
    clearInterval(d.timer);
    const el = document.getElementById('dialogueText');
    if (!el) return;
    el.innerHTML = '';
    d.typing = true;
    d.timer = setInterval(() => {
      if (!this.dialogue || this.dialogue !== d) { clearInterval(d.timer); return; }
      d.char += 2;
      const shown = d.text.slice(0, d.char);
      el.innerHTML = esc(shown) + (d.char < d.text.length ? '<span class="caret"></span>' : '');
      if (d.char >= d.text.length) {
        clearInterval(d.timer);
        d.typing = false;
        this.showDialogueChoices();
      }
    }, 18);
  }

  showDialogueChoices() {
    const d = this.dialogue;
    if (!d) return;
    const line = d.script.lines[d.line];
    const choices = typeof line === 'object' ? line.choices : null;
    const box = document.getElementById('dialogueChoices');
    const next = document.getElementById('dialogueNext');
    if (choices?.length && box) {
      box.innerHTML = choices.map((c, i) => `<button class="btn primary" data-action="dialogue-choice" data-index="${i}">${esc(c.label)}</button>`).join('');
      if (next) next.style.visibility = 'hidden';
    } else if (next) {
      next.style.visibility = 'visible';
    }
  }

  advanceDialogue() {
    const d = this.dialogue;
    if (!d) return;
    if (d.typing) {
      clearInterval(d.timer);
      d.char = d.text.length;
      d.typing = false;
      const el = document.getElementById('dialogueText');
      if (el) el.textContent = d.text;
      this.showDialogueChoices();
      return;
    }
    const line = d.script.lines[d.line];
    const choices = typeof line === 'object' ? line.choices : null;
    if (choices?.length) return;
    this.nextDialogueLine();
  }

  nextDialogueLine() {
    const d = this.dialogue;
    if (!d) return;
    d.line++;
    if (d.line >= d.script.lines.length) { this.closeDialogue(true); return; }
    this.renderDialogue();
    this.startTyping();
  }

  closeDialogue(runEnd = false) {
    const d = this.dialogue;
    if (!d) return;
    clearInterval(d.timer);
    this.dialogue = null;
    this.root.innerHTML = '';
    this.game.inputGuardUntil = performance.now() + 180;
    if (runEnd && typeof d.script.onEnd === 'function') {
      const fn = d.script.onEnd;
      d.script.onEnd = null;
      fn();
    } else {
      this.game.setMode('playing');
    }
    this.syncChrome();
  }

  /* ---------------------------------------------------------------------- */
  /* Modals                                                                 */
  /* ---------------------------------------------------------------------- */
  showModal({ title, text = '', actions = [] }) {
    this.modalRoot.classList.remove('hidden');
    this.modalRoot.innerHTML = `<div class="modal-card"><h3>${esc(title)}</h3><p>${esc(text)}</p><div class="modal-actions">${actions.map((a, i) => `<button class="btn ${a.style || 'ghost'}" data-action="modal-choice" data-index="${i}">${esc(a.label)}</button>`).join('')}</div></div>`;
    this.modalActions = actions;
  }

  showModalHTML(title, html) {
    this.modalRoot.classList.remove('hidden');
    this.modalRoot.innerHTML = `<div class="modal-card"><h3>${esc(title)}</h3>${html}</div>`;
    this.modalActions = null;
  }

  closeModal() {
    this.modalRoot.classList.add('hidden');
    this.modalRoot.innerHTML = '';
    this.modalActions = null;
  }

  /* ---------------------------------------------------------------------- */
  /* Quick panel                                                            */
  /* ---------------------------------------------------------------------- */
  showQuick() {
    if (document.getElementById('quickPanel')) return;
    const st = this.game.state;
    const el = document.createElement('div');
    el.id = 'quickPanel';
    el.className = 'quick-panel';
    el.innerHTML = `
      <h4>Acceso rápido</h4>
      <div class="quick-actions">
        <button class="btn" data-action="quick-potion">${icon('potion')} Poción <span class="muted2">×${st.inventory.potion_menor || 0}</span></button>
        <button class="btn" data-action="quick-ether">${icon('ether')} Éter <span class="muted2">×${st.inventory.ether || 0}</span></button>
        <button class="btn" data-action="open-tab" data-tab="creatures">${icon('creature')} Criaturas</button>
        <button class="btn" data-action="open-tab" data-tab="map">${icon('map')} Mapa</button>
        <button class="btn" data-action="open-tab" data-tab="quests">${icon('quest')} Misiones</button>
        <button class="btn" data-action="quick-close">${icon('close')} Cerrar</button>
      </div>`;
    document.getElementById('app').appendChild(el);
  }

  closeQuick() {
    document.getElementById('quickPanel')?.remove();
  }

  /* ---------------------------------------------------------------------- */
  /* HUD                                                                    */
  /* ---------------------------------------------------------------------- */
  initHUD() {
    const hud = document.getElementById('hud');
    if (!hud) return;
    hud.classList.remove('hidden');
    this.hud = {
      name: document.getElementById('charName'), level: document.getElementById('charLevel'),
      hpFill: document.getElementById('hpFill'), hpText: document.getElementById('hpText'),
      mpFill: document.getElementById('mpFill'), mpText: document.getElementById('mpText'),
      stFill: document.getElementById('stFill'), stText: document.getElementById('stText'),
      xpFill: document.getElementById('xpFill'), xpText: document.getElementById('xpText'),
      zone: document.getElementById('zoneName'), gold: document.getElementById('goldText'),
      questTitle: document.getElementById('questTitle'), questObj: document.getElementById('questObjective'),
      creatureOrb: document.getElementById('creatureOrb'), creatureName: document.getElementById('creatureName'),
      creatureAbility: document.getElementById('creatureAbility'), creatureCd: document.getElementById('creatureCdFill'),
      bossBar: document.getElementById('bossBar'), bossName: document.getElementById('bossName'),
      bossFill: document.getElementById('bossFill'), bossPhase: document.getElementById('bossPhase'),
      prompt: document.getElementById('interactPrompt'), hint: document.getElementById('hintBar'),
      portrait: document.getElementById('charPortrait'),
    };
    this.hud.portrait.innerHTML = '<canvas></canvas>';
    this.portraitFor = null;
    const cv = this.hud.portrait.querySelector('canvas');
    if (cv) { cv.style.width = '100%'; cv.style.height = '100%'; }
    this.updateHUD(true);
  }

  hideHUD() {
    document.getElementById('hud')?.classList.add('hidden');
  }

  updateHUD(force = false) {
    if (!this.hud || !this.game.state) return;
    const g = this.game, st = g.state, d = g.derived, h = this.hud;
    if (!h) return;
    const hpPct = Math.max(0, Math.min(100, st.hp / d.maxHp * 100));
    h.hpFill.style.width = `${hpPct}%`; h.hpText.textContent = `${Math.ceil(st.hp)} / ${d.maxHp}`;
    h.mpFill.style.width = `${Math.max(0, st.mp / d.maxMp * 100)}%`; h.mpText.textContent = `${Math.floor(st.mp)} / ${d.maxMp}`;
    h.stFill.style.width = `${Math.max(0, st.stamina / d.maxStamina * 100)}%`; h.stText.textContent = '';
    h.xpFill.style.width = `${Math.min(100, st.xp / Math.max(1, st.xpNext) * 100)}%`;
    h.xpText.textContent = `${st.xp} / ${st.xpNext} XP`;
    h.name.textContent = st.name; h.level.textContent = `Nv. ${st.level}`;
    h.zone.textContent = ZONES[st.zone]?.name || '';
    h.gold.textContent = st.gold;
    const q = g.getMainQuestTracker();
    h.questTitle.textContent = q.title; h.questObj.textContent = q.objective;
    const c = g.getActiveCreature();
    if (c) {
      const def = CREATURES[c.id], el = element(def.element);
      h.creatureOrb.style.setProperty('--orb', el.color);
      h.creatureName.textContent = g.creatureDisplayName(c);
      h.creatureAbility.textContent = `${def.abilityName} · Nv.${c.level}`;
      const cdMax = Math.max(1.2, 3.1 - c.level * .05);
      h.creatureCd.style.width = `${Math.max(0, Math.min(100, (1 - g.player.creatureCd / cdMax) * 100))}%`;
    } else {
      h.creatureOrb.style.setProperty('--orb', '#56627c');
      h.creatureName.textContent = 'Sin criatura'; h.creatureAbility.textContent = '—';
      h.creatureCd.style.width = '0%';
    }
    const boss = g.boss;
    if (boss && boss.alive) {
      h.bossBar.classList.remove('hidden');
      h.bossName.textContent = boss.def.name;
      h.bossFill.style.width = `${Math.max(0, boss.hp / boss.maxHp * 100)}%`;
      h.bossPhase.textContent = `FASE ${['I', 'II', 'III'][Math.min(2, boss.phase - 1)]}`;
    } else h.bossBar.classList.add('hidden');

    if (force || this.portraitFor !== st.appearance) {
      const cv = h.portrait.querySelector('canvas');
      if (cv) drawPortrait(cv, st.appearance, { time: g.time });
      this.portraitFor = { ...st.appearance };
    }
    const hints = g.input.lastInputType === 'gamepad'
      ? '<span><kbd>A</kbd> Atacar</span><span><kbd>B</kbd> Esquivar</span><span><kbd>X</kbd> Magia</span><span><kbd>Y</kbd> Interactuar</span><span><kbd>L/R</kbd> Cambiar</span><span><kbd>Start</kbd> Menú</span>'
      : g.input.lastInputType === 'touch'
        ? '<span>Joystick: mover</span><span>A: atacar</span><span>B: esquivar</span><span>X: magia</span><span>Y: interactuar</span>'
        : '<span><kbd>J</kbd> Atacar</span><span><kbd>K</kbd> Esquivar/Bloquear</span><span><kbd>L</kbd> Magia</span><span><kbd>E</kbd> Interactuar</span><span><kbd>Q</kbd> Arma</span><span><kbd>R</kbd> Criatura</span><span><kbd>Esc</kbd> Menú</span>';
    if (g.settings.hints) { h.hint.innerHTML = hints; h.hint.style.display = ''; } else h.hint.style.display = 'none';
  }

  setPrompt(label) {
    if (!this.hud) return;
    if (!label) { this.hud.prompt.classList.add('hidden'); this.promptText = ''; return; }
    if (label === this.promptText) return;
    this.promptText = label;
    const key = this.game.input.lastInputType === 'keyboard' ? 'E' : 'Y';
    this.hud.prompt.innerHTML = `<kbd>${key}</kbd><span>${esc(label)}</span>`;
    this.hud.prompt.classList.remove('hidden');
  }

  toast(text, kind = '') {
    const box = document.getElementById('toasts');
    if (!box) return;
    const el = document.createElement('div');
    el.className = `toast ${kind}`;
    const ic = kind === 'bad' ? 'close' : kind === 'good' ? 'check' : kind === 'gold' ? 'coin' : 'spark';
    el.innerHTML = `${icon(ic, 't-ico')}<span>${esc(text)}</span>`;
    box.appendChild(el);
    setTimeout(() => { el.classList.add('out'); setTimeout(() => el.remove(), 320); }, 2600);
    while (box.children.length > 5) box.firstElementChild.remove();
  }

  /* ---------------------------------------------------------------------- */
  /* Cinematics                                                             */
  /* ---------------------------------------------------------------------- */
  showGameOver(stats) {
    this.screen(`
      <div class="cinematic-screen" style="background:none;position:static;padding:0;display:flex;flex-direction:column;align-items:center;text-align:center;gap:12px;max-width:600px">
        <div style="font-size:40px;color:var(--rose)">✦</div>
        <h1>HAS CAÍDO</h1>
        <p>La luz parpadea, pero el vínculo no se rompe. Los santuarios guardan tu camino. Perderás una parte del oro, no tu historia.</p>
        <div class="cinematic-stats">
          <div><b>${stats.level}</b><span>Nivel</span></div>
          <div><b>${stats.kills}</b><span>Enemigos</span></div>
          <div><b>${stats.captures}</b><span>Capturas</span></div>
          <div><b>${stats.gold}</b><span>Oro</span></div>
        </div>
        <div class="row" style="margin-top:8px">
          <button class="btn primary" data-action="respawn">${icon('heart')} Reaparecer en el santuario</button>
          <button class="btn ghost" data-action="back-title-confirm">Volver al título</button>
        </div>
      </div>
    `, 'cinematic-screen');
    this.syncChrome();
  }

  showVictory(stats) {
    this.screen(`
      <div class="cinematic-screen" style="background:none;position:static;padding:0;display:flex;flex-direction:column;align-items:center;text-align:center;gap:12px;max-width:640px">
        <div style="font-size:46px;color:var(--gold)">✦</div>
        <h1>EL VACÍO HA CAÍDO</h1>
        <p>La Espada Celestial vuelve a brillar. Lumen respira, las criaturas cantan y las runas guardan silencio. Tu nombre será recordado en cada amanecer.</p>
        <div class="cinematic-stats">
          <div><b>${stats.level}</b><span>Nivel</span></div>
          <div><b>${stats.kills}</b><span>Enemigos</span></div>
          <div><b>${stats.captures}</b><span>Capturas</span></div>
          <div><b>${stats.bossKills}</b><span>Jefes</span></div>
          <div><b>${fmtTime(stats.playtime)}</b><span>Tiempo</span></div>
        </div>
        <div class="row" style="margin-top:8px">
          <button class="btn primary" data-action="victory-continue">${icon('play')} Seguir explorando</button>
          <button class="btn ghost" data-action="back-title-confirm">Volver al título</button>
        </div>
      </div>
    `, 'cinematic-screen');
    this.syncChrome();
  }

  showCredits() {
    this.screen(`
      <div class="credits-scroll">
        <h1>LA ESPADA CELESTIAL</h1>
        <h2>RPG Retro · Edición del Alba</h2>
        <div class="credits-block"><b>Diseño y programación</b><span>Estudio Lumen · un juego original construido con Canvas 2D y WebAudio.</span></div>
        <div class="credits-block"><b>Dirección de arte</b><span>Arte procedural original: personajes, criaturas, escenarios, partículas e iluminación dibujados en tiempo real.</span></div>
        <div class="credits-block"><b>Música y sonido</b><span>Puntuación generativa sintetizada con WebAudio. Sin archivos de audio externos.</span></div>
        <div class="credits-block"><b>Motores</b><span>HTML5 Canvas · WebAudio · Gamepad API · Pointer Events · localStorage</span></div>
        <div class="credits-block"><b>Compatibilidad</b><span>Android horizontal, navegadores móviles, PC y mandos Bluetooth. El audio requiere un primer toque.</span></div>
        <div class="credits-block"><b>Gracias</b><span>A cada portador que se atreva a cruzar el bosque.</span></div>
        <button class="btn primary" data-action="back-title">${icon('arrow')} Volver al título</button>
      </div>
    `, '');
    this.syncChrome();
  }

  /* ---------------------------------------------------------------------- */
  /* Chrome / touch                                                         */
  /* ---------------------------------------------------------------------- */
  syncChrome() {
    const g = this.game;
    const playing = g.mode === 'playing';
    const hud = document.getElementById('hud');
    if (hud) hud.classList.toggle('hidden', !playing);
    const touch = document.getElementById('touchControls');
    if (touch) {
      const coarse = matchMedia('(pointer: coarse)').matches || navigator.maxTouchPoints > 0;
      const want = g.settings.touch === 'on' || (g.settings.touch === 'auto' && coarse);
      touch.classList.toggle('hidden', !playing || !want || g.quickOpen);
      touch.classList.toggle('compact', g.settings.touchScale === 'compact');
    }
    if (playing) {
      this.initHUD();
      this.updateHUD(true);
    } else {
      this.hideHUD();
      this.setPrompt(null);
    }
  }

  /* ---------------------------------------------------------------------- */
  /* Events                                                                 */
  /* ---------------------------------------------------------------------- */
  _onInput(e) {
    const t = e.target;
    if (t.id === 'createName') {
      this.creation.name = t.value.slice(0, 16);
      const nm = document.getElementById('createPreviewName');
      if (nm) nm.textContent = this.creation.name || 'Astra';
      return;
    }
    if (t.dataset?.setting) {
      const key = t.dataset.setting;
      const v = Number(t.value) / 100;
      this.game.setSetting(key, v);
      const val = t.parentElement?.querySelector('.range-val');
      if (val) val.textContent = Math.round(v * 100);
    }
  }

  _onClick(e) {
    const el = e.target.closest('[data-action]');
    if (!el) return;
    const action = el.dataset.action;
    const g = this.game;
    g.audio.sfx('ui');
    if (action === 'dialogue-advance') { this.advanceDialogue(); return; }
    if (action === 'dialogue-choice') {
      const d = this.dialogue;
      if (!d) return;
      const line = d.script.lines[d.line];
      const choice = typeof line === 'object' ? line.choices?.[Number(el.dataset.index)] : null;
      if (!choice) return;
      this.closeDialogue(false);
      choice.action?.();
      return;
    }
    if (action === 'modal-choice') {
      const fn = this.modalActions?.[Number(el.dataset.index)]?.action;
      this.closeModal();
      fn?.();
      return;
    }
    if (action === 'close-modal') { this.closeModal(); return; }

    // Creation
    if (action === 'new-game') { g.audio.sfx('confirm'); this.showCreation(); return; }
    if (action === 'back-title') { g.toTitle(); return; }
    if (action === 'create-choice') {
      const group = el.dataset.group, value = el.dataset.value;
      if (group === 'starter') this.creation.starter = Number(value);
      else this.creation.appearance[group] = value;
      this.showCreation();
      return;
    }
    if (action === 'start-adventure') {
      if (!this.creation.name.trim()) this.creation.name = 'Astra';
      g.newGame(this.creation);
      return;
    }

    // Title
    if (action === 'continue') { g.continueGame(); return; }
    if (action === 'load') { g.openLoadScreen(); return; }
    if (action === 'settings-title') { g.audio.sfx('menu'); this.showSettingsTitle(); return; }
    if (action === 'credits') { g.audio.sfx('menu'); this.showCredits(); return; }

    // Pause / tabs
    if (action === 'resume') { g.closePause(); return; }
    if (action === 'open-tab') {
      this.closeQuick();
      g.openPause(el.dataset.tab);
      return;
    }
    if (action === 'back-title-confirm') { g.confirmTitle(); return; }
    if (action === 'save-game') { g.saveGame(Number(el.dataset.slot)); this.showPause('save'); return; }
    if (action === 'load-game') { g.loadGame(el.dataset.slot); return; }

    // Inventory / equipment
    if (action === 'select-item') { this.selectedItem = el.dataset.id; this.showPause('inventory'); return; }
    if (action === 'use-item') { g.useItem(el.dataset.id); this.showPause('inventory'); return; }
    if (action === 'equip-item') { g.equipItem(el.dataset.id); this.showPause('inventory'); return; }
    if (action === 'open-equip-picker') { this.openEquipPicker(el.dataset.slot); return; }
    if (action === 'equip-pick') { this.closeModal(); g.equipItem(el.dataset.id); this.showPause('equipment'); return; }
    if (action === 'unequip-slot') { this.closeModal(); g.unequip(el.dataset.slot); this.showPause('equipment'); return; }

    // Skills
    if (action === 'unlock-skill') { g.unlockSkill(el.dataset.id); this.showPause('skills'); return; }
    if (action === 'set-skill') { g.setActiveSkill(el.dataset.id); this.showPause('skills'); return; }

    // Map
    if (action === 'map-zone') { this.mapZone = el.dataset.zone; this.showPause('map'); return; }

    // Creatures
    if (action === 'select-creature') { this.selectedCreature = Number(el.dataset.index); this.showPause('creatures'); return; }
    if (action === 'activate-creature') { g.setActiveCreature(Number(el.dataset.index)); this.showPause('creatures'); return; }
    if (action === 'train-creature') { g.trainCreature(Number(el.dataset.index)); this.showPause('creatures'); return; }
    if (action === 'feed-creature') { g.feedCreature(Number(el.dataset.index)); this.showPause('creatures'); return; }
    if (action === 'evolve-creature') { g.evolveCreature(Number(el.dataset.index)); this.showPause('creatures'); return; }
    if (action === 'charm-creature') { this.openCharmPicker(Number(el.dataset.index)); return; }
    if (action === 'charm-pick') { this.closeModal(); g.equipCharm(Number(el.dataset.index), el.dataset.id); this.showPause('creatures'); return; }
    if (action === 'uncharm-creature') { g.unequipCharm(Number(el.dataset.index)); this.showPause('creatures'); return; }

    // Crafting
    if (action === 'select-recipe') { this.selectedRecipe = el.dataset.id; this.showPause('crafting'); return; }
    if (action === 'craft') { g.craft(el.dataset.id); this.showPause('crafting'); return; }

    // Stats
    if (action === 'stat-plus') { g.addStat(el.dataset.stat); this.showPause('stats'); return; }

    // Settings
    if (action === 'toggle-setting') { g.setSetting(el.dataset.key, !g.settings[el.dataset.key]); this.refreshSettings(); return; }
    if (action === 'cycle-touch') { g.setSetting('touch', g.settings.touch === 'auto' ? 'on' : g.settings.touch === 'on' ? 'off' : 'auto'); this.refreshSettings(); return; }
    if (action === 'cycle-touch-size') { g.setSetting('touchScale', g.settings.touchScale === 'compact' ? 'normal' : 'compact'); this.refreshSettings(); return; }
    if (action === 'cycle-touch-hand') { g.setSetting('touchHand', g.settings.touchHand === 'left' ? 'right' : 'left'); this.refreshSettings(); return; }
    if (action === 'fullscreen') { g.toggleFullscreen(); return; }
    if (action === 'reset-save') {
      this.showModal({ title: '¿Borrar todo el progreso?', text: 'Se eliminarán las tres ranuras, el autoguardado y los ajustes. Esta acción no se puede deshacer.', actions: [
        { label: 'Cancelar', style: 'ghost' },
        { label: 'Borrar todo', style: 'danger', action: () => { g.resetAll(); this.showTitle(); } },
      ] });
      return;
    }

    // Shop
    if (action === 'shop-tab') { this.shop.tab = el.dataset.tab; this.renderShop(); return; }
    if (action === 'buy') { g.buyItem(el.dataset.id); this.renderShop(); return; }
    if (action === 'sell') { g.sellItem(el.dataset.id); this.renderShop(); return; }
    if (action === 'close-shop') { g.closeShop(); return; }
    if (action === 'shop-craft') { g.closeShop(); g.openPause('crafting'); return; }

    // Quick
    if (action === 'quick-potion') { g.useItem('potion_menor'); this.showQuickRefresh(); return; }
    if (action === 'quick-ether') { g.useItem('ether'); this.showQuickRefresh(); return; }
    if (action === 'quick-close') { g.closeQuick(); return; }

    // Game over / victory
    if (action === 'respawn') { g.respawn(); return; }
    if (action === 'victory-continue') { g.victoryContinue(); return; }
  }

  refreshSettings() {
    if (this.game.mode === 'paused') this.showPause('settings');
    else this.showSettingsTitle();
  }

  showQuickRefresh() {
    this.closeQuick();
    this.showQuick();
  }
}
