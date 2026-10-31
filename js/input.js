const KEYMAP = {
  ArrowUp: 'up', KeyW: 'up', ArrowDown: 'down', KeyS: 'down',
  ArrowLeft: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right',
  KeyJ: 'attack', KeyK: 'dodge', Space: 'dodge', KeyL: 'block', ShiftLeft: 'block', ShiftRight: 'block',
  KeyE: 'interact', KeyQ: 'summon', KeyF: 'pet',
  Digit1: 'skill1', Digit2: 'skill2', Digit3: 'skill3', Digit4: 'skill4',
  Tab: 'menu', KeyI: 'menu', KeyM: 'map', Escape: 'pause'
};
const PREVENT = new Set(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space', 'Tab']);

export class Input {
  constructor() {
    this.held = new Set();
    this.edges = new Set();
    this.virtualHeld = new Set();
    this.virtualEdges = new Set();
    this.joy = { x: 0, y: 0, active: false, id: null };
    this.padPrev = {};
    this.enabled = true;
    this.onAnyInput = null;
    this._bindKeyboard();
    this._bindGamepad();
  }

  _bindKeyboard() {
    window.addEventListener('keydown', e => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement || e.target instanceof HTMLTextAreaElement) return;
      const a = KEYMAP[e.code];
      if (!a) return;
      if (PREVENT.has(e.code)) e.preventDefault();
      if (!this.held.has(a)) this.edges.add(a);
      this.held.add(a);
      this.onAnyInput?.();
    });
    window.addEventListener('keyup', e => {
      const a = KEYMAP[e.code];
      if (a) this.held.delete(a);
    });
    window.addEventListener('blur', () => { this.held.clear(); this.virtualHeld.clear(); this.joy.x = 0; this.joy.y = 0; this.joy.active = false; });
  }

  _bindGamepad() {
    window.addEventListener('gamepadconnected', () => this._padToast?.());
  }

  attachTouch(root) {
    root.querySelectorAll('[data-action]').forEach(btn => {
      const action = btn.dataset.action;
      const down = e => {
        e.preventDefault();
        if (!this.virtualHeld.has(action)) this.virtualEdges.add(action);
        this.virtualHeld.add(action);
        btn.classList.add('pressed');
        this.onAnyInput?.();
      };
      const up = e => { e.preventDefault(); this.virtualHeld.delete(action); btn.classList.remove('pressed'); };
      btn.addEventListener('pointerdown', down);
      btn.addEventListener('pointerup', up);
      btn.addEventListener('pointercancel', up);
      btn.addEventListener('pointerleave', e => { if (e.buttons === 0) return; up(e); });
      btn.addEventListener('contextmenu', e => e.preventDefault());
    });

    const joy = document.getElementById('joystick');
    const knob = document.getElementById('js-knob');
    if (joy && knob) {
      const radius = 46;
      let pid = null;
      const setFromEvent = e => {
        const r = joy.getBoundingClientRect();
        const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
        let dx = e.clientX - cx, dy = e.clientY - cy;
        const d = Math.hypot(dx, dy);
        if (d > radius) { dx = dx / d * radius; dy = dy / d * radius; }
        this.joy.x = dx / radius;
        this.joy.y = dy / radius;
        this.joy.active = true;
        knob.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
      };
      joy.addEventListener('pointerdown', e => {
        e.preventDefault();
        pid = e.pointerId;
        joy.setPointerCapture(pid);
        setFromEvent(e);
        this.onAnyInput?.();
      });
      joy.addEventListener('pointermove', e => { if (pid === e.pointerId) setFromEvent(e); });
      const release = e => {
        if (pid !== null && e.pointerId !== pid) return;
        pid = null;
        this.joy.x = 0; this.joy.y = 0; this.joy.active = false;
        knob.style.transform = 'translate(-50%, -50%)';
      };
      joy.addEventListener('pointerup', release);
      joy.addEventListener('pointercancel', release);
      joy.addEventListener('lostpointercapture', release);
    }
  }

  _pollGamepad() {
    if (!navigator.getGamepads) return;
    const pads = navigator.getGamepads();
    let pad = null;
    for (const p of pads) if (p && p.connected) { pad = p; break; }
    if (!pad) return;
    const map = { 0: 'interact', 1: 'dodge', 2: 'attack', 3: 'summon', 4: 'skill1', 5: 'skill2', 6: 'block', 7: 'block', 9: 'menu', 8: 'map', 12: 'up', 13: 'down', 14: 'left', 15: 'right' };
    for (const [idx, action] of Object.entries(map)) {
      const pressed = pad.buttons[Number(idx)]?.pressed;
      if (pressed && !this.padPrev[action]) this.edges.add(action);
      if (pressed) this.held.add(action); else this.held.delete(action);
      this.padPrev[action] = pressed;
    }
    const ax = pad.axes[0] || 0, ay = pad.axes[1] || 0;
    if (Math.abs(ax) > .18 || Math.abs(ay) > .18) { this.joy.padX = ax; this.joy.padY = ay; }
    else { this.joy.padX = 0; this.joy.padY = 0; }
  }

  axis() {
    this._pollGamepad();
    let x = 0, y = 0;
    if (this.held.has('left')) x -= 1;
    if (this.held.has('right')) x += 1;
    if (this.held.has('up')) y -= 1;
    if (this.held.has('down')) y += 1;
    if (this.joy.active) { x += this.joy.x; y += this.joy.y; }
    if (this.joy.padX || this.joy.padY) { x += this.joy.padX; y += this.joy.padY; }
    const d = Math.hypot(x, y);
    if (d > 1) { x /= d; y /= d; }
    return { x, y, len: Math.min(1, d) };
  }

  down(action) { return this.held.has(action) || this.virtualHeld.has(action); }
  pressed(action) {
    const hit = this.edges.has(action) || this.virtualEdges.has(action);
    if (hit) { this.edges.delete(action); this.virtualEdges.delete(action); }
    return hit;
  }
  endFrame() { this.edges.clear(); this.virtualEdges.clear(); }
  clear() { this.held.clear(); this.virtualHeld.clear(); this.edges.clear(); this.virtualEdges.clear(); this.joy.active = false; }
}
