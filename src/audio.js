// ============================================================
// Audio procedural — música y efectos sintetizados en tiempo real
// ============================================================
const MIDI = (n) => 440 * Math.pow(2, (n - 69) / 12);

const SCALES = {
  major: [0, 2, 4, 5, 7, 9, 11],
  minor: [0, 2, 3, 5, 7, 8, 10],
  dorian: [0, 2, 3, 5, 7, 9, 10],
  pent: [0, 2, 4, 7, 9],
  lydian: [0, 2, 4, 6, 7, 9, 11],
};

const MUSIC = {
  title:   { bpm: 54, root: 50, scale: 'lydian',  wave: 'sine',     pad: 'triangle', steps: 32, bass: 4, arp: 2, sparse: true,  gain: .33 },
  village: { bpm: 76, root: 55, scale: 'major',   wave: 'triangle', pad: 'sine',     steps: 32, bass: 4, arp: 2, sparse: false, gain: .3 },
  forest:  { bpm: 62, root: 52, scale: 'dorian',  wave: 'sine',     pad: 'triangle', steps: 32, bass: 4, arp: 2, sparse: false, gain: .3 },
  ruins:   { bpm: 50, root: 45, scale: 'minor',   wave: 'triangle', pad: 'sawtooth', steps: 32, bass: 8, arp: 4, sparse: true,  gain: .27 },
  lake:    { bpm: 58, root: 57, scale: 'pent',    wave: 'sine',     pad: 'sine',     steps: 32, bass: 4, arp: 2, sparse: true,  gain: .3 },
  peak:    { bpm: 64, root: 48, scale: 'minor',   wave: 'triangle', pad: 'sawtooth', steps: 32, bass: 4, arp: 2, sparse: false, gain: .3 },
  battle:  { bpm: 126, root: 45, scale: 'minor',  wave: 'sawtooth', pad: 'square',   steps: 16, bass: 2, arp: 1, sparse: false, gain: .25 },
  boss:    { bpm: 142, root: 41, scale: 'minor',  wave: 'sawtooth', pad: 'sawtooth', steps: 16, bass: 1, arp: 1, sparse: false, gain: .3 },
  victory: { bpm: 100, root: 55, scale: 'major',  wave: 'triangle', pad: 'sine',     steps: 16, bass: 4, arp: 1, sparse: false, gain: .34 },
};

export class AudioEngine {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.musicGain = null;
    this.sfxGain = null;
    this.mode = null;
    this.step = 0;
    this.nextTime = 0;
    this.timer = null;
    this.settings = { master: .75, music: .5, sfx: .8 };
    this.noise = null;
    this.unlocked = false;
  }

  unlock() {
    if (!this.ctx) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      this.ctx = new Ctx();
      this.master = this.ctx.createGain();
      this.musicGain = this.ctx.createGain();
      this.sfxGain = this.ctx.createGain();
      this.musicGain.connect(this.master);
      this.sfxGain.connect(this.master);
      this.master.connect(this.ctx.destination);
      this.applyVolumes();
      this.makeNoise();
    }
    if (this.ctx.state === 'suspended') this.ctx.resume();
    this.unlocked = true;
  }

  applyVolumes() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    this.master.gain.setTargetAtTime(this.settings.master, t, .03);
    this.musicGain.gain.setTargetAtTime(this.settings.music * .7, t, .05);
    this.sfxGain.gain.setTargetAtTime(this.settings.sfx, t, .03);
  }

  setSettings(s) { Object.assign(this.settings, s); this.applyVolumes(); }

  makeNoise() {
    const len = this.ctx.sampleRate * 1.2;
    const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    this.noise = buf;
  }

  noiseHit(dur = .18, freq = 1000, q = .8, vol = .3, type = 'bandpass') {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const src = this.ctx.createBufferSource();
    src.buffer = this.noise;
    const filter = this.ctx.createBiquadFilter();
    filter.type = type; filter.frequency.value = freq; filter.Q.value = q;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(.0001, t + dur);
    src.connect(filter).connect(g).connect(this.sfxGain);
    src.start(t); src.stop(t + dur);
  }

  tone(freq, dur, type = 'sine', vol = .2, slide = 0, delay = 0, dest = null) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime + delay;
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, t);
    if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, freq + slide), t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + .012);
    g.gain.exponentialRampToValueAtTime(.0001, t + dur);
    o.connect(g).connect(dest || this.sfxGain);
    o.start(t); o.stop(t + dur + .02);
  }

  sfx(name, opt = {}) {
    if (!this.ctx || !this.unlocked) return;
    const r = (Math.random() - .5) * 8;
    switch (name) {
      case 'attack':
        this.noiseHit(.16, 1900 + r * 20, 1.2, .22);
        this.tone(240, .14, 'triangle', .1, -80);
        break;
      case 'heavy':
        this.noiseHit(.26, 900, .9, .32);
        this.tone(110, .28, 'sawtooth', .18, -40);
        break;
      case 'arrow':
        this.tone(880, .12, 'sine', .1, -450);
        this.noiseHit(.1, 3200, 2, .11);
        break;
      case 'hit':
        this.noiseHit(.13, 700 + r * 30, .7, .34);
        this.tone(150, .12, 'square', .12, -50);
        break;
      case 'crit':
        this.noiseHit(.18, 1400, 1.4, .38);
        this.tone(640, .2, 'square', .16, 260);
        break;
      case 'magic':
        this.tone(520, .38, 'sine', .16, 420);
        this.tone(780, .32, 'triangle', .1, 240, .03);
        this.noiseHit(.3, 2400, 1.8, .12);
        break;
      case 'fire':
        this.noiseHit(.4, 700, .55, .32, 'lowpass');
        this.tone(90, .35, 'sawtooth', .1, 40);
        break;
      case 'ice':
        this.tone(1180, .3, 'sine', .13, -300);
        this.tone(1760, .25, 'sine', .07, -540, .04);
        break;
      case 'lightning':
        this.noiseHit(.32, 3800, .6, .3, 'highpass');
        this.tone(120, .3, 'sawtooth', .13, -50);
        break;
      case 'heal':
        [523, 659, 784, 1046].forEach((f, i) => this.tone(f, .5, 'sine', .09, 0, i * .07));
        break;
      case 'dodge':
        this.noiseHit(.18, 1500, .6, .14);
        this.tone(300, .16, 'sine', .08, 280);
        break;
      case 'block':
        this.noiseHit(.14, 2500, 2.5, .24);
        this.tone(220, .15, 'square', .1, -30);
        break;
      case 'coin':
        this.tone(988, .1, 'triangle', .1, 0);
        this.tone(1319, .16, 'triangle', .1, 0, .07);
        break;
      case 'pickup':
        this.tone(620, .09, 'sine', .11);
        this.tone(880, .16, 'sine', .1, 0, .06);
        break;
      case 'chest':
        [392, 523, 659, 784].forEach((f, i) => this.tone(f, .3, 'triangle', .09, 0, i * .06));
        this.noiseHit(.25, 500, .5, .09);
        break;
      case 'level':
        [392, 523, 659, 784, 1046].forEach((f, i) => this.tone(f, .45, 'triangle', .1, 0, i * .08));
        break;
      case 'capture':
        this.tone(440, .5, 'sine', .12, 660);
        this.tone(660, .5, 'triangle', .09, 440, .1);
        this.noiseHit(.4, 2400, 2, .1);
        break;
      case 'success':
        [523, 659, 784, 1046].forEach((f, i) => this.tone(f, .5, 'triangle', .1, 0, i * .09));
        break;
      case 'error':
        this.tone(180, .2, 'square', .09, -60);
        this.tone(140, .25, 'square', .07, -40, .1);
        break;
      case 'menu':
        this.tone(740, .06, 'sine', .05);
        break;
      case 'confirm':
        this.tone(520, .08, 'triangle', .08);
        this.tone(780, .12, 'triangle', .07, 0, .05);
        break;
      case 'dialogue':
        this.tone(590, .04, 'triangle', .025);
        break;
      case 'portal':
        this.tone(260, .7, 'sine', .12, 900);
        this.noiseHit(.6, 1800, .7, .12);
        break;
      case 'boss':
        this.tone(70, 1.4, 'sawtooth', .2, -18);
        this.tone(105, 1.2, 'square', .08, -20, .1);
        this.noiseHit(1, 500, .4, .2, 'lowpass');
        break;
      case 'victory':
        [523, 659, 784, 1046, 1319].forEach((f, i) => this.tone(f, .8, 'triangle', .11, 0, i * .12));
        break;
      case 'death':
        [392, 349, 294, 220].forEach((f, i) => this.tone(f, .6, 'sine', .1, 0, i * .14));
        break;
      case 'quest':
        [659, 784, 1046].forEach((f, i) => this.tone(f, .42, 'sine', .08, 0, i * .1));
        break;
      case 'hurt':
        this.noiseHit(.16, 420, .6, .28);
        this.tone(120, .2, 'square', .12, -40);
        break;
      default:
        this.tone(520, .08, 'sine', .06);
    }
  }

  music(mode) {
    if (!this.ctx) return;
    if (this.mode === mode && this.timer) return;
    this.stopMusic();
    const conf = MUSIC[mode] || MUSIC.village;
    this.mode = mode;
    this.conf = conf;
    this.step = 0;
    this.nextTime = this.ctx.currentTime + .08;
    this.interval = 60 / conf.bpm / 2;
    this.tick();
    this.timer = setInterval(() => this.tick(), 120);
  }

  stopMusic() {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
    this.mode = null;
  }

  tick() {
    if (!this.ctx || !this.mode) return;
    const ahead = this.ctx.currentTime + .4;
    while (this.nextTime < ahead) {
      this.scheduleStep(this.step, this.nextTime);
      this.step++;
      this.nextTime += this.interval;
    }
  }

  scheduleStep(step, time) {
    const c = this.conf;
    const scale = SCALES[c.scale];
    const patternIdx = step % c.steps;
    const bar = Math.floor(step / 8) % 4;
    const progression = [0, 5, 3, 4];
    const deg = progression[bar];
    const root = c.root + deg;
    const note = (semis) => MIDI(root + semis);
    const dest = this.musicGain;

    const voice = (freq, dur, type, vol, slide = 0, pan = 0) => {
      const o = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      const p = this.ctx.createStereoPanner ? this.ctx.createStereoPanner() : null;
      o.type = type;
      o.frequency.setValueAtTime(freq, time);
      if (slide) o.frequency.linearRampToValueAtTime(Math.max(30, freq + slide), time + dur);
      g.gain.setValueAtTime(.0001, time);
      g.gain.linearRampToValueAtTime(vol, time + Math.min(.18, dur * .25));
      g.gain.exponentialRampToValueAtTime(.0001, time + dur);
      o.connect(g);
      if (p) { p.pan.value = pan; g.connect(p).connect(dest); } else g.connect(dest);
      o.start(time); o.stop(time + dur + .03);
    };

    // bajo
    if (patternIdx % (c.bass * 2) === 0) {
      voice(note(scale[0] - 12), this.interval * (c.bass * 1.4), 'sine', .1, 0, -.2);
    }
    // pad de acorde cada compás
    if (patternIdx % 8 === 0) {
      [0, scale[2], scale[4]].forEach((s, i) => voice(note(s), this.interval * 7, c.pad, .018, 0, (i - 1) * .3));
    }
    // arpegio
    if (!c.sparse || patternIdx % 2 === 0) {
      const idx = (patternIdx * 3 + bar) % scale.length;
      voice(note(scale[idx] + 12), this.interval * 1.7, c.wave, .05, 0, Math.sin(step * .7) * .25);
    }
    // campanas
    if (patternIdx % 8 === 4 && !c.sparse) {
      voice(note(scale[(bar + 2) % scale.length] + 24), this.interval * 2.8, 'sine', .022, 0, .1);
    }
    if (this.mode === 'battle' || this.mode === 'boss') {
      if (patternIdx % 2 === 0) {
        const n = this.ctx.createBufferSource(); n.buffer = this.noise;
        const f = this.ctx.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = 5000;
        const g = this.ctx.createGain(); g.gain.setValueAtTime(.022, time); g.gain.exponentialRampToValueAtTime(.0001, time + .05);
        n.connect(f).connect(g).connect(dest); n.start(time); n.stop(time + .06);
      }
    }
  }
}
