/**
 * LA ESPADA CELESTIAL — punto de entrada.
 * Arranca el motor, gestiona el bucle de render, el tamaño de pantalla,
 * la pausa automática al perder el foco y el service worker (PWA).
 */
import { Game } from './game.js'

const canvas = document.getElementById('game-canvas')
if (!canvas) throw new Error('No se encontró #game-canvas')

const game = new Game(canvas)
window.game = game
window.__espadaReady = true

/* --------------------------------------------------------------------------
   Bucle principal: delta acotado, sin acumulación tras pestañas en segundo plano.
   -------------------------------------------------------------------------- */
let last = 0
let raf = 0
let running = true

function frame(now) {
  if (!running) return
  if (!last) last = now
  const dt = (now - last) / 1000
  last = now
  try {
    game.update(dt)
    game.render()
  } catch (error) {
    running = false
    console.error('[La Espada Celestial] Error en el bucle de juego:', error)
    return
  }
  game.input.endFrame()
  updateOrientationHint()
  raf = requestAnimationFrame(frame)
}

function startLoop() {
  if (raf) cancelAnimationFrame(raf)
  last = 0
  running = true
  raf = requestAnimationFrame(frame)
}

function stopLoop() {
  running = false
  if (raf) cancelAnimationFrame(raf)
  raf = 0
}

/* --------------------------------------------------------------------------
   Tamaño / orientación. Se agrupa en un frame para evitar relayouts en cascada.
   -------------------------------------------------------------------------- */
let resizeQueued = false

function scheduleResize() {
  if (resizeQueued) return
  resizeQueued = true
  requestAnimationFrame(() => {
    resizeQueued = false
    game.resize()
    if (game.mode === 'playing' || game.mode === 'paused' || game.mode === 'dialogue') {
      game.updateCamera?.(1 / 60)
    }
    updateOrientationHint()
  })
}

/* En móvil vertical mostramos una sugerencia de rotación, descartable. */
const ROTATE_KEY = 'espada-rotate-dismissed'
function updateOrientationHint() {
  const hint = document.getElementById('rotate-hint')
  if (!hint) return
  const portrait = window.innerHeight > window.innerWidth && window.innerWidth < 900
  const inGame = ['playing', 'paused', 'dialogue', 'gameover', 'ending'].includes(game.mode)
  const dismissed = sessionStorage.getItem(ROTATE_KEY) === '1'
  hint.classList.toggle('hidden', !portrait || !inGame || dismissed)
}

document.querySelectorAll('[data-rotate-dismiss]').forEach((b) => {
  b.addEventListener('click', () => {
    sessionStorage.setItem(ROTATE_KEY, '1')
    document.getElementById('rotate-hint')?.classList.add('hidden')
  })
})

window.addEventListener('resize', scheduleResize)
window.addEventListener('orientationchange', () => setTimeout(scheduleResize, 120))
if (window.visualViewport) window.visualViewport.addEventListener('resize', scheduleResize)
if ('ResizeObserver' in window) new ResizeObserver(scheduleResize).observe(canvas)

/* --------------------------------------------------------------------------
   Pausa automática: al ocultar la pestaña no se acumula tiempo ni se pierde
   la partida; al volver se ofrece el menú de pausa y se guarda en silencio.
   -------------------------------------------------------------------------- */
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    if (game.mode === 'playing') {
      game.ui?.openPause('status')
      game.save(true)
    }
    stopLoop()
  } else {
    last = 0
    startLoop()
  }
})

window.addEventListener('pagehide', () => {
  if (game.player) game.save(true)
  stopLoop()
})

window.addEventListener('beforeunload', () => {
  if (game.player) game.save(true)
})

/* --------------------------------------------------------------------------
   Service worker (solo en http/https; file:// no lo permite).
   -------------------------------------------------------------------------- */
if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch((error) => {
      console.warn('[La Espada Celestial] Service worker no disponible:', error?.message || error)
    })
  })
}

/* --------------------------------------------------------------------------
   Arranque. La primera pantalla ya es visible, así que el canvas puede
   renderizar el título de inmediato.
   -------------------------------------------------------------------------- */
game.resize()
game.render()
startLoop()

// La portada ya está dibujada: retiramos la cortina de carga.
requestAnimationFrame(() => {
  document.getElementById('loading-screen')?.classList.add('done')
})

// Pequeña ayuda de depuración para pruebas y soporte.
window.__espada = {
  version: '1.0.0',
  get mode() { return game.mode },
  get player() { return game.player },
  get worldReady() { return Boolean(game.worldSurface) },
  save: () => game.save(),
  start: () => game.startNew(),
}
