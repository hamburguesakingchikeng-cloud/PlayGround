// Árboles de habilidad, orígenes y dificultad.
export const ORIGINS = {
  brasa: {
    id: 'brasa', name: 'Vástago de la Brasa', epithet: 'La mano que no tiembla',
    desc: 'Creciste entre yunques y juramentos. El acero te reconoce antes que los dioses.',
    bonus: { str: 3, vit: 2, def: 1 }, color: '#ff9a5c', icon: '⚔',
    weapon: 'rusty_sword', armor: 'tunic',
    passive: 'Los ataques pesados infligen un 10% más de daño.',
  },
  velo: {
    id: 'velo', name: 'Ojo del Velo', epithet: 'La que escucha lo que no existe',
    desc: 'Naciste con un eco detrás de los ojos. Las cosas invisibles te hablan cuando duermes.',
    bonus: { int: 3, mana: 2, luck: 1 }, color: '#c7a4ff', icon: '✦',
    weapon: 'rusty_sword', armor: 'tunic',
    passive: 'Los hechizos cuestan un 10% menos de maná.',
  },
  sombra: {
    id: 'sombra', name: 'Sombra de Valdoria', epithet: 'La que nunca llegó tarde',
    desc: 'Aprendiste que el mejor golpe es el que nadie ve venir. Y que la suerte se cultiva.',
    bonus: { vel: 3, luck: 2, crit: 1 }, color: '#8fd18a', icon: '☾',
    weapon: 'rusty_sword', armor: 'tunic',
    passive: 'Tu esquiva tiene un 10% más de alcance y un 5% más de probabilidad crítica.',
  },
};

export const STAT_INFO = {
  vit: { name: 'Vitalidad', desc: 'Aumenta la vida máxima y la regeneración fuera de combate.', color: '#ff7b7b' },
  mana: { name: 'Maná', desc: 'Aumenta el maná máximo y la potencia de los hechizos.', color: '#7fb7ff' },
  res: { name: 'Resistencia', desc: 'Aumenta la resistencia máxima y su regeneración.', color: '#8fd18a' },
  str: { name: 'Fuerza', desc: 'Aumenta el daño de los ataques físicos.', color: '#ffb86a' },
  def: { name: 'Defensa', desc: 'Reduce el daño recibido.', color: '#cfc6b8' },
  vel: { name: 'Velocidad', desc: 'Aumenta la velocidad de movimiento y la cadencia.', color: '#9fe8ff' },
  int: { name: 'Inteligencia', desc: 'Aumenta el daño de hechizos y la captura de resonancias.', color: '#c7a4ff' },
  luck: { name: 'Suerte', desc: 'Aumenta críticos, botín y captura.', color: '#ffe7a8' },
};

export const SKILL_TREES = {
  espada: {
    name: 'Senda de la Espada', color: '#ffcf6a', icon: '⚔',
    desc: 'El acero es una promesa. Estas habilidades la mantienen.',
    nodes: [
      { id: 'blade_edge', tier: 1, name: 'Filo Ardiente', desc: 'Los ataques pesados aplican quemadura durante 4 s.', cost: 1 },
      { id: 'blade_guard', tier: 2, name: 'Guardia Perfecta', desc: 'Un parry perfecto libera una onda de choque que aturde.', cost: 1, requires: 'blade_edge' },
      { id: 'blade_rhythm', tier: 3, name: 'Cadencia de Acero', desc: 'La velocidad de la combinación aumenta un 20%.', cost: 1, requires: 'blade_guard' },
      { id: 'blade_ult', tier: 4, name: 'Tormenta Celestial', desc: 'Desbloquea la definitiva: tres tajos giratorios que atraviesan todo.', cost: 2, requires: 'blade_rhythm', ultimate: 'blade' },
    ],
  },
  velo: {
    name: 'Senda del Velo', color: '#c7a4ff', icon: '✦',
    desc: 'Lo que no se nombra, no se puede herir. Aprende a nombrar.',
    nodes: [
      { id: 'veil_step', tier: 1, name: 'Paso Umbrío', desc: 'La esquiva recorre un 25% más de distancia y deja una sombra.', cost: 1 },
      { id: 'veil_mark', tier: 2, name: 'Marca del Velo', desc: 'Los hechizos marcan al enemigo: recibe un 20% más de daño durante 6 s.', cost: 1, requires: 'veil_step' },
      { id: 'veil_siphon', tier: 3, name: 'Sifón de Almas', desc: 'Cada enemigo derrotado restaura 10 de maná.', cost: 1, requires: 'veil_mark' },
      { id: 'veil_ult', tier: 4, name: 'Nova del Velo', desc: 'Desbloquea la definitiva: congela a los enemigos y restaura maná.', cost: 2, requires: 'veil_siphon', ultimate: 'veil' },
    ],
  },
  resonancia: {
    name: 'Senda de la Resonancia', color: '#8fd18a', icon: '❧',
    desc: 'Ningún eco está solo. Estas habilidades escuchan a los demás.',
    nodes: [
      { id: 'res_bond', tier: 1, name: 'Vínculo', desc: 'El enfriamiento de la habilidad de tu criatura se reduce un 25%.', cost: 1 },
      { id: 'res_heal', tier: 2, name: 'Eco Vital', desc: 'La habilidad de tu criatura te cura un 10% adicional.', cost: 1, requires: 'res_bond' },
      { id: 'res_symphony', tier: 3, name: 'Sinfonía', desc: 'Tu criatura ataca un 35% más rápido.', cost: 1, requires: 'res_heal' },
      { id: 'res_ult', tier: 4, name: 'Despertar', desc: 'Desbloquea la definitiva: invoca a todas tus resonancias y te cura un 50%.', cost: 2, requires: 'res_symphony', ultimate: 'res' },
    ],
  },
};

export const ULTIMATES = {
  blade: { name: 'Tormenta Celestial', desc: 'Tres tajos giratorios que atraviesan todo lo que respira.', color: '#ffe7a8' },
  veil: { name: 'Nova del Velo', desc: 'El silencio se vuelve forma. Congela y quiebra a los enemigos.', color: '#c7a4ff' },
  res: { name: 'Despertar', desc: 'Todas tus resonancias responden al unísono.', color: '#8fd18a' },
};

export const DIFFICULTIES = {
  peregrino: {
    name: 'Peregrino', desc: 'La historia primero. Enemigos más benévolos.',
    enemyHp: 0.8, enemyDmg: 0.65, potion: 1.4, parryWindow: 0.22, xp: 1.15,
  },
  caballero: {
    name: 'Caballero', desc: 'La experiencia prevista. Cada error enseña.',
    enemyHp: 1, enemyDmg: 1, potion: 1, parryWindow: 0.18, xp: 1,
  },
  leyenda: {
    name: 'Leyenda', desc: 'El mundo no perdona. Los ecos tampoco.',
    enemyHp: 1.25, enemyDmg: 1.4, potion: 0.85, parryWindow: 0.13, xp: 0.9,
  },
};

export const WEAPON_TYPES = {
  sword: { name: 'Espada', range: 50, arc: 1.55, damage: 1, speed: 1, desc: 'Equilibrio entre alcance, cadencia y daño.' },
  greatsword: { name: 'Mandoble', range: 60, arc: 1.9, damage: 1.35, speed: 0.78, desc: 'Lento, amplio y devastador. Cada golpe es una decisión.' },
  spear: { name: 'Lanza', range: 78, arc: 0.85, damage: 0.9, speed: 0.95, desc: 'Alcance superior y golpes precisos en línea.' },
  staff: { name: 'Cetro', range: 46, arc: 1.25, damage: 0.8, speed: 1.05, desc: 'Canaliza mejor la magia, pero golpea con menos fuerza.' },
};
