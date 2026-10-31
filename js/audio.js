const NOTE = m => 440 * Math.pow(2, (m - 69) / 12);
const OSC = { saw: 'sawtooth', sawtooth: 'sawtooth', reed: 'square', square: 'square', flute: 'sine', bell: 'sine', sine: 'sine', triangle: 'triangle' };
const oscType = t => OSC[t] || 'triangle';

const MUSIC = {
  title: { bpm: 66, root: 57, scale: [0, 2, 3, 5, 7, 8, 10], chords: [[57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62]], pad: 'saw', lead: 'bell', sparse: true },
  valdoria: { bpm: 82, root: 62, scale: [0, 2, 4, 5, 7, 9, 11], chords: [[62, 66, 69], [59, 62, 66], [55, 59, 62], [57, 61, 64]], pad: 'saw', lead: 'flute' },
  drakmor: { bpm: 92, root: 50, scale: [0, 1, 3, 5, 7, 8, 10], chords: [[50, 53, 57], [46, 50, 53], [48, 51, 55], [45, 48, 52]], pad: 'saw', lead: 'reed' },
  kansordore: { bpm: 70, root: 54, scale: [0, 2, 4, 6, 7, 9, 11], chords: [[54, 58, 61], [50, 54, 58], [47, 50, 54], [49, 53, 56]], pad: 'saw', lead: 'bell', airy: true },
  battle: { bpm: 108, root: 50, scale: [0, 2, 3, 5, 7, 8, 10], chords: [[50, 53, 57], [48, 51, 55], [46, 50, 53], [45, 48, 52]], pad: 'saw', lead: 'reed', battle: true }
};

export class AudioEngine {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.musicBus = null;
    this.sfxBus = null;
    this.musicMode = null;
    this.intensity = 0;
    this.muted = false;
    this.volumes = { master: .7, music: .42, sfx: .75 };
    this._timer = null;
    this._step = 0;
    this._nextTime = 0;
    this._bar = 0;
    this._noise = null;
    this._started = false;
    this._ducked = false;
  }

  init() {
    if (this.ctx) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    this.ctx = new AC();
    this.master = this.ctx.createGain();
    this.master.gain.value = this.muted ? 0 : this.volumes.master;
    this.master.connect(this.ctx.destination);
    this.musicBus = this.ctx.createGain();
    this.musicBus.gain.value = this.volumes.music;
    this.musicBus.connect(this.master);
    this.sfxBus = this.ctx.createGain();
    this.sfxBus.gain.value = this.volumes.sfx;
    this.sfxBus.connect(this.master);
    const len = this.ctx.sampleRate * 1.2;
    this._noise = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const data = this._noise.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
  }

  unlock() {
    this.init();
    if (this.ctx?.state === 'suspended') this.ctx.resume();
    this._started = true;
    if (this.musicMode) this.playMusic(this.musicMode, true);
  }

  setVolumes(v) {
    Object.assign(this.volumes, v);
    if (!this.ctx) return;
    this.master.gain.setTargetAtTime(this.muted ? 0 : this.volumes.master, this.ctx.currentTime, .08);
    this.musicBus.gain.setTargetAtTime(this._ducked ? this.volumes.music * .25 : this.volumes.music, this.ctx.currentTime, .2);
    this.sfxBus.gain.setTargetAtTime(this.volumes.sfx, this.ctx.currentTime, .05);
  }

  setMuted(m) {
    this.muted = m;
    if (!this.ctx) return;
    this.master.gain.setTargetAtTime(m ? 0 : this.volumes.master, this.ctx.currentTime, .05);
  }

  duck(on) {
    this._ducked = on;
    if (!this.ctx) return;
    this.musicBus.gain.setTargetAtTime(on ? this.volumes.music * .22 : this.volumes.music, this.ctx.currentTime, .25);
  }

  playMusic(mode, force = false) {
    this.init();
    if (!this.ctx) return;
    if (this.musicMode === mode && !force) return;
    this.musicMode = mode;
    this._step = 0;
    this._bar = 0;
    const def = MUSIC[mode] || MUSIC.title;
    const stepDur = 60 / def.bpm / 4;
    this._nextTime = this.ctx.currentTime + .08;
    if (this._timer) clearInterval(this._timer);
    this._timer = setInterval(() => this._scheduler(), 90);
    if (this.ctx.state === 'suspended' && this._started) this.ctx.resume();
  }

  stopMusic() {
    if (this._timer) clearInterval(this._timer);
    this._timer = null;
    this.musicMode = null;
  }

  setBattle(on) {
    if (on && this.musicMode !== 'battle') {
      this._prevMode = this.musicMode;
      this.playMusic('battle', true);
    } else if (!on && this.musicMode === 'battle') {
      this.playMusic(this._prevMode || 'valdoria', true);
    }
  }

  _scheduler() {
    if (!this.ctx || this.ctx.state !== 'running') return;
    const def = MUSIC[this.musicMode] || MUSIC.title;
    const stepDur = 60 / def.bpm / 4;
    while (this._nextTime < this.ctx.currentTime + .28) {
      this._playStep(def, this._step, this._nextTime, stepDur);
      this._nextTime += stepDur;
      this._step++;
      if (this._step % 16 === 0) this._bar++;
    }
  }

  _playStep(def, step, time, stepDur) {
    const bar = Math.floor(step / 16);
    const s = step % 16;
    const chord = def.chords[bar % def.chords.length];
    const scale = def.scale;
    // Pad al inicio de compás
    if (s === 0) {
      for (const n of chord) this._pad(NOTE(n - 12), stepDur * 15, def.pad, .045, time);
    }
    // Bajo
    if (s === 0 || s === 6 || (def.battle && s === 10)) {
      this._pluck(NOTE(chord[0] - 24), stepDur * 3.4, 'triangle', .16, time, 220);
    }
    // Arpegio
    if (s % 2 === 0 || (def.airy && s % 3 === 0)) {
      const idx = (bar * 3 + Math.floor(s / 2)) % chord.length;
      const octave = (s % 8 === 0) ? 12 : 0;
      this._pluck(NOTE(chord[idx] + 12 + octave), stepDur * 2.2, def.airy ? 'bell' : 'flute', .055, time, 2600);
    }
    // Melodía
    const melodySteps = [0, 3, 6, 9, 12, 15];
    if (melodySteps.includes(s) && (bar % 2 === 1 || def.battle || Math.random() < .55)) {
      const n = scale[(bar * 2 + Math.floor(s / 3)) % scale.length];
      this._pluck(NOTE(def.root + 12 + n), stepDur * 3.6, def.lead, .07, time, 1800);
    }
    // Percusión
    if (def.battle) {
      if (s === 0 || s === 8) this._drum(58, .13, time, 90);
      if (s === 4 || s === 12) this._noiseHit(1200, .08, .1, time);
      if (s === 2 || s === 6 || s === 10 || s === 14) this._noiseHit(4000, .04, .04, time);
    } else if (bar % 4 === 2) {
      if (s === 4 || s === 12) this._drum(70, .05, time, 70);
    }
    if (def.airy && s === 0) this._bell(NOTE(chord[2] + 24), stepDur * 8, .03, time);
  }

  _pluck(freq, dur, type, gain, time, cutoff = 2000) {
    const ctx = this.ctx;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    const f = ctx.createBiquadFilter();
    o.type = oscType(type);
    o.frequency.value = freq;
    f.type = 'lowpass';
    f.frequency.value = cutoff;
    g.gain.setValueAtTime(0, time);
    g.gain.linearRampToValueAtTime(gain, time + .012);
    g.gain.exponentialRampToValueAtTime(.0001, time + dur);
    o.connect(f); f.connect(g); g.connect(this.musicBus);
    o.start(time); o.stop(time + dur + .05);
  }

  _bell(freq, dur, gain, time) {
    const ctx = this.ctx;
    for (const [mult, gg] of [[1, gain], [2.01, gain * .4], [3.99, gain * .18]]) {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'sine'; o.frequency.value = freq * mult;
      g.gain.setValueAtTime(0, time);
      g.gain.linearRampToValueAtTime(gg, time + .01);
      g.gain.exponentialRampToValueAtTime(.0001, time + dur);
      o.connect(g); g.connect(this.musicBus);
      o.start(time); o.stop(time + dur + .1);
    }
  }

  _pad(freq, dur, type, gain, time) {
    const ctx = this.ctx;
    const o = ctx.createOscillator();
    const o2 = ctx.createOscillator();
    const f = ctx.createBiquadFilter();
    const g = ctx.createGain();
    o.type = oscType(type); o2.type = oscType(type);
    o.frequency.value = freq; o2.frequency.value = freq * 1.006;
    f.type = 'lowpass'; f.frequency.value = 700; f.Q.value = .5;
    g.gain.setValueAtTime(0, time);
    g.gain.linearRampToValueAtTime(gain, time + dur * .3);
    g.gain.linearRampToValueAtTime(0.0001, time + dur);
    o.connect(f); o2.connect(f); f.connect(g); g.connect(this.musicBus);
    o.start(time); o2.start(time);
    o.stop(time + dur + .1); o2.stop(time + dur + .1);
  }

  _drum(freq, gain, time, decayMs) {
    const ctx = this.ctx;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(freq, time);
    o.frequency.exponentialRampToValueAtTime(30, time + decayMs / 1000);
    g.gain.setValueAtTime(gain, time);
    g.gain.exponentialRampToValueAtTime(.0001, time + decayMs / 1000);
    o.connect(g); g.connect(this.musicBus);
    o.start(time); o.stop(time + decayMs / 1000 + .02);
  }

  _noiseHit(cutoff, dur, gain, time) {
    if (!this._noise) return;
    const ctx = this.ctx;
    const src = ctx.createBufferSource();
    src.buffer = this._noise;
    const f = ctx.createBiquadFilter();
    f.type = 'bandpass'; f.frequency.value = cutoff; f.Q.value = .8;
    const g = ctx.createGain();
    g.gain.setValueAtTime(gain, time);
    g.gain.exponentialRampToValueAtTime(.0001, time + dur);
    src.connect(f); f.connect(g); g.connect(this.musicBus);
    src.start(time); src.stop(time + dur + .02);
  }

  sfx(name) {
    if (!this.ctx || this.muted) return;
    const t = this.ctx.currentTime + .01;
    const N = this._noise;
    const env = (g, a, d, peak) => {
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(peak, t + a);
      g.gain.exponentialRampToValueAtTime(0.0001, t + a + d);
    };
    const tone = (freq, type, dur, peak, slide = 0, filter = 0) => {
      const o = this.ctx.createOscillator(), g = this.ctx.createGain();
      o.type = type; o.frequency.setValueAtTime(freq, t);
      if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, slide), t + dur);
      let node = o;
      if (filter) {
        const f = this.ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = filter;
        o.connect(f); node = f;
      }
      node.connect(g); g.connect(this.sfxBus); env(g, .008, dur, peak);
      o.start(t); o.stop(t + dur + .06);
    };
    const noise = (dur, peak, freq = 1500, type = 'bandpass', slide = 0) => {
      if (!N) return;
      const s = this.ctx.createBufferSource(); s.buffer = N;
      const f = this.ctx.createBiquadFilter(); f.type = type; f.frequency.setValueAtTime(freq, t); f.Q.value = .7;
      if (slide) f.frequency.exponentialRampToValueAtTime(slide, t + dur);
      const g = this.ctx.createGain();
      s.connect(f); f.connect(g); g.connect(this.sfxBus); env(g, .005, dur, peak);
      s.start(t); s.stop(t + dur + .05);
    };
    switch (name) {
      case 'swing': noise(.11, .18, 2400, 'bandpass', 500); break;
      case 'swing2': noise(.14, .2, 1800, 'bandpass', 400); tone(220, 'triangle', .09, .04, 120); break;
      case 'heavy': noise(.2, .24, 900, 'lowpass', 200); tone(90, 'sine', .18, .16, 40); break;
      case 'hit': tone(150, 'sine', .12, .18, 48); noise(.07, .12, 1800, 'bandpass'); break;
      case 'crit': tone(880, 'square', .12, .07, 1320); tone(160, 'sine', .15, .16, 50); noise(.1, .16, 3000); break;
      case 'hurt': tone(180, 'sawtooth', .2, .1, 70); noise(.12, .12, 500, 'lowpass'); break;
      case 'dodge': noise(.22, .12, 700, 'bandpass', 2000); break;
      case 'block': tone(420, 'square', .09, .07, 300); tone(1300, 'triangle', .16, .05, 900); noise(.08, .1, 2800); break;
      case 'parry': tone(1500, 'sine', .3, .08, 2400); tone(760, 'triangle', .25, .07, 1100); noise(.1, .12, 4000); break;
      case 'heal': [523, 659, 784].forEach((f, i) => { const o = this.ctx.createOscillator(), g = this.ctx.createGain(); o.type = 'sine'; o.frequency.value = f; o.connect(g); g.connect(this.sfxBus); const tt = t + i * .08; g.gain.setValueAtTime(.0001, tt); g.gain.exponentialRampToValueAtTime(.08, tt + .02); g.gain.exponentialRampToValueAtTime(.0001, tt + .4); o.start(tt); o.stop(tt + .45); }); break;
      case 'pickup': tone(880, 'sine', .12, .06); setTimeout(() => this.sfx('tone2'), 60); break;
      case 'tone2': tone(1318, 'sine', .18, .05); break;
      case 'coin': tone(1200, 'square', .06, .04); tone(1800, 'square', .12, .03); break;
      case 'levelup': [392, 523, 659, 784, 1046].forEach((f, i) => { const o = this.ctx.createOscillator(), g = this.ctx.createGain(); o.type = 'triangle'; o.frequency.value = f; o.connect(g); g.connect(this.sfxBus); const tt = t + i * .09; g.gain.setValueAtTime(.0001, tt); g.gain.exponentialRampToValueAtTime(.1, tt + .02); g.gain.exponentialRampToValueAtTime(.0001, tt + .7); o.start(tt); o.stop(tt + .75); }); break;
      case 'quest': [261, 392, 523].forEach((f, i) => { const o = this.ctx.createOscillator(), g = this.ctx.createGain(); o.type = 'triangle'; o.frequency.value = f; o.connect(g); g.connect(this.sfxBus); const tt = t + i * .12; g.gain.setValueAtTime(.0001, tt); g.gain.exponentialRampToValueAtTime(.08, tt + .03); g.gain.exponentialRampToValueAtTime(.0001, tt + 1.1); o.start(tt); o.stop(tt + 1.2); }); break;
      case 'capture': [659, 784, 988, 1318, 1568].forEach((f, i) => { const o = this.ctx.createOscillator(), g = this.ctx.createGain(); o.type = 'sine'; o.frequency.value = f; o.connect(g); g.connect(this.sfxBus); const tt = t + i * .07; g.gain.setValueAtTime(.0001, tt); g.gain.exponentialRampToValueAtTime(.09, tt + .02); g.gain.exponentialRampToValueAtTime(.0001, tt + .5); o.start(tt); o.stop(tt + .55); }); break;
      case 'captureFail': tone(300, 'triangle', .25, .08, 140); break;
      case 'summon': tone(180, 'sawtooth', .5, .06, 720); tone(360, 'sine', .6, .05, 1080); noise(.4, .06, 900, 'bandpass', 3000); break;
      case 'portal': noise(.7, .14, 300, 'bandpass', 3000); tone(110, 'sawtooth', .8, .07, 440); break;
      case 'chest': noise(.18, .1, 900, 'bandpass'); setTimeout(() => this.sfx('pickup'), 180); break;
      case 'ui': tone(700, 'sine', .05, .035, 900); break;
      case 'menuOpen': tone(330, 'triangle', .12, .04, 440); break;
      case 'menuClose': tone(440, 'triangle', .1, .03, 330); break;
      case 'death': tone(220, 'sawtooth', .9, .1, 60); noise(.8, .08, 400, 'lowpass', 100); break;
      case 'boss': [55, 82.4, 110].forEach((f, i) => { const o = this.ctx.createOscillator(), g = this.ctx.createGain(); o.type = 'sawtooth'; o.frequency.value = f; o.connect(g); g.connect(this.sfxBus); const tt = t + i * .04; g.gain.setValueAtTime(.0001, tt); g.gain.exponentialRampToValueAtTime(.08, tt + .15); g.gain.exponentialRampToValueAtTime(.0001, tt + 1.8); o.start(tt); o.stop(tt + 1.9); }); break;
      case 'fire': noise(.35, .14, 600, 'lowpass', 200); break;
      case 'ice': tone(1400, 'sine', .2, .06, 2000); noise(.2, .08, 4000); break;
      case 'holy': [523, 1046, 1568].forEach((f, i) => { const o = this.ctx.createOscillator(), g = this.ctx.createGain(); o.type = 'sine'; o.frequency.value = f; o.connect(g); g.connect(this.sfxBus); const tt = t + i * .05; g.gain.setValueAtTime(.0001, tt); g.gain.exponentialRampToValueAtTime(.07, tt + .02); g.gain.exponentialRampToValueAtTime(.0001, tt + .8); o.start(tt); o.stop(tt + .85); }); break;
      case 'bow': noise(.13, .1, 1200, 'bandpass', 2400); break;
      case 'step': tone(70, 'sine', .05, .025, 50); break;
      case 'error': tone(160, 'square', .12, .05, 120); break;
      default: tone(600, 'sine', .05, .03);
    }
  }
}

export const audio = new AudioEngine();
