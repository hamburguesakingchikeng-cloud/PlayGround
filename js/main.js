// Boot the run: game, renderer, interface, input, and the frame loop.

import { Game } from './game.js';
import { Renderer } from './render.js';
import { UI } from './ui.js';
import { Input } from './input.js';
import { AudioEngine } from './audio.js';

const canvas = document.getElementById('game');
const audio = new AudioEngine();
const game = new Game({ audio, events: {} });
const renderer = new Renderer(canvas);
const ui = new UI(game, audio);
const input = new Input(game, ui);

game.events = {
  onToast: (text, tone) => ui.toast(text, tone),
  onLevelUp: (choices, level, cost) => ui.showLevelUp(choices, level, cost),
  onLevelUpClose: () => ui.closeLevelUp(),
  onLegendary: (item, current) => ui.showLegendary(item, current),
  onLegendaryClose: () => ui.closeLegendary(),
  onInventory: open => {
    ui.inventory.classList.toggle('hidden', !open);
    if (open) ui.renderInventory();
    else ui.hideTooltip();
  },
  onInventoryDirty: () => {
    if (game.state === 'inventory') ui.renderInventory();
  },
  onPause: show => ui.showPause(show),
  onEnd: summary => ui.showEnd(summary),
  onStats: () => {
    if (game.state === 'inventory') ui.renderStats();
  },
  onEquip: () => ui.renderDock(),
  onBoss: () => { /* boss bar is driven by the HUD update */ },
  onBossDefeated: () => { /* loot and toast are handled by the simulation */ },
  onHudDirty: () => { /* HUD refreshes every frame */ },
  onStart: () => { /* UI handles the menu transition */ }
};

function resize() {
  renderer.resize();
  game.setViewport(window.innerWidth, window.innerHeight);
}
window.addEventListener('resize', resize);
window.addEventListener('orientationchange', () => setTimeout(resize, 120));
resize();

let last = performance.now();
function frame(now) {
  const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));
  last = now;
  input.update();
  game.update(dt);
  renderer.draw(game, dt);
  ui.update(dt);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

// Useful for browser verification and for curious players.
window.__grimhoard = { game, ui, renderer, audio };
