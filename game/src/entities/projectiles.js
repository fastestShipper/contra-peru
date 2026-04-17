import { camera } from '../engine/camera.js';
import { drawSprite } from '../engine/sprites.js';
import { isSolidAt } from '../engine/tilemap.js';

export const bullets = [];
export const enemyBullets = [];

export function spawnPlayerBullet(opts) {
  bullets.push({
    x: opts.x, y: opts.y, w: 6, h: 4,
    vx: opts.vx, vy: opts.vy,
    damage: opts.damage || 10,
    sprite: opts.sprite || 'bullet_basic',
    ttl: opts.ttl || 0.6,
    pierce: opts.pierce || 0,
    homing: opts.homing || false,
    homingTarget: null,
    explode: opts.explode || 0,
    ignoreWalls: !!opts.ignoreWalls,
    owner: 'player',
    hits: new Set(),
  });
}

export function spawnEnemyBullet(opts) {
  enemyBullets.push({
    x: opts.x, y: opts.y, w: 5, h: 5,
    vx: opts.vx, vy: opts.vy,
    damage: opts.damage || 1,
    sprite: opts.sprite || 'bullet_homing',
    ttl: opts.ttl || 2.5,
    ignoreWalls: !!opts.ignoreWalls,
    owner: 'enemy',
  });
}

export function updateProjectiles(dt, worldW, worldH, enemies) {
  // player bullets
  for (let i = bullets.length - 1; i >= 0; i--) {
    const b = bullets[i];
    // homing: retarget
    if (b.homing) {
      if (!b.homingTarget || !b.homingTarget.alive) {
        let best = null, bestD = Infinity;
        for (const e of enemies) {
          if (!e.alive) continue;
          const d = Math.hypot(e.x - b.x, e.y - b.y);
          if (d < 180 && d < bestD) { bestD = d; best = e; }
        }
        b.homingTarget = best;
      }
      if (b.homingTarget) {
        const dx = b.homingTarget.x + b.homingTarget.w/2 - b.x;
        const dy = b.homingTarget.y + b.homingTarget.h/2 - b.y;
        const d = Math.hypot(dx, dy) || 1;
        const sp = 320;
        b.vx += (dx/d * sp - b.vx) * dt * 6;
        b.vy += (dy/d * sp - b.vy) * dt * 6;
      }
    }
    b.x += b.vx * dt;
    b.y += b.vy * dt;
    b.ttl -= dt;
    if (b.ttl <= 0 || b.x < camera.x - 80 || b.x > camera.x + 500 || b.y < -80 || b.y > worldH + 80) {
      bullets.splice(i, 1); continue;
    }
    if (!b.ignoreWalls && isSolidAt(b.x, b.y)) {
      bullets.splice(i, 1); continue;
    }
  }
  // enemy bullets
  for (let i = enemyBullets.length - 1; i >= 0; i--) {
    const b = enemyBullets[i];
    b.x += b.vx * dt;
    b.y += b.vy * dt;
    b.ttl -= dt;
    if (b.ttl <= 0 || b.x < camera.x - 80 || b.x > camera.x + 500 || b.y < -80 || b.y > worldH + 80) {
      enemyBullets.splice(i, 1); continue;
    }
    if (!b.ignoreWalls && isSolidAt(b.x, b.y)) {
      enemyBullets.splice(i, 1); continue;
    }
  }
}

export function renderProjectiles(ctx) {
  for (const b of bullets) {
    const sx = Math.floor(b.x - camera.x + camera.shakeX);
    const sy = Math.floor(b.y - camera.y + camera.shakeY);
    drawSprite(ctx, b.sprite, sx - 2, sy - 2);
  }
  for (const b of enemyBullets) {
    const sx = Math.floor(b.x - camera.x + camera.shakeX);
    const sy = Math.floor(b.y - camera.y + camera.shakeY);
    ctx.fillStyle = '#ff3a14';
    ctx.fillRect(sx - 2, sy - 2, 4, 4);
    ctx.fillStyle = '#ffd040';
    ctx.fillRect(sx - 1, sy - 1, 2, 2);
  }
}

export function clearProjectiles() { bullets.length = 0; enemyBullets.length = 0; }
