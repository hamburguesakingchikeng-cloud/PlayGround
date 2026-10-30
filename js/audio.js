// Música y efectos generados en tiempo real con Web Audio. Sin archivos externos.
import { clamp, lerp } from './utils.js';

const midi = n => 440 * Math.pow(2, (n - 69) / 12);

const TRACKS = {
  title: {
    bpm: 56, root: 50, scale: [0, 2, 3, 5, 7, 8, 10],
    chords: [[50, 57, 62], [46, 53, 58], [43, 50, 55], [45, 52, 57]],
    pad: 0.055, arp: 0.022, bass: 0.045, drums: 0, shimmer: 0.012, mode: 'minor'
  },
  village: {
    bpm: 78, root: 55, scale: [0, 2, 4, 5, 7, 9, 11],
    chords: [[55, 59, 62], [52, 55, 59], [48, 52, 55], [50, 54, 57]],
    pad: 0.028, arp: 0.024, bass: 0.03, drums: 0.015, shimmer: 0.008, mode: 'major'
  },
  forest: {
    bpm: 68, root: 57, scale: [0, 2, 3, 5, 7, 8, 10],
    chords: [[57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62]],
    pad: 0.038, arp: 0.02, bass: 0.025, drums: 0.008, shimmer: 0.014, mode: 'minor'
  },
  ruins: {
    bpm: 60, root: 49, scale: [0, 1, 3, 5, 7, 8, 10],
    chords: [[49, 56, 61], [45, 52, 57], [44, 51, 56], [47, 54, 59]],
    pad: 0.05, arp: 0.012, bass: 0.02, drums: 0, shimmer: 0.016, mode: 'phrygian'
  },
  quarry: {
    bpm: 74, root: 45, scale: [0, 2, 3, 5, 7, 8, 10],
    chords: [[45, 52, 57], [41, 48, 53], [43, 50, 55], [40, 47, 52]],
    pad: 0.032, arp: 0.016, bass: 0.04, drums: 0.018, shimmer: 0.006, mode: 'minor'
  },
  boss: {
    bpm: 142, root: 50, scale: [0, 1, 3, 5, 7, 8, 10],
    chords: [[50, 57, 62], [49, 56, 61], [46, 53, 58], [45, 52, 57]],
    pad: 0.045, arp: 0.022, bass: 0.075, drums: 0.12, shimmer: 0.01, mode: 'minor'
  },
  ending: {
    bpm: 62, root: 55, scale: [0, 2, 4, 5, 7, 9, 11],
    chords: [[55, 59, 62], [50, 54, 57], [48, 52, 55], [43, 47, 50]],
    pad: 0.048, arp: 0.024, bass: 0.025, drums: 0, shimmer: 0.012, mode: 'major'
  }
};

export class AudioEngine {
  constructor() {
    this.ctx = null;
    this.ready = false;
    this.master = null;
    this.musicBus = null;
    this.sfxBus = null;
    this.reverb = null;
    this.reverbSend = null;
    this.noiseBuffer = null;
    this.currentTrack = null;
    this.track = null;
    this.step = 0;
    this.nextTime = 0;
    this.timer = null;
    this.musicVolume = 0.55;
    this.sfxVolume = 0.7;
    this.muted = false;
    this.intensity = 1;
    this.lastFootstep = 0;
  }

  async unlock() {
    if (this.ready) {
      if (this.ctx.state === 'suspended') await this.ctx.resume();
      return true;
    }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    try {
      this.ctx = new AC();
      await this.ctx.resume();
      this.ready = true;
      this.master = this.ctx.createGain();
      this.master.gain.value = this.muted ? 0 : 0.9;
      this.master.connect(this.ctx.destination);

      this.musicBus = this.ctx.createGain();
      this.musicBus.gain.value = this.musicVolume * 0.42;
      this.musicBus.connect(this.master);

      this.sfxBus = this.ctx.createGain();
      this.sfxBus.gain.value = this.sfxVolume * 0.75;
      this.sfxBus.connect(this.master);

      this.reverb = this.ctx.createConvolver();
      this.reverb.buffer = this.makeImpulse(2.1, 2.8);
      this.reverbSend = this.ctx.createGain();
      this.reverbSend.gain.value = 0.5;
      this.reverbSend.connect(this.reverb);
      this.reverb.connect(this.master);

      this.noiseBuffer = this.makeNoise(2);
      this.timer = setInterval(() => this.scheduler(), 90);
      this.setTrack(this.currentTrack || 'title', true);
      return true;
    } catch (error) {
      console.warn('Audio no disponible:', error);
      return false;
    }
  }

  makeNoise(seconds) {
    const len = Math.floor(this.ctx.sampleRate * seconds);
    const buffer = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    return buffer;
  }

  makeImpulse(seconds, decay) {
    const len = Math.floor(this.ctx.sampleRate * seconds);
    const buffer = this.ctx.createBuffer(2, len, this.ctx.sampleRate);
    for (let c = 0; c < 2; c++) {
      const data = buffer.getChannelData(c);
      for (let i = 0; i < len; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
      }
    }
    return buffer;
  }

  setVolumes({ music, sfx, muted }) {
    if (typeof music === 'number') this.musicVolume = clamp(music, 0, 1);
    if (typeof sfx === 'number') this.sfxVolume = clamp(sfx, 0, 1);
    if (typeof muted === 'boolean') this.muted = muted;
    if (this.ready) {
      this.musicBus.gain.setTargetAtTime(this.musicVolume * 0.42, this.ctx.currentTime, 0.1);
      this.sfxBus.gain.setTargetAtTime(this.sfxVolume * 0.75, this.ctx.currentTime, 0.1);
      this.master.gain.setTargetAtTime(this.muted ? 0 : 0.9, this.ctx.currentTime, 0.1);
    }
  }

  setTrack(name, force = false) {
    if (!TRACKS[name]) name = 'village';
    if (!force && this.currentTrack === name) return;
    this.currentTrack = name;
    this.track = TRACKS[name];
    this.step = 0;
    if (this.ready) this.nextTime = this.ctx.currentTime + 0.08;
  }

  scheduler() {
    if (!this.ready || !this.track || this.muted) return;
    const stepDur = 60 / this.track.bpm / 2;
    while (this.nextTime < this.ctx.currentTime + 0.18) {
      this.playStep(this.track, this.step, this.nextTime, stepDur);
      this.step = (this.step + 1) % 256;
      this.nextTime += stepDur;
    }
  }

  playStep(track, step, time, dur) {
    const bar = Math.floor(step / 8) % track.chords.length;
    const chord = track.chords[bar];
    const inBar = step % 8;
    const intensity = this.intensity;

    if (inBar === 0) {
      chord.forEach((n, i) => this.pad(midi(n), time, dur * 8, track.pad * (i === 0 ? 1 : 0.72)));
      this.bass(midi(chord[0] - 12), time, dur * 2.8, track.bass, 'sine');
    }
    if (inBar === 4) {
      this.bass(midi(chord[2] - 12), time, dur * 2.2, track.bass * 0.8, 'triangle');
    }
    if (inBar % 2 === 0) {
      clipPlay(this, track, step, chord, time, dur);
    }
    if (track.drums > 0) {
      if (inBar === 0 || inBar === 3 || inBar === 6) this.drum(time, track.drums * intensity, inBar === 0);
      if (inBar === 2 || inBar === 6) this.hat(time, track.drums * 0.55);
    }
    if (track.shimmer > 0 && step % 16 === 3) {
      const n = chord[(step / 3 | 0) % chord.length] + 24;
      this.bell(midi(n), time, 2.2, track.shimmer * (1.6 + Math.sin(step) * 0.3));
    }
    if (inBar === 0 && step % 32 === 0) this.swell(time, track.pad * 0.6);
  }

  pad(freq, time, dur, gain) {
    const o1 = this.ctx.createOscillator(), o2 = this.ctx.createOscillator();
    const g = this.ctx.createGain(), f = this.ctx.createBiquadFilter();
    o1.type = 'sine'; o1.frequency.value = freq;
    o2.type = 'triangle'; o2.frequency.value = freq * 1.501;
    o2.detune.value = 3;
    f.type = 'lowpass'; f.frequency.value = 900; f.Q.value = 0.4;
    g.gain.setValueAtTime(0.0001, time);
    g.gain.exponentialRampToValueAtTime(Math.max(0.0002, gain), time + Math.min(1.1, dur * 0.35));
    g.gain.exponentialRampToValueAtTime(0.0001, time + dur);
    o1.connect(f); o2.connect(f); f.connect(g); g.connect(this.musicBus);
    const send = this.ctx.createGain(); send.gain.value = 0.35; g.connect(send); send.connect(this.reverbSend);
    o1.start(time); o2.start(time); o1.stop(time + dur + 0.05); o2.stop(time + dur + 0.05);
  }

  bass(freq, time, dur, gain, type = 'sine') {
    const o = this.ctx.createOscillator(), g = this.ctx.createGain(), f = this.ctx.createBiquadFilter();
    o.type = type; o.frequency.value = freq;
    f.type = 'lowpass'; f.frequency.value = 320;
    g.gain.setValueAtTime(0.0001, time);
    g.gain.exponentialRampToValueAtTime(Math.max(0.0002, gain), time + 0.025);
    g.gain.exponentialRampToValueAtTime(0.0001, time + dur);
    o.connect(f); f.connect(g); g.connect(this.musicBus);
    o.start(time); o.stop(time + dur + 0.03);
  }

  pluck(freq, time, dur, gain) {
    const o = this.ctx.createOscillator(), o2 = this.ctx.createOscillator(), g = this.ctx.createGain(), f = this.ctx.createBiquadFilter();
    o.type = 'triangle'; o.frequency.value = freq;
    o2.type = 'sine'; o2.frequency.value = freq * 2; o2.detune.value = 4;
    f.type = 'lowpass'; f.frequency.setValueAtTime(2200, time); f.frequency.exponentialRampToValueAtTime(480, time + dur);
    g.gain.setValueAtTime(0.0001, time);
    g.gain.exponentialRampToValueAtTime(Math.max(0.0002, gain), time + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, time + dur);
    o.connect(f); o2.connect(f); f.connect(g); g.connect(this.musicBus);
    const send = this.ctx.createGain(); send.gain.value = 0.28; g.connect(send); send.connect(this.reverbSend);
    o.start(time); o2.start(time); o.stop(time + dur + 0.03); o2.stop(time + dur + 0.03);
  }

  bell(freq, time, dur, gain) {
    const o = this.ctx.createOscillator(), o2 = this.ctx.createOscillator(), g = this.ctx.createGain();
    o.type = 'sine'; o.frequency.value = freq;
    o2.type = 'sine'; o2.frequency.value = freq * 2.01;
    g.gain.setValueAtTime(0.0001, time);
    g.gain.exponentialRampToValueAtTime(Math.max(0.0002, gain), time + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, time + dur);
    o.connect(g); o2.connect(g); g.connect(this.musicBus);
    const send = this.ctx.createGain(); send.gain.value = 0.45; g.connect(send); send.connect(this.reverbSend);
    o.start(time); o2.start(time); o.stop(time + dur); o2.stop(time + dur);
  }

  swell(time, gain) {
    const src = this.ctx.createBufferSource(); src.buffer = this.noiseBuffer;
    const f = this.ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 800; f.Q.value = 0.8;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.0001, time); g.gain.linearRampToValueAtTime(gain, time + 1.8); g.gain.exponentialRampToValueAtTime(0.0001, time + 4);
    src.connect(f); f.connect(g); g.connect(this.reverbSend);
    src.start(time); src.stop(time + 4.1);
  }

  drum(time, gain, kick = false) {
    if (kick) {
      const o = this.ctx.createOscillator(), g = this.ctx.createGain();
      o.type = 'sine'; o.frequency.setValueAtTime(105, time); o.frequency.exponentialRampToValueAtTime(38, time + 0.15);
      g.gain.setValueAtTime(gain, time); g.gain.exponentialRampToValueAtTime(0.0001, time + 0.32);
      o.connect(g); g.connect(this.musicBus); o.start(time); o.stop(time + 0.34);
    } else {
      this.noise(time, 0.08, gain * 0.6, 'lowpass', 500);
    }
  }

  hat(time, gain) {
    this.noise(time, 0.035, gain * 0.5, 'highpass', 5000);
  }

  noise(time, dur, gain, filterType = 'bandpass', freq = 900) {
    const src = this.ctx.createBufferSource(); src.buffer = this.noiseBuffer;
    const f = this.ctx.createBiquadFilter(); f.type = filterType; f.frequency.value = freq;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(Math.max(0.0002, gain), time);
    g.gain.exponentialRampToValueAtTime(0.0001, time + dur);
    src.connect(f); f.connect(g); g.connect(this.musicBus);
    src.start(time); src.stop(time + dur + 0.02);
  }

  // ------------------------- Efectos de sonido -------------------------
  sfx(name, opts = {}) {
    if (!this.ready || this.muted) return;
    const t = this.ctx.currentTime + (opts.delay || 0);
    const pan = clamp(opts.pan || 0, -1, 1);
    const vol = clamp(opts.volume ?? 1, 0, 2);
    const out = this.ctx.createGain();
    out.gain.value = vol;
    if (this.ctx.createStereoPanner) {
      const p = this.ctx.createStereoPanner(); p.pan.value = pan;
      out.connect(p); p.connect(this.sfxBus);
    } else out.connect(this.sfxBus);

    switch (name) {
      case 'swing':
        this.noiseSweep(t, 0.15, 0.19, 2800, 700, out);
        this.tone(t, 180, 0.1, 0.03, 'triangle', 900, out);
        break;
      case 'hit':
        this.thump(t, 95, 0.16, 0.32, out);
        this.noiseSweep(t, 0.09, 0.14, 1200, 300, out);
        break;
      case 'crit':
        this.thump(t, 120, 0.2, 0.36, out);
        this.tone(t + 0.01, 1250, 0.16, 0.12, 'square', 2600, out);
        this.noiseSweep(t, 0.13, 0.15, 4500, 900, out);
        break;
      case 'hurt':
        this.thump(t, 68, 0.3, 0.36, out);
        this.tone(t, 220, 0.22, 0.11, 'sawtooth', 600, out);
        break;
      case 'dodge':
        this.noiseSweep(t, 0.22, 0.12, 1800, 300, out);
        break;
      case 'block':
        this.tone(t, 540, 0.18, 0.15, 'square', 1600, out);
        this.tone(t + 0.01, 880, 0.15, 0.08, 'triangle', 2200, out);
        break;
      case 'heal':
        [523, 659, 784, 1046].forEach((f, i) => this.tone(t + i * 0.07, f, 0.6, 0.055, 'sine', 3000, out));
        break;
      case 'magic':
        this.sweepTone(t, 300, 1400, 0.4, 0.09, 'sine', out);
        this.noiseSweep(t, 0.35, 0.06, 3200, 800, out);
        break;
      case 'pickup':
        this.tone(t, 880, 0.12, 0.09, 'sine', 3000, out);
        this.tone(t + 0.07, 1320, 0.16, 0.07, 'sine', 3000, out);
        break;
      case 'coin':
        this.tone(t, 1180, 0.08, 0.08, 'square', 4000, out);
        this.tone(t + 0.06, 1560, 0.14, 0.06, 'square', 4000, out);
        break;
      case 'select':
        this.tone(t, 660, 0.05, 0.06, 'sine', 1800, out);
        break;
      case 'confirm':
        this.tone(t, 740, 0.08, 0.07, 'sine', 2200, out);
        this.tone(t + 0.07, 1110, 0.13, 0.06, 'sine', 2600, out);
        break;
      case 'back':
        this.tone(t, 520, 0.07, 0.05, 'sine', 1800, out);
        this.tone(t + 0.05, 390, 0.11, 0.045, 'sine', 1600, out);
        break;
      case 'levelup':
        [392, 523, 659, 784, 1046, 1318].forEach((f, i) => this.tone(t + i * 0.09, f, 0.7, 0.07, 'triangle', 2600, out));
        break;
      case 'capture':
        [659, 880, 1174, 1568].forEach((f, i) => this.bellTone(t + i * 0.1, f, 0.9, 0.08, out));
        break;
      case 'fail':
        this.tone(t, 180, 0.2, 0.1, 'sawtooth', 600, out);
        this.tone(t + 0.12, 140, 0.26, 0.08, 'sawtooth', 500, out);
        break;
      case 'seal':
        this.sweepTone(t, 180, 900, 0.7, 0.1, 'sine', out);
        [523, 784, 1046].forEach((f, i) => this.bellTone(t + 0.3 + i * 0.14, f, 1.4, 0.07, out));
        break;
      case 'gate':
        this.thump(t, 48, 1.4, 0.35, out);
        [131, 196, 262, 392, 523].forEach((f, i) => this.padTone(t + i * 0.18, f, 2.8, 0.06, out));
        break;
      case 'boss':
        this.tone(t, 58, 1.2, 0.3, 'sawtooth', 240, out);
        this.tone(t + 0.2, 82, 1.0, 0.18, 'sawtooth', 300, out);
        this.noiseSweep(t + 0.1, 0.9, 0.15, 800, 120, out);
        break;
      case 'die':
        this.tone(t, 320, 0.5, 0.12, 'sawtooth', 800, out);
        this.tone(t + 0.15, 220, 0.7, 0.1, 'sawtooth', 600, out);
        break;
      case 'save':
        [523, 659, 784].forEach((f, i) => this.bellTone(t + i * 0.12, f, 1.3, 0.06, out));
        break;
      case 'chest':
        this.noiseSweep(t, 0.25, 0.12, 900, 300, out);
        [392, 523, 659].forEach((f, i) => this.bellTone(t + 0.18 + i * 0.1, f, 0.8, 0.07, out));
        break;
      case 'ui_open':
        this.tone(t, 440, 0.08, 0.05, 'sine', 1500, out);
        this.tone(t + 0.06, 660, 0.1, 0.04, 'sine', 2000, out);
        break;
      case 'quest':
        [523, 659, 784, 1046].forEach((f, i) => this.tone(t + i * 0.11, f, 0.5, 0.045, 'triangle', 2200, out));
        break;
    }
  }

  tone(time, freq, dur, gain, type, filterFreq, out) {
    const o = this.ctx.createOscillator(), g = this.ctx.createGain(), f = this.ctx.createBiquadFilter();
    o.type = type; o.frequency.value = freq;
    f.type = 'lowpass'; f.frequency.value = filterFreq;
    g.gain.setValueAtTime(0.0001, time);
    g.gain.linearRampToValueAtTime(gain, time + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, time + dur);
    o.connect(f); f.connect(g); g.connect(out);
    o.start(time); o.stop(time + dur + 0.02);
  }

  bellTone(time, freq, dur, gain, out) {
    this.tone(time, freq, dur, gain, 'sine', 6000, out);
    this.tone(time + 0.005, freq * 2.01, dur * 0.7, gain * 0.35, 'sine', 7000, out);
  }

  padTone(time, freq, dur, gain, out) {
    const o = this.ctx.createOscillator(), g = this.ctx.createGain();
    o.type = 'triangle'; o.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, time); g.gain.linearRampToValueAtTime(gain, time + 0.2);
    g.gain.exponentialRampToValueAtTime(0.0001, time + dur);
    o.connect(g); g.connect(out); o.start(time); o.stop(time + dur);
  }

  thump(time, freq, dur, gain, out) {
    const o = this.ctx.createOscillator(), g = this.ctx.createGain();
    o.type = 'sine'; o.frequency.setValueAtTime(freq, time);
    o.frequency.exponentialRampToValueAtTime(Math.max(25, freq * 0.4), time + dur);
    g.gain.setValueAtTime(gain, time); g.gain.exponentialRampToValueAtTime(0.0001, time + dur);
    o.connect(g); g.connect(out); o.start(time); o.stop(time + dur + 0.02);
  }

  sweepTone(time, f1, f2, dur, gain, type, out) {
    const o = this.ctx.createOscillator(), g = this.ctx.createGain(), f = this.ctx.createBiquadFilter();
    o.type = type; o.frequency.setValueAtTime(f1, time); o.frequency.exponentialRampToValueAtTime(f2, time + dur);
    f.type = 'lowpass'; f.frequency.setValueAtTime(3200, time); f.frequency.exponentialRampToValueAtTime(600, time + dur);
    g.gain.setValueAtTime(0.0001, time); g.gain.linearRampToValueAtTime(gain, time + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, time + dur);
    o.connect(f); f.connect(g); g.connect(out); o.start(time); o.stop(time + dur + 0.02);
  }

  noiseSweep(time, dur, gain, f1, f2, out) {
    const src = this.ctx.createBufferSource(); src.buffer = this.noiseBuffer;
    const f = this.ctx.createBiquadFilter(); f.type = 'bandpass'; f.Q.value = 0.8;
    f.frequency.setValueAtTime(f1, time); f.frequency.exponentialRampToValueAtTime(f2, time + dur);
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(gain, time); g.gain.exponentialRampToValueAtTime(0.0001, time + dur);
    src.connect(f); f.connect(g); g.connect(out);
    src.start(time); src.stop(time + dur + 0.02);
  }

  footstep() {
    if (!this.ready || this.muted) return;
    const now = this.ctx.currentTime;
    if (now - this.lastFootstep < 0.26) return;
    this.lastFootstep = now;
    const src = this.ctx.createBufferSource(); src.buffer = this.noiseBuffer;
    const f = this.ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 340;
    const g = this.ctx.createGain(); g.gain.setValueAtTime(0.035, now); g.gain.exponentialRampToValueAtTime(0.0001, now + 0.07);
    src.connect(f); f.connect(g); g.connect(this.sfxBus); src.start(now); src.stop(now + 0.08);
  }
}

function clipPlay(audio, track, step, chord, time, dur) {
  const degree = [0, 2, 4, 1, 3, 5, 2, 4][step % 8];
  const octave = step % 16 < 8 ? 12 : 24;
  const note = chord[degree % chord.length] + octave;
  audio.pluck(midi(note), time, dur * 1.6, track.arp);
  if (step % 8 === 6) audio.pluck(midi(note + 7), time + dur * 0.5, dur, track.arp * 0.55);
}
