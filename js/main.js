/* ==========================================================================
   MAIN — bootstrap the game once the DOM is ready.
   ========================================================================== */

import { Game } from './game.js';

const game = new Game();
window.game = game;
window.__LA_ESPADA_CELESTIAL__ = game;
game.boot();
