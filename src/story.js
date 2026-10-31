/* ------------------------------------------------------------------ */
/* LA ESPADA CELESTIAL — narrativa original                            */
/* ------------------------------------------------------------------ */

export function introCinematic(playerName = 'Aurel') {
  return {
    kicker: 'PRÓLOGO · EL DESPERTAR',
    title: 'EL JURAMENTO DE LOS CIELOS ROTOS',
    lines: [
      'Hubo un tiempo en que el cielo no necesitaba sostenerse. Era joven, y nadie había aprendido aún a tenerle miedo.',
      'La Gema Celestial se quebró en tres Fragmentos: uno quedó dormido bajo Valdoria, otro ardió en Drakmor y el último fue escondido en Kansordore, el archivo de los cielos.',
      'La Profecía de Jugador Cero no hablaba de un elegido. Hablaba de alguien que llegaría desde fuera del tablero, miraría las reglas y preguntaría quién las escribió.',
      `${playerName}, portador de la Espada Celestial. No recuerdas haber elegido esta historia. Pero la Espada sí te recuerda.`,
      'Despiertas en Lumen con una Jarra de Origen vacía, una promesa en el pecho y el Velo temblando sobre el mundo.',
    ],
  };
}

const CHAPTERS = {
  5: {
    kicker: 'CAPÍTULO II · DRAKMOR',
    title: 'CENIZA EN EL HORIZONTE',
    lines: [
      'El Guardián Astado cae, y con él una verdad incómoda: la Gema Celestial no fue robada. Fue repartida.',
      'El Fragmento de Brasa despierta al sureste, en una tierra donde el primer fuego todavía recuerda el nombre de quienes se lo dieron.',
      'Drakmor te espera. Y en Drakmor, amar es una forma lenta de arder.',
    ],
  },
  9: {
    kicker: 'CAPÍTULO III · KANSORDORE',
    title: 'EL ARCHIVO PROHIBIDO',
    lines: [
      'La Reina Ceniza cae, y el fuego que la sostenía se convierte en memoria.',
      'El tercer Fragmento no está en un lugar. Está en una decisión: la biblioteca que solo existe para quien ya no puede olvidar.',
      'Kansordore abre sus puertas. Tres sellos guardan la Cumbre de la Convergencia. Tres centinelas guardan los sellos.',
      'Y en la cima, el último Jugador Cero lleva mil años esperando una respuesta.',
    ],
  },
  11: {
    kicker: 'CAPÍTULO IV · LA CONVERGENCIA',
    title: 'EL PESO DEL CIELO',
    lines: [
      'Los tres sellos se rompen. El Archivo Prohibido exhala una luz que huele a lluvia y a libros viejos.',
      'La Convergencia Absoluta ya ha comenzado: todas las verdades de Aetheria empiezan a caer en el mismo punto.',
      'La Cumbre te espera al norte. Vex también.',
    ],
  },
  13: {
    kicker: 'EPÍLOGO · LA ESPADA CELESTIAL',
    title: 'NINGÚN CIELO PESA SOLO',
    lines: [
      'Vex cae de rodillas, no por la espada, sino por algo parecido al alivio.',
      'La Espada Celestial está completa. No fue forjada para matar. Fue forjada para recordar.',
      'La Convergencia se abre ante ti. Cuatro caminos. Una sola pregunta: ¿qué clase de cielo quieres dejar a los que vienen después?',
    ],
  },
};

export function chapterCinematic(stage) {
  return CHAPTERS[stage] || null;
}

/* ------------------------------------------------------------------ */
/* Lyra                                                                */
/* ------------------------------------------------------------------ */

export function lyraDialogue(state) {
  const stage = state.mainStage;
  const memoria = state.sideQuests.memoria || {};

  if (stage === 0) {
    return {
      speaker: 'Lyra',
      portrait: 'lyra',
      lines: [
        'Por fin has llegado. La Espada llevaba tres noches cantando. Yo ya no sabía si era una advertencia o una bienvenida.',
        'Me llamo Lyra. Leo lo que el Velo intenta borrar. Últimamente intenta borrar mucho.',
        'Las sombras que ves en la pradera no son monstruos. Son pensamientos que el Velo no pudo digerir. Y están hambrientas.',
        'La Gema Celestial se rompió, y su juramento contigo. Si no reúnes los Fragmentos antes de la Convergencia, Aetheria olvidará incluso que alguna vez tuvo cielo.',
      ],
      choices: [
        { id: 'accept', label: 'Acepto el juramento. Dime qué debo hacer.' },
        { id: 'ask', label: '¿Qué es exactamente la Espada Celestial?' },
      ],
    };
  }

  if (stage === 1) {
    return {
      speaker: 'Lyra',
      portrait: 'lyra',
      lines: [
        'Aún quedan sombras al norte y al este de Lumen. No las subestimes: el miedo también sabe empuñar una espada.',
        'Cuando las hayas disipado, vuelve. Necesito contarte lo que encontré en los márgenes del Archivo.',
      ],
    };
  }

  if (stage === 2) {
    return {
      speaker: 'Lyra',
      portrait: 'lyra',
      lines: [
        'Has disipado las sombras. Bien. Eso significa que el Velo aún escucha.',
        'El primer Fragmento está en el Santuario del Alba, al este. Pero la piedra está sellada por tres Lámparas del Alba.',
        'Enciéndelas. Y prepárate: el Santuario no te dará el Fragmento sin pedirte algo a cambio.',
      ],
      choices: [
        { id: 'accept', label: 'Iré al Santuario.' },
        { id: 'ask', label: '¿Qué me pedirá a cambio?' },
      ],
    };
  }

  if (stage === 5) {
    return {
      speaker: 'Lyra',
      portrait: 'lyra',
      lines: [
        'El Fragmento de Brasa ha despertado. Lo siento desde aquí: un latido seco, como una puerta que se cierra.',
        'Abre el mapa y viaja a Drakmor. Busca a Kael en el Campamento de Ceniza. Fue caballero de la Reina antes de que ella olvidara su propio nombre.',
        'Y ten cuidado. En Drakmor, el fuego no ilumina. Recuerda.',
      ],
    };
  }

  if (state.region === 'kansordore' && stage >= 10 && stage <= 12) {
    return {
      speaker: 'Lyra',
      portrait: 'lyra',
      lines: [
        'Kansordore no siempre estuvo aquí. El Archivo se escribe a sí mismo cada vez que alguien olvida algo importante.',
        'Los tres sellos están custodiados por Centinelas del Velo. No tienen rostro porque nunca necesitaron uno para juzgar.',
        'Rómpelos. Después sube a la Cumbre. Vex no es un monstruo, pero tampoco va a apartarse.',
      ],
    };
  }

  if (stage === 13) {
    return {
      speaker: 'Lyra',
      portrait: 'lyra',
      lines: [
        'Has vuelto. La Espada está completa. Yo... no sé si alegrarme o pedirte que te detengas.',
        'La Convergencia te dará cuatro caminos. Ninguno es limpio. Elige el que puedas sostener cuando nadie esté mirando.',
        'Sea cual sea tu decisión, quiero que sepas esto: no fuiste una profecía. Fuiste una elección. La mía también.',
      ],
    };
  }

  if (!memoria.started && stage >= 3) {
    return {
      speaker: 'Lyra',
      portrait: 'lyra',
      lines: [
        'Antes de que sigas, hay algo que solo tú puedes hacer.',
        'He perdido tres memorias en el camino. No son recuerdos míos: son fragmentos de la verdad que el Velo arrancó del mundo.',
        'Están repartidas por Aetheria. Si las recuperas, quizá entienda por qué la Espada te eligió a ti.',
      ],
      choices: [
        { id: 'accept', label: 'Las buscaré.' },
        { id: 'later', label: 'Ahora no. Tengo que seguir.' },
      ],
    };
  }

  if (memoria.started && !memoria.done && state.lore.length >= 3) {
    return {
      speaker: 'Lyra',
      portrait: 'lyra',
      lines: [
        'Tres memorias. Las he leído todas. Duele más de lo que esperaba.',
        'El Primer Juramento no fue entre un héroe y una espada. Fue entre dos personas que tenían miedo de dejar el mundo solo.',
        'Toma estas Vestiduras Astrales. No te protegen del daño. Te protegen del olvido.',
      ],
    };
  }

  if (memoria.started && !memoria.done) {
    return {
      speaker: 'Lyra',
      portrait: 'lyra',
      lines: [
        `Has recuperado ${state.lore.length} de 3 memorias. Las siento cerca, como páginas que alguien intenta arrancar.`,
        'Busca los libros que brillan en el mundo. El Velo no puede esconderlos si tú decides mirarlos.',
      ],
    };
  }

  return {
    speaker: 'Lyra',
    portrait: 'lyra',
    lines: [
      'El Velo se agita. No sé si es miedo o esperanza. Últimamente los dos suenan igual.',
      'Sigue tu camino. Yo seguiré leyendo. Alguien tiene que recordar lo que pasa después.',
    ],
  };
}

/* ------------------------------------------------------------------ */
/* Nima                                                                */
/* ------------------------------------------------------------------ */

export function nimaDialogue(state) {
  const quest = state.sideQuests.ecos || {};
  if (!quest.started) {
    return {
      speaker: 'Nima',
      portrait: 'nima',
      lines: [
        '¡Shhh! Estás espantando a los ecos. Bueno, no. En realidad les gustas. Hueles a tormenta y a decisiones difíciles.',
        'Soy Nima. Hablo con las criaturas que el Velo dejó a medias. Lumi, Brotín, Zéfiro... todas tienen nombre, aunque el mundo finja que no.',
        'Necesito saber si el Velo sigue robando nombres. Captura tres ecos distintos y tráemelos. Bueno, no me los traigas. Resuena con ellos. Es más bonito.',
      ],
      choices: [
        { id: 'accept', label: 'Resonaré con tres ecos.' },
        { id: 'later', label: 'Quizá más tarde.' },
      ],
    };
  }
  if (!quest.done && state.creatures.length >= 3) {
    return {
      speaker: 'Nima',
      portrait: 'nima',
      lines: [
        '¡Tres! ¡Y ninguno se ha comido a nadie! Bueno, el Obsidiano intentó comerse una piedra, pero eso no cuenta.',
        'Los ecos te reconocen. Eso significa que el Velo ya no puede borrarlos sin pelear.',
        'Toma el Amuleto de Lumi. Brilla cuando algo pequeño te quiere. Úsalo bien. O no. Los amuletos también merecen divertirse.',
      ],
    };
  }
  if (!quest.done) {
    return {
      speaker: 'Nima',
      portrait: 'nima',
      lines: [
        `Llevas ${state.creatures.length} de 3 ecos. Los Lumi son fáciles: les gusta la luz y las personas que no gritan.`,
        'Los Zéfiro son más difíciles. Roban cintas. No preguntes por qué. Yo dejé de preguntar hace tres inviernos.',
      ],
    };
  }
  return {
    speaker: 'Nima',
    portrait: 'nima',
    lines: [
      'Los ecos están contentos. Bueno, el Brotín está contento. Los demás están haciendo lo que hacen siempre: existir con mucha dignidad.',
      'Cuando termine esto, quiero que vengas a conocer el jardín. Trae semillas. Y paciencia. Sobre todo paciencia.',
    ],
  };
}

/* ------------------------------------------------------------------ */
/* Anciana Mira                                                        */
/* ------------------------------------------------------------------ */

export function miraDialogue(state) {
  const quest = state.sideQuests.campanas || {};
  if (!quest.started) {
    return {
      speaker: 'Anciana Mira',
      portrait: 'mira',
      lines: [
        'Cuando era joven, Lumen tenía tres braseros que nunca se apagaban. La gente decía que mientras ardieran, la aldea recordaría su propio nombre.',
        'Se apagaron la noche en que el Velo se cerró. Desde entonces, nadie recuerda por qué lloramos en primavera.',
        'Enciéndelos. No por mí. Por los que vendrán y no sabrán que les falta algo.',
      ],
      choices: [
        { id: 'accept', label: 'Encenderé los tres braseros.' },
        { id: 'later', label: 'Volveré cuando pueda.' },
      ],
    };
  }
  if (!quest.done && (state.flags.braziers || 0) >= 3) {
    return {
      speaker: 'Anciana Mira',
      portrait: 'mira',
      lines: [
        'Los he visto arder desde mi ventana. Por un momento, Lumen volvió a tener sombras largas.',
        'Toma estas pociones y esta esencia. No es mucho. Pero es lo que una aldea puede dar cuando recuerda cómo dar.',
        'Gracias, portador. Ahora vete. Tengo que llorar un rato y no quiero testigos.',
      ],
    };
  }
  if (!quest.done) {
    return {
      speaker: 'Anciana Mira',
      portrait: 'mira',
      lines: [
        `Has encendido ${state.flags.braziers || 0} de 3 braseros. El tercero está al oeste de la plaza, junto a la casa de las campanas.`,
        'No corras. Los braseros llevan décadas dormidos; pueden esperar un poco más.',
      ],
    };
  }
  return {
    speaker: 'Anciana Mira',
    portrait: 'mira',
    lines: [
      'La luz vuelve despacio. Como todo lo que merece la pena.',
      'Cuando el cielo se caiga, ven a mi casa. Tengo té y una silla que no cruje. No es mucho, pero es un comienzo.',
    ],
  };
}

/* ------------------------------------------------------------------ */
/* Orin                                                                */
/* ------------------------------------------------------------------ */

export function orinDialogue(state) {
  if (!state.flags.orinGift) {
    return {
      speaker: 'Orin',
      portrait: 'orin',
      lines: [
        'La Espada Celestial. La he visto en grabados, pero nunca en manos de alguien que todavía tenga que atarse las botas.',
        'No intentes afilarla con piedra. Te va a mirar mal. La Espada recuerda cada forma que ha llevado; necesita fragmentos de cielo, no paciencia de herrero.',
        'Toma estos dos fragmentos. Y si vuelves con esencia de eco, te enseño a despertar lo que ya está dentro de ella.',
      ],
    };
  }
  return {
    speaker: 'Orin',
    portrait: 'orin',
    lines: [
      'La forja no crea nada. Solo convence al metal de que puede ser otra cosa.',
      'Abre el menú de pausa y entra en Equipo. Ahí puedes mejorar el arma y la armadura con fragmentos de cielo.',
      'Y no me traigas más excusas. Trae esencia.',
    ],
  };
}

/* ------------------------------------------------------------------ */
/* Kael                                                                */
/* ------------------------------------------------------------------ */

export function kaelDialogue(state) {
  const deuda = state.sideQuests.deuda || {};
  const stage = state.mainStage;

  if (stage === 6) {
    return {
      speaker: 'Kael',
      portrait: 'kael',
      lines: [
        'Así que Lyra te envía. Claro. Ella siempre manda a otros a hacer las preguntas que le duelen.',
        'La Reina Ceniza fue mi reina. Ilyra Drakmor vendió su nombre al primer fuego para salvar a su pueblo del invierno. El fuego cobró intereses.',
        'Ahora su fortaleza está cerrada. Tres Guardias de Obsidiana custodian la puerta. Si quieres llegar al trono, tendrás que apagarlos.',
        'Y hay algo más. En la Caldera de Ceniza vive un Devorador. Lo llamo «mi último error». Si lo matas, te deberé más de lo que puedo pagar.',
      ],
      choices: [
        { id: 'accept', label: 'Abriré la puerta de obsidiana.' },
        { id: 'deuda', label: 'También mataré al Devorador.' },
        { id: 'ask', label: '¿Por qué no lo matas tú?' },
      ],
    };
  }

  if (deuda.started && !deuda.done) {
    return {
      speaker: 'Kael',
      portrait: 'kael',
      lines: [
        'El Devorador sigue vivo. Lo sé porque todavía sueño con su aliento.',
        'Está en la Caldera, al sureste. No es rápido, pero cuando te alcanza, el mundo se vuelve pequeño.',
        'Si no puedes con él, vuelve. No hay vergüenza en sobrevivir para intentarlo otra vez.',
      ],
    };
  }

  if (stage >= 8 && stage <= 9) {
    return {
      speaker: 'Kael',
      portrait: 'kael',
      lines: [
        'La Reina está en el patio de la fortaleza, más allá de la puerta. No la subestimes: su fuego no quema la carne. Quema los nombres.',
        'Cuando la veas, recuerda que un día fue una niña que pidió que su pueblo no muriera de frío.',
        'No te pido que la perdones. Solo que no la reduzcas a un monstruo.',
      ],
    };
  }

  if (deuda.done) {
    return {
      speaker: 'Kael',
      portrait: 'kael',
      lines: [
        'Mataste al Devorador. No sé si eso me hace libre o me convierte en la última persona que recuerda lo que fui.',
        'Toma el Filo Dracónico. Lo forjé con una escama de la Reina. Aún respira, pero ya no muerde.',
        'Ve a Kansordore. Y cuando encuentres a Vex, no le preguntes por qué sostiene el cielo. Pregúntale para quién.',
      ],
    };
  }

  return {
    speaker: 'Kael',
    portrait: 'kael',
    lines: [
      'La ceniza no perdona, pero tampoco guarda rencor. Solo espera.',
      'Si vuelves a Valdoria, dile a Lyra que sigo vivo. No sé si le importará. Dímelo igual.',
    ],
  };
}

/* ------------------------------------------------------------------ */
/* Vex                                                                 */
/* ------------------------------------------------------------------ */

export function bossIntro(id) {
  const data = {
    guardian: {
      speaker: 'El Guardián Astado',
      portrait: 'creature',
      creature: 'lumi',
      lines: [
        'Has encendido las lámparas. El Santuario recuerda tu luz, pero yo recuerdo otra cosa.',
        'La primera criatura que juró proteger la Gema Celestial fui yo. Ahora protejo su ausencia.',
        'Si quieres el Fragmento, demuéstrame que puedes cargar con lo que falta.',
      ],
    },
    reina: {
      speaker: 'La Reina Ceniza',
      portrait: 'vex',
      lines: [
        'Otro portador. Otra espada que canta. Otra persona que cree que el fuego se puede apagar con buenas intenciones.',
        'Mi pueblo sobrevivió al invierno. Yo no. Esto que ves es lo que el primer fuego dejó cuando terminó de cobrarse mi nombre.',
        'Ven. Te enseñaré cuánto pesa una corona que arde.',
      ],
    },
    vex: {
      speaker: 'Vex, Custodio del Velo',
      portrait: 'vex',
      lines: [
        'Así que tú eres el Jugador Cero. No pareces alguien que vaya a romper el mundo. Pero los que rompen el mundo nunca lo parecen.',
        'He sostenido este cielo durante mil años. He visto a todos los que vinieron antes que tú. Ninguno preguntó quién escribió las reglas.',
        'Si de verdad eres diferente, demuéstralo. La Convergencia no se detiene por buenas preguntas.',
      ],
    },
    devorador: {
      speaker: 'Devorador de Ceniza',
      portrait: 'creature',
      creature: 'ascua',
      lines: [
        'El Devorador no habla. Abre la boca, y el aire alrededor recuerda cómo se siente ser olvidado.',
      ],
    },
  };
  return data[id] || data.vex;
}

/* ------------------------------------------------------------------ */
/* Convergencia / finales                                              */
/* ------------------------------------------------------------------ */

export function convergenceDialogue(state) {
  const canCelestial = state.creatures.length >= 6;
  return {
    speaker: 'La Convergencia',
    portrait: 'vex',
    lines: [
      'Todas las verdades de Aetheria han caído en este punto. Puedo ver cada versión de ti: la que se rinde, la que gobierna, la que olvida.',
      'La Espada Celestial no decide por ti. Solo recuerda lo que eliges.',
      '¿Qué clase de cielo quieres dejar a los que vienen después?',
    ],
    choices: [
      { id: 'restaurar', label: 'Restaurar el Velo. Que el mundo duela, pero siga entero.' },
      { id: 'romper', label: 'Romper el Velo. Que todos los mundos se vean por fin.' },
      { id: 'ascender', label: 'Ascender. Sostener el cielo yo mismo.' },
      {
        id: 'celestial',
        label: canCelestial
          ? 'Tejer un puente. Que el cielo se sostenga entre todos.'
          : 'Tejer un puente. (Requiere al menos 6 ecos)',
        disabled: !canCelestial,
      },
    ],
  };
}

export function endingCinematic(id, playerName = 'Aurel') {
  const lines = {
    restaurar: [
      'Clavas la Espada en el corazón de la Convergencia. El cielo se cierra como una herida que aprende a cicatrizar.',
      'Aetheria olvida tu nombre. Pero cada amanecer tiene un tono dorado que nadie sabe explicar.',
      `${playerName}, el portador sin estatua. El juramento que el mundo no recuerda haber hecho.`,
    ],
    romper: [
      'Giras la espada y cortas la última hebra. El Velo cae sin ruido.',
      'Durante tres días, todos los mundos se ven entre sí. Después, la gente empieza a construir con las ruinas de lo imposible.',
      'No hay profecía que sobreviva a un mundo que decide escribir su propia historia.',
    ],
    ascender: [
      'Aceptas el peso. La espada se disuelve en tu pecho y el Velo te reconoce.',
      'Ocupas el lugar de Vex en la Cumbre, viendo todos los caminos sin poder recorrer ninguno.',
      'El cielo tiene un nuevo guardián. Esta vez, alguien que recuerda por qué lo protege.',
    ],
    celestial: [
      'No restauras el Velo ni lo rompes. Lo conviertes en un puente.',
      'Cada eco que reuniste —cada criatura, cada recuerdo, cada nombre— sostiene la tela del cielo junto a ti.',
      'El cielo, por primera vez en mil años, no pesa. Porque por fin lo sostiene más de una persona.',
    ],
  };
  return {
    kicker: 'FINAL',
    title: id === 'celestial' ? 'LA ESPADA CELESTIAL' : 'EL JURAMENTO SE CUMPLE',
    lines: lines[id] || lines.restaurar,
  };
}
