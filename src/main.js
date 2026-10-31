import * as THREE from 'three';
import { AudioEngine } from './audio.js';
import { Game } from './game.js';
import { TitleScene, CharacterPreview } from './scenes.js';
import { UI } from './ui.js';
import { SAVE_KEY } from './data.js';

const ACTIONS = {
  KeyJ: 'attack',
  KeyK: 'heavy',
  Space: 'dodge',
  KeyR: 'spell',
  KeyC: 'creature',
  KeyF: 'ultimate',
  KeyH: 'potion',
};

const KEY_LABELS = {
  KeyW: 'W', KeyA: 'A', KeyS: 'S', KeyD: 'D',
  ArrowUp: '↑', ArrowLeft: '←', ArrowDown: '↓', ArrowRight: '→',
  ShiftLeft: 'Shift', ShiftRight: 'Shift', Space: 'Espacio',
};

function isTypingTarget(target) {
  return target instanceof HTMLElement
    && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable);
}

function readSave() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

class App {
  constructor() {
    this.canvas = document.getElementById('game-canvas');
    this.mode = 'loading';
    this.game = null;
    this.audio = new AudioEngine();
    this.clock = new THREE.Clock();
    this.elapsed = 0;
    this.lastFrame = performance.now();
    this.audioUnlocked = false;
    this.quality = 'auto';
    this.qualityProfile = null;
    this.inputBlocked = false;
    this.boundKeys = new Set();
    this.offline = !navigator.onLine;

    this.createRenderer();
    this.createCamera();

    this.ui = new UI();
    this.ui.setApp(this);

    this.titleScene = new TitleScene(this.renderer);
    this.previewScene = null;
    this.currentScene = this.titleScene.scene;
    this.currentCamera = this.titleScene.camera;

    this.bindEvents();
    this.resize();
    this.showTitle();
    this.ui.setLoading(false);

    this.loop = this.loop.bind(this);
    requestAnimationFrame(this.loop);
  }

  createRenderer() {
    try {
      this.renderer = new THREE.WebGLRenderer({
        canvas: this.canvas,
        antialias: true,
        alpha: false,
        powerPreference: 'high-performance',
        stencil: false,
      });
    } catch (error) {
      console.error('No se pudo iniciar WebGL', error);
      this.renderer = null;
      const loading = document.getElementById('loading-screen');
      if (loading) {
        loading.innerHTML = '<div class="loading-title">LA ESPADA CELESTIAL</div><div class="loading-text">Tu navegador no puede dibujar el Velo. Activa WebGL o prueba otro navegador.</div>';
      }
      return;
    }
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.08;
    this.renderer.setClearColor('#070d1b', 1);
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  }

  createCamera() {
    this.camera = new THREE.PerspectiveCamera(42, 1, 0.1, 340);
    this.camera.position.set(0, 15.5, 17.5);
    this.camera.lookAt(0, 1.45, 0);
  }

  /* ------------------------------------------------------------------ */
  /* Render quality & viewport                                           */
  /* ------------------------------------------------------------------ */

  setQuality(quality = 'auto') {
    this.quality = quality;
    if (!this.renderer) return;
    const mobile = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent)
      || Math.min(window.innerWidth, window.innerHeight) < 720;
    const dpr = window.devicePixelRatio || 1;
    let ratio;
    let shadows;
    if (quality === 'bajo') {
      ratio = Math.min(1, dpr);
      shadows = false;
    } else if (quality === 'medio') {
      ratio = Math.min(1.25, dpr);
      shadows = true;
    } else if (quality === 'alto') {
      ratio = Math.min(2, dpr);
      shadows = true;
    } else {
      ratio = Math.min(mobile ? 1.45 : 1.85, dpr);
      shadows = !mobile;
    }
    this.qualityProfile = { ratio, shadows, mobile };
    this.renderer.setPixelRatio(ratio);
    this.renderer.shadowMap.enabled = shadows;
    this.resize();
  }

  resize() {
    if (!this.renderer) return;
    const width = Math.max(1, window.innerWidth);
    const height = Math.max(1, window.innerHeight);
    this.renderer.setSize(width, height, false);
    const aspect = width / height;
    this.camera.aspect = aspect;
    this.camera.updateProjectionMatrix();
    this.titleScene?.resize(width, height);
    this.previewScene?.resize(width, height);
  }

  /* ------------------------------------------------------------------ */
  /* Events                                                              */
  /* ------------------------------------------------------------------ */

  bindEvents() {
    window.addEventListener('resize', () => this.resize());
    window.addEventListener('orientationchange', () => setTimeout(() => this.resize(), 120));

    const unlockAudio = () => {
      if (this.audioUnlocked) return;
      this.audioUnlocked = true;
      this.audio.start().then(() => {
        this.audio.setMusicVolume(this.ui.settings.music);
        this.audio.setSfxVolume(this.ui.settings.sfx);
        this.audio.setTheme(this.mode === 'game' && this.game ? this.game.state.region : 'title', false);
      }).catch(() => {});
    };
    window.addEventListener('pointerdown', unlockAudio, { passive: true });
    window.addEventListener('keydown', unlockAudio);

    window.addEventListener('keydown', (e) => this.onKeyDown(e));
    window.addEventListener('keyup', (e) => this.onKeyUp(e));
    window.addEventListener('blur', () => this.releaseInput());

    const preview = document.querySelector('.creation-preview');
    if (preview) {
      preview.style.pointerEvents = 'auto';
      let dragging = false;
      let lastX = 0;
      preview.addEventListener('pointerdown', (e) => {
        dragging = true;
        lastX = e.clientX;
        preview.setPointerCapture?.(e.pointerId);
      });
      preview.addEventListener('pointermove', (e) => {
        if (!dragging || !this.previewScene) return;
        this.previewScene.manualYaw += (e.clientX - lastX) * 0.012;
        lastX = e.clientX;
      });
      const stop = () => { dragging = false; };
      preview.addEventListener('pointerup', stop);
      preview.addEventListener('pointercancel', stop);
    }

    window.addEventListener('online', () => {
      this.offline = false;
      document.getElementById('offline-indicator')?.classList.add('hidden');
    });
    window.addEventListener('offline', () => {
      this.offline = true;
      document.getElementById('offline-indicator')?.classList.remove('hidden');
    });
    if (this.offline) document.getElementById('offline-indicator')?.classList.remove('hidden');

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.releaseInput();
        if (this.game && this.mode === 'game') {
          this.game.save();
        }
      } else {
        this.clock.getDelta();
      }
    });
  }

  onKeyDown(e) {
    if (isTypingTarget(e.target)) return;

    const ui = this.ui;
    const overlayDialogue = !document.getElementById('dialogue-overlay')?.classList.contains('hidden');
    const overlayCinematic = !document.getElementById('cinematic-overlay')?.classList.contains('hidden');

    if (overlayDialogue) {
      if (e.code === 'KeyE' || e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        if (!e.repeat) ui.advanceDialogue();
      }
      return;
    }
    if (overlayCinematic) {
      if (e.code === 'KeyE' || e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        if (!e.repeat) ui.advanceCinematic();
      }
      return;
    }

    if (e.code === 'Escape') {
      e.preventDefault();
      if (this.mode === 'game') this.openPause();
      else if (this.mode === 'pause') this.resume();
      else if (this.mode === 'map') this.closeMap();
      else if (this.mode === 'death' || this.mode === 'ending') this.quitToTitle();
      return;
    }

    if (this.mode === 'pause') {
      if (e.code === 'KeyM') this.openMap();
      return;
    }

    if (this.mode !== 'game' || !this.game) return;

    if (e.code === 'KeyM') {
      e.preventDefault();
      this.openMap();
      return;
    }
    if (e.code === 'KeyE') {
      e.preventDefault();
      if (!e.repeat) this.game.interact();
      return;
    }
    if (e.code === 'KeyQ') {
      e.preventDefault();
      this.game.setBlocking(true);
      return;
    }

    if (KEY_LABELS[e.code] || ['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowLeft', 'ArrowDown', 'ArrowRight', 'ShiftLeft', 'ShiftRight'].includes(e.code)) {
      if (e.code.startsWith('Arrow') || e.code === 'Space') e.preventDefault();
      this.game.setKey(e.code, true);
      this.boundKeys.add(e.code);
    }

    const action = ACTIONS[e.code];
    if (action && !e.repeat) {
      e.preventDefault();
      this.game.action(action);
    }
  }

  onKeyUp(e) {
    if (!this.game) return;
    if (e.code === 'KeyQ') {
      this.game.setBlocking(false);
      return;
    }
    if (this.boundKeys.has(e.code)) {
      this.game.setKey(e.code, false);
      this.boundKeys.delete(e.code);
    }
  }

  releaseInput() {
    if (!this.game) return;
    for (const code of this.boundKeys) this.game.setKey(code, false);
    this.boundKeys.clear();
    this.game.setBlocking(false);
    this.ui.joystick.x = 0;
    this.ui.joystick.y = 0;
    this.ui.joystick.active = false;
    const knob = document.getElementById('joystick-knob');
    if (knob) knob.style.transform = 'translate(0px, 0px)';
  }

  /* ------------------------------------------------------------------ */
  /* Mode transitions                                                    */
  /* ------------------------------------------------------------------ */

  showTitle() {
    this.releaseInput();
    if (this.game) {
      this.game.dispose();
      this.game = null;
    }
    this.ui.showTitle();
    this.mode = 'title';
    this.currentScene = this.titleScene.scene;
    this.currentCamera = this.titleScene.camera;
    this.audio.setTheme('title', false);
    this.ui.setLoading(false);
  }

  showCreation() {
    this.releaseInput();
    this.ui.showCreation();
    this.mode = 'creation';
  }

  showPreview(profile) {
    if (!this.previewScene) this.previewScene = new CharacterPreview(this.renderer);
    this.previewScene.setProfile(profile);
    this.previewScene.resize(window.innerWidth, window.innerHeight);
    this.currentScene = this.previewScene.scene;
    this.currentCamera = this.previewScene.camera;
    if (this.mode !== 'creation') this.mode = 'creation';
  }

  startNewGame(profile) {
    this.releaseInput();
    if (this.game) this.game.dispose();
    this.ui.hideAll();
    this.ui.setLoading(true);
    this.ui.showHUD();
    this.ui.hudCache = {};
    this.ui.questCache = '';
    this.ui.interactionCache = '';
    this.ui.bossCache = '';

    const state = Game.createState(profile);
    state.flags = { ...(state.flags || {}), introSeen: true };
    this.game = new Game(this, state);
    this.mode = 'game';
    this.currentScene = this.game.scene;
    this.currentCamera = this.camera;
    this.audio.start().then(() => {
      this.audio.setTheme(state.region, false);
    }).catch(() => {});
    this.audio.setTheme(state.region, false);
    this.game.startIntro();
    this.game.save();
    this.resize();
    this.ui.setLoading(false);
  }

  continueGame() {
    const save = readSave();
    if (!save) {
      this.ui.toast('Sin partida', 'No hay una leyenda guardada en este dispositivo.', 'error');
      return;
    }
    this.releaseInput();
    if (this.game) this.game.dispose();
    this.ui.hideAll();
    this.ui.setLoading(true);
    this.ui.showHUD();
    this.ui.hudCache = {};
    this.ui.questCache = '';
    this.ui.interactionCache = '';
    this.ui.bossCache = '';

    this.game = new Game(this, save);
    this.mode = 'game';
    this.currentScene = this.game.scene;
    this.currentCamera = this.camera;
    this.audio.start().then(() => {
      this.audio.setTheme(this.game.state.region, false);
    }).catch(() => {});
    this.audio.setTheme(this.game.state.region, false);
    this.resize();
    this.ui.setLoading(false);
  }

  openPause() {
    if (this.mode !== 'game' || !this.game) return;
    this.releaseInput();
    this.mode = 'pause';
    this.ui.openPause('status');
  }

  resume() {
    if (!this.game) return;
    this.ui.closePause();
    this.ui.closeMap();
    this.mode = 'game';
    this.clock.getDelta();
  }

  openMap() {
    if (!this.game) return;
    this.releaseInput();
    this.mode = 'map';
    this.ui.closePause();
    this.ui.openMap();
  }

  closeMap() {
    this.ui.closeMap();
    if (this.game) {
      this.mode = 'game';
      this.clock.getDelta();
    }
  }

  enterDeath() {
    this.releaseInput();
    this.mode = 'death';
    this.ui.showDeath();
  }

  resumeFromDeath() {
    this.ui.hideDeath();
    if (!this.game) return;
    this.mode = 'game';
    this.clock.getDelta();
  }

  enterEnding(ending) {
    if (!this.game) return;
    this.releaseInput();
    this.mode = 'ending';
    const s = this.game.state;
    this.ui.showEnding(ending, {
      playTime: s.playTime,
      level: s.player.level,
      creatures: s.creatures.length,
      kills: s.stats.kills || 0,
      lore: s.lore.length,
    });
  }

  continueAfterEnding() {
    if (!this.game) return;
    this.ui.hideEnding();
    this.ui.showHUD();
    this.game.frozen = false;
    this.game.state.ending = null;
    this.mode = 'game';
    this.clock.getDelta();
    this.game.save();
  }

  quitToTitle() {
    this.releaseInput();
    this.ui.hideCapture?.();
    this.ui.closePause();
    this.ui.closeMap();
    this.ui.hideDeath();
    this.ui.hideEnding();
    this.showTitle();
  }

  /* ------------------------------------------------------------------ */
  /* Loop                                                                */
  /* ------------------------------------------------------------------ */

  loop(now) {
    requestAnimationFrame(this.loop);
    if (!this.renderer) return;

    const rawDt = Math.min(0.05, Math.max(0, (now - this.lastFrame) / 1000 || 0.016));
    this.lastFrame = now;
    this.elapsed += rawDt;
    const dt = Math.min(rawDt, 1 / 20);

    if (this.mode === 'title') {
      this.titleScene.update(dt);
      this.currentScene = this.titleScene.scene;
      this.currentCamera = this.titleScene.camera;
    } else if (this.mode === 'creation') {
      this.previewScene?.update(dt);
      this.currentScene = this.previewScene?.scene || this.titleScene.scene;
      this.currentCamera = this.previewScene?.camera || this.titleScene.camera;
    } else if (this.game) {
      if (this.mode === 'game') {
        this.game.update(dt);
      } else if (this.mode === 'death') {
        this.game.update(dt);
      }
      this.currentScene = this.game.scene;
      this.currentCamera = this.camera;
    }

    this.audio.update();
    this.renderer.render(this.currentScene, this.currentCamera);
  }
}

window.addEventListener('error', (event) => {
  console.error('Error en LA ESPADA CELESTIAL', event.error || event.message);
});

const app = new App();
window.__espada = app;

export default app;
