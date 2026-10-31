import { Input } from './core/input.js';
import { AudioEngine } from './core/audio.js';
import { loadSettings, latestSave, hasAnySave } from './core/save.js';
import { UIController } from './ui/ui.js';
import { Game } from './game/game.js';
import { CUTSCENES } from './data/story.js';
import { getRegion, TILE } from './world/regions.js';
import { drawTerrain, drawWaterGlow } from './art/terrain.js';
import { drawEnvironment, drawShrines, drawStones } from './art/props.js';

const app = document.getElementById('app');
const canvas = document.getElementById('game');
const settings = loadSettings();
const audio = new AudioEngine();
const input = new Input();

let ui = null;
let game = null;
let titleLoop = 0;
let titleBackdrop = null;

const $ = (id) => document.getElementById(id);

function showFatal(err) {
  const box = $('fatal');
  if (!box) return;
  box.classList.remove('hidden');
  box.textContent = 'LA ESPADA CELESTIAL\n\nNo se pudo iniciar la aventura.\n\n' +
    (err?.stack || err?.message || String(err)) +
    '\n\nPrueba a recargar la página. Si usas un navegador antiguo, actualízalo o abre el juego en Chrome, Edge, Firefox o Safari recientes.';
  console.error(err);
}

function hideBoot() {
  $('boot')?.classList.add('hidden');
}

function viewW() { return Math.max(320, window.innerWidth || 960); }
function viewH() { return Math.max(240, window.innerHeight || 540); }

function resizeTitleCanvas() {
  if (!canvas) return;
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  canvas.width = Math.round(viewW() * dpr);
  canvas.height = Math.round(viewH() * dpr);
  canvas.style.width = viewW() + 'px';
  canvas.style.height = viewH() + 'px';
  return dpr;
}

function makeTitleBackdrop() {
  const region = getRegion('valdoria');
  const cam = { x: 0, y: 0, w: viewW(), h: viewH(), visualX: 0, visualY: 0 };
  const hero = { x: 45 * TILE, y: 49 * TILE };
  let dpr = resizeTitleCanvas();
  let time = 0;
  let last = performance.now();

  return {
    resize() {
      dpr = resizeTitleCanvas();
      cam.w = viewW(); cam.h = viewH();
    },
    draw(ts) {
      const raw = Math.min(.05, Math.max(0, (ts - last) / 1000));
      last = ts;
      time += raw;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      cam.w = viewW(); cam.h = viewH();
      cam.x = 45.5 * TILE - cam.w / 2 + Math.sin(time * .045) * Math.min(240, cam.w * .18);
      cam.y = 47.5 * TILE - cam.h / 2 + Math.cos(time * .036) * Math.min(120, cam.h * .12);
      const maxX = region.widthPx - cam.w;
      const maxY = region.heightPx - cam.h;
      cam.x = Math.max(0, Math.min(maxX, cam.x));
      cam.y = Math.max(0, Math.min(maxY, cam.y));
      cam.visualX = cam.x; cam.visualY = cam.y;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, cam.w, cam.h);
      drawTerrain(ctx, region, cam, time);
      drawWaterGlow(ctx, region, cam, hero, time);
      drawShrines(ctx, region, cam, time);
      drawStones(ctx, region, cam, time);
      drawEnvironment(ctx, region, cam, time);

      // Niebla dorada y viñeta para integrar el menú con el mundo.
      const fog = ctx.createRadialGradient(cam.w * .5, cam.h * .42, 10, cam.w * .5, cam.h * .5, Math.max(cam.w, cam.h) * .78);
      fog.addColorStop(0, 'rgba(230,189,109,.035)');
      fog.addColorStop(.42, 'rgba(9,12,22,.12)');
      fog.addColorStop(1, 'rgba(4,6,12,.86)');
      ctx.fillStyle = fog;
      ctx.fillRect(0, 0, cam.w, cam.h);

      // Motas de luz sobre la aldea.
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      for (let i = 0; i < 26; i++) {
        const p = time * .18 + i * 2.1;
        const x = (i * 137.5 + Math.sin(p) * 40) % cam.w;
        const y = (i * 83.7 - time * (5 + i % 4) + Math.sin(p * 1.7) * 18) % cam.h;
        const a = .12 + Math.sin(p * 2) * .08;
        ctx.fillStyle = `rgba(255,224,150,${Math.max(.03, a)})`;
        ctx.beginPath();
        ctx.arc(x < 0 ? x + cam.w : x, y < 0 ? y + cam.h : y, .9 + (i % 3) * .55, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  };
}

function startTitleLoop() {
  if (titleLoop) return;
  if (!titleBackdrop) titleBackdrop = makeTitleBackdrop();
  titleBackdrop.resize();
  const step = (ts) => {
    if (!titleLoop) return;
    titleBackdrop.draw(ts);
    titleLoop = requestAnimationFrame(step);
  };
  titleLoop = requestAnimationFrame(step);
}

function stopTitleLoop() {
  if (titleLoop) cancelAnimationFrame(titleLoop);
  titleLoop = 0;
}

function hideTransientScreens() {
  ['dialogue', 'resonance', 'cutscene'].forEach(id => $(id)?.classList.add('hidden'));
  ui?.closeAll?.(true);
  ui?.clearTransientInput?.();
}

function updateContinueState() {
  const btn = $('btn-continue');
  if (!btn) return;
  const available = hasAnySave();
  btn.disabled = !available;
  btn.textContent = available ? 'CONTINUAR LEYENDA' : 'SIN LEYENDA GUARDADA';
}

function goTitle() {
  if (game) {
    try { game.stop(); } catch (e) { console.warn(e); }
    game = null;
  }
  if (ui) ui.game = null;
  ui?.hideHud?.();
  hideTransientScreens();
  $('creation-screen')?.classList.add('hidden');
  $('title-screen')?.classList.remove('hidden');
  updateContinueState();
  startTitleLoop();
  if (audio.ctx) audio.playTheme('title');
  input.clearTransientInput();
  document.title = 'La Espada Celestial';
}

function startGame({ profile = null, save = null } = {}) {
  stopTitleLoop();
  hideTransientScreens();
  ui.creation = null;
  cancelAnimationFrame(ui.creationRAF);
  $('creation-screen')?.classList.add('hidden');
  $('title-screen')?.classList.add('hidden');
  if (game) {
    try { game.stop(); } catch (e) { console.warn(e); }
    game = null;
  }
  ui.hideHud();

  game = new Game({
    canvas,
    audio,
    input,
    ui,
    settings,
    profile,
    save,
    onExitToTitle: goTitle,
  });
  ui.setGame(game);
  game.start();

  if (!save && !Object.keys(game.quests).length) {
    game.startQuest('m1', true);
    ui.toast('MISIÓN · El primer latido', 'gold');
  }
  if (save && !Object.keys(game.quests).length) {
    game.startQuest('m1', true);
  }
  ui.refreshHud();
}

function beginNewGame(profile) {
  if (!profile) return;
  audio.sfx('select');
  // La cinemática del prólogo se muestra antes de entregar el control.
  startGame({ profile });
  // startGame ya inició el bucle; congelamos el mundo hasta cerrar la cinemática.
  game.started = false;
  ui.playCutscene(CUTSCENES.intro, () => {
    if (!game) return;
    game.started = true;
    game.input.clearTransient();
    game.ui?.showZone(game.region.name, game.region.subtitle);
    game.audio.playTheme(game.region.music || game.regionId);
    game.save('auto', true);
    ui.refreshHud();
  });
}

function continueLatest() {
  const save = latestSave();
  if (!save) { ui.toast('No hay ninguna leyenda guardada', 'danger'); return; }
  audio.sfx('select');
  startGame({ save: save.data });
}

function init() {
  if (!canvas) throw new Error('Falta el lienzo #game');

  ui = new UIController({
    audio,
    settings,
    onNewGame: beginNewGame,
    onLoadSave: (data) => startGame({ save: data }),
    onExitToTitle: goTitle,
    onSettingsChange: (next) => {
      Object.assign(settings, next);
      audio.setMusicVolume(settings.music ?? .55);
      audio.setSfxVolume(settings.sfx ?? .7);
      const soundOn = settings.musicOn !== false || settings.sfxOn !== false;
      audio.toggle(soundOn);
    },
  });

  input.onFirstGesture = () => {
    audio.init();
    if (audio.pendingTheme) {
      const name = audio.pendingTheme;
      const combat = !!audio.pendingCombat;
      audio.pendingTheme = null;
      audio.playTheme(name, combat);
    } else if (!game) {
      audio.playTheme('title');
    }
  };

  $('btn-new')?.addEventListener('click', () => {
    audio.sfx('menu');
    ui.openCreation();
  });
  $('btn-continue')?.addEventListener('click', continueLatest);
  $('btn-title-settings')?.addEventListener('click', () => {
    audio.sfx('menu');
    ui.openSettingsStandalone();
  });

  window.addEventListener('resize', () => {
    if (titleLoop && titleBackdrop) titleBackdrop.resize();
    if (game) game.resize();
  });
  window.addEventListener('orientationchange', () => {
    setTimeout(() => {
      if (titleLoop && titleBackdrop) titleBackdrop.resize();
      if (game) { game.resize(); game.camera?.resize(game.viewW(), game.viewH()); game.camera?.clampToWorld(); }
    }, 120);
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) audio.suspend();
    else if (audio.ctx) audio.resume();
  });

  window.addEventListener('error', (e) => {
    if (!e?.error) return;
    if (!game && !ui?.creation) showFatal(e.error);
  });
  window.addEventListener('unhandledrejection', (e) => {
    if (!game && !ui?.creation) showFatal(e.reason);
  });

  updateContinueState();
  startTitleLoop();
  // Si ya hubo una interacción previa (recarga con audio permitido), intenta música.
  if (audio.ctx) audio.playTheme('title');
  // Diagnóstico accesible desde la consola del navegador (no afecta al juego).
  window.__LEC = {
    get game() { return game; },
    get ui() { return ui; },
    get audio() { return audio; },
    get input() { return input; },
    get settings() { return settings; },
  };
  hideBoot();
}

try {
  init();
} catch (err) {
  hideBoot();
  showFatal(err);
}
