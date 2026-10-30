// Punto de entrada: arranca el motor, conecta el canvas y expone una API de depuración.

import { Game } from './game.js';

const boot = () => {
  const canvas = document.getElementById('game');
  if (!canvas) {
    console.error('[La Espada Celestial] No se encontró el canvas #game.');
    return;
  }

  const game = new Game(canvas);
  window.__CELESTIAL__ = game;
  window.game = game;

  // Evita el zoom accidental con doble toque en móviles.
  document.addEventListener('gesturestart', (e) => e.preventDefault(), { passive: false });
  document.addEventListener('dblclick', (e) => e.preventDefault(), { passive: false });

  // Pausa el audio cuando la pestaña queda oculta y lo reanuda al volver.
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      game.audio?.setPaused?.(true);
    } else {
      game.audio?.setPaused?.(false);
      game.lastTime = performance.now();
    }
  });

  // Desbloquea el audio con la primera interacción real del usuario.
  const unlock = () => {
    game.audio.unlock();
    window.removeEventListener('pointerdown', unlock);
    window.removeEventListener('keydown', unlock);
    window.removeEventListener('touchstart', unlock);
  };
  window.addEventListener('pointerdown', unlock, { passive: true });
  window.addEventListener('keydown', unlock);
  window.addEventListener('touchstart', unlock, { passive: true });

  game.start();

  // Diagnóstico accesible desde la consola del navegador.
  window.__CELESTIAL_INFO__ = {
    version: '1.0.0',
    start: () => game.start(),
    state: () => game.state,
    scene: () => game.scene,
    save: (slot = '1') => game.saveGame(slot),
    load: (slot = 'auto') => game.loadGame(slot),
  };
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot, { once: true });
} else {
  boot();
}
