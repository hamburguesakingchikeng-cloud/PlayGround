import { clamp, lerp } from './utils.js';

export class Camera {
  constructor() {
    this.x = 0; this.y = 0;
    this.targetX = 0; this.targetY = 0;
    this.zoom = 1;
    this.targetZoom = 1;
    this.shake = 0;
    this.shakeX = 0; this.shakeY = 0;
    this.width = 1280; this.height = 720;
    this.bounds = { x: 0, y: 0, w: 3200, h: 2400 };
    this.follow = 0.12;
    this.lookAhead = 22;
  }

  setViewport(w, h) { this.width = w; this.height = h; }
  setBounds(w, h, tile = 32) { this.bounds = { x: 0, y: 0, w: w * tile, h: h * tile }; }
  snapTo(x, y) { this.x = this.targetX = x; this.y = this.targetY = y; this.clampToBounds(); }
  addShake(amount) { this.shake = Math.min(26, this.shake + amount); }

  update(dt, tx, ty, vx = 0, vy = 0, reduceMotion = false) {
    this.targetX = tx + vx * this.lookAhead;
    this.targetY = ty + vy * this.lookAhead;
    this.x = lerp(this.x, this.targetX, 1 - Math.pow(0.001, dt));
    this.y = lerp(this.y, this.targetY, 1 - Math.pow(0.001, dt));
    this.zoom = lerp(this.zoom, this.targetZoom, 1 - Math.pow(0.005, dt));
    this.clampToBounds();
    if (this.shake > 0.05 && !reduceMotion) {
      this.shake *= Math.pow(0.0008, dt);
      this.shakeX = (Math.random() * 2 - 1) * this.shake;
      this.shakeY = (Math.random() * 2 - 1) * this.shake;
    } else {
      this.shake = 0; this.shakeX = 0; this.shakeY = 0;
    }
  }

  clampToBounds() {
    const halfW = this.width / (2 * this.zoom);
    const halfH = this.height / (2 * this.zoom);
    const b = this.bounds;
    if (b.w <= halfW * 2) this.x = b.x + b.w / 2;
    else this.x = clamp(this.x, b.x + halfW, b.x + b.w - halfW);
    if (b.h <= halfH * 2) this.y = b.y + b.h / 2;
    else this.y = clamp(this.y, b.y + halfH, b.y + b.h - halfH);
  }

  apply(ctx) {
    ctx.translate(this.width / 2, this.height / 2);
    ctx.scale(this.zoom, this.zoom);
    ctx.translate(-this.x + this.shakeX / this.zoom, -this.y + this.shakeY / this.zoom);
  }

  worldToScreen(x, y) {
    return {
      x: (x - this.x) * this.zoom + this.width / 2 + this.shakeX,
      y: (y - this.y) * this.zoom + this.height / 2 + this.shakeY,
    };
  }
  screenToWorld(x, y) {
    return {
      x: (x - this.width / 2) / this.zoom + this.x,
      y: (y - this.height / 2) / this.zoom + this.y,
    };
  }
  isVisible(x, y, margin = 80) {
    const halfW = this.width / (2 * this.zoom) + margin;
    const halfH = this.height / (2 * this.zoom) + margin;
    return Math.abs(x - this.x) < halfW && Math.abs(y - this.y) < halfH;
  }
}
