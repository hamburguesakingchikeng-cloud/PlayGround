// ============================================================
// LA ESPADA CELESTIAL — núcleo técnico
// Utilidades, entrada, audio procedural y guardado local.
// ============================================================

export const TAU = Math.PI * 2;
export const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
export const lerp = (a, b, t) => a + (b - a) * t;
export const invLerp = (a, b, v) => (v - a) / (b - a);
export const smoothstep = (a, b, v) => { const t = clamp(invLerp(a, b, v), 0, 1); return t * t * (3 - 2 * t); };
export const dist = (ax, ay, bx, by) => Math.hypot(bx - ax, by - ay);
export const dist2 = (ax, ay, bx, by) => { const dx = bx - ax, dy = by - ay; return dx * dx + dy * dy; };
export const len = (x, y) => Math.hypot(x, y);
export const norm = (x, y) => { const l = Math.hypot(x, y) || 1; return { x: x / l, y: y / l }; };
export const angleTo = (ax, ay, bx, by) => Math.atan2(by - ay, bx - ax);
export const angleDiff = (a, b) => { let d = (b - a) % TAU; if (d > Math.PI) d -= TAU; if (d < -Math.PI) d += TAU; return d; };
export const angleLerp = (a, b, t) => a + angleDiff(a, b) * t;
export const choose = (arr, rng = Math.random) => arr[Math.floor(rng() * arr.length)];
export const chance = (p, rng = Math.random) => rng() < p;
export const uid = (() => { let n = 0; return (p = 'id') => `${p}_${++n}`; })();
export const fmt = n => Math.round(n).toLocaleString('es-ES');
export const pad = (n, l = 2) => String(n).padStart(l, '0');

export function hashString(str) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

export function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function seededFor(...parts) {
  return mulberry32(hashString(parts.join('|')));
}

export function shuffle(arr, rng = Math.random) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

export function pointInRect(x, y, r) { return x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h; }
export function pointInCircle(x, y, c) { return dist2(x, y, c.x, c.y) <= (c.r || 0) ** 2; }
export function rectsOverlap(a, b) { return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y; }

export function circleRectOverlap(cx, cy, cr, rx, ry, rw, rh) {
  const nx = clamp(cx, rx, rx + rw), ny = clamp(cy, ry, ry + rh);
  return dist2(cx, cy, nx, ny) < cr * cr;
}

export function easeOutCubic(t) { return 1 - (1 - t) ** 3; }
export function easeInCubic(t) { return t * t * t; }
export function easeOutBack(t) { const c = 1.70158; return 1 + (c + 1) * (t - 1) ** 3 + c * (t - 1) ** 2; }

export function formatPlaytime(sec) {
  sec = Math.max(0, Math.floor(sec));
  const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60);
  return h > 0 ? `${h}h ${pad(m)}m` : `${m}m`;
}

export const ELEMENTS = {
  luz:     { name: 'Luz',     color: '#ffe9a8', glow: '#ffd166', icon: '✦', strong: ['sombra', 'velo'], weak: ['cristal'] },
  sombra:  { name: 'Sombra',  color: '#b48cff', glow: '#7b4fd6', icon: '☾', strong: ['luz', 'cristal'], weak: ['luz'] },
  fuego:   { name: 'Fuego',   color: '#ff8a5c', glow: '#ff5a36', icon: '✹', strong: ['tierra', 'cristal'], weak: ['agua'] },
  agua:    { name: 'Agua',    color: '#7fd4ff', glow: '#3aa7e0', icon: '≈', strong: ['fuego', 'tierra'], weak: ['rayo'] },
  tierra:  { name: 'Tierra',  color: '#b6a06a', glow: '#8a7440', icon: '⛰', strong: ['rayo', 'fuego'], weak: ['agua', 'aire'] },
  aire:    { name: 'Aire',    color: '#c7f0e0', glow: '#7ddcba', icon: '≋', strong: ['tierra'], weak: ['rayo'] },
  rayo:    { name: 'Rayo',    color: '#fff09a', glow: '#f4c542', icon: '⚡', strong: ['agua', 'aire'], weak: ['tierra'] },
  cristal: { name: 'Cristal', color: '#9fe8ff', glow: '#5cc9e8', icon: '◈', strong: ['luz', 'sombra'], weak: ['fuego'] },
  velo:    { name: 'Velo',    color: '#8b6bff', glow: '#5a2ecc', icon: '◉', strong: ['luz', 'cristal', 'sombra'], weak: [] },
};

export const STAT_KEYS = [
  { id: 'vida', name: 'Vida', short: 'VIT', icon: '♥', desc: 'Aumenta la salud máxima y la regeneración fuera de combate.' },
  { id: 'mana', name: 'Maná', short: 'MAN', icon: '✦', desc: 'Aumenta el maná máximo y la potencia de los hechizos.' },
  { id: 'resistencia', name: 'Resistencia', short: 'RES', icon: '⛨', desc: 'Aumenta la resistencia física y la defensa contra estados.' },
  { id: 'fuerza', name: 'Fuerza', short: 'FUE', icon: '⚔', desc: 'Aumenta el daño de armas y ataques pesados.' },
  { id: 'defensa', name: 'Defensa', short: 'DEF', icon: '◈', desc: 'Reduce el daño recibido y mejora los bloqueos.' },
  { id: 'velocidad', name: 'Velocidad', short: 'VEL', icon: '➤', desc: 'Aumenta la velocidad de movimiento y la cadencia.' },
  { id: 'inteligencia', name: 'Inteligencia', short: 'INT', icon: '❖', desc: 'Aumenta el poder de hechizos y la afinidad con los ecos.' },
  { id: 'suerte', name: 'Suerte', short: 'SUE', icon: '☘', desc: 'Mejora críticos, botín, esquivas y probabilidad de vínculo.' },
];

// ============================================================
// ENTRADA
// ============================================================
const KEY_ACTIONS = {
  KeyW: 'up', ArrowUp: 'up', KeyS: 'down', ArrowDown: 'down',
  KeyA: 'left', ArrowLeft: 'left', KeyD: 'right', ArrowRight: 'right',
  KeyJ: 'attack', KeyK: 'heavy', Space: 'dodge', KeyL: 'block',
  Digit1: 'spell1', Digit2: 'spell2', Digit3: 'spell3',
  KeyQ: 'creature', KeyV: 'capture', KeyE: 'interact', KeyR: 'potion',
  Escape: 'pause', Tab: 'menu', KeyM: 'map', KeyC: 'codex',
};

export class Input {
  constructor(canvas) {
    this.canvas = canvas;
    this.down = new Set();
    this.just = new Set();
    this.joy = { x: 0, y: 0, active: false };
    this.mouse = { x: 0, y: 0, down: false, active: false };
    this.enabled = true;
    this._bind();
  }
  _bind() {
    window.addEventListener('keydown', e => {
      if (e.code === 'Tab' || e.code === 'Space') e.preventDefault();
      const a = KEY_ACTIONS[e.code];
      if (!a) return;
      if (!e.repeat) { this.just.add(a); }
      this.down.add(a);
    });
    window.addEventListener('keyup', e => {
      const a = KEY_ACTIONS[e.code];
      if (a) this.down.delete(a);
    });
    window.addEventListener('blur', () => { this.down.clear(); this.joy = { x: 0, y: 0, active: false }; this.mouse.down = false; });
    const c = this.canvas;
    c.addEventListener('mousemove', e => {
      const r = c.getBoundingClientRect();
      this.mouse.x = (e.clientX - r.left) * (c.width / r.width);
      this.mouse.y = (e.clientY - r.top) * (c.height / r.height);
      this.mouse.active = true;
    });
    c.addEventListener('mousedown', e => {
      if (e.button === 0) { this.mouse.down = true; this.just.add('attack'); this.down.add('attack'); }
      if (e.button === 2) { this.down.add('block'); }
    });
    window.addEventListener('mouseup', e => {
      if (e.button === 0) { this.mouse.down = false; this.down.delete('attack'); }
      if (e.button === 2) this.down.delete('block');
    });
    c.addEventListener('contextmenu', e => e.preventDefault());
    c.addEventListener('touchstart', e => { this.mouse.active = false; }, { passive: true });
  }
  press(a) { this.just.add(a); this.down.add(a); }
  release(a) { this.down.delete(a); }
  isDown(a) { return this.down.has(a); }
  pressed(a) { return this.just.has(a); }
  consume(a) { if (this.just.has(a)) { this.just.delete(a); return true; } return false; }
  get moveX() {
    let x = 0;
    if (this.down.has('left')) x -= 1;
    if (this.down.has('right')) x += 1;
    if (this.joy.active) x += this.joy.x;
    return clamp(x, -1, 1);
  }
  get moveY() {
    let y = 0;
    if (this.down.has('up')) y -= 1;
    if (this.down.has('down')) y += 1;
    if (this.joy.active) y += this.joy.y;
    return clamp(y, -1, 1);
  }
  get moving() { return Math.hypot(this.moveX, this.moveY) > 0.12; }
  endFrame() { this.just.clear(); }
  setJoystick(x, y, active) { this.joy.x = x; this.joy.y = y; this.joy.active = active; }
}

// ============================================================
// AUDIO PROCEDURAL
// ============================================================
const MOODS = {
  title:    { tempo: 56, root: 146.83, scale: [0, 2, 3, 5, 7, 8, 10], chords: [[0, 3, 7], [-3, 2, 5], [-5, 0, 3], [-2, 2, 5]], pad: 'sine', arp: 'triangle', drums: 0.1, bright: 0.5 },
  valdoria: { tempo: 68, root: 196.00, scale: [0, 2, 4, 5, 7, 9, 11], chords: [[0, 4, 7], [-3, 2, 5], [-5, 0, 4], [-1, 2, 7]], pad: 'sine', arp: 'triangle', drums: 0.35, bright: 0.8 },
  drakmor:  { tempo: 74, root: 146.83, scale: [0, 1, 3, 5, 6, 8, 10], chords: [[0, 3, 6], [-2, 1, 5], [-4, 0, 3], [-2, 3, 6]], pad: 'sawtooth', arp: 'square', drums: 0.6, bright: 0.45 },
  kansordore:{tempo: 60, root: 164.81, scale: [0, 2, 4, 6, 7, 9, 11], chords: [[0, 4, 7], [2, 5, 9], [-3, 2, 7], [0, 4, 9]], pad: 'sine', arp: 'sine', drums: 0.25, bright: 1.0 },
  battle:   { tempo: 104, root: 174.61, scale: [0, 2, 3, 5, 7, 8, 10], chords: [[0, 3, 7], [0, 5, 8], [-2, 3, 5], [-4, 1, 5]], pad: 'sawtooth', arp: 'square', drums: 0.9, bright: 0.55 },
  boss:     { tempo: 118, root: 130.81, scale: [0, 1, 3, 5, 6, 8, 11], chords: [[0, 3, 6], [1, 4, 7], [-1, 3, 6], [-2, 1, 5]], pad: 'sawtooth', arp: 'square', drums: 1.0, bright: 0.4 },
  void:     { tempo: 48, root: 110.00, scale: [0, 1, 4, 6, 7, 9, 11], chords: [[0, 4, 7], [-2, 2, 6], [-4, 1, 5], [-1, 3, 7]], pad: 'sine', arp: 'sine', drums: 0.15, bright: 0.6 },
};

export class AudioEngine {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.musicBus = null;
    this.sfxBus = null;
    this.reverb = null;
    this.mode = 'title';
    this.volume = { master: 0.75, music: 0.55, sfx: 0.7 };
    this.muted = false;
    this.step = 0;
    this.nextTime = 0;
    this.timer = 0;
    this.ready = false;
    this.battle = false;
    this._seed = 1;
  }
  init() {
    if (this.ctx) { this.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    try {
      this.ctx = new AC();
      this.master = this.ctx.createGain();
      this.master.gain.value = this.volume.master;
      this.master.connect(this.ctx.destination);
      this.musicBus = this.ctx.createGain();
      this.musicBus.gain.value = this.volume.music;
      this.musicBus.connect(this.master);
      this.sfxBus = this.ctx.createGain();
      this.sfxBus.gain.value = this.volume.sfx;
      this.sfxBus.connect(this.master);
      const len = this.ctx.sampleRate * 2.4;
      const imp = this.ctx.createBuffer(2, len, this.ctx.sampleRate);
      for (let ch = 0; ch < 2; ch++) {
        const d = imp.getChannelData(ch);
        for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len) ** 2.6;
      }
      const conv = this.ctx.createConvolver(); conv.buffer = imp;
      this.reverb = this.ctx.createGain(); this.reverb.gain.value = 0.28;
      conv.connect(this.reverb); this.reverb.connect(this.master);
      this.musicReverb = this.ctx.createGain(); this.musicReverb.gain.value = 0.42;
      this.musicReverb.connect(conv);
      this.ready = true;
      this.nextTime = this.ctx.currentTime + 0.1;
      this.step = 0;
    } catch (e) { console.warn('Audio no disponible', e); }
  }
  resume() { if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume().catch(() => {}); }
  setVolume(kind, v) {
    this.volume[kind] = clamp(v, 0, 1);
    if (!this.ctx) return;
    if (kind === 'master') this.master.gain.value = this.muted ? 0 : this.volume.master;
    if (kind === 'music') this.musicBus.gain.value = this.volume.music;
    if (kind === 'sfx') this.sfxBus.gain.value = this.volume.sfx;
  }
  setMuted(m) {
    this.muted = m;
    if (this.master) this.master.gain.value = m ? 0 : this.volume.master;
  }
  setMode(mode, battle = false) {
    if (this.mode === mode && this.battle === battle) return;
    this.mode = mode; this.battle = battle;
    this.step = 0;
    if (this.ctx) this.nextTime = Math.max(this.nextTime, this.ctx.currentTime + 0.05);
  }
  update() {
    if (!this.ready || !this.ctx || this.ctx.state !== 'running') return;
    const lookahead = 0.25;
    const mood = MOODS[this.mode] || MOODS.title;
    const battleMood = this.battle ? MOODS.battle : null;
    const spb = 60 / (this.battle ? Math.max(mood.tempo, 100) : mood.tempo);
    const stepDur = spb / 4;
    while (this.nextTime < this.ctx.currentTime + lookahead) {
      this._scheduleStep(this.step, this.nextTime, mood, battleMood);
      this.nextTime += stepDur;
      this.step++;
    }
  }
  _scheduleStep(step, t, mood, battleMood) {
    const bar = Math.floor(step / 16), beat = step % 16;
    const root = mood.root;
    const rng = mulberry32(hashString(this.mode + ':' + bar + ':' + (this.battle ? 'b' : 'c')));
    const scale = mood.scale;
    const chord = mood.chords[bar % mood.chords.length];
    const freq = n => root * Math.pow(2, n / 12);
    // Pad: long chord at each bar
    if (beat === 0) {
      chord.forEach((n, i) => this._note(freq(n), t, (60 / mood.tempo) * 4.1, mood.pad, 0.026, this.musicBus, 900 + i * 120, this.musicReverb));
      if (this.battle) this._note(freq(chord[0] - 12), t, (60 / mood.tempo) * 3.8, 'sawtooth', 0.035, this.musicBus, 280);
    }
    // Bass
    if (beat % 4 === 0) {
      this._note(freq(chord[0] - 24), t, 0.5, 'triangle', this.battle ? 0.09 : 0.055, this.musicBus, 220);
    }
    // Arpeggio
    if (beat % 2 === 0 && (beat % 8 !== 0 || rng() < 0.6)) {
      const idx = [0, 1, 2, 1, 0, 2, 1, 2][(step / 2 | 0) % 8];
      const octave = rng() < 0.22 ? 12 : 0;
      const n = chord[idx % chord.length] + octave + (rng() < 0.12 ? 12 : 0);
      this._note(freq(n + 12), t, 0.32, mood.arp, this.battle ? 0.028 : 0.035, this.musicBus, 2400, this.musicReverb);
    }
    // Melody
    if (beat % 4 === 2 && rng() < (this.battle ? 0.55 : 0.4)) {
      const n = choose(scale, rng) + (rng() < 0.5 ? 12 : 0);
      this._note(freq(n + 12), t, 0.6, 'sine', 0.028, this.musicBus, 3200, this.musicReverb);
    }
    // Percussion
    const intensity = this.battle ? 1 : (mood.drums || 0.3);
    if (intensity > 0.2) {
      if (beat === 0 || beat === 8 || (this.battle && beat === 10)) this._drum(t, 0.22 * intensity, 70);
      if (beat === 4 || beat === 12) this._drum(t, 0.12 * intensity, 120);
      if (this.battle && beat % 2 === 1) this._hat(t, 0.018 * intensity);
      if (this.battle && beat % 8 === 6) this._drum(t, 0.16, 55);
    }
    // Shimmer
    if (!this.battle && beat === 0 && rng() < 0.55) {
      this._note(freq(choose(scale, rng) + 24), t + 0.2, 1.4, 'sine', 0.014, this.musicBus, 5000, this.musicReverb);
    }
  }
  _note(freq, time, dur, type, gain, dest, cutoff = 2200, send = null) {
    if (!this.ctx) return;
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    const f = this.ctx.createBiquadFilter();
    o.type = type; o.frequency.value = freq;
    f.type = 'lowpass'; f.frequency.value = cutoff; f.Q.value = 0.7;
    g.gain.setValueAtTime(0.0001, time);
    g.gain.linearRampToValueAtTime(gain, time + 0.03);
    g.gain.exponentialRampToValueAtTime(0.0001, time + dur);
    o.connect(f); f.connect(g); g.connect(dest);
    if (send) { const s = this.ctx.createGain(); s.gain.value = 0.5; g.connect(s); s.connect(send); }
    o.start(time); o.stop(time + dur + 0.05);
  }
  _drum(time, gain, freq) {
    if (!this.ctx) return;
    const o = this.ctx.createOscillator(); const g = this.ctx.createGain();
    o.type = 'sine'; o.frequency.setValueAtTime(freq * 2.2, time); o.frequency.exponentialRampToValueAtTime(freq * 0.7, time + 0.18);
    g.gain.setValueAtTime(gain, time); g.gain.exponentialRampToValueAtTime(0.0001, time + 0.25);
    o.connect(g); g.connect(this.musicBus); o.start(time); o.stop(time + 0.3);
  }
  _hat(time, gain) {
    if (!this.ctx) return;
    const src = this.ctx.createBufferSource();
    const b = this.ctx.createBuffer(1, this.ctx.sampleRate * 0.05, this.ctx.sampleRate);
    const d = b.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
    src.buffer = b;
    const f = this.ctx.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = 7000;
    const g = this.ctx.createGain(); g.gain.setValueAtTime(gain, time); g.gain.exponentialRampToValueAtTime(0.0001, time + 0.04);
    src.connect(f); f.connect(g); g.connect(this.musicBus); src.start(time);
  }
  sfx(name) {
    if (!this.ctx || !this.ready || this.muted) return;
    const t = this.ctx.currentTime;
    const B = this.sfxBus;
    const tone = (freq, dur, type = 'sine', vol = 0.12, slide = null, delay = 0) => {
      const o = this.ctx.createOscillator(); const g = this.ctx.createGain();
      o.type = type; o.frequency.setValueAtTime(freq, t + delay);
      if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(20, slide), t + delay + dur);
      g.gain.setValueAtTime(0.0001, t + delay); g.gain.linearRampToValueAtTime(vol, t + delay + 0.008);
      g.gain.exponentialRampToValueAtTime(0.0001, t + delay + dur);
      o.connect(g); g.connect(B); o.start(t + delay); o.stop(t + delay + dur + 0.03);
    };
    const noise = (dur, vol = 0.15, hp = 400, lp = 8000, delay = 0, slide = null) => {
      const len = Math.max(1, Math.floor(this.ctx.sampleRate * dur));
      const b = this.ctx.createBuffer(1, len, this.ctx.sampleRate); const d = b.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len) ** 1.5;
      const src = this.ctx.createBufferSource(); src.buffer = b;
      const f = this.ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.setValueAtTime(hp, t + delay);
      if (slide) f.frequency.exponentialRampToValueAtTime(slide, t + delay + dur);
      f.Q.value = 0.9;
      const g = this.ctx.createGain(); g.gain.setValueAtTime(vol, t + delay); g.gain.exponentialRampToValueAtTime(0.0001, t + delay + dur);
      src.connect(f); f.connect(g); g.connect(B); src.start(t + delay);
    };
    switch (name) {
      case 'ui': tone(520, 0.06, 'triangle', 0.05, 680); break;
      case 'ui_back': tone(380, 0.07, 'triangle', 0.05, 260); break;
      case 'slash': noise(0.14, 0.18, 900, 5200, 0, 300); tone(320, 0.12, 'sawtooth', 0.05, 120); break;
      case 'heavy': noise(0.24, 0.24, 300, 3000, 0, 120); tone(160, 0.22, 'sawtooth', 0.1, 55); break;
      case 'hit': tone(120, 0.13, 'sine', 0.18, 50); noise(0.09, 0.12, 500, 2600); break;
      case 'crit': tone(880, 0.09, 'square', 0.08, 1320); tone(140, 0.2, 'sine', 0.16, 50); noise(0.12, 0.16, 1200, 6000); break;
      case 'block': tone(240, 0.12, 'square', 0.08, 180); noise(0.06, 0.1, 2000, 6000); break;
      case 'parry': tone(1200, 0.22, 'sine', 0.12, 1800); tone(600, 0.2, 'triangle', 0.1, 900); noise(0.15, 0.12, 3000, 9000); break;
      case 'dodge': noise(0.2, 0.1, 400, 2600, 0, 800); break;
      case 'hurt': tone(200, 0.2, 'sawtooth', 0.1, 90); noise(0.12, 0.12, 300, 1600); break;
      case 'spell': tone(420, 0.5, 'sine', 0.09, 1200); tone(630, 0.5, 'triangle', 0.05, 1800); noise(0.35, 0.06, 1800, 8000); break;
      case 'spell_dark': tone(300, 0.6, 'sawtooth', 0.08, 80); noise(0.4, 0.08, 200, 1200); break;
      case 'heal': [523, 659, 784, 1046].forEach((f, i) => tone(f, 0.5, 'sine', 0.07, null, i * 0.07)); break;
      case 'capture': [660, 880, 1100, 1320].forEach((f, i) => tone(f, 0.4, 'triangle', 0.07, null, i * 0.08)); noise(0.4, 0.05, 2500, 9000); break;
      case 'capture_fail': tone(300, 0.3, 'square', 0.08, 120); break;
      case 'levelup': [523, 659, 784, 1046, 1318].forEach((f, i) => tone(f, 0.7, 'triangle', 0.08, null, i * 0.09)); break;
      case 'quest': [392, 523, 659, 784].forEach((f, i) => tone(f, 0.6, 'sine', 0.07, null, i * 0.1)); break;
      case 'chest': [784, 1046, 1318].forEach((f, i) => tone(f, 0.4, 'sine', 0.06, null, i * 0.06)); break;
      case 'portal': tone(180, 0.9, 'sine', 0.08, 900); noise(0.8, 0.06, 300, 3000); break;
      case 'roar': tone(90, 0.9, 'sawtooth', 0.16, 45); noise(0.8, 0.14, 100, 700); break;
      case 'death': [392, 330, 262, 196].forEach((f, i) => tone(f, 0.7, 'sine', 0.06, null, i * 0.14)); break;
      case 'error': tone(180, 0.16, 'square', 0.06, 120); break;
      case 'splash': noise(0.3, 0.1, 600, 3000); break;
      case 'fire': noise(0.4, 0.1, 200, 1400); break;
    }
  }
}

// ============================================================
// GUARDADO
// ============================================================
const SAVE_PREFIX = 'espada_celestial_v1_slot';

export class SaveSystem {
  static key(slot) { return SAVE_PREFIX + slot; }
  static list() {
    const out = [];
    for (let i = 0; i < 3; i++) {
      try {
        const raw = localStorage.getItem(SaveSystem.key(i));
        out.push(raw ? JSON.parse(raw) : null);
      } catch { out.push(null); }
    }
    return out;
  }
  static latest() {
    const list = SaveSystem.list().map((d, i) => d ? { ...d, slot: i } : null).filter(Boolean);
    list.sort((a, b) => (b.savedAt || 0) - (a.savedAt || 0));
    return list[0] || null;
  }
  static save(slot, data) {
    try { localStorage.setItem(SaveSystem.key(slot), JSON.stringify({ ...data, slot, savedAt: Date.now() })); return true; }
    catch (e) { console.warn('No se pudo guardar', e); return false; }
  }
  static load(slot) {
    try { const raw = localStorage.getItem(SaveSystem.key(slot)); return raw ? JSON.parse(raw) : null; } catch { return null; }
  }
  static delete(slot) { try { localStorage.removeItem(SaveSystem.key(slot)); } catch {} }
  static hasAny() { return SaveSystem.list().some(Boolean); }
}

export const QUALITY = {
  low: { particles: 90, dpr: 1, shadows: false, weather: 0.35 },
  medium: { particles: 180, dpr: 1.5, shadows: true, weather: 0.7 },
  high: { particles: 320, dpr: 2, shadows: true, weather: 1 },
};

export function detectQuality() {
  const mem = navigator.deviceMemory || 4;
  const mobile = /Android|iPhone|iPad|Mobile/i.test(navigator.userAgent);
  if (mobile && mem <= 3) return 'low';
  if (mobile) return 'medium';
  return 'high';
}
