// Ruido de valor determinista y barato, suficiente para esculpir terreno de fantasía.
function hash2(ix, iz, seed) {
  let h = ix * 374761393 + iz * 668265263 + seed * 1442695040
  h = (h ^ (h >> 13)) * 1274126177
  h = h ^ (h >> 16)
  return (h >>> 0) / 4294967295
}

export function valueNoise(x, z, seed = 1) {
  const ix = Math.floor(x), iz = Math.floor(z)
  const fx = x - ix, fz = z - iz
  const ux = fx * fx * (3 - 2 * fx), uz = fz * fz * (3 - 2 * fz)
  const a = hash2(ix, iz, seed), b = hash2(ix + 1, iz, seed)
  const c = hash2(ix, iz + 1, seed), d = hash2(ix + 1, iz + 1, seed)
  return (a * (1 - ux) + b * ux) * (1 - uz) + (c * (1 - ux) + d * ux) * uz
}

export function fbm(x, z, octaves = 4, seed = 1) {
  let v = 0, amp = .5, freq = 1
  for (let i = 0; i < octaves; i++) {
    v += valueNoise(x * freq, z * freq, seed + i * 17) * amp
    amp *= .5
    freq *= 2.03
  }
  return v
}

export function ridged(x, z, octaves = 3, seed = 1) {
  let v = 0, amp = .55, freq = 1
  for (let i = 0; i < octaves; i++) {
    const n = 1 - Math.abs(valueNoise(x * freq, z * freq, seed + i * 31) * 2 - 1)
    v += n * n * amp
    amp *= .5
    freq *= 2.11
  }
  return v
}

export function hashString(str) {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619) }
  return h >>> 0
}
