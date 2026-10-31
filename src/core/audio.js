// Música y efectos generados en tiempo real con WebAudio.
// Sin archivos de audio: todo se sintetiza para que el juego sea autónomo.
const SCALES = {
  dorian: [0, 2, 3, 5, 7, 9, 10],
  aeolian: [0, 2, 3, 5, 7, 8, 10],
  harmonic: [0, 2, 3, 5, 7, 8, 11],
  major: [0, 2, 4, 5, 7, 9, 11],
  phrygian: [0, 1, 3, 5, 7, 8, 10],
  lydian: [0, 2, 4, 6, 7, 9, 11],
};

const TRACKS = {
  title: {
    bpm: 54, root: 50, scale: 'aeolian', progression: [0, 5, 3, 4], mood: 'epic',
    pad: { wave: 'sawtooth', gain: 0.055, attack: 1.8, release: 2.4, detune: 8 },
    arp: { wave: 'triangle', gain: 0.035, rate: 0.5, octave: 2, pattern: [0, 2, 4, 2, 5, 4, 2, 0] },
    bass: { wave: 'sine', gain: 0.07, octave: -1 },
    melody: { wave: 'sine', gain: 0.045, octave: 1, density: 0.28, long: true },
    perc: 0,
  },
  valdoria: {
    bpm: 72, root: 52, scale: 'dorian', progression: [0, 3, 5, 4], mood: 'wonder',
    pad: { wave: 'triangle', gain: 0.04, attack: 1.2, release: 1.8, detune: 4 },
    arp: { wave: 'triangle', gain: 0.045, rate: 0.5, octave: 1, pattern: [0, 2, 4, 2, 5, 4, 2, 0] },
    bass: { wave: 'sine', gain: 0.055, octave: -1 },
    melody: { wave: 'sine', gain: 0.05, octave: 1, density: 0.4 },
    perc: 0.12,
  },
  valdoriaCombat: {
    bpm: 104, root: 52, scale: 'dorian', progression: [0, 5, 3, 4], mood: 'battle',
    pad: { wave: 'sawtooth', gain: 0.03, attack: 0.5, release: 0.8, detune: 6 },
    arp: { wave: 'square', gain: 0.035, rate: 0.25, octave: 1, pattern: [0, 0, 3, 0, 5, 3, 0, 4] },
    bass: { wave: 'sawtooth', gain: 0.06, octave: -1 },
    melody: { wave: 'triangle', gain: 0.04, octave: 1, density: 0.5 },
    perc: 0.55,
  },
  drakmor: {
    bpm: 66, root: 45, scale: 'phrygian', progression: [0, 1, 5, 4], mood: 'dark',
    pad: { wave: 'sawtooth', gain: 0.045, attack: 1.4, release: 2.2, detune: 10 },
    arp: { wave: 'triangle', gain: 0.03, rate: 0.5, octave: 1, pattern: [0, 1, 3, 1, 4, 3, 1, 0] },
    bass: { wave: 'sine', gain: 0.075, octave: -1 },
    melody: { wave: 'sine', gain: 0.035, octave: 1, density: 0.25, long: true },
    perc: 0.2,
  },
  drakmorCombat: {
    bpm: 116, root: 45, scale: 'phrygian', progression: [0, 1, 5, 4], mood: 'battle',
    pad: { wave: 'sawtooth', gain: 0.032, attack: 0.4, release: 0.7, detune: 9 },
    arp: { wave: 'square', gain: 0.033, rate: 0.25, octave: 1, pattern: [0, 0, 1, 0, 4, 3, 1, 0] },
    bass: { wave: 'sawtooth', gain: 0.065, octave: -1 },
    melody: { wave: 'triangle', gain: 0.04, octave: 1, density: 0.45 },
    perc: 0.7,
  },
  kansordore: {
    bpm: 60, root: 55, scale: 'lydian', progression: [0, 4, 5, 3], mood: 'celestial',
    pad: { wave: 'sine', gain: 0.05, attack: 2.2, release: 3, detune: 3 },
    arp: { wave: 'sine', gain: 0.04, rate: 0.5, octave: 2, pattern: [0, 2, 4, 6, 4, 2, 5, 2] },
    bass: { wave: 'sine', gain: 0.05, octave: -1 },
    melody: { wave: 'sine', gain: 0.04, octave: 2, density: 0.3, long: true },
    perc: 0.05,
  },
  kansordoreCombat: {
    bpm: 100, root: 55, scale: 'harmonic', progression: [0, 5, 3, 4], mood: 'battle',
    pad: { wave: 'sawtooth', gain: 0.028, attack: 0.6, release: 1, detune: 5 },
    arp: { wave: 'triangle', gain: 0.035, rate: 0.25, octave: 2, pattern: [0, 2, 4, 2, 6, 4, 2, 1] },
    bass: { wave: 'sawtooth', gain: 0.055, octave: -1 },
    melody: { wave: 'sine', gain: 0.045, octave: 2, density: 0.5 },
    perc: 0.45,
  },
  boss: {
    bpm: 132, root: 43, scale: 'harmonic', progression: [0, 1, 4, 5], mood: 'boss',
    pad: { wave: 'sawtooth', gain: 0.04, attack: 0.35, release: 0.6, detune: 12 },
    arp: { wave: 'square', gain: 0.04, rate: 0.125, octave: 1, pattern: [0, 1, 0, 3, 0, 4, 3, 1] },
    bass: { wave: 'sawtooth', gain: 0.08, octave: -1 },
    melody: { wave: 'sawtooth', gain: 0.035, octave: 1, density: 0.55 },
    perc: 0.9,
  },
  ending: {
    bpm: 58, root: 57, scale: 'major', progression: [0, 4, 5, 3], mood: 'epic',
    pad: { wave: 'sine', gain: 0.06, attack: 2, release: 3, detune: 3 },
    arp: { wave: 'triangle', gain: 0.04, rate: 0.5, octave: 2, pattern: [0, 2, 4, 6, 4, 2, 5, 4] },
    bass: { wave: 'sine', gain: 0.055, octave: -1 },
    melody: { wave: 'sine', gain: 0.05, octave: 2, density: 0.35, long: true },
    perc: 0.08,
  },
};

const midiToFreq = (m) => 440 * Math.pow(2, (m - 69) / 12);

export class AudioEngine {
  constructor() {
    this.ctx = null;
    this.ready = false;
    this.master = null;
    this.musicBus = null;
    this.sfxBus = null;
    this.trackName = null;
    this.track = null;
    this.combat = false;
    this.timer = null;
    this.nextBarTime = 0;
    this.bar = 0;
    this.volumes = { master: 0.8, music: 0.55, sfx: 0.7 };
    this.noiseBuffer = null;
    this.suspended = false;
    this.intensity = 0;
    this._musicFade = null;
  }

  async init() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') await this.ctx.resume();
      return;
    }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    this.ctx = new AC();
    const comp = this.ctx.createDynamicsCompressor();
    comp.threshold.value = -14;
    comp.knee.value = 22;
    comp.ratio.value = 4;
    comp.attack.value = 0.004;
    comp.release.value = 0.25;
    comp.connect(this.ctx.destination);
    this.master = this.ctx.createGain();
    this.master.gain.value = this.volumes.master;
    this.master.connect(comp);
    this.musicBus = this.ctx.createGain();
    this.musicBus.gain.value = this.volumes.music;
    this.musicBus.connect(this.master);
    this.sfxBus = this.ctx.createGain();
    this.sfxBus.gain.value = this.volumes.sfx;
    this.sfxBus.connect(this.master);
    this.ready = true;
    this._makeNoise();
    this._scheduleLoop();
    if (this.trackName) this._startTrack(this.trackName);
  }

  _makeNoise() {
    const len = this.ctx.sampleRate * 1.2;
    const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    this.noiseBuffer = buf;
  }

  setVolumes(v) {
    Object.assign(this.volumes, v);
    if (!this.ready) return;
    this.master.gain.setTargetAtTime(this.volumes.master, this.ctx.currentTime, 0.05);
    this.musicBus.gain.setTargetAtTime(this.volumes.music, this.ctx.currentTime, 0.05);
    this.sfxBus.gain.setTargetAtTime(this.volumes.sfx, this.ctx.currentTime, 0.05);
  }

  setTrack(name, { combat = false, restart = false } = {}) {
    const full = combat && TRACKS[name + 'Combat'] ? name + 'Combat' : name;
    this.combat = combat;
    if (full === this.trackName && !restart) return;
    this.trackName = full;
    this.track = TRACKS[full] || TRACKS.title;
    if (this.ready) this._startTrack(full);
  }

  _startTrack(name) {
    if (!this.ready) return;
    this.trackName = name;
    this.track = TRACKS[name] || TRACKS.title;
    this.bar = 0;
    this.nextBarTime = this.ctx.currentTime + 0.08;
  }

  _scheduleLoop() {
    if (this.timer) return;
    this.timer = setInterval(() => {
      if (!this.ready || this.suspended || !this.track) return;
      const now = this.ctx.currentTime;
      const spb = 60 / this.track.bpm;
      const barDur = spb * 4;
      while (this.nextBarTime < now + 0.5) {
        this._scheduleBar(this.nextBarTime, this.track, this.bar);
        this.nextBarTime += barDur;
        this.bar++;
      }
    }, 80);
  }

  _scheduleBar(t, tr, barIndex) {
    const spb = 60 / tr.bpm;
    const scale = SCALES[tr.scale] || SCALES.aeolian;
    const prog = tr.progression[barIndex % tr.progression.length];
    const chordRoot = tr.root + prog;
    const combat = this.combat || tr.mood === 'boss';
    // Pad armónico.
    if (tr.pad) {
      const notes = [0, 2, 4].map((n, i) => chordRoot + scale[(prog + n) % scale.length] + (n >= 4 ? 12 : 0));
      notes.forEach((m, i) => this._note(t + i * 0.03, midiToFreq(m), spb * 4, tr.pad.wave, tr.pad.gain * (0.8 + Math.random() * 0.3), {
        attack: tr.pad.attack, release: tr.pad.release, detune: tr.pad.detune, filter: 900 + i * 180, music: true,
      }));
    }
    // Bajo.
    if (tr.bass) {
      this._note(t, midiToFreq(chordRoot + tr.bass.octave * 12), spb * 3.7, tr.bass.wave, tr.bass.gain, {
        attack: 0.02, release: 0.7, filter: 300, music: true,
      });
      if (combat) this._note(t + spb * 2, midiToFreq(chordRoot + tr.bass.octave * 12), spb * 1.6, tr.bass.wave, tr.bass.gain * 0.8, { attack: 0.01, release: 0.4, filter: 280, music: true });
    }
    // Arpegio.
    if (tr.arp) {
      const steps = 8;
      for (let i = 0; i < steps; i++) {
        if (!combat && i % 2 === 1 && Math.random() < 0.3) continue;
        const pattern = tr.arp.pattern[i % tr.arp.pattern.length];
        const midi = chordRoot + scale[pattern % scale.length] + tr.arp.octave * 12;
        this._note(t + i * (spb * 4 / steps), midiToFreq(midi), spb * (combat ? 0.45 : 0.9), tr.arp.wave, tr.arp.gain * (0.7 + Math.random() * 0.4), {
          attack: 0.005, release: 0.35, filter: 1800, music: true,
        });
      }
    }
    // Melodía.
    if (tr.melody) {
      const beats = combat ? [0, 1, 2, 3] : [0, 2];
      for (const b of beats) {
        if (Math.random() > tr.melody.density + (combat ? 0.15 : 0)) continue;
        const deg = Math.floor(Math.random() * scale.length);
        const oct = tr.melody.octave + (Math.random() < 0.2 ? 1 : 0);
        const midi = chordRoot + scale[deg] + oct * 12;
        const dur = spb * (tr.melody.long ? 2.5 : 0.9);
        this._note(t + b * spb, midiToFreq(midi), dur, tr.melody.wave, tr.melody.gain * 0.85, {
          attack: 0.08, release: 0.6, filter: 2600, music: true,
        });
      }
    }
    // Percusión.
    if (tr.perc > 0) {
      const p = tr.perc;
      for (let i = 0; i < 8; i++) {
        const at = t + i * (spb / 2);
        if (i % 4 === 0) this._drum(at, 'kick', p * (combat ? 0.5 : 0.22));
        if (i % 4 === 2) this._drum(at, 'snare', p * (combat ? 0.32 : 0.1));
        if (combat && i % 2 === 1) this._drum(at, 'hat', p * 0.08);
      }
    }
  }

  _note(time, freq, dur, type, gain, opts = {}) {
    if (!this.ctx || gain <= 0) return;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    const filt = this.ctx.createBiquadFilter();
    filt.type = 'lowpass';
    filt.frequency.value = opts.filter || 2200;
    filt.Q.value = opts.q || 0.7;
    osc.type = type;
    osc.frequency.value = freq;
    if (opts.detune) {
      const osc2 = this.ctx.createOscillator();
      const g2 = this.ctx.createGain();
      osc2.type = type;
      osc2.frequency.value = freq;
      osc2.detune.value = opts.detune;
      g2.gain.value = 0.45;
      osc2.connect(g2).connect(filt);
      osc2.start(time);
      osc2.stop(time + dur + (opts.release || 0.3) + 0.1);
    }
    const attack = Math.max(0.003, opts.attack ?? 0.02);
    const release = Math.max(0.05, opts.release ?? 0.3);
    g.gain.setValueAtTime(0.0001, time);
    g.gain.linearRampToValueAtTime(gain, time + attack);
    g.gain.setValueAtTime(gain, time + Math.max(attack, dur * 0.7));
    g.gain.exponentialRampToValueAtTime(0.0001, time + dur + release);
    osc.connect(g).connect(filt).connect(opts.music ? this.musicBus : this.sfxBus);
    osc.start(time);
    osc.stop(time + dur + release + 0.1);
    osc.onended = () => { try { g.disconnect(); filt.disconnect(); } catch {} };
  }

  _drum(time, kind, gain) {
    if (!this.noiseBuffer || gain <= 0) return;
    const src = this.ctx.createBufferSource();
    src.buffer = this.noiseBuffer;
    const g = this.ctx.createGain();
    const filt = this.ctx.createBiquadFilter();
    filt.type = kind === 'kick' ? 'lowpass' : 'highpass';
    filt.frequency.value = kind === 'kick' ? 120 : kind === 'snare' ? 800 : 5000;
    src.connect(filt).connect(g).connect(this.musicBus);
    const dur = kind === 'kick' ? 0.18 : kind === 'snare' ? 0.14 : 0.05;
    g.gain.setValueAtTime(gain, time);
    g.gain.exponentialRampToValueAtTime(0.0001, time + dur);
    src.start(time);
    src.stop(time + dur + 0.02);
  }

  sfx(name, { volume = 1, pan = 0 } = {}) {
    if (!this.ready) return;
    const t = this.ctx.currentTime;
    const v = volume;
    const panner = this.ctx.createStereoPanner?.();
    if (panner) panner.pan.value = Math.max(-1, Math.min(1, pan));
    const out = (node) => { if (panner) { node.connect(panner); panner.connect(this.sfxBus); } else node.connect(this.sfxBus); };
    switch (name) {
      case 'ui': this._note(t, 880, 0.06, 'sine', 0.08 * v, { attack: 0.002, release: 0.08 }); break;
      case 'hover': this._note(t, 620, 0.04, 'sine', 0.04 * v, { attack: 0.002, release: 0.05 }); break;
      case 'attack': this._noiseSweep(t, 0.12, 0.18 * v, 900, 300, out); this._note(t, 220, 0.1, 'sawtooth', 0.05 * v, { attack: 0.002, release: 0.12 }); break;
      case 'heavy': this._noiseSweep(t, 0.22, 0.26 * v, 500, 120, out); this._note(t, 110, 0.2, 'sawtooth', 0.1 * v, { attack: 0.005, release: 0.25 }); break;
      case 'hit': this._noiseSweep(t, 0.1, 0.2 * v, 1800, 500, out); this._note(t, 160, 0.08, 'square', 0.08 * v, { attack: 0.002, release: 0.1 }); break;
      case 'crit': this._noiseSweep(t, 0.16, 0.26 * v, 3000, 700, out); this._note(t, 880, 0.18, 'triangle', 0.08 * v, { attack: 0.002, release: 0.2 }); break;
      case 'dodge': this._noiseSweep(t, 0.2, 0.12 * v, 400, 1600, out); break;
      case 'spell': this._note(t, 523, 0.3, 'sine', 0.08 * v, { attack: 0.01, release: 0.4 }); this._note(t + 0.04, 784, 0.3, 'sine', 0.06 * v, { attack: 0.01, release: 0.4 }); break;
      case 'fire': this._noiseSweep(t, 0.4, 0.18 * v, 1200, 300, out); break;
      case 'parry': this._note(t, 1320, 0.25, 'sine', 0.12 * v, { attack: 0.002, release: 0.4 }); this._note(t, 1760, 0.18, 'triangle', 0.06 * v, { attack: 0.002, release: 0.3 }); break;
      case 'potion': this._note(t, 440, 0.2, 'sine', 0.06 * v, { attack: 0.01, release: 0.25 }); this._note(t + 0.1, 660, 0.3, 'sine', 0.06 * v, { attack: 0.01, release: 0.3 }); break;
      case 'pickup': this._note(t, 880, 0.1, 'triangle', 0.06 * v, { attack: 0.002, release: 0.12 }); this._note(t + 0.07, 1174, 0.16, 'triangle', 0.05 * v, { attack: 0.002, release: 0.2 }); break;
      case 'gold': this._note(t, 1046, 0.08, 'sine', 0.05 * v, { attack: 0.002, release: 0.1 }); this._note(t + 0.05, 1568, 0.12, 'sine', 0.04 * v, { attack: 0.002, release: 0.16 }); break;
      case 'levelup': [523, 659, 784, 1046].forEach((f, i) => this._note(t + i * 0.1, f, 0.5, 'sine', 0.07 * v, { attack: 0.01, release: 0.6 })); break;
      case 'capture': [392, 523, 659, 784, 1046].forEach((f, i) => this._note(t + i * 0.09, f, 0.7, 'sine', 0.06 * v, { attack: 0.02, release: 0.8 })); break;
      case 'fail': this._note(t, 180, 0.4, 'sawtooth', 0.08 * v, { attack: 0.01, release: 0.5 }); this._note(t + 0.08, 140, 0.5, 'sawtooth', 0.06 * v, { attack: 0.01, release: 0.5 }); break;
      case 'death': [220, 196, 164, 110].forEach((f, i) => this._note(t + i * 0.18, f, 0.8, 'sawtooth', 0.06 * v, { attack: 0.02, release: 0.9 })); break;
      case 'waypoint': [392, 523, 659, 880].forEach((f, i) => this._note(t + i * 0.12, f, 0.9, 'sine', 0.05 * v, { attack: 0.03, release: 1 })); break;
      case 'door': this._noiseSweep(t, 0.7, 0.16 * v, 300, 80, out); break;
      case 'chest': this._note(t, 330, 0.2, 'triangle', 0.07 * v, { attack: 0.005, release: 0.3 }); this._note(t + 0.15, 660, 0.4, 'sine', 0.07 * v, { attack: 0.01, release: 0.5 }); break;
      case 'quest': [440, 554, 659].forEach((f, i) => this._note(t + i * 0.12, f, 0.6, 'sine', 0.06 * v, { attack: 0.01, release: 0.7 })); break;
      case 'buy': this._note(t, 1200, 0.08, 'triangle', 0.06 * v, { attack: 0.002, release: 0.1 }); this._note(t + 0.06, 900, 0.12, 'triangle', 0.05 * v, { attack: 0.002, release: 0.16 }); break;
      case 'error': this._note(t, 160, 0.18, 'square', 0.06 * v, { attack: 0.002, release: 0.2 }); break;
      case 'boss': [110, 104, 98, 82].forEach((f, i) => this._note(t + i * 0.25, f, 1.2, 'sawtooth', 0.09 * v, { attack: 0.05, release: 1.4, filter: 500 })); break;
      case 'step': this._noiseSweep(t, 0.05, 0.035 * v, 900, 400, out); break;
      case 'splash': this._noiseSweep(t, 0.25, 0.12 * v, 2000, 400, out); break;
      case 'thunder': this._noiseSweep(t, 1.4, 0.2 * v, 600, 60, out); break;
      default: break;
    }
  }

  _noiseSweep(time, dur, gain, f0, f1, out) {
    if (!this.noiseBuffer) return;
    const src = this.ctx.createBufferSource();
    src.buffer = this.noiseBuffer;
    const g = this.ctx.createGain();
    const f = this.ctx.createBiquadFilter();
    f.type = 'bandpass';
    f.Q.value = 1.2;
    f.frequency.setValueAtTime(f0, time);
    f.frequency.exponentialRampToValueAtTime(Math.max(40, f1), time + dur);
    src.connect(f).connect(g);
    out(g);
    g.gain.setValueAtTime(gain, time);
    g.gain.exponentialRampToValueAtTime(0.0001, time + dur);
    src.start(time);
    src.stop(time + dur + 0.02);
  }

  suspend() {
    if (!this.ctx) return;
    this.suspended = true;
    this.ctx.suspend().catch(() => {});
  }
  resume() {
    if (!this.ctx) return;
    this.suspended = false;
    this.ctx.resume().catch(() => {});
  }
}
