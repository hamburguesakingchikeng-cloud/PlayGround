// Prólogo, final, derrota, ayuda y créditos.
import { esc } from './ui-model.js';
import { formatTime } from './utils.js';

const PROLOGUE_PAGES = [
  {
    title: 'El cielo se rompió en silencio',
    text: 'Hace mil años, la Espada Celestial separó la luz del Vacío y encendió el reino de Lumen. Desde entonces, tres Sellos mantuvieron cerrada la Puerta del Cielo.',
    sub: 'Pero los sellos se han apagado, uno a uno.'
  },
  {
    title: 'Una luz en Vado Lirio',
    text: 'Las bestias de ceniza bajan del bosque. En las ruinas de Aethel, los muertos repiten un nombre que nadie recuerda. La Anciana Lyss te ha llamado a su plaza.',
    sub: 'Quizá el último amanecer empiece contigo.'
  },
  {
    title: 'Tu nombre, tu filo',
    text: 'No eres un rey ni una profecía. Eres quien se atreve a caminar hasta la puerta. Elige tu arma, escucha al bosque y reúne los tres Sellos del Alba.',
    sub: 'La Espada Celestial solo responde a quien protege algo.'
  }
];

export function showPrologue(ui, game, onDone) {
  let index = 0;
  const render = () => {
    const page = PROLOGUE_PAGES[index];
    ui.openOverlay(`
      <div class="prologue">
        <div class="prologue-content">
          <div class="line"></div>
          <div class="cinematic-kicker">La leyenda del alba quebrada · ${index + 1} / ${PROLOGUE_PAGES.length}</div>
          <h2>${esc(page.title)}</h2>
          <p>${esc(page.text)}</p>
          <p style="color:var(--gold);font-family:var(--font-display);font-size:17px">${esc(page.sub)}</p>
          <button class="skip" id="prologue-next">${index < PROLOGUE_PAGES.length - 1 ? 'Continuar' : 'Comenzar la aventura'}</button>
          <button class="skip" id="prologue-skip" style="margin-left:8px;opacity:.6">Saltar</button>
        </div>
      </div>`, {
      onClose: () => {}
    });
    ui.overlay.querySelector('#prologue-next').onclick = () => {
      game.audio.sfx('confirm', { volume: 0.6 });
      if (index < PROLOGUE_PAGES.length - 1) {
        index++;
        render();
      } else finish();
    };
    ui.overlay.querySelector('#prologue-skip').onclick = () => finish();
  };
  const finish = () => {
    ui.closeOverlay({ silent: true });
    game.audio.sfx('seal', { volume: 0.65 });
    if (onDone) onDone();
  };
  render();
}

export function showGameOver(ui, game, stats, actions = {}) {
  const p = game.player;
  ui.openOverlay(`
    <div class="cinematic" style="background:radial-gradient(ellipse at 50% 42%, rgba(48,17,28,.9), rgba(4,5,10,.98) 72%)">
      <div class="big-rune" style="border-color:rgba(224,107,98,.5)"></div>
      <div class="cinematic-kicker" style="color:#d98a80">La luz se apaga</div>
      <h2 style="color:#f0b4ac">Has caído</h2>
      <p>El bosque guardará tu nombre hasta que vuelvas. Los cristales de guardado conservan tu progreso.</p>
      <div class="ending-stats">
        <div class="ending-stat"><b>${p?.level || 1}</b><span>Nivel</span></div>
        <div class="ending-stat"><b>${stats?.kills || 0}</b><span>Enemigos</span></div>
        <div class="ending-stat"><b>${formatTime(stats?.playtime || game.playtime)}</b><span>Tiempo</span></div>
      </div>
      <div class="cinematic-actions">
        <button class="btn primary" id="over-retry">Reintentar</button>
        <button class="btn secondary" id="over-load">Cargar partida</button>
        <button class="btn secondary" id="over-title">Volver al título</button>
      </div>
    </div>`, { onClose: () => {} });
  ui.overlay.querySelector('#over-retry').onclick = () => {
    ui.closeOverlay({ silent: true });
    actions.onRetry?.();
  };
  ui.overlay.querySelector('#over-load').onclick = () => {
    ui.closeOverlay({ silent: true });
    actions.onLoad?.();
  };
  ui.overlay.querySelector('#over-title').onclick = () => {
    ui.closeOverlay({ silent: true });
    actions.onTitle?.();
  };
}

export function showEnding(ui, game, stats, actions = {}) {
  const p = game.player;
  const seals = ['sello_bosque', 'sello_piedra', 'sello_espectro'].filter(id => p.countItem(id) > 0).length;
  ui.openOverlay(`
    <div class="cinematic">
      <div class="big-rune"></div>
      <div class="cinematic-kicker">El último amanecer</div>
      <h2>La Espada Celestial</h2>
      <p>El Guardián cae de rodillas. El Vacío se retira como una marea cansada y la puerta vuelve a ser solo un arco de piedra bajo el cielo.</p>
      <p>La Espada Celestial elige tu mano. No porque seas el más fuerte, sino porque has decidido volver por los que se quedaron.</p>
      <p style="color:var(--gold);font-family:var(--font-display);font-size:18px">Lumen respira. Y por primera vez en mil años, amanece.</p>
      <div class="ending-stats">
        <div class="ending-stat"><b>${p?.level || 1}</b><span>Nivel final</span></div>
        <div class="ending-stat"><b>${seals} / 3</b><span>Sellos</span></div>
        <div class="ending-stat"><b>${stats?.kills || 0}</b><span>Enemigos</span></div>
        <div class="ending-stat"><b>${formatTime(stats?.playtime || game.playtime)}</b><span>Tiempo</span></div>
      </div>
      <div class="cinematic-actions">
        <button class="btn primary" id="ending-continue">Seguir explorando</button>
        <button class="btn secondary" id="ending-title">Volver al título</button>
      </div>
    </div>`, { onClose: () => {} });
  ui.overlay.querySelector('#ending-continue').onclick = () => {
    ui.closeOverlay({ silent: true });
    actions.onContinue?.();
  };
  ui.overlay.querySelector('#ending-title').onclick = () => {
    ui.closeOverlay({ silent: true });
    actions.onTitle?.();
  };
}

export function openHowTo(ui, fromTitle = false) {
  ui.openPanel({
    title: 'Cómo jugar',
    subtitle: 'Teclado, mando Bluetooth y pantalla táctil',
    tabs: [{
      id: 'how', label: 'Guía', icon: '?', render: container => {
        container.innerHTML = `
          <div class="how-grid">
            <div class="how-card">
              <h4>Movimiento y combate</h4>
              <div class="keys-table">
                <div class="compare-row"><span>Mover</span><b>WASD / flechas / cruceta</b></div>
                <div class="compare-row"><span>Atacar</span><b>J / Z / botón A</b></div>
                <div class="compare-row"><span>Esquivar / bloquear</span><b>K / Espacio / botón B</b></div>
                <div class="compare-row"><span>Habilidad</span><b>L / X / botón X</b></div>
                <div class="compare-row"><span>Interactuar</span><b>E / Enter / botón Y</b></div>
                <div class="compare-row"><span>Cambiar arma</span><b>Q / botón L</b></div>
                <div class="compare-row"><span>Cambiar criatura</span><b>R / botón R</b></div>
                <div class="compare-row"><span>Pausa</span><b>Esc / P / Start</b></div>
              </div>
            </div>
            <div class="how-card">
              <h4>Pantalla táctil</h4>
              <p style="font-size:11px;line-height:1.7;color:#b8b09e">La cruceta mueve; A ataca, B esquiva o bloquea con escudo, X lanza la habilidad, Y interactúa. L y R cambian arma y criatura. El botón ✚ usa una poción. Arrastra los controles desde Ajustes si quieres otra posición.</p>
              <p style="font-size:11px;line-height:1.7;color:#b8b09e">En horizontal se ve más mundo. La inclinación es opcional: actívala en Ajustes y concede el permiso de movimiento cuando el navegador lo pida.</p>
            </div>
            <div class="how-card">
              <h4>Progresión</h4>
              <p style="font-size:11px;line-height:1.7;color:#b8b09e">Derrota enemigos para ganar experiencia, sube de nivel y reparte puntos en Estado. Equipa armas, escudos y armaduras desde el inventario. Los cofres y los secretos del mapa esconden piezas únicas.</p>
              <p style="font-size:11px;line-height:1.7;color:#b8b09e">Debilita a una bestia por debajo del 32% de vida y pulsa Y con un Sello de Vínculo para capturarla. Las criaturas dan pasivas y una habilidad activa.</p>
            </div>
            <div class="how-card">
              <h4>Guardado y dificultad</h4>
              <p style="font-size:11px;line-height:1.7;color:#b8b09e">Guarda en los cristales azules o desde el menú de pausa. Hay tres ranuras locales. La partida se guarda solo en este navegador. Los ajustes de sonido, táctil e inclinación también se conservan.</p>
              <p style="font-size:11px;line-height:1.7;color:#b8b09e">Dificultad Historia suaviza el combate; Héroe exige dominar la esquiva y el bloqueo. Puedes cambiarla en Ajustes.</p>
            </div>
          </div>`;
      }
    }],
    footer: '<span>Consejo: la parada perfecta se logra bloqueando justo antes del golpe</span><span class="foot-hint"><span class="keycap">Esc</span> cerrar</span>',
    onClose: () => {}
  });
}

export function openCredits(ui, fromTitle = false) {
  ui.openPanel({
    title: 'Créditos',
    subtitle: 'Un RPG original hecho para la web',
    tabs: [{
      id: 'credits', label: 'Créditos', icon: '✦', render: container => {
        container.innerHTML = `
          <div class="how-grid">
            <div class="how-card">
              <h4>La Espada Celestial</h4>
              <p style="font-size:11px;line-height:1.8;color:#b8b09e">Diseño, historia, arte procedural, música y programación generados para este proyecto. Un homenaje a los RPG de aventura clásicos, con identidad propia.</p>
              <p style="font-size:11px;line-height:1.8;color:#b8b09e">No se utilizan personajes, mapas, música ni recursos de terceros. Todos los gráficos se dibujan en canvas y todo el audio se sintetiza con Web Audio.</p>
            </div>
            <div class="how-card">
              <h4>Tecnología</h4>
              <p style="font-size:11px;line-height:1.8;color:#b8b09e">HTML5 Canvas 2D · JavaScript ES Modules · Web Audio API · Gamepad API · DeviceOrientation · localStorage.</p>
              <p style="font-size:11px;line-height:1.8;color:#b8b09e">Controles táctiles, teclado y mandos Bluetooth. Optimizado para paisaje en Android, tablet y navegador de escritorio.</p>
            </div>
            <div class="how-card">
              <h4>El reino de Lumen</h4>
              <p style="font-size:11px;line-height:1.8;color:#b8b09e">Vado Lirio, el Bosque de Ceniza, el Lago Espejo, la Cantera de los Ecos, las Ruinas de Aethel y la Puerta Celestial.</p>
            </div>
            <div class="how-card">
              <h4>Gracias</h4>
              <p style="font-size:11px;line-height:1.8;color:#b8b09e">A quien se detiene a escuchar al bosque. A quien vuelve por sus amigos. A quien elige proteger, aunque el cielo se rompa.</p>
              <p style="font-size:10px;color:var(--gold);margin-top:12px">«No fue forjada para vencer. Fue forjada para que otros pudieran vivir.»</p>
            </div>
          </div>`;
      }
    }],
    footer: '<span>Hecho con canvas, código y un poco de ceniza</span><span class="foot-hint"><span class="keycap">Esc</span> cerrar</span>',
    onClose: () => {}
  });
}
