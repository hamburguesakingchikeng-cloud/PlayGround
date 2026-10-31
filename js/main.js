// ─────────────────────────────────────────────────────────────
// LA ESPADA CELESTIAL — arranque, lienzo, bucle y ciclo de vida
// ─────────────────────────────────────────────────────────────
import { Game } from './game.js';
import { UI } from './ui.js';
import { Input } from './input.js';
import { audio } from './audio.js';
import { drawTitle } from './worldview.js';
import { clamp } from './util.js';

const canvas = document.getElementById('game');
const game = new Game(canvas);
const ui = new UI(game);
const input = new Input();

game.ui = ui;
game.input = input;
game.applySettings();
input.attachTouch(document.getElementById('touch-ui'));

// Bloquea gestos del navegador que rompen la partida en móvil.
document.addEventListener('contextmenu', e => e.preventDefault());
document.addEventListener('gesturestart', e => e.preventDefault());
document.getElementById('touch-ui')?.addEventListener('touchmove', e => e.preventDefault(), { passive: false });

// ───────────────────────── lienzo ─────────────────────────
let dpr = 1;
let cssW = 1, cssH = 1;

function resize() {
  cssW = Math.max(1, window.innerWidth);
  cssH = Math.max(1, window.innerHeight);
  dpr = Math.min(2, window.devicePixelRatio || 1);
  canvas.width = Math.round(cssW * dpr);
  canvas.height = Math.round(cssH * dpr);
  canvas.style.width = cssW + 'px';
  canvas.style.height = cssH + 'px';
  // El mundo se ve algo más cercano en pantallas pequeñas, más amplio en escritorio.
  const fit = Math.min(cssW / 1120, cssH / 650);
  game.zoom = clamp(fit, .78, 1.32);
  if (game.inGame) game.updateCamera(0);
}

window.addEventListener('resize', resize);
window.addEventListener('orientationchange', () => setTimeout(resize, 120));
if (window.visualViewport) window.visualViewport.addEventListener('resize', resize);
resize();

// ───────────────────────── audio ─────────────────────────
let audioUnlocked = false;
function unlockAudio() {
  if (audioUnlocked) return;
  audioUnlocked = true;
  try {
    audio.unlock();
    if (!game.inGame) audio.playMusic('title');
    audio.setVolumes({
      master: game.settings.master,
      music: game.settings.music,
      sfx: game.settings.sfx
    });
    audio.setMuted(game.settings.muted);
  } catch (err) {
    console.warn('Audio no disponible', err);
  }
}
window.addEventListener('pointerdown', unlockAudio, { once: true, capture: true });
window.addEventListener('keydown', unlockAudio, { once: true, capture: true });

// ───────────────────────── bucle ─────────────────────────
const FIXED = 1 / 60;
let last = performance.now();
let accumulator = 0;
let titleTime = 0;
let started = false;

function frame(now) {
  const raw = (now - last) / 1000;
  last = now;
  const dt = Math.min(raw, .1);
  titleTime += dt;

  if (game.mode === 'playing' || game.mode === 'dialog' || game.mode === 'cinematic') {
    // Sólo avanza la simulación cuando el mundo está vivo.
    if (game.mode === 'playing') {
      accumulator += dt;
      let steps = 0;
      while (accumulator >= FIXED && steps < 5) {
        game.update(FIXED);
        accumulator -= FIXED;
        steps++;
      }
      if (steps === 5) accumulator = 0;
    }
  } else {
    accumulator = 0;
  }

  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  if (game.inGame && game.world) {
    game.render(ctx, cssW, cssH);
  } else {
    drawTitle(ctx, cssW, cssH, titleTime);
  }

  input.endFrame();
  requestAnimationFrame(frame);
}

// ───────────────────────── guardado y visibilidad ─────────────────────────
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    if (game.inGame && game.mode === 'playing') game.save(false);
    audio.stopMusic?.();
  } else {
    last = performance.now();
    accumulator = 0;
    if (audioUnlocked && game.inGame) audio.playMusic(game.regionId || 'valdoria');
    else if (audioUnlocked && !game.inGame) audio.playMusic('title');
  }
});

window.addEventListener('pagehide', () => {
  if (game.inGame) game.save(false);
});

// ───────────────────────── errores visibles ─────────────────────────
function showFatal(message) {
  console.error(message);
  let box = document.getElementById('fatal-error');
  if (!box) {
    box = document.createElement('div');
    box.id = 'fatal-error';
    box.style.cssText = 'position:fixed;inset:0;z-index:9999;display:grid;place-items:center;background:#05070d;color:#f2e6cd;font:14px/1.6 Georgia,serif;padding:32px;text-align:center;white-space:pre-wrap';
    document.body.appendChild(box);
  }
  box.textContent = 'El Velo se ha rasgado.\n\n' + String(message || 'Error desconocido') + '\n\nRecarga la página para volver a intentarlo.';
}
window.addEventListener('error', e => { if (e.error) showFatal(e.error.stack || e.error.message); });
window.addEventListener('unhandledrejection', e => { if (e.reason) showFatal(e.reason.stack || e.reason.message || e.reason); });

// ───────────────────────── inicio ─────────────────────────
function boot() {
  if (started) return;
  started = true;
  ui.setLoading(.18, 'Tejiendo el Velo…');

  // La carga es real: se construyen las piezas y se comprueba el almacenamiento.
  requestAnimationFrame(() => {
    ui.setLoading(.55, 'Encendiendo las brasas…');
    try {
      localStorage.setItem('la_espada_celestial_probe', '1');
      localStorage.removeItem('la_espada_celestial_probe');
    } catch { /* modo privado: se juega sin guardado persistente */ }
    requestAnimationFrame(() => {
      ui.setLoading(.88, 'Afilando la Espada Celestial…');
      ui.showTitle();
      if (game.hasSave()) {
        const cont = document.getElementById('btn-continue');
        if (cont) { cont.disabled = false; cont.style.opacity = '1'; }
      }
      setTimeout(() => {
        ui.hideLoading();
        requestAnimationFrame(frame);
      }, 420);
    });
  });
}

boot();

// Expuesto para depuración y para pruebas de humo.
window.__espada = { game, ui, input, audio };
