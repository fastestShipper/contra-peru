// Enemies: grunt, jumper, turret, roller, flyer
import { camera, addShake } from '../engine/camera.js';
import { drawSprite, getSprite } from '../engine/sprites.js';
import { sfx } from '../engine/audio.js';
import { spawnBlood, spawnExplosion, spawnPopup } from '../engine/particles.js';
import { spawnEnemyBullet } from './projectiles.js';
import { GRAVITY, MAX_FALL } from '../config.js';
import { moveX, moveY, isSolidAt } from '../engine/tilemap.js';
import { player, pickupWeapon, damagePlayer } from './player.js';
import { rand, chance, randi, normalize } from '../engine/math.js';

export const enemies = [];
export const powerups = [];

export const TYPES = {
  grunt: {
    sprite:'enemy_grunt', w:12, h:24,
    hp:2, score:100, speed:45, gravity:true,
    behavior:'walker', shootCd: 1.8, bulletSpeed: 140,
  },
  jumper: {
    sprite:'enemy_jumper', w:12, h:24,
    hp:2, score:150, speed:60, gravity:true,
    behavior:'jumper', shootCd: 1.2, bulletSpeed: 170,
  },
  turret: {
    sprite:'enemy_turret', w:16, h:12,
    hp:4, score:200, speed:0, gravity:false,
    behavior:'turret', shootCd: 1.0, bulletSpeed: 180,
  },
  roller: {
    sprite:'enemy_roller', w:12, h:12,
    hp:1, score:80, speed:120, gravity:true,
    behavior:'roller', shootCd: 99, bulletSpeed: 0,
  },
  flyer: {
    sprite:'enemy_flyer', w:12, h:6,
    hp:1, score:100, speed:70, gravity:false,
    behavior:'flyer', shootCd: 1.5, bulletSpeed: 160,
  },
};

export function spawnEnemy(typeId, x, y, opts = {}) {
  const t = TYPES[typeId]; if (!t) return null;
  const e = {
    type: typeId,
    sprite: t.sprite,
    x, y,
    w: t.w, h: t.h,
    vx: 0, vy: 0,
    hp: opts.hp || t.hp, maxHp: opts.hp || t.hp,
    score: t.score,
    speed: t.speed,
    gravity: t.gravity,
    behavior: t.behavior,
    shootCd: t.shootCd,
    bulletSpeed: t.bulletSpeed,
    shootT: rand(0.3, t.shootCd),
    onGround: false,
    alive: true,
    hitFlash: 0,
    dir: opts.dir || -1,
    t: 0,
    drops: opts.drops !== false,
  };
  enemies.push(e);
  return e;
}

export function spawnPowerup(x, y, weaponId) {
  powerups.push({
    x, y, w: 12, h: 12, vx: 0, vy: 0, onGround: false,
    weapon: weaponId, bob: 0, alive: true, ttl: 16,
  });
}

export function damageEnemy(e, amount, angleFromHit = 0) {
  if (!e.alive) return;
  e.hp -= amount;
  e.hitFlash = 0.12;
  spawnBlood(e.x + e.w/2, e.y + e.h/2, 4, angleFromHit + Math.PI);
  sfx.hit();
  if (e.hp <= 0) killEnemy(e);
}

function killEnemy(e) {
  e.alive = false;
  spawnExplosion(e.x + e.w/2, e.y + e.h/2, 0.8);
  sfx.enemyDeath();
  player.score += e.score;
  spawnPopup(e.x + e.w/2, e.y - 4, e.score.toString(), '#ffd040');
  // chance to drop powerup
  if (e.drops && chance(0.08)) {
    const pool = ['S','F','H','L'];
    spawnPowerup(e.x + e.w/2 - 6, e.y, pool[randi(0, pool.length - 1)]);
  }
}

// AI --------------------------------------------------------------------
function walkerAI(e, dt) {
  // face player
  const dir = player.x < e.x ? -1 : 1;
  e.dir = dir;
  e.vx = e.speed * dir;
  // shoot when close enough and facing
  e.shootT -= dt;
  const dx = player.x + player.w/2 - e.x;
  const dy = player.y + player.h/2 - e.y;
  if (e.shootT <= 0 && Math.abs(dx) < 180 && Math.sign(dx) === dir) {
    e.shootT = e.shootCd;
    const a = Math.atan2(dy, dx);
    spawnEnemyBullet({
      x: e.x + e.w/2, y: e.y + e.h/2,
      vx: Math.cos(a) * e.bulletSpeed,
      vy: Math.sin(a) * e.bulletSpeed,
      damage: 1,
    });
  }
}

function jumperAI(e, dt) {
  e.t += dt;
  const dir = player.x < e.x ? -1 : 1;
  e.dir = dir;
  e.vx = e.speed * dir;
  // jump randomly
  if (e.onGround && e.t > 1.0 + rand(0, 0.8)) {
    e.vy = -280; e.onGround = false; e.t = 0;
  }
  e.shootT -= dt;
  if (e.shootT <= 0 && Math.abs(player.x - e.x) < 160) {
    e.shootT = e.shootCd;
    const a = Math.atan2(player.y - e.y, player.x - e.x);
    spawnEnemyBullet({ x: e.x + e.w/2, y: e.y + e.h/2, vx: Math.cos(a)*e.bulletSpeed, vy: Math.sin(a)*e.bulletSpeed, damage: 1 });
  }
}

function turretAI(e, dt) {
  e.shootT -= dt;
  const dx = player.x + player.w/2 - (e.x + e.w/2);
  const dy = player.y + player.h/2 - (e.y + e.h/2);
  if (e.shootT <= 0 && Math.abs(dx) < 220) {
    e.shootT = e.shootCd;
    const a = Math.atan2(dy, dx);
    spawnEnemyBullet({ x: e.x + e.w/2, y: e.y + e.h/2, vx: Math.cos(a)*e.bulletSpeed, vy: Math.sin(a)*e.bulletSpeed, damage: 1 });
  }
}

function rollerAI(e, dt) {
  // constantly rolls toward player (fast, weak)
  const dir = player.x < e.x ? -1 : 1;
  e.vx = e.speed * dir;
  e.dir = dir;
  e.t += dt * 6;
}

function flyerAI(e, dt) {
  e.t += dt;
  // sine wave flight toward player
  const dx = player.x - e.x;
  e.vx = Math.sign(dx) * e.speed;
  e.y = e.y + Math.sin(e.t * 4) * 0.8;
  e.shootT -= dt;
  if (e.shootT <= 0 && Math.abs(dx) < 200) {
    e.shootT = e.shootCd;
    const a = Math.atan2(player.y - e.y, player.x - e.x);
    spawnEnemyBullet({ x: e.x + e.w/2, y: e.y + e.h, vx: Math.cos(a)*e.bulletSpeed, vy: Math.sin(a)*e.bulletSpeed, damage: 1 });
  }
}

export function updateEnemies(dt) {
  for (const e of enemies) {
    if (!e.alive) continue;
    e.hitFlash = Math.max(0, e.hitFlash - dt);
    switch (e.behavior) {
      case 'walker': walkerAI(e, dt); break;
      case 'jumper': jumperAI(e, dt); break;
      case 'turret': turretAI(e, dt); break;
      case 'roller': rollerAI(e, dt); break;
      case 'flyer':  flyerAI(e, dt); break;
    }
    // physics
    if (e.gravity) {
      e.vy += GRAVITY * dt;
      if (e.vy > MAX_FALL) e.vy = MAX_FALL;
    }
    moveX(e, e.vx * dt);
    const vr = moveY(e, e.vy * dt);
    if (vr.onGround) { e.vy = 0; e.onGround = true; } else e.onGround = false;

    // contact damage
    if (e.alive && aabbOverlap(e, player)) {
      damagePlayer();
    }
  }
  // cleanup dead
  for (let i = enemies.length - 1; i >= 0; i--) {
    if (!enemies[i].alive) enemies.splice(i, 1);
  }

  // powerups
  for (let i = powerups.length - 1; i >= 0; i--) {
    const p = powerups[i];
    p.bob += dt;
    if (!p.onGround) {
      p.vy = (p.vy || 0) + GRAVITY * dt;
      moveX(p, 0);
      const vr = moveY(p, p.vy * dt);
      if (vr.onGround) { p.vy = 0; p.onGround = true; }
    }
    p.ttl -= dt;
    if (p.ttl <= 0) { powerups.splice(i, 1); continue; }
    // pickup
    if (aabbOverlap(p, player)) {
      pickupWeapon(p.weapon);
      powerups.splice(i, 1);
    }
  }
}

function aabbOverlap(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

export function checkPlayerEnemyContact() {
  for (const e of enemies) {
    if (!e.alive) continue;
    if (aabbOverlap(e, player)) damagePlayer();
  }
}

export function renderEnemies(ctx) {
  for (const e of enemies) {
    if (!e.alive) continue;
    const sx = Math.floor(e.x - camera.x + camera.shakeX);
    const sy = Math.floor(e.y - camera.y + camera.shakeY);
    drawSprite(ctx, e.sprite, sx - 1, sy, { flip: e.dir > 0 });
    if (e.hitFlash > 0) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.fillRect(sx, sy, e.w + 2, e.h);
    }
  }
  for (const p of powerups) {
    const sx = Math.floor(p.x - camera.x + camera.shakeX);
    const sy = Math.floor(p.y - camera.y + camera.shakeY + Math.sin(p.bob*4)*2);
    drawSprite(ctx, 'powerup_' + p.weapon, sx, sy);
    // flashing when near expiry
    if (p.ttl < 3 && Math.floor(p.ttl * 8) % 2) return;
  }
}

export function clearEnemies() { enemies.length = 0; powerups.length = 0; }

// bullet-enemy collision handled in game.js
export function handlePlayerBulletCollisions(bullets) {
  for (let i = bullets.length - 1; i >= 0; i--) {
    const b = bullets[i];
    for (const e of enemies) {
      if (!e.alive) continue;
      if (b.hits && b.hits.has(e)) continue;
      if (aabbOverlap(b, e)) {
        damageEnemy(e, b.damage, Math.atan2(b.vy, b.vx));
        if (b.hits) b.hits.add(e);
        if (b.pierce > 0) { b.pierce--; }
        else { bullets.splice(i, 1); break; }
      }
    }
  }
}

export function handleEnemyBulletCollisions(enemyBullets) {
  for (let i = enemyBullets.length - 1; i >= 0; i--) {
    const b = enemyBullets[i];
    if (aabbOverlap(b, player)) {
      damagePlayer();
      enemyBullets.splice(i, 1);
    }
  }
}

// bomb clears all on-screen enemies + bullets
export function bombClear() {
  for (const e of enemies) {
    if (!e.alive) continue;
    if (e.x > camera.x - 20 && e.x < camera.x + 420) {
      damageEnemy(e, 999);
    }
  }
}
