// Boot the game and drive the render loop.
import { Game } from './game.js';
import { UI } from './ui.js';

const canvas = document.getElementById('game');
const game = new Game(canvas);
const ui = new UI(game);

// Exposed for automated smoke tests and curious tinkerers.
window.__gravebound = { game, ui };

let last = performance.now();
function loop(now) {
  const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));
  last = now;
  game.frame(dt);
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);

// Pause when the tab is hidden so a run is never lost to a background tab.
document.addEventListener('visibilitychange', () => {
  if (document.hidden && game.state === 'playing') game.pause();
});
