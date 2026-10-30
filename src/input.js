/**
 * Entrada unificada: teclado, mando Bluetooth/USB y controles táctiles.
 * Todas las acciones del juego pasan por el mismo mapa semántico.
 */

const KEY_MAP = {
  ArrowUp: 'up', KeyW: 'up',
  ArrowDown: 'down', KeyS: 'down',
  ArrowLeft: 'left', KeyA: 'left',
  ArrowRight: 'right', KeyD: 'right',
  KeyJ: 'attack', KeyZ: 'attack',
  KeyK: 'dodge', ShiftLeft: 'dodge', ShiftRight: 'dodge', KeyB: 'dodge',
  KeyX: 'skill', KeyC: 'skill',
  KeyE: 'interact', KeyY: 'interact', KeyV: 'interact',
  KeyQ: 'prevWeapon', KeyL: 'prevWeapon',
  KeyR: 'companion',
  Escape: 'pause', Enter: 'pause', KeyP: 'pause',
  Tab: 'journal',
  KeyF: 'potion',
  KeyM: 'map',
  Digit1: 'slot1', Digit2: 'slot2', Digit3: 'slot3', Digit4: 'slot4',
  KeyU: 'bestiary',
}

const GAMEPAD_MAP = {
  0: 'attack', 1: 'dodge', 2: 'skill', 3: 'interact',
  4: 'prevWeapon', 5: 'companion', 8: 'journal', 9: 'pause',
  12: 'up', 13: 'down', 14: 'left', 15: 'right',
}

export class Input {
  constructor() {
    this.keys = new Set()
    this.actions = new Set()
    this.just = new Set()
    this.touchMove = { x: 0, y: 0 }
    this.touchActive = false
    this.gamepadIndex = null
    this.prevPad = []
    this.enabled = true
    this.onGamepad = null
    this.lastInput = 'keyboard'
    this._bound = false
  }

  bind(root = window) {
    if (this._bound) return
    this._bound = true
    window.addEventListener('keydown', (event) => {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) return
      const action = KEY_MAP[event.code]
      if (!action) return
      if (['Tab', 'Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.code)) event.preventDefault()
      if (event.repeat) return
      this.lastInput = 'keyboard'
      this.actions.add(action)
      this.just.add(action)
      this.keys.add(event.code)
    }, { passive: false })
    window.addEventListener('keyup', (event) => {
      const action = KEY_MAP[event.code]
      this.keys.delete(event.code)
      if (!action) return
      const stillDown = Object.entries(KEY_MAP).some(([code, act]) => act === action && this.keys.has(code))
      if (!stillDown) this.actions.delete(action)
    })
    window.addEventListener('blur', () => this.clear())
    window.addEventListener('gamepadconnected', (event) => {
      this.gamepadIndex = event.gamepad.index
      this.lastInput = 'gamepad'
      this.onGamepad?.('connected', event.gamepad)
    })
    window.addEventListener('gamepaddisconnected', (event) => {
      if (this.gamepadIndex === event.gamepad.index) this.gamepadIndex = null
      this.onGamepad?.('disconnected', event.gamepad)
    })
  }

  setTouchMove(x, y) {
    this.touchMove.x = x
    this.touchMove.y = y
    this.touchActive = Math.hypot(x, y) > 0.08
    if (this.touchActive) this.lastInput = 'touch'
  }

  touchAction(action, down = true) {
    this.lastInput = 'touch'
    if (down) {
      if (!this.actions.has(action)) this.just.add(action)
      this.actions.add(action)
    } else {
      this.actions.delete(action)
    }
  }

  isDown(action) { return this.actions.has(action) }
  pressed(action) { return this.just.has(action) }
  consume(action) { return this.just.delete(action) }

  get move() {
    let x = 0
    let y = 0
    if (this.actions.has('left')) x -= 1
    if (this.actions.has('right')) x += 1
    if (this.actions.has('up')) y -= 1
    if (this.actions.has('down')) y += 1
    x += this.touchMove.x
    y += this.touchMove.y
    const length = Math.hypot(x, y)
    if (length > 1) { x /= length; y /= length }
    return { x, y, length: Math.min(1, length) }
  }

  pollGamepad() {
    if (!navigator.getGamepads) return null
    let pad = this.gamepadIndex !== null ? navigator.getGamepads()[this.gamepadIndex] : null
    if (!pad) {
      for (const candidate of navigator.getGamepads()) {
        if (candidate) { pad = candidate; this.gamepadIndex = candidate.index; break }
      }
    }
    if (!pad) return null
    const now = pad.buttons.map(b => b.pressed || b.value > 0.5)
    if (this.prevPad.length !== now.length) this.prevPad = now.map(() => false)
    for (const [index, action] of Object.entries(GAMEPAD_MAP)) {
      const pressed = now[index]
      const was = this.prevPad[index]
      if (pressed && !was) {
        this.actions.add(action)
        this.just.add(action)
        this.lastInput = 'gamepad'
      } else if (!pressed && was && !['up', 'down', 'left', 'right'].includes(action)) {
        const otherDown = Object.entries(GAMEPAD_MAP).some(([i, act]) => act === action && now[i])
        if (!otherDown) this.actions.delete(action)
      }
    }
    const lx = Math.abs(pad.axes[0]) > 0.22 ? pad.axes[0] : 0
    const ly = Math.abs(pad.axes[1]) > 0.22 ? pad.axes[1] : 0
    if (lx || ly) {
      this.lastInput = 'gamepad'
      const dpadX = (now[15] ? 1 : 0) - (now[14] ? 1 : 0)
      const dpadY = (now[13] ? 1 : 0) - (now[12] ? 1 : 0)
      if (!dpadX) {
        if (lx < -0.22) this.actions.add('left'); else this.actions.delete('left')
        if (lx > 0.22) this.actions.add('right'); else this.actions.delete('right')
      }
      if (!dpadY) {
        if (ly < -0.22) this.actions.add('up'); else this.actions.delete('up')
        if (ly > 0.22) this.actions.add('down'); else this.actions.delete('down')
      }
    } else {
      if (!this.keys.size) {
        for (const action of ['up', 'down', 'left', 'right']) {
          if (!Object.entries(GAMEPAD_MAP).some(([i, act]) => act === action && now[i])) this.actions.delete(action)
        }
      }
    }
    this.prevPad = now
    return pad
  }

  endFrame() {
    this.just.clear()
  }

  clear() {
    this.actions.clear()
    this.just.clear()
    this.keys.clear()
    this.touchMove.x = 0
    this.touchMove.y = 0
    this.touchActive = false
  }
}
