// Retratos vectoriales originales, generados sin imágenes externas.
const hex = n => '#' + Number(n).toString(16).padStart(6, '0')
const shade = (n, f = .65) => {
  const r = Math.floor(((n >> 16) & 255) * f), g = Math.floor(((n >> 8) & 255) * f), b = Math.floor((n & 255) * f)
  return `rgb(${r},${g},${b})`
}

const STYLES = {
  iria: { hair: 'long', elder: true, accessory: 'circlet', eyes: 'calm', mouth: 'soft', cape: true },
  tovin: { hair: 'bald', beard: true, accessory: 'band', eyes: 'squint', mouth: 'grin', broad: true },
  nara: { hair: 'braid', hood: true, paint: true, accessory: 'leaf', eyes: 'sharp', mouth: 'soft' },
  mera: { hair: 'bun', veil: true, accessory: 'flower', eyes: 'calm', mouth: 'soft' },
  bruno: { hair: 'short', beard: true, hat: true, eyes: 'squint', mouth: 'smile', broad: true },
  lia: { hair: 'twintails', child: true, accessory: 'flower', eyes: 'big', mouth: 'grin' },
  kaelen: { hair: 'short', scar: true, pauldron: true, eyes: 'sharp', mouth: 'flat' },
  vesna: { hair: 'scarf', earrings: true, eyes: 'sharp', mouth: 'smirk' },
  seraphine: { hair: 'veil', glow: true, accessory: 'halo', eyes: 'glow', mouth: 'soft' },
  player: { hair: 'short', eyes: 'determined', mouth: 'flat' }
}

export function portraitSVG(seed = 'player', colors = {}, appearance = {}, opts = {}) {
  const s = STYLES[seed] || STYLES.player
  const skin = colors.skin ?? appearance.skin ?? 0xd2a47e
  const hair = colors.hair ?? appearance.hairColor ?? 0x3a2a24
  const outfit = colors.outfit ?? appearance.outfit ?? 0x45526d
  const trim = colors.trim ?? appearance.trim ?? 0xd6b46e
  const hairStyle = appearance.hairStyle ?? s.hair
  const id = Math.random().toString(36).slice(2, 8)
  const skinL = shade(skin, 1.12), skinD = shade(skin, .78)
  const hairL = shade(hair, 1.25), hairD = shade(hair, .65)
  const outL = shade(outfit, 1.22), outD = shade(outfit, .72)
  const trimHex = hex(trim)

  const eyeColor = s.eyes === 'glow' ? '#dff6ff' : s.eyes === 'sharp' ? '#e7d9b9' : '#2b2522'
  const eyeGlow = s.eyes === 'glow' ? `<circle cx="39" cy="57" r="4.2" fill="#bdefff" opacity=".35"/><circle cx="61" cy="57" r="4.2" fill="#bdefff" opacity=".35"/>` : ''

  let hairPath = ''
  if (hairStyle === 'long' || hairStyle === 'veil') {
    hairPath = `<path d="M27 49c-2-19 8-31 23-31s25 12 23 31c-1 11-3 24-7 34-5-9-8-20-9-28-3 7-10 10-14 10s-11-3-14-10c-1 8-4 19-9 28-4-10-6-23-7-34z" fill="url(#hair${id})"/>`
  } else if (hairStyle === 'bald') {
    hairPath = `<path d="M29 47c2-11 8-17 15-18 3 5 1 9-3 12-2 3-2 8-1 12z" fill="url(#hair${id})" opacity=".5"/><path d="M72 47c-2-11-8-17-15-18-3 5-1 9 3 12 2 3 2 8 1 12z" fill="url(#hair${id})" opacity=".5"/>`
  } else if (hairStyle === 'bun') {
    hairPath = `<circle cx="50" cy="27" r="11" fill="url(#hair${id})"/><path d="M30 49c0-16 8-26 20-26s20 10 20 26c0 7-2 12-4 16-3-8-5-14-8-19-3 5-9 7-14 7s-10-3-14-7c-2 5-5 11-7 19-2-4-3-9-3-16z" fill="url(#hair${id})"/>`
  } else if (hairStyle === 'braid') {
    hairPath = `<path d="M30 48c0-17 8-27 20-27s20 10 20 27c0 8-2 15-5 20-3-9-6-16-9-20-3 5-9 8-14 8s-11-3-14-8c-2 5-5 12-7 20-2-6-3-13-3-20z" fill="url(#hair${id})"/><path d="M27 63c6 9 7 20 4 33 5-3 8-8 8-14 2 6 2 11 0 17 6-5 8-13 6-22z" fill="url(#hair${id})"/>`
  } else if (hairStyle === 'twintails') {
    hairPath = `<path d="M31 50c0-17 8-27 19-27s20 10 19 27c0 6-2 12-4 16-3-8-5-13-8-18-3 5-9 7-14 7s-10-2-13-7c-3 5-5 11-7 19-1-5-2-11-2-17z" fill="url(#hair${id})"/><ellipse cx="24" cy="66" rx="8" ry="19" fill="url(#hair${id})" transform="rotate(14 24 66)"/><ellipse cx="76" cy="66" rx="8" ry="19" fill="url(#hair${id})" transform="rotate(-14 76 66)"/>`
  } else if (hairStyle === 'scarf') {
    hairPath = `<path d="M29 47c6-14 13-20 21-20s15 6 21 20c-5 4-9 2-11-3-5 4-8 5-10 5s-5-1-10-5c-2 5-6 7-11 3z" fill="url(#hair${id})"/><path d="M25 43c6-6 12-8 18-10 3 7 11 10 14 10s11-4 14-10c6 2 12 5 18 11-7 4-12 6-16 7-6-4-12-6-16-6s-10 2-16 6c-4-1-9-3-16-8z" fill="${outL}"/>`
  } else {
    hairPath = `<path d="M30 48c0-18 8-28 20-28s20 10 20 28c0 7-2 14-5 19-2-9-5-16-8-21-4 5-9 7-14 7s-10-2-14-7c-2 5-5 12-7 21-2-5-3-12-3-19z" fill="url(#hair${id})"/>`
  }

  const hood = s.hood ? `<path d="M18 92c2-26 13-45 32-45s30 19 32 45c-9-9-20-14-32-14s-23 5-32 14z" fill="${outD}"/><path d="M24 88c4-20 12-33 26-33s22 13 26 33c-7-7-16-10-26-10s-19 3-26 10z" fill="${outL}" opacity=".7"/>` : ''
  const veil = s.veil ? `<path d="M23 44c4-22 16-33 27-33s23 11 27 33c-6 5-12 7-18 6-3 7-6 10-9 10s-6-3-9-10c-6 1-12-1-18-6z" fill="#e8e2ef" opacity=".24"/>` : ''
  const hat = s.hat ? `<path d="M25 42c8-9 18-13 25-13s17 4 25 13c-7 5-16 7-25 7s-18-2-25-7z" fill="${outD}"/><path d="M22 43c10 4 46 4 56 0-4 6-14 9-28 9s-24-3-28-9z" fill="${trimHex}" opacity=".55"/>` : ''
  const beard = s.beard ? `<path d="M36 70c1 10 6 17 14 19 8-2 13-9 14-19-4 5-9 7-14 7s-10-2-14-7z" fill="url(#hair${id})"/><path d="M36 70c4 4 9 6 14 6s10-2 14-6" stroke="${hairD}" stroke-width=".8" fill="none"/>` : ''
  const scar = s.scar ? `<path d="M57 45l-3 16" stroke="#b76a62" stroke-width="1.6" opacity=".8"/><path d="M56 49l5 3M55 55l5 3" stroke="#d08b82" stroke-width="1" opacity=".7"/>` : ''
  const paint = s.paint ? `<path d="M32 60c4-3 8-3 11 0-2 5-4 7-5 7s-4-2-6-7z" fill="#7fbf8a" opacity=".5"/><path d="M66 60c-4-3-8-3-11 0 2 5 4 7 5 7s4-2 6-7z" fill="#7fbf8a" opacity=".5"/>` : ''
  const circlet = s.accessory === 'circlet' ? `<path d="M33 38c8-4 26-4 34 0" stroke="${trimHex}" stroke-width="1.6" fill="none"/><path d="M50 32l3 6-3 4-3-4z" fill="${trimHex}"/>` : ''
  const band = s.accessory === 'band' ? `<path d="M31 40c9-5 29-5 38 0" stroke="${trimHex}" stroke-width="2.4" fill="none" opacity=".8"/>` : ''
  const leaf = s.accessory === 'leaf' ? `<path d="M69 37c5-7 11-7 13-5-2 6-6 9-13 5z" fill="${trimHex}" opacity=".9"/>` : ''
  const flower = s.accessory === 'flower' ? `<circle cx="70" cy="40" r="3" fill="${trimHex}"/><circle cx="74" cy="37" r="2.4" fill="#f2d9a0"/><circle cx="66" cy="37" r="2.4" fill="#f2d9a0"/>` : ''
  const halo = s.accessory === 'halo' ? `<ellipse cx="50" cy="21" rx="21" ry="5" fill="none" stroke="${trimHex}" stroke-width="1.4" opacity=".8"/><ellipse cx="50" cy="21" rx="26" ry="7" fill="none" stroke="${trimHex}" stroke-width=".5" opacity=".3"/>` : ''
  const earrings = s.earrings ? `<circle cx="30" cy="64" r="2" fill="${trimHex}"/><circle cx="70" cy="64" r="2" fill="${trimHex}"/><path d="M30 66v5M70 66v5" stroke="${trimHex}" stroke-width="1"/>` : ''
  const pauldron = s.pauldron ? `<path d="M16 96c2-12 7-19 15-21l6 12c-7 2-12 5-14 12z" fill="${outD}"/><path d="M18 94c3-8 7-12 13-14" stroke="${trimHex}" stroke-width="1" opacity=".7"/>` : ''
  const glow = s.glow ? `<circle cx="50" cy="55" r="34" fill="url(#glow${id})"/>` : ''
  const elder = s.elder ? `<path d="M40 71c2 3 5 4 6 4M60 71c-2 3-5 4-6 4" stroke="${skinD}" stroke-width=".7" opacity=".6"/><path d="M38 47c3-2 6-2 8 0M54 47c3-2 6-2 8 0" stroke="${hairD}" stroke-width=".8" opacity=".6"/>` : ''

  return `<svg viewBox="0 0 100 120" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Retrato">
  <defs>
    <radialGradient id="bg${id}" cx="50%" cy="34%" r="70%"><stop offset="0" stop-color="#333b52"/><stop offset=".62" stop-color="#171c2b"/><stop offset="1" stop-color="#0a0d15"/></radialGradient>
    <linearGradient id="hair${id}" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${hairL}"/><stop offset=".55" stop-color="${hex(hair)}"/><stop offset="1" stop-color="${hairD}"/></linearGradient>
    <linearGradient id="skin${id}" x1="0" y1="0" x2="0" y2="1"><stop stop-color="${skinL}"/><stop offset="1" stop-color="${hex(skin)}"/></linearGradient>
    <linearGradient id="out${id}" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${outL}"/><stop offset="1" stop-color="${outD}"/></linearGradient>
    <radialGradient id="glow${id}" cx="50%" cy="50%" r="50%"><stop stop-color="#dff6ff" stop-opacity=".18"/><stop offset="1" stop-color="#dff6ff" stop-opacity="0"/></radialGradient>
  </defs>
  <rect width="100" height="120" fill="url(#bg${id})"/>
  <circle cx="50" cy="48" r="35" fill="none" stroke="${trimHex}" stroke-width=".4" opacity=".2"/>
  ${glow}
  <path d="M12 120c2-23 15-35 38-35s36 12 38 35z" fill="url(#out${id})"/>
  <path d="M33 84h34l-3 16c-7 6-21 6-28 0z" fill="url(#skin${id})"/>
  <path d="M36 86c8 7 20 7 28 0l-2 9c-7 4-17 4-24 0z" fill="${skinD}" opacity=".65"/>
  <path d="M22 91c7-5 15-7 28-7s21 2 28 7l-3 10c-8-5-16-7-25-7s-17 2-25 7z" fill="${trimHex}" opacity=".32"/>
  ${hood}
  <ellipse cx="50" cy="56" rx="20" ry="25" fill="url(#skin${id})"/>
  <ellipse cx="31" cy="58" rx="3.4" ry="5" fill="${skinD}"/>
  <ellipse cx="69" cy="58" rx="3.4" ry="5" fill="${skinD}"/>
  ${hairPath}
  ${hat}${veil}${beard}${paint}${scar}${circlet}${band}${leaf}${flower}${halo}${earrings}${pauldron}${elder}
  <path d="M38 52c2-2 6-2 8 0" stroke="${hairD}" stroke-width="1.2" fill="none" stroke-linecap="round"/>
  <path d="M54 52c2-2 6-2 8 0" stroke="${hairD}" stroke-width="1.2" fill="none" stroke-linecap="round"/>
  ${eyeGlow}
  <ellipse cx="42" cy="57" rx="${s.eyes === 'big' ? 3.2 : 2.5}" ry="${s.eyes === 'squint' ? 1.2 : 2.1}" fill="${eyeColor}"/>
  <ellipse cx="58" cy="57" rx="${s.eyes === 'big' ? 3.2 : 2.5}" ry="${s.eyes === 'squint' ? 1.2 : 2.1}" fill="${eyeColor}"/>
  <circle cx="42.7" cy="56.4" r=".7" fill="#fff" opacity=".9"/><circle cx="58.7" cy="56.4" r=".7" fill="#fff" opacity=".9"/>
  <path d="M50 58l-1.4 7 3.2.4" stroke="${skinD}" stroke-width="1" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M43 73c4 3 10 3 14 0" stroke="${s.mouth === 'grin' ? '#8e5b54' : '#7e4f49'}" stroke-width="1.5" fill="none" stroke-linecap="round"/>
  ${s.mouth === 'smirk' ? '<path d="M43 73c5 1 9 0 12-2" stroke="#7e4f49" stroke-width="1.4" fill="none" stroke-linecap="round"/>' : ''}
  ${s.mouth === 'flat' ? '<path d="M44 73h12" stroke="#7e4f49" stroke-width="1.3" stroke-linecap="round"/>' : ''}
  ${s.child ? '' : `<path d="M37 88c6 3 20 3 26 0" stroke="${skinD}" stroke-width=".6" opacity=".4" fill="none"/>`}
  <path d="M0 0h100v120H0z" fill="none"/>
</svg>`
}

export function playerPortrait(gameState) {
  return portraitSVG('player', {}, gameState.appearance, {})
}
