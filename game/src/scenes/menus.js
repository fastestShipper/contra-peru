import { VIEW_W, VIEW_H } from '../config.js';

function pulse() { return 0.5 + 0.5 * Math.sin(performance.now() / 300); }

export function renderTitle(ctx, t) {
  // sky
  const grd = ctx.createLinearGradient(0, 0, 0, VIEW_H);
  grd.addColorStop(0, '#0a0200');
  grd.addColorStop(0.5, '#3a0a06');
  grd.addColorStop(1, '#8a2a10');
  ctx.fillStyle = grd; ctx.fillRect(0, 0, VIEW_W, VIEW_H);

  // silhouette skyline
  ctx.fillStyle = '#0a0604';
  for (let i = 0; i < 20; i++) {
    const x = i * 20;
    const h = 40 + ((i * 7) % 5) * 10;
    ctx.fillRect(x, VIEW_H - h, 18, h);
    // windows
    for (let wy = 0; wy < h; wy += 8) {
      for (let wx = 0; wx < 18; wx += 6) {
        if (((i + wy + wx) & 3) === 0) {
          ctx.fillStyle = '#ff7a1f'; ctx.fillRect(x + wx + 2, VIEW_H - h + wy + 2, 2, 2);
          ctx.fillStyle = '#0a0604';
        }
      }
    }
  }
  // explosion glow
  ctx.fillStyle = 'rgba(255, 60, 20, 0.3)';
  ctx.fillRect(0, VIEW_H - 80, VIEW_W, 80);

  // moving embers
  for (let i = 0; i < 30; i++) {
    const x = ((i * 37 + t * 20) % VIEW_W);
    const y = ((i * 53 + t * 40) % VIEW_H);
    ctx.fillStyle = i % 2 ? '#ffd040' : '#ff7a1f';
    ctx.fillRect(x, y, 1, 2);
  }

  // Title
  ctx.save();
  ctx.textAlign = 'center';
  // shadow
  ctx.fillStyle = '#3a0000';
  for (let i = 0; i < 4; i++) {
    ctx.font = 'bold 36px Courier New';
    ctx.fillText('CONTRA', VIEW_W/2 + i, 80 + i);
    ctx.fillText('PERÚ', VIEW_W/2 + i, 120 + i);
  }
  // main
  ctx.fillStyle = '#ff3a14';
  ctx.fillText('CONTRA', VIEW_W/2, 80);
  ctx.fillStyle = '#ffd040';
  ctx.fillText('PERÚ', VIEW_W/2, 120);

  ctx.font = 'bold 8px Courier New';
  ctx.fillStyle = '#ffb347';
  ctx.fillText('LIMA 2026 · ONPE BAJO FUEGO', VIEW_W/2, 140);

  ctx.globalAlpha = pulse();
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 10px Courier New';
  ctx.fillText('APRETA ENTER / SPACE PARA EMPEZAR', VIEW_W/2, VIEW_H - 50);
  ctx.globalAlpha = 1;

  ctx.font = 'bold 7px Courier New';
  ctx.fillStyle = '#a89e92';
  ctx.fillText('A/D mover · W arriba · S agacharse · SPACE saltar · X disparar · C bomba · V cambiar arma', VIEW_W/2, VIEW_H - 20);
  ctx.fillStyle = '#3a2418';
  ctx.fillText('v0.1 · zpw · Lima 2026', VIEW_W/2, VIEW_H - 8);
  ctx.restore();
}

export function renderGameOver(ctx, score) {
  ctx.fillStyle = 'rgba(0,0,0,0.92)';
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ff3a14'; ctx.font = 'bold 28px Courier New';
  ctx.fillText('GAME OVER', VIEW_W/2, VIEW_H/2 - 20);
  ctx.fillStyle = '#a89e92'; ctx.font = '10px Courier New';
  ctx.fillText('"Lima siguió pudriéndose..."', VIEW_W/2, VIEW_H/2);
  ctx.fillStyle = '#ffd040'; ctx.font = 'bold 12px Courier New';
  ctx.fillText(`SCORE  ${String(score).padStart(6,'0')}`, VIEW_W/2, VIEW_H/2 + 20);
  ctx.globalAlpha = pulse();
  ctx.fillStyle = '#fff'; ctx.font = 'bold 10px Courier New';
  ctx.fillText('[ENTER] REINTENTAR', VIEW_W/2, VIEW_H/2 + 50);
  ctx.globalAlpha = 1;
  ctx.textAlign = 'left';
}

export function renderVictory(ctx, score) {
  ctx.fillStyle = 'rgba(0,10,0,0.92)';
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#a0f04a'; ctx.font = 'bold 24px Courier New';
  ctx.fillText('STAGE CLEAR', VIEW_W/2, VIEW_H/2 - 20);
  ctx.fillStyle = '#a89e92'; ctx.font = '10px Courier New';
  ctx.fillText('¡Boss abatido! Lima centro liberado.', VIEW_W/2, VIEW_H/2);
  ctx.fillStyle = '#ffd040'; ctx.font = 'bold 12px Courier New';
  ctx.fillText(`SCORE  ${String(score).padStart(6,'0')}`, VIEW_W/2, VIEW_H/2 + 20);
  ctx.globalAlpha = pulse();
  ctx.fillStyle = '#fff'; ctx.font = 'bold 10px Courier New';
  ctx.fillText('[ENTER] OTRA VEZ', VIEW_W/2, VIEW_H/2 + 50);
  ctx.globalAlpha = 1;
  ctx.textAlign = 'left';
}

export function renderPause(ctx) {
  ctx.fillStyle = 'rgba(0,0,0,0.75)';
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ff3a14'; ctx.font = 'bold 24px Courier New';
  ctx.fillText('PAUSA', VIEW_W/2, VIEW_H/2 - 10);
  ctx.fillStyle = '#a89e92'; ctx.font = '9px Courier New';
  ctx.fillText('[ESC] continuar', VIEW_W/2, VIEW_H/2 + 15);
  ctx.textAlign = 'left';
}
