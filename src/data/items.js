export const RARITY = {
  comun: { name: 'Común', color: '#c9c3b3' },
  fino: { name: 'Fino', color: '#7fd3a0' },
  raro: { name: 'Raro', color: '#78b8ff' },
  epico: { name: 'Épico', color: '#c39bff' },
  legendario: { name: 'Legendario', color: '#ffd47a' },
  reliquia: { name: 'Reliquia', color: '#ff9b6b' }
}

export const STAT_NAMES = {
  vitalidad: 'Vitalidad', mana: 'Maná', resistencia: 'Resistencia', fuerza: 'Fuerza',
  defensa: 'Defensa', velocidad: 'Velocidad', inteligencia: 'Inteligencia', suerte: 'Suerte',
  ataque: 'Ataque', defensaPct: 'Defensa', poder: 'Poder mágico', critico: 'Crítico'
}

export const ITEMS = {
  // Armas
  filo_alba: { name: 'Filo del Alba', type: 'weapon', rarity: 'fino', icon: '†', value: 120, dmg: 11, stats: { fuerza: 1, velocidad: 1 }, desc: 'La hoja que te entregó Iria. Aún conserva un hilo de luz de la Gema Celestial.', color: 0xd9e6ff },
  espada_vael: { name: 'Espada de Vael', type: 'weapon', rarity: 'raro', icon: '†', value: 480, dmg: 23, stats: { fuerza: 3, defensa: 1 }, desc: 'Forjada con el metal de las ruinas. El guardián de raíz la temía.', color: 0xbfe1ff },
  hoja_ceniza: { name: 'Hoja de Ceniza', type: 'weapon', rarity: 'epico', icon: '†', value: 1100, dmg: 36, stats: { fuerza: 5, velocidad: 2 }, element: 'fuego', desc: 'El filo de Varok, templado en la Lágrima de la Primera Brasa. Quema sin consumirse.', color: 0xff8a4c },
  espada_celestial: { name: 'Espada Celestial', type: 'weapon', rarity: 'legendario', icon: '✧', value: 0, dmg: 58, stats: { fuerza: 7, inteligencia: 4, suerte: 3 }, element: 'luz', desc: 'La voluntad hecha filo. Solo existe cuando alguien decide empuñarla.', color: 0xffe6a0 },

  // Armaduras
  tunica_viajero: { name: 'Túnica de Viajero', type: 'armor', rarity: 'comun', icon: '♜', value: 60, stats: { defensa: 3, velocidad: 1 }, desc: 'Ropa de lino reforzada con cuero. Huele a camino y a lluvia.', color: 0x42536b },
  coraza_guardian: { name: 'Coraza del Guardián', type: 'armor', rarity: 'fino', icon: '♜', value: 320, stats: { defensa: 8, vitalidad: 3 }, desc: 'Acero de Valdoria, grabado con la espiral de la primera canción.', color: 0x6c7f95 },
  manto_drakmor: { name: 'Manto de Drakmor', type: 'armor', rarity: 'raro', icon: '♜', value: 760, stats: { defensa: 7, resistencia: 4, velocidad: 2 }, desc: 'Escamas de obsidiana que no pesan como piedra. Frías al tacto.', color: 0x533b47 },
  armadura_celestial: { name: 'Armadura Celestial', type: 'armor', rarity: 'legendario', icon: '♜', value: 0, stats: { defensa: 14, vitalidad: 6, inteligencia: 4 }, desc: 'No es metal: es memoria solidificada. Se adapta a quien la porta.', color: 0xd8c48c },

  // Cascos
  capucha_viajero: { name: 'Capucha de Viajero', type: 'helm', rarity: 'comun', icon: '⌂', value: 40, stats: { defensa: 1, suerte: 1 }, desc: 'Una capucha sencilla para no llamar la atención de los cuervos.', color: 0x3a4759 },
  yelmo_guardian: { name: 'Yelmo del Guardián', type: 'helm', rarity: 'fino', icon: '⌂', value: 210, stats: { defensa: 4, vitalidad: 1 }, desc: 'El frontal representa un sol partido: el juramento de proteger sin dominar.', color: 0x7d8b9c },
  diadema_velo: { name: 'Diadema del Velo', type: 'helm', rarity: 'epico', icon: '⌂', value: 900, stats: { inteligencia: 4, mana: 3, suerte: 2 }, desc: 'Un aro de luz fría. A veces susurra nombres que aún no existen.', color: 0xb7a4ff },

  // Amuletos
  amuleto_ira: { name: 'Amuleto de la Brasa', type: 'amulet', rarity: 'fino', icon: '◈', value: 180, stats: { fuerza: 2, suerte: 2 }, desc: 'Una brasa que nunca apaga. Late cuando hay peligro cerca.', color: 0xff8b5c },
  colgante_resonancia: { name: 'Colgante de Resonancia', type: 'amulet', rarity: 'raro', icon: '◈', value: 540, stats: { inteligencia: 3, suerte: 3 }, desc: 'Amplifica el vínculo con las criaturas. Su cadena está hecha de canciones.', color: 0x8ce9e5 },
  corazon_cero: { name: 'Corazón Cero', type: 'amulet', rarity: 'reliquia', icon: '◈', value: 0, stats: { vitalidad: 5, mana: 5, fuerza: 3, suerte: 5 }, desc: 'El eco de un jugador que ya no recuerda cuántas veces ha empezado.', color: 0xffe0a8 },

  // Consumibles
  potion_vida: { name: 'Poción de Vida', type: 'consumable', rarity: 'comun', icon: '♥', value: 25, heal: 60, desc: 'Savia de lumen destilada. Restaura 60 puntos de vida.', color: 0xff6b6b },
  potion_mana: { name: 'Poción de Maná', type: 'consumable', rarity: 'comun', icon: '✦', value: 30, mana: 45, desc: 'Agua de pozo lunar. Restaura 45 puntos de maná.', color: 0x76a8ff },
  elixir_alba: { name: 'Elixir del Alba', type: 'consumable', rarity: 'raro', icon: '✧', value: 90, heal: 160, mana: 80, desc: 'Un trago de amanecer. Restaura vida y maná por completo.', color: 0xffe09a },
  esencia_resonancia: { name: 'Esencia de Resonancia', type: 'consumable', rarity: 'fino', icon: '❖', value: 80, essence: 40, desc: 'Fragmentos de vínculo cristalizados. Se usan para fortalecer criaturas.', color: 0x8ce9e5 },

  // Materiales
  flor_lumen: { name: 'Flor de Lumen', type: 'material', rarity: 'comun', icon: '❀', value: 12, desc: 'Florece donde la luz toca el agua. Brilla tenuemente en la oscuridad.', color: 0x9fe8ff },
  hierro_estelar: { name: 'Hierro Estelar', type: 'material', rarity: 'raro', icon: '◆', value: 45, desc: 'Metal caído del cielo. Tovin dice que canta si lo golpeas con ritmo.', color: 0x9fb8de },
  memoria_ceniza: { name: 'Memoria de Ceniza', type: 'quest', rarity: 'epico', icon: '✺', value: 0, desc: 'Un recuerdo atrapado en vidrio volcánico. Al tocarlo, oyes una voz querida.', color: 0xff9e6a },
  sello_archivo: { name: 'Sello del Archivo', type: 'quest', rarity: 'epico', icon: '◉', value: 0, desc: 'Uno de los tres sellos que mantienen cerrada la Biblioteca Prohibida.', color: 0xc2b3ff },
  llave_ceniza: { name: 'Llave de Ceniza', type: 'key', rarity: 'fino', icon: '⚿', value: 0, desc: 'Abre la puerta de la Fortaleza de Varok.', color: 0xffb27a },
  jarra_origen: { name: 'Jarra de Origen', type: 'relic', rarity: 'legendario', icon: 'Ω', value: 0, desc: 'Contiene el primer recuerdo del mundo. Su agua no moja: recuerda.', color: 0x9ee7da },
  lagrima_brasa: { name: 'Lágrima de la Primera Brasa', type: 'relic', rarity: 'legendario', icon: '✧', value: 0, desc: 'El fuego que aprendió a llorar. Puede reavivar lo que el Velo ha borrado.', color: 0xffc06a },
  eco_nombre: { name: 'Eco del Nombre', type: 'quest', rarity: 'reliquia', icon: '◇', value: 0, desc: 'Tu nombre, dicho por una voz que no es la tuya. Es la prueba de que estuviste aquí antes.', color: 0xffe6b0 },

  // Mejoras
  brazal_cazador: { name: 'Brazal del Cazador de Ecos', type: 'amulet', rarity: 'raro', icon: '◈', value: 480, stats: { suerte: 4, velocidad: 2 }, desc: 'Regalo de Nara. Las criaturas confían antes en quien sabe esperar.', color: 0x8dd6a8 },
  anillo_archivero: { name: 'Anillo del Archivero', type: 'amulet', rarity: 'epico', icon: '◈', value: 820, stats: { inteligencia: 4, mana: 4 }, desc: 'Un anillo de tinta sólida. Escribe en el aire los nombres verdaderos.', color: 0xa99aff }
}

export function item(id) { return ITEMS[id] || { name: id, type: 'material', rarity: 'comun', icon: '?', desc: '' } }

export const STARTING_EQUIPMENT = {
  weapon: 'filo_alba',
  armor: 'tunica_viajero',
  helm: 'capucha_viajero',
  amulet: null
}

export const JURAMENTOS = {
  guardian: {
    name: 'Guardián', icon: '⬡', title: 'Escudo de Valdoria',
    desc: 'Aguantas lo que otros no pueden. Tu juramento convierte el dolor en refugio.',
    bonus: { vitalidad: 4, resistencia: 3, defensa: 4 },
    skill: 'bastion',
    skillName: 'Bastión del Alba',
    skillDesc: 'Un domo de luz reduce el daño recibido y empuja a los enemigos cercanos.',
    color: '#e4c27c'
  },
  filo: {
    name: 'Filo', icon: '⟡', title: 'Hoja del Velo',
    desc: 'Bailas entre las grietas del mundo. Cada paso deja una herida de luz.',
    bonus: { fuerza: 4, velocidad: 3, suerte: 2 },
    skill: 'tajo',
    skillName: 'Tajo del Velo',
    skillDesc: 'Te deslizas hacia delante y cortas todo lo que encuentra tu hoja.',
    color: '#ffb08a'
  },
  vidente: {
    name: 'Vidente', icon: '✧', title: 'Ojo de Kansordore',
    desc: 'Escuchas la canción que sostiene las cosas. Puedes cambiarla.',
    bonus: { inteligencia: 5, mana: 4, suerte: 2 },
    skill: 'prisa',
    skillName: 'Prisa de Luz',
    skillDesc: 'Lanzas una aguja de luz que atraviesa a los enemigos y restaura maná.',
    color: '#9cd8ff'
  }
}

export const DIFFICULTIES = {
  relato: { name: 'Relato', desc: 'La historia por encima del desafío. Daño recibido −35 %.', taken: .65, dealt: 1.1, capture: 1.15 },
  aventura: { name: 'Aventura', desc: 'El equilibrio para el que fue escrita esta leyenda.', taken: 1, dealt: 1, capture: 1 },
  prueba: { name: 'Prueba', desc: 'El Velo no perdona. Daño recibido +45 %, captura más difícil.', taken: 1.45, dealt: .95, capture: .82 }
}
