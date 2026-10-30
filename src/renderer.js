// ============================================================
// Renderizador principal del mundo
// ============================================================
import { ZONES, WEAPONS, AFFINITIES, CREATURES } from './data.js';
import { clamp, drawHero, drawNpc, drawEnemy, drawCreature, drawAvatar, drawPreview, drawNpcPortrait, drawCreatureIcon, rgba } from './art.js';
import { TS, buildGround, staticDrawables, waterTiles, drawObject, drawWaterOverlay, drawMinimapBase } from './terrain.js';
import { drawProjectile, drawParticle, drawEffect, drawLoot, drawWorldLights, drawLighting, drawWeather } from './effects.js';

const TAU = Math.PI * 2;
function hash(n) { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); }

export class Renderer {
  constructor(canvas, game) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { alpha: false });
    this.game = game;
    this.dpr = 1;
    this.w = 1; this.h = 1; this.scale = 1;
    this.cam = { x: 0, y: 0 };
    this.cache = null;
    this.shake = 0;
    this.resize();
    this._onResize = () => this.resize();
    window.addEventListener('resize', this._onResize);
    window.addEventListener('orientationchange', () => setTimeout(() => this.resize(), 120));
  }

  resize() {
    const rect = this.canvas.getBoundingClientRect();
    this.w = Math.max(1, Math.round(rect.width || window.innerWidth));
    this.h = Math.max(1, Math.round(rect.height || window.innerHeight));
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = Math.round(this.w * this.dpr);
    this.canvas.height = Math.round(this.h * this.dpr);
    this.scale = this.w > this.h ? clamp(this.w / 1080, .82, 1.55) : clamp(this.w / 540, .78, 1.35);
  }

  setZone(zone) {
    if (!zone) return;
    if (this.cache && this.cache.id === zone.id) return;
    this.cache = {
      id: zone.id,
      ground: buildGround(zone),
      drawables: staticDrawables(zone),
      water: waterTiles(zone),
      mini: drawMinimapBase(zone),
    };
    const p = this.game.player;
    if (p) this.cam = { x: p.x, y: p.y };
  }

  updateCamera(game, dt) {
    const p = game.player;
    if (!p) return;
    const zone = game.zone;
    const vw = this.w / this.scale, vh = this.h / this.scale;
    const tx = p.x, ty = p.y - 10;
    const k = 1 - Math.exp(-7 * Math.min(dt, .05));
    this.cam.x += (tx - this.cam.x) * k;
    this.cam.y += (ty - this.cam.y) * k;
    if (zone.width * TS > vw) this.cam.x = clamp(this.cam.x, vw / 2, zone.width * TS - vw / 2);
    else this.cam.x = zone.width * TS / 2;
    if (zone.height * TS > vh) this.cam.y = clamp(this.cam.y, vh / 2, zone.height * TS - vh / 2);
    else this.cam.y = zone.height * TS / 2;
    const sk = game.shake;
    if (sk > 0) {
      this.shake = sk;
      game.shake = Math.max(0, sk - dt * 9);
    }
    this.shake *= .9;
  }

  draw(game, t, dt) {
    if (!game.zone || !game.player) return;
    this.setZone(game.zone);
    const ctx = this.ctx;
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    ctx.clearRect(0, 0, this.w, this.h);
    this.updateCamera(game, dt);
    const shx = (Math.random() - .5) * this.shake * 9;
    const shy = (Math.random() - .5) * this.shake * 9;
    const zoom = this.scale * (game.zoomPulse || 1);
    const halfW = this.w / 2 / zoom, halfH = this.h / 2 / zoom;
    const left = this.cam.x - halfW - 100, right = this.cam.x + halfW + 100;
    const top = this.cam.y - halfH - 160, bottom = this.cam.y + halfH + 160;

    ctx.save();
    ctx.translate(this.w / 2 + shx, this.h / 2 + shy);
    ctx.scale(zoom, zoom);
    ctx.translate(-this.cam.x, -this.cam.y);

    // suelo
    ctx.drawImage(this.cache.ground, 0, 0);
    drawWaterOverlay(ctx, this.cache.water, t, this.cam, { w: halfW * 2 + 60, h: halfH * 2 + 60 });

    // objetos y entidades ordenados por profundidad
    const items = [];
    for (const d of this.cache.drawables) {
      const x = (d.ref ? d.ref.x : d.x) * TS;
      const y = (d.ref ? d.ref.y : d.y) * TS;
      if (x < left - 160 || x > right + 160 || y < top - 160 || y > bottom + 160) continue;
      items.push(d);
    }
    for (const npc of game.zone.npcs || []) {
      if (npc.x * TS < left || npc.x * TS > right || npc.y * TS < top || npc.y * TS > bottom) continue;
      items.push({ kind: 'npc', ref: npc, sort: npc.y * TS + 12 });
    }
    for (const e of game.enemies) {
      if (!e.dead && !e.hidden) items.push({ kind: 'enemy', ref: e, sort: e.y + 10 });
    }
    for (const w of game.wilds) {
      if (!w.dead) items.push({ kind: 'wild', ref: w, sort: w.y + 8 });
    }
    for (const l of game.loot) items.push({ kind: 'loot', ref: l, sort: l.y + 6 });
    const p = game.player;
    if (!p.dead) items.push({ kind: 'player', sort: p.y + 10 });
    if (game.follower && !game.follower.hidden) items.push({ kind: 'follower', sort: game.follower.y + 6 });
    items.sort((a, b) => a.sort - b.sort);
    for (const it of items) {
      if (it.kind === 'npc') drawNpc(ctx, it.ref, t, game.npcHasQuest(it.ref));
      else if (it.kind === 'enemy') drawEnemy(ctx, it.ref, t);
      else if (it.kind === 'wild') this.drawWild(ctx, it.ref, t);
      else if (it.kind === 'loot') drawLoot(ctx, it.ref, t);
      else if (it.kind === 'player') this.drawPlayer(ctx, p, t);
      else if (it.kind === 'follower') this.drawFollower(ctx, game.follower, t);
      else drawObject(ctx, it, t, game);
    }

    // efectos
    for (const e of game.effects) {
      if (e.type === 'text' && game.settings.damageNumbers === false) continue;
      drawEffect(ctx, e, t);
    }
    for (const pr of game.projectiles) drawProjectile(ctx, pr, t);
    for (const pa of game.particles) drawParticle(ctx, pa);

    drawWorldLights(ctx, game.zone.lights || [], t);
    // pulso del jugador
    if (game.playerPulse > 0) {
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      ctx.strokeStyle = `rgba(255,230,160,${game.playerPulse * .6})`; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(p.x, p.y - 24, 30 + (1 - game.playerPulse) * 40, 0, TAU); ctx.stroke();
      ctx.restore();
    }
    ctx.restore();

    // iluminación de pantalla y clima
    const ps = { x: (p.x - this.cam.x) * zoom + this.w / 2 + shx, y: (p.y - 24 - this.cam.y) * zoom + this.h / 2 + shy };
    drawLighting(ctx, this.w, this.h, ps, game.zone, t, game.settings.quality, p.hp / p.maxHp);
    drawWeather(ctx, this.w, this.h, game.zone.palette.weather, t, game.settings.quality);
    // tinte ambiental
    const tint = game.zone.palette.tint;
    if (tint) { ctx.save(); ctx.fillStyle = tint; ctx.fillRect(0, 0, this.w, this.h); ctx.restore(); }
    // fundido de zona
    if (game.fade > 0) { ctx.fillStyle = `rgba(3,6,13,${game.fade})`; ctx.fillRect(0, 0, this.w, this.h); }
  }

  drawPlayer(ctx, p, t) {
    const weapon = p.weaponDef || WEAPONS[p.weapon] || WEAPONS.espada_alba;
    const atk = p.attackAnim ? p.attackAnim.t : null;
    const aim = p.aimAngle;
    drawHero(ctx, p.x, p.y, {
      appearance: { ...p.appearance, armor: p.equipment.armor },
      scale: 1.05, t,
      bob: p.moving ? Math.sin(p.walkPhase * TAU) * .7 : Math.sin(t * 2) * .4,
      walk: p.walkPhase, moving: p.moving,
      attackT: atk, aim, flip: Math.cos(aim) < -.2 ? -1 : 1,
      weaponType: weapon.type, weapon: 'si',
      blocking: p.blocking, dodge: p.dodgeTimer > 0 ? 1 : 0,
      hurt: p.hurtFlash, armorColor: p.armorColor,
      aura: p.buffAura || (p.petBuff ? '#8fe3a0' : null),
      dead: p.dead,
    });
    // criatura activa orbitando
  }

  drawFollower(ctx, f, t) {
    const p = this.game.player;
    if (!p) return;
    const ang = t * .8;
    const tx = f.x, ty = f.y;
    drawCreature(ctx, tx, ty, f.species, { scale: .62, t, seed: f.seed || 0, flip: tx < p.x ? -1 : 1 });
  }

  drawWild(ctx, w, t) {
    const bob = Math.sin(t * 2 + w.seed) * 2;
    drawCreature(ctx, w.x, w.y, w.species, { scale: 1.0, t, seed: w.seed, flip: w.flip || 1 });
    const def = CREATURES[w.species];
    if (!def) return;
    if (w.hp < w.maxHp) {
      const ww = 36;
      ctx.fillStyle = 'rgba(0,0,0,.55)'; ctx.fillRect(w.x - ww / 2, w.y - 52, ww, 4);
      ctx.fillStyle = w.hp / w.maxHp < .3 ? '#ffe169' : '#7be3b0';
      ctx.fillRect(w.x - ww / 2, w.y - 52, ww * clamp(w.hp / w.maxHp, 0, 1), 4);
    }
    ctx.textAlign = 'center';
    ctx.font = '600 9px Segoe UI, sans-serif';
    ctx.fillStyle = 'rgba(0,0,0,.55)'; ctx.fillText(`Nv.${w.level} · ${def.name}`, w.x + 1, w.y - 56);
    ctx.fillStyle = def.color; ctx.fillText(`Nv.${w.level} · ${def.name}`, w.x, w.y - 57);
    ctx.textAlign = 'left';
    if (w.capturable) {
      ctx.globalAlpha = .5 + .5 * Math.sin(t * 6);
      ctx.strokeStyle = '#ffe6a8'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(w.x, w.y - 20, 26, 0, TAU); ctx.stroke();
      ctx.globalAlpha = 1;
    }
  }

  drawMinimap(game) {
    const c = document.getElementById('minimap');
    if (!c || !game.zone) return;
    const ctx = c.getContext('2d');
    const W = c.width, H = c.height;
    ctx.clearRect(0, 0, W, H);
    ctx.save();
    ctx.beginPath(); ctx.arc(W / 2, H / 2, W / 2 - 2, 0, TAU); ctx.clip();
    ctx.fillStyle = '#080d18'; ctx.fillRect(0, 0, W, H);
    if (!this.cache) this.setZone(game.zone);
    const base = this.cache.mini;
    const ratio = Math.min((W - 6) / base.width, (H - 6) / base.height);
    const dw = base.width * ratio, dh = base.height * ratio;
    ctx.globalAlpha = .8;
    ctx.drawImage(base, (W - dw) / 2, (H - dh) / 2, dw, dh);
    ctx.globalAlpha = 1;
    const ox = (W - dw) / 2, oy = (H - dh) / 2;
    const toMap = (x, y) => [ox + x / (game.zone.width * TS) * dw, oy + y / (game.zone.height * TS) * dh];
    // portales
    for (const p of game.zone.portals || []) {
      const [px, py] = toMap((p.x + p.w / 2) * TS, (p.y + p.h / 2) * TS);
      ctx.fillStyle = 'rgba(130,220,255,.85)'; ctx.beginPath(); ctx.arc(px, py, 2.4, 0, TAU); ctx.fill();
    }
    // enemigos
    for (const e of game.enemies) if (!e.dead && !e.hidden) {
      const [ex, ey] = toMap(e.x, e.y);
      ctx.fillStyle = e.boss ? '#ff6b6b' : 'rgba(255,120,120,.75)';
      ctx.beginPath(); ctx.arc(ex, ey, e.boss ? 4 : 1.8, 0, TAU); ctx.fill();
    }
    // NPC
    for (const n of game.zone.npcs || []) {
      const [nx, ny] = toMap(n.x * TS, n.y * TS);
      ctx.fillStyle = game.npcHasQuest(n) ? '#ffe169' : 'rgba(232,196,119,.55)';
      ctx.beginPath(); ctx.arc(nx, ny, 1.8, 0, TAU); ctx.fill();
    }
    // jugador
    const [px, py] = toMap(game.player.x, game.player.y);
    ctx.fillStyle = '#fff4d0'; ctx.beginPath(); ctx.arc(px, py, 3.4, 0, TAU); ctx.fill();
    ctx.strokeStyle = 'rgba(255,220,130,.8)'; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.arc(px, py, 6 + Math.sin(game.time * 3) * 1.2, 0, TAU); ctx.stroke();
    // dirección
    ctx.strokeStyle = 'rgba(255,244,208,.8)'; ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px + Math.cos(game.player.aimAngle) * 8, py + Math.sin(game.player.aimAngle) * 8); ctx.stroke();
    ctx.restore();
  }

  drawTitle(t) {
    const c = document.getElementById('title-canvas');
    if (!c) return;
    const rect = c.getBoundingClientRect();
    if (c.width !== Math.round(rect.width) || c.height !== Math.round(rect.height)) { c.width = Math.max(1, rect.width); c.height = Math.max(1, rect.height); }
    const ctx = c.getContext('2d');
    const W = c.width, H = c.height;
    ctx.clearRect(0, 0, W, H);
    // estrellas
    for (let i = 0; i < 150; i++) {
      const x = hash(i) * W, y = hash(i + 99) * H * .92;
      const tw = .35 + .65 * (0.5 + 0.5 * Math.sin(t * (.3 + hash(i + 7) * .4) + i));
      ctx.fillStyle = `rgba(${210 + hash(i + 2) * 45},${220 + hash(i + 5) * 35},255,${tw * (.35 + hash(i + 3) * .5)})`;
      ctx.beginPath(); ctx.arc(x, y, .5 + hash(i + 8) * 1.5, 0, TAU); ctx.fill();
    }
    // nebulosa
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 3; i++) {
      const nx = W * (.3 + i * .2) + Math.sin(t * .06 + i) * 40;
      const ny = H * (.2 + hash(i + 5) * .3);
      const g = ctx.createRadialGradient(nx, ny, 10, nx, ny, W * .28);
      g.addColorStop(0, i === 1 ? 'rgba(120,90,190,.055)' : 'rgba(50,110,190,.05)');
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    }
    // cometa
    const cx = W * .72 - (t * 8 % (W * 1.4));
    const cy = H * .18 + Math.sin(t * .2) * 10;
    const trail = ctx.createLinearGradient(cx, cy, cx - 160, cy + 34);
    trail.addColorStop(0, 'rgba(255,230,170,.75)'); trail.addColorStop(1, 'rgba(255,230,170,0)');
    ctx.strokeStyle = trail; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx - 160, cy + 34); ctx.stroke();
    // polvo dorado
    for (let i = 0; i < 55; i++) {
      const x = (hash(i + 11) * W + Math.sin(t * .3 + i) * 22 + W) % W;
      const y = (hash(i + 33) * H + Math.cos(t * .2 + i) * 18 + H) % H;
      ctx.fillStyle = `rgba(255,225,150,${.08 + hash(i) * .18})`;
      ctx.beginPath(); ctx.arc(x, y, .7 + hash(i + 4) * 1.4, 0, TAU); ctx.fill();
    }
    ctx.globalCompositeOperation = 'source-over';
  }

  drawAvatar(el, appearance) { if (el) drawAvatar(el, appearance); }
  drawPreview(el, appearance) { if (el) drawPreview(el, appearance); }
  drawNpcPortrait(el, npc) { if (el) drawNpcPortrait(el, npc); }
  drawCreatureIcon(el, species) { if (el) drawCreatureIcon(el, species); }

  drawWorldMap(canvas, game) {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);
    const g = ctx.createRadialGradient(W * .5, H * .5, 10, W * .5, H * .5, W * .7);
    g.addColorStop(0, '#14233f'); g.addColorStop(1, '#050912');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    // constelaciones
    ctx.strokeStyle = 'rgba(120,160,220,.1)'; ctx.lineWidth = 1;
    for (let i = 0; i < 40; i++) {
      const x = hash(i) * W, y = hash(i + 3) * H;
      ctx.beginPath(); ctx.arc(x, y, .8, 0, TAU); ctx.stroke();
    }
    const nodes = {
      aldea: [.16, .64], bosque: [.36, .46], ruinas: [.58, .6], lago: [.7, .31], cumbre: [.87, .14],
    };
    const order = ['aldea', 'bosque', 'ruinas', 'lago', 'cumbre'];
    ctx.strokeStyle = 'rgba(232,196,119,.22)'; ctx.lineWidth = 1.4; ctx.setLineDash([5, 5]);
    for (let i = 0; i < order.length - 1; i++) {
      const a = nodes[order[i]], b = nodes[order[i + 1]];
      ctx.beginPath(); ctx.moveTo(a[0] * W, a[1] * H); ctx.lineTo(b[0] * W, b[1] * H); ctx.stroke();
    }
    ctx.setLineDash([]);
    for (const id of order) {
      const zone = ZONES[id];
      const [nx, ny] = nodes[id];
      const x = nx * W, y = ny * H;
      const discovered = game.state.discovered.includes(id);
      const current = game.zone.id === id;
      if (current) {
        const pulse = 1 + Math.sin(game.time * 3) * .12;
        ctx.strokeStyle = 'rgba(255,225,150,.5)'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(x, y, 23 * pulse, 0, TAU); ctx.stroke();
      }
      ctx.fillStyle = discovered ? (current ? '#f4d998' : '#667fa8') : '#232c3d';
      ctx.beginPath(); ctx.arc(x, y, 8, 0, TAU); ctx.fill();
      ctx.strokeStyle = discovered ? '#ffe6a8' : 'rgba(255,255,255,.15)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(x, y, 10, 0, TAU); ctx.stroke();
      ctx.font = '600 10px Segoe UI, sans-serif'; ctx.textAlign = 'center';
      ctx.fillStyle = discovered ? '#e8f0ff' : '#4c5872';
      ctx.fillText(discovered ? zone.name : '???', x, y + 24);
      ctx.textAlign = 'left';
    }
    // héroe
    const [hx, hy] = nodes[game.zone.id] || [.5, .5];
    ctx.fillStyle = '#fff2c8'; ctx.beginPath(); ctx.arc(hx * W, hy * H, 3.2, 0, TAU); ctx.fill();
  }
}
