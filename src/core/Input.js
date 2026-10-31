const KEYMAP = {
  KeyW: 'up', ArrowUp: 'up', KeyS: 'down', ArrowDown: 'down',
  KeyA: 'left', ArrowLeft: 'left', KeyD: 'right', ArrowRight: 'right',
  Space: 'attack', KeyJ: 'attack', ShiftLeft: 'dodge', ShiftRight: 'dodge', KeyL: 'dodge',
  KeyK: 'block', KeyQ: 'skill1', KeyR: 'skill2', KeyF: 'creature', KeyC: 'capture',
  KeyE: 'interact', Digit1: 'potion', Tab: 'pause', Escape: 'pause', KeyM: 'map',
  KeyI: 'inventory', KeyG: 'quests', KeyH: 'help'
}

export class Input {
  constructor() {
    this.keys = new Set()
    this.pressed = new Set()
    this.virtual = { x: 0, y: 0 }
    this.virtualHeld = new Set()
    this.virtualPressed = new Set()
    this.camDragX = 0
    this.camDragY = 0
    this.zoomDelta = 0
    this.pointer = { down: false, moved: 0, x: 0, y: 0, id: null, button: 0 }
    this.touchCam = { id: null, x: 0, y: 0 }
    this.gamepad = { axes: [0, 0, 0, 0], buttons: {}, previous: {} }
    this.enabled = true
    this.onAction = null
    this.canvas = null
    this.lastMove = 0
    this._bind()
  }

  _bind() {
    window.addEventListener('keydown', e => {
      if (e.repeat) return
      const action = KEYMAP[e.code]
      if (action) {
        if (['pause', 'map', 'inventory', 'quests', 'help', 'attack'].includes(action)) e.preventDefault()
        this.keys.add(action)
        this.pressed.add(action)
        this.onAction?.(action, e)
      }
    })
    window.addEventListener('keyup', e => {
      const action = KEYMAP[e.code]
      if (action) { this.keys.delete(action); this.onAction?.(`release:${action}`, e) }
    })
    window.addEventListener('blur', () => { this.keys.clear(); this.virtualHeld.clear() })
    window.addEventListener('contextmenu', e => { if (e.target?.tagName === 'CANVAS') e.preventDefault() })
    window.addEventListener('wheel', e => { if (e.target?.tagName === 'CANVAS') { this.zoomDelta += Math.sign(e.deltaY) * .6; e.preventDefault() } }, { passive: false })
  }

  attachCanvas(canvas) {
    this.canvas = canvas
    canvas.addEventListener('pointerdown', e => this._canvasDown(e))
    window.addEventListener('pointermove', e => this._pointerMove(e))
    window.addEventListener('pointerup', e => this._pointerUp(e))
    window.addEventListener('pointercancel', e => this._pointerUp(e))
  }

  _canvasDown(e) {
    if (!this.enabled) return
    if (e.pointerType === 'mouse') {
      if (e.button === 2 || e.button === 1) {
        this.virtualHeld.add('block'); this.virtualPressed.add('block')
      } else if (e.button === 0) {
        this.pointer = { down: true, moved: 0, x: e.clientX, y: e.clientY, id: e.pointerId, button: 0 }
      }
      return
    }
    if (e.pointerType === 'touch') {
      if (e.clientX > window.innerWidth * .42 && e.clientY > window.innerHeight * .16) {
        this.touchCam = { id: e.pointerId, x: e.clientX, y: e.clientY }
      }
    }
  }

  _pointerMove(e) {
    if (!this.enabled) return
    if (this.pointer.down && e.pointerId === this.pointer.id) {
      const dx = e.clientX - this.pointer.x, dy = e.clientY - this.pointer.y
      this.pointer.moved += Math.abs(dx) + Math.abs(dy)
      if (this.pointer.moved > 9) {
        this.camDragX += dx * .0055
        this.camDragY += dy * .0042
        this.pointer.x = e.clientX; this.pointer.y = e.clientY
      }
    }
    if (this.touchCam.id === e.pointerId) {
      const dx = e.clientX - this.touchCam.x, dy = e.clientY - this.touchCam.y
      this.camDragX += dx * .0062
      this.camDragY += dy * .0046
      this.touchCam.x = e.clientX; this.touchCam.y = e.clientY
    }
  }

  _pointerUp(e) {
    if (e.pointerType === 'mouse') {
      if (e.button === 2 || e.button === 1) { this.virtualHeld.delete('block'); this.onAction?.('release:block', e) }
      if (this.pointer.down && e.pointerId === this.pointer.id) {
        if (this.pointer.moved < 9) { this.pressed.add('attack'); this.onAction?.('attack', e) }
        this.pointer.down = false
      }
    }
    if (this.touchCam.id === e.pointerId) this.touchCam.id = null
  }

  setJoystick(x, y) {
    this.virtual.x = x; this.virtual.y = y
    if (Math.abs(x) + Math.abs(y) > .1) this.lastMove = performance.now()
  }

  press(name) {
    if (!this.enabled) return
    this.virtualPressed.add(name)
    this.virtualHeld.add(name)
    this.onAction?.(name)
  }

  release(name) { this.virtualHeld.delete(name); this.onAction?.(`release:${name}`) }

  held(name) { return this.keys.has(name) || this.virtualHeld.has(name) || !!this.gamepad.buttons[name] }
  consume(name) {
    if (this.pressed.has(name)) { this.pressed.delete(name); return true }
    if (this.virtualPressed.has(name)) { this.virtualPressed.delete(name); return true }
    if (this.gamepad.buttons[name] && !this.gamepad.previous[name]) return true
    return false
  }
  consumeCamera() {
    const v = { x: this.camDragX, y: this.camDragY, zoom: this.zoomDelta }
    this.camDragX = 0; this.camDragY = 0; this.zoomDelta = 0
    return v
  }
  axis() {
    let x = 0, y = 0
    if (this.keys.has('left')) x -= 1
    if (this.keys.has('right')) x += 1
    if (this.keys.has('up')) y -= 1
    if (this.keys.has('down')) y += 1
    x += this.virtual.x; y += this.virtual.y
    x += this.gamepad.axes[0] || 0; y += this.gamepad.axes[1] || 0
    const len = Math.hypot(x, y)
    if (len > 1) { x /= len; y /= len }
    return { x, y, len: Math.min(1, len) }
  }
  pollGamepad() {
    if (!navigator.getGamepads) return
    const pads = navigator.getGamepads()
    const pad = pads && Array.from(pads).find(Boolean)
    if (!pad) return
    const b = pad.buttons
    const map = { attack: 0, dodge: 1, interact: 2, skill1: 3, creature: 4, capture: 5, block: 6, skill2: 7, pause: 9 }
    this.gamepad.previous = { ...this.gamepad.buttons }
    for (const [name, idx] of Object.entries(map)) {
      const down = !!b[idx]?.pressed
      if (down) this.gamepad.buttons[name] = true; else delete this.gamepad.buttons[name]
    }
    this.gamepad.axes = [pad.axes[0] || 0, pad.axes[1] || 0, pad.axes[2] || 0, pad.axes[3] || 0]
    if (Math.abs(pad.axes[2] || 0) > .15) this.camDragX += pad.axes[2] * .045
    if (Math.abs(pad.axes[3] || 0) > .15) this.camDragY += pad.axes[3] * .035
  }
  endFrame() {
    this.pressed.clear()
    this.virtualPressed.clear()
  }
  clear() {
    this.keys.clear(); this.pressed.clear(); this.virtualHeld.clear(); this.virtualPressed.clear()
    this.virtual.x = 0; this.virtual.y = 0
    this.pointer.down = false; this.touchCam.id = null
  }
}
