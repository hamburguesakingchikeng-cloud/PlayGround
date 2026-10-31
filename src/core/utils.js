// Utilidades matemáticas y de azar determinista.
export const TAU = Math.PI * 2;
export const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
export const lerp = (a, b, t) => a + (b - a) * t;
export const invLerp = (a, b, v) => (v - a) / (b - a || 1);
export const smoothstep = (a, b, v) => {
  const t = clamp(invLerp(a, b, v), 0, 1);
  return t * t * (3 - 2 * t);
};
export const dist = (ax, ay, bx, by) => Math.hypot(bx - ax, by - ay);
export const dist2 = (ax, ay, bx, by) => {
  const dx = bx - ax, dy = by - ay;
  return dx * dx + dy * dy;
};
export const angleDiff = (a, b) => {
  let d = (b - a + Math.PI) % TAU;
  if (d < 0) d += TAU;
  return d - Math.PI;
};
export const angleLerp = (a, b, t) => a + angleDiff(a, b) * t;
export const approach = (v, target, delta) => {
  if (v < target) return Math.min(v + delta, target);
  return Math.max(v - delta, target);
};
export const randRange = (rng, a, b) => a + rng() * (b - a);
export const pick = (rng, arr) => arr[Math.floor(rng() * arr.length) % arr.length];
export const shuffle = (rng, arr) => {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

export function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function hash2(x, y, seed = 0) {
  let h = Math.imul(x | 0, 374761393) ^ Math.imul(y | 0, 668265263) ^ Math.imul(seed | 0, 1442695041);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

function smooth(t) { return t * t * (3 - 2 * t); }

export function valueNoise(x, y, seed = 0) {
  const xi = Math.floor(x), yi = Math.floor(y);
  const xf = x - xi, yf = y - yi;
  const a = hash2(xi, yi, seed), b = hash2(xi + 1, yi, seed);
  const c = hash2(xi, yi + 1, seed), d = hash2(xi + 1, yi + 1, seed);
  const u = smooth(xf), v = smooth(yf);
  return lerp(lerp(a, b, u), lerp(c, d, u), v);
}

export function fbm(x, y, seed = 0, octaves = 4) {
  let value = 0, amp = 0.5, freq = 1, total = 0;
  for (let i = 0; i < octaves; i++) {
    value += valueNoise(x * freq, y * freq, seed + i * 101) * amp;
    total += amp;
    amp *= 0.5;
    freq *= 2;
  }
  return value / total;
}

export function formatTime(seconds) {
  const s = Math.max(0, Math.floor(seconds));
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), r = s % 60;
  return h > 0 ? `${h}:${String(m).padStart(2, '0')}:${String(r).padStart(2, '0')}` : `${m}:${String(r).padStart(2, '0')}`;
}

export function deepClone(obj) {
  if (typeof structuredClone === 'function') return structuredClone(obj);
  return JSON.parse(JSON.stringify(obj));
}

export function rectCircle(rect, cx, cy, r) {
  const nx = clamp(cx, rect.x, rect.x + rect.w);
  const ny = clamp(cy, rect.y, rect.y + rect.h);
  return dist2(nx, ny, cx, cy) <= r * r;
}

export function seededColor(seed, hueBase = 0, hueRange = 360, sat = 60, light = 55) {
  const h = (hueBase + hash2(seed, 7, 11) * hueRange) % 360;
  return `hsl(${h.toFixed(0)} ${sat}% ${light}%)`;
}

export class EventBus {
  constructor() { this.map = new Map(); }
  on(type, fn) {
    if (!this.map.has(type)) this.map.set(type, new Set());
    this.map.get(type).add(fn);
    return () => this.map.get(type)?.delete(fn);
  }
  emit(type, data) {
    const set = this.map.get(type);
    if (set) for (const fn of [...set]) { try { fn(data); } catch (e) { console.error(e); } }
    const all = this.map.get('*');
    if (all) for (const fn of [...all]) { try { fn({ type, data }); } catch (e) { console.error(e); } }
  }
}

// Interpolación de color hexadecimal sencilla.
export function hexToRgb(hex) {
  const h = hex.replace('#', '');
  const n = parseInt(h.length === 3 ? h.split('').map(c => c + c).join('') : h, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}
export function rgba(hex, a = 1) {
  const c = hexToRgb(hex);
  return `rgba(${c.r},${c.g},${c.b},${a})`;
}
export function mixHex(a, b, t) {
  const A = hexToRgb(a), B = hexToRgb(b);
  const c = (x, y) => Math.round(lerp(x, y, t)).toString(16).padStart(2, '0');
  return `#${c(A.r, B.r)}${c(A.g, B.g)}${c(A.b, B.b)}`;
}

export function makeCanvas(w, h) {
  const c = document.createElement('canvas');
  c.width = Math.max(1, Math.round(w));
  c.height = Math.max(1, Math.round(h));
  return c;
}

export function roundedRect(ctx, x, y, w, h, r) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

export function roman(n) {
  const map = [[10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']];
  let out = '';
  for (const [v, s] of map) while (n >= v) { out += s; n -= v; }
  return out;
}
