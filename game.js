(() => {
  'use strict';

  // ---------------------------------------------------------------------------
  // Core setup
  // ---------------------------------------------------------------------------
  const W = 1280, H = 720, GROUND = 600;
  const STAGE_L = 120, STAGE_R = 1160;
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');
  let DPR = Math.min(2, window.devicePixelRatio || 1);

  function resizeCanvas() {
    DPR = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.round(W * DPR);
    canvas.height = Math.round(H * DPR);
    canvas.style.width = '100%';
    canvas.style.height = '100%';
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const easeOut = t => 1 - Math.pow(1 - clamp(t, 0, 1), 3);
  const easeIn = t => Math.pow(clamp(t, 0, 1), 3);
  const rand = (a, b) => a + Math.random() * (b - a);
  const pick = arr => arr[Math.floor(Math.random() * arr.length)];
  const now = () => performance.now();

  function mulberry32(a) {
    return function () {
      a |= 0; a = a + 0x6D2B79F5 | 0;
      let t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }

  const dom = {
    hud: document.getElementById('hud'),
    p1health: document.getElementById('p1health'),
    p1ghost: document.getElementById('p1ghost'),
    p2health: document.getElementById('p2health'),
    p2ghost: document.getElementById('p2ghost'),
    p1sp: document.getElementById('p1sp'),
    p2sp: document.getElementById('p2sp'),
    p1spfill: document.getElementById('p1spfill'),
    p2spfill: document.getElementById('p2spfill'),
    p1wins: document.querySelectorAll('#p1wins i'),
    p2wins: document.querySelectorAll('#p2wins i'),
    timer: document.getElementById('timer'),
    roundLabel: document.getElementById('roundLabel'),
    combo: document.getElementById('combo'),
    comboNum: document.getElementById('comboNum'),
    titleOverlay: document.getElementById('titleOverlay'),
    matchOverlay: document.getElementById('matchOverlay'),
    pauseOverlay: document.getElementById('pauseOverlay'),
    winnerText: document.getElementById('winnerText'),
    matchScore: document.getElementById('matchScore'),
    statRounds: document.getElementById('statRounds'),
    statCombo: document.getElementById('statCombo'),
    statSpecials: document.getElementById('statSpecials'),
    muteBtn: document.getElementById('muteBtn'),
    pauseBtn: document.getElementById('pauseBtn'),
    touch: document.getElementById('touch'),
    portraitInfo: document.getElementById('portraitInfo')
  };

  // ---------------------------------------------------------------------------
  // Audio — tiny synthesized arcade SFX
  // ---------------------------------------------------------------------------
  const audio = {
    ac: null, master: null, noiseBuf: null, muted: false,
    init() {
      if (this.ac) { if (this.ac.state === 'suspended') this.ac.resume(); return; }
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      this.ac = new AC();
      this.master = this.ac.createGain();
      this.master.gain.value = this.muted ? 0 : 0.34;
      this.master.connect(this.ac.destination);
      const len = this.ac.sampleRate;
      this.noiseBuf = this.ac.createBuffer(1, len, this.ac.sampleRate);
      const d = this.noiseBuf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    },
    setMuted(m) {
      this.muted = m;
      if (this.master) this.master.gain.setTargetAtTime(m ? 0 : 0.34, this.ac.currentTime, 0.02);
      dom.muteBtn.classList.toggle('muted', m);
    },
    tone(freq, dur, type = 'sine', vol = 0.12, slide = 0, delay = 0) {
      if (!this.ac) return;
      const t0 = this.ac.currentTime + delay;
      const o = this.ac.createOscillator();
      const g = this.ac.createGain();
      o.type = type;
      o.frequency.setValueAtTime(Math.max(20, freq), t0);
      if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(20, freq + slide), t0 + dur);
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(vol, t0 + 0.008);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      o.connect(g); g.connect(this.master);
      o.start(t0); o.stop(t0 + dur + 0.03);
    },
    noise(dur, vol = 0.12, freq = 1200, type = 'lowpass', delay = 0, slide = 0) {
      if (!this.ac || !this.noiseBuf) return;
      const t0 = this.ac.currentTime + delay;
      const s = this.ac.createBufferSource();
      s.buffer = this.noiseBuf;
      const f = this.ac.createBiquadFilter();
      f.type = type;
      f.frequency.setValueAtTime(freq, t0);
      if (slide) f.frequency.exponentialRampToValueAtTime(Math.max(80, freq + slide), t0 + dur);
      const g = this.ac.createGain();
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(vol, t0 + 0.006);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      s.connect(f); f.connect(g); g.connect(this.master);
      s.start(t0); s.stop(t0 + dur + 0.03);
    },
    whoosh(heavy) {
      this.noise(heavy ? 0.2 : 0.11, heavy ? 0.2 : 0.11, heavy ? 900 : 1600, 'bandpass', 0, -500);
    },
    hit(heavy) {
      this.noise(heavy ? 0.16 : 0.09, heavy ? 0.34 : 0.2, heavy ? 500 : 1100, 'lowpass');
      this.tone(heavy ? 80 : 150, heavy ? 0.2 : 0.1, 'sine', heavy ? 0.4 : 0.2, -40);
      if (heavy) this.tone(190, 0.1, 'square', 0.06, -90);
    },
    block() {
      this.noise(0.08, 0.13, 2400, 'highpass');
      this.tone(760, 0.08, 'square', 0.05, -220);
    },
    fireball() {
      this.noise(0.34, 0.18, 500, 'bandpass', 0, 900);
      this.tone(170, 0.3, 'sawtooth', 0.1, -90);
      this.tone(420, 0.22, 'sine', 0.07, -260, 0.03);
    },
    uppercut() {
      this.noise(0.18, 0.16, 700, 'bandpass', 0, 1200);
      this.tone(160, 0.24, 'sawtooth', 0.11, 460);
    },
    spin() {
      for (let i = 0; i < 4; i++) this.tone(220 + i * 70, 0.1, 'triangle', 0.05, 120, i * 0.07);
      this.noise(0.35, 0.1, 1400, 'bandpass', 0, -700);
    },
    ko() {
      this.tone(62, 0.9, 'sine', 0.34, -18);
      this.tone(94, 0.7, 'triangle', 0.14, -30);
      this.noise(0.7, 0.2, 300, 'lowpass');
      this.crowd();
    },
    crowd() {
      this.noise(1.5, 0.11, 700, 'bandpass', 0.15, 500);
    },
    ui() { this.tone(640, 0.05, 'square', 0.05, 120); },
    error() { this.tone(140, 0.12, 'square', 0.05, -50); }
  };

  // ---------------------------------------------------------------------------
  // Stage background (pre-rendered once)
  // ---------------------------------------------------------------------------
  const stageCanvas = document.createElement('canvas');
  stageCanvas.width = W; stageCanvas.height = H;

  function buildStage() {
    const g = stageCanvas.getContext('2d');
    const rnd = mulberry32(0x51a7c1a5);

    const sky = g.createLinearGradient(0, 0, 0, 640);
    sky.addColorStop(0, '#060512');
    sky.addColorStop(0.28, '#160a2c');
    sky.addColorStop(0.5, '#3a0f43');
    sky.addColorStop(0.68, '#7b1c4a');
    sky.addColorStop(0.82, '#d44a54');
    sky.addColorStop(1, '#ff9d5c');
    g.fillStyle = sky; g.fillRect(0, 0, W, H);

    // stars
    for (let i = 0; i < 170; i++) {
      const x = rnd() * W, y = rnd() * 330, r = rnd() * 1.4 + 0.3;
      g.globalAlpha = rnd() * 0.7 + 0.15;
      g.fillStyle = rnd() > 0.85 ? '#ffd9a8' : '#cfe9ff';
      g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill();
    }
    g.globalAlpha = 1;

    // sun / moon
    const sx = 948, sy = 392, sr = 118;
    const halo = g.createRadialGradient(sx, sy, 20, sx, sy, 260);
    halo.addColorStop(0, 'rgba(255,196,120,.34)');
    halo.addColorStop(0.45, 'rgba(255,110,90,.14)');
    halo.addColorStop(1, 'rgba(255,80,80,0)');
    g.fillStyle = halo; g.beginPath(); g.arc(sx, sy, 260, 0, Math.PI * 2); g.fill();
    const sun = g.createLinearGradient(0, sy - sr, 0, sy + sr);
    sun.addColorStop(0, '#fff2c9'); sun.addColorStop(0.55, '#ffd28a'); sun.addColorStop(1, '#ff8a5e');
    g.fillStyle = sun; g.beginPath(); g.arc(sx, sy, sr, 0, Math.PI * 2); g.fill();
    g.fillStyle = 'rgba(74,22,56,.5)';
    for (let i = 0; i < 4; i++) g.fillRect(sx - sr - 6, sy + 24 + i * 22, sr * 2 + 12, 6 + i * 2);

    // clouds
    for (let i = 0; i < 16; i++) {
      const x = rnd() * W, y = 80 + rnd() * 300, w = 90 + rnd() * 260, h = 8 + rnd() * 20;
      g.globalAlpha = 0.1 + rnd() * 0.14;
      g.fillStyle = rnd() > 0.5 ? '#301347' : '#5b1c50';
      g.beginPath(); g.ellipse(x, y, w, h, 0, 0, Math.PI * 2); g.fill();
      g.beginPath(); g.ellipse(x + w * 0.5, y + 6, w * 0.55, h * 0.8, 0, 0, Math.PI * 2); g.fill();
    }
    g.globalAlpha = 1;

    // far skyline
    let x = -30;
    while (x < W + 40) {
      const bw = 34 + rnd() * 70, bh = 70 + rnd() * 150;
      const by = 592 - bh;
      g.fillStyle = '#170d2c';
      g.fillRect(x, by, bw, bh + 30);
      g.fillStyle = 'rgba(255,196,120,.5)';
      for (let wx = x + 6; wx < x + bw - 5; wx += 11) {
        for (let wy = by + 8; wy < by + bh - 10; wy += 14) {
          if (rnd() > 0.72) { g.globalAlpha = 0.25 + rnd() * 0.5; g.fillRect(wx, wy, 3, 4); }
        }
      }
      g.globalAlpha = 1;
      x += bw + 4 + rnd() * 14;
    }

    // mid skyline
    x = -50;
    while (x < W + 60) {
      const bw = 70 + rnd() * 110, bh = 130 + rnd() * 230;
      const by = 600 - bh;
      const shade = 9 + Math.floor(rnd() * 10);
      g.fillStyle = `rgb(${shade + 4},${shade},${shade + 14})`;
      g.fillRect(x, by, bw, bh + 20);
      // roof lip
      g.fillStyle = 'rgba(255,255,255,.05)'; g.fillRect(x, by, bw, 3);
      // windows
      for (let wx = x + 9; wx < x + bw - 8; wx += 17) {
        for (let wy = by + 13; wy < by + bh - 14; wy += 21) {
          if (rnd() > 0.55) {
            const lit = rnd();
            g.globalAlpha = 0.2 + lit * 0.65;
            g.fillStyle = lit > 0.7 ? '#8ce9ff' : lit > 0.4 ? '#ffcf7d' : '#ff6f9d';
            g.fillRect(wx, wy, 5, 7);
          }
        }
      }
      g.globalAlpha = 1;
      // antenna / roof details
      if (rnd() > 0.45) {
        g.strokeStyle = 'rgba(10,7,20,.9)'; g.lineWidth = 3;
        g.beginPath(); g.moveTo(x + bw * 0.5, by); g.lineTo(x + bw * 0.5, by - 20 - rnd() * 35); g.stroke();
        g.fillStyle = '#ff476e'; g.beginPath(); g.arc(x + bw * 0.5, by - 20, 2.5, 0, Math.PI * 2); g.fill();
      }
      x += bw + 8 + rnd() * 26;
    }

    // neon signs
    function neon(text, nx, ny, color, size, vertical) {
      g.save();
      g.translate(nx, ny);
      if (vertical) g.rotate(-Math.PI / 2);
      g.font = `900 ${size}px "Arial Black", Impact, sans-serif`;
      g.textAlign = 'center'; g.textBaseline = 'middle';
      g.shadowColor = color; g.shadowBlur = 26;
      g.fillStyle = color; g.globalAlpha = 0.92;
      g.fillText(text, 0, 0);
      g.shadowBlur = 8; g.fillStyle = '#fff';
      g.globalAlpha = 0.8; g.fillText(text, 0, 0);
      g.restore();
    }
    neon('NEO', 212, 300, '#ff4d8b', 34, false);
    neon('BAR', 1214, 338, '#4de3ff', 24, true);
    neon('NIGHT', 1040, 286, '#ffd166', 24, false);
    neon('東京', 78, 372, '#ff3d81', 30, true);

    // distant train line
    g.fillStyle = '#0b0817'; g.fillRect(0, 500, W, 8);
    for (let i = 0; i < 16; i++) { g.fillStyle = 'rgba(10,8,20,.9)'; g.fillRect(i * 84 + 18, 508, 6, 92); }
    g.fillStyle = 'rgba(120,220,255,.35)';
    for (let i = 0; i < 30; i++) g.fillRect(i * 44 + 8, 498, 3, 3);

    // rooftop parapet / fence
    g.fillStyle = '#0a0812'; g.fillRect(0, 558, W, 44);
    g.fillStyle = '#141022'; g.fillRect(0, 552, W, 8);
    // mesh
    g.strokeStyle = 'rgba(120,140,190,.14)'; g.lineWidth = 1;
    for (let i = -60; i < W + 60; i += 18) {
      g.beginPath(); g.moveTo(i, 558); g.lineTo(i + 40, 602); g.stroke();
      g.beginPath(); g.moveTo(i + 40, 558); g.lineTo(i, 602); g.stroke();
    }
    for (let px = 40; px < W; px += 172) {
      g.fillStyle = '#090711'; g.fillRect(px, 548, 9, 54);
      g.fillStyle = '#262036'; g.fillRect(px + 2, 548, 2, 54);
    }
    g.fillStyle = '#0d0a18'; g.fillRect(0, 596, W, 10);
    g.fillStyle = 'rgba(255,160,110,.22)'; g.fillRect(0, 596, W, 2);

    // roof floor
    const floor = g.createLinearGradient(0, 600, 0, H);
    floor.addColorStop(0, '#1a1526');
    floor.addColorStop(0.25, '#12101c');
    floor.addColorStop(1, '#06060c');
    g.fillStyle = floor; g.fillRect(0, 604, W, H - 604);

    // perspective tiles
    g.strokeStyle = 'rgba(255,255,255,.045)'; g.lineWidth = 2;
    for (let i = -8; i <= 8; i++) {
      g.beginPath(); g.moveTo(W / 2 + i * 34, 604); g.lineTo(W / 2 + i * 190, H); g.stroke();
    }
    for (let i = 1; i < 8; i++) {
      const yy = 604 + Math.pow(i / 8, 1.7) * (H - 604);
      g.beginPath(); g.moveTo(0, yy); g.lineTo(W, yy); g.stroke();
    }

    // neon floor reflections
    function reflection(rx, color, width, alpha) {
      const gr = g.createLinearGradient(rx, 604, rx, 720);
      gr.addColorStop(0, color); gr.addColorStop(1, 'rgba(0,0,0,0)');
      g.globalAlpha = alpha; g.fillStyle = gr;
      g.beginPath(); g.moveTo(rx - width, 604); g.lineTo(rx + width, 604); g.lineTo(rx + width * 2.4, 720); g.lineTo(rx - width * 2.4, 720); g.closePath(); g.fill();
      g.globalAlpha = 1;
    }
    reflection(212, 'rgba(255,77,139,.3)', 22, 0.35);
    reflection(1040, 'rgba(255,209,102,.26)', 18, 0.3);
    reflection(1214, 'rgba(77,227,255,.24)', 14, 0.25);

    // side props — AC unit, pipes, crates
    g.fillStyle = '#0c0a14'; g.fillRect(22, 546, 104, 58);
    g.fillStyle = '#1a1724'; g.fillRect(26, 550, 96, 50);
    g.strokeStyle = '#2a2638'; g.lineWidth = 2;
    for (let i = 0; i < 4; i++) { g.beginPath(); g.arc(74, 575, 14 + i * 5, 0, Math.PI * 2); g.stroke(); }
    g.fillStyle = '#0a0812'; g.fillRect(1188, 530, 74, 74);
    g.fillStyle = '#171322'; g.fillRect(1192, 534, 66, 66);
    g.fillStyle = '#241d34'; g.fillRect(1192, 566, 66, 3);
    g.strokeStyle = '#0a0812'; g.lineWidth = 9;
    g.beginPath(); g.moveTo(1140, 500); g.lineTo(1140, 600); g.stroke();
    g.strokeStyle = '#1d1929'; g.lineWidth = 4;
    g.beginPath(); g.moveTo(1140, 500); g.lineTo(1140, 600); g.stroke();

    // warm side lighting
    const leftGlow = g.createRadialGradient(70, 600, 10, 70, 600, 230);
    leftGlow.addColorStop(0, 'rgba(255,120,70,.12)'); leftGlow.addColorStop(1, 'rgba(255,120,70,0)');
    g.fillStyle = leftGlow; g.fillRect(0, 380, 400, 340);
    const rightGlow = g.createRadialGradient(1210, 600, 10, 1210, 600, 250);
    rightGlow.addColorStop(0, 'rgba(70,190,255,.12)'); rightGlow.addColorStop(1, 'rgba(70,190,255,0)');
    g.fillStyle = rightGlow; g.fillRect(880, 360, 400, 360);
  }
  buildStage();

  // Ambient particles + lanterns
  const embers = Array.from({ length: 46 }, () => ({
    x: Math.random() * W, y: Math.random() * H, r: rand(0.5, 2.1),
    vy: rand(-16, -4), vx: rand(-9, 9), a: rand(0.15, 0.6), ph: rand(0, 6.28)
  }));
  const lanterns = [
    { x: 142, y: 120, len: 92, ph: 0.2, col: '#ff6a4d' },
    { x: 1138, y: 96, len: 126, ph: 2.1, col: '#ffc14d' }
  ];

  function drawLantern(l, time) {
    const sway = Math.sin(time * 0.8 + l.ph) * 0.09;
    ctx.save();
    ctx.translate(l.x, 0);
    ctx.rotate(sway);
    ctx.strokeStyle = 'rgba(10,8,18,.9)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, l.len); ctx.stroke();
    ctx.translate(0, l.len + 26);
    const glow = ctx.createRadialGradient(0, 0, 4, 0, 0, 95);
    glow.addColorStop(0, l.col + '88'); glow.addColorStop(1, l.col + '00');
    ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(0, 0, 95, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = l.col;
    ctx.beginPath(); ctx.ellipse(0, 0, 22, 30, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = 'rgba(255,245,210,.65)'; ctx.lineWidth = 1.5;
    for (let i = -2; i <= 2; i++) { ctx.beginPath(); ctx.ellipse(0, 0, 22, 30, 0, 0, Math.PI * 2); ctx.stroke(); break; }
    ctx.beginPath(); ctx.moveTo(-22, 0); ctx.lineTo(22, 0); ctx.stroke();
    ctx.fillStyle = 'rgba(255,250,220,.8)'; ctx.beginPath(); ctx.ellipse(0, -3, 8, 12, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#2a1208'; ctx.fillRect(-12, -34, 24, 5); ctx.fillRect(-12, 28, 24, 5);
    ctx.restore();
  }

  function drawBackground(time, shakeX, shakeY) {
    ctx.save();
    ctx.translate(shakeX * 0.2, shakeY * 0.2);
    ctx.drawImage(stageCanvas, 0, 0);
    // moving train
    const tx = ((time * 34) % (W + 460)) - 460;
    ctx.save();
    ctx.translate(tx, 468);
    ctx.fillStyle = '#0b0917'; ctx.fillRect(0, 0, 360, 34);
    ctx.fillStyle = '#1b1a2e'; ctx.fillRect(0, 3, 360, 26);
    for (let i = 0; i < 10; i++) {
      ctx.fillStyle = i % 3 === 0 ? '#ffd27a' : '#7fd9ff';
      ctx.globalAlpha = 0.55; ctx.fillRect(8 + i * 35, 9, 20, 8);
    }
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#ff5c7a'; ctx.fillRect(356, 8, 4, 5);
    ctx.restore();
    // fog
    ctx.globalAlpha = 0.05;
    ctx.globalAlpha = 1;
    // embers
    for (const e of embers) {
      e.y += e.vy * 0.016;
      e.x += (e.vx + Math.sin(time + e.ph) * 7) * 0.016;
      if (e.y < 300) { e.y = H + 10; e.x = Math.random() * W; }
      if (e.x < -20) e.x = W + 20; if (e.x > W + 20) e.x = -20;
      ctx.globalAlpha = e.a * (0.5 + 0.5 * Math.sin(time * 2 + e.ph));
      ctx.fillStyle = '#ffb37a';
      ctx.beginPath(); ctx.arc(e.x, e.y, e.r, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;
    drawLantern(lanterns[0], time);
    drawLantern(lanterns[1], time);
    ctx.restore();
  }

  // ---------------------------------------------------------------------------
  // Moves & fighters
  // ---------------------------------------------------------------------------
  const SCALE = 1.42;
  const MOVES = {
    punch: {
      name: 'JAB', startup: 0.06, active: 0.07, recovery: 0.15, dmg: 5, chip: 0,
      hitstun: 0.24, blockstun: 0.12, kb: 135, ox: 22, w: 82, y: -152, h: 54, meter: 6, sfx: 'light'
    },
    kick: {
      name: 'HEAVY KICK', startup: 0.14, active: 0.1, recovery: 0.28, dmg: 10, chip: 0,
      hitstun: 0.34, blockstun: 0.16, kb: 310, ox: 16, w: 112, y: -122, h: 82, meter: 9, sfx: 'heavy'
    },
    jumpkick: {
      name: 'AIR KICK', startup: 0.08, active: 0.22, recovery: 0.16, dmg: 8, chip: 0,
      hitstun: 0.32, blockstun: 0.14, kb: 240, ox: 14, w: 100, y: -118, h: 90, meter: 8, sfx: 'heavy', air: true
    },
    fireball: {
      name: 'HADOKEN', startup: 0.19, active: 0.02, recovery: 0.42, dmg: 11, chip: 2,
      hitstun: 0.38, blockstun: 0.2, kb: 250, meter: 13, cost: 25, projectile: true, special: true,
      callout: 'HADOKEN!', color: '#4de3ff'
    },
    uppercut: {
      name: 'SHORYUKEN', startup: 0.07, active: 0.2, recovery: 0.46, dmg: 16, chip: 2,
      hitstun: 0.56, blockstun: 0.2, kb: 290, launch: true, ox: 6, w: 92, y: -224, h: 200,
      meter: 15, cost: 25, rise: true, invuln: 0.32, special: true, callout: 'SHORYUKEN!', color: '#ffb347'
    },
    spin: {
      name: 'TATSUMAKI', startup: 0.12, active: 0.44, recovery: 0.32, dmg: 5, chip: 1,
      hitstun: 0.26, blockstun: 0.13, kb: 185, ox: -30, w: 152, y: -158, h: 160,
      meter: 11, cost: 25, dash: 260, hits: 3, hitInterval: 0.14, special: true,
      callout: 'TATSUMAKI!', color: '#7ef6ff'
    }
  };
  const moveTotal = m => m.startup + m.active + m.recovery;

  const COLORS = {
    kai: {
      gi: '#2c63e8', giDark: '#15358f', giLight: '#6d9aff', pants: '#20459c', pantsDark: '#122b68',
      skin: '#f0b183', skinDark: '#b97b52', hair: '#181622', hairLight: '#413a5c',
      band: '#ff3355', bandDark: '#9e0f2a', belt: '#f3efe4', beltDark: '#a8a294',
      shoe: '#111118', trim: '#a9c6ff', eye: '#2a1c1a', style: 'gi'
    },
    raze: {
      gi: '#c72b45', giDark: '#6c1023', giLight: '#ff647c', pants: '#1b1820', pantsDark: '#0d0b10',
      skin: '#d39a72', skinDark: '#94603f', hair: '#dcdce8', hairLight: '#ffffff',
      band: '#ffd166', bandDark: '#9f7617', belt: '#15141b', beltDark: '#000',
      shoe: '#0b0b11', trim: '#ffb3c0', eye: '#1d1512', style: 'vest'
    }
  };

  const POSE_KEYS = ['hip', 'chest', 'head', 'fShoulder', 'fElbow', 'fFist', 'bShoulder', 'bElbow', 'bFist', 'fHip', 'fKnee', 'fFoot', 'bHip', 'bKnee', 'bFoot'];
  function basePose() {
    return {
      hip: [0, -82], chest: [0, -126], head: [0, -162],
      fShoulder: [9, -130], fElbow: [28, -113], fFist: [34, -131],
      bShoulder: [-9, -130], bElbow: [-26, -111], bFist: [-32, -127],
      fHip: [7, -80], fKnee: [18, -45], fFoot: [24, -3],
      bHip: [-7, -80], bKnee: [-18, -45], bFoot: [-24, -3]
    };
  }
  function clonePose(p) {
    const out = {};
    for (const k of POSE_KEYS) out[k] = [p[k][0], p[k][1]];
    return out;
  }
  function lerpPose(a, b, t) {
    const out = {};
    t = clamp(t, 0, 1);
    for (const k of POSE_KEYS) out[k] = [lerp(a[k][0], b[k][0], t), lerp(a[k][1], b[k][1], t)];
    return out;
  }
  function shiftUpper(p, dx, dy) {
    for (const k of ['chest', 'head', 'fShoulder', 'fElbow', 'fFist', 'bShoulder', 'bElbow', 'bFist']) {
      p[k][0] += dx; p[k][1] += dy;
    }
  }
  function breathe(p, amount) {
    shiftUpper(p, 0, amount);
    p.hip[1] += amount * 0.35;
  }

  function attackPose(f, time) {
    const m = f.move, t = f.moveT;
    const total = moveTotal(m);
    const activeStart = m.startup, activeEnd = m.startup + m.active;
    let ext;
    if (t < activeStart) ext = easeOut(t / Math.max(0.001, activeStart));
    else if (t <= activeEnd) ext = 1;
    else ext = 1 - 0.4 * easeIn((t - activeEnd) / Math.max(0.001, m.recovery));

    if (f.moveKey === 'punch') {
      const wind = basePose();
      wind.fElbow = [8, -118]; wind.fFist = [6, -104];
      wind.chest = [-2, -126]; wind.head = [-3, -162];
      const strike = basePose();
      strike.fShoulder = [13, -128]; strike.fElbow = [47, -123]; strike.fFist = [88, -122];
      strike.chest = [7, -126]; strike.head = [9, -162];
      strike.bElbow = [-27, -110]; strike.bFist = [-27, -94];
      strike.fKnee = [19, -44]; strike.fFoot = [25, -3];
      return lerpPose(wind, strike, ext);
    }
    if (f.moveKey === 'kick') {
      const wind = basePose();
      wind.fKnee = [30, -72]; wind.fFoot = [34, -48]; wind.chest = [-4, -124];
      const strike = basePose();
      strike.fHip = [8, -80]; strike.fKnee = [50, -93]; strike.fFoot = [100, -108];
      strike.chest = [-14, -122]; strike.head = [-20, -158];
      strike.bElbow = [-30, -98]; strike.bFist = [-48, -110];
      strike.fShoulder = [2, -126]; strike.fElbow = [24, -108]; strike.fFist = [34, -90];
      strike.bKnee = [-16, -44]; strike.bFoot = [-22, -3];
      return lerpPose(wind, strike, ext);
    }
    if (f.moveKey === 'jumpkick') {
      const strike = basePose();
      strike.hip = [0, -92]; strike.chest = [-8, -132]; strike.head = [-14, -166];
      strike.fKnee = [44, -88]; strike.fFoot = [88, -68];
      strike.bKnee = [-18, -76]; strike.bFoot = [-34, -54];
      strike.fElbow = [20, -120]; strike.fFist = [34, -104];
      strike.bElbow = [-28, -116]; strike.bFist = [-40, -130];
      const wind = basePose();
      wind.fKnee = [22, -88]; wind.fFoot = [30, -66];
      return lerpPose(wind, strike, ext);
    }
    if (f.moveKey === 'fireball') {
      const charge = basePose();
      charge.fElbow = [4, -108]; charge.fFist = [16, -92];
      charge.bElbow = [-8, -108]; charge.bFist = [-2, -94];
      charge.chest = [-4, -124]; charge.head = [-5, -160];
      charge.fKnee = [22, -44]; charge.fFoot = [28, -3];
      charge.bKnee = [-18, -42]; charge.bFoot = [-28, -3];
      const strike = basePose();
      strike.fShoulder = [12, -128]; strike.fElbow = [40, -116]; strike.fFist = [72, -108];
      strike.bShoulder = [-6, -128]; strike.bElbow = [20, -116]; strike.bFist = [60, -112];
      strike.chest = [8, -125]; strike.head = [10, -160];
      strike.fKnee = [24, -46]; strike.fFoot = [34, -3];
      strike.bKnee = [-20, -42]; strike.bFoot = [-34, -3];
      return lerpPose(charge, strike, ext);
    }
    if (f.moveKey === 'uppercut') {
      const wind = basePose();
      wind.hip = [0, -68]; wind.chest = [-2, -112]; wind.head = [-4, -148];
      wind.fElbow = [12, -104]; wind.fFist = [18, -86];
      wind.fKnee = [22, -38]; wind.fFoot = [26, -3];
      wind.bKnee = [-18, -36]; wind.bFoot = [-28, -3];
      const strike = basePose();
      strike.hip = [0, -96]; strike.chest = [4, -138]; strike.head = [2, -176];
      strike.fShoulder = [12, -140]; strike.fElbow = [20, -186]; strike.fFist = [30, -230];
      strike.bShoulder = [-8, -138]; strike.bElbow = [-24, -112]; strike.bFist = [-38, -96];
      strike.fKnee = [12, -72]; strike.fFoot = [-2, -34];
      strike.bKnee = [-14, -64]; strike.bFoot = [-26, -28];
      return lerpPose(wind, strike, ext);
    }
    if (f.moveKey === 'spin') {
      const p = basePose();
      const a = f.spinAngle;
      const hip = [0, -84];
      const leg = (ang, len) => [hip[0] + Math.cos(ang) * len, Math.max(-18, hip[1] + Math.sin(ang) * len)];
      p.hip = hip;
      p.chest = [2, -128]; p.head = [4, -164];
      p.fHip = [4, -84]; p.bHip = [-4, -84];
      p.fKnee = leg(a, 46); p.fFoot = leg(a, 102);
      p.bKnee = leg(a + Math.PI, 38); p.bFoot = leg(a + Math.PI, 82);
      p.fShoulder = [12, -130]; p.fElbow = [42, -142]; p.fFist = [66, -154];
      p.bShoulder = [-10, -130]; p.bElbow = [-42, -142]; p.bFist = [-64, -154];
      return p;
    }
    return basePose();
  }

  function poseFor(f, time) {
    if (f.state === 'ko') {
      const p = basePose();
      p.hip = [20, -20]; p.chest = [-24, -28]; p.head = [-62, -30];
      p.fHip = [18, -18]; p.fKnee = [54, -16]; p.fFoot = [84, -10];
      p.bHip = [24, -22]; p.bKnee = [54, -32]; p.bFoot = [78, -38];
      p.fShoulder = [-18, -34]; p.fElbow = [-48, -42]; p.fFist = [-72, -28];
      p.bShoulder = [-20, -28]; p.bElbow = [-46, -20]; p.bFist = [-68, -10];
      return p;
    }
    if (f.state === 'win') {
      const p = basePose();
      const b = Math.sin(time * 4) * 2;
      p.fShoulder = [12, -132]; p.fElbow = [22, -166]; p.fFist = [30, -198 + b];
      p.bShoulder = [-12, -132]; p.bElbow = [-22, -166]; p.bFist = [-30, -198 + b];
      p.chest = [0, -128]; p.head = [2, -166];
      p.fKnee = [18, -44]; p.fFoot = [24, -3]; p.bKnee = [-18, -44]; p.bFoot = [-26, -3];
      return p;
    }
    if (f.state === 'hit') {
      const p = basePose();
      const j = Math.sin(time * 55) * 1.5;
      p.chest = [-10, -122]; p.head = [-22 + j, -155];
      p.fElbow = [8, -108]; p.fFist = [14, -92];
      p.bElbow = [-34, -110]; p.bFist = [-46, -98];
      p.fKnee = [12, -44]; p.fFoot = [20, -3];
      p.bKnee = [-24, -42]; p.bFoot = [-34, -3];
      return p;
    }
    if (f.state === 'jump') {
      const p = basePose();
      p.hip = [0, -94]; p.chest = [-4, -136]; p.head = [-6, -172];
      p.fKnee = [28, -92]; p.fFoot = [40, -64];
      p.bKnee = [-18, -88]; p.bFoot = [-34, -62];
      p.fElbow = [24, -116]; p.fFist = [38, -100];
      p.bElbow = [-26, -116]; p.bFist = [-40, -100];
      return p;
    }
    if (f.state === 'block') {
      const p = basePose();
      p.chest = [-4, -124]; p.head = [-4, -160];
      p.fShoulder = [6, -128]; p.fElbow = [18, -114]; p.fFist = [10, -142];
      p.bShoulder = [-8, -128]; p.bElbow = [2, -108]; p.bFist = [22, -126];
      p.fKnee = [20, -42]; p.fFoot = [28, -3];
      p.bKnee = [-18, -42]; p.bFoot = [-30, -3];
      return p;
    }
    if (f.state === 'walk') {
      const p = basePose();
      const s = Math.sin(f.walkPhase);
      const bob = Math.abs(s) * 2.5;
      p.chest[1] += bob; p.head[1] += bob; p.fShoulder[1] += bob; p.bShoulder[1] += bob;
      p.fElbow[1] += bob; p.fFist[1] += bob; p.bElbow[1] += bob; p.bFist[1] += bob;
      p.fKnee = [15 + s * 9, -44]; p.fFoot = [19 + s * 19, -3 - Math.max(0, s) * 7];
      p.bKnee = [-15 - s * 9, -44]; p.bFoot = [-19 - s * 19, -3 - Math.max(0, -s) * 7];
      p.chest[0] = s * 2; p.head[0] = s * 3;
      p.fFist[0] = 34 + s * 3; p.bFist[0] = -34 - s * 3;
      return p;
    }
    if (f.state === 'attack') return attackPose(f, time);
    const p = basePose();
    const b = Math.sin(time * 3.1 + f.phase) * 1.8;
    breathe(p, b);
    p.head[0] = Math.sin(time * 1.7 + f.phase) * 1.2;
    p.fFist[0] = 34 + Math.sin(time * 2.2 + f.phase) * 1.4;
    return p;
  }

  // ---------------------------------------------------------------------------
  // Character rendering
  // ---------------------------------------------------------------------------
  function limb(a, b, width, color, outline = true) {
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    if (outline) {
      ctx.strokeStyle = '#08060f'; ctx.lineWidth = width + 5;
      ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
    }
    ctx.strokeStyle = color; ctx.lineWidth = width;
    ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,.11)'; ctx.lineWidth = Math.max(1, width * 0.22);
    ctx.beginPath(); ctx.moveTo(a[0] - width * 0.12, a[1] - 1); ctx.lineTo(b[0] - width * 0.12, b[1] - 1); ctx.stroke();
  }

  function drawFoot(pt, c, angle) {
    ctx.save();
    ctx.translate(pt[0] + 6, pt[1] - 3);
    ctx.rotate(angle);
    ctx.fillStyle = '#08060f';
    ctx.beginPath(); ctx.ellipse(0, 0, 17, 9, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = c.shoe;
    ctx.beginPath(); ctx.ellipse(0, -1, 14, 6.5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.16)';
    ctx.beginPath(); ctx.ellipse(-2, -4, 8, 2, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  function drawFist(pt, c, flat) {
    ctx.fillStyle = '#08060f';
    ctx.beginPath(); ctx.arc(pt[0], pt[1], 10.5, 0, Math.PI * 2); ctx.fill();
    if (flat) {
      ctx.fillStyle = c.skin;
    } else {
      const gr = ctx.createRadialGradient(pt[0] - 3, pt[1] - 4, 1, pt[0], pt[1], 10);
      gr.addColorStop(0, c.skin); gr.addColorStop(1, c.skinDark);
      ctx.fillStyle = gr;
    }
    ctx.beginPath(); ctx.arc(pt[0], pt[1], 8, 0, Math.PI * 2); ctx.fill();
  }

  function drawTorso(p, c, flat) {
    const ch = p.chest, hip = p.hip;
    ctx.beginPath();
    ctx.moveTo(ch[0] - 23, ch[1] - 5);
    ctx.quadraticCurveTo(ch[0] - 29, ch[1] + 20, hip[0] - 18, hip[1] - 2);
    ctx.lineTo(hip[0] + 18, hip[1] - 2);
    ctx.quadraticCurveTo(ch[0] + 29, ch[1] + 20, ch[0] + 23, ch[1] - 5);
    ctx.quadraticCurveTo(ch[0], ch[1] - 13, ch[0] - 23, ch[1] - 5);
    ctx.closePath();
    if (flat) {
      ctx.fillStyle = c.gi;
    } else {
      const gr = ctx.createLinearGradient(ch[0], ch[1] - 12, hip[0], hip[1] + 12);
      gr.addColorStop(0, c.giLight); gr.addColorStop(0.35, c.gi); gr.addColorStop(1, c.giDark);
      ctx.fillStyle = gr;
    }
    ctx.fill();
    ctx.strokeStyle = '#08060f'; ctx.lineWidth = 5; ctx.stroke();

    // gi skirt
    ctx.beginPath();
    ctx.moveTo(hip[0] - 19, hip[1] - 2);
    ctx.lineTo(hip[0] - 25, hip[1] + 24);
    ctx.quadraticCurveTo(hip[0], hip[1] + 30, hip[0] + 25, hip[1] + 24);
    ctx.lineTo(hip[0] + 19, hip[1] - 2);
    ctx.closePath();
    ctx.fillStyle = c.giDark; ctx.fill();
    ctx.strokeStyle = '#08060f'; ctx.lineWidth = 5; ctx.stroke();

    // belt
    ctx.save();
    ctx.translate(hip[0], hip[1] + 1);
    ctx.rotate(-0.05);
    ctx.fillStyle = c.belt;
    ctx.fillRect(-21, -6, 42, 11);
    ctx.strokeStyle = '#08060f'; ctx.lineWidth = 3; ctx.strokeRect(-21, -6, 42, 11);
    ctx.fillStyle = c.beltDark; ctx.fillRect(-6, -6, 8, 11);
    ctx.restore();
    // belt tails
    ctx.strokeStyle = c.belt; ctx.lineWidth = 5; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(hip[0] + 10, hip[1] + 7); ctx.lineTo(hip[0] + 15, hip[1] + 26); ctx.stroke();
    ctx.strokeStyle = '#08060f'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(hip[0] + 10, hip[1] + 7); ctx.lineTo(hip[0] + 15, hip[1] + 26); ctx.stroke();

    // lapel / chest details
    ctx.strokeStyle = c.trim; ctx.lineWidth = 3; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(ch[0] - 17, ch[1] - 4); ctx.lineTo(ch[0] + 1, ch[1] + 26); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(ch[0] + 17, ch[1] - 4); ctx.lineTo(ch[0] - 1, ch[1] + 26); ctx.stroke();
    ctx.strokeStyle = 'rgba(0,0,0,.35)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(ch[0] + 8, ch[1] + 2); ctx.lineTo(hip[0] + 8, hip[1] - 5); ctx.stroke();
  }

  function drawHead(p, c, time, f, flat) {
    const [hx, hy] = p.head;
    // neck
    limb([p.chest[0] + 2, p.chest[1] - 4], [hx, hy + 16], 12, c.skinDark);

    // headband tails behind
    ctx.save();
    ctx.strokeStyle = c.band; ctx.lineWidth = 4; ctx.lineCap = 'round';
    for (let i = 0; i < 2; i++) {
      const w = Math.sin(time * 8 + i * 1.6 + f.phase) * 4;
      ctx.beginPath();
      ctx.moveTo(hx - 16, hy - 2 + i * 4);
      ctx.quadraticCurveTo(hx - 29, hy + 3 + w + i * 5, hx - 39 - i * 4, hy + 10 + w + i * 7);
      ctx.stroke();
    }
    ctx.restore();

    // skull
    ctx.fillStyle = '#08060f';
    ctx.beginPath(); ctx.arc(hx, hy, 21, 0, Math.PI * 2); ctx.fill();
    if (flat) {
      ctx.fillStyle = c.skin;
    } else {
      const gr = ctx.createRadialGradient(hx - 6, hy - 7, 2, hx, hy, 20);
      gr.addColorStop(0, c.skin); gr.addColorStop(1, c.skinDark);
      ctx.fillStyle = gr;
    }
    ctx.beginPath(); ctx.arc(hx, hy, 18.5, 0, Math.PI * 2); ctx.fill();

    // ear
    ctx.fillStyle = c.skinDark;
    ctx.beginPath(); ctx.ellipse(hx - 14, hy + 3, 4, 6, -0.2, 0, Math.PI * 2); ctx.fill();

    // hair
    ctx.fillStyle = c.hair;
    ctx.beginPath();
    if (f.hairStyle === 'spiky') {
      ctx.moveTo(hx - 19, hy - 2);
      ctx.lineTo(hx - 16, hy - 18); ctx.lineTo(hx - 8, hy - 15);
      ctx.lineTo(hx - 5, hy - 26); ctx.lineTo(hx + 4, hy - 18);
      ctx.lineTo(hx + 10, hy - 25); ctx.lineTo(hx + 14, hy - 14);
      ctx.lineTo(hx + 20, hy - 16); ctx.lineTo(hx + 17, hy - 2);
      ctx.quadraticCurveTo(hx, hy - 16, hx - 19, hy - 2);
    } else {
      ctx.moveTo(hx - 19, hy + 4);
      ctx.quadraticCurveTo(hx - 24, hy - 20, hx - 2, hy - 20);
      ctx.quadraticCurveTo(hx + 21, hy - 20, hx + 18, hy - 1);
      ctx.lineTo(hx + 24, hy - 8); ctx.lineTo(hx + 20, hy + 2);
      ctx.quadraticCurveTo(hx + 6, hy - 13, hx - 19, hy + 4);
    }
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#08060f'; ctx.lineWidth = 3; ctx.stroke();
    ctx.fillStyle = c.hairLight;
    ctx.globalAlpha = 0.5;
    ctx.beginPath(); ctx.ellipse(hx - 1, hy - 14, 10, 3.5, -0.25, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 1;

    // headband
    ctx.save();
    ctx.translate(hx, hy - 6);
    ctx.rotate(-0.08);
    ctx.fillStyle = c.band;
    ctx.fillRect(-19, -4, 38, 8);
    ctx.strokeStyle = '#08060f'; ctx.lineWidth = 2.5; ctx.strokeRect(-19, -4, 38, 8);
    ctx.fillStyle = c.bandDark;
    ctx.fillRect(-19, 2, 38, 2.5);
    ctx.restore();

    // face
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.ellipse(hx + 8, hy - 1, 5.2, 3.5, -0.08, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = c.eye;
    ctx.beginPath(); ctx.arc(hx + 9.6, hy - 0.5, 2.2, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.85)';
    ctx.beginPath(); ctx.arc(hx + 10.2, hy - 1.5, 0.8, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#08060f'; ctx.lineWidth = 2.2; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(hx + 4, hy - 6); ctx.lineTo(hx + 14, hy - 5); ctx.stroke();
    // nose & mouth
    ctx.strokeStyle = c.skinDark; ctx.lineWidth = 1.8;
    ctx.beginPath(); ctx.moveTo(hx + 17, hy + 1); ctx.lineTo(hx + 20, hy + 5); ctx.lineTo(hx + 17, hy + 6); ctx.stroke();
    ctx.strokeStyle = '#6d3428'; ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.moveTo(hx + 8, hy + 11); ctx.lineTo(hx + 14, hy + 10); ctx.stroke();
    if (f.scar) {
      ctx.strokeStyle = c.skinDark; ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.moveTo(hx + 2, hy - 8); ctx.lineTo(hx + 7, hy + 2); ctx.stroke();
    }
  }

  function drawBody(p, f, time, alpha = 1, flat = false) {
    const c = f.colors;
    ctx.globalAlpha = alpha;
    // back leg
    limb(p.bHip, p.bKnee, 17, c.pantsDark);
    limb(p.bKnee, p.bFoot, 13, c.pantsDark);
    drawFoot(p.bFoot, { shoe: '#0a0a10' }, Math.atan2(p.bFoot[1] - p.bKnee[1], p.bFoot[0] - p.bKnee[0]) + Math.PI / 2);
    // back arm
    limb(p.bShoulder, p.bElbow, 14, c.style === 'gi' ? c.giDark : c.skinDark);
    limb(p.bElbow, p.bFist, 11, c.skinDark);
    drawFist(p.bFist, { skin: c.skinDark, skinDark: c.skinDark }, flat);
    // torso
    drawTorso(p, c, flat);
    // front leg
    limb(p.fHip, p.fKnee, 19, c.pants);
    limb(p.fKnee, p.fFoot, 14, c.pants);
    drawFoot(p.fFoot, c, Math.atan2(p.fFoot[1] - p.fKnee[1], p.fFoot[0] - p.fKnee[0]) + Math.PI / 2);
    // front arm
    limb(p.fShoulder, p.fElbow, 15, c.style === 'gi' ? c.gi : c.skin);
    limb(p.fElbow, p.fFist, 12, c.skin);
    drawFist(p.fFist, c, flat);
    // arm details
    if (c.style === 'vest') {
      ctx.strokeStyle = c.giDark; ctx.lineWidth = 3; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(p.fShoulder[0] - 2, p.fShoulder[1] + 4); ctx.lineTo(p.fElbow[0] - 3, p.fElbow[1] - 4); ctx.stroke();
      ctx.strokeStyle = 'rgba(20,12,10,.5)'; ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.arc(p.fShoulder[0] + 2, p.fShoulder[1] + 12, 7, 0.4, 2.2); ctx.stroke();
    } else {
      // wrist wrap
      ctx.strokeStyle = c.trim; ctx.lineWidth = 4; ctx.lineCap = 'round';
      const wx = lerp(p.fElbow[0], p.fFist[0], 0.78), wy = lerp(p.fElbow[1], p.fFist[1], 0.78);
      ctx.beginPath(); ctx.moveTo(wx - 3, wy - 4); ctx.lineTo(wx + 3, wy + 4); ctx.stroke();
    }
    drawHead(p, c, time, f, flat);
    ctx.globalAlpha = 1;
  }

  function drawFighter(f, time) {
    const air = Math.max(0, -f.y);
    // shadow
    ctx.save();
    const ss = 1 - Math.min(0.5, air / 520);
    ctx.globalAlpha = 0.38 * ss;
    ctx.fillStyle = '#000';
    ctx.beginPath(); ctx.ellipse(f.x, GROUND + 5, 56 * ss, 11 * ss, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();

    // aura while charging
    if (f.state === 'attack' && f.move && f.move.special && f.moveT < f.move.startup + 0.05) {
      const a = 1 - f.moveT / Math.max(0.01, f.move.startup + 0.05);
      const gr = ctx.createRadialGradient(f.x, GROUND + f.y - 95, 10, f.x, GROUND + f.y - 95, 120);
      gr.addColorStop(0, (f.move.color || '#fff') + '66');
      gr.addColorStop(1, (f.move.color || '#fff') + '00');
      ctx.globalAlpha = a * 0.85;
      ctx.fillStyle = gr;
      ctx.beginPath(); ctx.arc(f.x, GROUND + f.y - 95, 120, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = 1;
    }

    // afterimages
    for (const t of f.trail) {
      ctx.save();
      ctx.translate(t.x, GROUND + t.y);
      ctx.scale(t.facing * SCALE, SCALE);
      drawBody(t.pose, f, time, t.alpha, true);
      ctx.restore();
    }

    const pose = f.pose || (f.pose = poseFor(f, time));
    ctx.save();
    ctx.translate(f.x, GROUND + f.y);
    ctx.scale(f.facing * SCALE, SCALE);
    if (f.state === 'ko') ctx.scale(1, 0.92);
    if (f.state === 'attack' && f.moveKey === 'spin') {
      ctx.translate(0, -84); ctx.rotate(Math.sin(f.moveT * 26) * 0.16); ctx.translate(0, 84);
    }
    drawBody(pose, f, time, 1);
    ctx.restore();

    // move callout
    if (f.state === 'attack' && f.move && f.move.special && f.moveT < 0.62) {
      const p = f.moveT / 0.62;
      ctx.save();
      ctx.globalAlpha = p < 0.12 ? p / 0.12 : p > 0.72 ? (1 - p) / 0.28 : 1;
      ctx.translate(f.x, GROUND + f.y - 248 - p * 18);
      ctx.rotate(-0.04);
      ctx.textAlign = 'center';
      ctx.font = 'italic 900 30px "Arial Black", Impact, sans-serif';
      ctx.lineWidth = 8; ctx.strokeStyle = '#08060f'; ctx.lineJoin = 'round';
      ctx.strokeText(f.move.callout, 0, 0);
      ctx.fillStyle = f.move.color || '#fff';
      ctx.fillText(f.move.callout, 0, 0);
      ctx.restore();
    }
  }

  // ---------------------------------------------------------------------------
  // Particles / effects
  // ---------------------------------------------------------------------------
  const particles = [];
  const projectiles = [];
  const effects = { flash: null, shake: 0, shakeT: 0, shakeMax: 0, announcement: null, hitstop: 0, zoom: 1 };

  function addParticle(o) {
    if (particles.length > 420) particles.shift();
    particles.push(Object.assign({
      x: 0, y: 0, vx: 0, vy: 0, life: 0.5, max: 0.5, size: 4, color: '#fff',
      gravity: 0, drag: 0.9, type: 'dot', text: '', rot: 0, vr: 0
    }, o, { max: o.life || 0.5 }));
  }

  function hitSparks(x, y, color, power = 1, blocked = false) {
    addParticle({ type: 'ring', x, y, life: 0.3, size: 8, color, vx: 0, vy: 0 });
    addParticle({ type: 'ring', x, y, life: 0.45, size: 4, color: '#ffffff', vx: 0, vy: 0 });
    const n = blocked ? 8 : Math.round(16 * power);
    for (let i = 0; i < n; i++) {
      const a = rand(0, Math.PI * 2), sp = rand(140, 520) * power;
      addParticle({
        type: 'spark', x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 60,
        life: rand(0.16, 0.42), size: rand(1.5, 3.6), color: Math.random() > 0.55 ? '#fff' : color,
        gravity: 900, drag: 0.93
      });
    }
    if (!blocked) {
      addParticle({ type: 'slash', x, y, life: 0.18, size: 70 * power, color: '#fff', rot: rand(-1, 1), vr: rand(-2, 2) });
    }
  }

  function dust(x, y, amount = 6, color = '#8b7a92') {
    for (let i = 0; i < amount; i++) {
      addParticle({
        type: 'dot', x: x + rand(-18, 18), y: y + rand(-4, 2),
        vx: rand(-90, 90), vy: rand(-120, -20), life: rand(0.25, 0.6),
        size: rand(2, 6), color, gravity: -30, drag: 0.9
      });
    }
  }

  function floatText(x, y, text, color, size = 26) {
    addParticle({ type: 'text', x, y, vx: rand(-18, 18), vy: -95, life: 0.9, text, color, size, gravity: 20, drag: 0.96 });
  }

  function screenShake(amount, duration = 0.25) {
    effects.shake = Math.max(effects.shake, amount);
    effects.shakeMax = Math.max(effects.shakeMax, amount);
    effects.shakeT = Math.max(effects.shakeT, duration);
  }

  function screenFlash(color, alpha = 0.5) {
    effects.flash = { color, alpha, max: alpha };
  }

  function announce(text, color = '#fff', dur = 1.3, sub = '') {
    effects.announcement = { text, color, dur, sub, t: 0 };
  }

  function updateEffects(dt, realDt) {
    if (effects.flash) {
      effects.flash.alpha -= realDt * 2.4;
      if (effects.flash.alpha <= 0) effects.flash = null;
    }
    if (effects.shakeT > 0) {
      effects.shakeT -= realDt;
      if (effects.shakeT <= 0) { effects.shake = 0; effects.shakeMax = 0; }
    }
    if (effects.announcement) {
      effects.announcement.t += realDt;
      if (effects.announcement.t > effects.announcement.dur) effects.announcement = null;
    }
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.life -= dt;
      if (p.life <= 0) { particles.splice(i, 1); continue; }
      p.vy += p.gravity * dt;
      p.vx *= Math.pow(p.drag, dt * 60);
      p.vy *= Math.pow(p.drag, dt * 60);
      p.x += p.vx * dt; p.y += p.vy * dt;
      p.rot += p.vr * dt;
    }
    for (let i = projectiles.length - 1; i >= 0; i--) {
      projectiles[i].update(dt);
      if (projectiles[i].dead) projectiles.splice(i, 1);
    }
  }

  function drawParticles() {
    ctx.save();
    for (const p of particles) {
      const a = clamp(p.life / p.max, 0, 1);
      ctx.globalAlpha = a;
      if (p.type === 'spark') {
        ctx.globalCompositeOperation = 'lighter';
        ctx.strokeStyle = p.color; ctx.lineWidth = p.size; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x - p.vx * 0.022, p.y - p.vy * 0.022); ctx.stroke();
        ctx.globalCompositeOperation = 'source-over';
      } else if (p.type === 'ring') {
        ctx.globalCompositeOperation = 'lighter';
        ctx.strokeStyle = p.color; ctx.lineWidth = 3 * a + 1;
        const r = p.size + (1 - a) * 52;
        ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, Math.PI * 2); ctx.stroke();
        ctx.globalCompositeOperation = 'source-over';
      } else if (p.type === 'slash') {
        ctx.globalCompositeOperation = 'lighter';
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot);
        ctx.strokeStyle = p.color; ctx.lineWidth = 5 * a + 1;
        ctx.beginPath(); ctx.arc(0, 0, p.size, -0.5, 0.9); ctx.stroke();
        ctx.restore(); ctx.globalCompositeOperation = 'source-over';
      } else if (p.type === 'text') {
        ctx.font = `italic 900 ${p.size}px "Arial Black", Impact, sans-serif`;
        ctx.textAlign = 'center';
        ctx.lineWidth = 6; ctx.strokeStyle = '#08060f'; ctx.strokeText(p.text, p.x, p.y);
        ctx.fillStyle = p.color; ctx.fillText(p.text, p.x, p.y);
      } else {
        ctx.fillStyle = p.color;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size * (0.4 + a * 0.6), 0, Math.PI * 2); ctx.fill();
      }
    }
    ctx.restore();
  }

  class Projectile {
    constructor(owner, x, y, dir, color) {
      this.owner = owner; this.x = x; this.y = y; this.vx = dir * 660; this.dir = dir;
      this.life = 2.2; this.radius = 19; this.dead = false; this.color = color; this.t = 0;
    }
    update(dt) {
      this.t += dt; this.life -= dt;
      this.x += this.vx * dt;
      if (Math.random() < 0.9) {
        addParticle({
          type: 'dot', x: this.x - this.dir * 10 + rand(-6, 6), y: this.y + rand(-9, 9),
          vx: -this.dir * rand(40, 150), vy: rand(-60, 60), life: rand(0.2, 0.5),
          size: rand(2, 6), color: Math.random() > 0.5 ? this.color : '#ffffff', drag: 0.92
        });
      }
      const target = this.owner === game.player ? game.cpu : game.player;
      if (target && target.state !== 'ko' && target.invuln <= 0) {
        const hb = target.hurtbox();
        if (this.x + this.radius > hb.x && this.x - this.radius < hb.x + hb.w &&
            this.y + this.radius > hb.y && this.y - this.radius < hb.y + hb.h) {
          resolveHit(this.owner, target, MOVES.fireball, { x: this.x, y: this.y }, true);
          this.explode();
          return;
        }
      }
      for (const p of projectiles) {
        if (p !== this && !p.dead && p.owner !== this.owner) {
          if (Math.hypot(p.x - this.x, p.y - this.y) < p.radius + this.radius) {
            p.explode(); this.explode();
            return;
          }
        }
      }
      if (this.life <= 0 || this.x < -80 || this.x > W + 80) this.dead = true;
    }
    explode() {
      this.dead = true;
      hitSparks(this.x, this.y, this.color, 0.9);
      screenFlash(this.color, 0.18);
      audio.hit(false);
    }
    draw() {
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      const pulse = 1 + Math.sin(this.t * 22) * 0.08;
      const gr = ctx.createRadialGradient(this.x, this.y, 2, this.x, this.y, 62 * pulse);
      gr.addColorStop(0, '#ffffff');
      gr.addColorStop(0.18, this.color);
      gr.addColorStop(0.55, this.color + '77');
      gr.addColorStop(1, this.color + '00');
      ctx.fillStyle = gr;
      ctx.beginPath(); ctx.arc(this.x, this.y, 62 * pulse, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2; ctx.globalAlpha = 0.8;
      ctx.beginPath(); ctx.arc(this.x, this.y, 14, this.t * 9, this.t * 9 + 2.1); ctx.stroke();
      ctx.beginPath(); ctx.arc(this.x, this.y, 9, -this.t * 12, -this.t * 12 + 1.6); ctx.stroke();
      ctx.restore();
    }
  }

  // ---------------------------------------------------------------------------
  // Fighter
  // ---------------------------------------------------------------------------
  class Fighter {
    constructor(opts) {
      this.name = opts.name;
      this.colors = opts.colors;
      this.x = opts.x;
      this.facing = opts.facing;
      this.isCPU = !!opts.isCPU;
      this.hairStyle = opts.hairStyle || 'spiky';
      this.scar = !!opts.scar;
      this.phase = opts.phase || 0;
      this.control = { left: false, right: false, block: false };
      this.meter = 40;
      this.maxCombo = 0;
      this.t = 0;
      this.reset(this.x, this.facing);
    }
    reset(x, facing) {
      this.x = x; this.facing = facing;
      this.health = 100; this.ghost = 100;
      this.y = 0; this.vy = 0; this.vx = 0;
      this.state = 'idle'; this.move = null; this.moveKey = null; this.moveT = 0;
      this.hitTimer = 0; this.invuln = 0; this.flash = 0;
      this.walkPhase = 0; this.combo = 0; this.comboTimer = 0;
      this.trail = []; this.trailTimer = 0; this.spinAngle = 0;
      this.hasHit = false; this.hitCount = 0; this.lastHitT = -1;
      this.spawned = false; this.rose = false; this.pose = null;
      this.control.left = this.control.right = this.control.block = false;
    }
    get grounded() { return this.y >= -0.01; }
    canAct() { return this.grounded && !this.move && (this.state === 'idle' || this.state === 'walk' || this.state === 'block'); }
    hurtbox() {
      if (this.state === 'ko') return { x: this.x - 72, y: GROUND - 58, w: 144, h: 62 };
      const h = this.state === 'block' ? 152 : 178;
      return { x: this.x - 33, y: GROUND + this.y - h, w: 66, h };
    }
    attackBox() {
      const m = this.move; if (!m) return null;
      const x0 = this.x + this.facing * m.ox;
      return { x: this.facing > 0 ? x0 : x0 - m.w, y: GROUND + this.y + m.y, w: m.w, h: m.h };
    }
    tryJump() {
      if (game.mode !== 'fight' || !this.canAct()) return false;
      this.state = 'jump'; this.y = -1; this.vy = -755;
      const dir = (this.control.right ? 1 : 0) - (this.control.left ? 1 : 0);
      this.vx = dir * 245;
      dust(this.x, GROUND, 5);
      audio.whoosh(false);
      return true;
    }
    tryAttack(kind) {
      if (game.mode !== 'fight') return false;
      if (!this.grounded) {
        if (kind === 'punch' || kind === 'kick') return this.startAttack('jumpkick');
        return false;
      }
      if (!this.canAct()) return false;
      return this.startAttack(kind);
    }
    trySpecial(key) {
      if (game.mode !== 'fight' || !this.canAct()) return false;
      const m = MOVES[key]; if (!m) return false;
      if (this.meter < m.cost) {
        if (!this.isCPU) {
          floatText(this.x, GROUND - 210, 'NEED SP', '#ffd166', 18);
          dom.p1sp.classList.remove('pulse'); void dom.p1sp.offsetWidth; dom.p1sp.classList.add('pulse');
        }
        audio.error();
        return false;
      }
      this.meter -= m.cost;
      this.startAttack(key);
      return true;
    }
    startAttack(key) {
      const m = MOVES[key]; if (!m) return false;
      this.state = 'attack'; this.move = m; this.moveKey = key; this.moveT = 0;
      this.hasHit = false; this.hitCount = 0; this.lastHitT = -1;
      this.spawned = false; this.rose = false; this.vx = 0; this.pose = null;
      this.trail = []; this.trailTimer = 0; this.spinAngle = 0;
      if (m.invuln) this.invuln = m.invuln;
      if (key === 'fireball') audio.fireball();
      else if (key === 'uppercut') audio.uppercut();
      else if (key === 'spin') audio.spin();
      else audio.whoosh(key === 'kick');
      return true;
    }
    endAttack() {
      this.move = null; this.moveKey = null; this.moveT = 0;
      this.state = this.grounded ? 'idle' : 'jump';
      this.trail = [];
      this.spinAngle = 0;
    }
    updateAttack(dt, opp) {
      const m = this.move;
      if (!m) { this.state = 'idle'; return; }
      this.moveT += dt;
      if (this.moveKey === 'spin') this.spinAngle = this.moveT * 18;
      if (m.rise && !this.rose && this.moveT >= m.startup) {
        this.rose = true; this.vy = -735; this.y = -2;
        screenShake(4, 0.16);
      }
      if (m.projectile && !this.spawned && this.moveT >= m.startup) {
        this.spawned = true;
        const col = this === game.player ? '#4de3ff' : '#ff4d8b';
        projectiles.push(new Projectile(this, this.x + this.facing * 62, GROUND + this.y - 112, this.facing, col));
        screenShake(3, 0.15);
      }
      if (m.dash && this.moveT >= m.startup && this.moveT <= m.startup + m.active) {
        this.vx = this.facing * m.dash;
      } else if (this.grounded) {
        this.vx *= Math.pow(0.001, dt);
      }
      if (!m.projectile && this.moveT >= m.startup && this.moveT <= m.startup + m.active) {
        this.checkHit(opp);
      }
      if (m.special && (this.moveKey === 'spin' || this.moveKey === 'uppercut')) {
        this.trailTimer -= dt;
        if (this.trailTimer <= 0) {
          this.trailTimer = 0.045;
          const p = this.pose || poseFor(this, this.t);
          this.trail.push({ x: this.x, y: this.y, facing: this.facing, pose: clonePose(p), alpha: 0.22 });
          if (this.trail.length > 5) this.trail.shift();
        }
      }
      if (this.moveT >= moveTotal(m) && (this.grounded || !m.rise)) this.endAttack();
    }
    checkHit(opp) {
      if (!opp || opp.state === 'ko') return;
      const m = this.move;
      if (!m || m.projectile) return;
      if (m.hits) {
        if (this.hitCount >= m.hits) return;
        if (this.lastHitT >= 0 && this.moveT - this.lastHitT < m.hitInterval) return;
      } else if (this.hasHit) return;
      if (opp.invuln > 0) return;
      const box = this.attackBox(); const hb = opp.hurtbox();
      if (!box || box.x > hb.x + hb.w || box.x + box.w < hb.x || box.y > hb.y + hb.h || box.y + box.h < hb.y) return;
      if (m.hits) { this.lastHitT = this.moveT; this.hitCount++; }
      else this.hasHit = true;
      resolveHit(this, opp, m, box, false);
    }
    updateMovement(dt) {
      if (this.state === 'win' || this.state === 'ko' || this.state === 'hit') {
        if (this.grounded) this.vx *= Math.pow(0.02, dt);
        return;
      }
      if (this.state === 'jump') {
        const dir = (this.control.right ? 1 : 0) - (this.control.left ? 1 : 0);
        if (dir) this.vx += dir * 380 * dt;
        this.vx = clamp(this.vx, -330, 330);
        return;
      }
      const active = game.mode === 'fight';
      const dir = active ? ((this.control.right ? 1 : 0) - (this.control.left ? 1 : 0)) : 0;
      if (!this.grounded) return;
      if (active && this.control.block) {
        this.state = 'block';
        this.vx *= Math.pow(0.001, dt);
      } else if (dir !== 0) {
        this.state = 'walk';
        this.vx = dir * 238;
        this.walkPhase += dt * 11.5;
        if (Math.random() < dt * 5) dust(this.x - dir * 14, GROUND, 1, '#5f536b');
      } else {
        this.state = 'idle';
        this.vx *= Math.pow(0.001, dt);
      }
    }
    update(dt, opp) {
      this.t += dt;
      if (this.comboTimer > 0) this.comboTimer -= dt;
      if (this.invuln > 0) this.invuln -= dt;
      if (this.flash > 0) this.flash -= dt;
      this.ghost = Math.max(this.health, this.ghost - dt * 42);
      for (let i = this.trail.length - 1; i >= 0; i--) {
        this.trail[i].alpha -= dt * 1.4;
        if (this.trail[i].alpha <= 0.02) this.trail.splice(i, 1);
      }
      if (this.grounded && !this.move && opp && (this.state === 'idle' || this.state === 'walk' || this.state === 'block')) {
        this.facing = opp.x >= this.x ? 1 : -1;
      }
      if (this.state === 'attack') this.updateAttack(dt, opp);
      else if (this.state === 'hit') {
        this.hitTimer -= dt;
        if (this.hitTimer <= 0) this.state = 'idle';
        if (this.grounded) this.vx *= Math.pow(0.08, dt);
      } else if (this.state === 'ko') {
        if (this.grounded) this.vx *= Math.pow(0.06, dt);
      } else {
        this.updateMovement(dt);
      }
      // vertical physics
      if (!this.grounded || this.vy !== 0) {
        this.vy += 2250 * dt;
        this.y += this.vy * dt;
        if (this.y >= 0) {
          const wasAir = this.state === 'jump' || (this.state === 'attack' && this.move && (this.move.air || this.move.rise));
          this.y = 0; this.vy = 0;
          if (wasAir) {
            dust(this.x, GROUND, 7);
            if (this.state === 'jump') { this.state = 'idle'; audio.whoosh(false); }
            else if (this.state === 'attack') this.endAttack();
          }
        }
      }
      this.x += this.vx * dt;
      this.x = clamp(this.x, STAGE_L + 30, STAGE_R - 30);
      this.pose = poseFor(this, this.t);
    }
  }

  // ---------------------------------------------------------------------------
  // Game state
  // ---------------------------------------------------------------------------
  const game = {
    mode: 'title', paused: false, time: 0, timer: 60, round: 1,
    wins: { player: 0, cpu: 0 }, stats: { playerSpecials: 0, cpuSpecials: 0 },
    introT: 0, koT: 0, roundEndT: 0, koWinner: null, roundWinner: null, timeScale: 1
  };

  game.player = new Fighter({ name: 'KAI', colors: COLORS.kai, x: 800, facing: 1, hairStyle: 'spiky', phase: 0 });
  game.cpu = new Fighter({ name: 'RAZE', colors: COLORS.raze, x: 1040, facing: -1, hairStyle: 'swept', scar: true, phase: 2.1, isCPU: true });
  const player = game.player, cpu = game.cpu;

  function separateFighters() {
    if (player.state === 'ko' || cpu.state === 'ko') return;
    if (!player.grounded || !cpu.grounded) return;
    const dx = cpu.x - player.x;
    const min = 62;
    if (Math.abs(dx) < min) {
      const push = (min - Math.abs(dx)) / 2;
      const s = dx >= 0 ? 1 : -1;
      player.x -= push * s; cpu.x += push * s;
      player.x = clamp(player.x, STAGE_L + 30, STAGE_R - 30);
      cpu.x = clamp(cpu.x, STAGE_L + 30, STAGE_R - 30);
    }
  }

  function resolveHit(attacker, defender, move, hitbox, isProjectile) {
    if (defender.invuln > 0 || defender.state === 'ko') return;
    const blocked = defender.grounded && defender.control.block &&
      defender.state !== 'hit' && defender.state !== 'attack' && defender.state !== 'ko';
    const hx = hitbox ? hitbox.x + (hitbox.w || 0) / 2 : defender.x;
    const hy = hitbox ? hitbox.y + (hitbox.h || 0) / 2 : GROUND - 120;
    const heavy = move.dmg >= 10 || !!move.special;
    const color = move.color || (attacker === player ? '#4de3ff' : '#ff5c8a');

    if (blocked) {
      const chip = move.chip || 0;
      if (chip) {
        defender.ghost = Math.max(defender.ghost, defender.health);
        defender.health = Math.max(0, defender.health - chip);
      }
      defender.state = 'block'; defender.hitTimer = move.blockstun;
      defender.vx = attacker.facing * move.kb * 0.3;
      attacker.meter = clamp(attacker.meter + 2, 0, 100);
      defender.meter = clamp(defender.meter + 3, 0, 100);
      hitSparks(hx, hy, '#8be9ff', 0.7, true);
      audio.block();
      effects.hitstop = Math.max(effects.hitstop, 0.035);
      screenShake(3, 0.12);
      if (defender.health <= 0) triggerKO(defender, attacker);
      updateHUD();
      return;
    }

    let combo = attacker.comboTimer > 0 ? attacker.combo + 1 : 1;
    attacker.combo = combo; attacker.comboTimer = 0.95;
    attacker.maxCombo = Math.max(attacker.maxCombo, combo);
    const scale = clamp(1 - (combo - 1) * 0.085, 0.55, 1);
    const dmg = Math.max(1, Math.round(move.dmg * scale));

    defender.ghost = Math.max(defender.ghost, defender.health);
    defender.health = Math.max(0, defender.health - dmg);
    defender.state = 'hit'; defender.hitTimer = move.hitstun;
    defender.move = null; defender.moveKey = null; defender.trail = []; defender.flash = 0.14;
    defender.vx = attacker.facing * move.kb;
    if (move.launch) { defender.vy = -650; defender.y = -1; }
    attacker.meter = clamp(attacker.meter + (move.meter || 6), 0, 100);
    defender.meter = clamp(defender.meter + (move.meter || 6) * 0.5, 0, 100);

    hitSparks(hx, hy, color, heavy ? 1.35 : 0.9, false);
    floatText(hx, hy - 34, String(dmg), heavy ? '#ffd166' : '#ffffff', heavy ? 30 : 24);
    audio.hit(heavy);
    effects.hitstop = Math.max(effects.hitstop, heavy ? 0.085 : 0.055);
    screenShake(heavy ? 11 : 6, heavy ? 0.3 : 0.18);
    if (move.special) {
      screenFlash(color, 0.16);
      if (attacker === player) game.stats.playerSpecials++;
      else game.stats.cpuSpecials++;
    }
    if (defender.health <= 0) triggerKO(defender, attacker);
    updateHUD();
  }

  function triggerKO(loser, winner) {
    if (game.mode !== 'fight') return;
    game.mode = 'ko'; game.koT = 0; game.koWinner = winner; game.timeScale = 0.25;
    loser.health = 0; loser.state = 'ko'; loser.move = null; loser.moveKey = null;
    loser.y = -1; loser.vy = -430; loser.vx = winner.facing * 310; loser.trail = [];
    loser.invuln = 0;
    winner.state = 'win'; winner.move = null; winner.moveKey = null; winner.vx = 0;
    const perfect = winner.health >= 100;
    announce('K.O.', '#ffd166', 2.2, perfect ? 'PERFECT!' : '');
    screenShake(26, 0.65); screenFlash('#ffffff', 0.8);
    audio.ko();
    dust(loser.x, GROUND, 12);
    updateHUD();
  }

  function timeoutRound() {
    if (game.mode !== 'fight') return;
    let winner = null;
    if (player.health > cpu.health) winner = player;
    else if (cpu.health > player.health) winner = cpu;
    announce('TIME OVER', '#ffd166', 1.5, winner ? '' : 'DRAW');
    finishRound(winner, 'timeout');
  }

  function finishRound(winner, reason) {
    if (game.mode === 'roundend' || game.mode === 'matchover') return;
    game.mode = 'roundend'; game.roundEndT = 0; game.roundWinner = winner;
    if (winner === player) {
      game.wins.player++;
      winner.state = 'win'; winner.vx = 0; winner.move = null; winner.moveKey = null;
    } else if (winner === cpu) {
      game.wins.cpu++;
      winner.state = 'win'; winner.vx = 0; winner.move = null; winner.moveKey = null;
    }
    if (reason === 'timeout') {
      if (winner === player) floatText(W / 2, 360, 'KAI TAKES THE ROUND', '#4de3ff', 22);
      else if (winner === cpu) floatText(W / 2, 360, 'RAZE TAKES THE ROUND', '#ff5c8a', 22);
    }
    updateHUD();
  }

  function nextRound() {
    if (game.wins.player >= 2 || game.wins.cpu >= 2 || game.round >= 3) {
      matchOver();
      return;
    }
    game.round++;
    resetRound();
  }

  function resetRound() {
    player.reset(380, 1);
    cpu.reset(900, -1);
    player.ghost = 100; cpu.ghost = 100;
    projectiles.length = 0;
    particles.length = 0;
    effects.hitstop = 0; effects.zoom = 1; effects.flash = null;
    effects.announcement = null;
    game.mode = 'intro'; game.introT = 0; game.timer = 60;
    game.koT = 0; game.roundEndT = 0; game.koWinner = null; game.roundWinner = null;
    dirHistory.length = 0; lastDirToken = 'n';
    announce(game.round >= 3 ? 'FINAL ROUND' : 'ROUND ' + game.round, '#ffffff', 1.05,
      game.round >= 3 ? 'NO MORE CHANCES' : 'BEST OF THREE');
    updateHUD();
  }

  // ---------------------------------------------------------------------------
  // CPU opponent
  // ---------------------------------------------------------------------------
  class AI {
    constructor(f) { this.f = f; this.think = 0; this.intent = 'wait'; this.acted = false; this.blockHold = 0; }
    update(dt, opp) {
      const f = this.f;
      f.control.left = f.control.right = f.control.block = false;
      if (game.mode !== 'fight' || f.state === 'hit' || f.state === 'ko' || f.state === 'attack' || f.state === 'win') return;
      this.blockHold = Math.max(0, this.blockHold - dt);
      this.think -= dt;
      const dist = Math.abs(opp.x - f.x);
      const dir = opp.x > f.x ? 1 : -1;
      const incoming = projectiles.find(p => p.owner === opp && Math.abs(p.x - f.x) < 460 &&
        Math.sign(f.x - p.x) === Math.sign(p.vx));
      if (this.think <= 0) {
        this.think = 0.09 + Math.random() * 0.16;
        this.choose(opp, dist, incoming);
      }
      if (incoming && this.intent !== 'block' && this.intent !== 'jump' && Math.random() < dt * 7) {
        if (Math.random() < 0.62) { this.intent = 'block'; this.blockHold = 0.55; }
        else this.intent = 'jump';
      }
      this.act(dt, opp, dist, dir);
    }
    choose(opp, dist, incoming) {
      this.acted = false;
      const r = Math.random();
      const f = this.f;
      if (incoming) {
        if (r < 0.7) { this.intent = 'block'; this.blockHold = 0.55; }
        else this.intent = 'jump';
        return;
      }
      if (opp.state === 'attack' && dist < 215) {
        if (r < 0.56) { this.intent = 'block'; this.blockHold = 0.36; }
        else if (r < 0.7 && f.meter >= 25) this.intent = 'uppercut';
        else this.intent = 'retreat';
        return;
      }
      if (!opp.grounded && dist < 210 && f.meter >= 25 && r < 0.55) { this.intent = 'uppercut'; return; }
      if (dist > 330) {
        if (r < 0.2 && f.meter >= 25) this.intent = 'fireball';
        else this.intent = 'approach';
      } else if (dist > 195) {
        if (r < 0.16 && f.meter >= 25) this.intent = 'fireball';
        else if (r < 0.3) this.intent = 'kick';
        else this.intent = 'approach';
      } else {
        if (r < 0.27) this.intent = 'punch';
        else if (r < 0.52) this.intent = 'kick';
        else if (r < 0.67 && f.meter >= 25) this.intent = pick(['spin', 'uppercut', 'fireball']);
        else if (r < 0.8) { this.intent = 'block'; this.blockHold = 0.3; }
        else if (r < 0.9) this.intent = 'retreat';
        else this.intent = 'approach';
      }
    }
    act(dt, opp, dist, dir) {
      const f = this.f;
      if (this.blockHold > 0 || this.intent === 'block') {
        f.control.block = true;
        if (this.blockHold > 0) this.blockHold -= dt;
        return;
      }
      if (this.intent === 'approach') {
        if (dist > 92) { if (dir > 0) f.control.right = true; else f.control.left = true; }
        else this.intent = 'wait';
        return;
      }
      if (this.intent === 'retreat') {
        if (f.x > STAGE_L + 70 && f.x < STAGE_R - 70) {
          if (dir > 0) f.control.left = true; else f.control.right = true;
        }
        return;
      }
      if (this.intent === 'jump') {
        if (!this.acted) { f.tryJump(); this.acted = true; }
        this.intent = 'wait';
        return;
      }
      if (!this.acted) {
        if (this.intent === 'punch') f.tryAttack('punch');
        else if (this.intent === 'kick') f.tryAttack('kick');
        else if (this.intent === 'uppercut') f.trySpecial('uppercut');
        else if (this.intent === 'fireball') f.trySpecial('fireball');
        else if (this.intent === 'spin') f.trySpecial('spin');
        this.acted = true;
      }
      this.intent = 'wait';
    }
  }
  const ai = new AI(cpu);

  // ---------------------------------------------------------------------------
  // Input
  // ---------------------------------------------------------------------------
  const keys = new Set();
  const touchState = { left: false, right: false, block: false };
  const dirHistory = [];
  let lastDirToken = 'n';
  const isTouch = (window.matchMedia && matchMedia('(pointer: coarse)').matches) || innerWidth <= 900;

  function syncPlayerInput() {
    player.control.left = keys.has('KeyA') || keys.has('ArrowLeft') || touchState.left;
    player.control.right = keys.has('KeyD') || keys.has('ArrowRight') || touchState.right;
    player.control.block = keys.has('KeyS') || keys.has('ArrowDown') || touchState.block;
  }

  function updateDirHistory() {
    const right = keys.has('KeyD') || keys.has('ArrowRight') || touchState.right;
    const left = keys.has('KeyA') || keys.has('ArrowLeft') || touchState.left;
    const down = keys.has('KeyS') || keys.has('ArrowDown') || touchState.block;
    const fwd = player.facing > 0 ? right : left;
    const back = player.facing > 0 ? left : right;
    let token = 'n';
    if (down && fwd) token = 'df';
    else if (down && back) token = 'db';
    else if (down) token = 'd';
    else if (fwd) token = 'f';
    else if (back) token = 'b';
    if (token !== lastDirToken) {
      dirHistory.push({ token, t: now() });
      if (dirHistory.length > 24) dirHistory.shift();
      lastDirToken = token;
    }
    const cutoff = now() - 760;
    while (dirHistory.length && dirHistory[0].t < cutoff) dirHistory.shift();
  }

  function playerMotion(kind) {
    if (player.meter < 25) return false;
    const tnow = now();
    const arr = dirHistory.filter(h => tnow - h.t < 620).map(h => h.token);
    const idxD = Math.max(arr.lastIndexOf('d'), arr.lastIndexOf('df'), arr.lastIndexOf('db'));
    const idxF = Math.max(arr.lastIndexOf('f'), arr.lastIndexOf('df'));
    const idxB = Math.max(arr.lastIndexOf('b'), arr.lastIndexOf('db'));
    let result = false;
    if (kind === 'punch') {
      if (idxF >= 0 && idxD > idxF) result = player.trySpecial('uppercut');
      else if (idxD >= 0 && idxF > idxD) result = player.trySpecial('fireball');
    } else {
      if (idxD >= 0 && idxB > idxD) result = player.trySpecial('spin');
    }
    if (result) { dirHistory.length = 0; lastDirToken = 'n'; }
    return result;
  }

  const GAME_KEYS = ['KeyA', 'KeyD', 'KeyW', 'KeyS', 'KeyJ', 'KeyK', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Space', 'Digit1', 'Digit2', 'Digit3', 'Enter', 'Escape', 'KeyP', 'KeyM'];
  window.addEventListener('keydown', e => {
    if (GAME_KEYS.includes(e.code)) e.preventDefault();
    if (e.repeat) return;
    keys.add(e.code);
    if (['KeyA', 'KeyD', 'KeyS', 'ArrowLeft', 'ArrowRight', 'ArrowDown'].includes(e.code)) updateDirHistory();
    if (e.code === 'KeyM') { toggleMute(); return; }
    if (e.code === 'KeyP' || e.code === 'Escape') { togglePause(); return; }
    if (game.mode === 'title') {
      if (e.code === 'Enter' || e.code === 'Space') startMatch();
      return;
    }
    if (game.mode === 'matchover') {
      if (e.code === 'Enter') startMatch();
      return;
    }
    if (game.mode !== 'fight') return;
    if (e.code === 'KeyW' || e.code === 'ArrowUp' || e.code === 'Space') { player.tryJump(); return; }
    if (e.code === 'KeyJ') { if (!playerMotion('punch')) player.tryAttack('punch'); return; }
    if (e.code === 'KeyK') { if (!playerMotion('kick')) player.tryAttack('kick'); return; }
    if (e.code === 'Digit1') player.trySpecial('fireball');
    if (e.code === 'Digit2') player.trySpecial('uppercut');
    if (e.code === 'Digit3') player.trySpecial('spin');
  });
  window.addEventListener('keyup', e => {
    keys.delete(e.code);
    if (['KeyA', 'KeyD', 'KeyS', 'ArrowLeft', 'ArrowRight', 'ArrowDown'].includes(e.code)) updateDirHistory();
  });
  window.addEventListener('blur', () => { keys.clear(); touchState.left = touchState.right = touchState.block = false; });

  function pulseBtn(btn) {
    btn.classList.add('active');
    setTimeout(() => btn.classList.remove('active'), 110);
  }

  function bindTouchControls() {
    document.querySelectorAll('[data-hold]').forEach(btn => {
      const name = btn.dataset.hold;
      const on = e => {
        e.preventDefault(); audio.init();
        touchState[name] = true; btn.classList.add('active');
        try { btn.setPointerCapture(e.pointerId); } catch (err) { /* noop */ }
      };
      const off = () => { touchState[name] = false; btn.classList.remove('active'); };
      btn.addEventListener('pointerdown', on);
      btn.addEventListener('pointerup', off);
      btn.addEventListener('pointercancel', off);
      btn.addEventListener('lostpointercapture', off);
      btn.addEventListener('contextmenu', e => e.preventDefault());
    });
    document.querySelectorAll('[data-tap]').forEach(btn => {
      btn.addEventListener('pointerdown', e => {
        e.preventDefault(); audio.init(); pulseBtn(btn);
        if (game.mode !== 'fight') return;
        if (btn.dataset.tap === 'jump') player.tryJump();
        else player.tryAttack(btn.dataset.tap);
      });
      btn.addEventListener('contextmenu', e => e.preventDefault());
    });
    document.querySelectorAll('[data-special]').forEach(btn => {
      btn.addEventListener('pointerdown', e => {
        e.preventDefault(); audio.init(); pulseBtn(btn);
        if (game.mode === 'fight') player.trySpecial(btn.dataset.special);
      });
      btn.addEventListener('contextmenu', e => e.preventDefault());
    });
  }
  bindTouchControls();

  // ---------------------------------------------------------------------------
  // Match flow
  // ---------------------------------------------------------------------------
  function hideOverlays() {
    dom.titleOverlay.classList.add('hidden');
    dom.matchOverlay.classList.add('hidden');
    dom.pauseOverlay.classList.add('hidden');
  }

  function startMatch() {
    audio.init(); audio.ui(); audio.crowd();
    game.paused = false;
    game.wins.player = 0; game.wins.cpu = 0;
    game.stats.playerSpecials = 0; game.stats.cpuSpecials = 0;
    game.round = 1;
    player.meter = 40; cpu.meter = 40;
    player.maxCombo = 0; cpu.maxCombo = 0;
    hideOverlays();
    dom.hud.classList.remove('hidden');
    dom.touch.classList.toggle('hidden', !isTouch);
    dom.portraitInfo.classList.toggle('hidden', !isTouch);
    resetRound();
  }

  function showTitle() {
    game.mode = 'title'; game.paused = false;
    game.wins.player = 0; game.wins.cpu = 0;
    game.round = 1; game.timer = 60;
    player.reset(790, 1); cpu.reset(1015, -1);
    player.meter = 55; cpu.meter = 55;
    player.ghost = 100; cpu.ghost = 100;
    projectiles.length = 0; particles.length = 0;
    effects.flash = null; effects.announcement = null; effects.hitstop = 0; effects.zoom = 1;
    dom.hud.classList.add('hidden');
    dom.touch.classList.add('hidden');
    dom.portraitInfo.classList.add('hidden');
    dom.pauseOverlay.classList.add('hidden');
    dom.matchOverlay.classList.add('hidden');
    dom.titleOverlay.classList.remove('hidden');
    updateHUD();
  }

  function matchOver() {
    game.mode = 'matchover';
    const w = game.wins.player > game.wins.cpu ? player : game.wins.cpu > game.wins.player ? cpu : null;
    if (w) { w.state = 'win'; w.vx = 0; }
    dom.winnerText.textContent = w ? w.name + ' WINS' : 'DRAW';
    dom.matchScore.textContent = `${game.wins.player} — ${game.wins.cpu}`;
    dom.statRounds.textContent = `${game.wins.player} — ${game.wins.cpu}`;
    dom.statCombo.textContent = `${Math.max(player.maxCombo, cpu.maxCombo)} hits`;
    dom.statSpecials.textContent = String(game.stats.playerSpecials);
    dom.matchOverlay.classList.remove('hidden');
    dom.touch.classList.add('hidden');
    dom.portraitInfo.classList.add('hidden');
    audio.crowd();
    screenFlash(w === player ? '#ffd166' : '#ffffff', 0.28);
  }

  function togglePause() {
    if (game.mode === 'title' || game.mode === 'matchover') return;
    game.paused = !game.paused;
    dom.pauseOverlay.classList.toggle('hidden', !game.paused);
    audio.ui();
  }

  function toggleMute() {
    audio.init();
    audio.setMuted(!audio.muted);
    audio.ui();
  }

  dom.muteBtn.addEventListener('click', e => { e.stopPropagation(); toggleMute(); });
  dom.pauseBtn.addEventListener('click', e => { e.stopPropagation(); togglePause(); });
  document.getElementById('startBtn').addEventListener('click', () => { audio.init(); startMatch(); });
  document.getElementById('rematchBtn').addEventListener('click', () => { audio.init(); startMatch(); });
  document.getElementById('menuBtn').addEventListener('click', () => { audio.init(); showTitle(); });
  document.getElementById('resumeBtn').addEventListener('click', () => togglePause());
  document.getElementById('restartBtn').addEventListener('click', () => { audio.init(); startMatch(); });
  document.getElementById('quitBtn').addEventListener('click', () => { audio.init(); showTitle(); });
  window.addEventListener('pointerdown', () => audio.init(), { once: true });

  // ---------------------------------------------------------------------------
  // Simulation update
  // ---------------------------------------------------------------------------
  function updateGame(realDt) {
    game.time += realDt;
    syncPlayerInput();
    updateDirHistory();
    const step = Math.min(0.05, realDt);
    const ts = game.mode === 'ko' ? (game.koT < 0.85 ? 0.25 : 1) : 1;
    const dt = step * ts;

    if (game.mode === 'fight') {
      ai.update(step, player);
      player.update(dt, cpu);
      cpu.update(dt, player);
      separateFighters();
      game.timer -= realDt;
      if (game.timer <= 0) { game.timer = 0; timeoutRound(); }
    } else if (game.mode === 'intro') {
      game.introT += realDt;
      player.update(step * 0.85, cpu);
      cpu.update(step * 0.85, player);
      if (game.introT > 1.15) {
        game.mode = 'fight';
        announce('FIGHT!', '#ffd166', 0.78);
        audio.crowd();
      }
    } else if (game.mode === 'ko') {
      game.koT += realDt;
      player.update(dt, cpu);
      cpu.update(dt, player);
      separateFighters();
      if (game.koT > 1.75) finishRound(game.koWinner, 'ko');
    } else if (game.mode === 'roundend') {
      game.roundEndT += realDt;
      player.update(step * 0.7, cpu);
      cpu.update(step * 0.7, player);
      if (game.roundEndT > 2.4) nextRound();
    } else if (game.mode === 'matchover') {
      player.update(step * 0.6, cpu);
      cpu.update(step * 0.6, player);
    } else if (game.mode === 'title') {
      player.update(step, cpu);
      cpu.update(step, player);
    }
    updateEffects(dt, realDt);
    effects.zoom = lerp(effects.zoom, game.mode === 'ko' ? 1.13 : 1, Math.min(1, realDt * 4.5));
  }

  // ---------------------------------------------------------------------------
  // HUD
  // ---------------------------------------------------------------------------
  const specialBtns = Array.from(document.querySelectorAll('[data-special]'));
  let comboShownSide = null, comboShownNum = 0;
  const hudCache = { p1h: -1, p2h: -1, p1g: -1, p2g: -1, p1sp: -1, p2sp: -1, timer: -1, round: -1, p1w: -1, p2w: -1, p1r: null, p2r: null };
  function updateHUD() {
    const p1h = Math.round(player.health * 10) / 10, p2h = Math.round(cpu.health * 10) / 10;
    const p1g = Math.round(Math.max(player.health, player.ghost) * 10) / 10;
    const p2g = Math.round(Math.max(cpu.health, cpu.ghost) * 10) / 10;
    if (hudCache.p1h !== p1h) { hudCache.p1h = p1h; dom.p1health.style.width = p1h + '%'; }
    if (hudCache.p2h !== p2h) { hudCache.p2h = p2h; dom.p2health.style.width = p2h + '%'; }
    if (hudCache.p1g !== p1g) { hudCache.p1g = p1g; dom.p1ghost.style.width = p1g + '%'; }
    if (hudCache.p2g !== p2g) { hudCache.p2g = p2g; dom.p2ghost.style.width = p2g + '%'; }
    const p1sp = Math.round(player.meter), p2sp = Math.round(cpu.meter);
    if (hudCache.p1sp !== p1sp) { hudCache.p1sp = p1sp; dom.p1spfill.style.width = p1sp + '%'; }
    if (hudCache.p2sp !== p2sp) { hudCache.p2sp = p2sp; dom.p2spfill.style.width = p2sp + '%'; }
    if (hudCache.p1r !== (player.meter >= 25)) { hudCache.p1r = player.meter >= 25; dom.p1sp.classList.toggle('ready', player.meter >= 25); }
    if (hudCache.p2r !== (cpu.meter >= 25)) { hudCache.p2r = cpu.meter >= 25; dom.p2sp.classList.toggle('ready', cpu.meter >= 25); }
    const timer = Math.ceil(game.timer);
    if (hudCache.timer !== timer) { hudCache.timer = timer; dom.timer.textContent = String(timer); }
    dom.timer.classList.toggle('low', game.mode === 'fight' && game.timer <= 10);
    const round = game.round >= 3 ? 3 : game.round;
    if (hudCache.round !== round) {
      hudCache.round = round;
      dom.roundLabel.textContent = game.round >= 3 ? 'FINAL ROUND' : 'ROUND ' + game.round;
    }
    if (hudCache.p1w !== game.wins.player) {
      hudCache.p1w = game.wins.player;
      dom.p1wins.forEach((el, i) => el.classList.toggle('on', i < game.wins.player));
    }
    if (hudCache.p2w !== game.wins.cpu) {
      hudCache.p2w = game.wins.cpu;
      dom.p2wins.forEach((el, i) => el.classList.toggle('on', i < game.wins.cpu));
    }
    for (const btn of specialBtns) btn.classList.toggle('cool', player.meter < 25);

    let side = null, num = 0;
    if (player.combo >= 2 && player.comboTimer > 0) { side = 'left'; num = player.combo; }
    else if (cpu.combo >= 2 && cpu.comboTimer > 0) { side = 'right'; num = cpu.combo; }
    if (side) {
      if (comboShownSide !== side || comboShownNum !== num) {
        dom.combo.classList.remove('show'); void dom.combo.offsetWidth;
        dom.comboNum.textContent = String(num);
        dom.combo.classList.toggle('right', side === 'right');
        dom.combo.classList.add('show');
        comboShownSide = side; comboShownNum = num;
      }
    } else {
      dom.combo.classList.remove('show');
      comboShownSide = null; comboShownNum = 0;
    }
  }

  // ---------------------------------------------------------------------------
  // Rendering
  // ---------------------------------------------------------------------------
  function drawAnnouncement() {
    const a = effects.announcement;
    if (!a) return;
    const p = a.t / a.dur;
    const fadeIn = clamp(a.t / 0.16, 0, 1);
    const fadeOut = clamp((a.dur - a.t) / 0.26, 0, 1);
    const alpha = Math.min(fadeIn, fadeOut);
    const pop = 1 + (1 - easeOut(clamp(a.t / 0.24, 0, 1))) * 0.32;
    const size = a.text.length > 9 ? 78 : 112;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(W / 2, H * 0.34);
    ctx.scale(pop, pop);
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    // ribbons
    ctx.fillStyle = a.color; ctx.globalAlpha = alpha * 0.55;
    ctx.fillRect(-W * 0.36, -size * 0.56, W * 0.72, 3);
    ctx.fillRect(-W * 0.28, size * 0.56, W * 0.56, 3);
    ctx.globalAlpha = alpha;
    ctx.font = `italic 900 ${size}px "Arial Black", Impact, sans-serif`;
    ctx.lineJoin = 'round';
    ctx.lineWidth = 16; ctx.strokeStyle = '#07050d'; ctx.strokeText(a.text, 0, 0);
    const grad = ctx.createLinearGradient(0, -size * 0.6, 0, size * 0.45);
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(0.45, a.color);
    grad.addColorStop(1, a.color);
    ctx.fillStyle = grad;
    ctx.shadowColor = a.color; ctx.shadowBlur = 28;
    ctx.fillText(a.text, 0, 0);
    ctx.shadowBlur = 0;
    if (a.sub) {
      ctx.font = 'italic 900 18px "Arial Black", Impact, sans-serif';
      ctx.lineWidth = 6; ctx.strokeStyle = '#07050d'; ctx.strokeText(a.sub, 0, size * 0.66);
      ctx.fillStyle = '#fff'; ctx.fillText(a.sub, 0, size * 0.66);
    }
    ctx.restore();
  }

  function render() {
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    ctx.clearRect(0, 0, W, H);
    let sx = 0, sy = 0;
    if (effects.shakeT > 0 && effects.shakeMax > 0) {
      const amp = effects.shake * Math.min(1, effects.shakeT / 0.3);
      sx = rand(-amp, amp); sy = rand(-amp, amp);
    }
    const zoom = effects.zoom || 1;
    ctx.save();
    ctx.translate(W / 2 + sx, H / 2 + sy);
    ctx.scale(zoom, zoom);
    ctx.translate(-W / 2, -H / 2);
    drawBackground(game.time, 0, 0);
    const order = [player, cpu].sort((a, b) => a.x - b.x);
    for (const f of order) drawFighter(f, game.time);
    for (const p of projectiles) p.draw();
    drawParticles();
    ctx.restore();

    if (effects.flash) {
      ctx.save();
      ctx.globalAlpha = clamp(effects.flash.alpha, 0, 1);
      ctx.fillStyle = effects.flash.color;
      ctx.fillRect(0, 0, W, H);
      ctx.restore();
    }
    drawAnnouncement();
  }

  // ---------------------------------------------------------------------------
  // Main loop
  // ---------------------------------------------------------------------------
  let lastFrame = performance.now();
  function frame(t) {
    const realDt = Math.min(0.25, (t - lastFrame) / 1000);
    lastFrame = t;
    if (!game.paused) {
      if (effects.hitstop > 0) {
        effects.hitstop -= realDt;
        updateEffects(0, realDt);
      } else {
        updateGame(realDt);
      }
    } else {
      updateEffects(0, realDt);
    }
    updateHUD();
    render();
    requestAnimationFrame(frame);
  }

  showTitle();
  window.StreetClash = { game, player, cpu, MOVES, startMatch, showTitle };
  requestAnimationFrame(frame);
})();
