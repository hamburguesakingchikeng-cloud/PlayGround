import { TILE, REGIONS, ELEMENTS } from './data.js';
import { TAU, clamp, lerp, hash2, rgba, hexToRgb } from './util.js';
import { drawTerrain, drawWorldProp, drawInteractable, glow, shadow, ell, rr, flame } from './art.js';
import { drawHero, drawEnemy, drawCreature, drawNPC } from './figures.js';

// ───────────────────────── mundo ─────────────────────────
export function drawWorld(ctx, game, W, H) {
  const world = game.world;
  const cam = game.camera;
  const zoom = game.zoom;
  const vw = W / zoom, vh = H / zoom;
  const view = { x: cam.x - vw / 2, y: cam.y - vh / 2, w: vw, h: vh };
  ctx.clearRect(0, 0, W, H);
  ctx.save();
  ctx.translate(W / 2, H / 2);
  ctx.scale(zoom, zoom);
  ctx.translate(-cam.x, -cam.y);

  const t = game.time;
  drawTerrain(ctx, world, view, view, t);

  // decals bajo entidades
  drawArenaDecals(ctx, game, view, t);

  const list = [];
  for (const p of world.props) {
    if (p.visible === false || p.harvested) continue;
    if (p.x < view.x - 220 || p.x > view.x + view.w + 220 || p.y < view.y - 260 || p.y > view.y + view.h + 120) continue;
    list.push({ y: p.sortY ?? p.y, type: 'prop', obj: p });
  }
  for (const it of world.interactables) {
    if (it.type !== 'chest' && it.type !== 'sign' && it.type !== 'lore') continue;
    if (it.opened && it.type === 'chest') list.push({ y: it.y, type: 'chestOpen', obj: it });
    else if (!(it.read && it.type === 'lore')) list.push({ y: it.y, type: 'interact', obj: it });
  }
  for (const npc of world.npcs) {
    if (npc.hidden) continue;
    if (npc.x < view.x - 100 || npc.x > view.x + view.w + 100 || npc.y < view.y - 160 || npc.y > view.y + view.h + 80) continue;
    list.push({ y: npc.y, type: 'npc', obj: npc });
  }
  for (const c of game.creatures) {
    if (c.captured || c.dead) continue;
    list.push({ y: c.y, type: 'creature', obj: c });
  }
  for (const e of game.enemies) {
    if (e.dead) continue;
    if (e.x < view.x - 120 || e.x > view.x + view.w + 120 || e.y < view.y - 180 || e.y > view.y + view.h + 80) continue;
    list.push({ y: e.y, type: 'enemy', obj: e });
  }
  if (game.ally && !game.ally.dead) list.push({ y: game.ally.y, type: 'ally', obj: game.ally });
  if (game.player && !game.player.dead) list.push({ y: game.player.y, type: 'player', obj: game.player });
  list.sort((a, b) => a.y - b.y);

  // interacción cercana
  if (game.nearInteract) {
    const it = game.nearInteract;
    const pulse = .5 + Math.sin(t * 3) * .3;
    ctx.strokeStyle = `rgba(232,195,122,${.3 + pulse * .3})`; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.ellipse(it.x, it.y + 2, 30, 11, 0, 0, TAU); ctx.stroke();
    glow(ctx, it.x, it.y - 10, 52, '#e8c37a', .1);
  }

  for (const item of list) {
    const o = item.obj;
    if (item.type === 'prop') drawWorldProp(ctx, o, t, world);
    else if (item.type === 'chestOpen') drawInteractable(ctx, o, t, world);
    else if (item.type === 'interact') drawInteractable(ctx, o, t, world);
    else if (item.type === 'npc') drawNPC(ctx, o, t);
    else if (item.type === 'enemy') {
      if (o.telegraph) drawTelegraph(ctx, o, t);
      drawEnemy(ctx, o, t);
    } else if (item.type === 'creature') {
      drawCreature(ctx, o.species, o.x, o.y, o.scale || 1, t, { facing: o.facing, seed: o.seed, alpha: o.resonance > 0 ? .6 : 1 });
      if (o.hp < o.maxHp || o.resonance > 0) drawCreatureBar(ctx, o);
    } else if (item.type === 'ally') {
      drawCreature(ctx, o.species, o.x, o.y, o.scale || 1.1, t, { facing: o.facing, seed: o.seed });
      glow(ctx, o.x, o.y - 30, 34, '#9fdfee', .1);
    } else if (item.type === 'player') {
      drawHero(ctx, o, t);
      drawPlayerEffects(ctx, o, t);
    }
  }

  // proyectiles
  for (const pr of game.projectiles) drawProjectile(ctx, pr, t);
  // efectos
  for (const fx of game.effects) drawEffect(ctx, fx, t);

  // resaltes y sombras ambientales
  ctx.restore();

  // luces aditivas
  drawLights(ctx, game, W, H, zoom, view, t);
  // atmósfera de pantalla
  drawAtmosphere(ctx, game, W, H, t);
}

function drawArenaDecals(ctx, game, view, t) {
  if (game.world.bossArena && game.bossActive) {
    const a = game.world.bossArena;
    ctx.save();
    ctx.strokeStyle = `rgba(210,160,160,${.14 + Math.sin(t * 2) * .05})`;
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(a.x, a.y, a.r, 0, TAU); ctx.stroke();
    ctx.strokeStyle = 'rgba(232,195,122,.09)';
    ctx.beginPath(); ctx.arc(a.x, a.y, a.r - 14, 0, TAU); ctx.stroke();
    ctx.restore();
  }
  // círculos de santuario
  for (const it of game.world.interactables) {
    if (it.type !== 'shrine') continue;
    if (it.x < view.x - 100 || it.x > view.x + view.w + 100) continue;
    const pulse = .5 + Math.sin(t * 1.6 + it.x) * .3;
    ctx.save();
    ctx.strokeStyle = `rgba(232,220,180,${.15 + pulse * .12})`;
    ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.ellipse(it.x, it.y, 46, 18, 0, 0, TAU); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(it.x, it.y, 34, 13, 0, 0, TAU); ctx.stroke();
    for (let i = 0; i < 4; i++) {
      const ang = t * .5 + i / 4 * TAU;
      ctx.fillStyle = `rgba(240,228,190,${.4 + pulse * .2})`;
      ell(ctx, it.x + Math.cos(ang) * 40, it.y + Math.sin(ang) * 16, 1.6, 1.6); ctx.fill();
    }
    ctx.restore();
  }
}

function drawTelegraph(ctx, e, t) {
  const tg = e.telegraph;
  const p = clamp(tg.t / tg.max, 0, 1);
  const alpha = .15 + p * .3;
  if (tg.type === 'circle') {
    ctx.fillStyle = `rgba(190,50,50,${alpha * .5})`;
    ctx.strokeStyle = `rgba(255,120,90,${alpha + .25})`; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(tg.x, tg.y, tg.r, 0, TAU); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = `rgba(255,180,140,${alpha})`;
    ctx.beginPath(); ctx.arc(tg.x, tg.y, tg.r * p, 0, TAU); ctx.stroke();
  } else if (tg.type === 'arc') {
    ctx.fillStyle = `rgba(190,50,50,${alpha * .4})`;
    ctx.strokeStyle = `rgba(255,120,90,${alpha + .2})`; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(e.x, e.y);
    ctx.arc(e.x, e.y, tg.r, tg.angle - tg.arc / 2, tg.angle + tg.arc / 2); ctx.closePath(); ctx.fill(); ctx.stroke();
  } else if (tg.type === 'line') {
    ctx.save(); ctx.translate(e.x, e.y); ctx.rotate(tg.angle);
    ctx.fillStyle = `rgba(190,50,50,${alpha * .4})`; ctx.strokeStyle = `rgba(255,120,90,${alpha})`;
    ctx.fillRect(0, -tg.w / 2, tg.r, tg.w); ctx.strokeRect(0, -tg.w / 2, tg.r, tg.w);
    ctx.restore();
  }
}

function drawCreatureBar(ctx, c) {
  const w = 38;
  const hp = clamp(c.hp / c.maxHp, 0, 1);
  ctx.fillStyle = 'rgba(5,7,12,.65)'; ctx.fillRect(c.x - w / 2, c.y - 67, w, 4);
  ctx.fillStyle = c.capturable ? '#8fd0b3' : '#b8463f'; ctx.fillRect(c.x - w / 2, c.y - 67, w * hp, 4);
  if (c.capturable) {
    ctx.strokeStyle = 'rgba(232,195,122,.8)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(c.x, c.y - 34, 26 + Math.sin(performance.now() / 200) * 2, 0, TAU); ctx.stroke();
  }
}

function drawPlayerEffects(ctx, p, t) {
  if (p.invuln > 0 && Math.sin(t * 30) > 0) {
    ctx.save(); ctx.globalAlpha = .25; ctx.fillStyle = '#9fdfee';
    ell(ctx, p.x, p.y - 30, 20, 32); ctx.fill(); ctx.restore();
  }
  if (p.burning) glow(ctx, p.x, p.y - 30, 36, '#ff7a3a', .2);
  if (p.shield > 0) {
    ctx.strokeStyle = 'rgba(150,220,240,.4)'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.ellipse(p.x, p.y - 30, 28, 38, 0, 0, TAU); ctx.stroke();
  }
  if (p.state === 'dodge') {
    ctx.save(); ctx.globalAlpha = .18; ctx.fillStyle = '#9fdfee';
    ell(ctx, p.x - Math.cos(p.facing) * 24, p.y - 28, 16, 30); ctx.fill(); ctx.restore();
  }
  // sombra de vínculo
  if (p.bondGlow) {
    ctx.strokeStyle = `rgba(232,195,122,${.25 + Math.sin(t * 3) * .1})`; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.ellipse(p.x, p.y + 2, 22, 7, 0, 0, TAU); ctx.stroke();
  }
}

function drawProjectile(ctx, p, t) {
  const col = p.color || '#ffcf70';
  if (p.trail) {
    for (let i = 0; i < 5; i++) {
      const k = i / 5;
      ctx.fillStyle = rgba(col, .18 * (1 - k));
      ell(ctx, p.x - p.vx * .012 * i, p.y - p.vy * .012 * i, p.r * (1 - k * .5), p.r * (1 - k * .5)); ctx.fill();
    }
  }
  glow(ctx, p.x, p.y, p.r * 3.4, col, .5);
  ctx.fillStyle = '#fff6dc'; ell(ctx, p.x, p.y, p.r * .55, p.r * .55); ctx.fill();
  ctx.fillStyle = col; ell(ctx, p.x, p.y, p.r, p.r); ctx.fill();
  if (p.kind === 'arrow') {
    ctx.strokeStyle = col; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x - p.vx * .03, p.y - p.vy * .03); ctx.stroke();
  }
  if (p.kind === 'light') {
    ctx.strokeStyle = rgba(col, .5); ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(p.x - 12, p.y); ctx.lineTo(p.x + 12, p.y); ctx.moveTo(p.x, p.y - 12); ctx.lineTo(p.x, p.y + 12); ctx.stroke();
  }
}

export function drawEffect(ctx, fx) {
  const k = fx.life / fx.max || 0;
  switch (fx.kind) {
    case 'particle': {
      ctx.globalAlpha = clamp(k, 0, 1) * (fx.alpha ?? 1);
      ctx.fillStyle = fx.color;
      if (fx.glow) { glow(ctx, fx.x, fx.y, fx.size * 4, fx.color, .3 * k); }
      ell(ctx, fx.x, fx.y, fx.size * (fx.shrink ? k : 1), fx.size * (fx.shrink ? k : 1)); ctx.fill();
      ctx.globalAlpha = 1;
      break;
    }
    case 'spark': {
      ctx.globalAlpha = k;
      ctx.strokeStyle = fx.color; ctx.lineWidth = fx.size;
      ctx.beginPath(); ctx.moveTo(fx.x, fx.y); ctx.lineTo(fx.x + fx.vx * .035, fx.y + fx.vy * .035); ctx.stroke();
      ctx.globalAlpha = 1;
      break;
    }
    case 'ring': {
      const rr2 = lerp(fx.r0, fx.r1, 1 - k);
      ctx.globalAlpha = k * .8;
      ctx.strokeStyle = fx.color; ctx.lineWidth = fx.width || 2;
      ctx.beginPath(); ctx.ellipse(fx.x, fx.y, rr2, rr2 * (fx.squash || .55), 0, 0, TAU); ctx.stroke();
      ctx.globalAlpha = 1;
      break;
    }
    case 'slash': {
      const prog = 1 - k;
      ctx.save(); ctx.translate(fx.x, fx.y);
      ctx.rotate(fx.angle);
      ctx.globalAlpha = Math.sin(prog * Math.PI) * .8;
      ctx.strokeStyle = fx.color; ctx.lineWidth = fx.width || 5;
      ctx.beginPath(); ctx.arc(0, 0, fx.radius || 46, -1.1 + prog * .3, 1.1 + prog * .3); ctx.stroke();
      ctx.strokeStyle = rgba('#ffffff', .5); ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(0, 0, (fx.radius || 46) + 3, -1.05 + prog * .3, 1.05 + prog * .3); ctx.stroke();
      ctx.restore();
      break;
    }
    case 'text': {
      const fade = k > .7 ? (1 - k) / .3 : k / .7;
      ctx.globalAlpha = clamp(fade, 0, 1);
      ctx.font = `${fx.crit ? 700 : 600} ${fx.size || 14}px "Palatino Linotype", Georgia, serif`;
      ctx.textAlign = 'center';
      ctx.fillStyle = 'rgba(0,0,0,.6)';
      ctx.fillText(fx.text, fx.x + 1, fx.y + 1);
      ctx.fillStyle = fx.color;
      ctx.fillText(fx.text, fx.x, fx.y);
      ctx.globalAlpha = 1;
      break;
    }
    case 'column': {
      const prog = 1 - k;
      const h = 300 * prog;
      const g = ctx.createLinearGradient(fx.x, fx.y - h, fx.x, fx.y);
      g.addColorStop(0, rgba(fx.color, 0)); g.addColorStop(.4, rgba(fx.color, .35 * k)); g.addColorStop(1, rgba(fx.color, .1 * k));
      ctx.fillStyle = g;
      ctx.fillRect(fx.x - 26 * (1 - prog * .4), fx.y - h, 52 * (1 - prog * .4), h);
      glow(ctx, fx.x, fx.y - 30, 120, fx.color, .25 * k);
      break;
    }
    case 'beam': {
      ctx.save(); ctx.translate(fx.x, fx.y); ctx.rotate(fx.angle);
      ctx.globalAlpha = k;
      const g = ctx.createLinearGradient(0, 0, fx.length, 0);
      g.addColorStop(0, rgba(fx.color, .8)); g.addColorStop(1, rgba(fx.color, 0));
      ctx.fillStyle = g; ctx.fillRect(0, -fx.width / 2, fx.length, fx.width);
      ctx.restore();
      break;
    }
    case 'afterimage': {
      ctx.globalAlpha = k * .22;
      ctx.fillStyle = fx.color;
      ell(ctx, fx.x, fx.y - 28, 16, 30); ctx.fill();
      ctx.globalAlpha = 1;
      break;
    }
    case 'symbol': {
      ctx.save(); ctx.translate(fx.x, fx.y); ctx.rotate(fx.angle || 0);
      ctx.globalAlpha = k;
      ctx.strokeStyle = fx.color; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(0, 0, fx.r || 20, 0, TAU); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, -(fx.r || 20)); ctx.lineTo(0, fx.r || 20); ctx.moveTo(-(fx.r || 20), 0); ctx.lineTo(fx.r || 20, 0); ctx.stroke();
      ctx.restore();
      break;
    }
    default: break;
  }
}

function drawLights(ctx, game, W, H, zoom, view, t) {
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const lights = game.world.lights;
  let count = 0;
  for (const l of lights) {
    if (l.x < view.x - l.r || l.x > view.x + view.w + l.r || l.y < view.y - l.r || l.y > view.y + view.h + l.r) continue;
    if (count++ > 42) break;
    const flick = 1 + Math.sin(t * 7 + l.x) * (l.flicker || 0) + Math.sin(t * 13 + l.y) * (l.flicker || 0) * .5;
    const sx = (l.x - view.x) * zoom, sy = (l.y - view.y) * zoom;
    const r = l.r * zoom * flick;
    const g = ctx.createRadialGradient(sx, sy, 0, sx, sy, r);
    g.addColorStop(0, rgba(l.color, l.intensity * .5));
    g.addColorStop(.35, rgba(l.color, l.intensity * .18));
    g.addColorStop(1, rgba(l.color, 0));
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(sx, sy, r, 0, TAU); ctx.fill();
  }
  // brillo de la espada del jugador
  if (game.player) {
    const sx = (game.player.x - view.x) * zoom, sy = (game.player.y - 32 - view.y) * zoom;
    const gw = game.player.equipment?.weapon;
    const col = gw === 'espada_alba' ? '#f2d98e' : gw === 'filo_ceniza' ? '#ef7448' : gw === 'espada_bruma' ? '#8fd0df' : gw === 'daga_velo' ? '#a382c4' : null;
    if (col) {
      const g = ctx.createRadialGradient(sx, sy, 0, sx, sy, 70 * zoom);
      g.addColorStop(0, rgba(col, .18)); g.addColorStop(1, rgba(col, 0));
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(sx, sy, 70 * zoom, 0, TAU); ctx.fill();
    }
  }
  ctx.restore();
}

function drawAtmosphere(ctx, game, W, H, t) {
  const def = game.world.def;
  // niebla de color
  ctx.save();
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, 'rgba(4,7,14,.22)');
  g.addColorStop(.4, 'rgba(4,7,14,0)');
  g.addColorStop(1, def.fog);
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  // viñeta
  const vg = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * .25, W / 2, H / 2, Math.max(W, H) * .72);
  vg.addColorStop(0, 'rgba(0,0,0,0)');
  vg.addColorStop(.7, 'rgba(2,4,8,.22)');
  vg.addColorStop(1, 'rgba(2,4,8,.68)');
  ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
  ctx.restore();

  // clima
  const weather = def.weather;
  ctx.save();
  if (weather === 'leaves') {
    for (let i = 0; i < 22; i++) {
      const seed = i * 7.13;
      const x = ((hash2(i, 1, 4) * W + t * (18 + i % 5 * 7)) % (W + 80)) - 40;
      const y = (hash2(i, 2, 5) * H + t * (12 + i % 4 * 5) + Math.sin(t * .8 + i) * 24) % (H + 40);
      const a = .2 + hash2(i, 3, 6) * .3;
      ctx.save(); ctx.translate(x, y); ctx.rotate(t * .8 + i);
      ctx.fillStyle = i % 3 === 0 ? `rgba(232,195,122,${a})` : i % 3 === 1 ? `rgba(160,180,110,${a})` : `rgba(200,140,70,${a})`;
      ctx.beginPath(); ctx.ellipse(0, 0, 3.2, 1.4, 0, 0, TAU); ctx.fill(); ctx.restore();
    }
  } else if (weather === 'ash') {
    for (let i = 0; i < 46; i++) {
      const x = ((hash2(i, 1, 7) * W + Math.sin(t * .4 + i) * 40 + (t * (8 + i % 5 * 4))) % (W + 60)) - 30;
      const y = ((hash2(i, 2, 8) * H + t * (14 + i % 3 * 6)) % (H + 20)) - 10;
      const a = .12 + hash2(i, 4, 9) * .35;
      ctx.fillStyle = i % 5 === 0 ? `rgba(255,140,80,${a})` : `rgba(210,200,190,${a})`;
      ell(ctx, x, y, 1 + (i % 3) * .6, 1 + (i % 3) * .6); ctx.fill();
    }
    // resplandor inferior
    const lg = ctx.createRadialGradient(W * .5, H * 1.05, 10, W * .5, H * 1.05, H * .8);
    lg.addColorStop(0, 'rgba(200,70,30,.10)'); lg.addColorStop(1, 'rgba(200,70,30,0)');
    ctx.fillStyle = lg; ctx.fillRect(0, 0, W, H);
  } else {
    for (let i = 0; i < 40; i++) {
      const x = ((hash2(i, 1, 10) * W + t * (6 + i % 4 * 4) + Math.sin(t * .6 + i) * 20) % W);
      const y = ((hash2(i, 2, 11) * H - t * (5 + i % 3 * 3)) % (H + 30) + H + 30) % (H + 30);
      const a = .15 + hash2(i, 3, 12) * .45;
      glow(ctx, x, y, 6 + (i % 4) * 3, i % 4 === 0 ? '#bde9ef' : '#d7b3ff', a * .25);
      ctx.fillStyle = `rgba(230,250,255,${a})`;
      ell(ctx, x, y, 1.1, 1.1); ctx.fill();
    }
  }
  ctx.restore();

  // tinte de combate
  if (game.bossActive) {
    const bg = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * .3, W / 2, H / 2, Math.max(W, H) * .7);
    bg.addColorStop(0, 'rgba(0,0,0,0)'); bg.addColorStop(1, 'rgba(90,10,20,.18)');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
  }
  if (game.player && game.player.hp / game.player.maxHp < .25) {
    const dg = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * .2, W / 2, H / 2, Math.max(W, H) * .65);
    dg.addColorStop(0, 'rgba(120,10,20,0)'); dg.addColorStop(1, `rgba(120,10,20,${.18 + Math.sin(t * 5) * .05})`);
    ctx.fillStyle = dg; ctx.fillRect(0, 0, W, H);
  }
}

// ───────────────────────── título ─────────────────────────
export function drawTitle(ctx, W, H, t) {
  ctx.clearRect(0, 0, W, H);
  const horizon = H * .72;
  const sky = ctx.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0, '#050912');
  sky.addColorStop(.38, '#0a1424');
  sky.addColorStop(.68, '#1c2b3f');
  sky.addColorStop(.82, '#4a4238');
  sky.addColorStop(1, '#0b0b0d');
  ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H);

  // estrellas
  for (let i = 0; i < 160; i++) {
    const x = hash2(i, 1, 3) * W;
    const y = hash2(i, 2, 3) * H * .65;
    const tw = .25 + Math.sin(t * (.6 + i % 5 * .3) + i) * .2 + hash2(i, 3, 4) * .3;
    ctx.fillStyle = `rgba(240,240,220,${clamp(tw, 0, .9)})`;
    const s = hash2(i, 4, 5) > .9 ? 1.8 : .9;
    ell(ctx, x, y, s, s); ctx.fill();
  }
  // nebulosa
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  const neb = ctx.createRadialGradient(W * .68, H * .22, 10, W * .68, H * .22, W * .5);
  neb.addColorStop(0, 'rgba(80,110,170,.14)'); neb.addColorStop(.5, 'rgba(90,60,140,.07)'); neb.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = neb; ctx.fillRect(0, 0, W, H);
  ctx.restore();

  // anillo celeste roto
  const cx = W * .5, cy = H * .32, R = Math.min(W * .26, H * .34);
  ctx.save(); ctx.translate(cx, cy); ctx.rotate(-.18 + Math.sin(t * .04) * .02);
  for (let i = 0; i < 3; i++) {
    ctx.strokeStyle = `rgba(232,195,122,${.10 - i * .025})`;
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(0, 0, R * (1 + i * .12), .3, Math.PI * 1.6); ctx.stroke();
    ctx.beginPath(); ctx.arc(0, 0, R * (1 + i * .12), Math.PI * 1.8, Math.PI * 2.1); ctx.stroke();
  }
  ctx.strokeStyle = 'rgba(210,226,240,.15)'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(0, 0, R, 0, TAU); ctx.stroke();
  ctx.restore();

  // montañas
  drawMountains(ctx, W, H, horizon, .55, '#111a26', 9, 1);
  drawMountains(ctx, W, H, horizon, .75, '#0d1420', 7, 2);
  drawMountains(ctx, W, H, horizon, .9, '#090e16', 5, 3);

  // suelo
  const ground = ctx.createLinearGradient(0, horizon - 20, 0, H);
  ground.addColorStop(0, '#14171a'); ground.addColorStop(1, '#05070a');
  ctx.fillStyle = ground; ctx.beginPath(); ctx.moveTo(0, horizon + 40); ctx.quadraticCurveTo(W * .5, horizon - 30, W, horizon + 40); ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.closePath(); ctx.fill();

  // pedestal
  const px = W * .5, py = H * .82;
  const fogG = ctx.createRadialGradient(px, py + 20, 10, px, py + 20, W * .34);
  fogG.addColorStop(0, 'rgba(190,200,210,.10)'); fogG.addColorStop(1, 'rgba(190,200,210,0)');
  ctx.fillStyle = fogG; ell(ctx, px, py + 24, W * .4, 70); ctx.fill();
  // piedra
  ctx.save(); ctx.translate(px, py);
  ctx.fillStyle = '#1c2027';
  ctx.beginPath(); ctx.moveTo(-120, 34); ctx.lineTo(-72, -60); ctx.lineTo(-24, -78); ctx.lineTo(0, -50); ctx.lineTo(20, -80); ctx.lineTo(74, -58); ctx.lineTo(120, 34); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#252b34';
  ctx.beginPath(); ctx.moveTo(-100, 30); ctx.lineTo(-66, -46); ctx.lineTo(-20, -62); ctx.lineTo(-2, -40); ctx.lineTo(22, -58); ctx.lineTo(66, -44); ctx.lineTo(100, 30); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(232,195,122,.22)'; ctx.lineWidth = 1.5;
  for (let i = 0; i < 5; i++) {
    ctx.beginPath(); ctx.moveTo(-60 + i * 28, 10); ctx.lineTo(-50 + i * 28, -20); ctx.lineTo(-38 + i * 28, -10); ctx.stroke();
  }
  // espada
  const sway = Math.sin(t * .7) * .7;
  ctx.rotate(sway * .01);
  const bladeG = ctx.createLinearGradient(0, -300, 0, 20);
  bladeG.addColorStop(0, '#fff7dd'); bladeG.addColorStop(.35, '#e8c37a'); bladeG.addColorStop(.8, '#8d6c38'); bladeG.addColorStop(1, '#4a3a22');
  ctx.fillStyle = bladeG;
  ctx.beginPath(); ctx.moveTo(-9, -300); ctx.lineTo(0, -330); ctx.lineTo(9, -300); ctx.lineTo(13, -34); ctx.lineTo(0, 16); ctx.lineTo(-13, -34); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(50,38,22,.65)'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(0, -318); ctx.lineTo(0, -10); ctx.stroke();
  ctx.fillStyle = '#b08c52'; ctx.fillRect(-52, -34, 104, 9);
  ctx.fillStyle = '#7d5c2e'; ctx.fillRect(-50, -26, 100, 3);
  ctx.fillStyle = '#3d2a18'; rr(ctx, -7, -92, 14, 60, 5); ctx.fill();
  ctx.strokeStyle = '#8a6a3c'; ctx.lineWidth = 2;
  for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.moveTo(-6, -84 + i * 10); ctx.lineTo(6, -80 + i * 10); ctx.stroke(); }
  ctx.fillStyle = '#e8c37a'; ell(ctx, 0, -102, 11, 11); ctx.fill();
  ctx.fillStyle = '#fff4cf'; ell(ctx, -3, -105, 3, 3); ctx.fill();
  ctx.restore();

  // resplandor espada
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  const sw = ctx.createRadialGradient(px, py - 200, 4, px, py - 200, W * .22);
  sw.addColorStop(0, `rgba(255,240,190,${.28 + Math.sin(t * 1.5) * .06})`);
  sw.addColorStop(.45, 'rgba(232,195,122,.07)');
  sw.addColorStop(1, 'rgba(232,195,122,0)');
  ctx.fillStyle = sw; ctx.fillRect(0, 0, W, H);
  ctx.restore();

  // ascuas
  for (let i = 0; i < 42; i++) {
    const speed = 8 + (i % 5) * 4;
    const x = (hash2(i, 1, 20) * W + Math.sin(t * .5 + i) * 30 + t * 4) % W;
    const y = H - ((hash2(i, 2, 21) * H + t * speed) % H);
    const a = .15 + hash2(i, 3, 22) * .45;
    const s = .8 + (i % 3) * .6;
    ctx.fillStyle = i % 4 === 0 ? `rgba(255,220,150,${a})` : `rgba(232,195,122,${a * .7})`;
    ell(ctx, x, y, s, s); ctx.fill();
  }
  // hierba primer plano
  for (let i = 0; i < 70; i++) {
    const x = hash2(i, 1, 30) * W;
    const hgt = 10 + hash2(i, 2, 30) * 44;
    ctx.strokeStyle = `rgba(8,12,14,${.4 + hash2(i, 3, 30) * .4})`;
    ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(x, H); ctx.quadraticCurveTo(x + Math.sin(t + i) * 6, H - hgt * .6, x + Math.sin(t * .7 + i) * 12, H - hgt); ctx.stroke();
  }
  // viñeta
  const vg = ctx.createRadialGradient(W * .5, H * .45, H * .3, W * .5, H * .5, Math.max(W, H) * .8);
  vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(2,4,8,.7)');
  ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
}

function drawMountains(ctx, W, H, horizon, scale, color, layers, seed) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(0, H);
  ctx.lineTo(0, horizon);
  const peaks = 6 + layers;
  for (let i = 0; i <= peaks; i++) {
    const x = (i / peaks) * W;
    const y = horizon - (hash2(i, seed, 40 + seed) * 120 + 30) * scale;
    const midx = x - W / peaks / 2;
    const midy = horizon - (hash2(i, seed + 1, 41) * 150 + 20) * scale;
    ctx.quadraticCurveTo(midx, midy, x, y);
  }
  ctx.lineTo(W, H); ctx.closePath(); ctx.fill();
}

// ───────────────────────── cinemática ─────────────────────────
export function drawCinematic(ctx, W, H, art, t) {
  ctx.clearRect(0, 0, W, H);
  const defs = {
    despertar: { top: '#060a14', bot: '#2e2a26', accent: '#e8c37a', art: 'sword' },
    valdoria: { top: '#101b2c', bot: '#8a683e', accent: '#f0cf88', art: 'village' },
    drakmor: { top: '#170f16', bot: '#7a2e1b', accent: '#ff8a4a', art: 'volcano' },
    kansordore: { top: '#0b1722', bot: '#4f6f88', accent: '#bde9ef', art: 'temple' },
    final: { top: '#080711', bot: '#3a2b52', accent: '#d7b3ff', art: 'rift' },
    corazon: { top: '#0b0a12', bot: '#3f2638', accent: '#e8c37a', art: 'sword' }
  };
  const d = defs[art] || defs.valdoria;
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, d.top); g.addColorStop(1, d.bot);
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  // estrellas
  for (let i = 0; i < 90; i++) {
    const x = hash2(i, 1, 50) * W, y = hash2(i, 2, 50) * H * .55;
    const a = .2 + Math.sin(t * .8 + i) * .15 + hash2(i, 3, 51) * .2;
    ctx.fillStyle = `rgba(240,240,230,${a})`; ell(ctx, x, y, .9, .9); ctx.fill();
  }
  const hz = H * .7;
  if (d.art === 'village') {
    // colinas
    drawMountains(ctx, W, H, hz, .5, 'rgba(24,34,42,.7)', 5, 7);
    // aldea
    ctx.fillStyle = 'rgba(10,12,14,.92)';
    for (let i = 0; i < 7; i++) {
      const x = W * (.15 + i * .11), y = hz + 20 + (i % 3) * 14;
      const w = 50 + (i % 3) * 22, h = 34 + (i % 4) * 10;
      ctx.fillRect(x - w / 2, y - h, w, h);
      ctx.beginPath(); ctx.moveTo(x - w / 2 - 8, y - h); ctx.lineTo(x, y - h - 24); ctx.lineTo(x + w / 2 + 8, y - h); ctx.fill();
      // ventana
      ctx.fillStyle = `rgba(255,190,100,${.3 + Math.sin(t + i) * .08})`; ctx.fillRect(x - 5, y - h + 12, 10, 9);
      ctx.fillStyle = 'rgba(10,12,14,.92)';
    }
    // molino
    ctx.strokeStyle = 'rgba(10,12,14,.95)'; ctx.lineWidth = 5;
    ctx.beginPath(); ctx.moveTo(W * .8, hz + 30); ctx.lineTo(W * .83, hz - 90); ctx.stroke();
    ctx.save(); ctx.translate(W * .83, hz - 90); ctx.rotate(t * .2);
    for (let i = 0; i < 4; i++) { ctx.rotate(Math.PI / 2); ctx.fillStyle = 'rgba(10,12,14,.95)'; ctx.fillRect(-3, 0, 6, 72); }
    ctx.restore();
  } else if (d.art === 'volcano') {
    drawMountains(ctx, W, H, hz, .8, 'rgba(20,12,14,.9)', 4, 9);
    // volcán
    ctx.fillStyle = 'rgba(16,10,12,.95)';
    ctx.beginPath(); ctx.moveTo(W * .45, H); ctx.lineTo(W * .62, hz - 160); ctx.lineTo(W * .68, hz - 150); ctx.lineTo(W * .85, H); ctx.closePath(); ctx.fill();
    const lg = ctx.createLinearGradient(W * .64, hz - 160, W * .64, H);
    lg.addColorStop(0, 'rgba(255,140,60,.8)'); lg.addColorStop(.6, 'rgba(180,50,20,.3)'); lg.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = lg; ctx.beginPath(); ctx.moveTo(W * .625, hz - 150); ctx.lineTo(W * .65, hz - 140); ctx.lineTo(W * .72, H); ctx.lineTo(W * .64, H); ctx.closePath(); ctx.fill();
    // fortaleza
    ctx.fillStyle = 'rgba(8,8,10,.96)';
    ctx.fillRect(W * .12, hz + 6, 150, 60);
    for (let i = 0; i < 5; i++) ctx.fillRect(W * .12 + i * 32, hz - 10, 14, 20);
    ctx.fillRect(W * .16, hz - 70, 30, 80); ctx.fillRect(W * .3, hz - 44, 22, 54);
  } else if (d.art === 'temple') {
    drawMountains(ctx, W, H, hz, .35, 'rgba(28,44,58,.7)', 4, 11);
    // islas flotantes
    ctx.fillStyle = 'rgba(10,18,26,.85)';
    for (let i = 0; i < 4; i++) {
      const x = W * (.18 + i * .21), y = hz - 40 - (i % 2) * 60 + Math.sin(t * .3 + i) * 6;
      ctx.beginPath(); ctx.ellipse(x, y, 70 - i * 6, 18, 0, Math.PI, TAU); ctx.fill();
    }
    // templo
    ctx.fillStyle = 'rgba(12,18,26,.95)';
    ctx.beginPath(); ctx.moveTo(W * .38, hz + 60); ctx.lineTo(W * .38, hz - 80); ctx.lineTo(W * .44, hz - 130); ctx.lineTo(W * .5, hz - 100); ctx.lineTo(W * .56, hz - 150); ctx.lineTo(W * .62, hz - 80); ctx.lineTo(W * .62, hz + 60); ctx.closePath(); ctx.fill();
    for (let i = 0; i < 5; i++) ctx.fillRect(W * .4 + i * 30, hz - 60, 8, 120);
    glow(ctx, W * .5, hz - 140, 110, d.accent, .25);
  } else if (d.art === 'rift') {
    drawMountains(ctx, W, H, hz, .6, 'rgba(16,14,26,.9)', 5, 13);
    // grieta
    const rg = ctx.createRadialGradient(W * .6, hz - 100, 4, W * .6, hz - 100, 220);
    rg.addColorStop(0, `rgba(240,220,255,${.45 + Math.sin(t) * .1})`); rg.addColorStop(.45, 'rgba(160,100,220,.16)'); rg.addColorStop(1, 'rgba(80,40,140,0)');
    ctx.fillStyle = rg; ell(ctx, W * .6, hz - 100, 200, 240); ctx.fill();
    ctx.strokeStyle = `rgba(230,200,255,${.55 + Math.sin(t * 1.3) * .15})`; ctx.lineWidth = 2;
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      ctx.moveTo(W * .5 + i * 30, hz - 300);
      ctx.bezierCurveTo(W * .62 + i * 14, hz - 220, W * .54 - i * 8, hz - 120, W * .66 + i * 12, hz + 30);
      ctx.stroke();
    }
  } else {
    // sword
    drawMountains(ctx, W, H, hz, .45, 'rgba(16,20,28,.85)', 5, 15);
    const cx = W * .5, cy = hz - 45;
    glow(ctx, cx, cy, W * .3, d.accent, .2);
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(-.12);
    const bg2 = ctx.createLinearGradient(0, -180, 0, 60);
    bg2.addColorStop(0, '#fff1c4'); bg2.addColorStop(.5, '#b08c52'); bg2.addColorStop(1, '#2a2012');
    ctx.fillStyle = bg2;
    ctx.beginPath(); ctx.moveTo(-7, -180); ctx.lineTo(0, -200); ctx.lineTo(7, -180); ctx.lineTo(10, 10); ctx.lineTo(0, 50); ctx.lineTo(-10, 10); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#8a6a3c'; ctx.fillRect(-36, -14, 72, 7);
    ctx.fillStyle = '#3a2a18'; ctx.fillRect(-5, -44, 10, 34);
    ctx.fillStyle = d.accent; ell(ctx, 0, -48, 8, 8); ctx.fill();
    // fragmentos
    for (let i = 0; i < 7; i++) {
      const a = t * .15 + i * 1.7;
      ctx.save(); ctx.translate(Math.cos(a) * (80 + i * 18), -80 + Math.sin(a) * (40 + i * 8));
      ctx.rotate(a * 2);
      ctx.fillStyle = `rgba(232,210,160,${.25 + (i % 3) * .1})`;
      ctx.beginPath(); ctx.moveTo(0, -10); ctx.lineTo(5, 0); ctx.lineTo(0, 9); ctx.lineTo(-4, 0); ctx.closePath(); ctx.fill();
      ctx.restore();
    }
    ctx.restore();
  }
  // niebla
  for (let i = 0; i < 4; i++) {
    const y = H * (.55 + i * .1);
    ctx.fillStyle = `rgba(180,190,200,${.025 + i * .008})`;
    ell(ctx, W * (.5 + Math.sin(t * .1 + i) * .2), y, W * .7, 30 + i * 12); ctx.fill();
  }
  // partículas
  for (let i = 0; i < 40; i++) {
    const x = (hash2(i, 1, 60) * W + t * (6 + i % 4 * 3)) % W;
    const y = (hash2(i, 2, 61) * H - t * (4 + i % 3 * 3) + H) % H;
    ctx.fillStyle = `rgba(240,220,180,${.08 + hash2(i, 3, 62) * .2})`;
    ell(ctx, x, y, 1, 1); ctx.fill();
  }
  const vg = ctx.createRadialGradient(W / 2, H / 2, H * .25, W / 2, H / 2, Math.max(W, H) * .8);
  vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,.72)');
  ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
}

// ───────────────────────── mapas ─────────────────────────
function tileColor(world, type) {
  const P = world.def.palette;
  switch (type) {
    case 0: return P.grass1;
    case 1: return P.grass2;
    case 2: return P.path;
    case 3: return P.water;
    case 4: return world.id === 'kansordore' ? '#46505f' : world.id === 'drakmor' ? '#46352f' : '#6e6656';
    case 5: return '#6d5a48';
    case 7: return P.cliff;
    default: return '#111';
  }
}

export function drawMinimap(canvas, game) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  const world = game.world, p = game.player;
  ctx.clearRect(0, 0, W, H);
  ctx.save();
  ctx.beginPath(); ctx.arc(W / 2, H / 2, W / 2, 0, TAU); ctx.clip();
  const span = 26;
  const cx = p.x / TILE, cy = p.y / TILE;
  const s = W / (span * 2);
  ctx.translate(W / 2, H / 2);
  for (let ty = Math.floor(cy - span); ty <= cy + span; ty++) {
    for (let tx = Math.floor(cx - span); tx <= cx + span; tx++) {
      if (tx < 0 || ty < 0 || tx >= world.W || ty >= world.H) continue;
      if (!world.explored[ty * world.W + tx]) continue;
      ctx.fillStyle = tileColor(world, world.terrain[ty * world.W + tx]);
      ctx.fillRect((tx - cx) * s, (ty - cy) * s, s + 1, s + 1);
    }
  }
  // enemigos
  for (const e of game.enemies) {
    if (e.dead) continue;
    const ex = (e.x / TILE - cx) * s, ey = (e.y / TILE - cy) * s;
    if (Math.hypot(ex, ey) > W * .5) continue;
    ctx.fillStyle = e.data.boss ? '#e8c37a' : '#c45555';
    ell(ctx, ex, ey, e.data.boss ? 4 : 2, e.data.boss ? 4 : 2); ctx.fill();
  }
  // criaturas
  for (const c of game.creatures) {
    if (c.dead) continue;
    const ex = (c.x / TILE - cx) * s, ey = (c.y / TILE - cy) * s;
    if (Math.hypot(ex, ey) > W * .5) continue;
    ctx.fillStyle = '#8fd0b3'; ell(ctx, ex, ey, 2.2, 2.2); ctx.fill();
  }
  // objetivo
  if (game.questTarget) {
    const qx = (game.questTarget.x / TILE - cx) * s, qy = (game.questTarget.y / TILE - cy) * s;
    const d = Math.hypot(qx, qy);
    const limit = W * .42;
    const k = d > limit ? limit / d : 1;
    ctx.fillStyle = '#e8c37a';
    ctx.save(); ctx.translate(qx * k, qy * k); ctx.rotate(Math.PI / 4);
    ctx.fillRect(-3.5, -3.5, 7, 7); ctx.restore();
    glow(ctx, qx * k, qy * k, 12, '#e8c37a', .3);
  }
  // jugador
  ctx.save(); ctx.translate(0, 0); ctx.rotate(p.facing + Math.PI / 2);
  ctx.fillStyle = '#fff3d0';
  ctx.beginPath(); ctx.moveTo(0, -6); ctx.lineTo(4.5, 5); ctx.lineTo(0, 2.5); ctx.lineTo(-4.5, 5); ctx.closePath(); ctx.fill();
  ctx.restore();
  ctx.restore();
  // marco
  ctx.strokeStyle = 'rgba(232,195,122,.12)'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.arc(W / 2, H / 2, W * .47, 0, TAU); ctx.stroke();
}

export function drawFullMap(canvas, game, world) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  ctx.clearRect(0, 0, W, H);
  const scale = Math.min((W - 40) / (world.W * TILE), (H - 40) / (world.H * TILE));
  const ox = (W - world.W * TILE * scale) / 2, oy = (H - world.H * TILE * scale) / 2;
  ctx.fillStyle = '#070c14'; ctx.fillRect(0, 0, W, H);
  for (let ty = 0; ty < world.H; ty++) {
    for (let tx = 0; tx < world.W; tx++) {
      const e = world.explored[ty * world.W + tx];
      const c = tileColor(world, world.terrain[ty * world.W + tx]);
      ctx.globalAlpha = e ? 1 : .14;
      ctx.fillStyle = c;
      ctx.fillRect(ox + tx * TILE * scale, oy + ty * TILE * scale, TILE * scale + .5, TILE * scale + .5);
    }
  }
  ctx.globalAlpha = 1;
  // niebla suave
  for (let ty = 0; ty < world.H; ty++) for (let tx = 0; tx < world.W; tx++) {
    if (world.explored[ty * world.W + tx]) continue;
    ctx.fillStyle = 'rgba(7,12,20,.55)';
    ctx.fillRect(ox + tx * TILE * scale, oy + ty * TILE * scale, TILE * scale + .5, TILE * scale + .5);
  }
  // marcadores
  for (const m of world.markers) {
    const x = ox + m.x * scale, y = oy + m.y * scale;
    const col = m.icon === 'boss' ? '#b8463f' : m.icon === 'portal' ? '#b58fd0' : '#e8c37a';
    ctx.fillStyle = 'rgba(7,10,18,.8)'; ctx.beginPath(); ctx.arc(x, y, 12, 0, TAU); ctx.fill();
    ctx.strokeStyle = col; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.fillStyle = col; ell(ctx, x, y, 3.5, 3.5); ctx.fill();
    ctx.font = '9px "Avenir Next", sans-serif'; ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(242,230,205,.8)';
    ctx.fillText(m.name, x, y - 17);
  }
  // jugador
  const px = ox + game.player.x * scale, py = oy + game.player.y * scale;
  ctx.save(); ctx.translate(px, py); ctx.rotate(game.player.facing + Math.PI / 2);
  ctx.fillStyle = '#fff3d0';
  ctx.beginPath(); ctx.moveTo(0, -8); ctx.lineTo(5.5, 6); ctx.lineTo(0, 3); ctx.lineTo(-5.5, 6); ctx.closePath(); ctx.fill();
  ctx.restore();
  glow(ctx, px, py, 20, '#fff3d0', .25);
  // borde
  ctx.strokeStyle = 'rgba(232,195,122,.18)'; ctx.lineWidth = 1;
  ctx.strokeRect(ox - 4, oy - 4, world.W * TILE * scale + 8, world.H * TILE * scale + 8);
}
