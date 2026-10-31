// Tiny procedural audio engine — every sound is synthesized, no assets.

export class AudioEngine {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.muted = false;
    this.last = new Map();
    this.noiseBuffer = null;
    this.ambientStarted = false;
    try {
      this.muted = localStorage.getItem('gravebound-muted') === '1';
    } catch { /* storage unavailable */ }
  }

  init() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') this.ctx.resume();
      return;
    }
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    this.ctx = new Ctx();
    this.master = this.ctx.createGain();
    this.master.gain.value = this.muted ? 0 : 0.45;
    this.master.connect(this.ctx.destination);
    this.noiseBuffer = this.makeNoise(2);
    this.startAmbient();
  }

  makeNoise(seconds) {
    const buffer = this.ctx.createBuffer(1, Math.floor(this.ctx.sampleRate * seconds), this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    return buffer;
  }

  setMuted(muted) {
    this.muted = muted;
    if (this.master && this.ctx) {
      this.master.gain.cancelScheduledValues(this.ctx.currentTime);
      this.master.gain.setTargetAtTime(muted ? 0 : 0.45, this.ctx.currentTime, 0.08);
    }
    try { localStorage.setItem('gravebound-muted', muted ? '1' : '0'); } catch { /* ignore */ }
  }

  toggleMuted() {
    this.setMuted(!this.muted);
    return this.muted;
  }

  ready() {
    return this.ctx && this.ctx.state === 'running' && !this.muted;
  }

  throttle(key, ms) {
    const now = performance.now();
    const prev = this.last.get(key) || 0;
    if (now - prev < ms) return false;
    this.last.set(key, now);
    return true;
  }

  tone({ freq = 220, to = null, dur = 0.15, type = 'sine', gain = 0.12, delay = 0, attack = 0.005, filter = null }) {
    if (!this.ready()) return;
    const ctx = this.ctx;
    const t0 = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (to) osc.frequency.exponentialRampToValueAtTime(Math.max(20, to), t0 + dur);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.linearRampToValueAtTime(gain, t0 + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    let node = osc;
    if (filter) {
      const f = ctx.createBiquadFilter();
      f.type = filter.type || 'lowpass';
      f.frequency.value = filter.freq || 900;
      f.Q.value = filter.q || 1;
      osc.connect(f);
      node = f;
    }
    node.connect(g);
    g.connect(this.master);
    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
  }

  noise({ dur = 0.12, gain = 0.08, freq = 1200, type = 'bandpass', q = 1, to = null, delay = 0 }) {
    if (!this.ready()) return;
    const ctx = this.ctx;
    const t0 = ctx.currentTime + delay;
    const src = ctx.createBufferSource();
    src.buffer = this.noiseBuffer;
    const f = ctx.createBiquadFilter();
    f.type = type;
    f.frequency.setValueAtTime(freq, t0);
    if (to) f.frequency.exponentialRampToValueAtTime(Math.max(40, to), t0 + dur);
    f.Q.value = q;
    const g = ctx.createGain();
    g.gain.setValueAtTime(gain, t0);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    src.connect(f).connect(g).connect(this.master);
    src.start(t0);
    src.stop(t0 + dur + 0.02);
  }

  startAmbient() {
    if (this.ambientStarted || !this.ctx) return;
    this.ambientStarted = true;
    const ctx = this.ctx;
    const amb = ctx.createGain();
    amb.gain.value = 0.035;
    amb.connect(this.master);

    const low = ctx.createOscillator();
    low.type = 'sawtooth';
    low.frequency.value = 41.2;
    const lowFilter = ctx.createBiquadFilter();
    lowFilter.type = 'lowpass';
    lowFilter.frequency.value = 130;
    const lowGain = ctx.createGain();
    lowGain.gain.value = 0.7;
    low.connect(lowFilter).connect(lowGain).connect(amb);
    low.start();

    const fifth = ctx.createOscillator();
    fifth.type = 'triangle';
    fifth.frequency.value = 61.7;
    const fifthGain = ctx.createGain();
    fifthGain.gain.value = 0.22;
    fifth.connect(fifthGain).connect(amb);
    fifth.start();

    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.07;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 0.012;
    lfo.connect(lfoGain).connect(amb.gain);
    lfo.start();

    const wind = ctx.createBufferSource();
    wind.buffer = this.noiseBuffer;
    wind.loop = true;
    const windFilter = ctx.createBiquadFilter();
    windFilter.type = 'lowpass';
    windFilter.frequency.value = 360;
    const windGain = ctx.createGain();
    windGain.gain.value = 0.02;
    wind.connect(windFilter).connect(windGain).connect(this.master);
    wind.start();
  }

  swing() {
    if (!this.throttle('swing', 90)) return;
    this.noise({ dur: 0.18, gain: 0.05, freq: 2400, to: 380, type: 'bandpass', q: 1.6 });
  }

  bolt() {
    if (!this.throttle('bolt', 70)) return;
    this.tone({ freq: 720, to: 220, dur: 0.13, type: 'triangle', gain: 0.055 });
    this.tone({ freq: 1080, to: 540, dur: 0.09, type: 'sine', gain: 0.025 });
  }

  hit(crit = false) {
    if (!this.throttle(crit ? 'crit' : 'hit', 42)) return;
    this.noise({ dur: crit ? 0.1 : 0.07, gain: crit ? 0.075 : 0.035, freq: crit ? 1800 : 800, to: 200, type: 'bandpass', q: 0.8 });
    if (crit) this.tone({ freq: 130, to: 70, dur: 0.1, type: 'square', gain: 0.03 });
  }

  hurt() {
    if (!this.throttle('hurt', 220)) return;
    this.tone({ freq: 110, to: 48, dur: 0.28, type: 'sawtooth', gain: 0.08, filter: { type: 'lowpass', freq: 500 } });
    this.noise({ dur: 0.2, gain: 0.05, freq: 500, to: 100, type: 'lowpass' });
  }

  gem() {
    if (!this.throttle('gem', 55)) return;
    this.tone({ freq: 1250 + Math.random() * 250, to: 1700, dur: 0.055, type: 'sine', gain: 0.018 });
  }

  pickup(rarity = 'common') {
    const rank = { common: 0, magic: 1, rare: 2, legendary: 3, mythic: 4 }[rarity] ?? 0;
    const notes = [523.25, 659.25, 783.99, 1046.5, 1318.5];
    const count = 2 + rank;
    for (let i = 0; i < count; i++) {
      this.tone({ freq: notes[i % notes.length] * (i >= notes.length ? 0.5 : 1), dur: 0.2, type: 'triangle', gain: 0.045, delay: i * 0.055 });
    }
    if (rank >= 3) {
      this.tone({ freq: 65.4, dur: 1.1, type: 'sawtooth', gain: 0.05, filter: { type: 'lowpass', freq: 300 } });
      this.tone({ freq: 164.8, dur: 0.9, type: 'sine', gain: 0.05, delay: 0.12 });
    }
  }

  levelup() {
    const notes = [261.63, 329.63, 392, 523.25, 659.25];
    notes.forEach((freq, i) => this.tone({ freq, dur: 0.7, type: 'triangle', gain: 0.04, delay: i * 0.08 }));
    this.tone({ freq: 65.4, dur: 1.2, type: 'sine', gain: 0.07 });
  }

  heal() {
    this.tone({ freq: 440, to: 660, dur: 0.3, type: 'sine', gain: 0.035 });
  }

  boss() {
    if (!this.throttle('boss', 1000)) return;
    this.tone({ freq: 55, to: 36, dur: 1.8, type: 'sawtooth', gain: 0.1, filter: { type: 'lowpass', freq: 240 } });
    this.noise({ dur: 1.4, gain: 0.06, freq: 240, to: 60, type: 'lowpass' });
    for (let i = 0; i < 3; i++) this.tone({ freq: 110 * (i + 1), dur: 1.5, type: 'triangle', gain: 0.02, delay: 0.2 + i * 0.3 });
  }

  death() {
    const notes = [392, 329.63, 261.63, 196, 130.81];
    notes.forEach((freq, i) => this.tone({ freq, dur: 0.8, type: 'triangle', gain: 0.05, delay: i * 0.14 }));
  }

  victory() {
    const notes = [261.63, 329.63, 392, 523.25, 783.99, 1046.5];
    notes.forEach((freq, i) => this.tone({ freq, dur: 1.4, type: 'triangle', gain: 0.045, delay: i * 0.12 }));
  }

  click() {
    this.tone({ freq: 620, to: 480, dur: 0.07, type: 'triangle', gain: 0.03 });
  }
}
