// ─────────────────────────────────────────────────────────────
// Historia, misiones y voces de La Espada Celestial
// ─────────────────────────────────────────────────────────────
import { LORE } from './data.js';

export const MAIN_ORDER = ['despertar', 'gema', 'ceniza', 'velo'];

export const QUESTS = {
  despertar: {
    id: 'despertar', title: 'El Despertar', type: 'main', level: 1,
    summary: 'Has despertado en Brumavela sin recordar tu nombre. La maestra Iria dice que el Velo te ha llamado.',
    stages: [
      { type: 'talk', target: 'iria', poi: 'plaza', text: 'Habla con la maestra Iria en la plaza de Brumavela' },
      { type: 'kill', target: 'lobo_sombra', count: 3, poi: 'mill', text: 'Despeja los lobos de sombra del Molino de Musgo' },
      { type: 'talk', target: 'iria', poi: 'plaza', text: 'Regresa junto a Iria' }
    ],
    reward: { xp: 110, gold: 60, shards: 25, items: { vial_savia: 2 } }
  },
  gema: {
    id: 'gema', title: 'La Gema Celestial', type: 'main', level: 3,
    summary: 'La Gema Celestial aguarda en las Ruinas de Ael. Algo antiguo la custodia, y algo aún más antiguo la desea.',
    stages: [
      { type: 'reach', poi: 'ruins', radius: 520, text: 'Investiga las Ruinas de Ael' },
      { type: 'boss', target: 'boss_ciervo', poi: 'arena', text: 'Derrota al Ciervo de Ceniza' },
      { type: 'flag', target: 'gema_got', text: 'Toma la Gema Celestial' },
      { type: 'talk', target: 'iria', poi: 'plaza', text: 'Lleva la Gema a Iria' }
    ],
    reward: { xp: 300, gold: 150, shards: 70, items: { espada_bruma: 1 } }
  },
  ceniza: {
    id: 'ceniza', title: 'El Peso de la Brasa', type: 'main', level: 7,
    summary: 'La Puerta de Ceniza conduce a Drakmor. Kael te espera allí, y bajo la forja late la Lágrima de la Primera Brasa.',
    stages: [
      { type: 'region', target: 'drakmor', poi: 'portal', text: 'Atraviesa la Puerta de Ceniza' },
      { type: 'talk', target: 'kael', poi: 'camp', text: 'Encuentra a Kael en la Última Brasa' },
      { type: 'boss', target: 'boss_brasa', poi: 'forge', text: 'Arranca la Lágrima al Señor de la Primera Brasa' },
      { type: 'flag', target: 'lagrima_choice', text: 'Decide qué hacer con la Lágrima' },
      { type: 'region', target: 'kansordore', poi: 'portal', text: 'Abre la Cicatriz del Velo' }
    ],
    reward: { xp: 760, gold: 300, shards: 190, items: { incienso: 2 } }
  },
  velo: {
    id: 'velo', title: 'La Biblioteca del Velo', type: 'main', level: 13,
    summary: 'En Kansordore, todo lo que pudo ser está escrito. La Jarra de Origen guarda tu primer recuerdo, y la Voz del Velo quiere borrarlo.',
    stages: [
      { type: 'talk', target: 'sibil', poi: 'library', text: 'Encuentra a Sibil en la Biblioteca Prohibida' },
      { type: 'interact', target: 'lore_jarra', poi: 'library', text: 'Lee el Códice de la Jarra' },
      { type: 'talk', target: 'sibil', poi: 'library', text: 'Habla con Sibil sobre lo que has leído' },
      { type: 'boss', target: 'kael', poi: 'temple', text: 'Enfréntate a Kael en el Templo de la Ascensión' },
      { type: 'reach', poi: 'rift', radius: 520, text: 'Desciende a la Falla del Velo' },
      { type: 'boss', target: 'boss_voz', poi: 'rift', text: 'Enfréntate a la Voz del Velo' }
    ],
    reward: { xp: 1800, gold: 500, shards: 400 }
  },
  molino: {
    id: 'molino', title: 'El Molino Callado', type: 'side', level: 2,
    summary: 'Ren, guardián de Brumavela, no puede abandonar la aldea. Los lobos de sombra han convertido el molino en su madriguera.',
    stages: [
      { type: 'kill', target: 'lobo_sombra', count: 5, poi: 'mill', text: 'Elimina lobos de sombra cerca del Molino de Musgo' },
      { type: 'talk', target: 'ren', poi: 'plaza', text: 'Regresa junto a Ren' }
    ],
    reward: { xp: 140, gold: 90, shards: 40, items: { tonico_aguante: 2 } }
  },
  nara: {
    id: 'nara', title: 'Lo que los Ecos Recuerdan', type: 'side', level: 3,
    summary: 'Nara cree que los Ecos son memorias con patas. Quiere comprobar si dos criaturas pueden recordarte al mismo tiempo.',
    stages: [
      { type: 'capture', count: 2, poi: 'camp', text: 'Sella un vínculo con 2 criaturas' },
      { type: 'talk', target: 'nara', poi: 'camp', text: 'Muestra tus vínculos a Nara' }
    ],
    reward: { xp: 220, gold: 100, shards: 50, items: { semilla_resonancia: 1, incienso: 1 } }
  },
  fragua: {
    id: 'fragua', title: 'Fuego en la Fragua', type: 'side', level: 4,
    summary: 'Bram necesita tres esquirlas de hierro de las ruinas. La fragua lleva fría desde que la aldea dejó de creer en las espadas.',
    stages: [
      { type: 'gather', target: 'esquirla_hierro', count: 3, text: 'Reúne 3 esquirlas de hierro' },
      { type: 'talk', target: 'bram', poi: 'forge', text: 'Lleva el hierro a Bram' }
    ],
    reward: { xp: 180, gold: 70, shards: 40, items: { espada_bruma: 1 } }
  }
};

// ───────────────────────── utilidades de guion ─────────────────────────
function L(look, speaker, role, text, extra = {}) { return { look, speaker, role, text, ...extra }; }
function script(lines, onEnd) { return { lines, onEnd }; }

const ROLE = {
  iria: 'Maestra de la Orden del Alba',
  kael: 'Heredero de la Orden del Alba',
  nara: 'Erudita de Ecos',
  bram: 'Maestro de la Fragua',
  aldric: 'Mercader de Brumavela',
  ren: 'Guardián de Brumavela',
  milo: 'Aprendiz de la Orden',
  hermit: 'Hortelano de las Viudas',
  eira: 'Sacerdotisa de la Luna',
  ghost_ael: 'Memoria sin nombre',
  sera: 'Cartógrafa de la Brasa',
  orda: 'Forjadora errante',
  king_ghost: 'Rey Aldric IV',
  sibil: 'Guardiana de la Biblioteca',
  keeper: 'Último custodio',
  echo_child: 'Eco del Jardín',
  voice: 'La Voz del Velo'
};

export function playIntro(game) {
  return game.ui.playCinematic([
    { art: 'despertar', chapter: 'PRÓLOGO', title: 'EL DESPERTAR', text: 'Antes de la primera espada hubo una pregunta. Antes del primer rey hubo una respuesta que nadie quiso oír.' },
    { art: 'despertar', chapter: 'PRÓLOGO', text: 'El mundo se sostiene sobre un Velo: la membrana entre lo que fue y lo que pudo haber sido. Cuando el Velo se cansa, llama a alguien que no pertenece a ningún lugar.' },
    { art: 'valdoria', chapter: 'VALDORIA', title: 'BRUMAVELA', text: 'Despertaste en un camino de tierra, con un nombre que no era tuyo en la boca y una espada que no recordabas haber forjado.' },
    { art: 'valdoria', chapter: 'VALDORIA', text: 'La maestra Iria te espera en la plaza. Dice que la Gema Celestial ha vuelto a latir. Dice que eso nunca es buena señal.' }
  ]);
}

// ───────────────────────── diálogos ─────────────────────────
export function npcTalk(game, npc) {
  const id = npc.id;
  if (id === 'iria') return iriaTalk(game);
  if (id === 'kael' || id === 'kael_k') return kaelTalk(game);
  if (id === 'bram') return bramTalk(game);
  if (id === 'aldric') return aldricTalk(game);
  if (id === 'nara') return naraTalk(game);
  if (id === 'ren') return renTalk(game);
  if (id === 'sibil') return sibilTalk(game);
  if (id === 'milo') return script([
    L('milo', 'Milo', ROLE.milo, 'Iria dice que los héroes no nacen: se caen muchas veces y deciden levantarse una más. ¿Tú cuántas veces has caído?'),
    L('milo', 'Milo', ROLE.milo, 'No hace falta que respondas. Solo… no dejes de contar.')
  ]);
  if (id === 'hermit') return script([
    L('hermit', 'Viejo Ordo', ROLE.hermit, 'Las viudas plantaron estos manzanos para recordar a los que no volvieron. Los árboles dan fruta. La memoria, a veces, también.'),
    L('hermit', 'Viejo Ordo', ROLE.hermit, 'Si encuentras una flor que brilla de noche, no la cortes. Ella ya sabe dónde tiene que estar.')
  ]);
  if (id === 'eira') return script([
    L('eira', 'Eira', ROLE.eira, 'La luna no ilumina: recuerda. Por eso los que han perdido algo duermen mejor bajo su luz.'),
    L('eira', 'Eira', ROLE.eira, 'Descansa aquí cuando lo necesites. El santuario no juzga a quien pregunta.')
  ], () => { game.restAtShrine(); });
  if (id === 'ghost_ael') return script([
    L('ghost', 'Eco de Ael', ROLE.ghost_ael, '…¿Otro? El Velo te ha vuelto a enviar. Siempre envía a alguien. Siempre llega tarde.'),
    L('ghost', 'Eco de Ael', ROLE.ghost_ael, 'Busca la Gema. Pero cuando la tengas, pregúntate quién la sostuvo antes que tú.')
  ]);
  if (id === 'sera') return script([
    L('sera', 'Sera', ROLE.sera, 'He dibujado Drakmor siete veces. Cada vez tiene una montaña menos. El fuego no borra: corrige.'),
    L('sera', 'Sera', ROLE.sera, 'Si vas a la Forja, llévate agua. Y no bebas del río. No es agua.')
  ]);
  if (id === 'orda') return script([
    L('orda', 'Orda', ROLE.orda, 'El acero recuerda la mano que lo forjó. Por eso algunas espadas traicionan. Las mías solo muerden a quien lo merece.'),
    L('orda', 'Orda', ROLE.orda, 'Trae ceniza viva y te haré algo que no te avergüence.')
  ], () => { game.ui.openShop('drakmor', 'Forja errante de Orda'); });
  if (id === 'king_ghost') return script([
    L('king', 'Rey Aldric IV', ROLE.king_ghost, 'Me llamaron rey cuando aún tenía un reino. Ahora soy una corona sobre una silla vacía.'),
    L('king', 'Rey Aldric IV', ROLE.king_ghost, 'La primera brasa no se apaga, forastero. Solo aprende a esperar. Yo también espero. No sé a qué.')
  ]);
  if (id === 'keeper') return script([
    L('keeper', 'Custodio Vael', ROLE.keeper, 'Este templo no fue construido para dioses. Fue construido para la última persona que se atrevió a elegir.'),
    L('keeper', 'Custodio Vael', ROLE.keeper, 'La Ascensión no es un premio. Es una renuncia. Recuérdalo cuando el Velo te pregunte.')
  ]);
  if (id === 'echo_child') return script([
    L('child', 'Niña de los Nombres', ROLE.echo_child, 'Aquí está tu nombre. No el que te dieron. El que elegiste cuando nadie miraba.'),
    L('child', 'Niña de los Nombres', ROLE.echo_child, 'Está un poco roto. Pero cabe en el bolsillo.')
  ]);
  return script([L('hero', npc.name, npc.role, 'El viento se lleva tus palabras antes de que lleguen.')]);
}

function iriaTalk(game) {
  const q = game.quests;
  const d = q.despertar, g = q.gema;
  if (d && !d.done && d.stage === 0) {
    return script([
      L('iria', 'Iria', ROLE.iria, 'Has despertado. Bien. Temía que el Velo te hubiera dejado en el camino como una piedra más.'),
      L('iria', 'Iria', ROLE.iria, 'No recuerdas tu nombre. Es normal. Los nombres son lo primero que el Velo olvida… y lo último que devuelve.'),
      L('iria', 'Iria', ROLE.iria, 'Los lobos de sombra han ocupado el Molino de Musgo. Tres, quizá más. Si la aldea pierde el molino, pierde el invierno.'),
      L('iria', 'Iria', ROLE.iria, 'Ve. Aprende cómo responde tu espada. Cuando vuelvas, hablaremos de la Gema.', { choices: [
        { text: '¿Qué es la Gema Celestial?', action: () => {}, then: [
          L('iria', 'Iria', ROLE.iria, 'El corazón de una espada que se rompió antes de que existieran los reinos. O eso dice la Order. La verdad suele ser más pequeña y más cara.'),
          L('iria', 'Iria', ROLE.iria, 'Ve al molino. Las preguntas grandes esperan mejor con las manos ocupadas.')
        ] },
        { text: 'No recuerdo nada. Ni siquiera mi nombre.', action: () => {}, then: [
          L('iria', 'Iria', ROLE.iria, 'Entonces tienes algo en común con el mundo. Ninguno de los dos recuerda cómo empezó.'),
          L('iria', 'Iria', ROLE.iria, 'Camina. El suelo recuerda por ti.')
        ] },
        { text: 'Voy al molino.', action: () => {} }
      ] })
    ], () => game.questEvent('talk', 'iria'));
  }
  if (d && !d.done && d.stage === 1) {
    return script([
      L('iria', 'Iria', ROLE.iria, 'El molino sigue en pie. Eso ya es más de lo que esperaba de ti.'),
      L('iria', 'Iria', ROLE.iria, 'Las aspas giran sin viento. Escucha: el Velo está cerca.')
    ]);
  }
  if (d && !d.done && d.stage === 2) {
    return script([
      L('iria', 'Iria', ROLE.iria, 'Bien. La aldea respirará una noche más.'),
      L('iria', 'Iria', ROLE.iria, 'Ahora escucha. La Gema Celestial no está perdida: está escondida en las Ruinas de Ael, al norte. Un guardián la custodia desde antes de que los hombres aprendieran a escribir.'),
      L('iria', 'Iria', ROLE.iria, 'No es un animal. Es una memoria con astas. Si te habla, no respondas con la espada. Responde con la verdad.'),
      L('iria', 'Iria', ROLE.iria, 'Y si la verdad no basta… sobrevive.')
    ], () => game.questEvent('talk', 'iria'));
  }
  if (g && !g.done && g.stage === 3) {
    return script([
      L('iria', 'Iria', ROLE.iria, 'La Gema. La sostienes como si pesara. Y pesa, ¿verdad?'),
      L('iria', 'Iria', ROLE.iria, 'Hay algo que la Orden no escribe en sus muros: tú no naciste. Despertaste. Eres un Eco, una memoria que el Velo devolvió para que el mundo no se olvidara de sí mismo.'),
      L('iria', 'Iria', ROLE.iria, 'La Profecía de Jugador Cero habla de alguien así. Alguien que no pertenece a ningún lugar. Alguien que tendrá que elegir.'),
      L('iria', 'Iria', ROLE.iria, 'La Puerta de Ceniza se abrirá con la Gema. Al otro lado está Drakmor. Y Kael. Cuida de él. Aunque él no sepa cuidar de ti.'),
      L('iria', 'Iria', ROLE.iria, 'Ve. Y recuerda: no eres lo que el Velo hizo de ti. Eres lo que hagas a continuación.', { choices: [
        { text: '¿Kael sabe que soy un Eco?', action: () => {}, then: [
          L('iria', 'Iria', ROLE.iria, 'Kael sabe lo que necesita saber para no romperse. No le quites esa mentira todavía.')
        ] },
        { text: '¿Qué elegiré?', action: () => {}, then: [
          L('iria', 'Iria', ROLE.iria, 'No lo sé. Y me alegra. Si lo supiera, no serías tú quien eligiera.')
        ] },
        { text: 'Lo haré.', action: () => {} }
      ] })
    ], () => game.questEvent('talk', 'iria'));
  }
  if (game.flags.drakmor_open && !game.flags.kansordore_open) {
    return script([
      L('iria', 'Iria', ROLE.iria, 'La Puerta de Ceniza arde al norte de las ruinas. Kael ya debería estar allí.'),
      L('iria', 'Iria', ROLE.iria, 'No dejes que el fuego te haga creer que todo lo que arde quiere destruirte.')
    ]);
  }
  return script([
    L('iria', 'Iria', ROLE.iria, 'El Velo se mueve. Lo noto en las raíces.'),
    L('iria', 'Iria', ROLE.iria, 'Cuando llegues al final, no busques la respuesta correcta. Busca la tuya.')
  ]);
}

function kaelTalk(game) {
  const q = game.quests.ceniza;
  if (q && !q.done && q.stage === 1) {
    return script([
      L('kael', 'Kael', ROLE.kael, 'Así que el Velo también te ha despertado a ti. No sé si alegrarme o pedirle explicaciones.'),
      L('kael', 'Kael', ROLE.kael, 'La Gema te eligió. A mí me eligió la Orden. Supongo que eso nos hace primos de desgracia.'),
      L('kael', 'Kael', ROLE.kael, 'La Lágrima de la Primera Brasa está en la Forja del Corazón, al noreste. El Señor de la Brasa la guarda desde que su reino se convirtió en carbón.'),
      L('kael', 'Kael', ROLE.kael, 'Si vas, voy contigo. No porque confíe en ti. Porque no pienso dejar que la profecía se cumpla sin mí delante.', { choices: [
        { text: '¿Qué dice la profecía sobre ti?', action: () => {}, then: [
          L('kael', 'Kael', ROLE.kael, 'Que un heredero abrirá la puerta. La Orden decidió que ese heredero era yo. Llevo toda la vida ensayando una puerta que no encuentro.'),
          L('kael', 'Kael', ROLE.kael, 'Y ahora apareces tú, sin apellido, sin historia, y la puerta se abre sola. Perdona si no aplaudo.')
        ] },
        { text: 'La Orden te ha mentido.', action: () => {}, then: [
          L('kael', 'Kael', ROLE.kael, 'La Orden me enseñó a leer, a luchar y a callar. Eso no es mentir. Eso es educación.'),
          L('kael', 'Kael', ROLE.kael, 'Pero si tienes pruebas de lo contrario, escucharé. Una vez.')
        ] },
        { text: 'Vamos a la Forja.', action: () => {} }
      ] })
    ], () => game.questEvent('talk', 'kael'));
  }
  if (game.flags.kansordore_open) {
    return script([
      L('kael', 'Kael', ROLE.kael, 'Kansordore. El archivo de todo lo que pudo ser. Apuesto a que aquí hay una versión de mí que no es un fracaso.'),
      L('kael', 'Kael', ROLE.kael, 'Si la encuentras, no me la presentes. Prefiero aprender a ser este.')
    ]);
  }
  return script([
    L('kael', 'Kael', ROLE.kael, 'La Forja sigue al noreste. El fuego no espera a los indecisos.')
  ]);
}

function bramTalk(game) {
  const q = game.quests.fragua;
  const lines = [];
  if (q && !q.done && !q.started) {
    lines.push(
      L('bram', 'Bram', ROLE.bram, '¿Vienes a comprar o a que te arregle esa hoja? Porque tiene más muescas que mi paciencia.'),
      L('bram', 'Bram', ROLE.bram, 'Necesito tres esquirlas de hierro de las ruinas. La fragua lleva fría desde que la aldea dejó de creer en las espadas. Yo no.'),
      L('bram', 'Bram', ROLE.bram, 'Tráelas y te haré algo que no te avergüence. Y si quieres comprar, habla con mi martillo. Él lleva las cuentas.')
    );
  } else if (q && !q.done && q.started && q.stage === 0) {
    lines.push(
      L('bram', 'Bram', ROLE.bram, 'Tres esquirlas. Ni dos ni cuatro. El hierro de las ruinas tiene memoria; mezclar medidas es mezclar siglos.'),
      L('bram', 'Bram', ROLE.bram, 'Las encontrarás en las Ruinas de Ael, en los bordes de los caminos viejos.')
    );
  } else if (q && !q.done && q.stage === 1) {
    lines.push(
      L('bram', 'Bram', ROLE.bram, 'Déjame ver… Sí. Esto sirve. Esto tiene algo que decir.'),
      L('bram', 'Bram', ROLE.bram, 'Toma. No es la Espada Celestial, pero tampoco pretende serlo. Es una espada honesta. Como tú, espero.')
    );
  } else {
    lines.push(
      L('bram', 'Bram', ROLE.bram, 'La fragua está caliente. El mundo, no tanto.'),
      L('bram', 'Bram', ROLE.bram, 'Si traes esquirlas, las convierto en algo. Si traes excusas, las convierto en humo.')
    );
  }
  return script(lines, () => {
    if (q && !q.done && !q.started) { game.startQuest('fragua'); }
    else if (q && !q.done && q.stage === 1) { game.questEvent('talk', 'bram'); }
    game.ui.openShop('forge', 'Fragua de Bram');
  });
}

function aldricTalk(game) {
  return script([
    L('aldric', 'Aldric', ROLE.aldric, 'Vial de savia, esencia azul, tónicos y pan duro. Todo lo que un héroe necesita para morir más despacio.'),
    L('aldric', 'Aldric', ROLE.aldric, 'No pregunto de dónde vienes. Tú no preguntas de dónde viene el pan. Así funciona la civilización.')
  ], () => game.ui.openShop('alchemy', 'Bazar de Aldric'));
}

function naraTalk(game) {
  const q = game.quests.nara;
  if (q && !q.done && !q.started) {
    return script([
      L('nara', 'Nara', ROLE.nara, '¡Un Eco! Y además uno que habla. No, espera, todos hablan. Pero tú hablas como si supieras que estás hecho de recuerdos.'),
      L('nara', 'Nara', ROLE.nara, 'Los Ecos no son mascotas. Son memorias que decidieron tener dientes, alas o raíces. Cuando confían en alguien, comparten una parte de lo que recuerdan.'),
      L('nara', 'Nara', ROLE.nara, 'Debilita a una criatura sin matarla y resuena con ella. Si dos Ecos te recuerdan, sabremos que el Vínculo es real. ¿Me ayudas?', { choices: [
        { text: 'Vincularé dos criaturas.', action: () => {} },
        { text: '¿Qué pasa si fallo?', action: () => {}, then: [
          L('nara', 'Nara', ROLE.nara, 'La criatura se asusta y se enfada. Nada irreparable. Los Ecos perdonan más rápido que las personas.'),
          L('nara', 'Nara', ROLE.nara, 'Pero no los mates. Una memoria muerta no vuelve a confiar.')
        ] }
      ] })
    ], () => game.startQuest('nara'));
  }
  if (q && !q.done && q.started && q.stage === 0) {
    return script([
      L('nara', 'Nara', ROLE.nara, 'Debilita a un Eco y pulsa Resonar cuando su luz se vuelva dorada. No lo mates. La confianza no se arranca.'),
      L('nara', 'Nara', ROLE.nara, 'Si usas incienso, la zona perfecta se amplía. Es trampa, sí. Pero una trampa amable.')
    ]);
  }
  if (q && !q.done && q.stage === 1) {
    return script([
      L('nara', 'Nara', ROLE.nara, '¡Dos! Puedo olerlos desde aquí. Huelen a camino y a decisión.'),
      L('nara', 'Nara', ROLE.nara, 'Toma esta semilla. No te dará poder. Te dará la certeza de que alguien te recuerda. A veces es lo mismo.'),
      L('nara', 'Nara', ROLE.nara, 'Y si ves un zorro con constelaciones en el lomo… dile que Nara sigue esperando.')
    ], () => game.questEvent('talk', 'nara'));
  }
  return script([
    L('nara', 'Nara', ROLE.nara, 'Los Ecos que llevas no te pertenecen. Te acompañan. Es distinto.'),
    L('nara', 'Nara', ROLE.nara, 'Cuídalos y ellos recordarán por ti cuando tú ya no puedas.')
  ]);
}

function renTalk(game) {
  const q = game.quests.molino;
  if (q && !q.done && !q.started) {
    return script([
      L('ren', 'Ren', ROLE.ren, 'No puedo salir de la aldea. Si salgo, la gente empieza a preguntarse si volveré. Y entonces dejan de trabajar.'),
      L('ren', 'Ren', ROLE.ren, 'Los lobos de sombra han ocupado el molino. Cinco, quizá más. ¿Podrías…?'),
      L('ren', 'Ren', ROLE.ren, 'No te pido que seas un héroe. Te pido que sean cinco lobos menos.')
    ], () => game.startQuest('molino'));
  }
  if (q && !q.done && q.started && q.stage === 1) {
    return script([
      L('ren', 'Ren', ROLE.ren, 'La aldea ha dormido sin aullidos. No sabía cuánto echaba de menos el silencio.'),
      L('ren', 'Ren', ROLE.ren, 'Toma. No es mucho, pero es nuestro. Y lo nuestro pesa más.')
    ], () => game.questEvent('talk', 'ren'));
  }
  if (q && !q.done && q.started) {
    return script([L('ren', 'Ren', ROLE.ren, 'El molino sigue lleno de sombras. Escucho aullidos cuando el viento cambia.')]);
  }
  return script([
    L('ren', 'Ren', ROLE.ren, 'La guardia no es una espada. Es la gente que decide volver a casa.'),
    L('ren', 'Ren', ROLE.ren, 'Tú también vuelve, ¿eh?')
  ]);
}

function sibilTalk(game) {
  const q = game.quests.velo;
  if (q && !q.done && q.stage === 0) {
    return script([
      L('sibil', 'Sibil', ROLE.sibil, 'La profecía decía que vendrías. La profecía también decía que yo estaría muerta. Como ves, las profecías tienen sentido del humor.'),
      L('sibil', 'Sibil', ROLE.sibil, 'Has traído la Gema y la Lágrima. Falta la Jarra de Origen. No está en un pedestal: está en un códice.'),
      L('sibil', 'Sibil', ROLE.sibil, 'Lee la inscripción del centro de la biblioteca. Pero te advierto: la Jarra no guarda agua. Guarda tu primer recuerdo.'),
      L('sibil', 'Sibil', ROLE.sibil, 'Y los primeros recuerdos rara vez son amables.')
    ], () => game.questEvent('talk', 'sibil'));
  }
  if (q && !q.done && q.stage === 1) {
    return script([L('sibil', 'Sibil', ROLE.sibil, 'El códice está en el centro de la sala. Lee en voz baja. Las palabras antiguas despiertan si las gritas.')]);
  }
  if (q && !q.done && q.stage === 2) {
    return script([
      L('sibil', 'Sibil', ROLE.sibil, 'Así que ya lo sabes. No eres el primer Jugador Cero. Eres el último eco de una cadena de personas que el Velo llamó para que eligieran.'),
      L('sibil', 'Sibil', ROLE.sibil, 'La Voz del Velo fue una de ellas. Eligió romperlo. Ahora el Velo la usa como cicatriz.'),
      L('sibil', 'Sibil', ROLE.sibil, 'Kael ha venido contigo. La Orden le dijo que el heredero debía probarse antes de la Ascensión. Te espera en el Templo.'),
      L('sibil', 'Sibil', ROLE.sibil, 'No puedo decirte quién tiene razón. Solo puedo decirte que ninguna elección es gratis.'),
      L('sibil', 'Sibil', ROLE.sibil, 'Ve. Y cuando llegues a la Falla, recuerda que el Velo no te pregunta qué quieres. Te pregunta qué estás dispuesto a perder.')
    ], () => game.questEvent('talk', 'sibil'));
  }
  return script([
    L('sibil', 'Sibil', ROLE.sibil, 'La biblioteca seguirá aquí cuando todo esto termine. Es su única virtud: no tiene prisa.'),
    L('sibil', 'Sibil', ROLE.sibil, 'Las respuestas están en los márgenes. Siempre lo están.')
  ]);
}

// ───────────────────────── misiones completadas ─────────────────────────
export function onQuestComplete(game, questId) {
  const q = QUESTS[questId];
  if (!q) return;
  if (questId === 'despertar') {
    game.startQuest('gema');
    game.ui.toast('Nueva misión: La Gema Celestial', 'gold');
    game.journalUnlock('valdoria');
    game.journalUnlock('gema');
  } else if (questId === 'gema') {
    game.flags.drakmor_open = true;
    game.startQuest('ceniza');
    game.ui.toast('La Puerta de Ceniza se ha abierto', 'gold');
    game.journalUnlock('profecia');
    game.autoSave();
  } else if (questId === 'ceniza') {
    game.flags.kansordore_open = true;
    game.startQuest('velo');
    game.ui.toast('La Cicatriz del Velo se ha abierto', 'gold');
    game.journalUnlock('jarra');
    game.autoSave();
  } else if (questId === 'velo') {
    // La elección final la lanza la derrota de la Voz.
    game.autoSave();
  } else if (questId === 'nara') {
    game.journalUnlock('resonancia');
    game.journalUnlock('ecos');
  } else if (questId === 'fragua') {
    game.journalUnlock('gema');
  }
}

// ───────────────────────── jefes ─────────────────────────
export function onBossDefeated(game, enemy) {
  const type = enemy.data.id;
  if (type === 'boss_ciervo') {
    game.setFlag('gema_got');
    game.addInventory('gema_celestial', 1);
    game.addInventory('esquirra_falsa', 0);
    game.journalUnlock('gema');
    game.journalUnlock('profecia');
    game.ui.playCinematic([
      { art: 'corazon', chapter: 'RUINAS DE AEL', title: 'LA GEMA CELESTIAL', text: 'El Ciervo de Ceniza se deshace en astillas de luz. Donde latía su pecho queda una gema del tamaño de una promesa.' },
      { art: 'corazon', chapter: 'RUINAS DE AEL', text: 'Al tocarla, no recuerdas nada. Pero algo, en algún lugar bajo tu piel, te recuerda a ti.' }
    ]).then(() => {
      game.questEvent('boss', 'boss_ciervo');
      game.questEvent('flag', 'gema_got');
      game.autoSave();
    });
  } else if (type === 'boss_brasa') {
    game.setFlag('lagrima_got');
    game.addInventory('lagrima_brasa', 1);
    game.addInventory('filo_ceniza', 1);
    game.addInventory('placas_ceniza', 1);
    game.addInventory('ceniza_viva', 2);
    game.journalUnlock('lagrima');
    game.ui.playCinematic([
      { art: 'drakmor', chapter: 'FORJA DEL CORAZÓN', title: 'LA LÁGRIMA DE LA PRIMERA BRASA', text: 'El rey caído se arrodilla por última vez. En su mano no hay fuego: hay una gota de luz que llora sin consumirse.' },
      { art: 'drakmor', chapter: 'FORJA DEL CORAZÓN', text: 'Kael entra en la forja. Mira la Lágrima. Mira tu mano. No dice nada durante mucho tiempo.' }
    ]).then(() => {
      game.questEvent('boss', 'boss_brasa');
      const agree = game.flags.kael_trust;
      game.ui.dialog({
        lines: [
          L('kael', 'Kael', ROLE.kael, 'La Orden me envió a recogerla. No a pedirla. Supongo que eso debería facilitarme las cosas.'),
          L('kael', 'Kael', ROLE.kael, 'Pero la he visto latir cuando la sostienes. No es una reliquia. Es una decisión. Y las decisiones no se obedecen.'),
          L('kael', 'Kael', ROLE.kael, 'Dame la Lágrima. La llevaré a Kansordore y terminaré lo que la Orden empezó. O quédate con ella, y decide tú qué significa ser el Jugador Cero.', { choices: [
            { text: 'Compartir la Lágrima con Kael.', action: () => game.setFlag('kael_trust', true) },
            { text: 'Conservar la Lágrima. Es mi elección.', action: () => game.setFlag('kael_trust', false) }
          ] })
        ],
        onEnd: () => {
          game.setFlag('lagrima_choice', true);
          game.setFlag('kansordore_open', true);
          game.questEvent('flag', 'lagrima_choice');
          game.autoSave();
          game.ui.toast('Kael te espera en Kansordore', 'gold');
        }
      });
    });
  } else if (type === 'kael') {
    game.setFlag('kael_resolved', true);
    game.setFlag('kael_spared', game.flags.kael_trust);
    game.journalUnlock('convergencia');
    const lines = game.flags.kael_trust ? [
      L('kael', 'Kael', ROLE.kael, '…Me has vencido. Otra vez. Empiezo a pensar que la Orden se equivocó de heredero y de profecía.'),
      L('kael', 'Kael', ROLE.kael, 'La Voz está en la Falla. Si vas, voy contigo. No para luchar. Para que alguien recuerde tu nombre si el Velo lo borra.'),
      L('hero', game.player.name, 'Jugador Cero', 'Kael…')
    ] : [
      L('kael', 'Kael', ROLE.kael, 'No… puedo… seguirte. Tú… ya no necesitas… que nadie te diga… quién eres.'),
      L('kael', 'Kael', ROLE.kael, 'La Falla… está abierta. No dejes… que la Voz… elija por ti.'),
      L('hero', game.player.name, 'Jugador Cero', 'Kael, espera…')
    ];
    game.ui.playCinematic([
      { art: 'corazon', chapter: 'TEMPLO DE LA ASCENSIÓN', title: game.flags.kael_trust ? 'DOS HEREDEROS' : 'EL PESO DE UNA CORONA', text: game.flags.kael_trust ? 'Kael baja la espada. Por primera vez, la profecía no le dice qué hacer.' : 'Kael cae. La luz del templo no distingue entre vencedor y hermano.' }
    ]).then(() => {
      game.ui.dialog({ lines, onEnd: () => {
        game.questEvent('boss', 'kael');
        game.autoSave();
      } });
    });
  } else if (type === 'boss_voz') {
    game.journalUnlock('velo');
    game.journalUnlock('ascension');
    game.journalUnlock('convergencia');
    game.ui.playCinematic([
      { art: 'final', chapter: 'FALLA DEL VELO', title: 'JUGADOR CERO', text: 'La Voz se rompe como un espejo que llevaba demasiado tiempo reflejando a la misma persona. Debajo no hay monstruo. Hay un trono vacío y una pregunta.' },
      { art: 'final', chapter: 'FALLA DEL VELO', text: 'La Gema, la Lágrima y la Jarra laten al unísono. El Velo espera. Tú eres lo único que queda por decidir.' }
    ]).then(() => {
      game.questEvent('boss', 'boss_voz');
      finalChoice(game);
    });
  }
}

function finalChoice(game) {
  game.ui.chooseEnding().then(choice => {
    if (!choice) return;
    game.finishEnding(choice);
  });
}

// ───────────────────────── disparadores ─────────────────────────
export function specialUpdate(game) {
  // Kael espera en el Templo antes del duelo.
  if (game.regionId === 'kansordore' && !game.flags.kael_duel_started && !game.flags.kael_resolved) {
    const q = game.quests.velo;
    if (q && !q.done && q.stage === 3) {
      const k = game.world.npcs.find(n => n.id === 'kael_k');
      if (k) {
        k.hidden = false;
        k.marker = true;
        const p = game.world.def.pois.find(p => p.id === 'temple');
        if (p) {
          k.x = p.x * 64 + 32 + 90;
          k.y = p.y * 64 + 32 + 30;
        }
      }
    }
  }
  // Aparición de la Voz al llegar a la Falla.
  if (game.regionId === 'kansordore' && game.quests.velo && game.quests.velo.stage === 5 && !game.flags.voz_started) {
    const a = game.world.bossArena;
    if (a && Math.hypot(game.player.x - a.x, game.player.y - a.y) < a.r * .8) {
      game.setFlag('voz_started', true);
      game.spawnBoss('boss_voz', a.x, a.y);
    }
  }
}

// ───────────────────────── finales ─────────────────────────
export const ENDINGS = {
  ascension: {
    title: 'La Ascensión',
    eyebrow: 'EL FINAL DEL RELATO · ASCENSIÓN',
    text: `Clavas la Espada en el Velo y le pides que recuerde su forma.

La Gema se abre. La Lágrima hierve. La Jarra se vacía de ti.

El mundo no te olvida de golpe: te olvida despacio, como se olvida una canción que nadie volvió a cantar. Brumavela sigue teniendo un molino. Kael sigue teniendo una espada. Nara sigue esperando a un zorro que nunca llega.

El Velo se cierra. La Ruptura se detiene. Durante un instante, todos los que quisiste son felices sin saber por qué.

Tú ya no estás para verlo. Pero el mundo, por fin, puede seguir sin ti.

Eso también es una forma de quedarse.`
  },
  convergencia: {
    title: 'La Convergencia',
    eyebrow: 'EL FINAL DEL RELATO · CONVERGENCIA',
    text: `No eliges un mundo. Los eliges todos.

La Gema, la Lágrima y la Jarra se funden, y el Velo deja de ser una pared para convertirse en una puerta. Los mundos que pudieron ser se derraman unos sobre otros: la Brumavela que ardió, la que nunca existió, la que aún te espera.

No todo encaja. Hay casas que recuerdan dos infancias. Hay ríos que corren en dos direcciones. Kael tropieza con una versión de sí mismo que lleva corona, y ninguno de los dos sabe qué decir.

Tú sigues aquí. Ese es el precio y el regalo: ser el puente.

El Velo ya no te llama Jugador Cero. Te llama por tu nombre. Y esta vez, lo recuerdas.`
  },
  ruptura: {
    title: 'La Ruptura',
    eyebrow: 'EL FINAL DEL RELATO · RUPTURA',
    text: `Rompes el Velo.

No con rabia. Con la ternura terrible de quien apaga una vela para que deje de consumirse.

La magia se va primero. Luego los Ecos. Luego los nombres que las piedras repetían sin saber por qué. El mundo se vuelve pequeño, sólido, mortal. Un lugar donde las espadas cortan y las heridas no brillan.

Kael sobrevive. Nara sobrevive. Brumavela aprende a moler trigo sin que las aspas canten.

Tú eres el último Eco. Caminas entre personas que ya no recuerdan haber sido algo más. A veces, al atardecer, alguien levanta la vista como si oyera una canción.

No la oyen. Pero tú sí.

Y eso tendrá que bastar.`
  }
};
