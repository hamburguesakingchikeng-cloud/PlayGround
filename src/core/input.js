import { clamp } from './utils.js';

export class Input {
  constructor(canvas) {
    this.canvas = canvas;
    this.keys = new Set();
    this.enabled = false;
    this.held = new Set();
    this.listeners = { action: [], camera: [], zoom: [], pause: [], any: [] };
    this.dragging = false;
    this.dragMoved = false;
    this.lastPointer = { x: 0, y: 0 };
    this.dragStart = { x: 0, y: 0 };
    this.joystick = { active: false, x: 0, y: 0, id: null };
    this.isTouch = matchMedia('(pointer: coarse)').matches || navigator.maxTouchPoints > 0;
    if (this.isTouch) document.body.classList.add('touch');
    this.bind();
  }

  on(type, fn) { this.listeners[type]?.push(fn); return this; }
  emit(type, ...args) { for (const fn of this.listeners[type] || []) fn(...args); }

  setEnabled(v) {
    this.enabled = v;
    if (!v) {
      this.held.clear();
      this.joystick.active = false;
      this.joystick.x = 0; this.joystick.y = 0;
      this.resetJoystickVisual();
    }
  }

  bind() {
    window.addEventListener('keydown', (e) => {
      if (['Tab', 'Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) e.preventDefault();
      if (e.repeat) return;
      this.keys.add(e.code);
      this.emit('any', e.code);
      if (!this.enabled) {
        if (e.code === 'Escape') this.emit('pause');
        return;
      }
      const action = this.keyAction(e.code);
      if (action) {
        this.held.add(action);
        this.emit('action', action, 'down');
      }
      if (e.code === 'Tab' || e.code === 'Escape') this.emit('pause');
      if (e.code === 'KeyM') this.emit('action', 'map', 'down');
      if (e.code === 'KeyT') this.emit('action', 'lock', 'down');
    });
    window.addEventListener('keyup', (e) => {
      this.keys.delete(e.code);
      const action = this.keyAction(e.code);
      if (action) {
        this.held.delete(action);
        this.emit('action', action, 'up');
      }
    });
    window.addEventListener('blur', () => {
      this.keys.clear();
      this.held.clear();
    });

    this.canvas.addEventListener('pointerdown', (e) => {
      if (!this.enabled) return;
      if (e.pointerType === 'touch' && e.clientX < window.innerWidth * 0.36 && e.clientY > window.innerHeight * 0.55) return;
      if (e.button === 2) {
        this.held.add('block');
        this.emit('action', 'block', 'down');
        return;
      }
      if (e.button !== 0) return;
      this.dragging = true;
      this.dragMoved = false;
      this.lastPointer = { x: e.clientX, y: e.clientY };
      this.dragStart = { x: e.clientX, y: e.clientY };
      this.canvas.setPointerCapture?.(e.pointerId);
    });
    window.addEventListener('pointermove', (e) => {
      if (!this.dragging) return;
      const dx = e.clientX - this.lastPointer.x;
      const dy = e.clientY - this.lastPointer.y;
      this.lastPointer = { x: e.clientX, y: e.clientY };
      if (Math.hypot(e.clientX - this.dragStart.x, e.clientY - this.dragStart.y) > 5) this.dragMoved = true;
      if (this.dragMoved) this.emit('camera', dx, dy);
    });
    window.addEventListener('pointerup', (e) => {
      if (e.button === 2) {
        this.held.delete('block');
        this.emit('action', 'block', 'up');
      }
      if (!this.dragging) return;
      this.dragging = false;
      if (!this.dragMoved && this.enabled) this.emit('action', 'attack', 'down');
    });
    this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    this.canvas.addEventListener('wheel', (e) => {
      if (!this.enabled) return;
      e.preventDefault();
      this.emit('zoom', clamp(e.deltaY * 0.002, -0.4, 0.4));
    }, { passive: false });

    document.addEventListener('pointerdown', (e) => {
      const btn = e.target.closest?.('[data-action]');
      if (!btn || !this.enabled) return;
      if (btn.closest('#mobile-controls') || btn.closest('.ability-cluster')) {
        e.preventDefault();
        e.stopPropagation();
        const action = btn.dataset.action;
        this.held.add(action);
        this.emit('action', action, 'down');
      }
    }, { capture: true });
    document.addEventListener('pointerup', (e) => {
      const btn = e.target.closest?.('[data-action]');
      if (!btn) return;
      const action = btn.dataset.action;
      if (this.held.has(action)) {
        this.held.delete(action);
        this.emit('action', action, 'up');
      }
    });
    document.addEventListener('pointercancel', () => {
      for (const a of [...this.held]) {
        this.held.delete(a);
        this.emit('action', a, 'up');
      }
    });

    this.bindJoystick();
  }

  keyAction(code) {
    return {
      Space: 'dodge', ShiftLeft: 'sprint', ShiftRight: 'sprint',
      KeyE: 'interact', KeyQ: 'resonance', KeyF: 'companion', KeyH: 'potion',
      KeyR: 'heavy', KeyT: 'lock', Tab: 'menu', Escape: 'pause',
    }[code] || null;
  }

  getMove() {
    let x = 0, z = 0;
    if (this.keys.has('KeyW') || this.keys.has('ArrowUp')) z -= 1;
    if (this.keys.has('KeyS') || this.keys.has('ArrowDown')) z += 1;
    if (this.keys.has('KeyA') || this.keys.has('ArrowLeft')) x -= 1;
    if (this.keys.has('KeyD') || this.keys.has('ArrowRight')) x += 1;
    if (this.joystick.active) { x += this.joystick.x; z += this.joystick.y; }
    const len = Math.hypot(x, z);
    if (len > 1) { x /= len; z /= len; }
    return { x, z };
  }

  isSprinting() { return this.held.has('sprint') || this.keys.has('ShiftLeft') || this.keys.has('ShiftRight'); }
  isBlocking() { return this.held.has('block'); }

  bindJoystick() {
    const zone = document.getElementById('joystick-zone');
    const knob = document.getElementById('joystick-knob');
    if (!zone || !knob) return;
    const reset = () => {
      this.joystick.active = false; this.joystick.id = null;
      this.joystick.x = 0; this.joystick.y = 0;
      knob.style.transform = 'translate(-50%, -50%)';
    };
    zone.addEventListener('pointerdown', (e) => {
      if (!this.enabled) return;
      e.preventDefault(); e.stopPropagation();
      this.joystick.active = true; this.joystick.id = e.pointerId;
      zone.setPointerCapture?.(e.pointerId);
      this.updateJoystick(e, zone, knob);
    });
    zone.addEventListener('pointermove', (e) => {
      if (!this.joystick.active || e.pointerId !== this.joystick.id) return;
      e.preventDefault();
      this.updateJoystick(e, zone, knob);
    });
    zone.addEventListener('pointerup', reset);
    zone.addEventListener('pointercancel', reset);
    zone.addEventListener('lostpointercapture', reset);
  }

  updateJoystick(e, zone, knob) {
    const rect = zone.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const max = rect.width * 0.32;
    let dx = e.clientX - cx, dy = e.clientY - cy;
    const len = Math.hypot(dx, dy);
    if (len > max) { dx = dx / len * max; dy = dy / len * max; }
    this.joystick.x = dx / max;
    this.joystick.y = dy / max;
    knob.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
  }

  resetJoystickVisual() {
    const knob = document.getElementById('joystick-knob');
    if (knob) knob.style.transform = 'translate(-50%, -50%)';
  }
}
