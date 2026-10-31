(() => {
  'use strict';

  const TAU = Math.PI * 2;
  const STEP = 1 / 120;
  const MAX_BALLS = 14;
  const BEST_KEY = 'splitbreak.best';
  const MUTE_KEY = 'splitbreak.muted';

  const COLORS = [
    { hex: '#64f5ff', rgb: '100, 245, 255', dark: '#08667f' },
    { hex: '#a58bff', rgb: '165, 139, 255', dark: '#392b85' },
    { hex: '#ff58b8', rgb: '255, 88, 184', dark: '#7d1a58' },
    { hex: '#ffc866', rgb: '255, 200, 102', dark: '#815413' },
    { hex: '#baff72', rgb: '186, 255, 114', dark: '#487515' },
    { hex: '#66a9ff', rgb: '102, 169, 255', dark: '#174b88' },
  ];

  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const random = (min, max) => min + Math.random() * (max - min);
  const rgba = (rgb, alpha) => `rgba(${rgb}, ${alpha})`;

  function roundRectPath(context, x, y, width, height, radius) {
    const r = Math.min(radius, width / 2, height / 2);
    context.beginPath();
    context.moveTo(x + r, y);
    context.arcTo(x + width, y, x + width, y + height, r);
    context.arcTo(x + width, y + height, x, y + height, r);
    context.arcTo(x, y + height, x, y, r);
    context.arcTo(x, y, x + width, y, r);
    context.closePath();
  }

  function detectSoftwareRenderer() {
    try {
      const probe = document.createElement('canvas');
      const gl = probe.getContext('webgl') || probe.getContext('experimental-webgl');
      if (!gl) return false;
      const info = gl.getExtension('WEBGL_debug_renderer_info');
      const renderer = String(info ? gl.getParameter(info.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER));
      return /swiftshader|llvmpipe|software|basic render/i.test(renderer);
    } catch {
      return false;
    }
  }

  const softwareRenderer = detectSoftwareRenderer();
  const RENDER_SCALE = softwareRenderer ? 0.62 : 1;

  const canvas = document.querySelector('#game');
  const ctx = canvas.getContext('2d', { alpha: false });
  const dom = {
    topbar: document.querySelector('.topbar'),
    bottombar: document.querySelector('.bottombar'),
    score: document.querySelector('#score'),
    level: document.querySelector('#level'),
    balls: document.querySelector('#balls'),
    cores: document.querySelector('#cores'),
    swarmFill: document.querySelector('#swarm-fill'),
    swarmDot: document.querySelector('.swarm-dot'),
    combo: document.querySelector('#combo'),
    comboValue: document.querySelector('#combo strong'),
    announcer: document.querySelector('#announcer'),
    toast: document.querySelector('#toast'),
    intro: document.querySelector('#intro'),
    pause: document.querySelector('#pause'),
    gameover: document.querySelector('#gameover'),
    bestIntro: document.querySelector('#best-intro'),
    bestScore: document.querySelector('#best-score'),
    finalScore: document.querySelector('#final-score'),
    finalLevel: document.querySelector('#final-level'),
    resultNote: document.querySelector('#result-note'),
    levelBanner: document.querySelector('#level-banner'),
    soundBtn: document.querySelector('#sound-btn'),
    pauseBtn: document.querySelector('#pause-btn'),
    brand: document.querySelector('#brand'),
    playBtn: document.querySelector('#play-btn'),
    resumeBtn: document.querySelector('#resume-btn'),
    restartBtn: document.querySelector('#restart-btn'),
    againBtn: document.querySelector('#again-btn'),
    menuBtn: document.querySelector('#menu-btn'),
    damage: document.querySelector('#damage-flash'),
  };

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const state = {
    mode: 'menu',
    time: 0,
    last: performance.now(),
    accumulator: 0,
    score: 0,
    best: readNumber(BEST_KEY, 0),
    level: 1,
    lives: 3,
    combo: 0,
    comboTimer: 0,
    balls: [],
    bricks: [],
    remaining: 0,
    particles: [],
    rings: [],
    texts: [],
    stars: [],
    wall: { left: 0, right: 0, top: 0, bottom: 0 },
    paddle: { x: 0, y: 0, w: 150, h: 13, targetX: 0, lastX: 0, flash: 0, speed: 0 },
    pointerX: 0,
    pointerSeen: false,
    keys: { left: false, right: false },
    grid: { cols: 11, rows: 5 },
    brickPaths: null,
    brickPathsDirty: true,
    levelPending: false,
    levelTimer: 0,
    serveTimer: 0,
    shake: 0,
    damage: 0,
    lastWallSound: 0,
    lastCapToast: 0,
    sideGradient: null,
    width: 0,
    height: 0,
    dpr: 1,
    hudBalls: -1,
  };

  function readNumber(key, fallback) {
    try {
      const value = Number(localStorage.getItem(key));
      return Number.isFinite(value) ? value : fallback;
    } catch {
      return fallback;
    }
  }

  function storeNumber(key, value) {
    try { localStorage.setItem(key, String(value)); } catch { /* storage can be unavailable */ }
  }

  let muted = false;
  try { muted = localStorage.getItem(MUTE_KEY) === '1'; } catch { /* ignore */ }

  let audio = null;
  let announceHandle = 0;
  let toastHandle = 0;

  function initAudio() {
    if (audio) {
      if (audio.ctx.state === 'suspended') audio.ctx.resume().catch(() => {});
      return;
    }
    const AudioEngine = window.AudioContext || window.webkitAudioContext;
    if (!AudioEngine) return;
    const engine = new AudioEngine();
    const master = engine.createGain();
    const compressor = engine.createDynamicsCompressor();
    master.gain.value = muted ? 0 : 0.52;
    compressor.threshold.value = -20;
    compressor.knee.value = 16;
    compressor.ratio.value = 7;
    compressor.attack.value = 0.004;
    compressor.release.value = 0.2;
    compressor.connect(master);
    master.connect(engine.destination);
    const buffer = engine.createBuffer(1, Math.floor(engine.sampleRate * 0.45), engine.sampleRate);
    const channel = buffer.getChannelData(0);
    for (let i = 0; i < channel.length; i += 1) channel[i] = Math.random() * 2 - 1;
    audio = { ctx: engine, master, compressor, noiseBuffer: buffer };
  }

  function tone(freq, duration, type = 'sine', volume = 0.05, slide = 0, delay = 0) {
    if (!audio || muted) return;
    const time = audio.ctx.currentTime + delay;
    const osc = audio.ctx.createOscillator();
    const gain = audio.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(Math.max(30, freq), time);
    if (slide) osc.frequency.exponentialRampToValueAtTime(Math.max(30, freq * slide), time + duration);
    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.exponentialRampToValueAtTime(Math.max(0.0002, volume), time + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);
    osc.connect(gain);
    gain.connect(audio.compressor);
    osc.start(time);
    osc.stop(time + duration + 0.03);
  }

  function noiseBurst(duration = 0.06, volume = 0.025, cutoff = 2600, delay = 0) {
    if (!audio || muted) return;
    const time = audio.ctx.currentTime + delay;
    const source = audio.ctx.createBufferSource();
    const filter = audio.ctx.createBiquadFilter();
    const gain = audio.ctx.createGain();
    source.buffer = audio.noiseBuffer;
    filter.type = 'lowpass';
    filter.frequency.value = cutoff;
    gain.gain.setValueAtTime(volume, time);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);
    source.connect(filter);
    filter.connect(gain);
    gain.connect(audio.compressor);
    source.start(time);
    source.stop(time + duration + 0.02);
  }

  const sfx = {
    start() {
      [196, 293.66, 392, 587.33].forEach((freq, i) => tone(freq, 0.5, 'triangle', 0.035, 0, i * 0.055));
      noiseBurst(0.28, 0.018, 4200);
    },
    paddle() {
      tone(132, 0.08, 'sine', 0.075, 0.7);
      tone(264, 0.045, 'triangle', 0.025, 1.4);
    },
    wall() {
      const now = performance.now();
      if (now - state.lastWallSound < 35) return;
      state.lastWallSound = now;
      tone(88, 0.035, 'sine', 0.018, 0.8);
    },
    brick(armored = false) {
      tone(armored ? 285 : 430 + random(-25, 35), 0.07, 'triangle', armored ? 0.045 : 0.03, 1.35);
      noiseBurst(0.035, armored ? 0.022 : 0.013, 3200);
    },
    destroy() {
      tone(690, 0.11, 'triangle', 0.035, 1.55);
      tone(1040, 0.08, 'sine', 0.025, 0.72, 0.018);
      noiseBurst(0.09, 0.018, 4800);
    },
    split() {
      tone(780, 0.08, 'sine', 0.02, 1.45);
      tone(1170, 0.06, 'triangle', 0.012, 0.8, 0.024);
    },
    launch() {
      tone(230, 0.18, 'sine', 0.045, 2.1);
      noiseBurst(0.08, 0.012, 1600);
    },
    lose() {
      tone(210, 0.3, 'sawtooth', 0.035, 0.34);
      tone(104, 0.42, 'sine', 0.055, 0.55, 0.03);
      noiseBurst(0.24, 0.022, 900);
    },
    level() {
      [392, 523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => tone(freq, 0.32, 'triangle', 0.035, 0, i * 0.07));
    },
    gameover() {
      [293.66, 246.94, 196, 146.83].forEach((freq, i) => tone(freq, 0.55, 'sine', 0.04, 0.96, i * 0.13));
    },
    cap() {
      tone(146, 0.08, 'square', 0.012, 1.1);
    },
  };

  function applyMute() {
    if (audio) audio.master.gain.setTargetAtTime(muted ? 0 : 0.52, audio.ctx.currentTime, 0.02);
    dom.soundBtn.classList.toggle('muted', muted);
    dom.soundBtn.setAttribute('aria-label', muted ? 'Unmute sound' : 'Mute sound');
    dom.soundBtn.setAttribute('title', muted ? 'Unmute sound' : 'Mute sound');
  }

  function toggleMute() {
    muted = !muted;
    storeNumber(MUTE_KEY, muted ? 1 : 0);
    initAudio();
    applyMute();
    if (!muted) tone(660, 0.08, 'sine', 0.03, 1.25);
  }
  function resizeGame() {
    const rect = canvas.getBoundingClientRect();
    const width = Math.max(1, Math.round(rect.width));
    const height = Math.max(1, Math.round(rect.height));
    const dpr = Math.min(1.5, Math.max(1, window.devicePixelRatio || 1)) * RENDER_SCALE;
    state.width = width;
    state.height = height;
    state.dpr = dpr;

    if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) {
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const topbarBottom = dom.topbar.getBoundingClientRect().bottom;
    const bottombarTop = dom.bottombar.getBoundingClientRect().top;
    const side = clamp(width * 0.035, 12, 46);
    state.wall.left = side;
    state.wall.right = width - side;
    state.wall.top = Math.max(topbarBottom + Math.max(14, height * 0.02), height * 0.125);
    state.wall.bottom = Math.min(bottombarTop - 8, height - 28);

    const paddle = state.paddle;
    paddle.w = clamp(width * (width < 640 ? 0.235 : 0.12), 84, 162);
    paddle.h = clamp(height * 0.014, 9, 13);
    paddle.y = state.wall.bottom - clamp(height * 0.03, 23, 36);
    if (!paddle.x) paddle.x = width / 2;
    if (!paddle.targetX) paddle.targetX = width / 2;
    paddle.x = clamp(paddle.x, state.wall.left + paddle.w / 2, state.wall.right - paddle.w / 2);
    paddle.targetX = clamp(paddle.targetX, state.wall.left + paddle.w / 2, state.wall.right - paddle.w / 2);
    paddle.lastX = paddle.x;

    state.sideGradient = ctx.createLinearGradient(0, state.wall.top - 20, 0, state.wall.bottom + 20);
    state.sideGradient.addColorStop(0, 'rgba(100, 245, 255, 0)');
    state.sideGradient.addColorStop(0.16, 'rgba(100, 245, 255, 0.36)');
    state.sideGradient.addColorStop(0.7, 'rgba(100, 245, 255, 0.16)');
    state.sideGradient.addColorStop(1, 'rgba(255, 72, 174, 0.02)');

    buildStars();
    if (state.bricks.length) positionBricks();
    for (const ball of state.balls) {
      ball.x = clamp(ball.x, state.wall.left + ball.r, state.wall.right - ball.r);
      if (!ball.stuck) ball.y = clamp(ball.y, state.wall.top + ball.r, height + 20);
    }
  }

  function buildStars() {
    const count = clamp(Math.round((state.width * state.height) / 13500), 45, 135);
    state.stars = Array.from({ length: count }, () => ({
      x: Math.random() * state.width,
      y: Math.random() * state.height,
      size: random(0.35, 1.45),
      alpha: random(0.12, 0.58),
      phase: Math.random() * TAU,
      speed: random(0.16, 0.55),
      drift: random(1.4, 7),
    }));
  }

  function chooseGrid() {
    const cols = state.width < 430 ? 7 : state.width < 680 ? 8 : state.width < 1040 ? 9 : 11;
    const rows = clamp(4 + state.level, 5, 8);
    return { cols, rows };
  }

  function keepBrick(col, row, cols, rows, level) {
    if (level % 2 === 0 && row === 0 && (col === 0 || col === cols - 1)) return false;
    if (level > 2 && row === rows - 1 && (col + level) % 5 === 0) return false;
    if (level > 1 && ((col * 5 + row * 11 + level * 7) % 29) === 0) return false;
    return true;
  }

  function buildBricks() {
    const grid = chooseGrid();
    state.grid = grid;
    state.bricks = [];
    state.remaining = 0;
    for (let row = 0; row < grid.rows; row += 1) {
      for (let col = 0; col < grid.cols; col += 1) {
        if (!keepBrick(col, row, grid.cols, grid.rows, state.level)) continue;
        const armored = state.level > 1 && ((col * 7 + row * 13 + state.level * 3) % 21 === 0);
        const colorIndex = (row + state.level - 1) % COLORS.length;
        state.bricks.push({
          row,
          col,
          x: 0,
          y: 0,
          w: 1,
          h: 1,
          hp: armored ? 2 : 1,
          maxHp: armored ? 2 : 1,
          alive: true,
          flash: 0,
          colorIndex,
          cracks: Array.from({ length: 3 }, () => ({
            x: random(0.2, 0.8),
            y: random(0.25, 0.75),
            dx: random(-0.17, 0.17),
            dy: random(0.2, 0.45),
          })),
        });
        state.remaining += 1;
      }
    }
    state.levelPending = false;
    state.levelTimer = 0;
    positionBricks();
  }

  function positionBricks() {
    const wall = state.wall;
    const { cols, rows } = state.grid;
    const gap = state.width < 640 ? 5 : 8;
    const sidePad = clamp(state.width * 0.018, 8, 28);
    const usable = wall.right - wall.left - sidePad * 2;
    const brickW = Math.max(18, (usable - gap * (cols - 1)) / cols);
    const top = wall.top + clamp(state.height * 0.045, 18, 42);
    let brickH = clamp(brickW * 0.43, 16, 30);
    const maxH = (state.paddle.y - top - clamp(state.height * 0.15, 90, 150) - gap * (rows - 1)) / rows;
    brickH = Math.max(13, Math.min(brickH, maxH));

    for (const brick of state.bricks) {
      brick.w = brickW;
      brick.h = brickH;
      brick.x = wall.left + sidePad + brick.col * (brickW + gap);
      brick.y = top + brick.row * (brickH + gap);
    }
    state.brickPathsDirty = true;
  }

  const ballSprites = COLORS.map((color) => {
    const sprite = document.createElement('canvas');
    sprite.width = 128;
    sprite.height = 128;
    const context = sprite.getContext('2d');
    const glow = context.createRadialGradient(64, 64, 0, 64, 64, 64);
    glow.addColorStop(0, 'rgba(255,255,255,1)');
    glow.addColorStop(0.095, 'rgba(255,255,255,1)');
    glow.addColorStop(0.16, rgba(color.rgb, 0.98));
    glow.addColorStop(0.28, rgba(color.rgb, 0.52));
    glow.addColorStop(0.54, rgba(color.rgb, 0.13));
    glow.addColorStop(0.82, rgba(color.rgb, 0.025));
    glow.addColorStop(1, rgba(color.rgb, 0));
    context.fillStyle = glow;
    context.fillRect(0, 0, 128, 128);
    return sprite;
  });

  function ballRadius() {
    return clamp(state.width * 0.009, 5.4, 8.5);
  }

  function spawnBurst(x, y, colorIndex, count = 10, strength = 1) {
    const color = COLORS[colorIndex % COLORS.length];
    const total = reduceMotion ? Math.ceil(count * 0.55) : count;
    for (let i = 0; i < total; i += 1) {
      const angle = Math.random() * TAU;
      const speed = random(45, 235) * strength;
      const shard = Math.random() < 0.24;
      state.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - random(0, 35),
        life: random(0.28, 0.85),
        age: 0,
        size: shard ? random(1.4, 3) : random(1, 3.2),
        rgb: color.rgb,
        hex: color.hex,
        shard,
        angle: Math.random() * TAU,
        spin: random(-9, 9),
        drag: random(1.2, 2.8),
        gravity: random(40, 170),
      });
    }
    if (state.particles.length > 480) state.particles.splice(0, state.particles.length - 480);
  }

  function spawnRing(x, y, colorIndex, radius = 8, maxRadius = 70, life = 0.45) {
    const color = COLORS[colorIndex % COLORS.length];
    state.rings.push({ x, y, radius, maxRadius, life, age: 0, rgb: color.rgb });
    if (state.rings.length > 28) state.rings.shift();
  }

  function spawnText(x, y, text, colorIndex = 0, size = 11) {
    const color = COLORS[colorIndex % COLORS.length];
    state.texts.push({ x, y, text, age: 0, life: 0.85, rgb: color.rgb, size });
    if (state.texts.length > 24) state.texts.shift();
  }

  function serveBall(delay = 0.8) {
    const paddle = state.paddle;
    const radius = ballRadius();
    state.balls = [{
      x: paddle.x,
      y: paddle.y - radius - 2,
      vx: 0,
      vy: 0,
      r: radius,
      stuck: true,
      color: 0,
      trail: [],
    }];
    state.serveTimer = delay;
    state.combo = 0;
    state.comboTimer = 0;
    refreshCombo();
    updateHUD();
  }

  function launchBalls() {
    if (state.mode !== 'playing') return;
    const stuck = state.balls.filter((ball) => ball.stuck);
    if (!stuck.length) return;
    const steer = clamp(state.paddle.speed / 1300, -0.34, 0.34);
    const speed = 458 + (state.level - 1) * 25;
    for (const ball of stuck) {
      const angle = -Math.PI / 2 + steer + random(-0.11, 0.11);
      ball.stuck = false;
      ball.vx = Math.cos(angle) * speed;
      ball.vy = Math.sin(angle) * speed;
      ball.trail.length = 0;
    }
    state.serveTimer = 0;
    sfx.launch();
    spawnRing(state.paddle.x, state.paddle.y - 8, 0, 6, 54, 0.35);
  }

  function splitBall(ball, normalX, normalY) {
    if (state.mode !== 'playing') return;
    if (state.balls.length >= MAX_BALLS) {
      const now = performance.now();
      if (now - state.lastCapToast > 2200) {
        state.lastCapToast = now;
        showToast('SWARM AT MAX // IMPACTS STILL CHAIN');
        sfx.cap();
      }
      return;
    }

    const speed = Math.max(330, Math.hypot(ball.vx, ball.vy));
    const sourceAngle = Math.atan2(ball.vy, ball.vx);
    const sign = Math.random() < 0.5 ? -1 : 1;
    let angle = sourceAngle + sign * random(0.28, 0.52);
    let vx = Math.cos(angle) * speed;
    let vy = Math.sin(angle) * speed;

    if (normalX || normalY) {
      if (vx * normalX + vy * normalY < speed * 0.12) {
        const normalAngle = Math.atan2(normalY, normalX);
        angle = normalAngle + sign * random(0.34, 0.58);
        vx = Math.cos(angle) * speed;
        vy = Math.sin(angle) * speed;
      }
    }

    const newRadius = Math.max(4.15, ball.r * 0.935);
    ball.r = newRadius;
    const newBall = {
      x: clamp(ball.x + normalX * (newRadius + 2.5), state.wall.left + newRadius, state.wall.right - newRadius),
      y: clamp(ball.y + normalY * (newRadius + 2.5), state.wall.top + newRadius, state.height),
      vx,
      vy,
      r: newRadius,
      stuck: false,
      color: (ball.color + 1 + Math.floor(Math.random() * (COLORS.length - 1))) % COLORS.length,
      trail: [],
    };
    state.balls.push(newBall);
    spawnBurst(ball.x, ball.y, newBall.color, 7, 0.72);
    spawnRing(ball.x, ball.y, newBall.color, newRadius * 0.7, newRadius * 7.5, 0.4);
    state.shake = Math.max(state.shake, reduceMotion ? 0 : 2.3);
    sfx.split();
  }
  function comboMultiplier() {
    return Math.min(9, 1 + Math.floor(state.combo / 4));
  }

  function update(dt) {
    if (state.mode !== 'paused') {
      state.time += dt;
      if (state.mode === 'playing') {
        state.accumulator = Math.min(state.accumulator + dt, STEP * 12);
        let steps = 0;
        while (state.accumulator >= STEP && steps < 12) {
          physics(STEP);
          state.accumulator -= STEP;
          steps += 1;
          if (state.mode !== 'playing') break;
        }
        if (steps === 12) state.accumulator = 0;
      }
      updateEffects(dt);
    }
  }

  function physics(dt) {
    updatePaddle(dt);

    if (state.serveTimer > 0) {
      state.serveTimer -= dt;
      if (state.serveTimer <= 0) launchBalls();
    }

    if (!state.levelPending) updateBalls(dt);

    if (state.levelPending) {
      state.levelTimer -= dt;
      if (state.levelTimer <= 0) nextLevel();
    } else if (state.remaining <= 0 && state.mode === 'playing') {
      startLevelClear();
    }

    if (state.comboTimer > 0) {
      state.comboTimer -= dt;
      if (state.comboTimer <= 0) {
        state.combo = 0;
        refreshCombo();
      }
    }
  }

  function updatePaddle(dt) {
    const paddle = state.paddle;
    const direction = (state.keys.right ? 1 : 0) - (state.keys.left ? 1 : 0);
    if (direction) paddle.targetX += direction * 860 * dt;
    paddle.targetX = clamp(paddle.targetX, state.wall.left + paddle.w / 2, state.wall.right - paddle.w / 2);
    const previous = paddle.x;
    paddle.x += (paddle.targetX - paddle.x) * Math.min(1, dt * 20);
    paddle.x = clamp(paddle.x, state.wall.left + paddle.w / 2, state.wall.right - paddle.w / 2);
    paddle.speed = dt > 0 ? (paddle.x - previous) / dt : 0;
    paddle.lastX = paddle.x;
  }

  function updateBalls(dt) {
    const wall = state.wall;
    const paddle = state.paddle;
    let lost = false;

    for (let index = state.balls.length - 1; index >= 0; index -= 1) {
      const ball = state.balls[index];
      if (ball.stuck) {
        ball.x = paddle.x;
        ball.y = paddle.y - ball.r - 2;
        continue;
      }

      ball.x += ball.vx * dt;
      ball.y += ball.vy * dt;

      if (ball.x - ball.r < wall.left) {
        ball.x = wall.left + ball.r;
        ball.vx = Math.abs(ball.vx);
        wallSpark(ball, wall.left, ball.y);
      } else if (ball.x + ball.r > wall.right) {
        ball.x = wall.right - ball.r;
        ball.vx = -Math.abs(ball.vx);
        wallSpark(ball, wall.right, ball.y);
      }

      if (ball.y - ball.r < wall.top) {
        ball.y = wall.top + ball.r;
        ball.vy = Math.abs(ball.vy);
        wallSpark(ball, ball.x, wall.top);
      }

      if (
        ball.vy > 0 &&
        ball.y + ball.r >= paddle.y &&
        ball.y - ball.r <= paddle.y + paddle.h &&
        ball.x >= paddle.x - paddle.w / 2 - ball.r * 0.5 &&
        ball.x <= paddle.x + paddle.w / 2 + ball.r * 0.5
      ) {
        hitPaddle(ball);
      }

      if (collideBricks(ball)) {
        if (state.remaining <= 0) break;
      }

      if (ball.y - ball.r > state.height + 14) {
        state.balls.splice(index, 1);
        lost = true;
        continue;
      }

      ball.trail.push({ x: ball.x, y: ball.y });
      if (ball.trail.length > 10) ball.trail.shift();
    }

    if (lost && state.balls.length === 0) loseLife();
  }

  function wallSpark(ball, x, y) {
    sfx.wall();
    if (Math.random() < 0.2) spawnBurst(x, y, ball.color, 2, 0.32);
  }

  function hitPaddle(ball) {
    const paddle = state.paddle;
    const offset = clamp((ball.x - paddle.x) / (paddle.w / 2), -1, 1);
    const speed = Math.max(458 + (state.level - 1) * 25, Math.hypot(ball.vx, ball.vy));
    const angle = -Math.PI / 2 + offset * 1.08 + random(-0.018, 0.018);
    ball.vx = Math.cos(angle) * speed;
    ball.vy = Math.sin(angle) * speed;
    ball.y = paddle.y - ball.r - 0.7;
    paddle.flash = 1;
    state.shake = Math.max(state.shake, reduceMotion ? 0 : 3.5);
    spawnBurst(ball.x, paddle.y, ball.color, 8, 0.65);
    spawnRing(ball.x, paddle.y, ball.color, 5, 48, 0.3);
    sfx.paddle();
    splitBall(ball, 0, -1);
  }

  function collideBricks(ball) {
    for (const brick of state.bricks) {
      if (!brick.alive) continue;
      const nearestX = clamp(ball.x, brick.x, brick.x + brick.w);
      const nearestY = clamp(ball.y, brick.y, brick.y + brick.h);
      const dx = ball.x - nearestX;
      const dy = ball.y - nearestY;
      const distanceSq = dx * dx + dy * dy;
      if (distanceSq > ball.r * ball.r) continue;

      let nx = 0;
      let ny = 0;
      let overlap = ball.r;

      if (distanceSq > 0.0001) {
        const distance = Math.sqrt(distanceSq);
        nx = dx / distance;
        ny = dy / distance;
        overlap = ball.r - distance;
      } else {
        const centerX = brick.x + brick.w / 2;
        const centerY = brick.y + brick.h / 2;
        const offX = ball.x - centerX;
        const offY = ball.y - centerY;
        if (Math.abs(offX) / brick.w > Math.abs(offY) / brick.h) {
          nx = Math.sign(offX) || (ball.vx > 0 ? -1 : 1);
          overlap = brick.w / 2 - Math.abs(offX) + ball.r;
        } else {
          ny = Math.sign(offY) || (ball.vy > 0 ? -1 : 1);
          overlap = brick.h / 2 - Math.abs(offY) + ball.r;
        }
      }

      ball.x += nx * (overlap + 0.15);
      ball.y += ny * (overlap + 0.15);
      const dot = ball.vx * nx + ball.vy * ny;
      if (dot < 0) {
        ball.vx -= 2 * dot * nx;
        ball.vy -= 2 * dot * ny;
      }

      hitBrick(brick, ball, nx, ny);
      return true;
    }
    return false;
  }

  function hitBrick(brick, ball, nx, ny) {
    brick.hp -= 1;
    brick.flash = 1;
    state.combo += 1;
    state.comboTimer = 2.75;
    const destroyed = brick.hp <= 0;
    state.brickPathsDirty = true;
    const multiplier = comboMultiplier();
    const raw = destroyed ? 130 + brick.maxHp * 35 : 28;
    const points = raw * multiplier * state.level;
    state.score += points;
    const brickCenterX = brick.x + brick.w / 2;
    const brickCenterY = brick.y + brick.h / 2;

    if (destroyed) {
      brick.alive = false;
      state.remaining -= 1;
      spawnBurst(brickCenterX, brickCenterY, brick.colorIndex, 16, 1);
      spawnRing(brickCenterX, brickCenterY, brick.colorIndex, 8, Math.max(brick.w, 64), 0.42);
      spawnText(brickCenterX, brickCenterY - 5, `+${points}`, brick.colorIndex);
      state.shake = Math.max(state.shake, reduceMotion ? 0 : 3.8);
      sfx.destroy();
    } else {
      spawnBurst(brickCenterX, brickCenterY, brick.colorIndex, 6, 0.58);
      spawnText(brickCenterX, brickCenterY - 4, `+${points}`, brick.colorIndex, 9);
      state.shake = Math.max(state.shake, reduceMotion ? 0 : 1.6);
      sfx.brick(true);
    }

    splitBall(ball, nx, ny);
    updateHUD();
    bumpCombo();
  }

  function bumpCombo() {
    dom.comboValue.textContent = `×${comboMultiplier()}`;
    dom.combo.classList.toggle('active', state.combo >= 2);
    dom.combo.classList.remove('bump');
    void dom.combo.offsetWidth;
    dom.combo.classList.add('bump');
    window.setTimeout(() => dom.combo.classList.remove('bump'), 200);
  }

  function refreshCombo() {
    dom.comboValue.textContent = `×${comboMultiplier()}`;
    dom.combo.classList.toggle('active', state.combo >= 2 && state.mode === 'playing');
    if (state.combo < 2) dom.combo.classList.remove('bump');
  }

  function startLevelClear() {
    if (state.levelPending) return;
    state.levelPending = true;
    state.levelTimer = 2.15;
    state.score += 1000 * state.level;
    state.shake = Math.max(state.shake, reduceMotion ? 0 : 6);
    dom.levelBanner.classList.add('show');
    const label = dom.levelBanner.querySelector('span');
    const bonus = dom.levelBanner.querySelector('em');
    if (label) label.textContent = `SECTOR ${String(state.level).padStart(2, '0')} CLEARED`;
    if (bonus) bonus.textContent = `+${(1000 * state.level).toLocaleString('en-US')} BONUS`;
    spawnRing(state.width / 2, state.height * 0.44, 0, 20, Math.max(state.width, state.height) * 0.65, 0.9);
    spawnBurst(state.width / 2, state.height * 0.44, 2, 24, 1.2);
    sfx.level();
    updateHUD();
  }

  function nextLevel() {
    state.level += 1;
    state.levelPending = false;
    state.levelTimer = 0;
    buildBricks();
    const speed = 458 + (state.level - 1) * 25;
    for (const ball of state.balls) {
      const current = Math.hypot(ball.vx, ball.vy);
      if (current > 0) {
        const scale = Math.max(1, speed / current);
        ball.vx *= scale;
        ball.vy *= scale;
      }
    }
    if (state.balls.length === 0) serveBall(0.8);
    dom.levelBanner.classList.remove('show');
    showToast(`SECTOR ${String(state.level).padStart(2, '0')} // WALL REBUILT`);
    updateHUD();
  }

  function loseLife() {
    state.lives -= 1;
    state.combo = 0;
    state.comboTimer = 0;
    state.damage = 1;
    dom.damage.classList.remove('show');
    void dom.damage.offsetWidth;
    dom.damage.classList.add('show');
    window.setTimeout(() => dom.damage.classList.remove('show'), 130);
    state.shake = Math.max(state.shake, reduceMotion ? 0 : 16);
    spawnBurst(state.paddle.x, state.height - 22, 2, 20, 1.4);
    sfx.lose();
    refreshCombo();
    updateHUD();
    if (state.lives <= 0) {
      endGame();
    } else {
      serveBall(1.15);
      announce(`CORE LOST // ${state.lives} REMAINING`, 1550);
    }
  }

  function endGame() {
    state.mode = 'gameover';
    state.levelPending = false;
    state.levelTimer = 0;
    state.combo = 0;
    state.balls = [];
    dom.levelBanner.classList.remove('show');
    dom.combo.classList.remove('active');
    const newBest = state.score > state.best && state.score > 0;
    if (newBest) {
      state.best = state.score;
      storeNumber(BEST_KEY, state.best);
    }
    dom.finalScore.textContent = String(state.score).padStart(6, '0');
    dom.finalLevel.textContent = String(state.level).padStart(2, '0');
    dom.bestScore.textContent = String(state.best).padStart(6, '0');
    dom.bestIntro.textContent = String(state.best).padStart(6, '0');
    dom.resultNote.textContent = newBest
      ? 'A new fracture record. The wall never stood a chance.'
      : state.level >= 5
        ? 'Deep run. The swarm almost became infinite.'
        : 'The wall held. This time.';
    dom.gameover.hidden = false;
    dom.pause.hidden = true;
    sfx.gameover();
    updateHUD();
  }

  function updateHUD() {
    const ballCount = state.balls.length;
    dom.score.textContent = String(state.score).padStart(6, '0');
    dom.level.textContent = String(state.level).padStart(2, '0');
    dom.balls.textContent = String(ballCount);
    dom.swarmFill.style.width = `${clamp((ballCount / MAX_BALLS) * 100, 7, 100)}%`;
    dom.cores.innerHTML = Array.from({ length: 3 }, (_, index) =>
      `<i class="core-pip${index >= state.lives ? ' lost' : ''}"></i>`).join('');

    if (state.hudBalls !== ballCount) {
      state.hudBalls = ballCount;
      dom.swarmDot.classList.remove('pop');
      void dom.swarmDot.offsetWidth;
      dom.swarmDot.classList.add('pop');
      window.setTimeout(() => dom.swarmDot.classList.remove('pop'), 170);
    }

    dom.pauseBtn.disabled = state.mode !== 'playing' && state.mode !== 'paused';
  }

  function announce(message, duration = 1300) {
    window.clearTimeout(announceHandle);
    dom.announcer.textContent = message;
    dom.announcer.classList.add('show');
    announceHandle = window.setTimeout(() => dom.announcer.classList.remove('show'), duration);
  }

  function showToast(message, duration = 1650) {
    window.clearTimeout(toastHandle);
    dom.toast.textContent = message;
    dom.toast.classList.add('show');
    toastHandle = window.setTimeout(() => dom.toast.classList.remove('show'), duration);
  }

  function updateEffects(dt) {
    for (let index = state.particles.length - 1; index >= 0; index -= 1) {
      const particle = state.particles[index];
      particle.age += dt;
      if (particle.age >= particle.life) {
        state.particles.splice(index, 1);
        continue;
      }
      const drag = Math.exp(-particle.drag * dt);
      particle.vx *= drag;
      particle.vy = particle.vy * drag + particle.gravity * dt;
      particle.x += particle.vx * dt;
      particle.y += particle.vy * dt;
      particle.angle += particle.spin * dt;
    }

    for (let index = state.rings.length - 1; index >= 0; index -= 1) {
      const ring = state.rings[index];
      ring.age += dt;
      const progress = ring.age / ring.life;
      ring.radius = ring.radius + (ring.maxRadius - ring.radius) * Math.min(1, dt * 6.5);
      if (progress >= 1) state.rings.splice(index, 1);
    }

    for (let index = state.texts.length - 1; index >= 0; index -= 1) {
      const text = state.texts[index];
      text.age += dt;
      text.y -= 25 * dt;
      if (text.age >= text.life) state.texts.splice(index, 1);
    }

    for (const brick of state.bricks) {
      if (brick.flash > 0) brick.flash = Math.max(0, brick.flash - dt * 4.5);
    }
    if (state.paddle.flash > 0) state.paddle.flash = Math.max(0, state.paddle.flash - dt * 5);
    state.shake *= Math.exp(-7.5 * dt);
    if (state.shake < 0.05) state.shake = 0;
    if (state.damage > 0) state.damage = Math.max(0, state.damage - dt * 1.8);
  }
  function render() {
    const width = state.width;
    const height = state.height;
    ctx.setTransform(state.dpr, 0, 0, state.dpr, 0, 0);
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = '#05060d';
    ctx.fillRect(0, 0, width, height);

    const shakeX = state.shake > 0 ? random(-state.shake, state.shake) : 0;
    const shakeY = state.shake > 0 ? random(-state.shake, state.shake) : 0;

    ctx.save();
    ctx.translate(shakeX, shakeY);
    drawBackground();
    drawBricks();
    drawRings();
    drawPaddle();
    drawBalls();
    drawParticles();
    drawScoreText();
    ctx.restore();
  }

  function drawBackground() {
    const { width, height, wall } = state;
    const step = Math.max(48, Math.round(width / 20));
    ctx.save();
    ctx.strokeStyle = 'rgba(93, 170, 245, 0.045)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = wall.left + step; x < wall.right; x += step) {
      ctx.moveTo(x, wall.top);
      ctx.lineTo(x, wall.bottom);
    }
    for (let y = wall.top + step; y < wall.bottom; y += step) {
      ctx.moveTo(wall.left, y);
      ctx.lineTo(wall.right, y);
    }
    ctx.stroke();
    ctx.restore();

    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (const star of state.stars) {
      const twinkle = Math.sin(state.time * star.speed + star.phase);
      const alpha = clamp(star.alpha * (0.55 + twinkle * 0.45), 0.04, 0.6);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = '#bedcff';
      const x = (star.x + state.time * star.drift) % (width + 20) - 10;
      ctx.fillRect(x, star.y, star.size, star.size);
    }
    ctx.restore();

    ctx.fillStyle = 'rgba(255, 72, 174, 0.018)';
    ctx.fillRect(wall.left, height - 110, wall.right - wall.left, 110);

    ctx.save();
    ctx.strokeStyle = state.sideGradient;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(wall.left, wall.top - 22);
    ctx.lineTo(wall.left, wall.bottom + 16);
    ctx.moveTo(wall.right, wall.top - 22);
    ctx.lineTo(wall.right, wall.bottom + 16);
    ctx.stroke();
    ctx.restore();

    ctx.save();
    ctx.strokeStyle = 'rgba(100, 245, 255, 0.14)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(wall.left, wall.top);
    ctx.lineTo(wall.right, wall.top);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(100, 245, 255, 0.38)';
    const bracket = 14;
    ctx.beginPath();
    ctx.moveTo(wall.left, wall.top);
    ctx.lineTo(wall.left + bracket, wall.top);
    ctx.moveTo(wall.left, wall.top);
    ctx.lineTo(wall.left, wall.top + bracket);
    ctx.moveTo(wall.right, wall.top);
    ctx.lineTo(wall.right - bracket, wall.top);
    ctx.moveTo(wall.right, wall.top);
    ctx.lineTo(wall.right, wall.top + bracket);
    ctx.stroke();

    ctx.fillStyle = 'rgba(255, 72, 174, 0.1)';
    ctx.fillRect(wall.left, wall.bottom + 10, wall.right - wall.left, 1);
    ctx.restore();
  }

  function addRoundRectToPath(path, x, y, width, height, radius) {
    const r = Math.min(radius, width / 2, height / 2);
    path.moveTo(x + r, y);
    path.arcTo(x + width, y, x + width, y + height, r);
    path.arcTo(x + width, y + height, x, y + height, r);
    path.arcTo(x, y + height, x, y, r);
    path.arcTo(x, y, x + width, y, r);
    path.closePath();
  }

  function ensureBrickPaths() {
    if (!state.brickPathsDirty && state.brickPaths) return;
    const rows = [];
    for (let row = 0; row < state.grid.rows; row += 1) {
      const path = new Path2D();
      const shine = new Path2D();
      const shade = new Path2D();
      let count = 0;
      for (const brick of state.bricks) {
        if (!brick.alive || brick.row !== row) continue;
        addRoundRectToPath(path, brick.x, brick.y, brick.w, brick.h, 3.5);
        shine.rect(brick.x + brick.w * 0.09, brick.y + 1.5, brick.w * 0.82, 1);
        shade.rect(brick.x + brick.w * 0.12, brick.y + brick.h - 2.3, brick.w * 0.76, 1);
        count += 1;
      }
      if (!count) continue;
      const sample = state.bricks.find((brick) => brick.alive && brick.row === row);
      if (!sample) continue;
      const color = COLORS[sample.colorIndex];
      const gradient = ctx.createLinearGradient(0, sample.y, 0, sample.y + sample.h);
      gradient.addColorStop(0, color.hex);
      gradient.addColorStop(0.34, color.hex);
      gradient.addColorStop(1, color.dark);
      rows.push({ path, shine, shade, color, gradient });
    }
    state.brickPaths = rows;
    state.brickPathsDirty = false;
  }

  function drawBricks() {
    ensureBrickPaths();
    const alpha = state.mode === 'menu' ? 0.34 : 1;
    ctx.save();
    ctx.globalAlpha = alpha;
    for (const row of state.brickPaths || []) {
      ctx.fillStyle = row.gradient;
      ctx.fill(row.path);
      ctx.strokeStyle = rgba(row.color.rgb, 0.5);
      ctx.lineWidth = 0.8;
      ctx.stroke(row.path);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.24)';
      ctx.fill(row.shine);
      ctx.fillStyle = 'rgba(3, 8, 18, 0.32)';
      ctx.fill(row.shade);
    }

    for (const brick of state.bricks) {
      if (!brick.alive) continue;
      if (brick.maxHp > 1) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.fillRect(brick.x + brick.w - 7, brick.y + 3.5, 2.5, 2.5);
        if (brick.hp < brick.maxHp) {
          ctx.strokeStyle = 'rgba(3, 7, 15, 0.52)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          for (const crack of brick.cracks) {
            const cx = brick.x + crack.x * brick.w;
            const cy = brick.y + crack.y * brick.h;
            ctx.moveTo(cx, cy);
            ctx.lineTo(cx + crack.dx * brick.w, cy + crack.dy * brick.h);
          }
          ctx.stroke();
        }
      }
      if (brick.flash > 0) {
        ctx.fillStyle = `rgba(255, 255, 255, ${(brick.flash * 0.42).toFixed(3)})`;
        ctx.fillRect(brick.x, brick.y, brick.w, brick.h);
      }
    }
    ctx.restore();
  }

  function drawPaddle() {
    const paddle = state.paddle;
    const x = paddle.x - paddle.w / 2;
    const y = paddle.y;
    const glow = ctx.createRadialGradient(paddle.x, y + paddle.h / 2, 2, paddle.x, y + paddle.h / 2, paddle.w * 0.62);
    glow.addColorStop(0, `rgba(100, 245, 255, ${0.13 + paddle.flash * 0.12})`);
    glow.addColorStop(0.55, 'rgba(100, 245, 255, 0.04)');
    glow.addColorStop(1, 'rgba(100, 245, 255, 0)');

    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = glow;
    ctx.fillRect(x - paddle.w * 0.2, y - paddle.h * 1.2, paddle.w * 1.4, paddle.h * 3.1);
    ctx.restore();

    ctx.save();
    ctx.shadowColor = `rgba(100, 245, 255, ${0.26 + paddle.flash * 0.36})`;
    ctx.shadowBlur = 16 + paddle.flash * 18;
    const body = ctx.createLinearGradient(x, y, x + paddle.w, y);
    body.addColorStop(0, '#1a7d9a');
    body.addColorStop(0.17, '#47e8f3');
    body.addColorStop(0.46, '#e8ffff');
    body.addColorStop(0.6, '#ffd6ed');
    body.addColorStop(0.82, '#ff4fae');
    body.addColorStop(1, '#5a155f');
    roundRectPath(ctx, x, y, paddle.w, paddle.h, paddle.h / 2);
    ctx.fillStyle = body;
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.65)';
    ctx.lineWidth = 0.9;
    ctx.stroke();

    ctx.save();
    roundRectPath(ctx, x, y, paddle.w, paddle.h, paddle.h / 2);
    ctx.clip();
    const sheen = ctx.createLinearGradient(0, y, 0, y + paddle.h);
    sheen.addColorStop(0, 'rgba(255, 255, 255, 0.78)');
    sheen.addColorStop(0.24, 'rgba(255, 255, 255, 0.15)');
    sheen.addColorStop(0.58, 'rgba(255, 255, 255, 0)');
    sheen.addColorStop(1, 'rgba(5, 10, 24, 0.5)');
    ctx.fillStyle = sheen;
    ctx.fillRect(x, y, paddle.w, paddle.h);

    const coreX = paddle.x - paddle.w * 0.12;
    const core = ctx.createLinearGradient(coreX, 0, coreX + paddle.w * 0.24, 0);
    core.addColorStop(0, 'rgba(4, 12, 26, 0.05)');
    core.addColorStop(0.5, 'rgba(4, 12, 26, 0.83)');
    core.addColorStop(1, 'rgba(4, 12, 26, 0.05)');
    ctx.fillStyle = core;
    ctx.fillRect(coreX, y + 2, paddle.w * 0.24, paddle.h - 4);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
    ctx.fillRect(paddle.x - 1, y + paddle.h * 0.38, 2, paddle.h * 0.24);

    if (paddle.flash > 0) {
      ctx.fillStyle = `rgba(255, 255, 255, ${(paddle.flash * 0.34).toFixed(3)})`;
      ctx.fillRect(x, y, paddle.w, paddle.h);
    }
    ctx.restore();

    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.beginPath();
    ctx.arc(x + 3, y + paddle.h / 2, 1.7, 0, TAU);
    ctx.arc(x + paddle.w - 3, y + paddle.h / 2, 1.7, 0, TAU);
    ctx.fill();
    ctx.restore();

    const under = ctx.createLinearGradient(0, y + paddle.h, 0, y + paddle.h + 18);
    under.addColorStop(0, 'rgba(100, 245, 255, 0.16)');
    under.addColorStop(1, 'rgba(100, 245, 255, 0)');
    ctx.fillStyle = under;
    ctx.fillRect(paddle.x - paddle.w * 0.36, y + paddle.h, paddle.w * 0.72, 18);
  }

  function drawBalls() {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (const ball of state.balls) {
      const sprite = ballSprites[ball.color];
      if (ball.trail.length > 1) {
        for (let index = 0; index < ball.trail.length; index += 1) {
          const point = ball.trail[index];
          const progress = (index + 1) / ball.trail.length;
          const size = ball.r * (4 + progress * 5.2);
          ctx.globalAlpha = progress * progress * 0.085;
          ctx.drawImage(sprite, point.x - size / 2, point.y - size / 2, size, size);
        }
      }

      const size = ball.r * 9;
      ctx.globalAlpha = 1;
      ctx.drawImage(sprite, ball.x - size / 2, ball.y - size / 2, size, size);
      const color = COLORS[ball.color];
      ctx.strokeStyle = rgba(color.rgb, 0.55);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, ball.r + 1.6, 0, TAU);
      ctx.stroke();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, Math.max(1.1, ball.r * 0.42), 0, TAU);
      ctx.fill();
    }
    ctx.restore();
  }

  function drawRings() {
    if (!state.rings.length) return;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (const ring of state.rings) {
      const progress = clamp(ring.age / ring.life, 0, 1);
      const alpha = (1 - progress) * 0.55;
      ctx.strokeStyle = rgba(ring.rgb, alpha);
      ctx.lineWidth = 1 + (1 - progress) * 1.4;
      ctx.beginPath();
      ctx.arc(ring.x, ring.y, ring.radius, 0, TAU);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawParticles() {
    if (!state.particles.length) return;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (const particle of state.particles) {
      const progress = particle.age / particle.life;
      const alpha = Math.max(0, 1 - progress);
      ctx.globalAlpha = alpha * 0.82;
      ctx.fillStyle = `rgb(${particle.rgb})`;
      if (particle.shard) {
        ctx.save();
        ctx.translate(particle.x, particle.y);
        ctx.rotate(particle.angle);
        ctx.fillRect(-particle.size * 1.8, -particle.size * 0.5, particle.size * 3.6, particle.size);
        ctx.restore();
      } else {
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size * (1 - progress * 0.4), 0, TAU);
        ctx.fill();
      }
    }
    ctx.restore();
  }

  function drawScoreText() {
    if (!state.texts.length) return;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (const text of state.texts) {
      const progress = text.age / text.life;
      const alpha = (1 - progress) * (1 - progress * 0.2);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = `rgb(${text.rgb})`;
      ctx.font = `700 ${text.size}px "DejaVu Sans Mono", monospace`;
      ctx.fillText(text.text, text.x, text.y);
    }
    ctx.restore();
  }

  function startGame() {
    initAudio();
    state.mode = 'playing';
    state.score = 0;
    state.level = 1;
    state.lives = 3;
    state.combo = 0;
    state.comboTimer = 0;
    state.levelPending = false;
    state.levelTimer = 0;
    state.balls = [];
    state.particles = [];
    state.rings = [];
    state.texts = [];
    state.shake = 0;
    state.damage = 0;
    state.serveTimer = 0;
    state.accumulator = 0;
    state.last = performance.now();
    state.paddle.x = state.width / 2;
    state.paddle.targetX = state.width / 2;
    state.paddle.flash = 0;
    buildBricks();
    dom.intro.hidden = true;
    dom.pause.hidden = true;
    dom.gameover.hidden = true;
    dom.levelBanner.classList.remove('show');
    dom.combo.classList.remove('active');
    dom.pauseBtn.setAttribute('aria-label', 'Pause');
    dom.pauseBtn.setAttribute('title', 'Pause (P)');
    serveBall(0.62);
    refreshCombo();
    updateHUD();
    sfx.start();
    announce('SIGNAL LOCKED // EVERY IMPACT SPLITS', 1800);
  }

  function togglePause() {
    if (state.mode === 'playing') {
      state.mode = 'paused';
      dom.pause.hidden = false;
      dom.combo.classList.remove('active');
      dom.pauseBtn.setAttribute('aria-label', 'Resume');
      dom.pauseBtn.setAttribute('title', 'Resume (P)');
      state.accumulator = 0;
      window.setTimeout(() => dom.resumeBtn.focus({ preventScroll: true }), 40);
    } else if (state.mode === 'paused') {
      state.mode = 'playing';
      dom.pause.hidden = true;
      dom.pauseBtn.setAttribute('aria-label', 'Pause');
      dom.pauseBtn.setAttribute('title', 'Pause (P)');
      state.last = performance.now();
      state.accumulator = 0;
      refreshCombo();
    }
  }

  function returnToMenu() {
    state.mode = 'menu';
    state.score = 0;
    state.level = 1;
    state.lives = 3;
    state.combo = 0;
    state.comboTimer = 0;
    state.levelPending = false;
    state.levelTimer = 0;
    state.balls = [];
    state.particles = [];
    state.rings = [];
    state.texts = [];
    state.shake = 0;
    state.damage = 0;
    state.paddle.x = state.width / 2;
    state.paddle.targetX = state.width / 2;
    buildBricks();
    dom.intro.hidden = false;
    dom.pause.hidden = true;
    dom.gameover.hidden = true;
    dom.levelBanner.classList.remove('show');
    dom.combo.classList.remove('active');
    dom.bestIntro.textContent = String(state.best).padStart(6, '0');
    refreshCombo();
    updateHUD();
  }

  function pointerX(event) {
    const rect = canvas.getBoundingClientRect();
    return clamp(event.clientX - rect.left, state.wall.left, state.wall.right);
  }

  function handlePointerMove(event) {
    const x = pointerX(event);
    state.pointerX = x;
    state.pointerSeen = true;
    state.paddle.targetX = clamp(x, state.wall.left + state.paddle.w / 2, state.wall.right - state.paddle.w / 2);
  }

  canvas.addEventListener('pointermove', (event) => {
    handlePointerMove(event);
  }, { passive: true });

  canvas.addEventListener('pointerdown', (event) => {
    initAudio();
    if (state.mode !== 'playing') return;
    handlePointerMove(event);
    try { canvas.setPointerCapture(event.pointerId); } catch { /* pointer capture is optional */ }
    if (state.balls.some((ball) => ball.stuck)) launchBalls();
    event.preventDefault();
  }, { passive: false });

  canvas.addEventListener('pointerup', (event) => {
    try { canvas.releasePointerCapture(event.pointerId); } catch { /* pointer capture is optional */ }
  }, { passive: true });

  window.addEventListener('keydown', (event) => {
    const code = event.code;
    if (code === 'ArrowLeft' || code === 'KeyA') {
      state.keys.left = true;
      event.preventDefault();
      return;
    }
    if (code === 'ArrowRight' || code === 'KeyD') {
      state.keys.right = true;
      event.preventDefault();
      return;
    }
    if (code === 'Space') {
      event.preventDefault();
      initAudio();
      if (state.mode === 'menu') startGame();
      else if (state.mode === 'gameover') startGame();
      else if (state.mode === 'playing') launchBalls();
      return;
    }
    if (code === 'Enter' && state.mode === 'menu') {
      event.preventDefault();
      startGame();
      return;
    }
    if (code === 'KeyP' || code === 'Escape') {
      if (state.mode === 'playing' || state.mode === 'paused') {
        event.preventDefault();
        togglePause();
      }
    }
  });

  window.addEventListener('keyup', (event) => {
    if (event.code === 'ArrowLeft' || event.code === 'KeyA') state.keys.left = false;
    if (event.code === 'ArrowRight' || event.code === 'KeyD') state.keys.right = false;
  });

  dom.playBtn.addEventListener('click', startGame);
  dom.againBtn.addEventListener('click', startGame);
  dom.restartBtn.addEventListener('click', startGame);
  dom.resumeBtn.addEventListener('click', togglePause);
  dom.menuBtn.addEventListener('click', returnToMenu);
  dom.pauseBtn.addEventListener('click', togglePause);
  dom.soundBtn.addEventListener('click', toggleMute);
  dom.brand.addEventListener('click', (event) => event.preventDefault());

  document.addEventListener('visibilitychange', () => {
    if (document.hidden && state.mode === 'playing') togglePause();
  });

  window.addEventListener('pointerdown', initAudio, { once: true, passive: true });
  window.addEventListener('keydown', initAudio, { once: true });

  let resizeFrame = 0;
  function scheduleResize() {
    window.cancelAnimationFrame(resizeFrame);
    resizeFrame = window.requestAnimationFrame(() => {
      resizeGame();
      updateHUD();
    });
  }
  window.addEventListener('resize', scheduleResize);
  if (window.visualViewport) window.visualViewport.addEventListener('resize', scheduleResize);

  function loop(now) {
    const elapsed = Math.max(0, Math.min(0.1, (now - state.last) / 1000));
    state.last = now;
    update(elapsed);
    render();
    window.requestAnimationFrame(loop);
  }

  function init() {
    applyMute();
    dom.bestIntro.textContent = String(state.best).padStart(6, '0');
    resizeGame();
    state.paddle.x = state.width / 2;
    state.paddle.targetX = state.width / 2;
    buildBricks();
    refreshCombo();
    updateHUD();
    window.requestAnimationFrame(loop);
  }

  init();
})();
