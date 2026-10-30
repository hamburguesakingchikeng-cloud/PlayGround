// Paneles de pausa: estado, inventario, equipo, habilidades, criaturas, misiones y mapa.
import {
  getItem, QUEST_DATA, SKILLS, CREATURES, CREATURE_ORDER, EQUIPMENT_SLOTS
} from './data.js';
import {
  esc, itemTypeLabel, statLines, statValueText, getOwnedItemIds,
  filterItems, sortItems, itemCanvas, creatureCanvas, drawHeroPortrait, rarityColor,
  weaponClass, STAT_LABEL
} from './ui-model.js';
import { settingsTab } from './ui-settings.js';
import { renderSaveList } from './ui-shop-saves.js';

export function openPause(ui, game, active = null) {
  const player = game.player;
  if (!player) return;
  ui.openPanel({
    active,
    title: 'Pausa',
    subtitle: `${player.name} · Nivel ${player.level} · ${game.difficultyName}`,
    tabs: [
      { id: 'status', label: 'Estado', icon: '✦', render: (c, u, g) => statusTab(c, u, g) },
      { id: 'inventory', label: 'Inventario', icon: '◈', render: (c, u, g) => inventoryTab(c, u, g) },
      { id: 'equipment', label: 'Equipo', icon: '⚔', render: (c, u, g) => equipmentTab(c, u, g) },
      { id: 'skills', label: 'Habilidades', icon: '✧', render: (c, u, g) => skillsTab(c, u, g) },
      { id: 'creatures', label: 'Criaturas', icon: '❧', render: (c, u, g) => creaturesTab(c, u, g) },
      { id: 'quests', label: 'Misiones', icon: '⌘', render: (c, u, g) => questsTab(c, u, g) },
      { id: 'map', label: 'Mapa', icon: '◎', render: (c, u, g) => mapTab(c, u, g) },
      { id: 'settings', label: 'Ajustes', icon: '⚙', render: (c, u, g) => settingsTab(c, u, g, { fromPause: true }) },
      { id: 'saves', label: 'Guardar', icon: '▣', render: (c, u, g) => {
        c.innerHTML = `<div class="section-title">Ranuras de guardado</div><div id="pause-save-list"></div>
          <div class="settings-note" style="margin-top:14px">También puedes guardar en los cristales azules del mundo.</div>
          <div style="margin-top:16px"><button class="btn danger" id="pause-exit">Volver al título</button></div>`;
        renderSaveList(c.querySelector('#pause-save-list'), u, g, { mode: 'save', compact: true });
        c.querySelector('#pause-exit').onclick = () => {
          u.closeOverlay({ silent: true });
          g.returnToTitle();
        };
      } }
    ],
    footer: `<span class="lumens">◈ ${player.lumens} lumenes</span><span class="foot-hint"><span class="keycap">Esc</span> reanudar</span>`,
    onClose: () => game.resume()
  });
}

// ------------------------------- Estado -------------------------------
export function statusTab(container, ui, game) {
  const p = game.player;
  const seals = [
    ['sello_bosque', 'Bosque'], ['sello_piedra', 'Piedra'], ['sello_espectro', 'Vacío']
  ];
  const statKeys = ['vit', 'str', 'def', 'agi', 'int', 'luck'];
  container.innerHTML = `
    <div class="status-top">
      <div class="status-portrait"><canvas id="status-portrait-canvas" width="360" height="360"></canvas></div>
      <div>
        <div class="status-name">${esc(p.name)}</div>
        <div class="status-class">${esc(weaponClass(p.weapon))}</div>
        <div class="status-level">Nivel ${p.level} · ${p.xp} / ${p.xpNext} de experiencia · ${p.statPoints} puntos libres</div>
        <div class="xp-line"><div style="width:${Math.min(100, p.xp / p.xpNext * 100)}%"></div><span>${p.xpNext - p.xp} para el siguiente nivel</span></div>
        <div class="hero-equip-row" style="margin-top:14px">
          ${[p.weapon, p.shield, p.armor, p.accessory].map(item => item
            ? `<span class="mini-equip"><b>${esc(item.name)}</b></span>`
            : `<span class="mini-equip">Sin equipo</span>`).join('')}
        </div>
      </div>
    </div>
    <div class="section-title">Atributos</div>
    <div class="stat-grid">
      ${statKeys.map(key => `
        <div class="stat-row">
          <span class="stat-label">${STAT_LABEL[key] || key}</span>
          <span class="stat-value">${p.stats[key]}${p.statPoints > 0 ? ` <button class="plus-btn" data-stat="${key}" title="Añadir punto">+</button>` : ''}</span>
        </div>`).join('')}
    </div>
    <div class="stat-grid" style="margin-top:8px">
      <div class="stat-row"><span class="stat-label">Vida máxima</span><span class="stat-value">${p.stats.maxHp}</span></div>
      <div class="stat-row"><span class="stat-label">Maná máximo</span><span class="stat-value">${p.stats.maxMp}</span></div>
      <div class="stat-row"><span class="stat-label">Ataque</span><span class="stat-value">${Math.round(p.stats.atk)}</span></div>
      <div class="stat-row"><span class="stat-label">Defensa</span><span class="stat-value">${Math.round(p.stats.defense)}</span></div>
      <div class="stat-row"><span class="stat-label">Crítico</span><span class="stat-value">${Math.round(p.stats.crit)}%</span></div>
      <div class="stat-row"><span class="stat-label">Velocidad</span><span class="stat-value">${Math.round(p.stats.speed)}</span></div>
    </div>
    <div class="section-title">Sellos del Alba</div>
    <div class="quest-seals">
      ${seals.map(([id, name]) => `<span class="seal-pip ${p.countItem(id) ? 'on' : ''}">◆ ${name}</span>`).join('')}
    </div>
    <div class="section-title">Criatura activa</div>
    <div class="creature-detail">
      ${p.activeCreature ? `<b>${esc(CREATURES[p.activeCreature].name)}</b><br>${esc(CREATURES[p.activeCreature].passive)}<br><span style="color:var(--teal)">Activa: ${esc(CREATURES[p.activeCreature].active)}</span>` : 'Aún no has sellado ninguna criatura. Debilita a una bestia y usa el Sello de Vínculo con Y.'}
    </div>`;
  const canvas = container.querySelector('#status-portrait-canvas');
  drawHeroPortrait(canvas, p);
  container.querySelectorAll('[data-stat]').forEach(button => {
    button.onclick = () => {
      if (p.statPoints <= 0) return;
      const key = button.dataset.stat;
      p.base[key]++;
      p.statPoints--;
      p.recomputeStats(true);
      game.audio.sfx('confirm', { volume: 0.7 });
      ui.toast('Atributo aumentado', `${STAT_LABEL[key]} ahora es ${p.stats[key]}.`, 'success', 2200);
      ui.refreshPanel();
    };
  });
}

// ------------------------------- Inventario -------------------------------
export function inventoryTab(container, ui, game) {
  const p = game.player;
  ui.invFilter = ui.invFilter || 'all';
  const filters = [
    ['all', 'Todo'], ['weapon', 'Armas'], ['armor', 'Equipo'],
    ['consumable', 'Consumibles'], ['quest', 'Misión']
  ];
  const all = sortItems(filterItems(getOwnedItemIds(p), ui.invFilter));
  if (!ui.invSelected || !all.some(item => item.id === ui.invSelected)) {
    ui.invSelected = all[0]?.id || null;
  }
  container.innerHTML = `
    <div class="inventory-layout">
      <div>
        <div class="inv-toolbar">
          ${filters.map(([id, label]) => `<button class="filter-btn ${ui.invFilter === id ? 'active' : ''}" data-filter="${id}">${label}</button>`).join('')}
        </div>
        <div class="inv-grid" id="inv-grid"></div>
        ${all.length ? '' : '<p class="empty-note">No hay objetos en esta categoría.</p>'}
      </div>
      <div class="detail-panel" id="item-detail"></div>
    </div>`;
  container.querySelectorAll('[data-filter]').forEach(button => {
    button.onclick = () => {
      ui.invFilter = button.dataset.filter;
      ui.invSelected = null;
      ui.refreshPanel();
    };
  });
  const grid = container.querySelector('#inv-grid');
  for (const item of all) {
    const cell = document.createElement('button');
    cell.className = `inv-cell ${ui.invSelected === item.id ? 'selected' : ''}`;
    cell.innerHTML = `<span class="inv-cell-name">${esc(item.name)}</span>`;
    const icon = itemCanvas(item, 48);
    cell.prepend(icon);
    const qty = p.countItem(item.id);
    if (qty > 1) cell.insertAdjacentHTML('beforeend', `<span class="inv-qty">${qty}</span>`);
    if (Object.values(p.equipment).includes(item.id)) cell.insertAdjacentHTML('beforeend', '<span class="inv-equipped">EQUIPADO</span>');
    cell.onclick = () => {
      ui.invSelected = item.id;
      ui.refreshPanel();
      game.audio.sfx('select', { volume: 0.5 });
    };
    grid.appendChild(cell);
  }
  renderItemDetail(container.querySelector('#item-detail'), ui, game, ui.invSelected ? getItem(ui.invSelected) : null);
}

function renderItemDetail(panel, ui, game, item) {
  if (!item) {
    panel.innerHTML = '<p class="empty-note">Selecciona un objeto para ver sus detalles.</p>';
    return;
  }
  const p = game.player;
  const current = item.type === 'weapon' ? p.weapon : item.type === 'shield' ? p.shield :
    item.type === 'armor' ? p.armor : item.type === 'accessory' ? p.accessory : null;
  const lines = statLines(item);
  const compare = current && current.id !== item.id ? statLines(current) : [];
  const equipped = Object.values(p.equipment).includes(item.id);
  panel.innerHTML = `
    <div class="detail-name" style="color:${rarityColor(item)}">${esc(item.name)}</div>
    <div class="detail-type">${esc(itemTypeLabel(item))} · ${esc(['Común', 'Fino', 'Raro', 'Épico', 'Celestial'][item.rarity || 0])}</div>
    <div id="detail-icon"></div>
    <div class="detail-desc">${esc(item.desc || '')}</div>
    ${item.lore ? `<div class="detail-desc" style="font-style:italic;color:var(--muted)">${esc(item.lore)}</div>` : ''}
    <div class="detail-stats">
      ${lines.map(line => `<div class="compare-row"><span>${esc(line.label)}</span><b class="${String(line.value).startsWith('-') ? 'neg' : 'pos'}">${esc(statValueText(line))}</b></div>`).join('')}
      ${compare.length && current ? `<div style="margin-top:7px;color:var(--muted);font-size:9px">Ahora: ${esc(current.name)}</div>
        ${compare.map(line => `<div class="compare-row"><span>${esc(line.label)}</span><b>${esc(statValueText(line))}</b></div>`).join('')}` : ''}
    </div>
    <div class="detail-actions" id="detail-actions"></div>`;
  const iconWrap = panel.querySelector('#detail-icon');
  iconWrap.className = 'detail-icon';
  iconWrap.appendChild(itemCanvas(item, 72));
  const actions = panel.querySelector('#detail-actions');
  if (item.type === 'consumable') {
    const button = document.createElement('button');
    button.className = 'btn primary';
    button.textContent = 'Usar objeto';
    button.onclick = () => {
      const used = useConsumable(ui, game, item);
      if (used) ui.refreshPanel();
    };
    actions.appendChild(button);
  } else if (['weapon', 'shield', 'armor', 'accessory'].includes(item.type)) {
    const button = document.createElement('button');
    button.className = 'btn primary';
    button.textContent = equipped ? 'Equipado' : 'Equipar';
    button.disabled = equipped;
    button.onclick = () => {
      equipItem(ui, game, item);
      ui.refreshPanel();
    };
    actions.appendChild(button);
  } else {
    const note = document.createElement('div');
    note.className = 'empty-note';
    note.textContent = item.type === 'quest' ? 'Objeto importante para la historia.' : 'Material de artesanía o trueque.';
    actions.appendChild(note);
  }
}

export function useConsumable(ui, game, item) {
  const p = game.player;
  let used = false;
  if (item.healFull) {
    if (p.hp < p.stats.maxHp || p.mp < p.stats.maxMp) {
      p.hp = p.stats.maxHp; p.mp = p.stats.maxMp; used = true;
    }
  } else {
    if (item.heal && p.hp < p.stats.maxHp) { p.heal(item.heal); used = true; }
    if (item.mana && p.mp < p.stats.maxMp) { p.restoreMana(item.mana); used = true; }
  }
  if (item.staminaFull && p.stamina < p.stats.maxStamina) {
    p.stamina = p.stats.maxStamina; used = true;
  }
  if (!used) {
    ui.toast('No hace falta', 'Ya tienes la vida, el maná o la resistencia al máximo.', 'info', 2200);
    return false;
  }
  p.removeItem(item.id, 1);
  game.audio.sfx('heal', { volume: 0.8 });
  ui.toast(item.name, 'Usado. Recuperas fuerzas.', 'success', 1800);
  return true;
}

export function equipItem(ui, game, item) {
  const p = game.player;
  const slot = item.type;
  if (!p.equipment[slot]) {
    ui.toast('No se puede equipar', 'Ese objeto no ocupa una ranura válida.', 'warning');
    return;
  }
  p.equipment[slot] = item.id;
  p.recomputeStats(true);
  game.audio.sfx('confirm', { volume: 0.7 });
  ui.toast(item.name, 'Equipado.', 'success', 1800);
}

// ------------------------------- Equipo -------------------------------
export function equipmentTab(container, ui, game) {
  const p = game.player;
  const owned = getOwnedItemIds(p).map(getItem).filter(Boolean);
  container.innerHTML = `
    <div class="equip-layout">
      <div>
        <div class="section-title">Ranuras</div>
        <div class="slot-list" id="equip-slots"></div>
      </div>
      <div>
        <div class="section-title">Estadísticas actuales</div>
        <div class="stats-compare" id="equip-stats"></div>
        <div id="equip-picker"></div>
      </div>
    </div>`;
  const list = container.querySelector('#equip-slots');
  for (const slot of EQUIPMENT_SLOTS) {
    const item = p.equipment[slot.id] ? getItem(p.equipment[slot.id]) : null;
    const row = document.createElement('button');
    row.className = 'equip-slot';
    row.innerHTML = `<div class="slot-ico"></div><div class="slot-meta"><div class="slot-kind">${esc(slot.name)}</div>
      <div class="slot-name ${item ? '' : 'empty'}">${esc(item ? item.name : 'Vacío')}</div>
      <div class="slot-stats">${item ? esc(statLines(item).slice(0, 3).map(l => `${l.label} ${statValueText(l)}`).join(' · ')) : 'Selecciona para equipar'}</div></div>`;
    if (item) row.querySelector('.slot-ico').appendChild(itemCanvas(item, 48));
    row.onclick = () => {
      ui.equipSlot = slot.id;
      ui.refreshPanel();
      game.audio.sfx('select', { volume: 0.5 });
    };
    list.appendChild(row);
  }
  const stats = container.querySelector('#equip-stats');
  const keys = ['maxHp', 'maxMp', 'atk', 'defense', 'crit', 'speed'];
  const labels = { maxHp: 'Vida', maxMp: 'Maná', atk: 'Ataque', defense: 'Defensa', crit: 'Crítico %', speed: 'Velocidad' };
  stats.innerHTML = keys.map(key => `<div class="compare-row"><span>${labels[key]}</span><b>${Math.round(p.stats[key])}</b></div>`).join('') +
    `<div class="compare-row"><span>Pasiva activa</span><b>${p.activeCreature ? esc(CREATURES[p.activeCreature].name) : '—'}</b></div>`;
  const picker = container.querySelector('#equip-picker');
  if (ui.equipSlot) {
    const slot = EQUIPMENT_SLOTS.find(s => s.id === ui.equipSlot);
    const options = owned.filter(item => slot.types.includes(item.type) && item.id !== p.equipment[slot.id]);
    picker.innerHTML = `<div class="section-title">Elegir ${esc(slot.name.toLowerCase())}</div><div class="picker-list" id="picker-list"></div>`;
    const pickerList = picker.querySelector('#picker-list');
    if (['shield', 'accessory'].includes(slot.id) && p.equipment[slot.id]) {
      const empty = document.createElement('button');
      empty.className = 'picker-item';
      empty.innerHTML = '<div>Desequipar<small>Dejar la ranura vacía</small></div>';
      empty.onclick = () => {
        p.equipment[slot.id] = null;
        p.recomputeStats(true);
        ui.refreshPanel();
      };
      pickerList.appendChild(empty);
    }
    for (const item of options) {
      const button = document.createElement('button');
      button.className = 'picker-item';
      button.innerHTML = `<div>${esc(item.name)}<small>${esc(statLines(item).slice(0, 2).map(l => `${l.label} ${statValueText(l)}`).join(' · '))}</small></div>`;
      button.prepend(itemCanvas(item, 34));
      button.onclick = () => {
        p.equipment[slot.id] = item.id;
        p.recomputeStats(true);
        game.audio.sfx('confirm', { volume: 0.7 });
        ui.equipSlot = null;
        ui.refreshPanel();
      };
      pickerList.appendChild(button);
    }
    if (!options.length && !(p.equipment[slot.id] && ['shield', 'accessory'].includes(slot.id))) {
      pickerList.innerHTML = '<p class="empty-note">No tienes otra pieza compatible. Visita a Bran o encuentra cofres.</p>';
    }
  } else {
    picker.innerHTML = '<div class="settings-note" style="margin-top:14px">Elige una ranura para cambiar la pieza. Las armas y armaduras se reflejan en el personaje.</div>';
  }
}

// ------------------------------- Habilidades -------------------------------
export function skillsTab(container, ui, game) {
  const p = game.player;
  container.innerHTML = `
    <div class="section-title">Habilidades de combate</div>
    <div class="skill-list" id="skill-list"></div>
    <div class="settings-note" style="margin-top:14px">La habilidad activa se lanza con <span class="keycap">X</span> o el botón de habilidad. Consume maná y tiene recarga.</div>`;
  const list = container.querySelector('#skill-list');
  for (const skill of Object.values(SKILLS)) {
    const unlocked = p.skills.includes(skill.id);
    const active = p.activeSkill === skill.id;
    const card = document.createElement('button');
    card.className = `skill-card ${active ? 'active' : ''} ${unlocked ? '' : 'locked'}`;
    card.innerHTML = `<div class="skill-head"><div class="skill-glyph" style="color:${skill.color}">${skill.icon === 'heal' ? '✚' : skill.icon === 'shield' ? '⬡' : '✦'}</div><div><div class="skill-name">${esc(skill.name)}</div><div class="skill-lvl">Nivel ${skill.level} · ${esc(skill.element)}</div></div></div>
      <div class="skill-desc">${esc(skill.desc)}</div>
      <div class="skill-cost">${skill.mana} maná · ${skill.cooldown}s recarga</div>
      ${active ? '<span class="skill-active-tag">ACTIVA</span>' : ''}${unlocked ? '' : '<span class="skill-active-tag" style="color:var(--muted);border-color:var(--muted-2)">BLOQUEADA</span>'}`;
    if (unlocked) {
      card.onclick = () => {
        p.activeSkill = skill.id;
        game.audio.sfx('confirm', { volume: 0.7 });
        ui.refreshPanel();
      };
    }
    list.appendChild(card);
  }
}

// ------------------------------- Criaturas -------------------------------
export function creaturesTab(container, ui, game) {
  const p = game.player;
  container.innerHTML = `
    <div class="section-title">Vínculos del bosque</div>
    <div class="creature-grid" id="creature-grid"></div>
    <div id="creature-detail"></div>`;
  const grid = container.querySelector('#creature-grid');
  for (const id of CREATURE_ORDER) {
    const def = CREATURES[id];
    const captured = p.creatures.includes(id);
    const active = p.activeCreature === id;
    const card = document.createElement('button');
    card.className = `creature-card ${active ? 'active' : ''} ${captured ? '' : 'locked'}`;
    card.appendChild(creatureCanvas(def, 96));
    card.insertAdjacentHTML('beforeend', `<div class="creature-name">${esc(def.name)}</div>
      <div class="creature-el">${captured ? 'Capturada' : 'No encontrada'}</div>
      <div class="creature-passive">${captured ? esc(def.passive) : '??? · Debilita y sella con Y'}</div>`);
    if (captured) {
      card.onclick = () => {
        p.activeCreature = id;
        p.recomputeStats(true);
        game.audio.sfx('capture', { volume: 0.55 });
        ui.refreshPanel();
      };
    }
    grid.appendChild(card);
  }
  const detail = container.querySelector('#creature-detail');
  const activeDef = p.activeCreature ? CREATURES[p.activeCreature] : null;
  detail.innerHTML = activeDef
    ? `<div class="creature-detail"><b>${esc(activeDef.name)}</b> · ${esc(activeDef.element)}<br>
       ${esc(activeDef.desc)}<br><br><b>Pasiva:</b> ${esc(activeDef.passive)}<br>
       <b>Activa:</b> ${esc(activeDef.active)}<br><br>
       <button class="btn primary" id="summon-creature">${game.companion ? 'Usar habilidad de criatura' : 'Invocar criatura'}</button></div>`
    : '<div class="creature-detail">Aún no tienes criaturas. Las gelatinas, lobos, escarabajos, espectros y fénix pueden sellarse cuando su vida baja del 32%.</div>';
  detail.querySelector('#summon-creature')?.addEventListener('click', () => {
    game.creatureAction();
    ui.refreshPanel();
  });
}

// ------------------------------- Misiones -------------------------------
export function questsTab(container, ui, game) {
  const p = game.player;
  const quests = QUEST_DATA;
  const mainStage = game.quests.main;
  const main = quests.main;
  const stage = main.stages[Math.min(mainStage, main.stages.length - 1)];
  const side = ['lirios', 'forja', 'nino'];
  const sealCount = ['sello_bosque', 'sello_piedra', 'sello_espectro'].filter(id => p.countItem(id) > 0).length;
  container.innerHTML = `
    <div class="quest-list">
      <div class="quest-entry main ${mainStage >= main.stages.length - 1 ? 'done' : ''}">
        <h4>${esc(main.name)}</h4>
        <p><strong style="color:var(--gold)">${esc(stage.title)}.</strong> ${esc(stage.desc)}</p>
        <span class="quest-state">${mainStage >= main.stages.length - 1 ? 'Completada' : `Etapa ${mainStage + 1} de ${main.stages.length}`}</span>
        <div class="quest-seals">
          ${['Bosque', 'Piedra', 'Vacío'].map((name, i) => `<span class="seal-pip ${sealCount > i ? 'on' : ''}">◆ ${name}</span>`).join('')}
        </div>
      </div>
      ${side.map(id => {
        const q = quests[id];
        const s = game.quests[id] || 0;
        const qs = q.stages[Math.min(s, q.stages.length - 1)];
        return `<div class="quest-entry side ${s >= q.stages.length - 1 ? 'done' : ''}">
          <h4>${esc(q.name)}</h4>
          <p><strong style="color:var(--teal)">${esc(qs.title)}.</strong> ${esc(qs.desc)}</p>
          <span class="quest-state">${s >= q.stages.length - 1 ? 'Completada' : 'En curso'}</span>
          ${id === 'lirios' ? `<span class="quest-state" style="color:var(--gold)">Lirios Lunares: ${p.countItem('lirio_lunar')} / 3</span>` : ''}
          ${id === 'forja' ? `<span class="quest-state" style="color:var(--gold)">Núcleos de Piedra: ${p.countItem('nucleo_piedra')} / 3</span>` : ''}
          ${id === 'nino' ? `<span class="quest-state" style="color:var(--gold)">Espada de Madera: ${p.countItem('espada_madera') ? 'encontrada' : 'perdida'}</span>` : ''}
        </div>`;
      }).join('')}
    </div>
    <div class="settings-note" style="margin-top:14px">Las misiones secundarias se completan hablando con Mira, Bran y Nilo en Vado Lirio. Los secretos del mapa recompensan la exploración.</div>`;
}

// ------------------------------- Mapa -------------------------------
const MAP_SCALE = 8;
const TILE_COLORS = {
  0: '#557b48', 1: '#9b835e', 2: '#355b3d', 3: '#28606e', 4: '#6c6c74',
  5: '#3d3b49', 6: '#c9b789', 7: '#56525c', 8: '#5c5b74', 9: '#77716a',
  10: '#8b8c83', 11: '#466b47'
};

function getMapCanvas(ui, game) {
  if (ui._mapWorld === game.world && ui._mapCanvas) return ui._mapCanvas;
  const world = game.world;
  const canvas = document.createElement('canvas');
  canvas.width = world.w * MAP_SCALE;
  canvas.height = world.h * MAP_SCALE;
  const ctx = canvas.getContext('2d');
  for (let y = 0; y < world.h; y++) {
    for (let x = 0; x < world.w; x++) {
      const t = world.terrainAt(x, y);
      ctx.fillStyle = TILE_COLORS[t] || '#4f5d48';
      ctx.fillRect(x * MAP_SCALE, y * MAP_SCALE, MAP_SCALE, MAP_SCALE);
    }
  }
  // Caminos más visibles.
  ctx.fillStyle = 'rgba(219,195,132,.3)';
  for (let y = 0; y < world.h; y++) for (let x = 0; x < world.w; x++) {
    if (world.terrainAt(x, y) === 1) ctx.fillRect(x * MAP_SCALE, y * MAP_SCALE, MAP_SCALE, MAP_SCALE);
  }
  // Edificios.
  for (const o of world.objects) {
    if (o.type === 'house' || o.type === 'wall') {
      ctx.fillStyle = '#3a3040';
      const r = o.rect || { x: o.x - 30, y: o.y - 30, w: 60, h: 50 };
      ctx.fillRect(r.x / 48 * MAP_SCALE, r.y / 48 * MAP_SCALE, Math.max(4, r.w / 48 * MAP_SCALE), Math.max(4, r.h / 48 * MAP_SCALE));
    }
  }
  ui._mapWorld = world;
  ui._mapCanvas = canvas;
  return canvas;
}

function drawMarkers(ctx, ui, game, sx, sy, scale, full) {
  const world = game.world;
  const p = game.player;
  const dot = (x, y, color, radius = 3) => {
    const dx = (x / 48) * scale - sx, dy = (y / 48) * scale - sy;
    ctx.fillStyle = color;
    ctx.shadowBlur = 5; ctx.shadowColor = color;
    ctx.beginPath(); ctx.arc(dx, dy, radius, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;
  };
  for (const npc of world.npcs) dot(npc.x, npc.y, '#74d6cf', 2.5);
  for (const e of game.enemies) {
    if (e.dead) continue;
    dot(e.x, e.y, e.boss ? '#d7a8ff' : '#e07b71', e.boss ? 4 : 2.2);
  }
  for (const o of world.interactables) {
    if (o.type === 'chest' && !game.flags.chests[o.id]) dot(o.x, o.y, '#ffd56b', 2.5);
    if (o.type === 'crystal') dot(o.x, o.y, '#8fe8ff', 3);
  }
  dot(p.x, p.y, '#fff0b8', 4.5);
  if (full) {
    ctx.save();
    ctx.globalAlpha = 0.85;
    ctx.font = 'bold 11px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#f2e6c7';
    const labels = [
      ['Vado Lirio', 16 * 48, 53 * 48], ['Bosque de Ceniza', 43 * 48, 35 * 48],
      ['Ruinas de Aethel', 66 * 48, 27 * 48], ['Cantera', 63 * 48, 51 * 48],
      ['Lago Espejo', 52 * 48, 56 * 48], ['Puerta Celestial', 44 * 48, 11 * 48]
    ];
    for (const [name, x, y] of labels) {
      const dx = (x / 48) * scale - sx, dy = (y / 48) * scale - sy;
      ctx.strokeStyle = 'rgba(8,10,16,.75)'; ctx.lineWidth = 3;
      ctx.strokeText(name, dx, dy);
      ctx.fillText(name, dx, dy);
    }
    ctx.restore();
  }
}

export function drawMinimap(canvas, game, full = false) {
  if (!canvas || !game?.world || !game?.player) return;
  const ctx = canvas.getContext('2d');
  const base = getMapCanvas(game.ui || game._ui, game);
  const w = canvas.width, h = canvas.height;
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = '#080c14';
  ctx.fillRect(0, 0, w, h);
  if (full) {
    ctx.drawImage(base, 0, 0, w, h);
    drawMarkers(ctx, game.ui || game._ui, game, 0, 0, w / game.world.w, true);
    return;
  }
  const scale = MAP_SCALE;
  const tilesW = w / scale, tilesH = h / scale;
  const px = game.player.x / 48, py = game.player.y / 48;
  let sx = (px - tilesW / 2) * scale;
  let sy = (py - tilesH / 2) * scale;
  sx = Math.max(0, Math.min(base.width - w, sx));
  sy = Math.max(0, Math.min(base.height - h, sy));
  ctx.drawImage(base, sx, sy, w, h, 0, 0, w, h);
  drawMarkers(ctx, game.ui || game._ui, game, sx, sy, scale, false);
  ctx.strokeStyle = 'rgba(226,198,124,.22)';
  ctx.lineWidth = 1;
  ctx.strokeRect(0.5, 0.5, w - 1, h - 1);
}

export function mapTab(container, ui, game) {
  const p = game.player;
  const seals = ['sello_bosque', 'sello_piedra', 'sello_espectro'].filter(id => p.countItem(id) > 0).length;
  container.innerHTML = `
    <div class="map-layout">
      <div class="map-canvas-wrap"><canvas id="world-map" width="880" height="760"></canvas></div>
      <div>
        <div class="section-title">Leyenda</div>
        <div class="map-legend">
          <div class="legend-item"><span class="legend-dot" style="color:#fff0b8"></span>Tú</div>
          <div class="legend-item"><span class="legend-dot" style="color:#74d6cf"></span>Habitantes</div>
          <div class="legend-item"><span class="legend-dot" style="color:#e07b71"></span>Peligro</div>
          <div class="legend-item"><span class="legend-dot" style="color:#ffd56b"></span>Cofre sin abrir</div>
          <div class="legend-item"><span class="legend-dot" style="color:#8fe8ff"></span>Cristal de guardado</div>
          <div class="legend-item"><span class="legend-dot" style="color:#d7a8ff"></span>Jefe</div>
        </div>
        <div class="map-note" style="margin-top:14px">
          Sellos recuperados: <b style="color:var(--gold)">${seals} / 3</b><br>
          ${game.flags.gateOpen ? 'La Puerta Celestial está abierta.' : 'La barrera celestial sigue cerrada.'}
        </div>
        <div class="map-note" style="margin-top:10px">
          Explora los claros, la isla del lago y las ruinas. Los cofres brillan incluso en la oscuridad.
        </div>
      </div>
    </div>`;
  drawMinimap(container.querySelector('#world-map'), game, true);
}
