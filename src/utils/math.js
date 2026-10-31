export const TAU = Math.PI * 2
export const clamp = (v, a, b) => Math.max(a, Math.min(b, v))
export const lerp = (a, b, t) => a + (b - a) * t
export const invLerp = (a, b, v) => (v - a) / (b - a)
export const smoothstep = (a, b, v) => {
  const t = clamp((v - a) / (b - a), 0, 1)
  return t * t * (3 - 2 * t)
}
export const damp = (a, b, lambda, dt) => lerp(a, b, 1 - Math.exp(-lambda * dt))
export const dampAngle = (a, b, lambda, dt) => {
  let d = ((b - a + Math.PI) % TAU + TAU) % TAU - Math.PI
  return a + d * (1 - Math.exp(-lambda * dt))
}
export const rand = (min = 0, max = 1) => min + Math.random() * (max - min)
export const randInt = (min, max) => Math.floor(rand(min, max + 1))
export const pick = arr => arr[Math.floor(Math.random() * arr.length)]
export const chance = p => Math.random() < p
export const dist2 = (ax, az, bx, bz) => Math.hypot(ax - bx, az - bz)
export const easeOutCubic = t => 1 - Math.pow(1 - t, 3)
export const easeInOutCubic = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
export const easeOutBack = t => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2) }
export function formatNumber(n) { return Math.round(n).toLocaleString('es-ES') }
export function formatTime(seconds) {
  const h = Math.floor(seconds / 3600), m = Math.floor((seconds % 3600) / 60)
  return h > 0 ? `${h} h ${m} min` : `${m} min`
}
export function angleDelta(a, b) {
  return ((b - a + Math.PI) % TAU + TAU) % TAU - Math.PI
}
export function randomAround(cx, cz, radius) {
  const a = rand(0, TAU), r = Math.sqrt(Math.random()) * radius
  return [cx + Math.cos(a) * r, cz + Math.sin(a) * r]
}
