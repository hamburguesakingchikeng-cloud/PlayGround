// ============================================================
// LA ESPADA CELESTIAL — mapas procedurales
// ============================================================
import { TAU, clamp } from './core.js';
import { REGIONS, REGION_ZONES, ZONE_ORDER, ZONES } from './story.js';
import { glow, rr } from './art.js';

const REGION_COLORS = {
  valdoria: { a: '#1a3028', b: '#3a6a4a', line: '#7ddc9a', glow: 'rgba(125,220,154,.28)' },
  drakmor: { a: '#2a1410', b: '#6a2a1a', line: '#ff8a5c', glow: 'rgba(255,138,92,.25)' },
  kansordore: { a: '#141028', b: '#3a2a6a', line: '#b48cff', glow: 'rgba(180,140,255,.28)' },
};

function zoneColor(zoneId) {
  const def = ZONES[zoneId];
  const r = REGION_COLORS[def?.region] || REGION_COLORS.valdoria;
  return r;
}

export function drawMinimap(canvas, game) {
  const ctx = canvas.getContext('2d');
  const w = canvas.width, h = canvas.height;
  ctx.clearRect(0, 0, w, h);
  if (!game?.zone) return;
  const z = game.zone;
  const pad = 6;
  const sx = (w - pad * 2) / z.w, sy = (h - pad * 2) / z.h;
  const s = Math.min(sx, sy);
  const ox = (w - z.w * s) / 2, oy = (h - z.h * s) / 2;
  const X = x => ox + x * s, Y = y => oy + y * s;

  ctx.fillStyle = 'rgba(4,8,14,.85)'; ctx.fillRect(0, 0, w, h);
  // terreno
  const bg = ctx.createRadialGradient(w / 2, h / 2, 4, w / 2, h / 2, Math.max(w, h) * 0.7);
  bg.addColorStop(0, 'rgba(30,46,60,.8)'); bg.addColorStop(1, 'rgba(6,10,18,.9)');
  ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h);
  // caminos
  ctx.strokeStyle = 'rgba(217,180,106,.45)'; ctx.lineWidth = Math.max(1, 3 * s * 4); ctx.lineCap = 'round';
  for (const path of z.paths) {
    if (path.length < 2) continue;
    ctx.beginPath(); ctx.moveTo(X(path[0].x), Y(path[0].y));
    for (let i = 1; i < path.length; i++) ctx.lineTo(X(path[i].x), Y(path[i].y));
    ctx.stroke();
  }
  // agua / lava
  for (const wtr of z.water) { ctx.fillStyle = 'rgba(60,140,170,.55)'; ctx.beginPath(); ctx.ellipse(X(wtr.x), Y(wtr.y), wtr.rx * s, wtr.ry * s, 0, 0, TAU); ctx.fill(); }
  for (const lv of z.lava) { ctx.fillStyle = 'rgba(200,70,30,.6)'; ctx.beginPath(); ctx.ellipse(X(lv.x), Y(lv.y), lv.rx * s, lv.ry * s, 0, 0, TAU); ctx.fill(); }
  // edificios
  ctx.fillStyle = 'rgba(180,175,155,.55)';
  for (const b of z.buildings) ctx.fillRect(X(b.x), Y(b.y), Math.max(1, b.w * s), Math.max(1, b.h * s));
  // interactables
  for (const c of z.chests) { if (c.opened) continue; ctx.fillStyle = '#ffd06a'; ctx.fillRect(X(c.x) - 1.5, Y(c.y) - 1.5, 3, 3); }
  for (const sh of z.shrines) { ctx.fillStyle = sh.active ? '#7ddc9a' : '#a9b2c4'; ctx.beginPath(); ctx.arc(X(sh.x), Y(sh.y), 2, 0, TAU); ctx.fill(); }
  for (const p of z.portals) { ctx.fillStyle = '#b48cff'; ctx.beginPath(); ctx.arc(X(p.x), Y(p.y), 2.2, 0, TAU); ctx.fill(); }
  for (const n of z.npcs) { ctx.fillStyle = '#f4dfa3'; ctx.beginPath(); ctx.arc(X(n.x), Y(n.y), 2, 0, TAU); ctx.fill(); }
  for (const e of game.enemies || []) { if (e.dead) continue; ctx.fillStyle = e.boss ? '#ff5a36' : '#e25a4f'; ctx.beginPath(); ctx.arc(X(e.x), Y(e.y), e.boss ? 3 : 1.8, 0, TAU); ctx.fill(); }
  // jugador
  const px = X(game.player.x), py = Y(game.player.y);
  glow(ctx, px, py, 8, 'rgba(159,232,255,.4)', 0.8);
  ctx.save(); ctx.translate(px, py); ctx.rotate(game.player.facing + Math.PI / 2);
  ctx.fillStyle = '#eaffff';
  ctx.beginPath(); ctx.moveTo(0, -5); ctx.lineTo(3.5, 4); ctx.lineTo(0, 2); ctx.lineTo(-3.5, 4); ctx.closePath(); ctx.fill();
  ctx.restore();
  // borde
  ctx.strokeStyle = 'rgba(217,180,106,.22)'; ctx.lineWidth = 1; ctx.strokeRect(0.5, 0.5, w - 1, h - 1);
}

export function drawZoneMap(canvas, game, zoneId) {
  const ctx = canvas.getContext('2d');
  const w = canvas.width, h = canvas.height;
  ctx.clearRect(0, 0, w, h);
  const def = ZONES[zoneId];
  if (!def) return;
  const col = zoneColor(zoneId);
  const bg = ctx.createRadialGradient(w / 2, h / 2, 5, w / 2, h / 2, Math.max(w, h) * 0.8);
  bg.addColorStop(0, col.b); bg.addColorStop(0.55, col.a); bg.addColorStop(1, '#05070c');
  ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h);
  // textura
  ctx.save(); ctx.globalAlpha = 0.12; ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1;
  for (let i = 0; i < 24; i++) { const y = (i / 24) * h; ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y + 8); ctx.stroke(); }
  ctx.restore();
  const pad = 16;
  const s = Math.min((w - pad * 2) / def.w, (h - pad * 2) / def.h);
  const ox = (w - def.w * s) / 2, oy = (h - def.h * s) / 2;
  const X = x => ox + x * s, Y = y => oy + y * s;
  // paths
  ctx.strokeStyle = 'rgba(217,180,106,.6)'; ctx.lineWidth = 2; ctx.lineCap = 'round';
  for (const path of def.paths || []) {
    if (path.length < 2) continue;
    ctx.beginPath(); ctx.moveTo(X(path[0].x), Y(path[0].y));
    for (let i = 1; i < path.length; i++) ctx.lineTo(X(path[i].x), Y(path[i].y));
    ctx.stroke();
  }
  // water/lava
  for (const wtr of def.water || []) { ctx.fillStyle = 'rgba(70,160,200,.6)'; ctx.beginPath(); ctx.ellipse(X(wtr.x), Y(wtr.y), wtr.rx * s, wtr.ry * s, 0, 0, TAU); ctx.fill(); }
  for (const lv of def.lava || []) { ctx.fillStyle = 'rgba(220,80,40,.65)'; ctx.beginPath(); ctx.ellipse(X(lv.x), Y(lv.y), lv.rx * s, lv.ry * s, 0, 0, TAU); ctx.fill(); }
  // buildings
  for (const b of def.buildings || []) { ctx.fillStyle = 'rgba(210,200,180,.75)'; ctx.fillRect(X(b.x), Y(b.y), Math.max(2, b.w * s), Math.max(2, b.h * s)); }
  // markers
  for (const p of def.portals || []) { ctx.fillStyle = '#b48cff'; ctx.beginPath(); ctx.arc(X(p.x), Y(p.y), 3.5, 0, TAU); ctx.fill(); ctx.strokeStyle = 'rgba(180,140,255,.5)'; ctx.beginPath(); ctx.arc(X(p.x), Y(p.y), 7, 0, TAU); ctx.stroke(); }
  for (const sh of def.shrines || []) { ctx.fillStyle = '#7ddc9a'; ctx.beginPath(); ctx.arc(X(sh.x), Y(sh.y), 3, 0, TAU); ctx.fill(); }
  for (const c of def.chests || []) { ctx.fillStyle = '#ffd06a'; ctx.fillRect(X(c.x) - 2, Y(c.y) - 2, 4, 4); }
  for (const n of def.npcs || []) { ctx.fillStyle = '#f4dfa3'; ctx.beginPath(); ctx.arc(X(n.x), Y(n.y), 2.5, 0, TAU); ctx.fill(); }
  if (def.boss) { ctx.fillStyle = '#ff5a36'; ctx.beginPath(); ctx.arc(X(def.boss.x), Y(def.boss.y), 5, 0, TAU); ctx.fill(); }
  // player
  if (game?.player && game.zone?.id === zoneId) {
    const px = X(game.player.x), py = Y(game.player.y);
    glow(ctx, px, py, 12, 'rgba(159,232,255,.45)', 0.8);
    ctx.fillStyle = '#eaffff'; ctx.beginPath(); ctx.arc(px, py, 4, 0, TAU); ctx.fill();
  }
  // border + label
  ctx.strokeStyle = col.line; ctx.globalAlpha = 0.35; ctx.lineWidth = 1; ctx.strokeRect(6, 6, w - 12, h - 12); ctx.globalAlpha = 1;
}

export function drawWorldMap(canvas, game) {
  const ctx = canvas.getContext('2d');
  const w = canvas.width, h = canvas.height;
  ctx.clearRect(0, 0, w, h);
  const bg = ctx.createRadialGradient(w * 0.5, h * 0.45, 10, w * 0.5, h * 0.5, Math.max(w, h) * 0.8);
  bg.addColorStop(0, '#172036'); bg.addColorStop(0.6, '#0a101c'); bg.addColorStop(1, '#04060b');
  ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h);
  // marcos de regiones
  const layout = {
    valdoria: { x: 0.12, y: 0.52, w: 0.36, h: 0.34 },
    drakmor: { x: 0.5, y: 0.4, w: 0.34, h: 0.3 },
    kansordore: { x: 0.34, y: 0.12, w: 0.4, h: 0.24 },
  };
  // conexiones
  const pos = {};
  for (const [rid, r] of Object.entries(layout)) {
    const zs = REGION_ZONES[rid] || [];
    zs.forEach((zid, i) => {
      const def = ZONES[zid];
      const wx = (def?.worldPos?.x ?? 50) / 100, wy = (def?.worldPos?.y ?? 50) / 100;
      pos[zid] = {
        x: (r.x + 0.03 + wx * (r.w - 0.06)) * w,
        y: (r.y + 0.04 + wy * (r.h - 0.08)) * h,
      };
    });
  }
  const edges = [
    ['valdoria_village', 'valdoria_meadow'], ['valdoria_meadow', 'valdoria_forest'], ['valdoria_forest', 'valdoria_ruins'],
    ['valdoria_ruins', 'drakmor_pass'], ['drakmor_pass', 'drakmor_city'], ['drakmor_city', 'drakmor_fortress'],
    ['drakmor_city', 'kansordore_temple'], ['kansordore_temple', 'kansordore_library'], ['kansordore_library', 'kansordore_void'],
  ];
  ctx.strokeStyle = 'rgba(217,180,106,.28)'; ctx.lineWidth = 1.5; ctx.setLineDash([5, 5]);
  for (const [a, b] of edges) {
    if (!pos[a] || !pos[b]) continue;
    ctx.beginPath(); ctx.moveTo(pos[a].x, pos[a].y); ctx.lineTo(pos[b].x, pos[b].y); ctx.stroke();
  }
  ctx.setLineDash([]);
  // regiones
  for (const [rid, r] of Object.entries(layout)) {
    const reg = REGIONS[rid];
    const col = REGION_COLORS[rid];
    const rx = r.x * w, ry = r.y * h, rw = r.w * w, rh = r.h * h;
    const g = ctx.createRadialGradient(rx + rw / 2, ry + rh / 2, 4, rx + rw / 2, ry + rh / 2, Math.max(rw, rh) * 0.7);
    g.addColorStop(0, col.b); g.addColorStop(1, 'rgba(5,8,14,.7)');
    ctx.fillStyle = g; ctx.beginPath();
    ctx.ellipse(rx + rw / 2, ry + rh / 2, rw / 2, rh / 2, 0, 0, TAU); ctx.fill();
    ctx.strokeStyle = col.line; ctx.globalAlpha = 0.28; ctx.lineWidth = 1; ctx.stroke(); ctx.globalAlpha = 1;
    ctx.fillStyle = col.line; ctx.font = `700 ${Math.max(10, Math.round(w * 0.012))}px Cinzel, serif`; ctx.textAlign = 'center';
    ctx.fillText(reg?.name?.toUpperCase() || rid.toUpperCase(), rx + rw / 2, ry + 14);
  }
  // zonas
  for (const zid of ZONE_ORDER) {
    const p = pos[zid];
    if (!p) continue;
    const def = ZONES[zid];
    const col = zoneColor(zid);
    const visited = game?.visitedZones?.includes(zid);
    const current = game?.zone?.id === zid;
    ctx.globalAlpha = visited ? 1 : 0.45;
    glow(ctx, p.x, p.y, current ? 22 : 14, current ? 'rgba(159,232,255,.45)' : col.glow, 0.8);
    ctx.fillStyle = current ? '#eaffff' : (visited ? col.line : '#6a7280');
    ctx.beginPath(); ctx.arc(p.x, p.y, current ? 5 : 3.4, 0, TAU); ctx.fill();
    if (current) { ctx.strokeStyle = '#9fe8ff'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(p.x, p.y, 10, 0, TAU); ctx.stroke(); }
    ctx.fillStyle = visited ? '#e9e4d7' : '#8a93a6'; ctx.font = `500 ${Math.max(8, Math.round(w * 0.0095))}px Alegreya Sans, sans-serif`; ctx.textAlign = 'center';
    ctx.fillText(def?.name || zid, p.x, p.y + 16);
    ctx.globalAlpha = 1;
  }
  // leyenda
  ctx.fillStyle = 'rgba(5,8,14,.65)'; rr(ctx, 12, h - 44, 260, 32, 3); ctx.fill();
  ctx.fillStyle = '#9fe8ff'; ctx.beginPath(); ctx.arc(24, h - 28, 3.5, 0, TAU); ctx.fill();
  ctx.fillStyle = '#c9d0dd'; ctx.font = '10px Alegreya Sans, sans-serif'; ctx.textAlign = 'left';
  ctx.fillText('Tu posición', 34, h - 25);
  ctx.fillStyle = '#6a7280'; ctx.beginPath(); ctx.arc(116, h - 28, 3.5, 0, TAU); ctx.fill();
  ctx.fillStyle = '#8a93a6'; ctx.fillText('Zona por descubrir', 126, h - 25);
  // brújula
  ctx.save(); ctx.translate(w - 36, 34); ctx.strokeStyle = 'rgba(217,180,106,.5)'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.arc(0, 0, 16, 0, TAU); ctx.stroke();
  ctx.fillStyle = '#d9b46a'; polyStar(ctx, 0, 0, 6, 14);
  ctx.restore();
}

function polyStar(ctx, x, y, inner, outer) {
  ctx.beginPath();
  for (let i = 0; i < 8; i++) { const a = -Math.PI / 2 + i * Math.PI / 4; const r = i % 2 ? inner : outer; ctx.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r); }
  ctx.closePath(); ctx.fill();
}
