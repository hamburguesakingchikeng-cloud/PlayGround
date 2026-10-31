/* ==========================================================================
   AUDIO — fully procedural WebAudio score and SFX (no external assets).
   ========================================================================== */

const ZONE_MUSIC = {
  town:   { root: 57, scale: [0, 2, 4, 7, 9], bpm: 76,  pad: 'sine', lead: 'triangle', bright: .55, prog: [0, 5, 3, 4] },
  forest: { root: 52, scale: [0, 2, 3, 5, 7, 8, 10], bpm: 68, pad: 'sine', lead: 'triangle', bright: .45, prog: [0, 3, 5, 4] },
  ruins:  { root: 48, scale: [0, 2, 3, 5, 7, 8, 10], bpm: 62, pad: 'sawtooth', lead: 'sine', bright: .3, prog: [0, 5, 2, 6] },
  canyon: { root: 50, scale: [0, 3, 5, 6, 7, 10], bpm: 84, pad: 'sawtooth', lead: 'square', bright: .38, prog: [0, 4, 3, 5] },
  temple: { root: 55, scale: [0, 2, 4, 6, 7, 9, 11], bpm: 58, pad: 'sine', lead: 'sine', bright: .6, prog: [0, 4, 2, 5] },
  title:  { root: 53, scale: [0, 2, 4, 7, 9, 11], bpm: 60, pad: 'sine', lead: 'triangle', bright: .7, prog: [0, 4, 5, 3] },
  battle: { root: 45, scale: [0, 2, 3, 5, 7, 8, 10], bpm: 108, pad: 'sawtooth', lead: 'square', bright: .35, prog: [0, 5, 3, 6] },
  boss:   { root: 43, scale: [0, 1, 3, 5, 6, 8, 10], bpm: 120, pad: 'sawtooth', lead: 'square', bright: .4, prog: [0, 4, 1, 5] },
};

const midi = n => 440 * Math.pow(2, (n - 69) / 12);

export class AudioEngine {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.musicGain = null;
    this.sfxGain = null;
    this.noiseBuffer = null;
    this.volumes = { master: 0.75, music: 0.5, sfx: 0.8 };
    this.music = { zone: null, battle: false, step: 0, next: 0, timer: null, playing: false };
    this._lastUi = 0;
  }

  init() {
    if (this.ctx) { this.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    this.ctx = new AC();
    this.master = this.ctx.createGain();
    this.musicGain = this.ctx.createGain();
    this.sfxGain = this.ctx.createGain();
    this.master.gain.value = this.volumes.master;
    this.musicGain.gain.value = this.volumes.music;
    this.sfxGain.gain.value = this.volumes.sfx;
    this.musicGain.connect(this.master);
    this.sfxGain.connect(this.master);
    this.master.connect(this.ctx.destination);
    this._makeNoise();
    this._startScheduler();
    this.resume();
  }

  resume() {
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume().catch(() => {});
  }

  setVolumes({ master, music, sfx }) {
    if (master != null) this.volumes.master = master;
    if (music != null) this.volumes.music = music;
    if (sfx != null) this.volumes.sfx = sfx;
    if (this.ctx) {
      this.master.gain.setTargetAtTime(this.volumes.master, this.ctx.currentTime, .05);
      this.musicGain.gain.setTargetAtTime(this.volumes.music, this.ctx.currentTime, .05);
      this.sfxGain.gain.setTargetAtTime(this.volumes.sfx, this.ctx.currentTime, .05);
    }
  }

  _makeNoise() {
    const len = this.ctx.sampleRate * 1.2;
    const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    this.noiseBuffer = buf;
  }

  _startScheduler() {
    if (this.music.timer) clearInterval(this.music.timer);
    this.music.timer = setInterval(() => this._schedule(), 90);
  }

  playMusic(zone, { battle = false } = {}) {
    if (!this.ctx) return;
    const key = battle ? (zone === 'templo' ? 'boss' : 'battle') : (ZONE_MUSIC[zone] ? zone : 'town');
    if (this.music.zone === key && this.music.playing) return;
    this.music.zone = key;
    this.music.battle = battle;
    this.music.step = 0;
    this.music.next = this.ctx.currentTime + .08;
    this.music.playing = true;
  }

  stopMusic() {
    this.music.playing = false;
    this.music.zone = null;
  }

  _schedule() {
    if (!this.ctx || !this.music.playing || !this.music.zone) return;
    const def = ZONE_MUSIC[this.music.zone];
    if (!def) return;
    const beat = 60 / def.bpm / 2;
    while (this.music.next < this.ctx.currentTime + .3) {
      this._musicStep(def, this.music.step, this.music.next, beat);
      this.music.step = (this.music.step + 1) % 64;
      this.music.next += beat;
    }
  }

  _musicStep(def, step, t, beat) {
    const bar = Math.floor(step / 8) % 4;
    const s = step % 8;
    const chordRoot = def.root + def.prog[bar];
    const battle = this.music.zone === 'battle' || this.music.zone === 'boss';
    // Bass
    if (s === 0 || s === 4) this._tone({ freq: midi(chordRoot - 12), dur: beat * 2.4, type: 'sine', gain: .16, t, dest: this.musicGain });
    // Pad chord
    if (s === 0) {
      const third = def.scale.includes(3) ? 3 : 4;
      [0, third, 7].forEach((iv, i) => this._tone({ freq: midi(chordRoot + iv + (i === 2 ? 12 : 0)), dur: beat * 6.2, type: def.pad, gain: .035, attack: .35, release: .8, t, dest: this.musicGain }));
    }
    // Arpeggio / lead
    const pat = [0, 2, 4, 2, 5, 4, 2, 1];
    if (s % 1 === 0 && (step % 2 === 0 || Math.random() > .35)) {
      const note = chordRoot + def.scale[pat[(step + bar) % pat.length] % def.scale.length] + (s === 4 ? 12 : 0);
      this._tone({ freq: midi(note), dur: beat * .85, type: def.lead, gain: battle ? .045 : .055, attack: .01, release: .18, t, dest: this.musicGain, detune: (Math.random() - .5) * 6 });
    }
    // Battle percussion
    if (battle) {
      if (s === 0 || s === 4) this._noise({ dur: .12, gain: .13, freq: 130, q: 1.2, t, dest: this.musicGain });
      if (s === 2 || s === 6) this._noise({ dur: .05, gain: .05, freq: 2400, q: 3, t, dest: this.musicGain });
      if (this.music.zone === 'boss' && s === 7) this._noise({ dur: .3, gain: .06, freq: 70, q: .7, t, dest: this.musicGain });
    }
    // Sparkle
    if (step % 16 === 12 && !battle) this._tone({ freq: midi(chordRoot + 24), dur: .5, type: 'sine', gain: .028, t, dest: this.musicGain });
  }

  _tone({ freq, dur = .2, type = 'sine', gain = .1, attack = .008, release = .08, t, dest, slideTo = null, detune = 0 }) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(Math.max(20, freq), t);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(Math.max(20, slideTo), t + dur);
    if (detune) osc.detune.value = detune;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(Math.max(.0002, gain), t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur + release);
    osc.connect(g); g.connect(dest || this.sfxGain);
    osc.start(t); osc.stop(t + dur + release + .02);
  }

  _noise({ dur = .1, gain = .1, freq = 800, q = 1, t, dest }) {
    if (!this.ctx || !this.noiseBuffer) return;
    const src = this.ctx.createBufferSource();
    src.buffer = this.noiseBuffer;
    const f = this.ctx.createBiquadFilter();
    f.type = 'bandpass'; f.frequency.value = freq; f.Q.value = q;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(gain, t);
    g.gain.exponentialRampToValueAtTime(.0001, t + dur);
    src.connect(f); f.connect(g); g.connect(dest || this.sfxGain);
    src.start(t); src.stop(t + dur + .02);
  }

  sfx(name) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime + .005;
    const g = this.sfxGain;
    switch (name) {
      case 'attack':
        this._noise({ dur: .09, gain: .14, freq: 1800, q: 1.5, t, dest: g });
        this._tone({ freq: 420, slideTo: 180, dur: .1, type: 'triangle', gain: .08, t, dest: g });
        break;
      case 'heavy':
        this._noise({ dur: .16, gain: .2, freq: 700, q: .8, t, dest: g });
        this._tone({ freq: 160, slideTo: 70, dur: .18, type: 'sine', gain: .14, t, dest: g });
        break;
      case 'hit':
        this._noise({ dur: .07, gain: .12, freq: 2600, q: 1.1, t, dest: g });
        this._tone({ freq: 220, slideTo: 90, dur: .09, type: 'square', gain: .06, t, dest: g });
        break;
      case 'crit':
        this._tone({ freq: 880, slideTo: 1400, dur: .12, type: 'triangle', gain: .12, t, dest: g });
        this._noise({ dur: .1, gain: .14, freq: 3200, q: 1, t, dest: g });
        break;
      case 'dodge':
        this._noise({ dur: .18, gain: .09, freq: 1200, q: .6, t, dest: g });
        this._tone({ freq: 520, slideTo: 780, dur: .16, type: 'sine', gain: .05, t, dest: g });
        break;
      case 'magic':
        this._tone({ freq: 520, slideTo: 1300, dur: .3, type: 'sine', gain: .09, t, dest: g });
        this._tone({ freq: 780, slideTo: 1900, dur: .35, type: 'triangle', gain: .05, t: t + .04, dest: g });
        break;
      case 'fire':
        this._noise({ dur: .3, gain: .12, freq: 600, q: .5, t, dest: g });
        this._tone({ freq: 260, slideTo: 90, dur: .25, type: 'sawtooth', gain: .05, t, dest: g });
        break;
      case 'ice':
        this._tone({ freq: 1600, slideTo: 2400, dur: .22, type: 'sine', gain: .07, t, dest: g });
        this._noise({ dur: .2, gain: .05, freq: 4200, q: 2, t, dest: g });
        break;
      case 'heal':
        [523, 659, 784].forEach((f, i) => this._tone({ freq: f, dur: .25, type: 'sine', gain: .07, t: t + i * .07, dest: g }));
        break;
      case 'pickup':
        this._tone({ freq: 740, dur: .08, type: 'triangle', gain: .07, t, dest: g });
        this._tone({ freq: 1100, dur: .1, type: 'triangle', gain: .06, t: t + .06, dest: g });
        break;
      case 'coin':
        this._tone({ freq: 1320, dur: .06, type: 'square', gain: .04, t, dest: g });
        this._tone({ freq: 1760, dur: .1, type: 'square', gain: .035, t: t + .05, dest: g });
        break;
      case 'menu':
        this._tone({ freq: 620, dur: .05, type: 'sine', gain: .045, t, dest: g });
        break;
      case 'confirm':
        this._tone({ freq: 520, dur: .07, type: 'triangle', gain: .06, t, dest: g });
        this._tone({ freq: 780, dur: .12, type: 'triangle', gain: .05, t: t + .06, dest: g });
        break;
      case 'cancel':
        this._tone({ freq: 420, slideTo: 260, dur: .1, type: 'sine', gain: .05, t, dest: g });
        break;
      case 'error':
        this._tone({ freq: 180, dur: .12, type: 'square', gain: .06, t, dest: g });
        break;
      case 'capture':
        [660, 880, 1100, 1320].forEach((f, i) => this._tone({ freq: f, dur: .18, type: 'sine', gain: .06, t: t + i * .08, dest: g }));
        break;
      case 'levelup':
        [523, 659, 784, 1046].forEach((f, i) => this._tone({ freq: f, dur: .3, type: 'triangle', gain: .08, t: t + i * .1, dest: g }));
        break;
      case 'quest':
        [392, 523, 659, 784, 1046].forEach((f, i) => this._tone({ freq: f, dur: .35, type: 'sine', gain: .06, t: t + i * .11, dest: g }));
        break;
      case 'boss':
        this._tone({ freq: 90, slideTo: 42, dur: 1.2, type: 'sawtooth', gain: .16, t, dest: g });
        this._noise({ dur: 1.0, gain: .12, freq: 180, q: .5, t, dest: g });
        break;
      case 'death':
        this._tone({ freq: 320, slideTo: 55, dur: 1.4, type: 'sawtooth', gain: .1, t, dest: g });
        break;
      case 'portal':
        this._tone({ freq: 220, slideTo: 880, dur: .8, type: 'sine', gain: .08, t, dest: g });
        this._noise({ dur: .7, gain: .05, freq: 900, q: .4, t, dest: g });
        break;
      case 'chest':
        this._noise({ dur: .12, gain: .07, freq: 900, q: 1.5, t, dest: g });
        this._tone({ freq: 660, slideTo: 990, dur: .25, type: 'triangle', gain: .06, t: t + .06, dest: g });
        break;
      case 'block':
        this._tone({ freq: 320, slideTo: 160, dur: .1, type: 'square', gain: .08, t, dest: g });
        this._noise({ dur: .08, gain: .08, freq: 1200, q: 2, t, dest: g });
        break;
      case 'ui':
        if (performance.now() - this._lastUi < 60) return;
        this._lastUi = performance.now();
        this._tone({ freq: 760, dur: .03, type: 'sine', gain: .025, t, dest: g });
        break;
      default: break;
    }
  }
}

export const audio = new AudioEngine();
