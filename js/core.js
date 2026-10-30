// Núcleo: utilidades, azar determinista, audio procedural y entrada multiplataforma.

import { SAVE_PREFIX } from './data.js';

export const TAU = Math.PI * 2;
export const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
export const lerp = (a, b, t) => a + (b - a) * t;
export const damp = (a, b, lambda, dt) => lerp(a, b, 1 - Math.exp(-lambda * dt));
export const dist2 = (ax, ay, bx, by) => (ax - bx) ** 2 + (ay - by) ** 2;
export const dist = (ax, ay, bx, by) => Math.hypot(ax - bx, ay - by);
export const sign = (v) => (v < 0 ? -1 : 1);
export const rand = (a = 1, b = 0) => b + Math.random() * (a - b);
export const randInt = (a, b) => Math.floor(a + Math.random() * (b - a + 1));
export const choice = (arr) => arr[Math.floor(Math.random() * arr.length)];
export const chance = (p) => Math.random() < p;
export const shuffle = (arr) => {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};
export const angleDiff = (a, b) => {
  let d = (b - a) % TAU;
  if (d > Math.PI) d -= TAU;
  if (d < -Math.PI) d += TAU;
  return d;
};
export const rotateToward = (a, b, maxStep) => a + clamp(angleDiff(a, b), -maxStep, maxStep);
export const easeOut = (t) => 1 - (1 - t) ** 3;
export const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
export const formatTime = (sec) => {
  sec = Math.max(0, Math.floor(sec || 0));
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  return h > 0 ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}` : `${m}:${String(s).padStart(2, '0')}`;
};
export const formatNumber = (n) => new Intl.NumberFormat('es-ES').format(Math.round(n || 0));
export const escapeHtml = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const hexToRgba = (hex, a = 1) => {
  if (!hex || hex[0] !== '#') return `rgba(255,255,255,${a})`;
  const h = hex.length === 4 ? '#' + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3] : hex;
  const n = parseInt(h.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
};
export const deepClone = (obj) => (typeof structuredClone === 'function' ? structuredClone(obj) : JSON.parse(JSON.stringify(obj)));
export const uid = () => Math.random().toString(36).slice(2, 9);

export class RNG {
  constructor(seed = 1) {
    this.seed = seed >>> 0;
  }
  next() {
    let t = (this.seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
  range(a, b) { return a + this.next() * (b - a); }
  int(a, b) { return Math.floor(this.range(a, b + 1)); }
  pick(arr) { return arr[Math.floor(this.next() * arr.length)]; }
  chance(p) { return this.next() < p; }
  circle(r) {
    const a = this.next() * TAU;
    const d = Math.sqrt(this.next()) * r;
    return { x: Math.cos(a) * d, y: Math.sin(a) * d };
  }
}

export const circleRect = (cx, cy, r, rx, ry, rw, rh) => {
  const nx = clamp(cx, rx, rx + rw);
  const ny = clamp(cy, ry, ry + rh);
  return dist2(cx, cy, nx, ny) < r * r;
};

// ---------------------------------------------------------------------------
// AUDIO: música generativa original + efectos sintetizados. Sin archivos externos.
// ---------------------------------------------------------------------------

const midiToFreq = (m) => 440 * 2 ** ((m - 69) / 12);

const MUSIC_THEMES = {
  title: {
    bpm: 66, root: 57, scale: [0, 2, 3, 5, 7, 8, 10],
    progression: [[0, 3, 7], [5, 8, 12], [3, 7, 10], [-2, 2, 5]],
    melody: [12, null, 15, null, 19, null, 17, 15, 12, null, 10, null, 7, null, 5, null,
      12, null, 15, 17, 19, null, 22, null, 19, 17, 15, null, 12, null, 10, null],
    pluck: 'triangle', pad: 'sine', energy: 0.25, reverb: 0.5, drums: false,
  },
  village: {
    bpm: 92, root: 60, scale: [0, 2, 4, 5, 7, 9, 11],
    progression: [[0, 4, 7], [5, 9, 12], [7, 11, 14], [2, 5, 9]],
    melody: [12, null, 9, 12, 16, null, 14, 12, 9, null, 7, null, 9, 12, null, null,
      7, null, 9, 12, 14, null, 12, 9, 7, null, 5, 7, 9, null, null, null],
    pluck: 'triangle', pad: 'sine', energy: 0.35, reverb: 0.3, drums: false,
  },
  forest: {
    bpm: 78, root: 55, scale: [0, 2, 3, 5, 7, 8, 10],
    progression: [[0, 3, 7], [-2, 2, 5], [3, 7, 10], [5, 8, 12]],
    melody: [12, null, null, 15, null, 14, 12, null, 10, null, 12, null, 7, null, null, null,
      15, null, 17, null, 15, 14, null, 12, 10, null, 8, null, 7, null, null, null],
    pluck: 'sine', pad: 'triangle', energy: 0.22, reverb: 0.55, drums: false,
  },
  ruins: {
    bpm: 84, root: 52, scale: [0, 2, 3, 5, 7, 8, 11],
    progression: [[0, 3, 7], [5, 8, 12], [3, 7, 10], [7, 10, 14]],
    melody: [12, null, 15, null, 19, 18, null, 15, 12, null, 10, null, 8, 7, null, null,
      19, null, 22, null, 19, 18, 15, null, 12, null, 15, 18, 19, null, null, null],
    pluck: 'square', pad: 'sine', energy: 0.28, reverb: 0.65, drums: false,
  },
  sanctuary: {
    bpm: 70, root: 57, scale: [0, 2, 3, 5, 7, 9, 10],
    progression: [[0, 3, 7], [5, 9, 12], [7, 10, 14], [3, 7, 10]],
    melody: [12, null, 15, null, 19, null, 24, null, 22, null, 19, 17, 15, null, null, null,
      12, null, 15, 19, 22, null, 24, null, 27, 24, 22, null, 19, null, null, null],
    pluck: 'triangle', pad: 'sine', energy: 0.3, reverb: 0.7, drums: false,
  },
  battle: {
    bpm: 132, root: 50, scale: [0, 2, 3, 5, 7, 8, 11],
    progression: [[0, 3, 7], [8, 12, 15], [5, 8, 12], [3, 7, 10]],
    melody: [12, 12, null, 15, 12, null, 10, 12, 15, null, 18, 17, 15, null, 12, null,
      12, 15, null, 19, 18, null, 15, 12, 10, null, 12, 15, 17, null, 15, null],
    pluck: 'sawtooth', pad: 'square', energy: 0.5, reverb: 0.2, drums: true,
  },
  boss: {
    bpm: 148, root: 48, scale: [0, 1, 3, 5, 6, 8, 10],
    progression: [[0, 3, 7], [1, 5, 8], [3, 6, 10], [5, 8, 12]],
    melody: [12, null, 13, 12, null, 15, null, 18, 17, null, 15, 13, 12, null, 8, null,
      12, 13, null, 18, 17, 15, null, 13, 12, null, 15, 18, 19, null, 18, null],
    pluck: 'sawtooth', pad: 'sawtooth', energy: 0.6, reverb: 0.3, drums: true,
  },
};

export class AudioEngine {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.musicBus = null;
    this.sfxBus = null;
    this.delay = null;
    this.musicVol = 0.42;
    this.sfxVol = 0.62;
    this.muted = false;
    this.theme = null;
    this.themeData = null;
    this.nextStep = 0;
    this.step = 0;
    this.noiseBuffer = null;
    this.unlocked = false;
    this._lastStepTime = 0;
  }

  async unlock() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') await this.ctx.resume();
      this.unlocked = true;
      return;
    }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    this.ctx = new AC();
    this.master = this.ctx.createGain();
    this.master.gain.value = this.muted ? 0 : 1;
    const comp = this.ctx.createDynamicsCompressor();
    comp.threshold.value = -16;
    comp.knee.value = 18;
    comp.ratio.value = 4;
    comp.attack.value = 0.004;
    comp.release.value = 0.22;
    this.master.connect(comp).connect(this.ctx.destination);

    this.musicBus = this.ctx.createGain();
    this.musicBus.gain.value = this.musicVol;
    this.sfxBus = this.ctx.createGain();
    this.sfxBus.gain.value = this.sfxVol;
    this.musicBus.connect(this.master);
    this.sfxBus.connect(this.master);

    // Eco suave para dar profundidad cinematográfica.
    this.delay = this.ctx.createDelay(1.0);
    this.delay.delayTime.value = 0.31;
    const fb = this.ctx.createGain();
    fb.gain.value = 0.24;
    const wet = this.ctx.createGain();
    wet.gain.value = 0.18;
    this.delay.connect(fb).connect(this.delay);
    this.delay.connect(wet).connect(this.musicBus);
    this.musicBus.connect(this.delay);

    this.noiseBuffer = this._makeNoise(2);
    this.unlocked = true;
    if (this.theme) {
      const t = this.theme;
      this.theme = null;
      this.playMusic(t, true);
    }
  }

  _makeNoise(seconds) {
    const len = Math.floor(this.ctx.sampleRate * seconds);
    const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    return buf;
  }

  setVolumes(music, sfx) {
    this.musicVol = clamp(music, 0, 1);
    this.sfxVol = clamp(sfx, 0, 1);
    if (this.musicBus) this.musicBus.gain.setTargetAtTime(this.musicVol, this.ctx.currentTime, 0.1);
    if (this.sfxBus) this.sfxBus.gain.setTargetAtTime(this.sfxVol, this.ctx.currentTime, 0.05);
  }

  setMuted(m) {
    this.muted = m;
    if (this.master) this.master.gain.setTargetAtTime(m ? 0 : 1, this.ctx.currentTime, 0.08);
  }

  playMusic(theme, force = false) {
    if (!MUSIC_THEMES[theme]) return;
    if (!force && this.theme === theme) return;
    this.theme = theme;
    this.themeData = MUSIC_THEMES[theme];
    this.step = 0;
    this.nextStep = this.ctx ? this.ctx.currentTime + 0.08 : 0;
    if (this.ctx && this.musicBus) {
      this.musicBus.gain.cancelScheduledValues(this.ctx.currentTime);
      this.musicBus.gain.setValueAtTime(0.0001, this.ctx.currentTime);
      this.musicBus.gain.exponentialRampToValueAtTime(Math.max(0.0001, this.musicVol), this.ctx.currentTime + 1.1);
    }
  }

  stopMusic() {
    this.theme = null;
    if (this.musicBus && this.ctx) {
      this.musicBus.gain.cancelScheduledValues(this.ctx.currentTime);
      this.musicBus.gain.setTargetAtTime(0.0001, this.ctx.currentTime, 0.25);
    }
  }

  update() {
    if (!this.ctx || !this.theme || !this.themeData || this.ctx.state !== 'running') return;
    const d = this.themeData;
    const stepDur = 60 / d.bpm / 2;
    const now = this.ctx.currentTime;
    if (this.nextStep < now) this.nextStep = now + 0.05;
    while (this.nextStep < now + 0.18) {
      this._scheduleStep(this.step, this.nextStep, stepDur);
      this.step++;
      this.nextStep += stepDur;
    }
  }

  _scheduleStep(step, time, stepDur) {
    const d = this.themeData;
    const bar = Math.floor(step / 16) % d.progression.length;
    const beat = step % 16;
    const chord = d.progression[bar];
    const root = d.root;

    // Pad armónico al inicio de cada compás.
    if (beat === 0) {
      for (let i = 0; i < chord.length; i++) {
        this._tone(d.pad, midiToFreq(root + chord[i] - 12), time, stepDur * 15, 0.028, 0.35, 0.6);
        this._tone(d.pad, midiToFreq(root + chord[i] - 12) * 1.004, time, stepDur * 15, 0.018, 0.4, 0.7);
      }
      this._tone('sine', midiToFreq(root - 24), time, stepDur * 7.5, 0.055, 0.02, 0.4);
    }
    // Bajo.
    if (beat % 4 === 0) {
      this._tone('triangle', midiToFreq(root - 24 + chord[0]), time, stepDur * 3.4, 0.05, 0.01, 0.25);
    }
    // Arpegio suave.
    if (beat % 2 === 0 && (beat / 2) % 2 === 0) {
      const n = chord[(Math.floor(step / 4) + 1) % chord.length];
      this._pluck(d.pluck, midiToFreq(root + n + 12), time, stepDur * 1.4, 0.026 * (0.7 + d.energy), 0.02, 0.35);
    }
    // Melodía.
    const mel = d.melody[step % d.melody.length];
    if (mel != null) {
      this._pluck(d.pluck, midiToFreq(root + mel), time, stepDur * 2.2, 0.05 * (0.6 + d.energy), 0.01, 0.5);
      if (d.reverb > 0.45) this._pluck('sine', midiToFreq(root + mel + 12), time + 0.01, stepDur * 2, 0.014, 0.05, 0.5);
    }
    // Percusión.
    if (d.drums) {
      if (beat % 8 === 0) this._noise(time, 0.11, 90, 0.07, 'lowpass');
      if (beat % 8 === 4) this._noise(time, 0.07, 1900, 0.028, 'highpass');
      if (beat % 2 === 1) this._noise(time, 0.03, 5000, 0.012, 'highpass');
      if (beat === 14 && this.theme === 'boss') this._tone('sawtooth', midiToFreq(root + 12), time, 0.16, 0.03, 0.01, 0.2);
    }
  }

  _tone(type, freq, time, dur, gain, attack = 0.01, release = 0.3) {
    if (!this.ctx || !this.musicBus) return;
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, time);
    g.gain.setValueAtTime(0.0001, time);
    g.gain.exponentialRampToValueAtTime(Math.max(0.0002, gain), time + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, time + dur + release);
    o.connect(g).connect(this.musicBus);
    o.start(time);
    o.stop(time + dur + release + 0.02);
  }

  _pluck(type, freq, time, dur, gain, attack = 0.005, release = 0.35) {
    if (!this.ctx || !this.musicBus) return;
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    const f = this.ctx.createBiquadFilter();
    o.type = type;
    o.frequency.setValueAtTime(freq, time);
    f.type = 'lowpass';
    f.frequency.setValueAtTime(Math.min(12000, freq * 6), time);
    f.frequency.exponentialRampToValueAtTime(Math.max(400, freq * 1.4), time + dur);
    g.gain.setValueAtTime(0.0001, time);
    g.gain.exponentialRampToValueAtTime(Math.max(0.0002, gain), time + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, time + dur + release);
    o.connect(f).connect(g).connect(this.musicBus);
    o.start(time);
    o.stop(time + dur + release + 0.02);
  }

  _noise(time, dur, freq, gain, filterType = 'bandpass') {
    if (!this.ctx || !this.noiseBuffer) return;
    const s = this.ctx.createBufferSource();
    s.buffer = this.noiseBuffer;
    const f = this.ctx.createBiquadFilter();
    f.type = filterType;
    f.frequency.value = freq;
    f.Q.value = 0.8;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(gain, time);
    g.gain.exponentialRampToValueAtTime(0.0001, time + dur);
    s.connect(f).connect(g).connect(this.musicBus);
    s.start(time);
    s.stop(time + dur + 0.03);
  }

  sfx(name, opts = {}) {
    if (!this.ctx || !this.sfxBus || this.muted) return;
    const t = this.ctx.currentTime;
    const bus = this.sfxBus;
    const tone = (type, f0, f1, dur, gain, attack = 0.005) => {
      const o = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      o.type = type;
      o.frequency.setValueAtTime(f0, t);
      if (f1 && f1 !== f0) o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(Math.max(0.0002, gain), t + attack);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g).connect(bus);
      o.start(t);
      o.stop(t + dur + 0.02);
    };
    const noise = (dur, freq, gain, type = 'bandpass', q = 1) => {
      if (!this.noiseBuffer) return;
      const s = this.ctx.createBufferSource();
      s.buffer = this.noiseBuffer;
      const f = this.ctx.createBiquadFilter();
      f.type = type;
      f.frequency.value = freq;
      f.Q.value = q;
      const g = this.ctx.createGain();
      g.gain.setValueAtTime(gain, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      s.connect(f).connect(g).connect(bus);
      s.start(t);
      s.stop(t + dur + 0.03);
    };
    switch (name) {
      case 'swing': noise(0.16, 1500, 0.18); tone('sawtooth', 220, 80, 0.12, 0.025); break;
      case 'swing_heavy': noise(0.24, 700, 0.24, 'lowpass'); tone('sawtooth', 140, 45, 0.22, 0.05); break;
      case 'hit': noise(0.09, 800, 0.2); tone('square', 180, 70, 0.1, 0.06); break;
      case 'crit': noise(0.14, 2200, 0.24); tone('square', 340, 90, 0.16, 0.08); break;
      case 'hurt': tone('sawtooth', 260, 90, 0.22, 0.09); noise(0.14, 500, 0.1); break;
      case 'block': tone('square', 620, 380, 0.12, 0.07); tone('square', 930, 700, 0.1, 0.04); break;
      case 'dodge': noise(0.18, 900, 0.1, 'highpass'); break;
      case 'arrow': noise(0.12, 2400, 0.1, 'highpass'); tone('triangle', 900, 400, 0.1, 0.025); break;
      case 'fire': noise(0.35, 600, 0.22, 'lowpass'); tone('sawtooth', 160, 60, 0.3, 0.06); break;
      case 'ice': tone('sine', 1400, 500, 0.35, 0.06); tone('sine', 2100, 900, 0.28, 0.04); break;
      case 'lightning': noise(0.2, 3000, 0.22, 'highpass'); tone('sawtooth', 900, 120, 0.2, 0.07); break;
      case 'heal': [523, 659, 784, 1046].forEach((f, i) => { setTimeout(() => tone('sine', f, f * 1.01, 0.4, 0.04), i * 55); }); break;
      case 'potion': tone('sine', 300, 620, 0.16, 0.06); tone('sine', 500, 900, 0.18, 0.03); break;
      case 'chest': [392, 523, 659, 784].forEach((f, i) => setTimeout(() => tone('triangle', f, f, 0.28, 0.045), i * 70)); break;
      case 'levelup': [523, 659, 784, 1046, 1318].forEach((f, i) => setTimeout(() => tone('triangle', f, f, 0.5, 0.055), i * 80)); break;
      case 'ui': tone('sine', 640, 720, 0.06, 0.035); break;
      case 'ui_back': tone('sine', 420, 300, 0.08, 0.03); break;
      case 'save': [659, 880, 1174].forEach((f, i) => setTimeout(() => tone('sine', f, f, 0.4, 0.04), i * 90)); break;
      case 'portal': tone('sine', 200, 900, 0.6, 0.06); noise(0.5, 1800, 0.06, 'bandpass'); break;
      case 'enemy_die': noise(0.32, 500, 0.16, 'lowpass'); tone('sawtooth', 180, 40, 0.35, 0.05); break;
      case 'boss_roar': tone('sawtooth', 70, 38, 0.9, 0.12); noise(0.8, 220, 0.12, 'lowpass'); break;
      case 'error': tone('square', 180, 120, 0.18, 0.05); break;
      case 'coin': tone('sine', 1200, 1600, 0.12, 0.035); break;
      case 'footstep': noise(0.04, 300, 0.02, 'lowpass'); break;
      case 'capture': [659, 880, 1046, 1318].forEach((f, i) => setTimeout(() => tone('sine', f, f, 0.5, 0.045), i * 100)); break;
      case 'quest': [523, 659, 784, 1046].forEach((f, i) => setTimeout(() => tone('triangle', f, f, 0.45, 0.05), i * 100)); break;
      case 'summon': tone('sine', 300, 1200, 0.5, 0.05); noise(0.3, 1400, 0.05); break;
      case 'gameover': [392, 349, 294, 220].forEach((f, i) => setTimeout(() => tone('triangle', f, f, 0.7, 0.055), i * 180)); break;
      case 'victory': [523, 659, 784, 1046, 1318, 1568].forEach((f, i) => setTimeout(() => tone('triangle', f, f, 0.8, 0.055), i * 120)); break;
      case 'boss_hit': noise(0.18, 300, 0.2, 'lowpass'); tone('sawtooth', 120, 50, 0.2, 0.08); break;
      case 'dash': noise(0.22, 700, 0.12, 'highpass'); break;
      case 'slam': tone('sine', 90, 35, 0.45, 0.12); noise(0.4, 200, 0.2, 'lowpass'); break;
      case 'shield': tone('sine', 300, 600, 0.3, 0.05); break;
      case 'freeze': tone('sine', 2200, 800, 0.4, 0.04); break;
      case 'burn': noise(0.25, 900, 0.08); break;
      default: tone('sine', 600, 500, 0.08, 0.025);
    }
  }
}

// ---------------------------------------------------------------------------
// ENTRADA: teclado, mando estándar y controles táctiles.
// ---------------------------------------------------------------------------

const KEY_MAP = {
  ArrowUp: 'up', KeyW: 'up',
  ArrowDown: 'down', KeyS: 'down',
  ArrowLeft: 'left', KeyA: 'left',
  ArrowRight: 'right', KeyD: 'right',
  Space: 'attack', KeyJ: 'attack',
  KeyK: 'dodge',
  KeyL: 'skill',
  KeyE: 'interact', KeyY: 'interact',
  ShiftLeft: 'block', ShiftRight: 'block',
  KeyF: 'magic',
  KeyG: 'cycleSpell',
  KeyQ: 'weapon',
  KeyR: 'creature',
  KeyH: 'potion',
  Escape: 'pause', KeyP: 'pause',
  Tab: 'quick',
  Digit1: 'spell1', Digit2: 'spell2', Digit3: 'spell3', Digit4: 'spell4',
  Enter: 'confirm',
  Backspace: 'cancel',
};

const GAME_KEYS = new Set(Object.keys(KEY_MAP));

const PAD_MAP = {
  0: 'attack', 1: 'dodge', 2: 'skill', 3: 'interact',
  4: 'weapon', 5: 'creature', 6: 'block', 7: 'magic',
  8: 'quick', 9: 'pause', 12: 'up', 13: 'down', 14: 'left', 15: 'right',
};

export class Input {
  constructor() {
    this.keys = new Set();
    this.touch = new Set();
    this.pad = new Set();
    this.down = new Set();
    this.prev = new Set();
    this.pressed = new Set();
    this.released = new Set();
    this.moveX = 0;
    this.moveY = 0;
    this.stickX = 0;
    this.stickY = 0;
    this.padX = 0;
    this.padY = 0;
    this.padConnected = false;
    this.enabled = true;
    this.onGamepad = null;
    this.onUnlock = null;
    this.lastMoveSound = 0;

    window.addEventListener('keydown', (e) => {
      const target = e.target;
      const typing = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable);
      if (typing) return;
      const action = KEY_MAP[e.code];
      if (action) {
        if (GAME_KEYS.has(e.code)) e.preventDefault();
        if (!e.repeat) this.keys.add(action);
        this.onUnlock?.();
      }
    }, { passive: false });
    window.addEventListener('keyup', (e) => {
      const action = KEY_MAP[e.code];
      if (action) {
        if (GAME_KEYS.has(e.code)) e.preventDefault();
        this.keys.delete(action);
      }
    }, { passive: false });
    window.addEventListener('blur', () => {
      this.keys.clear();
      this.touch.clear();
      this.stickX = 0;
      this.stickY = 0;
    });
    window.addEventListener('gamepadconnected', (e) => {
      this.padConnected = true;
      this.onGamepad?.(true, e.gamepad.id);
    });
    window.addEventListener('gamepaddisconnected', () => {
      this.padConnected = false;
      this.onGamepad?.(false, '');
    });
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.keys.clear();
        this.touch.clear();
        this.stickX = 0;
        this.stickY = 0;
      }
    });
  }

  setVirtual(action, isDown) {
    if (isDown) this.touch.add(action);
    else this.touch.delete(action);
  }

  setStick(x, y) {
    this.stickX = x;
    this.stickY = y;
  }

  clearStick() {
    this.stickX = 0;
    this.stickY = 0;
  }

  update() {
    this.prev = new Set(this.down);
    this.down.clear();
    if (this.enabled) {
      for (const k of this.keys) this.down.add(k);
      for (const k of this.touch) this.down.add(k);
      this._pollPad();
    }
    this.pressed.clear();
    this.released.clear();
    for (const a of this.down) if (!this.prev.has(a)) this.pressed.add(a);
    for (const a of this.prev) if (!this.down.has(a)) this.released.add(a);

    let kx = 0, ky = 0;
    if (this.enabled) {
      if (this.down.has('left')) kx -= 1;
      if (this.down.has('right')) kx += 1;
      if (this.down.has('up')) ky -= 1;
      if (this.down.has('down')) ky += 1;
    }
    let tx = this.stickX, ty = this.stickY;
    let px = this.padX, py = this.padY;
    let x = Math.abs(tx) > 0.08 || Math.abs(ty) > 0.08 ? tx : kx;
    let y = Math.abs(tx) > 0.08 || Math.abs(ty) > 0.08 ? ty : ky;
    if ((Math.abs(px) > 0.18 || Math.abs(py) > 0.18) && Math.abs(x) < 0.01 && Math.abs(y) < 0.01) {
      x = px; y = py;
    }
    const len = Math.hypot(x, y);
    if (len > 1) { x /= len; y /= len; }
    this.moveX = x;
    this.moveY = y;
  }

  _pollPad() {
    this.pad.clear();
    this.padX = 0;
    this.padY = 0;
    if (!navigator.getGamepads) return;
    const pads = navigator.getGamepads();
    let gp = null;
    for (const p of pads) if (p && p.connected) { gp = p; break; }
    if (!gp) return;
    for (const [idx, action] of Object.entries(PAD_MAP)) {
      const b = gp.buttons[Number(idx)];
      if (b && (b.pressed || b.value > 0.5)) this.down.add(action);
    }
    const ax = gp.axes[0] || 0;
    const ay = gp.axes[1] || 0;
    const dz = 0.2;
    this.padX = Math.abs(ax) > dz ? (ax - Math.sign(ax) * dz) / (1 - dz) : 0;
    this.padY = Math.abs(ay) > dz ? (ay - Math.sign(ay) * dz) / (1 - dz) : 0;
  }

  isDown(a) { return this.down.has(a); }
  wasPressed(a) { return this.pressed.has(a); }
  wasReleased(a) { return this.released.has(a); }
  consume(a) {
    if (this.pressed.has(a)) { this.pressed.delete(a); return true; }
    return false;
  }
  clear() {
    this.keys.clear();
    this.touch.clear();
    this.down.clear();
    this.prev.clear();
    this.pressed.clear();
    this.released.clear();
    this.stickX = 0;
    this.stickY = 0;
  }
}

// ---------------------------------------------------------------------------
// Persistencia local
// ---------------------------------------------------------------------------

export function storageAvailable() {
  try {
    const k = '__celestial_test__';
    localStorage.setItem(k, '1');
    localStorage.removeItem(k);
    return true;
  } catch {
    return false;
  }
}

export function readSave(slot) {
  try {
    const raw = localStorage.getItem(`${SAVE_PREFIX}${slot}`);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function writeSave(slot, data) {
  try {
    localStorage.setItem(`${SAVE_PREFIX}${slot}`, JSON.stringify(data));
    return true;
  } catch {
    return false;
  }
}

export function deleteSave(slot) {
  try { localStorage.removeItem(`${SAVE_PREFIX}${slot}`); } catch { /* noop */ }
}

export function listSaves() {
  const out = {};
  for (const s of ['auto', '1', '2', '3']) out[s] = readSave(s);
  return out;
}

export function vibrate(ms, enabled = true) {
  if (!enabled) return;
  try { navigator.vibrate?.(ms); } catch { /* noop */ }
}
