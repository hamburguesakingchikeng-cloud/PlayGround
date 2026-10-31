/* La Espada Celestial — utilidades comunes */
(function () {
  const EG = (window.EG = window.EG || {});

  EG.clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  EG.lerp = (a, b, t) => a + (b - a) * t;
  EG.rnd = (a, b) => (b === undefined ? Math.random() * (a === undefined ? 1 : a) : a + Math.random() * (b - a));
  EG.rndi = (a, b) => Math.floor(a + Math.random() * (b - a + 1));
  EG.pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  EG.chance = (p) => Math.random() < p;
  EG.dist = (x1, y1, x2, y2) => Math.hypot(x2 - x1, y2 - y1);
  EG.easeOut = (t) => 1 - Math.pow(1 - EG.clamp(t, 0, 1), 3);
  EG.fmt = (n) => Math.round(n).toLocaleString('es-ES');

  EG.shuffle = (arr) => {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  EG.pad2 = (n) => String(n).padStart(2, '0');

  EG.clock = (seconds) => {
    const s = Math.floor(seconds);
    return EG.pad2(Math.floor(s / 3600)) + ':' + EG.pad2(Math.floor((s % 3600) / 60)) + ':' + EG.pad2(s % 60);
  };

  // Guardado local tolerante a fallos (modo privado, cuota, etc.)
  const PREFIX = 'lec.';
  EG.store = {
    get(key, fallback) {
      try {
        const raw = localStorage.getItem(PREFIX + key);
        return raw ? JSON.parse(raw) : fallback;
      } catch (err) {
        return fallback;
      }
    },
    set(key, value) {
      try {
        localStorage.setItem(PREFIX + key, JSON.stringify(value));
        return true;
      } catch (err) {
        return false;
      }
    },
    remove(key) {
      try { localStorage.removeItem(PREFIX + key); } catch (err) { /* noop */ }
    },
  };

  EG.textWrap = (ctx, text, maxWidth) => {
    const words = String(text).split(/\s+/);
    const lines = [];
    let line = '';
    for (const word of words) {
      const test = line ? line + ' ' + word : word;
      if (ctx.measureText(test).width > maxWidth && line) {
        lines.push(line);
        line = word;
      } else {
        line = test;
      }
    }
    if (line) lines.push(line);
    return lines;
  };

  EG.roundRect = (ctx, x, y, w, h, r) => {
    const rr = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + rr, y);
    ctx.arcTo(x + w, y, x + w, y + h, rr);
    ctx.arcTo(x + w, y + h, x, y + h, rr);
    ctx.arcTo(x, y + h, x, y, rr);
    ctx.arcTo(x, y, x + w, y, rr);
    ctx.closePath();
  };

  EG.alpha = (hex, a) => {
    const h = hex.replace('#', '');
    const n = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16);
    return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
  };
})();
