// Punto de entrada: arranca el juego, oculta la pantalla de carga y prepara el audio.
import { Game } from './game.js';

const canvas = document.getElementById('game');
const boot = document.getElementById('boot-screen');

function hideBoot() {
  if (!boot || boot.classList.contains('gone')) return;
  boot.classList.add('gone');
  window.setTimeout(() => boot.remove(), 700);
}

function start() {
  const game = new Game(canvas);
  window.__game = game;
  window.game = game;
  game.start();
  game.ui.updateViewport();

  // El audio sólo puede activarse tras un gesto del usuario.
  const unlock = () => {
    game.audio.unlock().catch(() => {});
    window.removeEventListener('pointerdown', unlock);
    window.removeEventListener('keydown', unlock);
    window.removeEventListener('touchstart', unlock);
  };
  window.addEventListener('pointerdown', unlock, { passive: true });
  window.addEventListener('keydown', unlock);
  window.addEventListener('touchstart', unlock, { passive: true });

  // Salir de la pantalla de carga cuando el primer fotograma ya está listo.
  requestAnimationFrame(() => requestAnimationFrame(() => {
    hideBoot();
    document.body.classList.add('ready');
  }));

  window.addEventListener('error', event => {
    console.error('Error en La Espada Celestial:', event.error || event.message);
  });
  window.addEventListener('unhandledrejection', event => {
    console.error('Promesa rechazada:', event.reason);
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', start, { once: true });
} else {
  start();
}
