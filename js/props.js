import {
  drawTree, drawPine, drawBush, drawRock, drawStump, drawBones, drawCrystal,
  drawColumn, drawRuinWall, drawGravestone, drawStatue, drawLantern, drawTent,
} from './props_nature.js';
import {
  drawHouse, drawForge, drawStall, drawFountain, drawShrine, drawPortal,
  drawChest, drawBoulder, drawBramble, drawIceGate, drawRune, drawGap,
  drawSecretWall, drawAltar, drawBarrier, drawSign, drawBench, drawBarrel,
  drawCrate, drawNest, drawClock,
} from './props_town.js';

const DRAW = {
  tree: drawTree, pine: drawPine, bush: drawBush, rock: drawRock, stump: drawStump,
  bones: drawBones, crystal: drawCrystal, column: drawColumn, ruin_wall: drawRuinWall,
  gravestone: drawGravestone, statue: drawStatue, lantern: drawLantern, tent: drawTent,
  house: drawHouse, forge: drawForge, stall: drawStall, fountain: drawFountain,
  shrine: drawShrine, portal: drawPortal, chest: drawChest, boulder: drawBoulder,
  bramble: drawBramble, ice_gate: drawIceGate, rune: drawRune, gap: drawGap,
  secret_wall: drawSecretWall, altar: drawAltar, barrier: drawBarrier, sign: drawSign,
  bench: drawBench, barrel: drawBarrel, crate: drawCrate, nest: drawNest, clock: drawClock,
};

export function drawObject(ctx, o, t, state) {
  const fn = DRAW[o.type];
  if (fn) fn(ctx, o, t, state);
}

export function drawFlatObject(ctx, o, t, state) {
  if (o.type === 'rune' || o.type === 'gap') {
    DRAW[o.type](ctx, o, t, state);
  }
}
