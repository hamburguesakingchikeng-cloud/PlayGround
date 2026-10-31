import * as THREE from 'three';
import { REGIONS, CREATURES, LORE } from './data.js';
import {
  TAU, clamp, lerp, smoothstep, mulberry32, toonGradient, toonMaterial,
  standardMaterial, glowTexture, cloudTexture, glowSprite, addGlow,
  box, cyl, sphere, cone, makeRing, setShadow,
} from './three-utils.js';
import { buildNPC, createQuestMarker } from './models.js';

const v3 = (x, y, z) => new THREE.Vector3(x, y, z);

export class World {
  constructor(game, regionId) {
    this.game = game;
    this.regionId = regionId;
    this.region = REGIONS[regionId];
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(this.region.palette.fog, this.region.palette.fogDensity);
    this.colliders = [];
    this.interactables = [];
    this.npcSpawns = [];
    this.enemySpawns = [];
    this.creatureSpawns = [];
    this.landmarks = {};
    this.markers = [];
    this.dynamic = [];
    this.rng = mulberry32(regionId === 'valdoria' ? 817 : regionId === 'drakmor' ? 991 : 1201);
    this.time = 0;
    this.camera = game.camera;
    this.build();
  }

  heightAt(x, z) {
    if (this.regionId === 'valdoria') {
      const dVillage = Math.hypot(x, z);
      const dShrine = Math.hypot(x - 58, z + 38);
      let h = Math.sin(x * 0.035) * 1.2 * Math.cos(z * 0.031) +
        Math.sin(x * 0.082 + z * 0.047) * 0.55 +
        Math.cos(x * 0.13) * Math.sin(z * 0.11) * 0.28;
      h += Math.max(0, Math.hypot(x, z) - 58) * 0.055;
      h = lerp(0.12, h, smoothstep(8, 24, dVillage));
      h = lerp(1.45, h, smoothstep(9, 22, dShrine));
      const dLake = Math.hypot(x + 60, z - 54);
      h -= (1 - smoothstep(10, 26, dLake)) * 2.2;
      return h;
    }
    if (this.regionId === 'drakmor') {
      const dCamp = Math.hypot(x + 58, z - 48);
      const dFort = Math.hypot(x - 25, z + 30);
      let h = Math.sin(x * 0.055 + 1.2) * 1.4 * Math.cos(z * 0.041) +
        Math.sin(x * 0.13) * Math.sin(z * 0.09) * 0.75 +
        Math.abs(Math.sin(x * 0.022 + z * 0.031)) * 1.1;
      h += Math.max(0, Math.hypot(x, z) - 48) * 0.07;
      h = lerp(0.25, h, smoothstep(8, 24, dCamp));
      h = lerp(0.5, h, smoothstep(16, 34, dFort));
      const dLava = Math.hypot(x - 55, z - 50);
      h -= (1 - smoothstep(8, 22, dLava)) * 3.5;
      return h;
    }
    const dSpawn = Math.hypot(x + 56, z - 48);
    const dArchive = Math.hypot(x, z);
    let h = Math.sin(x * 0.03) * 1.0 + Math.cos(z * 0.037) * 0.9 +
      Math.sin(x * 0.08 + z * 0.06) * 0.3;
    h += Math.max(0, Math.hypot(x, z) - 45) * 0.04;
    h = lerp(0.4, h, smoothstep(9, 25, dSpawn));
    h = lerp(0.9, h, smoothstep(18, 38, dArchive));
    return h;
  }

  addCollider(x, z, r) {
    this.colliders.push({ x, z, r });
  }

  build() {
    this.buildSky();
    this.buildLights();
    this.buildTerrain();
    this.buildRoads();
    this.buildAmbientParticles();
    if (this.regionId === 'valdoria') this.buildValdoria();
    if (this.regionId === 'drakmor') this.buildDrakmor();
    if (this.regionId === 'kansordore') this.buildKansordore();
    this.buildLore();
    this.buildWaystones();
  }

  buildSky() {
    const p = this.region.palette;
    const geo = new THREE.SphereGeometry(280, 32, 20);
    const mat = new THREE.ShaderMaterial({
      side: THREE.BackSide,
      depthWrite: false,
      fog: false,
      uniforms: {
        topColor: { value: new THREE.Color(p.skyTop) },
        bottomColor: { value: new THREE.Color(p.skyBottom) },
        sunColor: { value: new THREE.Color(p.sun) },
        sunDir: { value: new THREE.Vector3(...p.sunPos).normalize() },
        offset: { value: 12 },
        exponent: { value: 0.82 },
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
        uniform float offset;
        uniform float exponent;
        varying vec3 vWorldPosition;
        void main() {
          vec3 dir = normalize(vWorldPosition);
          float h = max(0.0, dir.y + offset * 0.01);
          vec3 col = mix(bottomColor, topColor, pow(h, exponent));
          float sun = pow(max(dot(dir, normalize(sunDir)), 0.0), 220.0);
          float halo = pow(max(dot(dir, normalize(sunDir)), 0.0), 9.0);
          col += sunColor * sun * 1.7 + sunColor * halo * 0.16;
          float horizon = pow(1.0 - abs(dir.y), 5.0);
          col += bottomColor * horizon * 0.1;
          gl_FragColor = vec4(col, 1.0);
        }
      `,
    });
    const sky = new THREE.Mesh(geo, mat);
    sky.frustumCulled = false;
    this.scene.add(sky);
    this.sky = sky;

    const sun = glowSprite(p.sun, 32, 0.42);
    sun.position.copy(new THREE.Vector3(...p.sunPos).normalize().multiplyScalar(230));
    this.scene.add(sun);

    if (this.regionId === 'kansordore') {
      const rng = mulberry32(88);
      const positions = [];
      const colors = [];
      for (let i = 0; i < 900; i++) {
        const theta = rng() * TAU;
        const phi = Math.acos(rng() * 0.9);
        const r = 240;
        positions.push(r * Math.sin(phi) * Math.cos(theta), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(theta));
        const c = new THREE.Color(rng() > 0.7 ? '#ffd9f0' : '#c9e7ff');
        colors.push(c.r, c.g, c.b);
      }
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
      g.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
      const stars = new THREE.Points(g, new THREE.PointsMaterial({
        size: 1.4, vertexColors: true, transparent: true, opacity: 0.8,
        depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true,
      }));
      stars.frustumCulled = false;
      this.scene.add(stars);
      this.stars = stars;
    }

    const cloudMat = new THREE.SpriteMaterial({
      map: cloudTexture(), transparent: true, opacity: this.regionId === 'drakmor' ? 0.15 : 0.2,
      depthWrite: false, color: this.regionId === 'drakmor' ? '#7a4040' : '#ffffff',
    });
    this.clouds = [];
    for (let i = 0; i < 14; i++) {
      const s = new THREE.Sprite(cloudMat.clone());
      const scale = 40 + this.rng() * 50;
      s.scale.set(scale, scale * 0.42, 1);
      s.position.set((this.rng() - 0.5) * 300, 40 + this.rng() * 45, (this.rng() - 0.5) * 300);
      s.material.opacity = 0.08 + this.rng() * 0.15;
      this.scene.add(s);
      this.clouds.push(s);
    }
  }

  buildLights() {
    const p = this.region.palette;
    const hemi = new THREE.HemisphereLight(p.hemiSky, p.hemiGround, p.hemiIntensity);
    this.scene.add(hemi);
    const sun = new THREE.DirectionalLight(p.sun, p.sunIntensity);
    sun.position.set(...p.sunPos);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1536, 1536);
    sun.shadow.camera.near = 1;
    sun.shadow.camera.far = 190;
    const s = 68;
    sun.shadow.camera.left = -s;
    sun.shadow.camera.right = s;
    sun.shadow.camera.top = s;
    sun.shadow.camera.bottom = -s;
    sun.shadow.bias = -0.0012;
    sun.shadow.normalBias = 0.02;
    this.scene.add(sun);
    this.sun = sun;
    const fill = new THREE.DirectionalLight(p.accent2, 0.32);
    fill.position.set(-40, 24, -30);
    this.scene.add(fill);
  }

  buildTerrain() {
    const p = this.region.palette;
    const size = 220;
    const seg = 96;
    const geo = new THREE.PlaneGeometry(size, size, seg, seg);
    geo.rotateX(-Math.PI / 2);
    const pos = geo.attributes.position;
    const colors = [];
    const cLow = new THREE.Color(p.low);
    const cMid = new THREE.Color(p.mid);
    const cHigh = new THREE.Color(p.high);
    const rng = mulberry32(this.regionId === 'valdoria' ? 42 : this.regionId === 'drakmor' ? 73 : 104);
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      const y = this.heightAt(x, z);
      pos.setY(i, y);
      const n = rng() * 0.12;
      const t = clamp((y + 2) / 5, 0, 1);
      const c = t < 0.55 ? cLow.clone().lerp(cMid, t / 0.55) : cMid.clone().lerp(cHigh, (t - 0.55) / 0.45);
      c.offsetHSL((n - 0.06) * 0.03, n * 0.06, (n - 0.06) * 0.05);
      colors.push(c.r, c.g, c.b);
    }
    geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geo.computeVertexNormals();
    const mat = new THREE.MeshToonMaterial({ vertexColors: true, gradientMap: toonGradient() });
    const terrain = new THREE.Mesh(geo, mat);
    terrain.receiveShadow = true;
    terrain.castShadow = false;
    this.scene.add(terrain);
    this.terrain = terrain;

    // subtle rim beneath the world
    const rim = new THREE.Mesh(
      new THREE.CylinderGeometry(150, 142, 3, 64, 1, true),
      new THREE.MeshBasicMaterial({ color: p.low, side: THREE.BackSide }),
    );
    rim.position.y = -1.4;
    this.scene.add(rim);
  }

  buildRoads() {
    const p = this.region.palette;
    const mat = new THREE.MeshStandardMaterial({ color: p.path, roughness: 1, metalness: 0 });
    let roads = [];
    if (this.regionId === 'valdoria') {
      roads = [
        [{ x: 0, z: 10 }, { x: 4, z: -10 }, { x: 20, z: -20 }, { x: 42, z: -28 }, { x: 58, z: -38 }],
        [{ x: 0, z: 0 }, { x: -22, z: 15 }, { x: -42, z: 32 }, { x: -56, z: 46 }],
        [{ x: 0, z: 0 }, { x: 20, z: 22 }, { x: 34, z: 44 }, { x: 46, z: 62 }],
      ];
    } else if (this.regionId === 'drakmor') {
      roads = [
        [{ x: -58, z: 48 }, { x: -42, z: 30 }, { x: -20, z: 10 }, { x: 2, z: -4 }, { x: 16, z: -12 }, { x: 25, z: -24 }],
        [{ x: 25, z: -24 }, { x: 42, z: -12 }, { x: 55, z: 10 }, { x: 60, z: 30 }],
      ];
    } else {
      roads = [
        [{ x: -56, z: 48 }, { x: -42, z: 30 }, { x: -25, z: 18 }, { x: -12, z: 8 }, { x: 0, z: 2 }],
        [{ x: 0, z: 2 }, { x: 22, z: -10 }, { x: 32, z: -28 }, { x: 30, z: -48 }, { x: 8, z: -62 }],
        [{ x: 0, z: 2 }, { x: -22, z: -10 }, { x: -34, z: -26 }, { x: -28, z: -46 }, { x: -8, z: -60 }],
      ];
    }
    for (const points of roads) {
      this.scene.add(this.makeRibbon(points, 3.2, mat));
    }
  }

  makeRibbon(points, width, material) {
    const curve = new THREE.CatmullRomCurve3(points.map((p) => v3(p.x, 0, p.z)));
    const segs = 60;
    const positions = [];
    const indices = [];
    for (let i = 0; i <= segs; i++) {
      const t = i / segs;
      const pt = curve.getPoint(t);
      const tan = curve.getTangent(t).normalize();
      const nx = -tan.z;
      const nz = tan.x;
      const hw = width / 2;
      for (const s of [-1, 1]) {
        const x = pt.x + nx * hw * s;
        const z = pt.z + nz * hw * s;
        positions.push(x, this.heightAt(x, z) + 0.06, z);
      }
      if (i < segs) {
        const a = i * 2;
        indices.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    g.setIndex(indices);
    g.computeVertexNormals();
    const mesh = new THREE.Mesh(g, material);
    mesh.receiveShadow = true;
    return mesh;
  }

  buildAmbientParticles() {
    const p = this.region.palette;
    const count = this.regionId === 'kansordore' ? 260 : this.regionId === 'drakmor' ? 220 : 170;
    const positions = new Float32Array(count * 3);
    const seeds = [];
    for (let i = 0; i < count; i++) {
      const x = (this.rng() - 0.5) * 150;
      const z = (this.rng() - 0.5) * 150;
      positions[i * 3] = x;
      positions[i * 3 + 1] = this.heightAt(x, z) + 0.4 + this.rng() * 6;
      positions[i * 3 + 2] = z;
      seeds.push({ x, z, base: positions[i * 3 + 1], phase: this.rng() * TAU, speed: 0.2 + this.rng() * 0.5 });
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const color = this.regionId === 'drakmor' ? '#ff8a4a' : this.regionId === 'kansordore' ? '#9ef0ff' : '#fff0b8';
    const mat = new THREE.PointsMaterial({
      color, size: this.regionId === 'kansordore' ? 0.24 : 0.18,
      map: glowTexture(), transparent: true, opacity: 0.75,
      depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true,
    });
    const points = new THREE.Points(geo, mat);
    this.scene.add(points);
    this.motes = { points, seeds, positions };
  }

  /* ------------------------------------------------------------------ */
  /* Valdoria                                                            */
  /* ------------------------------------------------------------------ */

  buildValdoria() {
    const p = this.region.palette;
    this.landmarks.village = { x: 0, z: 0, name: 'Lumen' };
    this.landmarks.shrine = { x: 58, z: -38, name: 'Santuario del Alba' };
    this.landmarks.lake = { x: -60, z: 54, name: 'Lago Espejo' };
    this.landmarks.ruins = { x: 42, z: 58, name: 'Ruinas de Vael' };

    this.buildVillage();
    this.buildShrine();
    this.buildLake();
    this.buildRuins();

    this.scatterTrees(72, 'valdoria');
    this.scatterRocks(32);
    this.scatterGrass(420, '#7f9c5d');
    this.scatterFlowers(120);

    // NPCs
    this.npcSpawns.push(
      { id: 'lyra', x: 4, z: 5, rotation: -0.5, name: 'Lyra', title: 'Erudita del Velo' },
      { id: 'nima', x: -8, z: -4, rotation: 0.7, name: 'Nima', title: 'Susurradora de ecos' },
      { id: 'mira', x: 10, z: -3, rotation: -2.2, name: 'Anciana Mira', title: 'Memoria de Lumen' },
      { id: 'orin', x: -11, z: 8, rotation: 1.1, name: 'Orin', title: 'Forjador' },
    );

    // enemies
    this.enemySpawns.push(
      { type: 'sombra', x: 24, z: -16, level: 1, quest: true, respawn: true },
      { type: 'sombra', x: -26, z: 20, level: 1, quest: true, respawn: true },
      { type: 'sombra', x: 34, z: 16, level: 2, quest: true, respawn: true },
      { type: 'sombra', x: -36, z: -18, level: 2, quest: true, respawn: true },
      { type: 'lobo', x: 48, z: 6, level: 3, respawn: true },
      { type: 'lobo', x: -48, z: -10, level: 3, respawn: true },
      { type: 'golem', x: 30, z: 52, level: 4, respawn: true },
    );

    // wild creatures
    this.creatureSpawns.push(
      { species: 'lumi', x: 28, z: 18 },
      { species: 'lumi', x: -18, z: -34 },
      { species: 'brotin', x: -30, z: -30 },
      { species: 'brotin', x: 48, z: 38 },
      { species: 'zefiro', x: 48, z: 22 },
      { species: 'zefiro', x: -44, z: 6 },
    );

    // side quest braziers
    this.addBrazier(-5, -9, 'brazier_1');
    this.addBrazier(13, 9, 'brazier_2');
    this.addBrazier(-13, 12, 'brazier_3');

    // chests
    this.addChest(36, 58, 'chest_val_1', { essence: 3, potion: 1 });
    this.addChest(-54, -34, 'chest_val_2', { fragments: 2, essence: 2 });
    this.addChest(70, 12, 'chest_val_3', { potion: 2, fragments: 3 });

    // a little camp for atmosphere
    this.addCampfire(-20, 10);
  }

  buildVillage() {
    const p = this.region.palette;
    const houseColors = ['#d8c9a8', '#cdbd9a', '#e0d2b3', '#c9b894'];
    const roofColors = ['#6b4d3a', '#78513c', '#5f4637', '#7c5a43'];
    const houses = [
      { x: -11, z: -12, r: 0.2, w: 5, d: 4.2 },
      { x: 12, z: -12, r: -0.35, w: 5.5, d: 4.5 },
      { x: -17, z: 2, r: 1.1, w: 4.6, d: 4.2 },
      { x: 17, z: 4, r: -1.25, w: 5, d: 4.4 },
      { x: -5, z: 15, r: 2.8, w: 4.4, d: 3.8 },
      { x: 7, z: 16, r: 3.4, w: 4.8, d: 4.2 },
    ];
    houses.forEach((h, i) => this.addHouse(h.x, h.z, h.r, h.w, h.d, houseColors[i % 4], roofColors[i % 4]));

    // central fountain
    const gx = 0;
    const gz = 0;
    const gy = this.heightAt(gx, gz);
    const fountain = new THREE.Group();
    fountain.position.set(gx, gy, gz);
    const basin = cyl(2.1, 2.4, 0.6, standardMaterial('#a8a08a', { roughness: 0.9 }), 16);
    basin.position.y = 0.3;
    fountain.add(basin);
    const water = new THREE.Mesh(
      new THREE.CircleGeometry(1.85, 32),
      new THREE.MeshStandardMaterial({ color: p.water, transparent: true, opacity: 0.8, roughness: 0.1, metalness: 0.1 }),
    );
    water.rotation.x = -Math.PI / 2;
    water.position.y = 0.64;
    fountain.add(water);
    const column = cyl(0.35, 0.55, 2.6, standardMaterial('#c0b69c'), 8);
    column.position.y = 1.7;
    fountain.add(column);
    const figure = new THREE.Group();
    figure.position.y = 3.1;
    const body = cyl(0.22, 0.34, 1.1, standardMaterial('#d6cdb3'), 7);
    figure.add(body);
    const head = sphere(0.23, standardMaterial('#d6cdb3'), 8);
    head.position.y = 0.72;
    figure.add(head);
    const wings = new THREE.Mesh(
      new THREE.ConeGeometry(0.55, 1.3, 3),
      new THREE.MeshStandardMaterial({ color: '#e8dfc3', side: THREE.DoubleSide, transparent: true, opacity: 0.9 }),
    );
    wings.position.set(0, 0.6, -0.2);
    wings.rotation.z = Math.PI;
    figure.add(wings);
    fountain.add(figure);
    const glow = addGlow(fountain, p.accent, 3, [0, 1.4, 0], 0.35);
    glow.material.opacity = 0.3;
    this.scene.add(fountain);
    this.addCollider(gx, gz, 2.5);
    this.landmarks.fountain = { x: gx, z: gz };

    // market stalls
    for (const s of [-1, 1]) {
      const stall = new THREE.Group();
      const x = s * 7.5;
      const z = -7;
      stall.position.set(x, this.heightAt(x, z), z);
      const table = box(2.2, 0.8, 1.0, standardMaterial('#7b563c'));
      table.position.y = 0.4;
      stall.add(table);
      for (const dx of [-0.9, 0.9]) {
        const pole = cyl(0.04, 0.04, 2.2, standardMaterial('#6b4b32'), 5);
        pole.position.set(dx, 1.1, -0.4);
        stall.add(pole);
      }
      const canopy = new THREE.Mesh(
        new THREE.ConeGeometry(1.7, 0.7, 4),
        new THREE.MeshStandardMaterial({ color: s > 0 ? '#8f3f4f' : '#3f6a73', roughness: 0.9 }),
      );
      canopy.position.y = 2.25;
      canopy.rotation.y = Math.PI / 4;
      stall.add(canopy);
      this.scene.add(stall);
      this.addCollider(x, z, 1.6);
    }

    // notice board
    const nb = new THREE.Group();
    nb.position.set(0, this.heightAt(0, 8), 8);
    const board = box(2.2, 1.5, 0.12, standardMaterial('#6b4a32'));
    board.position.y = 1.35;
    nb.add(board);
    for (const s of [-1, 1]) {
      const post = cyl(0.06, 0.08, 1.8, standardMaterial('#5a3e2b'), 5);
      post.position.set(s * 0.8, 0.9, 0);
      nb.add(post);
    }
    for (let i = 0; i < 4; i++) {
      const paper = box(0.3, 0.38, 0.01, new THREE.MeshBasicMaterial({ color: i % 2 ? '#f1e4c2' : '#e4d4ad' }));
      paper.position.set(-0.6 + (i % 2) * 0.9, 1.45 - Math.floor(i / 2) * 0.4, 0.08);
      paper.rotation.z = (i - 1.5) * 0.05;
      nb.add(paper);
    }
    this.scene.add(nb);
    this.addCollider(0, 8, 1.1);

    // lamps
    for (const [x, z] of [[-6, 3], [7, -4], [-4, -8], [11, 10]]) {
      const lamp = this.makeLampPost(x, z, p.accent);
      this.scene.add(lamp);
      this.addCollider(x, z, 0.4);
    }
  }

  addHouse(x, z, rot, w, d, wallColor, roofColor) {
    const y = this.heightAt(x, z);
    const g = new THREE.Group();
    g.position.set(x, y, z);
    g.rotation.y = rot;
    const wallMat = standardMaterial(wallColor, { roughness: 0.95 });
    const beamMat = standardMaterial('#5d3e2c');
    const roofMat = standardMaterial(roofColor, { roughness: 0.9 });

    const foundation = box(w + 0.5, 0.5, d + 0.5, standardMaterial('#8b816c'));
    foundation.position.y = 0.25;
    g.add(foundation);
    const walls = box(w, 2.8, d, wallMat);
    walls.position.y = 1.75;
    g.add(walls);

    // timber frame
    for (const sx of [-1, 1]) {
      for (const sz of [-1, 1]) {
        const beam = box(0.16, 2.9, 0.16, beamMat);
        beam.position.set(sx * (w / 2 - 0.08), 1.75, sz * (d / 2 - 0.08));
        g.add(beam);
      }
    }
    const topBeam = box(w + 0.12, 0.18, 0.18, beamMat);
    topBeam.position.set(0, 3.12, d / 2 - 0.06);
    g.add(topBeam);
    const topBeam2 = topBeam.clone();
    topBeam2.position.z = -d / 2 + 0.06;
    g.add(topBeam2);

    const roof = new THREE.Mesh(new THREE.ConeGeometry(Math.max(w, d) * 0.78, 2.3, 4), roofMat);
    roof.position.y = 4.2;
    roof.rotation.y = Math.PI / 4;
    roof.castShadow = true;
    g.add(roof);

    const door = box(1.0, 1.9, 0.12, standardMaterial('#4b3023'));
    door.position.set(0, 1.2, d / 2 + 0.06);
    g.add(door);
    const lintel = box(1.3, 0.16, 0.16, beamMat);
    lintel.position.set(0, 2.2, d / 2 + 0.06);
    g.add(lintel);

    for (const sx of [-1, 1]) {
      const win = box(0.65, 0.65, 0.08, new THREE.MeshBasicMaterial({ color: '#ffd98a' }));
      win.position.set(sx * (w * 0.28), 1.85, d / 2 + 0.07);
      g.add(win);
      const frame = box(0.78, 0.78, 0.03, beamMat);
      frame.position.set(sx * (w * 0.28), 1.85, d / 2 + 0.03);
      g.add(frame);
    }

    const chimney = box(0.55, 1.6, 0.55, standardMaterial('#8d7b66'));
    chimney.position.set(w * 0.28, 4.3, -d * 0.2);
    g.add(chimney);

    // banner
    const pole = cyl(0.035, 0.035, 2.2, standardMaterial('#5a3e2b'), 5);
    pole.position.set(-w / 2 + 0.15, 3.5, d / 2 + 0.2);
    g.add(pole);
    const banner = new THREE.Mesh(
      new THREE.PlaneGeometry(0.9, 1.5, 2, 4),
      new THREE.MeshStandardMaterial({ color: '#355e78', side: THREE.DoubleSide, roughness: 0.9 }),
    );
    banner.position.set(-w / 2 + 0.15, 3.4, d / 2 + 0.25);
    banner.rotation.y = 0.1;
    g.add(banner);
    const emblem = new THREE.Mesh(new THREE.RingGeometry(0.16, 0.22, 12), new THREE.MeshBasicMaterial({ color: '#f4d58d', side: THREE.DoubleSide }));
    emblem.position.set(-w / 2 + 0.15, 3.55, d / 2 + 0.3);
    g.add(emblem);
    this.dynamic.push({ type: 'banner', mesh: banner, phase: this.rng() * TAU });

    setShadow(g, true, true);
    this.scene.add(g);
    this.addCollider(x, z, Math.max(w, d) * 0.62);
  }

  makeLampPost(x, z, color) {
    const g = new THREE.Group();
    g.position.set(x, this.heightAt(x, z), z);
    const post = cyl(0.07, 0.11, 2.4, standardMaterial('#4f4038'), 6);
    post.position.y = 1.2;
    g.add(post);
    const arm = box(0.7, 0.08, 0.08, standardMaterial('#4f4038'));
    arm.position.set(0.28, 2.35, 0);
    g.add(arm);
    const cage = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.15, 0.5, 6, 1, true), standardMaterial('#3d3632'));
    cage.position.set(0.55, 2.1, 0);
    g.add(cage);
    const light = glowSprite(color, 1.6, 0.8);
    light.position.set(0.55, 2.1, 0);
    g.add(light);
    this.dynamic.push({ type: 'lamp', mesh: light, phase: this.rng() * TAU });
    return g;
  }

  buildShrine() {
    const x = 58;
    const z = -38;
    const y = this.heightAt(x, z);
    this.landmarks.shrine = { x, z, name: 'Santuario del Alba', y };
    const g = new THREE.Group();
    g.position.set(x, y, z);
    const stone = standardMaterial('#b7b09a', { roughness: 0.9 });
    const dark = standardMaterial('#6f6a5c', { roughness: 0.95 });
    const gold = standardMaterial('#d8bd77', { metalness: 0.6, roughness: 0.35 });

    const base = cyl(13, 14, 1.2, stone, 8);
    base.position.y = 0.6;
    g.add(base);
    const inner = cyl(10.5, 11.5, 0.5, dark, 8);
    inner.position.y = 1.25;
    g.add(inner);
    for (let i = 0; i < 3; i++) {
      const step = cyl(7.4 - i * 0.9, 8.2 - i * 0.9, 0.34, stone, 8);
      step.position.y = 1.5 + i * 0.34;
      g.add(step);
    }
    const dais = cyl(5.3, 5.8, 0.8, dark, 8);
    dais.position.y = 2.75;
    g.add(dais);
    const altar = box(2.0, 1.25, 1.2, stone);
    altar.position.y = 3.75;
    g.add(altar);
    const altarTop = box(2.3, 0.16, 1.45, gold);
    altarTop.position.y = 4.4;
    g.add(altarTop);
    const crystal = new THREE.Mesh(new THREE.OctahedronGeometry(0.42, 0), new THREE.MeshBasicMaterial({ color: '#9ef0ff' }));
    crystal.position.y = 5.2;
    g.add(crystal);
    addGlow(g, '#9ef0ff', 4.5, [0, 5.2, 0], 0.55);
    this.dynamic.push({ type: 'crystal', mesh: crystal, baseY: 5.2, phase: 0 });

    // ring runes
    const runeRing = new THREE.Mesh(
      new THREE.RingGeometry(6.2, 7.2, 64),
      new THREE.MeshBasicMaterial({ color: '#9ef0ff', transparent: true, opacity: 0.5, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false }),
    );
    runeRing.rotation.x = -Math.PI / 2;
    runeRing.position.y = 3.1;
    g.add(runeRing);
    this.dynamic.push({ type: 'runeRing', mesh: runeRing, phase: 0 });

    // pillars
    const pillarPositions = [];
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * TAU + Math.PI / 6;
      pillarPositions.push([Math.cos(a) * 8.4, Math.sin(a) * 8.4]);
    }
    for (const [px, pz] of pillarPositions) {
      const pillar = cyl(0.55, 0.72, 6.2, stone, 6);
      pillar.position.set(px, 4.3, pz);
      g.add(pillar);
      const cap = box(1.35, 0.32, 1.35, gold);
      cap.position.set(px, 7.35, pz);
      g.add(cap);
      const baseCap = box(1.5, 0.35, 1.5, dark);
      baseCap.position.set(px, 1.4, pz);
      g.add(baseCap);
      this.addCollider(x + px, z + pz, 0.9);
    }
    // broken arch
    const archMat = standardMaterial('#9a927e', { roughness: 0.95 });
    for (const s of [-1, 1]) {
      const leg = box(1.1, 5.8, 1.1, archMat);
      leg.position.set(s * 3.1, 5.1, -3.8);
      g.add(leg);
    }
    const lintel = box(7.2, 0.9, 1.0, archMat);
    lintel.position.set(0, 8.0, -3.8);
    lintel.rotation.z = 0.03;
    g.add(lintel);
    this.addCollider(x - 3.1, z - 3.8, 0.8);
    this.addCollider(x + 3.1, z - 3.8, 0.8);

    // three lamps
    const lampPositions = [
      [x - 11, z + 2, 'lamp_shrine_1'],
      [x + 11, z + 2, 'lamp_shrine_2'],
      [x, z + 12, 'lamp_shrine_3'],
    ];
    for (const [lx, lz, id] of lampPositions) {
      const lamp = this.addLamp(lx, lz, id, 'Lámpara del Alba');
      lamp.group.position.y = this.heightAt(lx, lz);
    }

    setShadow(g, true, true);
    this.scene.add(g);
    this.shrineGroup = g;
    this.addCollider(x, z, 5.2);

    // guardian arena stones
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * TAU;
      const px = x + Math.cos(a) * 17;
      const pz = z + Math.sin(a) * 17;
      const ob = new THREE.Mesh(new THREE.DodecahedronGeometry(1.1, 0), standardMaterial('#8d8978'));
      ob.position.set(px, this.heightAt(px, pz) + 0.4, pz);
      ob.scale.y = 1.8;
      ob.castShadow = true;
      this.scene.add(ob);
      this.addCollider(px, pz, 1.2);
    }
  }

  buildLake() {
    const x = -60;
    const z = 54;
    const water = new THREE.Mesh(
      new THREE.CircleGeometry(22, 48),
      new THREE.ShaderMaterial({
        transparent: true,
        uniforms: {
          uTime: { value: 0 },
          uColor: { value: new THREE.Color('#4ba8b8') },
          uDeep: { value: new THREE.Color('#1b5f74') },
        },
        vertexShader: `
          uniform float uTime;
          varying vec2 vUv;
          varying float vWave;
          void main() {
            vUv = uv;
            vec3 p = position;
            float w = sin(p.x * 0.35 + uTime * 1.2) * 0.06 + cos(p.y * 0.4 + uTime * 0.9) * 0.05;
            p.z += w;
            vWave = w;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
          }
        `,
        fragmentShader: `
          uniform float uTime;
          uniform vec3 uColor;
          uniform vec3 uDeep;
          varying vec2 vUv;
          varying float vWave;
          void main() {
            vec2 p = vUv - 0.5;
            float r = length(p) * 2.0;
            float ripple = sin(r * 38.0 - uTime * 2.2) * 0.5 + 0.5;
            vec3 col = mix(uDeep, uColor, 0.45 + ripple * 0.12 + vWave * 2.0);
            float edge = smoothstep(0.72, 0.98, r);
            col = mix(col, uDeep * 1.2, edge * 0.7);
            gl_FragColor = vec4(col, 0.78);
          }
        `,
      }),
    );
    water.rotation.x = -Math.PI / 2;
    water.position.set(x, -0.15, z);
    this.scene.add(water);
    this.water = water;
    this.addCollider(x, z, 20);

    // dock
    const dock = new THREE.Group();
    dock.position.set(x + 18, this.heightAt(x + 18, z - 6), z - 6);
    for (let i = 0; i < 7; i++) {
      const plank = box(1.2, 0.14, 4.5, standardMaterial('#6b4a32'));
      plank.position.set(-i * 1.0, 0.1, 0);
      dock.add(plank);
    }
    for (const s of [-1, 1]) {
      for (let i = 0; i < 3; i++) {
        const post = cyl(0.1, 0.12, 1.2, standardMaterial('#5a3e2b'), 5);
        post.position.set(-i * 2.1, 0.5, s * 2.1);
        dock.add(post);
      }
    }
    this.scene.add(dock);

    // reeds
    for (let i = 0; i < 28; i++) {
      const a = this.rng() * TAU;
      const r = 18 + this.rng() * 6;
      const px = x + Math.cos(a) * r;
      const pz = z + Math.sin(a) * r;
      const reed = new THREE.Mesh(new THREE.ConeGeometry(0.06, 1.2 + this.rng() * 0.8, 3), standardMaterial('#5f7a4a'));
      reed.position.set(px, this.heightAt(px, pz) + 0.5, pz);
      this.scene.add(reed);
    }
  }

  buildRuins() {
    const x = 42;
    const z = 58;
    const y = this.heightAt(x, z);
    const g = new THREE.Group();
    g.position.set(x, y, z);
    const stone = standardMaterial('#8d8978', { roughness: 0.95 });
    for (let i = 0; i < 4; i++) {
      const wall = box(8 - i * 0.5, 3.4 + i * 0.2, 0.9, stone);
      wall.position.set(0, 1.7, -4 + i * 2.6);
      wall.rotation.z = (i % 2 ? -0.04 : 0.03);
      g.add(wall);
      if (i < 3) {
        const gap = box(2.2, 2.2, 1.0, new THREE.MeshBasicMaterial({ color: '#171a20' }));
        gap.position.set(-2.3 + i * 1.3, 1.2, -4 + i * 2.6 + 0.51);
        g.add(gap);
      }
    }
    for (let i = 0; i < 5; i++) {
      const px = -7 + i * 3.5;
      const col = cyl(0.45, 0.55, 4.5 + (i % 3) * 0.8, stone, 6);
      col.position.set(px, 2.2, 5);
      col.rotation.z = (i % 2 ? 0.08 : -0.04);
      g.add(col);
      this.addCollider(x + px, z + 5, 0.7);
    }
    const arch = new THREE.Mesh(new THREE.TorusGeometry(3.2, 0.45, 5, 12, Math.PI), stone);
    arch.position.set(0, 5.2, 5);
    arch.rotation.z = Math.PI;
    g.add(arch);
    addGlow(g, '#7ee8fa', 3.2, [0, 2.5, 3], 0.2);
    setShadow(g, true, true);
    this.scene.add(g);
    this.addCollider(x, z, 4.2);
    this.addChest(x + 7, z - 2, 'chest_ruins', { fragments: 3, potion: 1 });
  }

  /* ------------------------------------------------------------------ */
  /* Drakmor                                                             */
  /* ------------------------------------------------------------------ */

  buildDrakmor() {
    const p = this.region.palette;
    this.landmarks.camp = { x: -58, z: 48, name: 'Campamento de Ceniza' };
    this.landmarks.fortress = { x: 25, z: -30, name: 'Fortaleza de Ceniza' };
    this.landmarks.caldera = { x: 58, z: 52, name: 'Caldera de Ceniza' };
    this.landmarks.gate = { x: 25, z: -7, name: 'Puerta de Obsidiana' };

    this.buildDrakmorCamp();
    this.buildFortress();
    this.buildCaldera();
    this.scatterDeadTrees(44);
    this.scatterRocks(46);
    this.scatterLavaCracks(26);

    this.npcSpawns.push({ id: 'kael', x: -58, z: 45, rotation: 0.4, name: 'Kael', title: 'Caballero de Ceniza' });

    this.enemySpawns.push(
      { type: 'lobo', x: -30, z: 26, level: 5, respawn: true },
      { type: 'lobo', x: -10, z: 34, level: 5, respawn: true },
      { type: 'lobo', x: 44, z: 12, level: 6, respawn: true },
      { type: 'guardia', x: 25, z: -7, level: 6, quest: true, respawn: false },
      { type: 'guardia', x: 18, z: -14, level: 6, quest: true, respawn: false },
      { type: 'guardia', x: 33, z: -14, level: 6, quest: true, respawn: false },
      { type: 'golem', x: 60, z: 10, level: 7, respawn: true },
      { type: 'devorador', x: 58, z: 52, level: 8, elite: true, quest: 'deuda', respawn: false },
    );

    this.creatureSpawns.push(
      { species: 'ascua', x: -18, z: 12 },
      { species: 'ascua', x: 44, z: 34 },
      { species: 'obsidiano', x: 48, z: -8 },
      { species: 'obsidiano', x: -42, z: 16 },
      { species: 'aullador', x: -38, z: -24 },
      { species: 'aullador', x: 58, z: 26 },
    );

    this.addChest(14, 30, 'chest_drak_1', { essence: 4, fragments: 3 });
    this.addChest(68, -18, 'chest_drak_2', { potion: 2, fragments: 4 });
    this.addChest(-70, -12, 'chest_drak_3', { essence: 4, fragments: 3 });
  }

  buildDrakmorCamp() {
    const x = -58;
    const z = 48;
    const y = this.heightAt(x, z);
    const g = new THREE.Group();
    g.position.set(x, y, z);
    const cloth = standardMaterial('#5d2f2f', { roughness: 0.95 });
    const dark = standardMaterial('#332527');
    const wood = standardMaterial('#4a342b');
    for (const [tx, tz, rot] of [[-5, -3, 0.4], [4, -4, -0.6], [7, 3, 0.9]]) {
      const tent = new THREE.Group();
      tent.position.set(tx, 0, tz);
      tent.rotation.y = rot;
      const body = new THREE.Mesh(new THREE.ConeGeometry(2.4, 3.2, 4), cloth);
      body.position.y = 1.6;
      body.castShadow = true;
      tent.add(body);
      const entrance = new THREE.Mesh(new THREE.CircleGeometry(0.8, 8), new THREE.MeshBasicMaterial({ color: '#1a1012' }));
      entrance.position.set(0, 1.0, 1.3);
      tent.add(entrance);
      g.add(tent);
      this.addCollider(x + tx, z + tz, 1.6);
    }
    const fire = new THREE.Group();
    fire.position.set(0, 0, 0);
    const stones = new THREE.Mesh(new THREE.TorusGeometry(1.2, 0.22, 5, 12), dark);
    stones.rotation.x = Math.PI / 2;
    stones.position.y = 0.15;
    fire.add(stones);
    const flame = glowSprite('#ff8a4a', 3, 0.85);
    flame.position.y = 1.0;
    fire.add(flame);
    this.dynamic.push({ type: 'fire', mesh: flame, phase: 0 });
    for (let i = 0; i < 8; i++) {
      const log = cyl(0.1, 0.14, 1.5, wood, 5);
      log.position.set(Math.cos(i / 8 * TAU) * 0.7, 0.25, Math.sin(i / 8 * TAU) * 0.7);
      log.rotation.z = Math.PI / 2;
      log.rotation.y = i / 8 * TAU;
      fire.add(log);
    }
    g.add(fire);
    const banner = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 3.2), new THREE.MeshStandardMaterial({ color: '#8f2f2f', side: THREE.DoubleSide }));
    banner.position.set(-9, 2.2, 0);
    g.add(banner);
    const pole = cyl(0.06, 0.08, 4.8, wood, 5);
    pole.position.set(-9, 2.4, 0);
    g.add(pole);
    this.scene.add(g);
    this.landmarks.camp.y = y;
    this.addCollider(x, z, 1.8);
  }

  buildFortress() {
    const x = 25;
    const z = -30;
    const y = this.heightAt(x, z);
    const g = new THREE.Group();
    g.position.set(x, y, z);
    const stone = standardMaterial('#3e3236', { roughness: 0.92 });
    const dark = standardMaterial('#241b20');
    const ember = new THREE.MeshBasicMaterial({ color: '#ff6b3d' });

    // gate wall (front at z = +18 relative)
    for (const s of [-1, 1]) {
      const wall = box(10, 8, 2.2, stone);
      wall.position.set(s * 11.5, 4, 18);
      g.add(wall);
      this.addCollider(x + s * 11.5, z + 18, 4.6);
      const tower = cyl(2.2, 2.8, 13, stone, 8);
      tower.position.set(s * 17, 6.5, 18);
      g.add(tower);
      const top = cone(2.8, 3.2, dark, 8);
      top.position.set(s * 17, 14, 18);
      g.add(top);
      this.addCollider(x + s * 17, z + 18, 2.4);
    }
    const gateLintel = box(14, 2.4, 2.4, stone);
    gateLintel.position.set(0, 8.2, 18);
    g.add(gateLintel);
    const gateGlow = new THREE.Mesh(new THREE.PlaneGeometry(11, 7), new THREE.MeshBasicMaterial({
      color: '#ff5b2e', transparent: true, opacity: 0.16, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false,
    }));
    gateGlow.position.set(0, 4, 18.2);
    g.add(gateGlow);
    this.dynamic.push({ type: 'gateGlow', mesh: gateGlow, phase: 0 });

    // side walls
    for (const s of [-1, 1]) {
      const wall = box(2.2, 7, 24, stone);
      wall.position.set(s * 17, 3.5, 6);
      g.add(wall);
      this.addCollider(x + s * 17, z + 6, 5);
    }

    // keep
    const keep = box(18, 14, 16, stone);
    keep.position.set(0, 7, -8);
    g.add(keep);
    this.addCollider(x, z - 8, 9);
    const keepTop = box(20, 1.2, 18, dark);
    keepTop.position.set(0, 14.2, -8);
    g.add(keepTop);
    for (let i = 0; i < 5; i++) {
      const crenel = box(1.6, 2.2, 1.6, stone);
      crenel.position.set(-8 + i * 4, 15.2, -15.5);
      g.add(crenel);
    }
    // throne / altar — kept in the open courtyard so the arena is reachable
    const dais = cyl(7, 8, 1.2, dark, 8);
    dais.position.set(0, 0.6, 6);
    g.add(dais);
    const throne = box(3.4, 5, 2.4, stone);
    throne.position.set(0, 3.4, 2);
    g.add(throne);
    const throneGlow = new THREE.Mesh(new THREE.RingGeometry(2.6, 3.2, 32), new THREE.MeshBasicMaterial({
      color: '#ff8a4a', transparent: true, opacity: 0.55, side: THREE.DoubleSide, blending: THREE.AdditiveBlending,
    }));
    throneGlow.rotation.x = -Math.PI / 2;
    throneGlow.position.set(0, 1.35, 6);
    g.add(throneGlow);
    this.dynamic.push({ type: 'runeRing', mesh: throneGlow, phase: 0 });

    // pillars / braziers
    for (const s of [-1, 1]) {
      for (let i = 0; i < 3; i++) {
        const pillar = cyl(0.8, 1.0, 7, stone, 6);
        pillar.position.set(s * 9, 3.5, 8 - i * 7);
        g.add(pillar);
        this.addCollider(x + s * 9, z + 8 - i * 7, 1.1);
        const flame = glowSprite('#ff6b3d', 2, 0.6);
        flame.position.set(s * 9, 7.4, 8 - i * 7);
        g.add(flame);
        this.dynamic.push({ type: 'fire', mesh: flame, phase: this.rng() * TAU });
      }
    }

    setShadow(g, true, true);
    this.scene.add(g);
    this.fortressGroup = g;
    this.landmarks.fortress.y = y;
    this.landmarks.fortress.arena = { x, z: z + 6 };
  }

  buildCaldera() {
    const x = 58;
    const z = 52;
    const y = this.heightAt(x, z);
    const g = new THREE.Group();
    g.position.set(x, y, z);
    const dark = standardMaterial('#2b2226');
    const ring = new THREE.Mesh(new THREE.TorusGeometry(9, 1.4, 5, 16), dark);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 0.4;
    g.add(ring);
    const lava = new THREE.Mesh(
      new THREE.CircleGeometry(8, 32),
      new THREE.MeshBasicMaterial({ color: '#ff5b2e' }),
    );
    lava.rotation.x = -Math.PI / 2;
    lava.position.y = 0.55;
    g.add(lava);
    addGlow(g, '#ff5b2e', 12, [0, 1.5, 0], 0.25);
    this.scene.add(g);
    this.addCollider(x, z, 8);
    this.landmarks.caldera.y = y;
  }

  /* ------------------------------------------------------------------ */
  /* Kansordore                                                          */
  /* ------------------------------------------------------------------ */

  buildKansordore() {
    const p = this.region.palette;
    this.landmarks.spawn = { x: -56, z: 48, name: 'Umbral de Kansordore' };
    this.landmarks.archive = { x: 0, z: 0, name: 'Archivo Prohibido' };
    this.landmarks.summit = { x: 0, z: -62, name: 'Cumbre de la Convergencia' };

    this.buildArchive();
    this.buildSummit();
    this.scatterCrystalTrees(54);
    this.scatterRocks(30);
    this.scatterGrass(220, '#b9b5cf');
    this.scatterFloatingRocks(24);

    this.npcSpawns.push({ id: 'lyra', x: -54, z: 44, rotation: 0.4, name: 'Lyra', title: 'Erudita del Velo' });

    this.enemySpawns.push(
      { type: 'centinela', x: -34, z: -8, level: 9, quest: true, respawn: false, seal: 'seal_1' },
      { type: 'centinela', x: 34, z: -8, level: 9, quest: true, respawn: false, seal: 'seal_2' },
      { type: 'centinela', x: 0, z: -40, level: 9, quest: true, respawn: false, seal: 'seal_3' },
      { type: 'sombra', x: -24, z: 24, level: 9, respawn: true },
      { type: 'sombra', x: 24, z: 22, level: 9, respawn: true },
      { type: 'lobo', x: 42, z: 34, level: 10, respawn: true },
      { type: 'golem', x: -44, z: 10, level: 10, respawn: true },
    );

    this.creatureSpawns.push(
      { species: 'prisma', x: 26, z: 8 },
      { species: 'prisma', x: -30, z: 34 },
      { species: 'crono', x: 44, z: -26 },
      { species: 'crono', x: -46, z: -30 },
      { species: 'serafin', x: 0, z: -52 },
    );

    this.addChest(30, 38, 'chest_kan_1', { essence: 5, fragments: 5 });
    this.addChest(-42, 32, 'chest_kan_2', { potion: 3, fragments: 4 });
    this.addChest(48, -40, 'chest_kan_3', { essence: 5, fragments: 6 });

    // three seal altars
    const seals = [
      { id: 'seal_1', x: -34, z: -8, color: '#9ef0ff' },
      { id: 'seal_2', x: 34, z: -8, color: '#ffd9f0' },
      { id: 'seal_3', x: 0, z: -40, color: '#c6b7ff' },
    ];
    for (const s of seals) this.addSeal(s);
  }

  buildArchive() {
    const x = 0;
    const z = 0;
    const y = this.heightAt(x, z);
    const g = new THREE.Group();
    g.position.set(x, y, z);
    const pale = standardMaterial('#c8c3d9', { roughness: 0.85 });
    const gold = standardMaterial('#d8bd77', { metalness: 0.65, roughness: 0.35 });
    const dark = standardMaterial('#5d5877');

    const base = cyl(16, 18, 1.4, pale, 8);
    base.position.y = 0.7;
    g.add(base);
    for (let i = 0; i < 4; i++) {
      const step = cyl(13 - i * 1.6, 14.2 - i * 1.6, 0.4, i % 2 ? dark : pale, 8);
      step.position.y = 1.4 + i * 0.4;
      g.add(step);
    }
    const dais = cyl(8, 9, 1.1, dark, 8);
    dais.position.y = 3.4;
    g.add(dais);
    const core = new THREE.Mesh(new THREE.TorusGeometry(4.2, 0.35, 6, 48), gold);
    core.rotation.x = Math.PI / 2;
    core.position.y = 6.6;
    g.add(core);
    this.dynamic.push({ type: 'archiveCore', mesh: core, baseY: 6.6, phase: 0 });
    const crystal = new THREE.Mesh(new THREE.OctahedronGeometry(1.3, 0), new THREE.MeshBasicMaterial({ color: '#9ef0ff' }));
    crystal.position.y = 6.6;
    g.add(crystal);
    addGlow(g, '#9ef0ff', 9, [0, 6.6, 0], 0.45);
    this.dynamic.push({ type: 'crystal', mesh: crystal, baseY: 6.6, phase: 1.2 });

    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * TAU;
      const px = Math.cos(a) * 11.5;
      const pz = Math.sin(a) * 11.5;
      const col = cyl(0.55, 0.75, 9, pale, 6);
      col.position.set(px, 5.2, pz);
      g.add(col);
      const cap = box(1.5, 0.4, 1.5, gold);
      cap.position.set(px, 9.8, pz);
      g.add(cap);
      this.addCollider(x + px, z + pz, 1.0);
      const rune = new THREE.Mesh(new THREE.OctahedronGeometry(0.18, 0), new THREE.MeshBasicMaterial({ color: '#9ef0ff' }));
      rune.position.set(px, 10.6, pz);
      g.add(rune);
      this.dynamic.push({ type: 'floatRune', mesh: rune, baseY: 10.6, phase: a });
    }

    // floating shelves / rings
    for (let i = 0; i < 3; i++) {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(7 + i * 2.2, 0.08, 4, 64),
        new THREE.MeshBasicMaterial({ color: '#9ef0ff', transparent: true, opacity: 0.3, blending: THREE.AdditiveBlending }),
      );
      ring.rotation.x = Math.PI / 2 + (i - 1) * 0.15;
      ring.position.y = 5 + i * 2;
      g.add(ring);
      this.dynamic.push({ type: 'orbitRing', mesh: ring, speed: 0.08 + i * 0.03, phase: i });
    }

    // stairs toward archive
    for (let i = 0; i < 6; i++) {
      const step = box(6 - i * 0.3, 0.35, 1.3, pale);
      step.position.set(0, 0.3 + i * 0.35, 18 - i * 1.1);
      g.add(step);
    }

    setShadow(g, true, true);
    this.scene.add(g);
    this.landmarks.archive.y = y;
    this.addCollider(x, z, 6.2);
  }

  buildSummit() {
    const x = 0;
    const z = -62;
    const y = this.heightAt(x, z);
    const g = new THREE.Group();
    g.position.set(x, y, z);
    const pale = standardMaterial('#d5d0e2', { roughness: 0.8 });
    const gold = standardMaterial('#d8bd77', { metalness: 0.65, roughness: 0.35 });
    const base = cyl(15, 18, 2.2, pale, 8);
    base.position.y = 1.1;
    g.add(base);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(11, 0.7, 6, 64), gold);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 3.6;
    g.add(ring);
    this.dynamic.push({ type: 'orbitRing', mesh: ring, speed: 0.12, phase: 0 });
    const core = new THREE.Mesh(new THREE.OctahedronGeometry(2.2, 0), new THREE.MeshBasicMaterial({ color: '#fff0a8' }));
    core.position.y = 6.5;
    g.add(core);
    addGlow(g, '#fff0a8', 14, [0, 6.5, 0], 0.5);
    this.dynamic.push({ type: 'crystal', mesh: core, baseY: 6.5, phase: 0.5 });
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * TAU;
      const px = Math.cos(a) * 13;
      const pz = Math.sin(a) * 13;
      const col = cyl(0.4, 0.55, 6.5, pale, 6);
      col.position.set(px, 4.2, pz);
      g.add(col);
      this.addCollider(x + px, z + pz, 0.7);
    }
    setShadow(g, true, true);
    this.scene.add(g);
    this.landmarks.summit.y = y;
    this.addCollider(x, z, 7);
  }

  addSeal(s) {
    const y = this.heightAt(s.x, s.z);
    const g = new THREE.Group();
    g.position.set(s.x, y, s.z);
    const stone = standardMaterial('#b6b1c8');
    const base = cyl(2.2, 2.6, 0.5, stone, 6);
    base.position.y = 0.25;
    g.add(base);
    const pillar = cyl(0.45, 0.6, 2.2, stone, 6);
    pillar.position.y = 1.6;
    g.add(pillar);
    const rune = new THREE.Mesh(new THREE.OctahedronGeometry(0.5, 0), new THREE.MeshBasicMaterial({ color: s.color }));
    rune.position.y = 3.1;
    g.add(rune);
    addGlow(g, s.color, 3, [0, 3.1, 0], 0.55);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(1.1, 0.035, 4, 32), new THREE.MeshBasicMaterial({ color: s.color, transparent: true, opacity: 0.7 }));
    ring.position.y = 3.1;
    ring.rotation.x = Math.PI / 2;
    g.add(ring);
    this.scene.add(g);
    this.dynamic.push({ type: 'seal', mesh: rune, ring, baseY: 3.1, phase: this.rng() * TAU, id: s.id });
    this.interactables.push({ id: s.id, type: 'seal', x: s.x, z: s.z, radius: 3, label: 'Sello del Archivo', mesh: g, activated: false });
    this.addCollider(s.x, s.z, 1.2);
  }

  /* ------------------------------------------------------------------ */
  /* Scatter helpers                                                     */
  /* ------------------------------------------------------------------ */

  safePoint(x, z, margin = 5) {
    if (Math.hypot(x, z) < 15) return false;
    if (this.regionId === 'valdoria' && Math.hypot(x - 58, z + 38) < 18) return false;
    if (this.regionId === 'valdoria' && Math.hypot(x + 60, z - 54) < 24) return false;
    if (this.regionId === 'drakmor' && Math.hypot(x - 25, z + 30) < 25) return false;
    if (this.regionId === 'drakmor' && Math.hypot(x + 58, z - 48) < 14) return false;
    if (this.regionId === 'kansordore' && Math.hypot(x, z) < 23) return false;
    if (this.regionId === 'kansordore' && Math.hypot(x, z + 62) < 18) return false;
    if (this.regionId === 'kansordore' && Math.hypot(x + 56, z - 48) < 14) return false;
    for (const c of this.colliders) {
      if (Math.hypot(x - c.x, z - c.z) < c.r + margin) return false;
    }
    return true;
  }

  scatterTrees(count, kind) {
    const p = this.region.palette;
    const trunkGeo = new THREE.CylinderGeometry(0.18, 0.32, 3.2, 6);
    const trunkMat = standardMaterial('#5b4131');
    const canopyGeo = new THREE.IcosahedronGeometry(1.35, 0);
    const canopyMat = new THREE.MeshToonMaterial({ color: '#ffffff', gradientMap: toonGradient(), vertexColors: false });
    const trunks = new THREE.InstancedMesh(trunkGeo, trunkMat, count);
    const canopies = new THREE.InstancedMesh(canopyGeo, canopyMat, count * 3);
    trunks.castShadow = true;
    trunks.receiveShadow = true;
    canopies.castShadow = true;
    canopies.receiveShadow = true;
    const dummy = new THREE.Object3D();
    const color = new THREE.Color();
    let ci = 0;
    for (let i = 0; i < count; i++) {
      let x, z, tries = 0;
      do {
        x = (this.rng() - 0.5) * 170;
        z = (this.rng() - 0.5) * 170;
        tries++;
      } while (!this.safePoint(x, z, 6) && tries < 30);
      const y = this.heightAt(x, z);
      const s = 0.7 + this.rng() * 0.9;
      dummy.position.set(x, y + 1.6 * s, z);
      dummy.rotation.set(0, this.rng() * TAU, 0);
      dummy.scale.set(s, s, s);
      dummy.updateMatrix();
      trunks.setMatrixAt(i, dummy.matrix);
      for (let j = 0; j < 3; j++) {
        const cs = (0.65 + this.rng() * 0.5) * s;
        dummy.position.set(x + (this.rng() - 0.5) * 1.1, y + (2.8 + this.rng() * 1.2) * s, z + (this.rng() - 0.5) * 1.1);
        dummy.rotation.set(this.rng() * 0.4, this.rng() * TAU, this.rng() * 0.4);
        dummy.scale.set(cs, cs * (0.8 + this.rng() * 0.3), cs);
        dummy.updateMatrix();
        canopies.setMatrixAt(ci, dummy.matrix);
        const hue = 0.24 + this.rng() * 0.08;
        color.setHSL(hue, 0.35 + this.rng() * 0.15, 0.32 + this.rng() * 0.14);
        canopies.setColorAt(ci, color);
        ci++;
      }
      this.addCollider(x, z, 0.55 * s);
    }
    this.scene.add(trunks, canopies);
    this.dynamic.push({ type: 'trees', mesh: canopies, phase: this.rng() * TAU });
  }

  scatterDeadTrees(count) {
    const trunkMat = standardMaterial('#2a1e20');
    const group = new THREE.Group();
    for (let i = 0; i < count; i++) {
      let x, z, tries = 0;
      do {
        x = (this.rng() - 0.5) * 170;
        z = (this.rng() - 0.5) * 170;
        tries++;
      } while (!this.safePoint(x, z, 5) && tries < 30);
      const y = this.heightAt(x, z);
      const s = 0.8 + this.rng() * 0.9;
      const trunk = cyl(0.08, 0.3, 3.8 * s, trunkMat, 5);
      trunk.position.set(x, y + 1.9 * s, z);
      trunk.rotation.z = (this.rng() - 0.5) * 0.3;
      group.add(trunk);
      for (let j = 0; j < 3; j++) {
        const branch = cyl(0.03, 0.1, 1.5 * s, trunkMat, 4);
        branch.position.set(x + (this.rng() - 0.5) * 0.8, y + 3.0 * s, z + (this.rng() - 0.5) * 0.8);
        branch.rotation.z = (this.rng() - 0.5) * 1.8;
        branch.rotation.x = (this.rng() - 0.5) * 1.8;
        group.add(branch);
      }
      this.addCollider(x, z, 0.4);
    }
    this.scene.add(group);
  }

  scatterCrystalTrees(count) {
    const trunkMat = standardMaterial('#7e7b9e');
    const crystalMat = new THREE.MeshStandardMaterial({
      color: '#c6b7ff', emissive: new THREE.Color('#7a62dc').multiplyScalar(0.4), roughness: 0.25, metalness: 0.2,
    });
    const group = new THREE.Group();
    for (let i = 0; i < count; i++) {
      let x, z, tries = 0;
      do {
        x = (this.rng() - 0.5) * 170;
        z = (this.rng() - 0.5) * 170;
        tries++;
      } while (!this.safePoint(x, z, 5) && tries < 30);
      const y = this.heightAt(x, z);
      const s = 0.8 + this.rng() * 1.0;
      const trunk = cyl(0.1, 0.2, 3.4 * s, trunkMat, 5);
      trunk.position.set(x, y + 1.7 * s, z);
      group.add(trunk);
      for (let j = 0; j < 3; j++) {
        const crystal = new THREE.Mesh(new THREE.OctahedronGeometry(0.55 * s, 0), crystalMat);
        crystal.position.set(x + (this.rng() - 0.5) * 1.2, y + (3.0 + this.rng() * 0.8) * s, z + (this.rng() - 0.5) * 1.2);
        crystal.rotation.set(this.rng() * TAU, this.rng() * TAU, 0);
        group.add(crystal);
      }
      this.addCollider(x, z, 0.5);
    }
    this.scene.add(group);
  }

  scatterRocks(count) {
    const geo = new THREE.DodecahedronGeometry(0.8, 0);
    const mat = new THREE.MeshToonMaterial({ color: this.regionId === 'drakmor' ? '#3b2d31' : '#8b877a', gradientMap: toonGradient() });
    const rocks = new THREE.InstancedMesh(geo, mat, count);
    rocks.castShadow = true;
    rocks.receiveShadow = true;
    const dummy = new THREE.Object3D();
    const color = new THREE.Color();
    for (let i = 0; i < count; i++) {
      let x, z, tries = 0;
      do {
        x = (this.rng() - 0.5) * 160;
        z = (this.rng() - 0.5) * 160;
        tries++;
      } while (!this.safePoint(x, z, 4) && tries < 25);
      const y = this.heightAt(x, z);
      const s = 0.4 + this.rng() * 1.4;
      dummy.position.set(x, y + s * 0.35, z);
      dummy.rotation.set(this.rng() * TAU, this.rng() * TAU, this.rng() * TAU);
      dummy.scale.set(s, s * (0.6 + this.rng() * 0.6), s);
      dummy.updateMatrix();
      rocks.setMatrixAt(i, dummy.matrix);
      color.setHSL(this.regionId === 'drakmor' ? 0.02 : 0.12, 0.12, 0.28 + this.rng() * 0.16);
      rocks.setColorAt(i, color);
      if (s > 0.85) this.addCollider(x, z, s * 0.8);
    }
    this.scene.add(rocks);
  }

  scatterGrass(count, color) {
    const geo = new THREE.ConeGeometry(0.09, 0.55, 3);
    const mat = new THREE.MeshToonMaterial({ color: '#ffffff', gradientMap: toonGradient() });
    const grass = new THREE.InstancedMesh(geo, mat, count);
    const dummy = new THREE.Object3D();
    const c = new THREE.Color();
    for (let i = 0; i < count; i++) {
      let x, z, tries = 0;
      do {
        x = (this.rng() - 0.5) * 150;
        z = (this.rng() - 0.5) * 150;
        tries++;
      } while (Math.hypot(x, z) < 14 && tries < 12);
      const y = this.heightAt(x, z);
      dummy.position.set(x, y + 0.25, z);
      dummy.rotation.set(0, this.rng() * TAU, (this.rng() - 0.5) * 0.2);
      const s = 0.6 + this.rng() * 1.1;
      dummy.scale.set(s, s, s);
      dummy.updateMatrix();
      grass.setMatrixAt(i, dummy.matrix);
      c.set(color).offsetHSL((this.rng() - 0.5) * 0.05, 0.05, (this.rng() - 0.5) * 0.12);
      grass.setColorAt(i, c);
    }
    grass.receiveShadow = true;
    this.scene.add(grass);
  }

  scatterFlowers(count) {
    const geo = new THREE.SphereGeometry(0.07, 4, 3);
    const mat = new THREE.MeshBasicMaterial({ color: '#ffffff' });
    const flowers = new THREE.InstancedMesh(geo, mat, count);
    const dummy = new THREE.Object3D();
    const c = new THREE.Color();
    const palette = ['#f4d58d', '#ff8fb1', '#9ef0ff', '#f6f1dc'];
    for (let i = 0; i < count; i++) {
      let x, z, tries = 0;
      do {
        x = (this.rng() - 0.5) * 110;
        z = (this.rng() - 0.5) * 110;
        tries++;
      } while (Math.hypot(x, z) < 15 && tries < 12);
      const y = this.heightAt(x, z);
      dummy.position.set(x, y + 0.35, z);
      dummy.scale.setScalar(0.8 + this.rng() * 0.8);
      dummy.updateMatrix();
      flowers.setMatrixAt(i, dummy.matrix);
      c.set(palette[Math.floor(this.rng() * palette.length)]);
      flowers.setColorAt(i, c);
    }
    this.scene.add(flowers);
  }

  scatterLavaCracks(count) {
    const mat = new THREE.MeshBasicMaterial({ color: '#ff5b2e' });
    for (let i = 0; i < count; i++) {
      let x, z, tries = 0;
      do {
        x = (this.rng() - 0.5) * 150;
        z = (this.rng() - 0.5) * 150;
        tries++;
      } while (!this.safePoint(x, z, 4) && tries < 25);
      const crack = box(0.12 + this.rng() * 0.2, 0.02, 2 + this.rng() * 5, mat);
      crack.position.set(x, this.heightAt(x, z) + 0.05, z);
      crack.rotation.y = this.rng() * TAU;
      this.scene.add(crack);
    }
  }

  scatterFloatingRocks(count) {
    for (let i = 0; i < count; i++) {
      const x = (this.rng() - 0.5) * 130;
      const z = (this.rng() - 0.5) * 130;
      const y = this.heightAt(x, z) + 4 + this.rng() * 12;
      const rock = new THREE.Mesh(
        new THREE.DodecahedronGeometry(0.6 + this.rng() * 1.4, 0),
        standardMaterial('#a9a5c2', { roughness: 0.9 }),
      );
      rock.position.set(x, y, z);
      rock.rotation.set(this.rng() * TAU, this.rng() * TAU, this.rng() * TAU);
      this.scene.add(rock);
      this.dynamic.push({ type: 'floatingRock', mesh: rock, baseY: y, phase: this.rng() * TAU, speed: 0.3 + this.rng() * 0.5 });
      addGlow(rock, '#9ef0ff', 2.4, [0, 0, 0], 0.12);
    }
  }

  /* ------------------------------------------------------------------ */
  /* Interactables                                                       */
  /* ------------------------------------------------------------------ */

  addChest(x, z, id, loot) {
    const y = this.heightAt(x, z);
    const g = new THREE.Group();
    g.position.set(x, y, z);
    const wood = standardMaterial('#6b442d');
    const gold = standardMaterial('#d8bd77', { metalness: 0.6, roughness: 0.3 });
    const base = box(1.1, 0.7, 0.75, wood);
    base.position.y = 0.45;
    g.add(base);
    const lid = box(1.15, 0.32, 0.8, wood);
    lid.position.y = 0.95;
    lid.rotation.x = 0;
    g.add(lid);
    for (const s of [-1, 1]) {
      const band = box(0.1, 0.82, 0.82, gold);
      band.position.set(s * 0.38, 0.55, 0);
      g.add(band);
    }
    const lock = box(0.18, 0.24, 0.08, gold);
    lock.position.set(0, 0.6, 0.4);
    g.add(lock);
    addGlow(g, '#f4d58d', 1.8, [0, 0.9, 0], 0.25);
    this.scene.add(g);
    this.interactables.push({ id, type: 'chest', x, z, radius: 2.6, label: 'Cofre antiguo', mesh: g, lid, opened: false, loot });
    this.addCollider(x, z, 0.8);
  }

  addBrazier(x, z, id) {
    const y = this.heightAt(x, z);
    const g = new THREE.Group();
    g.position.set(x, y, z);
    const stone = standardMaterial('#7a7264');
    const base = cyl(0.45, 0.65, 0.9, stone, 6);
    base.position.y = 0.45;
    g.add(base);
    const bowl = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.4, 0.38, 8, 1, true), stone);
    bowl.position.y = 1.0;
    g.add(bowl);
    const flame = glowSprite('#ffb347', 1.8, 0.0);
    flame.position.y = 1.3;
    g.add(flame);
    this.scene.add(g);
    this.interactables.push({ id, type: 'brazier', x, z, radius: 2.5, label: 'Brasero dormido', mesh: g, flame, lit: false });
    this.addCollider(x, z, 0.7);
  }

  addLamp(x, z, id, label) {
    const y = this.heightAt(x, z);
    const g = new THREE.Group();
    g.position.set(x, y, z);
    const stone = standardMaterial('#8d8978');
    const base = cyl(0.6, 0.9, 0.5, stone, 6);
    base.position.y = 0.25;
    g.add(base);
    const stem = cyl(0.18, 0.28, 1.2, stone, 6);
    stem.position.y = 1.1;
    g.add(stem);
    const bowl = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.35, 0.4, 8, 1, true), stone);
    bowl.position.y = 1.75;
    g.add(bowl);
    const flame = glowSprite('#9ef0ff', 2.2, 0.0);
    flame.position.y = 2.1;
    g.add(flame);
    this.scene.add(g);
    const item = { id, type: 'lamp', x, z, radius: 2.8, label, mesh: g, flame, lit: false };
    this.interactables.push(item);
    this.addCollider(x, z, 0.8);
    return { group: g, item };
  }

  addCampfire(x, z) {
    const y = this.heightAt(x, z);
    const g = new THREE.Group();
    g.position.set(x, y, z);
    const stone = standardMaterial('#6f6a5c');
    for (let i = 0; i < 7; i++) {
      const a = (i / 7) * TAU;
      const s = sphere(0.2, stone, 5);
      s.position.set(Math.cos(a) * 0.8, 0.2, Math.sin(a) * 0.8);
      g.add(s);
    }
    const flame = glowSprite('#ffb347', 2.2, 0.7);
    flame.position.y = 0.8;
    g.add(flame);
    this.dynamic.push({ type: 'fire', mesh: flame, phase: 0 });
    this.scene.add(g);
  }

  addWaystone(x, z, id, name) {
    const y = this.heightAt(x, z);
    const g = new THREE.Group();
    g.position.set(x, y, z);
    const stone = standardMaterial('#8d8978');
    const base = cyl(1.3, 1.6, 0.5, stone, 6);
    base.position.y = 0.25;
    g.add(base);
    const obelisk = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.62, 3.6, 4), stone);
    obelisk.position.y = 2.1;
    obelisk.rotation.y = Math.PI / 4;
    g.add(obelisk);
    const rune = new THREE.Mesh(new THREE.OctahedronGeometry(0.28, 0), new THREE.MeshBasicMaterial({ color: '#7ee8fa' }));
    rune.position.y = 4.1;
    g.add(rune);
    addGlow(g, '#7ee8fa', 2.8, [0, 4.1, 0], 0.5);
    this.scene.add(g);
    this.interactables.push({ id, type: 'waystone', x, z, radius: 3, label: name, mesh: g, rune });
    this.addCollider(x, z, 1.2);
  }

  buildWaystones() {
    if (this.regionId === 'valdoria') {
      this.addWaystone(0, 16, 'waystone_val', 'Altar de Resonancia');
    } else if (this.regionId === 'drakmor') {
      this.addWaystone(-58, 53, 'waystone_drak', 'Altar de Ceniza');
    } else {
      this.addWaystone(-56, 53, 'waystone_kan', 'Altar de los Ecos');
    }
  }

  buildLore() {
    for (const l of LORE) {
      if (l.region !== this.regionId) continue;
      const y = this.heightAt(l.pos.x, l.pos.z);
      const g = new THREE.Group();
      g.position.set(l.pos.x, y, l.pos.z);
      const book = box(0.7, 0.1, 0.5, standardMaterial('#efe4c9'));
      book.position.y = 1.2;
      book.rotation.x = 0.15;
      g.add(book);
      const cover = box(0.74, 0.04, 0.54, standardMaterial('#7a4b3a'));
      cover.position.y = 1.14;
      cover.rotation.x = 0.15;
      g.add(cover);
      const glow = addGlow(g, '#f4d58d', 2.2, [0, 1.2, 0], 0.5);
      glow.material.opacity = 0.4;
      this.dynamic.push({ type: 'lore', mesh: g, baseY: y, phase: this.rng() * TAU });
      this.scene.add(g);
      this.interactables.push({ id: l.id, type: 'lore', x: l.pos.x, z: l.pos.z, radius: 2.6, label: l.name, mesh: g, data: l });
      this.addCollider(l.pos.x, l.pos.z, 0.4);
    }
  }

  /* ------------------------------------------------------------------ */
  /* Runtime                                                             */
  /* ------------------------------------------------------------------ */

  addQuestMarker() {
    const marker = createQuestMarker('#f4d58d');
    marker.visible = false;
    this.scene.add(marker);
    this.questMarker = marker;
    return marker;
  }

  setQuestTarget(pos, label = '') {
    if (!this.questMarker) this.addQuestMarker();
    if (!pos) {
      this.questMarker.visible = false;
      return;
    }
    this.questMarker.position.set(pos.x, this.heightAt(pos.x, pos.z) + 4.2, pos.z);
    this.questMarker.visible = true;
    this.questMarker.userData.label = label;
  }

  update(dt) {
    this.time += dt;
    const t = this.time;
    if (this.water) this.water.material.uniforms.uTime.value = t;
    if (this.motes) {
      const arr = this.motes.positions;
      for (let i = 0; i < this.motes.seeds.length; i++) {
        const s = this.motes.seeds[i];
        arr[i * 3 + 1] = s.base + Math.sin(t * s.speed + s.phase) * 1.6;
        arr[i * 3] = s.x + Math.cos(t * s.speed * 0.3 + s.phase) * 0.6;
      }
      this.motes.points.geometry.attributes.position.needsUpdate = true;
    }
    for (const c of this.clouds) {
      c.position.x += dt * 0.55;
      if (c.position.x > 170) c.position.x = -170;
    }
    if (this.stars) this.stars.rotation.y += dt * 0.003;
    for (const d of this.dynamic) {
      if (d.type === 'banner') {
        d.mesh.rotation.y = 0.08 + Math.sin(t * 1.7 + d.phase) * 0.08;
      } else if (d.type === 'lamp') {
        d.mesh.material.opacity = 0.55 + Math.sin(t * 4 + d.phase) * 0.16;
      } else if (d.type === 'fire') {
        d.mesh.material.opacity = 0.5 + Math.sin(t * 7 + d.phase) * 0.22;
        d.mesh.scale.setScalar(1.6 + Math.sin(t * 6 + d.phase) * 0.15);
      } else if (d.type === 'crystal') {
        d.mesh.rotation.y += dt * 0.6;
        d.mesh.position.y = d.baseY + Math.sin(t * 1.5 + d.phase) * 0.22;
      } else if (d.type === 'runeRing') {
        d.mesh.rotation.z += dt * 0.22;
        d.mesh.material.opacity = 0.35 + Math.sin(t * 2.2) * 0.12;
      } else if (d.type === 'archiveCore') {
        d.mesh.rotation.z += dt * 0.18;
        d.mesh.position.y = d.baseY + Math.sin(t * 0.8) * 0.2;
      } else if (d.type === 'orbitRing') {
        d.mesh.rotation.z += dt * d.speed;
        d.mesh.rotation.x = Math.PI / 2 + Math.sin(t * 0.5 + d.phase) * 0.12;
      } else if (d.type === 'floatRune') {
        d.mesh.position.y = d.baseY + Math.sin(t * 1.8 + d.phase) * 0.25;
        d.mesh.rotation.y += dt * 0.9;
      } else if (d.type === 'floatingRock') {
        d.mesh.position.y = d.baseY + Math.sin(t * d.speed + d.phase) * 0.9;
        d.mesh.rotation.y += dt * 0.1;
      } else if (d.type === 'lore') {
        d.mesh.position.y = d.baseY + Math.sin(t * 1.5 + d.phase) * 0.08;
        d.mesh.rotation.y += dt * 0.3;
      } else if (d.type === 'seal') {
        d.mesh.position.y = d.baseY + Math.sin(t * 2 + d.phase) * 0.18;
        d.mesh.rotation.y += dt * 0.7;
        d.ring.rotation.z += dt * 0.5;
      } else if (d.type === 'gateGlow') {
        d.mesh.material.opacity = 0.08 + Math.sin(t * 2) * 0.04;
      }
    }
    if (this.questMarker?.visible) {
      this.questMarker.position.y = this.heightAt(this.questMarker.position.x, this.questMarker.position.z) + 4.2 + Math.sin(t * 2.5) * 0.25;
      this.questMarker.userData.gem.rotation.y += dt * 1.3;
      this.questMarker.userData.ring.rotation.z += dt * 0.7;
      this.questMarker.userData.ring.scale.setScalar(1 + Math.sin(t * 2) * 0.05);
    }
  }

  getEnemySpawns() {
    return this.enemySpawns;
  }

  getCreatureSpawns() {
    return this.creatureSpawns;
  }

  getNpcSpawns() {
    return this.npcSpawns;
  }

  getInteractables() {
    return this.interactables;
  }
}
