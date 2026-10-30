// Entrada unificada: teclado, mando Bluetooth, controles táctiles e inclinación.
import { clamp } from './utils.js';

const KEY_MAP = {
  ArrowUp: 'up', KeyW: 'up',
  ArrowDown: 'down', KeyS: 'down',
  ArrowLeft: 'left', KeyA: 'left',
  ArrowRight: 'right', KeyD: 'right',
  KeyJ: 'attack', KeyZ: 'attack',
  KeyK: 'dodge', Space: 'dodge',
  KeyL: 'skill', KeyX: 'skill',
  KeyE: 'interact', Enter: 'interact',
  KeyQ: 'switchWeapon',
  KeyR: 'creature',
  Escape: 'pause', KeyP: 'pause',
  Tab: 'select', ShiftLeft: 'select', ShiftRight: 'select',
  Digit1: 'potion', Digit2: 'mana', Digit3: 'resist',
  KeyM: 'map'
};

const ACTIONS = ['up', 'down', 'left', 'right', 'attack', 'dodge', 'skill', 'interact', 'switchWeapon', 'creature', 'pause', 'select', 'potion', 'mana', 'resist', 'map'];

const GAMEPAD_MAP = {
  0: 'attack', 1: 'dodge', 2: 'skill', 3: 'interact',
  4: 'switchWeapon', 5: 'creature', 8: 'select', 9: 'pause',
  12: 'up', 13: 'down', 14: 'left', 15: 'right'
};

export class Input {
  constructor(game) {
    this.game = game;
    this.raw = Object.create(null);
    this.touch = Object.create(null);
    this.touchDir = { up: false, down: false, left: false, right: false };
    this.pad = Object.create(null);
    this.padAxes = { x: 0, y: 0 };
    this.axisValue = { x: 0, y: 0, magnitude: 0 };
    this.prev = Object.create(null);
    this.justPressed = new Set();
    this.justReleased = new Set();
    this.pressLatch = Object.create(null);
    this.gamepads = [];
    this.lastPad = null;
    this.tilt = { enabled: false, permitted: false, x: 0, y: 0, baseBeta: 0, baseGamma: 0, ready: false };
    this._onKeyDown = e => this.onKey(e, true);
    this._onKeyUp = e => this.onKey(e, false);
    this._onOrient = e => this.onOrient(e);
    this._onBlur = () => this.clearAll();
    this._onPad = e => this.onGamepadConnected(e);
  }

  attach() {
    window.addEventListener('keydown', this._onKeyDown, { passive: false });
    window.addEventListener('keyup', this._onKeyUp);
    window.addEventListener('blur', this._onBlur);
    window.addEventListener('gamepadconnected', this._onPad);
    window.addEventListener('gamepaddisconnected', this._onPad);
    if (this.tilt.enabled) this.enableTilt(this.tilt.enabledByUser);
  }

  onKey(e, down) {
    if (e.repeat) return;
    const action = KEY_MAP[e.code];
    if (!action) return;
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space', 'Tab'].includes(e.code)) e.preventDefault();
    this.raw[action] = down;
    if (!down) this.raw[action] = false;
    if (down) this.pressLatch[action] = true;
    this.game.audio?.unlock?.();
    if (down) this.game.onAnyInput?.();
  }

  setTouch(action, down) {
    this.touch[action] = down;
    if (down) this.pressLatch[action] = true;
    if (down) {
      this.game.audio?.unlock?.();
      this.game.onAnyInput?.();
    }
  }

  setTouchDirection(dir, down) {
    if (!(dir in this.touchDir)) return;
    this.touchDir[dir] = down;
    if (down) this.pressLatch[dir] = true;
    if (down) this.game.onAnyInput?.();
  }

  clearAll() {
    this.raw = Object.create(null);
    this.touch = Object.create(null);
    this.pressLatch = Object.create(null);
    this.touchDir = { up: false, down: false, left: false, right: false };
    this.pad = Object.create(null);
    this.padAxes = { x: 0, y: 0 };
  }

  onGamepadConnected(e) {
    if (e.type === 'gamepadconnected') {
      this.game.toast('Mando conectado', e.gamepad.id.slice(0, 42), 'info', 2800);
    }
  }

  update() {
    const newDown = Object.create(null);
    // Teclado.
    for (const action of ACTIONS) {
      if (this.raw[action] || this.touch[action] || this.pressLatch[action]) newDown[action] = true;
    }
    // Cruceta táctil.
    if (this.touchDir.left) newDown.left = true;
    if (this.touchDir.right) newDown.right = true;
    if (this.touchDir.up) newDown.up = true;
    if (this.touchDir.down) newDown.down = true;
    // Mando.
    this.pollGamepad();
    for (const [a, v] of Object.entries(this.pad)) if (v) newDown[a] = true;

    this.justPressed.clear();
    this.justReleased.clear();
    for (const action of ACTIONS) {
      const isDown = !!newDown[action];
      if (isDown && !this.prev[action]) this.justPressed.add(action);
      if (!isDown && this.prev[action]) this.justReleased.add(action);
    }
    this.prev = newDown;
    this.pressLatch = Object.create(null);
    this.updateAxis();
    return this;
  }

  pollGamepad() {
    const pads = navigator.getGamepads ? navigator.getGamepads() : [];
    this.gamepads = [];
    this.pad = Object.create(null);
    this.padAxes = { x: 0, y: 0 };
    for (const gp of pads) {
      if (!gp || !gp.connected) continue;
      this.gamepads.push(gp);
      for (const [index, action] of Object.entries(GAMEPAD_MAP)) {
        const b = gp.buttons[Number(index)];
        if (b && (b.pressed || b.value > 0.45)) this.pad[action] = true;
      }
      const ax = gp.axes[0] || 0, ay = gp.axes[1] || 0;
      const dead = 0.22;
      if (Math.abs(ax) > dead) this.padAxes.x = ax;
      if (Math.abs(ay) > dead) this.padAxes.y = ay;
      // Stick derecho como refuerzo del D-pad.
      const rx = gp.axes[2] || 0, ry = gp.axes[3] || 0;
      if (Math.abs(rx) > 0.5) this.pad[rx > 0 ? 'right' : 'left'] = true;
      if (Math.abs(ry) > 0.5) this.pad[ry > 0 ? 'down' : 'up'] = true;
    }
  }

  updateAxis() {
    let x = 0, y = 0;
    if (this.prev.left) x -= 1;
    if (this.prev.right) x += 1;
    if (this.prev.up) y -= 1;
    if (this.prev.down) y += 1;
    if (this.padAxes.x) x += this.padAxes.x;
    if (this.padAxes.y) y += this.padAxes.y;
    if (this.tilt.enabled && this.tilt.ready) {
      x += this.tilt.x;
      y += this.tilt.y;
    }
    const m = Math.hypot(x, y);
    if (m > 1) { x /= m; y /= m; }
    this.axisValue = { x, y, magnitude: Math.min(1, m) };
  }

  axis() { return this.axisValue; }
  isDown(action) { return !!this.prev[action]; }
  pressed(action) { return this.justPressed.has(action); }
  released(action) { return this.justReleased.has(action); }

  async enableTilt(byUser = true) {
    this.tilt.enabledByUser = byUser;
    try {
      if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
        const permission = await DeviceOrientationEvent.requestPermission();
        if (permission !== 'granted') {
          this.game.toast('Inclinación no disponible', 'El navegador no concedió el permiso de movimiento.', 'warning', 4000);
          return false;
        }
      }
      if (!this._orientAttached) {
        window.addEventListener('deviceorientation', this._onOrient, true);
        this._orientAttached = true;
      }
      this.tilt.enabled = true;
      this.tilt.permitted = true;
      this.tilt.ready = true;
      this.tilt.enabledByUser = byUser;
      this.game.toast('Inclinación activada', 'Calibra el dispositivo con el botón «Centrar».', 'success', 3500);
      return true;
    } catch (error) {
      console.warn(error);
      this.game.toast('Inclinación no disponible', 'Este dispositivo no permite el sensor de movimiento.', 'warning', 4000);
      return false;
    }
  }

  disableTilt() {
    this.tilt.enabled = false;
    this.tilt.ready = false;
    this.tilt.x = 0;
    this.tilt.y = 0;
  }

  calibrateTilt() {
    this.tilt.baseBeta = this.tilt.beta || 0;
    this.tilt.baseGamma = this.tilt.gamma || 0;
    this.tilt.x = 0;
    this.tilt.y = 0;
    this.game.toast('Inclinación centrada', 'Mantén el dispositivo en una postura cómoda.', 'info', 2600);
  }

  onOrient(e) {
    if (!this.tilt.enabled) return;
    this.tilt.beta = e.beta || 0;
    this.tilt.gamma = e.gamma || 0;
    const angle = (screen.orientation && screen.orientation.angle) || window.orientation || 0;
    let tx = 0, ty = 0;
    const b = (e.beta || 0) - this.tilt.baseBeta;
    const g = (e.gamma || 0) - this.tilt.baseGamma;
    if (angle === 90) { tx = b; ty = -g * 0.4; }
    else if (angle === -90 || angle === 270) { tx = -b; ty = g * 0.4; }
    else { tx = g; ty = b * 0.4; }
    const sens = (this.game.settings.tiltSensitivity || 1.2) / 18;
    tx = clamp(tx * sens, -1, 1);
    ty = clamp(ty * sens, -1, 1);
    if (Math.abs(tx) < 0.08) tx = 0;
    if (Math.abs(ty) < 0.08) ty = 0;
    this.tilt.x = tx;
    this.tilt.y = ty;
  }

  getGamepadCount() {
    return this.gamepads.filter(g => g.connected).length;
  }
}
