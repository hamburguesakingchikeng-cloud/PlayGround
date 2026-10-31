import { clamp, rand } from './utils.js';

const THEMES = {
  title: {
    bpm: 52, root: 48, mode: [0, 2, 3, 5, 7, 8, 10], chords: [[0, 3, 7], [-4, 0, 3], [-7, -3, 0], [-2, 2, 5]],
    arp: [0, 2, 4, 2, 5, 4, 2, 0], wave: 'triangle', padGain: .045, arpGain: .035, bassGain: .045, perc: 0, melody: [7, 5, 4, 2, 0, 2, 4, 5]
  },
  valdoria: {
    bpm: 66, root: 50, mode: [0, 2, 4, 5, 7, 9, 11], chords: [[0, 4, 7], [5, 9, 12], [7, 11, 14], [5, 9, 12]],
    arp: [0, 4, 7, 11, 7, 4, 2, 4], wave: 'triangle', padGain: .04, arpGain: .03, bassGain: .04, perc: .1, melody: [11, 9, 7, 9, 7, 4, 5, 7]
  },
  valdoriaCombat: {
    bpm: 104, root: 50, mode: [0, 2, 3, 5, 7, 8, 10], chords: [[0, 3, 7], [-2, 2, 5], [-4, 0, 3], [-2, 2, 5]],
    arp: [0, 3, 7, 10, 7, 3, 0, 5], wave: 'sawtooth', padGain: .025, arpGain: .026, bassGain: .055, perc: .5, melody: [10, 7, 5, 3, 5, 7, 10, 12]
  },
  drakmor: {
    bpm: 58, root: 44, mode: [0, 2, 3, 5, 7, 8, 10], chords: [[0, 3, 7], [-3, 0, 3], [-5, -1, 2], [-3, 0, 5]],
    arp: [0, 3, 5, 7, 5, 3, 0, -2], wave: 'triangle', padGain: .05, arpGain: .025, bassGain: .05, perc: .15, melody: [0, 3, 5, 3, 0, -2, 0, 3]
  },
  drakmorCombat: {
    bpm: 116, root: 43, mode: [0, 1, 3, 5, 7, 8, 10], chords: [[0, 3, 7], [0, 5, 8], [-2, 3, 5], [0, 3, 8]],
    arp: [0, 3, 7, 8, 7, 3, 0, 10], wave: 'sawtooth', padGain: .03, arpGain: .028, bassGain: .06, perc: .65, melody: [10, 8, 7, 5, 3, 5, 7, 10]
  },
  kansordore: {
    bpm: 50, root: 55, mode: [0, 2, 4, 7, 9, 11, 12], chords: [[0, 4, 7], [-3, 2, 7], [-5, 0, 4], [2, 5, 9]],
    arp: [0, 4, 7, 9, 11, 9, 7, 4], wave: 'sine', padGain: .045, arpGain: .028, bassGain: .035, perc: .05, melody: [11, 9, 7, 9, 11, 12, 11, 9]
  },
  kansordoreCombat: {
    bpm: 118, root: 55, mode: [0, 2, 4, 5, 7, 9, 11], chords: [[0, 4, 7], [5, 9, 12], [4, 7, 11], [-3, 0, 4]],
    arp: [0, 4, 7, 11, 9, 7, 4, 2], wave: 'sawtooth', padGain: .03, arpGain: .03, bassGain: .055, perc: .55, melody: [11, 9, 7, 11, 12, 11, 9, 7]
  },
  boss: {
    bpm: 126, root: 43, mode: [0, 1, 3, 5, 7, 8, 10], chords: [[0, 3, 7], [-1, 3, 6], [0, 4, 7], [-2, 2, 5]],
    arp: [0, 3, 7, 10, 8, 7, 3, 0], wave: 'sawtooth', padGain: .035, arpGain: .03, bassGain: .07, perc: .8, melody: [10, 8, 7, 3, 5, 7, 10, 12]
  },
  ending: {
    bpm: 54, root: 52, mode: [0, 2, 4, 7, 9, 12], chords: [[0, 4, 7], [5, 9, 12], [7, 11, 14], [0, 4, 7]],
    arp: [0, 4, 7, 9, 12, 9, 7, 4], wave: 'sine', padGain: .05, arpGain: .03, bassGain: .035, perc: 0, melody: [7, 9, 12, 9, 7, 4, 7, 12]
  },
  shrine: {
    bpm: 46, root: 57, mode: [0, 2, 4, 7, 9, 11], chords: [[0, 4, 7], [0, 2, 7], [-3, 2, 4], [0, 4, 7]],
    arp: [0, 4, 7, 11, 7, 4, 2, 0], wave: 'sine', padGain: .04, arpGain: .025, bassGain: .03, perc: 0, melody: [11, 7, 9, 7, 4, 7, 9, 11]
  }
};

const midi = (n) => 440 * 2 ** ((n - 69) / 12);

export class AudioEngine {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this.musicVol = .55;
    this.sfxVol = .7;
    this.themeName = null;
    this.theme = null;
    this.combat = false;
    this.step = 0;
    this.nextTime = 0;
    this.timer = null;
    this._last = {};
    this._noise = null;
  }
  init() {
    if (this.ctx) { if (this.ctx.state === 'suspended') this.ctx.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    try {
      this.ctx = new AC();
      this.master = this.ctx.createGain();
      this.master.gain.value = .9;
      this.master.connect(this.ctx.destination);
      this.musicBus = this.ctx.createGain();
      this.musicBus.gain.value = this.musicVol;
      this.musicBus.connect(this.master);
      this.sfxBus = this.ctx.createGain();
      this.sfxBus.gain.value = this.sfxVol;
      this.sfxBus.connect(this.master);
      this.reverb = this.ctx.createConvolver();
      this.reverb.buffer = this._makeImpulse(2.8, 2.6);
      this.revBus = this.ctx.createGain();
      this.revBus.gain.value = .34;
      this.revBus.connect(this.reverb);
      this.reverb.connect(this.master);
      this.buffer = this.ctx.createBuffer(1, this.ctx.sampleRate, this.ctx.sampleRate);
      const d = this.buffer.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      if (this.ctx.state === 'suspended') this.ctx.resume();
    } catch (e) { console.warn('Audio unavailable', e); }
  }
  _makeImpulse(seconds, decay) {
    const rate = this.ctx.sampleRate;
    const len = rate * seconds;
    const buf = this.ctx.createBuffer(2, len, rate);
    for (let c = 0; c < 2; c++) {
      const d = buf.getChannelData(c);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len) ** decay;
    }
    return buf;
  }
  setMusicVolume(v) { this.musicVol = clamp(v); if (this.musicBus) this.musicBus.gain.value = this.musicVol; }
  setSfxVolume(v) { this.sfxVol = clamp(v); if (this.sfxBus) this.sfxBus.gain.value = this.sfxVol; }
  toggle(on) { this.enabled = on; if (this.master) this.master.gain.value = on ? .9 : 0; }

  playTheme(name, combat = false) {
    if (!this.ctx) { this.pendingTheme = name; this.pendingCombat = combat; return; }
    const key = combat && THEMES[name + 'Combat'] ? name + 'Combat' : name;
    if (this.themeName === key) return;
    this.themeName = key;
    this.theme = THEMES[key] || THEMES.valdoria;
    this.step = 0;
    this.nextTime = this.ctx.currentTime + .08;
    if (this.timer) clearInterval(this.timer);
    this.timer = setInterval(() => this._schedule(), 40);
    this._schedule();
  }
  stopMusic() {
    if (this.timer) clearInterval(this.timer);
    this.timer = null; this.theme = null; this.themeName = null;
  }
  _schedule() {
    if (!this.ctx || !this.theme) return;
    if (this.ctx.state === 'suspended') return;
    const t = this.theme;
    const stepDur = 60 / t.bpm / 4;
    while (this.nextTime < this.ctx.currentTime + .18) {
      this._playStep(this.step, this.nextTime, t, stepDur);
      this.step++;
      this.nextTime += stepDur;
    }
  }
  _playStep(step, time, t, dur) {
    const bar = Math.floor(step / 16) % t.chords.length;
    const s = step % 16;
    const chord = t.chords[bar];
    if (s === 0) {
      for (const n of chord) this._pad(t.root + n + 12, time, 60 / t.bpm * 3.7, t.padGain, t.wave === 'sawtooth' ? 'sawtooth' : 'sine');
    }
    const arp = t.arp;
    if (s % 2 === 0) {
      const idx = (s / 2) % arp.length;
      const n = t.root + 12 + arp[idx] + (t.mode.length && arp[idx] < 0 ? 0 : 0);
      this._note(midi(n), time, dur * 1.7, t.arpGain, t.wave, 'music');
    }
    if (s % 4 === 0) {
      const bn = t.root - 12 + chord[0];
      this._note(midi(bn), time, dur * 3.6, t.bassGain, 'sine', 'music');
    }
    if (t.perc > 0 && (s === 0 || s === 8 || (t.perc > .5 && s === 6) || (t.perc > .7 && s === 11))) {
      this._perc(time, s === 0 ? .8 : .5, t.perc * .16);
    }
    if (s === 12 && t.perc > .3) this._perc(time, .3, t.perc * .09);
    if (s === 0 && t.perc > 0 && this.combat) this._note(midi(t.root - 24), time, dur * 2, .05, 'sine', 'music');
    if (s === 4 || s === 12) {
      const mel = t.melody[(Math.floor(step / 4)) % t.melody.length];
      if (Math.random() < .62) this._note(midi(t.root + 12 + mel), time, dur * 2.3, t.arpGain * .8, 'triangle', 'music');
    }
    if (s === 0 && Math.random() < .2) this._sfxNoise(time, .06, 600, .01);
  }
  _note(freq, time, dur, gain, wave = 'sine', bus = 'music') {
    if (!this.ctx) return;
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.type = wave;
    o.frequency.value = freq;
    const dest = bus === 'music' ? this.musicBus : this.sfxBus;
    g.gain.setValueAtTime(0.0001, time);
    g.gain.exponentialRampToValueAtTime(Math.max(.0002, gain), time + .025);
    g.gain.exponentialRampToValueAtTime(0.0001, time + dur);
    o.connect(g);
    if (bus === 'music') { const send = this.ctx.createGain(); send.gain.value = .5; g.connect(send); send.connect(this.revBus); }
    g.connect(dest);
    o.start(time); o.stop(time + dur + .05);
  }
  _pad(freq, time, dur, gain, wave) {
    if (!this.ctx) return;
    for (const det of [-4, 4]) {
      const o = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      const f = this.ctx.createBiquadFilter();
      o.type = wave; o.frequency.value = freq; o.detune.value = det;
      f.type = 'lowpass'; f.frequency.value = 900; f.Q.value = .5;
      g.gain.setValueAtTime(.0001, time);
      g.gain.linearRampToValueAtTime(gain, time + 1.2);
      g.gain.linearRampToValueAtTime(.0001, time + dur);
      o.connect(f); f.connect(g); g.connect(this.musicBus);
      const send = this.ctx.createGain(); send.gain.value = .7; g.connect(send); send.connect(this.revBus);
      o.start(time); o.stop(time + dur + .1);
    }
  }
  _perc(time, level, gain) {
    if (!this.ctx) return;
    const src = this.ctx.createBufferSource(); src.buffer = this.buffer;
    const f = this.ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = level > .6 ? 220 : 3800;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(gain, time);
    g.gain.exponentialRampToValueAtTime(.0001, time + (level > .6 ? .26 : .07));
    src.connect(f); f.connect(g); g.connect(this.musicBus);
    src.start(time); src.stop(time + .3);
  }
  _sfxNoise(time, dur = .1, cutoff = 1200, gain = .08) {
    if (!this.ctx) return;
    const src = this.ctx.createBufferSource(); src.buffer = this.buffer;
    const f = this.ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = cutoff;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(gain, time);
    g.gain.exponentialRampToValueAtTime(.0001, time + dur);
    src.connect(f); f.connect(g); g.connect(this.sfxBus);
    src.start(time); src.stop(time + dur + .02);
  }
  sfx(name, pitch = 1) {
    if (!this.ctx || !this.enabled) return;
    const now = this.ctx.currentTime;
    if (this._last[name] && now - this._last[name] < .035) return;
    this._last[name] = now;
    switch (name) {
      case 'swing': this._sfxNoise(now, .13, 3200, .12); this._note(220 * pitch, now, .1, .03, 'sawtooth', 'sfx'); break;
      case 'hit': this._note(90 * pitch, now, .09, .12, 'square', 'sfx'); this._sfxNoise(now, .07, 900, .15); break;
      case 'crit': this._note(1400, now, .12, .09, 'square', 'sfx'); this._note(90, now, .16, .14, 'sawtooth', 'sfx'); this._sfxNoise(now, .1, 5000, .12); break;
      case 'hurt': this._note(180, now, .18, .12, 'sawtooth', 'sfx'); this._sfxNoise(now, .12, 600, .14); break;
      case 'dash': this._sfxNoise(now, .2, 2400, .08); this._note(400, now + .02, .12, .03, 'sine', 'sfx'); break;
      case 'magic': this._note(660, now, .4, .05, 'sine', 'sfx'); this._note(990, now + .05, .5, .035, 'triangle', 'sfx'); this._note(1320, now + .1, .6, .02, 'sine', 'sfx'); break;
      case 'pulse': this._note(120, now, .5, .1, 'sine', 'sfx'); this._note(240, now, .4, .05, 'triangle', 'sfx'); this._sfxNoise(now, .35, 1200, .05); break;
      case 'heal': this._note(523, now, .35, .05, 'sine', 'sfx'); this._note(784, now + .1, .4, .04, 'sine', 'sfx'); this._note(1046, now + .2, .5, .03, 'triangle', 'sfx'); break;
      case 'pickup': this._note(880, now, .12, .035, 'triangle', 'sfx'); this._note(1320, now + .08, .2, .025, 'sine', 'sfx'); break;
      case 'coin': this._note(1200, now, .06, .03, 'square', 'sfx'); this._note(1600, now + .05, .09, .025, 'square', 'sfx'); break;
      case 'level': [523, 659, 784, 1046, 1318].forEach((f, i) => this._note(f, now + i * .09, .6, .045, 'triangle', 'sfx')); break;
      case 'quest': this._note(392, now, .3, .04, 'triangle', 'sfx'); this._note(523, now + .12, .4, .03, 'sine', 'sfx'); break;
      case 'capture': [440, 554, 659, 880, 1108, 1318].forEach((f, i) => this._note(f, now + i * .06, .8, .04, 'sine', 'sfx')); break;
      case 'fail': this._note(300, now, .2, .05, 'sawtooth', 'sfx'); this._note(220, now + .12, .35, .05, 'sawtooth', 'sfx'); break;
      case 'roar': this._note(60, now, 1.1, .16, 'sawtooth', 'sfx'); this._note(92, now, .9, .1, 'square', 'sfx'); this._sfxNoise(now, .8, 500, .14); break;
      case 'portal': this._note(200, now, .8, .05, 'sine', 'sfx'); this._note(400, now + .2, .9, .04, 'sine', 'sfx'); this._note(800, now + .4, .9, .025, 'triangle', 'sfx'); break;
      case 'menu': this._note(600, now, .09, .028, 'sine', 'sfx'); break;
      case 'select': this._note(900, now, .06, .03, 'triangle', 'sfx'); break;
      case 'error': this._note(150, now, .15, .05, 'square', 'sfx'); break;
      case 'dialogue': this._note(480 + Math.random() * 130, now, .05, .012, 'sine', 'sfx'); break;
      case 'step': this._sfxNoise(now, .04, 700, .025); break;
      case 'block': this._note(1200, now, .06, .05, 'square', 'sfx'); this._sfxNoise(now, .05, 3000, .05); break;
      case 'death': this._note(180, now, 1.2, .1, 'sawtooth', 'sfx'); this._note(90, now + .3, 1.8, .12, 'sine', 'sfx'); break;
      case 'shrine': [330, 440, 550, 660, 880].forEach((f, i) => this._note(f, now + i * .15, 1.2, .03, 'sine', 'sfx')); break;
    }
  }
  suspend() { this.ctx?.suspend(); }
  resume() { this.ctx?.resume(); }
}
