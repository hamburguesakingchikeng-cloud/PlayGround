// ============================================================
// LA ESPADA CELESTIAL — contenido de las pestañas del diario
// ============================================================
import {
  GEAR, SPELLS, SKILLS, CREATURES, AFFINITIES, QUESTS, RECIPES,
  SHOP_STOCK, ZONES, ZONE_ORDER, itemDef, itemName,
} from './data.js';
import { drawAvatar, drawCreatureIcon } from './art.js';

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
const pct = (v, max) => `${clamp(max > 0 ? v / max * 100 : 0, 0, 100).toFixed(1)}%`;
const fmt = (n) => Math.round(Number(n) || 0).toLocaleString('es-ES');
const icon = (name, cls = 'ico') => `<svg class="${cls}" aria-hidden="true"><use href="#i-${esc(name)}"></use></svg>`;
const RARITY = ['', '#8b9bb8', '#7be3b0', '#75b9ff', '#b994ff', '#f4d998'];
const RARITY_NAME = ['', 'Común', 'Poco común', 'Raro', 'Épico', 'Celestial'];
const KIND_NAME = { weapon: 'Arma', armor: 'Armadura', accessory: 'Accesorio', consumable: 'Consumible', material: 'Material', food: 'Alimento', seal: 'Sello', key: 'Llave' };
const SLOT_NAME = { weapon: 'Arma', armor: 'Armadura', accessory: 'Accesorio' };
const STAT_KEYS = ['strength', 'defense', 'speed', 'intelligence', 'luck'];
const STAT_NAME = { strength: 'Fuerza', defense: 'Defensa', speed: 'Velocidad', intelligence: 'Inteligencia', luck: 'Suerte' };

const head = (title, sub, tag = '') => `<div class="content-head"><div><h3>${esc(title)}</h3><p>${esc(sub)}</p></div>${tag ? `<span class="tag">${esc(tag)}</span>` : ''}</div>`;
const stars = (n = 1) => '★'.repeat(clamp(Number(n) || 1, 1, 5));
const timeText = (seconds = 0) => {
  const s = Math.max(0, Math.floor(seconds));
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60);
  return h > 0 ? `${h}:${String(m).padStart(2, '0')} h` : `${m}:${String(s % 60).padStart(2, '0')}`;
};
const dateText = (ts) => {
  if (!ts) return '—';
  try { return new Date(ts).toLocaleString('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }); }
  catch { return '—'; }
};
const progress = (label, value, max, color = 'linear-gradient(90deg,#8f2338,#ff8d9a)', text = '') => `
  <div class="progress-row"><span>${esc(label)}</span><div class="progress"><i style="width:${pct(value, max)};background:${color}"></i></div><b>${esc(text || `${fmt(value)} / ${fmt(max)}`)}</b></div>`;
const itemIcon = (def) => icon(def?.icon || 'bag');
const itemType = (def) => `${KIND_NAME[def?.kind] || 'Objeto'} · ${RARITY_NAME[def?.rarity || 1]}`;

function itemFacts(def) {
  if (!def) return '';
  const rows = [];
  if (def.kind === 'weapon') {
    rows.push(['Daño', def.damage], ['Alcance', def.range], ['Velocidad', def.speed], ['Resistencia', def.stamina], ['Combo', def.combo], ['Crítico', `${Math.round((def.crit || 0) * 100)}%`]);
  } else if (def.kind === 'armor') {
    rows.push(['Defensa', `+${def.defense}`]);
    if (def.hp) rows.push(['Vida', `+${def.hp}`]);
    if (def.mana) rows.push(['Maná', `+${def.mana}`]);
    if (def.speed) rows.push(['Velocidad', `${def.speed > 0 ? '+' : ''}${Math.round(def.speed * 100)}%`]);
  } else if (def.kind === 'accessory') {
    for (const [k, v] of Object.entries(def.stats || {})) rows.push([STAT_NAME[k] || k, `+${v}`]);
  } else if (def.effect) {
    if (def.effect.hp) rows.push(['Vida', `+${def.effect.hp}`]);
    if (def.effect.mana) rows.push(['Maná', `+${def.effect.mana}`]);
    if (def.effect.hp >= 999) rows[rows.length - 2] = ['Vida', 'Completa'];
    if (def.effect.mana >= 999) rows[rows.length - 1] = ['Maná', 'Completo'];
  }
  return rows.map(([k, v]) => `<div class="stat-row"><span>${esc(k)}</span><b>${esc(v)}</b></div>`).join('');
}

function itemDetail(ui, id, extraActions = '') {
  const def = itemDef(id);
  if (!def) return `<div class="panel item-detail empty-state">${icon('bag')}Selecciona un objeto para ver sus detalles.</div>`;
  const p = ui.game.player;
  const count = p.inventory[id] || 0;
  return `<div class="panel item-detail">
    <div class="detail-top"><div class="detail-icon" style="color:${RARITY[def.rarity || 1]}">${itemIcon(def)}</div>
      <div><h4>${esc(def.name)}</h4><div class="sub">${esc(itemType(def))}</div><div class="rarity-stars" style="color:${RARITY[def.rarity || 1]}">${stars(def.rarity || 1)}</div></div></div>
    <p>${esc(def.desc || '')}</p>
    <div class="stat-lines">${itemFacts(def)}<div class="stat-row"><span>En mochila</span><b>${count}</b></div>${def.price ? `<div class="stat-row"><span>Valor</span><b>${fmt(def.price)} oro</b></div>` : ''}</div>
    <div class="detail-actions">${extraActions}</div>
  </div>`;
}

function inventoryActions(ui, id) {
  const p = ui.game.player, def = itemDef(id);
  if (!def) return '';
  const acts = [];
  if (def.kind === 'consumable' || def.effect) acts.push(`<button class="mini-btn gold" data-act="use-item" data-id="${id}">${icon('potion')} Usar</button>`);
  else if (def.kind === 'food') acts.push(`<button class="mini-btn gold" data-act="feed-item" data-id="${id}">${icon('paw')} Dar a la criatura</button>`);
  else if (['weapon', 'armor', 'accessory'].includes(def.kind)) acts.push(`<button class="mini-btn gold" data-act="equip-item" data-id="${id}">${icon(def.icon || 'armor')} Equipar</button>`);
  if (def.kind === 'seal') acts.push(`<span class="mini-note">Debilita a una criatura salvaje y pulsa R o el aviso de captura.</span>`);
  if (def.kind === 'material') acts.push(`<span class="mini-note">Se usa en la forja de Bruma o en recetas del diario.</span>`);
  if (def.kind === 'key') acts.push(`<span class="mini-note">Abre sellos antiguos de Elyra.</span>`);
  return acts.join('');
}

// ---------------------------------------------------------------- ESTADO
function renderStats(ui) {
  const g = ui.game, p = g.player, s = g.state;
  const eq = p.equipment || {};
  const weapon = itemDef(eq.weapon), armor = itemDef(eq.armor), acc = itemDef(eq.accessory);
  const rec = s.stats || {};
  return head(`${p.name} · ${p.className}`, 'Cada nivel otorga un punto de habilidad. La vida, el maná y la resistencia se recalculan al equipar.', `Nivel ${p.level}`) + `
  <div class="two-col">
    <div class="panel">
      <div class="hero-summary">
        <canvas id="stat-avatar" width="180" height="210"></canvas>
        <div><div class="lvl">${esc(p.className)} · Nivel ${p.level}</div><h3>${esc(p.name)}</h3>
        <p>${esc(p.appearance?.outfit || 'tunic')} · ${esc(p.appearance?.accessory || 'ninguno')}<br>Puntos de habilidad: <b>${p.skillPoints}</b></p>
        <div class="hero-equip">${icon(weapon?.icon || 'sword')} ${esc(weapon?.name || 'Sin arma')}<br>${icon('armor')} ${esc(armor?.name || 'Sin armadura')}<br>${icon('ring')} ${esc(acc?.name || 'Sin accesorio')}</div></div>
      </div>
      <div class="stat-block">
        ${progress('Experiencia', p.xp, p.xpNext, 'linear-gradient(90deg,#7c58c8,#c8a6ff)', `${fmt(p.xp)} / ${fmt(p.xpNext)}`)}
        ${progress('Vida', p.hp, p.maxHp, 'linear-gradient(90deg,#8f2338,#ff8d9a)')}
        ${progress('Maná', p.mana, p.maxMana, 'linear-gradient(90deg,#295aac,#6cb9ff)')}
        ${progress('Resistencia', p.stamina, p.maxStamina, 'linear-gradient(90deg,#a06d23,#f0c463)')}
      </div>
    </div>
    <div class="panel">
      <div class="panel-title">${icon('stats')} Atributos</div>
      <div class="stat-block"><div class="big-stats">
        ${STAT_KEYS.map(k => `<div class="big-stat"><span>${STAT_NAME[k]}</span><b>${p.stats[k]}</b></div>`).join('')}
      </div></div>
      <div class="panel-title">${icon('sword')} Combate</div>
      <div class="stat-block"><div class="big-stats">
        <div class="big-stat"><span>Vida máx.</span><b>${Math.round(p.maxHp)}</b></div>
        <div class="big-stat"><span>Maná máx.</span><b>${Math.round(p.maxMana)}</b></div>
        <div class="big-stat"><span>Resistencia</span><b>${Math.round(p.maxStamina)}</b></div>
        <div class="big-stat"><span>Ataque</span><b>${Math.round(p.attackPower)}</b></div>
        <div class="big-stat"><span>Defensa total</span><b>${Math.round(p.defenseTotal)}</b></div>
        <div class="big-stat"><span>Crítico</span><b>${Math.round(p.crit * 100)}%</b></div>
        <div class="big-stat"><span>Captura</span><b>+${Math.round(p.captureBonus * 100)}%</b></div>
        <div class="big-stat"><span>Combo máx.</span><b>${p.maxCombo}</b></div>
      </div></div>
    </div>
  </div>
  <div class="two-col" style="margin-top:10px">
    <div class="panel"><div class="panel-title">${icon('quest')} Progreso de la aventura</div><div class="stat-block">
      ${progress('Fragmentos celestiales', s.shards, 3, 'linear-gradient(90deg,#a97a36,#ffe6a8)', `${s.shards} / 3`)}
      ${progress('Zonas descubiertas', s.discovered?.length || 0, ZONE_ORDER.length, 'linear-gradient(90deg,#2f5d6b,#89dcff)')}
      ${progress('Criaturas únicas', new Set(p.creatures.map(c => c.species)).size, Object.keys(CREATURES).length, 'linear-gradient(90deg,#3f7a54,#8fe3a0)')}
      ${progress('Jefes derrotados', s.stats?.bosses || 0, 4, 'linear-gradient(90deg,#7d1427,#ff9b7d)')}
    </div></div>
    <div class="panel"><div class="panel-title">${icon('book')} Crónica</div><div class="stat-block"><div class="big-stats">
      <div class="big-stat"><span>Tiempo jugado</span><b>${timeText(s.playTime)}</b></div>
      <div class="big-stat"><span>Enemigos</span><b>${fmt(rec.kills)}</b></div>
      <div class="big-stat"><span>Daño infligido</span><b>${fmt(rec.damage)}</b></div>
      <div class="big-stat"><span>Capturas</span><b>${fmt(s.stats?.captures)}</b></div>
      <div class="big-stat"><span>Cofres abiertos</span><b>${fmt(s.stats?.chests)}</b></div>
      <div class="big-stat"><span>Gelatinas</span><b>${fmt(rec.jellies)}</b></div>
    </div></div></div>
  </div>`;
}

// ---------------------------------------------------------------- MOCHILA
function renderInventory(ui) {
  const p = ui.game.player;
  const entries = Object.entries(p.inventory).filter(([id, n]) => n > 0 && itemDef(id));
  entries.sort((a, b) => {
    const da = itemDef(a[0]), db = itemDef(b[0]);
    return (da?.kind || '').localeCompare(db?.kind || '') || (db?.rarity || 0) - (da?.rarity || 0) || da?.name.localeCompare(db?.name);
  });
  if (!entries.some(([id]) => id === ui.invSel)) ui.invSel = entries[0]?.[0] || null;
  const slots = entries.length ? entries.map(([id, n]) => {
    const def = itemDef(id);
    return `<button class="item-slot ${ui.invSel === id ? 'selected' : ''}" data-act="select-inventory" data-id="${id}" title="${esc(def.name)}">
      <span class="rarity" style="--rar:${RARITY[def.rarity || 1]}"></span>${itemIcon(def)}<span class="count">${n}</span></button>`;
  }).join('') : '';
  return head('Mochila', 'Objetos, materiales y equipo sin equipar. Todo lo que recoges aparece aquí.', `${entries.length} tipos`) + `
  <div class="two-col">
    <div class="panel"><div class="panel-title">${icon('bag')} Objetos</div>
      ${entries.length ? `<div class="inventory-grid">${slots}</div>` : `<div class="empty-state">${icon('bag')}Tu mochila está vacía. Abre cofres y derrota enemigos.</div>`}
    </div>
    ${itemDetail(ui, ui.invSel, inventoryActions(ui, ui.invSel))}
  </div>`;
}

// ---------------------------------------------------------------- EQUIPO
function renderEquipment(ui) {
  const p = ui.game.player;
  const slots = ['weapon', 'armor', 'accessory'].map(key => {
    const id = p.equipment[key], def = itemDef(id);
    const canRemove = key !== 'weapon' && !!id;
    return `<${canRemove ? 'button' : 'div'} class="equip-slot" ${canRemove ? `data-act="unequip" data-slot="${key}"` : ''}>
      <div class="slot-icon">${def ? itemIcon(def) : icon('plus')}</div>
      <div class="slot-info"><small>${SLOT_NAME[key]}</small><strong>${def ? esc(def.name) : 'Vacío'}</strong></div>
      ${canRemove ? `<span class="mini-note">Quitar</span>` : `<span class="mini-note">${key === 'weapon' ? 'Obligatorio' : ''}</span>`}
    </${canRemove ? 'button' : 'div'}>`;
  }).join('');
  const gear = Object.entries(p.inventory).filter(([id, n]) => n > 0 && ['weapon', 'armor', 'accessory'].includes(itemDef(id)?.kind));
  gear.sort((a, b) => (itemDef(a[0])?.kind || '').localeCompare(itemDef(b[0])?.kind || ''));
  const list = gear.length ? gear.map(([id, n]) => {
    const def = itemDef(id);
    return `<div class="shop-item"><div class="detail-icon" style="color:${RARITY[def.rarity || 1]}">${itemIcon(def)}</div>
      <div class="info"><strong>${esc(def.name)}</strong><small>${esc(itemType(def))} · ×${n}</small><small>${esc((def.desc || '').slice(0, 70))}${(def.desc || '').length > 70 ? '…' : ''}</small></div>
      <div class="price"><button class="mini-btn gold" data-act="equip-item" data-id="${id}">Equipar</button></div></div>`;
  }).join('') : `<div class="empty-state">${icon('armor')}No tienes equipo guardado. Compra en el bazar, abre cofres o forja en la fragua.</div>`;
  return head('Equipamiento', 'El arma define tu alcance, velocidad y combo. La armadura cambia vida, maná y defensa; los accesorios alteran atributos.', '3 ranuras') + `
  <div class="two-col">
    <div><div class="panel"><div class="panel-title">${icon('armor')} Equipo actual</div><div class="equip-grid">${slots}</div></div>
      <div class="panel" style="margin-top:9px"><div class="panel-title">${icon('stats')} Resumen</div><div class="stat-block"><div class="big-stats">
        <div class="big-stat"><span>Vida máx.</span><b>${Math.round(p.maxHp)}</b></div>
        <div class="big-stat"><span>Maná máx.</span><b>${Math.round(p.maxMana)}</b></div>
        <div class="big-stat"><span>Ataque</span><b>${Math.round(p.attackPower)}</b></div>
        <div class="big-stat"><span>Defensa</span><b>${Math.round(p.defenseTotal)}</b></div>
        <div class="big-stat"><span>Velocidad</span><b>${Math.round(p.moveSpeed)}</b></div>
        <div class="big-stat"><span>Crítico</span><b>${Math.round(p.crit * 100)}%</b></div>
      </div></div></div>
      <div class="scope-note">${icon('lock')} El arma no puede quitarse: siempre debes llevar una hoja, lanza, arco o báculo.</div>
    </div>
    <div class="panel"><div class="panel-title">${icon('bag')} Equipo en la mochila</div><div class="shop-grid" style="grid-template-columns:1fr;padding:9px">${list}</div></div>
  </div>`;
}

// ---------------------------------------------------------------- HABILIDADES
function renderSkills(ui) {
  const p = ui.game.player;
  const nodes = Object.values(SKILLS).map(sk => {
    const owned = p.skills.includes(sk.id);
    const reqMissing = sk.requires && !p.skills.includes(sk.requires);
    const locked = !owned && (reqMissing || (sk.id === 'celestial' && !ui.game.state.forged));
    return `<button class="skill-node ${owned ? 'owned' : ''} ${locked ? 'locked' : ''}" data-act="learn-skill" data-id="${sk.id}" title="${esc(sk.desc)}">
      <div class="skill-ico">${icon(sk.icon)}</div>
      <div><strong>${esc(sk.name)}</strong><small>${esc(sk.desc)}${reqMissing ? `<br>Requiere: ${esc(SKILLS[sk.requires]?.name || sk.requires)}` : ''}${sk.id === 'celestial' && !ui.game.state.forged ? '<br>Requiere forjar la espada.' : ''}</small></div>
      <span class="cost">${owned ? 'APRENDIDA' : `${sk.cost} pt${sk.cost > 1 ? 's' : ''}`}</span>
    </button>`;
  }).join('');
  const spells = Object.values(SPELLS).map(sp => {
    const known = p.spells.includes(sp.id);
    const active = p.activeSpell === sp.id;
    return `<div class="spell-row ${active ? 'active' : ''}">
      <div class="spell-ico" style="color:${sp.color}">${icon(sp.icon)}</div>
      <div><strong>${esc(sp.name)}</strong><small>${esc(sp.desc)}</small><span class="spell-meta">${AFFINITIES[sp.affinity]?.name || sp.affinity} · ${sp.cost} maná · ${sp.cooldown}s</span></div>
      ${known ? `<button class="mini-btn ${active ? 'gold' : ''}" data-act="set-spell" data-id="${sp.id}" ${active ? 'disabled' : ''}>${active ? 'Activa' : 'Activar'}</button>` : `<span class="mini-note">${icon('lock')} Aprende ${esc(SKILLS[sp.id]?.name || 'la habilidad')}</span>`}
    </div>`;
  }).join('');
  return head('Habilidades y magia', 'Puntos disponibles al subir de nivel. La magia activa se lanza con X; puedes cambiarla aquí.', `${p.skillPoints} punto${p.skillPoints === 1 ? '' : 's'}`) + `
  <div class="panel"><div class="panel-title">${icon('star')} Árbol de habilidades</div><div class="skill-tree">${nodes}</div></div>
  <div class="panel" style="margin-top:10px"><div class="panel-title">${icon('wand')} Magias</div><div class="spell-list">${spells}</div></div>
  <div class="panel" style="margin-top:10px"><div class="panel-title">${icon('book')} Consejo</div><div class="help-block">Las habilidades pasivas se aplican al instante. <b>Aliento Celestial</b> exige haber forjado la Espada Celestial en el Altar del Firmamento. Las magias de hielo, rayo y luz se desbloquean con sus habilidades correspondientes.</div></div>`;
}

// ---------------------------------------------------------------- MAPA
function renderMap(ui) {
  const g = ui.game, z = g.zone, s = g.state;
  const portals = (z.portals || []).map(pt => {
    const target = ZONES[pt.to];
    const locked = pt.requiresShards && s.shards < pt.requiresShards;
    return `<div class="map-link ${locked ? 'locked' : ''}">${icon(locked ? 'lock' : 'arrow')}<div><strong>${esc(target?.name || pt.label)}</strong><small>${locked ? esc(pt.lockedText || 'Sellado') : esc(pt.label)}</small></div></div>`;
  }).join('') || `<div class="empty-state">${icon('map')}Esta zona no tiene salidas conocidas.</div>`;
  const zoneList = ZONE_ORDER.map(id => {
    const zz = ZONES[id], discovered = s.discovered?.includes(id), current = z.id === id;
    return `<div class="zone-row ${discovered ? '' : 'locked'} ${current ? 'current' : ''}"><span class="zone-dot"></span><div><strong>${esc(discovered ? zz.name : 'Zona desconocida')}</strong><small>${esc(discovered ? zz.region : 'Explora para revelarla')}</small></div>${current ? '<span class="tag">Aquí</span>' : ''}</div>`;
  }).join('');
  return head('Mapa del valle', 'Las zonas se revelan al entrar en ellas. Los portales sellados requieren fragmentos celestiales.', `${s.discovered?.length || 0}/${ZONE_ORDER.length} zonas`) + `
  <div class="two-col">
    <div class="panel"><div class="panel-title">${icon('map')} Valle de Lumen</div>
      <div class="world-map"><canvas id="worldmap" width="720" height="450"></canvas></div>
      <div class="map-legend"><span><i></i>Posición actual</span><span><i style="background:#89dcff"></i>Portal</span><span><i style="background:#ffe169"></i>Misión</span><span><i style="background:#ff6b6b"></i>Jefe</span></div>
    </div>
    <div>
      <div class="panel"><div class="panel-title">${icon('arrow')} Zona actual</div><div class="stat-block">
        <h4 class="map-zone-name">${esc(z.name)}</h4><p class="map-zone-sub">${esc(z.subtitle)}</p>
        <div class="big-stats" style="margin-top:8px">
          <div class="big-stat"><span>Región</span><b>${esc(z.region)}</b></div>
          <div class="big-stat"><span>Momento</span><b>${esc(z.clock)}</b></div>
          <div class="big-stat"><span>Tamaño</span><b>${z.width} × ${z.height}</b></div>
          <div class="big-stat"><span>Criaturas</span><b>${(z.wilds || []).length}</b></div>
        </div>
        <div class="panel-title" style="margin-top:12px;border-top:1px solid rgba(255,255,255,.06);padding-left:0">${icon('arrow')} Salidas</div>
        <div class="map-links">${portals}</div>
      </div></div>
      <div class="panel" style="margin-top:9px"><div class="panel-title">${icon('map')} Regiones</div><div class="zone-list">${zoneList}</div></div>
    </div>
  </div>`;
}

// ---------------------------------------------------------------- MISIONES
function renderQuests(ui) {
  const g = ui.game, s = g.state, p = g.player;
  let idx = 0;
  if (s.mainStage === 0) idx = 0;
  else if (s.mainStage === 1) idx = s.shards >= 3 ? 2 : 1;
  else if (s.mainStage === 2) idx = 2;
  else if (s.mainStage === 3) idx = 3;
  else idx = 4;
  const mainSteps = QUESTS.main.steps.map((st, i) =>
    `<div class="quest-step ${i < idx ? 'done' : i === idx ? 'current' : ''}"><span>${i < idx ? icon('check') : i + 1}</span><p>${esc(st.text)}</p></div>`
  ).join('');
  const sides = [
    { q: QUESTS.herbs, stage: s.quests.herbs.stage, progress: `Hierbas de Lumen: ${p.inventory.hierba || 0}/5`, ready: (p.inventory.hierba || 0) >= 5 },
    { q: QUESTS.cat, stage: s.quests.cat.stage, progress: s.catFound ? 'Nube encontrada: vuelve junto a Lía.' : 'Busca a Nube al sur del Bosque de Lumen.', ready: !!s.catFound },
    { q: QUESTS.jelly, stage: s.quests.jelly.stage, progress: `Gelatinas derrotadas: ${Math.min(5, s.quests.jelly.count || 0)}/5`, ready: (s.quests.jelly.count || 0) >= 5 },
  ];
  const sideCards = sides.map(({ q, stage, progress, ready }) => {
    const done = stage === 2;
    const accepted = stage >= 1;
    return `<div class="quest-card ${done ? 'complete' : ''}"><h4>${esc(q.title)}<span>${done ? 'Completada' : accepted ? (ready ? 'Lista para entregar' : 'En curso') : 'Disponible'}</span></h4>
      <p>${done ? 'Recompensa entregada. Gracias por ayudar al valle.' : accepted ? esc(progress) : 'Habla con el habitante marcado con un signo dorado en Aldea Alba.'}</p>
      <div class="quest-reward">${icon('coin')} ${q.reward.gold} oro · ${icon(itemDef(q.reward.item)?.icon || 'bag')} ${esc(itemName(q.reward.item))} ×${q.reward.amount}</div>
    </div>`;
  }).join('');
  return head('Misiones', 'La misión principal guía la recuperación de la Espada Celestial. Los encargos secundarios dan oro, objetos y equipo.', `Principal ${Math.min(idx + 1, 5)}/5`) + `
  <div class="two-col">
    <div class="panel"><div class="panel-title">${icon('celestial')} ${esc(QUESTS.main.title)}</div><div class="quest-main">${mainSteps}</div></div>
    <div><div class="panel"><div class="panel-title">${icon('quest')} Encargos del valle</div><div class="quest-side">${sideCards}</div></div>
      <div class="scope-note">${icon('star')} Las misiones secundarias se aceptan hablando con Nara, Lía y Garet en Aldea Alba.</div></div>
  </div>`;
}

// ---------------------------------------------------------------- CRIATURAS
function renderCreatures(ui) {
  const p = ui.game.player;
  if (!p.creatures.length) {
    return head('Criaturas', 'Debilita criaturas salvajes y captúralas con sellos. Después podrás entrenarlas y evolucionarlas.', '0 criaturas') + `
      <div class="panel"><div class="empty-state">${icon('paw')}Todavía no has capturado ninguna criatura.<br>Explora el Bosque de Lumen, las Ruinas o el Lago. Cuando una criatura baje del 42 % de vida, aparecerá un aviso y podrás pulsar <b>R</b>.</div></div>`;
  }
  if (!p.creatures.some(c => c.uid === ui.creatureSel)) ui.creatureSel = p.activeCreature || p.creatures[0].uid;
  const cards = p.creatures.map(inst => {
    const def = CREATURES[inst.species];
    return `<button class="creature-card ${inst.uid === p.activeCreature ? 'active' : ''} ${inst.uid === ui.creatureSel ? 'selected' : ''}" data-act="creature-select" data-uid="${inst.uid}">
      <canvas data-creature="${inst.species}" width="128" height="128"></canvas>
      <strong>${esc(inst.nickname || def?.name || inst.species)}</strong>
      <small class="affinity" style="--aff:${AFFINITIES[def?.affinity]?.color || '#fff'}">${esc(AFFINITIES[def?.affinity]?.name || '')} · Nv. ${inst.level}</small>
      <div class="badges"><span class="badge ${inst.uid === p.activeCreature ? 'gold' : ''}">${inst.uid === p.activeCreature ? 'Activa' : 'Guardada'}</span><span class="badge">${inst.evolved ? 'Evolucionada' : 'Base'}</span></div>
    </button>`;
  }).join('');
  const inst = p.creatures.find(c => c.uid === ui.creatureSel) || p.creatures[0];
  const def = CREATURES[inst.species];
  const active = inst.uid === p.activeCreature;
  const canEvolve = def?.evolveTo && !inst.evolved;
  const evolveReady = canEvolve && inst.level >= def.evolveLevel;
  const evolveText = !canEvolve ? 'Forma final' : inst.level >= def.evolveLevel ? `Lista · ${CREATURES[def.evolveTo]?.name}` : `Nv. ${def.evolveLevel} requerido`;
  return head('Criaturas', 'La criatura activa te acompaña y ataca automáticamente. Alimentar sube vínculo y experiencia; entrenar cuesta oro.', `${p.creatures.length} criaturas`) + `
  <div class="creature-layout">
    <div class="creature-grid">${cards}</div>
    <div class="panel creature-detail">
      <div class="creature-hero"><canvas data-creature="${inst.species}" width="160" height="160"></canvas>
        <div><h4>${esc(inst.nickname || def.name)}</h4><div class="sub affinity" style="--aff:${AFFINITIES[def.affinity]?.color}">${esc(AFFINITIES[def.affinity]?.name)} · ${esc(RARITY_NAME[def.rarity || 1])}</div>
        <p>${esc(def.desc)}</p><div class="badges"><span class="badge gold">${icon('paw')} Nv. ${inst.level}</span><span class="badge">${inst.uid === p.activeCreature ? 'Activa' : 'En reserva'}</span></div></div></div>
      <div class="stat-block">
        ${progress('Experiencia', inst.xp, inst.xpNext, 'linear-gradient(90deg,#7c58c8,#c8a6ff)')}
        ${progress('Vínculo', inst.bond || 0, 100, 'linear-gradient(90deg,#3f7a54,#8fe3a0)', `${inst.bond || 0}%`)}
        ${progress('Saciedad', inst.hunger ?? 70, 100, 'linear-gradient(90deg,#a06d23,#f0c463)', `${Math.round(inst.hunger ?? 70)}%`)}
        <div class="big-stats" style="margin-top:8px">
          <div class="big-stat"><span>Vida base</span><b>${def.base.hp}</b></div>
          <div class="big-stat"><span>Ataque base</span><b>${def.base.atk}</b></div>
          <div class="big-stat"><span>Defensa base</span><b>${def.base.def}</b></div>
          <div class="big-stat"><span>Velocidad base</span><b>${def.base.spd}</b></div>
        </div>
      </div>
      <div class="creature-ability"><strong>${icon('star')} ${esc(def.ability)}</strong><p>${esc(def.abilityDesc)}</p><small>${esc(def.lore)}</small></div>
      <div class="detail-actions">
        <button class="mini-btn gold" data-act="creature-op" data-op="activate" data-uid="${inst.uid}" ${active ? 'disabled' : ''}>${active ? 'Acompañando' : 'Activar'}</button>
        <button class="mini-btn" data-act="creature-op" data-op="feed" data-uid="${inst.uid}">${icon('herb')} Alimentar (${p.inventory.baya || 0})</button>
        <button class="mini-btn" data-act="creature-op" data-op="train" data-uid="${inst.uid}">${icon('stamina')} Entrenar (20 oro)</button>
        <button class="mini-btn" data-act="creature-op" data-op="evolve" data-uid="${inst.uid}" ${evolveReady ? '' : 'disabled'}>${icon('celestial')} ${evolveText}</button>
        <button class="mini-btn" data-act="creature-op" data-op="rename" data-uid="${inst.uid}">Renombrar</button>
        <button class="mini-btn danger" data-act="creature-op" data-op="release" data-uid="${inst.uid}">Liberar</button>
      </div>
    </div>
  </div>`;
}

// ---------------------------------------------------------------- COLECCIÓN
function renderCollection(ui) {
  const p = ui.game.player, s = ui.game.state;
  const owned = new Set(p.creatures.map(c => c.species));
  const seen = s.seen || {};
  const all = Object.values(CREATURES);
  const caughtCount = [...owned].filter(sp => CREATURES[sp]).length;
  const affinityCount = {};
  for (const sp of owned) { const a = CREATURES[sp]?.affinity; if (a) affinityCount[a] = (affinityCount[a] || 0) + 1; }
  const cards = all.map(def => {
    const caught = owned.has(def.id), wasSeen = !!seen[def.id] || caught;
    return `<button class="collection-card ${caught ? '' : wasSeen ? 'seen' : 'locked'}" data-act="collection-info" data-species="${def.id}">
      <canvas data-creature="${def.id}" width="112" height="112"></canvas>
      <strong>${esc(wasSeen ? def.name : '???')}</strong>
      <small>${esc(wasSeen ? (AFFINITIES[def.affinity]?.name || '') : 'Desconocida')}</small>
      ${caught ? `<span class="caught-mark">${icon('check')}</span>` : wasSeen ? `<span class="seen-mark">Vista</span>` : ''}
    </button>`;
  }).join('');
  const aff = Object.entries(AFFINITIES).map(([id, a]) =>
    `<div class="affinity-chip" style="--aff:${a.color}"><span></span>${esc(a.name)}<b>${affinityCount[id] || 0}</b></div>`
  ).join('');
  return head('Colección celestial', 'Captura, evoluciona y registra criaturas de las diez afinidades. Las especies evolucionadas también ocupan su entrada.', `${caughtCount}/${all.length} especies`) + `
  <div class="two-col" style="margin-bottom:9px">
    <div class="panel"><div class="stat-block">${progress('Especies capturadas', caughtCount, all.length, 'linear-gradient(90deg,#3f7a54,#8fe3a0)', `${caughtCount} / ${all.length}`)}${progress('Especies vistas', Object.keys(seen).length, all.length, 'linear-gradient(90deg,#2f5d6b,#89dcff)', `${Math.min(Object.keys(seen).length, all.length)} / ${all.length}`)}</div></div>
    <div class="panel"><div class="panel-title">${icon('celestial')} Afinidades</div><div class="affinity-grid">${aff}</div></div>
  </div>
  <div class="collection-grid">${cards}</div>
  <div class="scope-note">${icon('paw')} Las criaturas se debilitan por debajo del 42 % de vida. Cada sello consumido mejora tus opciones, y la suerte aumenta la probabilidad de captura.</div>`;
}

// ---------------------------------------------------------------- FORJA
function renderCraft(ui) {
  const p = ui.game.player;
  const list = RECIPES.map(r => {
    const out = itemDef(r.output);
    const mats = Object.entries(r.ingredients).map(([id, n]) => {
      const have = p.inventory[id] || 0;
      return `<span class="mat ${have >= n ? 'ok' : 'no'}">${icon(itemDef(id)?.icon || 'crystal')} ${esc(itemName(id))} ${have}/${n}</span>`;
    }).join('');
    const can = Object.entries(r.ingredients).every(([id, n]) => (p.inventory[id] || 0) >= n);
    return `<div class="recipe"><div class="detail-icon" style="color:${RARITY[out?.rarity || 1]}">${itemIcon(out)}</div>
      <div class="info"><strong>${esc(out?.name || r.output)}${r.amount > 1 ? ' ×' + r.amount : ''}</strong><small>${esc(r.desc || out?.desc || '')}</small><div class="mats">${mats}</div></div>
      <button class="mini-btn ${can ? 'gold' : ''}" data-act="craft" data-id="${r.id}" ${can ? '' : 'disabled'}>Forjar</button></div>`;
  }).join('');
  return head('Forja y creación', 'Convierte hierbas, cristales y esencias en pociones, sellos y armaduras. Bruma la Herrera también abre su fragua.', `${fmt(p.gold)} oro`) + `
  <div class="panel"><div class="panel-title">${icon('hammer')} Recetas conocidas</div><div class="recipe-list">${list}</div></div>
  <div class="two-col" style="margin-top:10px">
    <div class="panel"><div class="panel-title">${icon('crystal')} Materiales en mochila</div><div class="inventory-grid">${Object.entries(p.inventory).filter(([id, n]) => n > 0 && itemDef(id)?.kind === 'material').map(([id, n]) => `<button class="item-slot" data-act="select-inventory" data-id="${id}" title="${esc(itemName(id))}">${icon(itemDef(id)?.icon || 'crystal')}<span class="count">${n}</span></button>`).join('') || `<div class="empty-state">Sin materiales.</div>`}</div></div>
    <div class="panel"><div class="panel-title">${icon('book')} Dónde conseguir materiales</div><div class="help-block"><p>Las <b>hierbas</b> caen de gelatinas; los <b>cristales</b> de cofres y ruinas; las <b>esencias</b> de enemigos, cofres y jefes. Los jefes entregan esencia celestial.</p></div></div>
  </div>`;
}

// ---------------------------------------------------------------- TIENDA
function renderShop(ui) {
  const g = ui.game, p = g.player;
  const tab = ui.shopTab || 'buy';
  const tabs = `<div class="shop-tabs"><button class="mini-btn ${tab === 'buy' ? 'gold' : ''}" data-act="shop-tab" data-tab="buy">Comprar</button><button class="mini-btn ${tab === 'sell' ? 'gold' : ''}" data-act="shop-tab" data-tab="sell">Vender</button></div>`;
  let body = '';
  if (tab === 'buy') {
    body = SHOP_STOCK.map(id => {
      const def = itemDef(id); if (!def) return '';
      const price = def.price || 10;
      const owned = ['weapon', 'armor', 'accessory'].includes(def.kind) && g.itemOwned?.(id);
      const noGold = p.gold < price;
      return `<div class="shop-item"><div class="detail-icon" style="color:${RARITY[def.rarity || 1]}">${itemIcon(def)}</div>
        <div class="info"><strong>${esc(def.name)}</strong><small>${esc(itemType(def))}${owned ? ' · En posesión' : ''}</small><small>${esc((def.desc || '').slice(0, 62))}${(def.desc || '').length > 62 ? '…' : ''}</small></div>
        <div class="price"><span class="coin">${fmt(price)} oro</span><button class="mini-btn ${!owned && !noGold ? 'gold' : ''}" data-act="buy" data-id="${id}" ${owned || noGold ? 'disabled' : ''}>Comprar</button></div></div>`;
    }).join('');
  } else {
    const entries = Object.entries(p.inventory).filter(([id, n]) => n > 0 && itemDef(id));
    body = entries.length ? entries.map(([id, n]) => {
      const def = itemDef(id);
      const price = Math.max(1, Math.floor((def.price || 10) * .5));
      return `<div class="shop-item"><div class="detail-icon">${itemIcon(def)}</div>
        <div class="info"><strong>${esc(def.name)} ×${n}</strong><small>${esc(itemType(def))}</small><small>${esc((def.desc || '').slice(0, 62))}${(def.desc || '').length > 62 ? '…' : ''}</small></div>
        <div class="price"><span class="coin">${fmt(price)} oro</span><button class="mini-btn" data-act="sell" data-id="${id}">Vender 1</button></div></div>`;
    }).join('') : `<div class="empty-state">${icon('bag')}No tienes objetos que vender.</div>`;
  }
  return head(g.shopName || 'Bazar de Elio', 'Compra suministros y equipo; vende objetos que ya no necesites. El equipo equipado no se puede vender.', `${fmt(p.gold)} oro`) + tabs + `<div class="panel"><div class="shop-grid">${body}</div></div>`;
}

// ---------------------------------------------------------------- GUARDADO
function renderSave(ui) {
  const g = ui.game, p = g.player;
  const saves = g.getSaves?.() || {};
  const slots = [['auto', 'Guardado automático'], ['1', 'Ranura I'], ['2', 'Ranura II'], ['3', 'Ranura III']];
  const cards = slots.map(([slot, label]) => {
    const d = saves[slot];
    const isAuto = slot === 'auto';
    if (!d) {
      return `<div class="save-slot empty"><div><span class="slot-n">${esc(label)}</span><h4>Ranura vacía</h4><p>Guardado local del navegador.</p></div><div class="slot-actions">${isAuto ? `<button class="mini-btn" data-act="save-now">Guardar ahora</button>` : `<button class="mini-btn gold" data-act="save-slot" data-slot="${slot}">Guardar aquí</button>`}</div></div>`;
    }
    const zone = ZONES[d.zone]?.name || d.zone;
    return `<div class="save-slot"><div><span class="slot-n">${esc(label)}</span><h4>${esc(d.player?.name || 'Astra')} · Nv. ${d.player?.level || 1}</h4><p>${esc(zone)} · ${timeText(d.state?.playTime || 0)}<br>${esc(dateText(d.timestamp))}</p></div>
      <div class="slot-actions"><button class="mini-btn gold" data-act="load-slot" data-slot="${slot}">Cargar</button>${!isAuto ? `<button class="mini-btn" data-act="save-slot" data-slot="${slot}">Sobrescribir</button>` : ''}<button class="mini-btn danger" data-act="delete-slot" data-slot="${slot}">Borrar</button></div></div>`;
  }).join('');
  return head('Partidas', 'El guardado automático ocurre en santuarios, capturas y al vencer jefes. También puedes usar tres ranuras manuales.', 'Guardado local') + `
  <div class="save-top"><span>${icon('save')} Guardado en este navegador: ${Object.keys(saves).length} ranura${Object.keys(saves).length === 1 ? '' : 's'} con datos.</span><button class="mini-btn gold" data-act="save-now">Guardar ahora (auto)</button></div>
  <div class="save-slots">${cards}</div>
  <div class="scope-note">${icon('lock')} Las partidas se guardan en localStorage. Limpiar los datos del navegador o usar otro dispositivo las borrará. No hay sincronización en la nube.</div>`;
}

// ---------------------------------------------------------------- AJUSTES
function renderSettings(ui) {
  return head('Ajustes', 'Audio sintetizado, calidad de efectos y controles táctiles. Los cambios se aplican al instante y se guardan en el navegador.', 'Web') + `
  <div class="panel">${ui.settingsHtml()}</div>
  <div class="two-col" style="margin-top:10px">
    <div class="panel"><div class="panel-title">${icon('settings')} Partida</div><div class="stat-block"><p class="settings-copy">Puedes volver al título sin perder la partida guardada. Si no has guardado, el progreso desde el último santuario se perderá.</p><button class="mini-btn danger" data-act="to-title">Volver al título</button></div></div>
    <div class="panel"><div class="panel-title">${icon('book')} Alcance</div><div class="help-block"><p>Juego web sin instalación: no hay APK de Android, Bluetooth nativo, vibración garantizada ni multijugador. Los mandos compatibles aparecen mediante la Gamepad API del navegador.</p></div></div>
  </div>`;
}

// ---------------------------------------------------------------- GUÍA
function renderGuide() {
  return head('Guía y alcance', 'Todo lo que necesitas para sobrevivir al valle, con controles para teclado, mando y pantalla táctil.', 'v1.0') + `
  <div class="two-col">
    <div class="panel"><div class="panel-title">${icon('settings')} Controles</div><div class="help-block"><table>
      <tr><td>Mover</td><td>WASD / flechas / stick izquierdo / joystick</td></tr>
      <tr><td>Atacar</td><td>J / Z / Espacio / botón A / botón táctil A</td></tr>
      <tr><td>Esquivar</td><td>K / Mayús / botón B</td></tr>
      <tr><td>Bloquear</td><td>Q (mantener) / gatillo / botón táctil Q</td></tr>
      <tr><td>Magia</td><td>X / botón X</td></tr>
      <tr><td>Interactuar</td><td>E / Y / botón Y</td></tr>
      <tr><td>Cambiar arma</td><td>U / C / botón LB</td></tr>
      <tr><td>Criatura / captura</td><td>R / botón RB</td></tr>
      <tr><td>Poción rápida</td><td>Tab / 1 / botón RT</td></tr>
      <tr><td>Menú</td><td>Esc / P / Start</td></tr>
    </table></div></div>
    <div><div class="panel"><div class="panel-title">${icon('celestial')} Sistemas</div><div class="help-block">
      <h4>Combate</h4><p>Combos por arma, esquiva con invulnerabilidad, guardia con contraataque, cuatro magias y habilidades pasivas. Cada arma cambia alcance, velocidad y resistencia.</p>
      <h4>Criaturas</h4><p>Debilita por debajo del 42 %, captura con sellos, alimenta con bayas, entrena con oro y evoluciona al nivel indicado. La criatura activa ataca sola y algunas despejan obstáculos por afinidad.</p>
      <h4>Progresión</h4><p>Sube de nivel, aprende habilidades, forja la Espada Celestial y derrota a los cuatro jefes. Los santuarios restauran y guardan.</p>
    </div></div>
    <div class="panel" style="margin-top:9px"><div class="panel-title">${icon('lock')} Límites de la plataforma</div><div class="help-block"><p>Este proyecto se ejecuta como sitio web estático. No se ofrece exportación nativa de Android ni acceso directo a Bluetooth: un mando inalámbrico solo funciona si el sistema operativo y el navegador lo presentan como gamepad estándar. El audio requiere una primera interacción. Las partidas viven en el almacenamiento local del navegador.</p></div></div></div>
  </div>`;
}

// ---------------------------------------------------------------- API
export function renderTab(ui, tab) {
  switch (tab) {
    case 'stats': return renderStats(ui);
    case 'inventory': return renderInventory(ui);
    case 'equipment': return renderEquipment(ui);
    case 'skills': return renderSkills(ui);
    case 'map': return renderMap(ui);
    case 'quests': return renderQuests(ui);
    case 'creatures': return renderCreatures(ui);
    case 'collection': return renderCollection(ui);
    case 'craft': return renderCraft(ui);
    case 'shop': return renderShop(ui);
    case 'save': return renderSave(ui);
    case 'settings': return renderSettings(ui);
    case 'guide': return renderGuide(ui);
    default: return renderStats(ui);
  }
}

export function drawTabCanvases(ui, tab) {
  const root = document.getElementById('menu-content');
  if (!root) return;
  if (tab === 'stats') {
    const av = root.querySelector('#stat-avatar');
    if (av && ui.game.player) drawAvatar(av, ui.game.player.appearance);
  } else if (tab === 'map') {
    const c = root.querySelector('#worldmap');
    if (c) ui.game.renderer.drawWorldMap(c, ui.game);
  }
  root.querySelectorAll('canvas[data-creature]').forEach(c => drawCreatureIcon(c, c.dataset.creature));
}

export function handleTabAction(ui, act, el, ev) {
  const g = ui.game, p = g.player;
  if (!p) return;
  const id = el.dataset.id, uid = el.dataset.uid, slot = el.dataset.slot;
  const rerender = () => ui.renderMenu();
  switch (act) {
    case 'select-inventory':
      ui.invSel = id; g.audio.sfx('menu'); rerender(); break;
    case 'use-item':
      g.useItem(id); rerender(); break;
    case 'feed-item': {
      const inst = g.activeCreatureInst();
      if (!inst) { g.toast('No tienes una criatura activa.', 'bad'); return; }
      g.feedCreature(inst.uid, id); rerender(); break;
    }
    case 'equip-item':
      g.equip(id); rerender(); break;
    case 'unequip':
      g.unequip(slot); rerender(); break;
    case 'learn-skill':
      g.learnSkill(id); rerender(); break;
    case 'set-spell':
      g.setSpell(id); rerender(); break;
    case 'creature-select':
      ui.creatureSel = uid; g.audio.sfx('menu'); rerender(); break;
    case 'creature-op': {
      const op = el.dataset.op;
      if (op === 'activate') g.activateCreature(uid);
      else if (op === 'feed') g.feedCreature(uid, 'baya');
      else if (op === 'train') g.trainCreature(uid);
      else if (op === 'evolve') g.evolveCreature(uid);
      else if (op === 'rename') ui.openRename(uid);
      else if (op === 'release') {
        const inst = p.creatures.find(c => c.uid === uid);
        const name = inst?.nickname || CREATURES[inst?.species]?.name || 'la criatura';
        ui.confirm('Liberar criatura', `¿Seguro que quieres liberar a ${name}? Su vínculo y nivel se perderán.`, () => {
          g.releaseCreature(uid);
          ui.creatureSel = p.activeCreature || p.creatures[0]?.uid || null;
          rerender();
        }, 'Liberar');
        return;
      }
      rerender(); break;
    }
    case 'collection-info': {
      const sp = el.dataset.species, def = CREATURES[sp];
      if (!def) return;
      const caught = p.creatures.some(c => c.species === sp);
      const seen = !!g.state.seen?.[sp] || caught;
      ui.modal({
        title: caught ? def.name : seen ? `${def.name} · vista` : 'Especie desconocida',
        html: seen ? `<div class="collection-modal"><div class="detail-icon" style="color:${AFFINITIES[def.affinity]?.color}">${icon(AFFINITIES[def.affinity]?.icon || 'creature')}</div>
          <p><b>${esc(AFFINITIES[def.affinity]?.name || '')}</b> · ${esc(RARITY_NAME[def.rarity || 1])}<br>${esc(def.desc)}</p>
          <p><b>Habilidad:</b> ${esc(def.ability)} — ${esc(def.abilityDesc)}</p>
          <p class="lore">${esc(def.lore)}</p>
          ${def.evolveTo ? `<p>Evoluciona a <b>${esc(CREATURES[def.evolveTo]?.name || '')}</b> al nivel ${def.evolveLevel}.</p>` : '<p>Alcanza su forma final.</p>'}
          <p>${caught ? 'Capturada y registrada en tu colección.' : 'La has visto, pero aún no la has capturado.'}</p></div>` : '<p>Aún no has visto esta criatura. Explora nuevas zonas y debilita criaturas salvajes para registrarla.</p>',
        actions: [{ label: 'Cerrar', primary: true }],
      });
      return;
    }
    case 'craft':
      g.craftRecipe(id); rerender(); break;
    case 'shop-tab':
      ui.shopTab = el.dataset.tab === 'sell' ? 'sell' : 'buy'; g.audio.sfx('menu'); rerender(); break;
    case 'buy':
      g.buyItem(id); rerender(); break;
    case 'sell':
      g.sellItem(id); rerender(); break;
    case 'save-slot':
      g.save(slot); rerender(); break;
    case 'save-now':
      g.save('auto'); rerender(); break;
    case 'load-slot': {
      const data = g.getSaves?.()[slot];
      if (!data) { g.toast('La ranura está vacía.', 'bad'); return; }
      ui.confirm('Cargar partida', `Se cargará ${data.player?.name || 'Astra'} Nv. ${data.player?.level || 1} en ${ZONES[data.zone]?.name || data.zone}. La partida actual sin guardar se perderá.`, () => {
        ui.hideMenu();
        g.overlay = false; g.paused = false;
        if (g.load(slot)) ui.showGame();
      }, 'Cargar');
      return;
    }
    case 'delete-slot': {
      const data = g.getSaves?.()[slot];
      if (!data) return;
      ui.confirm('Borrar ranura', `¿Borrar la partida de ${data.player?.name || 'Astra'} Nv. ${data.player?.level || 1}? Esta acción no se puede deshacer.`, () => {
        g.deleteSave(slot); rerender();
      }, 'Borrar');
      return;
    }
    case 'to-title':
      ui.confirm('Volver al título', 'La partida actual se cerrará. Asegúrate de haber guardado en una ranura o santuario.', () => {
        ui.hideMenu();
        g.overlay = false; g.paused = false;
        ui.showTitle();
      }, 'Volver');
      return;
    case 'test-sound':
      g.audio.unlock(); g.audio.sfx('level'); g.toast('Efecto de sonido reproducido.', 'good'); break;
    default:
      break;
  }
}
