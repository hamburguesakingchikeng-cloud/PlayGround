// Árboles de diálogo de La Espada Celestial.
// Cada nodo: { text, speaker?, role?, choices?, next?, act? }
// to: nodo | función | 'close'. act se ejecuta al elegir.

const N = (text, extra = {}) => ({ text, ...extra })
const C = (label, to, act, extra = {}) => ({ label, to, act, ...extra })

function has(g, id) { return g.quests.isActive(id) }
function done(g, id) { return g.quests.isComplete(id) }
function just(g, id) { return g.quests.wasJustCompleted(id) }

// ───────────────────────────── IRIA ─────────────────────────────
function iria(g) {
  const q = g.quests
  if (has(g, 'despertar')) {
    const askSword = N('Esta hoja es un fragmento de la Gema Celestial, la primera cosa que existió antes de que existiera el tiempo. El Velo la partió en tres: una hoja, una jarra y una lágrima. Tú llevas la hoja. No por casualidad.', {
      speaker: 'Anciana Iria', role: 'Memoria de Valdoria',
      choices: [
        C('¿Qué es el Velo?', N('La membrana entre lo que es y lo que podría ser. Cuando adelgaza, los recuerdos se caen de las cosas y las criaturas olvidan su nombre. Por eso los corrompidos ya no saben que fueron personas.', {
          speaker: 'Anciana Iria', role: 'Memoria de Valdoria',
          choices: [C('¿Y la profecía?', N('Habla de un Jugador Cero: alguien de fuera de la historia que puede volver a empezar. Durante siglos hemos esperado a un héroe. Quizá nos equivocamos de palabra.', {
            speaker: 'Anciana Iria', role: 'Memoria de Valdoria',
            next: () => iriaAccept(g)
          }))]
        })),
        C('¿Quién soy yo?', N('No lo sé. Y esa es la primera cosa honesta que puedo decirte. Te encontré en la orilla con el agua en los pulmones y la espada brillando como si te reconociera. Elegiste un nombre al despertar. Ahora tendrás que elegir lo demás.', {
          speaker: 'Anciana Iria', role: 'Memoria de Valdoria',
          next: () => iriaAccept(g)
        })),
        C('No quiero ser un héroe.', N('Nadie quiere. Los héroes son quienes se levantan después de la duda, no quienes nunca la tuvieron. Quédate un día. Si el río vuelve a llamarte, sabrás qué hacer.', {
          speaker: 'Anciana Iria', role: 'Memoria de Valdoria',
          next: () => iriaAccept(g)
        }))
      ]
    })
    return askSword
  }
  if (just(g, 'sombras_ribera')) {
    return N('Los corrompidos han retrocedido, pero no están derrotados. Alguien los llamó desde las ruinas, y ese alguien lleva mil años esperando. Antes de que vayas, busca a Nara en el bosque de Lumen. Ella enseña a escuchar lo que las criaturas esconden.', {
      speaker: 'Anciana Iria', role: 'Memoria de Valdoria',
      choices: [
        C('¿Qué hay en las ruinas?', N('La Jarra de Origen. El primer recuerdo del mundo, guardado en barro que nunca se secó. Y bajo ella, un guardián que no distingue entre proteger y aprisionar. Lleva luz. Lleva paciencia. Lleva a alguien contigo.', {
          speaker: 'Anciana Iria', role: 'Memoria de Valdoria', next: 'close'
        })),
        C('Iré a ver a Nara.', 'close')
      ]
    })
  }
  if (has(g, 'don_resonancia')) {
    return N('Nara te espera en el bosque, al norte. No vayas con la espada desenvainada. Las criaturas huelen el miedo y la prisa. Y tú, criatura mía, hueles a las dos cosas.', {
      speaker: 'Anciana Iria', role: 'Memoria de Valdoria', next: 'close'
    })
  }
  if (just(g, 'don_resonancia')) {
    return N('Un vínculo verdadero. Ya no estás solo en este mundo. Las ruinas de Vael aguardan al oeste, entre los árboles retorcidos. Enciende sus tres braseros: la Jarra solo responde a la luz que se ofrece, no a la que se roba.', {
      speaker: 'Anciana Iria', role: 'Memoria de Valdoria',
      choices: [
        C('¿Qué ocurrirá cuando la tenga?', N('El Velo temblará. Drakmor lo sentirá antes que nosotros. Y tú tendrás que decidir si la Jarra es un recuerdo que se guarda o una puerta que se abre. Yo ya no puedo decidir por ti.', {
          speaker: 'Anciana Iria', role: 'Memoria de Valdoria', next: 'close'
        })),
        C('Parto hacia Vael.', 'close')
      ]
    })
  }
  if (has(g, 'ruinas_vael')) {
    return N('Los braseros de Vael llevan siglos apagados. La luz de tu espada puede despertarlos. Y cuando lo hagas, no huyas de lo que salga de la tierra: escúchalo. Hasta los guardianes tienen una razón.', {
      speaker: 'Anciana Iria', role: 'Memoria de Valdoria', next: 'close'
    })
  }
  if (just(g, 'ruinas_vael') || g.flags.jar_obtained) {
    return N('La Jarra de Origen. La sostienes como si pesara, pero no pesa: recuerda. Escucha su agua cuando el mundo se quede en silencio. Y ve al este, a la Puerta de Ceniza. Drakmor arde, y el fuego tiene memoria.', {
      speaker: 'Anciana Iria', role: 'Memoria de Valdoria',
      choices: [
        C('¿Vendrás conmigo?', N('Mi lugar es este umbral. Alguien tiene que recordar a los que no vuelven. Pero estaré aquí cuando regreses, aunque el Velo intente convencerme de lo contrario.', {
          speaker: 'Anciana Iria', role: 'Memoria de Valdoria', next: 'close'
        })),
        C('Cuida de Alda hasta mi regreso.', 'close')
      ]
    })
  }
  if (has(g, 'puerta_ceniza')) {
    return N('La Puerta de Ceniza está al este, más allá de la colina del vigía. No es una puerta que se cruce: es una puerta que se recuerda. Lleva la Jarra en alto y el camino aparecerá.', {
      speaker: 'Anciana Iria', role: 'Memoria de Valdoria', next: 'close'
    })
  }
  return N('El río sigue cantando, aunque ya nadie recuerde la letra. Descansa cuando lo necesites. La espada no te pide que corras: te pide que vuelvas.', {
    speaker: 'Anciana Iria', role: 'Memoria de Valdoria',
    choices: [
      C('Háblame de la Gema Celestial.', N('Antes de los reinos, antes de los nombres, hubo una gema que contenía todas las posibilidades. Un día se miró a sí misma y quiso saber qué se sentía al elegir. Se rompió. Todo lo demás es la consecuencia.', {
        speaker: 'Anciana Iria', role: 'Memoria de Valdoria', next: 'close'
      })),
      C('Háblame del Jugador Cero.', N('Una figura de la profecía que no pertenece a ningún linaje. No nace: aparece. No hereda: elige. Algunos dicen que es un castigo. Yo creo que es la única forma en que el mundo puede perdonarse.', {
        speaker: 'Anciana Iria', role: 'Memoria de Valdoria', next: 'close'
      })),
      C('Descansar.', 'close')
    ]
  })
}

function iriaAccept(g) {
  return N('Entonces escucha. Los corrompidos están cruzando el río al sur de la aldea. Deténlos, y después vuelve. No para recibir una recompensa: para que sepas que puedes volver.', {
    speaker: 'Anciana Iria', role: 'Memoria de Valdoria',
    choices: [
      C('Lo haré.', 'close', () => { g.quests.start('sombras_ribera'); }),
      C('Primero necesito prepararme.', 'close')
    ]
  })
}

// ───────────────────────────── NARA ─────────────────────────────
function nara(g) {
  if (has(g, 'don_resonancia')) {
    const step = g.quests.stepIndex('don_resonancia')
    if (step <= 0) {
      return N('No mates a la criatura. Ya sé que la espada te lo pide. Las espadas siempre piden lo fácil. Déjala débil, pero viva, y ofrecele tu mano. Si acepta, la luz de tu pecho cambiará de color un instante.', {
        speaker: 'Nara', role: 'Cazadora de ecos',
        choices: [
          C('¿Cómo sé cuándo está débil?', N('Cuando su nombre brille en tu mente. Cuando la barra de vida esté por debajo de un tercio, pulsa el vínculo. Si falla, no insistas como un ladrón: espera, vuelve a intentarlo. La confianza también tiene enfriamiento.', {
            speaker: 'Nara', role: 'Cazadora de ecos', next: 'close'
          })),
          C('¿Y si no quiere venir?', N('Entonces no viene. Un vínculo forzado es una jaula con otro nombre. Pero no te preocupes: casi todas las criaturas están cansadas de estar solas. Como nosotros.', {
            speaker: 'Nara', role: 'Cazadora de ecos', next: 'close'
          }))
        ]
      })
    }
    if (step === 1) {
      return N('Ve a por una. Las Lumifín duermen bajo los sauces, al este del claro. No corras hacia ellas: camina. Y cuando la captures, vuelve. Quiero ver la cara que pones.', {
        speaker: 'Nara', role: 'Cazadora de ecos', next: 'close'
      })
    }
  }
  if (just(g, 'don_resonancia') || (done(g, 'don_resonancia') && !g.flags.nara_bond)) {
    g.flags.nara_bond = true
    return N('No has domesticado una criatura. Has aceptado que otra vida importe más que tu prisa. Eso, forastero, es la primera lección de la Resonancia. La segunda la aprenderás cuando tengas que despedirte de ella.', {
      speaker: 'Nara', role: 'Cazadora de ecos',
      choices: [
        C('¿Las criaturas mueren?', N('Todo muere. Pero un vínculo deja un eco, y los ecos encuentran el camino de vuelta. Por eso el Velo tiene miedo de nosotros: no puede borrar lo que se comparte.', {
          speaker: 'Nara', role: 'Cazadora de ecos', next: 'close'
        })),
        C('Gracias, Nara.', 'close')
      ]
    })
  }
  if (!g.quests.isActive('cazador_ecos') && !done(g, 'cazador_ecos') && (done(g, 'don_resonancia') || g.flags.nara_bond)) {
    return N('Tengo un encargo para ti, si te atreves. Tres criaturas distintas, tres vínculos. No por coleccionar: por demostrar que puedes escuchar más de una canción sin desafinar.', {
      speaker: 'Nara', role: 'Cazadora de ecos',
      choices: [
        C('Acepto el desafío.', 'close', () => { g.quests.start('cazador_ecos'); }),
        C('Más adelante.', 'close')
      ]
    })
  }
  if (has(g, 'cazador_ecos')) {
    const n = g.quests.stepProgress('cazador_ecos', 0)
    return N(`${n >= 3 ? 'Tres canciones distintas. Lo sabía.' : `${n} de tres. Sigue escuchando.`} Las criaturas no son armas. Son testigos de lo que el Velo intenta borrar. Cuídalas y ellas te cuidarán cuando la espada no baste.`, {
      speaker: 'Nara', role: 'Cazadora de ecos', next: 'close'
    })
  }
  return N('El bosque está inquieto. Las Lumifín cantan en frecuencias que los humanos no oímos, pero tú no eres del todo humano, ¿verdad? Si alguna vez quieres saber qué eres, pregúntale a las criaturas. Ellas recuerdan más de lo que admiten.', {
    speaker: 'Nara', role: 'Cazadora de ecos',
    choices: [
      C('¿Conoces la Profecía de Jugador Cero?', N('Mi abuela la recitaba como una canción de cuna. «El que no tiene nombre elegirá el final; el que tiene nombre lo vivirá». Nunca supe si era una promesa o una advertencia.', {
        speaker: 'Nara', role: 'Cazadora de ecos', next: 'close'
      })),
      C('Adiós.', 'close')
    ]
  })
}

// ───────────────────────────── TOVIN ─────────────────────────────
function tovin(g) {
  if (!g.quests.isActive('espada_rota') && !done(g, 'espada_rota')) {
    return N('¡Tú! El de la espada que no debería existir. Esa hoja tiene más años que Valdoria y menos filo que una cuchara. Tráeme tres fragmentos de Hierro Estelar y te forjaré algo que no dé vergüenza. Las vetas brillan junto a las rocas viejas.', {
      speaker: 'Tovin', role: 'Herrero de Alda',
      choices: [
        C('Acepto. Necesito un filo mejor.', 'close', () => { g.quests.start('espada_rota'); }),
        C('¿No puedes usar hierro normal?', N('Puedo. Y también puedo coser una herida con hilo de pescar. El hierro estelar canta cuando lo golpeas. Lo normal solo grita.', {
          speaker: 'Tovin', role: 'Herrero de Alda',
          choices: [C('Buscaré tres fragmentos.', 'close', () => { g.quests.start('espada_rota'); })]
        })),
        C('Ahora no.', 'close')
      ]
    })
  }
  if (has(g, 'espada_rota')) {
    const n = g.inventoryCount('hierro_estelar')
    if (n < 3) return N(`Te faltan ${3 - n} fragmentos de Hierro Estelar. Mira cerca de las rocas antiguas, en las ruinas y en los cofres. Y no los vendas. Lo digo por experiencia.`, { speaker: 'Tovin', role: 'Herrero de Alda', next: 'close' })
    return N('Tres fragmentos. Pesan más de lo que parecen, ¿eh? Dame un momento. *golpea el yunque siete veces* No es superstición: son los siete nombres de la Gema. Ya está. Esto es una espada, no una reliquia oxidada.', {
      speaker: 'Tovin', role: 'Herrero de Alda', next: 'close'
    })
  }
  if (done(g, 'espada_rota')) {
    return N('La Espada de Vael te queda mejor que a mí. Si la rompes, vuelve. Si la pierdes, no vuelvas. Es broma. Más o menos. *ríe y golpea el yunque una vez más*', {
      speaker: 'Tovin', role: 'Herrero de Alda',
      choices: [
        C('¿Puedes mejorar mi armadura?', N('Con lo que me traes, no. Con lo que traerás de Drakmor, quizá. El metal de allí recuerda el fuego. Y el fuego recuerda a los necios que lo desafiaron.', {
          speaker: 'Tovin', role: 'Herrero de Alda', next: 'close'
        })),
        C('Hasta luego.', 'close')
      ]
    })
  }
  return N('El yunque está frío y la cerveza caliente. Un desastre en cualquier orden. Si encuentras hierro estelar, tráelo. Si encuentras una historia, cuéntamela. Prefiero las historias: no hay que afilarlas.', {
    speaker: 'Tovin', role: 'Herrero de Alda', next: 'close'
  })
}

// ───────────────────────────── MERA ─────────────────────────────
function mera(g) {
  if (!g.quests.isActive('flores_altar') && !done(g, 'flores_altar')) {
    return N('Cada amanecer enciendo cinco velas por los que no volvieron. Este año no tengo flores de lumen. Crecen cerca del agua y brillan cuando nadie las mira. ¿Me traerías cinco? El altar no exige mucho, pero tampoco olvida.', {
      speaker: 'Mera', role: 'Guardiana del altar',
      choices: [
        C('Traeré las flores.', 'close', () => { g.quests.start('flores_altar'); }),
        C('Ahora no puedo.', 'close')
      ]
    })
  }
  if (has(g, 'flores_altar')) {
    const n = g.inventoryCount('flor_lumen')
    return N(n < 5 ? `Llevas ${n} de cinco. Las flores de lumen se esconden entre la hierba alta, cerca del río y del bosque. No las arranques con raíz: mañana querrán volver.` : 'Cinco flores. Huelen a lluvia y a principio. Espera… *las coloca en el altar* El nombre de los caídos se ha vuelto a oír. Gracias, viajero. Toma esto: perteneció a alguien que también volvió.', {
      speaker: 'Mera', role: 'Guardiana del altar', next: 'close'
    })
  }
  return N('El altar está completo otra vez. Si alguna vez el Velo te enseña algo que no quieres ver, vuelve aquí. La luz de las velas no juzga; solo acompaña.', {
    speaker: 'Mera', role: 'Guardiana del altar', next: 'close'
  })
}

// ───────────────────────────── BRUNO / LÍA ─────────────────────────────
function bruno(g) {
  return N('El lago está más profundo de lo que parece. Cuando era niño, mi padre decía que en el fondo duerme una ciudad entera. Yo le creía. Ahora sé que las ciudades no duermen: esperan.', {
    speaker: 'Bruno', role: 'Pescador',
    choices: [
      C('¿Has visto algo extraño en el agua?', N('Una luz, la noche antes de que llegaras. Subía desde el fondo y se quedaba quieta, como si escuchara. Luego oí una espada. No un choque: una respiración.', {
        speaker: 'Bruno', role: 'Pescador', next: 'close'
      })),
      C('¿Algún consejo?', N('No cruces el lago a nado. No por el agua: por lo que hay debajo. Rodea por la orilla y usa los puentes de piedra. Y si ves burbujas que suben al revés, corre.', {
        speaker: 'Bruno', role: 'Pescador', next: 'close'
      })),
      C('Adiós.', 'close')
    ]
  })
}

function lia(g) {
  if (g.flags.lia_gift) return N('¡Volviste! ¿La criatura sigue contigo? ¿Puedo verla? Prometo no tocarla. Bueno, solo un poquito.', { speaker: 'Lía', role: 'Voz del pueblo', next: 'close' })
  return N('Mi madre dice que las criaturas del bosque se comen a los niños que no obedecen. Pero yo le he dado una flor a una Lumifín y no me ha comido. Creo que mi madre exagera.', {
    speaker: 'Lía', role: 'Voz del pueblo',
    choices: [
      C('¿Dónde viste a la Lumifín?', N('Al otro lado del claro, bajo el sauce grande. Si te acercas despacio y le enseñas una flor de lumen, se queda quieta. Pero no la asustes: su cola brilla más cuando tiene miedo.', {
        speaker: 'Lía', role: 'Voz del pueblo', next: 'close'
      })),
      C('Toma esta flor. (Entregar Flor de Lumen)', 'close', () => {
        if (g.inventoryCount('flor_lumen') > 0) { g.removeItem('flor_lumen', 1); g.flags.lia_gift = true; g.addResonance(2); g.toast('Lía te sonríe. Resonancia +2.') }
        else g.toast('No tienes ninguna Flor de Lumen.')
      }),
      C('Adiós.', 'close')
    ]
  })
}

// ───────────────────────────── KAELEN ─────────────────────────────
function kaelen(g) {
  if (has(g, 'tierras_ceniza')) {
    return N('Así que la Puerta de Ceniza sigue aceptando visitantes. Pensé que ya no quedaba nadie al otro lado. Soy Kaelen. Este campamento es lo que queda de Drakmor que no se ha arrodillado ante el Señor de Ceniza.', {
      speaker: 'Kaelen', role: 'Último rebelde',
      choices: [
        C('¿Quién es Varok?', N('Un padre. Un rey. Un hombre que perdió a su hija y decidió declararle la guerra al tiempo. Su dolor se filtró en la tierra y ahora respira por ella. Los ceniceros que ves fuera no son monstruos: son soldados que olvidaron por qué luchaban.', {
          speaker: 'Kaelen', role: 'Último rebelde',
          choices: [C('¿Qué quieres de mí?', N('La Fortaleza de Varok tiene una puerta que solo se abre desde dentro. Tengo la llave, pero no la fuerza. Tú tienes la fuerza, pero no la llave. Y hay algo más: tres memorias de su hija están esparcidas por el bosque y el santuario. Si las reúnes, quizá puedas hablarle antes de que te mate.', {
            speaker: 'Kaelen', role: 'Último rebelde', next: 'close'
          }))]
        })),
        C('He venido a detener la Ruptura.', N('Todos venimos a detener algo. Varok quiere detener la muerte. Yo quiero detener a Varok. Tú querrás detener el Velo. Ninguno lo conseguirá solo. Por eso estamos aquí, alrededor de una hoguera que ya no calienta.', {
          speaker: 'Kaelen', role: 'Último rebelde', next: 'close'
        }))
      ]
    })
  }
  if (just(g, 'tierras_ceniza')) {
    return N('Toma la Llave de Ceniza. Abre la puerta de la fortaleza, pero antes busca las tres Memorias de Ceniza: una en el bosque de obsidiana, otra en sus profundidades y una más en el santuario del este. Son recuerdos de la hija de Varok. Si aún queda un padre dentro de él, esas memorias lo encontrarán.', {
      speaker: 'Kaelen', role: 'Último rebelde', next: 'close'
    })
  }
  if (has(g, 'hija_ceniza')) {
    return N(`${g.quests.stepProgress('hija_ceniza', 0)} de tres memorias. La del santuario está junto a la lava; la del bosque, donde los árboles tienen más sed. Cuando las tengas, vuelve. No quiero que entres en la fortaleza con las manos vacías.`, {
      speaker: 'Kaelen', role: 'Último rebelde', next: 'close'
    })
  }
  if (just(g, 'hija_ceniza')) {
    return N('Conozco esa mirada. Has visto a la niña. Se llamaba Sela. Varok construyó un reino entero para no tener que decir su nombre en pasado. Ahora entra y dile que el tiempo no se detiene: se comparte. Aunque tenga que ser con una espada en la mano.', {
      speaker: 'Kaelen', role: 'Último rebelde', next: 'close'
    })
  }
  if (has(g, 'senor_ceniza')) {
    return N('La brecha está abierta. La puerta de la fortaleza te espera al norte, más allá de la grieta. Yo cubriré tu retirada desde aquí. Y forastero… si puedes, no lo mates. Si no puedes, no dejes que su muerte sea en vano.', {
      speaker: 'Kaelen', role: 'Último rebelde', next: 'close'
    })
  }
  if (!g.quests.isActive('faro_ceniza') && !done(g, 'faro_ceniza') && (g.flags.varok_defeated || done(g, 'senor_ceniza'))) {
    return N('La fortaleza está en silencio. Pero el faro del sureste sigue apagado, y hay gente perdida en la grieta. Enciéndelo. No te costará nada, y a alguien le costará todo.', {
      speaker: 'Kaelen', role: 'Último rebelde',
      choices: [
        C('Voy a encenderlo.', 'close', () => { g.quests.start('faro_ceniza'); }),
        C('Ahora no.', 'close')
      ]
    })
  }
  if (done(g, 'senor_ceniza')) {
    return N(g.flags.varok_spared
      ? 'Le perdonaste. No sé si fue misericordia o crueldad, pero fue tuyo. Varok bajó la espada y por primera vez en años el fuego de la fortaleza no olía a carne.'
      : 'Le quitaste todo. Su fuego, su memoria, su nombre. Drakmor está a salvo, pero esta tierra ya no recordará que un padre intentó salvar a su hija. Eso también es una muerte.', {
      speaker: 'Kaelen', role: 'Último rebelde',
      choices: [
        C('¿Qué será de Drakmor?', N('Será lo que hagamos con la ceniza. No con la que cae del cielo: con la que llevamos dentro. La Puerta del Cielo está abierta, al sureste de la fortaleza. Kansordore te espera. Ojalá encuentres allí una respuesta menos dolorosa que la nuestra.', {
          speaker: 'Kaelen', role: 'Último rebelde', next: 'close'
        })),
        C('Cuida de los tuyos.', 'close')
      ]
    })
  }
  return N('La ceniza cae más despacio cuando alguien la mira. Quédate junto al fuego si lo necesitas. Mañana el mundo seguirá roto, pero tú estarás un poco menos.', {
    speaker: 'Kaelen', role: 'Último rebelde', next: 'close'
  })
}

// ───────────────────────────── VESNA ─────────────────────────────
function vesna(g) {
  return N('Ceniza, humo y esperanza. Dos de las tres no se venden, pero tengo pociones para lo otro. ¿Qué necesitas, forastero?', {
    speaker: 'Vesna', role: 'Mercader de ceniza',
    choices: [
      C('Ver mercancía.', 'close', () => g.openShop()),
      C('¿Sabes algo de Varok?', N('Sé que paga bien y que no pregunta a quién sirve. Sé que su hija murió cuando la grieta se abrió y que desde entonces el cielo de Drakmor no ha vuelto a amanecer. Hay quien dice que podría salvarse. Yo digo que quien quiere salvar a todos acaba quemando a todos.', {
        speaker: 'Vesna', role: 'Mercader de ceniza', next: 'close'
      })),
      C('Adiós.', 'close')
    ]
  })
}

// ───────────────────────────── SERAPHINE ─────────────────────────────
function seraphine(g) {
  if (has(g, 'ciudad_cielo')) {
    return N('No levantes la espada. Aquí no se combate: se recuerda. Soy Seraphine, la última archivera. Llevo seiscientos años leyendo el mismo libro y aún no he llegado al final. Tú, en cambio, has llegado antes de empezar.', {
      speaker: 'Seraphine', role: 'Última archivera',
      choices: [
        C('¿Qué libro es ese?', N('El Libro del Velo. En sus páginas está escrito este mundo, y también los otros. Cada vez que una página se rompe, nace una región. Cada vez que alguien la lee hasta el final, el mundo vuelve a empezar. Tú hueles a página rota.', {
          speaker: 'Seraphine', role: 'Última archivera',
          choices: [C('¿Cómo lo detengo?', N('No lo detengas. Lo detenido se pudre. Ábrelo o ciérralo, pero elige. Para eso necesito los tres Sellos del Archivo. Están repartidos por las islas. Tráelos y te mostraré lo que ni yo me atrevo a leer en voz alta.', {
            speaker: 'Seraphine', role: 'Última archivera', next: 'close'
          }))]
        })),
        C('¿Por qué me llamas «Jugador Cero»?', N('Porque la profecía no habla de un héroe. Habla de alguien que puede volver a empezar cuando el mundo termina. Alguien que ya ha estado aquí. Alguien que no recuerda cuántas veces. Tú no eres un personaje de esta historia: eres quien la sostiene.', {
          speaker: 'Seraphine', role: 'Última archivera', next: 'close'
        }))
      ]
    })
  }
  if (has(g, 'tres_sellos')) {
    const n = g.quests.stepProgress('tres_sellos', 0)
    return N(n < 3 ? `${n} de tres sellos. El primero está al oeste, junto al borde del cielo. El segundo al este, en la ciudad de Ael. El tercero donde el Velo es más fino: al norte del templo. No los leas. Los sellos muerden.` : 'Los tres sellos. El Archivo ya reconoce tu mano. Ven, siéntate. Lo que voy a mostrarte no te hará daño, pero quizá te haga recordar que ya lo sabías.', {
      speaker: 'Seraphine', role: 'Última archivera', next: 'close'
    })
  }
  if (just(g, 'tres_sellos')) {
    return N('Mira. *el Archivo se abre como una flor de papel* Cada línea de este libro es una vida. Aquí estás tú, en la página 1. Y en la 47. Y en la 312. Has salvado Valdoria antes. Has visto arder Drakmor antes. Y siempre, al final, has elegido. Pero alguien ha estado borrando tu nombre entre partidas.', {
      speaker: 'Seraphine', role: 'Última archivera',
      choices: [
        C('¿Quién borra mi nombre?', N('El Custodio del Velo. No por maldad: por miedo. Si recuerdas todas tus vidas, puedes reescribir el libro. Y si puedes reescribirlo, el mundo deja de ser un mundo y se convierte en un borrador. Él prefiere un final triste a ninguna página.', {
          speaker: 'Seraphine', role: 'Última archivera',
          choices: [C('¿Y tú qué prefieres?', N('Prefiero que alguien elija de verdad, aunque se equivoque. Ve al Templo del Velo, al norte. El Custodio te espera. Y cuando lo enfrentes, recuerda: no estás luchando contra un monstruo. Estás luchando contra una versión de ti que tiene miedo de terminar.', {
            speaker: 'Seraphine', role: 'Última archivera', next: 'close'
          }))]
        })),
        C('¿Puedo recuperar mi nombre?', N('Tu nombre no se perdió: lo escondiste. En cada vida elegiste uno distinto. El que llevas ahora es tan real como los otros. La pregunta no es quién fuiste, sino quién quieres ser cuando el libro se cierre.', {
          speaker: 'Seraphine', role: 'Última archivera', next: 'close'
        }))
      ]
    })
  }
  if (has(g, 'jugador_cero')) {
    return N('El Custodio no es cruel. Es el guardián de todas las versiones de esta historia. Si le vences, no ganarás: le obligarás a mirar. Ve al templo al norte. Y no olvides que, en alguna página, él también fuiste tú.', {
      speaker: 'Seraphine', role: 'Última archivera', next: 'close'
    })
  }
  if (!g.quests.isActive('ecos_pasado') && !done(g, 'ecos_pasado') && (done(g, 'tres_sellos') || g.flags.truth_revealed)) {
    return N('Antes de que vayas al templo, hay algo que puedo hacer por ti. He oído ecos de tu nombre en los márgenes del Archivo. Tres fragmentos. Si los escuchas, quizá recuerdes algo que el Custodio no pudo borrar.', {
      speaker: 'Seraphine', role: 'Última archivera',
      choices: [
        C('Buscaré los ecos.', 'close', () => { g.quests.start('ecos_pasado'); }),
        C('No quiero saber quién fui.', 'close')
      ]
    })
  }
  if (has(g, 'ecos_pasado')) {
    return N(`${g.quests.stepProgress('ecos_pasado', 0)} de tres ecos. No los fuerces. Escúchalos como escucharías una canción que se está olvidando.`, {
      speaker: 'Seraphine', role: 'Última archivera', next: 'close'
    })
  }
  if (done(g, 'ecos_pasado')) {
    return N(g.flags.ending
      ? 'El libro sigue abierto. O cerrado. Ya no importa: ahora hay alguien que recuerda haber elegido. Eso es más de lo que este mundo había tenido nunca.'
      : 'Los ecos dicen que fuiste niño, que tuviste miedo, que quisiste salvar a alguien y no pudiste. También dicen que volviste a intentarlo. Eso no es debilidad. Es la definición de un jugador.', {
      speaker: 'Seraphine', role: 'Última archivera', next: 'close'
    })
  }
  return N('La biblioteca respira contigo. Los libros duermen, pero sueñan con lectores. Si alguna vez el mundo se acaba, ven aquí: encontraremos una página en blanco y empezaremos por el principio.', {
    speaker: 'Seraphine', role: 'Última archivera',
    choices: [
      C('¿Qué es la Convergencia Absoluta?', N('El momento en que todas las versiones del mundo intentan existir a la vez. La mayoría de las veces se destruyen. Algunas veces, alguien elige una y las demás aceptan desvanecerse. Eso es la Ascensión: no subir, sino aceptar.', {
        speaker: 'Seraphine', role: 'Última archivera', next: 'close'
      })),
      C('Adiós.', 'close')
    ]
  })
}

export const NPCS = { iria, tovin, nara, mera, bruno, lia, kaelen, vesna, seraphine }

// ───────────────────────── ESCENAS GUIONIZADAS ─────────────────────────
export const SCRIPTED = {
  varok_intro(g) {
    return N('Así que Kaelen encontró a un héroe. Qué original. Todos los que suben hasta aquí creen que el fuego les obedecerá. Pero el fuego solo obedece a quien ya ha perdido algo.', {
      speaker: 'Varok', role: 'Señor de Ceniza',
      choices: [
        C('Sé lo de Sela.', N('No pronuncies su nombre. *el fuego se agita* No tienes derecho. Tú, que apareciste de la nada con una espada que canta. ¿Crees que puedes entender lo que es sostener el mundo para que no se lleve a la única persona que importa?', {
          speaker: 'Varok', role: 'Señor de Ceniza',
          choices: [C('Detener el tiempo no la traerá de vuelta.', N('Entonces la traeré yo. Aunque tenga que romper el Velo, aunque tenga que quemar cada recuerdo de este reino. Si el mundo no puede devolverme a mi hija, no merece seguir girando.', {
            speaker: 'Varok', role: 'Señor de Ceniza',
            choices: [C('Entonces te detendré.', 'close', () => g.startBossFight('varok'))]
          }))]
        })),
        C('No quiero luchar contigo.', N('Nadie quiere. Por eso siempre gano. *desenvaina una hoja de ceniza* Si de verdad no quieres luchar, baja la espada. Pero no te dejaré salir de aquí con la Lágrima.', {
          speaker: 'Varok', role: 'Señor de Ceniza',
          choices: [
            C('No puedo hacer eso.', 'close', () => g.startBossFight('varok')),
            C('Está bien. Me voy.', 'close', () => g.toast('Varok no aparta la mirada. La puerta sigue abierta.'))
          ]
        }))
      ]
    })
  },
  varok_after(g) {
    return N('*Varok cae de rodillas. La hoja de ceniza se apaga.* No… Sela… el tiempo… todavía puedo… *te mira, y por un instante el fuego de sus ojos es solo el de un padre* Hazlo. Llévate la Lágrima. Pero antes dime: ¿la has visto? ¿La has oído en las memorias?', {
      speaker: 'Varok', role: 'Señor de Ceniza',
      choices: [
        C('La he visto. Está en paz.', N('Entonces… quizá yo también pueda estarlo. *cierra los ojos* Gracias, forastero. No por perdonarme. Por no mentirme.', {
          speaker: 'Varok', role: 'Señor de Ceniza', next: 'close'
        }), () => g.spareVarok()),
        C('Su memoria es mía ahora.', N('*el fuego vuelve a sus ojos, deformado* Entonces no eres distinto de mí. Llévatela. Llévatelo todo. Y cuando el Velo te devore, recuerda que te lo advertí.', {
          speaker: 'Varok', role: 'Señor de Ceniza', next: 'close'
        }), () => g.consumeVarok())
      ]
    })
  },
  custodio_intro(g) {
    return N('Detente, Jugador Cero. He contado tus pasos en trescientas doce versiones de esta historia. Siempre llegas aquí. Siempre dudas. Y siempre eliges algo que alguien lamenta.', {
      speaker: 'Custodio del Velo', role: 'El último guardián de la historia',
      choices: [
        C('¿Quién eres tú?', N('Soy lo que queda de ti cuando terminas una partida. El eco que se niega a apagarse. Cada vez que el Velo se rompe, alguien tiene que recoger los pedazos y empezar de nuevo. Ese alguien soy yo. Ese alguien podrías ser tú.', {
          speaker: 'Custodio del Velo', role: 'El último guardián de la historia', next: () => N('Si abres el Velo, el mundo dejará de ser una historia y se convertirá en una herida. Si lo cierras, todos los que amas dormirán para siempre en una página que nadie volverá a leer. Elige.', {
            speaker: 'Custodio del Velo', role: 'El último guardián de la historia',
            choices: [
              C('No elegiré por miedo.', 'close', () => g.startBossFight('custodio_velo')),
              C('Entonces ayúdame a elegir.', N('No puedo. Si te ayudara, dejaría de ser tu guardián y me convertiría en tu cómplice. Y los cómplices se olvidan. Los guardianes, no.', {
                speaker: 'Custodio del Velo', role: 'El último guardián de la historia',
                choices: [C('Lo siento.', 'close', () => g.startBossFight('custodio_velo'))]
              }))
            ]
          }))
        })),
        C('Apártate.', N('No puedo. Pero puedes hacerme apartar. *alza la lanza* Que la Espada Celestial decida si este mundo merece un final escrito por su propio protagonista.', {
          speaker: 'Custodio del Velo', role: 'El último guardián de la historia',
          choices: [C('Que así sea.', 'close', () => g.startBossFight('custodio_velo'))]
        }))
      ]
    })
  },
  custodio_after(g) {
    return N('*El Custodio se deshace en páginas.* No… era el último… si me borras, nadie recordará las otras vidas… nadie sabrá cuánto costó llegar hasta aquí… *una página se posa en tu mano* Llévala. Y elige mejor de lo que yo supe.', {
      speaker: 'Custodio del Velo', role: 'El último guardián de la historia', next: 'close'
    })
  },
  convergence_intro(g) {
    return N('*La Convergencia tiene tu rostro. Detrás de ella, cientos de rostros más: todas las versiones de ti que llegaron antes.* Has vuelto. Otra vez. Podría decirte que esta vez será distinto, pero ambos sabemos que mentiría. La Espada está ahí. El Velo se rompe. Solo falta que decidas qué clase de final merece el mundo.', {
      speaker: 'La Convergencia', role: 'Jugador Cero',
      choices: [
        C('Ya no soy el que empezó este viaje.', N('Eso es lo que todos dicen antes de convertirse en mí. *sonríe* Demuéstralo. Si tu voluntad es más fuerte que la suma de tus vidas, quizá esta vez el libro se cierre de otra forma.', {
          speaker: 'La Convergencia', role: 'Jugador Cero',
          choices: [C('Desenvaino la Espada Celestial.', 'close', () => g.startBossFight('convergencia'))]
        })),
        C('¿Qué elegirías tú?', N('Elegiría no volver a elegir. Pero eso ya no es una opción. *la Espada Celestial aparece entre ambos* Tómala. Y esta vez, hazlo por alguien que no seas tú.', {
          speaker: 'La Convergencia', role: 'Jugador Cero',
          choices: [C('La tomo.', 'close', () => g.startBossFight('convergencia'))]
        }))
      ]
    })
  },
  ending(g) {
    return N('*La Convergencia se disuelve en luz. El Velo queda suspendido, como una página a medio girar. La Espada Celestial brilla en tu mano.* Ya está. No hay enemigos. No hay profecía. Solo tú y la decisión que has estado evitando desde el principio.', {
      speaker: 'La Espada Celestial', role: 'La primera luz',
      choices: [
        C('ABRIR EL VELO. Que el mundo elija su propio final.', N('*La luz se expande.* El cielo se llena de grietas que no duelen. Las criaturas alzan la cabeza. Los reinos respirarán sin saber que alguien les dio permiso. Tú desaparecerás de la historia… pero cada historia que venga después llevará tu huella.', {
          speaker: 'La Espada Celestial', role: 'La primera luz', next: 'close'
        }), () => g.queueEnding('open')),
        C('CERRAR EL VELO. Que el mundo descanse.', N('*La luz se recoge.* Las grietas se cierran como párpados. Valdoria, Drakmor y Kansordore quedan suspendidos en un instante perfecto. Las criaturas dormirán. Los amigos que hiciste vivirán para siempre en el día antes de que todo terminara. Y tú serás el único que recuerde.', {
          speaker: 'La Espada Celestial', role: 'La primera luz', next: 'close'
        }), () => g.queueEnding('closed'))
      ]
    })
  }
}

export function dialogueFor(id) { return NPCS[id] || null }
