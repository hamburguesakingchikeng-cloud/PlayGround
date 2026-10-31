import * as THREE from 'three';
import { createHero, poseHero, updateHeroAppearance } from './character.js';
import { clamp, damp, dampAngle, dist2D } from '../core/utils.js';
import { ATTRIBUTES, ITEMS, OUTFITS } from './data.js';

const BASE_STATS = { vit: 3, mana: 2, res: 3, str: 3, def: 3, spd: 3, int: 2, luck: 2 };

export class Player {
  constructor(game, options) {
    this.game = game;
    this.name = options.name || 'Aster';
    this.origin = options.origin;
    this.appearance = {
      skin: options.skin || '#e9c9a8',
      hairColor: options.hairColor || '#d9d5cc',
      hairStyle: options.hairStyle || 'short',
      outfit: options.outfit || OUTFITS[0],
    };
    this.attributes = { ...BASE_STATS };
    for (const [k, v] of Object.entries(options.origin?.base || {})) this.attributes[k] = (this.attributes[k] || 0) + v;
    for (const [k, v] of Object.entries(options.allocated || {})) this.attributes[k] += v;
    this.level = 1;
    this.xp = 0;
    this.nextXp = 70;
    this.gold = 0;
    this.equipment = {
      weapon: ITEMS.filo_alba,
      armor: ITEMS.tunica_valdoria,
      charm: null,
    };
    this.potions = 3;
    this.position = new THREE.Vector3(0, 0, 0);
    this.spawnPoint = { x: 0, z: 0 };
    this.facing = 0;
    this.velocity = new THREE.Vector3();
    this.state = 'idle';
    this.attackTime = 0;
    this.attackDuration = 0;
    this.attackType = 'light';
    this.combo = 0;
    this.comboTimer = 0;
    this.queuedAttack = null;
    this.hitDone = false;
    this.dodgeTime = 0;
    this.dodgeDir = new THREE.Vector3();
    this.dodgeCooldown = 0;
    this.invuln = 0;
    this.hurtFlash = 0;
    this.blocking = false;
    this.blockStart = 0;
    this.blockBroken = 0;
    this.runPhase = 0;
    this.dead = false;
    this.deadTime = 0;
    this.hazardTimer = 0;
    this.combatTimer = 0;
    this.resonanceCooldown = 0;
    this.companionCooldown = 0;
    this.creatureBuffs = {};
    this.derived = {};
    this.mesh = createHero({ ...this.appearance, weaponAppearance: this.equipment.weapon?.appearance });
    this.mesh.position.copy(this.position);
    this.mesh.rotation.y = this.facing;
    this.mesh.userData.actor = this;
    this.recomputeStats();
    this.hp = this.maxHp;
    this.mana = this.maxMana;
    this.stamina = this.maxStamina;
    this.baseMaxHp = this.maxHp;
    this.baseMaxMana = this.maxMana;
    this.baseMaxStamina = this.maxStamina;
  }

  recomputeStats() {
    const a = this.attributes;
    const gear = {
      hp: 0, mana: 0, def: 0, atk: 0, crit: 0, luck: 0, resonance: 0,
      ...Object.values(this.equipment).filter(Boolean).reduce((acc, item) => {
        acc.hp = (acc.hp || 0) + (item.hp || 0);
        acc.mana = (acc.mana || 0) + (item.mana || 0);
        acc.def = (acc.def || 0) + (item.def || 0);
        acc.atk = (acc.atk || 0) + (item.atk || 0);
        acc.crit = (acc.crit || 0) + (item.crit || 0);
        acc.luck = (acc.luck || 0) + (item.luck || 0);
        acc.resonance = (acc.resonance || 0) + (item.resonance || 0);
        return acc;
      }, {}),
    };
    const buff = this.creatureBuffs || {};
    this.maxHp = Math.round((82 + a.vit * 14 + this.level * 7 + gear.hp) * (1 + (buff.hp || 0)));
    this.maxMana = Math.round((30 + a.mana * 6 + this.level * 2 + gear.mana) * (1 + (buff.mana || 0) * 0.01));
    this.maxStamina = Math.round(48 + a.res * 7 + this.level * 1.5);
    this.damage = (7 + a.str * 2.1 + gear.atk + this.level * 1.45) * (1 + (buff.damage || 0));
    this.defense = 2 + a.def * 1.55 + gear.def + this.level * 0.5;
    this.speed = 4.2 + a.spd * 0.13 + (buff.speed || 0);
    this.critChance = clamp(0.045 + a.luck * 0.009 + gear.crit + (buff.crit || 0), 0, 0.75);
    this.resonancePower = clamp(0.35 + a.int * 0.028 + a.luck * 0.007 + gear.resonance + (buff.resonance || 0), 0.1, 1.5);
    this.manaRegen = 1.0 + a.int * 0.12;
    this.derived = {
      hp: this.maxHp, mana: this.maxMana, stamina: this.maxStamina,
      damage: Math.round(this.damage * 10) / 10, defense: Math.round(this.defense * 10) / 10,
      speed: Math.round(this.speed * 10) / 10, crit: Math.round(this.critChance * 100),
      resonance: Math.round(this.resonancePower * 100),
    };
  }

  applyCreatureBuffs(list) {
    this.creatureBuffs = {};
    for (const c of list || []) {
      const st = c.stats || {};
      for (const [k, v] of Object.entries(st)) this.creatureBuffs[k] = (this.creatureBuffs[k] || 0) + v;
    }
    this.recomputeStats();
    this.hp = Math.min(this.hp, this.maxHp);
    this.mana = Math.min(this.mana, this.maxMana);
    this.stamina = Math.min(this.stamina, this.maxStamina);
  }

  placeAt(x, z) {
    this.position.x = x;
    this.position.z = z;
    this.position.y = this.game.world.heightAt(x, z);
    this.mesh.position.copy(this.position);
    this.spawnPoint = { x, z };
  }

  update(dt) {
    if (this.dead) {
      this.deadTime += dt;
      this.hurtFlash = Math.max(0, this.hurtFlash - dt);
      poseHero(this.mesh, { speed: 0, dead: clamp(this.deadTime / 0.7, 0, 1) }, dt, this.game.time);
      return;
    }
    this.combatTimer += dt;
    this.invuln = Math.max(0, this.invuln - dt);
    this.hurtFlash = Math.max(0, this.hurtFlash - dt);
    this.dodgeCooldown = Math.max(0, this.dodgeCooldown - dt);
    this.comboTimer = Math.max(0, this.comboTimer - dt);
    this.resonanceCooldown = Math.max(0, this.resonanceCooldown - dt);
    this.companionCooldown = Math.max(0, this.companionCooldown - dt);
    if (this.comboTimer <= 0 && this.attackTime <= 0) this.combo = 0;

    const input = this.game.input;
    const move = input.getMove();
    const blocking = input.isBlocking() && this.attackTime <= 0 && this.dodgeTime <= 0 && this.blockBroken <= 0;
    if (blocking && !this.blocking) this.blockStart = this.game.time;
    this.blocking = blocking;
    this.blockBroken = Math.max(0, this.blockBroken - dt);

    // stamina and mana regeneration
    const sprinting = input.isSprinting() && move.z !== 0 || input.isSprinting() && move.x !== 0;
    if (!blocking && this.dodgeTime <= 0) {
      this.stamina = Math.min(this.maxStamina, this.stamina + dt * (this.combatTimer > 5 ? 15 : 8));
    }
    if (this.combatTimer > 4) {
      this.mana = Math.min(this.maxMana, this.mana + dt * this.manaRegen * 1.6);
      this.hp = Math.min(this.maxHp, this.hp + dt * (this.maxHp * 0.008));
    } else {
      this.mana = Math.min(this.maxMana, this.mana + dt * this.manaRegen * 0.65);
    }
    if (blocking) {
      this.stamina -= dt * 10;
      if (this.stamina <= 0) {
        this.stamina = 0;
        this.blockBroken = 1.1;
        this.blocking = false;
        this.game.audio.block();
        this.game.toast('Guardia rota', 'Recupera el aliento antes de volver a bloquear.', 'danger');
      }
    }

    // dodge motion
    if (this.dodgeTime > 0) {
      this.dodgeTime -= dt;
      const t = 1 - this.dodgeTime / 0.42;
      const speed = 10.5 * (1 - t * 0.55);
      this.moveBy(this.dodgeDir.x * speed * dt, this.dodgeDir.z * speed * dt);
      this.invuln = Math.max(this.invuln, 0.1);
    } else {
      const moving = Math.hypot(move.x, move.z) > 0.05 && this.attackTime <= 0;
      let speed = this.speed;
      if (blocking) speed *= 0.32;
      if (sprinting && this.stamina > 1) {
        speed *= 1.55;
        this.stamina = Math.max(0, this.stamina - dt * 12);
      }
      if (moving) {
        const yaw = this.game.cameraYaw;
        const wx = Math.sin(yaw) * -move.z + Math.cos(yaw) * move.x;
        const wz = Math.cos(yaw) * -move.z - Math.sin(yaw) * move.x;
        const len = Math.hypot(wx, wz) || 1;
        const dirX = wx / len, dirZ = wz / len;
        this.moveBy(dirX * speed * dt, dirZ * speed * dt);
        if (!this.blocking) {
          const targetFacing = Math.atan2(dirX, dirZ);
          this.facing = dampAngle(this.facing, targetFacing, 12, dt);
        }
        this.runPhase += dt * (sprinting ? 13 : 9);
        this.state = sprinting ? 'sprint' : 'run';
      } else {
        this.state = 'idle';
      }
      if (this.attackTime > 0) {
        this.attackTime -= dt;
        const t = 1 - this.attackTime / this.attackDuration;
        if (!this.hitDone && t >= 0.3) {
          this.hitDone = true;
          this.performHit();
        }
        if (this.attackTime <= 0) {
          this.attackTime = 0;
          if (this.queuedAttack) {
            const q = this.queuedAttack;
            this.queuedAttack = null;
            this.tryAttack(q);
          }
        }
      }
    }

    // hazard
    this.hazardTimer -= dt;
    if (this.hazardTimer <= 0 && this.game.world.hazardAt(this.position.x, this.position.z)) {
      this.hazardTimer = 0.6;
      this.takeDamage(5 + this.level * 0.5, null, { hazard: true, ignoreBlock: true });
    }

    this.position.y = this.game.world.heightAt(this.position.x, this.position.z);
    this.mesh.position.copy(this.position);
    this.mesh.rotation.y = this.facing;
    poseHero(this.mesh, {
      speed: this.state === 'run' || this.state === 'sprint' ? (this.state === 'sprint' ? 1.4 : 1) : 0,
      runPhase: this.runPhase,
      attack: this.attackTime > 0 ? 1 - this.attackTime / this.attackDuration : 0,
      attackType: this.attackType,
      combo: this.combo,
      blocking: this.blocking,
      dodge: this.dodgeTime > 0 ? 1 - this.dodgeTime / 0.42 : 0,
      hurt: this.hurtFlash,
      dead: 0,
    }, dt, this.game.time);
    if (this.hurtFlash > 0) {
      this.mesh.userData.rig.materials.cloth.emissive.set('#ff7d72');
      this.mesh.userData.rig.materials.cloth.emissiveIntensity = 0.45;
    } else {
      this.mesh.userData.rig.materials.cloth.emissiveIntensity = 0;
    }
  }

  moveBy(dx, dz) {
    let nx = this.position.x + dx;
    let nz = this.position.z + dz;
    const world = this.game.world;
    for (const c of world.colliders) {
      const ddx = nx - c.x, ddz = nz - c.z;
      const d = Math.hypot(ddx, ddz);
      const min = c.r + 0.38;
      if (d < min && d > 0.0001) {
        const push = (min - d) / d;
        nx += ddx * push;
        nz += ddz * push;
      }
    }
    const max = world.bounds;
    const d = Math.hypot(nx, nz);
    if (d > max) { nx *= max / d; nz *= max / d; }
    this.position.x = nx;
    this.position.z = nz;
  }

  tryAttack(type = 'light') {
    if (this.dead || this.dodgeTime > 0) return;
    if (this.attackTime > 0) {
      if (this.attackTime < this.attackDuration * 0.65) this.queuedAttack = type;
      return;
    }
    if (this.stamina < (type === 'heavy' ? 20 : 7)) {
      this.game.toast('Sin aguante', 'Espera un instante y vuelve a intentarlo.', 'danger');
      return;
    }
    this.stamina -= type === 'heavy' ? 20 : 7;
    this.attackType = type;
    this.attackDuration = type === 'heavy' ? 0.72 : 0.42;
    this.attackTime = this.attackDuration;
    this.hitDone = false;
    this.combo = (this.combo + 1) % 3;
    this.comboTimer = 1.1;
    this.combatTimer = 0;
    const target = this.game.findAttackTarget();
    if (target) {
      const dx = target.mesh.position.x - this.position.x;
      const dz = target.mesh.position.z - this.position.z;
      this.facing = Math.atan2(dx, dz);
      this.mesh.rotation.y = this.facing;
    }
    if (type === 'heavy') this.game.audio.heavySwing();
    else this.game.audio.swing();
    this.game.onPlayerAttack?.(type);
  }

  performHit() {
    const heavy = this.attackType === 'heavy';
    const range = heavy ? 3.15 : 2.55;
    const arc = heavy ? Math.PI * 0.95 : Math.PI * 0.72;
    const base = this.damage * (heavy ? 2.15 : [1, 1.12, 1.38][this.combo] || 1);
    const originFacing = this.facing;
    this.game.spawnSlashTrail(this.position, originFacing, heavy ? '#ffcf82' : '#c9f4ea', heavy ? 1.6 : 1);
    const hits = this.game.hitEnemiesInArc(this.position, originFacing, range, arc, base, heavy);
    if (heavy) this.game.shake(0.24);
    if (this.origin?.id === 'blade' && this.combo === 2) {
      this.stamina = Math.min(this.maxStamina, this.stamina + 10);
    }
    if (hits > 0 && this.origin?.id === 'vanguard') {
      this.mana = Math.min(this.maxMana, this.mana + 4);
    }
  }

  tryDodge() {
    if (this.dead || this.dodgeTime > 0 || this.dodgeCooldown > 0) return;
    if (this.stamina < 18) return;
    this.stamina -= 18;
    this.dodgeTime = 0.42;
    this.dodgeCooldown = 0.55;
    this.invuln = 0.36;
    this.attackTime = 0;
    this.combatTimer = 0;
    const move = this.game.input.getMove();
    if (Math.hypot(move.x, move.z) > 0.1) {
      const yaw = this.game.cameraYaw;
      const wx = Math.sin(yaw) * -move.z + Math.cos(yaw) * move.x;
      const wz = Math.cos(yaw) * -move.z - Math.sin(yaw) * move.x;
      this.dodgeDir.set(wx, 0, wz).normalize();
      this.facing = Math.atan2(wx, wz);
    } else {
      this.dodgeDir.set(Math.sin(this.facing), 0, Math.cos(this.facing));
    }
    this.game.audio.dodge();
  }

  usePotion() {
    if (this.dead) return;
    if (this.potions <= 0) {
      this.game.toast('Sin elixires', 'Encuentra más en cofres y santuarios.', 'danger');
      return;
    }
    if (this.hp >= this.maxHp && this.mana >= this.maxMana) return;
    this.potions--;
    this.hp = Math.min(this.maxHp, this.hp + this.maxHp * 0.45);
    this.mana = Math.min(this.maxMana, this.mana + 20);
    this.game.audio.potion();
    this.game.spawnHealEffect(this.position);
    this.game.toast('Elixir de Aurora', 'La luz recorre tus venas.', 'heal');
    this.game.updateHud();
  }

  takeDamage(amount, source = null, opts = {}) {
    if (this.dead) return;
    if (this.invuln > 0 && !opts.hazard) return;
    let final = amount;
    if (this.blocking && !opts.ignoreBlock) {
      const perfect = this.game.time - this.blockStart < 0.22;
      final *= perfect ? 0.05 : 0.28;
      this.stamina -= perfect ? 4 : 12;
      this.game.audio.block();
      this.game.spawnBlockEffect(this.position, this.facing, perfect);
      if (perfect) {
        this.game.perfectBlock?.(source);
        this.mana = Math.min(this.maxMana, this.mana + 12);
      }
    } else {
      final *= clamp(1 - this.defense / (this.defense + 120), 0.35, 0.92);
    }
    final = Math.max(1, Math.round(final));
    this.hp -= final;
    this.invuln = 0.45;
    this.hurtFlash = 0.24;
    this.combatTimer = 0;
    this.game.audio.hurt();
    this.game.damageNumber(this.position, final, false, true);
    this.game.shake(0.22);
    this.game.flashDamage();
    if (source) {
      const dx = this.position.x - source.mesh.position.x;
      const dz = this.position.z - source.mesh.position.z;
      this.moveBy(dx * 0.08, dz * 0.08);
    }
    if (this.hp <= 0) {
      this.hp = 0;
      this.die();
    }
    this.game.updateHud();
  }

  die() {
    this.dead = true;
    this.deadTime = 0;
    this.blocking = false;
    this.attackTime = 0;
    this.game.audio.death();
    this.game.onPlayerDeath();
  }

  reviveAtSpawn() {
    this.dead = false;
    this.deadTime = 0;
    this.hp = this.maxHp;
    this.mana = this.maxMana;
    this.stamina = this.maxStamina;
    this.invuln = 2;
    this.position.set(this.spawnPoint.x, 0, this.spawnPoint.z);
    this.position.y = this.game.world.heightAt(this.position.x, this.position.z);
    this.mesh.position.copy(this.position);
    this.mesh.visible = true;
  }

  addXp(amount) {
    this.xp += amount;
    let leveled = false;
    while (this.xp >= this.nextXp) {
      this.xp -= this.nextXp;
      this.level++;
      this.nextXp = Math.round(70 + this.level * 48);
      leveled = true;
    }
    if (leveled) {
      this.recomputeStats();
      this.hp = this.maxHp;
      this.mana = this.maxMana;
      this.stamina = this.maxStamina;
      this.game.onLevelUp();
    }
    this.game.updateHud();
  }

  equip(item) {
    if (!item) return;
    if (item.type === 'consumable') {
      if (item.id === 'elixir') { this.potions++; this.game.updateHud(); }
      return;
    }
    const slot = item.type === 'weapon' ? 'weapon' : item.type === 'armor' ? 'armor' : 'charm';
    this.equipment[slot] = item;
    this.recomputeStats();
    if (slot === 'weapon') updateHeroAppearance(this.mesh, { weaponAppearance: item.appearance });
    if (slot === 'armor' && item.appearance?.outfit) {
      const outfit = OUTFITS.find((o) => o.id === item.appearance.outfit) || this.appearance.outfit;
      this.appearance.outfit = outfit;
      updateHeroAppearance(this.mesh, { outfit });
    }
    this.game.audio.chest();
    this.game.updateHud();
  }

  getAttribute(id) { return this.attributes[id] || 0; }
}
