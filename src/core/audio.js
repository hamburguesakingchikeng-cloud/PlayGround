const NOTE = {
  C2: 65.41, D2: 73.42, E2: 82.41, F2: 87.31, G2: 98.0, A2: 110.0, Bb2: 116.54, B2: 123.47,
  C3: 130.81, D3: 146.83, E3: 164.81, F3: 174.61, G3: 196.0, A3: 220.0, Bb3: 233.08, B3: 246.94,
  C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.0, A4: 440.0, Bb4: 466.16, B4: 493.88,
  C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99, A5: 880.0, Bb5: 932.33, B5: 987.77,
  C6: 1046.5, D6: 1174.66, E6: 1318.51, G6: 1567.98, A6: 1760.0,
};

const PROGRESSIONS = {
  title: [
    [NOTE.D3, NOTE.F3, NOTE.A3, NOTE.C4],
    [NOTE.Bb2, NOTE.D3, NOTE.F3, NOTE.A3],
    [NOTE.F2, NOTE.A2, NOTE.C3, NOTE.E3],
    [NOTE.C3, NOTE.E3, NOTE.G3, NOTE.Bb3],
  ],
  valdoria: [
    [NOTE.D3, NOTE.F3, NOTE.A3, NOTE.D4],
    [NOTE.Bb2, NOTE.D3, NOTE.F3, NOTE.A3],
    [NOTE.F2, NOTE.A2, NOTE.C3, NOTE.E3],
    [NOTE.C3, NOTE.E3, NOTE.G3, NOTE.D4],
  ],
  drakmore: [
    [NOTE.D3, NOTE.F3, NOTE.A3, NOTE.C4],
    [NOTE.Bb2, NOTE.D3, NOTE.F3, NOTE.A3],
    [NOTE.G2, NOTE.Bb2, NOTE.D3, NOTE.F3],
    [NOTE.A2, NOTE.C3, NOTE.E3, NOTE.G3],
  ],
  kansordore: [
    [NOTE.F3, NOTE.A3, NOTE.C4, NOTE.E4],
    [NOTE.A2, NOTE.C3, NOTE.E3, NOTE.G3],
    [NOTE.D3, NOTE.F3, NOTE.A3, NOTE.C4],
    [NOTE.Bb2, NOTE.D3, NOTE.F3, NOTE.A3],
  ],
  combat: [
    [NOTE.D3, NOTE.F3, NOTE.A3, NOTE.D4],
    [NOTE.D3, NOTE.F3, NOTE.A3, NOTE.C4],
    [NOTE.Bb2, NOTE.D3, NOTE.F3, NOTE.A3],
    [NOTE.A2, NOTE.C3, NOTE.E3, NOTE.G3],
  ],
  boss: [
    [NOTE.D2, NOTE.D3, NOTE.F3, NOTE.A3],
    [NOTE.C2, NOTE.C3, NOTE.E3, NOTE.G3],
    [NOTE.Bb2, NOTE.Bb3, NOTE.D4, NOTE.F4],
    [NOTE.A2, NOTE.A3, NOTE.C4, NOTE.E4],
  ],
};

const SCALES = {
  valdoria: [NOTE.D4, NOTE.E4, NOTE.F4, NOTE.A4, NOTE.C5, NOTE.D5, NOTE.F5, NOTE.A5],
  drakmore: [NOTE.D4, NOTE.F4, NOTE.G4, NOTE.A4, NOTE.C5, NOTE.D5, NOTE.F5, NOTE.G5],
  kansordore: [NOTE.F4, NOTE.G4, NOTE.A4, NOTE.C5, NOTE.D5, NOTE.E5, NOTE.G5, NOTE.A5],
  title: [NOTE.D4, NOTE.F4, NOTE.A4, NOTE.C5, NOTE.D5, NOTE.F5, NOTE.A5, NOTE.C6],
  combat: [NOTE.D4, NOTE.F4, NOTE.G4, NOTE.A4, NOTE.C5, NOTE.D5, NOTE.F5, NOTE.G5],
  boss: [NOTE.D4, NOTE.F4, NOTE.A4, NOTE.Bb4, NOTE.C5, NOTE.D5, NOTE.F5, NOTE.A5],
};

export class AudioEngine {
  constructor() {
    this.ctx = null;
    this.started = false;
    this.mood = 'title';
    this.volumes = { master: 0.8, music: 0.55, sfx: 0.75 };
    this.nextChord = 0;
    this.nextMelody = 0;
    this.nextPulse = 0;
    this.chordIndex = 0;
    this.combat = false;
    this._muted = false;
    this._ambientTimer = 0;
    this._lastHurt = 0;
  }

  async init() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') await this.ctx.resume();
      return;
    }
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    this.ctx = new Ctx();
    this.master = this.ctx.createGain();
    this.master.gain.value = this.volumes.master;
    this.master.connect(this.ctx.destination);
    const comp = this.ctx.createDynamicsCompressor();
    comp.threshold.value = -18;
    comp.knee.value = 18;
    comp.ratio.value = 3;
    comp.attack.value = 0.01;
    comp.release.value = 0.3;
    comp.connect(this.master);
    this.bus = comp;

    this.reverb = this.ctx.createConvolver();
    this.reverb.buffer = this.makeImpulse(3.2, 2.4);
    this.reverbGain = this.ctx.createGain();
    this.reverbGain.gain.value = 0.28;
    this.reverb.connect(this.reverbGain);
    this.reverbGain.connect(this.bus);

    this.music = this.ctx.createGain();
    this.music.gain.value = this.volumes.music;
    this.music.connect(this.bus);
    this.music.connect(this.reverb);

    this.sfx = this.ctx.createGain();
    this.sfx.gain.value = this.volumes.sfx;
    this.sfx.connect(this.bus);
    this.sfxReverb = this.ctx.createGain();
    this.sfxReverb.gain.value = 0.12;
    this.sfxReverb.connect(this.reverb);

    this.noise = this.makeNoise(2.0);
    this.started = true;
    this.nextChord = this.ctx.currentTime + 0.1;
    this.nextMelody = this.ctx.currentTime + 0.8;
    this.nextPulse = this.ctx.currentTime + 0.3;
    this.scheduleAmbient();
  }

  makeImpulse(seconds, decay) {
    const rate = this.ctx.sampleRate;
    const length = Math.floor(rate * seconds);
    const buffer = this.ctx.createBuffer(2, length, rate);
    for (let c = 0; c < 2; c++) {
      const data = buffer.getChannelData(c);
      for (let i = 0; i < length; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay) * (1 - Math.random() * 0.2);
      }
    }
    return buffer;
  }

  makeNoise(seconds) {
    const rate = this.ctx.sampleRate;
    const buffer = this.ctx.createBuffer(1, Math.floor(rate * seconds), rate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    return buffer;
  }

  setVolume(kind, value) {
    this.volumes[kind] = value;
    if (!this.ctx) return;
    const target = kind === 'master' ? this.master : kind === 'music' ? this.music : this.sfx;
    target?.gain.setTargetAtTime(value, this.ctx.currentTime, 0.08);
  }

  setMood(mood) {
    if (!mood || this.mood === mood) return;
    this.mood = mood;
    this.combat = mood === 'combat' || mood === 'boss';
    this.chordIndex = 0;
    if (this.ctx) this.nextChord = this.ctx.currentTime + 0.1;
  }

  update(dt) {
    if (!this.started || !this.ctx) return;
    const now = this.ctx.currentTime;
    const prog = PROGRESSIONS[this.mood] || PROGRESSIONS.valdoria;
    const chordLen = this.mood === 'boss' ? 3.2 : this.mood === 'combat' ? 3.5 : 4.8;
    while (this.nextChord < now + 0.2) {
      const chord = prog[this.chordIndex % prog.length];
      this.playPad(chord, chordLen, this.nextChord);
      if (this.mood === 'boss') this.playBossOstinato(chord[0], this.nextChord, chordLen);
      this.chordIndex++;
      this.nextChord += chordLen;
    }
    const melodyGap = this.mood === 'combat' ? 0.62 : this.mood === 'boss' ? 0.5 : 1.35;
    while (this.nextMelody < now + 0.2) {
      if (Math.random() < (this.combat ? 0.72 : 0.58)) {
        const scale = SCALES[this.mood] || SCALES.valdoria;
        const note = scale[Math.floor(Math.random() * scale.length)];
        this.playPluck(note, this.nextMelody, this.combat ? 0.09 : 0.075);
      }
      this.nextMelody += melodyGap * (0.75 + Math.random() * 0.6);
    }
    if (this.combat) {
      while (this.nextPulse < now + 0.15) {
        this.playPulse(this.nextPulse, this.mood === 'boss' ? 0.16 : 0.1);
        this.nextPulse += this.mood === 'boss' ? 0.54 : 0.72;
      }
    }
    this._ambientTimer += dt;
    if (this._ambientTimer > 7) {
      this._ambientTimer = 0;
      this.playAmbient();
    }
  }

  scheduleAmbient() {
    if (!this.ctx) return;
    this.nextChord = this.ctx.currentTime + 0.1;
    this.nextMelody = this.ctx.currentTime + 1.0;
    this.nextPulse = this.ctx.currentTime + 0.5;
  }

  playPad(freqs, duration, time) {
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = this.mood === 'drakmore' ? 620 : this.mood === 'boss' ? 520 : 950;
    filter.Q.value = 0.5;
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(this.mood === 'boss' ? 0.03 : 0.022, time + 0.9);
    gain.gain.setValueAtTime(this.mood === 'boss' ? 0.03 : 0.022, time + duration - 1.2);
    gain.gain.linearRampToValueAtTime(0, time + duration);
    filter.connect(gain);
    gain.connect(this.music);
    for (const f of freqs) {
      for (const detune of [-6, 5]) {
        const o = this.ctx.createOscillator();
        o.type = 'sawtooth';
        o.frequency.value = f;
        o.detune.value = detune;
        o.connect(filter);
        o.start(time);
        o.stop(time + duration + 0.1);
      }
    }
  }

  playPluck(freq, time, vol = 0.08) {
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    const f = this.ctx.createBiquadFilter();
    o.type = 'triangle';
    o.frequency.value = freq;
    f.type = 'lowpass';
    f.frequency.value = 2200;
    g.gain.setValueAtTime(0, time);
    g.gain.linearRampToValueAtTime(vol, time + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, time + 1.4);
    o.connect(f); f.connect(g); g.connect(this.music);
    o.start(time); o.stop(time + 1.45);
  }

  playPulse(time, vol) {
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(62, time);
    o.frequency.exponentialRampToValueAtTime(38, time + 0.18);
    g.gain.setValueAtTime(vol, time);
    g.gain.exponentialRampToValueAtTime(0.0001, time + 0.22);
    o.connect(g); g.connect(this.music);
    o.start(time); o.stop(time + 0.25);
  }

  playBossOstinato(root, time, duration) {
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0, time);
    g.gain.linearRampToValueAtTime(0.025, time + 0.2);
    g.gain.linearRampToValueAtTime(0, time + duration);
    g.connect(this.music);
    const o = this.ctx.createOscillator();
    o.type = 'sawtooth';
    o.frequency.value = root / 2;
    const f = this.ctx.createBiquadFilter();
    f.type = 'lowpass'; f.frequency.value = 180;
    o.connect(f); f.connect(g);
    o.start(time); o.stop(time + duration);
  }

  playAmbient() {
    if (!this.ctx || this.mood === 'boss') return;
    const now = this.ctx.currentTime;
    if (this.mood === 'drakmore') {
      this.noiseBurst(0.5, 180, 0.018, now, 'lowpass');
      return;
    }
    if (Math.random() < 0.65) {
      const base = this.mood === 'kansordore' ? 880 : 620;
      const o = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      o.type = 'sine';
      o.frequency.setValueAtTime(base * (0.85 + Math.random() * 0.4), now);
      o.frequency.exponentialRampToValueAtTime(base * (1.2 + Math.random() * 0.3), now + 0.22);
      g.gain.setValueAtTime(0, now);
      g.gain.linearRampToValueAtTime(0.012, now + 0.04);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);
      o.connect(g); g.connect(this.sfx);
      o.start(now); o.stop(now + 0.55);
    }
  }

  noiseBurst(duration, cutoff, vol, time, type = 'bandpass') {
    if (!this.ctx) return;
    const src = this.ctx.createBufferSource();
    src.buffer = this.noise;
    src.playbackRate.value = 1;
    const f = this.ctx.createBiquadFilter();
    f.type = type; f.frequency.value = cutoff; f.Q.value = 0.8;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(vol, time);
    g.gain.exponentialRampToValueAtTime(0.0001, time + duration);
    src.connect(f); f.connect(g); g.connect(this.sfx);
    src.start(time, Math.random() * 0.5); src.stop(time + duration + 0.02);
  }

  tone(freq, duration, type, vol, when = 0, slide = 0, bus = this.sfx) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime + when;
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t);
    if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(20, freq + slide), t + duration);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vol, t + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t + duration);
    o.connect(g); g.connect(bus);
    o.start(t); o.stop(t + duration + 0.02);
  }

  ui() { this.tone(740, 0.08, 'sine', 0.035); this.tone(1100, 0.07, 'sine', 0.018, 0.03); }
  confirm() { this.tone(440, 0.18, 'sine', 0.04); this.tone(660, 0.28, 'sine', 0.035, 0.08); this.tone(880, 0.35, 'sine', 0.025, 0.15); }
  swing() {
    if (!this.ctx) return;
    this.noiseBurst(0.18, 1700, 0.1, this.ctx.currentTime, 'highpass');
    this.tone(190, 0.12, 'sine', 0.025, 0, -70);
  }
  heavySwing() {
    if (!this.ctx) return;
    this.noiseBurst(0.32, 900, 0.13, this.ctx.currentTime, 'bandpass');
    this.tone(110, 0.3, 'sine', 0.045, 0, -50);
  }
  hit(crit = false) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    this.noiseBurst(0.1, 900, 0.08, t, 'bandpass');
    this.tone(crit ? 160 : 120, 0.16, 'square', crit ? 0.045 : 0.03, 0, -40);
    this.tone(crit ? 940 : 660, 0.12, 'triangle', 0.025, 0.01, -200);
  }
  hurt() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    if (now - this._lastHurt < 0.12) return;
    this._lastHurt = now;
    this.tone(85, 0.22, 'sawtooth', 0.06, 0, -30);
    this.noiseBurst(0.14, 420, 0.06, now, 'lowpass');
  }
  dodge() { this.noiseBurst(0.22, 1200, 0.06, this.ctx?.currentTime || 0, 'bandpass'); this.tone(300, 0.12, 'sine', 0.02, 0, 200); }
  block() { this.tone(260, 0.2, 'square', 0.04); this.tone(520, 0.25, 'triangle', 0.025, 0.01); }
  potion() { [523, 659, 784, 1046].forEach((f, i) => this.tone(f, 0.4, 'sine', 0.035, i * 0.06)); }
  capture() {
    if (!this.ctx) return;
    [392, 523, 659, 784, 1046].forEach((f, i) => this.tone(f, 0.9, 'sine', 0.035, i * 0.09));
    this.tone(1568, 1.2, 'sine', 0.018, 0.5);
  }
  quest() { [440, 554, 659, 880].forEach((f, i) => this.tone(f, 0.7, 'triangle', 0.04, i * 0.08)); }
  level() { [523, 659, 784, 1046, 1318].forEach((f, i) => this.tone(f, 1.2, 'sine', 0.045, i * 0.1)); }
  portal() {
    if (!this.ctx) return;
    this.tone(110, 1.2, 'sawtooth', 0.035, 0, 220);
    this.tone(220, 1.4, 'sine', 0.03, 0.1, 440);
    this.noiseBurst(1.2, 600, 0.04, this.ctx.currentTime, 'bandpass');
  }
  death() { this.tone(196, 1.4, 'sawtooth', 0.04, 0, -80); this.tone(98, 2.2, 'sine', 0.05, 0.1, -30); }
  bossRoar() {
    if (!this.ctx) return;
    this.tone(58, 1.4, 'sawtooth', 0.08, 0, -20);
    this.tone(87, 1.1, 'square', 0.04, 0.05, -30);
    this.noiseBurst(0.8, 250, 0.07, this.ctx.currentTime, 'lowpass');
  }
  arrow() { this.noiseBurst(0.16, 2400, 0.035, this.ctx?.currentTime || 0, 'highpass'); }
  chest() { this.tone(660, 0.25, 'triangle', 0.04); this.tone(990, 0.5, 'sine', 0.03, 0.1); }
}
