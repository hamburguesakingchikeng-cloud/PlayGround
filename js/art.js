/* Arte procedural: todo se dibuja en canvas, sin archivos externos */
(function () {
  const EG = window.EG;
  const art = (EG.art = { tiles: {}, chars: {}, enemies: {}, icons: {}, misc: {} });

  const TILE = 16;
  art.TILE = TILE;

  function make(w, h, fn) {
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    const g = c.getContext('2d');
    g.imageSmoothingEnabled = false;
    fn(g);
    return c;
  }

  function R(g, x, y, w, h, c) {
    g.fillStyle = c;
    g.fillRect(x, y, w, h);
  }

  function disc(g, cx, cy, rx, ry, col) {
    g.fillStyle = col;
    for (let y = -ry; y < ry; y++) {
      const w = Math.sqrt(Math.max(0, 1 - (y * y) / (ry * ry))) * rx;
      g.fillRect(Math.round(cx - w), Math.round(cy + y), Math.max(1, Math.round(w * 2)), 1);
    }
  }

  // Pseudoaleatorio estable para texturas de tiles
  function hash(x, y, s) {
    let n = x * 374761393 + y * 668265263 + s * 982451653;
    n = (n ^ (n >> 13)) * 1274126177;
    return ((n ^ (n >> 16)) >>> 0) / 4294967295;
  }

  /* ------------------------------- TILES ------------------------------- */

  function grassTile(seed, base, blade) {
    return make(TILE, TILE, (g) => {
      R(g, 0, 0, 16, 16, base);
      for (let i = 0; i < 26; i++) {
        const x = Math.floor(hash(i, 1, seed) * 16);
        const y = Math.floor(hash(i, 2, seed) * 16);
        R(g, x, y, 1, 1, i % 3 ? blade : '#3d6b33');
      }
      for (let i = 0; i < 3; i++) {
        const x = Math.floor(hash(i, 5, seed) * 15);
        const y = Math.floor(hash(i, 7, seed) * 15);
        R(g, x, y, 2, 1, blade);
        R(g, x, y - 1, 1, 1, blade);
      }
    });
  }

  function pathTile(seed) {
    return make(TILE, TILE, (g) => {
      R(g, 0, 0, 16, 16, '#a08a5c');
      for (let i = 0; i < 22; i++) {
        const x = Math.floor(hash(i, 3, seed) * 16);
        const y = Math.floor(hash(i, 4, seed) * 16);
        R(g, x, y, 1, 1, hash(i, 9, seed) > 0.5 ? '#b9a271' : '#8a7448');
      }
      R(g, 2, 4, 3, 2, '#8a7448');
      R(g, 10, 11, 4, 2, '#8a7448');
    });
  }

  function waterTile(frame) {
    return make(TILE, TILE, (g) => {
      R(g, 0, 0, 16, 16, '#24557f');
      const off = frame ? 4 : 0;
      for (let y = 0; y < 16; y += 4) {
        const w = 6 + ((y + off) % 8);
        R(g, ((y * 3 + off) % 12) - 2, y, w, 1, '#3d7fae');
        R(g, ((y * 5 + off) % 10) + 4, y + 2, 4, 1, '#5fa3d1');
      }
      R(g, 0, 0, 16, 1, '#1b4266');
    });
  }

  function tallGrassTile() {
    return make(TILE, TILE, (g) => {
      R(g, 0, 0, 16, 16, '#3d6b36');
      for (let i = 0; i < 7; i++) {
        const x = 1 + i * 2;
        const h = 5 + Math.floor(hash(i, 1, 3) * 7);
        R(g, x, 16 - h, 2, h, '#4f8a45');
        R(g, x, 16 - h, 1, 2, '#6aa85c');
      }
      R(g, 0, 15, 16, 1, '#2d5129');
    });
  }

  function treeTile() {
    return make(TILE, TILE, (g) => {
      R(g, 0, 0, 16, 16, '#3f7a3a');
      R(g, 7, 10, 3, 6, '#5a3a22');
      R(g, 7, 10, 1, 6, '#7a5234');
      disc(g, 8, 6, 7, 7, '#2e5c2c');
      disc(g, 7, 5, 5, 5, '#3d7a38');
      disc(g, 6, 4, 2, 2, '#58944a');
      R(g, 3, 11, 10, 1, 'rgba(0,0,0,0.18)');
    });
  }

  function rockTile() {
    return make(TILE, TILE, (g) => {
      R(g, 0, 0, 16, 16, '#4a7440');
      R(g, 3, 5, 10, 9, '#6f737e');
      R(g, 2, 7, 12, 6, '#7d828d');
      R(g, 4, 4, 6, 3, '#8f949e');
      R(g, 3, 13, 10, 2, '#4d515b');
      R(g, 6, 7, 3, 1, '#5c606a');
      R(g, 2, 14, 12, 1, 'rgba(0,0,0,0.2)');
    });
  }

  function houseWallTile() {
    return make(TILE, TILE, (g) => {
      R(g, 0, 0, 16, 16, '#d9c6a0');
      R(g, 0, 0, 16, 2, '#b8a37c');
      R(g, 0, 14, 16, 2, '#b8a37c');
      R(g, 0, 0, 2, 16, '#8a6a44');
      R(g, 14, 0, 2, 16, '#8a6a44');
      R(g, 0, 7, 16, 2, '#8a6a44');
      R(g, 5, 2, 6, 5, '#4a6a8a');
      R(g, 6, 3, 4, 3, '#7fa8c9');
    });
  }

  function roofTile() {
    return make(TILE, TILE, (g) => {
      R(g, 0, 0, 16, 16, '#a34a3c');
      for (let y = 0; y < 16; y += 4) {
        R(g, 0, y, 16, 1, '#7d352b');
        for (let x = (y / 4) % 2 ? -4 : 0; x < 16; x += 8) {
          R(g, x, y + 1, 7, 3, '#b85a49');
        }
      }
      R(g, 0, 15, 16, 1, '#61261f');
    });
  }

  function doorTile() {
    return make(TILE, TILE, (g) => {
      R(g, 0, 0, 16, 16, '#d9c6a0');
      R(g, 2, 1, 12, 15, '#6b4527');
      R(g, 3, 2, 10, 13, '#8a5c33');
      R(g, 7, 2, 2, 13, '#6b4527');
      R(g, 11, 7, 2, 2, '#e8c66a');
      R(g, 0, 0, 1, 16, '#8a6a44');
      R(g, 15, 0, 1, 16, '#8a6a44');
    });
  }

  function stoneWallTile(seed) {
    return make(TILE, TILE, (g) => {
      R(g, 0, 0, 16, 16, '#5a6070');
      for (let y = 0; y < 16; y += 5) {
        for (let x = (y / 5) % 2 ? -4 : 0; x < 16; x += 9) {
          R(g, x + 1, y + 1, 7, 3, '#717889');
          R(g, x + 1, y + 1, 7, 1, '#848c9e');
        }
      }
      R(g, 0, 15, 16, 1, '#3d4250');
      if (seed) R(g, 3, 9, 2, 3, '#4b7a4a');
    });
  }

  function floorTile(seed) {
    return make(TILE, TILE, (g) => {
      R(g, 0, 0, 16, 16, '#7d8296');
      R(g, 0, 0, 15, 1, '#9298ac');
      R(g, 0, 0, 1, 15, '#9298ac');
      R(g, 0, 15, 16, 1, '#5d6274');
      R(g, 15, 0, 1, 16, '#5d6274');
      if (seed) {
        R(g, 4, 6, 1, 4, '#6b7084');
        R(g, 9, 3, 1, 3, '#6b7084');
      }
    });
  }

  function stairsTile() {
    return make(TILE, TILE, (g) => {
      R(g, 0, 0, 16, 16, '#6a6f80');
      for (let i = 0; i < 4; i++) {
        R(g, 1, 2 + i * 4, 14, 2, '#8b91a4');
        R(g, 1, 4 + i * 4, 14, 1, '#4f5464');
      }
    });
  }

  function flowerTile() {
    return make(TILE, TILE, (g) => {
      const base = grassTile(11, '#4a7a3c', '#5b8f4a');
      g.drawImage(base, 0, 0);
      R(g, 6, 7, 1, 5, '#3d6b33');
      R(g, 5, 8, 1, 3, '#3d6b33');
      R(g, 8, 8, 1, 3, '#3d6b33');
      R(g, 4, 4, 3, 3, '#f2e6b0');
      R(g, 7, 3, 3, 3, '#e8c66a');
      R(g, 5, 5, 2, 2, '#fff8d8');
      R(g, 9, 5, 2, 2, '#c9a94e');
    });
  }

  function pillarTile() {
    return make(TILE, TILE, (g) => {
      R(g, 0, 0, 16, 16, '#5d6274');
      R(g, 4, 1, 8, 14, '#8b91a4');
      R(g, 3, 0, 10, 3, '#a4aab9');
      R(g, 3, 13, 10, 3, '#6d7285');
      R(g, 5, 3, 1, 10, '#a4aab9');
      R(g, 10, 3, 1, 10, '#71778a');
    });
  }

  function crystalTile() {
    return make(TILE, TILE, (g) => {
      R(g, 0, 0, 16, 16, '#3a3550');
      R(g, 6, 3, 4, 11, '#7fd8e8');
      R(g, 7, 1, 2, 14, '#a8f0ff');
      R(g, 8, 4, 1, 8, '#e8ffff');
      R(g, 4, 8, 3, 6, '#5fb8cc');
      R(g, 6, 8, 1, 5, '#9fe8f5');
      R(g, 2, 12, 12, 2, 'rgba(127,216,232,0.25)');
    });
  }

  function sandTile() {
    return make(TILE, TILE, (g) => {
      R(g, 0, 0, 16, 16, '#d5c089');
      for (let i = 0; i < 18; i++) {
        const x = Math.floor(hash(i, 8, 2) * 16);
        const y = Math.floor(hash(i, 12, 2) * 16);
        R(g, x, y, 1, 1, hash(i, 3, 2) > 0.5 ? '#e6d5a4' : '#bda870');
      }
    });
  }

  function voidTile() {
    return make(TILE, TILE, (g) => {
      R(g, 0, 0, 16, 16, '#141425');
      R(g, 4, 6, 2, 2, '#2a2a45');
      R(g, 11, 11, 1, 1, '#3a3a5e');
    });
  }

  function bridgeTile() {
    return make(TILE, TILE, (g) => {
      R(g, 0, 0, 16, 16, '#8a6a3f');
      for (let y = 1; y < 16; y += 4) {
        R(g, 0, y, 16, 2, '#a88253');
        R(g, 0, y + 2, 16, 1, '#6b4f2c');
      }
      R(g, 0, 0, 2, 16, '#5a4326');
      R(g, 14, 0, 2, 16, '#5a4326');
    });
  }

  function rugTile() {
    return make(TILE, TILE, (g) => {
      R(g, 0, 0, 16, 16, '#6d2f3a');
      R(g, 2, 2, 12, 12, '#8c3d4a');
      R(g, 4, 4, 8, 8, '#a84f5c');
      R(g, 6, 6, 4, 4, '#d9a84e');
    });
  }

  /* ------------------------------ PERSONAJES ------------------------------ */

  function drawChar(g, p, dir, frame) {
    const skin = p.skin || '#e8b98a';
    const hair = p.hair || '#3b2a1e';
    const tunic = p.tunic || '#2f4f8f';
    const trim = p.trim || '#e8c66a';
    const pants = p.pants || '#3a3f52';
    const boots = p.boots || '#4a3222';
    const step = frame ? 1 : 0;

    if (p.cape) {
      R(g, dir === 'side' ? 3 : 3, 8, dir === 'side' ? 9 : 10, 11, p.cape);
      R(g, 4, 17, 8, 3, p.cape);
    }

    if (dir === 'down') {
      R(g, 5, 16, 3, 4 + step, pants);
      R(g, 8, 16, 3, 5 - step, pants);
      R(g, 4, 19 + step, 4, 2, boots);
      R(g, 8, 20 - step, 4, 2, boots);

      R(g, 3, 1, 10, 7, hair);
      R(g, 4, 3, 8, 5, skin);
      R(g, 3, 3, 2, 4, hair);
      R(g, 11, 3, 2, 4, hair);
      R(g, 4, 1, 8, 3, hair);
      R(g, 5, 5, 1, 2, '#1d1d2b');
      R(g, 10, 5, 1, 2, '#1d1d2b');
      R(g, 6, 4, 1, 1, '#20202f');
      R(g, 9, 4, 1, 1, '#20202f');
      R(g, 7, 7, 2, 1, '#c98d7a');

      R(g, 3, 9, 10, 7, tunic);
      R(g, 3, 9, 2, 6, p.sleeve || tunic);
      R(g, 11, 9, 2, 6, p.sleeve || tunic);
      R(g, 4, 15, 8, 1, '#3a2c1e');
      R(g, 7, 15, 2, 1, trim);
      R(g, 3, 15, 2, 2, skin);
      R(g, 11, 15, 2, 2, skin);
      R(g, 4, 8, 8, 1, trim);

      if (p.beard) R(g, 5, 6, 6, 3, p.beard);
      if (p.hat === 'hood') {
        R(g, 2, 0, 12, 8, p.hood || tunic);
        R(g, 4, 3, 8, 5, skin);
        R(g, 3, 3, 2, 4, p.hood || tunic);
        R(g, 11, 3, 2, 4, p.hood || tunic);
        R(g, 2, 9, 12, 2, p.hood || tunic);
      }
      if (p.hat === 'helmet') {
        R(g, 3, 1, 10, 7, '#9aa0ad');
        R(g, 4, 4, 8, 1, '#2b2b3a');
        R(g, 7, 1, 2, 6, '#c8ccd6');
        R(g, 3, 6, 10, 2, '#7d8494');
      }
      if (p.hat === 'straw') {
        R(g, 1, 3, 14, 2, '#c9a94e');
        R(g, 4, 0, 8, 3, '#e0c374');
      }
      if (p.hat === 'crown') {
        R(g, 4, 0, 8, 2, '#e8c66a');
        R(g, 5, -2, 1, 2, '#e8c66a');
        R(g, 8, -2, 1, 2, '#e8c66a');
        R(g, 10, -1, 1, 1, '#e8c66a');
      }
      if (p.weapon) {
        R(g, 13, 8, 1, 8, '#c8ccd6');
        R(g, 12, 15, 3, 1, '#8a6a3f');
        R(g, 13, 7, 1, 1, '#e8f0ff');
      }
    } else if (dir === 'up') {
      R(g, 5, 16, 3, 4 + step, pants);
      R(g, 8, 16, 3, 5 - step, pants);
      R(g, 4, 19 + step, 4, 2, boots);
      R(g, 8, 20 - step, 4, 2, boots);

      R(g, 3, 1, 10, 8, hair);
      R(g, 4, 8, 8, 2, skin);
      R(g, 3, 9, 10, 7, tunic);
      R(g, 3, 9, 2, 6, p.sleeve || tunic);
      R(g, 11, 9, 2, 6, p.sleeve || tunic);
      R(g, 4, 15, 8, 1, '#3a2c1e');
      R(g, 4, 8, 8, 1, trim);
      R(g, 3, 15, 2, 2, skin);
      R(g, 11, 15, 2, 2, skin);
      if (p.hat === 'hood') {
        R(g, 2, 0, 12, 9, p.hood || tunic);
        R(g, 3, 9, 10, 3, p.hood || tunic);
      }
      if (p.hat === 'helmet') R(g, 3, 1, 10, 7, '#9aa0ad');
      if (p.hat === 'straw') {
        R(g, 1, 3, 14, 2, '#c9a94e');
        R(g, 4, 0, 8, 3, '#e0c374');
      }
      if (p.hat === 'crown') R(g, 4, 0, 8, 2, '#e8c66a');
      if (p.weapon) R(g, 12, 6, 2, 11, '#c8ccd6');
    } else {
      R(g, 6, 16, 4, 4 + step, pants);
      R(g, 6, 19 + step, 5, 2, boots);
      R(g, 5, 2, 8, 7, hair);
      R(g, 6, 3, 7, 5, skin);
      R(g, 5, 3, 2, 4, hair);
      R(g, 5, 1, 8, 3, hair);
      R(g, 10, 4, 1, 2, '#20202f');
      R(g, 7, 7, 2, 1, '#c98d7a');

      R(g, 5, 9, 8, 7, tunic);
      R(g, 4, 9, 2, 5, p.sleeve || tunic);
      R(g, 4, 13, 2, 2, skin);
      R(g, 6, 15, 6, 1, '#3a2c1e');
      R(g, 6, 8, 6, 1, trim);
      if (p.hat === 'hood') {
        R(g, 4, 0, 10, 8, p.hood || tunic);
        R(g, 6, 3, 7, 5, skin);
        R(g, 5, 3, 2, 4, p.hood || tunic);
        R(g, 4, 9, 10, 2, p.hood || tunic);
      }
      if (p.hat === 'helmet') {
        R(g, 5, 1, 8, 7, '#9aa0ad');
        R(g, 6, 4, 6, 1, '#2b2b3a');
      }
      if (p.hat === 'straw') {
        R(g, 3, 3, 12, 2, '#c9a94e');
        R(g, 5, 0, 7, 3, '#e0c374');
      }
      if (p.hat === 'crown') R(g, 5, 0, 7, 2, '#e8c66a');
      if (p.weapon) {
        R(g, 12, 7, 1, 9, '#c8ccd6');
        R(g, 11, 14, 3, 1, '#8a6a3f');
      }
    }
  }

  function character(p) {
    const out = {};
    for (const dir of ['down', 'up', 'side']) {
      out[dir] = [0, 1].map((f) => make(16, 22, (g) => drawChar(g, p, dir, f)));
    }
    return out;
  }

  const CHARS = {
    kael: { skin: '#e8b98a', hair: '#3b2a1e', tunic: '#2f4f8f', sleeve: '#26406f', trim: '#e8c66a', pants: '#3a3f52', boots: '#5a3d28', weapon: true, cape: '#7d2a36' },
    lyra: { skin: '#f0c9a0', hair: '#5b2f6e', tunic: '#6a3f8f', sleeve: '#57317a', trim: '#d9c7ff', pants: '#3d2b52', boots: '#4a3222', hat: 'hood', hood: '#6a3f8f', weapon: true },
    brann: { skin: '#d9a878', hair: '#4a3626', tunic: '#8a9099', sleeve: '#6f757e', trim: '#c9a94e', pants: '#4b4f5c', boots: '#3a2c1e', hat: 'helmet', beard: '#6b4a2a', weapon: true },
    elder: { skin: '#e0bb96', hair: '#cfd2da', tunic: '#6b5b7d', trim: '#c9a94e', pants: '#4a4055', boots: '#3a2c1e', hat: 'hood', hood: '#5b4c6b' },
    smith: { skin: '#c98d63', hair: '#2a2a2a', tunic: '#7a4a2a', sleeve: '#8a5a35', trim: '#5a3a20', pants: '#3a3f52', boots: '#2a2a2a', beard: '#2a2a2a' },
    barkeep: { skin: '#d9a878', hair: '#6b4a2a', tunic: '#3f6b4a', trim: '#c9a94e', pants: '#3a3f52', boots: '#4a3222' },
    girl: { skin: '#f0c9a0', hair: '#c96a3a', tunic: '#c96a8a', trim: '#f2e6b0', pants: '#8a4a5a', boots: '#6b3a2a' },
    guard: { skin: '#d9a878', hair: '#3b2a1e', tunic: '#5a6070', sleeve: '#4a5060', trim: '#9aa0ad', pants: '#3a3f52', boots: '#2a2a2a', hat: 'helmet', weapon: true },
    merchant: { skin: '#c98d63', hair: '#4a3626', tunic: '#7d5a9e', trim: '#e8c66a', pants: '#3a3f52', boots: '#4a3222', hat: 'straw' },
    kid: { skin: '#e8b98a', hair: '#8a5c33', tunic: '#4a7a9e', trim: '#f2e6b0', pants: '#3a3f52', boots: '#4a3222' },
    knight: { skin: '#000000', hair: '#000000', tunic: '#2b2f45', sleeve: '#22263a', trim: '#8a2f3a', pants: '#1d2030', boots: '#14161f', hat: 'helmet', weapon: true, cape: '#5b1f2a' },
  };

  art.initChars = function () {
    for (const key of Object.keys(CHARS)) art.chars[key] = character(CHARS[key]);
  };

  /* -------------------------------- ENEMIGOS -------------------------------- */

  const ENEMY_DRAW = {
    limo(g, f) {
      const bob = f ? 1 : 0;
      disc(g, 16, 23 - bob, 11, 8, '#3f9e52');
      disc(g, 16, 24 - bob, 10, 7, '#54c06a');
      disc(g, 13, 20 - bob, 4, 3, '#7fdd8f');
      R(g, 11, 22 - bob, 3, 4, '#1d2a22');
      R(g, 19, 22 - bob, 3, 4, '#1d2a22');
      R(g, 12, 23 - bob, 1, 1, '#e8fff0');
      R(g, 20, 23 - bob, 1, 1, '#e8fff0');
      R(g, 15, 27 - bob, 3, 1, '#2a5c36');
      disc(g, 16, 29, 9, 2, 'rgba(0,0,0,0.18)');
    },
    limo_rey(g, f) {
      const bob = f ? 1 : 0;
      disc(g, 16, 22 - bob, 12, 9, '#b98b2a');
      disc(g, 16, 24 - bob, 11, 8, '#e8c66a');
      disc(g, 12, 19 - bob, 4, 3, '#fff0b8');
      R(g, 10, 21 - bob, 3, 4, '#2a2418');
      R(g, 20, 21 - bob, 3, 4, '#2a2418');
      R(g, 11, 22 - bob, 1, 1, '#fff8d8');
      R(g, 21, 22 - bob, 1, 1, '#fff8d8');
      R(g, 13, 4, 7, 3, '#e8c66a');
      R(g, 14, 1, 1, 4, '#e8c66a');
      R(g, 16, 0, 1, 4, '#e8c66a');
      R(g, 18, 1, 1, 4, '#e8c66a');
      disc(g, 16, 29, 10, 2, 'rgba(0,0,0,0.18)');
    },
    lobo(g, f) {
      const legA = f ? 2 : 0;
      disc(g, 19, 18, 8, 6, '#6b7180');
      disc(g, 13, 16, 6, 5, '#7d8494');
      R(g, 6, 13, 8, 7, '#8a91a1');
      R(g, 4, 10, 7, 6, '#9aa1b1');
      R(g, 3, 8, 3, 3, '#9aa1b1');
      R(g, 7, 7, 3, 3, '#9aa1b1');
      R(g, 3, 3, 3, 6, '#5d6272');
      R(g, 8, 4, 3, 5, '#5d6272');
      R(g, 4, 11, 2, 2, '#e8c66a');
      R(g, 9, 12, 2, 1, '#2a2f3a');
      R(g, 9, 14, 2, 1, '#d9d9e0');
      R(g, 16, 22, 3, 5 + legA, '#5d6272');
      R(g, 21, 22, 3, 6 - legA, '#5d6272');
      R(g, 12, 22, 3, 4, '#5d6272');
      R(g, 23, 14, 5, 3, '#8a91a1');
      R(g, 27, 12, 3, 3, '#9aa1b1');
      disc(g, 18, 29, 11, 2, 'rgba(0,0,0,0.18)');
    },
    murcielago(g, f) {
      const wing = f ? 3 : 0;
      disc(g, 16, 18, 5, 6, '#5b3f7a');
      R(g, 14, 10, 2, 4, '#5b3f7a');
      R(g, 18, 10, 2, 4, '#5b3f7a');
      R(g, 9 - wing, 12, 8, 8, '#4a3266');
      R(g, 2 - wing, 14, 8, 5, '#3d2954');
      R(g, 23 + wing, 12, 8, 8, '#4a3266');
      R(g, 30 + wing, 14, 8, 5, '#3d2954');
      R(g, 8 - wing, 20, 6, 1, '#2a1b3a');
      R(g, 24 + wing, 14, 6, 1, '#2a1b3a');
      R(g, 13, 16, 2, 2, '#e85a5a');
      R(g, 18, 16, 2, 2, '#e85a5a');
      R(g, 15, 20, 1, 2, '#f2e6b0');
      R(g, 17, 20, 1, 2, '#f2e6b0');
      disc(g, 16, 29, 8, 2, 'rgba(0,0,0,0.18)');
    },
    arana(g, f) {
      const s = f ? 1 : 0;
      disc(g, 16, 18, 8, 7, '#4a3a5c');
      disc(g, 16, 15, 5, 4, '#5d4a72');
      R(g, 11, 20, 2, 2, '#8a2f3a');
      R(g, 19, 20, 2, 2, '#8a2f3a');
      for (let i = 0; i < 4; i++) {
        R(g, 5 + i * 2, 22 + (i % 2) + s, 7, 1, '#3a2c4a');
        R(g, 22, 22 + (i % 2) + s, 6, 1, '#3a2c4a');
      }
      R(g, 7, 23 + s, 2, 6, '#3a2c4a');
      R(g, 23, 23 + s, 2, 6, '#3a2c4a');
      R(g, 13, 15, 2, 2, '#f2e6b0');
      R(g, 18, 15, 2, 2, '#f2e6b0');
      disc(g, 16, 29, 10, 2, 'rgba(0,0,0,0.18)');
    },
    esqueleto(g, f) {
      const off = f ? 1 : 0;
      R(g, 13, 4, 7, 7, '#d8d5c8');
      R(g, 14, 6, 2, 2, '#2a2a35');
      R(g, 18, 6, 2, 2, '#2a2a35');
      R(g, 15, 10, 4, 1, '#8a8678');
      R(g, 14, 12, 5, 8, '#c9c6b8');
      for (let i = 0; i < 3; i++) R(g, 13, 13 + i * 2, 7, 1, '#8a8678');
      R(g, 10, 12, 3, 7, '#d8d5c8');
      R(g, 21, 12, 3, 7, '#d8d5c8');
      R(g, 12, 20, 3, 6 + off, '#c9c6b8');
      R(g, 18, 20, 3, 6 - off, '#c9c6b8');
      R(g, 12, 26, 4, 2, '#8a8678');
      R(g, 18, 26, 4, 2, '#8a8678');
      R(g, 24, 8, 2, 14, '#8a8f9c');
      R(g, 22, 20, 6, 2, '#6b4f2c');
      R(g, 14, 0, 5, 3, '#8a2f3a');
      disc(g, 16, 29, 8, 2, 'rgba(0,0,0,0.18)');
    },
    espectro(g, f) {
      const w = f ? 2 : 0;
      g.globalAlpha = 0.9;
      disc(g, 16, 14, 7, 8, '#8fc7d8');
      disc(g, 16, 16, 6, 7, '#b7e3ef');
      R(g, 9 - w, 16, 14, 8, '#8fc7d8');
      R(g, 9, 24, 3, 4, '#8fc7d8');
      R(g, 14, 24, 3, 3, '#8fc7d8');
      R(g, 19, 24, 3, 5, '#8fc7d8');
      R(g, 13, 13, 2, 3, '#2a3a4a');
      R(g, 18, 13, 2, 3, '#2a3a4a');
      R(g, 15, 18, 3, 2, '#2a3a4a');
      R(g, 11, 10, 3, 2, '#d8f5ff');
      g.globalAlpha = 1;
      disc(g, 16, 29, 8, 2, 'rgba(0,0,0,0.15)');
    },
    golem(g, f) {
      const off = f ? 1 : 0;
      R(g, 9, 6, 14, 13, '#6d7285');
      R(g, 7, 8, 3, 9, '#5d6274');
      R(g, 22, 8, 3, 9, '#5d6274');
      R(g, 10, 2, 12, 7, '#7d8296');
      R(g, 11, 4, 4, 2, '#8ff0ff');
      R(g, 17, 4, 4, 2, '#8ff0ff');
      R(g, 9, 19, 5, 7 + off, '#5d6274');
      R(g, 18, 19, 5, 7 - off, '#5d6274');
      R(g, 8, 26, 7, 2, '#434857');
      R(g, 18, 26, 7, 2, '#434857');
      R(g, 12, 10, 8, 1, '#4a4f5e');
      R(g, 12, 13, 3, 1, '#4a4f5e');
      R(g, 18, 16, 3, 1, '#4a4f5e');
      R(g, 14, 9, 2, 2, '#c9a94e');
      disc(g, 16, 29, 12, 2, 'rgba(0,0,0,0.2)');
    },
    caballero(g, f) {
      const off = f ? 1 : 0;
      R(g, 11, 4, 10, 9, '#2b2f45');
      R(g, 13, 7, 6, 2, '#c9a94e');
      R(g, 13, 8, 1, 1, '#e85a5a');
      R(g, 18, 8, 1, 1, '#e85a5a');
      R(g, 10, 12, 12, 9, '#3a3f5c');
      R(g, 12, 14, 8, 2, '#8a2f3a');
      R(g, 8, 12, 3, 8, '#2b2f45');
      R(g, 21, 12, 3, 8, '#2b2f45');
      R(g, 12, 21, 4, 6 + off, '#22263a');
      R(g, 17, 21, 4, 6 - off, '#22263a');
      R(g, 11, 26, 5, 2, '#14161f');
      R(g, 17, 26, 5, 2, '#14161f');
      R(g, 9, 0, 14, 3, '#8a2f3a');
      R(g, 15, 1, 1, 1, '#e8c66a');
      R(g, 24, 4, 2, 17, '#b8bfcc');
      R(g, 22, 19, 6, 2, '#6b4f2c');
      R(g, 6, 9, 2, 12, '#6d2f3a');
      disc(g, 16, 29, 10, 2, 'rgba(0,0,0,0.2)');
    },
    arana_reina(g, f) {
      const s = f ? 2 : 0;
      disc(g, 32, 34, 18, 14, '#3a2c4a');
      disc(g, 32, 28, 13, 11, '#5d4a72');
      disc(g, 32, 22, 8, 6, '#7a6390');
      R(g, 24, 30, 4, 4, '#e8c66a');
      R(g, 36, 30, 4, 4, '#e8c66a');
      R(g, 25, 31, 2, 2, '#e85a5a');
      R(g, 37, 31, 2, 2, '#e85a5a');
      R(g, 28, 18, 2, 2, '#f2e6b0');
      R(g, 34, 18, 2, 2, '#f2e6b0');
      for (let i = 0; i < 4; i++) {
        R(g, 4, 26 + i * 4 + s, 16, 2, '#4a3a5c');
        R(g, 44, 26 + i * 4 + s, 16, 2, '#4a3a5c');
      }
      R(g, 2, 36 + s, 3, 10, '#3a2c4a');
      R(g, 59, 36 + s, 3, 10, '#3a2c4a');
      R(g, 22, 8, 4, 8, '#e8c66a');
      R(g, 30, 5, 4, 11, '#e8c66a');
      R(g, 38, 8, 4, 8, '#e8c66a');
      R(g, 22, 8, 20, 3, '#c9a94e');
      R(g, 28, 12, 8, 6, '#8a2f3a');
      R(g, 30, 14, 2, 2, '#fff8d8');
      disc(g, 32, 61, 22, 3, 'rgba(0,0,0,0.2)');
    },
    guardian(g, f) {
      const off = f ? 1 : 0;
      R(g, 12, 10, 24, 24, '#6d7285');
      R(g, 10, 14, 3, 14, '#5d6274');
      R(g, 35, 14, 3, 14, '#5d6274');
      R(g, 14, 4, 20, 12, '#7d8296');
      R(g, 16, 8, 5, 3, '#8ff0ff');
      R(g, 27, 8, 5, 3, '#8ff0ff');
      R(g, 16, 18, 16, 2, '#4a4f5e');
      R(g, 20, 22, 3, 8, '#4a4f5e');
      R(g, 27, 26, 3, 4, '#4a4f5e');
      R(g, 12, 34, 8, 10 + off, '#5d6274');
      R(g, 28, 34, 8, 10 - off, '#5d6274');
      R(g, 10, 43, 12, 3, '#434857');
      R(g, 26, 43, 12, 3, '#434857');
      R(g, 8, 2, 32, 3, '#8a2f3a');
      R(g, 36, 2, 3, 12, '#8a2f3a');
      disc(g, 24, 62, 20, 3, 'rgba(0,0,0,0.22)');
    },
    lord_eclipse(g, f) {
      const bob = f ? 2 : 0;
      R(g, 8, 20 - bob, 32, 26, '#1d1a2e');
      R(g, 4, 26 - bob, 6, 20, '#2a2542');
      R(g, 38, 26 - bob, 6, 20, '#2a2542');
      R(g, 14, 10 - bob, 20, 14, '#2a2542');
      disc(g, 24, 14 - bob, 9, 8, '#e0d8d0');
      R(g, 17, 12 - bob, 5, 3, '#8a2f3a');
      R(g, 27, 12 - bob, 5, 3, '#8a2f3a');
      R(g, 18, 13 - bob, 3, 1, '#ff8a8a');
      R(g, 28, 13 - bob, 3, 1, '#ff8a8a');
      R(g, 22, 18 - bob, 4, 2, '#6b2a3a');
      R(g, 12, 24 - bob, 24, 4, '#8a2f3a');
      R(g, 16, 30 - bob, 16, 2, '#c9a94e');
      R(g, 18, 2 - bob, 3, 8, '#c9a94e');
      R(g, 23, 0 - bob, 3, 10, '#e8c66a');
      R(g, 28, 2 - bob, 3, 8, '#c9a94e');
      R(g, 18, 2 - bob, 12, 2, '#c9a94e');
      R(g, 10, 6 - bob, 3, 20, '#e8c66a');
      R(g, 36, 6 - bob, 3, 20, '#e8c66a');
      disc(g, 24, 60, 24, 3, 'rgba(0,0,0,0.3)');
    },
  };

  const ENEMY_SIZE = {
    limo: 32, limo_rey: 32, lobo: 32, murcielago: 40, arana: 34, esqueleto: 32,
    espectro: 32, golem: 34, caballero: 32, arana_reina: 64, guardian: 56, lord_eclipse: 56,
  };

  art.initEnemies = function () {
    for (const key of Object.keys(ENEMY_DRAW)) {
      const size = ENEMY_SIZE[key];
      art.enemies[key] = [0, 1].map((f) => make(size, size, (g) => {
        const scale = size / (key === 'arana_reina' || key === 'guardian' || key === 'lord_eclipse' ? 64 : 32);
        g.scale(scale, scale);
        ENEMY_DRAW[key](g, f);
      }));
    }
  };

  /* -------------------------------- ICONOS -------------------------------- */

  art.initIcons = function () {
    art.icons.sword = make(16, 16, (g) => {
      R(g, 11, 1, 2, 10, '#d8dde8');
      R(g, 12, 1, 1, 10, '#f4f8ff');
      R(g, 9, 11, 6, 2, '#c9a94e');
      R(g, 11, 13, 2, 3, '#6b4f2c');
      R(g, 10, 11, 1, 1, '#e8c66a');
    });
    art.icons.shield = make(16, 16, (g) => {
      R(g, 3, 2, 10, 8, '#8a9099');
      R(g, 4, 3, 8, 6, '#b8bfcc');
      R(g, 5, 10, 6, 3, '#8a9099');
      R(g, 7, 12, 2, 2, '#6d7285');
      R(g, 6, 5, 4, 1, '#c9a94e');
      R(g, 7, 4, 2, 4, '#c9a94e');
    });
    art.icons.potion = make(16, 16, (g) => {
      R(g, 6, 1, 4, 2, '#8a6a3f');
      R(g, 5, 3, 6, 3, '#b8d8e8');
      disc(g, 8, 10, 5, 5, '#e05a6a');
      disc(g, 8, 11, 4, 4, '#f07a8a');
      R(g, 5, 7, 6, 2, '#c8e8f5');
      R(g, 6, 8, 2, 2, '#ffd0d8');
    });
    art.icons.ether = make(16, 16, (g) => {
      R(g, 6, 1, 4, 2, '#8a6a3f');
      R(g, 5, 3, 6, 3, '#b8d8e8');
      disc(g, 8, 10, 5, 5, '#4a7fd8');
      disc(g, 8, 11, 4, 4, '#6a9fe8');
      R(g, 6, 8, 2, 2, '#c8e0ff');
    });
    art.icons.coin = make(16, 16, (g) => {
      disc(g, 8, 8, 6, 6, '#c9a94e');
      disc(g, 8, 8, 5, 5, '#e8c66a');
      R(g, 7, 5, 2, 6, '#c9a94e');
      R(g, 6, 7, 4, 2, '#c9a94e');
    });
    art.icons.star = make(16, 16, (g) => {
      R(g, 7, 1, 2, 13, '#f2e6b0');
      R(g, 1, 7, 13, 2, '#f2e6b0');
      R(g, 3, 3, 2, 2, '#e8c66a');
      R(g, 11, 3, 2, 2, '#e8c66a');
      R(g, 3, 11, 2, 2, '#e8c66a');
      R(g, 11, 11, 2, 2, '#e8c66a');
      R(g, 7, 6, 2, 4, '#fff8d8');
    });
    art.icons.boot = make(16, 16, (g) => {
      R(g, 4, 3, 6, 8, '#8a5c33');
      R(g, 3, 10, 10, 3, '#6b4527');
      R(g, 3, 12, 10, 2, '#4a3018');
      R(g, 5, 4, 2, 3, '#a87a4a');
    });
  };

  /* -------------------------------- VARIOS -------------------------------- */

  art.initMisc = function () {
    art.misc.chest = [0, 1].map((open) => make(16, 16, (g) => {
      if (open) {
        R(g, 2, 9, 12, 6, '#6b4527');
        R(g, 3, 10, 10, 4, '#4a3018');
        R(g, 2, 2, 12, 5, '#8a5c33');
        R(g, 3, 3, 10, 3, '#a87a4a');
        R(g, 3, 4, 10, 2, '#f2e6b0');
      } else {
        R(g, 2, 6, 12, 9, '#8a5c33');
        R(g, 3, 7, 10, 7, '#6b4527');
        R(g, 2, 4, 12, 4, '#a87a4a');
        R(g, 3, 5, 10, 2, '#c9a066');
        R(g, 7, 9, 2, 4, '#e8c66a');
      }
      R(g, 2, 14, 12, 1, 'rgba(0,0,0,0.25)');
    }));
    art.misc.sign = make(16, 16, (g) => {
      R(g, 7, 9, 2, 6, '#5a3a22');
      R(g, 2, 3, 12, 7, '#a87a4a');
      R(g, 3, 4, 10, 5, '#c9a066');
      R(g, 4, 6, 8, 1, '#5a3a22');
      R(g, 4, 8, 5, 1, '#5a3a22');
    });
    art.misc.flower = make(16, 16, (g) => {
      R(g, 7, 7, 1, 6, '#3d6b33');
      R(g, 5, 3, 5, 5, '#c9f0ff');
      R(g, 6, 4, 3, 3, '#ffffff');
      R(g, 7, 5, 1, 1, '#e8c66a');
    });
    art.misc.shadow = make(24, 8, (g) => {
      disc(g, 12, 4, 11, 3, 'rgba(0,0,0,0.28)');
    });
  };

  art.init = function () {
    art.tiles.grass = grassTile(1, '#4a7a3c', '#5b8f4a');
    art.tiles.grass2 = grassTile(2, '#467438', '#579048');
    art.tiles.tall = tallGrassTile();
    art.tiles.path = pathTile(3);
    art.tiles.path2 = pathTile(4);
    art.tiles.water = [waterTile(0), waterTile(1)];
    art.tiles.bridge = bridgeTile();
    art.tiles.tree = treeTile();
    art.tiles.rock = rockTile();
    art.tiles.wall = houseWallTile();
    art.tiles.roof = roofTile();
    art.tiles.door = doorTile();
    art.tiles.stone = stoneWallTile(0);
    art.tiles.stone2 = stoneWallTile(1);
    art.tiles.floor = floorTile(0);
    art.tiles.floor2 = floorTile(1);
    art.tiles.stairs = stairsTile();
    art.tiles.flower = flowerTile();
    art.tiles.pillar = pillarTile();
    art.tiles.crystal = crystalTile();
    art.tiles.sand = sandTile();
    art.tiles.void = voidTile();
    art.tiles.rug = rugTile();
    art.initChars();
    art.initEnemies();
    art.initIcons();
    art.initMisc();
  };
})();
