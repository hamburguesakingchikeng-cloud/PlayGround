// Tiny procedural audio engine. No assets, no dependencies.

export class AudioEngine {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.muted = false;
    this.ambient = null;
    this.noiseBuffer = null;
    this.lastShot = 0;
  }

  ensure() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') this.ctx.resume().catch(() => {});
      return this.ctx;
    }
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return null;
    this.ctx = new Ctx();
    this.master = this.ctx.createGain();
    this.master.gain.value = this.muted ? 0 : 0.55;
    this.master.connect(this.ctx.destination);
    this.noiseBuffer = this.makeNoise(2);
    this.startAmbient();
    return this.ctx;
  }

  makeNoise(seconds) {
    const length = Math.floor(this.ctx.sampleRate * seconds);
    const buffer = this.ctx.createBuffer(1, length, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1;
    return buffer;
  }

  setMuted(muted) {
    this.muted = muted;
    if (this.master) {
      const now = this.ctx.currentTime;
      this.master.gain.cancelScheduledValues(now);
      this.master.gain.setTargetAtTime(muted ? 0 : 0.55, now, 0.05);
    }
    if (this.ambient) this.ambient.gain.gain.setTargetAtTime(muted ? 0 : 0.05, this.ctx.currentTime, 0.2);
  }

  startAmbient() {
    if (!this.ctx || this.ambient) return;
    const ctx = this.ctx;
    const bus = ctx.createGain();
    bus.gain.value = this.muted ? 0 : 0.05;
    bus.connect(this.master);
    this.ambient = { gain: bus, nodes: [] };

    const drone = (freq, detune, gain) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.value = freq;
      osc.detune.value = detune;
      g.gain.value = gain;
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 180;
      osc.connect(filter).connect(g).connect(bus);
      osc.start();
      this.ambient.nodes.push(osc);
    };
    drone(55, -7, 0.12);
    drone(82.5, 6, 0.055);

    const wind = ctx.createBufferSource();
    wind.buffer = this.noiseBuffer;
    wind.loop = true;
    const windFilter = ctx.createBiquadFilter();
    windFilter.type = 'bandpass';
    windFilter.frequency.value = 420;
    windFilter.Q.value = 0.7;
    const windGain = ctx.createGain();
    windGain.gain.value = 0.05;
    wind.connect(windFilter).connect(windGain).connect(bus);
    wind.start();
    this.ambient.nodes.push(wind);
  }

  env(gain, duration, attack = 0.005) {
    const ctx = this.ctx;
    const now = ctx.currentTime;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, now);
    g.gain.exponentialRampToValueAtTime(Math.max(0.0002, gain), now + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    return { node: g, now };
  }

  tone({ freq = 440, type = 'sine', duration = 0.12, gain = 0.08, slide = 0, delay = 0 }) {
    if (!this.ctx || this.muted) return;
    const ctx = this.ctx;
    const t = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    if (slide) osc.frequency.exponentialRampToValueAtTime(Math.max(20, freq + slide), t + duration);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(Math.max(0.0002, gain), t + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t + duration);
    osc.connect(g).connect(this.master);
    osc.start(t);
    osc.stop(t + duration + 0.02);
  }

  noise({ duration = 0.1, gain = 0.08, freq = 900, type = 'bandpass', q = 1, delay = 0 }) {
    if (!this.ctx || this.muted) return;
    const ctx = this.ctx;
    const t = ctx.currentTime + delay;
    const src = ctx.createBufferSource();
    src.buffer = this.noiseBuffer;
    const filter = ctx.createBiquadFilter();
    filter.type = type;
    filter.frequency.setValueAtTime(freq, t);
    filter.Q.value = q;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(Math.max(0.0002, gain), t + 0.006);
    g.gain.exponentialRampToValueAtTime(0.0001, t + duration);
    src.connect(filter).connect(g).connect(this.master);
    src.start(t);
    src.stop(t + duration + 0.03);
  }

  play(name, options = {}) {
    if (!this.ctx || this.muted) return;
    switch (name) {
      case 'shoot':
        this.tone({ freq: options.freq || 620, type: 'triangle', duration: 0.07, gain: 0.035, slide: -180 });
        break;
      case 'cleave':
        this.noise({ duration: 0.14, gain: 0.05, freq: 1200, type: 'highpass' });
        break;
      case 'hit':
        this.noise({ duration: 0.06, gain: 0.045, freq: 1500, type: 'bandpass', q: 0.8 });
        this.tone({ freq: 110, type: 'square', duration: 0.06, gain: 0.025, slide: -50 });
        break;
      case 'kill':
        this.tone({ freq: 95, type: 'triangle', duration: 0.14, gain: 0.05, slide: -50 });
        this.noise({ duration: 0.1, gain: 0.035, freq: 300, type: 'lowpass' });
        break;
      case 'pickup':
        this.tone({ freq: 880, type: 'sine', duration: 0.08, gain: 0.035, slide: 220 });
        this.tone({ freq: 1320, type: 'sine', duration: 0.1, gain: 0.02, delay: 0.04 });
        break;
      case 'gold':
        this.tone({ freq: 1046, type: 'triangle', duration: 0.06, gain: 0.025 });
        this.tone({ freq: 1568, type: 'triangle', duration: 0.08, gain: 0.018, delay: 0.03 });
        break;
      case 'gear':
        this.tone({ freq: 330, type: 'triangle', duration: 0.18, gain: 0.05, slide: 160 });
        this.tone({ freq: 495, type: 'sine', duration: 0.22, gain: 0.03, delay: 0.04 });
        break;
      case 'legendary':
        this.tone({ freq: 65, type: 'sine', duration: 1.4, gain: 0.11, slide: -10 });
        this.tone({ freq: 98, type: 'triangle', duration: 1.1, gain: 0.05 });
        this.tone({ freq: 196, type: 'sine', duration: 0.9, gain: 0.04, delay: 0.1 });
        this.tone({ freq: 784, type: 'sine', duration: 0.7, gain: 0.025, delay: 0.2 });
        this.noise({ duration: 0.7, gain: 0.035, freq: 2600, type: 'highpass' });
        break;
      case 'levelup':
        [392, 523, 659, 784].forEach((freq, i) => {
          this.tone({ freq, type: 'triangle', duration: 0.24, gain: 0.045, delay: i * 0.075 });
        });
        break;
      case 'hurt':
        this.tone({ freq: 130, type: 'sawtooth', duration: 0.2, gain: 0.06, slide: -60 });
        this.noise({ duration: 0.12, gain: 0.04, freq: 500, type: 'lowpass' });
        break;
      case 'heal':
        this.tone({ freq: 660, type: 'sine', duration: 0.2, gain: 0.03, slide: 220 });
        break;
      case 'boss':
        this.tone({ freq: 42, type: 'sawtooth', duration: 1.6, gain: 0.1, slide: 8 });
        this.noise({ duration: 1.2, gain: 0.06, freq: 220, type: 'lowpass' });
        this.tone({ freq: 84, type: 'square', duration: 0.8, gain: 0.03, delay: 0.3 });
        break;
      case 'evade':
        this.tone({ freq: 1200, type: 'sine', duration: 0.08, gain: 0.025, slide: 400 });
        break;
      case 'ui':
        this.tone({ freq: 420, type: 'sine', duration: 0.05, gain: 0.022 });
        break;
      case 'deny':
        this.tone({ freq: 160, type: 'square', duration: 0.12, gain: 0.03, slide: -40 });
        break;
      default:
        break;
    }
  }
}
