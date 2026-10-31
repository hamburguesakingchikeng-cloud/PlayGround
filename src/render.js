import { TAU, WORLD, clamp, rgba, rand, seeded } from './core.js';
import { RARITY, TORCHES } from './data.js';

const SERIF = "'Palatino Linotype', 'Book Antiqua', Palatino, Georgia, serif";

function makeFloorTile() {
  const c = document.createElement('canvas');
  c.width = 320;
  c.height = 320;
  const g = c.getContext('2d');
  const rng = seeded(1337);
  g.fillStyle = '#100d16';
  g.fillRect(0, 0, 320, 320);

  const slabH = 52;
  const slabW = 78;
  for (let row = -1; row < 8; row++) {
    const offset = row % 2 === 0 ? 0 : -slabW / 2;
    for (let col = -1; col < 6; col++) {
      const x = col * slabW + offset + rng() * 3;
      const y = row * slabH + rng() * 3;
      const w = slabW - 5 - rng() * 4;
      const h = slabH - 5 - rng() * 3;
      const shade = 18 + Math.floor(rng() * 9);
      g.fillStyle = `rgb(${shade + 3},${shade},${shade + 7})`;
      g.beginPath();
      g.roundRect(x, y, w, h, 4);
      g.fill();
      g.strokeStyle = 'rgba(5,4,8,0.65)';
      g.lineWidth = 1.4;
      g.stroke();

      // top edge catch-light
      g.strokeStyle = 'rgba(90,74,102,0.12)';
      g.lineWidth = 1;
      g.beginPath();
      g.moveTo(x + 4, y + 1.5);
      g.lineTo(x + w - 4, y + 1.5);
      g.stroke();

      // cracks
      if (rng() < 0.5) {
        g.strokeStyle = 'rgba(4,3,7,0.5)';
        g.lineWidth = 1;
        g.beginPath();
        let cx = x + 8 + rng() * (w - 16);
        let cy = y + 6 + rng() * (h - 12);
        g.moveTo(cx, cy);
        for (let i = 0; i < 3; i++) {
          cx += rng() * 14 - 7;
          cy += rng() * 12 - 4;
          g.lineTo(cx, cy);
        }
        g.stroke();
      }
      // moss / grave dust
      if (rng() < 0.35) {
        g.fillStyle = `rgba(${40 + rng() * 20},${55 + rng() * 25},${38 + rng() * 15},0.16)`;
        g.beginPath();
        g.ellipse(x + rng() * w, y + rng() * h, 5 + rng() * 9, 3 + rng() * 5, rng() * 3, 0, TAU);
        g.fill();
      }
      if (rng() < 0.2) {
        g.fillStyle = 'rgba(180,170,150,0.1)';
        g.beginPath();
        g.arc(x + rng() * w, y + rng() * h, 1 + rng() * 1.4, 0, TAU);
        g.fill();
      }
    }
  }
  // grime speckle
  for (let i = 0; i < 90; i++) {
    g.fillStyle = `rgba(${rng() < 0.5 ? '0,0,0' : '90,80,100'},${0.04 + rng() * 0.06})`;
    g.fillRect(rng() * 320, rng() * 320, 1 + rng() * 2, 1 + rng() * 2);
  }
  return c;
}

function makeProps() {
  const rng = seeded(90210);
  const props = [];
  const types = ['tomb', 'tomb', 'cross', 'urn', 'bones', 'pillar', 'candle', 'cross', 'tomb', 'bones'];
  for (let i = 0; i < 54; i++) {
    const x = 110 + rng() * (WORLD.w - 220);
    const y = 110 + rng() * (WORLD.h - 220);
    if (Math.hypot(x - WORLD.w / 2, y - WORLD.h / 2) < 260) continue;
    if (TORCHES.some(([tx, ty]) => Math.hypot(x - tx, y - ty) < 130)) continue;
    props.push({
      x, y,
      type: types[(rng() * types.length) | 0],
      rot: rng() * 0.5 - 0.25,
      s: 0.8 + rng() * 0.55,
      flip: rng() < 0.5,
    });
  }
  return props;
}

export class Renderer {
  constructor(canvas, game) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.game = game;
    this.w = 0;
    this.h = 0;
    this.dpr = 1;
    this.zoom = 1;
    this.t = 0;
    this.last = 0;
    this.floorCanvas = makeFloorTile();
    this.pattern = this.ctx.createPattern(this.floorCanvas, 'repeat');
    this.props = makeProps();
    this.dust = [];
    for (let i = 0; i < 42; i++) {
      this.dust.push({
        x: Math.random(), y: Math.random(),
        s: 0.6 + Math.random() * 1.6,
        speed: 4 + Math.random() * 14,
        drift: Math.random() * TAU,
        alpha: 0.04 + Math.random() * 0.1,
      });
    }
    this.resize();
  }

  resize() {
    this.dpr = Math.min(2, window.devicePixelRatio || 1);
    this.w = window.innerWidth;
    this.h = window.innerHeight;
    this.canvas.width = Math.floor(this.w * this.dpr);
    this.canvas.height = Math.floor(this.h * this.dpr);
    this.zoom = clamp(Math.min(this.w / 1250, this.h / 780), 0.8, 1.2);
    this.game.view = { w: this.w, h: this.h, zoom: this.zoom };
  }

  render(now) {
    const dt = this.last ? Math.min(0.05, (now - this.last) / 1000) : 0.016;
    this.last = now;
    this.t += dt;

    const ctx = this.ctx;
    const g = this.game;
    const { w, h, dpr, zoom } = this;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = '#07060a';
    ctx.fillRect(0, 0, w, h);

    const halfW = w / (2 * zoom);
    const halfH = h / (2 * zoom);
    let camX = g.camera.x;
    let camY = g.camera.y;
    if (WORLD.w > halfW * 2) camX = clamp(camX, halfW, WORLD.w - halfW);
    else camX = WORLD.w / 2;
    if (WORLD.h > halfH * 2) camY = clamp(camY, halfH, WORLD.h - halfH);
    else camY = WORLD.h / 2;

    const shake = g.camera.shake;
    const sx = shake ? (Math.random() * 2 - 1) * shake : 0;
    const sy = shake ? (Math.random() * 2 - 1) * shake : 0;

    ctx.save();
    ctx.translate(w / 2 - camX * zoom + sx, h / 2 - camY * zoom + sy);
    ctx.scale(zoom, zoom);

    this.drawFloor(camX, camY, halfW, halfH);
    this.drawProps(camX, camY, halfW, halfH);
    this.drawDecals(camX, camY, halfW, halfH);
    this.drawLights(camX, camY, halfW, halfH);
    this.drawPickups(camX, camY, halfW, halfH);

    const enemies = g.enemies.slice().sort((a, b) => a.y - b.y);
    for (const e of enemies) {
      if (!this.inView(e.x, e.y, camX, camY, halfW, halfH, 80)) continue;
      this.drawEnemy(e);
    }
    this.drawPlayer();
    this.drawEnemyProjectiles();
    this.drawProjectiles();
    this.drawEffects();
    this.drawParticles();
    this.drawTexts();

    ctx.restore();
    this.drawScreen();
  }

  inView(x, y, camX, camY, halfW, halfH, margin = 0) {
    return x > camX - halfW - margin && x < camX + halfW + margin && y > camY - halfH - margin && y < camY + halfH + margin;
  }

  /* ── environment ───────────────────────────────────────────── */
  drawFloor(camX, camY, halfW, halfH) {
    const ctx = this.ctx;
    const left = camX - halfW - 40;
    const top = camY - halfH - 40;
    const w = halfW * 2 + 80;
    const h = halfH * 2 + 80;
    ctx.fillStyle = this.pattern;
    ctx.fillRect(left, top, w, h);

    // outer void
    ctx.fillStyle = '#07060a';
    if (left < 0) ctx.fillRect(left, top, -left, h);
    if (top < 0) ctx.fillRect(left, top, w, -top);
    if (left + w > WORLD.w) ctx.fillRect(WORLD.w, top, left + w - WORLD.w, h);
    if (top + h > WORLD.h) ctx.fillRect(left, WORLD.h, w, top + h - WORLD.h);

    // walls
    this.drawWalls(camX, camY, halfW, halfH);
  }

  drawWalls(camX, camY, halfW, halfH) {
    const ctx = this.ctx;
    const t = 54;
    const drawStrip = (x, y, w, h, horizontal) => {
      ctx.fillStyle = '#181320';
      ctx.fillRect(x, y, w, h);
      ctx.strokeStyle = 'rgba(0,0,0,0.55)';
      ctx.lineWidth = 2;
      if (horizontal) {
        for (let bx = x; bx < x + w; bx += 58) {
          ctx.strokeRect(bx, y + 2, 56, h - 4);
        }
        ctx.fillStyle = 'rgba(120,100,140,0.08)';
        ctx.fillRect(x, y + 3, w, 4);
      } else {
        for (let by = y; by < y + h; by += 58) {
          ctx.strokeRect(x + 2, by, w - 4, 56);
        }
        ctx.fillStyle = 'rgba(120,100,140,0.08)';
        ctx.fillRect(x + 3, y, 4, h);
      }
      ctx.fillStyle = 'rgba(0,0,0,0.35)';
      ctx.fillRect(x, y, w, h);
    };
    if (camY - halfH < t) drawStrip(0, 0, WORLD.w, t, true);
    if (camY + halfH > WORLD.h - t) drawStrip(0, WORLD.h - t, WORLD.w, t, true);
    if (camX - halfW < t) drawStrip(0, 0, t, WORLD.h, false);
    if (camX + halfW > WORLD.w - t) drawStrip(WORLD.w - t, 0, t, WORLD.h, false);

    // inner edge line
    ctx.strokeStyle = 'rgba(90,72,110,0.35)';
    ctx.lineWidth = 3;
    ctx.strokeRect(t, t, WORLD.w - t * 2, WORLD.h - t * 2);
  }

  drawProps(camX, camY, halfW, halfH) {
    const ctx = this.ctx;
    for (const p of this.props) {
      if (!this.inView(p.x, p.y, camX, camY, halfW, halfH, 60)) continue;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.scale(p.flip ? -p.s : p.s, p.s);
      ctx.globalAlpha = 0.95;
      if (p.type === 'tomb') {
        ctx.fillStyle = 'rgba(0,0,0,0.35)';
        ctx.beginPath();
        ctx.ellipse(0, 12, 17, 6, 0, 0, TAU);
        ctx.fill();
        ctx.fillStyle = '#3a3440';
        ctx.beginPath();
        ctx.moveTo(-11, 12);
        ctx.lineTo(-11, -8);
        ctx.quadraticCurveTo(-11, -20, 0, -20);
        ctx.quadraticCurveTo(11, -20, 11, -8);
        ctx.lineTo(11, 12);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = 'rgba(140,128,150,0.25)';
        ctx.lineWidth = 1.2;
        ctx.stroke();
        ctx.strokeStyle = 'rgba(15,12,20,0.75)';
        ctx.lineWidth = 2.4;
        ctx.beginPath();
        ctx.moveTo(0, -15);
        ctx.lineTo(0, -3);
        ctx.moveTo(-4, -11);
        ctx.lineTo(4, -11);
        ctx.stroke();
        ctx.fillStyle = 'rgba(60,85,58,0.4)';
        ctx.fillRect(-9, 6, 18, 3);
      } else if (p.type === 'cross') {
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.beginPath();
        ctx.ellipse(0, 13, 12, 4.5, 0, 0, TAU);
        ctx.fill();
        ctx.strokeStyle = '#4b3a2c';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(0, 12);
        ctx.lineTo(0, -20);
        ctx.moveTo(-8, -10);
        ctx.lineTo(8, -10);
        ctx.stroke();
        ctx.strokeStyle = 'rgba(150,120,80,0.22)';
        ctx.lineWidth = 1;
        ctx.stroke();
      } else if (p.type === 'urn') {
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.beginPath();
        ctx.ellipse(0, 9, 10, 4, 0, 0, TAU);
        ctx.fill();
        ctx.fillStyle = '#433a3f';
        ctx.beginPath();
        ctx.ellipse(0, 0, 9, 11, 0, 0, TAU);
        ctx.fill();
        ctx.fillStyle = '#2b252b';
        ctx.beginPath();
        ctx.ellipse(0, -10, 6, 3, 0, 0, TAU);
        ctx.fill();
        ctx.strokeStyle = 'rgba(160,130,110,0.25)';
        ctx.beginPath();
        ctx.ellipse(0, 0, 9, 11, 0, 0, TAU);
        ctx.stroke();
      } else if (p.type === 'bones') {
        ctx.fillStyle = 'rgba(0,0,0,0.25)';
        ctx.beginPath();
        ctx.ellipse(0, 7, 14, 4, 0, 0, TAU);
        ctx.fill();
        ctx.strokeStyle = '#8d8375';
        ctx.lineWidth = 2.4;
        for (let i = 0; i < 3; i++) {
          ctx.beginPath();
          ctx.moveTo(-13 + i * 4, 4 - i * 2);
          ctx.lineTo(8 + i * 3, -1 + i * 3);
          ctx.stroke();
        }
        ctx.fillStyle = '#a89d8b';
        ctx.beginPath();
        ctx.arc(-8, -6, 4.6, 0, TAU);
        ctx.fill();
        ctx.fillStyle = '#221d25';
        ctx.beginPath();
        ctx.arc(-9.4, -7, 1.1, 0, TAU);
        ctx.arc(-6.6, -7, 1.1, 0, TAU);
        ctx.fill();
      } else if (p.type === 'pillar') {
        ctx.fillStyle = 'rgba(0,0,0,0.35)';
        ctx.beginPath();
        ctx.ellipse(0, 14, 18, 6, 0, 0, TAU);
        ctx.fill();
        ctx.fillStyle = '#3a3341';
        ctx.fillRect(-11, -14, 22, 28);
        ctx.fillStyle = '#453c4d';
        ctx.fillRect(-14, 10, 28, 6);
        ctx.fillRect(-14, -18, 28, 6);
        ctx.strokeStyle = 'rgba(150,135,165,0.2)';
        ctx.lineWidth = 1.5;
        for (let i = -8; i <= 8; i += 5) {
          ctx.beginPath();
          ctx.moveTo(i, -12);
          ctx.lineTo(i, 8);
          ctx.stroke();
        }
        ctx.fillStyle = 'rgba(30,45,35,0.35)';
        ctx.fillRect(-11, -4, 22, 4);
      } else if (p.type === 'candle') {
        ctx.fillStyle = 'rgba(0,0,0,0.25)';
        ctx.beginPath();
        ctx.ellipse(0, 6, 8, 3, 0, 0, TAU);
        ctx.fill();
        ctx.fillStyle = '#c9bda2';
        ctx.fillRect(-1.6, -4, 3.2, 10);
        const flick = 1 + Math.sin(this.t * 11 + p.x) * 0.2;
        const grad = ctx.createRadialGradient(0, -8, 0, 0, -8, 22);
        grad.addColorStop(0, 'rgba(255,190,90,0.35)');
        grad.addColorStop(1, 'rgba(255,120,40,0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(0, -8, 22, 0, TAU);
        ctx.fill();
        ctx.fillStyle = '#ffcf6b';
        ctx.beginPath();
        ctx.ellipse(0, -7, 1.7, 3.4 * flick, 0, 0, TAU);
        ctx.fill();
      }
      ctx.restore();
    }

    // torches
    for (const [x, y] of TORCHES) {
      if (!this.inView(x, y, camX, camY, halfW, halfH, 80)) continue;
      this.drawTorch(x, y);
    }
  }

  drawTorch(x, y) {
    const ctx = this.ctx;
    const flick = 0.85 + Math.sin(this.t * 9 + x * 0.1) * 0.15 + Math.sin(this.t * 23 + y) * 0.05;
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.beginPath();
    ctx.ellipse(0, 8, 15, 5, 0, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = '#2d2533';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, 8);
    ctx.lineTo(0, -8);
    ctx.stroke();
    ctx.fillStyle = '#40344a';
    ctx.beginPath();
    ctx.moveTo(-10, -8);
    ctx.lineTo(10, -8);
    ctx.lineTo(6, -2);
    ctx.lineTo(-6, -2);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#ff8a3d';
    ctx.beginPath();
    ctx.ellipse(0, -15, 6 * flick, 11 * flick, 0, 0, TAU);
    ctx.fill();
    ctx.fillStyle = '#ffd75e';
    ctx.beginPath();
    ctx.ellipse(0, -15, 3 * flick, 6.5 * flick, 0, 0, TAU);
    ctx.fill();
    ctx.restore();
  }

  drawDecals(camX, camY, halfW, halfH) {
    const ctx = this.ctx;
    for (const d of this.game.decals) {
      if (!this.inView(d.x, d.y, camX, camY, halfW, halfH, 30)) continue;
      ctx.fillStyle = `rgba(58,14,18,${d.alpha})`;
      ctx.beginPath();
      ctx.ellipse(d.x, d.y + 4, d.r, d.r * 0.5, 0, 0, TAU);
      ctx.fill();
    }
  }

  drawLights(camX, camY, halfW, halfH) {
    const ctx = this.ctx;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const p = this.game.player;
    const flick = 0.9 + Math.sin(this.t * 7) * 0.08;
    let grad = ctx.createRadialGradient(p.x, p.y, 8, p.x, p.y, 300);
    grad.addColorStop(0, 'rgba(255,180,100,0.10)');
    grad.addColorStop(1, 'rgba(255,120,50,0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(p.x, p.y, 300, 0, TAU);
    ctx.fill();

    for (const [x, y] of TORCHES) {
      if (!this.inView(x, y, camX, camY, halfW, halfH, 240)) continue;
      const f = 0.75 + Math.sin(this.t * 8 + x) * 0.2;
      grad = ctx.createRadialGradient(x, y - 12, 4, x, y - 12, 200 * f);
      grad.addColorStop(0, 'rgba(255,150,60,0.15)');
      grad.addColorStop(1, 'rgba(255,80,30,0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(x, y - 12, 200 * f, 0, TAU);
      ctx.fill();
    }
    ctx.restore();
  }

  /* ── pickups ───────────────────────────────────────────────── */
  drawPickups(camX, camY, halfW, halfH) {
    const ctx = this.ctx;
    const g = this.game;
    for (const pk of g.pickups) {
      if (!this.inView(pk.x, pk.y, camX, camY, halfW, halfH, 90)) continue;
      const bob = Math.sin(this.t * 3 + pk.bob) * 3;
      if (pk.kind === 'xp') {
        ctx.save();
        ctx.translate(pk.x, pk.y - 6 + bob);
        ctx.rotate(this.t * 1.6 + pk.bob);
        ctx.shadowColor = '#7fe6ff';
        ctx.shadowBlur = 10;
        ctx.fillStyle = '#8ff0ff';
        ctx.beginPath();
        ctx.moveTo(0, -6);
        ctx.lineTo(4.4, 0);
        ctx.lineTo(0, 6);
        ctx.lineTo(-4.4, 0);
        ctx.closePath();
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.fillStyle = 'rgba(255,255,255,0.7)';
        ctx.beginPath();
        ctx.moveTo(0, -4);
        ctx.lineTo(2, 0);
        ctx.lineTo(0, 2);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      } else if (pk.kind === 'gold') {
        ctx.save();
        ctx.translate(pk.x, pk.y - 4 + bob * 0.6);
        ctx.fillStyle = 'rgba(255,200,80,0.16)';
        ctx.beginPath();
        ctx.arc(0, 0, 9, 0, TAU);
        ctx.fill();
        ctx.fillStyle = '#e6b64c';
        ctx.beginPath();
        ctx.ellipse(0, 0, 4.4, 5.4, 0, 0, TAU);
        ctx.fill();
        ctx.fillStyle = '#ffe39a';
        ctx.beginPath();
        ctx.ellipse(-1.2, -1.4, 1.5, 2.2, 0, 0, TAU);
        ctx.fill();
        ctx.restore();
      } else if (pk.kind === 'item') {
        this.drawLootDrop(pk, bob);
      }
    }
  }

  drawLootDrop(pk, bob) {
    const ctx = this.ctx;
    const item = pk.item;
    const rar = RARITY[item.rarity];
    const color = rar.color;
    const pulse = 0.7 + Math.sin(this.t * 4 + pk.bob) * 0.3;
    const height = 54 + rar.order * 14;

    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const grad = ctx.createLinearGradient(pk.x, pk.y - height, pk.x, pk.y + 4);
    grad.addColorStop(0, 'rgba(0,0,0,0)');
    grad.addColorStop(0.55, rgba(color, 0.06 + 0.05 * pulse));
    grad.addColorStop(1, rgba(color, 0.26));
    ctx.fillStyle = grad;
    ctx.fillRect(pk.x - 7, pk.y - height, 14, height + 4);
    ctx.restore();

    // ground ring
    ctx.strokeStyle = rgba(color, 0.35 + pulse * 0.25);
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.ellipse(pk.x, pk.y + 2, 12, 5, 0, 0, TAU);
    ctx.stroke();

    ctx.save();
    ctx.translate(pk.x, pk.y - 16 + bob);
    ctx.rotate(Math.sin(this.t * 1.4 + pk.bob) * 0.25);
    ctx.shadowColor = color;
    ctx.shadowBlur = 14 + rar.order * 4;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(0, -9);
    ctx.lineTo(7, 0);
    ctx.lineTo(0, 9);
    ctx.lineTo(-7, 0);
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(10,8,14,0.85)';
    ctx.beginPath();
    ctx.moveTo(0, -6);
    ctx.lineTo(4.6, 0);
    ctx.lineTo(0, 6);
    ctx.lineTo(-4.6, 0);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.3;
    this.drawSlotGlyph(ctx, item.slot, 0, 0, 4.4);
    ctx.restore();

    // nearby label
    const d = Math.hypot(pk.x - this.game.player.x, pk.y - this.game.player.y);
    if (d < 170) {
      ctx.save();
      ctx.globalAlpha = clamp((170 - d) / 60, 0, 1);
      ctx.font = `600 10px ${SERIF}`;
      ctx.textAlign = 'center';
      ctx.fillStyle = 'rgba(0,0,0,0.75)';
      ctx.fillText(item.name, pk.x + 1, pk.y - height - 8 + 1);
      ctx.fillStyle = color;
      ctx.fillText(item.name, pk.x, pk.y - height - 8);
      ctx.restore();
    }
  }

  drawSlotGlyph(ctx, slot, x, y, s) {
    ctx.save();
    ctx.translate(x, y);
    ctx.beginPath();
    if (slot === 'weapon') {
      ctx.moveTo(-s, s);
      ctx.lineTo(s, -s);
      ctx.moveTo(s * 0.2, -s);
      ctx.lineTo(s, -s * 0.2);
    } else if (slot === 'helm') {
      ctx.arc(0, 0, s, Math.PI, 0);
      ctx.moveTo(-s, 0);
      ctx.lineTo(-s, s * 0.6);
      ctx.moveTo(s, 0);
      ctx.lineTo(s, s * 0.6);
    } else if (slot === 'chest') {
      ctx.moveTo(-s * 0.8, -s * 0.7);
      ctx.lineTo(s * 0.8, -s * 0.7);
      ctx.lineTo(s, s);
      ctx.lineTo(-s, s);
      ctx.closePath();
    } else if (slot === 'gloves') {
      ctx.moveTo(-s * 0.8, s);
      ctx.lineTo(-s * 0.8, -s * 0.4);
      ctx.moveTo(0, s);
      ctx.lineTo(0, -s);
      ctx.moveTo(s * 0.8, s);
      ctx.lineTo(s * 0.8, -s * 0.2);
    } else if (slot === 'boots') {
      ctx.moveTo(-s * 0.5, -s);
      ctx.lineTo(-s * 0.5, s * 0.3);
      ctx.lineTo(-s, s);
      ctx.lineTo(s, s);
    } else if (slot === 'ring') {
      ctx.arc(0, s * 0.25, s * 0.65, 0, TAU);
    } else if (slot === 'amulet') {
      ctx.arc(0, s * 0.3, s * 0.55, 0, TAU);
      ctx.moveTo(-s * 0.6, -s);
      ctx.quadraticCurveTo(0, -s * 0.2, s * 0.6, -s);
    }
    ctx.stroke();
    ctx.restore();
  }

  /* ── player ────────────────────────────────────────────────── */
  drawPlayer() {
    const ctx = this.ctx;
    const p = this.game.player;
    const bob = Math.sin(p.anim) * 1.7;
    const blink = p.iframes > 0 && Math.sin(p.iframes * 45) > 0;

    ctx.save();
    ctx.globalAlpha = blink ? 0.55 : 1;
    // shadow
    ctx.fillStyle = 'rgba(0,0,0,0.45)';
    ctx.beginPath();
    ctx.ellipse(p.x, p.y + 11, 15, 6, 0, 0, TAU);
    ctx.fill();

    // aura
    ctx.strokeStyle = 'rgba(127,230,255,0.10)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.ellipse(p.x, p.y + 10, 22 + Math.sin(this.t * 2) * 2, 8, 0, 0, TAU);
    ctx.stroke();

    ctx.translate(p.x, p.y + bob);
    const face = p.facing;
    const side = Math.cos(face) >= 0 ? 1 : -1;

    // cape
    const flutter = Math.sin(p.anim * 0.9) * 2.4;
    ctx.fillStyle = '#191428';
    ctx.beginPath();
    ctx.moveTo(-9, -2);
    ctx.quadraticCurveTo(-14, 10, -8 + flutter, 16);
    ctx.lineTo(8 + flutter, 16);
    ctx.quadraticCurveTo(14, 10, 9, -2);
    ctx.closePath();
    ctx.fill();

    // cloak
    ctx.fillStyle = '#2b2440';
    ctx.beginPath();
    ctx.moveTo(-8, -7);
    ctx.quadraticCurveTo(-12, 5, -7, 12);
    ctx.quadraticCurveTo(0, 15, 7, 12);
    ctx.quadraticCurveTo(12, 5, 8, -7);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = 'rgba(120,100,160,0.4)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // trim
    ctx.strokeStyle = '#8b7440';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(-6.4, 10.5);
    ctx.quadraticCurveTo(0, 13.5, 6.4, 10.5);
    ctx.stroke();

    // hood
    ctx.fillStyle = '#211b31';
    ctx.beginPath();
    ctx.arc(0, -9, 8.2, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = 'rgba(140,118,180,0.45)';
    ctx.stroke();

    // face
    ctx.fillStyle = '#0b0910';
    ctx.beginPath();
    ctx.ellipse(0, -8, 5.4, 5.8, 0, 0, TAU);
    ctx.fill();
    const ex = Math.cos(face) * 2.1;
    const ey = Math.sin(face) * 1.6;
    ctx.fillStyle = '#8ff0ff';
    ctx.shadowColor = '#7fe6ff';
    ctx.shadowBlur = 6;
    ctx.beginPath();
    ctx.arc(ex - 1.7, -9 + ey, 1.05, 0, TAU);
    ctx.arc(ex + 1.7, -9 + ey, 1.05, 0, TAU);
    ctx.fill();
    ctx.shadowBlur = 0;

    // weapon
    this.drawWeapon(p, side);

    // hit flash
    if (p.flash > 0) {
      ctx.globalCompositeOperation = 'lighter';
      ctx.fillStyle = `rgba(255,90,90,${p.flash * 1.5})`;
      ctx.beginPath();
      ctx.arc(0, -2, 15, 0, TAU);
      ctx.fill();
    }
    ctx.restore();
  }

  drawWeapon(p, side) {
    const ctx = this.ctx;
    const w = this.game.equipment.weapon?.base || { arch: 'fist' };
    const swing = p.attackAnim > 0 ? Math.sin((1 - p.attackAnim / 0.18) * Math.PI) : 0;
    ctx.save();
    ctx.translate(7 * side, 2);
    ctx.rotate((-0.5 + swing * 1.3) * side);
    ctx.scale(side, 1);
    if (w.arch === 'wand') {
      ctx.strokeStyle = '#6a5636';
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(-1, 12);
      ctx.lineTo(7, -14);
      ctx.stroke();
      ctx.fillStyle = '#7fe6ff';
      ctx.shadowColor = '#7fe6ff';
      ctx.shadowBlur = 9;
      ctx.beginPath();
      ctx.arc(7.6, -15.4, 2.5, 0, TAU);
      ctx.fill();
      ctx.shadowBlur = 0;
    } else if (w.arch === 'sword') {
      ctx.strokeStyle = '#c9c1b0';
      ctx.lineWidth = 2.6;
      ctx.beginPath();
      ctx.moveTo(0, 8);
      ctx.lineTo(8, -16);
      ctx.stroke();
      ctx.strokeStyle = '#7c6a48';
      ctx.lineWidth = 3.4;
      ctx.beginPath();
      ctx.moveTo(2, 4);
      ctx.lineTo(6, 8);
      ctx.stroke();
    } else if (w.arch === 'bow') {
      ctx.strokeStyle = '#8a6b3e';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.arc(1, -2, 11, -1.1, 1.1);
      ctx.stroke();
      ctx.strokeStyle = 'rgba(220,220,220,0.5)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(5.2, -11.5);
      ctx.lineTo(5.2, 7.5);
      ctx.stroke();
    } else if (w.arch === 'scythe') {
      ctx.strokeStyle = '#5d4a33';
      ctx.lineWidth = 2.6;
      ctx.beginPath();
      ctx.moveTo(0, 13);
      ctx.lineTo(4, -18);
      ctx.stroke();
      ctx.strokeStyle = '#c9c1b0';
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(4, -18);
      ctx.quadraticCurveTo(16, -22, 19, -12);
      ctx.quadraticCurveTo(10, -18, 4, -15);
      ctx.stroke();
    }
    ctx.restore();
  }

  /* ── enemies ───────────────────────────────────────────────── */
  drawEnemy(e) {
    const ctx = this.ctx;
    const s = e.boss ? 1 : e.r / 12;

    // shadow
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.beginPath();
    ctx.ellipse(e.x, e.y + e.r * 0.78, e.r * 1.15, e.r * 0.42, 0, 0, TAU);
    ctx.fill();

    if (e.elite) {
      const pulse = 0.35 + Math.sin(this.t * 4 + e.id) * 0.12;
      ctx.strokeStyle = `rgba(255,207,94,${pulse})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(e.x, e.y + e.r * 0.8, e.r * 1.35, e.r * 0.55, 0, 0, TAU);
      ctx.stroke();
    }
    if (e.boss) {
      const pulse = 0.25 + Math.sin(this.t * 2.5) * 0.08;
      ctx.strokeStyle = rgba(e.bossId === 'pale' ? '#9fe8ff' : '#ffb15e', pulse);
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.ellipse(e.x, e.y + e.r * 0.8, e.r * 1.4, e.r * 0.55, 0, 0, TAU);
      ctx.stroke();
    }

    ctx.save();
    ctx.translate(e.x, e.y);
    if (e.boss) {
      this.drawBoss(e);
    } else {
      ctx.scale(s, s);
      switch (e.draw) {
        case 'bat': this.drawBat(e); break;
        case 'skeleton': this.drawSkeleton(e); break;
        case 'ghoul': this.drawGhoul(e); break;
        case 'wraith': this.drawWraith(e); break;
        case 'cultist': this.drawCultist(e); break;
        case 'brute': this.drawBrute(e); break;
        case 'hound': this.drawHound(e); break;
        default: this.drawSkeleton(e);
      }
    }
    if (e.flash > 0) {
      ctx.globalCompositeOperation = 'lighter';
      ctx.fillStyle = `rgba(255,255,255,${Math.min(0.75, e.flash * 5)})`;
      ctx.beginPath();
      ctx.arc(0, 0, e.boss ? 40 : 14, 0, TAU);
      ctx.fill();
    }
    ctx.restore();

    // elite / boss health pip
    if (e.elite && e.hp < e.maxHp) {
      const w = 34;
      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      ctx.fillRect(e.x - w / 2, e.y - e.r - 18, w, 3);
      ctx.fillStyle = '#ffcf5e';
      ctx.fillRect(e.x - w / 2, e.y - e.r - 18, w * (e.hp / e.maxHp), 3);
    }
  }

  drawBat(e) {
    const ctx = this.ctx;
    const flap = Math.sin(e.t * 16) * 0.7;
    ctx.fillStyle = '#4b3d63';
    for (const side of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(side * 3, 0);
      ctx.quadraticCurveTo(side * 16, -10 - flap * 6, side * 21, 2 + flap * 4);
      ctx.quadraticCurveTo(side * 12, -2 + flap * 3, side * 3, 4);
      ctx.closePath();
      ctx.fill();
    }
    ctx.fillStyle = '#7d6b9e';
    ctx.beginPath();
    ctx.ellipse(0, 2, 6, 7.5, 0, 0, TAU);
    ctx.fill();
    ctx.fillStyle = '#5b4a76';
    ctx.beginPath();
    ctx.arc(0, -4.5, 4.2, 0, TAU);
    ctx.fill();
    ctx.fillStyle = '#ff6b6b';
    ctx.beginPath();
    ctx.arc(-1.5, -5, 0.9, 0, TAU);
    ctx.arc(1.5, -5, 0.9, 0, TAU);
    ctx.fill();
  }

  drawSkeleton(e) {
    const ctx = this.ctx;
    const step = Math.sin(e.t * 8) * 2.4;
    ctx.strokeStyle = '#d8cbb2';
    ctx.lineWidth = 2;
    // legs
    ctx.beginPath();
    ctx.moveTo(-2.5, 6);
    ctx.lineTo(-4 + step, 14);
    ctx.moveTo(2.5, 6);
    ctx.lineTo(4 - step, 14);
    ctx.stroke();
    // spine
    ctx.beginPath();
    ctx.moveTo(0, -4);
    ctx.lineTo(0, 7);
    ctx.stroke();
    // ribs
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.moveTo(-4.5, -1 + i * 2.6);
      ctx.quadraticCurveTo(0, 1 + i * 2.6, 4.5, -1 + i * 2.6);
      ctx.stroke();
    }
    // arms
    ctx.beginPath();
    ctx.moveTo(-2, -2);
    ctx.lineTo(-7, 4 + step * 0.4);
    ctx.moveTo(2, -2);
    ctx.lineTo(8, 1 - step * 0.3);
    ctx.stroke();
    // skull
    ctx.fillStyle = '#e2d5bc';
    ctx.beginPath();
    ctx.arc(0, -8, 5.4, 0, TAU);
    ctx.fill();
    ctx.fillStyle = '#17131c';
    ctx.beginPath();
    ctx.arc(-1.8, -8.5, 1.4, 0, TAU);
    ctx.arc(1.8, -8.5, 1.4, 0, TAU);
    ctx.fill();
    ctx.fillRect(-2, -5.4, 4, 1);
    // sword
    ctx.strokeStyle = '#8e8678';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(8, 1);
    ctx.lineTo(14, -7);
    ctx.stroke();
  }

  drawGhoul(e) {
    const ctx = this.ctx;
    const sway = Math.sin(e.t * 4) * 1.4;
    ctx.fillStyle = '#6f8b5c';
    ctx.beginPath();
    ctx.ellipse(0, 2, 9.5, 10.5, 0, 0, TAU);
    ctx.fill();
    ctx.fillStyle = '#7f9c6a';
    ctx.beginPath();
    ctx.ellipse(0, -7, 6, 5.6, 0, 0, TAU);
    ctx.fill();
    // arms
    ctx.strokeStyle = '#6f8b5c';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-7, 0);
    ctx.lineTo(-12, 7 + sway);
    ctx.moveTo(7, 0);
    ctx.lineTo(12, 6 - sway);
    ctx.stroke();
    // mouth / eyes
    ctx.fillStyle = '#ffd9a0';
    ctx.beginPath();
    ctx.arc(-2.2, -8, 1.1, 0, TAU);
    ctx.arc(2.2, -8, 1.1, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = '#2c1f24';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(-2, -3.5);
    ctx.lineTo(2, -3.5);
    ctx.stroke();
  }

  drawWraith(e) {
    const ctx = this.ctx;
    const float = Math.sin(e.t * 3) * 2.5;
    ctx.globalAlpha = 0.82;
    ctx.fillStyle = '#5f9fae';
    ctx.beginPath();
    ctx.moveTo(-7, -10 + float);
    ctx.quadraticCurveTo(-10, 4 + float, -6, 12 + float);
    ctx.lineTo(-3, 8 + float);
    ctx.lineTo(0, 13 + float);
    ctx.lineTo(3, 8 + float);
    ctx.lineTo(6, 12 + float);
    ctx.quadraticCurveTo(10, 4 + float, 7, -10 + float);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#8fd8e8';
    ctx.beginPath();
    ctx.arc(0, -10 + float, 5.5, 0, TAU);
    ctx.fill();
    ctx.fillStyle = '#0b1c22';
    ctx.beginPath();
    ctx.ellipse(0, -10 + float, 3.8, 4.4, 0, 0, TAU);
    ctx.fill();
    ctx.fillStyle = '#c8fbff';
    ctx.shadowColor = '#8fd8e8';
    ctx.shadowBlur = 6;
    ctx.beginPath();
    ctx.arc(-1.5, -10 + float, 1, 0, TAU);
    ctx.arc(1.5, -10 + float, 1, 0, TAU);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;
  }

  drawCultist(e) {
    const ctx = this.ctx;
    ctx.fillStyle = '#6b2f2c';
    ctx.beginPath();
    ctx.moveTo(0, -12);
    ctx.lineTo(9, 14);
    ctx.lineTo(-9, 14);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#3c1b1c';
    ctx.beginPath();
    ctx.arc(0, -10, 6, 0, TAU);
    ctx.fill();
    ctx.fillStyle = '#e8b48a';
    ctx.beginPath();
    ctx.ellipse(0, -9, 3.4, 3.8, 0, 0, TAU);
    ctx.fill();
    ctx.fillStyle = '#ffb15e';
    ctx.beginPath();
    ctx.arc(-1.3, -9.5, 0.9, 0, TAU);
    ctx.arc(1.3, -9.5, 0.9, 0, TAU);
    ctx.fill();
    // staff
    ctx.strokeStyle = '#4a3a2a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(8, 14);
    ctx.lineTo(12, -14);
    ctx.stroke();
    ctx.fillStyle = '#ff8a3d';
    ctx.shadowColor = '#ff8a3d';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(12, -15, 2.2, 0, TAU);
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  drawBrute(e) {
    const ctx = this.ctx;
    const sway = Math.sin(e.t * 3) * 1.5;
    ctx.fillStyle = '#8a6449';
    ctx.beginPath();
    ctx.ellipse(0, 2, 15, 16, 0, 0, TAU);
    ctx.fill();
    ctx.fillStyle = '#a37b5c';
    ctx.beginPath();
    ctx.arc(0, -14, 8, 0, TAU);
    ctx.fill();
    // horns
    ctx.strokeStyle = '#d8cbb2';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-6, -18);
    ctx.quadraticCurveTo(-12, -24, -9, -27);
    ctx.moveTo(6, -18);
    ctx.quadraticCurveTo(12, -24, 9, -27);
    ctx.stroke();
    // eyes
    ctx.fillStyle = '#ff6b4a';
    ctx.beginPath();
    ctx.arc(-2.6, -15, 1.4, 0, TAU);
    ctx.arc(2.6, -15, 1.4, 0, TAU);
    ctx.fill();
    // arms + club
    ctx.strokeStyle = '#8a6449';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(-10, 0);
    ctx.lineTo(-16, 9 + sway);
    ctx.moveTo(10, 0);
    ctx.lineTo(16, 6 - sway);
    ctx.stroke();
    ctx.strokeStyle = '#5d4a33';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(16, 6 - sway);
    ctx.lineTo(22, -8 - sway);
    ctx.stroke();
    ctx.fillStyle = '#6f5a3f';
    ctx.beginPath();
    ctx.arc(22, -9 - sway, 4, 0, TAU);
    ctx.fill();
  }

  drawHound(e) {
    const ctx = this.ctx;
    const step = Math.sin(e.t * 12) * 2;
    ctx.fillStyle = '#6e3f3f';
    ctx.beginPath();
    ctx.ellipse(0, 2, 12, 6.5, 0, 0, TAU);
    ctx.fill();
    ctx.fillStyle = '#9c5f5f';
    ctx.beginPath();
    ctx.ellipse(8, -4, 6, 5, 0, 0, TAU);
    ctx.fill();
    // ears
    ctx.fillStyle = '#6e3f3f';
    ctx.beginPath();
    ctx.moveTo(6, -8);
    ctx.lineTo(5, -13);
    ctx.lineTo(9, -9);
    ctx.closePath();
    ctx.fill();
    // legs
    ctx.strokeStyle = '#6e3f3f';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(-6, 6);
    ctx.lineTo(-7 + step, 12);
    ctx.moveTo(4, 6);
    ctx.lineTo(5 - step, 12);
    ctx.stroke();
    // tail
    ctx.beginPath();
    ctx.moveTo(-11, 0);
    ctx.quadraticCurveTo(-16, -6, -13, -10);
    ctx.stroke();
    // eye
    ctx.fillStyle = '#ff5a4a';
    ctx.shadowColor = '#ff5a4a';
    ctx.shadowBlur = 4;
    ctx.beginPath();
    ctx.arc(10, -5, 1.2, 0, TAU);
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  drawBoss(e) {
    const ctx = this.ctx;
    const pale = e.bossId === 'pale';
    const s = e.r / 44;
    const float = Math.sin(e.t * 2) * 3;
    ctx.scale(s, s);
    ctx.translate(0, float);

    // cloak
    ctx.fillStyle = pale ? '#1d2a3a' : '#2a1b1c';
    ctx.beginPath();
    ctx.moveTo(-26, -18);
    ctx.quadraticCurveTo(-44, 24, -26, 42);
    ctx.lineTo(26, 42);
    ctx.quadraticCurveTo(44, 24, 26, -18);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = pale ? 'rgba(159,232,255,0.3)' : 'rgba(255,177,94,0.25)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // ribcage
    ctx.strokeStyle = e.color;
    ctx.lineWidth = 3;
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      ctx.moveTo(-18, -8 + i * 7);
      ctx.quadraticCurveTo(0, 2 + i * 7, 18, -8 + i * 7);
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.moveTo(0, -16);
    ctx.lineTo(0, 34);
    ctx.stroke();

    // shoulders
    ctx.fillStyle = e.color;
    ctx.beginPath();
    ctx.arc(-24, -12, 8, 0, TAU);
    ctx.arc(24, -12, 8, 0, TAU);
    ctx.fill();

    // arms
    ctx.strokeStyle = e.color;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(-24, -10);
    ctx.lineTo(-38, 18 + Math.sin(e.t * 2) * 3);
    ctx.moveTo(24, -10);
    ctx.lineTo(38, 18 - Math.sin(e.t * 2) * 3);
    ctx.stroke();

    // skull
    ctx.fillStyle = e.color;
    ctx.beginPath();
    ctx.arc(0, -30, 16, 0, TAU);
    ctx.fill();
    ctx.fillStyle = '#141018';
    ctx.beginPath();
    ctx.ellipse(-6, -32, 4.4, 5.4, 0, 0, TAU);
    ctx.ellipse(6, -32, 4.4, 5.4, 0, 0, TAU);
    ctx.fill();
    ctx.fillStyle = pale ? '#9fe8ff' : '#ff8a3d';
    ctx.shadowColor = pale ? '#9fe8ff' : '#ff8a3d';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(-6, -32, 2, 0, TAU);
    ctx.arc(6, -32, 2, 0, TAU);
    ctx.fill();
    ctx.shadowBlur = 0;
    // jaw
    ctx.strokeStyle = e.color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-7, -19);
    ctx.lineTo(-7, -15);
    ctx.moveTo(-3.5, -19);
    ctx.lineTo(-3.5, -15);
    ctx.moveTo(3.5, -19);
    ctx.lineTo(3.5, -15);
    ctx.moveTo(7, -19);
    ctx.lineTo(7, -15);
    ctx.stroke();

    // crown
    ctx.fillStyle = e.crown || '#ffcf5e';
    ctx.beginPath();
    ctx.moveTo(-16, -44);
    ctx.lineTo(-12, -56);
    ctx.lineTo(-6, -48);
    ctx.lineTo(0, -60);
    ctx.lineTo(6, -48);
    ctx.lineTo(12, -56);
    ctx.lineTo(16, -44);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = pale ? '#d9fbff' : '#fff0b8';
    ctx.beginPath();
    ctx.arc(0, -48, 2.4, 0, TAU);
    ctx.fill();

    // antlers for the pale king
    if (pale) {
      ctx.strokeStyle = '#cfe8ef';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-13, -40);
      ctx.quadraticCurveTo(-26, -54, -22, -64);
      ctx.moveTo(-18, -52);
      ctx.lineTo(-26, -50);
      ctx.moveTo(13, -40);
      ctx.quadraticCurveTo(26, -54, 22, -64);
      ctx.moveTo(18, -52);
      ctx.lineTo(26, -50);
      ctx.stroke();
    }
  }

  /* ── projectiles / effects ─────────────────────────────────── */
  drawProjectiles() {
    const ctx = this.ctx;
    for (const pr of this.game.projectiles) {
      if (pr.kind === 'arrow') {
        ctx.save();
        ctx.strokeStyle = pr.color;
        ctx.lineWidth = 2;
        ctx.shadowColor = pr.color;
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.moveTo(pr.x - Math.cos(pr.angle) * 16, pr.y - Math.sin(pr.angle) * 16);
        ctx.lineTo(pr.x, pr.y);
        ctx.stroke();
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#fff8e0';
        ctx.beginPath();
        ctx.arc(pr.x, pr.y, 1.8, 0, TAU);
        ctx.fill();
        ctx.restore();
      } else {
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        for (let i = 0; i < pr.trail.length; i++) {
          const t = pr.trail[i];
          ctx.fillStyle = rgba(pr.color, 0.04 + (i / pr.trail.length) * 0.12);
          ctx.beginPath();
          ctx.arc(t.x, t.y, pr.r * (0.4 + i / pr.trail.length), 0, TAU);
          ctx.fill();
        }
        ctx.fillStyle = rgba(pr.color, 0.25);
        ctx.beginPath();
        ctx.arc(pr.x, pr.y, pr.r * 2.4, 0, TAU);
        ctx.fill();
        ctx.fillStyle = pr.color;
        ctx.beginPath();
        ctx.arc(pr.x, pr.y, pr.r, 0, TAU);
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(pr.x - 1, pr.y - 1, pr.r * 0.45, 0, TAU);
        ctx.fill();
        ctx.restore();
      }
    }
  }

  drawEnemyProjectiles() {
    const ctx = this.ctx;
    for (const pr of this.game.enemyProjectiles) {
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.fillStyle = rgba(pr.color, 0.2);
      ctx.beginPath();
      ctx.arc(pr.x, pr.y, pr.r * 2.1, 0, TAU);
      ctx.fill();
      ctx.fillStyle = pr.color;
      ctx.beginPath();
      ctx.arc(pr.x, pr.y, pr.r, 0, TAU);
      ctx.fill();
      ctx.fillStyle = '#1a0d10';
      ctx.beginPath();
      ctx.arc(pr.x, pr.y, pr.r * 0.42, 0, TAU);
      ctx.fill();
      ctx.restore();
    }
  }

  drawEffects() {
    const ctx = this.ctx;
    for (const ef of this.game.effects) {
      const k = ef.t / ef.duration;
      if (ef.type === 'arc') {
        ctx.save();
        ctx.translate(ef.x, ef.y);
        ctx.rotate(ef.angle);
        const grad = ctx.createRadialGradient(0, 0, 8, 0, 0, ef.radius);
        grad.addColorStop(0, rgba(ef.color, 0.28 * (1 - k)));
        grad.addColorStop(1, rgba(ef.color, 0));
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, ef.radius, -1.15, 1.15);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = rgba(ef.color, 0.55 * (1 - k));
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, ef.radius * (0.6 + k * 0.4), -1.05, 1.05);
        ctx.stroke();
        ctx.restore();
      } else if (ef.type === 'whirl') {
        const p = this.game.player;
        const fade = Math.min(1, ef.t * 4) * Math.min(1, (ef.duration - ef.t) * 3);
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.strokeStyle = `rgba(255,140,140,${0.22 * fade})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(0, 8, ef.radius * 0.85, ef.radius * 0.32, 0, 0, TAU);
        ctx.stroke();
        for (let i = 0; i < 3; i++) {
          const a = this.t * 7 + (i / 3) * TAU;
          ctx.save();
          ctx.rotate(a);
          ctx.translate(ef.radius * 0.78, 0);
          ctx.rotate(0.8);
          ctx.strokeStyle = `rgba(230,225,210,${0.8 * fade})`;
          ctx.lineWidth = 2.2;
          ctx.beginPath();
          ctx.moveTo(0, 10);
          ctx.lineTo(0, -12);
          ctx.quadraticCurveTo(12, -18, 15, -8);
          ctx.stroke();
          ctx.restore();
        }
        ctx.restore();
      } else if (ef.type === 'nova') {
        const r = ef.radius * (0.25 + k * 0.9);
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.strokeStyle = rgba(ef.color, 0.65 * (1 - k));
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(ef.x, ef.y, r, 0, TAU);
        ctx.stroke();
        ctx.fillStyle = rgba(ef.color, 0.1 * (1 - k));
        ctx.beginPath();
        ctx.arc(ef.x, ef.y, r, 0, TAU);
        ctx.fill();
        ctx.restore();
      } else if (ef.type === 'chain') {
        ctx.save();
        ctx.strokeStyle = rgba(ef.color, 0.8 * (1 - k));
        ctx.lineWidth = 2;
        ctx.shadowColor = ef.color;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        const segs = 5;
        for (let i = 0; i <= segs; i++) {
          const tt = i / segs;
          const x = ef.x1 + (ef.x2 - ef.x1) * tt + (i && i < segs ? rand(10, -10) : 0);
          const y = ef.y1 + (ef.y2 - ef.y1) * tt + (i && i < segs ? rand(10, -10) : 0);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.restore();
      }
    }
  }

  drawParticles() {
    const ctx = this.ctx;
    for (const pt of this.game.particles) {
      const a = clamp(pt.life / pt.maxLife, 0, 1);
      ctx.fillStyle = rgba(pt.color, a * 0.9);
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, pt.size * a, 0, TAU);
      ctx.fill();
    }
  }

  drawTexts() {
    const ctx = this.ctx;
    ctx.textAlign = 'center';
    for (const t of this.game.texts) {
      const a = clamp(t.life / t.maxLife, 0, 1);
      ctx.font = `${t.big ? '700' : '600'} ${t.size}px ${t.big ? SERIF : 'system-ui, sans-serif'}`;
      ctx.globalAlpha = a;
      ctx.lineWidth = 3;
      ctx.strokeStyle = 'rgba(5,4,8,0.85)';
      ctx.strokeText(t.text, t.x, t.y);
      ctx.fillStyle = t.color;
      ctx.fillText(t.text, t.x, t.y);
    }
    ctx.globalAlpha = 1;
  }

  /* ── screen space ──────────────────────────────────────────── */
  drawScreen() {
    const ctx = this.ctx;
    const { w, h } = this;

    // vignette
    const grad = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.2, w / 2, h / 2, Math.max(w, h) * 0.72);
    grad.addColorStop(0, 'rgba(0,0,0,0)');
    grad.addColorStop(0.6, 'rgba(4,3,8,0.35)');
    grad.addColorStop(1, 'rgba(3,2,6,0.85)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // dust motes
    ctx.save();
    for (const d of this.dust) {
      const y = ((d.y * h - this.t * d.speed) % (h + 20) + h + 20) % (h + 20);
      const x = d.x * w + Math.sin(this.t * 0.4 + d.drift) * 14;
      ctx.fillStyle = `rgba(220,200,160,${d.alpha})`;
      ctx.beginPath();
      ctx.arc(x, y, d.s, 0, TAU);
      ctx.fill();
    }
    ctx.restore();

    // low hp warning
    const p = this.game.player;
    if (this.game.state !== 'menu' && p && p.maxHp > 0 && p.hp / p.maxHp < 0.3) {
      const pulse = 0.5 + Math.sin(this.t * 6) * 0.5;
      const hpGrad = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.25, w / 2, h / 2, Math.max(w, h) * 0.7);
      hpGrad.addColorStop(0, 'rgba(120,0,10,0)');
      hpGrad.addColorStop(1, `rgba(130,4,14,${0.22 + pulse * 0.2})`);
      ctx.fillStyle = hpGrad;
      ctx.fillRect(0, 0, w, h);
    }

    // menu ambience
    if (this.game.state === 'menu') {
      ctx.fillStyle = 'rgba(5,4,9,0.45)';
      ctx.fillRect(0, 0, w, h);
    }
  }
}
