// Objetos, equipo, materiales y consumibles.
export const RARITIES = [
  { name: 'Común', color: '#cfc6b8', glow: 'rgba(207,198,184,0.25)' },
  { name: 'Poco común', color: '#8fd18a', glow: 'rgba(143,209,138,0.3)' },
  { name: 'Raro', color: '#7fb7ff', glow: 'rgba(127,183,255,0.35)' },
  { name: 'Épico', color: '#c58bff', glow: 'rgba(197,139,255,0.4)' },
  { name: 'Legendario', color: '#ffcf6a', glow: 'rgba(255,207,106,0.5)' },
];

export const ITEMS = {
  // Armas
  rusty_sword: { name: 'Espada Oxidada', type: 'weapon', rarity: 0, value: 20, weaponType: 'sword', atk: 4, desc: 'Acero viejo, pero con un filo que aún recuerda la mano que lo empuñó.', color: '#b9a98e' },
  pilgrim_blade: { name: 'Filo del Peregrino', type: 'weapon', rarity: 1, value: 120, weaponType: 'sword', atk: 9, speed: 2, desc: 'Forjada para quienes caminan sin destino. Ligera y honesta.', color: '#d8d2c4' },
  lumen_blade: { name: 'Filo de Lumen', type: 'weapon', rarity: 2, value: 340, weaponType: 'sword', atk: 13, crit: 5, int: 2, desc: 'La luz de Valdoria duerme en su guarda. Corta la penumbra antes que la carne.', color: '#9fe8ff' },
  celestial_sword: { name: 'Espada Celestial', type: 'weapon', rarity: 4, value: 0, weaponType: 'sword', atk: 18, int: 4, crit: 4, desc: 'La hoja que la Gema Celestial dejó al romperse. No pertenece a este mundo; te reconoce como suyo.', color: '#ffe9a8', unique: true },
  obsidian_greatsword: { name: 'Mandoble de Obsidiana', type: 'weapon', rarity: 3, value: 620, weaponType: 'greatsword', atk: 26, speed: -6, def: 3, desc: 'Pesada como un juramento. Cada golpe abre la tierra y deja ceniza en el aire.', color: '#ff7b4d' },
  dawn_spear: { name: 'Lanza del Alba', type: 'weapon', rarity: 2, value: 380, weaponType: 'spear', atk: 14, speed: 4, crit: 3, desc: 'Alcanza más lejos de lo que la vista alcanza. El primer rayo del día tiene forma de punta.', color: '#ffd98a' },
  resonance_staff: { name: 'Cetro de Resonancia', type: 'weapon', rarity: 2, value: 400, weaponType: 'staff', atk: 8, int: 8, mp: 20, desc: 'Un diapasón de cristal que hace vibrar las almas dormidas de las criaturas.', color: '#b9a0ff' },
  first_flame: { name: 'Filo de la Primera Brasa', type: 'weapon', rarity: 4, value: 0, weaponType: 'greatsword', atk: 27, int: 5, crit: 5, desc: 'Forjada con la Lágrima de la Primera Brasa. Su fuego no quema: recuerda.', color: '#ff9a5c', unique: true },
  veil_edge: { name: 'Hoja del Velo', type: 'weapon', rarity: 3, value: 780, weaponType: 'sword', atk: 21, crit: 12, luck: 4, lifesteal: 0.06, desc: 'Corta lo que no debería existir. Deja en la herida un frío que no sana.', color: '#c7a4ff' },

  // Armaduras
  tunic: { name: 'Túnica de Valdoria', type: 'armor', rarity: 0, value: 15, def: 3, hp: 10, desc: 'Lana tejida con cariño. Huele a hoguera y a hierba recién cortada.', color: '#6f8f63' },
  lumen_mail: { name: 'Coraza de Lumen', type: 'armor', rarity: 2, value: 360, def: 9, hp: 35, mp: 10, desc: 'Escamas de plata viva. La luz se acumula en las juntas y estalla cuando la hieren.', color: '#9fc9d8' },
  ash_cloak: { name: 'Manto de Ceniza', type: 'armor', rarity: 2, value: 330, def: 7, hp: 20, speed: 3, desc: 'Tejido con hilo de volcán. Las chispas lo confunden con su hogar.', color: '#8a6a58' },
  obsidian_plate: { name: 'Placas de Obsidiana', type: 'armor', rarity: 3, value: 650, def: 16, hp: 55, speed: -4, desc: 'Blindaje de quien ya no teme al fuego porque lleva uno dentro.', color: '#4a4a5e' },
  kansordore_vestments: { name: 'Vestiduras de Kansordore', type: 'armor', rarity: 3, value: 720, def: 10, hp: 25, mp: 45, int: 5, desc: 'Tela bordada con constelaciones extintas. Cada hilo es una plegaria.', color: '#cfc2ff' },
  veil_shroud: { name: 'Sudario del Velo', type: 'armor', rarity: 4, value: 1100, def: 14, hp: 45, mp: 35, luck: 8, desc: 'Lo que no se ve, no puede herirte. Lo que no recuerdas, tampoco puede salvarte.', color: '#7d6a9e' },

  // Cascos
  hood: { name: 'Capucha de Viajero', type: 'helmet', rarity: 0, value: 12, def: 1, desc: 'Suficiente para la lluvia. No para la mirada de los dioses.', color: '#7b6a53' },
  lumen_helm: { name: 'Yelmo de Lumen', type: 'helmet', rarity: 2, value: 220, def: 5, hp: 15, desc: 'La visera está grabada con un sol que nunca se pone.', color: '#a9d7e8' },
  ash_hood: { name: 'Capucha de Brasa', type: 'helmet', rarity: 2, value: 210, def: 3, mp: 15, int: 2, desc: 'El humo que despide no molesta a quien lo lleva.', color: '#a06a4a' },
  obsidian_helm: { name: 'Yelmo de Obsidiana', type: 'helmet', rarity: 3, value: 380, def: 8, hp: 20, desc: 'Forjado en un yunque que aún late bajo la montaña.', color: '#5a5568' },
  halo: { name: 'Halo de Kansordore', type: 'helmet', rarity: 3, value: 460, def: 4, mp: 30, int: 4, desc: 'No es un adorno: es una corona que recuerda a su portador que fue luz.', color: '#ffe7a8' },
  veil_mask: { name: 'Máscara del Velo', type: 'helmet', rarity: 4, value: 800, def: 6, luck: 10, crit: 6, desc: 'Debajo no hay rostro. Solo la pregunta de quién eres cuando nadie mira.', color: '#b49ad9' },

  // Accesorios
  lucky_charm: { name: 'Amuleto de la Suerte', type: 'accessory', rarity: 1, value: 140, luck: 6, desc: 'Un dado de hueso que siempre cae en la cara que necesitas.', color: '#c9d78f' },
  resonance_ring: { name: 'Anillo de Resonancia', type: 'accessory', rarity: 2, value: 300, int: 3, mp: 20, capture: 0.08, desc: 'Zumba cuando una criatura está cerca. A veces responde en sueños.', color: '#b9a0ff' },
  ember_pendant: { name: 'Colgante de la Brasa', type: 'accessory', rarity: 2, value: 320, atk: 4, fireRes: 0.25, desc: 'Una brasa que no se apaga. Calienta las manos y las decisiones.', color: '#ff9a5c' },
  veil_eye: { name: 'Ojo del Velo', type: 'accessory', rarity: 3, value: 560, crit: 8, luck: 5, desc: 'Mira a través de ti. A veces parpadea cuando el mundo se equivoca.', color: '#c7a4ff' },
  pilgrim_boots: { name: 'Botas del Peregrino', type: 'accessory', rarity: 1, value: 180, speed: 5, dodge: 0.1, desc: 'Han recorrido tres reinos y aún no han encontrado su hogar.', color: '#a98f6c' },
  guardian_seal: { name: 'Sello del Guardián', type: 'accessory', rarity: 3, value: 500, def: 6, hp: 30, desc: 'La raíz que no se rompe. La promesa que no se olvida.', color: '#8fbf7a' },

  // Consumibles
  potion_lumen: { name: 'Poción de Lumen', type: 'consumable', rarity: 0, value: 35, heal: 0.45, desc: 'Restaura un 45% de la vida. Sabe a miel y a tormenta.', color: '#ff7b7b', stack: 99 },
  elixir_mana: { name: 'Elixir de Maná', type: 'consumable', rarity: 0, value: 30, mana: 0.5, desc: 'Restaura un 50% del maná. Deja un sabor metálico en la lengua.', color: '#7fb7ff', stack: 99 },
  tonic_stamina: { name: 'Tónico de Vigor', type: 'consumable', rarity: 0, value: 25, stamina: 1, desc: 'Restaura toda la resistencia. No cura el cansancio del alma.', color: '#8fd18a', stack: 99 },
  crystal_resonance: { name: 'Cristal de Resonancia', type: 'consumable', rarity: 1, value: 60, captureBonus: 0.25, desc: 'Amplifica el eco de una criatura debilitada. Se rompe al usarlo.', color: '#c7a4ff', stack: 99 },
  smoke_bomb: { name: 'Bomba de Humo', type: 'consumable', rarity: 1, value: 45, escape: true, desc: 'Ciega a los enemigos cercanos y permite escapar. Un clásico de Valdoria.', color: '#9a9a9a', stack: 20 },
  antidote: { name: 'Antídoto de Raíz', type: 'consumable', rarity: 0, value: 28, cleanse: true, desc: 'Neutraliza veneno y quemaduras. Amargo como una verdad temprana.', color: '#8fd18a', stack: 30 },

  // Materiales
  iron: { name: 'Hierro Antiguo', type: 'material', rarity: 0, value: 12, desc: 'Fragmentos de armas que sobrevivieron a sus dueños.', color: '#9a9a9a', stack: 999 },
  gem_shard: { name: 'Fragmento de Gema', type: 'material', rarity: 2, value: 90, desc: 'Una lasca de la Gema Celestial. Todavía canta si la acercas al oído.', color: '#9fe8ff', stack: 99 },
  resonance_essence: { name: 'Esencia de Resonancia', type: 'material', rarity: 1, value: 40, desc: 'El eco material de una criatura. Late como un corazón diminuto.', color: '#c7a4ff', stack: 999 },
  living_ash: { name: 'Ceniza Viva', type: 'material', rarity: 1, value: 35, desc: 'Ceniza que respira. En Drakmor, todo fuego recuerda.', color: '#d98a6a', stack: 999 },
  celestial_plume: { name: 'Pluma Celestial', type: 'material', rarity: 3, value: 110, desc: 'Cayó de un cielo que ya no existe. Pesa menos que un recuerdo.', color: '#ffe7a8', stack: 99 },
  moon_lily: { name: 'Lirio de Luna', type: 'material', rarity: 0, value: 18, desc: 'Florece solo cuando nadie mira. El altar de Valdoria las ansía.', color: '#d9e8ff', stack: 99 },
  ancient_page: { name: 'Página Prohibida', type: 'quest', rarity: 2, value: 0, desc: 'Texto que se reescribe mientras lo lees. La Biblioteca no perdona.', color: '#e8d9a8', stack: 9 },

  // Objetos de misión
  orin_hammer: { name: 'Martillo de Orin', type: 'quest', rarity: 1, value: 0, desc: 'El martillo del herrero. Tiene más historia que muchos reinos.', color: '#b9a98e', stack: 1 },
  first_tear: { name: 'Lágrima de la Primera Brasa', type: 'quest', rarity: 4, value: 0, desc: 'No es agua. Es el primer calor que conoció el mundo, condensado en una gota.', color: '#ff9a5c', stack: 1 },
  survivor_token: { name: 'Marca de los que no ardieron', type: 'quest', rarity: 1, value: 0, desc: 'Una chapa de hierro con cuatro muescas. Cada muesca es un nombre.', color: '#d8a76a', stack: 9 },
  seal_key: { name: 'Llave del Sello', type: 'quest', rarity: 3, value: 0, desc: 'Abre la puerta que separa el mundo de su propio recuerdo.', color: '#ffe7a8', stack: 1 },
};

export const CONSUMABLE_IDS = Object.keys(ITEMS).filter(id => ITEMS[id].type === 'consumable');
export const MATERIAL_IDS = Object.keys(ITEMS).filter(id => ITEMS[id].type === 'material');

export function itemRarity(item) { return RARITIES[item?.rarity || 0]; }
export function itemSlot(item) {
  if (!item) return null;
  return item.type === 'weapon' || item.type === 'armor' || item.type === 'helmet' || item.type === 'accessory' ? item.type : null;
}
export function itemStatLine(item) {
  if (!item) return [];
  const labels = { atk: 'ATQ', def: 'DEF', hp: 'VIDA', mp: 'MANÁ', crit: 'CRÍT.', speed: 'VEL.', luck: 'SUERTE', int: 'INT', str: 'FUE', lifesteal: 'ROBO', fireRes: 'RES. FUEGO', capture: 'CAPTURA', dodge: 'ESQUIVA' };
  return Object.entries(labels).filter(([k]) => item[k]).map(([k, label]) => {
    const v = item[k];
    const val = k === 'lifesteal' || k === 'fireRes' || k === 'capture' || k === 'dodge' ? `${Math.round(v * 100)}%` : `+${v}`;
    return { label, value: val, positive: v > 0 };
  });
}
