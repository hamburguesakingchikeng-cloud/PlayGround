import { hexA, clamp } from './sprites.js';

function seedRandom(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function smoothPath(ctx, points) {
  if (!points.length) return;
  ctx.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length - 1; i++) {
    const xc = (points[i][0] + points[i + 1][0]) / 2;
    const yc = (points[i][1] + points[i + 1][1]) / 2;
    ctx.quadraticCurveTo(points[i][0], points[i][1], xc, yc);
  }
  const last = points[points.length - 1];
  ctx.lineTo(last[0], last[1]);
}

function pathStroke(ctx, path, color, extra = 0) {
  ctx.strokeStyle = color;
  ctx.lineWidth = path.width + extra;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  smoothPath(ctx, path.points);
  ctx.stroke();
}

function drawPaths(ctx, w, theme) {
  if (theme === 'village') {
    w.paths.forEach((p) => pathStroke(ctx, p, '#4f4b3d', 16));
    w.paths.forEach((p) => pathStroke(ctx, p, '#8f8067', 0));
    w.paths.forEach((p) => pathStroke(ctx, p, '#a39073', -14));
  } else if (theme === 'ruins') {
    w.paths.forEach((p) => pathStroke(ctx, p, '#171b25', 18));
    w.paths.forEach((p) => pathStroke(ctx, p, '#414653', 0));
    w.paths.forEach((p) => pathStroke(ctx, p, '#545a68', -15));
  } else if (theme === 'sanctuary') {
    w.paths.forEach((p) => pathStroke(ctx, p, 'rgba(255,238,170,.12)', 22));
    w.paths.forEach((p) => pathStroke(ctx, p, '#b9a978', 0));
    w.paths.forEach((p) => pathStroke(ctx, p, '#e2d19c', -15));
  } else {
    w.paths.forEach((p) => pathStroke(ctx, p, '#263421', 18));
    w.paths.forEach((p) => pathStroke(ctx, p, '#6d5a3e', 0));
    w.paths.forEach((p) => pathStroke(ctx, p, '#7e6849', -16));
  }
}

function drawRiver(ctx, w, water, rng) {
  const x = water.x, width = water.w;
  // orillas
  ctx.fillStyle = '#2d3b2b';
  ctx.beginPath();
  ctx.moveTo(x - width / 2 - 22, 0);
  for (let y = 0; y <= w.h; y += 90) {
    ctx.lineTo(x - width / 2 - 22 + Math.sin(y * 0.013) * 13, y);
  }
  ctx.lineTo(x + width / 2 + 22, w.h);
  for (let y = w.h; y >= 0; y -= 90) {
    ctx.lineTo(x + width / 2 + 22 + Math.sin(y * 0.011 + 2) * 12, y);
  }
  ctx.closePath();
  ctx.fill();
  // agua
  const g = ctx.createLinearGradient(x - width / 2, 0, x + width / 2, 0);
  g.addColorStop(0, '#1f5060');
  g.addColorStop(0.25, '#2f7f96');
  g.addColorStop(0.5, '#79c9d8');
  g.addColorStop(0.7, '#2f7f96');
  g.addColorStop(1, '#173f50');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(x - width / 2, 0);
  for (let y = 0; y <= w.h; y += 60) {
    ctx.lineTo(x - width / 2 + Math.sin(y * 0.013) * 14, y);
  }
  ctx.lineTo(x + width / 2, w.h);
  for (let y = w.h; y >= 0; y -= 60) {
    ctx.lineTo(x + width / 2 + Math.sin(y * 0.011 + 2) * 10, y);
  }
  ctx.closePath();
  ctx.fill();
  // ondas
  ctx.strokeStyle = 'rgba(205,250,255,.28)';
  ctx.lineWidth = 1.2;
  for (let i = 0; i < 65; i++) {
    const yy = rng() * w.h;
    const xx = x - width * 0.36 + rng() * width * 0.72;
    ctx.beginPath();
    ctx.ellipse(xx, yy, 8 + rng() * 18, 1.5 + rng() * 1.5, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  // espuma en orillas
  ctx.strokeStyle = 'rgba(220,255,255,.18)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  for (let y = 0; y <= w.h; y += 30) {
    const xx = x - width / 2 + Math.sin(y * 0.013) * 14;
    if (y === 0) ctx.moveTo(xx, y); else ctx.lineTo(xx + Math.sin(y * 0.2) * 3, y);
  }
  ctx.stroke();
  // puente
  if (water.bridgeY) {
    const by = water.bridgeY;
    const bw = water.bridgeW || 220;
    ctx.save();
    ctx.translate(x, by);
    // sombra
    ctx.fillStyle = 'rgba(5,10,14,.35)';
    ctx.beginPath(); ctx.ellipse(0, 10, bw / 2 + 8, 58, 0, 0, Math.PI * 2); ctx.fill();
    // tablones
    ctx.fillStyle = '#64452c';
    ctx.beginPath(); ctx.roundRect ? ctx.roundRect(-bw / 2, -58, bw, 116, 7) : ctx.rect(-bw / 2, -58, bw, 116); ctx.fill();
    ctx.strokeStyle = '#34231a'; ctx.lineWidth = 2; ctx.stroke();
    for (let i = 0; i < 10; i++) {
      const yy = -58 + i * 12;
      ctx.fillStyle = i % 2 ? '#7b5432' : '#6f4b2d';
      ctx.fillRect(-bw / 2 + 5, yy, bw - 10, 9);
      ctx.fillStyle = 'rgba(230,190,130,.16)';
      ctx.fillRect(-bw / 2 + 5, yy + 1, bw - 10, 1.2);
    }
    // cuerdas
    ctx.strokeStyle = '#b89962'; ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-bw / 2 + 8, -58); ctx.lineTo(bw / 2 - 8, -58);
    ctx.moveTo(-bw / 2 + 8, 58); ctx.lineTo(bw / 2 - 8, 58);
    ctx.stroke();
    ctx.restore();
  }
}

function drawPlaza(ctx, w, rng) {
  const p = w.plaza;
  if (!p) return;
  const g = ctx.createRadialGradient(p.x, p.y, 10, p.x, p.y, p.rx);
  g.addColorStop(0, '#b6a382');
  g.addColorStop(0.7, '#95846b');
  g.addColorStop(1, '#766853');
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.ellipse(p.x, p.y, p.rx, p.ry, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#5c5242'; ctx.lineWidth = 6;
  ctx.beginPath(); ctx.ellipse(p.x, p.y, p.rx - 8, p.ry - 6, 0, 0, Math.PI * 2); ctx.stroke();
  // piedras
  ctx.strokeStyle = 'rgba(74,64,52,.4)'; ctx.lineWidth = 1;
  for (let i = 0; i < 80; i++) {
    const a = rng() * Math.PI * 2;
    const r = Math.sqrt(rng());
    const x = p.x + Math.cos(a) * p.rx * r;
    const y = p.y + Math.sin(a) * p.ry * r;
    const s = 4 + rng() * 12;
    ctx.beginPath();
    ctx.ellipse(x, y, s, s * 0.45, a, 0, Math.PI * 2);
    ctx.stroke();
  }
  // círculos decorativos
  ctx.strokeStyle = 'rgba(242,218,170,.18)';
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.ellipse(p.x, p.y, p.rx * 0.58, p.ry * 0.58, 0, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath(); ctx.ellipse(p.x, p.y, p.rx * 0.28, p.ry * 0.28, 0, 0, Math.PI * 2); ctx.stroke();
}

function drawArena(ctx, w, rng) {
  const a = w.arena;
  if (!a) return;
  ctx.save();
  const g = ctx.createRadialGradient(a.x, a.y, 10, a.x, a.y, a.r);
  g.addColorStop(0, '#4a4656');
  g.addColorStop(0.7, '#35323f');
  g.addColorStop(1, '#25232e');
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = 'rgba(180,150,230,.35)'; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.arc(a.x, a.y, a.r - 9, 0, Math.PI * 2); ctx.stroke();
  ctx.strokeStyle = 'rgba(20,18,28,.4)'; ctx.lineWidth = 1.4;
  for (let r = 40; r < a.r; r += 48) {
    ctx.beginPath(); ctx.arc(a.x, a.y, r, 0, Math.PI * 2); ctx.stroke();
  }
  for (let i = 0; i < 16; i++) {
    const ang = i * Math.PI / 8;
    ctx.beginPath();
    ctx.moveTo(a.x + Math.cos(ang) * 42, a.y + Math.sin(ang) * 42);
    ctx.lineTo(a.x + Math.cos(ang) * (a.r - 18), a.y + Math.sin(ang) * (a.r - 18));
    ctx.stroke();
  }
  // runas
  ctx.strokeStyle = 'rgba(185,144,255,.3)'; ctx.lineWidth = 2;
  for (let i = 0; i < 8; i++) {
    const ang = i * Math.PI / 4;
    const x = a.x + Math.cos(ang) * 150;
    const y = a.y + Math.sin(ang) * 130;
    ctx.beginPath(); ctx.arc(x, y, 18, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x - 10, y); ctx.lineTo(x + 10, y); ctx.moveTo(x, y - 10); ctx.lineTo(x, y + 10); ctx.stroke();
  }
  // grietas
  ctx.strokeStyle = 'rgba(10,8,15,.5)'; ctx.lineWidth = 1.4;
  for (let i = 0; i < 10; i++) {
    let x = a.x + (rng() - 0.5) * a.r * 1.2;
    let y = a.y + (rng() - 0.5) * a.r * 1.2;
    ctx.beginPath(); ctx.moveTo(x, y);
    for (let j = 0; j < 4; j++) {
      x += (rng() - 0.5) * 45; y += (rng() - 0.5) * 45;
      ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  ctx.restore();
}

function drawForestGround(ctx, w, rng) {
  const g = ctx.createLinearGradient(0, 0, w.w, w.h);
  g.addColorStop(0, '#203b2e');
  g.addColorStop(0.45, '#294b36');
  g.addColorStop(1, '#173126');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w.w, w.h);
  // parches
  for (let i = 0; i < 230; i++) {
    const x = rng() * w.w, y = rng() * w.h, r = 18 + rng() * 85;
    ctx.fillStyle = `rgba(${35 + (i % 30)},${75 + (i % 40)},${50 + (i % 25)},${0.06 + rng() * 0.12})`;
    ctx.beginPath(); ctx.ellipse(x, y, r, r * (0.4 + rng() * 0.4), rng() * Math.PI, 0, Math.PI * 2); ctx.fill();
  }
  // hierba
  ctx.strokeStyle = 'rgba(91,135,83,.24)'; ctx.lineWidth = 1;
  for (let i = 0; i < 900; i++) {
    const x = rng() * w.w, y = rng() * w.h;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + (rng() - 0.5) * 5, y - 3 - rng() * 5); ctx.stroke();
  }
  drawPaths(ctx, w, 'forest');
  if (w.waters) w.waters.forEach((water) => drawRiver(ctx, w, water, rng));
  // flores y hongos
  for (let i = 0; i < 160; i++) {
    const x = rng() * w.w, y = rng() * w.h;
    const colors = ['#ffd36e', '#b8a2ff', '#ff9ab0', '#a9f1d6'];
    ctx.fillStyle = colors[i % colors.length];
    ctx.globalAlpha = 0.35 + rng() * 0.4;
    ctx.beginPath(); ctx.arc(x, y, 1.2 + rng() * 1.8, 0, Math.PI * 2); ctx.fill();
  }
  ctx.globalAlpha = 1;
  // hojarasca
  for (let i = 0; i < 170; i++) {
    const x = rng() * w.w, y = rng() * w.h;
    ctx.fillStyle = i % 2 ? 'rgba(145,101,55,.28)' : 'rgba(191,145,79,.2)';
    ctx.beginPath(); ctx.ellipse(x, y, 2 + rng() * 3, 1 + rng() * 1.4, rng() * Math.PI, 0, Math.PI * 2); ctx.fill();
  }
  // claros con luz
  w.clearings.forEach((c) => {
    const cg = ctx.createRadialGradient(c.x, c.y, 2, c.x, c.y, c.r);
    cg.addColorStop(0, 'rgba(210,235,160,.12)');
    cg.addColorStop(1, 'rgba(210,235,160,0)');
    ctx.fillStyle = cg;
    ctx.beginPath(); ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2); ctx.fill();
  });
}

function drawVillageGround(ctx, w, rng) {
  const g = ctx.createLinearGradient(0, 0, 0, w.h);
  g.addColorStop(0, '#38583f');
  g.addColorStop(0.55, '#4f6e4c');
  g.addColorStop(1, '#304c39');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w.w, w.h);
  for (let i = 0; i < 200; i++) {
    const x = rng() * w.w, y = rng() * w.h, r = 15 + rng() * 80;
    ctx.fillStyle = `rgba(${60 + (i % 20)},${105 + (i % 30)},${65 + (i % 25)},${0.06 + rng() * 0.1})`;
    ctx.beginPath(); ctx.ellipse(x, y, r, r * 0.55, rng() * Math.PI, 0, Math.PI * 2); ctx.fill();
  }
  // caminos
  drawPaths(ctx, w, 'village');
  drawPlaza(ctx, w, rng);
  // jardines parcelas
  const gardens = [[330, 900, 120, 55], [1640, 980, 130, 60], [760, 300, 130, 50], [1720, 380, 100, 45]];
  gardens.forEach(([x, y, rx, ry], gi) => {
    ctx.fillStyle = '#5b4830';
    ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#806542'; ctx.lineWidth = 2; ctx.stroke();
    for (let i = 0; i < 16; i++) {
      ctx.fillStyle = gi % 2 ? '#83b35d' : '#6f9e54';
      ctx.beginPath();
      ctx.ellipse(x - rx * 0.7 + rng() * rx * 1.4, y - ry * 0.5 + rng() * ry, 4, 2, rng() * Math.PI, 0, Math.PI * 2);
      ctx.fill();
      if (i % 4 === 0) {
        ctx.fillStyle = ['#ffcf6e', '#ff8b9e', '#c08bff'][gi % 3];
        ctx.beginPath(); ctx.arc(x - rx * 0.7 + rng() * rx * 1.4, y - ry * 0.5 + rng() * ry, 2.5, 0, Math.PI * 2); ctx.fill();
      }
    }
  });
  // flores
  for (let i = 0; i < 250; i++) {
    const x = rng() * w.w, y = rng() * w.h;
    ctx.fillStyle = ['#ffd36e', '#ff9ab0', '#c7a6ff', '#fff3cb'][i % 4];
    ctx.globalAlpha = 0.28 + rng() * 0.5;
    ctx.beginPath(); ctx.arc(x, y, 1.2 + rng() * 2, 0, Math.PI * 2); ctx.fill();
  }
  ctx.globalAlpha = 1;
  // adoquines sueltos
  ctx.strokeStyle = 'rgba(80,70,55,.2)'; ctx.lineWidth = 1;
  for (let i = 0; i < 100; i++) {
    const x = rng() * w.w, y = rng() * w.h;
    ctx.beginPath(); ctx.ellipse(x, y, 3 + rng() * 5, 2 + rng() * 2, rng() * Math.PI, 0, Math.PI * 2); ctx.stroke();
  }
}

function drawRuinsGround(ctx, w, rng) {
  const g = ctx.createLinearGradient(0, 0, w.w, w.h);
  g.addColorStop(0, '#1f2230');
  g.addColorStop(0.5, '#2b2b3d');
  g.addColorStop(1, '#181b28');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w.w, w.h);
  // tierra
  for (let i = 0; i < 220; i++) {
    const x = rng() * w.w, y = rng() * w.h, r = 15 + rng() * 90;
    ctx.fillStyle = `rgba(${52 + (i % 18)},${52 + (i % 24)},${70 + (i % 30)},${0.05 + rng() * 0.09})`;
    ctx.beginPath(); ctx.ellipse(x, y, r, r * 0.5, rng() * Math.PI, 0, Math.PI * 2); ctx.fill();
  }
  drawPaths(ctx, w, 'ruins');
  drawArena(ctx, w, rng);
  // losas sueltas
  ctx.strokeStyle = 'rgba(125,130,150,.2)'; ctx.lineWidth = 1.2;
  for (let i = 0; i < 90; i++) {
    const x = rng() * w.w, y = rng() * w.h;
    const sw = 8 + rng() * 24, sh = 5 + rng() * 10;
    ctx.strokeRect(x, y, sw, sh);
  }
  // escombros
  for (let i = 0; i < 150; i++) {
    const x = rng() * w.w, y = rng() * w.h, r = 2 + rng() * 8;
    ctx.fillStyle = 'rgba(91,96,112,.4)';
    ctx.beginPath(); ctx.ellipse(x, y, r, r * 0.6, rng() * Math.PI, 0, Math.PI * 2); ctx.fill();
  }
  // musgo
  for (let i = 0; i < 70; i++) {
    const x = rng() * w.w, y = rng() * w.h, r = 8 + rng() * 26;
    ctx.fillStyle = `rgba(67,104,74,${0.07 + rng() * 0.12})`;
    ctx.beginPath(); ctx.ellipse(x, y, r, r * 0.45, rng() * Math.PI, 0, Math.PI * 2); ctx.fill();
  }
  // niebla mágica
  for (let i = 0; i < 16; i++) {
    const x = rng() * w.w, y = rng() * w.h, r = 80 + rng() * 150;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const fg = ctx.createRadialGradient(x, y, 2, x, y, r);
    fg.addColorStop(0, 'rgba(120,90,180,.035)');
    fg.addColorStop(1, 'rgba(120,90,180,0)');
    ctx.fillStyle = fg;
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }
}

function drawSanctuaryGround(ctx, w, rng) {
  // cosmos
  const sky = ctx.createLinearGradient(0, 0, w.w, w.h);
  sky.addColorStop(0, '#070b1c');
  sky.addColorStop(0.45, '#101833');
  sky.addColorStop(1, '#0b0d20');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w.w, w.h);
  // estrellas
  for (let i = 0; i < 700; i++) {
    const x = rng() * w.w, y = rng() * w.h;
    const alpha = 0.2 + rng() * 0.75;
    ctx.fillStyle = `rgba(${i % 9 === 0 ? '255,230,170' : '190,220,255'},${alpha})`;
    ctx.beginPath(); ctx.arc(x, y, i % 23 === 0 ? 1.5 : 0.7, 0, Math.PI * 2); ctx.fill();
  }
  // nebulosa
  for (let i = 0; i < 5; i++) {
    const x = rng() * w.w, y = rng() * w.h, r = 200 + rng() * 380;
    const ng = ctx.createRadialGradient(x, y, 2, x, y, r);
    ng.addColorStop(0, i % 2 ? 'rgba(110,80,180,.06)' : 'rgba(60,150,190,.05)');
    ng.addColorStop(1, 'rgba(40,80,160,0)');
    ctx.fillStyle = ng;
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  }
  // isla
  const p = w.platform;
  ctx.save();
  ctx.shadowColor = 'rgba(255,240,180,.35)'; ctx.shadowBlur = 30;
  const pg = ctx.createRadialGradient(p.x - 180, p.y - 180, 20, p.x, p.y, p.rx);
  pg.addColorStop(0, '#d5c68d');
  pg.addColorStop(0.55, '#8f8566');
  pg.addColorStop(1, '#595a59');
  ctx.fillStyle = pg;
  ctx.beginPath(); ctx.ellipse(p.x, p.y, p.rx, p.ry, 0, 0, Math.PI * 2); ctx.fill();
  ctx.shadowBlur = 0;
  ctx.strokeStyle = 'rgba(255,242,190,.6)'; ctx.lineWidth = 4; ctx.stroke();
  // borde irregular
  ctx.strokeStyle = 'rgba(30,32,44,.8)'; ctx.lineWidth = 10;
  ctx.beginPath();
  for (let i = 0; i <= 80; i++) {
    const a = i / 80 * Math.PI * 2;
    const r = 1 + Math.sin(a * 9) * 0.012 + Math.cos(a * 13) * 0.009;
    const x = p.x + Math.cos(a) * p.rx * r;
    const y = p.y + Math.sin(a) * p.ry * r;
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.closePath(); ctx.stroke();
  // suelo de piedra
  const floor = ctx.createRadialGradient(p.x, p.y, 50, p.x, p.y, p.rx * 0.85);
  floor.addColorStop(0, 'rgba(206,193,146,.3)');
  floor.addColorStop(1, 'rgba(90,94,87,0)');
  ctx.fillStyle = floor;
  ctx.beginPath(); ctx.ellipse(p.x, p.y, p.rx * 0.82, p.ry * 0.82, 0, 0, Math.PI * 2); ctx.fill();
  // anillos
  ctx.strokeStyle = 'rgba(255,239,177,.22)'; ctx.lineWidth = 2;
  for (let i = 1; i < 5; i++) {
    ctx.beginPath(); ctx.ellipse(p.x, p.y, p.rx * 0.2 * i, p.ry * 0.2 * i, 0, 0, Math.PI * 2); ctx.stroke();
  }
  // losas
  ctx.strokeStyle = 'rgba(68,66,56,.25)'; ctx.lineWidth = 1;
  for (let i = 0; i < 16; i++) {
    const ang = i * Math.PI / 8;
    ctx.beginPath();
    ctx.moveTo(p.x + Math.cos(ang) * 100, p.y + Math.sin(ang) * 80);
    ctx.lineTo(p.x + Math.cos(ang) * p.rx * 0.8, p.y + Math.sin(ang) * p.ry * 0.8);
    ctx.stroke();
  }
  ctx.restore();
  drawPaths(ctx, w, 'sanctuary');
  // nubes bajo la isla
  for (let i = 0; i < 10; i++) {
    const x = rng() * w.w, y = p.y + p.ry * 0.5 + rng() * 260;
    const cg = ctx.createRadialGradient(x, y, 2, x, y, 160);
    cg.addColorStop(0, 'rgba(150,180,230,.05)');
    cg.addColorStop(1, 'rgba(150,180,230,0)');
    ctx.fillStyle = cg;
    ctx.beginPath(); ctx.arc(x, y, 160, 0, Math.PI * 2); ctx.fill();
  }
  // flores celestiales
  for (let i = 0; i < 120; i++) {
    const a = rng() * Math.PI * 2;
    const r = Math.sqrt(rng()) * 0.78;
    const x = p.x + Math.cos(a) * p.rx * r;
    const y = p.y + Math.sin(a) * p.ry * r;
    ctx.fillStyle = i % 3 ? 'rgba(255,242,180,.4)' : 'rgba(160,230,255,.4)';
    ctx.beginPath(); ctx.arc(x, y, 1 + rng() * 1.5, 0, Math.PI * 2); ctx.fill();
  }
}

export function renderGround(w) {
  const canvas = document.createElement('canvas');
  canvas.width = w.w;
  canvas.height = w.h;
  const ctx = canvas.getContext('2d');
  const rng = seedRandom((w.zoneId.length * 7919 + 1337) >>> 0);
  if (w.groundTheme === 'village') drawVillageGround(ctx, w, rng);
  else if (w.groundTheme === 'ruins') drawRuinsGround(ctx, w, rng);
  else if (w.groundTheme === 'sanctuary') drawSanctuaryGround(ctx, w, rng);
  else drawForestGround(ctx, w, rng);
  // viñeta de terreno
  const vg = ctx.createRadialGradient(w.w / 2, w.h / 2, Math.min(w.w, w.h) * 0.25, w.w / 2, w.h / 2, Math.max(w.w, w.h) * 0.72);
  vg.addColorStop(0, 'rgba(0,0,0,0)');
  vg.addColorStop(1, 'rgba(0,0,0,.22)');
  ctx.fillStyle = vg;
  ctx.fillRect(0, 0, w.w, w.h);
  w.groundCanvas = canvas;
}

export function drawAmbient(w, ctx, t, camera) {
  const theme = w.groundTheme;
  const colors = theme === 'ruins' ? ['#b990ff', '#8ce7ff', '#ffd47a']
    : theme === 'sanctuary' ? ['#fff1b8', '#8ce7ff', '#ffffff']
    : theme === 'village' ? ['#ffd36e', '#ffb47e', '#a9f1d6']
    : ['#ffe49b', '#a9f1d6', '#ffb47e'];
  ctx.save();
  for (const m of w.motes) {
    if (m.x < camera.x - 60 || m.x > camera.x + camera.w + 60 || m.y < camera.y - 60 || m.y > camera.y + camera.h + 60) continue;
    const px = m.x + Math.sin(t * m.speed + m.phase) * m.drift;
    const py = m.y + Math.cos(t * m.speed * 0.7 + m.phase) * m.drift * 0.6;
    const a = 0.2 + Math.abs(Math.sin(t * m.speed * 2 + m.phase)) * 0.6;
    ctx.globalCompositeOperation = 'lighter';
    const g = ctx.createRadialGradient(px, py, 0, px, py, m.r * 6);
    g.addColorStop(0, hexA(colors[m.color % colors.length], a));
    g.addColorStop(1, hexA(colors[m.color % colors.length], 0));
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(px, py, m.r * 6, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = hexA(colors[m.color % colors.length], Math.min(1, a + 0.12));
    ctx.beginPath(); ctx.arc(px, py, m.r, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}

export function drawAtmosphere(w, ctx, t, camera) {
  const theme = w.groundTheme;
  if (theme === 'forest') {
    // rayos de luz
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 3; i++) {
      const x = 250 + i * 420 + Math.sin(t * 0.06 + i) * 30;
      const g = ctx.createLinearGradient(x, 0, x + 200, camera.h);
      g.addColorStop(0, 'rgba(255,236,180,.035)');
      g.addColorStop(1, 'rgba(255,236,180,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.moveTo(x, 0); ctx.lineTo(x + 160, 0); ctx.lineTo(x + 380, camera.h); ctx.lineTo(x + 190, camera.h); ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  } else if (theme === 'village') {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const g = ctx.createLinearGradient(0, 0, 0, camera.h);
    g.addColorStop(0, 'rgba(255,170,90,.035)');
    g.addColorStop(0.55, 'rgba(255,190,120,.015)');
    g.addColorStop(1, 'rgba(20,30,60,.1)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, camera.w, camera.h);
    ctx.restore();
  } else if (theme === 'ruins') {
    // niebla en pantalla
    ctx.save();
    for (let i = 0; i < 4; i++) {
      const y = camera.h * (0.45 + i * 0.13) + Math.sin(t * 0.12 + i * 1.7) * 20;
      const x = camera.x * 0.08 + Math.sin(t * 0.08 + i * 2.1) * 60;
      const g = ctx.createLinearGradient(0, y - 60, 0, y + 80);
      g.addColorStop(0, 'rgba(150,125,210,0)');
      g.addColorStop(0.5, `rgba(150,125,210,${0.02 + i * 0.006})`);
      g.addColorStop(1, 'rgba(150,125,210,0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, y - 60, camera.w, 140);
    }
    ctx.restore();
  } else if (theme === 'sanctuary') {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 2; i++) {
      const g = ctx.createLinearGradient(0, 0, 0, camera.h);
      g.addColorStop(0, 'rgba(255,240,180,.04)');
      g.addColorStop(1, 'rgba(140,200,255,0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, camera.w, camera.h);
    }
    ctx.restore();
  }
  // viñeta cinematográfica
  const vg = ctx.createRadialGradient(camera.w / 2, camera.h / 2, Math.min(camera.w, camera.h) * 0.32, camera.w / 2, camera.h / 2, Math.max(camera.w, camera.h) * 0.72);
  vg.addColorStop(0, 'rgba(0,0,0,0)');
  vg.addColorStop(0.75, 'rgba(2,5,12,.13)');
  vg.addColorStop(1, 'rgba(2,5,12,.42)');
  ctx.fillStyle = vg;
  ctx.fillRect(0, 0, camera.w, camera.h);
}
