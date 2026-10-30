// Tienda de Tilo/Bran y gestión de las tres ranuras de guardado.
import { getItem } from './data.js';
import { esc, itemCanvas, rarityColor, statLines, statValueText } from './ui-model.js';
import { drawPortrait } from './render.js';
import { listSaves, readSave, deleteSave } from './save.js';
import { formatTime } from './utils.js';

const SHOP_ROLES = {
  tilo: { role: 'merchant', greeting: '¡Ah, el héroe del alba! Tengo pociones, acero y algún que otro secreto a buen precio.' },
  bran: { role: 'smith', greeting: 'El fuego está encendido. Si buscas algo que corte de verdad, has venido al sitio correcto.' }
};

export function openShop(ui, game, vendor, stock, options = {}) {
  const info = SHOP_ROLES[vendor] || SHOP_ROLES.tilo;
  const uniqueStock = [...new Set(stock)];
  ui.shopVendor = vendor;
  ui.openPanel({
    title: vendor === 'bran' ? 'Forja de Bran' : 'Tienda de Tilo',
    subtitle: vendor === 'bran' ? 'Acero, ceniza y orgullo' : 'Suministros para el camino',
    tabs: [
      { id: 'buy', label: 'Comprar', icon: '◈', render: (c, u, g) => shopBuyTab(c, u, g, uniqueStock, info, options.fromTitle) },
      { id: 'sell', label: 'Vender', icon: '◇', render: (c, u, g) => shopSellTab(c, u, g, options.fromTitle) }
    ],
    footer: `<span class="lumens" id="shop-lumens">◈ ${game.player.lumens} lumenes</span><span class="foot-hint"><span class="keycap">Esc</span> salir</span>`,
    onClose: () => {
      if (options.onClose) options.onClose();
      else if (!options.fromTitle) game.resume();
    }
  });
}

function updateLumens(ui, game) {
  const el = ui.overlay?.querySelector('#shop-lumens');
  if (el) el.innerHTML = `◈ ${game.player.lumens} lumenes`;
}

function vendorHeader(info, name) {
  return `<div class="status-top" style="grid-template-columns:96px 1fr;margin-bottom:12px">
    <div class="status-portrait" style="width:96px;height:96px"><canvas id="shop-portrait" width="192" height="192"></canvas></div>
    <div><div class="status-name" style="font-size:22px">${esc(name)}</div><div class="detail-desc" style="margin-top:6px">${esc(info.greeting)}</div></div>
  </div>`;
}

function shopBuyTab(container, ui, game, stock, info, fromTitle) {
  const p = game.player;
  container.innerHTML = `${vendorHeader(info, ui.shopVendor === 'bran' ? 'Bran' : 'Tilo')}
    <div class="section-title">Mercancía</div>
    <div class="picker-list" id="shop-list"></div>`;
  const portrait = container.querySelector('#shop-portrait');
  if (portrait) drawPortrait(portrait, info.role, ui.shopVendor === 'bran' ? 'Bran' : 'Tilo', game.elapsed || 0);
  const list = container.querySelector('#shop-list');
  for (const id of stock) {
    const item = getItem(id);
    if (!item) continue;
    const equipment = ['weapon', 'shield', 'armor', 'accessory'].includes(item.type);
    const owned = equipment && (Object.values(p.equipment).includes(id) || p.countItem(id) > 0);
    const row = document.createElement('div');
    row.className = 'picker-item';
    row.style.cursor = 'default';
    row.appendChild(itemCanvas(item, 40));
    row.insertAdjacentHTML('beforeend', `<div style="flex:1">${esc(item.name)}<small>${esc(statLines(item).slice(0, 2).map(l => `${l.label} ${statValueText(l)}`).join(' · '))}</small></div>
      <div class="lumens" style="min-width:62px;text-align:right">◈ ${item.price}</div>`);
    const buy = document.createElement('button');
    buy.className = 'btn secondary';
    buy.style.marginLeft = '8px';
    buy.textContent = owned ? 'Comprado' : 'Comprar';
    buy.disabled = owned || p.lumens < item.price;
    buy.onclick = () => {
      if (p.lumens < item.price) {
        ui.toast('Sin lumenes suficientes', `Necesitas ${item.price} lumenes.`, 'warning');
        return;
      }
      p.lumens -= item.price;
      p.addItem(id, 1);
      game.audio.sfx('coin', { volume: 0.7 });
      game.audio.sfx('pickup', { volume: 0.4 });
      ui.toast('Compra realizada', item.name, 'success', 2200);
      updateLumens(ui, game);
      ui.refreshPanel();
    };
    row.appendChild(buy);
    list.appendChild(row);
  }
}

function shopSellTab(container, ui, game, fromTitle) {
  const p = game.player;
  const sellable = Object.keys(p.inventory)
    .map(getItem)
    .filter(item => item && item.type !== 'quest' && !Object.values(p.equipment).includes(item.id) && (item.price || 0) > 0);
  container.innerHTML = `<div class="settings-note">Vende materiales y objetos que no uses. Las piezas equipadas y los objetos de misión no se pueden vender.</div>
    <div class="section-title">Tu bolsa</div><div class="picker-list" id="sell-list"></div>`;
  const list = container.querySelector('#sell-list');
  if (!sellable.length) {
    list.innerHTML = '<p class="empty-note">No tienes nada que vender.</p>';
    return;
  }
  for (const item of sellable) {
    const price = Math.max(1, Math.floor((item.price || 0) * 0.42));
    const row = document.createElement('div');
    row.className = 'picker-item';
    row.style.cursor = 'default';
    row.appendChild(itemCanvas(item, 40));
    row.insertAdjacentHTML('beforeend', `<div style="flex:1">${esc(item.name)}<small>×${p.countItem(item.id)} · valor ${price} lumenes</small></div>`);
    const sell = document.createElement('button');
    sell.className = 'btn secondary';
    sell.textContent = 'Vender';
    sell.onclick = () => {
      p.removeItem(item.id, 1);
      p.lumens += price;
      game.audio.sfx('coin', { volume: 0.6 });
      ui.toast('Vendido', `${item.name} · +${price} lumenes`, 'loot', 2200);
      updateLumens(ui, game);
      ui.refreshPanel();
    };
    row.appendChild(sell);
    list.appendChild(row);
  }
}

export function openSaves(ui, game, options = {}) {
  const mode = options.mode || 'save';
  ui.openPanel({
    title: mode === 'save' ? 'Guardar partida' : 'Cargar partida',
    subtitle: 'Tres ranuras locales · guardado en este navegador',
    tabs: [{
      id: 'saves', label: 'Ranuras', icon: '▣',
      render: (c, u, g) => renderSaveList(c, u, g, { mode, fromTitle: options.fromTitle, onLoad: options.onLoad })
    }],
    footer: '<span>Los datos se guardan solo en este dispositivo</span><span class="foot-hint"><span class="keycap">Esc</span> volver</span>',
    onClose: () => {
      if (options.onClose) options.onClose();
      else if (!options.fromTitle) game.resume();
    }
  });
}

export function renderSaveList(container, ui, game, options = {}) {
  const mode = options.mode || 'save';
  const saves = listSaves();
  container.innerHTML = `<div class="save-list" id="save-list">${saves.map(save => {
    if (save.empty) {
      return `<div class="save-slot empty">
        <div class="save-index">${save.slot}</div>
        <div class="save-meta"><div class="save-name">Ranura vacía</div><div class="save-info">Sin datos${save.corrupt ? ' · archivo dañado' : ''}</div></div>
        <div class="save-actions">${mode === 'save' ? `<button class="btn primary" data-save="${save.slot}">Guardar</button>` : ''}</div>
      </div>`;
    }
    const date = save.timestamp ? new Date(save.timestamp).toLocaleString('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—';
    return `<div class="save-slot">
      <div class="save-index">${save.slot}</div>
      <div class="save-meta">
        <div class="save-name">${esc(save.name)} <span style="font-size:10px;color:var(--teal)">Nv. ${save.level}</span></div>
        <div class="save-info">${esc(save.zone)} · ${esc(save.quest)} · ${formatTime(save.playtime)} · ${date}</div>
        <div class="save-info">Dificultad: ${esc(save.difficulty)} · Criaturas: ${save.captured} / 5</div>
      </div>
      <div class="save-actions">
        ${mode === 'save' ? `<button class="btn primary" data-save="${save.slot}">Sobrescribir</button>` : ''}
        <button class="btn secondary" data-load="${save.slot}">Cargar</button>
        <button class="btn danger" data-delete="${save.slot}">Borrar</button>
      </div>
    </div>`;
  }).join('')}</div>`;
  container.querySelectorAll('[data-save]').forEach(button => {
    button.onclick = () => {
      const slot = Number(button.dataset.save);
      if (game.state === 'title' || game.state === 'creation' || game.state === 'prologue') {
        ui.toast('No hay partida activa', 'Inicia una aventura antes de guardar.', 'warning');
        return;
      }
      if (game.saveToSlot(slot)) {
        ui.toast('Partida guardada', `Ranura ${slot} · ${game.currentZone?.name || 'Lumen'}`, 'success', 2800);
        ui.updateSaveNote();
        renderSaveList(container, ui, game, options);
      }
    };
  });
  container.querySelectorAll('[data-load]').forEach(button => {
    button.onclick = () => {
      const slot = Number(button.dataset.load);
      if (game.loadSlot(slot)) {
        ui.closeOverlay({ silent: true });
        ui.toast('Partida cargada', `Ranura ${slot}`, 'success', 2600);
      }
    };
  });
  container.querySelectorAll('[data-delete]').forEach(button => {
    button.onclick = () => {
      const slot = Number(button.dataset.delete);
      deleteSave(slot);
      ui.toast('Ranura borrada', `La ranura ${slot} está libre.`, 'info', 2200);
      ui.updateSaveNote();
      renderSaveList(container, ui, game, options);
    };
  });
}
