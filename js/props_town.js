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

export function drawHouse(ctx, o, t, state) {
  const w = o.w || 260, h = o.h || 150;
  const wall = o.wall || '#b28a61';
  const roof = o.roof || '#7a3f35';
  ctx.save();
  ctx.translate(o.x, o.y);
  drawShadow(ctx, 0, 0, w * 0.62, 26, 0.34);
  // jardín
  ctx.fillStyle = 'rgba(74,112,69,.4)';
  ctx.beginPath(); ctx.ellipse(-w * 0.44, -4, 34, 11, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(w * 0.44, -3, 28, 9, 0, 0, Math.PI * 2); ctx.fill();
  // pared frontal
  const wg = ctx.createLinearGradient(-w / 2, -h, w / 2, 0);
  wg.addColorStop(0, lighten(wall, 20));
  wg.addColorStop(0.65, wall);
  wg.addColorStop(1, darken(wall, 22));
  ctx.fillStyle = wg;
  rr(ctx, -w / 2, -h, w, h, 3); ctx.fill();
  ctx.strokeStyle = 'rgba(30,20,16,.45)'; ctx.lineWidth = 1.4; ctx.stroke();
  // vigas
  ctx.strokeStyle = 'rgba(73,47,32,.5)'; ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-w / 2 + 8, -h + 8); ctx.lineTo(w / 2 - 8, -h + 8);
  ctx.moveTo(-w / 2 + 8, -h / 2); ctx.lineTo(w / 2 - 8, -h / 2);
  ctx.stroke();
  // puerta
  const doorW = 40, doorH = 70;
  ctx.fillStyle = '#4b3023';
  rr(ctx, -doorW / 2, -doorH, doorW, doorH, 3); ctx.fill();
  ctx.strokeStyle = '#2d1c17'; ctx.lineWidth = 2; ctx.stroke();
  ctx.fillStyle = '#d9b15e';
  ctx.beginPath(); ctx.arc(doorW / 2 - 8, -doorH / 2, 2.2, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'rgba(255,214,137,.28)';
  ctx.fillRect(-doorW / 2 + 5, -doorH + 7, doorW - 10, doorH - 14);
  // ventanas
  const winY = -h + 38;
  for (const side of [-1, 1]) {
    const wx = side * (w * 0.31) - 14;
    ctx.save();
    ctx.shadowColor = '#ffd488';
    ctx.shadowBlur = state && state.timeOfDay === 'night' ? 18 : 6;
    ctx.fillStyle = '#ffd488';
    rr(ctx, wx, winY, 28, 24, 2); ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = '#4b3023'; ctx.lineWidth = 2; ctx.strokeRect(wx, winY, 28, 24);
    ctx.strokeStyle = 'rgba(75,48,35,.7)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(wx + 14, winY); ctx.lineTo(wx + 14, winY + 24); ctx.moveTo(wx, winY + 12); ctx.lineTo(wx + 28, winY + 12); ctx.stroke();
    ctx.restore();
  }
  // tejado
  const roofH = 88;
  const rg = ctx.createLinearGradient(0, -h - roofH, 0, -h + 10);
  rg.addColorStop(0, lighten(roof, 22));
  rg.addColorStop(0.55, roof);
  rg.addColorStop(1, darken(roof, 30));
  ctx.fillStyle = rg;
  ctx.beginPath();
  ctx.moveTo(-w / 2 - 18, -h + 6);
  ctx.lineTo(-w * 0.22, -h - roofH);
  ctx.lineTo(w * 0.22, -h - roofH);
  ctx.lineTo(w / 2 + 18, -h + 6);
  ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(30,18,15,.55)'; ctx.lineWidth = 1.5; ctx.stroke();
  // tejas
  ctx.strokeStyle = 'rgba(35,18,15,.28)'; ctx.lineWidth = 1;
  for (let yy = -h - 12; yy > -h - roofH + 10; yy -= 12) {
    const t2 = (yy + h + 12) / roofH;
    const halfW = (w / 2 + 18) * (1 - t2 * 0.55) + 6;
    ctx.beginPath(); ctx.moveTo(-halfW, yy); ctx.lineTo(halfW, yy); ctx.stroke();
  }
  // alero
  ctx.fillStyle = darken(roof, 38);
  rr(ctx, -w / 2 - 20, -h - 3, w + 40, 10, 2); ctx.fill();
  // chimenea
  if (o.chimney !== false) {
    const cx = w * 0.28;
    ctx.fillStyle = '#7c6554';
    ctx.fillRect(cx - 10, -h - roofH - 26, 20, 42);
    ctx.fillStyle = '#a58a71';
    ctx.fillRect(cx - 13, -h - roofH - 30, 26, 7);
    // humo
    ctx.fillStyle = 'rgba(210,225,235,.16)';
    for (let i = 0; i < 3; i++) {
      const y = -h - roofH - 36 - i * 16 - (t * 7 + i * 12) % 24;
      const x = cx + Math.sin(t * 0.7 + i) * (5 + i * 3);
      ctx.beginPath(); ctx.arc(x, y, 4 + i * 2.5, 0, Math.PI * 2); ctx.fill();
    }
  }
  // detalles
  ctx.fillStyle = 'rgba(255,230,170,.28)';
  ctx.fillRect(-w / 2 + 10, -h + 12, w - 20, 3);
  // macetas
  ctx.fillStyle = '#6a432d';
  rr(ctx, -doorW / 2 - 27, -14, 16, 10, 2); ctx.fill();
  rr(ctx, doorW / 2 + 11, -14, 16, 10, 2); ctx.fill();
  ctx.fillStyle = '#78b25d';
  for (const px of [-doorW / 2 - 19, doorW / 2 + 19]) {
    ctx.beginPath(); ctx.arc(px, -18, 7, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ffcf6e'; ctx.beginPath(); ctx.arc(px + 2, -21, 2, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#78b25d';
  }
  // letrero
  if (o.label) {
    ctx.fillStyle = '#3f2a1e';
    rr(ctx, -34, -h - 33, 68, 18, 3); ctx.fill();
    ctx.strokeStyle = '#cba45c'; ctx.lineWidth = 1; ctx.stroke();
    ctx.fillStyle = '#f4dca4';
    ctx.font = 'bold 10px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText(o.label, 0, -h - 20);
  }
  ctx.restore();
}

export function drawForge(ctx, o, t) {
  ctx.save();
  ctx.translate(o.x, o.y);
  drawShadow(ctx, 0, 0, 115, 24, 0.32);
  // estructura
  ctx.fillStyle = '#655e59';
  rr(ctx, -100, -120, 200, 120, 3); ctx.fill();
  ctx.strokeStyle = 'rgba(25,20,20,.5)'; ctx.stroke();
  // techo
  ctx.fillStyle = '#3d3532';
  ctx.beginPath(); ctx.moveTo(-112, -116); ctx.lineTo(-64, -164); ctx.lineTo(70, -164); ctx.lineTo(112, -116); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#504744';
  ctx.fillRect(-70, -160, 140, 8);
  // horno
  ctx.fillStyle = '#3d2d26';
  rr(ctx, -76, -86, 64, 74, 4); ctx.fill();
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const fg = ctx.createRadialGradient(-44, -38, 2, -44, -38, 56);
  fg.addColorStop(0, 'rgba(255,163,75,.65)');
  fg.addColorStop(1, 'rgba(255,110,40,0)');
  ctx.fillStyle = fg;
  ctx.beginPath(); ctx.arc(-44, -38, 56, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
  ctx.fillStyle = '#ff9c4a';
  ctx.beginPath();
  ctx.moveTo(-62, -12); ctx.quadraticCurveTo(-58, -38, -44, -35); ctx.quadraticCurveTo(-30, -38, -26, -12);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#ffe0a0';
  ctx.beginPath(); ctx.ellipse(-44, -17, 9, 5, 0, 0, Math.PI * 2); ctx.fill();
  // yunque
  ctx.fillStyle = '#393d42';
  rr(ctx, 16, -48, 46, 12, 2); ctx.fill();
  ctx.fillStyle = '#4d5258';
  ctx.beginPath(); ctx.moveTo(18, -48); ctx.lineTo(62, -48); ctx.lineTo(68, -55); ctx.lineTo(54, -60); ctx.lineTo(20, -57); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#2c3034';
  ctx.fillRect(33, -36, 14, 26);
  // martillo
  ctx.save();
  ctx.translate(32, -76);
  ctx.rotate(-0.5 + Math.sin(t * 0.8) * 0.03);
  ctx.fillStyle = '#7a5636'; ctx.fillRect(-2, 0, 4, 32);
  ctx.fillStyle = '#8d959d'; ctx.fillRect(-11, -8, 22, 12);
  ctx.restore();
  // chispas
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 7; i++) {
    const a = (t * 0.9 + i * 2.7) % 6.28;
    const r = 20 + (i % 3) * 13;
    ctx.fillStyle = `rgba(255,${160 + i * 8},70,${0.4 + Math.sin(t + i) * 0.2})`;
    ctx.beginPath(); ctx.arc(-44 + Math.cos(a) * r, -17 + Math.sin(a) * r * 0.5, 1.4, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
  // letrero
  ctx.fillStyle = '#2e2523'; rr(ctx, -42, -154, 84, 20, 3); ctx.fill();
  ctx.strokeStyle = '#c8924a'; ctx.lineWidth = 1; ctx.stroke();
  ctx.fillStyle = '#f4c97d'; ctx.font = 'bold 10px Georgia, serif'; ctx.textAlign = 'center';
  ctx.fillText(o.label || 'FORJA', 0, -140);
  ctx.restore();
}

export function drawStall(ctx, o, t) {
  ctx.save();
  ctx.translate(o.x, o.y);
  drawShadow(ctx, 0, 0, 92, 20, 0.28);
  // estructura
  ctx.fillStyle = '#604431';
  ctx.fillRect(-78, -72, 6, 72);
  ctx.fillRect(72, -72, 6, 72);
  ctx.fillStyle = '#806044';
  ctx.fillRect(-82, -66, 164, 7);
  // toldo
  const stripe = o.color || '#b5504b';
  for (let i = 0; i < 6; i++) {
    ctx.fillStyle = i % 2 ? '#f1dfbb' : stripe;
    ctx.beginPath();
    ctx.moveTo(-84 + i * 28, -70);
    ctx.lineTo(-84 + (i + 1) * 28, -70);
    ctx.lineTo(-78 + (i + 1) * 28, -98);
    ctx.quadraticCurveTo(-84 + (i + 0.5) * 28, -104, -90 + i * 28, -98);
    ctx.closePath(); ctx.fill();
  }
  // mostrador
  ctx.fillStyle = '#7b5638';
  rr(ctx, -70, -34, 140, 18, 3); ctx.fill();
  ctx.fillStyle = '#a67a4e';
  rr(ctx, -70, -34, 140, 5, 2); ctx.fill();
  // mercancía
  const goods = o.goods || ['#ffd36e', '#67d9ff', '#c08bff', '#ff7b8e'];
  for (let i = 0; i < 5; i++) {
    ctx.fillStyle = goods[i % goods.length];
    ctx.beginPath(); ctx.arc(-48 + i * 24, -39, 5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.35)';
    ctx.beginPath(); ctx.arc(-49 + i * 24, -41, 1.5, 0, Math.PI * 2); ctx.fill();
  }
  // cajas
  ctx.fillStyle = '#6b4b31';
  rr(ctx, -62, -16, 28, 16, 2); ctx.fill();
  rr(ctx, 46, -18, 22, 18, 2); ctx.fill();
  // farolillo
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.fillStyle = 'rgba(255,210,120,.22)';
  ctx.beginPath(); ctx.arc(0, -80, 46, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
  ctx.fillStyle = '#ffdb82';
  ctx.beginPath(); ctx.arc(0, -94, 4, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

export function drawFountain(ctx, o, t) {
  ctx.save();
  ctx.translate(o.x, o.y);
  drawShadow(ctx, 0, 0, 92, 30, 0.3);
  // base
  ctx.fillStyle = '#5c6874';
  ctx.beginPath(); ctx.ellipse(0, -10, 84, 30, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#84909a';
  ctx.beginPath(); ctx.ellipse(0, -14, 76, 25, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#2e7995';
  ctx.beginPath(); ctx.ellipse(0, -16, 68, 20, 0, 0, Math.PI * 2); ctx.fill();
  // agua brillante
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const wg = ctx.createRadialGradient(0, -20, 2, 0, -20, 68);
  wg.addColorStop(0, 'rgba(140,235,255,.28)');
  wg.addColorStop(1, 'rgba(140,235,255,0)');
  ctx.fillStyle = wg;
  ctx.beginPath(); ctx.ellipse(0, -18, 66, 18, 0, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
  ctx.strokeStyle = 'rgba(185,245,255,.4)'; ctx.lineWidth = 1;
  for (let i = 0; i < 3; i++) {
    ctx.beginPath(); ctx.ellipse(0, -18, 20 + i * 16 + Math.sin(t + i) * 2, 5 + i * 3, 0, 0, Math.PI * 2); ctx.stroke();
  }
  // pilar
  ctx.fillStyle = '#7e8a94';
  rr(ctx, -14, -96, 28, 78, 4); ctx.fill();
  ctx.fillStyle = '#9aa6ad';
  rr(ctx, -20, -100, 40, 10, 3); ctx.fill();
  // estatua superior
  ctx.fillStyle = '#b6c2c8';
  ctx.beginPath(); ctx.arc(0, -112, 9, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.moveTo(-12, -100); ctx.quadraticCurveTo(0, -108, 12, -100); ctx.lineTo(8, -84); ctx.lineTo(-8, -84); ctx.closePath(); ctx.fill();
  // chorros
  ctx.strokeStyle = 'rgba(160,240,255,.55)'; ctx.lineWidth = 1.5;
  for (const side of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(side * 8, -90);
    ctx.quadraticCurveTo(side * 35, -112, side * 52, -28);
    ctx.stroke();
  }
  ctx.restore();
}

export function drawShrine(ctx, o, t) {
  ctx.save();
  ctx.translate(o.x, o.y);
  drawShadow(ctx, 0, 0, 54, 19, 0.3);
  // escalones
  ctx.fillStyle = '#596777';
  rr(ctx, -48, -10, 96, 10, 2); ctx.fill();
  ctx.fillStyle = '#6b7988';
  rr(ctx, -38, -20, 76, 10, 2); ctx.fill();
  ctx.fillStyle = '#7d8b99';
  rr(ctx, -30, -30, 60, 10, 2); ctx.fill();
  // pedestal
  const pg = ctx.createLinearGradient(-24, -90, 24, -20);
  pg.addColorStop(0, '#94a2ad'); pg.addColorStop(1, '#4c5967');
  ctx.fillStyle = pg;
  rr(ctx, -20, -82, 40, 54, 4); ctx.fill();
  ctx.strokeStyle = 'rgba(20,28,38,.5)'; ctx.lineWidth = 1; ctx.stroke();
  // luz
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const g = ctx.createRadialGradient(0, -106, 2, 0, -106, 96);
  g.addColorStop(0, 'rgba(255,232,160,.5)');
  g.addColorStop(0.4, 'rgba(150,210,255,.12)');
  g.addColorStop(1, 'rgba(150,210,255,0)');
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(0, -106, 96, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
  // cristal flotante
  const fy = -112 + Math.sin(t * 1.5) * 4;
  ctx.save();
  ctx.translate(0, fy);
  ctx.rotate(t * 0.3);
  const cg = ctx.createLinearGradient(-12, -14, 12, 14);
  cg.addColorStop(0, '#fff7cf'); cg.addColorStop(0.5, '#ffe49b'); cg.addColorStop(1, '#8cd8ff');
  ctx.fillStyle = cg;
  ctx.beginPath(); ctx.moveTo(0, -22); ctx.lineTo(11, -3); ctx.lineTo(7, 16); ctx.lineTo(-7, 16); ctx.lineTo(-11, -3); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,.8)'; ctx.stroke();
  ctx.restore();
  // runas
  ctx.fillStyle = 'rgba(255,225,150,.5)';
  for (let i = 0; i < 4; i++) ctx.fillRect(-12 + i * 8, -52, 1.5, 12);
  // partículas
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 10; i++) {
    const a = t * 0.6 + i * 1.7;
    ctx.fillStyle = `rgba(255,235,170,${0.3 + Math.sin(t * 2 + i) * 0.15})`;
    ctx.beginPath(); ctx.arc(Math.cos(a) * (20 + i * 2), -100 + Math.sin(a) * 22, 1.3, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
  ctx.restore();
}

export function drawPortal(ctx, o, t) {
  ctx.save();
  ctx.translate(o.x, o.y);
  drawShadow(ctx, 0, 0, 58, 18, 0.28);
  const color = o.color || '#8ce7ff';
  // piedras
  ctx.strokeStyle = '#586475'; ctx.lineWidth = 18; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.arc(0, -52, 42, Math.PI * 0.72, Math.PI * 2.28); ctx.stroke();
  ctx.strokeStyle = '#7d8a99'; ctx.lineWidth = 9;
  ctx.beginPath(); ctx.arc(0, -52, 42, Math.PI * 0.72, Math.PI * 2.28); ctx.stroke();
  // vórtice
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const g = ctx.createRadialGradient(0, -52, 2, 0, -52, 50);
  g.addColorStop(0, hexA(color, 0.55));
  g.addColorStop(0.6, hexA(color, 0.16));
  g.addColorStop(1, hexA(color, 0));
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.ellipse(0, -52, 52, 58, 0, 0, Math.PI * 2); ctx.fill();
  for (let i = 0; i < 4; i++) {
    ctx.strokeStyle = hexA(color, 0.2 + i * 0.04);
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.ellipse(0, -52, 32 - i * 6, 42 - i * 7, t * 0.2 + i, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();
  // motas
  ctx.fillStyle = hexA(color, 0.7);
  for (let i = 0; i < 9; i++) {
    const a = t * 0.9 + i * 0.7;
    ctx.beginPath(); ctx.arc(Math.cos(a) * (15 + i % 3 * 8), -52 + Math.sin(a) * (20 + i % 4 * 6), 1.5, 0, Math.PI * 2); ctx.fill();
  }
  // base
  ctx.fillStyle = '#687584';
  rr(ctx, -46, -12, 92, 12, 3); ctx.fill();
  ctx.fillStyle = hexA(color, 0.3);
  rr(ctx, -38, -10, 76, 5, 2); ctx.fill();
  ctx.restore();
}

export function drawChest(ctx, o, t, state) {
  const opened = state?.world?.openedChests?.includes(o.id);
  ctx.save();
  ctx.translate(o.x, o.y);
  drawShadow(ctx, 0, 0, 26, 9, 0.28);
  if (!opened) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const g = ctx.createRadialGradient(0, -22, 2, 0, -22, 48);
    g.addColorStop(0, 'rgba(255,224,140,.22)');
    g.addColorStop(1, 'rgba(255,224,140,0)');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(0, -22, 48, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }
  ctx.fillStyle = '#5a3b26';
  rr(ctx, -24, -22, 48, 22, 3); ctx.fill();
  ctx.strokeStyle = '#2f1e18'; ctx.lineWidth = 1.5; ctx.stroke();
  ctx.fillStyle = '#d9b25d';
  if (opened) {
    ctx.save();
    ctx.translate(0, -20);
    ctx.rotate(-0.85);
    ctx.fillStyle = '#6a482a';
    rr(ctx, -24, -12, 48, 12, 3); ctx.fill();
    ctx.strokeStyle = '#2f1e18'; ctx.stroke();
    ctx.restore();
    ctx.fillStyle = 'rgba(255,220,130,.12)';
    ctx.beginPath(); ctx.ellipse(0, -13, 20, 7, 0, 0, Math.PI * 2); ctx.fill();
  } else {
    ctx.fillStyle = '#6a482a';
    rr(ctx, -24, -32, 48, 12, 3); ctx.fill();
    ctx.strokeStyle = '#2f1e18'; ctx.stroke();
    ctx.fillStyle = '#d9b25d';
    rr(ctx, -5, -32, 10, 12, 2); ctx.fill();
    rr(ctx, -5, -14, 10, 9, 2); ctx.fill();
    ctx.fillStyle = '#fff1b0';
    ctx.beginPath(); ctx.arc(0, -20, 1.8, 0, Math.PI * 2); ctx.fill();
  }
  // refuerzos
  ctx.fillStyle = '#d9b25d';
  ctx.fillRect(-24, -22, 3, 22);
  ctx.fillRect(21, -22, 3, 22);
  ctx.restore();
}

export function drawBoulder(ctx, o, t, state) {
  const moved = state?.flags?.boulder_moved;
  ctx.save();
  ctx.translate(o.x + (moved ? 62 : 0), o.y + (moved ? 8 : 0));
  if (moved) ctx.globalAlpha = 0.85;
  drawShadow(ctx, 0, 0, 40, 15, 0.32);
  const g = ctx.createRadialGradient(-10, -38, 4, 0, -24, 48);
  g.addColorStop(0, '#9aa3a8');
  g.addColorStop(0.5, '#606c74');
  g.addColorStop(1, '#333f49');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(-38, 0); ctx.lineTo(-34, -27); ctx.lineTo(-18, -45); ctx.lineTo(8, -48);
  ctx.lineTo(32, -31); ctx.lineTo(40, -7); ctx.lineTo(27, 6); ctx.lineTo(-18, 7); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(16,22,30,.6)'; ctx.stroke();
  ctx.strokeStyle = 'rgba(140,190,255,.3)'; ctx.lineWidth = 1.4;
  ctx.beginPath(); ctx.moveTo(-8, -41); ctx.lineTo(2, -28); ctx.lineTo(-4, -15); ctx.lineTo(7, -7); ctx.stroke();
  ctx.fillStyle = 'rgba(255,220,130,.55)';
  for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(-4 + i * 7, -23 + Math.sin(i) * 4, 1.2, 0, Math.PI * 2); ctx.fill(); }
  ctx.fillStyle = 'rgba(76,113,73,.45)';
  ctx.beginPath(); ctx.ellipse(-25, -7, 12, 4, -0.2, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

export function drawBramble(ctx, o, t, state) {
  const burned = state?.flags?.bramble_burned;
  ctx.save();
  ctx.translate(o.x, o.y);
  if (burned) {
    ctx.globalAlpha = 0.35;
    ctx.fillStyle = '#2d2521';
    for (let i = 0; i < 6; i++) {
      ctx.beginPath(); ctx.ellipse((i - 3) * 11, -2, 7, 3, i * 0.2, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
    return;
  }
  drawShadow(ctx, 0, 0, 54, 16, 0.3);
  // espinas
  const sway = Math.sin(t * 1.4) * 2;
  ctx.strokeStyle = '#4f3423'; ctx.lineWidth = 4; ctx.lineCap = 'round';
  for (let i = 0; i < 7; i++) {
    const x0 = -48 + i * 15;
    const h = 40 + (i % 3) * 18;
    ctx.beginPath();
    ctx.moveTo(x0, 0);
    ctx.quadraticCurveTo(x0 + 10 + sway, -h * 0.5, x0 - 4 + sway * 1.5, -h);
    ctx.stroke();
    ctx.strokeStyle = '#786044'; ctx.lineWidth = 1.8;
    for (let j = 1; j < 4; j++) {
      const yy = -h * (j / 4);
      ctx.beginPath(); ctx.moveTo(x0 + 2 + sway * 0.5, yy); ctx.lineTo(x0 + 12, yy - 7); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x0 + 1, yy - 3); ctx.lineTo(x0 - 9, yy - 10); ctx.stroke();
    }
    ctx.strokeStyle = '#4f3423'; ctx.lineWidth = 4;
  }
  // hojas
  ctx.fillStyle = 'rgba(73,111,50,.8)';
  for (let i = 0; i < 12; i++) {
    const a = i * 2.1;
    ctx.beginPath(); ctx.ellipse(Math.cos(a) * 30, -22 + Math.sin(a) * 18, 7, 3, a, 0, Math.PI * 2); ctx.fill();
  }
  // frutos rojos
  ctx.fillStyle = '#ff6b65';
  for (let i = 0; i < 5; i++) {
    ctx.beginPath(); ctx.arc(-30 + i * 16, -28 - (i % 2) * 12, 2.2, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}

export function drawIceGate(ctx, o, t, state) {
  const open = state?.flags?.ice_gate;
  ctx.save();
  ctx.translate(o.x, o.y);
  if (open) {
    ctx.globalAlpha = 0.55;
    for (let i = 0; i < 5; i++) {
      ctx.fillStyle = 'rgba(170,235,255,.5)';
      ctx.beginPath();
      ctx.moveTo(-54 + i * 26, 0); ctx.lineTo(-66 + i * 24, -18 - (i % 3) * 9); ctx.lineTo(-45 + i * 24, -10); ctx.closePath(); ctx.fill();
    }
    ctx.restore();
    return;
  }
  drawShadow(ctx, 0, 0, 66, 18, 0.3);
  // columnas de hielo
  const g = ctx.createLinearGradient(-60, -110, 60, 0);
  g.addColorStop(0, '#e7fbff');
  g.addColorStop(0.4, '#a5e1f5');
  g.addColorStop(0.7, '#5eafd0');
  g.addColorStop(1, '#2c6f90');
  ctx.fillStyle = g;
  const spikes = [
    [-62, 0, -54, -94, -35, 0], [-42, 0, -28, -128, -8, 0], [-18, 0, -3, -96, 14, 0],
    [8, 0, 26, -142, 45, 0], [32, 0, 54, -102, 68, 0], [-5, 0, 12, -65, 28, 0],
  ];
  spikes.forEach(([ax, ay, bx, by, cx, cy], i) => {
    ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.lineTo(cx, cy); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(235,255,255,.55)'; ctx.lineWidth = 0.9; ctx.stroke();
  });
  ctx.fillStyle = 'rgba(255,255,255,.55)';
  ctx.beginPath(); ctx.moveTo(-30, -70); ctx.lineTo(-24, -108); ctx.lineTo(-15, -76); ctx.closePath(); ctx.fill();
  // niebla
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const fg = ctx.createRadialGradient(0, -20, 4, 0, -20, 78);
  fg.addColorStop(0, 'rgba(190,245,255,.18)');
  fg.addColorStop(1, 'rgba(190,245,255,0)');
  ctx.fillStyle = fg;
  ctx.beginPath(); ctx.arc(0, -20, 78, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
  // runa de escarcha
  ctx.strokeStyle = 'rgba(235,255,255,.75)'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.arc(0, -61, 13, 0, Math.PI * 2); ctx.stroke();
  for (let i = 0; i < 6; i++) {
    const a = i * Math.PI / 3;
    ctx.beginPath(); ctx.moveTo(Math.cos(a) * 5, -61 + Math.sin(a) * 5); ctx.lineTo(Math.cos(a) * 13, -61 + Math.sin(a) * 13); ctx.stroke();
  }
  ctx.restore();
}

export function drawRune(ctx, o, t, state) {
  const powered = state?.flags?.rune_power;
  ctx.save();
  ctx.translate(o.x, o.y);
  ctx.globalCompositeOperation = 'lighter';
  const color = powered ? '#ffe26e' : '#6d7f96';
  const pulse = powered ? 0.35 + Math.sin(t * 2) * 0.12 : 0.12;
  const g = ctx.createRadialGradient(0, 0, 2, 0, 0, 54);
  g.addColorStop(0, hexA(color, pulse));
  g.addColorStop(1, hexA(color, 0));
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.ellipse(0, 0, 58, 26, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = hexA(color, powered ? 0.95 : 0.45);
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.ellipse(0, 0, 34, 15, 0, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath(); ctx.ellipse(0, 0, 24, 10, 0, 0, Math.PI * 2); ctx.stroke();
  for (let i = 0; i < 5; i++) {
    const a = i * Math.PI * 2 / 5 + t * (powered ? 0.4 : 0.04);
    ctx.beginPath(); ctx.moveTo(Math.cos(a) * 10, Math.sin(a) * 5); ctx.lineTo(Math.cos(a) * 30, Math.sin(a) * 13); ctx.stroke();
  }
  if (powered) {
    ctx.fillStyle = '#fff3b0';
    for (let i = 0; i < 4; i++) {
      const a = t * 1.3 + i * 1.6;
      ctx.beginPath(); ctx.arc(Math.cos(a) * 26, Math.sin(a) * 11, 1.5, 0, Math.PI * 2); ctx.fill();
    }
  }
  ctx.restore();
}

export function drawGap(ctx, o, t, state) {
  const bridged = state?.flags?.bridge_grown;
  ctx.save();
  ctx.translate(o.x, o.y);
  // abismo
  const g = ctx.createRadialGradient(0, 0, 4, 0, 0, 100);
  g.addColorStop(0, '#02040a');
  g.addColorStop(0.7, '#050912');
  g.addColorStop(1, 'rgba(5,9,18,0)');
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.ellipse(0, 0, 110, 46, o.rot || 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = 'rgba(120,150,190,.2)'; ctx.lineWidth = 1;
  for (let i = 0; i < 3; i++) {
    ctx.beginPath(); ctx.ellipse(0, 0, 82 - i * 16, 32 - i * 6, o.rot || 0, 0, Math.PI * 2); ctx.stroke();
  }
  if (bridged) {
    ctx.save();
    ctx.rotate(o.rot || 0);
    ctx.globalAlpha = 0.95;
    ctx.fillStyle = '#5b8a43';
    rr(ctx, -98, -16, 196, 32, 8); ctx.fill();
    ctx.strokeStyle = '#2f4a28'; ctx.lineWidth = 2; ctx.stroke();
    ctx.strokeStyle = 'rgba(190,255,150,.55)'; ctx.lineWidth = 1;
    for (let i = -85; i < 90; i += 18) { ctx.beginPath(); ctx.moveTo(i, -14); ctx.lineTo(i + 6, 14); ctx.stroke(); }
    ctx.fillStyle = '#9ce98a';
    for (let i = -80; i < 90; i += 24) { ctx.beginPath(); ctx.arc(i, -16 - (i % 2 ? 2 : 0), 3, 0, Math.PI * 2); ctx.fill(); }
    ctx.restore();
  }
  ctx.restore();
}

export function drawSecretWall(ctx, o, t, state) {
  const open = state?.flags?.secret_ruins;
  ctx.save();
  ctx.translate(o.x, o.y);
  if (!open) {
    drawShadow(ctx, 0, 0, 62, 16, 0.3);
    ctx.fillStyle = '#48535e';
    rr(ctx, -58, -118, 116, 118, 2); ctx.fill();
    ctx.strokeStyle = 'rgba(15,20,28,.55)'; ctx.stroke();
    ctx.strokeStyle = 'rgba(20,26,32,.35)'; ctx.lineWidth = 1;
    for (let y = -100; y < 0; y += 26) { ctx.beginPath(); ctx.moveTo(-58, y); ctx.lineTo(58, y); ctx.stroke(); }
    for (let x = -30; x < 58; x += 29) { ctx.beginPath(); ctx.moveTo(x, -118); ctx.lineTo(x, 0); ctx.stroke(); }
    ctx.strokeStyle = 'rgba(10,14,20,.5)'; ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.moveTo(-20, -118); ctx.lineTo(-10, -78); ctx.lineTo(-24, -43); ctx.lineTo(-14, 0); ctx.stroke();
    // runa oculta
    ctx.strokeStyle = hexA('#b990ff', 0.35 + Math.sin(t * 2) * 0.1);
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(18, -66, 12, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(18, -78); ctx.lineTo(18, -54); ctx.moveTo(6, -66); ctx.lineTo(30, -66); ctx.stroke();
  } else {
    // hueco abierto
    ctx.fillStyle = 'rgba(3,5,12,.9)';
    rr(ctx, -58, -118, 116, 118, 2); ctx.fill();
    ctx.strokeStyle = 'rgba(120,150,190,.25)';
    ctx.strokeRect(-58, -118, 116, 118);
    ctx.fillStyle = 'rgba(185,144,255,.08)';
    ctx.beginPath(); ctx.ellipse(0, -40, 50, 60, 0, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}

export function drawAltar(ctx, o, t, state) {
  ctx.save();
  ctx.translate(o.x, o.y);
  drawShadow(ctx, 0, 0, 62, 20, 0.3);
  // escalones
  ctx.fillStyle = '#8a806e';
  rr(ctx, -54, -8, 108, 8, 2); ctx.fill();
  ctx.fillStyle = '#a69b82';
  rr(ctx, -42, -16, 84, 8, 2); ctx.fill();
  // pedestal
  const g = ctx.createLinearGradient(-28, -80, 28, -10);
  g.addColorStop(0, '#f7e7ae');
  g.addColorStop(0.5, '#c7ad6c');
  g.addColorStop(1, '#7d6740');
  ctx.fillStyle = g;
  rr(ctx, -24, -70, 48, 54, 4); ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,.3)'; ctx.stroke();
  // energía
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const lg = ctx.createRadialGradient(0, -94, 2, 0, -94, 92);
  lg.addColorStop(0, 'rgba(255,245,190,.5)');
  lg.addColorStop(0.5, 'rgba(255,220,120,.12)');
  lg.addColorStop(1, 'rgba(255,220,120,0)');
  ctx.fillStyle = lg;
  ctx.beginPath(); ctx.arc(0, -94, 92, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
  // espada
  const fy = -94 + Math.sin(t * 1.2) * 3;
  ctx.save();
  ctx.translate(0, fy);
  ctx.rotate(Math.sin(t * 0.5) * 0.04);
  ctx.fillStyle = '#fff7d8';
  ctx.shadowColor = '#ffe49b'; ctx.shadowBlur = 22;
  ctx.beginPath(); ctx.moveTo(0, -50); ctx.lineTo(7, -34); ctx.lineTo(5, 12); ctx.lineTo(-5, 12); ctx.lineTo(-7, -34); ctx.closePath(); ctx.fill();
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#d9b45c';
  rr(ctx, -18, 10, 36, 5, 2); ctx.fill();
  ctx.fillStyle = '#76522f';
  rr(ctx, -3, 15, 6, 20, 2); ctx.fill();
  ctx.fillStyle = '#ffe49b';
  ctx.beginPath(); ctx.arc(0, 38, 3, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
  // runas giratorias
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.strokeStyle = 'rgba(255,232,160,.45)'; ctx.lineWidth = 1.4;
  ctx.beginPath(); ctx.ellipse(0, -80, 52, 18, t * 0.2, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath(); ctx.ellipse(0, -80, 38, 13, -t * 0.3, 0, Math.PI * 2); ctx.stroke();
  ctx.restore();
  ctx.restore();
}

export function drawBarrier(ctx, o, t, state) {
  const flag = o.flag || 'celestial_seal';
  const open = state?.flags?.[flag];
  if (open) return;
  ctx.save();
  ctx.translate(o.x, o.y);
  const color = o.color || '#ffe49b';
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const g = ctx.createLinearGradient(0, -140, 0, 0);
  g.addColorStop(0, hexA(color, 0.05));
  g.addColorStop(0.5, hexA(color, 0.3));
  g.addColorStop(1, hexA(color, 0.15));
  ctx.fillStyle = g;
  rr(ctx, -56, -140, 112, 138, 8); ctx.fill();
  ctx.strokeStyle = hexA(color, 0.55); ctx.lineWidth = 1.5;
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    ctx.moveTo(-56 + i * 28, -138);
    ctx.lineTo(-70 + i * 30 + Math.sin(t + i) * 5, -2);
    ctx.stroke();
  }
  ctx.restore();
  // runas flotantes
  ctx.fillStyle = color;
  for (let i = 0; i < 7; i++) {
    const a = t * 0.5 + i * 0.9;
    ctx.globalAlpha = 0.4 + Math.sin(t * 2 + i) * 0.2;
    ctx.beginPath(); ctx.arc(Math.cos(a) * 40, -70 + Math.sin(a) * 60, 2, 0, Math.PI * 2); ctx.fill();
  }
  ctx.globalAlpha = 1;
  ctx.restore();
}

export function drawSign(ctx, o) {
  ctx.save();
  ctx.translate(o.x, o.y);
  drawShadow(ctx, 0, 0, 20, 7, 0.24);
  ctx.fillStyle = '#533a27';
  ctx.fillRect(-3, -56, 6, 56);
  ctx.fillStyle = '#7b5a3c';
  rr(ctx, -30, -76, 60, 32, 3); ctx.fill();
  ctx.strokeStyle = '#3d2a1e'; ctx.lineWidth = 1.5; ctx.stroke();
  ctx.fillStyle = '#e7d2a2';
  ctx.font = 'bold 9px Georgia, serif';
  ctx.textAlign = 'center';
  const lines = (o.text || 'SENDERO').split('|');
  lines.slice(0, 2).forEach((l, i) => ctx.fillText(l, 0, -62 + i * 11));
  ctx.restore();
}

export function drawBench(ctx, o) {
  ctx.save();
  ctx.translate(o.x, o.y);
  drawShadow(ctx, 0, 0, 30, 8, 0.22);
  ctx.fillStyle = '#6b4c31';
  rr(ctx, -32, -18, 64, 10, 2); ctx.fill();
  rr(ctx, -32, -34, 64, 7, 2); ctx.fill();
  ctx.fillStyle = '#4b3422';
  ctx.fillRect(-26, -8, 5, 8); ctx.fillRect(21, -8, 5, 8);
  ctx.fillRect(-26, -34, 4, 26); ctx.fillRect(22, -34, 4, 26);
  ctx.restore();
}

export function drawBarrel(ctx, o) {
  ctx.save();
  ctx.translate(o.x, o.y);
  drawShadow(ctx, 0, 0, 17, 6, 0.22);
  const g = ctx.createLinearGradient(-14, 0, 14, 0);
  g.addColorStop(0, '#5b3c27'); g.addColorStop(0.5, '#8d613b'); g.addColorStop(1, '#4e321f');
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.ellipse(0, -24, 14, 5, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillRect(-14, -24, 28, 24);
  ctx.beginPath(); ctx.ellipse(0, 0, 14, 5, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#b28a5e'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.ellipse(0, -24, 14, 5, 0, 0, Math.PI * 2); ctx.stroke();
  ctx.fillStyle = '#3c2c22';
  ctx.fillRect(-14, -18, 28, 2.5); ctx.fillRect(-14, -7, 28, 2.5);
  ctx.restore();
}

export function drawCrate(ctx, o) {
  ctx.save();
  ctx.translate(o.x, o.y);
  drawShadow(ctx, 0, 0, 18, 6, 0.22);
  ctx.fillStyle = '#7a5433';
  rr(ctx, -17, -30, 34, 30, 2); ctx.fill();
  ctx.strokeStyle = '#4b321e'; ctx.lineWidth = 1.5; ctx.stroke();
  ctx.strokeStyle = '#5d3f26'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(-17, -30); ctx.lineTo(17, 0); ctx.moveTo(17, -30); ctx.lineTo(-17, 0); ctx.stroke();
  ctx.restore();
}

export function drawNest(ctx, o) {
  ctx.save();
  ctx.translate(o.x, o.y);
  ctx.moveTo(0, 0);
  ctx.fillStyle = '#5d452b';
  ctx.beginPath(); ctx.ellipse(0, -8, 20, 8, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#8f6d43'; ctx.lineWidth = 1;
  for (let i = 0; i < 8; i++) { ctx.beginPath(); ctx.moveTo(-18 + i * 5, -8); ctx.lineTo(-14 + i * 5, -14); ctx.stroke(); }
  ctx.fillStyle = '#d9e7f0';
  ctx.beginPath(); ctx.ellipse(0, -10, 6, 4.5, 0, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

export function drawClock(ctx, o, t) {
  ctx.save();
  ctx.translate(o.x, o.y);
  ctx.fillStyle = '#4a3a2b';
  ctx.fillRect(-4, -92, 8, 92);
  ctx.fillStyle = '#f0e2bd';
  ctx.beginPath(); ctx.arc(0, -104, 20, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#5b4732'; ctx.lineWidth = 3; ctx.stroke();
  ctx.strokeStyle = '#3c2f22'; ctx.lineWidth = 1.5;
  const a = t * 0.1;
  ctx.beginPath(); ctx.moveTo(0, -104); ctx.lineTo(Math.cos(a) * 13, -104 + Math.sin(a) * 13); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(0, -104); ctx.lineTo(Math.cos(a * 12) * 8, -104 + Math.sin(a * 12) * 8); ctx.stroke();
  ctx.restore();
}
