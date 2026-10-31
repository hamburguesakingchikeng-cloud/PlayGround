import * as THREE from 'three';
import { AudioEngine } from '../core/audio.js';
import { Input } from '../core/input.js';
import { VFX, Projectile } from './vfx.js';
import { buildWorld } from './world.js';
import { Player } from './player.js';
import { Enemy } from './enemies.js';
import { createHero, createCreature, animateCreature, poseHero, updateHeroAppearance } from './character.js';
import {
  REGIONS, REGION_ORDER, ORIGINS, HAIR_STYLES, HAIR_COLORS, SKIN_COLORS, OUTFITS,
  ATTRIBUTES, CREATURES, ITEMS, LORE, INTRO_SLIDES, ENDING_TEXT, SAVE_KEY,
} from './data.js';
import * as Story from './story.js';
import {
  clamp, damp, dampAngle, angleDelta, dist2D, projectToScreen, portraitFor,
  svgPortrait, formatTime, elementColor,
} from '../core/utils.js';

const SETTINGS_KEY = 'la-espada-celestial-settings-v1';
const BASE_ATTRIBUTES = { vit: 3, mana: 2, res: 3, str: 3, def: 3, spd: 3, int: 2, luck: 2 };
const CHAPTER = { valdoria: 0, drakmore: 1, kansordore: 2 };
const BOSS_DATA = {
  valdoria: { name: 'Centinela de Ceniza', epithet: 'GUARDIÁN DE LA GRIETA', type: 'humanoid' },
  drakmore: { name: 'Kael, el Rey Cenizo', epithet: 'SEÑOR DE LA PRIMERA BRASA', type: 'humanoid' },
  kansordore: { name: 'Jugador Cero', epithet: 'EL ESPEJO DEL VELO', type: 'humanoid' },
};
const ENEMY_LAYOUT = {
  valdoria: [
    [-13, -7, 'corrupt'], [15, -19, 'wraith'], [-24, 13, 'corrupt'], [31, 5, 'golem'],
    [9, 22, 'wraith'], [-37, 11, 'corrupt'], [25, -30, 'corrupt'], [-9, 35, 'golem'],
    [35, 26, 'wraith', true],
  ],
  drakmore: [
    [-12, -31, 'corrupt'], [15, -20, 'wraith'], [-27, -9, 'golem'], [27, -16, 'corrupt'],
    [11, 11, 'wraith'], [-19, 21, 'corrupt'], [31, 29, 'golem'], [-8, 31, 'wraith'],
    [25, 8, 'corrupt', true],
  ],
  kansordore: [
    [-14, -25, 'corrupt'], [17, -17, 'wraith'], [-27, 9, 'golem'], [25, 7, 'corrupt'],
    [13, 31, 'wraith'], [-31, 21, 'corrupt'], [31, 33, 'golem'], [-7, 15, 'wraith'],
    [-22, -6, 'corrupt', true],
  ],
};

function cloneQuests() {
  const quests = {};
  for (const id of REGION_ORDER) {
    quests[id] = {
      stage: 0,
      cleansedRifts: [],
      brokenSeals: [],
      primordialSeals: [],
      bossDefeated: false,
      completed: false,
    };
  }
  return quests;
}

function mergeQuests(saved) {
  const quests = cloneQuests();
  if (!saved) return quests;
  for (const id of REGION_ORDER) {
    if (!saved[id]) continue;
    const q = saved[id];
    quests[id] = {
      ...quests[id],
      ...q,
      cleansedRifts: Array.isArray(q.cleansedRifts) ? q.cleansedRifts : [],
      brokenSeals: Array.isArray(q.brokenSeals) ? q.brokenSeals : [],
      primordialSeals: Array.isArray(q.primordialSeals) ? q.primordialSeals : [],
    };
  }
  return quests;
}

function makeTitleSword() {
  const group = new THREE.Group();
  const gold = new THREE.MeshStandardMaterial({ color: '#d9b873', metalness: 0.92, roughness: 0.22, emissive: '#7a541c', emissiveIntensity: 0.3 });
  const bladeMat = new THREE.MeshStandardMaterial({ color: '#dceef2', metalness: 0.86, roughness: 0.14, emissive: '#6bc7d1', emissiveIntensity: 0.32 });
  const edgeMat = new THREE.MeshBasicMaterial({ color: '#c9fbff', transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending });
  const gemMat = new THREE.MeshStandardMaterial({ color: '#a7f6ef', emissive: '#57e4dc', emissiveIntensity: 2.4, metalness: 0.4, roughness: 0.1 });

  const blade = new THREE.Mesh(new THREE.BoxGeometry(0.72, 12.6, 0.11), bladeMat);
  blade.position.y = 1.9;
  blade.castShadow = true;
  group.add(blade);
  const tip = new THREE.Mesh(new THREE.ConeGeometry(0.51, 1.65, 4), bladeMat);
  tip.position.y = 9.02;
  tip.rotation.y = Math.PI / 4;
  group.add(tip);
  for (const s of [-1, 1]) {
    const edge = new THREE.Mesh(new THREE.BoxGeometry(0.035, 12.2, 0.015), edgeMat);
    edge.position.set(s * 0.36, 1.9, 0.062);
    group.add(edge);
  }
  const fuller = new THREE.Mesh(new THREE.BoxGeometry(0.075, 11.3, 0.015), new THREE.MeshBasicMaterial({ color: '#bff7ff', transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending }));
  fuller.position.set(0, 1.85, 0.066);
  group.add(fuller);

  const guard = new THREE.Mesh(new THREE.BoxGeometry(4.1, 0.24, 0.34), gold);
  guard.position.y = -4.55;
  group.add(guard);
  for (const s of [-1, 1]) {
    const wing = new THREE.Mesh(new THREE.ConeGeometry(0.28, 1.15, 4), gold);
    wing.position.set(s * 2.1, -4.35, 0);
    wing.rotation.z = s * -0.72;
    group.add(wing);
  }
  const collar = new THREE.Mesh(new THREE.TorusGeometry(0.46, 0.09, 6, 20), gold);
  collar.position.y = -4.38;
  collar.rotation.x = Math.PI / 2;
  group.add(collar);
  const gem = new THREE.Mesh(new THREE.OctahedronGeometry(0.34, 0), gemMat);
  gem.position.y = -4.38;
  gem.scale.set(1, 1.35, 0.6);
  group.add(gem);

  const grip = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.2, 2.3, 8), new THREE.MeshStandardMaterial({ color: '#2c2524', roughness: 0.82 }));
  grip.position.y = -5.85;
  group.add(grip);
  for (let i = 0; i < 5; i++) {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.19, 0.025, 4, 14), gold);
    ring.position.y = -5.0 - i * 0.4;
    ring.rotation.x = Math.PI / 2;
    group.add(ring);
  }
  const pommel = new THREE.Mesh(new THREE.OctahedronGeometry(0.38, 0), gemMat);
  pommel.position.y = -7.2;
  pommel.scale.set(0.8, 1.2, 0.8);
  group.add(pommel);

  for (let i = 0; i < 5; i++) {
    const rune = new THREE.Mesh(new THREE.TorusGeometry(0.24 + i * 0.04, 0.008, 4, 24, Math.PI * 1.25), edgeMat);
    rune.position.y = 2.8 - i * 1.6;
    rune.rotation.z = i * 1.3;
    group.add(rune);
  }

  const halo = new THREE.Mesh(
    new THREE.TorusGeometry(4.2, 0.022, 4, 80),
    new THREE.MeshBasicMaterial({ color: '#e8cb8b', transparent: true, opacity: 0.34, blending: THREE.AdditiveBlending, depthWrite: false })
  );
  halo.position.y = -1.8;
  halo.rotation.x = 1.18;
  group.add(halo);
  const halo2 = halo.clone();
  halo2.scale.setScalar(0.72);
  halo2.rotation.x = 1.4;
  halo2.rotation.z = 0.5;
  group.add(halo2);
  group.userData.halo = halo;
  group.userData.halo2 = halo2;
  group.userData.gem = gem;

  const light = new THREE.PointLight('#8ff7f1', 9, 30, 2);
  light.position.y = -3.5;
  group.add(light);
  return group;
}

function makeTitleScene() {
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2('#0a1016', 0.026);
  const camera = new THREE.PerspectiveCamera(42, window.innerWidth / window.innerHeight, 0.1, 220);

  const hemi = new THREE.HemisphereLight('#9dc5d2', '#141a1a', 1.25);
  scene.add(hemi);
  const key = new THREE.DirectionalLight('#ffdcaa', 3.1);
  key.position.set(9, 16, 11);
  key.castShadow = true;
  scene.add(key);
  const rim = new THREE.DirectionalLight('#74d8dc', 2.2);
  rim.position.set(-9, 6, -7);
  scene.add(rim);
  const low = new THREE.PointLight('#e5a35a', 12, 40, 2);
  low.position.set(-4, -2, 7);
  scene.add(low);

  const dome = new THREE.Mesh(
    new THREE.SphereGeometry(120, 32, 20),
    new THREE.ShaderMaterial({
      side: THREE.BackSide,
      depthWrite: false,
      uniforms: {
        uTop: { value: new THREE.Color('#05080d') },
        uMid: { value: new THREE.Color('#112430') },
        uLow: { value: new THREE.Color('#8b673e') },
      },
      vertexShader: 'varying vec3 vP; void main(){ vP = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
      fragmentShader: `
        uniform vec3 uTop, uMid, uLow; varying vec3 vP;
        void main(){
          float h = clamp(normalize(vP).y * 0.5 + 0.5, 0.0, 1.0);
          vec3 c = mix(uLow, uMid, smoothstep(0.32, 0.58, h));
          c = mix(c, uTop, smoothstep(0.56, 0.95, h));
          gl_FragColor = vec4(c, 1.0);
        }
      `,
    })
  );
  scene.add(dome);

  const sword = makeTitleSword();
  sword.position.set(3.9, 5.4, 0);
  sword.rotation.set(0.06, -0.42, -0.1);
  scene.add(sword);

  const rocks = new THREE.Group();
  const rockMat = new THREE.MeshStandardMaterial({ color: '#2a3138', roughness: 0.95, flatShading: true });
  const goldMat = new THREE.MeshStandardMaterial({ color: '#8b6f3f', metalness: 0.7, roughness: 0.4 });
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2 + 0.4;
    const r = 5.2 + (i % 4) * 1.4;
    const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(0.35 + (i % 3) * 0.22, 0), rockMat);
    rock.position.set(3.9 + Math.cos(a) * r, 1.2 + (i % 5) * 1.9, Math.sin(a) * r * 0.7 - 1);
    rock.rotation.set(i * 0.4, i * 0.7, i * 0.2);
    rock.userData.spin = 0.08 + (i % 3) * 0.04;
    rock.userData.baseY = rock.position.y;
    rock.userData.phase = i * 0.7;
    rocks.add(rock);
    if (i % 3 === 0) {
      const shard = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.9, 4), goldMat);
      shard.position.copy(rock.position);
      shard.position.y += 0.6;
      shard.rotation.z = 0.4;
      shard.userData.spin = 0.12;
      shard.userData.baseY = shard.position.y;
      shard.userData.phase = i;
      rocks.add(shard);
    }
  }
  scene.add(rocks);

  const starGeo = new THREE.BufferGeometry();
  const starPos = new Float32Array(700 * 3);
  for (let i = 0; i < 700; i++) {
    const r = 28 + Math.random() * 70;
    const a = Math.random() * Math.PI * 2;
    const y = (Math.random() - 0.25) * 60;
    starPos[i * 3] = Math.cos(a) * r;
    starPos[i * 3 + 1] = y;
    starPos[i * 3 + 2] = Math.sin(a) * r;
  }
  starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
  const stars = new THREE.Points(starGeo, new THREE.PointsMaterial({
    color: '#ffe6b5', size: 0.13, transparent: true, opacity: 0.7, depthWrite: false, blending: THREE.AdditiveBlending,
  }));
  scene.add(stars);

  const motes = new THREE.Group();
  const moteMat = new THREE.SpriteMaterial({ color: '#9df1e8', transparent: true, opacity: 0.65, depthWrite: false, blending: THREE.AdditiveBlending });
  for (let i = 0; i < 44; i++) {
    const s = new THREE.Sprite(moteMat.clone());
    s.position.set(3.9 + (Math.random() - 0.5) * 16, Math.random() * 14, (Math.random() - 0.5) * 12);
    s.scale.setScalar(0.05 + Math.random() * 0.14);
    s.userData.baseY = s.position.y;
    s.userData.phase = Math.random() * Math.PI * 2;
    s.userData.speed = 0.2 + Math.random() * 0.5;
    motes.add(s);
  }
  scene.add(motes);

  return { scene, camera, sword, rocks, stars, motes, key, rim };
}

export class App {
  constructor() {
    this.$ = (id) => document.getElementById(id);
    this.state = 'loading';
    this.time = 0;
    this.playTime = 0;
    this.lastFrame = performance.now();
    this.loading = 0;
    this.regionId = null;
    this.world = null;
    this.player = null;
    this.enemies = [];
    this.projectiles = [];
    this.creaturesAlive = [];
    this.companion = null;
    this.companionCooldown = 0;
    this.boss = null;
    this.lockedEnemy = null;
    this.trauma = 0;
    this.cameraYaw = Math.PI;
    this.cameraPitch = 0.35;
    this.cameraDistance = 9.2;
    this.cameraPos = new THREE.Vector3(0, 6, 12);
    this.cameraTarget = new THREE.Vector3();
    this.hudTimer = 0;
    this.minimapTimer = 0;
    this.autosaveTimer = 0;
    this.lastCombat = 0;
    this.kills = 0;
    this.captures = 0;
    this.deaths = 0;
    this.quests = cloneQuests();
    this.inventory = new Set();
    this.collection = new Set();
    this.activeCreature = null;
    this.unlockedLore = new Set();
    this.openedChests = new Set();
    this.resonanceHeld = false;
    this.resonance = null;
    this.promptCreature = null;
    this.promptInteractable = null;
    this.settings = this.loadSettings();
    this.quality = this.settings.quality === 'auto'
      ? (matchMedia('(pointer: coarse)').matches ? 'medium' : 'high')
      : this.settings.quality;

    this.audio = new AudioEngine();
    this.audio.setVolume('music', this.settings.music);
    this.audio.setVolume('sfx', this.settings.sfx);

    this.setupRenderer();
    this.setupTitle();
    this.setupPreview();
    this.input = new Input(this.$('game-canvas'));
    this.vfx = new VFX(this.scene);

    this.bind();
    this.updateContinueButton();
    this.audio.setMood('title');
    this.animate(performance.now());
  }

  setupRenderer() {
    const canvas = this.$('game-canvas');
    try {
      this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance', alpha: false });
    } catch (err) {
      this.$('unsupported').style.display = 'grid';
      this.$('loading-screen').classList.remove('is-active');
      throw err;
    }
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight, false);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFShadowMap;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(54, window.innerWidth / window.innerHeight, 0.1, 340);
    this.camera.position.set(0, 6, 12);
    this.scene.add(new THREE.HemisphereLight('#a7c8d4', '#1b2119', 1.0));
    this.scene.add(new THREE.AmbientLight('#ffffff', 0.12));
    this.resize();
  }

  setupTitle() {
    const title = makeTitleScene();
    this.title = title;
    this.titleCamera = title.camera;
    this.titleCamera.position.set(-1.4, 6.4, 15.5);
  }

  setupPreview() {
    const canvas = this.$('creator-canvas');
    this.previewRenderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'low-power' });
    this.previewRenderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.8));
    this.previewRenderer.outputColorSpace = THREE.SRGBColorSpace;
    this.previewRenderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.previewRenderer.toneMappingExposure = 1.12;
    this.previewScene = new THREE.Scene();
    this.previewCamera = new THREE.PerspectiveCamera(34, 0.75, 0.1, 40);
    this.previewCamera.position.set(0, 1.55, 4.1);
    this.previewCamera.lookAt(0, 1.12, 0);
    const hemi = new THREE.HemisphereLight('#d7f1ef', '#1b2326', 2.1);
    this.previewScene.add(hemi);
    const key = new THREE.DirectionalLight('#ffe5b4', 3.4);
    key.position.set(2.6, 4.5, 3.2);
    this.previewScene.add(key);
    const rim = new THREE.DirectionalLight('#8fe4e2', 2.2);
    rim.position.set(-3, 2.5, -2);
    this.previewScene.add(rim);
    const disc = new THREE.Mesh(
      new THREE.CircleGeometry(1.1, 48),
      new THREE.MeshBasicMaterial({ color: '#78d9d1', transparent: true, opacity: 0.12, blending: THREE.AdditiveBlending, depthWrite: false })
    );
    disc.rotation.x = -Math.PI / 2;
    disc.position.y = 0.01;
    this.previewScene.add(disc);
    this.previewDisc = disc;
    this.creator = {
      name: 'Aster',
      origin: ORIGINS[0],
      hairStyle: 'short',
      hairColorId: 'plata',
      hairColor: HAIR_COLORS[0].hex,
      skinId: 'marfil',
      skin: SKIN_COLORS[0].hex,
      outfitId: 'aurora',
      outfit: OUTFITS[0],
      allocated: {},
      points: 6,
    };
    this.previewHero = null;
  }

  resize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    if (this.renderer) {
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      this.renderer.setSize(w, h, false);
    }
    if (this.camera) {
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
    }
    if (this.titleCamera) {
      this.titleCamera.aspect = w / h;
      this.titleCamera.updateProjectionMatrix();
    }
    const pc = this.$('creator-canvas');
    if (pc && this.previewRenderer) {
      const rect = pc.getBoundingClientRect();
      const pw = Math.max(120, Math.round(rect.width));
      const ph = Math.max(160, Math.round(rect.height));
      this.previewRenderer.setSize(pw, ph, false);
      this.previewCamera.aspect = pw / ph;
      this.previewCamera.updateProjectionMatrix();
    }
  }

  loadSettings() {
    try {
      const raw = localStorage.getItem(SETTINGS_KEY);
      if (raw) return { music: 0.55, sfx: 0.75, quality: 'auto', shake: true, damageNumbers: true, hints: true, ...JSON.parse(raw) };
    } catch (err) { /* ignore */ }
    return { music: 0.55, sfx: 0.75, quality: 'auto', shake: true, damageNumbers: true, hints: true };
  }

  saveSettings() {
    try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(this.settings)); } catch (err) { /* ignore */ }
  }

  showScreen(id) {
    document.querySelectorAll('.screen').forEach((screen) => {
      if (screen.id === id) return;
      if (screen.id === 'title-screen' || screen.id === 'creator-screen' || screen.id === 'intro-screen' || screen.id === 'ending-screen') {
        screen.classList.remove('is-active');
      } else {
        screen.classList.remove('is-active');
      }
    });
    if (id) {
      const el = this.$(id);
      if (el) el.classList.add('is-active');
    }
  }

  hideOverlays() {
    for (const id of ['menu-screen', 'dialogue-screen', 'modal-screen']) this.$(id)?.classList.remove('is-active');
  }

  setBodyState() {
    document.body.classList.toggle('is-playing', ['playing', 'dead', 'ending'].includes(this.state));
    document.body.classList.toggle('is-menu', this.state === 'menu');
    document.body.classList.toggle('is-dialogue', this.state === 'dialogue');
  }

  bind() {
    this.$('btn-new').addEventListener('click', () => this.openCreator());
    this.$('btn-continue').addEventListener('click', () => this.continueGame());
    this.$('btn-how').addEventListener('click', () => this.openHowToPlay());
    this.$('btn-credits').addEventListener('click', () => this.openCredits());
    this.$('creator-back').addEventListener('click', () => this.returnToTitle());
    this.$('btn-create').addEventListener('click', () => this.forgeHero());
    this.$('intro-next').addEventListener('click', () => this.nextIntro());
    this.$('intro-skip').addEventListener('click', () => this.finishIntro());
    this.$('menu-close').addEventListener('click', () => this.closeMenu());
    this.$('modal-close').addEventListener('click', () => this.closeModal());
    this.$('ending-continue').addEventListener('click', () => this.continueAfterEnding());
    this.$('ending-new').addEventListener('click', () => this.newGamePlus());
    this.$('menu-tabs').addEventListener('click', (e) => {
      const btn = e.target.closest('[data-tab]');
      if (!btn) return;
      this.audio.ui();
      this.renderMenu(btn.dataset.tab);
    });
    this.$('menu-content').addEventListener('click', (e) => this.onMenuClick(e));
    this.$('dialogue-screen').addEventListener('click', (e) => {
      if (e.target.closest('.dialogue-choice')) return;
      if (e.target.closest('#dialogue-next')) { this.advanceDialogue(); return; }
      this.advanceDialogue();
    });
    this.$('dialogue-choices').addEventListener('click', (e) => {
      const btn = e.target.closest('[data-choice]');
      if (!btn) return;
      e.stopPropagation();
      this.chooseDialogue(btn.dataset.choice);
    });
    window.addEventListener('keydown', (e) => {
      if (this.state === 'dialogue' && ['Space', 'Enter', 'KeyE'].includes(e.code)) {
        e.preventDefault();
        this.advanceDialogue();
      } else if (this.state === 'intro' && ['Space', 'Enter', 'KeyE'].includes(e.code)) {
        e.preventDefault();
        this.nextIntro();
      } else if (this.state === 'menu' && e.code === 'Escape') {
        this.closeMenu();
      } else if (this.state === 'modal' && e.code === 'Escape') {
        this.closeModal();
      }
    });
    this.input.on('camera', (dx, dy) => {
      if (this.state !== 'playing') return;
      this.cameraYaw -= dx * 0.0052;
      this.cameraPitch = clamp(this.cameraPitch + dy * 0.0032, 0.06, 1.02);
    });
    this.input.on('zoom', (delta) => {
      if (this.state !== 'playing') return;
      this.cameraDistance = clamp(this.cameraDistance + delta * 6, 5.2, 14.5);
    });
    this.input.on('action', (action, phase) => this.onAction(action, phase));
    this.input.on('pause', () => {
      if (this.state === 'playing') this.openMenu('character');
      else if (this.state === 'menu') this.closeMenu();
    });
    window.addEventListener('resize', () => this.resize());
    window.addEventListener('orientationchange', () => setTimeout(() => this.resize(), 220));
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && this.state === 'playing') this.saveGame();
    });
  }

  onAction(action, phase) {
    if (this.state !== 'playing') return;
    if (action === 'resonance') {
      if (phase === 'down') this.beginResonance();
      else this.cancelResonance();
      return;
    }
    if (phase !== 'down') return;
    if (action === 'attack') this.player?.tryAttack('light');
    else if (action === 'heavy') this.player?.tryAttack('heavy');
    else if (action === 'dodge') this.player?.tryDodge();
    else if (action === 'interact') this.interact();
    else if (action === 'potion') this.player?.usePotion();
    else if (action === 'companion') this.summonCompanion();
    else if (action === 'menu') this.openMenu('character');
    else if (action === 'map') this.openMenu('map');
    else if (action === 'lock') this.cycleLock();
    else if (action === 'pause') this.openMenu('settings');
  }

  animate(now) {
    requestAnimationFrame((t) => this.animate(t));
    const dt = Math.min(0.05, Math.max(0, (now - this.lastFrame) / 1000));
    this.lastFrame = now;
    this.time += dt;

    if (this.state === 'loading') {
      this.loading = Math.min(1, this.loading + dt * 0.75);
      const bar = this.$('loading-bar');
      if (bar) bar.style.width = `${Math.round(this.loading * 100)}%`;
      const detail = this.$('loading-detail');
      if (detail) {
        detail.textContent = this.loading < 0.35 ? 'Despertando la Gema'
          : this.loading < 0.68 ? 'Tejiendo los caminos de Valdoria'
            : this.loading < 0.92 ? 'Afirmando el Velo' : 'La Espada está lista';
      }
      if (this.loading >= 1) {
        this.state = 'title';
        this.showScreen('title-screen');
        this.setBodyState();
      }
    }

    if (this.state === 'title') {
      this.updateTitle(dt);
      this.renderer.render(this.title.scene, this.titleCamera);
    } else if (this.state === 'creator') {
      this.updatePreview(dt);
      this.renderer.render(this.title.scene, this.titleCamera);
    } else if (this.player) {
      this.updateGame(dt, this.state === 'playing');
      this.renderer.render(this.scene, this.camera);
    } else {
      this.renderer.render(this.title.scene, this.titleCamera);
    }
  }

  updateTitle(dt) {
    const t = this.time;
    const title = this.title;
    title.sword.rotation.y = -0.42 + Math.sin(t * 0.16) * 0.16;
    title.sword.rotation.z = -0.1 + Math.sin(t * 0.22) * 0.018;
    title.sword.position.y = 5.4 + Math.sin(t * 0.55) * 0.14;
    if (title.sword.userData.halo) title.sword.userData.halo.rotation.z += dt * 0.09;
    if (title.sword.userData.halo2) title.sword.userData.halo2.rotation.z -= dt * 0.14;
    if (title.sword.userData.gem) title.sword.userData.gem.rotation.y += dt * 0.7;
    for (const rock of title.rocks.children) {
      rock.rotation.y += dt * rock.userData.spin;
      rock.position.y = rock.userData.baseY + Math.sin(t * 0.7 + rock.userData.phase) * 0.18;
    }
    for (const mote of title.motes.children) {
      mote.position.y = mote.userData.baseY + Math.sin(t * mote.userData.speed + mote.userData.phase) * 0.6;
    }
    title.stars.rotation.y += dt * 0.004;
    const orbit = Math.sin(t * 0.09) * 0.6;
    this.titleCamera.position.set(-1.4 + orbit, 6.4 + Math.sin(t * 0.17) * 0.18, 15.5 + Math.cos(t * 0.09) * 0.3);
    this.titleCamera.lookAt(2.6, 5.4, 0);
    title.rim.intensity = 2.2 + Math.sin(t * 0.8) * 0.25;
  }

  updatePreview(dt) {
    if (!this.previewHero) return;
    this.previewHero.rotation.y += dt * 0.32;
    poseHero(this.previewHero, { speed: 0 }, dt, this.time);
    if (this.previewDisc) this.previewDisc.rotation.z += dt * 0.25;
    this.previewRenderer.render(this.previewScene, this.previewCamera);
  }

  openCreator() {
    this.ensureAudio();
    this.audio.ui();
    this.state = 'creator';
    this.setBodyState();
    this.showScreen('creator-screen');
    this.buildCreatorUI();
    this.refreshCreator();
    setTimeout(() => this.resize(), 60);
  }

  buildCreatorUI() {
    const originList = this.$('origin-list');
    originList.innerHTML = ORIGINS.map((o) => `
      <button class="origin-card" data-origin="${o.id}">
        <span class="origin-glyph">${o.glyph}</span>
        <b>${o.name}</b>
        <small>${o.desc}</small>
      </button>`).join('');

    this.$('hair-style-list').innerHTML = HAIR_STYLES.map((h) => `<button class="chip" data-hair="${h.id}">${h.name}</button>`).join('');
    this.$('hair-color-list').innerHTML = HAIR_COLORS.map((c) => `<button class="swatch" data-hair-color="${c.id}" style="background:${c.hex}" title="${c.name}" aria-label="${c.name}"></button>`).join('');
    this.$('skin-color-list').innerHTML = SKIN_COLORS.map((c) => `<button class="swatch" data-skin="${c.id}" style="background:${c.hex}" title="${c.name}" aria-label="${c.name}"></button>`).join('');
    this.$('outfit-list').innerHTML = OUTFITS.map((o) => `<button class="chip" data-outfit="${o.id}">${o.name}</button>`).join('');
    this.$('attribute-list').innerHTML = ATTRIBUTES.map((a) => `
      <div class="attr-row" data-attr-row="${a.id}">
        <span class="attr-name">${a.name}<small>${a.effect}</small></span>
        <button class="attr-btn" data-attr="${a.id}" data-delta="-1" aria-label="Quitar ${a.name}">−</button>
        <span class="attr-value" data-attr-value="${a.id}">0</span>
        <button class="attr-btn" data-attr="${a.id}" data-delta="1" aria-label="Añadir ${a.name}">+</button>
      </div>`).join('');

    if (!this.creatorBound) {
      this.creatorBound = true;
      originList.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-origin]');
        if (!btn) return;
        this.creator.origin = ORIGINS.find((o) => o.id === btn.dataset.origin) || ORIGINS[0];
        this.audio.ui();
        this.refreshCreator();
      });
      this.$('hair-style-list').addEventListener('click', (e) => {
        const btn = e.target.closest('[data-hair]');
        if (!btn) return;
        this.creator.hairStyle = btn.dataset.hair;
        this.audio.ui();
        this.refreshCreator();
      });
      this.$('hair-color-list').addEventListener('click', (e) => {
        const btn = e.target.closest('[data-hair-color]');
        if (!btn) return;
        const c = HAIR_COLORS.find((x) => x.id === btn.dataset.hairColor);
        if (!c) return;
        this.creator.hairColorId = c.id;
        this.creator.hairColor = c.hex;
        this.audio.ui();
        this.refreshCreator();
      });
      this.$('skin-color-list').addEventListener('click', (e) => {
        const btn = e.target.closest('[data-skin]');
        if (!btn) return;
        const c = SKIN_COLORS.find((x) => x.id === btn.dataset.skin);
        if (!c) return;
        this.creator.skinId = c.id;
        this.creator.skin = c.hex;
        this.audio.ui();
        this.refreshCreator();
      });
      this.$('outfit-list').addEventListener('click', (e) => {
        const btn = e.target.closest('[data-outfit]');
        if (!btn) return;
        this.creator.outfit = OUTFITS.find((o) => o.id === btn.dataset.outfit) || OUTFITS[0];
        this.creator.outfitId = this.creator.outfit.id;
        this.audio.ui();
        this.refreshCreator();
      });
      this.$('attribute-list').addEventListener('click', (e) => {
        const btn = e.target.closest('[data-attr]');
        if (!btn) return;
        const id = btn.dataset.attr;
        const delta = Number(btn.dataset.delta);
        const current = this.creator.allocated[id] || 0;
        if (delta > 0 && this.creator.points <= 0) return;
        if (delta < 0 && current <= 0) return;
        this.creator.allocated[id] = current + delta;
        this.creator.points -= delta;
        this.audio.ui();
        this.refreshCreator();
      });
      this.$('hero-name').addEventListener('input', () => {
        this.creator.name = this.$('hero-name').value;
        this.$('preview-name').textContent = this.creator.name.trim() || 'Aster';
      });
    }
  }

  creatorAttributes() {
    const a = { ...BASE_ATTRIBUTES };
    for (const [k, v] of Object.entries(this.creator.origin.base || {})) a[k] = (a[k] || 0) + v;
    for (const [k, v] of Object.entries(this.creator.allocated || {})) a[k] = (a[k] || 0) + v;
    return a;
  }

  refreshCreator() {
    const c = this.creator;
    this.$('origin-list').querySelectorAll('[data-origin]').forEach((b) => b.classList.toggle('is-selected', b.dataset.origin === c.origin.id));
    this.$('hair-style-list').querySelectorAll('[data-hair]').forEach((b) => b.classList.toggle('is-selected', b.dataset.hair === c.hairStyle));
    this.$('hair-color-list').querySelectorAll('[data-hair-color]').forEach((b) => b.classList.toggle('is-selected', b.dataset.hairColor === c.hairColorId));
    this.$('skin-color-list').querySelectorAll('[data-skin]').forEach((b) => b.classList.toggle('is-selected', b.dataset.skin === c.skinId));
    this.$('outfit-list').querySelectorAll('[data-outfit]').forEach((b) => b.classList.toggle('is-selected', b.dataset.outfit === c.outfit.id));

    const attrs = this.creatorAttributes();
    for (const a of ATTRIBUTES) {
      const val = this.$('attribute-list').querySelector(`[data-attr-value="${a.id}"]`);
      if (val) val.textContent = attrs[a.id];
      this.$('attribute-list').querySelectorAll(`[data-attr="${a.id}"]`).forEach((btn) => {
        btn.disabled = Number(btn.dataset.delta) > 0 ? c.points <= 0 : (c.allocated[a.id] || 0) <= 0;
      });
    }
    this.$('points-left').textContent = `${c.points} ${c.points === 1 ? 'punto libre' : 'puntos libres'}`;
    this.$('preview-origin').textContent = c.origin.name;
    this.$('preview-name').textContent = (this.$('hero-name').value || c.name).trim() || 'Aster';
    this.$('preview-level').textContent = 'Nv. 1';

    const maxHp = Math.round(82 + attrs.vit * 14 + 7);
    const maxMana = Math.round(30 + attrs.mana * 6 + 2);
    const maxStamina = Math.round(48 + attrs.res * 7 + 1.5);
    const damage = Math.round((7 + attrs.str * 2.1 + 1.45) * 10) / 10;
    const defense = Math.round((2 + attrs.def * 1.55 + 0.5) * 10) / 10;
    const speed = Math.round((4.2 + attrs.spd * 0.13) * 10) / 10;
    const crit = Math.round((4.5 + attrs.luck * 0.9) * 10) / 10;
    const resonance = Math.round(clamp(0.35 + attrs.int * 0.028 + attrs.luck * 0.007, 0.1, 1.5) * 100);
    this.$('derived-stats').innerHTML = [
      ['PV', maxHp], ['Maná', maxMana], ['Daño', damage], ['Defensa', defense],
      ['Aguante', maxStamina], ['Velocidad', speed], ['Crítico', `${crit}%`], ['Resonancia', `${resonance}%`],
    ].map(([label, value]) => `<div class="derived-stat"><small>${label}</small><b>${value}</b></div>`).join('');
    this.$('preview-perk').innerHTML = c.origin.perk;

    if (this.previewHero) {
      this.previewScene.remove(this.previewHero);
      this.previewHero = null;
    }
    const hero = createHero({
      skin: c.skin,
      hairColor: c.hairColor,
      hairStyle: c.hairStyle,
      outfit: c.outfit,
      weaponAppearance: ITEMS.filo_alba.appearance,
    });
    hero.position.set(0, 0.02, 0);
    this.previewScene.add(hero);
    this.previewHero = hero;
  }

  forgeHero() {
    this.ensureAudio();
    this.audio.confirm();
    const name = (this.$('hero-name').value || '').trim().slice(0, 18) || 'Aster';
    const c = this.creator;
    this.startNewGame({
      name,
      originId: c.origin.id,
      allocated: { ...c.allocated },
      appearance: {
        skin: c.skin,
        hairColor: c.hairColor,
        hairStyle: c.hairStyle,
        outfitId: c.outfit.id,
      },
    });
    this.startIntro();
  }

  startNewGame(data) {
    this.hideOverlays();
    this.startingAllocated = { ...(data.allocated || {}) };
    this.quests = cloneQuests();
    this.inventory = new Set(['filo_alba', 'tunica_valdoria']);
    this.collection = new Set();
    this.activeCreature = null;
    this.unlockedLore = new Set();
    this.openedChests = new Set();
    this.kills = 0;
    this.captures = 0;
    this.deaths = 0;
    this.playTime = 0;
    this.companionCooldown = 0;
    this.lastCombat = 0;
    this.player = this.createPlayer(data);
    this.scene.add(this.player.mesh);
    this.loadRegion('valdoria', { banner: false, activate: false });
    this.saveGame();
  }

  createPlayer(data) {
    const origin = ORIGINS.find((o) => o.id === data.originId) || ORIGINS[0];
    const outfit = OUTFITS.find((o) => o.id === data.appearance?.outfitId) || OUTFITS[0];
    const player = new Player(this, {
      name: data.name || 'Aster',
      origin,
      allocated: data.allocated || this.startingAllocated || {},
      skin: data.appearance?.skin || SKIN_COLORS[0].hex,
      hairColor: data.appearance?.hairColor || HAIR_COLORS[0].hex,
      hairStyle: data.appearance?.hairStyle || 'short',
      outfit,
    });
    player.allocated = { ...(data.allocated || this.startingAllocated || {}) };
    return player;
  }

  startIntro() {
    this.state = 'intro';
    this.introIndex = 0;
    this.input.setEnabled(false);
    this.setBodyState();
    this.showScreen('intro-screen');
    this.renderIntroSlide();
  }

  renderIntroSlide() {
    const slide = INTRO_SLIDES[this.introIndex] || INTRO_SLIDES[0];
    this.$('intro-kicker').textContent = slide.kicker;
    this.$('intro-title').textContent = slide.title;
    this.$('intro-text').textContent = slide.text;
    this.$('intro-text').classList.toggle('intro-em', !!slide.em);
    this.$('intro-progress').innerHTML = INTRO_SLIDES.map((_, i) => `<i class="${i <= this.introIndex ? 'is-on' : ''}"></i>`).join('');
  }

  nextIntro() {
    this.introIndex++;
    if (this.introIndex >= INTRO_SLIDES.length) this.finishIntro();
    else this.renderIntroSlide();
  }

  finishIntro() {
    this.showScreen(null);
    this.state = 'playing';
    this.input.setEnabled(true);
    this.setBodyState();
    this.updateHud();
    this.showRegionBanner(this.regionId);
    this.showSubtitle('Lira te espera junto al santuario de la aldea. Sigue la luz dorada.', 4.2);
    this.audio.setMood(REGIONS[this.regionId].music);
    this.saveGame();
  }

  loadRegion(regionId, opts = {}) {
    if (!REGIONS[regionId]) return;
    this.clearDynamic();
    if (this.world) {
      this.world.dispose();
      this.world = null;
    }
    this.regionId = regionId;
    if (!this.quests[regionId]) this.quests[regionId] = cloneQuests()[regionId];
    const q = this.quests[regionId];
    this.world = buildWorld(this.scene, regionId, q, this.quality);
    const spawn = this.world.spawn;
    this.player.placeAt(spawn.x, spawn.z);
    this.player.mesh.visible = true;
    this.player.facing = Math.PI;
    this.player.mesh.rotation.y = Math.PI;
    this.cameraYaw = Math.PI;
    this.cameraPitch = 0.35;
    this.cameraDistance = 9.2;
    this.snapCamera();
    this.spawnRegionEnemies();
    this.spawnRegionCreatures();
    this.applyQuestState();
    this.audio.setMood(REGIONS[regionId].music);
    this.$('region-name').textContent = REGIONS[regionId].name;
    this.$('region-subtitle').textContent = REGIONS[regionId].subtitle;
    this.$('clock-text').textContent = regionId === 'drakmore' ? 'Hora de Brasa' : regionId === 'kansordore' ? 'Hora del Velo' : 'Hora del Alba';
    this.$('clock-icon').textContent = regionId === 'drakmore' ? '✹' : regionId === 'kansordore' ? '◉' : '☀';
    this.updateQuestHud();
    this.updateHud();
    this.hidePrompt();
    if (opts.banner) this.showRegionBanner(regionId);
    if (opts.activate !== false) {
      this.state = 'playing';
      this.input.setEnabled(true);
      this.setBodyState();
    }
    if (opts.autosave) this.saveGame();
  }

  clearDynamic() {
    this.cancelResonance();
    for (const enemy of this.enemies) {
      if (enemy.telegraph) {
        this.scene.remove(enemy.telegraph.mesh);
        enemy.telegraph.mesh.geometry.dispose();
        enemy.telegraph.mesh.material.dispose();
      }
      if (enemy.mesh?.parent) this.scene.remove(enemy.mesh);
    }
    this.enemies = [];
    for (const c of this.creaturesAlive) {
      if (c.mesh?.parent) this.scene.remove(c.mesh);
      if (c.ring?.parent) this.scene.remove(c.ring);
    }
    this.creaturesAlive = [];
    if (this.companion?.mesh?.parent) this.scene.remove(this.companion.mesh);
    this.companion = null;
    for (const p of this.projectiles) p.destroy?.();
    this.projectiles = [];
    this.vfx?.clear();
    this.boss = null;
    this.lockedEnemy = null;
    this.promptCreature = null;
    this.promptInteractable = null;
  }

  spawnRegionEnemies() {
    const layout = ENEMY_LAYOUT[this.regionId] || [];
    const chapter = CHAPTER[this.regionId] || 0;
    const names = {
      corrupt: this.regionId === 'drakmore' ? 'Cenizo Errante' : this.regionId === 'kansordore' ? 'Eco Equivocado' : 'Corrupto de la Aurora',
      wraith: this.regionId === 'drakmore' ? 'Espectro de Brasa' : this.regionId === 'kansordore' ? 'Velo Errante' : 'Espectro del Velo',
      golem: this.regionId === 'drakmore' ? 'Gólem de Escoria' : this.regionId === 'kansordore' ? 'Guardián de Cristal' : 'Gólem de Raíz',
    };
    for (const [x, z, type, elite] of layout) {
      const enemy = new Enemy({
        type: type === 'corrupt' ? 'humanoid' : type,
        region: this.regionId,
        x,
        z,
        y: this.world.heightAt(x, z),
        elite: !!elite,
        chapter,
        name: elite ? `Élite · ${names[type]}` : names[type],
      });
      this.scene.add(enemy.mesh);
      this.enemies.push(enemy);
    }
  }

  spawnRegionCreatures() {
    const primordialIds = this.world.creatureSpawns.filter((s) => s.primordial).map((s) => s.id);
    const doneSeals = this.quests[this.regionId].primordialSeals || [];
    for (const spawn of this.world.creatureSpawns) {
      const data = CREATURES[spawn.id];
      if (!data || this.collection.has(spawn.id)) continue;
      const sealIndex = spawn.primordial ? primordialIds.indexOf(spawn.id) : -1;
      if (spawn.primordial && doneSeals.includes(sealIndex)) continue;
      const mesh = createCreature(spawn.id, 1.12);
      const y = this.world.heightAt(spawn.x, spawn.z);
      mesh.position.set(spawn.x, y + 0.08, spawn.z);
      mesh.rotation.y = Math.random() * Math.PI * 2;
      this.scene.add(mesh);
      const ring = new THREE.Mesh(
        new THREE.RingGeometry(0.62, 0.76, 36),
        new THREE.MeshBasicMaterial({ color: data.color, transparent: true, opacity: 0.34, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false })
      );
      ring.rotation.x = -Math.PI / 2;
      ring.position.set(spawn.x, y + 0.06, spawn.z);
      this.scene.add(ring);
      this.creaturesAlive.push({
        id: spawn.id,
        x: spawn.x,
        z: spawn.z,
        y,
        mesh,
        ring,
        primordial: !!spawn.primordial,
        sealIndex,
        captured: false,
        phase: Math.random() * Math.PI * 2,
        baseY: y,
      });
    }
  }

  applyQuestState() {
    const q = this.quests[this.regionId];
    for (const i of q.cleansedRifts || []) {
      this.world.setRiftCleansed(i);
      const it = this.world.interactables.find((o) => o.id === `rift-${i}`);
      if (it) { it.disabled = true; it.marker.visible = false; }
    }
    for (const i of q.brokenSeals || []) {
      this.world.setSealBroken(i);
      const it = this.world.interactables.find((o) => o.id === `seal-${i}`);
      if (it) { it.disabled = true; it.marker.visible = false; }
    }
    for (const i of q.primordialSeals || []) {
      this.world.setSealBroken(i);
      const it = this.world.interactables.find((o) => o.id === `primordial-${i}`);
      if (it) { it.disabled = true; it.marker.visible = false; }
    }
    if (q.stage >= 4) {
      this.world.openPortal();
      const portal = this.world.interactables.find((o) => o.type === 'portal');
      if (portal) { portal.disabled = false; portal.marker.visible = true; }
    }
    const altar = this.world.interactables.find((o) => o.type === 'altar');
    if (altar && q.stage < 3) altar.marker.material.opacity = 0.28;
  }

  snapCamera() {
    if (!this.player || !this.world) return;
    const p = this.player.position;
    const horiz = Math.cos(this.cameraPitch) * this.cameraDistance;
    this.cameraPos.set(
      p.x - Math.sin(this.cameraYaw) * horiz,
      p.y + 1.9 + Math.sin(this.cameraPitch) * this.cameraDistance,
      p.z - Math.cos(this.cameraYaw) * horiz
    );
    this.camera.position.copy(this.cameraPos);
    this.camera.lookAt(p.x, p.y + 1.35, p.z);
  }

  ensureAudio() {
    if (this.audio.started) return;
    this.audio.init().then(() => {
      this.audio.setVolume('music', this.settings.music);
      this.audio.setVolume('sfx', this.settings.sfx);
    }).catch(() => {});
  }

  updateContinueButton() {
    const save = this.readSave();
    const btn = this.$('btn-continue');
    const detail = this.$('continue-detail');
    if (!save) {
      btn.disabled = true;
      detail.textContent = 'No hay una partida guardada';
      return;
    }
    btn.disabled = false;
    const region = REGIONS[save.region]?.name || 'VALDORIA';
    detail.textContent = `${save.name || 'Aster'} · Nv. ${save.level || 1} · ${region} · ${formatTime(save.playTime || 0)}`;
  }

  readSave() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return null;
      const data = JSON.parse(raw);
      if (!data || typeof data !== 'object') return null;
      return data;
    } catch (err) {
      return null;
    }
  }

  continueGame() {
    this.ensureAudio();
    this.audio.confirm();
    const save = this.readSave();
    if (!save) {
      this.toast('No hay partida', 'Forja un nuevo portador para empezar.', 'danger');
      return;
    }
    this.quests = mergeQuests(save.quests);
    this.inventory = new Set(Array.isArray(save.inventory) ? save.inventory : ['filo_alba', 'tunica_valdoria']);
    this.collection = new Set(Array.isArray(save.collection) ? save.collection : []);
    this.activeCreature = save.activeCreature && this.collection.has(save.activeCreature) ? save.activeCreature : null;
    this.unlockedLore = new Set(Array.isArray(save.lore) ? save.lore : []);
    this.openedChests = new Set(Array.isArray(save.chests) ? save.chests : []);
    this.kills = save.kills || 0;
    this.captures = save.captures || 0;
    this.deaths = save.deaths || 0;
    this.playTime = save.playTime || 0;
    this.companionCooldown = 0;
    this.player = this.createPlayer(save);
    this.restorePlayer(save);
    this.scene.add(this.player.mesh);
    this.hideOverlays();
    this.showScreen(null);
    this.state = 'playing';
    this.loadRegion(REGIONS[save.region] ? save.region : 'valdoria', { banner: true, activate: true });
    this.input.setEnabled(true);
    this.setBodyState();
    this.applyCreatureBuffs();
    this.audio.confirm();
    this.toast('Partida cargada', `${save.name || 'Aster'} vuelve al Velo.`, 'quest');
    this.saveGame();
  }

  restorePlayer(save) {
    const p = this.player;
    p.level = Math.max(1, save.level || 1);
    p.xp = Math.max(0, save.xp || 0);
    p.nextXp = Math.round(70 + p.level * 48);
    p.gold = Math.max(0, save.gold || 0);
    p.potions = Math.max(0, save.potions ?? 3);
    if (save.equipment) {
      for (const slot of ['weapon', 'armor', 'charm']) {
        const item = ITEMS[save.equipment[slot]];
        if (item) p.equipment[slot] = item;
      }
    }
    p.recomputeStats();
    if (p.equipment.weapon) updateHeroAppearance(p.mesh, { weaponAppearance: p.equipment.weapon.appearance });
    if (p.equipment.armor?.appearance?.outfit) {
      const outfit = OUTFITS.find((o) => o.id === p.equipment.armor.appearance.outfit);
      if (outfit) {
        p.appearance.outfit = outfit;
        updateHeroAppearance(p.mesh, { outfit });
      }
    }
    p.hp = p.maxHp;
    p.mana = p.maxMana;
    p.stamina = p.maxStamina;
  }

  saveGame(showIndicator = false) {
    if (!this.player || !this.regionId) return;
    const p = this.player;
    const data = {
      version: 1,
      savedAt: Date.now(),
      playTime: this.playTime,
      name: p.name,
      originId: p.origin?.id,
      allocated: { ...(p.allocated || {}) },
      appearance: {
        skin: p.appearance.skin,
        hairColor: p.appearance.hairColor,
        hairStyle: p.appearance.hairStyle,
        outfitId: p.appearance.outfit?.id,
      },
      region: this.regionId,
      level: p.level,
      xp: p.xp,
      gold: p.gold,
      potions: p.potions,
      equipment: {
        weapon: p.equipment.weapon?.id || null,
        armor: p.equipment.armor?.id || null,
        charm: p.equipment.charm?.id || null,
      },
      quests: this.quests,
      inventory: [...this.inventory],
      collection: [...this.collection],
      activeCreature: this.activeCreature,
      lore: [...this.unlockedLore],
      chests: [...this.openedChests],
      kills: this.kills,
      captures: this.captures,
      deaths: this.deaths,
      completed: !!this.quests.kansordore?.completed,
    };
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(data));
      this.updateContinueButton();
      if (showIndicator) {
        const el = this.$('save-indicator');
        el.classList.add('is-visible');
        clearTimeout(this.saveTimer);
        this.saveTimer = setTimeout(() => el.classList.remove('is-visible'), 1100);
      }
    } catch (err) { /* storage unavailable */ }
  }

  returnToTitle() {
    if (this.player) this.saveGame();
    this.clearDynamic();
    if (this.world) {
      this.world.dispose();
      this.world = null;
    }
    if (this.player?.mesh?.parent) this.scene.remove(this.player.mesh);
    this.player = null;
    this.regionId = null;
    this.state = 'title';
    this.input.setEnabled(false);
    this.setBodyState();
    this.hideOverlays();
    this.showScreen('title-screen');
    this.updateContinueButton();
    this.audio.setMood('title');
    this.resize();
  }

  updateGame(dt, active) {
    if (!this.world || !this.player) return;
    this.world.update(dt, this.time);
    this.vfx.update(dt, this);

    for (const creature of this.creaturesAlive) {
      animateCreature(creature.mesh, this.time + creature.phase, true);
      creature.mesh.position.y = creature.baseY + 0.08 + Math.sin(this.time * 1.7 + creature.phase) * 0.09;
      creature.mesh.rotation.y += dt * 0.22;
      creature.ring.material.opacity = 0.22 + Math.sin(this.time * 2 + creature.phase) * 0.12;
      creature.ring.rotation.z += dt * 0.16;
    }

    if (active) {
      this.playTime += dt;
      this.player.update(dt);
      const snapshot = this.enemies.slice();
      for (const enemy of snapshot) {
        if (!enemy.mesh.parent) continue;
        enemy.update(dt, this);
      }
      for (const p of this.projectiles) p.update(dt, this);
      this.projectiles = this.projectiles.filter((p) => !p.dead);
      this.updateCompanion(dt);
      this.updateResonance(dt);
      this.checkBossTrigger();
      this.updatePrompt();
      this.updateCombatMood();
      this.companionCooldown = Math.max(0, this.companionCooldown - dt);
      this.autosaveTimer += dt;
      if (this.autosaveTimer > 30) {
        this.autosaveTimer = 0;
        this.saveGame();
      }
      this.enemies = this.enemies.filter((e) => e.alive || e.mesh.parent || e === this.boss);
    } else {
      poseHero(this.player.mesh, { speed: 0 }, dt, this.time);
      if (this.state === 'dead') {
        this.player.update(dt);
      }
      for (const creature of this.creaturesAlive) {
        // creatures keep breathing while the world is paused
      }
    }

    this.updateCamera(dt, active);
    this.trauma = Math.max(0, this.trauma - dt * 1.8);
    this.hudTimer += dt;
    if (this.hudTimer > 0.08) {
      this.hudTimer = 0;
      this.updateHud();
      this.updateTargetUi();
    }
    this.minimapTimer += dt;
    if (this.minimapTimer > 0.14) {
      this.minimapTimer = 0;
      this.drawMinimap();
    }
  }

  updateCamera(dt, active) {
    const p = this.player.position;
    if (this.lockedEnemy && this.lockedEnemy.alive && this.lockedEnemy.mesh.parent) {
      const dx = this.lockedEnemy.mesh.position.x - p.x;
      const dz = this.lockedEnemy.mesh.position.z - p.z;
      const want = Math.atan2(dx, dz);
      this.cameraYaw = dampAngle(this.cameraYaw, want, 2.2, dt);
    }
    const horiz = Math.cos(this.cameraPitch) * this.cameraDistance;
    const desired = new THREE.Vector3(
      p.x - Math.sin(this.cameraYaw) * horiz,
      p.y + 1.9 + Math.sin(this.cameraPitch) * this.cameraDistance,
      p.z - Math.cos(this.cameraYaw) * horiz
    );
    const ground = this.world.heightAt(desired.x, desired.z) + 0.9;
    if (desired.y < ground) desired.y = ground;
    const lambda = active ? 9 : 4;
    this.cameraPos.x = damp(this.cameraPos.x, desired.x, lambda, dt);
    this.cameraPos.y = damp(this.cameraPos.y, desired.y, lambda, dt);
    this.cameraPos.z = damp(this.cameraPos.z, desired.z, lambda, dt);
    this.cameraTarget.set(p.x, p.y + 1.35, p.z);
    this.camera.position.copy(this.cameraPos);
    const shake = this.trauma * this.trauma;
    if (shake > 0.001 && this.settings.shake) {
      this.camera.position.x += (Math.random() - 0.5) * shake * 0.55;
      this.camera.position.y += (Math.random() - 0.5) * shake * 0.42;
      this.camera.position.z += (Math.random() - 0.5) * shake * 0.55;
    }
    this.camera.lookAt(this.cameraTarget);
  }

  updateHud() {
    if (!this.player) return;
    const p = this.player;
    const hpRatio = clamp(p.hp / p.maxHp, 0, 1);
    const stRatio = clamp(p.stamina / p.maxStamina, 0, 1);
    const manaRatio = clamp(p.mana / p.maxMana, 0, 1);
    this.$('hp-fill').style.width = `${hpRatio * 100}%`;
    this.$('hp-text').textContent = `${Math.ceil(p.hp)} / ${p.maxHp}`;
    this.$('stamina-fill').style.width = `${stRatio * 100}%`;
    this.$('mana-fill').style.width = `${manaRatio * 100}%`;
    this.$('xp-fill').style.width = `${clamp(p.xp / p.nextXp, 0, 1) * 100}%`;
    this.$('hud-level').textContent = p.level;
    this.$('hud-name').textContent = p.name;
    this.$('hud-origin').textContent = p.origin?.short || 'Portador';
    this.$('hud-portrait').innerHTML = svgPortrait({
      skin: p.appearance.skin,
      hair: p.appearance.hairColor,
      outfit: p.appearance.outfit?.primary,
      trim: p.appearance.outfit?.trim,
      eyes: '#a9ece8',
      rune: p.level > 4,
    });
    this.$('potion-count').textContent = `×${p.potions} · Pulsa H`;
    const c = this.activeCreature ? CREATURES[this.activeCreature] : null;
    const card = this.$('companion-card');
    card.classList.toggle('is-empty', !c);
    this.$('companion-orb').textContent = c ? c.glyph : '◇';
    this.$('companion-name').textContent = c ? c.name : 'Sin criatura';
    this.$('companion-detail').textContent = c ? c.passive.split(':')[0] : 'Resuena con un eco salvaje';
    const cd = clamp(1 - this.companionCooldown / 30, 0, 1);
    this.$('companion-cooldown').style.width = `${cd * 100}%`;
    this.$('menu-gold').textContent = `✦ ${p.gold} esencia`;
    const prompt = this.$('interact-prompt');
    if (prompt && prompt.classList.contains('is-visible')) {
      const kbd = prompt.querySelector('kbd');
      if (kbd && this.promptCreature) kbd.textContent = 'Q';
      else if (kbd) kbd.textContent = 'E';
    }
  }

  updateQuestHud() {
    const region = REGIONS[this.regionId];
    if (!region) return;
    const q = this.quests[this.regionId];
    const steps = region.quest.steps;
    const index = clamp(q.stage, 0, steps.length - 1);
    const step = steps[index];
    this.$('quest-title').textContent = region.quest.title;
    this.$('quest-objective').textContent = step.objective;
    this.$('quest-fill').style.width = `${clamp(q.stage / steps.length, 0, 1) * 100}%`;
  }

  updateTargetUi() {
    if (!this.player || !this.world) return;
    const targetWrap = this.$('target-wrap');
    const bossWrap = this.$('boss-wrap');
    if (this.boss && this.boss.alive) {
      bossWrap.classList.add('is-visible');
      targetWrap.classList.remove('is-visible');
      const data = BOSS_DATA[this.regionId];
      this.$('boss-name').textContent = data.name;
      this.$('boss-epithet').textContent = data.epithet;
      this.$('boss-fill').style.width = `${this.boss.hpRatio * 100}%`;
      this.$('boss-phase').style.left = '55%';
      const casting = this.boss.state === 'windup';
      this.$('boss-cast').classList.toggle('is-visible', casting);
      this.$('boss-cast').textContent = casting ? 'PREPARANDO UN GOLPE DE RUPTURA' : '';
      return;
    }
    bossWrap.classList.remove('is-visible');
    const enemy = this.nearestEnemy(17);
    if (!enemy) {
      targetWrap.classList.remove('is-visible');
      return;
    }
    targetWrap.classList.add('is-visible');
    this.$('target-level').textContent = `Nv. ${enemy.level}`;
    this.$('target-name').textContent = enemy.name;
    const element = this.regionId === 'drakmore' ? 'Fuego' : this.regionId === 'kansordore' ? 'Cosmos' : 'Sombra';
    this.$('target-element').textContent = element;
    this.$('target-fill').style.width = `${enemy.hpRatio * 100}%`;
    this.$('target-fill').style.background = `linear-gradient(90deg, ${elementColor(element)}, #df6252)`;
  }

  nearestEnemy(max = Infinity) {
    if (!this.player) return null;
    let best = null;
    let bestD = max;
    for (const enemy of this.enemies) {
      if (!enemy.alive || !enemy.mesh.parent) continue;
      const d = dist2D(enemy.mesh.position, this.player.position);
      if (d < bestD) { bestD = d; best = enemy; }
    }
    return best;
  }

  cycleLock() {
    if (!this.player) return;
    const candidates = this.enemies
      .filter((e) => e.alive && e.mesh.parent && dist2D(e.mesh.position, this.player.position) < 22)
      .sort((a, b) => dist2D(a.mesh.position, this.player.position) - dist2D(b.mesh.position, this.player.position));
    if (!candidates.length) {
      this.lockedEnemy = null;
      this.toast('Sin objetivo', 'No hay enemigos cerca.', 'info');
      return;
    }
    const current = candidates.indexOf(this.lockedEnemy);
    this.lockedEnemy = candidates[(current + 1) % candidates.length];
    this.audio.ui();
    this.toast('Objetivo fijado', this.lockedEnemy.name, 'info');
  }

  findAttackTarget() {
    return this.nearestEnemy(9.5);
  }

  hitEnemiesInArc(position, facing, range, arc, base, heavy) {
    let hits = 0;
    for (const enemy of this.enemies) {
      if (!enemy.alive || !enemy.mesh.parent) continue;
      const dx = enemy.mesh.position.x - position.x;
      const dz = enemy.mesh.position.z - position.z;
      const d = Math.hypot(dx, dz);
      if (d > range + enemy.radius) continue;
      const angle = Math.atan2(dx, dz);
      if (Math.abs(angleDelta(facing, angle)) > arc / 2) continue;
      const crit = Math.random() < this.player.critChance;
      const variance = 0.92 + Math.random() * 0.18;
      const mitigation = clamp(1 - enemy.level * 0.018, 0.68, 1);
      let dmg = base * variance * mitigation * (crit ? 1.85 : 1);
      if (heavy) dmg *= 1.08;
      enemy.takeDamage(dmg, this, crit);
      hits++;
      this.lastCombat = this.time;
      if (this.player.origin?.id === 'vanguard' && crit) {
        this.player.mana = Math.min(this.player.maxMana, this.player.mana + 3);
      }
    }
    return hits;
  }

  damagePlayer(amount, source) {
    if (!this.player || this.player.dead) return;
    this.lastCombat = this.time;
    this.player.takeDamage(amount, source);
  }

  perfectBlock(source) {
    this.toast('Bloqueo perfecto', 'La luz responde. El enemigo queda expuesto.', 'heal');
    this.shake(0.34);
    this.spawnShockwave({ x: this.player.position.x, z: this.player.position.z, radius: 4.2, damage: this.player.damage * 1.1, color: '#fff0b8', delay: 0.05 });
    if (source && source.alive) {
      source.takeDamage(this.player.damage * 1.5, this, true);
      source.stagger = Math.max(source.stagger, 0.55);
      source.state = 'stagger';
    }
  }

  spawnEnemyProjectile(opts) {
    const p = new Projectile(this.scene, {
      ...opts,
      hostile: true,
      owner: opts.owner || null,
    });
    this.projectiles.push(p);
    return p;
  }

  spawnShockwave(opts) {
    const y = this.world ? this.world.heightAt(opts.x, opts.z) : 0;
    this.vfx.shockwave({
      ...opts,
      y,
      onHit: () => {
        if (!this.player || this.player.dead) return;
        const d = Math.hypot(this.player.position.x - opts.x, this.player.position.z - opts.z);
        if (d < opts.radius) this.damagePlayer(opts.damage || 12, null);
        this.shake(0.35);
        this.audio.bossRoar();
      },
    });
  }

  spawnSlashTrail(position, facing, color, scale) {
    this.vfx.slash(position, facing, color, scale);
  }

  spawnHitSparks(position, color, count) {
    this.vfx.hitSparks(position, color, count);
  }

  spawnHealEffect(position) {
    this.vfx.heal(position);
  }

  spawnBlockEffect(position, facing, perfect) {
    this.vfx.block(position, facing, perfect);
  }

  shake(amount) {
    if (!this.settings.shake) return;
    this.trauma = Math.min(1, this.trauma + amount);
  }

  flashDamage() {
    const app = this.$('app');
    app.classList.add('is-hurt');
    clearTimeout(this.hurtTimer);
    this.hurtTimer = setTimeout(() => app.classList.remove('is-hurt'), 240);
  }

  damageNumber(position, amount, crit = false, isPlayer = false) {
    if (!this.settings.damageNumbers || !this.player) return;
    const layer = this.$('damage-layer');
    const el = document.createElement('div');
    el.className = `damage-number${crit ? ' crit' : ''}${isPlayer ? ' player' : ''}`;
    el.textContent = `${isPlayer ? '−' : ''}${Math.round(amount)}`;
    const pos = new THREE.Vector3(position.x, position.y + (isPlayer ? 1.9 : 1.55), position.z);
    const screen = projectToScreen(pos, this.camera, window.innerWidth, window.innerHeight);
    if (!screen.visible) return;
    el.style.left = `${screen.x + (Math.random() - 0.5) * 24}px`;
    el.style.top = `${screen.y + (Math.random() - 0.5) * 10}px`;
    layer.appendChild(el);
    setTimeout(() => el.remove(), 950);
  }

  onEnemyAggro(enemy) {
    this.lastCombat = this.time;
    if (enemy.boss) this.audio.setMood('boss');
    else if (!this.boss) this.audio.setMood('combat');
  }

  onBossPhase(boss) {
    this.toast('Segunda fase', `${boss.name} libera su verdadera forma.`, 'danger');
    this.audio.bossRoar();
    this.shake(0.6);
    this.spawnShockwave({ x: boss.mesh.position.x, z: boss.mesh.position.z, radius: 7, damage: boss.damage * 0.7, color: '#ff6f5e', delay: 0.1 });
    this.$('boss-cast').classList.add('is-visible');
    this.$('boss-cast').textContent = 'EL VELO SE RASGA';
    setTimeout(() => this.$('boss-cast').classList.remove('is-visible'), 2200);
  }

  checkBossTrigger() {
    const q = this.quests[this.regionId];
    if (!q || q.bossDefeated || q.stage < 2) return;
    if (this.boss && this.boss.alive) return;
    const trigger = this.world?.bossTrigger;
    if (!trigger) return;
    if (dist2D(this.player.position, trigger) > trigger.r) return;
    this.spawnBoss();
  }

  spawnBoss() {
    const data = BOSS_DATA[this.regionId];
    if (!data) return;
    const t = this.world.bossTrigger;
    const y = this.world.heightAt(t.x, t.z);
    const boss = new Enemy({
      type: data.type,
      region: this.regionId,
      x: t.x,
      z: t.z,
      y,
      boss: true,
      chapter: CHAPTER[this.regionId] || 0,
      name: data.name,
    });
    boss.bossType = data.epithet;
    this.scene.add(boss.mesh);
    this.enemies.push(boss);
    this.boss = boss;
    this.lockedEnemy = boss;
    this.audio.bossRoar();
    this.audio.setMood('boss');
    this.shake(0.5);
    this.showSubtitle(`${data.name} despierta. ${data.epithet}.`, 3.8);
    this.toast('Guardián despertado', `${data.name} bloquea el camino.`, 'danger');
    this.updateQuestHud();
  }

  onEnemyWeakened(enemy) {
    if (enemy.elite) this.showSubtitle('El élder se tambalea. Un golpe más y su eco se romperá.', 2.2);
  }

  onEnemyKilled(enemy) {
    this.kills++;
    const p = this.player;
    if (!p) return;
    const essence = Math.max(4, Math.round(enemy.xp * 0.35));
    p.gold += essence;
    p.addXp(enemy.xp);
    this.lastCombat = this.time;
    if (this.lockedEnemy === enemy) this.lockedEnemy = null;
    if (enemy.boss) {
      this.handleBossDefeated(enemy);
      return;
    }
    if (enemy.elite) {
      this.addItem('elixir');
      this.addItem(Math.random() < 0.45 ? 'amuleto_lumin' : 'elixir');
      this.toast('Botín de élite', `+${essence} esencia · Elixir de Aurora`, 'quest');
    } else if (Math.random() < 0.22) {
      this.addItem('elixir');
    }
    this.updateHud();
  }

  handleBossDefeated(enemy) {
    const q = this.quests[this.regionId];
    q.bossDefeated = true;
    q.stage = Math.max(q.stage, 3);
    this.boss = null;
    this.lockedEnemy = null;
    this.audio.setMood(REGIONS[this.regionId].music);
    this.shake(0.7);
    this.player.gold += 120 + (CHAPTER[this.regionId] || 0) * 90;
    if (this.regionId === 'drakmore') {
      this.addItem('lagrima_brasa');
      this.toast('Lágrima de la Primera Brasa', 'La llama primigenia late en tu inventario.', 'quest');
    } else if (this.regionId === 'kansordore') {
      this.addItem('filo_convergencia');
      this.addItem('sello_velo');
      this.toast('El Espejo se ha roto', 'Has derrotado a Jugador Cero. La Puerta de la Convergencia te reconoce.', 'quest');
    } else {
      this.addItem('amuleto_lumin');
      this.toast('El Centinela ha caído', 'El Fragmento de la Gema te espera en el altar.', 'quest');
    }
    this.updateQuestHud();
    this.updateHud();
    this.showSubtitle(this.regionId === 'kansordore'
      ? 'El Núcleo de la Convergencia se abre. Toca la luz y decide.'
      : 'El altar despierta. Reclama lo que has ganado y abre el camino.', 4.4);
    this.audio.quest();
    this.saveGame(true);
  }

  onPlayerAttack() {
    this.lastCombat = this.time;
  }

  onLevelUp() {
    const p = this.player;
    this.audio.level();
    this.spawnHealEffect(p.position);
    this.toast('Ascensión', `Nivel ${p.level}. Tus atributos responden a la Espada.`, 'heal');
    this.saveGame(true);
  }

  onPlayerDeath() {
    if (!this.player) return;
    this.deaths++;
    this.state = 'dead';
    this.input.setEnabled(false);
    this.setBodyState();
    this.audio.setMood('title');
    clearTimeout(this.deathTimer);
    this.deathTimer = setTimeout(() => this.showDeathModal(), 1250);
  }

  showDeathModal() {
    if (this.state !== 'dead') return;
    this.$('modal-content').innerHTML = `
      <p class="eyebrow">EL VELO TE RECLAMA</p>
      <h2>Has caído.</h2>
      <p>La ceniza te cubre por un instante. Pero la Espada Celestial no ha terminado de cantar tu nombre. Vuelve al último santuario y sigue adelante.</p>
      <div class="ending-stats">
        <div class="ending-stat"><small>NIVEL</small><b>${this.player.level}</b></div>
        <div class="ending-stat"><small>ESENCIA</small><b>${this.player.gold}</b></div>
        <div class="ending-stat"><small>CAÍDAS</small><b>${this.deaths}</b></div>
      </div>
      <div class="ending-actions">
        <button class="forge-btn" id="death-respawn"><span>VOLVER A LEVANTARSE</span><small>Sin perder tu progreso</small></button>
      </div>`;
    this.$('modal-close').style.display = 'none';
    this.showScreen('modal-screen');
    this.$('death-respawn').addEventListener('click', () => this.respawnPlayer());
  }

  respawnPlayer() {
    this.$('modal-close').style.display = '';
    this.showScreen(null);
    for (const enemy of this.enemies) {
      if (!enemy.alive) continue;
      enemy.state = 'idle';
      enemy.active = false;
      enemy.hp = enemy.maxHp;
      enemy.mesh.position.set(enemy.spawn.x, this.world.heightAt(enemy.spawn.x, enemy.spawn.z), enemy.spawn.z);
      enemy.attackCooldown = 1.5;
    }
    this.player.reviveAtSpawn();
    this.state = 'playing';
    this.input.setEnabled(true);
    this.setBodyState();
    this.audio.setMood(REGIONS[this.regionId].music);
    this.toast('Has vuelto', 'La Espada aún tiene trabajo para ti.', 'heal');
    this.updateHud();
  }

  updateCombatMood() {
    if (this.boss?.alive) return;
    const near = this.nearestEnemy(17);
    if (near) {
      this.lastCombat = this.time;
      this.audio.setMood('combat');
    } else if (this.time - this.lastCombat > 5.5) {
      this.audio.setMood(REGIONS[this.regionId]?.music || 'valdoria');
    }
  }

  showRegionBanner(regionId) {
    const region = REGIONS[regionId];
    if (!region) return;
    this.$('region-banner-kicker').textContent = region.numeral;
    this.$('region-banner-name').textContent = region.name;
    this.$('region-banner-sub').textContent = region.subtitle;
    const banner = this.$('region-banner');
    banner.classList.remove('is-visible');
    void banner.offsetWidth;
    banner.classList.add('is-visible');
  }

  showSubtitle(text, duration = 3) {
    const el = this.$('subtitle');
    el.textContent = text;
    el.classList.add('is-visible');
    clearTimeout(this.subtitleTimer);
    this.subtitleTimer = setTimeout(() => el.classList.remove('is-visible'), duration * 1000);
  }

  toast(title, detail = '', kind = 'info') {
    const layer = this.$('toast-layer');
    if (!layer) return;
    while (layer.children.length >= 4) layer.firstElementChild.remove();
    const el = document.createElement('div');
    el.className = 'toast';
    const label = kind === 'danger' ? 'ALERTA' : kind === 'heal' ? 'LUZ' : kind === 'quest' ? 'PROGRESO' : 'VÍNCULO';
    el.innerHTML = `<span>${label}</span><strong>${title}</strong>${detail ? `<small>${detail}</small>` : ''}`;
    layer.appendChild(el);
    setTimeout(() => {
      el.classList.add('is-out');
      setTimeout(() => el.remove(), 420);
    }, 3400);
  }

  addItem(id) {
    const item = ITEMS[id];
    if (!item) return;
    this.inventory.add(id);
    if (item.type === 'consumable' && id === 'elixir') this.player.potions++;
  }

  drawMinimap() {
    const canvas = this.$('minimap');
    if (!canvas || !this.player || !this.world) return;
    const ctx = canvas.getContext('2d');
    const size = canvas.width;
    const cx = size / 2;
    const cy = size / 2;
    const scale = (size * 0.45) / 88;
    ctx.clearRect(0, 0, size, size);
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, size * 0.49, 0, Math.PI * 2);
    ctx.clip();
    const grad = ctx.createRadialGradient(cx, cy, 4, cx, cy, size * 0.5);
    grad.addColorStop(0, this.regionId === 'drakmore' ? '#5a332b' : this.regionId === 'kansordore' ? '#4b486e' : '#456647');
    grad.addColorStop(1, '#0a0f14');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);
    ctx.strokeStyle = 'rgba(228,191,120,0.14)';
    ctx.lineWidth = 1;
    for (const r of [0.25, 0.5, 0.75]) {
      ctx.beginPath();
      ctx.arc(cx, cy, size * 0.45 * r, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.moveTo(cx, 0); ctx.lineTo(cx, size);
    ctx.moveTo(0, cy); ctx.lineTo(size, cy);
    ctx.stroke();
    const map = (x, z) => [cx + x * scale, cy + z * scale];
    for (const poi of this.world.poi) {
      const [x, y] = map(poi.x, poi.z);
      const done = poi.type === 'done';
      const color = done ? '#9df1e9' : poi.type === 'boss' ? '#e25f55' : poi.type === 'portal' ? '#92e7df' : poi.type === 'npc' ? '#ffe6ab' : '#d9c08a';
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x, y, poi.type === 'boss' ? 3.2 : 2.2, 0, Math.PI * 2);
      ctx.fill();
    }
    for (const enemy of this.enemies) {
      if (!enemy.alive || !enemy.mesh.parent) continue;
      const [x, y] = map(enemy.mesh.position.x, enemy.mesh.position.z);
      ctx.fillStyle = enemy.boss ? '#ff5d4e' : enemy.elite ? '#ffb35c' : '#cf6a5d';
      ctx.beginPath();
      ctx.arc(x, y, enemy.boss ? 4 : enemy.elite ? 2.4 : 1.7, 0, Math.PI * 2);
      ctx.fill();
    }
    for (const creature of this.creaturesAlive) {
      const [x, y] = map(creature.x, creature.z);
      ctx.fillStyle = CREATURES[creature.id]?.color || '#92e7df';
      ctx.beginPath();
      ctx.arc(x, y, 2, 0, Math.PI * 2);
      ctx.fill();
    }
    const [px, py] = map(this.player.position.x, this.player.position.z);
    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(-this.player.facing + Math.PI);
    ctx.fillStyle = '#ffe6ab';
    ctx.beginPath();
    ctx.moveTo(0, -6);
    ctx.lineTo(4.2, 5);
    ctx.lineTo(0, 2.8);
    ctx.lineTo(-4.2, 5);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    ctx.restore();
    ctx.strokeStyle = 'rgba(228,191,120,0.5)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, size * 0.49, 0, Math.PI * 2);
    ctx.stroke();
    let label = REGIONS[this.regionId]?.subtitle || '';
    let best = 34;
    for (const poi of this.world.poi) {
      const d = Math.hypot(poi.x - this.player.position.x, poi.z - this.player.position.z);
      if (d < best) { best = d; label = poi.label; }
    }
    this.$('minimap-label').textContent = label;
  }

  updatePrompt() {
    if (!this.player || this.state !== 'playing') {
      this.hidePrompt();
      return;
    }
    let creature = null;
    let bestC = 3.8;
    for (const c of this.creaturesAlive) {
      if (c.captured) continue;
      const d = Math.hypot(c.x - this.player.position.x, c.z - this.player.position.z);
      if (d < bestC) { bestC = d; creature = c; }
    }
    this.promptCreature = creature;
    if (creature) {
      const data = CREATURES[creature.id];
      this.showPrompt(`Mantén Q para resonar con ${data.name}`, 'Q');
      this.promptInteractable = null;
      return;
    }
    let interactable = null;
    let bestI = Infinity;
    for (const it of this.world.interactables) {
      if (it.disabled) continue;
      const d = Math.hypot(it.x - this.player.position.x, it.z - this.player.position.z);
      if (d < (it.radius || 3) && d < bestI) { bestI = d; interactable = it; }
    }
    this.promptInteractable = interactable;
    if (interactable) this.showPrompt(interactable.label, 'E');
    else this.hidePrompt();
  }

  showPrompt(text, key) {
    const el = this.$('interact-prompt');
    el.classList.add('is-visible');
    el.querySelector('kbd').textContent = key;
    this.$('interact-text').textContent = text;
  }

  hidePrompt() {
    this.$('interact-prompt').classList.remove('is-visible');
    this.promptCreature = null;
    this.promptInteractable = null;
  }

  interact() {
    if (this.state !== 'playing' || !this.player) return;
    if (this.promptCreature) {
      this.toast('Resonancia', `Mantén Q para escuchar a ${CREATURES[this.promptCreature.id].name}.`, 'info');
      return;
    }
    if (this.promptInteractable) {
      this.runInteraction(this.promptInteractable.action, this.promptInteractable);
    }
  }

  runInteraction(action, obj) {
    if (!action) return;
    const [kind, value] = action.split(':');
    if (kind === 'npc') this.talkTo(value);
    else if (kind === 'rift') this.cleanseRift(Number(value));
    else if (kind === 'seal') this.breakSeal(Number(value));
    else if (kind === 'primordial') this.resonateWithSeal(Number(value));
    else if (kind === 'altar') this.useAltar();
    else if (kind === 'portal') this.travelTo(value);
    else if (kind === 'chest') this.openChest(value, obj);
    else if (kind === 'lore') this.readLore(value);
  }

  talkTo(kind) {
    const q = this.quests[this.regionId];
    this.audio.ui();
    if (kind === 'lira') {
      if (q.stage === 0) {
        this.startDialogue(Story.liraIntro(), () => {
          q.stage = 1;
          this.audio.quest();
          this.updateQuestHud();
          this.toast('Misión actualizada', 'Purga los tres focos de corrupción.', 'quest');
          this.saveGame(true);
        });
      } else if (q.stage === 1) {
        this.startDialogue([
          { speaker: 'Lira', role: 'Guardián del Alba', text: `Los focos aún laten. Llevas ${q.cleansedRifts.length} de 3. La luz no se impone: se escucha.` },
        ]);
      } else if (q.stage === 2) {
        this.startDialogue([
          { speaker: 'Lira', role: 'Guardián del Alba', text: 'El Santuario de la Grieta respira al noroeste. El Centinela sabe que vienes. No le des tiempo a terminar de despertar.' },
        ]);
      } else if (q.stage === 3) {
        this.startDialogue(Story.liraAltar());
      } else {
        this.startDialogue([
          { speaker: 'Lira', role: 'Guardián del Alba', text: 'La Puerta de Drakmore arde al norte. Cuando cruces, no olvides que la luz también puede quemar.' },
        ]);
      }
    } else if (kind === 'orin') {
      if (q.stage === 0) {
        this.startDialogue(Story.orinIntro(), () => {
          q.stage = 1;
          this.audio.quest();
          this.updateQuestHud();
          this.toast('Misión actualizada', 'Rompe los dos sellos de la Fortaleza.', 'quest');
          this.saveGame(true);
        });
      } else if (q.stage === 1) {
        this.startDialogue([
          { speaker: 'Orin', role: 'Herrero de la Primera Brasa', text: `Los sellos arden al este y al oeste. Llevas ${q.brokenSeals.length} de 2. La ceniza no perdona a los que dudan.` },
        ]);
      } else if (q.stage === 2) {
        this.startDialogue(Story.orinSealsDone());
      } else if (q.stage === 3) {
        this.startDialogue(Story.orinAltar());
      } else {
        this.startDialogue([
          { speaker: 'Orin', role: 'Herrero de la Primera Brasa', text: 'El portal del sur está abierto. Kansordore te espera. Yo me quedo a cuidar lo que queda de Drakmore.' },
        ]);
      }
    } else if (kind === 'testigo') {
      if (q.stage === 0) {
        this.startDialogue(Story.testigoIntro(), () => {
          q.stage = 1;
          this.audio.quest();
          this.updateQuestHud();
          this.toast('Misión actualizada', 'Resuena con los tres Ecos Primordiales.', 'quest');
          this.saveGame(true);
        });
      } else if (q.stage === 1) {
        this.startDialogue([
          { speaker: 'El Testigo', role: 'Voz del Velo', text: `Los Ecos sostienen la puerta. Has escuchado ${q.primordialSeals.length} de 3. Acércate a ellos y mantén la resonancia.` },
        ]);
      } else if (q.stage === 2) {
        this.startDialogue(Story.testigoSealsDone());
      } else if (q.stage === 3) {
        this.startDialogue([
          { speaker: 'El Testigo', role: 'Voz del Velo', text: 'El Núcleo está abierto. Jugador Cero ha caído. Lo que decidas ahora no lo escribirá ninguna profecía.' },
        ]);
      } else {
        this.startDialogue([
          { speaker: 'El Testigo', role: 'Voz del Velo', text: 'El Velo recuerda tu nombre. Eso es más de lo que la mayoría consigue.' },
        ]);
      }
    }
  }

  startDialogue(data, onComplete) {
    if (this.dialogue) return;
    const lines = Array.isArray(data) ? data : data?.lines;
    if (!lines || !lines.length) { onComplete?.(); return; }
    this.dialogue = {
      lines: lines.map((l) => ({ ...l })),
      index: 0,
      onComplete,
      typing: true,
      timer: null,
    };
    this.state = 'dialogue';
    this.input.setEnabled(false);
    this.setBodyState();
    this.showScreen('dialogue-screen');
    this.hidePrompt();
    this.cancelResonance();
    this.renderDialogueLine();
  }

  renderDialogueLine() {
    const d = this.dialogue;
    if (!d) return;
    const line = d.lines[d.index];
    if (!line) { this.endDialogue(); return; }
    const speaker = line.player ? 'hero' : line.speaker;
    let portrait = 'hero';
    if (/Lira/i.test(speaker)) portrait = 'lira';
    else if (/Orin/i.test(speaker)) portrait = 'orin';
    else if (/Testigo|Espada/i.test(speaker)) portrait = 'testigo';
    else if (/Centinela|Kael|Jugador Cero/i.test(speaker)) portrait = 'cero';
    this.$('dialogue-portrait').innerHTML = portraitFor(portrait, this.player?.appearance);
    this.$('dialogue-name').textContent = line.speaker || 'Tú';
    this.$('dialogue-role').textContent = line.role || 'Portador del Alba';
    this.$('dialogue-text').textContent = '';
    this.$('dialogue-choices').innerHTML = '';
    this.$('dialogue-next').classList.remove('is-visible');
    d.typing = true;
    let char = 0;
    const full = line.text || '';
    clearInterval(d.timer);
    d.timer = setInterval(() => {
      if (!this.dialogue || this.dialogue !== d) { clearInterval(d.timer); return; }
      char += 1;
      this.$('dialogue-text').textContent = full.slice(0, char);
      if (char % 4 === 0) this.audio.ui();
      if (char >= full.length) {
        clearInterval(d.timer);
        d.typing = false;
        this.finishDialogueLine();
      }
    }, 18);
  }

  finishDialogueLine() {
    const d = this.dialogue;
    if (!d) return;
    const line = d.lines[d.index];
    if (!line) { this.endDialogue(); return; }
    this.$('dialogue-text').textContent = line.text || '';
    d.typing = false;
    clearInterval(d.timer);
    if (line.choices?.length) {
      this.$('dialogue-choices').innerHTML = line.choices.map((c) =>
        `<button class="dialogue-choice" data-choice="${c.action}">${c.label}</button>`).join('');
      this.$('dialogue-next').classList.remove('is-visible');
    } else {
      this.$('dialogue-next').classList.add('is-visible');
    }
  }

  advanceDialogue() {
    const d = this.dialogue;
    if (!d) return;
    if (d.typing) { this.finishDialogueLine(); return; }
    const line = d.lines[d.index];
    if (line?.choices?.length) return;
    d.index++;
    if (d.index >= d.lines.length) this.endDialogue();
    else this.renderDialogueLine();
  }

  chooseDialogue(action) {
    const d = this.dialogue;
    if (!d) return;
    this.audio.confirm();
    const line = d.lines[d.index];
    if (line) line.choices = null;
    if (action === 'lira-velo') {
      d.lines.splice(d.index + 1, 0, ...Story.liraVelo());
    }
    this.advanceDialogue();
  }

  endDialogue() {
    const d = this.dialogue;
    if (!d) return;
    clearInterval(d.timer);
    this.dialogue = null;
    this.showScreen(null);
    this.state = 'playing';
    this.input.setEnabled(true);
    this.setBodyState();
    this.audio.ui();
    d.onComplete?.();
  }

  cleanseRift(index) {
    const q = this.quests[this.regionId];
    if (q.stage < 1) {
      this.toast('El foco duerme', 'Habla con Lira antes de tocar la corrupción.', 'info');
      return;
    }
    if (q.cleansedRifts.includes(index)) return;
    q.cleansedRifts.push(index);
    this.world.setRiftCleansed(index);
    const it = this.world.interactables.find((o) => o.id === `rift-${index}`);
    if (it) { it.disabled = true; it.marker.visible = false; }
    const position = { x: it?.x || this.player.position.x, y: this.player.position.y, z: it?.z || this.player.position.z };
    this.vfx.capture(position, '#9df1e9');
    this.vfx.beam(this.player.position, position, '#9df1e9');
    this.player.addXp(34);
    this.player.gold += 12;
    this.audio.quest();
    this.toast('Foco purgado', `${q.cleansedRifts.length} de 3 focos de corrupción.`, 'quest');
    this.updateQuestHud();
    if (q.cleansedRifts.length >= 3 && q.stage === 1) {
      q.stage = 2;
      this.updateQuestHud();
      this.saveGame(true);
      setTimeout(() => {
        if (this.state === 'playing') {
          this.startDialogue(Story.liraRiftsDone(), () => {
            this.toast('El Santuario despierta', 'El Centinela de Ceniza te espera al noroeste.', 'quest');
          });
        }
      }, 520);
    } else {
      this.saveGame(true);
    }
  }

  breakSeal(index) {
    const q = this.quests[this.regionId];
    if (q.stage < 1) {
      this.toast('El sello resiste', 'Necesitas la guía del guardián de esta región.', 'info');
      return;
    }
    if (q.brokenSeals.includes(index)) return;
    q.brokenSeals.push(index);
    this.world.setSealBroken(index);
    const it = this.world.interactables.find((o) => o.id === `seal-${index}`);
    if (it) { it.disabled = true; it.marker.visible = false; }
    this.player.addXp(42);
    this.player.gold += 16;
    this.audio.quest();
    this.vfx.capture({ x: it?.x || 0, y: this.player.position.y, z: it?.z || 0 }, '#ffb066');
    this.toast('Sello roto', `${q.brokenSeals.length} de 2 sellos de ceniza.`, 'quest');
    this.updateQuestHud();
    if (q.brokenSeals.length >= 2 && q.stage === 1) {
      q.stage = 2;
      this.updateQuestHud();
      this.saveGame(true);
      setTimeout(() => {
        if (this.state === 'playing') {
          this.startDialogue(Story.orinSealsDone(), () => {
            this.toast('La Fortaleza se abre', 'Kael te espera en el trono de obsidiana.', 'quest');
          });
        }
      }, 520);
    } else {
      this.saveGame(true);
    }
  }

  resonateWithSeal(index) {
    const q = this.quests[this.regionId];
    const creature = this.creaturesAlive.find((c) => c.sealIndex === index && !c.captured);
    if (creature) {
      this.toast('Eco Primordial', `Acércate a ${CREATURES[creature.id].name} y mantén Q para resonar.`, 'info');
      return;
    }
    if (q.primordialSeals.includes(index)) {
      this.toast('El Eco ya te escuchó', 'El sello permanece abierto.', 'info');
    }
  }

  useAltar() {
    const q = this.quests[this.regionId];
    if (q.stage < 3) {
      this.toast('El altar está sellado', 'El guardián de esta región aún respira.', 'danger');
      return;
    }
    if (q.stage >= 4) {
      this.toast('La luz ya te ha respondido', 'No queda nada más que reclamar aquí.', 'info');
      return;
    }
    this.audio.quest();
    this.vfx.capture({ x: this.player.position.x, y: this.player.position.y + 1, z: this.player.position.z }, '#ffe6ab');
    q.stage = 4;
    this.updateQuestHud();
    const altar = this.world.interactables.find((o) => o.type === 'altar');
    if (altar) { altar.disabled = true; altar.marker.visible = false; }
    if (this.regionId === 'valdoria') {
      this.world.openPortal();
      this.startDialogue(Story.altarDialogue(0), () => {
        this.toast('Fragmento de la Gema', 'La Puerta de Drakmore se ha abierto al norte.', 'quest');
        this.saveGame(true);
      });
    } else if (this.regionId === 'drakmore') {
      this.addItem('lagrima_brasa');
      this.world.openPortal();
      this.startDialogue(Story.altarDialogue(1), () => {
        this.toast('Lágrima de la Primera Brasa', 'El Portal de Kansordore arde al sur.', 'quest');
        this.saveGame(true);
      });
    } else {
      q.completed = true;
      this.startDialogue(Story.altarDialogue(2), () => {
        this.saveGame(true);
        this.showEnding();
      });
    }
  }

  openChest(id, obj) {
    if (this.openedChests.has(id)) {
      this.toast('Cofre vacío', 'Ya reclamaste lo que guardaba.', 'info');
      return;
    }
    const loot = {
      'valdoria-chest': { items: ['amuleto_lumin', 'elixir', 'elixir'], gold: 30 },
      'drakmore-chest': { items: ['espada_ceniza', 'elixir', 'elixir'], gold: 45 },
      'kansordore-chest': { items: ['peto_celestial', 'elixir', 'elixir'], gold: 60 },
    }[id] || { items: ['elixir'], gold: 10 };
    this.openedChests.add(id);
    for (const item of loot.items) this.addItem(item);
    this.player.gold += loot.gold;
    if (obj) {
      obj.disabled = true;
      obj.marker.visible = false;
      this.vfx.capture({ x: obj.x, y: this.player.position.y + 0.6, z: obj.z }, '#ffe6ab');
    }
    this.audio.chest();
    const names = loot.items.map((i) => ITEMS[i]?.name).filter(Boolean);
    this.toast('Cofre abierto', `${names.join(' · ')} · +${loot.gold} esencia`, 'quest');
    this.updateHud();
    this.saveGame(true);
  }

  readLore(id) {
    const lore = LORE.find((l) => l.id === id) || LORE[0];
    this.unlockedLore.add(lore.id);
    this.audio.quest();
    this.openModal(`
      <p class="eyebrow">ESTELA DEL VELO</p>
      <h2>${lore.title}</h2>
      <p>${lore.text}</p>
      <div class="credit-block"><span>ARCHIVO DEL PORTADOR</span><b>${this.unlockedLore.size} / ${LORE.length} estelas recuperadas</b></div>
    `);
    this.saveGame();
  }

  beginResonance() {
    if (this.state !== 'playing') return;
    this.resonanceHeld = true;
    let best = null;
    let bestD = 3.8;
    for (const c of this.creaturesAlive) {
      if (c.captured) continue;
      const d = Math.hypot(c.x - this.player.position.x, c.z - this.player.position.z);
      if (d < bestD) { bestD = d; best = c; }
    }
    if (!best) {
      this.toast('Sin eco cercano', 'Acércate a una criatura salvaje para resonar.', 'info');
      return;
    }
    this.resonance = { creature: best, progress: 0 };
    this.$('resonance-ring').classList.add('is-visible');
    this.$('resonance-progress').style.strokeDashoffset = '276.46';
    this.audio.ui();
  }

  cancelResonance() {
    this.resonanceHeld = false;
    this.resonance = null;
    this.$('resonance-ring')?.classList.remove('is-visible');
  }

  updateResonance(dt) {
    if (!this.resonance) return;
    if (!this.resonanceHeld) { this.cancelResonance(); return; }
    const c = this.resonance.creature;
    if (!c || c.captured) { this.cancelResonance(); return; }
    const d = Math.hypot(c.x - this.player.position.x, c.z - this.player.position.z);
    if (d > 4.6) {
      this.cancelResonance();
      this.toast('Resonancia interrumpida', 'No te alejes del eco.', 'danger');
      return;
    }
    const speed = this.player.origin?.id === 'sage' ? 1.32 : 1;
    this.resonance.progress += (dt / 1.55) * speed;
    const progress = clamp(this.resonance.progress, 0, 1);
    this.$('resonance-progress').style.strokeDashoffset = `${276.46 * (1 - progress)}`;
    if (progress >= 1) this.captureCreature(c);
  }

  captureCreature(creature) {
    if (!creature || creature.captured) return;
    const data = CREATURES[creature.id];
    creature.captured = true;
    this.cancelResonance();
    this.collection.add(creature.id);
    this.captures++;
    this.vfx.capture({ x: creature.x, y: creature.y, z: creature.z }, data.color);
    this.audio.capture();
    if (creature.mesh.parent) this.scene.remove(creature.mesh);
    if (creature.ring.parent) this.scene.remove(creature.ring);
    this.creaturesAlive = this.creaturesAlive.filter((c) => c !== creature);
    if (!this.activeCreature) this.activeCreature = creature.id;
    this.applyCreatureBuffs();
    this.player.addXp(26);
    this.player.gold += 10;
    this.toast('Vínculo de resonancia', `${data.name} · ${data.rarity} · ${data.element}`, 'heal');
    this.showSubtitle(Story.companionLines(creature.id), 4);
    if (creature.primordial) {
      const q = this.quests[this.regionId];
      if (!q.primordialSeals.includes(creature.sealIndex)) q.primordialSeals.push(creature.sealIndex);
      this.world.setSealBroken(creature.sealIndex);
      const it = this.world.interactables.find((o) => o.id === `primordial-${creature.sealIndex}`);
      if (it) { it.disabled = true; it.marker.visible = false; }
      this.updateQuestHud();
      if (q.primordialSeals.length >= 3 && q.stage === 1) {
        q.stage = 2;
        this.updateQuestHud();
        this.saveGame(true);
        setTimeout(() => {
          if (this.state === 'playing') {
            this.startDialogue(Story.testigoSealsDone(), () => {
              this.toast('La Puerta de la Convergencia', 'El centro del templo late con una luz imposible.', 'quest');
            });
          }
        }, 620);
      }
    }
    this.updateHud();
    this.saveGame(true);
  }

  applyCreatureBuffs() {
    if (!this.player) return;
    const list = [...this.collection].map((id) => CREATURES[id]).filter(Boolean);
    this.player.applyCreatureBuffs(list);
    this.updateHud();
  }

  summonCompanion() {
    if (this.state !== 'playing' || !this.player) return;
    if (this.companionCooldown > 0) {
      this.toast('Vínculo en recarga', `Disponible en ${Math.ceil(this.companionCooldown)} s.`, 'info');
      return;
    }
    const id = this.activeCreature || [...this.collection][0];
    if (!id) {
      this.toast('Sin criatura', 'Resuena con un eco salvaje antes de invocarlo.', 'danger');
      return;
    }
    if (this.companion?.mesh?.parent) this.scene.remove(this.companion.mesh);
    const data = CREATURES[id];
    const mesh = createCreature(id, 0.9);
    mesh.position.copy(this.player.position);
    mesh.position.y += 0.2;
    this.scene.add(mesh);
    const duration = this.player.origin?.id === 'sage' ? 27 : 20;
    this.companion = { id, mesh, life: duration, attackTimer: 0.7, maxLife: duration };
    this.companionCooldown = 30;
    this.vfx.capture(this.player.position, data.color);
    this.audio.capture();
    this.toast('Vínculo invocado', `${data.name} lucha a tu lado.`, 'heal');
    if (id === 'lumin' || id === 'seraph') {
      const heal = id === 'lumin' ? 0.28 : 0.18;
      this.player.hp = Math.min(this.player.maxHp, this.player.hp + this.player.maxHp * heal);
      this.spawnHealEffect(this.player.position);
    } else if (id === 'chispa') {
      this.damageEnemiesInRadius(this.player.position, 5.8, this.player.damage * 0.9, '#ff9b57');
    } else if (id === 'astral') {
      this.damageEnemiesInRadius(this.player.position, 12, this.player.damage * 0.75, '#bca3ee');
      for (const e of this.enemies) {
        if (e.alive && e.mesh.parent) this.vfx.beam(this.player.position, e.mesh.position, '#bca3ee');
      }
    }
    this.updateHud();
  }

  damageEnemiesInRadius(position, radius, damage, color) {
    for (const enemy of this.enemies) {
      if (!enemy.alive || !enemy.mesh.parent) continue;
      if (dist2D(enemy.mesh.position, position) > radius) continue;
      enemy.takeDamage(damage, this, false);
      this.vfx.beam(position, enemy.mesh.position, color);
    }
    this.vfx.capture({ x: position.x, y: position.y, z: position.z }, color);
    this.shake(0.2);
  }

  updateCompanion(dt) {
    if (!this.companion) return;
    const c = this.companion;
    c.life -= dt;
    if (c.life <= 0) {
      if (c.mesh.parent) this.scene.remove(c.mesh);
      this.companion = null;
      this.toast('El vínculo se desvanece', 'Puedes invocar de nuevo cuando recargue.', 'info');
      return;
    }
    const data = CREATURES[c.id];
    const side = Math.sin(this.time * 1.4) * 0.8;
    const target = new THREE.Vector3(
      this.player.position.x - Math.sin(this.cameraYaw) * 1.5 + Math.cos(this.cameraYaw) * side,
      this.player.position.y + 0.15,
      this.player.position.z - Math.cos(this.cameraYaw) * 1.5 - Math.sin(this.cameraYaw) * side
    );
    c.mesh.position.lerp(target, 1 - Math.exp(-4.5 * dt));
    c.mesh.position.y = this.world.heightAt(c.mesh.position.x, c.mesh.position.z) + 0.1 + Math.sin(this.time * 2.2) * 0.1;
    animateCreature(c.mesh, this.time * 1.4, true);
    c.attackTimer -= dt;
    if (c.attackTimer <= 0) {
      const enemy = this.nearestEnemy(9);
      if (enemy) {
        c.attackTimer = 1.45;
        this.vfx.beam(c.mesh.position, enemy.mesh.position, data.color);
        enemy.takeDamage(this.player.damage * 0.52, this, false);
        this.audio.arrow();
      } else {
        c.attackTimer = 0.5;
      }
    }
  }

  travelTo(regionId) {
    if (this.state !== 'playing' || !REGIONS[regionId]) return;
    if (this.regionId === 'valdoria' && this.quests.valdoria.stage < 4) {
      this.toast('La puerta duerme', 'Toma el Fragmento del altar antes de partir.', 'danger');
      return;
    }
    if (this.regionId === 'drakmore' && this.quests.drakmore.stage < 4) {
      this.toast('El portal está sellado', 'La Lágrima de la Primera Brasa aún no es tuya.', 'danger');
      return;
    }
    this.state = 'travel';
    this.input.setEnabled(false);
    this.hidePrompt();
    this.saveGame(true);
    this.audio.portal();
    const fade = this.$('fade-layer');
    fade.classList.add('is-active');
    setTimeout(() => {
      this.loadRegion(regionId, { banner: true, activate: false, autosave: false });
      setTimeout(() => {
        fade.classList.remove('is-active');
        this.state = 'playing';
        this.input.setEnabled(true);
        this.setBodyState();
        this.audio.setMood(REGIONS[regionId].music);
        this.toast(REGIONS[regionId].name, REGIONS[regionId].subtitle, 'quest');
        this.saveGame(true);
      }, 620);
    }, 760);
  }

  openMenu(tab = 'character') {
    if (this.state !== 'playing' || !this.player) return;
    this.state = 'menu';
    this.input.setEnabled(false);
    this.setBodyState();
    this.hidePrompt();
    this.showScreen('menu-screen');
    this.renderMenu(tab);
    this.audio.ui();
  }

  closeMenu() {
    if (this.state !== 'menu') return;
    this.showScreen(null);
    this.state = 'playing';
    this.input.setEnabled(true);
    this.setBodyState();
    this.saveGame();
    this.audio.ui();
  }

  renderMenu(tab = 'character') {
    if (!this.player) return;
    this.menuTab = tab;
    this.$('menu-tabs').querySelectorAll('[data-tab]').forEach((b) => b.classList.toggle('is-active', b.dataset.tab === tab));
    const p = this.player;
    this.$('menu-title').textContent = p.name;
    this.$('menu-subtitle').textContent = `Nv. ${p.level} · ${p.origin?.name || 'Portador'} · ${REGIONS[this.regionId]?.name || ''}`;
    this.$('menu-gold').textContent = `✦ ${p.gold} esencia`;
    const content = this.$('menu-content');
    if (tab === 'character') content.innerHTML = this.menuCharacterHtml();
    else if (tab === 'equipment') content.innerHTML = this.menuEquipmentHtml();
    else if (tab === 'creatures') content.innerHTML = this.menuCreaturesHtml();
    else if (tab === 'journal') content.innerHTML = this.menuJournalHtml();
    else if (tab === 'map') content.innerHTML = this.menuMapHtml();
    else content.innerHTML = this.menuSettingsHtml();
    if (tab === 'settings') this.bindSettings();
    if (tab === 'map') this.drawWorldMap();
  }

  menuCharacterHtml() {
    const p = this.player;
    const origin = p.origin || ORIGINS[0];
    const attrRows = ATTRIBUTES.map((a) => `<div class="stat-line"><span>${a.name}</span><b>${p.attributes[a.id] || 0}</b></div>`).join('');
    const derived = [
      ['PV', p.maxHp], ['Maná', p.maxMana], ['Aguante', p.maxStamina],
      ['Daño', p.derived.damage], ['Defensa', p.derived.defense], ['Velocidad', p.derived.speed],
      ['Crítico', `${p.derived.crit}%`], ['Resonancia', `${p.derived.resonance}%`],
    ].map(([k, v]) => `<div class="derived-box"><small>${k}</small><b>${v}</b></div>`).join('');
    return `
      <div class="menu-grid">
        <div class="menu-panel">
          <h3>ATRIBUTOS DEL PORTADOR</h3>
          <div class="stat-grid">${attrRows}</div>
          <div class="derived-grid">${derived}</div>
        </div>
        <div class="menu-panel">
          <h3>ORIGEN</h3>
          <p style="font-family:var(--serif);color:var(--gold-bright);font-size:1rem;margin-bottom:.35rem">${origin.name}</p>
          <div class="preview-perk">${origin.perk}</div>
          <h3 style="margin-top:1rem">ESTADÍSTICAS DE VIAJE</h3>
          <div class="stat-grid">
            <div class="stat-line"><span>Tiempo jugado</span><b>${formatTime(this.playTime)}</b></div>
            <div class="stat-line"><span>Enemigos vencidos</span><b>${this.kills}</b></div>
            <div class="stat-line"><span>Criaturas resonadas</span><b>${this.collection.size} / ${Object.keys(CREATURES).length}</b></div>
            <div class="stat-line"><span>Estelas recuperadas</span><b>${this.unlockedLore.size} / ${LORE.length}</b></div>
            <div class="stat-line"><span>Caídas</span><b>${this.deaths}</b></div>
            <div class="stat-line"><span>Región</span><b>${REGIONS[this.regionId]?.name || '—'}</b></div>
          </div>
        </div>
      </div>`;
  }

  menuEquipmentHtml() {
    const p = this.player;
    const slot = (key, label) => {
      const item = p.equipment[key];
      return `<div class="equip-slot"><span>${label}</span><b>${item ? item.name : 'Vacío'}</b><small>${item ? item.desc : 'Ningún objeto equipado.'}</small></div>`;
    };
    const items = [...this.inventory]
      .map((id) => ITEMS[id])
      .filter((item) => item && item.type !== 'consumable')
      .sort((a, b) => (a.type === b.type ? a.name.localeCompare(b.name) : a.type.localeCompare(b.type)));
    const rows = items.map((item) => {
      const equipped = Object.values(p.equipment).some((e) => e?.id === item.id);
      const stats = [
        item.atk ? `+${item.atk} daño` : '', item.def ? `+${item.def} defensa` : '',
        item.hp ? `+${item.hp} PV` : '', item.mana ? `+${item.mana} maná` : '',
        item.crit ? `+${Math.round(item.crit * 100)}% crítico` : '',
        item.resonance ? `+${Math.round(item.resonance * 100)}% resonancia` : '',
      ].filter(Boolean).join(' · ');
      return `<div class="item-row">
        <div class="item-icon">${item.icon}</div>
        <div class="item-copy"><b>${item.name}</b><small>${item.rarity} · ${stats || item.desc}</small></div>
        <button class="item-action" data-equip="${item.id}" ${equipped ? 'disabled' : ''}>${equipped ? 'Equipado' : 'Equipar'}</button>
      </div>`;
    }).join('');
    return `
      <div class="menu-panel" style="margin-bottom:.8rem">
        <h3>EQUIPO ACTIVO</h3>
        <div class="equipment-slots">${slot('weapon', 'Arma')}${slot('armor', 'Armadura')}${slot('charm', 'Amuleto')}</div>
      </div>
      <div class="menu-panel">
        <h3>MOCHILA · ${items.length} objetos</h3>
        <div class="item-list">${rows || '<p style="font-size:.7rem;color:var(--muted)">La mochila está vacía. Explora cofres y ruinas.</p>'}</div>
      </div>`;
  }

  menuCreaturesHtml() {
    const cards = Object.values(CREATURES).map((c) => {
      const owned = this.collection.has(c.id);
      const active = this.activeCreature === c.id;
      return `<div class="creature-card ${owned ? '' : 'is-locked'}">
        <div class="creature-glyph">${c.glyph}</div>
        <h4>${owned ? c.name : 'Eco desconocido'}</h4>
        <div class="creature-meta">${owned ? `${c.element} · ${c.rarity}` : 'Aún no resonado'}</div>
        <p>${owned ? c.lore : 'La silueta aún no responde a tu llamada. Explora la región y mantén la resonancia.'}</p>
        ${owned ? `<div class="creature-passive"><b>Pasiva.</b> ${c.passive}<br /><b>Habilidad.</b> ${c.ability}</div>
        <button class="item-action" data-bind="${c.id}" ${active ? 'disabled' : ''} style="margin-top:.5rem">${active ? 'Vinculada' : 'Vincular'}</button>` : ''}
      </div>`;
    }).join('');
    return `
      <div class="menu-panel" style="margin-bottom:.8rem">
        <h3>VÍNCULO ACTIVO</h3>
        <p style="font-size:.72rem;color:var(--muted)">${this.activeCreature ? `${CREATURES[this.activeCreature].name}: ${CREATURES[this.activeCreature].ability}` : 'Ninguna criatura vinculada. Las pasivas de todas las criaturas capturadas ya afectan tus atributos.'}</p>
      </div>
      <div class="creature-grid">${cards}</div>`;
  }

  menuJournalHtml() {
    const quests = REGION_ORDER.map((id) => {
      const region = REGIONS[id];
      const q = this.quests[id];
      const done = q.stage >= region.quest.steps.length || q.completed;
      const current = id === this.regionId && !done;
      const stepIndex = clamp(q.stage, 0, region.quest.steps.length - 1);
      return `<div class="journal-entry ${done ? 'is-done' : ''}">
        <span>${region.numeral} · ${done ? 'COMPLETADA' : current ? 'EN CURSO' : 'PENDIENTE'}</span>
        <b>${region.quest.title}</b>
        <p>${done ? 'La luz de esta región ha respondido.' : region.quest.steps[stepIndex].objective}</p>
      </div>`;
    }).join('');
    const lore = LORE.map((l) => this.unlockedLore.has(l.id)
      ? `<div class="lore-entry"><span>ESTELA</span><b>${l.title}</b><p>${l.text}</p></div>`
      : `<div class="lore-entry" style="opacity:.35"><span>ESTELA OCULTA</span><b>—</b><p>Busca las estelas de piedra en el mundo.</p></div>`).join('');
    return `
      <div class="menu-grid">
        <div class="menu-panel"><h3>MISIONES PRINCIPALES</h3><div class="journal-list">${quests}</div></div>
        <div class="menu-panel"><h3>CODEX DEL VELO · ${this.unlockedLore.size}/${LORE.length}</h3><div class="lore-list">${lore}</div></div>
      </div>`;
  }

  menuMapHtml() {
    return `
      <div class="map-wrap">
        <div>
          <canvas id="world-map" width="680" height="680"></canvas>
          <div class="map-legend">
            <span><i class="map-dot"></i> Portador</span>
            <span><i class="map-dot cyan"></i> Criatura / portal</span>
            <span><i class="map-dot red"></i> Peligro</span>
          </div>
        </div>
      </div>`;
  }

  menuSettingsHtml() {
    const s = this.settings;
    const toggle = (key, label, detail) => `<div class="setting-row"><label>${label}<small>${detail}</small></label><button class="toggle ${s[key] ? 'is-on' : ''}" data-toggle="${key}" aria-label="${label}"></button></div>`;
    return `
      <div class="settings-grid">
        <div class="menu-panel">
          <h3>AUDIO</h3>
          <div class="setting-row"><label>Música<small>Motetes procedurales del Velo</small></label><div class="range-row"><input id="set-music" type="range" min="0" max="1" step="0.05" value="${s.music}" /></div></div>
          <div class="setting-row"><label>Efectos<small>Golpes, pasos y resonancia</small></label><div class="range-row"><input id="set-sfx" type="range" min="0" max="1" step="0.05" value="${s.sfx}" /></div></div>
          ${toggle('hints', 'Consejos en pantalla', 'Muestra el recordatorio de controles')}
        </div>
        <div class="menu-panel">
          <h3>PRESENTACIÓN</h3>
          ${toggle('shake', 'Sacudida de cámara', 'Impacto cinematográfico en combate')}
          ${toggle('damageNumbers', 'Números de daño', 'Muestra el daño infligido y recibido')}
          <div class="setting-row"><label>Calidad<small>Se aplica al cambiar de región</small></label><select id="set-quality" class="setting-select">
            <option value="auto" ${s.quality === 'auto' ? 'selected' : ''}>Automática</option>
            <option value="high" ${s.quality === 'high' ? 'selected' : ''}>Alta</option>
            <option value="medium" ${s.quality === 'medium' ? 'selected' : ''}>Equilibrada</option>
          </select></div>
        </div>
        <div class="menu-panel">
          <h3>PARTIDA</h3>
          <p style="font-size:.68rem;color:var(--muted);line-height:1.5;margin-bottom:.5rem">El progreso se guarda automáticamente al completar objetivos, resonar y cambiar de región.</p>
          <div style="display:flex;flex-wrap:wrap;gap:.4rem">
            <button class="item-action" data-save="1">Guardar ahora</button>
            <button class="item-action" data-fullscreen="1">Pantalla completa</button>
            <button class="item-action" data-title="1">Volver al título</button>
            <button class="item-action" data-reset="1">Borrar partida</button>
          </div>
        </div>
        <div class="menu-panel">
          <h3>CONTROLES</h3>
          <div class="stat-grid">
            <div class="stat-line"><span>Mover</span><b>WASD</b></div>
            <div class="stat-line"><span>Atacar</span><b>Clic / J</b></div>
            <div class="stat-line"><span>Ruptura</span><b>R</b></div>
            <div class="stat-line"><span>Esquivar</span><b>Espacio</b></div>
            <div class="stat-line"><span>Bloquear</span><b>Clic der.</b></div>
            <div class="stat-line"><span>Interactuar</span><b>E</b></div>
            <div class="stat-line"><span>Resonar</span><b>Q</b></div>
            <div class="stat-line"><span>Diario</span><b>Tab</b></div>
          </div>
        </div>
      </div>`;
  }

  bindSettings() {
    this.$('set-music')?.addEventListener('input', (e) => {
      this.settings.music = Number(e.target.value);
      this.audio.setVolume('music', this.settings.music);
      this.saveSettings();
    });
    this.$('set-sfx')?.addEventListener('input', (e) => {
      this.settings.sfx = Number(e.target.value);
      this.audio.setVolume('sfx', this.settings.sfx);
      this.saveSettings();
    });
    this.$('set-quality')?.addEventListener('change', (e) => {
      this.settings.quality = e.target.value;
      this.quality = e.target.value === 'auto'
        ? (matchMedia('(pointer: coarse)').matches ? 'medium' : 'high')
        : e.target.value;
      this.saveSettings();
      this.toast('Calidad guardada', 'Se aplicará al cambiar de región.', 'info');
    });
  }

  onMenuClick(e) {
    const equip = e.target.closest('[data-equip]');
    if (equip) { this.equipItem(equip.dataset.equip); return; }
    const bind = e.target.closest('[data-bind]');
    if (bind) { this.bindCreature(bind.dataset.bind); return; }
    const toggle = e.target.closest('[data-toggle]');
    if (toggle) {
      const key = toggle.dataset.toggle;
      this.settings[key] = !this.settings[key];
      this.saveSettings();
      toggle.classList.toggle('is-on', this.settings[key]);
      this.audio.ui();
      if (key === 'hints') this.$('controls-hint').style.display = this.settings.hints ? '' : 'none';
      return;
    }
    if (e.target.closest('[data-save]')) {
      this.saveGame(true);
      this.toast('Partida guardada', 'El Velo recuerda tu paso.', 'quest');
      return;
    }
    if (e.target.closest('[data-fullscreen]')) {
      if (!document.fullscreenElement) document.documentElement.requestFullscreen?.().catch(() => {});
      else document.exitFullscreen?.();
      return;
    }
    if (e.target.closest('[data-title]')) {
      this.saveGame();
      this.closeMenu();
      this.returnToTitle();
      return;
    }
    if (e.target.closest('[data-reset]')) {
      if (window.confirm('¿Borrar la partida guardada? Esta acción no se puede deshacer.')) {
        try { localStorage.removeItem(SAVE_KEY); } catch (err) { /* ignore */ }
        this.updateContinueButton();
        this.toast('Partida borrada', 'La leyenda vuelve a empezar.', 'danger');
      }
    }
  }

  equipItem(id) {
    const item = ITEMS[id];
    if (!item || !this.inventory.has(id)) return;
    this.player.equip(item);
    this.audio.chest();
    this.toast('Equipo actualizado', item.name, 'quest');
    this.renderMenu('equipment');
    this.saveGame();
  }

  bindCreature(id) {
    if (!this.collection.has(id)) return;
    this.activeCreature = id;
    this.applyCreatureBuffs();
    this.audio.confirm();
    this.toast('Vínculo establecido', `${CREATURES[id].name} responde a tu llamada.`, 'heal');
    this.renderMenu('creatures');
    this.saveGame();
  }

  openModal(html, opts = {}) {
    this.modalReturn = {
      state: this.state,
      screen: this.state === 'menu' ? 'menu-screen' : this.state === 'title' ? 'title-screen' : null,
    };
    this.state = 'modal';
    this.input.setEnabled(false);
    this.$('modal-content').innerHTML = html;
    this.$('modal-close').style.display = opts.hideClose ? 'none' : '';
    this.showScreen('modal-screen');
    this.setBodyState();
  }

  closeModal() {
    if (this.state !== 'modal') return;
    this.showScreen(this.modalReturn?.screen || null);
    if (this.modalReturn?.state === 'menu') {
      this.state = 'menu';
      this.setBodyState();
    } else if (this.modalReturn?.state === 'title') {
      this.state = 'title';
      this.setBodyState();
    } else {
      this.state = 'playing';
      this.input.setEnabled(true);
      this.setBodyState();
    }
    this.modalReturn = null;
  }

  openHowToPlay() {
    this.ensureAudio();
    this.audio.ui();
    this.openModal(`
      <p class="eyebrow">CÓMO JUGAR</p>
      <h2>La Espada no se explica. Se empuña.</h2>
      <p>Explora Valdoria, Drakmore y Kansordore. Habla con sus guardianes, purga la corrupción, vence a los señores del Velo y reúne los tres ecos de la Gema Celestial.</p>
      <h3>Controles de teclado y ratón</h3>
      <div class="control-grid">
        <div class="control-line"><span>Moverse</span><b>WASD / flechas</b></div>
        <div class="control-line"><span>Ataque ligero</span><b>Clic / J</b></div>
        <div class="control-line"><span>Ruptura</span><b>R</b></div>
        <div class="control-line"><span>Esquivar</span><b>Espacio</b></div>
        <div class="control-line"><span>Bloquear</span><b>Clic derecho</b></div>
        <div class="control-line"><span>Interactuar</span><b>E</b></div>
        <div class="control-line"><span>Resonar</span><b>Q (mantener)</b></div>
        <div class="control-line"><span>Invocar vínculo</span><b>F</b></div>
        <div class="control-line"><span>Elixir</span><b>H</b></div>
        <div class="control-line"><span>Diario</span><b>Tab / Esc</b></div>
      </div>
      <h3>Resonancia</h3>
      <p>Acércate a una criatura salvaje y mantén <b>Q</b>. Si te alejas, el vínculo se rompe. Las criaturas capturadas otorgan pasivas permanentes y una habilidad de invocación.</p>
      <h3>Combate</h3>
      <p>Encadena ataques ligeros, usa la Ruptura para romper guardias y esquiva con el tiempo justo. Un bloqueo en el instante del impacto genera un contraataque de luz. Vigila el aguante: sin él, tu guardia se rompe.</p>
      <h3>En móvil</h3>
      <p>Usa el joystick de la izquierda y los botones de la derecha. Arrastra sobre el mundo para girar la cámara. El juego está pensado para pantalla horizontal.</p>
    `);
  }

  openCredits() {
    this.ensureAudio();
    this.audio.ui();
    this.openModal(`
      <p class="eyebrow">CRÉDITOS</p>
      <h2>El equipo detrás del Velo</h2>
      <div class="credit-block"><span>DIRECCIÓN Y DISEÑO</span><b>Estudio Aurora Cero</b><p>Un prototipo jugable original creado para esta demostración. Sin assets de terceros: geometría, texturas, personajes y música son procedurales.</p></div>
      <div class="credit-block"><span>MOTOR</span><b>Three.js + Vite</b><p>Renderizado 3D en tiempo real, iluminación dinámica, sombras y efectos aditivos.</p></div>
      <div class="credit-block"><span>MÚSICA Y SONIDO</span><b>Síntesis WebAudio</b><p>Motetes, percusión y ambientes generados en el navegador. Sin pistas pregrabadas.</p></div>
      <div class="credit-block"><span>TIPOGRAFÍAS</span><b>Cinzel · Alegreya Sans</b><p>Distribuidas bajo SIL Open Font License.</p></div>
      <div class="credit-block"><span>AGRADECIMIENTO ESPECIAL</span><b>A quien sostiene la Espada</b><p>Gracias por jugar. La Convergencia solo existe si alguien decide mirarla.</p></div>
    `);
  }

  showEnding() {
    this.state = 'ending';
    this.input.setEnabled(false);
    this.setBodyState();
    this.showScreen('ending-screen');
    this.audio.setMood('kansordore');
    this.$('ending-copy').textContent = ENDING_TEXT;
    this.$('ending-stats').innerHTML = `
      <div class="ending-stat"><small>NIVEL FINAL</small><b>${this.player.level}</b></div>
      <div class="ending-stat"><small>TIEMPO</small><b>${formatTime(this.playTime)}</b></div>
      <div class="ending-stat"><small>CRIATURAS</small><b>${this.collection.size}/${Object.keys(CREATURES).length}</b></div>
      <div class="ending-stat"><small>ESENCIA</small><b>${this.player.gold}</b></div>`;
    this.quests.kansordore.completed = true;
    this.quests.kansordore.stage = 5;
    this.saveGame(true);
    this.audio.quest();
  }

  continueAfterEnding() {
    this.showScreen(null);
    this.state = 'playing';
    this.input.setEnabled(true);
    this.setBodyState();
    this.audio.setMood(REGIONS[this.regionId].music);
    this.toast('El mundo sigue abierto', 'Explora, captura criaturas y completa el codex.', 'quest');
    this.saveGame();
  }

  newGamePlus() {
    this.showScreen(null);
    this.returnToTitle();
    this.openCreator();
  }

  drawWorldMap() {
    const canvas = this.$('world-map');
    if (!canvas || !this.world) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    const cx = w / 2;
    const cy = h / 2;
    const scale = 2.85;
    const region = REGIONS[this.regionId];
    ctx.clearRect(0, 0, w, h);
    const grad = ctx.createRadialGradient(cx, cy, 20, cx, cy, w * 0.65);
    grad.addColorStop(0, this.regionId === 'drakmore' ? '#4a2b27' : this.regionId === 'kansordore' ? '#3e3b60' : '#38543c');
    grad.addColorStop(0.7, '#101820');
    grad.addColorStop(1, '#080c11');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = 'rgba(228,191,120,0.07)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 9; i++) {
      ctx.beginPath();
      ctx.ellipse(cx + Math.sin(i * 1.7) * 40, cy + Math.cos(i * 1.2) * 35, 60 + i * 38, 45 + i * 30, i * 0.2, 0, Math.PI * 2);
      ctx.stroke();
    }
    const map = (x, z) => [cx + x * scale, cy + z * scale];
    const spawn = this.world.spawn;
    const [sx, sy] = map(spawn.x, spawn.z);
    for (const poi of this.world.poi) {
      if (!['portal', 'boss', 'temple', 'village', 'camp'].includes(poi.type)) continue;
      const [x, y] = map(poi.x, poi.z);
      ctx.strokeStyle = 'rgba(228,191,120,0.13)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([5, 8]);
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(x, y);
      ctx.stroke();
      ctx.setLineDash([]);
    }
    for (const poi of this.world.poi) {
      const [x, y] = map(poi.x, poi.z);
      const done = poi.type === 'done';
      const color = done ? '#8fe8dd' : poi.type === 'boss' ? '#e25f55' : poi.type === 'portal' ? '#92e7df' : poi.type === 'npc' ? '#ffe6ab' : '#d9c08a';
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x, y, poi.type === 'boss' ? 6 : 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(3,6,9,0.8)';
      ctx.lineWidth = 2;
      ctx.stroke();
      if (['boss', 'portal', 'temple', 'village', 'camp', 'npc'].includes(poi.type)) {
        ctx.fillStyle = 'rgba(246,237,219,0.72)';
        ctx.font = '700 13px "Alegreya Sans", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(poi.label, x, y + 20);
      }
    }
    for (const enemy of this.enemies) {
      if (!enemy.alive || !enemy.mesh.parent) continue;
      const [x, y] = map(enemy.mesh.position.x, enemy.mesh.position.z);
      ctx.fillStyle = enemy.boss ? '#ff5d4e' : enemy.elite ? '#ffb35c' : 'rgba(207,106,93,0.8)';
      ctx.beginPath();
      ctx.arc(x, y, enemy.boss ? 6 : 2.5, 0, Math.PI * 2);
      ctx.fill();
    }
    for (const c of this.creaturesAlive) {
      const [x, y] = map(c.x, c.z);
      ctx.fillStyle = CREATURES[c.id]?.color || '#92e7df';
      ctx.beginPath();
      ctx.arc(x, y, 3.2, 0, Math.PI * 2);
      ctx.fill();
    }
    const [px, py] = map(this.player.position.x, this.player.position.z);
    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(-this.player.facing + Math.PI);
    ctx.fillStyle = '#ffe6ab';
    ctx.shadowColor = '#ffe6ab';
    ctx.shadowBlur = 14;
    ctx.beginPath();
    ctx.moveTo(0, -11);
    ctx.lineTo(7, 8);
    ctx.lineTo(0, 4);
    ctx.lineTo(-7, 8);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    ctx.fillStyle = 'rgba(246,237,219,0.85)';
    ctx.font = '900 28px "Cinzel", serif';
    ctx.textAlign = 'left';
    ctx.fillText(region.name, 24, 44);
    ctx.fillStyle = 'rgba(228,191,120,0.7)';
    ctx.font = '700 13px "Alegreya Sans", sans-serif';
    ctx.fillText(region.subtitle, 26, 64);
    ctx.strokeStyle = 'rgba(228,191,120,0.25)';
    ctx.strokeRect(12, 12, w - 24, h - 24);
  }

  // __APPEND__
}
