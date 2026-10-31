import * as THREE from 'three';
import {
  TAU, clamp, lerp, damp, toonMaterial, standardMaterial, glowSprite,
  box, cyl, sphere, cone, addGlow,
} from './three-utils.js';
import { APPEARANCE, WEAPONS } from './data.js';

function mat(color, opts = {}) {
  return toonMaterial(color, opts);
}

function emissive(color, intensity = 1.2, opts = {}) {
  return new THREE.MeshBasicMaterial({ color, ...opts });
}

function collectMats(root) {
  const out = [];
  root.traverse((o) => {
    if (o.isMesh && o.material) {
      const mats = Array.isArray(o.material) ? o.material : [o.material];
      for (const m of mats) {
        if (m.emissive && !out.includes(m)) out.push(m);
      }
    }
  });
  return out;
}

function humanoidBody(opts) {
  const {
    skin = '#e2b184',
    outfit = '#2e5877',
    accent = '#f4d58d',
    hair = '#241d2e',
    hairStyle = 'corto',
    headgear = 'ninguno',
    armorTier = 0,
    scale = 1,
  } = opts;
  const root = new THREE.Group();
  const bodyRoot = new THREE.Group();
  root.add(bodyRoot);
  const parts = {};
  const materials = {};

  const skinMat = mat(skin);
  const outfitMat = mat(outfit);
  const accentMat = mat(accent, { emissive: new THREE.Color(accent).multiplyScalar(0.12) });
  const hairMat = mat(hair);
  const darkMat = mat('#232433');
  const bootMat = mat('#3a2d2b');
  const leatherMat = mat('#5d3e32');
  materials.skin = skinMat;
  materials.outfit = outfitMat;
  materials.accent = accentMat;
  materials.hair = hairMat;

  const hips = new THREE.Group();
  hips.position.y = 0.92;
  bodyRoot.add(hips);

  const pelvis = sphere(0.3, outfitMat, 10);
  pelvis.scale.set(1.05, 0.7, 0.8);
  hips.add(pelvis);

  const torso = new THREE.Group();
  torso.position.y = 0.08;
  hips.add(torso);
  parts.torso = torso;

  const chest = new THREE.Mesh(new THREE.CapsuleGeometry(0.27, 0.38, 4, 8), outfitMat);
  chest.position.y = 0.3;
  chest.castShadow = true;
  chest.receiveShadow = true;
  chest.scale.set(1.06, 1, 0.82);
  torso.add(chest);

  const chestTrim = new THREE.Mesh(new THREE.TorusGeometry(0.25, 0.025, 4, 12), accentMat);
  chestTrim.position.set(0, 0.23, 0.02);
  chestTrim.rotation.x = Math.PI / 2;
  chestTrim.scale.z = 0.82;
  torso.add(chestTrim);

  const belt = new THREE.Mesh(new THREE.TorusGeometry(0.27, 0.035, 4, 12), leatherMat);
  belt.position.y = -0.04;
  belt.rotation.x = Math.PI / 2;
  belt.scale.z = 0.82;
  torso.add(belt);
  const buckle = box(0.09, 0.07, 0.04, accentMat);
  buckle.position.set(0, -0.04, 0.235);
  torso.add(buckle);

  // shoulder pads / mantle
  if (armorTier >= 1) {
    for (const side of [-1, 1]) {
      const pad = sphere(0.16, accentMat, 8);
      pad.scale.set(1.15, 0.62, 1);
      pad.position.set(side * 0.36, 0.52, 0);
      torso.add(pad);
      const trim = new THREE.Mesh(new THREE.TorusGeometry(0.11, 0.018, 4, 10), accentMat);
      trim.position.set(side * 0.36, 0.52, 0);
      trim.rotation.x = Math.PI / 2;
      torso.add(trim);
    }
  }

  // arms
  function makeArm(side) {
    const pivot = new THREE.Group();
    pivot.position.set(side * 0.36, 0.48, 0);
    torso.add(pivot);
    const upper = new THREE.Mesh(new THREE.CapsuleGeometry(0.075, 0.24, 3, 6), outfitMat);
    upper.position.y = -0.17;
    upper.castShadow = true;
    pivot.add(upper);
    const forearm = new THREE.Mesh(new THREE.CapsuleGeometry(0.065, 0.2, 3, 6), skinMat);
    forearm.position.y = -0.46;
    forearm.castShadow = true;
    pivot.add(forearm);
    const bracer = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.07, 0.12, 6), accentMat);
    bracer.position.y = -0.36;
    pivot.add(bracer);
    const hand = sphere(0.07, skinMat, 6);
    hand.position.y = -0.6;
    pivot.add(hand);
    return pivot;
  }
  parts.leftArm = makeArm(-1);
  parts.rightArm = makeArm(1);

  // legs
  function makeLeg(side) {
    const pivot = new THREE.Group();
    pivot.position.set(side * 0.16, 0.0, 0);
    hips.add(pivot);
    const thigh = new THREE.Mesh(new THREE.CapsuleGeometry(0.09, 0.26, 3, 6), darkMat);
    thigh.position.y = -0.2;
    thigh.castShadow = true;
    pivot.add(thigh);
    const shin = new THREE.Mesh(new THREE.CapsuleGeometry(0.075, 0.24, 3, 6), bootMat);
    shin.position.y = -0.5;
    shin.castShadow = true;
    pivot.add(shin);
    const boot = box(0.17, 0.11, 0.27, bootMat);
    boot.position.set(0, -0.66, 0.06);
    pivot.add(boot);
    const knee = new THREE.Mesh(new THREE.SphereGeometry(0.085, 6, 5), accentMat);
    knee.position.y = -0.36;
    pivot.add(knee);
    return pivot;
  }
  parts.leftLeg = makeLeg(-1);
  parts.rightLeg = makeLeg(1);

  // head
  const neck = new THREE.Group();
  neck.position.y = 0.66;
  torso.add(neck);
  const headGroup = new THREE.Group();
  headGroup.position.y = 0.16;
  neck.add(headGroup);
  parts.head = headGroup;

  const head = sphere(0.225, skinMat, 12);
  head.scale.set(0.92, 1.04, 0.92);
  headGroup.add(head);
  const jaw = sphere(0.16, skinMat, 8);
  jaw.position.set(0, -0.1, 0.04);
  jaw.scale.set(1, 0.8, 0.9);
  headGroup.add(jaw);

  // eyes
  const eyeWhiteMat = new THREE.MeshBasicMaterial({ color: '#f8f4e9' });
  const eyeMat = new THREE.MeshBasicMaterial({ color: '#263048' });
  for (const side of [-1, 1]) {
    const white = sphere(0.035, eyeWhiteMat, 6);
    white.position.set(side * 0.075, 0.015, 0.195);
    white.scale.set(1, 0.7, 0.5);
    headGroup.add(white);
    const iris = sphere(0.019, eyeMat, 6);
    iris.position.set(side * 0.075, 0.012, 0.222);
    iris.scale.set(1, 1, 0.4);
    headGroup.add(iris);
  }
  const browMat = new THREE.MeshBasicMaterial({ color: hair });
  for (const side of [-1, 1]) {
    const brow = box(0.07, 0.012, 0.02, browMat);
    brow.position.set(side * 0.075, 0.075, 0.215);
    brow.rotation.z = side * -0.12;
    headGroup.add(brow);
  }

  // hair
  const hairGroup = new THREE.Group();
  headGroup.add(hairGroup);
  const cap = sphere(0.245, hairMat, 10);
  cap.position.set(0, 0.055, -0.025);
  cap.scale.set(0.98, 0.92, 0.8);
  hairGroup.add(cap);
  const fringe = box(0.34, 0.09, 0.12, hairMat);
  fringe.position.set(0, 0.12, 0.16);
  fringe.rotation.x = -0.18;
  hairGroup.add(fringe);
  if (hairStyle === 'largo' || hairStyle === 'trenza') {
    const back = new THREE.Mesh(new THREE.CapsuleGeometry(0.18, 0.42, 4, 8), hairMat);
    back.position.set(0, -0.16, -0.13);
    back.scale.set(0.95, 1, 0.55);
    hairGroup.add(back);
  }
  if (hairStyle === 'trenza') {
    for (let i = 0; i < 4; i++) {
      const knot = sphere(0.075 - i * 0.008, hairMat, 6);
      knot.position.set(0.2, -0.22 - i * 0.13, -0.12);
      hairGroup.add(knot);
    }
    const tie = new THREE.Mesh(new THREE.TorusGeometry(0.055, 0.012, 4, 8), accentMat);
    tie.position.set(0.2, -0.5, -0.12);
    tie.rotation.x = Math.PI / 2;
    hairGroup.add(tie);
  }
  if (hairStyle === 'rapado') {
    cap.scale.set(0.94, 0.55, 0.78);
    cap.position.set(0, 0.08, -0.02);
    fringe.visible = false;
  }

  // headgear
  if (headgear === 'diadema') {
    const band = new THREE.Mesh(new THREE.TorusGeometry(0.23, 0.018, 4, 16), accentMat);
    band.position.y = 0.13;
    band.rotation.x = Math.PI / 2;
    headGroup.add(band);
    const gem = new THREE.Mesh(new THREE.OctahedronGeometry(0.045, 0), emissive(accent, 1.4));
    gem.position.set(0, 0.18, 0.22);
    headGroup.add(gem);
  } else if (headgear === 'celada') {
    const helm = new THREE.Mesh(new THREE.SphereGeometry(0.255, 10, 8, 0, TAU, 0, Math.PI * 0.62), accentMat);
    helm.position.y = 0.05;
    helm.scale.set(1, 1.08, 1);
    headGroup.add(helm);
    const nose = box(0.045, 0.16, 0.06, accentMat);
    nose.position.set(0, 0.0, 0.23);
    headGroup.add(nose);
    const crest = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.22, 5), mat('#e7c36b'));
    crest.position.set(0, 0.29, -0.02);
    headGroup.add(crest);
  }

  // cape
  const capeGroup = new THREE.Group();
  capeGroup.position.set(0, 0.5, -0.19);
  torso.add(capeGroup);
  const capeMat = new THREE.MeshStandardMaterial({
    color: accent,
    side: THREE.DoubleSide,
    roughness: 0.95,
    transparent: true,
    opacity: armorTier >= 2 ? 0.95 : 0.78,
  });
  const cape = new THREE.Mesh(new THREE.PlaneGeometry(0.64, armorTier >= 2 ? 1.1 : 0.72, 4, 6), capeMat);
  cape.position.y = -0.42;
  cape.rotation.x = 0.06;
  cape.castShadow = true;
  capeGroup.add(cape);
  parts.cape = capeGroup;
  materials.cape = capeMat;

  // energy shield
  const shield = new THREE.Group();
  const shieldRing = new THREE.Mesh(
    new THREE.RingGeometry(0.38, 0.52, 6),
    new THREE.MeshBasicMaterial({
      color: accent,
      transparent: true,
      opacity: 0.8,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }),
  );
  shield.add(shieldRing);
  const shieldInner = new THREE.Mesh(
    new THREE.CircleGeometry(0.36, 6),
    new THREE.MeshBasicMaterial({
      color: accent,
      transparent: true,
      opacity: 0.12,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }),
  );
  shield.add(shieldInner);
  shield.position.set(0, 1.15, 0.65);
  shield.visible = false;
  root.add(shield);
  parts.shield = shield;

  root.scale.setScalar(scale);
  return { group: root, bodyRoot, parts, materials, materialsList: collectMats(root) };
}

export function buildSword(weaponId = 'filo_aurora', scale = 1) {
  const w = WEAPONS[weaponId] || WEAPONS.filo_aurora;
  const g = new THREE.Group();
  const bladeMat = new THREE.MeshStandardMaterial({
    color: w.color,
    emissive: new THREE.Color(w.glow).multiplyScalar(0.65),
    roughness: 0.24,
    metalness: 0.7,
  });
  const goldMat = standardMaterial('#d9b969', { metalness: 0.8, roughness: 0.35 });
  const gripMat = standardMaterial('#4a2f2c', { roughness: 0.9 });

  const heavy = weaponId === 'mandoble_alba';
  const fast = weaponId === 'hoja_brisa';
  const length = heavy ? 1.38 : fast ? 1.08 : 1.22;
  const width = heavy ? 0.13 : fast ? 0.06 : 0.085;

  const blade = box(width, length, 0.035, bladeMat);
  blade.position.y = 0.32 + length / 2;
  g.add(blade);
  const tip = cone(width * 0.78, 0.24, bladeMat, 4);
  tip.position.y = 0.32 + length + 0.1;
  tip.rotation.y = Math.PI / 4;
  g.add(tip);
  const fuller = box(width * 0.24, length * 0.82, 0.04, new THREE.MeshBasicMaterial({ color: w.glow }));
  fuller.position.set(0, 0.36 + length * 0.45, 0.005);
  g.add(fuller);

  const guard = box(heavy ? 0.44 : 0.3, 0.06, 0.07, goldMat);
  guard.position.y = 0.3;
  g.add(guard);
  for (const s of [-1, 1]) {
    const tipG = new THREE.Mesh(new THREE.ConeGeometry(0.035, 0.14, 4), goldMat);
    tipG.position.set(s * (heavy ? 0.25 : 0.17), 0.36, 0);
    tipG.rotation.z = s * -0.7;
    g.add(tipG);
  }
  const grip = cyl(0.045, 0.04, 0.26, gripMat, 6);
  grip.position.y = 0.15;
  g.add(grip);
  const pommel = sphere(0.075, goldMat, 6);
  pommel.position.y = 0.0;
  g.add(pommel);
  const gem = new THREE.Mesh(new THREE.OctahedronGeometry(0.06, 0), new THREE.MeshBasicMaterial({ color: w.glow }));
  gem.position.set(0, 0.3, 0.06);
  g.add(gem);
  addGlow(g, w.glow, heavy ? 0.9 : 0.6, [0, 0.3, 0.05], 0.5);
  g.scale.setScalar(scale);
  g.userData.weapon = w;
  g.userData.gem = gem;
  g.userData.bladeMat = bladeMat;
  return g;
}

export function buildPlayer(appearance = {}, weaponId = 'filo_aurora', armorId = 'tunica_viajero', headgear = 'ninguno') {
  const skin = appearance.skinColor || APPEARANCE.skin[1].color;
  const outfit = appearance.outfitColor || APPEARANCE.outfitColors[0].color;
  const accent = appearance.accentColor || APPEARANCE.accents[0].color;
  const hair = appearance.hairColor || APPEARANCE.hairColors[0].color;
  const hairStyle = appearance.hairStyle || 'corto';
  const armorTier = { tunica_viajero: 0, coraza_valdoria: 1, manto_ceniza: 2, vestiduras_astrales: 3, armadura_celestial: 4 }[armorId] ?? 0;
  const model = humanoidBody({ skin, outfit, accent, hair, hairStyle, headgear, armorTier });
  const weapon = buildSword(weaponId, 1);
  weapon.position.set(0, -0.58, 0.03);
  weapon.rotation.set(0.1, 0, -0.14);
  model.parts.rightArm.add(weapon);
  model.parts.weapon = weapon;
  model.group.userData.kind = 'player';
  model.group.userData.model = model;
  model.weaponId = weaponId;
  model.armorId = armorId;
  model.pose = {
    moving: 0,
    sprinting: false,
    attacking: false,
    attackType: 'light',
    attackProgress: 0,
    combo: 0,
    blocking: false,
    casting: false,
    castProgress: 0,
    dodging: false,
    dodgeProgress: 0,
    hurt: 0,
    dead: false,
    deadProgress: 0,
    grounded: true,
    time: 0,
  };
  return model;
}

export function updatePlayerModel(model, dt, time) {
  const p = model.pose;
  const { bodyRoot, parts, materialsList } = model;
  p.time += dt;
  const t = p.time;
  const move = clamp(p.moving, 0, 1);
  const run = move * (p.sprinting ? 1.35 : 1);

  bodyRoot.position.y = 0;
  bodyRoot.position.x = 0;
  bodyRoot.position.z = 0;
  bodyRoot.rotation.set(0, 0, 0);

  // idle breathing
  const breathe = Math.sin(t * 2.1) * 0.012;
  bodyRoot.position.y = breathe;
  parts.torso.rotation.x = damp(parts.torso.rotation.x, 0.06 + run * 0.12, 8, dt);
  parts.torso.rotation.z = damp(parts.torso.rotation.z, -Math.sin(t * 8) * 0.025 * move, 8, dt);

  // legs and arms walk cycle
  const cycle = t * (p.sprinting ? 12 : 8.5);
  const swing = Math.sin(cycle) * 0.68 * run;
  parts.leftLeg.rotation.x = damp(parts.leftLeg.rotation.x, swing, 16, dt);
  parts.rightLeg.rotation.x = damp(parts.rightLeg.rotation.x, -swing, 16, dt);
  parts.leftLeg.rotation.z = 0;
  parts.rightLeg.rotation.z = 0;
  parts.leftArm.rotation.x = damp(parts.leftArm.rotation.x, -swing * 0.6 - 0.05, 14, dt);
  parts.rightArm.rotation.x = damp(parts.rightArm.rotation.x, swing * 0.45 - 0.08, 14, dt);
  parts.leftArm.rotation.z = damp(parts.leftArm.rotation.z, 0.08, 8, dt);
  parts.rightArm.rotation.z = damp(parts.rightArm.rotation.z, -0.08, 8, dt);
  parts.head.rotation.x = damp(parts.head.rotation.x, -run * 0.08, 8, dt);
  parts.head.rotation.z = damp(parts.head.rotation.z, Math.sin(t * 1.3) * 0.03 * (1 - move), 6, dt);
  parts.cape.rotation.x = damp(parts.cape.rotation.x, 0.05 + run * 0.42 + Math.sin(t * 5) * 0.05, 7, dt);
  parts.cape.rotation.z = Math.sin(t * 3.4) * 0.04;
  if (parts.shield) parts.shield.visible = false;
  if (parts.weapon) {
    parts.weapon.visible = true;
    parts.weapon.rotation.set(0.1, 0, -0.14);
    parts.weapon.position.set(0, -0.58, 0.03);
  }

  // hurt flash
  if (p.hurt > 0) {
    p.hurt = Math.max(0, p.hurt - dt);
    const f = p.hurt * 8;
    bodyRoot.position.x = Math.sin(t * 75) * 0.045 * f;
    for (const m of materialsList) m.emissive?.setRGB(f * 0.55, f * 0.08, f * 0.04);
  } else {
    for (const m of materialsList) m.emissive?.setRGB(0, 0, 0);
  }

  if (p.dead) {
    p.deadProgress = Math.min(1, p.deadProgress + dt * 1.6);
    bodyRoot.rotation.x = -p.deadProgress * 1.35;
    bodyRoot.position.y = -p.deadProgress * 0.25;
    return;
  }

  if (p.dodging) {
    const q = clamp(p.dodgeProgress, 0, 1);
    bodyRoot.position.y = 0.45 + Math.sin(q * Math.PI) * 0.25;
    bodyRoot.rotation.x = q * TAU;
    parts.leftArm.rotation.x = -1.2;
    parts.rightArm.rotation.x = -1.2;
    return;
  }

  if (p.blocking) {
    parts.torso.rotation.x = damp(parts.torso.rotation.x, 0.22, 12, dt);
    parts.leftArm.rotation.x = damp(parts.leftArm.rotation.x, -1.25, 16, dt);
    parts.leftArm.rotation.z = damp(parts.leftArm.rotation.z, -0.45, 16, dt);
    parts.rightArm.rotation.x = damp(parts.rightArm.rotation.x, -0.7, 12, dt);
    parts.rightArm.rotation.z = damp(parts.rightArm.rotation.z, 0.3, 12, dt);
    if (parts.shield) {
      parts.shield.visible = true;
      const pulse = 1 + Math.sin(t * 8) * 0.04;
      parts.shield.scale.setScalar(pulse);
    }
    return;
  }

  if (p.casting) {
    const q = clamp(p.castProgress, 0, 1);
    const lift = Math.sin(q * Math.PI);
    parts.leftArm.rotation.x = damp(parts.leftArm.rotation.x, -2.2 * lift, 18, dt);
    parts.rightArm.rotation.x = damp(parts.rightArm.rotation.x, -2.2 * lift, 18, dt);
    parts.leftArm.rotation.z = damp(parts.leftArm.rotation.z, -0.6 * lift, 18, dt);
    parts.rightArm.rotation.z = damp(parts.rightArm.rotation.z, 0.6 * lift, 18, dt);
    parts.torso.rotation.x = damp(parts.torso.rotation.x, -0.1 * lift, 10, dt);
    parts.head.rotation.x = damp(parts.head.rotation.x, -0.2 * lift, 10, dt);
    if (parts.weapon) parts.weapon.visible = false;
    return;
  }

  if (p.attacking) {
    const q = clamp(p.attackProgress, 0, 1);
    const windup = Math.min(1, q / 0.34);
    const strike = q < 0.34 ? 0 : Math.min(1, (q - 0.34) / 0.28);
    const recover = q < 0.62 ? 0 : (q - 0.62) / 0.38;
    const combo = p.combo % 3;
    const dir = combo === 1 ? -1 : 1;
    let armX = -0.5 - windup * 1.5 + strike * 2.5 - recover * 0.8;
    let armZ = dir * (-0.35 - windup * 0.85 + strike * 2.15 - recover * 0.7);
    let bodyYaw = dir * (-0.45 * windup + strike * 1.25 - recover * 0.8);
    if (p.attackType === 'heavy') {
      armX = -1.9 + windup * 0.2 + strike * 2.6 - recover * 0.7;
      armZ = -0.9 * windup + strike * 1.9 - recover * 0.9;
      bodyYaw = -0.55 * windup + strike * 1.15 - recover * 0.6;
    }
    parts.rightArm.rotation.x = damp(parts.rightArm.rotation.x, armX, 26, dt);
    parts.rightArm.rotation.z = damp(parts.rightArm.rotation.z, armZ, 26, dt);
    parts.leftArm.rotation.x = damp(parts.leftArm.rotation.x, -0.35 - strike * 0.4, 14, dt);
    parts.leftArm.rotation.z = damp(parts.leftArm.rotation.z, 0.18, 12, dt);
    parts.torso.rotation.y = damp(parts.torso.rotation.y, bodyYaw, 24, dt);
    parts.torso.rotation.x = damp(parts.torso.rotation.x, 0.08 + strike * 0.12, 18, dt);
    parts.head.rotation.y = damp(parts.head.rotation.y, bodyYaw * 0.5, 18, dt);
    parts.cape.rotation.x = damp(parts.cape.rotation.x, 0.18 + strike * 0.55, 10, dt);
    return;
  }

  parts.torso.rotation.y = damp(parts.torso.rotation.y, 0, 10, dt);
  parts.head.rotation.y = damp(parts.head.rotation.y, 0, 10, dt);
}

export function rebuildPlayerModel(oldModel, appearance, weaponId, armorId, headgear) {
  const next = buildPlayer(appearance, weaponId, armorId, headgear);
  next.group.position.copy(oldModel.group.position);
  next.group.rotation.copy(oldModel.group.rotation);
  next.pose = oldModel.pose;
  return next;
}

/* ------------------------------------------------------------------ */
/* Enemies                                                             */
/* ------------------------------------------------------------------ */

function addEyes(group, count, spread, y, z, color, size = 0.05) {
  const m = new THREE.MeshBasicMaterial({ color });
  for (let i = 0; i < count; i++) {
    const e = sphere(size, m, 6);
    const off = count === 1 ? 0 : (i - (count - 1) / 2) * spread;
    e.position.set(off, y, z);
    group.add(e);
    addGlow(group, color, size * 6, [off, y, z + 0.02], 0.55);
  }
}

function makeHealthBar(height, width = 1.6) {
  const g = new THREE.Group();
  const back = new THREE.Mesh(
    new THREE.PlaneGeometry(width + 0.08, 0.15),
    new THREE.MeshBasicMaterial({ color: '#070a15', transparent: true, opacity: 0.82, depthWrite: false }),
  );
  const fill = new THREE.Mesh(
    new THREE.PlaneGeometry(width, 0.08),
    new THREE.MeshBasicMaterial({ color: '#ff7a6b', depthWrite: false }),
  );
  fill.position.z = 0.01;
  const edge = new THREE.Mesh(
    new THREE.PlaneGeometry(width + 0.08, 0.15),
    new THREE.MeshBasicMaterial({ color: '#f4d58d', transparent: true, opacity: 0.4, wireframe: true, depthWrite: false }),
  );
  edge.position.z = 0.02;
  g.add(back, fill, edge);
  g.position.y = height + 0.42;
  g.userData.fill = fill;
  g.userData.width = width;
  return g;
}

export function buildEnemy(def, level = 1) {
  const root = new THREE.Group();
  const body = new THREE.Group();
  root.add(body);
  const parts = {};
  const color = {
    wisp: '#6f4bce',
    wolf: '#3b343f',
    golem: '#637a52',
    knight: '#2d2b36',
    sentinel: '#c9b7ff',
    beast: '#3a2025',
    stag: '#d9e7df',
    queen: '#9b3030',
    vex: '#d6c4ff',
  }[def.model] || '#666';
  const accent = {
    wisp: '#b98cff',
    wolf: '#ff6b9d',
    golem: '#b8f59e',
    knight: '#ff7a4a',
    sentinel: '#9ef0ff',
    beast: '#ff5b2e',
    stag: '#9ef0ff',
    queen: '#ffb347',
    vex: '#ffd166',
  }[def.model] || '#f4d58d';
  const darkMat = mat(color);
  const accentMat = mat(accent, { emissive: new THREE.Color(accent).multiplyScalar(0.18) });
  const glowMat = new THREE.MeshBasicMaterial({ color: accent });
  parts.body = body;

  if (def.model === 'wisp') {
    const core = new THREE.Mesh(new THREE.IcosahedronGeometry(0.48, 1), glowMat);
    core.position.y = 1.55;
    body.add(core);
    const shell = new THREE.Mesh(
      new THREE.IcosahedronGeometry(0.7, 1),
      new THREE.MeshBasicMaterial({ color: accent, transparent: true, opacity: 0.18, wireframe: true }),
    );
    shell.position.y = 1.55;
    body.add(shell);
    parts.core = core;
    parts.shell = shell;
    for (let i = 0; i < 3; i++) {
      const shard = new THREE.Mesh(new THREE.TetrahedronGeometry(0.14, 0), glowMat);
      shard.userData.angle = (i / 3) * TAU;
      shard.position.y = 1.55;
      body.add(shard);
      (parts.shards ||= []).push(shard);
    }
    addGlow(body, accent, 3.2, [0, 1.55, 0], 0.55);
    addEyes(body, 2, 0.12, 1.58, 0.38, '#fff2b0', 0.045);
  } else if (def.model === 'wolf') {
    const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.42, 0.85, 4, 8), darkMat);
    torso.rotation.z = Math.PI / 2;
    torso.position.y = 1.05;
    body.add(torso);
    const head = new THREE.Group();
    head.position.set(0, 1.35, 0.72);
    body.add(head);
    const skull = new THREE.Mesh(new THREE.ConeGeometry(0.3, 0.55, 6), darkMat);
    skull.rotation.x = Math.PI / 2;
    skull.position.z = 0.18;
    head.add(skull);
    const jaw = box(0.24, 0.13, 0.38, darkMat);
    jaw.position.set(0, -0.1, 0.34);
    head.add(jaw);
    for (const s of [-1, 1]) {
      const ear = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.32, 4), darkMat);
      ear.position.set(s * 0.18, 0.28, 0.05);
      ear.rotation.z = s * -0.25;
      head.add(ear);
    }
    addEyes(head, 2, 0.14, 0.06, 0.46, accent, 0.04);
    parts.head = head;
    for (const s of [-1, 1]) {
      for (const z of [-0.32, 0.34]) {
        const leg = new THREE.Group();
        leg.position.set(s * 0.28, 0.78, z);
        body.add(leg);
        const limb = new THREE.Mesh(new THREE.CapsuleGeometry(0.09, 0.52, 3, 5), darkMat);
        limb.position.y = -0.28;
        leg.add(limb);
        (parts.legs ||= []).push(leg);
      }
    }
    const tail = new THREE.Mesh(new THREE.CapsuleGeometry(0.08, 0.62, 3, 5), darkMat);
    tail.position.set(0, 1.12, -0.72);
    tail.rotation.x = -0.8;
    body.add(tail);
    parts.tail = tail;
    addGlow(body, accent, 1.6, [0, 1.05, 0], 0.2);
  } else if (def.model === 'golem') {
    const torso = box(1.1, 1.25, 0.8, darkMat);
    torso.position.y = 1.65;
    body.add(torso);
    const head = box(0.52, 0.46, 0.5, darkMat);
    head.position.set(0, 2.55, 0.08);
    body.add(head);
    addEyes(head, 2, 0.18, 0.02, 0.27, accent, 0.055);
    for (const s of [-1, 1]) {
      const arm = new THREE.Group();
      arm.position.set(s * 0.72, 2.05, 0);
      body.add(arm);
      const limb = box(0.34, 1.15, 0.34, darkMat);
      limb.position.y = -0.5;
      arm.add(limb);
      const fist = box(0.44, 0.44, 0.44, darkMat);
      fist.position.y = -1.1;
      arm.add(fist);
      (parts.arms ||= []).push(arm);
      const leg = box(0.42, 0.9, 0.48, darkMat);
      leg.position.set(s * 0.3, 0.5, 0);
      body.add(leg);
    }
    for (let i = 0; i < 6; i++) {
      const moss = sphere(0.18 + Math.random() * 0.1, accentMat, 5);
      moss.position.set((Math.random() - 0.5) * 0.9, 1.3 + Math.random() * 1.2, (Math.random() - 0.5) * 0.5);
      body.add(moss);
    }
    addGlow(body, accent, 1.8, [0, 2.1, 0], 0.15);
  } else if (def.model === 'knight') {
    const armor = humanoidBody({
      skin: '#6f5a4a', outfit: color, accent, hair: '#1d1b22', hairStyle: 'rapado', headgear: 'celada', armorTier: 2, scale: 1.12,
    });
    armor.group.position.y = 0;
    body.add(armor.group);
    const spear = buildSword('mandoble_alba', 1.2);
    spear.position.set(0, -0.6, 0);
    spear.rotation.z = Math.PI;
    armor.parts.rightArm.add(spear);
    parts.humanoid = armor;
    addGlow(body, accent, 1.5, [0, 2.0, 0], 0.2);
  } else if (def.model === 'sentinel') {
    const robe = new THREE.Mesh(new THREE.ConeGeometry(0.8, 2.1, 8, 1, true), darkMat);
    robe.position.y = 1.05;
    body.add(robe);
    const mask = new THREE.Mesh(new THREE.OctahedronGeometry(0.38, 0), accentMat);
    mask.scale.set(0.7, 1, 0.3);
    mask.position.y = 2.35;
    body.add(mask);
    const halo = new THREE.Mesh(
      new THREE.TorusGeometry(0.58, 0.035, 4, 32),
      new THREE.MeshBasicMaterial({ color: accent, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending }),
    );
    halo.position.y = 2.35;
    halo.rotation.x = Math.PI / 2;
    body.add(halo);
    parts.halo = halo;
    parts.mask = mask;
    for (let i = 0; i < 4; i++) {
      const shard = new THREE.Mesh(new THREE.TetrahedronGeometry(0.12, 0), glowMat);
      shard.userData.angle = (i / 4) * TAU;
      shard.position.y = 1.5;
      body.add(shard);
      (parts.shards ||= []).push(shard);
    }
    addGlow(body, accent, 2.5, [0, 2.2, 0], 0.4);
  } else if (def.model === 'beast') {
    const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.72, 1.4, 4, 8), darkMat);
    torso.rotation.z = Math.PI / 2;
    torso.position.y = 1.35;
    body.add(torso);
    const head = new THREE.Group();
    head.position.set(0, 1.75, 1.05);
    body.add(head);
    const skull = new THREE.Mesh(new THREE.DodecahedronGeometry(0.5, 0), darkMat);
    head.add(skull);
    const jaw = box(0.42, 0.28, 0.65, darkMat);
    jaw.position.set(0, -0.24, 0.4);
    head.add(jaw);
    for (const s of [-1, 1]) {
      const horn = new THREE.Mesh(new THREE.ConeGeometry(0.13, 0.85, 5), accentMat);
      horn.position.set(s * 0.36, 0.5, 0.05);
      horn.rotation.z = s * -0.4;
      head.add(horn);
    }
    addEyes(head, 2, 0.2, 0.12, 0.48, '#fff2b0', 0.065);
    parts.head = head;
    for (const s of [-1, 1]) {
      for (const z of [-0.55, 0.55]) {
        const leg = new THREE.Group();
        leg.position.set(s * 0.5, 0.9, z);
        body.add(leg);
        const limb = new THREE.Mesh(new THREE.CapsuleGeometry(0.14, 0.72, 3, 5), darkMat);
        limb.position.y = -0.4;
        leg.add(limb);
        (parts.legs ||= []).push(leg);
      }
    }
    const tail = new THREE.Mesh(new THREE.ConeGeometry(0.18, 1.2, 5), darkMat);
    tail.position.set(0, 1.4, -1.15);
    tail.rotation.x = -1.25;
    body.add(tail);
    addGlow(body, accent, 2.2, [0, 1.4, 0], 0.3);
  } else if (def.model === 'stag') {
    const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.72, 1.7, 4, 8), darkMat);
    torso.rotation.z = Math.PI / 2;
    torso.position.y = 2.0;
    body.add(torso);
    const neck = new THREE.Mesh(new THREE.CapsuleGeometry(0.32, 0.9, 3, 7), darkMat);
    neck.position.set(0, 2.6, 0.75);
    neck.rotation.x = 0.4;
    body.add(neck);
    const head = new THREE.Group();
    head.position.set(0, 3.25, 1.05);
    body.add(head);
    const skull = new THREE.Mesh(new THREE.ConeGeometry(0.3, 0.9, 6), darkMat);
    skull.rotation.x = Math.PI / 2;
    head.add(skull);
    addEyes(head, 2, 0.16, 0.1, 0.38, '#9ef0ff', 0.055);
    for (const s of [-1, 1]) {
      const antler = new THREE.Group();
      antler.position.set(s * 0.2, 0.22, 0);
      head.add(antler);
      for (let i = 0; i < 3; i++) {
        const branch = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.06, 0.8 - i * 0.12, 5), accentMat);
        branch.position.set(s * (0.15 + i * 0.15), 0.4 + i * 0.12, 0);
        branch.rotation.z = s * (-0.35 - i * 0.2);
        antler.add(branch);
      }
      addGlow(antler, accent, 0.8, [s * 0.3, 0.6, 0], 0.6);
    }
    parts.head = head;
    for (const s of [-1, 1]) {
      for (const z of [-0.62, 0.66]) {
        const leg = new THREE.Group();
        leg.position.set(s * 0.5, 1.3, z);
        body.add(leg);
        const limb = new THREE.Mesh(new THREE.CapsuleGeometry(0.14, 0.95, 3, 5), darkMat);
        limb.position.y = -0.52;
        leg.add(limb);
        (parts.legs ||= []).push(leg);
      }
    }
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(1.7, 0.035, 4, 48),
      new THREE.MeshBasicMaterial({ color: accent, transparent: true, opacity: 0.45, blending: THREE.AdditiveBlending }),
    );
    ring.position.y = 1.7;
    ring.rotation.x = Math.PI / 2;
    body.add(ring);
    parts.ring = ring;
    addGlow(body, accent, 4.5, [0, 2.2, 0], 0.35);
  } else if (def.model === 'queen') {
    const armor = humanoidBody({
      skin: '#c7a38d', outfit: '#3b171d', accent: '#ffb347', hair: '#2a151a', hairStyle: 'largo', headgear: 'diadema', armorTier: 3, scale: 1.42,
    });
    body.add(armor.group);
    armor.group.rotation.y = Math.PI;
    parts.humanoid = armor;
    const sword = buildSword('mandoble_alba', 1.55);
    sword.position.set(0, -0.7, 0);
    sword.rotation.z = Math.PI;
    armor.parts.rightArm.add(sword);
    const crown = new THREE.Group();
    crown.position.set(0, 2.25, 0);
    body.add(crown);
    for (let i = 0; i < 5; i++) {
      const spike = new THREE.Mesh(new THREE.ConeGeometry(0.045, 0.25 + (i === 2 ? 0.18 : 0), 4), new THREE.MeshBasicMaterial({ color: '#ffb347' }));
      spike.position.set((i - 2) * 0.13, 0.12, 0);
      crown.add(spike);
    }
    for (let i = 0; i < 10; i++) {
      const ember = glowSprite('#ff8a4a', 0.3 + Math.random() * 0.5, 0.6);
      ember.position.set((Math.random() - 0.5) * 2.2, 0.5 + Math.random() * 2.8, (Math.random() - 0.5) * 1.8);
      ember.userData.phase = Math.random() * TAU;
      body.add(ember);
      (parts.embers ||= []).push(ember);
    }
    addGlow(body, '#ff5b2e', 5.5, [0, 1.6, 0], 0.25);
  } else if (def.model === 'vex') {
    const armor = humanoidBody({
      skin: '#d8d2e8', outfit: '#282143', accent: '#ffd166', hair: '#e9e5f7', hairStyle: 'largo', headgear: 'ninguno', armorTier: 4, scale: 1.58,
    });
    body.add(armor.group);
    parts.humanoid = armor;
    const sword = buildSword('espada_celestial', 1.75);
    sword.position.set(0, -0.8, 0);
    sword.rotation.z = Math.PI;
    armor.parts.rightArm.add(sword);
    const halo = new THREE.Mesh(
      new THREE.TorusGeometry(1.1, 0.025, 4, 48),
      new THREE.MeshBasicMaterial({ color: '#ffd166', transparent: true, opacity: 0.65, blending: THREE.AdditiveBlending }),
    );
    halo.position.y = 2.8;
    halo.rotation.x = Math.PI / 2;
    body.add(halo);
    parts.halo = halo;
    for (let i = 0; i < 6; i++) {
      const shard = new THREE.Mesh(new THREE.OctahedronGeometry(0.12, 0), new THREE.MeshBasicMaterial({ color: '#ffd166' }));
      shard.userData.angle = (i / 6) * TAU;
      shard.position.y = 1.2;
      body.add(shard);
      (parts.shards ||= []).push(shard);
    }
    addGlow(body, '#ffd166', 6.5, [0, 2, 0], 0.3);
  }

  const hpBar = makeHealthBar(def.height || 2, def.boss ? 2.6 : 1.5);
  hpBar.visible = false;
  root.add(hpBar);
  root.userData.kind = 'enemy';
  root.userData.model = { group: root, body, parts, hpBar, def, level, color, accent };
  return root.userData.model;
}

export function updateEnemyModel(model, dt, time, state) {
  const { body, parts, def, level } = model;
  const t = time;
  const speed = state.moveAmount || 0;
  const cycle = t * (state.boss ? 6.5 : 8.5);
  const swing = Math.sin(cycle) * 0.45 * speed;

  if (parts.legs) {
    parts.legs.forEach((leg, i) => {
      leg.rotation.x = Math.sin(cycle + (i % 2 ? Math.PI : 0)) * 0.6 * speed;
    });
  }
  if (parts.tail) {
    parts.tail.rotation.z = Math.sin(t * 3.2) * 0.18;
  }
  if (parts.humanoid) {
    const h = parts.humanoid;
    h.pose.moving = speed;
    h.pose.attacking = state.attacking;
    h.pose.attackProgress = state.attackProgress || 0;
    h.pose.attackType = 'light';
    h.pose.combo = state.combo || 0;
    h.pose.blocking = state.blocking || false;
    h.pose.hurt = state.hurt || 0;
    h.pose.dead = state.dead || false;
    h.pose.deadProgress = state.deadProgress || 0;
    h.pose.casting = state.casting || false;
    h.pose.castProgress = state.castProgress || 0;
    updatePlayerModel(h, dt, time);
  }
  if (parts.head) {
    parts.head.rotation.x = Math.sin(t * 1.4) * 0.04;
    if (state.attacking) parts.head.rotation.x = -0.15;
  }
  if (parts.core) {
    parts.core.rotation.y += dt * 1.4;
    parts.core.rotation.x += dt * 0.7;
    const pulse = 1 + Math.sin(t * 4) * 0.06;
    parts.core.scale.setScalar(pulse);
    body.position.y = Math.sin(t * 2.2) * 0.12;
  }
  if (parts.shell) {
    parts.shell.rotation.y -= dt * 0.6;
    parts.shell.rotation.z += dt * 0.25;
  }
  if (parts.shards) {
    parts.shards.forEach((s, i) => {
      const a = (s.userData.angle || 0) + t * (0.6 + i * 0.1);
      s.position.x = Math.cos(a) * 1.05;
      s.position.z = Math.sin(a) * 1.05;
      s.position.y = 1.35 + Math.sin(a * 1.7) * 0.35;
      s.rotation.x += dt * 2;
      s.rotation.y += dt * 1.5;
    });
  }
  if (parts.halo) {
    parts.halo.rotation.z += dt * 0.35;
  }
  if (parts.ring) {
    parts.ring.rotation.z += dt * 0.2;
    parts.ring.scale.setScalar(1 + Math.sin(t * 2) * 0.03);
  }
  if (parts.embers) {
    parts.embers.forEach((e) => {
      e.position.y += dt * 0.45;
      if (e.position.y > 3.4) e.position.y = 0.3;
      e.material.opacity = 0.35 + Math.sin(t * 3 + e.userData.phase) * 0.25;
    });
  }
  if (state.windup > 0) {
    const s = 1 + state.windup * 0.06;
    body.scale.setScalar(s);
    body.position.y = 0;
  } else {
    body.scale.setScalar(1);
    body.position.y = 0;
  }
  if (state.stagger > 0) {
    body.rotation.z = Math.sin(t * 30) * 0.1 * state.stagger;
  } else {
    body.rotation.z = damp(body.rotation.z, 0, 10, dt);
  }
  if (state.dead) {
    body.rotation.x = damp(body.rotation.x, -1.35, 5, dt);
    body.position.y = damp(body.position.y, -0.3, 3, dt);
  } else {
    body.rotation.x = damp(body.rotation.x, 0, 8, dt);
  }
  model.hpBar.visible = state.showHp && !state.dead;
  if (state.showHp) {
    const ratio = clamp(state.hp / state.maxHp, 0, 1);
    model.hpBar.userData.fill.scale.x = ratio;
    model.hpBar.userData.fill.position.x = -(1 - ratio) * model.hpBar.userData.width / 2;
    model.hpBar.userData.fill.material.color.set(ratio > 0.5 ? '#7ee8fa' : ratio > 0.25 ? '#ffd166' : '#ff7a6b');
  }
}

/* ------------------------------------------------------------------ */
/* Creatures                                                           */
/* ------------------------------------------------------------------ */

export function buildCreature(species) {
  const root = new THREE.Group();
  const body = new THREE.Group();
  root.add(body);
  const parts = {};
  const bodyMat = mat(species.colors.body, { emissive: new THREE.Color(species.colors.body).multiplyScalar(0.08) });
  const accentMat = mat(species.colors.accent, { emissive: new THREE.Color(species.colors.accent).multiplyScalar(0.35) });
  const eyeMat = new THREE.MeshBasicMaterial({ color: species.colors.eye });
  const scale = 0.72;

  if (species.model === 'fox') {
    const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.24, 0.55, 4, 7), bodyMat);
    torso.rotation.z = Math.PI / 2;
    torso.position.y = 0.62;
    body.add(torso);
    const head = sphere(0.24, bodyMat, 8);
    head.position.set(0, 0.82, 0.4);
    body.add(head);
    for (const s of [-1, 1]) {
      const ear = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.26, 4), accentMat);
      ear.position.set(s * 0.13, 1.0, 0.38);
      ear.rotation.z = s * -0.2;
      body.add(ear);
    }
    const tail = new THREE.Mesh(new THREE.CapsuleGeometry(0.12, 0.55, 4, 6), accentMat);
    tail.position.set(0, 0.75, -0.48);
    tail.rotation.x = -0.9;
    body.add(tail);
    parts.tail = tail;
    for (const s of [-1, 1]) {
      for (const z of [-0.2, 0.22]) {
        const leg = new THREE.Mesh(new THREE.CapsuleGeometry(0.05, 0.28, 3, 5), bodyMat);
        leg.position.set(s * 0.17, 0.3, z);
        body.add(leg);
      }
    }
    addEyes(body, 2, 0.11, 0.85, 0.6, species.colors.eye, 0.035);
    addGlow(body, species.colors.accent, 1.4, [0, 0.7, 0], 0.3);
  } else if (species.model === 'mossling') {
    const torso = new THREE.Mesh(new THREE.DodecahedronGeometry(0.48, 0), bodyMat);
    torso.position.y = 0.62;
    body.add(torso);
    const head = new THREE.Mesh(new THREE.DodecahedronGeometry(0.28, 0), bodyMat);
    head.position.set(0, 1.02, 0.08);
    body.add(head);
    for (let i = 0; i < 5; i++) {
      const moss = sphere(0.11 + Math.random() * 0.07, accentMat, 5);
      moss.position.set((Math.random() - 0.5) * 0.7, 0.55 + Math.random() * 0.65, (Math.random() - 0.5) * 0.5);
      body.add(moss);
    }
    addEyes(head, 2, 0.12, 0.02, 0.24, species.colors.eye, 0.045);
    for (const s of [-1, 1]) {
      const foot = sphere(0.1, bodyMat, 5);
      foot.position.set(s * 0.24, 0.18, 0.05);
      body.add(foot);
    }
    addGlow(body, species.colors.accent, 1.5, [0, 0.6, 0], 0.25);
  } else if (species.model === 'bird') {
    const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.2, 0.42, 4, 7), bodyMat);
    torso.rotation.x = Math.PI / 2;
    torso.position.y = 0.72;
    body.add(torso);
    const head = sphere(0.18, bodyMat, 7);
    head.position.set(0, 0.95, 0.35);
    body.add(head);
    const beak = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.2, 4), accentMat);
    beak.position.set(0, 0.93, 0.53);
    beak.rotation.x = Math.PI / 2;
    body.add(beak);
    for (const s of [-1, 1]) {
      const wing = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.62, 3), accentMat);
      wing.position.set(s * 0.26, 0.82, -0.05);
      wing.rotation.z = s * 1.1;
      body.add(wing);
      (parts.wings ||= []).push(wing);
    }
    const tail = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.6, 3), accentMat);
    tail.position.set(0, 0.7, -0.5);
    tail.rotation.x = -1.2;
    body.add(tail);
    parts.tail = tail;
    addEyes(head, 2, 0.1, 0.04, 0.17, species.colors.eye, 0.03);
    addGlow(body, species.colors.accent, 1.4, [0, 0.8, 0], 0.3);
  } else if (species.model === 'salamander') {
    const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.19, 0.55, 4, 7), bodyMat);
    torso.rotation.x = Math.PI / 2;
    torso.position.y = 0.38;
    body.add(torso);
    const head = sphere(0.22, bodyMat, 7);
    head.position.set(0, 0.46, 0.42);
    body.add(head);
    const tail = new THREE.Mesh(new THREE.CapsuleGeometry(0.1, 0.6, 4, 6), accentMat);
    tail.position.set(0, 0.35, -0.5);
    tail.rotation.x = -1.1;
    body.add(tail);
    parts.tail = tail;
    for (const s of [-1, 1]) {
      for (const z of [-0.2, 0.24]) {
        const leg = new THREE.Mesh(new THREE.CapsuleGeometry(0.045, 0.2, 3, 5), bodyMat);
        leg.position.set(s * 0.19, 0.2, z);
        body.add(leg);
      }
    }
    addEyes(head, 2, 0.1, 0.06, 0.2, species.colors.eye, 0.032);
    for (let i = 0; i < 3; i++) {
      const flame = glowSprite(species.colors.accent, 0.4 + Math.random() * 0.25, 0.7);
      flame.position.set((Math.random() - 0.5) * 0.3, 0.5 + Math.random() * 0.4, -0.35 - i * 0.12);
      body.add(flame);
      (parts.flames ||= []).push(flame);
    }
    addGlow(body, species.colors.accent, 1.4, [0, 0.5, 0], 0.35);
  } else if (species.model === 'beetle') {
    const shell = sphere(0.4, bodyMat, 8);
    shell.scale.set(1.2, 0.75, 1);
    shell.position.y = 0.55;
    body.add(shell);
    const head = sphere(0.18, bodyMat, 6);
    head.position.set(0, 0.5, 0.42);
    body.add(head);
    const horn = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.42, 4), accentMat);
    horn.position.set(0, 0.68, 0.58);
    horn.rotation.x = -0.5;
    body.add(horn);
    for (let i = 0; i < 3; i++) {
      const crack = box(0.02, 0.02, 0.3, accentMat);
      crack.position.set((i - 1) * 0.18, 0.8, 0);
      body.add(crack);
    }
    addEyes(head, 2, 0.1, 0.02, 0.15, species.colors.eye, 0.03);
    for (const s of [-1, 1]) {
      for (let i = 0; i < 3; i++) {
        const leg = new THREE.Mesh(new THREE.CapsuleGeometry(0.035, 0.24, 3, 4), bodyMat);
        leg.position.set(s * 0.42, 0.32, (i - 1) * 0.22);
        leg.rotation.z = s * 0.8;
        body.add(leg);
      }
    }
    addGlow(body, species.colors.accent, 1.6, [0, 0.6, 0], 0.3);
  } else if (species.model === 'wolf') {
    const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.27, 0.7, 4, 7), bodyMat);
    torso.rotation.z = Math.PI / 2;
    torso.position.y = 0.66;
    body.add(torso);
    const head = sphere(0.23, bodyMat, 7);
    head.position.set(0, 0.84, 0.48);
    body.add(head);
    for (const s of [-1, 1]) {
      const ear = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.2, 4), accentMat);
      ear.position.set(s * 0.13, 1.02, 0.43);
      body.add(ear);
    }
    addEyes(head, 2, 0.1, 0.03, 0.21, species.colors.eye, 0.03);
    const tail = new THREE.Mesh(new THREE.CapsuleGeometry(0.07, 0.5, 3, 5), accentMat);
    tail.position.set(0, 0.7, -0.6);
    tail.rotation.x = -0.7;
    body.add(tail);
    parts.tail = tail;
    addGlow(body, species.colors.accent, 1.6, [0, 0.7, 0], 0.3);
  } else if (species.model === 'butterfly') {
    const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.08, 0.35, 3, 6), bodyMat);
    torso.position.y = 0.9;
    body.add(torso);
    const head = sphere(0.11, bodyMat, 6);
    head.position.set(0, 1.13, 0.04);
    body.add(head);
    for (const s of [-1, 1]) {
      const wing = new THREE.Mesh(new THREE.CircleGeometry(0.42, 8), new THREE.MeshBasicMaterial({
        color: species.colors.accent, transparent: true, opacity: 0.55, side: THREE.DoubleSide, blending: THREE.AdditiveBlending,
      }));
      wing.position.set(s * 0.38, 1.0, 0);
      wing.rotation.y = s * 0.5;
      wing.scale.set(1, 0.75, 1);
      body.add(wing);
      (parts.wings ||= []).push(wing);
      const antenna = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.3, 4), accentMat);
      antenna.position.set(s * 0.07, 1.28, 0.08);
      antenna.rotation.z = s * 0.4;
      body.add(antenna);
    }
    addGlow(body, species.colors.accent, 2.2, [0, 1.0, 0], 0.45);
  } else if (species.model === 'turtle') {
    const shell = sphere(0.5, bodyMat, 8);
    shell.scale.set(1.1, 0.6, 1.25);
    shell.position.y = 0.55;
    body.add(shell);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.07, 4, 12), accentMat);
    rim.position.y = 0.45;
    rim.rotation.x = Math.PI / 2;
    rim.scale.set(1.1, 1.25, 1);
    body.add(rim);
    const head = sphere(0.2, bodyMat, 7);
    head.position.set(0, 0.52, 0.62);
    body.add(head);
    addEyes(head, 2, 0.1, 0.04, 0.18, species.colors.eye, 0.03);
    for (const s of [-1, 1]) {
      const leg = new THREE.Mesh(new THREE.CapsuleGeometry(0.07, 0.2, 3, 4), bodyMat);
      leg.position.set(s * 0.35, 0.2, 0.3);
      body.add(leg);
    }
    for (let i = 0; i < 5; i++) {
      const rune = new THREE.Mesh(new THREE.OctahedronGeometry(0.045, 0), new THREE.MeshBasicMaterial({ color: species.colors.accent }));
      rune.position.set((i - 2) * 0.18, 0.82, 0);
      body.add(rune);
    }
    addGlow(body, species.colors.accent, 1.6, [0, 0.6, 0], 0.3);
  } else if (species.model === 'seraph') {
    const armor = humanoidBody({
      skin: '#fff6dc', outfit: '#e7d9b0', accent: species.colors.accent, hair: '#fff2c4', hairStyle: 'largo', headgear: 'diadema', armorTier: 3, scale: 0.62,
    });
    body.add(armor.group);
    parts.humanoid = armor;
    for (const s of [-1, 1]) {
      for (let i = 0; i < 2; i++) {
        const wing = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.9, 3), new THREE.MeshBasicMaterial({
          color: species.colors.accent, transparent: true, opacity: 0.55, side: THREE.DoubleSide,
        }));
        wing.position.set(s * 0.4, 1.2 + i * 0.18, -0.25 - i * 0.08);
        wing.rotation.z = s * (0.9 + i * 0.3);
        wing.rotation.x = -0.3;
        body.add(wing);
        (parts.wings ||= []).push(wing);
      }
    }
    const halo = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.02, 4, 24), new THREE.MeshBasicMaterial({ color: species.colors.accent }));
    halo.position.y = 1.65;
    halo.rotation.x = Math.PI / 2;
    body.add(halo);
    parts.halo = halo;
    addGlow(body, species.colors.accent, 2.8, [0, 1.1, 0], 0.4);
  }

  body.scale.setScalar(scale);
  root.userData.kind = 'creature';
  root.userData.model = { group: root, body, parts, species };
  return root.userData.model;
}

export function updateCreatureModel(model, dt, time, state = {}) {
  const { body, parts } = model;
  const t = time;
  body.position.y = Math.sin(t * 2.4) * 0.04 + (state.hover ? 0.18 : 0);
  if (parts.tail) parts.tail.rotation.z = Math.sin(t * 4.2) * 0.25;
  if (parts.wings) {
    parts.wings.forEach((w, i) => {
      w.rotation.z += Math.sin(t * 7 + i) * dt * 2.5;
    });
  }
  if (parts.flames) {
    parts.flames.forEach((f) => {
      f.material.opacity = 0.45 + Math.sin(t * 5 + Math.random()) * 0.2;
    });
  }
  if (parts.halo) parts.halo.rotation.z += dt * 0.6;
  if (state.moving) {
    body.rotation.z = Math.sin(t * 8) * 0.04;
  }
  if (state.attack) {
    body.rotation.x = Math.sin(state.attack * Math.PI) * -0.25;
  } else {
    body.rotation.x = damp(body.rotation.x, 0, 8, dt);
  }
}

/* ------------------------------------------------------------------ */
/* NPCs                                                                */
/* ------------------------------------------------------------------ */

export function buildNPC(id) {
  const presets = {
    lyra: { skin: '#e8bd9d', outfit: '#40356b', accent: '#c6b7ff', hair: '#dbe7ee', hairStyle: 'largo', headgear: 'diadema', scale: 1 },
    nima: { skin: '#b97a54', outfit: '#2f6a57', accent: '#b8f59e', hair: '#5b3522', hairStyle: 'trenza', headgear: 'ninguno', scale: 0.98 },
    mira: { skin: '#d6a57f', outfit: '#6b3e4a', accent: '#f4d58d', hair: '#dbe7ee', hairStyle: 'largo', headgear: 'ninguno', scale: 0.94 },
    orin: { skin: '#8a5638', outfit: '#5d3e32', accent: '#ffb347', hair: '#241d2e', hairStyle: 'rapado', headgear: 'ninguno', scale: 1.06 },
    kael: { skin: '#c58a5e', outfit: '#4a2228', accent: '#ff8a4a', hair: '#241d2e', hairStyle: 'corto', headgear: 'ninguno', scale: 1.08 },
  };
  const p = presets[id] || presets.lyra;
  const model = humanoidBody({ ...p, armorTier: id === 'kael' ? 2 : 1 });
  model.group.userData.kind = 'npc';
  model.group.userData.npcId = id;
  if (id === 'lyra') {
    const staff = buildSword('hoja_brisa', 0.85);
    staff.position.set(0, -0.58, 0.02);
    staff.rotation.set(0.1, 0, 0.2);
    model.parts.rightArm.add(staff);
  }
  if (id === 'kael') {
    const sword = buildSword('filo_draconico', 1.05);
    sword.position.set(0, -0.58, 0.03);
    sword.rotation.set(0.1, 0, -0.14);
    model.parts.rightArm.add(sword);
  }
  if (id === 'mira') {
    const cane = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.04, 1.4, 5), standardMaterial('#7a5b3a'));
    cane.position.set(0.3, 0.7, 0.1);
    model.group.add(cane);
  }
  model.pose = { moving: 0, sprinting: false, attacking: false, attackProgress: 0, blocking: false, casting: false, castProgress: 0, dodging: false, dodgeProgress: 0, hurt: 0, dead: false, deadProgress: 0, time: Math.random() * 10 };
  return model;
}

export function updateNPCModel(model, dt, time) {
  const p = model.pose;
  p.time += dt;
  p.moving = 0;
  updatePlayerModel(model, dt, time);
}

export function createQuestMarker(color = '#f4d58d') {
  const group = new THREE.Group();
  const gem = new THREE.Mesh(new THREE.OctahedronGeometry(0.28, 0), new THREE.MeshBasicMaterial({ color }));
  group.add(gem);
  const glow = glowSprite(color, 2.4, 0.65);
  group.add(glow);
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(0.5, 0.02, 4, 32),
    new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending }),
  );
  ring.rotation.x = Math.PI / 2;
  group.add(ring);
  group.userData.gem = gem;
  group.userData.ring = ring;
  return group;
}
