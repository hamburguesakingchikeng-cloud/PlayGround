/* Mapas construidos con un pequeño constructor de rejillas (sin errores de ancho) */
(function () {
  const EG = window.EG;

  function grid(w, h, fill) {
    const rows = [];
    for (let y = 0; y < h; y++) rows.push(new Array(w).fill(fill));
    return rows;
  }
  function box(g, x, y, w, h, ch) {
    for (let j = y; j < y + h; j++) {
      for (let i = x; i < x + w; i++) {
        if (g[j] && g[j][i] !== undefined) g[j][i] = ch;
      }
    }
  }
  function hline(g, y, x1, x2, ch) { box(g, x1, y, x2 - x1 + 1, 1, ch); }
  function vline(g, x, y1, y2, ch) { box(g, x, y1, 1, y2 - y1 + 1, ch); }
  function frame(g, ch) {
    const h = g.length, w = g[0].length;
    hline(g, 0, 0, w - 1, ch);
    hline(g, h - 1, 0, w - 1, ch);
    vline(g, 0, 0, h - 1, ch);
    vline(g, w - 1, 0, h - 1, ch);
  }
  function house(g, x, y, w, door) {
    box(g, x, y, w, 2, 'R');
    box(g, x, y + 2, w, 2, 'H');
    if (door !== undefined) g[y + 3][x + door] = 'D';
  }
  function scatter(g, seed, ch, spots) {
    for (const [x, y] of spots) if (g[y] && g[y][x] === '.') g[y][x] = ch;
  }
  function rows(g) { return g.map((r) => r.join('')); }

  const M = {};

  /* ------------------------------- ALDEA DE ALBA ------------------------------- */
  {
    const g = grid(30, 20, '.');
    frame(g, '#');
    // plaza y caminos
    box(g, 12, 8, 6, 4, '=');
    vline(g, 14, 5, 19, '=');
    vline(g, 15, 5, 19, '=');
    hline(g, 9, 6, 23, '=');
    hline(g, 10, 6, 23, '=');
    // casas
    house(g, 4, 2, 5, 2);   // herrería
    house(g, 19, 2, 5, 2);  // posada
    house(g, 4, 12, 6, 3);  // casa de Mira
    // estanque
    box(g, 22, 15, 4, 3, '~');
    g[16][21] = '~'; g[16][26] = '~';
    // árboles y detalles
    scatter(g, 1, '#', [
      [1, 1], [2, 3], [1, 8], [2, 12], [1, 17], [3, 18],
      [10, 2], [11, 1], [26, 1], [27, 3], [28, 7], [27, 10],
      [9, 6], [10, 14], [20, 8], [26, 12], [27, 18], [21, 18],
      [11, 17], [8, 18], [3, 6],
    ]);
    scatter(g, 2, 'F', [[2, 9], [12, 13], [18, 13], [24, 8], [9, 12], [27, 14]]);
    // salida sur
    g[19][14] = '='; g[19][15] = '=';
    g[18][16] = '=';

    M.alba = {
      name: 'Aldea de Alba', w: 30, h: 20, rows: rows(g), bgm: 'village', safe: true,
      tint: null,
      spawn: [14, 17],
      npcs: [
        { id: 'mira', x: 10, y: 7, sprite: 'elder', dir: 'down' },
        { id: 'dors', x: 6, y: 6, sprite: 'smith', dir: 'down' },
        { id: 'bruno', x: 21, y: 6, sprite: 'barkeep', dir: 'down' },
        { id: 'pia', x: 18, y: 12, sprite: 'girl', dir: 'left' },
        { id: 'guard', x: 13, y: 17, sprite: 'guard', dir: 'right' },
        { id: 'ivo', x: 20, y: 14, sprite: 'merchant', dir: 'left' },
      ],
      chests: [{ id: 'alba_1', x: 26, y: 9, loot: { gold: 40 } }],
      signs: [{ x: 12, y: 16, text: 'ALDEA DE ALBA\nAl sur: Camino Real.' }],
      portals: [
        { x: 14, y: 19, w: 2, h: 1, to: 'camino', tx: 17, ty: 1 },
        { x: 6, y: 5, w: 1, h: 1, to: 'tienda', tx: 6, ty: 7 },
        { x: 21, y: 5, w: 1, h: 1, to: 'posada', tx: 6, ty: 7 },
      ],
      triggers: [],
      encounters: null,
    };
  }

  /* --------------------------------- TIENDA --------------------------------- */
  {
    const g = grid(13, 9, 'f');
    frame(g, 'W');
    hline(g, 3, 2, 7, 'W'); // mostrador
    g[3][8] = 'f';
    box(g, 9, 2, 2, 1, 'W'); // estantería
    box(g, 2, 2, 2, 1, 'W');
    g[8][6] = 'D';
    g[7][6] = 'f';
    g[6][2] = 'u'; g[6][3] = 'u';
    M.tienda = {
      name: 'Herrería de Dors', w: 13, h: 9, rows: rows(g), bgm: 'village', safe: true,
      spawn: [6, 7],
      npcs: [{ id: 'dors_tienda', x: 5, y: 2, sprite: 'smith', dir: 'down' }],
      chests: [],
      signs: [],
      portals: [{ x: 6, y: 8, w: 1, h: 1, to: 'alba', tx: 6, ty: 6 }],
      triggers: [],
      encounters: null,
    };
  }

  /* --------------------------------- POSADA --------------------------------- */
  {
    const g = grid(13, 9, 'f');
    frame(g, 'W');
    box(g, 2, 2, 2, 1, 'u');
    box(g, 2, 4, 2, 1, 'u');
    box(g, 2, 6, 2, 1, 'u');
    box(g, 9, 2, 2, 2, 'W'); // barra
    g[8][6] = 'D';
    g[7][6] = 'f';
    M.posada = {
      name: 'Posada de Bruno', w: 13, h: 9, rows: rows(g), bgm: 'village', safe: true,
      spawn: [6, 7],
      npcs: [{ id: 'bruno_posada', x: 9, y: 4, sprite: 'barkeep', dir: 'left' }],
      chests: [],
      signs: [],
      portals: [{ x: 6, y: 8, w: 1, h: 1, to: 'alba', tx: 21, ty: 6 }],
      triggers: [],
      encounters: null,
    };
  }

  /* --------------------------------- CAMINO --------------------------------- */
  {
    const g = grid(36, 22, '.');
    frame(g, '#');
    // caminos
    vline(g, 17, 0, 21, '=');
    vline(g, 18, 0, 21, '=');
    hline(g, 10, 0, 35, '=');
    hline(g, 11, 0, 35, '=');
    // estanque y rocas
    box(g, 24, 3, 5, 3, '~');
    scatter(g, 3, 'r', [[6, 5], [7, 5], [7, 6], [29, 13], [30, 13], [13, 16], [14, 16]]);
    // bosques
    scatter(g, 4, '#', [
      [2, 2], [3, 3], [4, 2], [2, 6], [3, 8], [5, 3],
      [9, 2], [10, 2], [11, 3], [9, 4], [12, 5], [14, 3],
      [22, 1], [23, 2], [31, 1], [32, 2], [33, 3], [31, 5],
      [28, 6], [30, 7], [33, 7], [34, 8], [2, 14], [3, 15],
      [5, 17], [4, 19], [7, 19], [9, 18], [11, 20], [12, 18],
      [22, 14], [23, 15], [25, 17], [26, 18], [28, 16], [31, 15],
      [32, 17], [34, 19], [33, 12], [6, 12], [8, 13], [12, 12],
    ]);
    // hierba alta (encuentros)
    box(g, 4, 8, 5, 2, ',');
    box(g, 22, 8, 4, 1, ',');
    box(g, 25, 18, 5, 2, ',');
    box(g, 8, 15, 5, 2, ',');
    box(g, 6, 1, 4, 1, ',');
    box(g, 27, 9, 5, 2, ',');
    // flores
    scatter(g, 5, 'F', [[19, 6], [15, 14], [23, 19], [5, 16], [32, 10]]);
    // salidas
    g[0][17] = '='; g[0][18] = '=';
    g[21][17] = '='; g[21][18] = '=';
    g[10][0] = '='; g[11][0] = '=';
    g[10][35] = '='; g[11][35] = '=';

    M.camino = {
      name: 'Camino Real', w: 36, h: 22, rows: rows(g), bgm: 'field', safe: false,
      spawn: [17, 1],
      npcs: [{ id: 'ivo', x: 9, y: 13, sprite: 'merchant', dir: 'right' }],
      chests: [{ id: 'camino_1', x: 31, y: 18, loot: { gold: 120, item: 'pocion' } }],
      signs: [
        { x: 19, y: 12, text: 'CAMINO REAL\nNorte: Alba.  Oeste: Bosque de Sombras.\nEste: Ruinas de la Luna.  Sur: Castillo del Eclipse.' },
      ],
      portals: [
        { x: 17, y: 0, w: 2, h: 1, to: 'alba', tx: 14, ty: 18 },
        { x: 0, y: 10, w: 1, h: 2, to: 'bosque', tx: 30, ty: 12 },
        { x: 35, y: 10, w: 1, h: 2, to: 'ruinas', tx: 1, ty: 11 },
        { x: 17, y: 21, w: 2, h: 1, to: 'castillo', tx: 15, ty: 22, need: { fragments: 2 }, lockedText: 'Dos fragmentos laten en tu mochila. La puerta aún no reconoce su luz.' },
      ],
      triggers: [],
      encounters: { tiles: [','], rate: 0.11, pool: ['limo', 'limo', 'lobo', 'murcielago'], levels: [1, 3] },
    };
  }

  /* ----------------------------- BOSQUE DE SOMBRAS ----------------------------- */
  {
    const g = grid(32, 24, '#');
    // senda principal
    hline(g, 12, 20, 31, '.');
    vline(g, 20, 7, 12, '.');
    box(g, 15, 4, 9, 5, '.');   // claro de Lyra
    hline(g, 6, 9, 16, '.');
    vline(g, 9, 6, 15, '.');
    box(g, 4, 14, 9, 6, '.');   // santuario del fragmento
    box(g, 7, 15, 4, 4, 'f');
    // accesos a cofres y flores
    box(g, 24, 7, 4, 3, '.');   // cofre este
    box(g, 9, 4, 4, 2, '.');    // flor 1
    box(g, 2, 10, 5, 3, '.');   // flor 2
    box(g, 12, 19, 6, 3, '.');  // flor 3
    // claros con hierba alta (encuentros)
    box(g, 16, 5, 7, 3, ',');
    box(g, 21, 16, 6, 4, ',');
    box(g, 3, 8, 4, 2, ',');
    // detalles
    scatter(g, 6, 'r', [[13, 4], [14, 11], [24, 11], [26, 20], [6, 20], [10, 8], [2, 9]]);
    scatter(g, 7, 'F', [[11, 5], [14, 21], [3, 12], [18, 21], [19, 8], [5, 13]]);
    scatter(g, 8, 'C', [[8, 18]]);
    // árboles sueltos dentro de claros
    scatter(g, 9, '#', [[17, 8], [24, 13], [13, 13], [3, 17], [29, 5], [12, 8]]);
    g[12][31] = '.';

    M.bosque = {
      name: 'Bosque de Sombras', w: 32, h: 24, rows: rows(g), bgm: 'dark', safe: false,
      tint: 'rgba(20,10,40,0.18)',
      spawn: [30, 12],
      npcs: [{ id: 'lyra_web', x: 19, y: 6, sprite: 'lyra', dir: 'down' }],
      chests: [
        { id: 'bosque_1', x: 26, y: 8, loot: { item: 'llave_ruinas' } },
        { id: 'bosque_2', x: 4, y: 16, loot: { gold: 80, item: 'pocion_mayor' } },
      ],
      signs: [],
      flowers: [{ id: 'flor_1', x: 11, y: 5 }, { id: 'flor_2', x: 3, y: 12 }, { id: 'flor_3', x: 14, y: 21 }],
      portals: [{ x: 31, y: 12, w: 1, h: 1, to: 'camino', tx: 1, ty: 10 }],
      triggers: [
        { id: 'boss_arana', x: 8, y: 16, w: 3, h: 3, script: 'boss_arana', once: true },
      ],
      encounters: { tiles: [','], rate: 0.13, pool: ['lobo', 'arana', 'murcielago'], levels: [3, 7] },
    };
  }

  /* ----------------------------- RUINAS DE LA LUNA ----------------------------- */
  {
    const g = grid(30, 22, 'f');
    frame(g, 'W');
    // muros interiores
    vline(g, 15, 1, 4, 'W');
    vline(g, 15, 6, 20, 'W');
    hline(g, 9, 16, 28, 'W');
    g[5][15] = 'D';
    g[9][22] = 'W';
    box(g, 18, 3, 2, 2, 'W');
    box(g, 24, 3, 2, 2, 'W');
    // pilares y cristales
    scatter(g, 10, 'p', [[5, 5], [5, 16], [10, 16], [20, 15], [25, 12], [11, 5], [23, 19]]);
    scatter(g, 11, 'C', [[3, 7], [8, 18], [27, 6], [19, 12], [13, 20]]);
    scatter(g, 12, 'u', [[6, 11], [7, 11], [21, 6], [22, 6], [23, 6]]);
    // entrada
    g[11][0] = '.'; g[11][1] = '.';
    g[10][0] = '.'; g[10][1] = '.';

    M.ruinas = {
      name: 'Ruinas de la Luna', w: 30, h: 22, rows: rows(g), bgm: 'dark', safe: false,
      tint: 'rgba(10,20,40,0.22)',
      spawn: [2, 11],
      npcs: [
        { id: 'brann', x: 4, y: 11, sprite: 'brann', dir: 'right' },
      ],
      chests: [
        { id: 'ruinas_1', x: 12, y: 3, loot: { item: 'pocion_mayor' } },
        { id: 'ruinas_2', x: 25, y: 18, loot: { item: 'filo_lunar' } },
        { id: 'ruinas_3', x: 27, y: 12, loot: { gold: 200, item: 'elixir' } },
      ],
      signs: [],
      portals: [{ x: 0, y: 10, w: 1, h: 2, to: 'camino', tx: 34, ty: 10 }],
      triggers: [
        { id: 'door_sello', x: 15, y: 5, w: 1, h: 1, script: 'door_sello', once: true },
        { id: 'boss_guardian', x: 21, y: 5, w: 2, h: 2, script: 'boss_guardian', once: true },
      ],
      encounters: { tiles: ['f'], rate: 0.075, pool: ['esqueleto', 'espectro', 'golem'], levels: [7, 11] },
    };
  }

  /* ---------------------------- CASTILLO DEL ECLIPSE ---------------------------- */
  {
    const g = grid(30, 24, 'f');
    frame(g, 'W');
    // pasillo de entrada
    box(g, 10, 16, 10, 7, 'f');
    hline(g, 16, 1, 9, 'W');
    hline(g, 16, 20, 28, 'W');
    vline(g, 9, 1, 16, 'W');
    vline(g, 20, 1, 16, 'W');
    // salas laterales
    box(g, 1, 10, 8, 6, 'f');
    g[13][9] = 'f';
    box(g, 21, 10, 8, 6, 'f');
    g[13][20] = 'f';
    // salón del trono (norte)
    g[9][9] = 'D'; g[9][20] = 'D';
    box(g, 10, 1, 10, 8, 'f');
    box(g, 12, 2, 6, 4, 'u');
    g[2][15] = 'D'; // puerta al trono
    // decoración
    scatter(g, 13, 'p', [[11, 3], [18, 3], [11, 7], [18, 7], [12, 20], [17, 20], [4, 12], [25, 12]]);
    scatter(g, 14, 'C', [[2, 11], [27, 11], [6, 18], [23, 18], [15, 6]]);
    // entrada
    g[23][15] = 'D';
    g[22][15] = 'f';

    M.castillo = {
      name: 'Castillo del Eclipse', w: 30, h: 24, rows: rows(g), bgm: 'dark', safe: false,
      tint: 'rgba(35,10,45,0.26)',
      spawn: [15, 22],
      npcs: [],
      chests: [
        { id: 'castillo_1', x: 4, y: 12, loot: { item: 'elixir' } },
        { id: 'castillo_2', x: 25, y: 12, loot: { item: 'talisman_luna' } },
        { id: 'castillo_3', x: 6, y: 18, loot: { item: 'pocion_mayor' } },
      ],
      signs: [],
      portals: [
        { x: 15, y: 23, w: 1, h: 1, to: 'camino', tx: 17, ty: 20 },
        {
          x: 15, y: 2, w: 1, h: 1, to: 'trono', tx: 9, ty: 10,
          need: { fragments: 3 }, lockedText: 'La puerta del trono exige los tres fragmentos. Aún falta luz.',
        },
      ],
      triggers: [
        { id: 'boss_knight', x: 15, y: 4, w: 1, h: 2, script: 'boss_knight', once: true },
      ],
      encounters: { tiles: ['f'], rate: 0.09, pool: ['caballero_eclipse', 'espectro', 'golem'], levels: [12, 15] },
    };
  }

  /* ------------------------------- SALÓN DEL TRONO ------------------------------- */
  {
    const g = grid(19, 13, 'f');
    frame(g, 'W');
    box(g, 7, 1, 5, 2, 'u');
    scatter(g, 15, 'p', [[3, 3], [15, 3], [3, 9], [15, 9]]);
    scatter(g, 16, 'C', [[1, 6], [17, 6]]);
    g[12][9] = 'D';
    g[11][9] = 'f';

    M.trono = {
      name: 'Trono del Eclipse', w: 19, h: 13, rows: rows(g), bgm: 'dark', safe: false,
      tint: 'rgba(45,5,35,0.3)',
      spawn: [9, 10],
      npcs: [],
      chests: [],
      signs: [],
      portals: [{ x: 9, y: 12, w: 1, h: 1, to: 'castillo', tx: 15, ty: 3 }],
      triggers: [
        { id: 'boss_lord', x: 9, y: 4, w: 1, h: 2, script: 'boss_lord', once: true },
      ],
      encounters: null,
    };
  }

  const SOLID = new Set(['#', '~', 'r', 'H', 'R', 'W', 'p', 'C', 'x']);
  const TILE_ART = {
    '.': 'grass',
    ',': 'tall',
    '=': 'path',
    '~': 'water',
    'b': 'bridge',
    '#': 'tree',
    'r': 'rock',
    'H': 'wall',
    'R': 'roof',
    'D': 'door',
    'W': 'stone',
    'f': 'floor',
    't': 'stairs',
    'F': 'flower',
    'p': 'pillar',
    'C': 'crystal',
    's': 'sand',
    'u': 'rug',
    'x': 'void',
  };

  EG.maps = M;
  EG.mapUtil = {
    SOLID,
    TILE_ART,
    isSolid(map, x, y) {
      if (!map || x < 0 || y < 0 || x >= map.w || y >= map.h) return true;
      return SOLID.has(map.rows[y][x]);
    },
    charAt(map, x, y) {
      if (!map || x < 0 || y < 0 || x >= map.w || y >= map.h) return '#';
      return map.rows[y][x];
    },
  };
})();
