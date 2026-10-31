// ============================================================
// LA ESPADA CELESTIAL — audio procedural (WebAudio)
// ============================================================
import { REGION_MUSIC } from './data.js';

export class AudioEngine {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.musicBus = null;
    this.sfxBus = null;
    this.noiseBuffer = null;
    this.musicTimer = null;
    this.mood = null;
    this.step = 0;
    this.nextNoteTime = 0;
    this.volumes = { master: .7, music: .55, sfx: .8 };
    this.muted = false;
    this.started = false;
  }

  init() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') this.ctx.resume();
      return;
    }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    this.ctx = new AC();
    this.master = this.ctx.createGain();
    this.musicBus = this.ctx.createGain();
    this.sfxBus = this.ctx.createGain();
    const comp = this.ctx.createDynamicsCompressor();
    comp.threshold.value = -18; comp.knee.value = 20; comp.ratio.value = 6;
    this.musicBus.connect(this.master);
    this.sfxBus.connect(this.master);
    this.master.connect(comp); comp.connect(this.ctx.destination);
    this.applyVolumes();
    // noise buffer
    const len = this.ctx.sampleRate * 1.2;
    const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
    this.noiseBuffer = buf;
    this.started = true;
  }

  applyVolumes() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    this.master.gain.cancelScheduledValues(now);
    this.master.gain.linearRampToValueAtTime(this.muted ? 0 : this.volumes.master, now + .08);
    this.musicBus.gain.linearRampToValueAtTime(this.volumes.music * .42, now + .08);
    this.sfxBus.gain.linearRampToValueAtTime(this.volumes.sfx * .6, now + .08);
  }

  setVolumes(v) {
    Object.assign(this.volumes, v);
    this.applyVolumes();
  }

  toggleMute() {
    this.muted = !this.muted; this.applyVolumes(); return this.muted;
  }

  tone(freq, dur, type = 'sine', vol = .1, when = 0, bus = null, glide = null) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime + when;
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, t);
    if (glide) o.frequency.exponentialRampToValueAtTime(Math.max(20, glide), t + dur);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vol, t + Math.min(.03, dur * .2));
    g.gain.exponentialRampToValueAtTime(.0001, t + dur);
    o.connect(g); g.connect(bus || this.sfxBus);
    o.start(t); o.stop(t + dur + .05);
  }

  noise(dur = .15, vol = .1, when = 0, filterFreq = 1600, type = 'bandpass', q = 1) {
    if (!this.ctx || !this.noiseBuffer) return;
    const t = this.ctx.currentTime + when;
    const src = this.ctx.createBufferSource(); src.buffer = this.noiseBuffer;
    const f = this.ctx.createBiquadFilter(); f.type = type; f.frequency.value = filterFreq; f.Q.value = q;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
    src.connect(f); f.connect(g); g.connect(this.sfxBus);
    src.start(t); src.stop(t + dur + .02);
  }

  // ---------------- música ----------------
  startMusic(mood = 'menu') {
    this.init();
    if (!this.ctx) return;
    if (this.mood === mood && this.musicTimer) return;
    this.stopMusic();
    this.mood = mood;
    this.step = 0;
    this.nextNoteTime = this.ctx.currentTime + .15;
    this.scheduleMusic();
    this.musicTimer = setInterval(() => this.scheduleMusic(), 280);
  }

  stopMusic() {
    if (this.musicTimer) clearInterval(this.musicTimer);
    this.musicTimer = null; this.mood = null;
  }

  scheduleMusic() {
    if (!this.ctx || !this.mood) return;
    const cfg = REGION_MUSIC[this.mood] || REGION_MUSIC.menu;
    const stepDur = 60 / cfg.tempo / 2;
    while (this.nextNoteTime < this.ctx.currentTime + .8) {
      this.playStep(cfg, this.step, this.nextNoteTime - this.ctx.currentTime, stepDur);
      this.nextNoteTime += stepDur;
      this.step++;
    }
  }

  playStep(cfg, step, when, stepDur) {
    const scale = cfg.scale, root = cfg.root;
    const chords = {
      pastoral: [[0, 4, 7], [-3, 2, 5], [-5, 0, 4], [-2, 2, 7]],
      dark: [[0, 3, 7], [-4, 0, 5], [-2, 1, 6], [-5, 0, 3]],
      celestial: [[0, 4, 7], [2, 5, 9], [-3, 2, 7], [-5, 0, 4]],
      mystic: [[0, 3, 7], [-2, 2, 5], [-4, 0, 3], [-5, 0, 4]],
    }[cfg.mood] || [[0, 4, 7]];
    const bar = Math.floor(step / 8);
    const chord = chords[bar % chords.length];
    // pad cada compás
    if (step % 8 === 0) {
      chord.forEach((n, i) => {
        const f = root * Math.pow(2, n / 12) * (i === 0 ? .5 : 1);
        this.tone(f, stepDur * 8.5, 'sine', cfg.mood === 'dark' ? .035 : .026, when, this.musicBus, f * .998);
        this.tone(f * 2.002, stepDur * 7.5, 'triangle', .008, when + .1, this.musicBus);
      });
      const bass = root * .5 * Math.pow(2, chord[0] / 12);
      this.tone(bass, stepDur * 3.5, 'triangle', .035, when, this.musicBus);
    }
    // arpegio
    const arpPattern = [0, 2, 1, 3, 2, 1, 3, 2];
    if (step % 2 === 0 || cfg.mood === 'dark') {
      const note = chord[arpPattern[step % arpPattern.length] % chord.length] + (step % 16 === 12 ? 12 : 0);
      const f = root * Math.pow(2, note / 12) * 2;
      this.tone(f, stepDur * 1.6, cfg.mood === 'celestial' ? 'sine' : 'triangle', .012, when, this.musicBus);
    }
    // melodía escasa
    if (step % 16 === 0 || (cfg.mood === 'dark' && step % 16 === 10)) {
      const f = root * Math.pow(2, scale[(bar + 2) % scale.length] / 12) * 2;
      this.tone(f, stepDur * 3, 'sine', .014, when + .05, this.musicBus, f * 1.003);
    }
    // pulso suave
    if (step % 4 === 0 && cfg.mood !== 'celestial') {
      this.noise(.08, cfg.mood === 'dark' ? .012 : .006, when, 90, 'lowpass', .7);
    }
    if (cfg.mood === 'celestial' && step % 8 === 4) {
      this.tone(root * 4, stepDur * 2, 'sine', .006, when, this.musicBus);
    }
  }

  // ---------------- efectos ----------------
  ui() { this.init(); this.tone(660, .06, 'sine', .045); this.tone(990, .05, 'sine', .025, .03); }
  uiBack() { this.tone(440, .08, 'sine', .04, 0, null, 330); }
  dialogue() { this.tone(520, .04, 'triangle', .02); }
  attack(combo = 0) {
    this.init();
    this.noise(.12, .055, 0, 2400 + combo * 400, 'bandpass', 1.4);
    this.tone(220 + combo * 40, .09, 'sawtooth', .018, 0, null, 110);
  }
  hit(crit = false) {
    this.noise(.09, crit ? .1 : .065, 0, crit ? 900 : 600, 'lowpass', .9);
    this.tone(crit ? 110 : 85, .12, 'sine', crit ? .1 : .06, 0, null, 45);
  }
  dodge() { this.noise(.18, .04, 0, 1200, 'highpass', .6); this.tone(400, .12, 'sine', .02, 0, null, 900); }
  block() { this.tone(240, .16, 'square', .04, 0, null, 140); this.noise(.1, .04, 0, 3000, 'bandpass', 2); }
  hurt() { this.tone(180, .18, 'sawtooth', .035, 0, null, 70); this.noise(.1, .04, 0, 500, 'lowpass'); }
  pickup() { this.tone(740, .1, 'sine', .04); this.tone(1100, .16, 'sine', .03, .08); }
  coin() { this.tone(1320, .06, 'triangle', .035); this.tone(1760, .12, 'triangle', .025, .05); }
  capture() {
    this.init();
    [523, 659, 784, 1046].forEach((f, i) => this.tone(f, .55, 'sine', .05, i * .1));
    this.tone(261, .9, 'triangle', .03, 0, null, 523);
  }
  levelUp() { [392, 523, 659, 784, 1046].forEach((f, i) => this.tone(f, .5, 'triangle', .05, i * .09)); }
  quest() { [440, 554, 659].forEach((f, i) => this.tone(f, .6, 'sine', .045, i * .12)); }
  heal() { this.tone(523, .3, 'sine', .04, 0, null, 1046); this.tone(784, .4, 'sine', .03, .1); }
  mana() { this.tone(330, .3, 'sine', .03, 0, null, 660); }
  error() { this.tone(180, .12, 'square', .03); this.tone(150, .16, 'square', .03, .1); }
  boss() { this.tone(55, 1.5, 'sawtooth', .07, 0, null, 40); this.noise(1.2, .03, 0, 300, 'lowpass'); }
  portal() { this.tone(220, 1.2, 'sine', .05, 0, null, 880); this.noise(1.2, .03, 0, 1200, 'bandpass', .5); }
  seal() { [523, 659, 784, 988].forEach((f, i) => this.tone(f, .8, 'sine', .04, i * .08)); }
  death() { this.tone(220, 1.2, 'sine', .05, 0, null, 55); }
  footstep() { this.noise(.04, .012, 0, 300, 'lowpass'); }
  skill() { this.tone(180, .5, 'sawtooth', .035, 0, null, 900); this.noise(.35, .05, 0, 1800, 'bandpass', .8); }
  creature() { this.tone(880, .2, 'sine', .03, 0, null, 1320); this.tone(660, .3, 'triangle', .025, .08); }
}

export const audio = new AudioEngine();
