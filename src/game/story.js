export function liraIntro() {
  return {
    lines: [
      { speaker: 'Lira', role: 'Guardián del Alba', text: 'Te has despertado. La Gema también. Eso no es una coincidencia, aunque te gustaría que lo fuera.' },
      { speaker: 'Lira', role: 'Guardián del Alba', text: 'El Velo se está rasgando. Valdoria sangra luz corrupta y los muertos caminan con la cabeza llena de ceniza.' },
      { speaker: 'Tú', role: 'Jugador Cero', text: '¿Quién soy?', player: true },
      { speaker: 'Lira', role: 'Guardián del Alba', text: 'La profecía no te nombra. Eso debería asustarte. En cambio, aquí estás, con una espada que no sabes merecer.' },
      {
        speaker: 'Lira', role: 'Guardián del Alba', text: 'Purga los tres focos de corrupción. Después ven al Santuario de la Grieta. Y no dejes que la ceniza te vea dudar.',
        choices: [
          { label: 'Acepto la luz.', action: 'lira-accept' },
          { label: '¿Qué es el Velo?', action: 'lira-velo' },
        ],
      },
    ],
  };
}

export function liraVelo() {
  return [
    { speaker: 'Lira', role: 'Guardián del Alba', text: 'La membrana entre lo que es y lo que podría ser. Cuando se rompió, empezaron a aparecer versiones equivocadas de las cosas. Incluidos nosotros.' },
    { speaker: 'Lira', role: 'Guardián del Alba', text: 'No preguntes quién lo rompió. Todavía no soportarías la respuesta. Ve a los focos.' },
  ];
}

export function liraRiftsDone() {
  return {
    lines: [
      { speaker: 'Lira', role: 'Guardián del Alba', text: 'Los focos callan. El Santuario te ha sentido desde el noroeste: las ruinas están respirando otra vez.' },
      { speaker: 'Lira', role: 'Guardián del Alba', text: 'El Centinela de Ceniza guarda el primer Fragmento de la Gema. No es un guardián. Es una advertencia con armadura.' },
      { speaker: 'Lira', role: 'Guardián del Alba', text: 'Si cae, toma el Fragmento y abre la Puerta de Drakmore. Y si ves una criatura de luz entre las ruinas… no la fuerces. Resuena.' },
    ],
  };
}

export function liraAltar() {
  return {
    lines: [
      { speaker: 'Lira', role: 'Guardián del Alba', text: 'El Fragmento canta. ¿Lo oyes? Es la primera nota de una canción que lleva mil años esperando.' },
      { speaker: 'Tú', role: 'Jugador Cero', text: 'No suena a victoria.', player: true },
      { speaker: 'Lira', role: 'Guardián del Alba', text: 'Porque no lo es. Es una puerta. La Puerta de Drakmore está al norte. Allí la luz aprendió a arder.' },
    ],
  };
}

export function orinIntro() {
  return {
    lines: [
      { speaker: 'Orin', role: 'Herrero de la Primera Brasa', text: 'Otro que sobrevivió a la Ruptura. Otra boca que dice mi nombre. El Velo tiene un sentido del humor terrible.' },
      { speaker: 'Orin', role: 'Herrero de la Primera Brasa', text: 'Kael se sentó en el trono de ceniza y olvidó que los reyes también arden. Ahora su fortaleza respira por él.' },
      { speaker: 'Orin', role: 'Herrero de la Primera Brasa', text: 'Rompe los dos sellos de la Fortaleza. Cuando el fuego se abra, sube y reclama la Lágrima de la Primera Brasa. Es lo único que mantiene caliente a Drakmore.' },
      { speaker: 'Orin', role: 'Herrero de la Primera Brasa', text: 'Y si encuentras una Chispa entre las rocas, no la apagues. Las brasas pequeñas recuerdan a los dioses que se fueron.' },
    ],
  };
}

export function orinSealsDone() {
  return {
    lines: [
      { speaker: 'Orin', role: 'Herrero de la Primera Brasa', text: 'Los sellos han caído. La fortaleza está abierta… y furiosa.' },
      { speaker: 'Orin', role: 'Herrero de la Primera Brasa', text: 'Kael te espera en el trono. No le tengas piedad. Él no la tuvo con su propio reino.' },
    ],
  };
}

export function orinAltar() {
  return {
    lines: [
      { speaker: 'Orin', role: 'Herrero de la Primera Brasa', text: 'La Lágrima. Mil años calentando un mundo que se olvidó de agradecerle.' },
      { speaker: 'Orin', role: 'Herrero de la Primera Brasa', text: 'Llévala a Kansordore. El portal al sur está despierto. Allí el Velo no se rompe: se pliega.' },
      { speaker: 'Tú', role: 'Jugador Cero', text: '¿Y si no quiero ser el que decide?', player: true },
      { speaker: 'Orin', role: 'Herrero de la Primera Brasa', text: 'Entonces ya eres más sabio que todos los dioses que conozco. Pero decide igual.' },
    ],
  };
}

export function testigoIntro() {
  return {
    lines: [
      { speaker: 'El Testigo', role: 'Voz del Velo', text: 'Te conozco. No por tu nombre. Por la forma en que el Velo se aparta cuando caminas.' },
      { speaker: 'El Testigo', role: 'Voz del Velo', text: 'Los tres Ecos Primordiales sostienen la puerta. No los obligues. Resuena. La luz solo obedece cuando se la escucha.' },
      { speaker: 'El Testigo', role: 'Voz del Velo', text: 'Cuando la puerta se abra, Jugador Cero te estará esperando. No luches contra él como si fuera un monstruo. Lucha contra él como si fueras tú.' },
      { speaker: 'Tú', role: 'Jugador Cero', text: '¿Y si soy yo?', player: true },
      { speaker: 'El Testigo', role: 'Voz del Velo', text: 'Entonces por fin entenderás por qué la Espada te eligió a ti y no a un héroe.' },
    ],
  };
}

export function testigoSealsDone() {
  return {
    lines: [
      { speaker: 'El Testigo', role: 'Voz del Velo', text: 'Los tres Ecos han respondido. La Puerta de la Convergencia reconoce tu paso.' },
      { speaker: 'El Testigo', role: 'Voz del Velo', text: 'No hay profecía que pueda describir lo que viene. Eso es lo más esperanzador que he dicho en mil años.' },
    ],
  };
}

export function bossIntro(chapter) {
  if (chapter === 0) return [
    { speaker: 'Centinela de Ceniza', role: 'Guardián de la Grieta', text: 'La Gema no se rompió. La rompieron. Y tú hueles a la mano que sostuvo el martillo.' },
    { speaker: 'Tú', role: 'Jugador Cero', text: 'No sé de qué hablas.', player: true },
    { speaker: 'Centinela de Ceniza', role: 'Guardián de la Grieta', text: 'Lo sé. Ese es el problema.' },
  ];
  if (chapter === 1) return [
    { speaker: 'Kael', role: 'El Rey Cenizo', text: 'Orin te envió. El viejo siempre manda a otros a morir por su nostalgia.' },
    { speaker: 'Kael', role: 'El Rey Cenizo', text: 'La Lágrima no es tuya, portador. Drakmore arde porque yo lo sostengo.' },
    { speaker: 'Tú', role: 'Jugador Cero', text: 'Drakmore arde porque tú lo olvidaste.', player: true },
  ];
  return [
    { speaker: 'Jugador Cero', role: 'El Espejo del Velo', text: 'Por fin. Me estaba cansando de ser la versión que no eligen.' },
    { speaker: 'Tú', role: 'Jugador Cero', text: 'Tú no eres yo.', player: true },
    { speaker: 'Jugador Cero', role: 'El Espejo del Velo', text: 'Todavía no.' },
  ];
}

export function altarDialogue(chapter) {
  if (chapter === 0) return liraAltar();
  if (chapter === 1) return orinAltar();
  return {
    lines: [
      { speaker: 'La Espada Celestial', role: 'Voz de la Convergencia', text: 'No fuiste elegido. Fuiste la excepción. La profecía no podía predecir a alguien que decidiera no obedecerla.' },
      { speaker: 'La Espada Celestial', role: 'Voz de la Convergencia', text: 'Toca el Núcleo. Elige qué versión del mundo despierta. Y recuerda: toda Ascensión es también una despedida.' },
      { speaker: 'Tú', role: 'Jugador Cero', text: 'Entonces que despierte.', player: true },
    ],
  };
}

export function endingCopy() {
  return [
    'La Espada Celestial vuelve a cantar. El Velo se cierra… pero no del todo.',
    'En Valdoria, las flores aprenden de nuevo a inclinarse hacia el sol. En Drakmore, la Lágrima enfría el trono de Kael. En Kansordore, los tres Ecos duermen por primera vez en mil años.',
    'Al otro lado del Velo, una figura con tu rostro abre los ojos. La Convergencia no ha terminado. Solo ha aprendido tu nombre.',
  ];
}

export function companionLines(id) {
  const lines = {
    lumin: 'Lumín frota su cola contra tu mano. Por un instante, el mundo parece más pequeño y más amable.',
    bruma: 'Bruma no te mira. Aun así, sabes que te ha reconocido.',
    terravok: 'Terravok golpea el suelo una vez. En algún lugar bajo tus pies, una montaña responde.',
    chispa: 'Chispa salta de tu hombro a tu mano y deja un rastro de brasas que no queman.',
    aeris: 'Aeris gira sobre sí misma. El aire a tu alrededor huele a tormenta recién nacida.',
    astral: 'Astral parpadea. Durante un segundo, ves tres versiones de ti mismo mirando el mismo cielo.',
    seraph: 'Seraph inclina la cabeza. No hay palabras. Solo un coro que nadie más puede oír.',
  };
  return lines[id] || 'La criatura te observa en silencio.';
}
