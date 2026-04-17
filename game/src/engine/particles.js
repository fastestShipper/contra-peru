import { rand } from './math.js';
import { camera } from './camera.js';

const pool = [];

export function spawnExplosion(x, y, scale = 1, color = '#ff7a1f') {
  for (let i = 0; i < 16 * scale; i++) {
    const a = rand(0, Math.PI*2);
    const sp = rand(120, 300) * scale;
    pool.push({ kind:'spark', x, y, vx: Math.cos(a)*sp, vy: Math.sin(a)*sp, life: rand(0.2, 0.5), ttl: rand(0.2, 0.5), size: 2, color: rand() < 0.5 ? color : '#ffd040' });
  }
  pool.push({ kind:'flash', x, y, vx:0, vy:0, life: 0.22, ttl: 0.22, size: 20 * scale, color: '#fff4d0' });
}

export function spawnBlood(x, y, n = 8, angle = 0) {
  for (let i = 0; i < n; i++) {
    const a = angle + rand(-0.8, 0.8);
    const sp = rand(60, 180);
    pool.push({ kind:'blood', x, y, vx: Math.cos(a)*sp, vy: Math.sin(a)*sp, life: rand(0.3, 0.6), ttl: rand(0.3, 0.6), size: 2, color: rand() < 0.5 ? '#c01a1a' : '#7a1414' });
  }
}

export function spawnCasing(x, y, dir = 1) {
  pool.push({ kind:'casing', x, y, vx: -dir * rand(30, 60), vy: -rand(80, 140), life: 0.9, ttl: 0.9, size: 1, color: '#ffd040' });
}

export function spawnPopup(x, y, text, color = '#ffffff') {
  pool.push({ kind:'popup', x, y, vx: 0, vy: -60, life: 0.9, ttl: 0.9, size: 0, color, text });
}

export function spawnSmoke(x, y) {
  for (let i = 0; i < 4; i++) {
    const a = rand(-Math.PI, 0);
    const sp = rand(20, 60);
    pool.push({ kind:'smoke', x, y, vx: Math.cos(a)*sp, vy: Math.sin(a)*sp - 40, life: 0.8, ttl: 0.8, size: 3, color: '#6a5a4a' });
  }
}

export function updateParticles(dt) {
  for (let i = pool.length - 1; i >= 0; i--) {
    const p = pool[i];
    p.life -= dt;
    if (p.life <= 0) { pool.splice(i, 1); continue; }
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    if (p.kind === 'blood' || p.kind === 'casing') p.vy += 420 * dt;
    else if (p.kind === 'spark') { p.vx *= 0.92; p.vy *= 0.92; }
    else if (p.kind === 'popup') p.vy += 40 * dt;
    else if (p.kind === 'smoke') p.vy *= 0.94;
  }
}

export function renderParticles(ctx) {
  for (const p of pool) {
    const a = Math.min(1, p.life / p.ttl);
    const sx = Math.floor(p.x - camera.x + camera.shakeX);
    const sy = Math.floor(p.y - camera.y + camera.shakeY);
    if (p.kind === 'flash') {
      ctx.globalAlpha = a;
      ctx.fillStyle = p.color;
      ctx.beginPath(); ctx.arc(sx, sy, p.size * a, 0, Math.PI*2); ctx.fill();
      ctx.globalAlpha = 1;
    } else if (p.kind === 'popup') {
      ctx.globalAlpha = a;
      ctx.fillStyle = '#000'; ctx.font = 'bold 8px Courier New'; ctx.textAlign = 'center';
      ctx.fillText(p.text, sx+1, sy+1);
      ctx.fillStyle = p.color;
      ctx.fillText(p.text, sx, sy);
      ctx.textAlign = 'left'; ctx.globalAlpha = 1;
    } else if (p.kind === 'smoke') {
      ctx.globalAlpha = a * 0.6;
      ctx.fillStyle = p.color;
      ctx.fillRect(sx - p.size, sy - p.size, p.size*2, p.size*2);
      ctx.globalAlpha = 1;
    } else {
      ctx.globalAlpha = a;
      ctx.fillStyle = p.color;
      ctx.fillRect(sx - p.size, sy - p.size, p.size*2, p.size*2);
      ctx.globalAlpha = 1;
    }
  }
}

export function clearParticles() { pool.length = 0; }
