// ============================================================
// LA ESPADA CELESTIAL — menús, tienda, forja, códice y guardado
// ============================================================
import {
  ITEMS, SKILLS, SKILL_BRANCHES, CREATURES, CREATURE_IDS, RARITY,
  SHOPS, APPEARANCE, ITEM_STAT_LABEL,
} from './data.js';
import { QUESTS, QUEST_ORDER, LORE, ZONES, REGIONS, FINAL_CHOICES } from './story.js';
import { STAT_KEYS, ELEMENTS, fmt, formatPlaytime, SaveSystem } from './core.js';
import { drawCreature } from './art.js';

const TYPE_LABEL = {
  weapon: 'Arma', armor: 'Armadura', helmet: 'Casco', accessory: 'Accesorio',
  consumable: 'Consumible', material: 'Material', key: 'Reliquia',
};

export const MENU_TABS = [
  { id: 'character', label: 'Personaje', icon: '✦' },
  { id: 'equipment', label: 'Equipo', icon: '⚔' },
  { id: 'inventory', label: 'Mochila', icon: '▣' },
  { id: 'skills', label: 'Habilidades', icon: '❂' },
  { id: 'creatures', label: 'Ecos', icon: '◉' },
  { id: 'journal', label: 'Diario', icon: '❖' },
  { id: 'map', label: 'Mapa', icon: '✧' },
  { id: 'lore', label: 'Códice', icon: '❧' },
  { id: 'options', label: 'Opciones', icon: '⚙' },
  { id: 'save', label: 'Guardar', icon: '▤' },
];

export function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
const pct = (a, b) => `${Math.round((a / Math.max(1, b)) * 100)}%`;
const zoneName = id => ZONES[id]?.name || 'Desconocido';
const regionName = id => REGIONS[id]?.name || '';

function itemStats(item) {
  if (!item?.stats) return '';
  return Object.entries(item.stats).map(([k, v]) => `${ITEM_STAT_LABEL[k] || k} +${v}`).join(' · ');
}
function itemPrice(item) {
  return Math.max(1, Math.round((item.value || 20) * (RARITY[item.rarity]?.mult || 1)));
}
function rarityClass(item) { return `rarity-${item?.rarity || 'common'}`; }
function upgradeLabel(game, id) {
  const lv = game.itemUpgrades[id] || 0;
  return lv > 0 ? ` +${lv}` : '';
}

function menuHead(title, sub, ui, close = true) {
  return `<header class="menu-head"><div><h2>${esc(title)}</h2><p>${esc(sub)}</p></div>${close ? '<button class="close-btn" data-cmd="close-overlay" aria-label="Cerrar">✕</button>' : ''}</header>`;
}

export function renderMenuShell(ui, tab = 'character') {
  const game = ui.game;
  const p = game.player;
  if (!p) return '';
  const tabs = MENU_TABS.map(t => `<button class="tab-btn ${t.id === tab ? 'active' : ''}" data-cmd="menu-tab" data-tab="${t.id}"><span>${t.icon}</span><b>${t.label}</b></button>`).join('');
  return `<div class="menu-shell">
    <aside class="menu-side">
      <div class="menu-brand">LA ESPADA<b>CELESTIAL</b></div>
      <nav class="menu-tabs" aria-label="Secciones del menú">${tabs}</nav>
      <div class="menu-side-foot">${esc(p.name)} · Nv. ${p.level}<br>◈ ${fmt(p.gold)} oro</div>
    </aside>
    <main class="menu-main">
      ${menuHead(MENU_TABS.find(t => t.id === tab)?.label || 'Menú', `${zoneName(game.zoneId)} · ${regionName(ZONES[game.zoneId]?.region)}`, ui)}
      <div class="menu-body">${renderTab(ui, tab)}</div>
    </main>
  </div>`;
}

export function renderTab(ui, tab) {
  const game = ui.game;
  if (!game.player) return '<p class="empty-note">No hay una partida activa.</p>';
  switch (tab) {
    case 'character': return renderCharacter(ui);
    case 'equipment': return renderEquipment(ui);
    case 'inventory': return renderInventory(ui);
    case 'skills': return renderSkills(ui);
    case 'creatures': return renderCreatures(ui);
    case 'journal': return renderJournal(ui);
    case 'map': return renderMap(ui);
    case 'lore': return renderLoreTab(ui);
    case 'options': return renderOptionsBody(ui, 'game');
    case 'save': return renderSaveBody(ui);
    default: return renderCharacter(ui);
  }
}

function statLine(label, value, cls = '') {
  return `<div class="stat-line"><span>${esc(label)}</span><b class="${cls}">${value}</b></div>`;
}

function renderCharacter(ui) {
  const game = ui.game, p = game.player;
  const quest = game.currentQuest;
  const qdef = quest ? QUESTS[quest] : null;
  const active = game.activeCreature ? CREATURES[game.activeCreature] : null;
  const eq = Object.values(game.equipment).map(id => ITEMS[id]).filter(Boolean);
  const gearNames = eq.map(i => `<div class="stat-line"><span>${esc(TYPE_LABEL[i.type] || '')}</span><b>${esc(i.name)}${upgradeLabel(game, i.id)}</b></div>`).join('') || '<p class="empty-note">Sin equipo</p>';
  const attrRows = STAT_KEYS.map(s => {
    const v = p.attrs[s.id] || 0;
    return `<div class="attr-row"><span class="an" title="${esc(s.desc)}">${s.icon} ${s.name}</span><b class="av">${v}</b><span class="ad">${esc(s.desc)}</span><button data-cmd="spend-attr" data-key="${s.id}" ${p.points <= 0 ? 'disabled' : ''} aria-label="Subir ${esc(s.name)}">+</button></div>`;
  }).join('');
  return `<div class="menu-grid cols-2">
    <section class="panel">
      <h3>${esc(p.name)} · Nivel ${p.level}</h3>
      <div class="big-stat"><b>${p.level}</b><small>Nivel de resonancia</small></div>
      ${statLine('Experiencia', `${fmt(p.xp)} / ${fmt(p.xpNext)}`)}
      ${statLine('Vida', `${Math.ceil(p.hp)} / ${p.maxHP}`)}
      ${statLine('Maná', `${Math.ceil(p.mp)} / ${p.maxMP}`)}
      ${statLine('Resistencia', `${Math.ceil(p.stamina)} / ${p.maxStamina}`)}
      ${statLine('Oro', `◈ ${fmt(p.gold)}`)}
      ${statLine('Tiempo de viaje', formatPlaytime(game.playtime))}
      ${statLine('Ecos vinculados', `${game.capturedCount} / ${CREATURE_IDS.length}`)}
      ${statLine('Puntos de atributo', p.points, p.points > 0 ? 'up' : '')}
      <div style="margin-top:10px"><h3>Misión activa</h3><p style="font-size:11px;color:#c9d0dd;line-height:1.5">${qdef ? `<b style="color:var(--gold-bright)">${esc(qdef.title)}</b><br>${esc(game.questObjective)}` : 'Explora los tres reinos y escribe tu propia leyenda.'}</p></div>
      <div style="margin-top:10px"><h3>Eco activo</h3><p style="font-size:11px;color:#c9d0dd">${active ? `${esc(active.name)} · ${esc(active.epithet)}` : 'Ninguno. Debilita y vincula criaturas para que caminen contigo.'}</p></div>
    </section>
    <section class="panel">
      <h3>Atributos <span style="float:right;color:var(--gold-bright);font-size:10px">${p.points} puntos</span></h3>
      ${attrRows}
      <p class="stat-note" style="margin-top:8px">Vida, maná y resistencia crecen con sus atributos. La suerte mejora críticos, botín y vínculos.</p>
    </section>
    <section class="panel">
      <h3>Estadísticas de combate</h3>
      ${statLine('Ataque', p.attack)}
      ${statLine('Defensa', p.defense)}
      ${statLine('Poder de hechizos', p.spellPower.toFixed(1))}
      ${statLine('Crítico', `${p.crit.toFixed(1)}%`)}
      ${statLine('Daño crítico', `${Math.round(p.critDmg * 100)}%`)}
      ${statLine('Velocidad', Math.round(p.speed))}
      ${statLine('Suerte', Math.round(p.luck))}
      ${statLine('Bono de vínculo', `${Math.round(p.captureBonus * 100)}%`)}
      ${statLine('Elemento del arma', ELEMENTS[p.weaponElement]?.name || 'Luz')}
    </section>
    <section class="panel">
      <h3>Equipo equipado</h3>
      ${gearNames}
      <p class="stat-note" style="margin-top:8px">La apariencia del personaje cambia con la armadura, el casco y el arma. La forja puede reforzar cada pieza hasta +5.</p>
    </section>
  </div>`;
}

function renderEquipment(ui) {
  const game = ui.game, p = game.player;
  const slots = [
    ['weapon', 'Arma', '⚔'], ['armor', 'Armadura', '⛨'], ['helmet', 'Casco', '⌂'], ['accessory', 'Accesorio', '◉'],
  ];
  const slotHtml = slots.map(([key, label, icon]) => {
    const id = game.equipment[key];
    const item = ITEMS[id];
    return `<button class="slot" data-cmd="${item ? 'unequip' : 'noop'}" data-slot="${key}">
      <span class="slot-ico">${item ? item.icon : icon}</span>
      <span class="slot-txt"><b class="${item ? rarityClass(item) : ''}">${item ? esc(item.name) + upgradeLabel(game, item.id) : 'Vacío'}</b><small>${label}${item ? ' · ' + esc(itemStats(item)) : ' · sin equipo'}</small></span>
    </button>`;
  }).join('');
  const gear = Object.entries(game.inventory)
    .filter(([id, n]) => n > 0 && ITEMS[id] && ['weapon', 'armor', 'helmet', 'accessory'].includes(ITEMS[id].type))
    .sort((a, b) => (ITEMS[a[0]].type.localeCompare(ITEMS[b[0]].type)) || (ITEMS[a[0]].value - ITEMS[b[0]].value));
  const cards = gear.map(([id, n]) => {
    const item = ITEMS[id];
    return `<div class="item-card">
      <span class="ic-count">×${n}</span>
      <div class="ic-top"><span class="ic-glyph">${item.icon}</span><span><b class="${rarityClass(item)}">${esc(item.name)}${upgradeLabel(game, id)}</b><small>${esc(TYPE_LABEL[item.type])} · ${esc(RARITY[item.rarity]?.name || '')}</small></span></div>
      <small>${esc(itemStats(item))}</small>
      <div class="ic-actions"><button class="mini-btn" data-cmd="equip" data-id="${id}">Equipar</button><button class="mini-btn" data-cmd="forge-open" data-id="${id}">Forjar</button></div>
    </div>`;
  }).join('') || '<p class="empty-note">No llevas equipo sin equipar. Visita a Bron o a Serah.</p>';
  const activeStats = ['atk', 'def', 'hp', 'mp', 'stam', 'spd', 'crit', 'luck', 'capture', 'allDmg', 'fire', 'fireRes', 'reveal'];
  return `<div class="menu-grid cols-2">
    <section class="panel"><h3>Ranuras de equipo</h3><div class="slot-grid">${slotHtml}</div>
      <p class="stat-note" style="margin-top:10px">Pulsa una ranura para desequipar. El equipo modifica tus estadísticas y tu silueta en el mundo.</p>
    </section>
    <section class="panel"><h3>Valores actuales</h3>
      ${activeStats.map(k => {
        const v = p[k];
        const label = ITEM_STAT_LABEL[k] || k;
        return statLine(label, typeof v === 'number' ? (Number.isInteger(v) ? v : v.toFixed(2)) : String(v));
      }).join('')}
    </section>
    <section class="panel" style="grid-column:1/-1"><h3>Equipo en la mochila</h3><div class="item-grid">${cards}</div></section>
  </div>`;
}

function renderInventory(ui) {
  const game = ui.game;
  const entries = Object.entries(game.inventory).filter(([id, n]) => n > 0 && ITEMS[id]);
  if (!entries.length) return '<p class="empty-note">La mochila está vacía. Recoge hierbas, abre cofres y derrota criaturas.</p>';
  const groups = {};
  for (const [id, n] of entries) {
    const item = ITEMS[id];
    (groups[item.type] ||= []).push([id, n]);
  }
  const order = ['weapon', 'armor', 'helmet', 'accessory', 'consumable', 'material', 'key'];
  return order.filter(t => groups[t]).map(type => {
    const cards = groups[type].sort((a, b) => (ITEMS[a[0]].rarity || '').localeCompare(ITEMS[b[0]].rarity || '')).map(([id, n]) => {
      const item = ITEMS[id];
      const actions = [];
      if (item.type === 'consumable') actions.push(`<button class="mini-btn" data-cmd="use-item" data-id="${id}">Usar</button>`);
      if (['weapon', 'armor', 'helmet', 'accessory'].includes(item.type)) actions.push(`<button class="mini-btn" data-cmd="equip" data-id="${id}">Equipar</button>`);
      if (item.type !== 'key') actions.push(`<button class="mini-btn danger" data-cmd="sell-item" data-id="${id}">Vender ${Math.max(1, Math.round((item.value || 10) * 0.45))}</button>`);
      return `<div class="item-card">
        <span class="ic-count">×${n}</span>
        <div class="ic-top"><span class="ic-glyph">${item.icon}</span><span><b class="${rarityClass(item)}">${esc(item.name)}</b><small>${esc(RARITY[item.rarity]?.name || '')} · ${esc(TYPE_LABEL[item.type] || item.type)}</small></span></div>
        <small>${esc(item.desc || '')}</small>
        ${item.stats ? `<small style="color:var(--gold)">${esc(itemStats(item))}</small>` : ''}
        <div class="ic-actions">${actions.join('')}</div>
      </div>`;
    }).join('');
    return `<section class="panel" style="margin-bottom:10px"><h3>${esc(TYPE_LABEL[type] || type)}</h3><div class="item-grid">${cards}</div></section>`;
  }).join('');
}

function renderSkills(ui) {
  const game = ui.game, p = game.player;
  const branches = Object.entries(SKILL_BRANCHES).map(([bid, b]) => {
    const nodes = Object.values(SKILLS).filter(s => s.branch === bid).map(s => {
      const learned = game.skills.has(s.id);
      const reqOk = (s.req || []).every(r => game.skills.has(r));
      const available = !learned && reqOk && p.skillPoints >= s.cost;
      const cls = learned ? 'unlocked' : available ? 'available' : '';
      const req = (s.req || []).length ? `<small>Requiere: ${s.req.map(r => SKILLS[r]?.name || r).join(', ')}</small>` : '';
      return `<button class="skill-node ${cls}" data-cmd="learn-skill" data-id="${s.id}" ${learned || !available ? 'disabled' : ''}>
        <span class="sn-ico">${s.icon}</span><span style="flex:1"><b>${esc(s.name)}</b><small>${esc(s.desc)}</small>${req}</span><span class="sn-cost">${learned ? '✓' : s.cost + ' pt'}</span>
      </button>`;
    }).join('');
    return `<div class="skill-branch"><h3>${b.icon} ${esc(b.name)}</h3><p style="font-size:9px;color:var(--muted);line-height:1.4;margin:0 0 7px">${esc(b.desc)}</p>${nodes}</div>`;
  }).join('');
  return `<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:9px"><p class="stat-note" style="margin:0">Puntos de habilidad disponibles: <b style="color:var(--gold-bright)">${p.skillPoints}</b></p><span class="stat-note">${game.skills.size} / ${Object.keys(SKILLS).length} aprendidas</span></div><div class="skill-tree">${branches}</div>`;
}

function renderCreatures(ui) {
  const game = ui.game;
  const selected = ui.selectedCreature && CREATURES[ui.selectedCreature] ? ui.selectedCreature : (game.activeCreature || CREATURE_IDS[0]);
  const cards = CREATURE_IDS.map(id => {
    const def = CREATURES[id];
    const known = !!game.creatures[id];
    const active = game.activeCreature === id;
    return `<button class="creature-card ${known ? '' : 'unknown'} ${active ? 'active' : ''}" data-cmd="select-creature" data-id="${id}">
      ${active ? '<span class="cc-badge">ACTIVO</span>' : ''}
      <canvas data-creature-icon="${id}" width="108" height="108"></canvas>
      <b>${known ? esc(def.name) : '???'}</b>
      <small>${known ? esc(ELEMENTS[def.element]?.name || def.element) : 'Eco desconocido'}</small>
    </button>`;
  }).join('');
  const def = CREATURES[selected];
  const known = !!game.creatures[selected];
  const data = game.creatures[selected];
  const detail = known ? `<div class="creature-detail">
    <canvas data-creature-detail="${selected}" width="260" height="260"></canvas>
    <div>
      <h3>${esc(def.name)}</h3>
      <div class="cd-sub">${esc(def.epithet)} · ${esc(ELEMENTS[def.element]?.name || def.element)} · ${esc(RARITY[def.rarity]?.name || '')}</div>
      <div class="stat-line"><span>Nivel del vínculo</span><b>${data?.level || 1}</b></div>
      <div class="stat-line"><span>Vida base</span><b>${def.base.hp}</b></div>
      <div class="stat-line"><span>Ataque base</span><b>${def.base.atk}</b></div>
      <div class="stat-line"><span>Defensa base</span><b>${def.base.def}</b></div>
      <div class="cd-ability"><b>Habilidad · ${esc(def.ability.name)}</b>${esc(def.ability.desc)}</div>
      <div class="cd-ability" style="border-left-color:var(--gold)"><b>Pasiva · ${esc(def.passive.name)}</b>${esc(def.passive.desc)}</div>
      <p>${esc(def.lore)}</p>
      <button class="menu-btn compact ${game.activeCreature === selected ? 'primary' : ''}" data-cmd="activate-creature" data-id="${selected}" ${game.activeCreature === selected ? 'disabled' : ''}><span class="mb-glyph">◉</span><span><b>${game.activeCreature === selected ? 'Eco activo' : 'Activar eco'}</b><small>${game.activeCreature === selected ? 'Camina contigo' : 'Luchará a tu lado'}</small></span></button>
    </div>
  </div>` : `<div class="creature-detail"><canvas data-creature-detail="${selected}" width="260" height="260"></canvas><div><h3>Eco desconocido</h3><div class="cd-sub">Aún no has escuchado su nombre</div><p>Debilita a una criatura hasta que su eco se quiebre, atúrdela y pulsa <b>V</b> o el botón <b>Vincular</b>. Los ecos no se poseen: se acompañan.</p><p class="stat-note">Los ecos vinculados luchan contigo, comparten su pasiva y pueden usarse en la Prueba de las Tres Resonancias.</p></div></div>`;
  return `<div class="menu-grid" style="grid-template-columns:1fr;gap:10px">
    <section class="panel"><h3>Ecos vinculados <span style="float:right;font-size:10px;color:var(--gold-bright)">${game.capturedCount} / ${CREATURE_IDS.length}</span></h3><div class="creature-grid">${cards}</div></section>
    <section class="panel">${detail}</section>
  </div>`;
}

function renderJournal(ui) {
  const game = ui.game;
  const active = QUEST_ORDER.filter(id => game.quests[id]?.state === 'active');
  const done = QUEST_ORDER.filter(id => game.quests[id]?.state === 'done');
  const card = (id) => {
    const q = game.quests[id], def = QUESTS[id];
    const step = def.steps[Math.min(q.step, def.steps.length - 1)];
    const reward = def.rewards || {};
    const items = (reward.items || []).map(([iid, n]) => `${ITEMS[iid]?.name || iid} ×${n}`).join(', ');
    return `<article class="quest-card ${q.state === 'done' ? 'done' : ''}">
      <span class="qc-type">${def.main ? 'Misión principal' : 'Misión secundaria'} · Nivel ${def.level || 1}</span>
      <h4>${esc(def.title)}</h4>
      <p>${esc(def.desc)}</p>
      <div class="qc-obj">${q.state === 'done' ? '✓ Completada' : '› ' + esc(step?.text || 'Continúa tu viaje')}</div>
      <div class="qc-reward">Recompensa: ${reward.xp || 0} XP · ${reward.gold || 0} oro${items ? ' · ' + esc(items) : ''}</div>
    </article>`;
  };
  const activeHtml = active.length ? active.map(card).join('') : '<p class="empty-note">No hay misiones activas. Habla con los habitantes de los tres reinos.</p>';
  const doneHtml = done.length ? done.map(card).join('') : '<p class="empty-note">Todavía no has completado ninguna misión.</p>';
  return `<div class="menu-grid cols-2">
    <section class="panel"><h3>En curso</h3>${activeHtml}</section>
    <section class="panel"><h3>Completadas</h3>${doneHtml}</section>
  </div>`;
}

function renderMap(ui) {
  const game = ui.game;
  const selected = ui.mapZone && ZONES[ui.mapZone] ? ui.mapZone : game.zoneId;
  const def = ZONES[selected];
  const region = REGIONS[def.region];
  const zoneButtons = Object.values(ZONES).map(z => `<div class="map-row"><span style="color:${z.id === game.zoneId ? 'var(--gold-bright)' : 'var(--parch)'}">${esc(z.name)}</span><button class="mini-btn" data-cmd="map-zone" data-zone="${z.id}">Ver</button></div>`).join('');
  return `<div class="map-shell">
    <div class="zone-map">
      <canvas data-map-zone="${selected}" width="900" height="620"></canvas>
      <div class="map-legend">${esc(def.name)} · Nivel ${def.level}<br>${esc(region?.name || '')} — ${esc(region?.epithet || '')}</div>
    </div>
    <aside class="map-side">
      <div class="panel" style="margin-bottom:8px"><h3>${esc(def.name)}</h3><p style="font-size:10px;line-height:1.45;color:#c9d0dd">${esc(def.desc)}</p></div>
      <div class="panel" style="margin-bottom:8px;text-align:center"><canvas data-world-map width="240" height="320" style="width:100%;max-width:240px;height:auto;display:block;margin:0 auto"></canvas></div>
      <div class="panel"><h3>Zonas conocidas</h3>${zoneButtons}</div>
    </aside>
  </div>`;
}

function renderLoreTab(ui) {
  const game = ui.game;
  const entries = [...game.lore].filter(id => LORE[id]).map(id => {
    const l = LORE[id];
    return `<button class="item-card" data-cmd="open-lore" data-id="${id}" style="text-align:left">
      <div class="ic-top"><span class="ic-glyph">❧</span><span><b>${esc(l.title)}</b><small>${esc(l.category)}</small></span></div>
      <small style="display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden">${esc(l.text)}</small>
    </button>`;
  }).join('');
  return `<div style="display:flex;justify-content:space-between;margin-bottom:8px"><p class="stat-note" style="margin:0">Entradas descubiertas: <b style="color:var(--gold-bright)">${game.lore.size} / ${Object.keys(LORE).length}</b></p><span class="stat-note">Lee piedras, altares y reliquias para completar el códice.</span></div><div class="item-grid">${entries || '<p class="empty-note">Aún no has descubierto ninguna entrada.</p>'}</div>`;
}

function settingRow(label, sub, control) {
  return `<div class="settings-row"><div class="sr-label">${esc(label)}<small>${esc(sub)}</small></div>${control}</div>`;
}
function rangeControl(key, value, min = 0, max = 1, step = 0.01) {
  return `<input type="range" data-setting="${key}" data-kind="range" min="${min}" max="${max}" step="${step}" value="${value}" aria-label="${key}">`;
}
function toggleControl(key, value) {
  return `<button class="toggle ${value ? 'on' : ''}" data-setting="${key}" data-kind="toggle" aria-pressed="${!!value}" aria-label="${key}"></button>`;
}
function selectControl(key, value, options) {
  return `<select data-setting="${key}" data-kind="select">${options.map(([v, label]) => `<option value="${v}" ${String(value) === String(v) ? 'selected' : ''}>${esc(label)}</option>`).join('')}</select>`;
}

export function renderOptionsBody(ui, from = 'game') {
  const s = ui.game.settings;
  return `<div class="menu-grid cols-2">
    <section class="panel"><h3>Audio</h3>
      ${settingRow('Volumen general', 'Afecta a música y efectos', rangeControl('master', s.master))}
      ${settingRow('Música', 'Paisaje sonoro procedural', rangeControl('music', s.music))}
      ${settingRow('Efectos', 'Combate, interfaz y ambiente', rangeControl('sfx', s.sfx))}
      ${settingRow('Silenciar', 'Desactiva todo el audio', toggleControl('muted', s.muted))}
    </section>
    <section class="panel"><h3>Rendimiento y cámara</h3>
      ${settingRow('Calidad', 'Partículas, sombras y densidad ambiental', selectControl('quality', s.quality, [['low', 'Baja'], ['medium', 'Media'], ['high', 'Alta']]))}
      ${settingRow('Vibración de cámara', 'Sacudidas al recibir impactos', toggleControl('shake', s.shake))}
      ${settingRow('Números de daño', 'Muestra el daño flotante', toggleControl('damageNumbers', s.damageNumbers))}
      ${settingRow('Reducir movimiento', 'Menos animaciones de interfaz y ambiente', toggleControl('reduceMotion', s.reduceMotion))}
    </section>
    <section class="panel"><h3>Controles y accesibilidad</h3>
      ${settingRow('Controles táctiles', 'Automático detecta pantallas táctiles', selectControl('touch', s.touch, [['auto', 'Automático'], ['always', 'Siempre'], ['never', 'Nunca']]))}
      ${settingRow('Escala de texto', 'Tamaño de la interfaz', selectControl('fontScale', s.fontScale, [['0.9', 'Compacta'], ['1', 'Normal'], ['1.15', 'Grande'], ['1.3', 'Muy grande']]))}
      <p class="stat-note">También puedes jugar con teclado: WASD, J, K, Espacio, L, 1-3, E, V, Q, R, M, C, Tab y Esc.</p>
    </section>
    <section class="panel"><h3>Accesibilidad de diseño</h3>
      <p style="font-size:11px;line-height:1.55;color:#c9d0dd">Los ataques enemigos se anuncian con telégrafos de color y forma. Los estados alterados tienen iconos y texto. Las opciones de cámara, números de daño y escala de texto permiten adaptar la experiencia. La versión móvil prioriza el modo horizontal y los controles de área amplia.</p>
      <p class="stat-note">No hay contenido de pago, anuncios ni compras dentro del juego.</p>
      ${from === 'title' ? '' : '<button class="ghost-btn" data-cmd="to-title" style="margin-top:6px">Volver al título</button>'}
    </section>
  </div>`;
}

function saveMeta(slot) {
  const d = SaveSystem.load(slot);
  if (!d || !d.player) return null;
  return {
    data: d,
    name: d.player.name || 'Aurora',
    level: d.player.level || 1,
    zone: ZONES[d.zoneId]?.name || 'Desconocido',
    region: REGIONS[ZONES[d.zoneId]?.region]?.name || '',
    playtime: formatPlaytime(d.playtime || 0),
    date: d.savedAt ? new Date(d.savedAt).toLocaleString('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'Sin fecha',
    creatures: Object.keys(d.creatures || {}).length,
  };
}

export function renderSaveBody(ui) {
  const game = ui.game;
  const cards = [0, 1, 2].map(i => {
    const m = saveMeta(i);
    const current = game.slot === i;
    const confirm = ui._confirmDeleteSlot === i;
    return `<div class="panel" style="margin-bottom:8px;border-color:${current ? 'var(--line)' : 'var(--line-soft)'}">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px">
        <div><h3 style="margin:0">Ranura ${i + 1}${current ? ' · actual' : ''}</h3>
        <p style="font-size:11px;color:#c9d0dd;margin:3px 0">${m ? `${esc(m.name)} · Nv. ${m.level} · ${esc(m.zone)}` : 'Vacía'}</p>
        <p class="stat-note" style="margin:0">${m ? `${esc(m.date)} · ${m.playtime} · ${m.creatures} ecos` : 'Sin datos de partida'}</p></div>
        <div style="display:flex;flex-direction:column;gap:4px">
          <button class="mini-btn" data-cmd="save-slot" data-slot="${i}">Guardar aquí</button>
          <button class="mini-btn" data-cmd="load-slot" data-slot="${i}" ${m ? '' : 'disabled'}>Cargar</button>
          ${m ? `<button class="mini-btn danger" data-cmd="delete-slot" data-slot="${i}">${confirm ? '¿Seguro?' : 'Borrar'}</button>` : ''}
        </div>
      </div>
    </div>`;
  }).join('');
  return `<p class="stat-note" style="margin:0 0 8px">Guardado local en este navegador. La partida se guarda automáticamente cada 30 segundos y al viajar.</p>${cards}`;
}

// ============================================================
// CAPAS COMPLETAS (hojas modales)
// ============================================================
export function renderSaveSlots(ui, mode = 'load') {
  const title = mode === 'new' ? 'Elige una ranura para tu leyenda' : 'Cargar una partida';
  const cards = [0, 1, 2].map(i => {
    const m = saveMeta(i);
    return `<div class="panel" style="margin-bottom:8px">
      <div style="display:flex;justify-content:space-between;align-items:center;gap:10px">
        <div><h3 style="margin:0">Ranura ${i + 1}</h3>
        <p style="font-size:11px;color:#c9d0dd;margin:3px 0">${m ? `${esc(m.name)} · Nv. ${m.level} · ${esc(m.zone)}` : 'Vacía'}</p>
        <p class="stat-note" style="margin:0">${m ? `${esc(m.date)} · ${m.playtime} · ${m.creatures} ecos vinculados` : 'Una página en blanco espera.'}</p></div>
        <button class="menu-btn compact ${m ? '' : 'primary'}" data-cmd="${mode === 'new' ? 'new-slot' : 'load-slot'}" data-slot="${i}"><span class="mb-glyph">${m ? '↻' : '✦'}</span><span><b>${mode === 'new' ? (m ? 'Sobrescribir' : 'Comenzar') : (m ? 'Cargar' : 'Vacía')}</b></span></button>
      </div>
    </div>`;
  }).join('');
  return `<div class="sheet"><header class="sheet-head"><div><span class="eyebrow">MEMORIA DEL JUGADOR CERO</span><h2>${esc(title)}</h2><p>${mode === 'new' ? 'Tu historia se guardará en el navegador. Puedes usar tres ranuras.' : 'Continúa donde dejaste la espada.'}</p></div><button class="close-btn" data-cmd="close-overlay" aria-label="Cerrar">✕</button></header><div class="sheet-body">${cards}</div></div>`;
}

export function renderOptions(ui, from = 'title') {
  return `<div class="sheet"><header class="sheet-head"><div><span class="eyebrow">AJUSTES</span><h2>Opciones</h2><p>Audio, rendimiento, controles y accesibilidad.</p></div><button class="close-btn" data-cmd="close-overlay" aria-label="Cerrar">✕</button></header><div class="sheet-body">${renderOptionsBody(ui, from)}</div></div>`;
}

export function renderCredits() {
  return `<div class="sheet"><header class="sheet-head"><div><span class="eyebrow">CRÉDITOS Y UNIVERSO</span><h2>La memoria de la Primera Brasa</h2><p>Una obra original de fantasía de acción.</p></div><button class="close-btn" data-cmd="close-overlay" aria-label="Cerrar">✕</button></header><div class="sheet-body"><div class="credits-body">
    <h3>LA ESPADA CELESTIAL</h3>
    <p>Un RPG de acción creado como obra original para navegador y Android. Todo el arte, los personajes, las criaturas, la música y los textos son procedurales y originales. No se ha copiado ni reutilizado propiedad intelectual de terceros.</p>
    <blockquote>«No era una espada. Era una pregunta. Y todavía estamos aprendiendo a contestarla.»</blockquote>
    <h3>El mundo</h3>
    <p>Valdoria, Drakmor y Kansordore. La Gema Celestial, la Jarra de Origen, la Lágrima de la Primera Brasa y la Profecía de Jugador Cero. El Velo no es un enemigo: es una herida que promete olvido. La Convergencia Absoluta es el instante en que todas las memorias coinciden. El Despertar, la Resonancia, la Ruptura y la Ascensión son las estaciones de una misma pregunta: ¿qué merece ser recordado?</p>
    <h3>Diseño y tecnología</h3>
    <p>Canvas 2D, WebAudio procedural, módulos ES y guardado local. Sin dependencias externas, sin anuncios, sin compras. La versión móvil está pensada para pantalla horizontal y controles táctiles, con alternativa de teclado.</p>
    <h3>Objetivo de excelencia</h3>
    <p class="fine">Este juego aspira a un nivel de calidad digno de un premio. No ha ganado ningún GOTY ni afirma merecerlo: esa ambición es un objetivo de diseño, no un logro concedido. Cada sistema, texto y píxel está hecho para que la aventura sea real, jugable y honesta contigo.</p>
    <h3>Tipografías</h3>
    <p class="fine">Cinzel y Alegreya Sans, bajo SIL Open Font License, servidas localmente desde assets/fonts.</p>
    <p class="fine">Versión 1.0 · Español (España) · IA Game Lab.</p>
  </div></div></div>`;
}

export function renderLore(ui, id) {
  const game = ui.game;
  const l = LORE[id];
  if (!l) return `<div class="sheet"><header class="sheet-head"><div><h2>Códice</h2></div><button class="close-btn" data-cmd="close-overlay">✕</button></header><div class="sheet-body"><p class="empty-note">Entrada no encontrada.</p></div></div>`;
  const list = [...game.lore].filter(k => LORE[k]).map(k => `<button class="mini-btn" style="display:block;width:100%;text-align:left;margin-bottom:4px;${k === id ? 'border-color:var(--gold);color:var(--gold-bright)' : ''}" data-cmd="open-lore" data-id="${k}">${esc(LORE[k].title)}</button>`).join('');
  return `<div class="sheet"><header class="sheet-head"><div><span class="eyebrow">CÓDICE · ${esc(l.category)}</span><h2>${esc(l.title)}</h2></div><button class="close-btn" data-cmd="close-overlay" aria-label="Cerrar">✕</button></header><div class="sheet-body"><div class="menu-grid" style="grid-template-columns:190px 1fr;gap:14px"><aside class="panel"><h3>Entradas</h3>${list}</aside><article class="panel"><p style="font-size:14px;line-height:1.8;color:#e4dfd1;margin:0">${esc(l.text)}</p><p class="stat-note" style="margin-top:14px">Las palabras del códice se obtienen leyendo piedras, altares y reliquias. Algunas cambian según lo que hayas vivido.</p></article></div></div></div>`;
}

export function renderShop(ui, shopId) {
  const game = ui.game;
  const shop = SHOPS[shopId];
  if (!shop) return '';
  const stock = shop.stock.map((id, i) => {
    const item = ITEMS[id];
    if (!item) return '';
    const price = itemPrice(item);
    const owned = game.itemCount(id);
    return `<div class="shop-item"><span class="si-glyph">${item.icon}</span><span class="si-info"><b class="${rarityClass(item)}">${esc(item.name)}</b><small>${esc(itemStats(item) || item.desc || '')}${owned ? ` · tienes ${owned}` : ''}</small></span><span class="si-price">◈ ${price}</span><button class="si-buy" data-cmd="shop-buy" data-shop="${shopId}" data-id="${id}" ${game.player.gold < price ? 'disabled' : ''}>Comprar</button></div>`;
  }).join('');
  const sellables = Object.entries(game.inventory).filter(([id, n]) => n > 0 && ITEMS[id] && ITEMS[id].type !== 'key').map(([id, n]) => {
    const item = ITEMS[id];
    const price = Math.max(1, Math.round((item.value || 10) * 0.45));
    return `<div class="shop-item"><span class="si-glyph">${item.icon}</span><span class="si-info"><b class="${rarityClass(item)}">${esc(item.name)} ×${n}</b><small>${esc(TYPE_LABEL[item.type] || '')}</small></span><span class="si-price">◈ ${price}</span><button class="si-buy" data-cmd="shop-sell" data-id="${id}">Vender</button></div>`;
  }).join('') || '<p class="empty-note">No hay nada que vender.</p>';
  return `<div class="sheet"><header class="sheet-head"><div><span class="eyebrow">MERCADO</span><h2>${esc(shop.name)}</h2><p>${esc(shop.greet)}</p></div><div style="text-align:right"><div style="font-family:var(--serif);color:var(--gold-bright);font-size:17px">◈ ${fmt(game.player.gold)}</div><button class="close-btn" data-cmd="close-overlay" aria-label="Cerrar" style="margin-top:6px">✕</button></div></header><div class="sheet-body"><div class="shop-grid"><section class="panel"><h3>Comprar</h3>${stock}</section><section class="panel"><h3>Vender</h3><div style="max-height:56vh;overflow-y:auto">${sellables}</div></section></div></div></div>`;
}

export function renderForge(ui) {
  const game = ui.game;
  const ids = [...new Set([...Object.values(game.equipment).filter(Boolean), ...Object.keys(game.inventory).filter(id => ITEMS[id] && ['weapon', 'armor', 'helmet', 'accessory'].includes(ITEMS[id].type))])];
  const cards = ids.map(id => {
    const item = ITEMS[id];
    if (!item) return '';
    const lvl = game.itemUpgrades[id] || 0;
    const cost = Math.round(60 * Math.pow(1.6, lvl) + (item.value || 40) * 0.3);
    const shards = 1 + lvl;
    const maxed = lvl >= 5;
    const can = !maxed && game.player.gold >= cost && game.itemCount('crystal_shard') >= shards;
    const bonus = Object.keys(item.stats || {}).map(k => {
      const b = game.itemUpgradeBonus(id, k);
      return b ? `${ITEM_STAT_LABEL[k] || k} +${b}` : '';
    }).filter(Boolean).join(' · ');
    return `<div class="item-card"><span class="ic-count">+${lvl}</span><div class="ic-top"><span class="ic-glyph">${item.icon}</span><span><b class="${rarityClass(item)}">${esc(item.name)}</b><small>${esc(TYPE_LABEL[item.type])} · refuerzo ${lvl} / 5</small></span></div><small>${esc(itemStats(item))}</small>${bonus ? `<small style="color:var(--gold)">Refuerzo actual: ${esc(bonus)}</small>` : ''}<div class="ic-actions">${maxed ? '<span class="stat-note">Nivel máximo</span>' : `<button class="mini-btn" data-cmd="forge-upgrade" data-id="${id}" ${can ? '' : 'disabled'}>Reforjar · ◈ ${cost} + ${shards} ◈ cristal</button>`}</div></div>`;
  }).join('') || '<p class="empty-note">No tienes equipo que reforzar.</p>';
  return `<div class="sheet"><header class="sheet-head"><div><span class="eyebrow">FORJA</span><h2>Yunque de resonancia</h2><p>Refuerza tu equipo hasta +5. Cada nivel añade un 12% de las estadísticas base de la pieza.</p></div><div style="text-align:right"><div style="font-family:var(--serif);color:var(--gold-bright);font-size:16px">◈ ${fmt(game.player.gold)} oro</div><div class="stat-note">◈ ${game.itemCount('crystal_shard')} fragmentos de cristal</div><button class="close-btn" data-cmd="close-overlay" aria-label="Cerrar" style="margin-top:6px">✕</button></div></header><div class="sheet-body"><div class="item-grid">${cards}</div></div></div>`;
}

export function renderEndingChoices(ui) {
  const game = ui.game;
  const captured = game.capturedCount;
  const truth = !!game.flags.truth_known;
  const cards = FINAL_CHOICES.map(c => {
    const locked = (c.req?.creatures && captured < c.req.creatures) || (c.req?.flags && !c.req.flags.every(f => game.flags[f]));
    return `<button class="choice-card ${locked ? 'locked' : ''}" data-cmd="choose-ending" data-id="${c.id}" ${locked ? 'disabled' : ''}>
      <span class="cc-icon">${c.icon}</span>
      <span class="cc-body"><b>${esc(c.title)}</b><p>${esc(c.desc)}</p><small>${esc(c.consequence)}</small>${locked ? `<em>${esc(c.locked || 'Requisitos incompletos')}</em>` : ''}</span>
    </button>`;
  }).join('');
  return `<div class="sheet ending-sheet"><header class="sheet-head"><div><span class="eyebrow">CONVERGENCIA ABSOLUTA</span><h2>El mundo espera tu decisión</h2><p>No hay una respuesta correcta. Hay la respuesta que puedas sostener.</p></div></header><div class="sheet-body"><div class="ending-grid">${cards}</div><div class="ending-status"><span>Ecos vinculados: <b>${captured} / 8</b></span><span>Verdad leída: <b>${truth ? 'Sí' : 'No'}</b></span><span>La tercera opción exige ambos.</span></div></div></div>`;
}

export function renderDeath(ui) {
  const game = ui.game;
  const lost = Math.round((game.player?.gold || 0) * 0.1);
  return `<div class="sheet death-sheet"><header class="sheet-head"><div><span class="eyebrow">LA ESPADA RECUERDA</span><h2>Has caído</h2><p>El Velo te ofrece un instante de olvido. Puedes rechazarlo.</p></div></header><div class="sheet-body"><p style="font-size:13px;line-height:1.6;color:#d8d2c4">Perderás <b style="color:var(--gold-bright)">${lost} de oro</b> y despertarás en el último santuario. Tus ecos, misiones y recuerdos permanecen.</p><div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:14px"><button class="menu-btn primary compact" data-cmd="respawn"><span class="mb-glyph">✦</span><span><b>Resurgir en el santuario</b></span></button><button class="menu-btn compact" data-cmd="death-load"><span class="mb-glyph">◈</span><span><b>Cargar partida</b></span></button><button class="menu-btn compact" data-cmd="to-title"><span class="mb-glyph">⌂</span><span><b>Volver al título</b></span></button></div></div></div>`;
}

export function renderEndingEpilogue(ui, ending) {
  const game = ui.game;
  return `<div class="sheet ending-sheet"><header class="sheet-head"><div><span class="eyebrow">${esc(ending.subtitle || 'FINAL')}</span><h2>${esc(ending.title)}</h2><p>La Convergencia ha terminado. El mundo recordará lo que elijas.</p></div></header><div class="sheet-body"><div class="credits-body"><p style="font-size:15px;line-height:1.8">${esc(ending.pages?.[ending.pages.length - 1] || '')}</p><div class="stat-line"><span>Nombre</span><b>${esc(game.player?.name || 'Jugador Cero')}</b></div><div class="stat-line"><span>Nivel</span><b>${game.player?.level || 1}</b></div><div class="stat-line"><span>Ecos vinculados</span><b>${game.capturedCount}</b></div><div class="stat-line"><span>Tiempo de viaje</span><b>${formatPlaytime(game.playtime)}</b></div><div class="stat-line"><span>Misiones completadas</span><b>${Object.values(game.quests).filter(q => q.state === 'done').length}</b></div><p class="fine" style="margin-top:14px">Gracias por jugar. La Espada Celestial no es un trofeo: es una pregunta que ahora te pertenece.</p></div><div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:16px"><button class="menu-btn primary compact" data-cmd="to-title"><span class="mb-glyph">✦</span><span><b>Volver al título</b></span></button><button class="menu-btn compact" data-cmd="close-overlay"><span class="mb-glyph">◈</span><span><b>Seguir explorando</b></span></button></div></div></div>`;
}

// ============================================================
// LIENZOS DE MENÚ
// ============================================================
export function paintOverlay(ui) {
  const game = ui.game;
  const root = ui.refs.overlay;
  if (!root || !game) return;
  for (const c of root.querySelectorAll('canvas[data-creature-icon]')) {
    const id = c.dataset.creatureIcon;
    if (!CREATURES[id]) continue;
    const ctx = c.getContext('2d');
    ctx.clearRect(0, 0, c.width, c.height);
    drawCreature(ctx, id, c.width / 2, c.height * 0.78, c.width / 105, ui._time || 0, 0, 'idle');
  }
  for (const c of root.querySelectorAll('canvas[data-creature-detail]')) {
    const id = c.dataset.creatureDetail;
    if (!CREATURES[id]) continue;
    const ctx = c.getContext('2d');
    ctx.clearRect(0, 0, c.width, c.height);
    drawCreature(ctx, id, c.width / 2, c.height * 0.78, c.width / 105, ui._time || 0, 0, 'idle');
  }
  for (const c of root.querySelectorAll('canvas[data-map-zone]')) {
    ui.renderer.drawZoneMap(c, game, c.dataset.mapZone);
  }
  for (const c of root.querySelectorAll('canvas[data-world-map]')) {
    ui.renderer.drawWorldMap(c, game);
  }
}
