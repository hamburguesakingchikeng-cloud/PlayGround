// Música y sonido procedurales. Cero archivos externos, cero dependencias.
// Cada región tiene su propia paleta armónica; la intensidad se adapta al combate.
import { clamp } from '../utils/math.js'

const midi = n => 440 * Math.pow(2, (n - 69) / 12)

const TRACKS = {
  title: {
    bpm: 58, root: 50, scale: [0, 2, 3, 5, 7, 8, 10],
    chords: [[50, 53, 57], [46, 50, 53], [43, 46, 50], [45, 49, 52]], airy: true, percussion: 0
  },
  valdoria: {
    bpm: 74, root: 62, scale: [0, 2, 4, 5, 7, 9, 11],
    chords: [[62, 66, 69], [59, 62, 66], [55, 59, 62], [57, 61, 64]], airy: false, percussion: .4
  },
  drakmor: {
    bpm: 68, root: 50, scale: [0, 2, 3, 5, 7, 8, 10],
    chords: [[50, 53, 57], [46, 50, 53], [53, 57, 60], [45, 49, 52]], airy: false, percussion: .7
  },
  kansordore: {
    bpm: 62, root: 63, scale: [0, 2, 4, 6, 7, 9, 11],
    chords: [[63, 67, 70, 74], [59, 63, 66, 70], [56, 60, 63, 67], [58, 62, 65, 69]], airy: true, percussion: .25
  }
}

export class AudioEngine {
  constructor(settings = {}) {
    this.ctx = null
    this.started = false
    this.master = null
    this.musicGain = null
    this.sfxGain = null
    this.ambientGain = null
    this.reverb = null
    this.settings = { music: .55, sfx: .8, ...settings }
    this.scene = 'title'
    this.intensity = 'explore'
    this.track = TRACKS.title
    this.step = 0
    this.nextTime = 0
    this.timer = null
    this.ambientTimer = null
    this.footTimer = 0
    this.nodes = new Set()
  }

  init() {
    if (this.ctx) { if (this.ctx.state === 'suspended') this.ctx.resume(); return }
    const AC = window.AudioContext || window.webkitAudioContext
    if (!AC) return
    this.ctx = new AC()
    this.master = this.ctx.createGain()
    this.master.gain.value = .95
    const comp = this.ctx.createDynamicsCompressor()
    comp.threshold.value = -16; comp.knee.value = 18; comp.ratio.value = 6; comp.attack.value = .004; comp.release.value = .25
    this.master.connect(comp).connect(this.ctx.destination)
    this.musicGain = this.ctx.createGain(); this.musicGain.gain.value = this.settings.music * .35
    this.sfxGain = this.ctx.createGain(); this.sfxGain.gain.value = this.settings.sfx * .65
    this.ambientGain = this.ctx.createGain(); this.ambientGain.gain.value = .25
    this.musicGain.connect(this.master)
    this.sfxGain.connect(this.master)
    this.ambientGain.connect(this.master)
    this.reverb = this.ctx.createConvolver()
    this.reverb.buffer = this.makeImpulse(2.8, 2.2)
    const wet = this.ctx.createGain(); wet.gain.value = .35
    this.reverb.connect(wet).connect(this.musicGain)
    this.started = true
    this.startMusic()
    this.startAmbient()
    document.addEventListener('visibilitychange', () => {
      if (!this.ctx) return
      if (document.hidden) this.ctx.suspend(); else this.ctx.resume()
    })
  }

  makeImpulse(duration, decay) {
    const len = Math.floor(this.ctx.sampleRate * duration)
    const buf = this.ctx.createBuffer(2, len, this.ctx.sampleRate)
    for (let c = 0; c < 2; c++) {
      const data = buf.getChannelData(c)
      for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay)
    }
    return buf
  }

  setVolumes(music, sfx, muted = false) {
    this.settings.music = music; this.settings.sfx = sfx; this.settings.muted = muted
    if (!this.ctx) return
    const t = this.ctx.currentTime
    this.musicGain.gain.setTargetAtTime(muted ? 0 : music * .35, t, .2)
    this.sfxGain.gain.setTargetAtTime(muted ? 0 : sfx * .65, t, .1)
    this.ambientGain.gain.setTargetAtTime(muted ? 0 : .25, t, .2)
  }

  setScene(scene) {
    if (!TRACKS[scene] || scene === this.scene) return
    this.scene = scene
    this.track = TRACKS[scene]
    this.step = 0
  }

  setIntensity(mode) {
    if (this.intensity === mode) return
    this.intensity = mode
  }

  startMusic() {
    if (this.timer) return
    this.nextTime = this.ctx.currentTime + .15
    this.timer = setInterval(() => this.schedule(), 90)
  }

  schedule() {
    if (!this.ctx || this.ctx.state !== 'running') return
    const beat = 60 / this.track.bpm
    const stepDur = beat / 4
    while (this.nextTime < this.ctx.currentTime + .5) {
      this.playStep(this.step, this.nextTime, stepDur, beat)
      this.step = (this.step + 1) % 64
      this.nextTime += stepDur
    }
  }

  playStep(step, time, stepDur, beat) {
    const bar = Math.floor(step / 16)
    const chord = this.track.chords[bar % this.track.chords.length]
    const combat = this.intensity !== 'explore'
    const boss = this.intensity === 'boss'
    const vel = this.settings.muted ? 0 : 1
    // Pad armónico al inicio de cada compás
    if (step % 16 === 0) {
      chord.forEach((n, i) => this.pad(midi(n - 12), time, beat * 3.8, .028 * vel, i))
      this.bass(midi(chord[0] - 24), time, beat * 3.4, combat ? .06 : .042)
      if (this.track.airy) this.bell(midi(chord[2] + 12), time + .05, 2.2, .022)
    }
    // Arpegio de arpa
    const pattern = [0, 1, 2, 1, 2, 3, 1, 0]
    if (step % 2 === 0) {
      const idx = pattern[(step / 2) % pattern.length]
      const n = chord[idx % chord.length] + (idx >= chord.length ? 12 : 0)
      this.pluck(midi(n + (this.track.airy ? 12 : 0)), time, stepDur * 1.7, .038 + (combat ? .012 : 0))
    }
    // Melodía lejana cada dos compases
    if (step === 24 || step === 40 || step === 56) {
      const n = this.track.root + this.track.scale[(step / 8) % this.track.scale.length] + 12
      this.bell(midi(n), time, 2.4, this.track.airy ? .04 : .028)
    }
    // Percusión adaptativa
    if (this.track.percussion > 0) {
      if (step % 8 === 0) this.kick(time, (combat ? .09 : .045) * this.track.percussion * vel)
      if (combat && step % 4 === 2) this.taiko(time, .035 * vel)
      if (boss && step % 2 === 0) this.taiko(time, .022 * vel)
      if (step % 8 === 4) this.shaker(time, .012 * vel)
    }
    if (combat && step % 16 === 8) {
      this.bell(midi(chord[0] + 24), time, 1.3, .024)
    }
  }

  pad(freq, time, dur, vol, idx) {
    const ctx = this.ctx
    const g = ctx.createGain()
    g.gain.setValueAtTime(0, time)
    g.gain.linearRampToValueAtTime(vol, time + 1.1)
    g.gain.setTargetAtTime(vol * .75, time + 1.2, 1.4)
    g.gain.setTargetAtTime(0, time + dur - .4, .5)
    const filter = ctx.createBiquadFilter(); filter.type = 'lowpass'; filter.frequency.value = 900 + idx * 180
    const o1 = ctx.createOscillator(); o1.type = 'triangle'; o1.frequency.value = freq
    const o2 = ctx.createOscillator(); o2.type = 'sine'; o2.frequency.value = freq * 1.005; o2.detune.value = 4
    o1.connect(filter); o2.connect(filter); filter.connect(g).connect(this.musicGain)
    o1.start(time); o2.start(time); o1.stop(time + dur + .6); o2.stop(time + dur + .6)
  }

  pluck(freq, time, dur, vol) {
    const ctx = this.ctx
    const g = ctx.createGain()
    g.gain.setValueAtTime(vol, time)
    g.gain.exponentialRampToValueAtTime(.0001, time + dur)
    const o = ctx.createOscillator(); o.type = 'triangle'; o.frequency.value = freq
    const o2 = ctx.createOscillator(); o2.type = 'sine'; o2.frequency.value = freq * 2; o2.detune.value = 8
    const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.setValueAtTime(4200, time); f.frequency.exponentialRampToValueAtTime(700, time + dur)
    o.connect(f); o2.connect(f); f.connect(g).connect(this.musicGain)
    o.start(time); o2.start(time); o.stop(time + dur); o2.stop(time + dur)
  }

  bell(freq, time, dur, vol) {
    const ctx = this.ctx
    const g = ctx.createGain(); g.gain.setValueAtTime(0, time); g.gain.linearRampToValueAtTime(vol, time + .01); g.gain.exponentialRampToValueAtTime(.0001, time + dur)
    ;[1, 2.01, 3.04].forEach((m, i) => {
      const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.value = freq * m
      const gg = ctx.createGain(); gg.gain.value = 1 / (i + 1) * .55
      o.connect(gg).connect(g); o.start(time); o.stop(time + dur)
    })
    g.connect(this.musicGain)
    if (this.reverb) g.connect(this.reverb)
  }

  bass(freq, time, dur, vol) {
    const ctx = this.ctx
    const g = ctx.createGain(); g.gain.setValueAtTime(0, time); g.gain.linearRampToValueAtTime(vol, time + .08); g.gain.setTargetAtTime(vol * .55, time + .2, .8); g.gain.setTargetAtTime(0, time + dur, .3)
    const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.value = freq
    const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 220
    o.connect(f).connect(g).connect(this.musicGain); o.start(time); o.stop(time + dur + .4)
  }

  kick(time, vol) {
    const ctx = this.ctx
    const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.setValueAtTime(120, time); o.frequency.exponentialRampToValueAtTime(38, time + .12)
    const g = ctx.createGain(); g.gain.setValueAtTime(vol, time); g.gain.exponentialRampToValueAtTime(.0001, time + .3)
    o.connect(g).connect(this.musicGain); o.start(time); o.stop(time + .32)
  }

  taiko(time, vol) {
    const ctx = this.ctx
    const len = .18
    const buf = ctx.createBuffer(1, ctx.sampleRate * len, ctx.sampleRate)
    const d = buf.getChannelData(0)
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 3)
    const src = ctx.createBufferSource(); src.buffer = buf
    const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 180
    const g = ctx.createGain(); g.gain.value = vol
    src.connect(f).connect(g).connect(this.musicGain); src.start(time)
  }

  shaker(time, vol) {
    const ctx = this.ctx
    const buf = ctx.createBuffer(1, ctx.sampleRate * .06, ctx.sampleRate)
    const d = buf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1
    const src = ctx.createBufferSource(); src.buffer = buf
    const f = ctx.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = 6000
    const g = ctx.createGain(); g.gain.value = vol
    src.connect(f).connect(g).connect(this.musicGain); src.start(time)
  }

  startAmbient() {
    if (this.ambientTimer) return
    this.ambientTimer = setInterval(() => {
      if (!this.ctx || this.ctx.state !== 'running' || this.settings.muted) return
      if (this.scene === 'valdoria' && Math.random() < .55) this.bird()
      if (this.scene === 'drakmor' && Math.random() < .4) this.ember()
      if (this.scene === 'kansordore' && Math.random() < .35) this.chime()
    }, 3800)
  }

  bird() {
    const ctx = this.ctx, t = ctx.currentTime
    const g = ctx.createGain(); g.gain.value = .022
    const o = ctx.createOscillator(); o.type = 'sine'
    const f0 = 1800 + Math.random() * 1000
    o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f0 * 1.4, t + .08); o.frequency.exponentialRampToValueAtTime(f0 * .9, t + .16)
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.022, t + .02); g.gain.exponentialRampToValueAtTime(.0001, t + .18)
    o.connect(g).connect(this.ambientGain); o.start(t); o.stop(t + .2)
  }

  ember() {
    const ctx = this.ctx, t = ctx.currentTime
    const len = .5, buf = ctx.createBuffer(1, ctx.sampleRate * len, ctx.sampleRate)
    const d = buf.getChannelData(0)
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length) * .5
    const src = ctx.createBufferSource(); src.buffer = buf
    const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 600 + Math.random() * 900; f.Q.value = 1.4
    const g = ctx.createGain(); g.gain.value = .028
    src.connect(f).connect(g).connect(this.ambientGain); src.start(t)
  }

  chime() {
    this.bell(1400 + Math.random() * 900, this.ctx.currentTime, 2.5, .012)
  }

  sfx(name, opts = {}) {
    if (!this.ctx || !this.started || this.settings.muted) return
    const t = this.ctx.currentTime + .005
    switch (name) {
      case 'ui': this.tone(620, .05, 'sine', .04, t, 1.3); break
      case 'hover': this.tone(880, .03, 'sine', .018, t, 1.02); break
      case 'swing': this.noiseSweep(2400, 400, .18, .1, t, 'bandpass', 2); break
      case 'heavy': this.noiseSweep(1200, 200, .32, .16, t, 'lowpass'); this.tone(90, .2, 'sine', .12, t); break
      case 'hit': this.tone(130, .14, 'triangle', .12, t, .6); this.noiseSweep(1800, 300, .12, .1, t, 'bandpass'); break
      case 'crit': this.tone(1500, .18, 'sine', .08, t, 1.4); this.tone(2200, .12, 'triangle', .05, t, 1.2); this.noiseSweep(3000, 500, .15, .09, t); break
      case 'block': this.tone(1800, .22, 'square', .035, t, .7); this.noiseSweep(4200, 900, .22, .07, t, 'highpass'); break
      case 'parry': this.tone(2400, .35, 'sine', .09, t, 1.1); this.noiseSweep(5000, 1200, .2, .09, t, 'highpass'); break
      case 'dodge': this.noiseSweep(700, 2400, .22, .07, t, 'bandpass', 1.2); break
      case 'magic': this.tone(420, .5, 'sine', .06, t, 2.4); this.tone(630, .5, 'triangle', .04, t, 2.8); this.noiseSweep(1200, 5000, .4, .04, t, 'bandpass'); break
      case 'heal': [523, 659, 784, 1047].forEach((f, i) => this.tone(f, .35, 'sine', .035, t + i * .06, 1.01)); break
      case 'capture': [784, 988, 1175, 1568].forEach((f, i) => this.tone(f, .7, 'sine', .045, t + i * .09, 1.02)); break
      case 'captureFail': this.tone(330, .35, 'triangle', .05, t, .7); this.tone(247, .45, 'triangle', .05, t + .16, .7); break
      case 'levelup': [523, 659, 784, 1047, 1319].forEach((f, i) => this.tone(f, .65, 'triangle', .045, t + i * .1, 1.01)); break
      case 'quest': [392, 523, 659].forEach((f, i) => this.tone(f, .9, 'sine', .05, t + i * .14, 1.01)); break
      case 'potion': this.tone(500, .15, 'sine', .05, t, .7); this.tone(760, .2, 'sine', .04, t + .1, 1.1); break
      case 'portal': this.noiseSweep(300, 4500, 1.1, .08, t, 'bandpass'); [262, 392, 523].forEach((f, i) => this.tone(f, 1.2, 'sine', .03, t + i * .12, 1.2)); break
      case 'boss': this.tone(58, 1.4, 'sawtooth', .12, t, 1.4); this.tone(87, 1.2, 'sawtooth', .06, t, 1.2); this.noiseSweep(400, 80, 1.2, .12, t, 'lowpass'); break
      case 'death': [196, 147, 98, 65].forEach((f, i) => this.tone(f, 1.4, 'sine', .07, t + i * .25, .8)); break
      case 'footstep': this.noiseSweep(300, 120, .07, .022 + (opts.soft ? 0 : .008), t, 'lowpass'); break
      case 'error': this.tone(180, .2, 'square', .03, t, .7); break
      case 'discover': [659, 988, 1319].forEach((f, i) => this.tone(f, 1.4, 'sine', .03, t + i * .08, 1.01)); break
      case 'upgrade': [392, 523, 659, 784, 1047].forEach((f, i) => this.tone(f, .5, 'triangle', .04, t + i * .07, 1.02)); break
      default: break
    }
  }

  tone(freq, dur, type, vol, time, ratio = 1) {
    const ctx = this.ctx
    const o = ctx.createOscillator(); o.type = type; o.frequency.setValueAtTime(freq, time)
    if (ratio !== 1) o.frequency.exponentialRampToValueAtTime(freq * ratio, time + dur)
    const g = ctx.createGain(); g.gain.setValueAtTime(0, time); g.gain.linearRampToValueAtTime(vol, time + Math.min(.02, dur * .2)); g.gain.exponentialRampToValueAtTime(.0001, time + dur)
    o.connect(g).connect(this.sfxGain); o.start(time); o.stop(time + dur + .02)
  }

  noiseSweep(f0, f1, dur, vol, time, filterType = 'bandpass', q = 1) {
    const ctx = this.ctx
    const len = Math.max(.03, dur)
    const buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * len), ctx.sampleRate)
    const d = buf.getChannelData(0)
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1
    const src = ctx.createBufferSource(); src.buffer = buf
    const f = ctx.createBiquadFilter(); f.type = filterType; f.Q.value = q
    f.frequency.setValueAtTime(Math.max(40, f0), time); f.frequency.exponentialRampToValueAtTime(Math.max(40, f1), time + dur)
    const g = ctx.createGain(); g.gain.setValueAtTime(vol, time); g.gain.exponentialRampToValueAtTime(.0001, time + dur)
    src.connect(f).connect(g).connect(this.sfxGain); src.start(time)
  }
}
