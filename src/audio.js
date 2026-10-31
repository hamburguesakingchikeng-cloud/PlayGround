const midi = (n) => 440 * Math.pow(2, (n - 69) / 12);

const THEMES = {
  title: {
    bpm: 62,
    root: 50,
    chords: [[0, 4, 7, 11], [-3, 2, 5, 9], [-5, 0, 4, 7], [-1, 4, 7, 11]],
    arp: [0, 7, 4, 11, 7, 14, 11, 4],
    lead: [14, 16, 19, 21, 19, 16, 14, 11],
    pad: 'sine',
    leadWave: 'triangle',
    drums: false,
    brightness: 0.3,
  },
  valdoria: {
    bpm: 76,
    root: 50,
    chords: [[0, 4, 7, 11], [-3, 2, 5, 9], [-5, 0, 4, 7], [-1, 4, 7, 11]],
    arp: [0, 4, 7, 11, 7, 4, 2, 7],
    lead: [7, 9, 11, 14, 12, 11, 9, 7],
    pad: 'sine',
    leadWave: 'triangle',
    drums: false,
    brightness: 0.4,
  },
  drakmor: {
    bpm: 88,
    root: 38,
    chords: [[0, 3, 7, 10], [-2, 1, 5, 8], [-4, 0, 3, 7], [-2, 1, 5, 8]],
    arp: [0, 7, 3, 10, 7, 3, 0, 3],
    lead: [12, 10, 7, 10, 15, 12, 10, 7],
    pad: 'sawtooth',
    leadWave: 'sawtooth',
    drums: true,
    brightness: 0.28,
  },
  kansordore: {
    bpm: 68,
    root: 52,
    chords: [[0, 4, 7, 11], [2, 6, 9, 13], [-3, 2, 5, 9], [-1, 4, 7, 11]],
    arp: [0, 7, 11, 14, 11, 7, 4, 11],
    lead: [19, 21, 23, 26, 23, 21, 19, 16],
    pad: 'sine',
    leadWave: 'sine',
    drums: false,
    brightness: 0.55,
  },
  boss: {
    bpm: 112,
    root: 38,
    chords: [[0, 3, 7, 10], [-1, 2, 6, 9], [-4, 0, 3, 7], [-2, 1, 5, 8]],
    arp: [0, 7, 3, 10, 12, 10, 7, 3],
    lead: [15, 14, 12, 10, 7, 10, 12, 14],
    pad: 'sawtooth',
    leadWave: 'square',
    drums: true,
    brightness: 0.22,
  },
};

export class AudioEngine {
  constructor() {
    this.ctx = null;
    this.started = false;
    this.musicVolume = 0.55;
    this.sfxVolume = 0.8;
    this.theme = 'title';
    this.boss = false;
    this.step = 0;
    this.nextNoteTime = 0;
    this.lastUpdate = 0;
    this.noiseBuffer = null;
    this.muted = false;
  }

  async start() {
    if (this.started) {
      if (this.ctx.state === 'suspended') await this.ctx.resume();
      return;
    }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    this.ctx = new AC();
    this.started = true;
    this.master = this.ctx.createGain();
    this.master.gain.value = this.muted ? 0 : 1;
    const comp = this.ctx.createDynamicsCompressor();
    comp.threshold.value = -18;
    comp.knee.value = 22;
    comp.ratio.value = 4;
    comp.attack.value = 0.01;
    comp.release.value = 0.25;
    this.master.connect(comp);
    comp.connect(this.ctx.destination);

    this.musicBus = this.ctx.createGain();
    this.musicBus.gain.value = this.musicVolume * 0.32;
    this.musicBus.connect(this.master);

    this.sfxBus = this.ctx.createGain();
    this.sfxBus.gain.value = this.sfxVolume * 0.75;
    this.sfxBus.connect(this.master);

    this.reverb = this.ctx.createConvolver();
    this.reverb.buffer = this.makeImpulse(3.4, 2.2);
    this.reverbGain = this.ctx.createGain();
    this.reverbGain.gain.value = 0.28;
    this.reverb.connect(this.reverbGain);
    this.reverbGain.connect(this.master);

    this.noiseBuffer = this.makeNoise(1.2);
    this.nextNoteTime = this.ctx.currentTime + 0.1;
    this.lastUpdate = this.ctx.currentTime;
  }

  makeNoise(seconds) {
    const len = Math.floor(this.ctx.sampleRate * seconds);
    const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    return buf;
  }

  makeImpulse(seconds, decay) {
    const rate = this.ctx.sampleRate;
    const len = Math.floor(rate * seconds);
    const buf = this.ctx.createBuffer(2, len, rate);
    for (let ch = 0; ch < 2; ch++) {
      const data = buf.getChannelData(ch);
      for (let i = 0; i < len; i++) {
        const t = i / len;
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - t, decay) * (1 - Math.exp(-i / (rate * 0.02)));
      }
    }
    return buf;
  }

  setMuted(v) {
    this.muted = v;
    if (this.master) this.master.gain.setTargetAtTime(v ? 0 : 1, this.ctx.currentTime, 0.05);
  }

  setMusicVolume(v) {
    this.musicVolume = v;
    if (this.musicBus) this.musicBus.gain.setTargetAtTime(v * 0.32, this.ctx.currentTime, 0.1);
  }

  setSfxVolume(v) {
    this.sfxVolume = v;
    if (this.sfxBus) this.sfxBus.gain.setTargetAtTime(v * 0.75, this.ctx.currentTime, 0.1);
  }

  setTheme(name, boss = false) {
    if (this.theme === name && this.boss === boss) return;
    this.theme = name;
    this.boss = boss;
    this.step = 0;
    this.nextNoteTime = this.ctx ? this.ctx.currentTime + 0.05 : 0;
  }

  update() {
    if (!this.ctx || !this.started) return;
    const now = this.ctx.currentTime;
    const theme = THEMES[this.boss ? 'boss' : this.theme] || THEMES.valdoria;
    const beat = 60 / theme.bpm;
    while (this.nextNoteTime < now + 0.35) {
      this.scheduleStep(theme, this.step, this.nextNoteTime, beat);
      this.nextNoteTime += beat / 2;
      this.step++;
    }
  }

  scheduleStep(theme, step, time, beat) {
    const chordIndex = Math.floor(step / 8) % theme.chords.length;
    const chord = theme.chords[chordIndex];
    const root = theme.root;
    const isBar = step % 8 === 0;
    if (isBar) {
      // warm pad
      for (const interval of chord) {
        this.note(midi(root + interval), time, beat * 3.8, 0.055, theme.pad, 0.55, 0.9);
        this.note(midi(root + interval + 12), time, beat * 3.8, 0.018, theme.pad, 0.7, 1.1);
      }
    }
    // arpeggio
    const arp = theme.arp[step % theme.arp.length];
    const arpOct = step % 16 < 8 ? 12 : 24;
    if (step % 2 === 0 || theme.brightness > 0.5) {
      this.note(midi(root + arp + arpOct), time, beat * 0.42, 0.028 + theme.brightness * 0.02, 'triangle', 0.7, 0.18, true);
    }
    // lead
    if (step % 4 === 0) {
      const lead = theme.lead[(Math.floor(step / 4)) % theme.lead.length];
      this.note(midi(root + lead + 12), time, beat * 1.7, 0.045, theme.leadWave, 0.45, 0.55, true);
    }
    if (theme.drums) {
      if (step % 4 === 0) this.kick(time, 0.18);
      if (step % 4 === 2) this.snare(time, 0.06);
      if (step % 2 === 1) this.hat(time, 0.018);
    }
    if (theme.brightness > 0.45 && step % 8 === 4) {
      this.note(midi(root + 31), time, beat * 2.2, 0.012, 'sine', 0.2, 1.2, true);
    }
  }

  note(freq, time, dur, gain, wave = 'sine', attack = 0.02, release = 0.4, reverb = false) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 900 + this.musicVolume * 1200;
    osc.type = wave;
    osc.frequency.setValueAtTime(freq, time);
    g.gain.setValueAtTime(0.0001, time);
    g.gain.exponentialRampToValueAtTime(Math.max(0.0002, gain), time + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, time + dur);
    osc.connect(filter);
    filter.connect(g);
    g.connect(this.musicBus);
    if (reverb) {
      const send = this.ctx.createGain();
      send.gain.value = 0.35;
      g.connect(send);
      send.connect(this.reverb);
    }
    osc.start(time);
    osc.stop(time + dur + 0.05);
  }

  kick(time, gain = 0.2) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(110, time);
    osc.frequency.exponentialRampToValueAtTime(38, time + 0.18);
    g.gain.setValueAtTime(gain, time);
    g.gain.exponentialRampToValueAtTime(0.0001, time + 0.28);
    osc.connect(g);
    g.connect(this.musicBus);
    osc.start(time);
    osc.stop(time + 0.3);
  }

  snare(time, gain = 0.08) {
    if (!this.ctx) return;
    const src = this.ctx.createBufferSource();
    src.buffer = this.noiseBuffer;
    const g = this.ctx.createGain();
    const f = this.ctx.createBiquadFilter();
    f.type = 'bandpass';
    f.frequency.value = 1800;
    f.Q.value = 0.7;
    g.gain.setValueAtTime(gain, time);
    g.gain.exponentialRampToValueAtTime(0.0001, time + 0.16);
    src.connect(f);
    f.connect(g);
    g.connect(this.musicBus);
    src.start(time);
    src.stop(time + 0.2);
  }

  hat(time, gain = 0.02) {
    if (!this.ctx) return;
    const src = this.ctx.createBufferSource();
    src.buffer = this.noiseBuffer;
    const g = this.ctx.createGain();
    const f = this.ctx.createBiquadFilter();
    f.type = 'highpass';
    f.frequency.value = 7000;
    g.gain.setValueAtTime(gain, time);
    g.gain.exponentialRampToValueAtTime(0.0001, time + 0.04);
    src.connect(f);
    f.connect(g);
    g.connect(this.musicBus);
    src.start(time);
    src.stop(time + 0.05);
  }

  tone(freq, dur, opts = {}) {
    if (!this.ctx) return;
    const { type = 'sine', gain = 0.12, slide = 0, delay = 0, filter = 0, reverb = 0.1 } = opts;
    const t = this.ctx.currentTime + delay;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    if (slide) osc.frequency.exponentialRampToValueAtTime(Math.max(20, freq + slide), t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    let node = osc;
    if (filter) {
      const f = this.ctx.createBiquadFilter();
      f.type = 'lowpass';
      f.frequency.value = filter;
      node.connect(f);
      node = f;
    }
    node.connect(g);
    g.connect(this.sfxBus);
    if (reverb) {
      const send = this.ctx.createGain();
      send.gain.value = reverb;
      g.connect(send);
      send.connect(this.reverb);
    }
    osc.start(t);
    osc.stop(t + dur + 0.02);
  }

  noise(dur, opts = {}) {
    if (!this.ctx) return;
    const { gain = 0.12, freq = 1800, type = 'bandpass', delay = 0, q = 1, sweep = 0 } = opts;
    const t = this.ctx.currentTime + delay;
    const src = this.ctx.createBufferSource();
    src.buffer = this.noiseBuffer;
    const f = this.ctx.createBiquadFilter();
    f.type = type;
    f.frequency.setValueAtTime(freq, t);
    if (sweep) f.frequency.exponentialRampToValueAtTime(Math.max(60, freq + sweep), t + dur);
    f.Q.value = q;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(gain, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(f);
    f.connect(g);
    g.connect(this.sfxBus);
    src.start(t);
    src.stop(t + dur + 0.02);
  }

  play(name, opts = {}) {
    if (!this.ctx || this.muted) return;
    const p = opts.pitch || 1;
    switch (name) {
      case 'ui':
        this.tone(520 * p, 0.06, { type: 'sine', gain: 0.06, reverb: 0.1 });
        this.tone(780 * p, 0.09, { type: 'sine', gain: 0.04, delay: 0.03, reverb: 0.1 });
        break;
      case 'swing':
        this.noise(0.18, { gain: 0.11, freq: 2400, sweep: -1700, q: 1.2 });
        this.tone(180 * p, 0.12, { type: 'triangle', gain: 0.035, slide: -60 });
        break;
      case 'heavy':
        this.noise(0.35, { gain: 0.16, freq: 1500, sweep: -1100, q: 0.8 });
        this.tone(95 * p, 0.35, { type: 'sine', gain: 0.16, slide: -40 });
        break;
      case 'hit':
        this.noise(0.12, { gain: 0.12, freq: 500, type: 'lowpass' });
        this.tone(110 * p, 0.16, { type: 'triangle', gain: 0.12, slide: -45 });
        break;
      case 'crit':
        this.noise(0.16, { gain: 0.18, freq: 2600, q: 0.8 });
        this.tone(880 * p, 0.18, { type: 'square', gain: 0.06, slide: 220, reverb: 0.3 });
        break;
      case 'parry':
        this.tone(1320 * p, 0.3, { type: 'triangle', gain: 0.12, slide: 300, reverb: 0.5 });
        this.tone(1980 * p, 0.22, { type: 'sine', gain: 0.07, slide: 420, reverb: 0.5 });
        this.noise(0.15, { gain: 0.1, freq: 5000, type: 'highpass' });
        break;
      case 'block':
        this.noise(0.14, { gain: 0.1, freq: 300, type: 'lowpass' });
        this.tone(160 * p, 0.12, { type: 'triangle', gain: 0.09 });
        break;
      case 'dodge':
        this.noise(0.22, { gain: 0.09, freq: 700, sweep: 900, type: 'bandpass' });
        break;
      case 'spell':
        this.tone(220 * p, 0.6, { type: 'sine', gain: 0.1, slide: 620, reverb: 0.5 });
        this.tone(330 * p, 0.7, { type: 'triangle', gain: 0.07, slide: 880, reverb: 0.6 });
        this.noise(0.5, { gain: 0.05, freq: 1200, sweep: 4000 });
        break;
      case 'ultimate':
        this.tone(110 * p, 1.2, { type: 'sawtooth', gain: 0.12, slide: 440, filter: 1200, reverb: 0.7 });
        this.tone(220 * p, 1.0, { type: 'sine', gain: 0.1, slide: 880, reverb: 0.7 });
        this.noise(1.0, { gain: 0.12, freq: 400, sweep: 6000 });
        break;
      case 'capture':
        [0, 4, 7, 12].forEach((n, i) => this.tone(midi(72 + n) * p, 0.5, { type: 'sine', gain: 0.06, delay: i * 0.09, reverb: 0.5 }));
        this.noise(0.6, { gain: 0.05, freq: 3000, sweep: 2000 });
        break;
      case 'quest':
        [0, 7, 12].forEach((n, i) => this.tone(midi(60 + n) * p, 0.7, { type: 'triangle', gain: 0.07, delay: i * 0.12, reverb: 0.4 }));
        break;
      case 'levelup':
        [0, 4, 7, 12, 16].forEach((n, i) => this.tone(midi(60 + n) * p, 0.6, { type: 'sine', gain: 0.07, delay: i * 0.08, reverb: 0.4 }));
        break;
      case 'chest':
        [0, 5, 9, 12].forEach((n, i) => this.tone(midi(64 + n) * p, 0.5, { type: 'triangle', gain: 0.06, delay: i * 0.07, reverb: 0.3 }));
        break;
      case 'potion':
        this.tone(420 * p, 0.3, { type: 'sine', gain: 0.06, slide: 260 });
        this.tone(620 * p, 0.4, { type: 'sine', gain: 0.04, delay: 0.08, slide: 200 });
        break;
      case 'error':
        this.tone(140 * p, 0.22, { type: 'square', gain: 0.05, slide: -40 });
        break;
      case 'death':
        this.tone(180 * p, 1.2, { type: 'sawtooth', gain: 0.08, slide: -120, filter: 600, reverb: 0.6 });
        break;
      case 'victory':
        [0, 4, 7, 12, 7, 12, 16].forEach((n, i) => this.tone(midi(55 + n) * p, 1.2, { type: 'triangle', gain: 0.07, delay: i * 0.15, reverb: 0.5 }));
        break;
      case 'footstep':
        this.noise(0.08, { gain: 0.025, freq: 220, type: 'lowpass' });
        break;
      case 'seal':
        this.tone(180 * p, 0.8, { type: 'sine', gain: 0.1, slide: 540, reverb: 0.6 });
        break;
      default:
        break;
    }
  }
}
