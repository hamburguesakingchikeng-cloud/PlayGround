/* Audio procedural: música y efectos sin archivos externos (WebAudio) */
(function () {
  const EG = window.EG;
  const NOTE = (n) => 440 * Math.pow(2, (n - 69) / 12); // MIDI -> Hz
  const N = { C: 0, Cs: 1, D: 2, Ds: 3, E: 4, F: 5, Fs: 6, G: 7, Gs: 8, A: 9, As: 10, B: 11 };
  const midi = (name, oct) => 12 * (oct + 1) + N[name];

  const TRACKS = {
    title: {
      bpm: 76,
      lead: [midi('A', 4), midi('C', 5), midi('E', 5), midi('D', 5), midi('C', 5), midi('A', 4), midi('G', 4), midi('A', 4)],
      bass: [midi('A', 2), midi('F', 2), midi('C', 3), midi('G', 2)],
      wave: 'triangle',
      gain: 0.05,
      sparkle: true,
    },
    village: {
      bpm: 104,
      lead: [midi('C', 5), midi('E', 5), midi('G', 5), midi('E', 5), midi('F', 5), midi('A', 5), midi('G', 5), midi('E', 5)],
      bass: [midi('C', 3), midi('F', 3), midi('G', 3), midi('C', 3)],
      wave: 'triangle',
      gain: 0.045,
    },
    field: {
      bpm: 118,
      lead: [midi('D', 5), midi('F', 5), midi('A', 5), midi('G', 5), midi('F', 5), midi('D', 5), midi('C', 5), midi('D', 5)],
      bass: [midi('D', 3), midi('A', 2), midi('B', 2), midi('G', 2)],
      wave: 'square',
      gain: 0.032,
    },
    dark: {
      bpm: 92,
      lead: [midi('A', 4), midi('G', 4), midi('E', 4), midi('G', 4), midi('F', 4), midi('E', 4), midi('D', 4), midi('E', 4)],
      bass: [midi('A', 2), midi('F', 2), midi('D', 2), midi('E', 2)],
      wave: 'sawtooth',
      gain: 0.026,
    },
    battle: {
      bpm: 150,
      lead: [midi('E', 5), midi('E', 5), midi('G', 5), midi('A', 5), midi('E', 5), midi('D', 5), midi('C', 5), midi('B', 4)],
      bass: [midi('E', 3), midi('E', 3), midi('C', 3), midi('D', 3)],
      wave: 'square',
      gain: 0.03,
    },
    boss: {
      bpm: 164,
      lead: [midi('D', 5), midi('Ds', 5), midi('D', 5), midi('A', 4), midi('As', 4), midi('A', 4), midi('F', 4), midi('G', 4)],
      bass: [midi('D', 2), midi('D', 2), midi('As', 2), midi('A', 2)],
      wave: 'sawtooth',
      gain: 0.03,
    },
    ending: {
      bpm: 70,
      lead: [midi('C', 5), midi('G', 5), midi('A', 5), midi('E', 5), midi('F', 5), midi('C', 6), midi('G', 5), midi('C', 6)],
      bass: [midi('C', 3), midi('A', 2), midi('F', 2), midi('G', 2)],
      wave: 'triangle',
      gain: 0.05,
    },
  };

  const Audio = {
    ctx: null,
    master: null,
    musicGain: null,
    enabled: true,
    sfxEnabled: true,
    musicEnabled: true,
    trackName: null,
    timer: null,
    step: 0,
    nextTime: 0,
    noiseBuf: null,

    init() {
      if (this.ctx) {
        if (this.ctx.state === 'suspended') this.ctx.resume();
        return;
      }
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      this.ctx = new AC();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.9;
      this.master.connect(this.ctx.destination);
      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.value = this.enabled ? 1 : 0;
      this.musicGain.connect(this.master);

      const len = Math.floor(this.ctx.sampleRate * 0.4);
      const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
      this.noiseBuf = buf;
    },

    setEnabled(on) {
      this.enabled = on;
      this.setMusic(on);
      this.setSfx(on);
    },

    setMusic(on) {
      this.musicEnabled = on;
      if (this.musicGain && this.ctx) {
        this.musicGain.gain.setTargetAtTime(on ? 1 : 0, this.ctx.currentTime, 0.05);
      }
    },

    setSfx(on) {
      this.sfxEnabled = on;
    },

    tone(freq, dur, opts) {
      if (!this.ctx || !this.sfxEnabled) return;
      const o = opts || {};
      const t = this.ctx.currentTime + (o.delay || 0);
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = o.wave || 'square';
      osc.frequency.setValueAtTime(freq, t);
      if (o.slide) osc.frequency.exponentialRampToValueAtTime(Math.max(20, o.slide), t + dur);
      const vol = o.vol === undefined ? 0.12 : o.vol;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(vol, t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      osc.connect(g);
      g.connect(o.dest || this.master);
      osc.start(t);
      osc.stop(t + dur + 0.02);
    },

    noise(dur, opts) {
      if (!this.ctx || !this.sfxEnabled || !this.noiseBuf) return;
      const o = opts || {};
      const src = this.ctx.createBufferSource();
      src.buffer = this.noiseBuf;
      const g = this.ctx.createGain();
      const f = this.ctx.createBiquadFilter();
      f.type = o.filter || 'lowpass';
      f.frequency.value = o.freq || 1200;
      g.gain.value = o.vol === undefined ? 0.15 : o.vol;
      src.connect(f); f.connect(g); g.connect(this.master);
      src.start();
      src.stop(this.ctx.currentTime + dur);
    },

    sfx(name) {
      if (!this.ctx || !this.sfxEnabled) return;
      switch (name) {
        case 'cursor':
          this.tone(660, 0.05, { wave: 'square', vol: 0.05 });
          break;
        case 'step':
          this.noise(0.05, { vol: 0.03, freq: 420 });
          break;
        case 'select':
          this.tone(880, 0.07, { wave: 'square', vol: 0.07 });
          this.tone(1320, 0.09, { wave: 'square', vol: 0.05, delay: 0.05 });
          break;
        case 'cancel':
          this.tone(320, 0.1, { wave: 'square', vol: 0.06, slide: 190 });
          break;
        case 'hit':
          this.noise(0.16, { vol: 0.22, freq: 900 });
          this.tone(140, 0.12, { wave: 'square', vol: 0.12, slide: 70 });
          break;
        case 'crit':
          this.noise(0.2, { vol: 0.26, freq: 1600 });
          this.tone(880, 0.12, { wave: 'sawtooth', vol: 0.1, slide: 220 });
          break;
        case 'magic':
          this.tone(520, 0.28, { wave: 'triangle', vol: 0.08, slide: 1400 });
          this.tone(780, 0.24, { wave: 'sine', vol: 0.06, slide: 2100, delay: 0.05 });
          break;
        case 'heal':
          this.tone(660, 0.18, { wave: 'sine', vol: 0.09 });
          this.tone(990, 0.24, { wave: 'sine', vol: 0.07, delay: 0.08 });
          break;
        case 'level':
          [523, 659, 784, 1046].forEach((f, i) => this.tone(f, 0.18, { wave: 'square', vol: 0.07, delay: i * 0.09 }));
          break;
        case 'coin':
          this.tone(1046, 0.08, { wave: 'square', vol: 0.06 });
          this.tone(1568, 0.14, { wave: 'square', vol: 0.05, delay: 0.06 });
          break;
        case 'chest':
          this.tone(392, 0.1, { wave: 'triangle', vol: 0.08 });
          this.tone(587, 0.1, { wave: 'triangle', vol: 0.08, delay: 0.1 });
          this.tone(784, 0.22, { wave: 'triangle', vol: 0.08, delay: 0.2 });
          break;
        case 'save':
          this.tone(523, 0.12, { wave: 'sine', vol: 0.08 });
          this.tone(784, 0.22, { wave: 'sine', vol: 0.08, delay: 0.1 });
          break;
        case 'flee':
          this.tone(300, 0.2, { wave: 'square', vol: 0.06, slide: 800 });
          break;
        case 'gameover':
          [392, 330, 262, 196].forEach((f, i) => this.tone(f, 0.35, { wave: 'triangle', vol: 0.09, delay: i * 0.18 }));
          break;
        case 'victory':
          [523, 659, 784, 1046, 1318].forEach((f, i) => this.tone(f, 0.3, { wave: 'square', vol: 0.07, delay: i * 0.11 }));
          break;
        case 'portal':
          this.tone(200, 0.4, { wave: 'sine', vol: 0.09, slide: 1200 });
          break;
        default:
          break;
      }
    },

    music(name) {
      if (this.trackName === name) return;
      this.trackName = name;
      this.step = 0;
      this.stopTimer();
      if (!this.ctx || !TRACKS[name]) return;
      this.nextTime = this.ctx.currentTime + 0.08;
      this.timer = setInterval(() => this.schedule(), 60);
      this.schedule();
    },

    stopTimer() {
      if (this.timer) clearInterval(this.timer);
      this.timer = null;
    },

    schedule() {
      if (!this.ctx) return;
      if (this.ctx.state !== 'running') return;
      if (!this.musicEnabled) return;
      if (this.ctx.currentTime > this.nextTime + 1.2) this.nextTime = this.ctx.currentTime + 0.1;
      const track = TRACKS[this.trackName];
      if (!track) return;
      const beat = 60 / track.bpm;
      const lookahead = this.ctx.currentTime + 0.35;
      while (this.nextTime < lookahead) {
        const t = this.nextTime - this.ctx.currentTime;
        const lead = track.lead[this.step % track.lead.length];
        const bass = track.bass[Math.floor(this.step / 2) % track.bass.length];
        this.playNote(lead, beat * 0.9, t, track.wave, track.gain, true);
        if (this.step % 2 === 0) this.playNote(bass, beat * 1.7, t, 'triangle', track.gain * 1.25, false);
        if (track.sparkle && this.step % 4 === 2) this.playNote(lead + 12, beat * 1.4, t + beat * 0.5, 'sine', track.gain * 0.5, false);
        this.step++;
        this.nextTime += beat;
      }
    },

    playNote(freq, dur, delay, wave, vol, lead) {
      if (!this.ctx) return;
      const t = this.ctx.currentTime + delay;
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = wave;
      osc.frequency.value = freq;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(vol, t + 0.03);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      osc.connect(g);
      g.connect(lead ? this.musicGain : this.musicGain);
      osc.start(t);
      osc.stop(t + dur + 0.05);
    },

    stopMusic() {
      this.trackName = null;
      this.stopTimer();
    },
  };

  EG.Audio = Audio;
})();
