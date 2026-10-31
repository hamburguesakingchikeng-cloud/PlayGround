// Canvas renderer: painted graveyard, loot beams, sprites, fog, lighting, particles.
import { WORLD } from './game.js';
import { rarityInfo, SLOT_META } from './loot.js';
import { buildSprites, buildWorldGround, makeGlow, makeFog, makeItemIcon } from './sprites.js';
import { mulberry32, rand } from './rng.js';

function makeCanvas(w, h) {
  const c = document.createElement('canvas');
  c.width = Math.max(1, Math.ceil(w));
  c.height = Math.max(1, Math.ceil(h));
  return c;
}

function hexToRgb(hex) {
  const clean = hex.replace('#', '');
  const value = clean.length === 3 ? clean.split('').map((c) => c + c).join('') : clean;
  const num = parseInt(value, 16);
  return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
}

const TILE = 512;

export class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.sprites = buildSprites();
    this.worldScale = 0.5;
    this.worldGround = buildWorldGround(WORLD.w, WORLD.h, this.worldScale);
    this.fog = makeFog(512);
    this.glows = new Map();
    this.icons = new Map();
    this.visible = [];
    this.time = 0;
    this.dpr = 1;
    this.w = window.innerWidth;
    this.h = window.innerHeight;
    this.decalCanvas = makeCanvas(WORLD.w / 2, WORLD.h / 2);
    this.decalCtx = this.decalCanvas.getContext('2d');
    this.decalCtx.scale(0.5, 0.5);
    this.darkness = null;
    const fogRng = mulberry32(88);
    this.fogSeeds = Array.from({ length: 9 }, () => ({
      x: rand(fogRng, 0, 1), y: rand(fogRng, 0, 1),
      size: rand(fogRng, 340, 780), speed: rand(fogRng, 4, 16),
      drift: rand(fogRng, -8, 8), phase: rand(fogRng, 0, 6),
    }));
    this.resize(window.innerWidth, window.innerHeight);
  }

  resize(w, h) {
    this.w = w;
    this.h = h;
    this.dpr = Math.min(2, window.devicePixelRatio || 1);
    if (w < 720) this.dpr = Math.min(1.75, this.dpr);
    this.canvas.width = Math.floor(w * this.dpr);
    this.canvas.height = Math.floor(h * this.dpr);
    this.canvas.style.width = `${w}px`;
    this.canvas.style.height = `${h}px`;
    this.buildDarkness();
  }

  buildDarkness() {
    const { w, h } = this;
    const c = makeCanvas(w, h);
    const ctx = c.getContext('2d');
    ctx.fillStyle = 'rgba(2,2,7,0.42)';
    ctx.fillRect(0, 0, w, h);
    ctx.globalCompositeOperation = 'destination-out';
    const radius = Math.max(w, h) * 0.84;
    const g = ctx.createRadialGradient(w / 2, h * 0.47, Math.min(w, h) * 0.2, w / 2, h * 0.47, radius);
    g.addColorStop(0, 'rgba(0,0,0,1)');
    g.addColorStop(0.58, 'rgba(0,0,0,0.85)');
    g.addColorStop(0.82, 'rgba(0,0,0,0.3)');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    ctx.globalCompositeOperation = 'source-over';
    // faint cold moonlight pooled at the top
    const moon = ctx.createRadialGradient(w * 0.22, -h * 0.1, 0, w * 0.22, -h * 0.1, h * 0.9);
    moon.addColorStop(0, 'rgba(86,120,150,0.1)');
    moon.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = moon;
    ctx.fillRect(0, 0, w, h);
    this.darkness = c;
  }

  clearDecals() {
    this.decalCtx.clearRect(0, 0, WORLD.w, WORLD.h);
  }

  addDecal(x, y, size, color) {
    const ctx = this.decalCtx;
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(0, 0, size * 0.55, size * 0.3, Math.random() * 3, 0, Math.PI * 2);
    ctx.fill();
    for (let i = 0; i < 7; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = size * (0.3 + Math.random() * 0.8);
      const r = size * (0.04 + Math.random() * 0.13);
      ctx.beginPath();
      ctx.ellipse(Math.cos(angle) * dist, Math.sin(angle) * dist * 0.6, r, r * 0.7, angle, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  glowFor(color) {
    let key = color;
    if (color.startsWith('#')) {
      const { r, g, b } = hexToRgb(color);
      key = `${r},${g},${b}`;
    }
    let glow = this.glows.get(key);
    if (!glow) {
      glow = makeGlow(128, key);
      this.glows.set(key, glow);
    }
    return glow;
  }

  iconFor(item) {
    const color = rarityInfo(item.rarity).color;
    const key = `${item.slot}:${item.rarity}`;
    let icon = this.icons.get(key);
    if (!icon) {
      icon = makeItemIcon(item.slot, color);
      this.icons.set(key, icon);
    }
    return icon;
  }

  render(game) {
    this.time = game.animTime;
    const ctx = this.ctx;
    const { w, h, dpr } = this;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#06050b';
    ctx.fillRect(0, 0, w, h);

    const cam = game.camera;
    ctx.save();
    ctx.translate(Math.round(w / 2 - cam.x + cam.shakeX), Math.round(h / 2 - cam.y + cam.shakeY));
    this.drawGround(game);
    this.drawDecals();
    this.drawProps(game, cam);
    this.drawLootBeams(game, cam);
    this.drawGems(game, cam);
    this.drawAura(game);
    this.drawEnemies(game, cam);
    this.drawPlayer(game);
    this.drawProjectiles(game, cam);
    this.drawEffects(game, cam);
    this.drawParticles(game);
    this.drawLootIcons(game, cam);
    this.drawTexts(game);
    ctx.restore();

    this.drawFog();
    if (this.darkness) ctx.drawImage(this.darkness, 0, 0, w, h);
    this.drawBossArrow(game);
    this.drawScreenVignette();
  }

  /* ---------------------------------------------------------- ground */

  drawGround(game) {
    const ctx = this.ctx;
    const cam = game.camera;
    const left = Math.max(0, cam.x - this.w / 2 - 40);
    const right = Math.min(WORLD.w, cam.x + this.w / 2 + 40);
    const top = Math.max(0, cam.y - this.h / 2 - 40);
    const bottom = Math.min(WORLD.h, cam.y + this.h / 2 + 40);
    const scale = this.worldScale;
    if (right > left && bottom > top) {
      ctx.drawImage(
        this.worldGround,
        left * scale, top * scale, (right - left) * scale, (bottom - top) * scale,
        left, top, right - left, bottom - top,
      );
    }

    // ritual circle at the heart of the graveyard
    ctx.save();
    ctx.translate(WORLD.w / 2, WORLD.h / 2);
    ctx.strokeStyle = 'rgba(201,169,98,0.12)';
    ctx.lineWidth = 2;
    for (const radius of [120, 168, 176]) {
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.lineWidth = 1;
    for (let i = 0; i < 24; i++) {
      const angle = (i / 24) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(Math.cos(angle) * 155, Math.sin(angle) * 155);
      ctx.lineTo(Math.cos(angle) * 170, Math.sin(angle) * 170);
      ctx.stroke();
      if (i % 4 === 0) {
        ctx.beginPath();
        ctx.arc(Math.cos(angle) * 144, Math.sin(angle) * 144, 4, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
    ctx.strokeStyle = 'rgba(102,217,200,0.09)';
    ctx.beginPath();
    ctx.arc(0, 0, 108, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    // world edge — old stone wall
    ctx.save();
    ctx.strokeStyle = 'rgba(9,7,13,0.95)';
    ctx.lineWidth = 46;
    ctx.strokeRect(0, 0, WORLD.w, WORLD.h);
    ctx.strokeStyle = 'rgba(90,80,95,0.18)';
    ctx.lineWidth = 2;
    ctx.strokeRect(24, 24, WORLD.w - 48, WORLD.h - 48);
    ctx.strokeStyle = 'rgba(201,169,98,0.08)';
    ctx.lineWidth = 1;
    ctx.strokeRect(16, 16, WORLD.w - 32, WORLD.h - 32);
    ctx.restore();

    // mist hugging the boundary
    const edge = ctx.createLinearGradient(0, 0, 0, WORLD.h);
    edge.addColorStop(0, 'rgba(20,16,30,0.4)');
    edge.addColorStop(0.15, 'rgba(20,16,30,0)');
    edge.addColorStop(0.85, 'rgba(20,16,30,0)');
    edge.addColorStop(1, 'rgba(20,16,30,0.4)');
    ctx.fillStyle = edge;
    ctx.fillRect(26, 26, WORLD.w - 52, WORLD.h - 52);
  }

  drawDecals() {
    this.ctx.drawImage(this.decalCanvas, 0, 0, WORLD.w, WORLD.h);
  }

  drawProps(game, cam) {
    const ctx = this.ctx;
    const halfW = this.w / 2 + 140;
    const halfH = this.h / 2 + 160;
    for (const prop of game.props) {
      if (Math.abs(prop.x - cam.x) > halfW || Math.abs(prop.y - cam.y) > halfH) continue;
      const img = this.propImage(prop);
      if (!img) continue;
      const w = (img.width / 2) * prop.scale;
      const h = (img.height / 2) * prop.scale;
      ctx.save();
      ctx.translate(prop.x, prop.y + 3);
      // soft contact shadow
      ctx.fillStyle = 'rgba(0,0,0,0.32)';
      ctx.beginPath();
      ctx.ellipse(0, 0, w * 0.28, h * 0.09, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.rotate(prop.rot);
      if (prop.flip) ctx.scale(-1, 1);
      ctx.drawImage(img, -w / 2, -h + 8, w, h);
      ctx.restore();
      if (prop.glow) {
        const glow = this.glowFor(prop.kind === 'candles' ? '255,180,80' : '90,255,200');
        const pulse = 0.7 + Math.sin(this.time * 3 + prop.x * 0.01) * 0.15;
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.globalAlpha = prop.kind === 'candles' ? 0.3 : 0.14;
        ctx.drawImage(glow, prop.x - 70 * pulse, prop.y - 90 * pulse, 140 * pulse, 140 * pulse);
        ctx.restore();
      }
    }
  }

  propImage(prop) {
    const p = this.sprites.props;
    switch (prop.kind) {
      case 'tombstone': return p.tombstone[prop.variant % p.tombstone.length];
      case 'cross': return p.cross[prop.variant % p.cross.length];
      case 'tree': return p.tree[prop.variant % p.tree.length];
      case 'candles': return p.candles[prop.variant % p.candles.length];
      case 'pillar': return p.pillar;
      case 'bones': return p.bones[prop.variant % p.bones.length];
      case 'mushrooms': return p.mushrooms[prop.variant % p.mushrooms.length];
      case 'statue': return p.statue;
      case 'fence': return p.fence;
      default: return p.tombstone[0];
    }
  }

  /* ---------------------------------------------------------- loot & gems */

  drawLootBeams(game, cam) {
    const ctx = this.ctx;
    const drops = game.state === 'title' ? game.titleLoot : game.loot;
    const halfW = this.w / 2 + 200;
    const halfH = this.h / 2 + 300;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (const drop of drops) {
      if (Math.abs(drop.x - cam.x) > halfW || Math.abs(drop.y - cam.y) > halfH) continue;
      const info = rarityInfo(drop.item.rarity);
      const { r, g, b } = hexToRgb(info.color);
      const rank = info.order;
      const pulse = 0.8 + Math.sin(this.time * 3.2 + drop.bob) * 0.2;
      const height = (rank >= 3 ? 260 : rank === 2 ? 195 : 150) * pulse;
      const width = rank >= 3 ? 22 : rank === 2 ? 15 : 11;
      const baseY = drop.y + 8;
      const grad = ctx.createLinearGradient(0, baseY - height, 0, baseY);
      grad.addColorStop(0, `rgba(${r},${g},${b},0)`);
      grad.addColorStop(0.55, `rgba(${r},${g},${b},0.08)`);
      grad.addColorStop(0.92, `rgba(${r},${g},${b},0.4)`);
      grad.addColorStop(1, `rgba(${r},${g},${b},0.05)`);
      ctx.fillStyle = grad;
      ctx.fillRect(drop.x - width / 2, baseY - height, width, height);
      ctx.fillStyle = `rgba(${r},${g},${b},0.22)`;
      ctx.fillRect(drop.x - 1, baseY - height * 0.94, 2, height * 0.9);

      const glow = this.glowFor(`${r},${g},${b}`);
      ctx.globalAlpha = rank >= 3 ? 0.6 : 0.4;
      const glowSize = (rank >= 3 ? 150 : 100) * pulse;
      ctx.drawImage(glow, drop.x - glowSize / 2, baseY - glowSize * 0.78, glowSize, glowSize);
      ctx.globalAlpha = 1;
      // base ring
      ctx.strokeStyle = `rgba(${r},${g},${b},0.28)`;
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.ellipse(drop.x, baseY, width * 1.7, width * 0.5, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }

  drawLootIcons(game, cam) {
    const ctx = this.ctx;
    const drops = game.state === 'title' ? game.titleLoot : game.loot;
    const halfW = this.w / 2 + 120;
    const halfH = this.h / 2 + 120;
    const visible = drops.filter(
      (d) => Math.abs(d.x - cam.x) <= halfW && Math.abs(d.y - cam.y) <= halfH,
    );

    // Draw icons first; labels are laid out afterwards so they can dodge each other.
    for (const drop of visible) {
      const info = rarityInfo(drop.item.rarity);
      const icon = this.iconFor(drop.item);
      const bob = Math.sin(this.time * 2.1 + drop.bob) * 4;
      const y = drop.y - 16 + bob;
      ctx.save();
      ctx.globalAlpha = 0.35;
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.ellipse(drop.x, drop.y + 8, 14, 5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.drawImage(icon, drop.x - 18, y - 18, 36, 36);
      // sparkle orbit
      const angle = this.time * 1.6 + drop.bob;
      ctx.fillStyle = info.color;
      ctx.globalAlpha = 0.75;
      ctx.beginPath();
      ctx.arc(drop.x + Math.cos(angle) * 23, y + Math.sin(angle) * 10, 1.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Only two labels at once, prioritising high rarity and proximity.
    const rarityRank = { mythic: 5, legendary: 4, rare: 3, magic: 2, common: 1 };
    const candidates = visible
      .filter((drop) => !drop.preview)
      .map((drop) => ({
        drop,
        dist: Math.hypot(drop.x - game.player.x, drop.y - game.player.y),
      }))
      .filter((entry) => entry.dist < 300)
      .sort((a, b) => {
        const r = (rarityRank[b.drop.item.rarity] || 0) - (rarityRank[a.drop.item.rarity] || 0);
        return r !== 0 ? r : a.dist - b.dist;
      });
    const labelled = [];
    for (const entry of candidates) {
      if (labelled.length >= 2) break;
      if (!labelled.includes(entry)) labelled.push(entry);
    }
    // Always include the nearest drop so the player knows what they are walking into.
    const nearest = candidates.slice().sort((a, b) => a.dist - b.dist)[0];
    if (nearest && labelled.length < 2 && !labelled.includes(nearest)) labelled.push(nearest);
    if (nearest && labelled.length >= 2 && labelled[0] !== nearest && labelled[1] !== nearest) {
      labelled[1] = nearest;
    }

    const placed = [];
    for (const { drop, dist } of labelled) {
      const info = rarityInfo(drop.item.rarity);
      let name = drop.item.name;
      const prefix = `${info.label.toUpperCase()}`;
      const suffix = `${drop.item.score}`;
      ctx.font = '700 8px "Segoe UI", system-ui, sans-serif';
      const prefixW = ctx.measureText(prefix).width;
      ctx.font = '600 10px "Segoe UI", system-ui, sans-serif';
      let nameW = ctx.measureText(name).width;
      ctx.font = '700 9px "Segoe UI", system-ui, sans-serif';
      const suffixW = ctx.measureText(suffix).width;
      let width = prefixW + nameW + suffixW + 38;
      // Long relic names must not spill off narrow screens.
      if (width > this.w - 40) {
        let short = name;
        while (short.length > 6 && width > this.w - 40) {
          short = short.slice(0, -2);
          ctx.font = '600 10px "Segoe UI", system-ui, sans-serif';
          nameW = ctx.measureText(`${short}…`).width;
          width = prefixW + nameW + suffixW + 38;
        }
        name = `${short}…`;
      }
      const bob = Math.sin(this.time * 2.1 + drop.bob) * 4;
      let y = drop.y - 50 + bob;
      // Keep the pill away from the hero's head so the character stays readable.
      const nearHero = Math.abs(drop.x - game.player.x) < width / 2 + 46;
      if (nearHero && dist < 190) y = Math.min(y, game.player.y - 108);
      // Clamp into the viewport.
      const viewLeft = cam.x - this.w / 2 + 12;
      const viewRight = cam.x + this.w / 2 - 12;
      const cx = Math.min(Math.max(drop.x, viewLeft + width / 2), viewRight - width / 2);
      for (let guard = 0; guard < 8; guard++) {
        const hit = placed.find(
          (r) => Math.abs(r.x - cx) < (r.w + width) / 2 + 6 && Math.abs(r.y - y) < 22,
        );
        if (!hit) break;
        y = hit.y - 22;
      }
      placed.push({ x: cx, y, w: width });

      ctx.save();
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      const left = cx - width / 2;
      ctx.fillStyle = 'rgba(6,4,10,0.86)';
      ctx.beginPath();
      ctx.roundRect(left, y - 10, width, 20, 4);
      ctx.fill();
      ctx.strokeStyle = `${info.color}66`;
      ctx.lineWidth = 1;
      ctx.stroke();
      // rarity accent notch
      ctx.fillStyle = info.color;
      ctx.beginPath();
      ctx.roundRect(left + 1, y - 10, 2.5, 20, 2);
      ctx.fill();

      let tx = left + 9;
      ctx.font = '700 8px "Segoe UI", system-ui, sans-serif';
      ctx.fillStyle = info.color;
      ctx.fillText(prefix, tx, y + 0.5);
      tx += prefixW + 7;
      ctx.font = '600 10px "Segoe UI", system-ui, sans-serif';
      ctx.fillStyle = '#f0e7d4';
      ctx.fillText(name, tx, y);
      tx += nameW + 8;
      ctx.font = '700 9px "Segoe UI", system-ui, sans-serif';
      ctx.fillStyle = 'rgba(233,225,207,0.5)';
      ctx.fillText(suffix, tx, y + 0.5);

      // tether from the pill back to the item so the pairing stays clear
      ctx.strokeStyle = `${info.color}44`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cx, y + 10);
      ctx.lineTo(drop.x, drop.y - 26 + bob);
      ctx.stroke();
      ctx.restore();
    }
  }

  drawGems(game, cam) {
    const ctx = this.ctx;
    const halfW = this.w / 2 + 80;
    const halfH = this.h / 2 + 80;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const glow = this.glowFor('80,220,200');
    for (const gem of game.gems) {
      if (Math.abs(gem.x - cam.x) > halfW || Math.abs(gem.y - cam.y) > halfH) continue;
      const size = gem.value >= 12 ? 12 : gem.value >= 4 ? 9 : 7;
      const bob = Math.sin(this.time * 4 + gem.bob) * 2;
      ctx.globalAlpha = 0.45;
      ctx.drawImage(glow, gem.x - 18, gem.y - 18 + bob, 36, 36);
      ctx.globalAlpha = 1;
      ctx.save();
      ctx.translate(gem.x, gem.y + bob);
      ctx.rotate(this.time * 1.4 + gem.bob);
      ctx.fillStyle = '#9dfff0';
      ctx.beginPath();
      ctx.moveTo(0, -size);
      ctx.lineTo(size * 0.62, 0);
      ctx.lineTo(0, size);
      ctx.lineTo(-size * 0.62, 0);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.8)';
      ctx.beginPath();
      ctx.moveTo(0, -size);
      ctx.lineTo(size * 0.3, -size * 0.2);
      ctx.lineTo(0, size * 0.2);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
    ctx.restore();
  }

  drawAura(game) {
    if (!game.upgrades.aura) return;
    const ctx = this.ctx;
    const p = game.player;
    const rank = game.upgrades.aura;
    const radius = (82 + rank * 13) * game.stats.area;
    ctx.save();
    ctx.translate(p.x, p.y + 10);
    const g = ctx.createRadialGradient(0, 0, radius * 0.15, 0, 0, radius);
    g.addColorStop(0, 'rgba(150,20,40,0.16)');
    g.addColorStop(0.7, 'rgba(120,16,36,0.09)');
    g.addColorStop(1, 'rgba(90,10,30,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(0, 0, radius, radius * 0.62, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(194,43,61,0.3)';
    ctx.lineWidth = 1.4;
    ctx.setLineDash([6, 12]);
    ctx.lineDashOffset = -this.time * 18;
    ctx.beginPath();
    ctx.ellipse(0, 0, radius * 0.92, radius * 0.57, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
    for (let i = 0; i < 3; i++) {
      const angle = this.time * 0.7 + (i / 3) * Math.PI * 2;
      const x = Math.cos(angle) * radius * 0.75;
      const y = Math.sin(angle) * radius * 0.45;
      ctx.fillStyle = 'rgba(255,80,100,0.28)';
      ctx.beginPath();
      ctx.arc(x, y, 2.4, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  /* ---------------------------------------------------------- enemies & player */

  drawEnemies(game, cam) {
    const ctx = this.ctx;
    const halfW = this.w / 2 + 130;
    const halfH = this.h / 2 + 140;
    for (const e of game.enemies) {
      if (e.dead) continue;
      if (Math.abs(e.x - cam.x) > halfW || Math.abs(e.y - cam.y) > halfH) continue;
      const size = e.size;
      const bob = e.type === 'bat' ? Math.sin(this.time * 9 + e.wobble) * 4 : e.type === 'wraith' ? Math.sin(this.time * 2.6 + e.wobble) * 3 : Math.sin(e.age * 8 + e.wobble) * 1.1;
      const feetY = e.y + 4;

      // shadow
      ctx.save();
      ctx.fillStyle = e.boss ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.36)';
      ctx.beginPath();
      ctx.ellipse(e.x, feetY, size * (e.boss ? 0.26 : 0.19), size * (e.boss ? 0.08 : 0.055), 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      if (e.boss) {
        const aura = ctx.createRadialGradient(e.x, feetY - 30, 10, e.x, feetY - 30, 120);
        aura.addColorStop(0, 'rgba(190,20,50,0.3)');
        aura.addColorStop(1, 'rgba(120,8,30,0)');
        ctx.fillStyle = aura;
        ctx.beginPath();
        ctx.ellipse(e.x, feetY, 100, 44, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = `rgba(255,55,85,${0.3 + Math.sin(this.time * 2) * 0.12})`;
        ctx.lineWidth = 2;
        ctx.setLineDash([16, 9]);
        ctx.lineDashOffset = -this.time * 26;
        ctx.beginPath();
        ctx.ellipse(e.x, feetY, 82, 34, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
      } else if (e.elite) {
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        const glow = this.glowFor('255,120,50');
        ctx.globalAlpha = 0.3 + Math.sin(this.time * 3 + e.seed) * 0.08;
        ctx.drawImage(glow, e.x - 70, feetY - 105, 140, 140);
        ctx.restore();
        ctx.strokeStyle = 'rgba(255,130,60,0.32)';
        ctx.lineWidth = 1.4;
        ctx.setLineDash([5, 7]);
        ctx.beginPath();
        ctx.ellipse(e.x, feetY, 29, 12, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
      } else if (e.fiend) {
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        const glow = this.glowFor('255,215,100');
        ctx.globalAlpha = 0.34 + Math.sin(this.time * 5 + e.seed) * 0.1;
        ctx.drawImage(glow, e.x - 55, feetY - 80, 110, 110);
        ctx.restore();
      }

      const sprite = this.enemySprite(e);
      const drawY = e.y - size * 0.84 + bob;
      ctx.save();
      ctx.translate(e.x, drawY);
      if (e.type !== 'bat' && e.type !== 'wraith' && e.facing === -1) ctx.scale(-1, 1);
      ctx.drawImage(sprite, -size / 2, 0, size, size);
      if (e.hitFlash > 0) {
        ctx.globalCompositeOperation = 'lighter';
        ctx.globalAlpha = Math.min(0.65, e.hitFlash * 5);
        ctx.drawImage(sprite, -size / 2, 0, size, size);
      }
      ctx.restore();

      if (e.elite) {
        const barW = 46;
        const barY = drawY - 8;
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fillRect(e.x - barW / 2 - 1, barY - 1, barW + 2, 5);
        ctx.fillStyle = '#d24b3a';
        ctx.fillRect(e.x - barW / 2, barY, barW * Math.max(0, e.hp / e.maxHp), 3);
        ctx.strokeStyle = 'rgba(255,180,120,0.35)';
        ctx.lineWidth = 0.6;
        ctx.strokeRect(e.x - barW / 2 - 1, barY - 1, barW + 2, 5);
        const dist = Math.hypot(e.x - game.player.x, e.y - game.player.y);
        if (dist < 520) {
          ctx.font = '600 8px "Segoe UI", system-ui, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillStyle = 'rgba(255,190,140,0.85)';
          ctx.fillText(e.name.toUpperCase(), e.x, barY - 6);
        }
      } else if (e.fiend) {
        const dist = Math.hypot(e.x - game.player.x, e.y - game.player.y);
        if (dist < 480) {
          ctx.font = '700 8px "Segoe UI", system-ui, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillStyle = 'rgba(255,215,100,0.9)';
          ctx.fillText('TREASURE FIEND', e.x, drawY - 6);
        }
      }
    }
  }

  enemySprite(e) {
    if (e.boss) return this.sprites.boss;
    if (e.fiend) return this.sprites.fiend;
    if (e.type === 'bat') return Math.floor(this.time * 10 + e.seed) % 2 ? this.sprites.batUp : this.sprites.batDown;
    return this.sprites[e.sprite] || this.sprites.ghoul;
  }

  drawPlayer(game) {
    const ctx = this.ctx;
    const p = game.player;
    if (p.dead) return;
    const bob = Math.sin(p.walk * 0.13) * 1.8;
    const size = 90;
    const drawY = p.y - size * 0.84 + bob;

    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.42)';
    ctx.beginPath();
    ctx.ellipse(p.x, p.y + 4, 23, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Teal ward ring keeps the hero readable in a crowd.
    ctx.save();
    ctx.strokeStyle = 'rgba(102,217,200,0.3)';
    ctx.lineWidth = 1.2;
    ctx.setLineDash([5, 7]);
    ctx.lineDashOffset = -this.time * 10;
    ctx.beginPath();
    ctx.ellipse(p.x, p.y + 4, 29, 10, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const glow = this.glowFor('102,217,200');
    ctx.globalAlpha = 0.3 + Math.sin(this.time * 2) * 0.05;
    ctx.drawImage(glow, p.x - 78, p.y - 112, 156, 156);
    ctx.restore();

    ctx.save();
    ctx.translate(p.x, drawY);
    if (p.facing === -1) ctx.scale(-1, 1);
    if (p.invuln > 0) ctx.globalAlpha = 0.55 + Math.sin(this.time * 30) * 0.2;
    const frame = Math.floor(p.walk / 26) % 2 ? this.sprites.playerAlt : this.sprites.player;
    ctx.drawImage(frame, -size / 2, 0, size, size);
    if (p.hitFlash > 0) {
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = Math.min(0.7, p.hitFlash * 3);
      ctx.drawImage(frame, -size / 2, 0, size, size);
    }
    ctx.restore();

    // orbiting bone blades
    if (game.upgrades.blades) {
      const rank = game.upgrades.blades;
      const count = rank + 1 + (game.powers.has('orbit') ? 2 : 0);
      const orbit = 64 + rank * 5;
      for (let i = 0; i < count; i++) {
        const angle = game.bladeAngle + (i / count) * Math.PI * 2;
        const bx = p.x + Math.cos(angle) * orbit;
        const by = p.y + 2 + Math.sin(angle) * orbit * 0.72;
        ctx.save();
        ctx.translate(bx, by);
        ctx.rotate(angle + Math.PI / 2 + this.time * 4);
        ctx.globalCompositeOperation = 'lighter';
        ctx.globalAlpha = 0.35;
        ctx.drawImage(this.glowFor('200,245,235'), -22, -22, 44, 44);
        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = 'source-over';
        ctx.fillStyle = '#e6dfca';
        ctx.beginPath();
        ctx.moveTo(-2, -14);
        ctx.quadraticCurveTo(12, -12, 11, 2);
        ctx.quadraticCurveTo(5, -4, -2, -2);
        ctx.lineTo(-4, 13);
        ctx.quadraticCurveTo(-8, 0, -2, -14);
        ctx.fill();
        ctx.strokeStyle = 'rgba(102,217,200,0.7)';
        ctx.lineWidth = 0.8;
        ctx.stroke();
        ctx.restore();
      }
    }
  }

  /* ---------------------------------------------------------- projectiles & FX */

  drawProjectiles(game, cam) {
    const ctx = this.ctx;
    const halfW = this.w / 2 + 90;
    const halfH = this.h / 2 + 90;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const glowTeal = this.glowFor('110,240,220');
    const glowRed = this.glowFor('255,55,85');
    for (const bolt of game.projectiles) {
      if (Math.abs(bolt.x - cam.x) > halfW || Math.abs(bolt.y - cam.y) > halfH) continue;
      const angle = Math.atan2(bolt.vy, bolt.vx);
      ctx.save();
      ctx.translate(bolt.x, bolt.y);
      ctx.rotate(angle);
      const tail = ctx.createLinearGradient(-46, 0, 0, 0);
      tail.addColorStop(0, 'rgba(80,220,200,0)');
      tail.addColorStop(1, 'rgba(160,255,240,0.45)');
      ctx.fillStyle = tail;
      ctx.beginPath();
      ctx.moveTo(-50, -4);
      ctx.lineTo(0, -1.4);
      ctx.lineTo(0, 1.4);
      ctx.lineTo(-50, 4);
      ctx.fill();
      ctx.globalAlpha = 0.8;
      ctx.drawImage(glowTeal, -24, -24, 48, 48);
      ctx.globalAlpha = 1;
      ctx.fillStyle = '#eafffb';
      ctx.beginPath();
      ctx.ellipse(0, 0, 6, 3.2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    for (const orb of game.enemyProjectiles) {
      if (Math.abs(orb.x - cam.x) > halfW || Math.abs(orb.y - cam.y) > halfH) continue;
      const pulse = 1 + Math.sin(this.time * 8 + orb.x * 0.03) * 0.15;
      ctx.globalAlpha = 0.75;
      ctx.drawImage(glowRed, orb.x - 24 * pulse, orb.y - 24 * pulse, 48 * pulse, 48 * pulse);
      ctx.globalAlpha = 1;
      ctx.fillStyle = '#ffd7dc';
      ctx.beginPath();
      ctx.arc(orb.x, orb.y, 3.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(120,0,20,0.8)';
      ctx.beginPath();
      ctx.arc(orb.x, orb.y, 1.6, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  drawEffects(game, cam) {
    const ctx = this.ctx;
    for (const effect of game.effects) {
      const progress = 1 - effect.life / effect.maxLife;
      const alpha = Math.max(0, effect.life / effect.maxLife);
      const cull = 260;
      if (effect.type === 'slash') {
        if (Math.abs(effect.x - cam.x) > this.w / 2 + cull || Math.abs(effect.y - cam.y) > this.h / 2 + cull) continue;
        const radius = effect.radius * (0.72 + progress * 0.4);
        ctx.save();
        ctx.translate(effect.x, effect.y + 4);
        ctx.globalCompositeOperation = 'lighter';
        ctx.globalAlpha = alpha * 0.9;
        ctx.strokeStyle = 'rgba(170,255,240,0.85)';
        ctx.lineWidth = 7 * (1 - progress * 0.6);
        ctx.beginPath();
        ctx.ellipse(0, 0, radius, radius * 0.64, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = alpha * 0.4;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(0, 0, radius * 0.92, radius * 0.6, 0, 0.2, Math.PI * 1.25);
        ctx.stroke();
        ctx.restore();
      } else if (effect.type === 'ring') {
        if (Math.abs(effect.x - cam.x) > this.w / 2 + cull || Math.abs(effect.y - cam.y) > this.h / 2 + cull) continue;
        const radius = effect.radius * (0.25 + progress * 0.85);
        ctx.save();
        ctx.translate(effect.x, effect.y);
        ctx.globalCompositeOperation = 'lighter';
        ctx.globalAlpha = alpha;
        ctx.strokeStyle = effect.color;
        ctx.lineWidth = 4 + (1 - progress) * 7;
        ctx.beginPath();
        ctx.ellipse(0, 0, radius, radius * 0.66, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = alpha * 0.18;
        ctx.fillStyle = effect.color;
        ctx.beginPath();
        ctx.ellipse(0, 0, radius, radius * 0.66, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      } else if (effect.type === 'lightning') {
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        const points = effect.points;
        for (const pass of [0, 1]) {
          ctx.globalAlpha = pass === 0 ? alpha * 0.55 : alpha;
          ctx.strokeStyle = pass === 0 ? 'rgba(102,240,220,0.6)' : '#f4fffd';
          ctx.lineWidth = pass === 0 ? 9 : 2;
          ctx.beginPath();
          ctx.moveTo(points[0][0], points[0][1]);
          for (let i = 1; i < points.length; i++) ctx.lineTo(points[i][0], points[i][1]);
          ctx.stroke();
        }
        ctx.restore();
      } else if (effect.type === 'chain') {
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.globalAlpha = alpha;
        ctx.strokeStyle = 'rgba(150,255,240,0.9)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(effect.x1, effect.y1);
        const midX = (effect.x1 + effect.x2) / 2 + rand(mulberry32(1), -8, 8);
        const midY = (effect.y1 + effect.y2) / 2 + 6;
        ctx.quadraticCurveTo(midX, midY, effect.x2, effect.y2);
        ctx.stroke();
        ctx.restore();
      }
    }
  }

  drawParticles(game) {
    const ctx = this.ctx;
    ctx.save();
    for (const p of game.particles) {
      const alpha = clamp01(p.life / Math.max(0.001, p.maxLife));
      if (p.glow) {
        ctx.globalCompositeOperation = 'lighter';
        const glow = this.glowFor(p.color);
        const size = p.size * 7;
        ctx.globalAlpha = alpha * 0.8;
        ctx.drawImage(glow, p.x - size / 2, p.y - size / 2, size, size);
      } else {
        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
  }

  drawTexts(game) {
    const ctx = this.ctx;
    ctx.save();
    ctx.textAlign = 'center';
    for (const t of game.texts) {
      const alpha = Math.min(1, (t.life / t.maxLife) * 2.4);
      ctx.globalAlpha = alpha;
      ctx.font = `700 ${t.size}px Georgia, "Times New Roman", serif`;
      ctx.lineWidth = Math.max(2, t.size * 0.24);
      ctx.strokeStyle = 'rgba(0,0,0,0.85)';
      ctx.strokeText(t.text, t.x, t.y);
      ctx.fillStyle = t.color;
      ctx.fillText(t.text, t.x, t.y);
    }
    ctx.restore();
  }

  /* ---------------------------------------------------------- atmosphere */

  drawFog() {
    const ctx = this.ctx;
    const { w, h } = this;
    ctx.save();
    for (const fog of this.fogSeeds) {
      const x = ((fog.x * (w + 900) + this.time * fog.speed) % (w + 900)) - 450;
      const y = fog.y * (h + 400) - 200 + Math.sin(this.time * 0.2 + fog.phase) * 20;
      ctx.globalAlpha = 0.22;
      ctx.drawImage(this.fog, x - fog.size / 2, y - fog.size / 2, fog.size, fog.size);
    }
    ctx.restore();

    const bottom = ctx.createLinearGradient(0, h - 150, 0, h);
    bottom.addColorStop(0, 'rgba(4,3,9,0)');
    bottom.addColorStop(1, 'rgba(4,3,9,0.55)');
    ctx.fillStyle = bottom;
    ctx.fillRect(0, h - 150, w, 150);
  }

  drawBossArrow(game) {
    const boss = game.boss;
    if (!boss || boss.dead || game.state !== 'playing') return;
    const ctx = this.ctx;
    const sx = this.w / 2 + (boss.x - game.camera.x);
    const sy = this.h / 2 + (boss.y - game.camera.y);
    const marginX = 76;
    const marginTop = 110;
    const marginBottom = 90;
    if (sx > marginX && sx < this.w - marginX && sy > marginTop && sy < this.h - marginBottom) return;
    const cx = this.w / 2;
    const cy = this.h / 2;
    const angle = Math.atan2(sy - cy, sx - cx);
    const rx = this.w / 2 - marginX;
    const ry = this.h / 2 - marginTop;
    const scale = Math.min(Math.abs(rx / Math.cos(angle)), Math.abs(ry / Math.sin(angle)));
    const px = cx + Math.cos(angle) * (scale - 26);
    const py = cy + Math.sin(angle) * (scale - 26);
    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(angle);
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = 0.7;
    ctx.drawImage(this.glowFor('255,55,85'), -40, -40, 80, 80);
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#ff5c78';
    ctx.beginPath();
    ctx.moveTo(12, 0);
    ctx.lineTo(-8, -8);
    ctx.lineTo(-4, 0);
    ctx.lineTo(-8, 8);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    ctx.font = '700 8px "Segoe UI", system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(255,120,140,0.85)';
    ctx.fillText('BLOOD COUNT', px, py + 20);
  }

  drawScreenVignette() {
    const ctx = this.ctx;
    const { w, h } = this;
    const g = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.35, w / 2, h / 2, Math.max(w, h) * 0.72);
    g.addColorStop(0, 'rgba(0,0,0,0)');
    g.addColorStop(1, 'rgba(0,0,0,0.36)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  }
}

function clamp01(v) {
  return Math.max(0, Math.min(1, v));
}
