/* Historia, diálogos, misiones y jefes */
(function () {
  const EG = window.EG;
  const D = () => EG.data;
  const G = () => EG.game;
  const S = () => EG.game.state;

  const SPRITES = {
    Mira: 'elder', Dors: 'smith', Bruno: 'barkeep', Pía: 'girl',
    Lyra: 'lyra', Brann: 'brann', Ivo: 'merchant', Guardia: 'guard',
    Kael: 'kael', 'Lord Eclipse': 'knight', 'Araña Reina': 'knight',
  };

  function page(who, text, extra) {
    const p = { who: who || '', text };
    const sprite = SPRITES[who];
    if (sprite) p.sprite = sprite;
    return Object.assign(p, extra || {});
  }

  function dialog(pages, onEnd) {
    return EG.UI.dialog({ pages, onEnd });
  }

  function say(who, text, onEnd) {
    return dialog([page(who, text)], onEnd);
  }

  function join(id, levelBonus) {
    const st = S();
    if (st.party.some((p) => p.id === id)) return false;
    const lvl = Math.max(1, (st.party[0] ? st.party[0].lvl : 1) + (levelBonus || 0));
    st.party.push(D().newActor(id, lvl));
    return true;
  }

  function addFragments(n) {
    const st = S();
    st.fragments = Math.min(3, st.fragments + n);
    G().addItem('fragmento', n);
  }

  const story = {
    intro() {
      const st = S();
      st.quests.main = 'active';
      dialog([
        page('', 'Hace cien años, la Espada Celestial sostuvo la luna sobre el mundo. Hoy sólo quedan tres fragmentos… y un eclipse que no termina.'),
        page('Kael', 'Otra noche sin luna. El pozo está seco y los lobos bajan al camino.'),
        page('Mira', 'Kael. Ven. La espada que tu padre guardaba en la herrería ha empezado a cantar.'),
        page('Kael', '¿Cantar?'),
        page('Mira', 'Late. Como un corazón. Lord Eclipse ha despertado, y la espada sabe que es hora.'),
        page('Mira', 'Tres fragmentos, tres custodios: el Bosque de Sombras al oeste, las Ruinas de la Luna al este, el Castillo del Eclipse al sur.'),
        page('Kael', '¿Y si no vuelvo?'),
        page('Mira', 'Entonces la luna tampoco. Empieza por Dors, el herrero. Esa espada oxidada no te llevará lejos.'),
      ], () => {
        st.flags.intro = true;
        EG.UI.showToast('Objetivo: habla con la Anciana Mira', 'gold');
      });
    },

    talk(id, npc) {
      const st = S();
      const f = st.flags;

      if (id === 'mira') {
        if (!f.met_mira) {
          f.met_mira = true;
          st.quests.main = 'active';
          dialog([
            page('Mira', 'La espada no elige a los fuertes. Elige a los que vuelven.'),
            page('Mira', 'Lord Eclipse rompió la Espada Celestial hace cien años y se tragó su luz. Los fragmentos siguen vivos, pero sus custodios ya no distinguen amigos de intrusos.'),
            page('Mira', 'Busca el primero en el Bosque de Sombras. Dicen que una reina de seda lo custodia… y que una maga lleva días atrapada en sus hilos.'),
            page('Kael', '¿Cómo sé que podré?'),
            page('Mira', 'No lo sabrás. Por eso los héroes son tan raros.'),
          ], () => EG.UI.showToast('Misión principal actualizada: El primer fragmento', 'gold'));
          return;
        }
        if (st.fragments >= 3) {
          say('Mira', 'Los tres fragmentos cantan a la vez. La puerta del trono ya no te cerrará el paso. Termina esto, Kael.');
        } else if (st.fragments === 0) {
          say('Mira', 'El Bosque de Sombras está al oeste del Camino Real. No vayas solo: la maga atrapada en la seda sabe más de la luna que yo.');
        } else if (st.fragments === 1) {
          say('Mira', 'Siento el primer fragmento en tu mochila. El segundo duerme en las Ruinas de la Luna, al este. Brann, su último guardián, aún vive.');
        } else {
          say('Mira', 'Dos fragmentos. El tercero está en el Castillo del Eclipse, al sur. La puerta sólo reconoce la luz que llevas.');
        }
        return;
      }

      if (id === 'dors' || id === 'dors_tienda') {
        const stock = this.shopStock();
        if (!f.met_dors) {
          f.met_dors = true;
          st.quests.colmillos = 'active';
          dialog([
            page('Dors', '¿Esa espada? Tu padre la llamaba "la que espera". No sabía cuánto.'),
            page('Dors', 'Tráeme tres colmillos de lobo y te forjo algo que no dé vergüenza. Y compra pociones: morir es gratis, volver no.'),
          ], () => G().openShop('Herrería de Dors', stock));
          return;
        }
        if (st.quests.colmillos === 'active' && G().countItem('colmillo_lobo') >= 3) {
          G().addItem('colmillo_lobo', -3);
          st.gold += 400;
          G().addItem('espada_alba', 1);
          st.quests.colmillos = 'done';
          dialog([
            page('Dors', 'Tres colmillos. Limpios. Te has vuelto peligroso.'),
            page('Dors', 'Toma. Espada del Alba. No la he bautizado con agua: la he templado con la tuya.'),
          ], () => {
            EG.UI.showToast('+400 oro, +Espada del Alba', 'gold');
            G().openShop('Herrería de Dors', this.shopStock());
          });
          return;
        }
        G().openShop('Herrería de Dors', stock);
        return;
      }

      if (id === 'bruno' || id === 'bruno_posada') {
        const price = 25;
        dialog([
          page('Bruno', 'La cama está caliente y el caldo también. Veinticinco de oro y no preguntas por la mancha.'),
          page('Bruno', '¿Descansas?', {
            choices: [
              {
                label: `Descansar (${price} oro)`,
                action: () => {
                  if (S().gold < price) {
                    say('Bruno', 'Sin oro no hay caldo. Pero hoy tengo el corazón blando: pasa, que la luna ya nos debe bastante a todos.');
                    G().healParty();
                    G().saveTo('auto');
                    return;
                  }
                  S().gold -= price;
                  G().healParty();
                  G().saveTo('auto');
                  dialog([
                    page('Bruno', 'Duerme. Si sueñas con la luna, no le cuentes nada a Mira: se preocupa.'),
                  ], () => EG.UI.showToast('PV y PM restaurados · partida guardada', 'gold'));
                },
              },
              { label: 'Seguir viaje', action: () => {} },
            ],
          }),
        ]);
        return;
      }

      if (id === 'pia') {
        if (st.quests.flores === 'locked') {
          st.quests.flores = 'active';
          dialog([
            page('Pía', 'Las flores lunares sólo salen cuando la luna está triste. Y llevo tres noches sin ver ninguna.'),
            page('Pía', 'Mi madre dice que crecen en el Bosque de Sombras. ¿Me traes tres? Te daré lo que guardo para cuando sea mayor.'),
          ], () => EG.UI.showToast('Misión secundaria: Flores para Pía', 'gold'));
          return;
        }
        if (st.quests.flores === 'active') {
          const n = G().countItem('flor_lunar');
          if (n >= 3) {
            G().addItem('flor_lunar', -3);
            st.gold += 150;
            G().addItem('elixir', 1);
            st.quests.flores = 'done';
            dialog([
              page('Pía', '¡Son ellas! Huelen a ventana abierta.'),
              page('Pía', 'Toma. Mi madre dice que este elixir revive a cualquiera. Menos a los cobardes, dice.'),
            ], () => EG.UI.showToast('+150 oro, +Elixir', 'gold'));
          } else {
            say('Pía', `Llevas ${n} de 3 flores lunares. Se esconden entre la hierba alta del bosque.`);
          }
          return;
        }
        say('Pía', 'Cuando sea mayor voy a ser guardiana de la luna. O panadera. Aún lo pienso.');
        return;
      }

      if (id === 'guard') {
        if (st.fragments < 2) {
          say('Guardia', 'El Castillo del Eclipse está al sur. No dejo pasar a quien no lleve dos fragmentos: la puerta se alimenta de luz y devuelve huesos.');
        } else {
          say('Guardia', 'Dos fragmentos. Nunca pensé que diría esto, pero abre paso. Que la luna te vea.');
        }
        return;
      }

      if (id === 'ivo') {
        dialog([
          page('Ivo', '¿Sabes lo bueno de los monstruos? Tienen debilidades. Lo malo: también tienen dientes.'),
          page('Ivo', 'Limos y arañas odian el fuego. Murciélagos y esqueletos temen la luz. Los gólems se caen con un buen rayo.'),
          page('Ivo', 'Vendo pociones, éter y alguna cosa que no preguntarás de dónde sale.', {
            choices: [
              { label: 'Ver mercancía', action: () => G().openShop('Mercader Ivo', ['pocion', 'pocion_mayor', 'eter', 'antidoto', 'bomba']) },
              { label: 'Seguir camino', action: () => {} },
            ],
          }),
        ]);
        return;
      }

      if (id === 'lyra_web') {
        if (f.lyra_join) {
          say('Lyra', 'No mires así. Las telarañas eran parte del plan. Un plan muy malo, pero plan al fin y al cabo.');
          return;
        }
        dialog([
          page('Kael', 'Hay alguien dentro de la seda.'),
          page('Lyra', '¡Corta por la izquierda! La reina siente las vibraciones…'),
          page('Kael', '¿La reina?'),
          page('Lyra', 'La Araña Reina. Custodia el primer fragmento desde antes de que tu abuela naciera. Y yo llevo tres días colgada aquí.'),
          page('Lyra', 'Me llamo Lyra. Si vamos a morir, prefiero que sea en el mismo sitio.'),
          page('Lyra', 'El santuario está al sur, entre los pilares. Cuando la reina caiga, el fragmento será tuyo.'),
        ], () => {
          f.lyra_join = true;
          join('lyra', 1);
          EG.Audio.sfx('level');
          EG.UI.showToast('Lyra se une al grupo', 'gold');
          G().autoSave();
        });
        return;
      }

      if (id === 'brann') {
        if (f.brann_join) {
          say('Brann', 'Sigue adelante. Yo vigilo la entrada. Si algo sale de la oscuridad, saldrá cojo.');
          return;
        }
        dialog([
          page('Brann', 'Alto. Las Ruinas no perdonan a los vivos.'),
          page('Kael', 'Busco el segundo fragmento.'),
          page('Brann', 'Todos lo buscan. Yo lo custodié cien años y ni así lo entendí.'),
          page('Brann', 'El Guardián de la Luna duerme tras el sello. Robaste el Sello a la reina de la seda, ¿verdad? Entonces ábrelo tú.'),
          page('Brann', 'No puedo mirar. Pero puedo cubrirte la espalda.'),
        ], () => {
          f.brann_join = true;
          join('brann', 1);
          EG.Audio.sfx('level');
          EG.UI.showToast('Brann se une al grupo', 'gold');
          G().autoSave();
        });
        return;
      }

      say('', 'No hay nada que decir.');
    },

    shopStock() {
      const st = S();
      const f = st.flags;
      const goods = ['pocion', 'pocion_mayor', 'eter', 'antidoto', 'cuero_reforzado', 'baston_aprendiz', 'bota_viento'];
      if (f.frag1) goods.push('espada_alba', 'cota_malla', 'amuleto_luz');
      if (f.frag2) goods.push('tunica_lunar', 'anillo_poder', 'filo_lunar');
      if (f.frag3) goods.push('placas_luna', 'talisman_luna');
      return goods;
    },

    checkFlowers() {
      const st = S();
      if (st.quests.flores === 'active' && G().countItem('flor_lunar') >= 3) {
        EG.UI.showToast('Tienes 3 flores lunares. Vuelve con Pía en Alba.', 'gold');
      }
    },

    journal(st) {
      const f = st.flags;
      const items = [];
      let mainText;
      if (!f.met_mira) mainText = 'Habla con la Anciana Mira en la plaza de Alba.';
      else if (st.fragments === 0) mainText = 'Busca el primer fragmento en el Bosque de Sombras (oeste del Camino Real).';
      else if (st.fragments === 1) mainText = 'El segundo fragmento duerme en las Ruinas de la Luna (este).';
      else if (st.fragments === 2) mainText = 'El tercer fragmento está en el Castillo del Eclipse (sur).';
      else mainText = 'La puerta del trono está abierta. Derrota a Lord Eclipse.';
      items.push({
        label: 'La Espada Celestial',
        sub: mainText,
        right: `${st.fragments}/3`,
        color: EG.COLORS.gold,
        action: () => {},
      });
      items.push({
        label: 'Fragmentos recuperados',
        sub: f.frag1 ? 'I · Bosque de Sombras' : 'I · aún perdido',
        right: '',
        color: f.frag1 ? EG.COLORS.ink : '#5d6579',
        action: () => {},
      });
      items.push({
        label: '',
        sub: f.frag2 ? 'II · Ruinas de la Luna' : 'II · aún perdido',
        color: f.frag2 ? EG.COLORS.ink : '#5d6579',
        action: () => {},
      });
      items.push({
        label: '',
        sub: f.frag3 ? 'III · Castillo del Eclipse' : 'III · aún perdido',
        color: f.frag3 ? EG.COLORS.ink : '#5d6579',
        action: () => {},
      });
      if (st.quests.colmillos !== 'locked') {
        items.push({
          label: 'Colmillos para Dors',
          sub: st.quests.colmillos === 'done' ? 'Completada. La Espada del Alba es tuya.' : `Lleva 3 colmillos de lobo a Dors (${G().countItem('colmillo_lobo')}/3).`,
          right: st.quests.colmillos === 'done' ? '✓' : '',
          color: st.quests.colmillos === 'done' ? '#7fe89a' : EG.COLORS.ink,
          action: () => {},
        });
      }
      if (st.quests.flores !== 'locked') {
        items.push({
          label: 'Flores para Pía',
          sub: st.quests.flores === 'done' ? 'Completada. Pía guarda su elixir con orgullo.' : `Recoge 3 flores lunares en el bosque (${G().countItem('flor_lunar')}/3).`,
          right: st.quests.flores === 'done' ? '✓' : '',
          color: st.quests.flores === 'done' ? '#7fe89a' : EG.COLORS.ink,
          action: () => {},
        });
      }
      items.push({
        label: 'Valor',
        sub: `Victorias ${st.wins} · Derrotas ${st.deaths} · Tiempo ${EG.clock(st.playtime)}`,
        action: () => {},
      });
      return items;
    },

    runTrigger(script, trig) {
      const st = S();
      if (!script) return;
      if (script === 'boss_arana') {
        if (st.flags.frag1) { st.triggers[trig.id] = true; return; }
        dialog([
          page('', 'El santuario huele a seda vieja y a lluvia. Sobre el altar, un fragmento de luz late como un insecto atrapado.'),
          page('Lyra', 'Ahí está. Y ahí está ella.'),
          page('Araña Reina', 'Nadie toca lo que la luna me dejó.'),
          page('Kael', 'Aparta, o te aparto.'),
        ], () => {
          G().startBattle(['arana_reina'], {
            boss: true,
            onWin: () => {
              st.flags.frag1 = true;
              st.triggers[trig.id] = true;
              addFragments(1);
              EG.Audio.sfx('victory');
              dialog([
                page('', 'La reina cae y la seda se deshace como niebla. El fragmento flota hasta tu mano: pesa menos que una pluma y arde como una estrella.'),
                page('Kael', 'Uno.'),
                page('Lyra', 'Dos más. Y luego el hombre que se comió la luna.'),
                page('Lyra', 'Las Ruinas de la Luna están al este. Brann las guarda. Y Brann no ha dormido en cien años.'),
              ], () => EG.UI.showToast('Fragmento I recuperado', 'gold'));
            },
          });
        });
        return;
      }

      if (script === 'door_sello') {
        if (st.flags.door_sello) { st.triggers[trig.id] = true; return; }
        if (G().countItem('llave_ruinas') <= 0) {
          G().revertStep();
          say('', 'La puerta está sellada con una luna de piedra. Falta la pieza central: un sello antiguo, del tamaño de una mano.');
          return;
        }
        dialog([
          page('Kael', 'El Sello de la luna encaja. La piedra se abre como un párpado.'),
          page('Brann', 'Entra. Yo te sigo. Y no mires a los ojos a la estatua.'),
        ], () => {
          G().addItem('llave_ruinas', -1);
          st.flags.door_sello = true;
          st.triggers[trig.id] = true;
          EG.Audio.sfx('portal');
        });
        return;
      }

      if (script === 'boss_guardian') {
        if (st.flags.frag2) { st.triggers[trig.id] = true; return; }
        dialog([
          page('', 'La cámara está llena de polvo que no cae. En el centro, una estatua de piedra sostiene una media luna rota.'),
          page('Brann', 'Guardián. Soy Brann. He vuelto.'),
          page('', 'La estatua abre los ojos. No hay reconocimiento. Sólo el peso de cien años.'),
          page('Guardián de la Luna', 'NADIE TOCA LA LUNA.'),
        ], () => {
          G().startBattle(['guardian_luna'], {
            boss: true,
            onWin: () => {
              st.flags.frag2 = true;
              st.triggers[trig.id] = true;
              addFragments(1);
              dialog([
                page('', 'La piedra se agrieta y el segundo fragmento rueda hasta tus pies. Brann lo mira como quien mira una tumba abierta.'),
                page('Brann', 'Cien años. Y bastó una espada rota.'),
                page('Brann', 'Llévame contigo. No por la luna. Por ellos.'),
                page('Lyra', 'El Castillo del Eclipse está al sur. La puerta pide dos fragmentos. Ahora los tenemos.'),
              ], () => EG.UI.showToast('Fragmento II recuperado', 'gold'));
            },
          });
        });
        return;
      }

      if (script === 'boss_knight') {
        if (st.flags.frag3) { st.triggers[trig.id] = true; return; }
        dialog([
          page('', 'El salón del trono está vacío, salvo por una armadura que respira.'),
          page('Caballero Negro', 'El señor no recibe visitas.'),
          page('Brann', 'Esa armadura está vacía.'),
          page('Caballero Negro', 'También tu luna. Y sin embargo, la defiendes.'),
        ], () => {
          G().startBattle(['caballero_negro'], {
            boss: true,
            onWin: () => {
              st.flags.frag3 = true;
              st.triggers[trig.id] = true;
              addFragments(1);
              dialog([
                page('', 'La armadura se desmonta pieza a pieza. En su interior no hay nada, sólo un fragmento de luz que cae al suelo.'),
                page('Kael', 'Tres.'),
                page('Lyra', 'La puerta del trono ya reconoce tu luz. Detrás está Lord Eclipse.'),
                page('Brann', 'Y detrás de él, la luna. No falles.'),
              ], () => EG.UI.showToast('Fragmento III recuperado · el trono te espera', 'gold'));
            },
          });
        });
        return;
      }

      if (script === 'boss_lord') {
        if (st.flags.ending) return;
        dialog([
          page('', 'El trono flota sobre un pozo de noche. Lord Eclipse se vuelve despacio, como si el tiempo le costara.'),
          page('Lord Eclipse', 'La luz es un préstamo. Yo sólo cobro intereses.'),
          page('Kael', 'Devuelve la luna.'),
          page('Lord Eclipse', '¿Y quién me devuelve a mí? Cien años de sombra no se pagan con una espada bonita.'),
          page('Lord Eclipse', 'Ven. Te mostraré lo que queda de la luz cuando se le quita la esperanza.'),
        ], () => {
          G().startBattle(['lord_eclipse'], {
            boss: true,
            onWin: () => {
              st.flags.frag3 = true;
              st.triggers[trig.id] = true;
              dialog([
                page('', 'Lord Eclipse se deshace en una lluvia de ceniza fría. El último fragmento vuela de su pecho a tu espada.'),
                page('Kael', 'Se acabó.'),
                page('Lyra', 'No del todo. Mira.'),
                page('', 'La luna se enciende sobre el castillo, y por primera vez en cien años, el cielo tiene fondo.'),
              ], () => G().ending());
            },
          });
        });
        return;
      }
    },
  };

  EG.story = story;
})();
