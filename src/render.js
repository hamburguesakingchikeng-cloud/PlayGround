// ============================================================
// LA ESPADA CELESTIAL — renderizado
// ============================================================
import { clamp, lerp, dist, TAU, easeOutCubic, seededFor, ELEMENTS } from './core.js';
import { PORTRAITS, CREATURES, ITEMS } from './data.js';
import { drawHumanoid, drawCreatureShape, drawCreature, mix } from './art.js';
import { drawProp, drawBuilding } from './art_world.js';
import { drawPortrait, drawPreview, drawTitleArt, drawCinematicArt } from './art_ui.js';
import { drawMinimap, drawZoneMap, drawWorldMap } from './art_map.js';

const THEMES = {
  village: { g1: '#7ba456', g2: '#426e3e', g3: '#5d8a47', path: '#c9a86a', path2: '#b08a55', water: '#2f7f9e', water2: '#8fd8e8', edge: '#2c4a2a', fog: 'rgba(255,220,150,.04)', grade: 'rgba(255,196,94,.045)' },
  meadow: { g1: '#93bd60', g2: '#4f7f43', g3: '#6d9e4d', path: '#cbb076', path2: '#b08a55', water: '#2f8fae', water2: '#9fe8ff', edge: '#335a32', fog: 'rgba(255,235,180,.035)', grade: 'rgba(255,214,120,.04)' },
  forest: { g1: '#477a52', g2: '#1d3b33', g3: '#2f5a45', path: '#8a7a55', path2: '#6f6144', water: '#2b6f72', water2: '#7de8d0', edge: '#12271f', fog: 'rgba(120,255,210,.03)', grade: 'rgba(80,220,180,.03)' },
  ruins: { g1: '#7d8466', g2: '#48513f', g3: '#626b51', path: '#a9a386', path2: '#8d876d', water: '#3f6f7a', water2: '#9fe8ff', edge: '#2c3328', fog: 'rgba(200,230,255,.03)', grade: 'rgba(180,210,255,.03)' },
  pass: { g1: '#554039', g2: '#2b2020', g3: '#40302c', path: '#7a5a48', path2: '#5e4438', water: '#ff5a36', water2: '#ffd166', edge: '#1a1212', fog: 'rgba(255,120,70,.05)', grade: 'rgba(255,100,50,.06)' },
  city: { g1: '#5e4a42', g2: '#322522', g3: '#493733', path: '#7a5a48', path2: '#5e4438', water: '#ff5a36', water2: '#ffd166', edge: '#1e1512', fog: 'rgba(255,130,80,.05)', grade: 'rgba(255,120,60,.06)' },
  fortress: { g1: '#3f2a2a', g2: '#1b1113', g3: '#2e1d1e', path: '#5a3a32', path2: '#442a24', water: '#ff5a36', water2: '#ffd166', edge: '#10080a', fog: 'rgba(255,90,50,.06)', grade: 'rgba(255,70,40,.08)' },
  temple: { g1: '#44557a', g2: '#1c2742', g3: '#303f63', path: '#8fa3c7', path2: '#6f83a7', water: '#5aa7e2', water2: '#d8f5ff', edge: '#101a30', fog: 'rgba(160,230,255,.04)', grade: 'rgba(120,200,255,.05)' },
  library: { g1: '#32314f', g2: '#151426', g3: '#24233d', path: '#5a527a', path2: '#463f63', water: '#8b6bff', water2: '#dcc9ff', edge: '#0c0b18', fog: 'rgba(180,140,255,.04)', grade: 'rgba(160,120,255,.06)' },
  void: { g1: '#1a1038', g2: '#05030f', g3: '#100827', path: '#3a2a6a', path2: '#2a1d50', water: '#8b6bff', water2: '#dcc9ff', edge: '#020106', fog: 'rgba(160,120,255,.05)', grade: 'rgba(120,90,255,.07)' },
};

function rr(ctx, x, y, w, h, r) {
  r = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
function glow(ctx, x, y, r, color, alpha = 0.5) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, color); g.addColorStop(0.35, color); g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.globalAlpha = alpha; ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
  ctx.globalAlpha = 1;
}
function shadow(ctx, x, y, rx, ry, alpha = 0.28) {
  ctx.save(); ctx.globalAlpha = alpha; ctx.fillStyle = '#000';
  ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, TAU); ctx.fill(); ctx.restore();
}
function poly(ctx, pts, fill) {
  ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
  ctx.closePath(); ctx.fillStyle = fill; ctx.fill();
}
function lerpColor(a, b, t) {
  const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16);
  const ar = pa >> 16, ag = (pa >> 8) & 255, ab = pa & 255;
  const br = pb >> 16, bg = (pb >> 8) & 255, bb = pb & 255;
  return `rgb(${Math.round(lerp(ar, br, t))},${Math.round(lerp(ag, bg, t))},${Math.round(lerp(ab, bb, t))})`;
}

export class Renderer {
  constructor(canvas, titleCanvas, cineCanvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.titleCanvas = titleCanvas;
    this.titleCtx = titleCanvas?.getContext('2d');
    this.cineCanvas = cineCanvas;
    this.cineCtx = cineCanvas?.getContext('2d');
    this.dpr = 1;
    this.w = 0; this.h = 0;
    this.zoom = 1;
    this.camera = { x: 0, y: 0, tx: 0, ty: 0, shake: 0, shakeTime: 0, sx: 0, sy: 0 };
    this.zoneBg = null;
    this.zoneBgId = null;
    this.ambient = [];
    this.lastZoneId = null;
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.dpr = dpr;
    this.w = window.innerWidth;
    this.h = window.innerHeight;
    this.canvas.width = Math.floor(this.w * dpr);
    this.canvas.height = Math.floor(this.h * dpr);
    this.canvas.style.width = this.w + 'px';
    this.canvas.style.height = this.h + 'px';
    if (this.titleCanvas) {
      this.titleCanvas.width = Math.floor(this.w * dpr);
      this.titleCanvas.height = Math.floor(this.h * dpr);
      this.titleCanvas.style.width = this.w + 'px';
      this.titleCanvas.style.height = this.h + 'px';
    }
    if (this.cineCanvas) {
      this.cineCanvas.width = Math.floor(this.w * dpr);
      this.cineCanvas.height = Math.floor(this.h * dpr);
      this.cineCanvas.style.width = this.w + 'px';
      this.cineCanvas.style.height = this.h + 'px';
    }
    this.zoom = clamp(Math.max(this.w / 1280, this.h / 720), 0.8, 1.45);
  }

  screenToWorld(sx, sy) {
    const cssX = sx / this.dpr, cssY = sy / this.dpr;
    return { x: this.camera.x + cssX / this.zoom, y: this.camera.y + cssY / this.zoom };
  }
  worldToScreen(x, y) {
    return { x: (x - this.camera.x) * this.zoom, y: (y - this.camera.y) * this.zoom };
  }

  updateCamera(game, dt) {
    const p = game.player;
    if (!p) return;
    const vw = this.w / this.zoom, vh = this.h / this.zoom;
    const lookX = Math.cos(p.facing) * 40 + (p.vx || 0) * 0.12;
    const lookY = Math.sin(p.facing) * 24 + (p.vy || 0) * 0.08;
    let tx = p.x + lookX - vw / 2;
    let ty = p.y + lookY - vh / 2;
    const zone = game.zone;
    if (zone) {
      tx = clamp(tx, 0, Math.max(0, zone.w - vw));
      ty = clamp(ty, 0, Math.max(0, zone.h - vh));
    }
    const k = clamp(dt * 5.5, 0, 1);
    this.camera.x = lerp(this.camera.x, tx, k);
    this.camera.y = lerp(this.camera.y, ty, k);
    if (this.camera.shakeTime > 0) {
      this.camera.shakeTime -= dt;
      const s = this.camera.shake * (this.camera.shakeTime > 0 ? 1 : 0);
      this.camera.sx = (Math.random() - 0.5) * s * 2;
      this.camera.sy = (Math.random() - 0.5) * s * 2;
    } else { this.camera.sx = 0; this.camera.sy = 0; this.camera.shake = 0; }
  }

  // ============================================================
  // FONDO DE ZONA
  // ============================================================
  buildZoneBackground(zone) {
    if (this.zoneBgId === zone.id && this.zoneBg) return this.zoneBg;
    const c = document.createElement('canvas');
    c.width = zone.w; c.height = zone.h;
    const ctx = c.getContext('2d');
    const pal = THEMES[zone.theme] || THEMES.village;
    const rng = seededFor('bg', zone.id);

    // base
    const g = ctx.createLinearGradient(0, 0, zone.w, zone.h);
    g.addColorStop(0, pal.g1); g.addColorStop(0.55, pal.g3); g.addColorStop(1, pal.g2);
    ctx.fillStyle = g; ctx.fillRect(0, 0, zone.w, zone.h);

    if (zone.theme === 'void') {
      // abismo estrellado
      ctx.fillStyle = '#05030f'; ctx.fillRect(0, 0, zone.w, zone.h);
      for (let i = 0; i < 420; i++) {
        const x = rng() * zone.w, y = rng() * zone.h, a = 0.15 + rng() * 0.75, r = rng() * 1.8 + 0.4;
        ctx.fillStyle = `rgba(${180 + rng() * 60},${150 + rng() * 80},255,${a})`;
        ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
      }
      // plataformas flotantes
      for (let i = 0; i < 14; i++) {
        const x = 100 + rng() * (zone.w - 200), y = 100 + rng() * (zone.h - 200);
        const rx = 100 + rng() * 220, ry = 50 + rng() * 90;
        const pg = ctx.createRadialGradient(x, y, 10, x, y, rx);
        pg.addColorStop(0, 'rgba(70,50,120,.75)'); pg.addColorStop(1, 'rgba(20,10,45,0)');
        ctx.fillStyle = pg; ctx.beginPath(); ctx.ellipse(x, y, rx, ry, rng() * 3, 0, TAU); ctx.fill();
        ctx.strokeStyle = 'rgba(160,120,255,.25)'; ctx.lineWidth = 2; ctx.stroke();
      }
    } else {
      // manchas de terreno
      for (let i = 0; i < 90; i++) {
        const x = rng() * zone.w, y = rng() * zone.h, rx = 60 + rng() * 220, ry = 30 + rng() * 130;
        ctx.save(); ctx.globalAlpha = 0.06 + rng() * 0.09;
        ctx.fillStyle = rng() < 0.5 ? pal.g2 : pal.g1;
        ctx.beginPath(); ctx.ellipse(x, y, rx, ry, rng() * 3, 0, TAU); ctx.fill(); ctx.restore();
      }
    }

    // textura
    const noise = this._noiseTexture();
    if (noise) {
      const pat = ctx.createPattern(noise, 'repeat');
      ctx.save(); ctx.globalAlpha = zone.theme === 'void' ? 0.12 : 0.18; ctx.fillStyle = pat; ctx.fillRect(0, 0, zone.w, zone.h); ctx.restore();
    }

    // senderos
    for (const path of zone.paths) {
      if (path.length < 2) continue;
      ctx.save(); ctx.lineJoin = 'round'; ctx.lineCap = 'round';
      ctx.strokeStyle = zone.theme === 'void' ? 'rgba(90,70,150,.65)' : pal.path2;
      ctx.lineWidth = 74; ctx.beginPath(); ctx.moveTo(path[0].x, path[0].y);
      for (let i = 1; i < path.length; i++) ctx.lineTo(path[i].x, path[i].y); ctx.stroke();
      ctx.strokeStyle = zone.theme === 'void' ? 'rgba(140,110,220,.45)' : pal.path;
      ctx.lineWidth = 58; ctx.beginPath(); ctx.moveTo(path[0].x, path[0].y);
      for (let i = 1; i < path.length; i++) ctx.lineTo(path[i].x, path[i].y); ctx.stroke();
      if (zone.theme !== 'void') {
        ctx.globalAlpha = 0.16; ctx.strokeStyle = '#fff'; ctx.lineWidth = 1;
        for (let i = 0; i < path.length - 1; i++) {
          const a = path[i], b = path[i + 1];
          const len = dist(a.x, a.y, b.x, b.y);
          for (let d = 20; d < len; d += 34) {
            const t = d / len, x = lerp(a.x, b.x, t) + (rng() - 0.5) * 34, y = lerp(a.y, b.y, t) + (rng() - 0.5) * 24;
            ctx.beginPath(); ctx.arc(x, y, 1.2 + rng() * 1.6, 0, TAU); ctx.stroke();
          }
        }
        ctx.globalAlpha = 1;
      }
      ctx.restore();
    }

    // suelos de ruinas / templos
    if (zone.theme === 'ruins' || zone.theme === 'temple' || zone.theme === 'library') {
      for (const path of zone.paths) {
        if (path.length < 2) continue;
        ctx.save(); ctx.globalAlpha = 0.25; ctx.strokeStyle = zone.theme === 'temple' ? '#cfd8e8' : '#c9c2a8';
        ctx.lineWidth = 48; ctx.setLineDash([28, 5]); ctx.beginPath(); ctx.moveTo(path[0].x, path[0].y);
        for (let i = 1; i < path.length; i++) ctx.lineTo(path[i].x, path[i].y); ctx.stroke(); ctx.restore();
      }
    }

    // agua base
    for (const w of zone.water) {
      const wg = ctx.createRadialGradient(w.x - w.rx * 0.3, w.y - w.ry * 0.3, 10, w.x, w.y, Math.max(w.rx, w.ry));
      wg.addColorStop(0, pal.water2); wg.addColorStop(0.45, pal.water); wg.addColorStop(1, '#0b2530');
      ctx.fillStyle = wg; ctx.beginPath(); ctx.ellipse(w.x, w.y, w.rx, w.ry, 0, 0, TAU); ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,.18)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(w.x, w.y, w.rx * 0.97, w.ry * 0.97, 0, 0, TAU); ctx.stroke();
    }
    // lava base
    for (const l of zone.lava) {
      const lg = ctx.createRadialGradient(l.x - l.rx * 0.3, l.y - l.ry * 0.3, 5, l.x, l.y, Math.max(l.rx, l.ry));
      lg.addColorStop(0, '#fff3c4'); lg.addColorStop(0.25, pal.water2); lg.addColorStop(0.7, '#c93a1a'); lg.addColorStop(1, '#3a0a06');
      ctx.fillStyle = lg; ctx.beginPath(); ctx.ellipse(l.x, l.y, l.rx, l.ry, 0, 0, TAU); ctx.fill();
      ctx.strokeStyle = 'rgba(255,210,120,.55)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(l.x, l.y, l.rx * 0.96, l.ry * 0.96, 0, 0, TAU); ctx.stroke();
    }

    // decoración estática
    const decor = zone.decor.slice().sort((a, b) => a.y - b.y);
    for (const d of decor) this._drawDecor(ctx, d, zone, 0);
    // huellas / detalles
    if (zone.theme === 'village' || zone.theme === 'meadow') {
      for (let i = 0; i < 30; i++) {
        const x = rng() * zone.w, y = rng() * zone.h;
        ctx.save(); ctx.globalAlpha = 0.07; ctx.strokeStyle = '#fff'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(x, y, 20 + rng() * 80, 0, TAU); ctx.stroke(); ctx.restore();
      }
    }

    this.zoneBg = c;
    this.zoneBgId = zone.id;
    return c;
  }

  _noiseTexture() {
    if (this._noise) return this._noise;
    const c = document.createElement('canvas'); c.width = c.height = 256;
    const ctx = c.getContext('2d'); const img = ctx.createImageData(256, 256);
    for (let i = 0; i < img.data.length; i += 4) {
      const v = Math.random() * 255;
      img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
      img.data[i + 3] = Math.random() < 0.5 ? 18 : 0;
    }
    ctx.putImageData(img, 0, 0);
    this._noise = c; return c;
  }

  _drawDecor(ctx, d, zone, time) {
    const pal = THEMES[zone.theme] || THEMES.village;
    const sway = Math.sin(time * 1.5 + d.seed) * 2;
    switch (d.type) {
      case 'grass': {
        ctx.save(); ctx.strokeStyle = zone.theme === 'pass' || zone.theme === 'city' || zone.theme === 'fortress' ? 'rgba(120,90,60,.5)' : 'rgba(60,120,50,.5)';
        ctx.lineWidth = 1.2 * d.s; ctx.lineCap = 'round';
        for (let i = -1; i <= 1; i++) {
          ctx.beginPath(); ctx.moveTo(d.x + i * 3 * d.s, d.y);
          ctx.quadraticCurveTo(d.x + i * 5 * d.s + sway, d.y - 9 * d.s, d.x + i * 7 * d.s + sway, d.y - 15 * d.s); ctx.stroke();
        }
        ctx.restore(); break;
      }
      case 'flower': case 'flower2': {
        const colors = d.type === 'flower' ? ['#f4dfa3', '#e8a0c0', '#9fd6ff', '#ffd166'] : ['#dcc9ff', '#ff9a6a', '#c7f0e0'];
        const col = colors[Math.floor(d.seed) % colors.length];
        ctx.save(); ctx.translate(d.x, d.y); ctx.scale(d.s, d.s);
        ctx.strokeStyle = 'rgba(50,100,40,.6)'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(sway * 0.2, -8); ctx.stroke();
        ctx.fillStyle = col;
        for (let i = 0; i < 5; i++) { const a = i / 5 * TAU; ctx.beginPath(); ctx.arc(Math.cos(a) * 2.4, -8 + Math.sin(a) * 2.4, 1.6, 0, TAU); ctx.fill(); }
        ctx.fillStyle = '#fff3c4'; ctx.beginPath(); ctx.arc(0, -8, 1.1, 0, TAU); ctx.fill();
        ctx.restore(); break;
      }
      case 'mushroom': case 'glowshroom': {
        ctx.save(); ctx.translate(d.x, d.y); ctx.scale(d.s, d.s);
        const col = d.type === 'glowshroom' ? '#7de8d0' : '#c95a4a';
        ctx.fillStyle = '#d8c9a8'; ctx.fillRect(-1.5, -8, 3, 8);
        ctx.fillStyle = col; ctx.beginPath(); ctx.ellipse(0, -8, 7, 4, 0, Math.PI, TAU); ctx.fill();
        if (d.type === 'glowshroom') glow(ctx, 0, -8, 18, 'rgba(125,232,208,.35)', 0.5);
        ctx.restore(); break;
      }
      case 'bush': case 'berryBush': {
        ctx.save(); ctx.translate(d.x, d.y); ctx.scale(d.s, d.s); shadow(ctx, 0, 0, 14, 5, 0.2);
        const bg = ctx.createRadialGradient(-3, -8, 2, 0, -6, 16);
        bg.addColorStop(0, zone.theme === 'pass' || zone.theme === 'city' ? '#6a5a44' : '#6fa356'); bg.addColorStop(1, '#2f5a32');
        ctx.fillStyle = bg;
        for (const [ox, oy, r] of [[-7, -5, 8], [5, -6, 8], [0, -11, 9], [-2, -2, 7]]) { ctx.beginPath(); ctx.arc(ox, oy, r, 0, TAU); ctx.fill(); }
        if (d.type === 'berryBush') { ctx.fillStyle = '#d94a4a'; for (const [ox, oy] of [[-5, -8], [5, -5], [1, -12]]) { ctx.beginPath(); ctx.arc(ox, oy, 1.8, 0, TAU); ctx.fill(); } }
        ctx.restore(); break;
      }
      case 'debris': case 'rubble': {
        ctx.save(); ctx.translate(d.x, d.y); ctx.scale(d.s, d.s);
        ctx.fillStyle = 'rgba(120,115,100,.45)';
        for (let i = 0; i < 4; i++) { const a = d.seed + i; ctx.fillRect(Math.cos(a) * 8, Math.sin(a) * 4 - 2, 5 + (i % 2) * 4, 3); }
        ctx.restore(); break;
      }
    }
  }

  // ============================================================
  // RENDER PRINCIPAL
  // ============================================================
  render(game, dt) {
    const ctx = this.ctx;
    const dpr = this.dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, this.w, this.h);
    if (!game.zone || !game.player) {
      ctx.fillStyle = '#05070c'; ctx.fillRect(0, 0, this.w, this.h);
      return;
    }
    this.updateCamera(game, dt);
    const zoom = this.zoom;
    const zone = game.zone;
    const bg = this.buildZoneBackground(zone);
    ctx.save();
    ctx.translate(-this.camera.x * zoom + this.camera.sx, -this.camera.y * zoom + this.camera.sy);
    ctx.scale(zoom, zoom);

    // fondo
    ctx.drawImage(bg, 0, 0);

    // animaciones de agua y lava
    this._drawWaterAnim(ctx, zone, game.time);
    this._drawLavaAnim(ctx, zone, game.time);

    // recoger dibujables
    const drawables = [];
    for (const b of zone.buildings) drawables.push({ y: b.y + b.h, draw: () => this._drawBuilding(ctx, b, zone, game.time) });
    for (const p of zone.props) drawables.push({ y: p.y, draw: () => this._drawProp(ctx, p, zone, game.time) });
    for (const o of zone.objects) drawables.push({ y: o.y, draw: () => this._drawObject(ctx, o, zone, game, game.time) });
    for (const c of zone.chests) drawables.push({ y: c.y, draw: () => this._drawChest(ctx, c, game.time) });
    for (const s of zone.shrines) drawables.push({ y: s.y, draw: () => this._drawShrine(ctx, s, game, game.time) });
    for (const l of zone.loreStones) drawables.push({ y: l.y, draw: () => this._drawLoreStone(ctx, l, game, game.time) });
    for (const h of zone.herbs) if (!h.gathered) drawables.push({ y: h.y, draw: () => this._drawHerb(ctx, h, game, game.time) });
    for (const p of zone.portals) drawables.push({ y: p.y, draw: () => this._drawPortal(ctx, p, game, game.time) });
    for (const n of zone.npcs) drawables.push({ y: n.y, draw: () => this._drawNPC(ctx, n, game, game.time) });
    for (const e of game.enemies) if (!e.dead || e.deathTime < 1.2) drawables.push({ y: e.y, draw: () => this._drawEnemy(ctx, e, game, game.time) });
    if (game.companion) drawables.push({ y: game.companion.y, draw: () => this._drawCompanion(ctx, game.companion, game, game.time) });
    drawables.push({ y: game.player.y, draw: () => this._drawPlayer(ctx, game.player, game, game.time) });
    for (const l of game.loot) drawables.push({ y: l.y, draw: () => this._drawLoot(ctx, l, game.time) });

    drawables.sort((a, b) => a.y - b.y);
    for (const d of drawables) d.draw();

    // efectos/proyectiles
    this._drawProjectiles(ctx, game, game.time);
    this._drawEffects(ctx, game, game.time);
    this._drawParticles(ctx, game, game.time);
    this._drawFloatingTexts(ctx, game, game.time);

    // ambiente del mundo
    this._drawAmbient(ctx, game, dt, game.time);
    ctx.restore();

    // overlays de pantalla
    this._drawScreenOverlays(ctx, game, game.time);
  }

  _drawWaterAnim(ctx, zone, time) {
    for (const w of zone.water) {
      ctx.save();
      ctx.beginPath(); ctx.ellipse(w.x, w.y, w.rx, w.ry, 0, 0, TAU); ctx.clip();
      for (let i = 0; i < 6; i++) {
        const t = (time * 0.15 + i * 0.17) % 1;
        ctx.globalAlpha = 0.16 * (1 - t);
        ctx.strokeStyle = '#d8f5ff'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.ellipse(w.x - w.rx * 0.2, w.y - w.ry * 0.1, w.rx * (0.3 + t * 0.6), w.ry * (0.25 + t * 0.5), 0.2, 0, TAU); ctx.stroke();
      }
      ctx.globalAlpha = 0.22; ctx.fillStyle = '#eaffff';
      for (let i = 0; i < 8; i++) {
        const x = w.x + Math.sin(time * 0.6 + i * 2.1) * w.rx * 0.7;
        const y = w.y + Math.cos(time * 0.4 + i * 1.7) * w.ry * 0.6;
        ctx.beginPath(); ctx.arc(x, y, 1.5, 0, TAU); ctx.fill();
      }
      ctx.restore();
    }
  }

  _drawLavaAnim(ctx, zone, time) {
    for (const l of zone.lava) {
      ctx.save();
      ctx.beginPath(); ctx.ellipse(l.x, l.y, l.rx, l.ry, 0, 0, TAU); ctx.clip();
      glow(ctx, l.x, l.y, Math.max(l.rx, l.ry) * 1.25, 'rgba(255,90,40,.35)', 0.6);
      ctx.globalAlpha = 0.5; ctx.strokeStyle = '#ffd166'; ctx.lineWidth = 2;
      for (let i = 0; i < 5; i++) {
        const a = time * 0.25 + i * 1.4;
        const x = l.x + Math.cos(a) * l.rx * 0.45, y = l.y + Math.sin(a * 1.3) * l.ry * 0.4;
        ctx.beginPath(); ctx.ellipse(x, y, 8 + Math.sin(time + i) * 4, 3, a, 0, TAU); ctx.stroke();
      }
      ctx.restore();
    }
  }
  // ============================================================
  // MUNDO: EDIFICIOS, PROPS Y OBJETOS
  // ============================================================
  _drawBuilding(ctx, b, zone, time) {
    drawBuilding(ctx, b, zone, time);
  }

  _drawProp(ctx, p, zone, time) {
    drawProp(ctx, p, zone, time);
  }

  _drawObject(ctx, o, zone, game, time) {
    const t = time || 0;
    const done = game.objectDone ? game.objectDone(o) : false;
    ctx.save();
    ctx.translate(o.x, o.y);
    if (o.type === 'altar_gem') {
      shadow(ctx, 0, 2, 36, 11, 0.34);
      ctx.fillStyle = '#6b6a5c'; ctx.beginPath(); ctx.ellipse(0, -2, 32, 12, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = '#8d8a76'; ctx.beginPath(); ctx.ellipse(0, -8, 25, 9, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = '#4b4a40'; ctx.fillRect(-18, -22, 36, 15);
      ctx.strokeStyle = '#c9a86a'; ctx.lineWidth = 1.4; ctx.strokeRect(-15, -19, 30, 9);
      const pulse = 0.7 + Math.sin(t * 2.2) * 0.2;
      glow(ctx, 0, -40, 42 * pulse, done ? 'rgba(255,209,102,.6)' : 'rgba(159,232,255,.55)', 0.8);
      if (!done) {
        ctx.save(); ctx.translate(0, -42); ctx.rotate(t * 0.55);
        poly(ctx, [[0, -15], [9, 0], [0, 15], [-9, 0]], '#9fe8ff');
        poly(ctx, [[0, -9], [5, 0], [0, 9], [-5, 0]], '#ffffff');
        ctx.restore();
      } else {
        ctx.strokeStyle = 'rgba(159,232,255,.35)'; ctx.beginPath(); ctx.arc(0, -40, 24, 0, TAU); ctx.stroke();
      }
      for (let i = 0; i < 4; i++) {
        const a = t * 0.5 + i * TAU / 4;
        ctx.fillStyle = 'rgba(159,232,255,.45)';
        ctx.beginPath(); ctx.arc(Math.cos(a) * 24, -40 + Math.sin(a) * 10, 1.7, 0, TAU); ctx.fill();
      }
    } else if (o.type === 'altar_tear') {
      shadow(ctx, 0, 2, 34, 10, 0.35);
      ctx.fillStyle = '#3a2520'; ctx.beginPath(); ctx.ellipse(0, -2, 31, 11, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = '#5a3428'; ctx.fillRect(-20, -20, 40, 18);
      ctx.strokeStyle = '#ffb27a'; ctx.globalAlpha = 0.5; ctx.strokeRect(-16, -17, 32, 11); ctx.globalAlpha = 1;
      glow(ctx, 0, -34, 38, 'rgba(255,90,54,.55)', 0.7);
      if (!done) {
        ctx.save(); ctx.translate(0, -38); ctx.rotate(Math.sin(t * 1.3) * 0.2);
        ctx.fillStyle = '#ff8a5c'; ctx.beginPath(); ctx.ellipse(0, 0, 7, 12, 0, 0, TAU); ctx.fill();
        ctx.fillStyle = '#fff3c4'; ctx.beginPath(); ctx.ellipse(-2, -3, 2.5, 5, 0.2, 0, TAU); ctx.fill();
        ctx.restore();
      }
      for (let i = 0; i < 5; i++) {
        const a = t * 0.8 + i * 1.3;
        ctx.fillStyle = 'rgba(255,138,92,.55)';
        ctx.beginPath(); ctx.arc(Math.cos(a) * (16 + i * 3), -24 - Math.abs(Math.sin(a)) * 22, 1.5, 0, TAU); ctx.fill();
      }
    } else if (o.type === 'altar_truth') {
      shadow(ctx, 0, 2, 36, 11, 0.34);
      ctx.fillStyle = '#3a3a4e'; ctx.beginPath(); ctx.ellipse(0, -2, 33, 12, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = '#4a4a63'; ctx.fillRect(-26, -18, 52, 16);
      ctx.strokeStyle = '#b48cff'; ctx.globalAlpha = 0.55; ctx.strokeRect(-21, -15, 42, 10); ctx.globalAlpha = 1;
      glow(ctx, 0, -34, 42, 'rgba(180,140,255,.5)', 0.7);
      if (!done) {
        ctx.save(); ctx.translate(0, -36);
        const flip = Math.sin(t * 0.9) * 0.22;
        ctx.fillStyle = '#e8dfc8'; ctx.save(); ctx.rotate(-0.12 + flip); ctx.fillRect(-15, -12, 14, 23); ctx.restore();
        ctx.fillStyle = '#f2ead6'; ctx.save(); ctx.rotate(0.12 - flip); ctx.fillRect(1, -12, 14, 23); ctx.restore();
        ctx.strokeStyle = '#8b6bff'; ctx.lineWidth = 0.8; ctx.beginPath(); ctx.moveTo(0, -10); ctx.lineTo(0, 9); ctx.stroke();
        ctx.restore();
      }
      for (let i = 0; i < 6; i++) {
        const a = t * 0.4 + i * 1.05;
        ctx.strokeStyle = `rgba(180,140,255,${0.2 + Math.sin(t + i) * 0.12})`;
        ctx.beginPath(); ctx.arc(0, -34, 20 + i * 3, a, a + 1.2); ctx.stroke();
      }
    } else if (o.type === 'altar_convergence') {
      shadow(ctx, 0, 4, 42, 12, 0.3);
      ctx.fillStyle = '#21173f'; ctx.beginPath(); ctx.ellipse(0, 0, 40, 13, 0, 0, TAU); ctx.fill();
      glow(ctx, 0, -46, 58, 'rgba(139,107,255,.6)', 0.8);
      if (!done) {
        ctx.save(); ctx.translate(0, -48);
        ctx.strokeStyle = '#dcc9ff'; ctx.globalAlpha = 0.8; ctx.lineWidth = 1.2;
        for (let i = 0; i < 3; i++) {
          ctx.save(); ctx.rotate(t * 0.25 + i * TAU / 3);
          ctx.beginPath(); ctx.ellipse(0, 0, 30 - i * 6, 10, 0, 0, TAU); ctx.stroke(); ctx.restore();
        }
        glow(ctx, 0, 0, 28, 'rgba(220,201,255,.7)', 0.9);
        ctx.fillStyle = '#f4eaff'; ctx.beginPath(); ctx.arc(0, 0, 5 + Math.sin(t * 2) * 1.2, 0, TAU); ctx.fill();
        ctx.restore();
      } else {
        ctx.strokeStyle = 'rgba(180,140,255,.35)'; ctx.beginPath(); ctx.arc(0, -40, 24, 0, TAU); ctx.stroke();
      }
    } else if (o.type === 'trial_altar') {
      const active = game.trialState?.includes(o.index);
      shadow(ctx, 0, 2, 22, 7, 0.3);
      ctx.fillStyle = '#59637a'; ctx.beginPath(); ctx.ellipse(0, -2, 21, 7, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = active ? '#9fe8ff' : '#7a879e'; ctx.fillRect(-12, -20, 24, 18);
      ctx.fillStyle = active ? '#e8fbff' : '#aab6ca'; ctx.fillRect(-9, -17, 18, 3);
      glow(ctx, 0, -28, active ? 34 : 20, active ? 'rgba(159,232,255,.65)' : 'rgba(159,232,255,.2)', 0.7);
      ctx.fillStyle = active ? '#ffffff' : '#d8e2f0';
      ctx.font = 'bold 13px serif'; ctx.textAlign = 'center'; ctx.fillText(active ? '✦' : '◇', 0, -25);
    } else if (o.type === 'lost_echo') {
      const saved = done;
      glow(ctx, 0, -20, saved ? 16 : 34, saved ? 'rgba(125,220,154,.35)' : 'rgba(180,140,255,.5)', 0.8);
      if (!saved) {
        ctx.fillStyle = '#dcc9ff';
        ctx.beginPath(); ctx.ellipse(0, -20 + Math.sin(t * 2) * 3, 8, 10, 0, 0, TAU); ctx.fill();
        ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(-3, -23, 1.3, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.arc(3, -23, 1.3, 0, TAU); ctx.fill();
        for (let i = 0; i < 5; i++) {
          const a = t * 0.7 + i * 1.3;
          ctx.globalAlpha = 0.4 + Math.sin(t + i) * 0.2;
          ctx.fillStyle = '#b48cff';
          ctx.beginPath(); ctx.arc(Math.cos(a) * 20, -20 + Math.sin(a * 1.3) * 16, 1.5, 0, TAU); ctx.fill();
        }
        ctx.globalAlpha = 1;
      } else {
        ctx.fillStyle = 'rgba(125,220,154,.6)'; ctx.beginPath(); ctx.arc(0, -10, 3, 0, TAU); ctx.fill();
      }
    } else if (o.type === 'bell') {
      shadow(ctx, 0, 2, 26, 8, 0.3);
      ctx.fillStyle = '#4a4038'; ctx.fillRect(-3, -44, 6, 44);
      ctx.fillStyle = '#8a6a3a'; ctx.beginPath(); ctx.arc(0, -48, 7, 0, TAU); ctx.fill();
      ctx.fillStyle = done ? '#b9a56a' : '#6a5a44';
      ctx.beginPath(); ctx.moveTo(-16, -22); ctx.quadraticCurveTo(-16, -44, 0, -44); ctx.quadraticCurveTo(16, -44, 16, -22); ctx.lineTo(12, -16); ctx.lineTo(-12, -16); ctx.closePath(); ctx.fill();
      if (!done) { ctx.strokeStyle = '#3a2a20'; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(-4, -38); ctx.lineTo(3, -30); ctx.lineTo(-2, -22); ctx.stroke(); }
      if (done) { ctx.strokeStyle = 'rgba(255,209,102,.35)'; ctx.beginPath(); ctx.arc(0, -30, 28 + Math.sin(t * 2) * 2, 0, TAU); ctx.stroke(); }
    } else if (o.type === 'rune') {
      glow(ctx, 0, -8, 18, 'rgba(159,232,255,.35)', 0.7);
      ctx.strokeStyle = done ? '#9fe8ff' : 'rgba(159,232,255,.35)'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(0, -8, 10, 0, TAU); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, -18); ctx.lineTo(0, 2); ctx.moveTo(-8, -8); ctx.lineTo(8, -8); ctx.stroke();
    } else {
      glow(ctx, 0, -16, 22, 'rgba(255,209,102,.3)', 0.6);
      ctx.fillStyle = '#6a5a44'; ctx.beginPath(); ctx.arc(0, -10, 7, 0, TAU); ctx.fill();
    }
    if (game.nearInteractable && game.nearInteractable.object === o && !done) {
      this._interactGlyph(ctx, 0, -70, t);
    }
    ctx.restore();
  }

  _interactGlyph(ctx, x, y, t) {
    ctx.save();
    ctx.globalAlpha = 0.75 + Math.sin(t * 3) * 0.2;
    ctx.fillStyle = 'rgba(5,9,16,.8)'; ctx.strokeStyle = '#d9b46a'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(x, y, 10, 0, TAU); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#f4dfa3'; ctx.font = 'bold 12px serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('E', x, y + 1);
    ctx.restore();
  }

  _drawChest(ctx, c, time) {
    const t = time || 0;
    ctx.save(); ctx.translate(c.x, c.y);
    const tierCol = c.tier >= 3 ? '#ffd06a' : c.tier === 2 ? '#9fe8ff' : '#c9a86a';
    shadow(ctx, 0, 2, 19, 6, 0.32);
    if (!c.opened) {
      glow(ctx, 0, -13, 26 + Math.sin(t * 2 + c.x) * 3, c.tier >= 3 ? 'rgba(255,208,106,.35)' : 'rgba(159,232,255,.2)', 0.6);
      ctx.fillStyle = '#5a3a24'; rr(ctx, -17, -16, 34, 17, 3); ctx.fill();
      ctx.fillStyle = '#7a5230'; rr(ctx, -17, -24, 34, 11, 5); ctx.fill();
      ctx.strokeStyle = tierCol; ctx.lineWidth = 1.4; ctx.strokeRect(-15, -14, 30, 13);
      ctx.fillStyle = tierCol; ctx.fillRect(-2, -17, 4, 7);
      ctx.fillStyle = '#2a1a10'; ctx.beginPath(); ctx.arc(0, -12, 2.3, 0, TAU); ctx.fill();
      for (let i = 0; i < 3; i++) {
        const a = t * 1.3 + i * 2.1;
        ctx.fillStyle = tierCol; ctx.globalAlpha = 0.5 + Math.sin(t * 2 + i) * 0.3;
        ctx.beginPath(); ctx.arc(Math.cos(a) * 20, -20 + Math.sin(a) * 10, 1.2, 0, TAU); ctx.fill();
      }
      ctx.globalAlpha = 1;
    } else {
      ctx.fillStyle = '#4a3020'; rr(ctx, -17, -12, 34, 13, 3); ctx.fill();
      ctx.fillStyle = '#3a2418'; rr(ctx, -17, -22, 34, 7, 2); ctx.fill();
      ctx.strokeStyle = 'rgba(201,168,106,.4)'; ctx.lineWidth = 1; ctx.strokeRect(-14, -10, 28, 9);
      ctx.globalAlpha = 0.5; glow(ctx, 0, -8, 12, tierCol, 0.4); ctx.globalAlpha = 1;
    }
    ctx.restore();
  }

  _drawShrine(ctx, s, game, time) {
    const t = time || 0;
    const active = s.active || game.shrineActivated?.(s);
    ctx.save(); ctx.translate(s.x, s.y);
    shadow(ctx, 0, 3, 30, 9, 0.32);
    ctx.fillStyle = '#6e7266'; ctx.beginPath(); ctx.ellipse(0, 0, 28, 10, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = '#8d9282'; ctx.beginPath(); ctx.ellipse(0, -6, 22, 8, 0, 0, TAU); ctx.fill();
    for (let i = 0; i < 4; i++) {
      const a = i * TAU / 4 + 0.4;
      ctx.fillStyle = '#767a6e';
      ctx.fillRect(Math.cos(a) * 19 - 2, -24 + Math.sin(a) * 6, 4, 22);
      glow(ctx, Math.cos(a) * 19, -25 + Math.sin(a) * 6, 8, active ? 'rgba(159,232,255,.5)' : 'rgba(217,180,106,.2)', 0.6);
    }
    ctx.strokeStyle = active ? '#9fe8ff' : '#d9b46a'; ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.arc(0, -12, 17, 0, TAU); ctx.stroke();
    ctx.beginPath(); ctx.arc(0, -12, 12, 0, TAU); ctx.stroke();
    ctx.save(); ctx.translate(0, -12);
    ctx.strokeStyle = active ? '#e8fbff' : 'rgba(244,223,163,.55)';
    for (let i = 0; i < 3; i++) {
      ctx.rotate(t * 0.12 + i * 0.5);
      poly(ctx, [[0, -13], [3, 0], [0, 13], [-3, 0]], active ? 'rgba(159,232,255,.55)' : 'rgba(217,180,106,.3)');
    }
    ctx.restore();
    if (active) {
      glow(ctx, 0, -14, 38 + Math.sin(t * 2) * 5, 'rgba(159,232,255,.45)', 0.65);
      for (let i = 0; i < 6; i++) {
        const a = t * 0.5 + i * 1.05;
        ctx.fillStyle = 'rgba(159,232,255,.55)';
        ctx.beginPath(); ctx.arc(Math.cos(a) * 22, -14 + Math.sin(a * 1.3) * 20, 1.3, 0, TAU); ctx.fill();
      }
    }
    if (game.nearInteractable?.shrine === s) this._interactGlyph(ctx, 0, -66, t);
    ctx.restore();
  }

  _drawLoreStone(ctx, l, game, time) {
    const t = time || 0;
    ctx.save(); ctx.translate(l.x, l.y);
    shadow(ctx, 0, 2, 20, 6, 0.3);
    ctx.fillStyle = '#6a7066';
    poly(ctx, [[-16, 0], [-11, -34], [2, -45], [14, -28], [12, 0]], '#6a7066');
    poly(ctx, [[-11, -34], [2, -45], [3, -20], [-8, -14]], '#878d80');
    ctx.strokeStyle = l.read ? 'rgba(125,220,154,.5)' : 'rgba(159,232,255,.65)';
    ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(-5, -30); ctx.lineTo(6, -28); ctx.lineTo(2, -22); ctx.lineTo(-4, -18); ctx.stroke();
    ctx.beginPath(); ctx.arc(0, -25, 3, 0, TAU); ctx.stroke();
    glow(ctx, 0, -24, l.read ? 10 : 20 + Math.sin(t * 2) * 3, l.read ? 'rgba(125,220,154,.25)' : 'rgba(159,232,255,.4)', 0.6);
    if (!l.read) {
      ctx.fillStyle = 'rgba(159,232,255,.8)'; ctx.font = '10px serif'; ctx.textAlign = 'center';
      ctx.fillText('✦', 0, -48 + Math.sin(t * 1.6) * 2);
    }
    if (game.nearInteractable?.loreStone === l) this._interactGlyph(ctx, 0, -66, t);
    ctx.restore();
  }

  _drawHerb(ctx, h, game, time) {
    const t = time || 0;
    ctx.save(); ctx.translate(h.x, h.y);
    const sway = Math.sin(t * 1.8 + h.x) * 2;
    shadow(ctx, 0, 1, 10, 3, 0.2);
    for (let i = -2; i <= 2; i++) {
      ctx.strokeStyle = i % 2 ? '#7ddc9a' : '#5a9f62'; ctx.lineWidth = 1.6; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(i * 4 + sway, -10, i * 8 + sway, -20 - Math.abs(i) * 2); ctx.stroke();
    }
    ctx.fillStyle = '#eaffc9';
    for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(-7 + i * 7 + sway, -19 - (i % 2) * 3, 1.5, 0, TAU); ctx.fill(); }
    glow(ctx, 0, -10, 16, 'rgba(125,220,154,.3)', 0.5);
    if (game.nearInteractable?.herb === h) this._interactGlyph(ctx, 0, -48, t);
    ctx.restore();
  }

  _drawPortal(ctx, p, game, time) {
    const t = time || 0;
    const locked = game.portalLocked ? game.portalLocked(p) : false;
    ctx.save(); ctx.translate(p.x, p.y);
    const dirAngle = p.dir === 'north' ? -Math.PI / 2 : p.dir === 'south' ? Math.PI / 2 : p.dir === 'west' ? Math.PI : 0;
    ctx.save(); ctx.rotate(dirAngle + Math.PI / 2);
    shadow(ctx, 0, 4, 30, 8, 0.3);
    ctx.strokeStyle = locked ? 'rgba(150,140,160,.45)' : 'rgba(217,180,106,.8)'; ctx.lineWidth = 5;
    ctx.beginPath(); ctx.moveTo(-22, 0); ctx.lineTo(-22, -36); ctx.quadraticCurveTo(0, -66, 22, -36); ctx.lineTo(22, 0); ctx.stroke();
    ctx.strokeStyle = locked ? 'rgba(180,140,255,.25)' : 'rgba(159,232,255,.7)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(-15, 0); ctx.lineTo(-15, -34); ctx.quadraticCurveTo(0, -56, 15, -34); ctx.lineTo(15, 0); ctx.stroke();
    if (!locked) {
      const g = ctx.createLinearGradient(0, -50, 0, 0);
      g.addColorStop(0, 'rgba(159,232,255,.05)'); g.addColorStop(0.5, 'rgba(159,232,255,.28)'); g.addColorStop(1, 'rgba(180,140,255,.05)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(-14, 0); ctx.lineTo(-14, -33); ctx.quadraticCurveTo(0, -53, 14, -33); ctx.lineTo(14, 0); ctx.closePath(); ctx.fill();
      for (let i = 0; i < 5; i++) {
        const yy = -8 - ((t * 18 + i * 11) % 40);
        ctx.globalAlpha = 0.35 + Math.sin(t + i) * 0.2;
        ctx.fillStyle = '#e8fbff'; ctx.beginPath(); ctx.arc(Math.sin(t + i) * 8, yy, 1.2, 0, TAU); ctx.fill();
      }
      ctx.globalAlpha = 1;
      glow(ctx, 0, -26, 34, 'rgba(159,232,255,.3)', 0.6);
    } else {
      ctx.strokeStyle = 'rgba(180,140,255,.45)'; ctx.lineWidth = 1.5;
      for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(-12 + i * 8, -8); ctx.lineTo(-6 + i * 8, -20); ctx.lineTo(-12 + i * 8, -30); ctx.stroke(); }
    }
    ctx.restore();
    // etiqueta
    if (!locked) {
      ctx.globalAlpha = 0.6;
      ctx.fillStyle = '#f4dfa3'; ctx.font = '9px "Alegreya", serif'; ctx.textAlign = 'center';
      ctx.fillText(p.label || 'Camino', 0, -58);
      ctx.globalAlpha = 1;
    }
    if (game.nearInteractable?.portal === p) this._interactGlyph(ctx, 0, -76, t);
    ctx.restore();
  }

  // ============================================================
  // PERSONAJES
  // ============================================================
  _npcPalette(n) {
    const pt = PORTRAITS[n.portrait] || PORTRAITS.guard;
    return {
      skin: pt.skin || '#d8b08a', eye: pt.eye || '#5a3f2e', mark: pt.mark || 'none',
      hair: pt.hair || '#3a2a20', hairHi: pt.hairHi || '#6a5a44', hairStyle: n.id === 'elara' ? 'largo' : n.id === 'lia' ? 'coleta' : n.id === 'nima' ? 'largo' : 'corto',
      cloth: pt.cloth || '#5a4a3a', cloth2: mix(pt.cloth || '#5a4a3a', '#000000', 0.32), trim: pt.trim || '#c9a86a',
      cape: n.id === 'elara' || n.id === 'ordo' || n.id === 'archivista', accessory: 'ninguno',
      beard: !!pt.beard, age: !!pt.age, child: !!pt.child,
    };
  }

  _drawNPC(ctx, n, game, time) {
    const t = time || 0;
    const p = game.player;
    const d = p ? dist(n.x, n.y, p.x, p.y) : 999;
    const facing = p ? Math.atan2(p.y - n.y, p.x - n.x) : -Math.PI / 2;
    const pal = this._npcPalette(n);
    const talkable = d < 90;
    if (talkable) glow(ctx, n.x, n.y - 20, 26, 'rgba(244,223,163,.12)', 0.5);
    drawHumanoid(ctx, {
      x: n.x, y: n.y, s: pal.child ? 0.72 : 1, time: t + n.phase, facing,
      state: 'idle', phase: t * 0.9 + n.phase, palette: pal,
      weapon: false, cape: pal.cape, accessory: pal.accessory,
    });
    const hasQuest = game.npcHasQuest ? game.npcHasQuest(n.id) : false;
    if (hasQuest) {
      ctx.save();
      ctx.translate(n.x, n.y - 68 + Math.sin(t * 3) * 2.5);
      glow(ctx, 0, 0, 13, 'rgba(255,209,102,.55)', 0.8);
      ctx.fillStyle = '#ffd06a'; ctx.font = 'bold 16px "Cinzel", serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('!', 0, 0);
      ctx.restore();
    }
    if (d < 130) {
      ctx.save();
      ctx.globalAlpha = clamp(1 - (d - 60) / 90, 0, 1);
      ctx.fillStyle = 'rgba(4,8,14,.72)'; ctx.strokeStyle = 'rgba(217,180,106,.35)'; ctx.lineWidth = 1;
      const w = Math.max(70, n.name.length * 6 + 16);
      rr(ctx, n.x - w / 2, n.y - 94, w, 17, 3); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#f4dfa3'; ctx.font = '9px "Alegreya", sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(n.name, n.x, n.y - 85);
      ctx.restore();
    }
    if (talkable && game.nearInteractable?.npc === n) this._interactGlyph(ctx, n.x, n.y - 106, t);
  }

  _drawEnemy(ctx, e, game, time) {
    const t = time || 0;
    const def = e.def;
    const s = (e.boss ? 1.4 : 1) * (e.elite ? 1.16 : 1);
    ctx.save();
    if (e.spawnFx > 0) {
      ctx.globalAlpha = 1 - e.spawnFx / 0.5;
      glow(ctx, e.x, e.y - 20, 50 * (1 - e.spawnFx / 0.5), def.colors.glow, 0.7);
    }
    // telegraphs de suelo
    if (e.telegraph) {
      const tel = e.telegraph;
      const prog = clamp(1 - tel.timer / tel.duration, 0, 1);
      ctx.save();
      if (tel.type === 'aoe' || tel.type === 'ring') {
        ctx.globalAlpha = 0.22 + prog * 0.3;
        ctx.fillStyle = tel.color;
        ctx.beginPath(); ctx.arc(tel.x, tel.y, (tel.radius || 150) * (tel.type === 'ring' ? 0.35 + prog * 0.65 : prog), 0, TAU); ctx.fill();
        ctx.globalAlpha = 0.75; ctx.strokeStyle = tel.color; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(tel.x, tel.y, tel.radius || 150, 0, TAU); ctx.stroke();
      } else if (tel.type === 'melee') {
        ctx.globalAlpha = 0.25 + prog * 0.25; ctx.fillStyle = tel.color;
        ctx.beginPath(); ctx.moveTo(tel.x, tel.y);
        ctx.arc(tel.x, tel.y, (tel.range || 160) * (0.5 + prog * 0.5), tel.angle - 0.8, tel.angle + 0.8); ctx.closePath(); ctx.fill();
        ctx.globalAlpha = 0.7; ctx.strokeStyle = tel.color; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(tel.x, tel.y);
        ctx.arc(tel.x, tel.y, tel.range || 160, tel.angle - 0.8, tel.angle + 0.8); ctx.closePath(); ctx.stroke();
      } else if (tel.type === 'beam') {
        ctx.globalAlpha = 0.18 + prog * 0.25; ctx.strokeStyle = tel.color; ctx.lineWidth = (tel.width || 40) * (0.4 + prog * 0.6);
        ctx.beginPath(); ctx.moveTo(tel.x, tel.y);
        ctx.lineTo(tel.x + Math.cos(tel.angle) * (tel.range || 400), tel.y + Math.sin(tel.angle) * (tel.range || 400)); ctx.stroke();
      }
      ctx.restore();
    }
    drawCreatureShape(ctx, def.shape, def.colors, {
      x: e.x, y: e.y, s, time: t, facing: e.facing, state: e.state,
      phase: e.animTime, stateTime: e.stateTime, hitFlash: e.hitFlash,
      dead: e.dead, deathTime: e.deathTime, bounce: e.boss ? 0.7 : 1,
    });
    if (e.dead) { ctx.restore(); return; }
    // aura de élite / jefe
    if (e.boss) {
      glow(ctx, e.x, e.y - 26, 50 + Math.sin(t * 2) * 5, def.colors.glow, 0.12);
      ctx.strokeStyle = def.colors.glow; ctx.globalAlpha = 0.35; ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.ellipse(e.x, e.y + 1, e.r + 10, (e.r + 10) * 0.35, 0, 0, TAU); ctx.stroke();
      ctx.globalAlpha = 1;
    } else if (e.elite) {
      glow(ctx, e.x, e.y - 18, 30, 'rgba(255,208,106,.2)', 0.6);
    }
    // estados
    if (e.statuses.burn > 0) {
      for (let i = 0; i < 3; i++) {
        const a = t * 4 + i * 2.1;
        ctx.fillStyle = i % 2 ? '#ff8a5c' : '#ffd166';
        ctx.beginPath(); ctx.arc(e.x + Math.sin(a) * 12, e.y - 12 - ((t * 20 + i * 9) % 22), 2, 0, TAU); ctx.fill();
      }
    }
    if (e.statuses.slow > 0) {
      ctx.strokeStyle = 'rgba(127,212,255,.5)'; ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.ellipse(e.x, e.y + 2, e.r + 6, (e.r + 6) * 0.35, 0, 0, TAU); ctx.stroke();
    }
    if (e.stagger > 0) {
      ctx.fillStyle = '#ffe9a8'; ctx.font = 'bold 13px serif'; ctx.textAlign = 'center';
      ctx.fillText('✦', e.x + Math.sin(t * 8) * 10, e.y - e.r - 34);
      ctx.fillText('✦', e.x - Math.sin(t * 8) * 10, e.y - e.r - 30);
    }
    // nombre y vida
    const showHp = e.aggro || e.hp < e.maxHP || e.elite || e.boss;
    if (showHp && !e.boss) {
      const w = Math.max(44, Math.min(110, e.name.length * 6));
      const y = e.y - e.r - (e.elite ? 38 : 28);
      ctx.fillStyle = 'rgba(0,0,0,.65)'; ctx.fillRect(e.x - w / 2, y, w, 4);
      ctx.fillStyle = e.elite ? '#ffd06a' : '#e25a4f';
      ctx.fillRect(e.x - w / 2, y, w * clamp(e.hpPct, 0, 1), 4);
      ctx.strokeStyle = 'rgba(255,255,255,.15)'; ctx.lineWidth = 0.7; ctx.strokeRect(e.x - w / 2, y, w, 4);
      ctx.fillStyle = e.elite ? '#ffd06a' : 'rgba(240,236,225,.8)'; ctx.font = '8px "Alegreya", sans-serif'; ctx.textAlign = 'center';
      ctx.fillText(e.elite ? '✦ ' + e.name : e.name, e.x, y - 4);
    }
    // captura
    if (e.canCapture && game.targetEnemy === e) {
      const pulse = 0.6 + Math.sin(t * 4) * 0.3;
      ctx.strokeStyle = `rgba(180,140,255,${pulse})`; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(e.x, e.y - 6, e.r + 12, 0, TAU); ctx.stroke();
      ctx.fillStyle = '#dcc9ff'; ctx.font = '10px "Alegreya", sans-serif'; ctx.textAlign = 'center';
      ctx.fillText('V · VINCULAR', e.x, e.y - e.r - 46);
    }
    ctx.restore();
  }

  _drawCompanion(ctx, c, game, time) {
    if (!c || c.downed) return;
    const t = time || 0;
    drawCreature(ctx, c.id, c.x, c.y, c.def.base.spd > 1.15 ? 0.82 : 0.9, t, c.facing, c.downed ? 'down' : 'idle');
    glow(ctx, c.x, c.y - 14, 20, c.def.colors.glow, 0.16);
    if (c.hitFlash > 0) {
      ctx.fillStyle = `rgba(255,255,255,${c.hitFlash * 0.4})`;
      ctx.beginPath(); ctx.arc(c.x, c.y - 12, 16, 0, TAU); ctx.fill();
    }
  }

  _drawPlayer(ctx, p, game, time) {
    const t = time || 0;
    if (p.dead && p.deathTime > 2) return;
    if (p.invuln > 0 && !p.dead && p.state === 'dodge') {
      for (let i = 1; i <= 3; i++) {
        ctx.save(); ctx.globalAlpha = 0.12 * (4 - i);
        drawHumanoid(ctx, {
          x: p.x - p.dodgeDir.x * i * 13, y: p.y - p.dodgeDir.y * i * 13, s: 1, time: t - i * 0.04,
          facing: p.facing, state: p.state, phase: p.walkPhase, stateTime: p.stateTime,
          look: p.look, hurt: 0, weapon: true,
          weaponColor: p.weaponColor, weaponGlow: p.weaponGlow, helmet: !!p.helmetId,
          helmetColor: p.helmetColor, armorColor: p.armorColor, armorTrim: p.armorTrim,
          accessory: p.look.accessory, cape: false,
        });
        ctx.restore();
      }
    }
    drawHumanoid(ctx, {
      x: p.x, y: p.y, s: 1, time: t, facing: p.facing, state: p.state,
      phase: p.walkPhase, stateTime: p.stateTime, look: p.look, hurt: p.hurtFlash,
      dead: p.dead, deathTime: p.deathTime,
      weapon: true, weaponColor: p.weaponColor, weaponGlow: p.weaponGlow,
      helmet: !!p.helmetId, helmetColor: p.helmetColor,
      armorColor: p.armorColor, armorTrim: p.armorTrim,
      accessory: p.look.accessory,
    });
    // escudo mágico
    if (p.statuses.shield > 0) {
      ctx.strokeStyle = `rgba(159,232,255,${0.35 + Math.sin(t * 4) * 0.12})`; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.ellipse(p.x, p.y - 20, 24, 34, 0, 0, TAU); ctx.stroke();
    }
    if (p.blocking) {
      ctx.strokeStyle = 'rgba(244,223,163,.55)'; ctx.lineWidth = 2;
      const a = p.facing;
      ctx.beginPath(); ctx.arc(p.x + Math.cos(a) * 10, p.y - 22 + Math.sin(a) * 8, 22, a - 0.9, a + 0.9); ctx.stroke();
    }
    if (p.statuses.burn > 0) {
      for (let i = 0; i < 3; i++) {
        const a = t * 5 + i * 2.1;
        ctx.fillStyle = i % 2 ? '#ff8a5c' : '#ffd166';
        ctx.beginPath(); ctx.arc(p.x + Math.sin(a) * 10, p.y - 20 - ((t * 22 + i * 8) % 26), 1.8, 0, TAU); ctx.fill();
      }
    }
    if (p.statuses.poison > 0) {
      ctx.fillStyle = 'rgba(159,214,122,.7)';
      for (let i = 0; i < 2; i++) ctx.beginPath(), ctx.arc(p.x - 8 + i * 16, p.y - 8 + Math.sin(t * 3 + i) * 4, 1.6, 0, TAU), ctx.fill();
    }
  }

  _drawLoot(ctx, l, time) {
    const t = time || 0;
    const bob = Math.sin(t * 3 + l.x * 0.05) * 2.5;
    ctx.save(); ctx.translate(l.x, l.y + bob);
    glow(ctx, 0, -10, 18, l.color || 'rgba(255,209,102,.5)', 0.7);
    ctx.fillStyle = 'rgba(5,9,16,.7)'; ctx.strokeStyle = l.color || '#ffd06a'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(0, -10, 8, 0, TAU); ctx.fill(); ctx.stroke();
    ctx.fillStyle = l.color || '#ffd06a'; ctx.font = '10px serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(l.icon || '✦', 0, -9);
    if (l.life < 2) { ctx.globalAlpha = Math.max(0, l.life / 2); }
    ctx.globalAlpha = 0.85;
    ctx.fillStyle = '#f4dfa3'; ctx.font = '8px "Alegreya", sans-serif'; ctx.textAlign = 'center';
    ctx.fillText(l.name || 'Objeto', 0, 10);
    ctx.restore();
  }

  _drawProjectiles(ctx, game, time) {
    for (const pr of game.projectiles || []) {
      const t = time || 0;
      ctx.save();
      glow(ctx, pr.x, pr.y, (pr.r || 8) * 3.4, pr.color || '#ffe9a8', 0.55);
      ctx.fillStyle = pr.color || '#ffe9a8';
      ctx.beginPath(); ctx.arc(pr.x, pr.y, pr.r || 8, 0, TAU); ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath(); ctx.arc(pr.x - (pr.r || 8) * 0.2, pr.y - (pr.r || 8) * 0.2, (pr.r || 8) * 0.4, 0, TAU); ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,.5)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(pr.x, pr.y);
      ctx.lineTo(pr.x - (pr.vx || 0) * 0.03, pr.y - (pr.vy || 0) * 0.03); ctx.stroke();
      if (pr.type === 'arrow') {
        ctx.strokeStyle = pr.color; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(pr.x - 10, pr.y - 3); ctx.lineTo(pr.x + 6, pr.y); ctx.stroke();
      }
      ctx.restore();
    }
  }

  _drawEffects(ctx, game, time) {
    const fx = game.effects || {};
    for (const s of fx.slashes || []) {
      const t = 1 - s.life / s.maxLife;
      ctx.save(); ctx.translate(s.x, s.y);
      const ang = s.angle - (s.arc || 2.2) * 0.55 + t * (s.arc || 2.2);
      ctx.globalAlpha = (1 - t) * 0.9;
      ctx.strokeStyle = s.color || '#ffe9a8'; ctx.lineWidth = (s.width || 5) * (1 - t * 0.4);
      ctx.shadowColor = s.color; ctx.shadowBlur = 14;
      ctx.beginPath(); ctx.arc(0, 0, s.range || 42, ang - 0.45, ang + 0.45); ctx.stroke();
      ctx.globalAlpha = (1 - t) * 0.35;
      ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(0, 0, (s.range || 42) * 0.8, ang - 0.32, ang + 0.32); ctx.stroke();
      ctx.restore();
    }
    for (const r of fx.rings || []) {
      const t = 1 - r.life / r.maxLife;
      const rad = (r.maxRadius || 100) * (r.inward ? 1 - t * 0.85 : easeOutCubic(t));
      ctx.save();
      ctx.globalAlpha = (1 - t) * 0.8;
      ctx.strokeStyle = r.color || '#9fe8ff'; ctx.lineWidth = Math.max(1, 5 * (1 - t));
      ctx.shadowColor = r.color; ctx.shadowBlur = 16;
      ctx.beginPath(); ctx.arc(r.x, r.y, Math.max(1, rad), 0, TAU); ctx.stroke();
      if (r.fill) {
        ctx.globalAlpha = (1 - t) * 0.13; ctx.fillStyle = r.color;
        ctx.beginPath(); ctx.arc(r.x, r.y, Math.max(1, rad), 0, TAU); ctx.fill();
      }
      ctx.restore();
    }
    for (const b of fx.beams || []) {
      const t = 1 - b.life / b.maxLife;
      ctx.save(); ctx.translate(b.x, b.y); ctx.rotate(b.angle);
      const len = b.range || 400;
      ctx.globalAlpha = (1 - t) * 0.85;
      const g = ctx.createLinearGradient(0, 0, len, 0);
      g.addColorStop(0, b.color); g.addColorStop(0.7, b.color); g.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.strokeStyle = g; ctx.lineWidth = (b.width || 20) * (1 - t * 0.45);
      ctx.shadowColor = b.color; ctx.shadowBlur = 22;
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(len, 0); ctx.stroke();
      ctx.strokeStyle = '#ffffff'; ctx.lineWidth = Math.max(1, (b.width || 20) * 0.28);
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(len * 0.9, 0); ctx.stroke();
      ctx.restore();
    }
    for (const e of fx.spawns || []) {
      const t = 1 - e.life / e.maxLife;
      ctx.save(); ctx.globalAlpha = (1 - t) * 0.8;
      ctx.strokeStyle = e.color; ctx.lineWidth = 2;
      for (let i = 0; i < 4; i++) {
        ctx.beginPath(); ctx.arc(e.x, e.y, 10 + i * 12 + t * 25, i * 0.8 + t * 2, i * 0.8 + t * 2 + 1.4); ctx.stroke();
      }
      ctx.restore();
    }
  }

  _drawParticles(ctx, game, time) {
    for (const p of game.particles || []) {
      const t = p.life / p.maxLife;
      ctx.save(); ctx.globalAlpha = clamp(t, 0, 1) * (p.alpha ?? 0.9);
      ctx.fillStyle = p.color;
      if (p.glow) { ctx.shadowColor = p.color; ctx.shadowBlur = 8; }
      ctx.beginPath(); ctx.arc(p.x, p.y, Math.max(0.3, (p.size || 2) * (0.4 + t * 0.6)), 0, TAU); ctx.fill();
      ctx.restore();
    }
  }

  _drawFloatingTexts(ctx, game, time) {
    for (const f of game.floatingTexts || []) {
      const t = f.life / f.maxLife;
      ctx.save();
      ctx.globalAlpha = clamp(t * 1.5, 0, 1);
      ctx.fillStyle = f.color || '#fff3c4';
      ctx.font = `${f.size || 13}px "Alegreya", sans-serif`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.shadowColor = 'rgba(0,0,0,.9)'; ctx.shadowBlur = 5;
      ctx.fillText(f.text, f.x, f.y);
      ctx.restore();
    }
  }

  _drawAmbient(ctx, game, dt, time) {
    const zone = game.zone;
    if (!zone) return;
    const pal = THEMES[zone.theme] || THEMES.village;
    // partículas ambientales deterministas
    if (!this._ambientFor || this._ambientFor !== zone.id) {
      this._ambientFor = zone.id;
      const rng = seededFor('ambient', zone.id);
      this.ambient = [];
      const count = zone.ambient === 'embers' ? 80 : zone.ambient === 'stars' ? 110 : zone.ambient === 'ash' ? 60 : 70;
      for (let i = 0; i < count; i++) {
        this.ambient.push({ x: rng() * zone.w, y: rng() * zone.h, z: rng(), s: 0.5 + rng() * 1.8, p: rng() * TAU, v: 0.4 + rng() * 1.2 });
      }
    }
    ctx.save();
    for (const a of this.ambient) {
      const driftX = Math.sin(time * 0.3 * a.v + a.p) * 24;
      const driftY = Math.cos(time * 0.22 * a.v + a.p) * 18;
      let x = a.x + driftX, y = a.y + driftY;
      if (zone.ambient === 'embers' || zone.ambient === 'ash') {
        y = zone.h - ((time * 12 * a.v + a.y) % zone.h);
        x = a.x + Math.sin(time * 0.4 + a.p) * 30;
      }
      const alpha = 0.18 + Math.sin(time * 1.4 + a.p) * 0.15;
      if (zone.ambient === 'embers') {
        ctx.globalAlpha = alpha * 1.6; ctx.fillStyle = a.z > 0.7 ? '#ffd166' : '#ff8a5c';
        ctx.beginPath(); ctx.arc(x, y, a.s * 1.1, 0, TAU); ctx.fill();
      } else if (zone.ambient === 'stars') {
        ctx.globalAlpha = alpha * (0.7 + a.z); ctx.fillStyle = a.z > 0.75 ? '#dcc9ff' : '#e8fbff';
        ctx.beginPath(); ctx.arc(x, y, a.s * 0.8, 0, TAU); ctx.fill();
      } else if (zone.ambient === 'ash') {
        ctx.globalAlpha = alpha * 0.8; ctx.fillStyle = a.z > 0.5 ? '#cfc2b0' : '#8a8a8a';
        ctx.beginPath(); ctx.arc(x, y, a.s * 0.8, 0, TAU); ctx.fill();
      } else if (zone.ambient === 'motes') {
        ctx.globalAlpha = alpha; ctx.fillStyle = a.z > 0.6 ? '#9fe8ff' : '#dcc9ff';
        ctx.beginPath(); ctx.arc(x, y, a.s * 0.7, 0, TAU); ctx.fill();
      } else {
        ctx.globalAlpha = alpha * 1.2; ctx.fillStyle = a.z > 0.55 ? '#eaffc9' : '#ffe9a8';
        ctx.beginPath(); ctx.arc(x, y, a.s * 0.8, 0, TAU); ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
    // niebla / color grade
    const vg = ctx.createRadialGradient(game.player.x, game.player.y, 180, game.player.x, game.player.y, Math.max(700, zone.w * 0.5));
    vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, pal.edge + 'cc');
    ctx.fillStyle = vg; ctx.fillRect(this.camera.x, this.camera.y, this.w / this.zoom, this.h / this.zoom);
    ctx.fillStyle = pal.grade; ctx.fillRect(this.camera.x, this.camera.y, this.w / this.zoom, this.h / this.zoom);
    ctx.restore();
  }

  _drawScreenOverlays(ctx, game, time) {
    const p = game.player;
    ctx.save();
    // viñeta cinematográfica
    const v = ctx.createRadialGradient(this.w / 2, this.h / 2, Math.min(this.w, this.h) * 0.32, this.w / 2, this.h / 2, Math.max(this.w, this.h) * 0.72);
    v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,.45)');
    ctx.fillStyle = v; ctx.fillRect(0, 0, this.w, this.h);
    if (p && !p.dead && p.hpPct < 0.3) {
      const pulse = 0.16 + Math.sin(time * 5) * 0.07;
      const g = ctx.createRadialGradient(this.w / 2, this.h / 2, this.h * 0.25, this.w / 2, this.h / 2, this.h * 0.78);
      g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, `rgba(170,20,24,${pulse})`);
      ctx.fillStyle = g; ctx.fillRect(0, 0, this.w, this.h);
    }
    if (p && p.statuses.poison > 0) { ctx.fillStyle = 'rgba(90,150,60,.045)'; ctx.fillRect(0, 0, this.w, this.h); }
    if (p && p.statuses.slow > 0) { ctx.fillStyle = 'rgba(80,140,220,.035)'; ctx.fillRect(0, 0, this.w, this.h); }
    if (p && p.dead) { ctx.fillStyle = `rgba(20,0,0,${clamp(p.deathTime / 2, 0, 0.5)})`; ctx.fillRect(0, 0, this.w, this.h); }
    // scanline sutil para textura de anime
    if (this._quality !== 'low') {
      ctx.globalAlpha = 0.022; ctx.fillStyle = '#ffffff';
      for (let y = 0; y < this.h; y += 4) ctx.fillRect(0, y, this.w, 1);
      ctx.globalAlpha = 1;
    }
    ctx.restore();
  }

  // ============================================================
  // PANTALLAS AUXILIARES
  // ============================================================
  drawTitle(time = 0) {
    if (!this.titleCtx) return;
    this.titleCtx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    drawTitleArt(this.titleCtx, this.w, this.h, time);
  }

  drawCinematic(art, time = 0) {
    if (!this.cineCtx) return;
    this.cineCtx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    drawCinematicArt(this.cineCanvas, art, time);
  }

  drawPortrait(canvas, key, appearance, time = 0) {
    drawPortrait(canvas, key, appearance, time);
  }

  drawPreview(canvas, appearance, time = 0) {
    drawPreview(canvas, appearance, time);
  }

  drawMinimap(canvas, game) { drawMinimap(canvas, game); }
  drawZoneMap(canvas, game, zoneId) { drawZoneMap(canvas, game, zoneId); }
  drawWorldMap(canvas, game) { drawWorldMap(canvas, game); }
}
