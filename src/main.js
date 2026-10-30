// ============================================================
// LA ESPADA CELESTIAL — arranque de la aplicación
// ============================================================
import { Game } from './game.js';
import { UI } from './ui.js';

const canvas = document.getElementById('game-canvas');
const game = new Game(canvas);
const ui = new UI(game);
game.ui = ui;

// Herramientas de depuración y verificación accesibles desde la consola.
window.__game = game.debug;
window.__lac = { game, ui };
window.__game.ready = true;

// Ocultar la pantalla de carga cuando el primer fotograma ya está listo.
const loading = document.getElementById('loading-screen');
const reveal = () => {
  if (!loading || loading.classList.contains('done')) return;
  const fill = document.getElementById('loading-fill');
  if (fill) fill.style.width = '100%';
  loading.classList.add('done');
  document.documentElement.dataset.ready = 'true';
  window.__ready = true;
  setTimeout(() => loading.classList.add('hidden'), 560);
};
requestAnimationFrame(() => requestAnimationFrame(reveal));

// Si algo falla durante el arranque, deja un rastro claro en consola.
window.addEventListener('error', (event) => {
  console.error('[La Espada Celestial] Error:', event.error || event.message);
});
window.addEventListener('unhandledrejection', (event) => {
  console.error('[La Espada Celestial] Promesa rechazada:', event.reason);
});
