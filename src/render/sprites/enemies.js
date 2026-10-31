import { TAU, clamp, rgba } from '../../core/utils.js';
import { CREATURES } from '../../data/creatures.js';
import { shadow, glowCircle, line, star, roundRect, flame, crystalShape, eye } from './common.js';
import { drawHumanoid } from './characters.js';

export function drawEnemy(ctx, enemy, time) {
  const alpha = enemy.dead ? clamp(1 - enemy.deathTime / 2.4, 0, 1) : 1;
  if (alpha <= 0) return;
  ctx.save();
  ctx.globalAlpha = alpha;
  const t = enemy.animTime || time;
  const x = enemy.x, y = enemy.y;
  const s = enemy.scale || 1;
  const moving = enemy.anim === 'walk' || enemy.anim === 'run' || enemy.anim === 'dash';
  const bob = moving ? Math.abs(Math.sin(t * 10)) * 2 : Math.sin(t * 2.2) * 0.8;
  const facingLeft = Math.cos(enemy.facing) < 0;
  const flash = enemy.flash > 0;

  switch (enemy.sprite) {
    case 'slime': {
      shadow(ctx, x, y, 14 * s, 5 * s, 0.28);
      const squash = 1 + Math.sin(t * 4) * 0.08;
      const g = ctx.createRadialGradient(x - 4 * s, y - 18 * s, 2, x, y - 12 * s, 18 * s);
      g.addColorStop(0, '#c9f29a');
      g.addColorStop(0.45, '#7fbf6a');
      g.addColorStop(1, '#3f6636');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.ellipse(x, y - 12 * s * squash, 16 * s, 13 * s / squash, 0, 0, TAU);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.35)';
      ctx.beginPath(); ctx.ellipse(x - 5 * s, y - 20 * s, 4 * s, 2.5 * s, -0.4, 0, TAU); ctx.fill();
      eye(ctx, x - 5 * s, y - 14 * s, 2.4 * s, '#2a3a2a');
      eye(ctx, x + 5 * s, y - 14 * s, 2.4 * s, '#2a3a2a');
      ctx.strokeStyle = '#2a3a2a'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(x, y - 8 * s, 3 * s, 0.2, Math.PI - 0.2); ctx.stroke();
      break;
    }
    case 'wolf': {
      shadow(ctx, x, y, 17 * s, 5 * s, 0.3);
      const leg = moving ? Math.sin(t * 14) * 4 : 0;
      ctx.strokeStyle = '#2f3a2f'; ctx.lineWidth = 3.4 * s; ctx.lineCap = 'round';
      for (let i = 0; i < 4; i++) {
        const lx = x - 10 * s + (i % 2) * 20 * s;
        const ly = y - 12 * s;
        ctx.beginPath(); ctx.moveTo(lx, ly); ctx.lineTo(lx + (i < 2 ? leg : -leg), y); ctx.stroke();
      }
      ctx.fillStyle = '#5d6b55';
      ctx.beginPath(); ctx.ellipse(x, y - 18 * s, 18 * s, 10 * s, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = '#4a5746';
      ctx.beginPath(); ctx.ellipse(x, y - 20 * s, 12 * s, 8 * s, 0, 0, TAU); ctx.fill();
      // Espinas.
      ctx.strokeStyle = '#a9c98a'; ctx.lineWidth = 1.6 * s;
      for (let i = 0; i < 4; i++) {
        const sx = x - 9 * s + i * 6 * s;
        ctx.beginPath(); ctx.moveTo(sx, y - 26 * s); ctx.lineTo(sx + 2, y - 33 * s); ctx.stroke();
      }
      const hx = x + (facingLeft ? -16 : 16) * s;
      ctx.fillStyle = '#5d6b55';
      ctx.beginPath(); ctx.ellipse(hx, y - 25 * s, 8 * s, 7 * s, 0, 0, TAU); ctx.fill();
      ctx.beginPath(); ctx.moveTo(hx - 5 * s, y - 30 * s); ctx.lineTo(hx - 8 * s, y - 39 * s); ctx.lineTo(hx, y - 32 * s); ctx.fill();
      ctx.beginPath(); ctx.moveTo(hx + 5 * s, y - 30 * s); ctx.lineTo(hx + 8 * s, y - 39 * s); ctx.lineTo(hx, y - 32 * s); ctx.fill();
      eye(ctx, hx + (facingLeft ? -2 : 2) * s, y - 27 * s, 1.7 * s, '#ffcf6a');
      ctx.strokeStyle = '#a9c98a'; ctx.lineWidth = 2.4 * s;
      ctx.beginPath(); ctx.moveTo(x - (facingLeft ? 16 : -16) * s, y - 20 * s); ctx.quadraticCurveTo(x - (facingLeft ? 30 : -30) * s, y - 28 * s + Math.sin(t * 6) * 4, x - (facingLeft ? 24 : -24) * s, y - 34 * s); ctx.stroke();
      break;
    }
    case 'human': {
      drawHumanoid(ctx, x, y, {
        appearance: { skin: '#b88a62', hairColor: '#3a2a1a', hairStyle: 4, outfit: '#4a3a3a', armorColor: '#5a4a42', eyeColor: '#ffcf6a', cape: true, capeColor: '#3a2a2a' },
        anim: enemy.anim === 'windup' ? 'heavy' : enemy.anim, animTime: t, facing: enemy.facing,
        weapon: 'bandit', weaponType: 'sword', weaponColor: '#b9a98e', scale: s,
      });
      break;
    }
    case 'wraith': {
      const float = Math.sin(t * 2.4) * 4;
      shadow(ctx, x, y, 12 * s, 4 * s, 0.2);
      glowCircle(ctx, x, y - 24 * s + float, 30 * s, '#8fd18a', 0.16);
      ctx.fillStyle = '#2f4a3a';
      ctx.beginPath();
      ctx.moveTo(x, y - 48 * s + float);
      ctx.quadraticCurveTo(x + 17 * s, y - 32 * s + float, x + 12 * s, y - 6 * s + float);
      ctx.quadraticCurveTo(x + 6 * s, y + 2 * s, x, y - 4 * s + float);
      ctx.quadraticCurveTo(x - 6 * s, y + 2 * s, x - 12 * s, y - 6 * s + float);
      ctx.quadraticCurveTo(x - 17 * s, y - 32 * s + float, x, y - 48 * s + float);
      ctx.fill();
      ctx.fillStyle = '#1e3228';
      ctx.beginPath(); ctx.ellipse(x, y - 42 * s + float, 9 * s, 10 * s, 0, 0, TAU); ctx.fill();
      eye(ctx, x - 3.5 * s, y - 43 * s + float, 1.8 * s, '#8fd18a');
      eye(ctx, x + 3.5 * s, y - 43 * s + float, 1.8 * s, '#8fd18a');
      ctx.strokeStyle = 'rgba(143,209,138,0.5)'; ctx.lineWidth = 1.2 * s;
      for (let i = 0; i < 4; i++) {
        const a = (i / 4) * TAU + t * 0.3;
        ctx.beginPath(); ctx.moveTo(x + Math.cos(a) * 10 * s, y - 10 * s + float); ctx.lineTo(x + Math.cos(a) * 18 * s, y + Math.sin(a) * 6 * s); ctx.stroke();
      }
      break;
    }
    case 'imp': {
      const float = Math.sin(t * 4) * 3;
      shadow(ctx, x, y, 10 * s, 4 * s, 0.25);
      glowCircle(ctx, x, y - 18 * s + float, 24 * s, '#ff7b4d', 0.16);
      ctx.fillStyle = '#6a3020';
      ctx.beginPath(); ctx.ellipse(x, y - 15 * s + float, 10 * s, 12 * s, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = '#ff8a5c';
      ctx.beginPath(); ctx.ellipse(x, y - 16 * s + float, 6 * s, 8 * s, 0, 0, TAU); ctx.fill();
      // Alas.
      ctx.fillStyle = 'rgba(90,40,30,0.85)';
      ctx.beginPath(); ctx.moveTo(x - 8 * s, y - 22 * s + float); ctx.quadraticCurveTo(x - 22 * s, y - 34 * s + float, x - 18 * s, y - 14 * s + float); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.moveTo(x + 8 * s, y - 22 * s + float); ctx.quadraticCurveTo(x + 22 * s, y - 34 * s + float, x + 18 * s, y - 14 * s + float); ctx.closePath(); ctx.fill();
      // Cuernos.
      ctx.strokeStyle = '#ffd08a'; ctx.lineWidth = 2 * s;
      ctx.beginPath(); ctx.moveTo(x - 5 * s, y - 28 * s + float); ctx.lineTo(x - 9 * s, y - 37 * s + float); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x + 5 * s, y - 28 * s + float); ctx.lineTo(x + 9 * s, y - 37 * s + float); ctx.stroke();
      eye(ctx, x - 2.5 * s, y - 19 * s + float, 1.6 * s, '#ffcf6a');
      eye(ctx, x + 2.5 * s, y - 19 * s + float, 1.6 * s, '#ffcf6a');
      break;
    }
    case 'golem': {
      shadow(ctx, x, y, 24 * s, 8 * s, 0.38);
      const leg = moving ? Math.sin(t * 7) * 3 : 0;
      ctx.fillStyle = '#2a2a36';
      ctx.fillRect(x - 16 * s, y - 20 * s, 12 * s, 20 * s);
      ctx.fillRect(x + 4 * s, y - 20 * s, 12 * s, 20 * s);
      ctx.fillStyle = '#4a4a5e';
      roundRect(ctx, x - 22 * s, y - 54 * s, 44 * s, 38 * s, 6 * s); ctx.fill();
      ctx.fillStyle = '#5a5a72';
      roundRect(ctx, x - 18 * s, y - 50 * s, 16 * s, 26 * s, 4 * s); ctx.fill();
      ctx.fillStyle = '#3a3a4c';
      ctx.beginPath(); ctx.arc(x, y - 62 * s, 12 * s, 0, TAU); ctx.fill();
      glowCircle(ctx, x, y - 62 * s, 22 * s, '#8a7aa8', 0.2);
      eye(ctx, x - 4 * s, y - 64 * s, 1.8 * s, '#c7a4ff');
      eye(ctx, x + 4 * s, y - 64 * s, 1.8 * s, '#c7a4ff');
      ctx.strokeStyle = 'rgba(199,164,255,0.7)'; ctx.lineWidth = 1.6 * s;
      ctx.beginPath(); ctx.moveTo(x - 12 * s, y - 44 * s); ctx.lineTo(x, y - 34 * s); ctx.lineTo(x + 12 * s, y - 44 * s); ctx.stroke();
      ctx.fillStyle = '#3a3a4c';
      ctx.fillRect(x - 30 * s, y - 48 * s + leg, 8 * s, 30 * s);
      ctx.fillRect(x + 22 * s, y - 48 * s - leg, 8 * s, 30 * s);
      break;
    }
    case 'knight': {
      drawHumanoid(ctx, x, y, {
        appearance: { skin: '#c8a888', hairColor: '#2a2a2a', hairStyle: 0, outfit: '#3a3a4a', armorColor: '#4a4a5a', helmet: true, eyeColor: '#ff9a5c', cape: true, capeColor: '#2a1a1a' },
        anim: enemy.anim === 'windup' ? 'heavy' : enemy.anim, animTime: t, facing: enemy.facing,
        weapon: 'fallen', weaponType: 'greatsword', weaponColor: '#ff7b4d', helmetColor: '#5a5a6a', scale: s,
      });
      glowCircle(ctx, x, y - 30, 30, '#ff7b4d', 0.1);
      break;
    }
    case 'lizard': {
      shadow(ctx, x, y, 18 * s, 6 * s, 0.32);
      const leg = moving ? Math.sin(t * 12) * 4 : 0;
      ctx.strokeStyle = '#5a1f18'; ctx.lineWidth = 4 * s; ctx.lineCap = 'round';
      for (let i = 0; i < 4; i++) {
        const lx = x - 12 * s + (i % 2) * 24 * s;
        ctx.beginPath(); ctx.moveTo(lx, y - 10 * s); ctx.lineTo(lx + (i < 2 ? leg : -leg), y); ctx.stroke();
      }
      ctx.fillStyle = '#ff6a3d';
      ctx.beginPath(); ctx.ellipse(x, y - 15 * s, 20 * s, 10 * s, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = '#ffb35c';
      ctx.beginPath(); ctx.ellipse(x, y - 20 * s, 14 * s, 5 * s, 0, 0, TAU); ctx.fill();
      const hx = x + (facingLeft ? -18 : 18) * s;
      ctx.fillStyle = '#ff6a3d';
      ctx.beginPath(); ctx.ellipse(hx, y - 20 * s, 8 * s, 6 * s, 0, 0, TAU); ctx.fill();
      eye(ctx, hx + (facingLeft ? -2 : 2) * s, y - 22 * s, 1.7 * s, '#ffcf6a');
      ctx.strokeStyle = '#ff6a3d'; ctx.lineWidth = 4 * s;
      ctx.beginPath(); ctx.moveTo(x - (facingLeft ? 16 : -16) * s, y - 16 * s); ctx.quadraticCurveTo(x - (facingLeft ? 30 : -30) * s, y - 10 * s + Math.sin(t * 5) * 5, x - (facingLeft ? 24 : -24) * s, y - 22 * s); ctx.stroke();
      for (let i = 0; i < 3; i++) flame(ctx, x - 8 * s + i * 8 * s, y - 22 * s, 0.28 * s, time + i, '#ff7b4d');
      break;
    }
    case 'orb': {
      const float = Math.sin(t * 2) * 5;
      glowCircle(ctx, x, y - 26 * s + float, 42 * s, '#ffe7a8', 0.22);
      ctx.strokeStyle = 'rgba(255,231,168,0.5)'; ctx.lineWidth = 1.4 * s;
      ctx.beginPath(); ctx.ellipse(x, y - 26 * s + float, 18 * s, 7 * s, 0.5, 0, TAU); ctx.stroke();
      ctx.beginPath(); ctx.ellipse(x, y - 26 * s + float, 18 * s, 7 * s, -0.5, 0, TAU); ctx.stroke();
      ctx.fillStyle = '#fffbe8';
      ctx.beginPath(); ctx.arc(x, y - 26 * s + float, 10 * s, 0, TAU); ctx.fill();
      eye(ctx, x, y - 26 * s + float, 5 * s, '#ffe7a8');
      break;
    }
    case 'angel': {
      const float = Math.sin(t * 2.2) * 4;
      shadow(ctx, x, y, 13 * s, 4 * s, 0.2);
      glowCircle(ctx, x, y - 34 * s + float, 34 * s, '#c7a4ff', 0.16);
      ctx.fillStyle = '#e8e0f0';
      ctx.beginPath(); ctx.moveTo(x - 8 * s, y - 38 * s + float); ctx.quadraticCurveTo(x - 30 * s, y - 52 * s + float, x - 26 * s, y - 18 * s + float); ctx.quadraticCurveTo(x - 18 * s, y - 30 * s + float, x - 8 * s, y - 30 * s + float); ctx.fill();
      ctx.beginPath(); ctx.moveTo(x + 8 * s, y - 38 * s + float); ctx.quadraticCurveTo(x + 30 * s, y - 52 * s + float, x + 26 * s, y - 18 * s + float); ctx.quadraticCurveTo(x + 18 * s, y - 30 * s + float, x + 8 * s, y - 30 * s + float); ctx.fill();
      ctx.fillStyle = '#ffe7a8';
      ctx.beginPath(); ctx.ellipse(x, y - 18 * s + float, 8 * s, 18 * s, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = '#f4efe8';
      ctx.beginPath(); ctx.arc(x, y - 42 * s + float, 8 * s, 0, TAU); ctx.fill();
      eye(ctx, x - 2.5 * s, y - 43 * s + float, 1.6 * s, '#c7a4ff');
      eye(ctx, x + 2.5 * s, y - 43 * s + float, 1.6 * s, '#c7a4ff');
      ctx.strokeStyle = '#ffe7a8'; ctx.lineWidth = 2 * s;
      ctx.beginPath(); ctx.ellipse(x, y - 56 * s + float, 11 * s, 4 * s, 0, 0, TAU); ctx.stroke();
      break;
    }
    case 'eye': {
      const float = Math.sin(t * 1.7) * 5;
      glowCircle(ctx, x, y - 30 * s + float, 40 * s, '#7d6a9e', 0.22);
      ctx.fillStyle = '#1e1628';
      ctx.beginPath(); ctx.arc(x, y - 30 * s + float, 18 * s, 0, TAU); ctx.fill();
      ctx.fillStyle = '#c7a4ff';
      ctx.beginPath(); ctx.ellipse(x, y - 30 * s + float, 12 * s, 8 * s, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = '#0a0610';
      ctx.beginPath(); ctx.arc(x, y - 30 * s + float, 5 * s, 0, TAU); ctx.fill();
      ctx.fillStyle = '#fff3c4';
      ctx.beginPath(); ctx.arc(x - 2 * s, y - 32 * s + float, 1.5 * s, 0, TAU); ctx.fill();
      ctx.strokeStyle = 'rgba(125,106,158,0.6)'; ctx.lineWidth = 1.6 * s;
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * TAU + t * 0.2;
        ctx.beginPath();
        ctx.moveTo(x + Math.cos(a) * 14 * s, y - 24 * s + float + Math.sin(a) * 12 * s);
        ctx.quadraticCurveTo(x + Math.cos(a) * 22 * s, y - 10 * s + float, x + Math.cos(a) * 16 * s, y + 2 * s);
        ctx.stroke();
      }
      break;
    }
    case 'moth': {
      const float = Math.sin(t * 5) * 4;
      glowCircle(ctx, x, y - 24 * s + float, 26 * s, '#ffe7a8', 0.3);
      ctx.fillStyle = 'rgba(255,231,168,0.55)';
      ctx.beginPath(); ctx.ellipse(x - 9 * s, y - 28 * s + float, 11 * s, 7 * s, -0.5, 0, TAU); ctx.fill();
      ctx.beginPath(); ctx.ellipse(x + 9 * s, y - 28 * s + float, 11 * s, 7 * s, 0.5, 0, TAU); ctx.fill();
      ctx.fillStyle = '#ffb84d';
      ctx.beginPath(); ctx.ellipse(x, y - 24 * s + float, 4 * s, 8 * s, 0, 0, TAU); ctx.fill();
      star(ctx, x, y - 24 * s + float, 4 * s, '#fff3c4', 4, t);
      break;
    }
    case 'deer': {
      const float = Math.sin(t * 2) * 2;
      shadow(ctx, x, y, 16 * s, 5 * s, 0.25);
      ctx.strokeStyle = '#5f8fa8'; ctx.lineWidth = 2.6 * s; ctx.lineCap = 'round';
      for (let i = 0; i < 4; i++) {
        const lx = x - 10 * s + (i % 2) * 20 * s;
        ctx.beginPath(); ctx.moveTo(lx, y - 16 * s); ctx.lineTo(lx + (i < 2 ? 2 : -2) * s, y); ctx.stroke();
      }
      ctx.fillStyle = '#bfefff';
      ctx.beginPath(); ctx.ellipse(x, y - 22 * s, 16 * s, 9 * s, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = '#e8fbff';
      ctx.beginPath(); ctx.ellipse(x - 3 * s, y - 26 * s, 10 * s, 4 * s, 0, 0, TAU); ctx.fill();
      const hx = x + (facingLeft ? -15 : 15) * s;
      ctx.fillStyle = '#bfefff';
      ctx.beginPath(); ctx.ellipse(hx, y - 30 * s + float, 6 * s, 8 * s, 0, 0, TAU); ctx.fill();
      eye(ctx, hx + (facingLeft ? -1 : 1) * s, y - 32 * s + float, 1.5 * s, '#5f8fa8');
      ctx.strokeStyle = '#e8fbff'; ctx.lineWidth = 1.5 * s;
      ctx.beginPath(); ctx.moveTo(hx, y - 37 * s + float); ctx.lineTo(hx - 4 * s, y - 50 * s + float); ctx.lineTo(hx - 10 * s, y - 54 * s + float); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(hx - 4 * s, y - 50 * s + float); ctx.lineTo(hx + 2 * s, y - 54 * s + float); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(hx, y - 37 * s + float); ctx.lineTo(hx + 4 * s, y - 50 * s + float); ctx.lineTo(hx + 10 * s, y - 54 * s + float); ctx.stroke();
      glowCircle(ctx, hx, y - 50 * s + float, 14 * s, '#bfefff', 0.25);
      break;
    }
    case 'bird': {
      const float = Math.sin(t * 3) * 6;
      shadow(ctx, x, y, 8 * s, 3 * s, 0.18);
      ctx.fillStyle = '#241c30';
      ctx.beginPath(); ctx.ellipse(x, y - 30 * s + float, 9 * s, 6 * s, 0, 0, TAU); ctx.fill();
      ctx.beginPath(); ctx.moveTo(x - 4 * s, y - 32 * s + float); ctx.quadraticCurveTo(x - 18 * s, y - 40 * s + float, x - 12 * s, y - 24 * s + float); ctx.fill();
      ctx.beginPath(); ctx.moveTo(x + 4 * s, y - 32 * s + float); ctx.quadraticCurveTo(x + 18 * s, y - 40 * s + float, x + 12 * s, y - 24 * s + float); ctx.fill();
      ctx.fillStyle = '#a08ab8';
      ctx.beginPath(); ctx.arc(x + (facingLeft ? -8 : 8) * s, y - 34 * s + float, 3 * s, 0, TAU); ctx.fill();
      eye(ctx, x + (facingLeft ? -8 : 8) * s, y - 34 * s + float, 1.1 * s, '#c7a4ff');
      ctx.fillStyle = '#5a4a6e';
      ctx.beginPath(); ctx.moveTo(x + (facingLeft ? -12 : 12) * s, y - 33 * s + float); ctx.lineTo(x + (facingLeft ? -18 : 18) * s, y - 31 * s + float); ctx.lineTo(x + (facingLeft ? -12 : 12) * s, y - 29 * s + float); ctx.fill();
      if (Math.random() < 0.3) {
        enemy.game.particles.spawn('smoke', x + (Math.random() - 0.5) * 20, y - 20 * s + float, { color: '#5a4a6e', size: 4, life: 0.5, speed: 8, additive: false });
      }
      break;
    }
    default:
      drawHumanoid(ctx, x, y, { appearance: { skin: '#b88a62', hairColor: '#3a2a1a', outfit: '#5a4a3a' }, anim: enemy.anim, animTime: t, facing: enemy.facing, scale: s });
      break;
  }

  if (flash) {
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = clamp(enemy.flash * 5, 0, 0.7);
    ctx.fillStyle = '#fff3c4';
    ctx.beginPath(); ctx.arc(x, y - 24 * s, 20 * s, 0, TAU); ctx.fill();
  }
  if (enemy.status?.burn) {
    if (Math.random() < 0.4) enemy.game.particles.spawn('ember', x + (Math.random() - 0.5) * 16, y - 14 * s, { color: '#ff9a5c', size: 2, life: 0.4, speed: 20 });
  }
  ctx.restore();
}

export function drawBoss(ctx, boss, time) {
  const t = boss.animTime || time;
  const s = boss.scale || 1;
  const x = boss.x, y = boss.y;
  const alpha = boss.dead ? clamp(1 - boss.deathTime / 3.2, 0, 1) : 1;
  if (alpha <= 0) return;
  ctx.save();
  ctx.globalAlpha = alpha;
  const flash = boss.flash > 0;
  const phaseGlow = boss.phase === 0 ? '#8fd18a' : boss.phase === 1 ? '#ff9a5c' : '#c7a4ff';
  glowCircle(ctx, x, y - 50 * s, 90 * s, phaseGlow, 0.12);

  if (boss.sprite === 'treant') {
    shadow(ctx, x, y, 50 * s, 16 * s, 0.4);
    // Raíces.
    ctx.strokeStyle = '#2a3a24'; ctx.lineWidth = 12 * s; ctx.lineCap = 'round';
    for (let i = 0; i < 5; i++) {
      const a = Math.PI + (i / 4) * Math.PI;
      ctx.beginPath();
      ctx.moveTo(x, y - 30 * s);
      ctx.quadraticCurveTo(x + Math.cos(a) * 50 * s, y - 6 * s, x + Math.cos(a) * 72 * s, y + 8 * s);
      ctx.stroke();
    }
    // Tronco.
    ctx.fillStyle = '#4a3a2a';
    ctx.beginPath();
    ctx.moveTo(x - 26 * s, y);
    ctx.quadraticCurveTo(x - 34 * s, y - 80 * s, x - 18 * s, y - 120 * s);
    ctx.lineTo(x + 18 * s, y - 120 * s);
    ctx.quadraticCurveTo(x + 34 * s, y - 80 * s, x + 26 * s, y);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#2a2018'; ctx.lineWidth = 3 * s;
    for (let i = 0; i < 5; i++) {
      ctx.beginPath(); ctx.moveTo(x - 20 * s + i * 10 * s, y - 8 * s); ctx.quadraticCurveTo(x - 24 * s + i * 12 * s, y - 60 * s, x - 12 * s + i * 6 * s, y - 112 * s); ctx.stroke();
    }
    // Ramas.
    ctx.strokeStyle = '#3a2e22'; ctx.lineWidth = 7 * s;
    for (let i = 0; i < 4; i++) {
      const dir = i % 2 ? 1 : -1;
      ctx.beginPath();
      ctx.moveTo(x + dir * 10 * s, y - 100 * s);
      ctx.quadraticCurveTo(x + dir * 55 * s, y - 125 * s, x + dir * 72 * s, y - 154 * s);
      ctx.stroke();
    }
    // Copa.
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * TAU;
      const cx = x + Math.cos(a) * 38 * s;
      const cy = y - 140 * s + Math.sin(a) * 24 * s;
      const g = ctx.createRadialGradient(cx - 6, cy - 6, 2, cx, cy, 30 * s);
      g.addColorStop(0, '#5c8f4f');
      g.addColorStop(1, '#1e3c28');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(cx, cy, 28 * s, 0, TAU); ctx.fill();
    }
    // Rostro.
    glowCircle(ctx, x, y - 80 * s, 28 * s, '#8fd18a', 0.25);
    eye(ctx, x - 10 * s, y - 84 * s, 5 * s, '#8fd18a');
    eye(ctx, x + 10 * s, y - 84 * s, 5 * s, '#8fd18a');
    ctx.strokeStyle = '#1a1212'; ctx.lineWidth = 3 * s;
    ctx.beginPath(); ctx.arc(x, y - 64 * s, 10 * s, 0.15, Math.PI - 0.15); ctx.stroke();
  } else if (boss.sprite === 'flameLady') {
    shadow(ctx, x, y, 30 * s, 10 * s, 0.35);
    // Vestido de fuego.
    const g = ctx.createLinearGradient(x, y - 110 * s, x, y);
    g.addColorStop(0, '#ffd98a');
    g.addColorStop(0.45, '#ff7b3d');
    g.addColorStop(1, '#8a2a1a');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(x - 14 * s, y - 88 * s);
    ctx.quadraticCurveTo(x - 38 * s, y - 44 * s, x - 32 * s, y);
    ctx.quadraticCurveTo(x, y + 10 * s, x + 32 * s, y);
    ctx.quadraticCurveTo(x + 38 * s, y - 44 * s, x + 14 * s, y - 88 * s);
    ctx.closePath(); ctx.fill();
    // Brazos.
    ctx.strokeStyle = '#ffb07a'; ctx.lineWidth = 6 * s; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(x - 14 * s, y - 82 * s); ctx.lineTo(x - 34 * s, y - 58 * s + Math.sin(t * 2) * 4); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x + 14 * s, y - 82 * s); ctx.lineTo(x + 34 * s, y - 58 * s - Math.sin(t * 2) * 4); ctx.stroke();
    // Cabeza.
    ctx.fillStyle = '#ffb07a';
    ctx.beginPath(); ctx.arc(x, y - 98 * s, 13 * s, 0, TAU); ctx.fill();
    eye(ctx, x - 4 * s, y - 99 * s, 2.2 * s, '#fff3c4');
    eye(ctx, x + 4 * s, y - 99 * s, 2.2 * s, '#fff3c4');
    // Cabello de llamas.
    for (let i = 0; i < 7; i++) {
      flame(ctx, x - 18 * s + i * 6 * s, y - 108 * s, 0.6 * s + (i % 2) * 0.18 * s, time + i * 0.4, '#ff5a2a');
    }
    // Lágrima en el pecho.
    glowCircle(ctx, x, y - 72 * s, 22 * s, '#ffe7a8', 0.4);
    star(ctx, x, y - 72 * s, 6 * s, '#fff3c4', 4, t * 0.5);
    if (boss.phase > 0) {
      for (let i = 0; i < 3; i++) {
        const a = t * 0.8 + i * TAU / 3;
        glowCircle(ctx, x + Math.cos(a) * 48 * s, y - 58 * s + Math.sin(a) * 18 * s, 16 * s, '#ff9a5c', 0.3);
      }
    }
  } else if (boss.sprite === 'veil') {
    const float = Math.sin(t * 1.4) * 8;
    shadow(ctx, x, y, 34 * s, 11 * s, 0.35);
    // Manto.
    ctx.fillStyle = '#1a1228';
    ctx.beginPath();
    ctx.moveTo(x, y - 150 * s + float);
    ctx.quadraticCurveTo(x + 46 * s, y - 100 * s + float, x + 40 * s, y + 4 * s);
    ctx.quadraticCurveTo(x + 20 * s, y + 16 * s, x, y + 4 * s);
    ctx.quadraticCurveTo(x - 20 * s, y + 16 * s, x - 40 * s, y + 4 * s);
    ctx.quadraticCurveTo(x - 46 * s, y - 100 * s + float, x, y - 150 * s + float);
    ctx.fill();
    // Interior estrellado.
    ctx.fillStyle = 'rgba(199,164,255,0.16)';
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * TAU + t * 0.15;
      const rr = 18 * s + (i % 3) * 6 * s;
      ctx.beginPath(); ctx.arc(x + Math.cos(a) * rr, y - 78 * s + float + Math.sin(a) * rr, 2 * s, 0, TAU); ctx.fill();
    }
    // Máscara.
    ctx.fillStyle = '#e8e0f0';
    ctx.beginPath(); ctx.ellipse(x, y - 122 * s + float, 17 * s, 22 * s, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = '#0a0610';
    ctx.beginPath(); ctx.ellipse(x, y - 124 * s + float, 12 * s, 8 * s, 0, 0, TAU); ctx.fill();
    eye(ctx, x - 5 * s, y - 125 * s + float, 2.2 * s, '#c7a4ff');
    eye(ctx, x + 5 * s, y - 125 * s + float, 2.2 * s, '#c7a4ff');
    // Fragmentos espejo.
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * TAU + t * 0.5;
      const rx = x + Math.cos(a) * 62 * s;
      const ry = y - 80 * s + Math.sin(a) * 30 * s;
      ctx.save(); ctx.translate(rx, ry); ctx.rotate(a);
      crystalShape(ctx, 0, 12 * s, 24 * s, 5 * s, '#c7a4ff');
      ctx.restore();
    }
  } else {
    drawHumanoid(ctx, x, y, { appearance: { skin: '#8a7a5a', hairColor: '#3a4a2a', outfit: '#2f4a2a' }, anim: boss.anim, animTime: t, facing: boss.facing, scale: s, weapon: 'boss', weaponType: 'greatsword', weaponColor: '#8fd18a' });
  }

  if (flash) {
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = clamp(boss.flash * 5, 0, 0.65);
    ctx.fillStyle = '#fff3c4';
    ctx.beginPath(); ctx.arc(x, y - 50 * s, 48 * s, 0, TAU); ctx.fill();
  }
  ctx.restore();
}

export function drawCreature(ctx, id, x, y, scale, time) {
  const def = CREATURES[id];
  if (!def) return;
  const s = scale || 1;
  const t = time || 0;
  const colors = def.colors || ['#8fd18a', '#c9f29a', '#4d7a4a'];
  const float = Math.sin(t * 2.5 + x * 0.1) * 2.5;
  switch (def.sprite) {
    case 'slime': {
      shadow(ctx, x, y, 10 * s, 4 * s, 0.25);
      const g = ctx.createRadialGradient(x - 3 * s, y - 12 * s, 1, x, y - 8 * s, 13 * s);
      g.addColorStop(0, colors[1]); g.addColorStop(0.5, colors[0]); g.addColorStop(1, colors[2]);
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.ellipse(x, y - 8 * s + float, 11 * s, 9 * s, 0, 0, TAU); ctx.fill();
      eye(ctx, x - 3.5 * s, y - 10 * s + float, 1.6 * s, '#2a3a2a');
      eye(ctx, x + 3.5 * s, y - 10 * s + float, 1.6 * s, '#2a3a2a');
      glowCircle(ctx, x, y - 10 * s + float, 18 * s, colors[0], 0.16);
      break;
    }
    case 'wolf': {
      shadow(ctx, x, y, 12 * s, 4 * s, 0.25);
      ctx.fillStyle = colors[0];
      ctx.beginPath(); ctx.ellipse(x, y - 10 * s + float, 12 * s, 6 * s, 0, 0, TAU); ctx.fill();
      ctx.beginPath(); ctx.arc(x + 9 * s, y - 15 * s + float, 5 * s, 0, TAU); ctx.fill();
      ctx.beginPath(); ctx.moveTo(x + 6 * s, y - 19 * s + float); ctx.lineTo(x + 5 * s, y - 25 * s + float); ctx.lineTo(x + 9 * s, y - 20 * s + float); ctx.fill();
      eye(ctx, x + 10 * s, y - 16 * s + float, 1.2 * s, '#ffe7a8');
      ctx.strokeStyle = colors[1]; ctx.lineWidth = 1.4 * s;
      ctx.beginPath(); ctx.moveTo(x - 10 * s, y - 12 * s + float); ctx.lineTo(x - 18 * s, y - 18 * s + float); ctx.stroke();
      break;
    }
    case 'moth': {
      glowCircle(ctx, x, y - 12 * s + float, 18 * s, colors[0], 0.3);
      ctx.fillStyle = rgba(colors[0], 0.55);
      ctx.beginPath(); ctx.ellipse(x - 6 * s, y - 14 * s + float, 7 * s, 4.5 * s, -0.5, 0, TAU); ctx.fill();
      ctx.beginPath(); ctx.ellipse(x + 6 * s, y - 14 * s + float, 7 * s, 4.5 * s, 0.5, 0, TAU); ctx.fill();
      ctx.fillStyle = colors[1];
      ctx.beginPath(); ctx.ellipse(x, y - 12 * s + float, 2.5 * s, 5 * s, 0, 0, TAU); ctx.fill();
      star(ctx, x, y - 12 * s + float, 2.5 * s, '#fff3c4', 4, t);
      break;
    }
    case 'deer': {
      shadow(ctx, x, y, 11 * s, 3.5 * s, 0.2);
      ctx.fillStyle = colors[0];
      ctx.beginPath(); ctx.ellipse(x, y - 10 * s + float, 10 * s, 5 * s, 0, 0, TAU); ctx.fill();
      ctx.beginPath(); ctx.arc(x + 9 * s, y - 17 * s + float, 4 * s, 0, TAU); ctx.fill();
      ctx.strokeStyle = colors[1]; ctx.lineWidth = 1.2 * s;
      ctx.beginPath(); ctx.moveTo(x + 9 * s, y - 21 * s + float); ctx.lineTo(x + 6 * s, y - 28 * s + float); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x + 9 * s, y - 21 * s + float); ctx.lineTo(x + 12 * s, y - 28 * s + float); ctx.stroke();
      glowCircle(ctx, x + 9 * s, y - 24 * s + float, 10 * s, colors[0], 0.2);
      break;
    }
    case 'imp': {
      glowCircle(ctx, x, y - 12 * s + float, 16 * s, colors[0], 0.2);
      ctx.fillStyle = colors[0];
      ctx.beginPath(); ctx.ellipse(x, y - 10 * s + float, 6 * s, 7 * s, 0, 0, TAU); ctx.fill();
      ctx.strokeStyle = colors[1]; ctx.lineWidth = 1.2 * s;
      ctx.beginPath(); ctx.moveTo(x - 3 * s, y - 16 * s + float); ctx.lineTo(x - 5 * s, y - 21 * s + float); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x + 3 * s, y - 16 * s + float); ctx.lineTo(x + 5 * s, y - 21 * s + float); ctx.stroke();
      eye(ctx, x - 1.8 * s, y - 11 * s + float, 1.1 * s, '#ffe7a8');
      eye(ctx, x + 1.8 * s, y - 11 * s + float, 1.1 * s, '#ffe7a8');
      break;
    }
    case 'lizard': {
      shadow(ctx, x, y, 13 * s, 4 * s, 0.25);
      ctx.fillStyle = colors[0];
      ctx.beginPath(); ctx.ellipse(x, y - 9 * s + float, 13 * s, 6 * s, 0, 0, TAU); ctx.fill();
      ctx.beginPath(); ctx.arc(x + 11 * s, y - 12 * s + float, 4 * s, 0, TAU); ctx.fill();
      eye(ctx, x + 12 * s, y - 13 * s + float, 1.1 * s, '#ffe7a8');
      flame(ctx, x - 3 * s, y - 13 * s + float, 0.22 * s, t, colors[0]);
      break;
    }
    case 'golem': {
      shadow(ctx, x, y, 14 * s, 5 * s, 0.3);
      ctx.fillStyle = colors[0];
      roundRect(ctx, x - 11 * s, y - 28 * s + float, 22 * s, 20 * s, 3 * s); ctx.fill();
      ctx.fillStyle = colors[2];
      ctx.beginPath(); ctx.arc(x, y - 32 * s + float, 6 * s, 0, TAU); ctx.fill();
      eye(ctx, x - 2 * s, y - 33 * s + float, 1.1 * s, colors[1]);
      eye(ctx, x + 2 * s, y - 33 * s + float, 1.1 * s, colors[1]);
      break;
    }
    case 'bird': {
      shadow(ctx, x, y, 7 * s, 3 * s, 0.15);
      ctx.fillStyle = colors[0];
      ctx.beginPath(); ctx.ellipse(x, y - 18 * s + float, 7 * s, 5 * s, 0, 0, TAU); ctx.fill();
      ctx.beginPath(); ctx.moveTo(x - 2 * s, y - 20 * s + float); ctx.quadraticCurveTo(x - 12 * s, y - 25 * s + float, x - 8 * s, y - 13 * s + float); ctx.fill();
      ctx.beginPath(); ctx.moveTo(x + 2 * s, y - 20 * s + float); ctx.quadraticCurveTo(x + 12 * s, y - 25 * s + float, x + 8 * s, y - 13 * s + float); ctx.fill();
      eye(ctx, x + 5 * s, y - 20 * s + float, 1 * s, colors[1]);
      break;
    }
    case 'orb': {
      glowCircle(ctx, x, y - 18 * s + float, 24 * s, colors[0], 0.3);
      ctx.fillStyle = colors[1];
      ctx.beginPath(); ctx.arc(x, y - 18 * s + float, 8 * s, 0, TAU); ctx.fill();
      eye(ctx, x, y - 18 * s + float, 4 * s, colors[0]);
      break;
    }
    case 'angel': {
      glowCircle(ctx, x, y - 22 * s + float, 24 * s, colors[0], 0.2);
      ctx.fillStyle = colors[1];
      ctx.beginPath(); ctx.moveTo(x - 4 * s, y - 24 * s + float); ctx.quadraticCurveTo(x - 18 * s, y - 32 * s + float, x - 14 * s, y - 12 * s + float); ctx.fill();
      ctx.beginPath(); ctx.moveTo(x + 4 * s, y - 24 * s + float); ctx.quadraticCurveTo(x + 18 * s, y - 32 * s + float, x + 14 * s, y - 12 * s + float); ctx.fill();
      ctx.fillStyle = colors[0];
      ctx.beginPath(); ctx.ellipse(x, y - 16 * s + float, 5 * s, 10 * s, 0, 0, TAU); ctx.fill();
      ctx.beginPath(); ctx.arc(x, y - 28 * s + float, 4 * s, 0, TAU); ctx.fill();
      break;
    }
    case 'eye': {
      glowCircle(ctx, x, y - 18 * s + float, 22 * s, colors[0], 0.3);
      ctx.fillStyle = colors[2];
      ctx.beginPath(); ctx.arc(x, y - 18 * s + float, 10 * s, 0, TAU); ctx.fill();
      ctx.fillStyle = colors[1];
      ctx.beginPath(); ctx.ellipse(x, y - 18 * s + float, 7 * s, 4.5 * s, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = '#0a0610';
      ctx.beginPath(); ctx.arc(x, y - 18 * s + float, 3 * s, 0, TAU); ctx.fill();
      break;
    }
    case 'spirit': {
      glowCircle(ctx, x, y - 18 * s + float, 28 * s, colors[0], 0.28);
      ctx.fillStyle = colors[0];
      ctx.beginPath(); ctx.ellipse(x, y - 16 * s + float, 11 * s, 8 * s, 0, 0, TAU); ctx.fill();
      ctx.beginPath(); ctx.arc(x + 8 * s, y - 23 * s + float, 5 * s, 0, TAU); ctx.fill();
      ctx.beginPath(); ctx.moveTo(x + 5 * s, y - 28 * s + float); ctx.lineTo(x + 3 * s, y - 34 * s + float); ctx.lineTo(x + 8 * s, y - 29 * s + float); ctx.fill();
      ctx.beginPath(); ctx.moveTo(x + 11 * s, y - 28 * s + float); ctx.lineTo(x + 12 * s, y - 34 * s + float); ctx.lineTo(x + 14 * s, y - 27 * s + float); ctx.fill();
      eye(ctx, x + 9 * s, y - 23 * s + float, 1.4 * s, '#4a7a8a');
      ctx.strokeStyle = colors[1]; ctx.lineWidth = 2 * s;
      ctx.beginPath(); ctx.moveTo(x - 10 * s, y - 14 * s + float); ctx.quadraticCurveTo(x - 24 * s, y - 10 * s + float, x - 20 * s, y - 26 * s + float); ctx.stroke();
      break;
    }
    default: {
      glowCircle(ctx, x, y - 14 * s + float, 18 * s, colors[0], 0.2);
      ctx.fillStyle = colors[0];
      ctx.beginPath(); ctx.arc(x, y - 14 * s + float, 8 * s, 0, TAU); ctx.fill();
      break;
    }
  }
}

export function drawCompanion(ctx, comp, time) {
  drawCreature(ctx, comp.id, comp.x, comp.y, comp.temp ? 0.95 : 0.82, time + comp.animTime);
  comp.drawHealthRing(ctx);
}
