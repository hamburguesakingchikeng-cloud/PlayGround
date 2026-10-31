// Canvas renderer: gothic dungeon, readable silhouettes, and a lot of glow.

import { RARITIES } from './data.js';

const TAU = Math.PI * 2;
const ARENA = 1280;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

function makeFloor() {
  const c = document.createElement('canvas');
  c.width = 512; c.height = 512;
  const ctx = c.getContext('2d');
  let seed = 0x51ab1e;
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  ctx.fillStyle = '#0d0f15';
  ctx.fillRect(0, 0, 512, 512);
  const size = 64;
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const x = col * size;
      const y = row * size;
      const light = 8 + Math.floor(rand() * 5);
      ctx.fillStyle = `hsl(220 9% ${light}%)`;
      ctx.fillRect(x + 1, y + 1, size - 2, size - 2);
      ctx.strokeStyle = 'rgba(0,0,0,.55)';
      ctx.lineWidth = 2;
      ctx.strokeRect(x + 0.5, y + 0.5, size - 1, size - 1);
      ctx.strokeStyle = 'rgba(180,170,145,.045)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x + 5, y + 3);
      ctx.lineTo(x + size - 6, y + 3);
      ctx.stroke();
      // cracks
      if (rand() < 0.28) {
        ctx.strokeStyle = 'rgba(0,0,0,.45)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        let px = x + rand() * size;
        let py = y + rand() * size;
        ctx.moveTo(px, py);
        for (let i = 0; i < 4; i++) {
          px += (rand() - 0.5) * 24;
          py += (rand() - 0.5) * 24;
          ctx.lineTo(px, py);
        }
        ctx.stroke();
      }
      // moss
      if (rand() < 0.16) {
        ctx.fillStyle = 'rgba(54,76,44,.16)';
        ctx.beginPath();
        ctx.ellipse(x + rand() * size, y + rand() * size, rand() * 18 + 5, rand() * 10 + 4, rand() * TAU, 0, TAU);
        ctx.fill();
      }
      // stains
      if (rand() < 0.1) {
        ctx.fillStyle = 'rgba(70,18,18,.18)';
        ctx.beginPath();
        ctx.ellipse(x + rand() * size, y + rand() * size, rand() * 20 + 4, rand() * 8 + 3, rand() * TAU, 0, TAU);
        ctx.fill();
      }
    }
  }
  // pebbles + dust
  for (let i = 0; i < 340; i++) {
    const x = rand() * 512;
    const y = rand() * 512;
    ctx.fillStyle = rand() < 0.5 ? 'rgba(200,190,165,.055)' : 'rgba(0,0,0,.28)';
    ctx.fillRect(x, y, rand() * 2 + 1, rand() * 2 + 1);
  }
  return c;
}

function makeRuneRing() {
  const c = document.createElement('canvas');
  c.width = 560; c.height = 560;
  const ctx = c.getContext('2d');
  ctx.translate(280, 280);
  ctx.strokeStyle = 'rgba(201,163,92,.16)';
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(0, 0, 220, 0, TAU); ctx.stroke();
  ctx.beginPath(); ctx.arc(0, 0, 196, 0, TAU); ctx.stroke();
  ctx.beginPath(); ctx.arc(0, 0, 148, 0, TAU); ctx.stroke();
  ctx.lineWidth = 1;
  for (let i = 0; i < 48; i++) {
    const a = (i / 48) * TAU;
    const r1 = i % 4 === 0 ? 198 : 205;
    ctx.beginPath();
    ctx.moveTo(Math.cos(a) * r1, Math.sin(a) * r1);
    ctx.lineTo(Math.cos(a) * 216, Math.sin(a) * 216);
    ctx.stroke();
  }
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * TAU + 0.2;
    ctx.save();
    ctx.rotate(a);
    ctx.translate(0, -170);
    ctx.strokeStyle = 'rgba(201,163,92,.13)';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(-7, -10); ctx.lineTo(0, 10); ctx.lineTo(7, -10);
    ctx.moveTo(-3, 3); ctx.lineTo(3, 3);
    ctx.stroke();
    ctx.restore();
  }
  return c;
}

export class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { alpha: false });
    this.w = 1; this.h = 1; this.dpr = 1; this.zoom = 1;
    this.floor = makeFloor();
    this.floorPattern = this.ctx.createPattern(this.floor, 'repeat');
    this.rune = makeRuneRing();
    this.motes = [];
    for (let i = 0; i < 60; i++) {
      this.motes.push({
        x: Math.random(), y: Math.random(),
        vx: (Math.random() - 0.5) * 0.008,
        vy: -0.004 - Math.random() * 0.01,
        size: 0.5 + Math.random() * 1.4,
        alpha: 0.06 + Math.random() * 0.18
      });
    }
    this.resize();
  }

  resize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.dpr = Math.min(2, window.devicePixelRatio || 1);
    this.w = w; this.h = h;
    this.canvas.width = Math.floor(w * this.dpr);
    this.canvas.height = Math.floor(h * this.dpr);
    this.canvas.style.width = `${w}px`;
    this.canvas.style.height = `${h}px`;
    this.zoom = w < 700 ? 0.82 : 1;
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    this.ctx.imageSmoothingEnabled = true;
  }

  draw(game, dt = 0.016) {
    const ctx = this.ctx;
    const w = this.w, h = this.h;
    game.zoom = this.zoom;
    const shake = game.shake || 0;
    const shakeX = shake ? (Math.random() - 0.5) * shake : 0;
    const shakeY = shake ? (Math.random() - 0.5) * shake : 0;
    const camX = game.camera.x + shakeX;
    const camY = game.camera.y + shakeY;
    const zoom = this.zoom;
    const sx = x => (x - camX) * zoom + w / 2;
    const sy = y => (y - camY) * zoom + h / 2;
    const left = camX - w / 2 / zoom - 100;
    const right = camX + w / 2 / zoom + 100;
    const top = camY - h / 2 / zoom - 100;
    const bottom = camY + h / 2 / zoom + 100;
    this.view = { left, right, top, bottom, sx, sy, camX, camY, zoom };

    ctx.fillStyle = '#07080c';
    ctx.fillRect(0, 0, w, h);

    // floor
    ctx.save();
    ctx.translate(w / 2 - camX * zoom, h / 2 - camY * zoom);
    ctx.scale(zoom, zoom);
    ctx.fillStyle = this.floorPattern;
    ctx.fillRect(left, top, right - left, bottom - top);
    ctx.restore();

    // central ritual circle
    if (left < 300 && right > -300 && top < 300 && bottom > -300) {
      ctx.save();
      ctx.translate(sx(0), sy(0));
      ctx.scale(zoom, zoom);
      ctx.globalAlpha = game.state === 'menu' ? 0.9 : 0.55;
      ctx.drawImage(this.rune, -280, -280);
      ctx.restore();
    }

    this.drawArena(game, left, right, top, bottom);

    // decals and hazards
    for (const d of game.decals) {
      if (d.x < left || d.x > right || d.y < top || d.y > bottom) continue;
      const alpha = Math.min(1, d.life / 3) * 0.8;
      ctx.save();
      ctx.translate(sx(d.x), sy(d.y));
      ctx.scale(zoom, zoom);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = d.color;
      ctx.beginPath();
      ctx.ellipse(0, 0, d.radius, d.radius * 0.52, d.rot, 0, TAU);
      ctx.fill();
      for (let i = 0; i < 3; i++) {
        const a = d.seed * TAU + i * 2.1;
        ctx.beginPath();
        ctx.ellipse(Math.cos(a) * d.radius * 0.9, Math.sin(a) * d.radius * 0.4, d.radius * 0.22, d.radius * 0.13, a, 0, TAU);
        ctx.fill();
      }
      ctx.restore();
    }
    for (const hz of game.hazards) {
      if (hz.x < left || hz.x > right || hz.y < top || hz.y > bottom) continue;
      const t = game.time * 6;
      ctx.save();
      ctx.translate(sx(hz.x), sy(hz.y));
      ctx.scale(zoom, zoom);
      const grad = ctx.createRadialGradient(0, 0, 4, 0, 0, hz.radius);
      grad.addColorStop(0, 'rgba(255,140,50,.35)');
      grad.addColorStop(0.55, 'rgba(200,60,20,.18)');
      grad.addColorStop(1, 'rgba(80,20,5,0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(0, 0, hz.radius, 0, TAU);
      ctx.fill();
      ctx.globalCompositeOperation = 'lighter';
      for (let i = 0; i < 7; i++) {
        const a = i * 2.4 + t * 0.4;
        const r = hz.radius * (0.2 + 0.55 * ((i / 7 + t * 0.1) % 1));
        ctx.fillStyle = 'rgba(255,140,50,.5)';
        ctx.beginPath();
        ctx.arc(Math.cos(a) * r, Math.sin(a) * r * 0.55, 3 + (i % 3), 0, TAU);
        ctx.fill();
      }
      ctx.restore();
    }

    // props
    const props = game.props.filter(p => p.x > left - 80 && p.x < right + 80 && p.y > top - 140 && p.y < bottom + 80);
    for (const prop of props) this.drawProp(prop, game, sx, sy, zoom);

    // brazier glow behind entities
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (const prop of props) {
      if (prop.type !== 'brazier') continue;
      const px = sx(prop.x), py = sy(prop.y - 26);
      const flicker = 0.85 + Math.sin(game.time * 8 + prop.phase) * 0.1 + Math.sin(game.time * 17 + prop.phase * 2) * 0.04;
      const r = 150 * prop.scale * flicker * zoom;
      const grad = ctx.createRadialGradient(px, py, 4, px, py, r);
      grad.addColorStop(0, 'rgba(255,150,60,.24)');
      grad.addColorStop(0.4, 'rgba(220,90,30,.08)');
      grad.addColorStop(1, 'rgba(120,30,10,0)');
      ctx.fillStyle = grad;
      ctx.fillRect(px - r, py - r, r * 2, r * 2);
    }
    ctx.restore();

    // ground item beams (behind figures)
    for (const g of game.groundItems) {
      if (g.x < left || g.x > right || g.y < top || g.y > bottom) continue;
      this.drawItemBeam(g, game, sx, sy, zoom);
    }

    // pickups
    for (const p of game.pickups) {
      if (p.x < left || p.x > right || p.y < top || p.y > bottom) continue;
      this.drawPickup(p, game, sx, sy, zoom);
    }

    // enemies and player; the player stays legible above the horde
    const enemies = game.enemies.filter(e => !e.dead && e.x > left && e.x < right && e.y > top && e.y < bottom);
    enemies.sort((a, b) => a.y - b.y);
    for (const e of enemies) this.drawEnemy(e, game, sx, sy, zoom);
    this.drawPlayer(game, sx, sy, zoom);

    // ground item icons / labels
    for (const g of game.groundItems) {
      if (g.x < left || g.x > right || g.y < top || g.y > bottom) continue;
      this.drawGroundItem(g, game, sx, sy, zoom);
    }

    // projectiles
    for (const p of game.projectiles) this.drawProjectile(p, game, sx, sy, zoom, false);
    for (const p of game.enemyProjectiles) this.drawProjectile(p, game, sx, sy, zoom, true);

    // effects
    for (const e of game.effects) this.drawEffect(e, game, sx, sy, zoom);

    // particles
    for (const p of game.particles) {
      if (p.x < left || p.x > right || p.y < top || p.y > bottom) continue;
      const alpha = clamp(p.life / p.maxLife, 0, 1);
      ctx.save();
      ctx.globalAlpha = alpha;
      if (p.glow) ctx.globalCompositeOperation = 'lighter';
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(sx(p.x), sy(p.y), Math.max(0.4, p.size * zoom), 0, TAU);
      ctx.fill();
      ctx.restore();
    }

    // damage numbers
    for (const n of game.damageNumbers) {
      const alpha = clamp(n.life / n.maxLife, 0, 1);
      const size = (n.crit ? 17 : 12) * n.scale * zoom;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.font = `600 ${size}px Georgia, serif`;
      ctx.textAlign = 'center';
      ctx.lineWidth = Math.max(2, size * 0.18);
      ctx.strokeStyle = 'rgba(0,0,0,.8)';
      ctx.strokeText(n.value, sx(n.x), sy(n.y));
      ctx.fillStyle = n.color;
      ctx.fillText(n.value, sx(n.x), sy(n.y));
      ctx.restore();
    }

    // ambient darkening + vignette
    ctx.fillStyle = 'rgba(5,7,14,.11)';
    ctx.fillRect(0, 0, w, h);
    const vig = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.2, w / 2, h / 2, Math.max(w, h) * 0.72);
    vig.addColorStop(0, 'rgba(0,0,0,0)');
    vig.addColorStop(0.62, 'rgba(0,0,0,.18)');
    vig.addColorStop(1, 'rgba(0,0,0,.62)');
    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, w, h);

    // menu embers / ambient motes
    this.drawMotes(game, dt);

    if (game.state === 'playing' || game.state === 'levelup' || game.state === 'inventory' || game.state === 'paused' || game.state === 'legendary') {
      // subtle player light
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      const px = sx(game.player.x), py = sy(game.player.y - 18);
      const grad = ctx.createRadialGradient(px, py, 8, px, py, 130 * zoom);
      grad.addColorStop(0, 'rgba(120,210,205,.055)');
      grad.addColorStop(1, 'rgba(120,210,205,0)');
      ctx.fillStyle = grad;
      ctx.fillRect(px - 140, py - 140, 280, 280);
      ctx.restore();
    }
  }

  drawMotes(game, dt) {
    const ctx = this.ctx;
    const w = this.w, h = this.h;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (const m of this.motes) {
      m.x += m.vx * dt * 60;
      m.y += m.vy * dt * 60;
      if (m.x < -0.02) m.x = 1.02;
      if (m.x > 1.02) m.x = -0.02;
      if (m.y < -0.02) m.y = 1.02;
      if (m.y > 1.02) m.y = -0.02;
      ctx.globalAlpha = m.alpha * (0.7 + 0.3 * Math.sin(game.time * 2 + m.x * 10));
      ctx.fillStyle = '#d8b57a';
      ctx.beginPath();
      ctx.arc(m.x * w, m.y * h, m.size, 0, TAU);
      ctx.fill();
    }
    if (game.state === 'menu') {
      for (const e of game.menuEmbers) {
        const p = this.view;
        const x = p.sx(e.x), y = p.sy(e.y);
        if (x < -20 || x > w + 20 || y < -20 || y > h + 20) continue;
        ctx.globalAlpha = clamp(e.life, 0, 1) * 0.5;
        ctx.fillStyle = '#e0a75a';
        ctx.beginPath();
        ctx.arc(x, y, e.size * 1.4, 0, TAU);
        ctx.fill();
      }
    }
    ctx.restore();
  }

  drawArena(game, left, right, top, bottom) {
    const ctx = this.ctx;
    const { sx, sy, zoom } = this.view;
    // dark beyond the walls
    ctx.save();
    ctx.fillStyle = '#04050a';
    if (left < -ARENA) ctx.fillRect(sx(-ARENA) - 600, 0, 600, this.h);
    if (right > ARENA) ctx.fillRect(sx(ARENA), 0, 600, this.h);
    if (top < -ARENA) ctx.fillRect(0, sy(-ARENA) - 600, this.w, 600);
    if (bottom > ARENA) ctx.fillRect(0, sy(ARENA), this.w, 600);
    ctx.restore();

    const bands = [
      { x1: -ARENA, y1: -ARENA, x2: ARENA, y2: -ARENA, side: 'top' },
      { x1: -ARENA, y1: ARENA, x2: ARENA, y2: ARENA, side: 'bottom' },
      { x1: -ARENA, y1: -ARENA, x2: -ARENA, y2: ARENA, side: 'left' },
      { x1: ARENA, y1: -ARENA, x2: ARENA, y2: ARENA, side: 'right' }
    ];
    for (const b of bands) {
      const nearX = b.x1 > left - 80 && b.x1 < right + 80;
      const nearY = b.y1 > top - 80 && b.y1 < bottom + 80;
      if (b.side === 'top' || b.side === 'bottom') {
        if (!nearY) continue;
      } else if (!nearX) continue;
      ctx.save();
      ctx.translate(sx(b.x1), sy(b.y1));
      ctx.scale(zoom, zoom);
      const len = b.side === 'top' || b.side === 'bottom' ? ARENA * 2 : ARENA * 2;
      const thickness = 26;
      ctx.fillStyle = '#0a0b11';
      if (b.side === 'top' || b.side === 'bottom') {
        ctx.fillRect(0, b.side === 'top' ? -thickness : 0, len, thickness);
        ctx.fillStyle = 'rgba(201,163,92,.09)';
        ctx.fillRect(0, b.side === 'top' ? -thickness : thickness - 2, len, 2);
        for (let x = 0; x < len; x += 72) {
          ctx.fillStyle = 'rgba(255,255,255,.025)';
          ctx.fillRect(x + 4, b.side === 'top' ? -thickness + 4 : 4, 62, thickness - 8);
          ctx.strokeStyle = 'rgba(0,0,0,.5)';
          ctx.strokeRect(x + 4, b.side === 'top' ? -thickness + 4 : 4, 62, thickness - 8);
        }
      } else {
        ctx.fillRect(b.side === 'left' ? -thickness : 0, 0, thickness, len);
        ctx.fillStyle = 'rgba(201,163,92,.09)';
        ctx.fillRect(b.side === 'left' ? -thickness : thickness - 2, 0, 2, len);
        for (let y = 0; y < len; y += 72) {
          ctx.fillStyle = 'rgba(255,255,255,.025)';
          ctx.fillRect(b.side === 'left' ? -thickness + 4 : 4, y + 4, thickness - 8, 62);
          ctx.strokeStyle = 'rgba(0,0,0,.5)';
          ctx.strokeRect(b.side === 'left' ? -thickness + 4 : 4, y + 4, thickness - 8, 62);
        }
      }
      ctx.restore();
    }
    // wall torches
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (let i = -4; i <= 4; i++) {
      for (const [x, y] of [[i * 280, -ARENA], [i * 280, ARENA], [-ARENA, i * 280], [ARENA, i * 280]]) {
        if (x < left - 40 || x > right + 40 || y < top - 40 || y > bottom + 40) continue;
        const px = sx(x), py = sy(y);
        const r = 50 * zoom * (0.9 + Math.sin(game.time * 6 + i) * 0.1);
        const grad = ctx.createRadialGradient(px, py, 2, px, py, r);
        grad.addColorStop(0, 'rgba(255,170,80,.3)');
        grad.addColorStop(1, 'rgba(255,120,40,0)');
        ctx.fillStyle = grad;
        ctx.fillRect(px - r, py - r, r * 2, r * 2);
      }
    }
    ctx.restore();
  }

  drawProp(prop, game, sx, sy, zoom) {
    const ctx = this.ctx;
    const t = game.time + prop.phase;
    ctx.save();
    ctx.translate(sx(prop.x), sy(prop.y));
    ctx.scale(zoom * prop.scale, zoom * prop.scale);
    ctx.rotate(prop.rot);
    // shadow
    ctx.fillStyle = 'rgba(0,0,0,.42)';
    ctx.beginPath();
    ctx.ellipse(0, 2, 18, 6, 0, 0, TAU);
    ctx.fill();

    switch (prop.type) {
      case 'tomb':
        ctx.fillStyle = '#2b2d33';
        ctx.strokeStyle = '#111216';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-11, 0); ctx.lineTo(-11, -24); ctx.quadraticCurveTo(0, -38, 11, -24); ctx.lineTo(11, 0); ctx.closePath();
        ctx.fill(); ctx.stroke();
        ctx.fillStyle = 'rgba(255,255,255,.06)';
        ctx.fillRect(-8, -22, 4, 17);
        ctx.strokeStyle = 'rgba(10,10,14,.7)';
        ctx.beginPath(); ctx.moveTo(0, -27); ctx.lineTo(0, -9); ctx.moveTo(-5, -20); ctx.lineTo(5, -20); ctx.stroke();
        ctx.strokeStyle = 'rgba(80,110,60,.25)';
        ctx.beginPath(); ctx.moveTo(-7, -2); ctx.lineTo(-9, -13); ctx.stroke();
        break;
      case 'cross':
        ctx.fillStyle = '#26221e';
        ctx.strokeStyle = '#0d0b09';
        ctx.lineWidth = 2;
        ctx.fillRect(-4, -34, 8, 36); ctx.strokeRect(-4, -34, 8, 36);
        ctx.fillRect(-15, -27, 30, 7); ctx.strokeRect(-15, -27, 30, 7);
        ctx.strokeStyle = 'rgba(255,255,255,.05)';
        ctx.beginPath(); ctx.moveTo(-2, -32); ctx.lineTo(-2, -1); ctx.stroke();
        break;
      case 'pillar':
        ctx.fillStyle = '#23252c';
        ctx.strokeStyle = '#0c0d11';
        ctx.lineWidth = 2;
        ctx.fillRect(-16, -6, 32, 6);
        ctx.fillRect(-11, -54, 22, 48);
        ctx.fillRect(-16, -60, 32, 7);
        ctx.strokeRect(-11, -54, 22, 48);
        ctx.fillStyle = 'rgba(255,255,255,.05)';
        ctx.fillRect(-8, -52, 4, 42);
        ctx.fillStyle = 'rgba(0,0,0,.4)';
        ctx.beginPath(); ctx.moveTo(-11, -54); ctx.lineTo(5, -38); ctx.lineTo(11, -54); ctx.closePath(); ctx.fill();
        break;
      case 'brazier': {
        const flame = 0.8 + Math.sin(t * 9) * 0.15 + Math.sin(t * 17) * 0.06;
        ctx.fillStyle = '#1b1a1d';
        ctx.fillRect(-2, -20, 4, 20);
        ctx.fillStyle = '#2d2a27';
        ctx.beginPath(); ctx.moveTo(-13, -24); ctx.lineTo(13, -24); ctx.lineTo(8, -15); ctx.lineTo(-8, -15); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = '#0b0a0c'; ctx.stroke();
        ctx.globalCompositeOperation = 'lighter';
        const fg = ctx.createRadialGradient(0, -27, 1, 0, -27, 20 * flame);
        fg.addColorStop(0, 'rgba(255,230,160,.95)');
        fg.addColorStop(0.35, 'rgba(255,150,50,.7)');
        fg.addColorStop(1, 'rgba(200,60,10,0)');
        ctx.fillStyle = fg;
        ctx.beginPath(); ctx.ellipse(0, -30, 11 * flame, 18 * flame, 0, 0, TAU); ctx.fill();
        break;
      }
      case 'deadtree':
        ctx.strokeStyle = '#211c18';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(0, 0); ctx.lineTo(0, -36);
        ctx.moveTo(0, -24); ctx.lineTo(-13, -40);
        ctx.moveTo(0, -30); ctx.lineTo(14, -47);
        ctx.moveTo(-6, -33); ctx.lineTo(-7, -47);
        ctx.moveTo(7, -39); ctx.lineTo(8, -54);
        ctx.stroke();
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-13, -40); ctx.lineTo(-20, -47);
        ctx.moveTo(14, -47); ctx.lineTo(21, -43);
        ctx.stroke();
        break;
      case 'skulls':
        ctx.fillStyle = '#a49b85';
        for (const [x, y, r] of [[-9, -4, 6], [5, -3, 7], [0, -11, 6], [-2, -17, 5]]) {
          ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
          ctx.fillStyle = '#2a2620';
          ctx.beginPath(); ctx.arc(x - 2, y - 1, 1.5, 0, TAU); ctx.arc(x + 2, y - 1, 1.5, 0, TAU); ctx.fill();
          ctx.fillStyle = '#a49b85';
        }
        break;
      case 'urn':
        ctx.fillStyle = '#2a2724';
        ctx.strokeStyle = '#0e0c0a';
        ctx.beginPath();
        ctx.moveTo(-7, -3); ctx.bezierCurveTo(-14, -14, -10, -30, -4, -34);
        ctx.lineTo(4, -34); ctx.bezierCurveTo(10, -30, 14, -14, 7, -3); ctx.closePath();
        ctx.fill(); ctx.stroke();
        ctx.fillStyle = 'rgba(255,255,255,.05)';
        ctx.fillRect(-4, -32, 2, 24);
        break;
      case 'statue':
        ctx.fillStyle = '#272930';
        ctx.strokeStyle = '#0c0d11';
        ctx.lineWidth = 2;
        ctx.fillRect(-14, -6, 28, 6);
        ctx.beginPath();
        ctx.moveTo(-10, -6); ctx.lineTo(-8, -42); ctx.quadraticCurveTo(0, -58, 8, -42); ctx.lineTo(10, -6); ctx.closePath();
        ctx.fill(); ctx.stroke();
        ctx.beginPath(); ctx.arc(0, -45, 6, 0, TAU); ctx.fill(); ctx.stroke();
        ctx.strokeStyle = '#3b3e48';
        ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(12, -44); ctx.lineTo(20, -58); ctx.stroke();
        ctx.fillStyle = 'rgba(140,180,190,.18)';
        ctx.beginPath(); ctx.arc(-2, -46, 1.5, 0, TAU); ctx.arc(2, -46, 1.5, 0, TAU); ctx.fill();
        break;
      default: break;
    }
    ctx.restore();
  }

  drawPlayer(game, sx, sy, zoom) {
    const ctx = this.ctx;
    const p = game.player;
    const t = game.time;
    const bob = p.moving ? Math.sin(p.bob) * 1.6 : Math.sin(p.bob * 0.7) * 0.7;
    ctx.save();
    ctx.translate(sx(p.x), sy(p.y));
    ctx.scale(zoom, zoom);
    // shadow
    ctx.fillStyle = 'rgba(0,0,0,.5)';
    ctx.beginPath(); ctx.ellipse(0, 2, 17, 6, 0, 0, TAU); ctx.fill();
    // worn ward ring keeps the player readable in a crowd
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.strokeStyle = 'rgba(119,217,210,.26)';
    ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.ellipse(0, 2, 22, 8, 0, 0, TAU); ctx.stroke();
    ctx.strokeStyle = 'rgba(119,217,210,.1)';
    ctx.beginPath(); ctx.ellipse(0, 2, 28, 10, 0, 0, TAU); ctx.stroke();
    ctx.restore();
    // legendary aura
    const equipped = Object.values(game.equipment).filter(Boolean);
    if (equipped.some(i => i.rarity === 'legendary')) {
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.strokeStyle = 'rgba(255,154,60,.18)';
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.ellipse(0, 1, 23, 8, 0, 0, TAU); ctx.stroke();
      ctx.restore();
    }

    const hurt = p.hurtFlash > 0;
    const evade = p.evadeFlash > 0;
    ctx.translate(0, bob);

    // cape
    const sway = Math.sin(t * 3 + (p.moving ? p.bob : 0)) * 2;
    ctx.fillStyle = hurt ? '#5c1b1b' : '#2a1115';
    ctx.strokeStyle = '#0b0709';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-9, -29);
    ctx.quadraticCurveTo(-17 + sway, -12, -13 + sway, 4);
    ctx.lineTo(-5, 1); ctx.lineTo(0, 4); ctx.lineTo(5, 1); ctx.lineTo(13 - sway, 4);
    ctx.quadraticCurveTo(17 - sway, -12, 9, -29);
    ctx.closePath();
    ctx.fill(); ctx.stroke();

    // legs
    ctx.fillStyle = '#121116';
    ctx.fillRect(-7, -9, 5, 12);
    ctx.fillRect(2, -9, 5, 12);
    ctx.fillStyle = '#08070a';
    ctx.fillRect(-8, 1, 7, 3);
    ctx.fillRect(1, 1, 7, 3);

    // robe
    const robe = ctx.createLinearGradient(0, -34, 0, 2);
    robe.addColorStop(0, hurt ? '#6b2525' : '#26242d');
    robe.addColorStop(1, hurt ? '#3a1515' : '#14131a');
    ctx.fillStyle = robe;
    ctx.strokeStyle = '#09080c';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-10, -29);
    ctx.quadraticCurveTo(-12, -16, -9, -4);
    ctx.lineTo(-7, 2); ctx.lineTo(0, 0); ctx.lineTo(7, 2); ctx.lineTo(9, -4);
    ctx.quadraticCurveTo(12, -16, 10, -29);
    ctx.closePath();
    ctx.fill(); ctx.stroke();

    // belt + clasp
    ctx.fillStyle = '#3c2c1c';
    ctx.fillRect(-9, -17, 18, 3);
    ctx.fillStyle = '#c9a35c';
    ctx.fillRect(-1, -18, 3, 5);

    // shoulders
    ctx.fillStyle = '#1d1b23';
    ctx.beginPath(); ctx.ellipse(-10, -28, 5, 4, -0.2, 0, TAU); ctx.fill();
    ctx.beginPath(); ctx.ellipse(10, -28, 5, 4, 0.2, 0, TAU); ctx.fill();

    // hood
    ctx.fillStyle = hurt ? '#7a2a2a' : '#2d2b35';
    ctx.strokeStyle = '#0a090d';
    ctx.beginPath(); ctx.arc(0, -35, 11, 0, TAU); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#08070b';
    ctx.beginPath(); ctx.ellipse(0, -33, 7, 8, 0, 0, TAU); ctx.fill();
    // eyes
    const eyeColor = evade ? '#a9f6ff' : '#7be0da';
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = eyeColor;
    ctx.shadowColor = eyeColor; ctx.shadowBlur = 7;
    ctx.beginPath(); ctx.arc(-3, -35, 1.5, 0, TAU); ctx.arc(3, -35, 1.5, 0, TAU); ctx.fill();
    ctx.restore();

    // weapon
    const w = game.equipment.weapon;
    const kind = w?.kind || 'bolt';
    const swing = p.attackAnim > 0 ? Math.sin((1 - p.attackAnim / 0.2) * Math.PI) * 0.7 : 0;
    ctx.save();
    ctx.translate(8, -23);
    ctx.rotate(p.facing + swing);
    this.drawWeapon(kind, w?.color || '#8fe7ff', t);
    ctx.restore();

    if (evade) {
      ctx.strokeStyle = 'rgba(150,240,255,.7)';
      ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.ellipse(0, -18, 24, 34, 0, 0, TAU); ctx.stroke();
    }
    ctx.restore();
  }

  drawWeapon(kind, color, t) {
    const ctx = this.ctx;
    ctx.strokeStyle = '#5b4a34';
    ctx.lineWidth = 2.2;
    ctx.lineCap = 'round';
    if (kind === 'cleaver') {
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(13, 0); ctx.stroke();
      ctx.fillStyle = '#8b8b93';
      ctx.beginPath(); ctx.moveTo(12, -4); ctx.lineTo(27, -7); ctx.lineTo(29, 0); ctx.lineTo(12, 4); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#c9c4b8'; ctx.lineWidth = 1; ctx.stroke();
    } else if (kind === 'spear') {
      ctx.strokeStyle = '#4b3a28';
      ctx.beginPath(); ctx.moveTo(-4, 0); ctx.lineTo(26, 0); ctx.stroke();
      ctx.fillStyle = '#a9a4b8';
      ctx.beginPath(); ctx.moveTo(26, -3); ctx.lineTo(34, 0); ctx.lineTo(26, 3); ctx.closePath(); ctx.fill();
    } else if (kind === 'knives') {
      for (const off of [-2, 2]) {
        ctx.save(); ctx.translate(0, off);
        ctx.fillStyle = '#a9b8b2';
        ctx.beginPath(); ctx.moveTo(3, 0); ctx.lineTo(16, -2); ctx.lineTo(20, 0); ctx.lineTo(16, 2); ctx.closePath(); ctx.fill();
        ctx.restore();
      }
    } else if (kind === 'orb') {
      ctx.strokeStyle = '#5b3a26';
      ctx.beginPath(); ctx.moveTo(-4, 0); ctx.lineTo(16, 0); ctx.stroke();
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.fillStyle = color;
      ctx.shadowColor = color; ctx.shadowBlur = 12;
      ctx.beginPath(); ctx.arc(19, 0, 4.5 + Math.sin(t * 6) * 0.5, 0, TAU); ctx.fill();
      ctx.restore();
    } else if (kind === 'storm') {
      ctx.strokeStyle = '#4a4652';
      ctx.beginPath(); ctx.moveTo(-4, 0); ctx.lineTo(24, 0); ctx.stroke();
      ctx.strokeStyle = '#cfe8ff'; ctx.lineWidth = 1.4;
      ctx.beginPath(); ctx.moveTo(20, -6); ctx.lineTo(24, 0); ctx.lineTo(19, 2); ctx.lineTo(26, 8); ctx.stroke();
    } else {
      ctx.strokeStyle = '#4f4132';
      ctx.beginPath(); ctx.moveTo(-4, 0); ctx.lineTo(18, 0); ctx.stroke();
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.fillStyle = color;
      ctx.shadowColor = color; ctx.shadowBlur = 10;
      ctx.beginPath(); ctx.arc(20, 0, 4 + Math.sin(t * 5) * 0.6, 0, TAU); ctx.fill();
      ctx.restore();
    }
  }

  drawEnemy(e, game, sx, sy, zoom) {
    const ctx = this.ctx;
    const t = game.time + e.phase;
    const r = e.radius;
    const scale = (e.elite ? 1.25 : 1) * (e.boss ? 1 : 1);
    ctx.save();
    ctx.translate(sx(e.x), sy(e.y));
    ctx.scale(zoom * scale, zoom * scale);
    if (e.spawnAnim > 0) {
      const s = 0.35 + (1 - e.spawnAnim / 0.4) * 0.65;
      ctx.scale(s, s);
      ctx.globalAlpha = Math.min(1, (1 - e.spawnAnim / 0.4) * 1.4);
    }
    // shadow
    ctx.fillStyle = 'rgba(0,0,0,.45)';
    ctx.beginPath(); ctx.ellipse(0, 1, r * 1.05, r * 0.36, 0, 0, TAU); ctx.fill();

    if (e.elite || e.boss) {
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      const aura = ctx.createRadialGradient(0, -r, 2, 0, -r, r * 2.2);
      aura.addColorStop(0, e.boss ? 'rgba(255,120,60,.15)' : 'rgba(200,60,60,.13)');
      aura.addColorStop(1, 'rgba(200,60,60,0)');
      ctx.fillStyle = aura;
      ctx.beginPath(); ctx.arc(0, -r, r * 2.2, 0, TAU); ctx.fill();
      ctx.restore();
    }

    if (e.boss) this.drawTyrant(e, t);
    else if (e.type === 'bat') this.drawBat(e, t);
    else if (e.type === 'skeleton') this.drawSkeleton(e, t);
    else if (e.type === 'ghoul') this.drawGhoul(e, t);
    else if (e.type === 'cultist') this.drawCultist(e, t);
    else if (e.type === 'wraith') this.drawWraith(e, t);
    else this.drawSkeleton(e, t);

    if (e.flash > 0) {
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = Math.min(0.55, e.flash * 6);
      ctx.fillStyle = '#ffffff';
      ctx.beginPath(); ctx.ellipse(0, -r * 1.15, r * 0.8, r * 1.25, 0, 0, TAU); ctx.fill();
      ctx.restore();
    }

    if (e.elite && !e.boss) {
      const w = 34;
      ctx.fillStyle = 'rgba(0,0,0,.6)';
      ctx.fillRect(-w / 2, -r * 2.6, w, 4);
      ctx.fillStyle = '#c44a4a';
      ctx.fillRect(-w / 2, -r * 2.6, w * clamp(e.hp / e.maxHp, 0, 1), 4);
      ctx.strokeStyle = 'rgba(255,200,120,.35)';
      ctx.strokeRect(-w / 2, -r * 2.6, w, 4);
    }
    ctx.restore();
  }

  drawBat(e, t) {
    const ctx = this.ctx;
    const flap = Math.sin(t * 12) * 0.5;
    ctx.fillStyle = e.color;
    ctx.strokeStyle = '#151019';
    ctx.lineWidth = 1.2;
    // wings
    for (const side of [-1, 1]) {
      ctx.save();
      ctx.scale(side, 1);
      ctx.beginPath();
      ctx.moveTo(4, -12);
      ctx.quadraticCurveTo(16, -22 - flap * 8, 25, -12 - flap * 4);
      ctx.quadraticCurveTo(18, -8, 15, -5);
      ctx.quadraticCurveTo(11, -9, 4, -8);
      ctx.closePath();
      ctx.fill(); ctx.stroke();
      ctx.restore();
    }
    ctx.fillStyle = e.color;
    ctx.beginPath(); ctx.ellipse(0, -10, 7, 8, 0, 0, TAU); ctx.fill(); ctx.stroke();
    ctx.fillStyle = e.accent;
    ctx.beginPath(); ctx.arc(-2.5, -12, 1.2, 0, TAU); ctx.arc(2.5, -12, 1.2, 0, TAU); ctx.fill();
  }

  drawSkeleton(e, t) {
    const ctx = this.ctx;
    const bob = Math.sin(t * 6) * 1.2;
    ctx.translate(0, bob);
    ctx.strokeStyle = '#16141a';
    ctx.lineWidth = 1.3;
    // legs
    ctx.strokeStyle = e.color;
    ctx.lineWidth = 2.6;
    ctx.beginPath(); ctx.moveTo(-3, -8); ctx.lineTo(-6, 2); ctx.moveTo(3, -8); ctx.lineTo(6, 2); ctx.stroke();
    // ribcage
    ctx.strokeStyle = e.color;
    ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.moveTo(0, -24); ctx.lineTo(0, -9); ctx.stroke();
    for (let i = 0; i < 3; i++) {
      ctx.beginPath(); ctx.ellipse(0, -21 + i * 4, 5.5 - i * 0.7, 2.2, 0, 0, TAU); ctx.stroke();
    }
    // arms
    ctx.lineWidth = 2.2;
    ctx.beginPath(); ctx.moveTo(-4, -22); ctx.lineTo(-10, -13); ctx.moveTo(4, -22); ctx.lineTo(11, -16); ctx.stroke();
    // skull
    ctx.fillStyle = e.color;
    ctx.beginPath(); ctx.arc(0, -29, 6.5, 0, TAU); ctx.fill();
    ctx.fillStyle = '#17151a';
    ctx.beginPath(); ctx.arc(-2.4, -30, 1.5, 0, TAU); ctx.arc(2.4, -30, 1.5, 0, TAU); ctx.fill();
    ctx.fillRect(-2, -26, 4, 2);
    // sword
    ctx.strokeStyle = '#6f6f78'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(11, -16); ctx.lineTo(21, -30); ctx.stroke();
    ctx.fillStyle = '#8f8f99';
    ctx.beginPath(); ctx.moveTo(21, -30); ctx.lineTo(24, -34); ctx.lineTo(25, -31); ctx.closePath(); ctx.fill();
    if (e.elite) this.drawCrown(e, -36);
  }

  drawGhoul(e, t) {
    const ctx = this.ctx;
    const bob = Math.sin(t * 4) * 1.4;
    ctx.translate(0, bob);
    ctx.fillStyle = e.color;
    ctx.strokeStyle = '#13140f';
    ctx.lineWidth = 1.4;
    // arms
    ctx.strokeStyle = e.color; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(-8, -22); ctx.quadraticCurveTo(-18, -12, -16, -2); ctx.moveTo(8, -22); ctx.quadraticCurveTo(18, -12, 16, -2); ctx.stroke();
    // body
    ctx.beginPath(); ctx.ellipse(0, -17, 12, 15, 0, 0, TAU); ctx.fill(); ctx.stroke();
    // head
    ctx.beginPath(); ctx.arc(0, -32, 8, 0, TAU); ctx.fill(); ctx.stroke();
    // mouth
    ctx.fillStyle = '#2a1714';
    ctx.beginPath(); ctx.ellipse(0, -29, 4, 3, 0, 0, TAU); ctx.fill();
    // eyes
    ctx.fillStyle = e.accent;
    ctx.beginPath(); ctx.arc(-3, -34, 1.6, 0, TAU); ctx.arc(3, -34, 1.6, 0, TAU); ctx.fill();
    // claws
    ctx.strokeStyle = '#c9c0a5'; ctx.lineWidth = 1.2;
    for (const side of [-1, 1]) {
      for (let i = 0; i < 3; i++) {
        ctx.beginPath(); ctx.moveTo(side * 16, -3 + i * 2); ctx.lineTo(side * 21, -5 + i * 2); ctx.stroke();
      }
    }
    if (e.elite) this.drawCrown(e, -42);
  }

  drawCultist(e, t) {
    const ctx = this.ctx;
    const float = Math.sin(t * 3) * 2;
    ctx.translate(0, float);
    ctx.fillStyle = e.color;
    ctx.strokeStyle = '#100b12';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(0, -34);
    ctx.quadraticCurveTo(-13, -22, -15, 2);
    ctx.lineTo(15, 2);
    ctx.quadraticCurveTo(13, -22, 0, -34);
    ctx.closePath();
    ctx.fill(); ctx.stroke();
    // hood
    ctx.beginPath(); ctx.arc(0, -32, 8, 0, TAU); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#0a070d';
    ctx.beginPath(); ctx.ellipse(0, -31, 5, 6, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = e.accent;
    ctx.beginPath(); ctx.arc(-2, -32, 1.2, 0, TAU); ctx.arc(2, -32, 1.2, 0, TAU); ctx.fill();
    // staff
    ctx.strokeStyle = '#4a3b2c'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(14, -6); ctx.lineTo(19, -40); ctx.stroke();
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = e.accent;
    ctx.shadowColor = e.accent; ctx.shadowBlur = 10;
    ctx.beginPath(); ctx.arc(19, -43, 3.2 + Math.sin(t * 4) * 0.5, 0, TAU); ctx.fill();
    ctx.restore();
    if (e.elite) this.drawCrown(e, -43);
  }

  drawWraith(e, t) {
    const ctx = this.ctx;
    const float = Math.sin(t * 2.4) * 3;
    ctx.translate(0, float);
    ctx.globalAlpha = 0.82;
    ctx.fillStyle = e.color;
    ctx.strokeStyle = 'rgba(120,210,220,.25)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(0, -34);
    ctx.quadraticCurveTo(-15, -24, -12, -4);
    ctx.quadraticCurveTo(-7, -9, -3, 2);
    ctx.quadraticCurveTo(0, -4, 3, 2);
    ctx.quadraticCurveTo(7, -9, 12, -4);
    ctx.quadraticCurveTo(15, -24, 0, -34);
    ctx.closePath();
    ctx.fill(); ctx.stroke();
    ctx.fillStyle = 'rgba(10,12,18,.6)';
    ctx.beginPath(); ctx.arc(0, -31, 7, 0, TAU); ctx.fill();
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = e.accent;
    ctx.shadowColor = e.accent; ctx.shadowBlur = 8;
    ctx.beginPath(); ctx.arc(-2.5, -32, 1.4, 0, TAU); ctx.arc(2.5, -32, 1.4, 0, TAU); ctx.fill();
    ctx.restore();
    if (e.elite) this.drawCrown(e, -42);
  }

  drawTyrant(e, t) {
    const ctx = this.ctx;
    const bob = Math.sin(t * 2.5) * 1.6;
    ctx.translate(0, bob);
    // cape
    ctx.fillStyle = '#2a1014';
    ctx.strokeStyle = '#0b0608';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-22, -62);
    ctx.quadraticCurveTo(-52, -30, -38, 4);
    ctx.lineTo(-10, -4); ctx.lineTo(0, 6); ctx.lineTo(10, -4); ctx.lineTo(38, 4);
    ctx.quadraticCurveTo(52, -30, 22, -62);
    ctx.closePath();
    ctx.fill(); ctx.stroke();
    // legs
    ctx.fillStyle = '#8e846c';
    ctx.strokeStyle = '#1a1712';
    ctx.lineWidth = 2;
    ctx.fillRect(-14, -18, 9, 22);
    ctx.fillRect(5, -18, 9, 22);
    // ribcage
    ctx.fillStyle = '#a39a80';
    ctx.beginPath(); ctx.ellipse(0, -42, 21, 26, 0, 0, TAU); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = '#6e6553'; ctx.lineWidth = 2;
    for (let i = 0; i < 4; i++) {
      ctx.beginPath(); ctx.ellipse(0, -52 + i * 7, 17 - i, 4, 0, 0, TAU); ctx.stroke();
    }
    ctx.fillStyle = 'rgba(255,110,50,.5)';
    ctx.beginPath(); ctx.arc(0, -42, 6, 0, TAU); ctx.fill();
    // shoulders
    ctx.fillStyle = '#8e846c';
    ctx.beginPath(); ctx.ellipse(-24, -60, 10, 8, -0.3, 0, TAU); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(24, -60, 10, 8, 0.3, 0, TAU); ctx.fill(); ctx.stroke();
    // arms
    ctx.strokeStyle = '#8e846c'; ctx.lineWidth = 5;
    ctx.beginPath(); ctx.moveTo(-24, -58); ctx.lineTo(-34, -36); ctx.moveTo(24, -58); ctx.lineTo(36, -34); ctx.stroke();
    // skull
    ctx.fillStyle = '#c0b598';
    ctx.beginPath(); ctx.arc(0, -76, 15, 0, TAU); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#1a1511';
    ctx.beginPath(); ctx.arc(-5, -79, 3.5, 0, TAU); ctx.arc(5, -79, 3.5, 0, TAU); ctx.fill();
    ctx.fillRect(-4, -70, 8, 4);
    // crown + horns
    ctx.fillStyle = '#c9a35c';
    ctx.beginPath();
    ctx.moveTo(-13, -88); ctx.lineTo(-9, -100); ctx.lineTo(-4, -89); ctx.lineTo(0, -104);
    ctx.lineTo(4, -89); ctx.lineTo(9, -100); ctx.lineTo(13, -88); ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#3b2b1a'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(-14, -86); ctx.lineTo(-26, -104); ctx.moveTo(14, -86); ctx.lineTo(26, -104); ctx.stroke();
    // greatsword
    ctx.save();
    ctx.translate(36, -34);
    ctx.rotate(0.3 + Math.sin(t * 1.5) * 0.04);
    ctx.strokeStyle = '#5e5b60'; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -46); ctx.stroke();
    ctx.fillStyle = '#9d9aa2';
    ctx.beginPath(); ctx.moveTo(-4, -46); ctx.lineTo(0, -64); ctx.lineTo(4, -46); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#c9a35c'; ctx.fillRect(-7, -5, 14, 4);
    ctx.restore();
  }

  drawCrown(e, y) {
    const ctx = this.ctx;
    ctx.fillStyle = '#c9a35c';
    ctx.beginPath();
    ctx.moveTo(-7, y); ctx.lineTo(-5, y - 8); ctx.lineTo(-1, y - 3); ctx.lineTo(2, y - 10);
    ctx.lineTo(5, y - 3); ctx.lineTo(8, y - 8); ctx.lineTo(9, y); ctx.closePath();
    ctx.fill();
  }

  drawItemBeam(g, game, sx, sy, zoom) {
    const ctx = this.ctx;
    const item = g.item;
    const rarity = RARITIES[item.rarity] || RARITIES.common;
    const x = sx(g.x);
    const baseY = sy(g.y);
    const height = (item.rarity === 'legendary' ? 150 : item.rarity === 'rare' ? 110 : 70) * zoom;
    const pulse = 0.75 + Math.sin(game.time * 4 + g.bob) * 0.25;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const grad = ctx.createLinearGradient(x, baseY, x, baseY - height);
    grad.addColorStop(0, rarity.beam);
    grad.addColorStop(0.5, rarity.beam.replace(/[\d.]+\)$/, '0.12)'));
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grad;
    ctx.globalAlpha = pulse;
    ctx.fillRect(x - 7 * zoom, baseY - height, 14 * zoom, height);
    ctx.fillStyle = rarity.beam;
    ctx.beginPath(); ctx.ellipse(x, baseY, 13 * zoom, 4 * zoom, 0, 0, TAU); ctx.fill();
    ctx.restore();
  }

  drawGroundItem(g, game, sx, sy, zoom) {
    const ctx = this.ctx;
    const item = g.item;
    const rarity = RARITIES[item.rarity] || RARITIES.common;
    const x = sx(g.x);
    const y = sy(g.y - 8 - Math.sin(g.bob) * 3);
    const size = (item.rarity === 'legendary' ? 24 : item.rarity === 'rare' ? 20 : 17) * zoom;
    ctx.save();
    ctx.translate(x, y);
    // glow disc
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const grad = ctx.createRadialGradient(0, 0, 1, 0, 0, size * 2.2);
    grad.addColorStop(0, rarity.soft);
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grad;
    ctx.beginPath(); ctx.arc(0, 0, size * 2.2, 0, TAU); ctx.fill();
    ctx.restore();
    // rune disc
    ctx.fillStyle = 'rgba(8,9,13,.9)';
    ctx.strokeStyle = rarity.color;
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(0, 0, size * 0.72, 0, TAU); ctx.fill(); ctx.stroke();
    // glyph
    ctx.strokeStyle = rarity.color;
    ctx.fillStyle = rarity.color;
    ctx.lineWidth = 1.6;
    this.drawItemGlyph(item, size * 0.62);
    // label
    if (item.rarity !== 'common') {
      ctx.globalAlpha = 0.9;
      ctx.font = `600 ${10 * zoom}px Georgia, serif`;
      ctx.textAlign = 'center';
      ctx.lineWidth = 3 * zoom;
      ctx.strokeStyle = 'rgba(0,0,0,.85)';
      const label = item.name.length > 26 ? item.name.slice(0, 24) + '…' : item.name;
      ctx.strokeText(label, 0, -size * 1.6);
      ctx.fillStyle = rarity.color;
      ctx.fillText(label, 0, -size * 1.6);
    }
    ctx.restore();
  }

  drawItemGlyph(item, size) {
    const ctx = this.ctx;
    ctx.save();
    ctx.rotate(-0.2);
    if (item.slot === 'weapon') {
      ctx.beginPath(); ctx.moveTo(-size * 0.5, size * 0.5); ctx.lineTo(size * 0.5, -size * 0.5); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(size * 0.2, -size * 0.6); ctx.lineTo(size * 0.65, -size * 0.65); ctx.lineTo(size * 0.6, -size * 0.2); ctx.stroke();
    } else if (item.slot === 'armor') {
      ctx.beginPath();
      ctx.moveTo(-size * 0.45, -size * 0.4);
      ctx.lineTo(-size * 0.15, -size * 0.55);
      ctx.lineTo(0, -size * 0.3);
      ctx.lineTo(size * 0.15, -size * 0.55);
      ctx.lineTo(size * 0.45, -size * 0.4);
      ctx.lineTo(size * 0.3, size * 0.55);
      ctx.lineTo(-size * 0.3, size * 0.55);
      ctx.closePath(); ctx.stroke();
    } else if (item.slot === 'amulet') {
      ctx.beginPath(); ctx.arc(0, -size * 0.35, size * 0.42, 0.15, Math.PI - 0.15); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(size * 0.25, size * 0.35); ctx.lineTo(0, size * 0.62); ctx.lineTo(-size * 0.25, size * 0.35); ctx.closePath(); ctx.stroke();
    } else {
      ctx.beginPath(); ctx.arc(0, size * 0.1, size * 0.42, 0, TAU); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-size * 0.22, -size * 0.32); ctx.lineTo(0, -size * 0.62); ctx.lineTo(size * 0.22, -size * 0.32); ctx.closePath(); ctx.stroke();
    }
    ctx.restore();
  }

  drawPickup(p, game, sx, sy, zoom) {
    const ctx = this.ctx;
    const x = sx(p.x), y = sy(p.y - 4 - Math.sin(p.bob) * 2.5);
    const pulse = 0.8 + Math.sin(game.time * 6 + p.bob) * 0.2;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(zoom, zoom);
    if (p.type === 'xp') {
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.fillStyle = 'rgba(119,217,210,.2)';
      ctx.beginPath(); ctx.arc(0, 0, p.radius * 2.2, 0, TAU); ctx.fill();
      ctx.fillStyle = '#77d9d2';
      ctx.beginPath();
      ctx.moveTo(0, -p.radius * 1.3); ctx.lineTo(p.radius * 0.9, 0);
      ctx.lineTo(0, p.radius * 1.3); ctx.lineTo(-p.radius * 0.9, 0); ctx.closePath(); ctx.fill();
      ctx.fillStyle = 'rgba(220,255,250,.75)';
      ctx.beginPath(); ctx.arc(0, 0, Math.max(0.8, p.radius * 0.22), 0, TAU); ctx.fill();
      ctx.restore();
    } else if (p.type === 'gold') {
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.fillStyle = 'rgba(240,210,142,.2)';
      ctx.beginPath(); ctx.arc(0, 0, 10, 0, TAU); ctx.fill();
      ctx.fillStyle = '#e2b95c';
      ctx.strokeStyle = '#6e4a13';
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.ellipse(0, 0, p.radius, p.radius * 0.7, 0.3, 0, TAU); ctx.fill(); ctx.stroke();
      ctx.restore();
    } else if (p.type === 'health') {
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.fillStyle = 'rgba(180,40,40,.25)';
      ctx.beginPath(); ctx.arc(0, 0, 16, 0, TAU); ctx.fill();
      ctx.fillStyle = '#c33b3b';
      ctx.strokeStyle = '#f0a0a0';
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(0, 0, p.radius * pulse, 0, TAU); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#ffe0e0';
      ctx.fillRect(-1.5, -4, 3, 8); ctx.fillRect(-4, -1.5, 8, 3);
      ctx.restore();
    }
    ctx.restore();
  }

  drawProjectile(p, game, sx, sy, zoom, enemy) {
    const ctx = this.ctx;
    const x = sx(p.x), y = sy(p.y);
    const color = p.color || (enemy ? '#c77dff' : '#8fe7ff');
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    // trail
    if (!enemy && p.trail) {
      ctx.strokeStyle = color;
      ctx.globalAlpha = 0.22;
      ctx.lineWidth = 4 * zoom;
      ctx.beginPath();
      for (let i = 0; i < p.trail.length; i++) {
        const pt = p.trail[i];
        const px = sx(pt.x), py = sy(pt.y);
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
    if (p.kind === 'knife') {
      ctx.translate(x, y);
      ctx.rotate(Math.atan2(p.vy, p.vx));
      ctx.scale(zoom, zoom);
      ctx.fillStyle = color;
      ctx.beginPath(); ctx.moveTo(-7, 0); ctx.lineTo(4, -2.2); ctx.lineTo(9, 0); ctx.lineTo(4, 2.2); ctx.closePath(); ctx.fill();
    } else if (p.kind === 'spear') {
      ctx.strokeStyle = color;
      ctx.lineWidth = 3 * zoom;
      ctx.beginPath();
      ctx.moveTo(x - Math.cos(p.angle) * 18 * zoom, y - Math.sin(p.angle) * 18 * zoom);
      ctx.lineTo(x + Math.cos(p.angle) * 14 * zoom, y + Math.sin(p.angle) * 14 * zoom);
      ctx.stroke();
      ctx.fillStyle = '#e8e2ff';
      ctx.beginPath();
      ctx.arc(x + Math.cos(p.angle) * 16 * zoom, y + Math.sin(p.angle) * 16 * zoom, 3 * zoom, 0, TAU);
      ctx.fill();
    } else if (p.kind === 'orb') {
      const r = (12 + Math.sin(game.time * 10) * 1.5) * zoom;
      const grad = ctx.createRadialGradient(x, y, 1, x, y, r * 2);
      grad.addColorStop(0, '#fff2c8');
      grad.addColorStop(0.3, color);
      grad.addColorStop(1, 'rgba(200,60,10,0)');
      ctx.fillStyle = grad;
      ctx.beginPath(); ctx.arc(x, y, r * 2, 0, TAU); ctx.fill();
    } else {
      const r = (enemy ? 6 : 5) * zoom;
      const grad = ctx.createRadialGradient(x, y, 0, x, y, r * 2.6);
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.25, color);
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grad;
      ctx.beginPath(); ctx.arc(x, y, r * 2.6, 0, TAU); ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.arc(x, y, r * 0.55, 0, TAU); ctx.fill();
    }
    ctx.restore();
  }

  drawEffect(e, game, sx, sy, zoom) {
    const ctx = this.ctx;
    const alpha = clamp(e.life / e.maxLife, 0, 1);
    ctx.save();
    ctx.translate(sx(e.x), sy(e.y));
    ctx.scale(zoom, zoom);
    ctx.globalAlpha = alpha;
    ctx.globalCompositeOperation = 'lighter';
    if (e.type === 'slash') {
      ctx.rotate(e.angle);
      const r = e.radius * (1 - alpha * 0.15);
      const grad = ctx.createLinearGradient(0, 0, r, 0);
      grad.addColorStop(0, 'rgba(255,255,255,0)');
      grad.addColorStop(0.7, e.color);
      grad.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.strokeStyle = grad;
      ctx.lineWidth = 10 * alpha;
      ctx.beginPath(); ctx.arc(0, 0, r, -1.15, 1.15); ctx.stroke();
      ctx.globalAlpha = alpha * 0.4;
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(0, 0, r * 0.8, -1.1, 1.1); ctx.stroke();
    } else if (e.type === 'ring') {
      const r = e.radius * (1 - alpha * 0.7);
      ctx.strokeStyle = e.color;
      ctx.lineWidth = 3 * alpha + 1;
      ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.stroke();
      ctx.globalAlpha = alpha * 0.22;
      ctx.fillStyle = e.color;
      ctx.beginPath(); ctx.arc(0, 0, r * 0.85, 0, TAU); ctx.fill();
    } else if (e.type === 'lightning') {
      const pts = e.points || [];
      for (let pass = 0; pass < 2; pass++) {
        ctx.strokeStyle = pass ? '#f4fbff' : e.color;
        ctx.lineWidth = pass ? 1.4 : 5;
        ctx.globalAlpha = alpha * (pass ? 0.9 : 0.35);
        ctx.beginPath();
        for (let i = 0; i < pts.length; i++) {
          const pt = pts[i];
          const x = pt.x - e.x;
          const y = pt.y - e.y;
          const jitter = pass ? 0 : (Math.sin(i * 17 + e.seed * 30 + game.time * 40) * 7);
          if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x + jitter, y + jitter * 0.4);
        }
        ctx.stroke();
      }
    }
    ctx.restore();
  }
}
