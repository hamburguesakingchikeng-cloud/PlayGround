import * as THREE from 'three';
import { clamp, lerp, damp } from '../core/utils.js';

const mat = (color, opts = {}) => new THREE.MeshStandardMaterial({
  color: new THREE.Color(color),
  roughness: opts.roughness ?? 0.72,
  metalness: opts.metalness ?? 0.08,
  emissive: new THREE.Color(opts.emissive || '#000000'),
  emissiveIntensity: opts.emissiveIntensity ?? 1,
  flatShading: opts.flat ?? false,
  transparent: opts.transparent ?? false,
  opacity: opts.opacity ?? 1,
  side: opts.side ?? THREE.FrontSide,
});

const geo = {
  sphere: (r, w = 12, h = 10) => new THREE.SphereGeometry(r, w, h),
  capsule: (r, l, c = 6, rSeg = 8) => new THREE.CapsuleGeometry(r, l, c, rSeg),
  cylinder: (rt, rb, h, s = 8) => new THREE.CylinderGeometry(rt, rb, h, s),
  box: (w, h, d) => new THREE.BoxGeometry(w, h, d),
  cone: (r, h, s = 6) => new THREE.ConeGeometry(r, h, s),
};

function add(parent, geometry, material, position = [0, 0, 0], rotation = [0, 0, 0], scale = [1, 1, 1]) {
  const m = new THREE.Mesh(geometry, material);
  m.position.set(...position);
  m.rotation.set(...rotation);
  m.scale.set(...scale);
  m.castShadow = true;
  m.receiveShadow = true;
  parent.add(m);
  return m;
}

function taperedBlade(length, width, thickness, material) {
  const shape = new THREE.Shape();
  shape.moveTo(-width / 2, 0);
  shape.lineTo(width / 2, 0);
  shape.lineTo(width * 0.36, length * 0.86);
  shape.lineTo(0, length);
  shape.lineTo(-width * 0.36, length * 0.86);
  shape.closePath();
  const extrude = new THREE.ExtrudeGeometry(shape, { depth: thickness, bevelEnabled: true, bevelSize: 0.006, bevelThickness: 0.006, bevelSegments: 1, steps: 1 });
  extrude.translate(0, 0, -thickness / 2);
  const mesh = new THREE.Mesh(extrude, material);
  mesh.castShadow = true;
  return mesh;
}

function makeCape(color, trim, scale = 1) {
  const w = 0.56 * scale, h = 1.05 * scale;
  const segX = 5, segY = 7;
  const g = new THREE.PlaneGeometry(w, h, segX, segY);
  g.translate(0, -h / 2, 0);
  const m = mat(color, { roughness: 0.92, side: THREE.DoubleSide });
  const cape = new THREE.Mesh(g, m);
  cape.castShadow = true;
  cape.position.set(0, 1.48, -0.16);
  cape.rotation.x = -0.08;
  const base = g.attributes.position.array.slice();
  cape.userData.base = base;
  cape.userData.trimMat = mat(trim, { metalness: 0.5, roughness: 0.4 });
  const hem = new THREE.Mesh(new THREE.BoxGeometry(w * 0.95, 0.035, 0.018), cape.userData.trimMat);
  hem.position.set(0, -h + 0.02, 0.012);
  cape.add(hem);
  return cape;
}

function hairStyle(style, color) {
  const g = new THREE.Group();
  const hairMat = mat(color, { roughness: 0.8, flat: true });
  const cap = add(g, new THREE.SphereGeometry(0.205, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.63), hairMat, [0, 1.735, 0], [0, 0, 0], [1.02, 0.98, 1.04]);
  cap.castShadow = true;
  if (style === 'long') {
    add(g, geo.capsule(0.1, 0.42, 4, 8), hairMat, [-0.14, 1.45, -0.11], [0.12, 0, 0.15], [0.7, 1, 0.5]);
    add(g, geo.capsule(0.1, 0.42, 4, 8), hairMat, [0.14, 1.45, -0.11], [0.12, 0, -0.15], [0.7, 1, 0.5]);
    add(g, geo.capsule(0.12, 0.34, 4, 8), hairMat, [0, 1.44, -0.18], [0.2, 0, 0], [0.9, 1, 0.45]);
  } else if (style === 'braid') {
    add(g, geo.capsule(0.095, 0.32, 4, 8), hairMat, [0.15, 1.46, -0.13], [0.15, 0, -0.2], [0.8, 1, 0.55]);
    for (let i = 0; i < 4; i++) {
      add(g, geo.sphere(0.075 - i * 0.009, 8, 6), hairMat, [0.2 + i * 0.03, 1.26 - i * 0.12, -0.2], [0, 0, 0], [1, 1.2, 0.8]);
    }
    add(g, geo.cone(0.045, 0.12, 6), hairMat, [0.31, 0.79, -0.2], [0, 0, -0.25]);
  } else if (style === 'wild') {
    const spikes = [
      [-0.13, 1.88, 0.03, -0.2, 0, 0.55], [0.12, 1.9, 0.03, 0.2, 0, -0.55],
      [-0.18, 1.79, -0.04, -0.1, 0, 0.9], [0.18, 1.79, -0.04, 0.1, 0, -0.9],
      [0, 1.93, -0.07, -0.4, 0, 0], [-0.06, 1.88, 0.15, 0.6, 0, 0.1],
      [0.07, 1.87, 0.16, 0.5, 0, -0.1],
    ];
    for (const [x, y, z, rx, ry, rz] of spikes) add(g, geo.cone(0.06, 0.24, 5), hairMat, [x, y, z], [rx, ry, rz]);
  } else {
    add(g, geo.cone(0.1, 0.25, 5), hairMat, [-0.12, 1.85, 0.02], [0.2, 0, 0.55]);
    add(g, geo.cone(0.1, 0.22, 5), hairMat, [0.13, 1.86, 0.01], [0.2, 0, -0.5]);
    add(g, geo.cone(0.08, 0.2, 5), hairMat, [0, 1.9, -0.03], [-0.35, 0, 0]);
    add(g, geo.cone(0.065, 0.2, 5), hairMat, [-0.19, 1.76, 0.02], [0.1, 0, 0.9]);
    add(g, geo.cone(0.065, 0.2, 5), hairMat, [0.19, 1.76, 0.02], [0.1, 0, -0.9]);
  }
  return g;
}

function makeSword(appearance = {}) {
  const group = new THREE.Group();
  const bladeMat = new THREE.MeshStandardMaterial({ color: appearance.blade || '#d8ecf1', metalness: 0.85, roughness: 0.24, emissive: appearance.edge || '#ffe5a8', emissiveIntensity: 0.22 });
  const edgeMat = new THREE.MeshBasicMaterial({ color: appearance.edge || '#ffe5a8', transparent: true, opacity: 0.75, blending: THREE.AdditiveBlending });
  const goldMat = mat('#c9a45d', { metalness: 0.85, roughness: 0.3 });
  const leather = mat('#3c2b25', { roughness: 0.9 });
  const blade = taperedBlade(1.03 * (appearance.scale || 1), 0.105, 0.025, bladeMat);
  blade.position.y = 0.08;
  group.add(blade);
  const glow = new THREE.Mesh(new THREE.PlaneGeometry(0.025, 0.85 * (appearance.scale || 1)), edgeMat);
  glow.position.set(0, 0.52, 0.016);
  group.add(glow);
  const cross = add(group, geo.box(0.34, 0.045, 0.075), goldMat, [0, 0.06, 0]);
  cross.rotation.z = 0;
  add(group, geo.cylinder(0.03, 0.035, 0.22, 8), leather, [0, -0.07, 0]);
  add(group, geo.sphere(0.055, 8, 6), goldMat, [0, -0.2, 0]);
  add(group, new THREE.TorusGeometry(0.055, 0.012, 6, 12), goldMat, [0, 0.055, 0], [Math.PI / 2, 0, 0]);
  group.userData.glow = glow;
  return group;
}

export function createHero(options = {}) {
  const outfit = options.outfit || { primary: '#3e7d78', secondary: '#d6b16e', trim: '#f5e3b4', metal: '#c6a45f' };
  const skin = options.skin || '#e9c9a8';
  const hairColor = options.hairColor || '#d9d5cc';
  const hair = options.hairStyle || 'short';
  const root = new THREE.Group();
  const body = new THREE.Group();
  root.add(body);

  const cloth = mat(outfit.primary, { roughness: 0.82 });
  const clothDark = mat(outfit.secondary, { roughness: 0.78 });
  const trimMat = mat(outfit.trim, { metalness: 0.45, roughness: 0.42 });
  const metal = mat(outfit.metal || '#c6a45f', { metalness: 0.85, roughness: 0.28 });
  const leather = mat('#3b2a23', { roughness: 0.9 });
  const skinMat = mat(skin, { roughness: 0.78 });
  const dark = mat('#252129', { roughness: 0.8 });
  const eyeMat = new THREE.MeshStandardMaterial({ color: '#2b2226', emissive: '#3f7f78', emissiveIntensity: 0.4, roughness: 0.4 });
  const glowMat = new THREE.MeshBasicMaterial({ color: '#a8f0e6', transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending });

  // legs
  const leftLeg = new THREE.Group();
  leftLeg.position.set(-0.13, 0.86, 0);
  add(leftLeg, geo.capsule(0.1, 0.46, 4, 8), leather, [0, -0.3, 0]);
  add(leftLeg, geo.capsule(0.082, 0.28, 4, 8), clothDark, [0, -0.7, 0.01]);
  add(leftLeg, geo.box(0.17, 0.12, 0.3), metal, [0, -0.9, 0.07]);
  body.add(leftLeg);
  const rightLeg = new THREE.Group();
  rightLeg.position.set(0.13, 0.86, 0);
  add(rightLeg, geo.capsule(0.1, 0.46, 4, 8), leather, [0, -0.3, 0]);
  add(rightLeg, geo.capsule(0.082, 0.28, 4, 8), clothDark, [0, -0.7, 0.01]);
  add(rightLeg, geo.box(0.17, 0.12, 0.3), metal, [0, -0.9, 0.07]);
  body.add(rightLeg);

  // hips / belt
  add(body, geo.cylinder(0.22, 0.2, 0.18, 10), leather, [0, 0.88, 0]);
  add(body, geo.box(0.46, 0.06, 0.26), metal, [0, 0.92, 0]);
  add(body, geo.box(0.09, 0.09, 0.03), trimMat, [0, 0.92, 0.145]);

  // torso
  const torso = new THREE.Group();
  torso.position.set(0, 1.18, 0);
  body.add(torso);
  add(torso, geo.cylinder(0.24, 0.18, 0.52, 8), cloth, [0, 0, 0], [0, 0, 0], [1, 1, 0.78]);
  add(torso, geo.box(0.34, 0.36, 0.2), clothDark, [0, 0.03, 0.02]);
  const chest = add(torso, geo.box(0.27, 0.3, 0.07), metal, [0, 0.06, 0.16]);
  chest.rotation.x = -0.04;
  add(torso, geo.box(0.06, 0.3, 0.075), trimMat, [0, 0.06, 0.205]);
  add(torso, geo.box(0.3, 0.045, 0.08), trimMat, [0, -0.09, 0.17]);
  add(torso, new THREE.TorusGeometry(0.11, 0.012, 5, 12), trimMat, [0, 0.15, 0.21], [0, 0, 0]);
  add(torso, geo.sphere(0.032, 8, 6), glowMat, [0, 0.15, 0.225]);
  // shoulder pads
  add(torso, geo.sphere(0.16, 10, 7), metal, [-0.32, 0.16, 0], [0, 0, 0.18], [1, 0.7, 0.9]);
  add(torso, geo.sphere(0.16, 10, 7), metal, [0.32, 0.16, 0], [0, 0, -0.18], [1, 0.7, 0.9]);
  add(torso, geo.cone(0.055, 0.16, 5), trimMat, [-0.38, 0.23, 0], [0, 0, 0.4]);
  add(torso, geo.cone(0.055, 0.16, 5), trimMat, [0.38, 0.23, 0], [0, 0, -0.4]);
  // collar
  add(torso, geo.cylinder(0.19, 0.14, 0.13, 8), clothDark, [0, 0.3, -0.01], [0, 0, 0], [1, 1, 0.8]);

  // neck & head
  add(body, geo.cylinder(0.065, 0.075, 0.11, 8), skinMat, [0, 1.48, 0]);
  const head = new THREE.Group();
  head.position.set(0, 1.72, 0.01);
  body.add(head);
  add(head, geo.sphere(0.19, 16, 12), skinMat, [0, 0, 0], [0, 0, 0], [1, 1.03, 0.94]);
  // jaw
  add(head, geo.sphere(0.13, 10, 8), skinMat, [0, -0.09, 0.055], [0, 0, 0], [1, 0.8, 0.8]);
  // eyes
  add(head, geo.sphere(0.026, 8, 6), eyeMat, [-0.068, 0.015, 0.172], [0, 0, 0], [1, 1.15, 0.5]);
  add(head, geo.sphere(0.026, 8, 6), eyeMat, [0.068, 0.015, 0.172], [0, 0, 0], [1, 1.15, 0.5]);
  add(head, geo.sphere(0.008, 6, 4), glowMat, [-0.068, 0.022, 0.19], [0, 0, 0], [1, 1, 0.4]);
  add(head, geo.sphere(0.008, 6, 4), glowMat, [0.068, 0.022, 0.19], [0, 0, 0], [1, 1, 0.4]);
  add(head, geo.box(0.055, 0.012, 0.012), mat('#8b5f55', { roughness: 0.8 }), [0, -0.07, 0.175]);
  // ears
  add(head, geo.sphere(0.032, 8, 6), skinMat, [-0.185, 0, 0], [0, 0, 0], [0.5, 1, 0.8]);
  add(head, geo.sphere(0.032, 8, 6), skinMat, [0.185, 0, 0], [0, 0, 0], [0.5, 1, 0.8]);
  const hairGroup = hairStyle(hair, hairColor);
  head.add(hairGroup);
  // circlet
  add(head, new THREE.TorusGeometry(0.195, 0.01, 4, 16), trimMat, [0, 0.06, 0], [Math.PI / 2, 0, 0], [1, 1, 0.9]);
  add(head, geo.cone(0.024, 0.06, 4), glowMat, [0, 0.25, 0.01], [0, 0, 0]);

  // arms
  const leftArm = new THREE.Group();
  leftArm.position.set(-0.33, 1.42, 0);
  add(leftArm, geo.capsule(0.075, 0.28, 4, 8), cloth, [0, -0.2, 0]);
  add(leftArm, geo.capsule(0.06, 0.22, 4, 8), leather, [0, -0.46, 0]);
  add(leftArm, geo.box(0.12, 0.14, 0.12), metal, [0, -0.6, 0]);
  add(leftArm, geo.sphere(0.075, 8, 6), skinMat, [0, -0.68, 0]);
  body.add(leftArm);
  const rightArm = new THREE.Group();
  rightArm.position.set(0.33, 1.42, 0);
  add(rightArm, geo.capsule(0.075, 0.28, 4, 8), cloth, [0, -0.2, 0]);
  add(rightArm, geo.capsule(0.06, 0.22, 4, 8), leather, [0, -0.46, 0]);
  add(rightArm, geo.box(0.12, 0.14, 0.12), metal, [0, -0.6, 0]);
  add(rightArm, geo.sphere(0.075, 8, 6), skinMat, [0, -0.68, 0]);
  body.add(rightArm);

  // sword
  const sword = makeSword(options.weaponAppearance || {});
  sword.position.set(0, -0.7, 0.02);
  sword.rotation.x = Math.PI;
  sword.rotation.z = 0.04;
  rightArm.add(sword);

  // cape
  const cape = makeCape(outfit.primary, outfit.trim);
  body.add(cape);

  // floating rune / aura
  const aura = new THREE.Mesh(new THREE.TorusGeometry(0.45, 0.008, 4, 32), new THREE.MeshBasicMaterial({ color: outfit.trim, transparent: true, opacity: 0.15, blending: THREE.AdditiveBlending }));
  aura.rotation.x = Math.PI / 2;
  aura.position.y = 0.04;
  root.add(aura);

  root.userData.rig = {
    body, torso, head, hairGroup, leftLeg, rightLeg, leftArm, rightArm, sword, cape, aura,
    materials: { cloth, clothDark, trimMat, metal, leather, skinMat, eyeMat, glowMat },
  };
  root.userData.type = 'hero';
  root.userData.height = 1.9;
  return root;
}

export function updateHeroAppearance(hero, options) {
  const r = hero.userData.rig;
  if (!r) return;
  if (options.outfit) {
    r.materials.cloth.color.set(options.outfit.primary);
    r.materials.clothDark.color.set(options.outfit.secondary);
    r.materials.trimMat.color.set(options.outfit.trim);
    r.materials.metal.color.set(options.outfit.metal || '#c6a45f');
    if (r.cape) {
      r.cape.material.color.set(options.outfit.primary);
      r.cape.userData.trimMat.color.set(options.outfit.trim);
    }
  }
  if (options.weaponAppearance && r.sword) {
    const sword = makeSword(options.weaponAppearance);
    sword.position.copy(r.sword.position);
    sword.rotation.copy(r.sword.rotation);
    r.rightArm.remove(r.sword);
    r.rightArm.add(sword);
    r.sword = sword;
  }
}

export function poseHero(hero, state, dt, time) {
  const r = hero.userData.rig;
  if (!r) return;
  const speed = clamp(state.speed || 0, 0, 1.5);
  const run = speed > 0.04;
  const phase = state.runPhase || 0;
  const attack = state.attack || 0;
  const attackType = state.attackType || 'light';
  const combo = state.combo || 0;
  const blocking = state.blocking;
  const dodging = state.dodge || 0;
  const hurt = state.hurt || 0;
  const dead = state.dead || 0;

  const breathe = Math.sin(time * 1.7) * 0.012;
  const runSin = Math.sin(phase);
  const runCos = Math.cos(phase);

  r.body.position.y = run ? Math.abs(Math.sin(phase * 2)) * 0.025 : breathe;
  r.body.rotation.x = run ? -0.07 * clamp(speed, 0, 1) : 0;
  r.body.rotation.z = dodging ? Math.sin(clamp(dodging, 0, 1) * Math.PI) * 0.35 : 0;
  r.body.rotation.y = attack ? (attackType === 'heavy' ? -0.25 : 0.1) : 0;

  if (run) {
    r.leftLeg.rotation.x = runSin * 0.75 * clamp(speed, 0, 1.25);
    r.rightLeg.rotation.x = -runSin * 0.75 * clamp(speed, 0, 1.25);
    r.leftArm.rotation.x = -runSin * 0.5 * clamp(speed, 0, 1.2);
    r.rightArm.rotation.x = runSin * 0.45 * clamp(speed, 0, 1.2);
    r.leftArm.rotation.z = 0.04;
    r.rightArm.rotation.z = -0.04;
    r.torso.rotation.y = runSin * 0.07;
    r.torso.rotation.x = 0.05;
  } else {
    r.leftLeg.rotation.x = damp(r.leftLeg.rotation.x, 0, 10, dt);
    r.rightLeg.rotation.x = damp(r.rightLeg.rotation.x, 0, 10, dt);
    r.leftArm.rotation.x = damp(r.leftArm.rotation.x, Math.sin(time * 1.3) * 0.025, 8, dt);
    r.rightArm.rotation.x = damp(r.rightArm.rotation.x, Math.sin(time * 1.3 + 1) * 0.025, 8, dt);
    r.leftArm.rotation.z = damp(r.leftArm.rotation.z, 0.06, 8, dt);
    r.rightArm.rotation.z = damp(r.rightArm.rotation.z, -0.06, 8, dt);
    r.torso.rotation.y = damp(r.torso.rotation.y, 0, 8, dt);
    r.torso.rotation.x = damp(r.torso.rotation.x, 0, 8, dt);
  }

  if (blocking) {
    r.rightArm.rotation.x = damp(r.rightArm.rotation.x, -1.25, 16, dt);
    r.rightArm.rotation.z = damp(r.rightArm.rotation.z, -0.25, 16, dt);
    r.leftArm.rotation.x = damp(r.leftArm.rotation.x, -1.4, 16, dt);
    r.leftArm.rotation.z = damp(r.leftArm.rotation.z, 0.38, 16, dt);
    r.sword.rotation.x = damp(r.sword.rotation.x, Math.PI - 0.2, 16, dt);
    r.body.rotation.x = damp(r.body.rotation.x, 0.08, 12, dt);
  }

  if (attack > 0) {
    const t = clamp(attack, 0, 1);
    const swing = attackType === 'heavy'
      ? Math.sin(t * Math.PI) * 2.4
      : Math.sin(t * Math.PI) * 1.9;
    const dir = combo % 2 === 0 ? 1 : -1;
    r.rightArm.rotation.x = -0.45 - swing * 0.9;
    r.rightArm.rotation.z = -0.2 + dir * swing * 0.45;
    r.rightArm.rotation.y = dir * swing * 0.55;
    r.sword.rotation.x = Math.PI - 0.7 + Math.sin(t * Math.PI) * 1.2;
    r.torso.rotation.y = -dir * Math.sin(t * Math.PI) * 0.5;
    r.leftArm.rotation.x = -0.2 - Math.sin(t * Math.PI) * 0.5;
    r.leftArm.rotation.z = 0.25;
    r.body.rotation.x = -Math.sin(t * Math.PI) * 0.08;
  }

  if (dodging > 0) {
    const t = clamp(dodging, 0, 1);
    r.body.rotation.x = Math.sin(t * Math.PI) * 0.8;
    r.body.position.y = Math.sin(t * Math.PI) * 0.25;
    r.leftArm.rotation.x = -0.8;
    r.rightArm.rotation.x = -0.8;
    r.leftLeg.rotation.x = -0.6;
    r.rightLeg.rotation.x = -0.6;
  }

  if (hurt > 0) {
    r.body.rotation.x = Math.sin(hurt * Math.PI) * -0.2;
    r.torso.rotation.z = Math.sin(hurt * Math.PI) * 0.12;
  }
  if (dead > 0) {
    const t = clamp(dead, 0, 1);
    r.body.rotation.x = t * 1.25;
    r.body.position.y = -t * 0.3;
    r.leftLeg.rotation.x = -t * 0.4;
    r.rightLeg.rotation.x = -t * 0.4;
  }

  // cape physics-ish
  if (r.cape) {
    const pos = r.cape.geometry.attributes.position;
    const base = r.cape.userData.base;
    const sway = Math.sin(time * 2.2) * 0.025 + speed * 0.06;
    for (let i = 0; i < pos.count; i++) {
      const x = base[i * 3];
      const y = base[i * 3 + 1];
      const z = base[i * 3 + 2];
      const depth = clamp((-y) / 1.05, 0, 1);
      pos.setZ(i, z + Math.sin(time * 3.4 + y * 6 + x * 2) * 0.035 * depth + depth * (0.08 + speed * 0.22));
      pos.setX(i, x + Math.sin(time * 2.3 + y * 4) * 0.018 * depth);
    }
    pos.needsUpdate = true;
    r.cape.geometry.computeVertexNormals();
  }
  if (r.aura) {
    r.aura.rotation.z = time * 0.18;
    r.aura.material.opacity = 0.12 + Math.sin(time * 2) * 0.035;
  }
  if (r.sword?.userData?.glow) {
    r.sword.userData.glow.material.opacity = 0.55 + Math.sin(time * 4) * 0.12;
  }
}

/* ----------------------------- Creatures ----------------------------- */

function creatureMat(color, emissiveIntensity = 0.8) {
  return new THREE.MeshStandardMaterial({
    color: new THREE.Color(color), roughness: 0.45, metalness: 0.15,
    emissive: new THREE.Color(color), emissiveIntensity,
    transparent: true, opacity: 0.94,
  });
}

export function createCreature(id, scale = 1) {
  const group = new THREE.Group();
  const data = {
    lumin: { c1: '#ffe0a0', c2: '#d6a94d', glow: '#fff2c4' },
    bruma: { c1: '#a99bd6', c2: '#574a86', glow: '#d9ccff' },
    terravok: { c1: '#9cc08b', c2: '#506344', glow: '#d7f0bd' },
    chispa: { c1: '#ff9b57', c2: '#b5362e', glow: '#ffd0a0' },
    aeris: { c1: '#a7e3dc', c2: '#427c85', glow: '#d9fffb' },
    astral: { c1: '#bca3ee', c2: '#514b9f', glow: '#eadfff' },
    seraph: { c1: '#f2e7bd', c2: '#c59b52', glow: '#fff8d9' },
  }[id] || { c1: '#ffe0a0', c2: '#d6a94d', glow: '#fff2c4' };
  const c1 = creatureMat(data.c1, 0.75);
  const c2 = creatureMat(data.c2, 0.35);
  const glow = new THREE.MeshBasicMaterial({ color: data.glow, transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending, depthWrite: false });
  const dark = new THREE.MeshStandardMaterial({ color: '#22202a', roughness: 0.8 });
  const body = new THREE.Group();
  group.add(body);

  if (id === 'lumin' || id === 'chispa') {
    add(body, geo.sphere(0.26, 12, 9), c1, [0, 0.42, 0], [0, 0, 0], [1.35, 0.9, 0.8]);
    add(body, geo.sphere(0.2, 12, 9), c1, [0, 0.66, 0.17], [0, 0, 0], [1, 1, 0.95]);
    add(body, geo.sphere(0.07, 8, 6), c2, [0, 0.48, 0.34], [0, 0, 0], [1, 0.8, 0.8]);
    add(body, geo.cone(0.12, 0.25, 5), c1, [-0.13, 0.85, 0.12], [0, 0, 0.18]);
    add(body, geo.cone(0.12, 0.25, 5), c1, [0.13, 0.85, 0.12], [0, 0, -0.18]);
    for (const s of [-1, 1]) {
      add(body, geo.sphere(0.04, 6, 4), dark, [s * 0.085, 0.69, 0.34]);
      add(body, geo.sphere(0.014, 5, 4), glow, [s * 0.085, 0.7, 0.375]);
      add(body, geo.capsule(0.045, 0.18, 3, 6), c2, [s * 0.16, 0.18, 0], [0, 0, 0], [1, 1, 0.7]);
      add(body, geo.sphere(0.06, 6, 4), c2, [s * 0.16, 0.04, 0.02]);
    }
    const tail = new THREE.Group();
    tail.position.set(0, 0.4, -0.25);
    body.add(tail);
    add(tail, geo.capsule(0.08, 0.35, 4, 7), c1, [0, 0.08, -0.18], [0.9, 0, 0], [1, 1, 0.8]);
    add(tail, geo.sphere(0.12, 8, 6), glow, [0, 0.2, -0.43]);
    group.userData.tail = tail;
  } else if (id === 'bruma') {
    add(body, geo.cone(0.34, 0.9, 7), c2, [0, 0.38, 0], [0, 0, 0], [1, 1, 0.7]);
    add(body, geo.sphere(0.23, 12, 9), c1, [0, 0.78, 0]);
    add(body, geo.sphere(0.06, 6, 4), glow, [-0.09, 0.82, 0.2]);
    add(body, geo.sphere(0.06, 6, 4), glow, [0.09, 0.82, 0.2]);
    for (const s of [-1, 1]) add(body, geo.cone(0.08, 0.34, 5), c1, [s * 0.24, 0.65, 0], [0, 0, s * 0.8]);
    add(body, new THREE.TorusGeometry(0.28, 0.012, 4, 20), glow, [0, 0.45, 0], [Math.PI / 2, 0, 0]);
  } else if (id === 'terravok') {
    add(body, geo.sphere(0.38, 10, 8), c2, [0, 0.36, 0], [0, 0, 0], [1.2, 0.8, 1]);
    add(body, geo.sphere(0.28, 10, 8), c1, [0, 0.48, 0.02], [0, 0, 0], [1, 0.7, 0.9]);
    for (const s of [-1, 1]) {
      add(body, geo.sphere(0.06, 6, 4), glow, [s * 0.11, 0.55, 0.29]);
      for (let i = 0; i < 2; i++) add(body, geo.capsule(0.055, 0.12, 3, 6), c2, [s * 0.25, 0.16, -0.1 + i * 0.18], [0.3, 0, 0]);
    }
    add(body, geo.cone(0.08, 0.2, 5), c1, [-0.12, 0.7, 0.02], [0, 0, 0.2]);
    add(body, geo.cone(0.08, 0.2, 5), c1, [0.12, 0.7, 0.02], [0, 0, -0.2]);
    add(body, geo.sphere(0.1, 7, 5), c1, [0, 0.45, 0.36], [0, 0, 0], [1, 0.7, 0.8]);
  } else if (id === 'aeris') {
    add(body, geo.sphere(0.22, 12, 9), c1, [0, 0.65, 0], [0, 0, 0], [1, 1.2, 0.8]);
    for (const s of [-1, 1]) {
      add(body, geo.sphere(0.16, 8, 6), glow, [s * 0.3, 0.72, 0], [0, 0, s * 0.4], [1.5, 0.16, 0.5]);
      add(body, geo.sphere(0.03, 6, 4), dark, [s * 0.08, 0.72, 0.18]);
    }
    for (let i = 0; i < 5; i++) add(body, geo.capsule(0.02, 0.25 + i * 0.03, 3, 5), c1, [(i - 2) * 0.08, 0.28 - i * 0.02, 0], [0, 0, (i - 2) * 0.12]);
    add(body, new THREE.TorusGeometry(0.3, 0.008, 4, 20), glow, [0, 0.64, 0], [Math.PI / 2, 0, 0]);
  } else if (id === 'astral') {
    add(body, geo.sphere(0.27, 12, 9), c1, [0, 0.66, 0], [0, 0, 0], [1, 1.05, 0.9]);
    add(body, geo.cone(0.07, 0.18, 5), c2, [-0.12, 0.9, 0], [0, 0, 0.2]);
    add(body, geo.cone(0.07, 0.18, 5), c2, [0.12, 0.9, 0], [0, 0, -0.2]);
    for (const s of [-1, 1]) {
      add(body, geo.sphere(0.06, 6, 4), glow, [s * 0.1, 0.69, 0.2]);
      add(body, geo.sphere(0.18, 8, 6), glow, [s * 0.33, 0.62, -0.02], [0, 0, s * 0.3], [1.3, 0.18, 0.6]);
    }
    add(body, new THREE.TorusGeometry(0.32, 0.012, 4, 24), glow, [0, 0.98, 0], [Math.PI / 2, 0, 0]);
    add(body, new THREE.TorusGeometry(0.4, 0.006, 4, 24), glow, [0, 0.98, 0], [Math.PI / 2, 0.4, 0]);
    add(body, geo.sphere(0.06, 6, 4), c2, [0, 0.52, 0.2]);
  } else {
    add(body, geo.sphere(0.2, 10, 8), c1, [0, 0.7, 0]);
    for (const s of [-1, 1]) {
      add(body, geo.sphere(0.3, 8, 6), glow, [s * 0.34, 0.78, -0.04], [0, 0, s * 0.5], [1.4, 0.2, 0.7]);
      add(body, geo.sphere(0.035, 6, 4), dark, [s * 0.07, 0.75, 0.18]);
    }
    add(body, new THREE.TorusGeometry(0.27, 0.01, 4, 20), glow, [0, 0.98, 0], [Math.PI / 2, 0, 0]);
    add(body, geo.cone(0.18, 0.5, 7), c2, [0, 0.3, 0]);
  }

  group.scale.setScalar(scale);
  group.userData.type = 'creature';
  group.userData.id = id;
  group.userData.baseY = 0;
  group.userData.body = body;
  group.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = false; } });
  return group;
}

export function animateCreature(creature, t, active = true) {
  const body = creature.userData.body;
  if (!body) return;
  body.position.y = Math.sin(t * 2.2) * 0.06 + (active ? 0 : 0.08);
  body.rotation.y = Math.sin(t * 0.8) * 0.12;
  if (creature.userData.tail) creature.userData.tail.rotation.y = Math.sin(t * 2.8) * 0.25;
  body.rotation.z = Math.sin(t * 1.4) * 0.025;
}
