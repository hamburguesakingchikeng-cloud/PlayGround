// Keyboard and touch controls.

const MOVE_KEYS = {
  KeyW: [0, -1], ArrowUp: [0, -1],
  KeyS: [0, 1], ArrowDown: [0, 1],
  KeyA: [-1, 0], ArrowLeft: [-1, 0],
  KeyD: [1, 0], ArrowRight: [1, 0]
};

export class Input {
  constructor(game, ui) {
    this.game = game;
    this.ui = ui;
    this.keys = new Set();
    this.joystick = { active: false, id: null, x: 0, y: 0, dx: 0, dy: 0 };
    this.joyEl = document.getElementById('joystick');
    this.knob = document.getElementById('stickKnob');
    this.bind();
  }

  bind() {
    window.addEventListener('keydown', event => {
      if (event.repeat) {
        if (MOVE_KEYS[event.code]) event.preventDefault();
        return;
      }
      if (MOVE_KEYS[event.code]) {
        this.keys.add(event.code);
        event.preventDefault();
        return;
      }
      if (event.code === 'Space') event.preventDefault();
      const g = this.game;
      if (event.code === 'KeyI') {
        event.preventDefault();
        if (g.state === 'playing' || g.state === 'inventory') {
          g.toggleInventory();
        } else if (g.state === 'paused') {
          g.togglePause();
          g.toggleInventory();
        }
      } else if (event.code === 'Escape') {
        event.preventDefault();
        if (g.state === 'playing' || g.state === 'paused') {
          g.togglePause();
        } else if (g.state === 'inventory') {
          g.toggleInventory();
        } else if (g.state === 'levelup') {
          // The dead demand a choice; Esc does not skip it.
        }
      } else if (event.code === 'KeyM') {
        this.ui.toggleMute();
      } else if (event.code === 'Digit1' || event.code === 'Digit2' || event.code === 'Digit3') {
        if (g.state === 'levelup') {
          const idx = Number(event.code.slice(-1)) - 1;
          const boon = g.choices[idx];
          if (boon) g.chooseBoon(boon.id);
        }
      } else if (event.code === 'Enter') {
        if (g.state === 'dead' || g.state === 'victory') this.ui.startRun();
      }
    });
    window.addEventListener('keyup', event => {
      if (MOVE_KEYS[event.code]) this.keys.delete(event.code);
    });
    window.addEventListener('blur', () => {
      this.keys.clear();
      this.resetJoystick();
    });
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && this.game.state === 'playing') this.game.togglePause();
    });

    const canvas = document.getElementById('game');
    canvas.addEventListener('pointerdown', event => this.startJoystick(event), { passive: false });
    canvas.addEventListener('pointermove', event => this.moveJoystick(event), { passive: false });
    canvas.addEventListener('pointerup', event => this.endJoystick(event), { passive: false });
    canvas.addEventListener('pointercancel', event => this.endJoystick(event), { passive: false });
    canvas.addEventListener('pointerleave', event => this.endJoystick(event), { passive: false });
  }

  isTouchLike(event) {
    return event.pointerType === 'touch' || event.pointerType === 'pen' || window.innerWidth < 800;
  }

  startJoystick(event) {
    if (this.game.state !== 'playing') return;
    if (!this.isTouchLike(event)) return;
    if (event.clientX > window.innerWidth * 0.72) return;
    event.preventDefault();
    this.joystick.active = true;
    this.joystick.id = event.pointerId;
    this.joystick.x = event.clientX;
    this.joystick.y = event.clientY;
    this.joystick.dx = 0;
    this.joystick.dy = 0;
    this.joyEl.classList.remove('hidden');
    this.joyEl.style.left = `${event.clientX - 59}px`;
    this.joyEl.style.top = `${event.clientY - 59}px`;
    this.joyEl.style.bottom = 'auto';
    this.knob.style.transform = 'translate(0px, 0px)';
    try { this.joyEl.setPointerCapture?.(event.pointerId); } catch { /* not supported */ }
  }

  moveJoystick(event) {
    if (!this.joystick.active || event.pointerId !== this.joystick.id) return;
    event.preventDefault();
    const dx = event.clientX - this.joystick.x;
    const dy = event.clientY - this.joystick.y;
    const len = Math.hypot(dx, dy);
    const max = 48;
    const scale = len > max ? max / len : 1;
    const kx = dx * scale;
    const ky = dy * scale;
    this.joystick.dx = dx / max;
    this.joystick.dy = dy / max;
    if (len > max) {
      this.joystick.dx = (dx / len);
      this.joystick.dy = (dy / len);
    }
    this.knob.style.transform = `translate(${kx}px, ${ky}px)`;
  }

  endJoystick(event) {
    if (!this.joystick.active) return;
    if (event && event.pointerId !== this.joystick.id) return;
    this.resetJoystick();
  }

  resetJoystick() {
    this.joystick.active = false;
    this.joystick.id = null;
    this.joystick.dx = 0;
    this.joystick.dy = 0;
    if (this.joyEl) {
      this.joyEl.classList.remove('hidden');
      this.joyEl.style.left = '';
      this.joyEl.style.top = '';
      this.joyEl.style.bottom = '';
    }
    if (this.knob) this.knob.style.transform = 'translate(0px, 0px)';
  }

  update() {
    let x = 0;
    let y = 0;
    for (const key of this.keys) {
      const vec = MOVE_KEYS[key];
      if (vec) { x += vec[0]; y += vec[1]; }
    }
    if (this.joystick.active) {
      x += this.joystick.dx;
      y += this.joystick.dy;
    }
    const len = Math.hypot(x, y);
    if (len > 1) { x /= len; y /= len; }
    this.game.input.x = x;
    this.game.input.y = y;
  }
}
