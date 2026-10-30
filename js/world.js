import { ZONES } from './data.js';
import { layoutZone } from './zones.js';
import { drawObject, drawFlatObject } from './props.js';
import { renderGround, drawAmbient, drawAtmosphere } from './world_ground.js';
import { clamp, hexA } from './sprites.js';

function dist(ax, ay, bx, by) { return Math.hypot(ax - bx, ay - by); }
function pointSegDist(px, py, x1, y1, x2, y2) {
  const dx = x2 - x1, dy = y2 - y1;
  const l2 = dx * dx + dy * dy;
  if (!l2) return dist(px, py, x1, y1);
  let t = ((px - x1) * dx + (py - y1) * dy) / l2;
  t = Math.max(0, Math.min(1, t));
  return dist(px, py, x1 + t * dx, y1 + t * dy);
}

function hashString(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export class World {
  constructor(zoneId, state, game) {
    this.zoneId = ZONES[zoneId] ? zoneId : 'bosque_lumen';
    this.meta = ZONES[this.zoneId];
    this.state = state;
    this.game = game;
    this.w = this.meta.w;
    this.h = this.meta.h;
    this.rng = mulberry32(hashString(this.zoneId) + 9147);
    this.objects = [];
    this.flatObjects = [];
    this.npcs = [];
    this.colliders = [];
    this.interactables = [];
    this.paths = [];
    this.waters = [];
    this.clearings = [];
    this.lights = [];
    this.motes = [];
    this.plaza = null;
    this.arena = null;
    this.platform = null;
    this.bossTrigger = null;
    this.uid = 0;
    this.spawnPoint = { x: 300, y: 300 };
    layoutZone(this);
    this.scatterNature();
    renderGround(this);
    this.initMotes();
  }

  nextSeed() { return Math.floor(this.rng() * 100000); }

  addObject(o) {
    o.uid = o.uid || 'o' + (++this.uid);
    if (o.seed === undefined) o.seed = this.nextSeed();
    o.sortY = o.sortY ?? o.y;
    this.objects.push(o);
    if (o.flat) this.flatObjects.push(o);
    if (o.collider) {
      const c = o.collider;
      this.addCollider({
        ...c,
        x: o.x + (c.x || 0),
        y: o.y + (c.y || 0),
        owner: o.uid,
        objectType: o.type,
      });
    }
    if (o.light) {
      this.lights.push({
        x: o.x + (o.light.x || 0),
        y: o.y + (o.light.y || -60),
        r: o.light.r || 160,
        color: o.light.color || '#ffe49b',
        intensity: o.light.intensity ?? 0.6,
        flicker: o.light.flicker ?? 0.12,
        phase: this.rng() * 100,
        source: o.uid,
      });
    }
    return o;
  }

  addCollider(c) {
    c.id = c.id || 'c' + (++this.uid);
    this.colliders.push(c);
    return c;
  }

  addNPC(npc) {
    npc.kind = 'npc';
    npc.sortY = npc.y;
    this.npcs.push(npc);
    return npc;
  }

  addInteractable(i) {
    this.interactables.push(i);
    return i;
  }

  addWater(w) {
    this.waters.push(w);
  }

  initMotes() {
    const theme = this.groundTheme || 'forest';
    const count = theme === 'ruins' ? 95 : theme === 'sanctuary' ? 120 : theme === 'village' ? 70 : 90;
    this.motes = [];
    for (let i = 0; i < count; i++) {
      this.motes.push({
        x: this.rng() * this.w,
        y: this.rng() * this.h,
        r: 0.7 + this.rng() * 1.7,
        color: Math.floor(this.rng() * 3),
        phase: this.rng() * Math.PI * 2,
        speed: 0.35 + this.rng() * 0.9,
        drift: 6 + this.rng() * 18,
      });
    }
  }

  isFreeSpot(x, y, pad = 0) {
    if (x < 48 || y < 48 || x > this.w - 48 || y > this.h - 48) return false;
    for (const p of this.paths) {
      for (let i = 0; i < p.points.length - 1; i++) {
        const [x1, y1] = p.points[i];
        const [x2, y2] = p.points[i + 1];
        if (pointSegDist(x, y, x1, y1, x2, y2) < p.width / 2 + pad) return false;
      }
    }
    for (const c of this.clearings) {
      if (dist(x, y, c.x, c.y) < c.r + pad) return false;
    }
    for (const a of this.waters) {
      if (Math.abs(x - a.x) < a.w / 2 + pad) return false;
    }
    if (this.plaza) {
      const dx = (x - this.plaza.x) / (this.plaza.rx + pad);
      const dy = (y - this.plaza.y) / (this.plaza.ry + pad);
      if (dx * dx + dy * dy < 1) return false;
    }
    if (this.arena) {
      if (dist(x, y, this.arena.x, this.arena.y) < this.arena.r + pad) return false;
    }
    if (this.platform) {
      const dx = (x - this.platform.x) / (this.platform.rx * 0.85);
      const dy = (y - this.platform.y) / (this.platform.ry * 0.85);
      if (dx * dx + dy * dy > 1) return false;
    }
    for (const o of this.objects) {
      if (o.type === 'house' || o.type === 'forge') {
        if (Math.abs(x - o.x) < (o.w || 200) / 2 + pad + 20 && y > o.y - (o.h || 120) - pad - 20 && y < o.y + pad) return false;
      } else {
        if (dist(x, y, o.x, o.y) < (o.collider?.r || 22) + pad + 16) return false;
      }
    }
    for (const n of this.npcs) {
      if (dist(x, y, n.x, n.y) < 54 + pad) return false;
    }
    for (const it of this.interactables) {
      if (dist(x, y, it.x, it.y) < 62 + pad) return false;
    }
    return true;
  }

  scatterNature() {
    const d = this.density;
    if (!d) return;
    const theme = this.groundTheme;
    const treePalettes = {
      forest: [
        ['#2b5643', '#4b825b', '#1a3b32', '#90c77f'],
        ['#284f45', '#3f7a61', '#16352f', '#7bc49d'],
        ['#315a42', '#588c54', '#1c3b2c', '#b5d779'],
        ['#2d5140', '#497a50', '#18362c', '#79b876'],
      ],
      village: [
        ['#315e45', '#5a8b58', '#1e3b2d', '#a9d47b'],
        ['#3b6849', '#6a9d5f', '#264a35', '#c3dc83'],
      ],
      ruins: [
        ['#3b344c', '#5a506b', '#211e2d', '#8d75a8'],
        ['#343344', '#504f62', '#1d1c28', '#77768e'],
      ],
      sanctuary: [
        ['#4a4763', '#726b8d', '#27253b', '#d7cb96'],
      ],
    };
    const palettes = treePalettes[theme] || treePalettes.forest;

    let made = 0, attempts = 0;
    while (made < d.trees && attempts++ < d.trees * 14) {
      const x = 60 + this.rng() * (this.w - 120);
      const y = 60 + this.rng() * (this.h - 120);
      if (!this.isFreeSpot(x, y, 30)) continue;
      const scale = 0.72 + this.rng() * 0.55;
      const colors = palettes[Math.floor(this.rng() * palettes.length)];
      this.addObject({ type: 'tree', x, y, scale, seed: this.nextSeed(), colors, collider: { type: 'circle', r: 14 * scale } });
      made++;
    }
    made = 0; attempts = 0;
    while (made < d.pines && attempts++ < d.pines * 18) {
      const x = 60 + this.rng() * (this.w - 120);
      const y = 60 + this.rng() * (this.h - 120);
      if (!this.isFreeSpot(x, y, 30)) continue;
      const scale = 0.7 + this.rng() * 0.55;
      this.addObject({ type: 'pine', x, y, scale, seed: this.nextSeed(), collider: { type: 'circle', r: 13 * scale } });
      made++;
    }
    made = 0; attempts = 0;
    while (made < d.bushes && attempts++ < d.bushes * 16) {
      const x = 60 + this.rng() * (this.w - 120);
      const y = 60 + this.rng() * (this.h - 120);
      if (!this.isFreeSpot(x, y, 18)) continue;
      const scale = 0.6 + this.rng() * 0.6;
      this.addObject({ type: 'bush', x, y, scale, seed: this.nextSeed(), berries: this.rng() < 0.25 ? (theme === 'ruins' ? '#b990ff' : '#ffcf6e') : null });
      made++;
    }
    made = 0; attempts = 0;
    while (made < d.rocks && attempts++ < d.rocks * 16) {
      const x = 60 + this.rng() * (this.w - 120);
      const y = 60 + this.rng() * (this.h - 120);
      if (!this.isFreeSpot(x, y, 16)) continue;
      const scale = 0.5 + this.rng() * 0.75;
      this.addObject({ type: 'rock', x, y, scale, seed: this.nextSeed(), collider: this.rng() < 0.7 ? { type: 'circle', r: 20 * scale } : null });
      made++;
    }
    // troncos y detalles
    for (let i = 0; i < (theme === 'forest' ? 8 : 4); i++) {
      let x, y, tries = 0;
      do { x = 100 + this.rng() * (this.w - 200); y = 100 + this.rng() * (this.h - 200); tries++; } while (!this.isFreeSpot(x, y, 10) && tries < 30);
      if (tries < 30) this.addObject({ type: 'stump', x, y, seed: this.nextSeed() });
    }
  }

  colliderActive(c, ctx) {
    const flags = ctx.flags || {};
    if (c.flag && flags[c.flag]) return false;
    if (c.activeFlag && !flags[c.activeFlag]) return false;
    if (c.bridgeFlag && flags[c.bridgeFlag]) return false;
    if (c.requiresAny && ctx.abilities) {
      for (const req of c.requiresAny) if (ctx.abilities.has(req)) return false;
    }
    return true;
  }

  hitObstacle(x, y, r, ctx) {
    if (this.platform) {
      const dx = (x - this.platform.x) / (this.platform.rx - r * 1.2);
      const dy = (y - this.platform.y) / (this.platform.ry - r * 1.2);
      if (dx * dx + dy * dy > 1) return { kind: 'void' };
    }
    for (const c of this.colliders) {
      if (!this.colliderActive(c, ctx)) continue;
      if (c.type === 'rect') {
        const cx = clamp(x, c.x, c.x + c.w);
        const cy = clamp(y, c.y, c.y + c.h);
        if ((x - cx) ** 2 + (y - cy) ** 2 < r * r) return c;
      } else {
        if (dist(x, y, c.x, c.y) < r + (c.r || 0)) return c;
      }
    }
    return null;
  }

  moveEntity(e, dx, dy, ctx) {
    let movedX = 0, movedY = 0;
    const nx = clamp(e.x + dx, 32, this.w - 32);
    if (!this.hitObstacle(nx, e.y, e.r || 16, ctx)) { movedX = nx - e.x; e.x = nx; }
    const ny = clamp(e.y + dy, 32, this.h - 32);
    if (!this.hitObstacle(e.x, ny, e.r || 16, ctx)) { movedY = ny - e.y; e.y = ny; }
    return { x: movedX, y: movedY };
  }

  getInteractions(player, ctx) {
    const out = [];
    const flags = ctx.flags || {};
    const abilities = ctx.abilities || new Set();
    for (const item of this.interactables) {
      const d = dist(player.x, player.y, item.x, item.y);
      if (d > item.r + 14) continue;
      if (item.type === 'chest') {
        if (this.state.world.openedChests.includes(item.chestId)) continue;
        if (item.hidden === 'detect' && !flags[item.hiddenFlag || 'secret_bosque']) continue;
      }
      if (item.type === 'boulder' && flags.boulder_moved) continue;
      if (item.type === 'bramble' && flags.bramble_burned) continue;
      if (item.type === 'ice_gate' && flags.ice_gate) continue;
      if (item.type === 'rune' && flags.rune_power) continue;
      if (item.type === 'secret' && flags[item.flag || 'secret_ruins']) continue;
      if (item.type === 'seal' && flags.celestial_seal) continue;
      if (item.type === 'gap' && (flags.bridge_grown || abilities.has('fly'))) continue;
      let enabled = true;
      let label = item.label;
      const reqAbilities = item.abilities || (item.ability ? [item.ability] : []);
      if (reqAbilities.length) {
        const match = reqAbilities.some((a) => abilities.has(a));
        if (!match) {
          enabled = false;
          const name = item.abilityName || 'una criatura';
          const action = item.type === 'gap' ? 'cruzar' : item.type === 'secret' ? 'revelar' : 'abrir';
          label = `${item.label} · necesitas ${name} para ${action}`;
        } else if (item.type === 'boulder') label = 'Mover la roca (Tierra)';
        else if (item.type === 'bramble') label = 'Quemar las espinas (Fuego)';
        else if (item.type === 'ice_gate') label = 'Congelar el sello (Hielo)';
        else if (item.type === 'rune') label = 'Activar la runa (Rayo)';
        else if (item.type === 'secret') label = 'Revelar el secreto (Oscuridad)';
        else if (item.type === 'gap') label = flags.bridge_grown ? 'Cruzar el puente' : 'Hacer crecer un puente (Naturaleza)';
        else if (item.type === 'seal') label = 'Abrir el sello (Energía Celestial)';
      }
      if (item.type === 'portal') {
        const p = item.portal;
        if (p.locked === 'ruins' && !flags.ruins_unlocked) { enabled = false; label = `${p.label} · sellado por la niebla`; }
        if (p.locked === 'boss' && !flags.boss_defeated) { enabled = false; label = `${p.label} · el Guardián aún vive`; }
      }
      if (item.type === 'altar') {
        label = flags.ending ? 'Contemplar la Espada Celestial' : 'Reclamar la Espada Celestial';
      }
      out.push({ ...item, distance: d, enabled, label });
    }
    out.sort((a, b) => a.distance - b.distance);
    return out;
  }

  getLights(t) {
    return this.lights.map((l) => ({
      ...l,
      intensity: l.intensity * (1 - l.flicker + Math.abs(Math.sin(t * 2.3 + l.phase)) * l.flicker * 2),
    }));
  }

  isVisible(o, camera, margin = 230) {
    return o.x > camera.x - margin && o.x < camera.x + camera.w + margin && o.y > camera.y - margin && o.y < camera.y + camera.h + margin;
  }

  drawGround(ctx, camera) {
    if (!this.groundCanvas) return;
    const sx = clamp(camera.x - 4, 0, this.w);
    const sy = clamp(camera.y - 4, 0, this.h);
    const sw = clamp(camera.w + 8, 0, this.w - sx);
    const sh = clamp(camera.h + 8, 0, this.h - sy);
    ctx.drawImage(this.groundCanvas, sx, sy, sw, sh, sx, sy, sw, sh);
  }

  drawFlat(ctx, t) {
    for (const o of this.flatObjects) drawFlatObject(ctx, o, t, this.state);
  }

  drawProp(ctx, o, t) { drawObject(ctx, o, t, this.state); }

  drawAmbient(ctx, t, camera) { drawAmbient(this, ctx, t, camera); }

  drawWeather(ctx, t, camera) { drawAtmosphere(this, ctx, t, camera); }

  getDrawables() {
    return this.objects.filter((o) => !o.flat);
  }

  mapMarkers(state) {
    const markers = [];
    for (const it of this.interactables) {
      let type = 'poi';
      if (it.type === 'portal') type = 'portal';
      else if (it.type === 'shrine') type = 'shrine';
      else if (it.type === 'npc') type = 'npc';
      else if (it.type === 'chest' && !state.world.openedChests.includes(it.chestId)) type = 'chest';
      else if (it.type === 'altar') type = 'altar';
      else if (['boulder', 'bramble', 'ice_gate', 'rune', 'secret', 'gap', 'seal'].includes(it.type)) type = 'secret';
      else continue;
      markers.push({ x: it.x, y: it.y, type, label: it.label });
    }
    if (this.bossTrigger && !state.flags.boss_defeated) markers.push({ x: this.bossTrigger.x, y: this.bossTrigger.y, type: 'boss', label: 'Guardián Corrompido' });
    return markers;
  }

  drawMiniMap(ctx, width, height, player) {
    const spanX = 820, spanY = 540;
    const sx = clamp(player.x - spanX / 2, 0, this.w - spanX);
    const sy = clamp(player.y - spanY / 2, 0, this.h - spanY);
    ctx.save();
    ctx.clearRect(0, 0, width, height);
    ctx.beginPath(); ctx.arc(width / 2, height / 2, width / 2, 0, Math.PI * 2); ctx.clip();
    ctx.fillStyle = this.meta.color;
    ctx.fillRect(0, 0, width, height);
    if (this.groundCanvas) ctx.drawImage(this.groundCanvas, sx, sy, spanX, spanY, 0, 0, width, height);
    // marcadores
    for (const m of this.mapMarkers(this.state)) {
      const x = (m.x - sx) / spanX * width;
      const y = (m.y - sy) / spanY * height;
      if (x < 0 || x > width || y < 0 || y > height) continue;
      const color = m.type === 'portal' ? '#8ce7ff' : m.type === 'chest' ? '#ffe49b' : m.type === 'shrine' ? '#a9f1d6' : m.type === 'boss' ? '#ff6b8a' : m.type === 'npc' ? '#fff3cb' : '#c7a6ff';
      ctx.fillStyle = color;
      ctx.shadowColor = color; ctx.shadowBlur = 6;
      ctx.beginPath(); ctx.arc(x, y, m.type === 'boss' ? 4 : 2.4, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0;
    }
    const px = (player.x - sx) / spanX * width;
    const py = (player.y - sy) / spanY * height;
    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(player.facing || 0);
    ctx.fillStyle = '#fff7d1';
    ctx.shadowColor = '#ffe49b'; ctx.shadowBlur = 8;
    ctx.beginPath(); ctx.moveTo(6, 0); ctx.lineTo(-4, -4); ctx.lineTo(-2, 0); ctx.lineTo(-4, 4); ctx.closePath(); ctx.fill();
    ctx.restore();
    // viñeta
    const vg = ctx.createRadialGradient(width / 2, height / 2, width * 0.25, width / 2, height / 2, width * 0.52);
    vg.addColorStop(0, 'rgba(0,0,0,0)');
    vg.addColorStop(1, 'rgba(3,7,18,.55)');
    ctx.fillStyle = vg;
    ctx.fillRect(0, 0, width, height);
    ctx.restore();
  }

  drawMap(ctx, x, y, width, height, player, state) {
    const pad = 16;
    const availW = width - pad * 2, availH = height - pad * 2;
    const scale = Math.min(availW / this.w, availH / this.h);
    const mw = this.w * scale, mh = this.h * scale;
    const ox = x + (width - mw) / 2;
    const oy = y + (height - mh) / 2;
    ctx.save();
    // fondo
    ctx.fillStyle = '#0a0e1c';
    ctx.fillRect(x, y, width, height);
    if (this.groundCanvas) {
      ctx.globalAlpha = 0.85;
      ctx.drawImage(this.groundCanvas, ox, oy, mw, mh);
      ctx.globalAlpha = 1;
    }
    ctx.strokeStyle = 'rgba(240,210,145,.35)';
    ctx.strokeRect(ox - 2, oy - 2, mw + 4, mh + 4);
    // cuadrícula
    ctx.strokeStyle = 'rgba(220,235,255,.06)';
    for (let gx = ox; gx < ox + mw; gx += mw / 8) { ctx.beginPath(); ctx.moveTo(gx, oy); ctx.lineTo(gx, oy + mh); ctx.stroke(); }
    for (let gy = oy; gy < oy + mh; gy += mh / 6) { ctx.beginPath(); ctx.moveTo(ox, gy); ctx.lineTo(ox + mw, gy); ctx.stroke(); }
    // marcadores
    for (const m of this.mapMarkers(state)) {
      const px = ox + (m.x / this.w) * mw;
      const py = oy + (m.y / this.h) * mh;
      const color = m.type === 'portal' ? '#8ce7ff' : m.type === 'chest' ? '#ffe49b' : m.type === 'shrine' ? '#a9f1d6' : m.type === 'boss' ? '#ff6b8a' : m.type === 'npc' ? '#fff3cb' : m.type === 'altar' ? '#fff1b8' : '#c7a6ff';
      ctx.fillStyle = color;
      ctx.shadowColor = color; ctx.shadowBlur = 8;
      ctx.beginPath(); ctx.arc(px, py, m.type === 'boss' ? 7 : 4, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = 'rgba(255,255,255,.5)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(px, py, m.type === 'boss' ? 11 : 7, 0, Math.PI * 2); ctx.stroke();
    }
    // jugador
    const px = ox + (player.x / this.w) * mw;
    const py = oy + (player.y / this.h) * mh;
    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(player.facing || 0);
    ctx.fillStyle = '#fff7d1'; ctx.shadowColor = '#ffe49b'; ctx.shadowBlur = 12;
    ctx.beginPath(); ctx.moveTo(10, 0); ctx.lineTo(-6, -6); ctx.lineTo(-3, 0); ctx.lineTo(-6, 6); ctx.closePath(); ctx.fill();
    ctx.restore();
    ctx.fillStyle = 'rgba(255,247,209,.85)';
    ctx.font = '600 12px "Trebuchet MS", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(this.meta.name, x + 14, y + 22);
    ctx.fillStyle = 'rgba(200,215,240,.6)';
    ctx.font = '11px "Trebuchet MS", sans-serif';
    const legend = '◆ secreto  ✦ santuario  ● PNJ  ▲ portal  ✧ misión';
    ctx.fillText(legend, x + 14, y + height - 14);
    ctx.restore();
  }
}
