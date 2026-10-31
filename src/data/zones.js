import { fbm, ridged } from '../utils/noise.js'
import { lerp, smoothstep, clamp } from '../utils/math.js'

function flatten(h, x, z, cx, cz, r, target) {
  const d = Math.hypot(x - cx, z - cz)
  const w = 1 - smoothstep(r * .62, r, d)
  return lerp(h, target, w)
}

function edgeRidge(h, x, z, start, max, amount) {
  const d = Math.max(Math.abs(x), Math.abs(z))
  const w = smoothstep(start, max, d)
  return h + w * amount * (.65 + fbm(x * .06, z * .06, 2, 41) * .7)
}

export function heightValdoria(x, z) {
  let h = (fbm(x * .022, z * .022, 4, 7) - .5) * 4.4 + (fbm(x * .08, z * .08, 2, 9) - .5) * .65
  h += smoothstep(-6, -66, -z) * 1.3
  const lx = (x - 38) / 20, lz = (z + 6) / 14
  const ld = Math.sqrt(lx * lx + lz * lz)
  if (ld < 1.25) h = lerp(h, -2.8 - (1 - clamp(ld, 0, 1)) * 2.2, smoothstep(1.25, .55, ld))
  h = flatten(h, x, z, 0, 10, 21, .55)
  h = flatten(h, x, z, -54, -24, 21, .6)
  h = flatten(h, x, z, 64, -50, 10, .7)
  h = flatten(h, x, z, -28, -34, 8, .5)
  h = flatten(h, x, z, -8, 40, 10, .7)
  h = edgeRidge(h, x, z, 66, 88, 13)
  return h
}

export function heightDrakmor(x, z) {
  let h = (fbm(x * .025, z * .025, 4, 23) - .5) * 4.8 + (ridged(x * .035, z * .035, 3, 27) - .28) * 3.4
  // Gran grieta de lava al suroeste
  const lx = (x - 36) / 18, lz = (z - 14) / 12
  const ld = Math.sqrt(lx * lx + lz * lz)
  if (ld < 1.2) h = lerp(h, -2.4 - (1 - clamp(ld, 0, 1)) * 2.6, smoothstep(1.2, .5, ld))
  // Campos de ceniza llanos cerca del campamento
  h -= smoothstep(28, 4, Math.hypot(x, z - 58)) * 2.2
  h = flatten(h, x, z, 0, 58, 19, .5)
  h = flatten(h, x, z, 0, -56, 22, .45)
  h = flatten(h, x, z, 46, 20, 14, .7)
  h = flatten(h, x, z, 30, -56, 11, .7)
  h = flatten(h, x, z, -58, 34, 10, .6)
  h += smoothstep(-44, -74, z) * 2.2
  h = edgeRidge(h, x, z, 66, 88, 16)
  // Cono del volcán lejano
  const vd = Math.hypot(x + 68, z + 65)
  if (vd < 34) h += Math.max(0, 1 - vd / 34) * 16
  return h
}

export function heightKansordore(x, z) {
  let h = 1.1 + (fbm(x * .03, z * .03, 4, 61) - .5) * 2.3 + (fbm(x * .09, z * .09, 2, 63) - .5) * .45
  h = flatten(h, x, z, 0, 70, 14, 2.1)
  h = flatten(h, x, z, -48, 6, 20, 2.2)
  h = flatten(h, x, z, 38, -6, 18, 2.3)
  h = flatten(h, x, z, 0, -58, 22, 2.4)
  h = flatten(h, x, z, 20, 20, 12, 2.2)
  h = edgeRidge(h, x, z, 68, 88, 9)
  return h
}

export function waterValdoria(x, z) {
  const lx = (x - 38) / 20, lz = (z + 6) / 14
  return Math.sqrt(lx * lx + lz * lz) < 1.02
}

const npc = (id, name, role, pos, colors, portrait, extra = {}) => ({ id, name, role, pos, colors, portrait, ...extra })

export const ZONES = {
  valdoria: {
    id: 'valdoria', name: 'Valdoria', subtitle: 'Donde la primera canción aún florece', act: 'Acto I',
    bounds: 78, heightAt: heightValdoria, isWater: waterValdoria,
    start: [0, 18], startFacing: Math.PI,
    palette: {
      skyTop: 0x1b2a52, skyBottom: 0xf0b87a, sun: 0xffd29a, sunPos: [-60, 60, -120],
      fog: 0x9fb8b2, fogDensity: .0038, hemiSky: 0xbcd7ff, hemiGround: 0x3f5034, hemiIntensity: 1.15,
      ground: 0x4d6b3b, ground2: 0x6c7e42, rock: 0x7a7466, accent: 0xf0cf8e,
      water: 0x2f7e8f, particle: 0xffe9a8, ambient: 0x3e4f45
    },
    props: { treeCount: 190, rockCount: 54, flowerCount: 230, grassCount: 520, treeStyle: 'oak', crystals: 0 },
    landmarks: [
      { name: 'Alda de la Ribera', pos: [0, 10], icon: 'home' },
      { name: 'Ruinas de Vael', pos: [-54, -24], icon: 'ruin' },
      { name: 'Bosque de Lumen', pos: [-32, -50], icon: 'tree' },
      { name: 'Puerta de Ceniza', pos: [64, -50], icon: 'portal' }
    ],
    npcs: [
      npc('iria', 'Anciana Iria', 'Memoria de Valdoria', [-4, 5], { skin: 0xd9b08c, hair: 0xd8d2c0, outfit: 0x4d3f63, trim: 0xd9b773 }, 'iria'),
      npc('tovin', 'Tovin', 'Herrero de Alda', [12, 9], { skin: 0xb97f56, hair: 0x4a3024, outfit: 0x5a4632, trim: 0xc08a48 }, 'tovin'),
      npc('nara', 'Nara', 'Cazadora de ecos', [-28, -34], { skin: 0x9c6848, hair: 0x33241d, outfit: 0x3c5a42, trim: 0x9fc46d }, 'nara'),
      npc('mera', 'Mera', 'Guardiana del altar', [6, 15], { skin: 0xe0b895, hair: 0x8a4b30, outfit: 0x574b6e, trim: 0xd6c28c }, 'mera'),
      npc('bruno', 'Bruno', 'Pescador', [-11, 18], { skin: 0xc58d63, hair: 0x5b3a25, outfit: 0x43536a, trim: 0x9a8159 }, 'bruno'),
      npc('lia', 'Lía', 'Voz del pueblo', [8, 3], { skin: 0xe1b28b, hair: 0x9e5a2c, outfit: 0x7a4f57, trim: 0xe6d09a }, 'lia')
    ],
    waypoints: [
      { id: 'wp_village', name: 'Plaza de Alda', pos: [0, 14], region: 'Valdoria' },
      { id: 'wp_forest', name: 'Claro de Lumen', pos: [-30, -40], region: 'Valdoria' },
      { id: 'wp_ruins', name: 'Vael, atrio', pos: [-54, -14], region: 'Valdoria' },
      { id: 'wp_hill', name: 'Colina del Vigía', pos: [42, 44], region: 'Valdoria' }
    ],
    portals: [
      { id: 'portal_drakmor', name: 'Puerta de Ceniza', pos: [64, -50], target: 'drakmor', targetPos: [0, 66], requires: 'jar_obtained', hint: 'La Puerta de Ceniza permanece sellada. La Jarra de Origen debe despertar primero.' }
    ],
    interactables: [
      { id: 'brazier_vael_a', type: 'brazier', target: 'brazier_vael', pos: [-60, -25], name: 'Brasero de Vael' },
      { id: 'brazier_vael_b', type: 'brazier', target: 'brazier_vael', pos: [-52, -18], name: 'Brasero de Vael' },
      { id: 'brazier_vael_c', type: 'brazier', target: 'brazier_vael', pos: [-46, -27], name: 'Brasero de Vael' },
      { id: 'chest_valdoria_1', type: 'chest', pos: [26, -48], name: 'Cofre del bosque', loot: [{ id: 'potion_vida', qty: 2 }, { id: 'hierro_estelar', qty: 1 }] },
      { id: 'chest_valdoria_2', type: 'chest', pos: [-64, 8], name: 'Cofre de las ruinas', loot: [{ id: 'potion_mana', qty: 2 }, { id: 'amuleto_ira', qty: 1 }] },
      { id: 'chest_valdoria_3', type: 'chest', pos: [48, 28], name: 'Cofre del vigía', loot: [{ id: 'potion_vida', qty: 3 }, { id: 'hierro_estelar', qty: 1 }] },
      { id: 'ore_v1', type: 'ore', pos: [22, -58], item: 'hierro_estelar', qty: 1, name: 'Veta de hierro estelar' },
      { id: 'ore_v2', type: 'ore', pos: [-42, 34], item: 'hierro_estelar', qty: 1, name: 'Veta de hierro estelar' },
      { id: 'ore_v3', type: 'ore', pos: [56, 22], item: 'hierro_estelar', qty: 1, name: 'Veta de hierro estelar' },
      { id: 'ore_v4', type: 'ore', pos: [-16, -62], item: 'hierro_estelar', qty: 1, name: 'Veta de hierro estelar' },
      { id: 'ore_v5', type: 'ore', pos: [34, -38], item: 'hierro_estelar', qty: 1, name: 'Veta de hierro estelar' },
      { id: 'flower_v1', type: 'herb', pos: [18, 12], item: 'flor_lumen', qty: 1, name: 'Flor de Lumen' },
      { id: 'flower_v2', type: 'herb', pos: [-18, -12], item: 'flor_lumen', qty: 1, name: 'Flor de Lumen' },
      { id: 'flower_v3', type: 'herb', pos: [14, -18], item: 'flor_lumen', qty: 1, name: 'Flor de Lumen' },
      { id: 'flower_v4', type: 'herb', pos: [-24, 26], item: 'flor_lumen', qty: 1, name: 'Flor de Lumen' },
      { id: 'flower_v5', type: 'herb', pos: [30, 4], item: 'flor_lumen', qty: 1, name: 'Flor de Lumen' },
      { id: 'flower_v6', type: 'herb', pos: [-36, -12], item: 'flor_lumen', qty: 1, name: 'Flor de Lumen' },
      { id: 'flower_v7', type: 'herb', pos: [4, -36], item: 'flor_lumen', qty: 1, name: 'Flor de Lumen' },
      { id: 'echo_valdoria', type: 'echo', pos: [-8, 28], name: 'Eco de la Primera Canción', text: 'Una voz sin dueño dice tu nombre al revés. El viento se detiene un instante, como si esperase una respuesta.' }
    ],
    bossArenas: {
      coloso_raiz: { pos: [-54, -33], radius: 16, intro: 'Las raíces se alzan. El Coloso de Raíz abrió los ojos por primera vez en mil años.' }
    },
    bonuses: ['flor_lumen +10 % de aparición', 'Luz del alba: maná +5 %']
  },
  drakmor: {
    id: 'drakmor', name: 'Drakmor', subtitle: 'El reino que aprendió a arder sin morir', act: 'Acto II',
    bounds: 78, heightAt: heightDrakmor,
    start: [0, 66], startFacing: Math.PI,
    palette: {
      skyTop: 0x1a1018, skyBottom: 0xb84428, sun: 0xff8a4f, sunPos: [80, 40, 120],
      fog: 0x6d3b32, fogDensity: .007, hemiSky: 0xff9a6a, hemiGround: 0x281b20, hemiIntensity: .85,
      ground: 0x3e302c, ground2: 0x5c3e32, rock: 0x4a4040, accent: 0xff7040,
      water: 0xff5a1e, particle: 0xff8a4c, ambient: 0x3b2424
    },
    props: { treeCount: 88, rockCount: 92, flowerCount: 40, grassCount: 120, treeStyle: 'dead', crystals: 42 },
    landmarks: [
      { name: 'Campamento de Kaelen', pos: [0, 58], icon: 'camp' },
      { name: 'Bosque de Obsidiana', pos: [-46, -14], icon: 'tree' },
      { name: 'Fortaleza de Varok', pos: [0, -56], icon: 'fort' },
      { name: 'Santuario de la Brasa', pos: [46, 20], icon: 'temple' },
      { name: 'Puerta del Cielo', pos: [30, -56], icon: 'portal' }
    ],
    npcs: [
      npc('kaelen', 'Kaelen', 'Último rebelde de Drakmor', [2, 58], { skin: 0xb07a50, hair: 0x2b1d19, outfit: 0x3d3d45, trim: 0xb45a39 }, 'kaelen'),
      npc('vesna', 'Vesna', 'Mercader de ceniza', [-6, 60], { skin: 0x8c5a3d, hair: 0x3a2b2b, outfit: 0x5d4050, trim: 0xd49a58 }, 'vesna')
    ],
    waypoints: [
      { id: 'wp_camp', name: 'Fuego de Kaelen', pos: [0, 54], region: 'Drakmor' },
      { id: 'wp_sanctuary', name: 'Santuario de la Brasa', pos: [44, 18], region: 'Drakmor' },
      { id: 'wp_gate', name: 'Brecha de Varok', pos: [0, -32], region: 'Drakmor' }
    ],
    portals: [
      { id: 'portal_kansordore', name: 'Puerta del Cielo', pos: [30, -56], target: 'kansordore', targetPos: [0, 76], requires: 'varok_defeated', hint: 'La Puerta del Cielo está cerrada. La Lágrima de la Primera Brasa debe arder de nuevo.' }
    ],
    interactables: [
      { id: 'fortress_gate', type: 'gate', pos: [0, -36], name: 'Puerta de la Fortaleza', target: 'fortress_gate' },
      { id: 'memoria_d1', type: 'memory', target: 'memoria_ceniza', pos: [-52, -28], name: 'Memoria de Ceniza', text: '«No llores, padre. La ceniza no duele; solo pesa.»' },
      { id: 'memoria_d2', type: 'memory', target: 'memoria_ceniza', pos: [-38, -38], name: 'Memoria de Ceniza', text: '«Si el tiempo pudiera detenerse, te vería crecer aunque el mundo se rompiera.»' },
      { id: 'memoria_d3', type: 'memory', target: 'memoria_ceniza', pos: [48, 24], name: 'Memoria de Ceniza', text: '«Prometiste que volverías con una estrella en la mano. Yo te creí.»' },
      { id: 'faro_ceniza', type: 'beacon', pos: [-58, 34], name: 'Faro de Ceniza', target: 'faro_ceniza' },
      { id: 'chest_drakmor_1', type: 'chest', pos: [8, 56], name: 'Cofre del campamento', loot: [{ id: 'potion_vida', qty: 2 }, { id: 'esencia_resonancia', qty: 30 }] },
      { id: 'chest_drakmor_2', type: 'chest', pos: [-12, -58], name: 'Cofre de la fortaleza', loot: [{ id: 'elixir_alba', qty: 1 }, { id: 'hierro_estelar', qty: 1 }] },
      { id: 'ore_d1', type: 'ore', pos: [-26, -52], item: 'hierro_estelar', qty: 1, name: 'Veta de hierro estelar' },
      { id: 'ore_d2', type: 'ore', pos: [54, -24], item: 'hierro_estelar', qty: 1, name: 'Veta de hierro estelar' },
      { id: 'herb_d1', type: 'herb', pos: [-22, 32], item: 'flor_lumen', qty: 1, name: 'Flor de Lumen marchita' },
      { id: 'echo_drakmor', type: 'echo', pos: [24, 38], name: 'Eco de la Primera Brasa', text: 'Una risa de niña atraviesa el campo de ceniza. Cuando se apaga, el fuego de tu alrededor se inclina como si saludara.' }
    ],
    bossArenas: {
      varok: { pos: [0, -58], radius: 17, intro: 'Varok desciende de su trono. «Si el mundo insiste en arrebatarme lo que amo, que arda conmigo.»' }
    },
    bonuses: ['Resistencia al fuego +10 %', 'Las brasas revelan cofres cercanos']
  },
  kansordore: {
    id: 'kansordore', name: 'Kansordore', subtitle: 'La ciudad que recuerda el nombre del cielo', act: 'Acto III',
    bounds: 78, heightAt: heightKansordore,
    start: [0, 76], startFacing: Math.PI,
    palette: {
      skyTop: 0x0b1634, skyBottom: 0x8f9fd9, sun: 0xffe8c0, sunPos: [80, 100, -80],
      fog: 0xa8b8d8, fogDensity: .0045, hemiSky: 0xd7e6ff, hemiGround: 0x39445c, hemiIntensity: 1.2,
      ground: 0x8a889d, ground2: 0xa9a1a4, rock: 0xb8b0b8, accent: 0xffe4a8,
      water: 0x9fc8e8, particle: 0xffe8b8, ambient: 0x445066
    },
    props: { treeCount: 60, rockCount: 46, flowerCount: 120, grassCount: 220, treeStyle: 'celestial', crystals: 26 },
    landmarks: [
      { name: 'Biblioteca Prohibida', pos: [-48, 6], icon: 'library' },
      { name: 'Ciudad de Ael', pos: [38, -6], icon: 'city' },
      { name: 'Templo del Velo', pos: [0, -58], icon: 'temple' },
      { name: 'Puerta de Retorno', pos: [0, 76], icon: 'portal' }
    ],
    npcs: [
      npc('seraphine', 'Seraphine', 'Última archivera', [-48, 6], { skin: 0xbca7b8, hair: 0xded6ef, outfit: 0x464f78, trim: 0xd6c99a }, 'seraphine')
    ],
    waypoints: [
      { id: 'wp_sky_entry', name: 'Umbral de Kansordore', pos: [0, 66], region: 'Kansordore' },
      { id: 'wp_library', name: 'Atrio del Archivo', pos: [-42, 14], region: 'Kansordore' },
      { id: 'wp_city', name: 'Plaza de Ael', pos: [36, 2], region: 'Kansordore' },
      { id: 'wp_temple', name: 'Escalinata del Velo', pos: [0, -46], region: 'Kansordore' }
    ],
    portals: [
      { id: 'portal_back', name: 'Puerta de Retorno', pos: [0, 76], target: 'drakmor', targetPos: [26, -46], requires: null, hint: '' }
    ],
    interactables: [
      { id: 'sello_1', type: 'seal', target: 'sello_archivo', pos: [-62, 30], name: 'Sello del Archivo' },
      { id: 'sello_2', type: 'seal', target: 'sello_archivo', pos: [56, 30], name: 'Sello del Archivo' },
      { id: 'sello_3', type: 'seal', target: 'sello_archivo', pos: [18, -22], name: 'Sello del Archivo' },
      { id: 'eco_k1', type: 'echo', target: 'eco_pasado', pos: [34, 6], name: 'Eco del Pasado', text: 'Ves una mesa de madera, una taza y una ventana con lluvia. Alguien ríe fuera de cuadro. El recuerdo no tiene dueño… o quizá eres tú.' },
      { id: 'eco_k2', type: 'echo', target: 'eco_pasado', pos: [-20, 40], name: 'Eco del Pasado', text: 'Un niño sostiene una espada de juguete. «Algún día salvaré un mundo», dice. La imagen parpadea como un píxel.' },
      { id: 'eco_k3', type: 'echo', target: 'eco_pasado', pos: [52, -38], name: 'Eco del Pasado', text: 'Una pantalla negra. Tus manos sobre unos mandos. Al otro lado, una voz pregunta: «¿Otra vez?». Tú respondes que sí.' },
      { id: 'chest_k1', type: 'chest', pos: [-58, -8], name: 'Cofre del archivo', loot: [{ id: 'potion_mana', qty: 2 }, { id: 'esencia_resonancia', qty: 40 }] },
      { id: 'chest_k2', type: 'chest', pos: [46, -44], name: 'Cofre de Ael', loot: [{ id: 'elixir_alba', qty: 1 }, { id: 'esencia_resonancia', qty: 50 }] },
      { id: 'echo_k4', type: 'echo', pos: [6, 24], name: 'Eco de la Convergencia', text: 'Tres caminos, tres mundos, un mismo nombre. La Espada no se forja: se elige.' },
      { id: 'altar_convergencia', type: 'altar', target: 'altar_convergencia', pos: [0, -66], name: 'Altar de la Convergencia' }
    ],
    bossArenas: {
      custodio_velo: { pos: [0, -58], radius: 18, intro: 'El Custodio del Velo alza su lanza. «No puedo permitir que vuelvas a escribir el final.»' },
      convergencia: { pos: [0, -66], radius: 19, intro: 'La Convergencia Absoluta abre los ojos. Tiene tu rostro. «Hagamos esto una vez más… o terminemos.»' }
    },
    bonuses: ['Resonancia celestial: +10 % de captura', 'El Velo revela los secretos cercanos']
  }
}

export function zoneDef(id) { return ZONES[id] }
export const ZONE_ORDER = ['valdoria', 'drakmor', 'kansordore']
