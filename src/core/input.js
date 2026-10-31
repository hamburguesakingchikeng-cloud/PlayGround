// Entrada unificada: teclado, ratón, táctil y mando.
const KEYMAP = {
  ArrowUp: 'up', KeyW: 'up',
  ArrowDown: 'down', KeyS: 'down',
  ArrowLeft: 'left', KeyA: 'left',
  ArrowRight: 'right', KeyD: 'right',
  ShiftLeft: 'run', ShiftRight: 'run',
  KeyJ: 'attack', KeyK: 'heavy', Space: 'dodge',
  KeyL: 'block', KeyE: 'interact', KeyU: 'spell',
  Digit1: 'spell1', Digit2: 'spell2', Digit3: 'spell3',
  KeyC: 'companion', KeyR: 'ultimate', KeyQ: 'potion',
  Tab: 'menu', Escape: 'menu', KeyM: 'map',
  KeyP: 'pause',
};

export class Input {
  constructor(canvas) {
    this.canvas = canvas;
    this.keys = new Set();
    this.virtual = new Set();
    this.pressed = new Set();
    this.released = new Set();
    this.mouse = { x: 0, y: 0, worldX: 0, worldY: 0, down: false };
    this.joystick = { x: 0, y: 0, active: false };
    this.touchMode = false;
    this.enabled = true;
    this.gamepad = null;
    this._bind();
  }

  _bind() {
    window.addEventListener('keydown', (e) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target?.isContentEditable) return;
      const action = KEYMAP[e.code];
      if (!action) return;
      if (['Tab', 'Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) e.preventDefault();
      if (!this.keys.has(action)) this._press(action);
      this.keys.add(action);
    });
    window.addEventListener('keyup', (e) => {
      const action = KEYMAP[e.code];
      if (!action) return;
      this.keys.delete(action);
      if (!this.virtual.has(action)) this._release(action);
    });
    window.addEventListener('blur', () => this.clear());
    document.addEventListener('visibilitychange', () => { if (document.hidden) this.clear(); });

    this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    this.canvas.addEventListener('pointermove', (e) => {
      const r = this.canvas.getBoundingClientRect();
      this.mouse.x = e.clientX - r.left;
      this.mouse.y = e.clientY - r.top;
      this.mouse.worldX = this.mouse.x;
      this.mouse.worldY = this.mouse.y;
    });
    this.canvas.addEventListener('pointerdown', (e) => {
      if (e.pointerType === 'touch') return;
      const r = this.canvas.getBoundingClientRect();
      this.mouse.x = e.clientX - r.left;
      this.mouse.y = e.clientY - r.top;
      this.mouse.down = true;
      if (e.button === 0) this._press('attack');
      if (e.button === 2) this._press('dodge');
    });
    window.addEventListener('pointerup', (e) => {
      if (e.pointerType === 'touch') return;
      this.mouse.down = false;
      if (e.button === 0) this._release('attack');
      if (e.button === 2) this._release('dodge');
    });

    window.addEventListener('gamepadconnected', (e) => { this.gamepad = e.gamepad; });
    window.addEventListener('gamepaddisconnected', () => { this.gamepad = null; });
  }

  bindTouch({ joystick, knob, buttons }) {
    this.touchMode = true;
    if (joystick && knob) {
      let pointerId = null;
      const update = (e) => {
        const r = joystick.getBoundingClientRect();
        const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
        let dx = (e.clientX - cx) / (r.width * 0.42);
        let dy = (e.clientY - cy) / (r.height * 0.42);
        const len = Math.hypot(dx, dy);
        if (len > 1) { dx /= len; dy /= len; }
        this.joystick.x = dx; this.joystick.y = dy; this.joystick.active = true;
        knob.style.transform = `translate(${dx * 32}px, ${dy * 32}px)`;
        joystick.classList.add('active');
      };
      joystick.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        pointerId = e.pointerId;
        joystick.setPointerCapture(pointerId);
        update(e);
      });
      joystick.addEventListener('pointermove', (e) => {
        if (pointerId !== e.pointerId) return;
        e.preventDefault();
        update(e);
      });
      const end = (e) => {
        if (pointerId !== e.pointerId) return;
        pointerId = null;
        this.joystick.x = 0; this.joystick.y = 0; this.joystick.active = false;
        knob.style.transform = 'translate(0,0)';
        joystick.classList.remove('active');
      };
      joystick.addEventListener('pointerup', end);
      joystick.addEventListener('pointercancel', end);
      joystick.addEventListener('lostpointercapture', end);
    }
    for (const btn of buttons) {
      const action = btn.dataset.action;
      if (!action) continue;
      const down = (e) => {
        e.preventDefault();
        btn.setPointerCapture?.(e.pointerId);
        btn.classList.add('pressed');
        this.virtual.add(action);
        this._press(action);
      };
      const up = (e) => {
        e.preventDefault();
        btn.classList.remove('pressed');
        this.virtual.delete(action);
        this._release(action);
      };
      btn.addEventListener('pointerdown', down);
      btn.addEventListener('pointerup', up);
      btn.addEventListener('pointercancel', up);
      btn.addEventListener('lostpointercapture', up);
      btn.addEventListener('contextmenu', (e) => e.preventDefault());
    }
  }

  _press(action) {
    if (!this.enabled) return;
    this.pressed.add(action);
  }
  _release(action) {
    this.released.add(action);
  }

  down(action) {
    return this.enabled && (this.keys.has(action) || this.virtual.has(action) || this._padDown(action));
  }
  justPressed(action) {
    return this.enabled && this.pressed.has(action);
  }
  justReleased(action) {
    return this.enabled && this.released.has(action);
  }
  consume(action) {
    const had = this.pressed.has(action);
    this.pressed.delete(action);
    return had;
  }

  axis() {
    let x = 0, y = 0;
    if (this.down('left')) x -= 1;
    if (this.down('right')) x += 1;
    if (this.down('up')) y -= 1;
    if (this.down('down')) y += 1;
    if (this.joystick.active) { x += this.joystick.x; y += this.joystick.y; }
    const pad = this._pad();
    if (pad) {
      const ax = pad.axes[0] || 0, ay = pad.axes[1] || 0;
      if (Math.abs(ax) > 0.18) x += ax;
      if (Math.abs(ay) > 0.18) y += ay;
    }
    const len = Math.hypot(x, y);
    if (len > 1) { x /= len; y /= len; }
    return { x, y, len: Math.min(1, len) };
  }

  _pad() {
    if (!this.gamepad) {
      const pads = navigator.getGamepads?.() || [];
      this.gamepad = [...pads].find(p => p && p.connected) || null;
    }
    return this.gamepad;
  }
  _padDown(action) {
    const pad = this._pad();
    if (!pad) return false;
    const map = { attack: [0], dodge: [1], interact: [2], spell: [3], block: [4], companion: [5], ultimate: [6], potion: [7], menu: [9] };
    return (map[action] || []).some(i => pad.buttons[i]?.pressed);
  }

  pollGamepad() {
    const pad = this._pad();
    if (!pad) return;
    const map = { attack: [0], dodge: [1], interact: [2], spell: [3], block: [4], companion: [5], ultimate: [6], potion: [7], menu: [9] };
    for (const [action, buttons] of Object.entries(map)) {
      const isDown = buttons.some(i => pad.buttons[i]?.pressed);
      const was = this.virtual.has('pad:' + action);
      if (isDown && !was) { this.virtual.add('pad:' + action); this._press(action); }
      if (!isDown && was) { this.virtual.delete('pad:' + action); this._release(action); }
    }
  }

  clear() {
    this.keys.clear();
    this.virtual.clear();
    this.pressed.clear();
    this.released.clear();
    this.joystick.x = 0; this.joystick.y = 0; this.joystick.active = false;
    document.querySelectorAll('.touch-btn.pressed').forEach(b => b.classList.remove('pressed'));
  }

  endFrame() {
    this.pressed.clear();
    this.released.clear();
  }
}
