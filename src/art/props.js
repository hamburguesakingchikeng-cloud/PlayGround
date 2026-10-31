import { TILE } from '../world/regions.js';
import { hash2, rgba, shade } from '../core/utils.js';

const OUT = 'rgba(20,16,20,.85)';

function shadow(ctx, x, y, rx, ry, a = .32) {
  const g = ctx.createRadialGradient(x, y, 1, x, y, rx);
  g.addColorStop(0, `rgba(5,8,10,${a})`); g.addColorStop(1, 'rgba(5,8,10,0)');
  ctx.save(); ctx.translate(x, y); ctx.scale(1, ry / rx); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, rx, 0, 6.3); ctx.fill(); ctx.restore();
}

function glow(ctx, x, y, r, color, alpha = .25) {
  const g = ctx.createRadialGradient(x, y, 1, x, y, r);
  g.addColorStop(0, rgba(color, alpha)); g.addColorStop(.5, rgba(color, alpha * .4)); g.addColorStop(1, rgba(color, 0));
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, 6.3); ctx.fill();
}

function poly(ctx, pts, fill, stroke = null, lw = 1.5) {
  ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
  ctx.closePath();
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw; ctx.stroke(); }
}

function leafCluster(ctx, x, y, r, c1, c2, outline = true) {
  ctx.beginPath(); ctx.arc(x, y, r, 0, 6.3);
  const g = ctx.createRadialGradient(x - r * .35, y - r * .4, 1, x, y, r);
  g.addColorStop(0, c1); g.addColorStop(.75, c2); g.addColorStop(1, shade(c2, -.2));
  ctx.fillStyle = g; ctx.fill();
  if (outline) { ctx.strokeStyle = 'rgba(16,28,20,.45)'; ctx.lineWidth = 1.2; ctx.stroke(); }
}

function drawTree(ctx, p, x, y, s, time) {
  const sway = Math.sin(time * 1.1 + p.seed * 12) * 2.2 * s;
  shadow(ctx, x, y + 2, 26 * s, 8 * s, .3);
  const trunkTop = -50 * s;
  ctx.beginPath();
  ctx.moveTo(x - 6 * s, y);
  ctx.quadraticCurveTo(x - 4 * s, y - 26 * s, x - 2 * s + sway * .5, y + trunkTop);
  ctx.lineTo(x + 3 * s + sway * .5, y + trunkTop);
  ctx.quadraticCurveTo(x + 5 * s, y - 26 * s, x + 7 * s, y);
  ctx.closePath();
  const tg = ctx.createLinearGradient(x - 6 * s, y, x + 7 * s, y);
  tg.addColorStop(0, '#3c2c22'); tg.addColorStop(.45, '#6a4a32'); tg.addColorStop(1, '#33241d');
  ctx.fillStyle = tg; ctx.fill();
  ctx.strokeStyle = 'rgba(30,20,16,.35)'; ctx.lineWidth = 1; ctx.stroke();
  ctx.strokeStyle = 'rgba(255,220,170,.08)'; ctx.beginPath(); ctx.moveTo(x - 1 * s, y - 8 * s); ctx.quadraticCurveTo(x - 2 * s, y - 24 * s, x + sway * .4, y - 38 * s); ctx.stroke();
  // roots
  ctx.strokeStyle = '#3a2a20'; ctx.lineWidth = 2 * s;
  ctx.beginPath(); ctx.moveTo(x - 3 * s, y - 2); ctx.lineTo(x - 12 * s, y + 2); ctx.moveTo(x + 4 * s, y - 2); ctx.lineTo(x + 13 * s, y + 3); ctx.stroke();
  // canopy
  const cx = x + sway, cy = y + trunkTop - 4 * s;
  leafCluster(ctx, cx - 18 * s, cy + 8 * s, 20 * s, '#79a85e', '#3f6b42');
  leafCluster(ctx, cx + 18 * s, cy + 4 * s, 21 * s, '#82b064', '#456f44');
  leafCluster(ctx, cx - 3 * s, cy - 12 * s, 25 * s, '#93bf6c', '#4d7a48');
  leafCluster(ctx, cx + 10 * s, cy - 20 * s, 16 * s, '#a0c976', '#527e4a');
  leafCluster(ctx, cx - 22 * s, cy - 13 * s, 14 * s, '#8bb868', '#486f43');
  // highlights
  ctx.fillStyle = 'rgba(220,245,170,.16)';
  ctx.beginPath(); ctx.ellipse(cx - 8 * s, cy - 21 * s, 12 * s, 6 * s, -.5, 0, 6.3); ctx.fill();
  ctx.beginPath(); ctx.ellipse(cx + 21 * s, cy - 6 * s, 8 * s, 3.5 * s, .3, 0, 6.3); ctx.fill();
}

function drawPine(ctx, p, x, y, s, time) {
  const sway = Math.sin(time * 1.3 + p.seed * 9) * 1.2 * s;
  shadow(ctx, x, y + 2, 20 * s, 7 * s, .28);
  ctx.fillStyle = '#3a2a20';
  ctx.fillRect(x - 3 * s, y - 18 * s, 6 * s, 18 * s);
  for (let i = 0; i < 4; i++) {
    const yy = y - 16 * s - i * 16 * s;
    const w = (26 - i * 5) * s;
    const h = 25 * s;
    poly(ctx, [[x - w + sway * (i / 4), yy], [x, yy - h], [x + w + sway * (i / 4), yy], [x, yy + 8 * s]], i % 2 ? '#3f6b4b' : '#487654', 'rgba(20,40,30,.3)', 1);
  }
  ctx.fillStyle = 'rgba(190,230,180,.13)';
  ctx.beginPath(); ctx.ellipse(x - 5 * s, y - 52 * s, 7 * s, 12 * s, -.2, 0, 6.3); ctx.fill();
}

function drawBush(ctx, p, x, y, s) {
  shadow(ctx, x, y + 1, 14 * s, 4 * s, .24);
  leafCluster(ctx, x - 7 * s, y - 7 * s, 9 * s, '#7fa865', '#3f6a42');
  leafCluster(ctx, x + 6 * s, y - 8 * s, 10 * s, '#86b06a', '#456f45');
  leafCluster(ctx, x, y - 14 * s, 11 * s, '#95bf72', '#4a7548');
  ctx.fillStyle = 'rgba(255,220,240,.5)';
  if (p.seed > .5) { ctx.beginPath(); ctx.arc(x + 3 * s, y - 16 * s, 1.5, 0, 6.3); ctx.fill(); }
}

function drawRock(ctx, p, x, y, s, region) {
  shadow(ctx, x, y + 1, 15 * s, 5 * s, .3);
  poly(ctx, [[x - 12 * s, y], [x - 13 * s, y - 10 * s], [x - 6 * s, y - 17 * s], [x + 5 * s, y - 16 * s], [x + 12 * s, y - 7 * s], [x + 10 * s, y]], '#6e6a64', OUT, 1.1);
  poly(ctx, [[x - 12 * s, y - 10 * s], [x - 5 * s, y - 16 * s], [x + 1 * s, y - 10 * s], [x - 4 * s, y - 4 * s]], '#8a857c', null);
  ctx.fillStyle = 'rgba(255,255,255,.1)'; ctx.beginPath(); ctx.ellipse(x + 1 * s, y - 12 * s, 4 * s, 2 * s, .2, 0, 6.3); ctx.fill();
  if (region.id === 'kansordore') { ctx.strokeStyle = 'rgba(255,235,170,.45)'; ctx.lineWidth = .8; ctx.beginPath(); ctx.moveTo(x - 4 * s, y - 12 * s); ctx.lineTo(x + 1 * s, y - 7 * s); ctx.lineTo(x + 5 * s, y - 9 * s); ctx.stroke(); }
}

function drawFlower(ctx, p, x, y, s, time) {
  const sway = Math.sin(time * 1.7 + p.seed * 8) * 1.2;
  ctx.strokeStyle = 'rgba(40,70,40,.6)'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + sway, y - 5 * s, x + sway, y - 9 * s); ctx.stroke();
  const c = p.color || '#f2e6a0';
  for (let i = 0; i < 5; i++) {
    const a = i / 5 * 6.28 + p.seed;
    ctx.fillStyle = c;
    ctx.beginPath(); ctx.ellipse(x + sway + Math.cos(a) * 2.5, y - 9 * s + Math.sin(a) * 2.5, 1.7, 1.1, a, 0, 6.3); ctx.fill();
  }
  ctx.fillStyle = '#fff8d8'; ctx.beginPath(); ctx.arc(x + sway, y - 9 * s, 1.2, 0, 6.3); ctx.fill();
}

function drawColumn(ctx, p, x, y, s, time) {
  shadow(ctx, x, y + 1, 14 * s, 5 * s, .32);
  const h = 54 * s;
  ctx.fillStyle = '#a8a08e';
  ctx.fillRect(x - 11 * s, y - 5 * s, 22 * s, 6 * s);
  ctx.fillStyle = '#8c8474'; ctx.fillRect(x - 8 * s, y - 6 * s, 16 * s, 5 * s);
  const g = ctx.createLinearGradient(x - 8 * s, 0, x + 8 * s, 0);
  g.addColorStop(0, '#7e7768'); g.addColorStop(.4, '#b8b0a0'); g.addColorStop(.7, '#a49c8a'); g.addColorStop(1, '#756e62');
  ctx.fillStyle = g; ctx.fillRect(x - 7 * s, y - h, 14 * s, h - 4 * s);
  for (let i = -1; i <= 1; i++) { ctx.fillStyle = 'rgba(60,55,48,.22)'; ctx.fillRect(x + i * 4 * s, y - h + 4 * s, 1.2, h - 12 * s); }
  poly(ctx, [[x - 10 * s, y - h], [x + 9 * s, y - h - 4 * s], [x + 11 * s, y - h + 5 * s], [x - 11 * s, y - h + 5 * s]], '#b8b0a0', OUT, 1);
  ctx.fillStyle = 'rgba(120,160,110,.3)'; ctx.beginPath(); ctx.ellipse(x - 4 * s, y - 10 * s, 5 * s, 4 * s, 0, 0, 6.3); ctx.fill();
}

function drawDeadTree(ctx, p, x, y, s, time) {
  const sway = Math.sin(time * .9 + p.seed * 7) * 1.8;
  shadow(ctx, x, y + 1, 24 * s, 7 * s, .3);
  ctx.strokeStyle = '#2e2525'; ctx.lineCap = 'round';
  ctx.lineWidth = 7 * s; ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x - 5 * s, y - 30 * s, x + 2 * s + sway, y - 58 * s); ctx.stroke();
  ctx.lineWidth = 3.4 * s;
  const branches = [[-1, 30, -22, 52], [1, 38, 24, 54], [-.6, 45, -16, 68], [.6, 48, 15, 72]];
  for (const [dir, at, ex, ey] of branches) {
    ctx.beginPath(); ctx.moveTo(x + 1 * s, y - at * s); ctx.quadraticCurveTo(x + dir * 12 * s + sway, y - at * s - 8 * s, x + ex * s + sway, y - ey * s); ctx.stroke();
  }
  ctx.strokeStyle = '#5a4740'; ctx.lineWidth = 1.2 * s;
  ctx.beginPath(); ctx.moveTo(x - 2 * s, y); ctx.quadraticCurveTo(x - 4 * s, y - 32 * s, x + 1 * s + sway, y - 56 * s); ctx.stroke();
  if (p.seed > .55) { glow(ctx, x + 12 * s, y - 48 * s, 18 * s, '#ff8a48', .05); }
}

function drawBasalt(ctx, p, x, y, s) {
  shadow(ctx, x, y + 1, 16 * s, 5 * s, .34);
  poly(ctx, [[x - 14 * s, y], [x - 9 * s, y - 22 * s], [x - 2 * s, y - 27 * s], [x + 7 * s, y - 20 * s], [x + 13 * s, y]], '#3d3436', OUT, 1.2);
  poly(ctx, [[x - 9 * s, y - 22 * s], [x - 2 * s, y - 27 * s], [x + 3 * s, y - 16 * s], [x - 4 * s, y - 9 * s]], '#514447', null);
  ctx.strokeStyle = 'rgba(255,110,50,.5)'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(x - 8 * s, y - 4 * s); ctx.lineTo(x - 2 * s, y - 13 * s); ctx.lineTo(x + 4 * s, y - 10 * s); ctx.stroke();
}

function drawLavaRock(ctx, p, x, y, s, time) {
  drawBasalt(ctx, p, x, y, s);
  glow(ctx, x, y - 8 * s, 16 * s, '#ff7a30', .12 + Math.sin(time * 2 + p.seed * 8) * .04);
}

function drawCrystal(ctx, p, x, y, s, time, color = '#b8c8ff') {
  shadow(ctx, x, y + 1, 19 * s, 6 * s, .3);
  glow(ctx, x, y - 18 * s, 38 * s, color, .12);
  const shards = [[0, 46, 8], [-11, 30, 6], [10, 34, 7], [-3, 60, 4]];
  for (let i = 0; i < shards.length; i++) {
    const [ox, h, w] = shards[i];
    poly(ctx, [[x + ox * s, y], [x + (ox - w) * s, y - h * .55 * s], [x + (ox + w * .3) * s, y - h * s], [x + (ox + w) * s, y - h * .5 * s]], i % 2 ? 'rgba(150,170,255,.55)' : 'rgba(200,215,255,.6)', 'rgba(80,90,160,.6)', 1);
    poly(ctx, [[x + ox * s, y], [x + (ox - w) * s, y - h * .55 * s], [x + ox * s, y - h * .7 * s]], 'rgba(255,255,255,.24)', null);
  }
  const tw = Math.sin(time * 2.2 + p.seed * 9) > .7;
  if (tw) { ctx.fillStyle = 'rgba(255,255,255,.85)'; ctx.beginPath(); ctx.arc(x + 8 * s, y - 30 * s, 1.3, 0, 6.3); ctx.fill(); }
}

function drawSilverTree(ctx, p, x, y, s, time) {
  const sway = Math.sin(time * .9 + p.seed * 10) * 1.6;
  shadow(ctx, x, y + 1, 24 * s, 7 * s, .25);
  ctx.strokeStyle = '#d8d4c8'; ctx.lineWidth = 5 * s; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x - 2 * s, y - 30 * s, x + sway, y - 54 * s); ctx.stroke();
  ctx.lineWidth = 2.4 * s;
  for (const [dx, dy] of [[-18, -50], [17, -54], [-9, -63], [8, -66]]) {
    ctx.beginPath(); ctx.moveTo(x, y - 36 * s); ctx.quadraticCurveTo(x + dx * .5, y - 44 * s, x + dx * s + sway, y + dy * s); ctx.stroke();
  }
  for (let i = 0; i < 5; i++) {
    const a = p.seed * 6 + i * 1.7;
    const bx = x + Math.cos(a) * 18 * s + sway, by = y - 54 * s + Math.sin(a) * 12 * s;
    leafCluster(ctx, bx, by, (7 + (i % 3) * 3) * s, '#f0e8ff', '#b8a8d8', false);
  }
  ctx.fillStyle = 'rgba(255,230,200,.2)';
  ctx.beginPath(); ctx.arc(x + 4 * s, y - 58 * s, 2.2 * s, 0, 6.3); ctx.fill();
}

function drawBuilding(ctx, b, cam, time) {
  const x = b.x - cam.x, y = b.y - cam.y, w = b.w, h = b.h;
  const t = b.type;
  shadow(ctx, x + w / 2, y + h - 4, w * .62, 18, .42);
  const wall = b.palette || '#8a7058', roof = b.roof || '#5a4038';
  const dark = shade(wall, -.28), light = shade(wall, .18);
  const bodyTop = y + h * .36, bodyH = h * .6;
  if (t === 'camp') {
    // tent
    poly(ctx, [[x + w * .06, y + h * .92], [x + w * .5, y + h * .18], [x + w * .94, y + h * .92]], wall, OUT, 2);
    poly(ctx, [[x + w * .5, y + h * .18], [x + w * .94, y + h * .92], [x + w * .5, y + h * .92]], dark, null);
    poly(ctx, [[x + w * .38, y + h * .92], [x + w * .5, y + h * .5], [x + w * .62, y + h * .92]], '#2a2420', null);
    glow(ctx, x + w * .5, y + h * .98, w * .5, '#ff9a50', .08);
    return;
  }
  // walls
  ctx.fillStyle = wall; ctx.fillRect(x + w * .08, bodyTop, w * .84, bodyH);
  ctx.fillStyle = 'rgba(255,255,255,.06)'; ctx.fillRect(x + w * .08, bodyTop, w * .84, 3);
  ctx.fillStyle = dark; ctx.fillRect(x + w * .08, bodyTop + bodyH - 7, w * .84, 7);
  // timber frame
  if (t === 'house' || t === 'bakery' || t === 'ruin_house' || t === 'herb') {
    ctx.strokeStyle = 'rgba(45,30,22,.55)'; ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x + w * .08, bodyTop + 4); ctx.lineTo(x + w * .08, bodyTop + bodyH);
    ctx.moveTo(x + w * .92, bodyTop + 4); ctx.lineTo(x + w * .92, bodyTop + bodyH);
    ctx.moveTo(x + w * .08, bodyTop + bodyH * .5); ctx.lineTo(x + w * .92, bodyTop + bodyH * .5);
    ctx.moveTo(x + w * .08, bodyTop); ctx.lineTo(x + w * .3, bodyTop + bodyH * .5); ctx.lineTo(x + w * .5, bodyTop);
    ctx.stroke();
  }
  // roof
  if (t === 'fortress' || t === 'fortress_tower') {
    ctx.fillStyle = roof; ctx.fillRect(x + w * .04, y + h * .18, w * .92, h * .26);
    for (let i = 0; i < 5; i++) { ctx.fillStyle = i % 2 ? dark : roof; ctx.fillRect(x + w * .04 + i * w * .19, y + h * .1, w * .11, h * .1); }
    ctx.fillStyle = '#2a2428';
    for (let i = 0; i < 3; i++) ctx.fillRect(x + w * .18 + i * w * .24, y + h * .55, w * .09, h * .16);
  } else if (t === 'archive' || t === 'temple_tower' || t === 'summit') {
    // columned celestial structure
    ctx.fillStyle = shade(roof, -.1);
    poly(ctx, [[x - w * .04, y + h * .3], [x + w * .1, y + h * .06], [x + w * .9, y + h * .06], [x + w * 1.04, y + h * .3]], '#c8c2ae', OUT, 1.4);
    ctx.fillStyle = shade(roof, .12); ctx.fillRect(x + w * .06, y + h * .3, w * .88, h * .08);
    ctx.fillStyle = 'rgba(255,240,190,.3)'; ctx.fillRect(x + w * .12, y + h * .08, w * .76, 2);
    for (let i = 0; i < 4; i++) {
      const cx = x + w * (.14 + i * .24);
      ctx.fillStyle = '#e0dac4'; ctx.fillRect(cx, y + h * .4, w * .055, h * .48);
      ctx.fillStyle = 'rgba(80,78,70,.25)'; ctx.fillRect(cx + w * .035, y + h * .4, w * .02, h * .48);
      ctx.fillStyle = '#d0cab4'; ctx.fillRect(cx - w * .012, y + h * .86, w * .08, h * .06);
    }
    if (t === 'archive') {
      // dome
      ctx.fillStyle = '#b8b2a0';
      ctx.beginPath(); ctx.ellipse(x + w * .5, y + h * .2, w * .2, h * .16, 0, Math.PI, 0); ctx.fill();
      ctx.strokeStyle = 'rgba(255,245,210,.5)'; ctx.lineWidth = 1; ctx.stroke();
      glow(ctx, x + w * .5, y + h * .42, w * .45, '#ffe8a0', .07);
    }
  } else {
    // gable roof
    const rh = h * .44;
    poly(ctx, [[x - 6, y + h * .44], [x + w * .5, y + h * .05], [x + w + 6, y + h * .44], [x + w + 6, y + h * .54], [x - 6, y + h * .54]], roof, OUT, 1.4);
    poly(ctx, [[x + w * .5, y + h * .05], [x + w + 6, y + h * .44], [x + w * .5, y + h * .54]], 'rgba(0,0,0,.2)', null);
    // shingles
    ctx.strokeStyle = 'rgba(30,20,18,.18)'; ctx.lineWidth = 1;
    for (let i = 1; i < 4; i++) {
      const yy = y + h * .14 + i * h * .1;
      ctx.beginPath(); ctx.moveTo(x + w * .5 - w * .5 * (1 - i * .16), yy); ctx.lineTo(x + w * .5 + w * .5 * (1 - i * .16), yy); ctx.stroke();
    }
    // ridge highlight
    ctx.strokeStyle = 'rgba(255,230,190,.18)'; ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.moveTo(x + 2, y + h * .46); ctx.lineTo(x + w * .5, y + h * .08); ctx.stroke();
    if (t === 'smith' || t === 'forge' || t === 'volcano_forge' || t === 'bakery') {
      // chimney
      ctx.fillStyle = '#4a3a32'; ctx.fillRect(x + w * .72, y + h * .02, w * .09, h * .24);
      ctx.fillStyle = '#2e2422'; ctx.fillRect(x + w * .71, y + h * .02, w * .11, 4);
      for (let i = 0; i < 3; i++) {
        const ph = (time * .3 + i * .33 + b.x * .001) % 1;
        ctx.fillStyle = `rgba(180,180,190,${.09 * (1 - ph)})`;
        ctx.beginPath(); ctx.arc(x + w * .76 + Math.sin(ph * 6) * 5, y - ph * 40 + 4, 5 + ph * 9, 0, 6.3); ctx.fill();
      }
      glow(ctx, x + w * .5, y + h * .82, w * .55, '#ff9a4a', .12);
    }
  }
  // door + windows
  const doorW = w * .15, doorH = h * .27;
  ctx.fillStyle = '#2a1f1a'; ctx.fillRect(x + w * .5 - doorW / 2, y + h * .68, doorW, doorH);
  ctx.fillStyle = 'rgba(255,200,120,.55)'; ctx.fillRect(x + w * .5 - doorW * .35, y + h * .7, doorW * .7, doorH * .45);
  ctx.fillStyle = '#c8a060'; ctx.beginPath(); ctx.arc(x + w * .5 + doorW * .28, y + h * .8, 1.5, 0, 6.3); ctx.fill();
  if (t !== 'fortress' && t !== 'fortress_tower') {
    for (const wx of [.28, .72]) {
      const ww = w * .12, wh = h * .13;
      ctx.fillStyle = '#2a201c'; ctx.fillRect(x + w * wx - ww / 2, y + h * .58, ww, wh);
      ctx.fillStyle = 'rgba(255,205,130,.7)'; ctx.fillRect(x + w * wx - ww / 2 + 2, y + h * .58 + 2, ww - 4, wh - 4);
      ctx.fillStyle = 'rgba(60,40,30,.75)'; ctx.fillRect(x + w * wx - 1, y + h * .58, 2, wh); ctx.fillRect(x + w * wx - ww / 2, y + h * .58 + wh / 2, ww, 1.5);
    }
  }
  // signs
  const signData = { library: '📖', smith: '⚒', herb: '✿', bakery: '◔' };
  if (signData[t]) {
    ctx.fillStyle = '#3a2a20'; ctx.fillRect(x + w * .82, y + h * .56, 2, 16);
    ctx.fillStyle = '#c8a468'; ctx.fillRect(x + w * .82 - 8, y + h * .56, 18, 11);
    ctx.fillStyle = '#3a2a20'; ctx.font = '8px serif'; ctx.textAlign = 'center';
    ctx.fillText(signData[t], x + w * .82 + 1, y + h * .56 + 8);
  }
  // vines / rubble
  if (t === 'ruin_house') {
    ctx.fillStyle = 'rgba(40,36,32,.4)';
    ctx.beginPath(); ctx.moveTo(x + w * .65, y + h * .46); ctx.lineTo(x + w * .9, y + h * .52); ctx.lineTo(x + w * .82, y + h * .75); ctx.lineTo(x + w * .62, y + h * .6); ctx.fill();
    ctx.fillStyle = 'rgba(90,120,70,.35)';
    ctx.beginPath(); ctx.ellipse(x + w * .18, y + h * .6, w * .08, h * .1, .4, 0, 6.3); ctx.fill();
  }
  if (t === 'herb') {
    ctx.strokeStyle = '#6f9e62'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(x + w * .9, y + h * .55); ctx.quadraticCurveTo(x + w * .86, y + h * .75, x + w * .94, y + h * .85); ctx.stroke();
    for (let i = 0; i < 3; i++) { ctx.fillStyle = '#9ac47a'; ctx.beginPath(); ctx.arc(x + w * .9 + Math.sin(i * 2) * 5, y + h * (.6 + i * .07), 2.5, 0, 6.3); ctx.fill(); }
  }
  if (t === 'banner' || b.name === 'Taberna') {
    ctx.fillStyle = '#7a3a32'; ctx.fillRect(x + w * .05, y + h * .3, 2, 18);
    poly(ctx, [[x + w * .05 + 2, y + h * .31], [x + w * .05 + 14, y + h * .33], [x + w * .05 + 12, y + h * .4], [x + w * .05 + 2, y + h * .38]], '#9a4a3a', null);
  }
}

function drawProp(ctx, p, cam, time, region) {
  const x = p.x - cam.x, y = p.y - cam.y;
  if (x < -160 || y < -220 || x > cam.w + 160 || y > cam.h + 120) return;
  const s = p.scale || 1;
  switch (p.type) {
    case 'tree': drawTree(ctx, p, x, y, s, time); break;
    case 'pine': drawPine(ctx, p, x, y, s, time); break;
    case 'bush': drawBush(ctx, p, x, y, s); break;
    case 'rock': drawRock(ctx, p, x, y, s, region); break;
    case 'flower': drawFlower(ctx, p, x, y, s, time); break;
    case 'column': drawColumn(ctx, p, x, y, s, time); break;
    case 'dead_tree': drawDeadTree(ctx, p, x, y, s, time); break;
    case 'basalt': drawBasalt(ctx, p, x, y, s); break;
    case 'lava_rock': drawLavaRock(ctx, p, x, y, s, time); break;
    case 'crystal':
    case 'crystal_small': drawCrystal(ctx, p, x, y, s * (p.type === 'crystal_small' ? .65 : 1), time, region.id === 'kansordore' ? '#c8c0ff' : '#b8d8ff'); break;
    case 'silver_tree': drawSilverTree(ctx, p, x, y, s, time); break;
    case 'marble_rock': drawRock(ctx, p, x, y, s, region); break;
    case 'star_flower': drawFlower(ctx, p, x, y, s, time); break;
    case 'rubble': {
      shadow(ctx, x, y + 1, 15 * s, 4 * s, .25);
      ctx.fillStyle = '#4a4040'; ctx.beginPath(); ctx.ellipse(x, y - 2, 13 * s, 4 * s, .3, 0, 6.3); ctx.fill();
      for (let i = 0; i < 3; i++) { ctx.fillStyle = i % 2 ? '#5a5050' : '#3a3232'; ctx.fillRect(x - 8 * s + i * 6 * s, y - 6 * s - i * 2, 5 * s, 4 * s); }
      break;
    }
    case 'ember_vent': {
      ctx.fillStyle = '#2a1e1e'; ctx.beginPath(); ctx.ellipse(x, y, 10 * s, 4 * s, 0, 0, 6.3); ctx.fill();
      glow(ctx, x, y - 3, 22 * s, '#ff7a30', .16 + Math.sin(time * 3 + p.seed * 5) * .04);
      if (Math.sin(time * 2.2 + p.seed * 9) > .7) { ctx.fillStyle = 'rgba(255,200,120,.8)'; ctx.beginPath(); ctx.arc(x + 2 * s, y - 8 * s, 1.2, 0, 6.3); ctx.fill(); }
      break;
    }
    case 'bone': {
      ctx.strokeStyle = '#b8b0a0'; ctx.lineWidth = 2.2 * s; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(x - 8 * s, y); ctx.lineTo(x + 8 * s, y - 3 * s); ctx.stroke();
      ctx.fillStyle = '#cfc6b4'; ctx.beginPath(); ctx.arc(x - 9 * s, y, 2.5 * s, 0, 6.3); ctx.arc(x + 9 * s, y - 3 * s, 2.5 * s, 0, 6.3); ctx.fill();
      break;
    }
    case 'brazier': {
      shadow(ctx, x, y + 1, 12 * s, 3 * s, .3);
      ctx.fillStyle = '#2a2424'; ctx.fillRect(x - 2 * s, y - 16 * s, 4 * s, 16 * s);
      ctx.fillStyle = '#4a3e3a'; ctx.beginPath(); ctx.ellipse(x, y - 16 * s, 10 * s, 4 * s, 0, 0, 6.3); ctx.fill();
      const fl = Math.sin(time * 4 + p.seed * 9) * 2;
      glow(ctx, x, y - 24 * s, 46 * s, '#ff9a48', .22);
      poly(ctx, [[x - 6 * s, y - 17 * s], [x + fl, y - 36 * s], [x + 5 * s, y - 17 * s]], '#ffb04a', null);
      poly(ctx, [[x - 3 * s, y - 17 * s], [x + fl * .6, y - 29 * s], [x + 2 * s, y - 17 * s]], '#ffe6a0', null);
      break;
    }
    case 'chain': {
      ctx.strokeStyle = 'rgba(60,56,60,.8)'; ctx.lineWidth = 2;
      for (let i = 0; i < 8; i++) { ctx.beginPath(); ctx.ellipse(x + Math.sin(i) * 2, y - 110 * s + i * 13 * s, 3, 6, 0, 0, 6.3); ctx.stroke(); }
      break;
    }
    case 'skull_pile': {
      shadow(ctx, x, y + 1, 16 * s, 4 * s, .3);
      for (let i = 0; i < 4; i++) {
        ctx.fillStyle = i % 2 ? '#d8d0bc' : '#b8b09c';
        ctx.beginPath(); ctx.arc(x - 8 * s + i * 5 * s, y - 4 * s - (i % 2) * 4 * s, 4 * s, 0, 6.3); ctx.fill();
        ctx.fillStyle = '#2a2020'; ctx.beginPath(); ctx.arc(x - 9 * s + i * 5 * s, y - 5 * s - (i % 2) * 4 * s, 1.2, 0, 6.3); ctx.fill();
      }
      break;
    }
    case 'barrel': {
      shadow(ctx, x, y + 1, 10 * s, 3 * s, .25);
      ctx.fillStyle = '#6a4a32'; ctx.beginPath(); ctx.ellipse(x, y - 4 * s, 8 * s, 10 * s, 0, 0, 6.3); ctx.fill();
      ctx.strokeStyle = '#3a2a20'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.ellipse(x, y - 4 * s, 8 * s, 10 * s, 0, 0, 6.3); ctx.stroke();
      ctx.strokeStyle = 'rgba(200,160,100,.4)'; ctx.beginPath(); ctx.moveTo(x - 7 * s, y - 9 * s); ctx.lineTo(x + 7 * s, y - 9 * s); ctx.moveTo(x - 8 * s, y - 1 * s); ctx.lineTo(x + 8 * s, y - 1 * s); ctx.stroke();
      break;
    }
    case 'lamp': {
      shadow(ctx, x, y + 1, 8 * s, 3 * s, .25);
      ctx.fillStyle = '#3a3028'; ctx.fillRect(x - 2 * s, y - 46 * s, 4 * s, 46 * s);
      ctx.fillStyle = '#2a2420'; ctx.fillRect(x - 5 * s, y - 5 * s, 10 * s, 5 * s);
      glow(ctx, x, y - 52 * s, 42 * s, '#ffd888', .22);
      ctx.fillStyle = '#ffe0a0'; ctx.beginPath(); ctx.arc(x, y - 52 * s, 5 * s, 0, 6.3); ctx.fill();
      ctx.strokeStyle = '#5a4a38'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(x, y - 58 * s); ctx.lineTo(x, y - 46 * s); ctx.stroke();
      break;
    }
    case 'fence': {
      ctx.strokeStyle = '#5a4432'; ctx.lineWidth = 2.4 * s;
      ctx.beginPath(); ctx.moveTo(x - 20 * s, y - 4 * s); ctx.lineTo(x - 20 * s, y - 20 * s); ctx.moveTo(x + 20 * s, y - 4 * s); ctx.lineTo(x + 20 * s, y - 20 * s); ctx.stroke();
      ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x - 22 * s, y - 10 * s); ctx.lineTo(x + 22 * s, y - 10 * s); ctx.moveTo(x - 22 * s, y - 17 * s); ctx.lineTo(x + 22 * s, y - 17 * s); ctx.stroke();
      break;
    }
    case 'banner':
    case 'banner_dark': {
      const cloth = p.type === 'banner' ? '#a8443a' : '#3a3450';
      ctx.fillStyle = '#4a3a2a'; ctx.fillRect(x - 1, y - 80 * s, 2.5, 80 * s);
      const fl = Math.sin(time * 2 + p.seed * 4) * 3;
      poly(ctx, [[x + 1, y - 78 * s], [x + 26 * s + fl, y - 74 * s], [x + 24 * s + fl, y - 34 * s], [x + 12 * s + fl * .5, y - 38 * s], [x + 1, y - 34 * s]], cloth, 'rgba(20,16,20,.4)', 1);
      ctx.fillStyle = 'rgba(255,220,140,.5)'; ctx.beginPath(); ctx.arc(x + 13 * s + fl * .5, y - 56 * s, 4 * s, 0, 6.3); ctx.fill();
      break;
    }
    case 'standing_stone': {
      shadow(ctx, x, y + 1, 16 * s, 5 * s, .32);
      poly(ctx, [[x - 9 * s, y], [x - 11 * s, y - 38 * s], [x - 4 * s, y - 50 * s], [x + 6 * s, y - 46 * s], [x + 10 * s, y]], '#6e7a72', 'rgba(20,30,26,.7)', 1.4);
      ctx.strokeStyle = 'rgba(150,240,200,.6)'; ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.moveTo(x - 2 * s, y - 36 * s); ctx.lineTo(x + 4 * s, y - 28 * s); ctx.lineTo(x - 2 * s, y - 20 * s); ctx.lineTo(x + 3 * s, y - 12 * s); ctx.stroke();
      glow(ctx, x, y - 28 * s, 20 * s, '#9fe8c0', .1);
      break;
    }
    case 'ruin_altar': {
      shadow(ctx, x, y + 1, 20 * s, 6 * s, .3);
      ctx.fillStyle = '#7a7466'; ctx.fillRect(x - 17 * s, y - 16 * s, 34 * s, 16 * s);
      ctx.fillStyle = '#a09a8a'; ctx.fillRect(x - 19 * s, y - 20 * s, 38 * s, 6 * s);
      ctx.fillStyle = 'rgba(140,220,190,.4)';
      ctx.beginPath(); ctx.arc(x, y - 23 * s, 3 * s, 0, 6.3); ctx.fill();
      break;
    }
    case 'arch': {
      ctx.strokeStyle = '#8a8478'; ctx.lineWidth = 8 * s;
      ctx.beginPath(); ctx.arc(x, y - 26 * s, 26 * s, Math.PI, 0); ctx.stroke();
      ctx.fillStyle = '#8a8478'; ctx.fillRect(x - 30 * s, y - 28 * s, 9 * s, 28 * s); ctx.fillRect(x + 21 * s, y - 28 * s, 9 * s, 28 * s);
      ctx.strokeStyle = 'rgba(20,18,20,.4)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(x, y - 26 * s, 26 * s, Math.PI, 0); ctx.stroke();
      break;
    }
    case 'well': {
      shadow(ctx, x, y + 1, 22 * s, 6 * s, .3);
      ctx.fillStyle = '#77705f'; ctx.beginPath(); ctx.ellipse(x, y, 20 * s, 9 * s, 0, 0, 6.3); ctx.fill();
      ctx.fillStyle = '#3a4e56'; ctx.beginPath(); ctx.ellipse(x, y - 3 * s, 15 * s, 6 * s, 0, 0, 6.3); ctx.fill();
      ctx.strokeStyle = '#8a8270'; ctx.lineWidth = 3 * s; ctx.beginPath(); ctx.ellipse(x, y, 20 * s, 9 * s, 0, 0, 6.3); ctx.stroke();
      if (p.lava) { glow(ctx, x, y - 3 * s, 34 * s, '#ff7a30', .16); }
      break;
    }
    case 'sign': {
      shadow(ctx, x, y + 1, 8 * s, 3 * s, .25);
      ctx.fillStyle = '#4a3324'; ctx.fillRect(x - 2 * s, y - 32 * s, 4 * s, 32 * s);
      ctx.fillStyle = '#8a6a44'; ctx.fillRect(x - 17 * s, y - 38 * s, 34 * s, 17 * s);
      ctx.strokeStyle = 'rgba(30,20,15,.5)'; ctx.lineWidth = 1; ctx.strokeRect(x - 17 * s, y - 38 * s, 34 * s, 17 * s);
      ctx.fillStyle = 'rgba(40,28,20,.7)'; ctx.fillRect(x - 12 * s, y - 33 * s, 18 * s, 1.5); ctx.fillRect(x - 12 * s, y - 29 * s, 22 * s, 1.5); ctx.fillRect(x - 12 * s, y - 25 * s, 13 * s, 1.5);
      break;
    }
    case 'pillar': {
      shadow(ctx, x, y + 1, 14 * s, 4 * s, .3);
      ctx.fillStyle = '#c8c2ae'; ctx.fillRect(x - 9 * s, y - 58 * s, 18 * s, 58 * s);
      ctx.fillStyle = 'rgba(255,255,255,.12)'; ctx.fillRect(x - 9 * s, y - 58 * s, 4 * s, 58 * s);
      ctx.fillStyle = '#b0aa96'; ctx.fillRect(x - 13 * s, y - 63 * s, 26 * s, 6 * s); ctx.fillRect(x - 13 * s, y - 6 * s, 26 * s, 6 * s);
      ctx.strokeStyle = 'rgba(230,210,150,.5)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x, y - 50 * s); ctx.lineTo(x, y - 14 * s); ctx.stroke();
      break;
    }
    case 'floating_rune': {
      const fy = y - 52 * s + Math.sin(time * 1.3 + p.seed * 7) * 5;
      glow(ctx, x, fy, 26 * s, '#ffe8a0', .13);
      ctx.strokeStyle = 'rgba(255,230,160,.8)'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(x, fy, 10 * s, 0, 6.3); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x - 6 * s, fy + 5 * s); ctx.lineTo(x + 6 * s, fy - 5 * s); ctx.moveTo(x + 5 * s, fy + 6 * s); ctx.lineTo(x - 3 * s, fy - 3 * s); ctx.stroke();
      break;
    }
    case 'celestial_pillar': {
      shadow(ctx, x, y + 1, 20 * s, 6 * s, .28);
      const g = ctx.createLinearGradient(x - 14 * s, y, x + 14 * s, y);
      g.addColorStop(0, '#b8b2a0'); g.addColorStop(.5, '#f0ead6'); g.addColorStop(1, '#a49e8c');
      ctx.fillStyle = g; ctx.fillRect(x - 13 * s, y - 90 * s, 26 * s, 90 * s);
      for (let i = 0; i < 5; i++) { ctx.fillStyle = 'rgba(80,76,66,.18)'; ctx.fillRect(x - 9 * s + i * 4.5 * s, y - 84 * s, 1.5, 78 * s); }
      ctx.fillStyle = '#e8e2cc'; ctx.fillRect(x - 18 * s, y - 98 * s, 36 * s, 8 * s);
      ctx.fillStyle = '#ffefb8'; ctx.beginPath(); ctx.arc(x, y - 102 * s, 4 * s, 0, 6.3); ctx.fill();
      glow(ctx, x, y - 102 * s, 30 * s, '#ffe8a0', .16);
      break;
    }
    case 'throne': {
      shadow(ctx, x, y + 1, 30 * s, 8 * s, .35);
      ctx.fillStyle = '#b8b29c'; ctx.fillRect(x - 22 * s, y - 48 * s, 44 * s, 48 * s);
      ctx.fillStyle = '#d8d2bc'; ctx.fillRect(x - 16 * s, y - 42 * s, 32 * s, 10 * s);
      poly(ctx, [[x - 22 * s, y - 48 * s], [x - 18 * s, y - 72 * s], [x + 18 * s, y - 72 * s], [x + 22 * s, y - 48 * s]], '#c8c2ac', 'rgba(30,28,26,.5)', 1);
      glow(ctx, x, y - 56 * s, 38 * s, '#ffe8a0', .14);
      break;
    }
    default: break;
  }
}

function drawAstrolabe(ctx, x, y, time) {
  glow(ctx, x, y - 30, 30, '#ffe8a0', .16);
  ctx.strokeStyle = 'rgba(255,235,170,.8)'; ctx.lineWidth = 1.5;
  ctx.save(); ctx.translate(x, y - 30); ctx.rotate(time * .4);
  ctx.beginPath(); ctx.arc(0, 0, 10, 0, 6.3); ctx.stroke();
  ctx.beginPath(); ctx.ellipse(0, 0, 4, 13, .3, 0, 6.3); ctx.stroke();
  ctx.restore();
}

export function drawEnvironment(ctx, region, cam, time) {
  // Draw all props and buildings in painter order, split into behind/front by y
  const items = [];
  for (const p of region.props) {
    if (p.x - cam.x < -180 || p.x - cam.x > cam.w + 180 || p.y - cam.y < -220 || p.y - cam.y > cam.h + 160) continue;
    items.push({ y: p.y, kind: 'prop', p });
  }
  for (const b of region.buildings) {
    if (b.x - cam.x < -b.w - 200 || b.x - cam.x > cam.w + 200 || b.y - cam.y < -b.h - 240 || b.y - cam.y > cam.h + 200) continue;
    items.push({ y: b.y + b.h, kind: 'building', b });
  }
  items.sort((a, b) => a.y - b.y);
  for (const it of items) {
    if (it.kind === 'prop') drawProp(ctx, it.p, cam, time, region);
    else drawBuilding(ctx, it.b, cam, time);
  }
  // fixed interactive objects
  for (const i of region.interactables) {
    const x = i.x - cam.x, y = i.y - cam.y;
    if (x < -100 || x > cam.w + 100 || y < -100 || y > cam.h + 100) continue;
    if (i.type === 'well') {
      // below entities; drawn here
      drawProp(ctx, { type: 'well', x: i.x, y: i.y, seed: .3, scale: 1, lava: i.lava }, cam, time, region);
    } else if (i.type === 'sign') {
      drawProp(ctx, { type: 'sign', x: i.x, y: i.y, seed: .4 }, cam, time, region);
    } else if (i.type === 'astrolabe') {
      drawAstrolabe(ctx, x, y, time);
    }
  }
}

export function drawShrines(ctx, region, cam, time) {
  for (const s of region.shrines) {
    const x = s.x - cam.x, y = s.y - cam.y;
    if (x < -100 || x > cam.w + 100 || y < -100 || y > cam.h + 100) continue;
    shadow(ctx, x, y + 4, 30, 8, .35);
    // stone circle
    ctx.fillStyle = '#6a665c';
    ctx.beginPath(); ctx.ellipse(x, y + 2, 28, 10, 0, 0, 6.3); ctx.fill();
    ctx.fillStyle = '#8a8478';
    ctx.beginPath(); ctx.ellipse(x, y, 22, 7, 0, 0, 6.3); ctx.fill();
    // floating crystal
    const fy = y - 34 + Math.sin(time * 1.4 + s.x * .01) * 4;
    glow(ctx, x, fy, 50, '#ffe6a0', .25);
    poly(ctx, [[x, fy - 20], [x - 8, fy], [x, fy + 18], [x + 8, fy]], 'rgba(255,240,190,.85)', 'rgba(255,255,255,.6)', 1.2);
    poly(ctx, [[x, fy - 20], [x - 8, fy], [x, fy + 4]], 'rgba(255,255,255,.6)', null);
    // motes
    for (let i = 0; i < 4; i++) {
      const a = time * .7 + i * 1.7 + s.x;
      ctx.fillStyle = `rgba(255,235,170,${.25 + Math.sin(a * 2) * .15})`;
      ctx.beginPath(); ctx.arc(x + Math.cos(a) * 22, y - 24 + Math.sin(a * 1.3) * 20, 1.3, 0, 6.3); ctx.fill();
    }
    // pillars
    ctx.fillStyle = '#8a8478'; ctx.fillRect(x - 26, y - 18, 5, 18); ctx.fillRect(x + 21, y - 18, 5, 18);
    ctx.fillStyle = '#c8c0aa'; ctx.fillRect(x - 28, y - 22, 9, 4); ctx.fillRect(x + 19, y - 22, 9, 4);
  }
}

export function drawStones(ctx, region, cam, time) {
  for (const i of region.interactables) {
    if (i.type !== 'stone') continue;
    const x = i.x - cam.x, y = i.y - cam.y;
    if (x < -120 || x > cam.w + 120 || y < -120 || y > cam.h + 120) continue;
    shadow(ctx, x, y + 2, 26, 8, .35);
    glow(ctx, x, y - 38, 55, i.glow || '#ffe6a0', i.active ? .3 : .12);
    poly(ctx, [[x - 18, y], [x - 20, y - 48], [x - 8, y - 72], [x + 12, y - 66], [x + 20, y - 14], [x + 16, y]], '#65716a', 'rgba(24,34,30,.8)', 1.4);
    poly(ctx, [[x - 18, y - 48], [x - 8, y - 72], [x + 2, y - 48], [x - 4, y - 18]], '#7c8880', null);
    ctx.strokeStyle = i.glow || '#ffe6a0'; ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.moveTo(x - 4, y - 60); ctx.lineTo(x + 6, y - 50); ctx.lineTo(x - 3, y - 40); ctx.lineTo(x + 5, y - 28); ctx.lineTo(x - 2, y - 18); ctx.stroke();
    for (let k = 0; k < 3; k++) {
      const a = time * .8 + k * 2;
      ctx.fillStyle = rgba(i.glow || '#ffe6a0', .3);
      ctx.beginPath(); ctx.arc(x + Math.cos(a) * 28, y - 42 + Math.sin(a * 1.2) * 24, 1.3, 0, 6.3); ctx.fill();
    }
  }
}

export function drawCampfire(ctx, x, y, time, color = '#ff9a48') {
  const fl = Math.sin(time * 5 + x) * 2;
  glow(ctx, x, y - 12, 50, color, .18);
  ctx.fillStyle = '#4a3020'; ctx.beginPath(); ctx.ellipse(x, y, 16, 5, 0, 0, 6.3); ctx.fill();
  poly(ctx, [[x - 9, y], [x + fl, y - 24], [x + 8, y]], color, null);
  poly(ctx, [[x - 4, y], [x + fl * .6, y - 16], [x + 4, y]], '#ffe6a0', null);
}

export { drawProp, drawBuilding, shadow, glow };
