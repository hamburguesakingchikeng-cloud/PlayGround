/* ==========================================================================
   INPUT — keyboard, gamepad, virtual joystick and touch action buttons.
   ========================================================================== */

const KEYMAP = {
  KeyW: 'up', ArrowUp: 'up',
  KeyS: 'down', ArrowDown: 'down',
  KeyA: 'left', ArrowLeft: 'left',
  KeyD: 'right', ArrowRight: 'right',
  KeyJ: 'attack', KeyZ: 'attack', Space: 'attack',
  KeyK: 'dodge', ShiftLeft: 'dodge', ShiftRight: 'dodge',
  KeyL: 'skill',
  KeyE: 'interact', KeyY: 'interact',
  KeyQ: 'weapon',
  KeyR: 'creature',
  Escape: 'start', Enter: 'confirm',
  Tab: 'select', Backspace: 'select',
  Digit1: 'slot1', Digit2: 'slot2', Digit3: 'slot3',
};

const PADMAP = {
  0: 'attack', 1: 'dodge', 2: 'skill', 3: 'interact',
  4: 'weapon', 5: 'creature', 6: 'blockExtra', 7: 'skill',
  8: 'select', 9: 'start', 12: 'up', 13: 'down', 14: 'left', 15: 'right',
};

export class Input {
  constructor() {
    this.sources = new Map();          // action -> Set(source)
    this.justPressed = new Set();
    this.justReleased = new Set();
    this.axis = { x: 0, y: 0 };
    this.keyAxis = { x: 0, y: 0 };
    this.padAxis = { x: 0, y: 0 };
    this.touchAxis = { x: 0, y: 0 };
    this.touchActive = false;
    this.padConnected = false;
    this.padName = '';
    this.padButtonsPrev = [];
    this.enabled = true;
    this.lastInputType = 'keyboard';
    this.onGamepadChange = null;
    this._bindKeyboard();
    this._bindTouch();
    this._bindGamepad();
    this._bindFirstGesture();
  }

  _set(action, source, on) {
    if (!action) return;
    let set = this.sources.get(action);
    if (!set) { set = new Set(); this.sources.set(action, set); }
    const had = set.size > 0;
    if (on) {
      set.add(source);
      if (!had) { this.justPressed.add(action); this.lastInputType = source; }
    } else {
      set.delete(source);
      if (had && set.size === 0) this.justReleased.add(action);
    }
  }

  _bindKeyboard() {
    window.addEventListener('keydown', e => {
      if (!this.enabled) return;
      const action = KEYMAP[e.code];
      if (action) {
        if (['up', 'down', 'left', 'right', 'attack', 'dodge', 'skill', 'interact', 'select', 'start', 'confirm'].includes(action)) e.preventDefault();
        if (!e.repeat) this._set(action, 'key', true);
        this.lastInputType = 'keyboard';
      }
      this._updateKeyAxis();
    }, { passive: false });

    window.addEventListener('keyup', e => {
      const action = KEYMAP[e.code];
      if (action) this._set(action, 'key', false);
      this._updateKeyAxis();
    });
    window.addEventListener('blur', () => {
      this.sources.clear();
      this.keyAxis.x = 0; this.keyAxis.y = 0;
    });
  }

  _updateKeyAxis() {
    const x = (this._keyDown('right') ? 1 : 0) - (this._keyDown('left') ? 1 : 0);
    const y = (this._keyDown('down') ? 1 : 0) - (this._keyDown('up') ? 1 : 0);
    this.keyAxis.x = x; this.keyAxis.y = y;
  }

  _keyDown(a) { return this.sources.get(a)?.has('key'); }

  _bindTouch() {
    const joy = document.getElementById('joystick');
    const stick = document.getElementById('joystickStick');
    if (joy) {
      let id = null, cx = 0, cy = 0, max = 48;
      const start = e => {
        e.preventDefault();
        if (id !== null) return;
        id = e.pointerId;
        joy.setPointerCapture(id);
        const r = joy.getBoundingClientRect();
        cx = r.left + r.width / 2; cy = r.top + r.height / 2;
        max = Math.min(r.width, r.height) * 0.34;
        this.touchActive = true;
        this.lastInputType = 'touch';
        move(e);
      };
      const move = e => {
        if (e.pointerId !== id) return;
        let dx = e.clientX - cx, dy = e.clientY - cy;
        const len = Math.hypot(dx, dy);
        if (len > max) { dx = dx / len * max; dy = dy / len * max; }
        const nx = dx / max, ny = dy / max;
        this.touchAxis.x = Math.abs(nx) < .12 ? 0 : nx;
        this.touchAxis.y = Math.abs(ny) < .12 ? 0 : ny;
        if (stick) stick.style.transform = `translate(${dx}px, ${dy}px)`;
      };
      const end = e => {
        if (e.pointerId !== id) return;
        id = null;
        this.touchAxis.x = 0; this.touchAxis.y = 0;
        this.touchActive = false;
        if (stick) stick.style.transform = '';
      };
      joy.addEventListener('pointerdown', start);
      joy.addEventListener('pointermove', move);
      joy.addEventListener('pointerup', end);
      joy.addEventListener('pointercancel', end);
      joy.addEventListener('lostpointercapture', end);
    }

    document.querySelectorAll('[data-touch]').forEach(btn => {
      const action = btn.dataset.touch;
      let pid = null;
      const down = e => {
        e.preventDefault();
        if (pid !== null) return;
        pid = e.pointerId;
        btn.setPointerCapture(pid);
        btn.classList.add('active');
        this._set(action, 'touch', true);
        this.lastInputType = 'touch';
      };
      const up = e => {
        if (e.pointerId !== pid) return;
        pid = null;
        btn.classList.remove('active');
        this._set(action, 'touch', false);
      };
      btn.addEventListener('pointerdown', down);
      btn.addEventListener('pointerup', up);
      btn.addEventListener('pointercancel', up);
      btn.addEventListener('lostpointercapture', up);
      btn.addEventListener('contextmenu', e => e.preventDefault());
    });

    // Desktop click / touch on canvas = attack. Ignore clicks that hit UI.
    const canvas = document.getElementById('game');
    if (canvas) {
      canvas.addEventListener('pointerdown', e => {
        if (e.pointerType === 'mouse' && e.button !== 0) return;
        if (this.lastInputType === 'touch' || this.touchActive) return;
        this._set('attack', 'mouse', true);
        this.lastInputType = 'mouse';
      });
      window.addEventListener('pointerup', e => {
        if (e.pointerType === 'mouse' || e.pointerType === 'pen') this._set('attack', 'mouse', false);
      });
      canvas.addEventListener('contextmenu', e => e.preventDefault());
    }
  }

  _bindGamepad() {
    window.addEventListener('gamepadconnected', e => {
      this.padConnected = true;
      this.padName = e.gamepad.id;
      this.onGamepadChange?.(true, this.padName);
    });
    window.addEventListener('gamepaddisconnected', () => {
      this.padConnected = false;
      this.onGamepadChange?.(false, '');
    });
  }

  _bindFirstGesture() {
    const fn = () => { this.onFirstGesture?.(); };
    window.addEventListener('pointerdown', fn, { once: true });
    window.addEventListener('keydown', fn, { once: true });
  }

  update() {
    // Gamepad polling
    const pads = navigator.getGamepads ? navigator.getGamepads() : [];
    let pad = null;
    for (const p of pads) if (p && p.connected) { pad = p; break; }
    if (pad) {
      if (!this.padConnected) { this.padConnected = true; this.padName = pad.id; this.onGamepadChange?.(true, pad.id); }
      const dz = .22;
      let ax = pad.axes[0] || 0, ay = pad.axes[1] || 0;
      if (Math.hypot(ax, ay) < dz) { ax = 0; ay = 0; }
      this.padAxis.x = ax; this.padAxis.y = ay;
      const prev = this.padButtonsPrev;
      pad.buttons.forEach((b, i) => {
        const action = PADMAP[i];
        if (!action) return;
        const was = !!prev[i];
        if (b.pressed && !was) { this._set(action, 'pad', true); this.lastInputType = 'gamepad'; }
        else if (!b.pressed && was) this._set(action, 'pad', false);
      });
      this.padButtonsPrev = pad.buttons.map(b => b.pressed);
      // D-pad contributes to axis
      if (pad.buttons[15]?.pressed) this.padAxis.x = 1;
      if (pad.buttons[14]?.pressed) this.padAxis.x = -1;
      if (pad.buttons[13]?.pressed) this.padAxis.y = 1;
      if (pad.buttons[12]?.pressed) this.padAxis.y = -1;
    } else {
      this.padAxis.x = 0; this.padAxis.y = 0;
    }

    let x = this.keyAxis.x, y = this.keyAxis.y;
    if (Math.hypot(this.padAxis.x, this.padAxis.y) > .05) { x = this.padAxis.x; y = this.padAxis.y; }
    if (this.touchActive) { x = this.touchAxis.x; y = this.touchAxis.y; }
    const len = Math.hypot(x, y);
    if (len > 1) { x /= len; y /= len; }
    this.axis.x = x; this.axis.y = y;
  }

  postUpdate() {
    this.justPressed.clear();
    this.justReleased.clear();
  }

  down(action) { return (this.sources.get(action)?.size || 0) > 0; }
  pressed(action) { return this.justPressed.has(action); }
  released(action) { return this.justReleased.has(action); }
  clear() { this.sources.clear(); this.justPressed.clear(); this.justReleased.clear(); }

  rumble(strong = .4, weak = .2, ms = 90) {
    const pads = navigator.getGamepads ? navigator.getGamepads() : [];
    for (const p of pads) {
      if (p?.vibrationActuator) {
        p.vibrationActuator.playEffect('dual-rumble', { duration: ms, strongMagnitude: strong, weakMagnitude: weak }).catch(() => {});
        break;
      }
    }
  }
}

export const input = new Input();
