import { store } from './core.js';

export class Audio {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.muted = store.get('cryptfall.muted', false);
    this.last = {};
  }

  init() {
    if (this.ctx) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    this.ctx = new AC();
    this.master = this.ctx.createGain();
    this.master.gain.value = this.muted ? 0 : 0.2;
    this.master.connect(this.ctx.destination);
  }

  resume() {
    this.init();
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
  }

  setMuted(muted) {
    this.muted = muted;
    store.set('cryptfall.muted', muted);
    if (this.master) this.master.gain.value = muted ? 0 : 0.2;
  }

  can(key, ms) {
    const now = performance.now();
    if (this.last[key] && now - this.last[key] < ms) return false;
    this.last[key] = now;
    return true;
  }

  tone({ freq = 440, end = freq, dur = 0.12, type = 'sine', gain = 0.3, delay = 0, curve = 'exp' }) {
    if (!this.ctx || this.muted) return;
    const t = this.ctx.currentTime + delay;
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(Math.max(20, freq), t);
    if (curve === 'exp') o.frequency.exponentialRampToValueAtTime(Math.max(20, end), t + dur);
    else o.frequency.linearRampToValueAtTime(Math.max(20, end), t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g);
    g.connect(this.master);
    o.start(t);
    o.stop(t + dur + 0.02);
  }

  noise({ dur = 0.12, gain = 0.2, freq = 900, q = 1, type = 'bandpass', delay = 0 }) {
    if (!this.ctx || this.muted) return;
    const t = this.ctx.currentTime + delay;
    const len = Math.floor(this.ctx.sampleRate * dur);
    const buffer = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    const src = this.ctx.createBufferSource();
    src.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = type;
    filter.frequency.setValueAtTime(freq, t);
    filter.frequency.exponentialRampToValueAtTime(Math.max(120, freq * 0.35), t + dur);
    filter.Q.value = q;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(gain, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(filter);
    filter.connect(g);
    g.connect(this.master);
    src.start(t);
    src.stop(t + dur + 0.02);
  }

  shoot(kind) {
    if (!this.can('shoot', 45)) return;
    if (kind === 'wand') this.tone({ freq: 680, end: 980, dur: 0.09, type: 'triangle', gain: 0.12 });
    else if (kind === 'bow') {
      this.tone({ freq: 340, end: 120, dur: 0.09, type: 'triangle', gain: 0.12 });
      this.noise({ dur: 0.07, gain: 0.08, freq: 2400 });
    } else if (kind === 'scythe') {
      this.noise({ dur: 0.2, gain: 0.13, freq: 700, q: 0.6 });
      this.tone({ freq: 180, end: 90, dur: 0.2, type: 'sine', gain: 0.08 });
    } else {
      this.noise({ dur: 0.12, gain: 0.11, freq: 1200, q: 0.7 });
      this.tone({ freq: 220, end: 140, dur: 0.1, type: 'triangle', gain: 0.08 });
    }
  }

  hit(crit = false) {
    if (!this.can('hit', crit ? 55 : 35)) return;
    this.tone({ freq: crit ? 320 : 180, end: crit ? 160 : 90, dur: 0.06, type: 'square', gain: crit ? 0.09 : 0.05 });
    if (crit) this.tone({ freq: 900, end: 700, dur: 0.09, type: 'sine', gain: 0.07, delay: 0.01 });
  }

  kill(boss = false) {
    if (!this.can('kill', 55)) return;
    this.noise({ dur: boss ? 0.4 : 0.1, gain: boss ? 0.25 : 0.08, freq: boss ? 420 : 800 });
    this.tone({ freq: boss ? 80 : 140, end: 50, dur: boss ? 0.5 : 0.12, type: 'sine', gain: boss ? 0.2 : 0.06 });
  }

  hurt() {
    if (!this.can('hurt', 180)) return;
    this.tone({ freq: 150, end: 60, dur: 0.22, type: 'sawtooth', gain: 0.16 });
    this.noise({ dur: 0.18, gain: 0.14, freq: 500 });
  }

  gem() {
    if (!this.can('gem', 60)) return;
    this.tone({ freq: 880, end: 1320, dur: 0.07, type: 'sine', gain: 0.045 });
  }

  coin() {
    if (!this.can('coin', 70)) return;
    this.tone({ freq: 1040, end: 1500, dur: 0.06, type: 'triangle', gain: 0.05 });
  }

  loot(rarity) {
    const order = { common: 0, magic: 1, rare: 2, legendary: 3 }[rarity] ?? 0;
    const notes = [523, 659, 784, 1046];
    for (let i = 0; i <= order; i++) {
      this.tone({ freq: notes[i], end: notes[i] * 1.01, dur: 0.12, type: 'triangle', gain: 0.07, delay: i * 0.055 });
    }
  }

  legendary() {
    if (!this.can('legendary', 700)) return;
    [392, 523, 659, 784, 1046].forEach((f, i) => {
      this.tone({ freq: f, dur: 0.5, type: 'triangle', gain: 0.09, delay: i * 0.07 });
      this.tone({ freq: f / 2, dur: 0.55, type: 'sine', gain: 0.06, delay: i * 0.07 });
    });
    this.noise({ dur: 0.7, gain: 0.05, freq: 3000, type: 'highpass' });
  }

  levelup() {
    [440, 554, 659, 880].forEach((f, i) => {
      this.tone({ freq: f, dur: 0.24, type: 'triangle', gain: 0.08, delay: i * 0.06 });
    });
  }

  boon() {
    this.tone({ freq: 660, end: 990, dur: 0.18, type: 'sine', gain: 0.08 });
    this.tone({ freq: 990, end: 1320, dur: 0.16, type: 'triangle', gain: 0.05, delay: 0.05 });
  }

  equip() {
    this.noise({ dur: 0.1, gain: 0.07, freq: 1800 });
    this.tone({ freq: 300, end: 420, dur: 0.1, type: 'triangle', gain: 0.06 });
  }

  ui() {
    if (!this.can('ui', 40)) return;
    this.tone({ freq: 520, end: 620, dur: 0.05, type: 'sine', gain: 0.04 });
  }

  elite() {
    this.tone({ freq: 110, end: 180, dur: 0.3, type: 'sawtooth', gain: 0.08 });
  }

  boss() {
    this.tone({ freq: 65, end: 42, dur: 1.4, type: 'sawtooth', gain: 0.2 });
    this.tone({ freq: 98, end: 65, dur: 1.2, type: 'sine', gain: 0.14, delay: 0.1 });
    this.noise({ dur: 1.1, gain: 0.08, freq: 300, type: 'lowpass' });
  }

  bossCast() {
    if (!this.can('bossCast', 200)) return;
    this.tone({ freq: 180, end: 70, dur: 0.4, type: 'sawtooth', gain: 0.12 });
  }

  death() {
    [220, 174, 138, 110, 82].forEach((f, i) => {
      this.tone({ freq: f, end: f * 0.8, dur: 0.5, type: 'sawtooth', gain: 0.11, delay: i * 0.16 });
    });
    this.noise({ dur: 1.2, gain: 0.08, freq: 400, type: 'lowpass' });
  }

  victory() {
    [392, 523, 659, 784, 1046, 1318].forEach((f, i) => {
      this.tone({ freq: f, dur: 0.6, type: 'triangle', gain: 0.09, delay: i * 0.11 });
    });
    this.tone({ freq: 196, dur: 1.6, type: 'sine', gain: 0.09 });
  }
}
