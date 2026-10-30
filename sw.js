const CACHE = 'espada-celestial-v5'
const CORE = [
  './', './index.html', './src/style.css', './src/main.js',
  './src/content.js', './src/audio.js', './src/input.js', './src/game.js', './src/ui.js', './src/entities.js',
  './src/art/index.js', './src/art/common.js', './src/art/hero.js', './src/art/enemies.js',
  './src/art/terrain.js', './src/art/environment.js', './src/art/details.js', './src/art/title.js',
  './src/styles/base.css', './src/styles/title.css', './src/styles/creator.css', './src/styles/hud.css',
  './src/styles/menus.css', './src/styles/touch.css', './src/styles/responsive.css',
  './assets/fonts/cinzel-600.ttf', './assets/fonts/cinzel-900.ttf',
  './assets/fonts/cormorant-italic.woff2', './assets/fonts/manrope.woff2',
  './assets/icon.svg', './manifest.webmanifest',
]

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(CORE)).then(() => self.skipWaiting()))
})
self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))).then(() => self.clients.claim()))
})
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request).then((response) => {
      if (!response || response.status !== 200 || response.type === 'opaque') return response
      const copy = response.clone()
      caches.open(CACHE).then((cache) => cache.put(event.request, copy)).catch(() => {})
      return response
    }).catch(() => caches.match('./index.html')))
  )
})
