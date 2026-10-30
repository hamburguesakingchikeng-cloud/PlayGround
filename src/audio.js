/**
 * Motor de audio 100% procedural. No usa pistas externas.
 * La música y los efectos se sintetizan con WebAudio en el navegador.
 */

const midi = (n) => 440 * Math.pow(2, (n - 69) / 12)
const clamp = (v, a, b) => Math.max(a, Math.min(b, v))

export class AudioEngine {
  constructor() {
    this.ctx = null
    this.master = null
    this.musicBus = null
    this.sfxBus = null
    this.reverb = null
    this.musicVolume = 0.38
    this.sfxVolume = 0.55
    this.muted = false
    this.mode = 'title'
    this.nextStep = 0
    this.nextTime = 0
    this.bpm = 76
    this.running = false
    this.lastFootstep = 0
    this.combat = 0
    this._step = 0
  }

  init() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') this.ctx.resume().catch(() => {})
      return
    }
    const AC = window.AudioContext || window.webkitAudioContext
    if (!AC) return
    this.ctx = new AC()
    this.master = this.ctx.createGain()
    this.master.gain.value = this.muted ? 0 : 1
    this.master.connect(this.ctx.destination)

    this.musicBus = this.ctx.createGain()
    this.musicBus.gain.value = this.musicVolume
    this.musicBus.connect(this.master)

    this.sfxBus = this.ctx.createGain()
    this.sfxBus.gain.value = this.sfxVolume
    this.sfxBus.connect(this.master)

    // Reverb corto generado a partir de ruido con caída exponencial.
    const len = Math.floor(this.ctx.sampleRate * 2.8)
    const buffer = this.ctx.createBuffer(2, len, this.ctx.sampleRate)
    for (let ch = 0; ch < 2; ch++) {
      const data = buffer.getChannelData(ch)
      for (let i = 0; i < len; i++) {
        const t = i / len
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - t, 3.2) * (ch ? 0.88 : 1)
      }
    }
    this.reverb = this.ctx.createConvolver()
    this.reverb.buffer = buffer
    const wet = this.ctx.createGain()
    wet.gain.value = 0.22
    this.reverb.connect(wet)
    wet.connect(this.master)

    this.running = true
    this.nextTime = this.ctx.currentTime + 0.15
    this.setMode('title')
  }

  applyVolumes() {
    if (!this.ctx) return
    this.master.gain.setTargetAtTime(this.muted ? 0 : 1, this.ctx.currentTime, 0.08)
    this.musicBus.gain.setTargetAtTime(this.musicVolume * 0.58, this.ctx.currentTime, 0.12)
    this.sfxBus.gain.setTargetAtTime(this.sfxVolume, this.ctx.currentTime, 0.08)
  }

  setVolumes(music, sfx, muted) {
    this.musicVolume = clamp(music, 0, 1)
    this.sfxVolume = clamp(sfx, 0, 1)
    this.muted = Boolean(muted)
    this.applyVolumes()
  }

  setMode(mode) {
    if (this.mode === mode) return
    this.mode = mode
    const bpmTable = { title: 62, village: 74, forest: 82, ruins: 88, combat: 112, boss: 132, victory: 68 }
    this.bpm = bpmTable[mode] || 80
    this._step = 0
    if (this.ctx) this.nextTime = this.ctx.currentTime + 0.08
  }

  setCombat(value) {
    this.combat = clamp(value, 0, 1)
  }

  update() {
    if (!this.ctx || !this.running || this.muted) return
    const ahead = this.ctx.currentTime + 0.22
    let guard = 0
    while (this.nextTime < ahead && guard++ < 8) {
      this.scheduleStep(this._step, this.nextTime)
      const stepDur = 60 / this.bpm / 2
      this._step = (this._step + 1) % 32
      this.nextTime += stepDur
    }
  }

  scheduleStep(step, time) {
    const mode = this.mode
    if (mode === 'title') {
      if (step === 0) this.pad([50, 57, 61, 64], time, 7.4, 0.16)
      if (step === 16) this.pad([46, 53, 57, 62], time, 7.2, 0.14)
      if (step % 4 === 0) this.pluck([74, 69, 77, 72, 76, 69, 74, 65][(step / 4) | 0] + 12, time, 0.05, 0.9, 'sine')
      if (step % 8 === 0) this.softNoise(time, 0.2, 800, 0.015)
      return
    }
    if (mode === 'village') {
      if (step === 0) this.pad([53, 57, 60, 64, 67], time, 7.6, 0.14)
      if (step === 16) this.pad([50, 57, 60, 65, 69], time, 7.4, 0.12)
      if (step % 4 === 0) this.pluck([65, 69, 72, 76, 72, 69, 67, 69][step / 4], time, 0.04, 1.2, 'triangle')
      if (step === 8 || step === 24) this.pluck(77, time, 0.035, 1.5, 'sine')
      return
    }
    if (mode === 'forest') {
      if (step === 0) this.pad([50, 55, 57, 62], time, 7.8, 0.14)
      if (step === 16) this.pad([48, 55, 60, 64], time, 7.6, 0.11)
      if (step % 8 === 0) this.pluck([62, 67, 69, 74][step / 8], time, 0.035, 1.8, 'sine')
      if (step === 6 || step === 22) this.chime([81, 84][step === 6 ? 0 : 1], time, 0.025)
      return
    }
    if (mode === 'ruins') {
      if (step === 0) this.pad([45, 52, 56, 59], time, 7.6, 0.12)
      if (step === 16) this.pad([43, 50, 55, 58], time, 7.6, 0.1)
      if (step % 4 === 0) this.pluck([69, 74, 72, 67, 69, 76, 72, 67][step / 4], time, 0.025, 1.6, 'triangle')
      if (step === 12 || step === 28) this.chime(88, time, 0.018)
      return
    }
    if (mode === 'victory') {
      if (step === 0) this.pad([60, 64, 67, 71, 74], time, 7.8, 0.18)
      if (step === 16) this.pad([57, 60, 64, 67, 72], time, 7.6, 0.14)
      if (step % 4 === 0) this.pluck([72, 76, 79, 83, 79, 76, 74, 76][step / 4], time, 0.045, 1.1, 'sine')
      return
    }

    // Combate y jefe
    const boss = mode === 'boss'
    const prog = boss
      ? [[45, 48, 52, 57], [44, 48, 51, 56], [43, 46, 50, 55], [44, 47, 50, 56]]
      : [[50, 53, 57, 60], [46, 50, 53, 58], [48, 52, 55, 60], [45, 49, 52, 57]]
    const chord = prog[(step >> 3) % 4]
    if (step % 8 === 0) this.pad(chord, time, 2.5, boss ? 0.11 : 0.07)
    if (step % 4 === 0) this.bass(chord[0] - 12, time, boss ? 0.18 : 0.12, 0.34)
    if (step % 2 === 0) this.tick(time, boss ? 0.06 : 0.035, step % 8 === 0)
    if (step % 4 === 2) this.pluck(chord[2] + 12, time, boss ? 0.04 : 0.028, 0.4, 'triangle')
    if (boss && step % 8 === 4) this.brass(chord[1] - 12, time, 0.09)
  }

  pad(notes, time, dur, vol) {
    if (!this.ctx) return
    const filter = this.ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.setValueAtTime(1100, time)
    filter.frequency.linearRampToValueAtTime(620, time + dur)
    filter.Q.value = 0.5
    const g = this.ctx.createGain()
    g.gain.setValueAtTime(0.0001, time)
    g.gain.exponentialRampToValueAtTime(vol, time + 0.6)
    g.gain.setValueAtTime(vol, time + dur * 0.55)
    g.gain.exponentialRampToValueAtTime(0.0001, time + dur)
    filter.connect(g)
    g.connect(this.musicBus)
    g.connect(this.reverb)
    for (const n of notes) {
      for (const det of [-5, 4]) {
        const o = this.ctx.createOscillator()
        o.type = 'sine'
        o.frequency.value = midi(n) * Math.pow(2, det / 1200)
        o.detune.value = det
        o.connect(filter)
        o.start(time)
        o.stop(time + dur + 0.1)
      }
    }
  }

  pluck(note, time, vol, dur = 0.7, type = 'triangle') {
    if (!this.ctx) return
    const o = this.ctx.createOscillator()
    const g = this.ctx.createGain()
    const f = this.ctx.createBiquadFilter()
    o.type = type
    o.frequency.value = midi(note)
    f.type = 'lowpass'
    f.frequency.value = 3600
    g.gain.setValueAtTime(0.0001, time)
    g.gain.exponentialRampToValueAtTime(vol, time + 0.012)
    g.gain.exponentialRampToValueAtTime(0.0001, time + dur)
    o.connect(f)
    f.connect(g)
    g.connect(this.musicBus)
    g.connect(this.reverb)
    o.start(time)
    o.stop(time + dur + 0.02)
  }

  chime(note, time, vol) {
    this.pluck(note, time, vol, 2.2, 'sine')
    this.pluck(note * 1.5, time + 0.04, vol * 0.35, 1.4, 'sine')
  }

  bass(note, time, vol, dur) {
    if (!this.ctx) return
    const o = this.ctx.createOscillator()
    const g = this.ctx.createGain()
    o.type = 'triangle'
    o.frequency.value = midi(note)
    g.gain.setValueAtTime(0.0001, time)
    g.gain.exponentialRampToValueAtTime(vol, time + 0.02)
    g.gain.exponentialRampToValueAtTime(0.0001, time + dur)
    o.connect(g)
    g.connect(this.musicBus)
    o.start(time)
    o.stop(time + dur + 0.03)
  }

  brass(note, time, vol) {
    if (!this.ctx) return
    const o = this.ctx.createOscillator()
    const g = this.ctx.createGain()
    const f = this.ctx.createBiquadFilter()
    o.type = 'sawtooth'
    o.frequency.value = midi(note)
    f.type = 'lowpass'
    f.frequency.setValueAtTime(200, time)
    f.frequency.exponentialRampToValueAtTime(1400, time + 0.15)
    f.frequency.exponentialRampToValueAtTime(210, time + 0.8)
    g.gain.setValueAtTime(0.0001, time)
    g.gain.exponentialRampToValueAtTime(vol, time + 0.03)
    g.gain.exponentialRampToValueAtTime(0.0001, time + 0.85)
    o.connect(f)
    f.connect(g)
    g.connect(this.musicBus)
    g.connect(this.reverb)
    o.start(time)
    o.stop(time + 0.9)
  }

  tick(time, vol, accent) {
    if (!this.ctx) return
    const buffer = this.ctx.createBuffer(1, 512, this.ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < 512; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / 512, 6)
    const src = this.ctx.createBufferSource()
    src.buffer = buffer
    const f = this.ctx.createBiquadFilter()
    f.type = 'highpass'
    f.frequency.value = accent ? 900 : 1800
    const g = this.ctx.createGain()
    g.gain.value = vol
    src.connect(f)
    f.connect(g)
    g.connect(this.sfxBus)
    src.start(time)
  }

  softNoise(time, dur, freq, vol) {
    if (!this.ctx) return
    const buffer = this.ctx.createBuffer(1, Math.floor(this.ctx.sampleRate * dur), this.ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * 0.5
    const src = this.ctx.createBufferSource()
    src.buffer = buffer
    const f = this.ctx.createBiquadFilter()
    f.type = 'bandpass'
    f.frequency.value = freq
    f.Q.value = 0.8
    const g = this.ctx.createGain()
    g.gain.setValueAtTime(0.0001, time)
    g.gain.exponentialRampToValueAtTime(vol, time + 0.3)
    g.gain.exponentialRampToValueAtTime(0.0001, time + dur)
    src.connect(f)
    f.connect(g)
    g.connect(this.reverb)
    src.start(time)
  }

  // ---- Efectos de sonido ----
  noise(dur = 0.18, freq = 1200, vol = 0.15, type = 'bandpass', q = 0.9) {
    if (!this.ctx || this.muted) return
    const t = this.ctx.currentTime
    const len = Math.max(32, Math.floor(this.ctx.sampleRate * dur))
    const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate)
    const data = buf.getChannelData(0)
    for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 1.5)
    const src = this.ctx.createBufferSource()
    src.buffer = buf
    const f = this.ctx.createBiquadFilter()
    f.type = type
    f.frequency.setValueAtTime(freq, t)
    f.frequency.exponentialRampToValueAtTime(Math.max(120, freq * 0.25), t + dur)
    f.Q.value = q
    const g = this.ctx.createGain()
    g.gain.value = vol
    src.connect(f)
    f.connect(g)
    g.connect(this.sfxBus)
    src.start(t)
  }

  tone(freq, dur = 0.18, type = 'sine', vol = 0.12, slide = 1) {
    if (!this.ctx || this.muted) return
    const t = this.ctx.currentTime
    const o = this.ctx.createOscillator()
    const g = this.ctx.createGain()
    o.type = type
    o.frequency.setValueAtTime(freq, t)
    o.frequency.exponentialRampToValueAtTime(Math.max(30, freq * slide), t + dur)
    g.gain.setValueAtTime(0.0001, t)
    g.gain.exponentialRampToValueAtTime(vol, t + 0.008)
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
    o.connect(g)
    g.connect(this.sfxBus)
    g.connect(this.reverb)
    o.start(t)
    o.stop(t + dur + 0.02)
  }

  play(name) {
    if (!this.ctx || this.muted) return
    switch (name) {
      case 'swing': this.noise(0.16, 1800, 0.16, 'bandpass'); this.tone(220, 0.09, 'sawtooth', 0.035, 0.7); break
      case 'heavySwing': this.noise(0.28, 900, 0.2, 'lowpass'); this.tone(150, 0.2, 'sawtooth', 0.05, 0.5); break
      case 'hit': this.tone(120, 0.11, 'square', 0.07, 0.5); this.noise(0.08, 640, 0.18, 'lowpass'); break
      case 'critical': this.tone(880, 0.16, 'triangle', 0.11, 1.5); this.tone(1320, 0.22, 'sine', 0.08, 1.2); this.noise(0.12, 2400, 0.12, 'highpass'); break
      case 'hurt': this.tone(170, 0.22, 'sawtooth', 0.09, 0.55); this.noise(0.12, 500, 0.1); break
      case 'dodge': this.noise(0.28, 900, 0.1, 'bandpass', 0.5); this.tone(420, 0.16, 'sine', 0.05, 0.6); break
      case 'block': this.tone(350, 0.1, 'square', 0.07, 1.4); this.noise(0.1, 1600, 0.1, 'highpass'); break
      case 'magic': this.tone(523, 0.35, 'sine', 0.1, 2.2); this.tone(784, 0.45, 'sine', 0.06, 1.8); this.noise(0.33, 3200, 0.06, 'highpass'); break
      case 'heal': [523, 659, 784].forEach((n, i) => setTimeout(() => this.tone(n, 0.4, 'sine', 0.07, 1.25), i * 80)); break
      case 'pickup': [660, 880, 1180].forEach((n, i) => setTimeout(() => this.tone(n, 0.14, 'triangle', 0.06, 1.1), i * 45)); break
      case 'coin': this.tone(1180, 0.08, 'square', 0.045, 1); setTimeout(() => this.tone(1560, 0.1, 'square', 0.035, 1), 50); break
      case 'level': [392, 523, 659, 784, 1046].forEach((n, i) => setTimeout(() => this.tone(n, 0.55, 'sine', 0.07, 1.05), i * 95)); break
      case 'interact': this.tone(720, 0.09, 'sine', 0.05, 1.2); break
      case 'ui': this.tone(520, 0.055, 'sine', 0.035, 1.1); break
      case 'quest': [523, 659, 784, 1046].forEach((n, i) => setTimeout(() => this.tone(n, 0.5, 'sine', 0.065, 1), i * 110)); break
      case 'seal': this.tone(740, 0.5, 'sine', 0.08, 0.5); this.tone(554, 0.7, 'triangle', 0.05, 1.8); break
      case 'roar': this.tone(70, 0.9, 'sawtooth', 0.15, 0.5); this.noise(0.9, 250, 0.2, 'lowpass'); this.tone(110, 0.7, 'square', 0.06, 0.35); break
      case 'death': this.tone(220, 0.7, 'sine', 0.08, 0.3); this.noise(0.6, 400, 0.12, 'lowpass'); break
      case 'bossDown': [110, 138, 165, 220, 330].forEach((n, i) => setTimeout(() => this.tone(n, 1.1, 'sawtooth', 0.05, 0.6), i * 150)); break
      case 'footstep': this.noise(0.035, 380, 0.018, 'lowpass'); break
      case 'swordUnsheathe': this.noise(0.4, 2400, 0.1, 'highpass'); this.tone(1318, 0.5, 'sine', 0.06, 1); break
      default: this.tone(600, 0.08, 'sine', 0.04)
    }
  }

  footstep() {
    if (!this.ctx) return
    const now = this.ctx.currentTime
    if (now - this.lastFootstep < 0.23) return
    this.lastFootstep = now
    this.play('footstep')
  }
}
