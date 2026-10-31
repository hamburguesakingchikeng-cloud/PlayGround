/* ===========================================================
   LA ESPADA CELESTIAL — motor de juego
   Estado, colisiones, combate, IA, misiones y progresión.
   =========================================================== */
'use strict';

const SAVE_KEY = 'la-espada-celestial:v1';

const game = {
  scene: 'title',            // title | play | dialog | panel | death | ending | travel
  mapId: 'village',
  map: null,
  p: null,
  enemies: [],
  boss: null,
  projectiles: [],
  particles: [],
  numbers: [],
  effects: [],
  weather: [],
  camera: { x: 0, y: 0 },
  view: { w: 400, h: 700, zoom: 1, dpr: 1 },
  time: 0,
  shake: 0,
  portalCd: 0,
  interact: null,
  transition: false,
  endingTimer: 0,
  saveTimer: 0,
  shrineCd: 0,
  travelMessage: 0,
  hudTimer: 0
};

/* ----------------------------- Jugador ----------------------------- */
function newPlayer() {
  return {
    x: 750, y: 840, r: 12, dir: -Math.PI / 2, speed: 172,
    hp: 100, maxHp: 100, mp: 50, maxMp: 50,
    level: 1, xp: 0, xpNext: 50, gold: 0, atk: 12,
    potions: 3, ethers: 1, blade: 0,
    atkCd: 0, skillCd: 0, healCd: 0, invuln: 0, atkAnim: 0, hitFlash: 0,
    stage: 1, slimeKills: 0, ghostKills: 0,
    kills: 0, playTime: 0
  };
}

function bladeName() {
  return ['Hoja de aprendiz', 'Espada de plata', 'Espada lunar', 'Espada Celestial'][game.p.blade] || 'Espada Celestial';
}
function bladeColor() {
  return ['#cfd6e2', '#e8eef8', '#a8dcff', '#ffe39a'][game.p.blade] || '#ffe39a';
}

/* ----------------------------- Mapas ----------------------------- */
function loadMap(id, pos) {
  const map = (MAP_BUILDERS[id] || MAP_BUILDERS.village)();
  const p = game.p;
  game.mapId = id;
  game.map = map;
  game.enemies = [];
  game.boss = null;

  for (const def of map.enemies) {
    const base = ENEMY_DEFS[def.type];
    if (def.type === 'boss') {
      if (p.stage !== 4) continue;
      game.boss = {
        type: 'boss', name: base.name, x: def.x, y: def.y, r: base.r,
        hp: base.hp, maxHp: base.hp, speed: base.speed, dmg: base.dmg,
        xp: base.xp, gold: base.gold, aggro: base.aggro,
        active: false, dead: false, state: 'chase', timer: 0, atkCd: 1.4,
        phase: 1, dir: Math.PI / 2, hitFlash: 0, kx: 0, ky: 0,
        slamX: 0, slamY: 0, slamR: 0, volleyCd: 3
      };
      continue;
    }
    game.enemies.push({
      type: def.type, name: base.name, x: def.x, y: def.y, home: def.home,
      r: base.r, hp: base.hp, maxHp: base.hp, speed: base.speed, dmg: base.dmg,
      xp: base.xp, gold: base.gold, aggro: base.aggro,
      state: 'idle', timer: 0, atkCd: rand(0.3, 1.2), shootCd: rand(1.5, 3),
      dir: Math.PI / 2, hitFlash: 0, kx: 0, ky: 0, wander: 0, wx: 0, wy: 0,
      dead: false
    });
  }

  if (map.chest) map.chest.opened = p.stage >= 4;

  const start = pos || map.spawn;
  p.x = clamp(start.x, 30, map.w - 30);
  p.y = clamp(start.y, 30, map.h - 30);
  p.atkAnim = 0;
  p.invuln = Math.max(p.invuln, 0.6);

  game.projectiles = [];
  game.particles = [];
  game.numbers = [];
  game.effects = [];
  game.portalCd = 1.1;
  game.interact = null;
  initWeather(map);
  snapCamera();
  hideBossBar();
  updateHUD();
}

function initWeather(map) {
  const rng = mulberry32(map._seed * 977 + 13);
  const n = map.ambient === 'leaves' ? 42 : map.ambient === 'embers' ? 46 : 26;
  game.weather = [];
  for (let i = 0; i < n; i++) {
    game.weather.push({
      x: rng() * map.w, y: rng() * map.h,
      vx: map.ambient === 'leaves' ? 14 + rng() * 20 : (rng() - 0.5) * 10,
      vy: map.ambient === 'embers' ? -14 - rng() * 24 : 8 + rng() * 14,
      s: 1.4 + rng() * 2.4, ph: rng() * Math.PI * 2,
      kind: map.ambient
    });
  }
}

/* ----------------------------- Guardado ----------------------------- */
function saveGame(silent) {
  if (!game.p) return;
  try {
    const payload = { v: 1, mapId: game.mapId, p: game.p, at: Date.now() };
    localStorage.setItem(SAVE_KEY, JSON.stringify(payload));
    if (!silent) toast('Partida guardada', 'gold');
  } catch (e) {
    if (!silent) toast('No se pudo guardar', 'danger');
  }
}

function hasSave() {
  try { return !!localStorage.getItem(SAVE_KEY); } catch (e) { return false; }
}

function loadGame() {
  let data = null;
  try { data = JSON.parse(localStorage.getItem(SAVE_KEY) || 'null'); } catch (e) { data = null; }
  if (!data || !data.p) { toast('No hay partida guardada', 'danger'); return false; }
  const p = Object.assign(newPlayer(), data.p);
  p.stage = clamp(Math.round(p.stage || 1), 1, 5);
  p.level = Math.max(1, Math.round(p.level));
  p.maxHp = Math.max(100, p.maxHp);
  p.maxMp = Math.max(50, p.maxMp);
  p.hp = clamp(p.hp, 1, p.maxHp);
  p.mp = clamp(p.mp, 0, p.maxMp);
  p.xpNext = Math.max(10, p.xpNext);
  p.potions = Math.max(0, p.potions | 0);
  p.ethers = Math.max(0, p.ethers | 0);
  p.blade = clamp(p.blade | 0, 0, 3);
  game.p = p;
  game.scene = 'play';
  loadMap(data.mapId && MAP_BUILDERS[data.mapId] ? data.mapId : 'village', { x: p.x, y: p.y });
  hideTitle();
  document.body.classList.toggle('low-hp', false);
  toast('Partida cargada', 'gold');
  return true;
}

/* ----------------------------- Movimiento y colisión ----------------------------- */
function collide(ent, map) {
  const r = ent.r;
  for (const o of map.obstacles) {
    if (o.t === 'r') {
      const nx = clamp(ent.x, o.x, o.x + o.w);
      const ny = clamp(ent.y, o.y, o.y + o.h);
      let dx = ent.x - nx, dy = ent.y - ny;
      let d2 = dx * dx + dy * dy;
      if (d2 < r * r) {
        if (d2 > 0.0001) {
          const d = Math.sqrt(d2);
          ent.x += (dx / d) * (r - d);
          ent.y += (dy / d) * (r - d);
        } else {
          const left = ent.x - o.x, right = o.x + o.w - ent.x;
          const top = ent.y - o.y, bottom = o.y + o.h - ent.y;
          const m = Math.min(left, right, top, bottom);
          if (m === left) ent.x = o.x - r;
          else if (m === right) ent.x = o.x + o.w + r;
          else if (m === top) ent.y = o.y - r;
          else ent.y = o.y + o.h + r;
        }
      }
    } else if (o.t === 'c') {
      const dx = ent.x - o.x, dy = ent.y - o.y;
      const rr = r + o.r;
      const d2 = dx * dx + dy * dy;
      if (d2 < rr * rr) {
        const d = Math.sqrt(d2) || 0.001;
        ent.x = o.x + (dx / d) * rr;
        ent.y = o.y + (dy / d) * rr;
      }
    }
  }
  ent.x = clamp(ent.x, 26, map.w - 26);
  ent.y = clamp(ent.y, 34, map.h - 26);
}

function moveEntity(ent, dx, dy, map) {
  ent.x += dx;
  ent.y += dy;
  collide(ent, map);
}

/* ----------------------------- Partículas y números ----------------------------- */
function burst(x, y, color, n = 8, speed = 110, size = 3) {
  for (let i = 0; i < n; i++) {
    const a = rand(0, Math.PI * 2);
    const sp = rand(speed * 0.3, speed);
    game.particles.push({
      x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 20,
      life: rand(0.25, 0.6), max: 0.6, size: rand(size * 0.6, size), color, grav: 120
    });
  }
}

function addNumber(x, y, text, color = '#fff', crit = false) {
  game.numbers.push({ x: x + rand(-6, 6), y, text, color, crit, life: 0.85, max: 0.85, vy: -52 });
}

function addRing(x, y, r, color, life = 0.5) {
  game.effects.push({ kind: 'ring', x, y, r, color, life, max: life });
}

/* ----------------------------- Combate ----------------------------- */
function nearestEnemy(maxDist) {
  let best = null, bd = maxDist * maxDist;
  const list = game.boss && !game.boss.dead ? [...game.enemies, game.boss] : game.enemies;
  for (const e of list) {
    if (e.dead) continue;
    const d = dist2(game.p.x, game.p.y, e.x, e.y);
    if (d < bd) { bd = d; best = e; }
  }
  return best;
}

function playerAttack() {
  const p = game.p;
  if (game.scene !== 'play' || p.atkCd > 0) return;
  p.atkCd = 0.4;
  p.atkAnim = 0.2;

  const aim = nearestEnemy(160);
  if (aim) p.dir = Math.atan2(aim.y - p.y, aim.x - p.x);

  AudioFX.swing();
  game.effects.push({ kind: 'slash', x: p.x, y: p.y, dir: p.dir, life: 0.2, max: 0.2 });

  const targets = game.boss && !game.boss.dead ? [...game.enemies, game.boss] : game.enemies;
  for (const e of targets) {
    if (e.dead) continue;
    const d = dist(p.x, p.y, e.x, e.y);
    if (d > 70 + e.r) continue;
    const a = Math.atan2(e.y - p.y, e.x - p.x);
    if (angleDiff(a, p.dir) > 1.05) continue;
    const crit = Math.random() < 0.15;
    const dmg = Math.round(p.atk * rand(0.9, 1.12) * (crit ? 1.9 : 1));
    damageEnemy(e, dmg, crit, a);
  }
}

function playerSkill() {
  const p = game.p;
  if (game.scene !== 'play' || p.skillCd > 0) return;
  if (p.mp < 12) { toast('No tienes suficiente maná', 'danger'); return; }
  p.mp -= 12;
  p.skillCd = 2.6;
  AudioFX.tone(300, 0.5, 'triangle', 0.06, 500);
  addRing(p.x, p.y, 110, '#9fdcff', 0.5);
  addRing(p.x, p.y, 70, '#ffe9b0', 0.4);
  burst(p.x, p.y, '#bfe9ff', 26, 240, 4);

  const targets = game.boss && !game.boss.dead ? [...game.enemies, game.boss] : game.enemies;
  for (const e of targets) {
    if (e.dead) continue;
    if (dist(p.x, p.y, e.x, e.y) > 112 + e.r) continue;
    damageEnemy(e, Math.round(p.atk * 1.7), false, Math.atan2(e.y - p.y, e.x - p.x), 14);
  }
}

function playerHeal() {
  const p = game.p;
  if (game.scene !== 'play' || p.healCd > 0) return;
  if (p.mp < 20) { toast('No tienes suficiente maná', 'danger'); return; }
  if (p.hp >= p.maxHp) { toast('Tu vida ya está completa'); return; }
  p.mp -= 20;
  p.healCd = 8;
  const amount = Math.round(p.maxHp * 0.35);
  p.hp = Math.min(p.maxHp, p.hp + amount);
  addNumber(p.x, p.y - 26, `+${amount}`, '#8ff0a8');
  burst(p.x, p.y, '#8ff0a8', 18, 90, 3);
  AudioFX.heal();
  updateHUD();
}

function usePotion() {
  const p = game.p;
  if (game.scene !== 'play') return;
  if (p.potions <= 0) { toast('No te quedan pociones', 'danger'); return; }
  if (p.hp >= p.maxHp) { toast('Tu vida ya está completa'); return; }
  p.potions--;
  const amount = Math.max(45, Math.round(p.maxHp * 0.3));
  p.hp = Math.min(p.maxHp, p.hp + amount);
  addNumber(p.x, p.y - 26, `+${amount}`, '#ff9ab8');
  burst(p.x, p.y, '#ff9ab8', 14, 80, 3);
  AudioFX.pickup();
  updateHUD();
}

function useEther() {
  const p = game.p;
  if (game.scene !== 'play') return;
  if (p.ethers <= 0) return;
  if (p.mp >= p.maxMp) { toast('Tu maná ya está completo'); return; }
  p.ethers--;
  p.mp = Math.min(p.maxMp, p.mp + 32);
  addNumber(p.x, p.y - 26, '+32', '#9fd8ff');
  AudioFX.pickup();
  updateHUD();
}

function damageEnemy(e, dmg, crit, angle, knock = 9) {
  if (e.dead) return;
  e.hp -= dmg;
  e.hitFlash = 0.13;
  if (e.kx !== undefined) {
    e.kx += Math.cos(angle) * knock * 6;
    e.ky += Math.sin(angle) * knock * 6;
  }
  addNumber(e.x, e.y - e.r - 8, String(dmg), crit ? '#ffd76a' : '#fff2dc', crit);
  burst(e.x, e.y - e.r * 0.4, crit ? '#ffd76a' : '#ffd9b0', crit ? 12 : 6, crit ? 170 : 110, crit ? 4 : 3);
  AudioFX.hit();
  if (e === game.boss) updateBossBar();
  if (e.hp <= 0) {
    e.hp = 0;
    e.dead = true;
    onEnemyKilled(e);
  }
}

function damagePlayer(dmg) {
  const p = game.p;
  if (game.scene !== 'play' || p.invuln > 0) return;
  p.hp -= dmg;
  p.invuln = 0.62;
  p.hitFlash = 0.22;
  game.shake = Math.max(game.shake, 9);
  addNumber(p.x, p.y - 30, `-${dmg}`, '#ff7b7b');
  burst(p.x, p.y, '#ff6f6f', 10, 120, 3);
  AudioFX.hurt();
  updateHUD();
  if (p.hp <= 0) {
    p.hp = 0;
    die();
  }
}

function onEnemyKilled(e) {
  const p = game.p;
  p.kills++;
  p.gold += e.gold || 0;
  p.mp = Math.min(p.maxMp, p.mp + 4);
  gainXP(e.xp || 0);
  burst(e.x, e.y - e.r * 0.5, e.type === 'ghost' ? '#cfe6ff' : '#a9e08a', 22, 180, 4);
  addRing(e.x, e.y, e.r + 20, e.type === 'ghost' ? '#cfe6ff' : '#a9e08a', 0.4);

  if (e.type === 'slime' && p.stage === 2) {
    p.slimeKills = Math.min(5, p.slimeKills + 1);
    toast(`Limos derrotados ${p.slimeKills}/5`, 'quest');
    if (p.slimeKills >= 5) {
      p.stage = 3;
      p.gold += 40;
      toast('¡Misión completada! El camino a las Ruinas se ha abierto', 'gold');
      addRing(p.x, p.y, 90, '#ffe39a', 0.8);
      AudioFX.level();
      saveGame(true);
    }
    updateHUD();
  }

  if (e.type === 'ghost' && p.stage === 3) {
    p.ghostKills = Math.min(6, p.ghostKills + 1);
    toast(`Espectros derrotados ${p.ghostKills}/6`, 'quest');
    if (p.ghostKills >= 6) {
      toast('El Fragmento de Ceniza se manifiesta en el centro de las Ruinas', 'gold');
      addRing(p.x, p.y, 110, '#ffd08a', 0.9);
      AudioFX.level();
      saveGame(true);
    }
    updateHUD();
  }

  if (e === game.boss) {
    onBossDefeated();
    return;
  }

  if (Math.random() < 0.18) {
    p.potions++;
    addNumber(e.x, e.y - 34, '+1 ⚗', '#ffa8d8');
  }
  saveGame(true);
}

function gainXP(amount) {
  const p = game.p;
  p.xp += amount;
  let leveled = false;
  while (p.xp >= p.xpNext) {
    p.xp -= p.xpNext;
    p.level++;
    p.xpNext = Math.round(p.xpNext * 1.45);
    p.maxHp += 18;
    p.maxMp += 8;
    p.atk += 3;
    p.hp = p.maxHp;
    p.mp = p.maxMp;
    leveled = true;
  }
  if (leveled) {
    addRing(p.x, p.y, 100, '#ffe39a', 0.8);
    burst(p.x, p.y, '#ffe39a', 30, 200, 4);
    toast(`¡Nivel ${p.level}! Vida y poder restaurados`, 'gold');
    AudioFX.level();
    saveGame(true);
  }
  updateHUD();
}

function onBossDefeated() {
  const p = game.p;
  game.boss.dead = true;
  game.shake = 22;
  burst(game.boss.x, game.boss.y, '#ffb36a', 60, 300, 5);
  addRing(game.boss.x, game.boss.y, 190, '#ffe39a', 1.2);
  hideBossBar();
  p.stage = 5;
  p.gold += 260;
  toast('El Señor de la Ceniza ha caído. La espada despierta.', 'gold');
  AudioFX.level();
  saveGame(true);
  game.endingTimer = 2.8;
  updateHUD();
}

/* ----------------------------- Muerte ----------------------------- */
function die() {
  game.scene = 'death';
  AudioFX.tone(140, 1, 'sawtooth', 0.06, -90);
  showDeath();
}

function retry() {
  const p = game.p;
  p.hp = Math.max(1, Math.round(p.maxHp * 0.6));
  p.mp = Math.max(10, Math.round(p.maxMp * 0.5));
  p.gold = Math.floor(p.gold * 0.9);
  p.invuln = 2;
  game.scene = 'play';
  hideDeath();
  loadMap(game.mapId, game.map.spawn);
  toast('Te levantas, pero la ceniza se llevó parte de tu oro', 'danger');
  saveGame(true);
}

/* ----------------------------- Misiones ----------------------------- */
function questTarget() {
  const p = game.p;
  if (p.stage === 1) return { mapId: 'village', x: 618, y: 664 };
  if (p.stage === 2) {
    if (game.mapId === 'forest') {
      const s = game.enemies.find((e) => e.type === 'slime' && !e.dead);
      return s ? { mapId: 'forest', x: s.x, y: s.y } : { mapId: 'forest', x: 800, y: 640 };
    }
    return game.mapId === 'village' ? { mapId: 'village', x: 750, y: 108 } : { mapId: 'forest', x: 800, y: 1070 };
  }
  if (p.stage === 3) {
    if (game.mapId === 'ruins') {
      if (p.ghostKills >= 6) return { mapId: 'ruins', x: 800, y: 780 };
      const g = game.enemies.find((e) => e.type === 'ghost' && !e.dead);
      return g ? { mapId: 'ruins', x: g.x, y: g.y } : { mapId: 'ruins', x: 800, y: 640 };
    }
    if (game.mapId === 'forest') return { mapId: 'forest', x: 1548, y: 640 };
    return { mapId: 'village', x: 750, y: 108 };
  }
  if (p.stage === 4) {
    if (game.mapId === 'temple' && game.boss && !game.boss.dead) {
      return { mapId: 'temple', x: game.boss.x, y: game.boss.y };
    }
    if (game.mapId === 'ruins') return { mapId: 'ruins', x: 800, y: 90 };
    if (game.mapId === 'forest') return { mapId: 'forest', x: 1548, y: 640 };
    return { mapId: 'village', x: 750, y: 108 };
  }
  return null;
}

function questProgressText() {
  const p = game.p;
  if (p.stage === 2) return `${p.slimeKills}/5 limos`;
  if (p.stage === 3) return p.ghostKills >= 6 ? 'Reclama el fragmento' : `${p.ghostKills}/6 espectros`;
  return '';
}

/* ----------------------------- Interacción ----------------------------- */
function findInteract() {
  const p = game.p;
  const map = game.map;
  let best = null, bd = Infinity;
  for (const npc of map.npcs) {
    const d = dist(p.x, p.y, npc.x, npc.y);
    if (d < 80 && d < bd) { bd = d; best = { type: 'npc', ref: npc, label: 'Hablar', x: npc.x, y: npc.y }; }
  }
  if (map.chest) {
    const c = map.chest;
    const d = dist(p.x, p.y, c.x, c.y);
    if (d < 80) {
      if (!c.opened && p.stage === 3 && p.ghostKills >= 6) {
        if (d < bd) { bd = d; best = { type: 'chest', ref: c, label: 'Abrir', x: c.x, y: c.y }; }
      } else if (!c.opened && p.stage < 4 && d < bd) {
        bd = d; best = { type: 'chestLocked', ref: c, label: 'Examinar', x: c.x, y: c.y };
      }
    }
  }
  if (map.shrine) {
    const d = dist(p.x, p.y, map.shrine.x, map.shrine.y);
    if (d < 95 && d < bd) { bd = d; best = { type: 'shrine', ref: map.shrine, label: 'Rezar', x: map.shrine.x, y: map.shrine.y }; }
  }
  return best;
}

function doInteract() {
  if (game.scene !== 'play' || !game.interact) return;
  const it = game.interact;
  if (it.type === 'npc') talkTo(it.ref);
  else if (it.type === 'chest') openChest();
  else if (it.type === 'chestLocked') openDialog({
    who: 'Cofre sellado', text: 'La ceniza aún no se ha calmado. Algo duerme aquí, esperando a que las ruinas callen.',
    options: [{ label: 'Retirarse', cb: closeDialog }]
  });
  else if (it.type === 'shrine') useShrine();
}

function useShrine() {
  const p = game.p;
  if (game.shrineCd > 0) { toast('La bendición aún se está recuperando', 'danger'); return; }
  if (p.hp >= p.maxHp && p.mp >= p.maxMp) { toast('Ya estás pleno de vida y maná'); return; }
  p.hp = p.maxHp;
  p.mp = p.maxMp;
  game.shrineCd = 25;
  addRing(p.x, p.y, 120, '#9fdcff', 0.9);
  burst(p.x, p.y, '#9fdcff', 26, 150, 4);
  AudioFX.heal();
  toast('La bendición lunar restaura tu vida y tu maná', 'quest');
  updateHUD();
}

function openChest() {
  const p = game.p;
  const c = game.map.chest;
  if (!c || c.opened) return;
  c.opened = true;
  p.ghostKills = 6;
  p.stage = 4;
  p.gold += 120;
  p.potions += 2;
  addRing(c.x, c.y, 150, '#ffe39a', 1.1);
  burst(c.x, c.y, '#ffe39a', 40, 220, 5);
  AudioFX.chest();
  openDialog({
    who: 'Fragmento de Ceniza',
    text: 'El fragmento flota sobre el cofre y se funde con la hoja. La espada recuerda su nombre: Celestial. Pero su luz aún está incompleta… el Señor de la Ceniza aguarda en el Templo.',
    options: [{ label: 'Alzar la espada', cb: () => { closeDialog(); p.blade = Math.max(p.blade, 2); toast('La Espada lunar despierta · +4 ataque', 'gold'); p.atk += 4; updateHUD(); saveGame(true); } }]
  });
}

/* ----------------------------- Diálogos de NPC ----------------------------- */
function talkTo(npc) {
  const p = game.p;
  if (npc.id === 'mira') {
    if (p.stage === 1) {
      openDialog({
        who: 'Anciana Mira',
        text: 'La ceniza ha cubierto el Bosque y algo antiguo se mueve en las Ruinas. Portas la hoja que soñó con el cielo, muchacho. Ve al Bosque Susurrante y derrota a los limos que corrompen la senda. Así empezarás a despertar su filo.',
        options: [{
          label: 'Aceptar el llamado', cb: () => {
            closeDialog();
            p.stage = 2;
            p.potions += 1;
            toast('Nueva misión: Limo y ceniza', 'quest');
            addRing(p.x, p.y, 80, '#ffe39a', 0.7);
            AudioFX.level();
            updateHUD();
            saveGame(true);
          }
        }, { label: 'Todavía no', cb: closeDialog }]
      });
    } else if (p.stage === 2) {
      openDialog({
        who: 'Anciana Mira',
        text: `La senda del bosque está al norte. Los limos han bebido de la ceniza: ${p.slimeKills} de 5 han caído. Cuando termines, las Ruinas te abrirán su puerta.`,
        options: [{ label: 'Entendido', cb: closeDialog }]
      });
    } else if (p.stage === 3) {
      openDialog({
        who: 'Anciana Mira',
        text: `Las Ruinas guardan el Fragmento. Los espectros lo custodian: ${p.ghostKills} de 6 han vuelto al polvo. No toques el fragmento con miedo, o la ceniza te reclamará.`,
        options: [{ label: 'Seguir adelante', cb: closeDialog }]
      });
    } else if (p.stage === 4) {
      openDialog({
        who: 'Anciana Mira',
        text: 'El Templo Celestial se alza tras las Ruinas. El Señor de la Ceniza fue un rey que quiso robar la luz de la espada. Tu hoja ya recuerda su nombre. Termina lo que empezó hace mil años.',
        options: [{ label: 'Iré al Templo', cb: closeDialog }]
      });
    } else {
      openDialog({
        who: 'Anciana Mira',
        text: 'El cielo vuelve a verse sobre la aldea. La espada canta en tu mano, y los niños ya no temen a la noche. Descansa, héroe: el reino recordará tu nombre.',
        options: [{ label: 'Despedirse', cb: closeDialog }]
      });
    }
    return;
  }

  if (npc.id === 'herrero') {
    const options = [];
    if (p.blade < 3) {
      options.push({
        label: `Mejorar espada · 60 ◈`, cb: () => {
          if (p.gold < 60) { toast('Necesitas 60 de oro', 'danger'); return; }
          p.gold -= 60;
          p.blade++;
          p.atk += 4;
          toast(`${bladeName()} forjada · +4 ataque`, 'gold');
          AudioFX.level();
          updateHUD();
          saveGame(true);
          closeDialog();
        }
      });
    }
    options.push({
      label: 'Comprar poción · 25 ◈', cb: () => {
        if (p.gold < 25) { toast('Necesitas 25 de oro', 'danger'); return; }
        p.gold -= 25;
        p.potions++;
        toast('Poción comprada', 'gold');
        AudioFX.pickup();
        updateHUD();
        saveGame(true);
        closeDialog();
      }
    });
    options.push({ label: 'Despedirse', cb: closeDialog });
    openDialog({
      who: 'Herrero Bruno',
      text: p.blade < 3
        ? `Tu hoja tiene sed de ceniza. Puedo reforzarla con plata lunar (${bladeName()} · nivel ${p.blade + 1}/3), pero el metal cuesta 60 de oro. También vendo pociones a 25.`
        : 'Tu espada ya es una leyenda. No hay yunque en este reino que pueda mejorarla más.',
      options
    });
  }
}

/* ----------------------------- Viaje ----------------------------- */
function tryPortal(portal) {
  if (game.transition) return;
  const p = game.p;
  if (portal.needStage && p.stage < portal.needStage) {
    const msg = portal.to === 'ruins'
      ? 'El sendero está sellado por la ceniza. Derrota a los 5 limos primero.'
      : 'El Templo está sellado. Recupera el Fragmento de Ceniza en las Ruinas.';
    toast(msg, 'danger');
    addRing(portal.x, portal.y, 46, '#ff7b7b', 0.4);
    game.portalCd = 1.6;
    return;
  }
  game.transition = true;
  game.scene = 'travel';
  $('fader').classList.add('on');
  AudioFX.portal();
  setTimeout(() => {
    loadMap(portal.to, portal.spawn);
    game.scene = 'play';
    game.transition = false;
    $('fader').classList.remove('on');
    toast(ZONE_NAMES[game.mapId] || '', 'quest');
    saveGame(true);
  }, 380);
}

/* ----------------------------- Cámara ----------------------------- */
function updateCamera(dt) {
  const v = game.view;
  const map = game.map;
  const p = game.p;
  let tx = p.x - v.w / 2;
  let ty = p.y - v.h / 2;
  if (map.w <= v.w) tx = (map.w - v.w) / 2;
  else tx = clamp(tx, 0, map.w - v.w);
  if (map.h <= v.h) ty = (map.h - v.h) / 2;
  else ty = clamp(ty, 0, map.h - v.h);
  const k = 1 - Math.exp(-9 * dt);
  game.camera.x = lerp(game.camera.x, tx, k);
  game.camera.y = lerp(game.camera.y, ty, k);
}

function snapCamera() {
  const v = game.view, map = game.map, p = game.p;
  let tx = p.x - v.w / 2, ty = p.y - v.h / 2;
  if (map.w <= v.w) tx = (map.w - v.w) / 2; else tx = clamp(tx, 0, map.w - v.w);
  if (map.h <= v.h) ty = (map.h - v.h) / 2; else ty = clamp(ty, 0, map.h - v.h);
  game.camera.x = tx;
  game.camera.y = ty;
}

/* ----------------------------- Actualización ----------------------------- */
function update(dt) {
  const p = game.p;
  game.time += dt;
  p.playTime += dt;
  game.shake = Math.max(0, game.shake - dt * 34);
  game.portalCd = Math.max(0, game.portalCd - dt);
  game.shrineCd = Math.max(0, game.shrineCd - dt);
  p.atkCd = Math.max(0, p.atkCd - dt);
  p.skillCd = Math.max(0, p.skillCd - dt);
  p.healCd = Math.max(0, p.healCd - dt);
  p.invuln = Math.max(0, p.invuln - dt);
  p.atkAnim = Math.max(0, p.atkAnim - dt);
  p.hitFlash = Math.max(0, p.hitFlash - dt);
  p.mp = Math.min(p.maxMp, p.mp + dt * 0.8);

  if (game.endingTimer > 0) {
    game.endingTimer -= dt;
    if (game.endingTimer <= 0) {
      showEnding();
      return;
    }
  }

  updateCamera(dt);

  /* Movimiento del jugador */
  let mx = 0, my = 0;
  if (keys.w || keys.arrowup) my -= 1;
  if (keys.s || keys.arrowdown) my += 1;
  if (keys.a || keys.arrowleft) mx -= 1;
  if (keys.d || keys.arrowright) mx += 1;
  if (joy.active) { mx = joy.dx; my = joy.dy; }
  const len = Math.hypot(mx, my);
  if (len > 0.08) {
    const nx = mx / (len > 1 ? len : 1);
    const ny = my / (len > 1 ? len : 1);
    p.dir = Math.atan2(ny, nx);
    moveEntity(p, nx * p.speed * dt, ny * p.speed * dt, game.map);
  }

  updateWeather(dt);
  updateEnemies(dt);
  updateBoss(dt);
  updateProjectiles(dt);
  updateEffects(dt);
  updateParticles(dt);
  updatePickups(dt);

  /* Portales */
  if (game.portalCd <= 0 && !game.transition) {
    for (const portal of game.map.portals) {
      if (dist(p.x, p.y, portal.x, portal.y) < portal.r * 0.6 + 6) {
        tryPortal(portal);
        break;
      }
    }
  }

  /* Interacción cercana */
  game.interact = findInteract();
  updatePrompt();

  /* Guardado automático */
  game.saveTimer += dt;
  if (game.saveTimer > 25) { game.saveTimer = 0; saveGame(true); }

  /* El HUD no necesita repintarse a 60 Hz; se sincroniza 8 veces por segundo. */
  game.hudTimer -= dt;
  if (game.hudTimer <= 0) {
    game.hudTimer = 0.125;
    updateHUD();
  }
}

function updateWeather(dt) {
  const map = game.map;
  for (const w of game.weather) {
    w.ph += dt * 1.6;
    w.x += (w.vx + Math.sin(w.ph) * 10) * dt;
    w.y += w.vy * dt;
    if (w.x < -20) w.x = map.w + 10;
    if (w.x > map.w + 20) w.x = -10;
    if (w.y < -20) w.y = map.h + 10;
    if (w.y > map.h + 20) w.y = -10;
  }
}

function updateEnemies(dt) {
  const p = game.p, map = game.map;
  for (const e of game.enemies) {
    if (e.dead) continue;
    e.hitFlash = Math.max(0, e.hitFlash - dt);
    e.atkCd = Math.max(0, e.atkCd - dt);

    if (e.kx || e.ky) {
      moveEntity(e, e.kx * dt, e.ky * dt, map);
      e.kx *= Math.pow(0.02, dt);
      e.ky *= Math.pow(0.02, dt);
    }

    const d = dist(e.x, e.y, p.x, p.y);
    const a = Math.atan2(p.y - e.y, p.x - e.x);

    if (e.state === 'windup') {
      e.timer -= dt;
      e.dir = a;
      if (e.timer <= 0) {
        if (dist(e.x, e.y, p.x, p.y) < e.r + p.r + 26 && e.type !== 'ghost') {
          damagePlayer(e.dmg);
        }
        if (e.type === 'ghost' && e.windupKind === 'bolt') {
          const ang = Math.atan2(p.y - (e.y - 10), p.x - e.x);
          game.projectiles.push({
            x: e.x + Math.cos(ang) * 12, y: e.y - 10 + Math.sin(ang) * 12,
            vx: Math.cos(ang) * 205, vy: Math.sin(ang) * 205,
            r: 6, dmg: 10, life: 3, color: '#a8e6ff'
          });
          AudioFX.tone(620, 0.16, 'sine', 0.032, -220);
        }
        e.windupKind = null;
        e.state = 'idle';
        e.atkCd = e.type === 'ghost' ? 1.6 : 1.15;
      }
      continue;
    }

    if (e.type === 'ghost') {
      e.shootCd -= dt;
      if (d < e.aggro) {
        e.dir = a;
        if (d > 150) moveEntity(e, Math.cos(a) * e.speed * dt, Math.sin(a) * e.speed * dt, map);
        else if (d < 100) moveEntity(e, -Math.cos(a) * e.speed * 0.5 * dt, -Math.sin(a) * e.speed * 0.5 * dt, map);
        if (e.shootCd <= 0 && d < 380) {
          e.shootCd = 3.1;
          e.state = 'windup';
          e.timer = 0.45;
          e.windupKind = 'bolt';
        }
      } else {
        e.wander -= dt;
        if (e.wander <= 0) {
          e.wander = rand(1.5, 3.5);
          e.wx = e.home.x + rand(-70, 70);
          e.wy = e.home.y + rand(-50, 50);
        }
        const wa = Math.atan2(e.wy - e.y, e.wx - e.x);
        if (dist(e.x, e.y, e.wx, e.wy) > 8) moveEntity(e, Math.cos(wa) * 26 * dt, Math.sin(wa) * 26 * dt, map);
      }
    } else {
      /* limo */
      if (d < e.aggro) {
        e.dir = a;
        if (d > e.r + p.r + 6) {
          moveEntity(e, Math.cos(a) * e.speed * dt, Math.sin(a) * e.speed * dt, map);
        }
        if (d < e.r + p.r + 18 && e.atkCd <= 0) {
          e.state = 'windup';
          e.timer = 0.4;
        }
      } else {
        e.wander -= dt;
        if (e.wander <= 0) {
          e.wander = rand(1.2, 3);
          e.wx = e.home.x + rand(-80, 80);
          e.wy = e.home.y + rand(-60, 60);
        }
        const wa = Math.atan2(e.wy - e.y, e.wx - e.x);
        if (dist(e.x, e.y, e.wx, e.wy) > 10) moveEntity(e, Math.cos(wa) * 24 * dt, Math.sin(wa) * 24 * dt, map);
      }
    }
  }

  /* Separación suave entre enemigos */
  for (let i = 0; i < game.enemies.length; i++) {
    const a = game.enemies[i];
    if (a.dead) continue;
    for (let j = i + 1; j < game.enemies.length; j++) {
      const b = game.enemies[j];
      if (b.dead) continue;
      const dx = b.x - a.x, dy = b.y - a.y;
      const dd = Math.hypot(dx, dy);
      const min = a.r + b.r;
      if (dd > 0.01 && dd < min) {
        const push = (min - dd) / 2;
        a.x -= (dx / dd) * push;
        a.y -= (dy / dd) * push;
        b.x += (dx / dd) * push;
        b.y += (dy / dd) * push;
      }
    }
  }
  game.enemies = game.enemies.filter((e) => !e.dead);
}

function updateBoss(dt) {
  const b = game.boss;
  if (!b || b.dead) return;
  const p = game.p, map = game.map;
  b.hitFlash = Math.max(0, b.hitFlash - dt);

  if (!b.active) {
    if (dist(b.x, b.y, p.x, p.y) < 400) {
      b.active = true;
      AudioFX.boss();
      game.shake = 12;
      toast('El Señor de la Ceniza despierta', 'danger');
      showBossBar();
      updateBossBar();
    }
    return;
  }

  if (b.hp < b.maxHp * 0.5 && b.phase === 1) {
    b.phase = 2;
    b.speed = 76;
    toast('El Señor de la Ceniza arde con más furia', 'danger');
    game.shake = 14;
    addRing(b.x, b.y, 130, '#ff8a4c', 0.9);
    burst(b.x, b.y, '#ff8a4c', 30, 200, 5);
    AudioFX.boss();
  }

  if (b.kx || b.ky) {
    moveEntity(b, b.kx * dt, b.ky * dt, map);
    b.kx *= Math.pow(0.02, dt);
    b.ky *= Math.pow(0.02, dt);
  }

  const d = dist(b.x, b.y, p.x, p.y);
  const a = Math.atan2(p.y - b.y, p.x - b.x);
  b.dir = a;

  if (b.state === 'chase') {
    b.atkCd = Math.max(0, b.atkCd - dt);
    if (d > 120) moveEntity(b, Math.cos(a) * b.speed * dt, Math.sin(a) * b.speed * dt, map);
    if (b.atkCd <= 0) {
      if (d < 230) {
        b.state = 'slam';
        b.timer = 0.95;
        b.slamX = p.x;
        b.slamY = p.y;
        b.slamR = 128;
        game.effects.push({ kind: 'telegraph', x: b.slamX, y: b.slamY, r: b.slamR, life: 0.95, max: 0.95, color: '#ff6a4a' });
      } else if (d < 520) {
        b.state = 'volley';
        b.timer = 0.6;
      } else {
        b.atkCd = 0.4;
      }
    }
  } else if (b.state === 'slam') {
    b.timer -= dt;
    if (b.timer <= 0) {
      if (dist(b.slamX, b.slamY, p.x, p.y) < b.slamR + p.r) damagePlayer(b.dmg);
      burst(b.slamX, b.slamY, '#ff8a4c', 34, 260, 5);
      addRing(b.slamX, b.slamY, b.slamR, '#ff8a4c', 0.45);
      game.shake = 16;
      AudioFX.hit();
      b.state = 'chase';
      b.atkCd = b.phase === 2 ? 1.15 : 1.7;
      b.volleyCd = 2.4;
    }
  } else if (b.state === 'volley') {
    b.timer -= dt;
    if (b.timer <= 0) {
      const count = b.phase === 2 ? 7 : 5;
      const spread = 0.62;
      for (let i = 0; i < count; i++) {
        const t = count === 1 ? 0 : i / (count - 1) - 0.5;
        const ang = a + t * spread;
        game.projectiles.push({
          x: b.x + Math.cos(ang) * 30, y: b.y + Math.sin(ang) * 30,
          vx: Math.cos(ang) * 205, vy: Math.sin(ang) * 205,
          r: 7, dmg: b.phase === 2 ? 15 : 12, life: 3.2, color: '#ff9a5a'
        });
      }
      AudioFX.tone(220, 0.25, 'sawtooth', 0.045, -110);
      b.state = 'chase';
      b.atkCd = b.phase === 2 ? 1.8 : 2.6;
    }
  }
}

function updateProjectiles(dt) {
  const p = game.p, map = game.map;
  for (const pr of game.projectiles) {
    pr.x += pr.vx * dt;
    pr.y += pr.vy * dt;
    pr.life -= dt;
    if (pr.life <= 0) continue;
    if (pr.x < 0 || pr.y < 0 || pr.x > map.w || pr.y > map.h) { pr.life = 0; continue; }
    if (dist(pr.x, pr.y, p.x, p.y) < pr.r + p.r) {
      damagePlayer(pr.dmg);
      pr.life = 0;
      burst(pr.x, pr.y, pr.color, 12, 120, 3);
    }
  }
  game.projectiles = game.projectiles.filter((pr) => pr.life > 0);
}

function updateEffects(dt) {
  for (const fx of game.effects) fx.life -= dt;
  game.effects = game.effects.filter((fx) => fx.life > 0);
}

function updateParticles(dt) {
  for (const pt of game.particles) {
    pt.life -= dt;
    pt.x += pt.vx * dt;
    pt.y += pt.vy * dt;
    pt.vy += (pt.grav || 0) * dt;
    pt.vx *= Math.pow(0.2, dt);
  }
  game.particles = game.particles.filter((pt) => pt.life > 0);

  for (const n of game.numbers) {
    n.life -= dt;
    n.y += n.vy * dt;
    n.vy *= Math.pow(0.25, dt);
  }
  game.numbers = game.numbers.filter((n) => n.life > 0);
}

function updatePickups(dt) {
  /* Reservado para futuras recogidas; los objetos se entregan al instante. */
}
