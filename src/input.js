// ============================================================
// Entrada unificada: teclado, mando, táctil
// ============================================================
const KEYMAP = {
  KeyW: 'up', ArrowUp: 'up', KeyS: 'down', ArrowDown: 'down',
  KeyA: 'left', ArrowLeft: 'left', KeyD: 'right', ArrowRight: 'right',
  KeyJ: 'attack', KeyZ: 'attack', Space: 'attack',
  KeyK: 'dodge', ShiftLeft: 'dodge', ShiftRight: 'dodge',
  KeyL: 'magic', KeyX: 'magic',
  KeyE: 'interact', KeyY: 'interact',
  KeyU: 'weapon', KeyC: 'weapon',
  KeyI: 'creature', KeyR: 'creature',
  KeyQ: 'guardHold',
  Tab: 'quick', Digit1: 'quick',
  Escape: 'pause', KeyP: 'pause',
  Enter: 'confirm', NumpadEnter: 'confirm',
  KeyM: 'map', KeyB: 'back',
  NumpadAdd: 'plus', Equal: 'plus', NumpadSubtract: 'minus', Minus: 'minus',
};

export class Input {
  constructor(canvas) {
    this.canvas = canvas;
    this.down = new Set();
    this.actions = [];
    this.touch = { x: 0, y: 0 };
    this.touchActive = false;
    this.guardHeld = false;
    this.gamepad = null;
    this.gamepadPrev = [];
    this.touchGuard = false;
    this.origin = null;
    this.stickEl = null;
    this.knobEl = null;
    this.deadzone = .22;
    this.enabled = true;
    this._bindKeyboard();
    this._bindTouch();
    this._bindGamepad();
  }

  _bindKeyboard() {
    window.addEventListener('keydown', (e) => {
      if (e.repeat) {
        if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space','Tab'].includes(e.code)) e.preventDefault();
        return;
      }
      const a = KEYMAP[e.code];
      if (a) {
        if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space','Tab'].includes(e.code)) e.preventDefault();
        if (a === 'guardHold') this.guardHeld = true;
        else this.press(a);
        this.down.add(a);
      }
      if (e.code === 'Escape') this.press('back');
      if (['Enter','NumpadEnter'].includes(e.code)) this.press('confirm');
    });
    window.addEventListener('keyup', (e) => {
      const a = KEYMAP[e.code];
      if (a) {
        if (a === 'guardHold') this.guardHeld = false;
        this.down.delete(a);
      }
      if (a === 'up' || a === 'down' || a === 'left' || a === 'right') this.down.delete(a);
    });
    window.addEventListener('blur', () => { this.down.clear(); this.guardHeld = false; this.touchGuard = false; });
  }

  _bindTouch() {
    const stick = document.getElementById('joystick');
    const knob = document.getElementById('stick-knob');
    this.stickEl = stick; this.knobEl = knob;
    if (!stick) return;
    const setStick = (ev) => {
      const r = stick.getBoundingClientRect();
      const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      let dx = ev.clientX - cx, dy = ev.clientY - cy;
      const max = r.width * .38;
      const d = Math.hypot(dx, dy);
      if (d > max) { dx = dx / d * max; dy = dy / d * max; }
      knob.style.transform = `translate(${dx}px, ${dy}px)`;
      this.touch.x = dx / max; this.touch.y = dy / max;
      this.touchActive = true;
    };
    stick.addEventListener('pointerdown', (e) => {
      e.preventDefault(); stick.setPointerCapture(e.pointerId); setStick(e); this.origin = e.pointerId;
    });
    stick.addEventListener('pointermove', (e) => {
      if (this.origin === e.pointerId) setStick(e);
    });
    const end = (e) => {
      if (this.origin !== e.pointerId && this.origin !== null) return;
      this.origin = null; this.touchActive = false; this.touch.x = 0; this.touch.y = 0;
      knob.style.transform = 'translate(0,0)';
    };
    stick.addEventListener('pointerup', end);
    stick.addEventListener('pointercancel', end);
    stick.addEventListener('lostpointercapture', end);

    document.querySelectorAll('[data-touch]').forEach(btn => {
      const act = btn.dataset.touch;
      btn.addEventListener('pointerdown', (e) => {
        e.preventDefault(); btn.classList.add('pressed');
        if (act === 'guard') { this.touchGuard = true; }
        else this.press(act);
        if (act === 'attack') btn.dataset.hold = '1';
      });
      const up = () => { btn.classList.remove('pressed'); if (act === 'guard') this.touchGuard = false; delete btn.dataset.hold; };
      btn.addEventListener('pointerup', up);
      btn.addEventListener('pointercancel', up);
      btn.addEventListener('pointerleave', up);
    });
  }

  _bindGamepad() {
    window.addEventListener('gamepadconnected', (e) => { this.gamepad = e.gamepad.index; this.press('gamepad'); });
    window.addEventListener('gamepaddisconnected', () => { this.gamepad = null; });
    const pads = navigator.getGamepads?.() || [];
    for (let i = 0; i < pads.length; i++) if (pads[i]) { this.gamepad = i; break; }
  }

  press(a) {
    if (!a) return;
    if (!this.actions.includes(a)) this.actions.push(a);
    if (a === 'guardHold') this.guardHeld = true;
  }

  consume(a) {
    const i = this.actions.indexOf(a);
    if (i >= 0) { this.actions.splice(i, 1); return true; }
    return false;
  }

  any(...actions) {
    for (const a of actions) if (this.consume(a)) return true;
    return false;
  }

  clearActions() { this.actions.length = 0; }

  isDown(a) { return this.down.has(a); }

  update() {
    // mando
    const pads = navigator.getGamepads?.() || [];
    let pad = null;
    if (this.gamepad !== null && pads[this.gamepad]) pad = pads[this.gamepad];
    else { for (const p of pads) if (p) { pad = p; this.gamepad = p.index; break; } }
    if (!pad) return;
    const ax = pad.axes[0] || 0, ay = pad.axes[1] || 0;
    if (Math.abs(ax) > this.deadzone || Math.abs(ay) > this.deadzone) {
      this.padMove = { x: ax, y: ay };
    } else this.padMove = { x: 0, y: 0 };
    const buttons = [
      ['attack', 0], ['dodge', 1], ['magic', 2], ['interact', 3],
      ['guard', 4], ['creature', 5], ['weapon', 6], ['quick', 7],
      ['pause', 9],
    ];
    buttons.forEach(([name, idx]) => {
      const b = pad.buttons[idx];
      if (!b) return;
      const prev = this.gamepadPrev[idx] || false;
      if (b.pressed && !prev) {
        if (name === 'guard') this.guardHeld = true;
        else this.press(name);
      }
      if (!b.pressed && prev && name === 'guard') this.guardHeld = false;
      this.gamepadPrev[idx] = b.pressed;
    });
    // cruceta para menús / movimiento
    const dpad = [[12,'up'],[13,'down'],[14,'left'],[15,'right']];
    dpad.forEach(([idx, name]) => {
      const b = pad.buttons[idx];
      if (!b) return;
      const prev = this.gamepadPrev[idx] || false;
      if (b.pressed && !prev) this.press(name);
      this.gamepadPrev[idx] = b.pressed;
    });
  }

  moveVector() {
    let x = 0, y = 0;
    if (this.isDown('left')) x -= 1;
    if (this.isDown('right')) x += 1;
    if (this.isDown('up')) y -= 1;
    if (this.isDown('down')) y += 1;
    if (this.touchActive) { x += this.touch.x; y += this.touch.y; }
    if (this.padMove) { x += this.padMove.x; y += this.padMove.y; }
    const m = Math.hypot(x, y);
    if (m > 1) { x /= m; y /= m; }
    return { x, y, mag: Math.min(1, Math.hypot(x, y)) };
  }

  get guard() { return this.guardHeld || this.touchGuard; }

  nav() {
    if (this.consume('up')) return 'up';
    if (this.consume('down')) return 'down';
    if (this.consume('left')) return 'left';
    if (this.consume('right')) return 'right';
    if (this.consume('confirm')) return 'confirm';
    if (this.consume('back') || this.consume('pause')) return 'back';
    return null;
  }
}
