const KEYMAP = {
  ArrowUp: 'up', KeyW: 'up', ArrowDown: 'down', KeyS: 'down',
  ArrowLeft: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right',
  KeyJ: 'attack', KeyK: 'ability1', KeyL: 'ability2', KeyU: 'ability3', KeyO: 'companion',
  KeyQ: 'block',
  Space: 'dodge', ShiftLeft: 'dodge', ShiftRight: 'dodge',
  KeyE: 'interact', Enter: 'interact', KeyR: 'resonate',
  Escape: 'menu', KeyP: 'menu', Tab: 'journal', KeyB: 'journal',
  Digit1: 'item1', Digit2: 'item2',
};
const PREVENT = new Set(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space', 'Tab']);

export class Input {
  constructor(target = window) {
    this.keys = new Set();
    this.actions = new Set();
    this.pressed = new Set();
    this.released = new Set();
    this.touchAxes = { x: 0, y: 0 };
    this.enabled = true;
    this.onFirstGesture = null;
    this._gestured = false;
    this._target = target;

    this._keydown = (e) => {
      if (PREVENT.has(e.code)) e.preventDefault();
      this._gesture();
      if (e.repeat) return;
      const a = KEYMAP[e.code];
      if (a) { this.actions.add(a); this.pressed.add(a); }
      this.keys.add(e.code);
    };
    this._keyup = (e) => {
      const a = KEYMAP[e.code];
      if (a) { this.actions.delete(a); this.released.add(a); }
      this.keys.delete(e.code);
    };
    this._blur = () => { this.actions.clear(); this.keys.clear(); this.touchAxes.x = 0; this.touchAxes.y = 0; };
    window.addEventListener('keydown', this._keydown, { passive: false });
    window.addEventListener('keyup', this._keyup);
    window.addEventListener('blur', this._blur);
    this._initTouch();
    window.addEventListener('pointerdown', () => this._gesture(), { once: true });
    window.addEventListener('touchstart', () => this._gesture(), { once: true, passive: true });
  }
  _gesture() {
    if (this._gestured) return;
    this._gestured = true;
    this.onFirstGesture?.();
  }
  _initTouch() {
    document.querySelectorAll('[data-action]').forEach((btn) => {
      const act = btn.dataset.action;
      const down = (e) => {
        e.preventDefault(); e.stopPropagation();
        this._gesture();
        btn.classList.add('active');
        if (!this.actions.has(act)) { this.actions.add(act); this.pressed.add(act); }
      };
      const up = (e) => {
        e.preventDefault(); e.stopPropagation();
        btn.classList.remove('active');
        this.actions.delete(act); this.released.add(act);
      };
      btn.addEventListener('pointerdown', down);
      btn.addEventListener('pointerup', up);
      btn.addEventListener('pointercancel', up);
      btn.addEventListener('pointerleave', up);
      btn.addEventListener('contextmenu', (e) => e.preventDefault());
    });

    const joy = document.getElementById('joystick');
    const stick = document.getElementById('stick');
    if (!joy || !stick) return;
    let jid = null;
    const setStick = (e) => {
      const r = joy.getBoundingClientRect();
      const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      let dx = e.clientX - cx, dy = e.clientY - cy;
      const max = r.width * .34;
      const len = Math.hypot(dx, dy) || 1;
      const cl = Math.min(len, max);
      dx = dx / len * cl; dy = dy / len * cl;
      stick.style.transform = `translate(${dx}px, ${dy}px)`;
      this.touchAxes.x = (dx / max);
      this.touchAxes.y = (dy / max);
    };
    joy.addEventListener('pointerdown', (e) => {
      e.preventDefault(); this._gesture(); jid = e.pointerId; joy.setPointerCapture(jid); setStick(e);
    });
    joy.addEventListener('pointermove', (e) => { if (e.pointerId === jid) { e.preventDefault(); setStick(e); } });
    const reset = (e) => {
      if (jid !== null && e.pointerId !== jid) return;
      jid = null; this.touchAxes.x = 0; this.touchAxes.y = 0;
      stick.style.transform = 'translate(0,0)';
    };
    joy.addEventListener('pointerup', reset);
    joy.addEventListener('pointercancel', reset);
    joy.addEventListener('pointerleave', reset);
  }
  isDown(a) { return this.actions.has(a); }
  wasPressed(a) { return this.pressed.has(a); }
  get moveX() {
    let x = 0;
    if (this.actions.has('left')) x -= 1;
    if (this.actions.has('right')) x += 1;
    if (Math.abs(this.touchAxes.x) > .14) x += this.touchAxes.x;
    return Math.max(-1, Math.min(1, x));
  }
  get moveY() {
    let y = 0;
    if (this.actions.has('up')) y -= 1;
    if (this.actions.has('down')) y += 1;
    if (Math.abs(this.touchAxes.y) > .14) y += this.touchAxes.y;
    return Math.max(-1, Math.min(1, y));
  }
  get moving() { return Math.hypot(this.moveX, this.moveY) > .15; }
  endFrame() { this.pressed.clear(); this.released.clear(); }
  clearTransient() { this.pressed.clear(); this.released.clear(); this.actions.clear(); }
  destroy() {
    window.removeEventListener('keydown', this._keydown);
    window.removeEventListener('keyup', this._keyup);
    window.removeEventListener('blur', this._blur);
  }
}
