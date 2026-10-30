import { drawShadow, hexA, lighten, darken } from './sprites.js';

function rr(ctx, x, y, w, h, r) {
  const rad = Math.min(r, Math.abs(w) / 2, Math.abs(h) / 2);
  ctx.beginPath();
  ctx.moveTo(x + rad, y);
  ctx.arcTo(x + w, y, x + w, y + h, rad);
  ctx.arcTo(x + w, y + h, x, y + h, rad);
  ctx.arcTo(x, y + h, x, y, rad);
  ctx.arcTo(x, y, x + w, y, rad);
  ctx.closePath();
}

export function drawTree(ctx, o, t) {
  const x = o.x, y = o.y;
  const seed = o.seed || 0;
  const sway = Math.sin(t * 0.7 + seed) * 2.4;
  const scale = o.scale || 1;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  drawShadow(ctx, 0, -2, 82, 26, 0.33);
  // raíces
  ctx.strokeStyle = '#3d2b21';
  ctx.lineWidth = 8;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-4, -5); ctx.quadraticCurveTo(-28, -2, -38, 8);
  ctx.moveTo(3, -5); ctx.quadraticCurveTo(24, -1, 36, 6);
  ctx.stroke();
  // tronco
  const trunk = ctx.createLinearGradient(-14, 0, 14, -90);
  trunk.addColorStop(0, '#3b261c');
  trunk.addColorStop(0.5, '#6b4630');
  trunk.addColorStop(1, '#4a2f23');
  ctx.fillStyle = trunk;
  ctx.beginPath();
  ctx.moveTo(-13, 0);
  ctx.bezierCurveTo(-10, -38, -8 + sway * 0.2, -63, -7 + sway, -93);
  ctx.lineTo(7 + sway, -93);
  ctx.bezierCurveTo(9, -63, 11, -37, 13, 0);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = 'rgba(18,10,8,.45)'; ctx.lineWidth = 1.2; ctx.stroke();
  // vetas
  ctx.strokeStyle = 'rgba(225,172,110,.17)'; ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(-5, -12); ctx.quadraticCurveTo(-7, -40, -3, -70);
  ctx.moveTo(4, -8); ctx.quadraticCurveTo(2, -44, 5, -78);
  ctx.stroke();
  // ramas
  ctx.strokeStyle = '#4f3427'; ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(-4, -70); ctx.quadraticCurveTo(-36, -92, -48, -112);
  ctx.moveTo(5, -78); ctx.quadraticCurveTo(38, -100, 49, -121);
  ctx.moveTo(0, -86); ctx.quadraticCurveTo(-8, -120, -24, -135);
  ctx.stroke();
  // copa
  const cols = o.colors || ['#2e5b47', '#477b58', '#1b3f36', '#79a96f'];
  const blobs = [
    [-52, -120, 48], [0, -148, 62], [50, -121, 47], [-24, -170, 42],
    [28, -174, 38], [0, -104, 50], [-62, -94, 30], [59, -90, 28],
  ];
  for (const [bx, by, br] of blobs) {
    const px = bx + sway * (br / 60), py = by;
    const g = ctx.createRadialGradient(px - br * 0.25, py - br * 0.35, br * 0.1, px, py, br);
    g.addColorStop(0, lighten(cols[1], 18));
    g.addColorStop(0.45, cols[1]);
    g.addColorStop(0.8, cols[0]);
    g.addColorStop(1, cols[2]);
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(px, py, br, 0, Math.PI * 2); ctx.fill();
  }
  // luz de hojas
  ctx.fillStyle = hexA(cols[3], 0.45);
  for (let i = 0; i < 15; i++) {
    const a = (i * 2.39 + seed) % (Math.PI * 2);
    const r = 30 + (i % 4) * 17;
    const px = Math.cos(a) * r + sway * 0.6;
    const py = -140 + Math.sin(a) * r * 0.75;
    ctx.beginPath(); ctx.ellipse(px, py, 3.5, 1.7, a, 0, Math.PI * 2); ctx.fill();
  }
  if (o.big) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const g = ctx.createRadialGradient(0, -120, 10, 0, -120, 140);
    g.addColorStop(0, 'rgba(255,230,160,.06)');
    g.addColorStop(1, 'rgba(255,230,160,0)');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(0, -120, 140, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }
  ctx.restore();
}

export function drawPine(ctx, o, t) {
  const sway = Math.sin(t * 0.8 + (o.seed || 0)) * 1.5;
  ctx.save();
  ctx.translate(o.x, o.y);
  const s = o.scale || 1;
  ctx.scale(s, s);
  drawShadow(ctx, 0, 0, 48, 17, 0.3);
  ctx.fillStyle = '#3d2b23';
  ctx.fillRect(-6, -38, 12, 38);
  const layers = [
    [-14, -150, 38, '#1a3d38'], [-20, -120, 48, '#224b42'], [-25, -87, 58, '#2a5b4b'], [-31, -50, 69, '#316852'],
  ];
  layers.forEach(([yy, top, width, color], i) => {
    const g = ctx.createLinearGradient(-width, top, width, top);
    g.addColorStop(0, darken(color, 22));
    g.addColorStop(0.5, lighten(color, 20));
    g.addColorStop(1, darken(color, 12));
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(sway * (i + 1) / 4, top - 76 + i * 4);
    ctx.lineTo(-width, yy);
    ctx.quadraticCurveTo(0, yy + 12, width, yy);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = 'rgba(130,220,170,.16)'; ctx.lineWidth = 1; ctx.stroke();
  });
  ctx.restore();
}

export function drawBush(ctx, o, t) {
  const sway = Math.sin(t * 1.2 + (o.seed || 0)) * 1.2;
  ctx.save();
  ctx.translate(o.x, o.y);
  const s = o.scale || 1;
  ctx.scale(s, s);
  drawShadow(ctx, 0, 0, 30, 10, 0.26);
  const cols = o.colors || ['#315f3f', '#4f8651', '#213f2f'];
  for (let i = 0; i < 5; i++) {
    const px = (i - 2) * 11 + sway;
    const py = -10 - (i % 2) * 7;
    const r = 15 + (i % 3) * 3;
    const g = ctx.createRadialGradient(px - 4, py - 5, 1, px, py, r);
    g.addColorStop(0, lighten(cols[1], 16));
    g.addColorStop(0.55, cols[1]);
    g.addColorStop(1, cols[0]);
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(px, py, r, 0, Math.PI * 2); ctx.fill();
  }
  if (o.berries) {
    ctx.fillStyle = o.berries;
    for (let i = 0; i < 7; i++) {
      const px = (i - 3) * 6 + Math.sin(i) * 3;
      const py = -16 + Math.cos(i * 2) * 5;
      ctx.beginPath(); ctx.arc(px, py, 1.8, 0, Math.PI * 2); ctx.fill();
    }
  }
  ctx.restore();
}

export function drawRock(ctx, o, t) {
  ctx.save();
  ctx.translate(o.x, o.y);
  const s = o.scale || 1;
  ctx.scale(s, s);
  drawShadow(ctx, 0, 0, 34, 12, 0.3);
  const pts = o.shape || [[-26, 0], [-24, -18], [-12, -31], [8, -34], [24, -19], [28, 0], [10, 8], [-14, 7]];
  const g = ctx.createLinearGradient(-20, -30, 25, 6);
  g.addColorStop(0, '#84909a');
  g.addColorStop(0.5, '#59636d');
  g.addColorStop(1, '#333d49');
  ctx.fillStyle = g;
  ctx.beginPath();
  pts.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y));
  ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(12,18,26,.6)'; ctx.lineWidth = 1.2; ctx.stroke();
  ctx.fillStyle = 'rgba(200,220,235,.22)';
  ctx.beginPath();
  ctx.moveTo(-13, -25); ctx.lineTo(4, -31); ctx.lineTo(14, -20); ctx.lineTo(-2, -13); ctx.closePath(); ctx.fill();
  // musgo
  if (o.moss !== false) {
    ctx.fillStyle = 'rgba(81,126,74,.55)';
    ctx.beginPath(); ctx.ellipse(-16, -8, 10, 4, -0.3, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(14, -3, 7, 3, 0.2, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}

export function drawStump(ctx, o) {
  ctx.save();
  ctx.translate(o.x, o.y);
  drawShadow(ctx, 0, 0, 25, 9, 0.25);
  ctx.fillStyle = '#5a3c29';
  ctx.beginPath(); ctx.ellipse(0, -8, 17, 7, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillRect(-13, -8, 26, 9);
  ctx.fillStyle = '#8a6542';
  ctx.beginPath(); ctx.ellipse(0, -9, 13, 5, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#6b4b30'; ctx.lineWidth = 1;
  for (let r = 3; r < 12; r += 3) { ctx.beginPath(); ctx.ellipse(0, -9, r, r * 0.38, 0, 0, Math.PI * 2); ctx.stroke(); }
  ctx.restore();
}

export function drawBones(ctx, o) {
  ctx.save();
  ctx.translate(o.x, o.y);
  ctx.rotate(o.rot || 0);
  ctx.strokeStyle = '#d5cfbb'; ctx.lineWidth = 3; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(-18, 0); ctx.quadraticCurveTo(-4, -7, 12, 0); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-12, -5); ctx.lineTo(-8, 7); ctx.moveTo(2, -6); ctx.lineTo(6, 6); ctx.stroke();
  ctx.fillStyle = '#c8c0a8';
  ctx.beginPath(); ctx.ellipse(-19, 0, 6, 5, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#5d5a50';
  ctx.beginPath(); ctx.arc(-21, -1, 1.6, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(-17, -1, 1.6, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

export function drawCrystal(ctx, o, t) {
  ctx.save();
  ctx.translate(o.x, o.y);
  const s = o.scale || 1;
  ctx.scale(s, s);
  drawShadow(ctx, 0, 0, 30, 11, 0.27);
  const color = o.color || '#b990ff';
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const gg = ctx.createRadialGradient(0, -36, 2, 0, -36, 70);
  gg.addColorStop(0, hexA(color, 0.28));
  gg.addColorStop(1, hexA(color, 0));
  ctx.fillStyle = gg;
  ctx.beginPath(); ctx.arc(0, -36, 70, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
  const g = ctx.createLinearGradient(-18, -20, 20, -65);
  g.addColorStop(0, darken(color, 30));
  g.addColorStop(0.45, color);
  g.addColorStop(1, '#ffffff');
  ctx.fillStyle = g;
  const spikes = o.spikes || [[-20, 0, -12, -56, 2, 0], [-2, 0, 4, -82, 18, 0], [10, 0, 26, -48, 26, 0]];
  spikes.forEach(([ax, ay, bx, by, cx, cy], i) => {
    ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.lineTo(cx + (i - 1) * 2, cy); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = hexA('#ffffff', 0.42); ctx.lineWidth = 0.8; ctx.stroke();
  });
  ctx.restore();
}

export function drawColumn(ctx, o, t) {
  ctx.save();
  ctx.translate(o.x, o.y);
  drawShadow(ctx, 0, 0, 36, 12, 0.3);
  const h = o.h || 120;
  const broken = o.broken !== false;
  const g = ctx.createLinearGradient(-20, 0, 22, 0);
  g.addColorStop(0, '#394554');
  g.addColorStop(0.4, '#7e8a92');
  g.addColorStop(1, '#47525f');
  ctx.fillStyle = g;
  ctx.fillRect(-17, -h, 34, h);
  ctx.strokeStyle = 'rgba(12,18,26,.5)'; ctx.lineWidth = 1; ctx.strokeRect(-17, -h, 34, h);
  // estrías
  ctx.strokeStyle = 'rgba(20,26,34,.25)'; ctx.lineWidth = 1;
  for (let i = -12; i <= 12; i += 6) { ctx.beginPath(); ctx.moveTo(i, -h + 6); ctx.lineTo(i, -4); ctx.stroke(); }
  // base
  ctx.fillStyle = '#5a6570';
  rr(ctx, -26, -12, 52, 12, 2); ctx.fill();
  // capitel / rotura
  if (broken) {
    ctx.fillStyle = '#6b7680';
    ctx.beginPath(); ctx.moveTo(-17, -h); ctx.lineTo(-10, -h - 9); ctx.lineTo(0, -h - 3); ctx.lineTo(12, -h - 13); ctx.lineTo(17, -h); ctx.closePath(); ctx.fill();
  } else {
    ctx.fillStyle = '#69747f';
    rr(ctx, -26, -h - 12, 52, 12, 2); ctx.fill();
    ctx.fillStyle = '#87929a';
    rr(ctx, -29, -h - 17, 58, 6, 2); ctx.fill();
  }
  // musgo
  ctx.fillStyle = 'rgba(62,111,72,.45)';
  ctx.beginPath(); ctx.ellipse(-11, -18, 7, 14, 0.2, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(8, -h + 14, 6, 9, -0.1, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

export function drawRuinWall(ctx, o, t) {
  ctx.save();
  ctx.translate(o.x, o.y);
  const w = o.w || 180, h = o.h || 90;
  drawShadow(ctx, 0, 0, w * 0.53, 13, 0.28);
  const g = ctx.createLinearGradient(0, -h, 0, 0);
  g.addColorStop(0, '#65707b');
  g.addColorStop(0.55, '#48535e');
  g.addColorStop(1, '#333c46');
  ctx.fillStyle = g;
  const jag = o.jag || 0.12;
  ctx.beginPath();
  ctx.moveTo(-w / 2, 0);
  ctx.lineTo(-w / 2, -h * (0.72 + (o.seed % 10) / 60));
  for (let i = 1; i <= 6; i++) {
    const px = -w / 2 + (w / 6) * i;
    ctx.lineTo(px - w / 12, -h * (0.8 + Math.sin(i * 2 + o.seed) * jag));
    ctx.lineTo(px, -h * (0.62 + Math.cos(i * 1.7 + o.seed) * jag));
  }
  ctx.lineTo(w / 2, -h * (0.7 + (o.seed % 7) / 80));
  ctx.lineTo(w / 2, 0);
  ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(12,16,24,.55)'; ctx.lineWidth = 1.2; ctx.stroke();
  // sillares
  ctx.strokeStyle = 'rgba(20,26,32,.28)'; ctx.lineWidth = 1;
  for (let yy = -h * 0.3; yy > -h; yy -= 22) { ctx.beginPath(); ctx.moveTo(-w / 2, yy); ctx.lineTo(w / 2, yy); ctx.stroke(); }
  for (let xx = -w / 2 + 30; xx < w / 2; xx += 48) { ctx.beginPath(); ctx.moveTo(xx, 0); ctx.lineTo(xx, -h * 0.8); ctx.stroke(); }
  // grietas
  ctx.strokeStyle = 'rgba(15,18,23,.55)'; ctx.lineWidth = 1.4;
  ctx.beginPath(); ctx.moveTo(-w * 0.2, -h * 0.8); ctx.lineTo(-w * 0.12, -h * 0.5); ctx.lineTo(-w * 0.17, -h * 0.2); ctx.stroke();
  // musgo
  ctx.fillStyle = 'rgba(58,100,67,.4)';
  ctx.beginPath(); ctx.ellipse(-w * 0.3, -8, 25, 6, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(w * 0.28, -h * 0.4, 12, 4, 0.2, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

export function drawGravestone(ctx, o) {
  ctx.save();
  ctx.translate(o.x, o.y);
  drawShadow(ctx, 0, 0, 20, 7, 0.24);
  ctx.fillStyle = '#6b747e';
  ctx.beginPath();
  ctx.moveTo(-14, 0); ctx.lineTo(-14, -34); ctx.quadraticCurveTo(0, -48, 14, -34); ctx.lineTo(14, 0); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(15,20,26,.55)'; ctx.stroke();
  ctx.strokeStyle = 'rgba(200,220,230,.25)'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(-7, -27); ctx.lineTo(7, -27); ctx.moveTo(0, -34); ctx.lineTo(0, -14); ctx.stroke();
  ctx.fillStyle = 'rgba(70,111,72,.4)';
  ctx.beginPath(); ctx.ellipse(3, -4, 10, 4, 0.1, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

export function drawStatue(ctx, o, t) {
  ctx.save();
  ctx.translate(o.x, o.y);
  drawShadow(ctx, 0, 0, 32, 12, 0.28);
  ctx.fillStyle = '#55606b';
  rr(ctx, -28, -14, 56, 14, 2); ctx.fill();
  const g = ctx.createLinearGradient(-20, -90, 20, 0);
  g.addColorStop(0, '#828d96'); g.addColorStop(0.5, '#5d6771'); g.addColorStop(1, '#3c4650');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(-15, -14); ctx.lineTo(-12, -55); ctx.quadraticCurveTo(-24, -72, -19, -94);
  ctx.quadraticCurveTo(0, -107, 19, -94); ctx.quadraticCurveTo(24, -72, 12, -55); ctx.lineTo(15, -14); ctx.closePath(); ctx.fill();
  // alas
  ctx.fillStyle = 'rgba(110,126,142,.75)';
  ctx.beginPath(); ctx.moveTo(-14, -62); ctx.quadraticCurveTo(-45, -75, -54, -103); ctx.quadraticCurveTo(-30, -92, -12, -76); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(14, -62); ctx.quadraticCurveTo(45, -75, 54, -103); ctx.quadraticCurveTo(30, -92, 12, -76); ctx.closePath(); ctx.fill();
  // cabeza
  ctx.fillStyle = '#78838c';
  ctx.beginPath(); ctx.arc(0, -91, 10, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'rgba(255,220,130,.35)';
  ctx.beginPath(); ctx.arc(-3, -92, 1.4, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(3, -92, 1.4, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

export function drawLantern(ctx, o, t) {
  ctx.save();
  ctx.translate(o.x, o.y);
  const color = o.color || '#ffcf7a';
  drawShadow(ctx, 0, 0, 15, 6, 0.22);
  ctx.strokeStyle = '#3a2b22'; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -68); ctx.stroke();
  ctx.fillStyle = '#4a3525';
  ctx.beginPath(); ctx.arc(0, -70, 4, 0, Math.PI * 2); ctx.fill();
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const g = ctx.createRadialGradient(0, -58, 2, 0, -58, 58);
  g.addColorStop(0, hexA(color, 0.32));
  g.addColorStop(1, hexA(color, 0));
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(0, -58, 58, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
  ctx.strokeStyle = '#6c512f'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(-7, -72); ctx.lineTo(7, -72); ctx.stroke();
  ctx.fillStyle = '#ffe6a6';
  ctx.shadowColor = color; ctx.shadowBlur = 12;
  rr(ctx, -7, -71, 14, 18, 3); ctx.fill();
  ctx.shadowBlur = 0;
  ctx.strokeStyle = '#4a3525'; ctx.lineWidth = 1.5;
  ctx.strokeRect(-7, -71, 14, 18);
  ctx.restore();
}

export function drawTent(ctx, o) {
  ctx.save();
  ctx.translate(o.x, o.y);
  drawShadow(ctx, 0, 0, 50, 16, 0.28);
  ctx.fillStyle = '#6b3f35';
  ctx.beginPath(); ctx.moveTo(-52, 0); ctx.lineTo(0, -68); ctx.lineTo(52, 0); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#c49a61';
  ctx.beginPath(); ctx.moveTo(-22, 0); ctx.lineTo(0, -70); ctx.lineTo(22, 0); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(20,16,20,.4)'; ctx.lineWidth = 1; ctx.stroke();
  ctx.restore();
}
