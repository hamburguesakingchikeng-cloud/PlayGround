// Ajustes del juego, sensores y editor de controles táctiles.
import { saveSettings } from './save.js';
import { DIFFICULTIES } from './data.js';
import { esc } from './ui-model.js';

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

export function openSettings(ui, game, options = {}) {
  ui.openPanel({
    title: 'Ajustes',
    subtitle: 'Sonido, controles, accesibilidad y rendimiento',
    tabs: [{ id: 'settings', label: 'Ajustes', icon: '⚙', render: (c, u, g) => settingsTab(c, u, g, options) }],
    footer: '<span>Los cambios se guardan automáticamente</span><span class="foot-hint"><span class="keycap">Esc</span> volver</span>'
  });
}

function persist(ui, game) {
  saveSettings(game.settings);
  game.applySettings();
}

function rangeRow(label, help, key, min, max, step, format, ui, game) {
  const value = game.settings[key];
  return `<div class="setting-row"><div class="setting-label">${esc(label)}<small>${esc(help)}</small></div>
    <div class="setting-control"><input type="range" data-range="${key}" min="${min}" max="${max}" step="${step}" value="${value}">
    <output data-output="${key}">${format(value)}</output></div></div>`;
}

function toggleRow(label, help, key, ui, game) {
  return `<div class="setting-row"><div class="setting-label">${esc(label)}<small>${esc(help)}</small></div>
    <button class="toggle ${game.settings[key] ? 'on' : ''}" data-toggle="${key}" aria-label="${esc(label)}"></button></div>`;
}

export function settingsTab(container, ui, game, options = {}) {
  const s = game.settings;
  container.innerHTML = `
    <div class="settings-grid">
      ${rangeRow('Música', 'Volumen de la banda sonora procedural.', 'music', 0, 1, 0.05, v => `${Math.round(v * 100)}%`, ui, game)}
      ${rangeRow('Efectos', 'Golpes, magia, pasos y ambiente.', 'sfx', 0, 1, 0.05, v => `${Math.round(v * 100)}%`, ui, game)}
      ${toggleRow('Silenciar todo', 'Desactiva música y efectos sin perder los valores.', 'muted', ui, game)}
      ${toggleRow('Vibración', 'Respuesta háptica en combate y botones (si el dispositivo lo permite).', 'haptics', ui, game)}
      ${rangeRow('Vibración de cámara', 'Intensidad de los temblores de impacto.', 'shake', 0, 2, 0.1, v => `${Math.round(v * 100)}%`, ui, game)}
      ${toggleRow('Minimapa', 'Muestra el mapa local junto a la misión.', 'showMinimap', ui, game)}
      ${toggleRow('Mostrar FPS', 'Contador de rendimiento en la esquina.', 'showFps', ui, game)}
      ${toggleRow('Reducir movimiento', 'Atenúa temblores y animaciones intensas.', 'reduceMotion', ui, game)}
      <div class="setting-row"><div class="setting-label">Dificultad<small>Afecta a enemigos nuevos y a la experiencia obtenida.</small></div>
        <div class="segmented" data-segment="difficulty">
          ${Object.entries(DIFFICULTIES).map(([id, d]) => `<button data-value="${id}" class="${s.difficulty === id ? 'active' : ''}">${esc(d.name)}</button>`).join('')}
        </div></div>
      <div class="setting-row"><div class="setting-label">Controles táctiles<small>Automático muestra los mandos solo en pantallas táctiles.</small></div>
        <div class="segmented" data-segment="touchMode">
          ${[['auto', 'Auto'], ['always', 'Siempre'], ['off', 'Ocultos']].map(([id, label]) => `<button data-value="${id}" class="${s.touchMode === id ? 'active' : ''}">${label}</button>`).join('')}
        </div></div>
      ${rangeRow('Tamaño táctil', 'Escala de la cruceta y los botones.', 'touchScale', 0.7, 1.45, 0.05, v => `${Math.round(v * 100)}%`, ui, game)}
      ${rangeRow('Opacidad táctil', 'Transparencia de los controles en pantalla.', 'touchOpacity', 0.35, 1, 0.05, v => `${Math.round(v * 100)}%`, ui, game)}
      ${toggleRow('Zurdo', 'Intercambia la cruceta y los botones de acción.', 'leftHanded', ui, game)}
      ${toggleRow('Inclinación', 'Mueve al héroe inclinando el dispositivo (requiere permiso de movimiento).', 'tilt', ui, game)}
      ${rangeRow('Sensibilidad de inclinación', 'Solo se aplica si la inclinación está activa.', 'tiltSensitivity', 0.4, 2.5, 0.1, v => v.toFixed(1), ui, game)}
    </div>
    <div class="settings-note">
      Teclado: <b>WASD</b> mover · <b>J</b> atacar · <b>K</b> esquivar/bloquear · <b>L</b> habilidad · <b>E</b> interactuar · <b>Q</b> cambiar arma · <b>R</b> criatura · <b>Esc</b> pausa.
      Mando Bluetooth: botones A/B/X/Y, cruceta o stick, Start y Select.
    </div>
    <div class="settings-grid" style="margin-top:14px">
      <div class="setting-row"><div class="setting-label">Mandos conectados<small>Se detectan al conectarlos por Bluetooth o USB.</small></div><div class="setting-control"><b style="color:var(--teal)">${game.input?.getGamepadCount?.() || 0}</b></div></div>
      <div class="setting-row"><div class="setting-label">Controles en pantalla<small>Arrastra los grupos para recolocarlos.</small></div>
        <div class="setting-control"><button class="btn secondary" id="open-control-editor">Editar posiciones</button>
        <button class="btn secondary" id="center-tilt">Centrar inclinación</button></div></div>
    </div>
    <div class="settings-note" style="margin-top:14px">
      <button class="btn danger" id="reset-settings">Restablecer ajustes</button>
      <span style="margin-left:12px">No afecta a tus partidas guardadas. La inclinación puede no estar disponible en todos los navegadores.</span>
    </div>`;

  container.querySelectorAll('[data-range]').forEach(input => {
    input.oninput = () => {
      const key = input.dataset.range;
      s[key] = Number(input.value);
      const output = container.querySelector(`[data-output="${key}"]`);
      if (output) {
        if (key === 'tiltSensitivity') output.textContent = s[key].toFixed(1);
        else output.textContent = `${Math.round(s[key] * 100)}%`;
      }
      game.audio.setVolumes({ music: s.music, sfx: s.sfx, muted: s.muted });
      if (key === 'touchScale' || key === 'touchOpacity') ui.applySettings();
      saveSettings(s);
    };
    input.onchange = () => persist(ui, game);
  });

  container.querySelectorAll('[data-toggle]').forEach(button => {
    button.onclick = async () => {
      const key = button.dataset.toggle;
      const next = !s[key];
      if (key === 'tilt') {
        if (next) {
          const ok = await game.input.enableTilt(true);
          if (!ok) return;
          s.tilt = true;
        } else {
          game.input.disableTilt();
          s.tilt = false;
        }
      } else {
        s[key] = next;
      }
      button.classList.toggle('on', !!s[key]);
      persist(ui, game);
      if (key === 'haptics' && s.haptics && navigator.vibrate) navigator.vibrate(20);
    };
  });

  container.querySelectorAll('[data-segment]').forEach(segment => {
    const key = segment.dataset.segment;
    segment.querySelectorAll('button').forEach(button => {
      button.onclick = () => {
        const value = button.dataset.value;
        if (key === 'difficulty') {
          s.difficulty = value;
          game.setDifficulty(value);
        } else {
          s[key] = value;
        }
        segment.querySelectorAll('button').forEach(b => b.classList.toggle('active', b === button));
        persist(ui, game);
      };
    });
  });

  container.querySelector('#open-control-editor').onclick = () => openControlEditor(ui, game);
  container.querySelector('#center-tilt').onclick = () => {
    if (!game.input.tilt.enabled) {
      ui.toast('Inclinación desactivada', 'Actívala primero para poder centrarla.', 'info');
      return;
    }
    game.input.calibrateTilt();
  };
  container.querySelector('#reset-settings').onclick = () => {
    const defaults = {
      music: 0.55, sfx: 0.72, muted: false, shake: 1, touchMode: 'auto', touchScale: 1,
      touchOpacity: 0.9, leftHanded: false, tilt: false, tiltSensitivity: 1.2, haptics: true,
      showMinimap: true, difficulty: 'normal', showFps: false, reduceMotion: false,
      dpadX: null, dpadY: null, actionsX: null, actionsY: null
    };
    Object.assign(s, defaults);
    if (game.input.tilt.enabled) game.input.disableTilt();
    persist(ui, game);
    if (game.state === 'paused') ui.refreshPanel();
    else ui.overlay?.querySelector('#open-control-editor') && ui.refreshPanel();
    ui.toast('Ajustes restablecidos', 'Se han recuperado los valores originales.', 'success');
  };
}

export function openControlEditor(ui, game) {
  if (game.state !== 'playing' && game.state !== 'paused') {
    ui.toast('Editor no disponible', 'Inicia una partida para recolocar los controles táctiles.', 'info', 3000);
    return;
  }
  if (!ui.shouldShowTouch() && game.settings.touchMode === 'auto' && !ui.isTouchDevice) {
    ui.toast('Sin controles táctiles', 'Activa «Siempre» en controles táctiles para editarlos en este dispositivo.', 'info', 3800);
    return;
  }
  ui.closeOverlay({ silent: true });
  ui.editorMode = true;
  const touch = ui.el.touch;
  touch.classList.remove('hidden');
  touch.classList.add('control-editor');
  const panel = document.createElement('div');
  panel.className = 'editor-panel';
  panel.style.pointerEvents = 'auto';
  panel.innerHTML = `<b>Editor de controles</b>Arrastra la cruceta o los botones de acción. Los cambios se guardan al terminar.
    <div class="editor-actions"><button class="btn secondary" id="editor-reset">Restablecer</button><button class="btn primary" id="editor-done">Listo</button></div>`;
  ui.overlayRoot.appendChild(panel);

  const clusters = [ui.el.dpad, ui.el.actions].filter(Boolean);
  const cleanups = [];
  for (const cluster of clusters) {
    const drag = event => {
      if (event.button != null && event.button !== 0) return;
      const rect = cluster.getBoundingClientRect();
      const startX = event.clientX, startY = event.clientY;
      const startLeft = rect.left, startBottom = window.innerHeight - rect.bottom;
      let moved = false;
      cluster.classList.add('dragging');
      cluster.setPointerCapture?.(event.pointerId);
      const move = ev => {
        const dx = ev.clientX - startX, dy = ev.clientY - startY;
        if (Math.abs(dx) + Math.abs(dy) > 4) moved = true;
        const left = clamp(startLeft + dx, 2, window.innerWidth - rect.width - 2);
        const bottom = clamp(startBottom - dy, 2, window.innerHeight - rect.height - 2);
        cluster.style.left = `${left}px`;
        cluster.style.right = 'auto';
        cluster.style.bottom = `${bottom}px`;
      };
      const end = () => {
        cluster.classList.remove('dragging');
        window.removeEventListener('pointermove', move);
        window.removeEventListener('pointerup', end);
        if (moved) {
          const r = cluster.getBoundingClientRect();
          if (cluster === ui.el.dpad) {
            game.settings.dpadX = Math.round(r.left);
            game.settings.dpadY = Math.round(window.innerHeight - r.bottom);
          } else {
            game.settings.actionsX = Math.round(window.innerWidth - r.right);
            game.settings.actionsY = Math.round(window.innerHeight - r.bottom);
          }
          saveSettings(game.settings);
        }
      };
      window.addEventListener('pointermove', move);
      window.addEventListener('pointerup', end);
      cleanups.push(() => {
        window.removeEventListener('pointermove', move);
        window.removeEventListener('pointerup', end);
      });
      event.preventDefault();
    };
    cluster.addEventListener('pointerdown', drag);
    cleanups.push(() => cluster.removeEventListener('pointerdown', drag));
  }

  const finish = () => {
    cleanups.forEach(fn => fn());
    ui.editorMode = false;
    touch.classList.remove('control-editor');
    panel.remove();
    ui.applySettings();
    saveSettings(game.settings);
    game.state = 'paused';
    ui.openPause();
  };
  panel.querySelector('#editor-done').onclick = finish;
  panel.querySelector('#editor-reset').onclick = () => {
    game.settings.dpadX = null;
    game.settings.dpadY = null;
    game.settings.actionsX = null;
    game.settings.actionsY = null;
    saveSettings(game.settings);
    ui.applySettings();
    ui.toast('Posiciones restablecidas', 'Los controles vuelven a su sitio.', 'success', 2200);
  };
}
