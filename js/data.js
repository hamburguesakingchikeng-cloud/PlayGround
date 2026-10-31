/* Datos del juego: elementos, objetos, habilidades, personajes y enemigos */
(function () {
  const EG = window.EG;

  /* ------------------------------ ELEMENTOS ------------------------------ */

  const ELEMENTS = {
    fisico: { name: 'Físico', color: '#d8dde8' },
    fuego: { name: 'Fuego', color: '#ff7a4a' },
    hielo: { name: 'Hielo', color: '#7ad8ff' },
    rayo: { name: 'Rayo', color: '#ffe066' },
    luz: { name: 'Luz', color: '#fff2b0' },
    sombra: { name: 'Sombra', color: '#b07aff' },
  };

  /* -------------------------------- OBJETOS ------------------------------- */

  const ITEMS = {
    pocion: {
      name: 'Poción', kind: 'consumible', price: 30, icon: 'potion',
      desc: 'Restaura 60 PV a un aliado.', use: { hp: 60 }, target: 'ally',
    },
    pocion_mayor: {
      name: 'Poción mayor', kind: 'consumible', price: 95, icon: 'potion',
      desc: 'Restaura 220 PV a un aliado.', use: { hp: 220 }, target: 'ally',
    },
    eter: {
      name: 'Éter', kind: 'consumible', price: 70, icon: 'ether',
      desc: 'Restaura 40 PM a un aliado.', use: { mp: 40 }, target: 'ally',
    },
    elixir: {
      name: 'Elixir', kind: 'consumible', price: 260, icon: 'potion',
      desc: 'Restaura todos los PV y PM de un aliado.', use: { hp: 9999, mp: 9999 }, target: 'ally',
    },
    antidoto: {
      name: 'Antídoto', kind: 'consumible', price: 24, icon: 'potion',
      desc: 'Cura veneno y quemaduras.', use: { cure: ['veneno', 'quemado'] }, target: 'ally',
    },
    bomba: {
      name: 'Bomba arcana', kind: 'consumible', price: 80, icon: 'star',
      desc: 'Daña a todos los enemigos con fuego (45 de poder).',
      use: { damage: 105, element: 'fuego' }, target: 'allEnemies',
    },
    colmillo_lobo: {
      name: 'Colmillo de lobo', kind: 'material', price: 12, icon: 'star',
      desc: 'Trofeo de caza. Dors lo compra.',
    },
    flor_lunar: {
      name: 'Flor lunar', kind: 'material', price: 0, icon: 'star',
      desc: 'Florece sólo bajo la luna del Bosque de Sombras.',
    },
    fragmento: {
      name: 'Fragmento celestial', kind: 'clave', price: 0, icon: 'star',
      desc: 'Parte de la Espada Celestial. Late con luz propia.',
    },
    llave_ruinas: {
      name: 'Sello de la luna', kind: 'clave', price: 0, icon: 'star',
      desc: 'Abre la puerta interior de las Ruinas de la Luna.',
    },

    // Armas
    espada_oxido: {
      name: 'Espada oxidada', kind: 'arma', price: 0, icon: 'sword',
      desc: 'Aún corta. Apenas.', stats: { atk: 4 },
    },
    espada_alba: {
      name: 'Espada del Alba', kind: 'arma', price: 430, icon: 'sword',
      desc: 'Forjada por Dors. +12 ATQ, elemento Luz.', stats: { atk: 12 }, element: 'luz',
    },
    filo_lunar: {
      name: 'Filo lunar', kind: 'arma', price: 980, icon: 'sword',
      desc: 'Hoja de plata lunar. +19 ATQ, elemento Luz.', stats: { atk: 19 }, element: 'luz',
    },
    espada_celestial: {
      name: 'Espada Celestial', kind: 'arma', price: 0, icon: 'sword',
      desc: 'La espada restaurada. +28 ATQ, +8 MAG, elemento Luz.',
      stats: { atk: 28, mag: 8 }, element: 'luz',
    },
    baston_aprendiz: {
      name: 'Bastón de aprendiz', kind: 'arma', price: 130, icon: 'star',
      desc: '+8 MAG.', stats: { mag: 8 },
    },
    baston_lunar: {
      name: 'Bastón lunar', kind: 'arma', price: 640, icon: 'star',
      desc: '+20 MAG, +6 RES.', stats: { mag: 20, res: 6 },
    },
    mazo_hierro: {
      name: 'Mazo de hierro', kind: 'arma', price: 520, icon: 'sword',
      desc: '+15 ATQ, +5 DEF.', stats: { atk: 15, def: 5 },
    },
    martillo_alba: {
      name: 'Martillo del Alba', kind: 'arma', price: 0, icon: 'sword',
      desc: '+22 ATQ, +8 DEF, elemento Luz.', stats: { atk: 22, def: 8 }, element: 'luz',
    },

    // Armaduras
    tunica_viajero: {
      name: 'Túnica de viajero', kind: 'armadura', price: 0, icon: 'shield',
      desc: '+3 DEF.', stats: { def: 3 },
    },
    cuero_reforzado: {
      name: 'Cuero reforzado', kind: 'armadura', price: 190, icon: 'shield',
      desc: '+7 DEF.', stats: { def: 7 },
    },
    cota_malla: {
      name: 'Cota de malla', kind: 'armadura', price: 520, icon: 'shield',
      desc: '+13 DEF.', stats: { def: 13 },
    },
    tunica_lunar: {
      name: 'Túnica lunar', kind: 'armadura', price: 560, icon: 'shield',
      desc: '+9 DEF, +10 RES.', stats: { def: 9, res: 10 },
    },
    placas_luna: {
      name: 'Placas de la luna', kind: 'armadura', price: 1050, icon: 'shield',
      desc: '+18 DEF, +8 RES.', stats: { def: 18, res: 8 },
    },

    // Accesorios
    amuleto_luz: {
      name: 'Amuleto de luz', kind: 'accesorio', price: 320, icon: 'star',
      desc: '+6 RES, +15 PM máx.', stats: { res: 6, maxmp: 15 },
    },
    anillo_poder: {
      name: 'Anillo de poder', kind: 'accesorio', price: 400, icon: 'star',
      desc: '+6 ATQ, +6 MAG.', stats: { atk: 6, mag: 6 },
    },
    bota_viento: {
      name: 'Botas del viento', kind: 'accesorio', price: 280, icon: 'boot',
      desc: '+6 VEL.', stats: { spd: 6 },
    },
    talisman_luna: {
      name: 'Talismán lunar', kind: 'accesorio', price: 760, icon: 'star',
      desc: '+12 RES, +30 PM máx.', stats: { res: 12, maxmp: 30 },
    },
  };

  /* ------------------------------ HABILIDADES ----------------------------- */

  const SKILLS = {
    tajo_celeste: {
      name: 'Tajo celeste', mp: 6, element: 'luz', power: 130, target: 'enemy',
      desc: 'Un corte impregnado de luz.',
    },
    grito: {
      name: 'Grito de guerra', mp: 5, target: 'allAllies', buff: { atk: 0.3, turns: 3 },
      desc: 'Aumenta el ataque de la party 3 turnos.',
    },
    torbellino: {
      name: 'Torbellino', mp: 11, element: 'fisico', power: 90, target: 'allEnemies',
      desc: 'Gira la espada y golpea a todos.',
    },
    filo_alba: {
      name: 'Filo del alba', mp: 15, element: 'luz', power: 200, target: 'enemy',
      desc: 'Un tajo que quema la oscuridad.',
    },
    espada_celestial: {
      name: 'Espada celestial', mp: 30, element: 'luz', power: 155, target: 'allEnemies',
      desc: 'Despierta el filo completo de la espada.',
    },
    chispa: {
      name: 'Chispa', mp: 4, element: 'fuego', power: 115, magic: true, target: 'enemy',
      desc: 'Una llama pequeña pero certera.',
    },
    escarcha: {
      name: 'Escarcha', mp: 6, element: 'hielo', power: 130, magic: true, target: 'enemy',
      desc: 'Congela la sangre del enemigo.',
    },
    rayo: {
      name: 'Rayo', mp: 8, element: 'rayo', power: 150, magic: true, target: 'enemy',
      desc: 'Descarga eléctrica directa.',
    },
    curar: {
      name: 'Curar', mp: 8, heal: 130, target: 'ally',
      desc: 'Restaura 130 PV a un aliado.',
    },
    ventisca: {
      name: 'Ventisca', mp: 15, element: 'hielo', power: 120, magic: true, target: 'allEnemies',
      desc: 'Una tormenta de hielo sobre todos.',
    },
    plegaria: {
      name: 'Plegaria', mp: 22, heal: 180, target: 'allAllies',
      desc: 'Restaura 180 PV a toda la party.',
    },
    golpe_sismico: {
      name: 'Golpe sísmico', mp: 10, element: 'fisico', power: 145, target: 'enemy',
      status: { id: 'aturdido', chance: 0.45 },
      desc: 'Golpea el suelo; puede aturdir.',
    },
    provocar: {
      name: 'Provocar', mp: 4, target: 'self', taunt: true,
      desc: 'Atrae los ataques enemigos hacia Brann.',
    },
    muro_acero: {
      name: 'Muro de acero', mp: 16, target: 'allAllies', buff: { def: 0.35, turns: 3 },
      desc: 'Aumenta la defensa de la party 3 turnos.',
    },
    martillo_alba: {
      name: 'Martillo del alba', mp: 18, element: 'luz', power: 205, target: 'enemy',
      desc: 'Un golpe sagrado que parte armaduras.',
    },
    // Enemigos
    mordisco: { name: 'Mordisco', power: 110, element: 'fisico', target: 'enemy' },
    embestida: { name: 'Embestida', power: 100, element: 'fisico', target: 'enemy' },
    aullido: { name: 'Aullido', power: 0, target: 'self', buff: { atk: 0.25, turns: 3 } },
    tela: { name: 'Telaraña', power: 0, target: 'enemy', status: { id: 'aturdido', chance: 0.35 } },
    aguijon: { name: 'Aguijón', power: 105, element: 'fisico', target: 'enemy', status: { id: 'veneno', chance: 0.5 } },
    hueso: { name: 'Lanzahuesos', power: 110, element: 'fisico', target: 'enemy' },
    maldicion: { name: 'Maldición', power: 120, element: 'sombra', magic: true, target: 'enemy', status: { id: 'quemado', chance: 0.3 } },
    terremoto: { name: 'Terremoto', power: 95, element: 'fisico', target: 'allEnemies' },
    golpe_oscuro: { name: 'Golpe oscuro', power: 140, element: 'sombra', target: 'enemy' },
    eclipse: { name: 'Eclipse', power: 120, element: 'sombra', magic: true, target: 'allEnemies' },
    curacion_oscura: { name: 'Absorber vida', power: 110, element: 'sombra', magic: true, target: 'enemy', drain: true },
    luna_llena: { name: 'Luna llena', power: 150, element: 'luz', magic: true, target: 'allEnemies' },
    latigo_seda: { name: 'Látigo de seda', power: 120, element: 'fisico', target: 'enemy', status: { id: 'veneno', chance: 0.4 } },
    zarpa: { name: 'Zarpa', power: 100, element: 'fisico', target: 'enemy' },
    alas_noche: { name: 'Alas de la noche', power: 115, element: 'sombra', target: 'enemy' },
    eter_robo: { name: 'Robo de éter', power: 60, element: 'sombra', magic: true, target: 'enemy', drainMp: 12 },
  };

  /* ------------------------------- PERSONAJES ------------------------------ */

  const ACTORS = {
    kael: {
      name: 'Kael', role: 'Espadachín', sprite: 'kael', color: '#6f9be8',
      desc: 'Hijo de herreros. La espada rota lo eligió.',
      base: { hp: 62, mp: 22, atk: 13, def: 10, mag: 6, res: 8, spd: 9 },
      grow: { hp: 13, mp: 3, atk: 2.3, def: 1.9, mag: 1.0, res: 1.2, spd: 1.1 },
      start: { arma: 'espada_oxido', armadura: 'tunica_viajero', accesorio: null },
      learn: { 1: ['tajo_celeste'], 3: ['grito'], 5: ['torbellino'], 9: ['filo_alba'], 14: ['espada_celestial'] },
    },
    lyra: {
      name: 'Lyra', role: 'Maga lunar', sprite: 'lyra', color: '#b98fe8',
      desc: 'Estudiosa de la luna. Habla poco y acierta mucho.',
      base: { hp: 44, mp: 42, atk: 7, def: 6, mag: 15, res: 13, spd: 8 },
      grow: { hp: 8, mp: 7, atk: 0.8, def: 1.1, mag: 2.7, res: 1.7, spd: 1.3 },
      start: { arma: 'baston_aprendiz', armadura: 'tunica_viajero', accesorio: null },
      learn: { 1: ['chispa', 'escarcha', 'curar'], 4: ['rayo'], 8: ['ventisca'], 12: ['plegaria'] },
    },
    brann: {
      name: 'Brann', role: 'Guardián', sprite: 'brann', color: '#c9b98f',
      desc: 'Último guardián de las Ruinas. Protege a los suyos.',
      base: { hp: 96, mp: 18, atk: 15, def: 17, mag: 5, res: 10, spd: 6 },
      grow: { hp: 17, mp: 2, atk: 2.1, def: 2.5, mag: 0.7, res: 1.5, spd: 0.8 },
      start: { arma: 'mazo_hierro', armadura: 'cuero_reforzado', accesorio: null },
      learn: { 1: ['golpe_sismico', 'provocar'], 6: ['muro_acero'], 11: ['martillo_alba'] },
    },
  };

  /* -------------------------------- ENEMIGOS ------------------------------- */

  const ENEMIES = {
    limo: {
      name: 'Limo', sprite: 'limo', lvl: 2, hp: 36, atk: 8, def: 4, mag: 3, res: 4, spd: 5,
      xp: 12, gold: 8, weak: ['fuego'], resist: ['hielo'],
      moves: [{ id: 'embestida', w: 4 }, { id: 'tela', w: 1 }],
      drops: [{ item: 'pocion', chance: 0.22 }],
      desc: 'Gelatina del camino. Arde con facilidad.',
    },
    lobo: {
      name: 'Lobo gris', sprite: 'lobo', lvl: 4, hp: 62, atk: 13, def: 6, mag: 2, res: 4, spd: 11,
      xp: 24, gold: 14, weak: ['fuego'], resist: [],
      moves: [{ id: 'mordisco', w: 4 }, { id: 'aullido', w: 1 }],
      drops: [{ item: 'colmillo_lobo', chance: 0.5 }],
      desc: 'Caza en los bordes del bosque. Rápido y terco.',
    },
    murcielago: {
      name: 'Murciélago', sprite: 'murcielago', lvl: 3, hp: 44, atk: 9, def: 4, mag: 8, res: 9, spd: 13,
      xp: 18, gold: 10, weak: ['luz', 'rayo'], resist: ['sombra'],
      moves: [{ id: 'alas_noche', w: 3 }, { id: 'eter_robo', w: 2 }],
      drops: [{ item: 'eter', chance: 0.12 }],
      desc: 'Chupa éter de los viajeros distraídos.',
    },
    arana: {
      name: 'Araña de seda', sprite: 'arana', lvl: 6, hp: 92, atk: 17, def: 8, mag: 4, res: 7, spd: 12,
      xp: 42, gold: 26, weak: ['fuego'], resist: ['veneno'],
      moves: [{ id: 'aguijon', w: 3 }, { id: 'tela', w: 2 }],
      drops: [{ item: 'antidoto', chance: 0.3 }],
      desc: 'Teje trampas entre los árboles.',
    },
    esqueleto: {
      name: 'Esqueleto', sprite: 'esqueleto', lvl: 8, hp: 138, atk: 21, def: 12, mag: 5, res: 7, spd: 9,
      xp: 66, gold: 38, weak: ['luz'], resist: ['sombra'], immune: ['veneno'],
      moves: [{ id: 'hueso', w: 3 }, { id: 'golpe_oscuro', w: 1 }],
      drops: [{ item: 'pocion_mayor', chance: 0.18 }],
      desc: 'Guardia eterno de las ruinas.',
    },
    espectro: {
      name: 'Espectro', sprite: 'espectro', lvl: 9, hp: 156, atk: 14, def: 8, mag: 21, res: 16, spd: 10,
      xp: 80, gold: 44, weak: ['luz'], resist: ['sombra', 'fisico'], immune: ['veneno'],
      moves: [{ id: 'maldicion', w: 3 }, { id: 'eter_robo', w: 2 }],
      drops: [{ item: 'eter', chance: 0.35 }],
      desc: 'Un recuerdo que se niega a apagarse.',
    },
    golem: {
      name: 'Gólem lunar', sprite: 'golem', lvl: 11, hp: 275, atk: 27, def: 23, mag: 6, res: 10, spd: 5,
      xp: 112, gold: 72, weak: ['rayo'], resist: ['fisico'],
      moves: [{ id: 'terremoto', w: 2 }, { id: 'embestida', w: 3 }],
      drops: [{ item: 'pocion_mayor', chance: 0.3 }],
      desc: 'Piedra animada por la luna rota.',
    },
    caballero_eclipse: {
      name: 'Caballero del Eclipse', sprite: 'caballero', lvl: 13, hp: 330, atk: 33, def: 21, mag: 12, res: 15, spd: 12,
      xp: 165, gold: 112, weak: ['luz'], resist: ['sombra'],
      moves: [{ id: 'golpe_oscuro', w: 3 }, { id: 'mordisco', w: 2 }],
      drops: [{ item: 'elixir', chance: 0.2 }],
      desc: 'Sirve a Lord Eclipse desde antes de recordar su nombre.',
    },
    arana_reina: {
      name: 'Araña Reina', sprite: 'arana_reina', lvl: 8, hp: 460, atk: 21, def: 11, mag: 9, res: 9, spd: 13,
      xp: 280, gold: 210, weak: ['fuego'], resist: ['veneno'], boss: true, title: 'Guardiana del primer fragmento',
      moves: [{ id: 'latigo_seda', w: 3 }, { id: 'tela', w: 2 }, { id: 'aguijon', w: 2 }],
      drops: [{ item: 'pocion_mayor', chance: 1 }],
      desc: 'Reina del Bosque de Sombras. Su veneno funde el acero.',
    },
    guardian_luna: {
      name: 'Guardián de la Luna', sprite: 'guardian', lvl: 12, hp: 980, atk: 33, def: 27, mag: 18, res: 19, spd: 8,
      xp: 560, gold: 420, weak: ['sombra'], resist: ['luz', 'fisico'], boss: true, title: 'Custodio del segundo fragmento',
      moves: [{ id: 'luna_llena', w: 2 }, { id: 'terremoto', w: 2 }, { id: 'golpe_oscuro', w: 2 }],
      drops: [{ item: 'elixir', chance: 1 }],
      desc: 'La estatua que Brann juró proteger. Ya no distingue amigos.',
    },
    caballero_negro: {
      name: 'Caballero Negro', sprite: 'caballero', lvl: 15, hp: 1300, atk: 41, def: 27, mag: 19, res: 19, spd: 15,
      xp: 760, gold: 600, weak: ['luz'], resist: ['sombra'], boss: true, title: 'Celador del tercer fragmento',
      moves: [{ id: 'golpe_oscuro', w: 2 }, { id: 'eclipse', w: 2 }, { id: 'mordisco', w: 2 }],
      drops: [{ item: 'elixir', chance: 1 }],
      desc: 'Armadura vacía que camina por voluntad de otro.',
    },
    lord_eclipse: {
      name: 'Lord Eclipse', sprite: 'lord_eclipse', lvl: 18, hp: 2400, atk: 45, def: 29, mag: 35, res: 25, spd: 16,
      xp: 1600, gold: 1400, weak: ['luz'], resist: ['sombra'], immune: [], boss: true, title: 'El que apagó la luna',
      moves: [{ id: 'golpe_oscuro', w: 2 }, { id: 'eclipse', w: 2 }, { id: 'curacion_oscura', w: 1 }],
      drops: [],
      desc: 'Robó la luz de la Espada Celestial para no volver a ser mortal.',
    },
  };

  /* -------------------------------- REGLAS -------------------------------- */

  const STARTER_ITEMS = { pocion: 3, eter: 1, antidoto: 1 };

  function statsOf(actor) {
    const def = ACTORS[actor.id];
    const lvl = actor.lvl;
    const s = {};
    for (const k of ['hp', 'mp', 'atk', 'def', 'mag', 'res', 'spd']) {
      s[k] = def.base[k] + def.grow[k] * (lvl - 1);
    }
    for (const slot of ['arma', 'armadura', 'accesorio']) {
      const itemId = actor.equip[slot];
      if (!itemId || !ITEMS[itemId]) continue;
      const st = ITEMS[itemId].stats || {};
      for (const k of Object.keys(st)) {
        if (k === 'maxmp') s.mp += st[k];
        else if (s[k] !== undefined) s[k] += st[k];
      }
    }
    for (const k of Object.keys(s)) s[k] = Math.round(s[k]);
    return s;
  }

  function maxHp(actor) {
    return statsOf(actor).hp;
  }
  function maxMp(actor) {
    return statsOf(actor).mp;
  }

  function xpToNext(lvl) {
    return Math.round(16 * Math.pow(lvl, 1.62));
  }

  function newActor(id, lvl) {
    const def = ACTORS[id];
    const level = lvl || 1;
    const a = {
      id,
      name: def.name,
      lvl: level,
      xp: 0,
      hp: 1,
      mp: 1,
      equip: { arma: def.start.arma, armadura: def.start.armadura, accesorio: def.start.accesorio },
      skills: [],
    };
    for (const l of Object.keys(def.learn).map(Number)) {
      if (l <= level) a.skills.push(...def.learn[l]);
    }
    a.hp = maxHp(a);
    a.mp = maxMp(a);
    return a;
  }

  function levelUp(actor) {
    const gained = [];
    while (actor.lvl < 40 && actor.xp >= xpToNext(actor.lvl)) {
      actor.xp -= xpToNext(actor.lvl);
      actor.lvl++;
      const def = ACTORS[actor.id];
      const beforeHp = actor.hp;
      const beforeMp = actor.mp;
      actor.hp = Math.min(maxHp(actor), beforeHp + 12 + actor.lvl * 2);
      actor.mp = Math.min(maxMp(actor), beforeMp + 6);
      const learn = def.learn[actor.lvl] || [];
      const fresh = learn.filter((s) => !actor.skills.includes(s));
      actor.skills.push(...fresh);
      gained.push({ lvl: actor.lvl, skills: fresh });
    }
    return gained;
  }

  function elementMult(target, element) {
    if (!element || element === 'fisico') {
      if ((target.resist || []).includes('fisico')) return 0.55;
      if ((target.weak || []).includes('fisico')) return 1.5;
      return 1;
    }
    if ((target.immune || []).includes(element)) return 0;
    if ((target.weak || []).includes(element)) return 1.6;
    if ((target.resist || []).includes(element)) return 0.55;
    return 1;
  }

  function damage(opts) {
    const { atk, power, def, element, target, crit } = opts;
    const raw = atk * (power / 100);
    const mit = 100 / (100 + Math.max(0, def) * 1.35);
    let dmg = raw * mit * elementMult(target, element);
    dmg *= 0.92 + Math.random() * 0.16;
    if (crit) dmg *= 1.7;
    return Math.max(1, Math.round(dmg));
  }

  EG.data = {
    ELEMENTS, ITEMS, SKILLS, ACTORS, ENEMIES, STARTER_ITEMS,
    statsOf, maxHp, maxMp, xpToNext, newActor, levelUp, elementMult, damage,
  };
})();
