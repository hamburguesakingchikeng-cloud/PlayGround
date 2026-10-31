import * as THREE from 'three';
import { REGIONS } from './data.js';
import { createHero, poseHero, createCreature, animateCreature } from './character.js';
import {
  clamp, lerp, smoothstep, mulberry32, fbm, noise2D, dist2D,
  radialTexture, runeTexture, textureFromCanvas, makeCanvas, disposeObject,
} from '../core/utils.js';

const UP = new THREE.Vector3(0, 1, 0);

const PALETTE = {
  valdoria: {
    trunk: '#5b4735', trunkDark: '#443428', canopy: ['#3f6a3e', '#527b45', '#628a4c', '#759d59'],
    rock: '#73786a', flower: ['#f1d48a', '#e8a4b0', '#c4b2ed', '#f3f0df'], grass: ['#6d9255', '#7ba15e', '#8aac69'],
    accent: '#e6c37d', mist: '#c1d4c6',
  },
  drakmore: {
    trunk: '#332827', trunkDark: '#211b1c', canopy: ['#3c2a27', '#4b302a', '#5b372d'],
    rock: '#2b2728', flower: ['#ff7b3e', '#d94a32'], grass: ['#4b3b32', '#5b4236'],
    accent: '#ff8a4a', mist: '#6d3b35',
  },
  kansordore: {
    trunk: '#6c6688', trunkDark: '#4e4968', canopy: ['#8e87b5', '#a49bc7', '#b8abd3'],
    rock: '#8d88a5', flower: ['#d9cfff', '#9ee7e2', '#f3e1a8'], grass: ['#a7a2ba', '#bab3c8'],
    accent: '#bca3ee', mist: '#8b87b5',
  },
};

function makeMat(color, opts = {}) {
  return new THREE.MeshStandardMaterial({
    color: new THREE.Color(color),
    roughness: opts.roughness ?? 0.86,
    metalness: opts.metalness ?? 0.03,
    emissive: new THREE.Color(opts.emissive || '#000000'),
    emissiveIntensity: opts.emissiveIntensity ?? 1,
    flatShading: opts.flat ?? false,
    transparent: opts.transparent ?? false,
    opacity: opts.opacity ?? 1,
    side: opts.side ?? THREE.FrontSide,
  });
}

function mesh(geometry, material, pos = [0, 0, 0], rot = [0, 0, 0], scale = [1, 1, 1], shadow = true) {
  const m = new THREE.Mesh(geometry, material);
  m.position.set(...pos);
  m.rotation.set(...rot);
  m.scale.set(...scale);
  m.castShadow = shadow;
  m.receiveShadow = shadow;
  return m;
}

function distToSegment(px, pz, ax, az, bx, bz) {
  const vx = bx - ax, vz = bz - az;
  const wx = px - ax, wz = pz - az;
  const len2 = vx * vx + vz * vz;
  const t = len2 > 0 ? clamp((wx * vx + wz * vz) / len2, 0, 1) : 0;
  return Math.hypot(px - (ax + vx * t), pz - (az + vz * t));
}

function pathDistance(x, z, paths) {
  let min = Infinity;
  for (const seg of paths) min = Math.min(min, distToSegment(x, z, seg[0], seg[1], seg[2], seg[3]));
  return min;
}

function flatten(h, x, z, cx, cz, radius, target, blend = 7) {
  const d = Math.hypot(x - cx, z - cz);
  if (d > radius + blend) return h;
  const t = 1 - smoothstep(radius, radius + blend, d);
  return lerp(h, target, t);
}

function makeSky(region) {
  const group = new THREE.Group();
  const sunDir = new THREE.Vector3(...region.sun.position).normalize();
  const mat = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    fog: false,
    uniforms: {
      uTop: { value: new THREE.Color(region.sky.top) },
      uMid: { value: new THREE.Color(region.sky.mid) },
      uLow: { value: new THREE.Color(region.sky.low) },
      uSun: { value: new THREE.Color(region.sky.sun) },
      uSunDir: { value: sunDir },
      uTime: { value: 0 },
    },
    vertexShader: `
      varying vec3 vWorld;
      void main() {
        vec4 wp = modelMatrix * vec4(position, 1.0);
        vWorld = wp.xyz;
        gl_Position = projectionMatrix * viewMatrix * wp;
      }
    `,
    fragmentShader: `
      uniform vec3 uTop, uMid, uLow, uSun, uSunDir;
      uniform float uTime;
      varying vec3 vWorld;
      float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453); }
      void main() {
        vec3 dir = normalize(vWorld);
        float h = clamp(dir.y * 0.5 + 0.5, 0.0, 1.0);
        vec3 col = mix(uLow, uMid, smoothstep(0.42, 0.62, h));
        col = mix(col, uTop, smoothstep(0.58, 0.98, h));
        float sun = max(dot(dir, normalize(uSunDir)), 0.0);
        col += uSun * pow(sun, 150.0) * 1.9;
        col += uSun * pow(sun, 8.0) * 0.16;
        float band = sin(dir.y * 22.0 + sin(dir.x * 8.0 + uTime * 0.015) * 2.0) * 0.5 + 0.5;
        col += uLow * band * 0.018;
        gl_FragColor = vec4(col, 1.0);
      }
    `,
  });
  const sky = new THREE.Mesh(new THREE.SphereGeometry(400, 40, 24), mat);
  sky.renderOrder = -10;
  group.add(sky);
  group.userData.skyMat = mat;
  return group;
}

function makeWater(region, isLava = false) {
  const mat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: {
      uTime: { value: 0 },
      uColor: { value: new THREE.Color(region.water.color) },
      uEmissive: { value: new THREE.Color(region.water.emissive) },
      uLava: { value: isLava ? 1 : 0 },
    },
    vertexShader: `
      uniform float uTime;
      varying vec2 vUv;
      varying float vWave;
      void main() {
        vUv = uv;
        vec3 p = position;
        float wave = sin(p.x * 0.45 + uTime * 0.8) * 0.06 + cos(p.y * 0.4 + uTime * 0.55) * 0.05;
        p.z += wave;
        vWave = wave;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 uColor, uEmissive;
      uniform float uTime, uLava;
      varying vec2 vUv;
      varying float vWave;
      float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453); }
      void main() {
        vec2 p = vUv * vec2(90.0, 90.0);
        float n = sin(p.x * 0.7 + uTime * 0.3) * sin(p.y * 0.9 - uTime * 0.2);
        float n2 = sin((p.x + p.y) * 1.7 + uTime * 0.7) * 0.5 + 0.5;
        vec3 col = uColor + uEmissive * (0.2 + n2 * 0.16);
        float sparkle = smoothstep(0.88, 1.0, n2 + n * 0.3);
        col += vec3(1.0, 0.82, 0.5) * sparkle * (0.55 + uLava * 1.5);
        float alpha = mix(0.72, 0.92, uLava) + vWave * 0.4;
        gl_FragColor = vec4(col, alpha);
      }
    `,
  });
  const geo = new THREE.PlaneGeometry(190, 190, 1, 1);
  const water = new THREE.Mesh(geo, mat);
  water.rotation.x = -Math.PI / 2;
  water.position.y = region.water.level;
  water.receiveShadow = false;
  water.userData.mat = mat;
  return water;
}

function makeClouds(region, seed) {
  const group = new THREE.Group();
  const tex = radialTexture(128, 'rgba(255,255,255,0.72)', 'rgba(255,255,255,0)');
  const rng = mulberry32(seed);
  for (let i = 0; i < 22; i++) {
    const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, opacity: 0.1 + rng() * 0.12, depthWrite: false, color: new THREE.Color(region.sky.mid), fog: false });
    const s = new THREE.Sprite(mat);
    const angle = rng() * Math.PI * 2;
    const r = 80 + rng() * 130;
    s.position.set(Math.cos(angle) * r, 32 + rng() * 42, Math.sin(angle) * r);
    s.scale.set(38 + rng() * 55, 14 + rng() * 22, 1);
    s.userData.drift = 0.1 + rng() * 0.25;
    group.add(s);
  }
  return group;
}

function makeMountainRing(region, seed) {
  const group = new THREE.Group();
  const rng = mulberry32(seed);
  const colors = [region.sky.mid, region.sky.fog, region.sky.top];
  for (let i = 0; i < 28; i++) {
    const angle = (i / 28) * Math.PI * 2 + rng() * 0.15;
    const r = 100 + rng() * 38;
    const h = 16 + rng() * 28;
    const width = 15 + rng() * 18;
    const mat = new THREE.MeshStandardMaterial({ color: new THREE.Color(colors[i % 3]), roughness: 1, metalness: 0, flatShading: true });
    const m = new THREE.Mesh(new THREE.ConeGeometry(width, h, 5 + Math.floor(rng() * 3)), mat);
    m.position.set(Math.cos(angle) * r, h / 2 - 3, Math.sin(angle) * r);
    m.rotation.y = rng() * Math.PI;
    m.receiveShadow = false;
    group.add(m);
  }
  return group;
}

function makeParticles(region, seed) {
  const group = new THREE.Group();
  const rng = mulberry32(seed);
  const count = region.weather === 'embers' ? 170 : 150;
  const positions = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  const phases = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (rng() - 0.5) * 165;
    positions[i * 3 + 1] = 0.3 + rng() * 16;
    positions[i * 3 + 2] = (rng() - 0.5) * 165;
    sizes[i] = 0.4 + rng() * 1.2;
    phases[i] = rng() * Math.PI * 2;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
  geo.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1));
  const color = region.weather === 'embers' ? '#ff8b4a' : region.weather === 'motes' ? '#c9b9ff' : '#ffe7a8';
  const mat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: { uTime: { value: 0 }, uColor: { value: new THREE.Color(color) }, uPixelRatio: { value: Math.min(devicePixelRatio, 2) } },
    vertexShader: `
      attribute float aSize;
      attribute float aPhase;
      uniform float uTime, uPixelRatio;
      varying float vAlpha;
      void main() {
        vec3 p = position;
        p.y += sin(uTime * 0.45 + aPhase) * 1.2;
        p.x += cos(uTime * 0.23 + aPhase * 2.0) * 0.8;
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_PointSize = aSize * uPixelRatio * (170.0 / -mv.z);
        gl_Position = projectionMatrix * mv;
        vAlpha = 0.35 + 0.65 * (sin(uTime * 1.5 + aPhase) * 0.5 + 0.5);
      }
    `,
    fragmentShader: `
      uniform vec3 uColor;
      varying float vAlpha;
      void main() {
        vec2 c = gl_PointCoord - 0.5;
        float d = length(c);
        float a = smoothstep(0.5, 0.05, d) * vAlpha;
        gl_FragColor = vec4(uColor, a);
      }
    `,
  });
  const points = new THREE.Points(geo, mat);
  points.frustumCulled = false;
  group.add(points);
  group.userData.mat = mat;
  return group;
}

function makeGrass(regionId, heightAt, count, seed, isClear) {
  const rng = mulberry32(seed);
  const pal = PALETTE[regionId];
  const geo = new THREE.ConeGeometry(0.045, 0.52, 3, 1);
  geo.translate(0, 0.26, 0);
  const mat = new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.95, metalness: 0, side: THREE.DoubleSide });
  const uniforms = { uTime: { value: 0 } };
  mat.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = uniforms.uTime;
    shader.vertexShader = 'uniform float uTime;\n' + shader.vertexShader;
    shader.vertexShader = shader.vertexShader.replace('#include <begin_vertex>', `
      vec3 transformed = vec3(position);
      #ifdef USE_INSTANCING
        float sway = sin(uTime * 1.35 + instanceMatrix[3].x * 0.31 + instanceMatrix[3].z * 0.22) * 0.075 * max(position.y, 0.0);
        transformed.x += sway;
        transformed.z += sway * 0.35;
      #endif
    `);
  };
  const inst = new THREE.InstancedMesh(geo, mat, count);
  inst.castShadow = false;
  inst.receiveShadow = true;
  const dummy = new THREE.Object3D();
  const color = new THREE.Color();
  let placed = 0;
  for (let i = 0; i < count * 3 && placed < count; i++) {
    const x = (rng() - 0.5) * 168;
    const z = (rng() - 0.5) * 168;
    if (!isClear(x, z, 0.7) || pathDistance(x, z, PATHS[regionId]) < 3.4) continue;
    const y = heightAt(x, z);
    if (y < (regionId === 'valdoria' ? -1.1 : -1.5)) continue;
    dummy.position.set(x, y, z);
    dummy.rotation.y = rng() * Math.PI;
    const s = 0.55 + rng() * 1.1;
    dummy.scale.set(s, s * (0.7 + rng() * 0.9), s);
    dummy.updateMatrix();
    inst.setMatrixAt(placed, dummy.matrix);
    color.set(pal.grass[Math.floor(rng() * pal.grass.length)]);
    color.offsetHSL(0, 0, (rng() - 0.5) * 0.08);
    inst.setColorAt(placed, color);
    placed++;
  }
  inst.count = placed;
  inst.instanceMatrix.needsUpdate = true;
  if (inst.instanceColor) inst.instanceColor.needsUpdate = true;
  inst.userData.uniforms = uniforms;
  return inst;
}

function makeTrees(regionId, heightAt, count, seed, isClear) {
  const rng = mulberry32(seed);
  const pal = PALETTE[regionId];
  const group = new THREE.Group();
  const dummy = new THREE.Object3D();
  const color = new THREE.Color();
  const trunkGeo = new THREE.CylinderGeometry(0.19, 0.32, 4.2, 7);
  trunkGeo.translate(0, 2.1, 0);
  const trunkMat = makeMat(pal.trunk, { roughness: 1 });
  const trunks = new THREE.InstancedMesh(trunkGeo, trunkMat, count);
  trunks.castShadow = true; trunks.receiveShadow = true;
  const canopyGeo = new THREE.IcosahedronGeometry(1.45, 1);
  const canopyMat = makeMat('#ffffff', { roughness: 0.95, flat: true });
  const canopy = new THREE.InstancedMesh(canopyGeo, canopyMat, count * 3);
  canopy.castShadow = true; canopy.receiveShadow = true;
  let n = 0, c = 0;
  for (let attempt = 0; attempt < count * 12 && n < count; attempt++) {
    const x = (rng() - 0.5) * 168;
    const z = (rng() - 0.5) * 168;
    if (!isClear(x, z, 3.2) || pathDistance(x, z, PATHS[regionId]) < 4.5) continue;
    const y = heightAt(x, z);
    if (y < -1.3) continue;
    const scale = 0.7 + rng() * 1.1;
    dummy.position.set(x, y, z);
    dummy.rotation.y = rng() * Math.PI * 2;
    dummy.scale.set(scale, scale * (0.9 + rng() * 0.35), scale);
    dummy.updateMatrix();
    trunks.setMatrixAt(n, dummy.matrix);
    for (let k = 0; k < 3; k++) {
      const a = rng() * Math.PI * 2;
      const rr = 0.45 + rng() * 0.55;
      dummy.position.set(x + Math.cos(a) * rr * scale, y + (4.1 + rng() * 1.25) * scale, z + Math.sin(a) * rr * scale);
      dummy.rotation.set(rng() * 0.3, rng() * Math.PI, rng() * 0.3);
      const cs = (0.72 + rng() * 0.55) * scale;
      dummy.scale.set(cs * (0.9 + rng() * 0.3), cs * (0.8 + rng() * 0.4), cs);
      dummy.updateMatrix();
      canopy.setMatrixAt(c, dummy.matrix);
      color.set(pal.canopy[Math.floor(rng() * pal.canopy.length)]);
      color.offsetHSL(0, 0, (rng() - 0.5) * 0.07);
      canopy.setColorAt(c, color);
      c++;
    }
    n++;
    group.userData.colliders ??= [];
    group.userData.colliders.push({ x, z, r: 0.55 * scale });
  }
  trunks.count = n; canopy.count = c;
  trunks.instanceMatrix.needsUpdate = true; canopy.instanceMatrix.needsUpdate = true;
  if (canopy.instanceColor) canopy.instanceColor.needsUpdate = true;
  group.add(trunks, canopy);
  return group;
}

function makeRocks(regionId, heightAt, count, seed, isClear) {
  const rng = mulberry32(seed);
  const pal = PALETTE[regionId];
  const geo = new THREE.DodecahedronGeometry(1, 0);
  const mat = makeMat(pal.rock, { roughness: 0.98, flat: true });
  const inst = new THREE.InstancedMesh(geo, mat, count);
  inst.castShadow = true; inst.receiveShadow = true;
  const dummy = new THREE.Object3D();
  let n = 0;
  const colliders = [];
  for (let attempt = 0; attempt < count * 10 && n < count; attempt++) {
    const x = (rng() - 0.5) * 170;
    const z = (rng() - 0.5) * 170;
    if (!isClear(x, z, 2.4) || pathDistance(x, z, PATHS[regionId]) < 3.2) continue;
    const y = heightAt(x, z);
    const s = 0.45 + rng() * 2.2;
    dummy.position.set(x, y + s * 0.22, z);
    dummy.rotation.set(rng() * Math.PI, rng() * Math.PI, rng() * Math.PI);
    dummy.scale.set(s * (0.8 + rng() * 0.5), s * (0.55 + rng() * 0.45), s);
    dummy.updateMatrix();
    inst.setMatrixAt(n, dummy.matrix);
    if (s > 1.2) colliders.push({ x, z, r: s * 0.5 });
    n++;
  }
  inst.count = n;
  inst.instanceMatrix.needsUpdate = true;
  inst.userData.colliders = colliders;
  return inst;
}

function makeFlowers(regionId, heightAt, count, seed, isClear) {
  const rng = mulberry32(seed);
  const pal = PALETTE[regionId];
  const geo = new THREE.IcosahedronGeometry(0.065, 0);
  const mat = new THREE.MeshStandardMaterial({ color: '#ffffff', emissive: '#ffffff', emissiveIntensity: 0.25, roughness: 0.5 });
  const inst = new THREE.InstancedMesh(geo, mat, count);
  const dummy = new THREE.Object3D();
  const color = new THREE.Color();
  let n = 0;
  for (let attempt = 0; attempt < count * 8 && n < count; attempt++) {
    const x = (rng() - 0.5) * 150;
    const z = (rng() - 0.5) * 150;
    if (!isClear(x, z, 1) || pathDistance(x, z, PATHS[regionId]) < 2.7) continue;
    const y = heightAt(x, z);
    if (y < -1) continue;
    dummy.position.set(x, y + 0.35 + rng() * 0.25, z);
    const s = 0.65 + rng() * 1.3;
    dummy.scale.setScalar(s);
    dummy.updateMatrix();
    inst.setMatrixAt(n, dummy.matrix);
    color.set(pal.flower[Math.floor(rng() * pal.flower.length)]);
    inst.setColorAt(n, color);
    n++;
  }
  inst.count = n;
  inst.instanceMatrix.needsUpdate = true;
  if (inst.instanceColor) inst.instanceColor.needsUpdate = true;
  return inst;
}

function makeHouse(x, z, rot, scale, y) {
  const group = new THREE.Group();
  const wall = makeMat('#c9b28e', { roughness: 0.95 });
  const wood = makeMat('#5b4030', { roughness: 0.95 });
  const roof = makeMat('#5b3a32', { roughness: 0.92, flat: true });
  const glow = new THREE.MeshBasicMaterial({ color: '#ffd38b' });
  const base = mesh(new THREE.BoxGeometry(4.4, 2.8, 3.7), wall, [0, 1.4, 0]);
  group.add(base);
  // timber frame
  for (const sx of [-2.2, 2.2]) group.add(mesh(new THREE.BoxGeometry(0.16, 2.9, 0.16), wood, [sx, 1.45, 1.86]));
  for (const zz of [-1.85, 1.85]) group.add(mesh(new THREE.BoxGeometry(4.45, 0.14, 0.15), wood, [0, 1.05, zz]));
  group.add(mesh(new THREE.BoxGeometry(4.7, 0.16, 4), wood, [0, 2.82, 0]));
  // roof
  const roofMesh = mesh(new THREE.ConeGeometry(3.7, 2.4, 4), roof, [0, 4, 0], [0, Math.PI / 4, 0]);
  group.add(roofMesh);
  // door
  group.add(mesh(new THREE.BoxGeometry(0.85, 1.65, 0.12), wood, [0, 0.82, 1.89]));
  group.add(mesh(new THREE.SphereGeometry(0.04, 6, 4), makeMat('#d9b56e', { metalness: 0.8 }), [0.27, 0.82, 1.97]));
  // windows
  for (const sx of [-1.3, 1.3]) {
    group.add(mesh(new THREE.BoxGeometry(0.65, 0.55, 0.08), glow, [sx, 1.65, 1.9]));
    group.add(mesh(new THREE.BoxGeometry(0.75, 0.08, 0.13), wood, [sx, 1.65, 1.93]));
    group.add(mesh(new THREE.BoxGeometry(0.08, 0.65, 0.13), wood, [sx, 1.65, 1.93]));
  }
  // chimney
  group.add(mesh(new THREE.BoxGeometry(0.55, 1.8, 0.55), makeMat('#8c7c6c'), [1.25, 4.2, -0.55]));
  group.add(mesh(new THREE.BoxGeometry(0.7, 0.16, 0.7), makeMat('#61554a'), [1.25, 5.05, -0.55]));
  // banner
  group.add(mesh(new THREE.BoxGeometry(0.06, 2.2, 0.06), wood, [-2.65, 1.9, 1.4]));
  const banner = mesh(new THREE.PlaneGeometry(0.75, 1.2), makeMat('#37655e', { side: THREE.DoubleSide }), [-2.3, 2.35, 1.4], [0, 0.1, 0.06]);
  group.add(banner);
  group.add(mesh(new THREE.PlaneGeometry(0.3, 0.3), new THREE.MeshBasicMaterial({ color: '#e5c17c', side: THREE.DoubleSide }), [-2.3, 2.35, 1.405], [0, 0.1, 0.06]));
  group.position.set(x, y, z);
  group.rotation.y = rot;
  group.scale.setScalar(scale);
  group.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  return group;
}

function makeWindmill(x, z, y) {
  const group = new THREE.Group();
  const stone = makeMat('#b7a98d', { roughness: 0.95 });
  const wood = makeMat('#604535');
  const roof = makeMat('#4d3833');
  group.add(mesh(new THREE.CylinderGeometry(1.5, 2.05, 5.6, 8), stone, [0, 2.8, 0]));
  group.add(mesh(new THREE.ConeGeometry(2.15, 2.1, 8), roof, [0, 6.2, 0]));
  group.add(mesh(new THREE.BoxGeometry(0.85, 1.5, 0.12), wood, [0, 0.75, 1.82]));
  const blades = new THREE.Group();
  blades.position.set(0, 5.1, 2.05);
  for (let i = 0; i < 4; i++) {
    const arm = new THREE.Group();
    arm.rotation.z = i * Math.PI / 2;
    arm.add(mesh(new THREE.BoxGeometry(0.18, 3.4, 0.12), wood, [0, 1.7, 0]));
    const sail = mesh(new THREE.PlaneGeometry(0.7, 2.1), makeMat('#c9b997', { side: THREE.DoubleSide, transparent: true, opacity: 0.8 }), [0.42, 1.9, 0]);
    arm.add(sail);
    blades.add(arm);
  }
  group.add(blades);
  group.position.set(x, y, z);
  group.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  group.userData.blades = blades;
  return group;
}

function makeVillage(heightAt) {
  const group = new THREE.Group();
  const y0 = heightAt(0, -15);
  const houses = [
    [-8.5, -19, 0.25, 1], [7.2, -18, -0.45, 0.92], [-3.2, -29, 0.08, 0.86], [13.5, -7, -1.1, 0.78],
  ];
  for (const [x, z, r, s] of houses) group.add(makeHouse(x, z, r, s, heightAt(x, z)));
  group.add(makeWindmill(-18, -12, heightAt(-18, -12)));
  // well
  const well = new THREE.Group();
  well.add(mesh(new THREE.CylinderGeometry(1.1, 1.25, 0.8, 12), makeMat('#9a927f'), [0, 0.4, 0]));
  well.add(mesh(new THREE.CylinderGeometry(0.85, 0.85, 0.2, 12), makeMat('#2f3b39'), [0, 0.82, 0]));
  for (const sx of [-0.9, 0.9]) well.add(mesh(new THREE.BoxGeometry(0.14, 2.1, 0.14), makeMat('#5b4030'), [sx, 1.35, 0]));
  well.add(mesh(new THREE.ConeGeometry(1.45, 0.8, 4), makeMat('#5b3a32'), [0, 2.6, 0], [0, Math.PI / 4, 0]));
  well.position.set(3.6, heightAt(3.6, -11), -11);
  group.add(well);
  // shrine near spawn
  const shrine = new THREE.Group();
  const stone = makeMat('#8e8b7b');
  const gold = makeMat('#d2ad68', { metalness: 0.7, roughness: 0.3 });
  shrine.add(mesh(new THREE.CylinderGeometry(1.4, 1.7, 0.4, 8), stone, [0, 0.2, 0]));
  shrine.add(mesh(new THREE.BoxGeometry(0.45, 2.6, 0.45), stone, [-1.1, 1.5, 0]));
  shrine.add(mesh(new THREE.BoxGeometry(0.45, 2.6, 0.45), stone, [1.1, 1.5, 0]));
  shrine.add(mesh(new THREE.BoxGeometry(2.8, 0.4, 0.45), stone, [0, 2.75, 0]));
  shrine.add(mesh(new THREE.BoxGeometry(0.3, 0.5, 0.3), gold, [0, 3.2, 0]));
  const crystal = mesh(new THREE.OctahedronGeometry(0.34, 0), new THREE.MeshStandardMaterial({ color: '#bff6ee', emissive: '#78d8cf', emissiveIntensity: 2.2, metalness: 0.2, roughness: 0.2 }), [0, 2.35, 0]);
  shrine.add(crystal);
  shrine.position.set(4.8, heightAt(4.8, -4.5), -4.5);
  group.add(shrine);
  group.userData.shrineCrystal = crystal;
  // campfire
  const fire = new THREE.Group();
  for (let i = 0; i < 6; i++) fire.add(mesh(new THREE.DodecahedronGeometry(0.18, 0), makeMat('#5b4d42'), [Math.cos(i) * 0.45, 0.08, Math.sin(i) * 0.45], [0, i, 0]));
  const flame = new THREE.Mesh(new THREE.ConeGeometry(0.28, 0.9, 7), new THREE.MeshBasicMaterial({ color: '#ffb05c', transparent: true, opacity: 0.9 }));
  flame.position.y = 0.5;
  fire.add(flame);
  const light = new THREE.PointLight('#ffb06a', 8, 14, 2);
  light.position.y = 0.7;
  fire.add(light);
  fire.position.set(1, heightAt(1, -8.5), -8.5);
  group.add(fire);
  group.userData.fire = { flame, light };
  // fences
  const fenceMat = makeMat('#5a4132');
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 1.3 + 1.4;
    const x = Math.cos(a) * 10, z = -12 + Math.sin(a) * 10;
    group.add(mesh(new THREE.BoxGeometry(0.12, 1, 0.12), fenceMat, [x, heightAt(x, z) + 0.5, z]));
  }
  group.userData.colliders = houses.map(([x, z, , s]) => ({ x, z, r: 2.7 * s })).concat([{ x: -18, z: -12, r: 2.1 }, { x: 3.6, z: -11, r: 1.4 }, { x: 4.8, z: -4.5, r: 1.6 }]);
  return group;
}

function makeRift(x, z, y, index) {
  const group = new THREE.Group();
  const dark = new THREE.MeshStandardMaterial({ color: '#1b1422', roughness: 0.55, metalness: 0.2, emissive: '#6f3a93', emissiveIntensity: 0.5 });
  const crystal = new THREE.MeshStandardMaterial({ color: '#7d4aa0', emissive: '#b477e0', emissiveIntensity: 1.9, roughness: 0.25, metalness: 0.4 });
  group.add(mesh(new THREE.CylinderGeometry(2.2, 2.8, 0.3, 10), dark, [0, 0.15, 0]));
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    const h = 1.4 + (i % 3) * 0.6;
    const c = mesh(new THREE.ConeGeometry(0.32, h, 5), crystal, [Math.cos(a) * 0.7, h / 2 + 0.3, Math.sin(a) * 0.7], [0.12 * Math.sin(a), a, 0.12 * Math.cos(a)]);
    group.add(c);
  }
  const core = mesh(new THREE.OctahedronGeometry(0.55, 0), crystal, [0, 1.35, 0]);
  group.add(core);
  const ring = mesh(new THREE.TorusGeometry(1.4, 0.025, 4, 30), new THREE.MeshBasicMaterial({ color: '#b477e0', transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending }), [0, 0.35, 0], [Math.PI / 2, 0, 0]);
  group.add(ring);
  const light = new THREE.PointLight('#a85be0', 12, 14, 2);
  light.position.y = 1.5;
  group.add(light);
  group.position.set(x, y, z);
  group.userData = { index, core, ring, crystal, light, type: 'rift' };
  return group;
}

function makeSeal(x, z, y, index, color = '#ff7a3f') {
  const group = new THREE.Group();
  const stone = makeMat('#3b3030', { roughness: 0.95 });
  const metal = makeMat('#7c5b48', { metalness: 0.6, roughness: 0.4 });
  const glow = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending });
  group.add(mesh(new THREE.CylinderGeometry(2.1, 2.5, 0.35, 8), stone, [0, 0.18, 0]));
  group.add(mesh(new THREE.BoxGeometry(0.8, 2.8, 0.8), stone, [0, 1.6, 0]));
  group.add(mesh(new THREE.BoxGeometry(1.25, 0.35, 1.25), metal, [0, 3.05, 0]));
  const bowl = mesh(new THREE.CylinderGeometry(0.7, 0.38, 0.45, 8), metal, [0, 3.35, 0]);
  group.add(bowl);
  const orb = mesh(new THREE.IcosahedronGeometry(0.42, 1), glow, [0, 3.8, 0]);
  group.add(orb);
  const ring = mesh(new THREE.TorusGeometry(1.3, 0.018, 4, 28), glow, [0, 0.35, 0], [Math.PI / 2, 0, 0]);
  group.add(ring);
  const light = new THREE.PointLight(color, 9, 13, 2);
  light.position.y = 3.9;
  group.add(light);
  group.position.set(x, y, z);
  group.userData = { index, orb, ring, light, type: 'seal', color };
  return group;
}

function makePortal(x, z, y, regionId, active = false) {
  const group = new THREE.Group();
  const stone = makeMat('#6b685f', { roughness: 0.9 });
  const glowColor = regionId === 'valdoria' ? '#ffce7e' : regionId === 'drakmore' ? '#ff7c45' : '#bca3ee';
  const glowMat = new THREE.MeshBasicMaterial({ color: glowColor, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending, side: THREE.DoubleSide });
  group.add(mesh(new THREE.TorusGeometry(3.0, 0.28, 8, 28), stone, [0, 3.4, 0], [0, 0, 0]));
  for (const sx of [-3.2, 3.2]) {
    group.add(mesh(new THREE.BoxGeometry(0.75, 5.7, 0.75), stone, [sx, 2.8, 0]));
    group.add(mesh(new THREE.BoxGeometry(1.1, 0.3, 1.1), stone, [sx, 5.6, 0]));
  }
  const disc = mesh(new THREE.CircleGeometry(2.75, 36), glowMat, [0, 3.4, 0], [0, 0, 0], [1, 1, 1], false);
  group.add(disc);
  const swirl = mesh(new THREE.TorusGeometry(2.1, 0.035, 4, 40), new THREE.MeshBasicMaterial({ color: '#fff4cf', transparent: true, opacity: 0.7, blending: THREE.AdditiveBlending }), [0, 3.4, 0.05], [0, 0, 0], [1, 1, 1], false);
  group.add(swirl);
  const runes = mesh(new THREE.RingGeometry(2.9, 3.0, 48), new THREE.MeshBasicMaterial({ color: glowColor, transparent: true, opacity: 0.7, blending: THREE.AdditiveBlending, side: THREE.DoubleSide }), [0, 0.12, 0], [-Math.PI / 2, 0, 0], [1, 1, 1], false);
  group.add(runes);
  const light = new THREE.PointLight(glowColor, active ? 16 : 2, 20, 2);
  light.position.y = 3.4;
  group.add(light);
  group.position.set(x, y, z);
  group.userData = { disc, swirl, runes, light, active, glowMat };
  return group;
}

function makeAltar(x, z, y, color = '#ffe2a1') {
  const group = new THREE.Group();
  const stone = makeMat('#6b675b', { roughness: 0.92 });
  const glow = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending });
  group.add(mesh(new THREE.CylinderGeometry(2.6, 3.2, 0.45, 8), stone, [0, 0.22, 0]));
  group.add(mesh(new THREE.CylinderGeometry(0.9, 1.3, 1.1, 8), stone, [0, 0.9, 0]));
  group.add(mesh(new THREE.BoxGeometry(1.7, 0.22, 1.7), stone, [0, 1.5, 0]));
  const gem = mesh(new THREE.OctahedronGeometry(0.5, 0), glow, [0, 2.2, 0]);
  group.add(gem);
  const ring = mesh(new THREE.TorusGeometry(1.7, 0.018, 4, 32), glow, [0, 1.65, 0], [Math.PI / 2, 0, 0]);
  group.add(ring);
  const light = new THREE.PointLight(color, 12, 16, 2);
  light.position.y = 2.4;
  group.add(light);
  group.position.set(x, y, z);
  group.userData = { gem, ring, light, type: 'altar' };
  return group;
}

function makeRuins(heightAt) {
  const group = new THREE.Group();
  const cx = -32, cz = 38;
  const y = heightAt(cx, cz);
  const stone = makeMat('#7b786a', { roughness: 0.98 });
  const darkStone = makeMat('#565349', { roughness: 1 });
  const runeMat = new THREE.MeshBasicMaterial({ color: '#8ee3d8', transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending, side: THREE.DoubleSide });
  // arena floor
  const floor = mesh(new THREE.CylinderGeometry(12.5, 13.5, 0.5, 28), stone, [cx, y + 0.2, cz]);
  group.add(floor);
  const runeRing = mesh(new THREE.RingGeometry(8.4, 8.7, 64), runeMat, [cx, y + 0.47, cz], [-Math.PI / 2, 0, 0], [1, 1, 1], false);
  group.add(runeRing);
  const runeRing2 = mesh(new THREE.RingGeometry(4.2, 4.32, 48), runeMat, [cx, y + 0.48, cz], [-Math.PI / 2, 0, 0], [1, 1, 1], false);
  group.add(runeRing2);
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    const r = 10.3;
    const px = cx + Math.cos(a) * r, pz = cz + Math.sin(a) * r;
    const h = 3 + (i % 4) * 1.8;
    group.add(mesh(new THREE.CylinderGeometry(0.55, 0.7, h, 8), i % 3 === 0 ? darkStone : stone, [px, y + h / 2, pz], [0, a, 0]));
    if (i % 3 === 0) group.add(mesh(new THREE.BoxGeometry(1.5, 0.35, 1.5), stone, [px, y + h, pz]));
    group.userData.colliders ??= [];
    group.userData.colliders.push({ x: px, z: pz, r: 0.9 });
  }
  // broken arch
  const arch = new THREE.Group();
  arch.position.set(cx, y, cz - 11.5);
  arch.add(mesh(new THREE.BoxGeometry(1.1, 6, 1.1), stone, [-2.4, 3, 0]));
  arch.add(mesh(new THREE.BoxGeometry(1.1, 6, 1.1), stone, [2.4, 3, 0]));
  arch.add(mesh(new THREE.BoxGeometry(5.8, 0.8, 1.2), stone, [0, 6.2, 0]));
  arch.add(mesh(new THREE.ConeGeometry(0.3, 1.2, 4), darkStone, [0, 7.1, 0]));
  group.add(arch);
  // debris
  for (let i = 0; i < 14; i++) {
    const a = i * 1.7, r = 4 + (i % 4) * 1.8;
    const px = cx + Math.cos(a) * r, pz = cz + Math.sin(a) * r;
    const s = 0.35 + (i % 3) * 0.3;
    group.add(mesh(new THREE.DodecahedronGeometry(s, 0), stone, [px, y + s * 0.4, pz], [i, i * 0.5, 0]));
  }
  // floating shards
  const shards = [];
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2;
    const shard = mesh(new THREE.OctahedronGeometry(0.3 + (i % 3) * 0.18, 0), runeMat, [cx + Math.cos(a) * 7.5, y + 4 + (i % 3), cz + Math.sin(a) * 7.5]);
    shard.userData.baseY = shard.position.y;
    shard.userData.phase = i * 0.9;
    group.add(shard);
    shards.push(shard);
  }
  group.userData.shards = shards;
  group.userData.runeMat = runeMat;
  group.userData.center = { x: cx, z: cz, y };
  return group;
}

function makeDrakFortress(heightAt) {
  const group = new THREE.Group();
  const cx = 0, cz = 44;
  const y = heightAt(cx, cz);
  const obsidian = makeMat('#211d22', { roughness: 0.55, metalness: 0.3, flat: true });
  const metal = makeMat('#57423b', { roughness: 0.45, metalness: 0.65 });
  const ember = new THREE.MeshBasicMaterial({ color: '#ff7b3f', transparent: true, opacity: 0.75, blending: THREE.AdditiveBlending });
  const floor = mesh(new THREE.CylinderGeometry(17, 18, 0.7, 18), obsidian, [cx, y + 0.3, cz]);
  group.add(floor);
  // walls
  for (let i = 0; i < 18; i++) {
    if (i >= 7 && i <= 10) continue;
    const a = (i / 18) * Math.PI * 2;
    const px = cx + Math.cos(a) * 16, pz = cz + Math.sin(a) * 16;
    const h = 4.5 + (i % 4) * 1.2;
    group.add(mesh(new THREE.BoxGeometry(5.3, h, 1.1), obsidian, [px, y + h / 2, pz], [0, -a, 0]));
    if (i % 3 === 0) {
      group.add(mesh(new THREE.ConeGeometry(1.3, 4, 5), obsidian, [px, y + h + 2, pz], [0, -a, 0]));
      group.add(mesh(new THREE.BoxGeometry(0.16, 2.5, 0.16), ember, [px, y + h * 0.7, pz], [0, -a, 0]));
    }
    group.userData.colliders ??= [];
    group.userData.colliders.push({ x: px, z: pz, r: 2.7 });
  }
  // gate
  const gateZ = cz - 16;
  for (const sx of [-4.2, 4.2]) {
    group.add(mesh(new THREE.BoxGeometry(2.4, 9, 2.4), obsidian, [sx, y + 4.5, gateZ]));
    group.add(mesh(new THREE.ConeGeometry(1.8, 4.5, 5), obsidian, [sx, y + 10.5, gateZ]));
  }
  group.add(mesh(new THREE.BoxGeometry(10.8, 1.1, 2.8), metal, [0, y + 9.1, gateZ]));
  group.add(mesh(new THREE.BoxGeometry(0.35, 7.8, 0.35), ember, [-4.2, y + 4.6, gateZ + 1.22]));
  group.add(mesh(new THREE.BoxGeometry(0.35, 7.8, 0.35), ember, [4.2, y + 4.6, gateZ + 1.22]));
  // towers
  for (const [tx, tz] of [[-13, -11], [13, -11], [-13, 11], [13, 11]]) {
    group.add(mesh(new THREE.CylinderGeometry(2.2, 2.8, 12, 8), obsidian, [cx + tx, y + 6, cz + tz]));
    group.add(mesh(new THREE.ConeGeometry(3.1, 3.4, 8), metal, [cx + tx, y + 13.6, cz + tz]));
    group.userData.colliders.push({ x: cx + tx, z: cz + tz, r: 2.9 });
  }
  // throne / altar
  const altar = makeAltar(cx, cz + 5, y + 0.5, '#ff8a4a');
  group.add(altar);
  group.userData.altar = altar;
  // brazier ring
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const px = cx + Math.cos(a) * 10, pz = cz + Math.sin(a) * 10;
    group.add(mesh(new THREE.CylinderGeometry(0.28, 0.4, 1.1, 6), metal, [px, y + 0.9, pz]));
    const orb = mesh(new THREE.SphereGeometry(0.2, 8, 6), ember, [px, y + 1.6, pz]);
    group.add(orb);
  }
  group.userData.center = { x: cx, z: cz, y };
  return group;
}

function makeTemple(heightAt) {
  const group = new THREE.Group();
  const cx = 0, cz = 22;
  const y = heightAt(cx, cz);
  const marble = makeMat('#d3ccd8', { roughness: 0.65, metalness: 0.06 });
  const gold = makeMat('#c9a75f', { roughness: 0.32, metalness: 0.75 });
  const glow = new THREE.MeshBasicMaterial({ color: '#c7b4ff', transparent: true, opacity: 0.75, blending: THREE.AdditiveBlending, side: THREE.DoubleSide });
  // stepped platform
  for (let i = 0; i < 4; i++) {
    const r = 25 - i * 2.6;
    group.add(mesh(new THREE.CylinderGeometry(r, r + 1.1, 0.55, 48), marble, [cx, y + 0.28 + i * 0.55, cz]));
  }
  const topY = y + 2.2;
  // outer columns
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    const r = 19;
    const px = cx + Math.cos(a) * r, pz = cz + Math.sin(a) * r;
    const h = 9 + (i % 2) * 2;
    group.add(mesh(new THREE.CylinderGeometry(0.65, 0.8, h, 10), marble, [px, topY + h / 2, pz]));
    group.add(mesh(new THREE.CylinderGeometry(1.0, 0.9, 0.3, 10), gold, [px, topY + h + 0.15, pz]));
    group.userData.colliders ??= [];
    group.userData.colliders.push({ x: px, z: pz, r: 0.95 });
  }
  // inner columns
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + 0.2;
    const px = cx + Math.cos(a) * 11, pz = cz + Math.sin(a) * 11;
    group.add(mesh(new THREE.CylinderGeometry(0.5, 0.7, 7, 8), marble, [px, topY + 3.5, pz]));
    group.userData.colliders.push({ x: px, z: pz, r: 0.8 });
  }
  // central dais
  group.add(mesh(new THREE.CylinderGeometry(6.2, 7, 1.2, 12), marble, [cx, topY + 0.6, cz]));
  group.add(mesh(new THREE.RingGeometry(5.2, 5.35, 64), glow, [cx, topY + 1.22, cz], [-Math.PI / 2, 0, 0], [1, 1, 1], false));
  group.add(mesh(new THREE.RingGeometry(2.4, 2.5, 48), glow, [cx, topY + 1.23, cz], [-Math.PI / 2, 0, 0], [1, 1, 1], false));
  const altar = makeAltar(cx, cz + 3, topY + 1.2, '#d7c6ff');
  group.add(altar);
  group.userData.altar = altar;
  // arches
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
    const arch = new THREE.Group();
    arch.position.set(cx + Math.cos(a) * 16, topY, cz + Math.sin(a) * 16);
    arch.rotation.y = -a;
    arch.add(mesh(new THREE.BoxGeometry(0.8, 8, 0.8), marble, [-2, 4, 0]));
    arch.add(mesh(new THREE.BoxGeometry(0.8, 8, 0.8), marble, [2, 4, 0]));
    arch.add(mesh(new THREE.TorusGeometry(2, 0.35, 6, 20, Math.PI), marble, [0, 8, 0], [0, 0, 0]));
    group.add(arch);
  }
  // floating rings / crystals
  const rings = [];
  for (let i = 0; i < 3; i++) {
    const ring = mesh(new THREE.TorusGeometry(8 + i * 3, 0.035, 4, 80), glow, [cx, topY + 8 + i * 2.2, cz], [Math.PI / 2 + i * 0.12, 0, 0], [1, 1, 1], false);
    ring.userData.spin = 0.06 + i * 0.02;
    group.add(ring);
    rings.push(ring);
  }
  group.userData.rings = rings;
  group.userData.center = { x: cx, z: cz, y: topY };
  return group;
}

function makeFloatingIslands(region, seed) {
  const group = new THREE.Group();
  const rng = mulberry32(seed);
  const stone = makeMat('#696482', { roughness: 0.95, flat: true });
  const glowMat = new THREE.MeshBasicMaterial({ color: '#bca3ee', transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending });
  for (let i = 0; i < 7; i++) {
    const angle = rng() * Math.PI * 2;
    const r = 65 + rng() * 50;
    const g = new THREE.Group();
    g.position.set(Math.cos(angle) * r, 12 + rng() * 20, Math.sin(angle) * r);
    const rock = mesh(new THREE.DodecahedronGeometry(4 + rng() * 4, 1), stone, [0, 0, 0], [0, rng() * 3, 0], [1.6, 0.55, 1.2]);
    g.add(rock);
    const crystal = mesh(new THREE.OctahedronGeometry(1 + rng() * 1.2, 0), glowMat, [0, 3, 0]);
    g.add(crystal);
    const ring = mesh(new THREE.TorusGeometry(3 + rng() * 2, 0.02, 4, 24), glowMat, [0, 0.5, 0], [Math.PI / 2, 0, 0], [1, 1, 1], false);
    g.add(ring);
    group.add(g);
  }
  // aurora ribbons
  for (let i = 0; i < 4; i++) {
    const points = [];
    for (let j = 0; j < 8; j++) {
      const t = j / 7;
      points.push(new THREE.Vector3(-90 + t * 180, 38 + Math.sin(t * 6 + i) * 7, -60 + i * 35 + Math.cos(t * 4 + i) * 18));
    }
    const curve = new THREE.CatmullRomCurve3(points);
    const geo = new THREE.TubeGeometry(curve, 48, 1.6 + i * 0.4, 5, false);
    const mat = new THREE.MeshBasicMaterial({ color: i % 2 ? '#9de3dd' : '#bca3ee', transparent: true, opacity: 0.09, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, depthWrite: false });
    group.add(new THREE.Mesh(geo, mat));
  }
  return group;
}

function makeNpc(kind, x, z, y, options = {}) {
  const group = new THREE.Group();
  let actor;
  if (kind === 'testigo') {
    actor = new THREE.Group();
    const robe = makeMat('#282b58', { roughness: 0.8 });
    const trim = makeMat('#bca3ee', { metalness: 0.6, roughness: 0.3 });
    actor.add(mesh(new THREE.ConeGeometry(0.55, 1.7, 8), robe, [0, 0.85, 0]));
    actor.add(mesh(new THREE.SphereGeometry(0.3, 12, 9), robe, [0, 1.75, 0]));
    const hood = mesh(new THREE.ConeGeometry(0.42, 0.7, 8), robe, [0, 1.98, 0]);
    actor.add(hood);
    actor.add(mesh(new THREE.SphereGeometry(0.2, 10, 8), makeMat('#141423'), [0, 1.75, 0.16], [0, 0, 0], [1, 1.1, 0.6]));
    for (const sx of [-0.08, 0.08]) actor.add(mesh(new THREE.SphereGeometry(0.024, 6, 4), new THREE.MeshBasicMaterial({ color: '#e6dcff' }), [sx, 1.78, 0.31]));
    actor.add(mesh(new THREE.TorusGeometry(0.52, 0.02, 4, 30), new THREE.MeshBasicMaterial({ color: '#bca3ee', transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending }), [0, 0.3, 0], [Math.PI / 2, 0, 0]));
    actor.add(mesh(new THREE.BoxGeometry(0.09, 2.2, 0.09), trim, [0.42, 1.15, 0.05]));
    actor.add(mesh(new THREE.OctahedronGeometry(0.12, 0), new THREE.MeshBasicMaterial({ color: '#e6dcff' }), [0.42, 2.3, 0.05]));
    group.add(actor);
  } else {
    const outfit = kind === 'lira'
      ? { primary: '#2f5c52', secondary: '#3e6f5d', trim: '#e3c17c', metal: '#c9a75f' }
      : { primary: '#63362e', secondary: '#7b4437', trim: '#c48d54', metal: '#8f6a45' };
    actor = createHero({
      skin: kind === 'lira' ? '#8d5c40' : '#9a6a50',
      hairColor: kind === 'lira' ? '#d7d4ca' : '#d0cec7',
      hairStyle: kind === 'lira' ? 'long' : 'wild',
      outfit,
    });
    actor.scale.setScalar(kind === 'lira' ? 0.98 : 0.92);
    actor.userData.rig.sword.visible = false;
    if (kind === 'orin') {
      const beard = mesh(new THREE.ConeGeometry(0.13, 0.34, 7), makeMat('#d0cec7', { roughness: 0.9 }), [0, 1.55, 0.16], [0.15, 0, 0]);
      actor.userData.rig.head.add(beard);
      const hammer = new THREE.Group();
      hammer.add(mesh(new THREE.CylinderGeometry(0.035, 0.045, 1.1, 6), makeMat('#5b4030'), [0, 0.55, 0]));
      hammer.add(mesh(new THREE.BoxGeometry(0.45, 0.22, 0.2), makeMat('#5b5b60', { metalness: 0.8, roughness: 0.4 }), [0, 1.1, 0]));
      hammer.position.set(0.42, 0.5, 0.1);
      hammer.rotation.z = -0.25;
      actor.add(hammer);
    }
    group.add(actor);
  }
  group.position.set(x, y, z);
  group.userData.actor = actor;
  group.userData.kind = kind;
  group.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  return group;
}

function makeLoreStone(x, z, y, index) {
  const group = new THREE.Group();
  const stone = makeMat('#5d5a5c', { roughness: 0.95 });
  const glow = new THREE.MeshBasicMaterial({ color: '#91e7df', transparent: true, opacity: 0.7, blending: THREE.AdditiveBlending });
  group.add(mesh(new THREE.BoxGeometry(0.75, 2.2, 0.4), stone, [0, 1.1, 0]));
  group.add(mesh(new THREE.ConeGeometry(0.45, 0.55, 4), stone, [0, 2.45, 0]));
  for (let i = 0; i < 3; i++) {
    const rune = mesh(new THREE.BoxGeometry(0.22, 0.08, 0.02), glow, [0, 0.6 + i * 0.45, 0.22]);
    rune.rotation.z = i % 2 ? 0.5 : -0.5;
    group.add(rune);
  }
  group.position.set(x, y, z);
  group.userData = { index, glow };
  return group;
}

function makeChest(x, z, y, id) {
  const group = new THREE.Group();
  const wood = makeMat('#5c4030', { roughness: 0.9 });
  const metal = makeMat('#b08a4d', { metalness: 0.8, roughness: 0.3 });
  group.add(mesh(new THREE.BoxGeometry(1.2, 0.65, 0.8), wood, [0, 0.35, 0]));
  group.add(mesh(new THREE.CylinderGeometry(0.6, 0.6, 0.8, 10, 1, false, 0, Math.PI), wood, [0, 0.68, 0], [0, 0, Math.PI / 2], [1, 0.5, 1]));
  for (const sx of [-0.4, 0.4]) group.add(mesh(new THREE.BoxGeometry(0.1, 0.7, 0.85), metal, [sx, 0.4, 0]));
  group.add(mesh(new THREE.BoxGeometry(0.18, 0.2, 0.08), metal, [0, 0.4, 0.43]));
  const glow = new THREE.PointLight('#ffd188', 4, 6, 2);
  glow.position.y = 1;
  group.add(glow);
  group.position.set(x, y, z);
  group.userData = { id, glow };
  return group;
}

function makeMarker(type) {
  const colors = { npc: '#ffe2a1', rift: '#c89aff', seal: '#ff9b6a', portal: '#9df1e9', chest: '#ffd188', lore: '#9df1e9', altar: '#ffe2a1', boss: '#ff8b76' };
  const tex = runeTexture(128, colors[type] || '#ffe2a1');
  const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.9 });
  const sprite = new THREE.Sprite(mat);
  sprite.scale.set(0.85, 0.85, 1);
  sprite.userData.baseY = 0;
  sprite.userData.type = type;
  return sprite;
}

const PATHS = {
  valdoria: [
    [0, 2, 0, -10], [0, -10, 3.6, -11], [0, 2, -30, -20], [-30, -20, -34, 10], [-34, 10, -32, 36],
    [0, 2, 28, -8], [28, -8, 12, 30], [12, 30, -32, 36], [-32, 36, -44, 48], [0, 2, 20, 18], [0, 2, -18, -12],
  ],
  drakmore: [
    [0, -54, 0, -38], [0, -38, 0, 28], [0, 28, 0, 44], [0, -20, -38, 2], [0, -20, 38, -6],
    [0, -38, -24, -20], [0, -38, 26, -22], [0, 28, 0, 44], [-38, 2, 0, 28], [38, -6, 0, 28],
  ],
  kansordore: [
    [0, -55, 0, -38], [0, -38, 0, 8], [0, 8, 0, 22], [0, -20, -38, -2], [0, -20, 38, -2],
    [0, -20, 0, 38], [-38, -2, 0, 22], [38, -2, 0, 22], [0, 38, 0, 22], [0, -55, -20, -42], [0, -55, 20, -42],
  ],
};

function heightFunction(regionId, heightAtOverride) {
  if (heightAtOverride) return heightAtOverride;
  if (regionId === 'valdoria') {
    return (x, z) => {
      let h = 0.5 + fbm(x * 0.035, z * 0.035, 11) * 2.0 + Math.sin(x * 0.075) * 0.42 + Math.cos(z * 0.064) * 0.5;
      h += Math.sin((x + z) * 0.15) * 0.18;
      h = flatten(h, x, z, 0, 2, 10, 0.55);
      h = flatten(h, x, z, 0, -15, 16, 0.4);
      h = flatten(h, x, z, -18, -12, 7, 0.4);
      h = flatten(h, x, z, -30, -20, 9, 0.65);
      h = flatten(h, x, z, 28, -8, 8, 0.55);
      h = flatten(h, x, z, 12, 30, 9, 0.6);
      h = flatten(h, x, z, -32, 38, 15, 1.35, 9);
      h = flatten(h, x, z, -44, 48, 7, 1.1);
      h = flatten(h, x, z, 20, 18, 6, 1.0);
      const river = Math.abs(x - (49 + Math.sin(z * 0.055) * 7));
      if (river < 8) h -= Math.pow(1 - river / 8, 2) * 5.2;
      const d = Math.hypot(x, z);
      if (d > 78) h += (d - 78) * 0.26 + noise2D(x * 0.1, z * 0.1, 4) * (d - 78) * 0.18;
      return h;
    };
  }
  if (regionId === 'drakmore') {
    return (x, z) => {
      let h = 0.3 + fbm(x * 0.04, z * 0.04, 23) * 3.0 + Math.sin(x * 0.06) * 0.55 + Math.cos(z * 0.055) * 0.45;
      h = flatten(h, x, z, 0, -54, 12, 0.3);
      h = flatten(h, x, z, 0, -38, 9, 0.4);
      h = flatten(h, x, z, -38, 2, 8, 0.7);
      h = flatten(h, x, z, 38, -6, 8, 0.7);
      h = flatten(h, x, z, 0, 44, 22, 2.8, 9);
      h = flatten(h, x, z, -24, -20, 7, 0.5);
      h = flatten(h, x, z, 26, -22, 7, 0.5);
      const lava1 = Math.abs(x - (-52 + Math.sin(z * 0.06) * 5));
      const lava2 = Math.abs(x - (54 + Math.cos(z * 0.05) * 4));
      if (lava1 < 7) h -= Math.pow(1 - lava1 / 7, 2) * 5.6;
      if (lava2 < 6) h -= Math.pow(1 - lava2 / 6, 2) * 5.2;
      const d = Math.hypot(x, z);
      if (d > 78) h += (d - 78) * 0.3 + noise2D(x * 0.1, z * 0.1, 8) * (d - 78) * 0.22;
      return h;
    };
  }
  return (x, z) => {
    let h = 1.0 + fbm(x * 0.03, z * 0.03, 37) * 2.4 + Math.sin(x * 0.05) * 0.4 + Math.cos(z * 0.045) * 0.45;
    h = flatten(h, x, z, 0, -55, 13, 1.0);
    h = flatten(h, x, z, 0, -38, 8, 1.4);
    h = flatten(h, x, z, 0, 22, 28, 3.2, 11);
    h = flatten(h, x, z, -38, -2, 8, 1.7);
    h = flatten(h, x, z, 38, -2, 8, 1.7);
    h = flatten(h, x, z, 0, 38, 8, 1.9);
    h = flatten(h, x, z, -20, -42, 6, 1.2);
    h = flatten(h, x, z, 20, -42, 6, 1.2);
    const d = Math.hypot(x, z);
    if (d > 78) h += (d - 78) * 0.22 + noise2D(x * 0.1, z * 0.1, 12) * (d - 78) * 0.15;
    return h;
  };
}

export function buildWorld(scene, regionId, quest = {}, quality = 'high') {
  const region = REGIONS[regionId];
  const group = new THREE.Group();
  group.name = `world-${regionId}`;
  scene.add(group);
  const heightAt = heightFunction(regionId);
  const rng = mulberry32(regionId === 'valdoria' ? 71 : regionId === 'drakmore' ? 912 : 1701);

  scene.fog = new THREE.FogExp2(new THREE.Color(region.sky.fog), regionId === 'drakmore' ? 0.011 : regionId === 'kansordore' ? 0.0085 : 0.0078);
  scene.background = new THREE.Color(region.sky.top);

  // lights
  const hemi = new THREE.HemisphereLight(region.hemi.sky, region.hemi.ground, region.hemi.intensity);
  group.add(hemi);
  const sun = new THREE.DirectionalLight(region.sun.color, region.sun.intensity);
  sun.position.set(...region.sun.position);
  sun.castShadow = true;
  sun.shadow.mapSize.set(quality === 'high' ? 2048 : 1024, quality === 'high' ? 2048 : 1024);
  sun.shadow.camera.left = -60; sun.shadow.camera.right = 60;
  sun.shadow.camera.top = 60; sun.shadow.camera.bottom = -60;
  sun.shadow.camera.near = 1; sun.shadow.camera.far = 180;
  sun.shadow.bias = -0.0006;
  sun.shadow.normalBias = 0.03;
  sun.target.position.set(0, 0, 0);
  group.add(sun, sun.target);
  const fill = new THREE.DirectionalLight(region.sky.mid, regionId === 'drakmore' ? 0.35 : 0.5);
  fill.position.set(-40, 30, -50);
  group.add(fill);

  const sky = makeSky(region);
  group.add(sky);
  const clouds = makeClouds(region, 441 + regionId.length);
  group.add(clouds);
  group.add(makeMountainRing(region, 91 + regionId.length));
  if (regionId === 'kansordore') group.add(makeFloatingIslands(region, 77));

  // terrain
  const seg = quality === 'high' ? 150 : 100;
  const terrainGeo = new THREE.PlaneGeometry(190, 190, seg, seg);
  terrainGeo.rotateX(-Math.PI / 2);
  const pos = terrainGeo.attributes.position;
  const colors = new Float32Array(pos.count * 3);
  const pal = PALETTE[regionId];
  const color = new THREE.Color();
  const baseColors = pal.grass.map((c) => new THREE.Color(c));
  const pathColor = new THREE.Color(region.path);
  const rockColor = new THREE.Color(pal.rock);
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), z = pos.getZ(i);
    const h = heightAt(x, z);
    pos.setY(i, h);
    const dPath = pathDistance(x, z, PATHS[regionId]);
    const slope = Math.abs(heightAt(x + 1.4, z) - heightAt(x - 1.4, z)) + Math.abs(heightAt(x, z + 1.4) - heightAt(x, z - 1.4));
    const n = noise2D(x * 0.15, z * 0.15, 4);
    if (h < region.water.level + 0.3) {
      color.copy(baseColors[0]).multiplyScalar(0.62);
    } else if (dPath < 2.4 + n * 1.1) {
      color.copy(pathColor).offsetHSL(0, 0, (n - 0.5) * 0.08);
    } else {
      const idx = Math.floor(n * baseColors.length) % baseColors.length;
      color.copy(baseColors[idx]);
      if (slope > 2.4 || h > 9) color.lerp(rockColor, clamp((slope - 2.4) * 0.3 + (h - 9) * 0.08, 0, 0.65));
      color.offsetHSL(0, 0, (noise2D(x * 0.4, z * 0.4, 8) - 0.5) * 0.06);
    }
    colors[i * 3] = color.r; colors[i * 3 + 1] = color.g; colors[i * 3 + 2] = color.b;
  }
  terrainGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  terrainGeo.computeVertexNormals();
  const terrainMat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.97, metalness: 0.01 });
  const terrain = new THREE.Mesh(terrainGeo, terrainMat);
  terrain.receiveShadow = true;
  terrain.castShadow = true;
  group.add(terrain);

  const water = makeWater(region, regionId === 'drakmore');
  group.add(water);

  const colliders = [];
  const isClear = (x, z, pad = 0) => {
    const safe = [
      [0, 2, 11], [0, -15, 18], [-32, 38, 16], [-44, 48, 9], [20, 18, 7],
      [-38, 2, 10], [38, -6, 10], [0, 44, 25], [0, -54, 14],
      [0, -55, 14], [0, 22, 30], [0, -38, 10], [0, 38, 10],
    ];
    for (const [cx, cz, r] of safe) if (Math.hypot(x - cx, z - cz) < r + pad) return false;
    for (const c of colliders) if (Math.hypot(x - c.x, z - c.z) < c.r + pad) return false;
    return true;
  };

  // instanced vegetation
  const grassCount = regionId === 'valdoria' ? 3400 : regionId === 'drakmore' ? 900 : 1300;
  const grass = makeGrass(regionId, heightAt, grassCount, 10 + regionId.length, isClear);
  group.add(grass);
  const trees = makeTrees(regionId, heightAt, regionId === 'valdoria' ? 86 : regionId === 'drakmore' ? 34 : 42, 30 + regionId.length, isClear);
  group.add(trees);
  if (trees.userData.colliders) colliders.push(...trees.userData.colliders);
  const rocks = makeRocks(regionId, heightAt, regionId === 'valdoria' ? 54 : regionId === 'drakmore' ? 90 : 48, 50 + regionId.length, isClear);
  group.add(rocks);
  if (rocks.userData.colliders) colliders.push(...rocks.userData.colliders);
  const flowers = makeFlowers(regionId, heightAt, regionId === 'valdoria' ? 420 : regionId === 'kansordore' ? 260 : 80, 70 + regionId.length, isClear);
  group.add(flowers);

  const particles = makeParticles(region, 120 + regionId.length);
  group.add(particles);

  const interactables = [];
  const poi = [];
  const creatureSpawns = [];
  const markers = [];

  const addInteractable = (opts) => {
    const marker = makeMarker(opts.type);
    const y = opts.markerY ?? (heightAt(opts.x, opts.z) + (opts.markerOffset ?? 2.3));
    marker.position.set(opts.x, y, opts.z);
    marker.userData.baseY = y;
    marker.userData.phase = rng() * Math.PI * 2;
    group.add(marker);
    markers.push(marker);
    const obj = { ...opts, marker, markerBaseY: y };
    interactables.push(obj);
    return obj;
  };

  let village, ruins, fortress, temple, portal, altar;
  const fires = [];
  const windmills = [];
  const rifts = [];
  const seals = [];
  const shards = [];
  const runeRings = [];
  const portalGlows = [];

  if (regionId === 'valdoria') {
    village = makeVillage(heightAt);
    group.add(village);
    colliders.push(...(village.userData.colliders || []));
    fires.push(village.userData.fire);
    windmills.push(village);
    const liraY = heightAt(4.2, -6.5);
    const lira = makeNpc('lira', 4.2, -6.5, liraY);
    group.add(lira);
    addInteractable({ id: 'lira', type: 'npc', x: 4.2, z: -6.5, y: liraY, label: 'Hablar con Lira', action: 'npc:lira', radius: 3.2, markerOffset: 2.5 });
    poi.push({ x: 4.2, z: -6.5, type: 'npc', label: 'Lira' });
    poi.push({ x: 0, z: -15, type: 'village', label: 'Aldea de la Aurora' });

    ruins = makeRuins(heightAt);
    group.add(ruins);
    colliders.push(...(ruins.userData.colliders || []));
    shards.push(...(ruins.userData.shards || []));
    runeRings.push(ruins.userData.runeRing);

    const riftPositions = [[-30, -20], [28, -8], [12, 30]];
    for (let i = 0; i < 3; i++) {
      const [x, z] = riftPositions[i];
      const y = heightAt(x, z);
      const rift = makeRift(x, z, y, i);
      group.add(rift);
      rifts.push(rift);
      const cleaned = quest.cleansedRifts?.includes(i) || quest.stage > 1;
      if (cleaned) setRiftVisual(rift, true);
      addInteractable({ id: `rift-${i}`, type: 'rift', x, z, y, label: 'Purga el foco de corrupción', action: `rift:${i}`, radius: 3.5, markerOffset: 2.7 });
      poi.push({ x, z, type: cleaned ? 'done' : 'rift', label: `Foco de corrupción ${i + 1}` });
    }
    // altar
    const altarY = heightAt(-32, 38) + 0.5;
    altar = makeAltar(-32, 38, altarY, '#b8f3e8');
    group.add(altar);
    addInteractable({ id: 'altar-valdoria', type: 'altar', x: -32, z: 38, y: altarY, label: 'Tomar el Fragmento de la Gema', action: 'altar:valdoria', radius: 3.2, markerOffset: 2.6 });
    poi.push({ x: -32, z: 38, type: 'boss', label: 'Santuario de la Grieta' });

    const portalY = heightAt(-44, 48);
    portal = makePortal(-44, 48, portalY, regionId, quest.stage >= 4);
    group.add(portal);
    portalGlows.push(portal);
    addInteractable({ id: 'portal-valdoria', type: 'portal', x: -44, z: 48, y: portalY, label: quest.stage >= 4 ? 'Atravesar la Puerta de Drakmore' : 'La puerta aún duerme', action: 'portal:drakmore', radius: 4.2, markerOffset: 5.2, disabled: quest.stage < 4 });
    poi.push({ x: -44, z: 48, type: 'portal', label: 'Puerta de Drakmore' });

    // giant tree
    const gt = new THREE.Group();
    const trunk = mesh(new THREE.CylinderGeometry(1.4, 2.2, 12, 8), makeMat('#4c3b2d'), [0, 6, 0]);
    gt.add(trunk);
    for (let i = 0; i < 9; i++) {
      const a = (i / 9) * Math.PI * 2;
      const r = 3 + (i % 3);
      gt.add(mesh(new THREE.IcosahedronGeometry(2.2 + (i % 3) * 0.6, 1), makeMat(['#4c7547', '#5b844f', '#6b9459'][i % 3], { flat: true }), [Math.cos(a) * r, 12 + (i % 4) * 1.5, Math.sin(a) * r]));
    }
    gt.position.set(20, heightAt(20, 18), 18);
    group.add(gt);
    colliders.push({ x: 20, z: 18, r: 2.3 });
    poi.push({ x: 20, z: 18, type: 'landmark', label: 'El Árbol del Juramento' });

    // chest and lore
    group.add(makeChest(18, 24, heightAt(18, 24), 'valdoria-chest'));
    addInteractable({ id: 'chest-valdoria', type: 'chest', x: 18, z: 24, y: heightAt(18, 24), label: 'Abrir cofre antiguo', action: 'chest:valdoria-chest', radius: 2.8, markerOffset: 1.9 });
    group.add(makeLoreStone(-14, 26, heightAt(-14, 26), 0));
    addInteractable({ id: 'lore-valdoria', type: 'lore', x: -14, z: 26, y: heightAt(-14, 26), label: 'Leer la estela del Velo', action: 'lore:gema', radius: 2.6, markerOffset: 2.5 });

    creatureSpawns.push(
      { id: 'lumin', x: 7, z: -8, primordial: false },
      { id: 'bruma', x: -23, z: 4, primordial: false },
      { id: 'terravok', x: 23, z: 22, primordial: false },
    );
  } else if (regionId === 'drakmore') {
    const camp = new THREE.Group();
    const tentMat = makeMat('#5b3730', { side: THREE.DoubleSide });
    const tent = mesh(new THREE.ConeGeometry(2.6, 2.4, 4), tentMat, [0, 1.2, 0], [0, Math.PI / 4, 0]);
    camp.add(tent);
    camp.add(mesh(new THREE.BoxGeometry(2.4, 0.2, 2.4), makeMat('#3e2d27'), [0, 0.1, 0]));
    const anvil = mesh(new THREE.BoxGeometry(0.8, 0.4, 0.45), makeMat('#4a4a50', { metalness: 0.8, roughness: 0.35 }), [3, 0.6, 0]);
    camp.add(anvil);
    camp.add(mesh(new THREE.BoxGeometry(0.55, 0.35, 0.55), makeMat('#2c2727'), [3, 0.2, 0]));
    const campfire = new THREE.Group();
    for (let i = 0; i < 5; i++) campfire.add(mesh(new THREE.DodecahedronGeometry(0.18, 0), makeMat('#39302c'), [Math.cos(i) * 0.45, 0.08, Math.sin(i) * 0.45]));
    const cf = new THREE.Mesh(new THREE.ConeGeometry(0.3, 1, 6), new THREE.MeshBasicMaterial({ color: '#ff8a45', transparent: true, opacity: 0.9 }));
    cf.position.y = 0.55;
    campfire.add(cf);
    const cfLight = new THREE.PointLight('#ff8a45', 10, 15, 2);
    cfLight.position.y = 0.9;
    campfire.add(cfLight);
    campfire.position.set(-2.8, 0, 0.8);
    camp.add(campfire);
    fires.push({ flame: cf, light: cfLight });
    camp.position.set(0, heightAt(0, -50), -50);
    group.add(camp);
    colliders.push({ x: 0, z: -50, r: 2.8 });
    const orinY = heightAt(2.2, -48);
    const orin = makeNpc('orin', 2.2, -48, orinY);
    group.add(orin);
    addInteractable({ id: 'orin', type: 'npc', x: 2.2, z: -48, y: orinY, label: 'Hablar con Orin', action: 'npc:orin', radius: 3.2, markerOffset: 2.4 });
    poi.push({ x: 0, z: -50, type: 'camp', label: 'Campamento de Ceniza' });
    poi.push({ x: 2.2, z: -48, type: 'npc', label: 'Orin' });

    fortress = makeDrakFortress(heightAt);
    group.add(fortress);
    colliders.push(...(fortress.userData.colliders || []));
    poi.push({ x: 0, z: 44, type: 'boss', label: 'Fortaleza de Kael' });
    const altarY = heightAt(0, 49) + 0.7;
    altar = fortress.userData.altar;
    addInteractable({ id: 'altar-drakmore', type: 'altar', x: 0, z: 49, y: altarY, label: 'Tomar la Lágrima de la Primera Brasa', action: 'altar:drakmore', radius: 3.2, markerOffset: 2.6 });

    const sealPositions = [[-38, 2], [38, -6]];
    for (let i = 0; i < 2; i++) {
      const [x, z] = sealPositions[i];
      const y = heightAt(x, z);
      const seal = makeSeal(x, z, y, i, '#ff7a3f');
      group.add(seal);
      seals.push(seal);
      const broken = quest.brokenSeals?.includes(i) || quest.stage > 1;
      if (broken) setSealVisual(seal, true);
      addInteractable({ id: `seal-${i}`, type: 'seal', x, z, y, label: 'Rompe el sello de la Fortaleza', action: `seal:${i}`, radius: 3.4, markerOffset: 2.8 });
      poi.push({ x, z, type: broken ? 'done' : 'seal', label: `Sello de ceniza ${i + 1}` });
    }

    const portalY = heightAt(0, -61);
    portal = makePortal(0, -61, portalY, regionId, quest.stage >= 4);
    group.add(portal);
    portalGlows.push(portal);
    addInteractable({ id: 'portal-drakmore', type: 'portal', x: 0, z: -61, y: portalY, label: quest.stage >= 4 ? 'Cruzar a Kansordore' : 'El portal aún está sellado', action: 'portal:kansordore', radius: 4.2, markerOffset: 5.2, disabled: quest.stage < 4 });
    poi.push({ x: 0, z: -61, type: 'portal', label: 'Portal de Kansordore' });

    group.add(makeChest(-29, -17, heightAt(-29, -17), 'drakmore-chest'));
    addInteractable({ id: 'chest-drakmore', type: 'chest', x: -29, z: -17, y: heightAt(-29, -17), label: 'Abrir cofre de ceniza', action: 'chest:drakmore-chest', radius: 2.8, markerOffset: 1.9 });
    group.add(makeLoreStone(24, 24, heightAt(24, 24), 1));
    addInteractable({ id: 'lore-drakmore', type: 'lore', x: 24, z: 24, y: heightAt(24, 24), label: 'Leer la estela de ceniza', action: 'lore:lagrima', radius: 2.6, markerOffset: 2.5 });

    creatureSpawns.push(
      { id: 'chispa', x: -25, z: -12, primordial: false },
      { id: 'aeris', x: 27, z: 4, primordial: false },
    );
  } else {
    temple = makeTemple(heightAt);
    group.add(temple);
    colliders.push(...(temple.userData.colliders || []));
    runeRings.push(...(temple.userData.rings || []));
    poi.push({ x: 0, z: 22, type: 'temple', label: 'Templo del Velo' });

    const testigoY = heightAt(0, -38);
    const testigo = makeNpc('testigo', 0, -38, testigoY);
    group.add(testigo);
    addInteractable({ id: 'testigo', type: 'npc', x: 0, z: -38, y: testigoY, label: 'Escuchar al Testigo', action: 'npc:testigo', radius: 3.2, markerOffset: 2.5 });
    poi.push({ x: 0, z: -38, type: 'npc', label: 'El Testigo' });

    const altarY = heightAt(0, 25) + 1.8;
    altar = temple.userData.altar;
    addInteractable({ id: 'altar-kansordore', type: 'altar', x: 0, z: 25, y: altarY, label: 'Tocar el Núcleo de la Convergencia', action: 'altar:kansordore', radius: 3.4, markerOffset: 2.7 });
    poi.push({ x: 0, z: 22, type: 'boss', label: 'Núcleo de la Convergencia' });

    const sealPositions = [[-38, -2], [38, -2], [0, 38]];
    for (let i = 0; i < 3; i++) {
      const [x, z] = sealPositions[i];
      const y = heightAt(x, z);
      const seal = makeSeal(x, z, y, i, '#bca3ee');
      group.add(seal);
      seals.push(seal);
      const done = quest.primordialSeals?.includes(i) || quest.stage > 1;
      if (done) setSealVisual(seal, true);
      addInteractable({ id: `primordial-${i}`, type: 'seal', x, z, y, label: 'Resuena con el Eco Primordial', action: `primordial:${i}`, radius: 4.2, markerOffset: 2.8 });
      poi.push({ x, z, type: done ? 'done' : 'seal', label: `Sello Primordial ${i + 1}` });
    }

    // central gate visual
    const gate = new THREE.Group();
    const gold = makeMat('#c9a75f', { metalness: 0.8, roughness: 0.3 });
    const glow = new THREE.MeshBasicMaterial({ color: '#d9ccff', transparent: true, opacity: 0.7, blending: THREE.AdditiveBlending });
    gate.add(mesh(new THREE.TorusGeometry(3.2, 0.18, 8, 36), gold, [0, 3.8, 0]));
    gate.add(mesh(new THREE.TorusGeometry(2.6, 0.04, 4, 36), glow, [0, 3.8, 0.08]));
    gate.position.set(0, heightAt(0, 25) + 1.9, 25);
    group.add(gate);
    group.userData.gate = gate;

    group.add(makeChest(28, 12, heightAt(28, 12), 'kansordore-chest'));
    addInteractable({ id: 'chest-kansordore', type: 'chest', x: 28, z: 12, y: heightAt(28, 12), label: 'Abrir cofre celestial', action: 'chest:kansordore-chest', radius: 2.8, markerOffset: 1.9 });
    group.add(makeLoreStone(-22, 34, heightAt(-22, 34), 2));
    addInteractable({ id: 'lore-kansordore', type: 'lore', x: -22, z: 34, y: heightAt(-22, 34), label: 'Leer la estela de luz', action: 'lore:profecia', radius: 2.6, markerOffset: 2.5 });

    creatureSpawns.push(
      { id: 'lumin', x: -38, z: -2, primordial: true },
      { id: 'chispa', x: 38, z: -2, primordial: true },
      { id: 'astral', x: 0, z: 38, primordial: true },
      { id: 'seraph', x: -19, z: 9, primordial: false },
    );
  }

  // make marker visibility
  for (const it of interactables) {
    if (it.disabled) it.marker.visible = false;
  }

  // player spawn
  const spawn = { x: region.spawn.x, z: region.spawn.z, y: heightAt(region.spawn.x, region.spawn.z) };
  if (regionId === 'drakmore') spawn.y = heightAt(0, -54);
  if (regionId === 'kansordore') spawn.y = heightAt(0, -55);

  const world = {
    id: regionId,
    region,
    group,
    scene,
    heightAt,
    colliders,
    interactables,
    poi,
    creatureSpawns,
    markers,
    spawn,
    portal,
    portalGlows,
    altar,
    rifts,
    seals,
    shards,
    runeRings,
    fires,
    windmills,
    water,
    particles,
    sky,
    clouds,
    terrain,
    bounds: 88,
    bossTrigger: regionId === 'valdoria' ? { x: -32, z: 38, r: 12 } : regionId === 'drakmore' ? { x: 0, z: 44, r: 13 } : { x: 0, z: 22, r: 10 },
    hazardAt: (x, z) => heightAt(x, z) < region.water.level + 0.28,
    setRiftCleansed(index) {
      const rift = rifts[index];
      if (rift) setRiftVisual(rift, true);
      const it = interactables.find((o) => o.id === `rift-${index}`);
      if (it) { it.disabled = true; it.marker.visible = false; }
      const p = poi.find((o) => o.label === `Foco de corrupción ${index + 1}`);
      if (p) p.type = 'done';
    },
    setSealBroken(index) {
      const seal = seals[index];
      if (seal) setSealVisual(seal, true);
      const it = interactables.find((o) => o.id === `seal-${index}` || o.id === `primordial-${index}`);
      if (it) { it.disabled = true; it.marker.visible = false; }
      const p = poi.find((o) => o.label.includes('Sello') && o.label.includes(String(index + 1)));
      if (p) p.type = 'done';
    },
    openPortal() {
      for (const p of portalGlows) {
        p.userData.active = true;
        p.userData.light.intensity = 16;
        p.userData.disc.material.opacity = 0.9;
      }
      const it = interactables.find((o) => o.type === 'portal');
      if (it) { it.disabled = false; it.marker.visible = true; it.label = regionId === 'valdoria' ? 'Atravesar la Puerta de Drakmore' : 'Cruzar a Kansordore'; }
    },
    getNpc(kind) {
      const it = interactables.find((o) => o.id === kind);
      if (!it) return null;
      return group.children.find((c) => c.userData.kind === kind);
    },
    update(dt, time) {
      sky.userData.skyMat.uniforms.uTime.value = time;
      water.userData.mat.uniforms.uTime.value = time;
      particles.userData.mat.uniforms.uTime.value = time;
      grass.userData.uniforms.uTime.value = time;
      clouds.children.forEach((c) => { c.position.x += c.userData.drift * dt; if (c.position.x > 190) c.position.x = -190; });
      for (const f of fires) {
        if (!f) continue;
        const flicker = 0.85 + Math.sin(time * 12 + Math.sin(time * 3)) * 0.15;
        if (f.flame) f.flame.scale.set(0.85 + flicker * 0.15, flicker, 0.85 + flicker * 0.15);
        if (f.light) f.light.intensity = 7 + flicker * 4;
      }
      for (const w of windmills) {
        const blades = w.userData.blades;
        if (blades) blades.rotation.z += dt * 0.35;
      }
      for (const r of rifts) {
        if (!r.userData.cleansed) {
          r.userData.core.rotation.y += dt * 0.6;
          r.userData.core.position.y = 1.35 + Math.sin(time * 2 + r.userData.index) * 0.12;
          r.userData.ring.rotation.z += dt * 0.4;
        }
      }
      for (const s of seals) {
        if (!s.userData.broken) {
          s.userData.orb.rotation.y += dt * 0.5;
          s.userData.orb.position.y = 3.8 + Math.sin(time * 2.2 + s.userData.index) * 0.1;
          s.userData.ring.rotation.z += dt * 0.2;
        }
      }
      for (const s of shards) {
        s.position.y = s.userData.baseY + Math.sin(time * 1.2 + s.userData.phase) * 0.35;
        s.rotation.y += dt * 0.4;
      }
      for (const ring of runeRings) {
        if (ring?.userData?.spin) ring.rotation.z += dt * ring.userData.spin;
      }
      for (const p of portalGlows) {
        if (p.userData.active) {
          p.userData.disc.material.opacity = 0.72 + Math.sin(time * 2.2) * 0.14;
          p.userData.swirl.rotation.z += dt * 0.7;
          p.userData.runes.rotation.z += dt * 0.25;
          p.userData.light.intensity = 13 + Math.sin(time * 2.4) * 4;
        }
      }
      if (village?.userData?.shrineCrystal) {
        village.userData.shrineCrystal.rotation.y += dt * 0.7;
        village.userData.shrineCrystal.position.y = 2.35 + Math.sin(time * 2) * 0.1;
      }
      if (temple?.userData?.rings) {
        for (const r of temple.userData.rings) r.rotation.z += dt * r.userData.spin;
      }
      // NPC idle
      const npcGroup = group.children.find((c) => c.userData.actor && c.userData.kind !== 'testigo');
      if (npcGroup?.userData.actor?.userData.rig) poseHero(npcGroup.userData.actor, { speed: 0 }, dt, time);
      const testigo = group.children.find((c) => c.userData.kind === 'testigo');
      if (testigo?.userData.actor) {
        testigo.userData.actor.position.y = Math.sin(time * 1.2) * 0.05;
        testigo.userData.actor.rotation.y = Math.sin(time * 0.4) * 0.15;
      }
      for (const m of markers) {
        m.position.y = m.userData.baseY + Math.sin(time * 1.8 + m.userData.phase) * 0.12;
        m.material.opacity = 0.65 + Math.sin(time * 2 + m.userData.phase) * 0.2;
      }
    },
    dispose() {
      scene.remove(group);
      disposeObject(group);
      scene.fog = null;
    },
  };

  // mark boss trigger POI maybe
  return world;
}

function setRiftVisual(rift, cleansed) {
  rift.userData.cleansed = cleansed;
  if (cleansed) {
    rift.userData.core.material.color.set('#b8f3e8');
    rift.userData.core.material.emissive.set('#7de0d3');
    rift.userData.core.material.emissiveIntensity = 1.2;
    rift.userData.ring.material.color.set('#8fe8dd');
    rift.userData.light.color.set('#8fe8dd');
    rift.userData.light.intensity = 2;
  }
}

function setSealVisual(seal, broken) {
  seal.userData.broken = broken;
  if (broken) {
    seal.userData.orb.material.color.set('#9df1e9');
    seal.userData.orb.material.opacity = 0.2;
    seal.userData.ring.material.color.set('#9df1e9');
    seal.userData.ring.material.opacity = 0.2;
    seal.userData.light.color.set('#9df1e9');
    seal.userData.light.intensity = 1.5;
    seal.userData.orb.scale.setScalar(0.4);
  }
}

export function setWorldQuality(world, quality) {
  // reserved for runtime quality changes; world is rebuilt by the game when needed
  return world;
}
