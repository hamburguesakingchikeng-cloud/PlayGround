import { REGIONS } from '../data/regions.js';
import { TILE } from '../game/world.js';
import { clamp, hash2, makeCanvas, mulberry32, rgba, TAU } from '../core/utils.js';
import { drawTerrainTile } from './sprites/terrain.js';
import { drawProp, drawInteractable } from './sprites/props.js';
import { drawHumanoid, drawNpc, drawPlayer } from './sprites/characters.js';
import { drawBoss, drawCompanion, drawEnemy } from './sprites/enemies.js';
import { drawPortrait } from './sprites/portraits.js';
import { glowCircle, star } from './sprites/common.js';

const WEATHER = {
  leaves: { color: '#a9c98a', count: 26 },
  embers: { color: '#ff9a5c', count: 34 },
  motes: { color: '#ffe7a8', count: 24 },
};

function minimapColor(tile, palette) {
  switch (tile) {
    case 2: return palette.water;
    case 5: return '#ff5a2a';
    case 10: return '#080812';
    case 4: case 12: return palette.wall;
    case 1: case 6: return palette.path;
    case 3: case 9: return palette.floor;
    case 15: return palette.accent;
    case 14: return palette.groundDark;
    default: return palette.ground;
  }
}

export class Renderer {
  constructor(canvas, game) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { alpha: false });
    this.game = game;
    this.width = 1280;
    this.height = 720;
    this.dpr = 1;
    this.terrain = null;
    this.terrainId = null;
    this.minimap = null;
    this.minimapId = null;
    this.titleStars = null;
  }

  resize(w, h, dpr = 1) {
    this.width = Math.max(320, w);
    this.height = Math.max(240, h);
    this.dpr = clamp(dpr, 1, 2);
    this.canvas.width = Math.round(this.width * this.dpr);
    this.canvas.height = Math.round(this.height * this.dpr);
    this.canvas.style.width = this.width + 'px';
    this.canvas.style.height = this.height + 'px';
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    this.ctx.imageSmoothingEnabled = true;
    this.titleStars = null;
  }

  setWorld(world) {
    this.terrain = null;
    this.terrainId = null;
    this.minimap = null;
    this.minimapId = null;
    if (!world) return;
    this.buildTerrain(world);
    this.buildMinimap(world);
  }

  buildTerrain(world) {
    const c = makeCanvas(world.pixelWidth, world.pixelHeight);
    const ctx = c.getContext('2d');
    ctx.fillStyle = REGIONS[world.id]?.palette?.ground || '#4a3a35';
    ctx.fillRect(0, 0, c.width, c.height);
    for (let y = 0; y < world.height; y++) {
      for (let x = 0; x < world.width; x++) {
        drawTerrainTile(ctx, x * TILE, y * TILE, world.tileAtTile(x, y), world.id, world.seed, x, y);
      }
    }
    // Vetas de camino: pequeños bordes claros para dar profundidad.
    this.terrain = c;
    this.terrainId = world.id;
  }

  buildMinimap(world) {
    const c = makeCanvas(world.width * 2, world.height * 2);
    const ctx = c.getContext('2d');
    const palette = REGIONS[world.id]?.palette || REGIONS.valdoria.palette;
    for (let y = 0; y < world.height; y++) {
      for (let x = 0; x < world.width; x++) {
        ctx.fillStyle = minimapColor(world.tileAtTile(x, y), palette);
        ctx.fillRect(x * 2, y * 2, 2, 2);
      }
    }
    this.minimap = c;
    this.minimapId = world.id;
  }

  render(time) {
    const { ctx } = this;
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    if (this.game.state === 'title' || this.game.state === 'creator') {
      this.drawTitle(time);
      return;
    }
    this.drawWorld(time);
  }

  drawWorld(time) {
    const { ctx, game } = this;
    const world = game.world;
    if (!world) { this.drawTitle(time); return; }
    if (this.terrainId !== world.id || !this.terrain) this.setWorld(world);
    const region = REGIONS[game.regionId] || REGIONS.valdoria;
    const cam = game.camera;

    ctx.fillStyle = region.palette.fog || '#16101f';
    ctx.fillRect(0, 0, this.width, this.height);
    ctx.save();
    cam.apply(ctx);

    if (this.terrain) {
      ctx.drawImage(this.terrain, 0, 0);
    }

    // Zonas de peligro bajo todo lo demás.
    for (const z of game.zones) z.draw(ctx);

    // Marcadores de punto de guardado.
    for (const wp of world.waypoints) {
      const active = game.flags['waypoint:' + wp.id];
      const bob = Math.sin(time * 1.8 + wp.x) * 3;
      glowCircle(ctx, wp.x * TILE, wp.y * TILE - 18, active ? 46 : 26, active ? '#9fe8ff' : '#ffe7a8', active ? 0.22 : 0.12);
      ctx.strokeStyle = active ? 'rgba(159,232,255,0.75)' : 'rgba(255,231,168,0.55)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(wp.x * TILE, wp.y * TILE - 6, 16, Math.PI, TAU);
      ctx.stroke();
      star(ctx, wp.x * TILE, wp.y * TILE - 28 + bob, 5, active ? '#9fe8ff' : '#ffe7a8', 4, time * 0.6);
    }

    // Recolectar todo lo dibujable y ordenarlo por profundidad.
    const drawables = [];
    for (const p of world.props) {
      if (!cam.isVisible(p.x, p.y, 180)) continue;
      drawables.push({ y: p.y + (p.canopy ? 8 : 0), kind: 'prop', ref: p });
    }
    for (const it of world.interactables) {
      if (!cam.isVisible(it.x, it.y, 120)) continue;
      if (it.type === 'survivor') continue;
      drawables.push({ y: it.y, kind: 'interactable', ref: it });
    }
    for (const npc of game.npcs) {
      if (!cam.isVisible(npc.x, npc.y, 100)) continue;
      drawables.push({ y: npc.y, kind: 'npc', ref: npc });
    }
    for (const e of game.enemies) {
      if (!cam.isVisible(e.x, e.y, 100)) continue;
      drawables.push({ y: e.y, kind: 'enemy', ref: e });
    }
    for (const b of game.bosses) {
      if (!cam.isVisible(b.x, b.y, 160)) continue;
      drawables.push({ y: b.y, kind: 'boss', ref: b });
    }
    for (const c of game.companions) {
      if (!cam.isVisible(c.x, c.y, 80)) continue;
      drawables.push({ y: c.y, kind: 'companion', ref: c });
    }
    if (!game.player.dead || game.player.deadTime < 6) {
      drawables.push({ y: game.player.y, kind: 'player', ref: game.player });
    }
    drawables.sort((a, b) => a.y - b.y);

    for (const d of drawables) {
      switch (d.kind) {
        case 'prop':
          drawProp(ctx, d.ref, world.id, time);
          break;
        case 'interactable': {
          const it = d.ref;
          const state = game.interactableState(it);
          if (it.type === 'gate') {
            drawInteractable(ctx, it, state, time);
          } else if (it.type === 'bossdoor') {
            drawInteractable(ctx, it, { active: state.active }, time);
          } else {
            drawInteractable(ctx, it, state, time);
          }
          if (state.highlight) {
            glowCircle(ctx, it.x, it.y - 18, 36, '#ffe7a8', 0.2);
            star(ctx, it.x, it.y - 58 + Math.sin(time * 2) * 3, 5, '#fff3c4', 4, time);
          }
          break;
        }
        case 'npc': {
          drawNpc(ctx, d.ref, time);
          const isNear = game.nearNpc === d.ref;
          if (isNear) {
            star(ctx, d.ref.x, d.ref.y - 72 + Math.sin(time * 2.4) * 3, 4, '#ffe7a8', 4, time * 0.4);
          }
          break;
        }
        case 'enemy': {
          drawEnemy(ctx, d.ref, time);
          if (!d.ref.dead) {
            d.ref.drawHealthBar(ctx);
            if (game.canCapture(d.ref)) {
              const pulse = 0.55 + Math.sin(time * 4) * 0.2;
              ctx.save();
              ctx.strokeStyle = `rgba(199,164,255,${pulse})`;
              ctx.lineWidth = 1.5;
              ctx.setLineDash([4, 4]);
              ctx.beginPath();
              ctx.arc(d.ref.x, d.ref.y - 8, d.ref.radius + 10, 0, TAU);
              ctx.stroke();
              ctx.restore();
            }
          }
          break;
        }
        case 'boss':
          drawBoss(ctx, d.ref, time);
          break;
        case 'companion':
          drawCompanion(ctx, d.ref, time);
          d.ref.drawHealthRing(ctx);
          break;
        case 'player':
          drawPlayer(ctx, d.ref, time);
          break;
      }
    }

    for (const p of game.projectiles) p.draw(ctx);
    game.particles.draw(ctx);

    // Partículas ambientales en coordenadas de mundo.
    this.drawWeatherWorld(time);

    ctx.restore();

    this.drawLighting(time);
    this.drawScreenWeather(time);
    if (game.settings.showFps) this.drawFps(time);
  }

  drawWeatherWorld(time) {
    const { ctx, game } = this;
    const weather = REGIONS[game.regionId]?.weather || 'motes';
    const cfg = WEATHER[weather] || WEATHER.motes;
    const cam = game.camera;
    const halfW = this.width / (2 * cam.zoom), halfH = this.height / (2 * cam.zoom);
    const left = cam.x - halfW, top = cam.y - halfH;
    ctx.save();
    for (const a of game.world.ambient) {
      const wx = left + ((a.x * this.width + time * a.speed * 38) % (this.width + 120));
      const wy = top + ((a.y * this.height + Math.sin(time * a.speed * 6 + a.phase) * 26 + time * (weather === 'embers' ? -12 : 8)) % (this.height + 80));
      ctx.globalAlpha = 0.25 + Math.sin(time + a.phase) * 0.12;
      ctx.fillStyle = cfg.color;
      if (weather === 'leaves') {
        ctx.save();
        ctx.translate(wx, wy);
        ctx.rotate(time * 0.7 + a.phase);
        ctx.beginPath(); ctx.ellipse(0, 0, a.size * 2.2, a.size, 0, 0, TAU); ctx.fill();
        ctx.restore();
      } else {
        ctx.beginPath(); ctx.arc(wx, wy, a.size, 0, TAU); ctx.fill();
        if (weather === 'embers') {
          ctx.globalAlpha *= 0.3;
          ctx.beginPath(); ctx.arc(wx, wy, a.size * 3.4, 0, TAU); ctx.fill();
        }
      }
    }
    ctx.restore();
  }

  drawLighting(time) {
    const { ctx, game } = this;
    const p = game.player;
    const screen = game.camera.worldToScreen(p.x, p.y - 18);
    const region = REGIONS[game.regionId] || REGIONS.valdoria;
    const darkness = game.regionId === 'drakmor' ? 0.56 : game.regionId === 'kansordore' ? 0.42 : 0.3;
    const radius = Math.max(this.width, this.height) * (game.regionId === 'drakmor' ? 0.58 : 0.66);
    const g = ctx.createRadialGradient(screen.x, screen.y, 30, screen.x, screen.y, radius);
    g.addColorStop(0, 'rgba(4,3,10,0)');
    g.addColorStop(0.42, `rgba(4,3,10,${darkness * 0.22})`);
    g.addColorStop(0.78, `rgba(4,3,10,${darkness * 0.62})`);
    g.addColorStop(1, `rgba(4,3,10,${darkness})`);
    ctx.save();
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, this.width, this.height);

    // Vignette cinematográfico.
    const v = ctx.createRadialGradient(this.width / 2, this.height / 2, Math.min(this.width, this.height) * 0.32, this.width / 2, this.height / 2, Math.max(this.width, this.height) * 0.78);
    v.addColorStop(0, 'rgba(0,0,0,0)');
    v.addColorStop(1, 'rgba(0,0,0,0.42)');
    ctx.fillStyle = v;
    ctx.fillRect(0, 0, this.width, this.height);

    // Tinte de la región en los bordes.
    const tint = region.palette.ambient || 'rgba(18,32,26,0.3)';
    ctx.globalAlpha = 0.35;
    ctx.fillStyle = tint;
    ctx.fillRect(0, 0, this.width, this.height);
    ctx.restore();
  }

  drawScreenWeather(time) {
    const { ctx, game } = this;
    if (game.regionId !== 'kansordore') return;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 14; i++) {
      const x = ((i * 173 + time * 7) % (this.width + 80)) - 40;
      const y = ((i * 91 + Math.sin(time * 0.3 + i) * 30) % (this.height + 60)) - 30;
      ctx.globalAlpha = 0.08 + (i % 3) * 0.03;
      ctx.fillStyle = '#ffe7a8';
      ctx.beginPath(); ctx.arc(x, y, 2 + (i % 2), 0, TAU); ctx.fill();
    }
    ctx.restore();
  }

  drawFps(time) {
    const { ctx } = this;
    ctx.save();
    ctx.font = '12px monospace';
    ctx.fillStyle = 'rgba(255,255,255,0.65)';
    ctx.fillText(`FPS ${Math.round(this.game.fps || 0)}`, 12, this.height - 14);
    ctx.restore();
  }

  drawTitle(time) {
    const { ctx, w, h } = { ctx: this.ctx, w: this.width, h: this.height };
    const t = time;
    const sky = ctx.createLinearGradient(0, 0, 0, h);
    sky.addColorStop(0, '#0a0814');
    sky.addColorStop(0.35, '#1a1430');
    sky.addColorStop(0.66, '#4a2a3a');
    sky.addColorStop(1, '#0c0812');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);

    if (!this.titleStars || this.titleStars.w !== w || this.titleStars.h !== h) {
      const rng = mulberry32(7719);
      this.titleStars = {
        w, h,
        stars: Array.from({ length: 150 }, () => ({ x: rng() * w, y: rng() * h * 0.7, r: rng() * 1.7 + 0.3, p: rng() * TAU, s: rng() * 0.8 + 0.2 })),
      };
    }
    ctx.save();
    for (const s of this.titleStars.stars) {
      const a = 0.18 + (Math.sin(t * s.s + s.p) * 0.5 + 0.5) * 0.55;
      ctx.globalAlpha = a;
      ctx.fillStyle = s.r > 1.3 ? '#fff3c4' : '#dfe8ff';
      ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, TAU); ctx.fill();
    }
    ctx.restore();

    // Luna / Gema Celestial.
    const mx = w * 0.76, my = h * 0.23;
    const halo = ctx.createRadialGradient(mx, my, 8, mx, my, Math.min(w, h) * 0.34);
    halo.addColorStop(0, 'rgba(255,231,168,0.34)');
    halo.addColorStop(0.35, 'rgba(255,207,106,0.12)');
    halo.addColorStop(1, 'rgba(255,207,106,0)');
    ctx.fillStyle = halo;
    ctx.fillRect(0, 0, w, h);
    ctx.save();
    ctx.translate(mx, my);
    ctx.rotate(t * 0.03);
    ctx.strokeStyle = 'rgba(255,231,168,0.5)';
    ctx.lineWidth = 1.2;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.ellipse(0, 0, 64 + i * 22, 24 + i * 10, i * 0.6 + t * 0.05, 0, TAU);
      ctx.stroke();
    }
    ctx.restore();
    const gem = ctx.createLinearGradient(mx - 22, my - 34, mx + 22, my + 34);
    gem.addColorStop(0, '#fffbe8');
    gem.addColorStop(0.5, '#ffe7a8');
    gem.addColorStop(1, '#b8924a');
    ctx.fillStyle = gem;
    ctx.beginPath();
    ctx.moveTo(mx, my - 38);
    ctx.lineTo(mx + 22, my - 6);
    ctx.lineTo(mx, my + 38);
    ctx.lineTo(mx - 22, my - 6);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.65)';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 9; i++) {
      const a = (i / 9) * TAU + t * 0.14;
      const rr = 86 + (i % 3) * 26 + Math.sin(t * 0.7 + i) * 7;
      star(ctx, mx + Math.cos(a) * rr, my + Math.sin(a) * rr * 0.62, 2 + (i % 2) * 1.5, '#ffe7a8', 4, t * 0.4 + i);
    }
    ctx.restore();

    // Montañas por capas.
    this.mountainLayer(0.52, '#181228', 0.18, 1.1, t);
    this.mountainLayer(0.62, '#241a32', 0.24, 1.5, t);
    this.mountainLayer(0.72, '#0f0b18', 0.3, 2.1, t);

    // Silueta de ciudadela.
    this.drawCastle(w * 0.27, h * 0.73, Math.min(w, h) * 0.0016, t);

    // Espada en primer plano.
    this.drawHeroSword(w * 0.5, h * 0.86, Math.min(w, h) * 0.0015, t);

    // Niebla.
    for (let i = 0; i < 5; i++) {
      const y = h * (0.55 + i * 0.09);
      const fg = ctx.createLinearGradient(0, y - 30, 0, y + 40);
      fg.addColorStop(0, 'rgba(199,164,255,0)');
      fg.addColorStop(0.5, `rgba(199,164,255,${0.035 + i * 0.012})`);
      fg.addColorStop(1, 'rgba(199,164,255,0)');
      ctx.fillStyle = fg;
      ctx.fillRect(0, y - 30 + Math.sin(t * 0.25 + i) * 10, w, 70);
    }

    // Motes flotantes.
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 40; i++) {
      const x = ((i * 137 + t * (6 + i % 5)) % (w + 60)) - 30;
      const y = h - ((i * 83 + t * (12 + i % 7)) % (h * 0.8));
      ctx.globalAlpha = 0.12 + (i % 4) * 0.05;
      ctx.fillStyle = i % 3 ? '#ffe7a8' : '#c7a4ff';
      ctx.beginPath(); ctx.arc(x, y, 1 + (i % 2), 0, TAU); ctx.fill();
    }
    ctx.restore();

    // Vignette final.
    const v = ctx.createRadialGradient(w / 2, h * 0.48, Math.min(w, h) * 0.2, w / 2, h * 0.5, Math.max(w, h) * 0.8);
    v.addColorStop(0, 'rgba(0,0,0,0)');
    v.addColorStop(1, 'rgba(0,0,0,0.72)');
    ctx.fillStyle = v;
    ctx.fillRect(0, 0, w, h);
  }

  mountainLayer(base, color, rough, speed, time) {
    const { ctx, w, h } = this;
    const y0 = h * base;
    ctx.save();
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(0, h);
    ctx.lineTo(0, y0);
    const steps = 16;
    for (let i = 0; i <= steps; i++) {
      const x = (i / steps) * w;
      const n = hash2(i, Math.round(base * 100), 91);
      const n2 = Math.sin(i * 1.7 + speed + time * 0.01) * 0.5 + 0.5;
      const y = y0 - (n * 0.7 + n2 * 0.3) * h * rough;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  drawCastle(cx, baseY, scale, time) {
    const { ctx } = this;
    const s = Math.max(0.55, scale);
    ctx.save();
    ctx.translate(cx, baseY);
    ctx.scale(s, s);
    ctx.fillStyle = 'rgba(8,6,14,0.92)';
    // Muralla.
    ctx.fillRect(-120, -46, 240, 46);
    for (let i = 0; i < 12; i++) ctx.fillRect(-120 + i * 21, -54, 11, 9);
    // Torres.
    for (const tx of [-92, 0, 92]) {
      ctx.fillRect(tx - 16, -108, 32, 108);
      ctx.beginPath(); ctx.moveTo(tx - 22, -108); ctx.lineTo(tx, -146); ctx.lineTo(tx + 22, -108); ctx.closePath(); ctx.fill();
      // Ventanas encendidas.
      for (let i = 0; i < 3; i++) {
        ctx.fillStyle = `rgba(255,207,106,${0.25 + Math.sin(time * 1.2 + i + tx) * 0.12})`;
        ctx.fillRect(tx - 4, -92 + i * 24, 8, 11);
        ctx.fillStyle = 'rgba(8,6,14,0.92)';
      }
    }
    // Puente.
    ctx.fillRect(-160, -20, 320, 8);
    ctx.restore();
  }

  drawHeroSword(cx, baseY, scale, time) {
    const { ctx, w, h } = this;
    const s = Math.max(0.7, scale) * Math.min(w, h) / 720;
    ctx.save();
    ctx.translate(cx, baseY);
    ctx.scale(s, s);
    const glow = ctx.createRadialGradient(0, -170, 4, 0, -150, 210);
    glow.addColorStop(0, 'rgba(255,231,168,0.4)');
    glow.addColorStop(0.5, 'rgba(255,207,106,0.12)');
    glow.addColorStop(1, 'rgba(255,207,106,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(-230, -380, 460, 440);
    // Hoja.
    const blade = ctx.createLinearGradient(-24, 0, 24, 0);
    blade.addColorStop(0, '#7a8498');
    blade.addColorStop(0.35, '#fffbe8');
    blade.addColorStop(0.6, '#ffe7a8');
    blade.addColorStop(1, '#8a7a5a');
    ctx.fillStyle = blade;
    ctx.beginPath();
    ctx.moveTo(0, -310);
    ctx.lineTo(23, -250);
    ctx.lineTo(18, -58);
    ctx.lineTo(-18, -58);
    ctx.lineTo(-23, -250);
    ctx.closePath();
    ctx.fill();
    // Guarda.
    ctx.fillStyle = '#b8924a';
    ctx.beginPath();
    ctx.moveTo(-78, -58);
    ctx.quadraticCurveTo(-40, -76, 0, -56);
    ctx.quadraticCurveTo(40, -76, 78, -58);
    ctx.quadraticCurveTo(38, -40, 0, -50);
    ctx.quadraticCurveTo(-38, -40, -78, -58);
    ctx.fill();
    // Empuñadura.
    ctx.fillStyle = '#3a2a20';
    ctx.fillRect(-9, -52, 18, 74);
    for (let i = 0; i < 6; i++) {
      ctx.fillStyle = i % 2 ? '#8a6a2a' : '#5a4030';
      ctx.fillRect(-10, -46 + i * 11, 20, 5);
    }
    ctx.fillStyle = '#d9b46a';
    ctx.beginPath(); ctx.arc(0, 30, 15, 0, TAU); ctx.fill();
    ctx.fillStyle = '#ffe7a8';
    ctx.beginPath(); ctx.arc(0, 30, 7, 0, TAU); ctx.fill();
    // Runas en la hoja.
    ctx.strokeStyle = `rgba(255,243,196,${0.45 + Math.sin(time * 1.4) * 0.2})`;
    ctx.lineWidth = 2;
    for (let i = 0; i < 5; i++) {
      const y = -240 + i * 34;
      ctx.beginPath();
      ctx.moveTo(-8, y);
      ctx.lineTo(0, y + 10);
      ctx.lineTo(8, y);
      ctx.stroke();
    }
    // Destellos.
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 6; i++) {
      const a = time * 0.5 + i * 1.1;
      star(ctx, Math.cos(a) * 120, -160 + Math.sin(a * 0.8) * 80, 2 + (i % 2) * 2, '#fff3c4', 4, a);
    }
    ctx.restore();
  }

  drawMinimap(canvas) {
    const { game } = this;
    if (!canvas || !game.world) return;
    if (this.minimapId !== game.world.id) this.buildMinimap(game.world);
    const ctx = canvas.getContext('2d');
    const dpr = clamp(window.devicePixelRatio || 1, 1, 2);
    const cw = canvas.clientWidth || 190;
    const ch = canvas.clientHeight || Math.round(cw * game.world.height / game.world.width);
    if (canvas.width !== Math.round(cw * dpr) || canvas.height !== Math.round(ch * dpr)) {
      canvas.width = Math.round(cw * dpr);
      canvas.height = Math.round(ch * dpr);
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, cw, ch);
    ctx.fillStyle = '#0a0812';
    ctx.fillRect(0, 0, cw, ch);
    if (this.minimap) ctx.drawImage(this.minimap, 0, 0, cw, ch);
    const sx = cw / game.world.pixelWidth, sy = ch / game.world.pixelHeight;
    // Enemigos.
    for (const e of game.enemies) {
      if (e.dead) continue;
      ctx.fillStyle = e.def.boss ? '#ff7b4d' : '#ff7b7b';
      ctx.beginPath(); ctx.arc(e.x * sx, e.y * sy, e.def.boss ? 4 : 2, 0, TAU); ctx.fill();
    }
    for (const b of game.bosses) {
      if (b.dead) continue;
      ctx.fillStyle = '#ff5a2a';
      ctx.beginPath(); ctx.arc(b.x * sx, b.y * sy, 5, 0, TAU); ctx.fill();
    }
    // PNJ.
    for (const n of game.npcs) {
      ctx.fillStyle = '#ffe7a8';
      ctx.beginPath(); ctx.arc(n.x * sx, n.y * sy, 1.7, 0, TAU); ctx.fill();
    }
    // Puntos de guardado.
    for (const wp of game.world.waypoints) {
      ctx.fillStyle = game.flags['waypoint:' + wp.id] ? '#9fe8ff' : '#8a7a5a';
      ctx.beginPath(); ctx.arc(wp.x * TILE * sx, wp.y * TILE * sy, 2.4, 0, TAU); ctx.fill();
    }
    // Jugador.
    const p = game.player;
    ctx.save();
    ctx.translate(p.x * sx, p.y * sy);
    ctx.rotate(p.facing + Math.PI / 2);
    ctx.fillStyle = '#fff3c4';
    ctx.beginPath(); ctx.moveTo(0, -5); ctx.lineTo(3.5, 4); ctx.lineTo(0, 2); ctx.lineTo(-3.5, 4); ctx.closePath(); ctx.fill();
    ctx.restore();
    ctx.strokeStyle = 'rgba(255,231,168,0.45)';
    ctx.lineWidth = 1;
    ctx.strokeRect(0.5, 0.5, cw - 1, ch - 1);
  }

  drawPortrait(canvas, portraitId, player, time = 0) {
    if (!canvas) return;
    const dpr = clamp(window.devicePixelRatio || 1, 1, 2);
    const w = canvas.clientWidth || 128;
    const h = canvas.clientHeight || 128;
    if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
    }
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    drawPortrait(ctx, w, h, portraitId, player, time);
  }

  drawCreatorPreview(canvas, appearance, originColor = '#ffe7a8', time = 0) {
    if (!canvas) return;
    const dpr = clamp(window.devicePixelRatio || 1, 1, 2);
    const w = canvas.clientWidth || 260;
    const h = canvas.clientHeight || 330;
    if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
    }
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    const bg = ctx.createLinearGradient(0, 0, 0, h);
    bg.addColorStop(0, 'rgba(20,14,34,0)');
    bg.addColorStop(0.55, 'rgba(20,14,34,0.35)');
    bg.addColorStop(1, 'rgba(6,4,12,0.92)');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);
    // Halo y plataforma.
    const halo = ctx.createRadialGradient(w / 2, h * 0.42, 8, w / 2, h * 0.48, w * 0.55);
    halo.addColorStop(0, rgba(originColor, 0.28));
    halo.addColorStop(1, rgba(originColor, 0));
    ctx.fillStyle = halo;
    ctx.fillRect(0, 0, w, h);
    const floor = ctx.createRadialGradient(w / 2, h * 0.86, 4, w / 2, h * 0.86, w * 0.42);
    floor.addColorStop(0, rgba(originColor, 0.3));
    floor.addColorStop(1, rgba(originColor, 0));
    ctx.fillStyle = floor;
    ctx.fillRect(0, h * 0.7, w, h * 0.3);
    ctx.save();
    ctx.strokeStyle = rgba(originColor, 0.28);
    ctx.lineWidth = 1;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.ellipse(w / 2, h * 0.86, 40 + i * 22 + Math.sin(time + i) * 2, 10 + i * 4, 0, 0, TAU);
      ctx.stroke();
    }
    ctx.restore();
    // Personaje.
    ctx.save();
    ctx.translate(w / 2, h * 0.86);
    ctx.scale(2.55, 2.55);
    drawHumanoid(ctx, 0, 0, {
      appearance,
      anim: 'idle',
      animTime: time,
      facing: Math.PI / 2 + Math.sin(time * 0.5) * 0.18,
      scale: 1,
      weapon: 'celestial_sword',
      weaponType: 'sword',
      weaponColor: '#ffe7a8',
      armorColor: appearance.armorColor,
      helmetColor: appearance.helmet ? appearance.armorColor : null,
      accessoryColor: originColor,
      capeColor: appearance.capeColor,
      showCape: appearance.cape !== false,
    });
    ctx.restore();
    // Estrellas.
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 8; i++) {
      const a = time * 0.4 + i * 0.8;
      star(ctx, w / 2 + Math.cos(a) * (w * 0.32), h * 0.45 + Math.sin(a * 1.3) * (h * 0.26), 1.5 + (i % 2), originColor, 4, a);
    }
    ctx.restore();
  }
}
