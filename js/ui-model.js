// Modelo de presentación compartido por los paneles de interfaz.
import { getItem, RARITY, ITEMS, WEAPONS } from './data.js';
import { drawItemIcon, drawCreatureIcon, drawHero, drawPortrait } from './render.js';

export const esc = value => String(value ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

export const TYPE_LABEL = {
  weapon: 'Arma', shield: 'Escudo', armor: 'Armadura', accessory: 'Accesorio',
  consumable: 'Consumible', material: 'Material', quest: 'Objeto de misión'
};

export const WEAPON_LABEL = {
  sword: 'Espada', dagger: 'Daga', spear: 'Lanza', greatsword: 'Mandoble',
  bow: 'Arco', staff: 'Bastón'
};

export const STAT_LABEL = {
  vit: 'Vitalidad', str: 'Fuerza', atk: 'Ataque', def: 'Defensa', hp: 'Vida', mp: 'Maná', agi: 'Agilidad',
  int: 'Intelecto', luck: 'Suerte', crit: 'Crítico', stamina: 'Resistencia'
};

export function rarityOf(item) {
  return RARITY[item?.rarity || 0] || RARITY[0];
}

export function rarityColor(item) {
  return rarityOf(item).color;
}

export function itemTypeLabel(item) {
  if (!item) return '';
  if (item.type === 'weapon') return `${TYPE_LABEL.weapon} · ${WEAPON_LABEL[item.weaponType] || 'Arma'}`;
  return TYPE_LABEL[item.type] || 'Objeto';
}

export function weaponClass(item) {
  if (!item) return 'Viajero del Alba';
  const map = {
    sword: 'Hoja del Alba', dagger: 'Sombra Veloz', spear: 'Centinela',
    greatsword: 'Portador de Ceniza', bow: 'Ojo del Bosque', staff: 'Voz de las Estrellas'
  };
  return map[item.weaponType] || 'Viajero del Alba';
}

export function statLines(item) {
  if (!item) return [];
  const lines = [];
  for (const [key, value] of Object.entries(item.stats || {})) {
    if (!value) continue;
    lines.push({ key, label: STAT_LABEL[key] || key, value });
  }
  if (item.crit) lines.push({ key: 'crit', label: 'Crítico', value: `+${item.crit}%` });
  if (item.block) lines.push({ key: 'block', label: 'Bloqueo', value: `${Math.round(item.block * 100)}%` });
  return lines;
}

export function statValueText(stat) {
  return typeof stat.value === 'number' ? `${stat.value > 0 ? '+' : ''}${stat.value}` : stat.value;
}

export function getOwnedItemIds(player) {
  const ids = new Set(Object.keys(player.inventory || {}));
  for (const id of Object.values(player.equipment || {})) if (id) ids.add(id);
  return [...ids].filter(id => !!getItem(id));
}

export function getOwnedWeapons(player) {
  return getOwnedItemIds(player)
    .map(getItem)
    .filter(item => item && item.type === 'weapon');
}

export function filterItems(ids, filter) {
  const items = ids.map(getItem).filter(Boolean);
  switch (filter) {
    case 'weapon': return items.filter(i => i.type === 'weapon');
    case 'armor': return items.filter(i => i.type === 'shield' || i.type === 'armor' || i.type === 'accessory');
    case 'consumable': return items.filter(i => i.type === 'consumable');
    case 'quest': return items.filter(i => i.type === 'quest' || i.type === 'material');
    default: return items;
  }
}

export function sortItems(items) {
  const order = { weapon: 0, shield: 1, armor: 2, accessory: 3, consumable: 4, material: 5, quest: 6 };
  return items.slice().sort((a, b) => {
    const t = (order[a.type] ?? 9) - (order[b.type] ?? 9);
    if (t !== 0) return t;
    return (b.rarity || 0) - (a.rarity || 0) || a.name.localeCompare(b.name, 'es');
  });
}

export function makeCanvas(size = 64) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  return canvas;
}

export function itemCanvas(item, size = 64) {
  const canvas = makeCanvas(size);
  drawItemIcon(canvas, item, rarityColor(item));
  return canvas;
}

export function creatureCanvas(def, size = 96) {
  const canvas = makeCanvas(size);
  drawCreatureIcon(canvas, def);
  return canvas;
}

export function mountItemIcon(parent, item, size = 48) {
  const canvas = itemCanvas(item, size);
  parent.appendChild(canvas);
  return canvas;
}

export function drawHeroPortrait(canvas, player) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const w = canvas.width, h = canvas.height;
  ctx.clearRect(0, 0, w, h);
  const bg = ctx.createRadialGradient(w * 0.5, h * 0.32, 4, w * 0.5, h * 0.55, w * 0.7);
  bg.addColorStop(0, '#2b3d5e');
  bg.addColorStop(1, '#0d1220');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);
  ctx.save();
  ctx.globalAlpha = 0.18;
  ctx.strokeStyle = '#f1d38a';
  ctx.lineWidth = 1;
  for (let i = 0; i < 3; i++) {
    ctx.beginPath(); ctx.arc(w / 2, h * 0.58, 24 + i * 17, 0, Math.PI * 2); ctx.stroke();
  }
  ctx.restore();
  const scale = Math.min(w, h) / 116;
  drawHero(ctx, {
    x: w / 2, y: h * 0.9, facing: -0.78, appearance: player.appearance,
    equipment: player.equipment, walk: 0, attackPose: 0, state: 'idle',
    time: 1.8, blocking: false, scale: scale * 1.5
  });
}

export function drawNpcPortrait(canvas, role, name, time = 0) {
  drawPortrait(canvas, role, name, time);
}

export function allItems() {
  return Object.values(ITEMS);
}

export function weaponById(id) {
  return WEAPONS[id] || null;
}
