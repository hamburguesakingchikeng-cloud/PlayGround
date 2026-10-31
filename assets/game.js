/* LA ESPADA CELESTIAL — vertical slice
   Canvas 2D, sin dependencias. Arte procedural. */
(() => {
  'use strict';

  /* ================= utilidades ================= */
  const TAU = Math.PI * 2;
  const $ = (s) => document.querySelector(s);
  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  const lerp = (a, b, t) => a + (b - a) * t;
  const rand = (a = 1, b = 0) => b + Math.random() * (a - b);
  const randi = (n) => (Math.random() * n) | 0;
  const angDiff = (a, b) => {
    let d = (a - b) % TAU;
    if (d > Math.PI) d -= TAU;
    if (d < -Math.PI) d += TAU;
    return d;
  };
  const dist = (ax, ay, bx, by) => Math.hypot(bx - ax, by - ay);

  /* ================= canvas ================= */
  const canvas = $('#game');
  const ctx = canvas.getContext('2d');
  let W = 0, H = 0, DPR = 1;

  function resize() {
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = Math.round(W * DPR);
    canvas.height = Math.round(H * DPR);
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }
  window.addEventListener('resize', resize);
  window.addEventListener('orientationchange', () => setTimeout(resize, 120));
  resize();

  /* ================= estado ================= */
  const ARENA_R = 400;
  const G = { mode: 'title', t: 0, muted: false };
  const camera = { x: 0, y: 0, shake: 0 };
  const run = { wave: 0, phase: 'waves', gap: 0, kills: 0, time: 0, ended: 0, best: 0 };

  let enemies = [];
  let orbs = [];
  let waves_ = [];
  let particles = [];
  let floaters = [];
  let boss = null;

  const player = {
    x: 0, y: 220, r: 17, vx: 0, vy: 0,
    facing: -Math.PI / 2,
    hp: 100, maxHp: 100, qi: 100, maxQi: 100,
    lvl: 1, xp: 0, xpNext: 70,
    atkCd: 0, atkAnim: 0, skillCd: 0, dashCd: 0, dashT: 0, dashDir: 0,
    inv: 0, flash: 0, hurtCd: 0, moving: 0, trail: []
  };

  /* ================= entrada ================= */
  const keys = new Set();
  const params = new URLSearchParams(location.search);
  const touchMode = matchMedia('(pointer: coarse)').matches || params.has('touch');
  const DEBUG = params.has('debug');
  const held = { atk: false, skill: false, dash: false };

  window.addEventListener('keydown', (e) => {
    const k = e.key.toLowerCase();
    if ([' ', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(k)) e.preventDefault();
    if (keys.has(k)) return;
    keys.add(k);
    if (k === 'escape' || k === 'p') togglePause();
    if (DEBUG && k === 'b') forceBoss();
    if (DEBUG && k === 'h') { player.hp = player.maxHp; }
    if (DEBUG && k === 'v') { enemies.forEach((e) => { e.alive = false; }); enemies = []; }
    if (k === 'enter' && (G.mode === 'title' || G.mode === 'win' || G.mode === 'dead')) {
      const b = document.querySelector(G.mode === 'title' ? '[data-act="play"]' : '[data-act="retry"], [data-act="again"]');
      if (b) b.click();
    }
  });
  window.addEventListener('keyup', (e) => keys.delete(e.key.toLowerCase()));
  window.addEventListener('blur', () => {
    keys.clear();
    if (G.mode === 'play') setPause(true);
  });

  /* ---------- joystick táctil ---------- */
  const stickEl = $('#stick');
  const knobEl = $('#knob');
  const stickVec = { x: 0, y: 0, active: false };
  let stickId = null;

  function stickMove(e) {
    const r = stickEl.getBoundingClientRect();
    const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    let dx = e.clientX - cx, dy = e.clientY - cy;
    const max = r.width * 0.34;
    const d = Math.hypot(dx, dy);
    if (d > max) { dx *= max / d; dy *= max / d; }
    knobEl.style.transform = `translate(${dx}px, ${dy}px)`;
    stickVec.x = dx / max;
    stickVec.y = dy / max;
    stickVec.active = true;
  }
  stickEl.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    stickId = e.pointerId;
    stickEl.setPointerCapture(e.pointerId);
    stickMove(e);
  });
  stickEl.addEventListener('pointermove', (e) => { if (e.pointerId === stickId) stickMove(e); });
  const stickEnd = (e) => {
    if (e.pointerId !== stickId) return;
    stickId = null;
    stickVec.x = 0; stickVec.y = 0; stickVec.active = false;
    knobEl.style.transform = 'translate(0px, 0px)';
  };
  stickEl.addEventListener('pointerup', stickEnd);
  stickEl.addEventListener('pointercancel', stickEnd);

  function bindHold(el, key, fn) {
    el.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      held[key] = true;
      fn();
    });
    ['pointerup', 'pointercancel', 'pointerleave'].forEach((t) =>
      el.addEventListener(t, () => { held[key] = false; }));
  }
  bindHold($('#btnAtk'), 'atk', () => { if (G.mode === 'play') tryAttack(); });
  bindHold($('#btnSkill'), 'skill', () => { if (G.mode === 'play') trySkill(); });
  bindHold($('#btnDash'), 'dash', () => { if (G.mode === 'play') tryDash(); });

  function moveVector() {
    let x = 0, y = 0;
    if (keys.has('a') || keys.has('arrowleft')) x -= 1;
    if (keys.has('d') || keys.has('arrowright')) x += 1;
    if (keys.has('w') || keys.has('arrowup')) y -= 1;
    if (keys.has('s') || keys.has('arrowdown')) y += 1;
    if (stickVec.active) { x += stickVec.x; y += stickVec.y; }
    const m = Math.hypot(x, y);
    if (m > 1) { x /= m; y /= m; }
    return { x, y, m: Math.min(m, 1) };
  }

  /* ================= audio mínimo ================= */
  let actx = null;
  function audio() {
    if (!actx) {
      try { actx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { actx = null; }
    }
    return actx;
  }
  function sfx(type) {
    if (G.muted) return;
    const ac = audio();
    if (!ac) return;
    const t = ac.currentTime;
    const o = ac.createOscillator();
    const g = ac.createGain();
    o.connect(g).connect(ac.destination);
    const cfg = {
      hit:   { f: 320, f2: 120, d: 0.11, v: 0.05, w: 'square' },
      hurt:  { f: 180, f2: 70,  d: 0.22, v: 0.09, w: 'sawtooth' },
      dash:  { f: 620, f2: 900, d: 0.09, v: 0.03, w: 'sine' },
      skill: { f: 240, f2: 760, d: 0.3,  v: 0.06, w: 'triangle' },
      kill:  { f: 420, f2: 140, d: 0.2,  v: 0.05, w: 'triangle' },
      level: { f: 520, f2: 1040, d: 0.35, v: 0.05, w: 'sine' }
    }[type];
    if (!cfg) return;
    o.type = cfg.w;
    o.frequency.setValueAtTime(cfg.f, t);
    o.frequency.exponentialRampToValueAtTime(Math.max(40, cfg.f2), t + cfg.d);
    g.gain.setValueAtTime(cfg.v, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + cfg.d);
    o.start(t);
    o.stop(t + cfg.d + 0.02);
  }

  /* ================= partículas ================= */
  function burst(x, y, n, color, speed = 200, size = 2.4) {
    for (let i = 0; i < n; i++) {
      const a = rand(TAU);
      const s = rand(speed, speed * 0.25);
      particles.push({
        x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s,
        life: rand(0.7, 0.3), max: 0.7, size: rand(size * 1.6, size * 0.5),
        color, drag: 0.92
      });
    }
  }
  function ring(x, y, n, radius, color, speed = 120) {
    for (let i = 0; i < n; i++) {
      const a = (i / n) * TAU + rand(0.2);
      particles.push({
        x: x + Math.cos(a) * radius, y: y + Math.sin(a) * radius,
        vx: Math.cos(a) * speed, vy: Math.sin(a) * speed,
        life: rand(0.6, 0.3), max: 0.6, size: rand(3, 1.4),
        color, drag: 0.9
      });
    }
  }
  function floatText(x, y, text, color = '#ffd9a0', size = 14) {
    floaters.push({ x, y, text, color, size, life: 0.9, max: 0.9, vy: -46 });
  }
  function shake(a) { camera.shake = Math.min(26, camera.shake + a); }

  /* ================= jugador ================= */
  function tryAttack() {
    if (player.atkCd > 0) return;
    player.atkCd = 0.33;
    player.atkAnim = 1;
    player.swingFrom = player.facing - 1.1;
    player.vx += Math.cos(player.facing) * 130;
    player.vy += Math.sin(player.facing) * 130;
    sfx('hit');

    const dmg = 15 + player.lvl * 2.2;
    let hits = 0;
    const hitAt = (x, y) => {
      if (dist(x, y, player.x, player.y) > 92) return false;
      const a = Math.atan2(y - player.y, x - player.x);
      return Math.abs(angDiff(a, player.facing)) < 1.2;
    };
    for (const e of enemies) {
      if (!e.alive || e.spawnT > 0) continue;
      if (hitAt(e.x, e.y)) {
        damageEnemy(e, dmg, Math.cos(player.facing) * 210, Math.sin(player.facing) * 210);
        hits++;
      }
    }
    if (boss && boss.state !== 'dying' && hitAt(boss.x, boss.y)) {
      damageBoss(dmg);
      hits++;
    }
    if (hits) {
      player.qi = Math.min(player.maxQi, player.qi + 5);
      shake(3.5);
      burst(player.x + Math.cos(player.facing) * 46, player.y + Math.sin(player.facing) * 46, 7, '#ffe6b8', 260, 2.2);
    }
  }

  function trySkill() {
    if (player.skillCd > 0 || player.qi < 30) return;
    player.qi -= 30;
    player.skillCd = 1.5;
    sfx('skill');
    shake(9);
    ring(player.x, player.y, 26, 26, '#5fe3c0', 330);
    ring(player.x, player.y, 18, 60, '#e6c983', 210);

    const dmg = 34 + player.lvl * 3.5;
    const R = 190;
    for (const e of enemies) {
      if (!e.alive || e.spawnT > 0) continue;
      const d = dist(e.x, e.y, player.x, player.y);
      if (d < R + e.r) {
        const a = Math.atan2(e.y - player.y, e.x - player.x);
        damageEnemy(e, dmg, Math.cos(a) * 430, Math.sin(a) * 430);
      }
    }
    if (boss && boss.state !== 'dying' && dist(boss.x, boss.y, player.x, player.y) < R + boss.r) damageBoss(dmg * 0.8);
    orbs = orbs.filter((o) => {
      if (dist(o.x, o.y, player.x, player.y) < R) {
        burst(o.x, o.y, 5, '#5fe3c0', 180);
        return false;
      }
      return true;
    });
    waves_ = waves_.filter((s) => !(s.friendly && dist(s.x, s.y, player.x, player.y) < R));
  }

  function tryDash() {
    if (player.dashCd > 0) return;
    const mv = moveVector();
    player.dashDir = mv.m > 0.15 ? Math.atan2(mv.y, mv.x) : player.facing;
    player.facing = player.dashDir;
    player.dashT = 0.17;
    player.dashCd = 0.85;
    player.inv = Math.max(player.inv, 0.26);
    sfx('dash');
    burst(player.x, player.y, 8, '#9fd8ff', 130, 1.8);
  }

  function hurtPlayer(amount, fromX, fromY) {
    if (player.inv > 0 || G.mode !== 'play') return;
    player.hp -= amount;
    player.inv = 0.85;
    player.flash = 1;
    player.hurtCd = 0.4;
    shake(10);
    sfx('hurt');
    floatText(player.x, player.y - 26, '-' + Math.round(amount), '#ff7f9e', 15);
    burst(player.x, player.y, 12, '#ff5f86', 210);
    if (fromX !== undefined) {
      const a = Math.atan2(player.y - fromY, player.x - fromX);
      player.vx += Math.cos(a) * 260;
      player.vy += Math.sin(a) * 260;
    }
    if (player.hp <= 0) {
      player.hp = 0;
      die();
    }
  }

  function gainXp(n) {
    player.xp += n;
    while (player.xp >= player.xpNext) {
      player.xp -= player.xpNext;
      player.lvl++;
      player.xpNext = Math.round(player.xpNext * 1.45);
      player.maxHp += 12;
      player.hp = Math.min(player.maxHp, player.hp + 30);
      player.qi = player.maxQi;
      floatText(player.x, player.y - 40, 'NIVEL ' + player.lvl, '#e6c983', 18);
      ring(player.x, player.y, 20, 20, '#e6c983', 180);
      sfx('level');
    }
    updateHUD();
  }

  /* ================= enemigos ================= */
  const TYPES = {
    sombra:   { hp: 38, r: 18, speed: 122, xp: 14, touch: 9,  color: '#8b6bff' },
    guardian: { hp: 62, r: 21, speed: 80,  xp: 18, touch: 6,  color: '#3ad6c8' },
    espectro: { hp: 28, r: 15, speed: 205, xp: 16, touch: 10, color: '#ff6f9c' }
  };

  function spawnEnemy(type, x, y) {
    const t = TYPES[type];
    const hpScale = 1 + (run.wave - 1) * 0.12;
    const e = {
      type, x, y, r: t.r, speed: t.speed, color: t.color, xp: t.xp,
      hp: Math.round(t.hp * hpScale), maxHp: Math.round(t.hp * hpScale),
      vx: 0, vy: 0, kx: 0, ky: 0, alive: true, spawnT: 0.75, flash: 0,
      state: 'idle', timer: rand(0.6), tele: 0, touch: t.touch, hitCd: 0,
      angle: rand(TAU), dashDir: 0, seed: rand(TAU)
    };
    enemies.push(e);
    ring(x, y, 10, 12, t.color, 90);
    return e;
  }

  function damageEnemy(e, dmg, kx = 0, ky = 0) {
    if (!e.alive) return;
    e.hp -= dmg;
    e.flash = 1;
    e.kx += kx * 0.55;
    e.ky += ky * 0.55;
    floatText(e.x + rand(8, -8), e.y - e.r - 6, Math.round(dmg), '#ffe0a8', 13);
    burst(e.x, e.y, 5, '#ffcf8a', 170, 2);
    if (e.hp <= 0) killEnemy(e);
  }

  function killEnemy(e) {
    e.alive = false;
    run.kills++;
    burst(e.x, e.y, 16, e.color, 260, 2.8);
    ring(e.x, e.y, 10, 8, e.color, 140);
    floatText(e.x, e.y - 20, '+' + e.xp, '#5fe3c0', 12);
    player.qi = Math.min(player.maxQi, player.qi + 6);
    gainXp(e.xp);
    sfx('kill');
  }

  /* ================= jefe ================= */
  function forceBoss() {
    if (boss || G.mode !== 'play') return;
    enemies.forEach((e) => { e.alive = false; });
    enemies = [];
    orbs = [];
    run.phase = 'boss';
    spawnBoss();
    banner('Cima del Centinela');
  }

  function spawnBoss() {
    boss = {
      x: 0, y: -160, r: 52, hp: 620, maxHp: 620,
      state: 'idle', t: 0, tele: 0, phase: 1,
      angle: 0, flash: 0, dir: 0, chargeT: 0, hitCd: 0, dying: 0
    };
    $('#bossbar').classList.add('on');
    $('#bossname').textContent = 'Centinela del Cielo Roto';
    shake(14);
    ring(0, -200, 30, 40, '#e6c983', 260);
  }

  function damageBoss(dmg) {
    if (!boss || boss.state === 'dying') return;
    boss.hp -= dmg;
    boss.flash = 1;
    floatText(boss.x + rand(20, -20), boss.y - boss.r, Math.round(dmg), '#ffe0a8', 15);
    burst(boss.x, boss.y, 6, '#ffd18a', 200, 2.4);
    if (boss.hp <= 0) { boss.hp = 0; bossDie(); return; }
    const p = boss.hp / boss.maxHp;
    if (p < 0.25 && boss.phase < 3) phaseShift(3);
    else if (p < 0.6 && boss.phase < 2) phaseShift(2);
  }

  function phaseShift(n) {
    boss.phase = n;
    boss.state = 'recover';
    boss.t = 0.9;
    boss.tele = 1;
    shake(16);
    ring(boss.x, boss.y, 34, 30, '#ff8f6b', 340);
    floatText(boss.x, boss.y - 70, n === 2 ? 'SEGUNDA ORDEN' : 'ÚLTIMA ORDEN', '#ffb08a', 16);
    if (n === 2) {
      for (let i = 0; i < 2; i++) {
        const a = rand(TAU);
        spawnEnemy('espectro', boss.x + Math.cos(a) * 90, boss.y + Math.sin(a) * 90);
      }
    }
  }

  function bossDie() {
    boss.state = 'dying';
    boss.dying = 0;
    run.phase = 'done';
    shake(20);
    ring(boss.x, boss.y, 40, 30, '#e6c983', 380);
    for (let i = 0; i < 4; i++) setTimeout(() => burst(boss.x + rand(40, -40), boss.y + rand(40, -40), 18, '#ffd18a', 300, 3), i * 180);
    gainXp(180);
    sfx('level');
  }

  function bossUpdate(dt) {
    if (!boss) return;
    boss.flash = Math.max(0, boss.flash - dt * 4);
    boss.angle += dt * 0.6;

    if (boss.state === 'dying') {
      boss.dying += dt;
      if (boss.dying > 1.7 && !run.ended) {
        run.ended = 1;
        showBossEnding();
      }
      return;
    }

    const toP = Math.atan2(player.y - boss.y, player.x - boss.x);
    boss.hitCd = Math.max(0, boss.hitCd - dt);
    boss.t -= dt;
    boss.tele = Math.max(0, boss.tele - dt);

    const speed = boss.phase === 3 ? 96 : boss.phase === 2 ? 78 : 62;

    switch (boss.state) {
      case 'idle': {
        const d = dist(boss.x, boss.y, player.x, player.y);
        if (d > 150) {
          boss.x += Math.cos(toP) * speed * dt;
          boss.y += Math.sin(toP) * speed * dt;
        }
        if (boss.t <= 0) {
          const r = Math.random();
          if (boss.phase >= 2 && r < 0.32) { boss.state = 'slam'; boss.tele = 0.7; }
          else if (r < 0.66) { boss.state = 'fan'; boss.tele = 0.55; }
          else { boss.state = 'chargeTele'; boss.tele = 0.6; boss.dir = toP; }
        }
        break;
      }
      case 'chargeTele': {
        boss.dir = lerp(boss.dir, toP, 1 - Math.pow(0.001, dt));
        if (boss.tele <= 0) { boss.state = 'charge'; boss.chargeT = 0.5; sfx('dash'); }
        break;
      }
      case 'charge': {
        boss.chargeT -= dt;
        boss.x += Math.cos(boss.dir) * 760 * dt;
        boss.y += Math.sin(boss.dir) * 760 * dt;
        if (dist(boss.x, boss.y, player.x, player.y) < boss.r + player.r + 6) hurtPlayer(24, boss.x, boss.y);
        if (boss.chargeT <= 0) { boss.state = 'recover'; boss.t = boss.phase === 3 ? 0.4 : 0.7; }
        break;
      }
      case 'fan': {
        if (boss.tele <= 0) {
          const n = boss.phase === 3 ? 9 : 5;
          const spread = boss.phase === 3 ? 1.9 : 1.3;
          for (let i = 0; i < n; i++) {
            const a = toP + (i / (n - 1) - 0.5) * spread;
            orbs.push({ x: boss.x, y: boss.y, vx: Math.cos(a) * 230, vy: Math.sin(a) * 230, r: 8, dmg: 11, life: 3.2, color: '#ff9d7a' });
          }
          sfx('hit');
          boss.state = 'recover';
          boss.t = boss.phase === 3 ? 0.55 : 0.9;
        }
        break;
      }
      case 'slam': {
        if (boss.tele <= 0) {
          waves_.push({ x: boss.x, y: boss.y, r: 40, maxR: 430, speed: 340, dmg: 16, hit: false, friendly: false });
          shake(12);
          sfx('hurt');
          boss.state = 'recover';
          boss.t = 0.85;
        }
        break;
      }
      default: { // recover
        if (boss.t <= 0) { boss.state = 'idle'; boss.t = boss.phase === 3 ? 0.75 : 1.15; }
      }
    }

    // daño por contacto pasivo
    if (boss.state !== 'charge' && boss.hitCd <= 0 && dist(boss.x, boss.y, player.x, player.y) < boss.r + player.r) {
      hurtPlayer(10, boss.x, boss.y);
      boss.hitCd = 0.7;
    }

    // confinamiento
    const bd = Math.hypot(boss.x, boss.y);
    if (bd > ARENA_R - boss.r - 8) {
      boss.x *= (ARENA_R - boss.r - 8) / bd;
      boss.y *= (ARENA_R - boss.r - 8) / bd;
      if (boss.state === 'charge') { boss.state = 'recover'; boss.t = 0.6; shake(8); }
    }
  }

  /* ================= oleadas ================= */
  const WAVES = [
    { name: 'Oleada I · Sombras del Jardín', list: [['sombra', 4]] },
    { name: 'Oleada II · Guardia de Jade', list: [['sombra', 2], ['guardian', 2], ['espectro', 1]] },
    { name: 'Oleada III · El Jardín se rompe', list: [['espectro', 2], ['guardian', 2], ['sombra', 3]] }
  ];

  function spawnWave(n) {
    run.wave = n;
    const w = WAVES[n - 1];
    banner(w.name);
    const list = [];
    w.list.forEach(([t, c]) => { for (let i = 0; i < c; i++) list.push(t); });
    list.forEach((t, i) => {
      const a = (i / list.length) * TAU + rand(0.4, -0.4);
      const rr = rand(ARENA_R - 90, ARENA_R - 190);
      spawnEnemy(t, Math.cos(a) * rr, Math.sin(a) * rr);
    });
    updateHUD();
  }

  let bannerTimer = 0;
  function banner(text) {
    const el = $('#wavebanner');
    el.textContent = text;
    el.classList.add('on');
    clearTimeout(bannerTimer);
    bannerTimer = setTimeout(() => el.classList.remove('on'), 2300);
  }

  function startBossEncounter() {
    run.phase = 'bossIntro';
    startDialogue([
      { who: 'Centinela', text: 'Alto. Esta astilla sostiene diecinueve vidas allá abajo.' },
      { who: 'Centinela', text: 'La orden era sostener. Nadie dijo sostener qué.' },
      { who: 'Lian', text: 'Entonces suéltala. Yo sostengo lo demás.' }
    ], () => {
      run.phase = 'boss';
      spawnBoss();
      banner('Cima del Centinela');
    });
  }

  /* ================= diálogo ================= */
  const dlg = { lines: [], i: 0, shown: 0, done: null, active: false };
  const dlgEl = $('#dialogue');
  const dlgWho = $('#dlgwho');
  const dlgText = $('#dlgtext');

  function startDialogue(lines, onDone) {
    dlg.lines = lines;
    dlg.i = 0;
    dlg.shown = 0;
    dlg.done = onDone;
    dlg.active = true;
    G.mode = 'dialogue';
    dlgEl.classList.add('on');
    if (touchMode) $('#touch').classList.add('dim');
    showLine();
  }

  function showLine() {
    const l = dlg.lines[dlg.i];
    dlgWho.textContent = l.who || '';
    dlgText.textContent = '';
    dlg.shown = 0;
  }

  function updateDialogue(dt) {
    if (!dlg.active) return;
    const l = dlg.lines[dlg.i];
    if (!l) return;
    const full = l.text;
    if (dlg.shown < full.length) {
      dlg.shown = Math.min(full.length, dlg.shown + dt * 55);
      dlgText.textContent = full.slice(0, Math.floor(dlg.shown));
    }
  }

  function advanceDialogue() {
    if (!dlg.active) return;
    const l = dlg.lines[dlg.i];
    if (dlg.shown < l.text.length) { dlg.shown = l.text.length; dlgText.textContent = l.text; return; }
    dlg.i++;
    if (dlg.i >= dlg.lines.length) {
      dlg.active = false;
      dlgEl.classList.remove('on');
      $('#touch').classList.remove('dim');
      const cb = dlg.done;
      dlg.done = null;
      G.mode = 'play';
      if (cb) cb();
    } else {
      showLine();
    }
  }

  canvas.addEventListener('pointerdown', () => { if (G.mode === 'dialogue') advanceDialogue(); });
  dlgEl.addEventListener('pointerdown', (e) => { e.preventDefault(); if (G.mode === 'dialogue') advanceDialogue(); });
  window.addEventListener('keydown', (e) => {
    if ((e.key === ' ' || e.key === 'Enter' || e.key.toLowerCase() === 'j') && G.mode === 'dialogue') {
      e.preventDefault();
      advanceDialogue();
    }
  });

  /* ================= flujo ================= */
  function setOverlay(id, on) {
    const el = $('#' + id);
    if (!el) return;
    el.classList.toggle('hidden', !on);
  }

  function startRun(fresh) {
    const saved = load();
    player.x = 0; player.y = 220;
    player.vx = player.vy = 0;
    player.facing = -Math.PI / 2;
    player.maxHp = 100; player.hp = 100;
    player.maxQi = 100; player.qi = 100;
    player.lvl = fresh ? 1 : (saved && saved.lvl) || 1;
    player.xp = fresh ? 0 : (saved && saved.xp) || 0;
    player.xpNext = 70;
    player.maxHp = 100 + (player.lvl - 1) * 12;
    player.hp = player.maxHp;
    player.atkCd = player.skillCd = player.dashCd = player.dashT = player.inv = 0;

    enemies = []; orbs = []; waves_ = []; particles = []; floaters = []; boss = null;
    run.wave = 0; run.phase = 'waves'; run.gap = 0.9; run.kills = 0; run.time = 0; run.ended = 0;
    run.best = (saved && saved.best) || 0;

    snapCamera();
    camera.shake = 0;

    $('#bossbar').classList.remove('on');
    setOverlay('title', false);
    setOverlay('pause', false);
    setOverlay('dead', false);
    setOverlay('win', false);
    setOverlay('help', false);
    $('#hud').classList.add('on');
    if (touchMode) $('#touch').classList.add('on');
    updateHUD();
    G.mode = 'play';

    if (fresh) {
      startDialogue([
        { who: 'Lian', text: 'El cielo no cayó. Se rompió, y los pedazos siguen ahí arriba, haciendo peso.' },
        { who: 'Lian', text: 'Subo por la primera astilla. Si el Centinela sigue en pie, sigue sosteniendo.' },
        { who: 'Lian', text: 'Corto con J o el botón. Esquivo con Shift. El Qi se gana golpeando.' }
      ], () => { spawnWave(1); });
    } else {
      spawnWave(1);
    }
  }

  function die() {
    G.mode = 'dead';
    setOverlay('dead', true);
    save({ lvl: player.lvl, xp: player.xp, best: Math.max(run.best, run.kills) });
  }

  function save(data) {
    try { localStorage.setItem('lecel.save.v1', JSON.stringify(Object.assign({ t: Date.now() }, data))); } catch (e) {}
  }
  function load() {
    try { return JSON.parse(localStorage.getItem('lecel.save.v1') || 'null'); } catch (e) { return null; }
  }

  function showBossEnding() {
    const mins = Math.floor(run.time / 60), secs = Math.floor(run.time % 60);
    save({ lvl: player.lvl, xp: player.xp, best: Math.max(run.best, run.kills), cleared: true });
    startDialogue([
      { who: 'Centinela', text: 'La orden era sostener. Nadie dijo sostener qué.' },
      { who: 'Lian', text: 'Ya lo sé. Yo tampoco sé qué sostenía la mía.' },
      { who: 'Lian', text: 'Pero el fragmento está en mi mano, y el cielo sigue arriba.' }
    ], () => {
      G.mode = 'win';
      $('#winstats').textContent =
        `Nivel ${player.lvl} · ${run.kills} enemigos · ${mins}:${String(secs).padStart(2, '0')} min. ` +
        'El fragmento I queda registrado en el guardado.';
      setOverlay('win', true);
      $('#bossbar').classList.remove('on');
    });
  }

  function togglePause() {
    if (G.mode === 'play') setPause(true);
    else if (G.mode === 'pause') setPause(false);
  }
  function setPause(on) {
    if (on) {
      G.mode = 'pause';
      setOverlay('pause', true);
      $('#savenote').textContent = '';
    } else {
      G.mode = 'play';
      setOverlay('pause', false);
    }
  }

  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-act]');
    if (!b) return;
    const act = b.dataset.act;
    if (act === 'play') { audio(); startRun(true); }
    else if (act === 'continue') { const s = load(); if (s) startRun(false); }
    else if (act === 'help') setOverlay('help', true);
    else if (act === 'closehelp') setOverlay('help', false);
    else if (act === 'resume') setPause(false);
    else if (act === 'save') {
      save({ lvl: player.lvl, xp: player.xp, best: Math.max(run.best, run.kills) });
      $('#savenote').textContent = 'Guardado.';
    } else if (act === 'quit') { toTitle(); }
    else if (act === 'retry') { startRun(false); }
    else if (act === 'again') { startRun(false); }
  });

  $('#pausebtn').addEventListener('click', togglePause);

  function toTitle() {
    G.mode = 'title';
    enemies = []; orbs = []; waves_ = []; particles = []; floaters = [];
    boss = null;
    camera.x = 0; camera.y = 0; camera.shake = 0;
    setOverlay('pause', false);
    setOverlay('dead', false);
    setOverlay('win', false);
    setOverlay('title', true);
    $('#hud').classList.remove('on');
    $('#touch').classList.remove('on', 'dim');
    $('#bossbar').classList.remove('on');
    const s = load();
    $('#btnContinue').disabled = !s;
  }

  /* ================= HUD ================= */
  const ui = {
    hp: $('#hpfill'), hptext: $('#hptext'), qi: $('#qifill'),
    xp: $('#xpfill'), lvl: $('#lvl'), boss: $('#bossfill')
  };
  function updateHUD() {
    ui.hp.style.width = clamp((player.hp / player.maxHp) * 100, 0, 100) + '%';
    ui.hptext.textContent = Math.round(player.hp) + ' / ' + player.maxHp;
    ui.qi.style.width = clamp((player.qi / player.maxQi) * 100, 0, 100) + '%';
    ui.xp.style.width = clamp((player.xp / player.xpNext) * 100, 0, 100) + '%';
    ui.lvl.textContent = player.lvl;
  }
  function updateBossBar() {
    if (!boss) return;
    ui.boss.style.width = clamp((boss.hp / boss.maxHp) * 100, 0, 100) + '%';
  }

  /* ================= actualización ================= */
  function updatePlayer(dt) {
    const mv = moveVector();

    if (player.dashT > 0) {
      player.dashT -= dt;
      const sp = 900;
      player.vx = Math.cos(player.dashDir) * sp;
      player.vy = Math.sin(player.dashDir) * sp;
      player.trail.push({ x: player.x, y: player.y, a: 1 });
    } else {
      const speed = 268;
      const accel = 1 - Math.pow(0.0005, dt);
      player.vx = lerp(player.vx, mv.x * speed, accel);
      player.vy = lerp(player.vy, mv.y * speed, accel);
      if (mv.m > 0.12) {
        const a = Math.atan2(mv.y, mv.x);
        player.facing = player.facing + angDiff(a, player.facing) * Math.min(1, dt * 16);
      }
    }

    player.x += player.vx * dt;
    player.y += player.vy * dt;

    const d = Math.hypot(player.x, player.y);
    const lim = ARENA_R - player.r - 6;
    if (d > lim) { player.x *= lim / d; player.y *= lim / d; }

    player.atkCd = Math.max(0, player.atkCd - dt);
    player.skillCd = Math.max(0, player.skillCd - dt);
    player.dashCd = Math.max(0, player.dashCd - dt);
    player.inv = Math.max(0, player.inv - dt);
    player.flash = Math.max(0, player.flash - dt * 3);
    player.atkAnim = Math.max(0, player.atkAnim - dt * 4.2);
    player.qi = Math.min(player.maxQi, player.qi + 6 * dt);
    player.moving = mv.m;
    player.trail = player.trail.filter((t) => (t.a -= dt * 5) > 0);

    if (held.atk || keys.has('j') || keys.has(' ')) tryAttack();
    if (held.skill || keys.has('k')) trySkill();
    if (held.dash || keys.has('shift')) tryDash();
  }

  function updateEnemies(dt) {
    for (const e of enemies) {
      if (!e.alive) continue;
      e.flash = Math.max(0, e.flash - dt * 4);
      e.hitCd = Math.max(0, e.hitCd - dt);
      if (e.spawnT > 0) { e.spawnT -= dt; continue; }

      const d = dist(e.x, e.y, player.x, player.y);
      const a = Math.atan2(player.y - e.y, player.x - e.x);
      e.timer -= dt;
      e.tele = Math.max(0, e.tele - dt);

      if (e.type === 'sombra') {
        if (e.state === 'idle') {
          e.vx = lerp(e.vx, Math.cos(a) * e.speed, 1 - Math.pow(0.002, dt));
          e.vy = lerp(e.vy, Math.sin(a) * e.speed, 1 - Math.pow(0.002, dt));
          if (d < 110 && e.timer <= 0) { e.state = 'tele'; e.tele = 0.42; e.timer = 2.2; }
        } else if (e.state === 'tele') {
          e.vx *= 0.86; e.vy *= 0.86;
          if (e.tele <= 0) { e.state = 'lunge'; e.timer = 0.22; e.dashDir = a; }
        } else {
          e.vx = Math.cos(e.dashDir) * 460;
          e.vy = Math.sin(e.dashDir) * 460;
          if (e.timer <= 0) { e.state = 'idle'; e.timer = 1.1; }
        }
      } else if (e.type === 'guardian') {
        const want = d < 240 ? -1 : d > 340 ? 1 : 0;
        e.vx = lerp(e.vx, Math.cos(a) * e.speed * want + Math.cos(a + Math.PI / 2) * 34, 1 - Math.pow(0.005, dt));
        e.vy = lerp(e.vy, Math.sin(a) * e.speed * want + Math.sin(a + Math.PI / 2) * 34, 1 - Math.pow(0.005, dt));
        if (e.timer <= 0) {
          e.timer = 1.9;
          e.tele = 0.45;
          setTimeout(() => {
            if (!e.alive || G.mode !== 'play') return;
            const aa = Math.atan2(player.y - e.y, player.x - e.x);
            orbs.push({ x: e.x, y: e.y, vx: Math.cos(aa) * 225, vy: Math.sin(aa) * 225, r: 7, dmg: 11, life: 3.4, color: '#5fe3c0' });
          }, 450);
        }
      } else { // espectro
        if (e.state === 'idle') {
          e.vx = lerp(e.vx, Math.cos(a) * e.speed * 0.42, 1 - Math.pow(0.01, dt));
          e.vy = lerp(e.vy, Math.sin(a) * e.speed * 0.42, 1 - Math.pow(0.01, dt));
          if (e.timer <= 0) { e.state = 'tele'; e.tele = 0.34; e.dashDir = a; e.timer = 1.5; }
        } else if (e.state === 'tele') {
          e.vx *= 0.9; e.vy *= 0.9;
          if (e.tele <= 0) { e.state = 'dash'; e.timer = 0.26; }
        } else {
          e.vx = Math.cos(e.dashDir) * 640;
          e.vy = Math.sin(e.dashDir) * 640;
          if (e.timer <= 0) { e.state = 'idle'; e.timer = 0.9; }
        }
      }

      e.x += (e.vx + e.kx) * dt;
      e.y += (e.vy + e.ky) * dt;
      e.kx *= Math.pow(0.02, dt);
      e.ky *= Math.pow(0.02, dt);

      // separación suave
      for (const o of enemies) {
        if (o === e || !o.alive) continue;
        const dd = dist(e.x, e.y, o.x, o.y);
        const min = e.r + o.r;
        if (dd > 0.01 && dd < min) {
          const push = (min - dd) * 0.5;
          e.x += ((e.x - o.x) / dd) * push;
          e.y += ((e.y - o.y) / dd) * push;
        }
      }

      const ed = Math.hypot(e.x, e.y);
      const el = ARENA_R - e.r - 4;
      if (ed > el) { e.x *= el / ed; e.y *= el / ed; }

      if (e.hitCd <= 0 && dist(e.x, e.y, player.x, player.y) < e.r + player.r) {
        hurtPlayer(e.touch, e.x, e.y);
        e.hitCd = 0.85;
      }
    }
    enemies = enemies.filter((e) => e.alive);
  }

  function updateProjectiles(dt) {
    for (const o of orbs) {
      o.x += o.vx * dt;
      o.y += o.vy * dt;
      o.life -= dt;
      if (Math.hypot(o.x, o.y) > ARENA_R - 6) o.life = 0;
      if (dist(o.x, o.y, player.x, player.y) < o.r + player.r) {
        hurtPlayer(o.dmg, o.x - o.vx * 0.02, o.y - o.vy * 0.02);
        o.life = 0;
      }
    }
    orbs = orbs.filter((o) => o.life > 0);

    for (const s of waves_) {
      const prev = s.r;
      s.r += s.speed * dt;
      if (!s.hit) {
        const d = dist(s.x, s.y, player.x, player.y);
        if (d > prev && d < s.r + player.r) {
          s.hit = true;
          hurtPlayer(s.dmg, s.x, s.y);
        }
      }
    }
    waves_ = waves_.filter((s) => s.r < s.maxR);
  }

  function updateFX(dt) {
    for (const p of particles) {
      p.life -= dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vx *= Math.pow(p.drag, dt * 60);
      p.vy *= Math.pow(p.drag, dt * 60);
    }
    particles = particles.filter((p) => p.life > 0);
    for (const f of floaters) {
      f.life -= dt;
      f.y += f.vy * dt;
      f.vy *= 0.94;
    }
    floaters = floaters.filter((f) => f.life > 0);
    camera.shake *= Math.pow(0.0025, dt);
    if (camera.shake < 0.2) camera.shake = 0;
  }

  function update(dt) {
    G.t += dt;
    if (G.mode === 'dialogue') { updateDialogue(dt); updateFX(dt * 0.4); return; }
    if (G.mode !== 'play') return;

    run.time += dt;
    updatePlayer(dt);
    updateEnemies(dt);
    bossUpdate(dt);
    updateProjectiles(dt);
    updateFX(dt);
    updateBossBar();

    if (run.phase === 'waves' && enemies.length === 0) {
      run.gap -= dt;
      if (run.gap <= 0) {
        if (run.wave < WAVES.length) { spawnWave(run.wave + 1); run.gap = 1.4; }
        else startBossEncounter();
      }
    }

    updateHUD();
    updateCamera(dt);

    if (player.hp <= 0 && G.mode === 'play') die();
  }

  function cameraLimits() {
    const margin = 140;
    return {
      x: Math.max(0, ARENA_R + margin - W / 2),
      y: Math.max(0, ARENA_R + margin - H / 2)
    };
  }
  function snapCamera() {
    const l = cameraLimits();
    camera.x = clamp(player.x, -l.x, l.x);
    camera.y = clamp(player.y, -l.y, l.y);
  }
  function updateCamera(dt) {
    const l = cameraLimits();
    const k = 1 - Math.pow(0.0009, dt);
    camera.x = lerp(camera.x, clamp(player.x, -l.x, l.x), k);
    camera.y = lerp(camera.y, clamp(player.y, -l.y, l.y), k);
  }

  /* ================= render ================= */
  const stars = Array.from({ length: 150 }, () => ({
    x: Math.random(), y: Math.random(), r: rand(1.6, 0.3), p: rand(TAU), a: rand(0.7, 0.15)
  }));

  function drawBackground() {
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#05070f');
    g.addColorStop(0.55, '#0a0f22');
    g.addColorStop(1, '#0d1024');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);

    // niebla inferior
    const f = ctx.createRadialGradient(W * 0.5, H * 1.05, 0, W * 0.5, H * 1.05, H * 0.9);
    f.addColorStop(0, 'rgba(70,95,170,.16)');
    f.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = f;
    ctx.fillRect(0, 0, W, H);

    for (const s of stars) {
      const px = (s.x * W + camera.x * 0.035) % W;
      const py = (s.y * H + camera.y * 0.035) % H;
      const tw = 0.55 + 0.45 * Math.sin(G.t * 1.4 + s.p);
      ctx.globalAlpha = s.a * tw;
      ctx.fillStyle = '#cfe0ff';
      ctx.beginPath();
      ctx.arc((px + W) % W, (py + H) % H, s.r, 0, TAU);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  function drawClouds() {
    const t = G.t * 0.06;
    for (let i = 0; i < 5; i++) {
      const base = (i / 5) * TAU;
      const x = Math.cos(base + t) * (ARENA_R + 210 + i * 26);
      const y = Math.sin(base * 0.7 + t * 1.4) * 120 + ARENA_R + 170 + i * 34;
      const r = 210 + i * 40;
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, 'rgba(74,96,168,.10)');
      g.addColorStop(0.55, 'rgba(56,74,138,.05)');
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
    }
  }

  function drawArena() {
    const R = ARENA_R;
    ctx.save();

    // resplandor de borde
    const glow = ctx.createRadialGradient(0, 0, R * 0.75, 0, 0, R * 1.18);
    glow.addColorStop(0, 'rgba(230,201,131,0)');
    glow.addColorStop(0.72, 'rgba(230,201,131,.09)');
    glow.addColorStop(1, 'rgba(230,201,131,0)');
    ctx.fillStyle = glow;
    ctx.beginPath(); ctx.arc(0, 0, R * 1.18, 0, TAU); ctx.fill();

    // plataforma
    const g = ctx.createRadialGradient(-R * 0.2, -R * 0.25, R * 0.05, 0, 0, R);
    g.addColorStop(0, '#1b2447');
    g.addColorStop(0.5, '#141b38');
    g.addColorStop(0.85, '#0f142b');
    g.addColorStop(1, '#0a0e1f');
    ctx.beginPath(); ctx.arc(0, 0, R, 0, TAU); ctx.fillStyle = g; ctx.fill();

    // losas concéntricas
    ctx.lineWidth = 1;
    for (let r = 90; r < R; r += 68) {
      ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU);
      ctx.strokeStyle = 'rgba(140,170,240,.055)';
      ctx.stroke();
    }
    // radios
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * TAU + 0.1;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * 90, Math.sin(a) * 90);
      ctx.lineTo(Math.cos(a) * R, Math.sin(a) * R);
      ctx.strokeStyle = 'rgba(140,170,240,.04)';
      ctx.stroke();
    }

    // anillo exterior
    ctx.beginPath(); ctx.arc(0, 0, R - 1, 0, TAU);
    ctx.strokeStyle = 'rgba(230,201,131,.34)'; ctx.lineWidth = 2; ctx.stroke();
    ctx.beginPath(); ctx.arc(0, 0, R - 13, 0, TAU);
    ctx.strokeStyle = 'rgba(230,201,131,.1)'; ctx.lineWidth = 1; ctx.stroke();

    // círculo de runas giratorio
    ctx.save();
    ctx.rotate(G.t * 0.035);
    for (let i = 0; i < 48; i++) {
      const a = (i / 48) * TAU;
      const inner = R - 62, outer = R - (i % 4 === 0 ? 88 : 74);
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * inner, Math.sin(a) * inner);
      ctx.lineTo(Math.cos(a) * outer, Math.sin(a) * outer);
      ctx.strokeStyle = i % 4 === 0 ? 'rgba(230,201,131,.3)' : 'rgba(230,201,131,.1)';
      ctx.lineWidth = i % 4 === 0 ? 2 : 1;
      ctx.stroke();
    }
    ctx.restore();

    // círculo central
    ctx.beginPath(); ctx.arc(0, 0, 86, 0, TAU);
    ctx.strokeStyle = 'rgba(230,201,131,.13)'; ctx.stroke();
    ctx.beginPath(); ctx.arc(0, 0, 70 + Math.sin(G.t * 1.2) * 3, 0, TAU);
    ctx.strokeStyle = 'rgba(95,227,192,.09)'; ctx.stroke();

    // pilares
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * TAU + 0.39;
      const x = Math.cos(a) * (R - 24), y = Math.sin(a) * (R - 24);
      const pg = ctx.createRadialGradient(x, y, 0, x, y, 40);
      pg.addColorStop(0, 'rgba(230,201,131,.5)');
      pg.addColorStop(0.4, 'rgba(230,201,131,.14)');
      pg.addColorStop(1, 'rgba(230,201,131,0)');
      ctx.fillStyle = pg;
      ctx.beginPath(); ctx.arc(x, y, 40, 0, TAU); ctx.fill();
      ctx.fillStyle = 'rgba(240,225,190,.65)';
      ctx.beginPath(); ctx.arc(x, y, 2.6, 0, TAU); ctx.fill();
    }

    // escombros flotantes
    for (let i = 0; i < 7; i++) {
      const a = G.t * 0.08 + i * 0.9;
      const rr = R + 46 + Math.sin(G.t * 0.5 + i) * 16;
      const x = Math.cos(a) * rr, y = Math.sin(a) * rr;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(a * 1.6);
      ctx.fillStyle = 'rgba(120,140,200,.2)';
      ctx.beginPath();
      ctx.moveTo(-7, -4); ctx.lineTo(6, -6); ctx.lineTo(3, 5); ctx.lineTo(-5, 3);
      ctx.closePath(); ctx.fill();
      ctx.restore();
    }

    ctx.restore();
  }

  function drawPlayer() {
    const p = player;

    for (const t of p.trail) {
      ctx.globalAlpha = t.a * 0.4;
      ctx.fillStyle = '#9fd8ff';
      ctx.beginPath(); ctx.arc(t.x, t.y, p.r * 0.8, 0, TAU); ctx.fill();
    }
    ctx.globalAlpha = 1;

    ctx.save();
    ctx.translate(p.x, p.y);

    // sombra
    ctx.fillStyle = 'rgba(0,0,0,.35)';
    ctx.beginPath(); ctx.ellipse(0, p.r * 0.75, p.r * 0.95, p.r * 0.45, 0, 0, TAU); ctx.fill();

    // capa
    const back = p.facing + Math.PI;
    ctx.save();
    ctx.rotate(back);
    ctx.fillStyle = 'rgba(38,55,110,.9)';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(p.r * 1.7, -p.r * 0.8, p.r * 2.1 + Math.sin(G.t * 8) * 2, 0);
    ctx.quadraticCurveTo(p.r * 1.7, p.r * 0.8, 0, 0);
    ctx.fill();
    ctx.restore();

    // resplandor
    const halo = ctx.createRadialGradient(0, 0, p.r * 0.4, 0, 0, p.r * 2.8);
    halo.addColorStop(0, 'rgba(240,220,170,.20)');
    halo.addColorStop(1, 'rgba(240,220,170,0)');
    ctx.fillStyle = halo;
    ctx.beginPath(); ctx.arc(0, 0, p.r * 2.8, 0, TAU); ctx.fill();

    // cuerpo
    const bodyG = ctx.createRadialGradient(-p.r * 0.35, -p.r * 0.4, 1, 0, 0, p.r * 1.4);
    bodyG.addColorStop(0, '#f7efdb');
    bodyG.addColorStop(0.5, '#d9c9a6');
    bodyG.addColorStop(1, '#8d7a58');
    ctx.fillStyle = bodyG;
    ctx.beginPath(); ctx.arc(0, 0, p.r, 0, TAU); ctx.fill();

    // marca de jade
    ctx.fillStyle = 'rgba(95,227,192,.9)';
    ctx.beginPath(); ctx.arc(0, -p.r * 0.15, p.r * 0.28, 0, TAU); ctx.fill();

    // espada
    ctx.rotate(p.facing);
    ctx.strokeStyle = '#dfe9ff';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(p.r * 0.4, 0);
    ctx.lineTo(p.r * 2.5, 0);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(120,200,255,.5)';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(p.r * 0.6, -1.6);
    ctx.lineTo(p.r * 2.4, -1.6);
    ctx.stroke();

    ctx.restore();

    // arco del corte
    if (p.atkAnim > 0) {
      const a0 = p.facing - 1.25;
      const t = 1 - p.atkAnim;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(a0 + t * 1.5);
      ctx.globalCompositeOperation = 'lighter';
      ctx.lineCap = 'round';
      ctx.strokeStyle = `rgba(255,208,130,${0.22 * p.atkAnim})`;
      ctx.lineWidth = 26 * p.atkAnim + 6;
      ctx.beginPath(); ctx.arc(0, 0, 64, -0.8, 0.8); ctx.stroke();
      ctx.strokeStyle = `rgba(255,252,240,${0.95 * p.atkAnim})`;
      ctx.lineWidth = 5 * p.atkAnim + 1.6;
      ctx.beginPath(); ctx.arc(0, 0, 64, -0.8, 0.8); ctx.stroke();
      ctx.strokeStyle = `rgba(170,225,255,${0.5 * p.atkAnim})`;
      ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(0, 0, 74, -0.62, 0.62); ctx.stroke();
      ctx.globalCompositeOperation = 'source-over';
      ctx.restore();
    }

    // escudo de invulnerabilidad
    if (p.inv > 0) {
      ctx.strokeStyle = `rgba(159,216,255,${0.18 + p.inv * 0.3})`;
      ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r + 8 + Math.sin(G.t * 20) * 2, 0, TAU); ctx.stroke();
    }

    if (p.flash > 0) {
      ctx.fillStyle = `rgba(255,90,120,${p.flash * 0.35})`;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r * 1.6, 0, TAU); ctx.fill();
    }
  }

  function drawEnemies() {
    for (const e of enemies) {
      if (!e.alive) continue;
      const a = e.spawnT > 0 ? 1 - e.spawnT / 0.75 : 1;
      ctx.globalAlpha = clamp(a, 0, 1);
      ctx.save();
      ctx.translate(e.x, e.y);

      // sombra
      ctx.fillStyle = 'rgba(0,0,0,.32)';
      ctx.beginPath(); ctx.ellipse(0, e.r * 0.7, e.r * 0.9, e.r * 0.4, 0, 0, TAU); ctx.fill();

      // aura de color
      const eg = ctx.createRadialGradient(0, 0, e.r * 0.3, 0, 0, e.r * 2.3);
      eg.addColorStop(0, e.color + '44');
      eg.addColorStop(1, e.color + '00');
      ctx.fillStyle = eg;
      ctx.beginPath(); ctx.arc(0, 0, e.r * 2.3, 0, TAU); ctx.fill();

      if (e.type === 'sombra') {
        const pts = 7;
        ctx.beginPath();
        for (let i = 0; i <= pts; i++) {
          const ang = (i / pts) * TAU + G.t * 0.8;
          const rr = e.r * (1 + Math.sin(ang * 3 + e.seed) * 0.12);
          const x = Math.cos(ang) * rr, y = Math.sin(ang) * rr * 0.92;
          i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
        }
        ctx.closePath();
        const gg = ctx.createRadialGradient(0, 0, 2, 0, 0, e.r * 1.3);
        gg.addColorStop(0, '#c9b6ff');
        gg.addColorStop(0.45, '#8b6bff');
        gg.addColorStop(1, 'rgba(80,50,180,.15)');
        ctx.fillStyle = gg; ctx.fill();
        ctx.strokeStyle = 'rgba(200,180,255,.55)'; ctx.lineWidth = 1; ctx.stroke();
        ctx.fillStyle = '#0b0f22';
        ctx.beginPath(); ctx.arc(-4, -2, 2.2, 0, TAU); ctx.arc(5, -2, 2.2, 0, TAU); ctx.fill();
      } else if (e.type === 'guardian') {
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          const ang = (i / 6) * TAU + Math.PI / 6;
          const x = Math.cos(ang) * e.r, y = Math.sin(ang) * e.r;
          i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
        }
        ctx.closePath();
        ctx.fillStyle = '#123c40'; ctx.fill();
        ctx.strokeStyle = 'rgba(95,227,192,.75)'; ctx.lineWidth = 1.6; ctx.stroke();
        const pulse = 0.6 + Math.sin(G.t * 3 + e.seed) * 0.4;
        ctx.fillStyle = `rgba(95,227,192,${0.5 + pulse * 0.4})`;
        ctx.beginPath(); ctx.arc(0, 0, e.r * 0.28 + pulse, 0, TAU); ctx.fill();
        ctx.strokeStyle = 'rgba(95,227,192,.3)';
        ctx.beginPath(); ctx.arc(0, 0, e.r * 0.62, 0, TAU); ctx.stroke();
      } else {
        const wob = Math.sin(G.t * 6 + e.seed) * 2;
        ctx.beginPath();
        ctx.ellipse(0, wob * 0.4, e.r * 1.15, e.r * 0.85, 0, 0, TAU);
        const gg = ctx.createRadialGradient(0, 0, 1, 0, 0, e.r * 1.4);
        gg.addColorStop(0, '#ffd6e2');
        gg.addColorStop(0.4, '#ff6f9c');
        gg.addColorStop(1, 'rgba(255,80,140,0)');
        ctx.fillStyle = gg; ctx.fill();
        ctx.strokeStyle = 'rgba(255,180,205,.5)'; ctx.lineWidth = 1; ctx.stroke();
        ctx.fillStyle = 'rgba(60,10,30,.8)';
        ctx.beginPath(); ctx.arc(-4, -1, 1.8, 0, TAU); ctx.arc(4, -1, 1.8, 0, TAU); ctx.fill();
      }

      // telegrafía
      if (e.tele > 0 && e.state === 'tele') {
        ctx.strokeStyle = `rgba(255,120,140,${0.35 + 0.4 * Math.sin(G.t * 30)})`;
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(0, 0, e.r + 10 + (1 - e.tele) * 8, 0, TAU); ctx.stroke();
      }

      if (e.flash > 0) {
        ctx.globalAlpha = e.flash * 0.85;
        ctx.fillStyle = '#fff';
        ctx.beginPath(); ctx.arc(0, 0, e.r, 0, TAU); ctx.fill();
        ctx.globalAlpha = 1;
      }

      ctx.restore();

      // vida
      if (e.hp < e.maxHp) {
        const w = e.r * 2;
        ctx.fillStyle = 'rgba(0,0,0,.55)';
        ctx.fillRect(e.x - w / 2, e.y - e.r - 12, w, 3);
        ctx.fillStyle = 'rgba(255,150,170,.9)';
        ctx.fillRect(e.x - w / 2, e.y - e.r - 12, w * (e.hp / e.maxHp), 3);
      }
      ctx.globalAlpha = 1;
    }
  }

  function drawBoss() {
    if (!boss) return;
    const b = boss;
    ctx.save();
    ctx.translate(b.x, b.y);

    // sombra
    ctx.fillStyle = 'rgba(0,0,0,.4)';
    ctx.beginPath(); ctx.ellipse(0, b.r * 0.85, b.r * 1.1, b.r * 0.45, 0, 0, TAU); ctx.fill();

    if (b.state === 'dying') {
      const t = b.dying / 1.7;
      ctx.globalAlpha = Math.max(0, 1 - t);
      ctx.strokeStyle = '#ffd18a';
      ctx.lineWidth = 3;
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.arc(0, 0, b.r + i * 34 + t * 90, 0, TAU);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }

    // aura
    const aura = ctx.createRadialGradient(0, 0, b.r * 0.4, 0, 0, b.r * 2.4);
    aura.addColorStop(0, 'rgba(255,160,110,.22)');
    aura.addColorStop(1, 'rgba(255,120,80,0)');
    ctx.fillStyle = aura;
    ctx.beginPath(); ctx.arc(0, 0, b.r * 2.4, 0, TAU); ctx.fill();

    // anillos giratorios
    ctx.save();
    ctx.rotate(b.angle);
    for (let i = 0; i < 6; i++) {
      const ang = (i / 6) * TAU;
      const x = Math.cos(ang) * (b.r + 16), y = Math.sin(ang) * (b.r + 16);
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(ang + Math.PI / 2);
      ctx.fillStyle = 'rgba(240,215,160,.8)';
      ctx.beginPath();
      ctx.moveTo(0, -9); ctx.lineTo(5, 0); ctx.lineTo(0, 9); ctx.lineTo(-5, 0);
      ctx.closePath(); ctx.fill();
      ctx.restore();
    }
    ctx.restore();

    // núcleo
    const core = ctx.createRadialGradient(-b.r * 0.3, -b.r * 0.35, 3, 0, 0, b.r);
    core.addColorStop(0, '#fff6dd');
    core.addColorStop(0.35, '#f0c580');
    core.addColorStop(0.8, '#8a4a3a');
    core.addColorStop(1, '#2a1420');
    ctx.fillStyle = core;
    ctx.beginPath(); ctx.arc(0, 0, b.r, 0, TAU); ctx.fill();
    ctx.strokeStyle = 'rgba(255,225,170,.65)'; ctx.lineWidth = 1.6; ctx.stroke();

    // ojo
    const eyeOpen = b.state === 'chargeTele' || b.state === 'slam' ? 1 : 0.55;
    ctx.save();
    ctx.rotate(b.angle * -0.5);
    ctx.fillStyle = 'rgba(20,6,14,.85)';
    ctx.beginPath(); ctx.ellipse(0, 0, b.r * 0.5, b.r * 0.26 * (0.6 + eyeOpen * 0.6), 0, 0, TAU); ctx.fill();
    ctx.fillStyle = '#ff6a6a';
    ctx.beginPath(); ctx.arc(0, 0, b.r * 0.16, 0, TAU); ctx.fill();
    ctx.restore();

    if (b.tele > 0) {
      const t = clamp(1 - b.tele, 0, 1);
      ctx.strokeStyle = `rgba(255,120,90,${0.25 + t * 0.55})`;
      ctx.lineWidth = 2 + t * 3;
      ctx.beginPath(); ctx.arc(0, 0, Math.max(4, b.r + 22 + t * 30), 0, TAU); ctx.stroke();
    }

    if (b.flash > 0) {
      ctx.globalAlpha = b.flash * 0.5;
      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.arc(0, 0, b.r, 0, TAU); ctx.fill();
      ctx.globalAlpha = 1;
    }

    ctx.restore();
  }

  function drawProjectiles() {
    for (const o of orbs) {
      const g = ctx.createRadialGradient(o.x, o.y, 0, o.x, o.y, o.r * 2.6);
      g.addColorStop(0, '#ffffff');
      g.addColorStop(0.3, o.color);
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(o.x, o.y, o.r * 2.6, 0, TAU); ctx.fill();
    }
    for (const s of waves_) {
      ctx.strokeStyle = `rgba(255,150,110,${clamp(1 - s.r / s.maxR, 0, 1) * 0.8})`;
      ctx.lineWidth = 7;
      ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, TAU); ctx.stroke();
      ctx.strokeStyle = 'rgba(255,230,190,.35)';
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(s.x, s.y, Math.max(2, s.r - 5), 0, TAU); ctx.stroke();
    }
  }

  function drawFX() {
    for (const p of particles) {
      const a = clamp(p.life / p.max, 0, 1);
      ctx.globalAlpha = a;
      ctx.fillStyle = p.color;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.size * a, 0, TAU); ctx.fill();
    }
    ctx.globalAlpha = 1;

    ctx.textAlign = 'center';
    for (const f of floaters) {
      const a = clamp(f.life / f.max, 0, 1);
      ctx.globalAlpha = a;
      ctx.font = `600 ${f.size}px system-ui, sans-serif`;
      ctx.fillStyle = f.color;
      ctx.shadowColor = 'rgba(0,0,0,.8)';
      ctx.shadowBlur = 6;
      ctx.fillText(f.text, f.x, f.y);
      ctx.shadowBlur = 0;
    }
    ctx.globalAlpha = 1;
    ctx.textAlign = 'left';
  }

  function drawVignette() {
    const g = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.32, W / 2, H / 2, Math.max(W, H) * 0.78);
    g.addColorStop(0, 'rgba(0,0,0,0)');
    g.addColorStop(1, 'rgba(0,0,0,.62)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);

    if (player.hp / player.maxHp < 0.3 && G.mode === 'play') {
      const a = 0.1 + 0.06 * Math.sin(G.t * 4);
      const r = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.3, W / 2, H / 2, Math.max(W, H) * 0.72);
      r.addColorStop(0, 'rgba(0,0,0,0)');
      r.addColorStop(1, `rgba(180,20,50,${a})`);
      ctx.fillStyle = r;
      ctx.fillRect(0, 0, W, H);
    }
  }

  function render() {
    drawBackground();

    const sx = (Math.random() - 0.5) * camera.shake;
    const sy = (Math.random() - 0.5) * camera.shake;
    ctx.save();
    ctx.translate(W / 2 - camera.x + sx, H / 2 - camera.y + sy);

    drawClouds();
    drawArena();
    drawProjectiles();

    drawEnemies();
    if (boss) drawBoss();
    drawPlayer();
    drawFX();

    ctx.restore();
    drawVignette();
  }

  /* ================= bucle ================= */
  let last = performance.now();
  function frame(ts) {
    const dt = clamp((ts - last) / 1000, 0, 1 / 30);
    last = ts;
    try {
      update(dt);
      render();
    } catch (err) {
      // Un frame defectuoso no debe congelar la partida.
      console.error('frame error', err);
    }
    requestAnimationFrame(frame);
  }

  if (DEBUG) {
    window.LECEL = {
      player, run, enemyList: () => enemies, bossRef: () => boss,
      mode: () => G.mode, wave: () => run.wave
    };
  }

  // estado inicial
  (function init() {
    const s = load();
    $('#btnContinue').disabled = !s;
    if (touchMode) $('#touch').classList.add('on');
    updateHUD();
    requestAnimationFrame(frame);
  })();
})();
