// LA ESPADA CELESTIAL: RPG RETRO
// Motor principal: estado, mundo, combate, progresión, guardado y renderizado.

import {
  VERSION, SAVE_PREFIX, CLASSES, WEAPONS, ARMORS, SHIELDS, ACCESSORIES, ITEMS, SPELLS,
  CREATURES, ENEMIES, QUESTS, ACHIEVEMENTS, LORE, ZONE_INFO,
} from './data.js';
import {
  TAU, clamp, lerp, damp, dist, rand, randInt, chance, choice, angleDiff, formatTime,
  deepClone, RNG, AudioEngine, Input, readSave, writeSave, deleteSave, listSaves, vibrate,
} from './core.js';
import { drawProp, drawNPC, drawGlow, drawStar, drawMote, drawWeapon, drawCreatureGlyph, hexToRgba } from './art.js';
import { createWorld, getSpawnersFor } from './world.js';
import { Player, Enemy, Projectile, Pickup, Summon } from './entities.js';
import { UI } from './ui.js';
import { buildNpcDialogue, handleNpcChoice } from './game-dialogue.js';

const SETTINGS_KEY = `${SAVE_PREFIX}settings`;
const MAX_LEVEL = 30;

const DEFAULT_TOUCH_LAYOUT = {
  joystick: { x: 0.105, y: 0.82 },
  attack: { x: 0.91, y: 0.84 },
  dodge: { x: 0.82, y: 0.885 },
  skill: { x: 0.925, y: 0.67 },
  interact: { x: 0.815, y: 0.755 },
  magic: { x: 0.935, y: 0.525 },
  block: { x: 0.845, y: 0.61 },
  weapon: { x: 0.225, y: 0.86 },
  creature: { x: 0.225, y: 0.76 },
  potion: { x: 0.155, y: 0.72 },
  pause: { x: 0.96, y: 0.27 },
  quick: { x: 0.96, y: 0.35 },
};

const cloneTouchLayout = () => {
  const out = {};
  for (const [k, v] of Object.entries(DEFAULT_TOUCH_LAYOUT)) out[k] = { x: v.x, y: v.y };
  return out;
};

const defaultSettings = () => ({
  music: 0.4,
  sfx: 0.62,
  muted: false,
  shake: true,
  damageNumbers: true,
  vibration: true,
  quality: 'high',
  touchMode: 'auto',
  touchScale: 1,
  touchOpacity: 0.92,
  touchLayout: cloneTouchLayout(),
});

const freshQuests = () => {
  const q = {};
  for (const id of Object.keys(QUESTS)) q[id] = { stage: 0, status: id === 'main' ? 'active' : 'inactive' };
  return q;
};

const INTRO_PAGES = [
  { chapter: 'PRÓLOGO', title: 'El cielo se rompió', text: 'Hace mil años, la Espada Celestial partió la noche en dos. Desde entonces, Aurelia ha vivido bajo un amanecer que nunca termina… hasta hoy.' },
  { chapter: 'PRÓLOGO', title: 'La última luz', text: 'El sol se está apagando. En Aldea del Alba, una anciana custodia la memoria de la orden que juró proteger la espada. Tú llevas su sangre, aunque aún no lo sepas.' },
  { chapter: 'PRÓLOGO', title: 'Un juramento', text: 'Tres fragmentos. Tres juramentos. Cruza el Bosque de Lumen, despierta las runas de Aether y sube al Santuario Celestial. El último amanecer depende de ti.' },
];

const ENDING_PAGES = [
  { chapter: 'EPÍLOGO', title: 'El último amanecer', text: 'Kael cae, y la noche se retira como una marea. La Espada Celestial vuelve a arder en tu mano: no con furia, sino con la paciencia de mil amaneceres.' },
  { chapter: 'EPÍLOGO', title: 'Aurelia despierta', text: 'La luz regresa a la aldea, al bosque y a las ruinas. Las luciérnagas bailan sobre el pozo, los espectros recuerdan sus nombres y las campanas vuelven a sonar.' },
  { chapter: 'EPÍLOGO', title: 'Un nuevo juramento', text: 'Mira te espera junto al santuario. «No fue la espada quien venció a la noche», dice. «Fue el juramento de no dejar de amanecer.» Y tú prometes recordarlo.' },
];

// ---------------------------------------------------------------------------
// MOTOR
// ---------------------------------------------------------------------------

export class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { alpha: false });
    this.dpr = 1;
    this.viewW = 1280;
    this.viewH = 720;
    this.scene = 'title';
    this.settings = this.loadSettings();
    this.audio = new AudioEngine();
    this.audio.setVolumes(this.settings.music, this.settings.sfx);
    this.audio.setMuted(this.settings.muted);

    this.state = null;
    this.world = null;
    this.player = null;
    this.enemies = [];
    this.projectiles = [];
    this.pickups = [];
    this.summons = [];
    this.particles = [];
    this.floatTexts = [];
    this.meteors = [];
    this.beams = [];
    this.rains = [];
    this.lightnings = [];
    this.timers = [];
    this.respawns = [];
    this.pendingSpawns = [];
    this.triggered = new Set();
    this.questMarkers = [];
    this.promptTarget = null;
    this.promptTimer = 0;
    this.hitStop = 0;
    this.comboCount = 0;
    this.comboTimer = 0;
    this.pendingEnding = 0;
    this.autoSaveTimer = 0;
    this.titleT = 0;
    this.lastTime = 0;
    this.transitioning = false;
    this.titleStars = this.makeTitleStars();

    this.camera = {
      x: 0,
      y: 0,
      shakeT: 0,
      shakeMag: 0,
      shake(mag = 6) {
        if (!mag) return;
        this.shakeMag = Math.max(this.shakeMag, mag);
        this.shakeT = Math.max(this.shakeT, 0.22 + Math.min(0.22, mag * 0.006));
      },
    };

    this.input = new Input();
    this.input.onUnlock = () => this.audio.unlock();
    this.input.onGamepad = (connected, id) => {
      if (connected) this.ui.toast('Mando conectado', id?.slice(0, 46) || 'Listo para jugar.', 'success');
      else this.ui.toast('Mando desconectado', 'Puedes seguir con teclado o táctil.', 'info');
    };

    this.ui = new UI(this);
    this.audio.playMusic('title');
    this.ui.showTitle();
    this.resize();
  }

  // -------------------------------------------------------------------------
  // AJUSTES
  // -------------------------------------------------------------------------

  loadSettings() {
    const base = defaultSettings();
    try {
      const raw = localStorage.getItem(SETTINGS_KEY);
      if (!raw) return base;
      const parsed = JSON.parse(raw);
      const merged = { ...base, ...parsed };
      merged.touchLayout = { ...cloneTouchLayout(), ...(parsed.touchLayout || {}) };
      merged.quality = ['high', 'medium', 'low'].includes(merged.quality) ? merged.quality : 'high';
      merged.touchMode = ['auto', 'always', 'never'].includes(merged.touchMode) ? merged.touchMode : 'auto';
      merged.music = clamp(Number(merged.music), 0, 1);
      merged.sfx = clamp(Number(merged.sfx), 0, 1);
      merged.touchScale = clamp(Number(merged.touchScale) || 1, 0.75, 1.35);
      merged.touchOpacity = clamp(Number(merged.touchOpacity) || 0.92, 0.35, 1);
      return merged;
    } catch {
      return base;
    }
  }

  saveSettings() {
    try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(this.settings)); } catch { /* noop */ }
  }

  updateSetting(key, value) {
    if (key === 'music' || key === 'sfx') {
      this.settings[key] = clamp(Number(value), 0, 1);
      this.audio.setVolumes(this.settings.music, this.settings.sfx);
    } else if (key === 'touchScale' || key === 'touchOpacity') {
      this.settings[key] = clamp(Number(value), key === 'touchScale' ? 0.75 : 0.35, key === 'touchScale' ? 1.35 : 1);
      this.ui.applyTouchLayout();
    } else if (key === 'muted') {
      this.settings.muted = !!value;
      this.audio.setMuted(this.settings.muted);
      this.ui.updateAudioButton();
    } else if (key === 'quality') {
      this.settings.quality = ['high', 'medium', 'low'].includes(value) ? value : 'high';
      this.resize();
    } else if (key === 'touchMode') {
      this.settings.touchMode = ['auto', 'always', 'never'].includes(value) ? value : 'auto';
      this.ui.updateTouchVisibility();
    } else {
      this.settings[key] = value;
    }
    this.saveSettings();
  }

  resetTouchLayout() {
    this.settings.touchLayout = cloneTouchLayout();
    this.saveSettings();
    this.ui.applyTouchLayout();
    this.ui.toast('Controles restablecidos', 'La disposición vuelve a su lugar original.', 'success');
    this.audio.sfx('ui');
  }

  setTouchPosition(key, x, y) {
    if (!this.settings.touchLayout[key]) this.settings.touchLayout[key] = { x, y };
    this.settings.touchLayout[key].x = clamp(x, 0.02, 0.98);
    this.settings.touchLayout[key].y = clamp(y, 0.04, 0.96);
    this.saveSettings();
  }

  toggleAudio() {
    this.settings.muted = !this.settings.muted;
    this.audio.setMuted(this.settings.muted);
    this.saveSettings();
    this.ui.updateAudioButton();
    this.ui.toast(this.settings.muted ? 'Audio silenciado' : 'Audio activado', '', 'info', 1600);
  }

  async toggleFullscreen() {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen?.();
        if (screen.orientation?.lock) await screen.orientation.lock('landscape').catch(() => {});
        this.ui.toast('Pantalla completa', 'Pulsa Esc o el botón de nuevo para salir.', 'success');
      } else {
        await document.exitFullscreen?.();
      }
    } catch {
      this.ui.toast('Pantalla completa no disponible', 'Tu navegador no permite activarla aquí.', 'error');
    }
  }

  resize() {
    if (!this.canvas) return;
    const rect = this.canvas.getBoundingClientRect();
    const maxDpr = this.settings.quality === 'low' ? 1 : this.settings.quality === 'medium' ? 1.5 : 2;
    this.dpr = Math.min(window.devicePixelRatio || 1, maxDpr);
    this.viewW = Math.max(320, Math.round(rect.width || window.innerWidth || 1280));
    this.viewH = Math.max(240, Math.round(rect.height || window.innerHeight || 720));
    this.canvas.width = Math.max(1, Math.round(this.viewW * this.dpr));
    this.canvas.height = Math.max(1, Math.round(this.viewH * this.dpr));
    if (this.world && this.player) this.snapCamera();
  }

  // -------------------------------------------------------------------------
  // BUCLE
  // -------------------------------------------------------------------------

  start() {
    this.lastTime = performance.now();
    const loop = (ts) => {
      const dt = clamp((ts - this.lastTime) / 1000, 0, 0.05);
      this.lastTime = ts;
      this.titleT += dt;
      try {
        this.update(dt);
        this.render(ts / 1000);
      } catch (err) {
        console.error('[La Espada Celestial]', err);
      }
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  update(dt) {
    this.audio.update();
    this.input.update();
    this.handleSceneInput();

    if (this.scene === 'playing') {
      this.updatePlaying(dt);
    } else if (this.scene === 'dialogue') {
      this.ui.updateDialogue(dt);
    } else if (this.scene === 'paused' || this.scene === 'shop' || this.scene === 'quick' || this.scene === 'modal') {
      // El mundo queda congelado; solo respiramos las partículas de la interfaz.
    } else if (this.scene === 'cinematic') {
      this.pendingEnding = 0;
    }
    if (this.pendingEnding > 0) {
      this.pendingEnding -= dt;
      if (this.pendingEnding <= 0) this.playEnding();
    }
  }

  handleSceneInput() {
    const inp = this.input;
    if (this.scene === 'playing') {
      if (inp.wasPressed('pause')) { this.togglePause(); return; }
      if (inp.wasPressed('quick')) { this.openQuick(); return; }
      if (inp.wasPressed('interact')) { this.interact(); return; }
    } else if (this.scene === 'paused') {
      if (inp.wasPressed('pause')) { this.resume(); return; }
    } else if (this.scene === 'quick') {
      if (inp.wasPressed('quick') || inp.wasPressed('pause')) { this.closeQuick(); return; }
    } else if (this.scene === 'dialogue') {
      if (inp.wasPressed('interact') || inp.wasPressed('attack') || inp.wasPressed('confirm')) {
        this.ui.advanceDialogue();
      }
    } else if (this.scene === 'cinematic') {
      if (inp.wasPressed('interact') || inp.wasPressed('attack') || inp.wasPressed('confirm')) {
        this.ui.advanceCinematic();
      }
    }
  }

  updatePlaying(dt) {
    if (!this.state || !this.player || !this.world) return;
    this.state.playTime += dt;
    this.autoSaveTimer += dt;
    if (this.autoSaveTimer > 90) {
      this.autoSaveTimer = 0;
      this.autoSave(true);
    }

    let step = dt;
    if (this.hitStop > 0) {
      this.hitStop = Math.max(0, this.hitStop - dt);
      step = dt * 0.12;
    }

    this.world.update(step);
    this.player.update(step, this.input);
    if (this.player.state === 'dead') {
      this.updateEffects(step);
      this.ui.updateHUD(false, dt);
      return;
    }

    for (const e of this.enemies) e.update(step, this);
    for (const p of this.projectiles) p.update(step);
    for (const p of this.pickups) p.update(step);
    for (const s of this.summons) s.update(step);
    this.updateEffects(step);
    this.updateTriggers(step);
    this.updateRespawns(step);
    this.updatePrompt(step);
    this.updateCamera(step);

    this.enemies = this.enemies.filter((e) => !(e.dead && e.deathTimer <= 0));
    this.projectiles = this.projectiles.filter((p) => !p.dead);
    this.pickups = this.pickups.filter((p) => !p.dead);
    this.summons = this.summons.filter((s) => !s.dead);

    if (this.comboTimer > 0) {
      this.comboTimer -= dt;
      if (this.comboTimer <= 0) this.comboCount = 0;
    }

    this.ui.updateHUD(false, dt);
    this.checkExplorer();
    if (this.state.player.hp <= 0 && this.scene === 'playing') this.onPlayerDeath();
  }

  updateEffects(dt) {
    for (const p of this.particles) {
      p.life -= dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += (p.gravity || 0) * dt;
      p.vx *= 1 - Math.min(0.9, (p.drag || 0) * dt);
      p.vy *= 1 - Math.min(0.9, (p.drag || 0) * dt);
    }
    this.particles = this.particles.filter((p) => p.life > 0);
    for (const f of this.floatTexts) {
      f.life -= dt;
      f.y -= 32 * dt;
      f.vy = (f.vy || 0) - 18 * dt;
      f.y += (f.vy || 0) * dt;
    }
    this.floatTexts = this.floatTexts.filter((f) => f.life > 0);

    for (const m of this.meteors) {
      m.t -= dt;
      if (m.t <= 0 && !m.done) {
        m.done = true;
        this.explodeMeteor(m);
      }
    }
    this.meteors = this.meteors.filter((m) => !m.done || m.t > -0.6);

    for (const b of this.beams) {
      b.t -= dt;
      if (b.t <= b.charge && !b.hit) {
        b.hit = true;
        this.damagePlayerByBeam(b);
      }
    }
    this.beams = this.beams.filter((b) => b.t > 0);

    for (const r of this.rains) {
      r.t -= dt;
      r.spawnTimer -= dt;
      if (r.spawnTimer <= 0 && r.spawned < r.count) {
        r.spawnTimer = r.interval;
        r.spawned++;
        const a = rand(TAU);
        const d = Math.sqrt(Math.random()) * r.radius;
        const x = r.x + Math.cos(a) * d;
        const y = r.y + Math.sin(a) * d;
        this.spawnProjectile({
          x: x + rand(-14, 14), y: y - 340, vx: 0, vy: 540, r: 6, damage: r.damage,
          team: r.team || 'player', kind: r.kind || 'arrow', color: '#ffe6a0', life: 1.4, pierce: 1,
        });
        this.addParticles(x, y - 320, 3, '#ffe6a0', 'spark');
      }
    }
    this.rains = this.rains.filter((r) => r.t > 0 || r.spawned < r.count);

    for (const l of this.lightnings) l.life -= dt;
    this.lightnings = this.lightnings.filter((l) => l.life > 0);

    for (const t of this.timers) {
      t.t -= dt;
      if (t.t <= 0 && !t.done) {
        t.done = true;
        try { t.fn(); } catch (err) { console.error(err); }
      }
    }
    this.timers = this.timers.filter((t) => !t.done);

    if (this.camera.shakeT > 0) this.camera.shakeT = Math.max(0, this.camera.shakeT - dt);
    if (this.camera.shakeT <= 0) this.camera.shakeMag = 0;
  }

  updateRespawns(dt) {
    for (const r of this.respawns) {
      r.timer -= dt;
      if (r.timer <= 0 && !r.done) {
        r.done = true;
        if (dist(this.player.x, this.player.y, r.spawner.x, r.spawner.y) > 220) {
          const e = this.spawnEnemy(r.spawner.type, r.spawner.x, r.spawner.y, r.spawner.level || 1, false, r.spawner);
          if (e) this.addParticles(e.x, e.y - 20, 10, e.def.color, 'spark');
        }
      }
    }
    this.respawns = this.respawns.filter((r) => !r.done);
  }

  updatePrompt(dt) {
    this.promptTimer -= dt;
    if (this.promptTimer > 0) return;
    this.promptTimer = 0.12;
    if (!this.world || !this.player) return;
    const it = this.world.nearInteractable(this.player.x, this.player.y, 98);
    let target = it;
    let html = '';
    if (target) {
      const kind = target.interact?.kind;
      if (kind === 'npc') html = `Hablar con <b>${target.name || 'habitante'}</b>`;
      else if (kind === 'shrine') html = 'Descansar en el <b>santuario</b>';
      else if (kind === 'chest') {
        html = this.state.flags[`chest_${target.id}`] ? 'Cofre <b>vacío</b>' : 'Abrir el <b>cofre</b>';
      } else if (kind === 'portal') html = `Viajar a <b>${target.interact.label || 'otra región'}</b>`;
      else if (kind === 'rune') html = 'Activar la <b>runa</b>';
      else if (kind === 'altar') html = 'Examinar el <b>Altar del Alba</b>';
      else if (kind === 'sign') html = 'Leer el <b>letrero</b>';
      else if (kind === 'lore') html = 'Leer la <b>piedra de lore</b>';
      else if (kind === 'firefly') html = 'Recoger la <b>luciérnaga</b>';
      else if (kind === 'echo') html = 'Recoger el <b>eco de memoria</b>';
      else html = 'Interactuar';
    }
    const cap = this.findCaptureTarget();
    if (!target && cap) {
      target = { capture: cap };
      html = `Vincular a <b>${cap.def.name}</b> <span class="prompt-hp">${Math.ceil(cap.hpRatio * 100)}%</span>`;
    }
    this.promptTarget = target;
    if (html) this.ui.setPrompt(`<span class="prompt-key">Y</span> ${html}`);
    else this.ui.hidePrompt();
  }

  updateCamera(dt) {
    if (!this.world || !this.player) return;
    const lookX = Math.cos(this.player.facing || 0) * 22;
    const lookY = Math.sin(this.player.facing || 0) * 14;
    const tx = clamp(this.player.x + lookX - this.viewW / 2, 0, Math.max(0, this.world.w - this.viewW));
    const ty = clamp(this.player.y + lookY - this.viewH / 2, 0, Math.max(0, this.world.h - this.viewH));
    this.camera.x = damp(this.camera.x, tx, 6.5, dt);
    this.camera.y = damp(this.camera.y, ty, 6.5, dt);
  }

  snapCamera() {
    if (!this.world || !this.player) return;
    this.camera.x = clamp(this.player.x - this.viewW / 2, 0, Math.max(0, this.world.w - this.viewW));
    this.camera.y = clamp(this.player.y - this.viewH / 2, 0, Math.max(0, this.world.h - this.viewH));
  }

  // -------------------------------------------------------------------------
  // RENDER
  // -------------------------------------------------------------------------

  render(t) {
    const ctx = this.ctx;
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    ctx.clearRect(0, 0, this.viewW, this.viewH);
    if (this.scene === 'title') {
      this.drawTitle(ctx, t);
      return;
    }
    if (!this.world || !this.player) {
      this.drawTitle(ctx, t);
      return;
    }
    this.drawWorld(ctx, t);
  }

  drawTitle(ctx, t) {
    const W = this.viewW;
    const H = this.viewH;
    const sky = ctx.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0, '#03050d');
    sky.addColorStop(0.42, '#0a1226');
    sky.addColorStop(0.72, '#182340');
    sky.addColorStop(1, '#080b16');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, H);

    // Estrellas.
    for (const s of this.titleStars) {
      const tw = 0.45 + Math.sin(t * s.speed + s.phase) * 0.4;
      ctx.fillStyle = `rgba(255,243,196,${clamp(s.a * tw, 0, 0.9)})`;
      ctx.beginPath();
      ctx.arc(s.x * W, s.y * H, s.r, 0, TAU);
      ctx.fill();
    }

    // Luna.
    const mx = W * 0.72;
    const my = H * 0.25;
    const mr = Math.min(W, H) * 0.105;
    const halo = ctx.createRadialGradient(mx, my, mr * 0.2, mx, my, mr * 3.4);
    halo.addColorStop(0, 'rgba(255,230,160,.24)');
    halo.addColorStop(0.4, 'rgba(200,210,255,.08)');
    halo.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = halo;
    ctx.beginPath(); ctx.arc(mx, my, mr * 3.4, 0, TAU); ctx.fill();
    const moon = ctx.createRadialGradient(mx - mr * 0.35, my - mr * 0.35, mr * 0.1, mx, my, mr);
    moon.addColorStop(0, '#fff9e8');
    moon.addColorStop(0.65, '#e8dfc4');
    moon.addColorStop(1, '#b8ac8a');
    ctx.fillStyle = moon;
    ctx.beginPath(); ctx.arc(mx, my, mr, 0, TAU); ctx.fill();
    ctx.fillStyle = 'rgba(120,115,95,.16)';
    ctx.beginPath(); ctx.arc(mx - mr * 0.3, my + mr * 0.2, mr * 0.2, 0, TAU); ctx.fill();
    ctx.beginPath(); ctx.arc(mx + mr * 0.36, my - mr * 0.24, mr * 0.12, 0, TAU); ctx.fill();

    // Montañas lejanas.
    const layers = [
      { y: 0.6, c: '#0d1426', amp: 0.07, step: 0.09, speed: 1 },
      { y: 0.68, c: '#0a0f1d', amp: 0.09, step: 0.12, speed: 2 },
      { y: 0.76, c: '#060911', amp: 0.06, step: 0.16, speed: 3 },
    ];
    for (const l of layers) {
      ctx.fillStyle = l.c;
      ctx.beginPath();
      ctx.moveTo(0, H);
      for (let x = 0; x <= W + 40; x += W * l.step) {
        const y = H * l.y + Math.sin(x * 0.006 * l.speed + t * 0.02) * H * l.amp + Math.cos(x * 0.003) * H * l.amp * 0.5;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(W, H);
      ctx.closePath();
      ctx.fill();
    }

    // Ruinas del santuario.
    const baseY = H * 0.83;
    ctx.save();
    ctx.translate(W * 0.7, baseY);
    ctx.fillStyle = '#0b0f1c';
    ctx.fillRect(-W * 0.13, -10, W * 0.26, 18);
    for (let i = 0; i < 5; i++) {
      const x = -W * 0.11 + i * W * 0.055;
      const h = H * (0.11 + (i % 3) * 0.03);
      ctx.fillRect(x, -h, W * 0.016, h);
      ctx.fillRect(x - W * 0.006, -h - 8, W * 0.028, 8);
    }
    ctx.fillRect(-W * 0.12, -H * 0.16, W * 0.24, 9);
    ctx.restore();

    // Espada clavada y héroe.
    const sx = W * 0.69;
    const sy = H * 0.84;
    drawGlow(ctx, sx, sy - 72, 90, '#ffe6a0', 0.16 + Math.sin(t * 1.4) * 0.04);
    ctx.save();
    ctx.translate(sx, sy);
    ctx.scale(1.9, 1.9);
    ctx.rotate(0.08);
    drawWeapon(ctx, 'celestial', 0, -42, -Math.PI / 2, 1.25, '#fff3c4');
    ctx.restore();
    // Silueta del héroe.
    ctx.save();
    ctx.translate(W * 0.62, H * 0.9);
    ctx.fillStyle = '#05070d';
    ctx.beginPath();
    ctx.ellipse(0, 0, 34, 8, 0, 0, TAU); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-14, 0);
    ctx.quadraticCurveTo(-18, -58, -8, -78);
    ctx.quadraticCurveTo(0, -88, 8, -78);
    ctx.quadraticCurveTo(18, -58, 14, 0);
    ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.arc(0, -90, 10, 0, TAU); ctx.fill();
    // Capa.
    ctx.beginPath();
    ctx.moveTo(-8, -74);
    ctx.quadraticCurveTo(-34, -40, -26, -6);
    ctx.lineTo(-4, -18);
    ctx.closePath(); ctx.fill();
    ctx.restore();

    // Niebla y motas.
    for (let i = 0; i < 22; i++) {
      const x = ((i * 137 + t * (6 + (i % 5) * 3)) % (W + 100)) - 50;
      const y = H * (0.55 + (i % 7) * 0.055) + Math.sin(t * 0.4 + i) * 12;
      drawMote(ctx, x, y, 2 + (i % 4), i % 3 ? '#9fe3ff' : '#ffe6a0', 0.12 + (i % 4) * 0.03);
    }
    const vignette = ctx.createRadialGradient(W * 0.6, H * 0.45, Math.min(W, H) * 0.2, W * 0.6, H * 0.45, Math.max(W, H) * 0.75);
    vignette.addColorStop(0, 'rgba(0,0,0,0)');
    vignette.addColorStop(1, 'rgba(2,4,10,.72)');
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, W, H);
  }

  makeTitleStars() {
    const rng = new RNG(7411);
    const out = [];
    for (let i = 0; i < 180; i++) {
      out.push({ x: rng.next(), y: rng.range(0, 0.72), r: rng.range(0.4, 1.7), a: rng.range(0.15, 0.85), speed: rng.range(0.6, 2.4), phase: rng.next() * TAU });
    }
    return out;
  }

  // -------------------------------------------------------------------------
  // CICLO DE PARTIDA
  // -------------------------------------------------------------------------

  showCreation() {
    this.scene = 'create';
    this.ui.showCreation();
    this.audio.playMusic('title');
  }

  startNewGame(draft) {
    const chosen = draft || this.ui.draft;
    if (!chosen) return;
    const nameInput = document.getElementById('create-name');
    const rawName = String(nameInput?.value || chosen.name || '').trim().replace(/[<>]/g, '');
    const name = (rawName || 'Héroe').slice(0, 16);
    const cls = CLASSES[chosen.classId] || CLASSES.caballero;
    const appearance = { ...chosen.appearance };
    if (!appearance.outfit) appearance.outfit = cls.colors.outfit;
    if (!appearance.accent) appearance.accent = cls.colors.accent;
    if (!appearance.cloak) appearance.cloak = cls.colors.cloak;

    this.state = {
      version: VERSION,
      timestamp: Date.now(),
      playTime: 0,
      kills: 0,
      mapId: 'village',
      position: { x: 950, y: 1060 },
      player: {
        name,
        classId: cls.id,
        level: 1,
        xp: 0,
        hp: null,
        mp: null,
        gold: 65,
        statPoints: 0,
        stats: { ...cls.stats },
        weaponId: cls.weapon,
        armorId: cls.armor,
        shieldId: cls.shield,
        accessoryId: cls.accessory,
        spellId: cls.spell,
        creatureId: cls.creature,
        appearance,
        ownedWeapons: { [cls.weapon]: 0 },
        ownedArmors: { [cls.armor]: true },
        ownedShields: cls.shield ? { [cls.shield]: true } : {},
        ownedAccessories: cls.accessory ? { [cls.accessory]: true } : {},
        spells: [...new Set([cls.spell, 'fuego'])],
      },
      inventory: { potion: 3, ether: 1, fruta: 2 },
      quests: freshQuests(),
      flags: {},
      creatures: { [cls.creature]: { level: 1, xp: 0 } },
      achievements: {},
      visited: { village: true },
    };

    this.player = new Player(this);
    this.scene = 'playing';
    this.ui.hideAllScreens();
    this.ui.showHUD();
    this.ui.hudDirty = true;
    this.loadWorld('village', { x: 950, y: 1060 });
    this.player.hp = this.player.maxHp;
    this.player.mp = this.player.maxMp;
    this.player.stamina = this.player.maxStamina;
    this.state.player.hp = this.player.maxHp;
    this.state.player.mp = this.player.maxMp;
    this.input.clear();
    this.ui.fadeIn();
    this.ui.zoneBanner('Aldea del Alba', 'Donde despierta la luz');
    this.audio.sfx('portal');
    this.autoSave(true);
    this.playIntro();
  }

  playIntro() {
    this.scene = 'cinematic';
    this.ui.hideHUD();
    this.ui.hideAllScreens();
    this.input.clear();
    this.ui.playCinematic(INTRO_PAGES, () => {
      this.scene = 'playing';
      this.ui.showHUD();
      this.ui.updateTouchVisibility();
      this.ui.fadeIn();
      this.input.clear();
      this.ui.toast('La aventura comienza', 'Habla con la Anciana Mira junto al santuario.', 'info', 4200);
    });
  }

  continueLatest() {
    const saves = listSaves();
    const list = Object.entries(saves).filter(([, v]) => v);
    if (!list.length) {
      this.ui.toast('No hay partidas', 'Crea un nuevo héroe para comenzar tu leyenda.', 'info');
      this.showCreation();
      return;
    }
    list.sort((a, b) => (b[1].timestamp || 0) - (a[1].timestamp || 0));
    this.loadGame(list[0][0]);
  }

  normalizeSave(data) {
    const s = deepClone(data || {});
    const cls = CLASSES[s.player?.classId] || CLASSES.caballero;
    const p = s.player || {};
    s.version = s.version || VERSION;
    s.playTime = Number(s.playTime) || 0;
    s.kills = Number(s.kills) || 0;
    s.mapId = ['village', 'forest', 'ruins', 'sanctuary'].includes(s.mapId) ? s.mapId : 'village';
    s.position = s.position && Number.isFinite(s.position.x) ? s.position : { x: 950, y: 1060 };
    s.player = {
      name: String(p.name || 'Héroe').slice(0, 16),
      classId: cls.id,
      level: clamp(Number(p.level) || 1, 1, MAX_LEVEL),
      xp: Math.max(0, Number(p.xp) || 0),
      hp: p.hp === null || p.hp === undefined ? null : Math.max(1, Number(p.hp) || 1),
      mp: p.mp === null || p.mp === undefined ? null : Math.max(0, Number(p.mp) || 0),
      gold: Math.max(0, Number(p.gold) || 0),
      statPoints: Math.max(0, Number(p.statPoints) || 0),
      stats: { ...cls.stats, ...(p.stats || {}) },
      weaponId: WEAPONS[p.weaponId] ? p.weaponId : cls.weapon,
      armorId: ARMORS[p.armorId] ? p.armorId : cls.armor,
      shieldId: SHIELDS[p.shieldId] ? p.shieldId : cls.shield,
      accessoryId: ACCESSORIES[p.accessoryId] ? p.accessoryId : cls.accessory,
      spellId: SPELLS[p.spellId] ? p.spellId : cls.spell,
      creatureId: CREATURES[p.creatureId] ? p.creatureId : cls.creature,
      appearance: { ...(cls.colors ? {} : {}), ...(p.appearance || {}) },
      ownedWeapons: { ...(p.ownedWeapons || {}), [WEAPONS[p.weaponId] ? p.weaponId : cls.weapon]: p.ownedWeapons?.[p.weaponId] || 0 },
      ownedArmors: { ...(p.ownedArmors || {}), [ARMORS[p.armorId] ? p.armorId : cls.armor]: true },
      ownedShields: p.shieldId && SHIELDS[p.shieldId] ? { ...(p.ownedShields || {}), [p.shieldId]: true } : { ...(p.ownedShields || {}) },
      ownedAccessories: p.accessoryId && ACCESSORIES[p.accessoryId] ? { ...(p.ownedAccessories || {}), [p.accessoryId]: true } : { ...(p.ownedAccessories || {}) },
      spells: Array.isArray(p.spells) && p.spells.length ? [...new Set(p.spells.filter((id) => SPELLS[id]))] : [cls.spell, 'fuego'],
    };
    if (!s.player.spells.includes(s.player.spellId)) s.player.spells.push(s.player.spellId);
    s.inventory = { ...(s.inventory || {}) };
    s.quests = freshQuests();
    for (const id of Object.keys(QUESTS)) {
      const q = data?.quests?.[id];
      if (q) s.quests[id] = { stage: clamp(Number(q.stage) || 0, 0, QUESTS[id].stages.length - 1), status: q.status || 'active' };
    }
    s.flags = { ...(s.flags || {}) };
    s.creatures = { ...(s.creatures || {}) };
    s.achievements = { ...(s.achievements || {}) };
    s.visited = { ...(s.visited || {}), [s.mapId]: true };
    s.timestamp = Number(s.timestamp) || Date.now();
    return s;
  }

  loadGame(slot) {
    const data = readSave(slot);
    if (!data) {
      this.ui.toast('Ranura vacía', 'No hay ninguna partida guardada aquí.', 'error');
      return false;
    }
    try {
      this.state = this.normalizeSave(data);
      this.player = new Player(this);
      this.player.hp = clamp(Number(data.player?.hp) || this.player.maxHp, 1, this.player.maxHp);
      this.player.mp = clamp(Number(data.player?.mp) || this.player.maxMp, 0, this.player.maxMp);
      this.player.stamina = this.player.maxStamina;
      this.state.player.hp = Math.round(this.player.hp);
      this.state.player.mp = Math.round(this.player.mp);
      this.scene = 'playing';
      this.hitStop = 0;
      this.comboCount = 0;
      this.comboTimer = 0;
      this.pendingEnding = 0;
      this.autoSaveTimer = 0;
      this.loadWorld(this.state.mapId, this.state.position);
      this.ui.hideAllScreens();
      this.ui.showHUD();
      this.ui.hudDirty = true;
      this.ui.fadeIn();
      this.ui.updateTitle();
      this.ui.updateTouchVisibility();
      this.ui.zoneBanner(this.world.def.name, this.world.def.subtitle);
      this.ui.toast('Partida cargada', `${this.state.player.name} · Nivel ${this.state.player.level}`, 'success');
      this.audio.sfx('save');
      this.input.clear();
      return true;
    } catch (err) {
      console.error(err);
      this.ui.toast('Partida dañada', 'No se pudo cargar esta ranura.', 'error');
      return false;
    }
  }

  saveGame(slot) {
    if (!this.state || !this.player) return false;
    if (!slot) slot = 'auto';
    const player = this.state.player;
    player.hp = Math.max(1, Math.round(this.player.hp));
    player.mp = Math.max(0, Math.round(this.player.mp));
    const data = {
      version: VERSION,
      timestamp: Date.now(),
      playTime: this.state.playTime,
      mapId: this.world?.id || this.state.mapId,
      position: { x: Math.round(this.player.x), y: Math.round(this.player.y) },
      player: deepClone(player),
      inventory: deepClone(this.state.inventory),
      quests: deepClone(this.state.quests),
      flags: deepClone(this.state.flags),
      creatures: deepClone(this.state.creatures),
      achievements: deepClone(this.state.achievements),
      visited: deepClone(this.state.visited),
      kills: this.state.kills,
    };
    const ok = writeSave(slot, data);
    if (ok) this.state.timestamp = data.timestamp;
    return ok;
  }

  deleteSave(slot) {
    deleteSave(slot);
    this.ui.updateTitle();
  }

  autoSave(silent = false) {
    if (!this.state) return false;
    const ok = this.saveGame('auto');
    if (ok && !silent) this.ui.toast('Autoguardado', 'Tu progreso está a salvo.', 'success', 1800);
    return ok;
  }

  backToTitle() {
    if (this.state && this.scene !== 'title') this.autoSave(true);
    this.scene = 'title';
    this.pendingEnding = 0;
    this.input.clear();
    this.ui.hidePrompt();
    this.ui.showTitle();
    this.audio.playMusic('title');
  }

  confirmQuit() {
    this.ui.openConfirm('Salir al título', 'Se guardará tu progreso en el autoguardado. ¿Quieres volver al menú principal?', () => this.backToTitle());
  }

  respawn() {
    if (!this.state) { this.backToTitle(); return; }
    const shrine = this.state.flags.lastShrine;
    const mapId = shrine?.mapId || this.state.mapId || 'village';
    const spawn = shrine ? { x: shrine.x, y: shrine.y } : { x: 950, y: 1060 };
    this.state.player.gold = Math.floor(this.state.player.gold * 0.8);
    this.state.player.hp = null;
    this.state.player.mp = null;
    this.state.flags.kael_active = false;
    this.player = new Player(this);
    this.scene = 'playing';
    this.loadWorld(mapId, spawn);
    this.player.hp = Math.max(1, Math.round(this.player.maxHp * 0.7));
    this.player.mp = Math.round(this.player.maxMp * 0.6);
    this.player.stamina = this.player.maxStamina;
    this.state.player.hp = this.player.hp;
    this.state.player.mp = this.player.mp;
    this.hitStop = 0;
    this.comboCount = 0;
    this.ui.hideAllScreens();
    this.ui.showHUD();
    this.ui.hudDirty = true;
    this.ui.fadeIn();
    this.ui.updateTouchVisibility();
    this.ui.zoneBanner(this.world.def.name, 'La luz aún te sostiene');
    this.ui.toast('Has vuelto', 'Perdiste parte de tu oro, pero conservas tu equipo.', 'info');
    this.audio.sfx('heal');
    this.autoSave(true);
    this.input.clear();
  }

  playEnding() {
    if (this.scene === 'ending' || this.scene === 'cinematic') return;
    this.scene = 'cinematic';
    this.ui.hideHUD();
    this.input.clear();
    this.audio.playMusic('sanctuary');
    this.ui.playCinematic(ENDING_PAGES, () => {
      this.scene = 'ending';
      this.ui.showEnding();
      this.audio.sfx('victory');
      this.autoSave(true);
    });
  }

  endingContinue() {
    this.scene = 'playing';
    this.ui.hideAllScreens();
    this.ui.showHUD();
    this.ui.updateTouchVisibility();
    this.ui.fadeIn();
    this.input.clear();
    this.updateMusic();
    this.autoSave(true);
  }

  togglePause(force = false) {
    if (this.scene === 'playing') {
      this.scene = 'paused';
      this.input.clear();
      this.ui.openPause('summary');
      this.ui.setTouchVisible(false);
      this.audio.sfx('ui');
    } else if (this.scene === 'paused' && !force) {
      this.resume();
    }
  }

  resume() {
    if (!this.state) return;
    this.scene = 'playing';
    this.ui.hideAllScreens();
    this.ui.showHUD();
    this.ui.updateTouchVisibility();
    this.input.clear();
    this.audio.sfx('ui_back');
  }

  openQuick() {
    if (this.scene !== 'playing') return;
    this.scene = 'quick';
    this.input.clear();
    this.ui.openQuick();
    this.ui.setTouchVisible(false);
    this.audio.sfx('ui');
  }

  closeQuick() {
    if (this.scene !== 'quick') return;
    this.scene = 'playing';
    this.ui.hideAllScreens();
    this.ui.showHUD();
    this.ui.updateTouchVisibility();
    this.input.clear();
    this.audio.sfx('ui_back');
  }

  openShop(npcId) {
    this.scene = 'shop';
    this.input.clear();
    this.ui.openShop(npcId);
    this.ui.setTouchVisible(false);
    this.audio.sfx('ui');
  }

  closeShop() {
    if (this.scene !== 'shop') return;
    this.scene = 'playing';
    this.ui.hideAllScreens();
    this.ui.showHUD();
    this.ui.updateTouchVisibility();
    this.input.clear();
    this.audio.sfx('ui_back');
  }

  openDialogue(data) {
    if (!data) return;
    this.scene = 'dialogue';
    this.input.clear();
    this.ui.openDialogue(data);
    this.ui.hidePrompt();
    this.ui.setTouchVisible(true);
  }

  closeDialogue() {
    this.ui.closeDialogue();
    this.scene = 'playing';
    this.input.clear();
    this.ui.updateTouchVisibility();
    this.updateQuestMarkers();
  }

  handleDialogueChoice(choice) {
    const result = handleNpcChoice(this, choice);
    if (result?.stay) return result;
    if (result?.next !== undefined) return result;
    if (choice?.next !== undefined) return { next: choice.next };
    return result || null;
  }

  // -------------------------------------------------------------------------
  // MUNDO
  // -------------------------------------------------------------------------

  loadWorld(id, spawn) {
    const mapId = ['village', 'forest', 'ruins', 'sanctuary'].includes(id) ? id : 'village';
    this.world = createWorld(mapId, this);
    this.state.mapId = mapId;
    this.state.visited[mapId] = true;
    this.enemies = [];
    this.projectiles = [];
    this.pickups = [];
    this.summons = [];
    this.particles = [];
    this.floatTexts = [];
    this.meteors = [];
    this.beams = [];
    this.rains = [];
    this.lightnings = [];
    this.timers = [];
    this.respawns = [];
    this.pendingSpawns = [];
    this.triggered.clear();
    this.promptTarget = null;
    this.comboCount = 0;
    this.comboTimer = 0;
    this.hitStop = 0;

    const start = spawn || this.world.def.spawn || { x: this.world.w / 2, y: this.world.h / 2 };
    if (this.player) {
      this.player.x = clamp(start.x, 40, this.world.w - 40);
      this.player.y = clamp(start.y, 40, this.world.h - 40);
      this.player.facing = -Math.PI / 2;
      this.player.state = 'idle';
      this.player.attackProgress = 0;
      this.player.afterimages = [];
    }

    for (const sp of getSpawnersFor(mapId)) {
      if (sp.once && this.state.flags[sp.flag]) continue;
      if (sp.trigger) {
        this.pendingSpawns.push(sp);
        continue;
      }
      const e = this.spawnEnemy(sp.type, sp.x, sp.y, sp.level || 1, false, sp);
      if (e) e.home = { x: sp.x, y: sp.y };
    }

    this.snapCamera();
    this.updateQuestMarkers();
    this.updateMusic();
  }

  spawnEnemy(typeId, x, y, level = 1, isSummon = false, spawner = null) {
    if (!ENEMIES[typeId]) return null;
    if (this.enemies.length > 70) return null;
    const e = new Enemy(this, typeId, x, y, level);
    e.summoned = isSummon;
    e.spawner = spawner;
    if (spawner?.once) e.once = true;
    this.enemies.push(e);
    if (e.boss) {
      this.state.flags.kael_active = true;
      this.updateMusic();
    } else if (typeId === 'guardian') {
      this.updateMusic();
    }
    return e;
  }

  updateTriggers(dt) {
    if (!this.player || !this.world) return;
    for (const sp of this.pendingSpawns) {
      if (!sp.trigger) continue;
      if (sp.once && this.state.flags[sp.flag]) continue;
      const key = `${this.world.id}:${sp.type}:${sp.x},${sp.y}`;
      if (this.triggered.has(key)) continue;
      if (dist(this.player.x, this.player.y, sp.trigger.x, sp.trigger.y) > sp.trigger.r) continue;
      if (sp.type === 'guardian' && !this.state.flags.runes_done) {
        if (!this._guardianWarned) {
          this._guardianWarned = true;
          this.ui.toast('El trono está sellado', 'Activa las tres runas en el orden correcto.', 'warning', 3600);
        }
        continue;
      }
      if (sp.type === 'kael' && !this.state.flags.guardian_defeated) continue;
      this.triggered.add(key);
      const e = this.spawnEnemy(sp.type, sp.x, sp.y, sp.level || 1, false, sp);
      if (!e) continue;
      if (sp.type === 'guardian') {
        this.audio.sfx('boss_roar');
        this.camera.shake(20);
        this.ui.toast('El Guardián Corrompido', 'La corrupción despierta en el trono vacío.', 'danger', 4200);
        this.addParticles(e.x, e.y - 40, 40, '#c9a6ff', 'burst');
      } else if (sp.type === 'kael') {
        this.state.flags.kael_active = true;
        this.audio.sfx('boss_roar');
        this.camera.shake(26);
        this.ui.toast('Kael, el Guardián Corrompido', '«La noche es misericordiosa. No dejaré que el sol me olvide.»', 'danger', 5200);
        this.addParticles(e.x, e.y - 50, 60, '#ffe6a0', 'burst');
        this.autoSave(true);
      }
    }
  }

  updateMusic() {
    if (!this.world) return;
    let theme = this.world.def.music || 'village';
    if (this.enemies.some((e) => !e.dead && (e.boss || e.typeId === 'guardian'))) theme = 'boss';
    this.audio.playMusic(theme);
  }

  travel(to, spawn, label) {
    if (!ZONE_INFO[to] || this.transitioning) return;
    this.transitioning = true;
    this.input.clear();
    this.audio.sfx('portal');
    this.ui.fadeOut(() => {
      this.state.mapId = to;
      this.state.visited[to] = true;
      this.loadWorld(to, spawn);
      this.state.position = { x: this.player.x, y: this.player.y };
      this.ui.fadeIn();
      this.ui.zoneBanner(ZONE_INFO[to].name, ZONE_INFO[to].subtitle);
      this.transitioning = false;
      this.autoSave(true);
      this.checkExplorer();
      this.input.clear();
    });
  }

  updateQuestMarkers() {
    this.questMarkers = [];
    if (!this.state || !this.world) return this.questMarkers;
    const add = (x, y, label) => { if (Number.isFinite(x) && Number.isFinite(y)) this.questMarkers.push({ x, y, label }); };
    const npc = (id) => this.world.npcs.find((n) => n.id === id);
    const prop = (fn) => this.world.props.find(fn);
    const q = this.state.quests;
    const f = this.state.flags;

    if (q.main.stage === 0) {
      const n = npc('mira'); if (n) add(n.x, n.y, 'Mira');
    } else if (q.main.stage === 1) {
      const p = prop((x) => x.type === 'altar'); if (p) add(p.x, p.y, 'Altar del Alba');
    } else if (q.main.stage === 2) {
      if (!f.runes_done) {
        for (const id of ['sol', 'luna', 'estrella']) {
          if (!f[`rune_${id}`]) {
            const p = prop((x) => x.type === 'rune' && x.runeId === id);
            if (p) add(p.x, p.y, `Runa ${id}`);
          }
        }
      } else {
        const sp = getSpawnersFor('ruins').find((s) => s.type === 'guardian');
        if (sp) add(sp.x, sp.y, 'Guardián');
      }
    } else if (q.main.stage === 3) {
      const p = prop((x) => x.type === 'portal' && x.interact?.to === 'sanctuary');
      if (p) add(p.x, p.y, 'Santuario');
    }

    if (q.fireflies.status === 'active') {
      if (q.fireflies.stage === 0 || q.fireflies.stage >= 2) {
        const n = npc('lia'); if (n) add(n.x, n.y, 'Lía');
      } else {
        for (const p of this.world.props) if (p.type === 'firefly' && !f[`firefly_${p.id}`]) add(p.x, p.y, 'Luciérnaga');
      }
    }
    if (q.fangs.status === 'active' && (q.fangs.stage === 0 || q.fangs.stage >= 2)) {
      const n = npc('rook'); if (n) add(n.x, n.y, 'Rook');
    }
    if (q.iron.status === 'active' && (q.iron.stage === 0 || q.iron.stage >= 2)) {
      const n = npc('brann'); if (n) add(n.x, n.y, 'Brann');
    }
    if (q.echoes.status === 'active') {
      if (q.echoes.stage === 0 || q.echoes.stage >= 2) {
        const n = npc('elian'); if (n) add(n.x, n.y, 'Elian');
      } else {
        for (const p of this.world.props) if (p.type === 'echo' && !f[`echo_${p.id}`]) add(p.x, p.y, 'Eco');
      }
    }
    return this.questMarkers;
  }

  checkExplorer() {
    if (!this.state) return;
    this.state.visited[this.world?.id || this.state.mapId] = true;
    if (Object.keys(this.state.visited).length >= 4) this.unlockAchievement('explorer');
  }

  // -------------------------------------------------------------------------
  // COMBATE
  // -------------------------------------------------------------------------

  nearestEnemy(x, y, maxDist = 9999, includeBoss = true) {
    let best = null;
    let bd = maxDist;
    for (const e of this.enemies) {
      if (e.dead) continue;
      if (!includeBoss && (e.boss || e.typeId === 'guardian')) continue;
      const d = dist(x, y, e.x, e.y);
      if (d < bd) { bd = d; best = e; }
    }
    return best;
  }

  playerAttackHit(player) {
    if (!player || player.state === 'dead') return;
    const w = player.weapon;
    const combo = player.comboIndex || 0;
    const mult = 1 + combo * 0.11 + (combo === w.combo - 1 ? 0.16 : 0);
    const crit = Math.random() < player.critChance;
    const dmg = player.attackPower * mult * (1 + (player.damageBonus || 0)) * (crit ? 1.65 : 1);
    const angle = player.attackAngle ?? player.facing;
    const px = player.x;
    const py = player.y - 22;

    if (w.projectile) {
      const kind = w.projectile;
      this.spawnProjectile({
        x: px + Math.cos(angle) * 22,
        y: py + Math.sin(angle) * 18,
        vx: Math.cos(angle) * (kind === 'arrow' ? 540 : 430),
        vy: Math.sin(angle) * (kind === 'arrow' ? 540 : 430),
        r: kind === 'arrow' ? 6 : 9,
        damage: dmg,
        team: 'player',
        kind,
        color: kind === 'arrow' ? '#ffe6a0' : '#c9a6ff',
        life: 1.2,
        crit,
        element: w.element,
        knockback: w.knockback,
        pierce: 0,
      });
      this.audio.sfx(kind === 'arrow' ? 'arrow' : 'ice');
      this.addParticles(px + Math.cos(angle) * 24, py + Math.sin(angle) * 20, 4, kind === 'arrow' ? '#ffe6a0' : '#c9a6ff', 'spark');
      return;
    }

    const hits = this.damageEnemiesInArc(px, py, w.range, w.arc, angle, dmg, {
      crit, element: w.element, knockback: w.knockback,
    });
    if (hits > 0) {
      this.registerComboHits(hits);
      this.addParticles(px + Math.cos(angle) * w.range * 0.55, py + Math.sin(angle) * w.range * 0.55, 6 + hits * 3, '#fff3c4', 'slash');
    } else {
      this.addParticles(px + Math.cos(angle) * w.range * 0.6, py + Math.sin(angle) * w.range * 0.6, 3, '#c9d8ff', 'dust');
    }
  }

  damageEnemiesInArc(x, y, radius, arc, angle, damage, opts = {}) {
    let hits = 0;
    for (const e of this.enemies) {
      if (e.dead) continue;
      const d = dist(x, y, e.x, e.y - e.radius * 0.3);
      if (d > radius + e.radius) continue;
      const a = Math.atan2(e.y - e.radius * 0.3 - y, e.x - x);
      if (Math.abs(angleDiff(angle, a)) > arc / 2 + 0.16) continue;
      e.takeDamage(damage, { ...opts, attacker: this.player });
      hits++;
    }
    return hits;
  }

  damageEnemiesInRadius(x, y, radius, damage, opts = {}) {
    let hits = 0;
    for (const e of this.enemies) {
      if (e.dead) continue;
      if (dist(x, y, e.x, e.y) > radius + e.radius) continue;
      e.takeDamage(damage, { ...opts, attacker: this.player });
      hits++;
    }
    if (hits > 0) this.registerComboHits(hits);
    return hits;
  }

  useWeaponSkill(player, skill) {
    if (!player || !skill) return;
    const a = player.facing;
    const base = player.attackPower * (1 + (player.damageBonus || 0));
    switch (skill.id) {
      case 'whirl': {
        this.audio.sfx('swing_heavy');
        this.addParticles(player.x, player.y - 22, 22, '#ffe6a0', 'slash');
        this.schedule(0.12, () => this.damageEnemiesInRadius(player.x, player.y - 18, 135, base * 0.85, { element: 'luz', knockback: 110 }));
        this.schedule(0.38, () => {
          this.damageEnemiesInRadius(player.x, player.y - 18, 150, base * 1.05, { element: 'luz', knockback: 150 });
          this.addParticles(player.x, player.y - 22, 26, '#fff3c4', 'burst');
          this.camera.shake(8);
        });
        break;
      }
      case 'slam': {
        this.audio.sfx('slam');
        this.camera.shake(16);
        this.damageEnemiesInRadius(player.x, player.y - 10, 190, base * 1.65, { element: 'fuego', knockback: 220, burn: 2 });
        this.addParticles(player.x, player.y - 8, 34, '#ff8a3d', 'burst');
        for (let i = 0; i < 10; i++) {
          const aa = (i / 10) * TAU;
          this.spawnProjectile({
            x: player.x, y: player.y - 10, vx: Math.cos(aa) * 260, vy: Math.sin(aa) * 260,
            r: 9, damage: base * 0.4, team: 'player', kind: 'fire', color: '#ffb35a', life: 0.55, pierce: 2,
          });
        }
        break;
      }
      case 'shadowstep': {
        this.audio.sfx('dash');
        const steps = 12;
        const dx = Math.cos(a) * 22;
        const dy = Math.sin(a) * 22;
        for (let i = 0; i < steps; i++) {
          player._move(dx, dy);
          if (i % 2 === 0) player.afterimages.push({ dx: player.x, dy: player.y, life: 1 });
        }
        player.invuln = Math.max(player.invuln, 0.45);
        this.damageEnemiesInArc(player.x, player.y - 20, 170, Math.PI * 1.2, a, base * 1.4, { element: 'sombra', crit: true, knockback: 80 });
        this.addParticles(player.x, player.y - 20, 30, '#9fb8ff', 'slash');
        this.camera.shake(6);
        break;
      }
      case 'pierce': {
        this.audio.sfx('arrow');
        this.spawnProjectile({
          x: player.x + Math.cos(a) * 26, y: player.y - 24 + Math.sin(a) * 20,
          vx: Math.cos(a) * 720, vy: Math.sin(a) * 720, r: 12, damage: base * 1.7,
          team: 'player', kind: 'holy', color: '#ffe6a0', life: 1.1, pierce: 99,
          element: 'luz', knockback: 140, crit: true,
        });
        this.addParticles(player.x + Math.cos(a) * 40, player.y - 24 + Math.sin(a) * 30, 12, '#fff3c4', 'spark');
        break;
      }
      case 'rain': {
        const target = this.nearestEnemy(player.x, player.y, 520);
        const tx = target ? target.x : player.x + Math.cos(a) * 240;
        const ty = target ? target.y : player.y + Math.sin(a) * 240;
        this.spawnRain(tx, ty, 190, base * 0.55, 14, 0.08, 2.4);
        this.audio.sfx('arrow');
        this.ui.toast('Lluvia de Lumen', 'Las flechas caen sobre la zona marcada.', 'info', 1800);
        break;
      }
      case 'nova': {
        const target = this.nearestEnemy(player.x, player.y, 480);
        const tx = target ? target.x : player.x + Math.cos(a) * 170;
        const ty = target ? target.y : player.y + Math.sin(a) * 170;
        this.damageEnemiesInRadius(tx, ty, 165, player.magicPower * 2.2, { element: 'arcano', knockback: 90 });
        this.addParticles(tx, ty, 40, '#c9a6ff', 'burst');
        this.audio.sfx('lightning');
        this.camera.shake(12);
        break;
      }
      case 'celestial': {
        this.audio.sfx('victory');
        this.camera.shake(20);
        for (let i = 0; i < 3; i++) {
          this.schedule(i * 0.22, () => {
            const cx = player.x + Math.cos(a) * (40 + i * 70);
            const cy = player.y + Math.sin(a) * (30 + i * 55);
            this.damageEnemiesInRadius(cx, cy, 190, base * 1.5, { element: 'celestial', crit: true, knockback: 180 });
            this.beams.push({ x: cx, y: cy - 300, angle: Math.PI / 2, width: 120, length: 620, t: 0.8, maxT: 0.8, charge: 0.25, hit: true, damage: 0, friendly: true });
            this.addParticles(cx, cy - 20, 36, '#fff3c4', 'burst');
          });
        }
        player.heal(player.maxHp * 0.2);
        break;
      }
      default:
        break;
    }
  }

  registerComboHits(n = 1) {
    this.comboCount += n;
    this.comboTimer = 3.4;
    if (this.comboCount >= 10) this.unlockAchievement('combo_10');
  }

  castSpell(index = null) {
    if (this.scene !== 'playing' || !this.player || this.player.state === 'dead') return;
    const p = this.player;
    const learned = (this.state.player.spells || ['fuego']).filter((id) => SPELLS[id]);
    const spellId = index !== null && learned[index] ? learned[index] : (SPELLS[this.state.player.spellId] ? this.state.player.spellId : learned[0]);
    const sp = SPELLS[spellId];
    if (!sp) return;
    if (p.magicCd > 0) {
      this.ui.toast('Magia en recarga', `${sp.name}: ${p.magicCd.toFixed(1)} s`, 'info', 1600);
      return;
    }
    if (p.mp < sp.cost) {
      this.audio.sfx('error');
      this.ui.toast('Maná insuficiente', `${sp.name} necesita ${sp.cost} de maná.`, 'error', 2000);
      return;
    }
    p.mp -= sp.cost;
    p.magicCd = sp.cooldown;
    p.state = 'cast';
    p.castTimer = 0.34;
    p.combatTimer = 4;
    this.state.player.spellId = spellId;

    const target = this.nearestEnemy(p.x, p.y, 560);
    const aim = target ? Math.atan2(target.y - 20 - p.y, target.x - p.x) : p.facing;
    if (target) p.facing = aim;

    switch (spellId) {
      case 'fuego': {
        this.spawnProjectile({
          x: p.x + Math.cos(aim) * 24, y: p.y - 26 + Math.sin(aim) * 18,
          vx: Math.cos(aim) * 390, vy: Math.sin(aim) * 390, r: 11,
          damage: p.magicPower * 1.35, team: 'player', kind: 'fire', color: sp.color,
          life: 2.4, homing: 2.2, target, burn: 2.4, element: 'fuego',
          onHit: (enemy) => {
            this.damageEnemiesInRadius(enemy.x, enemy.y, 62, p.magicPower * 0.55, { element: 'fuego', burn: 1.6 });
            this.addParticles(enemy.x, enemy.y - 20, 18, '#ff8a3d', 'burst');
            this.audio.sfx('fire');
          },
        });
        this.audio.sfx('fire');
        break;
      }
      case 'hielo': {
        this.spawnProjectile({
          x: p.x + Math.cos(aim) * 24, y: p.y - 26 + Math.sin(aim) * 18,
          vx: Math.cos(aim) * 460, vy: Math.sin(aim) * 460, r: 9,
          damage: p.magicPower * 1.15, team: 'player', kind: 'ice', color: sp.color,
          life: 2.1, slow: 2.6, element: 'hielo',
        });
        this.audio.sfx('ice');
        break;
      }
      case 'rayo': {
        const targets = this.enemies
          .filter((e) => !e.dead && dist(p.x, p.y, e.x, e.y) < 360)
          .sort((a, b) => dist(p.x, p.y, a.x, a.y) - dist(p.x, p.y, b.x, b.y))
          .slice(0, 3);
        if (!targets.length) {
          this.ui.toast('Sin objetivo', 'La tormenta necesita enemigos cerca.', 'info', 1500);
          this.addParticles(p.x + Math.cos(aim) * 120, p.y + Math.sin(aim) * 100, 14, sp.color, 'spark');
          break;
        }
        const points = [{ x: p.x, y: p.y - 30 }];
        targets.forEach((e, i) => {
          const dmg = p.magicPower * (i === 2 ? 2.2 : 1.25);
          e.takeDamage(dmg, { element: 'rayo', crit: i === 2, attacker: p });
          points.push({ x: e.x, y: e.y - 24 });
          this.addParticles(e.x, e.y - 24, 14, sp.color, 'spark');
        });
        this.lightnings.push({ points, life: 0.4, maxLife: 0.4 });
        this.registerComboHits(targets.length);
        this.audio.sfx('lightning');
        this.camera.shake(8);
        break;
      }
      case 'cura': {
        const healed = p.heal(p.maxHp * 0.34);
        p.burnTimer = 0;
        p.slowTimer = 0;
        this.addParticles(p.x, p.y - 26, 26, '#9fe3a0', 'burst');
        this.addFloatText(p.x, p.y - 62, `+${healed}`, '#8fe3a0', 20);
        this.audio.sfx('heal');
        break;
      }
      case 'luz': {
        const hits = this.damageEnemiesInRadius(p.x, p.y, 250, p.magicPower * 2.15, { element: 'celestial', crit: true, knockback: 140 });
        p.heal(p.maxHp * 0.12);
        this.addParticles(p.x, p.y - 24, 50, '#fff3c4', 'burst');
        this.camera.shake(14);
        this.audio.sfx('victory');
        if (hits) this.ui.toast('Nova Celestial', `${hits} enemigos alcanzados.`, 'success', 1800);
        break;
      }
      default:
        break;
    }
    this.addParticles(p.x, p.y - 28, 8, sp.color, 'spark');
  }

  cycleSpell() {
    if (!this.state || !this.player) return;
    const list = (this.state.player.spells || ['fuego']).filter((id) => SPELLS[id]);
    if (list.length < 2) {
      this.ui.toast('Un solo hechizo', 'Aprende más hechizos al subir de nivel.', 'info', 1600);
      return;
    }
    const cur = list.indexOf(this.state.player.spellId);
    const next = list[(cur + 1 + list.length) % list.length];
    this.state.player.spellId = next;
    this.ui.hudDirty = true;
    this.audio.sfx('ui');
    this.ui.toast('Hechizo equipado', SPELLS[next].name, 'info', 1500);
  }

  equipSpell(id) {
    if (!SPELLS[id]) return;
    const p = this.state.player;
    if (!p.spells.includes(id) && p.level < SPELLS[id].unlock) {
      this.ui.toast('Hechizo bloqueado', `Se aprende al nivel ${SPELLS[id].unlock}.`, 'error');
      return;
    }
    if (!p.spells.includes(id)) p.spells.push(id);
    p.spellId = id;
    this.ui.hudDirty = true;
    this.audio.sfx('ui');
    this.ui.toast('Hechizo equipado', SPELLS[id].name, 'success', 1600);
  }

  summonCreature() {
    if (this.scene !== 'playing' || !this.player || this.player.state === 'dead') return;
    const p = this.player;
    const c = CREATURES[this.state.player.creatureId];
    if (!c) {
      this.ui.toast('Sin criatura', 'Vincula una criatura debilitada con Y.', 'info', 2200);
      return;
    }
    if (p.creatureCd > 0) {
      this.ui.toast('Vínculo en recarga', `${c.name}: ${p.creatureCd.toFixed(1)} s`, 'info', 1600);
      return;
    }
    p.creatureCd = c.cooldown;
    this.summons.push(new Summon(this, c.id, p.x, p.y));
    this.audio.sfx('summon');
    switch (c.id) {
      case 'gelatina': {
        const healed = p.heal(p.maxHp * 0.3);
        this.addFloatText(p.x, p.y - 62, `+${healed}`, '#8fe3a0', 20);
        this.addParticles(p.x, p.y - 24, 22, c.color, 'burst');
        break;
      }
      case 'lobo': {
        const a = p.facing;
        for (let i = 0; i < 8; i++) p._move(Math.cos(a) * 24, Math.sin(a) * 24);
        p.invuln = Math.max(p.invuln, 0.2);
        this.damageEnemiesInArc(p.x, p.y - 18, 150, Math.PI, a, p.attackPower * 1.5, { element: 'fuego', burn: 2, knockback: 160 });
        this.addParticles(p.x, p.y - 18, 24, '#d8b08a', 'slash');
        this.camera.shake(8);
        break;
      }
      case 'escarabajo': {
        p.shieldTimer = 5;
        p.shieldValue = Math.round(p.maxHp * 0.38);
        this.addParticles(p.x, p.y - 24, 20, c.color, 'spark');
        this.ui.toast('Caparazón de Piedra', `Absorberá ${p.shieldValue} de daño durante 5 s.`, 'success', 2200);
        break;
      }
      case 'espectro': {
        const target = this.nearestEnemy(p.x, p.y, 560);
        const a = target ? Math.atan2(target.y - 20 - p.y, target.x - p.x) : p.facing;
        this.spawnProjectile({
          x: p.x, y: p.y - 28, vx: Math.cos(a) * 380, vy: Math.sin(a) * 380, r: 13,
          damage: p.magicPower * 1.6, team: 'player', kind: 'wraith', color: c.color,
          life: 2.6, pierce: 5, slow: 2.5, element: 'arcano',
        });
        break;
      }
      case 'guardian': {
        this.damageEnemiesInRadius(p.x, p.y, 210, p.magicPower * 2.0, { element: 'celestial', slow: 2.5, knockback: 160 });
        this.addParticles(p.x, p.y - 24, 40, '#ffe6a0', 'burst');
        this.camera.shake(14);
        this.audio.sfx('lightning');
        break;
      }
      default: break;
    }
    this.ui.hudDirty = true;
  }

  cycleWeapon() {
    if (!this.state || !this.player) return;
    const list = Object.keys(this.state.player.ownedWeapons || {}).filter((id) => WEAPONS[id]);
    if (list.length < 2) {
      this.ui.toast('Un solo filo', 'Consigue más armas en cofres, tiendas o misiones.', 'info', 1800);
      return;
    }
    const cur = list.indexOf(this.state.player.weaponId);
    this.equipWeapon(list[(cur + 1 + list.length) % list.length]);
  }

  equipWeapon(id) {
    if (!WEAPONS[id]) return;
    const p = this.state.player;
    if (!p.ownedWeapons[id] && p.ownedWeapons[id] !== 0) {
      this.ui.toast('Arma no poseída', 'No tienes esta arma.', 'error');
      return;
    }
    p.weaponId = id;
    this.player.recalc();
    this.player.comboIndex = 0;
    this.player.state = 'idle';
    this.player.attackProgress = 0;
    this.ui.hudDirty = true;
    this.audio.sfx('ui');
    this.ui.toast('Arma equipada', WEAPONS[id].name, 'success', 1800);
  }

  equipItem(id, type) {
    if (!this.state || !this.player) return;
    const p = this.state.player;
    if (type === 'weapon' && WEAPONS[id] && (p.ownedWeapons[id] || p.ownedWeapons[id] === 0)) p.weaponId = id;
    else if (type === 'armor' && ARMORS[id] && p.ownedArmors[id]) p.armorId = id;
    else if (type === 'shield' && SHIELDS[id] && p.ownedShields[id]) p.shieldId = id;
    else if (type === 'accessory' && ACCESSORIES[id] && p.ownedAccessories[id]) p.accessoryId = id;
    else return;
    this.player.recalc();
    this.ui.hudDirty = true;
    this.audio.sfx('ui');
    const def = WEAPONS[id] || ARMORS[id] || SHIELDS[id] || ACCESSORIES[id];
    this.ui.toast('Equipo actualizado', def?.name || id, 'success', 1600);
  }

  equipCreature(id) {
    if (!CREATURES[id] || !this.state.creatures[id]) return;
    this.state.player.creatureId = id;
    this.player.recalc();
    this.ui.hudDirty = true;
    this.audio.sfx('summon');
    this.ui.toast('Criatura vinculada', CREATURES[id].name, 'success', 1800);
  }

  // -------------------------------------------------------------------------
  // OBJETOS Y TIENDA
  // -------------------------------------------------------------------------

  countItem(id) {
    return Math.max(0, this.state?.inventory?.[id] || 0);
  }

  addItem(id, qty = 1, silent = false) {
    if (!ITEMS[id] || qty <= 0) return false;
    this.state.inventory[id] = (this.state.inventory[id] || 0) + qty;
    if (!silent) {
      this.ui.toast('Objeto obtenido', `${ITEMS[id].name} x${qty}`, 'success', 1900);
      this.audio.sfx('coin');
    }
    if (ITEMS[id].quest) this.updateQuestMarkers();
    return true;
  }

  removeItem(id, qty = 1) {
    if (!this.state || !this.state.inventory[id]) return false;
    this.state.inventory[id] = Math.max(0, this.state.inventory[id] - qty);
    if (this.state.inventory[id] <= 0) delete this.state.inventory[id];
    this.updateQuestMarkers();
    return true;
  }

  grantEquipment(id, silent = false) {
    const p = this.state.player;
    let def = null;
    let type = null;
    if (WEAPONS[id]) {
      def = WEAPONS[id]; type = 'weapon';
      if (p.ownedWeapons[id] === undefined) p.ownedWeapons[id] = 0;
    } else if (ARMORS[id]) {
      def = ARMORS[id]; type = 'armor';
      p.ownedArmors[id] = true;
    } else if (SHIELDS[id]) {
      def = SHIELDS[id]; type = 'shield';
      p.ownedShields[id] = true;
    } else if (ACCESSORIES[id]) {
      def = ACCESSORIES[id]; type = 'accessory';
      p.ownedAccessories[id] = true;
    }
    if (!def) return null;
    this.ui.hudDirty = true;
    if (!silent) {
      this.ui.toast('Equipo obtenido', def.name, 'success', 2200);
      this.audio.sfx('chest');
    }
    return { def, type };
  }

  useItem(id) {
    if (!this.state || !this.player) return false;
    const def = ITEMS[id];
    if (!def || this.countItem(id) <= 0) return false;
    const p = this.player;
    if (def.use === 'heal') {
      if (p.hp >= p.maxHp - 0.5) { this.ui.toast('Vida al máximo', 'No necesitas curarte ahora.', 'info', 1500); return false; }
      const healed = p.heal(def.value);
      this.addFloatText(p.x, p.y - 60, `+${healed}`, '#8fe3a0', 20);
      this.addParticles(p.x, p.y - 24, 16, '#8fe3a0', 'spark');
      this.audio.sfx('potion');
    } else if (def.use === 'mana') {
      if (p.mp >= p.maxMp - 0.5) { this.ui.toast('Maná al máximo', 'No necesitas éter ahora.', 'info', 1500); return false; }
      const restored = p.restoreMana(def.value);
      this.addFloatText(p.x, p.y - 60, `+${restored} MP`, '#6fb8ff', 18);
      this.addParticles(p.x, p.y - 24, 16, '#6fb8ff', 'spark');
      this.audio.sfx('potion');
    } else if (def.use === 'full') {
      p.hp = p.maxHp;
      p.mp = p.maxMp;
      p.burnTimer = 0;
      p.slowTimer = 0;
      this.addFloatText(p.x, p.y - 62, 'RESTAURADO', '#ffe6a0', 20);
      this.addParticles(p.x, p.y - 24, 30, '#ffe6a0', 'burst');
      this.audio.sfx('heal');
    } else if (def.use === 'cleanse') {
      p.burnTimer = 0;
      p.slowTimer = 0;
      p.freezeTimer = 0;
      this.addParticles(p.x, p.y - 24, 18, '#9fe3a0', 'spark');
      this.ui.toast('Males purgados', 'Quemaduras y veneno eliminados.', 'success', 1800);
      this.audio.sfx('potion');
    } else if (def.use === 'bomb') {
      this.damageEnemiesInRadius(p.x, p.y - 10, 160, def.value, { element: 'fuego', burn: 2, knockback: 120 });
      this.addParticles(p.x, p.y - 18, 34, '#ff8a3d', 'burst');
      this.camera.shake(12);
      this.audio.sfx('slam');
    }
    this.removeItem(id, 1);
    this.ui.hudDirty = true;
    return true;
  }

  quickPotion() {
    if (!this.player || this.scene !== 'playing') return;
    if (this.player.hp >= this.player.maxHp - 0.5) {
      this.ui.toast('Vida al máximo', 'Guarda las pociones para más adelante.', 'info', 1400);
      return;
    }
    if (this.countItem('potion') > 0) this.useItem('potion');
    else if (this.countItem('potion_mayor') > 0) this.useItem('potion_mayor');
    else if (this.countItem('fruta') > 0) this.useItem('fruta');
    else {
      this.audio.sfx('error');
      this.ui.toast('Sin pociones', 'Compra en el mercado de Sela o busca en cofres.', 'error', 2200);
    }
  }

  dropItem(id) {
    if (!this.state || !this.state.inventory[id]) return;
    if (ITEMS[id]?.quest || ITEMS[id]?.key) return;
    this.removeItem(id, 1);
    this.ui.toast('Objeto descartado', ITEMS[id]?.name || id, 'info', 1400);
    this.audio.sfx('ui_back');
  }

  getShopInventory(npcId = 'sela') {
    const p = this.state.player;
    const entries = [];
    const add = (type, id, price) => {
      const def = type === 'item' ? ITEMS[id] : type === 'weapon' ? WEAPONS[id] : type === 'armor' ? ARMORS[id] : type === 'shield' ? SHIELDS[id] : ACCESSORIES[id];
      if (!def) return;
      if (type === 'weapon' && (p.ownedWeapons[id] !== undefined)) return;
      if (type === 'armor' && p.ownedArmors[id]) return;
      if (type === 'shield' && p.ownedShields[id]) return;
      if (type === 'accessory' && p.ownedAccessories[id]) return;
      entries.push({ key: `${type}:${id}`, type, def, price: price ?? def.price ?? 0, qty: type === 'item' ? this.countItem(id) : 0 });
    };
    if (npcId === 'brann') {
      add('weapon', 'mandoble_ceniza', 420);
      add('weapon', 'lanza_alba', 280);
      add('weapon', 'dagas_sombra', 360);
      add('weapon', 'arco_lumen', 300);
      add('armor', 'cuero_sombrio', 180);
      add('armor', 'placas_alba', 480);
      add('armor', 'vestiduras_aether', 520);
      add('shield', 'escudo_aether', 380);
    } else {
      add('item', 'potion', 32);
      add('item', 'potion_mayor', 85);
      add('item', 'ether', 42);
      add('item', 'antidote', 26);
      add('item', 'bomba', 48);
      add('item', 'fruta', 12);
      add('item', 'elixir', 220);
      add('weapon', 'lanza_alba', 280);
      add('weapon', 'arco_lumen', 300);
      add('armor', 'cuero_sombrio', 180);
      add('shield', 'escudo_aether', 380);
      add('accessory', 'amuleto_luz', 180);
      add('accessory', 'anillo_fuerza', 240);
      add('accessory', 'talisman_mana', 220);
      add('accessory', 'bota_viento', 280);
    }
    return entries;
  }

  getSellInventory() {
    const out = [];
    for (const [id, qty] of Object.entries(this.state.inventory || {})) {
      const def = ITEMS[id];
      if (!def || qty <= 0 || def.quest || def.key || !def.sell) continue;
      out.push({ key: `item:${id}`, type: 'item', def, sell: def.sell, qty });
    }
    return out;
  }

  buyItem(key) {
    if (!key) return { ok: false, msg: 'Selecciona un objeto.' };
    const [type, id] = String(key).split(':');
    const all = [...this.getShopInventory('sela'), ...this.getShopInventory('brann')];
    const item = all.find((i) => i.key === key);
    if (!item) return { ok: false, msg: 'Ese objeto ya no está disponible.' };
    if (this.state.player.gold < item.price) return { ok: false, msg: 'No tienes oro suficiente.' };
    this.state.player.gold -= item.price;
    if (type === 'item') {
      this.addItem(id, 1, true);
      this.ui.toast('Compra realizada', `${item.def.name} añadido a la mochila.`, 'success', 1800);
    } else {
      this.grantEquipment(id, true);
      this.ui.toast('Equipo comprado', `${item.def.name} añadido al arsenal.`, 'success', 2200);
    }
    this.ui.hudDirty = true;
    return { ok: true, msg: `${item.def.name} por ${item.price} oro.` };
  }

  sellItem(key) {
    if (!key) return { ok: false, msg: 'Selecciona un objeto.' };
    const [, id] = String(key).split(':');
    const def = ITEMS[id];
    if (!def || !def.sell) return { ok: false, msg: 'Este objeto no se puede vender.' };
    if (def.quest || def.key) return { ok: false, msg: 'Los objetos de misión no se pueden vender.' };
    if (this.countItem(id) <= 0) return { ok: false, msg: 'No tienes ese objeto.' };
    this.removeItem(id, 1);
    this.state.player.gold += def.sell;
    this.ui.hudDirty = true;
    return { ok: true, msg: `${def.name} vendido por ${def.sell} oro.` };
  }

  forgeUpgrade() {
    const s = this.state.player;
    const w = WEAPONS[s.weaponId];
    if (!w) return { ok: false, msg: 'No hay arma equipada.' };
    const up = s.ownedWeapons[s.weaponId] || 0;
    if (up >= 5) return { ok: false, msg: 'Esta arma ya está al máximo.' };
    const cost = 120 + up * 90;
    const need = 1 + Math.floor(up / 2);
    if (s.gold < cost) return { ok: false, msg: `Necesitas ${cost} oro.` };
    if (this.countItem('hierro') < need) return { ok: false, msg: `Necesitas ${need} piedra${need === 1 ? '' : 's'} de hierro.` };
    s.gold -= cost;
    this.removeItem('hierro', need);
    s.ownedWeapons[s.weaponId] = up + 1;
    this.player.recalc();
    this.ui.hudDirty = true;
    return { ok: true, msg: `${w.name} reforzada a +${up + 1}. +${(up + 1) * 3} daño.` };
  }

  allocateStat(stat) {
    if (!this.state || !this.state.player) return;
    const s = this.state.player;
    if (s.statPoints <= 0 || !(stat in s.stats)) return;
    s.statPoints--;
    s.stats[stat]++;
    this.player.recalc();
    this.ui.hudDirty = true;
    this.audio.sfx('ui');
  }

  // -------------------------------------------------------------------------
  // PROGRESIÓN
  // -------------------------------------------------------------------------

  xpToNext() {
    const level = this.state?.player?.level || 1;
    return Math.round(45 + level * level * 12 + level * 20);
  }

  gainXp(amount) {
    if (!this.state || amount <= 0) return;
    const s = this.state.player;
    s.xp += Math.round(amount);
    let leveled = false;
    while (s.level < MAX_LEVEL && s.xp >= this.xpToNext()) {
      s.xp -= this.xpToNext();
      s.level++;
      s.statPoints += 3;
      leveled = true;
      for (const sp of Object.values(SPELLS)) {
        if (sp.unlock <= s.level && !s.spells.includes(sp.id)) {
          s.spells.push(sp.id);
          this.ui.toast('Nuevo hechizo', `${sp.name} ha sido aprendido.`, 'success', 3200);
        }
      }
    }
    if (leveled) {
      this.player.recalc();
      this.player.hp = Math.min(this.player.maxHp, this.player.hp + this.player.maxHp * 0.35);
      this.player.mp = Math.min(this.player.maxMp, this.player.mp + this.player.maxMp * 0.35);
      this.state.player.hp = Math.round(this.player.hp);
      this.state.player.mp = Math.round(this.player.mp);
      this.ui.hudDirty = true;
      this.audio.sfx('levelup');
      this.camera.shake(8);
      this.addParticles(this.player.x, this.player.y - 24, 36, '#ffe6a0', 'burst');
      this.addFloatText(this.player.x, this.player.y - 70, '¡NIVEL!', '#ffe6a0', 24);
      this.ui.toast('Nivel alcanzado', `Ahora eres nivel ${s.level}. +3 puntos de atributo.`, 'success', 3600);
      this.autoSave(true);
    }
  }

  unlockAchievement(id) {
    if (!this.state || !id) return;
    if (this.state.achievements[id]) return;
    const def = ACHIEVEMENTS.find((a) => a.id === id);
    if (!def) return;
    this.state.achievements[id] = true;
    this.audio.sfx('quest');
    this.ui.toast('Logro desbloqueado', def.name, 'success', 3000);
    this.ui.hudDirty = true;
  }

  startQuest(id) {
    const q = this.state.quests[id];
    if (!q || q.status === 'complete') return;
    q.status = 'active';
    q.stage = Math.max(1, q.stage);
    this.ui.toast('Misión iniciada', QUESTS[id]?.name || id, 'success', 2600);
    this.audio.sfx('quest');
    this.updateQuestMarkers();
    this.autoSave(true);
  }

  completeQuest(id) {
    const def = QUESTS[id];
    const q = this.state.quests[id];
    if (!def || !q || q.status === 'complete') return;
    q.status = 'complete';
    q.stage = def.stages.length - 1;
    const reward = def.reward || {};
    if (reward.gold) {
      this.state.player.gold += reward.gold;
      this.addFloatText(this.player.x, this.player.y - 60, `+${reward.gold} oro`, '#ffe6a0', 20);
    }
    if (reward.item) {
      if (ACCESSORIES[reward.item]) this.grantEquipment(reward.item, true);
      else this.addItem(reward.item, 1, true);
    }
    if (reward.weapon) this.grantEquipment(reward.weapon, true);
    if (reward.armor) this.grantEquipment(reward.armor, true);
    this.ui.hudDirty = true;
    this.audio.sfx('quest');
    this.camera.shake(6);
    this.ui.toast('Misión completada', `${def.name}. Recompensa recibida.`, 'success', 4200);
    this.updateQuestMarkers();
    this.autoSave(true);
  }

  checkQuestItems() {
    this.updateQuestMarkers();
    return {
      luciernaga: this.countItem('luciernaga'),
      colmillo: this.countItem('colmillo'),
      hierro: this.countItem('hierro'),
      memoria: this.countItem('memoria'),
    };
  }

  onEnemyKilled(enemy) {
    if (!this.state || !enemy) return;
    this.state.kills++;
    this.gainXp(enemy.xp);
    this.unlockAchievement('first_blood');

    const gold = Math.max(1, Math.round(enemy.gold));
    const parts = gold > 18 ? 3 : gold > 8 ? 2 : 1;
    for (let i = 0; i < parts; i++) {
      this.pickups.push(new Pickup(this, enemy.x + rand(-12, 12), enemy.y - 10 + rand(-8, 8), {
        type: 'gold', amount: Math.floor(gold / parts) + (i === 0 ? gold % parts : 0), color: '#ffe6a0',
      }));
    }
    for (const drop of enemy.def.drops || []) {
      if (drop.chance >= 1 || chance(drop.chance)) {
        if (drop.equipment) {
          this.pickups.push(new Pickup(this, enemy.x, enemy.y - 14, {
            type: 'equipment', itemId: drop.id, equipment: true, color: '#ffe6a0', life: 60,
          }));
        } else {
          this.pickups.push(new Pickup(this, enemy.x, enemy.y - 14, {
            type: 'item', itemId: drop.id, color: ITEMS[drop.id]?.color || '#9fe3ff', life: 45,
          }));
        }
      }
    }

    if (!enemy.once && enemy.spawner && !enemy.summoned && enemy.typeId !== 'kael') {
      this.respawns.push({ spawner: enemy.spawner, timer: rand(26, 38), done: false });
    }

    if (enemy.typeId === 'guardian') this.onGuardianDefeated(enemy);
    else if (enemy.typeId === 'kael') this.onKaelDefeated(enemy);

    this.updateQuestMarkers();
    this.updateMusic();
  }

  onGuardianDefeated(enemy) {
    const f = this.state.flags;
    if (f.guardian_defeated) return;
    f.guardian_defeated = true;
    f.guardian_awake = false;
    f.runes_done = true;
    this.state.quests.main.stage = Math.max(3, this.state.quests.main.stage);
    this.state.quests.main.status = 'active';
    this.addItem('fragmento_aether', 1, true);
    this.addItem('potion_mayor', 1, true);
    this.grantEquipment('escudo_aether', true);
    this.state.creatures.guardian = this.state.creatures.guardian || { level: 1, xp: 0 };
    this.unlockAchievement('guardian_slayer');
    this.audio.sfx('victory');
    this.camera.shake(24);
    this.addParticles(enemy.x, enemy.y - 40, 60, '#ffe6a0', 'burst');
    this.ui.toast('Guardián Corrompido derrotado', 'Fragmento de Aether obtenido. El portal del Santuario se ha abierto.', 'success', 6000);
    this.autoSave(true);
    this.updateQuestMarkers();
  }

  onKaelDefeated(enemy) {
    const f = this.state.flags;
    if (f.kael_defeated) return;
    f.kael_defeated = true;
    f.kael_active = false;
    this.state.quests.main.stage = 4;
    this.state.quests.main.status = 'complete';
    this.addItem('fragmento_celestial', 1, true);
    this.grantEquipment('espada_celestial', true);
    this.grantEquipment('armadura_celestial', true);
    this.grantEquipment('escudo_celestial', true);
    this.state.player.weaponId = 'espada_celestial';
    this.state.player.ownedWeapons.espada_celestial = this.state.player.ownedWeapons.espada_celestial || 0;
    this.player.recalc();
    this.player.hp = this.player.maxHp;
    this.player.mp = this.player.maxMp;
    this.state.player.hp = this.player.maxHp;
    this.state.player.mp = this.player.maxMp;
    this.unlockAchievement('celestial');
    this.audio.sfx('victory');
    this.camera.shake(30);
    this.addParticles(enemy.x, enemy.y - 50, 100, '#fff3c4', 'burst');
    this.ui.toast('Kael ha caído', 'La Espada Celestial vuelve a brillar. Aurelia verá el amanecer.', 'success', 6000);
    this.pendingEnding = 3.4;
    this.autoSave(true);
  }

  collectPickup(pickup) {
    if (!pickup || pickup.dead) return;
    if (pickup.type === 'gold') {
      this.state.player.gold += pickup.amount;
      this.addFloatText(pickup.x, pickup.y - 20, `+${pickup.amount}`, '#ffe6a0', 15);
      this.audio.sfx('coin');
      this.ui.hudDirty = true;
    } else if (pickup.type === 'equipment' && pickup.itemId) {
      this.grantEquipment(pickup.itemId);
    } else if (pickup.itemId) {
      this.addItem(pickup.itemId, pickup.amount || 1);
    }
  }

  onPlayerDeath() {
    if (this.scene !== 'playing') return;
    this.scene = 'gameover';
    this.state.player.hp = 0;
    this.input.clear();
    this.audio.playMusic('ruins');
    this.audio.sfx('gameover');
    this.ui.hidePrompt();
    this.ui.setTouchVisible(false);
    this.schedule(1.1, () => {
      if (this.scene === 'gameover') this.ui.showGameOver();
    });
  }

  findCaptureTarget() {
    if (!this.player) return null;
    let best = null;
    let bd = 150;
    for (const e of this.enemies) {
      if (e.dead || e.boss || e.typeId === 'guardian') continue;
      if (e.hpRatio > 0.32) continue;
      if ((e.def.capture || 0) >= 1) continue;
      const d = dist(this.player.x, this.player.y, e.x, e.y);
      if (d < bd) { bd = d; best = e; }
    }
    return best;
  }

  tryCapture() {
    const target = this.findCaptureTarget();
    if (!target) {
      this.ui.toast('No hay criatura débil cerca', 'Baja su vida por debajo del 32% y vuelve a intentarlo.', 'info', 2200);
      return false;
    }
    const luck = this.state.player.stats.luck;
    const odds = clamp((target.def.capture || 0.2) + luck * 0.006 + (1 - target.hpRatio) * 0.16 + target.captureAttempts * 0.08, 0.05, 0.96);
    if (chance(odds)) {
      this.state.creatures[target.typeId] = { level: target.level, xp: 0 };
      if (!this.state.player.creatureId) this.state.player.creatureId = target.typeId;
      target.hp = 0;
      target.dead = true;
      target.deathTimer = 0.5;
      target.state = 'dead';
      this.addParticles(target.x, target.y - 20, 30, target.def.color, 'burst');
      this.addParticles(target.x, target.y - 20, 16, '#ffe6a0', 'spark');
      this.audio.sfx('capture');
      this.ui.toast('¡Criatura vinculada!', `${CREATURES[target.typeId]?.name || target.def.name} se une a tu colección.`, 'success', 3600);
      if (Object.keys(this.state.creatures).length >= 3) this.unlockAchievement('collector');
      this.player.recalc();
      this.ui.hudDirty = true;
      this.autoSave(true);
      return true;
    }
    target.captureAttempts++;
    target.aggro = true;
    target.aggroTimer = 8;
    this.addParticles(target.x, target.y - 20, 10, '#9aa8c2', 'dust');
    this.audio.sfx('error');
    this.ui.toast('Se resiste', `Probabilidad ${Math.round(odds * 100)}%. Vuelve a intentarlo.`, 'warning', 2200);
    return false;
  }

  // -------------------------------------------------------------------------
  // INTERACCIÓN
  // -------------------------------------------------------------------------

  interact() {
    if (this.scene !== 'playing' || !this.world || !this.player || this.player.state === 'dead') return;
    const target = this.world.nearInteractable(this.player.x, this.player.y, 98);
    if (!target) {
      const capture = this.findCaptureTarget();
      if (capture) this.tryCapture();
      return;
    }
    const data = target.interact || {};
    switch (data.kind) {
      case 'npc': this.talkToNpc(target); break;
      case 'shrine': this.useShrine(target); break;
      case 'chest': this.openChest(target); break;
      case 'portal': this.usePortal(target); break;
      case 'rune': this.activateRune(target); break;
      case 'altar': this.useAltar(target); break;
      case 'sign': this.readSign(target); break;
      case 'lore': this.readLore(target); break;
      case 'firefly': this.collectFirefly(target); break;
      case 'echo': this.collectEcho(target); break;
      default:
        this.ui.toast('No ocurre nada', 'Solo el viento entre las piedras.', 'info', 1600);
    }
  }

  talkToNpc(npc) {
    const data = buildNpcDialogue(this, npc);
    if (!data) return;
    this.audio.sfx('ui');
    this.openDialogue(data);
  }

  useShrine(prop) {
    const p = this.player;
    const id = prop.id || prop.interact?.id || 'shrine';
    p.hp = p.maxHp;
    p.mp = p.maxMp;
    p.stamina = p.maxStamina;
    p.burnTimer = 0;
    p.slowTimer = 0;
    p.freezeTimer = 0;
    this.state.player.hp = p.maxHp;
    this.state.player.mp = p.maxMp;
    this.state.flags.lastShrine = { mapId: this.world.id, x: prop.x, y: prop.y + 44 };
    this.state.flags[`shrine_${id}`] = true;
    this.addParticles(prop.x, prop.y - 24, 34, '#9fe3ff', 'burst');
    this.addParticles(prop.x, prop.y - 20, 18, '#fff3c4', 'heal');
    this.addFloatText(prop.x, prop.y - 70, 'VIDA Y MANÁ RESTAURADOS', '#9fe3ff', 16);
    this.audio.sfx('heal');
    this.camera.shake(4);
    this.ui.toast('Santuario de luz', 'Has recuperado vida, maná y resistencia. El punto de reaparición ha sido guardado.', 'success', 3800);
    this.ui.hudDirty = true;
    this.autoSave(true);
  }

  openChest(prop) {
    const id = prop.interact?.id || prop.id;
    const flag = `chest_${id}`;
    if (this.state.flags[flag]) {
      this.ui.toast('Cofre vacío', 'Solo queda polvo y una marca de luz.', 'info', 1800);
      this.audio.sfx('ui_back');
      return;
    }
    this.state.flags[flag] = true;
    const data = prop.interact || {};
    let gold = data.gold || 0;
    if (!gold) gold = randInt(18, 70);
    this.state.player.gold += gold;
    this.addFloatText(prop.x, prop.y - 42, `+${gold} oro`, '#ffe6a0', 18);
    const obtained = [];
    for (const entry of data.items || []) {
      const isEquip = entry.equipment || WEAPONS[entry.id] || ARMORS[entry.id] || SHIELDS[entry.id] || ACCESSORIES[entry.id];
      if (isEquip) {
        const granted = this.grantEquipment(entry.id, true);
        if (granted) obtained.push(granted.def.name);
      } else if (this.addItem(entry.id, entry.qty || 1, true)) {
        obtained.push(`${ITEMS[entry.id]?.name || entry.id} x${entry.qty || 1}`);
      }
    }
    this.addParticles(prop.x, prop.y - 24, 26, '#ffe6a0', 'burst');
    this.addParticles(prop.x, prop.y - 30, 14, '#fff3c4', 'spark');
    this.audio.sfx('chest');
    this.camera.shake(5);
    this.ui.toast('Cofre abierto', `${gold} de oro${obtained.length ? ` · ${obtained.join(' · ')}` : ''}`, 'success', 4200);
    this.ui.hudDirty = true;
    this.autoSave(true);
  }

  usePortal(prop) {
    const data = prop.interact || {};
    if (!data.to) return;
    if (data.requires === 'ruins' && !this.state.flags.altar_alba) {
      this.audio.sfx('locked');
      this.ui.toast('Portal sellado', 'El Altar del Alba aún no ha reconocido tu juramento.', 'warning', 3200);
      return;
    }
    if (data.requires === 'sanctuary' && !this.state.flags.guardian_defeated) {
      this.audio.sfx('locked');
      this.ui.toast('Portal sellado', 'El Guardián Corrompido aún custodia el trono de Aether.', 'warning', 3200);
      return;
    }
    if (this.state.flags.kael_active && !this.state.flags.kael_defeated && this.world.id === 'sanctuary') {
      this.ui.toast('No puedes huir', 'Kael ha cerrado el círculo. Termina el combate.', 'danger', 2600);
      this.audio.sfx('error');
      return;
    }
    this.travel(data.to, data.spawn, data.label);
  }

  useAltar(prop) {
    const q = this.state.quests.main;
    if (q.stage >= 2) {
      this.ui.toast('Altar del Alba', 'El fragmento ya descansa en tu mochila. Las runas de Aether te esperan.', 'info', 3200);
      return;
    }
    if (q.stage < 1) {
      this.ui.toast('El altar duerme', 'La Anciana Mira debe explicarte el juramento antes de que la piedra despierte.', 'warning', 3000);
      return;
    }
    q.stage = 2;
    q.status = 'active';
    this.state.flags.altar_alba = true;
    this.addItem('fragmento_alba', 1, true);
    this.addParticles(prop.x, prop.y - 40, 48, '#ffe6a0', 'burst');
    this.addParticles(prop.x, prop.y - 30, 30, '#fff3c4', 'spark');
    this.addFloatText(prop.x, prop.y - 86, 'FRAGMENTO DEL ALBA', '#ffe6a0', 20);
    this.audio.sfx('victory');
    this.camera.shake(16);
    this.ui.toast('Fragmento del Alba obtenido', 'La hoja reconoce tu juramento. Las Ruinas de Aether se han abierto al este.', 'success', 5200);
    this.updateQuestMarkers();
    this.autoSave(true);
  }

  activateRune(prop) {
    const runeId = prop.runeId || prop.interact?.runeId;
    const q = this.state.quests.main;
    const f = this.state.flags;
    if (q.stage < 2) {
      this.ui.toast('Runa inerte', 'Primero debes obtener el Fragmento del Alba.', 'warning', 2800);
      return;
    }
    if (f[`rune_${runeId}`]) {
      this.ui.toast('Runa ya activa', 'Su luz sigue ardiendo.', 'info', 1800);
      return;
    }
    const order = ['sol', 'luna', 'estrella'];
    const next = order.find((id) => !f[`rune_${id}`]);
    if (runeId !== next) {
      f.rune_sol = false;
      f.rune_luna = false;
      f.rune_estrella = false;
      f.runes_done = false;
      this.camera.shake(16);
      this.audio.sfx('error');
      this.addParticles(prop.x, prop.y - 20, 24, '#ff6b6b', 'burst');
      this.ui.toast('Orden incorrecto', `La primera runa debe ser ${next.toUpperCase()}. Las tres luces se han apagado.`, 'danger', 4200);
      this.updateQuestMarkers();
      return;
    }
    f[`rune_${runeId}`] = true;
    this.addParticles(prop.x, prop.y - 20, 30, '#9fe3ff', 'burst');
    this.addParticles(prop.x, prop.y - 26, 18, '#fff3c4', 'spark');
    this.audio.sfx('rune');
    this.camera.shake(6);
    const lit = order.filter((id) => f[`rune_${id}`]).length;
    if (lit >= 3) {
      f.runes_done = true;
      this.audio.sfx('victory');
      this.camera.shake(22);
      this.ui.toast('Las tres runas despiertan', 'El trono de Aether se abre. El Guardián Corrompido ha despertado.', 'success', 5200);
      this.addParticles(this.player.x, this.player.y - 40, 50, '#c9a6ff', 'burst');
      this.updateMusic();
      this.autoSave(true);
    } else {
      this.ui.toast(`Runa ${runeId.toUpperCase()} activada`, `${lit} de 3 luces sostienen el cielo.`, 'success', 3000);
    }
    this.updateQuestMarkers();
  }

  readSign(prop) {
    const text = prop.interact?.text || prop.text || 'La tinta se ha borrado con los años.';
    this.openDialogue({
      name: 'Letrero de Aurelia', title: 'Memoria del camino', color: '#6b5a3a', accent: '#e8c56a', hair: '#3b2a1d', hairStyle: 0,
      pages: [{ text, choices: [{ text: 'Seguir el camino.', action: 'close' }] }],
    });
  }

  readLore(prop) {
    const text = prop.interact?.text || prop.text || 'La piedra está demasiado erosionada para leerla.';
    this.openDialogue({
      name: 'Piedra de Lore', title: 'Eco de Aether', color: '#3c4a8a', accent: '#9fe3ff', hair: '#c9d8ff', hairStyle: 0,
      pages: [
        { text, choices: [{ text: 'Recordar la secuencia.', action: 'close' }] },
        { text: 'El orden grabado en la piedra es SOL → LUNA → ESTRELLA. Las ruinas parecen contener la respiración.', choices: [{ text: 'Cerrar.', action: 'close' }] },
      ],
    });
    this.addParticles(prop.x, prop.y - 26, 16, '#9fe3ff', 'spark');
  }

  collectFirefly(prop) {
    const id = prop.interact?.id || prop.id;
    const flag = `firefly_${id}`;
    if (this.state.flags[flag]) {
      this.ui.toast('Luz recogida', 'Solo queda un parpadeo en el aire.', 'info', 1600);
      return;
    }
    this.state.flags[flag] = true;
    this.addItem('luciernaga', 1, true);
    this.addParticles(prop.x, prop.y - 18, 18, '#c8ff9a', 'spark');
    this.addParticles(prop.x, prop.y - 18, 10, '#fff3c4', 'heal');
    this.audio.sfx('firefly');
    this.ui.toast('Luciérnaga de Lumen', `La guardas en un frasco. ${this.countItem('luciernaga')} en total.`, 'success', 2600);
    this.updateQuestMarkers();
  }

  collectEcho(prop) {
    const id = prop.interact?.id || prop.id;
    const flag = `echo_${id}`;
    if (this.state.flags[flag]) {
      this.ui.toast('Eco desvanecido', 'La memoria ya te pertenece.', 'info', 1600);
      return;
    }
    this.state.flags[flag] = true;
    this.addItem('memoria', 1, true);
    this.addParticles(prop.x, prop.y - 18, 20, '#9fe3ff', 'burst');
    this.addParticles(prop.x, prop.y - 22, 12, '#c9d8ff', 'spark');
    this.audio.sfx('echo');
    this.ui.toast('Eco de Memoria', `Una voz antigua se disuelve entre tus dedos. ${this.countItem('memoria')} en total.`, 'success', 3000);
    this.updateQuestMarkers();
  }

  // -------------------------------------------------------------------------
  // PROYECTILES Y EFECTOS
  // -------------------------------------------------------------------------

  spawnProjectile(opts = {}) {
    if (!opts || !this.player) return null;
    if (this.projectiles.length > 220) return null;
    const p = new Projectile(this, opts);
    this.projectiles.push(p);
    return p;
  }

  spawnMeteor(x, y, delay = 0.7, damage = 20, team = 'enemy') {
    this.meteors.push({
      x, y, t: Math.max(0.2, delay), delay: Math.max(0.2, delay), damage, team,
      done: false, seed: rand(TAU), radius: 78,
    });
    this.addParticles(x, y - 10, 8, '#ff8a3d', 'ember');
    this.audio.sfx('meteor_warn');
  }

  explodeMeteor(m) {
    const radius = m.radius || 78;
    if (m.team === 'player') {
      this.damageEnemiesInRadius(m.x, m.y, radius, m.damage, { element: 'fuego', burn: 2, knockback: 120 });
    } else if (this.player && this.player.state !== 'dead') {
      const d = dist(m.x, m.y, this.player.x, this.player.y);
      if (d < radius + this.player.radius) this.player.damage(m.damage, { element: 'fuego', knockback: 90 });
    }
    this.addParticles(m.x, m.y - 12, 34, '#ff8a3d', 'burst');
    this.addParticles(m.x, m.y - 14, 20, '#ffe6a0', 'spark');
    this.addParticles(m.x, m.y - 8, 10, '#4a3a35', 'smoke');
    this.lightnings.push({ x: m.x, y: m.y - 16, r: radius, life: 0.35, maxLife: 0.35, color: '#ff8a3d' });
    this.audio.sfx('explosion');
    this.camera.shake(14);
  }

  spawnBossBeam(x, y, angle, damage) {
    this.beams.push({
      x, y, angle, damage, t: 1.2, maxT: 1.2, charge: 0.68, width: 56,
      hit: false, color: '#c9a6ff', length: 1200,
    });
    this.audio.sfx('beam_charge');
    this.camera.shake(8);
  }

  damagePlayerByBeam(beam) {
    const p = this.player;
    if (!p || p.state === 'dead') return;
    const dx = p.x - beam.x;
    const dy = p.y - beam.y;
    const along = dx * Math.cos(beam.angle) + dy * Math.sin(beam.angle);
    const side = Math.abs(-dx * Math.sin(beam.angle) + dy * Math.cos(beam.angle));
    if (along < -20 || along > beam.length) return;
    if (side > beam.width / 2 + p.radius) return;
    p.damage(beam.damage, { element: 'sombra', knockback: 140 });
    this.addParticles(p.x, p.y - 26, 20, beam.color, 'burst');
    this.camera.shake(18);
  }

  spawnRain(x, y, opts = {}) {
    this.rains.push({
      x, y, radius: opts.radius || 190, count: opts.count || 16, spawned: 0,
      interval: opts.interval || 0.07, t: opts.duration || 1.5, spawnTimer: 0,
      damage: opts.damage || 14, team: opts.team || 'player', kind: opts.kind || 'arrow',
      color: opts.color || '#ffe6a0',
    });
    this.audio.sfx('rain');
  }

  schedule(delay, fn) {
    if (typeof fn !== 'function') return null;
    const timer = { t: Math.max(0, delay), fn, done: false };
    this.timers.push(timer);
    return timer;
  }

  addParticles(x, y, count = 10, color = '#ffe6a0', kind = 'spark') {
    if (!this.player) return;
    const max = this.settings.quality === 'low' ? 260 : this.settings.quality === 'medium' ? 520 : 820;
    if (this.particles.length > max) count = Math.min(count, 4);
    for (let i = 0; i < count; i++) {
      const a = rand(TAU);
      let speed = rand(40, 160);
      let life = rand(0.35, 0.8);
      let size = rand(1.5, 4);
      let gravity = 30;
      let drag = 2;
      let vyBias = 0;
      if (kind === 'burst') { speed = rand(60, 280); life = rand(0.35, 0.95); size = rand(2, 5.5); gravity = 80; }
      else if (kind === 'slash') { speed = rand(110, 300); life = rand(0.18, 0.4); size = rand(1.5, 3.5); gravity = 0; drag = 5; }
      else if (kind === 'dust') { speed = rand(12, 60); life = rand(0.6, 1.2); size = rand(3, 7); gravity = -12; drag = 3; }
      else if (kind === 'goo') { speed = rand(30, 150); life = rand(0.45, 0.9); size = rand(2, 5); gravity = 420; drag = 1; }
      else if (kind === 'ember') { speed = rand(8, 42); life = rand(0.7, 1.5); size = rand(1, 3); gravity = -26; drag = 1; vyBias = -rand(10, 40); }
      else if (kind === 'blood') { speed = rand(50, 180); life = rand(0.35, 0.8); size = rand(1.5, 4); gravity = 320; drag = 1.4; }
      else if (kind === 'heal') { speed = rand(10, 52); life = rand(0.6, 1.3); size = rand(2, 4); gravity = -42; drag = 1.6; vyBias = -rand(20, 60); }
      else if (kind === 'smoke') { speed = rand(6, 34); life = rand(0.9, 1.8); size = rand(5, 12); gravity = -22; drag = 1.1; vyBias = -rand(10, 30); }
      else if (kind === 'leaf') { speed = rand(12, 50); life = rand(1.1, 2.2); size = rand(2, 4); gravity = 18; drag = 1.4; }
      this.particles.push({
        x: x + rand(-6, 6), y: y + rand(-6, 6),
        vx: Math.cos(a) * speed, vy: Math.sin(a) * speed + vyBias,
        life, maxLife: life, size, color, kind, gravity, drag,
        rot: rand(TAU), spin: rand(-5, 5),
      });
    }
  }

  addFloatText(x, y, text, color = '#fff3c4', size = 16) {
    if (!this.settings.damageNumbers) return;
    if (!Number.isFinite(x) || !Number.isFinite(y)) return;
    this.floatTexts.push({ x, y, text: String(text), color, size, life: 1.15, maxLife: 1.15, vy: -8 });
  }

  vibrate(ms = 20) {
    if (!this.settings.vibration) return;
    vibrate(ms, true);
  }

  // -------------------------------------------------------------------------
  // RENDER DEL MUNDO
  // -------------------------------------------------------------------------

  drawWorld(ctx, t) {
    const W = this.viewW;
    const H = this.viewH;
    const world = this.world;
    const player = this.player;
    if (!world || !player) return;

    const shake = this.settings.shake && this.camera.shakeT > 0 ? this.camera.shakeMag * (this.camera.shakeT / 0.3) : 0;
    const shakeX = shake ? rand(-shake, shake) : 0;
    const shakeY = shake ? rand(-shake, shake) : 0;
    const camX = Math.round(this.camera.x - shakeX);
    const camY = Math.round(this.camera.y - shakeY);
    const cam = { x: camX, y: camY };

    ctx.save();
    ctx.translate(-camX, -camY);
    world.drawGround(ctx, camX, camY, W, H);
    world.drawAmbientBack(ctx, cam, W, H);

    // Nubes y capas de fondo.
    for (const p of world.props) {
      if (p.type === 'cloud' && this.isVisible(p.x, p.y, cam, 240)) drawProp(ctx, p, t, this);
    }

    this.drawTelegraphs(ctx, t);

    // Profundidad: props, NPCs, jugador, enemigos, recompensas e invocaciones.
    const drawables = [];
    for (const p of world.props) {
      if (p.type === 'cloud') continue;
      if (!this.isVisible(p.x, p.y, cam, p.type === 'house' ? 340 : 190)) continue;
      drawables.push({ y: p.y, draw: () => drawProp(ctx, p, t, this) });
    }
    for (const n of world.npcs) {
      if (!this.isVisible(n.x, n.y, cam, 100)) continue;
      drawables.push({ y: n.y, draw: () => drawNPC(ctx, n, t) });
    }
    if (this.isVisible(player.x, player.y, cam, 120)) {
      drawables.push({ y: player.y, draw: () => player.draw(ctx, t) });
    }
    for (const e of this.enemies) {
      if (!this.isVisible(e.x, e.y, cam, 180)) continue;
      drawables.push({ y: e.y, draw: () => e.draw(ctx, t) });
    }
    for (const p of this.pickups) {
      if (!this.isVisible(p.x, p.y, cam, 50)) continue;
      drawables.push({ y: p.y, draw: () => p.draw(ctx, t) });
    }
    for (const s of this.summons) {
      if (!this.isVisible(s.x, s.y, cam, 80)) continue;
      drawables.push({ y: s.y, draw: () => s.draw(ctx, t) });
    }
    drawables.sort((a, b) => a.y - b.y);
    for (const d of drawables) d.draw();

    // Proyectiles y efectos mágicos.
    for (const p of this.projectiles) p.draw(ctx, t);
    this.drawParticles(ctx);
    this.drawMeteors(ctx, t);
    this.drawBeams(ctx, t);
    this.drawRains(ctx, t);
    this.drawLightningRings(ctx);

    // Marcadores de misión.
    for (const m of this.questMarkers) {
      if (!this.isVisible(m.x, m.y, cam, 80)) continue;
      const bob = Math.sin(t * 2.2 + m.x * 0.01) * 4;
      ctx.save();
      ctx.translate(m.x, m.y - 78 + bob);
      drawGlow(ctx, 0, 0, 22, '#ffe6a0', 0.32);
      ctx.fillStyle = '#ffe6a0';
      drawStar(ctx, 0, 0, 7, 4, 0.42);
      ctx.fill();
      ctx.strokeStyle = '#fff8dc';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.restore();
    }

    // Texto flotante.
    for (const f of this.floatTexts) {
      const a = clamp(f.life / f.maxLife, 0, 1);
      ctx.save();
      ctx.globalAlpha = a;
      ctx.font = `700 ${f.size || 16}px Georgia, "Times New Roman", serif`;
      ctx.textAlign = 'center';
      ctx.lineWidth = 3.5;
      ctx.strokeStyle = 'rgba(4,7,14,.88)';
      ctx.strokeText(f.text, f.x, f.y);
      ctx.fillStyle = f.color || '#fff3c4';
      ctx.fillText(f.text, f.x, f.y);
      ctx.restore();
    }

    world.drawAmbientFront(ctx, cam, W, H);
    ctx.restore();

    // Iluminación, niebla y efectos de pantalla.
    this.drawLighting(ctx, camX, camY, t);
    this.drawAtmosphere(ctx, t);
    this.drawScreenEffects(ctx, t);
    this.drawBossBar(ctx, t);
  }

  isVisible(x, y, cam, margin = 80) {
    return x > cam.x - margin && x < cam.x + this.viewW + margin && y > cam.y - margin && y < cam.y + this.viewH + margin;
  }

  drawTelegraphs(ctx, t) {
    for (const e of this.enemies) {
      const tg = e.telegraph;
      if (!tg || e.dead) continue;
      const pulse = 0.18 + Math.sin(t * 22) * 0.06;
      ctx.save();
      ctx.translate(tg.x, tg.y);
      if (tg.type === 'circle') {
        const r = tg.r || 60;
        const g = ctx.createRadialGradient(0, 0, r * 0.15, 0, 0, r);
        g.addColorStop(0, hexToRgba(tg.color || '#ff6b6b', pulse * 0.7));
        g.addColorStop(0.72, hexToRgba(tg.color || '#ff6b6b', pulse));
        g.addColorStop(1, hexToRgba(tg.color || '#ff6b6b', 0));
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.fill();
        ctx.strokeStyle = hexToRgba(tg.color || '#ff6b6b', 0.65);
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(0, 0, r * (0.5 + Math.sin(t * 5) * 0.02), 0, TAU); ctx.stroke();
      } else if (tg.type === 'line') {
        ctx.rotate(tg.angle || 0);
        const len = tg.length || 260;
        const wid = tg.width || 44;
        const g = ctx.createLinearGradient(0, 0, len, 0);
        g.addColorStop(0, hexToRgba(tg.color || '#ffcf5a', pulse * 1.4));
        g.addColorStop(0.7, hexToRgba(tg.color || '#ffcf5a', pulse * 0.55));
        g.addColorStop(1, hexToRgba(tg.color || '#ffcf5a', 0));
        ctx.fillStyle = g;
        ctx.fillRect(0, -wid / 2, len, wid);
        ctx.strokeStyle = hexToRgba(tg.color || '#ffcf5a', 0.42);
        ctx.lineWidth = 1.5;
        ctx.strokeRect(0, -wid / 2, len, wid);
      } else if (tg.type === 'arc' || tg.type === 'slash' || tg.type === 'wave') {
        const r = tg.radius || (tg.type === 'wave' ? 150 : 150);
        const arc = tg.arc || (tg.type === 'slash' ? 2.4 : 1.7);
        const a0 = (tg.angle || 0) - arc / 2;
        const a1 = (tg.angle || 0) + arc / 2;
        const g = ctx.createRadialGradient(0, 0, r * 0.2, 0, 0, r);
        g.addColorStop(0, hexToRgba(tg.color || '#ffcf5a', 0));
        g.addColorStop(0.75, hexToRgba(tg.color || '#ffcf5a', pulse * 0.5));
        g.addColorStop(1, hexToRgba(tg.color || '#ffcf5a', pulse));
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, r, a0, a1); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = hexToRgba(tg.color || '#ffcf5a', 0.7);
        ctx.lineWidth = 2.5;
        ctx.beginPath(); ctx.arc(0, 0, r, a0, a1); ctx.stroke();
      }
      ctx.restore();
    }
  }

  drawParticles(ctx) {
    for (const p of this.particles) {
      const a = clamp(p.life / p.maxLife, 0, 1);
      ctx.save();
      ctx.globalAlpha = a;
      ctx.translate(p.x, p.y);
      if (p.kind === 'spark' || p.kind === 'slash' || p.kind === 'ember') {
        ctx.rotate(p.rot || 0);
        ctx.fillStyle = p.color;
        if (p.kind === 'slash') {
          ctx.fillRect(-p.size * 3, -0.7, p.size * 6, 1.4);
        } else {
          ctx.beginPath(); ctx.ellipse(0, 0, p.size * 1.6, p.size * 0.55, 0, 0, TAU); ctx.fill();
        }
      } else if (p.kind === 'smoke' || p.kind === 'dust') {
        ctx.globalAlpha = a * 0.38;
        ctx.fillStyle = p.color;
        ctx.beginPath(); ctx.arc(0, 0, p.size * (1.4 + (1 - a) * 1.6), 0, TAU); ctx.fill();
      } else if (p.kind === 'leaf') {
        ctx.rotate(p.rot || 0);
        ctx.fillStyle = p.color;
        ctx.beginPath(); ctx.ellipse(0, 0, p.size * 1.7, p.size * 0.65, 0, 0, TAU); ctx.fill();
      } else {
        ctx.fillStyle = p.color;
        ctx.beginPath(); ctx.arc(0, 0, p.size, 0, TAU); ctx.fill();
        if (p.kind === 'heal' || p.kind === 'burst') {
          ctx.globalAlpha = a * 0.5;
          ctx.strokeStyle = '#fff';
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
      ctx.restore();
    }
  }

  drawMeteors(ctx, t) {
    for (const m of this.meteors) {
      if (m.done || m.t <= 0) continue;
      const prog = clamp(1 - m.t / m.delay, 0, 1);
      const r = m.radius || 78;
      ctx.save();
      ctx.translate(m.x, m.y);
      const g = ctx.createRadialGradient(0, 0, r * 0.15, 0, 0, r);
      g.addColorStop(0, 'rgba(255,138,61,.24)');
      g.addColorStop(0.7, 'rgba(255,138,61,.16)');
      g.addColorStop(1, 'rgba(255,138,61,0)');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.ellipse(0, 0, r, r * 0.62, 0, 0, TAU); ctx.fill();
      ctx.strokeStyle = `rgba(255,138,61,${0.35 + Math.sin(t * 18) * 0.15})`;
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.ellipse(0, 0, r * (0.7 + prog * 0.3), r * 0.62 * (0.7 + prog * 0.3), 0, 0, TAU); ctx.stroke();
      const fy = -380 + prog * 380;
      const fx = -110 + prog * 110;
      ctx.globalAlpha = 0.75;
      ctx.strokeStyle = '#ff8a3d';
      ctx.lineWidth = 5;
      ctx.beginPath(); ctx.moveTo(fx - 24, fy - 40); ctx.lineTo(fx, fy); ctx.stroke();
      drawGlow(ctx, fx, fy, 34, '#ff8a3d', 0.65);
      ctx.fillStyle = '#ffcf5a';
      ctx.beginPath(); ctx.arc(fx, fy, 9, 0, TAU); ctx.fill();
      ctx.fillStyle = '#fff3c4';
      ctx.beginPath(); ctx.arc(fx - 2, fy - 2, 4, 0, TAU); ctx.fill();
      ctx.restore();
    }
  }

  drawBeams(ctx, t) {
    for (const b of this.beams) {
      ctx.save();
      ctx.translate(b.x, b.y);
      ctx.rotate(b.angle);
      if (b.t > b.charge) {
        const charge = 1 - (b.t - b.charge) / (b.maxT - b.charge);
        ctx.globalAlpha = 0.25 + charge * 0.45;
        ctx.strokeStyle = b.color;
        ctx.lineWidth = 1.5 + charge * 4;
        ctx.setLineDash([12, 10]);
        ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(b.length, 0); ctx.stroke();
        ctx.setLineDash([]);
        drawGlow(ctx, 0, 0, 24 + charge * 28, b.color, 0.6);
      } else {
        const fire = clamp(b.t / b.charge, 0, 1);
        const w = b.width * (0.5 + fire * 0.8);
        ctx.globalAlpha = 0.25 * fire;
        ctx.fillStyle = b.color;
        ctx.fillRect(0, -w, b.length, w * 2);
        ctx.globalAlpha = 0.8 * fire;
        ctx.fillStyle = '#fff3c4';
        ctx.fillRect(0, -w * 0.24, b.length, w * 0.48);
        ctx.globalAlpha = 0.9 * fire;
        ctx.strokeStyle = b.color;
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(0, -w * 0.55); ctx.lineTo(b.length, -w * 0.55); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, w * 0.55); ctx.lineTo(b.length, w * 0.55); ctx.stroke();
        drawGlow(ctx, 0, 0, 42, b.color, 0.7 * fire);
      }
      ctx.restore();
    }
  }

  drawRains(ctx, t) {
    for (const r of this.rains) {
      if (r.t < 0.15) continue;
      ctx.save();
      ctx.translate(r.x, r.y);
      ctx.globalAlpha = 0.16 + Math.sin(t * 8) * 0.04;
      ctx.strokeStyle = r.color;
      ctx.lineWidth = 1.5;
      ctx.setLineDash([7, 12]);
      ctx.beginPath(); ctx.ellipse(0, 0, r.radius, r.radius * 0.62, 0, 0, TAU); ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
    }
  }

  drawLightningRings(ctx) {
    for (const l of this.lightnings) {
      const a = clamp(l.life / l.maxLife, 0, 1);
      const r = l.r * (1.15 - a * 0.55);
      ctx.save();
      ctx.globalAlpha = a * 0.8;
      ctx.strokeStyle = l.color || '#ffe6a0';
      ctx.lineWidth = 2 + a * 4;
      ctx.beginPath(); ctx.ellipse(l.x, l.y, r, r * 0.55, 0, 0, TAU); ctx.stroke();
      ctx.restore();
    }
  }

  drawLighting(ctx, camX, camY, t) {
    const W = this.viewW;
    const H = this.viewH;
    const mapId = this.world?.id;
    const darkness = mapId === 'village' ? 0.035 : mapId === 'forest' ? 0.15 : mapId === 'ruins' ? 0.46 : 0.4;
    if (darkness > 0.02) {
      ctx.save();
      ctx.fillStyle = `rgba(3,5,13,${darkness})`;
      ctx.fillRect(0, 0, W, H);
      ctx.globalCompositeOperation = 'lighter';
      const lights = this.world?.def?.lights || [];
      for (let i = 0; i < lights.length; i++) {
        const l = lights[i];
        const sx = l.x - camX;
        const sy = l.y - camY;
        const r = l.r || 140;
        if (sx < -r || sx > W + r || sy < -r || sy > H + r) continue;
        const flick = 0.86 + Math.sin(t * 3.4 + i * 1.7) * 0.1 + Math.sin(t * 9.1 + i) * 0.04;
        const g = ctx.createRadialGradient(sx, sy, r * 0.05, sx, sy, r * flick);
        g.addColorStop(0, hexToRgba(l.color || '#ffb35a', 0.2));
        g.addColorStop(0.45, hexToRgba(l.color || '#ffb35a', 0.09));
        g.addColorStop(1, hexToRgba(l.color || '#ffb35a', 0));
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(sx, sy, r * flick, 0, TAU); ctx.fill();
      }
      // Aura del jugador.
      if (this.player) {
        const px = this.player.x - camX;
        const py = this.player.y - 26 - camY;
        const aura = ctx.createRadialGradient(px, py, 4, px, py, 130);
        aura.addColorStop(0, 'rgba(255,243,196,.1)');
        aura.addColorStop(0.55, 'rgba(159,227,255,.045)');
        aura.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = aura;
        ctx.beginPath(); ctx.arc(px, py, 130, 0, TAU); ctx.fill();
      }
      ctx.restore();
    }
  }

  drawAtmosphere(ctx, t) {
    const W = this.viewW;
    const H = this.viewH;
    const id = this.world?.id;
    if (id === 'forest' || id === 'ruins' || id === 'sanctuary') {
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      const color = id === 'forest' ? 'rgba(120,190,140,' : id === 'ruins' ? 'rgba(120,140,220,' : 'rgba(255,225,160,';
      for (let i = 0; i < 4; i++) {
        const y = H * (0.3 + i * 0.18) + Math.sin(t * 0.16 + i * 2) * 18;
        const x = ((t * (7 + i * 4) + i * W * 0.28) % (W + 420)) - 210;
        const g = ctx.createRadialGradient(x, y, 10, x, y, W * 0.28);
        g.addColorStop(0, `${color}${0.032 + i * 0.007})`);
        g.addColorStop(1, `${color}0)`);
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.ellipse(x, y, W * 0.3, H * 0.09, 0, 0, TAU); ctx.fill();
      }
      ctx.restore();
    }
  }

  drawScreenEffects(ctx, t) {
    const W = this.viewW;
    const H = this.viewH;
    const p = this.player;
    const vig = ctx.createRadialGradient(W * 0.5, H * 0.5, Math.min(W, H) * 0.3, W * 0.5, H * 0.5, Math.max(W, H) * 0.78);
    vig.addColorStop(0, 'rgba(0,0,0,0)');
    vig.addColorStop(0.7, 'rgba(2,4,10,.16)');
    vig.addColorStop(1, 'rgba(2,4,10,.55)');
    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, W, H);

    if (p && p.state !== 'dead' && p.hp / p.maxHp < 0.3) {
      const pulse = 0.12 + Math.sin(t * 6) * 0.05;
      const g = ctx.createRadialGradient(W * 0.5, H * 0.5, Math.min(W, H) * 0.28, W * 0.5, H * 0.5, Math.max(W, H) * 0.7);
      g.addColorStop(0, 'rgba(120,10,20,0)');
      g.addColorStop(1, `rgba(150,15,25,${pulse})`);
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
    }
    if (p && p.hurtFlash > 0) {
      ctx.fillStyle = `rgba(255,60,70,${clamp(p.hurtFlash * 0.16, 0, 0.2)})`;
      ctx.fillRect(0, 0, W, H);
    }
    if (this.state?.flags.kael_active && !this.state.flags.kael_defeated && this.world?.id === 'sanctuary') {
      ctx.fillStyle = 'rgba(120,70,180,.035)';
      ctx.fillRect(0, 0, W, H);
    }
  }

  drawBossBar(ctx, t) {
    const boss = this.enemies.find((e) => !e.dead && (e.boss || e.typeId === 'guardian'));
    if (!boss) return;
    const W = this.viewW;
    const barW = Math.min(560, W * 0.58);
    const barH = 12;
    const x = (W - barW) / 2;
    const y = 22;
    const ratio = clamp(boss.hp / boss.maxHp, 0, 1);
    ctx.save();
    ctx.fillStyle = 'rgba(4,7,14,.76)';
    this.roundRect(ctx, x - 14, y - 20, barW + 28, 56, 12);
    ctx.fill();
    ctx.strokeStyle = 'rgba(232,197,106,.34)';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.textAlign = 'center';
    ctx.fillStyle = '#e8c56a';
    ctx.font = '700 13px Georgia, serif';
    ctx.fillText(boss.def.name.toUpperCase(), W / 2, y - 5);
    ctx.fillStyle = 'rgba(10,14,26,.9)';
    this.roundRect(ctx, x, y + 3, barW, barH, 6);
    ctx.fill();
    const g = ctx.createLinearGradient(x, 0, x + barW, 0);
    if (boss.phase >= 3) { g.addColorStop(0, '#ff6b6b'); g.addColorStop(1, '#ffcf5a'); }
    else if (boss.phase >= 2) { g.addColorStop(0, '#c9a6ff'); g.addColorStop(1, '#ff8a3d'); }
    else { g.addColorStop(0, '#8f7ac9'); g.addColorStop(1, '#c9a6ff'); }
    ctx.fillStyle = g;
    this.roundRect(ctx, x, y + 3, Math.max(0, barW * ratio), barH, 6);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,.22)';
    ctx.lineWidth = 1;
    this.roundRect(ctx, x, y + 3, barW, barH, 6);
    ctx.stroke();
    // Marcas de fase.
    for (const mark of [0.33, 0.66]) {
      ctx.fillStyle = 'rgba(255,255,255,.3)';
      ctx.fillRect(x + barW * mark, y + 3, 1, barH);
    }
    ctx.fillStyle = 'rgba(255,243,196,.78)';
    ctx.font = '10px Georgia, serif';
    ctx.fillText(`FASE ${boss.phase} · ${Math.ceil(boss.hp)} / ${boss.maxHp}`, W / 2, y + 29);
    ctx.restore();
  }

  roundRect(ctx, x, y, w, h, r) {
    const rr = Math.min(r, Math.abs(w) / 2, Math.abs(h) / 2);
    ctx.beginPath();
    ctx.moveTo(x + rr, y);
    ctx.arcTo(x + w, y, x + w, y + h, rr);
    ctx.arcTo(x + w, y + h, x, y + h, rr);
    ctx.arcTo(x, y + h, x, y, rr);
    ctx.arcTo(x, y, x + w, y, rr);
    ctx.closePath();
  }
}
