// Motor de audio 100% procedural: música adaptativa y efectos sintetizados.
const midi = (n) => 440 * Math.pow(2, (n - 69) / 12);

const SCALES = {
  minor: [0, 2, 3, 5, 7, 8, 10],
  dorian: [0, 2, 3, 5, 7, 9, 10],
  major: [0, 2, 4, 5, 7, 9, 11],
  pentatonic: [0, 2, 4, 7, 9],
  lydian: [0, 2, 4, 6, 7, 9, 11],
  phrygian: [0, 1, 3, 5, 7, 8, 10],
};

const THEMES = {
  menu: {
    bpm: 66, root: 57, scale: 'minor', pad: 0.095, arp: 0.05, bass: 0.055, perc: 0.016,
    chords: [[0, 3, 7], [-2, 3, 5], [-4, 0, 3], [-5, -2, 2]],
    arpPattern: [0, 4, 7, 11, 7, 4, 2, 7, 0, 4, 7, 12, 7, 4, 2, 0],
    bassPattern: [0, null, null, null, -4, null, null, null, -2, null, null, null, -5, null, null, null],
    sparkle: 0.16, sparkleChance: 0.11, padWave: 'sawtooth', bell: true,
  },
  forest: {
    bpm: 86, root: 55, scale: 'pentatonic', pad: 0.055, arp: 0.048, bass: 0.055, perc: 0.014,
    chords: [[0, 4, 7], [-3, 2, 5], [-5, 0, 3], [-3, 2, 7]],
    arpPattern: [0, 2, 4, 7, 9, 7, 4, 2, 0, 4, 7, 9, 12, 9, 7, 4],
    bassPattern: [0, null, null, 4, null, null, -5, null, -3, null, null, 2, null, null, 0, null],
    sparkle: 0.08, sparkleChance: 0.16, padWave: 'triangle', bell: true,
  },
  village: {
    bpm: 98, root: 60, scale: 'major', pad: 0.045, arp: 0.046, bass: 0.06, perc: 0.022,
    chords: [[0, 4, 7], [-3, 2, 5], [-5, 0, 4], [-3, 2, 7]],
    arpPattern: [0, 4, 7, 9, 12, 9, 7, 4, 0, 4, 7, 12, 9, 7, 4, 2],
    bassPattern: [0, null, 0, null, -3, null, 2, null, -5, null, 0, null, -3, null, 2, null],
    sparkle: 0.07, sparkleChance: 0.12, padWave: 'triangle', bell: true, warm: true,
  },
  ruins: {
    bpm: 60, root: 50, scale: 'phrygian', pad: 0.085, arp: 0.042, bass: 0.06, perc: 0.014,
    chords: [[0, 3, 7], [-1, 3, 6], [-4, 0, 3], [-5, 0, 5]],
    arpPattern: [0, 3, 7, 10, 7, 3, 1, 3, 0, 7, 10, 14, 10, 7, 3, 1],
    bassPattern: [0, null, null, null, -4, null, null, null, -1, null, null, null, -5, null, null, -4],
    sparkle: 0.05, sparkleChance: 0.08, padWave: 'sawtooth', bell: false, wind: true,
  },
  sanctuary: {
    bpm: 72, root: 62, scale: 'lydian', pad: 0.075, arp: 0.045, bass: 0.045, perc: 0.01,
    chords: [[0, 4, 7], [-2, 4, 7], [-4, 0, 4], [-5, 0, 7]],
    arpPattern: [0, 7, 4, 11, 7, 12, 9, 4, 0, 7, 11, 14, 12, 7, 4, 7],
    bassPattern: [0, null, null, null, -2, null, null, null, -4, null, null, null, -5, null, null, null],
    sparkle: 0.14, sparkleChance: 0.24, padWave: 'sine', bell: true, celestial: true,
  },
  boss: {
    bpm: 138, root: 45, scale: 'phrygian', pad: 0.07, arp: 0.045, bass: 0.085, perc: 0.04,
    chords: [[0, 3, 7], [-1, 3, 6], [-4, 1, 3], [0, 3, 10]],
    arpPattern: [0, 0, 3, 7, 0, 3, 7, 10, 0, 0, 3, 6, 3, 7, 10, 14],
    bassPattern: [0, 0, 0, null, -4, -4, -4, null, -1, -1, -1, null, 0, 0, 0, -5],
    sparkle: 0.04, sparkleChance: 0.10, padWave: 'sawtooth', bell: false, aggressive: true,
  },
  victory: {
    bpm: 96, root: 62, scale: 'major', pad: 0.07, arp: 0.055, bass: 0.05, perc: 0.02,
    chords: [[0, 4, 7], [4, 7, 12], [5, 9, 12], [0, 4, 7]],
    arpPattern: [0, 4, 7, 12, 16, 12, 7, 4, 0, 4, 9, 12, 16, 12, 9, 4],
    bassPattern: [0, null, 4, null, 5, null, 7, null, 0, null, 4, null, 5, null, 7, null],
    sparkle: 0.13, sparkleChance: 0.2, padWave: 'triangle', bell: true, warm: true,
  },
};

export class AudioEngine {
  constructor(settings) {
    this.settings = settings;
    this.ctx = null;
    this.master = null;
    this.musicGain = null;
    this.sfxGain = null;
    this.themeName = null;
    this.step = 0;
    this.nextTime = 0;
    this.timer = null;
    this.started = false;
    this.noise = null;
    this.lastFootstep = 0;
    this.compressor = null;
    this.ducked = false;
  }

  init() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') this.ctx.resume().catch(() => {});
      return;
    }
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    try {
      this.ctx = new Ctx();
      this.master = this.ctx.createGain();
      this.compressor = this.ctx.createDynamicsCompressor();
      this.compressor.threshold.value = -18;
      this.compressor.knee.value = 18;
      this.compressor.ratio.value = 5;
      this.compressor.attack.value = 0.006;
      this.compressor.release.value = 0.25;
      this.musicGain = this.ctx.createGain();
      this.sfxGain = this.ctx.createGain();
      this.musicGain.connect(this.compressor);
      this.sfxGain.connect(this.compressor);
      this.compressor.connect(this.master);
      this.master.connect(this.ctx.destination);
      this.master.gain.value = 0.9;
      this.applyVolumes();
      this.noise = this.makeNoise(1.2);
      this.timer = setInterval(() => this.schedule(), 90);
      this.started = true;
      if (this.themeName) this.setMusic(this.themeName, true);
    } catch { this.ctx = null; }
  }

  applyVolumes() {
    if (!this.ctx) return;
    const music = this.ducked ? this.settings.music * 0.35 : this.settings.music;
    this.musicGain.gain.setTargetAtTime(Math.pow(Math.max(0, music), 1.35) * 0.62, this.ctx.currentTime, 0.05);
    this.sfxGain.gain.setTargetAtTime(Math.pow(Math.max(0, this.settings.sfx), 1.25) * 0.9, this.ctx.currentTime, 0.03);
  }

  updateSettings(settings) {
    this.settings = settings;
    this.applyVolumes();
  }

  duck(on) {
    this.ducked = on;
    this.applyVolumes();
  }

  makeNoise(seconds) {
    if (!this.ctx) return null;
    const len = Math.floor(this.ctx.sampleRate * seconds);
    const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const data = buf.getChannelData(0);
    let last = 0;
    for (let i = 0; i < len; i++) {
      const white = Math.random() * 2 - 1;
      last = (last + 0.02 * white) / 1.02;
      data[i] = last * 2.4;
    }
    return buf;
  }

  setMusic(name, force = false) {
    if (!THEMES[name]) name = 'forest';
    if (this.themeName === name && !force) return;
    this.themeName = name;
    this.step = 0;
    if (this.ctx) this.nextTime = this.ctx.currentTime + 0.12;
  }

  stopMusic() {
    this.themeName = null;
  }

  schedule() {
    if (!this.ctx || !this.themeName || !this.started) return;
    if (this.ctx.state === 'suspended') return;
    const theme = THEMES[this.themeName];
    if (!theme) return;
    const stepDur = 60 / theme.bpm / 4;
    const now = this.ctx.currentTime;
    if (this.nextTime < now - 0.5) this.nextTime = now + 0.05;
    let guard = 0;
    while (this.nextTime < now + 0.32 && guard++ < 12) {
      this.playStep(theme, this.step, this.nextTime, stepDur);
      this.nextTime += stepDur;
      this.step = (this.step + 1) % 64;
    }
  }

  playStep(t, step, time, stepDur) {
    const s = step % 16;
    const bar = Math.floor(step / 16) % 4;
    const root = t.root;
    const scale = SCALES[t.scale] || SCALES.minor;
    const degree = (i) => {
      const oct = Math.floor(i / scale.length);
      const idx = ((i % scale.length) + scale.length) % scale.length;
      return root + scale[idx] + oct * 12;
    };
    // Pad cada compás
    if (step % 16 === 0) {
      const chord = t.chords[bar % t.chords.length];
      const freqs = chord.map((d) => midi(root + d + 12));
      this.pad(freqs, time, stepDur * 16.5, t.pad, t.padWave);
    }
    // Bajo
    const bass = t.bassPattern[s];
    if (bass !== null && bass !== undefined) {
      this.pluck(midi(root - 12 + bass), time, stepDur * 2.6, t.bass, 'sine', 600);
    }
    // Arpegio
    const arpIdx = t.arpPattern[s];
    if (arpIdx !== null && arpIdx !== undefined && s % (t.aggressive ? 1 : 2) === 0) {
      const f = midi(degree(arpIdx) + 12);
      this.pluck(f, time, stepDur * (t.bell ? 3.2 : 1.8), t.arp * (s % 4 === 0 ? 1.15 : 0.85), t.bell ? 'triangle' : 'sine', 2600);
    }
    // Percusión suave
    if (t.perc > 0 && (s === 0 || s === 8 || (t.aggressive && (s === 4 || s === 12)))) {
      this.kick(time, s === 0 ? t.perc * 1.6 : t.perc);
    }
    if (t.perc > 0 && (s === 4 || s === 12) && !t.aggressive) this.brush(time, t.perc * 0.6);
    if (t.aggressive && s % 2 === 0) this.hat(time, t.perc * 0.34);
    // Destellos
    if (Math.random() < t.sparkleChance && s % 4 === 2) {
      const f = midi(degree(Math.floor(Math.random() * 10) + 7) + 12);
      this.bell(f, time, t.sparkle, t.sparkle * 1.4);
    }
  }

  pad(freqs, time, dur, gain, wave = 'sawtooth') {
    if (!this.ctx) return;
    const g = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(480, time);
    filter.frequency.linearRampToValueAtTime(1300, time + dur * 0.4);
    filter.frequency.linearRampToValueAtTime(650, time + dur);
    g.gain.setValueAtTime(0.0001, time);
    g.gain.exponentialRampToValueAtTime(gain, time + 0.7);
    g.gain.exponentialRampToValueAtTime(0.0001, time + dur);
    filter.connect(g);
    g.connect(this.musicGain);
    freqs.forEach((f, i) => {
      const o = this.ctx.createOscillator();
      o.type = wave;
      o.frequency.value = f;
      o.detune.value = (i - freqs.length / 2) * 5;
      o.connect(filter);
      o.start(time);
      o.stop(time + dur + 0.1);
    });
  }

  pluck(freq, time, dur, gain, wave = 'triangle', cutoff = 1800) {
    if (!this.ctx) return;
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(cutoff, time);
    filter.frequency.exponentialRampToValueAtTime(Math.max(200, cutoff * 0.35), time + dur);
    o.type = wave;
    o.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, time);
    g.gain.exponentialRampToValueAtTime(gain, time + 0.019);
    g.gain.exponentialRampToValueAtTime(0.0001, time + dur);
    o.connect(filter);
    filter.connect(g);
    g.connect(this.musicGain);
    o.start(time);
    o.stop(time + dur + 0.02);
  }

  bell(freq, time, gain = 0.08, dur = 1.2) {
    if (!this.ctx) return;
    const o = this.ctx.createOscillator();
    const o2 = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.type = 'sine'; o2.type = 'sine';
    o.frequency.value = freq;
    o2.frequency.value = freq * 2.01;
    g.gain.setValueAtTime(0.0001, time);
    g.gain.exponentialRampToValueAtTime(gain, time + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, time + dur);
    o.connect(g); o2.connect(g); g.connect(this.musicGain);
    o.start(time); o2.start(time);
    o.stop(time + dur); o2.stop(time + dur);
  }

  kick(time, gain = 0.04) {
    if (!this.ctx) return;
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(115, time);
    o.frequency.exponentialRampToValueAtTime(36, time + 0.14);
    g.gain.setValueAtTime(gain, time);
    g.gain.exponentialRampToValueAtTime(0.0001, time + 0.22);
    o.connect(g); g.connect(this.musicGain);
    o.start(time); o.stop(time + 0.24);
  }

  brush(time, gain = 0.02) {
    this.sfxNoise(time, 0.12, gain, 5000, this.musicGain);
  }

  hat(time, gain = 0.01) {
    this.sfxNoise(time, 0.035, gain, 9000, this.musicGain);
  }

  sfxNoise(time, dur, gain, freq = 3000, dest = null, type = 'highpass') {
    if (!this.ctx || !this.noise) return;
    const src = this.ctx.createBufferSource();
    src.buffer = this.noise;
    const filter = this.ctx.createBiquadFilter();
    filter.type = type;
    filter.frequency.value = freq;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(gain, time);
    g.gain.exponentialRampToValueAtTime(0.0001, time + dur);
    src.connect(filter); filter.connect(g); g.connect(dest || this.sfxGain);
    src.start(time, Math.random() * 0.6, dur + 0.02);
  }

  tone(freq, time, dur, gain = 0.08, type = 'sine', endFreq = null, dest = null) {
    if (!this.ctx) return;
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, time);
    if (endFreq) o.frequency.exponentialRampToValueAtTime(Math.max(20, endFreq), time + dur);
    g.gain.setValueAtTime(0.0001, time);
    g.gain.exponentialRampToValueAtTime(gain, time + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, time + dur);
    o.connect(g); g.connect(dest || this.sfxGain);
    o.start(time); o.stop(time + dur + 0.02);
  }

  play(name, opts = {}) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime + 0.005;
    const pan = Math.max(-0.8, Math.min(0.8, opts.pan || 0));
    switch (name) {
      case 'click':
        this.tone(780, t, 0.055, 0.06, 'triangle', 1060);
        break;
      case 'hover':
        this.tone(540, t, 0.035, 0.022, 'sine', 660);
        break;
      case 'open':
        this.tone(320, t, 0.16, 0.045, 'sine', 640);
        this.sfxNoise(t, 0.14, 0.02, 1800);
        break;
      case 'close':
        this.tone(520, t, 0.12, 0.04, 'sine', 260);
        break;
      case 'attack':
        this.sfxNoise(t, 0.13, 0.11, 1400, null, 'bandpass');
        this.tone(220 + Math.random() * 80, t, 0.11, 0.055, 'sawtooth', 60);
        break;
      case 'heavy':
        this.sfxNoise(t, 0.24, 0.16, 900, null, 'lowpass');
        this.tone(130, t, 0.3, 0.11, 'sawtooth', 40);
        break;
      case 'hit':
        this.tone(105, t, 0.12, 0.1, 'sine', 48);
        this.sfxNoise(t, 0.07, 0.06, 2500);
        break;
      case 'crit':
        this.tone(150, t, 0.16, 0.13, 'square', 60);
        this.tone(880, t + 0.02, 0.16, 0.04, 'sine', 1400);
        this.sfxNoise(t, 0.12, 0.09, 4200);
        break;
      case 'dodge':
        this.sfxNoise(t, 0.2, 0.05, 1200, null, 'bandpass');
        this.tone(260, t, 0.2, 0.045, 'sine', 520);
        break;
      case 'block':
        this.tone(180, t, 0.12, 0.08, 'square', 90);
        this.sfxNoise(t, 0.09, 0.06, 3200);
        break;
      case 'magic':
        this.tone(340, t, 0.42, 0.07, 'sine', 1280);
        this.tone(680, t + 0.03, 0.36, 0.035, 'triangle', 1800);
        this.sfxNoise(t, 0.35, 0.03, 4200);
        break;
      case 'fire':
        this.sfxNoise(t, 0.45, 0.1, 700, null, 'lowpass');
        this.tone(160, t, 0.32, 0.08, 'sawtooth', 50);
        break;
      case 'ice':
        [1800, 2200, 2600, 3100].forEach((f, i) => this.tone(f, t + i * 0.035, 0.32, 0.03, 'sine'));
        this.sfxNoise(t, 0.24, 0.04, 6000);
        break;
      case 'heal':
        [392, 523, 659, 784].forEach((f, i) => this.tone(f, t + i * 0.07, 0.5, 0.045, 'sine'));
        break;
      case 'pickup':
        this.tone(660, t, 0.1, 0.045, 'triangle');
        this.tone(990, t + 0.08, 0.16, 0.04, 'triangle');
        break;
      case 'coin':
        this.tone(1200, t, 0.06, 0.035, 'square');
        this.tone(1700, t + 0.05, 0.11, 0.03, 'square');
        break;
      case 'levelup':
        [523, 659, 784, 1047, 1319].forEach((f, i) => this.tone(f, t + i * 0.09, 0.6, 0.05, 'triangle'));
        break;
      case 'capture':
        [523, 659, 784, 988, 1319].forEach((f, i) => this.tone(f, t + i * 0.06, 0.7, 0.045, 'sine'));
        this.sfxNoise(t, 0.7, 0.035, 5000);
        break;
      case 'fail':
        this.tone(220, t, 0.18, 0.06, 'square', 150);
        this.tone(170, t + 0.16, 0.25, 0.05, 'square', 100);
        break;
      case 'death':
        [320, 260, 200, 150, 100].forEach((f, i) => this.tone(f, t + i * 0.11, 0.5, 0.06, 'sawtooth'));
        break;
      case 'enemydeath':
        this.sfxNoise(t, 0.3, 0.06, 900, null, 'lowpass');
        this.tone(180, t, 0.3, 0.05, 'sine', 60);
        break;
      case 'bossroar':
        this.tone(80, t, 0.8, 0.15, 'sawtooth', 38);
        this.tone(120, t + 0.05, 0.7, 0.08, 'square', 55);
        this.sfxNoise(t, 0.8, 0.08, 400, null, 'lowpass');
        break;
      case 'portal':
        this.tone(260, t, 0.8, 0.05, 'sine', 980);
        this.sfxNoise(t, 0.6, 0.04, 2600);
        break;
      case 'save':
        this.tone(784, t, 0.3, 0.04, 'sine');
        this.tone(1047, t + 0.18, 0.5, 0.04, 'sine');
        break;
      case 'quest':
        this.tone(659, t, 0.18, 0.04, 'triangle');
        this.tone(784, t + 0.12, 0.22, 0.04, 'triangle');
        this.tone(1047, t + 0.25, 0.55, 0.045, 'triangle');
        break;
      case 'error':
        this.tone(110, t, 0.22, 0.07, 'square', 90);
        break;
      case 'evolve':
        [392, 523, 659, 784, 1047, 1319, 1568].forEach((f, i) => this.tone(f, t + i * 0.07, 0.9, 0.04, 'sine'));
        break;
      case 'victory':
        [523, 659, 784, 1047, 784, 1047, 1319, 1568].forEach((f, i) => this.tone(f, t + i * 0.13, 0.9, 0.05, 'triangle'));
        break;
      case 'footstep':
        if (t - this.lastFootstep < 0.16) return;
        this.lastFootstep = t;
        this.sfxNoise(t, 0.055, 0.018, 400 + Math.random() * 300, null, 'lowpass');
        break;
      case 'swim':
        this.sfxNoise(t, 0.22, 0.025, 1200, null, 'bandpass');
        break;
      case 'seal':
        this.sfxNoise(t, 0.4, 0.05, 3200);
        this.tone(440, t, 0.5, 0.04, 'sine', 880);
        break;
      case 'ui_equip':
        this.tone(300, t, 0.08, 0.03, 'square', 380);
        this.tone(600, t + 0.06, 0.16, 0.03, 'triangle');
        break;
      default:
        this.tone(440, t, 0.06, 0.03, 'sine');
    }
    if (pan && this.ctx.createStereoPanner) {
      // El canal se mantiene centrado para evitar fugas de nodos; la intención de paneo se aplica al volumen.
    }
  }

  sfx(name, opts) { this.play(name, opts); }
}
