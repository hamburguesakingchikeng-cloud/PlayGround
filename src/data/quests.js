export const QUESTS = {
  // ───────────────────────── ACTO I · VALDORIA ─────────────────────────
  despertar: {
    act: 1, type: 'main', region: 'valdoria', title: 'El despertar',
    desc: 'Has despertado junto al río sin recordar tu nombre. La Anciana Iria te espera en el centro de Alda de la Ribera.',
    steps: [{ type: 'talk', target: 'iria', label: 'Habla con la Anciana Iria', pos: [-4, 5] }],
    rewards: { xp: 90, gold: 30, items: [{ id: 'potion_vida', qty: 2 }] },
    next: 'sombras_ribera'
  },
  sombras_ribera: {
    act: 1, type: 'main', region: 'valdoria', title: 'Sombras en la ribera',
    desc: 'Los corrompidos han cruzado el río. Iria cree que algo está llamándolos desde las ruinas. Detén la incursión.',
    steps: [
      { type: 'kill', target: 'corrompido', count: 5, label: 'Derrota corrompidos en la ribera', pos: [26, 22] },
      { type: 'talk', target: 'iria', label: 'Regresa junto a Iria', pos: [-4, 5] }
    ],
    rewards: { xp: 240, gold: 70, items: [{ id: 'potion_vida', qty: 2 }, { id: 'potion_mana', qty: 1 }] },
    next: 'don_resonancia'
  },
  don_resonancia: {
    act: 1, type: 'main', region: 'valdoria', title: 'El don de la resonancia',
    desc: 'Nara, la cazadora de ecos, dice que las criaturas no se domestican: se escuchan. Aprende a invocar un vínculo.',
    steps: [
      { type: 'talk', target: 'nara', label: 'Habla con Nara en el bosque', pos: [-28, -34] },
      { type: 'capture', target: 'any', count: 1, label: 'Debilita y captura una criatura', pos: [-32, -48] },
      { type: 'talk', target: 'nara', label: 'Muestra el vínculo a Nara', pos: [-28, -34] }
    ],
    rewards: { xp: 320, gold: 80, items: [{ id: 'potion_vida', qty: 2 }, { id: 'esencia_resonancia', qty: 60 }] },
    next: 'ruinas_vael'
  },
  ruinas_vael: {
    act: 1, type: 'main', region: 'valdoria', title: 'Las ruinas de Vael',
    desc: 'Bajo las piedras de Vael duerme la Jarra de Origen. Enciende los tres braseros y enfrenta a lo que las raíces han protegido durante siglos.',
    steps: [
      { type: 'goto', target: 'ruinas', label: 'Llega a las Ruinas de Vael', pos: [-54, -24], radius: 14 },
      { type: 'interact', target: 'brazier_vael', count: 3, label: 'Enciende los tres braseros de Vael', pos: [-54, -24] },
      { type: 'boss', target: 'coloso_raiz', label: 'Derrota al Coloso de Raíz', pos: [-54, -32], arena: [-54, -32] }
    ],
    rewards: { xp: 620, gold: 180, items: [{ id: 'jarra_origen', qty: 1 }, { id: 'elixir_alba', qty: 1 }] },
    next: 'puerta_ceniza', completionFlag: 'jar_obtained'
  },
  puerta_ceniza: {
    act: 1, type: 'main', region: 'valdoria', title: 'La Puerta de Ceniza',
    desc: 'La Jarra susurra un camino hacia el este. La Puerta de Ceniza se ha abierto entre las colinas: más allá aguarda Drakmor.',
    steps: [{ type: 'goto', target: 'portal_drakmor', label: 'Cruza la Puerta de Ceniza', pos: [64, -50], radius: 7 }],
    rewards: { xp: 180, gold: 60 },
    next: 'tierras_ceniza'
  },

  // ───────────────────────── ACTO II · DRAKMOR ─────────────────────────
  tierras_ceniza: {
    act: 2, type: 'main', region: 'drakmor', title: 'Tierras de ceniza',
    desc: 'Drakmor arde bajo un cielo de hollín. Busca el campamento de Kaelen, el último rebelde que se niega a doblegarse ante Varok.',
    steps: [
      { type: 'goto', target: 'campamento', label: 'Encuentra el campamento de Kaelen', pos: [2, 58], radius: 12 },
      { type: 'talk', target: 'kaelen', label: 'Habla con Kaelen', pos: [2, 58] }
    ],
    rewards: { xp: 380, gold: 120, items: [{ id: 'llave_ceniza', qty: 1 }] },
    next: 'hija_ceniza'
  },
  hija_ceniza: {
    act: 2, type: 'main', region: 'drakmor', title: 'La hija de ceniza',
    desc: 'Varok no es el monstruo que Kaelen creía. Tres memorias de su hija yacen en el bosque de obsidiana y en el santuario. Recógelas antes de entrar en la fortaleza.',
    steps: [
      { type: 'interact', target: 'memoria_ceniza', count: 3, label: 'Recupera tres Memorias de Ceniza', pos: [-48, -30] },
      { type: 'talk', target: 'kaelen', label: 'Lleva las memorias a Kaelen', pos: [2, 58] }
    ],
    rewards: { xp: 520, gold: 160, items: [{ id: 'potion_vida', qty: 3 }] },
    next: 'senor_ceniza'
  },
  senor_ceniza: {
    act: 2, type: 'main', region: 'drakmor', title: 'El señor de ceniza',
    desc: 'La Fortaleza de Varok se alza sobre un río de lava. Kaelen ha abierto una brecha. Entra y decide qué hacer con el hombre que quiso detener el tiempo.',
    steps: [
      { type: 'interact', target: 'fortress_gate', label: 'Abre la puerta de la fortaleza', pos: [0, -36] },
      { type: 'boss', target: 'varok', label: 'Derrota a Varok', pos: [0, -58], arena: [0, -58] }
    ],
    rewards: { xp: 1100, gold: 400, items: [{ id: 'lagrima_brasa', qty: 1 }, { id: 'hoja_ceniza', qty: 1 }] },
    next: 'puerta_cielo', completionFlag: 'varok_defeated'
  },
  puerta_cielo: {
    act: 2, type: 'main', region: 'drakmor', title: 'La puerta del cielo',
    desc: 'Con la Lágrima de la Primera Brasa, la Puerta del Cielo despierta. Kansordore te espera entre las nubes.',
    steps: [{ type: 'goto', target: 'portal_kansordore', label: 'Asciende por la Puerta del Cielo', pos: [30, -56], radius: 7 }],
    rewards: { xp: 260, gold: 100 },
    next: 'ciudad_cielo'
  },

  // ───────────────────────── ACTO III · KANSORDORE ─────────────────────────
  ciudad_cielo: {
    act: 3, type: 'main', region: 'kansordore', title: 'La ciudad del cielo',
    desc: 'Islas suspendidas, templos que recuerdan y una biblioteca que nadie ha leído entera. Busca a Seraphine, la última archivera.',
    steps: [
      { type: 'goto', target: 'biblioteca', label: 'Llega a la Biblioteca Prohibida', pos: [-48, 6], radius: 12 },
      { type: 'talk', target: 'seraphine', label: 'Habla con Seraphine', pos: [-48, 6] }
    ],
    rewards: { xp: 650, gold: 200, items: [{ id: 'potion_mana', qty: 3 }] },
    next: 'tres_sellos'
  },
  tres_sellos: {
    act: 3, type: 'main', region: 'kansordore', title: 'Los tres sellos',
    desc: 'La Biblioteca Prohibida no se abre con llaves, sino con recuerdos. Encuentra los tres Sellos del Archivo repartidos por las islas.',
    steps: [
      { type: 'interact', target: 'sello_archivo', count: 3, label: 'Recupera los tres Sellos del Archivo', pos: [20, -20] },
      { type: 'talk', target: 'seraphine', label: 'Abre el Archivo con Seraphine', pos: [-48, 6] }
    ],
    rewards: { xp: 780, gold: 240, items: [{ id: 'diadema_velo', qty: 1 }] },
    next: 'jugador_cero'
  },
  jugador_cero: {
    act: 3, type: 'main', region: 'kansordore', title: 'El jugador cero',
    desc: 'El Archivo revela la verdad: tú no eres de este mundo. Has vivido esta historia incontables veces. El Custodio del Velo intentará impedir que vuelvas a elegir.',
    steps: [
      { type: 'goto', target: 'templo', label: 'Asciende al Templo del Velo', pos: [0, -50], radius: 14 },
      { type: 'boss', target: 'custodio_velo', label: 'Derrota al Custodio del Velo', pos: [0, -58], arena: [0, -58] }
    ],
    rewards: { xp: 1600, gold: 500, items: [{ id: 'corazon_cero', qty: 1 }] },
    next: 'convergencia'
  },
  convergencia: {
    act: 3, type: 'main', region: 'kansordore', title: 'La Convergencia',
    desc: 'El Velo se rompe. La Convergencia Absoluta toma la forma de todos los jugadores que fuiste. La Espada Celestial solo puede existir si alguien decide empuñarla.',
    steps: [
      { type: 'interact', target: 'altar_convergencia', label: 'Despierta la Espada Celestial', pos: [0, -64] },
      { type: 'boss', target: 'convergencia', label: 'Enfréntate a la Convergencia', pos: [0, -68], arena: [0, -66] }
    ],
    rewards: { xp: 3000, gold: 1000, items: [{ id: 'espada_celestial', qty: 1 }] },
    next: null
  },

  // ───────────────────────── SECUNDARIAS ─────────────────────────
  espada_rota: {
    act: 1, type: 'side', region: 'valdoria', title: 'La espada rota',
    desc: 'Tovin, el herrero de Alda de la Ribera, dice que tu hoja está incompleta. Necesita tres fragmentos de Hierro Estelar para forjar algo digno de una leyenda.',
    steps: [
      { type: 'collect', target: 'hierro_estelar', count: 3, label: 'Reúne tres Hierros Estelares', pos: [6, 4] },
      { type: 'talk', target: 'tovin', label: 'Lleva el metal a Tovin', pos: [12, 9] }
    ],
    rewards: { xp: 300, gold: 100, items: [{ id: 'espada_vael', qty: 1 }, { id: 'coraza_guardian', qty: 1 }] },
    next: null
  },
  flores_altar: {
    act: 1, type: 'side', region: 'valdoria', title: 'Flores para el altar',
    desc: 'Mera cuida el altar de los caídos. Las flores de lumen solo brillan al amanecer, y necesita cinco para la ceremonia.',
    steps: [
      { type: 'collect', target: 'flor_lumen', count: 5, label: 'Recoge cinco Flores de Lumen', pos: [18, 12] },
      { type: 'talk', target: 'mera', label: 'Entrega las flores a Mera', pos: [6, 15] }
    ],
    rewards: { xp: 260, gold: 90, items: [{ id: 'amuleto_ira', qty: 1 }, { id: 'potion_vida', qty: 2 }] },
    next: null
  },
  cazador_ecos: {
    act: 1, type: 'side', region: 'valdoria', title: 'El cazador de ecos',
    desc: 'Nara quiere comprobar si tu resonancia es real. Captura tres criaturas distintas y vuelve con ella.',
    steps: [
      { type: 'capture', target: 'any', count: 3, label: 'Captura tres criaturas distintas', pos: [-32, -48] },
      { type: 'talk', target: 'nara', label: 'Vuelve junto a Nara', pos: [-28, -34] }
    ],
    rewards: { xp: 500, gold: 180, items: [{ id: 'brazal_cazador', qty: 1 }, { id: 'esencia_resonancia', qty: 80 }] },
    next: null
  },
  faro_ceniza: {
    act: 2, type: 'side', region: 'drakmor', title: 'El faro de ceniza',
    desc: 'El faro del sureste lleva décadas apagado. Kaelen cree que aún puede guiar a los perdidos fuera de la grieta. Enciéndelo.',
    steps: [{ type: 'interact', target: 'faro_ceniza', label: 'Enciende el Faro de Ceniza', pos: [-58, 34], radius: 8 }],
    rewards: { xp: 360, gold: 150, items: [{ id: 'elixir_alba', qty: 1 }, { id: 'esencia_resonancia', qty: 60 }] },
    next: null
  },
  ecos_pasado: {
    act: 3, type: 'side', region: 'kansordore', title: 'Ecos del pasado',
    desc: 'Seraphine ha oído fragmentos de tu nombre en los ecos del archivo. Encuentra tres y tráelos: quizá recuerdes quién fuiste antes de ser Jugador Cero.',
    steps: [
      { type: 'interact', target: 'eco_pasado', count: 3, label: 'Escucha tres Ecos del Pasado', pos: [20, 20] },
      { type: 'talk', target: 'seraphine', label: 'Comparte los ecos con Seraphine', pos: [-48, 6] }
    ],
    rewards: { xp: 700, gold: 260, items: [{ id: 'anillo_archivero', qty: 1 }, { id: 'eco_nombre', qty: 1 }] },
    next: null
  }
}

export const MAIN_ORDER = ['despertar', 'sombras_ribera', 'don_resonancia', 'ruinas_vael', 'puerta_ceniza', 'tierras_ceniza', 'hija_ceniza', 'senor_ceniza', 'puerta_cielo', 'ciudad_cielo', 'tres_sellos', 'jugador_cero', 'convergencia']
export const SIDE_QUESTS = ['espada_rota', 'flores_altar', 'cazador_ecos', 'faro_ceniza', 'ecos_pasado']

export function questDef(id) { return QUESTS[id] }
export function questTitle(id) { return QUESTS[id]?.title || id }
