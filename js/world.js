/* Mundo: mapas, movimiento, cámara, objetos y controles táctiles */
(function () {
  const EG = window.EG;
  const TILE = 16;

  const DIRS = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };

  const world = {
    mapId: null,
    map: null,
    zoom: 3,
    camX: 0,
    camY: 0,
    time: 0,
    banner: 0,
    player: null,
    touch: false,

    enter(zone, tx, ty, dir) {
      const map = EG.maps[zone];
      if (!map) return;
      this.mapId = zone;
      this.map = map;
      const st = EG.game.state;
      st.zone = zone;
      st.tx = tx;
      st.ty = ty;
      st.dir = dir || 'down';
      this.player = {
        tx, ty, dir: dir || 'down',
        px: tx * TILE, py: ty * TILE,
        moving: false, fromX: 0, fromY: 0, toX: 0, toY: 0, t: 0, dur: 0.135,
        cooldown: 0, anim: 0, animT: 0,
      };
      this.banner = 2.4;
      this.snapCamera();
      EG.game.state.stepsSinceBattle = 0;
      EG.Audio.music(map.bgm);
      if (EG.game.autoSaveOnEnter) {
        EG.game.autoSaveOnEnter = false;
      }
    },

    snapCamera() {
      this.updateCamera(1);
    },

    updateCamera() {
      const W = EG.UI.W, H = EG.UI.H;
      const z = this.zoom;
      const viewW = W / z, viewH = H / z;
      const mapW = this.map.w * TILE, mapH = this.map.h * TILE;
      const p = this.player;
      let cx = p.px + 8 - viewW / 2;
      let cy = p.py + 12 - viewH * 0.44;
      if (mapW <= viewW) cx = (mapW - viewW) / 2;
      else cx = EG.clamp(cx, 0, mapW - viewW);
      if (mapH <= viewH) cy = (mapH - viewH) / 2;
      else cy = EG.clamp(cy, 0, mapH - viewH);
      this.camX = cx;
      this.camY = cy;
    },

    computeZoom() {
      const W = EG.UI.W, H = EG.UI.H;
      const base = EG.clamp(Math.round(Math.min(W / 230, H / 175)), 2, 4);
      if (!this.map) return base;
      const fit = Math.max(Math.ceil(W / (this.map.w * TILE)), Math.ceil(H / (this.map.h * TILE)));
      return EG.clamp(Math.max(base, fit), 2, 4);
    },

    npcHidden(n) {
      const f = EG.game.state && EG.game.state.flags;
      if (!f) return false;
      if (n.id === 'lyra_web' && f.lyra_join) return true;
      if (n.id === 'brann' && f.brann_join) return true;
      return false;
    },

    blockerAt(x, y) {
      if (!this.map) return true;
      if (EG.mapUtil.isSolid(this.map, x, y)) return true;
      const m = this.map;
      for (const n of m.npcs || []) if (!this.npcHidden(n) && n.x === x && n.y === y) return true;
      for (const c of m.chests || []) if (c.x === x && c.y === y) return true;
      for (const s of m.signs || []) if (s.x === x && s.y === y) return true;
      return false;
    },

    tryStep(dir) {
      const p = this.player;
      if (p.moving) return;
      p.dir = dir;
      const [dx, dy] = DIRS[dir];
      const nx = p.tx + dx, ny = p.ty + dy;
      if (this.blockerAt(nx, ny)) {
        p.animT = 0.18;
        return;
      }
      p.moving = true;
      p.t = 0;
      p.fromX = p.px;
      p.fromY = p.py;
      p.toX = nx * TILE;
      p.toY = ny * TILE;
      p.tx = nx;
      p.ty = ny;
      p.animT = 0.3;
      EG.Audio.sfx('step');
    },

    arrive() {
      const p = this.player;
      p.moving = false;
      p.px = p.tx * TILE;
      p.py = p.ty * TILE;
      const st = EG.game.state;
      st.tx = p.tx;
      st.ty = p.ty;
      st.dir = p.dir;

      // flores recogibles
      const flower = (this.map.flowers || []).find((f) => f.x === p.tx && f.y === p.ty && !st.collected[f.id]);
      if (flower) {
        st.collected[flower.id] = true;
        EG.game.addItem('flor_lunar', 1);
        EG.Audio.sfx('coin');
        EG.UI.showToast('Has recogido una Flor lunar (' + EG.game.countItem('flor_lunar') + '/3)', 'gold');
        EG.story.checkFlowers();
        return;
      }

      // portales
      const portal = (this.map.portals || []).find((q) => p.tx >= q.x && p.tx < q.x + q.w && p.ty >= q.y && p.ty < q.y + q.h);
      if (portal) {
        if (portal.need && !EG.game.portalUnlocked(portal)) {
          EG.game.revertStep();
          if (portal.lockedText) EG.story.say('', portal.lockedText);
          EG.Audio.sfx('cancel');
          return;
        }
        EG.Audio.sfx('portal');
        EG.game.travel(portal.to, portal.tx, portal.ty);
        return;
      }

      // triggers
      const trig = (this.map.triggers || []).find((q) => !st.triggers[q.id] && p.tx >= q.x && p.tx < q.x + q.w && p.ty >= q.y && p.ty < q.y + q.h);
      if (trig) {
        EG.story.runTrigger(trig.script, trig);
        return;
      }

      // encuentros
      const enc = this.map.encounters;
      if (enc && enc.tiles.includes(EG.mapUtil.charAt(this.map, p.tx, p.ty)) && !this.map.safe) {
        st.stepsSinceBattle++;
        if (st.stepsSinceBattle > 4 && Math.random() < enc.rate) {
          st.stepsSinceBattle = 0;
          EG.game.startEncounter(enc);
        }
      }
    },

    facingTile() {
      const p = this.player;
      const [dx, dy] = DIRS[p.dir];
      return { x: p.tx + dx, y: p.ty + dy };
    },

    interact() {
      const p = this.player;
      const f = this.facingTile();
      const m = this.map;
      const npc = (m.npcs || []).find((n) => !this.npcHidden(n) && n.x === f.x && n.y === f.y);
      if (npc) {
        EG.Audio.sfx('select');
        EG.story.talk(npc.id, npc);
        return true;
      }
      const sign = (m.signs || []).find((s) => s.x === f.x && s.y === f.y);
      if (sign) {
        EG.Audio.sfx('select');
        EG.story.say('', sign.text);
        return true;
      }
      const chest = (m.chests || []).find((c) => c.x === f.x && c.y === f.y);
      if (chest) {
        EG.game.openChest(chest);
        return true;
      }
      // también permite leer un cofre/letrero apuntando con el jugador encima
      const npcHere = (m.npcs || []).find((n) => !this.npcHidden(n) && n.x === p.tx && n.y === p.ty);
      if (npcHere) { EG.story.talk(npcHere.id, npcHere); return true; }
      return false;
    },

    nearInteractable() {
      const f = this.facingTile();
      const m = this.map;
      if (!m) return false;
      return (m.npcs || []).some((n) => !this.npcHidden(n) && n.x === f.x && n.y === f.y)
        || (m.signs || []).some((s) => s.x === f.x && s.y === f.y)
        || (m.chests || []).some((c) => c.x === f.x && c.y === f.y);
    },

    /* ------------------------------- CONTROLES ------------------------------- */

    layout() {
      const W = EG.UI.W, H = EG.UI.H;
      const s = Math.round(EG.clamp(W * 0.115, 38, 56));
      const cx = 14 + s * 1.5;
      const cy = H - 16 - s * 1.5;
      const r = Math.round(EG.clamp(Math.min(W, H) * 0.095, 26, 40));
      return {
        s,
        pad: {
          up: { x: cx - s / 2, y: cy - s * 1.5, w: s, h: s },
          down: { x: cx - s / 2, y: cy + s * 0.5, w: s, h: s },
          left: { x: cx - s * 1.5, y: cy - s / 2, w: s, h: s },
          right: { x: cx + s * 0.5, y: cy - s / 2, w: s, h: s },
        },
        a: { x: W - 20 - r * 2, y: H - 34 - r * 2, w: r * 2, h: r * 2, r },
        b: { x: W - 26 - r * 3.4, y: H - 30 - r * 1.5, w: r * 1.5, h: r * 1.5, r: r * 0.75 },
        menu: { x: W - 48, y: 12, w: 36, h: 36 },
      };
    },

    heldDir() {
      const kb = EG.Input.heldDirection();
      if (kb) return kb;
      if (!this.touch) return null;
      const L = this.layout();
      const order = ['up', 'down', 'left', 'right'];
      for (const d of order) {
        if (EG.Input.heldIn(L.pad[d])) return d;
      }
      return null;
    },

    /* -------------------------------- UPDATE -------------------------------- */

    update(dt) {
      if (EG.game.overlays.length) return;
      this.time += dt;
      this.zoom = this.computeZoom();
      if (!this.map) return;
      const W = EG.UI.W, H = EG.UI.H;
      this.touch = EG.game.touchUI;
      this.banner = Math.max(0, this.banner - dt);

      const p = this.player;
      p.animT = Math.max(0, p.animT - dt);
      p.cooldown = Math.max(0, p.cooldown - dt);

      if (EG.Input.pressed('menu') || EG.Input.pressed('back')) {
        EG.Audio.sfx('select');
        EG.game.openFieldMenu();
        return;
      }

      if (EG.Input.pressed('ok')) {
        this.interact();
        return;
      }

      if (p.moving) {
        p.t += dt / p.dur;
        if (p.t >= 1) {
          p.t = 1;
          p.px = p.toX;
          p.py = p.toY;
          p.anim = 0;
          this.arrive();
        } else {
          p.px = EG.lerp(p.fromX, p.toX, p.t);
          p.py = EG.lerp(p.fromY, p.toY, p.t);
        }
      } else {
        const dir = this.heldDir();
        if (dir && p.cooldown <= 0) this.tryStep(dir);
      }

      this.updateCamera();
      EG.game.state.playtime += dt;
    },

    /* --------------------------------- DRAW --------------------------------- */

    draw() {
      const ctx = EG.UI.ctx;
      const W = EG.UI.W, H = EG.UI.H;
      const z = this.zoom;
      ctx.save();
      ctx.fillStyle = '#0a0f18';
      ctx.fillRect(0, 0, W, H);
      ctx.save();
      ctx.translate(-Math.round(this.camX * z), -Math.round(this.camY * z));
      ctx.scale(z, z);

      const viewW = W / z, viewH = H / z;
      const x0 = Math.max(0, Math.floor(this.camX / TILE) - 1);
      const y0 = Math.max(0, Math.floor(this.camY / TILE) - 1);
      const x1 = Math.min(this.map.w - 1, Math.ceil((this.camX + viewW) / TILE) + 1);
      const y1 = Math.min(this.map.h - 1, Math.ceil((this.camY + viewH) / TILE) + 1);
      const waterFrame = Math.floor(this.time * 1.8) % 2;
      const tiles = EG.art.tiles;

      for (let y = y0; y <= y1; y++) {
        for (let x = x0; x <= x1; x++) {
          const ch = this.map.rows[y][x];
          let img;
          if (ch === '.') img = (x * 7 + y * 13) % 3 === 0 ? tiles.grass2 : tiles.grass;
          else if (ch === '=') img = (x + y) % 3 === 0 ? tiles.path2 : tiles.path;
          else if (ch === '~') img = tiles.water[waterFrame];
          else if (ch === 'W') img = (x * 3 + y) % 5 === 0 ? tiles.stone2 : tiles.stone;
          else if (ch === 'f') img = (x * 5 + y * 3) % 7 === 0 ? tiles.floor2 : tiles.floor;
          else img = tiles[EG.mapUtil.TILE_ART[ch]] || tiles.grass;
          ctx.drawImage(img, x * TILE, y * TILE);
          if (ch === 'D') ctx.drawImage(tiles.door, x * TILE, y * TILE);
        }
      }

      // objetos ordenados por profundidad
      const drawables = [];
      const addChar = (spriteKey, x, y, dir, phase) => {
        const set = EG.art.chars[spriteKey];
        if (!set) return;
        const frame = phase || 0;
        const spr = set[dir === 'left' || dir === 'right' ? 'side' : dir][frame];
        drawables.push({
          y: y * TILE + TILE,
          draw: () => {
            ctx.drawImage(EG.art.misc.shadow, x * TILE + 2, y * TILE + 10);
            ctx.save();
            if (dir === 'left') {
              ctx.translate(x * TILE + 16, y * TILE - 6);
              ctx.scale(-1, 1);
              ctx.drawImage(spr, 0, 0);
            } else {
              ctx.drawImage(spr, x * TILE, y * TILE - 6);
            }
            ctx.restore();
          },
        });
      };

      for (const f of this.map.flowers || []) {
        if (EG.game.state.collected[f.id]) continue;
        drawables.push({
          y: f.y * TILE + TILE,
          draw: () => {
            ctx.drawImage(EG.art.misc.flower, f.x * TILE, f.y * TILE + 2);
            const pulse = 0.55 + Math.sin(this.time * 3 + f.x) * 0.25;
            ctx.save();
            ctx.globalAlpha = pulse;
            ctx.fillStyle = '#c9f0ff';
            ctx.fillRect(f.x * TILE + 7, f.y * TILE + 4, 2, 2);
            ctx.restore();
          },
        });
      }
      for (const c of this.map.chests || []) {
        const opened = !!EG.game.state.chests[c.id];
        drawables.push({
          y: c.y * TILE + TILE,
          draw: () => {
            ctx.drawImage(EG.art.misc.chest[opened ? 1 : 0], c.x * TILE, c.y * TILE);
            if (!opened) {
              const bob = Math.sin(this.time * 2.6 + c.x) * 1.2;
              ctx.save();
              ctx.fillStyle = 'rgba(232,198,106,0.85)';
              ctx.fillRect(c.x * TILE + 7, c.y * TILE - 6 + bob, 2, 2);
              ctx.restore();
            }
          },
        });
      }
      for (const s of this.map.signs || []) {
        drawables.push({
          y: s.y * TILE + TILE,
          draw: () => ctx.drawImage(EG.art.misc.sign, s.x * TILE, s.y * TILE),
        });
      }
      for (const n of this.map.npcs || []) {
        if (this.npcHidden(n)) continue;
        const phase = Math.floor((this.time * 2 + n.x) % 2);
        addChar(n.sprite, n.x, n.y, n.dir || 'down', phase);
      }

      const p = this.player;
      const movingFrame = p.moving ? (Math.floor(p.t * 8) % 2) : 0;
      const set = EG.art.chars[EG.game.leaderSprite()] || EG.art.chars.kael;
      const spr = set[p.dir === 'left' || p.dir === 'right' ? 'side' : p.dir][movingFrame];
      drawables.push({
        y: p.py + TILE,
        draw: () => {
          ctx.drawImage(EG.art.misc.shadow, p.px + 1, p.py + 10);
          ctx.save();
          if (p.dir === 'left') {
            ctx.translate(p.px + 16, p.py - 6);
            ctx.scale(-1, 1);
            ctx.drawImage(spr, 0, 0);
          } else {
            ctx.drawImage(spr, p.px, p.py - 6);
          }
          ctx.restore();
        },
      });

      drawables.sort((a, b) => a.y - b.y);
      for (const d of drawables) d.draw();

      // oscuridad atmosférica con halo alrededor del jugador
      if (this.map.tint) {
        const cx = p.px + 8, cy = p.py + 8;
        const g = ctx.createRadialGradient(cx, cy, 26, cx, cy, 130);
        g.addColorStop(0, 'rgba(0,0,0,0)');
        g.addColorStop(1, this.map.tint);
        ctx.save();
        ctx.fillStyle = g;
        ctx.fillRect(this.camX - 40, this.camY - 40, viewW + 80, viewH + 80);
        ctx.restore();
      }

      ctx.restore();

      // efecto de viñeta
      ctx.save();
      const vg = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.35, W / 2, H / 2, Math.max(W, H) * 0.75);
      vg.addColorStop(0, 'rgba(0,0,0,0)');
      vg.addColorStop(1, 'rgba(0,0,0,0.42)');
      ctx.fillStyle = vg;
      ctx.fillRect(0, 0, W, H);
      ctx.restore();

      const blocked = EG.game.overlays.length > 0;
      this.drawHUD(blocked);
      if (this.touch) this.drawControls(blocked);
      if (!blocked) UI_hint();
    },

    drawHUD(blocked) {
      const UI = EG.UI, ctx = UI.ctx;
      const W = UI.W, H = UI.H;
      const st = EG.game.state;

      // nombre de zona
      if (this.banner > 0) {
        const a = Math.min(1, this.banner) * Math.min(1, (2.4 - this.banner) * 3);
        ctx.save();
        ctx.globalAlpha = a;
        const label = this.map.name.toUpperCase();
        const w = UI.measure(label, 14, 'bold') + 44;
        EG.roundRect(ctx, (W - w) / 2, 14, w, 30, 15);
        ctx.fillStyle = 'rgba(8,11,22,0.72)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(232,198,106,0.35)';
        ctx.stroke();
        ctx.restore();
        UI.txt(label, W / 2, 29, {
          size: 14, color: '#f2e3b6', align: 'center', baseline: 'middle', weight: 'bold', shadow: true,
        });
      }

      // party
      const party = st.party;
      const compact = W < 460;
      let py = 12;
      for (const a of party) {
        const stats = EG.data.statsOf(a);
        const label = `${a.name} ${a.lvl}`;
        UI.txt(label, 12, py, { size: compact ? 10 : 12, color: '#e9e4d4', weight: 'bold', shadow: true });
        UI.bar(12, py + (compact ? 12 : 15), compact ? 78 : 96, 5, a.hp, stats.hp, EG.COLORS.hp);
        UI.txt(`${Math.max(0, Math.round(a.hp))}`, 12 + (compact ? 82 : 100), py + (compact ? 10 : 13), {
          size: 9.5, color: 'rgba(230,235,245,0.75)',
        });
        py += compact ? 27 : 32;
      }

      // oro
      const gold = `${EG.fmt(st.gold)}`;
      const gw = UI.measure(gold, 13, 'bold');
      const gy = this.touch ? 56 : H - 40;
      ctx.save();
      EG.roundRect(ctx, W - gw - 56, gy, gw + 46, 24, 12);
      ctx.fillStyle = 'rgba(8,11,22,0.62)';
      ctx.fill();
      ctx.restore();
      ctx.drawImage(EG.art.icons.coin, W - gw - 50, gy + 4);
      UI.txt(gold, W - 14, gy + 12, { size: 13, color: '#e8c66a', align: 'right', baseline: 'middle', weight: 'bold' });

      // botón de menú
      const L = this.layout();
      ctx.save();
      EG.roundRect(ctx, L.menu.x, L.menu.y, L.menu.w, L.menu.h, 9);
      ctx.fillStyle = 'rgba(8,11,22,0.62)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(232,198,106,0.3)';
      ctx.stroke();
      ctx.fillStyle = '#e8c66a';
      for (let i = 0; i < 3; i++) ctx.fillRect(L.menu.x + 10, L.menu.y + 11 + i * 6, 16, 2);
      ctx.restore();
      if (!blocked) {
        UI.region(L.menu.x, L.menu.y, L.menu.w, L.menu.h, () => {
          EG.Audio.sfx('select');
          EG.game.openFieldMenu();
        });
      }

      // indicador de interacción
      if (this.nearInteractable() && !this.player.moving) {
        const p = this.player;
        const sx = (p.px + 8 - this.camX) * this.zoom;
        const sy = (p.py - 12 - this.camY) * this.zoom;
        const bob = Math.sin(this.time * 5) * 2;
        ctx.save();
        ctx.fillStyle = 'rgba(8,11,22,0.8)';
        EG.roundRect(ctx, sx - 9, sy - 11 + bob, 18, 16, 4);
        ctx.fill();
        ctx.strokeStyle = 'rgba(232,198,106,0.6)';
        ctx.stroke();
        ctx.restore();
        UI.txt('!', sx, sy - 3 + bob, { size: 11, color: '#e8c66a', align: 'center', baseline: 'middle', weight: 'bold' });
      }
    },

    drawControls(blocked) {
      const UI = EG.UI, ctx = UI.ctx;
      const L = this.layout();
      const drawKey = (r, label, iconDir) => {
        ctx.save();
        EG.roundRect(ctx, r.x, r.y, r.w, r.h, 10);
        ctx.fillStyle = 'rgba(12,17,30,0.55)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(200,214,245,0.22)';
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.restore();
        UI.txt(label, r.x + r.w / 2, r.y + r.h / 2, {
          size: Math.round(r.h * 0.4), color: 'rgba(230,238,255,0.72)', align: 'center', baseline: 'middle',
        });
      };
      drawKey(L.pad.up, '▲');
      drawKey(L.pad.down, '▼');
      drawKey(L.pad.left, '◀');
      drawKey(L.pad.right, '▶');

      // A / B
      const drawCircle = (r, label, main) => {
        ctx.save();
        ctx.beginPath();
        ctx.arc(r.x + r.w / 2, r.y + r.h / 2, r.w / 2, 0, Math.PI * 2);
        ctx.fillStyle = main ? 'rgba(232,198,106,0.22)' : 'rgba(12,17,30,0.55)';
        ctx.fill();
        ctx.strokeStyle = main ? 'rgba(232,198,106,0.55)' : 'rgba(200,214,245,0.25)';
        ctx.lineWidth = main ? 2 : 1;
        ctx.stroke();
        ctx.restore();
        UI.txt(label, r.x + r.w / 2, r.y + r.h / 2 - (main ? 5 : 0), {
          size: main ? Math.round(r.h * 0.34) : Math.round(r.h * 0.4),
          color: main ? '#f2e3b6' : 'rgba(230,238,255,0.7)',
          align: 'center', baseline: 'middle', weight: 'bold',
        });
        if (main) {
          UI.txt('ACCIÓN', r.x + r.w / 2, r.y + r.h / 2 + r.h * 0.22, {
            size: Math.max(7, Math.round(r.h * 0.13)), color: 'rgba(242,227,182,0.6)', align: 'center', baseline: 'middle',
          });
        }
      };
      drawCircle(L.a, 'A', true);
      drawCircle(L.b, 'B', false);

      if (blocked) return;
      UI.region(L.a.x, L.a.y, L.a.w, L.a.h, () => this.interact());
      UI.region(L.b.x, L.b.y, L.b.w, L.b.h, () => { EG.Audio.sfx('cancel'); EG.game.openFieldMenu(); });
    },
  };

  function UI_hint() {
    if (EG.game.touchUI) return;
    EG.UI.txt('Flechas/WASD mover · Z/Enter acción · X/M menú', EG.UI.W / 2, EG.UI.H - 8, {
      size: 10.5, color: 'rgba(200,210,235,0.4)', align: 'center', baseline: 'bottom',
    });
  }

  EG.world = world;
})();
