// Contra Perú · entry + fixed-timestep loop
import { VIEW_W, VIEW_H, FIXED_DT } from './config.js';
import { initInput } from './engine/input.js';
import { loadAllSprites } from './engine/sprites.js';
import { setMuted, isMuted, unlockAudio } from './engine/audio.js';
import { game, STATES, updateGame, renderGame, goTitle } from './game.js';

const canvas = document.getElementById('view');
const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;

function resize() {
  const ww = window.innerWidth, wh = window.innerHeight;
  const scale = Math.max(1, Math.floor(Math.min(ww / VIEW_W, wh / VIEW_H)));
  canvas.style.width = (VIEW_W * scale) + 'px';
  canvas.style.height = (VIEW_H * scale) + 'px';
}
window.addEventListener('resize', resize);
resize();

initInput(canvas);

window.addEventListener('pointerdown', () => unlockAudio(), { once: true });
window.addEventListener('keydown', (e) => {
  if (e.key === 'm' || e.key === 'M') setMuted(!isMuted());
});

// boot: await sprite load, then start
loadAllSprites().then(() => {
  setTimeout(() => document.getElementById('boot').classList.add('hide'), 100);
  goTitle();

  let last = performance.now();
  let acc = 0;
  const MAX = 0.05;

  function loop(now) {
    let dt = (now - last) / 1000; last = now;
    if (dt > MAX) dt = MAX;
    acc += dt;
    while (acc >= FIXED_DT) {
      updateGame(FIXED_DT);
      acc -= FIXED_DT;
    }
    renderGame(ctx);
    if (isMuted()) {
      ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(VIEW_W - 40, 18, 36, 10);
      ctx.fillStyle = '#ff3a14'; ctx.font = 'bold 7px Courier New';
      ctx.fillText('MUTE', VIEW_W - 36, 26);
    }
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
});
