import { CREATURES, creatureName } from '../data/creatures.js';
import { clamp, dist, angleDiff, TAU, randRange } from '../core/utils.js';

// Resonancias que te acompañan: siguen, atacan y desatan su habilidad activa.
export class Companion {
  constructor(game, id, { x = 0, y = 0, temp = false, life = 0 } = {}) {
    this.game = game;
    this.id = id;
    this.def = CREATURES[id];
    this.x = x;
    this.y = y;
    this.vx = 0; this.vy = 0;
    this.facing = Math.PI / 2;
    this.anim = 'idle';
    this.animTime = Math.random() * 5;
    this.attackCd = randRange(Math.random, 0.5, 1.2);
    this.abilityCd = 0;
    this.abilityMax = this.def?.active?.cooldown || 16;
    this.temp = temp;
    this.life = life;
    this.radius = 11;
    this.dead = false;
    this.spawnPulse = 0.6;
    this.offsetAngle = Math.random() * TAU;
  }

  get entry() { return this.game.collection.owned[this.id] || { bond: 1, level: 1 }; }
  get power() {
    const bond = this.entry.bond || 1;
    const level = this.entry.level || 1;
    return 1 + (bond - 1) * 0.14 + (level - 1) * 0.09 + (this.def.rarity || 0) * 0.08;
  }

  update(dt, game) {
    this.animTime += dt;
    this.spawnPulse = Math.max(0, this.spawnPulse - dt);
    this.attackCd = Math.max(0, this.attackCd - dt);
    this.abilityCd = Math.max(0, this.abilityCd - dt);
    if (this.temp) {
      this.life -= dt;
      if (this.life <= 0) {
        this.dead = true;
        game.particles.burst(this.x, this.y - 10, 22, { color: this.def.colors[0], speed: 100, life: 0.8, size: 2.5 });
        return;
      }
    }
    if (this.def?.sprite === 'slime') this.anim = 'idle';
    const target = game.nearestEnemy(this.x, this.y, this.temp ? 460 : 520, { capturable: false });
    const p = game.player;
    let tx, ty;
    if (target) {
      const d = dist(this.x, this.y, target.x, target.y);
      const desired = this.def?.sprite === 'orb' || this.def?.sprite === 'moth' ? 120 : 48;
      if (d > desired) {
        tx = target.x; ty = target.y;
      } else if (d < desired * 0.55) {
        tx = this.x - (target.x - this.x); ty = this.y - (target.y - this.y);
      } else {
        const a = Math.atan2(target.y - this.y, target.x - this.x) + Math.PI / 2;
        tx = this.x + Math.cos(a) * 40; ty = this.y + Math.sin(a) * 40;
      }
      this.facing = Math.atan2(target.y - this.y, target.x - this.x);
      if (d < desired + 44 && this.attackCd <= 0) this.attack(target, game);
    } else {
      this.offsetAngle += dt * 0.45;
      const orbit = this.temp ? 58 : 42;
      tx = p.x + Math.cos(this.offsetAngle) * orbit - 20;
      ty = p.y + Math.sin(this.offsetAngle) * orbit * 0.7 - 8;
      this.facing = Math.atan2(p.y - this.y, p.x - this.x);
    }
    const dx = tx - this.x, dy = ty - this.y;
    const d = Math.hypot(dx, dy);
    if (d > 6) {
      const speed = (this.temp ? 190 : 155) * this.power;
      const moved = game.world.moveCircle(this.x, this.y, (dx / d) * speed * dt, (dy / d) * speed * dt, this.radius);
      this.x = moved.x; this.y = moved.y;
      this.anim = d > 34 ? 'walk' : 'idle';
      if (Math.random() < 0.08) {
        game.particles.spawn('spark', this.x, this.y - 8, {
          color: this.def.colors[0], size: 1.6, life: 0.35, speed: 8, additive: true,
        });
      }
    } else {
      this.anim = 'idle';
    }
  }

  attack(target, game) {
    const a = Math.atan2(target.y - this.y, target.x - this.x);
    const dmg = Math.round((8 + this.entry.level * 2.4 + (this.def.rarity || 0) * 4) * this.power);
    this.attackCd = this.temp ? 0.85 : 1.25 / (game.player.hasSkill('res_symphony') ? 1.35 : 1);
    const ranged = ['moth', 'orb', 'imp', 'eye', 'angel', 'bird'].includes(this.def.sprite);
    if (ranged) {
      game.spawnProjectile({
        x: this.x + Math.cos(a) * 12, y: this.y + Math.sin(a) * 12 - 8,
        vx: Math.cos(a) * 300, vy: Math.sin(a) * 300, radius: 6,
        damage: dmg, color: this.def.colors[0], owner: 'player', life: 1.5,
        element: this.def.element, trailColor: this.def.colors[1],
      });
    } else {
      target.takeDamage(dmg, { source: 'player', element: this.def.element, game });
      game.particles.slash(target.x, target.y - 8, a, { radius: 26, color: this.def.colors[0], arc: 1.3, width: 4 });
      game.particles.number(target.x, target.y - target.radius - 12, `${dmg}`, this.def.colors[1], 13);
    }
    this.anim = 'attack';
  }

  useAbility(game) {
    if (this.abilityCd > 0 || this.temp) return false;
    this.abilityCd = this.abilityMax * (game.player.hasSkill('res_bond') ? 0.75 : 1);
    const p = game.player;
    const color = this.def.colors[0];
    game.audio.sfx('spell');
    game.particles.ring(this.x, this.y, { radius: 12, target: 80, color, width: 4, life: 0.55 });
    switch (this.id) {
      case 'musgo': {
        p.heal(Math.round(p.maxHp * 0.28));
        delete p.status.burn;
        p.status.regen = 4;
        game.particles.burst(p.x, p.y - 12, 30, { color: '#8fd18a', speed: 60, life: 1.1, size: 2.5 });
        break;
      }
      case 'wolf': {
        const t = game.nearestEnemy(this.x, this.y, 360);
        if (t) {
          const a = Math.atan2(t.y - this.y, t.x - this.x);
          this.x = t.x - Math.cos(a) * 26;
          this.y = t.y - Math.sin(a) * 26;
          const dmg = Math.round((18 + this.entry.level * 3) * this.power);
          t.takeDamage(dmg, { source: 'player', game });
          t.applyStatus('burn', 5, game);
          game.particles.burst(t.x, t.y - 10, 22, { color: '#a9c98a', speed: 140, life: 0.7, size: 2.6 });
          game.particles.number(t.x, t.y - 26, `${dmg}`, '#a9c98a', 18, true);
        }
        break;
      }
      case 'firefly': {
        for (const e of game.enemies) {
          if (!e.dead && dist(this.x, this.y, e.x, e.y) < 260) {
            e.applyStatus('stun', 3, game);
            game.particles.spawn('star', e.x, e.y - 16, { color: '#ffe7a8', size: 4, life: 0.8, speed: 20 });
          }
        }
        game.revealSecrets();
        game.particles.burst(this.x, this.y - 10, 40, { color: '#ffe7a8', speed: 160, life: 1.2, size: 2.8 });
        break;
      }
      case 'deer': {
        p.status.shield = 8;
        p.shieldAmount = Math.round(p.maxHp * 0.4);
        game.particles.ring(p.x, p.y, { radius: 10, target: 54, color: '#bfefff', width: 5, life: 0.8 });
        break;
      }
      case 'imp': {
        const t = game.nearestEnemy(this.x, this.y, 400);
        if (t) {
          const a = Math.atan2(t.y - this.y, t.x - this.x);
          game.spawnProjectile({
            x: this.x, y: this.y - 10, vx: Math.cos(a) * 340, vy: Math.sin(a) * 340, radius: 9,
            damage: Math.round(24 * this.power), color: '#ff9a5c', owner: 'player', life: 1.6, element: 'fuego',
            onHit: (e) => game.spawnZone({ x: e.x, y: e.y, radius: 46, damage: Math.round(12 * this.power), life: 0.9, warnTime: 0.1, color: '#ff7b4d', type: 'fuego', owner: 'player' }),
          });
        }
        break;
      }
      case 'salamander': {
        for (const e of game.enemies) {
          if (!e.dead && dist(this.x, this.y, e.x, e.y) < 180) {
            const dmg = Math.round(20 * this.power);
            e.takeDamage(dmg, { source: 'player', element: 'fuego', game });
            e.applyStatus('burn', 4, game);
            game.particles.number(e.x, e.y - 24, `${dmg}`, '#ff9a5c', 16);
          }
        }
        game.particles.ring(this.x, this.y, { radius: 20, target: 180, color: '#ff6a3d', width: 9, life: 0.7 });
        game.camera.addShake(7);
        break;
      }
      case 'golem': {
        for (const e of game.enemies) {
          if (!e.dead && dist(this.x, this.y, e.x, e.y) < 230) {
            e.applyStatus('stun', 2.2, game);
            e.takeDamage(Math.round(14 * this.power), { source: 'player', game });
          }
        }
        game.particles.ring(this.x, this.y, { radius: 20, target: 230, color: '#8a7aa8', width: 10, life: 0.8 });
        game.camera.addShake(12);
        game.audio.sfx('heavy');
        break;
      }
      case 'raven': {
        p.invuln = Math.max(p.invuln, 3);
        p.status.veil = 3;
        game.particles.burst(p.x, p.y - 12, 30, { color: '#a08ab8', speed: 80, life: 0.9, size: 2.6, additive: false });
        break;
      }
      case 'sentinel': {
        const t = game.nearestEnemy(this.x, this.y, 460);
        if (t) {
          const a = Math.atan2(t.y - this.y, t.x - this.x);
          game.particles.beam(this.x, this.y - 12, a, { radius: 460, color: '#ffe7a8', width: 12, life: 0.3 });
          for (const e of game.enemies) {
            if (e.dead) continue;
            const dx = e.x - this.x, dy = e.y - this.y;
            const proj = dx * Math.cos(a) + dy * Math.sin(a);
            const perp = Math.abs(-dx * Math.sin(a) + dy * Math.cos(a));
            if (proj > 0 && proj < 460 && perp < 26 + e.radius) {
              e.takeDamage(Math.round(30 * this.power), { source: 'player', element: 'luz', game });
            }
          }
        }
        break;
      }
      case 'seraph': {
        for (let i = -2; i <= 2; i++) {
          const t = game.nearestEnemy(this.x, this.y, 440);
          const base = t ? Math.atan2(t.y - this.y, t.x - this.x) : this.facing;
          const a = base + i * 0.22;
          game.spawnProjectile({
            x: this.x, y: this.y - 12, vx: Math.cos(a) * 300, vy: Math.sin(a) * 300, radius: 6,
            damage: Math.round(15 * this.power), color: '#c7a4ff', owner: 'player', life: 1.5, element: 'luz',
          });
        }
        break;
      }
      case 'abyss': {
        for (const e of game.enemies) {
          if (e.dead) continue;
          const d = dist(this.x, this.y, e.x, e.y);
          if (d < 240 && d > 1) {
            const pull = Math.min(70, 260 * (1 - d / 260));
            e.x += (this.x - e.x) / d * pull;
            e.y += (this.y - e.y) / d * pull;
            e.takeDamage(Math.round(12 * this.power), { source: 'player', element: 'sombra', game });
            e.applyStatus('slow', 3, game);
          }
        }
        p.heal(Math.round(p.maxHp * 0.08));
        game.particles.ring(this.x, this.y, { radius: 240, target: 10, color: '#7d6a9e', width: 6, life: 0.7 });
        break;
      }
      case 'aurel': {
        for (const e of game.enemies) {
          if (!e.dead && dist(this.x, this.y, e.x, e.y) < 420) e.applyStatus('slow', 5, game);
        }
        p.heal(Math.round(p.maxHp * 0.25));
        p.addUlt(20);
        game.particles.ring(this.x, this.y, { radius: 20, target: 420, color: '#fff3c4', width: 8, life: 1.2 });
        game.particles.burst(this.x, this.y - 12, 60, { color: '#ffd98a', speed: 170, life: 1.4, size: 3 });
        game.camera.addShake(6);
        break;
      }
      default: {
        p.heal(Math.round(p.maxHp * 0.15));
        break;
      }
    }
    if (game.player.hasSkill('res_heal')) p.heal(Math.round(p.maxHp * 0.1));
    game.ui.toast(this.def.active.name, this.def.active.desc, 'creature');
    return true;
  }

  drawHealthRing(ctx) {
    if (this.temp) return;
    const pct = 1 - clamp(this.abilityCd / this.abilityMax, 0, 1);
    ctx.save();
    ctx.globalAlpha = 0.8;
    ctx.strokeStyle = 'rgba(10,8,16,0.7)';
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(this.x, this.y + 1, 18, 0, TAU); ctx.stroke();
    ctx.strokeStyle = pct >= 1 ? this.def.colors[0] : 'rgba(255,231,168,0.5)';
    ctx.beginPath(); ctx.arc(this.x, this.y + 1, 18, -Math.PI / 2, -Math.PI / 2 + TAU * pct); ctx.stroke();
    ctx.restore();
  }
}

export function summonCompanions(game) {
  const ids = Object.keys(game.collection.owned);
  if (!ids.length) return 0;
  for (const id of ids) {
    const existing = game.companions.find(c => c.id === id && c.temp);
    if (existing) { existing.life = 8; continue; }
    const a = Math.random() * TAU;
    game.companions.push(new Companion(game, id, {
      x: game.player.x + Math.cos(a) * 42,
      y: game.player.y + Math.sin(a) * 42,
      temp: true,
      life: 8,
    }));
  }
  return ids.length;
}
