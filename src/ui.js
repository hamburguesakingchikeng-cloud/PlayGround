import {
  APPEARANCE, ORIGINS, WEAPONS, ARMORS, CHARMS, CREATURES, MAIN_STAGES,
  SIDE_QUESTS, LORE, REGIONS, SKILLS, STAT_DEFS, SETTINGS_KEY, ENDINGS, formatTime,
} from './data.js';

const $ = (id) => document.getElementById(id);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const DEFAULT_SETTINGS = {
  music: 0.55,
  sfx: 0.8,
  quality: 'auto',
  fontScale: 1,
  reduceMotion: false,
  highContrast: false,
  damageNumbers: true,
  autoTarget: true,
  screenShake: true,
  leftHanded: false,
};

let svgUid = 0;

function portraitSVG(kind = 'player', appearance = {}, options = {}) {
  const uid = `p${++svgUid}`;
  const presets = {
    lyra: { skin: '#e8bd9d', hair: '#dbe7ee', outfit: '#40356b', accent: '#c6b7ff', style: 'largo', eye: '#7ee8fa', name: 'Lyra' },
    nima: { skin: '#b97a54', hair: '#5b3522', outfit: '#2f6a57', accent: '#b8f59e', style: 'trenza', eye: '#d7ffc7', name: 'Nima' },
    mira: { skin: '#d6a57f', hair: '#dbe7ee', outfit: '#6b3e4a', accent: '#f4d58d', style: 'largo', eye: '#c2a36b', name: 'Mira' },
    orin: { skin: '#8a5638', hair: '#241d2e', outfit: '#5d3e32', accent: '#ffb347', style: 'rapado', eye: '#f4d58d', name: 'Orin' },
    kael: { skin: '#c58a5e', hair: '#241d2e', outfit: '#4a2228', accent: '#ff8a4a', style: 'corto', eye: '#ffd166', name: 'Kael' },
    vex: { skin: '#d8d2e8', hair: '#e9e5f7', outfit: '#282143', accent: '#ffd166', style: 'largo', eye: '#fff2c4', name: 'Vex' },
    player: {
      skin: appearance.skinColor || '#e2b184',
      hair: appearance.hairColor || '#241d2e',
      outfit: appearance.outfitColor || '#2e5877',
      accent: appearance.accentColor || '#f4d58d',
      style: appearance.hairStyle || 'corto',
      eye: '#b9e7ff',
      name: appearance.name || 'Aurel',
    },
  };
  const p = presets[kind] || presets.player;
  const longHair = p.style === 'largo' || p.style === 'trenza';
  const hairBack = longHair
    ? `<path d="M50 112 C38 150 42 196 66 212 L134 212 C158 196 162 150 150 112 C142 142 58 142 50 112Z" fill="${p.hair}"/>`
    : '';
  const braid = p.style === 'trenza'
    ? `<path d="M143 145 C158 160 158 190 146 212" stroke="${p.hair}" stroke-width="14" fill="none" stroke-linecap="round"/>
       <path d="M143 177 l12 -4 M146 191 l11 2" stroke="${p.accent}" stroke-width="3" fill="none"/>`
    : '';
  const hairFront = p.style === 'rapado'
    ? `<path d="M62 105 C66 68 134 68 138 105 C124 90 76 90 62 105Z" fill="${p.hair}" opacity=".95"/>`
    : `<path d="M55 112 C52 72 78 52 100 52 C126 52 150 74 146 112 C136 92 126 83 111 80 C98 92 79 94 68 104 C64 108 60 111 55 112Z" fill="${p.hair}"/>
       <path d="M69 99 C81 75 118 73 135 96 C118 88 90 89 69 99Z" fill="${p.hair}" opacity=".8"/>`;
  const diadem = options.headgear === 'diadema' || kind === 'lyra' || kind === 'vex'
    ? `<path d="M61 88 Q100 70 139 88" stroke="${p.accent}" stroke-width="3" fill="none"/>
       <path d="M100 76 l7 10 -7 10 -7 -10Z" fill="${p.accent}"/>`
    : '';
  const helmet = options.headgear === 'celada'
    ? `<path d="M55 104 C55 68 80 48 100 48 C122 48 146 68 146 104 L142 128 L130 128 L126 98 C112 88 88 88 74 98 L70 128 L58 128Z" fill="${p.accent}"/>
       <path d="M100 60 L100 122 M76 108 L124 108" stroke="#2a2630" stroke-width="4"/>`
    : '';
  const freckles = kind === 'nima'
    ? `<g fill="#8f5c40" opacity=".65"><circle cx="79" cy="144" r="1.8"/><circle cx="86" cy="148" r="1.5"/><circle cx="118" cy="144" r="1.7"/><circle cx="124" cy="148" r="1.4"/></g>`
    : '';
  const scar = kind === 'kael'
    ? `<path d="M121 126 L132 151" stroke="#a9534a" stroke-width="2.5" opacity=".85"/>`
    : '';
  const halo = kind === 'vex'
    ? `<ellipse cx="100" cy="42" rx="42" ry="10" stroke="${p.accent}" stroke-width="2" fill="none" opacity=".85"/>
       <ellipse cx="100" cy="42" rx="30" ry="6" stroke="${p.accent}" stroke-width="1" fill="none" opacity=".4"/>`
    : '';
  const mask = kind === 'vex'
    ? `<path d="M64 124 Q100 105 136 124 Q130 166 100 174 Q70 166 64 124Z" fill="#f1e6d4" opacity=".96"/>
       <path d="M78 136 Q90 130 96 138 Q86 144 78 136Z" fill="${p.accent}"/>
       <path d="M122 136 Q110 130 104 138 Q114 144 122 136Z" fill="${p.accent}"/>
       <path d="M92 154 Q100 160 108 154" stroke="#7b5a3b" stroke-width="2" fill="none"/>`
    : '';
  return `
  <svg viewBox="0 0 200 240" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${esc(p.name)}">
    <defs>
      <radialGradient id="${uid}bg" cx="50%" cy="34%" r="75%">
        <stop offset="0%" stop-color="${p.accent}" stop-opacity=".22"/>
        <stop offset="55%" stop-color="#0c1830" stop-opacity=".92"/>
        <stop offset="100%" stop-color="#050912"/>
      </radialGradient>
      <linearGradient id="${uid}out" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${p.outfit}"/>
        <stop offset="100%" stop-color="#111526"/>
      </linearGradient>
      <linearGradient id="${uid}skin" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${p.skin}"/>
        <stop offset="100%" stop-color="${shade(p.skin, -18)}"/>
      </linearGradient>
      <filter id="${uid}glow"><feGaussianBlur stdDeviation="5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    </defs>
    <rect width="200" height="240" fill="url(#${uid}bg)"/>
    <circle cx="100" cy="118" r="88" fill="none" stroke="${p.accent}" stroke-opacity=".12"/>
    <circle cx="100" cy="118" r="70" fill="none" stroke="${p.accent}" stroke-opacity=".06"/>
    ${halo}
    <path d="M28 240 C30 196 60 174 100 174 C140 174 170 196 172 240Z" fill="url(#${uid}out)"/>
    <path d="M66 180 C74 168 126 168 134 180 L130 220 L70 220Z" fill="${p.accent}" opacity=".22"/>
    <path d="M82 158 L118 158 L122 186 L78 186Z" fill="url(#${uid}skin)"/>
    ${hairBack}
    <path d="M64 116 C64 84 80 66 100 66 C120 66 136 84 136 116 L132 148 C128 174 112 184 100 184 C88 184 72 174 68 148Z" fill="url(#${uid}skin)"/>
    <path d="M66 120 C58 116 58 130 64 134 L69 134Z" fill="${shade(p.skin, -12)}"/>
    <path d="M134 120 C142 116 142 130 136 134 L131 134Z" fill="${shade(p.skin, -12)}"/>
    ${hairFront}
    ${diadem}
    ${helmet}
    ${mask}
    ${!mask ? `
    <path d="M78 122 Q88 116 96 122" stroke="#3b2a28" stroke-width="2.2" fill="none" stroke-linecap="round"/>
    <path d="M104 122 Q112 116 122 122" stroke="#3b2a28" stroke-width="2.2" fill="none" stroke-linecap="round"/>
    <ellipse cx="87" cy="130" rx="7" ry="5.5" fill="#fff8ec"/>
    <ellipse cx="113" cy="130" rx="7" ry="5.5" fill="#fff8ec"/>
    <circle cx="88" cy="130" r="3.6" fill="${p.eye}"/>
    <circle cx="112" cy="130" r="3.6" fill="${p.eye}"/>
    <circle cx="88" cy="130" r="1.8" fill="#1b2230"/>
    <circle cx="112" cy="130" r="1.8" fill="#1b2230"/>
    <circle cx="89.5" cy="128.4" r=".9" fill="#fff"/>
    <circle cx="113.5" cy="128.4" r=".9" fill="#fff"/>
    <path d="M100 133 Q97 142 101 144" stroke="${shade(p.skin, -28)}" stroke-width="1.8" fill="none" stroke-linecap="round"/>
    <path d="M90 156 Q100 162 110 156" stroke="#8b4f51" stroke-width="2.2" fill="none" stroke-linecap="round"/>
    <path d="M84 151 Q92 154 99 152" stroke="#d9908a" stroke-width="2" fill="none" opacity=".3"/>
    ${freckles}
    ${scar}
    ` : ''}
    ${braid}
    <path d="M70 202 Q100 188 130 202" stroke="${p.accent}" stroke-width="2" fill="none" opacity=".65"/>
    <path d="M100 196 l6 8 -6 8 -6 -8Z" fill="${p.accent}" opacity=".9" filter="url(#${uid}glow)"/>
  </svg>`;
}

function creaturePortraitSVG(species) {
  const uid = `c${++svgUid}`;
  const c = species.colors;
  const shapes = {
    fox: `<path d="M62 156 C58 126 72 104 100 104 C128 104 142 126 138 156 C134 186 118 196 100 196 C82 196 66 186 62 156Z" fill="${c.body}"/>
      <path d="M72 112 L62 70 L92 92Z" fill="${c.body}"/><path d="M128 112 L138 70 L108 92Z" fill="${c.body}"/>
      <path d="M70 78 L70 96 L84 94Z" fill="${c.accent}" opacity=".6"/><path d="M130 78 L130 96 L116 94Z" fill="${c.accent}" opacity=".6"/>
      <path d="M76 144 Q86 136 94 144 Q86 152 76 144Z" fill="${c.eye}"/><path d="M124 144 Q114 136 106 144 Q114 152 124 144Z" fill="${c.eye}"/>
      <path d="M94 164 L100 170 L106 164" stroke="${c.accent}" stroke-width="3" fill="none"/>
      <path d="M138 164 C166 150 174 118 158 108 C146 126 148 144 126 154Z" fill="${c.accent}" opacity=".8"/>`,
    mossling: `<ellipse cx="100" cy="156" rx="48" ry="42" fill="${c.body}"/>
      <ellipse cx="100" cy="108" rx="32" ry="28" fill="${c.body}"/>
      <circle cx="84" cy="146" r="6" fill="${c.eye}"/><circle cx="116" cy="146" r="6" fill="${c.eye}"/>
      <path d="M88 166 Q100 174 112 166" stroke="${c.accent}" stroke-width="3" fill="none"/>
      <circle cx="72" cy="128" r="13" fill="${c.accent}" opacity=".55"/><circle cx="130" cy="112" r="10" fill="${c.accent}" opacity=".45"/>
      <path d="M100 80 Q96 58 112 54 Q106 76 116 82" fill="${c.accent}"/>`,
    bird: `<path d="M100 96 C120 96 132 118 126 150 C120 180 106 190 100 190 C94 190 80 180 74 150 C68 118 80 96 100 96Z" fill="${c.body}"/>
      <path d="M62 128 C34 108 28 150 62 166Z" fill="${c.accent}" opacity=".85"/>
      <path d="M138 128 C166 108 172 150 138 166Z" fill="${c.accent}" opacity=".85"/>
      <path d="M92 176 L100 194 L108 176Z" fill="${c.accent}"/>
      <circle cx="88" cy="122" r="5" fill="${c.eye}"/><circle cx="112" cy="122" r="5" fill="${c.eye}"/>
      <path d="M100 128 L92 140 L108 140Z" fill="${c.accent}"/>`,
    salamander: `<path d="M54 164 C52 142 66 128 92 130 L126 138 C148 142 158 158 150 176 C142 190 118 194 92 188 C70 182 58 176 54 164Z" fill="${c.body}"/>
      <path d="M60 166 C38 160 28 176 38 190 C46 200 62 194 64 184" fill="${c.body}"/>
      <circle cx="82" cy="150" r="5" fill="${c.eye}"/><circle cx="108" cy="154" r="5" fill="${c.eye}"/>
      <path d="M120 136 Q136 112 154 118 Q142 132 142 148" fill="${c.accent}" opacity=".85"/>
      <path d="M70 186 L64 202 M94 190 L90 206 M120 188 L118 204" stroke="${c.body}" stroke-width="8" stroke-linecap="round"/>
      <circle cx="144" cy="122" r="8" fill="${c.accent}" opacity=".7"/>`,
    beetle: `<ellipse cx="100" cy="156" rx="52" ry="38" fill="${c.body}"/>
      <path d="M52 156 Q100 122 148 156" fill="${c.accent}" opacity=".25"/>
      <path d="M100 120 L100 188" stroke="${c.accent}" stroke-width="3" opacity=".6"/>
      <path d="M82 116 Q78 88 94 82 Q94 104 104 112" fill="${c.body}"/>
      <path d="M104 112 Q114 88 132 90 Q124 108 118 116" fill="${c.accent}" opacity=".8"/>
      <circle cx="78" cy="146" r="5" fill="${c.eye}"/><circle cx="122" cy="146" r="5" fill="${c.eye}"/>
      <path d="M64 184 L52 202 M88 190 L82 210 M112 190 L118 210 M136 184 L148 202" stroke="${c.body}" stroke-width="7" stroke-linecap="round"/>`,
    wolf: `<path d="M54 162 C52 132 68 112 100 112 C132 112 148 132 146 162 C144 190 124 200 100 200 C76 200 56 190 54 162Z" fill="${c.body}"/>
      <path d="M66 120 L58 78 L88 102Z" fill="${c.body}"/><path d="M134 120 L142 78 L112 102Z" fill="${c.body}"/>
      <circle cx="82" cy="150" r="6" fill="${c.eye}"/><circle cx="118" cy="150" r="6" fill="${c.eye}"/>
      <path d="M92 172 Q100 178 108 172" stroke="${c.accent}" stroke-width="3" fill="none"/>
      <path d="M100 190 L92 206 L108 206Z" fill="${c.accent}" opacity=".8"/>
      <path d="M100 118 L88 136 L112 136Z" fill="${c.accent}" opacity=".45"/>`,
    butterfly: `<path d="M100 104 C126 82 166 92 164 130 C162 162 130 172 100 150Z" fill="${c.accent}" opacity=".7"/>
      <path d="M100 104 C74 82 34 92 36 130 C38 162 70 172 100 150Z" fill="${c.accent}" opacity=".55"/>
      <path d="M100 150 C120 178 158 180 160 158 C162 140 132 136 100 150Z" fill="${c.body}" opacity=".8"/>
      <path d="M100 150 C80 178 42 180 40 158 C38 140 68 136 100 150Z" fill="${c.body}" opacity=".8"/>
      <ellipse cx="100" cy="138" rx="8" ry="34" fill="${c.body}"/>
      <circle cx="100" cy="104" r="11" fill="${c.body}"/>
      <path d="M94 98 Q84 78 76 82 M106 98 Q116 78 124 82" stroke="${c.body}" stroke-width="2" fill="none"/>
      <circle cx="72" cy="122" r="12" fill="${c.eye}" opacity=".7"/><circle cx="128" cy="122" r="12" fill="${c.eye}" opacity=".7"/>`,
    turtle: `<ellipse cx="100" cy="156" rx="54" ry="42" fill="${c.body}"/>
      <path d="M56 156 Q100 112 144 156 Q100 186 56 156Z" fill="${c.accent}" opacity=".4"/>
      <path d="M100 118 L100 180 M72 132 L128 176 M128 132 L72 176" stroke="${c.accent}" stroke-width="2" opacity=".6"/>
      <circle cx="100" cy="104" r="22" fill="${c.body}"/>
      <circle cx="92" cy="100" r="4" fill="${c.eye}"/><circle cx="108" cy="100" r="4" fill="${c.eye}"/>
      <path d="M100 116 L94 124 L106 124Z" fill="${c.accent}"/>
      <path d="M56 180 L42 196 M144 180 L158 196" stroke="${c.body}" stroke-width="10" stroke-linecap="round"/>`,
    seraph: `<path d="M100 100 C118 100 128 118 124 146 C120 172 110 186 100 186 C90 186 80 172 76 146 C72 118 82 100 100 100Z" fill="${c.body}"/>
      <path d="M64 120 C34 94 22 140 58 164Z" fill="${c.accent}" opacity=".75"/>
      <path d="M136 120 C166 94 178 140 142 164Z" fill="${c.accent}" opacity=".75"/>
      <path d="M60 152 C36 140 24 174 54 188Z" fill="${c.accent}" opacity=".5"/>
      <path d="M140 152 C164 140 176 174 146 188Z" fill="${c.accent}" opacity=".5"/>
      <circle cx="90" cy="128" r="4" fill="${c.eye}"/><circle cx="110" cy="128" r="4" fill="${c.eye}"/>
      <path d="M92 146 Q100 152 108 146" stroke="${c.accent}" stroke-width="2" fill="none"/>
      <ellipse cx="100" cy="76" rx="26" ry="7" stroke="${c.accent}" stroke-width="2" fill="none" opacity=".9"/>`,
  };
  return `
  <svg viewBox="0 0 200 240" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${esc(species.name)}">
    <defs>
      <radialGradient id="${uid}bg" cx="50%" cy="40%" r="70%">
        <stop offset="0%" stop-color="${c.accent}" stop-opacity=".25"/>
        <stop offset="60%" stop-color="#0b1730" stop-opacity=".92"/>
        <stop offset="100%" stop-color="#050912"/>
      </radialGradient>
      <filter id="${uid}g"><feGaussianBlur stdDeviation="7" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    </defs>
    <rect width="200" height="240" fill="url(#${uid}bg)"/>
    <circle cx="100" cy="145" r="74" fill="${c.accent}" opacity=".08" filter="url(#${uid}g)"/>
    <circle cx="100" cy="145" r="64" fill="none" stroke="${c.accent}" stroke-opacity=".12"/>
    ${shapes[species.model] || shapes.fox}
    <path d="M50 224 Q100 206 150 224" stroke="${c.accent}" stroke-width="2" fill="none" opacity=".4"/>
  </svg>`;
}

function shade(hex, amt) {
  const c = hex.replace('#', '');
  const num = parseInt(c.length === 3 ? c.split('').map((x) => x + x).join('') : c, 16);
  const r = Math.max(0, Math.min(255, (num >> 16) + amt));
  const g = Math.max(0, Math.min(255, ((num >> 8) & 0xff) + amt));
  const b = Math.max(0, Math.min(255, (num & 0xff) + amt));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

export class UI {
  constructor() {
    this.app = null;
    this.settings = this.loadSettings();
    this.joystick = { x: 0, y: 0, active: false };
    this.dialogue = null;
    this.dialogueIndex = 0;
    this.dialogueTyping = false;
    this.dialogueTimer = null;
    this.dialogueFullText = '';
    this.cinematic = null;
    this.cinematicIndex = 0;
    this.cinematicTyping = false;
    this.cinematicTimer = null;
    this.capture = null;
    this.pauseTab = 'status';
    this.hudCache = {};
    this.questCache = '';
    this.interactionCache = '';
    this.bossCache = '';
    this.lastMinimap = 0;
    this.comboTimer = null;
    this.profile = this.defaultProfile();
    this.creationTab = 'skin';
    this.lastScreen = 'title';
    this.init();
  }

  setApp(app) {
    this.app = app;
    this.applySettings();
    if (app.audio?.started) {
      app.audio.setMusicVolume(this.settings.music);
      app.audio.setSfxVolume(this.settings.sfx);
    }
  }

  defaultProfile() {
    return {
      name: 'Aurel',
      origin: 'filo',
      appearance: {
        skinColor: APPEARANCE.skin[1].color,
        hairColor: APPEARANCE.hairColors[0].color,
        hairStyle: 'corto',
        outfitColor: APPEARANCE.outfitColors[0].color,
        accentColor: APPEARANCE.accents[0].color,
        headgear: 'ninguno',
      },
      weapon: 'filo_aurora',
      armor: 'tunica_viajero',
      allocation: { vitalidad: 0, resonancia: 0, resistencia: 0, fuerza: 0, defensa: 0, velocidad: 0, inteligencia: 0, suerte: 0 },
    };
  }

  loadSettings() {
    try {
      const saved = JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}');
      return { ...DEFAULT_SETTINGS, ...saved };
    } catch {
      return { ...DEFAULT_SETTINGS };
    }
  }

  saveSettings() {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(this.settings));
    } catch {
      /* storage unavailable */
    }
  }

  applySettings() {
    document.documentElement.style.setProperty('--font-scale', String(this.settings.fontScale));
    document.body.classList.toggle('reduce-motion', !!this.settings.reduceMotion);
    document.body.classList.toggle('high-contrast', !!this.settings.highContrast);
    document.body.classList.toggle('left-handed', !!this.settings.leftHanded);
    if (this.app?.audio) {
      this.app.audio.setMusicVolume(this.settings.music);
      this.app.audio.setSfxVolume(this.settings.sfx);
      this.app.audio.setMuted(this.settings.music <= 0 && this.settings.sfx <= 0);
    }
    if (this.app) this.app.setQuality(this.settings.quality);
    this.saveSettings();
  }

  init() {
    this.bind();
    this.renderCreation();
    this.renderSettings();
    this.updateContinueButton();
    this.setLoading(true);
  }

  bind() {
    $('btn-new-game')?.addEventListener('click', () => this.app?.showCreation());
    $('btn-continue')?.addEventListener('click', () => this.app?.continueGame());
    $('btn-title-settings')?.addEventListener('click', () => this.openModal('settings-modal'));
    $('btn-credits')?.addEventListener('click', () => this.openModal('credits-modal'));
    $('btn-creation-back')?.addEventListener('click', () => this.app?.showTitle());
    $('btn-start-adventure')?.addEventListener('click', () => this.startAdventure());
    $('char-name')?.addEventListener('input', (e) => {
      this.profile.name = e.target.value.trimStart().slice(0, 16) || 'Aurel';
      $('preview-name').textContent = this.profile.name;
      $('player-initial').textContent = this.profile.name.charAt(0).toUpperCase();
      this.refreshPreview();
    });
    $('appearance-tabs')?.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-tab]');
      if (!btn) return;
      this.creationTab = btn.dataset.tab;
      document.querySelectorAll('.appearance-tab').forEach((b) => b.classList.toggle('active', b === btn));
      this.renderSwatches();
    });
    $('origin-grid')?.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-origin]');
      if (!btn) return;
      this.selectOrigin(btn.dataset.origin);
    });
    $('weapon-row')?.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-weapon]');
      if (!btn) return;
      this.profile.weapon = btn.dataset.weapon;
      this.renderWeapons();
      this.refreshPreview();
    });
    $('stat-grid')?.addEventListener('click', (e) => {
      const btn = e.target.closest('button[data-stat]');
      if (!btn) return;
      const stat = btn.dataset.stat;
      const delta = Number(btn.dataset.delta);
      const used = Object.values(this.profile.allocation).reduce((a, b) => a + b, 0);
      if (delta > 0 && used >= 6) return;
      if (delta < 0 && this.profile.allocation[stat] <= 0) return;
      this.profile.allocation[stat] += delta;
      this.renderStats();
      this.refreshPreview();
    });

    $('btn-pause')?.addEventListener('click', () => this.app?.openPause());
    $('btn-map')?.addEventListener('click', () => this.app?.openMap());
    $('btn-resume')?.addEventListener('click', () => this.app?.resume());
    $('btn-save')?.addEventListener('click', () => this.app?.game?.save(true));
    $('btn-quit')?.addEventListener('click', () => this.app?.quitToTitle());
    $('btn-map-close')?.addEventListener('click', () => this.app?.closeMap());
    $('btn-revive')?.addEventListener('click', () => this.app?.game?.revive());
    $('btn-death-title')?.addEventListener('click', () => this.app?.quitToTitle());
    $('btn-ending-continue')?.addEventListener('click', () => this.app?.continueAfterEnding());
    $('btn-ending-title')?.addEventListener('click', () => this.app?.quitToTitle());
    $('btn-capture-cancel')?.addEventListener('click', () => this.app?.game?.cancelCapture());
    $('btn-capture')?.addEventListener('click', () => this.app?.game?.confirmCapture());

    $('pause-tabs')?.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-tab]');
      if (!btn) return;
      this.pauseTab = btn.dataset.tab;
      document.querySelectorAll('#pause-tabs button').forEach((b) => b.classList.toggle('active', b === btn));
      this.renderPause();
    });
    $('pause-content')?.addEventListener('click', (e) => {
      const equip = e.target.closest('[data-equip]');
      if (equip) {
        const [type, id] = equip.dataset.equip.split(':');
        this.app?.game?.equip(type, id);
        this.renderPause();
        return;
      }
      const upgrade = e.target.closest('[data-upgrade]');
      if (upgrade) {
        this.app?.game?.upgrade(upgrade.dataset.upgrade);
        this.renderPause();
        return;
      }
      const creature = e.target.closest('[data-creature]');
      if (creature) {
        this.app?.game?.setActiveCreature(creature.dataset.creature);
        this.renderPause();
        return;
      }
      const skill = e.target.closest('[data-skill]');
      if (skill) {
        this.app?.game?.learnSkill(skill.dataset.skill);
        this.renderPause();
      }
    });

    $('dialogue-overlay')?.addEventListener('click', (e) => {
      if (e.target.closest('.dialogue-choice')) return;
      this.advanceDialogue();
    });
    $('cinematic-next')?.addEventListener('click', () => this.advanceCinematic());
    $('cinematic-overlay')?.addEventListener('click', (e) => {
      if (e.target.closest('button')) return;
      this.advanceCinematic();
    });
    document.querySelectorAll('[data-close]').forEach((btn) => {
      btn.addEventListener('click', () => this.closeModal(btn.dataset.close));
    });
    document.querySelectorAll('.modal').forEach((m) => {
      m.addEventListener('click', (e) => {
        if (e.target === m) this.closeModal(m.id);
      });
    });

    // actions
    const bindAction = (id, action, hold = false) => {
      const el = $(id);
      if (!el) return;
      el.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        e.stopPropagation();
        el.classList.add('pressed');
        if (hold) this.app?.game?.setBlocking(true);
        else this.app?.game?.action(action);
      });
      el.addEventListener('pointerup', (e) => {
        e.preventDefault();
        el.classList.remove('pressed');
        if (hold) this.app?.game?.setBlocking(false);
      });
      el.addEventListener('pointercancel', () => {
        el.classList.remove('pressed');
        if (hold) this.app?.game?.setBlocking(false);
      });
      el.addEventListener('pointerleave', () => {
        if (hold) this.app?.game?.setBlocking(false);
      });
    };
    bindAction('btn-attack', 'attack');
    bindAction('btn-heavy', 'heavy');
    bindAction('btn-dodge', 'dodge');
    bindAction('btn-block', 'block', true);
    bindAction('btn-spell', 'spell');
    bindAction('btn-creature', 'creature');
    bindAction('btn-ultimate', 'ultimate');
    bindAction('btn-potion', 'potion');

    // joystick
    const joystick = $('joystick');
    const knob = $('joystick-knob');
    const updateJoystick = (e) => {
      const rect = joystick.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      let dx = e.clientX - cx;
      let dy = e.clientY - cy;
      const max = rect.width * 0.32;
      const len = Math.hypot(dx, dy);
      if (len > max) {
        dx = (dx / len) * max;
        dy = (dy / len) * max;
      }
      knob.style.transform = `translate(${dx}px, ${dy}px)`;
      this.joystick.x = dx / max;
      this.joystick.y = dy / max;
      this.joystick.active = true;
    };
    joystick?.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      joystick.setPointerCapture(e.pointerId);
      updateJoystick(e);
    });
    joystick?.addEventListener('pointermove', (e) => {
      if (!this.joystick.active) return;
      e.preventDefault();
      updateJoystick(e);
    });
    const resetJoystick = () => {
      this.joystick.x = 0;
      this.joystick.y = 0;
      this.joystick.active = false;
      knob.style.transform = 'translate(0px, 0px)';
    };
    joystick?.addEventListener('pointerup', resetJoystick);
    joystick?.addEventListener('pointercancel', resetJoystick);

    // settings delegation
    document.addEventListener('input', (e) => {
      const input = e.target.closest('[data-setting]');
      if (!input) return;
      const key = input.dataset.setting;
      if (input.type === 'range') {
        this.settings[key] = Number(input.value);
        this.applySettings();
        this.updateSettingsLabels();
      }
    });
    document.addEventListener('change', (e) => {
      const input = e.target.closest('[data-setting]');
      if (!input) return;
      const key = input.dataset.setting;
      if (input.tagName === 'SELECT') {
        this.settings[key] = input.value;
        this.applySettings();
        this.renderSettings();
      }
    });
    document.addEventListener('click', (e) => {
      const toggle = e.target.closest('.toggle[data-setting]');
      if (!toggle) return;
      const key = toggle.dataset.setting;
      this.settings[key] = !this.settings[key];
      this.applySettings();
      this.renderSettings();
      this.app?.audio?.play('ui');
    });

    document.addEventListener('pointerdown', (e) => {
      if (e.target.closest('button')) this.app?.audio?.play('ui');
    }, { passive: true });
  }

  setLoading(show) {
    const el = $('loading-screen');
    if (!el) return;
    if (show) {
      el.classList.remove('hidden');
      el.style.opacity = '1';
    } else {
      el.style.opacity = '0';
      setTimeout(() => el.classList.add('hidden'), 700);
    }
  }

  updateContinueButton() {
    let save = null;
    try {
      save = JSON.parse(localStorage.getItem('laEspadaCelestial.save.v1') || 'null');
    } catch {
      save = null;
    }
    const btn = $('btn-continue');
    const sub = $('continue-sub');
    if (!btn || !sub) return;
    btn.disabled = !save;
    if (save) {
      const name = save.player?.name || 'Aurel';
      const region = REGIONS[save.region]?.name || 'Valdoria';
      sub.textContent = `${name} · Nv. ${save.player?.level || 1} · ${region}`;
    } else {
      sub.textContent = 'No hay una partida guardada';
    }
  }

  showTitle() {
    this.hideAll();
    $('title-screen')?.classList.remove('hidden');
    this.updateContinueButton();
    this.lastScreen = 'title';
  }

  showCreation() {
    this.hideAll();
    this.profile = this.defaultProfile();
    $('char-name').value = this.profile.name;
    $('preview-name').textContent = this.profile.name;
    this.selectOrigin('filo', true);
    this.renderCreation();
    $('creation-screen')?.classList.remove('hidden');
    this.lastScreen = 'creation';
    this.app?.showPreview(this.profile);
  }

  hideAll() {
    ['title-screen', 'creation-screen', 'hud', 'pause-screen', 'map-screen', 'death-screen', 'ending-screen'].forEach((id) => $(id)?.classList.add('hidden'));
    ['dialogue-overlay', 'cinematic-overlay', 'capture-modal'].forEach((id) => $(id)?.classList.add('hidden'));
    document.querySelectorAll('.modal').forEach((m) => m.classList.add('hidden'));
  }

  showHUD() {
    this.hideAll();
    $('hud')?.classList.remove('hidden');
    this.lastScreen = 'game';
  }

  /* ------------------------------------------------------------------ */
  /* Character creation                                                  */
  /* ------------------------------------------------------------------ */

  selectOrigin(id, force = false) {
    const origin = ORIGINS.find((o) => o.id === id) || ORIGINS[0];
    this.profile.origin = origin.id;
    this.profile.weapon = origin.weapon;
    document.querySelectorAll('.origin-card').forEach((c) => c.classList.toggle('active', c.dataset.origin === origin.id));
    $('preview-title').textContent = origin.name;
    this.renderWeapons();
    this.renderStats();
    this.refreshPreview();
  }

  renderCreation() {
    const grid = $('origin-grid');
    if (!grid) return;
    grid.innerHTML = ORIGINS.map((o) => `
      <button class="origin-card ${o.id === this.profile.origin ? 'active' : ''}" data-origin="${o.id}">
        <b>${esc(o.name)}</b>
        <small>${esc(o.desc)}</small>
      </button>`).join('');
    this.renderSwatches();
    this.renderWeapons();
    this.renderStats();
  }

  renderSwatches() {
    const row = $('swatch-row');
    if (!row) return;
    if (this.creationTab === 'hair') {
      row.innerHTML = APPEARANCE.hairStyles.map((s) => `
        <button class="swatch-text ${this.profile.appearance.hairStyle === s.id ? 'active' : ''}" data-hair-style="${s.id}">${esc(s.name)}</button>
      `).join('') + APPEARANCE.hairColors.map((c) => `
        <button class="swatch ${this.profile.appearance.hairColor === c.color ? 'active' : ''}" style="background:${c.color}" title="${esc(c.name)}" data-hair-color="${c.color}"></button>
      `).join('');
      row.querySelectorAll('[data-hair-style]').forEach((b) => b.addEventListener('click', () => {
        this.profile.appearance.hairStyle = b.dataset.hairStyle;
        this.renderSwatches();
        this.refreshPreview();
      }));
      row.querySelectorAll('[data-hair-color]').forEach((b) => b.addEventListener('click', () => {
        this.profile.appearance.hairColor = b.dataset.hairColor;
        this.renderSwatches();
        this.refreshPreview();
      }));
      return;
    }
    if (this.creationTab === 'headgear') {
      row.innerHTML = APPEARANCE.headgear.map((h) => `
        <button class="swatch-text ${this.profile.appearance.headgear === h.id ? 'active' : ''}" data-headgear="${h.id}">${esc(h.name)}</button>
      `).join('');
      row.querySelectorAll('[data-headgear]').forEach((b) => b.addEventListener('click', () => {
        this.profile.appearance.headgear = b.dataset.headgear;
        this.renderSwatches();
        this.refreshPreview();
      }));
      return;
    }
    const config = {
      skin: { list: APPEARANCE.skin, key: 'skinColor' },
      outfit: { list: APPEARANCE.outfitColors, key: 'outfitColor' },
      accent: { list: APPEARANCE.accents, key: 'accentColor' },
    }[this.creationTab];
    if (!config) return;
    row.innerHTML = config.list.map((c) => `
      <button class="swatch ${this.profile.appearance[config.key] === c.color ? 'active' : ''}" style="background:${c.color}" title="${esc(c.name)}" data-color="${c.color}"></button>
    `).join('');
    row.querySelectorAll('[data-color]').forEach((b) => b.addEventListener('click', () => {
      this.profile.appearance[config.key] = b.dataset.color;
      this.renderSwatches();
      this.refreshPreview();
    }));
  }

  renderWeapons() {
    const row = $('weapon-row');
    if (!row) return;
    row.innerHTML = APPEARANCE.weapons.map((id) => {
      const w = WEAPONS[id];
      return `<button class="weapon-card ${this.profile.weapon === id ? 'active' : ''}" data-weapon="${id}">
        <b>${esc(w.name)}</b>
        <small>${esc(w.type)}</small>
        <span class="wstat">ATQ +${w.atk} · VEL ${Math.round(w.speed * 100)}%</span>
      </button>`;
    }).join('');
  }

  getProfileStats() {
    const origin = ORIGINS.find((o) => o.id === this.profile.origin) || ORIGINS[0];
    const stats = {};
    for (const s of STAT_DEFS) stats[s.id] = 3 + (origin.bonuses[s.id] || 0) + (this.profile.allocation[s.id] || 0);
    const w = WEAPONS[this.profile.weapon] || WEAPONS.filo_aurora;
    const a = ARMORS[this.profile.armor] || ARMORS.tunica_viajero;
    return {
      stats,
      maxHp: Math.round(80 + stats.vitalidad * 8 + a.hp),
      maxMp: Math.round(40 + stats.resonancia * 6 + a.mp),
      maxSp: Math.round(60 + stats.resistencia * 5),
      attack: Math.round(8 + stats.fuerza * 2.2 + w.atk),
      defense: Math.round(3 + stats.defensa * 1.6 + stats.resistencia * 0.5 + a.def),
    };
  }

  renderStats() {
    const grid = $('stat-grid');
    if (!grid) return;
    const origin = ORIGINS.find((o) => o.id === this.profile.origin) || ORIGINS[0];
    const used = Object.values(this.profile.allocation).reduce((a, b) => a + b, 0);
    $('points-label').textContent = `${6 - used} puntos libres`;
    grid.innerHTML = STAT_DEFS.map((s) => {
      const base = 3 + (origin.bonuses[s.id] || 0);
      const alloc = this.profile.allocation[s.id] || 0;
      return `<div class="stat-row">
        <span class="stat-name" title="${esc(s.desc)}">${esc(s.name)}</span>
        <button data-stat="${s.id}" data-delta="-1" ${alloc <= 0 ? 'disabled' : ''} aria-label="Quitar ${esc(s.name)}">−</button>
        <span class="stat-value">${base + alloc}</span>
        <button data-stat="${s.id}" data-delta="1" ${used >= 6 ? 'disabled' : ''} aria-label="Añadir ${esc(s.name)}">+</button>
      </div>`;
    }).join('');
    const d = this.getProfileStats();
    const el = $('preview-stats');
    if (el) {
      el.innerHTML = `
        <div class="preview-stat"><span>Vida</span><b>${d.maxHp}</b></div>
        <div class="preview-stat"><span>Maná</span><b>${d.maxMp}</b></div>
        <div class="preview-stat"><span>Ataque</span><b>${d.attack}</b></div>
        <div class="preview-stat"><span>Defensa</span><b>${d.defense}</b></div>`;
    }
  }

  refreshPreview() {
    if (!this.app) return;
    const profile = this.getFullProfile();
    $('preview-name').textContent = profile.name;
    this.app.showPreview(profile);
  }

  getFullProfile() {
    const d = this.getProfileStats();
    return {
      name: this.profile.name,
      origin: this.profile.origin,
      appearance: { ...this.profile.appearance },
      weapon: this.profile.weapon,
      armor: this.profile.armor,
      headgear: this.profile.appearance.headgear,
      stats: d.stats,
      maxHp: d.maxHp,
      maxMp: d.maxMp,
      maxSp: d.maxSp,
      attack: d.attack,
      defense: d.defense,
    };
  }

  startAdventure() {
    const profile = this.getFullProfile();
    if (!profile.name || profile.name.trim().length < 2) {
      this.toast('Nombre incompleto', 'Escribe al menos dos letras.', 'error');
      return;
    }
    this.app?.startNewGame(profile);
  }

  /* ------------------------------------------------------------------ */
  /* HUD                                                                 */
  /* ------------------------------------------------------------------ */

  updateHUD(game, dt) {
    if (!game || !game.state) return;
    const s = game.state;
    const p = s.player;
    const stats = game.getStats();
    const hp = Math.max(0, Math.round(p.hp));
    const mp = Math.max(0, Math.round(p.mp));
    const sp = Math.max(0, Math.round(p.sp));
    if (this.hudCache.hp !== hp || this.hudCache.maxHp !== stats.maxHp) {
      $('hp-fill').style.width = `${Math.max(0, (hp / stats.maxHp) * 100)}%`;
      $('hp-text').textContent = `${hp} / ${stats.maxHp}`;
      this.hudCache.hp = hp;
      this.hudCache.maxHp = stats.maxHp;
    }
    if (this.hudCache.mp !== mp || this.hudCache.maxMp !== stats.maxMp) {
      $('mp-fill').style.width = `${Math.max(0, (mp / stats.maxMp) * 100)}%`;
      this.hudCache.mp = mp;
      this.hudCache.maxMp = stats.maxMp;
    }
    if (this.hudCache.sp !== sp || this.hudCache.maxSp !== stats.maxSp) {
      $('sp-fill').style.width = `${Math.max(0, (sp / stats.maxSp) * 100)}%`;
      this.hudCache.sp = sp;
      this.hudCache.maxSp = stats.maxSp;
    }
    const xpPct = Math.min(100, (p.xp / p.xpNext) * 100);
    if (this.hudCache.xp !== xpPct) {
      $('xp-fill').style.width = `${xpPct}%`;
      this.hudCache.xp = xpPct;
    }
    if (this.hudCache.level !== p.level) {
      $('hud-level').textContent = `Nv. ${p.level}`;
      $('hud-player-name').textContent = p.name;
      $('player-initial').textContent = p.name.charAt(0).toUpperCase();
      this.hudCache.level = p.level;
    }
    if (this.hudCache.region !== s.region) {
      $('region-name').textContent = REGIONS[s.region]?.name || 'AETHERIA';
      $('region-epithet').textContent = REGIONS[s.region]?.epithet || '';
      this.hudCache.region = s.region;
    }
    const q = game.getQuestInfo();
    const qKey = JSON.stringify(q);
    if (this.questCache !== qKey) {
      $('quest-kind').textContent = q.kind || 'MISIÓN PRINCIPAL';
      $('quest-step').textContent = q.step || 'I';
      $('quest-title').textContent = q.title || '';
      $('quest-objective').textContent = q.objective || '';
      const prog = $('quest-progress');
      if (q.total) {
        prog.classList.remove('hidden');
        $('quest-progress-fill').style.width = `${Math.min(100, (q.progress / q.total) * 100)}%`;
        $('quest-objective').textContent = `${q.objective} (${q.progress}/${q.total})`;
      } else {
        prog.classList.add('hidden');
      }
      this.questCache = qKey;
    }
    const active = s.creatures.find((c) => c.active);
    const activeKey = active ? `${active.id}:${active.level}` : 'none';
    if (this.hudCache.active !== activeKey) {
      if (active) {
        const species = CREATURES[active.id];
        $('companion-name').textContent = `${species.name} · Nv. ${active.level}`;
        $('companion-skill').textContent = species.skill.name;
      } else {
        $('companion-name').textContent = 'Sin eco activo';
        $('companion-skill').textContent = 'Abre el diario para invocar un eco';
      }
      this.hudCache.active = activeKey;
    }
    const potions = s.inventory.pocion_luz || 0;
    if (this.hudCache.potions !== potions) {
      $('potion-count').textContent = potions;
      this.hudCache.potions = potions;
    }
    const cds = game.getCooldowns();
    const spellEl = $('spell-cooldown');
    if (spellEl) {
      const ratio = cds.spell > 0 ? cds.spell / cds.spellMax : 0;
      spellEl.style.background = ratio > 0
        ? `conic-gradient(rgba(126,232,250,.55) ${ratio * 360}deg, transparent ${ratio * 360}deg)`
        : 'conic-gradient(transparent 0deg, transparent 360deg)';
    }
    $('btn-ultimate')?.classList.toggle('hidden', !game.hasUltimate());
    $('btn-block')?.classList.toggle('active', !!game.player?.blocking);
    if (dt) {
      this.lastMinimap += dt;
      if (this.lastMinimap > 0.12) {
        this.drawMinimap(game);
        this.lastMinimap = 0;
      }
    }
  }

  showInteraction(text) {
    if (this.interactionCache === text) return;
    this.interactionCache = text;
    const el = $('interaction-prompt');
    if (!text) {
      el.classList.add('hidden');
    } else {
      $('interaction-text').textContent = text;
      el.classList.remove('hidden');
    }
  }

  showBoss(name, hp, maxHp, phase) {
    const key = `${name}:${Math.round(hp)}:${phase}`;
    if (this.bossCache === key) return;
    this.bossCache = key;
    $('boss-bar').classList.remove('hidden');
    $('boss-name').textContent = name.toUpperCase();
    $('boss-hp-fill').style.width = `${Math.max(0, (hp / maxHp) * 100)}%`;
    $('boss-phase').textContent = phase > 1 ? 'FASE II' : 'FASE I';
  }

  hideBoss() {
    this.bossCache = '';
    $('boss-bar')?.classList.add('hidden');
  }

  showCombo(count) {
    const el = $('combo-display');
    if (count < 2) {
      el.classList.add('hidden');
      return;
    }
    $('combo-count').textContent = count;
    el.classList.remove('hidden');
    clearTimeout(this.comboTimer);
    this.comboTimer = setTimeout(() => el.classList.add('hidden'), 1500);
  }

  spawnDamage(screen, text, kind = '') {
    if (!this.settings.damageNumbers) return;
    const layer = $('damage-layer');
    if (!layer || !screen?.visible) return;
    if (layer.childElementCount > 26) layer.firstElementChild?.remove();
    const el = document.createElement('div');
    el.className = `damage-number ${kind}`;
    el.textContent = text;
    el.style.left = `${screen.x}px`;
    el.style.top = `${screen.y}px`;
    layer.appendChild(el);
    setTimeout(() => el.remove(), 1000);
  }

  toast(title, text, kind = '') {
    const layer = $('toast-layer');
    if (!layer) return;
    while (layer.childElementCount >= 4) layer.firstElementChild?.remove();
    const el = document.createElement('div');
    el.className = `toast ${kind}`;
    el.innerHTML = `<span class="toast-icon">${kind === 'capture' ? '✦' : kind === 'level' ? '✧' : '◈'}</span><span class="toast-text"><b>${esc(title)}</b><small>${esc(text)}</small></span>`;
    layer.appendChild(el);
    setTimeout(() => el.remove(), 3800);
  }

  /* ------------------------------------------------------------------ */
  /* Dialogue                                                            */
  /* ------------------------------------------------------------------ */

  showDialogue(dialogue) {
    this.dialogue = dialogue;
    this.dialogueIndex = 0;
    this.dialogueFullText = '';
    this.dialogueTyping = false;
    $('dialogue-overlay').classList.remove('hidden');
    $('dialogue-speaker').textContent = (dialogue.speaker || 'AETHERIA').toUpperCase();
    $('dialogue-portrait').innerHTML = dialogue.portrait === 'creature'
      ? creaturePortraitSVG(CREATURES[dialogue.creature] || CREATURES.lumi)
      : portraitSVG(dialogue.portrait || 'player', dialogue.appearance || {}, dialogue);
    $('dialogue-choices').classList.add('hidden');
    $('dialogue-choices').innerHTML = '';
    this.showDialogueLine();
  }

  showDialogueLine() {
    if (!this.dialogue) return;
    const line = this.dialogue.lines[this.dialogueIndex];
    if (!line) {
      this.finishDialogue();
      return;
    }
    $('dialogue-choices').classList.add('hidden');
    $('dialogue-continue').classList.remove('hidden');
    this.typeText($('dialogue-text'), line, () => {
      const isLast = this.dialogueIndex >= this.dialogue.lines.length - 1;
      if (isLast && this.dialogue.choices?.length) {
        $('dialogue-continue').classList.add('hidden');
        const choices = $('dialogue-choices');
        choices.innerHTML = this.dialogue.choices.map((c, i) => `
          <button class="dialogue-choice" data-choice="${i}" ${c.disabled ? 'disabled' : ''}><b>${i + 1}.</b>${esc(c.label)}</button>
        `).join('');
        choices.classList.remove('hidden');
        choices.querySelectorAll('[data-choice]').forEach((btn) => {
          btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const choice = this.dialogue.choices[Number(btn.dataset.choice)];
            this.finishDialogue(choice);
          });
        });
      }
    });
  }

  typeText(el, text, done) {
    clearInterval(this.dialogueTimer);
    this.dialogueFullText = text;
    this.dialogueTyping = true;
    if (this.settings.reduceMotion) {
      el.textContent = text;
      this.dialogueTyping = false;
      done?.();
      return;
    }
    el.textContent = '';
    let i = 0;
    this.dialogueTimer = setInterval(() => {
      i += 2;
      el.textContent = text.slice(0, i);
      if (i >= text.length) {
        clearInterval(this.dialogueTimer);
        this.dialogueTyping = false;
        done?.();
      }
    }, 15);
  }

  advanceDialogue() {
    if (!this.dialogue) return;
    if (this.dialogueTyping) {
      clearInterval(this.dialogueTimer);
      this.dialogueTyping = false;
      $('dialogue-text').textContent = this.dialogueFullText;
      const isLast = this.dialogueIndex >= this.dialogue.lines.length - 1;
      if (isLast && this.dialogue.choices?.length) {
        this.showDialogueLine();
      }
      return;
    }
    if (this.dialogueIndex < this.dialogue.lines.length - 1) {
      this.dialogueIndex++;
      this.showDialogueLine();
    } else if (!this.dialogue.choices?.length) {
      this.finishDialogue();
    }
  }

  finishDialogue(choice = null) {
    clearInterval(this.dialogueTimer);
    const d = this.dialogue;
    this.dialogue = null;
    this.dialogueTyping = false;
    $('dialogue-overlay').classList.add('hidden');
    d?.onEnd?.(choice);
  }

  /* ------------------------------------------------------------------ */
  /* Cinematic                                                           */
  /* ------------------------------------------------------------------ */

  showCinematic(data) {
    this.cinematic = data;
    this.cinematicIndex = 0;
    this.cinematicTyping = false;
    $('cinematic-overlay').classList.remove('hidden');
    $('cinematic-kicker').textContent = data.kicker || 'CAPÍTULO';
    $('cinematic-title').textContent = data.title || '';
    this.showCinematicLine();
  }

  showCinematicLine() {
    if (!this.cinematic) return;
    const line = this.cinematic.lines[this.cinematicIndex];
    if (!line) {
      this.finishCinematic();
      return;
    }
    clearInterval(this.cinematicTimer);
    const el = $('cinematic-line');
    this.cinematicTyping = true;
    if (this.settings.reduceMotion) {
      el.textContent = line;
      this.cinematicTyping = false;
      return;
    }
    el.textContent = '';
    let i = 0;
    this.cinematicTimer = setInterval(() => {
      i += 2;
      el.textContent = line.slice(0, i);
      if (i >= line.length) {
        clearInterval(this.cinematicTimer);
        this.cinematicTyping = false;
      }
    }, 18);
  }

  advanceCinematic() {
    if (!this.cinematic) return;
    if (this.cinematicTyping) {
      clearInterval(this.cinematicTimer);
      this.cinematicTyping = false;
      $('cinematic-line').textContent = this.cinematic.lines[this.cinematicIndex];
      return;
    }
    if (this.cinematicIndex < this.cinematic.lines.length - 1) {
      this.cinematicIndex++;
      this.showCinematicLine();
    } else {
      this.finishCinematic();
    }
  }

  finishCinematic() {
    clearInterval(this.cinematicTimer);
    const c = this.cinematic;
    this.cinematic = null;
    this.cinematicTyping = false;
    $('cinematic-overlay').classList.add('hidden');
    c?.onEnd?.();
  }

  /* ------------------------------------------------------------------ */
  /* Pause                                                               */
  /* ------------------------------------------------------------------ */

  openPause(tab = 'status') {
    this.pauseTab = tab;
    document.querySelectorAll('#pause-tabs button').forEach((b) => b.classList.toggle('active', b.dataset.tab === tab));
    this.renderPause();
    $('pause-screen').classList.remove('hidden');
  }

  closePause() {
    $('pause-screen').classList.add('hidden');
  }

  renderPause() {
    const game = this.app?.game;
    if (!game) return;
    const s = game.state;
    const p = s.player;
    const stats = game.getStats();
    $('pause-name').textContent = p.name;
    $('pause-subtitle').textContent = `Nv. ${p.level} · ${REGIONS[s.region]?.name || 'Aetheria'} · ${formatTime(s.playTime)}`;
    $('pause-portrait').innerHTML = portraitSVG('player', { ...p.appearance, name: p.name });
    const content = $('pause-content');
    if (this.pauseTab === 'status') content.innerHTML = this.statusHTML(game, stats);
    else if (this.pauseTab === 'equipment') content.innerHTML = this.equipmentHTML(game, stats);
    else if (this.pauseTab === 'creatures') content.innerHTML = this.creaturesHTML(game);
    else if (this.pauseTab === 'skills') content.innerHTML = this.skillsHTML(game);
    else if (this.pauseTab === 'journal') content.innerHTML = this.journalHTML(game);
    else if (this.pauseTab === 'settings') content.innerHTML = this.settingsHTML();
    if (this.pauseTab === 'settings') this.updateSettingsLabels();
  }

  statusHTML(game, stats) {
    const s = game.state;
    const p = s.player;
    const weapon = WEAPONS[p.weapon] || WEAPONS.filo_aurora;
    const armor = ARMORS[p.armor] || ARMORS.tunica_viajero;
    const charm = p.charm ? CHARMS[p.charm] : null;
    const q = game.getQuestInfo();
    return `<div class="menu-grid">
      <div class="panel">
        <h3>Portador</h3>
        <div class="big-stats">
          <div class="big-stat"><span>Vida</span><b>${Math.round(p.hp)} / ${stats.maxHp}</b></div>
          <div class="big-stat"><span>Resonancia</span><b>${Math.round(p.mp)} / ${stats.maxMp}</b></div>
          <div class="big-stat"><span>Aguante</span><b>${Math.round(p.sp)} / ${stats.maxSp}</b></div>
          <div class="big-stat"><span>Ataque</span><b>${stats.attack}</b></div>
          <div class="big-stat"><span>Defensa</span><b>${stats.defense}</b></div>
          <div class="big-stat"><span>Crítico</span><b>${Math.round(stats.crit * 100)}%</b></div>
        </div>
        <h4>Equipamiento</h4>
        <div class="stat-line"><span>${esc(weapon.name)}</span><b>+${weapon.atk} ATQ</b></div>
        <div class="stat-line"><span>${esc(armor.name)}</span><b>+${armor.def} DEF</b></div>
        <div class="stat-line"><span>${charm ? esc(charm.name) : 'Sin talismán'}</span><b>${charm ? 'Activo' : '—'}</b></div>
        <h4>Progreso</h4>
        <div class="stat-line"><span>Misión actual</span><b>${esc(q.title)}</b></div>
        <div class="stat-line"><span>Ecos capturados</span><b>${s.creatures.length} / ${Object.keys(CREATURES).length}</b></div>
        <div class="stat-line"><span>Tiempo de juego</span><b>${formatTime(s.playTime)}</b></div>
      </div>
      <div class="panel">
        <h3>Atributos</h3>
        <div class="stat-list">
          ${STAT_DEFS.map((d) => `<div class="stat-line"><span>${esc(d.name)}</span><b>${stats.stats[d.id]}</b></div>`).join('')}
        </div>
        <h4>Recursos</h4>
        <div class="stat-line"><span>Esencia de Eco</span><b>${s.inventory.esencia_eco || 0}</b></div>
        <div class="stat-line"><span>Fragmentos de cielo</span><b>${s.inventory.fragmentos || 0}</b></div>
        <div class="stat-line"><span>Pociones de Luz</span><b>${s.inventory.pocion_luz || 0}</b></div>
        <div class="stat-line"><span>Cristales de Resonancia</span><b>${s.inventory.cristal_resonancia || 0}</b></div>
        <h4>Eco activo</h4>
        <p>${s.creatures.find((c) => c.active) ? esc(CREATURES[s.creatures.find((c) => c.active).id].name) + ' — ' + esc(CREATURES[s.creatures.find((c) => c.active).id].skill.name) : 'Ningún eco acompaña al portador. Visita la pestaña Ecos.'}</p>
      </div>
    </div>`;
  }

  equipmentHTML(game, stats) {
    const p = game.state.player;
    const w = WEAPONS[p.weapon];
    const a = ARMORS[p.armor];
    const c = p.charm ? CHARMS[p.charm] : null;
    const allWeapons = Object.values(WEAPONS).filter((x) => game.state.ownedWeapons.includes(x.id));
    const allArmors = Object.values(ARMORS).filter((x) => game.state.ownedArmors.includes(x.id));
    const allCharms = Object.values(CHARMS).filter((x) => game.state.ownedCharms.includes(x.id));
    return `<div class="menu-grid">
      <div class="panel">
        <h3>Arma</h3>
        <div class="equip-grid" style="grid-template-columns:1fr 1fr">
          ${allWeapons.map((item) => this.equipCard('weapon', item, p.weapon === item.id, `+${item.atk} ATQ · VEL ${Math.round(item.speed * 100)}%`, game)).join('')}
        </div>
        <h4>Armadura</h4>
        <div class="equip-grid" style="grid-template-columns:1fr 1fr">
          ${allArmors.map((item) => this.equipCard('armor', item, p.armor === item.id, `+${item.def} DEF · +${item.hp} VIDA`, game)).join('')}
        </div>
        <h4>Talismán</h4>
        <div class="equip-grid" style="grid-template-columns:1fr 1fr">
          ${allCharms.map((item) => this.equipCard('charm', item, p.charm === item.id, item.desc, game)).join('')}
        </div>
      </div>
      <div class="panel">
        <h3>Forja</h3>
        <p>La Espada recuerda cada forma que ha llevado. Mejora tu equipo con fragmentos de cielo y esencia de eco.</p>
        <h4>Arma equipada</h4>
        <div class="stat-line"><span>${esc(w.name)}</span><b>+${w.atk + (game.state.upgrades.weapon || 0) * 2} ATQ</b></div>
        <div class="stat-line"><span>Mejora</span><b>Nv. ${game.state.upgrades.weapon || 0} / 3</b></div>
        <button class="ghost-button" data-upgrade="weapon" style="margin-top:10px;width:100%">Mejorar arma · ${game.upgradeCost('weapon')} fragmentos</button>
        <h4>Armadura equipada</h4>
        <div class="stat-line"><span>${esc(a.name)}</span><b>+${a.def + (game.state.upgrades.armor || 0)} DEF</b></div>
        <div class="stat-line"><span>Mejora</span><b>Nv. ${game.state.upgrades.armor || 0} / 3</b></div>
        <button class="ghost-button" data-upgrade="armor" style="margin-top:10px;width:100%">Mejorar armadura · ${game.upgradeCost('armor')} fragmentos</button>
        <h4>Recursos</h4>
        <div class="stat-line"><span>Fragmentos de cielo</span><b>${game.state.inventory.fragmentos || 0}</b></div>
        <div class="stat-line"><span>Esencia de Eco</span><b>${game.state.inventory.esencia_eco || 0}</b></div>
      </div>
    </div>`;
  }

  equipCard(type, item, selected, statLine, game) {
    const isWeapon = type === 'weapon';
    const isArmor = type === 'armor';
    const equipped = selected;
    return `<div class="equip-card ${equipped ? 'selected' : ''}">
      <div class="rarity">${esc(item.rarity || 'Común')}</div>
      <b>${esc(item.name)}</b>
      <p>${esc(item.desc)}</p>
      <span class="stat-tag">${esc(statLine)}</span>
      <button data-equip="${type}:${item.id}">${equipped ? 'Equipado' : 'Equipar'}</button>
    </div>`;
  }

  creaturesHTML(game) {
    const owned = new Set(game.state.creatures.map((c) => c.id));
    return `<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
      <p style="max-width:70%">Los ecos salvajes pueden resonar contigo si te acercas y ofreces esencia. Un eco activo te acompaña en combate y otorga un pasivo.</p>
      <span class="eyebrow">${owned.size} / ${Object.keys(CREATURES).length} DESCUBIERTOS</span>
    </div>
    <div class="creature-grid">
      ${Object.values(CREATURES).map((c) => {
        const isOwned = owned.has(c.id);
        const inst = game.state.creatures.find((x) => x.id === c.id);
        return `<div class="creature-card ${isOwned ? 'owned' : 'locked'} ${inst?.active ? 'active' : ''}">
          ${!isOwned ? '<span class="lock-mark">?</span>' : ''}
          <div class="creature-type">${esc(c.type)} · ${esc(c.rarity)}</div>
          <b>${isOwned ? esc(c.name) : 'Eco desconocido'}</b>
          <div class="creature-title">${isOwned ? esc(c.title) : 'Aún no resonado'}</div>
          <p>${isOwned ? esc(c.desc) : 'Encuéntralo en el mundo y ofrece tu esencia para descubrir su nombre.'}</p>
          ${isOwned ? `<div class="stat-line" style="margin-top:6px"><span>Pasivo</span><b>${esc(c.passive)}</b></div>
          <div class="stat-line"><span>Habilidad</span><b>${esc(c.skill.name)}</b></div>
          <div class="creature-actions"><button data-creature="${c.id}">${inst?.active ? 'Activo' : 'Invocar'}</button></div>` : ''}
        </div>`;
      }).join('')}
    </div>`;
  }

  skillsHTML(game) {
    const p = game.state.player;
    return `<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
      <p>La Espada crece contigo. Gana puntos de habilidad al subir de nivel y elige qué parte de su juramento despiertas.</p>
      <span class="eyebrow">${p.skillPoints} PUNTOS DISPONIBLES</span>
    </div>
    <div class="skill-grid">
      ${SKILLS.map((sk) => {
        const rank = game.state.skills[sk.id] || 0;
        const maxed = rank >= sk.max;
        return `<div class="skill-card ${maxed ? 'maxed' : ''}">
          <div class="skill-head"><b>${esc(sk.name)}</b><span class="skill-rank">${rank} / ${sk.max}</span></div>
          <p>${esc(sk.desc)}</p>
          <button data-skill="${sk.id}" ${maxed || p.skillPoints <= 0 ? 'disabled' : ''}>${maxed ? 'Completa' : 'Aprender · 1 punto'}</button>
        </div>`;
      }).join('')}
    </div>
    <div class="panel" style="margin-top:14px">
      <h3>Habilidades activas</h3>
      <div class="stat-line"><span>Onda de Aurora</span><b>R · 22 maná</b></div>
      <div class="stat-line"><span>Juicio Celestial</span><b>${game.hasUltimate() ? 'F · Desbloqueado' : 'F · Requiere la habilidad Juicio'}</b></div>
      <div class="stat-line"><span>Eco activo</span><b>C · ${game.state.creatures.find((c) => c.active) ? esc(CREATURES[game.state.creatures.find((c) => c.active).id].skill.name) : 'Sin eco'}</b></div>
    </div>`;
  }

  journalHTML(game) {
    const s = game.state;
    const main = MAIN_STAGES[s.mainStage];
    const side = Object.values(SIDE_QUESTS).filter((q) => s.sideQuests[q.id]?.started);
    return `<div class="menu-grid">
      <div class="panel">
        <h3>Diario de la Espada</h3>
        <div class="journal-list">
          <div class="journal-item ${s.mainStage >= 13 ? 'done' : ''}">
            <span class="journal-tag">Misión principal · ${s.mainStage + 1} / ${MAIN_STAGES.length}</span>
            <h4>${esc(main?.title || 'La Espada Celestial')}</h4>
            <p>${esc(game.getQuestInfo().objective)}</p>
          </div>
          ${side.length ? side.map((q) => {
            const st = s.sideQuests[q.id];
            const done = st.progress >= q.target;
            return `<div class="journal-item ${done ? 'done' : ''}">
              <span class="journal-tag">${done ? 'Completada' : 'Misión secundaria'}</span>
              <h4>${esc(q.name)}</h4>
              <p>${esc(q.desc)}</p>
              <p style="color:var(--gold);margin-top:4px">${esc(q.objective)} (${Math.min(st.progress, q.target)}/${q.target})</p>
            </div>`;
          }).join('') : '<p style="font-size:.58rem;color:var(--muted-2)">Los habitantes de Aetheria tienen historias que contar. Habla con ellos.</p>'}
        </div>
      </div>
      <div class="panel">
        <h3>Ecos del pasado</h3>
        <div class="lore-list">
          ${LORE.map((l) => {
            const found = s.lore.includes(l.id);
            return `<div class="lore-item" style="${found ? '' : 'opacity:.45'}">
              <b>${found ? esc(l.name) : '???'}</b>
              ${found ? esc(l.text.slice(0, 105)) + '…' : 'Un recuerdo aún oculto en Aetheria.'}
            </div>`;
          }).join('')}
        </div>
        <h4>Registro</h4>
        <div class="stat-line"><span>Enemigos derrotados</span><b>${s.stats.kills || 0}</b></div>
        <div class="stat-line"><span>Ecos capturados</span><b>${s.creatures.length}</b></div>
        <div class="stat-line"><span>Cofres abiertos</span><b>${s.stats.chests || 0}</b></div>
        <div class="stat-line"><span>Misiones completadas</span><b>${s.stats.quests || 0}</b></div>
        <div class="stat-line"><span>Tiempo de juego</span><b>${formatTime(s.playTime)}</b></div>
      </div>
    </div>`;
  }

  /* ------------------------------------------------------------------ */
  /* Settings                                                            */
  /* ------------------------------------------------------------------ */

  settingsHTML() {
    return `<div class="settings-list">
      ${this.settingRow('Música', 'Composición procedural del mundo', 'music', 'range', 0, 1, 0.01)}
      ${this.settingRow('Efectos de sonido', 'Golpes, pasos y resonancia', 'sfx', 'range', 0, 1, 0.01)}
      ${this.settingRow('Calidad gráfica', 'Ajusta sombras y resolución interna', 'quality', 'select', null, null, null, [
        ['auto', 'Automática'], ['alta', 'Alta'], ['media', 'Media'], ['baja', 'Baja'],
      ])}
      ${this.settingRow('Tamaño del texto', 'Interfaz más legible', 'fontScale', 'range', 0.9, 1.25, 0.01)}
      ${this.settingRow('Reducir movimiento', 'Menos sacudidas y animaciones', 'reduceMotion', 'toggle')}
      ${this.settingRow('Alto contraste', 'Bordes y textos más visibles', 'highContrast', 'toggle')}
      ${this.settingRow('Números de daño', 'Muestra el daño infligido', 'damageNumbers', 'toggle')}
      ${this.settingRow('Fijado automático', 'Orienta los ataques al enemigo cercano', 'autoTarget', 'toggle')}
      ${this.settingRow('Sacudida de cámara', 'Impacto cinematográfico', 'screenShake', 'toggle')}
      ${this.settingRow('Controles para zurdos', 'Invierte joystick y acciones', 'leftHanded', 'toggle')}
    </div>`;
  }

  settingRow(label, desc, key, type, min, max, step, options) {
    const value = this.settings[key];
    let control = '';
    if (type === 'range') {
      control = `<input type="range" min="${min}" max="${max}" step="${step}" value="${value}" data-setting="${key}" aria-label="${esc(label)}" />`;
    } else if (type === 'toggle') {
      control = `<button class="toggle ${value ? 'on' : ''}" data-setting="${key}" aria-label="${esc(label)}"></button>`;
    } else if (type === 'select') {
      control = `<select data-setting="${key}" aria-label="${esc(label)}">${options.map(([v, l]) => `<option value="${v}" ${value === v ? 'selected' : ''}>${esc(l)}</option>`).join('')}</select>`;
    }
    return `<div class="setting-row"><div class="setting-copy"><b>${esc(label)}</b><small>${esc(desc)}</small></div>${control}</div>`;
  }

  updateSettingsLabels() {
    document.querySelectorAll('[data-setting]').forEach((el) => {
      if (el.type === 'range') {
        const key = el.dataset.setting;
        if (Number(el.value) !== Number(this.settings[key])) el.value = this.settings[key];
      }
    });
  }

  renderSettings() {
    const modal = $('settings-grid');
    if (modal) modal.innerHTML = this.settingsHTML();
    const pause = $('pause-content');
    if (pause && this.pauseTab === 'settings') pause.innerHTML = this.settingsHTML();
    this.updateSettingsLabels();
  }

  openModal(id) {
    $(id)?.classList.remove('hidden');
    if (id === 'settings-modal') this.renderSettings();
    this.app?.audio?.play('ui');
  }

  closeModal(id) {
    $(id)?.classList.add('hidden');
    this.app?.audio?.play('ui');
  }

  /* ------------------------------------------------------------------ */
  /* Map                                                                 */
  /* ------------------------------------------------------------------ */

  openMap() {
    this.renderMap();
    $('map-screen').classList.remove('hidden');
  }

  closeMap() {
    $('map-screen').classList.add('hidden');
  }

  renderMap() {
    const game = this.app?.game;
    if (!game) return;
    this.drawWorldMap(game);
    const s = game.state;
    const sidebar = $('map-sidebar');
    if (!sidebar) return;
    const current = s.region;
    const unlocked = s.unlockedRegions;
    const regionOrder = ['valdoria', 'drakmor', 'kansordore'];
    sidebar.innerHTML = regionOrder.map((id) => {
      const r = REGIONS[id];
      const isCurrent = id === current;
      const isUnlocked = unlocked.includes(id);
      return `<div class="region-card ${isCurrent ? 'current' : ''} ${isUnlocked ? 'unlocked' : 'locked'}">
        <h3>${esc(r.name)}</h3>
        <p>${esc(r.description)}</p>
        <div class="region-meta"><span>${esc(r.level)}</span><span>${isCurrent ? 'ESTÁS AQUÍ' : isUnlocked ? 'DESBLOQUEADA' : 'BLOQUEADA'}</span></div>
        ${!isCurrent && isUnlocked ? `<button data-travel="${id}">Viajar a ${esc(r.name)}</button>` : ''}
        ${!isUnlocked ? `<button disabled>${id === 'drakmor' ? 'Derrota al Guardián Astado' : 'Derrota a la Reina Ceniza'}</button>` : ''}
      </div>`;
    }).join('') + `<div class="map-note">El viaje rápido te lleva al altar de la región. La Convergencia no espera.</div>`;
    sidebar.querySelectorAll('[data-travel]').forEach((b) => {
      b.addEventListener('click', () => this.app?.game?.travelTo(b.dataset.travel));
    });
  }

  drawWorldMap(game) {
    const canvas = $('world-map');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    const bg = ctx.createRadialGradient(w * 0.5, h * 0.45, 40, w * 0.5, h * 0.5, w * 0.7);
    bg.addColorStop(0, '#12233c');
    bg.addColorStop(0.6, '#081426');
    bg.addColorStop(1, '#040a13');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);

    // grid
    ctx.strokeStyle = 'rgba(126,232,250,0.045)';
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 45) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
    }
    for (let y = 0; y < h; y += 45) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
    }

    const nodes = {
      valdoria: { x: 250, y: 420 },
      drakmor: { x: 500, y: 300 },
      kansordore: { x: 690, y: 165 },
    };
    const paths = [['valdoria', 'drakmor'], ['drakmor', 'kansordore']];
    ctx.setLineDash([6, 8]);
    ctx.strokeStyle = 'rgba(244,213,141,0.3)';
    ctx.lineWidth = 2;
    for (const [a, b] of paths) {
      ctx.beginPath();
      const A = nodes[a];
      const B = nodes[b];
      ctx.moveTo(A.x, A.y);
      ctx.quadraticCurveTo((A.x + B.x) / 2, Math.min(A.y, B.y) - 55, B.x, B.y);
      ctx.stroke();
    }
    ctx.setLineDash([]);

    const drawLand = (cx, cy, rx, ry, color, seed) => {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.beginPath();
      const rng = (n) => Math.sin(seed * 12.9898 + n * 78.233) * 43758.5453 % 1;
      for (let i = 0; i <= 40; i++) {
        const a = (i / 40) * Math.PI * 2;
        const r = 0.82 + Math.abs(rng(i)) * 0.3;
        const x = Math.cos(a) * rx * r;
        const y = Math.sin(a) * ry * r;
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.closePath();
      const g = ctx.createRadialGradient(0, -ry * 0.2, 10, 0, 0, rx);
      g.addColorStop(0, color);
      g.addColorStop(1, '#07111f');
      ctx.fillStyle = g;
      ctx.fill();
      ctx.strokeStyle = 'rgba(244,213,141,0.18)';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.restore();
    };
    drawLand(nodes.valdoria.x, nodes.valdoria.y, 150, 105, '#2d4b3c', 3);
    drawLand(nodes.drakmor.x, nodes.drakmor.y, 128, 90, '#4a2727', 7);
    drawLand(nodes.kansordore.x, nodes.kansordore.y, 120, 82, '#3d3b62', 11);

    const unlocked = game.state.unlockedRegions;
    const current = game.state.region;
    for (const id of ['valdoria', 'drakmor', 'kansordore']) {
      const n = nodes[id];
      const r = REGIONS[id];
      const isUnlocked = unlocked.includes(id);
      const isCurrent = id === current;
      ctx.save();
      ctx.translate(n.x, n.y);
      if (isUnlocked) {
        const pulse = 1 + Math.sin(performance.now() / 500 + n.x) * 0.08;
        const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, 44 * pulse);
        glow.addColorStop(0, isCurrent ? 'rgba(244,213,141,0.42)' : 'rgba(126,232,250,0.22)');
        glow.addColorStop(1, 'rgba(126,232,250,0)');
        ctx.fillStyle = glow;
        ctx.beginPath(); ctx.arc(0, 0, 44 * pulse, 0, Math.PI * 2); ctx.fill();
      }
      ctx.beginPath();
      ctx.arc(0, 0, isCurrent ? 9 : 7, 0, Math.PI * 2);
      ctx.fillStyle = isUnlocked ? (isCurrent ? '#f4d58d' : '#7ee8fa') : '#4e5869';
      ctx.fill();
      ctx.strokeStyle = isCurrent ? '#fff2c4' : 'rgba(255,255,255,.4)';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.font = '600 22px Cinzel, serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = isUnlocked ? '#f5f0e6' : '#5d6678';
      ctx.fillText(r.name, 0, 48);
      ctx.font = '500 13px Manrope, sans-serif';
      ctx.fillStyle = isUnlocked ? 'rgba(245,240,230,.6)' : 'rgba(93,102,120,.7)';
      ctx.fillText(isCurrent ? 'ESTÁS AQUÍ' : isUnlocked ? 'DESBLOQUEADA' : 'BLOQUEADA', 0, 68);
      if (!isUnlocked) {
        ctx.font = '18px Manrope, sans-serif';
        ctx.fillText('✦', 0, -18);
      }
      ctx.restore();
    }

    // decorative compass
    ctx.save();
    ctx.translate(70, 70);
    ctx.strokeStyle = 'rgba(244,213,141,.35)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(0, 0, 26, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, -34); ctx.lineTo(0, 34); ctx.moveTo(-34, 0); ctx.lineTo(34, 0); ctx.stroke();
    ctx.fillStyle = '#f4d58d';
    ctx.font = '600 11px Cinzel, serif';
    ctx.textAlign = 'center';
    ctx.fillText('N', 0, -38);
    ctx.restore();
    ctx.fillStyle = 'rgba(244,213,141,.5)';
    ctx.font = '500 11px Manrope, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('AETHERIA · MAPA DEL VELO', w - 26, h - 22);
  }

  drawMinimap(game) {
    const canvas = $('minimap');
    if (!canvas || !game.world) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    const region = REGIONS[game.state.region];
    const cx = w / 2;
    const cy = h / 2;
    const scale = (w / 2 - 10) / 96;
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, w / 2 - 3, 0, Math.PI * 2);
    ctx.clip();
    const bg = ctx.createRadialGradient(cx, cy, 4, cx, cy, w / 2);
    bg.addColorStop(0, region.palette.mid);
    bg.addColorStop(1, region.palette.low);
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);
    // contour rings
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.lineWidth = 1;
    for (let i = 1; i < 4; i++) {
      ctx.beginPath();
      ctx.arc(cx, cy, (w / 2 - 8) * (i / 4), 0, Math.PI * 2);
      ctx.stroke();
    }
    const project = (x, z) => ({ x: cx + x * scale, y: cy + z * scale });
    // landmarks
    for (const key of Object.keys(game.world.landmarks)) {
      const l = game.world.landmarks[key];
      if (typeof l.x !== 'number') continue;
      const p = project(l.x, l.z);
      ctx.fillStyle = 'rgba(244,213,141,.55)';
      ctx.beginPath(); ctx.arc(p.x, p.y, 2.4, 0, Math.PI * 2); ctx.fill();
    }
    // enemies
    for (const e of game.enemies) {
      if (e.dead) continue;
      const p = project(e.group.position.x, e.group.position.z);
      if (Math.hypot(p.x - cx, p.y - cy) > w / 2 - 6) continue;
      ctx.fillStyle = e.def.boss ? '#ff8a4a' : '#ff6b6b';
      ctx.beginPath(); ctx.arc(p.x, p.y, e.def.boss ? 4 : 2.5, 0, Math.PI * 2); ctx.fill();
    }
    // creatures
    for (const c of game.creatures) {
      if (c.captured) continue;
      const p = project(c.group.position.x, c.group.position.z);
      if (Math.hypot(p.x - cx, p.y - cy) > w / 2 - 6) continue;
      ctx.fillStyle = '#7ee8fa';
      ctx.beginPath(); ctx.arc(p.x, p.y, 2.2, 0, Math.PI * 2); ctx.fill();
    }
    // npcs
    for (const n of game.npcs) {
      if (!n.group.visible) continue;
      const p = project(n.group.position.x, n.group.position.z);
      ctx.fillStyle = '#f4d58d';
      ctx.beginPath(); ctx.arc(p.x, p.y, 2.8, 0, Math.PI * 2); ctx.fill();
    }
    // quest marker
    if (game.world.questMarker?.visible) {
      const q = game.world.questMarker.position;
      const p = project(q.x, q.z);
      ctx.strokeStyle = '#f4d58d';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(p.x, p.y - 6); ctx.lineTo(p.x + 4, p.y); ctx.lineTo(p.x, p.y + 6); ctx.lineTo(p.x - 4, p.y); ctx.closePath(); ctx.stroke();
    }
    // player
    const pp = project(game.player.group.position.x, game.player.group.position.z);
    ctx.save();
    ctx.translate(pp.x, pp.y);
    ctx.rotate(Math.PI - game.player.group.rotation.y);
    ctx.fillStyle = '#fff3c4';
    ctx.beginPath();
    ctx.moveTo(0, -7); ctx.lineTo(4.5, 5); ctx.lineTo(0, 2.5); ctx.lineTo(-4.5, 5); ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#0a1220';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();
    ctx.restore();
    // ring
    ctx.strokeStyle = 'rgba(244,213,141,.4)';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(cx, cy, w / 2 - 3, 0, Math.PI * 2); ctx.stroke();
  }

  /* ------------------------------------------------------------------ */
  /* Capture / death / ending                                            */
  /* ------------------------------------------------------------------ */

  showCapture(creature, chance, canAfford, onConfirm, onCancel) {
    this.capture = { creature, onConfirm, onCancel };
    $('capture-portrait').innerHTML = creaturePortraitSVG(creature);
    $('capture-name').textContent = creature.name;
    $('capture-title').textContent = `${creature.title} · ${creature.type} · ${creature.rarity}`;
    $('capture-desc').textContent = creature.desc;
    $('capture-chance').textContent = `${Math.round(chance * 100)}%`;
    $('capture-cost').textContent = canAfford ? '1' : '0 (sin esencia)';
    $('btn-capture').disabled = !canAfford;
    $('capture-modal').classList.remove('hidden');
  }

  hideCapture() {
    this.capture = null;
    $('capture-modal').classList.add('hidden');
  }

  showDeath() {
    $('death-screen').classList.remove('hidden');
  }

  hideDeath() {
    $('death-screen').classList.add('hidden');
  }

  showEnding(ending, stats) {
    const e = ENDINGS[ending] || ENDINGS.restaurar;
    $('ending-kicker').textContent = 'FINAL DESBLOQUEADO';
    $('ending-title').textContent = e.title;
    $('ending-title').style.color = e.color;
    $('ending-subtitle').textContent = e.subtitle;
    $('ending-text').textContent = e.text;
    $('ending-epilogue').textContent = e.epilogue;
    $('ending-stats').innerHTML = `
      <div class="ending-stat"><span>Tiempo</span><b>${formatTime(stats.playTime)}</b></div>
      <div class="ending-stat"><span>Nivel</span><b>${stats.level}</b></div>
      <div class="ending-stat"><span>Ecos</span><b>${stats.creatures} / 9</b></div>
      <div class="ending-stat"><span>Enemigos</span><b>${stats.kills}</b></div>
      <div class="ending-stat"><span>Memorias</span><b>${stats.lore} / 6</b></div>`;
    $('ending-screen').classList.remove('hidden');
  }

  hideEnding() {
    $('ending-screen').classList.add('hidden');
  }
}
