import * as THREE from 'three';

export const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
export const lerp = (a, b, t) => a + (b - a) * t;
export const invLerp = (a, b, v) => (v - a) / (b - a);
export const smoothstep = (a, b, v) => {
  const t = clamp((v - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};
export const damp = (a, b, lambda, dt) => lerp(a, b, 1 - Math.exp(-lambda * dt));
export const angleDelta = (a, b) => {
  let d = (b - a + Math.PI) % (Math.PI * 2) - Math.PI;
  if (d < -Math.PI) d += Math.PI * 2;
  return d;
};
export const dampAngle = (a, b, lambda, dt) => a + angleDelta(a, b) * (1 - Math.exp(-lambda * dt));
export const dist2D = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);
export const distSq2D = (a, b) => (a.x - b.x) ** 2 + (a.z - b.z) ** 2;

export function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function hash2(x, y, seed = 0) {
  let h = x * 374761393 + y * 668265263 + seed * 1442695041;
  h = (h ^ (h >>> 13)) * 1274126177;
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

function noiseValue(x, y, seed) {
  const xi = Math.floor(x), yi = Math.floor(y);
  const xf = x - xi, yf = y - yi;
  const u = xf * xf * (3 - 2 * xf);
  const v = yf * yf * (3 - 2 * yf);
  const a = hash2(xi, yi, seed);
  const b = hash2(xi + 1, yi, seed);
  const c = hash2(xi, yi + 1, seed);
  const d = hash2(xi + 1, yi + 1, seed);
  return lerp(lerp(a, b, u), lerp(c, d, u), v);
}

export function noise2D(x, y, seed = 7) {
  let n = 0, amp = 0.55, freq = 1;
  for (let i = 0; i < 4; i++) {
    n += noiseValue(x * freq, y * freq, seed + i * 19) * amp;
    freq *= 2.03;
    amp *= 0.5;
  }
  return n;
}

export function fbm(x, y, seed = 3) {
  return noise2D(x, y, seed) * 2 - 1;
}

export function formatTime(seconds) {
  const s = Math.max(0, Math.floor(seconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  return h > 0 ? `${h}h ${String(m).padStart(2, '0')}m` : `${m}m ${String(s % 60).padStart(2, '0')}s`;
}

export function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }
export function easeInOutCubic(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }

export function makeCanvas(w, h) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  return c;
}

export function textureFromCanvas(canvas) {
  const t = new THREE.CanvasTexture(canvas);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

export function radialTexture(size = 128, inner = 'rgba(255,255,255,1)', outer = 'rgba(255,255,255,0)') {
  const c = makeCanvas(size, size);
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, inner);
  g.addColorStop(0.35, inner);
  g.addColorStop(1, outer);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  return textureFromCanvas(c);
}

export function runeTexture(size = 128, color = '#ffe5a8') {
  const c = makeCanvas(size, size);
  const ctx = c.getContext('2d');
  ctx.clearRect(0, 0, size, size);
  ctx.strokeStyle = color;
  ctx.lineWidth = 4;
  ctx.shadowColor = color;
  ctx.shadowBlur = 18;
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size * 0.32, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(size * 0.5, size * 0.18);
  ctx.lineTo(size * 0.5, size * 0.82);
  ctx.moveTo(size * 0.34, size * 0.38);
  ctx.lineTo(size * 0.66, size * 0.38);
  ctx.stroke();
  return textureFromCanvas(c);
}

export function labelTexture(text, opts = {}) {
  const {
    color = '#ffe6ab', bg = 'rgba(5,8,12,0.72)', font = '700 28px Alegreya Sans, sans-serif',
    pad = 18, border = 'rgba(228,191,120,0.4)', width = 512, height = 96,
  } = opts;
  const c = makeCanvas(width, height);
  const ctx = c.getContext('2d');
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = bg;
  ctx.beginPath();
  ctx.roundRect(2, 2, width - 4, height - 4, 8);
  ctx.fill();
  ctx.strokeStyle = border;
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = color;
  ctx.font = font;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, width / 2, height / 2 + 2);
  return textureFromCanvas(c);
}

export function makeSprite(texture, scale = 1) {
  const mat = new THREE.SpriteMaterial({ map: texture, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
  const sprite = new THREE.Sprite(mat);
  sprite.scale.set(scale, scale, 1);
  return sprite;
}

export function disposeObject(root) {
  if (!root) return;
  const textures = new Set();
  root.traverse((obj) => {
    if (obj.geometry) obj.geometry.dispose();
    const mats = Array.isArray(obj.material) ? obj.material : (obj.material ? [obj.material] : []);
    for (const mat of mats) {
      for (const key of Object.keys(mat)) {
        const val = mat[key];
        if (val && val.isTexture) textures.add(val);
      }
      mat.dispose?.();
    }
  });
  for (const t of textures) t.dispose?.();
}

export function projectToScreen(pos, camera, width, height) {
  const v = pos.clone().project(camera);
  return {
    x: (v.x * 0.5 + 0.5) * width,
    y: (-v.y * 0.5 + 0.5) * height,
    visible: v.z > -1 && v.z < 1,
  };
}

export function svgPortrait({ skin = '#e9c9a8', hair = '#d9d5cc', outfit = '#3e7d78', trim = '#e4bf78', eyes = '#91e7df', hood = false, rune = false, gender = 'hero' }) {
  const hoodShape = hood
    ? `<path d="M42 118 C34 70 48 30 100 24 C152 30 166 70 158 118 L142 190 L58 190 Z" fill="#10151d"/><path d="M50 110 C50 70 62 40 100 34 C138 40 150 70 150 110 C132 92 68 92 50 110Z" fill="${outfit}"/>`
    : '';
  return `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="pg" cx="50%" cy="32%" r="70%"><stop offset="0" stop-color="${outfit}" stop-opacity=".55"/><stop offset="1" stop-color="#070b10"/></radialGradient>
      <linearGradient id="cl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${outfit}"/><stop offset="1" stop-color="#0b1016"/></linearGradient>
      <linearGradient id="hr" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${hair}"/><stop offset="1" stop-color="${hair}" stop-opacity=".45"/></linearGradient>
      <filter id="glow"><feGaussianBlur stdDeviation="2.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    </defs>
    <rect width="200" height="200" fill="url(#pg)"/>
    <circle cx="100" cy="90" r="62" fill="none" stroke="${trim}" stroke-opacity=".12"/>
    ${hoodShape}
    <path d="M40 200 C42 150 66 132 100 132 C134 132 158 150 160 200Z" fill="url(#cl)" stroke="${trim}" stroke-opacity=".28"/>
    <path d="M66 142 C78 160 122 160 134 142 L128 200 L72 200Z" fill="${trim}" fill-opacity=".1"/>
    <path d="M100 132 L100 196" stroke="${trim}" stroke-opacity=".25"/>
    <path d="M72 48 C72 22 128 22 128 48 L126 88 C126 120 108 136 100 138 C92 136 74 120 74 88Z" fill="${skin}"/>
    <path d="M70 74 C66 44 80 26 100 26 C120 26 134 44 130 74 C124 58 114 50 100 50 C86 50 76 58 70 74Z" fill="url(#hr)"/>
    <path d="M70 66 C60 72 58 94 64 110 C68 94 70 82 74 76Z" fill="url(#hr)"/>
    <path d="M130 66 C140 72 142 94 136 110 C132 94 130 82 126 76Z" fill="url(#hr)"/>
    <path d="M100 40 C84 40 76 54 78 70 C82 60 92 54 100 54 C108 54 118 60 122 70 C124 54 116 40 100 40Z" fill="${hair}" fill-opacity=".8"/>
    <path d="M84 88 C88 85 92 85 95 88" stroke="#2b2226" stroke-width="2.2" fill="none" stroke-linecap="round"/>
    <path d="M105 88 C108 85 112 85 116 88" stroke="#2b2226" stroke-width="2.2" fill="none" stroke-linecap="round"/>
    <ellipse cx="89" cy="92" rx="2.4" ry="3" fill="${eyes}" filter="url(#glow)"/>
    <ellipse cx="111" cy="92" rx="2.4" ry="3" fill="${eyes}" filter="url(#glow)"/>
    <path d="M96 111 C99 113 101 113 104 111" stroke="#7e4f4a" stroke-width="1.8" fill="none" stroke-linecap="round"/>
    <path d="M76 66 C82 52 90 46 100 46 C110 46 118 52 124 66" stroke="${trim}" stroke-width="2.5" fill="none" stroke-opacity=".85"/>
    <path d="M100 52 L100 60" stroke="${trim}" stroke-width="2"/>
    ${rune ? `<path d="M100 156 L108 168 L100 180 L92 168Z" fill="${trim}" fill-opacity=".8" filter="url(#glow)"/>` : ''}
    <rect width="200" height="200" fill="none" stroke="${trim}" stroke-opacity=".25"/>
  </svg>`;
}

export function portraitFor(id, hero) {
  if (id === 'lira') return svgPortrait({ skin: '#8d5c40', hair: '#d7d4ca', outfit: '#2d5c52', trim: '#e4bf78', eyes: '#a9f0d7', rune: true });
  if (id === 'orin') return svgPortrait({ skin: '#9a6a50', hair: '#d0cec7', outfit: '#63362e', trim: '#c48d54', eyes: '#ffbe75' });
  if (id === 'testigo') return svgPortrait({ skin: '#7a7690', hair: '#d9d4ff', outfit: '#282b58', trim: '#bca3ee', eyes: '#d9ccff', hood: true, rune: true });
  if (id === 'cero') return svgPortrait({ skin: '#4c3f45', hair: '#15151d', outfit: '#2b1c29', trim: '#e0b16b', eyes: '#ff9e63', hood: true, rune: true });
  if (id === 'player' || id === 'hero') {
    return svgPortrait({
      skin: hero?.skin || '#e9c9a8', hair: hero?.hairColor || '#d9d5cc',
      outfit: hero?.outfit?.primary || '#3e7d78', trim: hero?.outfit?.trim || '#e4bf78', eyes: '#a9ece8',
    });
  }
  return svgPortrait({});
}

export function elementColor(el) {
  return { Luz: '#ffe0a0', Sombra: '#a99bd6', Tierra: '#9cc08b', Fuego: '#ff9b57', Viento: '#a7e3dc', Cosmos: '#bca3ee' }[el] || '#e4bf78';
}
