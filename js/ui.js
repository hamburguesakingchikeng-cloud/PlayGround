/* Interfaz: diálogos, menús, tienda, guardado, ajustes y avisos */
(function () {
  const EG = window.EG;
  const C = {
    ink: '#f3efe2',
    dim: '#9aa3bd',
    gold: '#e8c66a',
    goldDark: '#8a6a2e',
    panel: 'rgba(10,14,26,0.94)',
    panel2: 'rgba(18,24,42,0.96)',
    line: 'rgba(232,198,106,0.35)',
    hp: '#63c97e',
    mp: '#63a9e8',
    danger: '#e06060',
    xp: '#c9a94e',
  };

  const UI = {
    ctx: null,
    W: 0,
    H: 0,
    regions: [],
    font: '"Trebuchet MS", "Segoe UI", system-ui, sans-serif',
    serif: 'Georgia, "Times New Roman", serif',

    setCtx(ctx, W, H) {
      this.ctx = ctx;
      this.W = W;
      this.H = H;
    },

    beginFrame() {
      this.regions.length = 0;
    },

    region(x, y, w, h, fn, opts) {
      const r = Object.assign({ x, y, w, h }, opts || {});
      r.fn = fn;
      this.regions.push(r);
      return r;
    },

    processTaps() {
      const taps = EG.Input.taps;
      for (const t of taps) {
        for (let i = this.regions.length - 1; i >= 0; i--) {
          const r = this.regions[i];
          if (t.x >= r.x && t.y >= r.y && t.x <= r.x + r.w && t.y <= r.y + r.h) {
            if (r.fn) r.fn(t);
            t.used = true;
            break;
          }
        }
      }
    },

    txt(str, x, y, opts) {
      const o = opts || {};
      const ctx = this.ctx;
      ctx.save();
      let size = o.size || 15;
      if (o.minSize && this.W < 420) size = Math.max(o.minSize, size * 0.92);
      ctx.font = `${o.weight || 'normal'} ${size}px ${o.serif ? this.serif : this.font}`;
      ctx.fillStyle = o.color || C.ink;
      ctx.textAlign = o.align || 'left';
      ctx.textBaseline = o.baseline || 'top';
      if (o.shadow) {
        ctx.fillStyle = 'rgba(0,0,0,0.55)';
        ctx.fillText(str, x + 1, y + 1);
        ctx.fillStyle = o.color || C.ink;
      }
      ctx.fillText(str, x, y);
      ctx.restore();
      return this.measure(str, size, o.weight || 'normal', o.serif) + x;
    },

    measure(str, size, weight, serif) {
      const ctx = this.ctx;
      ctx.save();
      ctx.font = `${weight || 'normal'} ${size || 15}px ${serif ? this.serif : this.font}`;
      const w = ctx.measureText(str).width;
      ctx.restore();
      return w;
    },

    wrap(str, maxWidth, size, weight, serif) {
      const ctx = this.ctx;
      ctx.save();
      ctx.font = `${weight || 'normal'} ${size || 15}px ${serif ? this.serif : this.font}`;
      const lines = EG.textWrap(ctx, str, maxWidth);
      ctx.restore();
      return lines;
    },

    para(str, x, y, maxWidth, opts) {
      const o = opts || {};
      const size = o.size || 15;
      const lh = o.lineHeight || size * 1.42;
      const lines = this.wrap(str, maxWidth, size, o.weight, o.serif);
      lines.forEach((line, i) => this.txt(line, x, y + i * lh, o));
      return y + lines.length * lh;
    },

    panel(x, y, w, h, opts) {
      const o = opts || {};
      const ctx = this.ctx;
      ctx.save();
      EG.roundRect(ctx, x, y, w, h, o.radius === undefined ? 12 : o.radius);
      ctx.fillStyle = o.fill || C.panel;
      ctx.fill();
      if (o.glow) {
        ctx.shadowColor = 'rgba(232,198,106,0.25)';
        ctx.shadowBlur = 18;
      }
      ctx.strokeStyle = o.border || C.line;
      ctx.lineWidth = o.borderWidth || 1.5;
      ctx.stroke();
      ctx.restore();
      if (o.title) {
        this.txt(o.title, x + 18, y + 14, { size: 13, color: C.gold, weight: 'bold' });
        ctx.save();
        ctx.strokeStyle = C.line;
        ctx.beginPath();
        ctx.moveTo(x + 18, y + 34);
        ctx.lineTo(x + w - 18, y + 34);
        ctx.stroke();
        ctx.restore();
      }
      return { x, y, w, h };
    },

    button(x, y, w, h, label, opts) {
      const o = opts || {};
      const ctx = this.ctx;
      const focused = o.focused;
      ctx.save();
      EG.roundRect(ctx, x, y, w, h, o.radius || 9);
      ctx.fillStyle = o.disabled ? 'rgba(30,34,48,0.6)' : focused ? 'rgba(232,198,106,0.18)' : 'rgba(26,32,52,0.88)';
      ctx.fill();
      ctx.strokeStyle = focused ? C.gold : o.disabled ? 'rgba(90,96,120,0.4)' : 'rgba(120,132,170,0.4)';
      ctx.lineWidth = focused ? 2 : 1;
      ctx.stroke();
      if (focused) {
        ctx.fillStyle = C.gold;
        ctx.fillRect(x + 4, y + h / 2 - 6, 3, 12);
      }
      ctx.restore();
      const center = o.left ? x + 14 : x + w / 2;
      this.txt(label, center, y + h / 2 - (o.sub ? 10 : 0), {
        size: o.size || 15,
        color: o.disabled ? '#616a83' : o.color || C.ink,
        weight: o.weight || 'bold',
        align: o.left ? 'left' : 'center',
        baseline: 'middle',
      });
      if (o.sub) {
        this.txt(o.sub, center, y + h / 2 + 11, {
          size: 11,
          color: o.disabled ? '#4d5568' : C.dim,
          align: o.left ? 'left' : 'center',
          baseline: 'middle',
        });
      }
      this.region(x, y, w, h, o.onPick, { disabled: o.disabled, focus: focused });
      return { x, y, w, h };
    },

    bar(x, y, w, h, value, max, color, opts) {
      const o = opts || {};
      const ctx = this.ctx;
      ctx.save();
      EG.roundRect(ctx, x, y, w, h, h / 2);
      ctx.fillStyle = o.bg || 'rgba(255,255,255,0.12)';
      ctx.fill();
      const pct = Math.max(0, Math.min(1, max > 0 ? value / max : 0));
      if (pct > 0) {
        EG.roundRect(ctx, x, y, Math.max(h, w * pct), h, h / 2);
        ctx.fillStyle = color;
        ctx.fill();
      }
      ctx.restore();
    },

    backdrop(alpha) {
      const ctx = this.ctx;
      ctx.save();
      ctx.fillStyle = `rgba(3,5,12,${alpha === undefined ? 0.62 : alpha})`;
      ctx.fillRect(0, 0, this.W, this.H);
      ctx.restore();
    },

    hint(text) {
      this.txt(text, this.W / 2, this.H - 14, { size: 11, color: 'rgba(200,210,235,0.45)', align: 'center', baseline: 'bottom' });
    },

    toast: null,
    showToast(text, tone) {
      this.toast = { text, tone: tone || 'info', t: 0, life: 2.6 };
    },
    drawToast(dt) {
      if (!this.toast) return;
      const t = this.toast;
      t.t += dt;
      if (t.t > t.life) { this.toast = null; return; }
      const a = Math.min(1, t.t * 5) * Math.min(1, (t.life - t.t) * 3);
      const ctx = this.ctx;
      const w = Math.min(this.W - 32, this.measure(t.text, 14, 'bold') + 40);
      const x = (this.W - w) / 2;
      const y = 18;
      ctx.save();
      ctx.globalAlpha = a;
      EG.roundRect(ctx, x, y, w, 34, 8);
      ctx.fillStyle = t.tone === 'bad' ? 'rgba(120,30,40,0.95)' : t.tone === 'gold' ? 'rgba(90,70,25,0.95)' : 'rgba(18,26,44,0.95)';
      ctx.fill();
      ctx.strokeStyle = C.line;
      ctx.stroke();
      ctx.restore();
      this.txt(t.text, this.W / 2, y + 17, {
        size: 14, color: C.ink, align: 'center', baseline: 'middle', weight: 'bold',
      });
    },

    /* -------------------------------- DIÁLOGO -------------------------------- */

    dialog(opts) {
      const pages = opts.pages || [];
      const overlay = {
        modal: true,
        page: 0,
        shown: 0,
        done: false,
        selected: 0,
        finished: false,
        update(dt) {
          const page = pages[this.page];
          if (!page) return;
          const full = page.text || '';
          if (!this.done) {
            this.shown += dt * 46;
            if (this.shown >= full.length) {
              this.shown = full.length;
              this.done = true;
            }
          }
          const choices = page.choices;
          if (this.done && choices && choices.length) {
            if (EG.Input.pressed('up')) { this.selected = (this.selected + choices.length - 1) % choices.length; EG.Audio.sfx('cursor'); }
            if (EG.Input.pressed('down')) { this.selected = (this.selected + 1) % choices.length; EG.Audio.sfx('cursor'); }
            if (EG.Input.pressed('ok')) {
              EG.Audio.sfx('select');
              const cb = choices[this.selected].action;
              this.close();
              if (cb) cb();
              return;
            }
          } else if (this.done) {
            if (EG.Input.pressed('ok') || EG.Input.pressed('menu')) {
              EG.Audio.sfx('cursor');
              this.next();
            }
          } else if (EG.Input.pressed('ok')) {
            this.shown = full.length;
            this.done = true;
          }
          if (EG.Input.pressed('back') && opts.allowSkip) this.close(true);
        },
        next() {
          if (this.page >= pages.length - 1) {
            this.close();
            return;
          }
          this.page++;
          this.shown = 0;
          this.done = false;
          this.selected = 0;
          const p = pages[this.page];
          if (p && p.onShow) p.onShow();
        },
        close(skipped) {
          if (this.finished) return;
          this.finished = true;
          EG.game.closeOverlay(this);
          if (!skipped && opts.onEnd) opts.onEnd();
        },
        draw() {
          const ctx = EG.UI.ctx;
          const W = EG.UI.W, H = EG.UI.H;
          const page = pages[this.page] || { text: '' };
          const portrait = page.sprite && EG.art.chars[page.sprite];
          const h = Math.min(H * 0.42, portrait ? 200 : 168);
          const margin = Math.min(16, W * 0.04);
          const bx = margin, by = H - h - margin, bw = W - margin * 2;
          EG.UI.panel(bx, by, bw, h, { radius: 14, glow: true, fill: 'rgba(8,11,22,0.96)' });
          // retrato
          let tx = bx + 22;
          if (portrait) {
            ctx.save();
            ctx.fillStyle = 'rgba(232,198,106,0.08)';
            EG.roundRect(ctx, bx + 14, by + 14, 92, h - 28, 10);
            ctx.fill();
            const spr = portrait.down[0];
            const scale = Math.min(3.2, (h - 52) / 22);
            ctx.imageSmoothingEnabled = false;
            ctx.drawImage(spr, bx + 14 + (92 - 16 * scale) / 2, by + 18, 16 * scale, 22 * scale);
            ctx.restore();
            tx = bx + 120;
          }
          const name = page.who || '';
          if (name) {
            EG.UI.txt(name, tx, by + 16, { size: 14, color: C.gold, weight: 'bold' });
          }
          const textY = by + (name ? 40 : 24);
          const maxW = bw - (tx - bx) - 28;
          const full = page.text || '';
          const visible = full.slice(0, Math.floor(this.shown));
          const lines = EG.UI.wrap(visible, maxW, 15.5);
          lines.forEach((line, i) => {
            EG.UI.txt(line, tx, textY + i * 22, { size: 15.5 });
          });
          const textEnd = textY + lines.length * 22;
          if (!this.done) {
            EG.UI.txt('▼', bx + bw - 26, by + h - 26, { size: 14, color: C.gold, align: 'right' });
          }
          if (this.done && page.choices && page.choices.length) {
            const cw = Math.min(maxW, 330);
            const chH = 34;
            let cy = by + h - 12 - page.choices.length * (chH + 6);
            cy = Math.max(cy, textEnd + 6);
            page.choices.forEach((ch, i) => {
              EG.UI.button(tx, cy + i * (chH + 6), cw, chH, ch.label, {
                focused: this.selected === i,
                size: 14,
                left: true,
                onPick: () => {
                  EG.Audio.sfx('select');
                  this.close();
                  if (ch.action) ch.action();
                },
              });
            });
          } else {
            EG.UI.region(bx, by, bw, h, () => {
              if (!this.done) { this.shown = (pages[this.page].text || '').length; this.done = true; }
              else this.next();
            });
          }
          if (!portrait && this.done && !(page.choices && page.choices.length)) {
            EG.UI.txt('Toca o pulsa A', bx + bw - 22, by + h - 20, {
              size: 11, color: 'rgba(200,210,235,0.45)', align: 'right',
            });
          }
        },
      };
      EG.game.openOverlay(overlay);
      return overlay;
    },

    /* --------------------------------- LISTA --------------------------------- */

    listPanel(opts) {
      // opts: title, subtitle, items(), focusRef, onBack, footer, height
      const itemsFn = opts.items;
      let focus = opts.focus || 0;
      let scroll = 0;
      const overlay = {
        modal: true,
        update(dt) {
          const items = itemsFn();
          if (!items.length) return;
          const prev = focus;
          if (EG.Input.pressed('up')) { focus = (focus + items.length - 1) % items.length; EG.Audio.sfx('cursor'); }
          if (EG.Input.pressed('down')) { focus = (focus + 1) % items.length; EG.Audio.sfx('cursor'); }
          if (focus !== prev && opts.onFocus) opts.onFocus(items[focus], focus);
          if (EG.Input.pressed('ok')) {
            const it = items[focus];
            if (it && !it.disabled && it.action) { EG.Audio.sfx('select'); it.action(); }
            else if (it && it.disabled) EG.Audio.sfx('cancel');
          }
          if (EG.Input.pressed('back')) {
            EG.Audio.sfx('cancel');
            this.close();
          }
        },
        close() {
          EG.game.closeOverlay(this);
          if (opts.onBack) opts.onBack();
        },
        draw() {
          const W = EG.UI.W, H = EG.UI.H;
          EG.UI.backdrop(0.72);
          const margin = Math.min(18, W * 0.04);
          const top = Math.min(64, H * 0.1);
          const bx = margin, by = top, bw = W - margin * 2, bh = H - top - margin;
          EG.UI.panel(bx, by, bw, bh, { title: opts.title || '', glow: true });
          if (opts.subtitle) {
            EG.UI.txt(opts.subtitle, bx + 18, by + 46, { size: 12.5, color: C.dim });
          }
          const items = itemsFn();
          const headerH = opts.subtitle ? 74 : 48;
          const footerH = opts.footer ? 46 : 22;
          const rowH = opts.rowH || 54;
          const listY = by + headerH;
          const listH = bh - headerH - footerH;
          const visible = Math.max(1, Math.floor(listH / rowH));
          if (focus < scroll) scroll = focus;
          if (focus >= scroll + visible) scroll = focus - visible + 1;
          const shown = items.slice(scroll, scroll + visible);
          shown.forEach((it, i) => {
            const idx = scroll + i;
            const y = listY + i * rowH;
            const h = rowH - 6;
            const focused = idx === focus;
            const ctx = EG.UI.ctx;
            ctx.save();
            EG.roundRect(ctx, bx + 12, y, bw - 24, h, 8);
            ctx.fillStyle = focused ? 'rgba(232,198,106,0.14)' : 'rgba(255,255,255,0.035)';
            ctx.fill();
            if (focused) {
              ctx.fillStyle = C.gold;
              ctx.fillRect(bx + 16, y + 12, 3, h - 24);
            }
            ctx.restore();
            const labelX = bx + 30;
            EG.UI.txt(it.label, labelX, y + (it.sub ? 9 : h / 2 - 8), {
              size: it.size || 15,
              color: it.disabled ? '#5d6579' : it.color || C.ink,
              weight: 'bold',
            });
            if (it.sub) {
              EG.UI.txt(it.sub, labelX, y + 28, { size: 11.5, color: it.disabled ? '#4d5568' : C.dim });
            }
            if (it.right) {
              EG.UI.txt(it.right, bx + bw - 28, y + h / 2 - 7, { size: 13, color: it.rightColor || C.gold, align: 'right', weight: 'bold' });
            }
            EG.UI.region(bx + 12, y, bw - 24, h, () => {
              focus = idx;
              if (opts.onFocus) opts.onFocus(items[idx], idx);
              if (it.disabled) { EG.Audio.sfx('cancel'); return; }
              if (it.action) { EG.Audio.sfx('select'); it.action(); }
            }, { listIndex: idx });
          });
          if (items.length > visible) {
            EG.UI.txt(`${focus + 1}/${items.length}`, bx + bw - 22, by + bh - footerH + 8, {
              size: 11, color: C.dim, align: 'right',
            });
          }
          if (opts.footer) {
            EG.UI.txt(opts.footer, bx + 18, by + bh - footerH + 6, { size: 11.5, color: C.dim });
          }
          EG.UI.hint('▲▼ elegir · A aceptar · B volver');
        },
      };
      EG.game.openOverlay(overlay);
      return overlay;
    },
  };

  EG.UI = UI;
  EG.COLORS = C;
})();
