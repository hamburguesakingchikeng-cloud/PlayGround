import * as THREE from 'three';
import { createHero, poseHero } from './character.js';
import { clamp, damp, dampAngle, dist2D, mulberry32, noise2D } from '../core/utils.js';

const mat = (color, opts = {}) => new THREE.MeshStandardMaterial({
  color: new THREE.Color(color),
  roughness: opts.roughness ?? 0.78,
  metalness: opts.metalness ?? 0.15,
  emissive: new THREE.Color(opts.emissive || '#000000'),
  emissiveIntensity: opts.emissiveIntensity ?? 1,
  flatShading: opts.flat ?? false,
  transparent: opts.transparent ?? false,
  opacity: opts.opacity ?? 1,
  side: opts.side ?? THREE.FrontSide,
});

function m(geo, material, pos = [0, 0, 0], rot = [0, 0, 0], scale = [1, 1, 1]) {
  const mesh = new THREE.Mesh(geo, material);
  mesh.position.set(...pos);
  mesh.rotation.set(...rot);
  mesh.scale.set(...scale);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

const REGION_ENEMY = {
  valdoria: { dark: '#20222b', cloth: '#3a3536', metal: '#4b4d52', glow: '#c58cff', eye: '#e8b7ff', accent: '#7a4f9e' },
  drakmore: { dark: '#241a1b', cloth: '#452520', metal: '#57433c', glow: '#ff7336', eye: '#ffd19a', accent: '#ff5c2d' },
  kansordore: { dark: '#211f33', cloth: '#343052', metal: '#6a6282', glow: '#c7b2ff', eye: '#f0e7ff', accent: '#8b78c9' },
};

function createHumanoid(type, region, boss = false) {
  const pal = REGION_ENEMY[region] || REGION_ENEMY.valdoria;
  const group = new THREE.Group();
  const outfit = { primary: pal.cloth, secondary: pal.dark, trim: pal.metal, metal: pal.metal };
  const actor = createHero({ skin: '#514b50', hairColor: pal.dark, hairStyle: 'wild', outfit });
  actor.scale.setScalar(boss ? 1.85 : 1.04);
  const rig = actor.userData.rig;
  rig.sword.visible = false;
  rig.aura.visible = false;
  // remove heroic circlet glow and face warmth
  rig.materials.eyeMat.color.set('#160f18');
  rig.materials.eyeMat.emissive.set(pal.eye);
  rig.materials.eyeMat.emissiveIntensity = 2.4;
  rig.materials.glowMat.color.set(pal.glow);
  rig.materials.glowMat.opacity = 0.95;
  // darken skin, add cracks
  rig.materials.skinMat.color.set('#4b4148');
  rig.materials.skinMat.roughness = 0.9;
  // horns
  const hornMat = mat('#2d282d', { roughness: 0.7, metalness: 0.2 });
  for (const s of [-1, 1]) {
    const horn = m(new THREE.ConeGeometry(boss ? 0.09 : 0.055, boss ? 0.62 : 0.38, 6), hornMat, [s * 0.15, 0.18, 0.01], [0.1, 0, s * -0.45]);
    rig.head.add(horn);
  }
  // shoulder spikes
  for (const s of [-1, 1]) {
    rig.torso.add(m(new THREE.ConeGeometry(boss ? 0.11 : 0.06, boss ? 0.48 : 0.28, 5), hornMat, [s * 0.38, 0.24, 0], [0, 0, s * -0.4]));
  }
  // glowing chest crack
  const crackMat = new THREE.MeshBasicMaterial({ color: pal.glow, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending });
  const crack = m(new THREE.BoxGeometry(0.035, boss ? 0.42 : 0.24, 0.02), crackMat, [0.02, 0.05, boss ? 0.25 : 0.205]);
  crack.rotation.z = 0.35;
  rig.torso.add(crack);
  const crack2 = m(new THREE.BoxGeometry(0.025, boss ? 0.2 : 0.14, 0.02), crackMat, [-0.08, -0.02, boss ? 0.25 : 0.205]);
  crack2.rotation.z = -0.6;
  rig.torso.add(crack2);
  // dark sword
  const sword = new THREE.Group();
  const bladeMat = mat(pal.metal, { metalness: 0.8, roughness: 0.28, emissive: pal.glow, emissiveIntensity: 0.4 });
  const blade = m(new THREE.BoxGeometry(boss ? 0.2 : 0.1, boss ? 1.9 : 1.25, boss ? 0.05 : 0.035), bladeMat, [0, boss ? 1.0 : 0.68, 0]);
  sword.add(blade);
  const tip = m(new THREE.ConeGeometry(boss ? 0.1 : 0.05, boss ? 0.35 : 0.25, 4), bladeMat, [0, boss ? 1.95 : 1.3, 0], [0, 0, Math.PI / 4]);
  sword.add(tip);
  sword.add(m(new THREE.BoxGeometry(boss ? 0.65 : 0.42, 0.08, 0.11), mat(pal.metal, { metalness: 0.8 }), [0, boss ? 0.05 : 0.04, 0]));
  sword.add(m(new THREE.CylinderGeometry(0.04, 0.045, 0.35, 6), mat('#2b2020'), [0, boss ? -0.13 : -0.12, 0]));
  sword.position.set(0, -0.7, 0.02);
  sword.rotation.x = Math.PI;
  rig.rightArm.add(sword);
  rig.sword = sword;
  // crown for boss
  if (boss) {
    const crown = new THREE.Group();
    crown.position.y = 0.18;
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2;
      crown.add(m(new THREE.ConeGeometry(0.05, 0.25, 4), mat('#c39b52', { metalness: 0.85, roughness: 0.28 }), [Math.cos(a) * 0.16, 0.1, Math.sin(a) * 0.16]));
    }
    crown.add(m(new THREE.TorusGeometry(0.17, 0.018, 4, 16), mat('#c39b52', { metalness: 0.9, roughness: 0.2 }), [0, 0, 0], [Math.PI / 2, 0, 0]));
    rig.head.add(crown);
  }
  group.add(actor);
  group.userData = { type: 'enemy', kind: type, actor, rig, boss, pal, phase: 0 };
  return group;
}

function createWraith(region, elite = false) {
  const pal = REGION_ENEMY[region] || REGION_ENEMY.valdoria;
  const group = new THREE.Group();
  const body = new THREE.Group();
  group.add(body);
  const cloth = mat(pal.dark, { transparent: true, opacity: 0.9, side: THREE.DoubleSide, roughness: 0.95 });
  const cloth2 = mat(pal.cloth, { transparent: true, opacity: 0.85, side: THREE.DoubleSide });
  const glow = new THREE.MeshBasicMaterial({ color: pal.glow, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending });
  const eye = new THREE.MeshBasicMaterial({ color: pal.eye, transparent: true, opacity: 0.95, blending: THREE.AdditiveBlending });
  body.add(m(new THREE.ConeGeometry(0.55, 1.8, 7, 1, true), cloth, [0, 1.0, 0]));
  body.add(m(new THREE.ConeGeometry(0.42, 1.35, 7, 1, true), cloth2, [0, 1.15, 0.05], [0, 0.3, 0]));
  body.add(m(new THREE.SphereGeometry(0.26, 12, 9), cloth, [0, 1.9, 0.02]));
  body.add(m(new THREE.SphereGeometry(0.2, 10, 8), mat('#0c0b11'), [0, 1.87, 0.14], [0, 0, 0], [1, 1.1, 0.55]));
  body.add(m(new THREE.SphereGeometry(0.03, 6, 4), eye, [-0.07, 1.91, 0.31]));
  body.add(m(new THREE.SphereGeometry(0.03, 6, 4), eye, [0.07, 1.91, 0.31]));
  body.add(m(new THREE.TorusGeometry(0.34, 0.012, 4, 20), glow, [0, 1.9, 0.02], [Math.PI / 2, 0, 0]));
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    body.add(m(new THREE.ConeGeometry(0.04, 0.45, 4), cloth2, [Math.cos(a) * 0.28, 0.35, Math.sin(a) * 0.28], [Math.sin(a) * 0.4, 0, Math.cos(a) * 0.4]));
  }
  if (elite) {
    body.add(m(new THREE.TorusGeometry(0.5, 0.018, 4, 28), glow, [0, 0.5, 0], [Math.PI / 2, 0, 0]));
    body.scale.setScalar(1.2);
  }
  group.userData = { type: 'enemy', kind: 'wraith', actor: body, boss: false, pal, phase: 0, elite };
  return group;
}

function createGolem(region, elite = false) {
  const pal = REGION_ENEMY[region] || REGION_ENEMY.valdoria;
  const group = new THREE.Group();
  const body = new THREE.Group();
  group.add(body);
  const rock = mat(pal.metal, { roughness: 0.98, flat: true });
  const rockDark = mat(pal.dark, { roughness: 1, flat: true });
  const glow = new THREE.MeshBasicMaterial({ color: pal.glow, transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending });
  body.add(m(new THREE.DodecahedronGeometry(0.65, 0), rock, [0, 1.0, 0], [0, 0.4, 0], [1.1, 1.2, 0.8]));
  body.add(m(new THREE.DodecahedronGeometry(0.36, 0), rockDark, [0, 1.75, 0], [0.2, 0, 0]));
  body.add(m(new THREE.BoxGeometry(0.15, 0.08, 0.05), glow, [-0.12, 1.78, 0.32]));
  body.add(m(new THREE.BoxGeometry(0.15, 0.08, 0.05), glow, [0.12, 1.78, 0.32]));
  for (const s of [-1, 1]) {
    body.add(m(new THREE.DodecahedronGeometry(0.24, 0), rock, [s * 0.75, 1.1, 0], [0, 0, s * 0.3], [1, 1.4, 1]));
    body.add(m(new THREE.DodecahedronGeometry(0.2, 0), rockDark, [s * 0.42, 0.35, 0]));
    body.add(m(new THREE.BoxGeometry(0.08, 0.65, 0.08), glow, [s * 0.55, 0.9, 0.1], [0, 0, s * 0.4]));
  }
  for (let i = 0; i < 4; i++) body.add(m(new THREE.ConeGeometry(0.08, 0.3, 4), glow, [0, 1.3 + i * 0.1, 0.42], [0, 0, 0]));
  if (elite) body.scale.setScalar(1.25);
  group.userData = { type: 'enemy', kind: 'golem', actor: body, boss: false, pal, phase: 0, elite };
  return group;
}

export function createEnemyMesh(type, region, elite = false, boss = false) {
  if (type === 'wraith') return createWraith(region, elite);
  if (type === 'golem') return createGolem(region, elite);
  return createHumanoid(type, region, boss);
}

export class Enemy {
  constructor({ type, region, x, z, elite = false, boss = false, chapter = 0, name, id, y = 0, bossType = null }) {
    this.id = id || `enemy-${Math.random().toString(36).slice(2, 8)}`;
    this.type = type;
    this.region = region;
    this.elite = elite;
    this.boss = boss;
    this.bossType = bossType;
    this.name = name || (boss ? 'Guardián' : type === 'wraith' ? 'Espectro de Ceniza' : type === 'golem' ? 'Gólem del Velo' : 'Corrupto');
    this.level = 1 + chapter * 3 + (elite ? 2 : 0) + (boss ? 5 : 0);
    const scale = 1 + chapter * 0.55;
    const baseHp = type === 'wraith' ? 42 : type === 'golem' ? 88 : 62;
    this.maxHp = Math.round((baseHp + (elite ? 40 : 0) + (boss ? 420 : 0)) * scale);
    this.hp = this.maxHp;
    this.damage = (type === 'wraith' ? 9 : type === 'golem' ? 14 : 11) * (1 + chapter * 0.32) * (elite ? 1.3 : 1) * (boss ? 1.45 : 1);
    this.speed = (type === 'wraith' ? 3.1 : type === 'golem' ? 2.2 : 3.6) * (boss ? 0.95 : 1);
    this.radius = boss ? 1.15 : type === 'golem' ? 0.8 : 0.55;
    this.aggro = boss ? 24 : type === 'wraith' ? 15 : 13;
    this.attackRange = type === 'wraith' ? 9 : boss ? 3.8 : 2.4;
    this.xp = Math.round((elite ? 42 : boss ? 280 : 18) * (1 + chapter * 0.55));
    this.mesh = createEnemyMesh(type, region, elite, boss);
    this.mesh.position.set(x, y, z);
    this.mesh.userData.enemy = this;
    this.spawn = { x, z };
    this.state = 'idle';
    this.stateTimer = 0;
    this.attackCooldown = 1.2 + Math.random();
    this.attackIndex = 0;
    this.stagger = 0;
    this.hitFlash = 0;
    this.deadTime = 0;
    this.phase = 0;
    this.wanderAngle = Math.random() * Math.PI * 2;
    this.wanderTimer = 0;
    this.active = false;
    this.telegraph = null;
    this.facing = Math.random() * Math.PI * 2;
    this.animPhase = 0;
    this.lastDamageSource = null;
    this.captureThreshold = 0.25;
    this.capturable = false;
    this.isBoss = boss;
  }

  get alive() { return this.state !== 'dead'; }
  get hpRatio() { return clamp(this.hp / this.maxHp, 0, 1); }

  update(dt, game) {
    if (this.state === 'dead') {
      this.deadTime += dt;
      this.mesh.position.y -= dt * 0.25;
      this.mesh.rotation.z += dt * 0.25;
      this.mesh.traverse((o) => {
        if (o.isMesh && o.material) {
          o.material.transparent = true;
          o.material.opacity = Math.max(0, 1 - this.deadTime * 0.65);
        }
      });
      if (this.deadTime > 1.8 && this.mesh.parent) game.scene.remove(this.mesh);
      return;
    }
    const player = game.player;
    const px = player.position.x, pz = player.position.z;
    const dist = Math.hypot(px - this.mesh.position.x, pz - this.mesh.position.z);
    this.active = this.active || dist < this.aggro;
    this.attackCooldown -= dt;
    this.hitFlash = Math.max(0, this.hitFlash - dt);
    this.animPhase += dt * (this.state === 'chase' ? this.speed * 1.8 : 1.2);
    if (this.stagger > 0) {
      this.stagger -= dt;
      this.state = 'stagger';
      this.updateVisual(dt, game, 0);
      if (this.stagger <= 0) this.state = 'chase';
      return;
    }

    if (this.state === 'idle') {
      this.wanderTimer -= dt;
      if (this.wanderTimer <= 0) {
        this.wanderTimer = 2 + Math.random() * 3;
        this.wanderAngle = Math.random() * Math.PI * 2;
      }
      if (dist < this.aggro) {
        this.state = 'chase';
        game.onEnemyAggro?.(this);
      } else {
        const tx = this.spawn.x + Math.cos(this.wanderAngle) * 1.5;
        const tz = this.spawn.z + Math.sin(this.wanderAngle) * 1.5;
        if (Math.hypot(tx - this.mesh.position.x, tz - this.mesh.position.z) > 0.5) {
          this.moveTowards(tx, tz, this.speed * 0.22, dt, game);
        }
        this.updateVisual(dt, game, 0.2);
        return;
      }
    }

    if (this.state === 'chase') {
      if (dist > this.aggro * 1.8) {
        this.state = 'idle';
        this.updateVisual(dt, game, 0);
        return;
      }
      this.faceTowards(px, pz, dt, 7);
      if (this.attackCooldown <= 0 && dist <= this.attackRange) {
        this.state = 'windup';
        this.stateTimer = this.boss ? 0.65 : 0.55;
        this.attackIndex++;
        game.audio.arrow?.();
        this.showTelegraph(game, this.boss ? 4.5 : this.attackRange + 0.5);
      } else {
        const stopDistance = this.type === 'wraith' ? 6.5 : this.attackRange * 0.78;
        if (dist > stopDistance) this.moveTowards(px, pz, this.speed, dt, game);
        else if (this.type === 'wraith') this.strafe(dt, game);
        this.updateVisual(dt, game, 1);
      }
    } else if (this.state === 'windup') {
      this.stateTimer -= dt;
      this.faceTowards(px, pz, dt, 5);
      this.updateVisual(dt, game, 0.1);
      if (this.stateTimer <= 0) {
        this.strike(game, dist);
        this.state = 'recover';
        this.stateTimer = this.boss ? 0.9 : 0.65;
        this.attackCooldown = this.boss ? 1.0 + Math.random() * 0.8 : 1.5 + Math.random();
      }
    } else if (this.state === 'recover') {
      this.stateTimer -= dt;
      this.updateVisual(dt, game, 0);
      if (this.stateTimer <= 0) this.state = 'chase';
    }

    // boss phase
    if (this.boss && this.phase === 0 && this.hpRatio < 0.55) {
      this.phase = 1;
      this.speed *= 1.22;
      this.damage *= 1.18;
      game.onBossPhase?.(this);
    }
  }

  moveTowards(tx, tz, speed, dt, game) {
    const dx = tx - this.mesh.position.x, dz = tz - this.mesh.position.z;
    const d = Math.hypot(dx, dz);
    if (d < 0.01) return;
    const nx = dx / d, nz = dz / d;
    let mx = this.mesh.position.x + nx * speed * dt;
    let mz = this.mesh.position.z + nz * speed * dt;
    for (const c of game.world.colliders) {
      const dx2 = mx - c.x, dz2 = mz - c.z;
      const dd = Math.hypot(dx2, dz2);
      if (dd < c.r + this.radius * 0.7) {
        const push = (c.r + this.radius * 0.7 - dd) / Math.max(dd, 0.001);
        mx += dx2 * push;
        mz += dz2 * push;
      }
    }
    const maxR = game.world.bounds;
    if (Math.hypot(mx, mz) > maxR) {
      const k = maxR / Math.hypot(mx, mz);
      mx *= k; mz *= k;
    }
    this.mesh.position.x = mx;
    this.mesh.position.z = mz;
    this.mesh.position.y = game.world.heightAt(mx, mz);
  }

  strafe(dt, game) {
    const a = Math.atan2(game.player.position.x - this.mesh.position.x, game.player.position.z - this.mesh.position.z);
    const side = this.attackIndex % 2 ? 1 : -1;
    this.moveTowards(this.mesh.position.x + Math.cos(a) * side * 4, this.mesh.position.z - Math.sin(a) * side * 4, this.speed * 0.5, dt, game);
  }

  faceTowards(tx, tz, dt, speed) {
    const target = Math.atan2(tx - this.mesh.position.x, tz - this.mesh.position.z);
    this.facing = dampAngle(this.facing, target, speed, dt);
    this.mesh.rotation.y = this.facing;
  }

  showTelegraph(game, radius) {
    const color = this.boss ? '#ff5d4e' : this.type === 'wraith' ? '#c28bff' : '#ff9a62';
    const geo = new THREE.RingGeometry(0.25, radius, 40);
    const material = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.45, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending });
    const ring = new THREE.Mesh(geo, material);
    ring.rotation.x = -Math.PI / 2;
    ring.position.set(this.mesh.position.x, game.world.heightAt(this.mesh.position.x, this.mesh.position.z) + 0.08, this.mesh.position.z);
    game.scene.add(ring);
    this.telegraph = { mesh: ring, life: this.boss ? 0.65 : 0.55, maxLife: this.boss ? 0.65 : 0.55, radius };
  }

  strike(game, dist) {
    const player = game.player;
    const d = dist2D(this.mesh.position, player.position);
    if (this.type === 'wraith') {
      const dir = new THREE.Vector3(player.position.x - this.mesh.position.x, 0, player.position.z - this.mesh.position.z).normalize();
      game.spawnEnemyProjectile({
        x: this.mesh.position.x, y: this.mesh.position.y + 1.45, z: this.mesh.position.z,
        dir, damage: this.damage * 0.85, color: this.boss ? '#ff8a62' : '#c79bff', speed: 10,
        radius: 0.45,
      });
      game.audio.arrow();
    } else if (this.boss) {
      if (this.attackIndex % 3 === 0) {
        game.spawnShockwave({ x: this.mesh.position.x, z: this.mesh.position.z, radius: 5.4, damage: this.damage * 1.25, color: '#ff7b5e', delay: 0.18 });
      } else if (this.attackIndex % 3 === 1) {
        // dash
        const dx = player.position.x - this.mesh.position.x, dz = player.position.z - this.mesh.position.z;
        const len = Math.hypot(dx, dz) || 1;
        const tx = this.mesh.position.x + dx / len * 4.4;
        const tz = this.mesh.position.z + dz / len * 4.4;
        game.spawnSlashTrail(this.mesh.position, this.facing, '#ff7b5e', 1.7);
        this.mesh.position.x = tx; this.mesh.position.z = tz;
        this.mesh.position.y = game.world.heightAt(tx, tz);
        if (Math.hypot(player.position.x - tx, player.position.z - tz) < 2.8) game.damagePlayer(this.damage * 1.1, this);
        game.shake(0.3);
      } else {
        for (let i = -1; i <= 1; i++) {
          const a = this.facing + i * 0.3;
          game.spawnEnemyProjectile({
            x: this.mesh.position.x, y: this.mesh.position.y + 1.8, z: this.mesh.position.z,
            dir: new THREE.Vector3(Math.sin(a), 0, Math.cos(a)), damage: this.damage * 0.7, color: '#ff9a62', speed: 9, radius: 0.55,
          });
        }
      }
      game.audio.bossRoar?.();
    } else if (d < this.attackRange + 0.7) {
      game.damagePlayer(this.damage, this);
      game.spawnSlashTrail(this.mesh.position, this.facing, this.elite ? '#ffb35c' : '#c49bff', 1.1);
    }
    if (this.telegraph) {
      game.scene.remove(this.telegraph.mesh);
      this.telegraph.mesh.geometry.dispose();
      this.telegraph.mesh.material.dispose();
      this.telegraph = null;
    }
  }

  updateVisual(dt, game, move) {
    const kind = this.mesh.userData.kind;
    if (kind === 'wraith' || kind === 'golem') {
      const actor = this.mesh.userData.actor;
      actor.position.y = Math.sin(this.animPhase * 2.1) * 0.08 + (kind === 'wraith' ? 0.22 : 0);
      actor.rotation.z = Math.sin(this.animPhase * 1.3) * 0.04;
      if (this.state === 'windup') actor.rotation.x = -0.22;
      else if (this.state === 'stagger') actor.rotation.x = 0.3;
      if (kind === 'golem' && move > 0) actor.rotation.z = Math.sin(this.animPhase * 4) * 0.07;
    } else if (this.mesh.userData.actor) {
      poseHero(this.mesh.userData.actor, {
        speed: move * (this.state === 'chase' ? 1 : 0),
        runPhase: this.animPhase,
        attack: this.state === 'windup' ? clamp(1 - this.stateTimer / (this.boss ? 0.65 : 0.55), 0, 1) : 0,
        attackType: this.boss ? 'heavy' : 'light',
        combo: this.attackIndex,
        hurt: this.hitFlash,
        dead: 0,
      }, dt, game.time + this.animPhase * 0.1);
    }
    if (this.telegraph) {
      this.telegraph.life -= dt;
      const t = clamp(1 - this.telegraph.life / this.telegraph.maxLife, 0, 1);
      this.telegraph.mesh.scale.setScalar(0.35 + t * 0.75);
      this.telegraph.mesh.material.opacity = 0.15 + t * 0.5;
      if (this.telegraph.life <= 0) {
        game.scene.remove(this.telegraph.mesh);
        this.telegraph.mesh.geometry.dispose();
        this.telegraph.mesh.material.dispose();
        this.telegraph = null;
      }
    }
    if (this.hitFlash > 0 && this.mesh.userData.rig) {
      const rig = this.mesh.userData.rig;
      rig.materials.cloth.emissive.set('#ff8a62');
      rig.materials.cloth.emissiveIntensity = 0.55;
    } else if (this.mesh.userData.rig) {
      this.mesh.userData.rig.materials.cloth.emissiveIntensity = 0;
    }
  }

  takeDamage(amount, game, crit = false) {
    if (this.state === 'dead') return 0;
    this.hp -= amount;
    this.hitFlash = 0.18;
    this.active = true;
    if (this.state === 'idle') this.state = 'chase';
    if (this.boss) {
      this.state = 'stagger';
      this.stagger = 0.18;
    } else if (crit || amount > 30) {
      this.state = 'stagger';
      this.stagger = 0.32;
    }
    game.spawnHitSparks(this.mesh.position, crit ? '#ffd08a' : '#ffb18a', crit ? 18 : 10);
    game.audio.hit(crit);
    game.damageNumber(this.mesh.position, Math.round(amount), crit);
    if (this.hp <= 0) {
      this.hp = 0;
      this.die(game);
      return amount;
    }
    if (this.hpRatio < this.captureThreshold && !this.boss) {
      this.capturable = true;
      game.onEnemyWeakened?.(this);
    }
    return amount;
  }

  die(game) {
    this.state = 'dead';
    this.deadTime = 0;
    this.capturable = false;
    if (this.telegraph) {
      game.scene.remove(this.telegraph.mesh);
      this.telegraph.mesh.geometry.dispose();
      this.telegraph.mesh.material.dispose();
      this.telegraph = null;
    }
    game.onEnemyKilled?.(this);
  }
}
