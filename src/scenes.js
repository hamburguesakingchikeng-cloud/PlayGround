import * as THREE from 'three';
import {
  TAU, mulberry32, toonMaterial, standardMaterial, glowSprite, glowTexture,
  addGlow, box, cyl, sphere, cone, toonGradient,
} from './three-utils.js';
import { buildPlayer, buildSword } from './models.js';
import { APPEARANCE } from './data.js';

function skyDome(top, bottom, sunColor, sunDir, opts = {}) {
  const geo = new THREE.SphereGeometry(opts.radius || 120, 32, 20);
  const mat = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    fog: false,
    uniforms: {
      topColor: { value: new THREE.Color(top) },
      bottomColor: { value: new THREE.Color(bottom) },
      sunColor: { value: new THREE.Color(sunColor) },
      sunDir: { value: new THREE.Vector3(...sunDir).normalize() },
    },
    vertexShader: `
      varying vec3 vWorldPosition;
      void main() {
        vec4 worldPosition = modelMatrix * vec4(position, 1.0);
        vWorldPosition = worldPosition.xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 topColor;
      uniform vec3 bottomColor;
      uniform vec3 sunColor;
      uniform vec3 sunDir;
      varying vec3 vWorldPosition;
      void main() {
        vec3 dir = normalize(vWorldPosition);
        float h = max(0.0, dir.y);
        vec3 col = mix(bottomColor, topColor, pow(h, 0.72));
        float sun = pow(max(dot(dir, normalize(sunDir)), 0.0), 260.0);
        float halo = pow(max(dot(dir, normalize(sunDir)), 0.0), 8.0);
        col += sunColor * sun * 2.0 + sunColor * halo * 0.18;
        gl_FragColor = vec4(col, 1.0);
      }
    `,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.frustumCulled = false;
  return mesh;
}

function mountainSilhouette(scene, x, z, width, height, color) {
  const shape = new THREE.Shape();
  const rng = mulberry32(Math.floor(Math.abs(x * 13 + z * 7)) + 1);
  shape.moveTo(-width / 2, 0);
  const points = 9;
  for (let i = 0; i <= points; i++) {
    const px = -width / 2 + (width * i) / points;
    const py = i === 0 || i === points ? 0 : height * (0.25 + rng() * 0.75);
    shape.lineTo(px, py);
  }
  shape.lineTo(width / 2, 0);
  const geo = new THREE.ShapeGeometry(shape);
  const mat = new THREE.MeshBasicMaterial({ color, fog: false, side: THREE.DoubleSide });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(x, -2, z);
  scene.add(mesh);
  return mesh;
}

function floatingIsland(scene, x, y, z, s, seed = 1) {
  const rng = mulberry32(seed);
  const group = new THREE.Group();
  group.position.set(x, y, z);
  const rockMat = standardMaterial('#3b3a55', { roughness: 0.95 });
  const grassMat = toonMaterial('#5b7b54');
  const top = cyl(3.2 * s, 3.6 * s, 0.8 * s, grassMat, 8);
  top.position.y = 0;
  group.add(top);
  const bottom = new THREE.Mesh(new THREE.ConeGeometry(3.4 * s, 4.2 * s, 8), rockMat);
  bottom.position.y = -2.5 * s;
  bottom.rotation.y = Math.PI / 8;
  group.add(bottom);
  for (let i = 0; i < 7; i++) {
    const rock = new THREE.Mesh(new THREE.DodecahedronGeometry((0.3 + rng() * 0.8) * s, 0), rockMat);
    const a = rng() * TAU;
    const r = (1.4 + rng() * 2.2) * s;
    rock.position.set(Math.cos(a) * r, -1.2 * s - rng() * 2.2 * s, Math.sin(a) * r);
    rock.rotation.set(rng() * TAU, rng() * TAU, rng() * TAU);
    group.add(rock);
  }
  for (let i = 0; i < 5; i++) {
    const tree = new THREE.Group();
    const a = rng() * TAU;
    const r = rng() * 2.4 * s;
    tree.position.set(Math.cos(a) * r, 0.4 * s, Math.sin(a) * r);
    const trunk = cyl(0.08 * s, 0.14 * s, 1.4 * s, standardMaterial('#5b4131'), 5);
    trunk.position.y = 0.7 * s;
    tree.add(trunk);
    const canopy = new THREE.Mesh(new THREE.IcosahedronGeometry(0.75 * s, 0), toonMaterial(i % 2 ? '#6f8f5b' : '#7a9c66'));
    canopy.position.y = 1.7 * s;
    tree.add(canopy);
    group.add(tree);
  }
  addGlow(group, '#7ee8fa', 8 * s, [0, -0.6 * s, 0], 0.08);
  scene.add(group);
  return group;
}

export class TitleScene {
  constructor(renderer) {
    this.renderer = renderer;
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2('#0b1830', 0.008);
    this.camera = new THREE.PerspectiveCamera(42, 1, 0.1, 300);
    this.camera.position.set(0, 4.4, 17);
    this.time = 0;
    this.build();
  }

  build() {
    this.scene.add(skyDome('#07152e', '#ef9f6f', '#ffd9a0', [0.25, 0.3, -1], { radius: 160 }));
    const sun = glowSprite('#ffd9a0', 26, 0.55);
    sun.position.set(34, 28, -95);
    this.scene.add(sun);

    // stars
    const rng = mulberry32(31);
    const positions = [];
    for (let i = 0; i < 500; i++) {
      const theta = rng() * TAU;
      const phi = Math.acos(rng() * 0.8);
      const r = 150;
      positions.push(r * Math.sin(phi) * Math.cos(theta), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(theta));
    }
    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    this.stars = new THREE.Points(starGeo, new THREE.PointsMaterial({
      color: '#d8ecff', size: 0.9, transparent: true, opacity: 0.55, depthWrite: false, blending: THREE.AdditiveBlending,
    }));
    this.scene.add(this.stars);

    for (let i = 0; i < 5; i++) {
      const z = -65 - i * 16;
      mountainSilhouette(this.scene, -50 + i * 24, z, 80 + i * 20, 18 + i * 8, i % 2 ? '#172a46' : '#102039');
    }

    // ground cliff
    const cliff = new THREE.Mesh(
      new THREE.CylinderGeometry(24, 19, 7, 7),
      standardMaterial('#2b3146', { roughness: 1 }),
    );
    cliff.position.set(0, -5.5, 0);
    this.scene.add(cliff);
    const ground = new THREE.Mesh(new THREE.CircleGeometry(23, 32), toonMaterial('#3e4d4c'));
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -1.95;
    this.scene.add(ground);

    // broken ruin pillars framing the monument
    const stone = standardMaterial('#8b8578', { roughness: 0.9 });
    for (const s of [-1, 1]) {
      const h = s < 0 ? 5.2 : 4.1;
      const col = cyl(0.58, 0.82, h, stone, 6);
      col.position.set(s * 5.6, -1.4 + h / 2, -4.2);
      col.rotation.z = s * 0.045;
      this.scene.add(col);
      const cap = box(1.5, 0.4, 1.5, stone);
      cap.position.set(s * 5.6 + s * 0.1, -1.4 + h + 0.2, -4.2);
      cap.rotation.z = s * 0.05;
      this.scene.add(cap);
    }

    // sword monument
    const pedestal = new THREE.Group();
    pedestal.position.set(0, -1.7, 0.2);
    const base = cyl(2.1, 2.5, 0.7, stone, 8);
    base.position.y = 0.35;
    pedestal.add(base);
    const block = box(1.4, 1.0, 1.4, stone);
    block.position.y = 1.2;
    block.rotation.y = Math.PI / 4;
    pedestal.add(block);
    this.scene.add(pedestal);

    const sword = buildSword('espada_celestial', 3.1);
    sword.position.set(0, 0.55, 0.2);
    sword.rotation.set(0.08, 0.45, 0.02);
    this.scene.add(sword);
    this.sword = sword;
    addGlow(sword, '#fff0a8', 6, [0, 1.2, 0], 0.45);
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(4.4, 0.035, 4, 64),
      new THREE.MeshBasicMaterial({ color: '#f4d58d', transparent: true, opacity: 0.4, blending: THREE.AdditiveBlending }),
    );
    ring.position.set(0, 1.4, 0.2);
    ring.rotation.x = Math.PI / 2;
    this.scene.add(ring);
    this.ring = ring;

    floatingIsland(this.scene, -12, 7, -18, 1.25, 4);
    floatingIsland(this.scene, 14, 11, -28, 0.85, 9);
    floatingIsland(this.scene, 7, 2.2, -11, 0.45, 12);

    // foreground rocks / grass
    const rng2 = mulberry32(7);
    for (let i = 0; i < 24; i++) {
      const a = rng2() * TAU;
      const r = 9 + rng2() * 12;
      const rock = new THREE.Mesh(
        new THREE.DodecahedronGeometry(0.4 + rng2() * 1.1, 0),
        standardMaterial(rng2() > 0.5 ? '#3c4353' : '#4b4a52'),
      );
      rock.position.set(Math.cos(a) * r, -1.8 + rng2() * 0.4, Math.sin(a) * r);
      rock.rotation.set(rng2() * TAU, rng2() * TAU, rng2() * TAU);
      this.scene.add(rock);
    }

    // lights
    this.scene.add(new THREE.HemisphereLight('#9dc8ff', '#1b1a2c', 1.4));
    const key = new THREE.DirectionalLight('#ffd9a0', 2.6);
    key.position.set(12, 20, 12);
    this.scene.add(key);
    const rim = new THREE.DirectionalLight('#7ee8fa', 1.6);
    rim.position.set(-14, 8, -8);
    this.scene.add(rim);

    // particles
    this.particles = [];
    for (let i = 0; i < 90; i++) {
      const p = glowSprite(i % 3 ? '#ffd58a' : '#7ee8fa', 0.12 + rng2() * 0.28, 0.3 + rng2() * 0.5);
      p.position.set((rng2() - 0.5) * 30, rng2() * 14 - 1, (rng2() - 0.5) * 24);
      p.userData = { baseY: p.position.y, phase: rng2() * TAU, speed: 0.15 + rng2() * 0.4 };
      this.scene.add(p);
      this.particles.push(p);
    }

    this.clouds = [];
    for (let i = 0; i < 8; i++) {
      const c = new THREE.Sprite(new THREE.SpriteMaterial({
        map: glowTexture(), color: '#d5c5c0', transparent: true, opacity: 0.06, depthWrite: false,
      }));
      c.scale.set(30 + rng2() * 30, 8 + rng2() * 8, 1);
      c.position.set((rng2() - 0.5) * 120, 18 + rng2() * 18, -50 - rng2() * 50);
      this.scene.add(c);
      this.clouds.push(c);
    }
  }

  update(dt) {
    this.time += dt;
    const t = this.time;
    this.camera.position.x = Math.sin(t * 0.1) * 3.4;
    this.camera.position.y = 4.2 + Math.sin(t * 0.17) * 0.45;
    this.camera.position.z = 16.5 + Math.cos(t * 0.1) * 0.8;
    this.camera.lookAt(0, 2.2, 0);
    this.sword.rotation.y = 0.45 + Math.sin(t * 0.22) * 0.08;
    this.sword.userData.gem.rotation.y += dt * 0.9;
    this.ring.rotation.z += dt * 0.18;
    this.ring.material.opacity = 0.3 + Math.sin(t * 1.3) * 0.1;
    this.stars.rotation.y += dt * 0.004;
    for (const p of this.particles) {
      p.position.y = p.userData.baseY + Math.sin(t * p.userData.speed + p.userData.phase) * 1.8;
      p.material.opacity = 0.25 + Math.sin(t * 2 + p.userData.phase) * 0.2;
    }
    for (const c of this.clouds) c.position.x += dt * 0.2;
  }

  resize(w, h) {
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }
}

export class CharacterPreview {
  constructor(renderer) {
    this.renderer = renderer;
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2('#0b1228', 0.045);
    this.camera = new THREE.PerspectiveCamera(38, 1, 0.1, 60);
    this.camera.position.set(-1.5, 1.6, 5.6);
    this.time = 0;
    this.model = null;
    this.manualYaw = 0;
    this.build();
  }

  build() {
    this.scene.add(skyDome('#07152e', '#2a3b5e', '#ffd9a0', [0.2, 0.6, 1], { radius: 40 }));
    this.scene.add(new THREE.HemisphereLight('#b9dcff', '#1a1d2c', 1.3));
    const key = new THREE.DirectionalLight('#ffe2b0', 3.0);
    key.position.set(3, 5, 4);
    key.castShadow = true;
    key.shadow.mapSize.set(512, 512);
    this.scene.add(key);
    const rim = new THREE.DirectionalLight('#7ee8fa', 2.2);
    rim.position.set(-4, 3, -2);
    this.scene.add(rim);

    const platform = new THREE.Group();
    const base = cyl(1.5, 1.8, 0.22, standardMaterial('#3d4256', { metalness: 0.2, roughness: 0.7 }), 32);
    platform.add(base);
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(1.25, 0.025, 4, 64),
      new THREE.MeshBasicMaterial({ color: '#f4d58d', transparent: true, opacity: 0.65, blending: THREE.AdditiveBlending }),
    );
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 0.14;
    platform.add(ring);
    const inner = new THREE.Mesh(
      new THREE.RingGeometry(0.5, 1.1, 64),
      new THREE.MeshBasicMaterial({ color: '#7ee8fa', transparent: true, opacity: 0.12, side: THREE.DoubleSide, blending: THREE.AdditiveBlending }),
    );
    inner.rotation.x = -Math.PI / 2;
    inner.position.y = 0.16;
    platform.add(inner);
    this.platform = platform;
    this.scene.add(platform);

    this.particles = [];
    const rng = mulberry32(55);
    for (let i = 0; i < 45; i++) {
      const p = glowSprite(i % 2 ? '#ffd58a' : '#7ee8fa', 0.08 + rng() * 0.16, 0.4);
      p.position.set((rng() - 0.5) * 5, 0.3 + rng() * 4, (rng() - 0.5) * 4);
      p.userData = { baseY: p.position.y, phase: rng() * TAU };
      this.scene.add(p);
      this.particles.push(p);
    }
    this.ring = ring;
  }

  setProfile(profile) {
    if (this.model) this.scene.remove(this.model.group);
    const appearance = profile.appearance || {};
    this.model = buildPlayer(appearance, profile.weapon || 'filo_aurora', profile.armor || 'tunica_viajero', profile.headgear || 'ninguno');
    this.model.group.position.y = 0.0;
    this.model.group.rotation.y = 0;
    this.scene.add(this.model.group);
  }

  update(dt) {
    this.time += dt;
    const t = this.time;
    if (this.model) {
      this.model.pose.moving = 0;
      this.model.pose.time += dt;
      this.model.group.rotation.y = Math.sin(t * 0.35) * 0.22 + this.manualYaw;
      this.model.group.position.y = 0 + Math.sin(t * 1.2) * 0.01;
    }
    this.platform.rotation.y += dt * 0.08;
    this.ring.rotation.z += dt * 0.15;
    this.camera.position.x = -1.5 + Math.sin(t * 0.12) * 0.28;
    this.camera.lookAt(-1.5, 1.08, 0);
    for (const p of this.particles) {
      p.position.y = p.userData.baseY + Math.sin(t * 0.8 + p.userData.phase) * 0.35;
    }
  }

  resize(w, h) {
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }
}
