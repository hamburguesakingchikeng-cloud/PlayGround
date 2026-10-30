// Pantallas del juego: inventario, equipo, habilidades, mapas, criaturas, etc.
import {
  AFFINITIES, ITEMS, SKILLS, CREATURES, CREATURE_SKILLS, RARITIES, QUESTS,
  RECIPES, ZONES, ZONE_ORDER, SHOP_STOCK, NPCS, CLASSES,
} from './data.js';
import { icon, affinityGlyphChar } from './icons.js';
import { formatPlayTime } from './save.js';

const ATTR_LABELS = {
  vida: ['Vida', 'Puntos de vida máximos'],
  mana: ['Maná', 'Energía para habilidades'],
  res: ['Resistencia', 'Aguante para atacar y bloquear'],
  str: ['Fuerza', 'Daño de arma y golpes'],
  def: ['Defensa', 'Reduce el daño recibido'],
  spd: ['Velocidad', 'Rapidez de movimiento'],
  int: ['Inteligencia', 'Poder mágico y maná'],
  luck: ['Suerte', 'Críticos y capturas'],
};

const TYPE_LABELS = {
  weapon: 'Arma', shield: 'Escudo', armor: 'Armadura', accessory: 'Accesorio',
  consumable: 'Consumible', material: 'Material', food: 'Alimento', seal: 'Sello',
  charm: 'Amuleto de criatura', key: 'Objeto clave',
};

const SLOT_LABELS = { weapon: 'Arma', offhand: 'Mano secundaria', armor: 'Armadura', accessory: 'Accesorio' };

function esc(str) {
  return String(str ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

export function shell(title, subtitle, body, opts = {}) {
  return `
    <section class="screen">
      <header class="screen-head">
        <div class="screen-title">
          <span class="crest">${icon(opts.icon || 'sparkle', { size: 26 })}</span>
          <div><h2>${esc(title)}</h2><p>${esc(subtitle || '')}</p></div>
        </div>
        <div class="screen-head-actions">
          ${opts.right || ''}
          <button class="btn ghost" data-act="back">${icon('arrow')} Volver</button>
        </div>
      </header>
      <div class="screen-body">${body}</div>
    </section>`;
}

function emptyState(iconName, title, text) {
  return `<div class="empty-state"><div class="empty-icon">${icon(iconName, { size: 42 })}</div><h3>${esc(title)}</h3><p>${esc(text)}</p></div>`;
}

function goldPill(ui) {
  return `<span class="gold-pill">${icon('coin')} <b>${ui.game.state.player.gold}</b> oro</span>`;
}

function itemType(item) {
  return TYPE_LABELS[item.type] || item.type;
}

function statBits(item) {
  const bits = [];
  if (item.dmg) bits.push(`${item.dmg} daño`);
  if (item.def) bits.push(`${item.def} def.`);
  if (item.hp) bits.push(`+${item.hp} vida`);
  if (item.mp) bits.push(`+${item.mp} maná`);
  if (item.str) bits.push(`+${item.str} fuerza`);
  if (item.int) bits.push(`+${item.int} int.`);
  if (item.luck) bits.push(`+${item.luck} suerte`);
  if (item.block) bits.push(`${Math.round(item.block * 100)}% bloqueo`);
  if (item.reach) bits.push(`alcance ${item.reach}`);
  return bits;
}

function itemRow(ui, id, qty, actions) {
  const item = ITEMS[id];
  if (!item) return '';
  const rar = RARITIES[item.rarity] || RARITIES.comun;
  return `
    <article class="item-row" style="--rar:${rar.color}">
      <div class="item-icon" style="--item-color:${item.color || rar.color}">${icon(item.icon || 'star', { size: 24 })}</div>
      <div class="item-main">
        <div class="item-name">${esc(item.name)} ${qty ? `<span class="qty">×${qty}</span>` : ''}</div>
        <div class="item-meta"><span style="color:${rar.color}">${rar.name}</span> · ${itemType(item)}${statBits(item).length ? ` · ${statBits(item).join(' · ')}` : ''}</div>
        <p>${esc(item.desc || '')}</p>
      </div>
      <div class="item-actions">${actions}</div>
    </article>`;
}

// ───────────────────────── Inventario ─────────────────────────
export function renderInventory(ui) {
  const { game } = ui;
  const p = game.state.player;
  const filter = ui.invFilter || 'todo';
  const filters = [
    ['todo', 'Todo'], ['consumable', 'Consumibles'], ['equip', 'Equipo'],
    ['material', 'Materiales'], ['food', 'Alimentos'], ['seal', 'Sellos'], ['key', 'Clave'],
  ];
  const entries = Object.entries(p.inventory).filter(([id, qty]) => {
    if (!qty || !ITEMS[id]) return false;
    if (filter === 'todo') return true;
    if (filter === 'equip') return ['weapon', 'shield', 'armor', 'accessory', 'charm'].includes(ITEMS[id].type);
    return ITEMS[id].type === filter;
  }).sort((a, b) => {
    const order = { weapon: 0, shield: 1, armor: 2, accessory: 3, consumable: 4, seal: 5, food: 6, charm: 7, material: 8, key: 9 };
    const ia = ITEMS[a[0]], ib = ITEMS[b[0]];
    return (order[ia.type] ?? 9) - (order[ib.type] ?? 9) || ia.name.localeCompare(ib.name);
  });

  const rows = entries.map(([id, qty]) => {
    const item = ITEMS[id];
    let action = '';
    if (['weapon', 'shield', 'armor', 'accessory'].includes(item.type)) {
      const equipped = Object.values(p.equipment).includes(id);
      action = equipped
        ? `<span class="badge equipped">${icon('check')} Equipado</span>`
        : `<button class="btn small" data-act="equip-item" data-item="${id}">${icon('armor', { size: 16 })} Equipar</button>`;
    } else if (item.type === 'consumable') {
      action = `<button class="btn small" data-act="use-item" data-item="${id}">${icon('potion', { size: 16 })} Usar</button>`;
    } else if (item.type === 'food') {
      action = `<button class="btn small ghost" data-act="use-item" data-item="${id}">${icon('creature', { size: 16 })} Ver uso</button>`;
    } else if (item.type === 'charm') {
      action = `<button class="btn small ghost" data-act="use-item" data-item="${id}">${icon('charm', { size: 16 })} Ver uso</button>`;
    } else if (item.type === 'seal') {
      action = `<span class="badge">${icon('seal', { size: 14 })} Se usa al sellar</span>`;
    } else if (item.type === 'key') {
      action = `<button class="btn small ghost" data-act="use-item" data-item="${id}">${icon('map', { size: 16 })} Leer</button>`;
    } else {
      action = `<span class="badge">${qty} unidad${qty === 1 ? '' : 'es'}</span>`;
    }
    return itemRow(ui, id, qty, action);
  }).join('');

  const weight = Object.values(p.inventory).reduce((a, b) => a + b, 0);
  const body = `
    <div class="toolbar">
      <div class="chips">${filters.map(([id, label]) => `<button class="chip ${filter === id ? 'active' : ''}" data-act="inv-filter" data-filter="${id}">${label}</button>`).join('')}</div>
      <div class="toolbar-info">${icon('chest', { size: 16 })} ${weight} objetos · ${goldPill(ui)}</div>
    </div>
    <div class="list-stack">${rows || emptyState('chest', 'Inventario vacío', 'Abre cofres, derrota enemigos o compra en la aldea para conseguir objetos.')}</div>
  `;
  return shell('Inventario', 'Todo lo que cargas, ordenado por tipo.', body, { icon: 'chest' });
}

// ───────────────────────── Equipo ─────────────────────────
export function renderEquipment(ui) {
  const { game } = ui;
  const p = game.state.player;
  const pl = game.player;
  const slots = ['weapon', 'offhand', 'armor', 'accessory'].map((slot) => {
    const id = p.equipment[slot];
    const item = id ? ITEMS[id] : null;
    return `
      <article class="equip-slot ${item ? '' : 'empty'}" style="--rar:${item ? (RARITIES[item.rarity]?.color || '#b7c3d8') : '#5a6780'}">
        <div class="slot-label">${SLOT_LABELS[slot]}</div>
        <div class="slot-icon">${item ? icon(item.icon || 'star', { size: 32 }) : icon('lock', { size: 28 })}</div>
        <div class="slot-info">
          <b>${item ? esc(item.name) : 'Vacío'}</b>
          <span>${item ? esc(item.desc) : 'Nada equipado en este espacio.'}</span>
          ${item ? `<small>${statBits(item).join(' · ') || itemType(item)}</small>` : ''}
        </div>
        ${item && slot !== 'weapon' ? `<button class="icon-btn" title="Desequipar" data-act="unequip" data-slot="${slot}">${icon('close', { size: 16 })}</button>` : ''}
      </article>`;
  }).join('');

  const available = Object.entries(p.inventory)
    .filter(([id, qty]) => qty > 0 && ITEMS[id] && ['weapon', 'shield', 'armor', 'accessory'].includes(ITEMS[id].type))
    .filter(([id]) => !Object.values(p.equipment).includes(id))
    .sort((a, b) => (ITEMS[a[0]].slot || '').localeCompare(ITEMS[b[0]].slot || '') || ITEMS[a[0]].name.localeCompare(ITEMS[b[0]].name));

  const stats = pl ? [
    ['Ataque', pl.attack], ['Defensa', pl.defense], ['Vida', pl.maxHp], ['Maná', pl.maxMp],
    ['Resistencia', pl.maxStamina], ['Velocidad', Math.round(pl.speedBase)],
    ['Crítico', `${Math.round((pl.critChance || 0) * 100)}%`], ['Suerte', pl.luck],
  ] : [];
  const body = `
    <div class="two-col equip-layout">
      <div>
        <h3 class="section-label">Espacios equipados</h3>
        <div class="equip-grid">${slots}</div>
        <div class="hint-card">${icon('sparkle', { size: 18 })} La apariencia de tu personaje cambia con el arma, la armadura y el escudo equipados.</div>
      </div>
      <div>
        <div class="panel">
          <h3 class="section-label">Atributos de combate</h3>
          <div class="stat-grid">${stats.map(([label, val]) => `<div class="stat-cell"><span>${label}</span><b>${val}</b></div>`).join('')}</div>
        </div>
        <h3 class="section-label">Equipo disponible</h3>
        <div class="list-stack compact">
          ${available.length ? available.map(([id]) => itemRow(ui, id, 0, `<button class="btn small" data-act="equip-item" data-item="${id}">${icon('check', { size: 16 })} Equipar</button>`)).join('') : emptyState('armor', 'Sin alternativas', 'Compra, encuentra o forja equipo para cambiar tu estilo de combate.')}
        </div>
      </div>
    </div>
    <div class="toolbar toolbar-bottom"><span>${goldPill(ui)}</span><span class="muted">Arma: ${esc(ITEMS[p.equipment.weapon]?.name || '—')} · Escudo: ${esc(ITEMS[p.equipment.offhand]?.name || '—')}</span></div>
  `;
  return shell('Equipo', 'Cada pieza cambia tus números y tu silueta.', body, { icon: 'armor' });
}

// ───────────────────────── Habilidades ─────────────────────────
export function renderSkills(ui) {
  const { game } = ui;
  const p = game.state.player;
  const list = Object.keys(SKILLS).sort((a, b) => SKILLS[a].level - SKILLS[b].level);
  const cards = list.map((id) => {
    const s = SKILLS[id];
    const unlocked = p.unlockedSkills.includes(id) || s.level <= p.level;
    const active = p.activeSkill === id;
    const cd = game.skillCds[id] || 0;
    const aff = AFFINITIES[s.element] || AFFINITIES.luz;
    return `
      <article class="skill-card ${active ? 'active' : ''} ${unlocked ? '' : 'locked'}" style="--aff:${aff.color}">
        <div class="skill-top">
          <span class="skill-icon">${icon(s.icon || 'sparkle', { size: 26 })}</span>
          <div><b>${esc(s.name)}</b><small>${esc(aff.name)} · Nivel ${s.level}</small></div>
          ${active ? `<span class="badge equipped">${icon('check')} Activa</span>` : unlocked ? `<button class="btn small ghost" data-act="activate-skill" data-skill="${id}">Activar</button>` : `<span class="badge locked">${icon('lock', { size: 13 })} Nv. ${s.level}</span>`}
        </div>
        <p>${esc(s.desc)}</p>
        <div class="skill-foot">
          <span>${icon('sparkle', { size: 14 })} ${s.cost} maná</span>
          <span>${icon('keyboard', { size: 14 })} ${s.cd}s recarga</span>
          ${cd > 0 ? `<span class="cooldown">⏳ ${cd.toFixed(1)}s</span>` : ''}
        </div>
      </article>`;
  }).join('');
  const body = `
    <div class="hint-card">${icon('keyboard', { size: 18 })} Pulsa <kbd>X</kbd> para lanzar la habilidad activa. Las habilidades se desbloquean al subir de nivel.</div>
    <div class="skill-grid">${cards}</div>
  `;
  return shell('Habilidades', 'Elige el eco de la Espada que responderá a tu llamada.', body, { icon: 'sparkle' });
}

// ───────────────────────── Mapa ─────────────────────────
export function renderMap(ui) {
  const { game } = ui;
  const w = game.world;
  const p = game.player;
  if (!w || !p) return shell('Mapa', 'Sin mapa disponible.', emptyState('map', 'Sin exploración', 'Carga una partida para ver el mapa.'), { icon: 'map' });
  const markers = w.mapMarkers(game.state)
    .map((m) => ({ ...m, d: Math.hypot(m.x - p.x, m.y - p.y) }))
    .sort((a, b) => a.d - b.d)
    .slice(0, 16);
  const glyphs = { portal: '▲', chest: '◆', shrine: '✦', npc: '●', boss: '☠', altar: '✧', secret: '❖', poi: '·' };
  const body = `
    <div class="map-layout">
      <div class="map-panel">
        <canvas id="world-map" class="world-map"></canvas>
      </div>
      <aside class="map-side">
        <div class="panel">
          <div class="zone-kicker">Zona actual</div>
          <h3>${esc(w.meta.name)}</h3>
          <p class="muted">${esc(w.meta.subtitle)}</p>
          <div class="map-meta"><span>${icon('skull', { size: 15 })} ${esc(w.meta.danger)}</span><span>${icon('map', { size: 15 })} ${w.w} × ${w.h}</span></div>
          <p class="prose">${esc(w.meta.desc)}</p>
        </div>
        <div class="panel">
          <h3 class="section-label">Marcadores cercanos</h3>
          <div class="marker-list">
            ${markers.map((m) => `
              <div class="marker-row marker-${m.type}">
                <span class="marker-glyph">${glyphs[m.type] || '·'}</span>
                <span class="marker-label">${esc(m.label || m.type)}</span>
                <span class="marker-dist">${Math.round(m.d)} m</span>
              </div>`).join('') || '<p class="muted">No hay marcadores en esta zona.</p>'}
          </div>
        </div>
        <div class="panel">
          <h3 class="section-label">Zonas descubiertas</h3>
          <div class="zone-list">
            ${ZONE_ORDER.map((id) => {
              const visited = game.state.world.visitedZones.includes(id);
              return `<div class="zone-row ${id === game.state.zoneId ? 'current' : ''} ${visited ? '' : 'locked'}">
                <span>${visited ? icon('map', { size: 16 }) : icon('lock', { size: 16 })}</span>
                <div><b>${visited ? esc(ZONES[id].name) : 'Zona desconocida'}</b><small>${visited ? esc(ZONES[id].subtitle) : 'Explora para descubrirla'}</small></div>
                ${id === game.state.zoneId ? '<span class="badge equipped">Aquí</span>' : ''}
              </div>`;
            }).join('')}
          </div>
        </div>
      </aside>
    </div>
  `;
  return shell('Mapa', 'Lo que la Espada ha visto hasta ahora.', body, { icon: 'map' });
}

// ───────────────────────── Misiones ─────────────────────────
export function renderQuests(ui) {
  const { game } = ui;
  const qs = game.state.quests;
  const order = Object.keys(QUESTS).sort((a, b) => {
    const sa = qs[a].status === 'active' ? 0 : qs[a].status === 'complete' ? 2 : 1;
    const sb = qs[b].status === 'active' ? 0 : qs[b].status === 'complete' ? 2 : 1;
    return sa - sb || (QUESTS[a].type === 'main' ? -1 : 1);
  });
  const cards = order.map((id) => {
    const def = QUESTS[id];
    const q = qs[id];
    const done = q.status === 'complete';
    const active = q.status === 'active';
    const steps = def.steps.map((s, i) => {
      const state = done ? 'done' : i < q.step ? 'done' : i === q.step ? 'current' : 'pending';
      return `<li class="quest-step ${state}"><span class="step-dot">${state === 'done' ? '✓' : state === 'current' ? '◆' : '·'}</span>${esc(s.text)}</li>`;
    }).join('');
    const rewards = [];
    if (def.rewards?.gold) rewards.push(`${def.rewards.gold} oro`);
    for (const [it, qty] of Object.entries(def.rewards?.items || {})) rewards.push(`${ITEMS[it]?.name || it} ×${qty}`);
    if (def.rewards?.xp) rewards.push(`${def.rewards.xp} XP`);
    return `
      <article class="quest-card ${active ? 'active' : ''} ${done ? 'done' : ''}" style="--quest:${def.type === 'main' ? '#ffe49b' : '#8ce7ff'}">
        <div class="quest-head">
          <div>
            <span class="quest-type">${def.type === 'main' ? 'Misión principal' : 'Encargo secundario'}</span>
            <h3>${esc(def.title)}</h3>
          </div>
          <span class="quest-status ${done ? 'done' : active ? 'active' : 'locked'}">${done ? 'Completada' : active ? 'En curso' : 'Sin aceptar'}</span>
        </div>
        <p class="quest-desc">${esc(def.desc)}</p>
        <div class="quest-giver">${icon('quest', { size: 15 })} ${esc(def.giver)}</div>
        <ol class="quest-steps">${steps}</ol>
        <div class="quest-rewards"><span>Recompensas:</span> ${rewards.map((r) => `<b>${esc(r)}</b>`).join(' · ')}</div>
        ${!active && !done ? `<div class="quest-hint">Habla con ${esc(def.giver)} para aceptar este encargo.</div>` : ''}
      </article>`;
  }).join('');
  const activeCount = Object.values(qs).filter((q) => q.status === 'active').length;
  const doneCount = Object.values(qs).filter((q) => q.status === 'complete').length;
  const body = `
    <div class="toolbar"><span class="muted">${activeCount} misiones en curso · ${doneCount} completadas</span><span>${goldPill(ui)}</span></div>
    <div class="quest-grid">${cards}</div>
  `;
  return shell('Misiones', 'Promesas, encargos y el destino de Aetheria.', body, { icon: 'quest' });
}

// ───────────────────────── Criaturas ─────────────────────────
export function renderCreatures(ui) {
  const { game } = ui;
  const list = game.state.player.creatures;
  if (!list.length) {
    return shell('Criaturas', 'Nadie camina aún a tu lado.', `
      ${emptyState('creature', 'Sin criaturas', 'Debilita a una criatura salvaje por debajo del 45% de su vida y pulsa Y para ofrecerle un sello de luz.')}
      <div class="hint-card">${icon('seal', { size: 18 })} Compra sellos a Mira en la aldea. La Suerte y el estado de la criatura mejoran la probabilidad de captura.</div>
    `, { icon: 'creature' });
  }
  const idx = Math.min(list.length - 1, Math.max(0, ui.creatureIndex || 0));
  const c = list[idx];
  const sp = CREATURES[c.species];
  const aff = AFFINITIES[sp.affinity];
  const active = game.state.player.activeCreature === idx;
  const mounted = active && game.player?.mounted;
  const charm = c.charm ? ITEMS[c.charm] : null;
  const skill = CREATURE_SKILLS[sp.skill];
  const canEvolve = sp.evolvesTo && c.level >= sp.evolveLevel;
  const nextSp = sp.evolvesTo ? CREATURES[sp.evolvesTo] : null;
  const bonds = Math.round(c.bond || 0);
  const xpPct = Math.max(0, Math.min(100, (c.xp / Math.max(1, c.xpNext)) * 100));
  const stats = [
    ['Vida', Math.round(sp.base.hp * (1 + (c.level - 1) * 0.18))],
    ['Ataque', Math.round(sp.base.atk * (1 + (c.level - 1) * 0.16) + (charm?.atk || 0))],
    ['Defensa', Math.round(sp.base.def * (1 + (c.level - 1) * 0.14) + (charm?.def || 0))],
    ['Velocidad', sp.base.spd],
  ];

  const foodItems = Object.entries(game.state.player.inventory).filter(([id, q]) => q > 0 && ITEMS[id]?.type === 'food');
  const charmItems = Object.entries(game.state.player.inventory).filter(([id, q]) => q > 0 && ITEMS[id]?.type === 'charm');
  let picker = '';
  if (ui.creaturePicker === 'food') {
    picker = `<div class="picker-panel"><div class="picker-head"><b>Alimentar a ${esc(sp.name)}</b><button class="icon-btn" data-act="close-picker">${icon('close', { size: 16 })}</button></div>
      ${foodItems.length ? foodItems.map(([id, qty]) => `<button class="picker-row" data-act="creature-feed" data-item="${id}"><span>${icon('food', { size: 18 })} ${esc(ITEMS[id].name)} ×${qty}</span><small>${esc(ITEMS[id].desc)}</small></button>`).join('') : '<p class="muted">No tienes comida. Compra carne asada o bayas a Mira.</p>'}
    </div>`;
  } else if (ui.creaturePicker === 'charm') {
    picker = `<div class="picker-panel"><div class="picker-head"><b>Amuleto de ${esc(sp.name)}</b><button class="icon-btn" data-act="close-picker">${icon('close', { size: 16 })}</button></div>
      ${charm ? `<button class="picker-row" data-act="creature-charm" data-item=""><span>${icon('close', { size: 18 })} Quitar ${esc(charm.name)}</span><small>Volverá al inventario.</small></button>` : ''}
      ${charmItems.length ? charmItems.map(([id, qty]) => `<button class="picker-row" data-act="creature-charm" data-item="${id}"><span>${icon('charm', { size: 18 })} ${esc(ITEMS[id].name)} ×${qty}</span><small>${esc(ITEMS[id].desc)}</small></button>`).join('') : (!charm ? '<p class="muted">No tienes amuletos de criatura. Rurik vende uno y la forja puede crear otros.</p>' : '')}
    </div>`;
  }

  const body = `
    <div class="creature-layout">
      <aside class="creature-rail">
        ${list.map((cc, i) => {
          const cs = CREATURES[cc.species];
          const ca = AFFINITIES[cs.affinity];
          return `<button class="creature-tab ${i === idx ? 'active' : ''}" data-act="creature-select" data-index="${i}" style="--aff:${ca.color}">
            <span class="creature-dot"></span>
            <span><b>${esc(cs.name)}</b><small>Nv. ${cc.level} · ${ca.name}</small></span>
            ${game.state.player.activeCreature === i ? '<span class="active-mark">✦</span>' : ''}
          </button>`;
        }).join('')}
      </aside>
      <div class="creature-main">
        <div class="creature-hero" style="--aff:${aff.color}">
          <div class="creature-art"><canvas id="creature-portrait" data-species="${c.species}" width="180" height="180"></canvas></div>
          <div class="creature-title">
            <span class="affinity-chip">${affinityGlyphChar(sp.affinity)} ${esc(aff.name)}</span>
            <h3>${esc(c.nickname || sp.name)}</h3>
            <p>${esc(sp.lore)}</p>
            <div class="creature-level">Nivel ${c.level} · ${sp.rarity} ${active ? '· Compañera activa' : ''}</div>
          </div>
        </div>
        <div class="creature-bars">
          <div class="mini-bar"><span>Vínculo</span><div class="bar small"><i style="width:${bonds}%;background:linear-gradient(90deg,#ff9ab5,#ffe49b)"></i></div><b>${bonds}%</b></div>
          <div class="mini-bar"><span>Experiencia</span><div class="bar small"><i style="width:${xpPct}%;background:linear-gradient(90deg,#8ce7ff,#c08bff)"></i></div><b>${c.xp}/${c.xpNext}</b></div>
        </div>
        <div class="stat-grid creature-stats">${stats.map(([l, v]) => `<div class="stat-cell"><span>${l}</span><b>${v}</b></div>`).join('')}</div>
        <div class="creature-details">
          <div class="panel-line">${icon('sparkle', { size: 16 })} <b>Habilidad:</b> ${esc(skill?.name || '—')} <span class="muted">· ${esc(aff.ability)}</span></div>
          <div class="panel-line">${icon('map', { size: 16 })} <b>Exploración:</b> ${esc(sp.explore.label)}${sp.explore.strong ? ' (mejorada)' : ''}</div>
          <div class="panel-line">${icon('charm', { size: 16 })} <b>Amuleto:</b> ${charm ? esc(charm.name) : 'Ninguno'}</div>
          ${nextSp ? `<div class="panel-line evolution-line">${icon('star', { size: 16 })} <b>Evolución:</b> ${esc(nextSp.name)} al nivel ${sp.evolveLevel}${canEvolve ? ' — ¡lista!' : ` (faltan ${Math.max(0, sp.evolveLevel - c.level)} niveles)`}</div>` : `<div class="panel-line">${icon('star', { size: 16 })} <b>Forma final</b> de su línea evolutiva.</div>`}
        </div>
        <div class="action-row">
          ${active ? `<span class="badge equipped">${icon('check')} Activa</span>` : `<button class="btn" data-act="creature-activate" data-index="${idx}">${icon('creature', { size: 16 })} Activar</button>`}
          ${sp.explore.mount ? `<button class="btn ghost" data-act="creature-mount" ${active ? '' : 'disabled'}>${icon('creature', { size: 16 })} ${mounted ? 'Desmontar' : 'Montar'}</button>` : ''}
          <button class="btn ghost" data-act="creature-feed-picker">${icon('food', { size: 16 })} Alimentar</button>
          <button class="btn ghost" data-act="creature-train">${icon('sparkle', { size: 16 })} Entrenar · ${30 + c.level * 6} oro</button>
          <button class="btn ghost" data-act="creature-charm-picker">${icon('charm', { size: 16 })} Amuleto</button>
          <button class="btn gold" data-act="creature-evolve" ${canEvolve ? '' : 'disabled'}>${icon('star', { size: 16 })} Evolucionar</button>
          <button class="btn danger ghost" data-act="creature-release">${icon('close', { size: 16 })} Liberar</button>
        </div>
        ${picker}
      </div>
    </div>
  `;
  return shell('Criaturas', 'Una compañera no es una herramienta. Es una promesa.', body, { icon: 'creature', right: goldPill(ui) });
}

// ───────────────────────── Colección ─────────────────────────
export function renderCollection(ui) {
  const { game } = ui;
  const p = game.state.player;
  const filter = ui.collectionFilter || 'todas';
  const ids = Object.keys(CREATURES).filter((id) => filter === 'todas' || CREATURES[id].affinity === filter);
  const caught = p.caught.length;
  const total = Object.keys(CREATURES).length;
  const rails = [['todas', 'Todas'], ...Object.entries(AFFINITIES).map(([id, a]) => [id, a.name])];
  const cards = ids.map((id) => {
    const sp = CREATURES[id];
    const isCaught = p.caught.includes(id);
    const seen = p.seen.includes(id);
    const aff = AFFINITIES[sp.affinity];
    if (!seen && !isCaught) {
      return `<article class="collection-card locked"><div class="collection-art">${icon('lock', { size: 28 })}</div><div class="collection-meta"><b>???</b><small>Sin descubrir</small></div></article>`;
    }
    return `<article class="collection-card ${isCaught ? 'caught' : 'seen'}" style="--aff:${aff.color}">
      <div class="collection-art"><canvas data-species="${id}" width="100" height="100"></canvas>${isCaught ? '<span class="caught-mark">✦</span>' : ''}</div>
      <div class="collection-meta"><b>${esc(isCaught ? sp.name : '???')}</b><small>${isCaught ? `${aff.name} · ${sp.rarity}` : 'Avistada'}</small>
      <p>${esc(isCaught ? sp.lore : 'La has visto entre la vegetación. Debilítala y ofrecele un sello para conocer su historia.')}</p></div>
    </article>`;
  }).join('');
  const body = `
    <div class="dex-top">
      <div class="dex-progress"><div><b>${caught}</b> / ${total} criaturas registradas</div><div class="bar"><i style="width:${(caught / total) * 100}%;background:linear-gradient(90deg,#8ce7ff,#ffe49b)"></i></div></div>
      <div class="chips scroll">${rails.map(([id, name]) => `<button class="chip ${filter === id ? 'active' : ''}" data-act="collection-filter" data-filter="${id}">${id === 'todas' ? name : `${affinityGlyphChar(id)} ${name}`}</button>`).join('')}</div>
    </div>
    <div class="collection-grid">${cards}</div>
  `;
  return shell('Colección', 'El bestiario de Aetheria, escrito con encuentros.', body, { icon: 'creature' });
}

// ───────────────────────── Creación ─────────────────────────
export function renderCrafting(ui) {
  const { game } = ui;
  const p = game.state.player;
  const cards = Object.entries(RECIPES).map(([id, r]) => {
    const out = ITEMS[r.out];
    const canMats = Object.entries(r.mats).every(([mat, qty]) => (p.inventory[mat] || 0) >= qty);
    const canGold = p.gold >= r.cost;
    const can = canMats && canGold;
    const mats = Object.entries(r.mats).map(([mat, qty]) => {
      const have = p.inventory[mat] || 0;
      return `<span class="mat ${have >= qty ? 'ok' : 'missing'}">${icon(ITEMS[mat]?.icon || 'material', { size: 14 })} ${esc(ITEMS[mat]?.name || mat)} <b>${have}/${qty}</b></span>`;
    }).join('');
    return `<article class="recipe-card ${can ? 'ready' : ''}" style="--rar:${RARITIES[out?.rarity]?.color || '#b7c3d8'}">
      <div class="recipe-head">
        <span class="item-icon" style="--item-color:${out?.color || '#fff'}">${icon(out?.icon || 'star', { size: 24 })}</span>
        <div><b>${esc(out?.name || r.out)} ×${r.qty}</b><small>${esc(out?.desc || '')}</small></div>
      </div>
      <div class="mats">${mats}</div>
      <div class="recipe-foot"><span>${icon('coin', { size: 14 })} ${r.cost} oro</span><span class="muted">Tienes ${p.inventory[r.out] || 0}</span>
        <button class="btn small ${can ? 'gold' : ''}" data-act="craft" data-recipe="${id}" ${can ? '' : 'disabled'}>${can ? 'Crear' : 'Faltan materiales'}</button>
      </div>
    </article>`;
  }).join('');
  const body = `
    <div class="hint-card">${icon('material', { size: 18 })} La mesa de creación funciona en cualquier lugar. Consume materiales y oro al instante.</div>
    <div class="recipe-grid">${cards}</div>
  `;
  return shell('Creación', 'Transforma lo que el camino te ha dado.', body, { icon: 'material', right: goldPill(ui) });
}

// ───────────────────────── Tienda ─────────────────────────
export function renderShop(ui) {
  const { game } = ui;
  const npcId = ui.shopNpc || 'mira';
  const npc = NPCS[npcId] || NPCS.mira;
  const stock = SHOP_STOCK[npcId] || [];
  const tab = ui.shopTab || 'buy';
  const p = game.state.player;
  let content = '';
  if (tab === 'buy') {
    content = stock.map((id) => {
      const item = ITEMS[id];
      if (!item) return '';
      const price = item.value || 1;
      const afford = p.gold >= price;
      return itemRow(ui, id, 0, `<div class="price-tag">${icon('coin', { size: 14 })} ${price}</div><button class="btn small ${afford ? '' : 'ghost'}" data-act="buy-item" data-item="${id}" ${afford ? '' : 'disabled'}>Comprar</button>`);
    }).join('');
  } else {
    const entries = Object.entries(p.inventory).filter(([id, q]) => q > 0 && ITEMS[id] && ITEMS[id].type !== 'key');
    content = entries.map(([id, qty]) => {
      const item = ITEMS[id];
      const equipped = Object.values(p.equipment).includes(id);
      const price = Math.max(1, Math.floor((item.value || 1) * 0.5));
      return itemRow(ui, id, qty, `<div class="price-tag">${icon('coin', { size: 14 })} ${price}</div><button class="btn small ghost" data-act="sell-item" data-item="${id}" ${equipped ? 'disabled title="Desequípalo primero"' : ''}>Vender</button>`);
    }).join('') || emptyState('chest', 'Nada que vender', 'Los objetos equipados y las llaves no se pueden vender.');
  }
  const body = `
    <div class="shop-head">
      <div class="shop-keeper"><span class="npc-orb" style="--c:${npc.color}"></span><div><span class="zone-kicker">${esc(npc.title)}</span><h3>${esc(npc.name)}</h3></div></div>
      <div class="shop-balance">${goldPill(ui)}</div>
    </div>
    <div class="tabs">
      <button class="tab ${tab === 'buy' ? 'active' : ''}" data-act="shop-tab" data-tab="buy">Comprar</button>
      <button class="tab ${tab === 'sell' ? 'active' : ''}" data-act="shop-tab" data-tab="sell">Vender</button>
    </div>
    <div class="list-stack">${content}</div>
    <div class="hint-card">${icon('coin', { size: 18 })} Los precios de venta equivalen al 50% del valor. El oro se comparte entre todas tus compras.</div>
  `;
  return shell(`Tienda de ${npc.name}`, npc.title, body, { icon: 'coin' });
}

// ───────────────────────── Estadísticas ─────────────────────────
export function renderStats(ui) {
  const { game } = ui;
  const p = game.state.player;
  const pl = game.player;
  const cls = CLASSES[p.classId] || CLASSES.vanguardia;
  const attrRows = Object.entries(p.attrs).map(([key, val]) => `
    <div class="attr-row">
      <div><b>${ATTR_LABELS[key]?.[0] || key}</b><small>${ATTR_LABELS[key]?.[1] || ''}</small></div>
      <span class="attr-value">${val}</span>
      <button class="btn plus" data-act="attr-add" data-attr="${key}" ${p.statPoints > 0 ? '' : 'disabled'} title="Añadir punto">+</button>
    </div>`).join('');
  const derived = pl ? [
    ['Vida máxima', pl.maxHp], ['Maná máximo', pl.maxMp], ['Resistencia', pl.maxStamina],
    ['Ataque', pl.attack], ['Defensa', pl.defense], ['Velocidad', Math.round(pl.speedBase)],
    ['Crítico', `${Math.round(pl.critChance * 100)}%`], ['Suerte', pl.luck],
  ] : [];
  const records = [
    ['Enemigos derrotados', game.state.stats.enemiesDefeated],
    ['Criaturas capturadas', game.state.stats.captures],
    ['Cofres abiertos', game.state.stats.chests],
    ['Objetos creados', game.state.stats.crafted],
    ['Daño infligido', game.state.stats.damageDealt],
    ['Muertes', game.state.stats.deaths],
    ['Tiempo de juego', formatPlayTime(game.state.playTime)],
    ['Oro actual', p.gold],
  ];
  const body = `
    <div class="stats-layout">
      <div class="panel hero-summary">
        <div class="hero-portrait"><canvas id="stats-portrait" width="120" height="120"></canvas></div>
        <div><span class="zone-kicker">${esc(cls.role)}</span><h3>${esc(p.name)}</h3><p class="muted">${esc(cls.name)} · Nivel ${p.level}</p><div class="xp-row"><span>XP</span><div class="bar small"><i style="width:${Math.min(100, (p.xp / p.xpNext) * 100)}%;background:linear-gradient(90deg,#8ce7ff,#c08bff)"></i></div><b>${p.xp}/${p.xpNext}</b></div></div>
        ${p.statPoints > 0 ? `<div class="points-badge">${p.statPoints} punto${p.statPoints === 1 ? '' : 's'} disponible${p.statPoints === 1 ? '' : 's'}</div>` : ''}
      </div>
      <div class="panel">
        <h3 class="section-label">Atributos</h3>
        <div class="attr-list">${attrRows}</div>
      </div>
      <div class="panel">
        <h3 class="section-label">Combate derivado</h3>
        <div class="stat-grid">${derived.map(([l, v]) => `<div class="stat-cell"><span>${l}</span><b>${v}</b></div>`).join('')}</div>
      </div>
      <div class="panel">
        <h3 class="section-label">Registro de viaje</h3>
        <div class="stat-grid">${records.map(([l, v]) => `<div class="stat-cell"><span>${l}</span><b>${v}</b></div>`).join('')}</div>
      </div>
      <div class="panel lore-panel"><h3 class="section-label">Vínculo con la Espada</h3><p>${esc(cls.desc)}</p><blockquote>«${esc(cls.quote)}»</blockquote></div>
    </div>
  `;
  return shell('Estadísticas', 'Cada número cuenta una parte de tu viaje.', body, { icon: 'trophy' });
}
