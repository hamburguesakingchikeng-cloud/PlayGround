import { Game } from './game.js';
import { Renderer } from './render.js';
import { UI } from './ui.js';
import { Audio } from './audio.js';

const canvas = document.getElementById('game');
const audio = new Audio();
const game = new Game(audio);
const renderer = new Renderer(canvas, game);
const ui = new UI(game, audio);

const keys = new Set();
let joystick = null;
let last = performance.now();

const isTyping = (e) => {
  const tag = e.target?.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';
};

window.addEventListener('keydown', (e) => {
  if (isTyping(e)) return;
  const key = e.key.toLowerCase();
  if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(key)) e.preventDefault();

  if (game.state === 'levelup') {
    if (['1', '2', '3'].includes(key) && !e.repeat) {
      ui.chooseUpgrade(Number(key) - 1);
      return;
    }
    if (key === 'r' && !e.repeat) {
      ui.reroll();
      return;
    }
  }

  if (key === 'escape' && !e.repeat) {
    if (game.state === 'inventory') ui.closeInventory();
    else if (game.state === 'paused') ui.resumeGame();
    else if (game.state === 'playing') ui.pauseGame();
    return;
  }
  if (key === 'i' && !e.repeat) {
    if (game.state === 'inventory') ui.closeInventory();
    else if (game.state === 'playing' || game.state === 'paused') ui.openInventory();
    return;
  }
  if (key === 'm' && !e.repeat) {
    ui.toggleMute();
    return;
  }
  if (key === 'p' && !e.repeat && (game.state === 'playing' || game.state === 'paused')) {
    if (game.state === 'playing') ui.pauseGame();
    else ui.resumeGame();
    return;
  }
  keys.add(key);
});

window.addEventListener('keyup', (e) => {
  keys.delete(e.key.toLowerCase());
});

window.addEventListener('blur', () => {
  keys.clear();
  endJoystick();
});

/* ── floating touch joystick ─────────────────────────────────── */
const joyEl = document.getElementById('joystick');
const knobEl = joyEl.querySelector('.knob');
const MAX_DIST = 58;

function startJoystick(e) {
  if (game.state !== 'playing') return;
  audio.resume();
  joystick = { id: e.pointerId, ox: e.clientX, oy: e.clientY, x: 0, y: 0 };
  canvas.setPointerCapture?.(e.pointerId);
  joyEl.classList.remove('hidden');
  joyEl.style.left = `${e.clientX}px`;
  joyEl.style.top = `${e.clientY}px`;
  knobEl.style.transform = 'translate(-50%, -50%)';
  updateJoystick(e);
}

function updateJoystick(e) {
  if (!joystick || e.pointerId !== joystick.id) return;
  let dx = e.clientX - joystick.ox;
  let dy = e.clientY - joystick.oy;
  const d = Math.hypot(dx, dy);
  if (d > MAX_DIST) {
    dx = (dx / d) * MAX_DIST;
    dy = (dy / d) * MAX_DIST;
  }
  joystick.x = dx / MAX_DIST;
  joystick.y = dy / MAX_DIST;
  knobEl.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
}

function endJoystick() {
  if (!joystick) return;
  joystick = null;
  joyEl.classList.add('hidden');
}

canvas.addEventListener('pointerdown', (e) => {
  e.preventDefault();
  startJoystick(e);
});
canvas.addEventListener('pointermove', (e) => {
  if (joystick) {
    e.preventDefault();
    updateJoystick(e);
  }
});
canvas.addEventListener('pointerup', (e) => {
  if (joystick && e.pointerId === joystick.id) endJoystick();
});
canvas.addEventListener('pointercancel', endJoystick);
canvas.addEventListener('pointerleave', (e) => {
  if (joystick && e.pointerId === joystick.id) endJoystick();
});
canvas.addEventListener('contextmenu', (e) => e.preventDefault());

/* ── main loop ───────────────────────────────────────────────── */
function updateInput() {
  let x = 0;
  let y = 0;
  if (keys.has('a') || keys.has('arrowleft')) x -= 1;
  if (keys.has('d') || keys.has('arrowright')) x += 1;
  if (keys.has('w') || keys.has('arrowup')) y -= 1;
  if (keys.has('s') || keys.has('arrowdown')) y += 1;
  if (joystick) {
    x = joystick.x;
    y = joystick.y;
  }
  const len = Math.hypot(x, y);
  if (len > 1) {
    x /= len;
    y /= len;
  }
  game.input.x = x;
  game.input.y = y;
}

function frame(now) {
  const dt = Math.min(0.05, Math.max(0.0001, (now - last) / 1000));
  last = now;
  updateInput();
  game.update(dt);
  renderer.render(now);
  if (game.state !== 'menu') ui.updateHUD();
  requestAnimationFrame(frame);
}

window.addEventListener('resize', () => renderer.resize());
window.addEventListener('orientationchange', () => setTimeout(() => renderer.resize(), 120));

document.addEventListener('visibilitychange', () => {
  if (document.hidden && game.state === 'playing') ui.pauseGame();
});

// first interaction unlocks audio
const unlock = () => {
  audio.resume();
  window.removeEventListener('pointerdown', unlock);
  window.removeEventListener('keydown', unlock);
};
window.addEventListener('pointerdown', unlock);
window.addEventListener('keydown', unlock);

requestAnimationFrame(frame);
