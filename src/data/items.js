export const RARITY = {
  common: { label: 'Común', color: '#b8c0cc' },
  rare: { label: 'Raro', color: '#7fa8ff' },
  epic: { label: 'Épico', color: '#c08cff' },
  legendary: { label: 'Legendario', color: '#ffcb78' },
};

export const ITEMS = {
  // ===== ARMAS =====
  espada_oxidada: { id: 'espada_oxidada', name: 'Espada Oxidada', type: 'weapon', slot: 'weapon', rarity: 'common', price: 0, atk: 3, desc: 'Una hoja humilde, pero afilada por la necesidad. Fue tuya antes de que recordaras tu nombre.', weapon: 'sword', speed: 1.0 },
  filo_lumen: { id: 'filo_lumen', name: 'Filo de Lumen', type: 'weapon', slot: 'weapon', rarity: 'rare', price: 360, atk: 8, int: 2, crit: 3, desc: 'Forjada con agua de manantial y luz de luna. Su filo canta cuando golpea.', weapon: 'sword', speed: 1.05 },
  mandoble_ceniza: { id: 'mandoble_ceniza', name: 'Mandoble de Ceniza', type: 'weapon', slot: 'weapon', rarity: 'epic', price: 620, atk: 15, speed: -2, def: 1, desc: 'Pesada como una montaña, lenta como un juramento. Cada golpe deja un rastro de brasas.', weapon: 'greatsword', speed: .86 },
  dagas_susurro: { id: 'dagas_susurro', name: 'Dagas del Susurro', type: 'weapon', slot: 'weapon', rarity: 'rare', price: 520, atk: 6, spd: 4, crit: 7, desc: 'Dos hojas gemelas que parecen moverse antes que tu mano.', weapon: 'daggers', speed: 1.28 },
  baston_resonancia: { id: 'baston_resonancia', name: 'Bastón de Resonancia', type: 'weapon', slot: 'weapon', rarity: 'epic', price: 580, atk: 5, int: 9, mp: 15, desc: 'Un diapasón de madera celestial. Amplifica el pulso del alma.', weapon: 'staff', speed: .95 },
  espada_celestial: { id: 'espada_celestial', name: 'La Espada Celestial', type: 'weapon', slot: 'weapon', rarity: 'legendary', price: 0, atk: 24, int: 6, crit: 10, hp: 20, desc: 'No fue forjada: fue recordada. La hoja que separa el Velo de la Primera Brasa.', weapon: 'celestial', speed: 1.12 },

  // ===== ARMADURAS =====
  tunica_errante: { id: 'tunica_errante', name: 'Túnica del Errante', type: 'armor', slot: 'armor', rarity: 'common', price: 0, def: 2, spd: 1, desc: 'Tela de viaje remendada con hilo de plata. Ligera y silenciosa.', armorLook: 0 },
  coraza_guardia: { id: 'coraza_guardia', name: 'Coraza de la Guardia', type: 'armor', slot: 'armor', rarity: 'common', price: 220, def: 5, hp: 8, desc: 'Acero de Lumen. Ha detenido más flechas de las que su dueño recuerda.', armorLook: 1 },
  manto_erudito: { id: 'manto_erudito', name: 'Manto del Erudito', type: 'armor', slot: 'armor', rarity: 'rare', price: 280, def: 1, int: 4, mp: 18, desc: 'Bordado con ecuaciones que solo se leen bajo la lluvia.', armorLook: 2 },
  cota_ceniza: { id: 'cota_ceniza', name: 'Cota de Ceniza', type: 'armor', slot: 'armor', rarity: 'rare', price: 460, def: 8, hp: 14, spd: -1, desc: 'Escamas de draco fundidas con obsidiana. Aún conserva el calor de su dueño anterior.', armorLook: 1 },
  placa_celestial: { id: 'placa_celestial', name: 'Placa Celestial', type: 'armor', slot: 'armor', rarity: 'epic', price: 720, def: 12, hp: 24, int: 3, desc: 'Armadura ritual del Coro. Las constelaciones se mueven lentamente sobre el metal.', armorLook: 2 },
  sudario_origen: { id: 'sudario_origen', name: 'Sudario del Origen', type: 'armor', slot: 'armor', rarity: 'legendary', price: 0, def: 15, hp: 40, stam: 15, spd: 2, desc: 'Tejido con el primer suspiro del mundo. No pesa; recuerda.', armorLook: 2 },

  // ===== CASCOS =====
  capucha_errante: { id: 'capucha_errante', name: 'Capucha del Errante', type: 'helm', slot: 'helm', rarity: 'common', price: 0, def: 1, desc: 'Protege del sol, de la lluvia y de las miradas ajenas.', helmLook: 0 },
  yelmo_guardia: { id: 'yelmo_guardia', name: 'Yelmo de la Guardia', type: 'helm', slot: 'helm', rarity: 'common', price: 160, def: 3, hp: 5, desc: 'El emblema de Lumen está casi borrado. Casi.', helmLook: 1 },
  diadema_oraculo: { id: 'diadema_oraculo', name: 'Diadema del Oráculo', type: 'helm', slot: 'helm', rarity: 'rare', price: 300, def: 1, int: 5, luck: 2, desc: 'Una media luna de plata que susurra cuando algo importante está cerca.', helmLook: 2 },
  corona_velo: { id: 'corona_velo', name: 'Corona del Velo', type: 'helm', slot: 'helm', rarity: 'epic', price: 640, def: 5, int: 4, mp: 20, desc: 'Quien la lleva puede oír el silencio entre las notas del mundo.', helmLook: 2 },

  // ===== ACCESORIOS =====
  amuleto_lumen: { id: 'amuleto_lumen', name: 'Amuleto de Lumen', type: 'accessory', slot: 'accessory', rarity: 'rare', price: 280, hp: 20, def: 2, desc: 'Una gota de ámbar con una luciérnaga dormida dentro.', accLook: 1 },
  anillo_filo: { id: 'anillo_filo', name: 'Anillo del Filo Perfecto', type: 'accessory', slot: 'accessory', rarity: 'epic', price: 520, atk: 5, crit: 8, desc: 'El metal vibra un instante antes de cada golpe certero.', accLook: 2 },
  lagrima_eco: { id: 'lagrima_eco', name: 'Lágrima de Eco', type: 'accessory', slot: 'accessory', rarity: 'rare', price: 340, mp: 25, int: 3, desc: 'Una lágrima que nunca cayó. Repite en voz baja los hechizos que olvidaste.', accLook: 3 },
  colgante_jugador: { id: 'colgante_jugador', name: 'Colgante de Jugador Cero', type: 'accessory', slot: 'accessory', rarity: 'legendary', price: 0, luck: 8, crit: 6, spd: 3, desc: 'Un dado de ocho caras tallado en hueso de estrella. La Profecía no sabía que existía.', accLook: 4 },
  brazal_resonancia: { id: 'brazal_resonancia', name: 'Brazal de Resonancia', type: 'accessory', slot: 'accessory', rarity: 'epic', price: 480, stam: 20, int: 4, spd: 2, desc: 'Cada criatura vinculada deja una nota en su interior.', accLook: 2 },

  // ===== CAPAS =====
  capa_errante: { id: 'capa_errante', name: 'Capa del Errante', type: 'cloak', slot: 'cloak', rarity: 'common', price: 0, def: 1, spd: 1, desc: 'Un trozo de cielo nocturno que decidió acompañarte.', cloak: 0 },
  capa_guardian: { id: 'capa_guardian', name: 'Capa del Guardián', type: 'cloak', slot: 'cloak', rarity: 'rare', price: 380, def: 4, hp: 12, desc: 'El bosque la recuerda. Las ramas se apartan a tu paso.', cloak: 1 },
  capa_aurora: { id: 'capa_aurora', name: 'Capa de Aurora', type: 'cloak', slot: 'cloak', rarity: 'legendary', price: 0, def: 6, spd: 4, int: 4, desc: 'Luz del norte convertida en tela. Cambia de color según tu pulso.', cloak: 2 },

  // ===== CONSUMIBLES =====
  pocion_menor: { id: 'pocion_menor', name: 'Poción de Lumen', type: 'consumable', rarity: 'common', price: 35, desc: 'Restaura 45 de vida.', use: 'heal', amount: 45, color: '#e45d62' },
  pocion_mayor: { id: 'pocion_mayor', name: 'Poción de Brasa', type: 'consumable', rarity: 'rare', price: 90, desc: 'Restaura 120 de vida.', use: 'heal', amount: 120, color: '#e45d62' },
  eter: { id: 'eter', name: 'Éter de Origen', type: 'consumable', rarity: 'common', price: 55, desc: 'Restaura 40 de maná.', use: 'mana', amount: 40, color: '#6f96ef' },
  pan_viaje: { id: 'pan_viaje', name: 'Pan de Viaje', type: 'consumable', rarity: 'common', price: 15, desc: 'Restaura 25 de vida y 10 de resistencia.', use: 'snack', amount: 25, color: '#d7b77c' },
  elixir: { id: 'elixir', name: 'Elixir de la Primera Brasa', type: 'consumable', rarity: 'epic', price: 240, desc: 'Restaura toda la vida y el maná.', use: 'full', amount: 999, color: '#ffcb78' },
  incienso: { id: 'incienso', name: 'Incienso de Resonancia', type: 'consumable', rarity: 'rare', price: 75, desc: 'Aumenta un 30% la afinidad de tu próxima resonancia.', use: 'resonance', amount: 30, color: '#b18cff' },

  // ===== MATERIALES =====
  flor_lumen: { id: 'flor_lumen', name: 'Flor de Lumen', type: 'material', rarity: 'common', price: 18, desc: 'Brilla incluso bajo la tierra. Elara las usa para sus remedios.' },
  ascuas: { id: 'ascuas', name: 'Ascua Viva', type: 'material', rarity: 'common', price: 25, desc: 'Una brasa que no quema. Late como un corazón pequeño.' },
  eco: { id: 'eco', name: 'Eco de Memoria', type: 'material', rarity: 'rare', price: 40, desc: 'Un fragmento de una canción que alguien olvidó.' },
  colmillo: { id: 'colmillo', name: 'Colmillo de Ceniza', type: 'material', rarity: 'common', price: 22, desc: 'Duro como el hierro, tibio como un animal dormido.' },
  esencia: { id: 'esencia', name: 'Esencia Resonante', type: 'material', rarity: 'rare', price: 45, desc: 'El residuo luminoso que deja una criatura al confiar en ti.' },
  fragmento_gema: { id: 'fragmento_gema', name: 'Fragmento de la Gema Celestial', type: 'key', rarity: 'legendary', price: 0, desc: 'Una esquirla de la Gema que sostiene el Velo. Canta si la acercas al oído.' },
  lagrima_brasa: { id: 'lagrima_brasa', name: 'Lágrima de la Primera Brasa', type: 'key', rarity: 'legendary', price: 0, desc: 'No está caliente. Está dolida. La primera llama lloró una sola vez.' },
  jarra_origen: { id: 'jarra_origen', name: 'Jarra de Origen', type: 'key', rarity: 'legendary', price: 0, desc: 'El recipiente donde el mundo guarda su canción. Está agrietada.' },
  martillo_borin: { id: 'martillo_borin', name: 'Martillo de Borin', type: 'key', rarity: 'rare', price: 0, desc: 'El viejo martillo del herrero. Su mango está tallado con nombres de aprendices.' },
};

export const EQUIP_SLOTS = [
  { id: 'weapon', label: 'Arma', icon: '⚔' },
  { id: 'armor', label: 'Armadura', icon: '◈' },
  { id: 'helm', label: 'Casco', icon: '⌂' },
  { id: 'accessory', label: 'Accesorio', icon: '✦' },
  { id: 'cloak', label: 'Capa', icon: '◣' },
];

export const STARTING_KITS = [
  {
    id: 'errante', name: 'El Errante', tag: 'EQUILIBRADO', desc: 'Espada y capa. Sin excesos, sin debilidades. La hoja recuerda a quien la empuña.',
    weapon: 'espada_oxidada', armor: 'tunica_errante', helm: 'capucha_errante', accessory: null, cloak: 'capa_errante',
    bonus: { spd: 1, luck: 1 }, signature: 'Filo equilibrado: combos de tres golpes y esquiva generosa.'
  },
  {
    id: 'guardia', name: 'La Guardia', tag: 'RESISTENTE', desc: 'Coraza pesada y mandoble. No esquivas el golpe: lo recibes y respondes.',
    weapon: 'mandoble_ceniza', armor: 'coraza_guardia', helm: 'yelmo_guardia', accessory: null, cloak: null,
    bonus: { def: 3, hp: 10, spd: -1 }, signature: 'Golpes lentos pero devastadores. Bloqueo más eficaz.'
  },
  {
    id: 'erudito', name: 'La Erudita', tag: 'ARCANO', desc: 'Bastón de resonancia y manto bordado. El maná es tu segunda espada.',
    weapon: 'baston_resonancia', armor: 'manto_erudito', helm: 'diadema_oraculo', accessory: 'lagrima_eco', cloak: null,
    bonus: { int: 4, mp: 15, def: -1 }, signature: 'Habilidades más potentes y regeneración de maná acelerada.'
  }
];

export const STAT_DEFS = [
  { id: 'hp', name: 'Vida', desc: '+12 vida máxima', icon: '♥' },
  { id: 'mp', name: 'Maná', desc: '+8 maná máximo', icon: '◆' },
  { id: 'stam', name: 'Resistencia', desc: '+6 aguante y regeneración', icon: '◉' },
  { id: 'str', name: 'Fuerza', desc: '+2,2 daño de arma', icon: '⚔' },
  { id: 'def', name: 'Defensa', desc: '+1,6 reducción de daño', icon: '◈' },
  { id: 'spd', name: 'Velocidad', desc: '+2% movimiento y ataque', icon: '➤' },
  { id: 'int', name: 'Inteligencia', desc: '+2,4 poder de habilidad', icon: '✦' },
  { id: 'luck', name: 'Suerte', desc: '+1,2% crítico y resonancia', icon: '☘' },
];

export function getItem(id) { return ITEMS[id] || null; }

export function itemStats(item) {
  if (!item) return {};
  return { atk: item.atk || 0, def: item.def || 0, hp: item.hp || 0, mp: item.mp || 0, stam: item.stam || 0, spd: item.spd || 0, int: item.int || 0, luck: item.luck || 0, crit: item.crit || 0 };
}

export function statLine(item) {
  const parts = [];
  const labels = { atk: 'ATQ', def: 'DEF', hp: 'VID', mp: 'MAN', stam: 'RES', spd: 'VEL', int: 'INT', luck: 'SUE', crit: 'CRÍT' };
  for (const [k, v] of Object.entries(itemStats(item))) if (v) parts.push(`${v > 0 ? '+' : ''}${v} ${labels[k]}`);
  return parts.join('  ');
}
