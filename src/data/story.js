export const CHAPTERS = {
  prologue: { number: 'PRÓLOGO', title: 'El Despertar', region: 'VALDORIA' },
  one: { number: 'CAPÍTULO I', title: 'La canción rota', region: 'VALDORIA' },
  two: { number: 'CAPÍTULO II', title: 'La Lágrima de la Primera Brasa', region: 'DRAKMOR' },
  three: { number: 'CAPÍTULO III', title: 'El archivo del Velo', region: 'KANSORDORE' },
  final: { number: 'CAPÍTULO FINAL', title: 'La Convergencia Absoluta', region: 'KANSORDORE' },
};

export const QUESTS = {
  m1: {
    id: 'm1', title: 'El primer latido', type: 'main', chapter: 1, next: 'm2',
    summary: 'Has despertado sin recuerdos junto al santuario de Lumen. Una voz te llamó por un nombre que no es el tuyo: Jugador Cero.',
    steps: [
      { type: 'talk', target: 'nara', text: 'Habla con Nara en la Aldea de Lumen' },
      { type: 'kill', target: 'lobo_ceniza', count: 3, text: 'Defiende la aldea de los lobos de ceniza' },
      { type: 'talk', target: 'borin', text: 'Habla con el anciano Borin en la herrería' },
    ],
    rewards: { xp: 90, gold: 45, items: [{ id: 'pocion_menor', qty: 2 }] }
  },
  m2: {
    id: 'm2', title: 'Las tres resonancias', type: 'main', chapter: 1, next: 'm3',
    summary: 'Las Piedras de Resonancia guardan la memoria del bosque. Si despiertan, también despertará aquello que el Velo enterró.',
    steps: [
      { type: 'reach', target: 'stone_lumen', text: 'Activa la Piedra de Lumen, al noroeste del bosque' },
      { type: 'reach', target: 'stone_alba', text: 'Activa la Piedra del Alba, junto al río' },
      { type: 'reach', target: 'stone_rio', text: 'Activa la Piedra del Río, en el sur del bosque' },
      { type: 'boss', target: 'guardian_espectral', text: 'Derrota al Guardián Espectral en el Claro Antiguo' },
    ],
    rewards: { xp: 240, gold: 130, items: [{ id: 'filo_lumen', qty: 1 }, { id: 'pocion_mayor', qty: 2 }] }
  },
  m3: {
    id: 'm3', title: 'La grieta en el cielo', type: 'main', chapter: 1, next: null,
    summary: 'El cielo se ha abierto sobre Valdoria. Alguien está usando la Gema rota como una llave, y no piensa detenerse.',
    steps: [
      { type: 'reach', target: 'village_plaza', text: 'Regresa a la plaza de la Aldea de Lumen' },
      { type: 'boss', target: 'kael', text: 'Enfréntate a Kael, Caballero del Velo' },
      { type: 'talk', target: 'nara', text: 'Habla con Nara después de la batalla' },
    ],
    rewards: { xp: 360, gold: 180, items: [{ id: 'capa_guardian', qty: 1 }] }
  },
  m4: {
    id: 'm4', title: 'La Lágrima de la Primera Brasa', type: 'main', chapter: 2, next: 'm5',
    summary: 'En Drakmor, bajo la fortaleza del Rey Ceniciento, duerme la única lágrima que la primera llama derramó jamás.',
    steps: [
      { type: 'talk', target: 'rhea', text: 'Habla con la capitana Rhea en Brasa Rota' },
      { type: 'reach', target: 'forja_ceniza', text: 'Desciende a la Forja Cenicienta' },
      { type: 'boss', target: 'malachar', text: 'Derrota a Malachar, Rey Ceniciento' },
      { type: 'talk', target: 'lyra', text: 'Habla con Lyra en el campamento' },
    ],
    rewards: { xp: 620, gold: 340, items: [{ id: 'cota_ceniza', qty: 1 }, { id: 'pocion_mayor', qty: 3 }] }
  },
  m5: {
    id: 'm5', title: 'El archivo prohibido', type: 'main', chapter: 3, next: 'm6',
    summary: 'Kansordore no es una región: es una pregunta. Y la respuesta está escrita en un libro que nadie debía leer.',
    steps: [
      { type: 'reach', target: 'archivo', text: 'Entra en el Archivo del Velo' },
      { type: 'talk', target: 'veyra', text: 'Escucha a Veyra, la última custodio' },
      { type: 'reach', target: 'eco_uno', text: 'Escucha el Eco de la Creación' },
      { type: 'reach', target: 'eco_dos', text: 'Escucha el Eco del Nombre' },
      { type: 'reach', target: 'eco_tres', text: 'Escucha el Eco del Silencio' },
    ],
    rewards: { xp: 820, gold: 380, items: [{ id: 'corona_velo', qty: 1 }, { id: 'elixir', qty: 1 }] }
  },
  m6: {
    id: 'm6', title: 'La Convergencia Absoluta', type: 'main', chapter: 4, next: null,
    summary: 'El Coro espera en la Cumbre. La Profecía nunca incluyó tu nombre. Esa es tu única ventaja.',
    steps: [
      { type: 'reach', target: 'cumbre', text: 'Asciende a la Cumbre del Coro' },
      { type: 'boss', target: 'coro_absoluto', text: 'Silencia a Seraphine, el Coro Absoluto' },
      { type: 'flag', target: 'final_choice', text: 'Decide el destino de la canción' },
    ],
    rewards: { xp: 1400, gold: 600, items: [] }
  },

  s_flores: {
    id: 's_flores', title: 'Flores para Elara', type: 'side', chapter: 1,
    summary: 'Elara prepara un remedio para los niños de la aldea. Necesita tres flores de lumen que solo crecen de noche.',
    steps: [
      { type: 'collect', target: 'flor_lumen', count: 3, text: 'Recoge 3 flores de lumen' },
      { type: 'talk', target: 'elara', text: 'Lleva las flores a Elara' },
    ],
    rewards: { xp: 110, gold: 70, items: [{ id: 'amuleto_lumen', qty: 1 }, { id: 'pocion_menor', qty: 2 }] }
  },
  s_martillo: {
    id: 's_martillo', title: 'El martillo perdido', type: 'side', chapter: 1,
    summary: 'Borin dejó su martillo en las ruinas del este cuando era joven. Dice que ya no lo necesita; sus manos dicen otra cosa.',
    steps: [
      { type: 'reach', target: 'ruinas_martillo', text: 'Recupera el martillo de Borin en las Ruinas del Este' },
      { type: 'talk', target: 'borin', text: 'Devuelve el martillo a Borin' },
    ],
    rewards: { xp: 150, gold: 120, items: [{ id: 'mandoble_ceniza', qty: 1 }] }
  },
  s_pozo: {
    id: 's_pozo', title: 'Susurros en el pozo', type: 'side', chapter: 1,
    summary: 'Tomo dice que el pozo de la aldea canta de noche. Los espectros también lo han oído.',
    steps: [
      { type: 'kill', target: 'espectro_lumen', count: 3, text: 'Elimina a los espectros junto al pozo' },
      { type: 'talk', target: 'tomo', text: 'Cuéntale a Tomo lo que has oído' },
    ],
    rewards: { xp: 130, gold: 85, items: [{ id: 'incienso', qty: 2 }] }
  },
  s_mineros: {
    id: 's_mineros', title: 'Los que quedaron abajo', type: 'side', chapter: 2,
    summary: 'Tres mineros siguen atrapados en la mina de Brasa Rota. Algo con cuernos les impide salir.',
    steps: [
      { type: 'reach', target: 'mina', text: 'Entra en la mina derrumbada' },
      { type: 'kill', target: 'demonio_forja', count: 3, text: 'Elimina a los demonios de la forja' },
      { type: 'talk', target: 'rhea', text: 'Informa a la capitana Rhea' },
    ],
    rewards: { xp: 260, gold: 180, items: [{ id: 'pocion_mayor', qty: 3 }] }
  },
  s_brasa: {
    id: 's_brasa', title: 'La última brasa', type: 'side', chapter: 2,
    summary: 'Lyra quiere estudiar cinco ascuas vivas antes de que la erupción las apague para siempre.',
    steps: [
      { type: 'collect', target: 'ascuas', count: 5, text: 'Recoge 5 ascuas vivas en las grietas de Drakmor' },
      { type: 'talk', target: 'lyra', text: 'Lleva las ascuas a Lyra' },
    ],
    rewards: { xp: 300, gold: 200, items: [{ id: 'brazal_resonancia', qty: 1 }, { id: 'incienso', qty: 2 }] }
  },
  s_ecos: {
    id: 's_ecos', title: 'Ecos en el archivo', type: 'side', chapter: 3,
    summary: 'La archivera Sel ha perdido tres ecos entre los estantes. Sin ellos, la historia del Velo tiene agujeros.',
    steps: [
      { type: 'reach', target: 'eco_uno', text: 'Recupera el Eco de la Creación' },
      { type: 'reach', target: 'eco_dos', text: 'Recupera el Eco del Nombre' },
      { type: 'reach', target: 'eco_tres', text: 'Recupera el Eco del Silencio' },
      { type: 'talk', target: 'sel', text: 'Devuelve los ecos a la archivera Sel' },
    ],
    rewards: { xp: 400, gold: 250, items: [{ id: 'anillo_filo', qty: 1 }] }
  },
  s_kael: {
    id: 's_kael', title: 'El juramento quebrado', type: 'side', chapter: 3,
    summary: 'Kael sobrevivió a Valdoria. Ahora duda. Las sombras del Velo lo buscan para cobrar su deuda.',
    steps: [
      { type: 'kill', target: 'sombra_velo', count: 3, text: 'Protege a Kael de las sombras del Velo' },
      { type: 'talk', target: 'kael_camp', text: 'Habla con Kael en el campamento' },
    ],
    rewards: { xp: 450, gold: 260, items: [{ id: 'colgante_jugador', qty: 1 }] }
  }
};

export const NPCS = {
  nara: {
    name: 'Nara', role: 'Archivista de Lumen', portrait: 'nara',
    visual: { skin: '#e8b98f', hair: '#4a2b2b', hairStyle: 1, outfit: '#3c4f78', accent: '#d8b06a', accessory: 2, height: .98 }
  },
  borin: {
    name: 'Borin', role: 'Herrero de la Aldea', portrait: 'borin',
    visual: { skin: '#c9926b', hair: '#b8b0a0', hairStyle: 3, outfit: '#5c3d2b', accent: '#8a6242', accessory: 0, height: 1.02, beard: true }
  },
  elara: {
    name: 'Elara', role: 'Herborista', portrait: 'elara',
    visual: { skin: '#e8c09a', hair: '#6a3d2a', hairStyle: 2, outfit: '#3d5a3f', accent: '#b8c87a', accessory: 1, height: .95 }
  },
  tomo: {
    name: 'Tomo', role: 'Poeta del Pozo', portrait: 'tomo',
    visual: { skin: '#d8a878', hair: '#8a6a42', hairStyle: 0, outfit: '#5d4a4a', accent: '#b09060', accessory: 0, height: 1 }
  },
  sibil: {
    name: 'Sibil', role: 'La niña que recuerda', portrait: 'sibil',
    visual: { skin: '#f0d8c8', hair: '#e8e8f0', hairStyle: 0, outfit: '#cfd8ee', accent: '#a8c8ff', accessory: 3, height: .78, glow: true }
  },
  ren: {
    name: 'Ren', role: 'Guardia de Lumen', portrait: 'ren',
    visual: { skin: '#c88f68', hair: '#2b2420', hairStyle: 3, outfit: '#4a5570', accent: '#8a9ab0', accessory: 3, height: 1.02, armor: true }
  },
  mira: {
    name: 'Mira', role: 'Panadera', portrait: 'mira',
    visual: { skin: '#e8b890', hair: '#c87a3a', hairStyle: 2, outfit: '#6a4a3a', accent: '#d8b07a', accessory: 1, height: .96 }
  },
  lyra: {
    name: 'Lyra', role: 'Erudita de Criaturas', portrait: 'lyra',
    visual: { skin: '#d8a078', hair: '#b84a3a', hairStyle: 1, outfit: '#6a3a3a', accent: '#e8a85a', accessory: 2, height: .97 }
  },
  rhea: {
    name: 'Rhea', role: 'Capitana de Brasa Rota', portrait: 'rhea',
    visual: { skin: '#b87a58', hair: '#2a2028', hairStyle: 3, outfit: '#5a2e30', accent: '#c86a4a', accessory: 0, height: 1.04, armor: true, scar: true }
  },
  ash: {
    name: 'Ash', role: 'Fundidor de Brasa Rota', portrait: 'ash',
    visual: { skin: '#9a6a52', hair: '#3a2a28', hairStyle: 3, outfit: '#4a3030', accent: '#a05838', accessory: 0, height: 1, beard: true }
  },
  veyra: {
    name: 'Veyra', role: 'Última Custodio del Velo', portrait: 'veyra',
    visual: { skin: '#e8c8b0', hair: '#d8d0e8', hairStyle: 0, outfit: '#bab4c8', accent: '#e8d8a0', accessory: 3, height: 1.02, glow: true }
  },
  sel: {
    name: 'Sel', role: 'Archivera de Kansordore', portrait: 'sel',
    visual: { skin: '#d8b090', hair: '#5a4a6a', hairStyle: 2, outfit: '#4a4468', accent: '#a898d8', accessory: 2, height: .95 }
  },
  kael_camp: {
    name: 'Kael', role: 'Caballero sin juramento', portrait: 'kael',
    visual: { skin: '#c8a080', hair: '#3a3038', hairStyle: 1, outfit: '#3a3e52', accent: '#8a7ab8', accessory: 0, height: 1.06, armor: true, scar: true }
  }
};

const p = (speaker, text, extra = {}) => ({ speaker: NPCS[speaker]?.name || speaker, role: NPCS[speaker]?.role || '', portrait: speaker, text, ...extra });
const hero = (text, extra = {}) => ({ speaker: 'Aurel', role: 'Portador de la Resonancia', portrait: 'hero', text, ...extra });
const sib = (text, extra = {}) => ({ speaker: 'Sibil', role: 'La niña que recuerda', portrait: 'sibil', text, ...extra });

function hasQ(g, id) { return g.questState(id)?.status === 'active'; }
function doneQ(g, id) { return g.questState(id)?.status === 'done'; }
function stepIs(g, id, idx) { const q = g.questState(id); return q?.status === 'active' && q.step === idx; }

export function dialogueFor(npcId, g) {
  const f = g.flags;
  switch (npcId) {
    case 'nara': return naraDialogue(g);
    case 'borin': return borinDialogue(g);
    case 'elara': return elaraDialogue(g);
    case 'tomo': return tomoDialogue(g);
    case 'sibil': return sibilDialogue(g);
    case 'ren': return {
      start: [
        p('ren', 'La aldea sigue en pie gracias a ti. El bosque, en cambio, lleva años esperando a alguien que se atreva a escucharlo.'),
        p('ren', 'Si vas hacia el este, cruza el puente y no te acerques a las ruinas de noche. Las columnas cambian de sitio. O eso dice el vino.'),
        p('ren', 'Cuando el cielo se abrió, vi una espada de luz dentro de la grieta. Duró un latido. Luego la Gema volvió a apagarse.')
      ],
      repeat: [
        p('ren', 'La guardia no descansa. Bueno, yo sí. Pero no se lo digas a la capitana.')
      ]
    };
    case 'mira': return {
      start: [
        p('mira', 'Pan caliente, recién salido del horno. No hay mejor arma contra el miedo, criatura.'),
        p('mira', 'Dicen que la Gema se rompió porque alguien intentó cantar con la voz de otro. Yo solo sé que el pan se hace mejor en silencio.'),
        { choices: [
          { text: 'Comprar pan de viaje (15 de oro)', action: 'buy:pan_viaje:15', next: [] },
          { text: 'Despedirte', next: [] }
        ] }
      ],
      repeat: [
        p('mira', 'El horno nunca duerme. Yo tampoco, por desgracia.'),
        { choices: [
          { text: 'Comprar pan de viaje (15 de oro)', action: 'buy:pan_viaje:15', next: [] },
          { text: 'Despedirte', next: [] }
        ] }
      ]
    };
    case 'lyra': return lyraDialogue(g);
    case 'rhea': return rheaDialogue(g);
    case 'ash': return {
      start: [
        p('ash', 'No toques el metal con las manos desnudas. Aquí todo está caliente, incluso los recuerdos.'),
        { choices: [
          { text: 'Abrir la tienda de Ash', action: 'shop:ash', next: [] },
          { text: 'Despedirte', next: [] }
        ] }
      ]
    };
    case 'veyra': return veyraDialogue(g);
    case 'sel': return selDialogue(g);
    case 'kael_camp': return kaelCampDialogue(g);
    default: return { start: [p('ren', 'Que la luz de Lumen te acompañe.')] };
  }
}

function naraDialogue(g) {
  if (doneQ(g, 'm6')) return { start: [p('nara', 'El mundo sigue cantando. Y esta vez, la canción incluye tu nombre.')] };
  if (hasQ(g, 'm3') && g.flags.kael_defeated) return { start: [
    p('nara', 'Kael no era el enemigo. Solo era el primero que se atrevió a mirar la grieta de cerca.'),
    hero('¿Qué hay al otro lado?'),
    p('nara', 'Drakmor. Ceniza sobre ceniza. Y una lágrima que lleva mil años esperando a que alguien la recoja.'),
    p('nara', 'La Profecía de Jugador Cero habla de ti. Del que no estaba escrito. Pero las profecías son como los mapas: solo muestran lo que el cartógrafo quiso ver.'),
    hero('No recuerdo quién soy.'),
    p('nara', 'Eso, precisamente, es lo que te hace libre. La Gema guarda la memoria del mundo. Si la recuperas... quizá también te recuperes a ti.'),
    { text: 'Nara dibuja un círculo en el aire. El Velo se abre, y del otro lado huele a hierro y a tormenta.', speaker: 'NARA', portrait: 'nara', role: 'Archivista de Lumen' },
    { choices: [
      { text: 'Cruzar hacia Drakmor', action: 'travel:drakmor:brasa', next: [] }
    ] }
  ] };
  if (hasQ(g, 'm2') && g.flags.guardian_defeated) return { start: [
    p('nara', 'Lo has conseguido. El fragmento de la Gema... está cantando.'),
    hero('La grieta del cielo se ha ensanchado.'),
    p('nara', 'La Convergencia ha comenzado. El Velo pierde notas, y lo que hay al otro lado empieza a escucharse.'),
    p('nara', 'Ve a la plaza. Hay algo que debes ver con tus propios ojos.'),
    { action: 'startQuest:m3', next: [] }
  ] };
  if (hasQ(g, 'm2')) return { start: [
    p('nara', 'Las tres piedras están en el bosque: al noroeste, junto al río y al sur. El Guardián despertará cuando las tres canten.'),
    p('nara', 'Si el Guardián te ataca, no huyas. Los espíritus respetan a quien mantiene la mirada.'),
    hero('¿Y si no soy ese Jugador Cero?'),
    p('nara', 'Entonces el mundo se equivocó al elegirte. No sería la primera vez que se equivoca.')
  ] };
  if (hasQ(g, 'm1') && g.flags.lobos_cleared) return { start: [
    p('nara', 'Has oído el pulso de la Gema, ¿verdad? No estás loco. La Gema se rompió, pero no se apagó.'),
    p('nara', 'Borin te espera en su herrería, al este de la plaza. Tiene algo que darte y muy poco tiempo para explicarlo.'),
    { action: 'advance:m1', next: [] }
  ] };
  if (hasQ(g, 'm1')) return { start: [
    p('nara', 'Te llamas Aurel. Eso dice la piedra del santuario. Aunque no sé si es tu nombre o el nombre que el mundo necesitaba.'),
    p('nara', 'Los lobos de ceniza han bajado del bosque. No son criaturas corruptas: están asustadas. Y el miedo muerde.'),
    hero('¿Qué quieres que haga?'),
    p('nara', 'Defiende la aldea. Tres lobos bastarán para que la manada retroceda. Después habla con Borin.'),
    { action: 'setFlag:lobos_quest', next: [] }
  ] };
  return { start: [
    p('nara', 'El que no estaba escrito... por fin abres los ojos.'),
    hero('¿Quién eres? ¿Dónde estoy?'),
    p('nara', 'Estás en Valdoria, aldea de Lumen. Yo soy Nara, y guardo libros que nadie lee. Tú eres Jugador Cero.'),
    p('nara', 'La Gema Celestial se rompió hace mil años. Desde entonces el Velo nos protege del silencio que hay afuera. Y desde hace tres noches, el Velo está... desafinando.'),
    { choices: [
      { text: '¿Qué es el Velo?', next: [p('nara', 'La membrana entre el mundo que conoces y la Primera Brasa. Una canción que nos mantiene completos. Si se rompe, no moriremos: nos convertiremos en ecos.')] },
      { text: '¿Por qué yo?', next: [p('nara', 'Porque la Gema te reconoció. No sé cómo ni por qué. Y esa, Aurel, es la primera cosa honesta que digo en años.')] }
    ] },
    p('nara', 'Los lobos de ceniza atacan la aldea. Necesito que empuñes esa espada oxidada y demuestres que la Gema no se equivocó.'),
    { action: 'startQuest:m1', next: [] }
  ] };
}

function borinDialogue(g) {
  if (hasQ(g, 's_martillo') && g.flags.martillo_recogido) return { start: [
    p('borin', 'Mi martillo. Pensé que las ruinas se lo habrían tragado.'),
    hero('Estaba bajo una columna. Seguía caliente.'),
    p('borin', 'Claro que lo estaba. Lo forjé con la última brasa de mi padre. Toma esta hoja. La hice para ti mientras soñaba que volvías.'),
    { action: 'completeQuest:s_martillo', next: [
      p('borin', 'No le des las gracias a un viejo. Dale las gracias al acero, que aguanta más que nosotros.')
    ] }
  ] };
  if (hasQ(g, 'm1') && g.flags.lobos_cleared) return { start: [
    p('borin', 'Así que eres tú. Hueles a tormenta y a camino viejo.'),
    p('borin', 'La Gema no elige a cualquiera. O eso decía mi madre. También decía que las cabras hablan, así que tómelo con calma.'),
    p('borin', 'Toma. Un filo de Lumen. No es la Espada Celestial, pero corta lo que toca.'),
    { action: 'advance:m1', next: [
      p('borin', 'Las tres Piedras de Resonancia están en el bosque. Ve y despiértalas. Yo cuidaré de la aldea.'),
      { action: 'startQuest:m2', next: [] }
    ] }
  ] };
  if (hasQ(g, 'm1')) return { start: [
    p('borin', 'Aún no. Primero ayuda a Nara con esos lobos. No quiero darle una espada a alguien que no sabe sostenerla.')
  ] };
  if (!doneQ(g, 's_martillo') && (doneQ(g, 'm1') || hasQ(g, 'm2') || hasQ(g, 'm3'))) {
    if (hasQ(g, 's_martillo')) return { start: [
      p('borin', 'El martillo está en las Ruinas del Este, cruzando el río. Busca una columna partida junto al altar.'),
      p('borin', 'Y no te fíes de las estatuas. Algunas tienen muy mal carácter.')
    ] };
    return { start: [
      p('borin', 'Tengo un problema de juventud. Dejé mi martillo en las Ruinas del Este cuando era un idiota con prisa.'),
      p('borin', 'Si lo recuperas, te daré algo que hice con estas manos. Algo que corta.'),
      { choices: [
        { text: 'Aceptar la misión', action: 'startQuest:s_martillo', next: [p('borin', 'Busca la columna partida junto al altar. Y vuelve entero.')] },
        { text: 'Quizá más tarde', next: [] }
      ] }
    ] };
  }
  return {
    start: [
      p('borin', 'El acero no miente. La gente sí. Por eso prefiero el acero.'),
      { choices: [
        { text: 'Abrir la tienda de Borin', action: 'shop:borin', next: [] },
        { text: 'Preguntar por la Gema', next: [p('borin', 'La Gema era una sola nota. Alguien la partió en tres y llamó a eso "protección". Yo llamo a eso miedo con buenos modales.')] },
        { text: 'Despedirte', next: [] }
      ] }
    ],
    repeat: [
      p('borin', '¿Otra vez por aquí? El yunque no se cansa. Yo sí.'),
      { choices: [
        { text: 'Abrir la tienda', action: 'shop:borin', next: [] },
        { text: 'Despedirte', next: [] }
      ] }
    ]
  };
}

function elaraDialogue(g) {
  if (hasQ(g, 's_flores') && g.inventoryCount('flor_lumen') >= 3) return { start: [
    p('elara', 'Tres flores. Huelen a lluvia y a después.'),
    hero('Los niños podrán dormir.'),
    p('elara', 'Todos podremos. Toma este amuleto. Lo llevaba mi madre cuando el Velo aún cantaba en sueños.'),
    { action: 'completeQuest:s_flores', next: [p('elara', 'Si vuelves a ver una flor de lumen, no la cojas. Escúchala. A veces dicen nombres.')] }
  ] };
  if (hasQ(g, 's_flores')) return { start: [p('elara', 'Las flores de lumen crecen donde la luz se queda dormida. Prueba en el bosque, lejos de los caminos.')] };
  if (doneQ(g, 's_flores')) return {
    start: [
      p('elara', 'El remedio funciona. Los niños ya no oyen la grieta por las noches.'),
      { choices: [
        { text: 'Comprar provisiones', action: 'shop:elara', next: [] },
        { text: 'Despedirte', next: [] }
      ] }
    ]
  };
  return {
    start: [
      p('elara', 'Tienes cara de no haber dormido en tres días. Y de haber visto algo que no sabes nombrar.'),
      p('elara', 'Los niños de la aldea tienen fiebre. No es una fiebre normal: dicen que oyen una canción dentro de la tierra.'),
      p('elara', 'Necesito tres flores de lumen. Crecen en el bosque, donde la luz se queda a dormir.'),
      { choices: [
        { text: 'Aceptar la misión', action: 'startQuest:s_flores', next: [p('elara', 'Gracias. Y ten cuidado: el bosque también escucha.')] },
        { text: 'Comprar provisiones', action: 'shop:elara', next: [] },
        { text: 'Más tarde', next: [] }
      ] }
    ],
    repeat: [
      p('elara', 'El bosque está al oeste. Las flores brillan incluso de día.'),
      { choices: [{ text: 'Comprar provisiones', action: 'shop:elara', next: [] }, { text: 'Despedirte', next: [] }] }
    ]
  };
}

function tomoDialogue(g) {
  if (hasQ(g, 's_pozo') && g.questState('s_pozo').count >= 3) return { start: [
    p('tomo', '¿Los has oído? No eran espectros. Eran los nombres de los que cayeron al pozo hace cien años.'),
    hero('El pozo ya está en silencio.'),
    p('tomo', 'Entonces han encontrado su nota. Toma. Incienso de resonancia. Para cuando el mundo vuelva a desafinar.'),
    { action: 'completeQuest:s_pozo', next: [] }
  ] };
  if (hasQ(g, 's_pozo')) return { start: [p('tomo', 'El pozo está al sureste de la plaza. Escucharás a los espectros antes de verlos.')] };
  return {
    start: [
      p('tomo', 'Escribo versos que nadie lee y cuido un pozo que nadie mira. Es un trabajo honesto.'),
      p('tomo', 'Desde la grieta, el pozo canta. Y no precisamente afinado.'),
      { choices: [
        { text: 'Investigar el pozo', action: 'startQuest:s_pozo', next: [p('tomo', 'Los espectros se han vuelto territoriales. Lleva tu espada. Y tapones para los oídos, si tienes.')] },
        { text: 'Escuchar su poema', next: [p('tomo', '"La Gema canta, el Velo calla, / y el hombre reza a lo que no estalla." Es provisional.')] },
        { text: 'Despedirte', next: [] }
      ] }
    ]
  };
}

function sibilDialogue(g) {
  if (hasQ(g, 'm2')) return { start: [
    sib('Las piedras no están donde los mapas dicen. Están donde el bosque recuerda.'),
    sib('La primera está donde la luz no llega. La segunda, donde el río se mira. La tercera, donde las raíces cuentan.'),
    hero('¿Eres real?'),
    sib('Todavía no. Pero tú tampoco, del todo. Por eso nos vemos.')
  ] };
  if (hasQ(g, 'm6')) return { start: [
    sib('Cuando llegues arriba, no le pidas permiso al Coro. La Profecía no sabe que existes.'),
    sib('Esa es tu espada. No la de acero. La otra.'),
    hero('¿Y si elijo mal?'),
    sib('Entonces elegirás. Que ya es más de lo que hicieron ellos.')
  ] };
  return { start: [
    sib('Hola, Jugador Cero.'),
    hero('¿Me conoces?'),
    sib('Te conozco desde antes de que nacieras. Que no es lo mismo que conocerte. Aún no has hecho nada interesante.'),
    sib('Cuando el cielo se rompa, sube. No mires atrás. Bueno, mira un poco. Las vistas son bonitas.')
  ] };
}

function lyraDialogue(g) {
  if (hasQ(g, 'm4') && g.flags.malachar_defeated) return { start: [
    p('lyra', 'La Lágrima... está viva. Late como un animal pequeño.'),
    hero('Malachar la guardaba dentro de su armadura.'),
    p('lyra', 'No la guardaba. La protegía. La Lágrima es el único recuerdo que la Primera Brasa conserva de sí misma. Si el Coro la usa para la Convergencia...'),
    hero('¿Qué pasa?'),
    p('lyra', 'Que el mundo no se apagará. Se desafinará. Y nadie sabrá que alguna vez hubo una canción.'),
    p('lyra', 'Lleva la Lágrima a Kansordore. Y lleva también esto: la última brasa de mi padre. Para que no vayas del todo a oscuras.'),
    { action: 'advance:m4', next: [
      { action: 'travel:kansordore:archivo', next: [] }
    ] }
  ] };
  if (hasQ(g, 's_brasa') && g.inventoryCount('ascuas') >= 5) return { start: [
    p('lyra', 'Cinco ascuas. Cinco latidos que no se apagaron.'),
    hero('La última brillaba más que las demás.'),
    p('lyra', 'Porque la última siempre es la que más se resiste. Toma el brazal. Las criaturas te reconocerán como amigo.'),
    { action: 'completeQuest:s_brasa', next: [] }
  ] };
  if (hasQ(g, 's_brasa')) return { start: [p('lyra', 'Las ascuas se esconden en las grietas de basalto, cerca de los ríos de lava. No las confundas con mis ojos cuando me enfado.')] };
  return {
    start: [
      p('lyra', '¡Cuidado con ese lagarto! No, el pequeño. El grande es un demonio. El pequeño es un lagarto.'),
      p('lyra', 'Soy Lyra. Estudio criaturas. Las catalogo, las cuido y, cuando puedo, las dejo en paz.'),
      p('lyra', 'Brasa Rota se muere por partes. Y aun así, los sables de ceniza siguen viniendo a beber del río de lava. Es casi poético.'),
      { choices: [
        { text: '¿Puedo ayudarte con algo?', next: [
          p('lyra', 'Necesito cinco ascuas vivas. Y no me preguntes para qué: la respuesta implica un experimento con una salamandra y un frasco muy grande.'),
          { choices: [
            { text: 'Buscaré las ascuas', action: 'startQuest:s_brasa', next: [] },
            { text: 'Quizá después', next: [] }
          ] }
        ] },
        { text: 'Hablar de Malachar', next: [p('lyra', 'El Rey Ceniciento no siempre fue un rey. Era un herrero que escuchó al Velo y creyó que podría cerrarlo con sus manos. Ahora sus manos son lava.')] },
        { text: 'Despedirte', next: [] }
      ] }
    ]
  };
}

function rheaDialogue(g) {
  if (hasQ(g, 'm4') && !g.flags.rhea_briefed) return { start: [
    p('rhea', 'Así que el Velo te escupió aquí. Bienvenido a Brasa Rota. No te acostumbres: la ciudad cambia de sitio cuando hay erupción.'),
    hero('Busco la Lágrima de la Primera Brasa.'),
    p('rhea', 'Todo el mundo busca algo que brilla. Esa lágrima está bajo la Fortaleza Cenicienta. Malachar la custodia. O la custodia a ella. Nunca lo he tenido claro.'),
    p('rhea', 'Si vas a bajar, necesitas una llave. La forja está al norte, en la boca del volcán. Mi gente la llama "el horno de los reyes".'),
    { action: 'setFlag:rhea_briefed', next: [
      p('rhea', 'Y una cosa más. Si ves a un caballero con armadura del Velo, no le des la espalda.'),
      hero('¿Kael?'),
      p('rhea', 'Así se llamaba el que me salvó la vida hace diez años. Luego se la vendió a otra cosa.')
    ] }
  ] };
  if (hasQ(g, 's_mineros') && g.questState('s_mineros').step >= 2) return { start: [
    p('rhea', '¿Los mineros?'),
    hero('Los tres están vivos. Asustados, pero vivos.'),
    p('rhea', 'Bien. La próxima ronda corre de mi cuenta. Y esta armadura es tuya. Robada a un capitán que ya no la necesita.'),
    { action: 'completeQuest:s_mineros', next: [] }
  ] };
  if (hasQ(g, 's_mineros') && g.flags.mina_cleared) return { start: [p('rhea', 'Los mineros ya han salido. Vuelve a hablar conmigo cuando termines de bajar.')] };
  if (hasQ(g, 's_mineros')) return { start: [p('rhea', 'La mina está al oeste, marcada por una viga rota. Si oyes tambores, no son mineros. Son demonios.')] };
  return {
    start: [
      p('rhea', 'Brasa Rota perdió a su rey, su forja y su paciencia. Solo nos queda el vino.'),
      { choices: [
        { text: '¿Hay trabajo?', next: [
          p('rhea', 'Tres mineros siguen atrapados en la mina vieja. Algo con cuernos se los ha quedado. Si los sacas, te pagaré.'),
          { choices: [
            { text: 'Voy a por ellos', action: 'startQuest:s_mineros', next: [] },
            { text: 'Ahora no', next: [] }
          ] }
        ] },
        { text: '¿Qué sabes de Malachar?', next: [p('rhea', 'Que fue un hombre antes de ser un rey. Y que un rey sin pueblo es solo un hombre con corona.')] },
        { text: 'Despedirte', next: [] }
      ] }
    ]
  };
}

function veyraDialogue(g) {
  if (hasQ(g, 'm5') && g.questState('m5').step >= 2) return { start: [
    p('veyra', 'Has escuchado los tres ecos. Entonces ya sabes lo que el Coro intenta borrar.'),
    hero('La Gema no protege al mundo. Lo está soñando.'),
    p('veyra', 'Sí. Y el Coro quiere despertar del sueño. No por maldad: porque cree que el sueño duele demasiado.'),
    p('veyra', 'La Convergencia no es una destrucción. Es una unificación. Todos seremos uno. Ninguno será nadie.'),
    hero('Y la Espada Celestial...'),
    p('veyra', 'No es un arma. Es una decisión. La Hoja que separa lo que canta de lo que escucha. Solo el Jugador Cero puede empuñarla sin desafinar.'),
    p('veyra', 'Sube a la Cumbre. Seraphine te espera. Y por primera vez en mil años, la canción tiene una nota libre.'),
    { action: 'advance:m5', next: [{ action: 'startQuest:m6', next: [] }] }
  ] };
  return { start: [
    p('veyra', 'Bienvenido al Archivo del Velo. Aquí no se guardan libros: se guardan voces.'),
    p('veyra', 'Cada eco en esta sala es una versión del mundo que pudo existir y no existió. El Coro los llama errores. Yo los llamo pruebas.'),
    p('veyra', 'Escucha los tres ecos: el de la Creación, el del Nombre y el del Silencio. Después, sube a la Cumbre.'),
    { action: 'advance:m5', next: [] }
  ] };
}

function selDialogue(g) {
  if (hasQ(g, 's_ecos') && g.questState('s_ecos').step >= 3) return { start: [
    p('sel', 'Los tres ecos. Están... completos.'),
    hero('El último no tenía sonido.'),
    p('sel', 'El Eco del Silencio nunca lo tuvo. Es la prueba de que el Velo escucha incluso cuando no hay nada que oír.'),
    p('sel', 'Toma este anillo. Lo talló un archivista que se enamoró de una estatua. La estatua no correspondió, pero el anillo corta muy bien.'),
    { action: 'completeQuest:s_ecos', next: [] }
  ] };
  if (hasQ(g, 's_ecos')) return { start: [p('sel', 'Los ecos flotan cerca de los pedestales vacíos. Si ves una luz que repite tu nombre, no la sigas. O sí. Yo qué sé.')] };
  if (doneQ(g, 's_ecos')) return { start: [p('sel', 'Con los ecos restaurados, la biblioteca vuelve a tener memoria. Gracias.')] };
  return {
    start: [
      p('sel', 'Silencio. Estás en una biblioteca.'),
      hero('El Coro...'),
      p('sel', 'El Coro habla todo el tiempo. Por eso nadie lo escucha.'),
      p('sel', 'He perdido tres ecos entre los estantes. Si los recuperas, la historia del Velo dejará de tener agujeros.'),
      { choices: [
        { text: 'Recuperar los ecos', action: 'startQuest:s_ecos', next: [p('sel', 'Están cerca de los pedestales. Y no toques el libro negro. Habla.')] },
        { text: 'Más tarde', next: [] }
      ] }
    ]
  };
}

function kaelCampDialogue(g) {
  if (hasQ(g, 's_kael') && g.questState('s_kael').step >= 1) return { start: [
    p('kael', 'Las sombras se han ido. Por primera vez en diez años, puedo oír mis propios pensamientos.'),
    hero('No tienes que seguirme.'),
    p('kael', 'No te sigo. Camino al lado. Es distinto.'),
    p('kael', 'Toma este colgante. Lo tallé en hueso de estrella cuando aún creía en las profecías. Ahora creo en las personas. Es un cambio reciente.'),
    { action: 'completeQuest:s_kael', next: [] }
  ] };
  if (hasQ(g, 's_kael')) return { start: [p('kael', 'Las sombras se esconden entre las ruinas del oeste. Tres deberían bastar para que el Velo deje de buscarme.')] };
  return { start: [
    p('kael', 'No esperaba verte aquí. Menos aún, verte vivo.'),
    hero('Podrías haberme matado en Valdoria.'),
    p('kael', 'Podría. Pero la Gema te reconoció, y yo solo soy un caballero que perdió su juramento.'),
    p('kael', 'Las sombras del Velo vienen a cobrar mi deuda. Si me ayudas a enfrentarlas, te daré algo que la Profecía no pudo quitarme.'),
    { choices: [
      { text: 'Te ayudaré', action: 'startQuest:s_kael', next: [p('kael', 'Gracias. No lo merezco, pero lo acepto.')] },
      { text: 'Aún no', next: [] }
    ] }
  ] };
}

export const CUTSCENES = {
  intro: [
    { chapter: 'PRÓLOGO', title: 'El Despertar', text: 'Mil años atrás, la Gema Celestial sostuvo el cielo con una sola nota. Después, alguien intentó cantarla solo. La Gema se rompió. El Velo cayó sobre el mundo.', bg: 'var(--cut-bg-1)' },
    { chapter: 'PRÓLOGO', title: 'La Profecía de Jugador Cero', text: '"Cuando la canción se quiebre y el Velo pierda su voz, despertará el que no fue escrito. No será el más fuerte. Será el que aún pueda elegir."', bg: 'var(--cut-bg-2)' },
    { chapter: 'VALDORIA', title: 'Aldea de Lumen', text: 'Tres noches antes de tu despertar, los niños de la aldea empezaron a oír una canción bajo la tierra. Los ancianos dijeron que era el Velo. Los sabios dijeron que era el fin. Ninguno se equivocaba.', bg: 'var(--cut-bg-3)' }
  ],
  act2: [
    { chapter: 'CAPÍTULO II', title: 'Drakmor', text: 'El Velo se abrió sobre un mar de ceniza. Aquí, donde la Primera Brasa tocó el mundo, la Gema dejó la única lágrima que una llama puede llorar.', bg: 'var(--cut-bg-4)' },
    { chapter: 'CAPÍTULO II', title: 'La Lágrima', text: 'Malachar, el último rey de Drakmor, la custodiaba. No para usarla. Para que nadie más la encontrara. Ahora la Lágrima late en tu mano, y el Coro ha empezado a cantar.', bg: 'var(--cut-bg-5)' }
  ],
  act3: [
    { chapter: 'CAPÍTULO III', title: 'Kansordore', text: 'Sobre las nubes, los templos del Coro flotan como notas suspendidas. Aquí se guarda la verdad que el Velo protege: el mundo no es un lugar. Es una canción que alguien está soñando.', bg: 'var(--cut-bg-6)' },
    { chapter: 'CAPÍTULO III', title: 'El Archivo del Velo', text: 'Veyra, la última custodio, te espera entre ecos de mundos que no fueron. La Profecía nunca incluyó tu nombre. Por eso puedes cambiarla.', bg: 'var(--cut-bg-7)' }
  ],
  final: [
    { chapter: 'CAPÍTULO FINAL', title: 'La Convergencia Absoluta', text: 'Seraphine, el Coro Absoluto, ha reunido la Gema, la Jarra y la Lágrima. Quiere cantar la nota final: una sola voz, un solo mundo, ningún adiós.', bg: 'var(--cut-bg-8)' },
    { chapter: 'CAPÍTULO FINAL', title: 'La Espada Celestial', text: 'La hoja no está forjada. Está esperando. Solo el Jugador Cero puede empuñarla sin desafinar. El mundo entero contiene la respiración.', bg: 'var(--cut-bg-9)' }
  ],
  endingA: {
    chapter: 'FINAL · EL VELO RESTAURADO', title: 'La canción que olvidó tu nombre',
    text: 'Cantas la nota que falta. La Gema se recompone, el Velo vuelve a cerrarse y el Coro se disuelve en lluvia. El mundo despierta sin recordar la grieta... ni a ti. En Valdoria, una anciana llamada Nara encuentra una espada oxidada junto al santuario. No sabe por qué llora.',
    bg: 'var(--cut-bg-10)'
  },
  endingB: {
    chapter: 'FINAL · LA JARRA QUEBRADA', title: 'Una canción sin dueño',
    text: 'Quiebras la Jarra. La canción escapa en todas direcciones: cada persona recuerda una vida que no vivió, cada criatura canta su propio nombre. El Velo cae, pero no hay silencio: hay mil canciones. Nadie sabe qué será del mundo. Por primera vez, el mundo tampoco lo sabe.',
    bg: 'var(--cut-bg-11)'
  },
  endingC: {
    chapter: 'FINAL SECRETO · LA NOTA LIBRE', title: 'El que no estaba escrito',
    text: 'No restauras el Velo ni quiebras la Jarra. Cantas una tercera opción: la nota que la Profecía no pudo prever. El Coro enmudece. La Gema te reconoce no como portador, sino como autor. El mundo sigue cantando... pero ahora también puede improvisar. Y tú, por fin, recuerdas tu nombre.',
    bg: 'var(--cut-bg-12)'
  }
};

export function questFor(id) { return QUESTS[id] || null; }
export function npcFor(id) { return NPCS[id] || null; }
