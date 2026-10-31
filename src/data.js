// ============================================================
// LA ESPADA CELESTIAL — datos de juego
// Apariencia, objetos, habilidades, hechizos, criaturas y enemigos.
// Todo el contenido es original.
// ============================================================

export const GAME = {
  title: 'La Espada Celestial',
  subtitle: 'Tres reinos. Un velo. Una memoria que despierta.',
  version: '1.0.0',
  studio: 'IA Game Lab',
  language: 'es-ES',
};

export const APPEARANCE = {
  faces: [
    { id: 'serena', name: 'Serena', skin: '#e8b98f', eye: '#3b6b57', mark: 'none' },
    { id: 'morena', name: 'Cobriza', skin: '#b97a52', eye: '#5a3524', mark: 'none' },
    { id: 'palida', name: 'Lunar', skin: '#f2d4b8', eye: '#6f8fb8', mark: 'none' },
    { id: 'bronce', name: 'Bronce', skin: '#cf9a6a', eye: '#3e5f8a', mark: 'scar' },
    { id: 'ceniza', name: 'Ceniza', skin: '#a98b78', eye: '#8f6bc4', mark: 'mark' },
    { id: 'alba', name: 'Alba', skin: '#f0c9a5', eye: '#b17a3c', mark: 'freckles' },
  ],
  hairs: [
    { id: 'corto', name: 'Corto' },
    { id: 'largo', name: 'Largo' },
    { id: 'coleta', name: 'Coleta' },
    { id: 'trenza', name: 'Trenza' },
    { id: 'salvaje', name: 'Salvaje' },
    { id: 'rapado', name: 'Rapado' },
  ],
  hairColors: [
    { id: 'azabache', name: 'Azabache', color: '#2b2233', hi: '#4a3c55' },
    { id: 'castano', name: 'Castaño', color: '#5b3a28', hi: '#8a5a3c' },
    { id: 'oro', name: 'Oro', color: '#c9973f', hi: '#f0d17a' },
    { id: 'plata', name: 'Plata', color: '#b9c2cc', hi: '#eef3f8' },
    { id: 'carmesi', name: 'Carmesí', color: '#8e3040', hi: '#c95a68' },
    { id: 'turquesa', name: 'Turquesa', color: '#2f6f74', hi: '#6fc3c1' },
    { id: 'violeta', name: 'Violeta', color: '#5b3f8c', hi: '#9a7bd4' },
  ],
  outfits: [
    { id: 'viajero', name: 'Viajero', cloth: '#3f6d8c', cloth2: '#294a61', trim: '#d9b46a', cape: false },
    { id: 'guardian', name: 'Guardián', cloth: '#5b6578', cloth2: '#3d4658', trim: '#c9a86a', cape: true },
    { id: 'erudito', name: 'Erudito', cloth: '#6b4b8a', cloth2: '#4a3262', trim: '#c7a8ff', cape: false },
    { id: 'ceniza', name: 'Ceniza', cloth: '#6b3f36', cloth2: '#472a26', trim: '#ff9a6a', cape: true },
    { id: 'celeste', name: 'Celeste', cloth: '#3e6f8f', cloth2: '#2a4f6b', trim: '#9fe8ff', cape: true },
  ],
  accessories: [
    { id: 'ninguno', name: 'Ninguno' },
    { id: 'bufanda', name: 'Bufanda' },
    { id: 'pendiente', name: 'Pendiente' },
    { id: 'halo', name: 'Halo' },
    { id: 'parche', name: 'Parche' },
    { id: 'cuerno', name: 'Cuerno' },
  ],
};

export const PORTRAITS = {
  player: { skin: '#e8b98f', hair: '#2b2233', hairHi: '#4a3c55', cloth: '#3f6d8c', trim: '#d9b46a', eye: '#3b6b57', role: 'Jugador Cero' },
  elara: { skin: '#d8b08a', hair: '#d8d8e0', hairHi: '#ffffff', cloth: '#3d5a78', trim: '#d9b46a', eye: '#5a8f80', role: 'Maestra Resonadora', age: 1 },
  nima: { skin: '#b97a52', hair: '#2b2233', hairHi: '#4a3c55', cloth: '#4b3a6b', trim: '#b48cff', eye: '#8f6bc4', role: 'Erudita de Kansordore' },
  kael: { skin: '#cf9a6a', hair: '#5b3a28', hairHi: '#8a5a3c', cloth: '#3e4a3a', trim: '#b9c95e', eye: '#3e5f8a', role: 'Ladrón de buen corazón', mark: 'scar' },
  marta: { skin: '#e0ae83', hair: '#8a5a3c', hairHi: '#b98254', cloth: '#7a4a3a', trim: '#e8c98a', eye: '#5a3a28', role: 'Mercader de Brisavelo', age: 1 },
  bron: { skin: '#a96f4a', hair: '#2b2233', hairHi: '#4a3c55', cloth: '#5a4636', trim: '#c9a86a', eye: '#3a2a20', role: 'Herrero de Brisavelo', beard: true },
  ordo: { skin: '#b98563', hair: '#8f8f96', hairHi: '#d8d8e0', cloth: '#5c3530', trim: '#c9a86a', eye: '#5a3524', role: 'General exiliado', beard: true, mark: 'scar' },
  serah: { skin: '#c98a5e', hair: '#8e3040', hairHi: '#c95a68', cloth: '#4a3a36', trim: '#ff9a6a', eye: '#c9973f', role: 'Herrera de Cindral' },
  archivista: { skin: '#e8d4bc', hair: '#b9c2cc', hairHi: '#ffffff', cloth: '#3d4f73', trim: '#9fe8ff', eye: '#7fd4ff', role: 'Archivista del Templo', age: 1 },
  lia: { skin: '#f0c9a5', hair: '#c9973f', hairHi: '#f0d17a', cloth: '#6b4b8a', trim: '#c7a8ff', eye: '#b17a3c', role: 'Niña de Brisavelo', child: true },
  guard: { skin: '#cf9a6a', hair: '#3b2a22', hairHi: '#5b3a28', cloth: '#5b6578', trim: '#d9b46a', eye: '#3e5f8a', role: 'Guardia de Brisavelo' },
  farmer: { skin: '#b97a52', hair: '#5b3a28', hairHi: '#8a5a3c', cloth: '#6a5a3a', trim: '#c9a86a', eye: '#3a2a20', role: 'Labriego' },
  cael: { skin: '#a98b78', hair: '#b9c2cc', hairHi: '#eef3f8', cloth: '#4a4a56', trim: '#9fe8ff', eye: '#8f6bc4', role: 'Hermano Cael', beard: true },
  citizen: { skin: '#c98a5e', hair: '#2b2233', hairHi: '#4a3c55', cloth: '#5a4636', trim: '#c9a86a', eye: '#5a3524', role: 'Ciudadano de Cindral' },
  varek: { skin: '#d8b08a', hair: '#2b2233', hairHi: '#4a3c55', cloth: '#2e2a3a', trim: '#8b6bff', eye: '#b48cff', role: 'Canciller Varek' },
  reina: { skin: '#a96f4a', hair: '#ff8a5c', hairHi: '#ffd166', cloth: '#3a2026', trim: '#ff5a36', eye: '#ffd166', role: 'La Reina Calcinada' },
  arquitecto: { skin: '#cbb8a0', hair: '#8b6bff', hairHi: '#dcc9ff', cloth: '#1b1630', trim: '#b48cff', eye: '#b48cff', role: 'El Arquitecto del Velo' },
  lumito: { creature: 'lumito', role: 'Eco del Alba' },
  brotin: { creature: 'brotin', role: 'Eco de Tierra' },
  nima_eco: { creature: 'buho', role: 'Eco de Aire' },
};

export const RARITY = {
  common: { name: 'Común', color: '#cfd6e2', mult: 1 },
  uncommon: { name: 'Poco común', color: '#7ddc9a', mult: 1.15 },
  rare: { name: 'Raro', color: '#7fb9ff', mult: 1.35 },
  epic: { name: 'Épico', color: '#c79bff', mult: 1.6 },
  legendary: { name: 'Legendario', color: '#ffd06a', mult: 2 },
};

export const ITEMS = {
  // ---------------- armas ----------------
  sword_alba: { id: 'sword_alba', name: 'Espada del Alba', type: 'weapon', rarity: 'common', icon: '⚔', value: 40, desc: 'La hoja que la Maestra Elara guardaba para ti. Su filo recuerda el primer amanecer de Valdoria.', stats: { atk: 8, crit: 2 }, color: '#e8e2cf', glow: '#ffe9a8', element: 'luz' },
  sword_brisa: { id: 'sword_brisa', name: 'Filo de Brisa', type: 'weapon', rarity: 'uncommon', icon: '⚔', value: 180, desc: 'Ligera como una hoja de otoño. El viento corrige cada tajo.', stats: { atk: 14, spd: 8, crit: 3 }, color: '#bfe6e2', glow: '#7ddcba', element: 'aire' },
  sword_ceniza: { id: 'sword_ceniza', name: 'Hoja de Ceniza', type: 'weapon', rarity: 'rare', icon: '⚔', value: 420, desc: 'Forjada en Cindral con el último aliento de un draco. Quema incluso el recuerdo.', stats: { atk: 23, crit: 4, fire: 8 }, color: '#d9a27a', glow: '#ff8a5c', element: 'fuego' },
  sword_celestial: { id: 'sword_celestial', name: 'Espada Celestial', type: 'weapon', rarity: 'legendary', icon: '✦', value: 0, desc: 'No es un arma: es una pregunta con filo. La Gema Celestial late en su guarda.', stats: { atk: 34, crit: 8, allDmg: 8 }, color: '#f4dfa3', glow: '#9fe8ff', element: 'luz', key: true },
  sword_verdad: { id: 'sword_verdad', name: 'Filo del Jugador Cero', type: 'weapon', rarity: 'legendary', icon: '✧', value: 0, desc: 'La espada que existe porque tú decidiste existir. Corta el Velo sin romper lo que hay detrás.', stats: { atk: 46, crit: 12, allDmg: 12 }, color: '#ffffff', glow: '#dcc9ff', element: 'velo', key: true },
  // ---------------- armaduras ----------------
  armor_viajero: { id: 'armor_viajero', name: 'Túnica de Viajero', type: 'armor', rarity: 'common', icon: '⛨', value: 30, desc: 'Cuero curtido y buenas intenciones. Suficiente para el primer paso.', stats: { def: 6, hp: 8 }, color: '#3f6d8c', trim: '#d9b46a' },
  armor_valdoria: { id: 'armor_valdoria', name: 'Coraza de Valdoria', type: 'armor', rarity: 'uncommon', icon: '⛨', value: 220, desc: 'Acero plateado con el emblema del árbol de Brisavelo. Los que la visten no caminan solos.', stats: { def: 14, hp: 24, stam: 8 }, color: '#6f7c8f', trim: '#d9b46a' },
  armor_ceniza: { id: 'armor_ceniza', name: 'Manto de Ceniza', type: 'armor', rarity: 'rare', icon: '⛨', value: 480, desc: 'Tejido con escamas de draco y juramentos rotos. El calor de Drakmor no lo atraviesa.', stats: { def: 22, hp: 36, fireRes: 20 }, color: '#5a3a32', trim: '#ff9a6a' },
  armor_celeste: { id: 'armor_celeste', name: 'Armadura Celeste', type: 'armor', rarity: 'epic', icon: '⛨', value: 900, desc: 'Placas de cristal vivo que cantan cuando el Velo se acerca.', stats: { def: 32, hp: 48, mp: 16, allDmg: 4 }, color: '#54708f', trim: '#9fe8ff' },
  // ---------------- cascos ----------------
  hood_viajero: { id: 'hood_viajero', name: 'Capucha de Viajero', type: 'helmet', rarity: 'common', icon: '⌂', value: 18, desc: 'Una capucha sencilla. Oculta la mirada y el miedo.', stats: { def: 3, luck: 3 }, color: '#294a61' },
  helm_valdoria: { id: 'helm_valdoria', name: 'Yelmo de Valdoria', type: 'helmet', rarity: 'uncommon', icon: '⌂', value: 140, desc: 'El yelmo de los centinelas del alba. La visera está grabada con una hoja de roble.', stats: { def: 7, hp: 10 }, color: '#8b96a8' },
  helm_ceniza: { id: 'helm_ceniza', name: 'Yelmo de Obsidiana', type: 'helmet', rarity: 'rare', icon: '⌂', value: 320, desc: 'Obsidiana pulida por la lava. Nunca se calienta.', stats: { def: 11, hp: 16, fireRes: 10 }, color: '#3a2a2a' },
  diadema_celeste: { id: 'diadema_celeste', name: 'Diadema Celeste', type: 'helmet', rarity: 'epic', icon: '⌂', value: 700, desc: 'Tres puntas de cristal que susurran el nombre de las estrellas.', stats: { def: 9, mp: 20, crit: 5 }, color: '#9fe8ff' },
  // ---------------- accesorios ----------------
  amulet_resonancia: { id: 'amulet_resonancia', name: 'Amuleto de Resonancia', type: 'accessory', rarity: 'uncommon', icon: '◉', value: 200, desc: 'Late cuando un eco está cerca. Facilita los vínculos.', stats: { capture: 20, mp: 8 }, color: '#b48cff' },
  ring_suerte: { id: 'ring_suerte', name: 'Anillo del Jugador Cero', type: 'accessory', rarity: 'rare', icon: '☘', value: 350, desc: 'Una sortija sin dueño. La fortuna parece mirarla de reojo.', stats: { luck: 18, crit: 4 }, color: '#ffd06a' },
  boots_viento: { id: 'boots_viento', name: 'Botas del Viento', type: 'accessory', rarity: 'rare', icon: '➤', value: 300, desc: 'Cada paso deja una pequeña ráfaga. Esquivas antes de que el mundo decida golpearte.', stats: { spd: 14, stam: 10 }, color: '#7ddcba' },
  tear_ember: { id: 'tear_ember', name: 'Lágrima de Brasa', type: 'accessory', rarity: 'epic', icon: '✹', value: 600, desc: 'Una gota de la Primera Brasa engarzada en oro. Aumenta el daño elemental.', stats: { allDmg: 6, fire: 15, mp: 10 }, color: '#ff8a5c' },
  eye_veil: { id: 'eye_veil', name: 'Ojo del Velo', type: 'accessory', rarity: 'epic', icon: '◉', value: 650, desc: 'Un cristal que ve lo que no debería. Mejora los críticos y revela secretos.', stats: { crit: 10, luck: 10, reveal: 1 }, color: '#8b6bff' },
  // ---------------- consumibles ----------------
  potion_lumen: { id: 'potion_lumen', name: 'Poción de Lumen', type: 'consumable', rarity: 'common', icon: '✚', value: 28, desc: 'Restaura un 45% de la salud máxima.', effect: { healPct: 0.45 }, stack: 9 },
  potion_mayor: { id: 'potion_mayor', name: 'Elixir del Alba', type: 'consumable', rarity: 'uncommon', icon: '✚', value: 80, desc: 'Restaura un 80% de la salud máxima y cura quemaduras.', effect: { healPct: 0.8, cleanse: true }, stack: 5 },
  mana_tears: { id: 'mana_tears', name: 'Lágrimas de Maná', type: 'consumable', rarity: 'common', icon: '✦', value: 35, desc: 'Restaura un 55% del maná máximo.', effect: { manaPct: 0.55 }, stack: 9 },
  stamina_herb: { id: 'stamina_herb', name: 'Hierba de Brisa', type: 'consumable', rarity: 'common', icon: '❧', value: 22, desc: 'Restaura toda la resistencia y acelera su regeneración durante 10 s.', effect: { staminaFull: true, haste: 10 }, stack: 9 },
  bond_essence: { id: 'bond_essence', name: 'Esencia de Vínculo', type: 'consumable', rarity: 'rare', icon: '❂', value: 120, desc: 'Aumenta un 30% la probabilidad del próximo vínculo.', effect: { bondBuff: 0.3 }, stack: 3 },
  phoenix_tear: { id: 'phoenix_tear', name: 'Lágrima de Fénix', type: 'consumable', rarity: 'epic', icon: '✧', value: 250, desc: 'Revive al instante con un 60% de salud si caes.', effect: { revive: 0.6 }, stack: 1 },
  // ---------------- materiales ----------------
  herb_brisa: { id: 'herb_brisa', name: 'Hierba de Brisa', type: 'material', rarity: 'common', icon: '❧', value: 8, desc: 'Crece donde el viento cambia de idea. Marta la usa para sus guisos.' },
  crystal_shard: { id: 'crystal_shard', name: 'Fragmento de Cristal', type: 'material', rarity: 'common', icon: '◈', value: 14, desc: 'Un trozo de memoria solidificada. Sirve para reforjar equipo.' },
  ember_ash: { id: 'ember_ash', name: 'Ceniza Primigenia', type: 'material', rarity: 'uncommon', icon: '✹', value: 22, desc: 'Ceniza que aún recuerda el fuego. Arde sin consumirse.' },
  dragon_scale: { id: 'dragon_scale', name: 'Escama de Draco', type: 'material', rarity: 'rare', icon: '❖', value: 60, desc: 'Dura como una montaña y cálida como un hogar. Los herreros matarían por ella.' },
  celestial_feather: { id: 'celestial_feather', name: 'Pluma Celeste', type: 'material', rarity: 'rare', icon: '⌁', value: 55, desc: 'Cayó de un ala que ya no existe. Pesa menos que una promesa.' },
  veil_core: { id: 'veil_core', name: 'Núcleo del Velo', type: 'material', rarity: 'epic', icon: '◉', value: 120, desc: 'Una mota de la herida del mundo. No debe mirarse demasiado tiempo.' },
  star_shard: { id: 'star_shard', name: 'Esquirla de Estrella', type: 'material', rarity: 'rare', icon: '✧', value: 45, desc: 'Una estrella que eligió caer. Conserva un deseo.' },
  // ---------------- clave ----------------
  gem_celestial: { id: 'gem_celestial', name: 'Gema Celestial', type: 'key', rarity: 'legendary', icon: '◈', value: 0, desc: 'El corazón de la Espada. Contiene el primer recuerdo del mundo y una pregunta sin respuesta.' },
  tear_first_ember: { id: 'tear_first_ember', name: 'Lágrima de la Primera Brasa', type: 'key', rarity: 'legendary', icon: '✹', value: 0, desc: 'No es agua: es el instante en que el fuego decidió no apagarse.' },
  jar_origin: { id: 'jar_origin', name: 'Jarra de Origen', type: 'key', rarity: 'legendary', icon: '◫', value: 0, desc: 'Un recipiente de barro sin fondo visible. Guarda el sueño del que nació el mundo.' },
  sigil_raiz: { id: 'sigil_raiz', name: 'Sigilo de Raíz', type: 'key', rarity: 'rare', icon: '❧', value: 0, desc: 'Marca del Guardián de Alderion. Abre el paso de ceniza.' },
  sigil_verdad: { id: 'sigil_verdad', name: 'Sigilo de la Verdad', type: 'key', rarity: 'epic', icon: '◉', value: 0, desc: 'La biblioteca te reconoce como testigo. El Velo ya no puede ocultarte.' },
};

export const ITEM_STAT_LABEL = {
  atk: 'Ataque', def: 'Defensa', hp: 'Salud', mp: 'Maná', stam: 'Resistencia', spd: 'Velocidad',
  crit: 'Crítico', luck: 'Suerte', capture: 'Vínculo', allDmg: 'Daño global', fire: 'Fuego',
  fireRes: 'Resistencia al fuego', reveal: 'Revelación',
};

export const SHOPS = {
  marta: {
    name: 'Tienda de Marta',
    greet: 'Tengo lo que necesitas, cariño. Y lo que no sabes que necesitas.',
    stock: ['potion_lumen', 'potion_lumen', 'mana_tears', 'stamina_herb', 'herb_brisa', 'bond_essence'],
  },
  bron: {
    name: 'Forja de Bron',
    greet: 'El acero no miente. Si se rompe, es que tú también.',
    stock: ['sword_brisa', 'armor_valdoria', 'helm_valdoria', 'potion_lumen', 'crystal_shard'],
  },
  serah: {
    name: 'Forja de Cindral',
    greet: 'Todo lo que toco acaba ardiendo. A veces a propósito.',
    stock: ['sword_ceniza', 'armor_ceniza', 'helm_ceniza', 'potion_mayor', 'ember_ash', 'dragon_scale'],
  },
  ciudad: {
    name: 'Bazar de Cindral',
    greet: 'Ceniza, recuerdos y precios justos. Justos para mí.',
    stock: ['potion_lumen', 'mana_tears', 'stamina_herb', 'tear_ember', 'phoenix_tear'],
  },
  templo: {
    name: 'Relicario del Templo',
    greet: 'Lo que buscas ya te está buscando a ti.',
    stock: ['armor_celeste', 'diadema_celeste', 'amulet_resonancia', 'eye_veil', 'potion_mayor'],
  },
};

// ============================================================
// HABILIDADES
// ============================================================
export const SKILL_BRANCHES = {
  vanguardia: { name: 'Vanguardia', icon: '⚔', desc: 'El filo como respuesta. Aumenta el daño directo y la resistencia en combate.' },
  resonancia: { name: 'Resonancia', icon: '❂', desc: 'El vínculo como arma. Potencia a tus ecos y la captura.' },
  velo: { name: 'Velo', icon: '◉', desc: 'La grieta como camino. Supervivencia, movilidad y secretos.' },
};

export const SKILLS = {
  tajo_gemelo: { id: 'tajo_gemelo', branch: 'vanguardia', name: 'Tajo Gemelo', icon: '⚔', desc: '+12% de daño con ataques ligeros.', cost: 1, req: [], effects: { lightDmg: 0.12 } },
  piel_hierro: { id: 'piel_hierro', branch: 'vanguardia', name: 'Piel de Hierro', icon: '⛨', desc: '+12% de defensa y +10 de resistencia máxima.', cost: 1, req: ['tajo_gemelo'], effects: { defPct: 0.12, stam: 10 } },
  contraataque: { id: 'contraataque', branch: 'vanguardia', name: 'Contraataque', icon: '↯', desc: 'Un parry perfecto libera una onda de luz (45 de daño y aturde).', cost: 1, req: ['piel_hierro'], effects: { parryShock: 45 } },
  fura_alba: { id: 'fura_alba', branch: 'vanguardia', name: 'Furia del Alba', icon: '✹', desc: '+30% de daño pesado y el golpe pesado genera una onda expansiva.', cost: 1, req: ['piel_hierro'], effects: { heavyDmg: 0.3, heavyWave: true } },
  segundo_aliento: { id: 'segundo_aliento', branch: 'vanguardia', name: 'Segundo Aliento', icon: '♥', desc: 'Esquivar con éxito recupera un 4% de salud.', cost: 1, req: ['contraataque'], effects: { dodgeHeal: 0.04 } },
  maestro_filo: { id: 'maestro_filo', branch: 'vanguardia', name: 'Maestro del Filo', icon: '✦', desc: '+8% de probabilidad de crítico y +10% de daño crítico.', cost: 1, req: ['fura_alba'], effects: { crit: 8, critDmg: 0.1 } },
  vinculo_profundo: { id: 'vinculo_profundo', branch: 'resonancia', name: 'Vínculo Profundo', icon: '❂', desc: '+20% de probabilidad de capturar ecos.', cost: 1, req: [], effects: { capture: 0.2 } },
  eco_curativo: { id: 'eco_curativo', branch: 'resonancia', name: 'Eco Curativo', icon: '✚', desc: 'Tu eco activo te regenera un 1,5% de salud por segundo.', cost: 1, req: ['vinculo_profundo'], effects: { creatureRegen: 0.015 } },
  doble_eco: { id: 'doble_eco', branch: 'resonancia', name: 'Doble Eco', icon: '≋', desc: 'Tu eco ataca un 30% más rápido y tiene +15% de daño.', cost: 1, req: ['eco_curativo'], effects: { creatureSpeed: 0.3, creatureDmg: 0.15 } },
  sinfonia: { id: 'sinfonia', branch: 'resonancia', name: 'Sinfonía', icon: '♪', desc: 'Los hechizos cuestan un 20% menos de maná.', cost: 1, req: ['vinculo_profundo'], effects: { spellCost: 0.2 } },
  corazon_abierto: { id: 'corazon_abierto', branch: 'resonancia', name: 'Corazón Abierto', icon: '♡', desc: '+20% a todas las estadísticas de tus ecos y +1 espacio de equipo.', cost: 1, req: ['doble_eco'], effects: { creatureStats: 0.2, partySlot: 1 } },
  llamada_celestial: { id: 'llamada_celestial', branch: 'resonancia', name: 'Llamada Celestial', icon: '✧', desc: 'Desbloquea la habilidad definitiva de tu eco activo (tecla Q mantenida).', cost: 1, req: ['corazon_abierto'], effects: { ultimate: true } },
  paso_umbrio: { id: 'paso_umbrio', branch: 'velo', name: 'Paso Umbrío', icon: '➤', desc: 'La esquiva cuesta 3 menos de resistencia y dura 0,1 s más.', cost: 1, req: [], effects: { iframe: 0.1, dodgeCost: 3 } },
  ojo_velo: { id: 'ojo_velo', branch: 'velo', name: 'Ojo del Velo', icon: '◉', desc: 'Revela cofres y secretos cercanos en el minimapa.', cost: 1, req: ['paso_umbrio'], effects: { reveal: 1 } },
  piel_cristal: { id: 'piel_cristal', branch: 'velo', name: 'Piel de Cristal', icon: '◈', desc: 'Al bajar del 30% de salud, obtienes un escudo del 25% de tu salud máxima (45 s).', cost: 1, req: ['paso_umbrio'], effects: { shield: 0.25 } },
  suerte_cero: { id: 'suerte_cero', branch: 'velo', name: 'Suerte del Cero', icon: '☘', desc: '+12 de suerte y +15% de oro encontrado.', cost: 1, req: ['ojo_velo'], effects: { luck: 12, gold: 0.15 } },
  ancla: { id: 'ancla', branch: 'velo', name: 'Ancla', icon: '⚓', desc: 'La resistencia se regenera un 50% más rápido.', cost: 1, req: ['piel_cristal'], effects: { staminaRegen: 0.5 } },
  ascension: { id: 'ascension', branch: 'velo', name: 'Ascensión', icon: '✧', desc: '+15% a todo el daño. La espada recuerda lo que eres.', cost: 1, req: ['suerte_cero', 'ancla'], effects: { allDmg: 0.15 } },
};

export const SPELLS = {
  filo_luz: { id: 'filo_luz', name: 'Filo de Luz', icon: '✦', element: 'luz', cost: 16, desc: 'Lanza una hoja de luz que atraviesa enemigos. Escala con Inteligencia.', type: 'projectile', power: 2.0, speed: 620, radius: 16, color: '#ffe9a8' },
  ola_resonante: { id: 'ola_resonante', name: 'Ola Resonante', icon: '≈', element: 'agua', cost: 26, desc: 'Una onda de resonancia golpea y empuja a todo lo que te rodea.', type: 'nova', power: 1.7, radius: 150, knockback: 260, color: '#7fd4ff' },
  sello_velo: { id: 'sello_velo', name: 'Sello del Velo', icon: '◉', element: 'velo', cost: 34, desc: 'Abre una grieta bajo tus enemigos: daño, ralentización y aturdimiento.', type: 'zone', power: 1.3, radius: 115, stun: 1.8, color: '#b48cff' },
};

// ============================================================
// CRIATURAS
// ============================================================
export const CREATURES = {
  lumito: {
    id: 'lumito', name: 'Lumito', epithet: 'Zorro del Alba', element: 'luz', shape: 'fox', rarity: 'common', region: 'Valdoria', capture: 0.38,
    colors: { main: '#ffe9a8', accent: '#f4b860', glow: '#fff3c4', dark: '#7a5a2a' },
    base: { hp: 62, atk: 13, def: 5, spd: 1.12 },
    ability: { name: 'Destello', desc: 'Un zarpazo de luz a distancia que marca al enemigo.', type: 'projectile', power: 1.3, cooldown: 3.2, element: 'luz' },
    passive: { name: 'Faro', desc: '+8% de crítico al portador.' },
    lore: 'Los lumitos nacen donde la primera luz toca el rocío. No son mascotas: son pequeñas decisiones de quedarse. El tuyo eligió quedarse contigo antes de que la espada te eligiera a ti.',
  },
  brotin: {
    id: 'brotin', name: 'Brotín', epithet: 'Brote Viviente', element: 'tierra', shape: 'sprout', rarity: 'common', region: 'Valdoria', capture: 0.4,
    colors: { main: '#9fd67a', accent: '#5a8f3e', glow: '#d6ff9a', dark: '#35502a' },
    base: { hp: 78, atk: 11, def: 10, spd: 0.9 },
    ability: { name: 'Raíces', desc: 'Enreda al enemigo y lo inmoviliza 1,5 s.', type: 'root', power: 0.8, cooldown: 6, element: 'tierra' },
    passive: { name: 'Savia', desc: 'Regenera 1% de salud por segundo.' },
    lore: 'Un brotín es un bosque que todavía no ha decidido crecer. Cuando duerme, sueña con ser un árbol; cuando despierta, se ríe de su propio sueño.',
  },
  aleteo: {
    id: 'aleteo', name: 'Aleteo', epithet: 'Polilla de Alba', element: 'aire', shape: 'moth', rarity: 'common', region: 'Valdoria', capture: 0.42,
    colors: { main: '#d8f5ec', accent: '#7ddcba', glow: '#eafff8', dark: '#3a5a52' },
    base: { hp: 52, atk: 12, def: 4, spd: 1.28 },
    ability: { name: 'Polvo de Alba', desc: 'Cega al enemigo y aumenta la evasión del grupo.', type: 'debuff', power: 1.0, cooldown: 7, element: 'aire' },
    passive: { name: 'Brisa', desc: '+8% de velocidad de movimiento.' },
    lore: 'Las polillas de alba solo existen entre la noche y el día. Los sabios discuten si son reales; ellas, mientras tanto, se comen los secretos de las ventanas abiertas.',
  },
  ranaverde: {
    id: 'ranaverde', name: 'Ranaverde', epithet: 'Guardiana del Junco', element: 'agua', shape: 'frog', rarity: 'common', region: 'Valdoria', capture: 0.4,
    colors: { main: '#7fc98a', accent: '#3f8fae', glow: '#b8ffe0', dark: '#2a4a3a' },
    base: { hp: 70, atk: 10, def: 8, spd: 0.98 },
    ability: { name: 'Salto de Junco', desc: 'Salta sobre el enemigo y lo empapa (ralentiza).', type: 'dash', power: 1.1, cooldown: 5, element: 'agua' },
    passive: { name: 'Humedad', desc: 'Los hechizos cuestan un 5% menos.' },
    lore: 'Las ranas de junco recuerdan cada lluvia. Si una te mira fijamente, es porque está contando la tuya.',
  },
  zorruno: {
    id: 'zorruno', name: 'Zorruno', epithet: 'Zorro Umbrío', element: 'sombra', shape: 'wolf', rarity: 'uncommon', region: 'Valdoria', capture: 0.24,
    colors: { main: '#6b5a8a', accent: '#2b2233', glow: '#b48cff', dark: '#1a1426' },
    base: { hp: 68, atk: 18, def: 5, spd: 1.2 },
    ability: { name: 'Mordisco Umbrío', desc: 'Un mordisco que ignora parte de la defensa.', type: 'melee', power: 1.5, cooldown: 3.8, element: 'sombra' },
    passive: { name: 'Instinto', desc: '+6% de crítico.' },
    lore: 'Los zorrunos no roban comida: roban recuerdos pequeños y los devuelven cuando tienes hambre. Su pelaje guarda la forma de la última sombra que los tocó.',
  },
  ciervo_cristal: {
    id: 'ciervo_cristal', name: 'Ciervo de Cristal', epithet: 'Guardián de Alderion', element: 'cristal', shape: 'deer', rarity: 'epic', region: 'Valdoria', capture: 0.12,
    colors: { main: '#cdeeff', accent: '#7fb9d6', glow: '#e8fbff', dark: '#3a5a6a' },
    base: { hp: 120, atk: 22, def: 16, spd: 1.0 },
    ability: { name: 'Prisma', desc: 'Un rayo de cristal que atraviesa a todos los enemigos en línea.', type: 'beam', power: 1.8, cooldown: 6, element: 'cristal' },
    passive: { name: 'Reflejo', desc: '+10% de defensa y resistencia a la magia.' },
    lore: 'El Ciervo de Cristal no protege la Gema: protege la pregunta que la Gema contiene. Si lo vences, no lo destruyes; le das una respuesta.',
  },
  brasa: {
    id: 'brasa', name: 'Brasa', epithet: 'Chispa Viva', element: 'fuego', shape: 'ember', rarity: 'common', region: 'Drakmor', capture: 0.36,
    colors: { main: '#ffb27a', accent: '#ff5a36', glow: '#ffd166', dark: '#6a2a1a' },
    base: { hp: 58, atk: 16, def: 4, spd: 1.18 },
    ability: { name: 'Chispa', desc: 'Prende al enemigo durante 3 s.', type: 'projectile', power: 1.2, cooldown: 3.6, element: 'fuego', burn: 3 },
    passive: { name: 'Brasa Viva', desc: '+15% de resistencia al fuego.' },
    lore: 'Una brasa es una chispa que se negó a apagarse. Las de Drakmor recuerdan la ciudad antes de la ceniza y arden más alto cuando oyen su nombre.',
  },
  escorpion_obsidiana: {
    id: 'escorpion_obsidiana', name: 'Escorpión de Obsidiana', epithet: 'Aguijón de Cristal', element: 'tierra', shape: 'scorpion', rarity: 'uncommon', region: 'Drakmor', capture: 0.26,
    colors: { main: '#4a3a44', accent: '#ff8a5c', glow: '#ffb27a', dark: '#1a1216' },
    base: { hp: 74, atk: 17, def: 12, spd: 1.0 },
    ability: { name: 'Aguijón', desc: 'Envenena al enemigo durante 5 s.', type: 'melee', power: 1.1, cooldown: 5, element: 'tierra', poison: 5 },
    passive: { name: 'Caparazón', desc: '+8% de defensa.' },
    lore: 'Su caparazón se forma con la última lava que tocó. Los herreros de Cindral dicen que un escorpión nunca miente: si te pincha, es que te lo merecías.',
  },
  cuervo_ceniza: {
    id: 'cuervo_ceniza', name: 'Cuervo de Ceniza', epithet: 'Mensajero del Velo', element: 'sombra', shape: 'crow', rarity: 'uncommon', region: 'Drakmor', capture: 0.22,
    colors: { main: '#5a5262', accent: '#2b2233', glow: '#b48cff', dark: '#141018' },
    base: { hp: 54, atk: 15, def: 5, spd: 1.3 },
    ability: { name: 'Graznido', desc: 'Debilita al enemigo (-20% de ataque, 4 s).', type: 'debuff', power: 0.8, cooldown: 6, element: 'sombra' },
    passive: { name: 'Presagio', desc: '+10% de botín.' },
    lore: 'Los cuervos de ceniza no anuncian la muerte: anuncian que alguien ha empezado a olvidar. Si uno se posa en tu ventana, revisa tus recuerdos.',
  },
  salamandra: {
    id: 'salamandra', name: 'Salamandra Ígnea', epithet: 'Hija de la Caldera', element: 'fuego', shape: 'salamander', rarity: 'rare', region: 'Drakmor', capture: 0.18,
    colors: { main: '#ff8a5c', accent: '#ffd166', glow: '#fff3c4', dark: '#7a2a1a' },
    base: { hp: 82, atk: 20, def: 8, spd: 1.08 },
    ability: { name: 'Aliento de Caldera', desc: 'Un cono de fuego que quema a varios enemigos.', type: 'cone', power: 1.6, cooldown: 6, element: 'fuego', burn: 4 },
    passive: { name: 'Piel de Magma', desc: 'Inmune a quemaduras.' },
    lore: 'Las salamandras duermen dentro de la lava y sueñan con ser dragones. Las que despiertan se conforman con ser fuego.',
  },
  golem_magma: {
    id: 'golem_magma', name: 'Golem de Magma', epithet: 'Corazón de la Montaña', element: 'tierra', shape: 'golem', rarity: 'rare', region: 'Drakmor', capture: 0.14,
    colors: { main: '#5a4a44', accent: '#ff5a36', glow: '#ffb27a', dark: '#241a18' },
    base: { hp: 130, atk: 18, def: 22, spd: 0.78 },
    ability: { name: 'Terremoto', desc: 'Golpea el suelo y aturde a los enemigos cercanos.', type: 'aoe', power: 1.5, cooldown: 8, element: 'tierra', stun: 1.2 },
    passive: { name: 'Roca Viva', desc: '+15% de salud máxima.' },
    lore: 'Un golem de magma es una montaña que se cansó de esperar. Camina despacio porque lleva a todos los muertos de su ladera.',
  },
  draco_rubi: {
    id: 'draco_rubi', name: 'Draco Rubí', epithet: 'Eco de la Reina', element: 'fuego', shape: 'drake', rarity: 'legendary', region: 'Drakmor', capture: 0.06,
    colors: { main: '#d94a4a', accent: '#ffd166', glow: '#ff8a5c', dark: '#4a1a1a' },
    base: { hp: 150, atk: 30, def: 16, spd: 1.1 },
    ability: { name: 'Alarido Rubí', desc: 'Un rugido de fuego que golpea a todos los enemigos.', type: 'aoe', power: 2.0, cooldown: 9, element: 'fuego', burn: 5 },
    passive: { name: 'Corazón de Draco', desc: '+12% de daño de todos los ecos.' },
    lore: 'El último huevo de la Reina Calcinada nunca eclosionó. Cuando la derrotaste, el eco que quedó no era suyo: era la posibilidad de que hubiera sido madre.',
  },
  estrella: {
    id: 'estrella', name: 'Estrella Errante', epithet: 'Deseo Caído', element: 'luz', shape: 'star', rarity: 'rare', region: 'Kansordore', capture: 0.2,
    colors: { main: '#fff3c4', accent: '#9fe8ff', glow: '#ffffff', dark: '#5a6a8a' },
    base: { hp: 66, atk: 21, def: 7, spd: 1.25 },
    ability: { name: 'Fotón', desc: 'Un rayo de luz puro que ignora defensas.', type: 'beam', power: 1.7, cooldown: 5, element: 'luz' },
    passive: { name: 'Deseo', desc: '+8% de suerte.' },
    lore: 'Las estrellas errantes son deseos que nadie pidió. Siguen cayendo porque aún esperan que alguien los atrape.',
  },
  buho_oraculo: {
    id: 'buho_oraculo', name: 'Búho Oráculo', epithet: 'Ojo del Templo', element: 'aire', shape: 'owl', rarity: 'rare', region: 'Kansordore', capture: 0.18,
    colors: { main: '#c7f0e0', accent: '#9fe8ff', glow: '#eafff8', dark: '#3a4a5a' },
    base: { hp: 72, atk: 17, def: 10, spd: 1.05 },
    ability: { name: 'Presagio', desc: 'Marca al enemigo: recibe +20% de daño durante 5 s.', type: 'debuff', power: 1.0, cooldown: 7, element: 'aire' },
    passive: { name: 'Visión', desc: '+10% de crítico.' },
    lore: 'El Búho Oráculo no predice el futuro: lo recuerda antes de que ocurra. Por eso siempre parece aburrido.',
  },
  espectro: {
    id: 'espectro', name: 'Espectro del Velo', epithet: 'Memoria sin Dueño', element: 'sombra', shape: 'wraith', rarity: 'rare', region: 'Kansordore', capture: 0.16,
    colors: { main: '#8b7aa8', accent: '#5a2ecc', glow: '#b48cff', dark: '#1a1426' },
    base: { hp: 64, atk: 23, def: 4, spd: 1.2 },
    ability: { name: 'Toque del Velo', desc: 'Drena salud del enemigo y te la entrega.', type: 'drain', power: 1.4, cooldown: 5, element: 'sombra' },
    passive: { name: 'Intangible', desc: 'Recibe un 10% menos de daño físico.' },
    lore: 'Un espectro es una persona que olvidó su nombre pero no su juramento. Si le preguntas quién fue, te responderá con tu propia voz.',
  },
  quimera: {
    id: 'quimera', name: 'Quimera de Cristal', epithet: 'Tres Voces, Un Eco', element: 'cristal', shape: 'chimera', rarity: 'epic', region: 'Kansordore', capture: 0.1,
    colors: { main: '#9fe8ff', accent: '#b48cff', glow: '#e8fbff', dark: '#3a4a6a' },
    base: { hp: 118, atk: 25, def: 14, spd: 1.12 },
    ability: { name: 'Prisma Triple', desc: 'Tres rayos de cristal buscan enemigos distintos.', type: 'beam', power: 1.5, cooldown: 7, element: 'cristal', count: 3 },
    passive: { name: 'Refracción', desc: '+12% de daño elemental.' },
    lore: 'La Quimera fue tres criaturas que se miraron demasiado tiempo en el mismo espejo. Ahora discuten sobre quién es la original.',
  },
  serafin: {
    id: 'serafin', name: 'Serafín Menor', epithet: 'Ala Prestada', element: 'luz', shape: 'seraph', rarity: 'epic', region: 'Kansordore', capture: 0.12,
    colors: { main: '#fff3c4', accent: '#9fe8ff', glow: '#ffffff', dark: '#5a6a8a' },
    base: { hp: 88, atk: 19, def: 12, spd: 1.2 },
    ability: { name: 'Himno', desc: 'Cura al portador un 20% de su salud máxima.', type: 'heal', power: 0.2, cooldown: 9, element: 'luz' },
    passive: { name: 'Gracia', desc: 'Regenera 1% de salud por segundo.' },
    lore: 'Los serafines menores son alas que se cansaron de pertenecer a un dios. Ahora eligen a quien las necesita.',
  },
  devorador: {
    id: 'devorador', name: 'Devorador del Velo', epithet: 'Eco del Arquitecto', element: 'sombra', shape: 'devourer', rarity: 'legendary', region: 'Kansordore', capture: 0.05,
    colors: { main: '#3a2a5a', accent: '#8b6bff', glow: '#b48cff', dark: '#0e0818' },
    base: { hp: 160, atk: 34, def: 18, spd: 1.0 },
    ability: { name: 'Vacío', desc: 'Abre una sima que daña y atrae a los enemigos.', type: 'aoe', power: 2.1, cooldown: 10, element: 'sombra', pull: true },
    passive: { name: 'Hambre', desc: 'Recupera salud al matar enemigos.' },
    lore: 'El Devorador no nació del Velo: nació del miedo del Arquitecto a quedarse solo. Es la parte de él que aún quiere compañía.',
  },
};

export const CREATURE_IDS = Object.keys(CREATURES);

// ============================================================
// ENEMIGOS
// ============================================================
export const ENEMIES = {
  slime_lumen: {
    id: 'slime_lumen', name: 'Limoluz', shape: 'slime', element: 'luz', tier: 'normal',
    hp: 46, atk: 8, def: 3, speed: 52, radius: 20, aggro: 250, range: 42, poise: 16, xp: 14, gold: 5,
    behavior: 'melee', capturable: 'lumito', drops: [{ id: 'potion_lumen', p: 0.12 }, { id: 'crystal_shard', p: 0.18 }],
    colors: { main: '#d9f5b0', accent: '#9fd67a', glow: '#eaffc9' },
    lore: 'Una gota de luz que aprendió a saltar. No es peligrosa; solo tiene muy mal timing.',
  },
  wolf_brisa: {
    id: 'wolf_brisa', name: 'Lobo de Brisa', shape: 'wolf', element: 'aire', tier: 'normal',
    hp: 62, atk: 12, def: 4, speed: 105, radius: 18, aggro: 330, range: 48, poise: 20, xp: 22, gold: 8,
    behavior: 'charger', capturable: 'zorruno', drops: [{ id: 'herb_brisa', p: 0.3 }, { id: 'crystal_shard', p: 0.1 }],
    colors: { main: '#9fb8a8', accent: '#5a7a68', glow: '#c7f0e0' },
    lore: 'Cazan en parejas y nunca atacan dos veces igual. El viento les dice dónde está tu espalda.',
  },
  bandido: {
    id: 'bandido', name: 'Bandido del Camino', shape: 'bandit', element: 'tierra', tier: 'normal',
    hp: 70, atk: 13, def: 6, speed: 88, radius: 17, aggro: 300, range: 52, poise: 24, xp: 26, gold: 18,
    behavior: 'melee', capturable: null, drops: [{ id: 'potion_lumen', p: 0.22 }, { id: 'crystal_shard', p: 0.2 }],
    colors: { main: '#6a5a44', accent: '#3a3028', glow: '#c9a86a' },
    lore: 'La Ruptura se llevó su aldea. Ahora se lleva lo que puede de la tuya. No es una excusa; es una herida.',
  },
  wisp: {
    id: 'wisp', name: 'Fuego Fatuo', shape: 'wisp', element: 'sombra', tier: 'normal',
    hp: 38, atk: 14, def: 2, speed: 78, radius: 14, aggro: 380, range: 260, poise: 10, xp: 24, gold: 10,
    behavior: 'ranged', capturable: 'aleteo', drops: [{ id: 'mana_tears', p: 0.2 }, { id: 'veil_core', p: 0.03 }],
    colors: { main: '#b48cff', accent: '#5a2ecc', glow: '#dcc9ff' },
    lore: 'Un recuerdo que se perdió en el bosque y decidió quedarse. Ataca porque tiene miedo de que lo olviden otra vez.',
  },
  treant: {
    id: 'treant', name: 'Árbol Quejumbroso', shape: 'treant', element: 'tierra', tier: 'elite',
    hp: 150, atk: 18, def: 16, speed: 38, radius: 30, aggro: 260, range: 80, poise: 60, xp: 70, gold: 30,
    behavior: 'melee', capturable: 'brotin', drops: [{ id: 'herb_brisa', p: 0.6 }, { id: 'crystal_shard', p: 0.4 }],
    colors: { main: '#5a7a4a', accent: '#2f4a2a', glow: '#9fd67a' },
    lore: 'No está corrompido. Solo está muy cansado de que la gente le pida consejo y luego no lo escuche.',
  },
  cultista: {
    id: 'cultista', name: 'Cultista del Velo', shape: 'cultist', element: 'sombra', tier: 'normal',
    hp: 76, atk: 16, def: 7, speed: 86, radius: 17, aggro: 360, range: 250, poise: 22, xp: 34, gold: 20,
    behavior: 'ranged', capturable: null, drops: [{ id: 'veil_core', p: 0.08 }, { id: 'mana_tears', p: 0.25 }],
    colors: { main: '#3a2a4a', accent: '#8b6bff', glow: '#b48cff' },
    lore: 'Creen que olvidar es una forma de misericordia. Tienen razón, y por eso dan tanto miedo.',
  },
  guardian_raiz: {
    id: 'guardian_raiz', name: 'Guardián de Raíces', shape: 'guardian', element: 'tierra', tier: 'boss',
    hp: 620, atk: 24, def: 18, speed: 44, radius: 54, aggro: 520, range: 120, poise: 120, xp: 320, gold: 220,
    behavior: 'boss', capturable: null, echo: 'ciervo_cristal', drops: [{ id: 'crystal_shard', p: 1, count: 4 }, { id: 'sigil_raiz', p: 1 }],
    colors: { main: '#6a7a4a', accent: '#cdeeff', glow: '#9fe8ff' },
    lore: 'El último guardián de Alderion. Su cuerpo es un bosque petrificado; su corazón, una gema que no recuerda quién la talló.',
    attacks: [
      { id: 'golpe', type: 'melee', windup: 0.8, damage: 1.2, range: 130, arc: 1.2, color: '#9fd67a' },
      { id: 'raices', type: 'aoe', windup: 1.1, damage: 1.0, radius: 150, color: '#9fd67a', root: 1.5 },
      { id: 'prisma', type: 'beam', windup: 1.3, damage: 1.5, range: 420, width: 40, color: '#9fe8ff' },
    ],
    intro: 'guardian',
    outro: 'guardian_outro',
  },
  escorpion: {
    id: 'escorpion', name: 'Escorpión de Obsidiana', shape: 'scorpion', element: 'tierra', tier: 'normal',
    hp: 92, atk: 18, def: 12, speed: 72, radius: 22, aggro: 300, range: 60, poise: 30, xp: 46, gold: 22,
    behavior: 'melee', capturable: 'escorpion_obsidiana', drops: [{ id: 'ember_ash', p: 0.3 }, { id: 'crystal_shard', p: 0.2 }],
    colors: { main: '#4a3a44', accent: '#ff8a5c', glow: '#ffb27a' },
    lore: 'Caza al ritmo de la lava. Su aguijón no mata: solo hace que desees que lo haga.',
  },
  elemental_magma: {
    id: 'elemental_magma', name: 'Elemental de Magma', shape: 'magma', element: 'fuego', tier: 'normal',
    hp: 84, atk: 20, def: 8, speed: 66, radius: 24, aggro: 360, range: 280, poise: 26, xp: 50, gold: 24,
    behavior: 'ranged', capturable: 'brasa', drops: [{ id: 'ember_ash', p: 0.45 }, { id: 'veil_core', p: 0.04 }],
    colors: { main: '#ff5a36', accent: '#ffd166', glow: '#ffb27a' },
    lore: 'Un pensamiento de la montaña que tomó forma para quejarse. Escupe lava cuando se enfada; se enfada siempre.',
  },
  cuervo: {
    id: 'cuervo', name: 'Cuervo de Ceniza', shape: 'crow', element: 'sombra', tier: 'normal',
    hp: 58, atk: 16, def: 4, speed: 120, radius: 15, aggro: 380, range: 55, poise: 14, xp: 38, gold: 16,
    behavior: 'flyer', capturable: 'cuervo_ceniza', drops: [{ id: 'veil_core', p: 0.05 }, { id: 'dragon_scale', p: 0.05 }],
    colors: { main: '#5a5262', accent: '#2b2233', glow: '#b48cff' },
    lore: 'Roban nombres y los esconden en nidos. Si oyes uno graznar tu nombre, ya es demasiado tarde.',
  },
  caballero_ceniza: {
    id: 'caballero_ceniza', name: 'Caballero de Ceniza', shape: 'knight', element: 'fuego', tier: 'elite',
    hp: 170, atk: 25, def: 20, speed: 82, radius: 22, aggro: 340, range: 70, poise: 55, xp: 100, gold: 55,
    behavior: 'melee', capturable: 'golem_magma', drops: [{ id: 'dragon_scale', p: 0.2 }, { id: 'potion_mayor', p: 0.3 }, { id: 'ember_ash', p: 0.5 }],
    colors: { main: '#5a3a32', accent: '#ff5a36', glow: '#ffb27a' },
    lore: 'Juró proteger Cindral hasta que la ciudad dejó de existir. Nadie le dijo que podía rendirse.',
  },
  reina_calcinada: {
    id: 'reina_calcinada', name: 'La Reina Calcinada', shape: 'queen', element: 'fuego', tier: 'boss',
    hp: 900, atk: 32, def: 22, speed: 70, radius: 46, aggro: 620, range: 140, poise: 180, xp: 650, gold: 500,
    behavior: 'boss', capturable: null, echo: 'draco_rubi', drops: [{ id: 'dragon_scale', p: 1, count: 5 }, { id: 'tear_first_ember', p: 1 }],
    colors: { main: '#3a2026', accent: '#ff5a36', glow: '#ffd166' },
    lore: 'Seraphine de Cindral vendió su corazón a la Primera Brasa para salvar a su pueblo. La Brasa aceptó. El pueblo no.',
    attacks: [
      { id: 'tajo_igneo', type: 'melee', windup: 0.7, damage: 1.4, range: 160, arc: 1.5, color: '#ff8a5c', burn: 3 },
      { id: 'marea', type: 'aoe', windup: 1.2, damage: 1.2, radius: 190, color: '#ff5a36', burn: 4 },
      { id: 'alarido', type: 'ring', windup: 1.0, damage: 1.0, radius: 260, color: '#ffd166' },
      { id: 'dracos', type: 'summon', windup: 1.1, damage: 0, count: 2, enemy: 'elemental_magma', color: '#ff8a5c' },
    ],
    intro: 'reina',
    outro: 'reina_outro',
  },
  espectro_velo: {
    id: 'espectro_velo', name: 'Espectro del Velo', shape: 'wraith', element: 'sombra', tier: 'normal',
    hp: 96, atk: 22, def: 6, speed: 96, radius: 18, aggro: 400, range: 240, poise: 20, xp: 62, gold: 30,
    behavior: 'ranged', capturable: 'espectro', drops: [{ id: 'veil_core', p: 0.15 }, { id: 'mana_tears', p: 0.3 }],
    colors: { main: '#8b7aa8', accent: '#5a2ecc', glow: '#b48cff' },
    lore: 'Camina entre dos recuerdos y no pertenece a ninguno. Su toque no duele: recuerda.',
  },
  golem_cristal: {
    id: 'golem_cristal', name: 'Golem de Cristal', shape: 'golem', element: 'cristal', tier: 'elite',
    hp: 210, atk: 24, def: 26, speed: 48, radius: 30, aggro: 300, range: 90, poise: 80, xp: 120, gold: 70,
    behavior: 'melee', capturable: 'quimera', drops: [{ id: 'crystal_shard', p: 0.7, count: 2 }, { id: 'celestial_feather', p: 0.25 }],
    colors: { main: '#7fa8b8', accent: '#9fe8ff', glow: '#e8fbff' },
    lore: 'Los golems de cristal son estatuas que se miraron demasiado en un espejo. Ahora reflejan lo que temes.',
  },
  serafin_corrupto: {
    id: 'serafin_corrupto', name: 'Serafín Corrupto', shape: 'seraph', element: 'luz', tier: 'normal',
    hp: 88, atk: 21, def: 9, speed: 110, radius: 18, aggro: 400, range: 70, poise: 22, xp: 66, gold: 34,
    behavior: 'flyer', capturable: 'serafin', drops: [{ id: 'celestial_feather', p: 0.3 }, { id: 'potion_mayor', p: 0.2 }],
    colors: { main: '#d8c8a8', accent: '#8b6bff', glow: '#ffe9a8' },
    lore: 'Un ala que olvidó a quién servía. Sigue cantando, pero el himno se ha vuelto una pregunta.',
  },
  custodio_velo: {
    id: 'custodio_velo', name: 'Custodio del Velo', shape: 'custodian', element: 'velo', tier: 'boss',
    hp: 1150, atk: 38, def: 26, speed: 82, radius: 50, aggro: 700, range: 150, poise: 220, xp: 1000, gold: 700,
    behavior: 'boss', capturable: null, echo: 'quimera', drops: [{ id: 'veil_core', p: 1, count: 5 }, { id: 'sigil_verdad', p: 1 }],
    colors: { main: '#2a2440', accent: '#b48cff', glow: '#8b6bff' },
    lore: 'El bibliotecario que leyó el último libro y descubrió que él era el personaje. Ahora guarda la puerta para que nadie más lo sepa.',
    attacks: [
      { id: 'corte', type: 'melee', windup: 0.65, damage: 1.3, range: 170, arc: 1.6, color: '#b48cff' },
      { id: 'paginas', type: 'projectiles', windup: 0.9, damage: 0.9, count: 5, spread: 0.7, speed: 300, color: '#dcc9ff' },
      { id: 'sello', type: 'aoe', windup: 1.2, damage: 1.3, radius: 200, color: '#8b6bff', stun: 1.2 },
      { id: 'espejo', type: 'beam', windup: 1.4, damage: 1.6, range: 500, width: 46, color: '#9fe8ff' },
    ],
    intro: 'custodio',
    outro: 'custodio_outro',
  },
  arquitecto: {
    id: 'arquitecto', name: 'El Arquitecto del Velo', shape: 'architect', element: 'velo', tier: 'boss',
    hp: 1800, atk: 44, def: 30, speed: 78, radius: 58, aggro: 900, range: 180, poise: 300, xp: 0, gold: 0,
    behavior: 'boss', capturable: null, echo: 'devorador', drops: [],
    colors: { main: '#1b1630', accent: '#b48cff', glow: '#dcc9ff' },
    lore: 'Aldric, el primer rey-sabio, quiso encerrar el sufrimiento en un solo sueño. El sueño lo encerró a él. Ahora ambos tienen miedo de despertar.',
    attacks: [
      { id: 'mano', type: 'melee', windup: 0.7, damage: 1.4, range: 200, arc: 1.7, color: '#b48cff' },
      { id: 'convergencia', type: 'aoe', windup: 1.3, damage: 1.5, radius: 240, color: '#8b6bff', pull: true },
      { id: 'lluvia', type: 'projectiles', windup: 1.0, damage: 1.0, count: 8, spread: 1.2, speed: 320, color: '#dcc9ff' },
      { id: 'grieta', type: 'beam', windup: 1.4, damage: 1.8, range: 600, width: 60, color: '#9fe8ff' },
      { id: 'ecos', type: 'summon', windup: 1.0, damage: 0, count: 3, enemy: 'espectro_velo', color: '#b48cff' },
      { id: 'juicio', type: 'ring', windup: 1.6, damage: 1.2, radius: 320, color: '#ff8a5c' },
    ],
    intro: 'arquitecto',
    outro: 'arquitecto_outro',
  },
};

export const ENEMY_IDS = Object.keys(ENEMIES);

export function getItem(id) { return ITEMS[id] || null; }
export function getCreature(id) { return CREATURES[id] || null; }
export function getEnemy(id) { return ENEMIES[id] || null; }
export function itemStatsText(item) {
  if (!item || !item.stats) return '';
  return Object.entries(item.stats).map(([k, v]) => `${ITEM_STAT_LABEL[k] || k} +${v}`).join(' · ');
}
