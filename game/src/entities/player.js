// Gregorio — Contra III mechanics, now with AI-generated sprites
import {
  GRAVITY, JUMP_VEL, JUMP_SHORT_VEL, MOVE_SPEED, MAX_FALL,
  PLAYER_W, PLAYER_H, CROUCH_H, VIEW_W, VIEW_H
} from '../config.js';
import { input } from '../engine/input.js';
import { moveX, moveY, isHazardAt, map } from '../engine/tilemap.js';
import { camera, addShake } from '../engine/camera.js';
import { drawSprite, getSprite } from '../engine/sprites.js';
import { sfx } from '../engine/audio.js';
import { spawnExplosion, spawnBlood, spawnCasing, spawnPopup } from '../engine/particles.js';
import { WEAPONS, WEAPON_ORDER } from './weapons.js';
import { clamp, normalize } from '../engine/math.js';

export const player = {
  x: 50, y: 100, w: PLAYER_W, h: PLAYER_H,
  vx: 0, vy: 0,
  facing: 1,
  onGround: false,
  crouching: false,
  aiming: { dx: 1, dy: 0 },
  hp: 3, maxHp: 3,
  invuln: 0, hitFlash: 0,
  alive: true,
  weaponSlots: ['M', null], weaponIdx: 0,
  fireTimer: 0,
  bombs: 3,
  walkTime: 0,
  muzzleTime: 0,
  muzzlePos: { x: 0, y: 0, angle: 0 },
  jumpHeld: 0, coyote: 0, jumpBuffer: 0,
  score: 0,
  lives: 3,
  respawnTimer: 0,
};

export function resetPlayer(x = 30, y = 100) {
  player.x = x; player.y = y;
  player.vx = 0; player.vy = 0;
  player.facing = 1;
  player.onGround = false;
  player.crouching = false;
  player.aiming = { dx: 1, dy: 0 };
  player.hp = 3; player.maxHp = 3;
  player.invuln = 1.2; player.hitFlash = 0;
  player.alive = true;
  player.weaponSlots = ['M', null];
  player.weaponIdx = 0;
  player.fireTimer = 0;
  player.bombs = 3;
  player.lives = 3;
  player.score = 0;
  player.respawnTimer = 0;
  player.w = PLAYER_W; player.h = PLAYER_H;
}

export function respawn() {
  player.x = camera.x + 40;
  player.y = camera.y + 40;
  player.vx = 0; player.vy = 0;
  player.hp = 3;
  player.alive = true;
  player.invuln = 1.8;
  player.crouching = false;
  player.weaponSlots = ['M', null];
  player.weaponIdx = 0;
  player.w = PLAYER_W; player.h = PLAYER_H;
  player.respawnTimer = 0;
}

function computeAim() {
  const dx = input.dx();
  const dy = input.dy();
  let ax = player.facing, ay = 0;
  if (dx !== 0 || dy !== 0) {
    ax = dx; ay = dy;
    if (ay > 0 && player.onGround && !player.crouching) ay = 0;
    if (ax === 0 && ay === 0) ax = player.facing;
  }
  if (player.crouching && ax !== 0) ay = 0;
  const [nx, ny] = normalize(ax, ay);
  player.aiming.dx = nx; player.aiming.dy = ny;
  if (dx !== 0) player.facing = dx > 0 ? 1 : -1;
}

function tryFire(dt) {
  player.fireTimer = Math.max(0, player.fireTimer - dt);
  if (!input.pressed('shoot')) return;
  const wId = player.weaponSlots[player.weaponIdx];
  if (!wId) return;
  const w = WEAPONS[wId];
  if (player.fireTimer > 0) return;
  player.fireTimer = w.fireRate;
  // muzzle from gun tip
  const ox = player.x + player.w/2 + player.aiming.dx * 14;
  const oy = player.y + (player.crouching ? 10 : 16) + player.aiming.dy * 8;
  w.shoot(ox, oy, player.aiming.dx, player.aiming.dy);
  player.muzzleTime = 0.06;
  player.muzzlePos = { x: ox, y: oy, angle: Math.atan2(player.aiming.dy, player.aiming.dx) };
  spawnCasing(player.x + player.w/2 + player.facing * 3, player.y + 14, player.facing);
}

function tryBomb() {
  if (!input.justPressed('bomb')) return;
  if (player.bombs <= 0) { sfx.empty(); return; }
  player.bombs--;
  spawnExplosion(player.x + player.w/2, player.y + player.h/2, 3, '#ffd040');
  addShake(12, 0.55);
  sfx.bomb();
  player._bombTrigger = true;
}

function trySwap() {
  if (!input.justPressed('swap')) return;
  if (!player.weaponSlots[1]) return;
  player.weaponIdx = 1 - player.weaponIdx;
  sfx.select();
}

export function pickupWeapon(id) {
  if (!player.weaponSlots[1]) {
    player.weaponSlots[1] = id;
    player.weaponIdx = 1;
  } else {
    player.weaponSlots[player.weaponIdx] = id;
  }
  sfx.powerup();
  spawnPopup(player.x + player.w/2, player.y - 4, WEAPONS[id].name, '#ffd040');
}

export function damagePlayer() {
  if (player.invuln > 0 || !player.alive) return;
  player.hp -= 1;
  player.invuln = 1.6;
  player.hitFlash = 0.4;
  addShake(8, 0.25);
  sfx.hit();
  spawnBlood(player.x + player.w/2, player.y + 10);
  if (player.hp <= 0) {
    player.alive = false;
    player.lives--;
    spawnExplosion(player.x + player.w/2, player.y + player.h/2, 1.5);
    sfx.die();
    player.respawnTimer = 1.5;
  } else {
    player.weaponSlots = ['M', null];
    player.weaponIdx = 0;
  }
}

export function updatePlayer(dt) {
  if (!player.alive) {
    player.respawnTimer = Math.max(0, player.respawnTimer - dt);
    return;
  }
  player.invuln = Math.max(0, player.invuln - dt);
  player.hitFlash = Math.max(0, player.hitFlash - dt);
  player.muzzleTime = Math.max(0, player.muzzleTime - dt);
  player.coyote = Math.max(0, player.coyote - dt);
  player.jumpBuffer = Math.max(0, player.jumpBuffer - dt);

  if (input.justPressed('jump')) player.jumpBuffer = 0.12;

  const wantCrouch = input.pressed('down') && player.onGround;
  if (wantCrouch && !player.crouching) {
    player.crouching = true;
    player.y += (PLAYER_H - CROUCH_H);
    player.h = CROUCH_H;
  } else if (!wantCrouch && player.crouching) {
    player.crouching = false;
    player.y -= (PLAYER_H - CROUCH_H);
    player.h = PLAYER_H;
  }

  const dx = input.dx();
  const canMove = !player.crouching;
  if (canMove && dx !== 0) {
    player.vx = dx * MOVE_SPEED;
    player.walkTime += dt;
  } else {
    player.vx = 0; player.walkTime = 0;
  }

  if (player.jumpBuffer > 0 && (player.onGround || player.coyote > 0)) {
    player.vy = JUMP_VEL;
    player.onGround = false;
    player.coyote = 0; player.jumpBuffer = 0;
    sfx.jump();
  }
  if (input.justReleased && input.justReleased('jump') && player.vy < JUMP_SHORT_VEL) {
    player.vy = JUMP_SHORT_VEL;
  }

  player.vy += GRAVITY * dt;
  if (player.vy > MAX_FALL) player.vy = MAX_FALL;

  moveX(player, player.vx * dt);
  const dropThrough = input.pressed('down') && input.justPressed('jump');
  const vRes = moveY(player, player.vy * dt, dropThrough);
  if (vRes.onGround) {
    if (!player.onGround && player.vy > 250) sfx.land();
    player.onGround = true; player.vy = 0; player.coyote = 0.08;
  } else { player.onGround = false; }
  if (vRes.hitCeiling && player.vy < 0) player.vy = 0;

  const minX = camera.x - 4;
  if (player.x < minX) player.x = minX;
  player.x = clamp(player.x, 2, map.widthPx - player.w - 2);
  if (player.y > map.heightPx + 60) damagePlayer();
  if (isHazardAt(player.x + player.w/2, player.y + player.h - 2)) damagePlayer();

  computeAim();
  tryFire(dt);
  tryBomb();
  trySwap();
}

function currentSpriteKey() {
  const airborne = !player.onGround;
  if (player.crouching) return 'greg-crouch';
  if (airborne) return 'greg-jump';
  if (input.pressed('shoot') || Math.abs(player.vx) > 4) {
    const frame = Math.floor(player.walkTime * 10) % 2;
    return frame ? 'greg-run-1' : 'greg-run-0';
  }
  return 'greg-idle';
}

export function renderPlayer(ctx) {
  if (!player.alive) return;
  const key = currentSpriteKey();
  const s = getSprite(key);
  if (!s) return;
  // invuln flicker
  if (player.invuln > 0 && Math.floor(player.invuln * 22) % 2 === 0) return;
  const flip = player.facing === -1;
  // draw anchor: bottom-center of sprite aligned to player bottom
  const baseX = Math.floor(player.x + player.w/2 - camera.x + camera.shakeX);
  const baseY = Math.floor(player.y + player.h - camera.y + camera.shakeY);
  ctx.save();
  ctx.imageSmoothingEnabled = false;
  if (flip) {
    ctx.translate(baseX + s.w/2, baseY - s.h);
    ctx.scale(-1, 1);
    ctx.drawImage(s.img, 0, 0);
  } else {
    ctx.drawImage(s.img, baseX - s.w/2, baseY - s.h);
  }
  // hit flash: red tint overlay
  if (player.hitFlash > 0) {
    ctx.globalCompositeOperation = 'source-atop';
    ctx.fillStyle = 'rgba(255,50,30,0.5)';
    const fx = flip ? 0 : baseX - s.w/2;
    const fy = flip ? -s.h : baseY - s.h;
    if (flip) ctx.fillRect(0, 0, s.w, s.h);
    else ctx.fillRect(fx, fy, s.w, s.h);
  }
  ctx.restore();

  // muzzle flash
  if (player.muzzleTime > 0) {
    const mx = Math.floor(player.muzzlePos.x - camera.x + camera.shakeX - 6);
    const my = Math.floor(player.muzzlePos.y - camera.y + camera.shakeY - 6);
    drawSprite(ctx, 'flash', mx, my);
  }
}
