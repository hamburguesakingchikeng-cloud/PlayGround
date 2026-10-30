// Creación del protagonista con vista previa en vivo.
import { APPEARANCE, STARTING_WEAPONS, DIFFICULTIES, WEAPONS } from './data.js';
import { drawHero } from './render.js';
import { esc, itemCanvas } from './ui-model.js';

const pick = arr => arr[Math.floor(Math.random() * arr.length)];
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

export function openCreation(ui, game, onConfirm) {
  const draft = {
    name: 'Aria',
    appearance: {
      hairStyle: 1,
      hairColor: '#6b3f2a',
      outfitColor: '#315d8a',
      skinColor: '#e6b58f',
      cloakColor: '#a94a3e'
    },
    weapon: 'espada_alba',
    difficulty: game.settings.difficulty || 'normal'
  };

  const drawPreview = () => {
    const canvas = ui.overlay?.querySelector('#creation-preview');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width, h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    const bg = ctx.createRadialGradient(w / 2, h * 0.42, 8, w / 2, h * 0.62, w * 0.8);
    bg.addColorStop(0, 'rgba(63,84,126,.7)');
    bg.addColorStop(0.6, 'rgba(16,23,40,.7)');
    bg.addColorStop(1, 'rgba(5,8,15,0)');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);
    ctx.save();
    ctx.globalAlpha = 0.2;
    ctx.strokeStyle = '#e6c77c';
    ctx.lineWidth = 1.2;
    for (let i = 0; i < 4; i++) {
      ctx.beginPath(); ctx.arc(w / 2, h * 0.58, 42 + i * 24, 0, Math.PI * 2); ctx.stroke();
    }
    for (let i = 0; i < 12; i++) {
      const a = i / 12 * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(w / 2 + Math.cos(a) * 54, h * 0.58 + Math.sin(a) * 54);
      ctx.lineTo(w / 2 + Math.cos(a) * 118, h * 0.58 + Math.sin(a) * 118);
      ctx.stroke();
    }
    ctx.restore();
    drawHero(ctx, {
      x: w / 2, y: h * 0.84, facing: -0.92, appearance: draft.appearance,
      equipment: { weapon: draft.weapon, armor: 'tunica_viajero' },
      walk: 0, attackPose: 0, state: 'idle', time: 2.4, blocking: false, scale: 3.3
    });
    const caption = ui.overlay.querySelector('#preview-caption');
    if (caption) caption.textContent = draft.name || 'Aria';
    const sub = ui.overlay.querySelector('#preview-sub');
    if (sub) sub.textContent = WEAPONS[draft.weapon]?.name || 'Viajero del Alba';
  };

  const render = () => {
    const styleChips = APPEARANCE.hairStyles.map(style => `
      <button class="choice-chip ${draft.appearance.hairStyle === style.id ? 'active' : ''}" data-hair-style="${style.id}" title="${esc(style.desc)}">${esc(style.name)}</button>`).join('');
    const swatches = (key, list) => list.map(color => `
      <button class="swatch ${draft.appearance[key] === color.value ? 'active' : ''}" data-swatch="${key}" data-value="${color.value}" style="background:${color.value}" title="${esc(color.name)}"></button>`).join('');
    const weapons = STARTING_WEAPONS.map(id => {
      const item = WEAPONS[id];
      return `<button class="weapon-opt ${draft.weapon === id ? 'active' : ''}" data-weapon="${id}">
        <b>${esc(item.name)}</b>${esc(item.stats.atk >= 9 ? 'Golpe firme' : item.weaponType === 'dagger' ? 'Velocidad' : 'Alcance')}
      </button>`;
    }).join('');
    ui.openOverlay(`
      <div class="creation-screen">
        <div class="creation-shell">
          <div class="creation-preview">
            <canvas id="creation-preview" width="420" height="420"></canvas>
            <div class="preview-caption" id="preview-caption">${esc(draft.name)}</div>
            <div class="preview-sub" id="preview-sub">${esc(WEAPONS[draft.weapon].name)}</div>
          </div>
          <div class="creation-form">
            <div class="creation-kicker">El reino de Lumen te espera</div>
            <h2>Crea tu héroe</h2>
            <div class="lead">La Espada Celestial no elige linajes. Elige decisiones. Personaliza tu aspecto, tu arma y tu dificultad.</div>
            <div class="field"><label>Nombre <span>Máximo 16 caracteres</span></label>
              <input id="creation-name" type="text" maxlength="16" value="${esc(draft.name)}" autocomplete="off" spellcheck="false"></div>
            <div class="field"><label>Cabello</label><div class="choice-row" id="hair-styles">${styleChips}</div></div>
            <div class="field"><label>Color de cabello</label><div class="swatches" id="hair-colors">${swatches('hairColor', APPEARANCE.hairColors)}</div></div>
            <div class="field"><label>Piel</label><div class="swatches" id="skin-colors">${swatches('skinColor', APPEARANCE.skinColors)}</div></div>
            <div class="field"><label>Ropa</label><div class="swatches" id="outfit-colors">${swatches('outfitColor', APPEARANCE.outfitColors)}</div></div>
            <div class="field"><label>Capa</label><div class="swatches" id="cloak-colors">${swatches('cloakColor', APPEARANCE.cloakColors)}</div></div>
            <div class="field"><label>Arma inicial</label><div class="weapon-choice" id="weapon-choice">${weapons}</div></div>
            <div class="field"><label>Dificultad</label><div class="segmented" id="creation-difficulty">
              ${Object.entries(DIFFICULTIES).map(([id, d]) => `<button data-difficulty="${id}" class="${draft.difficulty === id ? 'active' : ''}" title="${esc(d.desc)}">${esc(d.name)}</button>`).join('')}
            </div></div>
            <div class="creation-actions">
              <button class="btn secondary" id="creation-random">Aleatorio</button>
              <button class="btn secondary" id="creation-cancel">Cancelar</button>
              <button class="btn primary" id="creation-start">Comenzar</button>
            </div>
          </div>
        </div>
      </div>`, { onClose: () => { onConfirm?.cancel?.(); } });

    const nameInput = ui.overlay.querySelector('#creation-name');
    nameInput.oninput = () => {
      draft.name = nameInput.value.slice(0, 16);
      drawPreview();
    };
    ui.overlay.querySelectorAll('[data-hair-style]').forEach(button => {
      button.onclick = () => {
        draft.appearance.hairStyle = Number(button.dataset.hairStyle);
        render();
      };
    });
    ui.overlay.querySelectorAll('[data-swatch]').forEach(button => {
      button.onclick = () => {
        draft.appearance[button.dataset.swatch] = button.dataset.value;
        render();
      };
    });
    ui.overlay.querySelectorAll('[data-weapon]').forEach(button => {
      button.onclick = () => {
        draft.weapon = button.dataset.weapon;
        render();
      };
    });
    ui.overlay.querySelectorAll('[data-difficulty]').forEach(button => {
      button.onclick = () => {
        draft.difficulty = button.dataset.difficulty;
        render();
      };
    });
    ui.overlay.querySelector('#creation-random').onclick = () => {
      draft.appearance.hairStyle = pick(APPEARANCE.hairStyles).id;
      draft.appearance.hairColor = pick(APPEARANCE.hairColors).value;
      draft.appearance.outfitColor = pick(APPEARANCE.outfitColors).value;
      draft.appearance.skinColor = pick(APPEARANCE.skinColors).value;
      draft.appearance.cloakColor = pick(APPEARANCE.cloakColors).value;
      draft.weapon = pick(STARTING_WEAPONS);
      render();
      game.audio.sfx('magic', { volume: 0.4 });
    };
    ui.overlay.querySelector('#creation-cancel').onclick = () => {
      ui.closeOverlay({ silent: true });
      onConfirm?.cancel?.();
    };
    ui.overlay.querySelector('#creation-start').onclick = () => {
      const name = (nameInput.value || '').trim() || 'Aria';
      draft.name = name;
      game.audio.sfx('confirm', { volume: 0.8 });
      ui.closeOverlay({ silent: true });
      onConfirm?.({ name, appearance: { ...draft.appearance }, weapon: draft.weapon, difficulty: draft.difficulty });
    };
    drawPreview();
  };

  render();
}
