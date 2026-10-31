import { clamp } from '../core/utils.js';

export class Camera {
  constructor(width = 800, height = 450) {
    this.x = 0; this.y = 0;
    this.w = width; this.h = height;
    this.targetX = 0; this.targetY = 0;
    this.shakeTime = 0;
    this.shakePower = 0;
    this.offsetX = 0;
    this.offsetY = 0;
    this.zoom = 1;
    this.worldW = 0; this.worldH = 0;
    this.drift = 0;
  }

  resize(width, height) {
    this.w = width; this.h = height;
  }

  snapTo(x, y) {
    this.x = x - this.w / 2;
    this.y = y - this.h / 2;
    this.clampToWorld();
  }

  setWorld(width, height) {
    this.worldW = width; this.worldH = height;
  }

  shake(power = 5, time = .2) {
    if (power > this.shakePower || this.shakeTime <= 0) {
      this.shakePower = Math.max(this.shakePower * (this.shakeTime > 0 ? 1 : 0), power);
    }
    this.shakeTime = Math.max(this.shakeTime, time);
  }

  update(dt, player, game) {
    const lead = 40;
    this.targetX = player.x - this.w / 2 + Math.cos(player.aimAngle || 0) * lead * .35;
    this.targetY = player.y - this.h / 2 - 18;
    const k = 1 - Math.exp(-6.5 * dt);
    this.x += (this.targetX - this.x) * k;
    this.y += (this.targetY - this.y) * k;
    this.clampToWorld();
    if (this.shakeTime > 0) {
      this.shakeTime -= dt;
      const p = this.shakePower * Math.max(0, this.shakeTime / .3);
      this.offsetX = (Math.random() * 2 - 1) * p;
      this.offsetY = (Math.random() * 2 - 1) * p;
      if (this.shakeTime <= 0) { this.shakePower = 0; this.offsetX = 0; this.offsetY = 0; }
    } else { this.offsetX = 0; this.offsetY = 0; }
    this.visualX = this.x + this.offsetX;
    this.visualY = this.y + this.offsetY;
  }

  clampToWorld() {
    if (this.worldW <= 0) return;
    if (this.worldW <= this.w) this.x = (this.worldW - this.w) / 2;
    else this.x = clamp(this.x, 0, this.worldW - this.w);
    if (this.worldH <= this.h) this.y = (this.worldH - this.h) / 2;
    else this.y = clamp(this.y, 0, this.worldH - this.h);
  }

  toScreen(x, y) {
    return { x: x - (this.visualX ?? this.x), y: y - (this.visualY ?? this.y) };
  }

  screenToWorld(sx, sy) {
    return { x: sx + (this.visualX ?? this.x), y: sy + (this.visualY ?? this.y) };
  }

  visible(x, y, pad = 100) {
    return x > this.x - pad && y > this.y - pad && x < this.x + this.w + pad && y < this.y + this.h + pad;
  }
}
