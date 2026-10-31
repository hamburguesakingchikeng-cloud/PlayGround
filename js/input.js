/* Entrada unificada: teclado + pantalla táctil + ratón */
(function () {
  const EG = window.EG;

  const KEYMAP = {
    ArrowUp: 'up', Up: 'up', w: 'up', W: 'up',
    ArrowDown: 'down', Down: 'down', s: 'down', S: 'down',
    ArrowLeft: 'left', Left: 'left', a: 'left', A: 'left',
    ArrowRight: 'right', Right: 'right', d: 'right', D: 'right',
    Enter: 'ok', ' ': 'ok', z: 'ok', Z: 'ok', e: 'ok', E: 'ok',
    Escape: 'back', x: 'back', X: 'back', Backspace: 'back',
    m: 'menu', M: 'menu', Tab: 'menu',
  };

  const Input = {
    keys: new Set(),
    just: new Set(),
    taps: [],
    ptrs: new Map(),
    onGesture: null,
    canvas: null,

    bind(canvas) {
      this.canvas = canvas;
      window.addEventListener('keydown', (e) => {
        const action = KEYMAP[e.key];
        if (!action) return;
        if (e.key === ' ' || e.key === 'Tab' || e.key.startsWith('Arrow')) e.preventDefault();
        if (!this.keys.has(action)) this.just.add(action);
        this.keys.add(action);
        this.gesture();
      });
      window.addEventListener('keyup', (e) => {
        const action = KEYMAP[e.key];
        if (action) this.keys.delete(action);
      });
      window.addEventListener('blur', () => {
        this.keys.clear();
        this.ptrs.clear();
      });

      const rectOf = () => canvas.getBoundingClientRect();
      const point = (e) => {
        const r = rectOf();
        return { x: e.clientX - r.left, y: e.clientY - r.top, id: e.pointerId };
      };

      canvas.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        const p = point(e);
        this.ptrs.set(p.id, p);
        this.taps.push({ x: p.x, y: p.y, id: p.id });
        try { canvas.setPointerCapture(p.id); } catch (err) { /* noop */ }
        this.gesture();
        if (this.gesturePulse) this.gesturePulse();
      }, { passive: false });

      canvas.addEventListener('pointermove', (e) => {
        const p = this.ptrs.get(e.pointerId);
        if (!p) return;
        const q = point(e);
        p.x = q.x; p.y = q.y;
      });

      const release = (e) => {
        this.ptrs.delete(e.pointerId);
      };
      canvas.addEventListener('pointerup', release);
      canvas.addEventListener('pointercancel', release);
      canvas.addEventListener('lostpointercapture', release);
      canvas.addEventListener('contextmenu', (e) => e.preventDefault());
      document.addEventListener('contextmenu', (e) => e.preventDefault());
    },

    gesture() {
      if (this.onGesture) this.onGesture();
    },

    down(action) {
      return this.keys.has(action);
    },
    pressed(action) {
      return this.just.has(action);
    },
    tapAt(x, y, rect) {
      return x >= rect.x && y >= rect.y && x <= rect.x + rect.w && y <= rect.y + rect.h;
    },
    firstTapIn(rect) {
      return this.taps.find((t) => this.tapAt(t.x, t.y, rect)) || null;
    },
    heldIn(rect) {
      for (const p of this.ptrs.values()) {
        if (this.tapAt(p.x, p.y, rect)) return p;
      }
      return null;
    },
    heldDirection() {
      if (this.down('up')) return 'up';
      if (this.down('down')) return 'down';
      if (this.down('left')) return 'left';
      if (this.down('right')) return 'right';
      return null;
    },
    endFrame() {
      this.just.clear();
      this.taps.length = 0;
    },
    reset() {
      this.keys.clear();
      this.ptrs.clear();
      this.taps.length = 0;
      this.just.clear();
    },
  };

  EG.Input = Input;
})();
