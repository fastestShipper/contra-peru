// Boss 1 — COMBI BLINDADA (armored minibus tank)
import { camera, addShake } from '../engine/camera.js';
import { drawSprite, getSprite } from '../engine/sprites.js';
import { sfx } from '../engine/audio.js';
import { spawnExplosion, spawnBlood, spawnPopup } from '../engine/particles.js';
import { spawnEnemyBullet } from './projectiles.js';
import { player, damagePlayer } from './player.js';
import { rand } from '../engine/math.js';

export let currentBoss = null;

export function spawnBoss(x, y) {
  currentBoss = {
    name: 'COMBI BLINDADA',
    title: 'El Patrón del Corralón',
    x, y, w: 128, h: 72,
    hp: 280, maxHp: 280,
    phase: 0,
    phaseHp: [280, 190, 95, 0],
    cooldown: 2.0, subCool: 0,
    alive: true, hitFlash: 0,
    vx: -40, mode: 'enter', t: 0,
  };
  addShake(14, 0.5);
  sfx.bossIntro();
  return currentBoss;
}

export function damageBoss(amount, angle = 0) {
  const b = currentBoss; if (!b || !b.alive) return;
  b.hp -= amount;
  b.hitFlash = 0.1;
  spawnBlood(b.x + b.w/2, b.y + 10, 2, angle + Math.PI);
  sfx.hit();
  if (b.hp <= b.phaseHp[b.phase + 1] && b.phase < 3) {
    b.phase++;
    addShake(14, 0.4);
    spawnPopup(b.x + b.w/2, b.y - 10, 'FASE ' + (b.phase + 1), '#ff3a14');
    sfx.bossIntro();
  }
  if (b.hp <= 0) killBoss();
}

function killBoss() {
  const b = currentBoss; if (!b) return;
  b.alive = false;
  for (let i = 0; i < 8; i++) {
    setTimeout(() => spawnExplosion(b.x + rand(0, b.w), b.y + rand(0, b.h), 1.8), i * 150);
  }
  addShake(22, 1.2);
  player.score += 3000;
  spawnPopup(b.x + b.w/2, b.y - 20, '+3000', '#ffd040');
  sfx.bossIntro();
}

export function updateBoss(dt) {
  const b = currentBoss;
  if (!b || !b.alive) return;
  b.hitFlash = Math.max(0, b.hitFlash - dt);
  b.t += dt;
  b.cooldown = Math.max(0, b.cooldown - dt);
  b.subCool = Math.max(0, b.subCool - dt);

  const dx = player.x - b.x, dy = player.y - b.y;
  const d = Math.hypot(dx, dy);
  if (d < 40 && player.alive) damagePlayer();

  switch (b.mode) {
    case 'enter':
      b.x += b.vx * dt;
      if (b.x < camera.x + 220) { b.vx = 0; b.mode = 'fight'; b.cooldown = 1.0; }
      break;
    case 'fight':
      const cx = camera.x + 260;
      const target = cx + Math.sin(b.t * 0.8) * 70;
      b.vx = (target - b.x) * 1.4;
      b.x += b.vx * dt;
      if (b.cooldown <= 0) {
        b.cooldown = Math.max(0.55, 1.5 - b.phase * 0.25);
        doAttackPattern(b);
      }
      if (b.subCool <= 0 && b.phase >= 1) {
        b.subCool = 2.5 - b.phase * 0.3;
        dropBomb(b);
      }
      break;
  }
}

function doAttackPattern(b) {
  const cx = b.x + b.w/2, cy = b.y + 20;
  if (b.phase === 0) {
    fireAt(cx, cy, player.x + player.w/2, player.y + 12, 180);
  } else if (b.phase === 1) {
    const base = Math.atan2(player.y - cy, player.x - cx);
    for (let i = -1; i <= 1; i++) fireAng(cx, cy, base + i * 0.26, 170);
  } else if (b.phase === 2) {
    const base = Math.atan2(player.y - cy, player.x - cx);
    for (let i = -2; i <= 2; i++) fireAng(cx, cy, base + i * 0.22, 160);
  } else {
    for (let i = 0; i < 12; i++) fireAng(cx, cy, i * (Math.PI*2)/12, 140);
  }
  sfx.hit();
}

function dropBomb(b) {
  for (let i = 0; i < 3; i++) {
    const ang = -Math.PI/2 + rand(-0.5, 0.5);
    fireAng(b.x + rand(10, b.w - 10), b.y + 10, ang, 80);
  }
  sfx.explosion();
  addShake(5, 0.15);
}

function fireAt(x, y, tx, ty, sp) {
  const a = Math.atan2(ty - y, tx - x);
  spawnEnemyBullet({ x, y, vx: Math.cos(a)*sp, vy: Math.sin(a)*sp, damage: 1, ttl: 3 });
}
function fireAng(x, y, ang, sp) {
  spawnEnemyBullet({ x, y, vx: Math.cos(ang)*sp, vy: Math.sin(ang)*sp, damage: 1, ttl: 3 });
}

export function renderBoss(ctx) {
  const b = currentBoss; if (!b || !b.alive) return;
  const s = getSprite('boss-combi');
  const baseX = Math.floor(b.x + b.w/2 - camera.x + camera.shakeX);
  const baseY = Math.floor(b.y + b.h - camera.y + camera.shakeY);
  if (s) {
    ctx.save();
    ctx.imageSmoothingEnabled = false;
    // face left (toward player) - the source image faces right by default
    ctx.drawImage(s.img, baseX - s.w/2, baseY - s.h);
    if (b.hitFlash > 0) {
      ctx.globalCompositeOperation = 'source-atop';
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.fillRect(baseX - s.w/2, baseY - s.h, s.w, s.h);
    }
    ctx.restore();
  } else {
    // fallback primitive
    ctx.fillStyle = '#c01a1a';
    ctx.fillRect(baseX - b.w/2, baseY - b.h, b.w, b.h);
  }
}

export function clearBoss() { currentBoss = null; }

import { bullets } from './projectiles.js';
export function handleBossBulletCollisions() {
  const b = currentBoss; if (!b || !b.alive) return;
  for (let i = bullets.length - 1; i >= 0; i--) {
    const bb = bullets[i];
    if (!bb.hits) bb.hits = new Set();
    if (bb.hits.has(b)) continue;
    if (bb.x < b.x + b.w && bb.x + 4 > b.x && bb.y < b.y + b.h && bb.y + 4 > b.y) {
      damageBoss(bb.damage, Math.atan2(bb.vy, bb.vx));
      bb.hits.add(b);
      if (bb.pierce > 0) bb.pierce--;
      else bullets.splice(i, 1);
    }
  }
}
