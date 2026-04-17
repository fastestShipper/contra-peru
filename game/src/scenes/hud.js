import { VIEW_W, VIEW_H, COLORS } from '../config.js';
import { player } from '../entities/player.js';
import { currentBoss } from '../entities/boss.js';
import { WEAPONS } from '../entities/weapons.js';

export function renderHUD(ctx, stageName) {
  // top bar
  ctx.fillStyle = 'rgba(0,0,0,0.82)';
  ctx.fillRect(0, 0, VIEW_W, 16);
  ctx.fillStyle = COLORS.uiBorder;
  ctx.fillRect(0, 16, VIEW_W, 1);

  // lives
  ctx.fillStyle = COLORS.lives; ctx.font = 'bold 9px Courier New';
  ctx.fillText(`VIDAS ${player.lives}`, 4, 11);

  // hp
  ctx.fillStyle = COLORS.hpBar; ctx.fillText(`HP`, 58, 11);
  for (let i = 0; i < player.maxHp; i++) {
    ctx.fillStyle = i < player.hp ? '#ff3a14' : '#3a1010';
    ctx.fillRect(72 + i * 7, 4, 5, 7);
    ctx.strokeStyle = '#0a0604'; ctx.strokeRect(72 + i * 7, 4, 5, 7);
  }

  // bombs
  ctx.fillStyle = '#ffd040';
  ctx.fillText(`BOMBAS ${player.bombs}`, 110, 11);

  // weapon
  const wId = player.weaponSlots[player.weaponIdx] || 'M';
  const w = WEAPONS[wId];
  if (w) {
    ctx.fillStyle = '#fff'; ctx.fillText(w.name, 180, 11);
  }
  // alt weapon hint
  const wAlt = player.weaponSlots[1 - player.weaponIdx];
  if (wAlt) {
    ctx.fillStyle = '#a89e92';
    ctx.fillText(`[V] ${WEAPONS[wAlt].name}`, 250, 11);
  }

  // score + stage
  ctx.fillStyle = COLORS.score;
  ctx.fillText(`${String(player.score).padStart(6, '0')}`, VIEW_W - 60, 11);
  ctx.fillStyle = '#a89e92';
  ctx.fillText(stageName, VIEW_W - 130, 11);

  // boss HP bar
  if (currentBoss && currentBoss.alive) {
    const bw = 200, bx = VIEW_W/2 - bw/2, by = VIEW_H - 22;
    ctx.fillStyle = 'rgba(0,0,0,0.82)'; ctx.fillRect(bx - 2, by - 2, bw + 4, 16);
    ctx.strokeStyle = '#c01a1a'; ctx.strokeRect(bx - 2, by - 2, bw + 4, 16);
    ctx.fillStyle = '#3a0606'; ctx.fillRect(bx, by + 4, bw, 6);
    ctx.fillStyle = '#ff3a14'; ctx.fillRect(bx, by + 4, bw * (currentBoss.hp / currentBoss.maxHp), 6);
    ctx.fillStyle = '#fff'; ctx.font = 'bold 8px Courier New'; ctx.textAlign = 'center';
    ctx.fillText(currentBoss.name, VIEW_W/2, by);
    ctx.textAlign = 'left';
  }
}

export function renderBanner(ctx, timer, title, subtitle = '') {
  if (timer <= 0) return;
  const alpha = timer < 1 ? timer : Math.min(1, (2.4 - timer) * 1.5);
  ctx.save();
  ctx.globalAlpha = Math.max(0, alpha);
  ctx.fillStyle = 'rgba(0,0,0,0.75)';
  ctx.fillRect(0, VIEW_H/2 - 30, VIEW_W, 60);
  ctx.fillStyle = '#ff3a14'; ctx.font = 'bold 24px Courier New'; ctx.textAlign = 'center';
  ctx.fillText(title, VIEW_W/2, VIEW_H/2);
  if (subtitle) {
    ctx.fillStyle = '#ffb347'; ctx.font = 'bold 9px Courier New';
    ctx.fillText(subtitle, VIEW_W/2, VIEW_H/2 + 14);
  }
  ctx.textAlign = 'left';
  ctx.restore();
}
