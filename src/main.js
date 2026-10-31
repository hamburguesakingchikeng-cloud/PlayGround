// ============================================================
// LA ESPADA CELESTIAL — arranque, bucle principal y ciclo de vida
// ============================================================
import { Renderer } from './render.js';
import { Input, AudioEngine } from './core.js';
import { Game } from './game.js';
import { UI } from './ui.js';

const $ = id => document.getElementById(id);

const canvas = $('game-canvas');
const titleCanvas = $('title-canvas');
const cineCanvas = $('cine-canvas');

const renderer = new Renderer(canvas, titleCanvas, cineCanvas);
const input = new Input(canvas);
const audio = new AudioEngine();
const ui = new UI({ renderer, input, audio });
const game = new Game({ renderer, input, audio, ui });

ui.attach(game);

// ------------------------------------------------------------
// Audio: los navegadores exigen un gesto del usuario.
// ------------------------------------------------------------
let audioUnlocked = false;
function unlockAudio() {
  if (audioUnlocked) return;
  audioUnlocked = true;
  audio.init();
  audio.resume();
  if (game.state === 'title' && !game.zone) audio.setMode('title', false);
}
window.addEventListener('pointerdown', unlockAudio, { passive: true });
window.addEventListener('keydown', unlockAudio);
window.addEventListener('touchstart', unlockAudio, { passive: true });
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') audio.resume();
});

// ------------------------------------------------------------
// Aviso de orientación (la experiencia está diseñada en horizontal).
// ------------------------------------------------------------
const rotateHint = $('rotate-hint');
function updateOrientation() {
  if (!rotateHint) return;
  const portrait = window.innerHeight > window.innerWidth * 1.04;
  const coarse = window.matchMedia?.('(pointer: coarse)').matches;
  const show = portrait && coarse;
  rotateHint.classList.toggle('hidden', !show);
  if (show) {
    input.down.clear();
    input.setJoystick(0, 0, false);
  }
}
window.addEventListener('resize', updateOrientation);
window.addEventListener('orientationchange', () => setTimeout(updateOrientation, 180));
updateOrientation();

// ------------------------------------------------------------
// Bucle principal
// ------------------------------------------------------------
let last = performance.now();
let running = true;

function frame(now) {
  if (!running) return;
  const raw = (now - last) / 1000;
  last = now;
  // Evita saltos enormes al volver de una pestaña en segundo plano.
  const dt = Math.min(0.05, Math.max(0, raw));

  game.update(dt);
  renderer.render(game, dt);
  ui.tick(dt, now / 1000);
  audio.update();
  input.endFrame();

  requestAnimationFrame(frame);
}

// Pausa suave cuando la pestaña no es visible para no acumular tiempo.
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') last = performance.now();
});

requestAnimationFrame(frame);

// ------------------------------------------------------------
// Pantalla de carga
// ------------------------------------------------------------
function hideBoot() {
  const boot = $('boot');
  if (!boot || boot.classList.contains('off')) return;
  boot.classList.add('off');
  setTimeout(() => boot.remove(), 1100);
}

const fontsReady = document.fonts?.ready || Promise.resolve();
fontsReady
  .catch(() => {})
  .then(() => {
    // Un instante para que el primer fotograma esté ya pintado.
    setTimeout(hideBoot, 420);
  });
setTimeout(hideBoot, 4000);

// ------------------------------------------------------------
// Utilidades de depuración (consola del navegador)
// ------------------------------------------------------------
window.LaEspadaCelestial = { game, ui, renderer, input, audio };
