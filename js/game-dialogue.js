// Diálogos de los habitantes de Aurelia y resolución de sus elecciones.
// Cada página puede ofrecer decisiones; las acciones se ejecutan en el estado real del juego.

const P = (text, choices) => ({ text, choices });

function base(npc) {
  return {
    npcId: npc.id,
    name: npc.name,
    title: npc.title,
    color: npc.color,
    accent: npc.accent,
    hair: npc.hair,
    hairStyle: npc.id === 'lia' ? 2 : npc.id === 'elian' ? 1 : 0,
    skin: npc.skin,
  };
}

export function buildNpcDialogue(game, npc) {
  const d = base(npc);
  switch (npc.id) {
    case 'mira': return { ...d, pages: miraPages(game) };
    case 'brann': return { ...d, pages: brannPages(game) };
    case 'lia': return { ...d, pages: liaPages(game) };
    case 'rook': return { ...d, pages: rookPages(game) };
    case 'elian': return { ...d, pages: elianPages(game) };
    case 'sela': return { ...d, pages: selaPages(game) };
    case 'guard': return { ...d, pages: rovanPages(game) };
    default: return { ...d, pages: [P('Que la luz te acompañe, viajero.', [{ text: 'Adiós.', action: 'close' }])] };
  }
}

function miraPages(game) {
  const stage = game.state.quests.main.stage || 0;
  if (stage === 0) {
    return [
      P('Has llegado en el momento exacto. La Espada Celestial, la hoja que partió la noche hace mil años, se ha apagado. Sin ella, Aurelia no volverá a ver un amanecer completo.', [
        { text: 'Acepto el juramento.', action: 'mira_accept', next: 1 },
        { text: 'Necesito prepararme.', action: 'close', next: 2 },
      ]),
      P('Entonces escucha. Cruza la puerta norte y busca el Altar del Alba en el Bosque de Lumen. Allí duerme el primer fragmento. Lleva pociones: el bosque no perdona a los distraídos.', [
        { text: 'Iré ahora mismo.', action: 'close' },
      ]),
      P('La luz sabrá esperarte. Habla con Brann si necesitas acero, y con Sela si necesitas provisiones. Yo estaré aquí.', [
        { text: 'Gracias, Mira.', action: 'close' },
      ]),
    ];
  }
  if (stage === 1) {
    return [
      P('El Altar del Alba está al norte del Bosque de Lumen, más allá del arroyo. Sigue las luciérnagas; ellas recuerdan el camino mejor que los mapas.', [
        { text: '¿Qué encontraré allí?', next: 1 },
        { text: 'Entendido.', action: 'close' },
      ]),
      P('Un fragmento de la espada, cálido como el primer rayo. Tómalo y la hoja reconocerá tu juramento. Después, las Ruinas de Aether te llamarán.', [
        { text: 'Volveré con el fragmento.', action: 'close' },
      ]),
    ];
  }
  if (stage === 2) {
    return [
      P('Siento el primer fragmento en tu mochila. Ahora debes despertar las tres runas de Aether: primero el Sol, después la Luna, al final la Estrella. Ese es el orden que sostiene el cielo.', [
        { text: '¿Y si me equivoco?', next: 1 },
        { text: 'Lo recordaré.', action: 'close' },
      ]),
      P('La piedra de lore del patio central repite la secuencia. Si inviertes el orden, despertarás al Guardián antes de tiempo. Y él ya no distingue entre amigos y ladrones.', [
        { text: 'No fallaré.', action: 'close' },
      ]),
    ];
  }
  if (stage === 3) {
    return [
      P('El Guardián ha caído. El portal del Santuario Celestial está abierto al norte de las ruinas. Kael te espera en el trono que nunca quiso abandonar.', [
        { text: '¿Quién fue Kael?', next: 1 },
        { text: 'Voy a terminar esto.', action: 'close' },
      ]),
      P('El primer Caballero Celestial. Juró proteger el amanecer y terminó vendiéndolo para que la noche no lo olvidara. No lo odies: la compasión también es una espada.', [
        { text: 'Lo entenderé cuando lo vea.', action: 'close' },
      ]),
    ];
  }
  return [
    P('La espada vuelve a brillar. Aurelia amanece otra vez, y tú sigues aquí para verlo. No hay juramento más grande que ese.', [
      { text: 'Gracias por guiarme.', action: 'close' },
    ]),
  ];
}

function brannPages(game) {
  const q = game.state.quests.iron;
  const iron = game.countItem('hierro');
  const shop = { text: 'Abrir la forja.', action: 'shop_brann' };
  if (!q || q.status === 'inactive' || q.stage === 0) {
    return [
      P('El yunque está frío y la lumbre no prende. Necesito piedra de hierro de las Ruinas de Aether para repararlo. Tres piedras bastarán. ¿Me ayudarás?', [
        shop,
        { text: '¿Qué hay en las ruinas?', next: 1 },
        { text: 'Ahora no.', action: 'close' },
      ]),
      P('Escarabajos pétreos. Su caparazón guarda hierro puro. Son lentos, pero embisten como un derrumbe. Golpéalos por la espalda y no de frente.', [
        { text: 'Acepto el encargo.', action: 'accept_iron', next: 2 },
        { text: 'Lo pensaré.', action: 'close' },
      ]),
      P('Tráeme tres piedras y tu armadura saldrá reforzada. El acero recuerda cada golpe, muchacho. Yo también.', [
        { text: 'Voy en camino.', action: 'close' },
      ]),
    ];
  }
  if (q.stage === 1 || q.stage === 2) {
    const enough = iron >= 3;
    return [
      P(`El yunque espera. Tienes ${Math.min(iron, 99)} piedra${iron === 1 ? '' : 's'} de hierro. Necesito tres.`, [
        shop,
        enough ? { text: 'Entregar 3 piedras de hierro.', action: 'turnin_iron', next: 1 } : { text: 'Aún estoy buscando.', action: 'close' },
        { text: 'Adiós.', action: 'close' },
      ]),
      P('¡Esto es hierro de verdad! Con esto el yunque cantará otra vez. Toma estas Placas del Alba: las forjé para alguien que no volvió. Ahora son tuyas.', [
        { text: 'Las llevaré con honor.', action: 'close' },
      ]),
    ];
  }
  return [
    P('La forja vuelve a humear gracias a ti. Si quieres reforzar tu arma, abre la forja. El oro y el hierro hacen el resto.', [
      shop,
      { text: 'Solo pasaba a saludar.', action: 'close' },
    ]),
  ];
}

function liaPages(game) {
  const q = game.state.quests.fireflies;
  const flies = game.countItem('luciernaga');
  if (!q || q.status === 'inactive' || q.stage === 0) {
    return [
      P('¡Shhh! Mis luciérnagas se escaparon cuando el cielo se puso raro. Se fueron al Bosque de Lumen. ¿Puedes traer tres? Brillan verde, como pequeñas estrellas traviesas.', [
        { text: 'Claro, pequeña.', action: 'accept_fireflies', next: 1 },
        { text: 'Ahora no puedo.', action: 'close' },
      ]),
      P('¡Gracias! Ten cuidado con los lobos de ceniza. Huelen a tormenta y muerden muy fuerte. Si ves una luz verde entre los árboles, ¡esa es mía!', [
        { text: 'Volveré con ellas.', action: 'close' },
      ]),
    ];
  }
  if (q.stage === 1 || q.stage === 2) {
    const enough = flies >= 3;
    return [
      P(`¿Las encontraste? Llevas ${Math.min(flies, 99)} luciérnaga${flies === 1 ? '' : 's'}. Necesito tres para que el pozo vuelva a brillar.`, [
        enough ? { text: 'Aquí tienes tres luciérnagas.', action: 'turnin_fireflies', next: 1 } : { text: 'Sigo buscando.', action: 'close' },
        { text: '¿Dónde las viste?', next: 2 },
      ]),
      P('¡Han vuelto! Mira cómo bailan. Toma este amuleto: brilla cuando estás cerca de algo escondido. Mi abuela decía que trae suerte.', [
        { text: 'Gracias, Lía.', action: 'close' },
      ]),
      P('Una estaba junto al arroyo, otra cerca del altar y otra al este, donde el bosque se pone oscuro. ¡Pero no vayas solo!', [
        { text: 'Iré con cuidado.', action: 'close' },
      ]),
    ];
  }
  return [
    P('Las luciérnagas ya no se escapan. El pozo brilla por la noche y mi madre dice que es culpa mía. ¡Pero es bonito!', [
      { text: 'Muy bonito.', action: 'close' },
    ]),
  ];
}

function rookPages(game) {
  const q = game.state.quests.fangs;
  const fangs = game.countItem('colmillo');
  if (!q || q.status === 'inactive' || q.stage === 0) {
    return [
      P('La manada de ceniza se está acercando al campamento. Necesito cinco colmillos para rastrear a su alfa. ¿Te atreves? Los lobos no muerden dos veces: la primera ya es suficiente.', [
        { text: 'Acepto la cacería.', action: 'accept_fangs', next: 1 },
        { text: 'Buscaré otra cosa.', action: 'close' },
      ]),
      P('Bien. Los lobos merodean al este y al norte. Espera su embestida, esquiva y golpea el flanco. Y no te fíes del fuego de su pelaje.', [
        { text: 'Nos vemos, Rook.', action: 'close' },
      ]),
    ];
  }
  if (q.stage === 1 || q.stage === 2) {
    const enough = fangs >= 5;
    return [
      P(`Tienes ${Math.min(fangs, 99)} colmillo${fangs === 1 ? '' : 's'}. Necesito cinco para el rastro. La manada no esperará eternamente.`, [
        enough ? { text: 'Entregar 5 colmillos.', action: 'turnin_fangs', next: 1 } : { text: 'Aún no son suficientes.', action: 'close' },
        { text: '¿Qué harás con ellos?', next: 2 },
      ]),
      P('Con esto puedo seguir el rastro del alfa. Toma estas Dagas de Sombra: cortas, silenciosas, y más rápidas que el miedo. Úsalas bien.', [
        { text: 'Gracias, cazador.', action: 'close' },
      ]),
      P('Los quemaré en un círculo de ceniza. El humo mostrará hacia dónde corre la manada. Si el alfa está corrupto, tendremos que detenerlo.', [
        { text: 'Cuenta conmigo.', action: 'close' },
      ]),
    ];
  }
  return [
    P('La manada se ha dispersado. El bosque respira otra vez. Si encuentras un lobo solitario, no lo mates por diversión: solo por necesidad.', [
      { text: 'Lo recordaré.', action: 'close' },
    ]),
  ];
}

function elianPages(game) {
  const q = game.state.quests.echoes;
  const echoes = game.countItem('memoria');
  if (!q || q.status === 'inactive' || q.stage === 0) {
    return [
      P('...¿Me ves? No recuerdo mi nombre. Solo recuerdo que aquí había luz. Tres ecos de memoria quedaron atrapados en las ruinas. Si los reúnes, quizá recuerde quién fui.', [
        { text: 'Te ayudaré a recordar.', action: 'accept_echoes', next: 1 },
        { text: 'Descansa en paz.', action: 'close' },
      ]),
      P('Gracias. Los espectros y los cristales antiguos guardan recuerdos. Escúchalos. Y ten cuidado: la memoria también puede herir.', [
        { text: 'Volveré con los ecos.', action: 'close' },
      ]),
    ];
  }
  if (q.stage === 1 || q.stage === 2) {
    const enough = echoes >= 3;
    return [
      P(`Siento ${Math.min(echoes, 99)} eco${echoes === 1 ? '' : 's'} en tu mochila. Tres. Necesito tres para recordar.`, [
        enough ? { text: 'Entregar los tres ecos.', action: 'turnin_echoes', next: 1 } : { text: 'Aún faltan recuerdos.', action: 'close' },
        { text: '¿Qué recuerdas?', next: 2 },
      ]),
      P('Elian. Me llamo Elian. Fui guardián de la puerta este... y no pude impedir que Kael entrara. Gracias por devolverme mi nombre. Toma este colgante; brilla con lo que queda de mí.', [
        { text: 'Descanse, Elian.', action: 'close' },
      ]),
      P('Recuerdo el cielo de Aether antes de caer. Recuerdo una espada de tres luces. Y recuerdo que alguien prometió volver.', [
        { text: 'Yo también lo recuerdo.', action: 'close' },
      ]),
    ];
  }
  return [
    P('Elian. Ese es mi nombre. La puerta está abierta y el cielo ya no pesa tanto. Gracias, portador del alba.', [
      { text: 'Hasta siempre.', action: 'close' },
    ]),
  ];
}

function selaPages(game) {
  return [
    P('«Lo que necesitas, lo tengo. Lo que no, lo consigo.» Pociones, éter, bombas y algún que otro secreto. ¿Qué te llevas?', [
      { text: 'Ver la mercancía.', action: 'shop_sela' },
      { text: 'Solo miraba.', action: 'close' },
    ]),
  ];
}

function rovanPages(game) {
  if (!game.state.flags.rovan_talked) {
    return [
      P('La puerta norte lleva al Bosque de Lumen. No dejes que las luces te distraigan: hay cosas que brillan para atraer. Toma una poción. La primera guardia siempre es la más larga.', [
        { text: 'Gracias, capitán.', action: 'rovan_gift', next: 1 },
        { text: 'Sé cuidarme.', action: 'close' },
      ]),
      P('Todos lo creemos al principio. Si ves al Guardián Corrompido, no intentes razonar con él. Ya no queda nadie dentro de esa armadura.', [
        { text: 'Lo tendré en cuenta.', action: 'close' },
      ]),
    ];
  }
  return [
    P('El bosque sigue en pie y tú también. Eso ya es más de lo que muchos pueden decir. La puerta está abierta.', [
      { text: 'Gracias.', action: 'close' },
    ]),
  ];
}

export function handleNpcChoice(game, choice) {
  const action = choice?.action;
  if (!action) return null;
  switch (action) {
    case 'close':
      return {};
    case 'shop_sela':
    case 'shop_brann': {
      game.ui.closeDialogue();
      game.openShop(action === 'shop_brann' ? 'brann' : 'sela');
      return { stay: true };
    }
    case 'mira_accept': {
      if (game.state.quests.main.stage === 0) {
        game.state.quests.main.stage = 1;
        game.state.flags.mira_talked = true;
        game.addItem('potion', 2);
        game.ui.toast('Juramento aceptado', 'El Altar del Alba te espera en el Bosque de Lumen.', 'success', 4200);
        game.audio.sfx('quest');
        game.updateQuestMarkers();
        game.autoSave(true);
      }
      return null;
    }
    case 'accept_fireflies': game.startQuest('fireflies'); return null;
    case 'accept_fangs': game.startQuest('fangs'); return null;
    case 'accept_iron': game.startQuest('iron'); return null;
    case 'accept_echoes': game.startQuest('echoes'); return null;
    case 'turnin_fireflies': {
      if (game.countItem('luciernaga') >= 3) {
        game.removeItem('luciernaga', 3);
        game.completeQuest('fireflies');
      }
      return null;
    }
    case 'turnin_fangs': {
      if (game.countItem('colmillo') >= 5) {
        game.removeItem('colmillo', 5);
        game.completeQuest('fangs');
      }
      return null;
    }
    case 'turnin_iron': {
      if (game.countItem('hierro') >= 3) {
        game.removeItem('hierro', 3);
        game.completeQuest('iron');
      }
      return null;
    }
    case 'turnin_echoes': {
      if (game.countItem('memoria') >= 3) {
        game.removeItem('memoria', 3);
        game.completeQuest('echoes');
      }
      return null;
    }
    case 'rovan_gift': {
      if (!game.state.flags.rovan_talked) {
        game.state.flags.rovan_talked = true;
        game.addItem('potion', 1);
        game.ui.toast('Poción recibida', 'El capitán Rovan te ha dado una Poción de Alba.', 'success');
        game.audio.sfx('potion');
      }
      return null;
    }
    default:
      return null;
  }
}
