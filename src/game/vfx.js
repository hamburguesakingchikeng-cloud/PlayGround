import * as THREE from 'three';
import { radialTexture, clamp } from '../core/utils.js';

export class VFX {
  constructor(scene) {
    this.scene = scene;
    this.effects = [];
    this.sparkTexture = radialTexture(64, 'rgba(255,255,255,1)', 'rgba(255,255,255,0)');
  }

  clear() {
    for (const e of this.effects) {
      this.scene.remove(e.object);
      e.object.traverse?.((o) => {
        o.geometry?.dispose?.();
        if (o.material) {
          if (o.material.map && o.material.map !== this.sparkTexture) o.material.map.dispose?.();
          o.material.dispose?.();
        }
      });
    }
    this.effects = [];
  }

  slash(position, facing, color = '#c9f4ea', scale = 1) {
    const group = new THREE.Group();
    const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.95, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false });
    const geo = new THREE.RingGeometry(0.55 * scale, 1.45 * scale, 28, 1, -0.95, 1.9);
    const ring = new THREE.Mesh(geo, mat);
    ring.position.set(0, 1.15, 1.05 * scale);
    ring.rotation.z = 0.2;
    group.add(ring);
    const mat2 = new THREE.MeshBasicMaterial({ color: '#fff6d6', transparent: true, opacity: 0.7, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false });
    const ring2 = new THREE.Mesh(new THREE.RingGeometry(0.62 * scale, 0.68 * scale, 28, 1, -0.95, 1.9), mat2);
    ring2.position.copy(ring.position);
    ring2.rotation.z = 0.2;
    group.add(ring2);
    group.position.set(position.x, position.y + 0.2, position.z);
    group.rotation.y = facing;
    this.scene.add(group);
    this.effects.push({ type: 'slash', object: group, life: 0.32, max: 0.32, mats: [mat, mat2] });
  }

  hitSparks(position, color = '#ffb18a', count = 10) {
    const positions = new Float32Array(count * 3);
    const velocities = [];
    for (let i = 0; i < count; i++) {
      positions[i * 3] = position.x + (Math.random() - 0.5) * 0.3;
      positions[i * 3 + 1] = position.y + 1 + (Math.random() - 0.5) * 0.5;
      positions[i * 3 + 2] = position.z + (Math.random() - 0.5) * 0.3;
      velocities.push(new THREE.Vector3((Math.random() - 0.5) * 4, 1.5 + Math.random() * 3, (Math.random() - 0.5) * 4));
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const mat = new THREE.PointsMaterial({ color, size: 0.12, transparent: true, opacity: 0.95, blending: THREE.AdditiveBlending, depthWrite: false, map: this.sparkTexture });
    const points = new THREE.Points(geo, mat);
    this.scene.add(points);
    this.effects.push({ type: 'sparks', object: points, velocities, life: 0.55, max: 0.55, mat });
  }

  shockwave({ x, z, y = 0.1, radius, color = '#ff7b5e', delay = 0, onHit }) {
    const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.6, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false });
    const ring = new THREE.Mesh(new THREE.RingGeometry(0.4, 0.7, 48), mat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.set(x, y, z);
    this.scene.add(ring);
    this.effects.push({ type: 'shockwave', object: ring, life: 0.8 + delay, max: 0.8 + delay, delay, radius, mat, onHit, fired: false, x, z });
  }

  heal(position) {
    const group = new THREE.Group();
    const mat = new THREE.MeshBasicMaterial({ color: '#9ce7ac', transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, depthWrite: false });
    for (let i = 0; i < 3; i++) {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.45 + i * 0.18, 0.012, 4, 28), mat);
      ring.rotation.x = Math.PI / 2;
      ring.position.y = 0.2 + i * 0.28;
      group.add(ring);
    }
    group.position.set(position.x, position.y, position.z);
    this.scene.add(group);
    this.effects.push({ type: 'heal', object: group, life: 1.0, max: 1.0, mat });
  }

  block(position, facing, perfect = false) {
    const mat = new THREE.MeshBasicMaterial({ color: perfect ? '#fff2be' : '#bceee6', transparent: true, opacity: 0.9, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false });
    const ring = new THREE.Mesh(new THREE.RingGeometry(0.5, 0.62, 20, 1, -0.9, 1.8), mat);
    ring.position.set(position.x + Math.sin(facing) * 0.8, position.y + 1.15, position.z + Math.cos(facing) * 0.8);
    ring.rotation.y = facing;
    ring.rotation.z = 0.2;
    this.scene.add(ring);
    this.effects.push({ type: 'block', object: ring, life: 0.3, max: 0.3, mat });
  }

  capture(position, color = '#91e7df') {
    const group = new THREE.Group();
    const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, depthWrite: false });
    for (let i = 0; i < 4; i++) {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.5 + i * 0.35, 0.018, 4, 32), mat);
      ring.rotation.x = Math.PI / 2 + i * 0.15;
      ring.rotation.z = i * 0.4;
      group.add(ring);
    }
    group.position.set(position.x, position.y + 0.8, position.z);
    this.scene.add(group);
    this.effects.push({ type: 'capture', object: group, life: 1.4, max: 1.4, mat });
  }

  beam(from, to, color = '#91e7df') {
    const start = new THREE.Vector3(from.x, from.y + 1.2, from.z);
    const end = new THREE.Vector3(to.x, to.y + 1.1, to.z);
    const mid = start.clone().add(end).multiplyScalar(0.5);
    mid.y += 1.8;
    const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
    const geo = new THREE.TubeGeometry(curve, 20, 0.045, 5, false);
    const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false });
    const tube = new THREE.Mesh(geo, mat);
    this.scene.add(tube);
    this.effects.push({ type: 'beam', object: tube, life: 0.55, max: 0.55, mat });
  }

  dust(position, color = '#d8c49a', count = 8) {
    const positions = new Float32Array(count * 3);
    const velocities = [];
    for (let i = 0; i < count; i++) {
      positions[i * 3] = position.x + (Math.random() - 0.5) * 0.6;
      positions[i * 3 + 1] = position.y + 0.2;
      positions[i * 3 + 2] = position.z + (Math.random() - 0.5) * 0.6;
      velocities.push(new THREE.Vector3((Math.random() - 0.5) * 2.2, 0.8 + Math.random() * 1.2, (Math.random() - 0.5) * 2.2));
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const mat = new THREE.PointsMaterial({ color, size: 0.18, transparent: true, opacity: 0.45, depthWrite: false, map: this.sparkTexture });
    const points = new THREE.Points(geo, mat);
    this.scene.add(points);
    this.effects.push({ type: 'dust', object: points, velocities, life: 0.8, max: 0.8, mat });
  }

  update(dt, game) {
    for (let i = this.effects.length - 1; i >= 0; i--) {
      const e = this.effects[i];
      e.life -= dt;
      const t = clamp(1 - e.life / e.max, 0, 1);
      if (e.type === 'slash') {
        e.object.rotation.z += dt * 2.4;
        e.object.scale.setScalar(1 + t * 0.18);
        e.mats.forEach((m) => { m.opacity = (1 - t) * 0.9; });
      } else if (e.type === 'sparks' || e.type === 'dust') {
        const pos = e.object.geometry.attributes.position;
        for (let j = 0; j < e.velocities.length; j++) {
          const v = e.velocities[j];
          v.y -= dt * 9;
          pos.setXYZ(j, pos.getX(j) + v.x * dt, pos.getY(j) + v.y * dt, pos.getZ(j) + v.z * dt);
        }
        pos.needsUpdate = true;
        e.mat.opacity = (1 - t) * 0.9;
      } else if (e.type === 'shockwave') {
        if (t < e.delay / e.max) {
          e.object.visible = false;
        } else {
          e.object.visible = true;
          const st = clamp((t - e.delay / e.max) / (1 - e.delay / e.max), 0, 1);
          e.object.scale.setScalar(1 + st * e.radius / 0.7);
          e.mat.opacity = (1 - st) * 0.65;
          if (!e.fired && st > 0.3) {
            e.fired = true;
            if (e.onHit) e.onHit();
          }
        }
      } else if (e.type === 'heal') {
        e.object.position.y += dt * 0.5;
        e.object.scale.setScalar(0.8 + t * 0.5);
        e.mat.opacity = (1 - t) * 0.8;
      } else if (e.type === 'block') {
        e.object.scale.setScalar(1 + t * 0.5);
        e.mat.opacity = (1 - t) * 0.9;
      } else if (e.type === 'capture') {
        e.object.rotation.y += dt * 3;
        e.object.scale.setScalar(1 + t * 0.6);
        e.mat.opacity = (1 - t) * 0.8;
      } else if (e.type === 'beam') {
        e.mat.opacity = (1 - t) * 0.9;
        e.object.scale.setScalar(1 + t * 0.1);
      }
      if (e.life <= 0) {
        this.scene.remove(e.object);
        e.object.traverse?.((o) => {
          o.geometry?.dispose?.();
          if (o.material && o.material.map !== this.sparkTexture) o.material.dispose?.();
        });
        this.effects.splice(i, 1);
      }
    }
  }
}

export class Projectile {
  constructor(scene, opts) {
    this.scene = scene;
    this.position = new THREE.Vector3(opts.x, opts.y, opts.z);
    this.dir = opts.dir.clone().normalize();
    this.speed = opts.speed || 10;
    this.damage = opts.damage || 10;
    this.color = opts.color || '#c79bff';
    this.radius = opts.radius || 0.4;
    this.life = opts.life || 3.2;
    this.hostile = opts.hostile !== false;
    this.owner = opts.owner || null;
    this.group = new THREE.Group();
    const core = new THREE.Mesh(new THREE.IcosahedronGeometry(this.radius, 1), new THREE.MeshBasicMaterial({ color: this.color }));
    this.group.add(core);
    const glowMat = new THREE.SpriteMaterial({ map: radialTexture(64, 'rgba(255,255,255,0.9)', 'rgba(255,255,255,0)'), color: this.color, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false });
    const glow = new THREE.Sprite(glowMat);
    glow.scale.set(this.radius * 5, this.radius * 5, 1);
    this.group.add(glow);
    this.group.position.copy(this.position);
    scene.add(this.group);
    this.trailTimer = 0;
  }

  update(dt, game) {
    this.life -= dt;
    this.position.addScaledVector(this.dir, this.speed * dt);
    this.group.position.copy(this.position);
    this.group.rotation.y += dt * 6;
    this.trailTimer -= dt;
    if (this.trailTimer <= 0) {
      this.trailTimer = 0.06;
      game.vfx.hitSparks({ x: this.position.x, y: this.position.y - 0.8, z: this.position.z }, this.color, 1);
    }
    if (this.hostile) {
      const p = game.player.position;
      if (Math.hypot(p.x - this.position.x, p.z - this.position.z) < 0.75 + this.radius && Math.abs((p.y + 1.1) - this.position.y) < 1.6) {
        game.player.takeDamage(this.damage, this.owner);
        this.destroy();
        return;
      }
    }
    if (this.position.y < game.world.heightAt(this.position.x, this.position.z) - 0.2) this.destroy();
    if (this.life <= 0) this.destroy();
  }

  destroy() {
    this.dead = true;
    this.scene.remove(this.group);
    this.group.traverse((o) => {
      o.geometry?.dispose?.();
      o.material?.map?.dispose?.();
      o.material?.dispose?.();
    });
  }
}
