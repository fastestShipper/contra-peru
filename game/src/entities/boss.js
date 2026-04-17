// Boss 1 — COMBI BLINDADA (armored micro-bus tank, Contra III style)
// Multi-phase: rolls in, shoots in patterns, opens hatch to reveal driver
import { camera, addShake } from '../engine/camera.js';
import { drawSprite } from '../engine/sprites.js';
import { sfx } from '../engine/audio.js';
import { spawnExplosion, spawnBlood, spawnPopup } from '../engine/particles.js';
import { spawnEnemyBullet } from './projectiles.js';
import { player, damagePlayer } from './player.js';
import { rand, chance } from '../engine/math.js';

export let currentBoss = null;

export function spawnBoss(x, y) {
  currentBoss = {
    name: 'COMBI BLINDADA',
    title: 'El Patrón del Corralón',
    x, y, w: 80, h: 52,
    hp: 250, maxHp: 250,
    phase: 0,
    phaseHp: [250, 170, 90, 0],
    cooldown: 2.0,
    subCool: 0,
    alive: true,
    hitFlash: 0,
    vx: -40,
    mode: 'enter',
    t: 0,
    wheelRot: 0,
  };
  addShake(12, 0.45);
  sfx.bossIntro();
  return currentBoss;
}

export function damageBoss(amount, angle = 0, isCrit = false) {
  const b = currentBoss; if (!b || !b.alive) return;
  b.hp -= amount;
  b.hitFlash = 0.1;
  spawnBlood(b.x + b.w/2, b.y + 10, 2, angle + Math.PI);
  sfx.hit();
  const nextPhase = b.phaseHp.findIndex(h => b.hp > h);
  if (nextPhase === -1 || nextPhase > b.phase + 1) {
    b.phase = Math.max(b.phase, 0);
  } else if (b.hp <= b.phaseHp[b.phase + 1] && b.phase < 3) {
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
  for (let i = 0; i < 6; i++) {
    setTimeout(() => spawnExplosion(b.x + rand(0, b.w), b.y + rand(0, b.h), 1.8), i * 160);
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
  b.wheelRot += dt * 8;

  switch (b.mode) {
    case 'enter':
      // roll in from right until center of screen
      b.x += b.vx * dt;
      if (b.x < camera.x + 200) {
        b.vx = 0;
        b.mode = 'fight';
        b.cooldown = 1.2;
      }
      break;
    case 'fight':
      // oscillate back/forth slightly
      const cx = camera.x + 240;
      const target = cx + Math.sin(b.t * 0.8) * 70;
      b.vx = (target - b.x) * 1.6;
      b.x += b.vx * dt;
      // shoot pattern based on phase
      if (b.cooldown <= 0) {
        b.cooldown = Math.max(0.6, 1.6 - b.phase * 0.3);
        doAttackPattern(b);
      }
      // occasional bomb drop
      if (b.subCool <= 0 && b.phase >= 1) {
        b.subCool = 2.5 - b.phase * 0.3;
        dropBomb(b);
      }
      break;
  }

  // contact damage
  if (player.alive && overlaps(b, player)) {
    damagePlayer();
  }
}

function overlaps(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function doAttackPattern(b) {
  const cx = b.x + b.w/2, cy = b.y + 12;
  if (b.phase === 0) {
    // single aimed shot
    fireAt(cx, cy, player.x + player.w/2, player.y + 12, 180);
  } else if (b.phase === 1) {
    // 3-way spread
    const base = Math.atan2(player.y - cy, player.x - cx);
    for (let i = -1; i <= 1; i++) {
      fireAng(cx, cy, base + i * 0.28, 170);
    }
  } else if (b.phase === 2) {
    // 5-way wider spread
    const base = Math.atan2(player.y - cy, player.x - cx);
    for (let i = -2; i <= 2; i++) {
      fireAng(cx, cy, base + i * 0.24, 160);
    }
  } else if (b.phase >= 3) {
    // circular + aimed
    for (let i = 0; i < 12; i++) {
      fireAng(cx, cy, i * (Math.PI*2)/12, 140);
    }
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
  const sx = Math.floor(b.x - camera.x + camera.shakeX);
  const sy = Math.floor(b.y - camera.y + camera.shakeY);
  // Combi body (red with yellow stripe)
  ctx.fillStyle = '#080402'; ctx.fillRect(sx-2, sy-2, b.w+4, b.h+4);
  ctx.fillStyle = '#c01a1a'; ctx.fillRect(sx, sy, b.w, b.h - 10);
  ctx.fillStyle = '#ffd040'; ctx.fillRect(sx, sy + 18, b.w, 6);
  ctx.fillStyle = '#7a1010'; ctx.fillRect(sx, sy + b.h - 14, b.w, 4);
  // windshield
  ctx.fillStyle = '#5ac8ff'; ctx.fillRect(sx + 8, sy + 6, 24, 10);
  ctx.fillStyle = '#2a6a8a'; ctx.fillRect(sx + 8, sy + 14, 24, 2);
  // windows back
  for (let i = 0; i < 3; i++) {
    ctx.fillStyle = '#5ac8ff'; ctx.fillRect(sx + 40 + i * 12, sy + 6, 10, 10);
    ctx.fillStyle = '#2a6a8a'; ctx.fillRect(sx + 40 + i * 12, sy + 14, 10, 2);
  }
  // armor plates (gray)
  ctx.fillStyle = '#4a4a5a';
  ctx.fillRect(sx - 4, sy + 24, 4, 18);
  ctx.fillRect(sx + b.w, sy + 24, 4, 18);
  // bolts
  ctx.fillStyle = '#a0a0b0';
  for (let i = 0; i < 6; i++) { ctx.fillRect(sx + 4 + i * 14, sy + 28, 2, 2); }
  // gun turret on top
  ctx.fillStyle = '#2a2a34'; ctx.fillRect(sx + b.w/2 - 6, sy - 10, 12, 10);
  ctx.fillStyle = '#6a6a7a'; ctx.fillRect(sx + b.w/2 - 5, sy - 9, 10, 2);
  // barrel pointing at player
  const bx = sx + b.w/2, by = sy - 5;
  const ang = Math.atan2(player.y - b.y, player.x - b.x);
  ctx.save();
  ctx.translate(bx, by);
  ctx.rotate(ang);
  ctx.fillStyle = '#1a1a1a'; ctx.fillRect(0, -2, 16, 4);
  ctx.fillStyle = '#3a3a3a'; ctx.fillRect(14, -3, 4, 6);
  ctx.restore();
  // wheels
  const wheelY = sy + b.h - 4;
  for (const wx of [sx + 10, sx + b.w - 18]) {
    ctx.fillStyle = '#0a0a0a';
    ctx.beginPath(); ctx.arc(wx + 4, wheelY, 7, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#3a3a3a';
    ctx.beginPath(); ctx.arc(wx + 4, wheelY, 3, 0, Math.PI*2); ctx.fill();
    // rotating spokes
    ctx.strokeStyle = '#6a6a7a'; ctx.lineWidth = 1;
    for (let i = 0; i < 4; i++) {
      const a = b.wheelRot + i * Math.PI/2;
      ctx.beginPath();
      ctx.moveTo(wx + 4, wheelY);
      ctx.lineTo(wx + 4 + Math.cos(a)*6, wheelY + Math.sin(a)*6);
      ctx.stroke();
    }
  }
  // hit flash
  if (b.hitFlash > 0) {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.fillRect(sx, sy, b.w, b.h);
  }
}

export function clearBoss() { currentBoss = null; }
export function getBossHp() { return currentBoss ? { hp: currentBoss.hp, max: currentBoss.maxHp, name: currentBoss.name, alive: currentBoss.alive } : null; }

// bullet-boss collision
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
