// Guion, personajes y ramas narrativas.
export const PORTRAITS = {
  maren: { name: 'Anciana Maren', skin: '#d9c7a8', hair: '#cfd4d8', cloth: '#5a4a6a', accent: '#d9b46a', role: 'Anciana de Lumen' },
  lyra: { name: 'Lyra', skin: '#e8c9a8', hair: '#c86a3a', cloth: '#4a6a4a', accent: '#8fd18a', role: 'Erudita de los Ecos' },
  orin: { name: 'Orin', skin: '#b88a62', hair: '#4a2a1a', cloth: '#6a4a2a', accent: '#ff9a5c', role: 'Herrero de Lumen' },
  sela: { name: 'Sela', skin: '#d8a87a', hair: '#7a3a2a', cloth: '#7a3a4a', accent: '#ffd98a', role: 'Mercader' },
  elna: { name: 'Elna', skin: '#e0c8a8', hair: '#e0d0a0', cloth: '#4a7a6a', accent: '#8fd18a', role: 'Sanadora' },
  tilo: { name: 'Tilo', skin: '#e8c9a8', hair: '#c8a060', cloth: '#4a6a8a', accent: '#9fe8ff', role: 'Niño de Lumen' },
  roderic: { name: 'Roderic', skin: '#c8a888', hair: '#3a3a3a', cloth: '#5a5a6a', accent: '#cfc6b8', role: 'Guardia de la aldea' },
  kael: { name: 'Kael', skin: '#c8a888', hair: '#3a3a3a', cloth: '#4a4a5a', accent: '#d98a5a', role: 'Caballero Caído' },
  nira: { name: 'Nira', skin: '#c89a6a', hair: '#d9b46a', cloth: '#6a4a3a', accent: '#ff9a5c', role: 'Chatarrera de Cendra' },
  dama: { name: 'Dama de la Brasa', skin: '#ffb07a', hair: '#ff5a2a', cloth: '#8a2a1a', accent: '#ffd98a', role: 'La Primera Brasa' },
  aurel: { name: 'Aurel', skin: '#ffe7a8', hair: '#ffd98a', cloth: '#c8b0e8', accent: '#fff3c4', role: 'Eco del Origen' },
  vela: { name: 'Vela', skin: '#c8b8d8', hair: '#d8d0e8', cloth: '#5a4a7a', accent: '#c7a4ff', role: 'Archivera Prohibida' },
  veil: { name: 'El Velo', skin: '#2a2038', hair: '#0a0a12', cloth: '#1a1228', accent: '#c7a4ff', role: 'El rostro que no debes recordar' },
  echo: { name: 'Eco', skin: '#c7a4ff', hair: '#e8e0ff', cloth: '#3a2a5a', accent: '#ffe7a8', role: 'Tu reflejo' },
  guardian: { name: 'Guardián de Raíces', skin: '#6a5a3a', hair: '#3a4a2a', cloth: '#2f4a2a', accent: '#8fd18a', role: 'El que sostiene lo que queda' },
  jarra: { name: 'La Jarra de Origen', skin: '#ffe7a8', hair: '#fff3c4', cloth: '#8a6a2a', accent: '#fff3c4', role: 'Voz del origen' },
  survivor: { name: 'Superviviente', skin: '#b88a62', hair: '#6a4a3a', cloth: '#5a4a3a', accent: '#d9b46a', role: 'Los que no ardieron' },
};

const B = (speaker, portrait, text, extra = {}) => ({ speaker, portrait, text, ...extra });
const N = (text, extra = {}) => ({ speaker: '', portrait: '', text, narrator: true, ...extra });

export const SCRIPTS = {
  // ─── PRÓLOGO ────────────────────────────────────────────────────────────
  prologue_1: {
    beats: [
      N('Has muerto siete veces. Esta es la octava.'),
      N('La primera, el cielo se rompió. La segunda, el mar se bebió a sí mismo. La tercera, olvidaste tu nombre antes que tu espada.'),
      N('La Jarra de Origen te recoge cada vez. Te vierte en un cuerpo nuevo, en un mundo que ya no recuerda haberte visto.'),
      N('Esta vez, el Velo ha temblado. Esta vez, la Gema ha dejado un filo en la hierba.'),
      N('Y tú has abierto los ojos en Valdoria.'),
    ],
  },

  // ─── VALDORIA ───────────────────────────────────────────────────────────
  maren_intro: {
    beats: [
      B('Anciana Maren', 'maren', 'Llegas tarde, Jugador Cero. Otra vez.'),
      B('Tú', 'player', '¿Me conoces?'),
      B('Anciana Maren', 'maren', 'Conozco el hueco que dejas. La Gema se rompió hace veinte años y el mundo empezó a olvidar. Tú eres lo que el Velo no pudo borrar.'),
      B('Anciana Maren', 'maren', 'Ve al Santuario de la Estrella, al noreste. La espada te espera. Si el altar te reconoce, no huyas.'),
      { speaker: 'Tú', portrait: 'player', text: '¿Y si no quiero ser una espada?', choices: [
        { text: '¿Qué soy, en realidad?', next: 'maren_what' },
        { text: 'Iré al santuario.', next: 'maren_accept' },
      ] },
    ],
    onEnd: [{ flag: 'met_maren' }],
  },
  maren_what: {
    beats: [
      B('Anciana Maren', 'maren', 'Un jugador. Alguien que puede perder. Los dioses no saben perder; por eso nos envidian.'),
      B('Anciana Maren', 'maren', 'La Profecía de Jugador Cero dice que el octavo recipiente elegirá entre restaurar el Velo, romperlo o convertirse en él. Las siete versiones anteriores no llegaron tan lejos.'),
      B('Tú', 'player', '¿Qué les pasó?'),
      B('Anciana Maren', 'maren', 'Que eligieron antes de entender. No hagas lo mismo.'),
    ],
    onEnd: [{ flag: 'met_maren' }],
  },
  maren_accept: {
    beats: [
      B('Anciana Maren', 'maren', 'Entonces camina. Y cuando la espada te hable, escúchala. No siempre miente.'),
      B('Anciana Maren', 'maren', 'Toma estas pociones. La primera herida es la que más enseña.'),
    ],
    onEnd: [{ flag: 'met_maren' }, { item: 'potion_lumen', qty: 2 }],
  },
  maren_shrine_hint: {
    beats: [
      B('Anciana Maren', 'maren', 'El Santuario está al noreste, más allá del bosque de espinos. Sigue las runas rotas.'),
      B('Anciana Maren', 'maren', 'Si los espectros despiertan, no luches por orgullo. Lucha por el siguiente paso.'),
    ],
  },
  maren_hint_ruins: {
    beats: [
      B('Anciana Maren', 'maren', 'La espada ha despertado. Eso significa que las Ruinas también.'),
      B('Anciana Maren', 'maren', 'Los brasales recuerdan el orden: primero el que sostiene, luego el que arde, por último el que calla.'),
      B('Anciana Maren', 'maren', 'El Guardián no es un monstruo. Es lo que queda de un juramento. Si puedes, dale un final limpio.'),
    ],
    onEnd: [{ flag: 'maren_hint_ruins' }],
  },
  maren_after_guardian: {
    beats: [
      B('Anciana Maren', 'maren', 'Has vuelto. El Guardián descansa. Puedo oírlo desde aquí.'),
      B('Tú', 'player', 'La Gema no era un regalo. Era una cerradura.'),
      B('Anciana Maren', 'maren', 'Sí. Y yo fui una de las siete manos que la cerraron. La octava se negó. Se llamaba Cero.'),
      B('Tú', 'player', '¿Y qué pasó con él?'),
      B('Anciana Maren', 'maren', 'Que el mundo lo borró. Como borra todo lo que no puede controlar. Por eso tú llevas su nombre.'),
      B('Anciana Maren', 'maren', 'El Umbral de Drakmor está abierto. La Lágrima de la Primera Brasa sigue allí. Ve. Y no dejes que la Dama te diga que no tienes elección.'),
    ],
    onEnd: [{ flag: 'maren_truth' }, { xp: 120 }],
  },
  maren_default: {
    beats: [
      B('Anciana Maren', 'maren', 'El Velo escucha. Habla bajo.'),
      B('Anciana Maren', 'maren', 'Cuando llegues a Kansordore, busca a Aurel. Y cuando encuentres al Velo, recuerda que también fuiste él.'),
    ],
  },
  lyra_shrine: {
    beats: [
      B('Lyra', 'lyra', 'No grites. Los espectros ya se han ido. Bueno, los que podían oírte.'),
      B('Tú', 'player', '¿Quién eres?'),
      B('Lyra', 'lyra', 'Lyra. Estudio lo que el Velo borra. Y tú acabas de encender una señal que se ve desde tres reinos.'),
      B('Lyra', 'lyra', 'La espada te eligió. Eso no pasa desde la Ruptura. O eres el Jugador Cero, o eres el mayor problema de Valdoria.'),
      { speaker: 'Tú', portrait: 'player', text: 'Puede que ambas cosas.', choices: [
        { text: '¿Qué sabes de mí?', next: 'lyra_truth' },
        { text: 'Vamos. Hay un Guardián esperando.', next: 'lyra_accept' },
      ] },
    ],
    onEnd: [{ flag: 'lyra_ally' }],
  },
  lyra_truth: {
    beats: [
      B('Lyra', 'lyra', 'Sé que la Profecía tiene ocho versos y solo siete se han cumplido. Sé que el Velo tiene miedo de ti.'),
      B('Lyra', 'lyra', 'Y sé que mi aldea ya no existe porque alguien intentó leer el octavo verso en voz alta.'),
      B('Tú', 'player', 'Lo siento.'),
      B('Lyra', 'lyra', 'No lo sientas. Ayúdame a terminarlo.'),
    ],
    onEnd: [{ flag: 'lyra_ally' }],
  },
  lyra_accept: {
    beats: [
      B('Lyra', 'lyra', 'El Guardián está en las Ruinas de Lumen, al sureste. Los brasales abren su sello. Yo iré contigo hasta allí.'),
      B('Lyra', 'lyra', 'No puedo luchar como tú. Pero puedo recordar lo que tú olvidas.'),
    ],
    onEnd: [{ flag: 'lyra_ally' }],
  },
  lyra_ruins: {
    beats: [
      B('Lyra', 'lyra', 'Este mural es más viejo que Valdoria. Siete figuras sostienen la Gema. La octava está borrada.'),
      B('Lyra', 'lyra', 'El brasal que sostiene es el de la izquierda. El que arde, el de la derecha. El que calla, el del centro.'),
      B('Tú', 'player', '¿Y si me equivoco?'),
      B('Lyra', 'lyra', 'Entonces el Guardián se despertará enfadado. Yo me esconderé detrás de ti.'),
    ],
  },
  lyra_default: {
    beats: [
      B('Lyra', 'lyra', 'La Convergencia no es una guerra. Es una suma. Los mundos se recuerdan hasta que solo queda una versión.'),
      B('Lyra', 'lyra', 'Cuando llegue el momento, no elijas lo que te digan. Elige lo que puedas mirar a los ojos.'),
    ],
  },
  orin_intro: {
    beats: [
      B('Orin', 'orin', '¿Otra espada rota? No, esa no se puede forjar. Se reconoce.'),
      B('Orin', 'orin', 'Soy Orin. Si traes hierro y fragmentos, puedo mejorar lo que llevas. Si traes excusas, también puedo mejorarlas.'),
      { speaker: 'Orin', portrait: 'orin', text: '¿Qué necesitas?', choices: [
        { text: 'Mejora mi equipo. (Forja)', next: 'end', actions: [{ forge: true }] },
        { text: '¿Has perdido algo?', next: 'orin_hammer_offer' },
        { text: 'Solo pasaba.', next: 'end' },
      ] },
    ],
  },
  orin_hammer_offer: {
    beats: [
      B('Orin', 'orin', 'Mi martillo. Lo dejé en las Ruinas de Lumen cuando el Guardián despertó. Sin él, esta forja es solo una hoguera cara.'),
      B('Orin', 'orin', 'Si lo encuentras, te haré un filo que corte el miedo. Y no cobro por eso.'),
    ],
    onEnd: [{ quest: 'side_hammer' }],
  },
  orin_return_hammer: {
    beats: [
      B('Orin', 'orin', 'Mi martillo. Pensé que se lo había tragado la tierra.'),
      B('Orin', 'orin', 'Te dije que te haría un filo. Aquí está. Se llama Filo del Peregrino. No es una promesa; es una advertencia.'),
      B('Orin', 'orin', 'Y si vuelves con fragmentos de gema, puedo hacer algo mejor. Algo que no debería existir.'),
    ],
    onEnd: [{ removeItem: 'orin_hammer', qty: 1 }, { item: 'pilgrim_blade', qty: 1 }],
  },
  orin_default: {
    beats: [
      B('Orin', 'orin', 'El acero recuerda. Si lo tratas bien, te recordará a ti.'),
      { speaker: 'Orin', portrait: 'orin', text: '¿Quieres usar la forja?', choices: [
        { text: 'Sí. (Forja)', next: 'end', actions: [{ forge: true }] },
        { text: 'Ahora no.', next: 'end' },
      ] },
    ],
  },
  sela_intro: {
    beats: [
      B('Sela', 'sela', '¡Peregrino! Tienes cara de necesitar pociones, información o ambas. Tengo las tres.'),
      B('Sela', 'sela', 'Corre el rumor de que la Dama de la Brasa no es la que quemó Drakmor. Pero los rumores son gratis, y lo mío no.'),
      { speaker: 'Sela', portrait: 'sela', text: '¿Qué te llevas?', choices: [
        { text: 'Muestra tu mercancía. (Tienda)', next: 'end', actions: [{ shop: 'sela' }] },
        { text: '¿Qué se dice del Velo?', next: 'sela_veil' },
        { text: 'Solo curioseo.', next: 'end' },
      ] },
    ],
  },
  sela_veil: {
    beats: [
      B('Sela', 'sela', 'Que el Velo no es una pared. Es un espejo. Y que cada vez que lo miras, alguien al otro lado paga el precio.'),
      B('Sela', 'sela', 'Por eso no miro. Por eso vendo.'),
    ],
  },
  sela_default: {
    beats: [
      B('Sela', 'sela', '¿Otra vez por aquí? Te guardo lo mejor. Y lo peor, si insistes.'),
      { speaker: 'Sela', portrait: 'sela', text: '¿Compramos?', choices: [
        { text: 'Sí. (Tienda)', next: 'end', actions: [{ shop: 'sela' }] },
        { text: 'Otro día.', next: 'end' },
      ] },
    ],
  },
  elna_intro: {
    beats: [
      B('Elna', 'elna', 'Tienes la mirada de quien ha muerto más de una vez. Aquí tratamos eso con té y vendas.'),
      B('Elna', 'elna', 'Necesito cinco Lirios de Luna para el ritual de los caídos. Crecen cerca del río y en los claros del bosque.'),
      { speaker: 'Elna', portrait: 'elna', text: '¿Me ayudarás?', choices: [
        { text: 'Buscaré los lirios.', next: 'end', actions: [{ quest: 'side_lilies' }] },
        { text: '¿Qué ritual?', next: 'elna_ritual' },
        { text: 'Ahora no.', next: 'end' },
      ] },
    ],
  },
  elna_ritual: {
    beats: [
      B('Elna', 'elna', 'Cada noche encendemos una vela por los que el Velo borró. No sabemos sus nombres. Por eso usamos flores.'),
      B('Elna', 'elna', 'Si alguna vez olvidas quién eres, ven aquí. Te diré lo que recuerdo de ti. Aunque sea poco.'),
    ],
    onEnd: [{ quest: 'side_lilies' }],
  },
  elna_lilies_complete: {
    beats: [
      B('Elna', 'elna', 'Cinco lirios. Huelen a luna y a despedida.'),
      B('Elna', 'elna', 'Encenderé una vela por los que no tienen nombre. Y otra por ti, por si acaso.'),
      B('Elna', 'elna', 'Toma estas pociones. No curan la memoria, pero ayudan a vivir con ella.'),
    ],
    onEnd: [{ removeItem: 'moon_lily', qty: 5 }, { flag: 'lilies' }],
  },
  elna_default: {
    beats: [
      B('Elna', 'elna', 'La salud es un préstamo. Yo solo cobro los intereses.'),
      { speaker: 'Elna', portrait: 'elna', text: '¿Necesitas algo?', choices: [
        { text: 'Cúrame. (10 de oro)', next: 'end', actions: [{ heal: true, gold: -10 }] },
        { text: 'Solo pasaba.', next: 'end' },
      ] },
    ],
  },
  tilo_intro: {
    beats: [
      B('Tilo', 'tilo', '¡La espada brilla! ¿Eres un caballero? Mi madre dice que los caballeros no lloran. Yo lloro mucho.'),
      B('Tilo', 'tilo', 'Vi un Musgo Luminoso llorando cerca del río. Creo que perdió a alguien. ¿Puedes traerme uno?'),
      { speaker: 'Tilo', portrait: 'tilo', text: '¿Me traerás uno?', choices: [
        { text: 'Capturaré uno para ti.', next: 'end', actions: [{ quest: 'side_echo' }] },
        { text: 'Los ecos no son mascotas.', next: 'tilo_no' },
        { text: 'Otro día.', next: 'end' },
      ] },
    ],
  },
  tilo_no: {
    beats: [
      B('Tilo', 'tilo', 'Ya lo sé. Por eso quiero uno. Para que no esté solo.'),
      B('Tilo', 'tilo', 'Si cambias de idea, estaré aquí. O en el pozo. O donde sea que me lleve mi madre.'),
    ],
    onEnd: [{ quest: 'side_echo' }],
  },
  tilo_echo_complete: {
    beats: [
      B('Tilo', 'tilo', '¡Brilla! ¡Brilla de verdad!'),
      B('Tilo', 'tilo', 'No está llorando. Creo que solo estaba esperando a que alguien lo mirara.'),
      B('Tilo', 'tilo', 'Toma este anillo. Lo encontré en el pozo. Dice que da suerte, pero yo creo que solo está muy solo.'),
    ],
    onEnd: [{ flag: 'tilo_echo' }],
  },
  tilo_default: {
    beats: [
      B('Tilo', 'tilo', '¿Sabes qué hay debajo del pozo? Yo creo que otro pozo.'),
      B('Tilo', 'tilo', 'Cuando sea mayor, seré erudito como Lyra. O panadero. Aún no lo decido.'),
    ],
  },
  roderic_intro: {
    beats: [
      B('Roderic', 'roderic', 'La aldea está cerrada por la noche. No porque haya peligro, sino porque la Anciana dice que el peligro se ofende si lo ignoramos.'),
      B('Roderic', 'roderic', 'El Umbral de Drakmor está al este. No cruza nadie sin un Fragmento de Gema. Y no, no acepto sobornos. Acepto historias.'),
    ],
  },
  roderic_gate_locked: {
    beats: [
      B('Roderic', 'roderic', 'El Umbral no cede. La Gema lo sella. Si no llevas un fragmento, el camino te devolverá al mismo sitio.'),
    ],
  },
  gate_locked_drakmor: {
    beats: [
      N('El Umbral de Drakmor está sellado por una luz antigua.'),
      N('Necesitas un Fragmento de la Gema Celestial para cruzarlo.'),
    ],
  },
  gate_locked_kansordore: {
    beats: [
      N('El Umbral de Kansordore está cerrado. La Lágrima de la Primera Brasa debe arder en tu inventario para abrirlo.'),
    ],
  },
  bossdoor_locked_valdoria: {
    beats: [
      N('El sello del Guardián está sellado por tres brasales. La piedra susurra: «primero el que sostiene, luego el que arde, por último el que calla».'),
    ],
  },
  bossdoor_locked_drakmor: {
    beats: [
      N('La puerta de la Fortaleza está cerrada. Dos runas de la forja, una a cada lado del río de lava, esperan ser activadas.'),
    ],
  },
  bossdoor_locked_kansordore: {
    beats: [
      N('El Corazón del Velo está sellado. Tres cristales deben alinearse y tres páginas prohibidas deben ser recuperadas.'),
    ],
  },
  bossdoor_pages_locked: {
    beats: [
      N('Los cristales ya cantan, pero el archivo sigue incompleto. Faltan páginas prohibidas.'),
    ],
  },
  page_1: {
    beats: [
      N('Página I: «El Jugador Cero no es un héroe. Es un mecanismo de reinicio. Cuando el mundo se rompe, se le entrega una espada y una profecía. Si falla, se le olvida y se vuelve a empezar.»'),
    ],
  },
  page_2: {
    beats: [
      N('Página II: «La Gema Celestial se forjó con el corazón del primer mundo. No para protegerlo, sino para que los demás mundos no pudieran recordarlo. La Orden llamó a eso paz.»'),
    ],
  },
  page_3: {
    beats: [
      N('Página III: «La Ascensión no es subir. Es negarse a ser sumado. La Convergencia no es caer. Es aceptar que todos los mundos caben en uno. Ninguna de las dos es una victoria. Ambas son una elección.»'),
    ],
  },
  crystal_hint: {
    beats: [
      B('Vela', 'vela', 'Los cristales responden al orden del archivo: primero el que recuerda, luego el que olvida, por último el que calla.'),
      B('Vela', 'vela', 'Si te equivocas, el archivo se cierra. No es rencor: es costumbre.'),
    ],
  },
  shrine_altar: {
    beats: [
      N('El altar está cubierto de raíces petrificadas. En el centro, una espada sin dueño.'),
      B('Tú', 'player', 'La reconozco. No sé de dónde.'),
      B('La Jarra de Origen', 'jarra', 'Porque la llevaste antes. Siete veces.'),
      N('La espada se enciende. Las raíces se retiran como si recordaran el dolor.'),
      B('La Jarra de Origen', 'jarra', 'Esta vez, no la uses para cerrar el mundo. Úsala para abrirlo.'),
      N('Has obtenido la Espada Celestial.'),
    ],
    onEnd: [{ item: 'celestial_sword', qty: 1, equip: true }, { flag: 'got_celestial_sword' }, { flag: 'shrine_done' }, { ambush: 'wraith', count: 3 }, { xp: 100 }],
  },
  guardian_intro: {
    beats: [
      N('Las raíces se separan. Algo enorme respira debajo de las ruinas.'),
      B('Guardián de Raíces', 'guardian', 'SÉPTIMO... OCTAVO... NO HAY DIFERENCIA.'),
      B('Guardián de Raíces', 'guardian', 'ME PROMETIERON QUE EL BOSQUE NO ARDERÍA. ME PROMETIERON QUE ELLA VOLVERÍA.'),
      B('Tú', 'player', '¿Quién?'),
      B('Guardián de Raíces', 'guardian', 'LA QUE ME HIZO GUARDIÁN. LA QUE AHORA TE ESPERA EN EL FUEGO.'),
    ],
  },
  guardian_defeat: {
    beats: [
      B('Guardián de Raíces', 'guardian', '...gracias... por recordar... mi nombre...'),
      N('El Guardián se deshace en raíces y luz. Entre ellas, un fragmento de la Gema Celestial.'),
      B('Lyra', 'lyra', 'No era un monstruo. Era un juramento con raíces.'),
      B('Tú', 'player', 'La Dama de la Brasa. Él dijo que me espera.'),
      B('Lyra', 'lyra', 'Entonces Drakmor es el siguiente paso. Y la Lágrima, la siguiente pregunta.'),
    ],
    onEnd: [{ item: 'gem_shard', qty: 1 }, { flag: 'gem1' }, { xp: 150 }],
  },

  // ─── DRAKMOR ────────────────────────────────────────────────────────────
  kael_intro: {
    beats: [
      B('Kael', 'kael', 'Así que la espada eligió a otro. Bien. Yo ya no sirvo para eso.'),
      B('Tú', 'player', '¿Eres de la Orden Celestial?'),
      B('Kael', 'kael', 'Fui. Ahora soy lo que queda de un juramento mal traducido.'),
      B('Kael', 'kael', 'La Dama de la Brasa está en la Fortaleza de Cendra. La Lágrima de la Primera Brasa late en su pecho. Los de mi Orden intentaron arrancársela para rehacer la Gema. Ella los convirtió en ceniza.'),
      B('Kael', 'kael', 'Si vas a por ella, no la trates como un monstruo. Trátala como una pregunta.'),
      { speaker: 'Tú', portrait: 'player', text: '¿Y cómo abro la Fortaleza?', choices: [
        { text: '¿Por qué caíste, Kael?', next: 'kael_past' },
        { text: 'Activaré las runas.', next: 'kael_runes' },
      ] },
    ],
    onEnd: [{ flag: 'kael_met' }, { quest: 'side_survivors' }],
  },
  kael_past: {
    beats: [
      B('Kael', 'kael', 'Porque obedecí. La Orden dijo que la Dama era una amenaza. Yo no pregunté. Cuando vi lo que hicimos, ya era tarde para ser otra cosa que un hombre con armadura.'),
      B('Kael', 'kael', 'Si encuentras a los supervivientes, diles que sigo aquí. No para salvarlos. Para recordarlos.'),
    ],
    onEnd: [{ flag: 'kael_past' }],
  },
  kael_runes: {
    beats: [
      B('Kael', 'kael', 'Dos Runas de la Forja. Una al oeste del río de lava, otra al este. Actívalas y el sello de la Fortaleza se abrirá.'),
      B('Kael', 'kael', 'Y si ves a mis hermanos dentro... no les tengas piedad. Ellos ya no se la tienen a sí mismos.'),
    ],
  },
  kael_survivors_complete: {
    beats: [
      B('Kael', 'kael', 'Cuatro marcas. Cuatro nombres.'),
      B('Kael', 'kael', 'Pensé que la culpa era un peso. Ahora sé que es una lista. Gracias por ayudarme a terminarla.'),
      B('Kael', 'kael', 'Cuando llegue el momento, estaré a tu lado. No como caballero. Como testigo.'),
    ],
    onEnd: [{ flag: 'survivors' }, { flag: 'kael_trust' }],
  },
  kael_default: {
    beats: [
      B('Kael', 'kael', 'La ceniza no olvida. Solo deja de arder.'),
      B('Kael', 'kael', 'Cuando llegues a Kansordore, busca la Biblioteca. Allí está la versión de la historia que la Orden no pudo quemar.'),
    ],
  },
  nira_intro: {
    beats: [
      B('Nira', 'nira', '¿Compras o vendes? Si es lo segundo, no me cuentes la historia del objeto. Ya la sé. Todos los objetos de Drakmor tienen la misma historia.'),
      B('Nira', 'nira', 'Los golems tienen núcleos de obsidiana que valen una fortuna. Si me traes cinco, te pago. No preguntes para qué.'),
      { speaker: 'Nira', portrait: 'nira', text: '¿Trato?', choices: [
        { text: 'Acepto. (Misión)', next: 'end', actions: [{ quest: 'side_obsidian' }] },
        { text: 'Muestra tu mercancía. (Tienda)', next: 'end', actions: [{ shop: 'nira' }] },
        { text: 'Solo miro.', next: 'end' },
      ] },
    ],
  },
  nira_golems_complete: {
    beats: [
      B('Nira', 'nira', 'Cinco núcleos. Aún tibios. Me gustan.'),
      B('Nira', 'nira', 'Aquí tienes tu pago. Y un consejo gratis: no confíes en nadie que te sonría en Drakmor. Ni siquiera en mí.'),
    ],
    onEnd: [{ flag: 'nira_paid' }],
  },
  nira_default: {
    beats: [
      B('Nira', 'nira', 'La ceniza de hoy es el oro de mañana. O el veneno. Depende de la dosis.'),
      { speaker: 'Nira', portrait: 'nira', text: '¿Compramos?', choices: [
        { text: 'Sí. (Tienda)', next: 'end', actions: [{ shop: 'nira' }] },
        { text: 'No.', next: 'end' },
      ] },
    ],
  },
  survivor1: {
    beats: [
      B('Superviviente', 'survivor', '¿Kael te envía? Dile que el bosque no ardió. Se lo comió el humo.'),
      B('Superviviente', 'survivor', 'Toma mi marca. Cuatro muescas. Una por cada noche que sobreviví.'),
    ],
    onEnd: [{ flag: 'survivor1' }, { item: 'survivor_token', qty: 1 }],
  },
  survivor2: {
    beats: [
      B('Superviviente', 'survivor', 'La forja sigue caliente. Siempre caliente. La Dama no la apagó: la dejó para que recordáramos lo que perdimos.'),
      B('Superviviente', 'survivor', 'Si la ves, dile que no la culpo. Ella también perdió algo.'),
    ],
    onEnd: [{ flag: 'survivor2' }, { item: 'survivor_token', qty: 1 }],
  },
  survivor3: {
    beats: [
      B('Superviviente', 'survivor', 'Vi el Velo una vez. No era una pared. Era una puerta. Y alguien llamaba desde el otro lado con mi voz.'),
      B('Superviviente', 'survivor', 'No la abrí. Por eso sigo aquí.'),
    ],
    onEnd: [{ flag: 'survivor3' }, { item: 'survivor_token', qty: 1 }],
  },
  survivor4: {
    beats: [
      B('Superviviente', 'survivor', 'La muralla aguantó. Nosotros no.'),
      B('Superviviente', 'survivor', 'Dile a Kael que su juramento no estaba equivocado. Solo estaba solo.'),
    ],
    onEnd: [{ flag: 'survivor4' }, { item: 'survivor_token', qty: 1 }],
  },
  dama_intro: {
    beats: [
      N('La Fortaleza respira calor. En el centro, una mujer hecha de brasas sostiene una gota de luz.'),
      B('Dama de la Brasa', 'dama', 'Has venido a por mi corazón. Como ellos.'),
      B('Tú', 'player', 'No he venido a por tu corazón.'),
      B('Dama de la Brasa', 'dama', 'Todos dicen eso. Luego ven la Lágrima y olvidan la frase.'),
      B('Dama de la Brasa', 'dama', 'Si quieres la Lágrima, demuéstrame que puedes cargar con lo que significa.'),
    ],
  },
  dama_yield: {
    beats: [
      N('La Dama cae de rodillas. La Lágrima flota entre sus manos, palpitando.'),
      B('Dama de la Brasa', 'dama', 'Puedes tomarla. Es lo que haría un héroe.'),
      B('Dama de la Brasa', 'dama', 'O puedes pedírmela. Es lo que haría alguien que aún recuerda.'),
      { speaker: 'Tú', portrait: 'player', text: '¿Qué hago?', choices: [
        { text: 'Tomar la Lágrima.', next: 'dama_take', actions: [{ flag: 'took_dama' }, { flag: 'dama-choice' }] },
        { text: 'Pedírtela.', next: 'dama_spare', actions: [{ flag: 'spared_dama' }, { flag: 'dama-choice' }] },
      ] },
    ],
  },
  dama_take: {
    beats: [
      B('Dama de la Brasa', 'dama', 'Entonces llévate mi calor. Y aprende lo que yo aprendí demasiado tarde: el fuego no pide permiso.'),
      N('La Lágrima se apaga entre tus dedos. En su lugar queda un filo que huele a primer día.'),
      B('Kael', 'kael', 'La has tomado. Espero que sepas cargar con ella.'),
      B('Tú', 'player', 'No lo sé. Pero lo intentaré.'),
    ],
    onEnd: [{ item: 'first_tear', qty: 1 }, { item: 'first_flame', qty: 1, equip: true }, { xp: 200 }],
  },
  dama_spare: {
    beats: [
      B('Dama de la Brasa', 'dama', 'Entonces no eres como ellos. Aún no.'),
      B('Dama de la Brasa', 'dama', 'Toma mi calor, no mi corazón. La Lágrima es tuya. Y cuando el Velo te pida que elijas, recuerda que yo elegí no arder sola.'),
      N('La Dama te entrega la Lágrima. Su fuego se vuelve ámbar, más suave.'),
      B('Kael', 'kael', 'Le has dado una elección. Eso es más de lo que la Orden le dio nunca.'),
    ],
    onEnd: [{ item: 'first_tear', qty: 1 }, { item: 'first_flame', qty: 1, equip: true }, { item: 'ember_pendant', qty: 1 }, { xp: 250 }, { flag: 'dama_ally' }],
  },
  kael_after_dama: {
    beats: [
      B('Kael', 'kael', 'La Lágrima está en tus manos. No la uses para reconstruir la Gema. La Gema ya no es el problema.'),
      B('Kael', 'kael', 'El Velo te espera en Kansordore. Yo iré contigo. No para luchar. Para recordarte quién eres si lo olvidas.'),
    ],
    onEnd: [{ flag: 'kael_ally' }],
  },

  // ─── KANSORDORE ─────────────────────────────────────────────────────────
  aurel_intro: {
    beats: [
      B('Aurel', 'aurel', 'Te conozco por el hueco que dejas. Bienvenido, Jugador Cero.'),
      B('Tú', 'player', 'Todos me llaman así. ¿Qué significa?'),
      B('Aurel', 'aurel', 'Que el mundo es un tablero y tú eres la pieza que puede negarse a jugar. Las siete versiones anteriores también lo intentaron.'),
      B('Aurel', 'aurel', 'La Gema Celestial era una cerradura. El Velo es la puerta. Y la Convergencia es lo que pasa cuando alguien decide que ya no quiere más puertas.'),
      { speaker: 'Tú', portrait: 'player', text: '¿Qué debo hacer?', choices: [
        { text: '¿Quién es el Velo?', next: 'aurel_veil' },
        { text: '¿Qué es la Ascensión?', next: 'aurel_ascension' },
        { text: 'Entraré en la Biblioteca.', next: 'aurel_accept' },
      ] },
    ],
    onEnd: [{ flag: 'aurel_met' }],
  },
  aurel_veil: {
    beats: [
      B('Aurel', 'aurel', 'El Velo es el octavo. El que se negó a sostener la Gema. El que entendió que cerrar el mundo para salvarlo era otra forma de matarlo.'),
      B('Aurel', 'aurel', 'Se llamaba Cero. Ahora es la puerta que todos temen. Y también eres tú, en la versión que decidió quedarse.'),
      B('Tú', 'player', 'Entonces tengo que matarme.'),
      B('Aurel', 'aurel', 'No. Tienes que elegir algo que yo no puedo elegir por ti.'),
    ],
  },
  aurel_ascension: {
    beats: [
      B('Aurel', 'aurel', 'La Ascensión es lo que ocurre cuando un mundo se niega a ser sumado. No es una victoria. Es una despedida.'),
      B('Aurel', 'aurel', 'La Convergencia Absoluta es la otra cara: todos los mundos se recuerdan a la vez. Nadie gana. Nadie pierde. Todo cambia.'),
      B('Tú', 'player', '¿Y tú qué eres?'),
      B('Aurel', 'aurel', 'El eco que la Jarra dejó al despertar. Un recuerdo con forma de zorro.'),
    ],
  },
  aurel_accept: {
    beats: [
      B('Aurel', 'aurel', 'La Biblioteca Prohibida está al noreste. Vela te espera. Los cristales abren el archivo; las páginas abren la verdad.'),
      B('Aurel', 'aurel', 'Cuando llegues al Corazón del Velo, no lleves prisa. Lleva una pregunta.'),
    ],
    onEnd: [{ quest: 'side_balance' }],
  },
  aurel_default: {
    beats: [
      B('Aurel', 'aurel', 'El tiempo no es un río. Es una jarra. Alguien lo vierte y alguien lo bebe.'),
      B('Aurel', 'aurel', 'Si te pierdes, busca el eco de tu nombre. Yo lo guardo por si acaso.'),
    ],
  },
  vela_intro: {
    beats: [
      B('Vela', 'vela', 'Silencio. Los libros duermen. Y algunos sueñan con quemarse.'),
      B('Vela', 'vela', 'Soy Vela. Custodio la Biblioteca Prohibida. No porque sea peligrosa, sino porque la verdad tiene mal genio.'),
      B('Vela', 'vela', 'Los tres cristales alinean el archivo. Las tres páginas que faltan están esparcidas por Kansordore. Tráelas y te contaré lo que la Orden no pudo quemar.'),
      { speaker: 'Vela', portrait: 'vela', text: '¿Empezamos?', choices: [
        { text: '¿Qué es la Convergencia?', next: 'vela_convergence' },
        { text: 'Buscaré las páginas.', next: 'end' },
      ] },
    ],
  },
  vela_convergence: {
    beats: [
      B('Vela', 'vela', 'Una suma. Cada mundo conserva lo que recuerda y pierde lo que olvida. Si dos mundos se suman, el que recuerda más gana.'),
      B('Vela', 'vela', 'La Orden creó el Velo para que Kansordore no fuera sumado. Y el Velo, al crecer, empezó a sumar por su cuenta.'),
      B('Vela', 'vela', 'Ahora la pregunta no es cómo detenerlo. Es qué versión del mundo merece sobrevivir.'),
    ],
  },
  vela_default: {
    beats: [
      B('Vela', 'vela', 'Las páginas prohibidas no están escritas. Se escriben cuando las lees. Por eso duelen.'),
      B('Vela', 'vela', 'El jardín imposible está al sur. Si los Serafines lo queman, perderemos las últimas semillas de un mundo que ya no existe.'),
    ],
  },
  vela_garden: {
    beats: [
      B('Vela', 'vela', 'El jardín respira. Gracias.'),
      B('Vela', 'vela', 'Toma estas plumas. Cayeron del cielo que la Orden borró. No sirven para volar. Sirven para recordar que hubo cielo.'),
    ],
    onEnd: [{ item: 'celestial_plume', qty: 2 }],
  },
  echo_final: {
    beats: [
      B('Eco', 'echo', 'Hola. Otra vez.'),
      B('Tú', 'player', '¿Eres yo?'),
      B('Eco', 'echo', 'Soy la versión que se quedó. La que eligió el Velo porque no soportaba perder otra vez.'),
      B('Eco', 'echo', 'Puedes odiarme. Yo también me odio. Pero antes de entrar, dime: ¿qué vas a elegir tú?'),
      { speaker: 'Tú', portrait: 'player', text: 'Aún no lo sé.', choices: [
        { text: 'Elegiré algo nuevo.', next: 'echo_new' },
        { text: 'No lo sé. Pero no me rendiré.', next: 'echo_new' },
      ] },
    ],
  },
  echo_new: {
    beats: [
      B('Eco', 'echo', 'Eso es lo que dijo la séptima.'),
      B('Eco', 'echo', 'Ojalá esta vez sea verdad.'),
    ],
  },
  veil_intro: {
    beats: [
      N('El Corazón del Velo no late. Escucha.'),
      B('El Velo', 'veil', 'Otra vez. Siempre otra vez.'),
      B('Tú', 'player', '¿Eres Cero?'),
      B('El Velo', 'veil', 'Fui. Ahora soy lo que queda cuando un hombre decide que el mundo no merece otra oportunidad.'),
      B('El Velo', 'veil', 'Cada ciclo, tú me matas. Cada ciclo, yo vuelvo. La Convergencia no es mi castigo: es mi paciencia.'),
      B('El Velo', 'veil', 'Si quieres terminar esto, demuéstrame que puedes elegir algo que yo no haya previsto.'),
    ],
  },
  veil_defeat: {
    beats: [
      N('El Velo se deshace en reflejos. Por primera vez, el silencio tiene forma de persona.'),
      B('El Velo', 'veil', 'Bien. Has ganado. Otra vez.'),
      B('Tú', 'player', 'No he venido a ganar. He venido a elegir.'),
      B('El Velo', 'veil', 'Entonces elige. Restaurar el Velo y dejar que el mundo olvide. Romperlo y dejar que los mundos se devoren. O la Convergencia Absoluta: convertirte en la puerta.'),
      B('El Velo', 'veil', 'Las tres son dolorosas. Las tres son tuyas.'),
      { speaker: 'Tú', portrait: 'player', text: 'Elijo...', choices: [
        { text: 'Restaurar el Velo.', next: 'end', actions: [{ ending: 'restore' }] },
        { text: 'Romper el Velo.', next: 'end', actions: [{ ending: 'break' }] },
        { text: 'La Convergencia Absoluta.', next: 'end', actions: [{ ending: 'converge' }] },
      ] },
    ],
    onEnd: [{ flag: 'veil_defeated' }],
  },
};

export const ENDINGS = {
  restore: {
    id: 'restore', title: 'EL VELO RESTAURADO', subtitle: 'El mundo que eligió olvidar',
    color: '#9fe8ff', music: 'ending',
    lines: [
      'La Gema vuelve a cerrarse. El Velo se aquieta. Los cielos de Valdoria, Drakmor y Kansordore se separan como páginas de un libro que nadie termina de leer.',
      'Lyra te mira y sonríe. Al día siguiente, no recuerda tu nombre. Nadie lo recuerda. El mundo sigue, limpio y liviano, sin la herida de saber.',
      'Dejas la Espada Celestial en el altar del Santuario. Cuando la encuentre la próxima versión de ti, el ciclo volverá a empezar. Pero esta vez, al menos, alguien dejó una nota.',
      '«No elijas lo que te digan. Elige lo que puedas mirar a los ojos.»',
    ],
    epilogue: 'El Velo resiste. La memoria se apaga. La esperanza, por ahora, también.',
  },
  break: {
    id: 'break', title: 'EL VELO ROTO', subtitle: 'El mundo que eligió recordar',
    color: '#ffcf6a', music: 'ending',
    lines: [
      'La Espada Celestial atraviesa la puerta. El Velo se rompe como un espejo que llevaba demasiado tiempo conteniendo una habitación.',
      'Los mundos se derraman unos sobre otros. Los árboles de Valdoria crecen en las calles de Kansordore. La lava de Drakmor se convierte en ríos de cristal. Nadie sabe qué viene después.',
      'Lyra ríe, asustada y viva. Kael clava su espada en la tierra nueva y jura proteger lo que quede. La Dama de la Brasa enciende la primera hoguera de la era siguiente.',
      'No hay profecía para esto. Por primera vez, el futuro no está escrito. Es tuyo.',
    ],
    epilogue: 'El Velo cae. Los mundos se tocan. La Ascensión comienza.',
  },
  converge: {
    id: 'converge', title: 'LA CONVERGENCIA ABSOLUTA', subtitle: 'El mundo que eligió recordarse',
    color: '#c7a4ff', music: 'ending',
    lines: [
      'No rompes el Velo. Te metes dentro. La Espada Celestial se convierte en una aguja de luz y tú en el hilo.',
      'Todos los mundos se recuerdan a la vez. Valdoria recuerda haber sido Kansordore. Drakmor recuerda haber sido un bosque. Tú recuerdas las siete vidas anteriores y todas las que no llegaste a vivir.',
      'La Convergencia no borra a nadie. Los suma. Lyra sigue siendo Lyra, pero también es la niña que fuiste, la anciana que serás y la voz que llama desde el otro lado del Velo.',
      'Te conviertes en la puerta. No en un dios, ni en un monstruo: en la memoria que sostiene a los mundos para que no se olviden entre sí.',
      'Y en el centro de todo, una espada sigue brillando. Esperando a la próxima versión de ti, que ya no tendrá que empezar sola.',
    ],
    epilogue: 'La Convergencia se completa. Todos los mundos, por fin, se recuerdan.',
  },
};

export function getNpcScript(npcId, game) {
  const q = game.quests;
  const flags = game.player.flags;
  const has = (id, qty = 1) => game.inventory.count(id) >= qty;
  switch (npcId) {
    case 'maren':
      if (q.isActive('main_roots')) return flags['val-puzzle'] ? 'maren_default' : 'maren_hint_ruins';
      if (q.isCompleted('main_roots')) return flags['maren_truth'] ? 'maren_default' : 'maren_after_guardian';
      if (q.isActive('main_shrine')) return 'maren_shrine_hint';
      if (!q.isCompleted('main_awakening')) return 'maren_intro';
      return 'maren_default';
    case 'lyra':
      if (q.isActive('main_shrine') && flags['shrine_done']) return 'lyra_shrine';
      if (q.isActive('main_roots') && !flags['val-puzzle']) return 'lyra_ruins';
      return 'lyra_default';
    case 'orin':
      if (q.isActive('side_hammer') && has('orin_hammer')) return 'orin_return_hammer';
      if (!q.isCompleted('side_hammer') && !q.isActive('side_hammer')) return 'orin_intro';
      return 'orin_default';
    case 'sela': return q.isCompleted('main_awakening') ? 'sela_default' : 'sela_intro';
    case 'elna':
      if (q.isActive('side_lilies') && q.stageIndex('side_lilies') === 1) return 'elna_lilies_complete';
      if (q.isCompleted('side_lilies')) return 'elna_default';
      return 'elna_intro';
    case 'tilo':
      if (q.isActive('side_echo') && q.stageIndex('side_echo') === 1) return 'tilo_echo_complete';
      if (q.isCompleted('side_echo')) return 'tilo_default';
      return 'tilo_intro';
    case 'roderic': return flags['gem1'] ? 'roderic_intro' : 'roderic_gate_locked';
    case 'kael':
      if (q.isActive('side_survivors') && q.stageIndex('side_survivors') === 1) return 'kael_survivors_complete';
      if (q.isActive('main_drakmor') && flags['dama-choice']) return 'kael_after_dama';
      if (!flags['kael_met']) return 'kael_intro';
      return 'kael_default';
    case 'nira':
      if (q.isActive('side_obsidian') && q.stageIndex('side_obsidian') === 1) return 'nira_golems_complete';
      return 'nira_intro';
    case 'survivor1': return 'survivor1';
    case 'survivor2': return 'survivor2';
    case 'survivor3': return 'survivor3';
    case 'survivor4': return 'survivor4';
    case 'aurel':
      if (q.isActive('side_balance') && q.stageIndex('side_balance') === 1) return 'aurel_balance';
      if (!flags['aurel_met']) return 'aurel_intro';
      return 'aurel_default';
    case 'vela':
      if (q.isActive('side_garden') && q.stageIndex('side_garden') === 1) return 'vela_garden';
      return 'vela_intro';
    case 'echo': return 'echo_final';
    default: return null;
  }
}

// La balanza de Aurel se resuelve en un diálogo aparte.
SCRIPTS.aurel_balance = {
  beats: [
    B('Aurel', 'aurel', 'Traes tres esencias. Puedo devolverlas al ciclo y darte suerte, o puedes conservarlas y darte fuerza.'),
    { speaker: 'Aurel', portrait: 'aurel', text: '¿Qué pesa más?', choices: [
      { text: 'Devuélvelas al ciclo.', next: 'end', actions: [{ removeItem: 'resonance_essence', qty: 3 }, { item: 'lucky_charm', qty: 1 }, { flag: 'balance_luck' }] },
      { text: 'Las conservo.', next: 'end', actions: [{ item: 'resonance_ring', qty: 1 }, { flag: 'balance_keep' }] },
    ] },
  ],
  onEnd: [{ flag: 'balance' }],
};
