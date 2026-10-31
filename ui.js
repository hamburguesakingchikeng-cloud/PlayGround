/* ===========================================================
   LA ESPADA CELESTIAL — interfaz, controles y arranque
   HUD, diálogos, inventario, guardado y bucle principal.
   =========================================================== */
'use strict';

const isTouch = (window.matchMedia && window.matchMedia('(pointer: coarse)').matches) || 'ontouchstart' in window;
document.body.classList.toggle('touch', isTouch);

/* ----------------------------- HUD ----------------------------- */
let lastPrompt = '';
let lastQuest = '';
let lastLowHp = null;
let lastPromptVisible = null;
let lastPromptBtn = null;
const actButtons = Array.from(document.querySelectorAll('.act'));

function setText(el, value) {
  const text = String(value);
  if (el && el.__text !== text) {
    el.__text = text;
    el.textContent = text;
  }
}

function setBar(el, ratio) {
  const width = `${(clamp(ratio, 0, 1) * 100).toFixed(1)}%`;
  if (el && el.__width !== width) {
    el.__width = width;
    el.style.width = width;
  }
}

function updateHUD() {
  const p = game.p;
  if (!p) return;
  setText($('lvl'), p.level);
  setBar($('hpFill'), p.hp / p.maxHp);
  setBar($('mpFill'), p.mp / p.maxMp);
  setBar($('xpFill'), p.xp / p.xpNext);
  setText($('hpText'), `${Math.ceil(p.hp)} / ${p.maxHp}`);
  setText($('mpText'), `${Math.ceil(p.mp)} / ${p.maxMp}`);
  setText($('goldText'), p.gold);
  setText($('potionCount'), p.potions);
  setText($('zoneText'), ZONE_NAMES[game.mapId] || '');

  const lowHp = p.hp / p.maxHp < 0.3;
  if (lowHp !== lastLowHp) {
    lastLowHp = lowHp;
    document.body.classList.toggle('low-hp', lowHp);
  }

  const q = QUESTS[clamp(p.stage, 1, 5) - 1];
  const prog = questProgressText();
  const target = questTarget();
  let distTxt = '';
  if (target) {
    if (target.mapId === game.mapId) distTxt = `Objetivo a ${Math.round(dist(p.x, p.y, target.x, target.y) / 22)} m`;
    else distTxt = `Objetivo en ${ZONE_NAMES[target.mapId] || 'el reino'}`;
  }
  const sig = `${q.id}|${prog}|${distTxt}`;
  if (sig !== lastQuest) {
    lastQuest = sig;
    setText($('questName'), q.title);
    setText($('questDesc'), prog ? `${q.desc} · ${prog}` : q.desc);
    setText($('questDist'), distTxt);
  }

  for (const b of actButtons) {
    const act = b.dataset.act;
    let cd = 0;
    if (act === 'attack') cd = p.atkCd;
    else if (act === 'skill') cd = p.skillCd;
    else if (act === 'heal') cd = p.healCd;
    const cooling = cd > 0.05;
    if (b.__cooling !== cooling) {
      b.__cooling = cooling;
      b.classList.toggle('cooldown', cooling);
    }
  }
}

function toast(msg, kind = '') {
  if (!msg) return;
  const box = $('toasts');
  while (box.children.length >= 4) box.firstChild.remove();
  const el = document.createElement('div');
  el.className = `toast ${kind}`.trim();
  el.textContent = msg;
  box.appendChild(el);
  const life = kind === 'gold' ? 3200 : kind === 'danger' ? 2800 : 2400;
  setTimeout(() => {
    el.classList.add('out');
    setTimeout(() => el.remove(), 400);
  }, life);
}

/* ----------------------------- Prompt de interacción ----------------------------- */
function updatePrompt() {
  const it = game.scene === 'play' ? game.interact : null;
  const promptEl = $('prompt');
  const btn = $('interactBtn');
  if (!it) {
    if (lastPromptVisible !== false) {
      lastPromptVisible = false;
      lastPrompt = '';
      promptEl.classList.add('hidden');
      btn.classList.add('hidden');
    }
    return;
  }
  let txt = it.label;
  if (it.type === 'npc') txt = `${isTouch ? '' : '[E] '}Hablar con ${it.ref.name}`;
  else if (it.type === 'chest') txt = `${isTouch ? '' : '[E] '}Abrir el cofre`;
  else if (it.type === 'chestLocked') txt = `${isTouch ? '' : '[E] '}Examinar el cofre sellado`;
  else if (it.type === 'shrine') txt = `${isTouch ? '' : '[E] '}Rezar en el santuario`;
  if (txt !== lastPrompt) {
    lastPrompt = txt;
    setText(promptEl, txt);
    setText(btn, it.label);
  }
  if (lastPromptVisible !== true) {
    lastPromptVisible = true;
    promptEl.classList.remove('hidden');
  }
  const showBtn = isTouch;
  if (lastPromptBtn !== showBtn) {
    lastPromptBtn = showBtn;
    btn.classList.toggle('hidden', !showBtn);
  }
}

/* ----------------------------- Barra de jefe ----------------------------- */
function showBossBar() {
  if (!game.boss) return;
  $('bossName').textContent = game.boss.name;
  $('bossbar').classList.remove('hidden');
  document.body.classList.add('boss-active');
  updateBossBar();
}
function hideBossBar() {
  $('bossbar').classList.add('hidden');
  document.body.classList.remove('boss-active');
}
function updateBossBar() {
  if (!game.boss) return;
  $('bossFill').style.width = `${clamp((game.boss.hp / game.boss.maxHp) * 100, 0, 100)}%`;
}

/* ----------------------------- Diálogos ----------------------------- */
function openDialog({ who, text, options }) {
  if (game.scene !== 'play' && game.scene !== 'dialog') return;
  game.scene = 'dialog';
  document.body.classList.add('dialog-open');
  $('dlgWho').textContent = who;
  $('dlgText').textContent = text;
  const wrap = $('dlgActions');
  wrap.innerHTML = '';
  const opts = options && options.length ? options : [{ label: 'Continuar', cb: closeDialog }];
  opts.forEach((o, i) => {
    const b = document.createElement('button');
    b.textContent = o.label;
    if (i === 0) b.classList.add('primary');
    b.addEventListener('click', () => {
      AudioFX.init();
      if (o.cb) o.cb();
      else closeDialog();
    });
    wrap.appendChild(b);
  });
  $('dialog').classList.remove('hidden');
  $('prompt').classList.add('hidden');
  $('interactBtn').classList.add('hidden');
  lastPrompt = '';
}

function closeDialog() {
  $('dialog').classList.add('hidden');
  document.body.classList.remove('dialog-open');
  if (game.scene === 'dialog') game.scene = 'play';
}

/* ----------------------------- Panel ----------------------------- */
let currentTab = 'char';

function openPanel(tab = 'char') {
  if (game.scene !== 'play') return;
  game.scene = 'panel';
  currentTab = tab;
  renderPanel(tab);
  $('panel').classList.remove('hidden');
  $('prompt').classList.add('hidden');
  $('interactBtn').classList.add('hidden');
  lastPrompt = '';
}

function closePanel() {
  $('panel').classList.add('hidden');
  if (game.scene === 'panel') game.scene = 'play';
}

function switchTab(tab) {
  currentTab = tab;
  document.querySelectorAll('.tabs button').forEach((b) => b.classList.toggle('active', b.dataset.tab === tab));
  ['char', 'inv', 'quests', 'sys'].forEach((t) => $(`tab-${t}`).classList.toggle('hidden', t !== tab));
  renderPanel(tab);
}

function fmtTime(sec) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

function renderPanel(tab) {
  const p = game.p;
  if (!p) return;
  $('panelTitle').textContent = tab === 'char' ? 'Personaje' : tab === 'inv' ? 'Inventario' : tab === 'quests' ? 'Misiones' : 'Sistema';

  if (tab === 'char') {
    $('tab-char').innerHTML = `
      <div class="stat-grid">
        <div class="stat"><span>Nivel</span><b>${p.level}</b></div>
        <div class="stat"><span>Vida</span><b>${Math.ceil(p.hp)} / ${p.maxHp}</b></div>
        <div class="stat"><span>Maná</span><b>${Math.ceil(p.mp)} / ${p.maxMp}</b></div>
        <div class="stat"><span>Ataque</span><b>${p.atk}</b></div>
        <div class="stat"><span>Oro</span><b>${p.gold} ◈</b></div>
        <div class="stat"><span>Enemigos</span><b>${p.kills}</b></div>
        <div class="stat"><span>Experiencia</span><b>${p.xp} / ${p.xpNext}</b></div>
        <div class="stat"><span>Tiempo</span><b>${fmtTime(p.playTime)}</b></div>
        <div class="stat wide"><span>Arma</span><b>${bladeName()}</b></div>
      </div>
      <div class="blade">
        <b>${bladeName()}</b> · mejora ${p.blade}/3.<br />
        El Herrero Bruno puede reforzarla con oro. La Espada Celestial completa se despierta al recuperar el Fragmento de Ceniza.
      </div>`;
  } else if (tab === 'inv') {
    const item = (icon, name, desc, qty, action, key) => `
      <div class="item ${key ? 'key' : ''}">
        <div class="iqty">${icon} ×${qty}</div>
        <div class="iname">${name}</div>
        <div class="idesc">${desc}</div>
        ${action ? `<button data-action="${action}" ${qty <= 0 ? 'disabled' : ''}>Usar</button>` : ''}
      </div>`;
    let html = '<div class="inv-grid">';
    html += item('⚗', 'Poción de vida', 'Restaura 45 de vida, o el 30% de tu vida máxima si es mayor.', p.potions, 'potion');
    html += item('✦', 'Éter lunar', 'Restaura 32 puntos de maná.', p.ethers, 'ether');
    if (p.stage >= 4) html += item('◈', 'Fragmento de Ceniza', 'Reliquia clave. La espada recuerda su nombre.', 1, null, true);
    html += item('⚔', bladeName(), `Ataque actual: ${p.atk}. Mejora ${p.blade}/3.`, 1, null, p.blade >= 2);
    html += '</div>';
    $('tab-inv').innerHTML = html;
  } else if (tab === 'quests') {
    let html = '';
    for (const q of QUESTS) {
      let state = 'Bloqueada';
      let cls = '';
      if (p.stage > q.id) { state = 'Completada'; cls = 'done'; }
      else if (p.stage === q.id) { state = 'Activa'; cls = 'active'; }
      let extra = '';
      if (p.stage === q.id && q.id === 2) extra = ` (${p.slimeKills}/5 limos)`;
      if (p.stage === q.id && q.id === 3) extra = p.ghostKills >= 6 ? ' (reclama el fragmento)' : ` (${p.ghostKills}/6 espectros)`;
      html += `<div class="quest-row ${cls}">
        <span class="state">${state}</span>
        <h3>${q.id}. ${q.title}</h3>
        <p>${q.desc}${extra}</p>
      </div>`;
    }
    $('tab-quests').innerHTML = html;
  } else {
    $('tab-sys').innerHTML = `
      <div class="sys-btns">
        <button data-action="save" class="primary">Guardar partida</button>
        <button data-action="load">Cargar última partida</button>
        <button data-action="mute">Sonido: ${AudioFX.muted ? 'desactivado' : 'activado'}</button>
        <button data-action="reset" class="danger">Reiniciar aventura</button>
      </div>
      <div class="sys-note">
        El progreso se guarda solo al cambiar de zona, subir de nivel, completar misiones y cada 25 segundos.<br /><br />
        <b>Teclado</b> · WASD/ flechas mover · J atacar · K Golpe Celestial · L Curar · Q poción · E interactuar · I inventario · Esc menú.<br />
        <b>Táctil</b> · joystick izquierdo · botones de acción · botón «Hablar» junto a NPC y cofres.<br /><br />
        La Espada Celestial · versión web 1.0
      </div>`;
  }
  if (tab === 'sys') {
    // nada extra
  }
  document.querySelectorAll('.tabs button').forEach((b) => b.classList.toggle('active', b.dataset.tab === tab));
  ['char', 'inv', 'quests', 'sys'].forEach((t) => $(`tab-${t}`).classList.toggle('hidden', t !== tab));
}

function confirmReset() {
  closePanel();
  openDialog({
    who: 'Reiniciar aventura',
    text: '¿Seguro que quieres borrar el progreso guardado y empezar de nuevo? Esta acción no se puede deshacer.',
    options: [
      { label: 'Sí, empezar de nuevo', cb: () => { closeDialog(); try { localStorage.removeItem(SAVE_KEY); } catch (e) {} startNewGame(); } },
      { label: 'Cancelar', cb: closeDialog }
    ]
  });
}

/* ----------------------------- Título / final ----------------------------- */
function hideTitle() {
  $('title').classList.add('hidden');
  $('hud').classList.remove('hidden');
}

function startNewGame() {
  AudioFX.init();
  $('ending').classList.add('hidden');
  $('death').classList.add('hidden');
  $('panel').classList.add('hidden');
  closeDialog();
  game.p = newPlayer();
  game.endingTimer = 0;
  game.saveTimer = 0;
  game.scene = 'play';
  game.shake = 0;
  loadMap('village');
  hideTitle();
  updateHUD();
  saveGame(true);
  toast('Aldea Luz de Luna', 'quest');
  setTimeout(() => {
    if (game.scene === 'play' && game.p.stage === 1) toast('Habla con la Anciana Mira junto a la fuente', '', 3200);
  }, 1200);
  setTimeout(() => {
    if (game.scene === 'play' && game.p.stage === 1 && game.p.playTime < 12) {
      toast(isTouch ? 'Joystick izquierdo para moverte · botones derechos para combatir' : 'WASD para moverte · J atacar · K celestial · E interactuar', '', 3400);
    }
  }, 4600);
}

function showEnding() {
  game.scene = 'ending';
  const p = game.p;
  $('endingText').textContent =
    'El Señor de la Ceniza cae de rodillas y su corona se convierte en polvo. La Espada Celestial brilla con la luz de mil estrellas, y la ceniza que cubría el reino se disuelve como niebla al amanecer. La Anciana Mira sonríe desde la aldea: el cielo vuelve a pertenecer a los vivos.';
  $('endingStats').innerHTML = `
    <div><b>${p.level}</b>Nivel</div>
    <div><b>${p.kills}</b>Enemigos</div>
    <div><b>${p.gold}</b>Oro</div>
    <div><b>${fmtTime(p.playTime)}</b>Tiempo</div>
    <div><b>${p.blade}/3</b>Espada</div>
    <div><b>4/4</b>Misiones</div>`;
  $('ending').classList.remove('hidden');
  $('hud').classList.add('hidden');
  $('bossbar').classList.add('hidden');
  AudioFX.level();
}

function showDeath() {
  $('death').classList.remove('hidden');
}
function hideDeath() {
  $('death').classList.add('hidden');
}

/* ----------------------------- Acciones táctiles ----------------------------- */
function doAction(act) {
  AudioFX.init();
  if (game.scene !== 'play') return;
  if (act === 'attack') playerAttack();
  else if (act === 'skill') playerSkill();
  else if (act === 'heal') playerHeal();
  else if (act === 'potion') usePotion();
  if (navigator.vibrate) { try { navigator.vibrate(6); } catch (e) {} }
}

/* ----------------------------- Entrada ----------------------------- */
const keys = Object.create(null);
const joy = { active: false, id: null, dx: 0, dy: 0, ox: 0, oy: 0 };

window.addEventListener('keydown', (e) => {
  const k = e.key.toLowerCase();
  if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(k)) e.preventDefault();
  keys[k] = true;

  if (game.scene === 'play') {
    if (k === 'j') playerAttack();
    else if (k === 'k') playerSkill();
    else if (k === 'l') playerHeal();
    else if (k === 'q') usePotion();
    else if (k === 'e' || k === 'enter' || k === ' ') doInteract();
    else if (k === 'i' || k === 'tab') { e.preventDefault(); openPanel('char'); }
    else if (k === 'escape') openPanel('char');
  } else if (game.scene === 'panel') {
    if (k === 'escape' || k === 'i') closePanel();
  } else if (game.scene === 'dialog') {
    if (k === 'escape') closeDialog();
    else if (k === ' ' || k === 'enter' || k === 'e') {
      const first = $('dlgActions').querySelector('button');
      if (first) first.click();
    }
  }
});

window.addEventListener('keyup', (e) => {
  keys[e.key.toLowerCase()] = false;
});

window.addEventListener('blur', () => {
  for (const k in keys) keys[k] = false;
  resetJoystick();
});

/* Joystick */
const stickZone = $('stickZone');
const stickBase = $('stickBase');
const stickKnob = $('stickKnob');
const STICK_R = 40;

function resetJoystick() {
  joy.active = false;
  joy.id = null;
  joy.dx = 0;
  joy.dy = 0;
  stickKnob.style.transform = 'translate(0px, 0px)';
  stickBase.style.opacity = '0.85';
}

stickZone.addEventListener('pointerdown', (e) => {
  if (game.scene !== 'play') return;
  e.preventDefault();
  const rect = stickZone.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  joy.active = true;
  joy.id = e.pointerId;
  joy.ox = x;
  joy.oy = y;
  joy.dx = 0;
  joy.dy = 0;
  stickBase.style.left = `${x - 59}px`;
  stickBase.style.top = `${y - 59}px`;
  stickBase.style.bottom = 'auto';
  stickBase.style.opacity = '1';
  try { stickZone.setPointerCapture(e.pointerId); } catch (err) {}
});

stickZone.addEventListener('pointermove', (e) => {
  if (!joy.active || e.pointerId !== joy.id) return;
  e.preventDefault();
  const rect = stickZone.getBoundingClientRect();
  let dx = e.clientX - rect.left - joy.ox;
  let dy = e.clientY - rect.top - joy.oy;
  const len = Math.hypot(dx, dy);
  if (len > STICK_R) {
    dx = (dx / len) * STICK_R;
    dy = (dy / len) * STICK_R;
  }
  stickKnob.style.transform = `translate(${dx}px, ${dy}px)`;
  const mag = Math.min(1, len / STICK_R);
  if (mag > 0.12) {
    joy.dx = (dx / STICK_R) * mag;
    joy.dy = (dy / STICK_R) * mag;
  } else {
    joy.dx = 0;
    joy.dy = 0;
  }
});

function releaseStick(e) {
  if (!joy.active || (e && e.pointerId !== joy.id)) return;
  resetJoystick();
}
stickZone.addEventListener('pointerup', releaseStick);
stickZone.addEventListener('pointercancel', releaseStick);
stickZone.addEventListener('lostpointercapture', releaseStick);

document.querySelectorAll('.act').forEach((btn) => {
  btn.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    btn.classList.add('pressed');
    doAction(btn.dataset.act);
  });
  const up = () => btn.classList.remove('pressed');
  btn.addEventListener('pointerup', up);
  btn.addEventListener('pointercancel', up);
  btn.addEventListener('pointerleave', up);
});

$('interactBtn').addEventListener('click', () => {
  AudioFX.init();
  doInteract();
});

/* ----------------------------- Botones de interfaz ----------------------------- */
$('menuBtn').addEventListener('click', () => { AudioFX.init(); openPanel('char'); });
$('panelClose').addEventListener('click', closePanel);
$('panel').addEventListener('click', (e) => {
  if (e.target === $('panel')) closePanel();
});

document.querySelectorAll('.tabs button').forEach((b) => {
  b.addEventListener('click', () => switchTab(b.dataset.tab));
});

$('panel').addEventListener('click', (e) => {
  const btn = e.target.closest('[data-action]');
  if (!btn) return;
  const action = btn.dataset.action;
  const p = game.p;
  if (!p) return;
  if (action === 'potion') {
    if (p.potions > 0 && p.hp < p.maxHp) {
      p.potions--;
      p.hp = Math.min(p.maxHp, p.hp + Math.max(45, Math.round(p.maxHp * 0.3)));
      AudioFX.init();
      AudioFX.pickup();
      updateHUD();
      renderPanel('inv');
    }
  } else if (action === 'ether') {
    if (p.ethers > 0 && p.mp < p.maxMp) {
      p.ethers--;
      p.mp = Math.min(p.maxMp, p.mp + 32);
      AudioFX.init();
      AudioFX.pickup();
      updateHUD();
      renderPanel('inv');
    }
  } else if (action === 'save') {
    saveGame();
  } else if (action === 'load') {
    closePanel();
    if (hasSave()) loadGame();
    else toast('No hay partida guardada', 'danger');
  } else if (action === 'mute') {
    AudioFX.init();
    AudioFX.muted = !AudioFX.muted;
    renderPanel('sys');
    toast(AudioFX.muted ? 'Sonido desactivado' : 'Sonido activado', 'gold');
  } else if (action === 'reset') {
    confirmReset();
  }
});

$('btnNew').addEventListener('click', () => { AudioFX.init(); startNewGame(); });
$('btnContinue').addEventListener('click', () => { AudioFX.init(); loadGame(); });
$('btnRetry').addEventListener('click', () => { AudioFX.init(); retry(); });
$('btnAgain').addEventListener('click', () => { AudioFX.init(); startNewGame(); });

document.addEventListener('contextmenu', (e) => {
  if (e.target.closest('#app')) e.preventDefault();
});

/* ----------------------------- Redimensionado ----------------------------- */
window.addEventListener('resize', () => { resize(); updateHUD(); });
if (window.visualViewport) window.visualViewport.addEventListener('resize', () => { resize(); });

/* ----------------------------- Bucle ----------------------------- */
let lastFrame = performance.now();

function loop(ts) {
  const dt = Math.min(0.033, Math.max(0, (ts - lastFrame) / 1000));
  lastFrame = ts;

  if (game.scene === 'play') {
    update(dt);
  } else {
    game.time += dt;
    if (game.scene === 'title' || game.scene === 'ending') {
      // animación ambiental suave
    }
  }
  render();
  requestAnimationFrame(loop);
}

/* ----------------------------- Arranque ----------------------------- */
function boot() {
  resize();
  game.p = newPlayer();
  loadMap('village');
  game.scene = 'title';
  $('hud').classList.add('hidden');
  $('btnContinue').disabled = !hasSave();
  $('btnContinue').style.display = hasSave() ? '' : 'none';
  requestAnimationFrame(loop);
}

boot();
