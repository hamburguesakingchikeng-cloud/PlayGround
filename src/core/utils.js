export const TAU = Math.PI * 2;
export const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
export const lerp = (a, b, t) => a + (b - a) * t;
export const damp = (a, b, speed, dt) => lerp(a, b, 1 - Math.exp(-speed * dt));
export const sign = (v) => (v < 0 ? -1 : v > 0 ? 1 : 0);
export const dist = (ax, ay, bx, by) => Math.hypot(bx - ax, by - ay);
export const dist2 = (ax, ay, bx, by) => (bx - ax) ** 2 + (by - ay) ** 2;
export const angleTo = (ax, ay, bx, by) => Math.atan2(by - ay, bx - ax);
export const norm = (x, y) => { const l = Math.hypot(x, y) || 1; return { x: x / l, y: y / l }; };
export const approach = (v, target, step) => v < target ? Math.min(v + step, target) : Math.max(v - step, target);
export const rand = (a = 0, b = 1) => a + Math.random() * (b - a);
export const randInt = (a, b) => Math.floor(rand(a, b + 1));
export const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
export const chance = (p) => Math.random() < p;
export const easeOut = (t) => 1 - (1 - t) ** 3;
export const easeInOut = (t) => t < .5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
export const easeOutBack = (t) => 1 + 2.70158 * (t - 1) ** 3 + 1.70158 * (t - 1) ** 2;
export const smoothstep = (t) => t * t * (3 - 2 * t);
export const hash2 = (x, y, seed = 0) => {
  let h = x * 374761393 + y * 668265263 + seed * 1442695040;
  h = (h ^ (h >>> 13)) * 1274126177;
  h ^= h >>> 16;
  return ((h >>> 0) % 1000000) / 1000000;
};
export const valueNoise = (x, y, seed = 0) => {
  const xi = Math.floor(x), yi = Math.floor(y);
  const xf = x - xi, yf = y - yi;
  const u = smoothstep(xf), v = smoothstep(yf);
  const a = hash2(xi, yi, seed), b = hash2(xi + 1, yi, seed);
  const c = hash2(xi, yi + 1, seed), d = hash2(xi + 1, yi + 1, seed);
  return lerp(lerp(a, b, u), lerp(c, d, u), v);
};
export const fbm = (x, y, seed = 0, oct = 4) => {
  let v = 0, amp = .5, f = 1;
  for (let i = 0; i < oct; i++) { v += valueNoise(x * f, y * f, seed + i * 17) * amp; amp *= .5; f *= 2; }
  return v;
};
export const circleRect = (cx, cy, r, rx, ry, rw, rh) => {
  const nx = clamp(cx, rx, rx + rw), ny = clamp(cy, ry, ry + rh);
  return (cx - nx) ** 2 + (cy - ny) ** 2 < r * r;
};
export const rectOverlap = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
export const pointInRect = (px, py, r) => px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h;
export const formatNum = (n) => n >= 10000 ? `${(n / 1000).toFixed(1)}k` : `${Math.round(n)}`;
export const lerpAngle = (a, b, t) => {
  let d = ((b - a + Math.PI) % TAU + TAU) % TAU - Math.PI;
  return a + d * t;
};
export const hexToRgb = (hex) => {
  if (!hex || hex[0] !== '#') return { r: 200, g: 200, b: 200 };
  const h = hex.length === 4 ? '#' + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3] : hex;
  return { r: parseInt(h.slice(1, 3), 16), g: parseInt(h.slice(3, 5), 16), b: parseInt(h.slice(5, 7), 16) };
};
export const rgba = (hex, a = 1) => { const c = hexToRgb(hex); return `rgba(${c.r},${c.g},${c.b},${a})`; };
export const shade = (hex, amount) => {
  const c = hexToRgb(hex);
  const f = (v) => clamp(Math.round(v + (amount > 0 ? (255 - v) * amount : v * amount)), 0, 255);
  return `rgb(${f(c.r)},${f(c.g)},${f(c.b)})`;
};
export const seededRandom = (seed) => {
  let s = seed >>> 0;
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
};
export const shortKey = (x, y) => `${x},${y}`;
